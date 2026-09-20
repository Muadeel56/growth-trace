# GrowthTrace — Business Requirements Document

2026-09-20 · @Someone

## 1. Executive Summary

GrowthTrace is a multi-tenant SaaS platform that connects to a user's GitHub account and turns their real commit, repo, and PR history into an evidence-based dashboard and conversational assistant. Instead of asking users to log their own achievements, it derives them automatically from what they actually shipped.

For Aadi, this is a birthday project (build window: Sep 20 – Oct 24, 2026) with two goals held equally: (1) deepen Node.js backend skills into genuinely new territory — OAuth2, multi-tenancy, per-user background jobs, and a RAG/LLM pipeline — and (2) create a personal tool that counters self-underestimation by surfacing real, retrievable proof of growth rather than vague encouragement.

## 2. Business Objectives

- **Skill growth**: gain hands-on production experience with OAuth2 authorization flows, multi-tenant data isolation, per-user BullMQ job scoping, vector embeddings, RAG retrieval, LLM API integration, and streaming UI in React — all areas beyond Aadi's current Node.js project history (Repo Radar, PitchPulse).
- **Personal value**: produce a tool Aadi will actually use — asking it honest questions about his own output during moments of self-doubt and getting answers backed by real commits/PRs, not generic affirmation.
- **Portfolio value**: a deployed, demoable SaaS product that shows full-stack + AI capability for future opportunities (e.g. the Dubai job search).
- **Product discipline**: practice scoping a real feature set tightly enough to ship in a fixed 5-week window, resisting scope creep (no teams, no social features, no multi-source integrations beyond GitHub in v1).

## 3. Scope

**In scope (v1, by Oct 24):**

- Signup/login via GitHub OAuth2
- Automatic sync of a connected user's commits, repos, and PRs
- Per-user background sync jobs (BullMQ), idempotent and rate-limit-aware
- Embedding of activity summaries and storage in pgvector
- A RAG-backed chat endpoint answering questions about the user's own history
- A dashboard: timeline, streaks, monthly shipped counts, most-active repo
- Self-deployment on Aadi's own Docker/Gitea infrastructure

**Out of scope (v1):**

- Data sources other than GitHub (GitLab, Jira, etc.)
- Teams, shared workspaces, or social/comparison features
- Mobile app
- Payment/billing (single free tier only)
- Admin dashboard or analytics for the operator
- LangChain in the core path (evaluated only as an optional Week 5 refactor experiment, not a dependency)

## 4. Stakeholders & Target Users

| Role | Who | Interest |
| --- | --- | --- |
| Builder / primary user | Aadi | Learns the stack, uses the product on himself first |
| Secondary users | Developers who want an honest record of their own output | Sign up, connect GitHub, view their own dashboard/chat — no interaction with other users' data |

This is a solo project with no team dependency; "stakeholders" here means Aadi as builder-and-user, plus any future signups once deployed publicly.

## 5. Business Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| BR-1 | Users can sign up and log in using their GitHub account | Must |
| BR-2 | The system automatically ingests a connected user's GitHub activity without manual data entry | Must |
| BR-3 | Each user sees only their own data; no cross-user data exposure | Must |
| BR-4 | Users can ask natural-language questions about their own history and get answers grounded in their real activity | Must |
| BR-5 | Users can view a visual timeline/dashboard of their derived growth stats | Must |
| BR-6 | The system re-syncs periodically without duplicating or losing events | Must |
| BR-7 | The product is deployable on Aadi's own infrastructure without third-party PaaS lock-in | Should |
| BR-8 | The chat feels responsive (streamed, not a long blocking wait) | Should |

## 6. Success Criteria

- Aadi can log into his own deployed instance, connect his real GitHub account, and get a working dashboard + chat within the 5-week window.
- The chat correctly answers at least a handful of real test questions ("what did I ship in June") using retrieved data, not hallucinated content.
- The OAuth, multi-tenant, and per-user job pieces work correctly under at least two real test accounts (data isolation verified manually).
- The project is deployed and reachable, not just running locally.
- Aadi can explain, from memory, how the RAG pipeline works end to end — embedding, storage, retrieval, prompt construction — without referring back to this document.

## 7. Assumptions, Constraints & Risks

**Assumptions**

- Aadi builds this solo, part-time, alongside his day job at QTO Dev.
- GitHub is a sufficient single data source for v1's "evidence-based growth" concept.
- An LLM API (OpenAI/Anthropic) or a local model via Ollama is acceptable for generation — exact choice to be locked before Week 4.

**Constraints**

- Fixed deadline: Oct 24, 2026 (5 weeks from Sep 20).
- Solo development, no team to split OAuth/RAG/frontend work across.
- Self-hosted deployment on existing Docker/Gitea infra, not a managed cloud platform.

**Risks**

| Risk | Impact | Mitigation |
| --- | --- | --- |
| OAuth + multi-tenancy takes longer than planned (new territory) | Delays everything downstream | Timebox Week 1 strictly; fall back to a simpler session model if OAuth stalls |
| GitHub API rate limits under real testing | Sync jobs fail/stall | Build rate-limit handling and backoff from the start, not as an afterthought |
| RAG answers feel generic or ungrounded | Undermines the emotional/product goal | Test retrieval quality manually each week with real personal data, not just unit tests |
| Scope creep (LangChain, extra data sources, polish) | Misses the Oct 24 deadline | Treat Week 5 items beyond deploy as optional buffer, cut first |

## 8. Timeline & Milestones

| Week | Dates | Milestone |
| --- | --- | --- |
| 1 | Sep 20 – Sep 26 | Fastify skeleton, Prisma schema, GitHub OAuth login working end to end |
| 2 | Sep 27 – Oct 3 | GitHub API client, per-user BullMQ sync job, idempotent event storage |
| 3 | Oct 4 – Oct 10 | Activity summarization, embedding pipeline, pgvector storage |
| 4 | Oct 11 – Oct 17 | RAG retrieval + LLM chat endpoint, streaming response |
| 5 | Oct 18 – Oct 24 | Next.js dashboard + chat UI, self-deploy, buffer for fixes |
