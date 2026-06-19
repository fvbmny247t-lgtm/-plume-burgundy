import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";
import Lightbox from "./Lightbox";

const SuiteGallery = ({ images, slug }) => {
  const ref = useRef(null);
  const [paused, setPaused] = useState(false);
  const [lb, setLb] = useState(null);
  const isDown = useRef(false);
  const moved = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  // Auto-advance (gentle) — paused on hover / drag / lightbox open
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = setInterval(() => {
      if (paused || lb !== null || !el) return;
      const max = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= max - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 1.1, behavior: "auto" });
      }
    }, 25);
    return () => clearInterval(id);
  }, [paused, lb]);

  const scrollByCard = (dir) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("[data-gallery-item]");
    const step = card ? card.getBoundingClientRect().width + 12 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // Drag-to-scroll (mouse + touch). Distinguish click from drag.
  const onDown = (e) => {
    isDown.current = true;
    moved.current = false;
    const x = e.touches ? e.touches[0].pageX : e.pageX;
    startX.current = x - ref.current.offsetLeft;
    startScroll.current = ref.current.scrollLeft;
    setPaused(true);
  };
  const onMove = (e) => {
    if (!isDown.current) return;
    const x = e.touches ? e.touches[0].pageX : e.pageX;
    const walk = (x - ref.current.offsetLeft) - startX.current;
    if (Math.abs(walk) > 6) moved.current = true;
    ref.current.scrollLeft = startScroll.current - walk;
  };
  const onUp = () => { isDown.current = false; };

  return (
    <section className="bg-cream py-8 relative group/gallery" data-testid={`suite-gallery-${slug}`}>
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
            data-gallery-item
            className="snap-start shrink-0 w-[80vw] md:w-[48vw] lg:w-[34vw] aspect-[4/5] overflow-hidden relative"
          >
            <img
              src={g}
              alt=""
              draggable={false}
              onClick={() => { if (!moved.current) setLb(idx); }}
              className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700 hover:scale-[1.03]"
              loading="lazy"
            />
            <span className="absolute bottom-4 right-4 w-9 h-9 bg-ink/45 text-cream flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              <Expand size={15} />
            </span>
          </div>
        ))}
      </div>

      {/* Visible navigation arrows */}
      <button
        onClick={() => scrollByCard(-1)}
        aria-label="Précédent"
        data-testid={`gallery-prev-${slug}`}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-cream/90 border border-ink/20 text-ink hover:bg-ink hover:text-cream transition-colors flex items-center justify-center shadow-md z-10"
      >
        <ArrowLeft size={18} />
      </button>
      <button
        onClick={() => scrollByCard(1)}
        aria-label="Suivant"
        data-testid={`gallery-next-${slug}`}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-cream/90 border border-ink/20 text-ink hover:bg-ink hover:text-cream transition-colors flex items-center justify-center shadow-md z-10"
      >
        <ArrowRight size={18} />
      </button>

      <Lightbox images={images} index={lb} onClose={() => setLb(null)} onChange={setLb} />
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </section>
  );
};

export default SuiteGallery;
