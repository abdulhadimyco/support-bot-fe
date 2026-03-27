import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  WatchCalendarData,
  WatchMonthSummary,
  WatchCalendarDay,
  WatchEntry,
} from "@/lib/types";

interface WatchCalendarProps {
  data: WatchCalendarData;
  userName?: string;
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

function indexDays(days: WatchCalendarDay[]): Map<number, WatchCalendarDay> {
  const m = new Map<number, WatchCalendarDay>();
  for (const d of days) m.set(d.day, d);
  return m;
}

function monthKey(year: number, month: number) {
  return `${year}-${month}`;
}

/* ── day detail panel ──────────────────────────────────────── */

function DayDetail({
  day, month, year, onClose,
}: {
  day: WatchCalendarDay; month: number; year: number; onClose: () => void;
}) {
  const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dateLabel = `${MONTH_SHORT[month - 1]} ${day.day}, ${year}`;
  const videos = day.top_videos ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scaleY: 0.96 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -8, scaleY: 0.96 }}
      transition={{ type: "spring", stiffness: 340, damping: 28, mass: 0.7 }}
      style={{ originY: 0 }}
      className="mt-2 overflow-hidden rounded-lg border border-bot-border bg-bot-surface p-3"
    >
      <div className="mb-2.5 flex items-center justify-between font-mono text-xs">
        <span>
          <strong className="text-bot-text">{dateLabel}</strong>{" "}
          <span className="text-[10px] text-bot-text-muted">
            {videos.length} video{videos.length !== 1 ? "s" : ""} &middot; {fmtDur(day.total_seconds)}
          </span>
        </span>
        <button onClick={onClose} className="px-1 text-base text-bot-text-muted hover:text-bot-text">&times;</button>
      </div>
      <div className="flex flex-col gap-1">
        {videos.map((v: WatchEntry, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.25, ease: "easeOut" }}
            className="flex items-center gap-2 rounded-md bg-bot-bg px-2 py-1.5 text-[11px]"
          >
            <span className={cn("h-2 w-2 shrink-0 rounded-sm", v.type === "live" ? "bg-[#7c3aed]" : "bg-[#2563eb]")} />
            <span className="min-w-0 flex-1 truncate font-medium text-bot-text" title={v.video_title}>
              {v.video_title || "Untitled video"}
            </span>
            <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-bot-text-muted">
              {v.type === "live" ? "LIVE" : "VOD"} &middot; {fmtDur(v.view_seconds)}
              {v.view_count != null && v.view_count > 1 && <> &middot; {v.view_count}x</>}
              {v.client && <> &middot; {v.client}</>}
            </span>
          </motion.div>
        ))}
        {videos.length === 0 && (
          <div className="py-3 text-center font-mono text-[11px] text-bot-text-muted">No viewing activity</div>
        )}
      </div>
    </motion.div>
  );
}

/* ── main component ────────────────────────────────────────── */

