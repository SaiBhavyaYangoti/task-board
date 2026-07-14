const PALETTE = [
  "#ef4444", "#f59e0b", "#10b981", "#0ea5e9",
  "#6366f1", "#a855f7", "#ec4899", "#14b8a6",
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function Avatar({ name, size = 22 }: { name: string; size?: number }) {
  return (
    <span
      title={name}
      className="inline-flex items-center justify-center rounded-full text-white font-semibold shrink-0"
      style={{ backgroundColor: colorFor(name), width: size, height: size, fontSize: size * 0.42 }}
    >
      {initialsFor(name) || "?"}
    </span>
  );
}
