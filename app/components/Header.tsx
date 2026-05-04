import { useState } from "react";
import { GoHome } from "react-icons/go";
import { RiMenuUnfold4Fill } from "react-icons/ri";
import { Link, NavLink } from "react-router";

interface NavLinks {
  name: string;
  key: string;
}

const IS_USER = true;

const headerLinks: NavLinks[] = [
  {
    name: "Properties",
    key: "properties",
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
    name: "Log in",
    key: "log-in",
  },
  {
    name: "Sign up",
    key: "sign-up",
  },
];

export default function Header() {
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);

  return (
    <header className="max-sm:bg-amber-100 relative z-50 grid grid-cols-[65%_35%] md:grid-cols-[60%_40%] max-w-7xl w-full mx-auto">
      <div className="max-sm:bg-amber-100 bg-amber-50 z-1">
        <div className="flex items-center gap-4 lg:gap-6 text-xl px-2 py-4">
          <Link to="/" className="flex items-center gap-2 max-sm:ml-2">
            <GoHome size={38} />
            <span className="self-end max-sm:inline-block hidden lg:inline-block">
              FreeRealEstate
            </span>
          </Link>

          <nav className="md:self-end max-sm:hidden">
            <ul className="flex gap-4 md:gap-6 text-base md:text-lg">
              {headerLinks.map((link: NavLinks) => (
                <li key={`nav-link-${link.key}`} className="text-nowrap">
                  <NavLink
                    to={`/${link.key}`}
                    className={({ isActive }) =>
                      `inline-block transition-all duration-175 ${isActive ? "text-emerald-800 scale-105" : ""}`
                    }
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Login buttons */}
      <div className="flex items-center justify-end sm:justify-around gap-4 md:gap-6 sm:bg-amber-100">
        <div className="space-x-2 md:space-x-6">
          {IS_USER ? (
            <Link to="/user-profile/ID">
              <div className="flex items-center gap-2">
                <span>USERNAME</span>
                <div className="relative">
                  <img
                    src="/app/assets/images/profile-pictures/man_1.jpeg"
                    alt=""
                    draggable={false}
                    className="w-12 h-12 rounded-full"
                  />
                  {true && (
                    <span
                      className="absolute top-[-0.75ch] left-[-0.5ch]
                    px-1.5 py-1 bg-rose-700 rounded-full
                    text-yellow-50 leading-none font-bold"
                    >
                      <span className="translate-y-px inline-block">N</span>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ) : (
            signingLinks.map((link: NavLinks) => (
              <Link
                key={link.key}
                to={`/${link.key}`}
                className={`px-4 py-2 text-base md:text-lg hidden sm:inline-block
              ${link.key === "log-in" ? "" : "bg-amber-300 rounded-sm"}`}
              >
                {link.name}
              </Link>
            ))
          )}
        </div>

        {/* Burger menu */}
        <button
          onClick={() => setIsBurgerOpen(!isBurgerOpen)}
          className="hidden max-sm:block mr-2 z-50"
        >
          <RiMenuUnfold4Fill
            size={38}
            fill={`${isBurgerOpen ? "white" : "black"}`}
            className="transition-colors delay-250 duration-250"
          />
        </button>
        <nav
          className={`fixed top-0 right-0 bottom-0
          bg-amber-500 text-white sm:hidden z-40
          transition-transform duration-500 ease-out-swift
          ${!isBurgerOpen ? "translate-x-full" : "translate-x-0"}`}
        >
          <ul className="stack-6 pt-24 px-12 text-lg">
            {headerLinks.map((link: NavLinks) => (
              <li key={`nav-link-${link.key}`}>
                <Link to={`/${link.key}`}>{link.name}</Link>
              </li>
            ))}

            {!IS_USER &&
              signingLinks.map((link: NavLinks) => (
                <Link key={link.key} to={`/${link.key}`}>
                  {link.name}
                </Link>
              ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
