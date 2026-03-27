import {
  Plus,
  FileText,
  Download,
  History,
  LogOut,
  User,
  CreditCard,
  Headphones,
  Monitor,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";

interface SidebarProps {
  onNewThread: () => void;
  onQuickAction?: (action: string) => void;
  onGenerateReport?: () => void;
  onDownloadReport?: () => void;
}

const quickActions = [
  { id: "user-lookup", label: "User Lookup", icon: User },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "playback", label: "Playback Issues", icon: Headphones },
  { id: "devices", label: "Devices & Sessions", icon: Monitor },
  { id: "escalate", label: "Escalate", icon: AlertTriangle },
];

export function Sidebar({
  onNewThread,
  onQuickAction,
  onGenerateReport,
  onDownloadReport,
}: SidebarProps) {
  const navigate = useNavigate();
  const { agent, logout } = useAuth();

  return (
    <aside className="flex w-60 flex-col border-r border-bot-border bg-bot-surface">
      <div className="flex-1 p-3">
        <Button
          onClick={onNewThread}
          className="mb-4 w-full bg-bot-accent text-bg-base hover:bg-bot-accent/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Thread
        </Button>

        <div className="mb-2 px-2 font-mono text-[9px] uppercase tracking-widest text-bot-text-muted">
          Quick Actions
        </div>

        <div className="space-y-0.5">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onQuickAction?.(action.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-bot-text-dim transition-colors hover:bg-bot-surface2 hover:text-bot-text"
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.label}
            </button>
          ))}
        </div>

        <Separator className="my-3 bg-border-subtle" />

        <div className="space-y-0.5">
          <button
            onClick={onGenerateReport}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-bot-text-dim transition-colors hover:bg-bot-surface2 hover:text-bot-text"
          >
            <FileText className="h-3.5 w-3.5" />
            Generate Report
          </button>
          <button
            onClick={onDownloadReport}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-bot-text-dim transition-colors hover:bg-bot-surface2 hover:text-bot-text"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
          <button
            onClick={() => navigate("/history")}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-bot-text-dim transition-colors hover:bg-bot-surface2 hover:text-bot-text"
          >
            <History className="h-3.5 w-3.5" />
            View History
          </button>
        </div>
      </div>

      <div className="border-t border-bot-border p-3">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-bot-accent/15 font-mono text-xs font-medium text-bot-accent">
            {agent?.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() ?? "??"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-bot-text">
              {agent?.name}
            </div>
            <div className="truncate font-mono text-[10px] text-bot-text-muted">
              {agent?.email}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-bot-text-muted hover:text-bot-danger"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
