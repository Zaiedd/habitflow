# HabitFlow — Scalability

## 1. Capacity Model
- **GA targets:** 100k MAU → 1M MAU (design headroom, no redesign).
- Volumes at 1M MAU: ~2M daily check-ins, ~1M wellness logs, ~600k journal entries,
  250k AI conversations/day, ~100k daily plans, ~50M rows/month in `events`.

## 2. Horizontal Scaling Layers
| Layer | Strategy |
|---|---|
| Frontend | Vercel edge/SSR scale; static where possible; no server state |
| API (NestJS) | Stateless, HPA on EKS; session in Redis/DB, not memory |
| Workers | BullMQ consumers scaled on queue depth; idempotent jobs |
| Postgres | Read replicas for analytics/feeds; partitioning; connection pooling (PgBouncer) |
| Redis | Cluster mode; separate logical DBs/instances for cache vs queue vs rate-limit |
| Vector search | pgvector HNSW; shard later or move to dedicated vector store at scale |
| Media | R2/CDN; presigned uploads; no media through app servers |
| AI | Provider routing, caching, queued jobs off-peak; per-user caps |

## 3. Database Scaling
- **Partitioning (pg_partman):** `events`, `wellness_metrics`, `journal_entries`,
  `ai_messages` partitioned by `created_at` (monthly); `score_snapshots` by
  `computed_at`. Old partitions archived to S3 (cold) or dropped per policy.
- **Hot tables:** `habits`, `habit_completions` by user_id; index on
  `(user_id, occurred_at)`.
- **Read replicas:** route analytics/insights/reports and AI context reads to
  replicas; writes to primary. Replica lag tolerance (< 2 s) acceptable for
  non-critical reads.
- **Connection pooling:** PgBouncer (transaction mode) between API and primary;
  replica pool for reads.
- **Materialized views** for score snapshots + weekly aggregates (refreshed by
  workers) instead of on-the-fly aggregation.
- **Vacuum/analyze** automated; monitoring via pg_stat tables; index bloat alerts.

## 4. Application Caching
- Redis cache tiers: T0 hot (today plan, scores, feed pages) 60 s; T1 (templates,
  badges, i18n) longer TTL + invalidation via event tags.
- Cache-aside with explicit invalidation on write events (HabitFlow event bus).
- Distributed locks for jobs that must run once (daily plan per user).
- CDN caching for public marketing, static assets, template images.

## 5. Async Processing
- Everything non-interactive → queue (BullMQ): streaks, XP, badges, score
  recompute, AI jobs, notifications, integration sync, digests, exports.
- Queue prioritization: interactive-critical (streak/XP) > engagement (digests,
  nudges) > heavy analytics; DLQ + retry with backoff; dead-letter alerting.
- Rate of writes is decoupled from user action latency (fire-and-forget with
  idempotent consumers).

## 6. AI Scaling
- **Routing:** cheap model for short/stateless intents; premium for plans/reviews.
- **Batching:** nightly jobs (weekly/monthly reviews, digests) batched off-peak.
- **Prompt caching** + shared context retrieval to cut tokens.
- **Vertical sharding by agent type** when needed; dedicated AI worker pool.
- **Degradation:** if LLM saturated → fallback rules engine; queue backlog alerts.

## 7. Multi-Region / Residency (v1.1+)
- EU + US regions for data residency; per-account `region` attribute; WAL-stream
  replication for EU-only data; CDN stays global; auth edge handles routing.

## 8. Scalability Testing
- Load tests at 10× expected GA traffic; capacity benchmarks per pod/replica;
- Chaos: kill pods, failover read replica, Redis failover, LLM outage simulation;
- Autoscaling verification (HPA + queue-depth) in staging before GA.
- Budget guardrails: cost-per-MAU dashboard + SLO-based alerting.

## 9. Bottleneck Watchlist
- `events` ingest throughput (partition + batching + async side-effects).
- Analytics aggregation (read replicas + materialized views).
- Coach concurrency (queue depth, model rate limits, token costs).
- Long-tail notifications (dedup per user, cap per day).
