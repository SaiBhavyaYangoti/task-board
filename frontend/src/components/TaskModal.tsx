import { useState } from "react";
import type { FormEvent } from "react";
import type { Task, TaskStatus, TaskPriority, Column } from "../types";
import { PRIORITY_LABELS, TASK_PRIORITIES } from "../types";
import { api } from "../api/client";

interface Props {
  task: Task | null;
  columns: Column[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

export default function TaskModal({ task, columns, onClose, onSaved, onDeleted }: Props) {
  const isNew = !task;
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [assignee, setAssignee] = useState(task?.assignee ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? columns[0]?.key ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "P2");
  const [dueDate, setDueDate] = useState(toDateInputValue(task?.dueDate ?? null));
  const [frontendTech, setFrontendTech] = useState(task?.frontendTech ?? "");
  const [backendTech, setBackendTech] = useState(task?.backendTech ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      title,
      description,
      assignee,
      status,
      priority,
      dueDate: dueDate || null,
      frontendTech,
      backendTech,
    };
    try {
      if (isNew) {
        await api.post("/tasks", payload);
      } else {
        await api.patch(`/tasks/${task!._id}`, payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save task");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    if (!confirm("Delete this task?")) return;
    await api.delete(`/tasks/${task._id}`);
    onDeleted();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            {isNew ? "New Task" : "Task Details"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-slate-500 mb-1">Assignee</span>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-slate-500 mb-1">Status</span>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                {columns.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-slate-500 mb-1">Priority</span>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-slate-500 mb-1">Due date</span>
              <input
                type="date"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-slate-500 mb-1">Frontend tech</span>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. React"
                value={frontendTech}
                onChange={(e) => setFrontendTech(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-slate-500 mb-1">Backend tech</span>
              <input
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Express"
                value={backendTech}
                onChange={(e) => setBackendTech(e.target.value)}
              />
            </label>
          </div>

          {!isNew && task && (
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
              <p>Assigned on: {new Date(task.assignedAt).toLocaleString()}</p>
              <p>
                Completed on:{" "}
                {task.completedAt ? new Date(task.completedAt).toLocaleString() : "Not yet"}
              </p>
              <p>Last updated: {new Date(task.updatedAt).toLocaleString()}</p>
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            {!isNew ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm text-red-600 hover:underline"
              >
                Delete task
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : isNew ? "Create task" : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
