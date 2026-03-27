import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { SubscriptionResponse, SubscriptionItem } from "@/lib/types";

interface SubscriptionCardProps {
  data: SubscriptionResponse;
}

function fmtDate(iso?: string | null): string {
  if (!iso) return "\u2014";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function fmtPrice(price?: number | null, currency?: string | null): string {
  if (price == null) return "\u2014";
  return currency ? `${price} ${currency}` : String(price);
}

function SubRow({ item, index }: { item: SubscriptionItem; index: number }) {
  const fields: Array<{
    label: string;
    value: string | undefined;
    isDanger?: boolean;
  }> = [];

  if (item.plan_name) fields.push({ label: "Plan", value: item.plan_name });
  if (item.price != null) fields.push({ label: "Price", value: fmtPrice(item.price, item.currency) });
  if (item.expires_at) fields.push({ label: "Expires", value: fmtDate(item.expires_at) });
  if (item.created_at) fields.push({ label: "Created", value: fmtDate(item.created_at) });
  if (item.is_onetime != null) fields.push({ label: "Type", value: item.is_onetime ? "One-time" : "Recurring" });
  if (item.is_canceled) fields.push({ label: "Canceled", value: "Yes", isDanger: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 360,
        damping: 28,
      }}
      className="rounded-lg border border-bot-border bg-bot-bg p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[13px] font-semibold text-bot-text">
          {item.license_name || "Untitled License"}
        </span>
        <StatusBadge status={item.status} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-4 gap-y-1">
        {fields.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.1 + i * 0.03, duration: 0.25, ease: "easeOut" }}
          >
            <div className="font-mono text-[9px] uppercase tracking-[0.6px] text-bot-text-muted/70">
              {f.label}
            </div>
            <div className={`font-mono text-xs ${f.isDanger ? "font-semibold text-bot-danger" : "text-bot-text"}`}>
              {f.value}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function SubscriptionCard({ data }: SubscriptionCardProps) {
  return (
    <Card className="glass-card p-4">
      {/* Summary header */}
      <div className="mb-3 flex flex-wrap items-center gap-3 font-mono text-[11px] text-bot-text-muted">
        <span>
          Total:{" "}
          <strong className="text-bot-text">
            {data.subscription_count}
          </strong>
        </span>
        <span>
          Active:{" "}
          <strong className="text-bot-accent">{data.active_count}</strong>
        </span>
        {data.inactive_count > 0 && (
          <span>
            Inactive:{" "}
            <strong className="text-bot-text-muted">{data.inactive_count}</strong>
          </span>
        )}
      </div>

      {/* Subscription rows */}
      <div className="flex flex-col gap-2">
        {data.subscriptions.map((sub, i) => (
          <SubRow key={i} item={sub} index={i} />
        ))}
      </div>
    </Card>
  );
}
