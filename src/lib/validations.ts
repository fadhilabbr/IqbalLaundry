import { z } from 'zod';

export const loginSchema = z.object({
  identity: z
    .string()
    .trim()
    .min(3, 'Username atau nomor WhatsApp minimal 3 karakter'),
  password: z.string().min(4, 'Password minimal 4 karakter'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const memberRegisterSchema = z.object({
  fullname: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter'),
  waNumber: z
    .string()
    .trim()
    .regex(
      /^08\d{8,13}$/,
      'Nomor WhatsApp harus diawali 08 dan terdiri dari 10–15 digit'
    ),
  username: z
    .string()
    .trim()
    .min(3, 'Username minimal 3 karakter')
    .regex(
      /^[a-z0-9_]+$/i,
      'Username hanya boleh berisi huruf, angka, dan underscore'
    )
    .refine(
      (v) => !['admin', 'budisantoso'].includes(v.toLowerCase()),
      'Username sudah digunakan, silakan pilih username lain'
    ),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type MemberRegisterFormValues = z.infer<typeof memberRegisterSchema>;

export const orderDetailsSchema = z.object({
  customerName: z.string().trim().min(3, 'Nama lengkap minimal 3 karakter'),
  phone: z
    .string()
    .trim()
    .regex(
      /^08\d{8,13}$/,
      'Format nomor WhatsApp tidak valid (contoh: 081234567890)'
    ),
  weight: z
    .number()
    .refine((v) => !Number.isNaN(v), 'Perkiraan berat wajib diisi')
    .min(1, 'Berat minimal 1'),
  notes: z.string().max(300, 'Catatan maksimal 300 karakter').optional(),
});

export type OrderDetailsFormValues = z.infer<typeof orderDetailsSchema>;

export const orderAddressSchema = z.object({
  address: z.string().trim().min(8, 'Alamat penjemputan minimal 8 karakter'),
  landmark: z.string().max(150, 'Patokan maksimal 150 karakter').optional(),
});

export type OrderAddressFormValues = z.infer<typeof orderAddressSchema>;

export const courierConfirmSchema = z.object({
  actualWeight: z
    .number()
    .refine((v) => !Number.isNaN(v), 'Berat aktual wajib diisi')
    .min(0.5, 'Berat minimal 0.5 kg'),
  confirmedNotes: z
    .string()
    .trim()
    .min(3, 'Catatan kondisi minimal 3 karakter')
    .max(300, 'Catatan maksimal 300 karakter'),
});

export type CourierConfirmFormValues = z.infer<typeof courierConfirmSchema>;

export const adminServiceSchema = z.object({
  name: z.string().trim().min(2, 'Nama layanan minimal 2 karakter'),
  price: z
    .number()
    .refine((v) => !Number.isNaN(v), 'Harga wajib diisi')
    .min(1000, 'Harga minimal Rp1.000'),
  unit: z.enum(['kg', 'm²', 'buah']),
  description: z.string().max(250, 'Deskripsi maksimal 250 karakter').optional(),
});

export type AdminServiceFormValues = z.infer<typeof adminServiceSchema>;
