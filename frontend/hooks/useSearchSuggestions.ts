import { useQuery } from "@tanstack/react-query";
import { searchSongs } from "@/lib/mockSearch";
import { SearchResult } from "@/types/search";

export function useSearchSuggestions(term: string, limit = 5) {
  return useQuery<SearchResult[]>({
    queryKey: ["search", term, limit],
    queryFn: () => searchSongs(term, limit),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}
