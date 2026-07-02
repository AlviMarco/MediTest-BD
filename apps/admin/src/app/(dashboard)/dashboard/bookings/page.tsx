'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

const STATUS_LABELS: any = {
  all: 'সব',
  pending: 'অপেক্ষায়',
  confirmed: 'নিশ্চিত',
  cancelled: 'বাতিল',
  completed: 'সম্পন্ন',
};

const statusColor: any = {
  pending: 'bg-yellow-100 text-yellow-600',
  confirmed: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-600',
  completed: 'bg-blue-100 text-blue-600',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingBooking, setEditingBooking] = useState<any | null>(null);
  const [form, setForm] = useState({
    status: '',
    booking_date: '',
    booking_time: '',
    notes: '',
    special_requirements: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (booking: any) => {
    setEditingBooking(booking);
    setForm({
      status: booking.status || 'pending',
      booking_date: booking.booking_date || '',
      booking_time: booking.booking_time || '',
      notes: booking.notes || '',
      special_requirements: booking.special_requirements || '',
    });
  };

  const closeEdit = () => {
    setEditingBooking(null);
    setForm({ status: '', booking_date: '', booking_time: '', notes: '', special_requirements: '' });
  };

  const handleSave = async () => {
    if (!form.booking_date) return alert('তারিখ দিন।');
    setSaving(true);
    try {
      await api.put(`/bookings/${editingBooking.id}`, form);
      closeEdit();
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Update failed!');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = bookings.filter((b) =>
    filter === 'all' ? true : b.status === filter
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📅 Bookings</h1>
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

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-1">✏️ Booking সম্পাদনা</h2>
            <p className="text-xs text-gray-400 mb-4">
              {editingBooking.booking_type === 'doctor' ? '👨‍⚕️ Doctor Booking' : '🔬 Test Booking'}
            </p>

            <div className="space-y-3">
              {/* Status */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">তারিখ *</label>
                <input
                  type="date"
                  value={form.booking_date}
                  onChange={(e) => setForm({ ...form, booking_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">সময়</label>
                <input
                  type="time"
                  value={form.booking_time}
                  onChange={(e) => setForm({ ...form, booking_time: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Notes</label>
                <textarea
                  placeholder="কোনো বিশেষ নোট..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Special Requirements */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Special Requirements</label>
                <textarea
                  placeholder="যেমন: হুইলচেয়ার দরকার, মহিলা ডাক্তার চাই..."
                  value={form.special_requirements}
                  onChange={(e) => setForm({ ...form, special_requirements: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'সংরক্ষণ হচ্ছে...' : 'আপডেট করুন'}
              </button>
              <button
                onClick={closeEdit}
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
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ধরন</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">তারিখ</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">সময়</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Notes</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {booking.booking_type === 'doctor' ? '👨‍⚕️ Doctor' : '🔬 Test'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {booking.booking_date}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {booking.booking_time || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 max-w-[160px] truncate">
                    {booking.notes || booking.special_requirements || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[booking.status]}`}>
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {/* Quick confirm/cancel for pending */}
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(booking.id, 'confirmed')}
                            className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200"
                          >
                            ✓ Confirm
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, 'cancelled')}
                            className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                          >
                            ✗ Cancel
                          </button>
                        </>
                      )}
                      {/* Edit always available */}
                      <button
                        onClick={() => openEdit(booking)}
                        className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              কোনো booking পাওয়া যায়নি
            </div>
          )}
        </div>
      )}
    </div>
  );
}