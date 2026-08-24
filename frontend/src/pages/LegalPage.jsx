import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Seo from "../components/Seo";
import { useLang } from "../context/LanguageContext";

const CGV_FR = `
<h2>1. Réservation et Confirmation</h2><p>Les réservations peuvent être effectuées via notre site internet, par téléphone ou par e-mail. Toute réservation sera confirmée après réception de l'acompte ou de la garantie de paiement par carte bancaire.</p>
<h2>2. Tarifs</h2><p>Les prix indiqués pour nos chambres <strong>n'incluent pas</strong> la <strong>taxe de séjour</strong> ni les <strong>frais de ménage</strong>.</p>
<h3>Taxe de séjour</h3><ul><li>La taxe de séjour est calculée à un taux de 3,00 % sur le tarif de la chambre, avec un tarif maximum voté par la commune de 4,20 € par nuit et par personne, plafonné à 4,62 € après l'ajout de la taxe additionnelle départementale de 10 %.</li><li><strong>Exemptions :</strong> la taxe de séjour ne s'applique pas aux habitants de Fleurey-sur-Ouche ni aux enfants de moins de 18 ans.</li></ul>
<h3>Frais de ménage</h3><ul><li>Des frais de ménage de 30 € par séjour seront facturés.</li></ul>
<p>Les frais de ménage seront clairement indiqués et ajoutés au montant total de la réservation lors du passage au panier, tandis que la taxe de séjour devra être réglée sur place avant d'accéder au logement.</p>
<h2>3. Paiement</h2><p>Le paiement intégral de la réservation est exigé lors de la réservation. Les paiements ne peuvent être effectués que par <strong>carte bancaire</strong> ou <strong>virement bancaire</strong>. Les informations bancaires sont traitées de manière sécurisée via un protocole de cryptage pour protéger vos données.</p>
<p>Le montant total de la réservation (y compris les frais de ménage) sera facturé à la réservation. La <strong>taxe de séjour</strong> doit être réglée <strong>sur place</strong>, avant d'accéder au logement, en espèces ou par virement bancaire. Aucune arrivée ne pourra être autorisée tant que la taxe de séjour n'a pas été réglée.</p>
<h2>4. Conditions d'Annulation</h2><ul><li><strong>Plus de 14 jours avant la date d'arrivée :</strong> annulation gratuite, aucun frais n'est facturé.</li><li><strong>Entre 7 et 14 jours avant la date d'arrivée :</strong> annulation avec frais égaux à 50 % du montant total de la réservation.</li><li><strong>Moins de 7 jours avant la date d'arrivée :</strong> annulation avec frais égaux à 100 % du montant total de la réservation.</li><li><strong>Modification ou annulation de réservation :</strong> toute modification ou annulation doit être communiquée par écrit et confirmée par Plume Suites pour être considérée comme valide.</li><li><strong>Conditions d'annulation indépendantes de la situation personnelle :</strong> les conditions d'annulation s'appliquent même en cas de maladie ou de perturbations liées au Covid-19.</li></ul>
<h2>5. Check-in et Check-out</h2><ul><li><strong>Check-in :</strong> disponible entre 15h00 et 20h00. En cas de demande d'arrivée tardive ou anticipée, merci de nous contacter au préalable.</li><li><strong>Check-out :</strong> avant 11h00. Des horaires flexibles peuvent être envisagés sur demande et sous réserve de disponibilité.</li></ul>
<h2>6. Responsabilité</h2><p>Plume Suites ne pourra être tenu responsable des pertes ou dommages matériels survenus pendant le séjour, sauf en cas de négligence manifeste de la part de l'établissement.</p>
<h2>7. Assurance</h2><p>Nous vous recommandons de souscrire une <strong>assurance voyage</strong> couvrant les risques de santé, d'annulation de réservation, de vol, de perte de bagages et autres incidents pouvant survenir avant ou pendant votre séjour. Plume Suites décline toute responsabilité en cas d'incident survenant lors de votre séjour, y compris les accidents ou les dommages à vos biens personnels.</p>
<h2>8. Comportement et Utilisation des Espaces</h2><p>Les clients s'engagent à respecter les règles de bon voisinage et à ne pas troubler la tranquillité des autres résidents. Tout comportement inapproprié ou nuisible pourra entraîner l'annulation immédiate de la réservation sans remboursement.</p>
<h2>9. Casse et Dommages</h2><p>Les clients sont responsables de toute casse ou tout dommage causé dans les chambres ou dans les parties communes de l'établissement. En cas de casse ou de dommage, le montant des réparations nécessaires sera facturé au client. Les clients doivent signaler immédiatement toute casse ou dommage. En cas de négligence ou de non-signalement, des frais supplémentaires pourront être appliqués pour couvrir les coûts de réparation ou de remplacement.</p>
<h2 id="offre-semaine10">10. Offre Long Séjour</h2><p>L'offre permet de bénéficier d'une remise de 10 % sur le tarif hébergement pour tout séjour de 6 nuits consécutives minimum à Plume Suites Fleurey-sur-Ouche. Elle est valable pour les séjours dont la date de départ intervient au plus tard le 31 janvier 2027, sous réserve de disponibilité. L'offre n'est pas cumulable avec une autre offre promotionnelle et peut être modifiée ou retirée à tout moment pour les nouvelles réservations. Les réservations déjà confirmées restent acquises aux conditions en vigueur lors de leur confirmation.</p>
`;

