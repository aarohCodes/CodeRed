from pydantic import BaseModel
from datetime import date

class FoodItem(BaseModel):
    name: str
    quantity: int
    expiry_date: date
    user_id: str
