import { Role } from '@/types';

export interface UserAccount {
  username: string;
  phone?: string;
  name: string;
  password: string;
  role: Role;
  roleLabel: string;
  description: string;
}

export const DUMMY_ACCOUNTS: UserAccount[] = [
  {
    username: 'admin',
    phone: '081200000001',
    name: 'Iqbal Maulana (Superadmin)',
    password: 'admin123',
    role: 'ADMIN',
    roleLabel: 'Admin Panel',
    description: 'Akses penuh ke dashboard, order masuk, katalog layanan & harga, ongkos kirim, dan laporan.',
  },
  {
    username: 'kurir',
    phone: '081200000002',
    name: 'Kurniawan R. (Kurir Lapangan)',
    password: 'kurir123',
    role: 'KURIR',
    roleLabel: 'Kurir Operasional',
    description: 'Akses jadwal tugas hari ini, rute penjemputan/pengantaran, dan validasi timbangan digital.',
  },
  {
    username: 'member',
    phone: '081234567890',
    name: 'Budi Santoso (Member Gold)',
    password: 'member123',
    role: 'MEMBER',
    roleLabel: 'Member Terdaftar',
    description: 'Akses riwayat pesanan, invoice transaksi, voucher diskon 10%, dan poin loyalitas.',
  },
];

export function findUserByCredentials(identity: string, password: string): UserAccount | null {
  const cleanId = identity.trim().toLowerCase();
  const user = DUMMY_ACCOUNTS.find(
    (u) =>
      (u.username.toLowerCase() === cleanId || u.phone === cleanId) &&
      u.password === password
  );
  return user || null;
}
