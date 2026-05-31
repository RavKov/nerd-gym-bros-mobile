import React, { createContext, useCallback, useContext, useMemo } from "react";

import { contentItemsToMap } from "@/src/api/content";
import { useMobileContent } from "@/src/hooks/useApiQueries";

type ContentParams = Record<string, string | number | null | undefined>;

type ContentContextValue = {
  isLoading: boolean;
  contentMap: Record<string, string>;
  refresh: () => Promise<void>;
  t: (code: string, fallback?: string, params?: ContentParams) => string;
};

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

function formatText(text: string, params?: ContentParams) {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = params[key];
    if (value === null || value === undefined) return `{${key}}`;
    return String(value);
  });
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, refetch } = useMobileContent();
  const contentMap = useMemo(() => contentItemsToMap(data ?? []), [data]);

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const t = useCallback(
    (code: string, fallback?: string, params?: ContentParams) => {
      const raw = contentMap[code] ?? fallback ?? code;
      return formatText(raw, params);
    },
    [contentMap]
  );

  const value = useMemo(
    () => ({ isLoading, contentMap, refresh, t }),
    [isLoading, contentMap, refresh, t]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}
