import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  Loader2,
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
import { api } from "@/lib/api-client";
import type { Thread } from "@/lib/types";

interface ChatHistoryProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewThread: () => void;
  activeThreadId: string | null;
  addThreadRef?: React.RefObject<((id: string, summary: string) => void) | null>;
}

function ThreadSkeleton() {
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 animate-pulse">
      <div className="h-3.5 w-3.5 rounded bg-c3-surface2" />
      <div className="h-3 flex-1 rounded bg-c3-surface2" />
    </div>
  );
}

export function ChatHistory({
  isOpen,
  onToggle,
  onNewThread,
  activeThreadId,
  addThreadRef,
}: ChatHistoryProps) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Fetch threads from API on mount
  useEffect(() => {
    setLoading(true);
    api
      .get<{ data: Thread[] }>("/api/threads")
      .then((res) => setThreads(res.data))
      .catch((err) => {
        console.error("Failed to fetch threads:", err);
        toast.error("Failed to load conversations");
      })
      .finally(() => setLoading(false));
  }, []);

  // Expose addThread so ChatPage can push new threads into the sidebar
  if (addThreadRef) {
    addThreadRef.current = (id: string, summary: string) => {
      const now = new Date().toISOString();
      setThreads((prev) => {
        if (prev.some((t) => t.id === id)) return prev;
        return [
          {
            id,
            userId: "",
            customerEmail: null,
            customerName: null,
            summary,
            status: "active",
            createdAt: now,
            updatedAt: now,
          },
          ...prev,
        ];
      });
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

  async function confirmRename() {
    if (!editingId || !editValue.trim()) return;
    const title = editValue.trim();

    // Optimistic update
    setThreads((prev) =>
      prev.map((t) =>
        t.id === editingId ? { ...t, summary: title } : t,
      ),
    );
    setEditingId(null);
    setEditValue("");

    try {
      await api.patch(`/api/threads/${editingId}`, { title });
    } catch {
      toast.error("Failed to rename conversation");
    }
  }

  function cancelRename() {
    setEditingId(null);
    setEditValue("");
  }

  async function deleteThread(id: string) {
    // Optimistic update
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThreadId === id) {
      onNewThread();
    }

    try {
      await api.delete(`/api/threads/${id}`);
    } catch {
      toast.error("Failed to delete conversation");
    }
  }

  // Collapsed state
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
          {loading ? (
            <div className="space-y-1">
              <ThreadSkeleton />
              <ThreadSkeleton />
              <ThreadSkeleton />
            </div>
          ) : threads.length === 0 ? (
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
