import { useState } from "react";

interface NavLinks {
  name: string;
  key: string;
}

const headerLinks: NavLinks[] = [
  {
    name: "Home",
    key: "home",
  },
  {
    name: "About",
    key: "about",
  },
  {
    name: "Contact",
    key: "contact",
  },
  {
    name: "Our Agents",
    key: "our-agents",
  },
];

const signingLinks: NavLinks[] = [
  {
    name: "Sign in",
    key: "sign-in",
  },
  {
    name: "Sign up",
    key: "sign-up",
  },
];

export default function Header() {
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);

  return (
    <header className="grid grid-cols-[40%_60%] sm:grid-cols-[60%_40%] max-w-7xl w-full mx-auto">
      <div className="bg-amber-50">
        <div className="flex items-center gap-12 text-xl  px-2 py-4">
          {" "}
          <a href="/">
            <img
              src="https://picsum.photos/240/240"
              alt="Company logo"
              className="w-12 h-12 inline-block mr-2"
            />
            <span className="max-xs:inline-block hidden lg:inline-block">
              FreeRealEstate
            </span>
          </a>
          <nav className="max-sm:hidden">
            <ul className="flex gap-6 text-lg">
              {headerLinks.map((link: NavLinks) => (
                <li key={`nav-link-${link.key}`}>
                  <a href={`/${link.key}`}>{link.name}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="flex items-center justify-around gap-6 sm:bg-amber-100">
        <div className="space-x-6">
          {signingLinks.map((link: NavLinks) => (
            <a
              key={link.key}
              href={`/${link.key}`}
              className={
                link.key === "sign-in"
                  ? "px-4 py-2"
                  : "bg-amber-300 rounded-lg px-4 py-2"
              }
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Burger menu */}
        <button className="hidden max-sm:block z-50">
          <img
            src="https://picsum.photos/240/240"
            alt="Burger menu icon"
            className="w-12 h-12"
            onClick={() => setIsBurgerOpen(!isBurgerOpen)}
          />
        </button>
        <nav
          className={`absolute top-0 right-0 bottom-0
          bg-amber-600 text-white sm:hidden z-40
          transition-transform duration-500 ease-out-swift
          ${!isBurgerOpen ? "translate-x-full" : "translate-x-0"}`}
        >
          <ul className="stack-6 pt-24 px-12 text-lg">
            {headerLinks.map((link: NavLinks) => (
              <li key={`nav-link-${link.key}`}>
                <a href={`/${link.key}`}>{link.name}</a>
              </li>
            ))}
            {signingLinks.map((link: NavLinks) => (
              <a key={link.key} href={`/${link.key}`}>
                {link.name}
              </a>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
