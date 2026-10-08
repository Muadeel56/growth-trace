# ADR 0001: LLM and Embeddings Provider

Status: Accepted
Date: 2026-09-20

## Context

GrowthTrace needs an LLM for RAG-grounded chat generation (FR-4.x) and an embeddings model for the pgvector pipeline (FR-3.x). Per the BRD, this choice must be locked before Week 4 (RAG retrieval + chat endpoint). Candidates considered: OpenAI, Anthropic, Ollama (local).

- **OpenAI**: cheap, fast, single provider for both chat and embeddings (`text-embedding-3-small`), most examples assume it. Requires an external API key and per-token cost, and sends user activity data to a third party.
- **Anthropic**: strong chat models, but no first-party embeddings API — would require pairing with OpenAI/Cohere/local embeddings anyway, adding a second provider.
- **Ollama (local)**: fully self-hosted, zero API cost, no external data egress, fits the project's self-hosted/no-PaaS-lock-in constraint (BR-7) and its Docker/Gitea infra. Trade-off: slower inference than a hosted API and depends on local CPU/GPU capacity.

## Decision

Use **Ollama** (self-hosted, run via the `ollama/ollama` Docker image) for both chat generation and embeddings:

- Chat generation: `llama3.1`
- Embeddings: `nomic-embed-text`

Both models are pulled into the `ollama` service's volume after first `docker compose up` (see [local setup](../development/setup.md#4-ollama-models-first-time-only)). Connection is configured via `OLLAMA_BASE_URL`, `OLLAMA_CHAT_MODEL`, and `OLLAMA_EMBEDDING_MODEL` in `.env`.

## Consequences

- No per-token API cost and no external API key to manage/rotate — good fit for a solo, budget-free side project.
- Keeps all user activity data and prompts on Aadi's own infrastructure, satisfying BR-7 and NFR-6 more directly than a hosted API would.
- Inference latency and quality depend on local hardware; if `llama3.1` proves too slow or low-quality for NFR-3 (chat should start streaming within 2-3s), a smaller/quantized model or a switch to a hosted API can be revisited — this ADR can be superseded before Week 4 if that happens.
- Both `backend/` (API calls to Ollama) and the sync/embedding pipeline (Week 3-4) will depend on the `ollama` service being up; this is already included in `docker-compose.yml`.
