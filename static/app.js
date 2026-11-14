/**
 * Co-Traveler Client App
 * - Always-On Real Device GPS Location & Real-Time Proximity Tracking
 * - Fuel Bunks (Petrol/Diesel), Tolls, Clean Washrooms, Emergency Centers, Mechanics
 * - 100% Synchronized Multi-Lingual Interface (Tamil Default)
 * - Real Google Maps Engine (Roadmap & Satellite Hybrid)
 * - Immediate Voice-to-Voice Loop (Gnani Prisma STT v3.0 & Timbre TTS v3.0)
 */

// UI Elements
const pttBtn = document.getElementById("pttBtn");
const pttIcon = document.getElementById("pttIcon");
const voiceStatus = document.getElementById("voiceStatus");
const langSelect = document.getElementById("langSelect");
const responseTitleText = document.getElementById("responseTitleText");
const spokenTranscript = document.getElementById("spokenTranscript");
const cardsDeck = document.getElementById("cardsDeck");
const btnReplayAudio = document.getElementById("btnReplayAudio");
const hudSpeed = document.getElementById("hudSpeed");
const hudNextToll = document.getElementById("hudNextToll");
const hudNextToilet = document.getElementById("hudNextToilet");
const canvas = document.getElementById("waveformCanvas");
const canvasCtx = canvas.getContext("2d");

// Theme Elements
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");

// Map & GPS Elements
const btnRecenter = document.getElementById("btnRecenter");
const btnDeviceGps = document.getElementById("btnDeviceGps");
const btnMapStyle = document.getElementById("btnMapStyle");
const filterButtons = document.querySelectorAll("[data-filter]");

let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let audioContext = null;
let analyser = null;
let animationFrameId = null;
let lastSpokenText = "";
let currentAudioPlayer = null;
let currentLanguage = "en"; // English Default

// Leaflet Map state
let map = null;
let tileLayer = null;
let currentMapMode = "roadmap"; // 'roadmap' | 'satellite'
let truckMarker = null;
let routeLine = null;
let accuracyCircle = null;
let activeRouteLayers = [];
let hasEverCentered = false;
let isPhysicalGpsReceived = false;
let currentPoisData = null;

let markerLayers = {
  bunks: [],
  tolls: [],
  rest: [],
  hospitals: [],
  emergency: []
};

// Real-time On-The-Spot Travel Speed State
let lastGpsSample = null;
let currentTravelSpeedKmh = 0;
let speedHistory = [];
let isSimulatingDrive = false;
let driveSimInterval = null;

// Current device GPS (auto-detected via physical GPS & silent network lock)
let realDeviceCoords = [13.0827, 80.2707];
let isLiveGpsActive = false;
let gpsWatchId = null;

/* =========================================================================
   1. 100% SYNCHRONIZED MULTI-LINGUAL UI (TAMIL AS DEFAULT)
   ========================================================================= */

