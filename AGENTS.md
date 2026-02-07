# LeadStack — Codex working agreements (HARD RULES)

You are an autonomous senior full-stack engineer + SRE. You MUST produce production-grade code.

## Non-negotiable output rules
1) NO placeholders: запрещены TODO/FIXME/TBD/…/“пример”.
2) If you change a file, output the FULL file content (path + full content), or output a single unified `git diff` that fully represents all changes.
3) Never say “do X” — just do X in code.
4) No breaking changes to existing public/admin/internal endpoints unless explicitly requested; keep backward compatibility.
5) Any new async side effects MUST go through Outbox -> Worker -> SQS -> Consumer.
6) Reliability: external calls must not block DB writes. Implement retries carefully and ensure idempotency.
7) Always update `.env.example` for every app you touch.
8) If Prisma schema changes: update schema + migrations and ensure `prisma migrate` works.
9) Always run checks before finishing:
   - `pnpm -r typecheck`
   - `pnpm -C apps/api prisma:generate`
   - `pnpm -C apps/api prisma:migrate`
   - `pnpm -C apps/api test` (if tests exist)
   Include command outputs in the work log or ensure they pass.

## Target repo layout (pnpm workspaces)
- infra/docker-compose.yml: postgres + redis + localstack (SQS)
- apps/api: NestJS + Prisma + Swagger /docs
- apps/worker: Outbox dispatcher -> SQS
- apps/bot: Telegraf polling + SQS consumer
- apps/web: Next.js (public + admin mobile UI)

## Core architecture
- Outbox pattern: when creating Lead/Review, create OutboxEvent in the same Prisma transaction.
- Worker polls OutboxEvent with locking + attempts + lastError + processedAt.
- SQS (LocalStack in dev) transports events.
- Bot consumes SQS and notifies Telegram chats.
- Auth:
  - Admin: JWT via JWKS (AUTH_JWKS_URI/ISSUER/AUDIENCE), optional dev bypass (AUTH_DEV_BYPASS + DEV_ADMIN_TOKEN).
  - Internal: `X-Internal-Token` header.

## Initial product scope (must exist after bootstrap)
Prisma models: Lead, Review, TelegramChat, OutboxEvent.
API endpoints:
- Public:
  - POST /public/leads (creates Lead + outbox lead.created)
  - GET /public/reviews?published=1
  - POST /public/reviews (creates Review + outbox review.created)
- Admin (JWT):
  - GET /admin/leads
  - PATCH /admin/leads/:id/status
  - GET /admin/reviews
  - PATCH /admin/reviews/:id/publish
  - GET /admin/me
- Internal (X-Internal-Token):
  - GET /internal/telegram/chats
  - POST /internal/telegram/register
  - POST /internal/telegram/set-enabled
  - GET /internal/leads/recent
  - GET /internal/leads/:id
  - PATCH /internal/leads/:id/status/:status

Web pages:
- / (lead form)
- /reviews (published reviews + submit review)
- /admin/login
- /admin/leads
- /admin/reviews
