import { useEffect, useState } from "react";
import { userService, performanceService, dashboardService, getUserRole } from "../../services/api";

function PerformancePage() {
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);

  const [period, setPeriod] = useState("");
  const [computing, setComputing] = useState(false);
  const [computeError, setComputeError] = useState("");

  const userRole = getUserRole();
  const isManager = userRole === "manager";

  useEffect(() => {
    userService
      .getEmployees()
      .then((res) => setEmployees(res.data || []))
      .catch(() => setError("Hindi ma-load ang listahan ng employees."))
      .finally(() => setLoading(false));

    dashboardService
      .getPerformanceOverview()
      .then((res) => setOverview(res.data))
      .catch(() => {
        // okay lang kung wala pang overview data, hindi kritikal
      });
  }, []);

  const refreshRecords = () => {
    setRecordsLoading(true);
    performanceService
      .getByEmployee(selectedUserId)
      .then((res) => setRecords(res.data || []))
      .catch(() => setError("Hindi ma-load ang performance records."))
      .finally(() => setRecordsLoading(false));
  };

  useEffect(() => {
    if (!selectedUserId) return;
    refreshRecords();
  }, [selectedUserId]);

  const handleCompute = async (e) => {
    e.preventDefault();
    setComputing(true);
    setComputeError("");

    try {
      await performanceService.compute(selectedUserId, period);
      setPeriod("");
      refreshRecords();
      dashboardService.getPerformanceOverview().then((res) => setOverview(res.data));
    } catch (err) {
      setComputeError(err.response?.data?.message || "Hindi ma-compute ang performance.");
    } finally {
      setComputing(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Naglo-load...</div>;
  }

  return (
    <>
      <h2 className="text-2xl font-semibold">Performance</h2>
      <p className="mt-1 text-sm text-gray-500">
        Analytics overview ng workforce performance sa buong firm.
      </p>

      {/* ANALYTICS OVERVIEW */}
      {overview && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Top Performer</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {overview.top_performer?.user?.name || "Wala pang data"}
            </p>
            {overview.top_performer && (
              <p className="text-xs text-gray-400">{overview.top_performer.completion_rate}% completion</p>
            )}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Team Average</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{overview.team_average || 0}%</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total Evaluated</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{overview.ranking?.length || 0}</p>
          </div>
        </div>
      )}

      {overview?.ranking?.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Team Ranking</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
                <th className="pb-2">Rank</th>
                <th className="pb-2">Employee</th>
                <th className="pb-2">Completion</th>
                <th className="pb-2">On-Time</th>
              </tr>
            </thead>
            <tbody>
              {overview.ranking.map((rec, i) => (
                <tr key={rec.id} className="border-b border-gray-50">
                  <td className="py-2.5 font-medium">#{i + 1}</td>
                  <td className="py-2.5">{rec.user?.name}</td>
                  <td className="py-2.5">{rec.completion_rate}%</td>
                  <td className="py-2.5">{rec.on_time_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PER-EMPLOYEE DETAIL */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Individual Performance</h3>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        >
          <option value="">-- Pumili ng employee --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {selectedUserId && (
        <>
          {isManager && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Compute New Snapshot</h3>

              {computeError && (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{computeError}</p>
              )}

              <form onSubmit={handleCompute} className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-gray-700">Period</label>
                  <input
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    required
                    placeholder="e.g. 2026-Q3"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={computing}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {computing ? "Computing..." : "Compute Performance"}
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Performance History</h3>

            {recordsLoading ? (
              <p className="text-sm text-gray-500">Naglo-load...</p>
            ) : records.length === 0 ? (
              <p className="text-sm text-gray-500">Wala pang performance records.</p>
            ) : (
              <div className="space-y-3">
                {records.map((rec) => (
                  <div key={rec.id} className="rounded-lg border border-gray-100 bg-slate-50 p-4">
                    <p className="mb-3 text-sm font-medium text-slate-800">{rec.period}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-white border border-gray-100 p-3 text-center">
                        <p className="text-xs text-gray-500">Completion Rate</p>
                        <p className="mt-1 text-xl font-bold text-slate-900">{rec.completion_rate}%</p>
                      </div>
                      <div className="rounded-lg bg-white border border-gray-100 p-3 text-center">
                        <p className="text-xs text-gray-500">On-Time Rate</p>
                        <p className="mt-1 text-xl font-bold text-slate-900">{rec.on_time_rate}%</p>
                      </div>
                      <div className="rounded-lg bg-white border border-gray-100 p-3 text-center">
                        <p className="text-xs text-gray-500">Revisions</p>
                        <p className="mt-1 text-xl font-bold text-slate-900">{rec.revision_count}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default PerformancePage;