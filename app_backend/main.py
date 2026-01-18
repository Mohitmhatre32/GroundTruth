import os, threading, time
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv

from config import init_firebase
from features.monitoring.router import router as monitoring_router
from features.forecasting.router import router as forecasting_router
from features.analysis.router import router as analysis_router
from features.risk.router import router as risk_router
from features.policy.router import router as policy_router
from features.research.router import router as research_router
from features.mobile_api.router import router as mobile_router
from features.mobile_notifications.router import router as mobile_notifications_router
from features.reporting.router import router as reporting_router
from features.mobile_notifications.fcm import send_critical_notification

# Import both simulator functions
from features.monitoring.simulator_web import run_web_simulation
from features.monitoring.simulator_mobile import run_mobile_simulation

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = FastAPI(title="GroundTruth API")

# --- INTERACTIVE SIMULATOR SELECTION ---
print("\n" + "="*30)
print("GROUNDTRUTH STARTUP CONTROL")
print("="*30)
print("1. Run Web Simulator (Dashboard Only)")
print("2. Run Mobile Simulator (Dashboard + Phone Alerts)")
sim_choice = input("Enter choice (1 or 2): ")
print("="*30 + "\n")

@app.on_event("startup")
async def startup_event():
    init_firebase()
    
    # Choose which simulator to run based on input
    target_func = run_web_simulation if sim_choice == "1" else run_mobile_simulation
    
    # Run in background thread
    sim_thread = threading.Thread(target=target_func, daemon=True)
    sim_thread.start()
    print(f"✅ Background Simulator {'Web' if sim_choice=='1' else 'Mobile'} started.")

# Static and Template Setup
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Register all Routers
app.include_router(monitoring_router, prefix="/api", tags=["Monitoring"])
app.include_router(forecasting_router, prefix="/api", tags=["Forecasting"])
app.include_router(analysis_router, prefix="/api", tags=["Analysis"])
app.include_router(risk_router, prefix="/api", tags=["Risk"])
app.include_router(policy_router, prefix="/api", tags=["Policy"])
app.include_router(research_router, prefix="/api", tags=["Research"])
app.include_router(mobile_router, prefix="/api/mobile", tags=["Mobile API"])
app.include_router(mobile_notifications_router, prefix="/api/notify", tags=["Mobile Notifications"])
app.include_router(reporting_router, prefix="/api", tags=["Reporting"])

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
        "FIREBASE_API_KEY": os.getenv("FIREBASE_API_KEY"),
        "FIREBASE_AUTH_DOMAIN": os.getenv("FIREBASE_AUTH_DOMAIN"),
        "FIREBASE_PROJECT_ID": os.getenv("FIREBASE_PROJECT_ID"),
        "FIREBASE_STORAGE_BUCKET": os.getenv("FIREBASE_STORAGE_BUCKET"),
        "FIREBASE_MESSAGING_SENDER_ID": os.getenv("FIREBASE_MESSAGING_SENDER_ID"),
        "FIREBASE_APP_ID": os.getenv("FIREBASE_APP_ID"),
    })