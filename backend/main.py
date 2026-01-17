import os
from pathlib import Path # 👈 Added for robust paths
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv

from config import init_firebase
from features.monitoring.router import router as monitoring_router
from features.forecasting.router import router as forecasting_router
from features.analysis.router import router as analysis_router

# 1. Load Environment Variables
# Fix: Explicitly look for .env in the same folder as this file
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
print("--- DEBUGGING KEYS ---")
print(f"Project ID loaded: '{os.getenv('FIREBASE_PROJECT_ID')}'")
print(f"API Key loaded: '{os.getenv('FIREBASE_API_KEY')}'")
print("----------------------")

app = FastAPI(title="GroundTruth API")

# 2. Setup Templates Directory (Robust Fix)
# This forces Python to look inside 'backend/templates' specifically
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# 3. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_firebase()

# 4. Register Routers
app.include_router(monitoring_router, prefix="/api", tags=["Monitoring"])
app.include_router(forecasting_router, prefix="/api", tags=["Forecasting"])
app.include_router(analysis_router, prefix="/api", tags=["Analysis"])

# 5. Root Endpoint
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    # Check if keys are loaded
    if not os.getenv("FIREBASE_PROJECT_ID"):
        print("⚠️ WARNING: .env variables not found! Check your .env file.")

    return templates.TemplateResponse("index.html", {
        "request": request,
        "FIREBASE_API_KEY": os.getenv("FIREBASE_API_KEY"),
        "FIREBASE_AUTH_DOMAIN": os.getenv("FIREBASE_AUTH_DOMAIN"),
        "FIREBASE_PROJECT_ID": os.getenv("FIREBASE_PROJECT_ID"),
        "FIREBASE_STORAGE_BUCKET": os.getenv("FIREBASE_STORAGE_BUCKET"),
        "FIREBASE_MESSAGING_SENDER_ID": os.getenv("FIREBASE_MESSAGING_SENDER_ID"),
        "FIREBASE_APP_ID": os.getenv("FIREBASE_APP_ID"),
    })