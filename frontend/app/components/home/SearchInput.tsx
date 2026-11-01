import { useNavigate } from "react-router";
import useObjectState from "~/hooks/useObjectState";
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

  const { state: searchQuery, updateState: updateQuery } =
    useObjectState<Query>({
      type: "any",
      location: "",
      minPrice: undefined,
      maxPrice: undefined,
    });

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
    <div className="px-2 pt-8 lg:pt-12">
      <div className="*:border-2 *:border-amber-500 *:px-6 *:py-2 *:focus:outline-0">
        <button
          onClick={() => updateQuery({ type: "any" })}
          className={`rounded-tl-lg [border-right-style:none]! [border-bottom-style:none]! ${searchQuery.type === "any" ? "bg-amber-500 text-white" : "bg-amber-50"}`}
        >
          Any
        </button>
        <button
          onClick={() => updateQuery({ type: "buy" })}
          className={`[border-right-style:none]! [border-bottom-style:none]! [border-left-style:none]! ${searchQuery.type === "buy" ? "bg-amber-500 text-white" : "bg-amber-50"}`}
        >
          Buy
        </button>
        <button
          onClick={() => updateQuery({ type: "rent" })}
          className={`rounded-tr-lg [border-bottom-style:none]! [border-left-style:none]! ${searchQuery.type === "rent" ? "bg-amber-500 text-white" : "bg-amber-50"}`}
        >
          Rent
        </button>
      </div>
      <form
        onSubmit={handleSearch}
        className="flex rounded-lg shadow-2xl shadow-slate-200/84 *:min-h-16 *:border-2 *:border-amber-500 *:pl-2 max-sm:flex-wrap *:max-sm:w-[80%]"
      >
        <input
          type="text"
          name="location"
          placeholder="City Location"
          list="home-city-suggestions"
          value={searchQuery.location}
          onChange={(e) => updateQuery({ location: e.target.value })}
          className="bg-amber-50 max-sm:rounded-tr-lg sm:rounded-bl-lg sm:[border-right-style:none]!"
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
          className="bg-amber-50 sm:[border-right-style:none]!"
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
          className="bg-amber-50 max-sm:rounded-bl-lg sm:[border-right-style:none]!"
        />

        <button
          type="submit"
          className="rounded-tr-lg rounded-br-lg bg-amber-500 px-2! py-2 max-sm:w-fit!"
        >
          <GoSearch size={38} color="white" />
        </button>
      </form>
    </div>
  );
}
