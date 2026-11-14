"""
Co-Traveler Conversational Agent
Multi-lingual support with Tamil (தமிழ்) as primary default, plus Hindi, Hinglish, and English.
Generates 100% localized driver-friendly speech and synchronized UI cards for:
- ⛽ Fuel Bunks (Petrol/Diesel)
- 🛣️ Toll Plazas
- 🚻 Clean Restrooms & Food
- 🚨 Emergency SOS (1033)
- 🔧 Mechanics & Puncture
"""

from services.highway_db import get_next_bunk, get_next_toll, get_next_rest_stop, get_emergency_services

RESPONSES = {
    "ta": {
        "bunk_spoken": "மிக அருகில் உள்ள பெட்ரோல் & டீசல் பங்க் {dist} கிலோமீட்டர் தூரத்தில் {name} ஆகும். அதிவேக டீசல் விலை {diesel}. இலவச காற்று மற்றும் சுத்தமான குடிநீர் வசதி உள்ளது.",
        "bunk_title": "⛽ அருகிலுள்ள பெட்ரோல் & டீசல் பங்க்",
        "bunk_card_fuel": "எரிபொருள் விலை",
        "bunk_card_service": "24 மணி நேர சேவை",
        
        "toll_spoken": "அடுத்த டோல் பிளாசா {dist} கிலோமீட்டர் தூரத்தில் {name} பகுதியில் உள்ளது. லாரி கட்டணம் {truck_fee}, கார் கட்டணம் {car_fee}. ஃபாஸ்டாக் லேன் 4 அல்லது 5 ஐ பயன்படுத்தவும்.",
        "toll_title": "🛣️ அடுத்த டோல் பிளாசா: {name}",
        "toll_card_dist": "தொலைவு",
        "toll_card_fee": "ஃபாஸ்டாக் கட்டணம்",
        "toll_card_wait": "காத்திருப்பு நேரம்",
        "toll_wait_val": "குறைந்த காத்திருப்பு (2-3 நிமிடம்)",
        
        "toilet_spoken": "அருகிலுள்ள சுத்தமான கழிப்பறை மற்றும் ஓய்வு அறை {dist} கிலோமீட்டர் தூரத்தில் {name} பகுதியில் உள்ளது. இங்கு சுத்தமான குளியலறை, சுடச்சுட உணவு மற்றும் பாதுகாப்பான பார்க்கிங் உள்ளது.",
        "toilet_title": "🚻 சுத்தமான கழிப்பறை & ஓய்விடம்",
        "toilet_card_amenities": "சுத்தமான வசதிகள்",
        "toilet_card_safety": "பாதுகாப்பான பார்க்கிங்",
        
        "emergency_spoken": "அவசர உதவி தயார்! தேசிய நெடுஞ்சாலை இலவச உதவி எண் 1033. விபத்து மற்றும் அவசர உதவிக்கு 112. கனரக கிரேன் {crane_dist} கி.மீ தூரத்திலும், மருத்துவமனை {trauma_dist} கி.மீ தூரத்திலும் உள்ளது. உடனே அழைக்கவா?",
        "emergency_title": "🚨 அவசர உதவி & பாதுகாப்பு (SOS)",
        "emergency_card_helpline": "தேசிய நெடுஞ்சாலை உதவி எண்",
        "emergency_card_crane": "கனரக கிரேன் சேவை (40T)",
        "emergency_card_hospital": "அவசர சிகிச்சை மருத்துவமனை",
        
        "mechanic_spoken": "அருகிலுள்ள லாரி மெக்கானிக் மற்றும் டயர் பஞ்சர் கடை {dist} கிலோமீட்டர் தூரத்தில் {name} இடத்தில் உள்ளது. உடனடி பழுதுபார்ப்பு சேவை கிடைக்கும்.",
        "mechanic_title": "🔧 லாரி மெக்கானிக் & பஞ்சர் கடை",
        "mechanic_card_service": "24 மணி நேர ஆன்-கால் மெக்கானிக்",
        
        "fatigue_spoken": "தூக்கம் அல்லது சோர்வு வந்தால் தயவுசெய்து வாகனத்தை ஓரமாக நிறுத்துங்கள். {dist} கி.மீ தூரத்தில் பாதுகாப்பான பார்க்கிங் மற்றும் சூடான டீ கிடைக்கும் இடம் உள்ளது. சிறிது நேரம் ஓய்வெடுக்கவும்.",
        "fatigue_title": "😴 டிரைவர் விழிப்புணர்வு எச்சரிக்கை",
        "fatigue_card_stop": "பாதுகாப்பான ஓய்வு தளம்",
        "fatigue_card_vigilance": "விழிப்புணர்வு முறை இயக்கப்பட்டது",
        
        "general_spoken": "வணக்கம்! கோ-டிராவலர் தயார். அடுத்த பெட்ரோல் பங்க் {bunk_dist} கி.மீ தூரத்திலும், டோல் {toll_dist} கி.மீ தூரத்திலும் உள்ளது. எதைப் பற்றியும் பேசிக் கேளுங்கள்.",
        "general_title": "🛣️ நெடுஞ்சாலை வழிகாட்டி ஆன்லைன்"
    },
    "en": {
        "bunk_spoken": "The nearest fuel bunk is {name}, {dist} kilometers ahead. Diesel is {diesel}, petrol is {petrol}, with free air and clean washrooms.",
        "bunk_title": "⛽ Nearest Fuel Bunk: {name}",
        "bunk_card_fuel": "Fuel Rates",
        "bunk_card_service": "24x7 Services",
        
        "toll_spoken": "Next toll is {name} in {dist} kilometers. Truck FASTag fee is {truck_fee}, car fee is {car_fee}. Average wait is 2 to 3 minutes.",
        "toll_title": "🛣️ Upcoming Toll: {name}",
        "toll_card_dist": "Distance",
        "toll_card_fee": "FASTag Rates",
        "toll_card_wait": "Traffic Status",
        "toll_wait_val": "Normal wait (2-3 mins)",
        
        "toilet_spoken": "The nearest certified clean restroom is {dist} kilometers ahead at {name}. It has clean western toilets, bathing cubicles, and safe truck parking.",
        "toilet_title": "🚻 Clean Rest Stop: {name}",
        "toilet_card_amenities": "Verified Amenities",
        "toilet_card_safety": "Safety & Parking",
        
        "emergency_spoken": "Emergency assistance is active. National Highway Helpline is 1033. Heavy crane is {crane_dist} km away, trauma hospital is {trauma_dist} km away. Tap to call immediately.",
        "emergency_title": "🚨 Emergency SOS Active",
        "emergency_card_helpline": "NHAI Helpline",
        "emergency_card_crane": "Heavy Crane Service",
        "emergency_card_hospital": "Trauma Hospital",
        
        "mechanic_spoken": "Nearest truck mechanic is {name}, {dist} kilometers ahead. Tyre puncture, air, and axle repair available 24x7.",
        "mechanic_title": "🔧 Nearest Mechanic: {name}",
        "mechanic_card_service": "24x7 Roadside Repair",
        
        "fatigue_spoken": "If you are feeling drowsy, please pull over safely. There is a verified rest stop with tea and showers in {dist} km. Please take a 15-minute break.",
        "fatigue_title": "😴 Driver Alertness Warning",
        "fatigue_card_stop": "Safe Rest Area",
        "fatigue_card_vigilance": "Vigilance Mode ON",
        
        "general_spoken": "Welcome! Co-Traveler is active. Next fuel bunk is in {bunk_dist} km, toll is in {toll_dist} km. Ask anything by voice.",
        "general_title": "🛣️ Highway Status Active"
    },
    "hi": {
        "bunk_spoken": "Sabse paas petrol aur diesel pump {dist} kilometer aage {name} hai. Diesel rate {diesel} hai. Yahan clean air aur washroom available hai.",
        "bunk_title": "⛽ नजदीकी पेट्रोल व डीजल पंप",
        "bunk_card_fuel": "ईंधन दरें",
        "bunk_card_service": "24x7 सेवाएं",
        
        "toll_spoken": "Aage {dist} kilometer par {name} hai. Truck ka FASTag fee {truck_fee} aur car ka {car_fee} hai. Kripya lane 4 ya 5 mein rahein.",
        "toll_title": "🛣️ अगला टोल प्लाजा",
        "toll_card_dist": "दूरी",
        "toll_card_fee": "फास्टैग दरें",
        "toll_card_wait": "प्रतीक्षा समय",
        "toll_wait_val": "2-3 मिनट प्रतीक्षा",
        
        "toilet_spoken": "Sabse paas certified clean restroom {dist} kilometer aage {name} par hai. Yahan clean toilets, nahane ki jagah aur safe parking hai.",
        "toilet_title": "🚻 स्वच्छ शौचालय एवं ढाबा",
        "toilet_card_amenities": "सत्यापित सुविधाएं",
        "toilet_card_safety": "सुरक्षित पार्किंग",
        
        "emergency_spoken": "Emergency helpline 1033 taiyaar hai. Heavy crane {crane_dist} km aur trauma hospital {trauma_dist} km door hai. Kya direct call karein?",
        "emergency_title": "🚨 आपातकालीन सहायता (SOS)",
        "emergency_card_helpline": "हाईवे हेल्पलाइन",
        "emergency_card_crane": "हैवी क्रेन टोइंग",
        "emergency_card_hospital": "अस्पताल",
        
        "mechanic_spoken": "Nearest mechanic {name} {dist} kilometer par hai. Heavy tyre puncture aur axle repair on call available hai.",
        "mechanic_title": "🔧 ट्रक मैकेनिक",
        "mechanic_card_service": "सड़क पर मरम्मत सेवा",
        
        "fatigue_spoken": "Ustaad ji, agar neend aa rahi hai toh gaadi side lagayein. {dist} km aage kadak chai aur safe parking available hai.",
        "fatigue_title": "😴 चालक सतर्कता चेतावनी",
        "fatigue_card_stop": "सुरक्षित विश्राम स्थल",
        "fatigue_card_vigilance": "सतर्कता मोड चालू",
        
        "general_spoken": "नमस्ते! को-ट्रैवलर ऑनलाइन है। अगला पेट्रोल पंप {bunk_dist} किमी और टोल {toll_dist} किमी पर है। बोलकर पूछें।",
        "general_title": "🛣️ हाईवे सह-चालक ऑनलाइन"
    }
}

