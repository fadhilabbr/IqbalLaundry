'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  PencilSimple,
  Trash,
  X,
  MagnifyingGlass,
  CheckCircle,
  TrendUp,
  Package,
  MapPin,
  Truck,
  Tag,
  Clock,
  ArrowCounterClockwise,
  SignIn,
  SignOut,
} from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';
import { formatRupiah } from '@/lib/data';
import { adminServiceSchema, AdminServiceFormValues } from '@/lib/validations';
import { Service, OrderStatus } from '@/types';

const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; shortLabel: string; badgeClass: string }
> = {
  MENUNGGU_PEMBAYARAN: {
    label: 'Menunggu Pembayaran',
    shortLabel: 'Menunggu Bayar',
    badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200',
  },
  DITERIMA: {
    label: 'Diterima',
    shortLabel: 'Diterima',
    badgeClass: 'bg-blue-50 text-[#2562eb] border border-blue-200',
  },
  DICUCI: {
    label: 'Dicuci',
    shortLabel: 'Dicuci',
    badgeClass: 'bg-sky-50 text-sky-800 border border-sky-200',
  },
  DISETRIKA: {
    label: 'Disetrika',
    shortLabel: 'Disetrika',
    badgeClass: 'bg-cyan-50 text-cyan-800 border border-cyan-200',
  },
  SIAP_DIKIRIM: {
    label: 'Siap Dikirim',
    shortLabel: 'Siap Dikirim',
    badgeClass: 'bg-teal-50 text-teal-800 border border-teal-200',
  },
  SELESAI: {
    label: 'Selesai',
    shortLabel: 'Selesai',
    badgeClass: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  },
  GAGAL: {
    label: 'Gagal',
    shortLabel: 'Gagal',
    badgeClass: 'bg-red-50 text-red-800 border border-red-200',
  },
};

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'MENUNGGU_PEMBAYARAN',
  'DITERIMA',
  'DICUCI',
  'DISETRIKA',
  'SIAP_DIKIRIM',
  'SELESAI',
  'GAGAL',
];

const FILTER_STATUS_LIST: OrderStatus[] = [
  'MENUNGGU_PEMBAYARAN',
  'DITERIMA',
  'DICUCI',
  'DISETRIKA',
  'SIAP_DIKIRIM',
  'SELESAI',
];

const WEEKLY_PERFORMANCE = [
  { day: 'Sen', fullDay: 'Senin', height: '56%', orders: 18 },
  { day: 'Sel', fullDay: 'Selasa', height: '69%', orders: 22 },
  { day: 'Rab', fullDay: 'Rabu', height: '47%', orders: 15 },
  { day: 'Kam', fullDay: 'Kamis', height: '81%', orders: 26 },
  { day: 'Jum', fullDay: 'Jumat', height: '75%', orders: 24 },
  { day: 'Sab', fullDay: 'Sabtu', height: '100%', orders: 32 },
  { day: 'Min', fullDay: 'Minggu', height: '88%', orders: 28 },
];

const CONTROL_TRANSITION = 'transition duration-150 ease-out';
const INTERACTIVE_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30';
const BUTTON_PRESS = 'active:scale-[0.98]';

