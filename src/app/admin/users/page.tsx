'use client';

import React, { useState } from 'react';
import {
  useQuery,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  Users,
  Search,
  Phone,
  Clock,
  ShoppingBag,
  UserCheck,
  Send,
} from 'lucide-react';
import { api } from '@/lib/api';
import Pagination from '@/components/ui/pagination';

interface TelegramUserItem {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  language: string;
  ordersCount: number;
  lastActiveAt: string;
  createdAt: string;
}

interface UsersPaginatedResponse {
  items: TelegramUserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UsersAdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch paginated telegram bot users
  const {
    data: paginationData,
    isLoading,
    isPlaceholderData,
  } = useQuery<UsersPaginatedResponse>({
    queryKey: ['telegram-users', page, limit, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      params.append('page', String(page));
      params.append('limit', String(limit));

      const res = await api.get(`/telegram/users?${params.toString()}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
    refetchInterval: 10000,
  });

  const users = paginationData?.items || [];
  const total = paginationData?.total || 0;
  const totalPages = paginationData?.totalPages || 1;

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  const orderingCustomersCount = users.filter((u) => u.ordersCount > 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0c0d12] p-5 rounded-2xl border border-white/[0.07]">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Telegram Bot Mijozlari</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {total} ta foydalanuvchi
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Botga kirgan, kompyuter qidirgan va buyurtma bergan barcha mijozlarning to‘liq bazasi
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.07]">
          <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <Users className="w-4 h-4 text-zinc-400" />
            Jami Bot Mijozlari
          </div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{total}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0d12] border border-emerald-500/20">
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            Buyurtma Berganlar
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {orderingCustomersCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0d12] border border-indigo-500/20">
          <div className="text-xs text-indigo-300 font-medium flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            Faol Mijozlar
          </div>
          <div className="text-2xl font-bold text-indigo-300 font-mono mt-1">
            {total}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Ism, @username, telefon yoki Telegram ID..."
          className="w-full bg-[#0c0d12] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-[#0c0d12] border border-white/[0.07] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-3">Mijoz Ismi</th>
                <th className="py-3 px-3">Telegram ID & Username</th>
                <th className="py-3 px-3">Telefon Raqami</th>
                <th className="py-3 px-3">Tili</th>
                <th className="py-3 px-3">Buyurtmalari</th>
                <th className="py-3 px-3">Oxirgi Faollik</th>
                <th className="py-3 px-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-zinc-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Mijozlar ro‘yxati yuklanmoqda...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Hozircha botda mijozlar mavjud emas. Botga /start bosilganda mijozlar avtomatik paydo bo‘ladi.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Noma‘lum';
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isPlaceholderData ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-indigo-400 font-semibold text-xs">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                          <span>{fullName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono">
                        <div className="text-zinc-200">
                          {u.username ? (
                            <a
                              href={`https://t.me/${u.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              <span>@{u.username}</span>
                              <Send className="w-2.5 h-2.5 text-zinc-500" />
                            </a>
                          ) : (
                            <span className="text-zinc-500">Username yo‘q</span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-500">ID: {u.telegramId}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-zinc-300">
                        {u.phoneNumber ? (
                          <div className="flex items-center gap-1 text-emerald-400 font-medium">
                            <Phone className="w-3 h-3 text-emerald-500" />
                            <span>{u.phoneNumber}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 border border-white/[0.06] text-zinc-300">
                          {u.language === 'ru' ? '🇷🇺 RU' : '🇺🇿 UZ'}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {u.ordersCount > 0 ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                            {u.ordersCount} ta buyurtma
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-mono text-[11px]">0</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>
                            {new Date(u.lastActiveAt).toLocaleDateString('uz-UZ', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {u.username ? (
                          <a
                            href={`https://t.me/${u.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-indigo-400 hover:text-indigo-300 border border-white/[0.06] text-xs transition-colors font-medium"
                          >
                            <span>Yozish</span>
                            <Send className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-zinc-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
