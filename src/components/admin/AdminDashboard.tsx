'use client';

import React, { useState, useEffect } from 'react';
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
} from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';
import { formatRupiah } from '@/lib/data';
import { adminServiceSchema, AdminServiceFormValues } from '@/lib/validations';
import { Service, OrderStatus } from '@/types';

const getOrderStatusBadgeClass = (status: OrderStatus): string => {
  switch (status) {
    case 'SELESAI':
      return 'bg-emerald-100 text-emerald-800';
    case 'DICUCI':
      return 'bg-sky-100 text-sky-800';
    case 'DITERIMA':
      return 'bg-blue-100 text-blue-800';
    case 'SIAP_DIKIRIM':
      return 'bg-teal-100 text-teal-800';
    case 'GAGAL':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-amber-100 text-amber-800';
  }
};

const WEEKLY_PERFORMANCE = [
  { day: 'Sen', height: '65%', orders: 18 },
  { day: 'Sel', height: '78%', orders: 22 },
  { day: 'Rab', height: '55%', orders: 15 },
  { day: 'Kam', height: '90%', orders: 26 },
  { day: 'Jum', height: '82%', orders: 24 },
  { day: 'Sab', height: '100%', orders: 32 },
  { day: 'Min', height: '92%', orders: 28 },
];

