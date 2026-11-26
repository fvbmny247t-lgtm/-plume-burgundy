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

### Update — Prix suites + FAQ enrichie (Juin 2026)
- Prix ajoutés dans SUITES (content.js): envolee priceFrom 130 €, douceur priceFrom 110 € → schéma HotelRoom inclut désormais offers (Offer/UnitPriceSpecification, EUR, /nuit).
- FAQ enrichie (5 nouvelles Q/R, faits fournis par le client): horaires (arrivée 15h / départ 11h), arrivée autonome (self check-in), parking gratuit dans la rue/à proximité, animaux acceptés sur demande, accès (Dijon ~15 min, gare Dijon-Ville). FAQPage JSON-LD auto-généré depuis content.js.

### Update — FAQ (sans tirets) + SEO blog (Juin 2026)
- RÈGLE CLIENT: ne jamais utiliser de tiret cadratin « — » dans la FAQ. Toutes les réponses/questions + le libellé eyebrow nettoyés (Faq.jsx, content.js). Vérifié iteration_8.json (100%).
- FAQ enrichie: Comment venir (circuit Dijon-Prenois ~10 min, axe autoroutier vers Paris, gare Dijon-Ville ~15 min), équipements (climatisation + chauffage, linge fourni, ménage avant chaque arrivée seulement), parking gratuit, horaires 15h/11h, arrivée autonome, animaux sur demande. 15 entrées FAQ au total (ajout: séjour minimum=aucun, petit-déjeuner=non mais boulangerie à proximité, bons cadeaux=oui). Corrections copie: point après 'page Réserver', 'la France à l'Espagne'.
- Prix suites: envolee 130 €, douceur 110 € (priceFrom) -> offers dans HotelRoom.
- SEO blog: JournalArticle jsonLd passé de Article à BlogPosting complet (image URL absolue, datePublished/dateModified, mainEntityOfPage, author/publisher 'Plume Suites' + logo).
- DIAGNOSTIC indexation Google: pages secondaires rendues avec title/meta/contenu UNIQUES en prod (vérifié via crawl) -> indexables. Le fait que seule l'accueil ressorte = site récent + à soumettre dans Search Console (actions client: GSC sitemap + demande d'indexation, backlinks fiche Google/Instagram/annuaires). Non codable.

## Update (Juin 2026) — Carnet Plume PHASE 1 (comptes clients + La Lettre de Marie)
Spec complète: /app/memory/CARNET_PLUME_SPEC.md (37 points). Construction multi-phases. Phase 1 livrée et testée (iteration_12.json: backend 20/20, frontend 100%).
- Email: MIGRATION Resend -> Infomaniak SMTP. Nouveau `backend/email_provider.py` (abstraction send_email(to,subject,html,reply_to)), `email_service.py` réécrit dessus (contact + emails Carnet). Variables backend/.env: SMTP_HOST/PORT/USER/PASSWORD, FROM_EMAIL, FROM_NAME="Marie, Plume Suites", REPLY_TO, PUBLIC_BASE_URL. NOTE: SMTP_PASSWORD VIDE tant que le client n'a pas fourni le mot de passe d'application Infomaniak -> emails non envoyés (échec silencieux journalisé), flux fonctionnels via tokens en base.
- Backend `carnet.py` (router /api/carnet, monté dans api_router). Collection `carnet_users` (role "user", DISTINCTE de `admins`), + carnet_email_tokens / carnet_reset_tokens / carnet_login_attempts / carnet_newsletter. JWT Bearer role "user" (7j), séparation stricte admin/client (cross-auth -> 401). bcrypt. Brute-force login (5 tentatives/15 min, identifiant basé X-Forwarded-For). Index uniques sur startup.
- Endpoints: register, login, me, logout, verify-email, resend-verification, forgot-password, reset-password, change-password, change-email, verify-email-change, PATCH /profile, DELETE /account ; newsletter/subscribe (double opt-in), newsletter/confirm, newsletter/unsubscribe (consentement historisé: opt_in_at, confirmed_at, source, text_version, unsubscribe_token).
- 5 emails Carnet brandés (shell existant): vérif email, bienvenue Carnet, reset mdp, confirmation changement mdp, confirmation Lettre (double opt-in). Ton "Marie", pas de tiret cadratin dans le corps.
- Frontend: `context/CarnetAuthContext.jsx` (token localStorage "plume_carnet_token"), `components/carnet/carnetUi.jsx`, pages sous `pages/carnet/`: CarnetLogin, CarnetRegister, CarnetForgot, CarnetReset, CarnetVerify (verify + change-email), Carnet (dashboard protégé), CarnetAccount (compte), NewsletterAction (confirmer/désinscription). Routes dans App.js (dans le Layout marketing). Provider CarnetAuthProvider autour du Router.
- Navbar: icône "Mon Carnet" desktop (nav-carnet) + lien mobile (mobile-carnet-link). NAV.carnet ajouté dans content.js.
- CORRECTIF menu mobile: la barre du haut passait en ink instantanément alors que l'overlay glissait en 500ms -> ajout transition-colors duration-500 sur la barre pour synchroniser l'apparition.
- Vocabulaire respecté: "Carnet", "Plumes", "attentions", "La Lettre de Marie" (jamais points/cashback/VIP/fidélité).
- Bonus 100 Plumes (à la confirmation de la Lettre) et ledger: DÉFÉRÉ (hook TODO dans newsletter_confirm) -> Phases ultérieures.