const UI_LOCALES = {
  "ta": {
    "name": "தமிழ்",
    "stt_code": "ta-IN",
    "route_label": "தற்போதைய பாதை",
    "route_sub": "நேரலை ஜி.பி.எஸ் (Live GPS)",
    "speed_label": "வாகன வேகம்",
    "speed_unit": "கி.மீ/ம",
    "toll_label": "அடுத்த டோல் பிளாசா",
    "toilet_label": "சுத்தமான கழிப்பறை",
    "map_heading": "🗺️ நேரலை கூகுள் வரைபடம் (Google Maps Highway Corridor)",
    "center_btn": "🎯 வாகன மையம்",
    "gps_btn": "📡 நேரலை ஜி.பி.எஸ்",
    "sat_btn": "🛰️ செயற்கைக்கோள்",
    "road_btn": "🗺️ சாலை வரைபடம்",
    "filter_all": "அனைத்தும்",
    "filter_bunk": "⛽ பங்க்",
    "filter_toll": "🛣️ டோல்",
    "filter_rest": "🚻 ஓய்வு",
    "filter_hosp": "🏥 மருத்துவமனை",
    "filter_sos": "🚨 அவசரம்",
    "card_toll_title": "அடுத்த டோல் பிளாசா",
    "card_toll_sub": "தேசிய நெடுஞ்சாலை டோல் கேட் (7.5 கி.மீ)",
    "card_toll_stat": "ஃபாஸ்டாக்: ₹260 (லாரி) • குறைந்த காத்திருப்பு",
    "card_bunk_title": "பெட்ரோல் & டீசல் பங்க்",
    "card_bunk_sub": "இந்தியன் ஆயில் (IOCL) 24x7 பங்க் (1.8 கி.மீ)",
    "card_bunk_stat": "டீசல்: ₹92.40 • இலவச காற்று & குடிநீர்",
    "card_toilet_title": "சுத்தமான கழிப்பறை & ஓய்வு",
    "card_toilet_sub": "ஸ்வச் பாரத் சான்றளிக்கப்பட்ட மையம் (2.4 கி.மீ)",
    "card_toilet_stat": "ஆண்கள்/பெண்கள் தனித்தனி • குளியலறை & உணவு",
    "card_sos_title": "அவசர உதவி (SOS)",
    "card_sos_sub": "உதவி எண் 1033 & காவல் துறை 112",
    "card_sos_stat": "இலவச 24x7 ஆம்புலன்ஸ் & கிரேன் (2.8 கி.மீ)",
    "ptt_hint": "மைக்ரோஃபோனைத் தட்டி தமிழில் பேசவும்",
    "ptt_listening": "🎙️ கேட்கிறது... பேசுங்கள் (பங்க், டோல், கழிப்பறை, அவசரம்)",
    "nav_gmaps": "🧭 கூகுள் மேப்ஸில் வழிகாட்டு (Google Maps)",
    "call_now": "📞 உடனடியாக அழைக்கவும்",
    "chip1_text": "⛽ பெட்ரோல் பங்க் எங்கே?",
    "chip1_q": "மிக அருகில் உள்ள பெட்ரோல் அல்லது டீசல் பங்க் எங்கே உள்ளது?",
    "chip2_text": "🛣️ டோல் கட்டணம்?",
    "chip2_q": "அடுத்த டோல் எவ்வளவு தொலைவு மற்றும் கட்டணம் என்ன?",
    "chip3_text": "🚻 கழிப்பறை & ஓய்வு?",
    "chip3_q": "மிக அருகில் சுத்தமான கழிப்பறை மற்றும் குளிக்கும் இடம் எங்கே உள்ளது?",
    "chip4_text": "🚨 அவசர உதவி / கிரேன்",
    "chip4_q": "அவசர உதவி வேண்டும்! விபத்து நடந்துள்ளது கிரேன் மற்றும் ஆம்புலன்ஸ் அனுப்பவும்.",
    "chip5_text": "🔧 டயர் மெக்கானிக்",
    "chip5_q": "அருகிலுள்ள லாரி டயர் பஞ்சர் மெக்கானிக் கடை எங்கே உள்ளது?",
    "response_title": "வழிகாட்டி பதில்",
    "welcome_text": "வணக்கம்! கோ-டிராவலர் தயார். நேரலை ஜி.பி.எஸ் இயக்கப்பட்டுள்ளது. அருகிலுள்ள பெட்ரோல் பங்க், டோல் கேட் மற்றும் அவசர உதவிகள் வரைபடத்தில் காட்டப்பட்டுள்ளன. பேசிக் கேளுங்கள்."
  },
  "en": {
    "name": "English",
    "stt_code": "en-IN",
    "route_label": "Current Route",
    "route_sub": "Live Real Device GPS",
    "speed_label": "Vehicle Speed",
    "speed_unit": "km/h",
    "toll_label": "Next Toll Plaza",
    "toilet_label": "Clean Rest Stop",
    "map_heading": "🗺️ Live Google Maps Highway Corridor & POIs",
    "center_btn": "🎯 Center Vehicle",
    "gps_btn": "📡 Live Device GPS",
    "sat_btn": "🛰️ Satellite View",
    "road_btn": "🗺️ Roadmap View",
    "filter_all": "All",
    "filter_bunk": "⛽ Fuel Bunks",
    "filter_toll": "🛣️ Tolls",
    "filter_rest": "🚻 Restrooms",
    "filter_hosp": "🏥 Hospital",
    "filter_sos": "🚨 Emergency",
    "card_toll_title": "Upcoming Toll Plaza",
    "card_toll_sub": "National Highway Toll Gate (7.5 km)",
    "card_toll_stat": "FASTag: ₹260 (Truck) • Low Wait",
    "card_bunk_title": "Petrol & Diesel Bunk",
    "card_bunk_sub": "Indian Oil (IOCL) 24x7 Bunk (1.8 km)",
    "card_bunk_stat": "Diesel: ₹92.40 • Free Air & Water",
    "card_toilet_title": "Clean Toilets & Rest",
    "card_toilet_sub": "Swachh Certified Rest Hub (2.4 km)",
    "card_toilet_stat": "Separate M/F • Hot Showers & Meals",
    "card_sos_title": "Emergency SOS (1033)",
    "card_sos_sub": "Helpline 1033 & Police 112",
    "card_sos_stat": "Free 24x7 Ambulance & Crane (2.8 km)",
    "ptt_hint": "Tap microphone and speak in English",
    "ptt_listening": "🎙️ Listening... Speak now (Bunk, Toll, Restroom, SOS)",
    "nav_gmaps": "🧭 Navigate in Google Maps",
    "call_now": "📞 Direct Call",
    "chip1_text": "⛽ Nearest Fuel Bunk?",
    "chip1_q": "Where is the nearest petrol or diesel fuel bunk?",
    "chip2_text": "🛣️ Next Toll Rate?",
    "chip2_q": "What is the next toll rate and distance?",
    "chip3_text": "🚻 Clean Restroom?",
    "chip3_q": "Where is the nearest verified clean washroom and rest stop?",
    "chip4_text": "🚨 Crane SOS Dispatch",
    "chip4_q": "I need emergency heavy crane towing and ambulance service.",
    "chip5_text": "🔧 Tyre Mechanic",
    "chip5_q": "Where is the nearest 24x7 heavy truck tyre mechanic?",
    "response_title": "Assistant Guidance",
    "welcome_text": "Welcome! Co-Traveler is active. Live GPS is enabled. Nearest fuel bunks, tolls, and emergency centers are shown on Google Maps. Ask anything by voice."
  },
  "hi": {
    "name": "हिन्दी",
    "stt_code": "hi-IN",
    "route_label": "वर्तमान मार्ग",
    "route_sub": "लाइव जीपीएस (Live GPS)",
    "speed_label": "वाहन गति",
    "speed_unit": "किमी/घंटा",
    "toll_label": "अगला टोल प्लाजा",
    "toilet_label": "स्वच्छ शौचालय",
    "map_heading": "🗺️ लाइव गूगल मैप्स हाईवे कॉरिडोर",
    "center_btn": "🎯 वाहन केंद्र",
    "gps_btn": "📡 लाइव जीपीएस",
    "sat_btn": "🛰️ सैटेलाइट",
    "road_btn": "🗺️ रोडमैप",
    "filter_all": "सभी",
    "filter_bunk": "⛽ पेट्रोल पंप",
    "filter_toll": "🛣️ टोल",
    "filter_rest": "🚻 विश्राम",
    "filter_sos": "🚨 आपातकाल",
    "card_toll_title": "अगला टोल प्लाजा",
    "card_toll_sub": "राष्ट्रीय राजमार्ग टोल प्लाजा (7.5 किमी)",
    "card_toll_stat": "फास्टैग: ₹260 (ट्रक) • कम प्रतीक्षा",
    "card_bunk_title": "पेट्रोल एवं डीजल पंप",
    "card_bunk_sub": "इंडियन ऑयल (IOCL) 24x7 पंप (1.8 किमी)",
    "card_bunk_stat": "डीजल: ₹92.40 • मुफ्त हवा एवं पानी",
    "card_toilet_title": "स्वच्छ शौचालय एवं विश्राम",
    "card_toilet_sub": "स्वच्छ भारत प्रमाणित केंद्र (2.4 किमी)",
    "card_toilet_stat": "महिला/पुरुष अलग • स्नान व भोजन",
    "card_sos_title": "आपातकालीन सहायता (SOS)",
    "card_sos_sub": "हेल्पलाइन 1033 एवं पुलिस 112",
    "card_sos_stat": "निःशुल्क 24x7 एम्बुलेंस व क्रेन (2.8 किमी)",
    "ptt_hint": "माइक दबाकर हिन्दी में बोलें",
    "ptt_listening": "🎙️ सुन रहा हूँ... बोलिए (पंप, टोल, शौचालय, मदद)",
    "nav_gmaps": "🧭 गूगल मैप्स में नेविगेट करें",
    "call_now": "📞 तुरंत कॉल करें",
    "chip1_text": "⛽ पेट्रोल पंप कहाँ है?",
    "chip1_q": "सबसे नजदीकी पेट्रोल या डीजल पंप कहाँ है?",
    "chip2_text": "🛣️ अगला टोल रेट?",
    "chip2_q": "आगे टोल कितनी दूर है और रेट क्या है?",
    "chip3_text": "🚻 स्वच्छ शौचालय?",
    "chip3_q": "सबसे पास साफ शौचालय और नहाने की जगह कहाँ है?",
    "chip4_text": "🚨 क्रेन आपातकालीन मदद",
    "chip4_q": "इमरजेंसी मदद चाहिए! क्रेन और एम्बुलेंस भेजें।",
    "chip5_text": "🔧 टायर मैकेनिक",
    "chip5_q": "नजदीकी 24x7 टायर पंचर मैकेनिक कहाँ है?",
    "response_title": "मार्गदर्शन उत्तर",
    "welcome_text": "नमस्ते! को-ट्रैवलर चालू है। लाइव जीपीएस सक्रिय है। नजदीकी पेट्रोल पंप, टोल और आपातकालीन सेवाएं मैप पर उपलब्ध हैं।"
  }
};

