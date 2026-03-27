import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MessageMetadata } from "@/lib/types";

interface ModelTagProps {
  metadata: MessageMetadata;
  className?: string;
}

const providerDotColor: Record<string, string> = {
  claude: "bg-orange-400 shadow-orange-400/50",
  anthropic: "bg-orange-400 shadow-orange-400/50",
  minimax: "bg-purple-400 shadow-purple-400/50",
  gemini: "bg-blue-400 shadow-blue-400/50",
  google: "bg-blue-400 shadow-blue-400/50",
};

export function ModelTag({ metadata, className }: ModelTagProps) {
  const { model, provider, inputTokens, outputTokens, elapsedMs } = metadata;
  if (!model && !provider) return null;

  const normalizedProvider = (provider ?? "").toLowerCase();
  const dotClass =
    providerDotColor[normalizedProvider] ?? "bg-gray-400 shadow-gray-400/50";

  const elapsed =
    elapsedMs != null
      ? elapsedMs >= 1000
        ? `${(elapsedMs / 1000).toFixed(1)}s`
        : `${elapsedMs}ms`
      : null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 border-bot-border bg-bot-surface2/60 font-mono text-[10px] text-bot-text-muted backdrop-blur-sm",
        className,
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_4px]", dotClass)}
      />
      {model && <span>{model}</span>}
      {inputTokens != null && (
        <>
          <span className="text-border-subtle">|</span>
          <span>
            {inputTokens}→{outputTokens ?? "?"}
          </span>
        </>
      )}
      {elapsed && (
        <>
          <span className="text-border-subtle">|</span>
          <span>{elapsed}</span>
        </>
      )}
    </Badge>
  );
}
