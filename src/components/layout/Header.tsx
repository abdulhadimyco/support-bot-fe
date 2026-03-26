import { useState } from "react";
import { useParams } from "react-router-dom";
import { Download, LogOut, Settings, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api-client";
import type { Report } from "@/lib/types";


export function Header() {
  const { agent, logout } = useAuth();
  const { threadId } = useParams<{ threadId?: string }>();
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadReport() {
    if (!threadId || downloading) return;
    setDownloading(true);
    try {
      const report = await api.post<Report>(`/api/threads/${threadId}/report`);
      window.open(
        `${import.meta.env.VITE_API_URL || ""}/api/reports/${report.shareToken}/pdf`,
        "_blank",
      );
    } catch {
      // silently fail – the user will see no PDF tab open
    } finally {
      setDownloading(false);
    }
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-c3-border bg-c3-surface px-4">
      <div className="flex items-center gap-3">
       
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-c3-text">myco</span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-c3-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-c3-accent" />
          </span>
        </div>
        <Badge
          variant="outline"
          className="border-c3-accent/30 bg-c3-accent-dim font-mono text-[10px] tracking-widest text-c3-accent"
        >
          C3PA ONLINE
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {threadId && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                onClick={handleDownloadReport}
                disabled={downloading}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-c3-text-muted hover:bg-accent hover:text-c3-text"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Download Report
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-c3-text-muted hover:bg-accent hover:text-c3-text">
              {agent && (
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-c3-accent/15 font-mono text-[9px] font-semibold text-c3-accent">
                  {agent.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <span className="hidden font-mono text-xs sm:inline">
                {agent?.name}
              </span>
              <Settings className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 border-c3-border bg-c3-surface"
          >
            {agent && (
              <>
                <div className="px-2 py-1.5">
                  <div className="text-xs font-medium text-c3-text">
                    {agent.name}
                  </div>
                  <div className="font-mono text-[10px] text-c3-text-muted">
                    {agent.email}
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-c3-border" />
              </>
            )}
            <DropdownMenuItem
              onClick={logout}
              className="text-xs text-c3-danger focus:bg-c3-danger/10 focus:text-c3-danger"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
