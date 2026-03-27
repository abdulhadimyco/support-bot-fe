import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "border-accent/40 bg-accent/10 text-accent",
  completed: "border-accent/40 bg-accent/10 text-accent",
  paid: "border-accent/40 bg-accent/10 text-accent",
  pending: "border-warning/40 bg-warning/10 text-warning",
  processing: "border-warning/40 bg-warning/10 text-warning",
  canceled: "border-danger/40 bg-danger/10 text-danger",
  failed: "border-danger/40 bg-danger/10 text-danger",
  expired: "border-danger/40 bg-danger/10 text-danger",
  inactive: "border-text-muted/40 bg-text-muted/10 text-text-muted",
  closed: "border-text-muted/40 bg-text-muted/10 text-text-muted",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const style =
    statusStyles[normalized] ??
    "border-text-muted/40 bg-text-muted/10 text-text-muted";

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
