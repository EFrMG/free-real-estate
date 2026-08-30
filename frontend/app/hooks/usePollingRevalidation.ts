import { useEffect, useRef } from "react";
import { useRevalidator } from "react-router";

/**
 * Re-runs the active route loaders on an interval so chats and the unread badge stay fresh without a socket, skipping ticks while the tab is hidden or while a revalidation is still in flight.
 *
 * The revalidator is held in a ref because its identity changes on every state transition, which would otherwise tear down and rebuild the interval.
 *
 * @param intervalMs Milliseconds between revalidations.
 */
export default function usePollingRevalidation(intervalMs: number) {
  const revalidator = useRevalidator();
  const revalidatorRef = useRef(revalidator);

  revalidatorRef.current = revalidator;

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      if (revalidatorRef.current.state !== "idle") return;

      revalidatorRef.current.revalidate();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [intervalMs]);
}
