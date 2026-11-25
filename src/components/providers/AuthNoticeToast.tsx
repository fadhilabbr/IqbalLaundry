'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function AuthNoticeToast() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast } = useApp();
  const lastHandledKeyRef = useRef<string | null>(null);

  const authNotice = searchParams.get('auth_notice');
  const denied = searchParams.get('denied');
  const from = searchParams.get('from');
  const rawQuery = searchParams.toString();

  useEffect(() => {
    if (!authNotice) {
      lastHandledKeyRef.current = null;
      return;
    }

    const noticeKey = `${pathname}|${authNotice}|${denied ?? ''}|${from ?? ''}`;
    if (lastHandledKeyRef.current === noticeKey) {
      return;
    }

    if (authNotice === 'forbidden') {
      lastHandledKeyRef.current = noticeKey;
      showToast(
        `Akses ditolak: akun Anda tidak memiliki izin membuka halaman ${denied || 'tersebut'}.`,
        'error'
      );

      const nextParams = new URLSearchParams(rawQuery);
      nextParams.delete('auth_notice');
      nextParams.delete('denied');
      const nextSearch = nextParams.toString();
      const nextUrl = `${pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
      window.history.replaceState(window.history.state, '', nextUrl);
      return;
    }

    if (authNotice === 'login_required') {
      lastHandledKeyRef.current = noticeKey;
      showToast(
        `Silakan masuk terlebih dahulu untuk mengakses halaman ${from || 'tersebut'}.`,
        'info'
      );

      const nextParams = new URLSearchParams(rawQuery);
      nextParams.delete('auth_notice');
      const nextSearch = nextParams.toString();
      const nextUrl = `${pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
      window.history.replaceState(window.history.state, '', nextUrl);
    }
  }, [pathname, authNotice, denied, from, rawQuery, showToast]);

  return null;
}
