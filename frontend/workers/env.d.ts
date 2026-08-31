// The React Router Vite plugin generates this module at build or dev time; it has no file on disk, so tsc needs this ambient declaration to resolve it outside of Vite's own module graph
declare module "virtual:react-router/server-build" {
  import type { ServerBuild } from "react-router";

  const build: ServerBuild;
  export = build;
}
