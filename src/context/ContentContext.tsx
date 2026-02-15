import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/src/config/api";

type ContentItem = {
  code: string;
  text: string;
};

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

function normalizeItems(data: any): ContentItem[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((item) => {
      if (item?.fields?.code && item?.fields?.text) {
        return { code: String(item.fields.code), text: String(item.fields.text) };
      }
      return { code: String(item.code), text: String(item.text) };
    });
  }
  if (Array.isArray(data.results)) {
    return normalizeItems(data.results);
  }
  return [];
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/mobile_app_content");
      const items = normalizeItems(res.data);
      const map: Record<string, string> = {};
      items.forEach((item) => {
        if (!item.code) return;
        map[item.code] = item.text ?? "";
      });
      setContentMap(map);
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
