import { ArrowUpRight, MapPin, UserRound } from 'lucide-react';
export default function ProjectCard({ project, isSelected, onClick }) {
  const colors = {ongoing: 'bg-emerald-50 text-emerald-700', 'on-hold': 'bg-amber-50 text-amber-700', completed: 'bg-blue-50 text-blue-700'};
  return <button onClick={onClick} className={`group flex min-w-0 flex-col rounded-2xl border bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-slate-500 ${isSelected ? 'border-slate-500' : 'border-slate-200'}`}>
    <div className="flex w-full items-center justify-between"><span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${colors[project.status] || 'bg-slate-100 text-slate-600'}`}>{project.status || 'Unknown'}</span><ArrowUpRight size={18} className="text-slate-400 group-hover:text-slate-900" /></div>
    <h3 className="mt-5 break-words text-lg font-semibold text-slate-900">{project.project_name || 'Untitled project'}</h3><p className="mt-1 text-sm text-slate-500">{project.client_name || 'No client specified'}</p>
    <p className="mt-5 flex items-center gap-2 text-sm text-slate-500"><MapPin size={15} className="shrink-0" /><span className="line-clamp-1">{project.location || 'Location not set'}</span></p>
    <div className="mt-5 flex w-full items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500"><UserRound size={15} />{project.manager?.name || 'Manager not available'}</div>
  </button>;
}
