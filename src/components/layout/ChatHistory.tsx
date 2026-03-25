import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  PanelLeftClose,
  PanelLeft,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Thread } from "@/lib/types";

// TODO: Replace with real API call when backend is ready
const MOCK_THREADS: Thread[] = [
  {
    id: "t1",
    agentId: "agent-001",
    customerEmail: "john@example.com",
    customerName: "John Doe",
    summary: "Payment not reflecting after JazzCash transaction",
    status: "active",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "t2",
    agentId: "agent-001",
    customerEmail: "sara@example.com",
    customerName: "Sara Ahmed",
    summary: "Cannot access premium content after renewal",
    status: "active",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "t3",
    agentId: "agent-001",
    customerEmail: "ali@example.com",
    customerName: "Ali Khan",
    summary: "Live stream buffering on mobile app",
    status: "closed",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

interface ChatHistoryProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewThread: () => void;
  activeThreadId: string | null;
  addThreadRef?: React.RefObject<((id: string, summary: string) => void) | null>;
}

export function ChatHistory({
  isOpen,
  onToggle,
  onNewThread,
  activeThreadId,
  addThreadRef,
}: ChatHistoryProps) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Expose addThread so ChatPage can push new threads into the sidebar
  if (addThreadRef) {
    addThreadRef.current = (id: string, summary: string) => {
      const now = new Date().toISOString();
      setThreads((prev) => [
        {
          id,
          agentId: "",
          customerEmail: null,
          customerName: null,
          summary,
          status: "active",
          createdAt: now,
          updatedAt: now,
        },
        ...prev,
      ]);
    };
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  function startRename(thread: Thread) {
    setEditingId(thread.id);
    setEditValue(thread.summary ?? "");
  }

  function confirmRename() {
    if (!editingId) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === editingId ? { ...t, summary: editValue.trim() || t.summary } : t,
      ),
    );
    setEditingId(null);
    setEditValue("");
  }

  function cancelRename() {
    setEditingId(null);
    setEditValue("");
  }

  function deleteThread(id: string) {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThreadId === id) {
      onNewThread();
    }
  }

  // Collapsed state — just show toggle button
  if (!isOpen) {
    return (
      <aside className="flex w-12 flex-col items-center border-r border-c3-border bg-c3-surface py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-c3-text-muted hover:text-c3-text"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewThread}
          className="mt-2 h-8 w-8 text-c3-text-muted hover:text-c3-accent"
          title="New Thread"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col overflow-hidden border-r border-c3-border bg-c3-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-c3-border px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-c3-text-muted">
          Chats
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewThread}
            className="h-7 w-7 text-c3-text-muted hover:text-c3-accent"
            title="New Thread"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-7 w-7 text-c3-text-muted hover:text-c3-text"
            title="Close sidebar"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Thread list */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2">
          {threads.length === 0 ? (
            <div className="py-8 text-center text-xs text-c3-text-muted">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-0.5">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors ${
                    activeThreadId === thread.id
                      ? "bg-c3-surface2 text-c3-text"
                      : "text-c3-text-dim hover:bg-c3-surface2 hover:text-c3-text"
                  }`}
                >
                  {editingId === thread.id ? (
                    <div className="flex flex-1 items-center gap-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmRename();
                          if (e.key === "Escape") cancelRename();
                        }}
                        className="h-6 border-c3-accent/50 bg-c3-bg px-1.5 text-xs text-c3-text focus-visible:ring-c3-accent/30"
                        autoFocus
                      />
                      <button
                        onClick={confirmRename}
                        className="shrink-0 text-c3-accent hover:text-c3-accent/80"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="shrink-0 text-c3-text-muted hover:text-c3-text"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/chat/${thread.id}`)}
                        className="flex min-w-0 flex-1 items-center gap-2"
                      >
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-c3-text-muted" />
                        <span className="truncate text-xs">
                          {thread.summary ?? "Untitled"}
                        </span>
                      </button>
                      <span className="shrink-0 font-mono text-[9px] text-c3-text-muted opacity-0 group-hover:opacity-100">
                        {timeAgo(thread.updatedAt)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="shrink-0 rounded p-0.5 text-c3-text-muted opacity-0 hover:text-c3-text group-hover:opacity-100">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="border-c3-border bg-c3-surface"
                        >
                          <DropdownMenuItem
                            onClick={() => startRename(thread)}
                            className="text-xs text-c3-text-dim hover:text-c3-text focus:bg-c3-surface2 focus:text-c3-text"
                          >
                            <Pencil className="mr-2 h-3 w-3" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteThread(thread.id)}
                            className="text-xs text-c3-danger focus:bg-c3-danger/10 focus:text-c3-danger"
                          >
                            <Trash2 className="mr-2 h-3 w-3" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
