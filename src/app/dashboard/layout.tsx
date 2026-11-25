import React from 'react';
import PortalShell from '@/components/layout/PortalShell';
import GuestSidebar from '@/components/navigation/GuestSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell sidebar={<GuestSidebar />}>{children}</PortalShell>;
}
