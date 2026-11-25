import type { Metadata } from 'next';
import PelangganTamuFlow from '@/components/pelanggan/PelangganTamuFlow';

export const metadata: Metadata = {
  title: 'Dashboard Pelanggan',
  description: 'Pesan layanan laundry antar-jemput dan lacak status cucian Anda.',
};

export default function DashboardPage() {
  return <PelangganTamuFlow />;
}
