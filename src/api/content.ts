import { api } from "@/src/api/client";
import { isPaginatedResponse } from "@/src/utils/pagination";

export type ContentItem = {
  id?: number;
  code: string;
  text: string;
};

type RawContentItem = {
  id?: number;
  code?: string;
  text?: string;
  fields?: { code?: string; text?: string };
};

function normalizeContentItem(item: RawContentItem): ContentItem | null {
  if (item.fields?.code && item.fields?.text) {
    return { code: String(item.fields.code), text: String(item.fields.text) };
  }
  if (item.code) {
    return { code: String(item.code), text: String(item.text ?? "") };
  }
  return null;
}

export async function fetchMobileAppContent(): Promise<ContentItem[]> {
  const res = await api.get<RawContentItem[] | { results: RawContentItem[] }>(
    "/api/mobile_app_content/"
  );
  const rawList = isPaginatedResponse<RawContentItem>(res.data)
    ? res.data.results
    : Array.isArray(res.data)
      ? res.data
      : [];

  return rawList
    .map((item) => normalizeContentItem(item))
    .filter((item): item is ContentItem => item !== null);
}

export function contentItemsToMap(items: ContentItem[]): Record<string, string> {
  const map: Record<string, string> = {};
  items.forEach((item) => {
    if (!item.code) return;
    map[item.code] = item.text ?? "";
  });
  return map;
}
