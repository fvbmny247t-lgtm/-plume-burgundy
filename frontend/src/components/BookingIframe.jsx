import React, { useEffect, useRef } from "react";
import { useLang } from "../context/LanguageContext";
import { SMOOBU } from "../data/content";

// Renders the Smoobu booking iframe inline. Re-initializes when language changes.
const BookingIframe = () => {
  const { lang } = useLang();
  const lastLang = useRef(null);

  useEffect(() => {
    if (lastLang.current === lang) return;
    lastLang.current = lang;

    const target = document.getElementById("apartmentIframeAll");
    if (!target) return;
    target.innerHTML = "";

    const init = () => {
      if (window.BookingToolIframe && typeof window.BookingToolIframe.initialize === "function") {
        const tgt = document.getElementById("apartmentIframeAll");
        if (tgt) tgt.innerHTML = "";
        window.BookingToolIframe.initialize({
          url: SMOOBU.iframeUrl(lang === "en" ? "en" : "fr"),
          baseUrl: SMOOBU.baseUrl,
          target: "#apartmentIframeAll",
        });
      }
    };

    const SCRIPT_ID = "smoobu-bt-script";
    const existing = document.getElementById(SCRIPT_ID);
    if (existing && window.BookingToolIframe) {
      init();
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SMOOBU.scriptUrl;
    script.async = true;
    script.onload = init;
    document.body.appendChild(script);
  }, [lang]);

  return (
    <div
      id="apartmentIframeAll"
      data-testid="smoobu-booking-iframe"
      className="bg-cream min-h-[600px]"
    />
  );
};

export default BookingIframe;