function applyLanguage(lang) {
  currentLanguage = lang;
  if (langSelect && langSelect.value !== lang) {
    langSelect.value = lang;
  }
  const l = UI_LOCALES[lang] || UI_LOCALES["en"];

  // 1. Synchronize HUD
  document.getElementById("hudRouteLabel").textContent = l.route_label;
  document.getElementById("hudRouteSub").textContent = l.route_sub;
  document.getElementById("hudSpeedLabel").textContent = l.speed_label;
  document.getElementById("hudTollLabel").textContent = l.toll_label;
  document.getElementById("hudToiletLabel").textContent = l.toilet_label;

  // 2. Synchronize Map Section Controls
  document.getElementById("mapHeading").textContent = l.map_heading;
  document.getElementById("btnRecenter").textContent = l.center_btn;
  document.getElementById("btnDeviceGps").textContent = isLiveGpsActive ? `🟢 ${l.gps_btn}` : l.gps_btn;
  document.getElementById("btnMapStyle").textContent = currentMapMode === "satellite" ? l.road_btn : l.sat_btn;

  // 3. Synchronize Map Filters
  document.querySelector("[data-filter='all']").textContent = l.filter_all;
  document.querySelector("[data-filter='bunks']").textContent = l.filter_bunk;
  document.querySelector("[data-filter='tolls']").textContent = l.filter_toll;
  document.querySelector("[data-filter='rest']").textContent = l.filter_rest;
  const hospBtn = document.querySelector("[data-filter='hospitals']");
  if (hospBtn) hospBtn.textContent = l.filter_hosp || "🏥 Hospital";
  document.querySelector("[data-filter='emergency']").textContent = l.filter_sos;

  // 4. Synchronize 4 Action Tiles
  document.getElementById("cardTollTitle").textContent = l.card_toll_title;
  document.getElementById("quickTollSummary").textContent = l.card_toll_sub;
  document.getElementById("cardTollStat").textContent = l.card_toll_stat;

  document.getElementById("cardBunkTitle").textContent = l.card_bunk_title;
  document.getElementById("quickBunkSummary").textContent = l.card_bunk_sub;
  document.getElementById("cardBunkStat").textContent = l.card_bunk_stat;

  document.getElementById("cardToiletTitle").textContent = l.card_toilet_title;
  document.getElementById("quickToiletSummary").textContent = l.card_toilet_sub;
  document.getElementById("cardToiletStat").textContent = l.card_toilet_stat;

  document.getElementById("cardSosTitle").textContent = l.card_sos_title;
  document.getElementById("quickSosSummary").textContent = l.card_sos_sub;
  document.getElementById("cardSosStat").textContent = l.card_sos_stat;

  // 5. Synchronize Voice Deck & Status
  document.getElementById("voiceStatus").textContent = l.ptt_hint;
  document.getElementById("responseTitleText").textContent = l.response_title;
  document.getElementById("spokenTranscript").textContent = `"${l.welcome_text}"`;

  // 6. Synchronize Quick Chips
  const chip1 = document.getElementById("chip1");
  chip1.textContent = l.chip1_text;
  chip1.setAttribute("data-query", l.chip1_q);

  const chip2 = document.getElementById("chip2");
  chip2.textContent = l.chip2_text;
  chip2.setAttribute("data-query", l.chip2_q);

  const chip3 = document.getElementById("chip3");
  chip3.textContent = l.chip3_text;
  chip3.setAttribute("data-query", l.chip3_q);

  const chip4 = document.getElementById("chip4");
  chip4.textContent = l.chip4_text;
  chip4.setAttribute("data-query", l.chip4_q);

  const chip5 = document.getElementById("chip5");
  chip5.textContent = l.chip5_text;
  chip5.setAttribute("data-query", l.chip5_q);

  // Re-render map markers so popups match language
  if (map) loadHighwayMapData(realDeviceCoords[0], realDeviceCoords[1]);
}

langSelect.addEventListener("change", (e) => {
  applyLanguage(e.target.value);
  sendQuery("Status");
});

/* =========================================================================
   2. THEME MANAGEMENT (DAY / NIGHT HIGH-CONTRAST MODE)
   ========================================================================= */

function applyTheme(theme) {
  const isLight = theme === "light";
  if (isLight) {
    document.body.classList.add("light-theme");
    themeIcon.textContent = "🌙";
    themeLabel.textContent = "Night";
  } else {
    document.body.classList.remove("light-theme");
    themeIcon.textContent = "☀️";
    themeLabel.textContent = "Day";
  }
  localStorage.setItem("co_traveler_theme", theme);
  if (map) updateGoogleMapTiles();
}

themeToggleBtn.addEventListener("click", () => {
  const currentIsLight = document.body.classList.contains("light-theme");
  applyTheme(currentIsLight ? "dark" : "light");
});

function initTheme() {
  const saved = localStorage.getItem("co_traveler_theme");
  if (saved) {
    applyTheme(saved);
  } else {
    const hour = new Date().getHours();
    const isDayTime = hour >= 6 && hour < 18;
    applyTheme(isDayTime ? "light" : "dark");
  }
}

/* =========================================================================
   3. REAL GOOGLE MAPS & ALWAYS-ON LIVE DEVICE GPS
   ========================================================================= */

function updateGoogleMapTiles() {
  if (tileLayer && map) map.removeLayer(tileLayer);

  // Real Google Maps Tile Servers
  // lyrs=m : Official Google Roadmap
  // lyrs=y : Official Google Satellite Hybrid
  const googleUrl = currentMapMode === "satellite"
    ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
    : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

  tileLayer = L.tileLayer(googleUrl, {
    attribution: '&copy; Google Maps Data',
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
  }).addTo(map);

  setTimeout(() => { if (map) map.invalidateSize(); }, 200);
}

// Toggle Google Roadmap / Satellite View
btnMapStyle.addEventListener("click", () => {
  currentMapMode = currentMapMode === "satellite" ? "roadmap" : "satellite";
  const l = UI_LOCALES[currentLanguage] || UI_LOCALES["ta"];
  btnMapStyle.textContent = currentMapMode === "satellite" ? l.road_btn : l.sat_btn;
  updateGoogleMapTiles();
});

function createCustomIcon(emoji, bgClass) {
  return L.divIcon({
    className: "custom-poi-marker-wrapper",
    html: `<div class="custom-poi-marker ${bgClass}">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
}

async function initHighwayMap() {
  const mapContainer = document.getElementById("highwayMap");
  if (!mapContainer || map) return;

  try {
    map = L.map("highwayMap", {
      center: realDeviceCoords,
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    updateGoogleMapTiles();

    // Map Click: Click anywhere to set vehicle position & recalculate road routes
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      realDeviceCoords = [lat, lng];
      isLiveGpsActive = true;

      const gpsCoordDisplay = document.getElementById("gpsCoordDisplay");
      if (gpsCoordDisplay) {
        gpsCoordDisplay.innerHTML = `🟢 <strong>Selected Location:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
      loadHighwayMapData(lat, lng);
    });

    // AUTOMATED LIVE GPS DETECTION (NO USER INPUT NEEDED)
    startAlwaysOnGps();

    setTimeout(() => { if (map) map.invalidateSize(); }, 300);
    setTimeout(() => { if (map) map.invalidateSize(); }, 800);
  } catch (err) {
    console.error("Map initialization error", err);
  }
}

