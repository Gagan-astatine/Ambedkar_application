"""Map printed pages from extracted text.
Usage: python scripts/05_map_printed_pages.py AMB-EN-V01
"""
import argparse, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

ap = argparse.ArgumentParser()
ap.add_argument("doc_id")
a = ap.parse_args()

page_dir = ROOT / "data/processed/pages" / a.doc_id
text_dir = ROOT / "data/processed/text" / a.doc_id

mapped = 0
for p in sorted(page_dir.glob("page_*.json")):
    data = json.loads(p.read_text(encoding="utf-8"))
    text_file = text_dir / data["text_file"]
    
    if text_file.exists():
        lines = text_file.read_text(encoding="utf-8").strip().split('\n')
        if lines:
            first_line = lines[0].strip()
            # Check if first line is just a number
            if first_line.isdigit():
                data["printed_page"] = int(first_line)
                p.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
                mapped += 1

print(f"{a.doc_id}: Mapped {mapped} printed pages.")
