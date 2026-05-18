import React from "react";

// Pure-CSS wordmark logo — elegant serif. Color inherits from current color.
const PlumeLogo = ({ className = "", small = false }) => {
  return (
    <span className={`inline-flex flex-col leading-none select-none ${className}`} data-testid="plume-logo">
      <span
        className={`font-serif italic ${small ? "text-xl" : "text-2xl md:text-3xl"} tracking-wide`}
        style={{ fontWeight: 500 }}
      >
        Plume
      </span>
      <span
        className={`font-sans uppercase ${small ? "text-[8px]" : "text-[9px] md:text-[10px]"} tracking-[0.55em] mt-1 opacity-90`}
      >
        Suites
      </span>
    </span>
  );
};

export default PlumeLogo;
