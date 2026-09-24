"""Upload document row + pages + embedded chunks to Supabase.
Usage: python scripts/04_load_and_embed.py AMB-EN-V01
Needs .env (SUPABASE_*, GEMINI_API_KEY). Run supabase/schema.sql first.
"""
import argparse, json, os, sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
from google import genai

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

DIM = int(os.getenv("EMBED_DIM", "768"))
MODEL = os.getenv("EMBED_MODEL", "gemini-embedding-001")
BATCH = 50

ap = argparse.ArgumentParser()
ap.add_argument("doc_id")
a = ap.parse_args()

db = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
gem = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

vols = json.loads((ROOT / "data/metadata/volumes.json").read_text(encoding="utf-8"))
v = next((x for x in vols if x["id"] == a.doc_id), None)
if not v:
    sys.exit(f"{a.doc_id} not in volumes.json - run 01_register.py first")

db.table("documents").upsert({
    "id": v["id"], "collection_id": v["collection_id"], "title": v["title"],
    "volume": v["volume"], "part": v.get("part"), "language": v["language"],
    "document_type": v["document_type"], "source_url": v["source_url"],
    "filename": v["filename"], "sha256": v["sha256"],
}).execute()

rows = []
for pj in sorted((ROOT / "data/processed/pages" / a.doc_id).glob("page_*.json")):
    m = json.loads(pj.read_text(encoding="utf-8"))
    txt = (ROOT / "data/processed/text" / a.doc_id / m["text_file"]).read_text(encoding="utf-8")
    rows.append({"page_id": m["page_id"], "document_id": a.doc_id, "pdf_page": m["pdf_page"],
                 "printed_page": m["printed_page"], "language": m["language"],
                 "text": txt, "ocr_required": m["ocr_required"]})
for i in range(0, len(rows), 200):
    db.table("document_pages").upsert(rows[i:i+200]).execute()
print(f"pages uploaded: {len(rows)}")

chunks = [json.loads(l) for l in open(ROOT / "data/processed/chunks" / a.doc_id / "chunks.jsonl", encoding="utf-8")]
for i in range(0, len(chunks), BATCH):
    batch = chunks[i:i+BATCH]
    
    # Check if this batch is already embedded in the database
    # (Checking the first chunk of the batch is usually enough)
    existing = db.table("document_chunks").select("chunk_id").eq("chunk_id", batch[0]["chunk_id"]).execute()
    if existing.data:
        print(f"Skipping chunks {min(i+BATCH, len(chunks))}/{len(chunks)} (already embedded)")
        continue

    import time
    max_retries = 3
    for attempt in range(max_retries):
        try:
            res = gem.models.embed_content(
                model=MODEL, contents=[c["text"] for c in batch],
                config={"output_dimensionality": DIM, "task_type": "RETRIEVAL_DOCUMENT"})
            for c, e in zip(batch, res.embeddings):
                c["embedding"] = e.values
            db.table("document_chunks").upsert(batch).execute()
            print(f"chunks {min(i+BATCH, len(chunks))}/{len(chunks)}")
            time.sleep(3) # Avoid hitting RPM limit
            break
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"Quota error, retrying in 65 seconds... ({e})")
                time.sleep(65)
            else:
                raise e
