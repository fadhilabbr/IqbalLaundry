export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[100dvh] flex flex-col bg-[#f5f8fc] pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"
    >
      <span className="sr-only">Memuat halaman Iqbal Laundry...</span>

      {/* Main Portal Shell Skeleton */}
      <main className="flex-1 w-full flex flex-col md:flex-row md:items-start bg-[#f5f8fc]">
        {/* Sidebar Skeleton */}
        <aside className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-[#e2e8f0] px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:sticky md:top-0 md:bottom-auto md:left-auto md:right-auto md:z-20 w-full md:w-60 md:h-[100dvh] md:overflow-y-auto shrink-0 md:border-t-0 md:border-r md:bg-white md:p-4 md:pt-6 md:flex md:flex-col md:gap-4">
          <div className="hidden md:flex items-center gap-2.5 pb-3 border-b border-[#e2e8f0]">
            <div className="w-8 h-8 rounded-lg bg-blue-100 animate-pulse shrink-0" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
              <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 md:flex md:flex-col md:gap-2">
            <div className="h-11 w-full rounded-lg bg-blue-100/80 animate-pulse" />
            <div className="h-11 w-full rounded-lg bg-slate-200/70 animate-pulse" />
            <div className="h-11 w-full rounded-lg bg-slate-200/70 animate-pulse" />
            <div className="h-11 w-full rounded-lg bg-slate-200/70 md:hidden animate-pulse" />
          </div>
          <div className="hidden md:block mt-auto pt-3 border-t border-[#e2e8f0]">
            <div className="h-10 w-full rounded-lg bg-blue-100/80 animate-pulse" />
          </div>
        </aside>

        {/* Content Area Skeleton */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="space-y-2">
            <div className="h-7 w-64 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-4 w-80 max-w-full rounded bg-slate-100 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-24 rounded-xl border border-[#e2e8f0] bg-white p-4 space-y-2.5">
              <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-6 w-28 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="h-24 rounded-xl border border-[#e2e8f0] bg-white p-4 space-y-2.5">
              <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
              <div className="h-6 w-24 rounded bg-slate-200 animate-pulse" />
            </div>
            <div className="h-24 rounded-xl border border-[#e2e8f0] bg-white p-4 space-y-2.5">
              <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
              <div className="h-6 w-32 rounded bg-slate-200 animate-pulse" />
            </div>
          </div>

          <div className="bg-white border border-[#dce5f0] rounded-2xl p-4 sm:p-6 shadow-[0_1px_3px_rgba(15,35,66,0.06)] space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="h-5 w-44 rounded bg-slate-200 animate-pulse" />
              <div className="h-9 w-28 rounded-lg bg-blue-100/80 animate-pulse" />
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
      <footer className="md:hidden w-full bg-white border-t border-[#e2e8f0] py-4 px-4 flex justify-center">
        <div className="h-3.5 w-64 rounded bg-slate-200/70 animate-pulse" />
      </footer>
    </div>
  );
}
