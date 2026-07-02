'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function TestPricesPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [form, setForm] = useState({
    hospital_id: '',
    test_id: '',
    price: '',
    report_delivery_time: '',
    is_available: true,
    discount_percent: '',
    discounted_price: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [h, t] = await Promise.all([
        api.get('/hospitals'),
        api.get('/diagnostic-tests'),
      ]);
      setHospitals(h.data);
      setTests(t.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrices = async (hospitalId: string) => {
    try {
      const response = await api.get(`/hospital-test-prices/hospital/${hospitalId}`);
      setPrices(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleHospitalChange = (id: string) => {
    setSelectedHospital(id);
    fetchPrices(id);
  };

  // Auto-calculate discounted_price when price or discount_percent changes in form
  const handleFormChange = (field: string, value: string | boolean) => {
    const updated = { ...form, [field]: value };

    if (field === 'price' || field === 'discount_percent') {
      const price = parseFloat(field === 'price' ? (value as string) : updated.price) || 0;
      const pct = parseFloat(field === 'discount_percent' ? (value as string) : updated.discount_percent) || 0;
      if (price > 0 && pct > 0) {
        updated.discounted_price = Math.round(price - (price * pct) / 100).toString();
      } else {
        updated.discounted_price = '';
      }
    }

    setForm(updated);
  };

  const handleSubmit = async () => {
    try {
      await api.post('/hospital-test-prices', {
        ...form,
        hospital_id: selectedHospital,
        price: parseInt(form.price),
        discount_percent: form.discount_percent ? parseInt(form.discount_percent) : 0,
        discounted_price: form.discounted_price ? parseInt(form.discounted_price) : 0,
      });
      setShowForm(false);
      setForm({
        hospital_id: '',
        test_id: '',
        price: '',
        report_delivery_time: '',
        is_available: true,
        discount_percent: '',
        discounted_price: '',
      });
      fetchPrices(selectedHospital);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই price মুছে ফেলবেন?')) return;
    try {
      await api.delete(`/hospital-test-prices/${id}`);
      fetchPrices(selectedHospital);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdatePrice = async (id: string, price: number) => {
    try {
      await api.put(`/hospital-test-prices/${id}`, { price });
      fetchPrices(selectedHospital);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateDiscount = async (id: string, discount_percent: number, original_price: number) => {
    const discounted_price = discount_percent > 0
      ? Math.round(original_price - (original_price * discount_percent) / 100)
      : 0;
    try {
      await api.put(`/hospital-test-prices/${id}`, { discount_percent, discounted_price });
      fetchPrices(selectedHospital);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">💰 Hospital Test Prices</h1>
        {selectedHospital && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            + Test যোগ করুন
          </button>
        )}
      </div>

      {/* Hospital Select */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hospital বেছে নিন
        </label>
        <select
          value={selectedHospital}
          onChange={(e) => handleHospitalChange(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Hospital বেছে নিন --</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4">নতুন Test Price যোগ করুন</h2>
            <div className="space-y-3">
              <select
                value={form.test_id}
                onChange={(e) => handleFormChange('test_id', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Test বেছে নিন --</option>
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <input
                type="number"
                placeholder="মূল্য (টাকায়)"
                value={form.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Discount fields */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Discount %</label>
                  <input
                    type="number"
                    placeholder="যেমন: 10"
                    min="0"
                    max="100"
                    value={form.discount_percent}
                    onChange={(e) => handleFormChange('discount_percent', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Discounted মূল্য (৳)</label>
                  <input
                    type="number"
                    placeholder="Auto-calculated"
                    value={form.discounted_price}
                    onChange={(e) => setForm({ ...form, discounted_price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
              {form.discount_percent && form.price && (
                <p className="text-xs text-green-600">
                  ✅ {form.discount_percent}% ছাড়ে মূল্য হবে ৳{form.discounted_price}
                </p>
              )}

              <input
                placeholder="রিপোর্ট delivery time (যেমন: ২ ঘণ্টা)"
                value={form.report_delivery_time}
                onChange={(e) => handleFormChange('report_delivery_time', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) => handleFormChange('is_available', e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700">এখন available আছে</span>
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                যোগ করুন
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border text-gray-600 py-2 rounded-lg hover:bg-gray-50"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prices Table */}
      {selectedHospital && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Test নাম</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">মূল্য (৳)</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Discount %</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Discounted মূল্য (৳)</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Delivery Time</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((price) => (
                <tr key={price.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {price.test?.name}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={price.price}
                      onBlur={(e) => handleUpdatePrice(price.id, parseInt(e.target.value))}
                      className="w-24 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={price.discount_percent ?? 0}
                      min="0"
                      max="100"
                      onBlur={(e) =>
                        handleUpdateDiscount(price.id, parseInt(e.target.value), price.price)
                      }
                      className="w-20 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <span className="text-xs text-gray-400 ml-1">%</span>
                  </td>
                  <td className="px-4 py-3">
                    {price.discount_percent > 0 ? (
                      <span className="text-sm font-semibold text-green-600">
                        ৳{price.discounted_price}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {price.report_delivery_time || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      price.is_available
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {price.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(price.id)}
                      className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {prices.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              এই hospital এ কোনো test price নেই
            </div>
          )}
        </div>
      )}

      {!selectedHospital && !loading && (
        <div className="text-center text-gray-400 py-20">
          উপরে একটা hospital বেছে নিন
        </div>
      )}
    </div>
  );
}