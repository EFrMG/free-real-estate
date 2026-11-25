import {
  createContext,
  createRequestHandler,
  RouterContextProvider,
} from "react-router";

// With middleware enabled, loaders and actions receive a RouterContextProvider rather than a plain load-context object; the Worker's bindings stay reachable through this context
export const cloudflareContext = createContext<{
  env: Env;
  ctx: ExecutionContext;
}>();

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  fetch(request, env, ctx) {
    const context = new RouterContextProvider();
    context.set(cloudflareContext, { env, ctx });

    return requestHandler(request, context);
  },
} satisfies ExportedHandler<Env>;
