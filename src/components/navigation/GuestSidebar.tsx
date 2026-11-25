'use client';

import React from 'react';
import Link from 'next/link';
import {
  House,
  Basket,
  MagnifyingGlass,
  User,
  SignIn,
  Clock,
  Phone,
} from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';
import SidebarAuthFooter from '@/components/navigation/SidebarAuthFooter';

export default function GuestSidebar() {
  const { guestStep, setGuestStep, currentUser } = useApp();

  const isBeranda = guestStep <= 3;
  const isPesanan = guestStep >= 4 && guestStep <= 12;
  const isLacak = guestStep >= 13;

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
              Portal Pelanggan
            </p>
          </div>
        </Link>
      </div>

      <nav
        aria-label="Navigasi pelanggan"
        className="grid grid-cols-4 md:flex md:flex-col gap-1 md:gap-2"
      >
        {/* Tab Beranda */}
        <button
          type="button"
          onClick={() => setGuestStep(1)}
          aria-current={isBeranda ? 'page' : undefined}
          className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            isBeranda
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
          }`}
        >
          <House size={18} weight={isBeranda ? 'fill' : 'regular'} className="shrink-0" aria-hidden="true" />
          <span>Beranda</span>
          {isBeranda && (
            <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" aria-hidden="true" />
          )}
        </button>

        {/* Tab Pesanan */}
        <button
          type="button"
          onClick={() => setGuestStep(4)}
          aria-current={isPesanan ? 'page' : undefined}
          className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            isPesanan
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
          }`}
        >
          <Basket size={18} weight={isPesanan ? 'fill' : 'regular'} className="shrink-0" aria-hidden="true" />
          <span>Pesanan</span>
          {isPesanan && (
            <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" aria-hidden="true" />
          )}
        </button>

        {/* Tab Lacak */}
        <button
          type="button"
          onClick={() => setGuestStep(14)}
          aria-current={isLacak ? 'page' : undefined}
          className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            isLacak
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
          }`}
        >
          <MagnifyingGlass size={18} weight={isLacak ? 'bold' : 'regular'} className="shrink-0" aria-hidden="true" />
          <span>Lacak</span>
          {isLacak && (
            <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" aria-hidden="true" />
          )}
        </button>

        {/* Mobile-only direct Login tab */}
        <Link
          href="/login"
          className="md:hidden relative flex flex-col items-center justify-center gap-1 min-h-[44px] py-1.5 px-2 rounded-lg text-[11px] font-medium leading-tight transition duration-150 ease-out text-center whitespace-nowrap text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
        >
          {currentUser ? (
            <User size={18} weight="regular" className="shrink-0" aria-hidden="true" />
          ) : (
            <SignIn size={18} weight="bold" className="shrink-0 text-[#2562eb]" aria-hidden="true" />
          )}
          <span>{currentUser ? 'Akun' : 'Masuk'}</span>
        </Link>
      </nav>

      {/* Bottom desktop cards + login/account anchor */}
      <div className="hidden md:flex md:flex-col gap-3 mt-auto">
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 text-xs text-[#475569]">
          <p className="font-semibold text-[#0f2342] mb-1.5 flex items-center gap-1.5">
            <Clock size={14} weight="bold" className="text-[#2562eb] shrink-0" aria-hidden="true" />
            <span>Jam Operasional</span>
          </p>
          <p>Senin - Minggu</p>
          <p className="text-[#2562eb] font-semibold mt-0.5 tabular-nums">08.00 - 21.00 WIB</p>
          <p className="mt-2 pt-2 border-t border-[#e2e8f0] text-[11px] text-[#64748b] flex items-center gap-1.5 tabular-nums">
            <Phone size={13} weight="regular" className="shrink-0" aria-hidden="true" />
            <span>0812-3456-7890</span>
          </p>
        </div>

        <SidebarAuthFooter />
      </div>
    </aside>
  );
}
