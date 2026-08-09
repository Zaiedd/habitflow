# HabitFlow — Security

> Reference: OWASP ASVS L2, OWASP Top 10 2021. Wellness/health data treated as
> sensitive personal data. AI pipeline adds LLM-specific controls (OWASP LLM Top 10).

## 1. Threat Model (top risks)
| Threat | Vector | Mitigation |
|---|---|---|
| Account takeover | Credential stuffing, phish, leaked pw | Argon2id, 2FA, device binding, rate limits, anomaly alerts |
| Session theft | XSS, token leak | HttpOnly cookies, short-lived tokens, refresh rotation, revocation |
| Data breach (wellness data) | DB/backup exfiltration | AES-256 at rest, field-level encryption, least privilege, audit |
| Prompt injection / jailbreak | AI chat | Guardrail agent, tool-call allowlist, output filtering, data egress controls |
| Privacy leak (prompt → model) | Third-party LLM | No training on user data, data minimization, EU residency option, PII scrubbing |
| Payment fraud | Stripe misuse, webhook spoof | HMAC webhook verification, 3DS, idempotency, amount checks |
| Abuse (community) | Spam, harassment, CSAM | Moderation, rate limits, reporting, age gate 16+ |
| SSRF / malicious URLs | Avatar/import URLs | URL allow/deny, SSRF guard on fetches |
| Client-side supply chain | npm packages | Lockfiles, Dependabot, SBOM, npm provenance, npm audit in CI |

## 2. Authentication & Session
- Passwords: **Argon2id** (OWASP-recommended params), pepper optional; never log.
- Tokens: access JWT 15 min (signed RS256, `jti`, audience, claims); refresh token
  random 64-byte, hashed at rest (SHA-256), rotation on use, device-bound, revocable.
- 2FA: TOTP (RFC 6238), backup codes (hashed, single-use).
- OAuth (Google/Apple): PKCE, state nonce, email verified check, account linking
  with email ownership verification.
- Session anomaly: new-device login alert; force logout all devices.
- Lockout: 5 failed logins → exponential backoff + email alert.

## 3. Data Protection
- **Transport:** TLS 1.2+ (1.3 preferred), HSTS, secure cookies.
- **At rest:** RDS/K8s volume AES-256; `integration_connections.tokens_enc`,
  `users.two_factor_secret_enc` encrypted with envelope encryption (KMS/KEK).
- **Sensitive columns:** journal `body`, AI memories encrypted (optionally via
  pgcrypto pgp_sym_encrypt with app-level key; keys in secret manager, not code).
- **PII minimization:** only required fields; pseudonymous analytics IDs.
- **Logs:** no PII/payment data; masking; retention policy (30d ops, 7y billing).

## 4. AI Security (OWASP LLM Top 10 applied)
- **Prompt injection:** system-boundary instructions, user input delimited and
  treated as data, tool-call allowlist, output is data-not-instructions.
- **Data leakage:** prompt context limited to user's own data (row-level scope),
  no cross-user retrieval; redact secrets before embedding.
- **Hallucination:** grounded tool calls for all numbers; citation refs; confidence
  thresholds; "I don't know" fallback.
- **Jailbreaks:** guardrail agent + response classifier (safety filters), content
  policy, human flag & audit trails, rate caps per user.
- **Supply chain (models):** pin model versions, monitor provider terms; optional
  self-hosted/regional inference for EU/enterprise.

## 5. API & Application Security
- CSRF: state-changing endpoints use `SameSite=Lax/Strict` cookies + origin checks;
  OAuth code flow with PKCE.
- XSS: React escaping + CSP (default-src 'self', strict CSP via nonces), sanitized
  rich text (DOMPurify), no `dangerouslySetInnerHTML` without review.
- SQL injection: Prisma parameterized queries; no raw SQL without review.
- SSRF: outbound fetch allowlist + IP private-range blocking on any URL intake.
- Rate limiting (Redis): auth, writes, AI, uploads (see API doc). Abuse alerts.
- Uploads: presigned URLs, MIME + magic-byte validation, AV scan, size caps,
  private bucket + short-lived signed reads for journal/media.
- Webhooks (Stripe/integrations): HMAC signature verification, replay protection,
  idempotency keys.

## 6. RBAC & Authorization
- Roles: `USER`, `PRO`, `FAMILY_OWNER`, `MODERATOR`, `ADMIN`.
- Row-level security patterns: all queries scoped by `user_id` via repository
  layer + RLS policies (Postgres RLS enabled for core tables).
- Group roles: OWNER/ADMIN/MEMBER; feed privacy scoping (PRIVATE/FRIENDS/GROUP/PUBLIC).
- Entitlement guard enforces plan limits server-side (never trust client).

## 7. Compliance
- **GDPR/UK GDPR:** lawful basis, DPA, right to access/rectify/erase/port/object,
  72h breach notification, DSAR tooling, data residency (EU/US selection).
- **CCPA/CPRA:** opt-out of "sale"/sharing (we don't sell), right to delete.
- **ePrivacy:** consent manager for analytics/tracking; no tracking before consent.
- **COPPA/KYCC:** minimum age 16; no child-directed marketing; age check in signup.
- **HPPA-lite (wellness):** no sharing with insurers/employers; clear privacy policy.
- **Accessibility-adjacent:** security notices in multiple languages.

## 8. Secure SDLC
- Secrets: never in repo; `.env` git-ignored; use Vault/SSM/Cloudflare Secrets.
- Dependency scanning: `npm audit`, Snyk/Dependabot in CI; SBOM generation.
- Image scanning: Trivy on container images in CI and registry.
- SAST/DAST: ESLint security plugin, Semgrep, OWASP ZAP on staging.
- Pen test + responsible disclosure program before GA; bug bounty later.
- Incident response runbook; IR tabletop; backup/restore drills.

## 9. Key Management
- Master keys in KMS/Cloud KMS; KEK/DEK envelope pattern; automatic rotation;
  no keys in application code; restricted IAM policies.

## 10. Security Testing
- Unit: auth, entitlements, validators. Integration: RLS scoping tests, idempotency,
  webhook signature tests. E2E: OWASP ZAP baseline + Playwright security smoke.
- Monthly dependency + secret scan; quarterly pen test; annual SOC2-style audit
  planning (GA roadmap).
