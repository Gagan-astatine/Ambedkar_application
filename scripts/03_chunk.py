"""Chunk page text WITHOUT crossing page boundaries (keeps citations exact).
Usage: python scripts/03_chunk.py AMB-EN-V01 --lang English
Output: data/processed/chunks/<DOC>/chunks.jsonl
"""
import argparse, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAX_CHARS = 1800
MIN_CHARS = 80

def split_page(text: str):
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunk, out = "", []
    for p in paras:
        if len(chunk) + len(p) + 2 <= MAX_CHARS:
            chunk = f"{chunk}\n\n{p}".strip()
        else:
            if chunk:
                out.append(chunk)
            while len(p) > MAX_CHARS:
                out.append(p[:MAX_CHARS]); p = p[MAX_CHARS:]
            chunk = p
    if chunk:
        out.append(chunk)
    return [c for c in out if len(c) >= MIN_CHARS]

ap = argparse.ArgumentParser()
ap.add_argument("doc_id")
ap.add_argument("--lang", default="English")
a = ap.parse_args()

text_dir = ROOT / "data/processed/text" / a.doc_id
out_dir = ROOT / "data/processed/chunks" / a.doc_id
out_dir.mkdir(parents=True, exist_ok=True)

n = 0
with open(out_dir / "chunks.jsonl", "w", encoding="utf-8") as f:
    for p in sorted(text_dir.glob("page_*.txt")):
        pdf_page = int(p.stem.split("_")[1])
        for idx, c in enumerate(split_page(p.read_text(encoding="utf-8"))):
            n += 1
            f.write(json.dumps({
                "chunk_id": f"{a.doc_id}-C{n:06d}",
                "document_id": a.doc_id,
                "pdf_page": pdf_page,
                "chunk_index": idx,
                "text": c,
                "language": a.lang,
                "token_estimate": len(c) // 4,
            }, ensure_ascii=False) + "\n")
print(f"{a.doc_id}: {n} chunks")
