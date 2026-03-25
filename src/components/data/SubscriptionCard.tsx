import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { SubscriptionInfo } from "@/lib/types";

interface SubscriptionCardProps {
  info: SubscriptionInfo;
}

export function SubscriptionCard({ info }: SubscriptionCardProps) {
  return (
    <Card className="border-c3-border bg-c3-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-c3-text">
          {info.licenseName}
        </div>
        <StatusBadge status={info.status} />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {info.plan && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-c3-text-muted/70">
              Plan
            </div>
            <div className="font-mono text-xs text-c3-text-dim">
              {info.plan}
            </div>
          </div>
        )}
        {info.expiryDate && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-c3-text-muted/70">
              Expires
            </div>
            <div className="font-mono text-xs text-c3-text-dim">
              {new Date(info.expiryDate).toLocaleDateString()}
            </div>
          </div>
        )}
        {info.renewalDate && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-c3-text-muted/70">
              Renewal
            </div>
            <div className="font-mono text-xs text-c3-text-dim">
              {new Date(info.renewalDate).toLocaleDateString()}
            </div>
          </div>
        )}
        {info.autoRenew !== undefined && (
          <div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-c3-text-muted/70">
              Auto Renew
            </div>
            <div className="font-mono text-xs text-c3-text-dim">
              {info.autoRenew ? "Yes" : "No"}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
