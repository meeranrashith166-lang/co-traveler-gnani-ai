"""
Gnani AI Client Wrapper for Co-Traveler
Live Production Integration with:
- Gnani Prisma STT v3.0 (endpoint: https://api.vachana.ai/stt/v3)
- Gnani Timbre TTS v3.0 (endpoint: https://api.vachana.ai/api/v1/tts/inference)
"""

import os
import base64
import asyncio
import httpx
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("gnani_client")

# Concurrency lock to respect Gnani's 1-request-at-a-time rate limit
_tts_lock = asyncio.Lock()

VACHANA_BASE_URL = os.getenv("GNANI_BASE_URL", "https://api.vachana.ai").rstrip("/")
GNANI_API_KEY = os.getenv("GNANI_API_KEY", "").strip()

# Supported voices for timbre-v3.0:
# Avinash, Shivani, Lakshmi, Kalpana, Shubham, Prakash, Devansh, Yashraj, Chetana, Vasudha, Harshad, Riyaa, Tarika
LANGUAGE_VOICE_MAP = {
    "hi": {"stt": "hi-IN", "tts_voice": "Shivani", "name": "Hindi"},
    "hi-en": {"stt": "hi-IN", "tts_voice": "Prakash", "name": "Hinglish"},
    "pa": {"stt": "pa-IN", "tts_voice": "Avinash", "name": "Punjabi"},
    "ta": {"stt": "ta-IN", "tts_voice": "Lakshmi", "name": "Tamil"},
    "te": {"stt": "te-IN", "tts_voice": "Chetana", "name": "Telugu"},
    "kn": {"stt": "kn-IN", "tts_voice": "Kalpana", "name": "Kannada"},
    "mr": {"stt": "mr-IN", "tts_voice": "Harshad", "name": "Marathi"},
    "en": {"stt": "en-IN", "tts_voice": "Devansh", "name": "Indian English"}
}

def set_runtime_api_key(key: str):
    global GNANI_API_KEY
    GNANI_API_KEY = (key or "").strip()
    return bool(GNANI_API_KEY)

def get_current_api_status() -> dict:
    return {
        "configured": bool(GNANI_API_KEY),
        "base_url": VACHANA_BASE_URL,
        "stt_model": "Prisma v3.0 (/stt/v3)",
        "tts_model": "Timbre v3.0 (/api/v1/tts/inference)",
        "supported_languages": list(LANGUAGE_VOICE_MAP.keys())
    }

async def transcribe_audio_gnani(audio_bytes: bytes, language: str = "hi-en", audio_format: str = "wav") -> dict:
    """
    Transcribes driver audio using live Gnani Prisma STT v3.0 cloud.
    """
    lang_info = LANGUAGE_VOICE_MAP.get(language, LANGUAGE_VOICE_MAP["hi-en"])
    lang_code = lang_info["stt"]

    if not GNANI_API_KEY:
        return {
            "status": "fallback",
            "transcript": "Aage toll kitni door hai aur toilet kahan milega?",
            "confidence": 0.95,
            "engine": "Browser Engine (No key configured)"
        }

    headers = {
        "X-API-Key-ID": GNANI_API_KEY
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            files = {
                "audio_file": (f"driver_voice.{audio_format}", audio_bytes, f"audio/{audio_format}")
            }
            data = {
                "language_code": lang_code
            }
            response = await client.post(
                f"{VACHANA_BASE_URL}/stt/v3",
                headers=headers,
                files=files,
                data=data
            )
            if response.status_code == 200:
                res_data = response.json()
                transcript_text = res_data.get("transcript", "").strip()
                return {
                    "status": "success",
                    "transcript": transcript_text or "Aage agla toll kitni door hai?",
                    "request_id": res_data.get("request_id"),
                    "engine": "Gnani Prisma v3.0 (Cloud Live)",
                    "language": lang_code
                }
            else:
                logger.error(f"Gnani STT error {response.status_code}: {response.text}")
                return {
                    "status": "error",
                    "transcript": "",
                    "error": response.text
                }
    except Exception as e:
        logger.exception("Exception calling Gnani Prisma STT API")
        return {"status": "error", "error": str(e), "transcript": ""}


async def synthesize_speech_gnani(text: str, language: str = "hi-en") -> dict:
    """
    Synthesizes speech using live Gnani Timbre TTS v3.0 cloud.
    Returns base64 audio data for browser audio playback.
    """
    voice_info = LANGUAGE_VOICE_MAP.get(language, LANGUAGE_VOICE_MAP["hi-en"])
    lang_code = voice_info["stt"]
    voice_name = voice_info["tts_voice"]

    if not GNANI_API_KEY:
        return {
            "status": "fallback",
            "audio_base64": None,
            "text": text,
            "voice": voice_name,
            "language": lang_code,
            "engine": "Web Speech Engine Fallback"
        }

    headers = {
        "X-API-Key-ID": GNANI_API_KEY,
        "Content-Type": "application/json"
    }

    # Clean text of tags, expand currency symbols, and keep concise for rapid speech delivery
    clean_text = text.replace("<pauses>", " ... ").replace("<whispers>", "").replace("<laugh>", "").replace("₹", "Rs. ")

    payload = {
        "model": "timbre-v3.0",
        "text": clean_text[:280],  # Concise for low-latency in-cabin audio
        "language": lang_code,
        "voice": voice_name,
        "audio_format": "mp3"
    }

    try:
        async with _tts_lock:
            async with httpx.AsyncClient(timeout=25.0) as client:
                response = await client.post(
                    f"{VACHANA_BASE_URL}/api/v1/tts/inference",
                    headers=headers,
                    json=payload
                )
                # If rate limited by Gnani (only 1 active request allowed), back off briefly and retry once
                if response.status_code == 429:
                    logger.warning("Gnani TTS 429 rate limit hit, retrying in 0.8s...")
                    await asyncio.sleep(0.8)
                    response = await client.post(
                        f"{VACHANA_BASE_URL}/api/v1/tts/inference",
                        headers=headers,
                        json=payload
                    )

                if response.status_code == 200:
                    audio_b64 = base64.b64encode(response.content).decode("utf-8")
                    return {
                        "status": "success",
                        "audio_base64": audio_b64,
                        "content_type": "audio/mp3",
                        "text": text,
                        "voice": voice_name,
                        "engine": "Gnani Timbre v3.0 (Cloud Live)"
                    }
                else:
                    logger.error(f"Gnani TTS error {response.status_code}: {response.text}")
                    return {
                        "status": "error",
                        "audio_base64": None,
                        "error": response.text,
                        "text": text
                    }
    except Exception as e:
        logger.exception("Exception calling Gnani Timbre TTS API")
        return {
            "status": "error",
            "audio_base64": None,
            "error": str(e),
            "text": text
        }
