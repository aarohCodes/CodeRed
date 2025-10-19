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
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Add a startup event to log CORS config
@app.on_event("startup")
async def startup_event():
    print("🚀 Server started with CORS enabled for localhost:3000")

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
    
    # Convert SQLAlchemy model to Pydantic model
    return FoodItem(
        name=db_item.name,
        quantity=db_item.quantity,
        expiry_date=db_item.expiry_date,
        user_id=str(db_item.user_id)
    )



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

from fastapi import UploadFile, File

@app.post("/scan_grocery_image")
async def scan_grocery_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    image_bytes = await file.read()
    from gemini_utils import analyze_grocery_image

    analysis = analyze_grocery_image(image_bytes)
    detected_items = analysis["items"]  # Each item should include name, quantity, and estimated expiry

    # Add detected items to DB
    for entry in detected_items:
        db_item = FoodItemDB(
            name=entry["name"],
            quantity=entry.get("quantity", 1),
            expiry_date=entry.get("expiry_date"),
            user_id=1  # you can set user_id as needed
        )
        db.add(db_item)
    db.commit()

    return {"items_added": detected_items, "raw_ai_response": analysis["raw_text"]}
