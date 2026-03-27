import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserProfile } from "@/lib/types";

interface UserProfileCardProps {
  profile: UserProfile;
}

function formatAge(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${(days / 365).toFixed(1)}y ago`;
}

function formatSignupDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UserProfileCard({ profile }: UserProfileCardProps) {
  const initials = profile.name
    ? (() => {
        const parts = profile.name.trim().split(/\s+/);
        return parts.length > 1
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : parts[0].slice(0, 2).toUpperCase();
      })()
    : "?";

  const fields: Array<{
    label: string;
    value?: string | null;
    verified?: boolean;
    danger?: boolean;
  }> = [
    { label: "Email", value: profile.email, verified: profile.email_verified },
    { label: "Phone", value: profile.phone, verified: profile.phone_verified },
    { label: "Country", value: profile.country },
    { label: "City", value: profile.city },
    { label: "Gender", value: profile.gender },
    { label: "Role", value: profile.group },
    {
      label: "Signed up",
      value: profile.created_at
        ? `${formatSignupDate(profile.created_at)} (${formatAge(profile.created_at)})`
        : undefined,
    },
  ].filter((f) => f.value);

  return (
    <Card className="border-bot-accent/15 bg-gradient-to-br from-bot-accent/[0.04] to-bot-accent/[0.01] p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-bot-accent to-[#00b380] font-mono text-[13px] font-bold text-bot-bg">
          {initials}
        </div>
        <div>
          {profile.name && (
            <div className="text-sm font-semibold leading-tight text-bot-text">
              {profile.name}
            </div>
          )}
          {profile.username && (
            <div className="mt-0.5 font-mono text-[11px] text-bot-text-muted">
              @{profile.username}
            </div>
          )}
        </div>
        {profile.deleted_on && (
          <Badge
            variant="outline"
            className="ml-auto border-bot-danger/40 bg-bot-danger/10 font-mono text-[10px] font-semibold text-bot-danger"
          >
            DELETED
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-4 gap-y-1.5">
        {fields.map((f) => (
          <div key={f.label} className="flex flex-col gap-px">
            <span className="font-mono text-[9px] uppercase tracking-[0.6px] text-bot-text-muted/70">
              {f.label}
            </span>
            <span className="flex items-center gap-1 break-all font-mono text-xs text-bot-text">
              {f.value}
              {f.verified && (
                <Check className="h-[11px] w-[11px] shrink-0 text-bot-accent" />
              )}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
