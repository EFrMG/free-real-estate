import type { PropertyListItem } from "@free-real-estate/shared";

import { Link } from "react-router";
import getAssetUrl from "~/utils/getAssetUrl";

import { GoLocation } from "react-icons/go";
import { LuBed, LuBath } from "react-icons/lu";

type PropertyCardProps = {
  property: Pick<
    PropertyListItem,
    | "id"
    | "transactionType"
    | "title"
    | "description"
    | "exteriorImage"
    | "province"
    | "city"
    | "address"
    | "bedrooms"
    | "bathrooms"
    | "price"
  >;
};

export default function PropertyCard({
  property: {
    id,
    transactionType,
    title,
    description,
    exteriorImage,
    province,
    city,
    address,
    bedrooms,
    bathrooms,
    price,
  },
}: PropertyCardProps) {
  return (
    <Link to={`/properties/${id}`} className="group block hover:opacity-100">
      <div className="relative grid grid-cols-[5fr_8fr] gap-4 rounded-lg bg-amber-100/28 py-3 pr-4 pl-3 shadow-lg inset-shadow-sm transition-shadow duration-250 hover:shadow-md">
        <div
          className={`absolute bottom-6 -left-2.75 z-10 flex h-[1.35lh] items-center rounded-r-md px-4 py-1.5 shadow-md transition-transform delay-75 duration-425 perspective-normal text-shadow-sm group-hover:rotate-y-12 after:absolute after:top-full after:left-0 after:border-t-10 after:border-l-10 after:border-l-transparent ${
            transactionType === "buy"
              ? "[&_span:text-emerald-900] bg-emerald-300 after:border-t-emerald-500"
              : "[&_span:text-sky-900] bg-sky-300 after:border-t-sky-500"
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
          className="my-auto h-full max-h-58 w-full rounded-md object-cover"
        />

        <div className="stack-2">
          <h2 className="text-center text-lg font-bold text-amber-900 transition-colors delay-75 duration-425 group-hover:text-amber-700">
            {title}
          </h2>
          <div className="flex items-center gap-[0.5ex]">
            <div className="shrink-0">
              <GoLocation size={18} color="var(--color-amber-800)" />
            </div>
            <p className="text-xs text-gray-600 sm:text-sm">
              {province}, {city}, {address}
            </p>
          </div>
          <p className="line-clamp-3 px-2 text-gray-700 max-sm:text-sm">
            {description}
          </p>
          <div className="mt-auto flex items-center justify-between">
            <div className="ml-2 hidden flex-wrap gap-2 text-xs text-gray-600 xs:flex sm:gap-4 sm:text-sm [&_div]:stack-0 [&_div]:items-center [&_div]:rounded-sm [&_div]:bg-amber-100/36 [&_div]:p-0.75">
              <div>
                <LuBed size={18} color="var(--color-gray-600)" />{" "}
                <span>
                  <b>{bedrooms}</b> beds
                </span>
              </div>
              <div>
                <LuBath size={18} color="var(--color-gray-600)" />{" "}
                <span>
                  <b>{bathrooms}</b> baths
                </span>
              </div>
            </div>
            <div className="ml-auto flex w-fit items-center gap-2 self-end font-semibold">
              <span className="text-emerald-700/74 line-through decoration-gray-500/64 decoration-2">
                ${price}
              </span>
              <span className="text-lg text-emerald-700">$0</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
