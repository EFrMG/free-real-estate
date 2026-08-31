import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  data,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

import Header from "~/components/Header";
import forwardCookies from "~/utils/forwardCookies";
import { API_URL } from "~/utils/apiUrl";

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");

  try {
    const authRes = await fetch(API_URL + "/api/auth/me", {
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });

    if (authRes.ok) {
      const user = await authRes.json();

      // The badge counts people waiting on a reply, not individual messages
      const unreadRes = await fetch(
        API_URL + "/api/chats/unread-count",
        { headers: cookieHeader ? { Cookie: cookieHeader } : undefined },
      );

      const unreadSenders = unreadRes.ok ? (await unreadRes.json()).count : 0;

      // A failed 'unread' request may carry cookie-clearing headers (its refresh token was already rotated by the call above), we only forward it when it succeeded
      return data(
        { user, unreadSenders },
        { headers: forwardCookies(authRes, unreadRes.ok ? unreadRes : null) },
      );
    }
  } catch (error) {
    console.error(error); // The backend should handle this on requireAuth regardless
  }

  return null;
}

export const links: Route.LinksFunction = () => [
  {
    rel: "icon",
    type: "image/svg",
    href: "/favicon.svg",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ scrollbarGutter: "stable" }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="custom-scrollbar-light">
        <Header />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
