import { useEffect, useState } from "react";
import axios from "axios";


const API_URL = "http://127.0.0.1:8000/api";

const FIELD_CONFIG = {
  admin: [
    { key: "position", label: "Position", type: "text", placeholder: "e.g. Senior Administrator" },
    { key: "department", label: "Department", type: "text", placeholder: "e.g. Operations" },
    { key: "office_number", label: "Office Number", type: "text", placeholder: "e.g. 103" },
    { key: "contact_number", label: "Contact Number", type: "text", placeholder: "e.g. 0917-123-4567" },
    { key: "photo", label: "Photo URL", type: "text", placeholder: "Optional photo link" },
  ],
  manager: [
    { key: "position", label: "Position", type: "text", placeholder: "e.g. Project Manager" },
    { key: "department", label: "Department", type: "text", placeholder: "e.g. Engineering" },
    { key: "team_name", label: "Team Name", type: "text", placeholder: "e.g. Design Team" },
    { key: "office_number", label: "Office Number", type: "text", placeholder: "e.g. 205" },
    { key: "contact_number", label: "Contact Number", type: "text", placeholder: "e.g. 0917-123-4567" },
    { key: "photo", label: "Photo URL", type: "text", placeholder: "Optional photo link" },
  ],
  employee: [
    { key: "prc_license_no", label: "PRC License No.", type: "text", placeholder: "e.g. PRC-12345" },
    { key: "specialization", label: "Specialization", type: "text", placeholder: "e.g. Structural Engineering" },
    { key: "years_of_experience", label: "Years of Experience", type: "number", placeholder: "0" },
    { key: "contact_number", label: "Contact Number", type: "text", placeholder: "e.g. 0917-123-4567" },
  ],
};

function Profile() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = storedUser.role || "employee";
  const userId = storedUser.id;
  const fields = FIELD_CONFIG[userRole] || FIELD_CONFIG.employee;

  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [hasProfile, setHasProfile] = useState(false);



  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const endpointMap = {
        admin: "admin-profile",
        manager: "manager-profile",
        employee: "employee-profile",
      };

      try {
        const { data } = await axios.get(`${API_URL}/users/${userId}/${endpointMap[userRole]}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setForm(data);
        setHasProfile(true);
      } catch (err) {
        if (err.response?.status !== 404) {
          setError("Hindi ma-load ang profile. Subukan ulit mamaya.");
        }
        setForm({});
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    } else {
      setLoading(false);
      setError("Hindi ma-load ang profile dahil walang user data.");
    }
  }, [userId, userRole]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    const token = localStorage.getItem("token");
    const endpointMap = {
      admin: "admin-profile",
      manager: "manager-profile",
      employee: "employee-profile",
    };

    const payload = { ...form };

    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value === "" || value === null || value === undefined) {
        delete payload[key];
      }
    });

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const endpoint = `${API_URL}/users/${userId}/${endpointMap[userRole]}`;

      const response = hasProfile
        ? await axios.put(endpoint, payload, config)
        : await axios.post(endpoint, payload, config);

      setForm(response.data);
      setHasProfile(true);
      setMessage("Na-save na ang profile.");
    } catch (err) {
      const message = err.response?.data?.message || "Hindi ma-save ang profile.";
      const validationErrors = err.response?.data?.errors;
      setError(validationErrors ? Object.values(validationErrors)[0][0] : message);
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <>
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          Naglo-load ang profile...
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {userRole} profile
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {hasProfile ? "Update Your Profile" : "Create Your Profile"}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Maglagay ng mahalagang impormasyon para sa iyong role sa system.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key} className={field.key === "photo" ? "md:col-span-2" : ""}>
              <label htmlFor={field.key} className="mb-2 block text-sm font-medium text-slate-700">
                {field.label}
              </label>
              <input
                id={field.key}
                name={field.key}
                type={field.type}
                value={form[field.key] ?? ""}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
              />
            </div>
          ))}

          <div className="md:col-span-2 mt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : hasProfile ? "Update Profile" : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Profile;
