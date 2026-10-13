'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  DollarSign,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Save,
  CheckCircle,
  AlertCircle,
  Calculator,
  Brain,
  Eye,
  EyeOff,
  ExternalLink,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function SettingsAdminPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({
    usd_to_uzs_rate: '12800',
    store_name: 'PC Master Pro Gaming & Workstation',
    store_phone: '+998 90 123 45 67',
    store_address: 'Toshkent sh., Malika savdo markazi, A-12 do`kon',
    store_telegram_admin: '@pcmaster_admin',
    gemini_api_key: '',
    telegram_bot_token: '',
    telegram_order_group_id: '',
    bot_welcome_uz: '',
    bot_welcome_ru: '',
    bot_purposes:
      'GAMING:O`yinlar (Gaming)|OFFICE:Ofis va o`qish|RENDER:3D Render & Video montaj|CYBERSPORT:Kibersport & Strim',
  });

  const [testUsd, setTestUsd] = useState<number>(850);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [botReloadMessage, setBotReloadMessage] = useState('');

  // Fetch settings from API
  const { data: settings = {}, isLoading } = useQuery<Record<string, string>>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data;
    },
  });

  // Fetch bot status
  const { data: botStatus, refetch: refetchBotStatus } = useQuery<{
    isRunning: boolean;
    botUsername?: string;
  }>({
    queryKey: ['bot-status'],
    queryFn: async () => {
      const res = await api.get('/telegram/bot/status');
      return res.data;
    },
    refetchInterval: 8000,
  });

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData((prev) => ({
        ...prev,
        ...settings,
      }));
    }
  }, [settings]);

  // Mutation to update settings
  const updateMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      await api.patch('/settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Saqlashda xatolik yuz berdi',
      );
    },
  });

  // Mutation to reload/restart telegram bot
  const restartBotMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/telegram/bot/restart');
      return res.data;
    },
    onSuccess: (data: any) => {
      refetchBotStatus();
      setBotReloadMessage(data.message || 'Bot yangilandi');
      setTimeout(() => setBotReloadMessage(''), 5000);
    },
    onError: (err: any) => {
      setBotReloadMessage(err.response?.data?.message || 'Botni qayta ishga tushirishda xatolik');
    },
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    updateMutation.mutate(formData);
  };

  const currentRate = Number(formData.usd_to_uzs_rate) || 12800;
  const calculatedUzs = (testUsd * currentRate).toLocaleString();
  const hasGeminiKey = Boolean(formData.gemini_api_key && formData.gemini_api_key.trim().length > 5);
  const hasBotToken = Boolean(formData.telegram_bot_token && formData.telegram_bot_token.trim().length > 10);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c0d12] p-5 rounded-2xl border border-white/[0.07]">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>Do‘kon va Bot Tizim Sozlamalari</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Telegram bot tokeni, buyurtma guruhi ID si, Google Gemini AI va valyuta kursi boshqaruvi
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-pulse">
            <CheckCircle className="w-4 h-4" />
            <span>Sozlamalar saqlandi!</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. TELEGRAM BOT TOKEN VA BUYURTMA GURUHI SOZLAMALARI */}
        <div className="bg-[#0c0d12] border border-white/[0.07] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Telegram Bot & Buyurtma Guruhi</span>
                  {botStatus?.isRunning ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Bot Faol {botStatus.botUsername ? `(@${botStatus.botUsername})` : ''}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                      To‘xtatilgan (Token kiritilmagan)
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Telegram bot tokeni va buyurtmalar avtomatik kelib tushadigan admin guruhi
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => restartBotMutation.mutate()}
              disabled={restartBotMutation.isPending || !hasBotToken}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-white/[0.08] transition-colors disabled:opacity-40"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-indigo-400 ${
                  restartBotMutation.isPending ? 'animate-spin' : ''
                }`}
              />
              <span>Botni Qayta Ishga Tushirish</span>
            </button>
          </div>

          {botReloadMessage && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>{botReloadMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                <span>Telegram Bot Token:</span>
                <span className="text-[10px] text-zinc-500 font-mono">@BotFather</span>
              </label>
              <div className="relative">
                <input
                  type={showBotToken ? 'text' : 'password'}
                  value={formData.telegram_bot_token || ''}
                  onChange={(e) => handleChange('telegram_bot_token', e.target.value)}
                  placeholder="123456789:ABCdefGHIjklMNOpqrs..."
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-3.5 pr-11 py-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowBotToken(!showBotToken)}
                  className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300"
                >
                  {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Telegramdagi <strong>@BotFather</strong> dan olingan rasmiy API token.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                <span>Buyurtmalar Guruhi yoki Kanal ID si:</span>
                <span className="text-[10px] text-zinc-500 font-mono">Masalan: -100...</span>
              </label>
              <input
                type="text"
                value={formData.telegram_order_group_id || ''}
                onChange={(e) => handleChange('telegram_order_group_id', e.target.value)}
                placeholder="-1001234567890"
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Yangi buyurtma tushganda bot ushbu Telegram guruhga to‘liq xabar yuboradi. Botni guruhga qo‘shib, admin qilishingiz kerak.
              </p>
            </div>
          </div>
        </div>

        {/* 2. GOOGLE GEMINI AI DEVELOPER TOKEN (TEKIN LIMIT) */}
        <div className="bg-[#0c0d12] border border-white/[0.07] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Google Gemini AI (Bepul Developer Token)</span>
                  {hasGeminiKey ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Token Faol
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                      Kiritilmagan (Standart rejimda)
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Kompyuter yig‘ish tahlillari va tushuntirishlarini professional AI orqali yozdirish
                </p>
              </div>
            </div>

            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              <span>Bepul Key olish</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-300">
              Gemini API Key (Google AI Studio Developer Token):
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.gemini_api_key || ''}
                onChange={(e) => handleChange('gemini_api_key', e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl pl-4 pr-11 py-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Google AI Studio da ro‘yxatdan o‘tib, tekin <strong>Gemini 1.5/2.0 Flash</strong> API tokenini yarating. Tekin rejimi kuniga 1,500 ta so‘rov (daqiqasiga 15 RPM) gacha bepul taqdim etadi.
            </p>
          </div>
        </div>

        {/* 3. VALYUTA KURSI (USD -> UZS) */}
        <div className="bg-[#0c0d12] border border-white/[0.07] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Valyuta Kursi (USD &rarr; UZS)</h2>
                <p className="text-[11px] text-zinc-400">
                  Ombordagi qismlar va Telegram botda narxlar avtomatik ushbu kurs bo‘yicha hisoblanadi
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-medium px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              1 USD = {currentRate.toLocaleString()} UZS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Joriy Kurs (1 AQSH dollari so‘mda):
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.usd_to_uzs_rate || ''}
                  onChange={(e) => handleChange('usd_to_uzs_rate', e.target.value)}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
                  required
                />
                <span className="absolute right-3.5 top-3 text-xs text-zinc-500 font-mono">
                  SO‘M
                </span>
              </div>
            </div>

            {/* Quick Calculator preview */}
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/[0.06] flex items-center gap-3">
              <Calculator className="w-5 h-5 text-indigo-400 shrink-0" />
              <div className="flex-1">
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
                  Tezkor Kalkulyator
                </div>
                <div className="text-xs text-zinc-200 mt-0.5 flex items-center gap-2">
                  <span>${testUsd} PC narxi:</span>
                  <span className="font-bold font-mono text-emerald-400 text-sm">
                    {calculatedUzs} UZS
                  </span>
                </div>
              </div>
              <input
                type="number"
                value={testUsd}
                onChange={(e) => setTestUsd(Number(e.target.value))}
                className="w-16 bg-zinc-900 border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-right font-mono text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. DO'KON MA'LUMOTLARI */}
        <div className="bg-[#0c0d12] border border-white/[0.07] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Do‘kon Ma‘lumotlari va Aloqa</h2>
              <p className="text-[11px] text-zinc-400">
                Telegram bot orqali buyurtma berganda mijozga ko‘rsatiladigan rasmiy ma‘lumotlar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Do‘kon Nomi
              </label>
              <input
                type="text"
                value={formData.store_name || ''}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Telefon Raqam
              </label>
              <input
                type="text"
                value={formData.store_phone || ''}
                onChange={(e) => handleChange('store_phone', e.target.value)}
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                Do‘kon Manzili (Lokatsiya)
              </label>
              <input
                type="text"
                value={formData.store_address || ''}
                onChange={(e) => handleChange('store_address', e.target.value)}
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-indigo-400" />
                Telegram Admin Username
              </label>
              <input
                type="text"
                value={formData.store_telegram_admin || ''}
                onChange={(e) => handleChange('store_telegram_admin', e.target.value)}
                placeholder="@username"
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 5. TELEGRAM BOT MATNLARI (UZ & RU) */}
        <div className="bg-[#0c0d12] border border-white/[0.07] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Telegram Bot Xabarlari (2 Tilda)</h2>
              <p className="text-[11px] text-zinc-400">
                Mijoz botni /start qilganda va tilni tanlaganda yuboriladigan salomlashuv matnlari
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                O‘zbekcha Salomlashuv (UZ)
              </label>
              <textarea
                rows={3}
                value={formData.bot_welcome_uz || ''}
                onChange={(e) => handleChange('bot_welcome_uz', e.target.value)}
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Ruscha Salomlashuv (RU)
              </label>
              <textarea
                rows={3}
                value={formData.bot_welcome_ru || ''}
                onChange={(e) => handleChange('bot_welcome_ru', e.target.value)}
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center justify-between">
              <span>PC Yig‘ish Maqsadlari (Tugmalar formati: KOD:Nomi|KOD2:Nomi2)</span>
              <span className="text-[10px] text-zinc-500">Bot va AI da ishlatiladi</span>
            </label>
            <input
              type="text"
              value={formData.bot_purposes || ''}
              onChange={(e) => handleChange('bot_purposes', e.target.value)}
              className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={updateMutation.isPending || isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{updateMutation.isPending ? 'Saqlanmoqda...' : 'Barcha Sozlamalarni Saqlash'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