const CGV_EN = `
<h2>1. Booking and Confirmation</h2><p>Bookings can be made through our website, by phone or by email. Every booking is confirmed once the deposit or the credit-card payment guarantee has been received.</p>
<h2>2. Rates</h2><p>The prices shown for our suites <strong>do not include</strong> the <strong>tourist tax</strong> or the <strong>cleaning fee</strong>.</p>
<h3>Tourist tax</h3><ul><li>The tourist tax is calculated at a rate of 3.00% of the room rate, with a maximum rate voted by the municipality of €4.20 per night and per person, capped at €4.62 after the 10% additional departmental tax.</li><li><strong>Exemptions:</strong> the tourist tax does not apply to residents of Fleurey-sur-Ouche or to children under 18.</li></ul>
<h3>Cleaning fee</h3><ul><li>A cleaning fee of €30 per stay will be charged.</li></ul>
<p>The cleaning fee is clearly indicated and added to the total at checkout, while the tourist tax must be paid on site before access to the accommodation.</p>
<h2>3. Payment</h2><p>Full payment of the booking is required at the time of reservation. Payments can only be made by <strong>credit card</strong> or <strong>bank transfer</strong>. Banking information is processed securely through an encryption protocol to protect your data.</p>
<p>The total amount of the booking (including the cleaning fee) is charged at the time of reservation. The <strong>tourist tax</strong> must be paid <strong>on site</strong>, before access to the accommodation, in cash or by bank transfer. No check-in can be authorised until the tourist tax has been settled.</p>
<h2>4. Cancellation Policy</h2><ul><li><strong>More than 14 days before the arrival date:</strong> free cancellation, no charge.</li><li><strong>Between 7 and 14 days before arrival:</strong> cancellation with a fee equal to 50% of the total booking amount.</li><li><strong>Less than 7 days before arrival:</strong> cancellation with a fee equal to 100% of the total booking amount.</li><li><strong>Modification or cancellation:</strong> any change or cancellation must be communicated in writing and confirmed by Plume Suites to be considered valid.</li><li><strong>Cancellation conditions independent of personal circumstances:</strong> the cancellation conditions apply even in the event of illness or Covid-19 related disruptions.</li></ul>
<h2>5. Check-in and Check-out</h2><ul><li><strong>Check-in:</strong> available between 3:00 pm and 8:00 pm. For late or early arrival requests, please contact us in advance.</li><li><strong>Check-out:</strong> before 11:00 am. Flexible times may be arranged on request and subject to availability.</li></ul>
<h2>6. Liability</h2><p>Plume Suites cannot be held liable for loss or material damage occurring during the stay, except in the event of clear negligence on the part of the establishment.</p>
<h2>7. Insurance</h2><p>We recommend taking out <strong>travel insurance</strong> covering health risks, booking cancellation, theft, lost luggage and other incidents that may occur before or during your stay. Plume Suites declines any responsibility for incidents occurring during your stay, including accidents or damage to your personal belongings.</p>
<h2>8. Conduct and Use of the Spaces</h2><p>Guests agree to respect good-neighbour rules and not to disturb the peace of other residents. Any inappropriate or harmful behaviour may result in the immediate cancellation of the booking without refund.</p>
<h2>9. Breakage and Damage</h2><p>Guests are responsible for any breakage or damage caused in the suites or in the common areas. In the event of breakage or damage, the cost of the necessary repairs will be charged to the guest. Guests must report any breakage or damage immediately. In case of negligence or failure to report, additional fees may be applied to cover repair or replacement costs.</p>
<h2 id="long-stay-semaine10">10. Long Stay Offer</h2><p>This offer provides a 10% discount on the accommodation rate for any stay of at least 6 consecutive nights at Plume Suites Fleurey-sur-Ouche. It is valid for stays with a departure date no later than 31 January 2027, subject to availability. The offer cannot be combined with any other promotional offer and may be modified or withdrawn at any time for new bookings. Bookings already confirmed remain subject to the conditions in force at the time of their confirmation.</p>
`;

