'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  MapTrifold,
  ClipboardText,
  User,
} from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';
import SidebarAuthFooter from '@/components/navigation/SidebarAuthFooter';

export default function KurirSidebar() {
  const { kurirTab, setKurirTab, courierTasks } = useApp();

  const pendingTasks = courierTasks.filter((t) => t.status !== 'COMPLETED').length;

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] shadow-[0_-4px_16px_rgba(15,35,66,0.06)] px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:sticky md:top-0 md:bottom-auto md:left-auto md:right-auto md:z-20 md:bg-white md:backdrop-blur-none md:border-t-0 md:border-r md:shadow-none flex flex-col gap-4 w-full md:w-60 md:h-[100dvh] md:overflow-y-auto shrink-0 md:p-4 md:pt-6 select-none">
      <div className="hidden md:block pb-3 border-b border-[#e2e8f0]">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
        >
          <span className="w-8 h-8 rounded-lg bg-[#2562eb] flex items-center justify-center text-white text-sm font-black shrink-0">
            ✦
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#0f2342] tracking-tight group-hover:text-[#2562eb] transition-colors">
              Iqbal Laundry
            </p>
            <p className="text-[11px] text-[#64748b] leading-snug">
              Portal Kurir
            </p>
          </div>
        </Link>
      </div>

      <nav
        aria-label="Navigasi kurir"
        className="grid grid-cols-4 md:flex md:flex-col gap-1 md:gap-2"
      >
        {/* Tab Jadwal */}
        <button
          type="button"
          onClick={() => setKurirTab('JADWAL')}
          aria-current={kurirTab === 'JADWAL' ? 'page' : undefined}
          className={`relative flex flex-col md:flex-row items-center justify-center md:justify-between gap-1 md:gap-2 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            kurirTab === 'JADWAL'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2.5">
            <CalendarCheck
              size={18}
              weight={kurirTab === 'JADWAL' ? 'fill' : 'regular'}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>Jadwal</span>
          </div>
          {pendingTasks > 0 && (
            <span className="absolute top-1 right-2 md:static md:ml-auto bg-blue-100 text-[#2562eb] text-[10px] md:text-[11px] font-bold px-1.5 md:px-2 py-0.5 rounded-full tabular-nums">
              {pendingTasks}
            </span>
          )}
        </button>

        {/* Tab Rute */}
        <button
          type="button"
          onClick={() => setKurirTab('RUTE')}
          aria-current={kurirTab === 'RUTE' ? 'page' : undefined}
          className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            kurirTab === 'RUTE'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
          }`}
        >
          <MapTrifold size={18} weight={kurirTab === 'RUTE' ? 'fill' : 'regular'} className="shrink-0" aria-hidden="true" />
          <span>Rute</span>
          {kurirTab === 'RUTE' && (
            <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" aria-hidden="true" />
          )}
        </button>

        {/* Tab Tugas */}
        <button
          type="button"
          onClick={() => setKurirTab('TUGAS')}
          aria-current={kurirTab === 'TUGAS' ? 'page' : undefined}
          className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            kurirTab === 'TUGAS'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
          }`}
        >
          <ClipboardText size={18} weight={kurirTab === 'TUGAS' ? 'fill' : 'regular'} className="shrink-0" aria-hidden="true" />
          <span>Tugas</span>
          {kurirTab === 'TUGAS' && (
            <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" aria-hidden="true" />
          )}
        </button>

        {/* Tab Profil */}
        <button
          type="button"
          onClick={() => setKurirTab('PROFIL')}
          aria-current={kurirTab === 'PROFIL' ? 'page' : undefined}
          className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            kurirTab === 'PROFIL'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
          }`}
        >
          <User size={18} weight={kurirTab === 'PROFIL' ? 'fill' : 'regular'} className="shrink-0" aria-hidden="true" />
          <span>Profil</span>
          {kurirTab === 'PROFIL' && (
            <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Courier Status Card + Bottom Auth */}
      <div className="hidden md:flex md:flex-col gap-3 mt-auto">
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <p className="font-semibold text-[#0f2342]">Kurir Aktif</p>
          </div>
          <p className="text-[#475569] mt-1.5 tabular-nums">Armada: Motor B 4321 KZA</p>
          <p className="text-[#64748b] mt-0.5">Zona: Bandung Kota</p>
        </div>

        <SidebarAuthFooter />
      </div>
    </aside>
  );
}
