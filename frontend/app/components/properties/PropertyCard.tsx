import type { PropertyData } from "~/data/generalData";

import { Link } from "react-router";

import { GoLocation } from "react-icons/go";
import { LuBed, LuBath } from "react-icons/lu";

type PropertyCardProps = {
  property: Pick<
    PropertyData,
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
    <Link to={`/properties/${id}`} className="block hover:opacity-100 group">
      <div
        className="relative grid grid-cols-[5fr_8fr] gap-4 pl-3 pr-4 py-3
        bg-amber-100/28 rounded-lg shadow-lg inset-shadow-sm
        hover:shadow-md transition-shadow duration-250"
      >
        <div
          className={`absolute flex items-center h-[1.35lh] bottom-6 -left-2.75 z-10
          group-hover:rotate-y-12 perspective-normal
          transition-transform duration-425 delay-75
          shadow-md text-shadow-sm px-4 py-1.5 rounded-r-md
          after:absolute after:top-full after:left-0
          after:border-t-10 after:border-l-10 after:border-l-transparent
          ${
            transactionType === "buy"
              ? "bg-emerald-300 after:border-t-emerald-500 [&_span:text-emerald-900]"
              : "bg-sky-300 after:border-t-sky-500 [&_span:text-sky-900]"
          }`}
        >
          <span className="text-sm font-bold uppercase grow-0 shrink leading-none">
            {transactionType}
          </span>
        </div>

        <img
          src={exteriorImage}
          alt={title}
          draggable="false"
          className="w-full h-full max-h-58 my-auto object-cover rounded-md"
        />

        <div className="stack-2">
          <h2
            className="text-lg text-center font-bold text-amber-900
            group-hover:text-amber-700 transition-colors duration-425 delay-75"
          >
            {title}
          </h2>
          <div className="flex items-center gap-[0.5ex]">
            <div className="shrink-0">
              <GoLocation size={18} color="var(--color-amber-800)" />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm">
              {province}, {city}, {address}
            </p>
          </div>
          <p className="px-2 max-sm:text-sm text-gray-700 line-clamp-3">
            {description}
          </p>
          <div className="mt-auto flex justify-between items-center">
            <div
              className="hidden xs:flex flex-wrap gap-2 sm:gap-4 ml-2 text-xs sm:text-sm text-gray-600
              [&_div]:stack-0 [&_div]:items-center [&_div]:rounded-sm [&_div]:p-0.75 [&_div]:bg-amber-100/36"
            >
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
            <div className="flex items-center self-end gap-2 w-fit ml-auto font-semibold">
              <span
                className="text-emerald-700/74
                line-through decoration-2 decoration-gray-500/64"
              >
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
