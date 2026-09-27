# Plume Suites Collection — PRD

## Problem statement
Boutique hotel website for Plume Suites (Bourgogne, France + Costa del Sol 2027). Editorial magazine style inspired by Sabor Del Mar webflow template. Bilingual FR/EN, mobile responsive. Two suites: "Plume Suites — Douceur" and "Plume Suites — L'Envolée". Smoobu booking link + contact form.

## Architecture
- Frontend: React 19 + Tailwind CSS, React Router 7, self-hosted fonts (Cormorant Garamond + Outfit, font-display:swap)
- Backend: FastAPI + MongoDB (Motor), endpoints under /api
- i18n: React Context (FR/EN), persisted in localStorage
- Colors: #f5f1ea (cream), #3b312b (ink), #b9785d (terracotta)

## Implemented (Feb 2026)
- Home: hero fullscreen, editorial intro, suites slider (2 suites), Art de vivre bento grid (4 blocks), quote section terracotta, location Bourgogne, Costa del Sol future, journal preview, footer with distances
- /sejours: editorial list of both suites
- /sejours/:slug: full suite page (hero, intro, overlay terracotta, editorial, gallery, experience dark, details, CTA Réserver)
- /art-de-vivre: alternating editorial blocks
- /journal: card grid pulled from /api/journal
- /journal/:slug: article body from /api/journal/{slug}
- /contact: form posting to /api/contact (MongoDB), success/error states
- Navbar: transparent → #3b312b on scroll, FR/EN switcher, Réserver button (Smoobu placeholder), mobile burger menu
- Footer: distances (Dijon, Beaune, Marsannay, canal, TGV, airport), bilingual nav
- Backend: GET /api/journal, GET /api/journal/{slug}, POST/GET /api/contact

## Tests
- Backend pytest 6/6 ✅
- Frontend Playwright 13/13 ✅ (iteration_1.json)

