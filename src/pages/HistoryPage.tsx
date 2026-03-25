import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Thread } from "@/lib/types";

// TODO: Replace with real API call when backend is ready
const MOCK_THREADS: Thread[] = [
  {
    id: "t1",
    userId: "",
    customerEmail: "john@example.com",
    customerName: "John Doe",
    summary: "Payment not reflecting after JazzCash transaction",
    status: "active",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "t2",
    userId: "",
    customerEmail: "sara@example.com",
    customerName: "Sara Ahmed",
    summary: "Cannot access premium content after renewal",
    status: "active",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "t3",
    userId: "",
    customerEmail: "ali@example.com",
    customerName: "Ali Khan",
    summary: "Live stream buffering on mobile app",
    status: "closed",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export function HistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const threads = useMemo(() => {
    if (!search) return MOCK_THREADS;
    const q = search.toLowerCase();
    return MOCK_THREADS.filter(
      (t) =>
        t.summary?.toLowerCase().includes(q) ||
        t.customerName?.toLowerCase().includes(q) ||
        t.customerEmail?.toLowerCase().includes(q),
    );
  }, [search]);

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-c3-border bg-c3-surface p-4">
          <div className="mb-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-c3-text-muted hover:text-c3-text"
              onClick={() => navigate("/chat")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-c3-text">
              Conversation History
            </h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-c3-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer email, name, or thread summary..."
              className="border-c3-border bg-c3-bg pl-9 text-c3-text placeholder:text-c3-text-muted focus-visible:ring-c3-accent/50"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-4">
            {threads.length === 0 ? (
              <div className="py-12 text-center font-mono text-sm text-c3-text-muted">
                No conversations found
              </div>
            ) : (
              threads.map((thread) => (
                <Card
                  key={thread.id}
                  onClick={() => navigate(`/chat/${thread.id}`)}
                  className="cursor-pointer border-c3-border bg-c3-surface p-3 transition-colors hover:bg-c3-surface2"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-c3-accent" />
                        <span className="truncate text-sm font-medium text-c3-text">
                          {thread.summary ?? "Untitled conversation"}
                        </span>
                      </div>
                      {(thread.customerName || thread.customerEmail) && (
                        <div className="mt-1 pl-5.5 font-mono text-xs text-c3-text-muted">
                          {thread.customerName ?? thread.customerEmail}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={thread.status} />
                      <span className="font-mono text-[10px] text-c3-text-muted">
                        {timeAgo(thread.updatedAt)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
