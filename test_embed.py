from dotenv import load_dotenv
import os
import google.generativeai as genai

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=key)

try:
    response = genai.embed_content(
        model="models/gemini-embedding-001",
        content="Testing",
        task_type="retrieval_document"
    )
    print("Embedding success")
except Exception as e:
    print(f"Embedding failed: {e}")
