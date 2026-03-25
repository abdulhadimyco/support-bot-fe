import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "border-c3-accent/40 bg-c3-accent/10 text-c3-accent",
  completed: "border-c3-accent/40 bg-c3-accent/10 text-c3-accent",
  paid: "border-c3-accent/40 bg-c3-accent/10 text-c3-accent",
  pending: "border-c3-warning/40 bg-c3-warning/10 text-c3-warning",
  processing: "border-c3-warning/40 bg-c3-warning/10 text-c3-warning",
  canceled: "border-c3-danger/40 bg-c3-danger/10 text-c3-danger",
  failed: "border-c3-danger/40 bg-c3-danger/10 text-c3-danger",
  expired: "border-c3-danger/40 bg-c3-danger/10 text-c3-danger",
  inactive: "border-c3-text-muted/40 bg-c3-text-muted/10 text-c3-text-muted",
  closed: "border-c3-text-muted/40 bg-c3-text-muted/10 text-c3-text-muted",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const style =
    statusStyles[normalized] ??
    "border-c3-text-muted/40 bg-c3-text-muted/10 text-c3-text-muted";

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono text-[10px] uppercase tracking-wider",
        style,
        className,
      )}
    >
      {status}
    </Badge>
  );
}
