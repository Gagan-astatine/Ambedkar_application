-- ============================================================
-- Migration 006: Learning Module & Flashcards
-- Run this in the Supabase SQL editor ONCE.
-- ============================================================

create table if not exists learning_paths (
  id text primary key, 
  title text, 
  description text, 
  language text default 'English',
  status text default 'draft'
);

create table if not exists learning_steps (
  id bigserial primary key, 
  path_id text references learning_paths(id) on delete cascade,
  step_order int, 
  kind text,              -- passage | timeline_event | media | quiz
  ref_id text, 
  document_id text, 
  pdf_page int, 
  body text
);

create table if not exists quiz_questions (
  id bigserial primary key, 
  path_id text references learning_paths(id), 
  work_id text,
  question text, 
  options jsonb, 
  correct_index int, 
  explanation text,
  document_id text, 
  pdf_page int, 
  chunk_id text,
  review_status text default 'needs_review'
);

create table if not exists flashcards (
  id bigserial primary key,
  entity_id text references entities(id) on delete cascade,
  front text not null,              -- term/name
  back text not null,               -- short definition/description
  document_id text, 
  pdf_page int,                     -- evidence for the back text, required
  review_status text default 'needs_review'
);
