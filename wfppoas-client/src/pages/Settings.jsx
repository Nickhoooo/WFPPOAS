import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor, LockKeyhole, UserRound } from 'lucide-react';
import apiClient from '../services/api';
import { getTheme, setTheme } from '../theme';
import SettingsSkeleton from '../components/skeletons/SettingsSkeleton';

export default function Settings() {
  const [theme, updateTheme] = useState(getTheme);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accountError, setAccountError] = useState('');
  const [retry, setRetry] = useState(0);
  const [form, setForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    const sync = () => updateTheme(getTheme());
    window.addEventListener('theme-changed', sync);
    return () => window.removeEventListener('theme-changed', sync);
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true); setAccountError('');
    apiClient.get('/me/account').then(({ data }) => { if (active) setAccount(data); })
      .catch(() => { if (active) setAccountError('Unable to load account information.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  async function changePassword(event) {
    event.preventDefault(); setError('');
    if (form.password !== form.password_confirmation) { setError('New passwords must match.'); return; }
    setSaving(true);
    try {
      const { data } = await apiClient.post('/me/password', form);
      localStorage.removeItem('token'); localStorage.removeItem('user');
      setForm({ current_password: '', password: '', password_confirmation: '' });
      setSuccess(data.message);
    } catch (err) {
      setError(Object.values(err.response?.data?.errors || {}).flat().join(' ') || err.response?.data?.message || 'Unable to change password. Please try again.');
    } finally { setSaving(false); }
  }
  const card = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm';
  return <div className="mx-auto max-w-4xl space-y-6">
    <div><h1 className="text-2xl font-bold text-slate-900">Settings</h1><p className="mt-1 text-slate-500">Manage your appearance and account security.</p></div>
    <section className={card}><h2 className="text-lg font-semibold">Getting started</h2><p className="mt-1 text-sm text-slate-500">Take a quick tour of your workspace.</p><button type="button" onClick={() => window.dispatchEvent(new Event("wfppoas-replay-tour"))} className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Replay tour</button></section>
    <section className={card}><h2 className="text-lg font-semibold">Appearance</h2><p className="mt-1 text-sm text-slate-500">Default: System. Your choice is saved in this browser and applies to every account using it.</p>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">{[['light', Sun, 'Light'], ['dark', Moon, 'Dark'], ['system', Monitor, 'System']].map(([value, Icon, label]) => <button key={value} type="button" aria-pressed={theme === value} onClick={() => setTheme(value)} className={`flex items-center justify-center gap-3 rounded-xl border p-4 font-medium ${theme === value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}><Icon size={20} />{label}</button>)}</div>
    </section>
    <section className={card}><h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><UserRound size={20} />Account information</h2>
      {loading ? <SettingsSkeleton /> : accountError ? <div role="alert">{accountError}<button className="ml-3 underline" onClick={() => setRetry(value => value + 1)}>Retry</button></div> : <dl className="grid gap-4 sm:grid-cols-3">{['email', 'role', 'status'].map(field => <div key={field}><dt className="text-sm capitalize text-slate-500">{field}</dt><dd className="mt-1 break-words font-medium">{account?.[field] || 'Not available'}</dd></div>)}</dl>}
    </section>
    <section className={card}><h2 className="flex items-center gap-2 text-lg font-semibold"><LockKeyhole size={20} />Change password</h2><p className="mt-1 text-sm text-slate-500">Use at least 8 characters. Changing your password signs you out on all devices. Administrators receive a notification.</p>
      {success ? <div className="mt-5" role="status"><p>{success}</p><a className="mt-3 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white" href="/">Back to sign in</a></div> : <form onSubmit={changePassword} className="mt-5 space-y-4">
        {Object.entries({ current_password: 'Current password', password: 'New password', password_confirmation: 'Confirm new password' }).map(([field, label]) => <div key={field}><label className="mb-1 block text-sm font-medium" htmlFor={field}>{label}</label><input id={field} type="password" autoComplete={field === 'current_password' ? 'current-password' : 'new-password'} required minLength={field === 'current_password' ? undefined : 8} disabled={saving} value={form[field]} onChange={event => setForm({ ...form, [field]: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-blue-500 disabled:opacity-50" /></div>)}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}<button disabled={saving} className="rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white disabled:opacity-50">{saving ? 'Updating…' : 'Update password'}</button>
      </form>}
    </section>
  </div>;
}
