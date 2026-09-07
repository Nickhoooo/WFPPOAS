function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`}
    />
  );
}

function ManagerDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-52" />
        </div>

        <Skeleton className="mt-2 h-4 w-96" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>

            <Skeleton className="mt-4 h-8 w-14" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Performance */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-2 h-3 w-56" />
          </div>

          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>

        <Skeleton className="mt-5 h-2.5 w-full rounded-full" />

        <div className="mt-3 flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-3 w-52" />

          <div className="mt-6 space-y-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item}>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>

                <Skeleton className="mt-2 h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-3 w-48" />

          <div className="mt-5 space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />

                <div className="flex-1">
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboardSkeleton;