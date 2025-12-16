"use server";

function parsePossiblyMarkdownJson(raw: unknown) {
  if (typeof raw !== "string") return raw;

  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

export const getSuggestionCard = async (song_id: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/lyrics/card/${song_id}`);
        const data = await response.json();
        
        return parsePossiblyMarkdownJson(data);
    }
    catch (error) {
        console.error("Error fetching search results:", error);
    }
}