import type { Metadata } from 'next';
import KurirPortal from '@/components/kurir/KurirPortal';

export const metadata: Metadata = {
  title: 'Portal Kurir',
  description: 'Jadwal penjemputan, rute pengantaran, dan validasi tugas kurir Iqbal Laundry.',
};

export default function KurirPage() {
  return <KurirPortal />;
}