def process_driver_query(query_text: str, language: str = "ta", user_lat: float = None, user_lng: float = None) -> dict:
    text = (query_text or "").lower()
    loc = RESPONSES.get(language, RESPONSES["ta"] if language == "ta" else RESPONSES["en"])

    bunk = get_next_bunk(user_lat, user_lng)
    toll = get_next_toll(user_lat, user_lng)
    rest = get_next_rest_stop(user_lat, user_lng)
    emergencies = get_emergency_services(user_lat, user_lng)
    crane = emergencies["nearby_units"][0]
    mechanic = emergencies["nearby_units"][1]
    trauma = emergencies["nearby_units"][2]

    # Use Tamil names if language is Tamil
    bunk_name = bunk.get("name_ta") if language == "ta" else bunk["name"]
    toll_name = toll.get("name_ta") if language == "ta" else toll["name"]
    rest_name = rest.get("name_ta") if language == "ta" else rest["name"]
    crane_name = crane.get("name_ta") if language == "ta" else crane["name"]
    mech_name = mechanic.get("name_ta") if language == "ta" else mechanic["name"]
    trauma_name = trauma.get("name_ta") if language == "ta" else trauma["name"]

    # 1. FUEL BUNK / PETROL / DIESEL (English, Tamil, Hindi keywords)
    if any(k in text for k in ["bunk", "petrol", "diesel", "fuel", "gas", "பங்க்", "பெட்ரோல்", "டீசல்", "எண்ணெய்", "பம்பு"]):
        spoken = loc["bunk_spoken"].format(
            dist=bunk["distance_km"],
            name=bunk_name,
            diesel=bunk["diesel_price"],
            petrol=bunk["petrol_price"]
        )
        return {
            "category": "bunk",
            "spoken_response": spoken,
            "title": loc["bunk_title"].format(name=bunk_name),
            "cards": [
                {
                    "title": bunk_name,
                    "value": f"{bunk['distance_km']} km",
                    "sub": "24x7 HSD Diesel • Air & Water",
                    "google_maps_url": bunk["google_maps_url"],
                    "badge": "24x7 Open"
                },
                {
                    "title": loc["bunk_card_fuel"],
                    "value": f"Diesel: {bunk['diesel_price']}",
                    "sub": f"Petrol: {bunk['petrol_price']}",
                    "badge": "Live Rate"
                },
                {
                    "title": loc["bunk_card_service"],
                    "value": "AdBlue DEF & Free Nitrogen",
                    "sub": "Clean rest bays for trucks",
                    "action_phone": bunk.get("phone"),
                    "badge": "Verified"
                }
            ]
        }

    # 2. EMERGENCY / SOS / CRANE / POLICE / HOSPITAL
    elif any(k in text for k in ["emergency", "sos", "police", "ambulance", "accident", "hospital", "madad", "help", "crane", "towing", "அவசரம்", "உதவி", "கிரேன்", "மருத்துவமனை", "போலீஸ்", "விபத்து"]):
        spoken = loc["emergency_spoken"].format(crane_dist=crane["distance_km"], trauma_dist=trauma["distance_km"])
        return {
            "category": "emergency",
            "spoken_response": spoken,
            "title": loc["emergency_title"],
            "cards": [
                {
                    "title": loc["emergency_card_helpline"],
                    "value": "1033",
                    "sub": "Free Ambulance & Crane (24x7)",
                    "action_phone": "1033",
                    "badge": "National 24x7"
                },
                {
                    "title": crane_name,
                    "value": f"{crane['distance_km']} km",
                    "sub": f"40T Heavy Towing Crane",
                    "action_phone": crane["phone"],
                    "google_maps_url": crane["google_maps_url"],
                    "badge": "Crane SOS"
                },
                {
                    "title": trauma_name,
                    "value": f"{trauma['distance_km']} km",
                    "sub": f"ICU & Emergency Trauma Center",
                    "action_phone": trauma["phone"],
                    "google_maps_url": trauma["google_maps_url"],
                    "badge": "Hospital"
                }
            ]
        }

    # 3. TOLLS / FASTAG
    elif any(k in text for k in ["toll", "tax", "fastag", "naka", "rate", "fee", "டோல்", "கட்டணம்", "சுங்கம்", "பாஸ்டாக்"]):
        spoken = loc["toll_spoken"].format(
            dist=toll["distance_km"],
            name=toll_name,
            truck_fee=toll["commercial_truck_fee"],
            car_fee=toll["car_fee"]
        )
        return {
            "category": "toll",
            "spoken_response": spoken,
            "title": loc["toll_title"].format(name=toll_name),
            "cards": [
                {
                    "title": loc["toll_card_dist"],
                    "value": f"{toll['distance_km']} km",
                    "sub": "National Highway Toll Plaza",
                    "google_maps_url": toll["google_maps_url"],
                    "badge": "FASTag"
                },
                {
                    "title": loc["toll_card_fee"],
                    "value": f"Truck: {toll['commercial_truck_fee']}",
                    "sub": f"Car: {toll['car_fee']} • 16 Lanes",
                    "badge": "Auto-Deduct"
                },
                {
                    "title": loc["toll_card_wait"],
                    "value": loc["toll_wait_val"],
                    "sub": toll.get("alternate_route_ta" if language == "ta" else "alternate_route"),
                    "badge": "Live Traffic"
                }
            ]
        }

    # 4. TOILETS / REST STOPS
    elif any(k in text for k in ["toilet", "bathroom", "washroom", "rest", "dhaba", "food", "khana", "shower", "கழிப்பறை", "பாத்ரூம்", "ஓய்வு", "தபா", "சாப்பாடு", "குளியல்"]):
        spoken = loc["toilet_spoken"].format(
            dist=rest["distance_km"],
            name=rest_name
        )
        return {
            "category": "toilet",
            "spoken_response": spoken,
            "title": loc["toilet_title"].format(name=rest_name),
            "cards": [
                {
                    "title": "Distance",
                    "value": f"{rest['distance_km']} km",
                    "sub": "National Highway Rest Hub",
                    "google_maps_url": rest["google_maps_url"],
                    "badge": "Next Exit"
                },
                {
                    "title": loc["toilet_card_amenities"],
                    "value": "Clean Washrooms & Showers",
                    "sub": " • ".join(rest.get("facilities_ta" if language == "ta" else "facilities")),
                    "badge": rest.get("cleanliness_certified_ta" if language == "ta" else "cleanliness_certified")
                },
                {
                    "title": loc["toilet_card_safety"],
                    "value": "24x7 Open • 4.7/5 ⭐",
                    "sub": "Safe dedicated truck bays with CCTV",
                    "action_phone": rest["contact"],
                    "badge": "Driver Friendly"
                }
            ]
        }

    # 5. MECHANIC / TYRE
    elif any(k in text for k in ["mechanic", "puncture", "tyre", "axle", "breakdown", "மெக்கானிக்", "பஞ்சர்", "டயர்", "ரிப்பேர்"]):
        spoken = loc["mechanic_spoken"].format(
            dist=mechanic["distance_km"],
            name=mech_name
        )
        return {
            "category": "mechanic",
            "spoken_response": spoken,
            "title": loc["mechanic_title"].format(name=mech_name),
            "cards": [
                {
                    "title": "Distance",
                    "value": f"{mechanic['distance_km']} km",
                    "sub": "On-Call Highway Van",
                    "google_maps_url": mechanic["google_maps_url"],
                    "badge": "Roadside"
                },
                {
                    "title": loc["mechanic_card_service"],
                    "value": "Heavy Truck Tyres & Axles",
                    "sub": "24x7 Mobile Workshop",
                    "action_phone": mechanic["phone"],
                    "badge": "On Call"
                }
            ]
        }

    # 6. SLEEPY / TIRED
    elif any(k in text for k in ["sleepy", "neend", "tired", "drowsy", "so", "தூக்கம்", "சோர்வு", "கண்"]):
        spoken = loc["fatigue_spoken"].format(dist=rest["distance_km"])
        return {
            "category": "fatigue",
            "spoken_response": spoken,
            "title": loc["fatigue_title"],
            "cards": [
                {
                    "title": loc["fatigue_card_stop"],
                    "value": f"{rest_name} ({rest['distance_km']} km)",
                    "sub": "Hot Tea • Bathing • Safe Parking",
                    "google_maps_url": rest["google_maps_url"],
                    "badge": "Recommended"
                },
                {
                    "title": loc["fatigue_card_vigilance"],
                    "value": "Voice Alert ON",
                    "sub": "Co-Traveler checks your alertness periodically",
                    "badge": "Safety Shield"
                }
            ]
        }

    # DEFAULT BRIEFING
    else:
        spoken = loc["general_spoken"].format(
            bunk_dist=bunk["distance_km"],
            toll_dist=toll["distance_km"]
        )
        return {
            "category": "general",
            "spoken_response": spoken,
            "title": loc["general_title"],
            "cards": [
                {
                    "title": bunk_name,
                    "value": f"{bunk['distance_km']} km",
                    "sub": f"Diesel: {bunk['diesel_price']} • HSD",
                    "google_maps_url": bunk["google_maps_url"],
                    "badge": "Fuel Bunk"
                },
                {
                    "title": toll_name,
                    "value": f"{toll['distance_km']} km",
                    "sub": f"Truck: {toll['commercial_truck_fee']}",
                    "google_maps_url": toll["google_maps_url"],
                    "badge": "Upcoming Toll"
                },
                {
                    "title": rest_name,
                    "value": f"{rest['distance_km']} km",
                    "sub": "Certified Toilets & Bathing",
                    "google_maps_url": rest["google_maps_url"],
                    "badge": "Clean Rest Stop"
                }
            ]
        }
