import type { Task, Column, TaskPriority } from "../types";

const PRIORITY_WORDS: Record<string, TaskPriority> = {
  p0: "P0", urgent: "P0", critical: "P0",
  p1: "P1", high: "P1",
  p2: "P2", medium: "P2",
  p3: "P3", low: "P3",
};

const HELP_TEXT =
  "I can answer questions about your board. Try asking:\n" +
  "• how many tasks are in progress\n" +
  "• show P0 tasks\n" +
  "• what's overdue\n" +
  "• what is due today\n" +
  "• what is Bhavya working on\n" +
  "• total tasks";

function columnLabel(columns: Column[], key: string): string {
  return columns.find((c) => c.key === key)?.label ?? key;
}

function formatTask(t: Task, columns: Column[]): string {
  const due = t.dueDate ? ` · due ${new Date(t.dueDate).toLocaleDateString()}` : "";
  return `• ${t.title} · ${columnLabel(columns, t.status)} · ${t.priority} · ${t.assignee}${due}`;
}

function listOrNone(tasks: Task[], columns: Column[], emptyMsg: string): string {
  if (tasks.length === 0) return emptyMsg;
  return tasks.map((t) => formatTask(t, columns)).join("\n");
}

export function answerQuery(rawQuery: string, tasks: Task[], columns: Column[]): string {
  const q = rawQuery.trim().toLowerCase();

  if (!q) return HELP_TEXT;
  if (q.includes("help") || ["hi", "hello", "hey"].includes(q)) return HELP_TEXT;

  if (q.includes("overdue")) {
    const now = Date.now();
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate).getTime() < now && t.status !== "completed"
    );
    return `${overdue.length} overdue task(s):\n${listOrNone(overdue, columns, "Nothing overdue. 🎉")}`;
  }

  if (q.includes("today") && q.includes("due")) {
    const today = new Date().toISOString().slice(0, 10);
    const dueToday = tasks.filter(
      (t) => t.dueDate && t.dueDate.slice(0, 10) === today && t.status !== "completed"
    );
    return `${dueToday.length} task(s) due today:\n${listOrNone(dueToday, columns, "Nothing due today.")}`;
  }

  const assignees = Array.from(new Set(tasks.map((t) => t.assignee)));
  const matchedAssignee = assignees.find((a) => q.includes(a.toLowerCase()));

  const matchedPriority = Object.keys(PRIORITY_WORDS).find((word) => q.includes(word));
  const priority = matchedPriority ? PRIORITY_WORDS[matchedPriority] : undefined;

  const matchedColumn = columns.find(
    (c) => q.includes(c.label.toLowerCase()) || q.includes(c.key.replace(/_/g, " "))
  );

  if (matchedAssignee || priority || matchedColumn) {
    const filtered = tasks.filter((t) => {
      if (matchedAssignee && t.assignee !== matchedAssignee) return false;
      if (priority && t.priority !== priority) return false;
      if (matchedColumn && t.status !== matchedColumn.key) return false;
      return true;
    });
    const parts = [
      matchedAssignee && `assigned to ${matchedAssignee}`,
      priority && `priority ${priority}`,
      matchedColumn && `in ${matchedColumn.label}`,
    ].filter(Boolean);
    return `${filtered.length} task(s) ${parts.join(", ")}:\n${listOrNone(filtered, columns, "No matching tasks.")}`;
  }

  if (q.includes("how many") || q.includes("total") || q.includes("summary") || q.includes("count")) {
    const breakdown = columns
      .map((c) => `${c.label}: ${tasks.filter((t) => t.status === c.key).length}`)
      .join(" · ");
    return `Total tasks: ${tasks.length}\n${breakdown}`;
  }

  return `I didn't catch that.\n\n${HELP_TEXT}`;
}
