import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { createElement } from "react";
import { jwtDecode } from "jwt-decode";
import type { Agent, LoginResponse } from "@/lib/types";

// In dev, requests go through vite proxy to avoid CORS.
// In production, set VITE_AUTH_BASE_URL to the real auth URL.
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL ?? "/auth-api";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const AGENT_KEY = "agent";


function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<{ exp?: number }>(token);
    if (!exp) return false;
    return Date.now() >= exp * 1000 - 30_000;
  } catch {
    return true;
  }
}


export function getToken(): string | null {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token && isTokenExpired(token)) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(AGENT_KEY);
    return null;
  }
  return token;
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

// --- Map auth user to our Agent type ---

function toAgent(user: LoginResponse["user"]): Agent {
  const name =
    [user.given_name, user.family_name].filter(Boolean).join(" ") ||
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

  const logoutRef = useRef(logout);
  logoutRef.current = logout;

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        logoutRef.current();
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [token]);

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
