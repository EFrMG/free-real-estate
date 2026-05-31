import { useState } from "react";
import { useNavigate, Link } from "react-router";
import type { Route } from "./+types/log-in";

import HeroRightSide from "~/components/HeroRightSide";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Log In | Free Real State" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

// TODO: show successful login
export default function LogIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
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
            Welcome Back
          </h1>
          <p className="text-amber-900/74 mb-8">
            Log in to access your saved properties and messages.
          </p>

          <form
            onSubmit={handleSubmit}
            className="stack-6 p-6 rounded-lg bg-amber-100/74 shadow-lg
            gen-form-labels"
          >
            {error && <p className="gen-form-error">{error}</p>}

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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className=" gen-input-forms"
                placeholder="••••••••"
              />
            </fieldset>

            <button type="submit" disabled={isLoading} className="sign-in-btn">
              {isLoading ? "Logging in..." : "Log In"}
            </button>

            <p className="text-center text-amber-900/74 mt-4">
              Don't have an account?{" "}
              <Link
                to="/sign-up"
                className="text-amber-700 font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
      <HeroRightSide />
    </main>
  );
}