export function WatchCalendar({ data, userName, userEmail }: WatchCalendarProps) {
  // Build month index from the pre-loaded data
  const monthIndex = useMemo(() => {
    const idx = new Map<string, WatchMonthSummary>();
    for (const m of data.months) idx.set(monthKey(m.year, m.month), m);
    return idx;
  }, [data.months]);

  // Available month range
  const sortedMonths = useMemo(() => {
    return [...data.months].sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year);
  }, [data.months]);

  const firstMonth = sortedMonths[0];
  const lastMonth = sortedMonths[sortedMonths.length - 1];

  // Default to current real month if available in the data, otherwise fall back to what the tool returned
  const now = new Date();
  const defaultYear = monthIndex.has(monthKey(now.getFullYear(), now.getMonth() + 1)) ? now.getFullYear() : data.current_year;
  const defaultMonth = monthIndex.has(monthKey(now.getFullYear(), now.getMonth() + 1)) ? now.getMonth() + 1 : data.current_month;
  const [viewYear, setViewYear] = useState(defaultYear);
  const [viewMonth, setViewMonth] = useState(defaultMonth);
  const [selectedDay, setSelectedDay] = useState<WatchCalendarDay | null>(null);

  const currentData = monthIndex.get(monthKey(viewYear, viewMonth));

  const canGoBack = firstMonth && (viewYear > firstMonth.year || (viewYear === firstMonth.year && viewMonth > firstMonth.month));
  const canGoForward = lastMonth && (viewYear < lastMonth.year || (viewYear === lastMonth.year && viewMonth < lastMonth.month));

  const navigateMonth = useCallback((delta: -1 | 1) => {
    setSelectedDay(null);
    setViewYear((y) => {
      const newMonth = viewMonth + delta;
      if (newMonth < 1) { setViewMonth(12); return y - 1; }
      if (newMonth > 12) { setViewMonth(1); return y + 1; }
      setViewMonth(newMonth);
      return y;
    });
  }, [viewMonth]);

  // Calendar grid for current view
  const stats = currentData ?? { active_days: 0, live_count: 0, vod_count: 0, live_seconds: 0, vod_seconds: 0, total_seconds: 0, days: [] };
  const dayIndex = indexDays(stats.days);
  const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay();
  const offset = (firstDow + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() + 1 === viewMonth;
  const MAX_ENTRIES = 3;

  return (
    <Card className="glass-card p-4">
      {/* User info */}
      <div className="mb-3">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.8px] text-bot-accent">Viewing Activity</div>
        {userName && <div className="text-[15px] font-bold text-bot-text">{userName}</div>}
        {userEmail && <div className="font-mono text-xs text-bot-text-muted">{userEmail}</div>}
      </div>

      {/* Stats bar */}
      <div className="mb-3 flex flex-wrap gap-2.5">
        <Badge variant="outline" className="border-bot-accent/30 font-mono text-[11px] text-bot-text-muted">
          Total <strong className="ml-1 text-bot-text">{fmtDur(stats.total_seconds)}</strong>
        </Badge>
        <Badge variant="outline" className="border-bot-border font-mono text-[11px] text-bot-text-muted">
          Days <strong className="ml-1 text-bot-text">{stats.active_days}</strong>
        </Badge>
        <Badge variant="outline" className="border-bot-border font-mono text-[11px] text-bot-text-muted">
          &#9654; VOD <strong className="ml-1 text-bot-text">{stats.vod_count}</strong> &middot; <strong className="text-bot-text">{fmtDur(stats.vod_seconds)}</strong>
        </Badge>
        <Badge variant="outline" className="border-bot-border font-mono text-[11px] text-bot-text-muted">
          &#9673; Live <strong className="ml-1 text-bot-text">{stats.live_count}</strong> &middot; <strong className="text-bot-text">{fmtDur(stats.live_seconds)}</strong>
        </Badge>
      </div>

      {/* Month navigation */}
      <div className="mb-2 flex items-center justify-center gap-3">
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 rounded-md border border-bot-border text-bot-text-muted hover:border-bot-text-muted hover:text-bot-text disabled:opacity-30"
          onClick={() => navigateMonth(-1)}
          disabled={!canGoBack}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[140px] text-center font-mono text-[13px] font-semibold text-bot-text">
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </span>
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 rounded-md border border-bot-border text-bot-text-muted hover:border-bot-text-muted hover:text-bot-text disabled:opacity-30"
          onClick={() => navigateMonth(1)}
          disabled={!canGoForward}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-bot-border" style={{ minWidth: 560 }}>
        {DAY_HEADERS.map((d) => (
          <div key={d} className="border-b border-bot-border bg-bot-surface2 py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.5px] text-bot-text-muted">
            {d}
          </div>
        ))}

        {Array.from({ length: offset }).map((_, i) => (
          <div key={`e-${i}`} className="min-h-[80px] border-b border-r border-bot-border bg-bot-surface opacity-40" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const info = dayIndex.get(day);
          const hasData = info && info.top_videos && info.top_videos.length > 0;
          const isToday = isCurrentMonth && today.getDate() === day;
          const isSelected = selectedDay?.day === day;
          const cellIndex = offset + idx;

          return (
            <motion.div
              key={`${viewYear}-${viewMonth}-${day}`}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.012, duration: 0.25, ease: "easeOut" }}
              whileHover={hasData ? { scale: 1.03, zIndex: 2 } : undefined}
              onClick={() => { if (hasData) setSelectedDay(isSelected ? null : info); }}
              className={cn(
                "min-h-[80px] overflow-hidden border-b border-r border-bot-border bg-bot-bg p-1 text-[10px] transition-colors",
                (cellIndex + 1) % 7 === 0 && "border-r-0",
                hasData && "cursor-pointer hover:bg-bot-surface2",
                isSelected && "bg-bot-surface2 shadow-[inset_0_0_0_2px_var(--color-bot-accent)]",
              )}
            >
              <div className={cn("mb-0.5 font-mono text-[11px] text-bot-text-muted", isToday && "font-bold text-bot-accent")}>
                {day}
              </div>
              {info?.top_videos?.slice(0, MAX_ENTRIES).map((v, j) => (
                <div
                  key={j}
                  className={cn("mb-0.5 overflow-hidden rounded px-1 py-0.5 text-[9px] font-semibold leading-tight text-white", v.type === "live" ? "bg-[#7c3aed]" : "bg-[#2563eb]")}
                  title={v.video_title ?? undefined}
                >
                  <div className="truncate">{truncate(v.video_title || "Untitled")}</div>
                  {v.view_seconds > 0 && <div className="text-[8px] font-normal opacity-80">{fmtDur(v.view_seconds)}</div>}
                </div>
              ))}
              {info && info.total_entries > MAX_ENTRIES && (
                <div className="px-1 font-mono text-[9px] text-bot-text-muted">
                  +{info.total_entries - MAX_ENTRIES} more
                </div>
              )}
            </motion.div>
          );
        })}

        {(() => {
          const total = offset + daysInMonth;
          const rem = total % 7;
          if (rem === 0) return null;
          return Array.from({ length: 7 - rem }).map((_, i) => (
            <div key={`t-${i}`} className="min-h-[80px] border-b border-r border-bot-border bg-bot-surface opacity-40" />
          ));
        })()}
      </div>

      {/* Legend */}
      <div className="mt-2.5 flex items-center justify-center gap-4 font-mono text-[11px] text-bot-text-muted">
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#7c3aed]" /> Live</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#2563eb]" /> VOD</span>
      </div>

      {/* Day detail */}
      <AnimatePresence mode="wait">
        {selectedDay && (
          <DayDetail key={selectedDay.day} day={selectedDay} month={viewMonth} year={viewYear} onClose={() => setSelectedDay(null)} />
        )}
      </AnimatePresence>
    </Card>
  );
}
