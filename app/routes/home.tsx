import type { Route } from "./+types/home";
import Header from "~/components/header";

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
      <Header />
    </main>
  );
}
