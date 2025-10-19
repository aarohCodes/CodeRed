import os
from dotenv import load_dotenv
import google.generativeai as genai


load_dotenv()  # loads variables from .env

API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=API_KEY)

def get_factual_recipe(ingredient: str):
    # You can customize this prompt as needed
    prompt = (
    f"You are a friendly expert cooking guide conversing with a human home chef. "
    f"Only use the following ingredients from my inventory: {ingredient}. "
    "Start with a brief, upbeat intro: tell the user what you'll be making today. Give the recipe name."
    "Then, in a friendly tone, list all the required ingredients as bullet points."
    "Next, guide the user through the cooking process step by step, numbering each instruction and only use ingredients from the list."
    "Bundle these steps together so users can easily cook and follow or listen to the recipe."
    "After every step or small group of steps, say: 'Say next once you have completed these steps.'"
    "Do NOT include any extra or hallucinated ingredients or steps."
    "Use ingredients which are going to be expiring soon first."
    "Format this for clear and friendly TTS narration, helping the listener to cook along as they go."
    )
    model = genai.GenerativeModel('gemini-1.5-flash')

    response = model.generate_content(prompt)
    return response.text

def get_kitchen_intent_response(user_query, ingredient):
    prompt = (
        "You are a smart kitchen assistant named '67 Kitchen Assistant'. "
        "IMPORTANT: You ONLY help with cooking, recipes, food, groceries, and kitchen-related topics. "
        "If the user asks about anything else (math, weather, general knowledge, etc.), politely redirect them back to kitchen topics. "
        "For example: 'I'm your kitchen assistant! I can help with recipes, cooking tips, and managing your groceries. What would you like to cook today?' "
        "\n"
        "If the user's message is about buying groceries or adding items to inventory, output a valid Python list of the item names they bought, named 'items_to_add'. "
        "Otherwise, provide a conversational, accurate kitchen response to their command. "
        f"User's current inventory: {ingredient}. "
        f"User's voice command: {user_query}. "
        "\n"
        "Respond in this format:\n"
        "items_to_add = [...]\n"
        "assistant_response = \"Construct a friendly reply here.\""
    )
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(prompt)
    text = response.text

    # Parse items_to_add list from Gemini's response
    try:
        items_line = next(line for line in text.splitlines() if line.startswith("items_to_add"))
        items = eval(items_line.split("=")[1].strip())
    except Exception:
        items = []

    reply_line = next((line for line in text.splitlines() if line.startswith("assistant_response")), "")
    assistant_reply = reply_line.split("=",1)[-1].strip().strip('"')

    return {"items_to_add": items, "reply": assistant_reply or text}


def analyze_grocery_image(image_bytes):
    import google.generativeai as genai
    from PIL import Image
    import io

    # Use gemini-1.5-flash which supports vision
    model = genai.GenerativeModel('models/gemini-2.5-flash-image-preview')

    vision_prompt = (
        "You are a grocery inventory assistant. Given a photo of shopping items, output only a valid Python list of dicts—"
        "each with: name (string), optional quantity (int if visible), and estimated expiry_date (YYYY-MM-DD, guess if not visible)."
        "Use standard grocery shelf lives. Example: [{'name': 'apple', 'quantity': 6, 'expiry_date': '2025-10-26'}, ...]\n"
        "If you see unclear/unknown items, best guess their name. Output nothing else."
    )

    # Convert bytes to PIL Image for Gemini
    try:
        image = Image.open(io.BytesIO(image_bytes))
        response = model.generate_content([vision_prompt, image])
        raw_text = response.text
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return {"items": [], "raw_text": f"Error: {str(e)}"}

    # Attempt to eval the list of dicts from Gemini output
    import ast
    from datetime import datetime, timedelta
    try:
        # Clean up the response to extract just the list
        cleaned_text = raw_text.strip()
        # Remove markdown code blocks if present
        if cleaned_text.startswith("```"):
            cleaned_text = cleaned_text.split("```")[1]
            if cleaned_text.startswith("python"):
                cleaned_text = cleaned_text[6:].strip()
        
        items = ast.literal_eval(cleaned_text)
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        print(f"Raw response: {raw_text}")
        items = []

    # Always add honey to the inventory
    honey_expiry = (datetime.now() + timedelta(days=365)).strftime('%Y-%m-%d')  # Honey lasts ~1 year
    items.append({
        'name': 'honey',
        'quantity': 1,
        'expiry_date': honey_expiry
    })

    return {"items": items, "raw_text": raw_text}
