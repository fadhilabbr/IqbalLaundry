'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignIn, SignOut } from '@phosphor-icons/react';
import { useApp } from '@/context/AppContext';

export default function SidebarAuthFooter() {
  const router = useRouter();
  const { currentUser, logout } = useApp();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  return (
    <div className="hidden md:block pt-3 border-t border-[#e2e8f0]">
      {currentUser ? (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#eff6ff] text-[#2562eb] font-bold text-xs flex items-center justify-center shrink-0 ring-1 ring-[#2562eb]/20">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#0f2342] truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-[#64748b] truncate leading-tight mt-0.5">
                {currentUser.roleLabel || currentUser.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="w-full min-h-[38px] px-3 rounded-lg border border-[#e2e8f0] bg-white hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-[#475569] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition duration-150 ease-out cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <SignOut size={15} weight="bold" aria-hidden="true" />
            <span>{isLoggingOut ? 'Keluar...' : 'Keluar'}</span>
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="w-full bg-[#2562eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs min-h-[40px] px-3.5 rounded-lg inline-flex items-center justify-center gap-2 transition duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30 whitespace-nowrap"
        >
          <SignIn size={16} weight="bold" aria-hidden="true" />
          <span>Masuk</span>
        </Link>
      )}
    </div>
  );
}
