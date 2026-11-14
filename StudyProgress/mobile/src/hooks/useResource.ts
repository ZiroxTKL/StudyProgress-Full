import { useCallback, useEffect, useState } from "react";
import { friendlyError } from "@studyprogress/client";
export function useResource<T>(load: (s: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((x) => x + 1), []);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    setError("");
    load(c.signal)
      .then((d) => {
        if (!c.signal.aborted) setData(d);
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(friendlyError(e));
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [load, version]);
  return { data, loading, error, reload };
}
