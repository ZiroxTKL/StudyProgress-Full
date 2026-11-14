import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type User, friendlyError } from "@studyprogress/client";
import { api, storage, setExpiredHandler } from "../services/api";
type Auth = {
  user: User | null;
  loading: boolean;
  error: string;
  retry: () => void;
  login: (e: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
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
        if (await storage.refresh()) {
          await api.refreshSession();
          const u = await api.me();
          if (active) setUser(u);
        }
      } catch (e) {
        if (active) setError(friendlyError(e));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [attempt]);
  useEffect(() => {
    setExpiredHandler(() => setUser(null));
    return () => setExpiredHandler(() => {});
  }, []);
  return (
    <Context.Provider
      value={{
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
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const a = useContext(Context);
  if (!a) throw new Error("AuthProvider requerido");
  return a;
}
