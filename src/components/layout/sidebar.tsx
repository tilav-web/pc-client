'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Cpu,
  Layers,
  ShoppingBag,
  Brain,
  LogOut,
  User,
  Users,
  ShieldCheck,
  Settings,
  FolderKanban,
  HardDrive,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // Grouped Navigation Categories
  const navGroups = [
    {
      title: 'OMBOR & TOIFALAR',
      items: [
        {
          href: '/admin/components',
          label: 'Ehtiyot Qismlar',
          icon: Layers,
          badge: '29 ta',
        },
        {
          href: '/admin/categories',
          label: 'Kategoriyalar',
          icon: FolderKanban,
        },
      ],
    },
    {
      title: 'AI & YIG‘ISH ARXIVI',
      items: [
        {
          href: '/admin/vector',
          label: 'AI Vector Baza (RAG)',
          icon: Brain,
          badge: '64D',
        },
        {
          href: '/admin/builds',
          label: 'Yig‘ilgan PC Konfiguratsiyalar',
          icon: HardDrive,
        },
      ],
    },
    {
      title: 'SAVDO VA BUYURTMALAR',
      items: [
        {
          href: '/admin/orders',
          label: 'Telegram Buyurtmalar',
          icon: ShoppingBag,
        },
        {
          href: '/admin/users',
          label: 'Bot Mijozlari',
          icon: Users,
        },
      ],
    },
    {
      title: 'TIZIM SOZLAMALARI',
      items: [
        {
          href: '/admin/settings',
          label: 'Do‘kon & Kurs Sozlamalari',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 h-full bg-[#0c0d12] border-r border-white/[0.07] flex flex-col shrink-0 overflow-hidden select-none">
      {/* Brand Header - Pinned */}
      <div className="p-4 border-b border-white/[0.07] flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shadow-sm shadow-indigo-500/20 shrink-0 text-indigo-400">
          <Cpu className="w-4 h-4" />
        </div>
        <div className="overflow-hidden">
          <div className="font-semibold text-xs text-zinc-100 flex items-center gap-1.5 truncate tracking-wide">
            <span>PC Master</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
              Pro
            </span>
          </div>
          <p className="text-[10px] text-zinc-400 truncate">Do‘kon Admin Paneli</p>
        </div>
      </div>

      {/* Navigation Sections - Only this part scrolls if overflowing */}
      <div className="flex-1 py-4 px-2.5 space-y-5 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-2.5 mb-1.5 text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-indigo-500/15 text-white border border-indigo-500/25 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-indigo-400'
                            : 'text-zinc-400 group-hover:text-zinc-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                          isActive
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : 'bg-zinc-800/80 text-zinc-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Server Status Badge - Pinned */}
      <div className="shrink-0 px-3 py-2.5 mx-2.5 mb-2 rounded-lg bg-zinc-900/60 border border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Postgres & MinIO</span>
        </div>
        <span className="text-[9px] font-medium text-emerald-400">FAOL</span>
      </div>

      {/* User Footer Profile & Logout - Pinned */}
      <div className="shrink-0 p-2.5 border-t border-white/[0.07] bg-[#0c0d12]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/70 border border-white/[0.06]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-medium text-zinc-200 truncate">
                {user?.username || 'admin'}
              </div>
              <div className="text-[9px] text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-indigo-400" />
                <span>Super Admin</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-1 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Tizimdan chiqish"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
