'use client';

import React from 'react';
import { Check, Info, WarningCircle, X } from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-4 right-0 md:right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 md:px-0"
    >
      {toasts.map((toast) => {
        const badgeStyles =
          toast.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-900'
            : toast.type === 'info'
            ? 'bg-blue-50 border-blue-200 text-[#0f2342]'
            : 'bg-emerald-50 border-emerald-200 text-emerald-950';

        const iconWrapStyles =
          toast.type === 'error'
            ? 'bg-red-600 text-white'
            : toast.type === 'info'
            ? 'bg-[#2562eb] text-white'
            : 'bg-emerald-600 text-white';

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-[0_6px_20px_rgba(15,35,66,0.12)] transition duration-150 ease-out ${badgeStyles}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${iconWrapStyles}`}
                aria-hidden="true"
              >
                {toast.type === 'error' ? (
                  <WarningCircle size={14} weight="bold" />
                ) : toast.type === 'info' ? (
                  <Info size={14} weight="bold" />
                ) : (
                  <Check size={14} weight="bold" />
                )}
              </span>
              <p className="text-xs font-medium leading-snug break-words">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Tutup notifikasi"
              className="p-1.5 -mr-1 rounded-lg text-[#64748b] hover:text-[#0f2342] hover:bg-black/5 transition duration-150 ease-out shrink-0 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
            >
              <X size={14} weight="bold" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
