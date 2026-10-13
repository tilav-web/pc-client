'use client';

import React, { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import {
  Layers,
  Plus,
  Trash2,
  Search,
  X,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { api } from '@/lib/api';
import Pagination from '@/components/ui/pagination';

const DEFAULT_CATEGORIES = [
  'ALL',
  'CPU',
  'GPU',
  'MOTHERBOARD',
  'RAM',
  'STORAGE',
  'PSU',
  'CASE',
  'COOLER',
];

interface ComponentItem {
  id: string;
  name: string;
  category: string;
  priceUsd: number;
  priceUzs: number;
  stockQuantity: number;
  imageUrl?: string;
  specs?: Record<string, any>;
  createdAt: string;
}

interface PaginatedResponse {
  items: ComponentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ComponentsAdminPage() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('CPU');
  const [priceUsd, setPriceUsd] = useState<number>(120);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [socket, setSocket] = useState('');
  const [vram, setVram] = useState('');
  const [formError, setFormError] = useState('');

  // Fetch dynamic categories
  const { data: dbCategories = [] } = useQuery<{ code: string; nameUz: string }[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
  });

  // Fetch settings for dynamic USD rate
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ['settings-rate'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data;
    },
  });

  const exchangeRate = Number(settings?.usd_to_uzs_rate) || 12800;

  const categoryCodes =
    dbCategories.length > 0
      ? ['ALL', ...dbCategories.map((c) => c.code)]
      : DEFAULT_CATEGORIES;

  // React Query with server-side pagination and keepPreviousData
  const { data: paginationData, isLoading, isPlaceholderData } = useQuery<PaginatedResponse>({
    queryKey: ['components', activeCategory, page, limit, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory !== 'ALL') params.append('category', activeCategory);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      params.append('page', String(page));
      params.append('limit', String(limit));

      const res = await api.get(`/components?${params.toString()}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const components = paginationData?.items || [];
  const total = paginationData?.total || 0;
  const totalPages = paginationData?.totalPages || 1;

  // Handlers for category and search changes (resets to page 1)
  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  // Create component mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Komponent nomini kiriting');
      const specs: Record<string, any> = {};
      if (socket.trim()) specs.socket = socket.trim();
      if (vram.trim()) specs.vram = vram.trim();

      await api.post('/components', {
        name: name.trim(),
        category,
        priceUsd: Number(priceUsd),
        priceUzs: Math.round(Number(priceUsd) * exchangeRate),
        stockQuantity: Number(stockQuantity),
        specs,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      setIsModalOpen(false);
      setName('');
      setSocket('');
      setVram('');
      setFormError('');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
    },
  });

  // Delete component mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/components/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0c0d12] p-5 rounded-2xl border border-white/[0.07]">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Ehtiyot Qismlar Ombori</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {total} ta mavjud
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Do‘konda mavjud barcha detallar, ularning narxlari va qoldiq monitoringi
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Detal Qo‘shish</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categoryCodes.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 border border-indigo-500/40'
                    : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Detal nomi bo‘yicha qidirish (masalan: RTX 4060, i5-13400)..."
            className="w-full bg-[#0c0d12] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#0c0d12] border border-white/[0.07] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-3">Mahsulot Nomi</th>
                <th className="py-3 px-3">Kategoriya</th>
                <th className="py-3 px-3">Narxi (USD)</th>
                <th className="py-3 px-3">Narxi (UZS)</th>
                <th className="py-3 px-3">Qoldiq</th>
                <th className="py-3 px-3">Texnik Xususiyat</th>
                <th className="py-3 px-3 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-zinc-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Ma‘lumotlar yuklanmoqda...
                  </td>
                </tr>
              ) : components.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    Hech qanday detal topilmadi.
                  </td>
                </tr>
              ) : (
                components.map((comp) => (
                  <tr
                    key={comp.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      isPlaceholderData ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-medium text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/[0.06] flex items-center justify-center text-indigo-400 shrink-0">
                        <Cpu className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate max-w-xs">{comp.name}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/[0.06]">
                        {comp.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-emerald-400">
                      ${Number(comp.priceUsd).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-zinc-400">
                      {Number(comp.priceUzs).toLocaleString()} so‘m
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          comp.stockQuantity < 3 ? 'text-amber-400' : 'text-zinc-300'
                        }`}
                      >
                        {comp.stockQuantity} dona
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-400 text-[11px] font-mono">
                      {comp.specs?.socket && <span>Soket: {comp.specs.socket} </span>}
                      {comp.specs?.vram && <span>VRAM: {comp.specs.vram} </span>}
                      {comp.specs?.type && <span>Tip: {comp.specs.type}</span>}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`"${comp.name}" detalini o‘chirishga ishonchingiz komilmi?`)) {
                            deleteMutation.mutate(comp.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
          onPageChange={(newPage) => setPage(newPage)}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#101117] border border-white/[0.08] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Yangi Detal Qo‘shish
            </h3>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Nomi</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Intel Core i5-14400F"
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">Kategoriya</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {categoryCodes
                    .filter((c) => c !== 'ALL')
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Narxi ($ USD)
                  </label>
                  <input
                    type="number"
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block font-mono">
                    ≈ {(priceUsd * exchangeRate).toLocaleString()} UZS
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Ombordagi Soni
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Soket (CPU / Mobo)
                  </label>
                  <input
                    type="text"
                    value={socket}
                    onChange={(e) => setSocket(e.target.value)}
                    placeholder="LGA1700, AM5..."
                    className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    VRAM (GPU)
                  </label>
                  <input
                    type="text"
                    value={vram}
                    onChange={(e) => setVram(e.target.value)}
                    placeholder="8GB, 16GB..."
                    className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
