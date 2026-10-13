'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { initialize } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initialize();
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
    } else {
      setMounted(true);
    }
  }, [router, initialize]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Avtorizatsiya tekshirilmoqda...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
