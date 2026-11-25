'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowClockwise, ArrowLeft, WarningCircle } from '@phosphor-icons/react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] bg-[#f5f8fc] flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
        <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
          <WarningCircle size={24} weight="bold" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0f2342] mt-4">
          Terjadi Kesalahan Sistem
        </h1>
        <p className="text-sm text-[#475569] mt-2 leading-relaxed">
          Sistem mengalami kendala sementara saat memuat halaman. Silakan coba muat ulang.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-[#2562eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm h-11 px-5 rounded-lg transition duration-150 ease-out shadow-[0_1px_2px_rgba(15,35,66,0.08)] whitespace-nowrap cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
          >
            <ArrowClockwise size={16} weight="bold" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] text-[#0f2342] font-semibold text-sm h-11 px-5 rounded-lg transition duration-150 ease-out whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
          >
            <ArrowLeft size={16} weight="bold" aria-hidden="true" />
            <span>Ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
