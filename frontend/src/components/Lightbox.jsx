import React, { useEffect, useRef, useState } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import Img from "./Img";

// Fullscreen image viewer with prev/next, keyboard + swipe support.
const Lightbox = ({ images = [], index = 0, onClose, onChange }) => {
  const touchX = useRef(null);
  const open = index !== null && index >= 0;

  const go = (delta) => {
    if (!images.length) return;
    const next = (index + delta + images.length) % images.length;
    onChange && onChange(next);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose && onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, index, images.length]);

  if (!open) return null;

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-sm flex items-center justify-center select-none"
      data-testid="lightbox"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose && onClose(); }}
        aria-label="Fermer"
        data-testid="lightbox-close"
        className="absolute top-5 right-5 md:top-7 md:right-7 text-cream/80 hover:text-cream transition-colors z-10"
      >
        <X size={28} strokeWidth={1.4} />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            aria-label="Précédent"
            data-testid="lightbox-prev"
            className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 border border-cream/40 text-cream/90 hover:bg-cream hover:text-ink transition-colors flex items-center justify-center z-10"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); go(1); }}
            aria-label="Suivant"
            data-testid="lightbox-next"
            className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 border border-cream/40 text-cream/90 hover:bg-cream hover:text-ink transition-colors flex items-center justify-center z-10"
          >
            <ArrowRight size={20} />
          </button>
        </>
      )}

      <Img
        key={index}
        src={images[index]}
        alt=""
        priority
        draggable={false}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] max-w-[92vw] object-contain fade-in shadow-2xl"
      />

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-cream/70 ps-overline">
        {index + 1} / {images.length}
      </div>
    </div>
  );
};

export default Lightbox;
