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
import { UserAccount, DUMMY_ACCOUNTS, findUserByCredentials } from '@/lib/auth';

const STORAGE_KEY = 'iqbal_laundry_v1';

interface PersistedState {
  role: Role;
  currentUser: UserAccount | null;
  services: Service[];
  orders: Order[];
  courierTasks: CourierTask[];
  deliveryZones: DeliveryZone[];
}

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;

  // Auth User
  currentUser: UserAccount | null;
  login: (identity: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  loginAsDemo: (targetRole: Role) => void;

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
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [services, setServices] = useState<Service[]>(initialServices);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeOrderId, setActiveOrderId] = useState<string>('IL-1024');
  const [courierTasks, setCourierTasks] = useState<CourierTask[]>(initialCourierTasks);
  const [activeTaskId, setActiveTaskId] = useState<string>('tsk-1');
  const [vouchers] = useState<Voucher[]>(initialVouchers);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(initialDeliveryZones);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const isHydratedRef = useRef(false);

  // Portal navigation states
  const [guestStep, setGuestStep] = useState<number>(1);
  const [guestSelectedService, setGuestSelectedService] = useState<Service | null>(initialServices[1]);
  const [memberTab, setMemberTab] = useState<MemberTab>('BERANDA');
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<Order | null>(initialOrders[0]);
  const [kurirTab, setKurirTab] = useState<KurirTab>('JADWAL');
  const [adminTab, setAdminTab] = useState<AdminTab>('ORDER_MASUK');

  // Hydrate persisted state from localStorage on client mount
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PersistedState>;
          if (parsed.role) setRole(parsed.role);
          if (parsed.currentUser !== undefined) setCurrentUser(parsed.currentUser);
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

  // Persist key domain state changes to localStorage
  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      const payload: PersistedState = {
        role,
        currentUser,
        services,
        orders,
        courierTasks,
        deliveryZones,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore quota or private-mode errors
    }
  }, [role, currentUser, services, orders, courierTasks, deliveryZones]);

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

  // Login handler
  const login = (identity: string, password: string) => {
    const user = findUserByCredentials(identity, password);
    if (!user) {
      return { success: false, error: 'Username/nomor WhatsApp atau password salah.' };
    }
    setCurrentUser(user);
    setRole(user.role);
    return { success: true };
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setRole('PELANGGAN_TAMU');
    setGuestStep(1);
    showToast('Anda telah keluar dari akun.', 'info');
  };

  // Quick Demo Login
  const loginAsDemo = (targetRole: Role) => {
    if (targetRole === 'PELANGGAN_TAMU') {
      setCurrentUser(null);
      setRole('PELANGGAN_TAMU');
      setGuestStep(1);
      return;
    }
    const account = DUMMY_ACCOUNTS.find((a) => a.role === targetRole);
    if (account) {
      setCurrentUser(account);
      setRole(account.role);
    }
  };

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
