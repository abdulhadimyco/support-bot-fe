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
      <div className="flex min-h-full items-center justify-center bg-c3-bg">
        <span className="font-mono text-sm text-c3-text-muted">
          Loading report...
        </span>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex min-h-full items-center justify-center bg-c3-bg">
        <Card className="border-c3-danger/30 bg-c3-surface p-6">
          <p className="font-mono text-sm text-c3-danger">
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
    <div className="min-h-full bg-c3-bg">
      <header className="sticky top-0 z-10 border-b border-c3-border bg-c3-surface px-6 py-4 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-c3-text">
              {reportData.title}
            </h1>
            <span className="font-mono text-xs text-c3-text-muted">
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
              className="border-c3-border text-c3-text-dim hover:bg-c3-surface2"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Print
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadPdf}
              className="bg-c3-accent text-c3-bg hover:bg-c3-accent/90"
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
              className="border-c3-border bg-c3-surface"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Badge
                    variant="outline"
                    className="border-c3-accent/30 font-mono text-[9px] uppercase tracking-widest text-c3-accent"
                  >
                    {section.title}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm leading-relaxed text-c3-text-dim whitespace-pre-wrap">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          ))}

        <div className="py-4 text-center font-mono text-[10px] text-c3-text-muted">
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
