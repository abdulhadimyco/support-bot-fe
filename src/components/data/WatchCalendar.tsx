import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  WatchCalendarData,
  WatchCalendarDay,
  WatchEntry,
} from "@/lib/types";

interface WatchCalendarProps {
  data: WatchCalendarData;
  /** optional: user name to display in header */
  userName?: string;
  /** optional: user email to display in header */
  userEmail?: string;
}

/* ── helpers ───────────────────────────────────────────────── */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function fmtDur(s: number): string {
  if (!s || s <= 0) return "0s";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${Math.round(s % 60)}s`;
}

function truncate(str: string, max = 22): string {
  return str.length > max ? str.slice(0, max - 1) + "\u2026" : str;
}

/** Build index: day number → WatchCalendarDay */
function indexDays(
  days: WatchCalendarDay[],
): Map<number, WatchCalendarDay> {
  const m = new Map<number, WatchCalendarDay>();
  for (const d of days) m.set(d.day, d);
  return m;
}

/* ── day detail panel (inline, not a dialog) ───────────────── */

function DayDetail({
  day,
  month,
  year,
  onClose,
}: {
  day: WatchCalendarDay;
  month: number;
  year: number;
  onClose: () => void;
}) {
  const MONTH_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const dateLabel = `${MONTH_SHORT[month - 1]} ${day.day}, ${year}`;
  const videos = day.top_videos ?? [];

  return (
    <div className="mt-2 rounded-lg border border-bot-border bg-bot-surface p-3">
      <div className="mb-2.5 flex items-center justify-between font-mono text-xs">
        <span>
          <strong className="text-bot-text">{dateLabel}</strong>{" "}
          <span className="text-[10px] text-bot-text-muted">
            {videos.length} video{videos.length !== 1 ? "s" : ""} &middot;{" "}
            {fmtDur(day.total_seconds)}
          </span>
        </span>
        <button
          onClick={onClose}
          className="px-1 text-base text-bot-text-muted hover:text-bot-text"
        >
          &times;
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {videos.map((v: WatchEntry, i: number) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md bg-bot-bg px-2 py-1.5 text-[11px]"
          >
            <span
              className={cn(
                "h-2 w-2 shrink-0 rounded-sm",
                v.type === "live" ? "bg-[#7c3aed]" : "bg-[#2563eb]",
              )}
            />
            <span
              className="min-w-0 flex-1 truncate font-medium text-bot-text"
              title={v.video_title}
            >
              {v.video_title || "Untitled video"}
            </span>
            <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-bot-text-muted">
              {v.type === "live" ? "LIVE" : "VOD"} &middot;{" "}
              {fmtDur(v.view_seconds)}
              {v.view_count != null && v.view_count > 1 && (
                <> &middot; {v.view_count}x</>
              )}
              {v.client && <> &middot; {v.client}</>}
            </span>
          </div>
        ))}
        {videos.length === 0 && (
          <div className="py-3 text-center font-mono text-[11px] text-bot-text-muted">
            No viewing activity
          </div>
        )}
      </div>
    </div>
  );
}

/* ── main component ────────────────────────────────────────── */

export function WatchCalendar({
  data: initialData,
  userName,
  userEmail,
}: WatchCalendarProps) {
  const [calData, setCalData] = useState(initialData);
  const [selectedDay, setSelectedDay] = useState<WatchCalendarDay | null>(null);

  const { year, month, days } = calData;
  const dayIndex = indexDays(days);

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
      setCalData((prev) => ({
        ...prev,
        year: newYear,
        month: newMonth,
        days: [],
        active_days: 0,
        live_count: 0,
        vod_count: 0,
        live_seconds: 0,
        vod_seconds: 0,
        total_seconds: 0,
      }));
      setSelectedDay(null);
    },
    [year, month],
  );

  // Calendar grid
  const firstDow = new Date(year, month - 1, 1).getDay();
  const offset = (firstDow + 6) % 7; // Monday-start
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;

  const MAX_ENTRIES = 3;

  return (
    <Card className="border-bot-border bg-bot-surface p-4">
      {/* User info */}
      <div className="mb-3">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.8px] text-bot-accent">
          Viewing Activity
        </div>
        {userName && (
          <div className="text-[15px] font-bold text-bot-text">
            {userName}
          </div>
        )}
        {userEmail && (
          <div className="font-mono text-xs text-bot-text-muted">{userEmail}</div>
        )}
      </div>

      {/* Stats bar */}
      <div className="mb-3 flex flex-wrap gap-2.5">
        <Badge
          variant="outline"
          className="border-bot-accent/30 font-mono text-[11px] text-bot-text-muted"
        >
          Total{" "}
          <strong className="ml-1 text-bot-text">
            {fmtDur(calData.total_seconds)}
          </strong>
        </Badge>
        <Badge
          variant="outline"
          className="border-bot-border font-mono text-[11px] text-bot-text-muted"
        >
          Days{" "}
          <strong className="ml-1 text-bot-text">
            {calData.active_days}
          </strong>
        </Badge>
        <Badge
          variant="outline"
          className="border-bot-border font-mono text-[11px] text-bot-text-muted"
        >
          &#9654; VOD{" "}
          <strong className="ml-1 text-bot-text">
            {calData.vod_count}
          </strong>{" "}
          &middot;{" "}
          <strong className="text-bot-text">
            {fmtDur(calData.vod_seconds)}
          </strong>
        </Badge>
        <Badge
          variant="outline"
          className="border-bot-border font-mono text-[11px] text-bot-text-muted"
        >
          &#9673; Live{" "}
          <strong className="ml-1 text-bot-text">
            {calData.live_count}
          </strong>{" "}
          &middot;{" "}
          <strong className="text-bot-text">
            {fmtDur(calData.live_seconds)}
          </strong>
        </Badge>
      </div>

      {/* Month navigation */}
      <div className="mb-2 flex items-center justify-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md border border-bot-border text-bot-text-muted hover:border-bot-text-muted hover:text-bot-text"
          onClick={() => navigateMonth(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[140px] text-center font-mono text-[13px] font-semibold text-bot-text">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md border border-bot-border text-bot-text-muted hover:border-bot-text-muted hover:text-bot-text"
          onClick={() => navigateMonth(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div
        className="grid grid-cols-7 overflow-hidden rounded-lg border border-bot-border"
        style={{ minWidth: 560 }}
      >
        {/* Day headers */}
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="border-b border-bot-border bg-bot-surface2 py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.5px] text-bot-text-muted"
          >
            {d}
          </div>
        ))}

        {/* Empty offset cells */}
        {Array.from({ length: offset }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="min-h-[80px] border-b border-r border-bot-border bg-bot-surface opacity-40"
          />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const info = dayIndex.get(day);
          const hasData = info && info.top_videos && info.top_videos.length > 0;
          const isToday = isCurrentMonth && today.getDate() === day;
          const isSelected = selectedDay?.day === day;
          const cellIndex = offset + idx;

          return (
            <div
              key={day}
              onClick={() => {
                if (hasData) setSelectedDay(isSelected ? null : info);
              }}
              className={cn(
                "min-h-[80px] overflow-hidden border-b border-r border-bot-border bg-bot-bg p-1 text-[10px] transition-colors",
                (cellIndex + 1) % 7 === 0 && "border-r-0",
                hasData && "cursor-pointer hover:bg-bot-surface2",
                isSelected && "bg-bot-surface2 shadow-[inset_0_0_0_2px_var(--color-accent)]",
              )}
            >
              <div
                className={cn(
                  "mb-0.5 font-mono text-[11px] text-bot-text-muted",
                  isToday && "font-bold text-bot-accent",
                )}
              >
                {day}
              </div>

              {info?.top_videos?.slice(0, MAX_ENTRIES).map((v, j) => (
                <div
                  key={j}
                  className={cn(
                    "mb-0.5 overflow-hidden rounded px-1 py-0.5 text-[9px] font-semibold leading-tight text-white",
                    v.type === "live" ? "bg-[#7c3aed]" : "bg-[#2563eb]",
                  )}
                  title={v.video_title}
                >
                  <div className="truncate">{truncate(v.video_title)}</div>
                  {v.view_seconds > 0 && (
                    <div className="text-[8px] font-normal opacity-80">
                      {fmtDur(v.view_seconds)}
                    </div>
                  )}
                </div>
              ))}

              {info && info.total_entries > MAX_ENTRIES && (
                <div className="px-1 font-mono text-[9px] text-bot-text-muted">
                  +{info.total_entries - MAX_ENTRIES} more &middot;{" "}
                  {fmtDur(
                    info.total_seconds -
                      (info.top_videos?.slice(0, MAX_ENTRIES) ?? []).reduce(
                        (s, v) => s + (v.view_seconds || 0),
                        0,
                      ),
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Trailing empty cells */}
        {(() => {
          const total = offset + daysInMonth;
          const rem = total % 7;
          if (rem === 0) return null;
          return Array.from({ length: 7 - rem }).map((_, i) => (
            <div
              key={`trail-${i}`}
              className="min-h-[80px] border-b border-r border-bot-border bg-bot-surface opacity-40"
            />
          ));
        })()}
      </div>

      {/* Legend */}
      <div className="mt-2.5 flex items-center justify-center gap-4 font-mono text-[11px] text-bot-text-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#7c3aed]" />
          Live
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#2563eb]" />
          VOD
        </span>
      </div>

      {/* Day detail (inline, below calendar) */}
      {selectedDay && (
        <DayDetail
          day={selectedDay}
          month={month}
          year={year}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </Card>
  );
}
