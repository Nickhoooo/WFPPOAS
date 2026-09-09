import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { authService } from "../services/api";
import ArchitectBlueprint from "../components/ArchitectBlueprint";

/* ── Config ─────────────────────────────────────────────── */
const ROLE_ROUTES = {
  admin: "/admin/dashboard",
  manager: "/manager/dashboard",
  employee: "/employee/dashboard",
};

/* ── Icons ──────────────────────────────────────────────── */
const MailIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

const LockIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 1 1 8 0v4" />
  </svg>
);

const EyeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-7-11-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
  </svg>
);

const AlertIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ArrowRightIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
  </svg>
);

/* ── Component ──────────────────────────────────────────── */
function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetForm, setResetForm] = useState({
    password: "",
    password_confirmation: "",
  });
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();

  const aboutRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  /* Prefill remembered email + smart focus */
  useEffect(() => {
    const saved = localStorage.getItem("remembered_email");
    if (saved) {
      setForm((f) => ({ ...f, email: saved }));
      setRememberEmail(true);
      passwordRef.current?.focus();
    } else {
      emailRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (token && email) {
      setResetToken(token);
      setResetEmail(email);
      setAuthView("reset");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!showAbout) return;
    const onClick = (e) =>
      aboutRef.current && !aboutRef.current.contains(e.target) && setShowAbout(false);
    const onKey = (e) => e.key === "Escape" && setShowAbout(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showAbout]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const detectCapsLock = (e) => {
    if (typeof e.getModifierState === "function")
      setCapsLockOn(e.getModifierState("CapsLock"));
  };

  const handleForgotPassword = () => {
    setAuthView("forgot");
    setForgotError("");
    setForgotMessage("");
    setError("");
  };

  const handleBackToLogin = () => {
    if (searchParams.get("token") || searchParams.get("email")) {
      setSearchParams({});
    }

    setAuthView("login");
    setForgotError("");
    setForgotMessage("");
    setResetError("");
    setResetMessage("");
    setResetToken("");
    setResetEmail("");
    setResetForm({ password: "", password_confirmation: "" });
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError("");
    setForgotMessage("");

    try {
      const { data } = await authService.forgotPassword(forgotEmail.trim());

      setForgotMessage(data.message);
      setForgotEmail("");
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.email?.[0];
      setForgotError(message || "Hindi ma-send ang reset link. Subukan ulit.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetInput = (e) => {
    setResetForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetMessage("");

    try {
      const { data } = await authService.resetPassword(
        resetEmail,
        resetForm.password,
        resetForm.password_confirmation,
        resetToken
      );

      setResetMessage(data.message);
      setResetForm({ password: "", password_confirmation: "" });

      setTimeout(() => {
        setAuthView("login");
        setResetMessage("");
      }, 1800);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.email?.[0];
      setResetError(message || "Hindi ma-reset ang password. Subukan ulit.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await authService.login(
        form.email.trim(),
        form.password
      );

      const { token, user } = data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (rememberEmail) localStorage.setItem("remembered_email", form.email.trim());
      else localStorage.removeItem("remembered_email");

      window.location.href = ROLE_ROUTES[user.role] || "/employee/dashboard";
    } catch (err) {
      if (!err.response) {
        setError("Hindi makakonekta sa server. Pakisuri ang iyong koneksyon.");
      } else if (err.response.status === 401 || err.response.status === 403) {
        setError("Mali ang email o password. Subukan ulit.");
      } else if (err.response.status === 422) {
        const errs = err.response.data?.errors;
        setError(
          errs ? Object.values(errs)[0][0]
               : err.response.data?.message || "May mali sa inpormasyon."
        );
      } else {
        setError("May problema sa server. Subukan ulit mamaya.");
      }
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 text-sm text-slate-900 " +
    "placeholder:text-slate-400 transition duration-200 " +
    "focus:outline-none focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5";

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { opacity: 0; animation: fadeUp .55s ease-out forwards; }
        @media (prefers-reduced-motion: reduce) { .fade-up { animation: none; opacity: 1; } }
      `}</style>

      <div className="min-h-screen flex bg-gray-50 font-sans">
        {/* ══════════ LEFT — Brand Panel (desktop only) ══════════ */}
        <div className="relative hidden lg:flex flex-col justify-center items-center flex-1
                        overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800
                        text-white px-12 py-16">

          {/* Ambient glows */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

          {/* Blueprint grid */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }} />

          {/* Building illustration */}
          <div className="relative z-10 fade-up" style={{ animationDelay: ".05s" }}>
             <ArchitectBlueprint />
          </div>

          <h1 className="relative z-10 mt-8 text-4xl xl:text-5xl font-bold tracking-tight fade-up text-amber-50"
            style={{ animationDelay: ".15s" }}>
            WFPPOAS<span className="text-amber-400">.</span>
          </h1>

          <p className="relative z-10 mt-3 max-w-sm text-center text-sm leading-relaxed text-slate-300/90 fade-up"
            style={{ animationDelay: ".25s" }}>
            Workforce Performance and Project Operations Analytics System — Architectural Engineering Firms.
          </p>

          <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-2 fade-up"
            style={{ animationDelay: ".35s" }}>
            {["Project Tracking", "Analytics", "Workflow"].map((t) => (
              <span key={t}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                {t}
              </span>
            ))}
          </div>

          {/* About — bottom-right */}
          <div className="absolute bottom-6 right-6 z-20" ref={aboutRef}>
            <button onClick={() => setShowAbout((v) => !v)} aria-expanded={showAbout}
              className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white">
              About the System
              <svg className={`h-4 w-4 transition-transform duration-300 ${showAbout ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>

            <div className={`absolute bottom-10 right-0 w-72 origin-bottom-right rounded-2xl
                            border border-white/10 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-md
                            transition-all duration-200 ${showAbout
                              ? "scale-100 translate-y-0 opacity-100"
                              : "pointer-events-none scale-95 translate-y-2 opacity-0"}`}>
              <h3 className="mb-2 font-semibold text-white">About WFPPOAS</h3>
              <p className="mb-3 text-sm leading-relaxed text-slate-300">
                Designed for Architectural Engineering firms to make it easier to manage their workforce, projects, and tasks.
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
                <li>Project & Milestone Tracking</li>
                <li>Task Assignment & Approval Workflow</li>
                <li>Employee Performance Analytics</li>
                <li>Document Management</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT — Login Form ══════════ */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">

          {/* Compact brand para sa mobile */}
          <div className="fade-up mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 shadow-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                <path d="M3 10l9-7 9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
              </svg>
            </div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">WFPPOAS</p>
          </div>

          <div className="fade-up w-full max-w-sm" style={{ animationDelay: ".1s" }}>
            <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-900/5">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Mag-Login</h2>
              <p className="mt-1 text-sm text-gray-400">I-access ang iyong account</p>

              {error && (
                <div role="alert"
                  className="mb-4 mt-5 flex items-start gap-2.5 rounded-xl border border-red-100
                             bg-red-50 px-3.5 py-3 text-sm text-red-700">
                  <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {authView === "login" && (
                <form onSubmit={handleLogin}>
                  <div className="mt-5">
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <div className="relative">
                      <MailIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px]
                                          -translate-y-1/2 text-slate-400" />
                      <input id="email" name="email" type="email" autoComplete="email" required
                        placeholder="juan@firm.com"
                        ref={emailRef} value={form.email} onChange={handleChange} aria-invalid={!!error}
                        className={`${inputBase} pl-11`} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-slate-700">
                        Password
                      </label>
                      <button type="button" onClick={handleForgotPassword}
                        className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-900">
                        Forgot password
                      </button>
                    </div>
                    <div className="relative">
                      <LockIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px]
                                          -translate-y-1/2 text-slate-400" />
                      <input id="password" name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password" required
                        placeholder="••••••••"
                        ref={passwordRef} value={form.password} onChange={handleChange}
                        onKeyDown={detectCapsLock} onKeyUp={detectCapsLock}
                        aria-invalid={!!error}
                        className={`${inputBase} pl-11 pr-11`} />
                      <button type="button" onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Itago ang password" : "Ipakita ang password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400
                                   transition-colors hover:text-slate-700">
                        {showPassword ? <EyeOffIcon className="h-[18px] w-[18px]" />
                                      : <EyeIcon className="h-[18px] w-[18px]" />}
                      </button>
                    </div>
                    {capsLockOn && !showPassword && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-600">
                        <AlertIcon className="h-3.5 w-3.5" /> Caps Lock is on
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center">
                    <input id="remember" type="checkbox" checked={rememberEmail}
                      onChange={(e) => setRememberEmail(e.target.checked)}
                      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-slate-900" />
                    <label htmlFor="remember"
                      className="ml-2 cursor-pointer select-none text-sm text-slate-600">
                      Remember me
                    </label>
                  </div>

                  <button type="submit" disabled={loading}
                    className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl
                               bg-slate-900 py-3 text-sm font-semibold text-white transition-all duration-200
                               hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.99]
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900
                               focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60">
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Naglo-login...
                      </>
                    ) : (
                      <>
                        Mag-Login
                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {authView === "forgot" && (
                <form onSubmit={handleForgotSubmit}>
                  <div className="mt-5">
                    <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Registered email
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className={`${inputBase} pl-3`}
                      placeholder="juan@firm.com"
                    />
                  </div>

                  {forgotMessage && (
                    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-700">
                      {forgotMessage}
                    </div>
                  )}

                  {forgotError && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                      {forgotError}
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {forgotLoading ? "Sending..." : "Send link"}
                    </button>
                  </div>
                </form>
              )}

              {authView === "reset" && (
                <form onSubmit={handleResetSubmit}>
                  <div className="mt-5">
                    <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                      New password
                    </label>
                    <input
                      id="new-password"
                      name="password"
                      type="password"
                      value={resetForm.password}
                      onChange={handleResetInput}
                      required
                      minLength={8}
                      className={`${inputBase} pl-3`}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Confirm password
                    </label>
                    <input
                      id="confirm-password"
                      name="password_confirmation"
                      type="password"
                      value={resetForm.password_confirmation}
                      onChange={handleResetInput}
                      required
                      minLength={8}
                      className={`${inputBase} pl-3`}
                      placeholder="••••••••"
                    />
                  </div>

                  {resetMessage && (
                    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-700">
                      {resetMessage}
                    </div>
                  )}

                  {resetError && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
                      {resetError}
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      {resetLoading ? "Updating..." : "Update"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} WFPPOAS · All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login