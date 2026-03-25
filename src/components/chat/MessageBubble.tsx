import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StreamingText } from "@/components/chat/StreamingText";
import { ModelTag } from "@/components/shared/ModelTag";
import type { MessageMetadata } from "@/lib/types";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  agentInitials?: string;
  metadata?: MessageMetadata | null;
  toolInvocations?: ToolInvocation[];
  renderToolResult?: (invocation: ToolInvocation) => React.ReactNode;
}

export interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: "partial-call" | "call" | "result";
  result?: unknown;
}

export function MessageBubble({
  role,
  content,
  agentInitials = "AG",
  metadata,
  toolInvocations,
  renderToolResult,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn("flex gap-3 px-4 py-3", isUser ? "flex-row-reverse" : "")}
    >
      <Avatar
        className={cn(
          "h-[30px] w-[30px] shrink-0 rounded-md",
          isUser ? "bg-c3-text-muted/20" : "bg-c3-accent/15",
        )}
      >
        <AvatarFallback
          className={cn(
            "rounded-md font-mono text-[10px] font-semibold",
            isUser ? "bg-c3-text-muted/20 text-c3-text-muted" : "bg-c3-accent/15 text-c3-accent",
          )}
        >
          {isUser ? agentInitials : "C3"}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-[80%] min-w-0 rounded-lg px-3 py-2",
          isUser
            ? "bg-c3-accent-dim text-c3-text"
            : "bg-c3-surface text-c3-text",
        )}
      >
        {content && <StreamingText content={content} />}

        {toolInvocations?.map((invocation) => (
          <div key={invocation.toolCallId} className="mt-2">
            {invocation.state === "result" && renderToolResult
              ? renderToolResult(invocation)
              : invocation.state !== "result" && (
                  <div className="flex items-center gap-2 font-mono text-xs text-c3-text-muted">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-c3-accent" />
                    Calling {invocation.toolName}...
                  </div>
                )}
          </div>
        ))}

        {metadata && (metadata.model || metadata.provider) && (
          <div className="mt-2">
            <ModelTag metadata={metadata} />
          </div>
        )}
      </div>
    </div>
  );
}
