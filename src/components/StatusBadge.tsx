import { PROPOSAL_STATUS_LABELS } from "@/config/contracts";

const STATUS_CLASSES: Record<number, string> = {
  0: "status-pending",
  1: "status-approved",
  2: "status-rejected",
  3: "status-executed",
  4: "status-cancelled",
};

export default function StatusBadge({ status }: { status: number }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${STATUS_CLASSES[status] || "bg-muted text-muted-foreground"}`}>
      {PROPOSAL_STATUS_LABELS[status] || "Unknown"}
    </span>
  );
}
