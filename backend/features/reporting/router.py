from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from .service import *

router = APIRouter()

class CustomReq(BaseModel):
    station_id: str
    start: str
    end: str

# 1. Overall Downloads
@router.get("/export/overall-csv")
def export_all_csv():
    return FileResponse(get_overall_csv(), filename="GroundTruth_Full_History.csv")

@router.get("/export/overall-pdf")
def export_all_pdf():
    return FileResponse(generate_overall_pdf(), filename="Executive_Summary_Report.pdf")

# 2. Customized Downloads
@router.post("/export/custom-csv")
def export_user_csv(data: CustomReq):
    path = get_custom_csv(data.station_id, data.start, data.end)
    return FileResponse(path, filename=f"Data_{data.station_id}.csv")

@router.post("/export/custom-pdf")
def export_user_pdf(data: CustomReq):
    path = generate_custom_pdf(data.station_id, data.start, data.end)
    return FileResponse(path, filename=f"Analysis_{data.station_id}.pdf")