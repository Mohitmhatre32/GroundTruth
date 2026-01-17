import pandas as pd
import numpy as np
import os

# Determine path to save the CSV (inside backend root for easy access)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(BASE_DIR, "training_data.csv")

def generate_data():
    # 1. Create dates for last 5 years
    dates = pd.date_range(start='2019-01-01', end='2024-01-01', freq='ME') 
    # Note: 'M' is deprecated in newer pandas, 'ME' is Month End

    # 2. Create a synthetic trend (Water level dropping 0.5m every year)
    base_level = 15.0
    
    # Linear trend: Drops 2.5m over the total period
    trend = np.linspace(0, 2.5, len(dates)) 
    
    # Seasonality: Monsoon fluctuations (Sine wave)
    seasonality = np.sin(np.linspace(0, 20, len(dates))) * 2 

    # Combine them
    levels = base_level + trend + seasonality

    # 3. Save to DataFrame
    df = pd.DataFrame({'ds': dates, 'y': levels})
    
    # 4. Export to CSV
    df.to_csv(CSV_PATH, index=False)
    print(f"✅ Dummy Training Data Created at: {CSV_PATH}")

if __name__ == "__main__":
    generate_data()