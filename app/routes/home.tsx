import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Free Real State" },
    {
      name: "description",
      content: "The place where your future place is found.",
    },
  ];
}

export default function Home() {
  return (
    <main>
      <div>HELLO!</div>
    </main>
  );
}
