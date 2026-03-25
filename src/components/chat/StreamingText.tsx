import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown, ChevronRight, Brain } from "lucide-react";
import { DevAlert, parseDevAlerts } from "@/components/shared/DevAlert";

interface StreamingTextProps {
  content: string;
}

interface ParsedSegment {
  type: "text" | "alert" | "thinking";
  content: string;
  streaming?: boolean;
}

function parseContent(raw: string): ParsedSegment[] {
  const { segments: alertSegments } = parseDevAlerts(raw);
  const result: ParsedSegment[] = [];

  for (const seg of alertSegments) {
    if (seg.type === "alert") {
      result.push({ type: "alert", content: seg.content });
      continue;
    }

    const thinkRegex = /<think>([\s\S]*?)(<\/think>|$)/g;
    let lastIndex = 0;
    let match;

    while ((match = thinkRegex.exec(seg.content)) !== null) {
      const before = seg.content.slice(lastIndex, match.index).trim();
      if (before) result.push({ type: "text", content: before });

      const thinkContent = match[1].trim();
      const isClosed = match[2] === "</think>";
      if (thinkContent)
        result.push({ type: "thinking", content: thinkContent, streaming: !isClosed });

      lastIndex = match.index + match[0].length;
    }

    const remaining = seg.content.slice(lastIndex).trim();
    if (remaining) result.push({ type: "text", content: remaining });
  }

  return result;
}

function ThinkingBlock({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="my-2 rounded-md border border-c3-border/50 bg-c3-surface2/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-c3-text-muted hover:text-c3-text-dim transition-colors"
      >
        <Brain className="h-3.5 w-3.5 text-c3-accent/60" />
        <span className="font-medium">Thinking</span>
        {expanded ? (
          <ChevronDown className="ml-auto h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="ml-auto h-3.5 w-3.5" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-c3-border/30 px-3 py-2 text-xs leading-relaxed text-c3-text-muted/80 whitespace-pre-wrap font-sans">
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
        if (seg.type === "alert") {
          return <DevAlert key={i} content={seg.content} />;
        }

        if (seg.type === "thinking") {
          return <ThinkingBlock key={i} content={seg.content} />;
        }

        return (
          <div key={i} className="c3-markdown text-sm leading-relaxed text-c3-text">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {seg.content}
            </ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}
