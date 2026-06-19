// Centralized bilingual content for Plume Suites — real authentic photos
export const IMAGES = {
  // Hero video + poster fallback
  heroVideo: "/media/pw8xl9qs_12583104_1920_1080_30fps.mp4",
  heroPoster: "/media/gawj27vm_sven-wilhelm-2cRXSWyMHA8-unsplash.jpg",

  // Plume Suites — Douceur (chaleureux, cocon, 2 lits, suspensions cuivre, pierre)
  douceur: "/media/06c7bdiw_50CA4710-2440-42FD-BA71-5227C2500D01.JPG",
  douceurTv: "/media/vacmfd3h_F1EED553-FC8A-4B91-83E2-006C644628E0.JPG",
  douceurHeadboard: "/media/p7ognvc7_B4C093FA-ECD4-4A9C-8CAC-D3B799C14E1B.JPG",

  // Plume Suites — L'Envolée (mansardé, exclusif, lumière)
  envolee: "/media/49xdp4zr_F28F0185-183B-4CAC-9287-576C414DD07A.JPG",
  envoleeDesk: "/media/6ompvcnm_7A67B1F7-EFA0-42FE-8054-5C7B83393CB8.JPG",

  // Bourgogne — Beaune
  beauneRoof: "/media/kzvstbfs_francesco-ungaro-6duN7DsOgcQ-unsplash.jpg",
  beauneCourtyard: "/media/3gvv3v16_herve-marmillot-DNjoCoORXxU-unsplash.jpg",

  // Bourgogne — Dijon
  dijonPalais: "/media/24zvpl1j_rayyan-pl7Bd0IN7b4-unsplash.jpg",
  dijonStreet: "/media/fta8g3gi_zhu-yunxiao-Ov-FZkRaxKw-unsplash.jpg",
  dijonCarousel: "/media/oz1hfjes_zhu-yunxiao-2E8g1HimrNc-unsplash.jpg",

  // Vignobles
  vineyard: "/media/pjvibq7i_alvin-frey-uxOR5cIlaCY-unsplash.jpg",
  vineyardSunset: "/media/gawj27vm_sven-wilhelm-2cRXSWyMHA8-unsplash.jpg",

  // Wine / Gastronomy / Art de vivre
  gastronomy: "/images/6r50xqk9_PHOTO_1__chef_.jpg",
  wineGlass: "/media/u8mp3yfa_ambitious-studio-rick-barrett-WT_r3dUwx6I-unsplash.jpg",
  wineWindow: "/media/ndqs3jyd_rinat-shakirov-gwfOeeb-QjY-unsplash.jpg",
  wineFriends: "/media/oal49whg_kelsey-chance-tAH2cA_BL5g-unsplash.jpg",
  wineTop: "/media/l2isc13w_corina-rainer-xx-qrRRNabQ-unsplash.jpg",

  // Canal placeholder (kept) + reading + Costa
  canal: "https://static.prod-images.emergentagent.com/jobs/9f3bfbc7-be66-4d19-b445-7eab6a98eb47/images/ad7c098fd3177e2c398eea963ce0f20cb29a1c232a3273d56900e626537962d8.png",
  reading: "/media/ndqs3jyd_rinat-shakirov-gwfOeeb-QjY-unsplash.jpg",

  // Costa del Sol — Marbella (real photos)
  costa: "/media/7boq1875_simon-hermans-6tgHYmerKyM-unsplash.jpg",
  costaBg: "/media/uqswchc7_ionut-dobre-M9BMyw8Ge4Y-unsplash.jpg",

  // Village de Fleurey-sur-Ouche — cartes postales anciennes (ancrage local)
  villageFleurey1: "/images/village_fleurey_1.jpg",
  villageFleurey2: "/images/village_fleurey_2.jpg",

  // Restaurant Ô P'tit Repère du Goût
  restaurantChef: "/images/6r50xqk9_PHOTO_1__chef_.jpg",
  // Plats du restaurant — PHOTO_12 & PHOTO_13 fournies
  plat1: "/images/PHOTO_13.jpg",
  plat2: "/images/PHOTO_12.jpg",

  // Suite Douceur — photos fournies (2 lits séparés, chambre, salle de bain)
  douceurPhoto2: "/images/PHOTO_2.jpg",
  douceurPhoto3: "/images/PHOTO_3.jpg",
  douceurPhoto4: "/images/PHOTO_4.jpg",

  // Legacy keys still referenced
  hero: "/media/gawj27vm_sven-wilhelm-2cRXSWyMHA8-unsplash.jpg",
  village: "/media/fta8g3gi_zhu-yunxiao-Ov-FZkRaxKw-unsplash.jpg",
  bedroom2: "/media/vacmfd3h_F1EED553-FC8A-4B91-83E2-006C644628E0.JPG",
  bathroom: "/media/p7ognvc7_B4C093FA-ECD4-4A9C-8CAC-D3B799C14E1B.JPG",
  table: "/media/u8mp3yfa_ambitious-studio-rick-barrett-WT_r3dUwx6I-unsplash.jpg",
  doorway: "/media/24zvpl1j_rayyan-pl7Bd0IN7b4-unsplash.jpg",
};

