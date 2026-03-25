import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createElement } from "react";
import type { Agent, LoginResponse } from "@/lib/types";

// In dev, requests go through vite proxy to avoid CORS.
// In production, set VITE_AUTH_BASE_URL to the real auth URL.
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL ?? "/auth-api";

const ACCESS_TOKEN_KEY = "c3pa_access_token";
const REFRESH_TOKEN_KEY = "c3pa_refresh_token";
const AGENT_KEY = "c3pa_agent";

// --- localStorage helpers ---

export function getToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function setTokens(access: string | null, refresh: string | null) {
  if (access) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

function getStoredAgent(): Agent | null {
  const raw = localStorage.getItem(AGENT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Agent;
  } catch {
    return null;
  }
}

function setStoredAgent(agent: Agent | null) {
  if (agent) {
    localStorage.setItem(AGENT_KEY, JSON.stringify(agent));
  } else {
    localStorage.removeItem(AGENT_KEY);
  }
}

// --- Map myco user to our Agent type ---

function toAgent(user: LoginResponse["user"]): Agent {
  const name =
    [user.given_name, user.family_name].filter(Boolean).join(" ") ||
    user.preferred_username ||
    user.username;

  return {
    id: user["myco:userid"] || user.userid,
    email: user.email,
    name,
    username: user.username,
    role: user["cognito:groups"]?.includes("admin") ? "admin" : "agent",
  };
}

// --- Auth context ---

interface AuthState {
  token: string | null;
  agent: Agent | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken);
  const [agent, setAgent] = useState<Agent | null>(getStoredAgent);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async (usernameOrEmail: string, password: string) => {
      setIsLoading(true);
      try {
        const isEmail = usernameOrEmail.includes("@");
        const body = isEmail
          ? { email: usernameOrEmail, password, platform: "web" }
          : { username: usernameOrEmail, password, platform: "web" };

        const res = await fetch(`${AUTH_BASE_URL}/api/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(
            err?.message || `Login failed (${res.status})`,
          );
        }

        const data: LoginResponse = await res.json();
        const agentData = toAgent(data.user);

        setTokens(data.accessToken, data.refreshToken);
        setStoredAgent(agentData);
        setTokenState(data.accessToken);
        setAgent(agentData);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setTokens(null, null);
    setStoredAgent(null);
    setTokenState(null);
    setAgent(null);
  }, []);

  return createElement(
    AuthContext.Provider,
    { value: { token, agent, isLoading, login, logout } },
    children,
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
