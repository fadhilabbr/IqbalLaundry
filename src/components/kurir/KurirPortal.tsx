'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle,
  Phone,
  MapTrifold,
  MapPin,
  NavigationArrow,
  Check,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  Scales,
  SignIn,
  SignOut,
} from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';
import { courierConfirmSchema, CourierConfirmFormValues } from '@/lib/validations';
import { CourierTask } from '@/types';

type ScheduleFilter = 'ALL' | 'ACTIVE' | 'COMPLETED';

function TaskTypeBadge({ type }: { type: CourierTask['type'] }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
        type === 'Pickup'
          ? 'bg-blue-50 text-[#2562eb] border border-blue-200'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      }`}
    >
      {type}
    </span>
  );
}

export default function KurirPortal() {
  const router = useRouter();
  const {
    kurirTab,
    setKurirTab,
    courierTasks,
    activeTaskId,
    setActiveTaskId,
    updateTaskStatus,
    updateOrderStatus,
    currentUser,
    logout,
    showToast,
  } = useApp();

  const activeTask = courierTasks.find((t) => t.id === activeTaskId) || courierTasks[0];
  const [lastConfirmedWeight, setLastConfirmedWeight] = useState<number>(activeTask?.weight || 4);
  const [isDoneView, setIsDoneView] = useState<boolean>(false);
  const [scheduleFilter, setScheduleFilter] = useState<ScheduleFilter>('ALL');
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

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

  const confirmForm = useForm<CourierConfirmFormValues>({
    resolver: zodResolver(courierConfirmSchema),
    defaultValues: {
      actualWeight: activeTask?.weight || 4,
      confirmedNotes: 'Pakaian telah ditimbang dan dimasukkan ke kantong laundry.',
    },
  });

  const handleSelectTask = (task: CourierTask, targetTab: 'TUGAS' | 'RUTE' = 'TUGAS') => {
    setActiveTaskId(task.id);
    setLastConfirmedWeight(task.weight);
    confirmForm.reset({
      actualWeight: task.weight,
      confirmedNotes: 'Pakaian telah ditimbang dan dimasukkan ke kantong laundry.',
    });
    setKurirTab(targetTab);
    setIsDoneView(false);
  };

  const handleConfirmTask = (data: CourierConfirmFormValues) => {
    if (!activeTask) return;
    setLastConfirmedWeight(data.actualWeight);
    updateTaskStatus(activeTask.id, 'COMPLETED', data.actualWeight);
    if (activeTask.type === 'Pickup') {
      updateOrderStatus(activeTask.orderId, 'DITERIMA');
    } else {
      updateOrderStatus(activeTask.orderId, 'SELESAI');
    }
    showToast(`Tugas ${activeTask.orderId} berhasil dikonfirmasi (${data.actualWeight} kg).`, 'success');
    setIsDoneView(true);
  };

  const totalCount = courierTasks.length;
  const activeCount = courierTasks.filter((t) => t.status !== 'COMPLETED').length;
  const completedCount = courierTasks.filter((t) => t.status === 'COMPLETED').length;

  const filteredTasks = courierTasks.filter((t) => {
    if (scheduleFilter === 'ACTIVE') return t.status !== 'COMPLETED';
    if (scheduleFilter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#f5f8fc] min-h-full p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <header className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#0f2342] leading-tight">
          {isDoneView
            ? 'Tugas Selesai Dikonfirmasi'
            : kurirTab === 'JADWAL'
            ? 'Jadwal Pickup & Delivery'
            : kurirTab === 'TUGAS'
            ? `Detail Tugas ${activeTask?.orderId ?? ''}`
            : kurirTab === 'RUTE'
            ? 'Rute Pengantaran'
            : 'Profil Kurir'}
        </h1>
        <p className="text-sm text-[#475569] tabular-nums">
          {isDoneView
            ? 'Ringkasan penimbangan dan pembaruan status order.'
            : kurirTab === 'JADWAL'
            ? '24 Nov · Prioritas penjemputan dan pengantaran area Bandung Kota'
            : kurirTab === 'TUGAS'
            ? `${activeTask?.type ?? ''} · Pelanggan ${activeTask?.customerName ?? ''}`
            : kurirTab === 'RUTE'
            ? 'Urutan pemberhentian dan estimasi waktu tempuh pelanggan'
            : 'Informasi armada dan profil operasional lapangan'}
        </p>
      </header>

      {/* =========================================================================
          SCREEN 26: TUGAS SELESAI
      ========================================================================== */}
      {isDoneView && activeTask && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-5 max-w-xl">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 text-center space-y-1.5">
            <CheckCircle size={36} weight="fill" className="text-emerald-600 mx-auto" aria-hidden="true" />
            <h2 className="text-lg font-bold text-emerald-900">Tugas Selesai</h2>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Order <span className="font-bold tabular-nums">{activeTask.orderId}</span> berhasil
              diperbarui menjadi{' '}
              <strong>
                {activeTask.type === 'Pickup' ? 'Diterima di Laundry' : 'Selesai Diantar'}
              </strong>
              .
            </p>
          </div>

          <div className="border border-[#e2e8f0] rounded-xl p-4 bg-[#f8fafc] text-xs sm:text-sm space-y-2.5">
            <div className="flex justify-between gap-4">
              <span className="text-[#64748b]">Nomor Order</span>
              <span className="font-bold text-[#0f2342] tabular-nums">{activeTask.orderId}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#64748b]">Pelanggan</span>
              <span className="font-semibold text-[#0f2342]">{activeTask.customerName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#64748b]">Berat Ditimbang</span>
              <span className="font-bold text-[#2562eb] tabular-nums">{lastConfirmedWeight} kg</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#64748b]">Waktu Konfirmasi</span>
              <span className="text-[#0f2342] tabular-nums">Hari ini, 11:20 WIB</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsDoneView(false);
              setScheduleFilter('ACTIVE');
              setKurirTab('JADWAL');
            }}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#2562eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm h-11 rounded-lg transition duration-150 ease-out shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
          >
            <ArrowLeft size={15} weight="bold" aria-hidden="true" />
            <span>Kembali ke Jadwal Aktif</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          SCREEN 22: JADWAL KURIR
      ========================================================================== */}
      {!isDoneView && kurirTab === 'JADWAL' && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-5">
          {/* Page-Level Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter status tugas">
              {(
                [
                  { id: 'ALL', label: 'Semua', count: totalCount },
                  { id: 'ACTIVE', label: 'Aktif', count: activeCount },
                  { id: 'COMPLETED', label: 'Selesai', count: completedCount },
                ] as const
              ).map((item) => {
                const isActive = scheduleFilter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScheduleFilter(item.id)}
                    className={`inline-flex items-center gap-2 px-3.5 h-10 rounded-lg text-xs font-semibold transition duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap ${
                      isActive
                        ? 'bg-[#2562eb] text-white shadow-sm'
                        : 'bg-[#f8fafc] text-[#475569] border border-[#e2e8f0] hover:bg-slate-100 hover:text-[#0f2342]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white text-[#0f2342] border border-[#e2e8f0]'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Empty State */}
          {filteredTasks.length === 0 ? (
            <div className="border border-dashed border-[#cbd5e1] bg-[#f8fafc] rounded-xl p-6 text-center space-y-3">
              <CalendarCheck size={32} weight="duotone" className="text-[#64748b] mx-auto" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#0f2342]">
                  {scheduleFilter === 'ACTIVE'
                    ? 'Semua tugas hari ini sudah selesai'
                    : scheduleFilter === 'COMPLETED'
                    ? 'Belum ada tugas yang diselesaikan'
                    : 'Belum ada jadwal tugas'}
                </p>
                <p className="text-xs text-[#64748b]">
                  Tampilkan seluruh jadwal untuk memeriksa daftar tugas lainnya.
                </p>
              </div>
              {scheduleFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setScheduleFilter('ALL')}
                  className="inline-flex items-center justify-center bg-white border border-[#cbd5e1] hover:bg-slate-100 text-[#0f2342] font-semibold text-xs px-4 h-10 rounded-lg transition duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                >
                  Tampilkan Semua Tugas
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Cards (< md) */}
              <div className="md:hidden space-y-3">
                {filteredTasks.map((t) => {
                  const isSelected = t.id === activeTaskId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTask(t)}
                      className={`w-full text-left border rounded-xl p-4 space-y-3 transition duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
                        isSelected
                          ? 'border-[#2562eb] bg-[#eff6ff]/60'
                          : 'border-[#e2e8f0] bg-[#f8fafc] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0f2342] tabular-nums">{t.time}</span>
                          <TaskTypeBadge type={t.type} />
                        </div>
                        {t.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                            <Check size={12} weight="bold" aria-hidden="true" />
                            <span>Selesai</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2562eb]">
                            <span>Buka Tugas</span>
                            <ArrowRight size={12} weight="bold" aria-hidden="true" />
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#0f2342] tabular-nums">
                          {t.orderId} · {t.customerName}
                        </p>
                        <p className="text-xs text-[#475569] leading-relaxed">{t.address}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0] text-xs text-[#64748b] tabular-nums">
                        <span>
                          {t.serviceName} · {t.weight} kg
                        </span>
                        <span>
                          {t.distance} · {t.eta}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Desktop Aligned Rows (md+) */}
              <div className="hidden md:block border border-[#e2e8f0] rounded-xl overflow-hidden">
                <div className="bg-[#f8fafc] px-5 py-3 border-b border-[#e2e8f0] grid grid-cols-12 gap-4 text-xs font-semibold text-[#475569]">
                  <span className="col-span-2">Waktu</span>
                  <span className="col-span-4">Tugas & Pelanggan</span>
                  <span className="col-span-4">Alamat & Jarak</span>
                  <span className="col-span-2 text-right">Aksi</span>
                </div>

                <div className="divide-y divide-[#e2e8f0]">
                  {filteredTasks.map((t) => {
                    const isSelected = t.id === activeTaskId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTask(t)}
                        className={`w-full text-left px-5 py-4 grid grid-cols-12 gap-4 items-center cursor-pointer transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
                          isSelected ? 'bg-[#eff6ff]/60' : 'bg-white hover:bg-[#f8fafc]'
                        }`}
                      >
                        <span className="col-span-2 flex flex-col items-start gap-1">
                          <span className="font-bold text-sm text-[#0f2342] tabular-nums">{t.time}</span>
                          <TaskTypeBadge type={t.type} />
                        </span>

                        <span className="col-span-4 min-w-0 block">
                          <span className="block font-bold text-sm text-[#0f2342] tabular-nums">
                            {t.orderId} · {t.customerName}
                          </span>
                          <span className="block text-xs text-[#64748b] tabular-nums mt-0.5">
                            {t.serviceName} · {t.weight} kg
                          </span>
                        </span>

                        <span className="col-span-4 min-w-0 block">
                          <span className="block text-xs font-medium text-[#0f2342]">{t.address}</span>
                          <span className="block text-xs text-[#64748b] tabular-nums mt-0.5">
                            {t.distance} · Estimasi {t.eta}
                          </span>
                        </span>

                        <span className="col-span-2 flex justify-end">
                          {t.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                              <Check size={12} weight="bold" aria-hidden="true" />
                              <span>Selesai</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2562eb] whitespace-nowrap">
                              <span>Lihat Tugas</span>
                              <ArrowRight size={13} weight="bold" aria-hidden="true" />
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================================================
          SCREENS 23-25: DETAIL TUGAS & KONFIRMASI TIMBANGAN
      ========================================================================== */}
      {!isDoneView && kurirTab === 'TUGAS' && activeTask && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Task Context Card */}
          <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#e2e8f0]">
              <div>
                <span className="text-xs font-semibold text-[#2562eb]">ID Order</span>
                <h2 className="text-2xl font-bold text-[#0f2342] mt-0.5 tabular-nums">
                  {activeTask.orderId}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <TaskTypeBadge type={activeTask.type} />
                {activeTask.status === 'COMPLETED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                    <Check size={12} weight="bold" aria-hidden="true" />
                    <span>Selesai</span>
                  </span>
                )}
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#64748b]">Pelanggan</span>
                <span className="font-bold text-[#0f2342] text-right">{activeTask.customerName}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-[#64748b]">Telepon / WhatsApp</span>
                <a
                  href={`tel:${activeTask.phone}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#2562eb] hover:text-[#1d4ed8] hover:underline tabular-nums transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded"
                >
                  <Phone size={14} weight="bold" aria-hidden="true" />
                  <span>{activeTask.phone}</span>
                </a>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#64748b] shrink-0">Alamat</span>
                <span className="font-medium text-[#0f2342] text-right">{activeTask.address}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#64748b]">Layanan</span>
                <span className="font-medium text-[#0f2342] tabular-nums text-right">
                  {activeTask.serviceName} · {activeTask.weight} kg
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#64748b]">Jarak & Estimasi</span>
                <span className="font-semibold text-[#0f2342] tabular-nums">
                  {activeTask.distance} ({activeTask.eta})
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setKurirTab('RUTE')}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#f8fafc] border border-[#cbd5e1] hover:bg-slate-100 text-xs font-bold text-[#0f2342] h-11 px-4 rounded-lg transition duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
              >
                <MapTrifold size={16} weight="bold" aria-hidden="true" />
                <span>Buka Rute Navigasi</span>
              </button>
              <button
                type="button"
                onClick={() => setKurirTab('JADWAL')}
                className="inline-flex items-center justify-center gap-1.5 bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] text-xs font-semibold text-[#475569] h-11 px-4 rounded-lg transition duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
              >
                <ArrowLeft size={14} weight="bold" aria-hidden="true" />
                <span>Jadwal</span>
              </button>
            </div>
          </div>

          {/* Digital-Scale Confirmation Form (Screen 25) */}
          <form
            onSubmit={confirmForm.handleSubmit(handleConfirmTask)}
            noValidate
            className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-5"
          >
            <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-3">
              <Scales size={18} weight="bold" className="text-[#2562eb]" aria-hidden="true" />
              <h2 className="font-bold text-[#0f2342] text-base">Konfirmasi Timbangan Digital</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="kurir-actual-weight" className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                  Berat Timbangan Aktual (kg)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="kurir-actual-weight"
                    type="number"
                    step="0.5"
                    min="0.5"
                    {...confirmForm.register('actualWeight', { valueAsNumber: true })}
                    className={`w-36 bg-[#f8fafc] border rounded-lg px-3.5 py-2.5 text-base font-bold text-[#0f2342] placeholder:text-[#64748b] tabular-nums transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
                      confirmForm.formState.errors.actualWeight
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#cbd5e1] focus:border-[#2562eb]'
                    }`}
                  />
                  <span className="text-xs text-[#64748b]">Timbang di depan pelanggan</span>
                </div>
                {confirmForm.formState.errors.actualWeight && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">
                    {confirmForm.formState.errors.actualWeight.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="kurir-confirmed-notes" className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                  Catatan Kondisi Pakaian
                </label>
                <textarea
                  id="kurir-confirmed-notes"
                  rows={3}
                  {...confirmForm.register('confirmedNotes')}
                  className={`w-full bg-[#f8fafc] border rounded-lg px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-[#64748b] transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
                    confirmForm.formState.errors.confirmedNotes
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[#cbd5e1] focus:border-[#2562eb]'
                  }`}
                />
                {confirmForm.formState.errors.confirmedNotes && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">
                    {confirmForm.formState.errors.confirmedNotes.message}
                  </p>
                )}
              </div>

              <div className="bg-[#eff6ff] border border-blue-200 rounded-xl p-3.5 text-xs text-[#0f2342]">
                <p className="font-semibold text-[#2562eb]">Pembaruan status order:</p>
                <p className="flex items-center gap-1.5 text-[#475569] mt-1">
                  <ArrowRight size={12} weight="bold" className="text-[#2562eb] shrink-0" aria-hidden="true" />
                  <span>
                    {activeTask.type === 'Pickup'
                      ? 'Status berubah menjadi DITERIMA di workshop'
                      : 'Status berubah menjadi SELESAI diantar'}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#2562eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm h-11 rounded-lg transition duration-150 ease-out shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
            >
              <Check size={16} weight="bold" aria-hidden="true" />
              <span>Konfirmasi {activeTask.type} Selesai</span>
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          SCREEN 24: RUTE PENGANTARAN & TIMELINE BERURUTAN
      ========================================================================== */}
      {!isDoneView && kurirTab === 'RUTE' && activeTask && (
        <div className="space-y-6">
          {/* Active Stop Route Preview */}
          <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Map Preview */}
              <div className="border border-[#e2e8f0] rounded-xl overflow-hidden flex flex-col">
                <div className="bg-[#f8fafc] px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between text-xs font-bold text-[#0f2342]">
                  <span>Pratinjau Rute Tujuan</span>
                  <span className="text-[#2562eb] font-semibold tabular-nums">
                    {activeTask.eta} ({activeTask.distance})
                  </span>
                </div>
                <div className="bg-slate-100 h-60 relative flex items-center justify-center p-4">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#2562eb_1px,transparent_1px)] [background-size:20px_20px]"></div>
                  <div className="absolute w-2/3 h-1.5 bg-[#2562eb] rounded-full rotate-6 shadow-sm"></div>
                  <div className="absolute left-6 sm:left-10 top-12 bg-[#0f2342] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow">
                    Workshop Iqbal Laundry
                  </div>
                  <div className="absolute right-6 sm:right-10 bottom-12 inline-flex items-center gap-1 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow">
                    <MapPin size={12} weight="fill" aria-hidden="true" />
                    <span>{activeTask.customerName}</span>
                  </div>
                </div>
                <p className="px-4 py-2.5 text-xs text-[#64748b] bg-[#f8fafc] border-t border-[#e2e8f0]">
                  Rute tercepat melalui jalan utama Bandung Kota.
                </p>
              </div>

              {/* Active Stop Navigation Info */}
              <div className="flex flex-col justify-between gap-5">
                <div>
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3 mb-3">
                    <h2 className="font-bold text-[#0f2342] text-base">
                      Tujuan Aktif · {activeTask.orderId}
                    </h2>
                    <TaskTypeBadge type={activeTask.type} />
                  </div>
                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div className="flex justify-between gap-4 py-1 border-b border-[#e2e8f0]">
                      <span className="text-[#64748b]">Pelanggan</span>
                      <span className="font-semibold text-[#0f2342]">{activeTask.customerName}</span>
                    </div>
                    <div className="flex justify-between gap-4 py-1 border-b border-[#e2e8f0]">
                      <span className="text-[#64748b] shrink-0">Alamat</span>
                      <span className="font-medium text-[#0f2342] text-right">{activeTask.address}</span>
                    </div>
                    <div className="flex justify-between gap-4 py-1 border-b border-[#e2e8f0]">
                      <span className="text-[#64748b]">Jarak & Estimasi</span>
                      <span className="font-bold text-[#0f2342] tabular-nums">
                        {activeTask.distance} · {activeTask.eta}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 py-1">
                      <span className="text-[#64748b]">Kontak</span>
                      <a
                        href={`tel:${activeTask.phone}`}
                        className="font-semibold text-[#2562eb] hover:underline tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded"
                      >
                        {activeTask.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      showToast(`Navigasi Google Maps dibuka untuk rute ke ${activeTask.address}.`, 'info')
                    }
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#2562eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs h-11 px-4 rounded-lg transition duration-150 ease-out shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
                  >
                    <NavigationArrow size={15} weight="fill" aria-hidden="true" />
                    <span>Buka di Google Maps</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectTask(activeTask, 'TUGAS')}
                    className="inline-flex items-center justify-center gap-1.5 bg-[#f8fafc] border border-[#cbd5e1] hover:bg-slate-100 text-xs font-bold text-[#0f2342] h-11 px-4 rounded-lg transition duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
                  >
                    <span>Proses Tugas</span>
                    <ArrowRight size={13} weight="bold" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sequential Route Timeline */}
          <section className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3 mb-4">
              <h2 className="font-bold text-[#0f2342] text-base">Urutan Rute Pemberhentian</h2>
              <span className="text-xs font-medium text-[#64748b] tabular-nums">
                {courierTasks.length} titik lokasi
              </span>
            </div>

            <ol className="space-y-3">
              {courierTasks.map((stop, idx) => {
                const isCurrent = stop.id === activeTask.id;
                const isDone = stop.status === 'COMPLETED';
                return (
                  <li
                    key={stop.id}
                    className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-150 ease-out ${
                      isCurrent
                        ? 'border-[#2562eb] bg-[#eff6ff]/50'
                        : 'border-[#e2e8f0] bg-[#f8fafc]'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="flex flex-col items-center gap-1.5 pt-0.5 shrink-0">
                        <span
                          className={`size-7 rounded-full text-xs font-bold flex items-center justify-center tabular-nums ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-[#2562eb] text-white'
                              : 'bg-white border border-[#cbd5e1] text-[#0f2342]'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`size-2 rounded-full ${
                            isDone
                              ? 'bg-emerald-500'
                              : isCurrent
                              ? 'bg-[#2562eb]'
                              : 'bg-slate-300'
                          }`}
                        />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-[#0f2342] tabular-nums">
                            {stop.time}
                          </span>
                          <TaskTypeBadge type={stop.type} />
                          <span className="font-semibold text-xs text-[#0f2342] tabular-nums">
                            {stop.orderId}
                          </span>
                          <span className="text-xs text-[#475569]">· {stop.customerName}</span>
                        </div>
                        <p className="text-xs text-[#0f2342]">{stop.address}</p>
                        <p className="text-xs text-[#64748b] tabular-nums">
                          {stop.distance} · Estimasi {stop.eta} ·{' '}
                          {isDone ? 'Selesai' : isCurrent ? 'Titik aktif' : 'Menunggu giliran'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleSelectTask(stop, 'TUGAS')}
                        className={`inline-flex items-center justify-center gap-1.5 text-xs font-semibold h-10 px-4 rounded-lg transition duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap ${
                          isDone
                            ? 'bg-white border border-[#e2e8f0] text-[#475569] hover:bg-slate-100'
                            : 'bg-[#2562eb] hover:bg-[#1d4ed8] text-white shadow-sm'
                        }`}
                      >
                        <span>{isDone ? 'Lihat Tugas' : 'Proses Pemberhentian'}</span>
                        <ArrowRight size={13} weight="bold" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      )}

      {/* =========================================================================
          PROFIL KURIR
      ========================================================================== */}
      {!isDoneView && kurirTab === 'PROFIL' && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm max-w-xl space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-[#e2e8f0]">
            <div className="size-14 rounded-full bg-[#0f2342] text-white font-bold flex items-center justify-center text-lg shrink-0">
              KR
            </div>
            <div>
              <h2 className="font-bold text-[#0f2342] text-lg">Kurniawan R.</h2>
              <p className="text-xs text-[#64748b] tabular-nums">Kurir Senior · ID: KR-04</p>
            </div>
          </div>

          <div className="divide-y divide-[#e2e8f0] text-xs sm:text-sm">
            <div className="flex justify-between gap-4 py-3">
              <span className="text-[#64748b]">Armada Motor</span>
              <span className="font-semibold text-[#0f2342] tabular-nums">
                Honda Vario (B 4321 KZA)
              </span>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <span className="text-[#64748b]">Area Tugas</span>
              <span className="font-semibold text-[#0f2342]">Bandung Kota & Sekitarnya</span>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <span className="text-[#64748b]">Performa Bulan Ini</span>
              <span className="font-bold text-[#2562eb] tabular-nums">142 Pengantaran Selesai</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
            {currentUser ? (
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition duration-150 ease-out cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <SignOut size={16} weight="bold" aria-hidden="true" />
                <span>{isLoggingOut ? 'Keluar...' : 'Keluar dari Akun'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg bg-[#2562eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold transition duration-150 ease-out cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 whitespace-nowrap"
              >
                <SignIn size={16} weight="bold" aria-hidden="true" />
                <span>Masuk ke Akun</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
