import { UserProfileCard } from "@/components/data/UserProfileCard";
import { PaymentTimeline } from "@/components/data/PaymentTimeline";
import { WatchCalendar } from "@/components/data/WatchCalendar";
import { SubscriptionCard } from "@/components/data/SubscriptionCard";
import type {
  UserProfile,
  PaymentHistoryResponse,
  WatchCalendarData,
  SubscriptionResponse,
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

  // Error results — skip rendering
  if (data.error) return null;

  // Payment history — has license_timelines array
  if (
    toolName === "getPaymentHistory" ||
    (Array.isArray(data.license_timelines) && data.payment_count != null)
  ) {
    return <PaymentTimeline data={data as unknown as PaymentHistoryResponse} />;
  }

  // Watch calendar month — has days array + year/month
  if (
    toolName === "getWatchCalendarMonth" ||
    (Array.isArray(data.days) && data.year != null && data.month != null)
  ) {
    return <WatchCalendar data={data as unknown as WatchCalendarData} />;
  }

  // Subscription check — has subscriptions array
  if (
    toolName === "checkSubscription" ||
    (Array.isArray(data.subscriptions) && data.subscription_count != null)
  ) {
    return (
      <SubscriptionCard data={data as unknown as SubscriptionResponse} />
    );
  }

  // User profile — has user_id + email/name
  if (
    toolName === "getUserByEmail" ||
    toolName === "getUserByPhone" ||
    toolName === "lookupUser" ||
    (data.user_id && (data.email || data.name))
  ) {
    return <UserProfileCard profile={data as unknown as UserProfile} />;
  }

  // Default: collapsible JSON
  return (
    <details className="mt-1">
      <summary className="cursor-pointer font-mono text-xs text-bot-text-muted hover:text-bot-text-dim">
        Tool result: {toolName}
      </summary>
      <pre className="mt-1 max-h-48 overflow-auto rounded bg-bot-bg p-2 font-mono text-[11px] text-bot-text-dim">
        {JSON.stringify(result, null, 2)}
      </pre>
    </details>
  );
}
