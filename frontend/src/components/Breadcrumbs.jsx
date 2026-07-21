import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SITE } from "../data/content";

// Visible breadcrumb + JSON-LD BreadcrumbList. items: [{ name, to }], last = current page.
const Breadcrumbs = ({ items = [], className = "" }) => {
  if (!items.length) return null;
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.to}`,
    })),
  };
  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(ld)}</script>
      </Helmet>
      <nav
        aria-label="Fil d'Ariane"
        data-testid="breadcrumbs"
        className={`max-w-7xl mx-auto px-6 md:px-12 ${className}`}
      >
        <ol className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-sans text-ink/45">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-ink/25" aria-hidden="true">/</span>}
              {i < items.length - 1 ? (
                <Link to={it.to} className="hover:text-terracotta transition-colors">{it.name}</Link>
              ) : (
                <span className="text-ink/70">{it.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