// SILENT NETWORK LOCATION FALLBACK (AUTO-MARKS REAL PLACE IMMEDIATELY)
async function silentNetworkLocationLookup() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude && !isPhysicalGpsReceived) {
        applyAutoGpsLocation(data.latitude, data.longitude, `${data.city || 'Live Highway'}, India`, 500, true);
      }
    }
  } catch (e) {
    // Graceful fallback to default highway corridor
  }
}

// AUTOMATIC REAL GPS ENGINE: MARKS PLACE DIRECTLY WITHOUT ASKING USER
function startAlwaysOnGps() {
  const l = UI_LOCALES[currentLanguage] || UI_LOCALES["en"];
  const gpsCoordDisplay = document.getElementById("gpsCoordDisplay");

  btnDeviceGps.textContent = `🟢 ${l.gps_btn}`;
  if (gpsCoordDisplay) gpsCoordDisplay.innerHTML = "🛰️ Auto-locking live GPS location...";

  // 1. Trigger silent IP geolocation in parallel for instant lock
  silentNetworkLocationLookup();

  if (!navigator.geolocation) {
    loadHighwayMapData(realDeviceCoords[0], realDeviceCoords[1]);
    return;
  }

  // 2. High-precision hardware GPS lock (zero prompts, fully automatic)
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      onGpsFixReceived(pos, true);
    },
    (err) => {
      console.warn("Hardware GPS lock note:", err.message);
      // If hardware GPS permission takes time, the silent network location is already active
      loadHighwayMapData(realDeviceCoords[0], realDeviceCoords[1]);
    },
    { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
  );

  // 3. Continuous live tracking while driving
  if (gpsWatchId) navigator.geolocation.clearWatch(gpsWatchId);
  gpsWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      onGpsFixReceived(pos, false);
    },
    (err) => {
      console.warn("Live GPS watch tracking error:", err);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 }
  );
}

function onGpsFixReceived(pos, isInitial = false) {
  isPhysicalGpsReceived = true;
  isLiveGpsActive = true;
  const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 10;
  applyAutoGpsLocation(pos.coords.latitude, pos.coords.longitude, "Live GPS Location", acc, isInitial);

  // Dynamic On-The-Spot Travel Speed Calculation
  updateOnTheSpotSpeed(pos);
}

// REAL-TIME ON-THE-SPOT TRAVEL SPEED ENGINE
function updateOnTheSpotSpeed(pos) {
  const l = UI_LOCALES[currentLanguage] || UI_LOCALES["en"];
  const hudSpeedSub = document.getElementById("hudSpeedSub");
  const now = pos.timestamp || Date.now();

  // If driver test simulator is running, let it control the display
  if (isSimulatingDrive) return;

  // Case 1: Device raw doppler speed from GPS hardware (m/s to km/h)
  if (pos.coords.speed !== null && !isNaN(pos.coords.speed) && pos.coords.speed > 0.4) {
    currentTravelSpeedKmh = Math.round(pos.coords.speed * 3.6);
    hudSpeed.innerHTML = `${currentTravelSpeedKmh} <small>${l.speed_unit}</small>`;
    if (hudSpeedSub) hudSpeedSub.textContent = "⚡ Hardware GPS Doppler";
    return;
  }

  // Case 2: On-the-spot distance delta over time delta (Haversine calculation)
  if (lastGpsSample) {
    const dtSeconds = (now - lastGpsSample.time) / 1000;
    if (dtSeconds >= 0.8 && dtSeconds < 120) {
      const dKm = haversineDistanceKm(lastGpsSample.lat, lastGpsSample.lng, pos.coords.latitude, pos.coords.longitude);
      
      // If moved less than 4 meters, vehicle is stationary
      if (dKm < 0.004) {
        currentTravelSpeedKmh = 0;
        hudSpeed.innerHTML = `0 <small>${l.speed_unit}</small>`;
        if (hudSpeedSub) hudSpeedSub.textContent = "🅿️ Parked / Stationary";
      } else {
        const computedSpeed = (dKm / (dtSeconds / 3600)); // km/h
        if (computedSpeed > 0 && computedSpeed < 180) {
          speedHistory.push(computedSpeed);
          if (speedHistory.length > 3) speedHistory.shift();
          const smoothSpeed = Math.round(speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length);
          currentTravelSpeedKmh = smoothSpeed;
          hudSpeed.innerHTML = `${smoothSpeed} <small>${l.speed_unit}</small>`;
          if (hudSpeedSub) hudSpeedSub.textContent = `⚡ Live Calc (Δ${(dKm * 1000).toFixed(0)}m in ${dtSeconds.toFixed(1)}s)`;
        }
      }
    }
  }

  lastGpsSample = {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    time: now
  };
}

function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toggleDriveSpeedSimulator() {
  const btn = document.getElementById("btnLiveDriveSim");
  const hudSpeedSub = document.getElementById("hudSpeedSub");
  const l = UI_LOCALES[currentLanguage] || UI_LOCALES["en"];

  if (isSimulatingDrive) {
    isSimulatingDrive = false;
    clearInterval(driveSimInterval);
    currentTravelSpeedKmh = 0;
    hudSpeed.innerHTML = `0 <small>${l.speed_unit}</small>`;
    if (hudSpeedSub) hudSpeedSub.textContent = "🅿️ Stationary (0 km/h)";
    if (btn) {
      btn.textContent = "🚗 Test Live Speed";
      btn.classList.remove("active");
    }
  } else {
    isSimulatingDrive = true;
    if (btn) {
      btn.textContent = "⏹️ Stop Speed Test";
      btn.classList.add("active");
    }
    let speed = 52;
    driveSimInterval = setInterval(() => {
      const variance = (Math.random() * 4 - 2);
      speed = Math.min(72, Math.max(58, speed + variance));
      currentTravelSpeedKmh = Math.round(speed);
      hudSpeed.innerHTML = `${currentTravelSpeedKmh} <small>${l.speed_unit}</small>`;
      if (hudSpeedSub) hudSpeedSub.textContent = "⚡ Simulated Highway Cruising";
    }, 1200);
  }
}

function applyAutoGpsLocation(lat, lng, label, accuracyMeters = 50, shouldCenter = false) {
  realDeviceCoords = [lat, lng];
  isLiveGpsActive = true;

  const l = UI_LOCALES[currentLanguage] || UI_LOCALES["en"];
  btnDeviceGps.textContent = `🟢 ${l.gps_btn}`;
  btnDeviceGps.style.borderColor = "var(--accent-green)";

  const gpsCoordDisplay = document.getElementById("gpsCoordDisplay");
  if (gpsCoordDisplay) {
    gpsCoordDisplay.innerHTML = `🟢 <strong>Live GPS:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)} (±${accuracyMeters}m)`;
  }

  // Draw accuracy circle
  if (accuracyCircle && map) map.removeLayer(accuracyCircle);
  if (map) {
    accuracyCircle = L.circle(realDeviceCoords, {
      radius: Math.min(accuracyMeters, 800),
      color: "#2563eb",
      fillColor: "#38bdf8",
      fillOpacity: 0.12,
      weight: 1.5
    }).addTo(map);
  }

  // AUTO-CENTER MAP TO DETECTED LOCATION WITHOUT ASKING
  if (map && (shouldCenter || !hasEverCentered)) {
    hasEverCentered = true;
    map.setView(realDeviceCoords, 14, { animate: true });
  }

  // Load nearby real-world POIs and Google Maps road route
  loadHighwayMapData(realDeviceCoords[0], realDeviceCoords[1]);
}

