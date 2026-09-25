import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("../../.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

response = supabase.table("document_chunks").select("id", count="exact").limit(1).execute()
print("Total Chunks:", response.count)
