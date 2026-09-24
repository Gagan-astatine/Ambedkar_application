from fastapi import APIRouter
from ..db import get_db

router = APIRouter(tags=["timeline"])

@router.get("/timeline")
def get_timeline():
    db = get_db()
    # Get all events ordered by year
    events = db.table("entities").select("*").eq("type", "Event").not_.is_("year", "null").order("year").execute().data
    
    # For each event, get its relationships to find related people, topics, docs
    event_ids = [e["id"] for e in events]
    if not event_ids:
        return []
        
    # Get all relationships where the event is involved
    out_rels = db.table("relationships").select("*, target:entities!relationships_target_id_fkey(*)").in_("source_id", event_ids).execute().data
    in_rels = db.table("relationships").select("*, source:entities!relationships_source_id_fkey(*)").in_("target_id", event_ids).execute().data
    
    for event in events:
        event["related"] = []
        for r in out_rels:
            if r["source_id"] == event["id"]:
                r["target"]["evidence"] = {"doc": r["evidence_document_id"], "page": r["evidence_page"]}
                event["related"].append(r["target"])
        for r in in_rels:
            if r["target_id"] == event["id"]:
                r["source"]["evidence"] = {"doc": r["evidence_document_id"], "page": r["evidence_page"]}
                event["related"].append(r["source"])
                
    return events
