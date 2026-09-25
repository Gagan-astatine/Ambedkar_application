import os
from dotenv import load_dotenv
from supabase import create_client

def main():
    load_dotenv()
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
        return
        
    supabase = create_client(url, key)

    print("Seeding Learning Path...")

    path_id = "PATH-CONST-01"
    path = {
        "id": path_id,
        "title": "Ambedkar and the Making of the Constitution",
        "description": "Explore Dr. B.R. Ambedkar's pivotal role in drafting the Constitution of India, his views on democracy, and the challenges faced.",
        "status": "published"
    }
    supabase.table("learning_paths").upsert(path).execute()

    # Get some valid chunks for the steps and quiz
    chunks_res = supabase.table("document_chunks").select("*").limit(10).execute()
    if not chunks_res.data:
        print("No document chunks found. Please ingest documents first.")
        return
        
    chunk1 = chunks_res.data[0]
    chunk2 = chunks_res.data[1] if len(chunks_res.data) > 1 else chunk1

    steps = [
        {
            "path_id": path_id,
            "step_order": 1,
            "kind": "passage",
            "ref_id": chunk1["chunk_id"],
            "document_id": chunk1["document_id"],
            "pdf_page": chunk1["pdf_page"],
            "body": "Dr. Ambedkar was the Chairman of the Drafting Committee of the Constituent Assembly. His rigorous study of constitutional systems worldwide deeply influenced the Indian Constitution."
        },
        {
            "path_id": path_id,
            "step_order": 2,
            "kind": "passage",
            "ref_id": chunk2["chunk_id"],
            "document_id": chunk2["document_id"],
            "pdf_page": chunk2["pdf_page"],
            "body": "He advocated for strong constitutional safeguards for marginalized communities, emphasizing that political democracy must be built on the foundation of social democracy."
        },
        {
            "path_id": path_id,
            "step_order": 3,
            "kind": "quiz",
            "ref_id": path_id,
            "document_id": None,
            "pdf_page": None,
            "body": None
        }
    ]

    # Delete existing steps for this path
    supabase.table("learning_steps").delete().eq("path_id", path_id).execute()
    supabase.table("learning_steps").insert(steps).execute()

    # Add Quiz Questions
    quiz = [
        {
            "path_id": path_id,
            "work_id": path_id,
            "question": "What was Dr. Ambedkar's primary role in the Constituent Assembly?",
            "options": ["Chairman of the Drafting Committee", "President of India", "Prime Minister", "Speaker of the Lok Sabha"],
            "correct_index": 0,
            "explanation": "He was appointed as the Chairman of the Drafting Committee on August 29, 1947.",
            "chunk_id": chunk1["chunk_id"],
            "document_id": chunk1["document_id"],
            "pdf_page": chunk1["pdf_page"],
            "review_status": "approved"
        },
        {
            "path_id": path_id,
            "work_id": path_id,
            "question": "According to Dr. Ambedkar, what must political democracy be built upon?",
            "options": ["Economic inequality", "Social democracy", "Monarchy", "Theocracy"],
            "correct_index": 1,
            "explanation": "Ambedkar repeatedly warned that without social democracy, political democracy would be in peril.",
            "chunk_id": chunk2["chunk_id"],
            "document_id": chunk2["document_id"],
            "pdf_page": chunk2["pdf_page"],
            "review_status": "approved"
        }
    ]
    supabase.table("quiz_questions").delete().eq("path_id", path_id).execute()
    supabase.table("quiz_questions").insert(quiz).execute()

    # Generate path_review.md
    with open("docs/path_review.md", "w", encoding="utf-8") as f:
        f.write(f"# Path Review: {path['title']}\n\n")
        f.write(f"{path['description']}\n\n## Steps\n")
        for i, s in enumerate(steps):
            f.write(f"### Step {i+1} ({s['kind']})\n")
            if s['body']: f.write(f"{s['body']}\n\n")
            if s['document_id']:
                f.write(f"**Source:** {s['document_id']}, Page {s['pdf_page']}, Chunk {s['ref_id']}\n\n")
        
        f.write("## Quiz Questions\n")
        for i, q in enumerate(quiz):
            f.write(f"### Q{i+1}: {q['question']}\n")
            for j, opt in enumerate(q['options']):
                mark = "[x]" if j == q['correct_index'] else "[ ]"
                f.write(f"- {mark} {opt}\n")
            f.write(f"\n**Explanation:** {q['explanation']}\n")
            f.write(f"**Source:** {q['document_id']}, Page {q['pdf_page']}, Chunk {q['chunk_id']}\n\n")
            
    print("Seeded successfully. Wrote docs/path_review.md.")

if __name__ == "__main__":
    main()