export default function AdminDashboard() {
  const router = useRouter();
  const {
    adminTab,
    orders,
    updateOrderStatus,
    services,
    addService,
    updateService,
    deleteService,
    deliveryZones,
    updateZoneFee,
    reportStats,
    currentUser,
    logout,
    showToast,
  } = useApp();

  // Add / Edit Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const serviceForm = useForm<AdminServiceFormValues>({
    resolver: zodResolver(adminServiceSchema),
    defaultValues: {
      name: '',
      price: 10000,
      unit: 'kg',
      description: '',
    },
  });

  // Delete Service Modal State
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Orders Filter & Search State
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Zone fee inline save indicator
  const [savedZoneId, setSavedZoneId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const savedZoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    return () => {
      if (savedZoneTimerRef.current) {
        clearTimeout(savedZoneTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isServiceModalOpen && !serviceToDelete) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsServiceModalOpen(false);
        setServiceToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isServiceModalOpen, serviceToDelete]);

  const isOrdersTab = adminTab === 'ORDER_MASUK' || adminTab === 'DASHBOARD';

  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      MENUNGGU_PEMBAYARAN: 0,
      DITERIMA: 0,
      DICUCI: 0,
      DISETRIKA: 0,
      SIAP_DIKIRIM: 0,
      SELESAI: 0,
      GAGAL: 0,
    };
    for (const order of orders) {
      counts[order.status] = (counts[order.status] || 0) + 1;
    }
    return counts;
  }, [orders]);

  const orderKpis = useMemo(() => {
    const awaitingAction = statusCounts.MENUNGGU_PEMBAYARAN + statusCounts.DITERIMA;
    const inProgress =
      statusCounts.DICUCI + statusCounts.DISETRIKA + statusCounts.SIAP_DIKIRIM;
    return {
      total: orders.length,
      awaitingAction,
      inProgress,
      completed: statusCounts.SELESAI,
    };
  }, [orders.length, statusCounts]);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesFilter = statusFilter === 'ALL' || order.status === statusFilter;
      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;
      return (
        order.id.toLowerCase().includes(normalizedQuery) ||
        order.customerName.toLowerCase().includes(normalizedQuery) ||
        order.phone.toLowerCase().includes(normalizedQuery) ||
        order.serviceName.toLowerCase().includes(normalizedQuery) ||
        order.address.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [orders, statusFilter, searchQuery]);

  const isOrdersFiltered = statusFilter !== 'ALL' || searchQuery.trim().length > 0;

  const resetOrderFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
  };

  const openAddModal = () => {
    setEditingService(null);
    serviceForm.reset({
      name: '',
      price: 10000,
      unit: 'kg',
      description: '',
    });
    setIsServiceModalOpen(true);
  };

  const openEditModal = (srv: Service) => {
    setEditingService(srv);
    serviceForm.reset({
      name: srv.name,
      price: srv.price,
      unit: srv.unit,
      description: srv.description || '',
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (data: AdminServiceFormValues) => {
    if (editingService) {
      updateService(editingService.id, {
        name: data.name,
        price: data.price,
        unit: data.unit,
        description: data.description || 'Layanan khusus Iqbal Laundry.',
      });
      showToast(`Layanan "${data.name}" berhasil diperbarui.`, 'success');
    } else {
      addService({
        name: data.name,
        price: data.price,
        unit: data.unit,
        description: data.description || 'Layanan khusus Iqbal Laundry.',
        popular: false,
      });
      showToast(`Layanan baru "${data.name}" berhasil ditambahkan.`, 'success');
    }
    setEditingService(null);
    serviceForm.reset();
    setIsServiceModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      const deletedName = serviceToDelete.name;
      deleteService(serviceToDelete.id);
      setServiceToDelete(null);
      showToast(`Layanan "${deletedName}" telah dihapus.`, 'info');
    }
  };

  const handleOrderStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    updateOrderStatus(orderId, nextStatus);
    showToast(
      `Status ${orderId} diperbarui ke ${ORDER_STATUS_META[nextStatus].label}.`,
      'success'
    );
  };

  const handleZoneFeeChange = (zoneId: string, zoneName: string, rawValue: string) => {
    const parsed = parseInt(rawValue, 10);
    const nextFee = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    updateZoneFee(zoneId, nextFee);
    setSavedZoneId(zoneId);
    if (savedZoneTimerRef.current) {
      clearTimeout(savedZoneTimerRef.current);
    }
    savedZoneTimerRef.current = setTimeout(() => {
      setSavedZoneId(null);
    }, 2000);
    showToast(`Tarif ${zoneName} disimpan (${formatRupiah(nextFee)}).`, 'info');
  };

  const weeklyTotals = useMemo(() => {
    const totalOrders = WEEKLY_PERFORMANCE.reduce((acc, item) => acc + item.orders, 0);
    const peak = WEEKLY_PERFORMANCE.reduce(
      (best, item) => (item.orders > best.orders ? item : best),
      WEEKLY_PERFORMANCE[0]
    );
    return { totalOrders, peak };
  }, []);

  const completionRate =
    reportStats.ordersCount > 0
      ? ((reportStats.completedCount / reportStats.ordersCount) * 100)
          .toFixed(1)
          .replace('.', ',')
      : '0,0';

  return (
    <div className="flex-1 flex flex-col bg-[#f5f8fc] min-h-full p-4 sm:p-6 lg:p-8 gap-6">
      {/* Page Heading */}
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#0f2342] leading-tight">
            {isOrdersTab && 'Order masuk'}
            {adminTab === 'LAYANAN' && 'Layanan & harga'}
            {adminTab === 'ONGKIR' && 'Ongkos kirim'}
            {adminTab === 'LAPORAN' && 'Laporan usaha'}
          </h1>
          <p className="text-sm text-[#475569]">
            {isOrdersTab && 'Pantau antrean pesanan dan perbarui status pengerjaan laundry'}
            {adminTab === 'LAYANAN' && 'Kelola katalog tarif dan daftar paket layanan pelanggan'}
            {adminTab === 'ONGKIR' && 'Atur tarif antar-jemput berdasarkan radius zona pelanggan'}
            {adminTab === 'LAPORAN' && 'Ringkasan performa operasional dan pendapatan periode berjalan'}
          </p>
        </div>

        <div className="md:hidden shrink-0">
          {currentUser ? (
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              aria-label="Keluar dari akun"
              className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-lg border border-[#e2e8f0] bg-white hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-xs font-semibold text-[#475569] shadow-[0_1px_2px_rgba(15,35,66,0.04)] cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
            >
              <SignOut size={15} weight="bold" aria-hidden="true" />
              <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/login')}
              className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] px-3 rounded-lg bg-[#2562eb] hover:bg-[#1d4ed8] text-xs font-semibold text-white cursor-pointer whitespace-nowrap ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
            >
              <SignIn size={15} weight="bold" aria-hidden="true" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </header>

      {/* =========================================================================
          SCREEN 27: ORDER MASUK
      ========================================================================== */}
      {isOrdersTab && (
        <div className="flex flex-col gap-5">
          {/* Compact Single-Source-of-Truth Top KPI Summary Strip */}
          <section
            aria-label="Ringkasan antrean pesanan"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            <div className="bg-white border border-[#dce5f0] rounded-xl p-4 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#64748b]">Total Antrean</span>
                <Package size={16} weight="duotone" className="text-[#2562eb]" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-[#0f2342] mt-1.5 tabular-nums">
                {orderKpis.total}
              </p>
              <p className="text-[11px] text-[#64748b] mt-0.5">Pesanan tercatat</p>
            </div>

            <div className="bg-white border border-[#dce5f0] rounded-xl p-4 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#64748b]">Perlu Tindakan</span>
                <Clock size={16} weight="duotone" className="text-amber-600" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-[#0f2342] mt-1.5 tabular-nums">
                {orderKpis.awaitingAction}
              </p>
              <p className="text-[11px] text-[#64748b] mt-0.5">Menunggu bayar & diterima</p>
            </div>

            <div className="bg-white border border-[#dce5f0] rounded-xl p-4 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#64748b]">Dalam Proses</span>
                <Truck size={16} weight="duotone" className="text-sky-600" aria-hidden="true" />
              </div>
              <p className="text-2xl font-bold text-[#2562eb] mt-1.5 tabular-nums">
                {orderKpis.inProgress}
              </p>
              <p className="text-[11px] text-[#64748b] mt-0.5">Cuci, setrika & siap kirim</p>
            </div>

            <div className="bg-white border border-[#dce5f0] rounded-xl p-4 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#64748b]">Selesai</span>
                <CheckCircle
                  size={16}
                  weight="duotone"
                  className="text-emerald-600"
                  aria-hidden="true"
                />
              </div>
              <p className="text-2xl font-bold text-[#0f2342] mt-1.5 tabular-nums">
                {orderKpis.completed}
              </p>
              <p className="text-[11px] text-[#64748b] mt-0.5">Pesanan tuntas</p>
            </div>
          </section>

          {/* Main Orders Surface */}
          <section className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.06)] flex flex-col gap-5">
            {/* Unified Page-Level Control Bar */}
            <div className="flex flex-col gap-3 pb-4 border-b border-[#e2e8f0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-xs">
                  <MagnifyingGlass
                    size={16}
                    weight="bold"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    placeholder="Cari ID, nama, layanan, alamat..."
                    aria-label="Cari ID pesanan, pelanggan, layanan, atau alamat"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-lg pl-9 pr-8 py-2 text-xs text-[#0f2342] placeholder:text-slate-400 focus:border-[#2562eb] ${CONTROL_TRANSITION} ${INTERACTIVE_RING}`}
                  />
                  {searchQuery.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Hapus kata kunci pencarian"
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#64748b] hover:text-[#0f2342] hover:bg-slate-200/70 cursor-pointer ${CONTROL_TRANSITION} ${INTERACTIVE_RING}`}
                    >
                      <X size={13} weight="bold" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span className="text-xs text-[#475569] tabular-nums whitespace-nowrap">
                    Menampilkan <strong className="text-[#0f2342]">{filteredOrders.length}</strong>{' '}
                    dari <strong className="text-[#0f2342]">{orders.length}</strong> pesanan
                  </span>
                  {isOrdersFiltered && (
                    <button
                      type="button"
                      onClick={resetOrderFilters}
                      className={`inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5 text-xs font-semibold text-[#0f2342] hover:bg-blue-50 hover:text-[#2562eb] hover:border-blue-200 cursor-pointer whitespace-nowrap ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
                    >
                      <ArrowCounterClockwise size={13} weight="bold" aria-hidden="true" />
                      <span>Reset Filter</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter Pills with Live Order Counts */}
              <div
                role="group"
                aria-label="Filter status pesanan"
                className="flex flex-wrap items-center gap-1.5"
              >
                <button
                  type="button"
                  aria-pressed={statusFilter === 'ALL'}
                  onClick={() => setStatusFilter('ALL')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING} ${
                    statusFilter === 'ALL'
                      ? 'bg-[#2562eb] text-white shadow-sm'
                      : 'bg-[#f8fafc] text-[#475569] border border-[#e2e8f0] hover:bg-blue-50/70 hover:text-[#0f2342] hover:border-[#cbd5e1]'
                  }`}
                >
                  <span>Semua</span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                      statusFilter === 'ALL'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/80 text-[#0f2342]'
                    }`}
                  >
                    {orders.length}
                  </span>
                </button>

                {FILTER_STATUS_LIST.map((statusKey) => {
                  const meta = ORDER_STATUS_META[statusKey];
                  const isActive = statusFilter === statusKey;
                  const count = statusCounts[statusKey] || 0;
                  return (
                    <button
                      key={statusKey}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setStatusFilter(statusKey)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING} ${
                        isActive
                          ? 'bg-[#2562eb] text-white shadow-sm'
                          : 'bg-[#f8fafc] text-[#475569] border border-[#e2e8f0] hover:bg-blue-50/70 hover:text-[#0f2342] hover:border-[#cbd5e1]'
                      }`}
                    >
                      <span>{meta.shortLabel}</span>
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200/80 text-[#0f2342]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Empty State OR Responsive Orders View */}
            {filteredOrders.length === 0 ? (
              <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-6 py-12 text-center">
                <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#2562eb] border border-blue-100">
                    <Package size={24} weight="duotone" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#0f2342]">
                      Tidak ada pesanan yang cocok
                    </p>
                    <p className="text-xs text-[#64748b] leading-relaxed">
                      {isOrdersFiltered
                        ? 'Coba ubah kata kunci pencarian atau atur ulang filter status untuk menampilkan seluruh pesanan.'
                        : 'Pesanan yang masuk dari pelanggan akan muncul otomatis di daftar ini.'}
                    </p>
                  </div>
                  {isOrdersFiltered && (
                    <button
                      type="button"
                      onClick={resetOrderFilters}
                      className={`mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#2562eb] hover:bg-[#1d4ed8] px-4 py-2 text-xs font-bold text-white shadow-sm cursor-pointer whitespace-nowrap ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
                    >
                      <ArrowCounterClockwise size={14} weight="bold" aria-hidden="true" />
                      <span>Reset Pencarian & Filter</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Mobile Orders Cards (< md) */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {filteredOrders.map((ord) => {
                    const statusMeta = ORDER_STATUS_META[ord.status];
                    return (
                      <article
                        key={ord.id}
                        className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc]/60 p-4 flex flex-col gap-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-[#0f2342] tabular-nums">
                              {ord.id}
                            </p>
                            <p className="text-[11px] text-[#64748b] tabular-nums">
                              {ord.createdAt}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold whitespace-nowrap ${statusMeta.badgeClass}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs border-y border-[#e2e8f0] py-3">
                          <div>
                            <span className="text-[11px] text-[#64748b] block">Pelanggan</span>
                            <p className="font-semibold text-[#0f2342]">{ord.customerName}</p>
                            <p className="text-[11px] text-[#475569] tabular-nums">{ord.phone}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-[#64748b] block">Total</span>
                            <p className="font-bold text-[#2562eb] tabular-nums">
                              {formatRupiah(ord.total)}
                            </p>
                            <p className="text-[11px] text-[#475569] tabular-nums">
                              {ord.serviceName} ({ord.weight} {ord.unit})
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-1.5 text-xs text-[#475569]">
                          <MapPin
                            size={14}
                            weight="bold"
                            className="text-[#64748b] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span className="leading-snug">{ord.address}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <label
                            htmlFor={`mobile-status-${ord.id}`}
                            className="text-[11px] font-semibold text-[#475569] shrink-0"
                          >
                            Ubah Status
                          </label>
                          <select
                            id={`mobile-status-${ord.id}`}
                            aria-label={`Ubah status pesanan ${ord.id}`}
                            value={ord.status}
                            onChange={(e) =>
                              handleOrderStatusChange(ord.id, e.target.value as OrderStatus)
                            }
                            className={`flex-1 bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-2 text-xs font-semibold text-[#0f2342] focus:border-[#2562eb] cursor-pointer ${CONTROL_TRANSITION} ${INTERACTIVE_RING}`}
                          >
                            {ORDER_STATUS_OPTIONS.map((statusOption) => (
                              <option key={statusOption} value={statusOption}>
                                {ORDER_STATUS_META[statusOption].label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Desktop Orders Table (md+) */}
                <div className="hidden md:block border border-[#e2e8f0] rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f8fafc] text-[#0f2342] font-bold border-b border-[#e2e8f0]">
                      <tr>
                        <th className="py-3 px-4">Order & Pelanggan</th>
                        <th className="py-3 px-4">Layanan</th>
                        <th className="py-3 px-4">Alamat Pickup</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Ubah Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0]">
                      {filteredOrders.map((ord) => {
                        const statusMeta = ORDER_STATUS_META[ord.status];
                        return (
                          <tr
                            key={ord.id}
                            className={`hover:bg-[#f8fafc] ${CONTROL_TRANSITION}`}
                          >
                            <td className="py-3.5 px-4 align-top">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#0f2342] tabular-nums">
                                  {ord.id}
                                </span>
                                <span className="text-[11px] text-[#64748b] tabular-nums">
                                  {ord.createdAt}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#475569] mt-0.5 tabular-nums">
                                {ord.customerName} · {ord.phone}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 align-top">
                              <p className="font-semibold text-[#0f2342]">{ord.serviceName}</p>
                              <p className="text-[11px] text-[#64748b] tabular-nums mt-0.5">
                                {ord.weight} {ord.unit}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 align-top max-w-[220px]">
                              <p className="text-[#475569] truncate" title={ord.address}>
                                {ord.address}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 align-top font-bold text-[#2562eb] tabular-nums whitespace-nowrap">
                              {formatRupiah(ord.total)}
                            </td>
                            <td className="py-3.5 px-4 align-top">
                              <span
                                className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${statusMeta.badgeClass}`}
                              >
                                {statusMeta.label}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 align-top text-right">
                              <select
                                aria-label={`Ubah status pesanan ${ord.id}`}
                                value={ord.status}
                                onChange={(e) =>
                                  handleOrderStatusChange(
                                    ord.id,
                                    e.target.value as OrderStatus
                                  )
                                }
                                className={`bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#0f2342] focus:border-[#2562eb] cursor-pointer ${CONTROL_TRANSITION} ${INTERACTIVE_RING}`}
                              >
                                {ORDER_STATUS_OPTIONS.map((statusOption) => (
                                  <option key={statusOption} value={statusOption}>
                                    {ORDER_STATUS_META[statusOption].label}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* =========================================================================
          SCREEN 28: LAYANAN & HARGA
      ========================================================================== */}
      {adminTab === 'LAYANAN' && (
        <section className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.06)] flex flex-col gap-5">
          <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b border-[#e2e8f0]">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-[#0f2342] text-base">
                    Katalog Layanan & Tarif
                  </h2>
                  <span className="rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-bold text-[#2562eb] tabular-nums">
                    {services.length} Layanan
                  </span>
                </div>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Daftar harga yang tampil langsung di aplikasi pemesanan pelanggan
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className={`bg-[#2562eb] hover:bg-[#1d4ed8] text-white font-bold text-xs h-9 px-4 rounded-lg inline-flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
            >
              <Plus size={15} weight="bold" aria-hidden="true" />
              <span>Tambah Layanan</span>
            </button>
          </div>

          {services.length === 0 ? (
            <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-6 py-12 text-center">
              <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#2562eb] border border-blue-100">
                  <Tag size={24} weight="duotone" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#0f2342]">Belum ada layanan terdaftar</p>
                  <p className="text-xs text-[#64748b]">
                    Tambahkan layanan pertama agar pelanggan dapat mulai membuat pesanan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddModal}
                  className={`mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#2562eb] hover:bg-[#1d4ed8] px-4 py-2 text-xs font-bold text-white shadow-sm cursor-pointer whitespace-nowrap ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
                >
                  <Plus size={14} weight="bold" aria-hidden="true" />
                  <span>Tambah Layanan</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {services.map((srv) => (
                <article
                  key={srv.id}
                  className={`rounded-xl border border-[#e2e8f0] bg-[#f8fafc]/70 hover:bg-white hover:border-[#cbd5e1] p-4 sm:p-5 flex flex-col justify-between gap-4 ${CONTROL_TRANSITION}`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-[#0f2342] leading-snug">
                        {srv.name}
                      </h3>
                      {srv.popular && (
                        <span className="shrink-0 rounded-lg bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-[#2562eb] whitespace-nowrap">
                          Populer
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-[#2562eb] tabular-nums">
                        {formatRupiah(srv.price)}
                      </span>
                      <span className="text-xs font-medium text-[#64748b]">/{srv.unit}</span>
                    </div>

                    <p className="text-xs text-[#475569] leading-relaxed line-clamp-2">
                      {srv.description || 'Layanan khusus Iqbal Laundry.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#e2e8f0] flex items-center gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => openEditModal(srv)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-xs font-semibold text-[#0f2342] hover:bg-blue-50 hover:text-[#2562eb] hover:border-blue-200 cursor-pointer whitespace-nowrap ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
                    >
                      <PencilSimple size={14} weight="bold" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceToDelete(srv)}
                      className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 cursor-pointer whitespace-nowrap ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
                    >
                      <Trash size={14} weight="bold" aria-hidden="true" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          MODAL FORM LAYANAN (ADD / EDIT)
      ========================================================================== */}
      {isServiceModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsServiceModalOpen(false);
          }}
          className="fixed inset-0 bg-[#0f2342]/45 z-50 flex items-center justify-center p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-xl border border-[#dce5f0]"
          >
            <div className="flex justify-between items-center pb-3 border-b border-[#e2e8f0] mb-4">
              <h2 id="service-modal-title" className="font-bold text-[#0f2342] text-base">
                {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </h2>
              <button
                type="button"
                aria-label="Tutup modal layanan"
                onClick={() => setIsServiceModalOpen(false)}
                className={`text-[#64748b] hover:text-[#0f2342] p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
              >
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={serviceForm.handleSubmit(handleSaveService)}
              noValidate
              className="space-y-4 text-xs"
            >
              <div>
                <label
                  htmlFor="service-name"
                  className="block font-semibold text-[#0f2342] mb-1.5"
                >
                  Nama Layanan
                </label>
                <input
                  id="service-name"
                  type="text"
                  placeholder="Contoh: Cuci Jas / Sepatu"
                  aria-invalid={Boolean(serviceForm.formState.errors.name)}
                  {...serviceForm.register('name')}
                  className={`w-full bg-[#f8fafc] border rounded-lg p-2.5 text-xs text-[#0f2342] placeholder:text-slate-400 ${CONTROL_TRANSITION} ${INTERACTIVE_RING} ${
                    serviceForm.formState.errors.name
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[#cbd5e1] focus:border-[#2562eb]'
                  }`}
                />
                {serviceForm.formState.errors.name && (
                  <p role="alert" className="text-[11px] text-red-600 mt-1 font-medium">
                    {serviceForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="service-price"
                    className="block font-semibold text-[#0f2342] mb-1.5"
                  >
                    Harga (Rp)
                  </label>
                  <input
                    id="service-price"
                    type="number"
                    min="1000"
                    step="500"
                    aria-invalid={Boolean(serviceForm.formState.errors.price)}
                    {...serviceForm.register('price', { valueAsNumber: true })}
                    className={`w-full bg-[#f8fafc] border rounded-lg p-2.5 text-xs text-[#0f2342] placeholder:text-slate-400 tabular-nums ${CONTROL_TRANSITION} ${INTERACTIVE_RING} ${
                      serviceForm.formState.errors.price
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#cbd5e1] focus:border-[#2562eb]'
                    }`}
                  />
                  {serviceForm.formState.errors.price && (
                    <p role="alert" className="text-[11px] text-red-600 mt-1 font-medium">
                      {serviceForm.formState.errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="service-unit"
                    className="block font-semibold text-[#0f2342] mb-1.5"
                  >
                    Satuan
                  </label>
                  <select
                    id="service-unit"
                    aria-invalid={Boolean(serviceForm.formState.errors.unit)}
                    {...serviceForm.register('unit')}
                    className={`w-full bg-[#f8fafc] border rounded-lg p-2.5 text-xs text-[#0f2342] cursor-pointer ${CONTROL_TRANSITION} ${INTERACTIVE_RING} ${
                      serviceForm.formState.errors.unit
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#cbd5e1] focus:border-[#2562eb]'
                    }`}
                  >
                    <option value="kg">Per kg</option>
                    <option value="m²">Per m²</option>
                    <option value="buah">Per buah/pcs</option>
                  </select>
                  {serviceForm.formState.errors.unit && (
                    <p role="alert" className="text-[11px] text-red-600 mt-1 font-medium">
                      {serviceForm.formState.errors.unit.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="service-description"
                  className="block font-semibold text-[#0f2342] mb-1.5"
                >
                  Deskripsi Singkat
                </label>
                <textarea
                  id="service-description"
                  rows={3}
                  placeholder="Deskripsi pengerjaan layanan..."
                  aria-invalid={Boolean(serviceForm.formState.errors.description)}
                  {...serviceForm.register('description')}
                  className={`w-full bg-[#f8fafc] border rounded-lg p-2.5 text-xs text-[#0f2342] placeholder:text-slate-400 ${CONTROL_TRANSITION} ${INTERACTIVE_RING} ${
                    serviceForm.formState.errors.description
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[#cbd5e1] focus:border-[#2562eb]'
                  }`}
                />
                {serviceForm.formState.errors.description && (
                  <p role="alert" className="text-[11px] text-red-600 mt-1 font-medium">
                    {serviceForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className={`px-4 py-2 rounded-lg text-[#475569] hover:text-[#0f2342] hover:bg-slate-100 font-semibold cursor-pointer whitespace-nowrap ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`bg-[#2562eb] hover:bg-[#1d4ed8] text-white font-bold px-5 py-2 rounded-lg shadow-sm cursor-pointer whitespace-nowrap ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
                >
                  Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 30: MODAL HAPUS LAYANAN
      ========================================================================== */}
      {serviceToDelete && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setServiceToDelete(null);
          }}
          className="fixed inset-0 bg-[#0f2342]/45 z-50 flex items-center justify-center p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-service-modal-title"
            className="bg-white rounded-2xl max-w-sm w-full p-4 sm:p-6 shadow-xl border border-red-200"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h2 id="delete-service-modal-title" className="font-bold text-red-900 text-base">
                Hapus Layanan?
              </h2>
              <button
                type="button"
                aria-label="Tutup modal konfirmasi hapus"
                onClick={() => setServiceToDelete(null)}
                className={`text-[#64748b] hover:text-[#0f2342] p-1 rounded-lg hover:bg-slate-100 cursor-pointer ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
              >
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Apakah Anda yakin ingin menghapus layanan{' '}
              <strong className="text-[#0f2342]">{serviceToDelete.name}</strong> (
              <span className="tabular-nums font-medium text-[#0f2342]">
                {formatRupiah(serviceToDelete.price)}/{serviceToDelete.unit}
              </span>
              ) dari katalog?
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-[#475569] hover:text-[#0f2342] hover:bg-slate-100 cursor-pointer whitespace-nowrap ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className={`inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap ${CONTROL_TRANSITION} ${BUTTON_PRESS} ${INTERACTIVE_RING}`}
              >
                <Trash size={14} weight="bold" aria-hidden="true" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 31: ONGKOS KIRIM
      ========================================================================== */}
      {adminTab === 'ONGKIR' && (
        <section className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.06)] flex flex-col gap-5 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#e2e8f0]">
            <div>
              <h2 className="font-bold text-[#0f2342] text-base">
                Atur Tarif Ongkos Kirim per Zona
              </h2>
              <p className="text-xs text-[#64748b] mt-0.5">
                Tarif flat antar-jemput berdasarkan radius lokasi pelanggan
              </p>
            </div>
            <span className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-[#2562eb] tabular-nums whitespace-nowrap">
              {deliveryZones.length} Zona Aktif
            </span>
          </div>

          <div className="space-y-3">
            {deliveryZones.map((z) => {
              const isJustSaved = savedZoneId === z.id;
              return (
                <div
                  key={z.id}
                  className={`border border-[#e2e8f0] bg-[#f8fafc] hover:border-[#cbd5e1] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 ${CONTROL_TRANSITION}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-[#2562eb] border border-blue-100 shrink-0">
                      <MapPin size={18} weight="duotone" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#0f2342]">{z.name}</p>
                      <p className="text-xs text-[#64748b] tabular-nums mt-0.5">{z.zoneArea}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    {isJustSaved && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1 text-[11px] font-semibold text-emerald-700 whitespace-nowrap">
                        <CheckCircle size={13} weight="fill" aria-hidden="true" />
                        <span>Tersimpan</span>
                      </span>
                    )}

                    <label htmlFor={`zone-fee-${z.id}`} className="sr-only">
                      Tarif ongkos kirim {z.name}
                    </label>
                    <div
                      className={`flex items-center rounded-lg border border-[#cbd5e1] bg-white px-3 py-2 focus-within:border-[#2562eb] focus-within:ring-2 focus-within:ring-[#2562eb]/30 w-full sm:w-40 ${CONTROL_TRANSITION}`}
                    >
                      <span className="text-xs font-semibold text-[#475569] mr-2 select-none">
                        Rp
                      </span>
                      <input
                        id={`zone-fee-${z.id}`}
                        type="number"
                        min={0}
                        step="1000"
                        aria-label={`Tarif ongkos kirim ${z.name}`}
                        value={z.fee}
                        onChange={(e) => handleZoneFeeChange(z.id, z.name, e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-[#0f2342] tabular-nums text-right focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 text-xs text-emerald-800 bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
            <CheckCircle
              size={18}
              weight="fill"
              className="text-emerald-600 shrink-0"
              aria-hidden="true"
            />
            <p className="leading-relaxed">
              Perubahan tarif langsung tersimpan otomatis dan diterapkan ke estimasi ongkos kirim pelanggan.
            </p>
          </div>
        </section>
      )}

      {/* =========================================================================
          SCREEN 32: LAPORAN USAHA
      ========================================================================== */}
      {adminTab === 'LAPORAN' && (
        <div className="flex flex-col gap-6">
          {/* Operational & Revenue Summary Cards */}
          <section
            aria-label="Ringkasan pendapatan dan operasional"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
              <span className="text-xs font-medium text-[#64748b]">Total Pesanan</span>
              <p className="text-2xl font-bold text-[#0f2342] mt-1.5 tabular-nums">
                {reportStats.ordersCount}
              </p>
              <p className="text-[11px] text-emerald-700 mt-1.5 inline-flex items-center gap-1 tabular-nums">
                <TrendUp size={13} weight="bold" aria-hidden="true" />
                <span>+14% dari minggu lalu</span>
              </p>
            </div>

            <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
              <span className="text-xs font-medium text-[#64748b]">Total Pendapatan</span>
              <p className="text-2xl font-bold text-[#2562eb] mt-1.5 tabular-nums">
                {formatRupiah(reportStats.revenue)}
              </p>
              <p className="text-[11px] text-[#475569] mt-1.5 tabular-nums">
                Target bulanan tercapai 85%
              </p>
            </div>

            <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
              <span className="text-xs font-medium text-[#64748b]">Pesanan Selesai</span>
              <p className="text-2xl font-bold text-[#0f2342] mt-1.5 tabular-nums">
                {reportStats.completedCount}
              </p>
              <p className="text-[11px] text-emerald-700 mt-1.5 inline-flex items-center gap-1 tabular-nums">
                <CheckCircle size={13} weight="fill" aria-hidden="true" />
                <span>Tingkat selesai {completionRate}%</span>
              </p>
            </div>

            <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
              <span className="text-xs font-medium text-[#64748b]">Rata-rata Order</span>
              <p className="text-2xl font-bold text-[#0f2342] mt-1.5 tabular-nums">
                {formatRupiah(reportStats.averageOrderValue)}
              </p>
              <p className="text-[11px] text-[#64748b] mt-1.5">Rata-rata nilai per transaksi</p>
            </div>
          </section>

          {/* Compact Weekly Bar Chart */}
          <section className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
            <div className="flex flex-wrap justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#e2e8f0]">
              <div>
                <h2 className="font-bold text-[#0f2342] text-base">
                  Performa Pesanan Mingguan
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5 tabular-nums">
                  Total {weeklyTotals.totalOrders} order dalam 7 hari, puncak pada hari{' '}
                  {weeklyTotals.peak.fullDay} ({weeklyTotals.peak.orders} order)
                </p>
              </div>
              <span className="text-xs bg-blue-50 border border-blue-200 text-[#2562eb] font-semibold px-3 py-1 rounded-lg tabular-nums whitespace-nowrap">
                Periode 18 - 24 Nov 2026
              </span>
            </div>

            <div className="pt-6">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end">
                {WEEKLY_PERFORMANCE.map((item) => {
                  const isPeak = item.day === weeklyTotals.peak.day;
                  return (
                    <div
                      key={item.day}
                      className="flex flex-col items-center gap-2"
                    >
                      <span className="text-xs font-bold text-[#0f2342] tabular-nums">
                        {item.orders}
                      </span>
                      <div className="w-full h-36 flex items-end justify-center border-b border-[#e2e8f0]">
                        <div
                          style={{ height: item.height }}
                          title={`${item.fullDay}: ${item.orders} order`}
                          className={`w-full max-w-[40px] rounded-t-lg ${CONTROL_TRANSITION} ${
                            isPeak
                              ? 'bg-[#1d4ed8]'
                              : 'bg-[#2562eb] hover:bg-[#1d4ed8]'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#475569]">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
