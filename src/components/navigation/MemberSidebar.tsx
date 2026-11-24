'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function MemberSidebar() {
  const { memberTab, setMemberTab } = useApp();

  return (
    <aside className="bg-white border-b md:border-b-0 md:border-r border-[#e2e8f0] flex flex-col gap-2 w-full md:w-60 md:min-h-[calc(100vh-61px)] shrink-0 px-4 py-3 md:p-5 md:pt-8 select-none">
      <div className="hidden md:block pb-2">
        <h1 className="font-bold text-[#0f2342] text-lg tracking-tight flex items-center gap-2">
          ✦ Iqbal Laundry
        </h1>
        <p className="font-medium text-[#64748b] text-[11px] uppercase tracking-wider mt-1">
          MEMBER
        </p>
      </div>

      <nav className="flex flex-row md:flex-col gap-1.5 md:mt-2 overflow-x-auto pb-1 md:pb-0">
        {/* Tab · Beranda */}
        <button
          type="button"
          onClick={() => setMemberTab('BERANDA')}
          className={`flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-colors text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            memberTab === 'BERANDA'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
          }`}
        >
          {memberTab === 'BERANDA' && <span className="size-1.5 rounded-full bg-[#2562eb] shrink-0" />}
          <span>Beranda</span>
        </button>

        {/* Tab · Riwayat */}
        <button
          type="button"
          onClick={() => setMemberTab('RIWAYAT')}
          className={`flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-colors text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            memberTab === 'RIWAYAT'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
          }`}
        >
          {memberTab === 'RIWAYAT' && <span className="size-1.5 rounded-full bg-[#2562eb] shrink-0" />}
          <span>Riwayat</span>
        </button>

        {/* Tab · Voucher */}
        <button
          type="button"
          onClick={() => setMemberTab('VOUCHER')}
          className={`flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-colors text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            memberTab === 'VOUCHER'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
          }`}
        >
          {memberTab === 'VOUCHER' && <span className="size-1.5 rounded-full bg-[#2562eb] shrink-0" />}
          <span>Voucher</span>
        </button>

        {/* Tab · Profil */}
        <button
          type="button"
          onClick={() => setMemberTab('PROFIL')}
          className={`flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-colors text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            memberTab === 'PROFIL' || memberTab === 'LOGIN' || memberTab === 'DAFTAR'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
          }`}
        >
          {(memberTab === 'PROFIL' || memberTab === 'LOGIN' || memberTab === 'DAFTAR') && (
            <span className="size-1.5 rounded-full bg-[#2562eb] shrink-0" />
          )}
          <span>Profil & Akun</span>
        </button>
      </nav>

      {/* Member Points Card */}
      <div className="hidden md:block mt-auto bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-xl p-3.5 text-xs">
        <p className="font-semibold text-[#0f2342]">Member Gold</p>
        <p className="text-[#64748b] mt-0.5">Poin Loyalitas</p>
        <p className="text-[#2562eb] font-bold text-base mt-1 tabular-nums">1.250 Poin</p>
        <Link
          href="/dashboard"
          className="mt-3 block text-center w-full py-1.5 bg-white border border-blue-200 text-[#2562eb] rounded-lg font-medium text-[11px] hover:bg-blue-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
        >
          Order Cepat (Tamu)
        </Link>
      </div>
    </aside>
  );
}
