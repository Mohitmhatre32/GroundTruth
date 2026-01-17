from fpdf import FPDF
import os
import pandas as pd
import datetime
from features.research.service import simulate_dual_models

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(BASE_DIR, "training_data.csv")

class GT_Report(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 16)
        self.set_text_color(26, 60, 94)
        self.cell(0, 10, 'GROUNDTRUTH OFFICIAL DATA REPORT', 0, 1, 'C')
        self.ln(5)

# --- CSV LOGIC ---
def get_overall_csv():
    return CSV_PATH # Simply returns the main dataset

def get_custom_csv(station_id, start, end):
    df = pd.read_csv(CSV_PATH)
    df['date'] = pd.to_datetime(df['date'])
    filtered = df[(df['station_id'] == station_id) & (df['date'] >= start) & (df['date'] <= end)]
    out = os.path.join(BASE_DIR, "static", "custom_data.csv")
    filtered.to_csv(out, index=False)
    return out

# --- PDF LOGIC ---
def generate_overall_pdf():
    df = pd.read_csv(CSV_PATH)
    pdf = GT_Report()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, f"Full Network Summary Report - {datetime.date.today()}", 0, 1)
    
    summary = df.groupby('station_id')['water_level'].agg(['mean', 'max']).reset_index()
    
    pdf.set_fill_color(200, 220, 255)
    pdf.cell(80, 10, "Station", 1, 0, 'C', 1)
    pdf.cell(50, 10, "Avg Depth (m)", 1, 0, 'C', 1)
    pdf.cell(50, 10, "Max Depth (m)", 1, 1, 'C', 1)
    
    pdf.set_font("Arial", '', 10)
    for _, row in summary.iterrows():
        pdf.cell(80, 10, row['station_id'], 1)
        pdf.cell(50, 10, str(round(row['mean'], 2)), 1)
        pdf.cell(50, 10, str(round(row['max'], 2)), 1, 1)
        
    path = os.path.join(BASE_DIR, "static", "overall_report.pdf")
    pdf.output(path)
    return path

def generate_custom_pdf(station_id, start, end):
    # 1. Get History
    df = pd.read_csv(CSV_PATH)
    df['date'] = pd.to_datetime(df['date'])
    hist = df[(df['station_id'] == station_id) & (df['date'] >= start) & (df['date'] <= end)]
    
    # 2. Get Forecasts (Feature 8 Integration)
    predictions = simulate_dual_models(station_id, 0, 0)
    
    pdf = GT_Report()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(0, 10, f"Analysis for: {station_id}", 0, 1)
    pdf.set_font("Arial", '', 11)
    pdf.cell(0, 7, f"Period: {start} to {end}", 0, 1)
    pdf.ln(5)

    # Historical Table
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, "Part A: Historical Observations (Recent 10)", 0, 1)
    pdf.set_font("Arial", '', 10)
    for _, row in hist.tail(10).iterrows():
        pdf.cell(90, 8, row['date'].strftime('%Y-%m-%d'), 1)
        pdf.cell(90, 8, f"{row['water_level']} m", 1, 1)

    pdf.ln(10)
    
    # Predictions Table
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 10, "Part B: AI-Driven 12-Month Forecasts", 0, 1)
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(60, 10, "Month", 1, 0, 'C', 1)
    pdf.cell(60, 10, "ARIMA (m)", 1, 0, 'C', 1)
    pdf.cell(60, 10, "LSTM AI (m)", 1, 1, 'C', 1)
    
    for i in range(len(predictions['labels'])):
        pdf.cell(60, 8, predictions['labels'][i], 1)
        pdf.cell(60, 8, str(predictions['arima_data'][i]), 1)
        pdf.cell(60, 8, str(predictions['lstm_data'][i]), 1, 1)

    path = os.path.join(BASE_DIR, "static", "custom_analysis.pdf")
    pdf.output(path)
    return path