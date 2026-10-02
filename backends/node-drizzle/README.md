# Free Real Estate Hono + Drizzle Backend

A lightweight, high-performance REST API serving as the primary data provider.

## Technology Stack

- **Framework**: [Hono](https://hono.dev/)
- **Runtime**: [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- **ORM**: [Drizzle](https://orm.drizzle.team/) (schema, queries, and migrations)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **Object storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/)
- **Validation**: [Zod](https://zod.dev/)
- **Password hashing**: scrypt

Copy `.env.example` to `.env`, replace the D1 database ID in `wrangler.json`, then apply migrations and start the local Worker:

```bash
pnpm migrate:be:local
pnpm dev:be
```

The daily database reset is a Cron Trigger. With the local Worker running, Wrangler exposes `/cdn-cgi/local/scheduled` as a local-only test endpoint that invokes the Worker's `scheduled()` handler; it is not an application route or a production URL.
