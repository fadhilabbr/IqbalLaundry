'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignIn, SignOut } from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';

export default function RoleSwitcher() {
  const router = useRouter();
  const { currentUser, logout } = useApp();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(15,35,66,0.06)] transition-all">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="group flex items-center gap-2.5 shrink-0 rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
        >
          <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-[0_1px_3px_rgba(15,35,66,0.06)] text-sm font-black group-hover:scale-105 transition-transform">
            ✦
          </span>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-[#0f2342] group-hover:text-blue-600 transition-colors">
              Iqbal Laundry
            </span>
            <span className="text-[10px] text-slate-500 font-medium -mt-0.5 hidden sm:inline">
              Antar-Jemput Profesional
            </span>
          </div>
        </Link>

        {/* Auth Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0 ring-1 ring-blue-500/20">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#0f2342] truncate max-w-[100px] sm:max-w-[140px] leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium leading-none">
                    {currentUser.roleLabel || currentUser.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-slate-600 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 transition-all font-medium inline-flex items-center gap-1.5 whitespace-nowrap shadow-[0_1px_3px_rgba(15,35,66,0.06)] cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
                title="Keluar dari akun"
              >
                <SignOut size={15} weight="bold" aria-hidden="true" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-200">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs bg-[#2562eb] hover:bg-blue-700 text-white font-semibold px-3.5 py-1.5 rounded-lg shadow-[0_1px_3px_rgba(15,35,66,0.06)] hover:shadow-[0_4px_12px_rgba(37,98,235,0.2)] transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
              >
                <SignIn size={15} weight="bold" aria-hidden="true" />
                <span>Masuk</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
