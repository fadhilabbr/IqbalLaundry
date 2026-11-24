import type { Metadata } from 'next';
import PortalShell from '@/components/layout/PortalShell';
import AdminSidebar from '@/components/navigation/AdminSidebar';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Kelola order masuk, katalog layanan, ongkos kirim, dan laporan usaha Iqbal Laundry.',
};

export default function AdminPage() {
  return (
    <PortalShell sidebar={<AdminSidebar />}>
      <AdminDashboard />
    </PortalShell>
  );
}
