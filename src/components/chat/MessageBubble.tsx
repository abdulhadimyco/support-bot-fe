import { motion } from "framer-motion";
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

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  agentInitials?: string;
  metadata?: MessageMetadata | null;
  toolInvocations?: ToolInvocationV5[];
  renderToolResult?: (invocation: ToolInvocationV5) => React.ReactNode;
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

  // Only render tool results that have output — hide calling indicators and errors from users
  // Deduplicate by toolName — keep only the LAST invocation of each tool to avoid duplicate cards
  const completedTools = (() => {
    const all = toolInvocations?.filter(
      (inv) => inv.state === "output-available" && inv.output,
    );
    if (!all?.length) return all;
    const byName = new Map<string, ToolInvocationV5>();
    for (const inv of all) byName.set(inv.toolName, inv);
    return Array.from(byName.values());
  })();

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
        {content && <StreamingText content={content} />}

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
