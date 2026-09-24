import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from ..db import get_db

router = APIRouter(tags=["documents"])

@router.get("/documents")
def list_documents(language: str | None = None, limit: int = 50):
    q = get_db().table("documents").select("*").limit(limit)
    if language:
        q = q.eq("language", language)
    return q.execute().data

@router.get("/documents/{doc_id}")
def get_document(doc_id: str):
    db = get_db()
    res = db.table("documents").select("*").eq("id", doc_id).execute().data
    if not res:
        raise HTTPException(404, "Document not found")
    
    doc = res[0]
    if doc.get("storage_path"):
        try:
            public_url = db.storage.from_("documents").get_public_url(doc["storage_path"])
            doc["signed_pdf_url"] = public_url
        except Exception:
            doc["signed_pdf_url"] = None
    return doc

@router.get("/documents/{doc_id}/pdf")
async def get_pdf(doc_id: str):
    db = get_db()
    res = db.table("documents").select("*").eq("id", doc_id).execute().data
    if not res or not res[0].get("storage_path"):
        raise HTTPException(404, "PDF not found")
    
    public_url = db.storage.from_("documents").get_public_url(res[0]["storage_path"])
    
    async def stream_pdf():
        async with httpx.AsyncClient() as client:
            async with client.stream("GET", public_url) as response:
                async for chunk in response.aiter_bytes():
                    yield chunk

    return StreamingResponse(stream_pdf(), media_type="application/pdf")

@router.get("/documents/{doc_id}/pages/{pdf_page}")
def get_page(doc_id: str, pdf_page: int):
    res = (get_db().table("document_pages").select("*")
           .eq("document_id", doc_id).eq("pdf_page", pdf_page).execute().data)
    if not res:
        raise HTTPException(404, "Page not found")
    return res[0]

