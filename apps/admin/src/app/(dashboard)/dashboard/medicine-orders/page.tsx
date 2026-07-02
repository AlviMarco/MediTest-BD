'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { notoSansBengaliBase64 } from '@/lib/notoSansBengaliFont';

const STATUSES = ['pending', 'confirmed', 'delivered', 'cancelled'];

const STATUS_LABELS_EN: any = {
  all: 'All',
  pending: 'Pending',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_LABELS: any = {
  all: 'সব',
  pending: 'অপেক্ষায়',
  confirmed: 'নিশ্চিত',
  delivered: 'ডেলিভারি হয়েছে',
  cancelled: 'বাতিল',
};

const statusColor: any = {
  pending: 'bg-yellow-100 text-yellow-600',
  confirmed: 'bg-green-100 text-green-600',
  delivered: 'bg-blue-100 text-blue-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function MedicineOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportStatus, setReportStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/medicine-orders');
      setOrders(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/medicine-orders/${id}/status`, { status });
      fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Update failed!');
    }
  };

  const openCancel = (order: any) => {
    setCancellingOrder(order);
    setCancelReason('');
  };

  const closeCancel = () => {
    setCancellingOrder(null);
    setCancelReason('');
  };

  const handleCancel = async () => {
    setSaving(true);
    try {
      await api.put(`/medicine-orders/${cancellingOrder.id}/cancel`, {
        cancellation_reason: cancelReason,
      });
      closeCancel();
      fetchOrders();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Cancel failed!');
    } finally {
      setSaving(false);
    }
  };

  const filtered = orders.filter((o) =>
    filter === 'all' ? true : o.status === filter
  );
  const handleGenerateReport = () => {
    if (!reportStartDate || !reportEndDate) {
      alert('Start এবং End date দিন।');
      return;
    }

    const start = new Date(reportStartDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(reportEndDate);
    end.setHours(23, 59, 59, 999);

    const reportOrders = orders.filter((o) => {
      const orderDate = new Date(o.created_at);
      const inRange = orderDate >= start && orderDate <= end;
      const matchesStatus = reportStatus === 'all' || o.status === reportStatus;
      return inRange && matchesStatus;
    });

    if (reportOrders.length === 0) {
      alert('এই তারিখ ও স্ট্যাটাসে কোনো অর্ডার পাওয়া যায়নি।');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.addFileToVFS('NotoSansBengali-Regular.ttf', notoSansBengaliBase64);
    doc.addFont('NotoSansBengali-Regular.ttf', 'NotoSansBengali', 'normal');
    doc.setFont('NotoSansBengali');

    doc.setFontSize(16);
    doc.text('MediTest BD - Medicine Orders Report', 14, 15);

    doc.setFontSize(10);
    doc.text(`Date Range: ${reportStartDate} to ${reportEndDate}`, 14, 22);
    doc.text(`Status Filter: ${STATUS_LABELS[reportStatus] || 'All'}`, 14, 27);
    doc.text(`Total Orders: ${reportOrders.length}`, 14, 32);

    const totalAmount = reportOrders.reduce(
      (sum, o) => sum + Number(o.total_amount || 0),
      0,
    );
    const totalDelivery = reportOrders.reduce(
      (sum, o) => sum + Number(o.delivery_charge || 0),
      0,
    );
    doc.text(`Total Amount: TK ${totalAmount.toFixed(2)}  (Delivery: TK ${totalDelivery.toFixed(2)})`, 14, 37);

    const tableData = reportOrders.map((o) => [
      o.order_number || o.id.slice(0, 8),
      new Date(o.created_at).toLocaleDateString('en-GB'),
      o.delivery_phone,
      o.items?.length || 0,
      `TK ${Number(o.subtotal || 0).toFixed(2)}`,
      `TK ${Number(o.delivery_charge || 0).toFixed(2)}`,
      `TK ${Number(o.total_amount).toFixed(2)}`,
      STATUS_LABELS[o.status] || o.status,
      o.delivery_address || '-',
    ]);

    autoTable(doc, {
      startY: 43,
      head: [['Order No', 'Date', 'Phone', 'Items', 'Subtotal', 'Delivery', 'Total', 'Status', 'Address']],
      body: tableData,
      styles: { fontSize: 8, font: 'NotoSansBengali' },
      headStyles: { font: 'NotoSansBengali' },
      columnStyles: {
        8: { cellWidth: 55 },
      },
    });

    // Footer: page number + generated by, প্রতিটা page এ
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(8);
      doc.setTextColor(120);

      doc.text(
        `Report generated by MediTest BD Admin Panel on ${new Date().toLocaleString('en-GB')}`,
        14,
        pageHeight - 10,
      );

      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 30,
        pageHeight - 10,
      );
    }

    doc.save(`medicine-orders-report-${reportStartDate}-to-${reportEndDate}.pdf`);
    setShowReportModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">💊 Medicine Orders</h1>
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
        >
          📄 PDF Report
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', ...STATUSES].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* View Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-1">📦 Order Details</h2>
            <p className="text-xs text-gray-400 mb-4">
              Order No: {viewingOrder.order_number || viewingOrder.id}
            </p>

            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Delivery Address: </span>
                <span className="text-gray-800">{viewingOrder.delivery_address}</span>
              </div>
              <div>
                <span className="text-gray-500">Phone: </span>
                <span className="text-gray-800">{viewingOrder.delivery_phone}</span>
              </div>
              {viewingOrder.notes && (
                <div>
                  <span className="text-gray-500">Notes: </span>
                  <span className="text-gray-800">{viewingOrder.notes}</span>
                </div>
              )}
              {viewingOrder.cancellation_reason && (
                <div>
                  <span className="text-gray-500">Cancellation Reason: </span>
                  <span className="text-red-600">{viewingOrder.cancellation_reason}</span>
                </div>
              )}

              <div className="border-t pt-3">
                <p className="text-gray-500 mb-2">Items:</p>
                <div className="space-y-2">
                  {viewingOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-gray-800 font-medium">
                          {item.medicine?.brand_name || 'Unknown Medicine'}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-xs text-gray-400">Unit Price: ৳{item.unit_price}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">৳{item.subtotal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span>৳{viewingOrder.total_amount}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingOrder(null)}
              className="w-full mt-5 border text-gray-600 py-2 rounded-lg hover:bg-gray-50"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-1">✗ Order বাতিল করুন</h2>
            <p className="text-xs text-gray-400 mb-4">
              এই অর্ডারটি বাতিল করার কারণ লিখুন (ঐচ্ছিক)
            </p>

            <textarea
              placeholder="বাতিলের কারণ..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'বাতিল হচ্ছে...' : 'বাতিল নিশ্চিত করুন'}
              </button>
              <button
                onClick={closeCancel}
                className="flex-1 border text-gray-600 py-2 rounded-lg hover:bg-gray-50"
              >
                ফিরে যান
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-1">📄 PDF Report তৈরি করুন</h2>
            <p className="text-xs text-gray-400 mb-4">
              তারিখ এবং status সিলেক্ট করে রিপোর্ট ডাউনলোড করুন
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">শুরুর তারিখ *</label>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">শেষের তারিখ *</label>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['all', ...STATUSES].map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleGenerateReport}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                ডাউনলোড করুন
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 border text-gray-600 py-2 rounded-lg hover:bg-gray-50"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">লোড হচ্ছে...</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Order No</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">তারিখ</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ঠিকানা</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ফোন</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">আইটেম</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">মোট</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  
                  <td className="px-4 py-3 text-sm font-mono font-medium text-gray-700">
                    {order.order_number || '—'}
                  </td>
                  
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-[160px] truncate">
                    {order.delivery_address}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.delivery_phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.items?.length || 0} টি
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    ৳{order.total_amount}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(order.id, 'confirmed')}
                            className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200"
                          >
                            ✓ Confirm
                          </button>
                          <button
                            onClick={() => openCancel(order)}
                            className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                          >
                            ✗ Cancel
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => updateStatus(order.id, 'delivered')}
                          className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          🚚 Delivered
                        </button>
                      )}
                      <button
                        onClick={() => setViewingOrder(order)}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                      >
                        👁️ Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              কোনো order পাওয়া যায়নি
            </div>
          )}
        </div>
      )}
    </div>
  );
}