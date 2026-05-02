import type { Route } from "./+types/properties";

import FilterInput from "~/components/PropertiesFilterInput";
import PropertyCard from "~/components/PropertyCard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Properties | Free Real State" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

export default function LogIn() {
  return (
    <main className="gen-main">
      <div>
        <FilterInput />
      </div>
      <div className="bg-amber-100">MAP</div>
    </main>
  );
}
