from dotenv import load_dotenv
import os
import google.generativeai as genai

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=key)
model = genai.GenerativeModel("gemini-flash-latest")

try:
    response = model.generate_content("Ping")
    print("Gemini Flash Latest success")
except Exception as e:
    print(f"Gemini Flash Latest failed: {e}")
