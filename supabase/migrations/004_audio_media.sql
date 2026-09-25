-- ============================================================
-- Migration 004: Audio / Media support
-- Run this in the Supabase SQL editor ONCE.
-- ============================================================

-- 1. Extend document_chunks with media columns (all nullable, safe to run twice)
alter table document_chunks
  add column if not exists media_type   text    default 'text',
  add column if not exists timestamp_start float,
  add column if not exists timestamp_end   float;

-- 2. Relax the FK so media IDs (AMB-AUD-xxx) don't have to exist in documents
--    We keep the FK but allow the media table to act as a second parent.
--    Simplest safe approach: make document_id nullable or drop the FK.
--    We DROP the FK and manage integrity in application code instead.
alter table document_chunks
  drop constraint if exists document_chunks_document_id_fkey;

-- 3. Create the media table
create table if not exists media (
  id            text primary key,           -- AMB-AUD-001
  type          text not null,              -- 'audio' | 'video' | 'image'
  title         text not null,
  description   text,
  year          int,
  language      text,
  storage_path  text,                       -- Supabase Storage path (bucket/key)
  external_url  text,
  source        text,
  license       text,
  retrieved_on  date,
  status        text not null default 'needs_review',  -- 'needs_review' | 'approved'
  created_at    timestamptz default now()
);

-- 4. Update match_chunks RPC to return media columns
drop function if exists match_chunks(vector, int, text);

create or replace function match_chunks(
  query_embedding  vector(768),
  match_count      int  default 8,
  filter_language  text default null
) returns table (
  chunk_id        text,
  document_id     text,
  pdf_page        int,
  text            text,
  similarity      float,
  media_type      text,
  timestamp_start float,
  timestamp_end   float
) language sql stable as $$
  select
    c.chunk_id,
    c.document_id,
    c.pdf_page,
    c.text,
    1 - (c.embedding <=> query_embedding) as similarity,
    c.media_type,
    c.timestamp_start,
    c.timestamp_end
  from document_chunks c
  where filter_language is null or c.language = filter_language
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
