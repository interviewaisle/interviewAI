-- Seed: Add an INTERVIEW module to the RAG Systems track
-- Run this in the Supabase SQL Editor after 001 + 002 migrations.

INSERT INTO modules (id, track_id, stage_index, tier_type, company_tags, content_payload)
VALUES (
  '3a8f1e2d-5c4b-4a9e-8d7f-1b2c3e4f5a6b',
  '00000000-0000-0000-0000-000000000001',
  3,
  'INTERVIEW',
  ARRAY['Meta', 'OpenAI', 'Anthropic'],
  '{
    "title": "Debug the RAG Retrieval Pipeline",
    "difficulty": "MEDIUM",
    "description": "## The Bug\n\nYour RAG pipeline is silently returning empty context for every query. Users report that answers are generic and lack document-specific information.\n\n## Task\n\nThe `retrieve_context` function below is supposed to:\n1. Embed the query using `embed_text()`\n2. Search the vector store for the top-k most similar chunks\n3. Return the concatenated text of those chunks\n\nUse the **AI Debugging Assistant** on the right to investigate. Ask specific questions — the quality of your prompts is scored alongside your final code fix.\n\n## Constraints\n\n- Do not change the function signature\n- The fix should be ≤ 5 lines changed\n- `embed_text()` and `vector_store.search()` are correct — the bug is in how results are used",
    "buggy_code": "from typing import Optional\n\n\ndef embed_text(text: str) -> list[float]:\n    \"\"\"Returns a 1536-dim embedding vector (stub).\"\"\"\n    return [0.1] * 1536\n\n\nclass VectorStore:\n    def search(self, query_vec: list[float], k: int) -> list[dict]:\n        \"\"\"Returns [{\"id\": str, \"text\": str, \"score\": float}] sorted by score desc.\"\"\"\n        return [\n            {\"id\": \"chunk_1\", \"text\": \"RAG stands for Retrieval-Augmented Generation.\", \"score\": 0.95},\n            {\"id\": \"chunk_2\", \"text\": \"Vector databases store embeddings for semantic search.\", \"score\": 0.87},\n            {\"id\": \"chunk_3\", \"text\": \"Chunking strategy affects retrieval quality.\", \"score\": 0.76},\n        ][:k]\n\n\nvector_store = VectorStore()\n\n\ndef retrieve_context(query: str, k: int = 5) -> Optional[str]:\n    \"\"\"Return the top-k relevant chunks for the given query as a single string.\"\"\"\n    query_embedding = embed_text(query)\n    results = vector_store.search(query_embedding, k)\n\n    # BUG: assemble context from results\n    context_parts = []\n    for result in results:\n        context_parts.append(result[\"score\"])   # <-- something is off here\n\n    if not context_parts:\n        return None\n\n    return \"\\n\\n\".join(context_parts)\n\n\nif __name__ == \"__main__\":\n    ctx = retrieve_context(\"What is RAG?\", k=3)\n    print(\"Retrieved context:\")\n    print(ctx)\n",
    "language": "python"
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
