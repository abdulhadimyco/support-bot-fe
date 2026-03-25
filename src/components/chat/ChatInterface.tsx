import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { WelcomeScreen } from "@/components/layout/WelcomeScreen";
import { ToolResultRenderer } from "@/components/chat/ToolResultRenderer";
import { useAuth, getToken } from "@/lib/auth";
import { api } from "@/lib/api-client";
import type { Thread } from "@/lib/types";
import type { ToolInvocation } from "@/components/chat/MessageBubble";

interface ChatInterfaceProps {
  threadId: string | null;
  onThreadCreated?: (id: string, summary?: string) => void;
}

export function ChatInterface({
  threadId,
  onThreadCreated,
}: ChatInterfaceProps) {
  const { agent } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const threadIdRef = useRef(threadId);
  const isNewThreadRef = useRef(false);
  const userAtBottomRef = useRef(true);

  threadIdRef.current = threadId;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: (): Record<string, string> => {
          const token = getToken();
          if (!token) return {};
          return { Authorization: `Bearer ${token}` };
        },
        body: () => {
          const tid = threadIdRef.current;
          return tid ? { threadId: tid } : {};
        },
      }),
    [],
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport,
    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  // Load existing thread messages when threadId changes
  // Skip if we just created this thread (messages are already in useChat state)
  useEffect(() => {
    if (isNewThreadRef.current) {
      isNewThreadRef.current = false;
      return;
    }

    if (threadId) {
      api
        .get<{
          data: {
            messages: Array<{
              id: string;
              role: "user" | "assistant";
              content: string;
            }>;
          };
        }>(`/api/threads/${threadId}`)
        .then((res) => {
          const loaded = res.data.messages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            parts: [{ type: "text" as const, text: m.content as string }],
          }));
          setMessages(loaded);
        })
        .catch((err) => {
          console.error("Failed to load thread messages:", err);
          setMessages([]);
        });
    } else {
      setMessages([]);
    }
    setInput("");
    setAttachment(null);
  }, [threadId, setMessages]);

  // Track if user is scrolled near the bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 100;
      userAtBottomRef.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll only if user is at the bottom
  useEffect(() => {
    if (userAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

  // Show errors as toasts
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Something went wrong");
    }
  }, [error]);

  const agentInitials =
    agent?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AG";

  const isStreaming = status === "streaming" || status === "submitted";

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setInput("");
      setAttachment(null);

      // If no thread yet, create one first via API
      if (!threadIdRef.current) {
        try {
          const res = await api.post<{ data: Thread }>("/api/threads", {
            title: text.trim().slice(0, 100),
          });
          const newThreadId = res.data.id;
          threadIdRef.current = newThreadId;
          // Mark as new so the useEffect doesn't wipe messages
          isNewThreadRef.current = true;
          onThreadCreated?.(newThreadId, text.trim().slice(0, 80));
        } catch {
          toast.error("Failed to create conversation");
          return;
        }
      }

      // Scroll to bottom when user sends a message
      userAtBottomRef.current = true;
      await sendMessage({ text: text.trim() });
    },
    [sendMessage, onThreadCreated],
  );

  const handleSuggestion = useCallback(
    (text: string) => handleSend(text),
    [handleSend],
  );

  function onSubmit() {
    if (!input.trim() && !attachment) return;
    handleSend(input);
  }

  const hasMessages = messages.length > 0;

  function getMessageText(msg: (typeof messages)[number]): string {
    if (msg.parts) {
      return msg.parts
        .filter((p) => p.type === "text")
        .map((p) => ("text" in p ? p.text : ""))
        .join("");
    }
    return "";
  }

  function getToolInvocations(
    msg: (typeof messages)[number],
  ): ToolInvocation[] {
    if (!msg.parts) return [];
    return msg.parts
      .filter((p) => p.type === "tool-invocation")
      .map((p) => p as unknown as ToolInvocation);
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Scrollable message area — plain div, not ScrollArea */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col">
          {!hasMessages ? (
            <WelcomeScreen onSuggestion={handleSuggestion} />
          ) : (
            <div className="flex-1 py-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role as "user" | "assistant"}
                  content={getMessageText(msg)}
                  agentInitials={agentInitials}
                  toolInvocations={getToolInvocations(msg)}
                  renderToolResult={(invocation) => (
                    <ToolResultRenderer
                      toolName={invocation.toolName}
                      result={invocation.result}
                    />
                  )}
                />
              ))}
              {isStreaming &&
                messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-3 px-4 py-3">
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-c3-accent/15 font-mono text-[10px] font-semibold text-c3-accent">
                      C3
                    </div>
                    <TypingIndicator />
                  </div>
                )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <MessageInput
        value={input}
        onChange={setInput}
        onSubmit={onSubmit}
        isLoading={isStreaming}
        attachment={attachment}
        onAttach={setAttachment}
      />
    </div>
  );
}
