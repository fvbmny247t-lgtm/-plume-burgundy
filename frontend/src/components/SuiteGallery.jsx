import React, { useEffect, useRef, useState } from "react";

const SuiteGallery = ({ images, slug }) => {
  const ref = useRef(null);
  const [paused, setPaused] = useState(false);
  const isDown = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  // Auto-advance
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = setInterval(() => {
      if (paused || !el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 1.2, behavior: "auto" });
      }
    }, 25);
    return () => clearInterval(id);
  }, [paused]);

  // Drag-to-scroll
  const onDown = (e) => {
    isDown.current = true;
    const x = e.touches ? e.touches[0].pageX : e.pageX;
    startX.current = x - ref.current.offsetLeft;
    startScroll.current = ref.current.scrollLeft;
    setPaused(true);
  };
  const onMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault?.();
    const x = e.touches ? e.touches[0].pageX : e.pageX;
    const walk = (x - ref.current.offsetLeft) - startX.current;
    ref.current.scrollLeft = startScroll.current - walk;
  };
  const onUp = () => { isDown.current = false; };

  return (
    <section className="bg-cream py-8" data-testid={`suite-gallery-${slug}`}>
      <div
        ref={ref}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={() => { onUp(); setPaused(false); }}
        onMouseEnter={() => setPaused(true)}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={() => { onUp(); setPaused(false); }}
        className="flex gap-3 overflow-x-auto scrollbar-hide select-none cursor-grab active:cursor-grabbing snap-x snap-mandatory px-3"
        style={{ scrollBehavior: "auto", WebkitOverflowScrolling: "touch" }}
      >
        {images.map((g, idx) => (
          <div
            key={idx}
            className="snap-start shrink-0 w-[80vw] md:w-[48vw] lg:w-[34vw] aspect-[4/5] overflow-hidden"
          >
            <img
              src={g}
              alt=""
              draggable={false}
              className="w-full h-full object-cover pointer-events-none"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </section>
  );
};

export default SuiteGallery;