const PRIVACY_FR = `
<h2>Introduction</h2><p>La présente Politique de Confidentialité décrit les pratiques de <strong>Plume Suites</strong>, entreprise individuelle exploitée par <strong>Madame Marie Felmann</strong> (« nous », « notre » ou « l'Entreprise »), concernant la collecte, l'utilisation et la protection des informations personnelles des utilisateurs accédant à notre site web (« le Site ») ou partageant leurs informations avec nous (collectivement : « Utilisateurs »).</p>
<h2>Bases légales de la collecte de données</h2><p>Le traitement de vos informations personnelles est fondé sur :</p><ul><li><strong>L'exécution de nos obligations contractuelles</strong>, pour vous fournir nos services d'hébergement et gérer vos réservations.</li><li><strong>Notre intérêt légitime</strong>, afin d'améliorer nos services et la gestion de notre activité.</li><li><strong>Le respect de nos obligations légales et financières.</strong></li></ul>
<h2>Quelles informations collectons-nous ?</h2><h3>1. Informations non personnelles</h3><ul><li>Données techniques sur votre navigation (adresse IP, type de navigateur, système d'exploitation, pages consultées, temps de visite, etc.).</li><li>Informations statistiques et analytiques sur l'usage du Site.</li></ul><h3>2. Informations personnelles</h3><ul><li><strong>Informations de l'appareil :</strong> adresse IP, données de géolocalisation, identifiants uniques.</li><li><strong>Informations de contact :</strong> nom, prénom, adresse e-mail, téléphone.</li><li><strong>Données de réservation :</strong> dates de séjour, préférences, demandes spécifiques.</li></ul>
<h2>Comment collectons-nous ces informations ?</h2><ul><li>Lorsque vous nous les fournissez volontairement (réservation, inscription, contact).</li><li>Lorsque vous utilisez ou accédez au Site.</li><li>Via des fournisseurs tiers (outils d'analyse web).</li></ul>
<h2>Comment utilisons-nous vos informations ?</h2><ul><li>Gérer vos réservations et vos séjours.</li><li>Vous contacter (confirmation de réservation, assistance, réponses à vos demandes).</li><li>Personnaliser votre expérience utilisateur.</li><li>Améliorer notre Site et nos services (analyses, statistiques).</li><li>Respecter nos obligations légales et réglementaires.</li><li>Vous envoyer des communications commerciales (avec votre consentement).</li></ul><p>Nous ne vendons ni ne louons vos données personnelles à des tiers.</p>
<h2>Partage de vos informations</h2><ul><li>Nos prestataires de services (hébergeur web, plateforme de réservation, prestataire de paiement).</li><li>Les autorités compétentes, en cas d'obligation légale.</li></ul>
<h2>Durée de conservation</h2><p>Vos Informations personnelles sont conservées aussi longtemps que nécessaire pour fournir nos services, respecter nos obligations comptables et fiscales, et améliorer l'expérience utilisateur.</p>
<h2>Vos droits</h2><p>Vous pouvez demander à accéder, modifier, supprimer, limiter ou vous opposer au traitement de vos données, ou retirer votre consentement. Contact : <a href="mailto:hello@plumesuites.fr">hello@plumesuites.fr</a>.</p>
<h2>Cookies</h2><p>Le Site utilise des cookies de session, persistants et tiers (Google Analytics). Vous pouvez gérer vos préférences via les paramètres de votre navigateur.</p>
<h2>Sécurité des données</h2><p>Nous mettons en place des mesures de protection (cryptage, accès restreint). Aucun système n'étant infaillible, nous ne pouvons garantir une sécurité absolue.</p>
<h2>Transfert hors UE</h2><p>Certaines données peuvent être stockées hors UE. Nous appliquons des garanties conformes aux normes européennes.</p>
<h2>Protection des mineurs</h2><p>Nous ne collectons pas intentionnellement d'informations sur des mineurs. Contact : hello@plumesuites.fr.</p>
<h2>Modifications</h2><p>Cette Politique peut être modifiée à tout moment. Dernière mise à jour : 14/03/2025.</p>
<h2>Nous contacter</h2><ul><li>Plume Suites — 8 rue des Vieilles Carrières, 21410 Fleurey-sur-Ouche, France</li><li>Téléphone : +33 6 95 48 87 60</li><li>E-mail : <a href="mailto:hello@plumesuites.fr">hello@plumesuites.fr</a></li></ul>
<h2>Hébergement du site</h2><p>Ce site est hébergé par <strong>Emergent Labs Inc.</strong> — 2380 Via Espada, Pleasanton, CA 94566, États-Unis. Notre channel manager, utilisé uniquement pour le moteur de réservation en ligne, est <strong>Smoobu GmbH</strong> — Pappelallee 78/79, 10437 Berlin, Allemagne.</p>
`;

