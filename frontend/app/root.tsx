import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

import Header from "~/components/Header";
import { authMiddleware, getAuth } from "~/utils/auth";

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  // Anonymous visitors (no auth cookie) never reach the backend; the user and the badge arrive in one /auth/me call whose cookies authMiddleware forwards
  const { user } = await getAuth(context);

  if (!user) return null;

  // The badge counts people waiting on a reply, not individual messages
  const { unreadSenders, ...profile } = user;

  return { user: profile, unreadSenders };
}

export const meta: Route.MetaFunction = ({ location }) => {
  const siteTitle = "Free Real Estate";
  const description =
    "Real estate company: The place where your future place is found.";

  const ogImageUrl = "/og-image.png";

  return [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    // The first paint is opted out of mobile auto-darkening instead of flashing
    { name: "color-scheme", content: "only light" },

    { title: siteTitle },

    // Open Graph
    { property: "og:title", content: siteTitle },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImageUrl },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    {
      property: "og:url",
      content: `https://free-real-estate.macias-francisco-355237995.workers.dev${location.pathname}`,
    },

    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: siteTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImageUrl },
  ];
};

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
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
