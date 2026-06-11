import type { Route } from "./+types/properties";
import type { PropertyData } from "@free-real-estate/shared";

import { lazy, Suspense } from "react";

import ClientOnly from "~/components/ClientOnly";
import FilterInput from "~/components/properties/FilterInput";
import PropertyCard from "~/components/properties/PropertyCard";

const Map = lazy(() => import("~/components/Map"));

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = String(url.searchParams);

  // Fetch properties with search param filters and cities for datalist element
  const [propertiesRes, citiesRes] = await Promise.all([
    fetch(
      `http://localhost:3000/api/properties${searchParams && `?${searchParams}`}`,
    ),
    fetch("http://localhost:3000/api/cities"),
  ]);

  if (!propertiesRes.ok || !citiesRes.ok) {
    throw new Response("Failed to fetch properties and cities", {
      status: 500,
    });
  }

  const properties: PropertyData[] = await propertiesRes.json();
  const cities: string[] = await citiesRes.json();

  return { properties, cities };
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
  const { properties, cities } = loaderData;

  const mapFallback = (
    <div className="md:sticky md:top-[7.5vh] h-[35vh] md:h-[85vh] w-[85%] md:w-[95%] md:mt-24 mx-auto rounded-lg bg-slate-400/36 animate-pulse">
      <p className="block w-fit mx-auto pt-12 text-lg text-gray-100">
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
      {/* Left column */}
      <div className="max-md:order-1 gen-left-column">
        <FilterInput cities={cities} />

        {properties.map((property) => (
          <PropertyCard
            key={`property-card-${property.id}`}
            property={property}
          />
        ))}
      </div>
      {/* Right column */}
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
