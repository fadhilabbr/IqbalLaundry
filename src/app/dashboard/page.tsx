import type { Metadata } from 'next';
import PortalShell from '@/components/layout/PortalShell';
import GuestSidebar from '@/components/navigation/GuestSidebar';
import PelangganTamuFlow from '@/components/pelanggan/PelangganTamuFlow';

export const metadata: Metadata = {
  title: 'Dashboard Pelanggan',
  description: 'Pesan layanan laundry antar-jemput dan lacak status cucian Anda.',
};

export default function DashboardPage() {
  return (
    <PortalShell sidebar={<GuestSidebar />}>
      <PelangganTamuFlow />
    </PortalShell>
  );
}
