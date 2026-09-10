import { useEffect, useMemo, useState } from "react";
import PerformancePageSkeleton, { PerformanceMetricsSkeleton, PerformanceHistorySkeleton } from '../../components/skeletons/PerformancePageSkeleton';
import {
  Trophy,
  Users,
  Target,
  Clock,
  RotateCcw,
  CalendarDays,
  ChevronDown,
  BarChart3,
  Info,
  RefreshCw,
} from "lucide-react";

import {
  userService,
  performanceService,
  dashboardService,
  getUserRole,
  getCurrentUser,
  projectService,
} from "../../services/api";

function PerformancePage() {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const [records, setRecords] = useState([]);
  const [overview, setOverview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [error, setError] = useState("");
  const [computeError, setComputeError] = useState("");

  const [period, setPeriod] = useState("");
  const [computing, setComputing] = useState(false);

  const userRole = getUserRole();
  const isManager = userRole === "manager";

  // --------------------------------------------------
  // Generate recent months for evaluation
  // --------------------------------------------------
  const evaluationMonths = useMemo(() => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - i,
        1
      );

      const value = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const label = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      months.push({
        value,
        label,
      });
    }

    return months;
  }, []);

  // --------------------------------------------------
  // Load employees + overview
  // --------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [employeesResponse, overviewResponse, projectsResponse] = await Promise.all([
          userService.getEmployees(),
          dashboardService.getPerformanceOverview(),
          projectService.getAll(),
        ]);

        setEmployees(employeesResponse.data || []);
        const currentUser = getCurrentUser();
        const managedProjects = (projectsResponse.data || []).filter((project) =>
          currentUser?.role === 'admin' || Number(project.manager_id) === Number(currentUser?.id)
        );
        setProjects(managedProjects);
        setSelectedProjectId(managedProjects.length ? String(managedProjects[0].id) : "");
        setOverview(overviewResponse.data || null);
      } catch (err) {
        console.error("Failed to load performance data:", err);

        setError(
          "Hindi ma-load ang performance data. Pakisubukan ulit."
        );
      } finally {
        setLoading(false);
        setOverviewLoading(false);
      }
    };

    loadData();
  }, []);

  // --------------------------------------------------
  // Load selected employee performance
  // --------------------------------------------------
  useEffect(() => {
    if (!selectedUserId || (isManager && !selectedProjectId)) {
      setRecords([]);
      return;
    }

    loadEmployeePerformance(selectedUserId);
  }, [selectedUserId, selectedProjectId]);

  const loadEmployeePerformance = async (userId) => {
    setRecordsLoading(true);
    setRecords([]);
    setError("");

    try {
      const response = await performanceService.getByEmployee(userId, isManager ? selectedProjectId : null);

      setRecords(response.data || []);
    } catch (err) {
      console.error("Failed to load employee performance:", err);

      setError(
        "Hindi ma-load ang performance history ng employee."
      );
    } finally {
      setRecordsLoading(false);
    }
  };

  // --------------------------------------------------
  // Refresh overview
  // --------------------------------------------------
  const refreshOverview = async () => {
    setOverviewLoading(true);

    try {
      const response =
        await dashboardService.getPerformanceOverview();

      setOverview(response.data || null);
    } catch (err) {
      console.error("Failed to refresh overview:", err);
    } finally {
      setOverviewLoading(false);
    }
  };

  // --------------------------------------------------
  // Create Performance Evaluation
  // --------------------------------------------------
  const handleCreateEvaluation = async (e) => {
    e.preventDefault();

    if (!selectedUserId || !period || (isManager && !selectedProjectId)) {
      return;
    }

    setComputing(true);
    setComputeError("");

    try {

      await performanceService.compute(
        selectedUserId,
        period,
        isManager ? selectedProjectId : null
      );

      await loadEmployeePerformance(selectedUserId);
      await refreshOverview();

      setPeriod("");
    } catch (err) {
      console.error("Failed to create evaluation:", err);

      setComputeError(
        err.response?.data?.message ||
          "Hindi ma-create ang performance evaluation."
      );
    } finally {
      setComputing(false);
    }
  };

  // --------------------------------------------------
  // Selected employee
  // --------------------------------------------------
  const selectedEmployee = employees.find(
    (employee) => String(employee.id) === String(selectedUserId)
  );

  // --------------------------------------------------
  // Latest performance record
  // --------------------------------------------------
  const latestRecord = records.length > 0 ? records[0] : null;

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  const formatPeriod = (periodValue) => {
    if (!periodValue) return "Unknown period";

    // Handles YYYY-MM
    if (/^\d{4}-\d{2}$/.test(periodValue)) {
      const [year, month] = periodValue.split("-");

      const date = new Date(
        Number(year),
        Number(month) - 1,
        1
      );

      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }

    return periodValue;
  };

  const getRateLabel = (rate) => {
    const value = Number(rate || 0);

    if (value >= 90) return "Excellent";
    if (value >= 75) return "Good";
    if (value >= 50) return "Needs Improvement";

    return "Low";
  };

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------
  if (loading) {
    return <PerformancePageSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* ==================================================
          PAGE HEADER
      ================================================== */}
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monitor employee task completion, timeliness,
              and revision history.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshOverview}
            disabled={overviewLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={overviewLoading ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
          <Info
            size={17}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <p className="text-xs leading-5 text-blue-800">
            Performance is based on the tasks assigned to
            employees. The system measures how many tasks
            were completed, whether they were completed on
            time, and whether submitted work required
            revision.
          </p>
        </div>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}
      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ==================================================
          OVERVIEW CARDS
      ================================================== */}
      {overviewLoading ? <PerformanceMetricsSkeleton /> : <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Top Performer */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Top Performer
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {overview?.top_performer?.user?.name ||
                  "No data yet"}
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-2.5">
              <Trophy
                size={20}
                className="text-amber-600"
              />
            </div>
          </div>

          {overview?.top_performer && (
            <p className="mt-3 text-xs text-gray-500">
              {overview.top_performer.completion_rate}% task
              completion
            </p>
          )}
        </div>

        {/* Team Average */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Average Employee Completion
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {Number(overview?.team_average || 0)}%
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-2.5">
              <BarChart3
                size={20}
                className="text-blue-600"
              />
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Average completion rate of evaluated employees.
          </p>
        </div>

        {/* Employees Evaluated */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Employees Evaluated
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {overview?.ranking?.length || 0}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-2.5">
              <Users
                size={20}
                className="text-slate-600"
              />
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Employees with saved performance evaluations.
          </p>
        </div>
      </div>

      }
      {/* ==================================================
          EMPLOYEE RANKING
      ================================================== */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-4 md:px-6 md:py-5">
          <h3 className="text-sm font-semibold text-slate-800">
            Employee Ranking
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Employees ranked according to their latest
            performance evaluation.
          </p>
        </div>

        {overviewLoading ? <PerformanceHistorySkeleton /> : overview?.ranking?.length > 0 ? (
          <div className="min-w-0 md:overflow-x-auto m-1.5">
            <table className="block w-full text-sm md:table">
              <thead className="hidden md:table-header-group">
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-3 font-medium">
                    Rank
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Employee
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Completion
                  </th>

                  <th className="px-6 py-3 font-medium">
                    On-Time
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Revisions
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="block divide-y divide-gray-100 md:table-row-group md:divide-y-0">
                {overview.ranking.map((record, index) => (
                  <tr
                    key={record.id}
                    className="grid grid-cols-3 gap-x-3 gap-y-4 p-4 md:table-row md:border-b md:border-gray-50 md:p-0 md:last:border-0 md:hover:bg-slate-50"
                  >
                    <td className="block md:table-cell md:px-6 md:py-4">
                      <span className="font-semibold text-slate-700">
                        #{index + 1}
                      </span>
                    </td>

                    <td className="col-span-2 min-w-0 md:table-cell md:px-6 md:py-4">
                      <p className="break-words font-medium text-slate-800">
                        {record.user?.name || "Unknown Employee"}
                      </p>
                    </td>

                    <td className="min-w-0 font-medium text-slate-700 md:table-cell md:px-6 md:py-4">
                      <span className="mb-1 block text-xs font-normal text-gray-500 md:hidden">Completion</span>
                      {record.completion_rate}%
                    </td>

                    <td className="min-w-0 text-slate-600 md:table-cell md:px-6 md:py-4">
                      <span className="mb-1 block text-xs text-gray-500 md:hidden">On-Time</span>
                      {record.on_time_rate}%
                    </td>

                    <td className="min-w-0 text-slate-600 md:table-cell md:px-6 md:py-4">
                      <span className="mb-1 block text-xs text-gray-500 md:hidden">Revisions</span>
                      {record.revision_count}
                    </td>

                    <td className="col-span-3 flex items-center justify-between gap-3 border-t border-gray-100 pt-3 md:table-cell md:border-0 md:px-6 md:py-4">
                      <span className="text-xs text-gray-500 md:hidden">Status</span>
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                          Number(record.completion_rate) >= 90
                            ? "bg-green-50 text-green-700"
                            : Number(record.completion_rate) >= 75
                            ? "bg-blue-50 text-blue-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {getRateLabel(
                          record.completion_rate
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-10 text-center">
            <BarChart3
              size={32}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-600">
              No performance evaluations yet.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Create an evaluation for an employee to
              generate performance data.
            </p>
          </div>
        )}
      </div>

      {/* ==================================================
          INDIVIDUAL PERFORMANCE
      ================================================== */}
      <div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-800">
            Individual Performance
          </h3>
          {isManager && (
            <label className="my-4 block text-sm text-slate-700">
              Project for employee history and evaluation
              <select
                className="mt-2 block w-full rounded-lg border border-gray-200 bg-white p-2"
                value={selectedProjectId}
                onChange={(event) => { setSelectedProjectId(event.target.value); setRecords([]); setComputeError(""); }}
                disabled={computing}
              >
                {!projects.length && <option value="">No managed projects available</option>}
                {projects.map((project) => <option key={project.id} value={project.id}>{project.project_name}</option>)}
              </select>
            </label>
          )}

          <p className="mt-1 text-xs text-gray-500">
            Select an employee to view their performance
            and evaluation history.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <select
            value={selectedUserId}
            onChange={(e) =>
              setSelectedUserId(e.target.value)
            }
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          >
            <option value="">
              Select an employee
            </option>

            {employees.map((employee) => (
              <option
                key={employee.id}
                value={employee.id}
              >
                {employee.name}
              </option>
            ))}
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* ==================================================
          SELECTED EMPLOYEE
      ================================================== */}
      {selectedUserId && (
        <div className="space-y-6">
          {/* Employee heading */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Selected Employee
                </p>

                <h3 className="mt-1 text-xl font-semibold text-slate-900">
                  {selectedEmployee?.name ||
                    "Employee"}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Latest saved performance evaluation
                </p>
              </div>

              {latestRecord && (
                <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  {formatPeriod(latestRecord.period)}
                </span>
              )}
            </div>

            {/* Metrics */}
            {recordsLoading ? (
              <PerformanceHistorySkeleton />
            ) : latestRecord ? (
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Completion */}
                <div className="rounded-lg border border-gray-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Target
                      size={17}
                      className="text-blue-600"
                    />

                    <p className="text-xs text-gray-500">
                      Completion
                    </p>
                  </div>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {latestRecord.completion_rate}%
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Tasks completed
                  </p>
                </div>

                {/* On Time */}
                <div className="rounded-lg border border-gray-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Clock
                      size={17}
                      className="text-green-600"
                    />

                    <p className="text-xs text-gray-500">
                      On-Time
                    </p>
                  </div>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {latestRecord.on_time_rate}%
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Completed by deadline
                  </p>
                </div>

                {/* Revisions */}
                <div className="rounded-lg border border-gray-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <RotateCcw
                      size={17}
                      className="text-orange-600"
                    />

                    <p className="text-xs text-gray-500">
                      Revisions
                    </p>
                  </div>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {latestRecord.revision_count}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Tasks requiring revision
                  </p>
                </div>

                {/* Evaluation */}
                <div className="rounded-lg border border-gray-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={17}
                      className="text-purple-600"
                    />

                    <p className="text-xs text-gray-500">
                      Evaluation
                    </p>
                  </div>

                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {formatPeriod(
                      latestRecord.period
                    )}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Latest evaluation
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
                <BarChart3
                  size={30}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  No evaluation yet
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Create a performance evaluation below
                  to generate results for this employee.
                </p>
              </div>
            )}
          </div>

          {/* ==================================================
              CREATE EVALUATION
          ================================================== */}
          {(isManager || userRole === "admin") && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-slate-800">
                  Create Performance Evaluation
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Select a month and the system will
                  calculate this employee's performance
                  using the tasks assigned during that
                  period.
                </p>
              </div>

              {computeError && (
                <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {computeError}
                </div>
              )}

              <form
                onSubmit={handleCreateEvaluation}
                className="flex flex-col gap-4 md:flex-row md:items-end"
              >
                <div className="w-full md:max-w-xs">
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">
                    Evaluation Month
                  </label>

                  <div className="relative">
                    <select
                      value={period}
                      onChange={(e) =>
                        setPeriod(e.target.value)
                      }
                      required
                      className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-10 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    >
                      <option value="">
                        Select a month
                      </option>

                      {evaluationMonths.map(
                        (month) => (
                          <option
                            key={month.value}
                            value={month.value}
                          >
                            {month.label}
                          </option>
                        )
                      )}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={computing || !period || (isManager && !selectedProjectId)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {computing ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="animate-spin"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <BarChart3 size={16} />

                      Create Evaluation
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ==================================================
              PERFORMANCE HISTORY
          ================================================== */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h3 className="text-sm font-semibold text-slate-800">
                Performance History
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Previous performance evaluations for this
                employee.
              </p>
            </div>

            {recordsLoading ? (
              <PerformanceHistorySkeleton />
            ) : records.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <CalendarDays
                  size={30}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 text-sm font-medium text-slate-600">
                  No performance history
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  No evaluations have been created for this
                  employee yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="px-6 py-5"
                  >
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {formatPeriod(record.period)}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Evaluated by{" "}
                          {record.evaluator?.name ||
                            "Manager"}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                          Number(
                            record.completion_rate
                          ) >= 90
                            ? "bg-green-50 text-green-700"
                            : Number(
                                record.completion_rate
                              ) >= 75
                            ? "bg-blue-50 text-blue-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {getRateLabel(
                          record.completion_rate
                        )}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-gray-500">
                          Completion Rate
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {record.completion_rate}%
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-gray-500">
                          On-Time Rate
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {record.on_time_rate}%
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-gray-500">
                          Tasks Requiring Revision
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {record.revision_count}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformancePage;
