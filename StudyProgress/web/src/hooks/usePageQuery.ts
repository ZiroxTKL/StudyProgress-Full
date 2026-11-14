import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
export function usePageQuery(defaultSort: string) {
  const [params, setParams] = useSearchParams(),
    [search, setSearch] = useState(params.get("search") || "");
  const raw = params.toString();
  useEffect(
    () => setSearch(new URLSearchParams(raw).get("search") || ""),
    [raw],
  );
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== (params.get("search") || "")) {
        setParams(
          (p) => {
            p.set("search", search);
            p.set("page", "0");
            return p;
          },
          { replace: true },
        );
      }
    }, 350);
    return () => clearTimeout(t);
  }, [search, params, setParams]);
  const q = useMemo(() => {
    const p = new URLSearchParams(raw);
    const page = Math.max(0, Number(p.get("page")) || 0),
      rawSize = Number(p.get("size"));
    return {
      page,
      size: [10, 25, 50, 100].includes(rawSize) ? rawSize : 10,
      search: p.get("search") || "",
      sort: p.get("sort") || defaultSort,
    };
  }, [raw, defaultSort]);
  const update = (key: string, value: string) =>
    setParams((p) => {
      p.set(key, value);
      if (key !== "page") p.set("page", "0");
      return p;
    });
  return { q, search, setSearch, update };
}
