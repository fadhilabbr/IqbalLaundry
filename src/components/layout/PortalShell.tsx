'use client';

import React from 'react';
import RoleSwitcher from '@/components/navigation/RoleSwitcher';

interface PortalShellProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function PortalShell({ sidebar, children }: PortalShellProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#f5f8fc]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[110] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#2562eb] focus:text-white focus:text-xs focus:font-bold focus:shadow-md"
      >
        Langsung ke konten utama
      </a>

      <RoleSwitcher />

      <main
        id="main-content"
        className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col md:flex-row overflow-hidden border-x border-[#cbd5e1]/40 shadow-[0_1px_3px_rgba(15,35,66,0.06)] bg-white min-h-[calc(100dvh-105px)]"
      >
        {sidebar}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>

      <footer className="w-full bg-white border-t border-[#e2e8f0] py-3 px-4 text-center text-xs text-[#64748b]">
        © 2026 Iqbal Laundry · Layanan Laundry Antar-Jemput Profesional
      </footer>
    </div>
  );
}
