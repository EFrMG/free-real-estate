import { useCallback, useEffect, useRef, useState } from "react";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";

export default function PropertyGallery({
  interiorGallery,
}: {
  interiorGallery: string[];
}) {
  const [currentIdx, setCurrentIdx] = useState(1);
  const trackRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);
  const totalSlides = interiorGallery.length;

  const moveToSlide = useCallback((idx: number, animate = true) => {
    const track = trackRef.current;
    if (!track || !track.parentElement) return;

    const width = track.parentElement.offsetWidth;

    track.style.transition = animate
      ? "transform 750ms var(--ease-in-swift)"
      : "none";
    track.style.transform = `translateX(-${idx * width}px)`;

    setCurrentIdx(idx);
  }, []);

  useEffect(() => {
    moveToSlide(1, false);
  }, [moveToSlide]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onEnd = () => {
      isTransitioning.current = false;
      if (currentIdx === totalSlides + 1) moveToSlide(1, false);
      else if (currentIdx === 0) moveToSlide(totalSlides, false);
    };

    track.addEventListener("transitionend", onEnd);

    return () => track.removeEventListener("transitionend", onEnd);
  });

  const moveTowards = (direction: 1 | -1) => {
    if (isTransitioning.current) return;

    isTransitioning.current = true;
    moveToSlide(currentIdx + direction);
  };

  const displaySlides = [
    interiorGallery[totalSlides - 1],
    ...interiorGallery,
    interiorGallery[0],
  ];

  return (
    <div
      className="relative w-full h-[35vh] mt-8 shadow-lg rounded-lg overflow-hidden
            [&_button]:absolute [&_button]:bg-amber-300/36 [&_button]:rounded-full
            [&_button]:p-3 [&_button]:backdrop-blur-sm"
    >
      <button
        className="top-[50%] left-10 translate-[-50%] z-10"
        onClick={() => moveTowards(-1)}
      >
        <GoChevronLeft size={36} />
      </button>
      <button
        className="top-[50%] -right-5 translate-[-50%] z-10"
        onClick={() => moveTowards(1)}
      >
        <GoChevronRight size={36} />
      </button>
      <div ref={trackRef} className="flex justify-around h-full w-full">
        {displaySlides.map((image, i) => (
          <img
            key={`carousel-item-${image}-${i}`}
            src={image}
            alt="Property image of the interior"
            draggable={false}
            className="h-full min-w-full object-center object-cover"
          />
        ))}
      </div>
    </div>
  );
}
