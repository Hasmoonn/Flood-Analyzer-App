# 🌧️ Smart Flood Risk Analyzer

A lightweight MVP designed to assess flood risk using AI. Users can provide geographic coordinates or upload terrain images to receive intelligent flood risk insights powered by modern AI technology.


This system combines a modern web interface with a FastAPI backend to deliver fast and accurate flood risk analysis. It integrates Google’s Gemini AI to interpret environmental data and provide meaningful recommendations.

---

## ✨ Core Features

* 📍 **Location-Based Analysis**
  Input latitude and longitude to evaluate flood risk for a specific area

* 🖼️ **Image-Based Analysis**
  Upload terrain or environmental images for AI-driven insights

* 🗺️ **Map Visualization**
  Display analyzed locations with risk indicators

* 🧠 **AI Integration**
  Uses Gemini AI for contextual and intelligent analysis

* 🎨 **Modern UI**
  Responsive and clean design built with modern frontend tools

---

## ⚡ Quick Setup

### 🔹 Option 1: Run Everything Together (Recommended)

```bash
# Navigate to backend
cd backend

# Create environment file
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start both frontend and backend
./start-dev.sh
```

### 🌐 Access URLs

* Frontend → [http://localhost:3000](http://localhost:3000)
* Backend API → [http://localhost:8000](http://localhost:8000)
* API Docs → [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 🔹 Option 2: Run Services Separately

#### Backend Setup

```bash
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Set environment variable
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start backend server
python start.py
```

---

#### Frontend Setup

```bash
npm install
npm run dev
```

---

## 🧑‍💻 Usage Guide

### 📍 Coordinate-Based Analysis

* Enter latitude and longitude
* Receive flood risk evaluation

---

### 🖼️ Image-Based Analysis

* Upload terrain images
* AI analyzes landscape and risk factors

---

### 📊 Results

The system provides:

* Risk level (Low / Medium / High / Critical)
* Estimated elevation
* Distance from nearby water bodies
* Safety recommendations

---

### 🗺️ Map View

* Visualize selected locations
* Display risk indicators directly on the map

---

## 📡 API Endpoints

| Method | Endpoint                   | Description               |
| ------ | -------------------------- | ------------------------- |
| POST   | `/api/analyze/coordinates` | Analyze using coordinates |
| POST   | `/api/analyze/image`       | Analyze using image       |

---

## 🛠️ Technology Stack

### 🌐 Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* Google Maps API

---

### ⚙️ Backend

* FastAPI
* Google Gemini AI
* Python 3.9+
* Pydantic

---

## 📁 Project Layout

```
flood-risk-analyzer/
├── app/page.tsx        # Main frontend page
├── backend/main.py     # FastAPI server
├── backend/start.py    # Startup script
├── start-dev.sh        # Dev script for both services
└── README.md
```

---

## 🔑 Requirements

* Gemini API Key → Get from Google AI Studio
* Google Maps API Key (optional) → For map visualization

---

## 🧪 Development

### Run Both Services

```bash
./start-dev.sh
```

---

### Run Individually

```bash
# Frontend
npm run dev

# Backend
cd backend && python start.py
```

---

## 🎯 Purpose

This project is designed as a **minimal viable product (MVP)** focusing on:

* Fast AI-powered flood detection
* Simple architecture
* Easy integration and scalability

---

## 🌟 Future Enhancements

* Real-time weather data integration
* Historical flood data analysis
* User accounts and saved reports
* Mobile-friendly enhancements

---

## 📜 License

Open-source project available for learning and development use.