const PRIVACY_EN = `
<h2>Introduction</h2><p>This Privacy Policy describes the practices of <strong>Plume Suites</strong>, a sole proprietorship operated by <strong>Mrs Marie Felmann</strong> ("we", "our" or "the Company"), regarding the collection, use and protection of the personal information of users accessing our website ("the Site") or sharing their information with us (collectively: "Users").</p>
<h2>Legal bases for data collection</h2><p>The processing of your personal information is based on:</p><ul><li><strong>The performance of our contractual obligations</strong>, to provide our accommodation services and manage your bookings.</li><li><strong>Our legitimate interest</strong>, in order to improve our services and manage our business.</li><li><strong>Compliance with our legal and financial obligations.</strong></li></ul>
<h2>What information do we collect?</h2><h3>1. Non-personal information</h3><ul><li>Technical data about your browsing (IP address, browser type, operating system, pages viewed, visit time, etc.).</li><li>Statistical and analytical information about use of the Site.</li></ul><h3>2. Personal information</h3><ul><li><strong>Device information:</strong> IP address, geolocation data, unique identifiers.</li><li><strong>Contact information:</strong> first and last name, email address, phone.</li><li><strong>Booking data:</strong> stay dates, preferences, specific requests.</li></ul>
<h2>How do we collect this information?</h2><ul><li>When you provide it voluntarily (booking, registration, contact).</li><li>When you use or access the Site.</li><li>Through third-party providers (web analytics tools).</li></ul>
<h2>How do we use your information?</h2><ul><li>Manage your bookings and stays.</li><li>Contact you (booking confirmation, assistance, replies to your requests).</li><li>Personalise your user experience.</li><li>Improve our Site and services (analytics, statistics).</li><li>Comply with our legal and regulatory obligations.</li><li>Send you commercial communications (with your consent).</li></ul><p>We do not sell or rent your personal data to third parties.</p>
<h2>Sharing your information</h2><ul><li>Our service providers (web host, booking platform, payment provider).</li><li>The competent authorities, in the event of a legal obligation.</li></ul>
<h2>Retention period</h2><p>Your personal information is kept for as long as necessary to provide our services, comply with our accounting and tax obligations, and improve the user experience.</p>
<h2>Your rights</h2><p>You may request to access, modify, delete, restrict or object to the processing of your data, or withdraw your consent. Contact: <a href="mailto:hello@plumesuites.fr">hello@plumesuites.fr</a>.</p>
<h2>Cookies</h2><p>The Site uses session, persistent and third-party cookies (Google Analytics). You can manage your preferences through your browser settings.</p>
<h2>Data security</h2><p>We implement protective measures (encryption, restricted access). As no system is infallible, we cannot guarantee absolute security.</p>
<h2>Transfer outside the EU</h2><p>Some data may be stored outside the EU. We apply safeguards in line with European standards.</p>
<h2>Protection of minors</h2><p>We do not knowingly collect information about minors. Contact: hello@plumesuites.fr.</p>
<h2>Changes</h2><p>This Policy may be amended at any time. Last updated: 14/03/2025.</p>
<h2>Contact us</h2><ul><li>Plume Suites — 8 rue des Vieilles Carrières, 21410 Fleurey-sur-Ouche, France</li><li>Phone: +33 6 95 48 87 60</li><li>Email: <a href="mailto:hello@plumesuites.fr">hello@plumesuites.fr</a></li></ul>
<h2>Website hosting</h2><p>This site is hosted by <strong>Emergent Labs Inc.</strong> — 2380 Via Espada, Pleasanton, CA 94566, USA. Our channel manager, used solely for the online booking engine, is <strong>Smoobu GmbH</strong> — Pappelallee 78/79, 10437 Berlin, Germany.</p>
`;

