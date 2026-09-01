import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import Seo from "../components/Seo";
import NotFound from "./NotFound";
import Breadcrumbs from "../components/Breadcrumbs";
import Img from "../components/Img";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const JournalArticle = () => {
  const { slug } = useParams();
  const { lang, t } = useLang();
  const [article, setArticle] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    setNotFound(false);
    setArticle(null);
    axios.get(`${API}/journal/${slug}`).then((r) => setArticle(r.data)).catch(() => setNotFound(true));
    axios.get(`${API}/journal`).then((r) => setRelated(r.data.filter((a) => a.slug !== slug).slice(0, 2))).catch(() => {});
  }, [slug]);

  if (notFound) {
    return <NotFound />;
  }

  if (!article) {
    return (
      <div className="bg-cream pt-40 px-6 min-h-screen" data-testid="journal-article-loading">
        <p className="font-serif italic text-3xl text-ink/50">…</p>
      </div>
    );
  }

  return (
    <div className="bg-cream text-ink" data-testid="journal-article-page">
      <Seo
        title={article.title[lang]}
        description={article.excerpt[lang]}
        image={article.cover}
        path={`/journal/${article.slug}`}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title[lang],
          description: article.excerpt[lang],
          image: article.cover,
          datePublished: article.date,
          author: { "@type": "Organization", name: "Plume Suites Collection" },
          publisher: { "@type": "Organization", name: "Plume Suites Collection" },
        }}
      />
      <article>
        <Breadcrumbs
          className="pt-32 md:pt-40"
          items={[
            { name: t({ fr: "Accueil", en: "Home" }), to: "/" },
            { name: t({ fr: "Journal", en: "Journal" }), to: "/journal" },
            { name: article.title[lang], to: `/journal/${article.slug}` },
          ]}
        />
        <section className="pt-6 md:pt-8 pb-12 px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <Link to="/journal" data-testid="article-back" className="inline-flex items-center gap-2 ps-overline text-ink/60 mb-10">
              <ArrowLeft size={14} /> {t({ fr: "Retour au journal", en: "Back to journal" })}
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <span className="ps-overline text-terracotta">— {article.category[lang]}</span>
              <span className="text-xs font-sans text-ink/60">{article.read_time[lang]}</span>
            </div>
            <h1 className="font-serif italic text-4xl md:text-6xl lg:text-7xl leading-[1] font-light">
              {article.title[lang]}
            </h1>
            <p className="font-sans text-base md:text-lg mt-7 text-ink/80 max-w-2xl leading-relaxed">
              {article.excerpt[lang]}
            </p>
          </div>
        </section>

        <section className="px-6 md:px-12 mb-16 md:mb-24">
          <div className="max-w-6xl mx-auto aspect-[16/9] overflow-hidden">
            <Img src={article.cover} alt={article.title[lang]} priority className="w-full h-full object-cover" />
          </div>
        </section>

        <section className="px-6 md:px-12 pb-24">
          <div className="max-w-3xl mx-auto space-y-6">
            {article.body[lang].map((p, i) => {
              if (typeof p !== "string") return null;
              if (p.startsWith("## ")) {
                return (
                  <h2
                    key={i}
                    className="font-serif italic text-3xl md:text-5xl font-light leading-[1.05] mt-14 mb-2 text-ink"
                  >
                    {p.slice(3)}
                  </h2>
                );
              }
              if (p.startsWith("### ")) {
                return (
                  <h3
                    key={i}
                    className="font-serif italic text-2xl md:text-3xl font-light mt-10 mb-2 text-ink"
                  >
                    {p.slice(4)}
                  </h3>
                );
              }
              // Render bold inline markdown **text**
              const renderInline = (txt) => {
                const parts = txt.split(/(\*\*[^*]+\*\*)/g);
                return parts.map((part, idx) =>
                  /^\*\*[^*]+\*\*$/.test(part) ? (
                    <strong key={idx} className="font-medium text-ink">{part.slice(2, -2)}</strong>
                  ) : (
                    <React.Fragment key={idx}>{part}</React.Fragment>
                  )
                );
              };
              return (
                <p
                  key={i}
                  className={`leading-relaxed ${
                    i === 0
                      ? "font-serif italic text-2xl md:text-3xl text-ink/90"
                      : "font-sans text-base md:text-lg text-ink/85"
                  }`}
                >
                  {renderInline(p)}
                </p>
              );
            })}
          </div>
        </section>
      </article>

      {related.length > 0 && (
        <section className="bg-ink text-cream py-24 px-6 md:px-12" data-testid="article-related">
          <div className="max-w-7xl mx-auto">
            <p className="ps-overline opacity-70 mb-10">{t({ fr: "À lire aussi", en: "Also read" })}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {related.map((a) => (
                <Link key={a.slug} to={`/journal/${a.slug}`} className="group block" data-testid={`related-${a.slug}`}>
                  <div className="aspect-[16/10] overflow-hidden mb-6">
                    <Img src={a.cover} alt={a.title[lang]} className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105" />
                  </div>
                  <span className="ps-overline text-terracotta">{a.category[lang]}</span>
                  <h3 className="font-serif italic text-3xl md:text-4xl mt-3 leading-snug">{a.title[lang]}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default JournalArticle;
