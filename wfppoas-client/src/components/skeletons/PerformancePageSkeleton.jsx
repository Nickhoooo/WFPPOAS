import Skeleton from './Skeleton';

export function PerformanceMetricsSkeleton() {
  return <div role="status" aria-label="Loading performance metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0,1,2].map(i => <div key={i} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"><Skeleton className="h-4 w-32 max-w-full" /><Skeleton className="h-8 w-24" /><Skeleton className="h-4 w-3/4" /></div>)}</div>;
}
export function PerformanceHistorySkeleton() {
  return <div role="status" aria-label="Loading performance records" className="space-y-4 p-6">{[0,1,2,3].map(i => <div key={i} className="flex gap-4"><Skeleton className="h-10 flex-1" /><Skeleton className="h-10 flex-1" /><Skeleton className="h-10 flex-1" /></div>)}</div>;
}
export default function PerformancePageSkeleton() {
  return <div role="status" aria-label="Loading performance page" className="space-y-8"><div><Skeleton className="h-8 w-44" /><Skeleton className="mt-3 h-4 w-80 max-w-full" /></div><PerformanceMetricsSkeleton /><div className="rounded-xl border border-slate-200 bg-white"><Skeleton className="m-6 h-5 w-40" /><PerformanceHistorySkeleton /></div><div className="space-y-4"><Skeleton className="h-5 w-48" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-80 max-w-full" /></div></div>;
}
