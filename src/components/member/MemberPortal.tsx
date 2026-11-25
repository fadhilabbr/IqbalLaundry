'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Info,
  Ticket,
  Receipt,
  Copy,
  Check,
  Plus,
  ArrowRight,
  ArrowLeft,
  ClockCounterClockwise,
  Star,
  SignIn,
  SignOut,
} from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';
import { formatRupiah } from '@/lib/data';
import {
  loginSchema,
  memberRegisterSchema,
  LoginFormValues,
  MemberRegisterFormValues,
} from '@/lib/validations';
import { Order, OrderStatus } from '@/types';

const STATUS_BADGE_MAP: Record<OrderStatus, { label: string; className: string }> = {
  MENUNGGU_PEMBAYARAN: {
    label: 'Menunggu Pembayaran',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  DITERIMA: {
    label: 'Diterima',
    className: 'bg-blue-50 text-[#2562eb] border border-blue-200',
  },
  DICUCI: {
    label: 'Dicuci',
    className: 'bg-blue-50 text-[#2562eb] border border-blue-200',
  },
  DISETRIKA: {
    label: 'Disetrika',
    className: 'bg-sky-50 text-sky-700 border border-sky-200',
  },
  SIAP_DIKIRIM: {
    label: 'Siap Dikirim',
    className: 'bg-sky-50 text-sky-700 border border-sky-200',
  },
  SELESAI: {
    label: 'Selesai',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  GAGAL: {
    label: 'Dibatalkan',
    className: 'bg-red-50 text-red-700 border border-red-200',
  },
};

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_BADGE_MAP[status] ?? {
    label: status.replace('_', ' '),
    className: 'bg-slate-100 text-[#475569] border border-[#e2e8f0]',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

export default function MemberPortal() {
  const router = useRouter();
  const {
    memberTab,
    setMemberTab,
    orders,
    vouchers,
    selectedHistoryOrder,
    setSelectedHistoryOrder,
    setGuestStep,
    currentUser,
    logout,
    showToast,
  } = useApp();

  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);
  const [showMobileDetail, setShowMobileDetail] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identity: 'budisantoso',
      password: 'member123',
    },
  });

  const registerForm = useForm<MemberRegisterFormValues>({
    resolver: zodResolver(memberRegisterSchema),
    defaultValues: {
      fullname: '',
      waNumber: '',
      username: '',
      password: '',
    },
  });

  const handleRegister = (data: MemberRegisterFormValues) => {
    showToast(
      `Pendaftaran member "${data.fullname}" berhasil. Selamat datang di Iqbal Laundry.`,
      'success'
    );
    registerForm.reset();
    setMemberTab('BERANDA');
  };

  const handleLogin = () => {
    showToast('Login member berhasil.', 'success');
    setMemberTab('BERANDA');
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedVoucher(code);
    showToast(`Kode voucher ${code} disalin ke clipboard.`, 'success');
    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = setTimeout(() => setCopiedVoucher(null), 2000);
  };

  const handleStartOrder = () => {
    setGuestStep(1);
    router.push('/dashboard');
  };

  const handleOpenOrderDetail = (ord: Order, fromBeranda = false) => {
    setSelectedHistoryOrder(ord);
    setShowMobileDetail(true);
    if (fromBeranda) {
      setMemberTab('RIWAYAT');
    }
  };

  const activeOrdersCount = orders.filter(
    (ord) => ord.status !== 'SELESAI' && ord.status !== 'GAGAL'
  ).length;

  return (
    <div className="flex-1 flex flex-col bg-[#f5f8fc] min-h-full p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <header className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#0f2342] leading-tight">
          {memberTab === 'BERANDA' && 'Beranda Member'}
          {memberTab === 'DAFTAR' && 'Daftar Member Baru'}
          {memberTab === 'LOGIN' && 'Masuk Akun Member'}
          {memberTab === 'RIWAYAT' && 'Riwayat Pesanan'}
          {memberTab === 'VOUCHER' && 'Voucher & Promo'}
          {memberTab === 'PROFIL' && 'Profil & Pengaturan Akun'}
        </h1>
        <p className="text-sm text-[#475569]">
          {memberTab === 'BERANDA' &&
            'Selamat datang kembali, Budi. Pesan laundry rutin lebih cepat dengan poin dan kupon member.'}
          {memberTab === 'DAFTAR' &&
            'Buat akun member untuk mengumpulkan poin loyalitas dan menikmati promo eksklusif.'}
          {memberTab === 'LOGIN' && 'Masuk ke akun member Iqbal Laundry Anda.'}
          {memberTab === 'RIWAYAT' && 'Pantau status cucian dan rincian invoice transaksi Anda.'}
          {memberTab === 'VOUCHER' && 'Salin kode kupon aktif untuk potongan langsung saat pemesanan.'}
          {memberTab === 'PROFIL' && 'Ringkasan identitas member, kontak WhatsApp, dan alamat utama.'}
        </p>
      </header>

      {/* =========================================================================
          LOGIN MEMBER
      ========================================================================== */}
      {memberTab === 'LOGIN' && (
        <div className="max-w-xl mx-auto md:mx-0 w-full bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-5">
          <form onSubmit={loginForm.handleSubmit(handleLogin)} noValidate className="flex flex-col gap-4">
            <div>
              <label htmlFor="member-login-identity" className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                Username / Nomor WhatsApp
              </label>
              <input
                id="member-login-identity"
                type="text"
                autoComplete="username"
                {...loginForm.register('identity')}
                placeholder="budisantoso atau 081234567890"
                className={`w-full bg-[#f8fafc] border rounded-lg px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-[#64748b] transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
                  loginForm.formState.errors.identity
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#cbd5e1] focus:border-[#2562eb]'
                }`}
              />
              {loginForm.formState.errors.identity && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">
                  {loginForm.formState.errors.identity.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="member-login-password" className="text-xs font-semibold text-[#0f2342]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Tautan reset password dikirim ke WhatsApp terdaftar.', 'info')}
                  className="text-xs font-medium text-[#2562eb] hover:text-[#1d4ed8] hover:underline cursor-pointer transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded"
                >
                  Lupa password?
                </button>
              </div>
              <input
                id="member-login-password"
                type="password"
                autoComplete="current-password"
                {...loginForm.register('password')}
                placeholder="Masukkan password"
                className={`w-full bg-[#f8fafc] border rounded-lg px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-[#64748b] transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
                  loginForm.formState.errors.password
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#cbd5e1] focus:border-[#2562eb]'
                }`}
              />
              {loginForm.formState.errors.password && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="mt-1 bg-[#2562eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm h-11 rounded-lg transition duration-150 ease-out shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
            >
              Masuk ke Akun Member
            </button>
          </form>

          <div className="text-center text-xs text-[#475569] border-t border-[#e2e8f0] pt-4">
            Belum punya akun member?{' '}
            <button
              type="button"
              onClick={() => setMemberTab('DAFTAR')}
              className="text-[#2562eb] font-semibold hover:text-[#1d4ed8] hover:underline cursor-pointer transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          REGISTRASI MEMBER
      ========================================================================== */}
      {memberTab === 'DAFTAR' && (
        <div className="max-w-xl mx-auto md:mx-0 w-full bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-5">
          {Object.keys(registerForm.formState.errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-800">
              <p className="font-bold mb-0.5">Periksa data pendaftaran</p>
              <p>Mohon perbaiki kolom yang ditandai merah di bawah ini.</p>
            </div>
          )}

          <form onSubmit={registerForm.handleSubmit(handleRegister)} noValidate className="flex flex-col gap-4">
            <div>
              <label htmlFor="member-reg-fullname" className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                Nama Lengkap
              </label>
              <input
                id="member-reg-fullname"
                type="text"
                autoComplete="name"
                {...registerForm.register('fullname')}
                placeholder="Nama sesuai KTP atau identitas"
                className={`w-full bg-[#f8fafc] border rounded-lg px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-[#64748b] transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
                  registerForm.formState.errors.fullname
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#cbd5e1] focus:border-[#2562eb]'
                }`}
              />
              {registerForm.formState.errors.fullname && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">
                  {registerForm.formState.errors.fullname.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="member-reg-wa" className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                Nomor WhatsApp Aktif
              </label>
              <input
                id="member-reg-wa"
                type="tel"
                autoComplete="tel"
                {...registerForm.register('waNumber')}
                placeholder="081234567890"
                className={`w-full bg-[#f8fafc] border rounded-lg px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-[#64748b] tabular-nums transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
                  registerForm.formState.errors.waNumber
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#cbd5e1] focus:border-[#2562eb]'
                }`}
              />
              {registerForm.formState.errors.waNumber ? (
                <p className="text-xs text-red-600 mt-1.5 font-medium">
                  {registerForm.formState.errors.waNumber.message}
                </p>
              ) : (
                <p className="text-xs text-[#64748b] mt-1">Kurir akan menghubungi Anda melalui nomor ini.</p>
              )}
            </div>

            <div>
              <label htmlFor="member-reg-username" className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                Username
              </label>
              <input
                id="member-reg-username"
                type="text"
                autoComplete="username"
                {...registerForm.register('username')}
                placeholder="Username huruf kecil tanpa spasi"
                className={`w-full bg-[#f8fafc] border rounded-lg px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-[#64748b] transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
                  registerForm.formState.errors.username
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#cbd5e1] focus:border-[#2562eb]'
                }`}
              />
              {registerForm.formState.errors.username && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">
                  {registerForm.formState.errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="member-reg-password" className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                Kata Sandi (Password)
              </label>
              <input
                id="member-reg-password"
                type="password"
                autoComplete="new-password"
                {...registerForm.register('password')}
                placeholder="Minimal 6 karakter"
                className={`w-full bg-[#f8fafc] border rounded-lg px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-[#64748b] transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 ${
                  registerForm.formState.errors.password
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#cbd5e1] focus:border-[#2562eb]'
                }`}
              />
              {registerForm.formState.errors.password && (
                <p className="text-xs text-red-600 mt-1.5 font-medium">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="mt-1 bg-[#2562eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm h-11 rounded-lg transition duration-150 ease-out shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
            >
              Daftar Member Sekarang
            </button>
          </form>

          <div className="text-center text-xs text-[#475569] border-t border-[#e2e8f0] pt-4">
            Sudah memiliki akun?{' '}
            <button
              type="button"
              onClick={() => setMemberTab('LOGIN')}
              className="text-[#2562eb] font-semibold hover:text-[#1d4ed8] hover:underline cursor-pointer transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded"
            >
              Masuk di sini
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          BERANDA MEMBER
      ========================================================================== */}
      {memberTab === 'BERANDA' && (
        <div className="space-y-6">
          {/* Primary Action Hero */}
          <section className="bg-[#2562eb] text-white rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Jemput cucian langsung dari rumah Anda
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Pilih layanan kiloan, setrika, atau karpet dengan jadwal pickup fleksibel setiap hari.
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartOrder}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-[#2562eb] font-bold text-sm px-5 h-11 rounded-xl transition duration-150 ease-out shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <Plus size={16} weight="bold" aria-hidden="true" />
              <span>Pesan Laundry Baru</span>
            </button>
          </section>

          {/* Single-Source Loyalty & Active Order Summary */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
                  <Star size={14} weight="fill" className="text-amber-500" aria-hidden="true" />
                  <span>Member Gold</span>
                </div>
                <p className="text-2xl font-bold text-[#0f2342] tabular-nums">1.250 Poin</p>
                <p className="text-xs text-[#64748b] tabular-nums">
                  {vouchers.length} voucher diskon aktif siap dipakai
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMemberTab('VOUCHER')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2562eb] bg-[#eff6ff] hover:bg-blue-100 border border-blue-200 px-3.5 h-10 rounded-lg transition duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap shrink-0"
              >
                <span>Lihat Voucher</span>
                <ArrowRight size={13} weight="bold" aria-hidden="true" />
              </button>
            </div>

            <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
                  <ClockCounterClockwise size={14} weight="bold" className="text-[#2562eb]" aria-hidden="true" />
                  <span>Pesanan Berjalan</span>
                </div>
                <p className="text-2xl font-bold text-[#0f2342] tabular-nums">
                  {activeOrdersCount} Aktif
                </p>
                <p className="text-xs text-[#64748b] tabular-nums">
                  Total {orders.length} transaksi tercatat
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMemberTab('RIWAYAT')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0f2342] bg-[#f8fafc] hover:bg-slate-100 border border-[#e2e8f0] px-3.5 h-10 rounded-lg transition duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap shrink-0"
              >
                <span>Buka Riwayat</span>
                <ArrowRight size={13} weight="bold" aria-hidden="true" />
              </button>
            </div>
          </section>

          {/* Recent / Active Orders */}
          <section className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-bold text-[#0f2342] text-base">Pesanan Terakhir</h2>
              <button
                type="button"
                onClick={() => setMemberTab('RIWAYAT')}
                className="inline-flex items-center gap-1 text-xs text-[#2562eb] hover:text-[#1d4ed8] font-semibold hover:underline cursor-pointer transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded whitespace-nowrap"
              >
                <span>Semua Riwayat</span>
                <ArrowRight size={12} weight="bold" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-3">
              {orders.slice(0, 3).map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => handleOpenOrderDetail(ord, true)}
                  className="w-full text-left border border-[#e2e8f0] bg-[#f8fafc] hover:bg-slate-50 hover:border-blue-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#0f2342] tabular-nums">{ord.id}</span>
                      <span className="text-xs text-[#64748b] tabular-nums">· {ord.createdAt}</span>
                    </div>
                    <p className="text-xs text-[#475569] tabular-nums">
                      {ord.serviceName} · {ord.weight} {ord.unit}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-sm font-bold text-[#0f2342] tabular-nums">
                      {formatRupiah(ord.total)}
                    </span>
                    <OrderStatusBadge status={ord.status} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* =========================================================================
          RIWAYAT & DETAIL INVOICE
      ========================================================================== */}
      {memberTab === 'RIWAYAT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Order List: hidden on mobile when mobile detail view is open */}
          <div
            className={`${
              showMobileDetail && selectedHistoryOrder ? 'hidden lg:flex' : 'flex'
            } lg:col-span-2 bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm flex-col gap-4`}
          >
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <h2 className="font-bold text-[#0f2342] text-base">Daftar Transaksi</h2>
              <span className="text-xs font-medium text-[#64748b] tabular-nums">
                {orders.length} pesanan
              </span>
            </div>

            {/* Mobile Cards (< md) */}
            <div className="md:hidden space-y-3">
              {orders.map((ord) => {
                const isSelected = selectedHistoryOrder?.id === ord.id;
                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => handleOpenOrderDetail(ord)}
                    className={`w-full text-left border rounded-xl p-4 space-y-2.5 cursor-pointer transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
                      isSelected
                        ? 'border-[#2562eb] bg-[#eff6ff]/60'
                        : 'border-[#e2e8f0] bg-[#f8fafc] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-[#0f2342] tabular-nums">{ord.id}</span>
                      <OrderStatusBadge status={ord.status} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium text-[#0f2342] tabular-nums">
                        {ord.serviceName} · {ord.weight} {ord.unit}
                      </p>
                      <p className="text-xs text-[#64748b] tabular-nums">{ord.createdAt}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]">
                      <span className="font-bold text-sm text-[#2562eb] tabular-nums">
                        {formatRupiah(ord.total)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2562eb]">
                        <span>Lihat Invoice</span>
                        <ArrowRight size={12} weight="bold" aria-hidden="true" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Desktop Aligned Rows (md+) */}
            <div className="hidden md:block border border-[#e2e8f0] rounded-xl overflow-hidden">
              <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-[#e2e8f0] grid grid-cols-12 gap-3 text-xs font-semibold text-[#475569]">
                <span className="col-span-4">Order & Tanggal</span>
                <span className="col-span-3">Layanan</span>
                <span className="col-span-2 text-right">Total</span>
                <span className="col-span-3 text-right">Status</span>
              </div>
              <div className="divide-y divide-[#e2e8f0]">
                {orders.map((ord) => {
                  const isSelected = selectedHistoryOrder?.id === ord.id;
                  return (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => handleOpenOrderDetail(ord)}
                      className={`w-full text-left px-4 py-3.5 grid grid-cols-12 gap-3 items-center cursor-pointer transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
                        isSelected ? 'bg-[#eff6ff]/70' : 'bg-white hover:bg-[#f8fafc]'
                      }`}
                    >
                      <span className="col-span-4 min-w-0 block">
                        <span className="block font-bold text-sm text-[#0f2342] tabular-nums">
                          {ord.id}
                        </span>
                        <span className="block text-xs text-[#64748b] tabular-nums mt-0.5">
                          {ord.createdAt}
                        </span>
                      </span>
                      <span className="col-span-3 min-w-0 block">
                        <span className="block text-xs font-medium text-[#0f2342] truncate">
                          {ord.serviceName}
                        </span>
                        <span className="block text-xs text-[#64748b] tabular-nums mt-0.5">
                          {ord.weight} {ord.unit}
                        </span>
                      </span>
                      <span className="col-span-2 text-right font-bold text-xs text-[#0f2342] tabular-nums">
                        {formatRupiah(ord.total)}
                      </span>
                      <span className="col-span-3 flex justify-end">
                        <OrderStatusBadge status={ord.status} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Invoice Detail Panel */}
          {selectedHistoryOrder && (
            <div
              className={`${
                showMobileDetail ? 'flex' : 'hidden lg:flex'
              } bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm flex-col gap-5`}
            >
              {/* Mobile Back Button */}
              <button
                type="button"
                onClick={() => setShowMobileDetail(false)}
                className="lg:hidden inline-flex items-center gap-1.5 self-start text-xs font-semibold text-[#2562eb] hover:text-[#1d4ed8] bg-[#eff6ff] border border-blue-200 px-3 h-9 rounded-lg transition duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98]"
              >
                <ArrowLeft size={14} weight="bold" aria-hidden="true" />
                <span>Kembali ke Daftar Riwayat</span>
              </button>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-[#2562eb]">Detail Invoice</span>
                  <h2 className="text-xl font-bold text-[#0f2342] mt-0.5 tabular-nums">
                    {selectedHistoryOrder.id}
                  </h2>
                  <p className="text-xs text-[#64748b] mt-0.5 tabular-nums">
                    {selectedHistoryOrder.createdAt}
                  </p>
                </div>
                <OrderStatusBadge status={selectedHistoryOrder.status} />
              </div>

              <div className="border-t border-b border-[#e2e8f0] py-4 text-xs space-y-2.5">
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748b]">Layanan</span>
                  <span className="font-semibold text-[#0f2342] text-right">
                    {selectedHistoryOrder.serviceName}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748b]">Berat / Volume</span>
                  <span className="font-semibold text-[#0f2342] tabular-nums">
                    {selectedHistoryOrder.weight} {selectedHistoryOrder.unit}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748b] shrink-0">Alamat Pickup</span>
                  <span className="text-[#0f2342] text-right">{selectedHistoryOrder.address}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748b]">Metode Bayar</span>
                  <span className="font-semibold text-[#0f2342]">
                    {selectedHistoryOrder.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748b]">Biaya Layanan</span>
                  <span className="text-[#0f2342] tabular-nums">
                    {formatRupiah(selectedHistoryOrder.serviceTotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748b]">Ongkos Kirim</span>
                  <span className="text-[#0f2342] tabular-nums">
                    {formatRupiah(selectedHistoryOrder.deliveryFee)}
                  </span>
                </div>
                {selectedHistoryOrder.discount > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[#64748b]">Diskon Voucher</span>
                    <span className="font-semibold text-emerald-700 tabular-nums">
                      -{formatRupiah(selectedHistoryOrder.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2.5 border-t border-[#e2e8f0] text-sm font-bold">
                  <span className="text-[#0f2342]">Total Bayar</span>
                  <span className="text-[#2562eb] tabular-nums">
                    {formatRupiah(selectedHistoryOrder.total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  showToast(`Struk invoice digital ${selectedHistoryOrder.id} siap diunduh.`, 'info')
                }
                className="w-full inline-flex items-center justify-center gap-2 bg-[#f8fafc] border border-[#cbd5e1] hover:bg-slate-100 text-xs font-bold text-[#0f2342] h-11 rounded-lg transition duration-150 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
              >
                <Receipt size={15} weight="bold" aria-hidden="true" />
                <span>Unduh Struk / Invoice</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VOUCHER PROMO
      ========================================================================== */}
      {memberTab === 'VOUCHER' && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchers.map((v) => {
              const isCopied = copiedVoucher === v.code;
              const discountHighlight =
                v.discountType === 'PERCENT'
                  ? `Diskon ${v.discountValue}%`
                  : `Potongan ${formatRupiah(v.discountValue)}`;

              return (
                <div
                  key={v.code}
                  className="border border-[#dce5f0] bg-[#f8fafc] rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#eff6ff] text-[#2562eb] border border-blue-200 px-2.5 py-0.5 rounded-full">
                        <Ticket size={12} weight="fill" aria-hidden="true" />
                        <span>Kupon Aktif</span>
                      </span>
                      <p className="text-xl font-bold text-[#2562eb] tabular-nums pt-0.5">
                        {discountHighlight}
                      </p>
                      <p className="text-xs text-[#475569]">{v.description}</p>
                    </div>
                  </div>

                  <div className="border-t border-[#e2e8f0] pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="font-mono font-bold text-sm text-[#0f2342] tracking-wider">
                        {v.code}
                      </p>
                      <p className="text-xs font-medium text-[#64748b] tabular-nums">
                        Min. transaksi {formatRupiah(v.minOrder)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyCode(v.code)}
                      className={`inline-flex items-center justify-center gap-1.5 font-semibold text-xs px-4 h-10 rounded-lg transition duration-150 ease-out shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap ${
                        isCopied
                          ? 'bg-emerald-600 text-white border border-emerald-600'
                          : 'bg-white border border-[#cbd5e1] hover:border-[#2562eb] hover:bg-[#eff6ff] text-[#2562eb]'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} weight="bold" aria-hidden="true" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} weight="bold" aria-hidden="true" />
                          <span>Salin Kode</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-start sm:items-center gap-2.5 text-xs text-[#475569] bg-[#f8fafc] p-3.5 rounded-xl border border-[#e2e8f0]">
            <Info size={16} weight="fill" className="text-[#2562eb] shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
            <span>
              Tempel kode voucher pada langkah konfirmasi pesanan untuk memotong total tagihan secara otomatis.
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          PROFIL MEMBER
      ========================================================================== */}
      {memberTab === 'PROFIL' && (
        <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-5 max-w-2xl">
          <div className="flex items-center gap-4 pb-4 border-b border-[#e2e8f0]">
            <div className="size-14 rounded-full bg-[#2562eb] text-white font-bold text-lg flex items-center justify-center shrink-0">
              BS
            </div>
            <div>
              <h2 className="font-bold text-[#0f2342] text-lg">Budi Santoso</h2>
              <p className="text-xs text-[#64748b] tabular-nums">
                Member sejak Oktober 2025 · ID: MEM-0982
              </p>
            </div>
          </div>

          <div className="divide-y divide-[#e2e8f0] text-xs sm:text-sm">
            <div className="flex justify-between gap-4 py-3">
              <span className="text-[#64748b]">Nomor WhatsApp</span>
              <span className="font-semibold text-[#0f2342] tabular-nums">0812-3456-7890</span>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <span className="text-[#64748b]">Alamat Utama</span>
              <span className="font-semibold text-[#0f2342] text-right">
                Jl. Soekarno Hatta No. 45
              </span>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <span className="text-[#64748b]">Tingkatan Loyalitas</span>
              <span className="font-semibold text-[#0f2342]">Member Gold</span>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <span className="text-[#64748b]">Total Poin</span>
              <span className="font-bold text-[#2562eb] tabular-nums">1.250 Poin</span>
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
                <span>Masuk / Ganti Akun</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
