import type { Route } from "./+types/home";

import SearchInput from "~/components/home/SearchInput";
import HeroRightSide from "~/components/HeroRightSide";

export async function loader() {
  const citiesRes = await fetch("http://localhost:3000/api/cities");

  if (!citiesRes.ok) {
    throw new Response("Failed to fetch cities", { status: 500 });
  }

  const cities: string[] = await citiesRes.json();
  return cities;
}

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

export default function Home({ loaderData }: Route.ComponentProps) {
  const cities = loaderData;

  return (
    <main className="gen-main">
      {/* Left side */}
      <div className="gen-left">
        <h1 className="text-3xl">
          Find the place of your dreams at unmatched discounts
        </h1>
        <p className="pt-12 text-lg">
          Aquiring a place to live the joy of life should not be as expensive as
          life is in the end. We provide the best places at a price that might
          as well not be real.
        </p>
        <h2 className="py-6 text-xl">Get your deal today!</h2>

        <SearchInput cities={cities} />

        <div className="flex justify-center gap-8 max-sm:flex-wrap py-6">
          <hgroup>
            <span className="block font-semibold text-center text-xl">3</span>
            <h2 className="text-lg text-center">Awarded Industry Prices</h2>
          </hgroup>
          <hgroup>
            <span className="block font-semibold text-center text-xl">
              25<span className="opacity-lesser">+</span>
            </span>
            <h2 className="text-lg text-center">Years of Experience</h2>
          </hgroup>
          <hgroup>
            <span className="block font-semibold text-center text-xl">
              200<span className="opacity-lesser">+</span>
            </span>
            <h2 className="text-lg text-center">Properties Ready</h2>
          </hgroup>
        </div>
      </div>

      {/* Right side */}
      <HeroRightSide />
    </main>
  );
}
