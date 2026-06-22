import type { Route } from "./+types/log-in";
import type { FetcherWithComponents } from "react-router";

import { useSearchParams, useFetcher, Link, redirect } from "react-router";
import { motion, AnimatePresence } from "motion/react";

import HeroRightSide from "~/components/HeroRightSide";

interface ActionData {
  error?: string;
}

interface LogInFormProps {
  children: React.ReactNode;
  fetcher: FetcherWithComponents<ActionData>;
  titleText: string;
  paragraphText: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Log In / Sign Up | Free Real Estate" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "login";

  if (mode === "signup") {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const signupRes = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const signupData = await signupRes.json();

    // TODO: handle zod validation for login too.
    if (!signupRes.ok) {
      // Zod validation
      if (
        typeof signupData.error === "object" &&
        signupData.error.fieldErrors
      ) {
        const firstKey = Object.keys(signupData.error.fieldErrors)[0];

        // Guard empty fieldErrors
        if (firstKey) {
          return { error: signupData.error.fieldErrors[firstKey][0] };
        }

        // Fall through to formErrors in case previous is an empty object
        if (signupData.error.formErrors?.length) {
          return { error: signupData.error.formErrors[0] };
        }
      }

      // Guarantee a string even with some object if not a string
      const message =
        typeof signupData.error === "string"
          ? signupData.error
          : "Registration failed.";

      return { error: message };
    }

    const headers = new Headers();
    const setCookieHeader = signupRes.headers.get("Set-Cookie");

    if (setCookieHeader) {
      headers.set("Set-Cookie", setCookieHeader);
    }

    return redirect("/", { headers });
  }

  if (mode === "login") {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const loginRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok) {
      return { error: loginData.error || "Login failed" };
    }

    const headers = new Headers();
    const setCookieHeader = loginRes.headers.get("Set-Cookie");

    if (setCookieHeader) {
      headers.set("Set-Cookie", setCookieHeader);
    }

    return redirect("/", { headers });
  }
}

const LogInForm = ({
  children,
  fetcher,
  titleText,
  paragraphText,
}: LogInFormProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <h1 className="text-2xl font-semibold mb-2 text-amber-950">
        {titleText}
      </h1>
      <p className="text-amber-900/74 mb-8">{paragraphText}</p>
      <fetcher.Form
        method="post"
        className="stack-6 p-6 rounded-lg bg-amber-100/74 shadow-lg gen-form-labels"
      >
        {children}
      </fetcher.Form>

      {fetcher.data?.error && (
        <p className="gen-form-error">{fetcher.data.error}</p>
      )}
    </motion.div>
  );
};

export default function LogIn() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";

  const fetcher = useFetcher<ActionData>();
  const isLoading = fetcher.state !== "idle";

  return (
    <main className="gen-main">
      <div className="gen-left sign-in-wrapper">
        <div className="max-w-md w-full mx-auto">
          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <LogInForm
                key="login-form"
                fetcher={fetcher}
                titleText="Welcome Back"
                paragraphText="Log in to access your saved properties and messages."
              >
                <fieldset>
                  <label htmlFor="login-email">Email Address</label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    className="gen-input-forms"
                    placeholder="you@example.comma"
                  />
                </fieldset>

                <fieldset>
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    required
                    className="gen-input-forms"
                    placeholder="••••••••"
                  />
                </fieldset>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="sign-in-btn"
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </button>

                <p className="text-center text-amber-900/74 mt-4">
                  Don't have an account?{" "}
                  <Link
                    to="/log-in?mode=signup"
                    className="text-amber-700 font-semibold hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </LogInForm>
            ) : (
              mode === "signup" && (
                <LogInForm
                  key="signup-form"
                  fetcher={fetcher}
                  titleText="Create an Account"
                  paragraphText="Join Free Real Estate to find your perfect place to live."
                >
                  <fieldset>
                    <label htmlFor="signup-name">Full Name</label>
                    <input
                      id="signup-name"
                      name="name"
                      type="text"
                      required
                      className="gen-input-forms"
                      placeholder="Given Name"
                    />
                  </fieldset>

                  <fieldset>
                    <label htmlFor="signup-email">Email Address</label>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      className="gen-input-forms"
                      placeholder="you@example.comma"
                    />
                  </fieldset>

                  <fieldset>
                    <label htmlFor="signup-password">Password</label>
                    <input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      className="gen-input-forms"
                      placeholder="••••••••"
                    />
                  </fieldset>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="sign-in-btn"
                  >
                    {isLoading ? "Signing up..." : "Sign Up"}
                  </button>

                  <p className="text-center text-amber-900/74 mt-4">
                    Already have an account?{" "}
                    <Link
                      to="/log-in?mode=login"
                      className="text-amber-700 font-semibold hover:underline"
                    >
                      Log In
                    </Link>
                  </p>
                </LogInForm>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
      <HeroRightSide />
    </main>
  );
}
