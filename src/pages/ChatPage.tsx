import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";

export function ChatPage() {
  const { threadId: paramThreadId } = useParams<{ threadId?: string }>();
  const navigate = useNavigate();
  const [threadId, setThreadId] = useState<string | null>(
    paramThreadId ?? null,
  );

  const handleNewThread = useCallback(() => {
    setThreadId(null);
    navigate("/chat", { replace: true });
  }, [navigate]);

  const handleThreadCreated = useCallback(
    (id: string) => {
      setThreadId(id);
      navigate(`/chat/${id}`, { replace: true });
    },
    [navigate],
  );

  const handleQuickAction = useCallback(
    (action: string) => {
      // Quick actions insert a prefilled message into the chat
      const prompts: Record<string, string> = {
        "user-lookup": "Look up user by email ",
        subscription: "Check subscription for ",
        playback: "Check playback issues for ",
        devices: "Check devices and sessions for ",
        escalate: "Escalate this issue: ",
      };
      // For now, we'll rely on ChatInterface suggestion mechanism
      void action;
      void prompts;
    },
    [],
  );

  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onNewThread={handleNewThread}
          onQuickAction={handleQuickAction}
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
