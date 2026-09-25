import os
from google import genai
from dotenv import load_dotenv

load_dotenv("../../.env")
gem = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

for model in gem.models.list():
    if "embed" in model.name:
        print(model.name)
