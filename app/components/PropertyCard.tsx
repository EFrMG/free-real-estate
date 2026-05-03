import { Link } from "react-router";
import { GoLocation } from "react-icons/go";
import { LuBed, LuBath } from "react-icons/lu";

interface PropertyCardProps {
  property: {
    id: number;
    title: string;
    description: string;
    img: string;
    province: string;
    city: string;
    address: string;
    bedrooms: number;
    bathrooms: number;
    price: number;
  };
}

export default function PropertyCard({
  property: {
    id,
    title,
    description,
    img,
    province,
    city,
    address,
    bedrooms,
    bathrooms,
    price,
  },
}: PropertyCardProps) {
  return (
    <Link
      to={`/properties/${id}`}
      className="m-4 block hover:opacity-100 group"
    >
      <div
        className="flex gap-4 pl-3 pr-4 py-3 rounded-lg shadow-lg inset-shadow-sm
        hover:shadow-md transition-shadow duration-250"
      >
        <img
          src={img}
          alt={title}
          draggable="false"
          className="w-full max-h-48 my-auto object-cover rounded-md"
        />

        <div className="stack-2">
          <h2
            className="text-lg sm:text-xl text-center font-bold text-amber-900
            group-hover:text-amber-700 transition-colors duration-425"
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
          <p className="max-sm:text-sm text-gray-700 line-clamp-3">
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
            <div className="flex items-center self-end gap-2 w-fit ml-auto">
              <span
                className="text-lg sm:text-xl font-bold text-emerald-700/86
                line-through decoration-2 decoration-gray-500/64"
              >
                ${price}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-700">
                $0
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
