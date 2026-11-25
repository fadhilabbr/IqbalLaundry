# API Contract — Iqbal Laundry (Draft Diskusi Backend)

Dokumen kontrak API ini disusun dari hasil audit seluruh fitur frontend **Iqbal Laundry** (`/dashboard`, `/member`, `/kurir`, `/admin`, `/login`) beserta schema validasi (`src/lib/validations.ts`) dan tipe data (`src/types/index.ts`) sebagai bahan diskusi dan penyelarasan dengan tim Backend.

> **Ringkasan Cakupan:** **53 operasi HTTP** dalam **7 domain REST (`/api/v1`)** — terdiri dari **34 `P0` (MVP Wajib)**, **14 `P1` (Post-MVP / V1.1)**, dan **5 `P2` (Nice-to-Have / V2)**.

## 1. Kondisi Codebase Saat Ini & Temuan Kritis

- **Fondasi BFF Auth Cookie sudah ada (prototipe)**: `src/proxy.ts`, `src/lib/session.ts`, dan `src/app/api/auth/{login,logout,session}/route.ts` sudah menjaga rute `/admin`, `/kurir`, dan `/member` memakai cookie `HttpOnly` bertanda tangan HMAC. Namun validasi masih memakai `DUMMY_ACCOUNTS` dengan password plaintext di `src/lib/auth.ts` serta fallback secret hardcoded.
- **Data bisnis masih mock di client**: Katalog layanan, order, pembayaran, tugas kurir, zona ongkir, voucher, dan laporan masih disimpan di `src/context/AppContext.tsx` (`localStorage`) dan `src/lib/data.ts`.
- **Gap & bug kritis yang perlu diselesaikan bersama Backend**:
  1. **Registrasi Member tidak terjangkau tamu**: `src/proxy.ts` memblokir akses non-login ke `/member`, sehingga tab `DAFTAR` dan `LOGIN` di `MemberPortal` tidak bisa diakses tamu. Endpoint `POST /auth/register` perlu dipasangkan ke halaman publik (mis. `/register` atau tab pada `/login`).
  2. **Kontradiksi waktu pembayaran COD**: Teks UI Screen 09 (`PelangganTamuFlow.tsx`) menulis *"Bayar Saat Pickup"*, sedangkan alur operasional dan konfirmasi timbangan biasanya memungut COD saat *Delivery* (atau setelah timbang *Pickup*). Wajib dikunci bersama Backend & Produk.
  3. **Timbangan aktual kurir belum mengubah harga order**: Konfirmasi `actualWeight` & `confirmedNotes` di `KurirPortal` saat ini hanya memperbarui `CourierTask.weight` tanpa menyimpan catatan dan tanpa menghitung ulang `Order.serviceTotal` dan `Order.total`.
  4. **Auto-approve pembayaran & kebocoran PII tracking tamu**: `confirmPayment` langsung meloloskan `TRANSFER`/`QRIS`/`COD` menjadi `SUDAH_BAYAR` + `DITERIMA` di client tanpa verifikasi Admin atau webhook; Screen 14 menampilkan daftar semua order semua pelanggan tanpa autentikasi.
  5. **Ketidaksinkronan `Order.steps` vs `OrderStatus`**: Timeline 5 tahap di UI belum menyertakan `DISETRIKA` dan menempatkan `Selesai` sebelum `Siap dikirim`, bertolak belakang dengan enum `OrderStatus`.

---

## 2. Standar Lintas API (Cross-Cutting Standards)

### Base URL & Format
- **Base Prefix**: `/api/v1` (REST JSON over HTTPS, resource jamak *kebab-case* dengan RBAC scoping agar tidak duplikat antara publik vs admin).
- **Format Waktu & Uang**: Semua timestamp wajib **ISO-8601 UTC** (mis. `2026-11-24T03:45:00Z`, bukan string relatif seperti `'Baru saja'`). Semua nilai uang dalam **integer IDR** (tanpa float).
- **Idempotency**: Header `Idempotency-Key: <uuid>` (TTL 24 jam) direkomendasikan/wajib pada `POST /orders` dan `POST /orders/:orderId/payments` untuk mencegah transaksi ganda akibat retry jaringan.

