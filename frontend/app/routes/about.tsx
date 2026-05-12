import type { Route } from "./+types/about";

import HeroRightSide from "~/components/HeroRightSide";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About | Free Real State" },
    {
      name: "description",
      content:
        "Real estate company: The place where your future place is found.",
    },
  ];
}

export default function About() {
  return (
    <main className="gen-main">
      <div className="gen-left space-y-8 [&_p]:leading-relaxed">
        <h1 className="mt-4 text-2xl">Welcome to Free Real Estate</h1>
        <p>
          This is your premier destination for finding the perfect property and
          deals. Whether you are looking to buy, rent, or just exploring, our
          platform provides a seamless experience tailored to your needs.
        </p>
        <p>
          {/* DO NOT SHOW FOR USERS */}
          By creating an account, you unlock the full potential of our service.
          You will be able to manage your personal profile and interact around
          the site.
        </p>
        <p>
          Explore our diverse range of properties with ease. Our intuitive
          search and filtering tools allow you to narrow down your choices,
          ensuring you find exactly what you're looking for.
        </p>
        <p>
          Connect with our dedicated agents who are here to guide you every step
          of the way. Browse their profiles, view their current listings, and
          reach out to them directly for expert advice and personalized
          assistance.
        </p>
        <p>
          Never lose track of a property that catches your eye. With our
          bookmarking feature, you can save your favorite listings and revisit
          them whenever you like, making your search more organized and
          efficient.
        </p>
        <p>
          We are excited to always share how many properties people could afford
          for free!
        </p>
        <p className="text-gray-600/84">
          This is a demo project for{" "}
          <a
            href="http://francisco.is-a.dev/"
            target="_blank"
            className="text-blue-600/84 decoration-blue-600/84 outside-link"
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
