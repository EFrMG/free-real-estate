import { useState } from "react";
import {
  Link,
  NavLink,
  useRouteLoaderData,
  useNavigate,
  useRevalidator,
} from "react-router";

import { getAssetUrl } from "~/utils/display";

import { GoHome } from "react-icons/go";
import { RiMenuUnfold4Fill } from "react-icons/ri";

interface NavLinks {
  name: string;
  key: string;
}

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

function UserLink({ isBurger, user }: { isBurger: boolean; user: any }) {
  return (
    <Link
      to={`/user-profile/${user.id}`}
      className={isBurger ? "sm:hidden" : "hidden sm:inline-block"}
    >
      <div className="flex items-center gap-2">
        <span>{user.name}</span>
        <div className="relative">
          <img
            src={getAssetUrl(user.profilePicture)}
            alt=""
            draggable={false}
            className="w-12 h-12 rounded-full object-cover"
          />
          {/* TODO: implement notifications and show the real number */}
          <span
            className="absolute top-[-0.75ch] left-[-0.5ch]
                    px-1.5 py-1 bg-rose-700 rounded-full
                    text-sm text-yellow-50 leading-none font-bold"
          >
            <span className="translate-y-px inline-block">N</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Header() {
  const user = useRouteLoaderData("root");
  const isUser = !!user;

  const navigate = useNavigate();
  const { revalidate, state: headerRevalidateState } = useRevalidator();

  const [isBurgerOpen, setIsBurgerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        if (headerRevalidateState === "idle") revalidate();

        navigate("/");
      }
    } catch (err) {
      console.error(`Failed to remove session cookie (Log Out): ${err}`);
    }
  };

  return (
    <header className="max-sm:bg-amber-100 relative z-50 grid grid-cols-[65%_35%] md:grid-cols-[60%_40%] max-w-7xl w-full mx-auto">
      <div className="max-sm:bg-amber-100 bg-amber-50 z-1">
        <div className="flex items-center gap-4 lg:gap-6 px-2 py-4">
          <Link to="/" className="flex items-center gap-2 max-sm:ml-2">
            <GoHome size={38} />
            <span className="hidden lg:inline-block self-end max-sm:inline-block text-lg leading-7">
              FreeRealEstate
            </span>
          </Link>

          <nav className="md:self-end max-sm:hidden">
            <ul className="flex md:gap-2 text-base font-medium leading-6">
              {headerLinks.map((link: NavLinks) => (
                <li key={`nav-link-${link.key}`} className="text-nowrap">
                  <NavLink
                    to={`/${link.key}`}
                    className={({ isActive }) =>
                      `inline-block px-2 pt-2 transition-all duration-175 ${isActive ? "text-emerald-800 scale-105" : ""}`
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
          {isUser ? (
            <>
              <button
                onClick={handleLogout}
                className="py-1.5 px-2 text-sm text-amber-700/84 rounded-sm bg-amber-200/28 shadow-sm
                outline outline-amber-300/18 hover:outline-rose-500/12
                hover:text-rose-700/84 hover:bg-rose-200/24 gen-btn-hovaction
                transition-all duration-300"
              >
                Log Out
              </button>
              <UserLink isBurger={false} user={user} />
            </>
          ) : (
            signingLinks.map((link: NavLinks) => (
              <Link
                key={link.key}
                to={`/${link.key}`}
                className={`px-4 py-2 text-base hidden sm:inline-block
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

            {isUser ? (
              <UserLink isBurger={true} user={user} />
            ) : (
              signingLinks.map((link: NavLinks) => (
                <Link key={link.key} to={`/${link.key}`}>
                  {link.name}
                </Link>
              ))
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
