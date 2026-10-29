from dotenv import load_dotenv
import os
from groq import Groq

load_dotenv()
key = os.getenv("GROQ_API_TOKEN")
client = Groq(api_key=key)

print("Probing Groq...")
try:
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": "Ping",
            }
        ],
        model="llama-3.1-8b-instant",
    )
    print("Groq success:", chat_completion.choices[0].message.content)
except Exception as e:
    print("Groq failed:", e)
