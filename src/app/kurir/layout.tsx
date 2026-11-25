import React from 'react';
import PortalShell from '@/components/layout/PortalShell';
import KurirSidebar from '@/components/navigation/KurirSidebar';

export default function KurirLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell sidebar={<KurirSidebar />}>{children}</PortalShell>;
}