export const SMOOBU = {
  apartmentId: 780197,
  scriptUrl: "https://login.smoobu.com/js/Settings/BookingToolIframe.js",
  baseUrl: "https://login.smoobu.com",
  // language is interpolated from current i18n: fr | en
  iframeUrl: (lang = "fr") => `https://login.smoobu.com/${lang}/booking-tool/iframe/780197`,
};

export const SITE = {
  name: "Plume Suites",
  url: "https://plumesuites.fr",
  defaultImage: "/media/gawj27vm_sven-wilhelm-2cRXSWyMHA8-unsplash.jpg",
};

export const NAV = {
  artDeVivre: { fr: "Art de vivre", en: "Lifestyle" },
  sejours: { fr: "Séjours", en: "Stays" },
  journal: { fr: "Journal", en: "Journal" },
  contact: { fr: "Contact", en: "Contact" },
  book: { fr: "Réserver", en: "Book" },
};

export const HOME = {
  heroLabel: { fr: "Bourgogne · Costa del Sol", en: "Burgundy · Costa del Sol" },
  heroLabelSub: { fr: "Nouveau chapitre · 2027", en: "A new chapter · 2027" },
  heroTitle: {
    fr: "Ralentir,\nau bord du canal.",
    en: "Slow down,\nby the canal.",
  },
  heroIntro: {
    fr: "Plume Suites Collection, l'art de séjourner entre Bourgogne & Méditerranée.",
    en: "Plume Suites Collection, the art of staying between Burgundy & the Mediterranean.",
  },
  heroCta: { fr: "Réserver un séjour", en: "Book a stay" },
  heroCta2: { fr: "Voir les suites", en: "View the suites" },
  heroCollection: { fr: "Plume Suites Collection — Bourgogne", en: "Plume Suites Collection — Burgundy" },

  editorialOverline: { fr: "Le récit Plume", en: "The Plume story" },
  editorialTitle: {
    fr: "Une adresse confidentielle en Bourgogne",
    en: "A confidential address in Burgundy",
  },
  editorialP1: {
    fr: "Nichées à Fleurey-sur-Ouche, au bord du canal de Bourgogne et au-dessus du restaurant Ô P'TIT REPÈRE DU GOÛT, les suites Plume ont été imaginées comme des refuges chaleureux entre campagne bourguignonne et hospitalité contemporaine.",
    en: "Tucked away in Fleurey-sur-Ouche, along the Burgundy canal and above Ô P'TIT REPÈRE DU GOÛT restaurant, the Plume suites are imagined as warm retreats between Burgundy countryside and contemporary hospitality.",
  },
  editorialP2: {
    fr: "Chaque détail a été pensé pour créer une expérience douce, inspirée par le calme et l'élégance discrète de la Bourgogne.",
    en: "Every detail is shaped to create a soft experience, inspired by Burgundy's quiet, understated elegance.",
  },
  editorialSide: {
    fr: "Entre vignobles bourguignons, pierre naturelle et bientôt lumière méditerranéenne, Plume Suites Collection imagine des séjours inspirés par l'esthétique, le goût et l'art de vivre.",
    en: "Between Burgundy vineyards, natural stone and soon Mediterranean light, Plume Suites Collection imagines stays inspired by aesthetic, taste and the art of living.",
  },

  suitesOverline: { fr: "Séjours", en: "Stays" },
  suitesTitle: {
    fr: "Deux chapitres.",
    en: "Two chapters.",
  },
  suitesIntro: {
    fr: "Deux suites imaginées comme des parenthèses calmes au cœur de la Bourgogne.",
    en: "Two suites imagined as quiet pauses at the heart of Burgundy.",
  },
  suitesCta: { fr: "Découvrir la suite", en: "Discover the suite" },

  artOverline: { fr: "L'art de vivre Plume", en: "The Plume way" },
  artTitle: { fr: "Vivre la Bourgogne", en: "Living Burgundy" },
  artIntro: {
    fr: "Entre gastronomie, canal, vignobles et douceur de campagne, Plume Suites Collection célèbre une Bourgogne contemporaine et confidentielle.",
    en: "Between gastronomy, canal, vineyards and quiet countryside, Plume Suites Collection celebrates a contemporary, confidential Burgundy.",
  },

  quote: {
    fr: "Le luxe réside dans le calme, la lumière et les lieux qui ralentissent le temps.",
    en: "Luxury lies in calm, in light, and in places that slow time down.",
  },
  quoteAttr: { fr: "— Plume Suites", en: "— Plume Suites" },

  locationOverline: { fr: "Localisation", en: "Location" },
  locationTitle: { fr: "Au cœur de la Bourgogne", en: "At the heart of Burgundy" },
  locationText: {
    fr: "Entre Dijon, les vignobles bourguignons et le canal de Bourgogne, Fleurey-sur-Ouche révèle une douceur de vivre discrète et intemporelle.",
    en: "Between Dijon, the Burgundy vineyards and the canal, Fleurey-sur-Ouche reveals a discreet, timeless way of living.",
  },

  costaOverline: { fr: "Nouveau chapitre", en: "New chapter" },
  costaTitle: {
    fr: "Un nouveau chapitre méditerranéen",
    en: "A new Mediterranean chapter",
  },
  costaText: {
    fr: "Costa del Sol — 2027. Un appartement signature, piscine privée, près de la plage. Une autre lumière, le même soin du détail.",
    en: "Costa del Sol — 2027. A signature apartment with a private pool, steps from the beach. Another light, the same care for detail.",
  },

  journalOverline: { fr: "Le Journal", en: "The Journal" },
  journalTitle: { fr: "Inspirations & art de vivre", en: "Inspirations & lifestyle" },
  journalIntro: {
    fr: "Carnet d'inspirations entre Bourgogne et Méditerranée — gastronomie, escapades et lenteur.",
    en: "An inspirations notebook between Burgundy and the Mediterranean — gastronomy, escapes and slowness.",
  },
};

