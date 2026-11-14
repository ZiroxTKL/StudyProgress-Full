import { useCallback, useEffect, useMemo, useState } from "react";
import type { Page, PageQuery } from "@studyprogress/client";
import { useSearchParams } from "react-router-dom";
import { useResource } from "./useResource";

export function usePageQuery<T>(
  defaultSort: string,
  loadPage: (query: PageQuery, signal: AbortSignal) => Promise<Page<T>>,
) {
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
          (previous) => {
            const next = new URLSearchParams(previous);
            next.set("search", search);
            next.set("page", "0");
            return next;
          },
          { replace: true },
        );
      }
    }, 350);
    return () => clearTimeout(t);
  }, [search, params, setParams]);
  const q = useMemo(() => {
    const p = new URLSearchParams(raw);
    const rawPage = Number(p.get("page"));
    const page =
      Number.isInteger(rawPage) && rawPage >= 0 && rawPage <= 2_147_483_647
        ? rawPage
        : 0;
    const rawSize = Number(p.get("size"));
    return {
      page,
      size: [10, 25, 50, 100].includes(rawSize) ? rawSize : 10,
      search: p.get("search") || "",
      sort: p.get("sort") || defaultSort,
    };
  }, [raw, defaultSort]);
  const resource = useResource(
    useCallback(
      async (signal) => ({ query: q, page: await loadPage(q, signal) }),
      [loadPage, q],
    ),
  );
  const currentPage = resource.data?.query === q ? resource.data.page : null;
  const lastPage = currentPage ? Math.max(0, currentPage.totalPages - 1) : q.page;
  const correctedPage = Math.min(q.page, lastPage);
  const isOutOfRange = correctedPage !== q.page;

  useEffect(() => {
    const pageParam = params.get("page");
    if (
      resource.loading ||
      resource.error ||
      !currentPage ||
      pageParam === null ||
      pageParam === String(correctedPage)
    ) return;
    const next = new URLSearchParams(params);
    next.set("page", String(correctedPage));
    setParams(next, { replace: true });
  }, [correctedPage, currentPage, params, resource.error, resource.loading, setParams]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key !== "page") next.set("page", "0");
    setParams(next);
  };
  return {
    q,
    search,
    setSearch,
    update,
    resource: {
      ...resource,
      data: currentPage,
      loading: !resource.error && (resource.loading || !currentPage || isOutOfRange),
    },
  };
}
