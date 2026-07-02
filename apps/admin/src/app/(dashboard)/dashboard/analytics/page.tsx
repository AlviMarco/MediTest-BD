'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { FinanceBarChart } from '@/component/Charts';

const fmt = (n: number) => '৳' + Number(n || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 });

export default function AnalyticsPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState('all');
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any>(null);
  const [opening, setOpening] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [paymentForm, setPaymentForm] = useState({
    booking_id: '',
    hospital_id: '',
    test_price: '',
    discount_percent: '',
    advance_collected: '',
    commission_percent: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    api.get('/hospitals').then((r) => setHospitals(r.data)).catch(console.error);
    api.get('/hospital-commissions').then((r) => setCommissions(r.data)).catch(console.error);
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [analyticsRes, openingRes] = await Promise.all([
        api.get('/booking-payments/analytics', {
          params: { hospital_id: selectedHospital, from, to },
        }),
        selectedHospital !== 'all'
          ? api.get('/opening-balances/find', {
              params: { hospital_id: selectedHospital, period_start: from },
            }).catch(() => ({ data: null }))
          : Promise.resolve({ data: null }),
      ]);
      setData(analyticsRes.data);
      setOpening(openingRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalChange = (id: string) => {
    setSelectedHospital(id);
    const comm = commissions.find((c) => c.hospital_id === id);
    setPaymentForm((f) => ({ ...f, hospital_id: id, commission_percent: comm?.commission_percent?.toString() || '' }));
  };

  const handlePaymentFormChange = (field: string, value: string) => {
    setPaymentForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitPayment = async () => {
    if (!paymentForm.booking_id || !paymentForm.hospital_id || !paymentForm.test_price) {
      return alert('Booking ID, Hospital এবং Test Price দিন।');
    }
    try {
      await api.post('/booking-payments', {
        ...paymentForm,
        test_price: parseFloat(paymentForm.test_price),
        discount_percent: parseFloat(paymentForm.discount_percent) || 0,
        advance_collected: parseFloat(paymentForm.advance_collected) || 0,
        commission_percent: parseFloat(paymentForm.commission_percent) || 0,
      });
      setShowPaymentForm(false);
      setPaymentForm({
        booking_id: '',
        hospital_id: '',
        test_price: '',
        discount_percent: '',
        advance_collected: '',
        commission_percent: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
      });
      fetchAnalytics();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error!');
    }
  };

  const deletePayment = async (id: string) => {
    if (!confirm('এই record মুছে ফেলবেন?')) return;
    await api.delete(`/booking-payments/${id}`);
    fetchAnalytics();
  };

  const summary = data?.summary;
  const openingReceivable = Number(opening?.receivable || 0);
  const openingPayable = Number(opening?.payable || 0);
  const closingHospitalPayable = Number(summary?.total_hospital_payable || 0) + openingReceivable - openingPayable;
  const financeChartItems = summary
    ? [
        { label: 'Test price', value: Number(summary.total_test_price || 0), color: '#2563eb' },
        { label: 'Discount', value: Number(summary.total_discount || 0), color: '#dc2626' },
        { label: 'Collected', value: Number(summary.total_collected || 0), color: '#0891b2' },
        { label: 'Advance', value: Number(summary.total_advance || 0), color: '#7c3aed' },
        { label: 'Commission', value: Number(summary.total_commission || 0), color: '#0f766e' },
        { label: 'Net profit', value: Number(summary.total_net_profit || 0), color: '#16a34a' },
      ]
    : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Analytics</h1>
        <button
          onClick={() => setShowPaymentForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + Payment Record করুন
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs text-gray-500 mb-1">Hospital</label>
          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">সব Hospital</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">শুরু</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">শেষ</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'লোড হচ্ছে...' : '🔍 দেখুন'}
        </button>
      </div>

      {/* Add Payment Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">💳 Payment Record করুন</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Booking ID *</label>
                <input type="text" placeholder="Booking UUID"
                  value={paymentForm.booking_id}
                  onChange={(e) => handlePaymentFormChange('booking_id', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hospital *</label>
                <select value={paymentForm.hospital_id}
                  onChange={(e) => handleHospitalChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Hospital বেছে নিন --</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Test মূল্য (৳) *</label>
                  <input type="number" placeholder="1000"
                    value={paymentForm.test_price}
                    onChange={(e) => handlePaymentFormChange('test_price', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Discount % (আপনি দিলেন)</label>
                  <input type="number" placeholder="20"
                    value={paymentForm.discount_percent}
                    onChange={(e) => handlePaymentFormChange('discount_percent', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Commission % (hospital দেয়)</label>
                  <input type="number" placeholder="30"
                    value={paymentForm.commission_percent}
                    onChange={(e) => handlePaymentFormChange('commission_percent', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Advance নিয়েছেন (৳)</label>
                  <input type="number" placeholder="500"
                    value={paymentForm.advance_collected}
                    onChange={(e) => handlePaymentFormChange('advance_collected', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Live preview */}
              {paymentForm.test_price && (
                <div className="bg-blue-50 rounded-lg p-3 text-xs space-y-1">
                  {(() => {
                    const price = parseFloat(paymentForm.test_price) || 0;
                    const disc = parseFloat(paymentForm.discount_percent) || 0;
                    const comm = parseFloat(paymentForm.commission_percent) || 0;
                    const adv = parseFloat(paymentForm.advance_collected) || 0;
                    const discAmt = (price * disc) / 100;
                    const discPrice = price - discAmt;
                    const commAmt = (price * comm) / 100;
                    const netProfit = commAmt - discAmt;
                    const hospitalPayable = discPrice - netProfit;
                    const balanceDue = hospitalPayable - adv;
                    return (
                      <>
                        <p>মূল দাম: <b>{fmt(price)}</b></p>
                        <p>Discount ({disc}%): <b className="text-red-500">-{fmt(discAmt)}</b></p>
                        <p>User দেবে: <b>{fmt(discPrice)}</b></p>
                        <p>Commission ({comm}%): <b className="text-green-600">+{fmt(commAmt)}</b></p>
                        <p>আপনার নেট লাভ: <b className="text-green-700">{fmt(netProfit)}</b></p>
                        <p>Hospital পাবে: <b>{fmt(hospitalPayable)}</b></p>
                        <p>Advance দিয়েছেন: <b>{fmt(adv)}</b></p>
                        <p className="border-t pt-1 font-bold">Hospital এর কাছে বাকি: <b className={balanceDue >= 0 ? 'text-orange-600' : 'text-green-600'}>{fmt(balanceDue)}</b></p>
                      </>
                    );
                  })()}
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-500 mb-1">তারিখ</label>
                <input type="date" value={paymentForm.payment_date}
                  onChange={(e) => handlePaymentFormChange('payment_date', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <input type="text" placeholder="কোনো বিশেষ নোট..."
                  value={paymentForm.notes}
                  onChange={(e) => handlePaymentFormChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={submitPayment}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                সংরক্ষণ করুন
              </button>
              <button onClick={() => setShowPaymentForm(false)}
                className="flex-1 border text-gray-600 py-2 rounded-lg hover:bg-gray-50">
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Results */}
      {data && (
        <>
          {opening && selectedHospital !== 'all' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-yellow-800 mb-2">📂 Opening Balance ({from})</h3>
              <div className="flex gap-6 text-sm">
                <span>পূর্বের Receivable (hospital পাবে): <b className="text-red-600">{fmt(openingReceivable)}</b></span>
                <span>পূর্বের Payable (আমরা পাব): <b className="text-green-600">{fmt(openingPayable)}</b></span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'মোট Test মূল্য', value: fmt(summary.total_test_price), color: 'bg-gray-50' },
              { label: 'মোট Discount দিয়েছেন', value: fmt(summary.total_discount), color: 'bg-red-50' },
              { label: 'User এর কাছ থেকে পাওয়া', value: fmt(summary.total_collected), color: 'bg-blue-50' },
              { label: 'Advance নিয়েছেন', value: fmt(summary.total_advance), color: 'bg-purple-50' },
              { label: 'মোট Commission', value: fmt(summary.total_commission), color: 'bg-green-50' },
              { label: 'আপনার নেট লাভ', value: fmt(summary.total_net_profit), color: 'bg-emerald-50' },
              { label: 'Hospital পাবে (এই period)', value: fmt(summary.total_hospital_payable), color: 'bg-orange-50' },
              { label: 'Hospital এর কাছে এখন বাকি', value: fmt(closingHospitalPayable), color: 'bg-red-100' },
            ].map((card) => (
              <div key={card.label} className={`${card.color} rounded-xl border p-4`}>
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className="text-lg font-bold text-gray-800">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="modern-only mb-6">
            <FinanceBarChart items={financeChartItems} />
          </div>

          <div className="bg-white rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">তারিখ</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">মূল দাম</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Discount</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">User দিয়েছে</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Commission</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">নেট লাভ</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Hospital পাবে</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Advance</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">বাকি</th>
                  <th className="text-left px-3 py-3 font-medium text-gray-600">Notes</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p: any) => {
                  const balanceDue = Number(p.hospital_payable) - Number(p.advance_collected);
                  return (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{p.payment_date}</td>
                      <td className="px-3 py-2">{fmt(p.test_price)}</td>
                      <td className="px-3 py-2 text-red-500">-{fmt(p.discount_amount)} <span className="text-gray-400">({p.discount_percent}%)</span></td>
                      <td className="px-3 py-2 font-medium">{fmt(p.discounted_price)}</td>
                      <td className="px-3 py-2 text-green-600">{fmt(p.commission_amount)} <span className="text-gray-400">({p.commission_percent}%)</span></td>
                      <td className="px-3 py-2 font-bold text-emerald-600">{fmt(p.net_profit)}</td>
                      <td className="px-3 py-2 text-orange-600">{fmt(p.hospital_payable)}</td>
                      <td className="px-3 py-2 text-purple-600">{fmt(p.advance_collected)}</td>
                      <td className={`px-3 py-2 font-semibold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {fmt(balanceDue)}
                      </td>
                      <td className="px-3 py-2 text-gray-400 text-xs">{p.notes || '-'}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => deletePayment(p.id)}
                          className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {data.payments.length === 0 && (
              <div className="text-center text-gray-500 py-10">এই সময়ে কোনো record নেই</div>
            )}
          </div>
        </>
      )}

      {!data && !loading && (
        <div className="text-center text-gray-400 py-20">
          উপরে hospital ও date range বেছে "দেখুন" চাপুন
        </div>
      )}
    </div>
  );
}
