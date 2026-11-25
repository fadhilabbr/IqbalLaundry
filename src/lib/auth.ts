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

export type PublicUserAccount = Omit<UserAccount, 'password'>;

export function toPublicUser(user: UserAccount): PublicUserAccount {
  return {
    username: user.username,
    phone: user.phone,
    name: user.name,
    role: user.role,
    roleLabel: user.roleLabel,
    description: user.description,
  };
}

export function getRouteForRole(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'KURIR':
      return '/kurir';
    case 'MEMBER':
      return '/member';
    default:
      return '/dashboard';
  }
}

export function canRoleAccessPath(role: Role, pathname: string): boolean {
  if (
    !pathname ||
    !pathname.startsWith('/') ||
    pathname.startsWith('//') ||
    pathname.includes('\\')
  ) {
    return false;
  }

  const cleanPath = pathname.split(/[?#]/)[0];

  if (cleanPath === '/admin' || cleanPath.startsWith('/admin/')) {
    return role === 'ADMIN';
  }
  if (cleanPath === '/kurir' || cleanPath.startsWith('/kurir/')) {
    return role === 'KURIR';
  }
  if (cleanPath === '/member' || cleanPath.startsWith('/member/')) {
    return role === 'MEMBER';
  }
  if (cleanPath === '/dashboard' || cleanPath.startsWith('/dashboard/')) {
    return true;
  }

  return false;
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
