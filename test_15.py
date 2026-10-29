from dotenv import load_dotenv
import os
import google.generativeai as genai

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=key)
model = genai.GenerativeModel("gemini-1.5-flash")

try:
    response = model.generate_content("Ping")
    print("Gemini 1.5 Flash success")
except Exception as e:
    print(f"Gemini 1.5 Flash failed: {e}")
