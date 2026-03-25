import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ChatHistory } from "@/components/layout/ChatHistory";
import { ChatInterface } from "@/components/chat/ChatInterface";

export function ChatPage() {
  const { threadId: paramThreadId } = useParams<{ threadId?: string }>();
  const navigate = useNavigate();
  const [threadId, setThreadId] = useState<string | null>(
    paramThreadId ?? null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const addThreadRef = useRef<((id: string, summary: string) => void) | null>(null);

  // Sync threadId when URL params change (e.g. clicking a sidebar thread)
  useEffect(() => {
    setThreadId(paramThreadId ?? null);
  }, [paramThreadId]);

  const handleNewThread = useCallback(() => {
    setThreadId(null);
    navigate("/chat", { replace: true });
  }, [navigate]);

  const handleThreadCreated = useCallback(
    (id: string, summary?: string) => {
      setThreadId(id);
      navigate(`/chat/${id}`, { replace: true });
      addThreadRef.current?.(id, summary || "New conversation");
    },
    [navigate],
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ChatHistory
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          onNewThread={handleNewThread}
          activeThreadId={threadId}
          addThreadRef={addThreadRef}
        />
        <main className="flex flex-1 flex-col overflow-hidden bg-c3-bg">
          <ChatInterface
            threadId={threadId}
            onThreadCreated={handleThreadCreated}
          />
        </main>
      </div>
    </div>
  );
}
