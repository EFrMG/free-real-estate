# Free Real Estate Monorepo

> [!NOTE]
> This project is under active development.

Real Estate company demo website and testing ground for numerous backends.

So far, I am working with Drizzle and SQLite, although I expect to use Prisma and MongoDB, and Golang too.

This present document serves as a General Design Document.

## 1. Project Structure

The project is structured as a **monorepo** managed by `pnpm` workspaces. This approach allows for tight integration between the frontend, backend and shared resources while maintaining a certain level of organizational boundaries.

A general overview of the current state of the project:

```mermaid
graph TD
    subgraph FE ["Frontend"]
        UI[UI Components]
        Components("`Geographic Maps
        Property Listing
        **User Interactions**`")
    end

    subgraph BE ["Backend"]
        API[Hono REST API]
        ORM[Drizzle ORM]
    end

    subgraph SH ["Shared Package"]
        Schema[Database Schema]
        Types[Shared Data Types]
    end

    DB[(SQLite Database)]

    %% Runtime Data Flow
    Components ==> UI
    UI <== "Fetch / JSON" ==> API
    API <== "Queries" ==> ORM
    ORM <== "SQL" ==> DB

    %% Source of Truth Logic
    Schema -- "Defines" --> ORM
    Schema -- "Infers" --> Types
    Schema -- "Syncs / Migrates" --> DB

    Types -- "Type Safety" --> UI
    Types -- "Type Safety" --> API

    %% Subgraphs
    style FE fill:#1f1f1f,stroke:#202036,stroke-width:2px
    style BE fill:#1f1f1f,stroke:#202036,stroke-width:2px
    style SH fill:#1f1f1f,stroke:#202036,stroke-width:2px

    %% Lighter Node
    style UI fill:#3f3f3f,stroke:#909090,color:#f5f5f5
    style Components fill:#3f3f3f,stroke:#909090,color:#f5f5f5
    style API fill:#3f3f3f,stroke:#909090,color:#f5f5f5
    style ORM fill:#3f3f3f,stroke:#909090,color:#f5f5f5
    style Schema fill:#3f3f3f,stroke:#909090,color:#f5f5f5
    style Types fill:#3f3f3f,stroke:#909090,color:#f5f5f5
    style DB fill:#3f3f3f,stroke:#909090,color:#f5f5f5
```

The main parts of this monorepo are as follows (dependencies and their web links are listed in their respective README documents):

### 1.1 Frontend

#### 1.1.1 Framework

The frontend is designed to be a high-performance, modern web application built with `React Router v7` (in _SPA_ mode).

It was decided to organize `React` components simply in `/frontend/app/components/`.

#### 1.1.2 Styling

With `Tailwind CSS v4` We utilize a custom theme and general reset that extends `preflight` along with utility classes.

#### 1.1.3 Maps

`React-leaflet` is used for interactive property maps that support adding markers. These are basically `open street maps` with some extra functionality.

#### 1.1.4 State Management

React Router's `loader` and `action` patterns are used for data fetching and mutations, minimizing the need for complex global state libraries

#### 1.1.5 Previews of the frontend:

<img width="1608" height="1007" alt="home" src="https://github.com/user-attachments/assets/9a1e2dc0-2db9-460d-b7cd-0a8d4954e500" />

---

<img width="1575" height="1417" alt="properties" src="https://github.com/user-attachments/assets/3f6b3e75-e64e-47da-8e4f-c520ad4d0bbd" />

---

<img width="1593" height="1107" alt="property-item" src="https://github.com/user-attachments/assets/a8310b77-3d77-430b-a34a-562297da7468" />

---

<img width="1577" height="1295" alt="contact" src="https://github.com/user-attachments/assets/3f465533-eca7-4f0f-9ca8-ae846ac041b7" />

---

<img width="1592" height="1007" alt="sign-up" src="https://github.com/user-attachments/assets/c09d94c2-b7ed-4421-90cc-6a0d89456b10" />

---

