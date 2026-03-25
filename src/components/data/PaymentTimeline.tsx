import { useState } from "react";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import type { PaymentEvent, PaymentSection } from "@/lib/types";

interface PaymentTimelineProps {
  sections: PaymentSection[];
}

function fmtAmt(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString()}`;
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function chevronClass(status: string): string {
  const s = status.toLowerCase();
  if (["completed", "paid", "active", "success"].includes(s))
    return "bg-c3-accent/50 hover:bg-c3-accent/70";
  if (["pending", "processing"].includes(s))
    return "bg-c3-warning/[0.18] hover:bg-c3-warning/30";
  if (["failed", "canceled", "cancelled", "refunded"].includes(s))
    return "bg-c3-danger/[0.15] hover:bg-c3-danger/25";
  return "bg-c3-text-muted/10 hover:bg-c3-text-muted/20";
}

function statusLabelClass(status: string): string {
  const s = status.toLowerCase();
  if (["completed", "paid", "active", "success"].includes(s))
    return "text-c3-accent";
  if (["pending", "processing"].includes(s)) return "text-c3-warning";
  if (["failed", "canceled", "cancelled", "refunded"].includes(s))
    return "text-c3-danger";
  return "text-c3-text-muted";
}

function fmtTotals(totals: Record<string, number>): string {
  return Object.entries(totals)
    .map(([cur, amt]) => fmtAmt(amt, cur))
    .join(" | ");
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-c3-text-muted">
        {label}
      </span>
      <span className="text-right font-mono text-xs text-c3-text-dim">
        {value}
      </span>
    </div>
  );
}

function PaymentDetailPanel({
  payment,
  onClose,
}: {
  payment: PaymentEvent;
  onClose: () => void;
}) {
  return (
    <div className="animate-in slide-in-from-top-2 fade-in mt-2 rounded-lg border border-c3-border bg-gradient-to-b from-c3-surface2 to-c3-surface p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="text-lg font-bold text-c3-text">
            {fmtAmt(payment.amount, payment.currency)}
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={payment.status} />
            <span className="font-mono text-[10px] text-c3-text-muted">
              {fmtDateTime(payment.date)}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-c3-text-muted hover:text-c3-text"
          onClick={onClose}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-x-6">
        <div>
          <div className="mb-1 font-mono text-[9px] uppercase tracking-widest text-c3-accent">
            Payment Info
          </div>
          <DetailRow label="Gateway" value={payment.gateway} />
          <DetailRow label="Source" value={payment.source} />
          <DetailRow label="ID" value={payment.id} />
        </div>
        <div>
          <div className="mb-1 font-mono text-[9px] uppercase tracking-widest text-c3-accent">
            Subscription
          </div>
          <DetailRow label="Plan" value={payment.plan} />
          <DetailRow label="Status" value={payment.subscriptionStatus} />
          {payment.licensePlans && payment.licensePlans.length > 0 && (
            <DetailRow
              label="License Plans"
              value={payment.licensePlans.join(", ")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineSection({ section }: { section: PaymentSection }) {
  const [selectedPayment, setSelectedPayment] = useState<PaymentEvent | null>(
    null,
  );

  return (
    <div className="mb-4">
      {/* Section header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-c3-text">
            {section.licenseName}
          </span>
          <StatusBadge status={section.status} />
          <span className="font-mono text-[10px] text-c3-text-muted">
            {section.payments.length} payment
            {section.payments.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3 text-right font-mono text-[10px] text-c3-text-muted">
          {fmtTotals(section.totalsByCurrency)}
          {section.expiryDate && (
            <span>Exp: {fmtDate(section.expiryDate)}</span>
          )}
          {section.renewalDate && (
            <span>Ren: {fmtDate(section.renewalDate)}</span>
          )}
        </div>
      </div>

      {/* Chevron track */}
      <ScrollArea className="w-full">
        <div className="flex gap-1 pb-2">
          {section.payments.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                setSelectedPayment(selectedPayment?.id === p.id ? null : p)
              }
              className={cn(
                "flex shrink-0 flex-col items-center justify-center px-4 py-2 transition-all",
                "clip-path-chevron min-w-[90px]",
                chevronClass(p.status),
                selectedPayment?.id === p.id && "ring-1 ring-c3-accent",
              )}
              style={{
                clipPath:
                  "polygon(0% 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 0% 100%, 10px 50%)",
              }}
            >
              <span className="font-mono text-[13px] font-bold text-c3-text">
                {fmtAmt(p.amount, p.currency)}
              </span>
              <span className="font-mono text-[10px] text-c3-text-muted">
                {fmtDate(p.date)}
              </span>
              <span
                className={cn(
                  "font-mono text-[8px] uppercase",
                  statusLabelClass(p.status),
                )}
              >
                {p.status}
              </span>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Detail panel */}
      {selectedPayment && (
        <PaymentDetailPanel
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}

export function PaymentTimeline({ sections }: PaymentTimelineProps) {
  const allPayments = sections.flatMap((s) => s.payments);
  const totalsByCurrency: Record<string, number> = {};
  for (const p of allPayments) {
    totalsByCurrency[p.currency] =
      (totalsByCurrency[p.currency] ?? 0) + p.amount;
  }

  return (
    <Card className="border-c3-border bg-c3-surface p-4">
      {sections.map((section, i) => (
        <TimelineSection key={i} section={section} />
      ))}

      {/* Footer totals */}
      <div className="flex flex-wrap items-center gap-3 border-t border-c3-border pt-2 font-mono text-[10px] text-c3-text-muted">
        <span>
          Total: <strong className="text-c3-text">{fmtTotals(totalsByCurrency)}</strong>
        </span>
        <span>{allPayments.length} payment records</span>
      </div>
    </Card>
  );
}
