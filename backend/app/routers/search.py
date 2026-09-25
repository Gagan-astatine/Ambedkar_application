from fastapi import APIRouter, HTTPException, Query
from google import genai
from ..db import get_db
from ..config import GEMINI_API_KEY, EMBED_MODEL, EMBED_DIM

router = APIRouter(tags=["search"])

def _ts(seconds: float | None) -> str | None:
    """Format seconds as mm:ss string, or None."""
    if seconds is None:
        return None
    s = int(seconds)
    return f"{s // 60:02d}:{s % 60:02d}"

@router.get("/search")
def search(q: str = Query(...), limit: int = 10, language: str | None = None):
    try:
        gem = genai.Client(api_key=GEMINI_API_KEY)
        res = gem.models.embed_content(
            model=EMBED_MODEL,
            contents=[q],
            config={"output_dimensionality": EMBED_DIM, "task_type": "RETRIEVAL_QUERY"}
        )
        query_embedding = res.embeddings[0].values
        
        rpc_params = {
            "query_embedding": query_embedding,
            "match_count": limit
        }
        if language:
            rpc_params["filter_language"] = language
            
        data = get_db().rpc("match_chunks", rpc_params).execute().data

        # Enrich each result with citation metadata
        results = []
        for c in data:
            r = {
                "chunk_id":    c["chunk_id"],
                "document_id": c["document_id"],
                "text":        c["text"],
                "similarity":  c["similarity"],
                "media_type":  c.get("media_type", "text"),
            }
            if c.get("media_type") == "audio":
                r["timestamp_start"]     = c.get("timestamp_start")
                r["timestamp_end"]       = c.get("timestamp_end")
                r["timestamp_start_fmt"] = _ts(c.get("timestamp_start"))
                r["timestamp_end_fmt"]   = _ts(c.get("timestamp_end"))
            else:
                r["pdf_page"] = c.get("pdf_page")
            results.append(r)

        return {"results": results}
    except Exception as e:
        raise HTTPException(500, str(e))
