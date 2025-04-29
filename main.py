from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import ollama  # Ensure ollama is installed and running with the phi model
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, firestore
from typing import List, Dict
from fastapi import Request



# Initialize Firebase Admin SDK with your service account credentials
cred = credentials.Certificate("C:/Users/nikhi/Downloads/wastex-da8fa-firebase-adminsdk-rxbwl-3268440c93.json")
firebase_admin.initialize_app(cred)

# Get Firestore client
firestore_db = firestore.client()

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_credentials=True,
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
        "Behave like a personal/ good friend. "
        "Give short, practical, and kind advice in 2-3 bullet points. "
        "Use simple words and avoid long explanations. "
        "Focus on calming, motivating, or uplifting the user. "
        "Never give medical advice. Encourage professional help when needed."
    )

    try:
        response = ollama.chat(
            model="phi",
            messages=[  # Using Phi model to generate response
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )

        formatted_response = format_response_to_bullets(response["message"]["content"])
        return {"response": formatted_response}

    except Exception as e:
        return {"response": f"Error: Unable to process the request. {str(e)}"}

class WellnessCheckIn(BaseModel):
    moodRating: int
    moodDescription: str
    description: Optional[str] = None
    voiceUrl: Optional[str] = None
    timestamp: int

# Dummy data storage (In production, you should use a database)
checkins = []

@app.post("/checkin")
async def wellness_checkin(checkin: WellnessCheckIn):
    # Store the check-in (you can save this to a database here)
    checkins.append(checkin.dict())
    
    # Store to Firestore
    checkins_ref = firestore_db.collection('checkins')
    checkins_ref.add(checkin.dict())

    # Return the message and stored data
    return {"message": "Wellness check-in received", "data": checkin.dict()}

@app.get("/checkins")
async def get_checkins():
    # Return all check-ins as a list of wellness check-ins
    return checkins

def fetch_checkins_from_firestore() -> List[Dict]:
    checkins_ref = firestore_db.collection('checkins')  # Adjust the collection name if needed
    checkins_snapshot = checkins_ref.stream()
    checkins = []
    for doc in checkins_snapshot:
        checkins.append(doc.to_dict())  # Convert Firestore document to a dictionary
    return checkins

@app.get("/analysis")
async def get_profile_analysis():
    checkins = fetch_checkins_from_firestore()
    total_checkins = len(checkins)
    
    if total_checkins == 0:
        return {"message": "No check-ins available"}
    
    # Calculate overall mood
    mood_counts = {}
    total_mood_rating = 0
    for checkin in checkins:
        mood = checkin["moodDescription"]
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
        total_mood_rating += checkin["moodRating"]
    
    # Deriving the overall mood as the most common mood
    overall_mood = max(mood_counts, key=mood_counts.get)
    
    # Deriving the wellness score as average mood rating
    wellness_score = total_mood_rating / total_checkins if total_checkins else 0
    
    # Convert timestamps to dates and map moods to them
    mood_over_time = [
        {"date": datetime.utcfromtimestamp(checkin["timestamp"] / 1000).strftime('%Y-%m-%d'), "mood": checkin["moodRating"]}
        for checkin in checkins
    ]
    
    # Mood distribution
    mood_distribution = {mood: count for mood, count in mood_counts.items()}
    
    # Word Cloud (basic approach, using descriptions)
    word_cloud = []
    for checkin in checkins:
        word_cloud.extend(checkin["description"].split())
    
    # AI Summary and recommendations (basic placeholders here)
    ai_summary = "Your mental wellness is generally stable. Consider regular check-ins."
    recommendations = ["Exercise regularly", "Meditate daily"]
    
    # Returning profile analysis data
    return {
        "name": "User",
        "total_checkins": total_checkins,
        "overall_mood": overall_mood,
        "last_checkin": datetime.utcfromtimestamp(checkins[-1]["timestamp"] / 1000).strftime('%Y-%m-%d'),
        "wellness_score": wellness_score,
        "mood_over_time": mood_over_time,
        "mood_distribution": mood_distribution,
        "voice_insights": {
            "most_common": "Neutral",
            "spike_date": "2025-04-02",
            "spike_reason": "Stressful day",
            "trend": "Improving"
        },
        "word_cloud": word_cloud,
        "ai_summary": ai_summary,
        "recommendations": recommendations
    }

appointments_db = []
therapists_db = [
    { "id": 1, "name": "Dr. Priya Naik", "specialty": "Cognitive Behavioral Therapy", "location": "Panaji, Goa", "availability": "Mon-Wed" },
    { "id": 2, "name": "Dr. Rajesh Kamath", "specialty": "Trauma Therapy", "location": "Margao, Goa", "availability": "Tue-Fri" },
    { "id": 3, "name": "Dr. Sneha D'Souza", "specialty": "Family Counseling", "location": "Vasco da Gama, Goa", "availability": "Mon-Thu" },
    { "id": 4, "name": "Dr. Vikram Shetty", "specialty": "Depression & Anxiety", "location": "Mapusa, Goa", "availability": "Wed-Sat" },
    { "id": 5, "name": "Dr. Anisha Pai", "specialty": "Mindfulness Therapy", "location": "Ponda, Goa", "availability": "Mon, Wed, Fri" },
    { "id": 6, "name": "Dr. Sunita Verma", "specialty": "Child Psychology", "location": "Calangute, Goa", "availability": "Tue-Thu" },
    { "id": 7, "name": "Dr. Manoj Prabhu", "specialty": "Addiction Counseling", "location": "Mangalore, Karnataka", "availability": "Mon-Fri" },
    { "id": 8, "name": "Dr. Leela Kamat", "specialty": "Relationship Therapy", "location": "Panjim, Goa", "availability": "Tue, Thu, Sat" },
    { "id": 9, "name": "Dr. Rahul Sawant", "specialty": "Stress Management", "location": "Mumbai, Maharashtra", "availability": "Mon-Wed, Fri" }
]


class Appointment(BaseModel):
    id: Optional[int] = None
    name: str
    phone: str
    datetime: str
    concern: str
    therapistId: int
    therapistName: str
    status: str = "upcoming"  # upcoming or visited

@app.get("/therapists")
def get_therapists():
    return therapists_db

@app.get("/appointments")
def get_appointments():
    return appointments_db

@app.post("/book")
def book_appointment(appt: Appointment):
    appt.id = len(appointments_db) + 1
    appointments_db.append(appt)
    return { "message": "Appointment booked", "appointment": appt }
