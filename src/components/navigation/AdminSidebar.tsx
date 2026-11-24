'use client';

import React from 'react';
import { Package, Tag, Truck, TrendUp } from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';

export default function AdminSidebar() {
  const { adminTab, setAdminTab, orders } = useApp();

  const newOrdersCount = orders.filter(
    (o) => o.status === 'MENUNGGU_PEMBAYARAN' || o.status === 'DITERIMA'
  ).length;

  const isOrdersActive = adminTab === 'ORDER_MASUK' || adminTab === 'DASHBOARD';

  return (
    <aside className="bg-white border-b md:border-b-0 md:border-r border-[#e2e8f0] flex flex-col justify-between w-full md:w-64 md:min-h-[calc(100vh-61px)] shrink-0 px-4 py-3 md:p-5 md:pt-8 select-none">
      <div className="flex flex-col gap-2">
        <div className="hidden md:block pb-3 border-b border-[#e2e8f0]">
          <h1 className="font-bold text-[#0f2342] text-lg tracking-tight flex items-center gap-2">
            ✦ Iqbal Laundry
          </h1>
          <p className="font-semibold text-[#64748b] text-[11px] uppercase tracking-wider mt-1">
            ADMIN PANEL
          </p>
        </div>

        <nav
          aria-label="Navigasi panel admin"
          className="flex flex-row md:flex-col gap-1.5 md:mt-3 overflow-x-auto pb-1 md:pb-0"
        >
          {/* Sidebar item: Order masuk */}
          <button
            type="button"
            onClick={() => setAdminTab('ORDER_MASUK')}
            aria-current={isOrdersActive ? 'page' : undefined}
            className={`flex items-center justify-between gap-2 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-all text-left whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
              isOrdersActive
                ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
                : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package
                size={16}
                weight={isOrdersActive ? 'fill' : 'regular'}
                className="shrink-0"
                aria-hidden="true"
              />
              <span>Order masuk</span>
            </div>
            {newOrdersCount > 0 && (
              <span className="bg-blue-100 text-[#2562eb] text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                {newOrdersCount}
              </span>
            )}
          </button>

          {/* Sidebar item: Layanan & harga */}
          <button
            type="button"
            onClick={() => setAdminTab('LAYANAN')}
            aria-current={adminTab === 'LAYANAN' ? 'page' : undefined}
            className={`flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-all text-left whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
              adminTab === 'LAYANAN'
                ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
                : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
            }`}
          >
            <Tag
              size={16}
              weight={adminTab === 'LAYANAN' ? 'fill' : 'regular'}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>Layanan & harga</span>
          </button>

          {/* Sidebar item: Ongkos kirim */}
          <button
            type="button"
            onClick={() => setAdminTab('ONGKIR')}
            aria-current={adminTab === 'ONGKIR' ? 'page' : undefined}
            className={`flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-all text-left whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
              adminTab === 'ONGKIR'
                ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
                : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
            }`}
          >
            <Truck
              size={16}
              weight={adminTab === 'ONGKIR' ? 'fill' : 'regular'}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>Ongkos kirim</span>
          </button>

          {/* Sidebar item: Laporan */}
          <button
            type="button"
            onClick={() => setAdminTab('LAPORAN')}
            aria-current={adminTab === 'LAPORAN' ? 'page' : undefined}
            className={`flex items-center gap-2.5 h-10 md:h-11 px-4 rounded-[10px] text-xs md:text-sm font-medium transition-all text-left whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
              adminTab === 'LAPORAN'
                ? 'bg-[#eff6ff] text-[#2562eb] font-semibold'
                : 'text-[#64748b] hover:bg-slate-50 hover:text-[#0f2342]'
            }`}
          >
            <TrendUp
              size={16}
              weight={adminTab === 'LAPORAN' ? 'bold' : 'regular'}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>Laporan</span>
          </button>
        </nav>
      </div>

      <div className="hidden md:block pt-4 border-t border-[#e2e8f0]">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-[#64748b] text-[11px] uppercase tracking-wider">
            ADMINISTRATOR
          </p>
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
        </div>
        <p className="text-xs text-[#0f2342] font-medium mt-1">Superadmin (Iqbal)</p>
      </div>
    </aside>
  );
}
