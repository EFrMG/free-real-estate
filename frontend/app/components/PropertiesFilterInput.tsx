import { useEffect, useState, type SubmitEvent } from "react";
import { useSearchParams } from "react-router";
import type { PropertyData } from "@free-real-estate/shared";
import { GoSearch } from "react-icons/go";

interface PropertyFilters {
  location: string;
  type: PropertyData["type"] | "any";
  property: PropertyData["property"] | "any";
  minPrice: number | undefined;
  maxPrice: number | undefined;
  bedrooms: PropertyData["bedrooms"] | undefined;
  bathrooms: PropertyData["bathrooms"] | undefined;
}

interface FilterInputProps {
  cities: string[];
}

export default function PropertiesFilterInput({ cities }: FilterInputProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [propertyFilters, setPropertyFilters] = useState<PropertyFilters>({
    location: searchParams.get("city") ?? "",
    type: (searchParams.get("type") as PropertyData["type"] | null) ?? "any",
    property:
      (searchParams.get("property") as PropertyData["property"] | null) ??
      "any",

    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,

    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,

    bedrooms: searchParams.get("bedrooms")
      ? Number(searchParams.get("bedrooms"))
      : undefined,

    bathrooms: searchParams.get("bathrooms")
      ? Number(searchParams.get("bathrooms"))
      : undefined,
  });

  // Keep local state in sync with URL if URL changes because of history
  useEffect(() => {
    setPropertyFilters({
      location: searchParams.get("city") || "",
      type: (searchParams.get("type") as PropertyData["type"] | null) ?? "any",
      property:
        (searchParams.get("property") as PropertyData["property"]) ?? "any",

      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,

      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,

      bedrooms: searchParams.get("bedrooms")
        ? Number(searchParams.get("bedrooms"))
        : undefined,

      bathrooms: searchParams.get("bathrooms")
        ? Number(searchParams.get("bathrooms"))
        : undefined,
    });
  }, [searchParams]);

  const updatePropertyFilters = (updates: Partial<PropertyFilters>) => {
    setPropertyFilters((prev: PropertyFilters) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleSearch = (e: SubmitEvent) => {
    e.preventDefault();

    const newParams = new URLSearchParams();
    if (propertyFilters.location)
      newParams.set("city", propertyFilters.location);

    if (propertyFilters.type !== "any")
      newParams.set("type", propertyFilters.type);

    if (propertyFilters.property !== "any")
      newParams.set("property", propertyFilters.property);

    if (propertyFilters.minPrice !== undefined)
      newParams.set("minPrice", propertyFilters.minPrice.toString());

    if (propertyFilters.maxPrice !== undefined)
      newParams.set("maxPrice", propertyFilters.maxPrice.toString());

    if (propertyFilters.bedrooms !== undefined)
      newParams.set("bedrooms", propertyFilters.bedrooms.toString());

    if (propertyFilters.bathrooms !== undefined)
      newParams.set("bathrooms", propertyFilters.bathrooms.toString());

    setSearchParams(newParams);
  };

  return (
    <div
      className="[&_label]:pt-1 [&_label]:px-2 [&_label]:pb-0 [&_label]:sm:text-lg
      [&_input]:pt-0 [&_input]:pr-2 [&_input]:pb-2
      [&_select]:mr-2 [&_select]:pt-0 [&_select]:pb-2"
    >
      <h1 className="my-8 text-center text-xl sm:text-2xl">
        Search Results for <b>{propertyFilters.location || "all locations"}</b>
      </h1>

      <form onSubmit={(e) => handleSearch(e)}>
        <fieldset className="max-w-[80%] mx-auto my-6 filter-input-group">
          <label htmlFor="city" className="text-lg sm:text-xl! pl-6!">
            Location
          </label>
          <input
            id="city"
            type="text"
            name="city"
            placeholder="City"
            list="city-suggestions"
            value={propertyFilters.location}
            onChange={(e) =>
              updatePropertyFilters({ location: e.target.value })
            }
            className="w-full"
          />
          <datalist id="city-suggestions">
            {cities?.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </fieldset>

        <fieldset className="flex gap-2 flex-wrap justify-center items-center mt-6 mx-2 md:mx-4 mb-12">
          <div className="filter-input-group">
            <label htmlFor="type">Type</label>
            <select
              name="type"
              id="type"
              value={propertyFilters.type}
              onChange={(e) =>
                updatePropertyFilters({
                  type: e.target.value as PropertyFilters["type"],
                })
              }
            >
              <option value="any">Any</option>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>
          </div>
          <div className="filter-input-group">
            <label htmlFor="property">Property</label>
            <select
              name="property"
              id="property"
              value={propertyFilters.property}
              onChange={(e) =>
                updatePropertyFilters({
                  property: e.target.value as PropertyFilters["property"],
                })
              }
            >
              <option value="any">Any</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="condominium">Condominium</option>
            </select>
          </div>
          <div className="filter-input-group">
            <label htmlFor="minPrice">Minimum Price</label>
            <input
              id="minPrice"
              type="number"
              name="minPrice"
              placeholder="0"
              min={0}
              max={1000000}
              value={propertyFilters.minPrice ?? ""}
              onChange={(e) =>
                updatePropertyFilters({
                  minPrice: e.target.value ? +e.target.value : undefined,
                })
              }
            />
          </div>
          <div className="filter-input-group">
            <label htmlFor="maxPrice">Maximum Price</label>
            <input
              id="maxPrice"
              type="number"
              name="maxPrice"
              placeholder="0"
              min={0}
              max={1000000}
              value={propertyFilters.maxPrice ?? ""}
              onChange={(e) =>
                updatePropertyFilters({
                  maxPrice: e.target.value ? +e.target.value : undefined,
                })
              }
            />
          </div>
          <div className="filter-input-group">
            <label htmlFor="bedrooms">Bedrooms</label>
            <input
              id="bedrooms"
              type="number"
              name="bedrooms"
              placeholder="Any Number"
              min={0}
              max={10}
              className="min-w-[16ch]"
              value={propertyFilters.bedrooms ?? ""}
              onChange={(e) =>
                updatePropertyFilters({
                  bedrooms: e.target.value ? +e.target.value : undefined,
                })
              }
            />
          </div>
          <div className="filter-input-group">
            <label htmlFor="bathrooms">Bathrooms</label>
            <input
              id="bathrooms"
              type="number"
              name="bathrooms"
              placeholder="Any Number"
              min={0}
              max={10}
              className="min-w-[16ch]"
              value={propertyFilters.bathrooms ?? ""}
              onChange={(e) =>
                updatePropertyFilters({
                  bathrooms: e.target.value ? +e.target.value : undefined,
                })
              }
            />
          </div>
          <button
            type="submit"
            className="px-2 py-2.5 max-h-fit rounded-lg bg-amber-500"
          >
            <GoSearch size={38} color="white" />
          </button>
        </fieldset>
      </form>
    </div>
  );
}
