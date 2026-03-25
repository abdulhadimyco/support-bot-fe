import { DevAlert, parseDevAlerts } from "@/components/shared/DevAlert";

interface StreamingTextProps {
  content: string;
}

export function StreamingText({ content }: StreamingTextProps) {
  const { segments } = parseDevAlerts(content);

  return (
    <div className="space-y-1">
      {segments.map((seg, i) =>
        seg.type === "alert" ? (
          <DevAlert key={i} content={seg.content} />
        ) : (
          <div
            key={i}
            className="text-sm leading-relaxed text-c3-text whitespace-pre-wrap"
          >
            {seg.content}
          </div>
        ),
      )}
    </div>
  );
}
