export default function Header() {
  return (
    <header className="flex justify-around bg-amber-50">
      <div>
        <a href="/">
          <img
            src="https://picsum.photos/240/240"
            alt="Company logo"
            className="w-16 inline-block"
          />
          <span>FreeRealEstate</span>
        </a>
      </div>
      <div>2</div>
    </header>
  );
}
