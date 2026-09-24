import os
import json
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

db = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_KEY'])

def load_graph():
    entities_file = ROOT / "data/metadata/seed_entities.json"
    relations_file = ROOT / "data/metadata/seed_relationships.json"
    
    with open(entities_file, "r") as f:
        entities = json.load(f)
        
    with open(relations_file, "r") as f:
        relationships = json.load(f)

    # Idempotent upsert for entities
    for e in entities:
        db.table("entities").upsert({
            "id": e["id"],
            "name": e["name"],
            "type": e["type"],
            "description": e.get("description"),
            "year": e.get("year")
        }).execute()
        print(f"Upserted entity: {e['id']} - {e['name']}")

    # Idempotent load for relationships: clear all then insert
    # To keep it simple, we just clear and reload the relationships table
    print("Clearing relationships table...")
    # Cannot do simple delete all without filter, so we filter by id is not null
    try:
        db.table("relationships").delete().neq("id", -1).execute()
    except Exception as ex:
        print("Delete all failed, trying alternative.", ex)

    for r in relationships:
        # Avoid inserting relationships with invalid foreign keys
        try:
            db.table("relationships").insert({
                "source_id": r["source_id"],
                "target_id": r["target_id"],
                "relationship_type": r["relationship_type"],
                "evidence_document_id": r.get("evidence_document_id"),
                "evidence_page": r.get("evidence_page")
            }).execute()
            print(f"Inserted relationship: {r['source_id']} -> {r['target_id']}")
        except Exception as e:
            print(f"Skipped relationship {r['source_id']} -> {r['target_id']} due to error: {e}")

if __name__ == "__main__":
    load_graph()
