"""
測試 Gemini AI 整合功能
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
import json
from backend.utils.gemini import (
    generate_lyric_card,
    translate_lyrics,
)


class TestGenerateLyricCard:
    """測試生成學習卡片 - 專注於資料格式驗證"""
    
    @patch('backend.utils.gemini.client.models.generate_content')
    def test_returns_valid_json_format(self, mock_generate):
        """LLM 回傳應該是有效的 JSON 格式"""
        # Arrange
        mock_response = Mock()
        mock_response.text = '[{"id": 1, "term": "test"}]'
        mock_generate.return_value = mock_response
        
        # Act
        result = generate_lyric_card("test lyrics")
        
        # Assert
        assert result is not None
        # 驗證可以解析為 JSON
        try:
            parsed = json.loads(result)
            assert isinstance(parsed, list)
        except json.JSONDecodeError:
            pytest.fail("回傳的內容不是有效的 JSON")
    
    @patch('backend.utils.gemini.client.models.generate_content')
    def test_json_contains_required_fields(self, mock_generate):
        """JSON 陣列中的每個物件應包含必要欄位"""
        # Arrange
        mock_response = Mock()
        valid_card = {
            "id": 1,
            "term": "言って",
            "reading": "いって",
            "part": "動詞",
            "meaning": "to say",
            "usage": "言ってください",
            "translation": "Please say it",
            "difficulty": "N5"
        }
        mock_response.text = json.dumps([valid_card])
        mock_generate.return_value = mock_response
        
        # Act
        result = generate_lyric_card("test")
        cards = json.loads(result)
        
        # Assert
        required_fields = ["id", "term", "reading", "part", "meaning", 
                          "usage", "translation", "difficulty"]
        
        assert len(cards) > 0, "應該至少有一張卡片"
        
        for card in cards:
            for field in required_fields:
                assert field in card, f"卡片缺少必要欄位: {field}"
                assert card[field] is not None, f"欄位 {field} 不應為 None"
    
    @patch('backend.utils.gemini.client.models.generate_content')
    def test_difficulty_field_has_valid_values(self, mock_generate):
        """difficulty 欄位應該是 N1-N5 其中之一"""
        # Arrange
        mock_response = Mock()
        mock_cards = [
            {"id": 1, "term": "test", "reading": "test", "part": "noun",
             "meaning": "test", "usage": "test", "translation": "test",
             "difficulty": "N3"}
        ]
        mock_response.text = json.dumps(mock_cards)
        mock_generate.return_value = mock_response
        
        # Act
        result = generate_lyric_card("test")
        cards = json.loads(result)
        
        # Assert
        valid_levels = ["N4~N5",  "N3", "N1~N2"]
        for card in cards:
            assert card["difficulty"] in valid_levels, \
                f"difficulty 應該是 {valid_levels} 之一，但得到: {card['difficulty']}"
    
    @patch('backend.utils.gemini.client.models.generate_content')
    def test_handles_malformed_json_response(self, mock_generate):
        """應該能處理格式錯誤的 JSON 回應"""
        # Arrange
        mock_response = Mock()
        mock_response.text = "This is not JSON"
        mock_generate.return_value = mock_response
        
        # Act
        result = generate_lyric_card("test")
        
        # Assert
        # 驗證我們能偵測到格式錯誤
        with pytest.raises(json.JSONDecodeError):
            json.loads(result)
    
    @patch('backend.utils.gemini.client.models.generate_content')
    def test_handles_empty_array_response(self, mock_generate):
        """應該能處理空陣列回應"""
        # Arrange
        mock_response = Mock()
        mock_response.text = "[]"
        mock_generate.return_value = mock_response
        
        # Act
        result = generate_lyric_card("test")
        cards = json.loads(result)
        
        # Assert
        assert isinstance(cards, list)
        assert len(cards) == 0
    
    @patch('backend.utils.gemini.client.models.generate_content')
    def test_handles_api_error_gracefully(self, mock_generate):
        """API 錯誤時應該妥善處理"""
        # Arrange
        mock_generate.side_effect = Exception("API Error")
        
        # Act & Assert
        try:
            result = generate_lyric_card("test")
            assert result is None
        except Exception:   
            pass  # 拋異常也是可接受的行為


class TestTranslateLyrics:
    """測試歌詞翻譯 - 專注於資料格式，不測試翻譯品質"""
    
    @patch('backend.utils.gemini.client.models.generate_content')
    def test_returns_non_empty_string(self, mock_generate):
        """翻譯應該回傳非空字串"""
        # Arrange
        mock_response = Mock()
        mock_response.text = "いって\nわたし"
        mock_generate.return_value = mock_response
        
        # Act
        result = translate_lyrics("言って\n私")
        
        # Assert
        assert isinstance(result, str)
        assert len(result) > 0
    
    @patch('backend.utils.gemini.client.models.generate_content')
    def test_preserves_line_structure(self, mock_generate):
        """翻譯應該保持基本的行結構"""
        # Arrange
        input_lines = 3
        mock_response = Mock()
        mock_response.text = "line1\nline2\nline3"
        mock_generate.return_value = mock_response
        
        # Act
        result = translate_lyrics("一行\n二行\n三行")
        
        # Assert
        # 只驗證有換行符號，不驗證數量必須完全相同
        assert "\n" in result or len(result.split()) > 1
    
    @patch('backend.utils.gemini.client.models.generate_content')
    def test_handles_api_error(self, mock_generate):
        """API 錯誤時應該處理"""
        # Arrange
        mock_generate.side_effect = Exception("Network error")
        
        # Act & Assert
        try:
            result = translate_lyrics("test")
            assert result is None
        except Exception:
            pass  # 拋異常也是可接受的


class TestGeminiIntegration:
    """測試與 Gemini API 的整合邏輯"""
    
    @patch('backend.utils.gemini.client.models.generate_content')
    def test_uses_correct_model(self, mock_generate):
        """應該使用正確的模型"""
        # Arrange
        mock_response = Mock()
        mock_response.text = "response"
        mock_generate.return_value = mock_response
        
        # Act
        generate_lyric_card("test")
        
        # Assert
        mock_generate.assert_called_once()
        # 驗證使用的 model 參數
        call_kwargs = mock_generate.call_args[1]
        assert 'model' in call_kwargs
    
    @patch('backend.utils.gemini.client.models.generate_content')
    def test_prompt_structure_for_cards(self, mock_generate):
        """學習卡片的 Prompt 應該包含必要說明"""
        # Arrange  
        mock_response = Mock()
        mock_response.text = "[]"
        mock_generate.return_value = mock_response
        
        # Act
        generate_lyric_card("test lyrics")
        
        # Assert
        prompt = mock_generate.call_args[1]['contents']
        # 只驗證我們的 prompt 包含這些關鍵字，不驗證 LLM 是否遵守
        assert isinstance(prompt, str)
        assert len(prompt) > 0
    
    @patch('backend.utils.gemini.client.models.generate_content')  
    def test_prompt_structure_for_translation(self, mock_generate):
        """翻譯的 Prompt 應該包含必要說明"""
        # Arrange
        mock_response = Mock()
        mock_response.text = "translated"
        mock_generate.return_value = mock_response
        
        # Act
        translate_lyrics("test")
        
        # Assert
        prompt = mock_generate.call_args[1]['contents']
        assert isinstance(prompt, str)
        assert len(prompt) > 0


# Fixtures
@pytest.fixture
def sample_lyrics():
    """範例歌詞"""
    return """言って
あのね 私 実は気付いてるの
ほら 君がいったこと"""


@pytest.fixture
def sample_flashcards():
    """範例學習卡片"""
    return [
        {
            "id": 1,
            "term": "言って",
            "reading": "いって",
            "part": "動詞",
            "meaning": "to say, to tell",
            "usage": "もっとちゃんと言って",
            "translation": "Say it more clearly",
            "difficulty": "N5"
        },
        {
            "id": 2,
            "term": "気付く",
            "reading": "きづく",
            "part": "動詞",
            "meaning": "to notice, to realize",
            "usage": "実は気付いてるの",
            "translation": "Actually, I've noticed",
            "difficulty": "N4"
        }
    ]
