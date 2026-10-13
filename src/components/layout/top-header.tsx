'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CircleDot, Bot } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function TopHeader() {
  const pathname = usePathname();

  const { data: settings } = useQuery({
    queryKey: ['settings-header'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const usdRate = Number(settings?.usd_to_uzs_rate) || 12800;

  const getPageTitle = () => {
    switch (pathname) {
      case '/admin/components':
        return 'Ehtiyot Qismlar Ombori';
      case '/admin/categories':
        return 'Kategoriyalar Boshqaruvi';
      case '/admin/settings':
        return 'Do‘kon & Kurs Sozlamalari';
      case '/admin/vector':
        return 'AI Vector Baza & RAG Qidiruv';
      case '/admin/orders':
        return 'Telegram Bot Buyurtmalari';
      case '/admin/users':
        return 'Telegram Bot Mijozlari';
      case '/admin/builds':
        return 'Yig‘ilgan PC Konfiguratsiyalar';
      default:
        return 'Admin Boshqaruv Paneli';
    }
  };

  return (
    <header className="h-14 border-b border-white/[0.07] bg-[#0c0d12]/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none">
      <div>
        <h2 className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
          <span>{getPageTitle()}</span>
        </h2>
        <p className="text-[10px] text-zinc-400">Telegram Bot boshqaruvi va do‘kon ma‘lumotlari</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Exchange Rate Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900/80 border border-white/[0.07] text-xs font-mono">
          <span className="text-indigo-400 font-semibold">$1</span>
          <span className="text-zinc-500">=</span>
          <span className="text-emerald-400 font-semibold">{usdRate.toLocaleString()} UZS</span>
        </div>

        {/* Bot Status Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <Bot className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Bot:</span>
          <CircleDot className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-[11px]">Faol</span>
        </div>
      </div>
    </header>
  );
}
