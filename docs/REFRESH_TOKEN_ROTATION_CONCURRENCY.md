# Refresh Token Rotation and Concurrent Requests

This document describes a latent authentication defect discovered while building the chat feature, the partial mitigation currently in place, what it does **not** solve, and the options for fixing it properly in the future.

The defect predates the chat work. It is written up here because the chat feature adds requests to the pattern that triggers it.

---

## 1. Background: How Sessions Work Here

Authentication lives in `backends/node-drizzle/src/auth.ts` and uses two cookies.

**The session cookie** (`session`) holds a signed JWT carrying `{ id, role }`. It expires after **one hour**. It is `httpOnly`, scoped to path `/`.

**The refresh cookie** (`refresh`) holds a 32-byte opaque random token, 64 hex characters. It expires after **30 days**, is `httpOnly` and scoped to path `/api`. The token itself is never stored: the `refresh_tokens` table keeps its SHA-256 hash, so a database leak does not hand over usable sessions. Each row also carries a `family` UUID, which groups a chain of rotations.

The `requireAuth` middleware runs this sequence:

1. If the JWT verifies, attach the session and continue.
2. Otherwise (expired or invalid), look for the refresh cookie. If absent, `401`.
3. Hash the presented token and look it up. **If no row matches, clear both cookies and return `401`.**
4. If the row has expired, delete it, clear both cookies: returning `401` too.
5. Otherwise **rotate**: delete the row that was just used, insert a replacement in the same family, set the new refresh cookie, mint a fresh JWT and continue.

Step 5 is _refresh token rotation_, and it is a genuine security improvement from using only JWTs as of those changes' time. A refresh token is a long-lived credential; rotating on every use means a stolen token is only useful until the legitimate user next makes a request, at which point the thief's copy stops working.

It also makes theft **detectable**: a token presented after it that has already been consumed indicates that two parties hold the same credential.

The important property for what follows is that **rotation is destructive and single-use**. Once a token is presented, it stops being valid, immediately and permanently.

---

## 2. The Defect

### 2.1 How React Router Loaders Talk to the API

This frontend runs server-side. A route `loader` executes on the Node server, reads the browser's `Cookie` header from the incoming request, and forwards it to the Hono API on each call it makes:

```ts
const cookieHeader = request.headers.get("Cookie");

const [userPropertiesRes, userBookmarksRes, userChatsRes] = await Promise.all([
  fetch(`.../users/${userId}/properties`),
  fetch(`.../users/${userId}/bookmarks`, { headers: { Cookie: cookieHeader } }),
  fetch(`.../chats`, { headers: { Cookie: cookieHeader } }),
]);
```

Responses may carry `Set-Cookie` headers. That is how a rotated refresh token reaches the browser, so those are collected and attached to the loader's own response by the `forwardCookies` utility.

Two facts combine badly:

- **Every call in a loader sends the same, original cookie header.** The loader holds a string captured from the incoming request. Nothing updates it mid-process, so a rotation that happens during call A is invisible to calls B and C.
- **Calls are concurrent.** `Promise.all` is the norm, since these requests are independent.

### 2.2 The Failure

For 59 of every 60 minutes, nothing goes wrong: the JWT is valid, `requireAuth` returns at step 1, and the refresh token is never touched.

At the hour boundary the JWT expires. The next page load fires, say, three authenticated requests in parallel, **all carrying the same now-expired JWT and the same refresh token**. All three fall through to step 3.

```mermaid
sequenceDiagram
    participant L as Route loader
    participant A as GET /auth/me
    participant B as GET /bookmarks
    participant DB as refresh_tokens

    Note over L: JWT expired; one cookie header, sent to both
    L->>A: Cookie: session=<expired>; refresh=T1
    L->>B: Cookie: session=<expired>; refresh=T1
    A->>DB: find hash(T1)
    DB-->>A: found
    A->>DB: delete T1, insert T2
    A-->>L: 200 + Set-Cookie: refresh=T2
    B->>DB: find hash(T1)
    DB-->>B: not found (already rotated)
    B-->>L: 401 + Set-Cookie clearing both cookies
    Note over L: forwardCookies merges both -> the clear wins
```

Whichever request reaches the database first rotates successfully. The others find nothing, and step 3 does two damaging things: it returns `401`, and it **clears the user's cookies**.

Because `forwardCookies` merges `Set-Cookie` headers from every response, the cookie-clearing headers travel to the browser alongside the good ones. The browser applies both... The user is logged out by their own page load.

There is a second interleaving, if both requests read the row before either deletes it: both rotate, two valid replacement tokens exist, and the browser keeps only whichever `Set-Cookie` was applied last. The other becomes an orphan row. Less destructive, but the table now holds tokens that no client will ever present.

### 2.3 Sequential Calls Do Not Escape It

Making the calls sequential is not sufficient.

The profile loader awaits `/api/auth/me` first, and only then issues the rest. The first call rotates and returns a new token, but it returns it in a **response header**. The loader's `cookieHeader` variable still holds the original string. Every subsequent call therefore presents the token that was just consumed, and lands squarely on step 3.

So ordering alone does not help. The loader would have to parse the `Set-Cookie` from the first response and rebuild the header for the rest. Nothing does that as of now.

### 2.4 In Conclusion

In production, with users leaving tabs open, it would surface as intermittent unexplained logouts, the kind of bug that is reported vaguely and reproduced with difficulty.

---

## 3. What Is Currently in Place

The mitigation is narrow and deliberate: **do not forward cookie headers from a request that failed.**

In `frontend/app/root.tsx`:

```ts
return data(
  { user, unreadSenders },
  { headers: forwardCookies(authRes, unreadRes.ok ? unreadRes : null) },
);
```

