# ✦ Iqbal Laundry

Aplikasi web **Iqbal Laundry** dibangun menggunakan **Next.js 16 (App Router + Turbopack)**, **React 19**, **TypeScript**, dan **Tailwind CSS v4**. Aplikasi ini menyediakan alur pemesanan laundry antar-jemput, pelacakan status real-time, portal member, portal kurir, dan panel admin dengan persistensi data lokal (`localStorage`).

## Rute Halaman

| Rute | Deskripsi |
| :--- | :--- |
| `/dashboard` | Portal Pelanggan Tamu — pemesanan 5 tahap (Pilih Layanan → Data Pesanan → Alamat & Estimasi → Pembayaran QRIS/Transfer/COD → Lacak Status 5 Tahap). |
| `/member` | Portal Member — login & registrasi member, riwayat transaksi, unduh ringkasan invoice, voucher promo (`WELCOME10`, `HEMAT5`), dan poin loyalitas. |
| `/kurir` | Portal Kurir — jadwal jemput & antar, detail tugas & kontak pelanggan, pratinjau rute, dan konfirmasi berat timbangan aktual. |
| `/admin` | Admin Panel — kelola order masuk & status real-time, CRUD katalog layanan & tarif, pengaturan tarif ongkos kirim per zona, dan laporan performa usaha. |
| `/login` | Halaman Login multi-peran dilengkapi pengisian cepat kredensial akun dummy dan pengalihan otomatis sesuai peran. |
| `/` | Mengarahkan otomatis ke `/dashboard`. |

## Kredensial Akun Dummy

| Role | Username / No. WA | Password | Rute Tujuan |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` / `081200000001` | `admin123` | `/admin` |
| **Kurir** | `kurir` / `081200000002` | `kurir123` | `/kurir` |
| **Member** | `member` / `081234567890` | `member123` | `/member` |

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## Perintah Produksi & Quality Check

```bash
npm run lint
npm run build
npm run start
```

## Deploy ke Vercel

1. Push repositori ini ke GitHub/GitLab/Bitbucket.
2. Impor proyek di [Vercel Dashboard](https://vercel.com/new).
3. Preset framework akan terdeteksi otomatis sebagai **Next.js** dengan perintah build `npm run build` — klik **Deploy**.
