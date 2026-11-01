import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import useDialog from "~/hooks/useDialog";
import getAssetUrl from "~/utils/getAssetUrl";

import { GoChevronLeft, GoChevronRight, GoX } from "react-icons/go";

export default function PropertyGallery({
  interiorGallery,
}: {
  interiorGallery: string[];
}) {
  const [currentIdx, setCurrentIdx] = useState(1);

  const trackRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);

  const { isDialogOpen, dialogRef, openCloseDialog } = useDialog();

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
    <div className="relative mt-8 h-[35dvh] w-full overflow-hidden rounded-lg shadow-lg [&_button]:absolute [&_button]:rounded-full [&_button]:bg-amber-300/36 [&_button]:p-3 [&_button]:shadow-md [&_button]:backdrop-blur-sm [&_button]:transition-colors [&_button]:duration-150 [&_button]:hover:bg-amber-200/36">
      <button
        className="top-[50%] left-10 z-10 translate-[-50%]"
        onClick={() => moveTowards(-1)}
      >
        <GoChevronLeft size={36} color="white" />
      </button>
      <button
        className="top-[50%] -right-5 z-10 translate-[-50%]"
        onClick={() => moveTowards(1)}
      >
        <GoChevronRight size={36} color="white" />
      </button>
      <div ref={trackRef} className="flex h-full w-full justify-around">
        {displaySlides.map((image, i) => (
          <img
            key={`carousel-item-${image}-${i}`}
            src={getAssetUrl(image)}
            alt="Property image of the interior"
            draggable={false}
            onClick={() => openCloseDialog(true)}
            className="h-full min-w-full cursor-zoom-in object-cover object-center"
          />
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          openCloseDialog(false);
        }}
        className="inset-0 h-full max-h-none w-full max-w-none overflow-hidden border-none bg-transparent outline-none backdrop:bg-transparent"
      >
        <AnimatePresence onExitComplete={() => dialogRef.current?.close()}>
          {isDialogOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="relative flex h-full w-full items-center justify-center"
            >
              {/* Custom backdrop */}
              <div
                className="absolute inset-0 bg-black/48 backdrop-blur-[1px]"
                onClick={() => openCloseDialog(false)}
              />

              <motion.div
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                exit={{ scale: 0.985, transition: { duration: 0.15 } }}
                className="relative z-10"
              >
                <img
                  src={getAssetUrl(displaySlides[currentIdx])}
                  alt="Full size view"
                  draggable={false}
                  onClick={() => openCloseDialog(false)}
                  className="max-h-[90dvh] max-w-[90vw] cursor-zoom-out rounded-lg object-contain shadow-2xl"
                />
                <button
                  onClick={() => openCloseDialog(false)}
                  className="absolute top-6 right-6"
                >
                  <GoX size={36} color="white" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </dialog>
    </div>
  );
}