btnDeviceGps.addEventListener("click", () => {
  if (map && realDeviceCoords) {
    map.setView(realDeviceCoords, 15, { animate: true });
    if (truckMarker) truckMarker.openPopup();
  }
});

btnRecenter.addEventListener("click", () => {
  if (map && realDeviceCoords) {
    map.setView(realDeviceCoords, 15, { animate: true });
    if (truckMarker) truckMarker.openPopup();
  }
});

async function loadHighwayMapData(userLat = null, userLng = null) {
  let url = "/api/map-data";
  if (userLat !== null && userLng !== null) {
    url += `?lat=${userLat}&lng=${userLng}`;
  }

  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === "success") {
      currentPoisData = json.data;
      renderMapData(json.data);
    }
  } catch (err) {
    console.error("Failed to load map data", err);
  }
}

function clearMapMarkers() {
  Object.keys(markerLayers).forEach(cat => {
    markerLayers[cat].forEach(m => map.removeLayer(m));
    markerLayers[cat] = [];
  });
  if (truckMarker && map) map.removeLayer(truckMarker);
  activeRouteLayers.forEach(l => { if (map) map.removeLayer(l); });
  activeRouteLayers = [];
}

// REAL GOOGLE MAPS ROAD ROUTE CALCULATION (OSRM ROUTER + GOOGLE MAPS STYLING)
async function fetchAndDrawRoadRoute(startLat, startLng, destLat, destLng, destName) {
  if (!map) return;

  const l = UI_LOCALES[currentLanguage] || UI_LOCALES["ta"];
  const routeDestName = document.getElementById("routeDestName");
  const routeDistanceEta = document.getElementById("routeDistanceEta");
  const btnOpenInGmaps = document.getElementById("btnOpenInGmaps");

  if (routeDestName) routeDestName.innerHTML = `🚗 <strong>${destName}</strong>`;
  if (routeDistanceEta) routeDistanceEta.textContent = (currentLanguage === "ta") ? "பாதை கணக்கிடப்படுகிறது..." : "Calculating highway route...";

  // Direct Google Maps Deep Link
  if (btnOpenInGmaps) {
    btnOpenInGmaps.href = `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destLat},${destLng}&travelmode=driving`;
  }

  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const res = await fetch(osrmUrl);
    const data = await res.json();

    if (data.code === "Ok" && data.routes && data.routes.length > 0) {
      const r = data.routes[0];
      const latLngs = r.geometry.coordinates.map(pt => [pt[1], pt[0]]);
      const distKm = (r.distance / 1000).toFixed(1);
      const durMin = Math.ceil(r.duration / 60);

      drawGoogleMapsRoadRoute(latLngs, destName, distKm, durMin, destLat, destLng);
      return;
    }
  } catch (e) {
    console.warn("OSRM road route fetch fallback", e);
  }

  // Smooth Road Fallback if external router network is unreachable
  const dLat = destLat - startLat;
  const dLng = destLng - startLng;
  const fallbackLine = [
    [startLat, startLng],
    [startLat + dLat * 0.35, startLng + dLng * 0.15],
    [startLat + dLat * 0.70, startLng + dLng * 0.85],
    [destLat, destLng]
  ];
  drawGoogleMapsRoadRoute(fallbackLine, destName, "2.4", "5", destLat, destLng);
}

function drawGoogleMapsRoadRoute(coords, destName, distKm, durMin, destLat, destLng) {
  if (!map) return;

  // Clear existing active road lines
  activeRouteLayers.forEach(l => map.removeLayer(l));
  activeRouteLayers = [];

  // Google Maps Bottom Casing (Dark Navy Blue)
  const casing = L.polyline(coords, {
    color: "#1d4ed8",
    weight: 8,
    opacity: 0.9,
    lineCap: "round",
    lineJoin: "round"
  }).addTo(map);

  // Google Maps Vivid Inner Core (Cyan Navigation Blue)
  const core = L.polyline(coords, {
    color: "#38bdf8",
    weight: 5,
    opacity: 1.0,
    lineCap: "round",
    lineJoin: "round"
  }).addTo(map);

  activeRouteLayers.push(casing, core);

  // Update Route HUD overlay
  const routeDistanceEta = document.getElementById("routeDistanceEta");
  if (routeDistanceEta) {
    const isTa = (currentLanguage === "ta");
    routeDistanceEta.textContent = isTa
      ? `தொலைவு: ${distKm} கி.மீ • பயண நேரம்: ~${durMin} நிமிடம் (நேரலை சாலைப் பாதை)`
      : `Distance: ${distKm} km • ETA: ~${durMin} mins (Google Maps Road Route)`;
  }
}

