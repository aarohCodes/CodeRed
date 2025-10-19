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
    model = genai.GenerativeModel('models/gemini-2.5-flash')

    response = model.generate_content(prompt)
    return response.text

def get_kitchen_intent_response(user_query, ingredient):
    prompt = (
        "You are a smart kitchen assistant. "
        "If the user's message is about buying groceries, output a valid Python list of the item names they bought, named 'items_to_add'. "
        "Otherwise, provide a conversational, accurate kitchen response to their command. "
        f"User's inventory: {ingredient}. "
        f"User's voice command: {user_query}. "
        "Respond in this format:\n"
        "items_to_add = [...]\n"
        "assistant_response = \"Construct a friendly reply here.\""
    )
    model = genai.GenerativeModel('models/gemini-2.5-flash')
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
