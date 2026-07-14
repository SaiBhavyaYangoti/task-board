import { Router } from "express";
import { Column, COLUMN_PALETTE } from "../models/Column";
import { Task } from "../models/Task";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "column";
}

router.get("/", async (_req, res) => {
  const columns = await Column.find().sort({ order: 1 });
  res.json(columns);
});

router.post("/", async (req, res) => {
  const { label } = req.body;
  if (!label || !label.trim()) {
    return res.status(400).json({ error: "label is required" });
  }

  const baseKey = slugify(label);
  let key = baseKey;
  let suffix = 1;
  while (await Column.exists({ key })) {
    key = `${baseKey}_${suffix++}`;
  }

  const count = await Column.countDocuments();
  const lastColumn = await Column.findOne().sort({ order: -1 });
  const order = lastColumn ? lastColumn.order + 1 : 0;
  const color = COLUMN_PALETTE[count % COLUMN_PALETTE.length];

  const column = await Column.create({ key, label: label.trim(), order, color });
  res.status(201).json(column);
});

router.delete("/:key", async (req, res) => {
  const { key } = req.params;
  const column = await Column.findOne({ key });
  if (!column) return res.status(404).json({ error: "Column not found" });

  const taskCount = await Task.countDocuments({ status: key });
  if (taskCount > 0) {
    return res.status(409).json({
      error: `Move or delete the ${taskCount} task(s) in this column before deleting it`,
    });
  }

  const remaining = await Column.countDocuments();
  if (remaining <= 1) {
    return res.status(400).json({ error: "At least one column must remain" });
  }

  await column.deleteOne();
  res.status(204).send();
});

export default router;
