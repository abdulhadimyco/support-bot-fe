import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function LoginPage() {
  const { login, isLoading, token } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Already logged in
  if (token) {
    navigate("/chat", { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/chat", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="relative flex min-h-full items-center justify-center bg-c3-bg p-4">
      {/* Ambient accent glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[340px] w-[340px] rounded-full bg-c3-accent/[0.06] blur-[100px]" />
      </div>

      <Card className="relative w-full max-w-sm border-c3-border/60 bg-c3-surface shadow-[0_0_40px_-12px_rgba(0,229,160,0.12)]">
        <CardHeader className="items-center gap-1 pb-4 text-center">
          {/* Logo mark */}
          <div className="mb-3 flex items-center gap-2.5">
            <span className="text-2xl font-semibold tracking-tight text-c3-text">
              myco
            </span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-c3-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-c3-accent" />
            </span>
          </div>
          <CardTitle className="text-base font-medium text-c3-text">
            Sign in to C3PA Support
          </CardTitle>
          <p className="font-mono text-[11px] text-c3-text-muted">
            AI-powered support assistant
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-c3-danger/30 bg-c3-danger/10 px-3 py-2 text-center font-mono text-xs text-c3-danger">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-c3-text-muted">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="border-c3-border bg-c3-bg text-c3-text transition-shadow placeholder:text-c3-text-muted focus-visible:ring-c3-accent/50 focus-visible:shadow-[0_0_0_1px_rgba(0,229,160,0.15)]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-c3-text-muted">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="border-c3-border bg-c3-bg text-c3-text transition-shadow placeholder:text-c3-text-muted focus-visible:ring-c3-accent/50 focus-visible:shadow-[0_0_0_1px_rgba(0,229,160,0.15)]"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-c3-accent font-medium text-c3-bg transition-all hover:bg-c3-accent/90 hover:shadow-[0_0_20px_-4px_rgba(0,229,160,0.4)]"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-5 rounded-md border border-c3-border/50 bg-c3-bg/60 px-3 py-2.5 text-center">
            <p className="text-[11px] leading-relaxed text-c3-text-dim">
              Signed up via social login on{" "}
              <span className="font-medium text-c3-text">myco</span>? Please{" "}
              <a
                href="https://myco.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-c3-accent underline decoration-c3-accent/30 underline-offset-2 transition-colors hover:decoration-c3-accent"
              >
                reset your password
              </a>{" "}
              there first — this portal uses username &amp; password
              authentication only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
