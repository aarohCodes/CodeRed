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