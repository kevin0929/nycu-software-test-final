"use server";

export const getSearchResults = async (query: string, maxResults: number) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/search?song_name=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        return data;
    }
    catch (error) {
        console.error("Error fetching search results:", error);
    }
}