import { describe, expect, it, vi } from "vitest";
import {
  fetchGeniusSuggestions,
  type GeniusCache,
  type GeniusSuggestion,
} from "@/lib/geniusClient";

const sampleCache: GeniusCache = {
  fa: [
    { type: "organization", text: "Facebook" },
    {
      type: "organization",
      text: "FasTrak",
      subtitle: "Government office, San Francisco, CA",
    },
    { type: "text", text: "face" },
  ],
  fac: [
    { type: "organization", text: "Facebook" },
    { type: "text", text: "face" },
    { type: "text", text: "facebook messenger" },
  ],
  face: [
    { type: "organization", text: "Facebook" },
    { type: "text", text: "face" },
    { type: "text", text: "facebook stock" },
  ],
  faces: [
    { type: "television", text: "Faces of COVID", subtitle: "TV program" },
    { type: "musician", text: "Faces", subtitle: "Rock band" },
    { type: "television", text: "Faces of Death", subtitle: "Film series" },
  ],
};

describe("fetchGeniusSuggestions (TDD scaffold)", () => {
  it("returns cached results without calling fetcher when prefix is cached", async () => {
    const cache: GeniusCache = { ...sampleCache };
    const fetcher = vi.fn();

    const results = await fetchGeniusSuggestions("face", fetcher, cache);

    expect(results).toEqual(sampleCache.face);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("normalizes term, fetches when missing, and populates cache", async () => {
    const cache: GeniusCache = { ...sampleCache };
    const fetched: GeniusSuggestion[] = [
      { type: "text", text: "facebook login" },
      { type: "text", text: "facebook lite" },
    ];
    const fetcher = vi.fn().mockResolvedValue(fetched);

    const results = await fetchGeniusSuggestions("  FacEBook ", fetcher, cache);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith("facebook");
    expect(results).toEqual(fetched);
    expect(cache.facebook).toEqual(fetched);
  });

  it("reuses freshly cached results on subsequent calls without hitting fetcher again", async () => {
    const cache: GeniusCache = { ...sampleCache };
    const fetched: GeniusSuggestion[] = [
      { type: "text", text: "facebook login" },
    ];
    const fetcher = vi.fn().mockResolvedValue(fetched);

    await fetchGeniusSuggestions("facebook", fetcher, cache);
    const results = await fetchGeniusSuggestions("facebook", fetcher, cache);

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(results).toEqual(fetched);
  });
});
