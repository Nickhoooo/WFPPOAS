function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`}
    />
  );
}


function TasksPageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>

        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* Project selector */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />

          <div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
        </div>

        <Skeleton className="mt-4 h-11 w-full rounded-lg" />
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>

            <Skeleton className="mt-4 h-8 w-12" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Tasks */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-16" />
              <Skeleton className="mt-2 h-3 w-28" />
            </div>

            <Skeleton className="h-10 w-72 rounded-lg" />
          </div>

          <div className="mt-5 flex gap-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <Skeleton
                key={item}
                className="h-9 w-20 rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* Task cards */}
        <div className="space-y-3 p-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="mt-2 h-4 w-80" />
                </div>

                <Skeleton className="h-6 w-24 rounded-full" />
              </div>

              <div className="mt-5 flex gap-5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} export default TasksPageSkeleton;
