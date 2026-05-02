import { GoSearch } from "react-icons/go";

export default function PropertiesFilterInput() {
  return (
    <div
      className="[&_label]:pt-1 [&_label]:px-2 [&_label]:pb-0 [&_label]:text-lg
      [&_input]:pt-0 [&_input]:pr-2 [&_input]:pb-2
      [&_select]:mr-2 [&_select]:pt-0 [&_select]:pb-2"
    >
      <h1 className="my-8 text-center text-2xl">
        Search Results for <b>LOCATION</b>
      </h1>

      <div className="max-w-[80%] mx-auto my-4 filter-input-group">
        <label htmlFor="city" className="text-xl! pl-6!">
          Location
        </label>
        <input
          id="city"
          type="text"
          name="city"
          placeholder="City"
          className="w-full"
        />
      </div>

      <div className="flex gap-2 flex-wrap justify-center items-center my-4">
        <div className="filter-input-group">
          <label htmlFor="type">Type</label>
          <select name="type" id="type">
            <option value="any">Any</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>
        </div>
        <div className="filter-input-group">
          <label htmlFor="property">Property</label>
          <select name="property" id="property">
            <option value="any">Any</option>
            <option value="land">Land</option>
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
          />
        </div>
        <button className="px-2 py-2.5 max-h-fit rounded-lg bg-amber-500">
          <GoSearch size={38} color="white" />
        </button>
      </div>
    </div>
  );
}
