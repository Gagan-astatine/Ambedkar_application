# Ambedkar Digital Heritage Archive (SIH prototype)

## Layout
- data/          raw PDFs (never edited), processed text/pages/chunks, metadata JSON
- scripts/       ingestion: register -> extract -> chunk -> embed+load
- backend/       FastAPI
- supabase/      schema.sql
- frontend/      create with: npm create vite@latest frontend -- --template react
- n8n/, kiosk-controller/

## Setup
    python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
    pip install -r backend/requirements.txt
    cp .env.example .env                                   # fill in keys
    cd backend && uvicorn app.main:app --reload            # http://localhost:8000/docs

## Phase checklist
- [ ] 0  Setup: accounts, keys, repo
- [ ] 1  Dataset: one volume registered + hashed
- [ ] 2  Extraction: pages + text, check quality
- [ ] 3  Supabase schema + archive UI (/archive, /document/:id)
- [ ] 4  Chunk + embed + load
- [ ] 5  Semantic search API
- [ ] 6  RAG + /research with page citations
- [ ] 7  Works/TOC metadata (PageIndex)
- [ ] 8  Knowledge graph + timeline
- [ ] 9  Multilingual (EN + HI first)
- [ ] 10 Submit + n8n verification + archivist approval + versions
- [ ] 11 Kiosk route + voice + sensor
- [ ] 12 Deploy + polish
