import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type User, friendlyError } from "@studyprogress/client";
import { api } from "../services/api";
type Auth = {
  user: User | null;
  loading: boolean;
  error: string;
  retry: () => void;
  login: (e: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
  reload: () => Promise<void>;
};
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    (async () => {
      try {
        await api.refreshSession();
        const u = await api.me();
        if (active) setUser(u);
      } catch (e) {
        if (
          active &&
          !(
            typeof e === "object" &&
            e &&
            "response" in e &&
            (e as { response?: { status: number } }).response?.status === 401
          )
        )
          setError(friendlyError(e));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [attempt]);
  useEffect(() => {
    const expire = () => setUser(null);
    window.addEventListener("session-expired", expire);
    return () => window.removeEventListener("session-expired", expire);
  }, []);
  const value: Auth = {
    user,
    loading,
    error,
    retry: () => setAttempt((x) => x + 1),
    login: async (e, p) => {
      setUser(await api.login(e, p));
      setError("");
    },
    logout: async () => {
      try {
        await api.logout();
      } finally {
        setUser(null);
      }
    },
    reload: async () => setUser(await api.me()),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAuth() {
  const a = useContext(Context);
  if (!a) throw new Error("AuthProvider requerido");
  return a;
}
