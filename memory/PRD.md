# Plume Suites Collection — PRD

## Problem statement
Boutique hotel website for Plume Suites (Bourgogne, France + Costa del Sol 2027). Editorial magazine style inspired by Sabor Del Mar webflow template. Bilingual FR/EN, mobile responsive. Two suites: "Plume Suites — Douceur" and "Plume Suites — L'Envolée". Smoobu booking link + contact form.

## Architecture
- Frontend: React 19 + Tailwind CSS, React Router 7, Google Fonts (Cormorant Garamond + Outfit)
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

## Backlog (P1/P2)
- Replace Smoobu placeholder URL with real booking widget (channel manager)
- Replace Unsplash placeholders with user's real photos (the local Mac paths were inaccessible)
- Optionally connect Resend for contact email notifications
- Admin panel for journal articles + view contact submissions (currently public GET — lock down)
- Real Plume Suites SVG logo file (currently rendered as styled wordmark)
- Open Graph / SEO meta tags + sitemap
- Costa del Sol page when address opens (2027)