### Envelope Response & Pagination
**Sukses (Single Resource / List dengan Offset Pagination):**
```json
{
  "success": true,
  "data": [],
  "meta": {
    "requestId": "req_01J...",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 128,
      "totalPages": 7,
      "hasNext": true
    }
  }
}
```
Query standar list: `?page=1&limit=20` (maks `limit=100`), `?q=` (atau `?search=`), `?status=`, `?sort=createdAt:desc`.

**Error Konsisten:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Periksa kembali data yang Anda masukkan.",
    "details": [
      {
        "field": "waNumber",
        "message": "Nomor WhatsApp harus diawali 08 dan terdiri dari 10–15 digit"
      }
    ]
  },
  "meta": {
    "requestId": "req_01J..."
  }
}
```

### Konvensi HTTP Status Code
| Status | Arti | Contoh Penggunaan |
| :--- | :--- | :--- |
| `200` / `201` / `204` | Sukses | Read/Update (`200`), Create (`201`), Delete (`200`/`204`) |
| `400` | Bad Request | Syntax JSON tidak valid, file upload hilang / tipe tidak didukung |
| `401` | Unauthorized | Belum login, token/cookie kedaluwarsa, kredensial salah |
| `403` | Forbidden | Role tidak berhak atau bukan pemilik resource (`X-Tracking-Token` / `memberId`) |
| `404` | Not Found | `orderId`, `serviceId`, `taskId`, atau `voucherCode` tidak ditemukan |
| `409` | Conflict | Username/nomor WA sudah terdaftar, transisi status ilegal, idempotency conflict |
| `413` | Payload Too Large | Ukuran bukti transfer melebihi batas (`> 5 MB`) |
| `422` | Unprocessable Entity | Gagal validasi field Zod atau aturan bisnis (min order voucher tidak terpenuhi, di luar zona layanan) |
| `429` | Too Many Requests | Melebihi rate limit login / register / tracking publik |

### Matriks RBAC (Role-Based Access Control)
| Role | Status Auth | Rute Utama | Cakupan Akses |
| :--- | :--- | :--- | :--- |
| `PELANGGAN_TAMU` | Publik (atau `X-Tracking-Token`) | `/dashboard` | Lihat layanan/zona publik, simulasi harga, buat order tamu, proses bayar & lacak order sendiri |
| `MEMBER` | Terautentikasi | `/member` | Semua aksi tamu + profil, ringkasan beranda, riwayat order milik sendiri, unduh invoice, voucher member, poin loyalitas |
| `KURIR` | Terautentikasi | `/kurir` | Lihat daftar tugas jemput/antar yang ditugaskan, lihat rute, mulai tugas, konfirmasi timbangan aktual & penyelesaian |
| `ADMIN` | Terautentikasi | `/admin` | Kelola semua order, ubah status, verifikasi pembayaran, tugaskan kurir, CRUD layanan/zona/voucher, laporan & audit log |

### Canonical State Machines
1. **`OrderStatus`**:
   - `MENUNGGU_PEMBAYARAN` → `DITERIMA` *(pembayaran terverifikasi atau COD dikonfirmasi)* | `GAGAL` *(kedaluwarsa / dibatalkan / bukti transfer ditolak)*
   - `DITERIMA` → `DICUCI` | `GAGAL`
   - `DICUCI` → `DISETRIKA` *(layanan cuci + setrika)* | `SIAP_DIKIRIM` *(layanan tanpa setrika, mis. karpet/selimut)*
   - `DISETRIKA` → `SIAP_DIKIRIM` *(siap antar; memicu pembuatan `CourierTask` tipe `Delivery`)*
   - `SIAP_DIKIRIM` → `SELESAI` *(kurir menyelesaikan pengantaran)* | `GAGAL` *(pengantaran gagal)*
   - `SELESAI`, `GAGAL` → *Terminal* (perubahan paksa oleh Admin membutuhkan `force: true` + `reason`).
2. **`Order.paymentStatus` (Usulan Canonical 5 State)**:
   - `BELUM_BAYAR` → `MENUNGGU_VERIFIKASI` *(setelah upload bukti transfer manual)* → `SUDAH_BAYAR` | `GAGAL`
   - `BELUM_BAYAR` → `SUDAH_BAYAR` *(webhook QRIS sukses atau pelunasan COD)* | `KEDALUWARSA` *(QRIS/batas bayar habis)* | `GAGAL` *(dibatalkan)*
3. **`CourierTask.status`**:
   - `PENDING` → `IN_PROGRESS` → `COMPLETED` *(atau `CANCELLED` jika order induk menjadi `GAGAL`)*.

### Aturan Validasi Frontend (`src/lib/validations.ts`) yang Perlu Diselaraskan Backend
- **Login (`loginSchema`)**: `identity` trim min 3 karakter (`username` atau nomor WA); `password` min 4 karakter *(disarankan BE & FE diseragamkan min 6 karakter)*.
- **Registrasi Member (`memberRegisterSchema`)**: `fullname`/`name` trim min 3; `waNumber`/`phone` regex `/^08\d{8,13}$/` (10–15 digit); `username` trim min 3 regex `/^[a-z0-9_]+$/i`; `password` min 6.
- **Detail Order (`orderDetailsSchema`)**: `customerName` trim min 3; `phone` regex `/^08\d{8,13}$/`; `weight` angka min `1` *(UI Screen 02 & 04 menyebut Min. 3 kg — perlu aturan per `ServiceUnit` `kg`/`m²`/`buah`)*; `notes` opsional maks 300 karakter.
- **Alamat Order (`orderAddressSchema`)**: `address` trim min 8; `landmark` opsional maks 150 karakter.
- **Konfirmasi Kurir (`courierConfirmSchema`)**: `actualWeight` angka min `0.5` (step `0.5`); `confirmedNotes` trim 3–300 karakter.
- **Layanan Admin (`adminServiceSchema`)**: `name` trim min 2; `price` integer min `1000`; `unit` enum `'kg' | 'm²' | 'buah'`; `description` opsional maks 250 karakter.

---

## 3. Daftar Lengkap API Contract (Base: `/api/v1`)

> **Legenda Prioritas:** **`P0`** = MVP Wajib (34) · **`P1`** = Post-MVP / V1.1 (14) · **`P2`** = Nice-to-Have / V2 (5)

### A. Auth & Session (7 Endpoint)
| Method & Path | Role / Auth | Prioritas | Ringkasan Kontrak (Request → Response & Error) |
| :--- | :--- | :---: | :--- |
| `POST /auth/login` | Public | **P0** | Body: `{ identity, password, rememberMe? }`. Response `200`: `{ user, redirectTo, accessToken?, expiresIn? }` + `Set-Cookie` HttpOnly. Error: `401 INVALID_CREDENTIALS`, `422`, `429`. |
| `POST /auth/register` | Public | **P0** | Daftar akun `MEMBER` saja (abaikan field `role` dari client). Body: `{ name, phone, username, password }`. Response `201`: `{ user, accessToken? }` + auto-login cookie. Error: `409 USERNAME_TAKEN \| PHONE_ALREADY_REGISTERED`, `422`. |
| `GET /auth/me` | `MEMBER \| KURIR \| ADMIN` | **P0** | Bootstrap sesi aktif (mengganti mock `/api/auth/session`). Response `200`: `AuthUser` ter-sanitasi (tanpa `password`). Error: `401` jika tamu. |
| `POST /auth/refresh` | Refresh Cookie / Token | **P0** | Rotasi refresh token dan terbitkan access token/cookie baru. Error: `401 REFRESH_TOKEN_INVALID \| REFRESH_TOKEN_REVOKED`. |
| `POST /auth/logout` | Authenticated | **P0** | Body opsional: `{ allDevices?: boolean }`. Revoke sesi/refresh token & hapus HttpOnly cookies. |
| `POST /auth/forgot-password` | Public | **P1** | Body: `{ identity }`. Kirim OTP/link reset via WhatsApp (selalu return `200` generik untuk mencegah enumerasi akun, rate-limited). |
| `POST /auth/reset-password` | Public | **P1** | Body: `{ identity, otpOrToken, newPassword }`. Verifikasi OTP/token & perbarui password. Error: `400`, `422`. |

### B. Public, Katalog & Konfigurasi Toko (5 Endpoint)
| Method & Path | Role / Auth | Prioritas | Ringkasan Kontrak (Request → Response & Error) |
| :--- | :--- | :---: | :--- |
| `GET /store/config` | Public | **P0** | Konfigurasi toko: jam operasional toko & kurir, `minOrderKg`, nomor WA CS, daftar rekening transfer resmi (BCA/Mandiri), `qrisNmid`, koordinat workshop. |
| `GET /services` | Public (`ADMIN`: `?includeInactive=true`) | **P0** | Katalog layanan (`id, name, price, unit, minQty, description, popular, estimatedHours, isActive`). Query opsional: `?popular=true`. |
| `GET /services/:serviceId` | Public | **P0** | Detail layanan beserta highlight kualitas (Screen 03). Error: `404 SERVICE_NOT_FOUND`. |
| `GET /delivery-zones` | Public (`ADMIN`: `?includeInactive=true`) | **P0** | Daftar zona & tarif ongkir (`id, name, zoneArea, minRadiusKm, maxRadiusKm, fee, isActive`). |
| `POST /delivery-zones/quote` | Public | **P1** | Body: `{ address, latitude?, longitude?, areaCode? }` → `{ zoneId, zoneName, zoneArea, distanceKm, deliveryFee, serviceable }`. Error: `422 OUT_OF_SERVICE_AREA`. *(MVP bisa memakai dropdown zona dari `GET /delivery-zones`.)* |

### C. Order & Pelacakan (7 Endpoint)
| Method & Path | Role / Auth | Prioritas | Ringkasan Kontrak (Request → Response & Error) |
| :--- | :--- | :---: | :--- |
| `POST /orders/estimate` | Public / Opsional `MEMBER` | **P0** | Simulasi kalkulasi server-side. Body: `{ serviceId, weight, deliveryZoneId?, latitude?, longitude?, voucherCode? }` → `{ billableWeight, pricePerUnit, serviceTotal, deliveryZoneId, deliveryFee, appliedVoucher, discount, total, estimatedFinish }`. Error: `404`, `422`. |
| `POST /orders` | Public / `MEMBER` | **P0** | Header `Idempotency-Key`. Body: `{ customerName, phone, serviceId, weight, notes?, address, landmark?, deliveryZoneId?, latitude?, longitude?, voucherCode?, paymentMethod? }`. Server hitung total & snapshot harga. Return `201`: `{ order, trackingToken? }`. |
| `POST /orders/track` | Public (rate-limited) | **P0** | Body: `{ orderCode, phone (atau phoneLast4) }` → detail status order, `paymentStatus`, `estimatedFinish`, `steps[]` dengan PII ter-masking (`POST` agar nomor HP tidak bocor di URL log). Error: `404`, `429`. |
| `GET /orders` | `MEMBER` (milik sendiri) / `ADMIN` (semua) | **P0** | List order terpaginasi (`?status=&paymentStatus=&paymentMethod=&q=&from=&to=&page=&limit=&sort=`). Khusus `ADMIN` menyertakan `meta.kpis` (`total, awaitingAction, inProgress, completed`) & `meta.statusCounts`. |
| `GET /orders/:orderId` | `ADMIN` / `MEMBER` (owner) / Guest (`X-Tracking-Token`) | **P0** | Detail order lengkap (`steps[]`, `paymentProofUrl`, `notes`, `landmark`). Khusus `ADMIN` ditambah `assignedTasks[]` & `weightHistory[]`. Error: `401`, `403`, `404`. |
| `GET /orders/:orderId/invoice` | `MEMBER` (owner) / `ADMIN` / Guest token | **P1** | Mengunduh struk/invoice resmi (`Content-Type: application/pdf` atau signed URL). Mengganti tombol toast stub di `MemberPortal`. |
| `POST /orders/:orderId/reorder` | `MEMBER` (owner) | **P2** | Mengembalikan payload prefill (atau membuat draft order) untuk pesan ulang cepat dari riwayat. |

### D. Pembayaran & Verifikasi (6 Endpoint)
| Method & Path | Role / Auth | Prioritas | Ringkasan Kontrak (Request → Response & Error) |
| :--- | :--- | :---: | :--- |
| `POST /orders/:orderId/payments` | `MEMBER` (owner) / Guest token | **P0** | Header `Idempotency-Key`. Body: `{ method: 'QRIS' \| 'TRANSFER' \| 'COD', bankCode? }`. Return payload QRIS (`qrString, qrImageUrl, nmid, expiresAt`), instruksi transfer bank, atau konfirmasi COD (`orderStatus: 'DITERIMA'`, `paymentStatus: 'BELUM_BAYAR'`). Error: `409 ORDER_ALREADY_PAID \| ORDER_CANCELLED`. |
| `GET /orders/:orderId/payments/latest` | `MEMBER` (owner) / Guest token | **P0** | Polling status pembayaran terbaru (`paymentStatus, orderStatus, paidAt?, expiresAt?`). Mengganti tombol konfirmasi QRIS manual di Screen 10. |
| `POST /orders/:orderId/payments/proof` | `MEMBER` (owner) / Guest token | **P0** | Upload bukti transfer (`multipart/form-data`: `file` JPG/PNG/PDF ≤ 5 MB, `bankName?`, `senderName?`) → `paymentStatus: 'MENUNGGU_VERIFIKASI'`, `paymentProofUrl`. Error: `400`, `413`. |
| `POST /orders/:orderId/payments/cancel` | `MEMBER` (owner) / Guest token | **P0** | Body: `{ reason? }`. Mengubah `paymentStatus` ke `'GAGAL'` sementara `orderStatus` tetap `'MENUNGGU_PEMBAYARAN'` agar pelanggan bisa retry/ganti metode (Screen 11). |
| `POST /orders/:orderId/payments/verify` | `ADMIN` | **P0** | Body: `{ action: 'APPROVE' \| 'REJECT', verifiedAmount?, note? (wajib saat REJECT) }`. Mengubah `MENUNGGU_VERIFIKASI` → `SUDAH_BAYAR` (`orderStatus: 'DITERIMA'`) atau `GAGAL`. Error: `409`, `422`. |
| `POST /webhooks/payments/:provider` | S2S PG Signature | **P0** | Webhook idempoten dari Payment Gateway (Midtrans/Xendit) untuk settlement atau expiry QRIS otomatis. |

### E. Portal Member & Promo (6 Endpoint)
| Method & Path | Role / Auth | Prioritas | Ringkasan Kontrak (Request → Response & Error) |
| :--- | :--- | :---: | :--- |
| `GET /members/me` | `MEMBER` | **P0** | Profil member asli (`id, memberCode, name, initials, username, phone, defaultAddress, defaultLandmark, latitude?, longitude?, tier, tierLabel, loyaltyPoints, joinedAt`). |
| `GET /members/me/summary` | `MEMBER` | **P0** | Ringkasan Beranda Member (`memberName, tier, tierLabel, loyaltyPoints, activeVouchersCount, activeOrdersCount, totalOrdersCount, recentOrders[0..2]`). |
| `GET /vouchers` | Public / `MEMBER` / `ADMIN` | **P0** | Daftar voucher ter-scope role (`MEMBER`: `?status=ACTIVE \| USED \| EXPIRED`; `ADMIN`: `?includeInactive=true` + statistik pemakaian). |
| `POST /vouchers/validate` | Public / Opsional `MEMBER` | **P0** | Body: `{ code, orderSubtotal, serviceId? }` → `{ valid, code, title, discountType, discountValue, discountAmount, minOrder }`. Menutup gap input voucher di Screen 07. Error: `404`, `422 VOUCHER_EXPIRED \| VOUCHER_MIN_ORDER_NOT_MET \| VOUCHER_MEMBER_ONLY`. |
| `PATCH /members/me` | `MEMBER` | **P1** | Edit profil member: `{ name?, phone?, defaultAddress?, defaultLandmark?, latitude?, longitude? }`. Error: `409 PHONE_ALREADY_REGISTERED`, `422`. |
| `POST /vouchers/:voucherId/claim` | `MEMBER` | **P2** | Tukar poin loyalitas untuk klaim voucher. Error: `409 ALREADY_CLAIMED`, `422 INSUFFICIENT_POINTS`. |

### F. Operasional Kurir (7 Endpoint)
| Method & Path | Role / Auth | Prioritas | Ringkasan Kontrak (Request → Response & Error) |
| :--- | :--- | :---: | :--- |
| `GET /courier-tasks` | `KURIR` (assigned) / `ADMIN` (all) | **P0** | Query: `?status=ALL \| ACTIVE \| COMPLETED&type=Pickup \| Delivery&date=YYYY-MM-DD&courierId=&page=&limit=`. Mengembalikan list tugas + `meta.counts` (`total, active, completed`). |
| `GET /courier-tasks/:taskId` | `KURIR` (assigned) / `ADMIN` | **P0** | Detail tugas + info order (`orderStatus, pricePerUnit, total, paymentMethod, paymentStatus, codAmountDue?, confirmedNotes?, landmark, lat, lng`). |
| `POST /courier-tasks/:taskId/complete` | `KURIR` (assigned) | **P0** | Body: `{ actualWeight? (wajib >= 0.5 saat Pickup), confirmedNotes (3..300), codCollected?, photoProofUrl? }`. Menyimpan catatan, menghitung ulang total & selisih pembayaran order, memajukan `OrderStatus` (`Pickup → DITERIMA`, `Delivery → SELESAI`), dan melunasi COD. |
| `GET /couriers/me` | `KURIR` | **P0** | Profil & statistik kurir (`id, courierCode, name, initials, phone, vehicleModel, plateNumber, assignedZone, isOnline, stats: { completedThisMonth, completedToday, activeTasksCount }`). |
| `PATCH /courier-tasks/:taskId` | `KURIR` (mulai) / `ADMIN` (reassign) | **P1** | `KURIR`: mulai tugas `{ status: 'IN_PROGRESS', lat?, lng? }`. `ADMIN`: reassign/reschedule `{ courierId?, scheduledTime?, status? }`. |
| `GET /couriers/me/route` | `KURIR` | **P1** | Rute harian terurut (`?date=YYYY-MM-DD`) berisi koordinat workshop, `activeTaskId`, dan daftar `stops[]` lengkap dengan `lat, lng, distanceKm, etaMinutes, mapsUrl`. |
| `PATCH /couriers/me/availability` | `KURIR` | **P2** | Body: `{ isOnline: boolean }` untuk status kesiapan kurir menerima penugasan. |

### G. Manajemen Admin & Laporan (15 Operasi HTTP)
*(Admin membaca daftar order, layanan, zona ongkir, voucher, dan tugas kurir melalui endpoint terpadu di atas sesuai hak akses `ADMIN`.)*

| Method & Path | Role / Auth | Prioritas | Ringkasan Kontrak (Request → Response & Error) |
| :--- | :--- | :---: | :--- |
| `PATCH /orders/:orderId/status` | `ADMIN` | **P0** | Body: `{ status: OrderStatus, reason? (wajib saat GAGAL/override), force?: boolean }`. Validasi state machine, perbarui `steps[]`, dan opsional auto-create task `Delivery` saat `SIAP_DIKIRIM`. Error: `409 INVALID_STATUS_TRANSITION`. |
| `POST /services` | `ADMIN` | **P0** | Tambah layanan (`name, price >= 1000, unit, description?, popular?, minQty?, estimatedHours?`). Return `201`. Error: `409 SERVICE_NAME_EXISTS`, `422`. |
| `PATCH /services/:serviceId` | `ADMIN` | **P0** | Edit layanan parsial (termasuk toggle `popular` dan `isActive`). Error: `404`, `422`. |
| `DELETE /services/:serviceId` | `ADMIN` | **P0** | **Soft-delete** (`isActive = false`) agar histori order & laporan keuangan tetap valid. |
| `PATCH /delivery-zones/:zoneId` | `ADMIN` | **P0** | Update tarif ongkir (`fee >= 0`) atau `name, zoneArea, minRadiusKm, maxRadiusKm, isActive`. *(Catatan FE: tambahkan debounce atau tombol Simpan di `AdminDashboard` agar tidak mengirim `PATCH` tiap ketikan.)* |
| `GET /admin/reports/summary` | `ADMIN` | **P0** | Query: `?from=YYYY-MM-DD&to=YYYY-MM-DD&granularity=day \| week \| month`. Return KPI (`ordersCount, ordersDeltaPct, revenue, monthlyTarget, monthlyTargetPct, completedCount, completionRatePct, averageOrderValue`), `series[]`, `peakDay`, dan `breakdown`. |
| `GET /couriers` | `ADMIN` | **P1** | Daftar kurir (`?zoneId=&isOnline=`) + `activeTaskCount` untuk dispatch tugas. |
| `POST /courier-tasks` | `ADMIN` | **P1** | Buat/tugaskan task `Pickup`/`Delivery` manual: `{ orderId, courierId, type, scheduledTime }`. Return `201`. Error: `409 DUPLICATE_ACTIVE_TASK`. |
| `POST /delivery-zones` | `ADMIN` | **P1** | Tambah zona ongkir baru (`name, zoneArea, fee >= 0, minRadiusKm?, maxRadiusKm?`). Return `201`. |
| `DELETE /delivery-zones/:zoneId` | `ADMIN` | **P1** | Soft-delete / nonaktifkan zona ongkir. |
| `POST /vouchers` | `ADMIN` | **P1** | Buat voucher baru (`code, title, description, discountType, discountValue, minOrder, maxDiscount?, usageLimit?, memberOnly?, validFrom?, validUntil?`). Return `201`. |
| `PATCH /vouchers/:voucherId` | `ADMIN` | **P1** | Edit voucher atau toggle `isActive`. |
| `DELETE /vouchers/:voucherId` | `ADMIN` | **P1** | Soft-delete / nonaktifkan voucher. |
| `GET /admin/reports/export` | `ADMIN` | **P2** | Unduh laporan periodik (`?from=&to=&format=csv \| xlsx&status=`). |
| `GET /admin/audit-logs` | `ADMIN` | **P2** | Jejak audit perubahan sensitif (`?entityType=&entityId=&actorId=&from=&to=&page=&limit=`) berisi `before`, `after`, `actorId`, `createdAt`. |

---

## 4. Contoh Payload JSON Utama

**1. `POST /api/v1/auth/login`**
```json
// Request
{
  "identity": "081234567890",
  "password": "password123",
  "rememberMe": true
}

