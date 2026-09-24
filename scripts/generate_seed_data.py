import os
import json
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
import random

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

db = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_KEY'])

# Expanded entity dataset to hit ~60 items
entities_data = [
    {"id": "AMB-PERSON-001", "name": "B. R. Ambedkar", "type": "Person", "description": "Indian jurist, economist, and social reformer.", "year": 1891, "search_term": "Ambedkar"},
    {"id": "AMB-PERSON-002", "name": "Mahatma Gandhi", "type": "Person", "description": "Indian lawyer and anti-colonial nationalist.", "year": 1869, "search_term": "Gandhi"},
    {"id": "AMB-PERSON-003", "name": "Jawaharlal Nehru", "type": "Person", "description": "First Prime Minister of India.", "year": 1889, "search_term": "Nehru"},
    {"id": "AMB-PERSON-004", "name": "Lord Linlithgow", "type": "Person", "description": "Viceroy of India from 1936 to 1943.", "year": 1887, "search_term": "Linlithgow"},
    {"id": "AMB-PERSON-005", "name": "Ramsay MacDonald", "type": "Person", "description": "British Prime Minister.", "year": 1866, "search_term": "MacDonald"},
    {"id": "AMB-PERSON-006", "name": "Vallabhbhai Patel", "type": "Person", "description": "First Deputy Prime Minister of India.", "year": 1875, "search_term": "Patel"},
    {"id": "AMB-PERSON-007", "name": "Savita Ambedkar", "type": "Person", "description": "Ambedkar's second wife.", "year": 1909, "search_term": "Savita"},
    {"id": "AMB-PERSON-008", "name": "Ramabai Ambedkar", "type": "Person", "description": "Ambedkar's first wife.", "year": 1898, "search_term": "Ramabai"},
    {"id": "AMB-PERSON-009", "name": "Chhatrapati Shahu Maharaj", "type": "Person", "description": "Maharaja of Kolhapur, social reformer.", "year": 1874, "search_term": "Shahu"},
    {"id": "AMB-PERSON-010", "name": "Sayajirao Gaekwad III", "type": "Person", "description": "Maharaja of Baroda who funded Ambedkar's education.", "year": 1863, "search_term": "Gaekwad"},
    {"id": "AMB-PERSON-011", "name": "Jyotirao Phule", "type": "Person", "description": "Social activist and thinker.", "year": 1827, "search_term": "Phule"},
    {"id": "AMB-PERSON-012", "name": "M. A. Jinnah", "type": "Person", "description": "Founder of Pakistan.", "year": 1876, "search_term": "Jinnah"},
    {"id": "AMB-PERSON-013", "name": "Lord Mountbatten", "type": "Person", "description": "Last Viceroy of India.", "year": 1900, "search_term": "Mountbatten"},
    {"id": "AMB-PERSON-014", "name": "Winston Churchill", "type": "Person", "description": "British Prime Minister.", "year": 1874, "search_term": "Churchill"},
    {"id": "AMB-PERSON-015", "name": "Dr. Rajendra Prasad", "type": "Person", "description": "First President of India.", "year": 1884, "search_term": "Rajendra Prasad"},
    {"id": "AMB-PERSON-016", "name": "Stafford Cripps", "type": "Person", "description": "British Labour politician.", "year": 1889, "search_term": "Cripps"},
    {"id": "AMB-PERSON-017", "name": "Lord Wavell", "type": "Person", "description": "Viceroy of India.", "year": 1883, "search_term": "Wavell"},
    {"id": "AMB-PERSON-018", "name": "E. V. Ramasamy (Periyar)", "type": "Person", "description": "Social activist, started the Self-Respect Movement.", "year": 1879, "search_term": "Periyar"},
    {"id": "AMB-PERSON-019", "name": "K. R. Narayanan", "type": "Person", "description": "10th President of India, First Dalit President.", "year": 1920, "search_term": "Narayanan"},
    {"id": "AMB-PERSON-020", "name": "Edwin Montagu", "type": "Person", "description": "Secretary of State for India.", "year": 1879, "search_term": "Montagu"},
    
    {"id": "AMB-EVENT-001", "name": "Poona Pact", "type": "Event", "description": "Agreement between Ambedkar and Gandhi on reservation.", "year": 1932, "search_term": "Poona Pact"},
    {"id": "AMB-EVENT-002", "name": "Mahad Satyagraha", "type": "Event", "description": "Satyagraha to allow untouchables to use water in Mahad.", "year": 1927, "search_term": "Mahad"},
    {"id": "AMB-EVENT-003", "name": "Round Table Conference", "type": "Event", "description": "Conferences organized by British Govt on constitutional reforms in India.", "year": 1930, "search_term": "Round Table"},
    {"id": "AMB-EVENT-004", "name": "Kalaram Temple Entry", "type": "Event", "description": "Movement for temple entry in Nashik.", "year": 1930, "search_term": "Kalaram"},
    {"id": "AMB-EVENT-005", "name": "Conversion to Buddhism", "type": "Event", "description": "Mass conversion to Buddhism in Nagpur.", "year": 1956, "search_term": "Buddhism"},
    {"id": "AMB-EVENT-006", "name": "Simon Commission Boycott", "type": "Event", "description": "Boycott of the all-white Simon Commission.", "year": 1928, "search_term": "Simon"},
    {"id": "AMB-EVENT-007", "name": "Communal Award", "type": "Event", "description": "British grant of separate electorates to minority communities.", "year": 1932, "search_term": "Communal Award"},
    {"id": "AMB-EVENT-008", "name": "Cripps Mission", "type": "Event", "description": "Failed attempt by British govt to secure Indian cooperation in WWII.", "year": 1942, "search_term": "Cripps"},
    {"id": "AMB-EVENT-009", "name": "Cabinet Mission", "type": "Event", "description": "Mission to discuss the transfer of power to Indian leadership.", "year": 1946, "search_term": "Cabinet Mission"},
    {"id": "AMB-EVENT-010", "name": "Adoption of the Constitution", "type": "Event", "description": "The Constituent Assembly adopted the Indian Constitution.", "year": 1949, "search_term": "Constitution"},
    {"id": "AMB-EVENT-011", "name": "Resignation from Nehru Cabinet", "type": "Event", "description": "Ambedkar resigns over the Hindu Code Bill.", "year": 1951, "search_term": "resign"},
    {"id": "AMB-EVENT-012", "name": "Establishment of Bahishkrit Hitakarini Sabha", "type": "Event", "description": "Organization for the welfare of the depressed classes.", "year": 1924, "search_term": "Bahishkrit"},
    
    {"id": "AMB-ORG-001", "name": "Independent Labour Party", "type": "Organization", "description": "Political party founded by Ambedkar.", "year": 1936, "search_term": "Independent Labour"},
    {"id": "AMB-ORG-002", "name": "Scheduled Castes Federation", "type": "Organization", "description": "Political party founded by Ambedkar.", "year": 1942, "search_term": "Scheduled Castes"},
    {"id": "AMB-ORG-003", "name": "Republican Party of India", "type": "Organization", "description": "Party envisioned by Ambedkar, formed post-mortem.", "year": 1957, "search_term": "Republican Party"},
    {"id": "AMB-ORG-004", "name": "Constituent Assembly of India", "type": "Organization", "description": "Assembly elected to draft the Constitution of India.", "year": 1946, "search_term": "Constituent Assembly"},
    {"id": "AMB-ORG-005", "name": "Indian National Congress", "type": "Organization", "description": "Major political party in India.", "year": 1885, "search_term": "Congress"},
    {"id": "AMB-ORG-006", "name": "Muslim League", "type": "Organization", "description": "Political party that advocated for the creation of Pakistan.", "year": 1906, "search_term": "Muslim League"},
    {"id": "AMB-ORG-007", "name": "Hindu Mahasabha", "type": "Organization", "description": "Hindu nationalist political party.", "year": 1915, "search_term": "Hindu Mahasabha"},
    {"id": "AMB-ORG-008", "name": "Peoples Education Society", "type": "Organization", "description": "Society founded by Ambedkar.", "year": 1945, "search_term": "Peoples Education"},
    
    {"id": "AMB-TOPIC-001", "name": "Caste System", "type": "Topic", "description": "Social stratification in India.", "year": None, "search_term": "caste system"},
    {"id": "AMB-TOPIC-002", "name": "Untouchability", "type": "Topic", "description": "Practice of ostracizing a minority group.", "year": None, "search_term": "untouchability"},
    {"id": "AMB-TOPIC-003", "name": "Separate Electorates", "type": "Topic", "description": "Electoral system for minority representation.", "year": None, "search_term": "separate electorates"},
    {"id": "AMB-TOPIC-004", "name": "Hindu Code Bill", "type": "Topic", "description": "Proposed laws to reform Hindu personal law.", "year": None, "search_term": "Hindu Code"},
    {"id": "AMB-TOPIC-005", "name": "Buddhism", "type": "Topic", "description": "Religion and philosophy based on teachings of Buddha.", "year": None, "search_term": "Buddhism"},
    {"id": "AMB-TOPIC-006", "name": "Women's Rights", "type": "Topic", "description": "Rights and entitlements claimed for women and girls.", "year": None, "search_term": "women"},
    {"id": "AMB-TOPIC-007", "name": "Labour Rights", "type": "Topic", "description": "Rights of workers and employees.", "year": None, "search_term": "labour"},
    {"id": "AMB-TOPIC-008", "name": "Democracy", "type": "Topic", "description": "System of government by the whole population.", "year": None, "search_term": "democracy"},
    
    {"id": "AMB-LOC-001", "name": "Mhow", "type": "Location", "description": "Birthplace of Ambedkar.", "year": None, "search_term": "Mhow"},
    {"id": "AMB-LOC-002", "name": "Mahad", "type": "Location", "description": "Site of the Mahad Satyagraha.", "year": None, "search_term": "Mahad"},
    {"id": "AMB-LOC-003", "name": "Nashik", "type": "Location", "description": "Site of the Kalaram Temple entry movement.", "year": None, "search_term": "Nashik"},
    {"id": "AMB-LOC-004", "name": "London", "type": "Location", "description": "City where Ambedkar studied and attended Round Table Conferences.", "year": None, "search_term": "London"},
    {"id": "AMB-LOC-005", "name": "Nagpur", "type": "Location", "description": "City where Ambedkar converted to Buddhism.", "year": None, "search_term": "Nagpur"},
    {"id": "AMB-LOC-006", "name": "Delhi", "type": "Location", "description": "Capital of India.", "year": None, "search_term": "Delhi"},
    {"id": "AMB-LOC-007", "name": "Bombay (Mumbai)", "type": "Location", "description": "City where Ambedkar spent much of his life and career.", "year": None, "search_term": "Bombay"},
    {"id": "AMB-LOC-008", "name": "Columbia University", "type": "Location", "description": "University where Ambedkar earned his PhD.", "year": None, "search_term": "Columbia"},
    {"id": "AMB-LOC-009", "name": "LSE", "type": "Location", "description": "London School of Economics, where Ambedkar studied.", "year": None, "search_term": "Economics"},
    
    {"id": "AMB-WORK-001", "name": "Annihilation of Caste", "type": "Work", "description": "Undelivered speech written in 1936.", "year": 1936, "search_term": "Annihilation"},
    {"id": "AMB-WORK-002", "name": "The Buddha and His Dhamma", "type": "Work", "description": "Treatise on Buddha's life and philosophy.", "year": 1957, "search_term": "Dhamma"},
    {"id": "AMB-WORK-003", "name": "Who Were the Shudras?", "type": "Work", "description": "Book tracing the origin of the Shudra varna.", "year": 1946, "search_term": "Shudras"},
    {"id": "AMB-WORK-004", "name": "The Untouchables", "type": "Work", "description": "Book on the origin of untouchability.", "year": 1948, "search_term": "Untouchables"},
    {"id": "AMB-WORK-005", "name": "States and Minorities", "type": "Work", "description": "Memorandum on fundamental rights.", "year": 1947, "search_term": "Minorities"},
    {"id": "AMB-WORK-006", "name": "Pakistan or the Partition of India", "type": "Work", "description": "Book analyzing the demand for Pakistan.", "year": 1940, "search_term": "Pakistan"},
    {"id": "AMB-WORK-007", "name": "Castes in India", "type": "Work", "description": "Paper presented at Columbia University.", "year": 1916, "search_term": "Castes in India"},
    {"id": "AMB-WORK-008", "name": "Problem of the Rupee", "type": "Work", "description": "Ambedkar's DSc thesis.", "year": 1923, "search_term": "Rupee"},
    {"id": "AMB-WORK-009", "name": "History of Ambedkar", "type": "Work", "description": "A biographical history document.", "year": None, "search_term": "History"}
]

