from pydantic import BaseModel
from datetime import date
from typing import Optional

class FoodItem(BaseModel):
    name: str
    quantity: int
    expiry_date: Optional[date] = None
    user_id: str
