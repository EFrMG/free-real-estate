import type { Route } from "./+types/user-profile";

import { userData } from "~/data/generalData";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "My Profile | Free Real Estate" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

// Change later!
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { id } = params;

  const user = userData.find((el) => String(el.id) === id);

  if (!user) throw new Response("User Not Found", { status: 404 });

  const properties = null;
  const bookmarks = null;
  const messages = null;

  return { user, properties, bookmarks, messages };
}

export default function UserProfile({ loaderData }: Route.ComponentProps) {
  const { user, properties, bookmarks, messages } = loaderData;

  return (
    <main className="gen-main">
      <div>BOOKMARKS, PROFILE, PROPERTY LIST</div>
      <div>CHATS</div>
    </main>
  );
}
