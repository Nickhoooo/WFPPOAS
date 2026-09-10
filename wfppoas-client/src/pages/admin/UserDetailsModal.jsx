import { useEffect, useRef, useState } from 'react';
import { X, UserRound, Mail, ShieldCheck, CalendarDays, BriefcaseBusiness, Phone } from 'lucide-react';
import apiClient from '../../services/api';
import { UserDetailsSkeleton } from '../../components/skeletons/UsersSkeleton';

export default function UserDetailsModal({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState('');
  const [retry, setRetry] = useState(0);
  const closeButton = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    closeButton.current?.focus();
    const onKey = event => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [onClose]);
  useEffect(() => {
    let active = true;
    let url;
    const load = async () => {
      setLoading(true); setError(''); setUser(null); setPhoto('');
      try {
        const {data} = await apiClient.get(`/users/${userId}`);
        if (!active) return;
        setUser(data);
        const profile = data[`${data.role}_profile`];
        if (profile?.photo?.startsWith('avatars/')) {
          try {
            const response = await apiClient.get(`/users/${userId}/photo`, {responseType:'blob'});
            if (!active) return;
            url = URL.createObjectURL(response.data); setPhoto(url);
          } catch { /* Preserve user details if the photo is missing. */ }
        }
      } catch (err) { if (active) setError(err.response?.data?.message || 'Unable to load user details.'); }
      finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [userId, retry]);
  const profile = user?.[`${user?.role}_profile`];
  const date = value => value ? new Date(value).toLocaleDateString('en-PH', {month:'short',day:'numeric',year:'numeric'}) : 'Not set';
  return <div role="dialog" aria-modal="true" aria-labelledby="user-details-title" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
    <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
      <header className="flex items-center justify-between border-b border-slate-100 p-6"><h2 id="user-details-title" className="flex items-center gap-2 font-semibold text-slate-900"><UserRound size={19} />User details</h2><button ref={closeButton} onClick={onClose} aria-label="Close user details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button></header>
      {loading ? <UserDetailsSkeleton /> : error ? <div role="alert" className="p-6 text-sm text-red-600">{error}<button onClick={() => setRetry(value => value + 1)} className="ml-3 underline">Retry</button></div> : user && <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-5"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">{photo ? <img src={photo} alt={`${user.name}'s profile`} className="h-full w-full object-cover" /> : <UserRound size={32} className="text-slate-400" />}</div><div className="min-w-0"><h3 className="break-words text-xl font-semibold text-slate-900">{user.name}</h3><p className="mt-1 break-all text-sm text-slate-500">{user.email}</p><p className="mt-2 text-xs capitalize text-slate-600">{user.role} · <span className={user.status === 'active' ? 'text-emerald-700' : 'text-slate-500'}>{user.status}</span></p></div></div>
        <div className="grid gap-4 rounded-xl bg-slate-50 p-5 sm:grid-cols-2">{[[ShieldCheck,'Account ID',user.id],[CalendarDays,'Joined',date(user.created_at)],[CalendarDays,'Account updated',date(user.updated_at)],[Mail,'Email verification',user.email_verified_at ? date(user.email_verified_at) : 'Not verified']].map(([Icon,title,value]) => <div key={title}><p className="flex items-center gap-2 text-xs text-slate-500"><Icon size={14} />{title}</p><p className="mt-1 text-sm font-medium text-slate-800">{value}</p></div>)}</div>
        <section><h4 className="mb-4 flex items-center gap-2 font-semibold text-slate-900"><BriefcaseBusiness size={17} />Professional profile</h4>{!profile ? <p className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">This user has not completed their profile yet.</p> : <div className="grid gap-4 sm:grid-cols-2">{Object.entries(profile).filter(([key]) => !['id','user_id','photo','created_at','updated_at'].includes(key)).map(([key,value]) => <div key={key} className="rounded-xl border border-slate-200 p-4"><p className="flex items-center gap-2 text-xs capitalize text-slate-500">{key === 'contact_number' && <Phone size={13} />}{key === 'prc_license_no' ? 'PRC license number' : key.replaceAll('_',' ')}</p><p className="mt-2 break-words text-sm font-medium text-slate-800">{value === '' || value == null ? 'Not set' : value}</p></div>)}</div>}</section>
      </div>}
    </section>
  </div>;
}
