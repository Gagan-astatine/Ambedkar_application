"""Extract per-page text + page JSON from a PDF (PyMuPDF).
Usage: python scripts/02_extract_pages.py AMB-EN-V01 data/raw/documents/english/volume_01.pdf --lang English
Outputs:
  data/processed/text/<DOC>/page_0001.txt
  data/processed/pages/<DOC>/page_0001.json
Pages with almost no text get ocr_required=true.
"""
import argparse, json, re
from pathlib import Path
import fitz  # PyMuPDF
import pytesseract
from PIL import Image

# Point to the Tesseract installation
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

ROOT = Path(__file__).resolve().parent.parent
OCR_THRESHOLD = 40  # chars

def clean(t: str) -> str:
    t = t.replace("\u00ad", "")
    t = re.sub(r"-\n(\w)", r"\1", t)
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()

ap = argparse.ArgumentParser()
ap.add_argument("doc_id")
ap.add_argument("pdf")
ap.add_argument("--lang", default="English")
a = ap.parse_args()

text_dir = ROOT / "data/processed/text" / a.doc_id
page_dir = ROOT / "data/processed/pages" / a.doc_id
text_dir.mkdir(parents=True, exist_ok=True)
page_dir.mkdir(parents=True, exist_ok=True)

doc = fitz.open(a.pdf)
ocr_pages = 0
for i, page in enumerate(doc, start=1):
    text = clean(page.get_text("text"))
    ocr = len(text) < OCR_THRESHOLD
    
    if ocr:
        print(f"Running OCR on page {i}...")
        pix = page.get_pixmap(dpi=300)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        ocr_text = pytesseract.image_to_string(img, lang="eng")
        text = clean(ocr_text)
        if not text:
            text = "[Blank or graphical page]"
        ocr = False # Text successfully extracted or confirmed blank
        ocr_pages += 1
        
    fname = f"page_{i:04d}.txt"
    (text_dir / fname).write_text(text, encoding="utf-8")
    meta = {
        "page_id": f"{a.doc_id}-P{i:04d}",
        "document_id": a.doc_id,
        "pdf_page": i,
        "printed_page": None,
        "language": a.lang,
        "text_file": fname,
        "char_count": len(text),
        "ocr_required": ocr,
    }
    (page_dir / f"page_{i:04d}.json").write_text(
        json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")

print(f"{a.doc_id}: {len(doc)} pages, {ocr_pages} need OCR")
