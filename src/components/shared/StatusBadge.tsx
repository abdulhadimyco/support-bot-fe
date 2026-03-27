import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "border-bot-accent/40 bg-bot-accent/10 text-bot-accent",
  completed: "border-bot-accent/40 bg-bot-accent/10 text-bot-accent",
  paid: "border-bot-accent/40 bg-bot-accent/10 text-bot-accent",
  pending: "border-bot-warning/40 bg-bot-warning/10 text-bot-warning",
  processing: "border-bot-warning/40 bg-bot-warning/10 text-bot-warning",
  canceled: "border-bot-danger/40 bg-bot-danger/10 text-bot-danger",
  failed: "border-bot-danger/40 bg-bot-danger/10 text-bot-danger",
  expired: "border-bot-danger/40 bg-bot-danger/10 text-bot-danger",
  inactive: "border-bot-text-muted/40 bg-bot-text-muted/10 text-bot-text-muted",
  closed: "border-bot-text-muted/40 bg-bot-text-muted/10 text-bot-text-muted",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const style =
    statusStyles[normalized] ??
    "border-bot-text-muted/40 bg-bot-text-muted/10 text-bot-text-muted";

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