export const ART_BLOCKS = [
  {
    key: "gastronomy",
    overline: { fr: "01 — Gastronomie", en: "01 — Gastronomy" },
    title: { fr: "Une table de saison", en: "A seasonal table" },
    text: {
      fr: "Une table gastronomique pensée autour des saisons, des producteurs et du goût.",
      en: "A gastronomic table built around seasons, growers and taste.",
    },
    image: IMAGES.gastronomy,
  },
  {
    key: "canal",
    overline: { fr: "02 — Le Canal", en: "02 — The Canal" },
    title: { fr: "Le canal, lentement", en: "The canal, slowly" },
    text: {
      fr: "Des promenades à pas lents au bord du canal de Bourgogne, à toute heure du jour.",
      en: "Slow walks along the Burgundy canal, at any hour of the day.",
    },
    image: IMAGES.canal,
  },
  {
    key: "vineyards",
    overline: { fr: "03 — Villages & vignobles", en: "03 — Villages & vineyards" },
    title: { fr: "Routes des vins", en: "Wine routes" },
    text: {
      fr: "Entre routes des vins, pierre dorée et villages bourguignons confidentiels.",
      en: "Between wine routes, golden stone and confidential Burgundy villages.",
    },
    image: IMAGES.vineyard,
  },
  {
    key: "slow",
    overline: { fr: "04 — Slow Moments", en: "04 — Slow Moments" },
    title: { fr: "Matins lents", en: "Slow mornings" },
    text: {
      fr: "Matins calmes, longues soirées, lumière dorée — la Bourgogne au ralenti.",
      en: "Calm mornings, long evenings, golden light — Burgundy at a gentle pace.",
    },
    image: IMAGES.reading,
  },
];

