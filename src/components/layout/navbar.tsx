'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Cpu,
  Layers,
  ShoppingBag,
  Brain,
  LogOut,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Completely private closed system: Never render navbar on login page or when unauthenticated
  if (pathname === '/login' || !isAuthenticated) {
    return null;
  }

  const links = [
    { href: '/admin/components', label: 'Ehtiyot Qismlar', icon: Layers },
    { href: '/admin/vector', label: 'AI Vector Baza', icon: Brain },
    { href: '/admin/orders', label: 'Telegram Buyurtmalar', icon: ShoppingBag },
    { href: '/admin/builds', label: 'PC Arxiv', icon: Cpu },
  ];

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-zinc-950/85 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/admin/components" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-base text-white flex items-center gap-2">
              PC Master <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Bot Admin</span>
            </div>
            <p className="text-[11px] text-zinc-400">Telegram Bot Boshqaruv Paneli</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            <span>{user?.username || 'admin'}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-medium transition-colors cursor-pointer"
            title="Tizimdan chiqish"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </div>
    </header>
  );
}
