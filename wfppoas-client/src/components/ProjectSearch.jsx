import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, LoaderCircle } from "lucide-react";
import { projectService } from "../services/api";

export default function ProjectSearch({ role }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState(-1);
  const root = useRef(null);
  const input = useRef(null);
  const trigger = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || query.trim().length < 2) return;
    let cancelled = false;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await projectService.search(query.trim(), controller.signal);
        if (!cancelled) setResults(response.data || []);
      } catch (err) {
        if (!cancelled && err.code !== "ERR_CANCELED") setError("Unable to search. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); controller.abort(); };
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const outside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  const changeQuery = (value) => {
    setQuery(value);
    setResults([]);
    setActive(-1);
    setError("");
    setLoading(value.trim().length >= 2);
  };
  const close = () => { setOpen(false); trigger.current?.focus(); };
  const select = (project) => {
    setOpen(false);
    changeQuery("");
    navigate(role === "employee"
      ? `/employee/team?project=${project.id}`
      : `/${role}/projects?project=${project.id}`);
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(); }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActive(previous => results.length ? (previous + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length : -1);
    }
    if (event.key === "Enter" && results[active]) { event.preventDefault(); select(results[active]); }
  };

  return (
    <div ref={root} className="relative" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button ref={trigger} type="button" data-tour="search" aria-label="Search projects" aria-expanded={open}
        aria-controls="header-project-search" onClick={() => { changeQuery(""); setOpen(!open); }}
        className="flex h-10 w-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-500 xl:w-64">
        <Search size={18} className="shrink-0" />
        <span className="hidden text-sm xl:inline">Search projects...</span>
      </button>
      {open && (
        <div id="header-project-search" className="fixed left-3 right-3 top-20 z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:w-80">
          <div className="flex items-center gap-2 border-b border-slate-100 p-3">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input ref={input} value={query} onChange={event => changeQuery(event.target.value)} onKeyDown={onKeyDown}
              type="text" role="combobox" aria-label="Search projects" aria-autocomplete="list" aria-expanded={open}
              aria-controls="project-search-results" aria-activedescendant={active >= 0 ? `project-result-${results[active]?.id}` : undefined}
              maxLength={100} placeholder="Search projects..." className="min-w-0 flex-1 bg-transparent py-1 text-base text-slate-800 outline-none sm:text-sm" />
            {query && <button type="button" aria-label="Clear search" onClick={() => { changeQuery(""); input.current?.focus(); }} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={16} /></button>}
            <button type="button" onClick={close} className="rounded-lg px-2 py-2 text-xs text-slate-600 hover:bg-slate-100">Close</button>
          </div>
          <div role="status" className="text-sm text-slate-500">
            {query.trim().length < 2 ? <p className="p-4">Type at least 2 characters to find a project.</p>
              : loading ? <p className="flex items-center gap-2 p-4"><LoaderCircle size={16} className="animate-spin" />Searching...</p>
              : error ? <p className="p-4 text-red-600">{error}</p>
              : results.length === 0 ? <p className="p-4">No projects found.</p> : null}
          </div>
          <ul id="project-search-results" role="listbox" aria-label="Projects" className="max-h-[min(60dvh,24rem)] overflow-y-auto">
            {results.map((project, index) => (
              <li key={project.id} id={`project-result-${project.id}`} role="option" aria-selected={active === index}
                onMouseDown={event => event.preventDefault()} onClick={() => select(project)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-3 ${active === index ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                <span className="min-w-0 break-words text-sm font-medium text-slate-800">{project.project_name}</span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs capitalize text-slate-600">{project.status || "ongoing"}</span>
              </li>
            ))}
          </ul>
          {results.length > 0 && <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-500">Up to 8 matches. Type more to narrow your search.</p>}
        </div>
      )}
    </div>
  );
}
