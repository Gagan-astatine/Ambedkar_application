import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv("../../.env")
print("API KEY:", os.getenv("GEMINI_API_KEY"))
gem = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
res = gem.models.embed_content(
    model="gemini-embedding-2", 
    contents="when was ambedkar born", 
    config=types.EmbedContentConfig(output_dimensionality=768, task_type="RETRIEVAL_QUERY")
)
print(res.embeddings[0].values[:5])
