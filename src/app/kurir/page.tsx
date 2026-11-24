import type { Metadata } from 'next';
import PortalShell from '@/components/layout/PortalShell';
import KurirSidebar from '@/components/navigation/KurirSidebar';
import KurirPortal from '@/components/kurir/KurirPortal';

export const metadata: Metadata = {
  title: 'Portal Kurir',
  description: 'Jadwal penjemputan, rute pengantaran, dan validasi tugas kurir Iqbal Laundry.',
};

export default function KurirPage() {
  return (
    <PortalShell sidebar={<KurirSidebar />}>
      <KurirPortal />
    </PortalShell>
  );
}
