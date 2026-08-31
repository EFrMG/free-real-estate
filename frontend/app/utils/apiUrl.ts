/**
 * Base URL of the backend API, with no trailing slash.
 *
 * Set VITE_API_URL at build time to point at the deployed backend
 * Vite inlines it into both the server and browser bundles. It works from loaders, clientLoaders and actions alike.
 */
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
