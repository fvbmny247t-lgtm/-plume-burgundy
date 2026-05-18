import React from "react";

const LOGO_WHITE = "https://customer-assets.emergentagent.com/job_plume-burgundy-edit/artifacts/azsbsaor_Logo%20site%20plume.svg";
const LOGO_DARK = "https://customer-assets.emergentagent.com/job_plume-burgundy-edit/artifacts/2le9q18k_Logo%20plume%20Marron%20site%20sans%20fond.svg";

const PlumeLogo = ({ variant = "white", className = "", size = "md" }) => {
  const sizes = {
    sm: "h-9 md:h-10",
    md: "h-12 md:h-14",
    lg: "h-16 md:h-20",
  };
  const src = variant === "dark" ? LOGO_DARK : LOGO_WHITE;
  return (
    <img
      src={src}
      alt="Plume Suites"
      data-testid="plume-logo"
      className={`${sizes[size] || sizes.md} w-auto block select-none ${className}`}
      draggable={false}
    />
  );
};

export default PlumeLogo;
