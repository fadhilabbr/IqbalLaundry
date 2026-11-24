export type Role = 'PELANGGAN_TAMU' | 'MEMBER' | 'KURIR' | 'ADMIN';

export type MemberTab = 'BERANDA' | 'RIWAYAT' | 'VOUCHER' | 'PROFIL' | 'LOGIN' | 'DAFTAR';
export type KurirTab = 'JADWAL' | 'RUTE' | 'TUGAS' | 'PROFIL';
export type AdminTab = 'DASHBOARD' | 'ORDER_MASUK' | 'LAYANAN' | 'ONGKIR' | 'LAPORAN';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ServiceUnit = 'kg' | 'm²' | 'buah';

export interface Service {
  id: string;
  name: string;
  price: number;
  unit: ServiceUnit;
  description?: string;
  popular?: boolean;
}

export type OrderStatus =
  | 'MENUNGGU_PEMBAYARAN'
  | 'DITERIMA'
  | 'DICUCI'
  | 'DISETRIKA'
  | 'SIAP_DIKIRIM'
  | 'SELESAI'
  | 'GAGAL';

export type PaymentMethod = 'QRIS' | 'TRANSFER' | 'COD';

export interface OrderStep {
  label: string;
  time: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  pricePerUnit: number;
  weight: number;
  unit: ServiceUnit;
  notes?: string;
  address: string;
  landmark?: string;
  serviceTotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'BELUM_BAYAR' | 'SUDAH_BAYAR' | 'GAGAL';
  paymentProofUrl?: string;
  createdAt: string;
  estimatedFinish: string;
  steps: OrderStep[];
}

export interface CourierTask {
  id: string;
  time: string;
  type: 'Pickup' | 'Delivery';
  orderId: string;
  customerName: string;
  address: string;
  phone: string;
  serviceName: string;
  weight: number;
  distance: string;
  eta: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Voucher {
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrder: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  zoneArea: string;
  fee: number;
}

export interface ReportStats {
  ordersCount: number;
  revenue: number;
  completedCount: number;
  averageOrderValue: number;
}
