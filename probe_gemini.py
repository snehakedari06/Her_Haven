from dotenv import load_dotenv
import os
import google.generativeai as genai
import time

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=key)
model = genai.GenerativeModel("gemini-2.0-flash")

print("Probing Gemini...")
for i in range(3):
    try:
        response = model.generate_content("Ping")
        print(f"Response {i+1} success")
    except Exception as e:
        print(f"Response {i+1} failed: {e}")
    time.sleep(2)
