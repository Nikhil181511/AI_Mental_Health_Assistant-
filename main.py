from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import firebase_admin
from firebase_admin import credentials, firestore
from typing import List, Dict
from fastapi import Request
import yt_dlp       
import re               
import google.generativeai as genai
import requests
import subprocess
import random

GEMINI_KEY = "AIzaSyAGBcadOlnb9aVqTxE1q7PeM3rHDYjxb7g"
GNEWS_API_KEY = "f0b10b018e9d9ae45b36fba763a90588"

genai.configure(api_key=GEMINI_KEY)
# Initialize Firebase Admin SDK with your service account credentials
cred = credentials.Certificate("wastex-da8fa-firebase-adminsdk-rxbwl-eb4cfc3f76.json")
firebase_admin.initialize_app(cred)

# Get Firestore client
firestore_db = firestore.client()

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def format_response_to_bullets(response_text):
    lines = response_text.strip().split("\n")
    return "\n".join([f"• {line.strip()}" if not line.startswith("•") else line for line in lines if line.strip()])

@app.post("/chat")
async def chat(data: dict):
    user_message = data.get("text", "")
    user_mood = data.get("mood", None)
    chat_history = data.get("history", [])  # List of previous messages

    # Build chat history string for prompt
    history_str = ""
    if chat_history and isinstance(chat_history, list):
        for msg in chat_history[-5:]:  # Use last 5 exchanges
            sender = msg.get("sender", "user")
            text = msg.get("text", "")
            history_str += f"{sender.capitalize()}: {text}\n"

    prompt = (
        "You are a compassionate mental health assistant acting like a supportive, caring friend. "
        + (f"The user's current mood is: {user_mood}. Please be gentle and talk to them nicely. " if user_mood else "")
        + "Provide short and Be empathetic, use simple words, and encourage calmness. "
        "Don't repeat generic phrases. Avoid medical advice.\n\n"
        + (f"Recent conversation:\n{history_str}\n" if history_str else "")
        + f"User: {user_message}\n\n"
        "Response:"
    )

    try:
        model = genai.GenerativeModel(model_name="models/gemini-2.0-flash")
        response = model.generate_content(prompt)

        def format_response_to_bullets(response_text):
            lines = response_text.strip().split("\n")
            return "\n".join(
                [f"• {line.strip().lstrip('*•-')}" for line in lines if line.strip()]
            )

        formatted_response = format_response_to_bullets(response.text)
        return {"response": formatted_response}

    except Exception as e:
        return {"response": f"Error: {str(e)}"}


class WellnessCheckIn(BaseModel):
    moodRating: int
    moodDescription: str
    description: Optional[str] = None
    voiceUrl: Optional[str] = None
    timestamp: int
    userId: Optional[str] = None  # Add user ID for user-dependent storage
    userEmail: Optional[str] = None  # Add user email for reference

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


def generate_ai_summary(checkins, overall_mood, wellness_score):
    """Generate AI-powered summary using Gemini LLM based on user's check-in patterns"""
    try:
        total_checkins = len(checkins)
        recent_checkins = checkins[-5:] if total_checkins > 5 else checkins
        recent_entries = "\n".join([
            f"Date: {datetime.utcfromtimestamp(c['timestamp']/1000).strftime('%Y-%m-%d')}, Mood: {c['moodDescription']}, Rating: {c['moodRating']}, Note: {c.get('description','')}"
            for c in recent_checkins
        ])
        prompt = (
            "You are a mental health assistant. Summarize the user's mental wellness journey in a supportive, professional, and empathetic tone. "
            "Highlight strengths, areas for improvement, and encourage positive steps. "
            "Do not give medical advice.\n"
            "Keep it short and also concise."
            "Give point form summary"
            "Do not give any extra information directly start with summary"
            f"Total check-ins: {total_checkins}\n"
            f"Most common mood: {overall_mood}\n"
            f"Wellness score (avg mood rating, out of 5): {wellness_score:.1f}\n"
            f"Recent check-ins:\n{recent_entries}\n"
            "Summary:"
        )
        model = genai.GenerativeModel(model_name="models/gemini-2.0-flash")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return "Your mental wellness journey is unique. Keep tracking your moods to better understand your patterns."

