import { useEffect, useState } from "react";
import { Link, NavLink, useRouteLoaderData } from "react-router";

import getAssetUrl, { handleProfilePictureError } from "~/utils/getAssetUrl";

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
    key: "log-in?mode=signup",
  },
];

function UserLink({
  isBurger,
  user,
  unreadSenders,
  onNavigate,
}: {
  isBurger: boolean;
  user: any;
  unreadSenders: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={`/user-profile/${user.id}`}
      onClick={onNavigate}
      className={isBurger ? "sm:hidden" : "hidden sm:inline-block"}
    >
      <div className="flex items-center gap-2">
        <span className="line-clamp-1 max-w-[16ch] min-w-0 text-center font-normal">
          {user.name}
        </span>
        <div className="relative shrink-0">
          <img
            src={getAssetUrl(user.profilePicture)}
            onError={handleProfilePictureError}
            alt=""
            draggable={false}
            className="h-12 w-12 rounded-full object-cover"
          />
          {unreadSenders > 0 && (
            <span
              title={`${unreadSenders} ${unreadSenders === 1 ? "person is" : "people are"} waiting on a reply`}
              className="absolute top-[-0.75ch] left-[-0.5ch] rounded-full bg-rose-700 px-1.5 py-1 text-sm leading-none font-bold text-yellow-50"
            >
              <span className="inline-block translate-y-px">
                {unreadSenders}
              </span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function Header() {
  const rootData = useRouteLoaderData("root");
  const user = rootData?.user ?? null;

  const unreadSenders: number = rootData?.unreadSenders ?? 0;
  const isUser = !!user;

  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const closeBurger = () => setIsBurgerOpen(false);

  // Lock the page underneath while the burger panel is open, on top of its own scroll
  useEffect(() => {
    if (!isBurgerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isBurgerOpen]);

  return (
    <header className="relative z-50 mx-auto grid w-full max-w-7xl grid-cols-[65%_35%] max-sm:bg-amber-100 md:grid-cols-[60%_40%]">
      <div className="z-1 bg-amber-50 max-sm:bg-amber-100">
        <div className="flex items-center gap-4 px-2 py-4 lg:gap-6">
          <Link to="/" className="flex items-center gap-2 max-sm:ml-2">
            <GoHome size={38} />
            <span className="hidden self-end text-lg leading-7 max-sm:inline-block lg:inline-block">
              FreeRealEstate
            </span>
          </Link>

          <nav className="max-sm:hidden md:self-end">
            <ul className="flex text-base leading-6 font-medium md:gap-2">
              {headerLinks.map((link: NavLinks) => (
                <li key={`nav-link-${link.key}`} className="text-nowrap">
                  <NavLink
                    to={`/${link.key}`}
                    className={({ isActive }) =>
                      `inline-block px-2 pt-2 transition-all duration-175 ${isActive ? "scale-105 text-emerald-800" : ""}`
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
      <div className="flex items-center justify-end gap-4 sm:justify-around sm:bg-amber-100 md:gap-6">
        <div className="space-x-2 md:space-x-6">
          {isUser ? (
            <UserLink
              isBurger={false}
              user={user}
              unreadSenders={unreadSenders}
            />
          ) : (
            signingLinks.map((link: NavLinks) => (
              <Link
                key={link.key}
                to={`/${link.key}`}
                className={`hidden px-4 py-2 text-base sm:inline-block ${link.key === "log-in" ? "" : "rounded-sm bg-amber-300"}`}
              >
                {link.name}
              </Link>
            ))
          )}
        </div>

        {/* Burger menu */}
        <button
          onClick={() => setIsBurgerOpen(!isBurgerOpen)}
          aria-expanded={isBurgerOpen}
          aria-controls="burger-nav"
          aria-label={isBurgerOpen ? "Close menu" : "Open menu"}
          className={`z-50 mr-2 hidden max-sm:block ${isBurgerOpen && "fixed"}`}
        >
          <RiMenuUnfold4Fill
            size={38}
            fill={`${isBurgerOpen ? "white" : "black"}`}
            className="transition-colors delay-250 duration-250"
          />
        </button>

        {/* Backdrop */}
        <div
          onClick={closeBurger}
          aria-hidden="true"
          className={`fixed inset-0 z-30 bg-black/28 transition-opacity duration-500 ease-out-swift sm:hidden ${isBurgerOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        />

        <nav
          id="burger-nav"
          inert={!isBurgerOpen}
          className={`fixed top-0 right-0 bottom-0 z-40 bg-amber-500 text-white transition-transform duration-500 ease-out-swift sm:hidden ${!isBurgerOpen ? "translate-x-full" : "translate-x-0"}`}
        >
          <ul className="stack-6 px-12 pt-24 text-lg font-medium">
            {headerLinks.map((link: NavLinks) => (
              <li key={`nav-link-${link.key}`}>
                <Link to={`/${link.key}`} onClick={closeBurger}>
                  {link.name}
                </Link>
              </li>
            ))}

            {isUser ? (
              <UserLink
                isBurger={true}
                user={user}
                unreadSenders={unreadSenders}
                onNavigate={closeBurger}
              />
            ) : (
              signingLinks.map((link: NavLinks) => (
                <Link key={link.key} to={`/${link.key}`} onClick={closeBurger}>
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
