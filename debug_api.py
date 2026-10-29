from dotenv import load_dotenv
import os
import google.generativeai as genai

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
print(f"Key: {key[:5]}...{key[-5:]}" if key else "Key not found")

genai.configure(api_key=key)
model = genai.GenerativeModel("gemini-1.5-flash")
try:
    response = model.generate_content("Hi")
    print("Gemini Test Success:", response.text)
except Exception as e:
    print("Gemini Test Failed:", e)
