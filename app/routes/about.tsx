import type { Route } from "./+types/about";

import HeroRightSide from "~/components/HeroRightSide";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About | Free Real State" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

export default function About() {
  return (
    <main className="gen-main">
      <div></div>
      <HeroRightSide />
    </main>
  );
}
