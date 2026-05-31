import type { AxiosInstance } from "axios";

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function isPaginatedResponse<T>(data: unknown): data is PaginatedResponse<T> {
  return (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray((data as PaginatedResponse<T>).results)
  );
}

export function unwrapList<T>(data: PaginatedResponse<T> | T[]): T[] {
  if (Array.isArray(data)) return data;
  if (isPaginatedResponse<T>(data)) return data.results;
  return [];
}

function resolveRequestUrl(next: string): string {
  try {
    const parsed = new URL(next);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return next;
  }
}

/** Fetches all pages from a DRF paginated list endpoint. */
export async function fetchAllPages<T>(
  client: Pick<AxiosInstance, "get">,
  initialPath: string
): Promise<T[]> {
  const all: T[] = [];
  let url: string | null = initialPath;

  while (url) {
    const res: { data: PaginatedResponse<T> | T[] } = await client.get<PaginatedResponse<T> | T[]>(
      url
    );
    const data = res.data;

    if (Array.isArray(data)) {
      all.push(...data);
      break;
    }

    all.push(...data.results);
    url = data.next ? resolveRequestUrl(data.next) : null;
  }

  return all;
}
