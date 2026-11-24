'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkle,
  House,
  Basket,
  MagnifyingGlass,
  User,
  Clock,
  Phone,
} from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';

export default function GuestSidebar() {
  const { guestStep, setGuestStep } = useApp();

  const isBeranda = guestStep <= 3;
  const isPesanan = guestStep >= 4 && guestStep <= 12;
  const isLacak = guestStep >= 13;

  return (
    <aside className="bg-white border-b md:border-b-0 md:border-r border-[#e2e8f0] flex flex-col gap-2 w-full md:w-60 md:min-h-full shrink-0 px-4 py-3 md:p-5 md:pt-8 select-none">
      <div className="hidden md:block pb-2">
        <h1 className="font-bold text-[#0f2342] text-lg tracking-tight flex items-center gap-2">
          <Sparkle size={18} weight="bold" className="text-[#2562eb] shrink-0" />
          <span>Iqbal Laundry</span>
        </h1>
        <p className="font-medium text-[#64748b] text-[11px] uppercase tracking-wider mt-1">
          PELANGGAN TAMU
        </p>
      </div>

      <nav className="flex flex-row md:flex-col gap-1.5 md:mt-2 overflow-x-auto pb-1 md:pb-0">
        {/* Tab Beranda */}
        <button
          type="button"
          onClick={() => setGuestStep(1)}
          className={`flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-all text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            isBeranda
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
          }`}
        >
          <House size={16} weight={isBeranda ? 'bold' : 'regular'} className="shrink-0" />
          <span>Beranda</span>
          {isBeranda && <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" />}
        </button>

        {/* Tab Pesanan */}
        <button
          type="button"
          onClick={() => setGuestStep(4)}
          className={`flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-all text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            isPesanan
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
          }`}
        >
          <Basket size={16} weight={isPesanan ? 'bold' : 'regular'} className="shrink-0" />
          <span>Pesanan</span>
          {isPesanan && <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" />}
        </button>

        {/* Tab Lacak */}
        <button
          type="button"
          onClick={() => setGuestStep(14)}
          className={`flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-all text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
            isLacak
              ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
              : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
          }`}
        >
          <MagnifyingGlass size={16} weight={isLacak ? 'bold' : 'regular'} className="shrink-0" />
          <span>Lacak</span>
          {isLacak && <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" />}
        </button>

        {/* Tab Member */}
        <Link
          href="/member"
          className="flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-all text-left whitespace-nowrap shrink-0 text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
        >
          <User size={16} weight="regular" className="shrink-0" />
          <span>Member</span>
        </Link>
      </nav>

      {/* Info card in sidebar */}
      <div className="hidden md:block mt-auto bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-3.5 text-xs text-[#64748b]">
        <p className="font-semibold text-[#0f2342] mb-1 flex items-center gap-1.5">
          <Clock size={14} weight="bold" className="text-[#2562eb] shrink-0" />
          <span>Jam Operasional</span>
        </p>
        <p>Senin - Minggu</p>
        <p className="text-[#2562eb] font-medium tabular-nums">08.00 - 21.00 WIB</p>
        <p className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 tabular-nums">
          <Phone size={12} weight="regular" className="shrink-0" />
          <span>0812-3456-7890</span>
        </p>
      </div>
    </aside>
  );
}
