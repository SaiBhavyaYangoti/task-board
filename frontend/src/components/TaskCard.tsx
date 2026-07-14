import { useDraggable } from "@dnd-kit/core";
import type { Task } from "../types";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "../types";
import Avatar from "./Avatar";

function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === "completed") return false;
  return new Date(task.dueDate).getTime() < Date.now();
}

export function TaskCardView({ task }: { task: Task }) {
  const overdue = isOverdue(task);

  return (
    <div
      className={`bg-white rounded-lg border p-3 shadow-sm ${
        overdue ? "border-red-300 ring-1 ring-red-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-slate-800 text-sm">{task.title}</p>
        <span
          className="text-[10px] font-bold rounded px-1.5 py-0.5 shrink-0 text-white"
          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
          title={PRIORITY_LABELS[task.priority]}
        >
          {task.priority}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Avatar name={task.assignee} />
          <span>{task.assignee}</span>
        </div>
        <div className="flex flex-col items-end">
          <span>{new Date(task.assignedAt).toLocaleDateString()}</span>
          {task.dueDate && (
            <span className={overdue ? "text-red-600 font-semibold" : ""}>
              {overdue ? "Overdue: " : "Due "}
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TaskCard({ task, onOpen }: { task: Task; onOpen: (t: Task) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task._id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onOpen(task)}
      className={`cursor-grab active:cursor-grabbing transition hover:shadow-md rounded-lg ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      <TaskCardView task={task} />
    </div>
  );
}
