import os
import requests
from dotenv import load_dotenv

load_dotenv()
# Make sure this matches the key name in your .env file
API_KEY = os.getenv("OPENWEATHER_API_KEY")

def get_live_rainfall(lat, lng):
    # --- DEMO MODE FALLBACK ---
    # If key is missing, empty, or placeholder, return realistic fake data
    if not API_KEY or len(API_KEY) < 10 or "your_api_key" in API_KEY:
        print("⚠️ Weather API Key missing. Running in DEMO MODE.")
        return {
            "temp": 27.5,
            "humidity": 65,
            "description": "partly cloudy (demo)",
            "rainfall_mm": 1050.0
        }

    url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={API_KEY}&units=metric"
    
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        
        # Check if the API returned an error (like 401 Unauthorized)
        if response.status_code != 200:
            print(f"❌ Weather API Error {response.status_code}: {data.get('message')}")
            return {
                "temp": 24.0, 
                "humidity": 50, 
                "description": "API Error - Using default", 
                "rainfall_mm": 1200.0
            }

        # Calculate simulated annual rainfall based on clouds/humidity
        humidity = data.get("main", {}).get("humidity", 50)
        clouds = data.get("clouds", {}).get("all", 0)
        estimated_annual = 800 + (clouds * 10) + (humidity * 5)
        
        return {
            "temp": data.get("main", {}).get("temp"),
            "humidity": humidity,
            "description": data.get("weather", [{}])[0].get("description", "clear sky"),
            "rainfall_mm": round(estimated_annual, 2)
        }
    except Exception as e:
        print(f"❌ Connection Error to Weather API: {e}")
        return None