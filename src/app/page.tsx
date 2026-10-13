'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      router.replace('/admin/components');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-500">
      <div className="flex items-center gap-3">
        <span className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Yuklanmoqda...</span>
      </div>
    </div>
  );
}
