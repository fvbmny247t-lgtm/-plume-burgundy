import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../context/LanguageContext";

// Shared building blocks for Carnet Plume pages — editorial, cream/ink/terracotta.

export const CarnetShell = ({ eyebrow, title, subtitle, children, testid, maxWidth = "max-w-md" }) => (
  <section className="min-h-[80vh] bg-cream text-ink px-6 pt-32 pb-24 flex justify-center" data-testid={testid}>
    <div className={`w-full ${maxWidth}`}>
      <div className="text-center mb-8">
        {eyebrow && <p className="ps-overline text-terracotta mb-3">{eyebrow}</p>}
        <h1 className="font-serif italic font-light text-4xl md:text-5xl leading-tight">{title}</h1>
        {subtitle && <p className="font-sans text-sm text-ink/60 mt-4 leading-relaxed">{subtitle}</p>}
      </div>
      {children}
    </div>
  </section>
);

export const CarnetCard = ({ children, className = "" }) => (
  <div className={`bg-white border border-ink/10 shadow-sm p-8 md:p-10 ${className}`}>{children}</div>
);

export const Field = ({ label, testid, ...props }) => (
  <div className="mb-5">
    <label className="block ps-overline text-ink/60 mb-2">{label}</label>
    <input
      data-testid={testid}
      className="w-full border border-ink/20 bg-cream/40 px-4 py-3 font-sans text-sm outline-none focus:border-terracotta transition-colors"
      {...props}
    />
  </div>
);

export const SubmitButton = ({ loading, children, testid, disabled }) => (
  <button
    type="submit"
    disabled={loading || disabled}
    data-testid={testid}
    className="w-full bg-ink text-cream py-4 font-sans text-sm uppercase tracking-[0.2em] hover:bg-terracotta transition-colors disabled:opacity-60"
  >
    {loading ? "…" : children}
  </button>
);

export const ErrorNote = ({ children, testid }) =>
  children ? (
    <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-6" data-testid={testid}>
      {children}
    </p>
  ) : null;

export const SuccessNote = ({ children, testid }) =>
  children ? (
    <p className="text-sm text-green-800 bg-green-50 border border-green-200 px-4 py-3 mb-6" data-testid={testid}>
      {children}
    </p>
  ) : null;

export const CarnetFootLink = ({ to, prompt, action, testid }) => {
  const { t } = useLang();
  return (
    <p className="text-center text-sm text-ink/60 mt-6">
      {t(prompt)}{" "}
      <Link to={to} data-testid={testid} className="text-terracotta hover:underline underline-offset-4">
        {t(action)}
      </Link>
    </p>
  );
};