export const SUITES = {
  envolee: {
    slug: "envolee",
    name: { fr: "Plume Suites — L'Envolée", en: "Plume Suites — L'Envolée" },
    short: { fr: "L'Envolée", en: "L'Envolée" },
    tier: { fr: "Signature", en: "Signature" },
    cover: IMAGES.envolee,
    stats: {
      rooms: 1,
      guests: 2,
      size: "55 m²",
      labels: {
        rooms: { fr: "Chambre", en: "Bedroom" },
        guests: { fr: "Hôtes", en: "Guests" },
        size: { fr: "Espace", en: "Living space" },
      },
    },
    overlay: {
      fr: "L'écrin signature — espace, lumière et raffinement.",
      en: "The signature retreat — space, light and refinement.",
    },
    intro: {
      fr: "Suite signature de la collection, L'Envolée déploie un espace généreux — chambre, salon et coin bureau — dans une atmosphère sereine, dessinée pour les séjours à deux où le temps prend une autre densité.",
      en: "The collection's signature suite, L'Envolée unfolds a generous space — bedroom, lounge and writing corner — in a serene atmosphere designed for two, where time finds another density.",
    },
    overlayTitle: {
      fr: "Fenêtres ouvertes. Lumière bourguignonne. Matins calmes.",
      en: "Open windows. Burgundy light. Quiet mornings.",
    },
    editorialTitle: {
      fr: "Une suite pensée pour le temps long.",
      en: "A suite designed for slow time.",
    },
    editorial: {
      fr: "Plus spacieuse, plus confidentielle, L'Envolée est notre suite la plus aboutie. Matières nobles, mobilier choisi, espaces distincts pour vivre, travailler et se reposer — tout y invite à s'attarder.",
      en: "More spacious, more private, L'Envolée is our most refined suite. Noble materials, carefully chosen furniture, distinct spaces to live, work and rest — everything invites you to stay.",
    },
    experienceTitle: { fr: "À quelques pas", en: "Just steps away" },
    experience: [
      { fr: "Le canal de Bourgogne", en: "The Burgundy canal" },
      { fr: "Les vignobles de la Côte de Nuits", en: "Côte de Nuits vineyards" },
      { fr: "Les villages de pierre", en: "Stone villages" },
      { fr: "La table Ô P'tit Repère du Goût", en: "Ô P'tit Repère du Goût" },
    ],
    detailsTitle: { fr: "Détails", en: "Details" },
    details: [
      { fr: "Salon & coin bureau", en: "Lounge & writing corner" },
      { fr: "Lit King size haut de gamme", en: "Premium King size bed" },
      { fr: "Vue canal & lumière naturelle", en: "Canal view & natural light" },
      { fr: "Climatisation", en: "Air conditioning" },
      { fr: "Wi-Fi haut débit · Chromecast", en: "High-speed Wi-Fi · Chromecast" },
      { fr: "Café Nespresso & sélection raffinée", en: "Nespresso coffee & curated selection" },
    ],
    gallery: [
      "/images/x2jgmdrr_PHOTO_7.jpg",
      "/images/27a8ntzq_PHOTO_8.jpg",
      "/images/0ilaw2p9_PHOTO_11.jpg",
      "/images/re60qvsk_PHOTO_10.jpg",
      "/images/5klq14mm_PHOTO_9.jpg",
    ],
  },
  douceur: {
    slug: "douceur",
    name: { fr: "Plume Suites — Douceur", en: "Plume Suites — Douceur" },
    short: { fr: "Douceur", en: "Douceur" },
    tier: { fr: "Famille & amis", en: "Family & friends" },
    cover: IMAGES.douceur,
    stats: {
      rooms: 2,
      guests: 4,
      size: "40 m²",
      labels: {
        rooms: { fr: "Chambres", en: "Bedrooms" },
        guests: { fr: "Hôtes", en: "Guests" },
        size: { fr: "Surface", en: "Size" },
      },
    },
    overlay: {
      fr: "Intérieurs chaleureux & moments suspendus.",
      en: "Warm interiors & suspended moments.",
    },
    intro: {
      fr: "Une suite imaginée comme un refuge chaleureux au bord du canal de Bourgogne, pensée pour les séjours en famille ou entre amis — entre lumière douce, matières naturelles et atmosphère apaisante.",
      en: "A warm retreat along the Burgundy canal, designed for family or friends — between soft light, natural textures and slower living.",
    },
    overlayTitle: {
      fr: "Des matins au rythme du canal.",
      en: "Quiet mornings by the water.",
    },
    editorialTitle: {
      fr: "Une parenthèse bourguignonne.",
      en: "A Burgundy pause.",
    },
    editorial: {
      fr: "Pensée pour les escapades à plusieurs, Douceur mêle hospitalité contemporaine et charme discret de la campagne bourguignonne — chaleureuse, généreuse, vivante.",
      en: "Designed for travelling together, Douceur blends contemporary hospitality with the quiet charm of the Burgundy countryside — warm, generous, alive.",
    },
    experienceTitle: { fr: "À quelques pas", en: "Just steps away" },
    experience: [
      { fr: "Le canal de Bourgogne", en: "The Burgundy canal" },
      { fr: "Les villages de pierre", en: "Stone villages" },
      { fr: "Les vignobles", en: "Vineyards" },
      { fr: "La table Ô P'tit Repère du Goût", en: "Ô P'tit Repère du Goût" },
    ],
    detailsTitle: { fr: "Détails", en: "Details" },
    details: [
      { fr: "Deux chambres distinctes", en: "Two separate bedrooms" },
      { fr: "Chambre principale — un lit double", en: "Main bedroom — one double bed" },
      { fr: "Seconde chambre — 2 lits séparés", en: "Second bedroom — 2 single beds" },
      { fr: "Vue canal · matières naturelles", en: "Canal view · natural textures" },
      { fr: "Climatisation · Wi-Fi haut débit", en: "Air conditioning · High-speed Wi-Fi" },
      { fr: "Chromecast", en: "Chromecast" },
    ],
    gallery: [IMAGES.douceur, IMAGES.douceurPhoto3, IMAGES.douceurPhoto2, IMAGES.douceurPhoto4, IMAGES.douceurTv, IMAGES.douceurHeadboard],
  },
};

