import Skeleton from './Skeleton';
export function UserDetailsSkeleton() {
  return <div role="status" aria-label="Loading user details" className="space-y-6 p-6"><Skeleton className="h-20 w-20 rounded-full" /><Skeleton className="h-6 w-48" /><div className="grid gap-4 sm:grid-cols-2">{[0,1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div></div>;
}
export default function UsersSkeleton() {
  return <div role="status" aria-label="Loading users" className="space-y-6"><Skeleton className="h-8 w-40" /><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0,1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div><Skeleton className="h-16 w-full" /><div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">{[0,1,2,3,4].map(i => <Skeleton key={i} className="h-56 w-full md:h-14" />)}</div></div>;
}

