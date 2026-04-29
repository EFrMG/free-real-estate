import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Free Real State" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

export default function Home() {
  return (
    <main className="grid grid-cols-[60%_40%] max-w-7xl w-full min-h-screen mx-auto">
      <div>HELLO!</div>
      <div className="sm:bg-amber-100">HELLO!</div>
    </main>
  );
}
