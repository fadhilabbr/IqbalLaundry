'use client';

import React, { Suspense } from 'react';
import { AppProvider } from '@/context/AppContext';
import AuthNoticeToast from '@/components/providers/AuthNoticeToast';
import ToastContainer from '@/components/ui/ToastContainer';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <Suspense fallback={null}>
        <AuthNoticeToast />
      </Suspense>
      {children}
      <ToastContainer />
    </AppProvider>
  );
}
