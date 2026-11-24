'use client';

import React, { useState } from 'react';
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
} from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';
import { courierConfirmSchema, CourierConfirmFormValues } from '@/lib/validations';
import { CourierTask } from '@/types';

export default function KurirPortal() {
  const {
    kurirTab,
    setKurirTab,
    courierTasks,
    activeTaskId,
    setActiveTaskId,
    updateTaskStatus,
    updateOrderStatus,
    showToast,
  } = useApp();

  const activeTask = courierTasks.find((t) => t.id === activeTaskId) || courierTasks[0];
  const [lastConfirmedWeight, setLastConfirmedWeight] = useState<number>(activeTask?.weight || 4);
  const [isDoneView, setIsDoneView] = useState<boolean>(false);

  const confirmForm = useForm<CourierConfirmFormValues>({
    resolver: zodResolver(courierConfirmSchema),
    defaultValues: {
      actualWeight: activeTask?.weight || 4,
      confirmedNotes: 'Pakaian telah ditimbang dan dimasukkan ke kantong laundry.',
    },
  });

  const handleSelectTask = (task: CourierTask) => {
    setActiveTaskId(task.id);
    setLastConfirmedWeight(task.weight);
    confirmForm.reset({
      actualWeight: task.weight,
      confirmedNotes: 'Pakaian telah ditimbang dan dimasukkan ke kantong laundry.',
    });
    setKurirTab('TUGAS'); // Screen 23
    setIsDoneView(false);
  };

  const handleConfirmTask = (data: CourierConfirmFormValues) => {
    setLastConfirmedWeight(data.actualWeight);
    updateTaskStatus(activeTask.id, 'COMPLETED', data.actualWeight);
    if (activeTask.type === 'Pickup') {
      updateOrderStatus(activeTask.orderId, 'DITERIMA');
    } else {
      updateOrderStatus(activeTask.orderId, 'SELESAI');
    }
    showToast(`Tugas ${activeTask.orderId} berhasil dikonfirmasi (${data.actualWeight} kg).`, 'success');
    setIsDoneView(true); // Screen 26 · Selesai
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f5f8fc] min-h-full p-6 sm:p-10">
      {/* Brand Header */}
      <div className="flex items-center justify-between w-full h-[34px] mb-6">
        <p className="text-[13px] text-[#64748b] font-normal">
          {kurirTab === 'JADWAL' && 'Jadwal / Jadwal pickup & delivery'}
          {kurirTab === 'TUGAS' && `Jadwal / Tugas ${activeTask?.orderId || 'IL-1024'}`}
          {kurirTab === 'RUTE' && 'Jadwal / Rute pengantaran'}
          {kurirTab === 'PROFIL' && 'Jadwal / Profil Kurir'}
        </p>
        <span className="bg-[#dbeafe] text-[#2562eb] text-xs font-medium px-3 py-1 rounded-full">
          Kurir
        </span>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-[28px] font-bold text-[#0f2342] leading-tight">
          {isDoneView
            ? 'Tugas selesai'
            : kurirTab === 'JADWAL'
            ? 'Jadwal pickup & delivery'
            : kurirTab === 'TUGAS'
            ? `Tugas ${activeTask?.orderId}`
            : kurirTab === 'RUTE'
            ? 'Rute pengantaran'
            : 'Profil Kurir'}
        </h2>
        <p className="text-sm text-[#64748b]">
          {isDoneView
            ? 'Ringkasan tugas yang baru saja diselesaikan.'
            : kurirTab === 'JADWAL'
            ? 'Hari ini · 24 Nov · Prioritas penjemputan dan pengantaran pelanggan'
            : kurirTab === 'TUGAS'
            ? `${activeTask?.type} pelanggan ${activeTask?.customerName}`
            : kurirTab === 'RUTE'
            ? 'Navigasi perjalanan dan peta lokasi pelanggan'
            : 'Informasi kurir operasional lapangan'}
        </p>
      </div>

      {/* =========================================================================
          SCREEN 26: TUGAS SELESAI
      ========================================================================== */}
      {isDoneView && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-8 shadow-sm flex flex-col gap-6 max-w-xl">
          <div className="bg-emerald-50 border border-emerald-200 rounded-[12px] p-6 text-center">
            <CheckCircle size={40} weight="fill" className="text-emerald-600 mx-auto" />
            <h3 className="text-xl font-bold text-emerald-900 mt-2">Tugas Selesai</h3>
            <p className="text-xs text-emerald-700 mt-1">
              Order {activeTask.orderId} telah berhasil dikonfirmasi statusnya menjadi{' '}
              <strong>{activeTask.type === 'Pickup' ? 'Diterima di Laundry' : 'Selesai Diantar'}</strong>.
            </p>
          </div>

          <div className="border border-[#e2e8f0] rounded-[12px] p-4 bg-[#f8fafc] text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#64748b]">Nomor Order:</span>
              <span className="font-bold text-[#0f2342] tabular-nums">{activeTask.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Pelanggan:</span>
              <span className="font-semibold text-[#0f2342]">{activeTask.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Berat Ditimbang:</span>
              <span className="font-bold text-[#2562eb] tabular-nums">{lastConfirmedWeight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748b]">Waktu Konfirmasi:</span>
              <span className="tabular-nums">Hari ini, 11:20 WIB</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsDoneView(false);
              setKurirTab('JADWAL');
            }}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs h-11 rounded-[10px] transition text-center shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>Kembali ke Jadwal Tugas Lain</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          SCREEN 22: JADWAL KURIR
      ========================================================================== */}
      {!isDoneView && kurirTab === 'JADWAL' && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-7 shadow-sm flex flex-col gap-6">
          <div className="border border-[#e2e8f0] rounded-[12px] overflow-hidden">
            <div className="bg-slate-50 px-5 py-3 border-b border-[#e2e8f0] flex justify-between text-xs font-bold text-[#0f2342]">
              <span className="w-24">Waktu</span>
              <span className="flex-1">Tugas & Pelanggan</span>
              <span className="w-28 text-right">Aksi</span>
            </div>

            <div className="divide-y divide-[#e2e8f0]">
              {courierTasks.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTask(t)}
                  className={`w-full text-left px-5 py-4 flex items-center justify-between gap-3 cursor-pointer transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
                    t.id === activeTaskId ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="w-24 font-bold text-sm text-[#0f2342] tabular-nums shrink-0">{t.time}</span>
                  <span className="flex-1 min-w-0 block">
                    <span className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          t.type === 'Pickup' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.type}
                      </span>
                      <span className="font-semibold text-xs text-[#0f2342] tabular-nums">{t.orderId}</span>
                      <span className="text-xs text-[#64748b]">· {t.customerName}</span>
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5 truncate max-w-md">{t.address}</span>
                  </span>
                  <span className="w-28 text-right shrink-0">
                    {t.status === 'COMPLETED' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                        <Check size={12} weight="bold" />
                        <span>Selesai</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-end gap-1 text-xs font-bold text-[#2562eb] hover:underline whitespace-nowrap">
                        <span>Lihat Tugas</span>
                        <ArrowRight size={12} weight="bold" />
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 23 & 25: DETAIL TUGAS & KONFIRMASI
      ========================================================================== */}
      {!isDoneView && kurirTab === 'TUGAS' && activeTask && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Info */}
          <div className="bg-white border border-[#dce5f0] rounded-[16px] p-7 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                <div>
                  <span className="text-xs font-semibold text-blue-600">ID Tugas</span>
                  <h3 className="text-2xl font-black text-[#0f2342] mt-0.5 tabular-nums">{activeTask.orderId}</h3>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {activeTask.type}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Nama Pelanggan:</span>
                  <span className="font-bold text-[#0f2342]">{activeTask.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Nomor Telepon:</span>
                  <a
                    href={`tel:${activeTask.phone}`}
                    className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:underline tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded"
                  >
                    <Phone size={14} weight="bold" />
                    <span>{activeTask.phone}</span>
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Alamat:</span>
                  <span className="font-medium text-[#0f2342] text-right max-w-xs">{activeTask.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Layanan:</span>
                  <span>{activeTask.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748b]">Jarak Tempuh:</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {activeTask.distance} ({activeTask.eta})
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#e2e8f0] flex gap-3">
              <button
                type="button"
                onClick={() => setKurirTab('RUTE')}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-xs font-bold text-[#0f2342] py-2.5 rounded-[10px] transition text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
              >
                <MapTrifold size={16} weight="bold" />
                <span>Buka Rute Navigasi</span>
              </button>
            </div>
          </div>

          {/* Validation & Confirm Form (Screen 25) */}
          <form
            onSubmit={confirmForm.handleSubmit(handleConfirmTask)}
            noValidate
            className="bg-white border border-[#dce5f0] rounded-[16px] p-7 shadow-sm flex flex-col justify-between"
          >
            <div>
              <h4 className="font-bold text-[#0f2342] text-base mb-4 border-b border-[#e2e8f0] pb-2">
                Validasi & Konfirmasi Lapangan
              </h4>

              <div className="space-y-4">
                <div>
                  <label htmlFor="kurir-actual-weight" className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                    Berat Timbangan Digital Aktual (kg)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="kurir-actual-weight"
                      type="number"
                      step="0.5"
                      min="0.5"
                      {...confirmForm.register('actualWeight', { valueAsNumber: true })}
                      className={`w-32 bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-base font-bold text-[#0f2342] placeholder:text-slate-400 focus:outline-none tabular-nums ${
                        confirmForm.formState.errors.actualWeight
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-[#cbd5e1] focus:border-[#2562eb]'
                      }`}
                    />
                    <span className="text-xs text-[#64748b]">Timbang langsung di depan pelanggan</span>
                  </div>
                  {confirmForm.formState.errors.actualWeight && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">
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
                    rows={2}
                    {...confirmForm.register('confirmedNotes')}
                    className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-xs text-[#0f2342] placeholder:text-slate-400 focus:outline-none ${
                      confirmForm.formState.errors.confirmedNotes
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#cbd5e1] focus:border-[#2562eb]'
                    }`}
                  />
                  {confirmForm.formState.errors.confirmedNotes && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium">
                      {confirmForm.formState.errors.confirmedNotes.message}
                    </p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-[#0f2342]">
                  <p className="font-semibold text-[#2562eb]">Status akan diperbarui:</p>
                  <p className="flex items-center gap-1.5 text-[#64748b] mt-0.5">
                    <ArrowRight size={12} weight="bold" className="text-[#2562eb] shrink-0" />
                    <span>
                      {activeTask.type === 'Pickup' ? 'Cucian DITERIMA di workshop' : 'Cucian SELESAI diantar'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-12 rounded-[10px] transition text-center shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
            >
              <Check size={16} weight="bold" />
              <span>Konfirmasi {activeTask.type} Selesai</span>
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          SCREEN 24: RUTE PENGANTARAN
      ========================================================================== */}
      {!isDoneView && kurirTab === 'RUTE' && activeTask && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-7 shadow-sm flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Simulator */}
            <div className="border border-[#e2e8f0] rounded-[12px] overflow-hidden flex flex-col">
              <div className="bg-slate-100 p-3 border-b border-[#e2e8f0] flex justify-between text-xs font-bold text-[#0f2342]">
                <span>Pratinjau Rute Menuju Lokasi</span>
                <span className="text-blue-600 font-semibold tabular-nums">
                  {activeTask.eta} ({activeTask.distance})
                </span>
              </div>
              <div className="bg-slate-200 h-72 relative flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#2562eb_1px,transparent_1px)] [background-size:20px_20px]"></div>

                {/* Simulated route line */}
                <div className="absolute w-2/3 h-2 bg-blue-500 rounded-full rotate-6 shadow-md"></div>

                <div className="absolute left-10 top-16 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                  Workshop Iqbal Laundry
                </div>

                <div className="absolute right-12 bottom-16 inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow">
                  <MapPin size={12} weight="fill" />
                  <span>{activeTask.customerName}</span>
                </div>
              </div>
              <p className="p-3 text-[11px] text-[#64748b] bg-[#f8fafc]">
                Rute tercepat melalui jalan protokol bebas hambatan macet.
              </p>
            </div>

            {/* Travel details */}
            <div className="flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#0f2342] text-base mb-3 border-b border-[#e2e8f0] pb-2">
                  Detail Perjalanan & Navigasi
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-[#64748b]">Tujuan:</span>
                    <span className="font-semibold text-[#0f2342] text-right">{activeTask.address}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-[#64748b]">Jarak dari Toko:</span>
                    <span className="font-bold text-[#0f2342] tabular-nums">{activeTask.distance}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-[#64748b]">Estimasi Waktu Tiba:</span>
                    <span className="font-bold text-emerald-600 tabular-nums">{activeTask.eta}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748b]">Kontak Pelanggan:</span>
                    <span className="font-medium text-blue-600 tabular-nums">{activeTask.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => showToast(`Navigasi Google Maps dibuka untuk rute ke ${activeTask.address}.`, 'info')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs h-11 rounded-[10px] transition text-center shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
                >
                  <NavigationArrow size={15} weight="fill" />
                  <span>Buka di Google Maps</span>
                </button>
                <button
                  type="button"
                  onClick={() => setKurirTab('TUGAS')}
                  className="border border-[#cbd5e1] hover:bg-slate-50 text-xs font-semibold text-[#0f2342] h-11 px-4 rounded-[10px] transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
                >
                  Lanjut Validasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFIL TAB */}
      {!isDoneView && kurirTab === 'PROFIL' && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-7 shadow-sm max-w-xl space-y-4">
          <h4 className="font-bold text-[#0f2342] text-base border-b border-[#e2e8f0] pb-2">
            Profil Kurir Lapangan
          </h4>
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-lg">
              KR
            </div>
            <div>
              <p className="font-bold text-[#0f2342]">Kurniawan R.</p>
              <p className="text-xs text-[#64748b] tabular-nums">Kurir Senior · ID: KR-04</p>
            </div>
          </div>
          <div className="text-xs space-y-2 text-[#64748b] pt-2">
            <p>• Armada Motor: Honda Vario (B 4321 KZA)</p>
            <p>• Area Tugas: Bandung Kota & Sekitarnya</p>
            <p className="tabular-nums">• Performa Bulan Ini: 142 Pengantaran Selesai</p>
          </div>
        </div>
      )}
    </div>
  );
}
