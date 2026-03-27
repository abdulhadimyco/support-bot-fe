import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai";
import { toast } from "sonner";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { WelcomeScreen } from "@/components/layout/WelcomeScreen";
import { ToolResultRenderer } from "@/components/chat/ToolResultRenderer";
import { useAuth, getToken } from "@/lib/auth";
import { api } from "@/lib/api-client";
import type { Thread } from "@/lib/types";
import type { ToolInvocationV5 } from "@/components/chat/MessageBubble";

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
  const [loadingThread, setLoadingThread] = useState(!!threadId);
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

  useEffect(() => {
    if (isNewThreadRef.current) {
      isNewThreadRef.current = false;
      return;
    }

    if (threadId) {
      setLoadingThread(true);
      api
        .get<{
          data: {
            messages: Array<{
              id: string;
              role: "user" | "assistant";
              content: string;
              toolInvocations?: Array<{
                toolCallId: string;
                toolName: string;
                input?: Record<string, unknown>;
                output?: unknown;
              }> | null;
            }>;
          };
        }>(`/api/threads/${threadId}`)
        .then((res) => {
          const loaded = res.data.messages.map((m) => {
            const parts: Array<Record<string, unknown>> = [
              { type: "text" as const, text: m.content as string },
            ];

            if (m.toolInvocations) {
              for (const inv of m.toolInvocations) {
                parts.push({
                  type: `tool-${inv.toolName}`,
                  toolCallId: inv.toolCallId,
                  toolName: inv.toolName,
                  state: "output-available",
                  input: inv.input ?? {},
                  output: inv.output,
                });
              }
            }

            return {
              id: m.id,
              role: m.role as "user" | "assistant",
              parts,
            };
          });
          setMessages(loaded as any);
        })
        .catch((err) => {
          console.error("Failed to load thread messages:", err);
          setMessages([]);
        })
        .finally(() => setLoadingThread(false));
    } else {
      setLoadingThread(false);
      setMessages([]);
    }
    setInput("");
    setAttachment(null);
  }, [threadId, setMessages]);

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

  useEffect(() => {
    if (userAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
    }
  }, [messages]);

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

      if (!threadIdRef.current) {
        try {
          const res = await api.post<{ data: Thread }>("/api/threads", {
            title: text.trim().slice(0, 100),
          });
          const newThreadId = res.data.id;
          threadIdRef.current = newThreadId;
          isNewThreadRef.current = true;
          onThreadCreated?.(newThreadId, text.trim().slice(0, 80));
        } catch {
          toast.error("Failed to create conversation");
          return;
        }
      }

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
  const isExistingThread = !!threadId;

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
  ): ToolInvocationV5[] {
    if (!msg.parts) return [];
    return msg.parts
      .filter((p) => isToolUIPart(p))
      .map((p) => {
        const part = p as unknown as Record<string, unknown>;
        return {
          toolCallId: part.toolCallId as string,
          toolName: getToolName(p as any),
          state: part.state as string,
          input: part.input as Record<string, unknown> | undefined,
          output: part.output as unknown,
        };
      });
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col">
          {loadingThread ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-bot-text-muted">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-bot-text-muted border-t-bot-accent" />
                <span className="text-xs">Loading conversation...</span>
              </div>
            </div>
          ) : !hasMessages && !isExistingThread ? (
            <WelcomeScreen onSuggestion={handleSuggestion} />
          ) : !hasMessages && isExistingThread ? (
            <div className="flex flex-1 items-center justify-center">
              <span className="text-sm text-bot-text-muted">
                No messages in this conversation
              </span>
            </div>
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
                      result={invocation.output}
                    />
                  )}
                />
              ))}
              {isStreaming &&
                messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-3 px-4 py-3">
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-bot-accent/15 font-mono text-[10px] font-semibold text-bot-accent">
                      SH
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
