import React from 'react';
import PortalShell from '@/components/layout/PortalShell';
import AdminSidebar from '@/components/navigation/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell sidebar={<AdminSidebar />}>{children}</PortalShell>;
}
