'use client';

import React from 'react';
import AuthGuard from '@/components/auth/auth-guard';
import Sidebar from '@/components/layout/sidebar';
import TopHeader from '@/components/layout/top-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      {/* Root Layout: Fixed to Viewport, outer window NEVER scrolls */}
      <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 antialiased select-none">
        {/* Left Independent Sidebar */}
        <Sidebar />

        {/* Right Application Shell */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Header: Always pinned at the top */}
          <TopHeader />

          {/* Main Content: Only this container scrolls independently */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-zinc-950/50">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
