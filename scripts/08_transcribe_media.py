"""
scripts/08_transcribe_media.py
Transcribe an audio file with Whisper, chunk the transcript, embed it with the
same Gemini embedding function used for PDF chunks, and upsert into Supabase.

Usage:
    python scripts/08_transcribe_media.py AMB-AUD-001

Requirements:
    pip install openai-whisper
    ffmpeg must be installed and on PATH (needed by Whisper for mp3 decoding).
    Windows: winget install --id Gyan.FFmpeg  OR  choco install ffmpeg
"""

import argparse, json, os, sys, time
from pathlib import Path
from datetime import date
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

# ── Config ──────────────────────────────────────────────────────────────────
CHUNK_TARGET_SEC  = 35   # target chunk duration (seconds)
CHUNK_MAX_SEC     = 50   # hard ceiling
MIN_CHUNK_CHARS   = 40   # discard very short segments
WHISPER_MODEL     = "small"
DIM               = int(os.getenv("EMBED_DIM", "768"))
EMBED_MODEL       = os.getenv("EMBED_MODEL", "gemini-embedding-001")
BATCH             = 20   # embeddings per API call (audio chunks are long)

# ── CLI ──────────────────────────────────────────────────────────────────────
ap = argparse.ArgumentParser()
ap.add_argument("media_id", help="e.g. AMB-AUD-001")
ap.add_argument("--skip-transcribe", action="store_true",
                help="Load existing transcript JSON, skip Whisper")
ap.add_argument("--skip-embed", action="store_true",
                help="Skip embedding+upsert (dry run)")
a = ap.parse_args()

# ── Load media metadata ──────────────────────────────────────────────────────
media_file = ROOT / "data/metadata/media.json"
media_list = json.loads(media_file.read_text(encoding="utf-8"))
entry = next((m for m in media_list if m["id"] == a.media_id), None)
if not entry:
    sys.exit(f"❌  {a.media_id} not found in data/metadata/media.json")

audio_path = ROOT / "data/raw/media" / entry["file"]
if not audio_path.exists():
    sys.exit(f"❌  Audio file not found: {audio_path}")

print(f"✅  Found audio: {audio_path} ({audio_path.stat().st_size / 1024:.1f} KB)")

# ── Transcript output path ───────────────────────────────────────────────────
transcript_dir = ROOT / "data/processed/transcripts"
transcript_dir.mkdir(parents=True, exist_ok=True)
transcript_path = transcript_dir / f"{a.media_id}.json"

