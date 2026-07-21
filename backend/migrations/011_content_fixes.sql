-- Content/schema consistency fixes ahead of the Pro-tier (stage 2-5) content seed in 012.
-- Run this in the Supabase SQL Editor after 001-010.

-- 1. RAG Systems' INTERVIEW module was seeded at stage_index=3 (003_interview_module_seed.sql)
--    while every other track's stage-1 CODING+INTERVIEW pair sits at stage_index=1.
--    Align it, and free up stage_index=3 for new Pro content.
UPDATE modules SET stage_index = 1
WHERE id = '3a8f1e2d-5c4b-4a9e-8d7f-1b2c3e4f5a6b'; -- Debug the RAG Retrieval Pipeline

-- 2. Normalize `difficulty` platform-wide to the majority uppercase EASY/MEDIUM/HARD
--    vocabulary (INTERVIEW modules and half of CODING already use it).
UPDATE modules SET content_payload = jsonb_set(content_payload, '{difficulty}', '"EASY"')
WHERE id = '8b6a255a-f74a-4416-8ef7-374b58b19f27'; -- Prompt Eng CONCEPT: Prompting for Reliable Output (Beginner)

UPDATE modules SET content_payload = jsonb_set(content_payload, '{difficulty}', '"MEDIUM"')
WHERE id IN (
  '0bd6c71b-9c8b-49e9-8124-a2b2d4cb35cc', -- RAG CONCEPT: Introduction to RAG (Intermediate)
  '53f5aef9-97e7-490f-b723-a6948c0cee7f', -- RAG SIMULATOR (Intermediate)
  '2c1ea162-1446-497d-b8e1-ee9ed5f2c640', -- AI Agents CONCEPT: From Chatbots to Agents (Intermediate)
  '1cafa71e-6091-4d70-956e-ed6f6ffe73c2', -- LLM Eval CONCEPT: How to Evaluate an LLM System (Intermediate)
  'da23ad17-9608-4147-a7d0-49e5665c3c8a'  -- Vector DB CONCEPT: Vector Search Fundamentals (Intermediate)
);

UPDATE modules SET content_payload = jsonb_set(content_payload, '{difficulty}', '"HARD"')
WHERE id = '81dbf2d1-2dd3-43f7-bdc0-08454482e951'; -- RAG CODING: chunking exercise (Advanced)

-- 3. Add `title` to existing CODING payloads — the one tier_type missing it.
--    Needed once tracks have 2+ CODING modules (starting with 012), otherwise they
--    render as indistinguishable "Coding · Stage N" rows in the track timeline.
UPDATE modules SET content_payload = jsonb_set(content_payload, '{title}', '"Implement Sentence-Boundary Chunking"')
WHERE id = '81dbf2d1-2dd3-43f7-bdc0-08454482e951'; -- RAG

UPDATE modules SET content_payload = jsonb_set(content_payload, '{title}', '"Implement the Agent Loop"')
WHERE id = 'd20238b9-4d53-498c-8491-e512a3ed7a94'; -- AI Agents

UPDATE modules SET content_payload = jsonb_set(content_payload, '{title}', '"Implement Exact-Match Accuracy"')
WHERE id = 'd21f444a-d920-474c-9fc8-7d6bfa200068'; -- LLM Evaluation

UPDATE modules SET content_payload = jsonb_set(content_payload, '{title}', '"Build a Few-Shot Prompt"')
WHERE id = 'd394103f-3d32-436b-bdb1-2bae0d8e4eba'; -- Prompt Engineering & LLM APIs

UPDATE modules SET content_payload = jsonb_set(content_payload, '{title}', '"Implement Top-K Cosine Similarity Search"')
WHERE id = '3068118d-e331-4cf6-aee1-09b0016a84ef'; -- Vector Databases
