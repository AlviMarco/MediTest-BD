'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'hospital',
    address: '',
    area: '',
    city: 'Dhaka',
    phone: '',
    emergency_available: false,
    icu_available: false,
    ambulance_available: false,
    is_open_24h: false,
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await api.get('/hospitals');
      setHospitals(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '', type: 'hospital', address: '', area: '',
      city: 'Dhaka', phone: '', emergency_available: false,
      icu_available: false, ambulance_available: false, is_open_24h: false,
    });
    setShowForm(true);
  };

  const openEdit = (hospital: any) => {
    setEditing(hospital);
    setForm({
      name: hospital.name,
      type: hospital.type,
      address: hospital.address,
      area: hospital.area || '',
      city: hospital.city,
      phone: hospital.phone || '',
      emergency_available: hospital.emergency_available,
      icu_available: hospital.icu_available,
      ambulance_available: hospital.ambulance_available,
      is_open_24h: hospital.is_open_24h,
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api.put(`/hospitals/${editing.id}`, form);
      } else {
        await api.post('/hospitals', form);
      }
      setShowForm(false);
      fetchHospitals();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই hospital মুছে ফেলবেন?')) return;
    try {
      await api.delete(`/hospitals/${id}`);
      fetchHospitals();
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = hospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏥 Hospitals</h1>
        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + নতুন Hospital
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editing ? 'Hospital Update করুন' : 'নতুন Hospital যোগ করুন'}
            </h2>

            <div className="space-y-3">
              <input
                placeholder="Hospital এর নাম *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hospital">Hospital</option>
                <option value="diagnostic">Diagnostic Center</option>
                <option value="clinic">Clinic</option>
              </select>
              <input
                placeholder="ঠিকানা *"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="এলাকা"
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="শহর"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="ফোন নম্বর"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'emergency_available', label: 'Emergency আছে' },
                  { key: 'icu_available', label: 'ICU আছে' },
                  { key: 'ambulance_available', label: 'Ambulance আছে' },
                  { key: 'is_open_24h', label: '২৪ ঘণ্টা খোলা' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(form as any)[item.key]}
                      onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                {editing ? 'Update করুন' : 'যোগ করুন'}
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

      {/* Search */}
      <input
        type="text"
        placeholder="Hospital খুঁজুন..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">লোড হচ্ছে...</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">নাম</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">এলাকা</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Emergency</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ICU</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hospital) => (
                <tr key={hospital.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {hospital.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{hospital.area}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      hospital.emergency_available
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {hospital.emergency_available ? '✓ আছে' : '✗ নেই'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      hospital.icu_available
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {hospital.icu_available ? '✓ আছে' : '✗ নেই'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(hospital)}
                        className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(hospital.id)}
                        className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              কোনো hospital পাওয়া যায়নি
            </div>
          )}
        </div>
      )}
    </div>
  );
}