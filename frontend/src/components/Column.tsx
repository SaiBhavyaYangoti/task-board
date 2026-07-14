import { useDroppable } from "@dnd-kit/core";
import type { Column as ColumnType, Task } from "../types";
import { TASK_PRIORITIES } from "../types";
import TaskCard from "./TaskCard";

const PRIORITY_ORDER = Object.fromEntries(TASK_PRIORITIES.map((p, i) => [p, i]));

function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

export default function Column({
  column,
  tasks,
  onOpenTask,
  onDelete,
}: {
  column: ColumnType;
  tasks: Task[];
  onOpenTask: (t: Task) => void;
  onDelete: (column: ColumnType) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });

  return (
    <div
      ref={setNodeRef}
      style={{ borderTopColor: column.color }}
      className={`flex flex-col bg-slate-50 rounded-xl border-t-4 border border-slate-200 min-h-[60vh] ${
        isOver ? "ring-2 ring-indigo-400" : ""
      }`}
    >
      <div className="px-3 py-3 flex items-center justify-between group">
        <h2 className="font-semibold text-slate-700 text-sm">{column.label}</h2>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium bg-slate-200 text-slate-600 rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
          <button
            onClick={() => onDelete(column)}
            title="Delete column"
            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition text-sm leading-none"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto">
        {sortByPriority(tasks).map((t) => (
          <TaskCard key={t._id} task={t} onOpen={onOpenTask} />
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6">No tasks</p>
        )}
      </div>
    </div>
  );
}
