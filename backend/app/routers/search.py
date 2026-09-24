from fastapi import APIRouter, HTTPException, Query
from google import genai
from ..db import get_db
from ..config import GEMINI_API_KEY, EMBED_MODEL, EMBED_DIM

router = APIRouter(tags=["search"])

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
        return {"results": data}
    except Exception as e:
        raise HTTPException(500, str(e))
