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
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
