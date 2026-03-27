import { useState } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import type {
  Payment,
  LicenseTimeline,
  PaymentHistoryResponse,
} from "@/lib/types";

interface PaymentTimelineProps {
  data: PaymentHistoryResponse;
}

/* ── helpers ───────────────────────────────────────────────── */

function fmtAmt(amount: number, currency?: string | null): string {
  const num = Number(amount);
  if (isNaN(num)) return currency ? `0 ${currency}` : "0";
  const str =
    num % 1 === 0
      ? num.toLocaleString()
      : num.toFixed(2);
  return currency ? `${str} ${currency}` : str;
}

function fmtTotals(totals: Record<string, number>): string {
  const keys = Object.keys(totals).filter(
    (k) => k !== "unknown" || totals[k] > 0,
  );
  if (!keys.length) return "0";
  return keys.map((cur) => fmtAmt(totals[cur], cur)).join(" + ");
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

function fmtDateTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function statusClass(status?: string): string {
  if (!status) return "unknown";
  const s = status.toLowerCase();
  if (["active", "completed", "paid", "succeeded"].includes(s)) return "active";
  if (["pending", "processing"].includes(s)) return "pending";
  if (["canceled", "cancelled", "failed", "expired", "refunded"].includes(s))
    return "canceled";
  if (s === "inactive") return "inactive";
  return "unknown";
}

function chevronBg(status?: string): string {
  const cls = statusClass(status);
  if (cls === "active") return "bg-bot-accent/[0.18] hover:brightness-[1.2]";
  if (cls === "pending") return "bg-bot-warning/[0.18] hover:brightness-[1.2]";
  if (cls === "canceled") return "bg-bot-danger/[0.15] hover:brightness-[1.2]";
  return "bg-bot-surface2 hover:brightness-[1.2]";
}

function statusLabelColor(status?: string): string {
  const cls = statusClass(status);
  if (cls === "active") return "text-bot-accent";
  if (cls === "pending") return "text-bot-warning";
  if (cls === "canceled") return "text-bot-danger";
  return "text-bot-text-muted";
}

/* ── detail row ────────────────────────────────────────────── */

function DetailRow({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="shrink-0 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.5px] text-bot-text-muted">
        {label}
      </span>
      <span className="break-words text-right font-mono text-[11px] text-bot-text">
        {children}
      </span>
    </div>
  );
}

/* ── detail panel ──────────────────────────────────────────── */

function PaymentDetailPanel({
  payment,
  onClose,
}: {
  payment: Payment;
  onClose: () => void;
}) {
  return (
    <div className="relative mt-px animate-in slide-in-from-top-1 fade-in rounded-b-lg border border-t-0 border-bot-border bg-gradient-to-b from-bot-surface to-bot-bg">
      {/* Hero */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-bot-border bg-bot-accent/[0.04] px-4 py-3">
        <span className="font-mono text-lg font-bold text-bot-text">
          {fmtAmt(payment.amount, payment.currency)}
        </span>
        {payment.status && <StatusBadge status={payment.status} />}
        {payment.created_at && (
          <span className="ml-auto font-mono text-[11px] text-bot-text-muted">
            {fmtDateTime(payment.created_at)}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-2.5 h-6 w-6 text-bot-text-muted hover:bg-white/[0.08] hover:text-bot-text"
          onClick={onClose}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Columns */}
      <div className="flex flex-wrap gap-6 px-4 py-3.5">
        {/* Payment info */}
        <div className="flex min-w-[150px] flex-1 flex-col gap-1.5">
          <div className="mb-0.5 border-b border-bot-accent/15 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.8px] text-bot-accent">
            Payment
          </div>
          {payment.source_db && (
            <DetailRow label="Source">
              {payment.source_db === "mongo+postgres"
                ? "MongoDB + PostgreSQL"
                : payment.source_db === "postgres"
                  ? "PostgreSQL"
                  : payment.source_db}
            </DetailRow>
          )}
          {payment.pg_transaction_id && (
            <DetailRow label="PG Transaction ID">
              {payment.pg_transaction_id}
            </DetailRow>
          )}
          <DetailRow label="Method">{payment.payment_gateway}</DetailRow>
          {payment.is_completed != null && (
            <DetailRow label="Completed">
              <span className={payment.is_completed ? "font-semibold text-bot-accent" : "font-semibold text-bot-warning"}>
                {payment.is_completed ? "Yes" : "No"}
              </span>
            </DetailRow>
          )}
          {payment.is_onetime != null && (
            <DetailRow label="Type">
              {payment.is_onetime ? "One-time" : "Recurring"}
            </DetailRow>
          )}
          {payment.recurrence_interval && (
            <DetailRow label="Billing Cycle">
              {payment.recurrence_interval}
            </DetailRow>
          )}
        </div>

        {/* Plan info */}
        <div className="flex min-w-[150px] flex-1 flex-col gap-1.5">
          <div className="mb-0.5 border-b border-bot-accent/15 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.8px] text-bot-accent">
            Plan
          </div>
          <DetailRow label="Product">{payment.product_identifier}</DetailRow>
          <DetailRow label="Plan Name">{payment.plan_name}</DetailRow>
          {payment.checkout_duration != null && (
            <DetailRow label="Duration">
              {payment.checkout_duration} month
              {payment.checkout_duration !== 1 ? "s" : ""}
            </DetailRow>
          )}
          {payment.subscription_status && (
            <DetailRow label="Status">
              <span
                className={cn(
                  "font-semibold",
                  payment.subscription_status === "active"
                    ? "text-bot-accent"
                    : payment.subscription_status === "inactive"
                      ? "text-bot-warning"
                      : "",
                )}
              >
                {payment.subscription_status}
              </span>
            </DetailRow>
          )}
          {payment.is_canceled && (
            <DetailRow label="Canceled">
              <span className="font-semibold text-bot-danger">Yes</span>
            </DetailRow>
          )}
          <DetailRow label="Expires">
            {fmtDate(payment.subscription_expires_at)}
          </DetailRow>
          {payment.next_renewal && (
            <DetailRow label="Next Renewal">
              <strong>{fmtDate(payment.next_renewal)}</strong>
            </DetailRow>
          )}
        </div>

        {/* Available plans */}
        {payment.license_plans && payment.license_plans.length > 0 && (
          <div className="flex min-w-[150px] flex-1 flex-col gap-1.5">
            <div className="mb-0.5 border-b border-bot-accent/15 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.8px] text-bot-accent">
              Available Plans
            </div>
            {payment.license_plans.map((lp, i) => {
              let label = lp.name || `Plan ${i + 1}`;
              if (lp.price != null)
                label += ` — ${lp.price}${lp.currency ? ` ${lp.currency}` : ""}`;
              if (lp.duration) label += ` / ${lp.duration}mo`;
              return (
                <div
                  key={i}
                  className="border-b border-white/[0.04] py-0.5 font-mono text-[11px] text-bot-text-muted last:border-b-0"
                >
                  {label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── timeline section (per license) ────────────────────────── */

function TimelineSection({ tl }: { tl: LicenseTimeline }) {
  const [selected, setSelected] = useState<Payment | null>(null);
  const subStatus = tl.latest_subscription_status || "unknown";

  const sortedPayments = [...tl.payments].sort(
    (a, b) =>
      (a.created_at ? new Date(a.created_at).getTime() : 0) -
      (b.created_at ? new Date(b.created_at).getTime() : 0),
  );

  return (
    <div className="mb-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-t-lg border border-bot-border bg-bot-surface2 px-3.5 py-2.5">
        <span className="font-mono text-[13px] font-semibold text-bot-text">
          {tl.license_label || tl.license_name || "Untitled License"}
        </span>
        <StatusBadge status={subStatus} />
        <span className="font-mono text-[11px] text-bot-text-muted">
          {tl.payment_count} payment{tl.payment_count !== 1 ? "s" : ""}
        </span>
        <span className="font-mono text-[11px] text-bot-text-muted">
          {fmtTotals(tl.totals_by_currency)}
        </span>
        {tl.latest_subscription_expires_at && (
          <span className="font-mono text-[11px] text-bot-text-muted">
            Exp: {fmtDate(tl.latest_subscription_expires_at)}
          </span>
        )}
        {tl.next_renewal_from_sub && (
          <span className="font-mono text-[11px] font-semibold text-bot-accent">
            Renewal: {fmtDate(tl.next_renewal_from_sub)}
          </span>
        )}
      </div>

      {/* Chevron track */}
      {sortedPayments.length > 0 ? (
        <ScrollArea className="w-full rounded-b-lg border border-t-0 border-bot-border bg-bot-bg">
          <div className="flex items-stretch gap-0 px-3 py-4">
            {sortedPayments.map((p, i) => (
              <button
                key={i}
                onClick={() =>
                  setSelected(selected === p ? null : p)
                }
                className={cn(
                  "relative flex shrink-0 flex-col items-center justify-center transition-all",
                  "min-w-[120px] h-[68px] px-[22px] py-1.5",
                  i > 0 && "-ml-1.5",
                  chevronBg(p.status),
                  selected === p &&
                    "outline outline-2 outline-bot-accent brightness-[1.15]",
                )}
                style={{
                  clipPath:
                    i === 0
                      ? "polygon(0% 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 0% 100%)"
                      : "polygon(0% 0%, calc(100% - 14px) 0%, 100% 50%, calc(100% - 14px) 100%, 0% 100%, 14px 50%)",
                }}
              >
                <span className="whitespace-nowrap font-mono text-[13px] font-semibold text-bot-text">
                  {fmtAmt(p.amount, p.currency)}
                </span>
                <span className="mt-0.5 whitespace-nowrap font-mono text-[10px] text-bot-text-muted">
                  {fmtDate(p.created_at)}
                </span>
                {p.status && (
                  <span
                    className={cn(
                      "mt-0.5 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.5px]",
                      statusLabelColor(p.status),
                    )}
                  >
                    {p.status}
                  </span>
                )}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        <div className="rounded-b-lg border border-t-0 border-bot-border bg-bot-bg py-4 text-center font-mono text-xs text-bot-text-muted">
          No payment records
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <PaymentDetailPanel
          payment={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

/* ── main component ────────────────────────────────────────── */

export function PaymentTimeline({ data }: PaymentTimelineProps) {
  return (
    <Card className="border-bot-border bg-bot-surface p-4">
      {data.license_timelines.map((tl, i) => (
        <TimelineSection key={i} tl={tl} />
      ))}

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-4 border-t border-bot-border pt-2.5 font-mono text-[11px] text-bot-text-muted">
        <span>
          Total:{" "}
          <span className="font-medium text-bot-text">
            {fmtTotals(data.totals_by_currency)}
          </span>
        </span>
        {data.receipts_found != null && (
          <span>
            Receipts:{" "}
            <span className="font-medium text-bot-text">
              {data.receipts_found}
            </span>
          </span>
        )}
        {data.checkouts_found != null && (
          <span>
            Checkouts:{" "}
            <span className="font-medium text-bot-text">
              {data.checkouts_found}
            </span>
          </span>
        )}
        {data.subscriptions_found != null && (
          <span>
            Subscriptions:{" "}
            <span className="font-medium text-bot-text">
              {data.subscriptions_found}
            </span>
          </span>
        )}
        {data.postgres_transactions_count != null &&
          data.postgres_transactions_count > 0 && (
            <>
              <span>
                PG transactions:{" "}
                <span className="font-medium text-bot-text">
                  {data.postgres_transactions_count}
                </span>
              </span>
              {data.source === "mongo+postgres" && (
                <span className="text-[10px] text-bot-text-muted/70">
                  (data from both MongoDB and PostgreSQL)
                </span>
              )}
            </>
          )}
      </div>
    </Card>
  );
}
