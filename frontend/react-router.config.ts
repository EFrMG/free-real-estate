import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render on every request, executed by the Cloudflare Worker (see workers/app.ts)
  // No prerender config: the Cloudflare Vite plugin doesn't support build-time prerendering, and every route here needs live/authenticated data anyway
  ssr: true,
  future: {
    v8_viteEnvironmentApi: true,
    // Root middleware shares one /api/auth/me call between every loader and action of a request (see app/utils/auth.ts)
    v8_middleware: true,
  },
} satisfies Config;