def generate_recommendations(overall_mood, wellness_score):
    """Generate personalized recommendations based on mood and wellness score"""
    recommendations = []
    
    if wellness_score >= 4:
        recommendations = [
            "Continue your current self-care routine",
            "Share your wellness strategies with others",
            "Try new mindfulness techniques to maintain balance",
            "Consider setting new wellness goals"
        ]
    elif wellness_score >= 3:
        recommendations = [
            "Establish a regular sleep schedule",
            "Try 10 minutes of daily meditation",
            "Engage in moderate exercise 3 times a week",
            "Practice gratitude journaling"
        ]
    else:
        recommendations = [
            "Consider speaking with a mental health professional",
            "Start with small daily self-care activities",
            "Practice deep breathing exercises",
            "Connect with supportive friends or family",
            "Try gentle activities like walking or listening to music"
        ]
    
    # Add mood-specific recommendations
    if "Poor" in overall_mood or "Very Poor" in overall_mood:
        recommendations.append("Consider professional counseling support")
        recommendations.append("Engage in activities that bring you joy")
    elif "Good" in overall_mood or "Very Good" in overall_mood:
        recommendations.append("Maintain your positive habits")
        recommendations.append("Help others to boost your own well-being")
    
    return recommendations

def fetch_checkins_from_firestore(user_id: str = None) -> List[Dict]:
    checkins_ref = firestore_db.collection('checkins')
    
    # Filter by user ID if provided
    if user_id:
        checkins_ref = checkins_ref.where('userId', '==', user_id)
    
    checkins_snapshot = checkins_ref.stream()
    checkins = []
    for doc in checkins_snapshot:
        checkins.append(doc.to_dict())  # Convert Firestore document to a dictionary
    return checkins

@app.get("/analysis")
async def get_profile_analysis(user_id: str = None):
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    try:
        checkins = fetch_checkins_from_firestore(user_id)
    except Exception as e:
        # Log the error and return a 500 with a more specific error message
        print("Error fetching check-ins from Firestore:", str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch check-ins from Firestore.")
    
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
    
    # Deriving the wellness score as average mood rating (out of 5)
    wellness_score = total_mood_rating / total_checkins if total_checkins else 0
    
    # Convert timestamps to dates and map moods to them
    mood_over_time = [
        {"date": datetime.utcfromtimestamp(checkin["timestamp"] / 1000).strftime('%Y-%m-%d'), "mood": checkin["moodRating"]}
        for checkin in checkins
    ]
    
    # Sort mood_over_time by date
    mood_over_time.sort(key=lambda x: x["date"])
    
    # Mood distribution
    mood_distribution = {mood: count for mood, count in mood_counts.items()}
    
    # Word Cloud: filter out stopwords and punctuation, focus on sentiment keywords
    import string
    stopwords = set([
        "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves",
        "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
        "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while",
        "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below",
        "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how",
        "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very",
        "can", "will", "just", "don", "should", "now", "today", "yesterday", "tomorrow", "was", "were", "had", "has", "did", "does", "do"
    ])
    word_cloud = []
    for checkin in checkins:
        if checkin.get("description"):
            words = checkin["description"].split()
            for word in words:
                # Remove punctuation and lowercase
                clean_word = word.strip(string.punctuation).lower()
                if clean_word and clean_word not in stopwords and len(clean_word) > 2:
                    word_cloud.append(clean_word)
    
    # Generate AI Summary based on user's mood patterns
    ai_summary = generate_ai_summary(checkins, overall_mood, wellness_score)
    recommendations = generate_recommendations(overall_mood, wellness_score)
    
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
            "most_common": overall_mood,
            "spike_date": mood_over_time[-1]["date"] if mood_over_time else "N/A",
            "spike_reason": "Recent mood entry",
            "trend": "Stable" if wellness_score >= 3 else "Needs attention"
        },
        "word_cloud": word_cloud[:20],  # Limit to top 20 words
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

