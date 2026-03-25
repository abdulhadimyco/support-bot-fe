import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

export function Header() {
  const { agent } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-c3-border bg-c3-surface px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-c3-text">myco</span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-c3-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-c3-accent" />
          </span>
        </div>
        <Badge
          variant="outline"
          className="border-c3-accent/30 bg-c3-accent-dim font-mono text-[10px] tracking-widest text-c3-accent"
        >
          C3PA ONLINE
        </Badge>
      </div>

      {agent && (
        <div className="flex items-center gap-2 text-sm text-c3-text-muted">
          <span className="font-mono text-xs">{agent.name}</span>
          <Badge variant="secondary" className="text-[10px]">
            {agent.role}
          </Badge>
        </div>
      )}
    </header>
  );
}
