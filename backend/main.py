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


def parse_gemini_response(response_text: str) -> dict:
  """Parse the Gemini AI response to extract structured data."""

  try:
    # try to extract JSON from the response 
    json_match = re.search(r"\{.*\}", response_text, re.DOTALL)

    if json_match:
      json_str = json_match.group()
      parsed_data = json.loads(json_str)

      return {
        "risk_level": parsed_data.get("risk_level", "Medium"),
        "description": parsed_data.get("description", "Analysis Completed."),
        "recommendations": parsed_data.get("recommendations", []),
        "elevation": parsed_data.get("elevation", 50.0),
        "distance_from_water": parsed_data.get("distance_from_water", 1000.0),
        "image_analysis": parsed_data.get("image_analysis", "")
      }
    
  except Exception as e: 
    logger.error(f"Error analyzing image: {str(e)}")
    return {
        "risk_level": "Medium",
        "description": "Analysis Completed with default values.",
        "recommendations": ["Monitor local weather forecasts", "Ensure proper drainage", "Have an evacuation plan"],
        "elevation": 50.0,
        "distance_from_water": 1000.0,
        "image_analysis": response_text
      }

@app.get("/")
async def root():
  return {
    "message": "Welcome to the Flood Analyzer API!",
    "version": "1.0.0",
    "status": "API is running",
    "timestamp": datetime.utcnow().isoformat()
  }


@app.post("/api/analyze/image")
async def analyze_image(file: UploadFile = File(...)):
  """
  Analyze flood risk based on uploaded image using gemini ai
  """
  try:
    logger.info(f"Analyzing image file: {file.filename}")

    # validate file 
    if not file.content_type.startswith("image/"):
      raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")
    
    if file.size > 10 * 1024 * 1024:  # limit to 10MB
      raise HTTPException(status_code=400, detail="File size exceeds the limit of 10MB.")
    
    # read image data 
    image_data = await file.read()

    try:
      image = PILImage.open(io.BytesIO(image_data))

      if image.mode != "RGB":
        image = image.convert("RGB")

    except Exception as img_error:
      logger.error(f"Error processing image: {str(img_error)}")
      raise HTTPException(status_code=400, detail="Invalid image format.")

    prompt = """
    Analyze this terrain image for flood risk assessment.
    
    Please provide:
    1. Risk Level (Low/Medium/High/Very High)
    2. Description of the risk based on what you see
    3. 3-5 specific recommendations
    4. Estimated elevation in meters
    5. Estimated distance from water bodies in meters
    6. What water bodies or flood risks you can identify in the image

    Format your response as JSON with these fields:
    - risk_level
    - description
    - recommendations (array of strings)
    - elevation (number)
    - distance_from_water (number)
    - image_analysis (string describing what you see)
    """

    try:
      model = genai.GenerativeModel("gemini-2.0-flash-exp")
      response = model.generate_content(prompt, image=image)

      parsed_data = parse_gemini_response(response.text)

    except Exception as genai_error:
      logger.error(f"Error generating response from Gemini: {str(genai_error)}")
      parsed_data = generate_image_risk_assessment()
      parsed_data["image_analysis"] = "Image analysis was not available, using simulated assessment"
      raise HTTPException(status_code=500, detail="Error analyzing image with Gemini AI.")


    return {
      success: True,
      **parsed_data,
      "ai_analysis": parsed_data.get("image_analysis", ""),
      message: "Image analyzed successfully using Gemini AI."
    }

  except Exception as e:
    logger.error(f"Error analyzing image: {str(e)}")
    raise HTTPException(status_code=500, detail="An error occurred while analyzing the image.")

if __name__ == "__main__":
  uvicorn.run('main:app', host='localhost', port=8000, reload=True, log_level="info")