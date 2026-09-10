import Skeleton from './Skeleton';

export function ProjectCardsSkeleton() {
  return <div role="status" aria-label="Loading projects" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({length: 6}, (_, i) => <div key={i} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6"><Skeleton className="h-5 w-24" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-10 w-full" /></div>)}</div>;
}
export function ProjectTeamSkeleton() {
  return <div role="status" aria-label="Loading project team" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6"><Skeleton className="mb-5 h-5 w-32" />{[0,1,2].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>;
}
export default function ProjectsPageSkeleton() {
  return <div className="space-y-6"><Skeleton className="h-8 w-44" /><Skeleton className="h-4 w-72 max-w-full" /><Skeleton className="h-24 w-full" /><ProjectCardsSkeleton /></div>;
}
