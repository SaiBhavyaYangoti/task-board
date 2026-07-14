import { Router } from "express";
import { Task, TASK_PRIORITIES } from "../models/Task";
import { Column } from "../models/Column";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

async function firstColumnKey(): Promise<string> {
  const first = await Column.findOne().sort({ order: 1 });
  return first?.key ?? "todo";
}

router.get("/", async (_req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

router.post("/", async (req: AuthRequest, res) => {
  const { title, description, assignee, frontendTech, backendTech, status, priority, dueDate } = req.body;
  if (!title || !assignee) {
    return res.status(400).json({ error: "title and assignee are required" });
  }

  let resolvedStatus = status;
  if (!resolvedStatus || !(await Column.exists({ key: resolvedStatus }))) {
    resolvedStatus = await firstColumnKey();
  }

  const task = await Task.create({
    title,
    description,
    assignee,
    frontendTech,
    backendTech,
    status: resolvedStatus,
    priority: priority && TASK_PRIORITIES.includes(priority) ? priority : "P2",
    dueDate: dueDate ? new Date(dueDate) : null,
    createdBy: req.userId,
  });
  res.status(201).json(task);
});

router.patch("/:id", async (req, res) => {
  const { status, title, description, assignee, frontendTech, backendTech, priority, dueDate } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  if (status) {
    const columnExists = await Column.exists({ key: status });
    if (!columnExists) {
      return res.status(400).json({ error: "Unknown column" });
    }
    task.status = status;
    task.completedAt = status === "completed" ? new Date() : null;
  }
  if (priority && TASK_PRIORITIES.includes(priority)) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (assignee !== undefined) task.assignee = assignee;
  if (frontendTech !== undefined) task.frontendTech = frontendTech;
  if (backendTech !== undefined) task.backendTech = backendTech;

  await task.save();
  res.json(task);
});

router.delete("/:id", async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});

export default router;
