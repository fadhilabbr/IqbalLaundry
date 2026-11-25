'use client';

import React from 'react';

interface PortalShellProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function PortalShell({ sidebar, children }: PortalShellProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#f5f8fc] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[110] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#2562eb] focus:text-white focus:text-xs focus:font-semibold focus:shadow-md focus:outline-none focus:ring-2 focus:ring-[#2562eb]/40"
      >
        Langsung ke konten utama
      </a>

      <main
        id="main-content"
        className="flex-1 w-full flex flex-col md:flex-row md:items-start bg-[#f5f8fc]"
      >
        {sidebar}
        <div className="flex-1 min-w-0 w-full">{children}</div>
      </main>

      <footer className="md:hidden w-full bg-white border-t border-[#e2e8f0] py-4 px-4 text-center text-xs text-[#64748b] tabular-nums">
        © 2026 Iqbal Laundry · Layanan Laundry Antar-Jemput Profesional
      </footer>
    </div>
  );
}