## Update (Juillet 2025) — Univers art de vivre
- Home: nouvelle section Restaurant "Ô P'tit Repère du Goût" (identité réelle, chef Michaël Felmann, citation « Un bon produit n'a rien à cacher, juste à être partagé », CTA → optitreperedugout.fr)
- Home + /reserver: section "Prolonger l'expérience" (3 expériences 49/79/89€, fiche détaillée "Ce que comprend l'expérience" en modal + bouton Réserver → /reserver)
- Carrousels suites: flèches visibles + clic → Lightbox plein écran (prev/next/clavier/swipe)
- Suites: L'Envolée gallery [7,8,11,10,9] + lit King ; Douceur (lit principal + 2 lits séparés, photo bouteille retirée, +photos 3/4)
- Cartes postales anciennes Fleurey-sur-Ouche intégrées (section Localisation)
- Mot "hôtel/hotel" supprimé partout (texte + JSON-LD: LodgingBusiness/Accommodation)
- Menu mobile: hamburger animé → croix, ouverture/fermeture fluides
- FR/EN complet sur toutes les nouvelles sections + parité mobile vérifiée
- EN ATTENTE: PHOTO_3, PHOTO_4 (Douceur), PHOTO_12, PHOTO_13 (plats resto) — placeholders temporaires (keys content.js: douceurPhoto3/4, plat1/2)

## Update (Juin 2026) — Performance / PageSpeed / Google Search Console
Objectif: scores Lighthouse verts SANS modifier le design. Testé frontend 100% (iteration_5.json), toutes les pages + interactions OK, aucune régression visuelle.
- Vidéo hero: compressée 72 Mo → 2,8 Mo (H.264 1280p, faststart, sans audio) + `preload="metadata"` + poster
- Images: toutes les photos locales converties en WebP + JPEG réoptimisés (max 1920px, qualité 82). Scripts: /app/scripts/optimize_images.py
- Nouveau composant responsive `src/components/Img.jsx`: `<picture display:contents><source webp/><img jpeg fallback/></picture>`, lazy-loading par défaut, `priority` (eager + fetchPriority=high) sur les images LCP (héros suites/art-de-vivre/lightbox). Remplace tous les `<img>` du site.
- Polices auto-hébergées: /public/fonts/*.woff2 (latin + latin-ext) + /public/fonts.css (font-display:swap), lien + preload dans index.html. Suppression des requêtes Google Fonts bloquantes + police Inter inutilisée. Script: /app/scripts/localize_fonts.py
- ABANDONNÉ: code-splitting React.lazy (cassait toutes les routes non-home → écran blanc Suspense). App.js repassé en imports directs.

## Update (Juin 2026) — Partage social + Espace admin
- Image de partage (Open Graph): /public/og-image.jpg (1200x630) = vrai logo Plume Suites (détouré, PLUME crème + SUITES terracotta) sur photo vignoble Bourgogne. Balises OG/Twitter écrites EN DUR dans public/index.html (lues par les robots WhatsApp/Instagram/Facebook qui n'exécutent pas le JS) + SITE.defaultImage → og-image.jpg. Scripts: /app/scripts/make_og.py
- Hero vidéo: le poster = PREMIÈRE IMAGE de la vidéo elle-même (/media/hero_poster.jpg extraite via ffmpeg) → image figée puis lecture au chargement, transition invisible (remplace l'ancienne photo Unsplash qui ne correspondait pas).
- Widget Smoobu (/reserver): conteneur passé de bg-cream à bg-white → plus de délimitation visible quand le calendrier n'est pas ouvert (BookingIframe.jsx).
- ESPACE ADMIN PRIVÉ (JWT, compte unique): /admin/login + /admin (hors du Layout marketing). Backend server.py: bcrypt + PyJWT HS256 (12h), seed_admin idempotent (ADMIN_EMAIL/ADMIN_PASSWORD), routes POST /api/admin/login, GET /api/admin/me, GET /api/admin/messages (protégé), PATCH /api/admin/messages/{id} (statut lu/non-lu), GET /api/contact protégé. Frontend: token Bearer en localStorage, recherche (nom/email/sujet/message), badge « non lus », bouton Marquer comme lu/non lu. Collection Mongo `admins` (+ champ `read` sur contact_messages). Identifiants: /app/memory/test_credentials.md. Testé 100% (iteration_6.json) + PATCH validé au curl.
- Logo: TOUJOURS privilégier le vrai logo Plume Suites (SVG existants via composant PlumeLogo + PNG détouré pour l'OG). Pages admin mises à jour pour utiliser PlumeLogo.
- Smoobu allemand: l'URL passe bien /fr/ ; l'affichage allemand vient du réglage de langue du COMPTE Smoobu / locale navigateur (à régler côté compte Smoobu), pas du code.

## Update (Juin 2026) — Audit & optimisation SEO / AEO (moteurs IA)
Objectif: maximiser la visibilité sur Google ET les moteurs IA (ChatGPT, Perplexity, Google AI Overviews). Aucun changement visuel.
- Données structurées riches en HTML STATIQUE (public/index.html): @graph JSON-LD = Organization + LodgingBusiness/BedAndBreakfast (NAP complet 8 Rue des Vieilles Carrières 21410 Fleurey-sur-Ouche, géo 47.2942/4.8675, tél +33695488760, email, équipements, Instagram) + Restaurant (Ô P'tit Repère du Goût) + WebSite. Validé (json.loads OK).
- /public/llms.txt créé (fiche factuelle pour moteurs IA).
- /public/robots.txt: accueille explicitement GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended, Applebot-Extended, Bingbot + sitemap.
- Balises géo dans index.html (geo.region FR-21, geo.position, ICBM, author).
- Home.jsx lodgingLd enrichi (vraie adresse, @id #lodging, tél, email, sameAs) → fusionne avec le graphe statique.
- Constat: le site déployé est rendu en HTML complet (bon pour crawlers + IA).
- RESTE À FAIRE (recommandé): section FAQ visible + FAQPage schema (top AEO), Google Business Profile (action côté client), schéma HotelRoom+prix par suite, backlinks/annuaires, hreflang (nécessiterait des URL /en séparées).

### Update — Schéma suites + FAQ (Juin 2026)
- FAQ élégante (accordéon) sur /contact + balisage FAQPage JSON-LD (7 Q/R bilingues FR/EN) — composant components/Faq.jsx, données FAQ dans content.js. Testé 100% (iteration_7.json).
- Schéma HotelRoom par suite (SuiteDetail.jsx): occupancy, bed, floorSize (m²), amenityFeature (depuis details), containedInPlace #lodging. Prix (offers) prêt côté code via suite.priceFrom mais EN ATTENTE des tarifs fournis par le client.
- Google Business Profile: déjà existant côté client (pas d'action).
- Correctif: FAQ capacité alignée sur les données réelles (L'Envolée 2 pers., Douceur jusqu'à 4).

## Backlog (P1/P2)
- Replace Smoobu placeholder URL with real booking widget (channel manager)
- Replace Unsplash placeholders with user's real photos (the local Mac paths were inaccessible)
- Optionally connect Resend for contact email notifications
- Real Plume Suites SVG logo file (currently rendered as styled wordmark)
- Costa del Sol page when address opens (2027)
