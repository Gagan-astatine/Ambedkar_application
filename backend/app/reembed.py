import os, sys, time
from supabase import create_client
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv("../../.env")
db = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
gem = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Fetch all chunks
print("Fetching all chunks...")
res = db.table("document_chunks").select("chunk_id, text, document_id, pdf_page, media_type, timestamp_start, timestamp_end").execute()
chunks = res.data
print(f"Fetched {len(chunks)} chunks.")

BATCH = 20
for i in range(0, len(chunks), BATCH):
    batch = chunks[i:i+BATCH]
    print(f"Embedding {i} to {i+len(batch)}...")
    texts = [c["text"] for c in batch]
    
    # Embed
    emb_res = gem.models.embed_content(
        model="gemini-embedding-2", 
        contents=texts, 
        config=types.EmbedContentConfig(output_dimensionality=768, task_type="RETRIEVAL_DOCUMENT")
    )
    
    # Update objects
    for idx, c in enumerate(batch):
        c["embedding"] = emb_res.embeddings[idx].values
        
    # Upsert to Supabase
    db.table("document_chunks").upsert(batch).execute()
    print("Upserted batch.")
    time.sleep(1)

print("Re-embedding complete!")
