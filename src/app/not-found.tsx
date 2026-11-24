import Link from 'next/link';
import { ArrowLeft, SignIn, WarningCircle } from '@phosphor-icons/react/dist/ssr';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#f5f8fc] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-[#dce5f0] rounded-[16px] p-8 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
        <div className="inline-flex items-center justify-center gap-2 px-3.5 py-2 mx-auto rounded-2xl bg-blue-50 text-[#2562eb] border border-blue-200">
          <WarningCircle size={20} weight="bold" aria-hidden="true" />
          <span className="font-black text-base tracking-tight tabular-nums">404</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0f2342] mt-4">Halaman Tidak Ditemukan</h1>
        <p className="text-xs sm:text-sm text-[#64748b] mt-2 leading-relaxed">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#2562eb] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-[10px] transition shadow-[0_1px_3px_rgba(15,35,66,0.06)] whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
          >
            <ArrowLeft size={16} weight="bold" aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 border border-[#cbd5e1] hover:bg-slate-50 text-[#0f2342] font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-[10px] transition shadow-[0_1px_3px_rgba(15,35,66,0.06)] whitespace-nowrap active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2562eb]/30"
          >
            <SignIn size={16} weight="bold" aria-hidden="true" />
            <span>Halaman Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
