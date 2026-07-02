'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

const TYPE_LABELS: any = {
  percentage: 'শতাংশ ছাড়',
  fixed_amount: 'নির্দিষ্ট টাকা ছাড়',
  free_delivery: 'ফ্রি ডেলিভারি',
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    max_discount: '',
    min_order_amount: '',
    usage_limit: '',
    per_user_limit: '1',
    expires_at: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await api.get('/coupons');
      setCoupons(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setIsNew(true);
    setEditingCoupon({});
    setForm({
      code: '',
      type: 'percentage',
      value: '',
      max_discount: '',
      min_order_amount: '',
      usage_limit: '',
      per_user_limit: '1',
      expires_at: '',
      is_active: true,
    });
  };

  const openEdit = (coupon: any) => {
    setIsNew(false);
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || '',
      type: coupon.type || 'percentage',
      value: String(coupon.value ?? ''),
      max_discount: String(coupon.max_discount ?? ''),
      min_order_amount: String(coupon.min_order_amount ?? ''),
      usage_limit: String(coupon.usage_limit ?? ''),
      per_user_limit: String(coupon.per_user_limit ?? '1'),
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      is_active: coupon.is_active,
    });
  };

  const closeModal = () => {
    setEditingCoupon(null);
  };

  const handleSave = async () => {
    if (!form.code.trim()) return alert('কুপন কোড দিন।');
    if (form.type !== 'free_delivery' && !form.value) {
      return alert('Discount value দিন।');
    }

    setSaving(true);
    try {
      const payload: any = {
        code: form.code.trim(),
        type: form.type,
        value: form.value ? parseFloat(form.value) : 0,
        max_discount: form.max_discount ? parseFloat(form.max_discount) : 0,
        min_order_amount: form.min_order_amount
          ? parseFloat(form.min_order_amount)
          : 0,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : 0,
        per_user_limit: form.per_user_limit
          ? parseInt(form.per_user_limit)
          : 1,
      };
      if (form.expires_at) payload.expires_at = form.expires_at;
      if (!isNew) payload.is_active = form.is_active;

      if (isNew) {
        await api.post('/coupons', payload);
      } else {
        await api.put(`/coupons/${editingCoupon.id}`, payload);
      }
      closeModal();
      fetchCoupons();
    } catch (error: any) {
      alert(error.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই কুপনটি মুছে ফেলতে চান?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleActive = async (coupon: any) => {
    try {
      await api.put(`/coupons/${coupon.id}`, {
        is_active: !coupon.is_active,
      });
      fetchCoupons();
    } catch (error) {
      console.error(error);
    }
  };

  const isExpired = (coupon: any) =>
    coupon.expires_at && new Date(coupon.expires_at) < new Date();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🎟️ Coupons</h1>
        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + নতুন Coupon
        </button>
      </div>

      {/* Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {isNew ? '➕ নতুন Coupon' : '✏️ Coupon সম্পাদনা'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">কুপন কোড *</label>
                <input
                  type="text"
                  placeholder="যেমন: EID50"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Discount ধরন *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">শতাংশ ছাড় (%)</option>
                  <option value="fixed_amount">নির্দিষ্ট টাকা ছাড়</option>
                  <option value="free_delivery">ফ্রি ডেলিভারি</option>
                </select>
              </div>

              {form.type !== 'free_delivery' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {form.type === 'percentage' ? 'কত শতাংশ ছাড় (%) *' : 'কত টাকা ছাড় (৳) *'}
                  </label>
                  <input
                    type="number"
                    placeholder={form.type === 'percentage' ? '১০' : '৫০'}
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {form.type === 'percentage' && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    সর্বোচ্চ ছাড় (৳) — ০ মানে কোনো সীমা নেই
                  </label>
                  <input
                    type="number"
                    placeholder="১০০"
                    value={form.max_discount}
                    onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  সর্বনিম্ন অর্ডার (৳) — ০ মানে কোনো শর্ত নেই
                </label>
                <input
                  type="number"
                  placeholder="৫০০"
                  value={form.min_order_amount}
                  onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    মোট ব্যবহার সীমা (০ = unlimited)
                  </label>
                  <input
                    type="number"
                    placeholder="১০০"
                    value={form.usage_limit}
                    onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    প্রতি ইউজার সীমা
                  </label>
                  <input
                    type="number"
                    placeholder="১"
                    value={form.per_user_limit}
                    onChange={(e) => setForm({ ...form, per_user_limit: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">মেয়াদ শেষ (ঐচ্ছিক)</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!isNew && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    id="coupon_active"
                  />
                  <label htmlFor="coupon_active" className="text-sm text-gray-600">
                    সক্রিয়
                  </label>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
              <button
                onClick={closeModal}
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
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">কোড</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ধরন</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ব্যবহার</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">মেয়াদ</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono font-medium text-gray-800">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {TYPE_LABELS[coupon.type]}
                    {coupon.type !== 'free_delivery' && (
                      <span className="text-gray-400">
                        {' '}
                        ({coupon.type === 'percentage' ? `${coupon.value}%` : `৳${coupon.value}`})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {coupon.used_count} / {coupon.usage_limit > 0 ? coupon.usage_limit : '∞'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {coupon.expires_at
                      ? new Date(coupon.expires_at).toLocaleDateString('bn-BD')
                      : '—'}
                    {isExpired(coupon) && (
                      <span className="text-red-500 text-xs ml-1">(মেয়াদ শেষ)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(coupon)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        coupon.is_active
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {coupon.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(coupon)}
                        className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {coupons.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              কোনো কুপন যুক্ত করা হয়নি
            </div>
          )}
        </div>
      )}
    </div>
  );
}