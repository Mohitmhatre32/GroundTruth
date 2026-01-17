import pandas as pd
import os
from fastapi import APIRouter, HTTPException

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(BASE_DIR, "training_data.csv")

@router.get("/history")
def get_historical_data():
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=404, detail="Data file not found. Run generate_training_data.py first.")
    
    try:
        df = pd.read_csv(CSV_PATH)
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))