import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Iqbal Laundry · Layanan Laundry Antar-Jemput',
    short_name: 'Iqbal Laundry',
    description:
      'Aplikasi pemesanan, pelacakan status cucian, kurir operasional, dan manajemen laundry terpadu.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f8fc',
    theme_color: '#2562eb',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.ico',
        sizes: '48x48 32x32 16x16',
        type: 'image/x-icon',
      },
    ],
  };
}
