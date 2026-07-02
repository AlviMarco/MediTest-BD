'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { getCurrentUser, ROLES } from '@/lib/auth';

const STATUS_OPTIONS = ['assigned', 'accepted', 'in_progress', 'completed'];

const statusColor: any = {
  assigned: 'bg-yellow-100 text-yellow-600',
  accepted: 'bg-blue-100 text-blue-600',
  in_progress: 'bg-purple-100 text-purple-600',
  completed: 'bg-green-100 text-green-600',
};

const statusLabel: any = {
  assigned: 'দেওয়া হয়েছে',
  accepted: 'গৃহীত',
  in_progress: 'চলছে',
  completed: 'সম্পন্ন',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const user = getCurrentUser();
  const isAdminOrAbove = user?.role_id <= ROLES.ADMIN;       // role 1 or 2
  const isModerator = user?.role_id === ROLES.MODERATOR;     // role 3

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await api.post('/tasks', {
        title,
        description,
        assigned_by: user?.id,
        assigned_to: user?.id,
      });
      setTitle('');
      setDescription('');
      setShowForm(false);
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error!');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/tasks/${id}/status`, { status });
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Status update failed!');
    }
  };

  const deleteTask = async (id: string, title: string) => {
    if (!confirm(`"${title}" মুছে ফেলবেন?`)) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Delete failed!');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 Tasks</h1>
        {/* শুধু Admin ও Super Admin task তৈরি করতে পারবে */}
        {isAdminOrAbove && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            + নতুন Task
          </button>
        )}
      </div>

      {/* New Task Form — শুধু Admin/Super Admin */}
      {isAdminOrAbove && showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">নতুন Task তৈরি করুন</h2>
          <input
            type="text"
            placeholder="Task এর শিরোনাম"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="বিস্তারিত (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <div className="flex gap-3">
            <button
              onClick={createTask}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'তৈরি হচ্ছে...' : 'তৈরি করুন'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="border text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
            >
              বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {loading ? (
        <div className="text-center text-gray-500 py-10">লোড হচ্ছে...</div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl border p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(task.created_at).toLocaleDateString('bn-BD')}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {/* Status badge */}
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor[task.status]}`}>
                    {statusLabel[task.status]}
                  </span>

                  {/* Status change — Admin/Super Admin/Moderator সবাই পারবে */}
                  {(isAdminOrAbove || isModerator) && task.status !== 'completed' && (
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className="text-xs px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{statusLabel[s]}</option>
                      ))}
                    </select>
                  )}

                  {/* Delete — শুধু Admin ও Super Admin */}
                  {isAdminOrAbove && (
                    <button
                      onClick={() => deleteTask(task.id, task.title)}
                      className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              কোনো task নেই
            </div>
          )}
        </div>
      )}
    </div>
  );
}