export const FOOTER = {
  tagline: {
    fr: "Plume Suites Collection.",
    en: "Plume Suites Collection.",
  },
  addressTitle: { fr: "Bourgogne", en: "Burgundy" },
  address: {
    fr: "8 Rue des Vieilles Carrières\n21410 Fleurey-sur-Ouche\nCôte-d'Or — Bourgogne",
    en: "8 Rue des Vieilles Carrières\n21410 Fleurey-sur-Ouche\nCôte-d'Or — Burgundy",
  },
  futureTitle: { fr: "Bientôt", en: "Coming soon" },
  future: { fr: "Costa del Sol — 2027.", en: "Costa del Sol — 2027." },
  distancesTitle: { fr: "À proximité", en: "Nearby" },
  distances: [
    { place: { fr: "Dijon", en: "Dijon" }, value: { fr: "20 min en voiture", en: "20 min by car" } },
    { place: { fr: "Beaune", en: "Beaune" }, value: { fr: "45 min en voiture", en: "45 min by car" } },
    { place: { fr: "Vignobles de Marsannay", en: "Marsannay vineyards" }, value: { fr: "25 min", en: "25 min" } },
    { place: { fr: "Canal de Bourgogne", en: "Burgundy canal" }, value: { fr: "1 min à pied", en: "1 min walk" } },
    { place: { fr: "Gare TGV Dijon", en: "Dijon TGV Station" }, value: { fr: "25 min", en: "25 min" } },
    { place: { fr: "Aéroport Lyon-Saint-Exupéry", en: "Lyon-Saint-Exupéry Airport" }, value: { fr: "2 h", en: "2 h" } },
  ],
  navTitle: { fr: "Navigation", en: "Navigate" },
  followTitle: { fr: "Suivre", en: "Follow" },
  social: [
    { label: "Instagram", href: "https://www.instagram.com/plumesuites/" },
  ],
  rights: {
    fr: "© Plume Suites Collection. Tous droits réservés.",
    en: "© Plume Suites Collection. All rights reserved.",
  },
};

export const CONTACT_PAGE = {
  overline: { fr: "Écrivez-nous", en: "Write to us" },
  title: { fr: "Une question, un séjour à imaginer ?", en: "A question, a stay to imagine?" },
  intro: {
    fr: "Pour toute demande, écrivez-nous : nous répondons avec attention, sous 24 heures.",
    en: "For any request, write to us — we reply with care, within 24 hours.",
  },
  fields: {
    name: { fr: "Votre nom", en: "Your name" },
    email: { fr: "Votre email", en: "Your email" },
    subject: { fr: "Sujet", en: "Subject" },
    message: { fr: "Votre message", en: "Your message" },
    submit: { fr: "Envoyer", en: "Send" },
    sending: { fr: "Envoi…", en: "Sending…" },
    success: { fr: "Merci, votre message est bien arrivé.", en: "Thank you, your message has been received." },
    error: { fr: "Une erreur est survenue. Réessayez.", en: "Something went wrong. Please try again." },
  },
  address: {
    fr: "Fleurey-sur-Ouche, Bourgogne — France",
    en: "Fleurey-sur-Ouche, Burgundy — France",
  },
};

