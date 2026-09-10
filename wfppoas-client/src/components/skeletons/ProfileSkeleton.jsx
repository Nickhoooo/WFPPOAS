export default function ProfileSkeleton() {
  return <div role="status" aria-label="Loading profile" className="mx-auto max-w-5xl space-y-6 animate-pulse motion-reduce:animate-none">
    <div className="h-8 w-44 rounded bg-slate-200" />
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-8"><div className="mx-auto h-28 w-28 rounded-full bg-slate-200" /><div className="mt-6 h-5 rounded bg-slate-100" /><div className="mt-3 h-4 rounded bg-slate-100" /></div>
      <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">{Array.from({length: 4}, (_, index) => <div key={index}><div className="mb-2 h-3 w-24 rounded bg-slate-200" /><div className="h-11 rounded-lg bg-slate-100" /></div>)}<div className="ml-auto h-10 w-32 rounded-lg bg-slate-200" /></div>
    </div><span className="sr-only">Loading profile…</span>
  </div>;
}
