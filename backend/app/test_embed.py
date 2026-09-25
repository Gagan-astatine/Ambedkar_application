import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv("../../.env")
gem = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
try:
    res = gem.models.embed_content(
        model="gemini-embedding-2", 
        contents="when was ambedkar born", 
        config=types.EmbedContentConfig(output_dimensionality=768, task_type="RETRIEVAL_QUERY")
    )
    print("gemini-embedding-2 SUCCESS, dims:", len(res.embeddings[0].values))
except Exception as e:
    print("gemini-embedding-2 FAILED:", e)

try:
    res = gem.models.embed_content(
        model="gemini-embedding-001", 
        contents="when was ambedkar born", 
        config=types.EmbedContentConfig(output_dimensionality=768, task_type="RETRIEVAL_QUERY")
    )
    print("gemini-embedding-001 SUCCESS, dims:", len(res.embeddings[0].values))
except Exception as e:
    print("gemini-embedding-001 FAILED:", e)
