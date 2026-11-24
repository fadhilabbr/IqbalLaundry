export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[100dvh] flex flex-col bg-[#f5f8fc]"
    >
      <span className="sr-only">Memuat halaman Iqbal Laundry...</span>

      {/* Top Header Skeleton */}
      <header className="sticky top-0 z-50 bg-white/95 border-b border-slate-200/90 shadow-[0_1px_3px_rgba(15,35,66,0.06)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 rounded-md bg-slate-200 animate-pulse" />
              <div className="h-2.5 w-32 rounded bg-slate-100 animate-pulse hidden sm:block" />
            </div>
          </div>
          <div className="h-8 w-24 rounded-lg bg-slate-200/80 animate-pulse" />
        </div>
      </header>

      {/* Main Portal Shell Skeleton */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col md:flex-row overflow-hidden border-x border-[#cbd5e1]/40 shadow-[0_1px_3px_rgba(15,35,66,0.06)] bg-white min-h-[calc(100dvh-105px)]">
        {/* Sidebar Skeleton */}
        <aside className="w-full md:w-[270px] lg:w-[290px] shrink-0 border-b md:border-b-0 md:border-r border-[#e2e8f0] bg-[#f8fafc] p-5 space-y-5">
          <div className="space-y-2">
            <div className="h-3 w-20 rounded bg-blue-100 animate-pulse" />
            <div className="h-5 w-40 rounded-md bg-slate-200 animate-pulse" />
          </div>
          <div className="space-y-2.5 pt-2">
            <div className="h-10 w-full rounded-xl bg-blue-100/80 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-slate-200/70 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-slate-200/70 animate-pulse" />
            <div className="h-10 w-full rounded-xl bg-slate-200/70 animate-pulse" />
          </div>
        </aside>

        {/* Content Area Skeleton */}
        <div className="flex-1 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="h-3 w-36 rounded bg-slate-200 animate-pulse" />
            <div className="h-7 w-64 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-4 w-80 max-w-full rounded bg-slate-100 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-24 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4 space-y-2.5">
              <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-6 w-28 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="h-24 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4 space-y-2.5">
              <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
              <div className="h-6 w-24 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="h-24 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4 space-y-2.5">
              <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-6 w-32 rounded bg-slate-200 animate-pulse" />
            </div>
          </div>

          <div className="bg-white border border-[#dce5f0] rounded-[16px] p-6 shadow-[0_1px_3px_rgba(15,35,66,0.06)] space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="h-5 w-44 rounded bg-slate-200 animate-pulse" />
              <div className="h-8 w-28 rounded-lg bg-blue-100/80 animate-pulse" />
            </div>
            <div className="space-y-3 pt-2">
              <div className="h-14 w-full rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-14 w-full rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-14 w-full rounded-xl bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="w-full bg-white border-t border-[#e2e8f0] py-3 px-4 flex justify-center">
        <div className="h-3.5 w-64 rounded bg-slate-200/70 animate-pulse" />
      </footer>
    </div>
  );
}
