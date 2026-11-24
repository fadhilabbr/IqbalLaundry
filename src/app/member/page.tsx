import type { Metadata } from 'next';
import PortalShell from '@/components/layout/PortalShell';
import MemberSidebar from '@/components/navigation/MemberSidebar';
import MemberPortal from '@/components/member/MemberPortal';

export const metadata: Metadata = {
  title: 'Portal Member',
  description: 'Kelola riwayat transaksi, voucher diskon, dan poin loyalitas member Iqbal Laundry.',
};

export default function MemberPage() {
  return (
    <PortalShell sidebar={<MemberSidebar />}>
      <MemberPortal />
    </PortalShell>
  );
}
