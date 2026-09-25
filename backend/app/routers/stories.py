from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import List, Optional
import uuid
from ..db import get_db

router = APIRouter(prefix="/stories", tags=["stories"])

class StoryCreate(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = None
    cover_image: Optional[str] = None
    author: Optional[str] = None
    status: str = "draft"

class BeatCreate(BaseModel):
    beat_order: int
    beat_type: str
    narrative_text: Optional[str] = None
    chunk_id: Optional[str] = None
    document_id: Optional[str] = None
    pdf_page: Optional[int] = None
    timeline_id: Optional[str] = None
    media_id: Optional[str] = None

def get_admin_token(authorization: str = Header(None)):
    if authorization != "Bearer ADMIN_SECRET":
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.get("")
def list_stories(status: Optional[str] = "published"):
    db = get_db()
    query = db.table("stories").select("*")
    if status:
        query = query.eq("status", status)
    res = query.execute()
    return res.data

@router.get("/{story_id}")
def get_story(story_id: str):
    db = get_db()
    # Get story
    story_res = db.table("stories").select("*").eq("id", story_id).execute()
    if not story_res.data:
        raise HTTPException(status_code=404, detail="Story not found")
    story = story_res.data[0]
    
    # Get beats
    beats_res = db.table("story_beats").select("*").eq("story_id", story_id).order("beat_order").execute()
    beats = beats_res.data
    
    # Resolve excerpt beats
    for beat in beats:
        if beat["beat_type"] == "excerpt" and beat["chunk_id"]:
            chunk_res = db.table("document_chunks").select("text").eq("chunk_id", beat["chunk_id"]).execute()
            if chunk_res.data:
                beat["excerpt_text"] = chunk_res.data[0]["text"]
        elif beat["beat_type"] == "media" and beat["media_id"]:
            media_res = db.table("media").select("*").eq("id", beat["media_id"]).execute()
            if media_res.data:
                beat["media"] = media_res.data[0]
        elif beat["beat_type"] == "timeline_ref" and beat["timeline_id"]:
            time_res = db.table("timeline_events").select("*").eq("id", beat["timeline_id"]).execute()
            if time_res.data:
                beat["timeline_event"] = time_res.data[0]
                
    story["beats"] = beats
    return story

@router.post("")
def create_story(story: StoryCreate, _=Depends(get_admin_token)):
    db = get_db()
    res = db.table("stories").insert(story.dict()).execute()
    return res.data[0]

@router.post("/{story_id}/beats")
def create_story_beat(story_id: str, beat: BeatCreate, _=Depends(get_admin_token)):
    db = get_db()
    data = beat.dict()
    data["story_id"] = story_id
    res = db.table("story_beats").insert(data).execute()
    return res.data[0]
