import os, sys, argparse
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

ap = argparse.ArgumentParser()
ap.add_argument("doc_id")
ap.add_argument("pdf_path")
a = ap.parse_args()

db = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

try:
    db.storage.create_bucket("documents")
except Exception:
    pass

pdf_path = Path(a.pdf_path)
storage_path = f"english/{a.doc_id}.pdf"

try:
    with open(pdf_path, 'rb') as f:
        db.storage.from_("documents").upload(storage_path, f.read())
    print(f"Uploaded {pdf_path.name} to 'documents/{storage_path}'.")
except Exception as e:
    # might already exist
    print("Upload error (or already exists):", e)

# Update the database row so the frontend knows where the file is!
db.table("documents").update({"storage_path": storage_path}).eq("id", a.doc_id).execute()
print(f"Updated database storage_path for {a.doc_id}")