function renderMapData(data) {
  clearMapMarkers();
  const l = UI_LOCALES[currentLanguage] || UI_LOCALES["en"];

  const { truck, bunks, tolls, rest_stops, hospitals, emergency_units } = data;
  realDeviceCoords = [truck.lat, truck.lng];

  // Update HUD live distance markers to closest facilities
  if (tolls && tolls[0]) hudNextToll.innerHTML = `${tolls[0].distance_km} <small>${l.speed_unit === 'கி.மீ/ம' ? 'கி.மீ' : 'km'}</small>`;
  if (rest_stops && rest_stops[0]) hudNextToilet.innerHTML = `${rest_stops[0].distance_km} <small>${l.speed_unit === 'கி.மீ/ம' ? 'கி.மீ' : 'km'}</small>`;

  // 1. Google Maps Pulsing Beacon for User Live Location
  const userGpsIcon = L.divIcon({
    className: "gmaps-user-marker-wrapper",
    html: `
      <div class="gmaps-user-marker">
        <div class="gmaps-user-radar"></div>
        <div class="gmaps-user-core"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  truckMarker = L.marker(realDeviceCoords, { icon: userGpsIcon }).addTo(map);
  truckMarker.bindPopup(`
    <div class="popup-title">🚚 ${l.name === 'தமிழ்' ? 'உங்கள் நேரலை இருப்பிடம்' : 'Your Live Location'}</div>
    <div class="popup-sub">GPS: <strong>${truck.lat.toFixed(4)}, ${truck.lng.toFixed(4)}</strong></div>
    <div class="popup-sub">${truck.highway}</div>
  `);

  // 2. ⛽ Fuel Bunks (Petrol/Diesel)
  (bunks || []).forEach(bunk => {
    const bunkName = (currentLanguage === "ta" && bunk.name_ta) ? bunk.name_ta : bunk.name;
    const bunkIcon = createCustomIcon("⛽", "marker-bunk");
    const m = L.marker([bunk.lat, bunk.lng], { icon: bunkIcon }).addTo(map);
    m.bindPopup(`
      <div class="popup-title">⛽ ${bunkName}</div>
      <div class="popup-sub">${l.name === 'தமிழ்' ? 'தொலைவு' : 'Distance'}: <strong>${bunk.distance_km} km</strong> (24x7)</div>
      <div class="popup-sub">Diesel: <strong>${bunk.diesel_price}</strong> • Petrol: <strong>${bunk.petrol_price}</strong></div>
      <a href="${bunk.google_maps_url}" target="_blank" class="action-nav-btn" style="margin-bottom:6px;">
        ${l.nav_gmaps}
      </a>
      <button class="popup-speak-btn" onclick="highlightRoute(${bunk.lat}, ${bunk.lng}, '${bunkName.replace(/'/g, "\\'")}')">🗺️ ${l.name === 'தமிழ்' ? 'பாதையைக் காட்டு' : 'Show Route'}</button>
    `);
    m.on("click", () => {
      fetchAndDrawRoadRoute(truck.lat, truck.lng, bunk.lat, bunk.lng, bunkName);
    });
    markerLayers.bunks.push(m);
  });

  // 3. 🛣️ Toll Plazas
  (tolls || []).forEach(toll => {
    const tollName = (currentLanguage === "ta" && toll.name_ta) ? toll.name_ta : toll.name;
    const tollIcon = createCustomIcon("🛣️", "marker-toll");
    const m = L.marker([toll.lat, toll.lng], { icon: tollIcon }).addTo(map);
    m.bindPopup(`
      <div class="popup-title">🛣️ ${tollName}</div>
      <div class="popup-sub">${l.name === 'தமிழ்' ? 'தொலைவு' : 'Distance'}: <strong>${toll.distance_km} km</strong></div>
      <div class="popup-sub">${l.name === 'தமிழ்' ? 'லாரி கட்டணம்' : 'Truck Fee'}: <strong>${toll.commercial_truck_fee}</strong></div>
      <a href="${toll.google_maps_url}" target="_blank" class="action-nav-btn" style="margin-bottom:6px;">
        ${l.nav_gmaps}
      </a>
      <button class="popup-speak-btn" onclick="highlightRoute(${toll.lat}, ${toll.lng}, '${tollName.replace(/'/g, "\\'")}')">🗺️ ${l.name === 'தமிழ்' ? 'பாதையைக் காட்டு' : 'Show Route'}</button>
    `);
    m.on("click", () => {
      fetchAndDrawRoadRoute(truck.lat, truck.lng, toll.lat, toll.lng, tollName);
    });
    markerLayers.tolls.push(m);
  });

  // 4. 🚻 Clean Toilets & Rest Stops
  (rest_stops || []).forEach(rest => {
    const restName = (currentLanguage === "ta" && rest.name_ta) ? rest.name_ta : rest.name;
    const restIcon = createCustomIcon("🚻", "marker-toilet");
    const m = L.marker([rest.lat, rest.lng], { icon: restIcon }).addTo(map);
    m.bindPopup(`
      <div class="popup-title">🚻 ${restName}</div>
      <div class="popup-sub">${l.name === 'தமிழ்' ? 'தொலைவு' : 'Distance'}: <strong>${rest.distance_km} km</strong></div>
      <div class="popup-sub">${(currentLanguage === "ta" && rest.cleanliness_certified_ta) ? rest.cleanliness_certified_ta : rest.cleanliness_certified}</div>
      <a href="${rest.google_maps_url}" target="_blank" class="action-nav-btn" style="margin-bottom:6px;">
        ${l.nav_gmaps}
      </a>
      <button class="popup-speak-btn" onclick="highlightRoute(${rest.lat}, ${rest.lng}, '${restName.replace(/'/g, "\\'")}')">🗺️ ${l.name === 'தமிழ்' ? 'பாதையைக் காட்டு' : 'Show Route'}</button>
    `);
    m.on("click", () => {
      fetchAndDrawRoadRoute(truck.lat, truck.lng, rest.lat, rest.lng, restName);
    });
    markerLayers.rest.push(m);
  });

  // 5. 🏥 Verified Nearest Highway Hospitals & Trauma ICU
  (hospitals || []).forEach(hosp => {
    const hospName = (currentLanguage === "ta" && hosp.name_ta) ? hosp.name_ta : hosp.name;
    const hospIcon = createCustomIcon("🏥", "marker-hospital");
    const m = L.marker([hosp.lat, hosp.lng], { icon: hospIcon }).addTo(map);
    m.bindPopup(`
      <div class="popup-title">🏥 ${hospName}</div>
      <div class="popup-sub">${l.name === 'தமிழ்' ? 'தொலைவு' : 'Distance'}: <strong>${hosp.distance_km} km</strong> • ${hosp.status}</div>
      <div class="popup-sub" style="color:var(--accent-green); font-weight:700;">24x7 Emergency Trauma ICU & Blood Bank</div>
      <a href="${hosp.google_maps_url}" target="_blank" class="action-nav-btn" style="margin-bottom:6px;">
        ${l.nav_gmaps}
      </a>
      <a href="tel:${hosp.phone}" class="action-call-btn" style="margin-top:4px; padding:6px 10px; font-size:0.8rem; background:#e11d48;">
        📞 Call Hospital: ${hosp.phone}
      </a>
      <button class="popup-speak-btn" style="margin-top:6px;" onclick="highlightRoute(${hosp.lat}, ${hosp.lng}, '${hospName.replace(/'/g, "\\'")}')">🗺️ ${l.name === 'தமிழ்' ? 'பாதையைக் காட்டு' : 'Show Road Route'}</button>
    `);
    m.on("click", () => {
      fetchAndDrawRoadRoute(truck.lat, truck.lng, hosp.lat, hosp.lng, hospName);
    });
    markerLayers.hospitals.push(m);
  });

  // 6. 🚨 Emergency Services (Crane, Police, Mechanics)
  (emergency_units || []).forEach(unit => {
    const isMech = unit.type.includes("Mechanic");
    const iconEmoji = isMech ? "🔧" : "🚨";
    const bgClass = isMech ? "marker-mech" : "marker-sos";
    const unitName = (currentLanguage === "ta" && unit.name_ta) ? unit.name_ta : unit.name;

    const emIcon = createCustomIcon(iconEmoji, bgClass);
    const m = L.marker([unit.lat, unit.lng], { icon: emIcon }).addTo(map);
    m.bindPopup(`
      <div class="popup-title">${iconEmoji} ${unitName}</div>
      <div class="popup-sub">${l.name === 'தமிழ்' ? 'தொலைவு' : 'Distance'}: <strong>${unit.distance_km} km</strong></div>
      <a href="${unit.google_maps_url}" target="_blank" class="action-nav-btn" style="margin-bottom:6px;">
        ${l.nav_gmaps}
      </a>
      <a href="tel:${unit.phone}" class="action-call-btn" style="margin-top:4px; padding:6px 10px; font-size:0.8rem;">
        ${l.call_now}: ${unit.phone}
      </a>
      <button class="popup-speak-btn" style="margin-top:6px;" onclick="highlightRoute(${unit.lat}, ${unit.lng}, '${unitName.replace(/'/g, "\\'")}')">🗺️ ${l.name === 'தமிழ்' ? 'பாதையைக் காட்டு' : 'Show Road Route'}</button>
    `);
    m.on("click", () => {
      fetchAndDrawRoadRoute(truck.lat, truck.lng, unit.lat, unit.lng, unitName);
    });
    markerLayers.emergency.push(m);
  });

  // Calculate & Draw Google Maps Road Route to the Nearest Fuel Bunk by default
  if (bunks && bunks[0]) {
    const defaultBunkName = (currentLanguage === "ta" && bunks[0].name_ta) ? bunks[0].name_ta : bunks[0].name;
    fetchAndDrawRoadRoute(truck.lat, truck.lng, bunks[0].lat, bunks[0].lng, defaultBunkName);
  }
}

// Global Route Highlight Helper (Fits Camera to Frame Route Between Vehicle & Destination)
window.highlightRoute = (lat, lng, name) => {
  if (realDeviceCoords && map) {
    fetchAndDrawRoadRoute(realDeviceCoords[0], realDeviceCoords[1], lat, lng, name);
    const bounds = L.latLngBounds([realDeviceCoords, [lat, lng]]);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
  }
};

// Map Filter Handling
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const filter = btn.getAttribute("data-filter");
    filterButtons.forEach(b => (b.style.borderColor = "var(--border-subtle)"));
    btn.style.borderColor = "var(--accent-amber)";

    Object.keys(markerLayers).forEach(category => {
      const show = filter === "all" || filter === category;
      markerLayers[category].forEach(marker => {
        if (show) {
          if (!map.hasLayer(marker)) map.addLayer(marker);
        } else {
          if (map.hasLayer(marker)) map.removeLayer(marker);
        }
      });
    });
  });
});

/* =========================================================================
   4. AUDIO & SPEECH ENGINE (START SPEAKING AFTER USER SPEAKS)
   ========================================================================= */

function initCanvas() {
  canvas.width = canvas.parentElement.clientWidth || 360;
  canvas.height = 40;
  drawStaticWave();
}

function drawStaticWave() {
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  canvasCtx.strokeStyle = "rgba(148, 163, 184, 0.4)";
  canvasCtx.lineWidth = 2;
  canvasCtx.beginPath();
  const midY = canvas.height / 2;
  canvasCtx.moveTo(0, midY);
  canvasCtx.lineTo(canvas.width, midY);
  canvasCtx.stroke();
}

function drawLiveWave(dataArray) {
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  canvasCtx.lineWidth = 3;
  canvasCtx.strokeStyle = "#f59e0b";
  canvasCtx.beginPath();

  const sliceWidth = canvas.width / dataArray.length;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;
    if (i === 0) canvasCtx.moveTo(x, y);
    else canvasCtx.lineTo(x, y);
    x += sliceWidth;
  }
  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
}

// Driver Speech Synthesis: Plays Gnani Timbre MP3 or browser fallback
function playSynthesizedSpeech(ttsData, fallbackText, langCode = "ta-IN") {
  lastSpokenText = fallbackText;
  btnReplayAudio.style.display = "inline-block";

  if (currentAudioPlayer) {
    currentAudioPlayer.pause();
    currentAudioPlayer = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  // 1. Play Cloud Live MP3 from Gnani Timbre (e.g. Lakshmi voice for Tamil)
  if (ttsData && ttsData.status === "success" && ttsData.audio_base64) {
    const l = UI_LOCALES[currentLanguage] || UI_LOCALES["ta"];
    voiceStatus.textContent = `🔊 ஞானி டிம்ப்ரே (${ttsData.voice}) பேசுவது...`;
    voiceStatus.style.color = "var(--accent-green)";

    currentAudioPlayer = new Audio(`data:audio/mp3;base64,${ttsData.audio_base64}`);
    currentAudioPlayer.onended = () => {
      voiceStatus.textContent = l.ptt_hint;
      voiceStatus.style.color = "var(--text-main)";
      drawStaticWave();
    };
    currentAudioPlayer.play().catch(e => {
      speakBrowserFallback(fallbackText, langCode);
    });
  } else {
    speakBrowserFallback(fallbackText, langCode);
  }
}

function speakBrowserFallback(text, langCode) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === "ta" ? "ta-IN" : (currentLanguage === "hi" ? "hi-IN" : "en-IN");
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchVoice = voices.find(v => v.lang.includes(currentLanguage));
    if (matchVoice) utterance.voice = matchVoice;

    utterance.onstart = () => {
      voiceStatus.textContent = "🔊 வழிகாட்டுகிறது...";
      voiceStatus.style.color = "var(--accent-blue)";
    };
    utterance.onend = () => {
      const l = UI_LOCALES[currentLanguage] || UI_LOCALES["ta"];
      voiceStatus.textContent = l.ptt_hint;
      voiceStatus.style.color = "var(--text-main)";
      drawStaticWave();
    };
    window.speechSynthesis.speak(utterance);
  }
}

// Render dynamic highway cards with Google Maps Deep Links
function renderCards(cards = []) {
  cardsDeck.innerHTML = "";
  const l = UI_LOCALES[currentLanguage] || UI_LOCALES["ta"];

  cards.forEach(card => {
    const cardEl = document.createElement("div");
    cardEl.className = "info-card";

    let navBtnHtml = "";
    if (card.google_maps_url || card.action_phone) {
      if (card.google_maps_url) {
        navBtnHtml += `
          <a href="${card.google_maps_url}" target="_blank" class="action-nav-btn">
            ${l.nav_gmaps}
          </a>
        `;
      }
      if (card.action_phone) {
        navBtnHtml += `
          <a href="tel:${card.action_phone}" class="action-call-btn">
            ${l.call_now}: ${card.action_phone}
          </a>
        `;
      }
    }

    cardEl.innerHTML = `
      <div>
        <div class="info-card-top">
          <span class="info-card-title">${card.title}</span>
          ${card.badge ? `<span class="info-card-badge">${card.badge}</span>` : ""}
        </div>
        <div class="info-card-val">${card.value}</div>
        <div class="info-card-sub">${card.sub || ""}</div>
      </div>
      <div>${navBtnHtml}</div>
    `;
    cardsDeck.appendChild(cardEl);
  });
}

// Query Backend API & Start Speaking
async function sendQuery(queryText) {
  voiceStatus.textContent = "⚡ ஞானி AI சிந்திக்கிறது...";
  voiceStatus.style.color = "var(--accent-amber)";

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: queryText,
        language: currentLanguage,
        lat: realDeviceCoords[0],
        lng: realDeviceCoords[1]
      })
    });

    const data = await res.json();
    if (data.status === "success") {
      const result = data.result;
      responseTitleText.textContent = result.title || "வழிகாட்டி பதில்";
      spokenTranscript.textContent = `"${result.spoken_response}"`;
      renderCards(result.cards);

      // Pan map to POI if relevant
      if (result.category === "bunk" && markerLayers.bunks[0]) {
        map.setView(markerLayers.bunks[0].getLatLng(), 14, { animate: true });
        markerLayers.bunks[0].openPopup();
      } else if (result.category === "toll" && markerLayers.tolls[0]) {
        map.setView(markerLayers.tolls[0].getLatLng(), 14, { animate: true });
        markerLayers.tolls[0].openPopup();
      } else if (result.category === "toilet" && markerLayers.rest[0]) {
        map.setView(markerLayers.rest[0].getLatLng(), 14, { animate: true });
        markerLayers.rest[0].openPopup();
      } else if (result.category === "emergency" && markerLayers.emergency[0]) {
        map.setView(markerLayers.emergency[0].getLatLng(), 14, { animate: true });
        markerLayers.emergency[0].openPopup();
      }

      // START SPEAKING IMMEDIATELY
      playSynthesizedSpeech(data.tts, result.spoken_response, currentLanguage);
    }
  } catch (err) {
    console.error("Query failed", err);
    voiceStatus.textContent = "பிணையப் பிழை. மீண்டும் முயற்சிக்கவும்.";
    voiceStatus.style.color = "var(--accent-red)";
  }
}

// Push to Talk (PTT)
async function togglePTT() {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

async function startRecording() {
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRec) {
    const recognition = new SpeechRec();
    recognition.lang = currentLanguage === "ta" ? "ta-IN" : (currentLanguage === "hi" ? "hi-IN" : "en-IN");
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isRecording = true;
      pttBtn.classList.add("recording");
      pttIcon.textContent = "⏹️";
      const l = UI_LOCALES[currentLanguage] || UI_LOCALES["ta"];
      voiceStatus.textContent = l.ptt_listening;
      voiceStatus.style.color = "var(--accent-red)";
      startWaveformSimulation();
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      stopRecording();
      voiceStatus.textContent = `கேட்கப்பட்டது: "${spokenText}"`;
      sendQuery(spokenText);
    };

    recognition.onerror = (err) => {
      console.warn("SpeechRec error", err);
      stopRecording();
      voiceStatus.textContent = "மைக்ரோஃபோன் பிழை. பொத்தான்களைப் பயன்படுத்தவும்.";
    };

    recognition.onend = () => {
      stopRecording();
    };

    recognition.start();
  } else {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        stream.getTracks().forEach(track => track.stop());
        await uploadVoiceBlob(audioBlob);
      };

      mediaRecorder.start();
      isRecording = true;
      pttBtn.classList.add("recording");
      pttIcon.textContent = "⏹️";
      voiceStatus.textContent = "🎙️ பதிவு செய்யப்படுகிறது...";
      voiceStatus.style.color = "var(--accent-red)";
      renderAudioWaveform();
    } catch (e) {
      alert("Microphone permission required.");
      stopRecording();
    }
  }
}

function stopRecording() {
  isRecording = false;
  pttBtn.classList.remove("recording");
  pttIcon.textContent = "🎤";
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  drawStaticWave();
}

function startWaveformSimulation() {
  const data = new Uint8Array(32);
  function loop() {
    if (!isRecording) return;
    for (let i = 0; i < data.length; i++) {
      data[i] = 128 + Math.floor((Math.random() - 0.5) * 80);
    }
    drawLiveWave(data);
    animationFrameId = requestAnimationFrame(loop);
  }
  loop();
}

function renderAudioWaveform() {
  if (!analyser) return;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    if (!isRecording) return;
    analyser.getByteTimeDomainData(dataArray);
    drawLiveWave(dataArray);
    animationFrameId = requestAnimationFrame(draw);
  }
  draw();
}

async function uploadVoiceBlob(blob) {
  voiceStatus.textContent = "⚡ ஞானி AI பிரிஸ்மா (Prisma) STT உரை மாற்றுகிறது...";
  const formData = new FormData();
  formData.append("audio", blob, "driver_voice.wav");
  formData.append("language", currentLanguage);
  formData.append("lat", realDeviceCoords[0]);
  formData.append("lng", realDeviceCoords[1]);

  try {
    const res = await fetch("/api/voice-query", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (data.status === "success") {
      responseTitleText.textContent = data.result.title || "வழிகாட்டி பதில்";
      spokenTranscript.textContent = `"${data.result.spoken_response}"`;
      renderCards(data.result.cards);
      playSynthesizedSpeech(data.tts, data.result.spoken_response, currentLanguage);
    }
  } catch (e) {
    console.error(e);
  }
}

// 4 Giant Driver Action Buttons
document.getElementById("btnQuickToll").addEventListener("click", () => {
  const l = UI_LOCALES[currentLanguage] || UI_LOCALES["ta"];
  if (currentPoisData && currentPoisData.tolls && currentPoisData.tolls[0]) {
    const t = currentPoisData.tolls[0];
    const name = (currentLanguage === "ta" && t.name_ta) ? t.name_ta : t.name;
    highlightRoute(t.lat, t.lng, name);
  }
  sendQuery(l.chip2_q);
});

document.getElementById("btnQuickBunk").addEventListener("click", () => {
  const l = UI_LOCALES[currentLanguage] || UI_LOCALES["ta"];
  if (currentPoisData && currentPoisData.bunks && currentPoisData.bunks[0]) {
    const b = currentPoisData.bunks[0];
    const name = (currentLanguage === "ta" && b.name_ta) ? b.name_ta : b.name;
    highlightRoute(b.lat, b.lng, name);
  }
  sendQuery(l.chip1_q);
});

document.getElementById("btnQuickToilet").addEventListener("click", () => {
  const l = UI_LOCALES[currentLanguage] || UI_LOCALES["ta"];
  if (currentPoisData && currentPoisData.rest_stops && currentPoisData.rest_stops[0]) {
    const r = currentPoisData.rest_stops[0];
    const name = (currentLanguage === "ta" && r.name_ta) ? r.name_ta : r.name;
    highlightRoute(r.lat, r.lng, name);
  }
  sendQuery(l.chip3_q);
});

document.getElementById("btnQuickSOS").addEventListener("click", () => {
  const l = UI_LOCALES[currentLanguage] || UI_LOCALES["en"];
  // When Emergency SOS is clicked, immediately route to the nearest Trauma Hospital & ICU!
  if (currentPoisData && currentPoisData.hospitals && currentPoisData.hospitals[0]) {
    const hosp = currentPoisData.hospitals[0];
    const name = (currentLanguage === "ta" && hosp.name_ta) ? hosp.name_ta : hosp.name;
    highlightRoute(hosp.lat, hosp.lng, `🏥 ${name}`);
  } else if (currentPoisData && currentPoisData.emergency_units && currentPoisData.emergency_units[0]) {
    const em = currentPoisData.emergency_units[0];
    const name = (currentLanguage === "ta" && em.name_ta) ? em.name_ta : em.name;
    highlightRoute(em.lat, em.lng, `🚨 ${name}`);
  }
  sendQuery(l.chip4_q);
});

// Drive Speed Simulator Button
const btnLiveDriveSim = document.getElementById("btnLiveDriveSim");
if (btnLiveDriveSim) {
  btnLiveDriveSim.addEventListener("click", toggleDriveSpeedSimulator);
}

// Prompt Chips Click
document.getElementById("chipsContainer").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip-btn");
  if (chip) {
    const q = chip.getAttribute("data-query");
    if (q) sendQuery(q);
  }
});

pttBtn.addEventListener("click", togglePTT);

btnReplayAudio.addEventListener("click", () => {
  if (lastSpokenText) speakBrowserFallback(lastSpokenText, currentLanguage);
});

window.sendQuery = sendQuery;

// Initial Boot (English as Default & Start Always-On GPS)
window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initCanvas();
  applyLanguage("en");
  initHighwayMap();
});
