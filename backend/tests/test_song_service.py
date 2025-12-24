"""
測試 Song Service 業務邏輯
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timezone
from backend.service.song import (
    get_search_results,
    get_lyric_page,
    get_lyric_card,
)


class TestGetSearchResults:
    """測試搜尋歌曲服務"""
    
    @patch('backend.service.song.genius_search')
    @patch('backend.service.song.genius_song_url')
    @patch('backend.service.song.scrape_genius_lyrics')
    def test_search_returns_list_of_songs(self, mock_scrape, mock_url, mock_search):
        """搜尋應該回傳歌曲列表"""
        # Arrange
        mock_search.return_value = [
            {
                "result": {
                    "id": 1,
                    "title": "Test Song",
                    "primary_artist": {"name": "Test Artist"},
                    "song_art_image_thumbnail_url": "https://test.com/image.jpg"
                }
            }
        ]
        mock_url.return_value = "https://genius.com/test"
        mock_scrape.return_value = "Test lyrics"
        
        # Act
        result = get_search_results("test")
        
        # Assert
        assert isinstance(result, list)
        assert len(result) > 0
    
    @patch('backend.service.song.genius_search')
    @patch('backend.service.song.genius_song_url')
    @patch('backend.service.song.scrape_genius_lyrics')
    def test_search_result_has_correct_structure(self, mock_scrape, mock_url, mock_search):
        """回傳結果應該有正確的資料結構"""
        # Arrange
        mock_search.return_value = [
            {
                "result": {
                    "id": 123,
                    "title": "Song Title",
                    "primary_artist": {"name": "Artist Name"},
                    "song_art_image_thumbnail_url": "https://image.url"
                }
            }
        ]
        mock_url.return_value = "https://test.url"
        mock_scrape.return_value = "Lyrics text"
        
        # Act
        result = get_search_results("test")
        
        # Assert
        assert "id" in result[0]
        assert "song" in result[0]
        assert "artist" in result[0]
        assert "albumImageUrl" in result[0]
        assert "latestSearchedAt" in result[0]
        assert "lyrics" in result[0]
    
    @patch('backend.service.song.genius_search')
    @patch('backend.service.song.genius_song_url')
    @patch('backend.service.song.scrape_genius_lyrics')
    def test_search_adds_timestamp(self, mock_scrape, mock_url, mock_search):
        """應該加上搜尋時間戳記"""
        # Arrange
        mock_search.return_value = [
            {
                "result": {
                    "id": 1,
                    "title": "Test",
                    "primary_artist": {"name": "Artist"},
                    "song_art_image_thumbnail_url": None
                }
            }
        ]
        mock_url.return_value = "https://test.url"
        mock_scrape.return_value = "Lyrics"
        
        # Act
        result = get_search_results("test")
        
        # Assert
        assert "latestSearchedAt" in result[0]
        # 驗證是 ISO 8601 格式
        timestamp = result[0]["latestSearchedAt"]
        assert "T" in timestamp
        assert timestamp.endswith("Z")
    
    @patch('backend.service.song.genius_search')
    def test_search_empty_query_returns_empty_list(self, mock_search):
        """空查詢應該回傳空列表"""
        # Arrange
        mock_search.return_value = []
        
        # Act
        result = get_search_results("")
        
        # Assert
        assert result == []
    
    @patch('backend.service.song.genius_search')
    @patch('backend.service.song.genius_song_url')
    @patch('backend.service.song.scrape_genius_lyrics')
    def test_search_handles_missing_album_image(self, mock_scrape, mock_url, mock_search):
        """應該處理缺少專輯圖片的情況"""
        # Arrange
        mock_search.return_value = [
            {
                "result": {
                    "id": 1,
                    "title": "Test",
                    "primary_artist": {"name": "Artist"},
                    "song_art_image_thumbnail_url": None  # 缺少圖片
                }
            }
        ]
        mock_url.return_value = "https://test.url"
        mock_scrape.return_value = "Lyrics"
        
        # Act
        result = get_search_results("test")
        
        # Assert
        assert result[0]["albumImageUrl"] is None
    
    @patch('backend.service.song.genius_search')
    @patch('backend.service.song.genius_song_url')
    @patch('backend.service.song.scrape_genius_lyrics')
    def test_search_scrapes_lyrics_for_each_song(self, mock_scrape, mock_url, mock_search):
        """應該為每首歌爬取歌詞"""
        # Arrange
        mock_search.return_value = [
            {
                "result": {
                    "id": 1,
                    "title": "Song 1",
                    "primary_artist": {"name": "Artist"},
                    "song_art_image_thumbnail_url": None
                }
            },
            {
                "result": {
                    "id": 2,
                    "title": "Song 2",
                    "primary_artist": {"name": "Artist"},
                    "song_art_image_thumbnail_url": None
                }
            }
        ]
        mock_url.return_value = "https://test.url"
        mock_scrape.return_value = "Lyrics"
        
        # Act
        result = get_search_results("test")
        
        # Assert
        assert mock_scrape.call_count == 2
        assert all("lyrics" in song for song in result)


class TestGetLyricPage:
    """測試取得歌詞頁面"""
    
    @patch('backend.service.song.get_song_by_id')
    @patch('backend.service.song.genius_song_url')
    @patch('backend.service.song.scrape_genius_lyrics')
    def test_get_lyric_page_by_id(self, mock_scrape, mock_url, mock_get_song):
        """應該能根據 ID 取得歌詞"""
        # Arrange
        mock_get_song.return_value = {
            "id": 123,
            "title": "Test Song",
            "primary_artist": {"name": "Test Artist"},
            "song_art_image_thumbnail_url": "https://image.url"
        }
        mock_url.return_value = "https://genius.com/test"
        mock_scrape.return_value = "Test lyrics"
        
        # Act
        result = get_lyric_page(123)
        
        # Assert
        assert result["id"] == 123
        assert result["song"] == "Test Song"
        assert result["lyrics"] == "Test lyrics"
    
    @patch('backend.service.song.get_song_by_id')
    @patch('backend.service.song.genius_song_url')
    @patch('backend.service.song.scrape_genius_lyrics')
    def test_get_lyric_page_returns_complete_info(self, mock_scrape, mock_url, mock_get_song):
        """應該回傳完整的歌曲資訊"""
        # Arrange
        mock_get_song.return_value = {
            "id": 456,
            "title": "Complete Song",
            "primary_artist": {"name": "Complete Artist"},
            "song_art_image_thumbnail_url": "https://complete.url"
        }
        mock_url.return_value = "https://test.url"
        mock_scrape.return_value = "Complete lyrics"
        
        # Act
        result = get_lyric_page(456)
        
        # Assert
        required_fields = ["id", "song", "artist", "albumImageUrl", 
                          "lyrics", "latestSearchedAt"]
        for field in required_fields:
            assert field in result


class TestGetLyricCard:
    """測試生成歌詞卡片"""
    
    @patch('backend.service.song.genius_song_url')
    @patch('backend.service.song.scrape_genius_lyrics')
    @patch('backend.service.song.generate_lyric_card')
    def test_get_lyric_card_returns_flashcards(self, mock_generate, mock_scrape, mock_url):
        """應該回傳學習卡片列表"""
        # Arrange
        mock_url.return_value = "https://test.url"
        mock_scrape.return_value = "Test lyrics"
        mock_generate.return_value = '[{"id":1,"term":"test"}]'
        
        # Act
        result = get_lyric_card(123)
        
        # Assert
        assert result is not None
        assert isinstance(result, str)
    
    @patch('backend.service.song.genius_song_url')
    @patch('backend.service.song.scrape_genius_lyrics')
    @patch('backend.service.song.generate_lyric_card')
    def test_get_lyric_card_calls_gemini_api(self, mock_generate, mock_scrape, mock_url):
        """應該呼叫 Gemini API"""
        # Arrange
        mock_url.return_value = "https://test.url"
        mock_scrape.return_value = "Test lyrics for cards"
        mock_generate.return_value = '[]'
        
        # Act
        get_lyric_card(789)
        
        # Assert
        mock_generate.assert_called_once_with("Test lyrics for cards")


# Fixtures
@pytest.fixture
def sample_genius_hit():
    """範例 Genius 搜尋結果"""
    return {
        "result": {
            "id": 12345,
            "title": "Sample Song",
            "primary_artist": {
                "name": "Sample Artist"
            },
            "song_art_image_thumbnail_url": "https://example.com/image.jpg"
        }
    }


@pytest.fixture
def sample_song_data():
    """範例歌曲資料"""
    return {
        "id": 12345,
        "title": "Sample Song",
        "primary_artist": {
            "name": "Sample Artist"
        },
        "song_art_image_thumbnail_url": "https://example.com/image.jpg",
        "url": "https://genius.com/sample-song-lyrics"
    }
