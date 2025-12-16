from datetime import datetime, timezone
from backend.utils.genius import (
    genius_search,
    scrape_genius_lyrics,
    genius_song_url,
    pick_best_original_hit,
    get_song_by_id,
)
from backend.utils.gemini import (
    generate_lyric_card,
)

def get_search_results(song_name: str):
    '''
    Return args:
        id: Song id
        song: Song name
        artist: Song artist name
        albumImageUrl: It is possible to be None
        latestSearchedAt: Latest searched time
        lyrics: Song lyrics text
    '''
    hits = genius_search(song_name, per_page=10)
    best = pick_best_original_hit(hits)
    if not hits:
        return []

    latest_searched_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    results = []
    for hit in hits:
        result = hit["result"]
        title = result.get("title") or "Unknown Title"
        artist = result.get("primary_artist", {}).get("name") or "Unknown Artist"
        song_id = result.get("id")
        album_image_url = result.get("song_art_image_thumbnail_url")

        # get url
        song_url = genius_song_url(song_id)
        lyrics = scrape_genius_lyrics(song_url)

        results.append({
            "id": song_id,
            "song": title,
            "artist": artist,
            "albumImageUrl": album_image_url,
            "latestSearchedAt": latest_searched_at,
            "lyrics": lyrics,
        })
    
    return results


def get_lyric_page(song_id: int):
    '''
    Return args:
        id: Song id
        song: Song name
        artist: Song artist name
        albumImageUrl: It is possible to be None
        latestSearchedAt: Latest searched time
        lyrics: Song lyrics text
    '''
    song = get_song_by_id(song_id)
    title = song.get("title") or "Unknown Title"
    artist = song.get("primary_artist", {}).get("name") or "Unknown Artist"
    song_id = song.get("id")
    album_image_url = song.get("song_art_image_thumbnail_url")

    song_url = genius_song_url(song_id)
    lyrics = scrape_genius_lyrics(song_url)

    # Since we don't have direct access to song metadata here,
    # we will return only the lyrics and id.
    latest_searched_at = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    return {
        "id": song_id,
        "song": title,
        "artist": artist,
        "albumImageUrl": album_image_url,
        "lyrics": lyrics,
        "latestSearchedAt": latest_searched_at,
    }

def get_lyric_card(song_id: int):
    """
    Return args:
        - id
        - term: 歌詞中的單字或片語 \n
        - reading: 單字或片語的平假名讀音 \n
        - part: 詞性 \n
        - meaning: 英文意思 \n
        - usage: 例句 \n
        - translation: 例句的英文翻譯 \n
        - difficulty: N5, N4, N3, N2, N1 \n
    """
    song_url = genius_song_url(song_id)
    lyrics = scrape_genius_lyrics(song_url)

    lyric_card = generate_lyric_card(lyrics)

    return lyric_card
