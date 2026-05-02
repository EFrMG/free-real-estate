import type { Route } from "./+types/property-item";
import propertyData from "~/data/propertyData";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { id } = params;

  const property = propertyData.find((el) => String(el.id) === id);

  if (!property) {
    throw new Response("Property Not Found", { status: 404 });
  }

  return property;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Property | Free Real State" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

export default function PropertyItem({ loaderData }: Route.ComponentProps) {
  return <div>PROPERTY ITEM</div>;
}
