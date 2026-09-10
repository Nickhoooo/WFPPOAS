import { useEffect, useRef, useState } from "react";
import { Compass, X } from "lucide-react";

export default function GuidedTour({ userId, role }) {
  const storageKey = 'wfppoas-tour-v1-' + userId + '-' + role;
  const [open, setOpen] = useState(() => {
    if (!userId) return false;
    try { return !localStorage.getItem(storageKey); } catch { return true; }
  });
  const [index, setIndex] = useState(0);
  const [box, setBox] = useState(null);
  const dialog = useRef(null);
  const next = useRef(null);
  const steps = [
    { title: 'Welcome to WFPPOAS', text: 'Let?s take a quick look around your workspace. You can skip this tour and replay it anytime from Settings.' },
    ...(role === 'admin' ? [{ target: 'nav-users', title: 'Manage your workforce', text: 'Open Users to invite people and manage their accounts and roles.' }] : []),
    role === 'employee'
      ? { target: 'nav-team', title: 'Your project teams', text: 'Open My Team to see your assigned projects, project managers, and teammates.' }
      : { target: 'nav-projects', title: 'Your projects', text: role === 'manager' ? 'Open Projects to create a project, build your team, and manage the projects you own.' : 'Open Projects to oversee projects and their teams across the system.' },
    { target: 'nav-tasks', title: role === 'employee' ? 'Your assigned tasks' : 'Manage tasks', text: role === 'employee' ? 'Open My Tasks to update progress and submit your work for manager review.' : 'Open Tasks to organize assignments and review submitted work. Managers manage tasks under their own projects.' },
    { target: 'nav-documents', title: 'Project documents', text: 'Open Documents to find and upload files for projects you have access to.' },
    { target: 'search', title: 'Find a project quickly', text: 'Use the search button in the header. Type at least two characters, then choose a project to open it.' },
    { target: 'notifications', title: 'Stay updated', text: 'The bell shows your notifications. Open a notification to follow the related update.' },
    { title: 'You?re ready!', text: 'Explore your workspace at your own pace. Need another walkthrough? Open Settings and choose Replay tour.' },
  ];
  const step = steps[index];
  const target = step.target;

  useEffect(() => {
    const replay = () => { setIndex(0); setOpen(true); };
    window.addEventListener('wfppoas-replay-tour', replay);
    return () => window.removeEventListener('wfppoas-replay-tour', replay);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    dialog.current?.showModal();
    return () => { dialog.current?.close(); if (previous?.isConnected) previous.focus(); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    next.current?.focus();
    const measure = () => {
      const mobile = window.innerWidth < 1024;
      const key = mobile && target?.startsWith('nav-') ? 'navigation' : target;
      const element = key && [...document.querySelectorAll('[data-tour="' + key + '"]')].find(item => item.getClientRects().length);
      if (!element) { setBox(null); return; }
      const rect = element.getBoundingClientRect();
      setBox({ left: Math.max(4, rect.left - 5), top: Math.max(4, rect.top - 5), width: Math.min(rect.width + 10, window.innerWidth - 8), height: rect.height + 10 });
    };
    const key = window.innerWidth < 1024 && target?.startsWith('nav-') ? 'navigation' : target;
    const element = key && [...document.querySelectorAll('[data-tour="' + key + '"]')].find(item => item.getClientRects().length);
    element?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [open, target]);

  function finish() {
    try { localStorage.setItem(storageKey, 'done'); } catch { /* Tour still closes if browser storage is unavailable. */ }
    setOpen(false);
  }

  return <dialog ref={dialog} onCancel={event => { event.preventDefault(); finish(); }} aria-labelledby="tour-title" aria-describedby="tour-description"
    className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 backdrop:bg-transparent">
    {open && <>
      {box ? <div aria-hidden="true" className="pointer-events-none fixed rounded-xl border-2 border-amber-400" style={{ ...box, boxShadow: '0 0 0 9999px rgb(15 23 42 / 0.72)' }} /> : <div aria-hidden="true" className="fixed inset-0 bg-slate-900/75" />}
      <section className="fixed bottom-4 left-4 right-4 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-2xl sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-96 sm:-translate-y-1/2 sm:-translate-x-1/2 sm:p-6">
        <div className="mb-4 flex items-center justify-between"><span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><Compass size={18} className="text-amber-500" />Quick tour</span><button type="button" aria-label="Skip tour" onClick={finish} className="rounded-lg p-2 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-500"><X size={18} /></button></div>
        <div aria-live="polite" aria-atomic="true"><p className="mb-2 text-xs text-slate-500">Step {index + 1} of {steps.length}</p><h2 id="tour-title" className="text-xl font-bold">{step.title}</h2><p id="tour-description" className="mt-3 text-sm leading-6 text-slate-600">{step.text}</p></div>
        {target?.startsWith('nav-') && <p className="mt-3 text-xs text-slate-500 lg:hidden">On mobile, open the highlighted menu button to find this page after the tour.</p>}
        <div className="mt-6 flex items-center justify-between gap-2"><button type="button" onClick={finish} className="rounded-lg px-2 py-2 text-sm text-slate-500 hover:bg-slate-100">Skip tour</button><div className="flex gap-2">{index > 0 && <button type="button" onClick={() => setIndex(value => value - 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">Back</button>}<button ref={next} type="button" onClick={() => index === steps.length - 1 ? finish() : setIndex(value => value + 1)} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500">{index === steps.length - 1 ? 'Finish' : index === 0 ? 'Let?s start' : 'Next ?'}</button></div></div>
      </section>
    </>}
  </dialog>;
}