from pydantic import BaseModel
from typing import Optional


class MoodRequest(BaseModel):
    user_mood: str

def detect_mood_with_ollama(user_input: str):
    try:
        prompt = f"What is the user's emotional mood based on this input: '{user_input}'? Reply only with one word (e.g., Sad, Happy, Angry, Anxious, Neutral)."
        result = subprocess.run(
            ['ollama', 'run', 'mistral', prompt],
            capture_output=True,
            text=True,
            encoding='utf-8',              
            errors='replace',              
            timeout=30
        )
        mood = result.stdout.strip().lower()
        mood_map = {
            "sad": "sad", "unhappy": "sad", "depressed": "sad", "down": "sad",
            "happy": "happy", "excited": "happy", "joyful": "happy",
            "angry": "angry", "mad": "angry", "furious": "angry",
            "anxious": "anxious", "nervous": "anxious", "stressed": "anxious",
        }
        return mood_map.get(mood, "neutral")
    except Exception as e:
        print(f"[Ollama Error]: {str(e)}")
        return "neutral"

def get_youtube_videos(query, limit=2):
    try:
        ydl_opts = {
            'quiet': True,
            'format': 'best',
            'default_search': f'ytsearch{limit}'
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(query, download=False)
            return [f"{entry['title']}: {entry['webpage_url']}" for entry in info['entries'][:limit]]
    except Exception as e:
        return [f"Error fetching YouTube videos: {str(e)}"]

def get_news_articles(query, limit=5):
    try:
        response = requests.get(
            f"https://gnews.io/api/v4/search?q={query}&token={GNEWS_API_KEY}&max=10"
        )
        response.raise_for_status()
        data = response.json()
        articles = [
            f"[{article['title']}]({article['url']})"
            for article in data.get("articles", [])
        ]
        return articles[:limit]
    except Exception as e:
        return [f"Error fetching articles: {str(e)}"]

def get_self_care_product(mood: str):
    try:
        query = f"best self-care products for {mood} 2025"
        google_search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
        return f"Explore self-care options on Google: {google_search_url}"
    except Exception as e:
        return f"Error generating product: {str(e)}"


@app.post("/recommend")
def recommend(mood: MoodRequest):
    detected_mood = detect_mood_with_ollama(mood.user_mood)

    coping_keywords = {
        "sad": ["deal with sadness", "ways to lift mood", "cope with feeling down"],
        "anxious": ["reduce anxiety", "calm anxious mind", "relaxation for anxiety"],
        "depressed": ["beat depression", "mental health tips", "uplift mood"],
    }

    if any(x in detected_mood for x in ["sad", "anxious", "depressed"]):
        mood_key = next((x for x in coping_keywords if x in detected_mood), "sad")
        query = random.choice(coping_keywords[mood_key])
        videos = get_youtube_videos(f"motivational videos for {detected_mood}", 5)
        articles = get_news_articles(query, 5)
        product = get_self_care_product("stress relief, fidget spinner")

    elif any(x in detected_mood for x in ["happy", "excited"]):
        videos = get_youtube_videos("happy motivational videos", 5)
        articles = get_news_articles("articles about happiness", 5)
        product = get_self_care_product("celebration products, gift")

    elif "angry" in detected_mood:
        videos = get_youtube_videos("calming videos for anger", 5)
        articles = get_news_articles("how to control anger", 5)
        product = get_self_care_product("stress relief balls, calming tea")

    else:
        videos = get_youtube_videos(mood.user_mood, 5)
        articles = get_news_articles(mood.user_mood, 5)
        product = get_self_care_product(mood.user_mood)

    return {
        "detected_mood": detected_mood,
        "videos": videos,
        "articles": articles,
        "product": product
    }
