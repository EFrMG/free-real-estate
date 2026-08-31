/**
 * Reads a required environment variable, allowing a development fallback.
 * Throws at startup if the variable is missing while NODE_ENV=production: a misconfigured deploy fails fast instead of silently using a publicly-known default secret for the demo.
 */
export function requireEnv(name: string, devFallback: string): string {
  const value = process.env[name];

  if (value) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} must be set when NODE_ENV=production.`);
  }

  return devFallback;
}
