'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <h1 className="text-lg font-bold text-gray-800">MediTest BD</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <button
              onClick={logout}
              className="text-sm text-red-500 hover:text-red-700"
            >
              লগআউট
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          স্বাগতম, {user.name}! 👋
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl mb-2">🏥</div>
            <h3 className="font-semibold text-gray-800">Hospitals</h3>
            <p className="text-gray-500 text-sm">Hospital manage করুন</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl mb-2">🔬</div>
            <h3 className="font-semibold text-gray-800">Diagnostic Tests</h3>
            <p className="text-gray-500 text-sm">Test manage করুন</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-3xl mb-2">📅</div>
            <h3 className="font-semibold text-gray-800">Bookings</h3>
            <p className="text-gray-500 text-sm">Booking manage করুন</p>
          </div>
        </div>
      </div>
    </div>
  );
}