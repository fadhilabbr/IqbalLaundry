'use client';

import React, { useState } from 'react';
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
} from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';
import { formatRupiah } from '@/lib/data';
import {
  loginSchema,
  memberRegisterSchema,
  LoginFormValues,
  MemberRegisterFormValues,
} from '@/lib/validations';

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
    showToast,
  } = useApp();

  const [copiedVoucher, setCopiedVoucher] = useState<string | null>(null);

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
    showToast(`Pendaftaran member "${data.fullname}" berhasil. Selamat datang di Iqbal Laundry.`, 'success');
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
    setTimeout(() => setCopiedVoucher(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f5f8fc] min-h-full p-6 sm:p-10">
      {/* Brand Header */}
      <div className="flex items-center justify-between w-full h-[34px] mb-6">
        <p className="text-[13px] text-[#64748b] font-normal">
          {memberTab === 'BERANDA' && 'Beranda / Selamat datang kembali'}
          {memberTab === 'DAFTAR' && 'Beranda / Daftar member'}
          {memberTab === 'LOGIN' && 'Beranda / Login member'}
          {memberTab === 'RIWAYAT' && 'Beranda / Riwayat pesanan'}
          {memberTab === 'VOUCHER' && 'Beranda / Voucher diskon'}
          {memberTab === 'PROFIL' && 'Beranda / Profil member'}
        </p>
        <span className="bg-[#dbeafe] text-[#2562eb] text-xs font-medium px-3 py-1 rounded-full">
          Member
        </span>
      </div>

      {/* Hero Section */}
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-[28px] font-bold text-[#0f2342] leading-tight">
          {memberTab === 'BERANDA' && 'Selamat datang kembali, Budi'}
          {memberTab === 'DAFTAR' && 'Daftar member'}
          {memberTab === 'LOGIN' && 'Selamat datang kembali'}
          {memberTab === 'RIWAYAT' && 'Riwayat pesanan'}
          {memberTab === 'VOUCHER' && 'Voucher diskon'}
          {memberTab === 'PROFIL' && 'Profil & Pengaturan Akun'}
        </h2>
        <p className="text-sm text-[#64748b]">
          {memberTab === 'BERANDA' && 'Kelola cucian rutin Anda dengan diskon member eksklusif dan gratis jemput.'}
          {memberTab === 'DAFTAR' && 'Buat akun untuk nikmati poin cashback dan voucher member.'}
          {memberTab === 'LOGIN' && 'Login ke dashboard akun member Iqbal Laundry.'}
          {memberTab === 'RIWAYAT' && 'Semua transaksi dan invoice cucian Anda.'}
          {memberTab === 'VOUCHER' && 'Promo dan kupon diskon spesial untuk member aktif.'}
          {memberTab === 'PROFIL' && 'Informasi akun, alamat favorit, dan tingkatan loyalty.'}
        </p>
      </div>

      {/* =========================================================================
          SCREEN 18: LOGIN MEMBER
      ========================================================================== */}
      {memberTab === 'LOGIN' && (
        <div className="max-w-xl mx-auto w-full bg-white border border-[#dce5f0] rounded-[16px] p-8 shadow-sm flex flex-col gap-6">
          <form onSubmit={loginForm.handleSubmit(handleLogin)} noValidate className="flex flex-col gap-4">
            <div>
              <label htmlFor="member-login-identity" className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                Username / Nomor WhatsApp
              </label>
              <input
                id="member-login-identity"
                type="text"
                {...loginForm.register('identity')}
                placeholder="budisantoso atau 081234567890"
                className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-slate-400 focus:outline-none ${
                  loginForm.formState.errors.identity
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#cbd5e1] focus:border-[#2562eb]'
                }`}
              />
              {loginForm.formState.errors.identity && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
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
                  className="text-xs text-[#2562eb] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded"
                >
                  Lupa password?
                </button>
              </div>
              <input
                id="member-login-password"
                type="password"
                {...loginForm.register('password')}
                placeholder="Masukkan password"
                className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-slate-400 focus:outline-none ${
                  loginForm.formState.errors.password
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#cbd5e1] focus:border-[#2562eb]'
                }`}
              />
              {loginForm.formState.errors.password && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="mt-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-sm h-12 rounded-[10px] transition shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
            >
              Masuk ke Akun Member
            </button>
          </form>

          <div className="text-center text-xs text-[#64748b] border-t border-[#e2e8f0] pt-4">
            Belum punya akun member?{' '}
            <button
              type="button"
              onClick={() => setMemberTab('DAFTAR')}
              className="text-[#2562eb] font-semibold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 16 & 17: REGISTRASI & ERROR DAFTAR
      ========================================================================== */}
      {memberTab === 'DAFTAR' && (
        <div className="max-w-xl mx-auto w-full bg-white border border-[#dce5f0] rounded-[16px] p-8 shadow-sm flex flex-col gap-6">
          {Object.keys(registerForm.formState.errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-[10px] p-4 text-xs text-red-800">
              <p className="font-bold mb-1">Periksa Pendaftaran:</p>
              Mohon lengkapi atau perbaiki kolom yang ditandai merah di bawah ini.
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
                {...registerForm.register('fullname')}
                placeholder="Nama sesuai KTP/identitas"
                className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-slate-400 focus:outline-none ${
                  registerForm.formState.errors.fullname
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#cbd5e1] focus:border-[#2562eb]'
                }`}
              />
              {registerForm.formState.errors.fullname && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
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
                {...registerForm.register('waNumber')}
                placeholder="081234567890"
                className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-slate-400 focus:outline-none tabular-nums ${
                  registerForm.formState.errors.waNumber
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#cbd5e1] focus:border-[#2562eb]'
                }`}
              />
              {registerForm.formState.errors.waNumber ? (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {registerForm.formState.errors.waNumber.message}
                </p>
              ) : (
                <span className="text-[11px] text-[#64748b]">Kurir akan menghubungi via WhatsApp ini.</span>
              )}
            </div>

            <div>
              <label htmlFor="member-reg-username" className="block text-xs font-semibold text-[#0f2342] mb-1.5">
                Pilih Username
              </label>
              <input
                id="member-reg-username"
                type="text"
                {...registerForm.register('username')}
                placeholder="Username huruf kecil tanpa spasi"
                className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-slate-400 focus:outline-none ${
                  registerForm.formState.errors.username
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#cbd5e1] focus:border-[#2562eb]'
                }`}
              />
              {registerForm.formState.errors.username && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
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
                {...registerForm.register('password')}
                placeholder="Minimal 6 karakter"
                className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-slate-400 focus:outline-none ${
                  registerForm.formState.errors.password
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-[#cbd5e1] focus:border-[#2562eb]'
                }`}
              />
              {registerForm.formState.errors.password && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">
                  {registerForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="mt-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-sm h-12 rounded-[10px] transition shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
            >
              Daftar Member Sekarang
            </button>
          </form>

          <div className="text-center text-xs text-[#64748b] border-t border-[#e2e8f0] pt-4">
            Sudah memiliki akun?{' '}
            <button
              type="button"
              onClick={() => setMemberTab('LOGIN')}
              className="text-[#2562eb] font-semibold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded"
            >
              Masuk di sini
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          BERANDA MEMBER DASHBOARD
      ========================================================================== */}
      {memberTab === 'BERANDA' && (
        <div className="space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#2562eb] to-sky-600 text-white rounded-[16px] p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-medium">Member Gold</span>
              <h3 className="text-2xl font-bold mt-2">Mau laundry apa hari ini, Budi?</h3>
              <p className="text-xs text-blue-100 mt-1">Gunakan voucher diskon 10% Anda sebelum tanggal 30 Nov.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setGuestStep(1);
                  router.push('/dashboard');
                }}
                className="inline-flex items-center justify-center gap-1.5 bg-white text-[#2562eb] font-bold text-xs px-5 py-3 rounded-[10px] hover:bg-blue-50 transition shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
              >
                <Plus size={14} weight="bold" />
                <span>Buat Pesanan Baru</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#dce5f0] rounded-[12px] p-5 shadow-sm">
              <span className="text-xs text-[#64748b]">Total Transaksi</span>
              <p className="text-2xl font-extrabold text-[#0f2342] mt-1 tabular-nums">12 Order</p>
              <p className="text-[11px] text-emerald-600 mt-0.5">Semua selesai rapi</p>
            </div>
            <div className="bg-white border border-[#dce5f0] rounded-[12px] p-5 shadow-sm">
              <span className="text-xs text-[#64748b]">Poin Loyalitas</span>
              <p className="text-2xl font-extrabold text-[#2562eb] mt-1 tabular-nums">1.250 Poin</p>
              <p className="text-[11px] text-[#64748b] mt-0.5">Dapat ditukar voucher</p>
            </div>
            <div className="bg-white border border-[#dce5f0] rounded-[12px] p-5 shadow-sm">
              <span className="text-xs text-[#64748b]">Voucher Tersedia</span>
              <p className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">2 Kupon</p>
              <button
                type="button"
                onClick={() => setMemberTab('VOUCHER')}
                className="inline-flex items-center gap-1 text-[11px] text-[#2562eb] font-semibold hover:underline mt-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded whitespace-nowrap"
              >
                <span>Lihat kupon saya</span>
                <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </div>

          {/* Active Orders Section */}
          <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-[#0f2342] text-base">Pesanan Terakhir Anda</h4>
              <button
                type="button"
                onClick={() => setMemberTab('RIWAYAT')}
                className="inline-flex items-center gap-1 text-xs text-[#2562eb] font-semibold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 rounded whitespace-nowrap"
              >
                <span>Lihat Semua Riwayat</span>
                <ArrowRight size={12} weight="bold" />
              </button>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 2).map((ord) => (
                <div
                  key={ord.id}
                  className="border border-[#e2e8f0] bg-[#f8fafc] rounded-[10px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-sm text-[#0f2342] tabular-nums">{ord.id}</span>
                    <p className="text-xs text-[#64748b] tabular-nums">
                      {ord.serviceName} · {ord.weight} {ord.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#2562eb] tabular-nums">{formatRupiah(ord.total)}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-100 text-blue-800 whitespace-nowrap">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 19 & 20: RIWAYAT & DETAIL RIWAYAT
      ========================================================================== */}
      {memberTab === 'RIWAYAT' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order list */}
          <div className="lg:col-span-2 bg-white border border-[#dce5f0] rounded-[16px] p-6 shadow-sm flex flex-col gap-4">
            <h4 className="font-bold text-[#0f2342] text-base border-b border-[#e2e8f0] pb-2">
              Semua Riwayat Transaksi
            </h4>
            <div className="space-y-3">
              {orders.map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => setSelectedHistoryOrder(ord)}
                  className={`w-full text-left border rounded-[12px] p-4 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] ${
                    selectedHistoryOrder?.id === ord.id
                      ? 'border-blue-400 bg-blue-50/50'
                      : 'border-[#e2e8f0] bg-[#f8fafc] hover:bg-slate-50'
                  }`}
                >
                  <span className="block">
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0f2342] tabular-nums">{ord.id}</span>
                      <span className="text-xs text-slate-500 tabular-nums">· {ord.createdAt}</span>
                    </span>
                    <span className="block text-xs text-[#64748b] mt-0.5 tabular-nums">
                      {ord.serviceName} · {ord.weight} {ord.unit}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 justify-between sm:justify-end">
                    <span className="font-bold text-xs text-[#0f2342] tabular-nums">{formatRupiah(ord.total)}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 whitespace-nowrap">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Order Detail Panel */}
          {selectedHistoryOrder && (
            <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 shadow-sm flex flex-col justify-between h-fit">
              <div>
                <span className="text-xs font-semibold text-blue-600">Detail Transaksi</span>
                <h4 className="text-xl font-bold text-[#0f2342] mt-1 tabular-nums">{selectedHistoryOrder.id}</h4>
                <p className="text-xs text-[#64748b] mt-0.5 tabular-nums">{selectedHistoryOrder.createdAt}</p>

                <div className="mt-4 border-t border-b border-[#e2e8f0] py-3 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Layanan:</span>
                    <span className="font-semibold text-[#0f2342]">{selectedHistoryOrder.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Berat / Volume:</span>
                    <span className="tabular-nums">{selectedHistoryOrder.weight} {selectedHistoryOrder.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Alamat Pickup:</span>
                    <span className="text-right max-w-[160px] truncate">{selectedHistoryOrder.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">Metode Bayar:</span>
                    <span className="font-semibold">{selectedHistoryOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold">
                    <span>Total Bayar:</span>
                    <span className="text-[#2562eb] tabular-nums">{formatRupiah(selectedHistoryOrder.total)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => showToast(`Struk invoice digital ${selectedHistoryOrder.id} siap diunduh.`, 'info')}
                className="mt-5 w-full inline-flex items-center justify-center gap-1.5 bg-[#f8fafc] border border-[#cbd5e1] hover:bg-slate-100 text-xs font-bold text-[#0f2342] py-2.5 rounded-[10px] transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
              >
                <Receipt size={15} weight="bold" />
                <span>Unduh Struk / Invoice</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SCREEN 21: VOUCHER PROMO
      ========================================================================== */}
      {memberTab === 'VOUCHER' && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-7 shadow-sm flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vouchers.map((v) => (
              <div
                key={v.code}
                className="border border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 rounded-[14px] p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-blue-600 text-white px-2 py-0.5 rounded">
                    <Ticket size={12} weight="fill" />
                    <span>Kupon Aktif</span>
                  </span>
                  <h4 className="font-bold text-[#0f2342] text-lg mt-2 font-mono tracking-wider">{v.code}</h4>
                  <p className="text-xs text-[#2562eb] font-semibold">{v.title}</p>
                  <p className="text-[11px] text-[#64748b] mt-1">{v.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => copyCode(v.code)}
                  className="inline-flex items-center gap-1.5 bg-white border border-blue-300 hover:bg-blue-50 text-[#2562eb] font-bold text-xs px-3.5 py-2 rounded-lg transition shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 active:scale-[0.98] whitespace-nowrap"
                >
                  {copiedVoucher === v.code ? (
                    <>
                      <Check size={14} weight="bold" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} weight="bold" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <p className="flex items-center gap-2 text-xs text-[#64748b] bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0]">
            <Info size={16} weight="fill" className="text-[#2562eb] shrink-0" />
            <span>Masukkan kode voucher saat membuat pesanan untuk mendapatkan potongan harga langsung.</span>
          </p>
        </div>
      )}

      {/* PROFIL TAB */}
      {memberTab === 'PROFIL' && (
        <div className="bg-white border border-[#dce5f0] rounded-[16px] p-7 shadow-sm flex flex-col gap-6 max-w-2xl">
          <div className="flex items-center gap-4 pb-4 border-b border-[#e2e8f0]">
            <div className="size-16 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center">
              BS
            </div>
            <div>
              <h3 className="font-bold text-[#0f2342] text-lg">Budi Santoso</h3>
              <p className="text-xs text-[#64748b] tabular-nums">Member sejak Oktober 2025 · ID: MEM-0982</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-[#64748b]">Nomor WhatsApp</span>
              <span className="font-semibold text-[#0f2342] tabular-nums">0812-3456-7890</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-[#64748b]">Alamat Utama</span>
              <span className="font-semibold text-[#0f2342]">Jl. Soekarno Hatta No. 45</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#64748b]">Total Poin</span>
              <span className="font-bold text-[#2562eb] tabular-nums">1.250 Poin</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
