import { Schema, model, Document } from "mongoose";

export interface IColumn extends Document {
  key: string;
  label: string;
  order: number;
  color: string;
}

const columnSchema = new Schema<IColumn>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    color: { type: String, required: true },
  },
  { timestamps: true }
);

export const Column = model<IColumn>("Column", columnSchema);

export const DEFAULT_COLUMNS = [
  { key: "todo", label: "To Do", order: 0, color: "#94a3b8" },
  { key: "in_progress", label: "In Progress", order: 1, color: "#f59e0b" },
  { key: "in_review", label: "In Review", order: 2, color: "#0ea5e9" },
  { key: "completed", label: "Completed", order: 3, color: "#10b981" },
];

export const COLUMN_PALETTE = [
  "#94a3b8", "#f59e0b", "#0ea5e9", "#10b981",
  "#6366f1", "#a855f7", "#ec4899", "#14b8a6",
];

export async function ensureDefaultColumns(): Promise<void> {
  const count = await Column.countDocuments();
  if (count === 0) {
    await Column.insertMany(DEFAULT_COLUMNS);
  }
}
