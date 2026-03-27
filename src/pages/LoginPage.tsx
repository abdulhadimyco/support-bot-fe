import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export function LoginPage() {
  const { login, isLoading, token } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="relative flex min-h-full items-center justify-center bg-bot-bg p-4">
      {/* Ambient accent glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[340px] w-[340px] rounded-full bg-bot-accent/[0.06] blur-[100px]" />
      </div>

      <Card className="relative w-full max-w-sm border-bot-border/60 bg-bot-surface shadow-[0_0_40px_-12px_rgba(0,229,160,0.12)]">
        <CardHeader className="items-center gap-1 pb-4 text-center">
          {/* Logo mark */}
          <div className="mb-3 flex items-center gap-2.5">
            <span className="text-2xl font-semibold tracking-tight text-bot-text">
              Sherlock
            </span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bot-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-bot-accent" />
            </span>
          </div>
          <CardTitle className="text-base font-medium text-bot-text">
            Sign in to Sherlock
          </CardTitle>
          <p className="font-mono text-[11px] text-bot-text-muted">
            AI-powered support assistant
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-bot-danger/30 bg-bot-danger/10 px-3 py-2 text-center font-mono text-xs text-bot-danger">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-bot-text-muted">
                Username or Email
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or email"
                className="border-bot-border bg-bot-bg text-bot-text transition-shadow placeholder:text-bot-text-muted focus-visible:ring-bot-accent/50 focus-visible:shadow-[0_0_0_1px_rgba(0,229,160,0.15)]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-bot-text-muted">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="border-bot-border bg-bot-bg text-bot-text transition-shadow placeholder:text-bot-text-muted focus-visible:ring-bot-accent/50 focus-visible:shadow-[0_0_0_1px_rgba(0,229,160,0.15)] pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-bot-text-muted hover:text-bot-accent focus:outline-none"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  {showPassword ? (
                    <EyeOffIcon size={18} aria-hidden="true" />
                  ) : (
                    <EyeIcon size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-bot-accent font-medium text-bg-base transition-all hover:bg-bot-accent/90 hover:shadow-[0_0_20px_-4px_rgba(0,229,160,0.4)]"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-5 rounded-md border border-bot-border/50 bg-bot-bg/60 px-3 py-2.5 text-center">
            <p className="text-[11px] leading-relaxed text-bot-text-dim">
              Signed up via social login on{" "}
              <span className="font-medium text-bot-text">Sherlock</span>? Please{" "}
              <a
                href="https://sherlock.myco.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-bot-accent underline decoration-accent/30 underline-offset-2 transition-colors hover:decoration-accent"
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
