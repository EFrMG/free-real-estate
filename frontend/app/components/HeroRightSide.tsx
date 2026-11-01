export default function HeroRightSide() {
  return (
    <div className="relative -z-1 h-full w-full items-center max-md:absolute max-md:top-0 max-md:right-0 max-md:bottom-0 max-md:w-[50%] max-md:opacity-12 md:flex md:bg-amber-100">
      <img
        src="/app/assets/images/hero.webp"
        alt="Hero image"
        draggable={false}
        className="absolute top-12 right-4 h-[95%] max-h-[85vh] w-[120%] max-w-none object-contain max-md:right-2"
      />
    </div>
  );
}
