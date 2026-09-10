import { ArrowLeft, ArrowUpRight, Pencil, Trash2, MapPin, CalendarDays, Wallet, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import TeamMemberSection from './TeamMemberSection';
import { getCurrentUser } from '../../services/api';
import { canManageProject } from '../../utils/projectPermissions';
import { ProjectTeamSkeleton } from '../../components/skeletons/ProjectsPageSkeleton';

export default function ProjectDetail({ project, teamMembers, teamLoading, busy, onBack, onEdit, onDelete, onAddTeamMember, onRemoveTeamMember, error, onErrorClear }) {
  const user = getCurrentUser();
  const canManage = canManageProject(user, project);
  const date = value => value ? new Date(value.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-PH', {month:'short', day:'numeric', year:'numeric'}) : 'Not set';
  const details = [
    [MapPin, 'Location', project.location || 'Not set'],
    [UserRound, 'Project manager', project.manager?.name || 'Not available'],
    [Wallet, 'Budget', project.budget != null && project.budget !== '' ? new Intl.NumberFormat('en-PH', {style:'currency', currency:'PHP'}).format(Number(project.budget)) : 'Not set'],
    [CalendarDays, 'Start date', date(project.start_date)],
    [CalendarDays, 'End date', date(project.end_date)],
  ];
  return <div className="space-y-6">
    <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"><ArrowLeft size={16} />All projects</button>
    <header className="flex flex-wrap items-start justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="min-w-0"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">{project.status}</span><h1 className="mt-4 break-words text-2xl font-semibold text-slate-900">{project.project_name}</h1><p className="mt-2 text-sm text-slate-500">{project.client_name}</p></div>
      {canManage && <div className="flex gap-2"><button disabled={busy} onClick={onEdit} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm disabled:opacity-50"><Pencil size={15} />Edit project</button><button disabled={busy} onClick={onDelete} aria-label="Delete project" className="rounded-xl border border-red-200 px-3 text-red-600 disabled:opacity-50"><Trash2 size={17} /></button></div>}
    </header>
    {!canManage && <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">Read-only access. The project manager or an admin can manage this project.</p>}
    {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}<button onClick={onErrorClear} className="ml-3 underline">Dismiss</button></div>}
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold text-slate-900">Project overview</h2><div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{details.map(([Icon, title, value]) => <div key={title} className="flex gap-3"><Icon size={18} className="mt-1 shrink-0 text-slate-400" /><div><p className="text-xs text-slate-500">{title}</p><p className="mt-1 break-words text-sm font-medium text-slate-800">{value}</p></div></div>)}</div><div className="mt-6 border-t border-slate-100 pt-5"><p className="text-xs text-slate-500">Description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{project.description || 'No description added yet.'}</p></div></section>
    {teamLoading ? <ProjectTeamSkeleton /> : <TeamMemberSection key={project.id} projectId={project.id} managerId={project.manager_id} canManage={canManage} busy={busy} teamMembers={teamMembers} onAddMember={onAddTeamMember} onRemoveMember={onRemoveTeamMember} />}
    <Link to={`/${user.role}/tasks?project=${project.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-400"><div><h2 className="font-semibold text-slate-900">Project tasks</h2><p className="mt-1 text-sm text-slate-500">View assignments, submissions, and progress.</p></div><ArrowUpRight size={20} /></Link>
  </div>;
}
