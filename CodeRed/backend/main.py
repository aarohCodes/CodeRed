from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import FoodItemDB, SessionLocal
from models import FoodItem
from gemini_utils import get_factual_recipe




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
async def kitchen_converse(voice_msg: VoiceMessage, db: Session = Depends(get_db)):
    """
    Handle voice commands and return AI-generated responses using Gemini.
    """
    user_message = voice_msg.message.lower()
    
    try:
        # Get current inventory
        items = db.query(FoodItemDB).all()
        ingredient_list = ", ".join([item.name for item in items]) if items else "no ingredients"
        
        # Create context-aware prompt for Gemini
        prompt = f"""You are a helpful kitchen assistant. The user has the following ingredients in their kitchen: {ingredient_list}

User's voice command: {voice_msg.message}

Provide a helpful, concise response (2-3 sentences max) that:
- Answers their question or follows their command
- Relates to cooking, recipes, or kitchen management
- Uses their available ingredients when relevant
- Is friendly and conversational

Response:"""
        
        # Get response from Gemini
        from gemini_utils import get_factual_recipe
        response = get_factual_recipe(prompt)
        
        return {
            "response": response,
            "user_message": voice_msg.message,
            "ingredients_available": ingredient_list
        }
    
    except Exception as e:
        return {
            "response": f"Sorry, I encountered an error: {str(e)}",
            "user_message": voice_msg.message,
            "error": str(e)
        }
