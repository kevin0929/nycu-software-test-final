import os
import re
import requests
from fastapi import HTTPException
from backend.utils.gemini import generate_lyric_card, translate_lyrics
from typing import Iterable
from dotenv import load_dotenv
from bs4 import BeautifulSoup

load_dotenv()

TOKEN = os.getenv("CLIENT_ACCESS_TOKEN")

API_BASE = "https://api.genius.com"
UA = "Mozilla/5.0 (compatible; lyrics-bot/1.0; +https://example.com)"

session = requests.Session()
session.headers.update({
    "Authorization": f"Bearer {TOKEN}",
    "User-Agent": UA,
})

def genius_search(query: str, per_page: int = 5):
    url = f"{API_BASE}/search"
    r = session.get(url, params={"q": query}, timeout=15)
    r.raise_for_status()
    return r.json()["response"]["hits"][:per_page]

def genius_song_url(song_id: int) -> str:
    url = f"{API_BASE}/songs/{song_id}"
    r = session.get(url, timeout=15)
    r.raise_for_status()
    return r.json()["response"]["song"]["url"]

def get_song_by_id(song_id: int):
    url = f"{API_BASE}/songs/{song_id}"
    r = session.get(url, timeout=15)
    r.raise_for_status()
    return r.json()["response"]["song"]

def scrape_genius_lyrics(song_url: str) -> str:
    r = session.get(song_url, timeout=15)
    r.raise_for_status()

    soup = BeautifulSoup(r.text, "lxml")

    containers = soup.select('div[data-lyrics-container="true"]')
    if not containers:
        legacy = soup.select_one("div.lyrics")
        if legacy:
            text = legacy.get_text("\n", strip=True)
            return cleanup_lyrics(text)
        raise RuntimeError("抓不到歌詞區塊：頁面結構可能變了或有防爬限制")

    parts = [c.get_text("\n", strip=True) for c in containers]
    raw_lyrics = clean_lyrics_genius("\n".join(parts))

    # lyrics = translate_lyrics(raw_lyrics)

    return raw_lyrics


def pick_best_original_hit(hits):
    filtered = []
    for hit in hits:
        result = hit.get("result", {})
        artist = (result.get("primary_artist") or {}).get("name", "")
        if "Genius" in artist.lower():
            filtered.append(hit)
    return filtered

def clean_lyrics_genius(raw: str) -> str:
    s = raw
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    s = re.sub(r"(?s)^\s*.*?(?=\[\s*(?:verse|chorus|intro|bridge)\b)", "", s, flags=re.IGNORECASE)
    s = re.sub(r"(?s)\[[^\]]*?\]", "", s)
    s = re.sub(r"(?s)\([^)]*?\)", "", s)
    s = re.sub(r"(?m)^\s*PS\s+.*?>\s*$", "", s)
    s = re.sub(r'(?m)^\s*["\',;:\-\s]+\s*$', "", s)
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\s+,", ",", s)
    s = re.sub(r",\s*,+", ",", s)
    s = re.sub(r"\s*;\s*", "; ", s)
    s = re.sub(r"\s{2,}", " ", s)

    lines = [ln.strip() for ln in s.split("\n")]
    lines = [ln for ln in lines if ln]

    return "\n".join(lines)
