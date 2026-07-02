'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  FlaskConical,
  Hospital,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Pill,
  Stethoscope,
  TicketPercent,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { getCurrentUser, logout } from '@/lib/auth';
import UiModeToggle from './UiModeToggle';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/hospitals', icon: Hospital, label: 'Hospitals' },
  { href: '/dashboard/diagnostic-tests', icon: FlaskConical, label: 'Diagnostic Tests' },
  { href: '/dashboard/doctors', icon: Stethoscope, label: 'Doctors' },
  { href: '/dashboard/bookings', icon: CalendarDays, label: 'Bookings' },
  { href: '/dashboard/medicines', icon: Pill, label: 'Medicines' },
  { href: '/dashboard/medicine-orders', icon: Package, label: 'Medicine Orders' },
  { href: '/dashboard/delivery-zones', icon: Truck, label: 'Delivery Zones' },
  { href: '/dashboard/coupons', icon: TicketPercent, label: 'Coupons' },
  { href: '/dashboard/users', icon: Users, label: 'Users' },
  { href: '/dashboard/tasks', icon: ClipboardList, label: 'Tasks' },
  { href: '/dashboard/test-prices', icon: CircleDollarSign, label: 'Test Prices' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
];

function roleLabel(roleId?: number) {
  if (roleId === 1) return 'Super Admin';
  if (roleId === 2) return 'Admin';
  if (roleId === 3) return 'Moderator';
  return 'User';
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = getCurrentUser();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <span className="font-bold text-white">M</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-800">MediTest BD</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                    active
                      ? 'bg-blue-50 font-medium text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon aria-hidden className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t p-4">
        <UiModeToggle />
        <div className="mb-3 flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-medium text-blue-700">
              {user?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-800">
              {user?.name || 'Admin'}
            </p>
            <p className="text-xs text-gray-500">{roleLabel(user?.role_id)}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 hover:text-red-700"
        >
          <LogOut aria-hidden className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 font-bold text-white">
            M
          </div>
          <span className="font-semibold text-gray-800">MediTest BD</span>
        </div>
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
        >
          <Menu aria-hidden className="h-5 w-5" />
        </button>
      </header>

      <aside className="hidden min-h-screen w-64 shrink-0 border-r md:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="mobile-drawer-panel relative h-full w-[min(82vw,20rem)] shadow-xl">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-md p-2 text-gray-500 hover:bg-gray-100"
            >
              <X aria-hidden className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