<img width="1592" height="1007" alt="log-in" src="https://github.com/user-attachments/assets/86883455-53bb-4967-ad5d-a7da59278f36" />

---

<img width="1592" height="1007" alt="user-profile_0" src="https://github.com/user-attachments/assets/af661908-ca35-4425-87bd-c3a54f679502" />

---

<img width="1592" height="1007" alt="user-profile_1" src="https://github.com/user-attachments/assets/68fd766c-8fd5-4f8e-a7ce-d4434820a0a8" />

### 1.2 Backends

#### 1.2.1 Drizzle

RESTful API built with `Hono`, using `Drizzle` ORM.

The runtime is `Node.js` via `@hono/node-server`.

- **Endpoints**:
  - _Properties_:
    - `GET /api/properties`: Supports filtering (price, type, location, etcetera).
    - `GET /api/properties/:id`: View of a single listing.
    - `GET /api/cities`: Gets unique cities for search suggestions on user inputs.
  - _Authentication_:
    - `POST /api/auth/register`: User registration.
    - `POST /api/auth/login`: User login (sets session cookie).
    - `POST /api/auth/logout`: User logout (clears session cookie).
    - `GET /api/auth/me`: Verifies currently authenticated user session and retrieves the full user's profile.
  - _Users & Bookmarks_:
    - `GET /api/users`: Gets list of user agents (not normal users, as this is for Our Agents page).
    - `GET /api/users/:id`: Gets profile details of a specific user.
    - `PUT /api/users/:id`: Updates a user's profile (name, profile picture, bio, etc).
    - `PUT /api/users/:id/password`: Updates a user's password, including verification with Argon2.
    - `POST /api/users/:id/promote`: Promotes a normal user to Agent status using a secret code.
    - `GET /api/users/:id/properties`: Gets properties owned by a user.
    - `GET /api/users/:id/bookmarks`: Gets a user's bookmarked properties.
    - `POST /api/users/:id/bookmarks`: Saves a property to a user's bookmarks.
    - `DELETE /api/users/:id/bookmarks/:propertyId`: Removes a property from a user's bookmarks.

##### 1.2.1.1 Core Database Entities

- **Users**: Represents real estate agents and their clients. It stores identity and profile information.
- **Properties**: The central entity. It stores listing details, location (latitude/longitude), pricing and media (images, galleries).
- **Posts**: Blog or news entries for the platform.
- **Chats & Messages**: Support for real-time and persistent communication between users.
- **Bookmarks**: Users are able to save favorite properties to look up later from their respective profile pages.

##### 1.2.1.2 Schema Implementation

We use `Drizzle`.

JSON fields are used to store complex data like image galleries and nearby places within the SQLite database without requiring a whole new set of tables. There is a neat helper for this thanks to Drizzle's custom types.

### 1.3 Shared

A central package containing the database schema and TypeScript types, ensuring consistency across both aforementioned sub-repositories as the single source of truth; these are shared as a local dependency under the name of `@free-real-estate/shared`.

## 2. Running the Project

As of now, one could clone the repository and add a `.env` file at `/backends/node-drizzle/` with the following:

```
DB_FILE_NAME=file:local.db
```

Then run:

```bash
pnpm install

pnpm push:be && pnpm seed:be && pnpm run dev
```

**⌃** This:

1. Creates database tables according to the [schema](/shared/src/schema.ts).
2. Seeds the tables, for which you want to be using a Linux (or Unix) filesystem or check the **linked** [general data file](/backends/node-drizzle/src/db/generalDataSeed.ts) for compatibility with a different type of which.
3. To then start both the backend and frontend servers in parallel. Consult the [main package file](/package.json) for more commands to run from the root of the project.

## 3. Future Considerations

- **Messaging System**: Implementation of real-time or persistent chat functionality between users and agents.
- **Image Hosting**: Transitioning from local assets to a CDN or cloud storage (this could be useful in cases where projects need to scale).
- **Backend Diversification**: Implementing the same API specifications in Go to compare performance and developer experience could be very interesting from a certain perspective.
