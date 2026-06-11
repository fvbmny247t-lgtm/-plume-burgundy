import React from "react";
import Seo from "../components/Seo";

const CGV_HTML = `
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
`;

const PRIVACY_HTML = `
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
<h2>Nous contacter</h2><ul><li>Plume Suites — 8 rue des Vieilles Carrières, 21410 Fleurey-sur-Ouche, France</li><li>Téléphone : 06 95 48 87 60</li><li>E-mail : <a href="mailto:hello@plumesuites.fr">hello@plumesuites.fr</a></li></ul>
<h2>Hébergement du site</h2><p>Smoobu GmbH — Pappelallee 78/79, 10437 Berlin, Allemagne — service@smoobu.com</p>
`;

const LegalPage = ({ variant }) => {
  const isCgv = variant === "cgv";
  const title = isCgv ? "Conditions Générales de Vente" : "Politique de Confidentialité";
  const html = isCgv ? CGV_HTML : PRIVACY_HTML;
  return (
    <div className="bg-cream text-ink" data-testid={`legal-${variant}`}>
      <Seo title={title} path={isCgv ? "/cgv" : "/confidentialite"} />
      <section className="pt-36 md:pt-44 pb-16 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <p className="ps-overline text-ink/60 mb-4">— Plume Suites</p>
          <h1 className="font-serif italic text-4xl md:text-6xl font-light leading-[1]">{title}</h1>
        </div>
      </section>
      <section className="px-6 md:px-12 pb-32">
        <div
          className="max-w-3xl mx-auto prose-legal"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
      <style>{`
        .prose-legal h2 { font-family:'Cormorant Garamond',serif; font-style:italic; font-size:1.875rem; font-weight:400; margin-top:2.5rem; margin-bottom:0.75rem; color:#3b312b; }
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
