import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const ROLE_FIELDS = {
  admin: [
    { key: "position", label: "Position", type: "text", placeholder: "e.g. Senior Administrator" },
    { key: "department", label: "Department", type: "text", placeholder: "e.g. Operations" },
    { key: "office_number", label: "Office Number", type: "text", placeholder: "e.g. 112" },
    { key: "contact_number", label: "Contact Number", type: "text", placeholder: "e.g. 09171234567" },
    { key: "photo", label: "Photo URL", type: "text", placeholder: "Optional photo URL" },
  ],
  manager: [
    { key: "position", label: "Position", type: "text", placeholder: "e.g. Project Manager" },
    { key: "department", label: "Department", type: "text", placeholder: "e.g. Engineering" },
    { key: "team_name", label: "Team Name", type: "text", placeholder: "e.g. Design Team" },
    { key: "office_number", label: "Office Number", type: "text", placeholder: "e.g. 205" },
    { key: "contact_number", label: "Contact Number", type: "text", placeholder: "e.g. 09171234567" },
    { key: "photo", label: "Photo URL", type: "text", placeholder: "Optional photo URL" },
  ],
  employee: [
    { key: "prc_license_no", label: "PRC License Number", type: "text", placeholder: "e.g. PRC-123456" },
    { key: "specialization", label: "Specialization", type: "text", placeholder: "e.g. Architectural Design" },
    { key: "years_of_experience", label: "Years of Experience", type: "number", placeholder: "5" },
    { key: "contact_number", label: "Contact Number", type: "text", placeholder: "e.g. 09171234567" },
    { key: "photo", label: "Photo URL", type: "text", placeholder: "Optional photo URL" },
  ],
};

function AccountSetup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [profile, setProfile] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link.");
      setLoading(false);
      return;
    }

    axios
      .get(`${API_URL}/invitations/${token}`)
      .then((response) => {
        setName(response.data.name);
        setEmail(response.data.email);
        setRole(response.data.role || "employee");
      })
      .catch(() => setError("This invitation is invalid or expired."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    const payload = {
      password,
      password_confirmation: confirmation,
      ...profile,
    };

    axios
      .post(`${API_URL}/invitations/${token}/setup`, payload)
      .then(() => setMessage("Account setup complete. You can now log in."))
      .catch((requestError) => {
        const validationErrors = requestError.response?.data?.errors;
        setError(
          validationErrors
            ? Object.values(validationErrors)[0][0]
            : requestError.response?.data?.message || "Unable to set up your account."
        );
      })
      .finally(() => setSaving(false));
  };

  const fields = ROLE_FIELDS[role] || ROLE_FIELDS.employee;

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading invitation...</div>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans text-slate-800">
      <section className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">WFPPOAS</h1>
        <h2 className="mt-8 text-xl font-semibold">Set Up Your {role.charAt(0).toUpperCase() + role.slice(1)} Account</h2>
        <p className="mt-1 text-sm text-gray-500">
          {name ? `Welcome, ${name}!` : "Welcome!"}
        </p>

        {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && (
          <div className="mt-5 space-y-3">
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>
            <a
              href="/"
              className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Go to Login
            </a>
          </div>
        )}

        {name && !message ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Email</label>
                <div className="text-sm font-medium text-slate-800">{email}</div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">Role</label>
                <div className="text-sm font-medium capitalize text-slate-800">{role}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium">Create Password</label>
                <input id="password" type="password" minLength="8" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-slate-500" />
              </div>
              <div>
                <label htmlFor="confirmation" className="mb-1 block text-sm font-medium">Confirm Password</label>
                <input id="confirmation" type="password" minLength="8" required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-slate-500" />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                {role.charAt(0).toUpperCase() + role.slice(1)} Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className={field.type === "text" && role === "employee" && field.key === "photo" ? "md:col-span-2" : ""}>
                    <label htmlFor={field.key} className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
                    <input
                      id={field.key}
                      name={field.key}
                      type={field.type}
                      value={profile[field.key] || ""}
                      onChange={handleProfileChange}
                      placeholder={field.placeholder}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-slate-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500">Password must be at least 8 characters.</p>
            <button type="submit" disabled={saving || !name} className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white disabled:opacity-60">
              {saving ? "Saving..." : "Complete Account"}
            </button>
          </form>
        ) : null}
      </section>
    </main>
  );
}

export default AccountSetup;
