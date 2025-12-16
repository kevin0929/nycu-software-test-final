import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)
MODEL_NAME = "gemini-2.5-flash-lite"

def translate_lyrics(raw_lyrics: str) -> str:
    prompt = f"""
    你是一個很專業的日文翻譯者，請將以下歌詞的拼音都翻譯成平假名，並且要嚴格遵守以下規則: \n
    1. 不要有其他額外的輸出，只需輸出翻譯結果 \n
    2. 保持歌詞的行距和段落結構不變 \n
    {raw_lyrics} \n
    謝謝!
    """
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        return response.text

    except Exception as e:
        print(f"API 請求錯誤: {e}")


def generate_lyric_card(lyrics: str) -> str:
    prompt = f"""
    你是一個日語檢定的專家，請根據以下規則幫我從歌詞中挑選出適合做成日語檢定卡片的句子: \n
    1. 需要含有以下這幾個欄位，並作成 object : \n
       - id
       - term: 歌詞中的單字或片語 \n
       - reading: 單字或片語的平假名讀音 \n
       - part: 詞性 \n
       - meaning: 英文意思 \n
       - usage: 例句 \n
       - translation: 例句的英文翻譯 \n
       - difficulty: N5, N4, N3, N2, N1 \n
    2. 每個欄位都要有值，不能留空 \n
    3. 例句需要從歌詞中挑選出來 \n
    4. 請以 JSON array 的格式輸出 \n
    5. 不要有其他額外的輸出，'```JSON' 也不要 \n
    6. 請挑選出 10 個卡片就好，N3 ~ N5 可以多一點 \n

    歌詞內容如下: \n
    {lyrics}

    謝謝!
    """

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        return response.text

    except Exception as e:
        print(f"API 請求錯誤: {e}")