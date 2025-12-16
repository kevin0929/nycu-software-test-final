"use server";

export const getSongById = async (song_id: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/search/song/${song_id}`);
        const data = await response.json();
        
        return data;
    }
    catch (error) {
        console.error("Error fetching search results:", error);
    }
}