'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeSlash,
  Lightning,
  SignIn,
  WarningCircle,
} from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';
import { DUMMY_ACCOUNTS, UserAccount } from '@/lib/auth';
import { loginSchema, LoginFormValues } from '@/lib/validations';
import { Role } from '@/types';

function getRouteForRole(role: Role): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'KURIR') return '/kurir';
  if (role === 'MEMBER') return '/member';
  return '/dashboard';
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useApp();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<UserAccount | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identity: 'admin',
      password: 'admin123',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setErrorMsg(null);

    const res = login(data.identity, data.password);
    if (!res.success) {
      setErrorMsg(res.error || 'Username atau password salah.');
      return;
    }

    const matched = DUMMY_ACCOUNTS.find(
      (a) =>
        a.username.toLowerCase() === data.identity.toLowerCase() ||
        a.phone === data.identity
    );
    if (matched) {
      setSuccessUser(matched);
      const targetRoute = getRouteForRole(matched.role);
      setTimeout(() => {
        router.push(targetRoute);
      }, 700);
    } else {
      router.push('/dashboard');
    }
  };

  const handleQuickDemoLogin = (targetRole: Role) => {
    setErrorMsg(null);
    loginAsDemo(targetRole);
    const matched = DUMMY_ACCOUNTS.find((a) => a.role === targetRole);
    const targetRoute = getRouteForRole(targetRole);
    if (matched) {
      setValue('identity', matched.username, { shouldValidate: true });
      setValue('password', matched.password, { shouldValidate: true });
      setSuccessUser(matched);
      setTimeout(() => {
        router.push(targetRoute);
      }, 500);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f5f8fc] flex flex-col justify-between p-4 sm:p-8">
      {/* Top Navbar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-[#e2e8f0]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
        >
          <span className="font-bold text-xl text-[#0f2342] group-hover:text-blue-600 transition tracking-tight">
            ✦ Iqbal Laundry
          </span>
          <span className="text-[11px] bg-blue-100 text-[#2562eb] font-semibold px-2 py-0.5 rounded-full">
            Portal Resmi
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="text-xs font-semibold text-[#64748b] hover:text-[#0f2342] inline-flex items-center gap-1.5 rounded-lg px-2 py-1 transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
        >
          <ArrowLeft size={14} weight="bold" aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full py-8 flex flex-col lg:flex-row items-center gap-8 justify-center">
        {/* Left Side: Login Form */}
        <div className="w-full max-w-md bg-white border border-[#dce5f0] rounded-[16px] p-8 shadow-[0_1px_3px_rgba(15,35,66,0.06)] flex flex-col gap-6">
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Akses Portal Terintegrasi
            </span>
            <h1 className="text-2xl font-bold text-[#0f2342] mt-1">Selamat datang kembali</h1>
            <p className="text-xs text-[#64748b] mt-1">
              Silakan masuk menggunakan kredensial akun dummy yang telah disediakan.
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3.5 text-xs flex items-center gap-2"
            >
              <WarningCircle size={16} weight="fill" className="shrink-0 text-red-600" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successUser && (
            <div
              role="status"
              className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 text-xs flex items-center gap-2"
            >
              <CheckCircle size={16} weight="fill" className="shrink-0 text-emerald-600" aria-hidden="true" />
              <span>
                Login berhasil sebagai <strong>{successUser.name}</strong>. Mengalihkan...
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 text-xs">
            <div>
              <label htmlFor="login-identity" className="block font-semibold text-[#0f2342] mb-1.5">
                Username atau Nomor WhatsApp
              </label>
              <input
                id="login-identity"
                type="text"
                {...register('identity')}
                placeholder="admin / kurir / member"
                className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 transition ${
                  errors.identity
                    ? 'border-red-400 focus:border-red-500 focus-visible:ring-red-500/25'
                    : 'border-[#cbd5e1] focus:border-[#2562eb] focus-visible:ring-[#2562eb]/30'
                }`}
              />
              {errors.identity && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.identity.message}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="login-password" className="font-semibold text-[#0f2342]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-[#2562eb] hover:underline inline-flex items-center gap-1 rounded px-1.5 py-0.5 whitespace-nowrap cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
                >
                  {showPassword ? (
                    <>
                      <EyeSlash size={14} weight="bold" aria-hidden="true" />
                      <span>Sembunyikan</span>
                    </>
                  ) : (
                    <>
                      <Eye size={14} weight="bold" aria-hidden="true" />
                      <span>Tampilkan</span>
                    </>
                  )}
                </button>
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Masukkan kata sandi"
                className={`w-full bg-[#f8fafc] border rounded-[10px] px-3.5 py-2.5 text-sm text-[#0f2342] placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 transition ${
                  errors.password
                    ? 'border-red-400 focus:border-red-500 focus-visible:ring-red-500/25'
                    : 'border-[#cbd5e1] focus:border-[#2562eb] focus-visible:ring-[#2562eb]/30'
                }`}
              />
              {errors.password && (
                <p className="text-[11px] text-red-600 mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 text-[11px] text-[#64748b]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded accent-[#2562eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
              <span className="text-slate-500 tabular-nums">
                Password default: <code className="bg-slate-100 px-1 py-0.5 rounded text-[#0f2342]">*123</code>
              </span>
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-sm h-11 rounded-[10px] transition shadow-[0_1px_3px_rgba(15,35,66,0.06)] inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
            >
              <SignIn size={16} weight="bold" aria-hidden="true" />
              <span>Masuk Sekarang</span>
            </button>
          </form>

          <div className="border-t border-[#e2e8f0] pt-4 text-center">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('PELANGGAN_TAMU')}
              className="text-xs font-semibold text-[#64748b] hover:text-[#0f2342] transition rounded-md px-2 py-1 whitespace-nowrap cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
            >
              Atau masuk sebagai <strong className="text-blue-600 underline">Pelanggan Tamu (Tanpa Login)</strong>
            </button>
          </div>
        </div>

        {/* Right Side: Demo Credentials Info Card */}
        <div className="w-full max-w-md flex flex-col gap-4">
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-[16px] p-6 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex size-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-[#2562eb]" />
              </span>
              <h2 className="font-bold text-sm text-[#0f2342]">Kredensial Akun Dummy</h2>
            </div>
            <p className="text-xs text-[#64748b] mb-4">
              Pilih salah satu akun di bawah untuk mengisi form login secara otomatis atau login dengan 1-klik:
            </p>

            <div className="space-y-3">
              {DUMMY_ACCOUNTS.map((acc) => (
                <div
                  key={acc.username}
                  className="bg-white border border-blue-100 rounded-xl p-3.5 flex flex-col gap-2 hover:border-blue-300 shadow-[0_1px_3px_rgba(15,35,66,0.06)] transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0f2342]">{acc.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase whitespace-nowrap ${
                        acc.role === 'ADMIN'
                          ? 'bg-slate-800 text-white'
                          : acc.role === 'KURIR'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {acc.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono tabular-nums bg-[#f8fafc] px-2.5 py-1.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500">user:</span>{' '}
                      <strong className="text-slate-800">{acc.username}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">pass:</span>{' '}
                      <strong className="text-slate-800">{acc.password}</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#64748b] leading-tight">{acc.description}</p>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin(acc.role)}
                    className="mt-1 w-full bg-blue-50 hover:bg-blue-100 text-[#2562eb] font-bold text-xs py-1.5 px-3 rounded-lg border border-blue-200/60 transition inline-flex items-center justify-center gap-1.5 whitespace-nowrap shadow-[0_1px_3px_rgba(15,35,66,0.06)] cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
                  >
                    <Lightning size={14} weight="fill" aria-hidden="true" />
                    <span>Login Cepat sebagai {acc.roleLabel}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-4 border-t border-[#e2e8f0] text-center text-xs text-[#64748b]">
        © 2026 Iqbal Laundry · Layanan Laundry Antar-Jemput Profesional
      </footer>
    </div>
  );
}
