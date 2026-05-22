export default function HeroRightSide() {
  return (
    <div
      className="relative max-md:absolute max-md:top-0 max-md:right-0 max-md:bottom-0
        max-md:opacity-24 max-md:w-[50%]
        w-full h-full md:flex items-center md:bg-amber-100 -z-1"
    >
      <img
        src="/app/assets/images/hero.webp"
        alt="Hero image"
        draggable={false}
        className="absolute top-12 right-4 max-md:right-2 max-w-none w-[120%] max-h-[85vh] h-[95%] object-contain"
      />
    </div>
  );
}
