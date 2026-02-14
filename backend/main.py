from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import uvicorn
import asyncio
from datetime import datetime
import logging
import google.generativeai as genai
from dotenv import load_dotenv
import base64
import io
import json
import re
from PIL import Image as PILImage

# load environment variables from .env file
load_dotenv()

# configure logging 
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# initialize genai
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(
  title="Flood Analyzer API",
  description="An API for analyzing flood images and generating reports using Google Gemini.",
  version="1.0.0"
)

# CORSMiddleware
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_methods=["*"],
  allow_headers=["*"],
  allow_credentials=True,
)

class CoordinateRequest(BaseModel):
  latitude: float
  longitude: float

class AnalysisResponse(BaseModel):
  success: bool
  risk_level: str
  description: str
  recommendations: list[str]
  elevation: float
  distance_from_water: float
  message: str


@app.get("/")
async def root():
  return {
    "message": "Welcome to the Flood Analyzer API!",
    "version": "1.0.0",
    "status": "API is running",
    "timestamp": datetime.utcnow().isoformat()
  }


if __name__ == "__main__":
  uvicorn.run('main:app', host='localhost', port=8000, reload=True, log_level="info")