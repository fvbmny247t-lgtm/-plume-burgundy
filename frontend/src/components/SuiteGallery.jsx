import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";
import Lightbox from "./Lightbox";

const SuiteGallery = ({ images, slug }) => {
  const ref = useRef(null);
  const [lb, setLb] = useState(null);
  const pausedRef = useRef(false);
  const lastInteract = useRef(0);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });

  // Index of the slide currently closest to the left edge
  const currentIndex = useCallback(() => {
    const el = ref.current;
    if (!el) return 0;
    const items = Array.from(el.querySelectorAll("[data-slide]"));
    let best = 0;
    let min = Infinity;
    items.forEach((it, i) => {
      const d = Math.abs(it.offsetLeft - el.scrollLeft);
      if (d < min) { min = d; best = i; }
    });
    return best;
  }, []);

  const goTo = useCallback((i) => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll("[data-slide]");
    if (!items.length) return;
    const idx = Math.max(0, Math.min(i, items.length - 1));
    el.scrollTo({ left: items[idx].offsetLeft, behavior: "smooth" });
  }, []);

  const go = useCallback((dir) => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll("[data-slide]");
    const cur = currentIndex();
    let next = cur + dir;
    if (next < 0) next = items.length - 1;
    if (next > items.length - 1) next = 0;
    goTo(next);
  }, [currentIndex, goTo]);

  // Manual navigation (arrows) — pauses auto-advance briefly so it stays responsive
  const nav = useCallback((dir) => {
    lastInteract.current = Date.now();
    go(dir);
  }, [go]);

  // Gentle auto-advance — only when idle (no recent interaction), not hovered/dragged
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current || lb !== null) return;
      if (Date.now() - lastInteract.current < 5000) return;
      go(1);
    }, 2000);
    return () => clearInterval(id);
  }, [go, lb]);

  // Drag / swipe to scroll. Distinguish a click from a drag via movement threshold.
  const onDown = (e) => {
    const el = ref.current;
    pausedRef.current = true;
    lastInteract.current = Date.now();
    drag.current = {
      active: true,
      moved: false,
      startX: e.touches ? e.touches[0].pageX : e.pageX,
      startScroll: el.scrollLeft,
    };
    el.style.scrollBehavior = "auto";
  };
  const onMove = (e) => {
    if (!drag.current.active) return;
    const x = e.touches ? e.touches[0].pageX : e.pageX;
    const walk = x - drag.current.startX;
    if (Math.abs(walk) > 6) drag.current.moved = true;
    ref.current.scrollLeft = drag.current.startScroll - walk;
  };
  const onUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const el = ref.current;
    el.style.scrollBehavior = "smooth";
    // Snap to the nearest slide for a clean finish
    goTo(currentIndex());
  };

  return (
    <section className="bg-cream py-8 relative" data-testid={`suite-gallery-${slug}`}>
      <div
        ref={ref}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={() => { onUp(); pausedRef.current = false; }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={() => { onUp(); pausedRef.current = false; }}
        className="flex gap-3 overflow-x-auto scrollbar-hide select-none cursor-grab active:cursor-grabbing snap-x snap-mandatory px-3 md:px-6"
        style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
      >
        {images.map((g, idx) => (
          <div
            key={idx}
            data-slide
            className="snap-start shrink-0 w-[82vw] md:w-[46vw] lg:w-[33vw] aspect-[4/5] overflow-hidden relative group"
          >
            <img
              src={g}
              alt=""
              draggable={false}
              onClick={() => { if (!drag.current.moved) setLb(idx); }}
              className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <span className="absolute bottom-4 right-4 w-9 h-9 bg-ink/45 text-cream flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Expand size={15} />
            </span>
          </div>
        ))}
      </div>

      {/* Visible navigation arrows */}
      <button
        type="button"
        onClick={() => nav(-1)}
        aria-label="Précédent"
        data-testid={`gallery-prev-${slug}`}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-cream/95 border border-ink/20 text-ink hover:bg-ink hover:text-cream transition-colors flex items-center justify-center shadow-md z-10"
      >
        <ArrowLeft size={18} />
      </button>
      <button
        type="button"
        onClick={() => nav(1)}
        aria-label="Suivant"
        data-testid={`gallery-next-${slug}`}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 bg-cream/95 border border-ink/20 text-ink hover:bg-ink hover:text-cream transition-colors flex items-center justify-center shadow-md z-10"
      >
        <ArrowRight size={18} />
      </button>

      <Lightbox images={images} index={lb} onClose={() => setLb(null)} onChange={setLb} />
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </section>
  );
};

export default SuiteGallery;
