import os
import uuid
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT / "backend"))
from app.db import get_db

db = get_db()

def seed_story():
    # 1. Create Story
    story_id = "STORY-AOC-01"
    story_data = {
        "id": story_id,
        "title": "The Making of Annihilation of Caste",
        "subtitle": "How a cancelled speech became a foundational text",
        "cover_image": "/images/covers/hero.jpg",
        "author": "Editorial Team",
        "status": "published"
    }
    
    # Try deleting first if exists
    db.table("stories").delete().eq("id", story_id).execute()
    db.table("stories").insert(story_data).execute()
    
    # 2. Add Beats
    beats = [
        {
            "beat_order": 1,
            "beat_type": "narrative",
            "narrative_text": "In 1936, Dr. B.R. Ambedkar was invited by the Jat-Pat-Todak Mandal of Lahore, a Hindu reformist group, to deliver a presidential address. However, upon reading the advanced draft of his speech, the committee found it too radical and cancelled the conference. Dr. Ambedkar published it himself."
        },
        {
            "beat_order": 2,
            "beat_type": "excerpt",
            "narrative_text": "Ambedkar explains the overwhelming response to the publication in his preface to the second edition.",
            "chunk_id": "AMB-EN-V01-C000047",
            "document_id": "AMB-EN-V01",
            "pdf_page": 40
        },
        {
            "beat_order": 3,
            "beat_type": "narrative",
            "narrative_text": "At the core of his critique was the idea that caste could not be reformed; it had to be annihilated. He argued that the Hindu caste system prevented true fraternity and equality."
        },
        {
            "beat_order": 4,
            "beat_type": "excerpt",
            "narrative_text": "He challenges the very foundation of the caste system and asks what an ideal society should look like.",
            "chunk_id": "AMB-EN-V01-C000111",
            "document_id": "AMB-EN-V01",
            "pdf_page": 72
        },
        {
            "beat_order": 5,
            "beat_type": "narrative",
            "narrative_text": "Ambedkar also pointed out how the caste system actively prevented the upliftment of marginalized groups like the aborigines, arguing that the need to preserve caste prevented true fellow-feeling."
        },
        {
            "beat_order": 6,
            "beat_type": "excerpt",
            "narrative_text": "Here, he explains how caste preserves isolation and prevents civilizing efforts.",
            "chunk_id": "AMB-EN-V01-C000100",
            "document_id": "AMB-EN-V01",
            "pdf_page": 68
        }
    ]
    
    for beat in beats:
        beat["story_id"] = story_id
        db.table("story_beats").insert(beat).execute()
        
    print("Seeded story successfully!")

if __name__ == "__main__":
    seed_story()
