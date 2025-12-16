from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
from backend.service.song import (
    get_search_results,
    get_lyric_page,
    get_lyric_card,
)

app = FastAPI(title="Music Card API", version="0.1.0")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Music Card API"}

@app.get("/search")
def search(song_name: str):
    return get_search_results(song_name)

@app.get("/search/song/{song_id}")
def lyric_page(song_id: int):
    return get_lyric_page(song_id)

@app.get("/lyrics/card/{song_id}")
def lyric_card(song_id: int):
    return get_lyric_card(song_id)