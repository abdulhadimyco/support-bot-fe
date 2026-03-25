import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="flex min-h-full items-center justify-center bg-c3-bg p-4">
      <Card className="w-full max-w-sm border-c3-border bg-c3-surface">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl font-semibold text-c3-text">myco</span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-c3-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-c3-accent" />
            </span>
          </div>
          <CardTitle className="text-lg text-c3-text">
            C3PA Support Login
          </CardTitle>
          <Badge
            variant="outline"
            className="border-c3-accent/30 bg-c3-accent-dim font-mono text-[10px] tracking-widest text-c3-accent"
          >
            INTERNAL TOOL
          </Badge>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded border border-c3-danger/30 bg-c3-danger/10 p-2 text-center font-mono text-xs text-c3-danger">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-c3-text-muted">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="border-c3-border bg-c3-bg text-c3-text placeholder:text-c3-text-muted focus-visible:ring-c3-accent/50"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] uppercase tracking-widest text-c3-text-muted">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="border-c3-border bg-c3-bg text-c3-text placeholder:text-c3-text-muted focus-visible:ring-c3-accent/50"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-c3-accent text-c3-bg hover:bg-c3-accent/90"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
