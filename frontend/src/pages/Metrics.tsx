import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../api/client";
import type { Task, Column } from "../types";
import { PRIORITY_LABELS, TASK_PRIORITIES } from "../types";

const PRIORITY_COLORS: Record<string, string> = {
  P0: "#ef4444",
  P1: "#f59e0b",
  P2: "#3b82f6",
  P3: "#94a3b8",
};

const ASSIGNEE_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#a855f7", "#14b8a6", "#ef4444"];

export default function Metrics() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [columns, setColumns] = useState<Column[] | null>(null);

  useEffect(() => {
    Promise.all([api.get<Task[]>("/tasks"), api.get<Column[]>("/columns")]).then(
      ([tasksRes, columnsRes]) => {
        setTasks(tasksRes.data);
        setColumns(columnsRes.data);
      }
    );
  }, []);

  const statusData = useMemo(() => {
    if (!tasks || !columns) return [];
    return columns.map((c) => ({
      key: c.key,
      label: c.label,
      color: c.color,
      count: tasks.filter((t) => t.status === c.key).length,
    }));
  }, [tasks, columns]);

  const priorityData = useMemo(() => {
    if (!tasks) return [];
    return TASK_PRIORITIES.map((p) => ({
      key: p,
      label: PRIORITY_LABELS[p],
      count: tasks.filter((t) => t.priority === p).length,
    }));
  }, [tasks]);

  const assigneeData = useMemo(() => {
    if (!tasks) return [];
    const counts = new Map<string, number>();
    for (const t of tasks) counts.set(t.assignee, (counts.get(t.assignee) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([assignee, count]) => ({ assignee, count }))
      .sort((a, b) => b.count - a.count);
  }, [tasks]);

  if (!tasks || !columns) return <p className="text-slate-500">Loading metrics...</p>;

  const total = tasks.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <StatCard label="Total" value={total} color="#6366f1" />
        {statusData.map((s) => (
          <StatCard key={s.key} label={s.label} value={s.count} color={s.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Tasks per status">
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {statusData.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Status distribution">
          <PieChart>
            <Pie data={statusData} dataKey="count" nameKey="label" outerRadius={100} label>
              {statusData.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>

        <ChartCard title="Tasks per priority">
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="key" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {priorityData.map((entry) => (
                <Cell key={entry.key} fill={PRIORITY_COLORS[entry.key]} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Priority distribution">
          <PieChart>
            <Pie data={priorityData} dataKey="count" nameKey="key" outerRadius={100} label>
              {priorityData.map((entry) => (
                <Cell key={entry.key} fill={PRIORITY_COLORS[entry.key]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ChartCard>

        <ChartCard title="Tasks per assignee" full>
          {assigneeData.length === 0 ? (
            <EmptyState />
          ) : (
            <BarChart data={assigneeData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="assignee" tick={{ fontSize: 12 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {assigneeData.map((entry, i) => (
                  <Cell key={entry.assignee} fill={ASSIGNEE_COLORS[i % ASSIGNEE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, full, children }: { title: string; full?: boolean; children: React.ReactElement }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 ${full ? "lg:col-span-2" : ""}`}>
      <h3 className="font-semibold text-slate-700 mb-4 text-sm">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function EmptyState() {
  return <p className="text-slate-400 text-sm text-center pt-24">No tasks yet</p>;
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex-1 min-w-[140px]">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
