"""GET /api/media/{media_id} — returns signed URL + transcript."""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from ..db import get_db

router = APIRouter(prefix="/media", tags=["media"])

ROOT = Path(__file__).resolve().parent.parent.parent.parent  # project root

@router.get("")
def list_media():
    db = get_db()
    res = db.table("media").select("*").execute()
    return res.data

@router.get("/{media_id}")
def get_media(media_id: str):
    db = get_db()

    # Fetch media row
    row = db.table("media").select("*").eq("id", media_id).maybe_single().execute()
    if not row.data:
        raise HTTPException(404, f"Media '{media_id}' not found")

    media = row.data

    # Build playback URL — prefer signed Supabase Storage URL, fallback to external_url
    playback_url = media.get("external_url")
    if media.get("storage_path"):
        try:
            signed = db.storage.from_("audio").create_signed_url(
                media["storage_path"], expires_in=3600
            )
            playback_url = signed.get("signedURL") or playback_url
        except Exception:
            pass  # fall back to external_url

    # Load transcript if available
    transcript_path = ROOT / "data/processed/transcripts" / f"{media_id}.json"
    transcript = None
    if transcript_path.exists():
        transcript = json.loads(transcript_path.read_text(encoding="utf-8"))

    return {
        "media": media,
        "playback_url": playback_url,
        "transcript": transcript,
    }
