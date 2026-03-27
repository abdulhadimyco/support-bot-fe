import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StreamingText } from "@/components/chat/StreamingText";
import { ModelTag } from "@/components/shared/ModelTag";
import type { MessageMetadata } from "@/lib/types";

export interface ToolInvocationV5 {
  toolCallId: string;
  toolName: string;
  state: string;
  input?: Record<string, unknown>;
  output?: unknown;
}

export interface FilePart {
  mediaType: string;
  url: string;
  filename?: string;
  _localPreview?: string;
}

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  agentInitials?: string;
  metadata?: MessageMetadata | null;
  files?: FilePart[];
  toolInvocations?: ToolInvocationV5[];
  renderToolResult?: (invocation: ToolInvocationV5) => React.ReactNode;
}

export function MessageBubble({
  role,
  content,
  agentInitials = "AG",
  metadata,
  files,
  toolInvocations,
  renderToolResult,
}: MessageBubbleProps) {
  const isUser = role === "user";

  const completedTools = (() => {
    const all = toolInvocations?.filter(
      (inv) => inv.state === "output-available" && inv.output,
    );
    if (!all?.length) return all;
    const byName = new Map<string, ToolInvocationV5>();
    for (const inv of all) byName.set(inv.toolName, inv);
    return Array.from(byName.values());
  })();

  const isImage = (mediaType: string) => mediaType.startsWith("image/");
  const displayContent = content === "(attached file)" ? "" : content;

  // Resolve display URL: prefer local preview (live chat) → http URL (history) → skip S3 keys
  const getDisplayUrl = (file: FilePart): string | null => {
    if (file._localPreview) return file._localPreview;
    if (file.url.startsWith("data:") || file.url.startsWith("http")) return file.url;
    return null; // S3 key without presigned URL — can't display
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 24 : -24, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 30,
        mass: 0.8,
      }}
      className={cn("flex gap-3 px-4 py-3", isUser ? "flex-row-reverse" : "")}
    >
      <Avatar
        className={cn(
          "h-[30px] w-[30px] shrink-0 rounded-md",
          isUser ? "bg-bot-text-muted/20" : "glow-accent-box bg-bot-accent/15",
        )}
      >
        <AvatarFallback
          className={cn(
            "rounded-md font-mono text-[10px] font-semibold",
            isUser ? "bg-bot-text-muted/20 text-bot-text-muted" : "bg-bot-accent/15 text-bot-accent",
          )}
        >
          {isUser ? agentInitials : "SH"}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "min-w-0 rounded-lg px-3 py-2",
          isUser
            ? "max-w-[70%] bg-bot-accent-dim text-bot-text"
            : "w-full max-w-[80%] bg-bot-surface text-bot-text",
        )}
      >
        {/* File attachments */}
        {files && files.length > 0 && (
          <div className="mb-2 flex flex-col gap-2">
            {files.map((file, i) => {
              const src = getDisplayUrl(file);
              return isImage(file.mediaType) && src ? (
                <img
                  key={i}
                  src={src}
                  alt={file.filename || "Attached image"}
                  className="max-h-[300px] max-w-full rounded-md border border-bot-border object-contain"
                />
              ) : (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-md border border-bot-border bg-bot-surface2 px-3 py-2"
                >
                  <FileText className="h-4 w-4 shrink-0 text-bot-accent" />
                  <span className="truncate font-mono text-xs text-bot-text-dim">
                    {file.filename || "Attachment"}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-bot-text-muted">
                    {file.mediaType}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {displayContent && <StreamingText content={displayContent} />}

        {completedTools?.map((invocation) => {
          const rendered = renderToolResult?.(invocation);
          if (!rendered) return null;
          return (
            <div key={invocation.toolCallId} className="mt-2">
              {rendered}
            </div>
          );
        })}

        {metadata && (metadata.model || metadata.provider) && (
          <div className="mt-2">
            <ModelTag metadata={metadata} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
