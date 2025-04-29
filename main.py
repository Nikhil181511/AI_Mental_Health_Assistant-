from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import ollama  # Make sure ollama is installed and running with the phi model
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_response_to_bullets(response_text):
    # Convert plain text to bullet-point format
    lines = response_text.strip().split("\n")
    return "\n".join([f"• {line.strip()}" if not line.startswith("•") else line for line in lines if line.strip()])


@app.post("/chat")
async def chat(data: dict):
    user_message = data.get("text", "")

    # Mental health assistant behavior
    system_prompt = (
        "You are a mental health assistant. "
        "Behave like a personal/ good friend."
        "Give short, practical, and kind advice in 2-3 bullet points. "
        "Use simple words and avoid long explanations. "
        "Focus on calming, motivating, or uplifting the user. "
        "Never give medical advice. Encourage professional help when needed."
    )

    try:
        response = ollama.chat(
            model="phi",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )

        formatted_response = format_response_to_bullets(response["message"]["content"])
        return {"response": formatted_response}

    except Exception as e:
        return {"response": "Error: Unable to process the request"}

class WellnessCheckIn(BaseModel):
    moodRating: int
    moodDescription: str
    description: Optional[str] = None
    voiceUrl: Optional[str] = None
    timestamp: int

# Dummy data storage (In production, you will use a database)
checkins = []

@app.post("/checkin")
async def wellness_checkin(checkin: WellnessCheckIn):
    # Store the check-in (you can save this to a database here)
    checkins.append(checkin.dict())
    
    # Return the message and stored data
    return {"message": "Wellness check-in received", "data": checkin.dict()}

@app.get("/checkins")
async def get_checkins():
    # Return all check-ins as a list of wellness check-ins
    return checkins