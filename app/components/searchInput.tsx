import { useState } from "react";
import { GoSearch } from "react-icons/go";

interface Query {
  type: "buy" | "rent";
  location: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
}

export default function SearchInput() {
  const [searchQuery, setSearchQuery] = useState<Query>({
    type: "buy",
    location: "",
    minPrice: undefined,
    maxPrice: undefined,
  });

  const updateQuery = (updates: Partial<Query>) => {
    setSearchQuery((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  return (
    <div className="py-12 px-3">
      <div className="*:px-6 *:py-2 *:text-lg *:border-2 *:border-amber-500 ">
        <button
          className={`[border-right-style:none]! [border-bottom-style:none]! rounded-tl-lg ${searchQuery.type === "buy" ? "bg-amber-500 text-white" : ""}`}
          onClick={() => updateQuery({ type: "buy" })}
        >
          Buy
        </button>
        <button
          className={`[border-left-style:none]! [border-bottom-style:none]! rounded-tr-lg ${searchQuery.type === "rent" ? "bg-amber-500 text-white" : ""}`}
          onClick={() => updateQuery({ type: "rent" })}
        >
          Rent
        </button>
      </div>
      <form className="flex *:pl-2 *:border-2 *:border-amber-500">
        <input
          type="text"
          name="location"
          placeholder="City Location"
          value={searchQuery.location}
          onChange={(e) => updateQuery({ location: e.target.value })}
          className="[border-right-style:none]! rounded-bl-lg bg-amber-50"
        />
        <input
          type="number"
          name="minPrice"
          min={0}
          max={1000000}
          placeholder="Min Price"
          value={searchQuery.minPrice}
          onChange={(e) => updateQuery({ minPrice: +e.target.value })}
          className="[border-right-style:none]! bg-amber-50"
        />
        <input
          type="number"
          name="maxPrice"
          min={0}
          max={1000000}
          placeholder="Max Price"
          value={searchQuery.maxPrice}
          onChange={(e) => updateQuery({ maxPrice: +e.target.value })}
          className="[border-right-style:none]! bg-amber-50"
        />
        <button className="px-2! py-2 rounded-tr-lg rounded-br-lg bg-amber-500">
          <GoSearch size={38} color="white" />
        </button>
      </form>
    </div>
  );
}
