from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from pydantic import BaseModel
import base64

from database import FoodItemDB, SessionLocal
from models import FoodItem
from gemini_utils import get_factual_recipe, get_kitchen_intent_response

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
    allow_origins=["*"],  # Allow all origins including local file:// protocol
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
    items = db.query(FoodItemDB).all()
    # Convert SQLAlchemy models to Pydantic models
    return [FoodItem(
                name=item.name,
                quantity=item.quantity,
                expiry_date=item.expiry_date if item.expiry_date else None,
                user_id=str(item.user_id)
           ) for item in items]

from gemini_utils import get_factual_recipe

@app.get("/generate_recipe")
def generate_recipe(db: Session = Depends(get_db)):
    items = db.query(FoodItemDB).all()
    ingredient_list = ", ".join([item.name for item in items])
    suggestion = get_factual_recipe(ingredient_list)
    return {"recipes": suggestion}


@app.post("/kitchen_converse")
async def kitchen_converse(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    user_query = payload.get("user_query") or payload.get("message", "")

    items = db.query(FoodItemDB).all()
    ingredient_list = ", ".join([item.name for item in items]) if items else "no ingredients currently stored"

    intent_info = get_kitchen_intent_response(user_query, ingredient_list)

    # Add to DB if Gemini detects items
    if intent_info["items_to_add"]:
        for item_name in intent_info["items_to_add"]:
            db_item = FoodItemDB(
                name=item_name,
                quantity=1,  # You can parse quantity, too, if Gemini outputs it!
                expiry_date=None,  # Can ask Gemini for "standard" expiry per item
                user_id=1       # Set user_id appropriately
            )
            db.add(db_item)
        db.commit()

    audio_bytes = text_to_speech_elevenlabs(intent_info["reply"])
    audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

    return JSONResponse({
        "text": intent_info["reply"],
        "audio_base64": audio_base64,
        "added_items": intent_info["items_to_add"]
    })
