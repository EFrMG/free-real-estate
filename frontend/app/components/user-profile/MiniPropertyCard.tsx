import type { PropertyData } from "@free-real-estate/shared";

import { Link } from "react-router";
import getAssetUrl from "~/utils/getAssetUrl";

import { GoLocation } from "react-icons/go";

type MiniPropertyCardProps = {
  property: Pick<
    PropertyData,
    | "id"
    | "transactionType"
    | "title"
    | "exteriorImage"
    | "province"
    | "city"
    | "bedrooms"
    | "bathrooms"
    | "price"
  >;
  clearBackground: boolean;
  actions?: React.ReactNode;
};

export default function MiniPropertyCard({
  property: {
    id,
    transactionType,
    title,
    exteriorImage,
    province,
    city,
    bedrooms,
    bathrooms,
    price,
  },
  clearBackground,
  actions,
}: MiniPropertyCardProps) {
  const card = (
    <Link
      to={`/properties/${id}`}
      className="group block h-full hover:opacity-100"
    >
      <div
        className={`grid h-full grid-cols-[3fr_7fr] gap-4 rounded-lg py-3 pr-4 pl-3 shadow-md inset-shadow-sm transition-shadow duration-250 hover:shadow-sm ${clearBackground ? "bg-amber-50/64" : "bg-amber-100/28"}`}
      >
        <div className="relative h-full w-full">
          <div
            className={`absolute top-1 left-1 mx-auto flex h-[1.35lh] items-center rounded-md px-3 py-1 text-sm shadow-md ${
              transactionType === "buy"
                ? "[&_span:text-emerald-900] bg-emerald-300"
                : "[&_span:text-sky-900] bg-sky-300"
            }`}
          >
            <span className="shrink grow-0 text-sm leading-none font-bold uppercase">
              {transactionType}
            </span>
          </div>

          <img
            src={getAssetUrl(exteriorImage)}
            alt={title}
            draggable="false"
            className="h-36 w-full rounded-md object-cover"
          />
        </div>

        <div className="stack-2">
          <h2 className="line-clamp-1 text-center font-bold text-amber-900 transition-colors delay-75 duration-425 group-hover:text-amber-700">
            {title}
          </h2>
          <div className="mx-auto flex items-center gap-[0.5ex]">
            <div className="shrink-0">
              <GoLocation size={18} color="var(--color-amber-800)" />
            </div>
            <p className="line-clamp-1 text-xs text-gray-600 sm:text-sm">
              {province}, {city}
            </p>
          </div>
          <div className="mt-auto flex items-center justify-between">
            <div className="ml-2 hidden text-xs text-gray-600 xs:stack-1 sm:text-sm [&_div]:stack-0 [&_div]:items-center [&_div]:rounded-sm [&_div]:bg-amber-100/36 [&_div]:p-0.75">
              <div>
                <span>
                  <b>{bedrooms}</b> beds
                </span>
              </div>
              <div>
                <span>
                  <b>{bathrooms}</b> baths
                </span>
              </div>
            </div>
            <div className="stack-1 text-center font-medium">
              <span className="text-emerald-700">$0</span>
              <span className="text-emerald-700/74 line-through decoration-gray-500/64 decoration-2">
                ${price}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  if (!actions) return card;

  return (
    <div className="relative h-full">
      {card}
      <div className="absolute bottom-2 left-2 flex items-center gap-1">
        {actions}
      </div>
    </div>
  );
}
