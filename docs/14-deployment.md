# HabitFlow — Deployment

## 1. Environments
| Env | Purpose | URL | DB | AI (real) | Data |
|---|---|---|---|---|---|
| local | dev | localhost:3000/4000 | docker pg | mock/stub | seeded fixtures |
| staging | QA, preview PRs | preview.habitflow.app | staging pg | test model | synthetic |
| prod | live | habitflow.app | prod pg | production | real (encrypted) |

- **Preview deploys** per PR (Vercel preview + isolated staging services).
- **Feature flags** gate rollouts: canary % → groups → 100%.

## 2. CI/CD Pipeline (GitHub Actions)
```
push → lint+typecheck → unit tests → build → e2e (staging) →
  container build (NestJS) → Trivy scan → push to ECR →
  migration gate (Prisma migrate deploy, backup first) →
  deploy (ArgoCD / GitHub Actions + kubectl) → smoke tests →
  observability verification (SLO check) → feature-flag enable
```
- Frontend deploys via Vercel (no build container needed); preview per PR.
- DB migrations: automatic on deploy with `pre-deploy backup` step + zero-downtime
  strategy (expand/contract), never destructive auto-run in prod.

## 3. Infrastructure (AWS + Cloudflare + Vercel)
- **DNS/CDN/WAF/DDoS:** Cloudflare (proxy, HTTP/3, bot mgmt, rate rules, SSL).
- **Frontend:** Vercel (Next.js) — edge SSR, ISR, previews, zero-config cache headers.
- **Backend:** AWS EKS (managed k8s) — stateless NestJS deployment, HPA
  (CPU + custom queue-depth metric), ClusterAutoscaler/Karpenter.
- **Workers:** separate Node worker deployment consuming BullMQ; autoscaled on
  queue depth.
- **Databases:** AWS RDS PostgreSQL 16 (Multi-AZ, automated backups, PITR, read
  replica(s) for analytics), Redis via ElastiCache (Redis 7, cluster mode for
  scale) — BullMQ + cache + rate limit + pub/sub.
- **Object storage:** Cloudflare R2 (media) with Cloudflare Image Resizing; S3 for
  backups/logs archives.
- **Secret management:** AWS Secrets Manager / SSM Parameter Store (+ Cloudflare
  env vars for edge).
- **Email:** transactional (Resend/SES) — verification, resets, receipts, digests;
  template localized.

## 4. Kubernetes Deploy Details
- Namespaces: `habitflow-app`, `workers`, `ai`, `integrations`.
- Resources: requests/limits per service; HPA; PDBs (min 2 replicas); liveness/
  readiness probes; OPA/Gatekeeper policies (no root, read-only rootfs, resource
  bounds); pod security standards restricted.
- Ingress: ALB/NGINX + Cloudflare tunnel/integration; mTLS optional inside mesh
  (service mesh deferred, Istio v1.1).
- Backup: nightly `pg_dump` + WAL archiving; restore drill automated monthly.

## 5. Release Strategy
- **Zero-downtime:** rolling updates (maxUnavailable 0, maxSurge 1), migrations
  expand/contract, read replicas absorb migration load.
- **Rollback:** image rollback via ArgoCD sync; DB rollback via PITR only for data
  issues (migrations are forward-only + reversible up front).
- **Canary:** flag-based rollout; smoke + SLO gate (error rate < 0.1%, p95 within
  budget) before widening.

## 6. Environment Config & Secrets
- Config via Helm values / ConfigMaps; secrets only in Secrets Manager + mounted
  via External Secrets Operator.
- 12-factor: everything configurable; no hardcoded URLs/keys.

## 7. Monitoring & Alerting (deployment-coupled)
- Health endpoints: `/healthz`, `/readyz`, `/livez` per service.
- Synthetic checks (Uptime/Sentry) on critical paths (login, check-in, coach).
- Alerts: SLO burn alerts, DB CPU/connections, Redis memory, queue backlog,
  AI spend spikes, 5xx surge, backup failure.

## 8. Cost Management
- Right-sizing autoscalers; spot for stateless workers; RDS provisioned vs Aurora
  decision at scale; R2 egress-free; budget alerts at 50/80/100%.

## 9. Release Checklist (prod)
1. Migrations reviewed + backup taken
2. Feature flag off-by-default
3. Deploy API → deploy frontend → verify /healthz + smoke (login, habit, coach)
4. Gradual flag rollout with SLO gate
5. Post-deploy: traces, error rate, AI spend, retention signals reviewed