const LegalPage = ({ variant }) => {
  const { lang } = useLang();
  const { hash } = useLocation();
  const isCgv = variant === "cgv";
  const title = isCgv
    ? { fr: "Conditions Générales de Vente", en: "Terms and Conditions of Sale" }
    : { fr: "Politique de Confidentialité", en: "Privacy Policy" };
  const html = isCgv
    ? (lang === "en" ? CGV_EN : CGV_FR)
    : (lang === "en" ? PRIVACY_EN : PRIVACY_FR);
  const heading = lang === "en" ? title.en : title.fr;

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const scroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const timer = setTimeout(scroll, 120);
    return () => clearTimeout(timer);
  }, [hash, html]);

  return (
    <div className="bg-cream text-ink" data-testid={`legal-${variant}`}>
      <Seo title={heading} path={isCgv ? "/cgv" : "/confidentialite"} noindex nofollow={false} />
      <section className="pt-36 md:pt-44 pb-16 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <p className="ps-overline text-ink/60 mb-4">— Plume Suites</p>
          <h1 className="font-serif italic text-4xl md:text-6xl font-light leading-[1]">{heading}</h1>
        </div>
      </section>
      <section className="px-6 md:px-12 pb-32">
        <div
          className="max-w-3xl mx-auto prose-legal"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
      <style>{`
        .prose-legal h2 { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1.875rem; font-weight:400; margin-top:2.5rem; margin-bottom:0.75rem; color:#3b312b; scroll-margin-top:130px; }
        .prose-legal h3 { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1.4rem; margin-top:1.5rem; margin-bottom:0.5rem; color:#3b312b; }
        .prose-legal p, .prose-legal li { font-family:'Outfit',sans-serif; font-size:0.95rem; line-height:1.7; color:rgba(59,49,43,0.85); margin-bottom:0.75rem; }
        .prose-legal ul { padding-left:1.25rem; list-style:disc; margin-bottom:1rem; }
        .prose-legal a { color:#b9785d; text-decoration:underline; }
        .prose-legal strong { font-weight:500; color:#3b312b; }
      `}</style>
    </div>
  );
};

export default LegalPage;
