'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const badgeStyles =
          toast.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-900'
            : toast.type === 'info'
            ? 'bg-blue-50 border-blue-200 text-[#0f2342]'
            : 'bg-emerald-50 border-emerald-200 text-emerald-950';

        const dotStyles =
          toast.type === 'error'
            ? 'bg-red-600 text-white'
            : toast.type === 'info'
            ? 'bg-[#2562eb] text-white'
            : 'bg-emerald-600 text-white';

        const symbol = toast.type === 'error' ? '!' : toast.type === 'info' ? 'i' : '✓';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all ${badgeStyles}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`size-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${dotStyles}`}
              >
                {symbol}
              </span>
              <p className="text-xs font-medium leading-snug break-words">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Tutup notifikasi"
              className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1 shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
