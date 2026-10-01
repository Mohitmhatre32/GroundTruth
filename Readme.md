# 💧 GroundTruth — AI-Driven Groundwater Resource Evaluation System

<div align="center">

> **🏆 Winner — AI/ML Domain · TECHNOVA 2026**
>
> *Visualizing the Invisible. Sustaining the Future.*

![Status](https://img.shields.io/badge/Status-Prototype_Ready-success?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Web_%26_Mobile-blue?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-LSTM_%7C_ARIMA_%7C_Gemini-orange?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-React_%2B_TypeScript-61DAFB?style=for-the-badge)
![Mobile](https://img.shields.io/badge/Mobile-Flutter-54C5F8?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 📖 Overview

**GroundTruth** is a full-stack, cross-platform Decision Support System (DSS) designed to combat the data scarcity crisis in groundwater management across India. It fuses **real-time DWLR (Digital Water Level Recorder) telemetry**, **Satellite NDVI Analytics**, and **Hybrid AI (LSTM + ARIMA)** to empower two distinct user groups:

| Interface | Target Users | Purpose |
|---|---|---|
| 🖥️ **Web Command Dashboard** | Water Resource Planners & Government Authorities | Macro-level forecasting, policy simulation, economic modeling |
| 📱 **Flutter Mobile App** | Field Officers & Ground Researchers | Real-time sensor monitoring, AI chatbot, geo-tagged alerts |

---

## 🏗️ Monorepo Structure

```
GroundTruth/
├── frontend/          # React + TypeScript + Vite web dashboard
├── backend/           # FastAPI web backend (REST API for dashboard)
├── app_backend/       # FastAPI mobile backend (REST API + FCM notifications)
└── ground_truth/      # Flutter cross-platform mobile app
```

---

## 🚀 Key Features

### 🖥️ 1. Web Command Dashboard (`/frontend` + `/backend`)

#### 📊 Real-Time Monitoring Center
- Live DWLR sensor data visualization across all registered stations
- Interactive station map powered by **Leaflet / React-Leaflet**
- Zone status classification: **Safe / Semi-Critical / Critical**

#### 🔮 Hybrid AI Forecasting
- **LSTM + ARIMA ensemble model** predicts groundwater levels for the next 6–12 months
- Training data ingested from `backend/training_data.csv`
- Forecast confidence bands and trend overlays on interactive charts (Recharts)

#### 🛰️ Satellite Vegetation Analysis (NDVI)
- Integrates remote sensing data to correlate surface vegetation health with aquifer depletion
- Identifies zones of excessive agricultural extraction
- Side-by-side NDVI heatmaps and water level trend charts

#### 📋 Policy & Simulation Engine
- **Scenario Planning**: "What if we ban industrial pumping in Zone B?"
- Dynamic recalculation of projected water levels per policy action
- Animated simulation timeline with Framer Motion

#### 💰 Economic Risk Modeling
- Quantifies the financial risk of water scarcity incidents
- Models extraction depth vs. cost curves per zone
- Leaderboard for district-level conservation performance

#### 🚨 Alerts & Reporting
- Configurable threshold-based alert rules per station
- Auto-generated PDF/CSV reports via the Reporting API
- Research data export for academic use

---

### 📱 2. Flutter Mobile App (`/ground_truth` + `/app_backend`)

#### 📡 Real-Time Station Data
- Live water level charts (fl_chart) synced from Firestore
- Offline-first with Hive local cache + connectivity detection

#### 🤖 Context-Aware AI Chatbot (Gemini)
- Natural language queries about any station or zone
- Powered by `google_generative_ai` + `googleai_dart`
- *Example: "Is the water level in Block 4 rising or falling?"*

#### 🔔 Geo-Tagged Push Notifications (FCM)
- Automated Firebase Cloud Messaging alerts when zones breach thresholds
- Configurable per-station notification subscriptions
- Background mobile simulator triggers real alerts

#### 🗺️ Interactive Map (Flutter Map)
- GPS-enabled field navigation to station locations
- Geodata overlays for zone classification visualization

#### 📤 Data Export
- Share reports as PDF or CSV directly from the app
- Field photo capture with `image_picker`

---

## 🛠️ Tech Stack

### Frontend (Web Dashboard)
| Category | Technology |
|---|---|
| Framework | React 19 + TypeScript 5 |
| Build Tool | Vite 7 |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v3 |
| Charts | Recharts v3 |
| Maps | Leaflet + React-Leaflet v5 |
| Animations | Framer Motion v12 |
| Icons | Lucide React |
| Notifications | Sonner |

### Backend (Web API)
| Category | Technology |
|---|---|
| Framework | FastAPI (Python 3.9+) |
| Database | Firebase / Cloud Firestore |
| ML/AI | LSTM (Keras/TF), Statsmodels (ARIMA), Scikit-learn |
| Geospatial | Folium, GeoPandas, Rasterio |
| AI Assistant | Google Gemini API |
| Server | Uvicorn |

### App Backend (Mobile API)
| Category | Technology |
|---|---|
| Framework | FastAPI (Python 3.9+) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Simulators | Web Simulator + Mobile Simulator (background threads) |

### Mobile App (Flutter)
| Category | Technology |
|---|---|
| Framework | Flutter (Dart SDK ^3.10.4) |
| State Management | Provider |
| Database | Firebase Firestore + Hive (offline) |
| Auth | Firebase Auth |
| Maps | Flutter Map + Geolocator |
| Charts | fl_chart |
| AI Chatbot | Google Generative AI + googleai_dart |
| HTTP | Dio + http |
| Notifications | FCM + flutter_local_notifications |
| Export | pdf, csv, share_plus |

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js** 18+ and **npm** (for web dashboard)
- **Python** 3.9+ (for both backends)
- **Flutter SDK** ^3.10.4 (for mobile app)
- **Firebase** project with Firestore, Auth, and Cloud Messaging enabled

---

### 1. Clone the Repository

```bash
git clone https://github.com/Mohitmhatre32/GroundTruth.git
cd GroundTruth
```

---

### 2. Web Backend (`/backend`)

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Fill in your Firebase credentials in .env

# Add your Firebase service account key
# Place serviceAccountKey.json in /backend

# Start the server
uvicorn main:app --reload --port 8000
```

API Docs available at: `http://localhost:8000/docs`

---

### 3. App Backend (`/app_backend`)

```bash
cd app_backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

# Configure .env with Firebase credentials

# Start the server (interactive: choose Web or Mobile simulator)
uvicorn main:app --reload --port 8001
# Follow the on-screen prompt to select simulator mode:
#   1 → Web Simulator (dashboard data only)
#   2 → Mobile Simulator (dashboard data + FCM push alerts)
```

---

### 4. Web Frontend (`/frontend`)

```bash
cd frontend

npm install

# Configure environment
copy .env.example .env
# Set VITE_API_BASE_URL to your backend URL (default: http://localhost:8000)

# Start development server
npm run dev
```

Dashboard available at: `http://localhost:5173`

```bash
# Production build
npm run build
```

---

### 5. Flutter Mobile App (`/ground_truth`)

```bash
cd ground_truth

# Install Flutter dependencies
flutter pub get

# Configure .env with Firebase credentials and backend URLs

# Run on connected device or emulator
flutter run

# Build APK
flutter build apk --release
```

---

## 🔌 API Reference

### Web Backend (`localhost:8000/api`)

| Tag | Endpoints | Description |
|---|---|---|
| Monitoring | `/stations`, `/readings` | Live DWLR sensor data |
| Forecasting | `/forecast` | LSTM + ARIMA predictions |
| Analysis | `/analysis` | Trend & statistical analysis |
| Risk | `/risk` | Zone risk classification |
| Policy | `/policy` | Policy scenario results |
| Research | `/research` | Raw data for researchers |
| Reporting | `/reports` | PDF/CSV report generation |
| Weather | `/weather/*` | Weather data integration |
| Economics | `/economics/*` | Economic risk modeling |
| Leaderboard | `/leaderboard/*` | District conservation rankings |
| Satellite | `/satellite/*` | NDVI remote sensing data |
| Alerts | `/alerts` | Threshold alert configuration |

### App Backend (`localhost:8001/api`)

| Tag | Endpoints | Description |
|---|---|---|
| Mobile API | `/mobile/*` | Mobile-optimized data endpoints |
| Notifications | `/notify/*` | FCM push notification triggers |
| Monitoring | `/stations`, `/readings` | Shared monitoring data |

---

## 🗺️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                         │
│   DWLR Sensors  ·  Satellite (NDVI)  ·  Weather Services   │
└────────────────────────┬────────────────────────────────────┘
                         │
            ┌────────────▼────────────┐
            │     Firebase / Firestore │
            │    (Real-time Database)  │
            └──────┬──────────┬───────┘
                   │          │
       ┌───────────▼──┐  ┌───▼──────────────┐
       │  Web Backend │  │   App Backend    │
       │  (FastAPI)   │  │   (FastAPI)      │
       │  :8000       │  │   :8001 + FCM    │
       └───────┬──────┘  └───────┬──────────┘
               │                 │
   ┌───────────▼──┐   ┌──────────▼──────────┐
   │  React Web   │   │   Flutter Mobile    │
   │  Dashboard   │   │   App (iOS/Android) │
   │  :5173       │   │                     │
   └──────────────┘   └─────────────────────┘
```

---

## 📁 Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Public landing page with project overview |
| `/login` | Login | Firebase authentication |
| `/dashboard` | Dashboard | Main overview with KPIs and station map |
| `/real-time` | Real-Time Center | Live sensor readings and charts |
| `/vegetation` | Vegetation | NDVI satellite analysis |
| `/analytics` | Analytics | Deep-dive AI forecasting charts |
| `/policy` | Policy | Policy scenario simulator |
| `/simulation` | Simulation | Interactive scenario planning |
| `/reports` | Reports | Report generation and history |
| `/alerts` | Alerts | Alert management and configuration |

---

## 🔐 Environment Variables

### Backend / App Backend (`.env`)

```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
GEMINI_API_KEY=
```

### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Flutter App (`.env`)

```env
API_BASE_URL=http://localhost:8001
GEMINI_API_KEY=
```

> ⚠️ **Never commit `.env` files or `serviceAccountKey.json` to version control.**

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

Built with ❤️ for sustainable water resource management.

*GroundTruth — Making groundwater data actionable.*

</div>