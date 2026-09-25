-- ============================================================
-- Migration 005: Storytelling Module
-- Run this in the Supabase SQL editor ONCE.
-- ============================================================

create table if not exists stories (
  id            text primary key,
  title         text not null,
  subtitle      text,
  cover_image   text,
  author        text,
  published_at  timestamptz,
  status        text not null default 'draft', -- 'draft' | 'published'
  created_at    timestamptz default now()
);

create table if not exists story_beats (
  id              uuid primary key default gen_random_uuid(),
  story_id        text references stories(id) on delete cascade,
  beat_order      int not null,
  beat_type       text not null, -- 'narrative' | 'excerpt' | 'timeline_ref' | 'media'
  narrative_text  text,
  -- For excerpt beats:
  chunk_id        text, -- References document_chunks(chunk_id), but keeping it soft to avoid tight coupling if not needed, or explicit if preferred
  document_id     text,
  pdf_page        int,
  -- For timeline_ref beats:
  timeline_id     text,
  -- For media beats:
  media_id        text,
  created_at      timestamptz default now()
);
