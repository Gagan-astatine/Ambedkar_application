from fastapi import APIRouter, HTTPException
from ..db import get_db

router = APIRouter(tags=["entities"])

@router.get("/entities")
def list_entities(type: str | None = None):
    db = get_db()
    q = db.table("entities").select("*")
    if type:
        q = q.eq("type", type)
    res = q.execute()
    return res.data

@router.get("/entities/{id}")
def get_entity(id: str):
    db = get_db()
    # Get entity
    res = db.table("entities").select("*").eq("id", id).execute()
    if not res.data:
        raise HTTPException(404, "Entity not found")
    entity = res.data[0]
    
    # Get relationships (both incoming and outgoing)
    out_rels = db.table("relationships").select("*, target:entities!relationships_target_id_fkey(*)").eq("source_id", id).execute().data
    in_rels = db.table("relationships").select("*, source:entities!relationships_source_id_fkey(*)").eq("target_id", id).execute().data
    
    entity["relationships"] = {
        "outgoing": out_rels,
        "incoming": in_rels
    }
    
    # Try getting evidence context if available
    return entity

@router.get("/graph")
def get_graph():
    db = get_db()
    nodes = db.table("entities").select("*").execute().data
    edges = db.table("relationships").select("*").execute().data
    return {"nodes": nodes, "links": edges}
