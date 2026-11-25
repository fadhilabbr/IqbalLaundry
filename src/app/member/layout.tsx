import React from 'react';
import PortalShell from '@/components/layout/PortalShell';
import MemberSidebar from '@/components/navigation/MemberSidebar';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell sidebar={<MemberSidebar />}>{children}</PortalShell>;
}
