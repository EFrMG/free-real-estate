import type { Route } from "./+types/home";

import SearchInput from "~/components/searchInput";

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
      <div className="my-auto mr-[13.5%]">
        <h1 className="text-5xl">
          Find the place of your dreams at unmatched discounts
        </h1>
        <p className="py-12">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis ut
          mollitia magni libero repudiandae modi est! Debitis quia voluptates
          aperiam doloribus, eveniet unde recusandae aut molestias facilis
          temporibus omnis. Alias.
        </p>

        <SearchInput />

        <div className="flex gap-8">
          <hgroup>
            <span className="block font-bold text-center text-2xl">38</span>
            <h2 className="text-xl text-center">Awarded Industry Prices</h2>
          </hgroup>
          <hgroup>
            <span className="block font-bold text-center text-2xl">25+</span>
            <h2 className="text-xl text-center">Years of Experience</h2>
          </hgroup>
          <hgroup>
            <span className="block font-bold text-center text-2xl">1000+</span>
            <h2 className="text-xl text-center">Properties Ready</h2>
          </hgroup>
        </div>
      </div>
      <div className="relative flex items-center sm:bg-amber-100">
        <img
          src="https://picsum.photos/1080/1920"
          alt="Hero image"
          className="absolute right-0 max-w-none w-[120%] h-[80%]"
        />
      </div>
    </main>
  );
}
