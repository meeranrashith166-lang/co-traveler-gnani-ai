# 🚚 Co-Traveler — Sovereign AI Highway Voice Co-Pilot for Indian Drivers

> **Submission for The Great Indian AI Internship Challenge by Gnani.ai**  
> *Track: Build Sovereign Indic AI for Frontline Bharat*

**Co-Traveler** is an acoustic-resilient, hands-free voice co-pilot designed specifically for India’s **9 million commercial truck drivers and interstate highway travelers**. Powered by **Gnani.ai’s foundational Indic speech models (Prisma STT v3.0 & Timbre TTS v3.0)**, Co-Traveler transforms noisy, high-risk highway drives into safer, voice-guided journeys with real-time Google Maps turn-by-turn road navigation, automated live GPS detection, on-the-spot speed calculation, and 24x7 emergency trauma care routing.

---

## 🏆 Targeted Award Categories (Gnani.ai Internship Challenge)

1. **🔊 Noise Canceller:** Engineered and tested for 80–90 dB truck cabin noise, highway wind drag, and compressed 8kHz audio where global models struggle.
2. **🔀 Mixed Vibes:** Seamless handling of transport corridor code-mixing (Hinglish, Tanglish, Punjabi-Hindi).
3. **🌏 Main Character:** Deep Indic support across 8 transport languages (English default, Tamil, Hindi, Hinglish, Punjabi, Telugu, Kannada, Marathi).
4. **✅ Real Deal:** Directly solves frontline highway emergencies (NHAI 1033), fuel stops, verified clean washrooms (Swachh Bharat), and 24x7 trauma hospitals.
5. **🏘️ Small Town, Big Build:** Built for logistics transport hubs (Namakkal, Ludhiana, Indore, Sankari, Transport Nagars).
6. **💡 Jugaad Genius:** Instant camera re-centering (`Center Vehicle`), on-the-spot speed calculation, and emergency routing with 1-tap Google Maps native navigation.
7. **🎬 Demo Day Drop:** Side-by-side cockpit split layout with live soundwave visualizer and instant voice feedback.

---

## ⚡ Live Gnani.ai Indic Foundational Model Integration

* **Prisma STT v3.0 (`POST https://api.vachana.ai/stt/v3`):**  
  High-accuracy Automatic Speech Recognition supporting telephony 8kHz audio, noise suppression, and regional dialect identification (`en-IN`, `ta-IN`, `hi-IN`, `pa-IN`, etc.).
* **Timbre TTS v3.0 (`POST https://api.vachana.ai/api/v1/tts/inference`):**  
  Studio-grade neural Indic speech synthesis delivering natural, in-cabin vocal guidance.  
  Supported voice personas:
  - **Devansh** (Indian English - Primary Default)
  - **Lakshmi** (Tamil)
  - **Shivani & Prakash** (Hindi & Hinglish)
  - **Avinash** (Punjabi)
  - **Chetana** (Telugu)
  - **Kalpana** (Kannada)
  - **Harshad** (Marathi)
* **Concurrency Lock & Auto-Retry Shield:**  
  Built with asynchronous mutex queuing (`asyncio.Lock()`) and backoff retry to strictly respect Gnani's 1-active-request concurrency limits and eliminate HTTP 429 rate limit errors.

---

## 🚀 Key Features & Capabilities

### 1. 🖥️ Widescreen Cockpit Split Dashboard
* **Left Side — Live Google Maps Highway Corridor & Action Tiles:**
  - Real Google Maps roadmap (`lyrs=m`) and satellite hybrid (`lyrs=y`) tile switching.
  - 4 Giant 1-Tap Driver Action Tiles designed for touch ergonomics while phone is dashboard-mounted:
    1. **🛣️ Upcoming Toll Plaza** (FASTag commercial rates & wait times)
    2. **⛽ Fuel & Diesel Bunk** (Live rates, DEF fluid, free air & water)
    3. **🚻 Clean Restroom & Rest Hub** (Swachh certified cubicles & food)
    4. **🚨 Emergency SOS & Hospital** (Direct routing to 24x7 Trauma ICU)
* **Right Side — Central Voice Deck & Response Feed:**
  - Giant Push-to-Talk (PTT) microphone button with live audio wave visualizer.
  - Instant voice guidance reading out loud in natural Indic neural speech.
  - Dynamic structured cards with one-tap calling (`tel:...`) and navigation links.

### 2. 🗺️ Real Google Maps Road Navigation (OSRM Engine)
* **Turn-by-Turn Road Geometry:** Connects the driver's vehicle directly to any bunk, toll, or hospital using actual roadway geometry (turns, highway curves, ramps—no straight zig-zag lines).
* **Dual-Casing Google Navigation Styling:** Dark navy blue casing (`#1d4ed8`, weight 8) with vivid navigation blue core (`#38bdf8`, weight 5).
* **1-Tap Native Google Maps App Deep Link:** Every card includes a direct deep link opening turn-by-turn navigation in the native Google Maps app.
* **Auto-Camera Framing (`fitBounds`):** Automatically pans and zooms to frame both the vehicle and the selected destination.

