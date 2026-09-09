import { useEffect, useState } from "react";
import { taskService, documentService } from "../../services/api";

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState(null);

  const [progress, setProgress] = useState(0);
  const [employeeComment, setEmployeeComment] = useState("");
  const [proofFile, setProofFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  // =========================
  // LOAD TASKS
  // =========================
  const loadTasks = async () => {
    try {
      setLoading(true);

      const response = await taskService.getMyTasks();

      setTasks(response.data || []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // =========================
  // OPEN TASK
  // =========================
  const openTask = (task) => {
    setSelectedTask(task);
    setProgress(task.progress_percent || 0);
    setEmployeeComment(task.employee_comment || "");
    setProofFile(null);
  };

  // =========================
  // CLOSE TASK
  // =========================
  const closeTask = () => {
    setSelectedTask(null);
    setProgress(0);
    setEmployeeComment("");
    setProofFile(null);
  };

  // =========================
  // SAVE PROGRESS
  // =========================
  const handleSaveProgress = async () => {
    if (!selectedTask) return;

    try {
      setSubmitting(true);

      await taskService.updateProgress(
        selectedTask.project_id,
        selectedTask.id,
        Number(progress)
      );

      await loadTasks();

      const updatedTask = await taskService.getOne(
        selectedTask.project_id,
        selectedTask.id
      );

      setSelectedTask(updatedTask.data);

      setProgress(updatedTask.data.progress_percent || 0);
    } catch (error) {
      console.error("Failed to update progress:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update task progress."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // SUBMIT FOR REVIEW
  // =========================
  const handleSubmitForReview = async () => {
    if (!selectedTask) return;

    try {
      setSubmitting(true);

      // ---------------------------------
      // Save progress first if changed
      // ---------------------------------
      if (
        Number(progress) !==
        Number(selectedTask.progress_percent)
      ) {
        await taskService.updateProgress(
          selectedTask.project_id,
          selectedTask.id,
          Number(progress)
        );
      }

      // ---------------------------------
      // Upload proof if provided
      // ---------------------------------
      if (proofFile) {
        const formData = new FormData();

        formData.append(
          "task_id",
          selectedTask.id
        );

        formData.append(
          "file",
          proofFile
        );

        // Reuse "photo" as completion proof
        formData.append(
          "file_type",
          "photo"
        );

        await documentService.upload(
          selectedTask.project_id,
          formData
        );
      }

      // ---------------------------------
      // Submit task
      // ---------------------------------
      await taskService.submitForReview(
        selectedTask.project_id,
        selectedTask.id,
        employeeComment
      );

      await loadTasks();

      closeTask();

      alert("Task submitted for review.");
    } catch (error) {
      console.error("Failed to submit task:", error);

      alert(
        error.response?.data?.message ||
          "Failed to submit task for review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // STATUS CONFIG
  // =========================
  const getStatus = (status) => {
    const config = {
      pending: {
        label: "Pending",
        className: "bg-gray-100 text-gray-700",
      },

      in_progress: {
        label: "In Progress",
        className: "bg-blue-100 text-blue-700",
      },

      for_review: {
        label: "For Review",
        className: "bg-yellow-100 text-yellow-700",
      },

      completed: {
        label: "Completed",
        className: "bg-green-100 text-green-700",
      },

      delayed: {
        label: "Delayed",
        className: "bg-red-100 text-red-700",
      },
    };

    return (
      config[status] || {
        label: status,
        className: "bg-gray-100 text-gray-700",
      }
    );
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-800">
          My Tasks
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Loading your tasks...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">

      {/* =========================
          PAGE HEADER
      ========================= */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          My Tasks
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View your assigned tasks, update your progress,
          and submit completed work for review.
        </p>
      </div>


      {/* =========================
          TASK COUNT
      ========================= */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">
          Assigned Tasks
        </p>

        <p className="mt-1 text-2xl font-bold text-slate-800">
          {tasks.length}
        </p>
      </div>


      {/* =========================
          EMPTY STATE
      ========================= */}
      {tasks.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700">
            No tasks assigned
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You don't have any assigned tasks yet.
          </p>
        </div>
      ) : (

        /* =========================
           TASK CARDS
        ========================= */
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {tasks.map((task) => {
            const status = getStatus(task.status);

            return (
              <div
                key={task.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >

                {/* PROJECT */}
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  {task.project?.project_name || "Project"}
                </p>


                {/* TASK NAME */}
                <h2 className="mt-2 text-lg font-semibold text-slate-800">
                  {task.task_name}
                </h2>


                {/* DESCRIPTION */}
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                  {task.description ||
                    "No description provided."}
                </p>


                {/* STATUS */}
                <div className="mt-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>


                {/* PROGRESS */}
                <div className="mt-5">

                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-gray-500">
                      Progress
                    </span>

                    <span className="font-medium text-slate-700">
                      {task.progress_percent || 0}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${
                          task.progress_percent || 0
                        }%`,
                      }}
                    />
                  </div>

                </div>


                {/* DEADLINE */}
                {task.deadline && (
                  <p className="mt-4 text-xs text-gray-500">
                    Deadline:{" "}
                    <span className="font-medium text-slate-700">
                      {task.deadline}
                    </span>
                  </p>
                )}


                {/* MANAGER FEEDBACK */}
                {task.manager_comment && (
                  <div className="mt-4 rounded-lg bg-red-50 p-3">

                    <p className="text-xs font-semibold text-red-700">
                      Manager Feedback
                    </p>

                    <p className="mt-1 text-sm text-red-600">
                      {task.manager_comment}
                    </p>

                  </div>
                )}


                {/* VIEW TASK */}
                <button
                  onClick={() => openTask(task)}
                  className="mt-5 w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
                >
                  View Task
                </button>

              </div>
            );
          })}

        </div>
      )}


      {/* =========================
          TASK MODAL
      ========================= */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">

            {/* =========================
                MODAL HEADER
            ========================= */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">

              <div>

                <p className="text-xs uppercase tracking-wide text-gray-400">
                  {selectedTask.project?.project_name}
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-800">
                  {selectedTask.task_name}
                </h2>

              </div>

              <button
                onClick={closeTask}
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>

            </div>


            <div className="space-y-6 p-6">

              {/* =========================
                  DESCRIPTION
              ========================= */}
              <div>

                <h3 className="text-sm font-semibold text-slate-700">
                  Description
                </h3>

                <p className="mt-2 text-sm text-gray-600">
                  {selectedTask.description ||
                    "No description provided."}
                </p>

              </div>


              {/* =========================
                  DEADLINE / PRIORITY
              ========================= */}
              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-lg bg-gray-50 p-4">

                  <p className="text-xs text-gray-400">
                    Deadline
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedTask.deadline ||
                      "No deadline"}
                  </p>

                </div>


                <div className="rounded-lg bg-gray-50 p-4">

                  <p className="text-xs text-gray-400">
                    Priority
                  </p>

                  <p className="mt-1 text-sm font-medium capitalize text-slate-700">
                    {selectedTask.priority ||
                      "Medium"}
                  </p>

                </div>

              </div>


              {/* =========================
                  CURRENT STATUS
              ========================= */}
              <div>

                <p className="text-xs text-gray-400">
                  Current Status
                </p>

                <p className="mt-1 text-sm font-semibold capitalize text-slate-700">
                  {selectedTask.status?.replace(
                    "_",
                    " "
                  )}
                </p>

              </div>


              {/* =========================
                  PROGRESS
              ========================= */}
              {selectedTask.status !== "completed" &&
                selectedTask.status !== "for_review" && (

                <div>

                  <div className="flex justify-between">

                    <label className="text-sm font-semibold text-slate-700">
                      Task Progress
                    </label>

                    <span className="text-sm font-medium text-blue-600">
                      {progress}%
                    </span>

                  </div>


                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) =>
                      setProgress(
                        Number(e.target.value)
                      )
                    }
                    className="mt-3 w-full"
                  />


                  <button
                    onClick={handleSaveProgress}
                    disabled={submitting}
                    className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {submitting
                      ? "Saving..."
                      : "Save Progress"}
                  </button>

                </div>
              )}


              {/* =========================
                  MANAGER FEEDBACK
              ========================= */}
              {selectedTask.manager_comment && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">

                  <p className="text-sm font-semibold text-red-700">
                    Manager Feedback
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {selectedTask.manager_comment}
                  </p>

                </div>
              )}


              {/* =========================
                  SUBMIT FOR REVIEW
              ========================= */}
              {selectedTask.status !== "completed" &&
                selectedTask.status !== "for_review" && (

                <div className="border-t border-gray-200 pt-6">

                  <h3 className="text-sm font-semibold text-slate-700">
                    Submit Work for Review
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Upload proof of completion and add
                    an optional comment before submitting.
                  </p>


                  {/* PROOF */}
                  <div className="mt-4">

                    <label className="text-sm font-medium text-slate-700">
                      Proof of Completion
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setProofFile(
                          e.target.files?.[0] || null
                        )
                      }
                      className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />

                    {proofFile && (
                      <p className="mt-1 text-xs text-gray-500">
                        Selected: {proofFile.name}
                      </p>
                    )}

                  </div>


                  {/* EMPLOYEE COMMENT */}
                  <div className="mt-4">

                    <label className="text-sm font-medium text-slate-700">
                      Comment
                    </label>

                    <textarea
                      value={employeeComment}
                      onChange={(e) =>
                        setEmployeeComment(
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder="Add a comment about your completed work..."
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />

                  </div>


                  {/* SUBMIT */}
                  <button
                    onClick={handleSubmitForReview}
                    disabled={submitting}
                    className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit for Review"}
                  </button>

                </div>
              )}


              {/* =========================
                  FOR REVIEW
              ========================= */}
              {selectedTask.status === "for_review" && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">

                  <p className="text-sm font-semibold text-yellow-800">
                    Waiting for Manager Review
                  </p>

                  <p className="mt-1 text-sm text-yellow-700">
                    Your task has been submitted and is
                    currently waiting for your manager's
                    approval.
                  </p>

                </div>
              )}


              {/* =========================
                  COMPLETED
              ========================= */}
              {selectedTask.status === "completed" && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">

                  <p className="text-sm font-semibold text-green-800">
                    Task Completed
                  </p>

                  <p className="mt-1 text-sm text-green-700">
                    This task has already been approved
                    by your manager.
                  </p>

                </div>
              )}

            </div>


            {/* =========================
                MODAL FOOTER
            ========================= */}
            <div className="border-t border-gray-200 p-6">

              <button
                onClick={closeTask}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default MyTasks;