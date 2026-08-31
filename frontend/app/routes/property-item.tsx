import type { Route } from "./+types/property-item";

import { lazy, Suspense } from "react";
import {
  Link,
  useFetcher,
  useRouteLoaderData,
  data,
  redirect,
} from "react-router";

import getAssetUrl from "~/utils/getAssetUrl";
import ClientOnly from "~/components/ClientOnly";
import PropertyGallery from "~/components/property-item/Gallery";
import forwardCookies from "~/utils/forwardCookies";
import { API_URL } from "~/utils/apiUrl";

import {
  GoBookmark,
  GoBookmarkSlash,
  GoCommentDiscussion,
  GoLocation,
} from "react-icons/go";
import { LiaHandshake } from "react-icons/lia";

import type { PropertyData, UserBasic, UserProfile } from "~/data/generalData";

const Map = lazy(() => import("~/components/Map"));

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

export async function loader({ request, params }: Route.LoaderArgs) {
  const { id } = params;
  const cookie = request.headers.get("Cookie") || "";

  // Property data
  const propertyRes = await fetch(`${API_URL}/api/properties/${id}`);

  if (!propertyRes.ok) {
    if (propertyRes.status === 404) {
      throw new Response("Property Not Found", { status: 404 });
    }
    throw new Response("Failed to fetch property", { status: 500 });
  }

  const property: PropertyData = await propertyRes.json();

  // User agent poster (of the property listing)
  let userPoster: UserBasic | null = null;
  let userPosterRes: Response | null = null;

  if (property.userId) {
    userPosterRes = await fetch(`${API_URL}/api/users/${property.userId}`);
    if (userPosterRes.ok) {
      userPoster = await userPosterRes.json();
    }
  }

  // User profile
  let user: UserProfile | null = null;

  const userRes = await fetch(API_URL + "/api/auth/me", {
    method: "GET",
    headers: { Cookie: cookie },
  });

  if (userRes.ok) {
    user = await userRes.json();
  }

  // User bookmarks
  let userBookmarks: PropertyData[] | null = null;
  let userBookmarksRes: Response | null = null;

  if (user) {
    userBookmarksRes = await fetch(
      `${API_URL}/api/users/${user.id}/bookmarks`,
      {
        method: "GET",
        headers: { Cookie: cookie },
      },
    );

    if (userBookmarksRes.ok) {
      userBookmarks = await userBookmarksRes.json();
    }
  }

  return data(
    { property, userPoster, userBookmarks },
    {
      headers: forwardCookies(
        propertyRes,
        userPosterRes,
        userRes,
        userBookmarksRes,
      ),
    },
  );
}

/* TODO: optimistic UI for the bookmark button
 * Although, if there is no suitable place to show errors in the present layout this would also necessitate a popover,
 * for which I have no other use yet other than indicating a successful login */
