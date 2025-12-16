import {
  fetchFromGeniusApi,
  fetchGeniusSuggestions,
  type GeniusCache,
} from "@/lib/geniusClient";
import { SearchResult } from "@/types/search";

const suggestionCache: GeniusCache = {};

export async function searchGeniusSongs(
  term: string,
  limit = 5
): Promise<SearchResult[]> {
  try {
    const suggestions = await fetchGeniusSuggestions(
      term,
      fetchFromGeniusApi,
      suggestionCache
    );

    return suggestions.slice(0, limit).map((s, index) => {
      const fallbackId = `${term}-${index}`;
      return {
        id: (s.id ?? fallbackId).toString(),
        song: s.text ?? "",
        artist: s.subtitle ?? "",
        albumImageUrl: s.imageUrl ?? "",
        lastSearchedAt: new Date().toISOString(),
        lyrics: "",
      };
    });
  } catch (error) {
    console.error("Genius search failed", error);
    return [];
  }
}

export function clearGeniusCache() {
  Object.keys(suggestionCache).forEach((key) => delete suggestionCache[key]);
}
