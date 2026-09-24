import requests
import sys

BASE_URL = "http://localhost:8000/api"

questions = [
    "What is the theory of class-conflict mentioned?",
    "When was the first edition of Volume 1 published?",
    "Who is the publisher of the writings and speeches?",
    "What is a Caste according to the text?",
    "Does the archive contain information about a spaceship? (should refuse)"
]

print("Testing /api/documents...")
try:
    doc = requests.get(f"{BASE_URL}/documents/AMB-EN-V01").json()
    print(f"Document {doc.get('id')} loaded. Signed URL: {bool(doc.get('signed_pdf_url'))}")
except Exception as e:
    print("Error loading document:", e)
    sys.exit(1)

print("\nTesting /api/search...")
try:
    search_res = requests.get(f"{BASE_URL}/search", params={"q": "caste system", "limit": 2}).json()
    print(f"Found {len(search_res.get('results', []))} chunks.")
except Exception as e:
    print("Error searching:", e)

print("\nTesting /api/research...")
for q in questions:
    print(f"\nQ: {q}")
    try:
        res = requests.get(f"{BASE_URL}/research", params={"q": q, "limit": 3}).json()
        ans = res.get("answer", "")
        print(f"A: {ans}")
        print(f"Citations: {len(res.get('citations', []))}")
    except Exception as e:
        print("Error in research:", e)