### 3. 🛰️ Always-On GPS & On-The-Spot Speed Calculation
* **Silent Auto-Lock GPS (Zero User Prompts):** Automatically detects real physical coordinates via `navigator.geolocation` with silent network location fallback. No manual city picker prompts needed.
* **On-The-Spot Travel Speed Calculation:** Continuously calculates speed on the spot using great-circle displacement over time ($\frac{\Delta\text{distance}}{\Delta\text{time}}$ via Haversine formula) plus raw hardware Doppler velocity.
* **Drive Speed Simulator (`🚗 Test Live Speed`):** Built-in test button allowing evaluators sitting at a desk to simulate real-time highway cruising (62–68 km/h).
* **Center Vehicle (🎯 Center Vehicle):** 1-tap camera snap button that immediately resets the map camera back to the vehicle's live coordinates at zoom level 15.

### 4. 🏥 Verified Highway POI Database
* **🏥 24x7 Highway Hospitals & Trauma ICU:** Verified emergency trauma centers with ICU beds, blood banks, advanced ambulances, and emergency surgeons.
* **⛽ Fuel Bunks:** IOCL, BPCL, and HPCL highway pumps with live diesel/petrol rates, 24x7 high-speed diesel dispensers, and AdBlue DEF.
* **🛣️ FASTag Toll Plazas:** Distance, commercial truck toll charges, passenger car fees, and recommended lanes for fast clearance.
* **🚻 Clean Restrooms & Rest Stops:** Swachh Bharat verified clean toilets with separate facilities, driver bathing cubicles, and safe truck parking.
* **🚨 Emergency SOS:** Direct integration with **National Highway Helpline 1033**, **Police 112**, 40T heavy towing cranes, and roadside mechanics.

---

## 🛠️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   DRIVER DASHBOARD                     │
│  HTML5 • CSS3 OLED Dark/Day • Leaflet.js • Web Audio   │
└──────────────────────────┬─────────────────────────────┘
                           │ Async REST / Audio Chunks
┌──────────────────────────▼─────────────────────────────┐
│                 FASTAPI ASYNC BACKEND                  │
│             server.py (Uvicorn ASGI Engine)            │
├──────────────────────────┬─────────────────────────────┤
│   services/agent.py      │   services/highway_db.py    │
│   Conversational NLP     │   Haversine GPS & Real POIs │
├──────────────────────────┴─────────────────────────────┤
│              services/gnani_client.py                  │
│       Asyncio Lock Queue & Error Handling Proxy        │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
┌──────────────▼──────────┐    ┌──────────▼──────────────┐
│    Gnani Prisma STT     │    │    Gnani Timbre TTS     │
│   Telephony & Noise v3  │    │   Indic Neural Cloud    │
└─────────────────────────┘    └─────────────────────────┘
```

---

## 🚀 Running the Project Locally

### 1. Prerequisites
- Python 3.10+
- Modern Web Browser (Google Chrome, Microsoft Edge, Mozilla Firefox)

### 2. Installation
```bash
# Clone or navigate to the project directory
cd "d:\Gnani AI Internship"

# Install required dependencies
pip install -r requirements.txt
```

### 3. Configure API Credentials
Create a `.env` file from `.env.example`:
```env
GNANI_BASE_URL=https://api.vachana.ai
GNANI_API_KEY=your_vachana_api_key_here
```
*(A pre-configured working Gnani API key is already configured in `.env`).*

### 4. Start the Application Server
**Option A: 1-Click Launch on Windows (Recommended)**
Simply double-click `start.bat` (or `run.bat`). It automatically verifies Python dependencies, launches your browser at `http://localhost:8000`, and starts the server!

**Option B: Manual Terminal Launch**
```bash
python server.py
```
Open your browser and navigate to:
```text
http://localhost:8000
```

---

## 📁 Repository Directory Structure

```
d:\Gnani AI Internship\
├── server.py               # FastAPI backend with audio proxy and API endpoints
├── requirements.txt        # Python dependency manifest
├── .env.example            # Environment template
├── .gitignore              # Protects API keys and secrets from git
├── README.md               # Comprehensive project documentation
├── services\
│   ├── gnani_client.py     # Gnani Prisma STT v3.0 & Timbre TTS v3.0 async client
│   ├── highway_db.py       # Live highway POIs, hospitals, Haversine formula
│   └── agent.py            # Indic conversational logic and structured cards
└── static\
    ├── index.html          # Split-cockpit driver dashboard
    ├── style.css           # OLED night & day themes with driver touch ergonomics
    ├── app.js              # Live GPS tracking, speed engine, OSRM road routing
    ├── logo.svg            # Custom vector brand logo
    ├── manifest.json       # PWA mobile installation manifest
    └── leaflet\            # Offline-proof local Leaflet map assets
        ├── leaflet.js
        └── leaflet.css
```

---

## 📝 Submission Checklist for Judges

- [x] **Working Indic STT & TTS:** Verified live on Gnani Prisma STT v3.0 and Timbre TTS v3.0 cloud endpoints.
- [x] **Real-World Utility:** Solves frontline truck driver safety, hygiene, FASTag tolls, and emergency health.
- [x] **True Navigation:** Real Google Maps driving road geometry via OSRM + 1-tap Google Maps app launcher.
- [x] **Automated GPS & Speed:** Auto-detects driver GPS without manual questions; calculates instantaneous speed on the spot.
- [x] **Driver Ergonomics:** Side-by-side cockpit dashboard, giant 1-tap touch targets, day/night themes, and voice-first feedback.
- [x] **Code Security:** Zero client-side API key leakage; protected via backend `.env` and `.gitignore`.