export async function action({ request, params }: Route.ActionArgs) {
  const { id: propertyId } = params;

  const formData = await request.formData();
  const intent = formData.get("intent");

  const cookie = request.headers.get("Cookie") || "";

  const userRes = await fetch(API_URL + "/api/auth/me", {
    method: "GET",
    headers: { Cookie: cookie },
  });

  if (!userRes.ok) return new Response("Unauthorized", { status: 401 });

  const user = await userRes.json();

  if (intent === "start-chat") {
    const chatRes = await fetch(API_URL + "/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        agentId: Number(formData.get("agentId")),
        propertyId: Number(propertyId),
      }),
    });

    if (!chatRes.ok) {
      return data(
        { error: "We could not open that conversation." },
        { headers: forwardCookies(userRes) },
      );
    }

    const { chatId } = await chatRes.json();

    return redirect(`/user-profile/${user.id}?chat=${chatId}`, {
      headers: forwardCookies(userRes, chatRes),
    });
  }

  if (intent === "bookmark") {
    const bookmarkRes = await fetch(
      `${API_URL}/api/users/${user.id}/bookmarks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify({ propertyId }),
      },
    );
    return data(null, { headers: forwardCookies(userRes, bookmarkRes) });
  } else if (intent === "remove-bookmark") {
    const removeRes = await fetch(
      `${API_URL}/api/users/${user.id}/bookmarks/${propertyId}`,
      {
        method: "DELETE",
        headers: { Cookie: cookie },
      },
    );
    return data(null, { headers: forwardCookies(userRes, removeRes) });
  }

  return data(null, { headers: forwardCookies(userRes) });
}

export default function PropertyItem({ loaderData }: Route.ComponentProps) {
  const { property, userPoster, userBookmarks } = loaderData;

  const rootData = useRouteLoaderData("root");
  const currentUserId: number | null = rootData?.user?.id ?? null;

  const fetcher = useFetcher();

  const {
    id,
    transactionType,
    propertyType,
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
      <p className="block w-fit mx-auto pt-12 text-lg text-gray-100">
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
      <div className="p-2 md:p-4 md:pb-12">
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

        <h1 className="page-title my-6 text-center text-xl">{title}</h1>

        <div className="grid md:grid-cols-[2fr_1fr] gap-12 md:gap-8">
          <div className="stack-8 md:stack-12 justify-between">
            <div>
              <p className="flex items-center gap-[1ex] translate-x-px mb-4">
                <GoLocation size={24} color="var(--color-amber-700)" />
                <span className="text-gray-600">
                  Address: <span className="font-medium">{address}</span>
                </span>
              </p>
              <p className="flex items-center gap-[0.75ex]">
                <LiaHandshake size={26} color="var(--color-amber-700)" />
                <span className="text-gray-600 capitalize">
                  Transaction type:{" "}
                  <span className="font-medium">{transactionType}</span>
                </span>
              </p>
            </div>

            <p className="max-xs:text-sm text-gray-700">
              {longDescription || description}
            </p>

            <div className="flex justify-between items-center flex-wrap">
              {userPoster ? (
                <div
                  className="flex items-center gap-4 mb-4 mr-4 pl-2 py-2 pr-3
                  bg-amber-100/28 shadow-md rounded-lg border border-amber-200"
                >
                  <img
                    src={getAssetUrl(userPoster.profilePicture)}
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
                <div className="mb-4 mr-4 pt-4 px-4 pr-6 text-amber-800/74 italic">
                  Please, contact our agents for more information.
                </div>
              )}

              <div className="flex gap-4 w-fit ml-auto [&_button]:rounded-sm [&_button]:shadow-md [&_button]:px-1.5 [&_button]:py-1 [&_a]:px-1.5 [&_a]:py-1">
                {/* Chats are always about a listing, so this one needs no property picker */}
                {userPoster &&
                  currentUserId !== userPoster.id &&
                  (currentUserId === null ? (
                    <Link
                      to="/log-in"
                      className="bg-amber-100/28 rounded-sm shadow-md gen-btn-border btn-hovaction"
                    >
                      <GoCommentDiscussion
                        size={28}
                        color="var(--color-amber-500)"
                        title="Log in to message this agent"
                      />
                    </Link>
                  ) : (
                    <fetcher.Form method="post">
                      <input type="hidden" name="intent" value="start-chat" />
                      <input
                        type="hidden"
                        name="agentId"
                        value={userPoster.id}
                      />
                      <button
                        type="submit"
                        className="bg-amber-100/28 gen-btn-border btn-hovaction"
                      >
                        <GoCommentDiscussion
                          size={28}
                          color="var(--color-amber-500)"
                          title={`Message ${userPoster.name}`}
                        />
                      </button>
                    </fetcher.Form>
                  ))}

                {userBookmarks?.some((b) => b.id === property.id) ? (
                  <fetcher.Form method="post">
                    <input
                      type="hidden"
                      name="intent"
                      value="remove-bookmark"
                    />
                    <button
                      type="submit"
                      className="bg-amber-100/28 gen-btn-border btn-hovaction"
                    >
                      <GoBookmarkSlash
                        size={28}
                        color="var(--color-amber-500)"
                        title="Remove bookmark"
                      />
                    </button>
                  </fetcher.Form>
                ) : (
                  <fetcher.Form method="post">
                    <input type="hidden" name="intent" value="bookmark" />
                    <button
                      type="submit"
                      className="bg-amber-100/28 gen-btn-border btn-hovaction"
                    >
                      <GoBookmark
                        size={28}
                        color="var(--color-amber-500)"
                        title="Bookmark"
                      />
                    </button>
                  </fetcher.Form>
                )}
              </div>
            </div>
          </div>

          <div className="h-fit my-auto p-4 bg-amber-100/28 rounded-lg shadow-md inset-shadow-xs">
            <h3 className="mb-2 text-center font-semibold text-lg">Details</h3>
            <div
              className="[&_p]:py-2 [&_p]:flex [&_p]:justify-between [&_p]:items-center
              [&>p]:border-b [&>p]:border-amber-300/74"
            >
              <p>
                <span>Property Type:</span>{" "}
                <span className="capitalize font-medium">{propertyType}</span>
              </p>
              <p>
                <span>Price:</span>{" "}
                <span className="text-emerald-700 font-medium">${price}</span>
              </p>
              <p>
                <span>Bedrooms:</span>{" "}
                <span className="font-medium">{bedrooms}</span>
              </p>
              <p>
                <span>Bathrooms:</span>{" "}
                <span className="font-medium">{bathrooms}</span>
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
            <h3 className="text-lg font-bold">Location:</h3>
          </div>
          <div className="block pb-4">
            <div className="flex justify-between items-center mx-4 md:mx-6 p-3 bg-amber-50/64 rounded-lg border border-amber-200">
              <span className="text-amber-800">{city}</span>
              <span className="text-amber-600 text-lg">{province}</span>
            </div>
          </div>
          {sizes && sizes.length > 0 && (
            <div className="mt-4 md:mt-8 mx-6 mb-4">
              <h3 className="mb-2 text-lg font-bold">Room Sizes:</h3>
              <div className="flex gap-x-4 gap-y-2 flex-wrap pb-4">
                {sizes.map((size, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-amber-50/64 rounded-md border border-amber-200 text-amber-900"
                  >
                    Room {idx + 1}: {size} sqft
                  </span>
                ))}
              </div>
            </div>
          )}
          {nearbyPlaces && Object.keys(nearbyPlaces).length > 0 && (
            <div className="mt-4 md:mt-8 mx-6 mb-4">
              <h3 className="mb-2 text-lg font-bold">Nearby Places:</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2 pb-4">
                {Object.entries(nearbyPlaces).map(([place, distance]) => (
                  <div
                    key={place}
                    className="p-3 bg-amber-50/64 rounded-lg border border-amber-200 flex justify-between items-center gap-2"
                  >
                    <span className="capitalize text-amber-800">{place}</span>
                    <span className="font-mono text-amber-600">{distance}</span>
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
