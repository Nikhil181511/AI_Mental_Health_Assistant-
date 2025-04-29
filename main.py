from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Define the model for wellness check-in
class WellnessCheckIn(BaseModel):
    mood: str
    desc: str

# Initialize FastAPI app
app = FastAPI()

# Allow CORS for frontend at localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust based on your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Mindful AI Backend!"}

# Route to handle wellness check-in data
@app.post("/checkin")
def wellness_checkin(checkin: WellnessCheckIn):
    # Process or store the data (e.g., in a database or with AI models)
    return {"message": "Wellness check-in received", "data": checkin.dict()}

# Example route to provide wellness recommendations based on mood
@app.get("/recommend/{mood}")
def get_recommendations(mood: str):
    if mood == "happy":
        recommendations = ["Go for a walk", "Listen to upbeat music"]
    elif mood == "stressed":
        recommendations = ["Practice meditation", "Take a break"]
    else:
        recommendations = ["Try some yoga", "Talk to a friend"]

    return {"recommendations": recommendations}
