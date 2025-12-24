"""
測試 Genius API 整合功能
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from backend.utils.genius import (
    genius_search,
    genius_song_url,
    get_song_by_id,
    scrape_genius_lyrics,
    clean_lyrics_genius,
    pick_best_original_hit,
)


class TestGeniusSearch:
    """測試 Genius 搜尋功能"""
    
    @patch('backend.utils.genius.session.get')
    def test_genius_search_returns_hits(self, mock_get):
        """搜尋應該回傳歌曲列表"""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {
            "response": {
                "hits": [
                    {
                        "result": {
                            "id": 1,
                            "title": "Test Song",
                            "primary_artist": {"name": "Test Artist"}
                        }
                    }
                ]
            }
        }
        mock_get.return_value = mock_response
        
        # Act
        result = genius_search("test", per_page=5)
        
        # Assert
        assert len(result) <= 5
        assert isinstance(result, list)
        mock_get.assert_called_once()
    
    @patch('backend.utils.genius.session.get')
    def test_genius_search_with_limit(self, mock_get):
        """搜尋應該限制結果數量"""
        # Arrange
        mock_response = Mock()
        hits = [{"result": {"id": i, "title": f"Song {i}"}} for i in range(20)]
        mock_response.json.return_value = {"response": {"hits": hits}}
        mock_get.return_value = mock_response
        
        # Act
        result = genius_search("test", per_page=10)
        
        # Assert
        assert len(result) == 10
    
    @patch('backend.utils.genius.session.get')
    def test_genius_search_api_error_raises_exception(self, mock_get):
        """API 錯誤時應該拋出異常"""
        # Arrange
        mock_get.side_effect = Exception("API Error")
        
        # Act & Assert
        with pytest.raises(Exception):
            genius_search("test")


class TestGeniusSongUrl:
    """測試取得歌曲 URL"""
    
    @patch('backend.utils.genius.session.get')
    def test_genius_song_url_returns_valid_url(self, mock_get):
        """應該回傳有效的 Genius URL"""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {
            "response": {
                "song": {
                    "url": "https://genius.com/test-song-lyrics"
                }
            }
        }
        mock_get.return_value = mock_response
        
        # Act
        result = genius_song_url(12345)
        
        # Assert
        assert result == "https://genius.com/test-song-lyrics"
        assert result.startswith("https://genius.com/")


class TestScrapeGeniusLyrics:
    """測試歌詞爬取功能"""
    
    @patch('backend.utils.genius.session.get')
    def test_scrape_lyrics_with_modern_structure(self, mock_get):
        
        # Arrange
        html = '''
        <html>
            <div data-lyrics-container="true">
                Hello world<br>
                This is a test
            </div>
        </html>
        '''
        mock_response = Mock()
        mock_response.text = html
        mock_get.return_value = mock_response
        
        # Act
        result = scrape_genius_lyrics("https://test.com")
        
        # Assert
        assert "Hello world" in result
        assert "This is a test" in result
    





class TestGetSongById:
    """測試根據 ID 取得歌曲"""
    
    @patch('backend.utils.genius.session.get')
    def test_get_song_by_id_returns_song_data(self, mock_get):
        """應該回傳歌曲資料"""
        # Arrange
        mock_response = Mock()
        mock_response.json.return_value = {
            "response": {
                "song": {
                    "id": 12345,
                    "title": "Test Song",
                    "primary_artist": {"name": "Test Artist"}
                }
            }
        }
        mock_get.return_value = mock_response
        
        # Act
        result = get_song_by_id(12345)
        
        # Assert
        assert result["id"] == 12345
        assert result["title"] == "Test Song"
        assert result["primary_artist"]["name"] == "Test Artist"


# Fixtures
@pytest.fixture
def mock_genius_response():
    """模擬 Genius API 回應"""
    return {
        "response": {
            "hits": [
                {
                    "result": {
                        "id": 1,
                        "title": "Test Song",
                        "primary_artist": {"name": "Test Artist"},
                        "url": "https://genius.com/test"
                    }
                }
            ]
        }
    }


@pytest.fixture
def sample_lyrics_html():
    """範例歌詞 HTML"""
    return '''
    <html>
        <div data-lyrics-container="true">
            [Verse 1]<br>
            Hello world<br>
            This is a test (annotation)
        </div>
        <div data-lyrics-container="true">
            [Chorus]<br>
            La la la
        </div>
    </html>
    '''
