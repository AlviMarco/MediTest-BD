'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

const DISTRICTS = [
  'DEFAULT', 'ঢাকা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'মানিকগঞ্জ', 'মুন্সীগঞ্জ', 'কিশোরগঞ্জ', 'নরসিংদী', 'ফরিদপুর', 'টাঙ্গাইল',
  'চট্টগ্রাম', 'কক্সবাজার', 'কুমিল্লা', 'ফেনী', 'নোয়াখালী', 'লক্ষ্মীপুর', 'চাঁদপুর', 'ব্রাহ্মণবাড়িয়া',
  'রাজশাহী', 'নাটোর', 'নওগাঁ', 'চাঁপাইনবাবগঞ্জ', 'পাবনা', 'বগুড়া', 'সিরাজগঞ্জ', 'জয়পুরহাট',
  'খুলনা', 'যশোর', 'সাতক্ষীরা', 'বাগেরহাট', 'কুষ্টিয়া', 'মেহেরপুর', 'চুয়াডাঙ্গা', 'ঝিনাইদহ', 'মাগুরা', 'নড়াইল',
  'বরিশাল', 'পটুয়াখালী', 'ভোলা', 'পিরোজপুর', 'ঝালকাঠি', 'বরগুনা',
  'সিলেট', 'মৌলভীবাজার', 'হবিগঞ্জ', 'সুনামগঞ্জ',
  'রংপুর', 'দিনাজপুর', 'কুড়িগ্রাম', 'গাইবান্ধা', 'নীলফামারী', 'লালমনিরহাট', 'ঠাকুরগাঁও', 'পঞ্চগড়',
  'ময়মনসিংহ', 'নেত্রকোণা', 'জামালপুর', 'শেরপুর',
];

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingZone, setEditingZone] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({
    district: '',
    delivery_charge: '',
    free_delivery_threshold: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await api.get('/delivery-zones');
      setZones(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setIsNew(true);
    setEditingZone({});
    setForm({
      district: '',
      delivery_charge: '',
      free_delivery_threshold: '',
      is_active: true,
    });
  };

  const openEdit = (zone: any) => {
    setIsNew(false);
    setEditingZone(zone);
    setForm({
      district: zone.district || '',
      delivery_charge: String(zone.delivery_charge ?? ''),
      free_delivery_threshold: String(zone.free_delivery_threshold ?? ''),
      is_active: zone.is_active,
    });
  };

  const closeModal = () => {
    setEditingZone(null);
  };

  const handleSave = async () => {
    if (!form.district.trim()) return alert('জেলার নাম দিন।');
    if (form.delivery_charge === '') return alert('ডেলিভারি চার্জ দিন।');

    setSaving(true);
    try {
      const payload = {
        district: form.district.trim(),
        delivery_charge: parseFloat(form.delivery_charge),
        free_delivery_threshold: form.free_delivery_threshold
          ? parseFloat(form.free_delivery_threshold)
          : 0,
        is_active: form.is_active,
      };

      if (isNew) {
        await api.post('/delivery-zones', payload);
      } else {
        await api.put(`/delivery-zones/${editingZone.id}`, payload);
      }
      closeModal();
      fetchZones();
    } catch (error: any) {
      alert(error.response?.data?.message || 'সংরক্ষণ ব্যর্থ হয়েছে!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই zone টি মুছে ফেলতে চান?')) return;
    try {
      await api.delete(`/delivery-zones/${id}`);
      fetchZones();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleActive = async (zone: any) => {
    try {
      await api.put(`/delivery-zones/${zone.id}`, {
        is_active: !zone.is_active,
      });
      fetchZones();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🚚 Delivery Zones</h1>
        <button
          onClick={openNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + নতুন Zone
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        জেলা ভিত্তিক ডেলিভারি চার্জ এবং ফ্রি ডেলিভারি লিমিট নির্ধারণ করুন। কোনো নির্দিষ্ট
        জেলার জন্য zone না থাকলে, &quot;DEFAULT&quot; নামে একটা zone বানালে সেটা সব
        জেলায় fallback হিসেবে কাজ করবে।
      </p>

      {/* Modal */}
      {editingZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {isNew ? '➕ নতুন Delivery Zone' : '✏️ Zone সম্পাদনা'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  জেলা * (&quot;DEFAULT&quot; নির্বাচন করলে এটা সব জেলার জন্য fallback হিসেবে কাজ করবে)
                </label>
                <select
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isNew}
                >
                  <option value="">-- জেলা নির্বাচন করুন --</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d === 'DEFAULT' ? 'DEFAULT (সব জেলা)' : d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  ডেলিভারি চার্জ (৳) *
                </label>
                <input
                  type="number"
                  placeholder="৬৫"
                  value={form.delivery_charge}
                  onChange={(e) =>
                    setForm({ ...form, delivery_charge: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  ফ্রি ডেলিভারি লিমিট (৳) — এর বেশি অর্ডারে ফ্রি (০ = কখনো ফ্রি না)
                </label>
                <input
                  type="number"
                  placeholder="৯৯৯"
                  value={form.free_delivery_threshold}
                  onChange={(e) =>
                    setForm({ ...form, free_delivery_threshold: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!isNew && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                    id="is_active"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-600">
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
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">জেলা</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ডেলিভারি চার্জ</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ফ্রি ডেলিভারি লিমিট</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {zone.district === 'DEFAULT' ? (
                      <span className="text-purple-600">DEFAULT (সব জেলা)</span>
                    ) : (
                      zone.district
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    ৳{zone.delivery_charge}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {Number(zone.free_delivery_threshold) > 0
                      ? `৳${zone.free_delivery_threshold}+ এ ফ্রি`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(zone)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        zone.is_active
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {zone.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(zone)}
                        className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(zone.id)}
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

          {zones.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              কোনো delivery zone যুক্ত করা হয়নি
            </div>
          )}
        </div>
      )}
    </div>
  );
}