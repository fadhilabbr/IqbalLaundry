'use client';

import React from 'react';
import Link from 'next/link';
import {
  House,
  ClockCounterClockwise,
  Ticket,
  User,
} from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';
import SidebarAuthFooter from '@/components/navigation/SidebarAuthFooter';

export default function MemberSidebar() {
  const { memberTab, setMemberTab } = useApp();

  const isProfilActive =
    memberTab === 'PROFIL' || memberTab === 'LOGIN' || memberTab === 'DAFTAR';

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
              Portal Member
            </p>
          </div>
        </Link>
      </div>

      <nav
        aria-label="Navigasi member"
        className="grid grid-cols-4 md:flex md:flex-col gap-1 md:gap-2"
      >
        {/* Tab Beranda */}
        <button
          type="button"
          onClick={() => setMemberTab('BERANDA')}
          aria-current={memberTab === 'BERANDA' ? 'page' : undefined}
          className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            memberTab === 'BERANDA'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
          }`}
        >
          <House size={18} weight={memberTab === 'BERANDA' ? 'fill' : 'regular'} className="shrink-0" aria-hidden="true" />
          <span>Beranda</span>
          {memberTab === 'BERANDA' && (
            <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" aria-hidden="true" />
          )}
        </button>

        {/* Tab Riwayat */}
        <button
          type="button"
          onClick={() => setMemberTab('RIWAYAT')}
          aria-current={memberTab === 'RIWAYAT' ? 'page' : undefined}
          className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            memberTab === 'RIWAYAT'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
          }`}
        >
          <ClockCounterClockwise
            size={18}
            weight={memberTab === 'RIWAYAT' ? 'bold' : 'regular'}
            className="shrink-0"
            aria-hidden="true"
          />
          <span>Riwayat</span>
          {memberTab === 'RIWAYAT' && (
            <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" aria-hidden="true" />
          )}
        </button>

        {/* Tab Voucher */}
        <button
          type="button"
          onClick={() => setMemberTab('VOUCHER')}
          aria-current={memberTab === 'VOUCHER' ? 'page' : undefined}
          className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            memberTab === 'VOUCHER'
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
          }`}
        >
          <Ticket size={18} weight={memberTab === 'VOUCHER' ? 'fill' : 'regular'} className="shrink-0" aria-hidden="true" />
          <span>Voucher</span>
          {memberTab === 'VOUCHER' && (
            <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" aria-hidden="true" />
          )}
        </button>

        {/* Tab Profil */}
        <button
          type="button"
          onClick={() => setMemberTab('PROFIL')}
          aria-current={isProfilActive ? 'page' : undefined}
          className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            isProfilActive
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
          }`}
        >
          <User size={18} weight={isProfilActive ? 'fill' : 'regular'} className="shrink-0" aria-hidden="true" />
          <span className="md:hidden">Profil</span>
          <span className="hidden md:inline">Profil & Akun</span>
          {isProfilActive && (
            <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Member Points Card + Bottom Auth */}
      <div className="hidden md:flex md:flex-col gap-3 mt-auto">
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-xs">
          <p className="font-semibold text-[#0f2342]">Member Gold</p>
          <p className="text-[#64748b] mt-0.5">Poin Loyalitas</p>
          <p className="text-[#2562eb] font-bold text-base mt-1 tabular-nums">1.250 Poin</p>
          <Link
            href="/dashboard"
            className="mt-3 flex items-center justify-center w-full min-h-[36px] py-1.5 px-3 bg-white border border-[#dce5f0] text-[#2562eb] rounded-lg font-semibold text-xs hover:bg-[#eff6ff] hover:border-[#2562eb]/40 transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
          >
            Order Cepat (Tamu)
          </Link>
        </div>

        <SidebarAuthFooter />
      </div>
    </aside>
  );
}
