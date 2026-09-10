import Skeleton from './Skeleton';
export default function TaskCardsSkeleton() {
  return <div role="status" aria-label="Loading tasks" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{[0,1,2].map(i => <div key={i} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-6 w-24 rounded-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-2 w-full" /><Skeleton className="h-10 w-full" /></div>)}</div>;
}