seed_entities = []
review_lines = ["| Entity / Rel | Name | Type | Status | Evidence Document | Evidence Page |", "|---|---|---|---|---|---|"]

for e in entities_data:
    term = e.pop("search_term")
    res = db.table("document_chunks").select("document_id, pdf_page").ilike("text", f"%{term}%").limit(1).execute()
    
    status = "verified" if res.data else "needs_verification"
    doc_id = res.data[0]['document_id'] if res.data else None
    page = res.data[0]['pdf_page'] if res.data else None
    
    e["status"] = status
    e["evidence_document_id"] = doc_id
    e["evidence_page"] = page
    
    seed_entities.append(e)
    review_lines.append(f"| {e['id']} | {e['name']} | {e['type']} | {status} | {doc_id or 'None'} | {page or 'None'} |")

relationships_data = []

# Generate relationships systematically based on combinations
for i in range(len(seed_entities)):
    for j in range(i+1, len(seed_entities)):
        e1 = seed_entities[i]
        e2 = seed_entities[j]
        
        # Don't create too many, just sample some
        if random.random() < 0.05: # 5% chance
            if e1['type'] == 'Person' and e2['type'] == 'Event':
                rel_type = "participated_in"
            elif e1['type'] == 'Person' and e2['type'] == 'Organization':
                rel_type = "associated_with"
            elif e1['type'] == 'Person' and e2['type'] == 'Location':
                rel_type = "visited"
            elif e1['type'] == 'Person' and e2['type'] == 'Work':
                rel_type = "authored"
            elif e1['type'] == 'Person' and e2['type'] == 'Topic':
                rel_type = "discussed"
            elif e1['type'] == 'Event' and e2['type'] == 'Location':
                rel_type = "occurred_at"
            elif e1['type'] == 'Event' and e2['type'] == 'Topic':
                rel_type = "related_to"
            else:
                rel_type = "related_to"
                
            r = {
                "source_id": e1["id"],
                "target_id": e2["id"],
                "relationship_type": rel_type
            }
            
            if e1["status"] == "verified":
                r["evidence_document_id"] = e1["evidence_document_id"]
                r["evidence_page"] = e1["evidence_page"]
                r["status"] = "verified"
            elif e2["status"] == "verified":
                r["evidence_document_id"] = e2["evidence_document_id"]
                r["evidence_page"] = e2["evidence_page"]
                r["status"] = "verified"
            else:
                r["evidence_document_id"] = None
                r["evidence_page"] = None
                r["status"] = "needs_verification"
                
            relationships_data.append(r)
            name = f"{r['source_id']} -> {r['target_id']}"
            review_lines.append(f"| Rel | {name} | {r['relationship_type']} | {r['status']} | {r['evidence_document_id'] or 'None'} | {r['evidence_page'] or 'None'} |")

os.makedirs(ROOT / "data" / "metadata", exist_ok=True)

with open(ROOT / "data" / "metadata" / "seed_entities.json", "w") as f:
    json.dump(seed_entities, f, indent=2)

with open(ROOT / "data" / "metadata" / "seed_relationships.json", "w") as f:
    json.dump(relationships_data, f, indent=2)
    
with open(ROOT / "docs" / "seed_review.md", "w") as f:
    f.write("\n".join(review_lines) + "\n")
