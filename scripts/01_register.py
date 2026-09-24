"""Register a raw PDF: compute SHA-256 and add it to data/metadata/volumes.json.
Usage:
  python scripts/01_register.py AMB-EN-V01 data/raw/documents/english/volume_01.pdf \
      --lang English --volume 1 --source-url "https://..."
Volumes with parts: doc id AMB-EN-V05-PT1, --volume 5 --part 1
"""
import argparse, hashlib, json, os
from pathlib import Path
from dotenv import load_dotenv
import fitz
from llm_client import generate_text

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

VOL_JSON = ROOT / "data/metadata/volumes.json"

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()

def extract_title_with_ai(pdf_path: Path) -> str:
    print("Extracting dynamic title using AI (with fallback)...")
    try:
        doc = fitz.open(pdf_path)
        # In case the first page is blank, grab up to 3 pages
        text_sample = ""
        for i in range(min(3, len(doc))):
            text_sample += doc[i].get_text("text") + "\n"
        
        prompt = (
            "Extract ONLY the precise book/document title from this first few pages of a document. "
            "Do not include quotes, subtitles, or conversational text. "
            "If no clear title exists, just reply with 'Dr. Babasaheb Ambedkar Writings and Speeches'.\n\n"
            + text_sample[:2000]
        )
        return generate_text(prompt)
    except Exception as e:
        print(f"Warning: All providers failed for title extraction, using default. ({e})")
        return "Dr. Babasaheb Ambedkar Writings and Speeches"

ap = argparse.ArgumentParser()
ap.add_argument("doc_id")
ap.add_argument("pdf")
ap.add_argument("--lang", default="English")
ap.add_argument("--volume", type=int, required=True)
ap.add_argument("--part", type=int, default=None)
ap.add_argument("--source-url", default="")
a = ap.parse_args()

pdf = Path(a.pdf)

dynamic_title = extract_title_with_ai(pdf)

entry = {
    "id": a.doc_id,
    "collection_id": "AMB-WAS",
    "title": dynamic_title,
    "volume": a.volume,
    "part": a.part,
    "language": a.lang,
    "document_type": "Primary Source",
    "source_url": a.source_url,
    "filename": pdf.name,
    "path": str(pdf),
    "size_bytes": pdf.stat().st_size,
    "sha256": sha256(pdf),
}
vols = json.loads(VOL_JSON.read_text(encoding="utf-8"))
vols = [v for v in vols if v["id"] != a.doc_id] + [entry]
VOL_JSON.write_text(json.dumps(vols, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Registered {a.doc_id} with title '{dynamic_title}', sha256={entry['sha256'][:16]}...")
