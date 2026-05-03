import type { Route } from "./+types/property-item";

import { lazy, Suspense } from "react";
import { propertyData, userData } from "~/data/propertyData";
import {
  GoBookmark,
  GoBookmarkSlash,
  GoCommentDiscussion,
  GoLocation,
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
    <div className="sticky top-[7.5vh] h-[35vh] w-[95%] mt-12 mx-auto rounded-lg bg-slate-400/36 animate-pulse">
      <p className="block w-fit mx-auto pt-12 text-xl text-gray-100">
        Loading Map...
      </p>
    </div>
  );

  const mapPopover = [
    {
      title,
      img,
      bedrooms,
      bathrooms,
      address,
      latitude,
      longitude,
    },
  ];

  return (
    <main className="gen-main">
      <div className="p-4">
        <img
          src={img}
          alt={title}
          draggable="false"
          className="property-img-outline w-full h-84 mt-8 shadow-lg rounded-lg"
        />

        <h1 className="my-6 text-center font-bold text-3xl text-amber-900">
          {title}
        </h1>

        <div className="grid md:grid-cols-[2fr_1fr] gap-8">
          <div className="stack-12 justify-between">
            <p className="flex items-center gap-[1ex]">
              <GoLocation size={24} color="var(--color-amber-700)" />
              <span className="text-gray-700">Address: {address}</span>
            </p>
            <p className="text-lg text-gray-700">{description}</p>

            <div className="flex justify-between">
              <div>USER DATA OR CONTACT US</div>

              <div className="w-fit [&_button]:rounded-sm [&_button]:shadow-md">
                <button className="mr-4">
                  <GoCommentDiscussion
                    size={28}
                    color="var(--color-amber-500)"
                    title="Post comment"
                  />
                </button>

                {true ? (
                  <button>
                    <GoBookmark
                      size={28}
                      color="var(--color-amber-500)"
                      title="Bookmark"
                    />
                  </button>
                ) : (
                  <button>
                    <GoBookmarkSlash
                      size={28}
                      color="var(--color-amber-500)"
                      title="Remove bookmark"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="h-fit p-4 bg-amber-100/18 rounded-lg shadow-md inset-shadow-xs">
            <h3 className="mb-4 text-center font-semibold text-xl">Details</h3>
            <div className="[&_p]:py-2 [&_p]:flex [&_p]:justify-between [&>p]:border-b [&>p]:border-amber-300/74">
              <p>
                <span>Price:</span>{" "}
                <span className="text-emerald-700">${price}</span>
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
        <div className="mt-12 mx-6 mb-4">
          <h3 className="mb-2 text-xl font-bold">General:</h3>
          <p className="inline-block w-full p-4 rounded-lg bg-amber-50">
            {null}
          </p>
        </div>
        <div className="mt-12 mx-6 mb-4">
          <h3 className="mb-2 text-xl font-bold">Room Sizes:</h3>
          <p className="inline-block w-full p-4 rounded-lg bg-amber-50">
            {null}
          </p>
        </div>
        <div className="mt-12 mx-6 mb-4">
          <h3 className="mb-2 text-xl font-bold">Nearby Places:</h3>
          <p className="inline-block w-full p-4 rounded-lg bg-amber-50">
            {null}
          </p>
        </div>

        <div className="mt-12 mx-6 mb-4">
          <h3 className="text-xl font-bold">Location:</h3>
        </div>
        <ClientOnly>
          {() => (
            <Suspense fallback={mapFallback}>
              <Map
                marginTop={8}
                viewportHeight={35}
                zoomLevel={9}
                scrollable={true}
                mapPopovers={mapPopover}
              />
            </Suspense>
          )}
        </ClientOnly>
      </div>
    </main>
  );
}
