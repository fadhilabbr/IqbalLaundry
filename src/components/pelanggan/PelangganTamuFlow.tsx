'use client';

import React, { useState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  WarningCircle,
  Info,
  MapPin,
  Clock,
  XCircle,
  Basket,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle,
  UploadSimple,
  QrCode,
  Bank,
  Money,
  Plus,
} from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';
import { formatRupiah } from '@/lib/data';
import {
  orderDetailsSchema,
  orderAddressSchema,
  OrderDetailsFormValues,
  OrderAddressFormValues,
} from '@/lib/validations';
import { Service } from '@/types';

function getStepLabel(step: number): string {
  if (step <= 3) return 'Pilih layanan';
  if (step <= 5) return 'Detail pesanan';
  if (step === 6) return 'Alamat pickup';
  if (step === 7) return 'Estimasi biaya';
  if (step <= 12) return 'Pembayaran';
  return 'Lacak pesanan';
}

export default function PelangganTamuFlow() {
  const {
    services,
    orders,
    activeOrderId,
    setActiveOrderId,
    createOrder,
    confirmPayment,
    guestStep,
    setGuestStep,
    guestSelectedService,
    setGuestSelectedService,
    showToast,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const detailsForm = useForm<OrderDetailsFormValues>({
    resolver: zodResolver(orderDetailsSchema),
    defaultValues: {
      customerName: 'Budi Santoso',
      phone: '081234567890',
      weight: 4,
      notes: 'Pakaian putih dipisah, tolong pewangi aroma ocean.',
    },
  });

  const addressForm = useForm<OrderAddressFormValues>({
    resolver: zodResolver(orderAddressSchema),
    defaultValues: {
      address: 'Jl. Soekarno Hatta No. 45, RT 02 / RW 05',
      landmark: 'Depan Alfamart gapura merah',
    },
  });

  const watchedWeight = useWatch({ control: detailsForm.control, name: 'weight' });
  const watchedCustomerName = useWatch({ control: detailsForm.control, name: 'customerName' });
  const watchedPhone = useWatch({ control: detailsForm.control, name: 'phone' });
  const watchedAddress = useWatch({ control: addressForm.control, name: 'address' });

  const safeWeight = Number.isFinite(watchedWeight) && watchedWeight >= 1 ? watchedWeight : 1;

  const [paymentMethod, setPaymentMethod] = useState<'QRIS' | 'TRANSFER' | 'COD'>('QRIS');
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadedProof, setUploadedProof] = useState<string | null>(null);

  // Current active order for tracking
  const currentOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  // Calculations
  const activeService = guestSelectedService || services[1] || services[0];
  const serviceCost = (activeService?.price || 8000) * safeWeight;
  const deliveryFee = 8000;
  const totalCost = serviceCost + deliveryFee;

  const handleSelectService = (srv: Service) => {
    setGuestSelectedService(srv);
    setGuestStep(3); // Screen 03: Layanan terpilih
  };

  const handleProceedToDetails = () => {
    if (!guestSelectedService) {
      setGuestStep(2); // Screen 02: Peringatan layanan
      return;
    }
    setGuestStep(4); // Screen 04: Detail pesanan
  };

  const onDetailsValid = () => {
    setFormError(null);
    setGuestStep(6); // Screen 06: Alamat map
  };

  const onDetailsInvalid = () => {
    setFormError('Pastikan nama lengkap, nomor WhatsApp, dan perkiraan berat sudah diisi dengan benar.');
    showToast('Mohon periksa kembali data pesanan yang masih salah.', 'error');
  };

  const onAddressValid = () => {
    setFormError(null);
    setGuestStep(7); // Screen 07: Estimasi
  };

  const handleCreateOrder = () => {
    const details = detailsForm.getValues();
    const addr = addressForm.getValues();
    const newOrder = createOrder({
      customerName: details.customerName,
      phone: details.phone,
      serviceId: activeService.id,
      serviceName: activeService.name,
      pricePerUnit: activeService.price,
      weight: Number.isFinite(details.weight) && details.weight >= 1 ? details.weight : 1,
      unit: activeService.unit,
      notes: details.notes || '',
      address: addr.address,
      landmark: addr.landmark || '',
      deliveryFee,
      paymentMethod,
    });
    showToast(`Pesanan ${newOrder.id} berhasil dibuat.`, 'success');
    setGuestStep(8); // Screen 08: Nomor pesanan
  };

  const handleGoToPayment = () => {
    setGuestStep(9); // Screen 09: Metode bayar
  };

  const handleSelectPaymentMethod = (method: 'QRIS' | 'TRANSFER' | 'COD') => {
    setPaymentMethod(method);
    if (method === 'QRIS') {
      setGuestStep(10); // Screen 10: QRIS
    } else if (method === 'TRANSFER') {
      setGuestStep(12); // Screen 12: Bukti bayar
    } else {
      // COD / Bayar saat pickup
      if (currentOrder) {
        confirmPayment(currentOrder.id, 'COD');
        showToast(`Pembayaran tunai (COD) untuk ${currentOrder.id} dikonfirmasi.`, 'success');
      }
      setGuestStep(15); // Screen 15: Detail status
    }
  };

  const handlePaymentSuccess = () => {
    if (currentOrder) {
      confirmPayment(currentOrder.id, paymentMethod);
      showToast(`Pembayaran pesanan ${currentOrder.id} berhasil diverifikasi.`, 'success');
    }
    setGuestStep(15); // Screen 15: Detail status
  };

  const handlePaymentFailed = () => {
    setGuestStep(11); // Screen 11: Gagal bayar
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedProof(file.name);
      showToast(`File "${file.name}" siap dikirim.`, 'info');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f5f8fc] min-h-full p-4 sm:p-8 lg:p-10">
      {/* Brand & Breadcrumb Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-[#64748b]">
          <span className="font-semibold text-[#0f2342]">Beranda</span>
          <span>/</span>
          <span className="text-blue-600 font-medium">{getStepLabel(guestStep)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#dbeafe] text-[#2562eb] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            Pelanggan Tamu
          </span>
        </div>
      </div>

      {/* =========================================================================
          SCREEN 01: PILIH LAYANAN (Phase 1)
      ========================================================================== */}
      {guestStep === 1 && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div>
            <h3 className="text-xl font-bold text-[#0f2342]">Pilih Layanan Laundry</h3>
            <p className="text-xs sm:text-sm text-[#64748b] mt-1">
              Pilih salah satu layanan populer berikut untuk melanjutkan proses order jemput ke lokasi Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((srv) => (
              <button
                key={srv.id}
                type="button"
                onClick={() => handleSelectService(srv)}
                className="w-full text-left group border rounded-[14px] p-5 sm:p-6 cursor-pointer transition-all flex flex-col justify-between h-[140px] relative bg-[#f8fafc] border-[#e2e8f0] hover:bg-blue-50/70 hover:border-[#2562eb] hover:ring-2 hover:ring-blue-500/20 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-2 w-full">
                  <div>
                    <p className="font-bold text-[#0f2342] text-base leading-snug">{srv.name}</p>
                    <p className="text-xs text-[#64748b] mt-0.5 line-clamp-1">{srv.description}</p>
                  </div>
                  {srv.popular && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold shrink-0">
                      Populer
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 w-full">
                  <p className="font-extrabold text-[#2562eb] text-lg sm:text-[20px] tabular-nums">
                    {formatRupiah(srv.price)}
                    <span className="text-xs font-normal text-slate-500">/{srv.unit}</span>
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-[#2562eb] transition-colors">
                    <span>Pilih</span>
                    <ArrowRight size={14} weight="bold" />
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-xs font-semibold text-[#64748b] hover:text-[#0f2342] transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <Info size={16} weight="regular" className="shrink-0" />
              <span>Lihat Informasi & Ketentuan Layanan</span>
            </button>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleProceedToDetails}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-sm h-12 px-8 rounded-[10px] transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
              >
                <span>Lanjutkan ke Data Pesanan</span>
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 02: PERINGATAN LAYANAN (Phase 1)
      ========================================================================== */}
      {guestStep === 2 && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div className="bg-amber-50 border border-amber-200 rounded-[14px] p-6">
            <h3 className="font-bold text-amber-900 text-lg mb-2 flex items-center gap-2">
              <WarningCircle size={20} weight="bold" className="text-amber-600 shrink-0" />
              <span>Informasi & Ketentuan Layanan</span>
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              Harap perhatikan ketentuan operasional berikut agar proses penjemputan dan pencucian berjalan tepat waktu:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              <div className="bg-white/90 p-4 rounded-xl border border-amber-200 shadow-xs">
                <p className="text-xs text-amber-700 font-semibold">Minimum Order</p>
                <p className="text-xl font-black text-amber-950 mt-1 tabular-nums">3 kg</p>
                <p className="text-[11px] text-amber-600 mt-1">Berat di bawah 3 kg tetap dihitung minimal 3 kg.</p>
              </div>
              <div className="bg-white/90 p-4 rounded-xl border border-amber-200 shadow-xs">
                <p className="text-xs text-amber-700 font-semibold">Estimasi Pengerjaan</p>
                <p className="text-xl font-black text-amber-950 mt-1 tabular-nums">1 - 2 Hari</p>
                <p className="text-[11px] text-amber-600 mt-1">Pakaian wangi, bersih, dan higienis bergaransi.</p>
              </div>
              <div className="bg-white/90 p-4 rounded-xl border border-amber-200 shadow-xs">
                <p className="text-xs text-amber-700 font-semibold">Jam Operasional Kurir</p>
                <p className="text-xl font-black text-amber-950 mt-1 tabular-nums">10.00 - 17.00</p>
                <p className="text-[11px] text-amber-600 mt-1">Kurir menjemput sesuai koordinat alamat map Anda.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Kembali ke Layanan</span>
            </button>
            <button
              type="button"
              onClick={() => setGuestStep(guestSelectedService ? 3 : 1)}
              className="inline-flex items-center gap-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm h-12 px-8 rounded-[10px] transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <span>Saya Mengerti, Lanjutkan</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 03: LAYANAN TERPILIH (Phase 1)
      ========================================================================== */}
      {guestStep === 3 && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          <div className="bg-blue-50/70 border border-blue-200 rounded-[14px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-100 px-2.5 py-0.5 rounded-full mb-1">
                Layanan Terpilih
              </span>
              <h3 className="text-2xl font-black text-[#0f2342] mt-1">{activeService.name}</h3>
              <p className="text-xs sm:text-sm text-[#64748b] mt-1">{activeService.description}</p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-2xl sm:text-3xl font-black text-[#2562eb] tabular-nums">
                {formatRupiah(activeService.price)}
                <span className="text-sm font-normal text-slate-500">/{activeService.unit}</span>
              </p>
              <button
                type="button"
                onClick={() => setGuestStep(1)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2562eb] hover:underline mt-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded"
              >
                <span>Ganti pilihan layanan</span>
                <ArrowUpRight size={14} weight="bold" />
              </button>
            </div>
          </div>

          <div className="border border-[#e2e8f0] rounded-[14px] p-5 bg-[#f8fafc]">
            <h4 className="font-bold text-sm text-[#0f2342] mb-2.5">Keunggulan & Standar Pengerjaan:</h4>
            <ul className="text-xs sm:text-sm text-[#64748b] space-y-2 list-disc pl-5">
              <li>Pencucian higienis 1 mesin terpisah per pelanggan (pakaian tidak dicampur).</li>
              <li>Pilihan deterjen anti-apek dan pelembut wangi premium tahan lama.</li>
              <li>Gratis plastik packing rapi dan tahan percikan air saat pengantaran.</li>
            </ul>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Ganti Layanan</span>
            </button>
            <button
              type="button"
              onClick={() => setGuestStep(4)}
              className="inline-flex items-center gap-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm h-12 px-8 rounded-[10px] transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <span>Lanjutkan ke Data Pesanan</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 04: DETAIL PESANAN (Phase 2)
      ========================================================================== */}
      {guestStep === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Columns: Form */}
          <form
            onSubmit={detailsForm.handleSubmit(onDetailsValid, onDetailsInvalid)}
            noValidate
            className="lg:col-span-2 bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 shadow-sm flex flex-col gap-5"
          >
            <div className="border-b border-[#e2e8f0] pb-3">
              <h3 className="font-bold text-[#0f2342] text-lg">
                Data Pemesan & Cucian
              </h3>
              <p className="text-xs text-[#64748b] mt-0.5">
                Pastikan nama dan nomor WhatsApp aktif agar kurir mudah menghubungi Anda saat penjemputan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0f2342] mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  {...detailsForm.register('customerName')}
                  placeholder="Contoh: Budi Santoso"
                  className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-slate-400 focus:outline-none focus:bg-white transition ${
                    detailsForm.formState.errors.customerName
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[#cbd5e1] focus:border-[#2562eb]'
                  }`}
                />
                {detailsForm.formState.errors.customerName && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {detailsForm.formState.errors.customerName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0f2342] mb-1.5">Nomor WhatsApp Aktif</label>
                <input
                  type="tel"
                  {...detailsForm.register('phone')}
                  placeholder="08xxxxxxxxxx"
                  className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm tabular-nums text-[#0f2342] placeholder:text-slate-400 focus:outline-none focus:bg-white transition ${
                    detailsForm.formState.errors.phone
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[#cbd5e1] focus:border-[#2562eb]'
                  }`}
                />
                {detailsForm.formState.errors.phone && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {detailsForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                  Perkiraan Berat ({activeService.unit})
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    {...detailsForm.register('weight', { valueAsNumber: true })}
                    className={`w-28 bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm font-bold tabular-nums text-[#0f2342] placeholder:text-slate-400 focus:outline-none focus:bg-white transition ${
                      detailsForm.formState.errors.weight
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#cbd5e1] focus:border-[#2562eb]'
                    }`}
                  />
                  <span className="text-xs text-[#64748b] tabular-nums">
                    {activeService.unit} (Min. 3 kg)
                  </span>
                </div>
                {detailsForm.formState.errors.weight && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {detailsForm.formState.errors.weight.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0f2342] mb-1.5">Layanan Dipilih</label>
                <div className="bg-[#f8fafc] border border-[#cbd5e1] rounded-[10px] px-3.5 py-2.5 text-sm flex justify-between items-center">
                  <span className="font-semibold text-[#0f2342]">{activeService.name}</span>
                  <span className="text-xs font-bold text-[#2562eb] tabular-nums">{formatRupiah(activeService.price)}/{activeService.unit}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0f2342] mb-1.5">Catatan Khusus ke Kurir / Petugas (Opsional)</label>
              <textarea
                rows={2}
                {...detailsForm.register('notes')}
                placeholder="Misal: Pisahkan pakaian putih/luntur, parfum ocean breeze..."
                className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-slate-400 focus:outline-none focus:bg-white transition ${
                  detailsForm.formState.errors.notes
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#cbd5e1] focus:border-[#2562eb]'
                }`}
              />
              {detailsForm.formState.errors.notes && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {detailsForm.formState.errors.notes.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => setGuestStep(3)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
              >
                <ArrowLeft size={16} weight="bold" />
                <span>Kembali ke Layanan</span>
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm h-12 px-8 rounded-[10px] transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
              >
                <span>Lanjutkan ke Alamat & Peta</span>
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </form>

          {/* Right Column: Summary Card */}
          <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 shadow-sm flex flex-col justify-between h-fit">
            <div>
              <h4 className="font-bold text-[#0f2342] text-base mb-4 border-b border-[#e2e8f0] pb-2">
                Ringkasan Estimasi Pesanan
              </h4>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-[#64748b] tabular-nums">{activeService.name} ({safeWeight} {activeService.unit})</span>
                  <span className="font-semibold text-[#0f2342] tabular-nums">{formatRupiah(serviceCost)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#64748b]">Ongkos Pickup & Delivery</span>
                  <span className="font-semibold text-[#0f2342] tabular-nums">{formatRupiah(deliveryFee)}</span>
                </div>
                <div className="border-t border-[#e2e8f0] pt-3 flex justify-between items-center gap-2">
                  <span className="font-bold text-[#0f2342]">Total Estimasi</span>
                  <span className="font-extrabold text-[#2562eb] text-xl tabular-nums">{formatRupiah(totalCost)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200/60 rounded-xl p-3.5 text-xs text-[#64748b]">
              <p className="font-bold text-[#2562eb] mb-1">Catatan Timbangan:</p>
              Total akhir akan ditimbang ulang secara akurat menggunakan timbangan digital fisik saat kurir tiba di lokasi.
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 05: ERROR DETAIL (Phase 2)
      ========================================================================== */}
      {guestStep === 5 && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="bg-red-50 border border-red-200 rounded-[14px] p-6">
            <h3 className="font-bold text-red-900 text-base mb-2 flex items-center gap-2">
              <WarningCircle size={18} weight="bold" className="text-red-600 shrink-0" />
              <span>Periksa Kembali Data Pesanan</span>
            </h3>
            <p className="text-sm text-red-700">
              {formError || 'Beberapa kolom wajib belum terisi dengan benar:'}
            </p>
            <ul className="text-xs sm:text-sm text-red-800 list-disc pl-5 mt-3 space-y-1">
              <li>Nama lengkap wajib diisi minimal 3 karakter.</li>
              <li>Nomor WhatsApp aktif wajib diisi untuk koordinasi kurir.</li>
              <li>Perkiraan berat cucian tidak boleh 0 atau minus.</li>
            </ul>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(3)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Kembali ke Layanan</span>
            </button>
            <button
              type="button"
              onClick={() => setGuestStep(4)}
              className="inline-flex items-center gap-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm h-12 px-8 rounded-[10px] transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <span>Perbaiki Data Sekarang</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 06: ALAMAT MAP (Phase 3)
      ========================================================================== */}
      {guestStep === 6 && (
        <form
          onSubmit={addressForm.handleSubmit(onAddressValid)}
          noValidate
          className="bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 shadow-sm flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Simulator Panel */}
            <div className="border border-[#e2e8f0] rounded-[14px] overflow-hidden flex flex-col">
              <div className="bg-slate-100 p-3.5 border-b border-[#e2e8f0] flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-[#0f2342]">Pin Lokasi Penjemputan Kurir</span>
                <span className="text-[11px] text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full font-bold tabular-nums">
                  Radius 2.4 km (Zona 2)
                </span>
              </div>
              <div className="bg-slate-200 h-64 relative flex items-center justify-center p-4">
                {/* Visual Map Grid */}
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#2562eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Map Road paths */}
                <div className="absolute w-3/4 h-3 bg-white/70 rotate-12 rounded"></div>
                <div className="absolute h-3/4 w-3 bg-white/70 -rotate-45 rounded"></div>

                {/* Pin */}
                <div className="relative z-10 flex flex-col items-center animate-bounce max-w-full px-2">
                  <div className="bg-[#2562eb] text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-md mb-1 flex items-center gap-1.5 max-w-full truncate">
                    <MapPin size={14} weight="bold" className="shrink-0" />
                    <span className="truncate">Titik Jemput: {watchedAddress || 'Jl. Soekarno Hatta No. 45'}</span>
                  </div>
                  <div className="size-4 rounded-full bg-[#2562eb] ring-4 ring-blue-300"></div>
                </div>
              </div>
              <p className="p-3 text-[11px] text-[#64748b] bg-[#f8fafc]">
                Kurir akan diarahkan ke titik koordinat peta ini secara otomatis melalui aplikasi Kurir.
              </p>
            </div>

            {/* Address Form */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                  Alamat Lengkap Penjemputan
                </label>
                <textarea
                  rows={3}
                  {...addressForm.register('address')}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
                  className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-slate-400 focus:outline-none focus:bg-white transition ${
                    addressForm.formState.errors.address
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[#cbd5e1] focus:border-[#2562eb]'
                  }`}
                />
                {addressForm.formState.errors.address && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {addressForm.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                  Patokan / Landmark Lokasi
                </label>
                <input
                  type="text"
                  {...addressForm.register('landmark')}
                  placeholder="Contoh: Depan warung Madura, pagar hijau..."
                  className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-slate-400 focus:outline-none focus:bg-white transition ${
                    addressForm.formState.errors.landmark
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[#cbd5e1] focus:border-[#2562eb]'
                  }`}
                />
                {addressForm.formState.errors.landmark && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    {addressForm.formState.errors.landmark.message}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-[#0f2342]">
                <p className="font-bold text-[#2562eb]">Tarif Ongkos Kirim Terdeteksi:</p>
                <p className="text-[#64748b] mt-1 tabular-nums">Zona 2 (3 - 7 km): <strong className="text-[#0f2342]">{formatRupiah(deliveryFee)}</strong> (Termasuk antar & jemput PP)</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(4)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Kembali ke Data Pesanan</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm h-12 px-8 rounded-[10px] transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <span>Lanjutkan ke Estimasi Biaya</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          SCREEN 07: ESTIMASI BIAYA (Phase 3)
      ========================================================================== */}
      {guestStep === 7 && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#e2e8f0] rounded-[14px] p-5 sm:p-6 bg-[#f8fafc]">
              <h4 className="font-bold text-[#0f2342] text-base mb-4">Rincian Perhitungan Biaya</h4>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-2 border-b border-[#e2e8f0] gap-2">
                  <span className="text-[#64748b] tabular-nums">{activeService.name} · {safeWeight} {activeService.unit}</span>
                  <span className="font-semibold text-[#0f2342] tabular-nums">{formatRupiah(serviceCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#e2e8f0] gap-2">
                  <span className="text-[#64748b]">Ongkos Pickup & Delivery (PP)</span>
                  <span className="font-semibold text-[#0f2342] tabular-nums">{formatRupiah(deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center py-2 gap-2">
                  <span className="text-[#64748b]">Diskon Promo</span>
                  <span className="font-semibold text-emerald-600 tabular-nums">Rp0</span>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-[#64748b] italic">
                * Total dapat disesuaikan kembali setelah kurir menimbang berat aktual di timbangan digital.
              </p>
            </div>

            <div className="border border-blue-200 bg-blue-50/50 rounded-[14px] p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Estimasi Tagihan</span>
                <p className="text-3xl sm:text-4xl font-black text-[#2562eb] mt-1 tabular-nums">{formatRupiah(totalCost)}</p>
                <div className="mt-4 space-y-1.5 text-xs text-[#64748b]">
                  <p>• Pelanggan: <span className="font-bold text-[#0f2342]">{watchedCustomerName}</span></p>
                  <p>• WhatsApp: <span className="font-bold text-[#0f2342] tabular-nums">{watchedPhone}</span></p>
                  <p>• Alamat Jemput: <span className="font-bold text-[#0f2342]">{watchedAddress}</span></p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleCreateOrder}
                  className="bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-sm h-12 px-6 rounded-[10px] transition text-center shadow-md flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                >
                  <span>Konfirmasi & Buat Pesanan</span>
                  <ArrowRight size={16} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => setGuestStep(6)}
                  className="py-2 text-xs text-[#64748b] hover:text-[#0f2342] text-center inline-flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded"
                >
                  <ArrowLeft size={14} weight="bold" />
                  <span>Ubah Alamat / Titik Peta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 08: NOMOR PESANAN (Phase 4)
      ========================================================================== */}
      {guestStep === 8 && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-[14px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Pesanan Berhasil Dibuat
              </span>
              <h3 className="text-3xl font-black text-[#0f2342] mt-2 tabular-nums">{currentOrder.id}</h3>
              <p className="text-xs text-[#64748b] mt-1">
                Simpan nomor pesanan ini untuk pelacakan status cucian di halaman Lacak.
              </p>
            </div>
            <div className="bg-white px-4 py-2.5 rounded-xl border border-emerald-300 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Status</span>
              <p className="text-xs font-black text-amber-600">Menunggu Pembayaran</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#e2e8f0] rounded-[14px] p-5 sm:p-6 bg-[#f8fafc] text-xs sm:text-sm space-y-2.5">
              <p className="font-bold text-[#0f2342] text-sm mb-2 border-b border-slate-200 pb-2">Detail Pesanan Anda:</p>
              <p className="tabular-nums"><span className="text-[#64748b]">Layanan:</span> <strong className="text-[#0f2342]">{currentOrder.serviceName}</strong> ({currentOrder.weight} {currentOrder.unit})</p>
              <p className="tabular-nums"><span className="text-[#64748b]">Waktu Buat:</span> {currentOrder.createdAt}</p>
              <p className="tabular-nums"><span className="text-[#64748b]">Total Bayar:</span> <strong className="text-blue-600 text-base">{formatRupiah(currentOrder.total)}</strong></p>
            </div>

            <div className="flex flex-col justify-center gap-3">
              <button
                type="button"
                onClick={handleGoToPayment}
                className="bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-sm h-12 px-6 rounded-[10px] transition text-center shadow-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] tabular-nums"
              >
                <span>Pilih Metode Pembayaran ({formatRupiah(currentOrder.total)})</span>
                <ArrowRight size={16} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => setGuestStep(15)}
                className="border border-[#cbd5e1] hover:bg-slate-50 text-[#0f2342] font-semibold text-xs h-10 px-4 rounded-[10px] transition text-center inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
              >
                <span>Lacak Status Cucian Sekarang</span>
                <ArrowUpRight size={14} weight="bold" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(7)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Lihat Ringkasan Estimasi</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 09: METODE BAYAR (Phase 4)
      ========================================================================== */}
      {guestStep === 9 && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-bold text-[#0f2342]">Pilih Metode Pembayaran</h3>
            <p className="text-xs sm:text-sm text-[#64748b] mt-0.5 tabular-nums">
              Total tagihan pesanan <strong className="text-[#0f2342]">{currentOrder.id}</strong>: <strong className="text-blue-600">{formatRupiah(currentOrder.total)}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* QRIS */}
            <button
              type="button"
              onClick={() => handleSelectPaymentMethod('QRIS')}
              className="w-full text-left border border-blue-200 bg-blue-50/40 hover:bg-blue-50/80 rounded-[14px] p-5 cursor-pointer transition flex flex-col justify-between h-44 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Rekomendasi
                  </span>
                  <QrCode size={18} weight="bold" className="text-[#2562eb] shrink-0" />
                </div>
                <h4 className="font-bold text-[#0f2342] text-base mt-2">QRIS Instant</h4>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  Scan via BCA, Mandiri, GoPay, OVO, ShopeePay, atau DANA secara otomatis.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2562eb]">
                <span>Pilih QRIS</span>
                <ArrowRight size={14} weight="bold" />
              </span>
            </button>

            {/* Transfer Bank */}
            <button
              type="button"
              onClick={() => handleSelectPaymentMethod('TRANSFER')}
              className="w-full text-left border border-[#e2e8f0] bg-[#f8fafc] hover:bg-slate-50 rounded-[14px] p-5 cursor-pointer transition flex flex-col justify-between h-44 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                    Manual
                  </span>
                  <Bank size={18} weight="regular" className="text-[#0f2342] shrink-0" />
                </div>
                <h4 className="font-bold text-[#0f2342] text-base mt-2">Transfer Bank</h4>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  Transfer ke rekening resmi BCA/Mandiri lalu upload foto struk bukti bayar.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2562eb]">
                <span>Pilih Transfer</span>
                <ArrowRight size={14} weight="bold" />
              </span>
            </button>

            {/* COD */}
            <button
              type="button"
              onClick={() => handleSelectPaymentMethod('COD')}
              className="w-full text-left border border-[#e2e8f0] bg-[#f8fafc] hover:bg-slate-50 rounded-[14px] p-5 cursor-pointer transition flex flex-col justify-between h-44 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                    Tunai
                  </span>
                  <Money size={18} weight="regular" className="text-[#0f2342] shrink-0" />
                </div>
                <h4 className="font-bold text-[#0f2342] text-base mt-2">Bayar Saat Pickup</h4>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  Bayar tunai kepada kurir saat pakaian dijemput di lokasi Anda.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2562eb]">
                <span>Pilih Tunai COD</span>
                <ArrowRight size={14} weight="bold" />
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(8)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Kembali ke Nomor Pesanan</span>
            </button>
            <span className="text-xs text-[#64748b] tabular-nums">Total Tagihan: <strong className="text-[#0f2342]">{formatRupiah(currentOrder.total)}</strong></span>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 10: QRIS (Phase 4)
      ========================================================================== */}
      {guestStep === 10 && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR Code Container */}
            <div className="border border-[#e2e8f0] rounded-[14px] p-6 bg-[#f8fafc] flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-[#64748b] mb-3">QRIS Iqbal Laundry Standar BI</span>

              {/* Simulated QR Box */}
              <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-sm flex flex-col items-center">
                <div className="size-48 bg-slate-900 rounded-lg p-2 flex flex-col justify-between relative">
                  <div className="flex justify-between">
                    <div className="size-10 bg-white rounded flex items-center justify-center">
                      <div className="size-6 bg-slate-900 rounded-sm"></div>
                    </div>
                    <div className="size-10 bg-white rounded flex items-center justify-center">
                      <div className="size-6 bg-slate-900 rounded-sm"></div>
                    </div>
                  </div>
                  <div className="flex justify-center my-2">
                    <div className="bg-blue-600 text-[10px] text-white font-bold px-2 py-0.5 rounded">
                      QRIS
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="size-10 bg-white rounded flex items-center justify-center">
                      <div className="size-6 bg-slate-900 rounded-sm"></div>
                    </div>
                    <div className="size-8 bg-white/70 rounded grid grid-cols-2 gap-1 p-1">
                      <div className="bg-black"></div>
                      <div className="bg-black"></div>
                      <div className="bg-black"></div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs font-bold text-[#0f2342] tabular-nums">NMID: ID1020304050607</p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">
                <Clock size={16} weight="bold" className="shrink-0" />
                <span className="tabular-nums">Batas bayar: 14 menit 59 detik</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#0f2342] text-base mb-3 border-b border-[#e2e8f0] pb-2">
                  Detail Pembayaran QRIS
                </h4>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-[#64748b]">Nomor Pesanan:</span>
                    <span className="font-bold text-[#0f2342] tabular-nums">{currentOrder.id}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#64748b]">Layanan:</span>
                    <span className="tabular-nums">{currentOrder.serviceName} ({currentOrder.weight} {currentOrder.unit})</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 gap-2">
                    <span className="text-[#64748b]">Total Pembayaran:</span>
                    <span className="text-2xl font-black text-[#2562eb] tabular-nums">{formatRupiah(currentOrder.total)}</span>
                  </div>
                </div>

                <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#0f2342]">
                  <p className="font-bold text-[#2562eb]">Instruksi Pembayaran:</p>
                  <ol className="list-decimal pl-4 mt-1.5 text-[11px] text-[#64748b] space-y-1">
                    <li>Buka aplikasi m-Banking atau e-Wallet favorit Anda.</li>
                    <li>Pilih menu <strong>Scan / Bayar QRIS</strong>.</li>
                    <li>Arahkan kamera ke kode QR di samping.</li>
                    <li>Periksa nama penerima: <strong>Iqbal Laundry</strong>.</li>
                    <li>Masukkan PIN dan simpan bukti transaksi.</li>
                  </ol>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={handlePaymentSuccess}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm h-11 px-5 rounded-[10px] transition text-center shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                >
                  <CheckCircle size={18} weight="bold" />
                  <span>Konfirmasi Pembayaran</span>
                </button>
                <button
                  type="button"
                  onClick={handlePaymentFailed}
                  className="inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs sm:text-sm h-11 px-4 rounded-[10px] transition whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                >
                  <XCircle size={16} weight="bold" />
                  <span>Batalkan Pembayaran</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(9)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Ganti Metode Pembayaran</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 11: GAGAL BAYAR (Phase 4)
      ========================================================================== */}
      {guestStep === 11 && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="bg-red-50 border border-red-200 rounded-[14px] p-6 text-center">
            <XCircle size={40} weight="regular" className="text-red-500 mx-auto" />
            <h3 className="text-xl font-bold text-red-900 mt-2">Pembayaran Belum Berhasil</h3>
            <p className="text-xs sm:text-sm text-red-700 mt-1 max-w-md mx-auto tabular-nums">
              Transaksi tidak dapat diproses atau waktu pembayaran telah habis. Pesanan Anda ({currentOrder.id}) tetap tersimpan aman di sistem.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setGuestStep(10)}
              className="inline-flex items-center gap-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm h-11 px-6 rounded-[10px] transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <span>Coba QRIS Kembali</span>
              <ArrowRight size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setGuestStep(9)}
              className="inline-flex items-center gap-2 border border-[#cbd5e1] hover:bg-slate-50 text-[#0f2342] font-semibold text-xs sm:text-sm h-11 px-6 rounded-[10px] transition whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <span>Ganti Metode Pembayaran</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(8)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Kembali ke Nomor Pesanan</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 12: BUKTI BAYAR (Phase 4)
      ========================================================================== */}
      {guestStep === 12 && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="border border-[#e2e8f0] rounded-[14px] p-5 sm:p-6 bg-[#f8fafc]">
            <h4 className="font-bold text-[#0f2342] text-sm mb-3">Rekening Resmi Transfer Iqbal Laundry</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">BCA</span>
                <p className="font-mono text-lg font-bold text-[#0f2342] mt-0.5 tabular-nums">8830-1928-44</p>
                <p className="text-[11px] text-slate-500">a.n. Iqbal Maulana Laundry</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider">Mandiri</span>
                <p className="font-mono text-lg font-bold text-[#0f2342] mt-0.5 tabular-nums">132-00-9876543-1</p>
                <p className="text-[11px] text-slate-500">a.n. Iqbal Maulana Laundry</p>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-blue-300 rounded-[14px] p-6 text-center bg-blue-50/20">
            {uploadedProof ? (
              <div className="flex flex-col items-center">
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-semibold mb-2">
                  <CheckCircle size={16} weight="bold" />
                  <span>File Bukti Siap Dikirim</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{uploadedProof}</p>
                <button
                  type="button"
                  onClick={() => setUploadedProof(null)}
                  className="mt-2 text-xs text-red-600 hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded"
                >
                  Ganti File
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-[#0f2342]">Upload Foto Bukti Struk Transfer</p>
                <p className="text-xs text-[#64748b] mt-1">Format JPG, PNG atau PDF (Maks. 5MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 bg-white border border-[#cbd5e1] hover:bg-slate-50 text-xs font-bold text-[#2562eb] px-4 py-2 rounded-lg transition shadow-xs whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                  >
                    <UploadSimple size={16} weight="bold" />
                    <span>Pilih Foto dari Perangkat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleName = `struk-transfer-${currentOrder.id.toLowerCase()}.jpg`;
                      setUploadedProof(sampleName);
                      showToast(`Bukti contoh "${sampleName}" dipilih.`, 'info');
                    }}
                    className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-xs font-semibold text-[#2562eb] px-3 py-2 rounded-lg transition whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                  >
                    Gunakan Contoh Struk
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(9)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Ganti Metode Pembayaran</span>
            </button>
            <button
              type="button"
              onClick={() => {
                confirmPayment(currentOrder.id, 'TRANSFER', uploadedProof || 'bukti-pembayaran-terverifikasi.jpg');
                showToast(`Bukti transfer untuk ${currentOrder.id} berhasil dikirim.`, 'success');
                setGuestStep(15);
              }}
              className="inline-flex items-center gap-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm h-12 px-8 rounded-[10px] transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <span>Kirim Konfirmasi Pembayaran</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 13: STATUS KOSONG (Phase 5)
      ========================================================================== */}
      {guestStep === 13 && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-10 sm:p-14 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Basket size={28} weight="regular" className="text-[#2562eb]" />
          </div>
          <h3 className="text-xl font-bold text-[#0f2342]">Belum Ada Pesanan Aktif</h3>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1.5 max-w-sm">
            Anda belum memiliki pesanan aktif saat ini. Buat pesanan baru atau daftar akun member untuk kemudahan reorder.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setGuestStep(1)}
              className="inline-flex items-center justify-center gap-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm h-11 px-6 rounded-[10px] transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <Plus size={16} weight="bold" />
              <span>Buat Pesanan Baru</span>
              <ArrowRight size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setGuestStep(14)}
              className="inline-flex items-center justify-center gap-2 border border-[#cbd5e1] text-[#0f2342] text-xs sm:text-sm font-semibold h-11 px-5 rounded-[10px] hover:bg-slate-50 transition whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <span>Lihat Riwayat Pesanan</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 14: DAFTAR STATUS (Phase 5)
      ========================================================================== */}
      {guestStep === 14 && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between gap-2 border-b border-[#e2e8f0] pb-3">
            <div>
              <h4 className="font-bold text-[#0f2342] text-lg">Daftar Pesanan Laundry</h4>
              <p className="text-xs text-[#64748b]">Klik salah satu pesanan untuk memantau progress pengerjaan.</p>
            </div>
            <span className="text-xs font-semibold text-[#2562eb] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100 tabular-nums shrink-0">
              {orders.length} Transaksi Tercatat
            </span>
          </div>

          <div className="space-y-3">
            {orders.map((ord) => (
              <button
                key={ord.id}
                type="button"
                onClick={() => {
                  setActiveOrderId(ord.id);
                  setGuestStep(15);
                }}
                className={`w-full text-left border rounded-[14px] p-4 sm:p-5 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
                  ord.id === activeOrderId
                    ? 'border-blue-300 bg-blue-50/50 shadow-xs'
                    : 'border-[#e2e8f0] bg-[#f8fafc] hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0f2342] text-base tabular-nums">{ord.id}</span>
                    <span className="text-xs text-[#64748b]">· {ord.customerName}</span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-0.5 tabular-nums">
                    {ord.serviceName} · {ord.weight} {ord.unit} · {formatRupiah(ord.total)}
                  </p>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold ${
                      ord.status === 'SELESAI'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'DICUCI'
                        ? 'bg-sky-100 text-sky-800'
                        : ord.status === 'DITERIMA'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ord.status.replace('_', ' ')}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-xs text-[#2562eb]">
                    <span>Lihat Tracking Detail</span>
                    <ArrowRight size={14} weight="bold" />
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(1)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Kembali ke Beranda Layanan</span>
            </button>
            <button
              type="button"
              onClick={() => setGuestStep(1)}
              className="inline-flex items-center gap-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm h-11 px-6 rounded-[10px] transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <Plus size={16} weight="bold" />
              <span>Pesan Layanan Baru</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 15: DETAIL STATUS (Phase 5)
      ========================================================================== */}
      {guestStep === 15 && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e2e8f0] gap-3">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Tracking Nomor Pesanan</span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0f2342] mt-0.5 tabular-nums">{currentOrder.id}</h3>
              <p className="text-xs sm:text-sm text-[#64748b] mt-0.5 tabular-nums">
                {currentOrder.serviceName} · {currentOrder.weight} {currentOrder.unit} · <strong className="text-[#0f2342]">{formatRupiah(currentOrder.total)}</strong>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-3.5 py-1.5 rounded-full font-bold shadow-xs ${
                  currentOrder.status === 'SELESAI'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : currentOrder.status === 'DICUCI'
                    ? 'bg-sky-100 text-sky-800 border border-sky-200'
                    : currentOrder.status === 'DITERIMA'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                Status: {currentOrder.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* 5-Step Progress Timeline from Figma */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-[14px] p-6">
            <h4 className="font-bold text-[#0f2342] text-sm mb-6 flex items-center justify-between gap-2">
              <span>Progress Pengerjaan Laundry</span>
              <span className="text-xs font-normal text-slate-500">Update Real-Time Kurir & Operator</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
              {currentOrder.steps.map((step, idx) => (
                <div key={step.label} className="flex flex-col items-start relative">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        step.completed
                          ? 'bg-emerald-600 text-white'
                          : step.current
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {step.completed ? (
                        <Check size={14} weight="bold" />
                      ) : (
                        <span className="tabular-nums">{idx + 1}</span>
                      )}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        step.completed
                          ? 'text-emerald-700'
                          : step.current
                          ? 'text-blue-700 font-extrabold'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#64748b] pl-9 tabular-nums">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
              <p className="font-bold text-[#0f2342] mb-1">Penerima & Kontak</p>
              <p className="text-slate-800 font-medium">{currentOrder.customerName}</p>
              <p className="text-slate-500 tabular-nums">{currentOrder.phone}</p>
              {currentOrder.notes && (
                <p className="mt-2.5 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <strong>Catatan Khusus:</strong> {currentOrder.notes}
                </p>
              )}
            </div>
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
              <p className="font-bold text-[#0f2342] mb-1">Alamat Penjemputan</p>
              <p className="text-slate-800">{currentOrder.address}</p>
              {currentOrder.landmark && (
                <p className="text-slate-500 text-[11px] mt-1">Patokan: {currentOrder.landmark}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(14)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Kembali ke Daftar Pesanan</span>
            </button>
            <button
              type="button"
              onClick={() => setGuestStep(1)}
              className="inline-flex items-center gap-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm h-11 px-6 rounded-[10px] transition shadow-sm whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <Plus size={16} weight="bold" />
              <span>Order Layanan Lain</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
