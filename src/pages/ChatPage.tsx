import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { ChatHistory } from "@/components/layout/ChatHistory";
import { ChatInterface } from "@/components/chat/ChatInterface";

import DarkVeil from "@/components/DarkVeil";
import LightRays from "@/components/LightRays";
import Hyperspeed from "@/components/Hyperspeed";
import { hyperspeedPresets } from "@/components/HyperSpeedPresets";
import { AuroraBackground } from "@/components/ui/aurora-background";

const BACKGROUNDS = ["aurora", "darkveil", "lightrays", "hyperspeed"] as const;

function RandomBackground({ pick }: { pick: (typeof BACKGROUNDS)[number] }) {
  switch (pick) {
    case "aurora":
      return (
        <AuroraBackground className="pointer-events-none absolute inset-0 !h-full" showRadialGradient>
          <div />
        </AuroraBackground>
      );
    case "darkveil":
      return (
        <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
          <DarkVeil hueShift={150} />
        </div>
      );
    case "lightrays":
      return (
        <div className="pointer-events-none absolute inset-0 z-0">
          <LightRays raysColor="#00ff99" raysSpeed={0.5} lightSpread={2} rayLength={3} pulsating fadeDistance={1.5} saturation={1.2} followMouse mouseInfluence={0.1} />
        </div>
      );
    case "hyperspeed":
      return (
        <div className="pointer-events-none absolute inset-0 z-0">
          <Hyperspeed effectOptions={hyperspeedPresets.myco} />
        </div>
      );
  }
}

export function ChatPage() {
  const { threadId: paramThreadId } = useParams<{ threadId?: string }>();
  const navigate = useNavigate();
  const [threadId, setThreadId] = useState<string | null>(
    paramThreadId ?? null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const addThreadRef = useRef<((id: string, summary: string) => void) | null>(
    null,
  );

  // Pick a random background once on mount (persists across re-renders, changes on refresh)
  const bg = useMemo(
    () => BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)],
    [],
  );

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
        <main className="relative flex flex-1 flex-col overflow-hidden bg-bot-bg">
          <RandomBackground pick={bg} />
          <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
            <ChatInterface
              threadId={threadId}
              onThreadCreated={handleThreadCreated}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
