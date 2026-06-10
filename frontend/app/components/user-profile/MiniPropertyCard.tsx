import { Link } from "react-router";
import { GoLocation } from "react-icons/go";
import type { PropertyData } from "@free-real-estate/shared";

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
}: MiniPropertyCardProps) {
  return (
    <Link to={`/properties/${id}`} className="block hover:opacity-100 group">
      <div
        className={`grid grid-cols-[3fr_7fr] gap-4 h-full pl-3 pr-4 py-3
        rounded-lg shadow-md inset-shadow-sm
        hover:shadow-sm transition-shadow duration-250
        ${clearBackground ? "bg-amber-50/68" : "bg-amber-100/28"}`}
      >
        <div className="relative w-full h-full">
          <div
            className={`absolute top-1 left-1 mx-auto flex items-center h-[1.35lh]
            shadow-md text-sm px-3 py-1 rounded-md
            ${
              transactionType === "buy"
                ? "bg-emerald-300 [&_span:text-emerald-900]"
                : "bg-sky-300 [&_span:text-sky-900]"
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
            className="w-full h-36 object-cover rounded-md"
          />
        </div>

        <div className="stack-2">
          <h2
            className="text-center font-bold text-amber-900 line-clamp-1
            group-hover:text-amber-700 transition-colors duration-425 delay-75"
          >
            {title}
          </h2>
          <div className="flex items-center gap-[0.5ex] mx-auto">
            <div className="shrink-0">
              <GoLocation size={18} color="var(--color-amber-800)" />
            </div>
            <p className="text-gray-600 text-xs sm:text-sm line-clamp-1">
              {province}, {city}
            </p>
          </div>
          <div className="mt-auto flex items-center justify-between">
            <div
              className="hidden xs:stack-1 ml-2 text-xs sm:text-sm text-gray-600
              [&_div]:stack-0 [&_div]:items-center [&_div]:rounded-sm [&_div]:p-0.75 [&_div]:bg-amber-100/36"
            >
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
            <div className="stack-1 font-medium text-center">
              <span className="text-emerald-700">$0</span>
              <span
                className="text-emerald-700/74
                line-through decoration-2 decoration-gray-500/64"
              >
                ${price}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
