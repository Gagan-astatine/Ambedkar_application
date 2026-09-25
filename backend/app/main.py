from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import documents, search, research, timeline, entities, open_data, media

app = FastAPI(title="Ambedkar Digital Heritage Archive API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # add your Vercel URL later
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok"}

app.include_router(documents.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(research.router, prefix="/api")
app.include_router(timeline.router, prefix="/api")
app.include_router(entities.router, prefix="/api")
app.include_router(open_data.router, prefix="/api")
app.include_router(media.router, prefix="/api")
