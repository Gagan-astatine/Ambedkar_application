-- Run in Supabase SQL editor. Embedding dim must match EMBED_DIM (768).
create extension if not exists vector;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'visitor' check (role in ('visitor','researcher','archivist','admin')),
  created_at timestamptz default now()
);

create table if not exists documents (
  id text primary key,                 -- AMB-EN-V01 or AMB-EN-V05-PT1
  collection_id text,
  title text not null,
  volume int,
  part int,
  language text not null,
  document_type text default 'Primary Source',
  source_url text,
  filename text,
  storage_path text,
  sha256 text,
  rights text,
  status text default 'approved',
  created_at timestamptz default now()
);

create table if not exists document_versions (
  id bigserial primary key,
  document_id text references documents(id) on delete cascade,
  version text not null,
  sha256 text,
  storage_path text,
  note text,
  created_by uuid,
  created_at timestamptz default now()
);

create table if not exists document_pages (
  page_id text primary key,
  document_id text references documents(id) on delete cascade,
  pdf_page int not null,               -- index in the PDF file
  printed_page text,                   -- number printed on the page (differs!)
  language text,
  text text,
  ocr_required boolean default false,
  unique (document_id, pdf_page)
);

create table if not exists document_chunks (
  chunk_id text primary key,
  document_id text references documents(id) on delete cascade,
  pdf_page int not null,
  chunk_index int,
  text text not null,
  language text,
  token_estimate int,
  embedding vector(768)
);
create index if not exists chunks_embedding_idx
  on document_chunks using hnsw (embedding vector_cosine_ops);
create index if not exists chunks_doc_idx on document_chunks(document_id);

create table if not exists works (
  work_id text primary key,
  document_id text references documents(id) on delete cascade,
  title text, type text, start_page int, end_page int, language text
);

create table if not exists entities (
  id text primary key,                 -- AMB-PERSON-002, AMB-EVENT-014
  name text not null,
  type text not null,
  description text,
  year int
);

create table if not exists relationships (
  id bigserial primary key,
  source_id text references entities(id),
  target_id text references entities(id),
  relationship_type text not null,
  evidence_document_id text,
  evidence_page int
);

create table if not exists submissions (
  id bigserial primary key,
  submitted_by uuid,
  title text, creator text, year int, source text, language text, description text,
  storage_path text, sha256 text,
  status text default 'SUBMITTED',
  verification_report jsonb,
  created_at timestamptz default now()
);

create table if not exists audit_logs (
  id bigserial primary key,
  actor uuid, action text, document_id text, version text,
  detail jsonb, created_at timestamptz default now()
);

create or replace function match_chunks(
  query_embedding vector(768),
  match_count int default 8,
  filter_language text default null
) returns table (
  chunk_id text, document_id text, pdf_page int, text text, similarity float
) language sql stable as $$
  select c.chunk_id, c.document_id, c.pdf_page, c.text,
         1 - (c.embedding <=> query_embedding) as similarity
  from document_chunks c
  where filter_language is null or c.language = filter_language
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