And correspondingly in `frontend/app/routes/user-profile.tsx` for the two chat requests. `forwardCookies` already accepts `null` and skips it, so the guard reads cleanly.

The effect is that a losing request's cookie-clearing headers are discarded. The winner's rotation still reaches the browser, the session survives, and the failed request degrades quietly; the badge reads zero, the chat panel renders empty; until the next navigation, which by then carries a valid JWT and succeeds normally.

### 3.1 What It Does Not Fix

This is damage control at the edge, not a fix. Specifically:

- **The 401s still happen.** Requests still fail at the hour boundary; they simply no longer take the session down with them.
- **Data is silently missing.** A user could see an empty chat panel for one render with no indication that anything failed.
- **It is applied per call site.** Only the requests added or touched by the chat work carry the guard. Pre-existing calls in the same loaders; properties and bookmarks, still forward their headers unconditionally, so the original exposure remains on those paths.
- **The orphan-row interleaving is untouched.** Rows can still be stranded in `refresh_tokens`.

Basically, we are treating a symptom. The real problem is that a single-use credential is being presented several times per page load.

---

## 4. Options for a Real Fix

### 4.1 A Rotation Grace Window

The most commonly deployed answer and the smallest change.

Rather than deleting a token on rotation, mark it consumed a `rotatedAt` timestamp and a `replacedBy` reference. A token presented within a short grace window (10 to 30 seconds) after being consumed is accepted, and the caller receives the **same** replacement the first caller was given, instead of triggering another rotation.

Concurrent requests then all succeed, all end up on the same token, and no cookies are cleared.

The cost is a slightly widened theft window: a stolen token remains usable for the grace period after legitimate use. It is what most identity providers do anyhow.

It also **enables proper theft detection**, which the current code cannot do. Today, when step 3 finds no matching row, it has no way to know whether the token was stolen, already rotated, or never valid; an unknown hash maps to no family, so nothing can be revoked. Keeping consumed tokens around means a replay _outside_ the grace window can be recognised precisely, and the entire `family` revoked in response.

### 4.2 Refresh at a Single Point per Request

Prevent the concurrency instead of tolerating it: guarantee that exactly one call per page load can rotate.

One form is to have the loader call `/api/auth/me` alone first, read the `Set-Cookie` from that response, and rebuild the cookie header for every subsequent call from it. Correct, but it involves parsing `Set-Cookie` in application code and threading the result through every loader.

A cleaner variant is a small server-side wrapper that owns the cookie header for the duration of a loader and updates it whenever a response rotates it. Centralised, but it still needs the first call to complete before the rest can start, which serialises requests that would otherwise be parallelized.

### 4.3 Aggregate Endpoints

The structural fix: if a route needs one backend request, there is no concurrency to lose to.

Rather than the profile page making four or five calls, the backend exposes one endpoint that assembles what the page needs, authenticating once. This is the Backend-for-Frontend pattern, and it removes the problem by construction while also cutting round trips.

The cost is coupling: endpoints shaped around screens rather than resources drift as the UI changes, and the REST API stops being a clean resource model, which matters in this project specifically, since this repository exists partly to reimplement the same API in other stacks. Worth weighing against the fact that these loaders already assemble page-shaped data client-side.

### 4.4 Single-Flight Locking on the Server

Serialise refreshes inside `requireAuth`: keeping a map of in-flight rotations keyed by family, and have concurrent callers await the first one's result rather than starting their own.

Straightforward in a single-process Node server, which is what runs today.

It stops working the moment the API runs as more than one process or instance, since the map is per-process; that would need shared state such as Redis, or a database-level advisory lock. Reasonable as a stopgap, but not as architecture now.

### 4.5 Rotate Less

Rotate only when the refresh token is nearing expiry, rather than on every use, or drop rotation for a plain sliding-expiry session.

This makes the race condition rare instead of routine, but it does not eliminate it, and it gives up the security property that motivated rotation in the first place. I mention it for completeness or lack of any other ideas.

### 4.6 Stop Clearing Cookies on a Failed Refresh

Independently of the above, step 3 could be made less aggressive: return `401` without `clearAuthCookies`, and let the client decide whether to send the user to the log-in page.

Clearing cookies server-side turns one failed request into a destroyed session, which is precisely the blast radius that made this defect painful. A failed refresh is evidence about _that request_, not proof that the session is invalid. This is a small change, it composes with any of the options above and it could prevent the logout on its own.

---

## 5. Planned Solution

I plan on combining **4.1** and **4.6** adding a grace window with proper family revocation on genuine replay, and stop clearing cookies when a refresh lookup fails. Together they address the cause rather than the symptom, keep the security benefit of rotation, and let the frontend guards in section 3 be removed rather than replicated into every new loader.

**4.3** remains attractive on its own merits: it uses fewer round trips, less per-route fetch assembly, but it is a larger architectural decision that should be made for its own reasons on top of this whole issue.

---

## References

- `backends/node-drizzle/src/auth.ts`: `requireAuth`, `createRefreshToken`, `rotateRefreshToken`, `clearAuthCookies`; steps 3 to 5 above are the relevant region.
- `shared/src/schema.ts`: the `refreshTokens` table, including the `family` column that a proper reuse-detection implementation would use.
- `frontend/app/utils/forwardCookies.ts`: merges `Set-Cookie` headers from backend responses; the mechanism by which a failed request's cookie clearing reaches the browser.
- `frontend/app/root.tsx`: carries the guard described in section 3.
- `frontend/app/routes/user-profile.tsx`: carries the guard for chat requests; the properties and bookmarks calls in the same loader remain unguarded.
