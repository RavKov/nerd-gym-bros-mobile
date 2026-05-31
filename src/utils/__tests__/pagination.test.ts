import {
  fetchAllPages,
  isPaginatedResponse,
  unwrapList,
  type PaginatedResponse,
} from "@/src/utils/pagination";

describe("isPaginatedResponse", () => {
  it("detects DRF paginated shape", () => {
    const data: PaginatedResponse<{ id: number }> = {
      count: 1,
      next: null,
      previous: null,
      results: [{ id: 1 }],
    };
    expect(isPaginatedResponse(data)).toBe(true);
  });

  it("rejects plain arrays and invalid objects", () => {
    expect(isPaginatedResponse([{ id: 1 }])).toBe(false);
    expect(isPaginatedResponse({ count: 1 })).toBe(false);
    expect(isPaginatedResponse(null)).toBe(false);
  });
});

describe("unwrapList", () => {
  it("unwraps paginated results", () => {
    const data: PaginatedResponse<{ id: number }> = {
      count: 2,
      next: null,
      previous: null,
      results: [{ id: 1 }, { id: 2 }],
    };
    expect(unwrapList(data)).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("returns a plain array as-is", () => {
    expect(unwrapList([{ id: 3 }])).toEqual([{ id: 3 }]);
  });
});

describe("fetchAllPages", () => {
  it("aggregates results across pages using absolute next URLs", async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          count: 3,
          next: "http://api.example.com/api/items/?page=2",
          previous: null,
          results: [{ id: 1 }, { id: 2 }],
        },
      })
      .mockResolvedValueOnce({
        data: {
          count: 3,
          next: null,
          previous: "http://api.example.com/api/items/?page=1",
          results: [{ id: 3 }],
        },
      });

    const items = await fetchAllPages<{ id: number }>({ get }, "/api/items/");

    expect(items).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(get).toHaveBeenNthCalledWith(1, "/api/items/");
    expect(get).toHaveBeenNthCalledWith(2, "/api/items/?page=2");
  });

  it("returns a legacy array response without further requests", async () => {
    const get = jest.fn().mockResolvedValueOnce({
      data: [{ id: 10 }, { id: 11 }],
    });

    const items = await fetchAllPages<{ id: number }>({ get }, "/api/legacy/");

    expect(items).toEqual([{ id: 10 }, { id: 11 }]);
    expect(get).toHaveBeenCalledTimes(1);
  });
});
