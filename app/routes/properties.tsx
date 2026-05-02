import type { Route } from "./+types/properties";

import propertyData from "~/data/propertyData";
import FilterInput from "~/components/PropertiesFilterInput";
import PropertyCard from "~/components/PropertyCard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Properties | Free Real State" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

export default function LogIn() {
  return (
    <main className="gen-main">
      <div>
        <FilterInput />

        {propertyData.map((property) => (
          <PropertyCard
            key={`property-card-${property.id}`}
            title={property.title}
            description={property.description}
            img={property.img}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            price={property.price}
            address={property.address}
          />
        ))}
      </div>
      <div className="bg-amber-100">MAP</div>
    </main>
  );
}
