import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserProfile } from "@/lib/types";

interface UserProfileCardProps {
  profile: UserProfile;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

export function UserProfileCard({ profile }: UserProfileCardProps) {
  const initials =
    profile.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "??";

  const fields = [
    {
      label: "Email",
      value: profile.email,
      verified: profile.emailVerified,
    },
    {
      label: "Phone",
      value: profile.phone,
      verified: profile.phoneVerified,
    },
    { label: "Country", value: profile.country },
    { label: "City", value: profile.city },
    { label: "Gender", value: profile.gender },
    { label: "Role", value: profile.role },
    {
      label: "Signed up",
      value: profile.signupDate
        ? timeAgo(profile.signupDate)
        : undefined,
    },
  ].filter((f) => f.value);

  return (
    <Card className="border-c3-accent/15 bg-c3-surface p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-c3-accent/30 to-c3-accent/10 font-mono text-xs font-bold text-c3-bg">
          {initials}
        </div>
        <div>
          <div className="text-sm font-semibold text-c3-text">
            {profile.name}
          </div>
          {profile.username && (
            <div className="font-mono text-[11px] text-c3-text-muted">
              @{profile.username}
            </div>
          )}
        </div>
        {profile.deleted && (
          <Badge
            variant="outline"
            className="ml-auto border-c3-danger/40 bg-c3-danger/10 font-mono text-[10px] text-c3-danger"
          >
            DELETED
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {fields.map((f) => (
          <div key={f.label}>
            <div className="font-mono text-[9px] uppercase tracking-widest text-c3-text-muted/70">
              {f.label}
            </div>
            <div className="flex items-center gap-1 font-mono text-xs text-c3-text-dim">
              <span className="truncate">{f.value}</span>
              {f.verified && (
                <Check className="h-3 w-3 shrink-0 text-c3-accent" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