## Update (Juin 2026) — Carnet Plume PHASES 2-4 + Bonus 100 (Smoobu + Plumes) — TESTÉ (iteration_13: 18/18 backend, dashboard OK)
- E-mails RÉELS actifs: SMTP_PASSWORD Infomaniak fourni et validé (envoi confirmé). Contact + Carnet passent par Infomaniak SMTP.
- Smoobu HMAC LIVE: `smoobu_client.py` — signature HMAC-SHA256 (X-API-Key/X-Timestamp/X-Nonce/X-Signature), canonical `METHOD\nPATH\nQUERY\nTS\nNONCE\nBODY_SHA256\nAPI_KEY`. Validé en réel (GET /apartments 200). Logements: Douceur (2026163), L'envolée (2026160).
- `smoobu_sync.py`: sync réservations (339 importées), classification canaux éditable (`smoobu_channels`): Direct booking (3040403) + Website (3040406) = DIRECT éligible; Booking.com/Expedia/Airbnb = OTA; Blocked = ignoré. Rattachement par email vérifié. Plumes = floor(price - city_tax) pour DIRECT éligible; taxe séjour (`city-tax`) exclue. "À venir" (pending) puis "crédité" au check-out (`credit_due_stays`). Règle anti-rétroactif: séjour déjà terminé AVANT création du compte non crédité auto. `plumes_ledger` (idempotent), balances sur `carnet_users` (plumes_balance/plumes_pending).
- Bonus +100 Plumes UNE fois à la confirmation de La Lettre (idempotency_key `newsletter_bonus:<user_id>`).
- Endpoints admin (JWT admin): POST /api/admin/smoobu/sync, GET /api/admin/smoobu/state, GET /api/admin/smoobu/apartments, GET/PATCH /api/admin/smoobu/channels/{id}. Endpoint client: GET /api/carnet/stays.
- Cron quotidien `.emergent/crons.yml` (smoobu-reconcile, 03:15 UTC) -> POST /api/cron/smoobu-reconcile (Bearer WEBHOOK_CRON_SECRET, ack immédiat + BackgroundTasks: re-sync incrémental + crédit des séjours passés).
- Frontend dashboard `/carnet`: solde réel, "Plumes à venir", "Mes séjours" (badge Direct/OTA, statut, Plumes), prochain séjour. Vocabulaire respecté.

