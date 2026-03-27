import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { WatchCalendarData, WatchDay } from "@/lib/types";

interface WatchCalendarProps {
  data: WatchCalendarData;
}

function fmtDur(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function truncate(str: string, max = 22): string {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function buildCalendarGrid(
  year: number,
  month: number,
  days: Record<string, WatchDay>,
) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: Array<{ day: number | null; data: WatchDay | null }> = [];

  for (let i = 0; i < firstDay; i++) cells.push({ day: null, data: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const key = String(d);
    cells.push({ day: d, data: days[key] ?? null });
  }

  return cells;
}

function DayDetailDialog({
  day,
  onClose,
}: {
  day: WatchDay | null;
  onClose: () => void;
}) {
  if (!day) return null;

  return (
    <Dialog open={!!day} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-border-subtle bg-surface text-text-primary sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm">
            Viewing Activity — {day.date}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {day.entries.map((entry, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded border border-border-subtle bg-bg-base px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      entry.type === "live" ? "bg-live" : "bg-vod",
                    )}
                  />
                  <span className="truncate text-xs font-medium text-text-primary">
                    {entry.title}
                  </span>
                </div>
                {entry.clientDevice && (
                  <div className="mt-0.5 pl-4 font-mono text-[10px] text-text-muted">
                    {entry.clientDevice}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2 text-right">
                <span className="font-mono text-[10px] text-text-dim">
                  {fmtDur(entry.duration)}
                </span>
                {entry.viewCount != null && (
                  <span className="font-mono text-[10px] text-text-muted">
                    {entry.viewCount}x
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WatchCalendar({ data: initialData }: WatchCalendarProps) {
  const [calData, setCalData] = useState(initialData);
  const [selectedDay, setSelectedDay] = useState<WatchDay | null>(null);

  const { year, month, days, stats, userName, userEmail } = calData;
  const cells = buildCalendarGrid(year, month, days);

  // TODO: Replace with real API call when backend is ready
  const navigateMonth = useCallback(
    (delta: -1 | 1) => {
      let newYear = year;
      let newMonth = month + delta;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
      // For now, just update month/year with empty days
      setCalData((prev) => ({
        ...prev,
        year: newYear,
        month: newMonth,
        days: {},
        stats: { totalTime: 0, activeDays: 0, vodCount: 0, vodDuration: 0, liveCount: 0, liveDuration: 0 },
      }));
    },
    [year, month],
  );

  return (
    <Card className="border-border-subtle bg-surface p-4">
      {/* User info */}
      <div className="mb-3">
        <div className="font-mono text-[9px] uppercase tracking-widest text-accent">
          Viewing Activity
        </div>
        <div className="text-sm font-semibold text-text-primary">{userName}</div>
        <div className="font-mono text-xs text-text-muted">{userEmail}</div>
      </div>

      {/* Stats bar */}
      <div className="mb-3 flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className="border-accent/30 font-mono text-[10px] text-text-dim"
        >
          Total:{" "}
          <strong className="ml-1 text-text-primary">{fmtDur(stats.totalTime)}</strong>
        </Badge>
        <Badge
          variant="outline"
          className="border-live/30 font-mono text-[10px] text-text-dim"
        >
          Live: <strong className="ml-1 text-text-primary">{stats.liveCount}</strong>{" "}
          ({fmtDur(stats.liveDuration)})
        </Badge>
        <Badge
          variant="outline"
          className="border-vod/30 font-mono text-[10px] text-text-dim"
        >
          VOD: <strong className="ml-1 text-text-primary">{stats.vodCount}</strong> (
          {fmtDur(stats.vodDuration)})
        </Badge>
        <Badge
          variant="outline"
          className="border-border-subtle font-mono text-[10px] text-text-dim"
        >
          Active Days:{" "}
          <strong className="ml-1 text-text-primary">{stats.activeDays}</strong>
        </Badge>
      </div>

      {/* Navigation */}
      <div className="mb-2 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-text-muted hover:text-text-primary"
          onClick={() => navigateMonth(-1)}
          disabled={false}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-mono text-xs font-medium text-text-primary">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-text-muted hover:text-text-primary"
          onClick={() => navigateMonth(1)}
          disabled={false}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px rounded border border-border-subtle bg-border-subtle">
        {/* Day headers */}
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className="bg-surface2 py-1 text-center font-mono text-[9px] uppercase tracking-wider text-text-muted"
          >
            {d}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((cell, i) => (
          <div
            key={i}
            className={cn(
              "min-h-[80px] bg-surface p-1",
              cell.day === null && "bg-bg-base/50",
              cell.data &&
                cell.data.entries.length > 0 &&
                "cursor-pointer hover:bg-surface2",
            )}
            onClick={() => {
              if (cell.data && cell.data.entries.length > 0)
                setSelectedDay(cell.data);
            }}
          >
            {cell.day !== null && (
              <>
                <div className="mb-0.5 font-mono text-[10px] text-text-muted">
                  {cell.day}
                </div>
                {cell.data?.entries.slice(0, 2).map((entry, j) => (
                  <div
                    key={j}
                    className={cn(
                      "mb-0.5 rounded px-1 py-0.5 text-[9px] leading-tight text-white",
                      entry.type === "live"
                        ? "bg-live/80"
                        : "bg-vod/80",
                    )}
                  >
                    {truncate(entry.title)} · {fmtDur(entry.duration)}
                  </div>
                ))}
                {cell.data && cell.data.entries.length > 2 && (
                  <div className="px-1 font-mono text-[8px] text-text-muted">
                    +{cell.data.entries.length - 2} more
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-4 font-mono text-[10px] text-text-muted">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-live" />
          Live
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-vod" />
          VOD
        </div>
      </div>

      {/* Day detail dialog */}
      <DayDetailDialog
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
      />
    </Card>
  );
}
