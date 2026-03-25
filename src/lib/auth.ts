import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createElement } from "react";
import type { Agent } from "@/lib/types";

const DUMMY_AGENT: Agent = {
  id: "agent-001",
  email: "agent@myco.com",
  name: "Support Agent",
  role: "agent",
};
const DUMMY_TOKEN = "dev-token-placeholder";

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

  const login = useCallback(
    async (_username: string, _password: string) => {
      setIsLoading(true);
      try {
        // TODO: Replace with real API call: api.post("/api/auth/login", { username, password })
        // For now, accept any credentials
        await new Promise((r) => setTimeout(r, 300)); // simulate network delay
        setToken(DUMMY_TOKEN);
        setStoredAgent(DUMMY_AGENT);
        setTokenState(DUMMY_TOKEN);
        setAgent(DUMMY_AGENT);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
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