export const ARTDEVIVRE_PAGE = {
  heroOverline: { fr: "Art de vivre", en: "Lifestyle" },
  heroTitle: { fr: "Vivre la Bourgogne, lentement.", en: "Living Burgundy, slowly." },
  heroIntro: {
    fr: "Entre canal, vignobles et tables de saison — un art de vivre confidentiel.",
    en: "Between canal, vineyards and seasonal tables — a confidential way of living.",
  },
  closingTitle: { fr: "Une Bourgogne contemporaine.", en: "A contemporary Burgundy." },
  closing: {
    fr: "Plume Suites célèbre une Bourgogne discrète : celle du temps long, des artisans, des saisons.",
    en: "Plume Suites celebrates a quiet Burgundy: of slow time, of artisans, of seasons.",
  },
};

export const SEJOURS_PAGE = {
  heroOverline: { fr: "Plume Suites Collection", en: "Plume Suites Collection" },
  heroTitle: { fr: "Séjours", en: "Stays" },
  heroIntro: {
    fr: "Deux suites imaginées comme des parenthèses calmes au cœur de la Bourgogne.",
    en: "Two suites imagined as quiet pauses at the heart of Burgundy.",
  },
};

export const JOURNAL_PAGE = {
  heroOverline: { fr: "Le Journal", en: "The Journal" },
  heroTitle: { fr: "Carnet de lectures", en: "A reading notebook" },
  heroIntro: {
    fr: "Inspirations, gastronomie, escapades et art de vivre entre Bourgogne et Méditerranée.",
    en: "Inspirations, gastronomy, escapes and lifestyle between Burgundy and the Mediterranean.",
  },
};

// ── La table — Ô P'tit Repère du Goût (identité réelle du restaurant) ──
export const RESTAURANT = {
  overline: { fr: "La table — un étage plus bas", en: "The table — one floor below" },
  name: "Ô P'tit Repère du Goût",
  title: {
    fr: "La gastronomie, juste en dessous.",
    en: "Gastronomy, just downstairs.",
  },
  lead: {
    fr: "Un étage plus bas, Ô P'tit Repère du Goût prolonge naturellement l'esprit des suites. Le chef Michaël Felmann y signe une cuisine 100 % maison, généreuse et sincère, où le produit frais rencontre une belle alliance entre la France et l'Espagne.",
    en: "One floor below, Ô P'tit Repère du Goût naturally extends the spirit of the suites. Chef Michaël Felmann offers an entirely house-made cuisine, generous and sincere, where fresh produce meets a fine alliance between France and Spain.",
  },
  quote: {
    fr: "Un bon produit n'a rien à cacher, juste à être partagé.",
    en: "A good product has nothing to hide — it only asks to be shared.",
  },
  body: {
    fr: "Une table où l'on descend dîner sans avoir à sortir : du fait maison, des produits choisis pour leur goût et le geste juste d'un chef qui cuisine depuis l'enfance. Ici, l'élégance rencontre le plaisir, dans la simplicité du partage.",
    en: "A table you reach simply by going downstairs: everything made in-house, products chosen for their taste and the sure hand of a chef who has cooked since childhood. Here, elegance meets pleasure, in the simple joy of sharing.",
  },
  cta: { fr: "Découvrir le restaurant", en: "Discover the restaurant" },
  url: "https://www.optitreperedugout.fr",
  images: [IMAGES.restaurantChef, IMAGES.plat1, IMAGES.plat2],
};

// ── Prolonger l'expérience — attentions à composer avant l'arrivée ──
export const EXPERIENCES_SECTION = {
  overline: { fr: "Avant l'arrivée", en: "Before you arrive" },
  title: { fr: "Prolonger l'expérience", en: "Extend the experience" },
  intro: {
    fr: "Quelques attentions à imaginer avant votre venue, pensées dans l'esprit Plume Suites : le goût du détail, le plaisir de recevoir, l'art de vivre bourguignon. Faites-nous part de votre choix avant l'arrivée — tout sera prêt dans la suite.",
    en: "A few thoughtful touches to imagine before your stay, in the Plume Suites spirit: an eye for detail, the pleasure of hosting, the Burgundy art of living. Let us know your choice before arrival — everything will be ready in the suite.",
  },
  note: {
    fr: "Présentées lors de la réservation et dans le Guide du Voyageur envoyé automatiquement avant votre séjour.",
    en: "Presented at booking and in the Traveller's Guide automatically sent before your stay.",
  },
  includesLabel: { fr: "Ce que comprend l'expérience", en: "What the experience includes" },
  ctaDetail: { fr: "En savoir plus", en: "Learn more" },
  ctaReserve: { fr: "Réserver", en: "Book" },
};

