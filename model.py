from pydantic import BaseModel

# Model to represent wellness check-in data
class WellnessCheckIn(BaseModel):
    mood: str
    stress_level: int
    sleep_quality: str