## RESTE À FAIRE — Carnet Plume (ordre spec §36)
- [FAIT] Phase 1 Auth & comptes ; Phase 2 Smoobu HMAC ; Phase 3 Sync ; Phase 4 Rattachement + direct/OTA + Ledger ; Bonus 100 Plumes.
- P0 Phase 5: Interface Carnet enrichie (progression vers prochaine attention, prochaine attention affichée).
- P1 Phase 6: Système d'attentions (modèle + statuts + seuils 300/600/1000/1500/2000) + Administration Carnet (fiche client, +/- Plumes avec motif, rattachement manuel, audit, tableau de bord, export CSV abonnés, bouton "Synchroniser maintenant" + édition table canaux dans l'UI admin).
- P1 Phase 7: Éditeur d'e-mails par blocs + automatisations (emails 6/7/8: 100 premières Plumes, nouvelles Plumes après séjour, nouvelle attention). Journal d'envois.
- Webhooks Smoobu temps réel (aujourd'hui: pull + cron quotidien). NB: pas de signature webhook documentée -> re-fetch par ID + idempotence.

## Update (Nov 2026) — Cartes cadeaux (coffrets) + correctif menu + SEO
Testé iteration_14 (parcours complet avec vrai paiement Stripe sandbox). 2 bugs bloquants trouvés+corrigés par le testeur (index unique code=null -> index partiel ; focus perdu dans le form admin). Action items restants traités ensuite par l'agent (validité 12 mois réelle, email unique anti-race, webhook active seulement si payé, slug dupliqué 409, prix>0 400, statut rédemption enum 422, appels Stripe non bloquants, état "bon utilisé/expiré" sur /bon/:code, gestion d'erreurs admin).
- Paiement Stripe Flow A (sandbox claimable, acct_1Uege...). Clés dans backend/.env (STRIPE_SECRET_KEY etc., STRIPE_MODE=test). Tax mode = DIY. onboarding_url à réclamer par le client pour passer en live.
- `giftcards.py`: coffrets (3 seedés, photos MAISON /media & /images), checkout (price_data serveur), status (fallback synchrone + activation), voucher, redeem ; webhook /api/stripe/webhook ; admin CRUD coffrets + cartes vendues + demandes.
- Emails (Infomaniak SMTP, réels): bon cadeau à l'acheteur, demande de rédemption à Marie, confirmation au bénéficiaire.
- Frontend: /cartes-cadeaux (festif, modal d'achat), /paiement/succes (polling), /paiement/annule, /bon/:code (bon imprimable), /utiliser-mon-bon (formulaire), /admin/cartes-cadeaux. Liens navbar (NAV.giftcards) + admin.
- Validité 12 mois. Code format PLUME-XXXX-XXXX.
- Menu mobile: barre + overlay partagent désormais le MÊME fondu d'opacité (bg-ink) -> plus aucun décalage.
- SEO/Google: préchargement image LCP (poster hero, fetchpriority high) ; `public/ai-catalog.json` créé + référencé dans robots.txt ; llms.txt déjà conforme (H1 Markdown).
- RESTE SEO (non bloquant, infra/perf): durée de cache des ressources, JS inutilisé/code-splitting (React.lazy exclu car casse l'ingress), width/height explicites sur toutes les images.

## Backlog cartes cadeaux (améliorations suggérées)
- Désactiver "Adaptive Pricing" dans le dashboard Stripe pour afficher toujours en EUR.
- Éditeur de la liste "includes" dans le form admin coffret ; data-testid sur tous les boutons admin.
- Empêcher plusieurs demandes de rédemption en attente pour un même code.
- Upload de photos coffrets (object storage) si le client veut ajouter des images hors du site.

## Backlog (P1/P2)
- Replace Smoobu placeholder URL with real booking widget (channel manager)
- Replace Unsplash placeholders with user's real photos (the local Mac paths were inaccessible)
- Optionally connect Resend for contact email notifications
- Real Plume Suites SVG logo file (currently rendered as styled wordmark)
- Costa del Sol page when address opens (2027)
