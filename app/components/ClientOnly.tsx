import { useState, useEffect, type ReactNode } from "react";

interface ClientOnlyProps {
  children: () => ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that only renders its children on the client side.
 * This is useful for components that depend on browser-only APIs like `window`.
 *
 * @param children - A function that returns the component to render on the client.
 *                  Using a function prevents the component from being initialized on the server.
 * @param fallback - An optional component to render on the server or during hydration.
 */
export default function ClientOnly({
  children,
  fallback = null,
}: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children()}</>;
}
