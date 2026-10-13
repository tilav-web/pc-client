'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  XCircle,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';

interface CategoryItem {
  id: string;
  code: string;
  nameUz: string;
  nameRu: string;
  icon: string;
  isRequiredForBuild: boolean;
  isSystem: boolean;
  sortOrder: number;
}

export default function CategoriesAdminPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [nameUz, setNameUz] = useState('');
  const [nameRu, setNameRu] = useState('');
  const [icon, setIcon] = useState('Box');
  const [isRequiredForBuild, setIsRequiredForBuild] = useState(false);
  const [sortOrder, setSortOrder] = useState<number>(10);
  const [formError, setFormError] = useState('');

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery<CategoryItem[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setCode('');
    setNameUz('');
    setNameRu('');
    setIcon('Box');
    setIsRequiredForBuild(false);
    setSortOrder((categories.length + 1) * 1);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCode(cat.code);
    setNameUz(cat.nameUz);
    setNameRu(cat.nameRu);
    setIcon(cat.icon);
    setIsRequiredForBuild(cat.isRequiredForBuild);
    setSortOrder(cat.sortOrder);
    setFormError('');
    setIsModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!nameUz.trim() || !nameRu.trim()) {
        throw new Error('O‘zbekcha va ruscha nomlarni kiriting');
      }

      if (editingCategory) {
        await api.patch(`/categories/${editingCategory.id}`, {
          nameUz: nameUz.trim(),
          nameRu: nameRu.trim(),
          icon: icon.trim(),
          isRequiredForBuild,
          sortOrder: Number(sortOrder),
          ...(editingCategory.isSystem ? {} : { code: code.trim().toUpperCase() }),
        });
      } else {
        if (!code.trim()) {
          throw new Error('Kategoriya kodini kiriting (masalan: MONITOR)');
        }
        await api.post('/categories', {
          code: code.trim().toUpperCase(),
          nameUz: nameUz.trim(),
          nameRu: nameRu.trim(),
          icon: icon.trim(),
          isRequiredForBuild,
          sortOrder: Number(sortOrder),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsModalOpen(false);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Kategoriyani o‘chirib bo‘lmadi');
    },
  });

  const filteredCategories = categories.filter(
    (c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nameUz.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nameRu.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Kategoriyalar Boshqaruvi
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              {categories.length} ta kategoriya
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            PC ehtiyot qismlari va do‘kondagi barcha mahsulot toifalari, bot va AI roli
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          Yangi Kategoriya Qo‘shish
        </button>
      </div>

      {/* Info notice about hybrid system */}
      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200">
          <p className="font-semibold text-white">Gibrid Kategoriya Tizimi faol:</p>
          <p className="text-zinc-300 mt-0.5">
            Asosiy apparat qismlari (CPU, GPU, RAM va h.k.) AI va PC yig‘ish algoritmi uchun tizim roli sifatida himoyalangan. Do‘kon uchun yangi ixtiyoriy toifalar (Monitor, Klaviatura, Periferiya) erkin qo‘shilishi va o‘chirilishi mumkin.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Kategoriya kodi yoki nomi bo‘yicha izlash..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Categories Table */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 bg-zinc-950/60 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Tartib</th>
                <th className="py-3.5 px-4">Kodi (Role)</th>
                <th className="py-3.5 px-4">O‘zbekcha Nomi</th>
                <th className="py-3.5 px-4">Ruscha Nomi</th>
                <th className="py-3.5 px-4">Yig‘ishda Majburiy</th>
                <th className="py-3.5 px-4">Turi</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-xs text-zinc-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    Kategoriyalar yuklanmoqda...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    Kategoriya topilmadi
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-400">{cat.sortOrder}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">
                        {cat.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">{cat.nameUz}</td>
                    <td className="py-3 px-4 text-zinc-300">{cat.nameRu}</td>
                    <td className="py-3 px-4">
                      {cat.isRequiredForBuild ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Majburiy qism
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400">
                          <XCircle className="w-3 h-3" /> Ixtiyoriy
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {cat.isSystem ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          <ShieldCheck className="w-3 h-3" /> Apparat Tizim
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                          Do‘kon toifasi
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!cat.isSystem && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`"${cat.code}" kategoriyasini o‘chirishga ishonchingiz komilmi?`)) {
                                deleteMutation.mutate(cat.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="O‘chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              {editingCategory ? 'Kategoriyani Tahrirlash' : 'Yangi Kategoriya Qo‘shish'}
            </h2>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Kategoriya Kodi (System Role)
                </label>
                <input
                  type="text"
                  value={code}
                  disabled={editingCategory?.isSystem}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Masalan: MONITOR, KEYBOARD"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  required
                />
                {editingCategory?.isSystem && (
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Tizim asosiy apparat qismining kodini o‘zgartirib bo‘lmaydi.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    O‘zbekcha Nomi
                  </label>
                  <input
                    type="text"
                    value={nameUz}
                    onChange={(e) => setNameUz(e.target.value)}
                    placeholder="Masalan: Monitor"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Ruscha Nomi
                  </label>
                  <input
                    type="text"
                    value={nameRu}
                    onChange={(e) => setNameRu(e.target.value)}
                    placeholder="Masalan: Монитор"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Tartib raqami (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Ikonka kodi
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Box, Monitor, Zap..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-850 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Yig‘ishda majburiymi?</div>
                  <div className="text-[10px] text-zinc-400">
                    PC yig‘ish algoritmi ushbu qismsiz tizimni to‘liq deb hisoblamaydi
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isRequiredForBuild}
                  onChange={(e) => setIsRequiredForBuild(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
