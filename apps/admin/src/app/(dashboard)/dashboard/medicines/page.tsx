'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

const EMPTY_FORM = {
  brand_name: '',
  generic_name: '',
  manufacturer: '',
  dosage_form: '',
  strength: '',
  price: '',
  discount_percent: '',
  discounted_price: '',
  is_available: true,
  requires_prescription: false,
};

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicines');
      setMedicines(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingMedicine(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEditForm = (medicine: any) => {
    setEditingMedicine(medicine);
    setForm({
      brand_name: medicine.brand_name || '',
      generic_name: medicine.generic_name || '',
      manufacturer: medicine.manufacturer || '',
      dosage_form: medicine.dosage_form || '',
      strength: medicine.strength || '',
      price: medicine.price?.toString() || '',
      discount_percent: medicine.discount_percent?.toString() || '',
      discounted_price: medicine.discounted_price?.toString() || '',
      is_available: medicine.is_available ?? true,
      requires_prescription: medicine.requires_prescription ?? false,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingMedicine(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    const updated = { ...form, [field]: value };

    // Auto-calculate discounted_price
    if (field === 'price' || field === 'discount_percent') {
      const price = parseFloat(field === 'price' ? (value as string) : updated.price) || 0;
      const pct = parseFloat(field === 'discount_percent' ? (value as string) : updated.discount_percent) || 0;
      if (price > 0 && pct > 0) {
        updated.discounted_price = (price - (price * pct) / 100).toFixed(2);
      } else {
        updated.discounted_price = '';
      }
    }

    setForm(updated);
  };

  const handleSubmit = async () => {
    if (!form.brand_name.trim()) return alert('Brand name দিন।');
    if (!form.generic_name.trim()) return alert('Generic name দিন।');
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.price ? parseFloat(form.price) : 0,
        discount_percent: form.discount_percent ? parseFloat(form.discount_percent) : 0,
        discounted_price: form.discounted_price ? parseFloat(form.discounted_price) : 0,
      };
      if (editingMedicine) {
        await api.put(`/medicines/${editingMedicine.id}`, payload);
      } else {
        await api.post('/medicines', payload);
      }
      closeForm();
      fetchMedicines();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" মুছে ফেলবেন?`)) return;
    try {
      await api.delete(`/medicines/${id}`);
      fetchMedicines();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Delete failed!');
    }
  };

  const filtered = medicines.filter((m) =>
    m.brand_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.generic_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">💊 Medicines</h1>
        <button
          onClick={openAddForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          + নতুন Medicine
        </button>
      </div>

      <input
        type="text"
        placeholder="Medicine খুঁজুন..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingMedicine ? '✏️ Medicine সম্পাদনা' : '➕ নতুন Medicine যোগ করুন'}
            </h2>
            <div className="space-y-3">

              {/* Brand & Generic */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    placeholder="যেমন: Napa"
                    value={form.brand_name}
                    onChange={(e) => handleFormChange('brand_name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Generic Name *</label>
                  <input
                    type="text"
                    placeholder="যেমন: Paracetamol"
                    value={form.generic_name}
                    onChange={(e) => handleFormChange('generic_name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Manufacturer & Dosage Form */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="যেমন: Beximco"
                    value={form.manufacturer}
                    onChange={(e) => handleFormChange('manufacturer', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Dosage Form</label>
                  <select
                    value={form.dosage_form}
                    onChange={(e) => handleFormChange('dosage_form', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- বেছে নিন --</option>
                    <optgroup label="Solid Forms">
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Caplet">Caplet</option>
                      <option value="Softgel">Softgel</option>
                      <option value="Lozenge">Lozenge</option>
                      <option value="Effervescent Tablet">Effervescent Tablet</option>
                      <option value="Orally Disintegrating Tablet (ODT)">Orally Disintegrating Tablet (ODT)</option>
                      <option value="Sublingual Tablet">Sublingual Tablet</option>
                      <option value="Buccal Tablet">Buccal Tablet</option>
                    </optgroup>
                    <optgroup label="Liquid Forms">
                      <option value="Syrup">Syrup</option>
                      <option value="Elixir">Elixir</option>
                      <option value="Suspension">Suspension</option>
                    </optgroup>
                    <optgroup label="Injectable & Biological">
                      <option value="Vaccine">Vaccine</option>
                      <option value="Intravenous Injection (IV)">Intravenous Injection (IV)</option>
                      <option value="Intramuscular Injection (IM)">Intramuscular Injection (IM)</option>
                      <option value="Subcutaneous Injection (SC)">Subcutaneous Injection (SC)</option>
                    </optgroup>
                    <optgroup label="Topical & External">
                      <option value="Cream">Cream</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Gel">Gel</option>
                      <option value="Transdermal Patch">Transdermal Patch</option>
                      <option value="Eye Drops">Eye Drops</option>
                      <option value="Ear Drops">Ear Drops</option>
                      <option value="Nasal Spray">Nasal Spray</option>
                    </optgroup>
                    <optgroup label="Rectal & Vaginal">
                      <option value="Suppository">Suppository</option>
                      <option value="Enema">Enema</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Strength & Price */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Strength</label>
                  <input
                    type="text"
                    placeholder="যেমন: 500mg"
                    value={form.strength}
                    onChange={(e) => handleFormChange('strength', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">মূল্য (৳)</label>
                  <input
                    type="number"
                    placeholder="যেমন: 2.50"
                    value={form.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Discount */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Discount %</label>
                  <input
                    type="number"
                    placeholder="যেমন: 10"
                    min="0"
                    max="100"
                    value={form.discount_percent}
                    onChange={(e) => handleFormChange('discount_percent', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
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

              {/* Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_available}
                    onChange={(e) => handleFormChange('is_available', e.target.checked)}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.requires_prescription}
                    onChange={(e) => handleFormChange('requires_prescription', e.target.checked)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm text-gray-700">Prescription লাগবে</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'সংরক্ষণ হচ্ছে...' : editingMedicine ? 'আপডেট করুন' : 'যোগ করুন'}
              </button>
              <button
                onClick={closeForm}
                className="flex-1 border text-gray-600 py-2 rounded-lg hover:bg-gray-50"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500 py-10">লোড হচ্ছে...</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Brand Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Generic Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Manufacturer</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ধরন</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">দাম</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Discount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((medicine) => (
                <tr key={medicine.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {medicine.brand_name}
                    {medicine.requires_prescription && (
                      <span className="ml-1 text-xs text-orange-500" title="Prescription required">Rx</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{medicine.generic_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{medicine.manufacturer || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                      {medicine.dosage_form || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {medicine.discount_percent > 0 ? (
                      <span className="line-through text-gray-400 mr-1">৳{medicine.price}</span>
                    ) : (
                      <span>৳{medicine.price}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {medicine.discount_percent > 0 ? (
                      <div>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                          {medicine.discount_percent}% off
                        </span>
                        <div className="text-sm font-semibold text-green-600 mt-0.5">
                          ৳{medicine.discounted_price}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      medicine.is_available
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {medicine.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(medicine)}
                        className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(medicine.id, medicine.brand_name)}
                        className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              কোনো medicine পাওয়া যায়নি
            </div>
          )}
        </div>
      )}
    </div>
  );
}