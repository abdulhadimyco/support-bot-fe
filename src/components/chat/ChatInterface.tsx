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

interface UploadedFile {
  file: File;
  url: string;
  mediaType: string;
  localPreview: string;
}

interface ChatInterfaceProps {
  threadId: string | null;
  onThreadCreated?: (id: string, summary?: string) => void;
}

export function ChatInterface({ threadId, onThreadCreated }: ChatInterfaceProps) {
  const { agent } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
          return token ? { Authorization: `Bearer ${token}` } : {};
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
    onError: (err) => toast.error(err.message || "Something went wrong"),
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
              files?: Array<{
                mediaType: string;
                url: string;
                filename?: string;
              }> | null;
            }>;
          };
        }>(`/api/threads/${threadId}`)
        .then((res) => {
          const loaded = res.data.messages.map((m) => {
            const parts: Array<Record<string, unknown>> = [
              { type: "text" as const, text: m.content as string },
            ];

            if (m.files) {
              for (const f of m.files) {
                parts.push({ type: "file", mediaType: f.mediaType, url: f.url, filename: f.filename });
              }
            }

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

            return { id: m.id, role: m.role as "user" | "assistant", parts };
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
    setUploadedFile(null);
  }, [threadId, setMessages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      userAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
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
    if (error) toast.error(error.message || "Something went wrong");
  }, [error]);

  const agentInitials =
    agent?.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AG";

  const isStreaming = status === "streaming" || status === "submitted";

  const handleAttach = useCallback(async (file: File | null) => {
    if (!file) {
      setUploadedFile(null);
      return;
    }

    setIsUploading(true);
    const localPreview = URL.createObjectURL(file);
    const mediaType = file.type || "application/octet-stream";

    try {
      const presignRes = await api.post<{ uploadUrl: string; key: string }>(
        "/api/upload/presign",
        { mediaType, filename: file.name },
      );

      await fetch(presignRes.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": mediaType },
        body: file,
      });

      const viewRes = await api.post<{ url: string }>(
        "/api/upload/view",
        { key: presignRes.key },
      );

      setUploadedFile({ file, url: viewRes.url, mediaType, localPreview });
    } catch {
      toast.error("Failed to upload file");
      URL.revokeObjectURL(localPreview);
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() && !uploadedFile) return;
      if (isUploading) return;

      const currentFile = uploadedFile;
      setInput("");
      setUploadedFile(null);

      if (!threadIdRef.current) {
        try {
          const res = await api.post<{ data: Thread }>("/api/threads", {
            title: text.trim().slice(0, 100) || "Screenshot analysis",
          });
          threadIdRef.current = res.data.id;
          isNewThreadRef.current = true;
          onThreadCreated?.(res.data.id, text.trim().slice(0, 80) || "Screenshot analysis");
        } catch {
          toast.error("Failed to create conversation");
          return;
        }
      }

      userAtBottomRef.current = true;

      const files: Array<{ type: "file"; mediaType: string; url: string; filename?: string; _localPreview?: string }> = [];

      if (currentFile) {
        files.push({
          type: "file",
          mediaType: currentFile.mediaType,
          url: currentFile.url,
          filename: currentFile.file.name,
          _localPreview: currentFile.localPreview,
        });
      }

      await sendMessage({
        text: text.trim() || "(attached file)",
        ...(files.length > 0 ? { files } : {}),
      });
    },
    [sendMessage, onThreadCreated, uploadedFile, isUploading],
  );

  const handleSuggestion = useCallback(
    (text: string) => handleSend(text),
    [handleSend],
  );

  function onSubmit() {
    if (isUploading) return;
    if (!input.trim() && !uploadedFile) return;
    handleSend(input);
  }

  const hasMessages = messages.length > 0;
  const isExistingThread = !!threadId;

  function getMessageText(msg: (typeof messages)[number]): string {
    if (!msg.parts) return "";
    return msg.parts
      .filter((p) => p.type === "text")
      .map((p) => ("text" in p ? p.text : ""))
      .join("");
  }

  function getFileParts(msg: (typeof messages)[number]) {
    if (!msg.parts) return [];
    return msg.parts
      .filter((p) => p.type === "file")
      .map((p) => {
        const part = p as unknown as { mediaType: string; url: string; filename?: string; _localPreview?: string };
        return { mediaType: part.mediaType, url: part.url, filename: part.filename, _localPreview: part._localPreview };
      });
  }

  function getToolInvocations(msg: (typeof messages)[number]): ToolInvocationV5[] {
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
              <span className="text-sm text-bot-text-muted">No messages in this conversation</span>
            </div>
          ) : (
            <div className="flex-1 py-4">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role as "user" | "assistant"}
                  content={getMessageText(msg)}
                  agentInitials={agentInitials}
                  files={getFileParts(msg)}
                  toolInvocations={getToolInvocations(msg)}
                  renderToolResult={(invocation) => (
                    <ToolResultRenderer toolName={invocation.toolName} result={invocation.output} />
                  )}
                />
              ))}
              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
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
        attachment={uploadedFile?.file ?? null}
        onAttach={handleAttach}
        isUploading={isUploading}
        isUploaded={!!uploadedFile && !isUploading}
      />
    </div>
  );
}
