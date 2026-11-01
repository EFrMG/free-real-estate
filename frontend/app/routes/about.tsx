import type { Route } from "./+types/about";

import { Link } from "react-router";

import HeroRightSide from "~/components/HeroRightSide";
import { mergeMeta } from "~/utils/meta";

const demoAccounts = [
  { email: "john@me.com", name: "Johnathan Doebanne", role: "Agent" },
  { email: "marti@me.com", name: "Martina Rossi", role: "Agent" },
  { email: "facu@me.com", name: "Facundo Gomez", role: "User" },
  { email: "sofi@me.com", name: "Sofia Martinez", role: "User" },
];

export function meta({ matches }: Route.MetaArgs) {
  return mergeMeta(matches, {
    title: "About | Free Real State",
    description:
      "Real estate company: The place where your future place is found.",
  });
}

export default function About() {
  return (
    <main className="gen-main">
      <div className="gen-left space-y-8 [&_p]:leading-relaxed">
        <h1 className="page-title md:mt-12">Welcome to Free Real Estate</h1>
        <p>
          This is your premier destination for finding the perfect property and
          deals. Whether you are looking to buy, rent, or just exploring, our
          platform provides a seamless experience tailored to your needs.
        </p>
        <p>
          Search and filter our listings to narrow down exactly what you're
          looking for, browse our agents' profiles to see what each of them has
          on the market, and bookmark anything that catches your eye so you can
          come back to it later.
        </p>

        <section className="stack-4 rounded-lg border border-amber-400/28 bg-amber-100/74 p-5 shadow-md">
          <h2 className="text-xl font-semibold text-amber-950">
            How to Log In Into Existing Accounts
          </h2>
          <p className="text-amber-900/84">
            One can{" "}
            <Link
              to="/log-in?mode=login"
              className="font-semibold text-amber-700 hover:underline"
            >
              log in
            </Link>{" "}
            with any of the accounts below.
          </p>
          <p className="text-amber-900/84">
            The password for all of them is{" "}
            <code className="rounded bg-amber-200/64 px-1 py-0.5 font-mono text-amber-950">
              password123
            </code>
            .
          </p>

          <ul className="stack-2">
            {demoAccounts.map(({ email, name, role }) => (
              <li
                key={email}
                className="flex flex-wrap items-baseline justify-between gap-x-[1ch] gap-y-1 xs:px-3"
              >
                <div>
                  <code className="rounded bg-amber-200/60 px-1 font-mono text-amber-950/74">
                    {email}
                  </code>
                </div>
                <div className="flex gap-x-[1ch]">
                  <span className="text-sm text-amber-900/74">{name}:</span>
                  <span className="rounded-full bg-amber-200/64 px-1.5 py-0.5 text-xs font-semibold tracking-wide text-amber-900 uppercase">
                    {role}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-sm text-amber-900/74">
            Agent accounts can manage their own listings and profile; user
            accounts can bookmark properties and chat with agents.
          </p>
          <p className="text-sm text-amber-900/74">
            Everything resets to the original data once a day, so feel free to
            change whatever you like.
          </p>
        </section>

        <p className="text-center text-gray-800/74">
          This is a demo project for{" "}
          <a
            href="http://francisco.is-a.dev/"
            target="_blank"
            className="outside-link opacity-less"
          >
            My Portfolio
          </a>
          .
        </p>
      </div>
      <HeroRightSide />
    </main>
  );
}