export const EXPERIENCES = [
  {
    key: "arrivee",
    title: { fr: "Une arrivée qui vous attend", en: "An arrival that awaits you" },
    price: 49,
    teaser: {
      fr: "Parce que les premiers instants donnent souvent le ton du séjour.",
      en: "Because the first moments often set the tone of a stay.",
    },
    editorial: {
      fr: "À votre arrivée, quelques attentions vous attendront déjà dans la suite : une bouteille de Crémant de Bourgogne, quelques douceurs artisanales et de quoi commencer votre parenthèse bourguignonne en toute simplicité. Une manière discrète de célébrer le début du séjour.",
      en: "On arrival, a few thoughtful touches will already be waiting in your suite: a bottle of Crémant de Bourgogne, some artisan treats and everything to begin your Burgundy pause with ease. A discreet way to celebrate the start of the stay.",
    },
    includes: [
      { fr: "Une bouteille de Crémant de Bourgogne", en: "A bottle of Crémant de Bourgogne" },
      { fr: "Quelques douceurs artisanales", en: "A few artisan treats" },
      { fr: "Une attention déposée dans la suite avant votre arrivée", en: "A welcome touch placed in the suite before you arrive" },
    ],
    image: IMAGES.wineGlass,
  },
  {
    key: "saveurs",
    title: { fr: "Saveurs de Bourgogne", en: "Flavours of Burgundy" },
    price: 79,
    teaser: {
      fr: "La Bourgogne se découvre autant dans les paysages que dans l'assiette.",
      en: "Burgundy is discovered as much in its landscapes as on the plate.",
    },
    editorial: {
      fr: "Nous préparons pour vous de quoi partager dans l'intimité de votre suite : un peu de jambon persillé artisanal et une belle bouteille de Bourgogne sélectionnée, rouge ou blanc au choix, pour un moment hors du temps. Une invitation à goûter le territoire à votre rythme.",
      en: "We prepare something to share in the intimacy of your suite: some artisan jambon persillé and a fine selected bottle of Burgundy — red or white, your choice — for a timeless moment. An invitation to taste the region at your own pace.",
    },
    includes: [
      { fr: "Du jambon persillé artisanal à partager", en: "Artisan jambon persillé (Burgundy parsley ham) to share" },
      { fr: "Une bouteille de Bourgogne sélectionnée — rouge ou blanc au choix", en: "A selected bottle of Burgundy — red or white, your choice" },
      { fr: "Une mise en place soignée déposée dans la suite", en: "A careful set-up placed in the suite" },
    ],
    image: IMAGES.wineFriends,
  },
  {
    key: "celebration",
    title: { fr: "Une occasion à célébrer", en: "An occasion to celebrate" },
    price: 89,
    teaser: {
      fr: "Certaines escapades méritent une attention particulière.",
      en: "Some escapes deserve a little extra care.",
    },
    editorial: {
      fr: "Anniversaire, surprise ou simple envie de faire plaisir : nous préparons quelques attentions pour marquer le moment avec élégance. Fleurs fraîches, bouteille de Crémant de Bourgogne et douceurs gourmandes vous attendront à votre arrivée.",
      en: "Birthday, surprise or simply the wish to delight: we prepare a few touches to mark the moment with elegance. Fresh flowers, a bottle of Crémant de Bourgogne and gourmet treats will be waiting on your arrival.",
    },
    includes: [
      { fr: "Un bouquet de fleurs fraîches", en: "A bouquet of fresh flowers" },
      { fr: "Une bouteille de Crémant de Bourgogne", en: "A bottle of Crémant de Bourgogne" },
      { fr: "Des douceurs gourmandes", en: "Gourmet treats" },
      { fr: "Une mise en place soignée à votre arrivée", en: "A careful set-up on your arrival" },
    ],
    image: IMAGES.wineTop,
  },
];
