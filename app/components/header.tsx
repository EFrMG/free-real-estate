interface NavLinks {
  name: string;
  key: string;
}

const navLinks: NavLinks[] = [
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

export default function Header() {
  return (
    <header className="grid grid-cols-[60%_40%] max-w-7xl w-full mx-auto">
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
          <nav>
            <ul className="flex gap-6 text-lg">
              {navLinks.map((link: NavLinks) => (
                <li key={`nav-link-${link.key}`}>
                  <a href={`/${link.key}`}>{link.name}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="flex items-center justify-around gap-6 bg-amber-100">
        <div className="space-x-6">
          <a href="/">Sign In</a>
          <a href="/">Sign Up</a>
        </div>
        <button className="hidden xs:block">
          <img
            src="https://picsum.photos/1080/1920"
            alt="Burger menu icon"
            className="w-12 h-12"
          />
        </button>
      </div>
    </header>
  );
}