// Response 200 OK
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_01J...",
      "username": "member",
      "name": "Budi Santoso",
      "phone": "081234567890",
      "role": "MEMBER",
      "roleLabel": "Member"
    },
    "redirectTo": "/member"
  }
}
```

**2. `POST /api/v1/orders`**
```json
// Request POST /orders
{
  "customerName": "Budi Santoso",
  "phone": "081234567890",
  "serviceId": "srv-1",
  "weight": 4,
  "notes": "Pisahkan baju putih",
  "address": "Jl. Soekarno Hatta No. 45, Bandung",
  "landmark": "Depan minimarket",
  "deliveryZoneId": "zone-2",
  "voucherCode": "HEMAT5"
}

// Response 201 Created
{
  "success": true,
  "data": {
    "order": {
      "id": "IL-1029",
      "status": "MENUNGGU_PEMBAYARAN",
      "paymentStatus": "BELUM_BAYAR",
      "serviceTotal": 28000,
      "deliveryFee": 8000,
      "discount": 5000,
      "total": 31000,
      "createdAt": "2026-11-25T14:20:00Z",
      "estimatedFinish": "2026-11-27T14:20:00Z",
      "steps": []
    },
    "trackingToken": "trk_signed_opaque_token"
  }
}
```

**3. `POST /api/v1/orders/track`**
```json
// Request
{
  "orderCode": "IL-1029",
  "phone": "081234567890"
}

