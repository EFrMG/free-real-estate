import type { PropertyData } from "@free-real-estate/shared";

import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { GoSearch } from "react-icons/go";

import useObjectState from "~/hooks/useObjectState";

interface PropertyFilters {
  location: string;
  type: PropertyData["transactionType"] | "any";
  property: PropertyData["propertyType"] | "any";
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

  const { state: propertyFilters, updateState: setPropertyFilters } =
    useObjectState<PropertyFilters>({
      location: searchParams.get("city") ?? "",
      type:
        (searchParams.get("type") as PropertyData["transactionType"] | null) ??
        "any",

      property:
        (searchParams.get("property") as PropertyData["propertyType"] | null) ??
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
      type:
        (searchParams.get("type") as PropertyData["transactionType"] | null) ??
        "any",

      property:
        (searchParams.get("property") as PropertyData["propertyType"]) ?? "any",

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

  const handleSearch = (e: React.SubmitEvent) => {
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
      className="[&_label]:pt-1 [&_label]:px-2 [&_label]:pb-0
      [&_input]:pt-0 [&_input]:pr-2 [&_input]:pb-2
      [&_select]:mr-2 [&_select]:pt-0 [&_select]:pb-2"
    >
      <h1 className="mt-6 mb-8 text-center text-2xl text-amber-950">
        Search Results for <b>{propertyFilters.location || "all locations"}</b>
      </h1>

      <form onSubmit={(e) => handleSearch(e)}>
        <fieldset className="max-w-[80%] mx-auto my-6 filter-input-group">
          <label htmlFor="city" className="text-lg pl-2!">
            Location
          </label>
          <input
            id="city"
            type="text"
            name="city"
            placeholder="City"
            list="city-suggestions"
            value={propertyFilters.location}
            onChange={(e) => setPropertyFilters({ location: e.target.value })}
            className="w-full"
          />
          <datalist id="city-suggestions">
            {cities?.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </fieldset>

        <fieldset className="flex gap-2 flex-wrap justify-center items-center my-8 mx-2 md:mx-4">
          <div className="filter-input-group">
            <label htmlFor="type">Type</label>
            <select
              name="type"
              id="type"
              value={propertyFilters.type}
              onChange={(e) =>
                setPropertyFilters({
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
                setPropertyFilters({
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
                setPropertyFilters({
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
                setPropertyFilters({
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
                setPropertyFilters({
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
                setPropertyFilters({
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
