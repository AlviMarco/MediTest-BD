'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

const ROLE_OPTIONS = [
  { id: 1, label: 'Super Admin', color: 'bg-red-100 text-red-600' },
  { id: 2, label: 'Admin', color: 'bg-orange-100 text-orange-600' },
  { id: 3, label: 'Moderator', color: 'bg-blue-100 text-blue-600' },
  { id: 4, label: 'User', color: 'bg-gray-100 text-gray-600' },
];

const roleMap: any = Object.fromEntries(ROLE_OPTIONS.map((r) => [r.id, r]));

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role_id: 4, is_active: true });
  const currentUser = getCurrentUser();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user: any) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role_id: user.role_id || 4,
      is_active: user.is_active ?? true,
    });
  };

  const closeEdit = () => {
    setEditingUser(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return alert('নাম দিন।');
    setSaving(true);
    try {
      await api.put(`/users/${editingUser.id}`, form);
      closeEdit();
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Update failed!');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`"${name}" কে নিষ্ক্রিয় করবেন?`)) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed!');
    }
  };

  // Role visibility rules
  const visibleUsers = users.filter((u) => {
    if (currentUser?.role_id === 1) return true;
    if (currentUser?.role_id === 2) return u.role_id >= 3;
    if (currentUser?.role_id === 3) return u.role_id === 4;
    return false;
  });

  const filtered = visibleUsers.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">👥 Users</h1>
        <span className="text-sm text-gray-400">{users.length} জন user</span>
      </div>

      <input
        type="text"
        placeholder="User খুঁজুন..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">✏️ User সম্পাদনা</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">নাম *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Role</label>
                <select
                  value={form.role_id}
                  onChange={(e) => setForm({ ...form, role_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 accent-blue-600"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
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

      {loading ? (
        <div className="text-center text-gray-500 py-10">লোড হচ্ছে...</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">নাম</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Phone</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    <span className="flex items-center gap-2">
                      {user.name}
                      {currentUser?.id === user.id && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Me</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.phone || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${roleMap[user.role_id]?.color}`}>
                      {roleMap[user.role_id]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200"
                      >
                        ✏️ Edit
                      </button>
                      {user.is_active && currentUser?.id !== user.id && (
                        <button
                          onClick={() => handleDeactivate(user.id, user.name)}
                          className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                        >
                          🚫 Deactivate
                        </button>
                      )}
                      {currentUser?.id === user.id && (
                        <span className="text-xs text-gray-400 italic">Deactivation not allowed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center text-gray-500 py-10">কোনো user পাওয়া যায়নি</div>
          )}
        </div>
      )}
    </div>
  );
}