'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Tag, Truck, TrendUp } from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';
import SidebarAuthFooter from '@/components/navigation/SidebarAuthFooter';

export default function AdminSidebar() {
  const { adminTab, setAdminTab, orders } = useApp();

  const newOrdersCount = orders.filter(
    (o) => o.status === 'MENUNGGU_PEMBAYARAN' || o.status === 'DITERIMA'
  ).length;

  const isOrdersActive = adminTab === 'ORDER_MASUK' || adminTab === 'DASHBOARD';

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] shadow-[0_-4px_16px_rgba(15,35,66,0.06)] px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:sticky md:top-0 md:bottom-auto md:left-auto md:right-auto md:z-20 md:bg-white md:backdrop-blur-none md:border-t-0 md:border-r md:shadow-none flex flex-col md:justify-between gap-4 w-full md:w-60 md:h-[100dvh] md:overflow-y-auto shrink-0 md:p-4 md:pt-6 select-none">
      <div className="flex flex-col gap-4">
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
                Admin Panel
              </p>
            </div>
          </Link>
        </div>

        <nav
          aria-label="Navigasi panel admin"
          className="grid grid-cols-4 md:flex md:flex-col gap-1 md:gap-2"
        >
          {/* Sidebar item: Order masuk */}
          <button
            type="button"
            onClick={() => setAdminTab('ORDER_MASUK')}
            aria-current={isOrdersActive ? 'page' : undefined}
            className={`relative flex flex-col md:flex-row items-center justify-center md:justify-between gap-1 md:gap-2 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
              isOrdersActive
                ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
                : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
            }`}
          >
            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2.5">
              <Package
                size={18}
                weight={isOrdersActive ? 'fill' : 'regular'}
                className="shrink-0"
                aria-hidden="true"
              />
              <span className="md:hidden">Order</span>
              <span className="hidden md:inline">Order masuk</span>
            </div>
            {newOrdersCount > 0 && (
              <span className="absolute top-1 right-2 md:static md:ml-auto bg-blue-100 text-[#2562eb] text-[10px] md:text-[11px] font-bold px-1.5 md:px-2 py-0.5 rounded-full tabular-nums">
                {newOrdersCount}
              </span>
            )}
          </button>

          {/* Sidebar item: Layanan & harga */}
          <button
            type="button"
            onClick={() => setAdminTab('LAYANAN')}
            aria-current={adminTab === 'LAYANAN' ? 'page' : undefined}
            className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
              adminTab === 'LAYANAN'
                ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
                : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
            }`}
          >
            <Tag
              size={18}
              weight={adminTab === 'LAYANAN' ? 'fill' : 'regular'}
              className="shrink-0"
              aria-hidden="true"
            />
            <span className="md:hidden">Layanan</span>
            <span className="hidden md:inline">Layanan & harga</span>
            {adminTab === 'LAYANAN' && (
              <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" aria-hidden="true" />
            )}
          </button>

          {/* Sidebar item: Ongkos kirim */}
          <button
            type="button"
            onClick={() => setAdminTab('ONGKIR')}
            aria-current={adminTab === 'ONGKIR' ? 'page' : undefined}
            className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
              adminTab === 'ONGKIR'
                ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
                : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
            }`}
          >
            <Truck
              size={18}
              weight={adminTab === 'ONGKIR' ? 'fill' : 'regular'}
              className="shrink-0"
              aria-hidden="true"
            />
            <span className="md:hidden">Ongkir</span>
            <span className="hidden md:inline">Ongkos kirim</span>
            {adminTab === 'ONGKIR' && (
              <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" aria-hidden="true" />
            )}
          </button>

          {/* Sidebar item: Laporan */}
          <button
            type="button"
            onClick={() => setAdminTab('LAPORAN')}
            aria-current={adminTab === 'LAPORAN' ? 'page' : undefined}
            className={`relative flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2.5 min-h-[44px] py-1.5 px-2 md:h-11 md:py-0 md:px-3.5 rounded-lg text-[11px] md:text-sm font-medium leading-tight transition duration-150 ease-out text-center md:text-left whitespace-nowrap cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
              adminTab === 'LAPORAN'
                ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
                : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f2342]'
            }`}
          >
            <TrendUp
              size={18}
              weight={adminTab === 'LAPORAN' ? 'bold' : 'regular'}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>Laporan</span>
            {adminTab === 'LAPORAN' && (
              <span className="ml-auto size-1.5 rounded-full bg-[#2562eb] shrink-0 hidden md:inline-block" aria-hidden="true" />
            )}
          </button>
        </nav>
      </div>

      <div className="hidden md:flex md:flex-col gap-3 mt-auto">
        <SidebarAuthFooter />
      </div>
    </aside>
  );
}
