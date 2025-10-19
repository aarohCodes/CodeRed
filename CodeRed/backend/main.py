from fastapi import FastAPI, Depends
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import FoodItemDB, SessionLocal
from models import FoodItem
from gemini_utils import get_factual_recipe

from fastapi.responses import StreamingResponse, JSONResponse
import io

from elevenlabs_utils import text_to_speech_elevenlabs




def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev server ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic model for voice command
class VoiceMessage(BaseModel):
    message: str

food_db = []

@app.post("/add_food", response_model=FoodItem)
def add_food(item: FoodItem, db: Session = Depends(get_db)):
    db_item = FoodItemDB(
        name=item.name,
        quantity=item.quantity,
        expiry_date=item.expiry_date,
        user_id=item.user_id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@app.post("/add_food_bulk")
def add_food_bulk(items: List[FoodItem], db: Session = Depends(get_db)):
    db_items = [
        FoodItemDB(
            name=item.name,
            quantity=item.quantity,
            expiry_date=item.expiry_date,
            user_id=item.user_id
        )
        for item in items
    ]
    db.add_all(db_items)
    db.commit()
    return {"message": "Bulk food items added!", "items": items}


@app.get("/food_inventory", response_model=List[FoodItem])
def get_inventory(db: Session = Depends(get_db)):
    items = db.query(FoodItemDB).order_by(FoodItemDB.expiry_date.asc()).all()
    # Convert SQLAlchemy models to Pydantic models (and dict output)
    return [FoodItem(
                name=item.name,
                quantity=item.quantity,
                expiry_date=item.expiry_date,
                user_id=item.user_id
           ).dict() for item in items]

from gemini_utils import get_factual_recipe

@app.get("/generate_recipe")
def generate_recipe(db: Session = Depends(get_db)):
    items = db.query(FoodItemDB).all()
    ingredient_list = ", ".join([item.name for item in items])
    suggestion = get_factual_recipe(ingredient_list)
    return {"recipes": suggestion}


@app.post("/kitchen_converse")
async def kitchen_converse(request: Request, db: Session = Depends(get_db)):
    """
    Handle voice commands and return AI-generated responses with audio.
    Accepts either 'user_query' or 'message' in the request body.
    """
    payload = await request.json()
    user_query = payload.get("user_query") or payload.get("message", "")
    
    if not user_query:
        return JSONResponse({
            "text": "I didn't hear anything. What would you like to know?",
            "error": "No query provided"
        })
    
    print(f"📝 User query: {user_query}")
    
    try:
        # Get current inventory
        items = db.query(FoodItemDB).all()
        ingredient_list = ", ".join([item.name for item in items]) if items else "no ingredients currently stored"
        
        # Create context-aware prompt for Gemini
        prompt = f"""You are a friendly kitchen assistant named Kitchen AI. The user has the following ingredients: {ingredient_list}

User asked: "{user_query}"

Provide a helpful, conversational response (2-4 sentences) that:
- Directly answers their question
- Is warm and friendly
- Suggests recipes using their available ingredients when relevant
- Keeps it concise and natural for voice playback

Response:"""
        
        # Get response from Gemini
        print("🤖 Calling Gemini AI...")
        gemini_reply = get_factual_recipe(prompt)
        print(f"✅ Gemini response: {gemini_reply[:100]}...")
        
        # Call ElevenLabs to convert text to speech
        print("🎤 Generating audio with ElevenLabs...")
        audio_bytes = text_to_speech_elevenlabs(gemini_reply)
        
        # Convert audio bytes to base64 for safe JSON transmission
        import base64
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
        print(f"✅ Audio encoded to base64 ({len(audio_base64)} chars)")
        
        return JSONResponse({
            "text": gemini_reply,
            "audio_base64": audio_base64,
            "user_message": user_query,
            "ingredients_available": ingredient_list
        })
    
    except Exception as e:
        print(f"❌ Error in kitchen_converse: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return JSONResponse({
            "text": f"Sorry, I encountered an error: {str(e)}",
            "user_message": user_query,
            "error": str(e)
        }, status_code=500)
