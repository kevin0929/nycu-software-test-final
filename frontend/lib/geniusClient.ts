export type GeniusSuggestion = {
  type: string;
  text: string;
  subtitle?: string;
  id?: number;
  url?: string;
  imageUrl?: string;
};

export type GeniusCache = Record<string, GeniusSuggestion[]>;

/**
 * Fetch Genius suggestions with a simple in-memory cache keyed by the normalized term.
 */
export async function fetchGeniusSuggestions(
  term: string,
  fetcher: (normalizedTerm: string) => Promise<GeniusSuggestion[]>,
  cache: GeniusCache
): Promise<GeniusSuggestion[]> {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return [];

  if (cache[normalized]) {
    return cache[normalized];
  }

  const results = await fetcher(normalized);
  cache[normalized] = results;
  return results;
}

export async function fetchFromGeniusApi(
  normalizedTerm: string,
  token =
    process.env.NEXT_PUBLIC_GENIUS_TOKEN ?? process.env.GENIUS_API_TOKEN ?? ""
): Promise<GeniusSuggestion[]> {
  if (!token) {
    throw new Error("Genius API token missing. Set NEXT_PUBLIC_GENIUS_TOKEN.");
  }

  const response = await fetch(
    `https://api.genius.com/search?q=${encodeURIComponent(normalizedTerm)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Genius API request failed: ${response.status}`);
  }

  const data = await response.json();
  const hits: GeniusApiHit[] = data?.response?.hits ?? [];

  return hits.map((hit) => {
    const result = hit?.result ?? {};
    const artist =
      result?.primary_artists?.[0]?.name ??
      result?.primary_artist?.name ??
      result?.primary_artist_names ??
      "";
    return {
      type: hit?.type ?? "text",
      text: result?.title ?? result?.full_title ?? "",
      subtitle: artist || undefined,
      id: result?.id,
      url: result?.url,
      imageUrl:
        result?.song_art_image_url ??
        result?.header_image_url ??
        result?.header_image_thumbnail_url ??
        "",
    };
  });
}
type GeniusApiArtist = { name?: string };

type GeniusApiResult = {
  id?: number;
  title?: string;
  full_title?: string;
  primary_artists?: GeniusApiArtist[];
  primary_artist?: GeniusApiArtist;
  primary_artist_names?: string;
  song_art_image_url?: string;
  header_image_url?: string;
  header_image_thumbnail_url?: string;
  url?: string;
};

type GeniusApiHit = {
  type?: string;
  result?: GeniusApiResult;
};
