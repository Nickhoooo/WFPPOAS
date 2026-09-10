import { useEffect, useRef, useState } from "react";
import { Camera, Save } from "lucide-react";
import apiClient, { getCurrentUser } from "../services/api";
import ProfileAvatar from "../components/ProfileAvatar";
import ProfileSkeleton from "../components/skeletons/ProfileSkeleton";

const roleFields = {
  admin: ['position', 'department', 'office_number'],
  manager: ['position', 'department', 'team_name', 'office_number'],
  employee: ['prc_license_no', 'specialization', 'years_of_experience'],
};
const label = (key) => key === 'prc_license_no' ? 'PRC license number' : key.replaceAll('_', ' ');
export default function Profile() {
  const user = getCurrentUser();
  const fields = [...(roleFields[user?.role] || []), 'contact_number'];
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const input = useRef(null);
  const load = async () => {
    setLoading(true); setFailed(false); setError('');
    try { setForm((await apiClient.get('/me/profile')).data); }
    catch { setFailed(true); setError('Hindi ma-load ang profile. Pakisubukan ulit.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  const choose = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2097152) {
      setError('Choose a JPG, PNG or WebP image up to 2 MB.'); event.target.value = ''; return;
    }
    setError(''); setMessage(''); setPhoto(file);
  };
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    const payload = new FormData();
    fields.forEach(key => payload.append(key, form[key] ?? ''));
    if (photo) payload.append('photo', photo);
    try {
      setForm((await apiClient.post('/me/profile', payload, {headers: {'Content-Type': 'multipart/form-data'}})).data);
      window.dispatchEvent(new Event('profile-updated'));
      setPhoto(null); setPreview(''); if (input.current) input.current.value = '';
      setMessage('Profile saved successfully.');
    } catch (err) { setError(Object.values(err.response?.data?.errors || {}).flat().join(' ') || err.response?.data?.message || 'Unable to save profile.'); }
    finally { setSaving(false); }
  };
  if (loading) return <ProfileSkeleton />;
  return <div className="mx-auto max-w-5xl space-y-6">
    <header><p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Account</p><h1 className="mt-2 text-2xl font-semibold text-slate-900">My profile</h1><p className="mt-2 text-sm text-slate-500">Keep your professional details and profile photo up to date.</p></header>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}{failed && <button onClick={load} className="ml-3 underline">Retry</button>}</div>}
    {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}
    <form onSubmit={save} className="grid items-start gap-6 md:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <ProfileAvatar preview={preview} className="mx-auto h-28 w-28 ring-4 ring-slate-50" />
        <h2 className="mt-5 break-words text-lg font-semibold text-slate-900">{user?.name}</h2><p className="mt-1 break-all text-sm text-slate-500">{user?.email}</p>
        <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">{user?.role}</span>
        <input ref={input} type="file" aria-label="Profile photo" accept="image/jpeg,image/png,image/webp" onChange={choose} disabled={saving || failed} className="sr-only" />
        <button type="button" onClick={() => input.current?.click()} disabled={saving || failed} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Camera size={16} />Change photo</button>
        <p className="mt-3 text-xs leading-5 text-slate-400">JPG, PNG or WebP · Up to 2 MB<br />Save changes to apply your photo.</p>
        {photo && <p className="mt-2 truncate text-xs text-slate-500">Selected: {photo.name}</p>}
      </aside>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6"><h2 className="font-semibold text-slate-900">Professional information</h2><p className="mt-1 text-sm text-slate-500">Details for your role in the team.</p></div>
        <fieldset disabled={saving || failed} className="grid gap-5 p-6 sm:grid-cols-2">
          {fields.map(key => <div key={key}><label htmlFor={key} className="mb-2 block text-sm font-medium capitalize text-slate-700">{label(key)}</label><input id={key} type={key === 'years_of_experience' ? 'number' : key === 'contact_number' ? 'tel' : 'text'} min={key === 'years_of_experience' ? 0 : undefined} max={key === 'years_of_experience' ? 100 : undefined} value={form[key] ?? ''} onChange={event => setForm({...form, [key]: event.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-100 disabled:opacity-60" /></div>)}
        </fieldset>
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 p-6"><p className="text-xs text-slate-500">Name and role are managed by your admin.</p><button disabled={saving || failed} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"><Save size={16} />{saving ? 'Saving…' : 'Save changes'}</button></footer>
      </section>
    </form>
  </div>;
}
