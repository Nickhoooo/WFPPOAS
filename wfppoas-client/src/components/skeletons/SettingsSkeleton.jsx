export default function SettingsSkeleton() {
  return <div role="status" aria-label="Loading account information" className="animate-pulse space-y-3 motion-reduce:animate-none">
    {[0, 1, 2].map(item => <div key={item} className="h-6 rounded bg-slate-200" />)}
    <span className="sr-only">Loading account information…</span>
  </div>;
}
