import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from dotenv import load_dotenv

from config import init_firebase
# Import Feature Routers
from features.monitoring.router import router as monitoring_router
from features.forecasting.router import router as forecasting_router
from features.analysis.router import router as analysis_router
from features.risk.router import router as risk_router
from features.policy.router import router as policy_router
from features.research.router import router as research_router
from features.reporting.router import router as reporting_router
from features.alerts.router import router as alerts_router

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

app = FastAPI(title="GroundTruth Web Backend")

# Setup Folders
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

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
    print(":rocket: Web API Server is Ready.")

# Register All Routers
app.include_router(monitoring_router, prefix="/api", tags=["Monitoring"])
app.include_router(forecasting_router, prefix="/api", tags=["Forecasting"])
app.include_router(analysis_router, prefix="/api", tags=["Analysis"])
app.include_router(risk_router, prefix="/api", tags=["Risk"])
app.include_router(policy_router, prefix="/api", tags=["Policy"])
app.include_router(research_router, prefix="/api", tags=["Research"])
app.include_router(reporting_router, prefix="/api", tags=["Reporting"])
app.include_router(alerts_router, prefix="/api", tags=["Alerts"])

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