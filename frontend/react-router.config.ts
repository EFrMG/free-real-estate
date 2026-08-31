import type { Config } from "@react-router/dev/config";

export default {
  // Server-side render on every request, executed by the Cloudflare Worker (see workers/app.ts)
  // No prerender config: the Cloudflare Vite plugin doesn't support build-time prerendering, and every route here needs live/authenticated data anyway
  ssr: true,
  future: {
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
