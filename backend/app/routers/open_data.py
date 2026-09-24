import io
import csv
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from ..db import get_db

router = APIRouter(tags=["open_data"])

def map_to_dublin_core(doc):
    return {
        "identifier": doc.get("id"),
        "title": doc.get("title"),
        "creator": "Dr. B. R. Ambedkar",
        "date": doc.get("published_date") or "",
        "language": doc.get("language"),
        "type": doc.get("document_type"),
        "source": doc.get("source_institution") or "",
        "rights": "LICENSE_TO_BE_CONFIRMED",
        "description": f"Volume {doc.get('volume', '')} {f'Part {doc.get('part')}' if doc.get('part') else ''}".strip(),
        "format": "application/pdf",
        "publisher": "Ambedkar Digital Archive",
        "sha256": doc.get("sha256_hash") or ""
    }

@router.get("/documents/{doc_id}/metadata")
def get_document_metadata(doc_id: str):
    db = get_db()
    res = db.table("documents").select("*").eq("id", doc_id).execute().data
    if not res:
        raise HTTPException(404, "Document not found")
    return map_to_dublin_core(res[0])

@router.get("/export/documents.json")
def export_documents_json():
    db = get_db()
    res = db.table("documents").select("*").execute().data
    return [map_to_dublin_core(doc) for doc in res]

@router.get("/export/documents.csv")
def export_documents_csv():
    db = get_db()
    res = db.table("documents").select("*").execute().data
    
    output = io.StringIO()
    # Add BOM for Excel UTF-8 recognition
    output.write('\ufeff')
    
    if not res:
        return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=documents.csv"})
        
    dc_docs = [map_to_dublin_core(doc) for doc in res]
    fieldnames = dc_docs[0].keys()
    
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(dc_docs)
    
    # Reset pointer and yield
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=documents.csv"}
    )

@router.get("/export/works.json")
def export_works_json():
    db = get_db()
    # For now, works are just the distinct documents/volumes
    res = db.table("documents").select("id, title, volume, part").execute().data
    return res

@router.get("/export/entities.json")
def export_entities_json():
    db = get_db()
    nodes = db.table("entities").select("*").execute().data
    edges = db.table("relationships").select("*").execute().data
    return {"nodes": nodes, "links": edges}

@router.get("/export/timeline.json")
def export_timeline_json():
    db = get_db()
    events = db.table("entities").select("*").eq("type", "Event").not_.is_("year", "null").order("year").execute().data
    return events

@router.get("/health/data")
def health_data():
    db = get_db()
    documents_count = db.table("documents").select("id", count="exact").execute().count
    pages_count = db.table("document_pages").select("page_id", count="exact").execute().count
    chunks_count = db.table("document_chunks").select("chunk_id", count="exact").execute().count
    
    return {
        "documents": documents_count,
        "pages": pages_count,
        "chunks": chunks_count,
        "works": documents_count  # Placeholder for distinct works
    }
