import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useLang } from "../context/LanguageContext";

// Elegant, on-brand FAQ accordion. Pairs with FAQPage JSON-LD for SEO/AEO.
export const Faq = ({ items, title }) => {
  const { t } = useLang();
  const [open, setOpen] = useState(0);

  return (
    <section className="bg-cream text-ink px-6 md:px-12 pb-28 md:pb-32" data-testid="faq-section">
      <div className="max-w-4xl mx-auto">
        <p className="ps-overline text-ink/60 mb-4">FAQ</p>
        <h2 className="font-serif italic text-4xl md:text-6xl font-light leading-[1.05] mb-12">
          {title || t({ fr: "Questions fréquentes", en: "Frequently asked questions" })}
        </h2>
        <div className="border-t border-ink/15">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="border-b border-ink/15" data-testid={`faq-item-${i}`}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  data-testid={`faq-question-${i}`}
                  className="w-full flex items-center justify-between gap-6 text-left py-6 group"
                >
                  <span className="font-serif italic text-xl md:text-2xl font-light group-hover:text-terracotta transition-colors">
                    {t(f.q)}
                  </span>
                  <span className="shrink-0 text-terracotta">
                    {isOpen ? <Minus size={20} strokeWidth={1.5} /> : <Plus size={20} strokeWidth={1.5} />}
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-500 ease-out ${isOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="font-sans text-base md:text-lg text-ink/80 leading-relaxed pb-7 pr-10" data-testid={`faq-answer-${i}`}>
                    {t(f.a)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