export default function AdminDashboard() {
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

  // Status Filter
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = statusFilter === 'ALL' || o.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.serviceName.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

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

  return (
    <div className="flex-1 flex flex-col bg-[#f5f8fc] min-h-full p-6 sm:p-10">
      {/* Brand Header */}
      <div className="flex items-center justify-between w-full h-[34px] mb-6">
        <p className="text-[13px] text-[#64748b] font-normal">
          {isOrdersTab && 'Dashboard / Order masuk'}
          {adminTab === 'LAYANAN' && 'Dashboard / Layanan dan harga'}
          {adminTab === 'ONGKIR' && 'Dashboard / Ongkos kirim'}
          {adminTab === 'LAPORAN' && 'Dashboard / Laporan usaha'}
        </p>
        <span className="bg-[#dbeafe] text-[#2562eb] text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
          Admin
        </span>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-[28px] font-bold text-[#0f2342] leading-tight">
          {isOrdersTab && 'Order masuk'}
          {adminTab === 'LAYANAN' && 'Layanan dan harga'}
          {adminTab === 'ONGKIR' && 'Ongkos kirim'}
          {adminTab === 'LAPORAN' && 'Laporan usaha'}
        </h2>
        <p className="text-sm text-[#64748b]">
          {isOrdersTab && 'Pesanan terbaru & kelola alur kerja laundry'}
          {adminTab === 'LAYANAN' && 'Kelola katalog harga dan daftar paket layanan'}
          {adminTab === 'ONGKIR' && 'Atur tarif dan batas zona penjemputan'}
          {adminTab === 'LAPORAN' && 'Performa periode ini & pendapatan operasional'}
        </p>
      </div>

      {/* =========================================================================
          SCREEN 27: ORDER MASUK
      ========================================================================== */}
      {isOrdersTab && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-7 shadow-sm flex flex-col gap-5">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#e2e8f0]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <MagnifyingGlass
                  size={15}
                  weight="bold"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder="Cari order, pelanggan..."
                  aria-label="Cari order atau pelanggan"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#0f2342] focus:border-[#2562eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 w-full"
                />
              </div>
              <select
                aria-label="Filter status pesanan"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#f8fafc] border border-[#cbd5e1] rounded-lg px-3 py-1.5 text-xs text-[#0f2342] focus:border-[#2562eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="MENUNGGU_PEMBAYARAN">Menunggu Pembayaran</option>
                <option value="DITERIMA">Diterima</option>
                <option value="DICUCI">Dicuci</option>
                <option value="SIAP_DIKIRIM">Siap Dikirim</option>
                <option value="SELESAI">Selesai</option>
              </select>
            </div>
            <span className="text-xs text-[#64748b] tabular-nums whitespace-nowrap">
              {filteredOrders.length} Pesanan Ditampilkan
            </span>
          </div>

          {/* Table Container */}
          <div className="border border-[#e2e8f0] rounded-[12px] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-[#0f2342] font-bold border-b border-[#e2e8f0]">
                <tr>
                  <th className="py-3 px-4">Order & Pelanggan</th>
                  <th className="py-3 px-4">Layanan</th>
                  <th className="py-3 px-4">Alamat Pickup</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status Saat Ini</th>
                  <th className="py-3 px-4 text-right">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-6 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                          <Package size={24} weight="duotone" aria-hidden="true" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-[#0f2342]">
                            Tidak ada pesanan yang cocok
                          </p>
                          <p className="text-xs text-[#64748b]">
                            Coba ubah kata kunci pencarian atau atur ulang filter status untuk menampilkan seluruh pesanan.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('ALL');
                          }}
                          className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#2562eb] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 whitespace-nowrap cursor-pointer"
                        >
                          Reset Pencarian & Filter
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-[#0f2342] tabular-nums">{ord.id}</p>
                        <p className="text-[11px] text-[#64748b] tabular-nums">
                          {ord.customerName} · {ord.phone}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{ord.serviceName}</p>
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          {ord.weight} {ord.unit}
                        </p>
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate text-slate-600">
                        {ord.address}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#2562eb] tabular-nums whitespace-nowrap">
                        {formatRupiah(ord.total)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${getOrderStatusBadgeClass(
                            ord.status
                          )}`}
                        >
                          {ord.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <select
                          aria-label={`Ubah status pesanan ${ord.id}`}
                          value={ord.status}
                          onChange={(e) => {
                            const nextStatus = e.target.value as OrderStatus;
                            updateOrderStatus(ord.id, nextStatus);
                            showToast(
                              `Status ${ord.id} diperbarui ke ${nextStatus.replace('_', ' ')}.`,
                              'success'
                            );
                          }}
                          className="bg-white border border-[#cbd5e1] rounded-md px-2 py-1 text-[11px] font-medium text-[#0f2342] focus:border-[#2562eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 cursor-pointer"
                        >
                          <option value="MENUNGGU_PEMBAYARAN">Menunggu Pembayaran</option>
                          <option value="DITERIMA">Diterima</option>
                          <option value="DICUCI">Dicuci</option>
                          <option value="SIAP_DIKIRIM">Siap Dikirim</option>
                          <option value="SELESAI">Selesai</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 28: LAYANAN & HARGA
      ========================================================================== */}
      {adminTab === 'LAYANAN' && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-7 shadow-sm flex flex-col gap-5">
          <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-[#e2e8f0]">
            <div>
              <h4 className="font-bold text-[#0f2342] text-base">Katalog Layanan & Tarif</h4>
              <p className="text-xs text-[#64748b]">
                Daftar harga yang tampil langsung ke aplikasi pelanggan
              </p>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-[8px] transition flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
            >
              <Plus size={15} weight="bold" aria-hidden="true" />
              <span>Tambah Layanan</span>
            </button>
          </div>

          <div className="border border-[#e2e8f0] rounded-[12px] overflow-hidden">
            <div className="bg-[#f8fafc] px-5 py-3 border-b border-[#e2e8f0] flex justify-between text-xs font-bold text-[#0f2342]">
              <span className="flex-1">Layanan</span>
              <span className="w-36">Harga / Satuan</span>
              <span className="w-36 text-right">Aksi</span>
            </div>

            <div className="divide-y divide-[#e2e8f0]">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-[#0f2342]">{srv.name}</p>
                    <p className="text-[11px] text-[#64748b] truncate">{srv.description}</p>
                  </div>
                  <div className="w-36 font-bold text-xs text-[#2562eb] tabular-nums whitespace-nowrap">
                    {formatRupiah(srv.price)}/{srv.unit}
                  </div>
                  <div className="w-36 text-right flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(srv)}
                      className="inline-flex items-center gap-1 text-[#2562eb] hover:text-blue-800 text-xs font-semibold px-2.5 py-1.5 rounded-md hover:bg-blue-50 transition cursor-pointer whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
                    >
                      <PencilSimple size={14} weight="bold" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceToDelete(srv)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-semibold px-2.5 py-1.5 rounded-md hover:bg-red-50 transition cursor-pointer whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
                    >
                      <Trash size={14} weight="bold" aria-hidden="true" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL FORM LAYANAN (ADD / EDIT)
      ========================================================================== */}
      {isServiceModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsServiceModalOpen(false);
          }}
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            className="bg-white rounded-[16px] max-w-md w-full p-6 shadow-xl border border-[#cbd5e1]"
          >
            <div className="flex justify-between items-center pb-3 border-b border-[#e2e8f0] mb-4">
              <h4 id="service-modal-title" className="font-bold text-[#0f2342] text-base">
                {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </h4>
              <button
                type="button"
                aria-label="Tutup modal layanan"
                onClick={() => setIsServiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
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
                  className="block font-semibold text-[#0f2342] mb-1"
                >
                  Nama Layanan
                </label>
                <input
                  id="service-name"
                  type="text"
                  placeholder="Contoh: Cuci Jas / Sepatu"
                  {...serviceForm.register('name')}
                  className={`w-full bg-[#f8fafc] border rounded-lg p-2.5 text-xs text-[#0f2342] placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
                    serviceForm.formState.errors.name
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[#cbd5e1] focus:border-[#2562eb]'
                  }`}
                />
                {serviceForm.formState.errors.name && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {serviceForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="service-price"
                    className="block font-semibold text-[#0f2342] mb-1"
                  >
                    Harga (Rp)
                  </label>
                  <input
                    id="service-price"
                    type="number"
                    min="1000"
                    step="500"
                    {...serviceForm.register('price', { valueAsNumber: true })}
                    className={`w-full bg-[#f8fafc] border rounded-lg p-2.5 text-xs text-[#0f2342] placeholder:text-slate-400 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
                      serviceForm.formState.errors.price
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#cbd5e1] focus:border-[#2562eb]'
                    }`}
                  />
                  {serviceForm.formState.errors.price && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">
                      {serviceForm.formState.errors.price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="service-unit"
                    className="block font-semibold text-[#0f2342] mb-1"
                  >
                    Satuan
                  </label>
                  <select
                    id="service-unit"
                    {...serviceForm.register('unit')}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-lg p-2.5 text-xs text-[#0f2342] focus:border-[#2562eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 cursor-pointer"
                  >
                    <option value="kg">Per kg</option>
                    <option value="m²">Per m²</option>
                    <option value="buah">Per buah/pcs</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="service-description"
                  className="block font-semibold text-[#0f2342] mb-1"
                >
                  Deskripsi Singkat
                </label>
                <textarea
                  id="service-description"
                  rows={2}
                  placeholder="Deskripsi pengerjaan layanan..."
                  {...serviceForm.register('description')}
                  className={`w-full bg-[#f8fafc] border rounded-lg p-2.5 text-xs text-[#0f2342] placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
                    serviceForm.formState.errors.description
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[#cbd5e1] focus:border-[#2562eb]'
                  }`}
                />
                {serviceForm.formState.errors.description && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {serviceForm.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#2562eb] hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-lg transition cursor-pointer whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
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
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-service-modal-title"
            className="bg-white rounded-[16px] max-w-sm w-full p-6 shadow-xl border border-red-200"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4
                id="delete-service-modal-title"
                className="font-bold text-red-900 text-base"
              >
                Hapus Layanan?
              </h4>
              <button
                type="button"
                aria-label="Tutup modal konfirmasi hapus"
                onClick={() => setServiceToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
              >
                <X size={18} weight="bold" aria-hidden="true" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus layanan{' '}
              <strong>{serviceToDelete.name}</strong> (
              <span className="tabular-nums">
                {formatRupiah(serviceToDelete.price)}/{serviceToDelete.unit}
              </span>
              ) dari katalog?
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition cursor-pointer whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
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
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-7 shadow-sm flex flex-col gap-6 max-w-2xl">
          <div className="pb-3 border-b border-[#e2e8f0]">
            <h4 className="font-bold text-[#0f2342] text-base">
              Atur Tarif Ongkos Kirim per Zona
            </h4>
            <p className="text-xs text-[#64748b]">
              Tarif flat antar-jemput berdasarkan radius lokasi pelanggan
            </p>
          </div>

          <div className="space-y-4">
            {deliveryZones.map((z) => (
              <div
                key={z.id}
                className="border border-[#e2e8f0] bg-[#f8fafc] rounded-[12px] p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-bold text-xs text-[#0f2342]">{z.name}</p>
                  <p className="text-[11px] text-[#64748b] tabular-nums">{z.zoneArea}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#0f2342]">Rp</span>
                  <input
                    type="number"
                    min={0}
                    step="1000"
                    aria-label={`Tarif ongkos kirim ${z.name}`}
                    value={z.fee}
                    onChange={(e) => {
                      const nextFee = parseInt(e.target.value, 10) || 0;
                      updateZoneFee(z.id, nextFee);
                      showToast(
                        `Tarif ${z.name} disimpan (${formatRupiah(nextFee)}).`,
                        'info'
                      );
                    }}
                    className="w-28 bg-white border border-[#cbd5e1] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#2562eb] tabular-nums focus:border-[#2562eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2.5 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <CheckCircle
              size={18}
              weight="fill"
              className="text-emerald-600 shrink-0"
              aria-hidden="true"
            />
            <p>
              Perubahan tarif otomatis tersimpan dan diperbarui pada estimasi pemesanan pelanggan.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 32: LAPORAN USAHA
      ========================================================================== */}
      {adminTab === 'LAPORAN' && (
        <div className="space-y-6">
          {/* Stat Cards from Screen 32 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#dce5f0] rounded-[14px] p-5 shadow-sm">
              <span className="text-xs font-medium text-[#64748b]">Total Pesanan</span>
              <p className="text-2xl font-black text-[#0f2342] mt-1 tabular-nums">
                {reportStats.ordersCount}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 tabular-nums">
                <TrendUp size={13} weight="bold" aria-hidden="true" />
                <span>+14% dari minggu lalu</span>
              </p>
            </div>
            <div className="bg-white border border-[#dce5f0] rounded-[14px] p-5 shadow-sm">
              <span className="text-xs font-medium text-[#64748b]">Total Pendapatan</span>
              <p className="text-2xl font-black text-[#2562eb] mt-1 tabular-nums">
                {formatRupiah(reportStats.revenue)}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 tabular-nums">
                <TrendUp size={13} weight="bold" aria-hidden="true" />
                <span>Target bulanan 85%</span>
              </p>
            </div>
            <div className="bg-white border border-[#dce5f0] rounded-[14px] p-5 shadow-sm">
              <span className="text-xs font-medium text-[#64748b]">Pesanan Selesai</span>
              <p className="text-2xl font-black text-[#0f2342] mt-1 tabular-nums">
                {reportStats.completedCount}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 tabular-nums">
                <CheckCircle size={13} weight="fill" aria-hidden="true" />
                <span>Tingkat sukses 98.2%</span>
              </p>
            </div>
            <div className="bg-white border border-[#dce5f0] rounded-[14px] p-5 shadow-sm">
              <span className="text-xs font-medium text-[#64748b]">Rata-rata Order</span>
              <p className="text-2xl font-black text-[#0f2342] mt-1 tabular-nums">
                {formatRupiah(reportStats.averageOrderValue)}
              </p>
              <p className="text-[11px] text-[#64748b] mt-1">Stabil per transaksi</p>
            </div>
          </div>

          {/* Weekly Performance Breakdown Chart */}
          <div className="bg-white border border-[#dce5f0] rounded-[16px] p-7 shadow-sm">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
              <div>
                <h4 className="font-bold text-[#0f2342] text-base">
                  Ringkasan Performa Mingguan
                </h4>
                <p className="text-xs text-[#64748b]">Volume cucian harian (kg / order)</p>
              </div>
              <span className="text-xs bg-blue-50 text-[#2562eb] font-semibold px-2.5 py-1 rounded-full tabular-nums whitespace-nowrap">
                Periode 18 - 24 Nov 2026
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="flex items-end justify-between gap-3 h-48 pt-6 border-b border-[#e2e8f0] px-4">
              {WEEKLY_PERFORMANCE.map((item) => (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                >
                  <span className="text-[10px] text-slate-400 group-hover:text-blue-600 transition font-bold tabular-nums">
                    {item.orders}
                  </span>
                  <div
                    style={{ height: item.height }}
                    className="w-full max-w-[42px] bg-blue-500 hover:bg-blue-600 transition-all rounded-t-md shadow-sm"
                  />
                  <span className="text-xs font-semibold text-[#0f2342] mt-1">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
