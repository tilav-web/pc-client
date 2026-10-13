'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Brain,
  RefreshCw,
  Search,
  Sparkles,
  CheckCircle2,
  Database,
  Sliders,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function VectorAdminPage() {
  const queryClient = useQueryClient();
  const [testQuery, setTestQuery] = useState(
    "CS2 va Cyberpunk uchun kuchli videokarta",
  );

  // Fetch Vector stats
  const { data: stats } = useQuery({
    queryKey: ['vector-stats'],
    queryFn: async () => {
      const res = await api.get('/vector/stats');
      return res.data;
    },
    refetchInterval: 10000,
  });

  // Re-sync mutation
  const resyncMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/vector/resync');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vector-stats'] });
    },
  });

  // Test Semantic Search mutation
  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const res = await api.post('/vector/search', { query, topK: 6 });
      return res.data;
    },
  });

  const handleTestSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (testQuery.trim()) {
      searchMutation.mutate(testQuery);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Telegram Bot RAG & Semantic Memory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-cyan-400" /> AI Vector Baza Boshqaruvi
            </h1>
            <p className="text-sm text-zinc-400 mt-1 max-w-3xl">
              Har bir mahsulot kiritilganda yoki narxi o'zgarganda vector embeddinglar avtomatik yangilanadi. Telegram bot mijoz so'rovlarini tushunishi uchun ushbu vector bazadan foydalanadi.
            </p>
          </div>

          <button
            type="button"
            onClick={() => resyncMutation.mutate()}
            disabled={resyncMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${resyncMutation.isPending ? 'animate-spin' : ''}`}
            />
            {resyncMutation.isPending ? 'Sinxronlanmoqda...' : 'Qayta Vektorlashtirish'}
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Jami Detallar
              </span>
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats?.totalComponents ?? 0} ta
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Vektorlashtirilgan
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {stats?.indexedComponents ?? 0} / {stats?.totalComponents ?? 0}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              100% to'liq indekslangan
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Vektor O'lchami
              </span>
              <Sliders className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats?.dimension ?? 64}D
            </div>
            <div className="text-xs text-zinc-500 mt-1">L2 Normalized Vector</div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold">
                Baza Holati
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-2xl font-black text-emerald-400">FAOL (ACTIVE)</div>
            <div className="text-xs text-zinc-500 mt-1">
              Oxirgi yangilanish: {stats?.lastSyncAt ? new Date(stats.lastSyncAt).toLocaleTimeString() : 'Hozir'}
            </div>
          </div>
        </div>

        {/* Semantic Search Test Sandbox */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Telegram Bot Qidiruv Testi (Semantic Sandbox)
              </h2>
              <p className="text-xs text-zinc-400">
                Mijoz botga yozishi mumkin bo'lgan so'rovni kiritib, AI vector baza qaysi mahsulotlarni eng mos deb topishini sinab ko'ring.
              </p>
            </div>
          </div>

          <form onSubmit={handleTestSearch} className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Masalan: Oq korpus aquarium yoki 1440p o'yin videokarta"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={searchMutation.isPending}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm transition-all disabled:opacity-50 shrink-0"
            >
              {searchMutation.isPending ? 'Qidirilmoqda...' : 'Sinab Ko‘rish'}
            </button>
          </form>

          {/* Quick Preset Queries */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs text-zinc-500 self-center">Namuna so'rovlar:</span>
            {[
              "O'yin uchun arzon videokarta",
              "Oq rangli aquarium korpus",
              "DDR5 32GB tezkor xotira",
              "Render uchun 20 yadroli protsessor",
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setTestQuery(q);
                  searchMutation.mutate(q);
                }}
                className="text-xs px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-750 border border-zinc-750 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Search Results */}
          {searchMutation.data && (
            <div className="border-t border-zinc-800/80 pt-6">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Topilgan Natijalar (Cosine Similarity bo'yicha saralangan):</span>
                <span className="text-cyan-400 font-mono">
                  {searchMutation.data.length} ta mos keldi
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchMutation.data.map((item: any) => {
                  const comp = item.component;
                  const similarity = Math.round(item.score * 100);
                  return (
                    <div
                      key={comp.id}
                      className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-cyan-400 font-bold">
                            {comp.category}
                          </span>
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {similarity}% Moslik
                          </span>
                        </div>
                        <div className="font-semibold text-white text-sm">
                          {comp.name}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs">
                        <span className="text-zinc-400">
                          Omborda: <b>{comp.stockQuantity} dona</b>
                        </span>
                        <span className="font-bold text-white">
                          ${Number(comp.priceUsd).toFixed(0)} ({Number(comp.priceUzs).toLocaleString()} so'm)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