// Response 200 OK (PII ter-masking)
{
  "success": true,
  "data": {
    "id": "IL-1029",
    "status": "DICUCI",
    "paymentStatus": "SUDAH_BAYAR",
    "customerNameMasked": "Bu** Sa*****",
    "phoneMasked": "0812****7890",
    "estimatedFinish": "2026-11-27T14:20:00Z",
    "steps": [
      { "label": "Dibuat", "time": "2026-11-25T14:20:00Z", "completed": true, "current": false },
      { "label": "Diterima", "time": "2026-11-25T14:35:00Z", "completed": true, "current": false },
      { "label": "Dicuci", "time": "2026-11-25T15:00:00Z", "completed": false, "current": true }
    ]
  }
}
```

**4. `POST /api/v1/orders/:orderId/payments`**
```json
// Request
{
  "method": "QRIS"
}

// Response 201 Created
{
  "success": true,
  "data": {
    "paymentId": "pay_01J...",
    "method": "QRIS",
    "paymentStatus": "BELUM_BAYAR",
    "amount": 31000,
    "qrString": "000201010212...",
    "nmid": "ID1020304050607",
    "expiresAt": "2026-11-25T14:35:00Z"
  }
}
```

**5. `POST /api/v1/courier-tasks/:taskId/complete`**
```json
// Request
{
  "actualWeight": 4.5,
  "confirmedNotes": "4.5 kg, terdapat noda tinta di kerah kemeja putih",
  "codCollected": false
}

