import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Printer, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Report } from "@/lib/types";

export function ReportPage() {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${import.meta.env.VITE_API_URL || ""}/api/reports/${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Report not found or expired");
        return res.json() as Promise<Report>;
      })
      .then(setReport)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load report"),
      )
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-bot-bg">
        <span className="font-mono text-sm text-bot-text-muted">
          Loading report...
        </span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-full items-center justify-center bg-bot-bg">
        <Card className="border-bot-danger/30 bg-bot-surface p-6">
          <p className="font-mono text-sm text-bot-danger">
            {error || "Report not found"}
          </p>
        </Card>
      </div>
    );
  }

  const { reportData } = report;

  function handlePrint() {
    window.print();
  }

  function handleDownloadPdf() {
    window.open(
      `${import.meta.env.VITE_API_URL || ""}/api/reports/${token}/pdf`,
      "_blank",
    );
  }

  return (
    <div className="min-h-full bg-bot-bg">
      <header className="sticky top-0 z-10 border-b border-bot-border bg-bot-surface px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-bot-text">
              {reportData.title}
            </h1>
            <span className="font-mono text-xs text-bot-text-muted">
              Created{" "}
              {new Date(report.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-bot-border text-bot-text-dim hover:bg-bot-surface2"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Print
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadPdf}
              className="bg-bot-accent text-bg-base hover:bg-bot-accent/90"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 p-6">
        {[
          { title: "Customer Summary", content: reportData.customerSummary },
          { title: "Timeline", content: reportData.timeline },
          { title: "Evidence", content: reportData.evidence },
          { title: "Next Steps", content: reportData.nextSteps },
          {
            title: "Technical Summary",
            content: reportData.technicalSummary,
          },
        ]
          .filter((s) => s.content)
          .map((section) => (
            <Card
              key={section.title}
              className="border-bot-border bg-bot-surface"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Badge
                    variant="outline"
                    className="border-bot-accent/30 font-mono text-[9px] uppercase tracking-widest text-bot-accent"
                  >
                    {section.title}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm leading-relaxed text-bot-text-dim whitespace-pre-wrap">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          ))}

        <div className="py-4 text-center font-mono text-[10px] text-bot-text-muted">
          Expires{" "}
          {new Date(report.expiresAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </main>
    </div>
  );
}
