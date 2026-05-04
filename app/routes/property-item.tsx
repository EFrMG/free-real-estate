import type { Route } from "./+types/property-item";
import { lazy, Suspense } from "react";
import ClientOnly from "~/components/ClientOnly";

import { propertyData, userData } from "~/data/generalData";
import PropertyGallery from "~/components/PropertyGallery";
import {
  GoBookmark,
  GoBookmarkSlash,
  GoCommentDiscussion,
  GoLocation,
} from "react-icons/go";
import { LiaHandshake } from "react-icons/lia";

const Map = lazy(() => import("~/components/Map"));

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { id } = params;

  const property = propertyData.find((el) => String(el.id) === id);

  if (!property) throw new Response("Property Not Found", { status: 404 });

  const userPoster = userData.find((el) => el.id === property.userId);

  return { property, userPoster };
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
  const { property, userPoster } = loaderData;
  const {
    id,
    type,
    title,
    description,
    longDescription,
    exteriorImage,
    interiorGallery,
    sizes,
    bedrooms,
    bathrooms,
    nearbyPlaces,
    price,
    province,
    city,
    address,
    latitude,
    longitude,
  } = property;

  const mapFallback = (
    <div className="md:sticky md:top-[7.5vh] h-[35vh] w-[85%] md:w-[95%] md:mt-12 mx-auto rounded-lg bg-slate-400/36 animate-pulse">
      <p className="block w-fit mx-auto pt-12 text-xl text-gray-100">
        Loading Map...
      </p>
    </div>
  );

  const mapPopover = [
    {
      id,
      title,
      exteriorImage,
      bedrooms,
      bathrooms,
      city,
      address,
      latitude,
      longitude,
    },
  ];

  return (
    <main className="gen-main">
      {/* Left side */}
      <div className="p-2 md:p-4">
        {interiorGallery ? (
          <PropertyGallery interiorGallery={interiorGallery} />
        ) : (
          <img
            src={exteriorImage}
            alt={title}
            draggable="false"
            className="property-img-outline w-full h-[35vh] mt-8 shadow-lg rounded-lg object-cover"
          />
        )}

        <h1 className="my-6 text-center font-bold text-xl sm:text-2xl md:text-3xl text-amber-900">
          {title}
        </h1>

        <div className="grid md:grid-cols-[2fr_1fr] gap-12 md:gap-8">
          <div className="stack-8 md:stack-12 justify-between">
            <div>
              <p className="flex items-center gap-[1ex] translate-x-px mb-4">
                <GoLocation size={24} color="var(--color-amber-700)" />
                <span className="text-gray-600">
                  Address: <span className="text-lg">{address}</span>
                </span>
              </p>
              <p className="flex items-center gap-[0.75ex]">
                <LiaHandshake size={26} color="var(--color-amber-700)" />
                <span className="text-gray-600 capitalize">
                  Transaction type: <span className="text-lg">{type}</span>
                </span>
              </p>
            </div>

            <p className="max-xs:text-sm lg:text-lg text-gray-700">
              {longDescription || description}
            </p>

            <div className="flex justify-between items-center flex-wrap">
              {userPoster ? (
                <div
                  className="flex items-center gap-4 mb-4 mr-4 pl-2 py-2 pr-3
                  bg-amber-100/24 shadow-md rounded-lg border border-amber-200"
                >
                  <img
                    src={userPoster.profilePicture}
                    alt={userPoster.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                  />
                  <div>
                    <div className="stack-2 justify-between">
                      <p className="max-sm:text-sm font-semibold text-amber-900">
                        {userPoster.name}
                      </p>
                      <p className="text-xs text-end italic text-amber-700">
                        Property Owner
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 mr-4 pt-4 px-4 pr-6 text-gray-500 italic">
                  Please, contact our agents for more information.
                </div>
              )}

              <div className="flex gap-4 w-fit ml-auto [&_button]:rounded-sm [&_button]:shadow-md">
                <button
                  className="bg-amber-100/24 border border-amber-200 cursor-pointer
                  hover:scale-110 transition-transform duration-150"
                >
                  <GoCommentDiscussion
                    size={28}
                    color="var(--color-amber-500)"
                    title="Enter chat"
                  />
                </button>

                {true ? (
                  <button
                    className="bg-amber-100/24 border border-amber-200 cursor-pointer
                    hover:scale-110 transition-transform duration-150"
                  >
                    <GoBookmark
                      size={28}
                      color="var(--color-amber-500)"
                      title="Bookmark"
                    />
                  </button>
                ) : (
                  <button
                    className="bg-amber-100/24 border border-amber-200 cursor-pointer
                      hover:scale-110 transition-transform duration-150"
                  >
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

          <div className="h-fit p-4 bg-amber-100/24 rounded-lg shadow-md inset-shadow-xs">
            <h3 className="mb-4 text-center font-semibold text-lg sm:text-xl">
              Details
            </h3>
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

      {/* Right side */}
      <div className="md:bg-amber-100 max-md:mt-8 md:pb-8">
        <ClientOnly>
          {() => (
            <Suspense fallback={mapFallback}>
              <Map
                marginTop={12}
                viewportHeight={35}
                zoomLevel={9}
                scrollable={true}
                mapPopovers={mapPopover}
              />
            </Suspense>
          )}
        </ClientOnly>

        <div className="relative max-md:rounded-lg z-10 bg-amber-100 shadow-over-map">
          <div className="mt-10 mx-6 mb-4 pt-4">
            <h3 className="text-lg sm:text-xl font-bold">Location:</h3>
          </div>
          <div className="block pb-4">
            <div className="flex justify-between items-center mx-4 md:mx-6 p-3 bg-amber-50/66 rounded-lg border border-amber-200">
              <span className="text-amber-800 max-sm:text-sm">{city}</span>
              <span className="text-amber-600 text-lg sm:text-xl">
                {province}
              </span>
            </div>
          </div>
          {sizes && sizes.length > 0 && (
            <div className="mt-4 md:mt-8 mx-6 mb-4">
              <h3 className="mb-2 text-lg sm:text-xl font-bold">Room Sizes:</h3>
              <div className="flex gap-x-4 gap-y-2 flex-wrap pb-4">
                {sizes.map((size, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-amber-50/66 rounded-md border border-amber-200 max-sm:text-sm text-amber-900"
                  >
                    Room {idx + 1}: {size} sqft
                  </span>
                ))}
              </div>
            </div>
          )}
          {nearbyPlaces && Object.keys(nearbyPlaces).length > 0 && (
            <div className="mt-4 md:mt-8 mx-6 mb-4">
              <h3 className="mb-2 text-lg sm:text-xl font-bold">
                Nearby Places:
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2 pb-4">
                {Object.entries(nearbyPlaces).map(([place, distance]) => (
                  <div
                    key={place}
                    className="p-3 bg-amber-50/66 rounded-lg border border-amber-200 flex justify-between items-center gap-2"
                  >
                    <span className="capitalize text-amber-800 max-sm:text-sm">
                      {place}
                    </span>
                    <span className="font-mono text-amber-600 max-sm:text-sm">
                      {distance}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
