import type { Metadata } from "next";
import Providers from "@/components/providers/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Iqbal Laundry · Layanan Laundry Antar-Jemput",
    template: "%s | Iqbal Laundry",
  },
  description:
    "Layanan laundry kiloan, satuan, karpet, dan selimut dengan antar-jemput kurir, pembayaran QRIS instan, serta pelacakan status cucian real-time.",
  keywords: [
    "Iqbal Laundry",
    "laundry antar jemput",
    "laundry kiloan",
    "cuci setrika",
    "lacak laundry",
  ],
  openGraph: {
    title: "Iqbal Laundry · Layanan Laundry Antar-Jemput",
    description:
      "Pesan laundry online dengan jemput-antar kurir, estimasi biaya transparan, dan tracking real-time.",
    type: "website",
    locale: "id_ID",
    siteName: "Iqbal Laundry",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f5f8fc] text-[#0f2342]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
