'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function KurirSidebar() {
  const { kurirTab, setKurirTab, courierTasks } = useApp();

  const pendingTasks = courierTasks.filter((t) => t.status !== 'COMPLETED').length;

  return (
    <aside className="bg-white border-b md:border-b-0 md:border-r border-[#e2e8f0] flex flex-col gap-2 w-full md:w-60 md:min-h-[calc(100vh-61px)] shrink-0 px-4 py-3 md:p-5 md:pt-8 select-none">
      <div className="hidden md:block pb-2">
        <h1 className="font-bold text-[#0f2342] text-lg tracking-tight flex items-center gap-2">
          ✦ Iqbal Laundry
        </h1>
        <p className="font-medium text-[#64748b] text-[11px] uppercase tracking-wider mt-1">
          KURIR OPERASIONAL
        </p>
      </div>

      <nav className="flex flex-row md:flex-col gap-1.5 md:mt-2 overflow-x-auto pb-1 md:pb-0">
        {/* Tab · Jadwal */}
        <button
          type="button"
          onClick={() => setKurirTab('JADWAL')}
          className={`flex items-center justify-between gap-2 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-colors text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            kurirTab === 'JADWAL'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {kurirTab === 'JADWAL' && <span className="size-1.5 rounded-full bg-[#2562eb] shrink-0" />}
            <span>Jadwal</span>
          </div>
          {pendingTasks > 0 && (
            <span className="bg-blue-100 text-[#2562eb] text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums">
              {pendingTasks}
            </span>
          )}
        </button>

        {/* Tab · Rute */}
        <button
          type="button"
          onClick={() => setKurirTab('RUTE')}
          className={`flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-colors text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            kurirTab === 'RUTE'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
          }`}
        >
          {kurirTab === 'RUTE' && <span className="size-1.5 rounded-full bg-[#2562eb] shrink-0" />}
          <span>Rute</span>
        </button>

        {/* Tab · Tugas */}
        <button
          type="button"
          onClick={() => setKurirTab('TUGAS')}
          className={`flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-colors text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            kurirTab === 'TUGAS'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
          }`}
        >
          {kurirTab === 'TUGAS' && <span className="size-1.5 rounded-full bg-[#2562eb] shrink-0" />}
          <span>Tugas</span>
        </button>

        {/* Tab · Profil */}
        <button
          type="button"
          onClick={() => setKurirTab('PROFIL')}
          className={`flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-colors text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            kurirTab === 'PROFIL'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
          }`}
        >
          {kurirTab === 'PROFIL' && <span className="size-1.5 rounded-full bg-[#2562eb] shrink-0" />}
          <span>Profil</span>
        </button>
      </nav>

      {/* Courier Status Card */}
      <div className="hidden md:block mt-auto bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <p className="font-semibold text-[#0f2342]">Kurir Aktif</p>
        </div>
        <p className="text-[#64748b] mt-1">Armada: Motor B 4321 KZA</p>
        <p className="text-[#64748b]">Zona: Bandung Kota</p>
      </div>
    </aside>
  );
}
