import { useState } from "react";
import { useNavigate, Link } from "react-router";
import type { Route } from "./+types/sign-up";

import HeroRightSide from "~/components/HeroRightSide";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up | Free Real State" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        // Zod errors: https://zod.dev/error-formatting?id=zflattenerror
        // TODO: better handling, although we should validate and show errors from the frontend first and foremost
        if (typeof data.error === "object" && data.error.fieldErrors) {
          const firstKey = Object.keys(data.error.fieldErrors)[0];

          throw new Error(data.error.fieldErrors[firstKey][0]);
        }

        throw new Error(data.error || "Registration failed");
      }

      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="gen-main">
      <div className="gen-left sign-in-wrapper">
        <div className="max-w-md w-full mx-auto">
          <h1 className="text-2xl font-semibold mb-2 text-amber-950">
            Create an Account
          </h1>
          <p className="text-amber-900/74 mb-8">
            Join Free Real Estate to find your perfect place to live.
          </p>

          <form
            onSubmit={handleSubmit}
            className="stack-6 p-6 rounded-lg bg-amber-100/74 shadow-lg gen-form-labels"
          >
            {error && <p className="gen-form-error">{error}</p>}

            <fieldset>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="gen-input-forms"
                placeholder="Given Name"
              />
            </fieldset>

            <fieldset>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="gen-input-forms"
                placeholder="you@example.comma"
              />
            </fieldset>

            <fieldset>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="gen-input-forms"
                placeholder="••••••••"
              />
            </fieldset>

            <button type="submit" disabled={isLoading} className="sign-in-btn">
              {isLoading ? "Signing up..." : "Sign Up"}
            </button>

            <p className="text-center text-amber-900/74 mt-4">
              Already have an account?{" "}
              <Link
                to="/log-in"
                className="text-amber-700 font-semibold hover:underline"
              >
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
      <HeroRightSide />
    </main>
  );
}
