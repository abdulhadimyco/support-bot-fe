import { motion } from "framer-motion";
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

/** Shared spring entrance for every tool result card */
const resultMotion = {
  initial: { opacity: 0, scale: 0.97, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: {
    type: "spring" as const,
    stiffness: 340,
    damping: 28,
    mass: 0.7,
  },
};

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
    return (
      <motion.div layout {...resultMotion}>
        <PaymentTimeline data={data as unknown as PaymentHistoryResponse} />
      </motion.div>
    );
  }

  // Watch calendar — has months array (multi-month) or days array (legacy single-month)
  if (
    toolName === "getWatchCalendarMonth" ||
    Array.isArray(data.months) ||
    (Array.isArray(data.days) && data.year != null && data.month != null)
  ) {
    return (
      <motion.div layout {...resultMotion}>
        <WatchCalendar data={data as unknown as WatchCalendarData} />
      </motion.div>
    );
  }

  // Subscription check — has subscriptions array
  if (
    toolName === "checkSubscription" ||
    (Array.isArray(data.subscriptions) && data.subscription_count != null)
  ) {
    return (
      <motion.div layout {...resultMotion}>
        <SubscriptionCard data={data as unknown as SubscriptionResponse} />
      </motion.div>
    );
  }

  // User profile — has user_id + email/name
  if (
    toolName === "getUserByEmail" ||
    toolName === "getUserByPhone" ||
    toolName === "lookupUser" ||
    (data.user_id && (data.email || data.name))
  ) {
    return (
      <motion.div layout {...resultMotion}>
        <UserProfileCard profile={data as unknown as UserProfile} />
      </motion.div>
    );
  }

  // Unknown tools — don't show raw data to non-technical users
  return null;
}
