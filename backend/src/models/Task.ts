import { Schema, model, Document, Types } from "mongoose";

export const TASK_PRIORITIES = ["P0", "P1", "P2", "P3"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface ITask extends Document {
  title: string;
  description: string;
  status: string;
  priority: TaskPriority;
  assignee: string;
  frontendTech: string;
  backendTech: string;
  createdBy: Types.ObjectId;
  assignedAt: Date;
  dueDate: Date | null;
  completedAt: Date | null;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, required: true },
    priority: { type: String, enum: TASK_PRIORITIES, default: "P2" },
    assignee: { type: String, required: true, trim: true },
    frontendTech: { type: String, default: "" },
    backendTech: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedAt: { type: Date, default: Date.now },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Task = model<ITask>("Task", taskSchema);
