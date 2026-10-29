import asyncio
import os
from dotenv import load_dotenv
from backend.utils.text_llm import expand_user_text_using_gemini

async def test():
    load_dotenv()
    print("Key exists:", bool(os.getenv("GEMINI_API_KEY")))
    try:
        res = await expand_user_text_using_gemini("Help me I am scared")
        print("Result:", res)
    except Exception as e:
        print("Error:", e)
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
