'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Cpu, Image, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function BuildsArchivePage() {
  const { data: builds = [], isLoading } = useQuery({
    queryKey: ['builds-archive'],
    queryFn: async () => {
      const res = await api.get('/builder/builds');
      return res.data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Cpu className="w-7 h-7 text-cyan-400" /> AI Generatsiya Qilingan PC Konfiguratsiyalar
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          MinIO va PostgreSQL bazasida kesh qilingan kompyuterlar to'plami. Bir xil parametrli yangi so'rovlar uchun tasvir qayta generatsiya qilinmasdan, tayyor keshdan olinadi.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-zinc-500">Yuklanmoqda...</div>
      ) : builds.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
          <Image className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-white font-semibold">Hali saqlangan konfiguratsiyalar mavjud emas</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Bosh sahifada yoki Telegram botda biror PC yig'ilsa, bu yerda arxivi paydo bo'ladi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {builds.map((build: any) => (
            <div
              key={build.id}
              className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-xl hover:border-cyan-500/50 transition-all flex flex-col"
            >
              <div className="relative aspect-video w-full bg-zinc-950">
                <img
                  src={build.generatedImageUrl}
                  alt="PC build"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950/80 text-cyan-400 border border-cyan-500/30">
                    HASH: {build.buildHash?.slice(0, 8)}...
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-zinc-950/90 text-right">
                  <div className="text-xs font-bold text-white">
                    {Number(build.totalPriceUzs).toLocaleString()} so'm
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {build.purpose}
                    </span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> Keshda mavjud
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-300">
                    <div>
                      <b className="text-zinc-500">CPU:</b> {build.components?.cpu?.name}
                    </div>
                    <div>
                      <b className="text-zinc-500">GPU:</b> {build.components?.gpu?.name}
                    </div>
                    <div>
                      <b className="text-zinc-500">RAM:</b> {build.components?.ram?.name}
                    </div>
                    <div>
                      <b className="text-zinc-500">Case:</b> {build.components?.case?.name}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500">
                  Yaratilgan vaqti: {new Date(build.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
