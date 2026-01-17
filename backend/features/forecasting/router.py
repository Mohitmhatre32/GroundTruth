import pandas as pd
import os
from fastapi import APIRouter, HTTPException

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(BASE_DIR, "training_data.csv")

@router.get("/history")
def get_historical_data():
    """
    Returns aggregated historical data for the main dashboard trend line.
    Adapts to the new CSV format (date, station_id, water_level).
    """
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=404, detail="Data not found.")
    
    try:
        df = pd.read_csv(CSV_PATH)
        
        # 1. Standardize Column Names
        if 'date' in df.columns and 'water_level' in df.columns:
            # Convert date to datetime objects
            df['date'] = pd.to_datetime(df['date'])
            
            # Group by Date to get a single global average line
            # (Since the CSV now has 20 stations mixed together)
            daily_df = df.groupby('date')['water_level'].mean().reset_index()
            
            # Rename to match Frontend Expectation (ds, y)
            daily_df.rename(columns={'date': 'ds', 'water_level': 'y'}, inplace=True)
            
            # Format date back to string
            daily_df['ds'] = daily_df['ds'].dt.strftime('%Y-%m-%d')
            
            return daily_df.to_dict(orient="records")
            
        # Fallback for old CSV format
        elif 'ds' in df.columns:
            return df.to_dict(orient="records")
            
        else:
            return []

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))