# ── Step 1: Transcribe ───────────────────────────────────────────────────────
if not a.skip_transcribe:
    # Inject ffmpeg path explicitly so terminal restarts aren't required
    ffmpeg_bin = r"C:\Users\Gagan P\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin"
    if os.path.exists(ffmpeg_bin):
        os.environ["PATH"] += os.pathsep + ffmpeg_bin

    import shutil
    if not shutil.which("ffmpeg"):
        print("\n⚠️   ffmpeg not found on PATH.")
        print("     Whisper needs ffmpeg to decode mp3 files.")
        print("     Install it on Windows with:")
        print("       winget install --id Gyan.FFmpeg")
        print("     OR:  choco install ffmpeg")
        print("     Then restart your terminal and re-run this script.\n")
        sys.exit(1)

    try:
        import whisper
    except ImportError:
        sys.exit("❌  openai-whisper not installed. Run: pip install openai-whisper")

    print(f"\n🎙️  Loading Whisper model '{WHISPER_MODEL}'…")
    model = whisper.load_model(WHISPER_MODEL)

    print("🎙️  Transcribing (forced English)...")
    result = model.transcribe(str(audio_path), language="en", verbose=False)

    # Report detected language from first segments
    detected_lang = result.get("language", "en")
    print(f"\n🌐  Detected language: {detected_lang}")
    print("\n── First 3 Whisper segments (for sanity check) ──────────────────")
    for seg in result["segments"][:3]:
        ts = lambda s: f"{int(s)//60:02d}:{int(s)%60:02d}"
        print(f"  [{ts(seg['start'])} → {ts(seg['end'])}]  {seg['text'].strip()}")
    print("─────────────────────────────────────────────────────────────────\n")

    # Save full transcript
    transcript_data = {
        "media_id": a.media_id,
        "detected_language": detected_lang,
        "transcribed_at": date.today().isoformat(),
        "whisper_model": WHISPER_MODEL,
        "status": "auto_transcribed_unreviewed",
        "segments": [
            {
                "id": seg["id"],
                "start": round(seg["start"], 2),
                "end":   round(seg["end"], 2),
                "text":  seg["text"].strip(),
            }
            for seg in result["segments"]
        ]
    }
    transcript_path.write_text(
        json.dumps(transcript_data, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"💾  Transcript saved: {transcript_path}")
    print(f"    Total segments : {len(transcript_data['segments'])}")
    total_dur = result["segments"][-1]["end"] if result["segments"] else 0
    print(f"    Audio duration : {int(total_dur)//60}m {int(total_dur)%60}s\n")
else:
    if not transcript_path.exists():
        sys.exit(f"❌  No transcript found at {transcript_path}. Remove --skip-transcribe.")
    transcript_data = json.loads(transcript_path.read_text(encoding="utf-8"))
    detected_lang = transcript_data.get("detected_language", "unknown")
    print(f"📂  Loaded existing transcript ({len(transcript_data['segments'])} segments)")

# ── Step 2: Chunk segments into ~30-45s groups ───────────────────────────────
def chunk_segments(segments, target_sec=CHUNK_TARGET_SEC, max_sec=CHUNK_MAX_SEC):
    chunks = []
    buf_segs = []
    buf_start = None
    buf_dur = 0.0

    for seg in segments:
        dur = seg["end"] - seg["start"]
        if buf_start is None:
            buf_start = seg["start"]

        # If adding this segment exceeds the max, flush first
        if buf_dur + dur > max_sec and buf_segs:
            chunks.append(buf_segs)
            buf_segs = []
            buf_start = seg["start"]
            buf_dur = 0.0

        buf_segs.append(seg)
        buf_dur += dur

        # Flush when we hit target and are at a sentence boundary
        text_so_far = " ".join(s["text"] for s in buf_segs)
        at_sentence_end = text_so_far.rstrip().endswith((".", "?", "!"))
        if buf_dur >= target_sec and at_sentence_end:
            chunks.append(buf_segs)
            buf_segs = []
            buf_start = None
            buf_dur = 0.0

    if buf_segs:
        chunks.append(buf_segs)

    return chunks

segment_chunks = chunk_segments(transcript_data["segments"])
print(f"✂️   Created {len(segment_chunks)} chunks from {len(transcript_data['segments'])} segments")

# Build chunk dicts
chunks = []
for idx, segs in enumerate(segment_chunks):
    text = " ".join(s["text"] for s in segs).strip()
    if len(text) < MIN_CHUNK_CHARS:
        continue
    t_start = round(segs[0]["start"], 2)
    t_end   = round(segs[-1]["end"],   2)
    chunks.append({
        "chunk_id":        f"{a.media_id}-C{idx+1:06d}",
        "document_id":     a.media_id,
        "pdf_page":        0,          # not applicable for audio; 0 placeholder
        "chunk_index":     idx,
        "text":            text,
        "language":        detected_lang,
        "token_estimate":  len(text) // 4,
        "media_type":      "audio",
        "timestamp_start": t_start,
        "timestamp_end":   t_end,
    })

print(f"    Kept {len(chunks)} chunks after filtering short ones")

if a.skip_embed:
    print("⏭️   Skipping embed/upsert (--skip-embed flag set)")
    sys.exit(0)

# ── Step 3: Embed + upsert ───────────────────────────────────────────────────
from supabase import create_client
from google import genai

db  = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
gem = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

print("\n🔢  Embedding chunks…")
for i in range(0, len(chunks), BATCH):
    batch = chunks[i : i + BATCH]
    texts = [c["text"] for c in batch]

    max_retries = 3
    for attempt in range(max_retries):
        try:
            res = gem.models.embed_content(
                model=EMBED_MODEL,
                contents=texts,
                config={"output_dimensionality": DIM, "task_type": "RETRIEVAL_DOCUMENT"}
            )
            for c, emb in zip(batch, res.embeddings):
                c["embedding"] = emb.values
            db.table("document_chunks").upsert(batch).execute()
            print(f"  chunks {min(i + BATCH, len(chunks))}/{len(chunks)} upserted")
            time.sleep(3)
            break
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"  Quota error, retrying in 65s… ({e})")
                time.sleep(65)
            else:
                raise

# ── Step 4: Upsert media row ──────────────────────────────────────────────────
media_row = {
    "id":           entry["id"],
    "type":         entry["type"],
    "title":        entry["title"],
    "description":  entry.get("description"),
    "year":         entry.get("year"),
    "language":     detected_lang,
    "external_url": entry.get("external_url"),
    "source":       entry.get("source"),
    "license":      entry.get("license"),
    "retrieved_on": entry.get("retrieved_on"),
    "status":       "needs_review",
}
db.table("media").upsert(media_row).execute()
print(f"\n✅  Media row upserted: {entry['id']} (status=needs_review)")

# ── Step 5: Upload audio to Supabase Storage ─────────────────────────────────
print(f"\n☁️   Uploading audio to Supabase Storage (bucket: audio)…")
try:
    storage_key = f"{entry['id']}/{audio_path.name}"
    with open(audio_path, "rb") as f:
        db.storage.from_("audio").upload(
            path=storage_key,
            file=f,
            file_options={"content-type": "audio/mpeg", "upsert": "true"}
        )
    # Update storage_path in media row
    db.table("media").update({"storage_path": storage_key}).eq("id", entry["id"]).execute()
    print(f"✅  Uploaded: {storage_key}")
except Exception as e:
    print(f"⚠️   Storage upload failed (bucket may not exist yet): {e}")
    print("     Create an 'audio' bucket in Supabase Storage and re-run.")

print("\n🏁  Done. Status is 'needs_review' — review transcript before approving.")
print(f"    Transcript file: {transcript_path}")
print(f"\n── 3 sample chunks ──────────────────────────────────────────────────")
ts = lambda s: f"{int(s)//60:02d}:{int(s)%60:02d}"
for c in chunks[:3]:
    print(f"  [{ts(c['timestamp_start'])} → {ts(c['timestamp_end'])}]")
    print(f"  {c['text'][:120]}…\n")
