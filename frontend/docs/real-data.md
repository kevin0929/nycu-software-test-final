# Wiring Real Data

This project currently uses mock data for search and lyrics. To switch to real data, adjust the fetching functions to return the expected shapes and swap the consumer hooks.

## Steps to enable real search
- Point `useSearchSuggestions` (`hooks/useSearchSuggestions.ts`) back to the real fetcher by importing `searchGeniusSongs` from `lib/geniusSearch.ts` instead of `searchSongs`.
- Provide an API token: set `NEXT_PUBLIC_GENIUS_TOKEN` (or `GENIUS_API_TOKEN`) for the Genius API. The client fetcher in `lib/geniusClient.ts` reads those env vars.
- Ensure the fetcher gracefully handles empty terms and errors (return `[]` rather than throwing so the UI stays stable).

## Requirements for the search fetcher
- Signature: `async function fetch(term: string, limit?: number): Promise<SearchResult[]>`.
- Should:
  - Trim and ignore empty terms (return `[]`).
  - Return at most `limit` items in recency order.
  - Produce **unique string IDs** for each result.
  - Populate a valid `albumImageUrl` (or an empty string) to keep the UI image component happy.
  - Set `lastSearchedAt` to an ISO timestamp (e.g., `new Date().toISOString()`).
  - Include `lyrics` when available; if not, set `lyrics: ""` (lyrics page should handle missing text).
  - Fail soft: on network/API errors, log and return `[]`.

### Target data shape (`SearchResult`)
Defined in `types/search.ts`:
```ts
{
  id: string;
  song: string;
  artist: string;
  albumImageUrl: string;
  lastSearchedAt: string; // ISO string
  lyrics: string;         // empty string if not available
}
```

## Requirements for the lyrics page data
- `app/lyrics/[id]/page.tsx` currently calls `getSongById`. For real data, provide a function with the same shape that fetches a single `SearchResult` (with `lyrics`) by ID.
- If the upstream API does not supply lyrics, add a second fetcher (e.g., `fetchLyricsById`) and merge the result into the `SearchResult` before returning.

## Deck data shape and conversion
- Deck expects `Card` (see `components/FlipCard.tsx`):
```ts
{
  id: number;
  term: string;
  reading: string;
  part: string;
  meaning: string;
  usage: string;
  translation: string;
  difficulty: "N4~N5" | "N3" | "N1~N2";
}
```
- If you want to add cards from real search results, map the external data into a `Card`. You’ll need to supply the language-learning fields (`term`, `reading`, etc.) and a `difficulty` bucket. Ensure `id` is a stable number (parse or hash the upstream ID) to avoid duplicates in `useDeck` (which checks numeric IDs).
- Deck persistence is handled in `useDeck` via `localStorage`, capped at 40 cards. Keep that limit in mind when converting/adding cards.

## Quick swap checklist
- [ ] Update `hooks/useSearchSuggestions.ts` to call the real fetcher.
- [ ] Set the Genius API token env var.
- [ ] Implement a real `getSongById` (or equivalent) that returns a `SearchResult` with `lyrics`.
- [ ] When wiring deck additions from real data, map incoming items to the `Card` shape and ensure numeric IDs and `difficulty` values are set.
