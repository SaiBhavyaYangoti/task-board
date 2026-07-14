import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { api } from "../api/client";
import type { Task, TaskPriority, Column as ColumnType } from "../types";
import { TASK_PRIORITIES, PRIORITY_LABELS } from "../types";
import Column from "../components/Column";
import TaskModal from "../components/TaskModal";
import ColumnModal from "../components/ColumnModal";
import { TaskCardView } from "../components/TaskCard";

export default function Board() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalTask, setModalTask] = useState<Task | null | undefined>(undefined);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "">("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  async function loadAll() {
    const [tasksRes, columnsRes] = await Promise.all([
      api.get<Task[]>("/tasks"),
      api.get<ColumnType[]>("/columns"),
    ]);
    setTasks(tasksRes.data);
    setColumns(columnsRes.data);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task ?? null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const newStatus = String(over.id);
    const task = tasks.find((t) => t._id === active.id);
    if (!task || task.status === newStatus) return;

    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );
    try {
      await api.patch(`/tasks/${task._id}`, { status: newStatus });
    } catch {
      loadAll();
    }
  }

  function closeModal() {
    setModalTask(undefined);
  }

  async function handleSaved() {
    closeModal();
    await loadAll();
  }

  async function handleDeleteColumn(column: ColumnType) {
    if (!confirm(`Delete column "${column.label}"?`)) return;
    try {
      await api.delete(`/columns/${column.key}`);
      await loadAll();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete column");
    }
  }

  const assignees = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.assignee))).sort(),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (assigneeFilter && t.assignee !== assigneeFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (q && !t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [tasks, search, assigneeFilter, priorityFilter]);

  const filtersActive = search || assigneeFilter || priorityFilter;

  function clearFilters() {
    setSearch("");
    setAssigneeFilter("");
    setPriorityFilter("");
  }

  if (loading) return <p className="text-slate-500">Loading board...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <p className="text-slate-500 text-sm">
          {filteredTasks.length} of {tasks.length} tasks
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowColumnModal(true)}
            className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg px-4 py-2"
          >
            + Column
          </button>
          <button
            onClick={() => setModalTask(null)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2"
          >
            + New Task
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
        >
          <option value="">All assignees</option>
          {assignees.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "")}
        >
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
        {filtersActive && (
          <button
            onClick={clearFilters}
            className="text-sm text-slate-500 hover:text-red-600"
          >
            Clear filters
          </button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        <div className="overflow-x-auto pb-2">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(240px, 1fr))` }}
          >
            {columns.map((column) => (
              <Column
                key={column.key}
                column={column}
                tasks={filteredTasks.filter((t) => t.status === column.key)}
                onOpenTask={setModalTask}
                onDelete={handleDeleteColumn}
              />
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 shadow-xl">
              <TaskCardView task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {modalTask !== undefined && (
        <TaskModal
          task={modalTask}
          columns={columns}
          onClose={closeModal}
          onSaved={handleSaved}
          onDeleted={handleSaved}
        />
      )}

      {showColumnModal && (
        <ColumnModal
          onClose={() => setShowColumnModal(false)}
          onCreated={() => {
            setShowColumnModal(false);
            loadAll();
          }}
        />
      )}
    </div>
  );
}
