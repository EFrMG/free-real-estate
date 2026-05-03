import type { Route } from "./+types/property-item";

import { lazy, Suspense } from "react";
import propertyData from "~/data/propertyData";
import {
  GoBookmark,
  GoBookmarkSlash,
  GoCommentDiscussion,
} from "react-icons/go";
import ClientOnly from "~/components/ClientOnly";

const Map = lazy(() => import("~/components/Map"));

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { id } = params;

  const property = propertyData.find((el) => String(el.id) === id);

  if (!property) {
    throw new Response("Property Not Found", { status: 404 });
  }

  return property;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Property | Free Real State" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

export default function PropertyItem({ loaderData }: Route.ComponentProps) {
  const {
    title,
    description,
    img,
    bedrooms,
    bathrooms,
    price,
    address,
    latitude,
    longitude,
  } = loaderData;

  const mapFallback = (
    <div className="sticky top-[7.5vh] h-[75vh] w-[95%] mt-12 mx-auto rounded-lg bg-slate-400/36 animate-pulse">
      <p className="block w-fit mx-auto pt-12 text-xl text-gray-100">
        Loading Map...
      </p>
    </div>
  );

  const mapPopover = {
    title,
    img,
    bedrooms,
    address,
    latitude,
    longitude,
  };

  return (
    <main className="gen-main">
      <div className="p-4">
        <h1 className="my-6 text-center font-bold text-3xl text-amber-900">
          {title}
        </h1>
        <img
          src={img}
          alt={title}
          draggable="false"
          className="property-img-outline w-full max-h-84 mb-12 shadow-lg rounded-lg"
        />

        <div className="grid md:grid-cols-[2fr_1fr] gap-8">
          <div>
            <p className="text-lg text-gray-700">{description}</p>
            <div className="w-fit mt-12 ml-auto [&_button]:rounded-sm [&_button]:shadow-md">
              <button className="mr-4">
                <GoCommentDiscussion size={28} color="var(--color-amber-500)" />
              </button>

              {true ? (
                <button>
                  <GoBookmark size={28} color="var(--color-amber-500)" />
                </button>
              ) : (
                <button>
                  <GoBookmarkSlash size={28} color="var(--color-amber-500)" />
                </button>
              )}
            </div>
          </div>

          <div className="h-fit p-4 bg-amber-100/18 rounded-lg shadow-md inset-shadow-xs">
            <h2 className="mb-4 text-center font-semibold text-xl">Details</h2>
            <div className="[&_p]:py-2 [&_p]:flex [&_p]:justify-between [&>p]:border-b [&>p]:border-amber-300/74">
              <p>
                <span>Price:</span> <span>${price}</span>
              </p>
              <p>
                <span>Address: {address}</span>
              </p>
              <p>
                <span>Bedrooms:</span> <span>{bedrooms}</span>
              </p>
              <p>
                <span>Bathrooms:</span> <span>{bathrooms}</span>
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Coordinates: {latitude}, {longitude}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:bg-amber-100">
        <ClientOnly>
          {() => (
            <Suspense fallback={mapFallback}>
              <Map
                marginTop={12}
                viewportHeight={75}
                zoomLevel={9}
                mapPopovers={[mapPopover]}
              />
            </Suspense>
          )}
        </ClientOnly>
      </div>
    </main>
  );
}
