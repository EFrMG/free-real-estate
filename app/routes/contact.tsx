import type { Route } from "./+types/contact";

import HeroRightSide from "~/components/HeroRightSide";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact | Free Real State" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

export default function Contact() {
  return (
    <main className="gen-main">
      <div></div>
      <HeroRightSide />
    </main>
  );
}
