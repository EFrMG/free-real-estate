import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoChevronLeft, GoChevronRight, GoX } from "react-icons/go";

export default function PropertyGallery({
  interiorGallery,
}: {
  interiorGallery: string[];
}) {
  const [currentIdx, setCurrentIdx] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
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

  const openCloseDialog = (open: boolean) => {
    if (open) {
      setIsDialogOpen(true);
      dialogRef.current?.showModal();
    } else {
      setIsDialogOpen(false);
      // Wait for complete motion exit
    }
  };

  return (
    <div
      className="relative w-full h-[35vh] mt-8 shadow-lg rounded-lg overflow-hidden
      [&_button]:absolute [&_button]:bg-amber-300/36 [&_button]:rounded-full
      [&_button]:p-3 [&_button]:backdrop-blur-sm [&_button]:hover:bg-amber-200/36
      [&_button]:transition-colors [&_button]:duration-150 [&_button]:shadow-md"
    >
      <button
        className="top-[50%] left-10 translate-[-50%] z-10"
        onClick={() => moveTowards(-1)}
      >
        <GoChevronLeft size={36} color="white" />
      </button>
      <button
        className="top-[50%] -right-5 translate-[-50%] z-10"
        onClick={() => moveTowards(1)}
      >
        <GoChevronRight size={36} color="white" />
      </button>
      <div ref={trackRef} className="flex justify-around h-full w-full">
        {displaySlides.map((image, i) => (
          <img
            key={`carousel-item-${image}-${i}`}
            src={image}
            alt="Property image of the interior"
            draggable={false}
            onClick={() => openCloseDialog(true)}
            className="h-full min-w-full object-center object-cover cursor-zoom-in"
          />
        ))}
      </div>

      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          openCloseDialog(false);
        }}
        className="inset-0 w-full h-full max-w-none max-h-none
        backdrop:bg-black/42 backdrop:backdrop-blur-xs bg-transparent 
        overflow-hidden border-none outline-none"
      >
        <AnimatePresence onExitComplete={() => dialogRef.current?.close()}>
          {isDialogOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
              transition={{ duration: 0.31 }}
              className="flex items-center justify-center w-full h-full relative"
            >
              <div className="relative">
                <img
                  src={displaySlides[currentIdx]}
                  alt="Full size view"
                  draggable={false}
                  onClick={() => openCloseDialog(false)}
                  className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg cursor-zoom-out shadow-2xl"
                />
                <button
                  onClick={() => openCloseDialog(false)}
                  className="absolute top-6 right-6"
                >
                  <GoX size={36} color="white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </dialog>
    </div>
  );
}
