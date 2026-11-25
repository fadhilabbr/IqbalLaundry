'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Copy,
  MagnifyingGlass,
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
import { Order, Service } from '@/types';

const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 bg-[#2562eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs sm:text-sm h-11 px-6 rounded-lg transition-all duration-150 ease-out shadow-xs whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]';

const BTN_SECONDARY =
  'inline-flex items-center justify-center gap-2 border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#475569] hover:text-[#0f2342] font-semibold text-xs sm:text-sm h-10 px-4 rounded-lg transition-all duration-150 ease-out whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]';

const INPUT_BASE =
  'w-full bg-[#f8fafc] border rounded-lg px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-[#94a3b8] focus:outline-none focus:bg-white focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 transition-all duration-150 ease-out';

interface StepContextHeaderProps {
  stepNumber?: number;
  totalSteps?: number;
  backLabel: string;
  onBack: () => void;
  title: string;
  description?: string;
  rightBadge?: React.ReactNode;
}

function StepContextHeader({
  stepNumber,
  totalSteps = 4,
  backLabel,
  onBack,
  title,
  description,
  rightBadge,
}: StepContextHeaderProps) {
  return (
    <div className="flex flex-col gap-2.5 pb-4 border-b border-[#e2e8f0]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569] hover:text-[#0f2342] py-1 px-2 -ml-2 rounded-lg hover:bg-[#f8fafc] transition-all duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
        >
          <ArrowLeft size={14} weight="bold" className="shrink-0" />
          <span>{backLabel}</span>
        </button>

        {rightBadge ??
          (stepNumber !== undefined && (
            <span className="inline-flex items-center rounded-full bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-0.5 text-xs font-semibold text-[#2562eb] tabular-nums">
              Langkah {stepNumber} dari {totalSteps}
            </span>
          ))}
      </div>

      <div>
        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#0f2342] leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[#475569] mt-1 max-w-[65ch] leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function getOrderStatusStyle(status: Order['status']): string {
  switch (status) {
    case 'SELESAI':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'DICUCI':
    case 'DISETRIKA':
    case 'SIAP_DIKIRIM':
      return 'bg-sky-50 text-sky-700 border border-sky-200';
    case 'DITERIMA':
      return 'bg-[#eff6ff] text-[#2562eb] border border-[#bfdbfe]';
    case 'GAGAL':
      return 'bg-red-50 text-red-700 border border-red-200';
    default:
      return 'bg-amber-50 text-amber-700 border border-amber-200';
  }
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
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState('');

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const currentOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  const activeService = guestSelectedService || services[1] || services[0];
  const serviceCost = (activeService?.price || 8000) * safeWeight;
  const deliveryFee = 8000;
  const totalCost = serviceCost + deliveryFee;

  const handleCopy = async (value: string, key: string, label: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
      setCopiedKey(key);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => setCopiedKey(null), 2000);
      showToast(`${label} ${value} disalin ke clipboard.`, 'success');
    } catch {
      showToast(`Gagal menyalin ${label.toLowerCase()}.`, 'error');
    }
  };

  const handleSelectService = (srv: Service) => {
    setGuestSelectedService(srv);
    setGuestStep(3);
  };

  const handleProceedToDetails = () => {
    if (!guestSelectedService) {
      setGuestStep(2);
      return;
    }
    setGuestStep(4);
  };

  const onDetailsValid = () => {
    setFormError(null);
    setGuestStep(6);
  };

  const onDetailsInvalid = () => {
    setFormError('Pastikan nama lengkap, nomor WhatsApp, dan perkiraan berat sudah diisi dengan benar.');
    showToast('Mohon periksa kembali data pesanan yang masih salah.', 'error');
  };

  const onAddressValid = () => {
    setFormError(null);
    setGuestStep(7);
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
    setGuestStep(8);
  };

  const handleGoToPayment = () => {
    setGuestStep(9);
  };

  const handleSelectPaymentMethod = (method: 'QRIS' | 'TRANSFER' | 'COD') => {
    setPaymentMethod(method);
    if (method === 'QRIS') {
      setGuestStep(10);
    } else if (method === 'TRANSFER') {
      setGuestStep(12);
    } else {
      if (currentOrder) {
        confirmPayment(currentOrder.id, 'COD');
        showToast(`Pembayaran tunai (COD) untuk ${currentOrder.id} dikonfirmasi.`, 'success');
      }
      setGuestStep(15);
    }
  };

  const handlePaymentSuccess = () => {
    if (currentOrder) {
      confirmPayment(currentOrder.id, paymentMethod);
      showToast(`Pembayaran pesanan ${currentOrder.id} berhasil diverifikasi.`, 'success');
    }
    setGuestStep(15);
  };

  const handlePaymentFailed = () => {
    setGuestStep(11);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedProof(file.name);
      showToast(`File "${file.name}" siap dikirim.`, 'info');
    }
  };

  const normalizedQuery = orderSearch.trim().toLowerCase();
  const filteredOrders = normalizedQuery
    ? orders.filter(
        (ord) =>
          ord.id.toLowerCase().includes(normalizedQuery) ||
          ord.customerName.toLowerCase().includes(normalizedQuery) ||
          ord.serviceName.toLowerCase().includes(normalizedQuery)
      )
    : orders;

  return (
    <div className="flex-1 flex flex-col bg-[#f5f8fc] min-h-full p-4 sm:p-6 lg:p-8">
      {/* =========================================================================
          SCREEN 01: PILIH LAYANAN
      ========================================================================== */}
      {guestStep === 1 && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 flex flex-col gap-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#0f2342] leading-tight">
                Pilih Layanan Laundry
              </h1>
              <p className="text-xs sm:text-sm text-[#475569] mt-1 max-w-[65ch] leading-relaxed">
                Pilih salah satu layanan di bawah untuk melanjutkan proses pemesanan jemput-antar kurir ke lokasi Anda.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setGuestStep(14)}
              className="inline-flex items-center justify-between sm:justify-start gap-2.5 self-start lg:self-center rounded-xl border border-[#e2e8f0] bg-[#f8fafc] hover:border-[#2562eb] hover:bg-[#eff6ff]/60 px-3.5 py-2.5 text-xs font-semibold text-[#475569] transition-all duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <span className="inline-flex items-center gap-1.5">
                <MagnifyingGlass size={15} weight="bold" className="text-[#2562eb] shrink-0" />
                <span>Sudah punya kode pesanan?</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[#2562eb] font-bold">
                <span>Lacak Pesanan</span>
                <ArrowRight size={13} weight="bold" />
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((srv) => (
              <button
                key={srv.id}
                type="button"
                onClick={() => handleSelectService(srv)}
                className="w-full text-left group border border-[#e2e8f0] bg-[#f8fafc] rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-150 ease-out flex flex-col justify-between min-h-[148px] hover:border-[#2562eb] hover:bg-[#eff6ff]/60 hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-2 w-full">
                  <div>
                    <p className="font-bold text-[#0f2342] text-base leading-snug">{srv.name}</p>
                    <p className="text-xs text-[#64748b] mt-1 line-clamp-2 max-w-[65ch]">
                      {srv.description}
                    </p>
                  </div>
                  {srv.popular && (
                    <span className="text-[11px] bg-[#eff6ff] text-[#2562eb] border border-[#bfdbfe] px-2.5 py-0.5 rounded-full font-semibold shrink-0">
                      Populer
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-4 border-t border-[#e2e8f0] w-full">
                  <p className="font-bold text-[#2562eb] text-lg sm:text-xl tabular-nums">
                    {formatRupiah(srv.price)}
                    <span className="text-xs font-normal text-[#64748b]">/{srv.unit}</span>
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#64748b] group-hover:text-[#2562eb] transition-colors duration-150">
                    <span>Pilih</span>
                    <ArrowRight size={14} weight="bold" />
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(2)}
              className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#64748b] hover:text-[#0f2342] hover:bg-[#f8fafc] transition-all duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <Info size={16} weight="regular" className="shrink-0" />
              <span>Lihat Informasi & Ketentuan Layanan</span>
            </button>
            <button
              type="button"
              onClick={handleProceedToDetails}
              className={BTN_PRIMARY}
            >
              <span>Lanjutkan ke Data Pesanan</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 02: INFORMASI & KETENTUAN LAYANAN
      ========================================================================== */}
      {guestStep === 2 && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 flex flex-col gap-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)]">
          <StepContextHeader
            backLabel="Kembali ke Layanan"
            onBack={() => setGuestStep(1)}
            title="Informasi & Ketentuan Layanan"
            description="Harap perhatikan ketentuan operasional berikut agar proses penjemputan dan pencucian berjalan tepat waktu."
            rightBadge={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                <WarningCircle size={14} weight="bold" />
                <span>Panduan Order</span>
              </span>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#f8fafc] p-4 sm:p-5 rounded-xl border border-[#e2e8f0]">
              <p className="text-xs text-[#64748b] font-semibold">Minimum Order</p>
              <p className="text-xl font-bold text-[#0f2342] mt-1 tabular-nums">3 kg</p>
              <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                Berat di bawah 3 kg tetap dihitung minimal 3 kg untuk pencucian terpisah.
              </p>
            </div>
            <div className="bg-[#f8fafc] p-4 sm:p-5 rounded-xl border border-[#e2e8f0]">
              <p className="text-xs text-[#64748b] font-semibold">Estimasi Pengerjaan</p>
              <p className="text-xl font-bold text-[#0f2342] mt-1 tabular-nums">1 - 2 Hari</p>
              <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                Pakaian wangi, bersih, dan dikemas rapi anti lembap bergaransi.
              </p>
            </div>
            <div className="bg-[#f8fafc] p-4 sm:p-5 rounded-xl border border-[#e2e8f0]">
              <p className="text-xs text-[#64748b] font-semibold">Jam Operasional Kurir</p>
              <p className="text-xl font-bold text-[#0f2342] mt-1 tabular-nums">10.00 - 17.00</p>
              <p className="text-xs text-[#475569] mt-1.5 leading-relaxed">
                Kurir menjemput langsung sesuai titik alamat yang Anda tentukan.
              </p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(1)}
              className={BTN_SECONDARY}
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Kembali ke Layanan</span>
            </button>
            <button
              type="button"
              onClick={() => setGuestStep(guestSelectedService ? 3 : 1)}
              className={BTN_PRIMARY}
            >
              <span>Saya Mengerti, Lanjutkan</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 03: LAYANAN TERPILIH (Langkah 1 dari 4)
      ========================================================================== */}
      {guestStep === 3 && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 flex flex-col gap-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)]">
          <StepContextHeader
            stepNumber={1}
            backLabel="Ganti Layanan"
            onBack={() => setGuestStep(1)}
            title={activeService.name}
            description={activeService.description}
          />

          <div className="bg-[#eff6ff]/60 border border-[#bfdbfe] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="inline-block text-xs font-semibold text-[#2562eb] bg-white border border-[#bfdbfe] px-2.5 py-0.5 rounded-full">
                Tarif Layanan Terpilih
              </span>
              <p className="text-2xl sm:text-3xl font-bold text-[#2562eb] mt-2 tabular-nums">
                {formatRupiah(activeService.price)}
                <span className="text-sm font-normal text-[#475569]">/{activeService.unit}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setGuestStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2562eb] hover:text-[#1d4ed8] hover:underline self-start sm:self-center py-1.5 px-2 rounded-lg transition-all duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <span>Ganti pilihan layanan</span>
              <ArrowUpRight size={14} weight="bold" />
            </button>
          </div>

          <div className="border border-[#e2e8f0] rounded-xl p-4 sm:p-5 bg-[#f8fafc]">
            <h2 className="font-bold text-sm text-[#0f2342] mb-2.5">
              Keunggulan & Standar Pengerjaan
            </h2>
            <ul className="text-xs sm:text-sm text-[#475569] space-y-2 list-disc pl-5 max-w-[65ch]">
              <li>Pencucian higienis 1 mesin terpisah per pelanggan (pakaian tidak dicampur).</li>
              <li>Pilihan deterjen anti-apek dan pelembut wangi premium tahan lama.</li>
              <li>Gratis plastik packing rapi dan tahan percikan air saat pengantaran.</li>
            </ul>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(1)}
              className={BTN_SECONDARY}
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Ganti Layanan</span>
            </button>
            <button
              type="button"
              onClick={() => setGuestStep(4)}
              className={BTN_PRIMARY}
            >
              <span>Lanjutkan ke Data Pesanan</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 04: DETAIL PESANAN (Langkah 2 dari 4)
      ========================================================================== */}
      {guestStep === 4 && (
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)]">
            <StepContextHeader
              stepNumber={2}
              backLabel="Kembali ke Layanan"
              onBack={() => setGuestStep(3)}
              title="Data Pemesan & Cucian"
              description="Pastikan nama dan nomor WhatsApp aktif agar kurir mudah menghubungi Anda saat penjemputan."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <form
                onSubmit={detailsForm.handleSubmit(onDetailsValid, onDetailsInvalid)}
                noValidate
                className="lg:col-span-2 flex flex-col gap-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="guest-customer-name"
                      className="block text-xs font-semibold text-[#0f2342] mb-1.5"
                    >
                      Nama Lengkap
                    </label>
                    <input
                      id="guest-customer-name"
                      type="text"
                      {...detailsForm.register('customerName')}
                      placeholder="Contoh: Budi Santoso"
                      className={`${INPUT_BASE} ${
                        detailsForm.formState.errors.customerName
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-[#e2e8f0] focus:border-[#2562eb]'
                      }`}
                    />
                    {detailsForm.formState.errors.customerName && (
                      <p className="text-xs text-red-600 mt-1.5 font-medium">
                        {detailsForm.formState.errors.customerName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="guest-phone"
                      className="block text-xs font-semibold text-[#0f2342] mb-1.5"
                    >
                      Nomor WhatsApp Aktif
                    </label>
                    <input
                      id="guest-phone"
                      type="tel"
                      {...detailsForm.register('phone')}
                      placeholder="08xxxxxxxxxx"
                      className={`${INPUT_BASE} tabular-nums ${
                        detailsForm.formState.errors.phone
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-[#e2e8f0] focus:border-[#2562eb]'
                      }`}
                    />
                    {detailsForm.formState.errors.phone && (
                      <p className="text-xs text-red-600 mt-1.5 font-medium">
                        {detailsForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="guest-weight"
                      className="block text-xs font-semibold text-[#0f2342] mb-1.5"
                    >
                      Perkiraan Berat ({activeService.unit})
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="guest-weight"
                        type="number"
                        min={1}
                        {...detailsForm.register('weight', { valueAsNumber: true })}
                        className={`w-28 bg-[#f8fafc] border rounded-lg px-3.5 py-2.5 text-sm font-bold tabular-nums text-[#0f2342] placeholder:text-[#94a3b8] focus:outline-none focus:bg-white focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 transition-all duration-150 ease-out ${
                          detailsForm.formState.errors.weight
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-[#e2e8f0] focus:border-[#2562eb]'
                        }`}
                      />
                      <span className="text-xs text-[#64748b] tabular-nums">
                        {activeService.unit} (Min. 3 kg)
                      </span>
                    </div>
                    {detailsForm.formState.errors.weight && (
                      <p className="text-xs text-red-600 mt-1.5 font-medium">
                        {detailsForm.formState.errors.weight.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                      Layanan Dipilih
                    </span>
                    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-sm flex justify-between items-center gap-2">
                      <span className="font-semibold text-[#0f2342] truncate">
                        {activeService.name}
                      </span>
                      <span className="text-xs font-bold text-[#2562eb] tabular-nums shrink-0">
                        {formatRupiah(activeService.price)}/{activeService.unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="guest-notes"
                    className="block text-xs font-semibold text-[#0f2342] mb-1.5"
                  >
                    Catatan Khusus ke Kurir / Petugas (Opsional)
                  </label>
                  <textarea
                    id="guest-notes"
                    rows={3}
                    {...detailsForm.register('notes')}
                    placeholder="Misal: Pisahkan pakaian putih/luntur, parfum ocean breeze..."
                    className={`${INPUT_BASE} ${
                      detailsForm.formState.errors.notes
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#e2e8f0] focus:border-[#2562eb]'
                    }`}
                  />
                  {detailsForm.formState.errors.notes && (
                    <p className="text-xs text-red-600 mt-1.5 font-medium">
                      {detailsForm.formState.errors.notes.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
                  <button
                    type="button"
                    onClick={() => setGuestStep(3)}
                    className={BTN_SECONDARY}
                  >
                    <ArrowLeft size={16} weight="bold" />
                    <span>Kembali ke Layanan</span>
                  </button>
                  <button type="submit" className={BTN_PRIMARY}>
                    <span>Lanjutkan ke Alamat & Peta</span>
                    <ArrowRight size={16} weight="bold" />
                  </button>
                </div>
              </form>

              <aside className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-5 h-fit">
                <div>
                  <h2 className="font-bold text-[#0f2342] text-base mb-4 border-b border-[#e2e8f0] pb-2.5">
                    Ringkasan Estimasi Biaya
                  </h2>
                  <div className="space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[#475569] tabular-nums">
                        {activeService.name} ({safeWeight} {activeService.unit})
                      </span>
                      <span className="font-semibold text-[#0f2342] tabular-nums shrink-0">
                        {formatRupiah(serviceCost)}
                      </span>
                    </div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[#475569]">Ongkos Pickup & Delivery</span>
                      <span className="font-semibold text-[#0f2342] tabular-nums shrink-0">
                        {formatRupiah(deliveryFee)}
                      </span>
                    </div>
                    <div className="border-t border-[#e2e8f0] pt-3 flex justify-between items-center gap-2">
                      <span className="font-bold text-[#0f2342]">Total Estimasi</span>
                      <span className="font-bold text-[#2562eb] text-xl tabular-nums">
                        {formatRupiah(totalCost)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5 text-xs text-[#475569]">
                  <p className="font-semibold text-[#0f2342] mb-1">Catatan Timbangan</p>
                  <p className="leading-relaxed">
                    Total akhir ditimbang ulang secara akurat menggunakan timbangan digital saat kurir tiba di lokasi.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 05: ERROR DETAIL (Langkah 2 dari 4)
      ========================================================================== */}
      {guestStep === 5 && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)] flex flex-col gap-6">
          <StepContextHeader
            stepNumber={2}
            backLabel="Kembali ke Data Pesanan"
            onBack={() => setGuestStep(4)}
            title="Periksa Kembali Data Pesanan"
            description="Beberapa informasi wajib perlu dilengkapi sebelum melanjutkan ke alamat penjemputan."
          />

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5">
            <h2 className="font-bold text-red-900 text-sm sm:text-base mb-2 flex items-center gap-2">
              <WarningCircle size={18} weight="bold" className="text-red-600 shrink-0" />
              <span>Detail Data Belum Valid</span>
            </h2>
            <p className="text-xs sm:text-sm text-red-700 max-w-[65ch]">
              {formError || 'Beberapa kolom wajib belum terisi dengan benar:'}
            </p>
            <ul className="text-xs sm:text-sm text-red-800 list-disc pl-5 mt-3 space-y-1 max-w-[65ch]">
              <li>Nama lengkap wajib diisi minimal 3 karakter.</li>
              <li>Nomor WhatsApp aktif wajib diawali 08 dan terdiri dari 10 hingga 15 digit.</li>
              <li>Perkiraan berat cucian minimal 1 unit.</li>
            </ul>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(3)}
              className={BTN_SECONDARY}
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Kembali ke Layanan</span>
            </button>
            <button
              type="button"
              onClick={() => setGuestStep(4)}
              className={BTN_PRIMARY}
            >
              <span>Perbaiki Data Sekarang</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 06: ALAMAT & PETA (Langkah 3 dari 4)
      ========================================================================== */}
      {guestStep === 6 && (
        <form
          onSubmit={addressForm.handleSubmit(onAddressValid)}
          noValidate
          className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)] flex flex-col gap-6"
        >
          <StepContextHeader
            stepNumber={3}
            backLabel="Kembali ke Data Pesanan"
            onBack={() => setGuestStep(4)}
            title="Alamat & Lokasi Penjemputan"
            description="Lengkapi alamat penjemputan dan patokan agar kurir cepat menemukan lokasi Anda."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Simulator Panel */}
            <div className="border border-[#e2e8f0] rounded-xl overflow-hidden flex flex-col bg-[#f8fafc]">
              <div className="bg-[#f8fafc] px-4 py-3 border-b border-[#e2e8f0] flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-[#0f2342]">
                  Pin Lokasi Penjemputan Kurir
                </span>
                <span className="text-[11px] text-[#2562eb] bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-0.5 rounded-full font-semibold tabular-nums">
                  Radius 2.4 km (Zona 2)
                </span>
              </div>
              <div className="bg-slate-200/80 h-60 relative flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#2562eb_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute w-3/4 h-3 bg-white/75 rotate-12 rounded" />
                <div className="absolute h-3/4 w-3 bg-white/75 -rotate-45 rounded" />

                <div className="relative z-10 flex flex-col items-center max-w-full px-2">
                  <div className="bg-[#2562eb] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm mb-1.5 flex items-center gap-1.5 max-w-full truncate">
                    <MapPin size={14} weight="bold" className="shrink-0" />
                    <span className="truncate">
                      Titik Jemput: {watchedAddress || 'Jl. Soekarno Hatta No. 45'}
                    </span>
                  </div>
                  <div className="size-3.5 rounded-full bg-[#2562eb] ring-4 ring-[#2562eb]/25" />
                </div>
              </div>
              <p className="p-3.5 text-xs text-[#64748b] bg-[#f8fafc] border-t border-[#e2e8f0]">
                Kurir akan diarahkan ke titik koordinat peta ini secara otomatis melalui aplikasi Kurir.
              </p>
            </div>

            {/* Address Form */}
            <div className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="guest-address"
                  className="block text-xs font-semibold text-[#0f2342] mb-1.5"
                >
                  Alamat Lengkap Penjemputan
                </label>
                <textarea
                  id="guest-address"
                  rows={3}
                  {...addressForm.register('address')}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
                  className={`${INPUT_BASE} ${
                    addressForm.formState.errors.address
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[#e2e8f0] focus:border-[#2562eb]'
                  }`}
                />
                {addressForm.formState.errors.address && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">
                    {addressForm.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="guest-landmark"
                  className="block text-xs font-semibold text-[#0f2342] mb-1.5"
                >
                  Patokan / Landmark Lokasi (Opsional)
                </label>
                <input
                  id="guest-landmark"
                  type="text"
                  {...addressForm.register('landmark')}
                  placeholder="Contoh: Depan warung Madura, pagar hijau..."
                  className={`${INPUT_BASE} ${
                    addressForm.formState.errors.landmark
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[#e2e8f0] focus:border-[#2562eb]'
                  }`}
                />
                {addressForm.formState.errors.landmark && (
                  <p className="text-xs text-red-600 mt-1.5 font-medium">
                    {addressForm.formState.errors.landmark.message}
                  </p>
                )}
              </div>

              <div className="bg-[#eff6ff]/70 border border-[#bfdbfe] rounded-xl p-4 text-xs text-[#0f2342]">
                <p className="font-bold text-[#2562eb]">Tarif Ongkos Kirim Terdeteksi</p>
                <p className="text-[#475569] mt-1 tabular-nums">
                  Zona 2 (3 - 7 km):{' '}
                  <strong className="text-[#0f2342]">{formatRupiah(deliveryFee)}</strong> (Termasuk antar & jemput PP)
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(4)}
              className={BTN_SECONDARY}
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Kembali ke Data Pesanan</span>
            </button>
            <button type="submit" className={BTN_PRIMARY}>
              <span>Lanjutkan ke Estimasi Biaya</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </form>
      )}

      {/* =========================================================================
          SCREEN 07: ESTIMASI BIAYA (Langkah 3 dari 4)
      ========================================================================== */}
      {guestStep === 7 && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)] flex flex-col gap-6">
          <StepContextHeader
            stepNumber={3}
            backLabel="Ubah Alamat / Titik Peta"
            onBack={() => setGuestStep(6)}
            title="Estimasi Biaya Pesanan"
            description="Periksa kembali rincian biaya dan data penjemputan sebelum membuat pesanan."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#e2e8f0] rounded-xl p-4 sm:p-5 bg-[#f8fafc]">
              <h2 className="font-bold text-[#0f2342] text-base mb-4">
                Rincian Perhitungan Biaya
              </h2>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-2 border-b border-[#e2e8f0] gap-2">
                  <span className="text-[#475569] tabular-nums">
                    {activeService.name} · {safeWeight} {activeService.unit}
                  </span>
                  <span className="font-semibold text-[#0f2342] tabular-nums">
                    {formatRupiah(serviceCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#e2e8f0] gap-2">
                  <span className="text-[#475569]">Ongkos Pickup & Delivery (PP)</span>
                  <span className="font-semibold text-[#0f2342] tabular-nums">
                    {formatRupiah(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 gap-2">
                  <span className="text-[#475569]">Diskon Promo</span>
                  <span className="font-semibold text-emerald-700 tabular-nums">Rp0</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-[#64748b] max-w-[65ch]">
                * Total dapat disesuaikan setelah kurir menimbang berat aktual dengan timbangan digital.
              </p>
            </div>

            <div className="border border-[#bfdbfe] bg-[#eff6ff]/50 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-5">
              <div>
                <span className="text-xs font-semibold text-[#2562eb] uppercase tracking-wider">
                  Total Estimasi Tagihan
                </span>
                <p className="text-3xl font-bold text-[#2562eb] mt-1 tabular-nums">
                  {formatRupiah(totalCost)}
                </p>
                <dl className="mt-4 space-y-2 text-xs text-[#475569]">
                  <div className="flex justify-between gap-3">
                    <dt>Pelanggan</dt>
                    <dd className="font-semibold text-[#0f2342] text-right">{watchedCustomerName}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>WhatsApp</dt>
                    <dd className="font-semibold text-[#0f2342] tabular-nums text-right">
                      {watchedPhone}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0">Alamat Jemput</dt>
                    <dd className="font-semibold text-[#0f2342] text-right">{watchedAddress}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleCreateOrder}
                  className={BTN_PRIMARY}
                >
                  <span>Konfirmasi & Buat Pesanan</span>
                  <ArrowRight size={16} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => setGuestStep(6)}
                  className={BTN_SECONDARY}
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
          SCREEN 08: NOMOR PESANAN (Langkah 4 dari 4)
      ========================================================================== */}
      {guestStep === 8 && currentOrder && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)] flex flex-col gap-6">
          <StepContextHeader
            stepNumber={4}
            backLabel="Lihat Ringkasan Estimasi"
            onBack={() => setGuestStep(7)}
            title="Pesanan Berhasil Dibuat"
            description="Simpan kode pesanan ini untuk pelacakan status cucian di halaman Lacak Pesanan."
          />

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 w-fit text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <CheckCircle size={14} weight="bold" />
                <span>Kode Pesanan Aktif</span>
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-2xl sm:text-3xl font-bold text-[#0f2342] tracking-tight tabular-nums">
                  {currentOrder.id}
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy(currentOrder.id, 'order-8', 'Nomor pesanan')}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-[#0f2342] transition-all duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                >
                  {copiedKey === 'order-8' ? (
                    <>
                      <Check size={14} weight="bold" className="text-emerald-600" />
                      <span className="text-emerald-700">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} weight="bold" className="text-[#2562eb]" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white px-4 py-2.5 rounded-xl border border-emerald-200 text-left sm:text-center shrink-0">
              <span className="text-[11px] text-[#64748b] uppercase font-semibold block">
                Status Saat Ini
              </span>
              <span className="text-xs font-bold text-amber-700">
                {currentOrder.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#e2e8f0] rounded-xl p-4 sm:p-5 bg-[#f8fafc] text-xs sm:text-sm space-y-2.5">
              <h2 className="font-bold text-[#0f2342] text-sm mb-2 border-b border-[#e2e8f0] pb-2">
                Detail Pesanan Anda
              </h2>
              <p className="tabular-nums text-[#475569]">
                Layanan:{' '}
                <strong className="text-[#0f2342]">
                  {currentOrder.serviceName}
                </strong>{' '}
                ({currentOrder.weight} {currentOrder.unit})
              </p>
              <p className="tabular-nums text-[#475569]">
                Waktu Buat: <strong className="text-[#0f2342]">{currentOrder.createdAt}</strong>
              </p>
              <p className="tabular-nums text-[#475569]">
                Total Bayar:{' '}
                <strong className="text-[#2562eb] text-base">
                  {formatRupiah(currentOrder.total)}
                </strong>
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3">
              <button
                type="button"
                onClick={handleGoToPayment}
                className={`${BTN_PRIMARY} tabular-nums`}
              >
                <span>Pilih Metode Pembayaran ({formatRupiah(currentOrder.total)})</span>
                <ArrowRight size={16} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => setGuestStep(15)}
                className={BTN_SECONDARY}
              >
                <span>Lacak Status Cucian Sekarang</span>
                <ArrowUpRight size={15} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 09: METODE PEMBAYARAN (Langkah 4 dari 4)
      ========================================================================== */}
      {guestStep === 9 && currentOrder && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)] flex flex-col gap-6">
          <StepContextHeader
            stepNumber={4}
            backLabel="Kembali ke Nomor Pesanan"
            onBack={() => setGuestStep(8)}
            title="Pilih Metode Pembayaran"
            description={`Total tagihan pesanan ${currentOrder.id}: ${formatRupiah(currentOrder.total)}`}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* QRIS */}
            <button
              type="button"
              onClick={() => handleSelectPaymentMethod('QRIS')}
              className="w-full text-left group border border-[#e2e8f0] bg-[#f8fafc] hover:border-[#2562eb] hover:bg-[#eff6ff]/60 rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-150 ease-out flex flex-col justify-between min-h-[168px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#2562eb] bg-[#eff6ff] border border-[#bfdbfe] px-2.5 py-0.5 rounded-full">
                    Rekomendasi
                  </span>
                  <QrCode size={20} weight="bold" className="text-[#2562eb] shrink-0" />
                </div>
                <h2 className="font-bold text-[#0f2342] text-base mt-3">QRIS Instant</h2>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  Scan via BCA, Mandiri, GoPay, OVO, ShopeePay, atau DANA secara otomatis.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2562eb] mt-4 pt-3 border-t border-[#e2e8f0] w-full">
                <span>Pilih QRIS</span>
                <ArrowRight size={14} weight="bold" />
              </span>
            </button>

            {/* Transfer Bank */}
            <button
              type="button"
              onClick={() => handleSelectPaymentMethod('TRANSFER')}
              className="w-full text-left group border border-[#e2e8f0] bg-[#f8fafc] hover:border-[#2562eb] hover:bg-[#eff6ff]/60 rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-150 ease-out flex flex-col justify-between min-h-[168px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#475569] bg-white border border-[#e2e8f0] px-2.5 py-0.5 rounded-full">
                    Manual
                  </span>
                  <Bank size={20} weight="regular" className="text-[#0f2342] shrink-0" />
                </div>
                <h2 className="font-bold text-[#0f2342] text-base mt-3">Transfer Bank</h2>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  Transfer ke rekening resmi BCA/Mandiri lalu upload foto struk bukti bayar.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2562eb] mt-4 pt-3 border-t border-[#e2e8f0] w-full">
                <span>Pilih Transfer</span>
                <ArrowRight size={14} weight="bold" />
              </span>
            </button>

            {/* COD */}
            <button
              type="button"
              onClick={() => handleSelectPaymentMethod('COD')}
              className="w-full text-left group border border-[#e2e8f0] bg-[#f8fafc] hover:border-[#2562eb] hover:bg-[#eff6ff]/60 rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-150 ease-out flex flex-col justify-between min-h-[168px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#475569] bg-white border border-[#e2e8f0] px-2.5 py-0.5 rounded-full">
                    Tunai
                  </span>
                  <Money size={20} weight="regular" className="text-[#0f2342] shrink-0" />
                </div>
                <h2 className="font-bold text-[#0f2342] text-base mt-3">Bayar Saat Pickup</h2>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  Bayar tunai langsung kepada kurir saat pakaian dijemput di lokasi Anda.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#2562eb] mt-4 pt-3 border-t border-[#e2e8f0] w-full">
                <span>Pilih Tunai COD</span>
                <ArrowRight size={14} weight="bold" />
              </span>
            </button>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(8)}
              className={BTN_SECONDARY}
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Kembali ke Nomor Pesanan</span>
            </button>
            <span className="text-xs text-[#475569] tabular-nums text-right">
              Total Tagihan:{' '}
              <strong className="text-[#0f2342] text-sm">
                {formatRupiah(currentOrder.total)}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 10: PEMBAYARAN QRIS (Langkah 4 dari 4)
      ========================================================================== */}
      {guestStep === 10 && currentOrder && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)] flex flex-col gap-6">
          <StepContextHeader
            stepNumber={4}
            backLabel="Ganti Metode Pembayaran"
            onBack={() => setGuestStep(9)}
            title="Pembayaran QRIS"
            description="Scan kode QR di bawah menggunakan aplikasi m-Banking atau e-Wallet Anda."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR Code Container */}
            <div className="border border-[#e2e8f0] rounded-xl p-5 bg-[#f8fafc] flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-[#475569] mb-3">
                QRIS Iqbal Laundry Standar BI
              </span>

              <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col items-center">
                <div className="size-48 bg-[#0f2342] rounded-lg p-2.5 flex flex-col justify-between relative">
                  <div className="flex justify-between">
                    <div className="size-10 bg-white rounded flex items-center justify-center">
                      <div className="size-6 bg-[#0f2342] rounded-sm" />
                    </div>
                    <div className="size-10 bg-white rounded flex items-center justify-center">
                      <div className="size-6 bg-[#0f2342] rounded-sm" />
                    </div>
                  </div>
                  <div className="flex justify-center my-2">
                    <div className="bg-[#2562eb] text-[10px] text-white font-bold px-2.5 py-0.5 rounded">
                      QRIS
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="size-10 bg-white rounded flex items-center justify-center">
                      <div className="size-6 bg-[#0f2342] rounded-sm" />
                    </div>
                    <div className="size-8 bg-white/80 rounded grid grid-cols-2 gap-1 p-1">
                      <div className="bg-[#0f2342]" />
                      <div className="bg-[#0f2342]" />
                      <div className="bg-[#0f2342]" />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs font-bold text-[#0f2342] tabular-nums">
                  NMID: ID1020304050607
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">
                <Clock size={15} weight="bold" className="shrink-0" />
                <span className="tabular-nums font-medium">Batas bayar: 14 menit 59 detik</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="flex flex-col justify-between gap-5">
              <div>
                <h2 className="font-bold text-[#0f2342] text-base mb-3 border-b border-[#e2e8f0] pb-2">
                  Detail Pembayaran QRIS
                </h2>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-[#475569]">Nomor Pesanan</span>
                    <span className="font-bold text-[#0f2342] tabular-nums">
                      {currentOrder.id}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#475569]">Layanan</span>
                    <span className="text-[#0f2342] font-medium tabular-nums">
                      {currentOrder.serviceName} ({currentOrder.weight} {currentOrder.unit})
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#e2e8f0] gap-2">
                    <span className="font-semibold text-[#0f2342]">Total Pembayaran</span>
                    <span className="text-2xl font-bold text-[#2562eb] tabular-nums">
                      {formatRupiah(currentOrder.total)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-xs text-[#0f2342]">
                  <p className="font-bold text-[#0f2342]">Instruksi Pembayaran</p>
                  <ol className="list-decimal pl-4 mt-2 text-xs text-[#475569] space-y-1 max-w-[65ch]">
                    <li>Buka aplikasi m-Banking atau e-Wallet favorit Anda.</li>
                    <li>Pilih menu <strong>Scan / Bayar QRIS</strong>.</li>
                    <li>Arahkan kamera ke kode QR di samping.</li>
                    <li>Periksa nama penerima: <strong>Iqbal Laundry</strong>.</li>
                    <li>Masukkan PIN dan simpan bukti transaksi.</li>
                  </ol>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handlePaymentSuccess}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm h-11 px-5 rounded-lg transition-all duration-150 ease-out shadow-xs whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                >
                  <CheckCircle size={18} weight="bold" />
                  <span>Konfirmasi Pembayaran</span>
                </button>
                <button
                  type="button"
                  onClick={handlePaymentFailed}
                  className="inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs sm:text-sm h-11 px-4 rounded-lg transition-all duration-150 ease-out whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                >
                  <XCircle size={16} weight="bold" />
                  <span>Batalkan Pembayaran</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 11: GAGAL BAYAR (Langkah 4 dari 4)
      ========================================================================== */}
      {guestStep === 11 && currentOrder && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)] flex flex-col gap-6">
          <StepContextHeader
            stepNumber={4}
            backLabel="Kembali ke Metode Pembayaran"
            onBack={() => setGuestStep(9)}
            title="Pembayaran Belum Berhasil"
            description="Pesanan Anda tetap tersimpan dan Anda dapat mencoba metode pembayaran lain."
          />

          <div className="bg-red-50 border border-red-200 rounded-xl p-5 sm:p-6 text-center flex flex-col items-center">
            <XCircle size={40} weight="regular" className="text-red-500" />
            <h2 className="text-lg font-bold text-red-900 mt-2.5">
              Transaksi Dibatalkan atau Kedaluwarsa
            </h2>
            <p className="text-xs sm:text-sm text-red-700 mt-1 max-w-[65ch] tabular-nums">
              Transaksi tidak dapat diproses atau waktu pembayaran telah habis. Pesanan Anda ({currentOrder.id}) tetap tersimpan aman di sistem.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setGuestStep(10)}
              className={BTN_PRIMARY}
            >
              <span>Coba QRIS Kembali</span>
              <ArrowRight size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setGuestStep(9)}
              className={BTN_SECONDARY}
            >
              <span>Ganti Metode Pembayaran</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 12: UPLOAD BUKTI BAYAR TRANSFER (Langkah 4 dari 4)
      ========================================================================== */}
      {guestStep === 12 && currentOrder && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)] flex flex-col gap-6">
          <StepContextHeader
            stepNumber={4}
            backLabel="Ganti Metode Pembayaran"
            onBack={() => setGuestStep(9)}
            title="Transfer Bank & Upload Bukti"
            description={`Transfer sesuai nominal ${formatRupiah(currentOrder.total)} ke rekening resmi di bawah, lalu unggah bukti transfer.`}
          />

          <div className="border border-[#e2e8f0] rounded-xl p-4 sm:p-5 bg-[#f8fafc]">
            <h2 className="font-bold text-[#0f2342] text-sm mb-3">
              Rekening Resmi Transfer Iqbal Laundry
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-[#2562eb] font-bold uppercase tracking-wider">
                    BCA
                  </span>
                  <p className="font-mono text-base sm:text-lg font-bold text-[#0f2342] mt-0.5 tabular-nums">
                    8830-1928-44
                  </p>
                  <p className="text-[11px] text-[#64748b]">a.n. Iqbal Maulana Laundry</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('8830192844', 'bca', 'Nomor rekening BCA')}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:border-[#2562eb] hover:bg-[#eff6ff]/60 px-2.5 py-1.5 text-xs font-semibold text-[#0f2342] transition-all duration-150 ease-out shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                >
                  {copiedKey === 'bca' ? (
                    <Check size={14} weight="bold" className="text-emerald-600" />
                  ) : (
                    <Copy size={14} weight="bold" className="text-[#2562eb]" />
                  )}
                  <span>{copiedKey === 'bca' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-[#0f2342] font-bold uppercase tracking-wider">
                    Mandiri
                  </span>
                  <p className="font-mono text-base sm:text-lg font-bold text-[#0f2342] mt-0.5 tabular-nums">
                    132-00-9876543-1
                  </p>
                  <p className="text-[11px] text-[#64748b]">a.n. Iqbal Maulana Laundry</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('1320098765431', 'mandiri', 'Nomor rekening Mandiri')}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] hover:border-[#2562eb] hover:bg-[#eff6ff]/60 px-2.5 py-1.5 text-xs font-semibold text-[#0f2342] transition-all duration-150 ease-out shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                >
                  {copiedKey === 'mandiri' ? (
                    <Check size={14} weight="bold" className="text-emerald-600" />
                  ) : (
                    <Copy size={14} weight="bold" className="text-[#2562eb]" />
                  )}
                  <span>{copiedKey === 'mandiri' ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-[#bfdbfe] rounded-xl p-5 sm:p-6 text-center bg-[#eff6ff]/30">
            {uploadedProof ? (
              <div className="flex flex-col items-center">
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-semibold mb-2">
                  <CheckCircle size={16} weight="bold" />
                  <span>File Bukti Siap Dikirim</span>
                </div>
                <p className="text-xs sm:text-sm text-[#0f2342] font-semibold">{uploadedProof}</p>
                <button
                  type="button"
                  onClick={() => setUploadedProof(null)}
                  className="mt-2.5 text-xs font-semibold text-red-600 hover:underline px-2 py-1 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                >
                  Ganti File
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-[#0f2342]">Upload Foto Bukti Struk Transfer</p>
                <p className="text-xs text-[#64748b] mt-1">
                  Format JPG, PNG, atau PDF (Maksimal 5MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 bg-white border border-[#e2e8f0] hover:border-[#2562eb] hover:bg-[#eff6ff]/60 text-xs font-semibold text-[#2562eb] px-4 py-2 rounded-lg transition-all duration-150 ease-out shadow-xs whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
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
                    className="bg-[#eff6ff] border border-[#bfdbfe] hover:bg-blue-100 text-xs font-semibold text-[#2562eb] px-3.5 py-2 rounded-lg transition-all duration-150 ease-out whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                  >
                    Gunakan Contoh Struk
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(9)}
              className={BTN_SECONDARY}
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Ganti Metode Pembayaran</span>
            </button>
            <button
              type="button"
              onClick={() => {
                confirmPayment(
                  currentOrder.id,
                  'TRANSFER',
                  uploadedProof || 'bukti-pembayaran-terverifikasi.jpg'
                );
                showToast(`Bukti transfer untuk ${currentOrder.id} berhasil dikirim.`, 'success');
                setGuestStep(15);
              }}
              className={BTN_PRIMARY}
            >
              <span>Kirim Konfirmasi Pembayaran</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 13: STATUS KOSONG
      ========================================================================== */}
      {guestStep === 13 && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)] flex flex-col gap-6">
          <StepContextHeader
            backLabel="Kembali ke Layanan"
            onBack={() => setGuestStep(1)}
            title="Lacak Pesanan Laundry"
            description="Pantau status cucian Anda secara real-time di sini."
          />

          <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
            <div className="size-16 rounded-full bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center mb-4">
              <Basket size={28} weight="regular" className="text-[#2562eb]" />
            </div>
            <h2 className="text-lg font-bold text-[#0f2342]">Belum Ada Pesanan Aktif</h2>
            <p className="text-xs sm:text-sm text-[#475569] mt-1.5 max-w-[65ch]">
              Anda belum memiliki pesanan aktif saat ini. Buat pesanan baru atau lihat riwayat pesanan yang pernah tercatat.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setGuestStep(1)}
                className={BTN_PRIMARY}
              >
                <Plus size={16} weight="bold" />
                <span>Buat Pesanan Baru</span>
                <ArrowRight size={16} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => setGuestStep(14)}
                className={BTN_SECONDARY}
              >
                <span>Lihat Riwayat Pesanan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 14: DAFTAR PESANAN LAUNDRY
      ========================================================================== */}
      {guestStep === 14 && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)] flex flex-col gap-5">
          <StepContextHeader
            backLabel="Kembali ke Layanan"
            onBack={() => setGuestStep(1)}
            title="Lacak & Daftar Pesanan"
            description="Pilih atau cari kode pesanan Anda untuk memantau progress pengerjaan cucian."
            rightBadge={
              <span className="text-xs font-semibold text-[#2562eb] bg-[#eff6ff] px-2.5 py-0.5 rounded-full border border-[#bfdbfe] tabular-nums shrink-0">
                {orders.length} Transaksi
              </span>
            }
          />

          <div className="relative">
            <label htmlFor="guest-order-search" className="sr-only">
              Cari nomor pesanan atau nama pelanggan
            </label>
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] pointer-events-none"
            />
            <input
              id="guest-order-search"
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Cari kode pesanan (contoh: IL-1024) atau nama pelanggan..."
              className={`${INPUT_BASE} pl-10 border-[#e2e8f0] focus:border-[#2562eb]`}
            />
          </div>

          {filteredOrders.length === 0 ? (
            <div className="border border-[#e2e8f0] rounded-xl bg-[#f8fafc] p-6 text-center flex flex-col items-center gap-3">
              <p className="text-sm font-semibold text-[#0f2342]">
                Pesanan tidak ditemukan
              </p>
              <p className="text-xs text-[#64748b] max-w-[65ch]">
                Tidak ada pesanan yang cocok dengan kata kunci pencarian Anda.
              </p>
              <button
                type="button"
                onClick={() => setOrderSearch('')}
                className={BTN_SECONDARY}
              >
                <span>Tampilkan Semua Pesanan</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => {
                    setActiveOrderId(ord.id);
                    setGuestStep(15);
                  }}
                  className="w-full text-left border border-[#e2e8f0] bg-[#f8fafc] hover:border-[#2562eb] hover:bg-[#eff6ff]/60 rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-150 ease-out flex flex-col sm:flex-row sm:items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#0f2342] text-base tabular-nums">
                        {ord.id}
                      </span>
                      <span className="text-xs text-[#475569]">· {ord.customerName}</span>
                    </div>
                    <p className="text-xs text-[#64748b] mt-1 tabular-nums">
                      {ord.serviceName} · {ord.weight} {ord.unit} · {formatRupiah(ord.total)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${getOrderStatusStyle(
                        ord.status
                      )}`}
                    >
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-xs text-[#2562eb] shrink-0">
                      <span>Lihat Tracking</span>
                      <ArrowRight size={14} weight="bold" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(1)}
              className={BTN_SECONDARY}
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Kembali ke Beranda Layanan</span>
            </button>
            <button
              type="button"
              onClick={() => setGuestStep(1)}
              className={BTN_PRIMARY}
            >
              <Plus size={16} weight="bold" />
              <span>Pesan Layanan Baru</span>
              <ArrowRight size={16} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 15: DETAIL STATUS & TRACKING
      ========================================================================== */}
      {guestStep === 15 && currentOrder && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.05)] flex flex-col gap-6">
          <StepContextHeader
            backLabel="Daftar Pesanan"
            onBack={() => setGuestStep(14)}
            title={`Tracking Pesanan ${currentOrder.id}`}
            description={`${currentOrder.serviceName} · ${currentOrder.weight} ${currentOrder.unit} · Total ${formatRupiah(currentOrder.total)}`}
            rightBadge={
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${getOrderStatusStyle(
                  currentOrder.status
                )}`}
              >
                {currentOrder.status.replace(/_/g, ' ')}
              </span>
            }
          />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-[#475569] tabular-nums">
              <span>Kode Pesanan:</span>
              <strong className="text-sm text-[#0f2342]">{currentOrder.id}</strong>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(currentOrder.id, 'order-15', 'Nomor pesanan')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white hover:border-[#2562eb] hover:bg-[#eff6ff]/60 px-3 py-1.5 text-xs font-semibold text-[#0f2342] transition-all duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
            >
              {copiedKey === 'order-15' ? (
                <>
                  <Check size={14} weight="bold" className="text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy size={14} weight="bold" className="text-[#2562eb]" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>

          {/* Vertical Order Status Timeline */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <h2 className="font-bold text-[#0f2342] text-sm sm:text-base">
                Progress Pengerjaan Laundry
              </h2>
              <span className="text-xs text-[#64748b] tabular-nums">
                Estimasi Selesai: {currentOrder.estimatedFinish}
              </span>
            </div>

            <ol className="flex flex-col">
              {currentOrder.steps.map((step, idx) => {
                const isLast = idx === currentOrder.steps.length - 1;
                return (
                  <li key={step.label} className="relative flex items-start gap-3.5">
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-[15px] top-8 bottom-0 w-0.5 ${
                          step.completed ? 'bg-emerald-500' : 'bg-[#e2e8f0]'
                        }`}
                      />
                    )}

                    <span
                      className={`relative z-10 size-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        step.completed
                          ? 'bg-emerald-600 text-white'
                          : step.current
                          ? 'bg-[#2562eb] text-white ring-4 ring-[#2562eb]/15'
                          : 'bg-white border-2 border-[#cbd5e1] text-[#64748b]'
                      }`}
                    >
                      {step.completed ? (
                        <Check size={14} weight="bold" />
                      ) : (
                        <span className="tabular-nums">{idx + 1}</span>
                      )}
                    </span>

                    <div
                      className={`flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 ${
                        isLast ? 'pb-1' : 'pb-6'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            step.completed
                              ? 'text-emerald-800'
                              : step.current
                              ? 'text-[#2562eb] font-bold'
                              : 'text-[#64748b]'
                          }`}
                        >
                          {step.label}
                        </span>
                        {step.current && (
                          <span className="text-[11px] font-semibold bg-[#eff6ff] text-[#2562eb] border border-[#bfdbfe] px-2 py-0.5 rounded-full">
                            Sedang Berlangsung
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#64748b] tabular-nums">{step.time}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Customer & Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 sm:p-5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
              <h2 className="font-bold text-[#0f2342] text-sm mb-2">Penerima & Kontak</h2>
              <p className="text-[#0f2342] font-semibold">{currentOrder.customerName}</p>
              <p className="text-[#475569] tabular-nums mt-0.5">{currentOrder.phone}</p>
              {currentOrder.notes && (
                <p className="mt-3 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 max-w-[65ch]">
                  <strong>Catatan Khusus:</strong> {currentOrder.notes}
                </p>
              )}
            </div>

            <div className="p-4 sm:p-5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
              <h2 className="font-bold text-[#0f2342] text-sm mb-2">Alamat Penjemputan</h2>
              <p className="text-[#0f2342] leading-relaxed">{currentOrder.address}</p>
              {currentOrder.landmark && (
                <p className="text-[#64748b] text-xs mt-1.5">
                  Patokan: {currentOrder.landmark}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={() => setGuestStep(14)}
              className={BTN_SECONDARY}
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Kembali ke Daftar Pesanan</span>
            </button>
            <button
              type="button"
              onClick={() => setGuestStep(1)}
              className={BTN_PRIMARY}
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
