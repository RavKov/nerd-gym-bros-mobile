import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { contentItemsToMap, fetchMobileAppContent } from "@/src/api/content";

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
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await fetchMobileAppContent();
      setContentMap(contentItemsToMap(items));
    } catch (error) {
      console.warn("Failed to fetch mobile app content:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
