import { useState } from "react";
import { useNavigate } from "react-router";
import { GoSearch } from "react-icons/go";

interface Query {
  type: "any" | "buy" | "rent";
  location: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
}

interface HomeSearchInputProps {
  cities: string[];
}

export default function HomeSearchInput({ cities }: HomeSearchInputProps) {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState<Query>({
    type: "any",
    location: "",
    minPrice: undefined,
    maxPrice: undefined,
  });

  const updateQuery = (updates: Partial<Query>) => {
    setSearchQuery((prev: Query) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleSearch = (e: React.SubmitEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    params.set("type", searchQuery.type);

    if (searchQuery.location) params.set("city", searchQuery.location);

    if (searchQuery.minPrice !== undefined)
      params.set("minPrice", String(searchQuery.minPrice));

    if (searchQuery.maxPrice !== undefined)
      params.set("maxPrice", String(searchQuery.maxPrice));

    navigate(`/properties?${params}`);
  };

  return (
    <div className="py-12 px-3">
      <div className="*:px-6 *:py-2 *:text-lg *:border-2 *:border-amber-500 *:focus:outline-0">
        <button
          onClick={() => updateQuery({ type: "any" })}
          className={`[border-right-style:none]! [border-bottom-style:none]! rounded-tl-lg
          ${searchQuery.type === "any" ? "bg-amber-500 text-white" : "bg-amber-50"}`}
        >
          Any
        </button>
        <button
          onClick={() => updateQuery({ type: "buy" })}
          className={`[border-left-style:none]! [border-right-style:none]! [border-bottom-style:none]!
          ${searchQuery.type === "buy" ? "bg-amber-500 text-white" : "bg-amber-50"}`}
        >
          Buy
        </button>
        <button
          onClick={() => updateQuery({ type: "rent" })}
          className={`[border-left-style:none]! [border-bottom-style:none]! rounded-tr-lg
          ${searchQuery.type === "rent" ? "bg-amber-500 text-white" : "bg-amber-50"}`}
        >
          Rent
        </button>
      </div>
      <form
        onSubmit={handleSearch}
        className="flex max-sm:flex-wrap rounded-lg shadow-2xl shadow-slate-200/82 *:max-sm:w-[80%] *:min-h-16 *:pl-2 *:border-2 *:border-amber-500"
      >
        <input
          type="text"
          name="location"
          placeholder="City Location"
          list="home-city-suggestions"
          value={searchQuery.location}
          onChange={(e) => updateQuery({ location: e.target.value })}
          className="sm:[border-right-style:none]! sm:rounded-bl-lg max-sm:rounded-tr-lg bg-amber-50"
        />
        <datalist id="home-city-suggestions">
          {cities?.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>

        <input
          type="number"
          name="minPrice"
          min={0}
          max={1000000}
          placeholder="Min Price"
          value={searchQuery.minPrice ?? ""}
          onChange={(e) =>
            updateQuery({
              minPrice: e.target.value ? +e.target.value : undefined,
            })
          }
          className="sm:[border-right-style:none]! bg-amber-50"
        />

        <input
          type="number"
          name="maxPrice"
          min={0}
          max={1000000}
          placeholder="Max Price"
          value={searchQuery.maxPrice ?? ""}
          onChange={(e) =>
            updateQuery({
              maxPrice: e.target.value ? +e.target.value : undefined,
            })
          }
          className="sm:[border-right-style:none]! max-sm:rounded-bl-lg bg-amber-50"
        />

        <button
          type="submit"
          className="px-2! py-2 rounded-tr-lg rounded-br-lg max-sm:w-fit! bg-amber-500"
        >
          <GoSearch size={38} color="white" />
        </button>
      </form>
    </div>
  );
}
