import { describe, expect, it } from "vitest";

import { call, createProperty, createUser } from "./helpers.ts";

describe("GET /api/properties", () => {
  it("returns only the PropertyListItem columns, not the JSON columns or longDescription", async () => {
    const agent = await createUser("agent");
    const property = await createProperty(agent.id);

    const response = await call("/api/properties");
    const [item] = (await response.json()) as Record<string, unknown>[];

    expect(Object.keys(item).sort()).toEqual(
      [
        "address",
        "bathrooms",
        "bedrooms",
        "city",
        "description",
        "exteriorImage",
        "id",
        "latitude",
        "longitude",
        "price",
        "province",
        "title",
        "transactionType",
      ].sort(),
    );
    expect(item).toMatchObject({ id: property.id, city: "Fixture City" });
  });
});
