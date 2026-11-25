'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Role,
  MemberTab,
  KurirTab,
  AdminTab,
  ToastMessage,
  Service,
  Order,
  OrderStatus,
  CourierTask,
  Voucher,
  DeliveryZone,
  ReportStats,
} from '@/types';
import {
  initialServices,
  initialOrders,
  initialCourierTasks,
  initialVouchers,
  initialDeliveryZones,
  initialReportStats,
} from '@/lib/data';
import { PublicUserAccount, DUMMY_ACCOUNTS } from '@/lib/auth';

const STORAGE_KEY = 'iqbal_laundry_v1';

interface PersistedState {
  services: Service[];
  orders: Order[];
  courierTasks: CourierTask[];
  deliveryZones: DeliveryZone[];
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  user?: PublicUserAccount;
}

interface SessionResponse {
  authenticated: boolean;
  role: Role;
  user: PublicUserAccount | null;
}

interface LoginResponse {
  success: boolean;
  error?: string;
  user?: PublicUserAccount;
}

function sanitizePublicUser(raw: unknown): PublicUserAccount | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Partial<PublicUserAccount>;
  if (
    typeof candidate.username !== 'string' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.role !== 'string' ||
    typeof candidate.roleLabel !== 'string' ||
    typeof candidate.description !== 'string'
  ) {
    return null;
  }
  return {
    username: candidate.username,
    phone: typeof candidate.phone === 'string' ? candidate.phone : undefined,
    name: candidate.name,
    role: candidate.role,
    roleLabel: candidate.roleLabel,
    description: candidate.description,
  };
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;

  // Auth User
  currentUser: PublicUserAccount | null;
  authReady: boolean;
  login: (identity: string, password: string, rememberMe?: boolean) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  loginAsDemo: (targetRole: Role) => Promise<AuthActionResult>;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;

  // Services
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, updated: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Orders
  orders: Order[];
  activeOrderId: string;
  setActiveOrderId: (id: string) => void;
  createOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  confirmPayment: (orderId: string, method?: Order['paymentMethod'], proofUrl?: string) => void;

  // Courier Tasks
  courierTasks: CourierTask[];
  activeTaskId: string;
  setActiveTaskId: (id: string) => void;
  updateTaskStatus: (taskId: string, status: CourierTask['status'], realWeight?: number) => void;

  // Vouchers & Zones
  vouchers: Voucher[];
  deliveryZones: DeliveryZone[];
  updateZoneFee: (id: string, fee: number) => void;

  // Reports
  reportStats: ReportStats;

  // Navigation state controllers
  guestStep: number;
  setGuestStep: (step: number) => void;
  guestSelectedService: Service | null;
  setGuestSelectedService: (s: Service | null) => void;

  memberTab: MemberTab;
  setMemberTab: (tab: MemberTab) => void;
  selectedHistoryOrder: Order | null;
  setSelectedHistoryOrder: (order: Order | null) => void;

  kurirTab: KurirTab;
  setKurirTab: (tab: KurirTab) => void;

  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('PELANGGAN_TAMU');
  const [currentUser, setCurrentUser] = useState<PublicUserAccount | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeOrderId, setActiveOrderId] = useState<string>('IL-1024');
  const [courierTasks, setCourierTasks] = useState<CourierTask[]>(initialCourierTasks);
  const [activeTaskId, setActiveTaskId] = useState<string>('tsk-1');
  const [vouchers] = useState<Voucher[]>(initialVouchers);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(initialDeliveryZones);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const isHydratedRef = useRef(false);
  const sessionRequestVersionRef = useRef(0);

  // Portal navigation states
  const [guestStep, setGuestStep] = useState<number>(1);
  const [guestSelectedService, setGuestSelectedService] = useState<Service | null>(initialServices[1]);
  const [memberTab, setMemberTab] = useState<MemberTab>('BERANDA');
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<Order | null>(initialOrders[0]);
  const [kurirTab, setKurirTab] = useState<KurirTab>('JADWAL');
  const [adminTab, setAdminTab] = useState<AdminTab>('ORDER_MASUK');

  // Hydrate domain state (never auth/role/password) from localStorage on client mount
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PersistedState> & {
            role?: unknown;
            currentUser?: unknown;
          };
          if (Array.isArray(parsed.services) && parsed.services.length > 0) {
            setServices(parsed.services);
          }
          if (Array.isArray(parsed.orders) && parsed.orders.length > 0) {
            setOrders(parsed.orders);
            setActiveOrderId(parsed.orders[0].id);
            setSelectedHistoryOrder(parsed.orders[0]);
          }
          if (Array.isArray(parsed.courierTasks) && parsed.courierTasks.length > 0) {
            setCourierTasks(parsed.courierTasks);
          }
          if (Array.isArray(parsed.deliveryZones) && parsed.deliveryZones.length > 0) {
            setDeliveryZones(parsed.deliveryZones);
          }
          // Strip legacy auth fields if present in existing localStorage data
          if ('role' in parsed || 'currentUser' in parsed) {
            const sanitized: PersistedState = {
              services:
                Array.isArray(parsed.services) && parsed.services.length > 0
                  ? parsed.services
                  : initialServices,
              orders:
                Array.isArray(parsed.orders) && parsed.orders.length > 0
                  ? parsed.orders
                  : initialOrders,
              courierTasks:
                Array.isArray(parsed.courierTasks) && parsed.courierTasks.length > 0
                  ? parsed.courierTasks
                  : initialCourierTasks,
              deliveryZones:
                Array.isArray(parsed.deliveryZones) && parsed.deliveryZones.length > 0
                  ? parsed.deliveryZones
                  : initialDeliveryZones,
            };
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          }
        }
      } catch {
        // Ignore storage access or malformed JSON errors
      } finally {
        isHydratedRef.current = true;
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync authoritative auth session from HttpOnly cookie via server API on mount
  useEffect(() => {
    let cancelled = false;
    const requestVersion = ++sessionRequestVersionRef.current;

    const syncSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin',
        });
        if (cancelled || sessionRequestVersionRef.current !== requestVersion) return;

        if (!response.ok) {
          setCurrentUser(null);
          setRole('PELANGGAN_TAMU');
          return;
        }

        const data = (await response.json()) as Partial<SessionResponse>;
        if (cancelled || sessionRequestVersionRef.current !== requestVersion) return;

        const safeUser = data.authenticated ? sanitizePublicUser(data.user) : null;
        if (safeUser) {
          setCurrentUser(safeUser);
          setRole(safeUser.role);
        } else {
          setCurrentUser(null);
          setRole('PELANGGAN_TAMU');
        }
      } catch {
        if (cancelled || sessionRequestVersionRef.current !== requestVersion) return;
        setCurrentUser(null);
        setRole('PELANGGAN_TAMU');
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    };

    void syncSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist key domain state changes to localStorage (auth stays server-side in HttpOnly cookie)
  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      const payload: PersistedState = {
        services,
        orders,
        courierTasks,
        deliveryZones,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota or private-mode errors
    }
  }, [services, orders, courierTasks, deliveryZones]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastMessage['type'] = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  // Compute live report metrics combining baseline historical totals with live order updates
  const reportStats = useMemo<ReportStats>(() => {
    const initialRevenue = initialOrders.reduce((acc, o) => acc + o.total, 0);
    const currentRevenue = orders.reduce((acc, o) => acc + o.total, 0);
    const initialCompleted = initialOrders.filter((o) => o.status === 'SELESAI').length;
    const currentCompleted = orders.filter((o) => o.status === 'SELESAI').length;

    const ordersCount = Math.max(1, initialReportStats.ordersCount + (orders.length - initialOrders.length));
    const revenue = Math.max(0, initialReportStats.revenue + (currentRevenue - initialRevenue));
    const completedCount = Math.max(0, initialReportStats.completedCount + (currentCompleted - initialCompleted));
    const averageOrderValue = Math.round(revenue / ordersCount);

    return {
      ordersCount,
      revenue,
      completedCount,
      averageOrderValue,
    };
  }, [orders]);

  // Login handler (sets signed HttpOnly session cookie via API)
  const login = useCallback(
    async (
      identity: string,
      password: string,
      rememberMe = true
    ): Promise<AuthActionResult> => {
      sessionRequestVersionRef.current += 1;
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          cache: 'no-store',
          body: JSON.stringify({ identity, password, rememberMe }),
        });

        let data: Partial<LoginResponse> | null = null;
        try {
          data = (await response.json()) as Partial<LoginResponse>;
        } catch {
          data = null;
        }

        const safeUser = data?.success ? sanitizePublicUser(data.user) : null;
        if (!response.ok || !safeUser) {
          return {
            success: false,
            error: data?.error || 'Username/nomor WhatsApp atau password salah.',
          };
        }

        setCurrentUser(safeUser);
        setRole(safeUser.role);
        setAuthReady(true);
        return { success: true, user: safeUser };
      } catch {
        return {
          success: false,
          error: 'Gagal menghubungi server autentikasi. Silakan coba lagi.',
        };
      }
    },
    []
  );

  // Logout handler (clears HttpOnly session cookie via API)
  const logout = useCallback(async (): Promise<void> => {
    sessionRequestVersionRef.current += 1;
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
      });
    } catch {
      // Always reset client auth state even if network hiccups
    } finally {
      setCurrentUser(null);
      setRole('PELANGGAN_TAMU');
      setGuestStep(1);
      setAuthReady(true);
      showToast('Anda telah keluar dari akun.', 'info');
    }
  }, [showToast]);

  // Quick Demo Login (creates real signed HttpOnly cookie via /api/auth/login or clears via /api/auth/logout)
  const loginAsDemo = useCallback(
    async (targetRole: Role): Promise<AuthActionResult> => {
      if (targetRole === 'PELANGGAN_TAMU') {
        sessionRequestVersionRef.current += 1;
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'same-origin',
            cache: 'no-store',
          });
        } catch {
          // Ignore network errors while switching to guest mode
        } finally {
          setCurrentUser(null);
          setRole('PELANGGAN_TAMU');
          setGuestStep(1);
          setAuthReady(true);
        }
        return { success: true };
      }

      const account = DUMMY_ACCOUNTS.find((a) => a.role === targetRole);
      if (!account) {
        return { success: false, error: 'Akun demo tidak ditemukan.' };
      }
      return login(account.username, account.password, true);
    },
    [login]
  );

  // Add Service
  const addService = (newService: Omit<Service, 'id'>) => {
    const id = `srv-${Date.now()}`;
    setServices((prev) => [...prev, { ...newService, id }]);
  };

  // Update Service
  const updateService = (id: string, updated: Partial<Service>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  // Delete Service
  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // Create Order
  const createOrder = (orderData: Partial<Order>): Order => {
    const newId = `IL-${Math.floor(1025 + Math.random() * 900)}`;
    const fullOrder: Order = {
      id: newId,
      customerName: orderData.customerName || 'Pelanggan Baru',
      phone: orderData.phone || '081234567890',
      serviceId: orderData.serviceId || 'srv-2',
      serviceName: orderData.serviceName || 'Cuci + setrika',
      pricePerUnit: orderData.pricePerUnit || 9000,
      weight: orderData.weight || 4,
      unit: orderData.unit || 'kg',
      notes: orderData.notes || '',
      address: orderData.address || 'Jl. Soekarno Hatta No. 45',
      landmark: orderData.landmark || '',
      serviceTotal: (orderData.pricePerUnit || 9000) * (orderData.weight || 4),
      deliveryFee: orderData.deliveryFee || 8000,
      discount: orderData.discount || 0,
      total:
        (orderData.pricePerUnit || 9000) * (orderData.weight || 4) +
        (orderData.deliveryFee || 8000) -
        (orderData.discount || 0),
      status: 'MENUNGGU_PEMBAYARAN',
      paymentMethod: orderData.paymentMethod || 'QRIS',
      paymentStatus: 'BELUM_BAYAR',
      createdAt: 'Baru saja',
      estimatedFinish: '2 hari lagi',
      steps: [
        { label: 'Dibuat', time: 'Baru saja', completed: true, current: false },
        { label: 'Diterima', time: 'Menunggu pickup', completed: false, current: true },
        { label: 'Dicuci', time: '-', completed: false, current: false },
        { label: 'Selesai', time: '-', completed: false, current: false },
        { label: 'Siap dikirim', time: '-', completed: false, current: false },
      ],
    };

    setOrders((prev) => [fullOrder, ...prev]);
    setActiveOrderId(newId);

    const newTask: CourierTask = {
      id: `tsk-${Date.now()}`,
      time: '11.00',
      type: 'Pickup',
      orderId: newId,
      customerName: fullOrder.customerName,
      address: fullOrder.address,
      phone: fullOrder.phone,
      serviceName: fullOrder.serviceName,
      weight: fullOrder.weight,
      distance: '2.5 km',
      eta: '10 menit',
      status: 'PENDING',
    };
    setCourierTasks((prev) => [newTask, ...prev]);

    return fullOrder;
  };

  // Update Order Status
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const updatedSteps = ord.steps.map((step) => {
          if (newStatus === 'DITERIMA' && step.label === 'Diterima') {
            return { ...step, completed: true, current: false };
          }
          if (newStatus === 'DICUCI') {
            if (step.label === 'Diterima') return { ...step, completed: true, current: false };
            if (step.label === 'Dicuci') return { ...step, completed: false, current: true };
          }
          if (newStatus === 'SIAP_DIKIRIM') {
            if (step.label === 'Diterima' || step.label === 'Dicuci' || step.label === 'Selesai') {
              return { ...step, completed: true, current: false };
            }
            if (step.label === 'Siap dikirim') return { ...step, completed: false, current: true };
          }
          if (newStatus === 'SELESAI') {
            return { ...step, completed: true, current: false };
          }
          return step;
        });

        return { ...ord, status: newStatus, steps: updatedSteps };
      })
    );
  };

  // Confirm Payment
  const confirmPayment = (orderId: string, method?: Order['paymentMethod'], proofUrl?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          paymentStatus: 'SUDAH_BAYAR',
          status: 'DITERIMA',
          paymentMethod: method || ord.paymentMethod,
          paymentProofUrl: proofUrl || ord.paymentProofUrl || 'bukti-pembayaran-terverifikasi.jpg',
        };
      })
    );
  };

  // Update Courier Task
  const updateTaskStatus = (taskId: string, status: CourierTask['status'], realWeight?: number) => {
    setCourierTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status,
          weight: realWeight !== undefined ? realWeight : t.weight,
        };
      })
    );
  };

  // Update Delivery Zone Fee
  const updateZoneFee = (id: string, fee: number) => {
    setDeliveryZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, fee } : z))
    );
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        authReady,
        login,
        logout,
        loginAsDemo,
        toasts,
        showToast,
        dismissToast,
        services,
        addService,
        updateService,
        deleteService,
        orders,
        activeOrderId,
        setActiveOrderId,
        createOrder,
        updateOrderStatus,
        confirmPayment,
        courierTasks,
        activeTaskId,
        setActiveTaskId,
        updateTaskStatus,
        vouchers,
        deliveryZones,
        updateZoneFee,
        reportStats,
        guestStep,
        setGuestStep,
        guestSelectedService,
        setGuestSelectedService,
        memberTab,
        setMemberTab,
        selectedHistoryOrder,
        setSelectedHistoryOrder,
        kurirTab,
        setKurirTab,
        adminTab,
        setAdminTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
