function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`}
    />
  );
}

function MilestonesPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-8 w-32" />
        </div>

        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      {/* Project Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />

          <div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-4 w-36" />
          </div>
        </div>

        <Skeleton className="mt-4 h-11 w-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-4 h-8 w-12" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>

      {/* Roadmap */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Section Header */}
        <div className="border-b border-slate-100 p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-3 w-44" />
        </div>

        {/* Milestone Cards */}
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>

              <Skeleton className="mt-5 h-3 w-16" />

              <Skeleton className="mt-2 h-5 w-40" />

              <div className="mt-4 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <Skeleton className="h-8 w-14 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MilestonesPageSkeleton;