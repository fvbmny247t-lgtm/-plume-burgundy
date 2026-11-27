# Registre des cartes cadeaux (Google Sheets)

Chaque carte vendue sur le site s'ajoute automatiquement au tableur, et sa date d'utilisation
se remplit quand la demande est marquée « traitée » dans l'administration du site.
Le statut (Active / Utilisée / Périmée) se calcule tout seul, et l'onglet « Synthèse »
donne les montants pour la comptabilité.

## Mise en place (une seule fois, environ 10 minutes)

1. **Créer le tableur** : sur Google Drive, Nouveau → Google Sheets. Nommez-le par exemple
   « Registre cartes cadeaux Plume Suites ».
2. **Ajouter le script** : dans le tableur, menu Extensions → Apps Script. Effacez le contenu
   proposé, collez tout le fichier `registre-cartes-cadeaux.gs`, puis enregistrez.
3. **Choisir le mot secret** : à la ligne `const SECRET = '...'`, remplacez le texte par une
   longue suite de lettres et chiffres (au moins 30), puis enregistrez. Gardez-la : elle servira à l'étape 6.
4. **Préparer le tableur** : en haut, choisissez la fonction `setup` puis cliquez sur Exécuter.
   Google demande d'autoriser le script sur votre compte : acceptez.
   Les onglets « Cartes » et « Synthèse » apparaissent.
5. **Publier le script** : bouton Déployer → Nouveau déploiement → type « Application web ».
   Exécuter en tant que : *moi*. Qui a accès : *tout le monde*. Déployer, puis copiez l'URL
   de l'application web (elle finit par `/exec`).
   Le mot secret empêche quiconque d'écrire dans le tableur sans le connaître.
6. **Relier le site** : dans les réglages (variables d'environnement) du site sur Emergent, ajoutez :
   - `GIFTCARD_SHEET_WEBHOOK_URL` = l'URL copiée à l'étape 5
   - `GIFTCARD_SHEET_SECRET` = le mot secret de l'étape 3

   Puis redéployez le site.

## Au quotidien

- **Vente sur le site** : une ligne s'ajoute avec le canal « Site ».
- **Carte vendue autrement** : ajoutez une ligne à la main (date, code, carte, montant, acheteur,
  « Valable jusqu'au »…) et mettez « Comptoir » ou « Téléphone » dans Canal.
  Ne tapez rien dans la colonne Statut : elle se calcule.
- **Carte utilisée** : marquez la demande « traitée » dans l'administration du site ;
  la date d'utilisation se remplit. Pour une carte saisie à la main, tapez la date vous-même.
- **Carte périmée** : le statut passe à « Périmée » le lendemain de la date de validité.

## Pour la comptabilité

L'onglet « Synthèse » donne le total vendu, le montant déjà utilisé, le reste à consommer
(cartes actives, encaissées mais pas encore consommées) et les cartes périmées sans utilisation,
ainsi qu'un tableau des ventes par mois. Le traitement comptable des cartes non utilisées
est à voir avec votre expert-comptable.

Si le tableur est injoignable, la vente n'est pas bloquée : la carte reste visible dans
l'administration du site (onglet « Vendues ») et vous recevez quand même l'email d'alerte.
