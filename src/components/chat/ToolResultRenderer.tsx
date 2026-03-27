import { UserProfileCard } from "@/components/data/UserProfileCard";
import { PaymentTimeline } from "@/components/data/PaymentTimeline";
import { WatchCalendar } from "@/components/data/WatchCalendar";
import { SubscriptionCard } from "@/components/data/SubscriptionCard";
import type {
  UserProfile,
  PaymentSection,
  WatchCalendarData,
  SubscriptionInfo,
} from "@/lib/types";

interface ToolResultRendererProps {
  toolName: string;
  result: unknown;
}

export function ToolResultRenderer({
  toolName,
  result,
}: ToolResultRendererProps) {
  if (!result || typeof result !== "object") return null;

  const data = result as Record<string, unknown>;

  switch (toolName) {
    case "getUserByEmail":
    case "getUserByPhone":
    case "lookupUser":
      if (data.user_id || data.email) {
        return <UserProfileCard profile={data as unknown as UserProfile} />;
      }
      break;

    case "getPaymentHistory":
      if (data.sections && Array.isArray(data.sections)) {
        return (
          <PaymentTimeline
            sections={data.sections as PaymentSection[]}
          />
        );
      }
      break;

    case "getWatchCalendarMonth":
      if (data.days && data.year != null) {
        return <WatchCalendar data={data as unknown as WatchCalendarData} />;
      }
      break;

    case "checkSubscription":
      if (data.licenseName || data.status) {
        return <SubscriptionCard info={data as unknown as SubscriptionInfo} />;
      }
      break;
  }

  // Default: render as a small code block
  return (
    <details className="mt-1">
      <summary className="cursor-pointer font-mono text-xs text-text-muted hover:text-text-dim">
        Tool result: {toolName}
      </summary>
      <pre className="mt-1 max-h-48 overflow-auto rounded bg-bg-base p-2 font-mono text-[11px] text-text-dim">
        {JSON.stringify(result, null, 2)}
      </pre>
    </details>
  );
}
