import Skeleton from "./Skeleton";

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-96 max-w-full" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-3 h-8 w-16" />
                <Skeleton className="mt-2 h-3 w-28" />
              </div>

              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Overview */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Project Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-3 w-48" />

          <div className="mt-6 space-y-5">
            {[1, 2, 3].map((item) => (
              <div key={item}>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="mt-2 h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-3 w-44" />

          <div className="mt-6 space-y-5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Projects */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-2 h-3 w-44" />
          </div>

          <div className="p-6 space-y-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-3 w-48" />
          </div>

          <div className="p-6 space-y-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardSkeleton;