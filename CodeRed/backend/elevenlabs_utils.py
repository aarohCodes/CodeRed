# elevenlabs_utils.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

def text_to_speech_elevenlabs(prompt_text, voice_id="QPBKI85w0cdXVqMSJ6WB"):
    """
    Convert text to speech using ElevenLabs API
    Default voice_id is for a natural female voice
    """
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "text": prompt_text,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8
        }
    }
    
    print(f"🔊 Calling ElevenLabs TTS for text: {prompt_text[:50]}...")
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code != 200:
        print(f"❌ ElevenLabs error: {response.status_code} - {response.text}")
        raise Exception(f"ElevenLabs API error: {response.status_code}")
    
    print(f"✅ Audio generated successfully ({len(response.content)} bytes)")
    return response.content  # mp3 bytes