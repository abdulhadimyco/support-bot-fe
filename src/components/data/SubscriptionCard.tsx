import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { SubscriptionResponse, SubscriptionItem } from "@/lib/types";

interface SubscriptionCardProps {
  data: SubscriptionResponse;
}

function fmtDate(iso?: string | null): string {
  if (!iso) return "—";
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
  if (price == null) return "—";
  return currency ? `${price} ${currency}` : String(price);
}

function SubRow({ item }: { item: SubscriptionItem }) {
  return (
    <div className="rounded-lg border border-bot-border bg-bot-bg p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[13px] font-semibold text-bot-text">
          {item.license_name || "Untitled License"}
        </span>
        <StatusBadge status={item.status} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-4 gap-y-1">
        {item.plan_name && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.6px] text-bot-text-muted/70">
              Plan
            </div>
            <div className="font-mono text-xs text-bot-text">
              {item.plan_name}
            </div>
          </div>
        )}
        {item.price != null && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.6px] text-bot-text-muted/70">
              Price
            </div>
            <div className="font-mono text-xs text-bot-text">
              {fmtPrice(item.price, item.currency)}
            </div>
          </div>
        )}
        {item.expires_at && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.6px] text-bot-text-muted/70">
              Expires
            </div>
            <div className="font-mono text-xs text-bot-text">
              {fmtDate(item.expires_at)}
            </div>
          </div>
        )}
        {item.created_at && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.6px] text-bot-text-muted/70">
              Created
            </div>
            <div className="font-mono text-xs text-bot-text">
              {fmtDate(item.created_at)}
            </div>
          </div>
        )}
        {item.is_onetime != null && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.6px] text-bot-text-muted/70">
              Type
            </div>
            <div className="font-mono text-xs text-bot-text">
              {item.is_onetime ? "One-time" : "Recurring"}
            </div>
          </div>
        )}
        {item.is_canceled && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.6px] text-bot-text-muted/70">
              Canceled
            </div>
            <div className="font-mono text-xs font-semibold text-bot-danger">
              Yes
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SubscriptionCard({ data }: SubscriptionCardProps) {
  return (
    <Card className="border-bot-border bg-bot-surface p-4">
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
          <SubRow key={i} item={sub} />
        ))}
      </div>
    </Card>
  );
}
