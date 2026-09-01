import React from "react";

// Returns the .webp sibling for locally-optimized assets (/images or /media).
const toWebp = (src) => {
  if (!src || typeof src !== "string") return null;
  if (!/^\/(images|media)\//.test(src)) return null;
  if (/\.svg$/i.test(src)) return null;
  if (!/\.(jpe?g|png)$/i.test(src)) return null;
  return src.replace(/\.(jpe?g|png)$/i, ".webp");
};

// Drop-in <img> replacement that serves WebP with a JPEG/PNG fallback.
// Uses display:contents on <picture> so layout stays identical to a bare <img>.
export const Img = ({ src, alt = "", priority = false, loading, ...rest }) => {
  const webp = toWebp(src);
  const img = (
    <img
      src={src}
      alt={alt}
      loading={loading || (priority ? "eager" : "lazy")}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      {...rest}
    />
  );
  if (!webp) return img;
  return (
    <picture className="contents">
      <source srcSet={webp} type="image/webp" />
      {img}
    </picture>
  );
};

export default Img;
