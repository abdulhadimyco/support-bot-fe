import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/shared/CopyButton";

interface DevAlertProps {
  content: string;
}

export function DevAlert({ content }: DevAlertProps) {
  return (
    <Card className="my-2 overflow-hidden border-amber-700/50 bg-amber-950/20">
      <div className="flex items-center justify-between bg-amber-900/30 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-400">
            Dev Alert
          </span>
        </div>
        <CopyButton
          text={content}
          className="h-6 px-2 text-amber-400 hover:bg-amber-900/40 hover:text-amber-300"
        />
      </div>
      <div className="p-3 font-mono text-xs leading-relaxed text-amber-200/80 whitespace-pre-wrap">
        {content}
      </div>
    </Card>
  );
}

/** Parse assistant text and extract DEV_ALERT blocks */
export function parseDevAlerts(text: string): {
  segments: Array<{ type: "text" | "alert"; content: string }>;
} {
  const regex = /\[DEV_ALERT\]([\s\S]*?)\[\/DEV_ALERT\]/g;
  const segments: Array<{ type: "text" | "alert"; content: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }
    segments.push({ type: "alert", content: match[1].trim() });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  return { segments };
}
