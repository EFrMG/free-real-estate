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

## Upload limits

The Worker allows up to 50 images and 50 MiB in R2 across the whole site, in addition to the existing 5 MiB limit per image. An atomic D1 counter reserves space before each R2 write. On an upload, we count any existing objects under `uploads/` before accepting a new one. Removing a listing or successfully replacing its images releases the old space; the daily demo reset removes remaining uploads.

The frontend compresses supported images to WebP when that produces a smaller file.
