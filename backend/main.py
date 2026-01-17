import os
import threading  # 👈 New Import
import time       # 👈 New Import
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv

from config import init_firebase
# Import Routers
from features.monitoring.router import router as monitoring_router
from features.forecasting.router import router as forecasting_router
from features.analysis.router import router as analysis_router
from features.risk.router import router as risk_router
from features.policy.router import router as policy_router
from features.research.router import router as research_router
from features.mobile_api.router import router as mobile_router
from features.reporting.router import router as reporting_router
from features.mobile_notifications.router import router as mobile_notifications_router

# Import the Simulator Function
from features.monitoring.simulator import main # 👈 Import the simulator logic

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = FastAPI(title="GroundTruth API")

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- THE AUTOMATION MAGIC HAPPENS HERE ---
@app.on_event("startup")
async def startup_event():
    # 1. Initialize Database
    init_firebase()
    
    # 2. Define a wrapper to delay the simulator slightly
    #    (So the server has 2 seconds to start up before we hit the API)
    def start_background_simulation():
        time.sleep(3) 
        try:
            main()
        except Exception as e:
            print(f"❌ Simulator crashed: {e}")

    # 3. Start Simulator in a Background Thread
    #    daemon=True means this thread will die automatically when you stop the server
    sim_thread = threading.Thread(target=start_background_simulation, daemon=True)
    sim_thread.start()
    
    print("✅ Background Simulation Thread Started automatically.")

# Register Routers
app.include_router(monitoring_router, prefix="/api", tags=["Monitoring"])
app.include_router(forecasting_router, prefix="/api", tags=["Forecasting"])
app.include_router(analysis_router, prefix="/api", tags=["Analysis"])
app.include_router(risk_router, prefix="/api", tags=["Risk"])
app.include_router(policy_router, prefix="/api", tags=["Policy"])
app.include_router(research_router, prefix="/api", tags=["Research"])
app.include_router(mobile_router, prefix="/api/mobile", tags=["Mobile App"])
app.include_router(reporting_router, prefix="/api", tags=["Reporting"])
app.include_router(mobile_notifications_router, prefix="/api/mobile", tags=["Mobile Notifications"])

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