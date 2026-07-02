'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    specialty: '',
    qualification: '',
    experience_years: 0,
    phone: '',
    bio: '',
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', specialty: '', qualification: '', experience_years: 0, phone: '', bio: '' });
    setShowForm(true);
  };

  const openEdit = (doctor: any) => {
    setEditing(doctor);
    setForm({
      name: doctor.name,
      specialty: doctor.specialty,
      qualification: doctor.qualification || '',
      experience_years: doctor.experience_years,
      phone: doctor.phone || '',
      bio: doctor.bio || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api.put(`/doctors/${editing.id}`, form);
      } else {
        await api.post('/doctors', form);
      }
      setShowForm(false);
      fetchDoctors();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই doctor মুছে ফেলবেন?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      fetchDoctors();
    } catch (error) {
      console.error(error);
    }
  };

  const filtered = doctors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">👨‍⚕️ Doctors</h1>
        <button
          onClick={openAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + নতুন Doctor
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editing ? 'Doctor Update করুন' : 'নতুন Doctor যোগ করুন'}
            </h2>
            <div className="space-y-3">
              <input
                placeholder="ডাক্তারের নাম *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Specialty (যেমন: Cardiologist) *"
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Qualification (যেমন: MBBS, MD)"
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="অভিজ্ঞতা (বছর)"
                value={form.experience_years}
                onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="ফোন নম্বর"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Bio (সংক্ষিপ্ত পরিচয়)"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
        placeholder="Doctor বা specialty খুঁজুন..."
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
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Specialty</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Qualification</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">অভিজ্ঞতা</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doctor) => (
                <tr key={doctor.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {doctor.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-600">
                      {doctor.specialty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {doctor.qualification || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {doctor.experience_years} বছর
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {doctor.phone || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(doctor)}
                        className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(doctor.id)}
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
              কোনো doctor পাওয়া যায়নি
            </div>
          )}
        </div>
      )}
    </div>
  );
}