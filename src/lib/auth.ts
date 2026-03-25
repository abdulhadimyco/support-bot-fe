import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { createElement } from "react";
import type { Agent } from "@/lib/types";
import { api, ApiError } from "@/lib/api-client";

const TOKEN_KEY = "c3pa_token";
const AGENT_KEY = "c3pa_agent";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
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

interface AuthState {
  token: string | null;
  agent: Agent | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken);
  const [agent, setAgent] = useState<Agent | null>(getStoredAgent);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post<{ token: string; agent: Agent }>(
        "/api/auth/login",
        { username, password },
      );
      setToken(res.token);
      setStoredAgent(res.agent);
      setTokenState(res.token);
      setAgent(res.agent);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setStoredAgent(null);
    setTokenState(null);
    setAgent(null);
  }, []);

  // Verify token on mount
  useEffect(() => {
    if (!token) return;
    api.get<{ agent: Agent }>("/api/auth/me").then(
      (res) => {
        setAgent(res.agent);
        setStoredAgent(res.agent);
      },
      (err) => {
        if (err instanceof ApiError && err.status === 401) {
          logout();
        }
      },
    );
  }, [token, logout]);

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
