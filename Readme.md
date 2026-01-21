# 💧 GroundTruth: AI-Driven Groundwater Resource Evaluation System

> **🏆 Winner - AI/ML Domain at TECHNOVA 2026**
>
> *Visualizing the Invisible, Sustaining the Future.*

![Status](https://img.shields.io/badge/Status-Prototype_Ready-success)
![Platform](https://img.shields.io/badge/Platform-Web_%26_Mobile-blue)
![Tech](https://img.shields.io/badge/AI-LSTM_%7C_ARIMA-orange)
![License](https://img.shields.io/badge/License-MIT-green)

## 📖 Overview
**GroundTruth** is a cross-platform Decision Support System (DSS) designed to solve the data scarcity crisis in groundwater management.

By fusing **real-time DWLR (Digital Water Level Recorder) telemetry** with **Satellite Analytics** and **Hybrid AI**, GroundTruth provides a dual-interface solution: a **Command Dashboard** for policymakers to simulate conservation strategies, and a **Field App** for researchers to monitor aquifers on the ground.

---

## 🚀 Key Features

### 🖥️ 1. Centralized Command Dashboard (Web)
*Designed for Water Resource Planners & Government Authorities.*

*   **Hybrid AI Forecasting (LSTM + ARIMA):**
    *   Combines statistical precision (ARIMA) with Deep Learning (LSTM) to predict groundwater levels for the next **6-12 months** with high accuracy.
*   **Satellite Vegetation Analysis (NDVI):**
    *   Integrates remote sensing data to correlate surface vegetation health with aquifer depletion, identifying areas of excessive agricultural extraction.
*   **Policy Simulation & Economic Modeling:**
    *   **Scenario Planning:** "What if we ban industrial pumping in Zone B?"
    *   **Economic Calculator:** Quantifies the financial risk of water scarcity and the cost of extraction depth.
*   **Dynamic Zone Classification:**
    *   Auto-classifies regions as **Safe, Semi-Critical, or Critical** based on real-time extraction vs. recharge rates.

### 📱 2. Field-Ready Mobile Ecosystem
*Designed for Field Officers & Researchers.*

*   **Real-Time Data Station:** Instant visualization of sensor logs and historical trends on mobile devices.
*   **Context-Aware AI Chatbot:**
    *   A natural language assistant for location-specific queries.
    *   *User:* "Is the water level in Block 4 rising or falling?"
    *   *Bot:* "Block 4 is showing a declining trend of 2% this month due to low rainfall."
*   **Geo-Tagged Alerts:** Automated push notifications when specific zones breach critical water thresholds.


---

## 🛠️ Tech Stack

*   **Language:** Python 3.9+
*   **Web Framework:** React JS, Tailwinds CSS
*   **Mobile Framework:** Flutter
*   **ML/AI:** LSTM, Statsmodels (ARIMA), Scikit-learn
*   **Geospatial:** Folium, Geopandas, Rasterio
*   **Database:** FireBase
*   **Technology** Gemini API 

---

## ⚙️ Installation & Setup

### Prerequisites
*   Python 3.9+ installed
*   [Flutter SDK installed - if running mobile app]

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/GroundTruth.git
cd GroundTruth