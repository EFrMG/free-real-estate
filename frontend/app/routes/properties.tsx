import type { Route } from "./+types/properties";

import { lazy, Suspense } from "react";
import type { PropertyData } from "@free-real-estate/shared";
import FilterInput from "~/components/PropertiesFilterInput";
import PropertyCard from "~/components/PropertyCard";
import ClientOnly from "~/components/ClientOnly";

const Map = lazy(() => import("~/components/Map"));

export async function loader() {
  const response = await fetch("http://localhost:3000/api/properties");

  if (!response.ok) {
    throw new Response("Failed to fetch properties", { status: 500 });
  }

  const properties: PropertyData[] = await response.json();
  return { properties };
}

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

export default function Properties({ loaderData }: Route.ComponentProps) {
  const { properties } = loaderData;

  const mapFallback = (
    <div className="md:sticky md:top-[7.5vh] h-[35vh] md:h-[85vh] w-[85%] md:w-[95%] md:mt-24 mx-auto rounded-lg bg-slate-400/36 animate-pulse">
      <p className="block w-fit mx-auto pt-12 text-xl text-gray-100">
        Loading Map...
      </p>
    </div>
  );

  const mapPopovers = properties.map(
    ({
      id,
      title,
      exteriorImage,
      bedrooms,
      bathrooms,
      city,
      address,
      latitude,
      longitude,
    }: PropertyData) => ({
      id,
      title,
      exteriorImage,
      bedrooms,
      bathrooms,
      city,
      address,
      latitude,
      longitude,
    }),
  );

  return (
    <main className="gen-main">
      {/* Left side */}
      <div className="max-md:order-1">
        <FilterInput />

        {properties.map((property) => (
          <PropertyCard
            key={`property-card-${property.id}`}
            property={property}
          />
        ))}
      </div>
      {/* Right side */}
      <div className="max-md:order-0 md:bg-amber-100">
        <ClientOnly>
          {() => (
            <Suspense fallback={mapFallback}>
              <Map
                marginTop={24}
                viewportHeight={85}
                zoomLevel={4}
                scrollable={false}
                mapPopovers={mapPopovers}
              />
            </Suspense>
          )}
        </ClientOnly>
      </div>
    </main>
  );
}
