from fastapi import APIRouter, HTTPException, Query
from google import genai
from google.genai import errors
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from ..db import get_db
from ..config import GEMINI_API_KEY, EMBED_MODEL, EMBED_DIM, CHAT_MODEL
from ..llm_client import generate_text

router = APIRouter(tags=["research"])

def _ts(seconds: float | None) -> str | None:
    """Format seconds as mm:ss string."""
    if seconds is None:
        return None
    s = int(seconds)
    return f"{s // 60:02d}:{s % 60:02d}"

@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    retry=retry_if_exception_type(errors.ServerError)
)
def embed_content_with_retry(gem, model, contents, config):
    return gem.models.embed_content(model=model, contents=contents, config=config)

@router.get("/research")
def research(q: str = Query(...), limit: int = 10):
    try:
        gem = genai.Client(api_key=GEMINI_API_KEY)
        
        db = get_db()
        
        # 0. Check Graph for related entities
        q_lower = q.lower()
        all_entities = db.table("entities").select("id, name, type, description").execute().data
        matched_entities = [e for e in all_entities if e["name"].lower() in q_lower]
        
        graph_context = ""
        related_nodes = []
        if matched_entities:
            # Find related entities
            entity_ids = [e["id"] for e in matched_entities]
            out_rels = db.table("relationships").select("*, target:entities!relationships_target_id_fkey(*)").in_("source_id", entity_ids).execute().data
            in_rels = db.table("relationships").select("*, source:entities!relationships_source_id_fkey(*)").in_("target_id", entity_ids).execute().data
            
            graph_context = "Knowledge Graph Context (For Reference):\n"
            for e in matched_entities:
                graph_context += f"Entity: {e['name']} ({e['type']}) - {e['description']}\n"
            
            for r in out_rels:
                rel_desc = f"- {r['target']['name']} ({r['target']['type']}) via {r['relationship_type']}"
                graph_context += rel_desc + "\n"
                related_nodes.append({"name": r['target']['name'], "type": r['target']['type'], "relation": r['relationship_type']})
                
            for r in in_rels:
                rel_desc = f"- {r['source']['name']} ({r['source']['type']}) via {r['relationship_type']} (incoming)"
                graph_context += rel_desc + "\n"
                related_nodes.append({"name": r['source']['name'], "type": r['source']['type'], "relation": r['relationship_type']})

        # 1. Retrieve chunks
        try:
            res_emb = embed_content_with_retry(
                gem,
                model=EMBED_MODEL, contents=[q],
                config={"output_dimensionality": EMBED_DIM, "task_type": "RETRIEVAL_QUERY"}
            )
            query_embedding = res_emb.embeddings[0].values
        except Exception as embed_err:
            return {
                "answer": "The AI embedding model is currently experiencing high demand and rate limits. Please try asking your question again in a few moments.",
                "citations": [],
                "related_graph_nodes": related_nodes
            }
        
        rpc_params = {"query_embedding": query_embedding, "match_count": limit}
        chunks = db.rpc("match_chunks", rpc_params).execute().data
        
        # Check similarity threshold (e.g., 0.6)
        valid_chunks = [c for c in chunks if c.get("similarity", 0) > 0.6]
        if not valid_chunks:
            return {"answer": "not found in the archive", "citations": [], "related_graph_nodes": []}
            
        # 2. Format context — identical treatment for text and audio chunks
        context = ""
        citations = []
        for i, c in enumerate(valid_chunks, 1):
            is_audio = c.get("media_type") == "audio"
            if is_audio:
                loc = f"Timestamp: {_ts(c.get('timestamp_start'))}–{_ts(c.get('timestamp_end'))}"
            else:
                loc = f"Page: {c['pdf_page']}"
            context += f"[Citation {i}] Document: {c['document_id']}, {loc}\n{c['text']}\n\n"

            cite = {
                "document_id": c["document_id"],
                "text":        c["text"][:120] + "…",
                "media_type":  c.get("media_type", "text"),
            }
            if is_audio:
                cite["timestamp_start"]     = c.get("timestamp_start")
                cite["timestamp_end"]       = c.get("timestamp_end")
                cite["timestamp_start_fmt"] = _ts(c.get("timestamp_start"))
                cite["timestamp_end_fmt"]   = _ts(c.get("timestamp_end"))
            else:
                cite["pdf_page"] = c["pdf_page"]
            citations.append(cite)
            
        # 3. Generate answer
        prompt = (
            f"You are a strict archival research assistant.\n"
            f"Answer the user's question using ONLY the provided archival excerpts.\n"
            f"You must cite your sources in the text using [Citation 1], etc.\n"
            f"If the excerpts do not contain the answer, reply exactly with 'not found in the archive'.\n"
            f"Do not invent dates, names, or quotes.\n"
            f"The knowledge graph context is provided to help you understand the entities, but your facts MUST come from the Excerpts.\n\n"
            f"{graph_context}\n"
            f"Excerpts:\n{context}\n\n"
            f"Question: {q}"
        )
        
        try:
            answer = generate_text(prompt)
            return {"answer": answer, "citations": citations, "related_graph_nodes": related_nodes}
        except Exception as api_err:
            return {
                "answer": "The AI is currently experiencing high demand and rate limits. Please try asking your question again in a few moments.",
                "citations": citations,
                "related_graph_nodes": related_nodes
            }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, str(e))
