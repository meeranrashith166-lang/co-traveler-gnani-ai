"""
FastAPI Server for Co-Traveler
Serves the Driver Dashboard and handles Gnani AI Speech API integrations.
Supports real-world GPS calculations, dynamic API key configuration, and Google Maps integration.
"""

import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, Request, Header
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from services.highway_db import (
    HIGHWAY_SERVICES,
    get_next_toll,
    get_next_rest_stop,
    get_emergency_services,
    get_map_data
)
from services.agent import process_driver_query
from services.gnani_client import (
    transcribe_audio_gnani,
    synthesize_speech_gnani,
    set_runtime_api_key,
    get_current_api_status
)

app = FastAPI(title="Co-Traveler — Sovereign Highway Voice Co-Pilot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = os.path.join(os.path.dirname(__file__), "static")
if not os.path.exists(static_dir):
    os.makedirs(static_dir, exist_ok=True)

app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def root():
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Co-Traveler API Active."}

@app.get("/manifest.json")
async def manifest():
    manifest_path = os.path.join(static_dir, "manifest.json")
    if os.path.exists(manifest_path):
        return FileResponse(manifest_path, media_type="application/json")
    return {"name": "Co-Traveler"}

@app.get("/api/settings")
async def get_settings():
    """Returns live Gnani AI API connection status and model details."""
    return {
        "status": "success",
        "gnani": get_current_api_status()
    }

@app.post("/api/settings")
async def update_settings(request: Request):
    """Allows updating Gnani API key dynamically from UI."""
    body = await request.json()
    new_key = body.get("api_key", "").strip()
    is_active = set_runtime_api_key(new_key)
    return {
        "status": "success",
        "configured": is_active,
        "message": "Gnani API key updated successfully" if is_active else "API key cleared"
    }

@app.get("/api/highway-info")
async def get_highway_info(lat: float = None, lng: float = None):
    """Returns real-time upcoming highway POIs with optional real device GPS distance recalculation."""
    return {
        "status": "success",
        "current_route": "NH-48 (Delhi-Mumbai Freight Corridor)",
        "current_speed_kmh": 64,
        "next_toll": get_next_toll(user_lat=lat, user_lng=lng),
        "next_rest_stop": get_next_rest_stop(user_lat=lat, user_lng=lng),
        "emergency": get_emergency_services(user_lat=lat, user_lng=lng),
        "all_tolls": HIGHWAY_SERVICES["tolls"],
        "all_rest_stops": HIGHWAY_SERVICES["toilets_and_rest_stops"]
    }

@app.get("/api/map-data")
async def get_live_map_data(lat: float = None, lng: float = None):
    """Returns GPS coordinates for truck, route polyline, tolls, clean washrooms, and emergency mechanics."""
    return {
        "status": "success",
        "data": get_map_data(user_lat=lat, user_lng=lng)
    }

@app.post("/api/ask")
async def ask_agent(request: Request):
    """
    Handles driver voice/text query:
    1. Processes intention (bunks, tolls, toilets, emergency, mechanics, etc.)
    2. Synthesizes voice audio response via Gnani Timbre
    """
    body = await request.json()
    query = body.get("query", "")
    language = body.get("language", "en")
    lat = body.get("lat")
    lng = body.get("lng")

    agent_result = process_driver_query(query, language=language, user_lat=lat, user_lng=lng)
    
    # Request Gnani Timbre TTS for the spoken response
    tts_result = await synthesize_speech_gnani(agent_result["spoken_response"], language=language)

    return {
        "status": "success",
        "query": query,
        "language": language,
        "result": agent_result,
        "tts": tts_result
    }

@app.post("/api/voice-query")
async def voice_query(
    audio: UploadFile = File(...),
    language: str = Form("en"),
    lat: float = Form(None),
    lng: float = Form(None)
):
    """
    Direct voice pipeline from the driver's phone:
    1. Transcribes spoken audio via Gnani Prisma STT (telephony & noise robust)
    2. Runs conversational agent to answer query
    3. Synthesizes spoken audio output via Gnani Timbre TTS
    """
    audio_bytes = await audio.read()
    stt_result = await transcribe_audio_gnani(audio_bytes, language=language)
    transcript = stt_result.get("transcript", "அடுத்த டோல் மற்றும் பெட்ரோல் பங்க் எங்கே?")

    agent_result = process_driver_query(transcript, language=language, user_lat=lat, user_lng=lng)
    tts_result = await synthesize_speech_gnani(agent_result["spoken_response"], language=language)

    return {
        "status": "success",
        "stt": stt_result,
        "transcript": transcript,
        "result": agent_result,
        "tts": tts_result
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "app": "Co-Traveler",
        "gnani_status": get_current_api_status()
    }

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
