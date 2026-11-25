import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";

import {
  bookmarks,
  properties,
  refreshTokens,
  users,
} from "../src/db/schema.ts";
import {
  call,
  createProperty,
  createRefresh,
  createUser,
  db,
  sessionCookie,
} from "./helpers.ts";

const findProperty = (id: number) =>
  db().select().from(properties).where(eq(properties.id, id)).get();

describe("listing ownership", () => {
  it("a non-agent account cannot create a listing", async () => {
    const buyer = await createUser("user");

    const response = await call("/api/properties", {
      method: "POST",
      cookie: await sessionCookie(buyer),
      json: { title: "x" },
    });

    expect(response.status).toBe(403);
    expect(await db().select().from(properties)).toHaveLength(0);
  });

  it("another agent cannot edit a listing, and it stays unchanged", async () => {
    const owner = await createUser("agent");
    const intruder = await createUser("agent");
    const property = await createProperty(owner.id);

    const response = await call(`/api/properties/${property.id}`, {
      method: "PUT",
      cookie: await sessionCookie(intruder),
      json: { title: "Hijacked", price: 1 },
    });

    expect(response.status).toBe(403);
    expect(await findProperty(property.id)).toEqual(property);
  });

  it("another agent cannot delete a listing or its R2 image", async () => {
    const owner = await createUser("agent");
    const intruder = await createUser("agent");
    const key = `uploads/properties/${owner.id}-fixture.png`;
    await env.UPLOADS.put(key, new Uint8Array([1, 2, 3]));
    const property = await createProperty(owner.id, `/public/${key}`);

    const response = await call(`/api/properties/${property.id}`, {
      method: "DELETE",
      cookie: await sessionCookie(intruder),
    });

    expect(response.status).toBe(403);
    expect(await findProperty(property.id)).toEqual(property);
    expect(await env.UPLOADS.head(key)).not.toBeNull();
  });

  it("the owner can delete it, which removes the R2 image (positive control for the denial above)", async () => {
    const owner = await createUser("agent");
    const key = `uploads/properties/${owner.id}-fixture.png`;
    await env.UPLOADS.put(key, new Uint8Array([1, 2, 3]));
    const property = await createProperty(owner.id, `/public/${key}`);

    const response = await call(`/api/properties/${property.id}`, {
      method: "DELETE",
      cookie: await sessionCookie(owner),
    });

    expect(response.status).toBe(200);
    expect(await findProperty(property.id)).toBeUndefined();
    expect(await env.UPLOADS.head(key)).toBeNull();
  });
});

describe("account ownership", () => {
  it("cannot edit another user's profile", async () => {
    const victim = await createUser("user");
    const intruder = await createUser("user");

    const response = await call(`/api/users/${victim.id}`, {
      method: "PUT",
      cookie: await sessionCookie(intruder),
      json: { name: "Hijacked" },
    });

    expect(response.status).toBe(403);
    expect(
      (await db().select().from(users).where(eq(users.id, victim.id)).get())
        ?.name,
    ).toBe(victim.name);
  });

  it("cannot change another user's password or revoke their sessions", async () => {
    const victim = await createUser("user");
    const intruder = await createUser("user");
    await createRefresh(victim.id, new Date(Date.now() + 86_400_000));

    const response = await call(`/api/users/${victim.id}/password`, {
      method: "PUT",
      cookie: await sessionCookie(intruder),
      json: { currentPassword: "x", newPassword: "y" },
    });

    expect(response.status).toBe(403);
    const stored = await db()
      .select()
      .from(users)
      .where(eq(users.id, victim.id))
      .get();
    expect(stored?.passwordHash).toBe(victim.passwordHash);
    expect(
      await db()
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.userId, victim.id)),
    ).toHaveLength(1);
  });

  it("cannot promote another user, even with the right promotion code", async () => {
    const victim = await createUser("user");
    const intruder = await createUser("user");

    const response = await call(`/api/users/${victim.id}/promote`, {
      method: "POST",
      cookie: await sessionCookie(intruder),
      json: { agencyPassword: env.AGENT_PROMOTION_CODE, licenseNumber: "x" },
    });

    expect(response.status).toBe(403);
    expect(
      (await db().select().from(users).where(eq(users.id, victim.id)).get())
        ?.role,
    ).toBe("user");
  });

  it("cannot read, add or remove another user's bookmarks", async () => {
    const agent = await createUser("agent");
    const property = await createProperty(agent.id);
    const victim = await createUser("user");
    const intruder = await createUser("user");
    await db()
      .insert(bookmarks)
      .values({ userId: victim.id, propertyId: property.id });
    const cookie = await sessionCookie(intruder);

    const read = await call(`/api/users/${victim.id}/bookmarks`, { cookie });
    const add = await call(`/api/users/${victim.id}/bookmarks`, {
      method: "POST",
      cookie,
      json: { propertyId: property.id },
    });
    const remove = await call(
      `/api/users/${victim.id}/bookmarks/${property.id}`,
      {
        method: "DELETE",
        cookie,
      },
    );

    expect([read.status, add.status, remove.status]).toEqual([403, 403, 403]);
    expect(await db().select().from(bookmarks)).toEqual([
      { userId: victim.id, propertyId: property.id },
    ]);
  });
});
