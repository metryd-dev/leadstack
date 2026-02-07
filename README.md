# LeadStack

Monorepo with API, worker, bot and web apps for lead/review processing with outbox pattern.

## Apps
- `apps/api` NestJS API + Prisma
- `apps/worker` Outbox dispatcher to SQS
- `apps/bot` Telegram + SQS consumer
- `apps/web` Next.js frontend

## Infra
`infra/docker-compose.yml` provisions postgres, redis and localstack.
