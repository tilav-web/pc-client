'use client';

import React, { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  ShoppingBag,
  Phone,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';
import Pagination from '@/components/ui/pagination';

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Barchasi' },
  { value: 'PENDING', label: 'Kutilmoqda' },
  { value: 'CONFIRMED', label: 'Tasdiqlangan' },
  { value: 'COMPLETED', label: 'Tugatilgan' },
  { value: 'CANCELLED', label: 'Bekor qilingan' },
];

interface OrderItem {
  id: string;
  telegramUserId: string;
  customerName: string;
  customerPhone: string;
  totalPriceUsd: number;
  totalPriceUzs: number;
  status: string;
  adminNote?: string;
  buildSnapshot?: any;
  createdAt: string;
}

interface OrdersPaginatedResponse {
  items: OrderItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function OrdersAdminPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch metrics
  const { data: metrics } = useQuery({
    queryKey: ['order-metrics'],
    queryFn: async () => {
      const res = await api.get('/orders/metrics');
      return res.data;
    },
  });

  // Fetch paginated orders
  const {
    data: paginationData,
    isLoading,
    isPlaceholderData,
  } = useQuery<OrdersPaginatedResponse>({
    queryKey: ['orders', selectedStatus, page, limit, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      params.append('page', String(page));
      params.append('limit', String(limit));

      const res = await api.get(`/orders?${params.toString()}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
    refetchInterval: 7000,
  });

  const orders = paginationData?.items || [];
  const total = paginationData?.total || 0;
  const totalPages = paginationData?.totalPages || 1;

  // Update status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-metrics'] });
    },
  });

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <AlertCircle className="w-3 h-3" /> Yangi (Kutilmoqda)
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <CheckCircle className="w-3 h-3" /> Tasdiqlangan
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" /> Yetkazilgan (Tugatildi)
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Bekor qilingan
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0c0d12] p-5 rounded-2xl border border-white/[0.07]">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <span>Telegram Bot Buyurtmalari</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {total} ta buyurtma
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Mijozlar Telegram botda PC yig‘ib yuborgan buyurtmalar va ularning statuslari
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.07]">
          <div className="text-xs text-zinc-400 font-medium">Jami Buyurtmalar</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {metrics?.totalOrders ?? total}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0d12] border border-amber-500/20">
          <div className="text-xs text-amber-300 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Kutilayotgan Buyurtmalar
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono mt-1">
            {metrics?.pendingOrders ?? 0}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0c0d12] border border-emerald-500/20">
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Muvaffaqiyatli Yetkazilgan
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {metrics?.completedOrders ?? 0}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {STATUS_OPTIONS.map((opt) => {
            const isActive = selectedStatus === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 border border-indigo-500/40'
                    : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-white/[0.06]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Mijoz ismi yoki telefoni..."
            className="w-full bg-[#0c0d12] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-[#0c0d12] border border-white/[0.07] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-3">Mijoz</th>
                <th className="py-3 px-3">Telefon</th>
                <th className="py-3 px-3">Umumiy Narx</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Vaqt</th>
                <th className="py-3 px-3 text-right">Statusni O‘zgartirish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-zinc-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Buyurtmalar yuklanmoqda...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    Hech qanday buyurtma topilmadi.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      isPlaceholderData ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-indigo-400 shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{order.customerName}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            ID: {order.telegramUserId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-zinc-500" />
                        <span>{order.customerPhone}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="font-semibold text-emerald-400">
                        ${Number(order.totalPriceUsd).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {Number(order.totalPriceUzs).toLocaleString()} UZS
                      </div>
                    </td>

                    <td className="py-3 px-3">{getStatusBadge(order.status)}</td>

                    <td className="py-3 px-3 text-zinc-400 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString('uz-UZ', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          statusMutation.mutate({
                            id: order.id,
                            status: e.target.value,
                          })
                        }
                        className="bg-zinc-900 border border-white/[0.08] text-xs text-zinc-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        <option value="PENDING">Kutilmoqda</option>
                        <option value="CONFIRMED">Tasdiqlash</option>
                        <option value="COMPLETED">Tugatish</option>
                        <option value="CANCELLED">Bekor qilish</option>
                      </select>
                    </td>
                  </tr>
                ))
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
