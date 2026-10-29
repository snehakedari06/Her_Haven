import os

import google.generativeai as genai
from dotenv import load_dotenv
from groq import Groq

from backend.prompts import (INSPIRATION_POEM_PROMPT,
                             USER_POST_TEXT_DECOMPOSITION_PROMPT,
                             USER_POST_TEXT_EXPANSION_PROMPT)

load_dotenv()


async def expand_user_text_using_gemini(user_input):
    # First try Gemini
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(
            f"{USER_POST_TEXT_EXPANSION_PROMPT}. The data is {user_input}"
        )
        if hasattr(response, 'text') and response.text:
            print("Gemini response OK")
            return response.text
    except Exception as e:
        print(f"Gemini failed, falling back to Groq 70b: {e}")

    # Fallback to Groq Llama 70b (smarter model for the 'Gemini' box)
    try:
        client = Groq(api_key=os.getenv("GROQ_API_TOKEN"))
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": f"{USER_POST_TEXT_EXPANSION_PROMPT}. The data is {user_input}",
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        print("Groq 70b fallback OK")
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Groq 70b also failed: {e}")
        return None


async def expand_user_text_using_gemma(user_input):
    try:
        client = Groq(api_key=os.getenv("GROQ_API_TOKEN"))

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": f"{USER_POST_TEXT_EXPANSION_PROMPT}. The data is {user_input}",
                }
            ],
            model="llama-3.1-8b-instant",
        )

        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Groq expansion failed: {e}")
        return None


def text_to_image(user_input):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    models = genai.list_models()
    for model in models:
        print(
            f"Model Name: {model.name}, Supported Methods: {model.supported_generation_methods}"
        )

    # imagen = genai.ImageGenerationModel("imagen-3.0-generate-001")
    # result = imagen.generate_images(prompt="Fuzzy bunnies in my kitchen", number_of_images=4)
    # for image in result.images:
    #     print(image)

    # for image in result.images:
    # # Open and display the image using your local operating system.
    #     image._pil_image.show()


def decompose_user_text(user_input):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    print("before decompose: ", user_input)
    model = genai.GenerativeModel("gemini-flash-latest")
    response = model.generate_content(
        f"{USER_POST_TEXT_DECOMPOSITION_PROMPT}. The data is {user_input}"
    )
    print("after decompose: ", response.text)
    return response.text


def create_poem(user_input):
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

    model = genai.GenerativeModel("gemini-flash-latest")
    response = model.generate_content(
        f"{INSPIRATION_POEM_PROMPT}. The data is {user_input}"
    )
    print(response.text)
    return response.text
