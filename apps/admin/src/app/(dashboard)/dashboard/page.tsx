'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Building2,
  CalendarCheck,
  FlaskConical,
  HeartPulse,
  Pill,
  Stethoscope,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { MetricBarChart, Sparkline } from '@/component/Charts';
import api from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

type AdminUser = {
  name?: string;
  email?: string;
};

type StatCard = {
  label: string;
  value: number;
  accent: string;
  href: string;
  icon: LucideIcon;
};

const EMPTY_STATS = {
  hospitals: 0,
  doctors: 0,
  bookings: 0,
  users: 0,
  medicines: 0,
  tests: 0,
};

function countRows(data: unknown) {
  return Array.isArray(data) ? data.length : 0;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [hospitals, doctors, bookings, users, medicines, tests] = await Promise.all([
        api.get('/hospitals'),
        api.get('/doctors'),
        api.get('/bookings'),
        api.get('/users'),
        api.get('/medicines'),
        api.get('/diagnostic-tests'),
      ]);

      setStats({
        hospitals: countRows(hospitals.data),
        doctors: countRows(doctors.data),
        bookings: countRows(bookings.data),
        users: countRows(users.data),
        medicines: countRows(medicines.data),
        tests: countRows(tests.data),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards: StatCard[] = useMemo(
    () => [
      {
        label: 'Hospitals',
        value: stats.hospitals,
        icon: Building2,
        href: '/dashboard/hospitals',
        accent: '#2563eb',
      },
      {
        label: 'Doctors',
        value: stats.doctors,
        icon: Stethoscope,
        href: '/dashboard/doctors',
        accent: '#059669',
      },
      {
        label: 'Bookings',
        value: stats.bookings,
        icon: CalendarCheck,
        href: '/dashboard/bookings',
        accent: '#d97706',
      },
      {
        label: 'Users',
        value: stats.users,
        icon: Users,
        href: '/dashboard/users',
        accent: '#7c3aed',
      },
      {
        label: 'Medicines',
        value: stats.medicines,
        icon: Pill,
        href: '/dashboard/medicines',
        accent: '#dc2626',
      },
      {
        label: 'Diagnostic Tests',
        value: stats.tests,
        icon: FlaskConical,
        href: '/dashboard/diagnostic-tests',
        accent: '#0891b2',
      },
    ],
    [stats],
  );

  if (!user) return null;

  const chartItems = statCards.map((card) => ({
    label: card.label,
    value: card.value,
    color: card.accent,
  }));
  const trendValues = [
    stats.hospitals,
    stats.doctors,
    stats.bookings,
    stats.users,
    stats.medicines,
    stats.tests,
  ];

  return (
    <>
      <section className="modern-only space-y-6">
        <div className="modern-card overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                <HeartPulse className="h-3.5 w-3.5" />
                MediTest BD Command Center
              </div>
              <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
                Welcome back, {user.name || user.email || 'Admin'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Live operational snapshot across hospitals, bookings, users, medicine, and diagnostics.
              </p>
            </div>

            <div className="min-w-52 rounded-md border border-slate-200 bg-white p-4 text-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Platform Pulse</span>
                <span>{isLoading ? 'Syncing' : 'Live'}</span>
              </div>
              <div className="mt-2 text-cyan-600">
                <Sparkline values={trendValues.map((value) => value + 1)} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                href={card.href}
                key={card.label}
                className="modern-card modern-kpi group block p-5 transition hover:-translate-y-0.5 hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-950">{card.value}</p>
                  </div>
                  <span
                    className="grid h-11 w-11 place-items-center rounded-md text-white"
                    style={{ background: card.accent }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Total records</span>
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <MetricBarChart items={chartItems} />

          <div className="modern-card p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-950">Quick Actions</h2>
              <p className="text-xs text-slate-500">Most used admin paths</p>
            </div>
            <div className="space-y-2">
              {statCards.slice(0, 4).map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    href={card.href}
                    key={card.label}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" style={{ color: card.accent }} />
                      {card.label}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="classic-only">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user.name || user.email || 'Admin'}
          </h2>
          <p className="mt-1 text-sm text-gray-500">MediTest BD Admin Panel</p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href} className="rounded-xl border bg-white p-6">
                <div className="mb-3 flex items-center justify-between">
                  <Icon className="h-6 w-6" style={{ color: card.accent }} />
                  <span className="rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-600">
                    {card.label}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-800">{card.value}</div>
                <div className="mt-1 text-sm text-gray-500">Total {card.label}</div>
              </Link>
            );
          })}
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-800">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {statCards.slice(0, 4).map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  href={card.href}
                  className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 transition hover:bg-gray-100"
                >
                  <Icon className="h-4 w-4" style={{ color: card.accent }} />
                  {card.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
