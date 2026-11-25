'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  CircleNotch,
  Eye,
  EyeSlash,
  Lightning,
  SignIn,
  WarningCircle,
} from '@phosphor-icons/react';
import BrandMark from '@/components/ui/BrandMark';
import { useApp } from '@/context/AppContext';
import {
  DUMMY_ACCOUNTS,
  PublicUserAccount,
  canRoleAccessPath,
  getRouteForRole,
} from '@/lib/auth';
import { loginSchema, LoginFormValues } from '@/lib/validations';
import { Role } from '@/types';

function resolveRedirectTarget(userRole: Role): string {
  if (typeof window !== 'undefined') {
    const from = new URLSearchParams(window.location.search).get('from');
    if (from && canRoleAccessPath(userRole, from)) {
      return from;
    }
  }
  return getRouteForRole(userRole);
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useApp();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successUser, setSuccessUser] = useState<PublicUserAccount | null>(null);
  const [pendingAction, setPendingAction] = useState<Role | 'FORM' | null>(null);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!redirectTarget) return;
    const timer = setTimeout(() => {
      router.push(redirectTarget);
      router.refresh();
    }, 450);
    return () => clearTimeout(timer);
  }, [redirectTarget, router]);

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

  const isBusy = pendingAction !== null;

  const onSubmit = async (data: LoginFormValues) => {
    if (isBusy) return;
    setErrorMsg(null);
    setPendingAction('FORM');

    const res = await login(data.identity, data.password, rememberMe);
    if (!res.success || !res.user) {
      setErrorMsg(res.error || 'Username atau password salah.');
      setPendingAction(null);
      return;
    }

    setSuccessUser(res.user);
    setRedirectTarget(resolveRedirectTarget(res.user.role));
  };

  const handleQuickDemoLogin = async (targetRole: Role) => {
    if (isBusy) return;
    setErrorMsg(null);
    setPendingAction(targetRole);

    if (targetRole !== 'PELANGGAN_TAMU') {
      const matched = DUMMY_ACCOUNTS.find((a) => a.role === targetRole);
      if (matched) {
        setValue('identity', matched.username, { shouldValidate: true });
        setValue('password', matched.password, { shouldValidate: true });
      }
    }

    const res = await loginAsDemo(targetRole);
    if (!res.success) {
      setErrorMsg(res.error || 'Gagal masuk dengan akun demo.');
      setPendingAction(null);
      return;
    }

    if (targetRole === 'PELANGGAN_TAMU') {
      router.push('/dashboard');
      router.refresh();
      return;
    }

    if (res.user) {
      setSuccessUser(res.user);
      setRedirectTarget(resolveRedirectTarget(res.user.role));
    } else {
      router.push(getRouteForRole(targetRole));
      router.refresh();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f5f8fc] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Navbar */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between gap-4 pb-4 sm:pb-6 border-b border-[#e2e8f0]">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2.5 rounded-lg transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
        >
          <BrandMark />
          <span className="font-bold text-base sm:text-lg text-[#0f2342] group-hover:text-[#2562eb] transition-colors duration-150 ease-out tracking-tight whitespace-nowrap">
            Iqbal Laundry
          </span>
        </Link>

        <Link
          href="/dashboard"
          className="min-h-[36px] text-xs font-semibold text-[#475569] hover:text-[#0f2342] hover:bg-white border border-transparent hover:border-[#e2e8f0] inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition duration-150 ease-out whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
        >
          <ArrowLeft size={14} weight="bold" aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Side: Login Form */}
        <section
          aria-labelledby="login-heading"
          className="w-full bg-white border border-[#dce5f0] rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(15,35,66,0.06)] flex flex-col gap-6"
        >
          <div>
            <h1
              id="login-heading"
              className="text-2xl font-bold tracking-tight text-[#0f2342]"
            >
              Masuk ke Portal
            </h1>
            <p className="text-sm text-[#475569] mt-1 leading-relaxed">
              Gunakan akun terdaftar atau pilih akses cepat demo di samping.
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-3.5 text-xs font-medium flex items-center gap-2.5"
            >
              <WarningCircle size={18} weight="fill" className="shrink-0 text-red-600" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successUser && (
            <div
              role="status"
              className="bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl p-3.5 text-xs font-medium flex items-center gap-2.5"
            >
              <CheckCircle size={18} weight="fill" className="shrink-0 text-emerald-600" aria-hidden="true" />
              <span>
                Login berhasil sebagai <strong>{successUser.name}</strong>. Mengalihkan...
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="login-identity"
                className="block text-xs font-semibold text-[#0f2342] mb-1.5"
              >
                Username atau Nomor WhatsApp
              </label>
              <input
                id="login-identity"
                type="text"
                autoComplete="username"
                disabled={isBusy}
                aria-invalid={Boolean(errors.identity)}
                aria-describedby={errors.identity ? 'login-identity-error' : undefined}
                {...register('identity')}
                placeholder="admin / kurir / member"
                className={`w-full h-11 bg-[#f8fafc] border rounded-lg px-3.5 text-sm text-[#0f2342] placeholder:text-[#94a3b8] transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.identity
                    ? 'border-red-400 focus:border-red-500 focus-visible:ring-red-500/25'
                    : 'border-[#cbd5e1] focus:border-[#2562eb] focus-visible:ring-[#2562eb]/30'
                }`}
              />
              {errors.identity && (
                <p id="login-identity-error" className="text-xs text-red-600 mt-1.5 font-medium">
                  {errors.identity.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="login-password" className="text-xs font-semibold text-[#0f2342]">
                  Password
                </label>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-medium text-[#2562eb] hover:text-[#1d4ed8] hover:underline inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 whitespace-nowrap cursor-pointer transition duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 disabled:opacity-60 disabled:cursor-not-allowed"
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
                autoComplete="current-password"
                disabled={isBusy}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
                {...register('password')}
                placeholder="Masukkan kata sandi"
                className={`w-full h-11 bg-[#f8fafc] border rounded-lg px-3.5 text-sm text-[#0f2342] placeholder:text-[#94a3b8] transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  errors.password
                    ? 'border-red-400 focus:border-red-500 focus-visible:ring-red-500/25'
                    : 'border-[#cbd5e1] focus:border-[#2562eb] focus-visible:ring-[#2562eb]/30'
                }`}
              />
              {errors.password && (
                <p id="login-password-error" className="text-xs text-red-600 mt-1.5 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 text-xs text-[#475569]">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isBusy}
                  className="w-4 h-4 rounded border-[#cbd5e1] accent-[#2562eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
                />
                <span>Ingat sesi ini</span>
              </label>
              <span className="text-[#64748b] tabular-nums">
                Sandi demo: <code className="bg-[#f8fafc] border border-[#e2e8f0] px-1.5 py-0.5 rounded font-mono text-[#0f2342]">*123</code>
              </span>
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="mt-2 w-full bg-[#2562eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm h-11 rounded-lg transition duration-150 ease-out shadow-[0_1px_2px_rgba(15,35,66,0.08)] inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pendingAction === 'FORM' ? (
                <>
                  <CircleNotch size={16} weight="bold" className="animate-spin" aria-hidden="true" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <SignIn size={16} weight="bold" aria-hidden="true" />
                  <span>Masuk Sekarang</span>
                </>
              )}
            </button>
          </form>

          <div className="border-t border-[#e2e8f0] pt-4">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => handleQuickDemoLogin('PELANGGAN_TAMU')}
              className="w-full min-h-[44px] bg-[#f8fafc] hover:bg-[#eff6ff] border border-[#e2e8f0] hover:border-[#2562eb]/40 text-xs font-semibold text-[#0f2342] hover:text-[#2562eb] rounded-lg px-4 py-2.5 inline-flex items-center justify-center gap-2 transition duration-150 ease-out cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pendingAction === 'PELANGGAN_TAMU' ? (
                <>
                  <CircleNotch size={15} weight="bold" className="animate-spin" aria-hidden="true" />
                  <span>Membuka Portal Pelanggan...</span>
                </>
              ) : (
                <>
                  <span>Masuk sebagai Pelanggan Tamu (Tanpa Login)</span>
                  <ArrowRight size={14} weight="bold" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Side: Quick-Demo Role Cards */}
        <section
          aria-labelledby="demo-heading"
          className="w-full bg-white border border-[#dce5f0] rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(15,35,66,0.06)] flex flex-col gap-5"
        >
          <div>
            <h2
              id="demo-heading"
              className="text-lg font-bold tracking-tight text-[#0f2342]"
            >
              Akses Cepat Demo
            </h2>
            <p className="text-sm text-[#475569] mt-1 leading-relaxed">
              Pilih peran untuk mengisi kredensial otomatis dan langsung masuk ke portal terkait.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {DUMMY_ACCOUNTS.map((acc) => {
              const isRoleLoading = pendingAction === acc.role;
              const roleBadgeClass =
                acc.role === 'ADMIN'
                  ? 'bg-[#0f2342] text-white'
                  : acc.role === 'KURIR'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-blue-50 text-[#2562eb] border border-blue-200';

              return (
                <div
                  key={acc.username}
                  className="bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#2562eb]/40 rounded-xl p-4 flex flex-col gap-3 transition duration-150 ease-out"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#0f2342]">{acc.name}</span>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${roleBadgeClass}`}
                    >
                      {acc.roleLabel}
                    </span>
                  </div>

                  <p className="text-xs text-[#475569] leading-relaxed">{acc.description}</p>

                  <div className="flex items-center justify-between gap-3 text-xs font-mono tabular-nums bg-white px-3 py-2 rounded-lg border border-[#e2e8f0] text-[#0f2342]">
                    <div>
                      <span className="text-[#64748b]">user:</span>{' '}
                      <strong className="font-semibold">{acc.username}</strong>
                    </div>
                    <div>
                      <span className="text-[#64748b]">pass:</span>{' '}
                      <strong className="font-semibold">{acc.password}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleQuickDemoLogin(acc.role)}
                    className="w-full min-h-[40px] bg-white hover:bg-[#eff6ff] text-[#2562eb] font-semibold text-xs py-2 px-3 rounded-lg border border-[#cbd5e1] hover:border-[#2562eb] transition duration-150 ease-out inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isRoleLoading ? (
                      <>
                        <CircleNotch size={14} weight="bold" className="animate-spin" aria-hidden="true" />
                        <span>Mengalihkan...</span>
                      </>
                    ) : (
                      <>
                        <Lightning size={14} weight="fill" aria-hidden="true" />
                        <span>Login Cepat sebagai {acc.roleLabel}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-4 border-t border-[#e2e8f0] text-center text-xs text-[#64748b] tabular-nums">
        © 2026 Iqbal Laundry · Layanan Laundry Antar-Jemput Profesional
      </footer>
    </div>
  );
}
