import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, ChevronRight, Brain } from "lucide-react";

interface StreamingTextProps {
  content: string;
}

interface ParsedSegment {
  type: "text" | "thinking";
  content: string;
  streaming?: boolean;
}

function stripDevAlerts(raw: string): string {
  return raw.replace(/\[DEV_ALERT\][\s\S]*?(\[\/DEV_ALERT\]|$)/gi, "");
}

function parseContent(raw: string): ParsedSegment[] {
  const cleaned = stripDevAlerts(raw).trim();
  const result: ParsedSegment[] = [];

  const thinkRegex = /<think>([\s\S]*?)(<\/think>|$)/g;
  let lastIndex = 0;
  let match;

  while ((match = thinkRegex.exec(cleaned)) !== null) {
    const before = cleaned.slice(lastIndex, match.index).trim();
    if (before) result.push({ type: "text", content: before });

    const thinkContent = match[1].trim();
    const isClosed = match[2] === "</think>";
    if (thinkContent)
      result.push({ type: "thinking", content: thinkContent, streaming: !isClosed });

    lastIndex = match.index + match[0].length;
  }

  const remaining = cleaned.slice(lastIndex).trim();
  if (remaining) result.push({ type: "text", content: remaining });

  return result;
}

function ThinkingBlock({ content }: { content: string }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="my-2 rounded-md border border-bot-border/50 bg-bot-surface2/50">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-bot-text-muted hover:text-bot-text-dim transition-colors"
      >
        <Brain className="h-3.5 w-3.5 text-bot-accent/60" />
        <span className="font-medium">Thinking</span>
        {collapsed ? (
          <ChevronRight className="ml-auto h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="ml-auto h-3.5 w-3.5" />
        )}
      </button>
      {!collapsed && (
        <div className="border-t border-bot-border/30 px-3 py-2 text-xs leading-relaxed text-bot-text-muted/80 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
          {content}
        </div>
      )}
    </div>
  );
}

export function StreamingText({ content }: StreamingTextProps) {
  const segments = parseContent(content);

  return (
    <div className="space-y-1 font-sans">
      {segments.map((seg, i) => {
        if (seg.type === "thinking") {
          return <ThinkingBlock key={i} content={seg.content} />;
        }

        return (
          <div key={i} className="bot-markdown text-sm leading-relaxed text-bot-text">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {seg.content}
            </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}