// Response 200 OK
{
  "success": true,
  "data": {
    "task": {
      "id": "tsk-1",
      "status": "COMPLETED",
      "actualWeight": 4.5,
      "confirmedNotes": "4.5 kg, terdapat noda tinta di kerah kemeja putih",
      "completedAt": "2026-11-25T14:35:00Z"
    },
    "order": {
      "id": "IL-1029",
      "status": "DITERIMA",
      "weight": 4.5,
      "serviceTotal": 31500,
      "deliveryFee": 8000,
      "discount": 5000,
      "total": 34500,
      "paymentStatus": "SUDAH_BAYAR",
      "paymentAdjustment": {
        "deltaAmount": 3500,
        "adjustmentType": "UNDERPAID"
      }
    }
  }
}
```

---

## 5. Agenda Keputusan Penting untuk Diskusi Backend

1. **[BLOCKER · Auth & BFF]** Apakah Backend menerbitkan cookie `HttpOnly + SameSite=Lax` secara langsung, atau Next.js `/api/auth/*` + `src/proxy.ts` tetap bertindak sebagai thin BFF proxy ke Backend (terutama jika nanti ada mobile app Kurir yang butuh Bearer JWT)? Pastikan rute publik `/register` ditambahkan karena `/member` diblokir oleh `proxy.ts`.
2. **[BLOCKER · Selisih Berat & Timing COD]**
   - Kunci aturan **COD**: dibayar saat **Pickup** (sesuai teks Screen 09) atau saat **Delivery**?
   - Saat `actualWeight !== estimatedWeight` di Pickup: untuk **COD**, apakah total & kelayakan voucher otomatis dihitung ulang? Untuk order **QRIS/Transfer yang sudah dibayar**, bagaimana mekanisme kurang bayar (invoice/link tambahan vs tagih tunai selisih saat antar) dan lebih bayar (refund manual / saldo)?
   - Bagaimana aturan `Min. 3 kg` diterapkan per satuan (`kg` vs `m²` vs `buah`)?
3. **[BLOCKER · Pembayaran & Trigger Tugas Kurir]** Payment gateway apa yang dipakai untuk QRIS (Midtrans / Xendit / QRIS statis)? Apakah tugas `Pickup` kurir dibuat **setelah pembayaran terverifikasi / COD dipilih**, bukan langsung saat `POST /orders` masih `MENUNGGU_PEMBAYARAN`? Upload bukti transfer via `multipart/form-data` ke Backend atau presigned S3/GCS URL?
4. **[BLOCKER · Privasi Tracking Tamu]** Sepakati penggantian daftar order publik (Screen 14) dengan `POST /orders/track` (`orderCode + phone/4 digit terakhir`) + masking PII, serta penggunaan `trackingToken` dari `POST /orders`.
5. **[HIGH · State Machine & Dispatch Kurir]** Saat Admin memindahkan order ke `SIAP_DIKIRIM`, apakah Backend otomatis membuat task `Delivery` (auto-assign zona/beban terendah atau manual oleh Admin)? Sepakati `steps[]` kanonikal dari Backend agar `DISETRIKA` dan urutan `SIAP_DIKIRIM → SELESAI` seragam.
6. **[HIGH · Peta & Zona Ongkir]** Untuk v1, apakah Frontend memakai dropdown pilih zona/kelurahan dari `GET /delivery-zones`, atau langsung integrasi map picker (`lat/lng` → `POST /delivery-zones/quote` + Google Maps/OSRM untuk jarak & ETA kurir)?
7. **[MEDIUM · Loyalty, Voucher & Laporan Keuangan]** Apakah voucher berlaku untuk tamu atau khusus member? Bagaimana rumus poin loyalitas & tier (`Bronze/Silver/Gold`), apakah order tamu otomatis tertaut saat mendaftar member dengan nomor WA yang sama, dan apakah `revenue` di laporan hanya menghitung order `SUDAH_BAYAR` (atau `SELESAI`) dalam timezone `Asia/Jakarta` (WIB)?
8. **[MEDIUM · Real-time & Notifikasi]** Apakah antrean order Admin & tugas Kurir cukup polling (mis. tiap 30 detik) untuk v1 atau butuh WebSocket/SSE? Apakah tersedia WhatsApp Gateway untuk OTP `forgot-password` dan notifikasi status order?
