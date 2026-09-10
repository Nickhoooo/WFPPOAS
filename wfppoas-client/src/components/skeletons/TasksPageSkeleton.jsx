import Skeleton from './Skeleton';
import TaskCardsSkeleton from './TaskCardsSkeleton';
export default function TasksPageSkeleton() {
  return <div role="status" aria-label="Loading tasks page" className="space-y-6"><div className="flex flex-wrap justify-between gap-4"><div><Skeleton className="h-8 w-32" /><Skeleton className="mt-3 h-4 w-64 max-w-full" /></div><Skeleton className="h-11 w-32" /></div><div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"><Skeleton className="h-4 w-24" /><Skeleton className="h-11 w-full" /></div><div className="space-y-3 rounded-xl border border-slate-200 bg-white p-6"><Skeleton className="h-6 w-64 max-w-full" /><Skeleton className="h-4 w-40" /></div><div className="flex gap-4"><Skeleton className="h-11 flex-1" /><Skeleton className="h-11 w-32" /></div><TaskCardsSkeleton /></div>;
}
