/**
 * Registre des cartes cadeaux Plume Suites (Google Sheets).
 *
 * Le site envoie ici chaque carte vendue et chaque carte utilisée.
 * Les cartes vendues autrement (au comptoir, par téléphone…) se saisissent à la main
 * dans l'onglet « Cartes » : le statut et la synthèse se calculent pareil.
 *
 * Mise en place : voir docs/registre-cartes-cadeaux.md
 */

// Mot secret partagé avec le site (réglage GIFTCARD_SHEET_SECRET dans Emergent).
// Remplacez-le par une longue suite de lettres et chiffres, la même des deux côtés.
const SECRET = 'A_REMPLACER_PAR_UN_MOT_SECRET';

const HEADERS = [
  "Date d'achat", 'Code', 'Carte', 'Suite', 'Montant (€)',
  'Prénom', 'Nom', 'Email', 'Téléphone', 'Bénéficiaire', 'Message',
  "Valable jusqu'au", "Date d'utilisation", 'Statut', 'Canal', 'Notes',
];
const COL = { code: 2, used: 13, status: 14, canal: 15 };

/** À lancer une seule fois : crée les onglets, les en-têtes et les calculs. */
function setup() {
  const ss = SpreadsheetApp.getActive();
  const sh = ss.getSheetByName('Cartes') || ss.insertSheet('Cartes');
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#f5f1ea');
  sh.setFrozenRows(1);
  // Statut calculé pour toutes les lignes, y compris celles saisies à la main.
  // (syntaxe anglaise imposée par Apps Script : virgule entre arguments, point-virgule entre lignes)
  sh.getRange(1, COL.status).setFormula(
    '={"Statut";ARRAYFORMULA(IF(B2:B="","",IF(M2:M<>"","Utilisée",IF(L2:L<TODAY(),"Périmée","Active"))))}'
  );
  sh.getRange('A2:A').setNumberFormat('dd/mm/yyyy');
  sh.getRange('L2:M').setNumberFormat('dd/mm/yyyy');
  sh.getRange('E2:E').setNumberFormat('#,##0.00 €');
  sh.setColumnWidths(1, HEADERS.length, 130);

  const sy = ss.getSheetByName('Synthèse') || ss.insertSheet('Synthèse');
  sy.clear();
  sy.getRange('A1').setValue('Cartes cadeaux : synthèse').setFontWeight('bold').setFontSize(14);
  const rows = [
    ['Cartes vendues (nombre)', '=COUNTA(Cartes!B2:B)'],
    ['Montant total vendu', '=SUM(Cartes!E2:E)'],
    ['Cartes utilisées (montant)', '=SUMIF(Cartes!N2:N,"Utilisée",Cartes!E2:E)'],
    ['Cartes actives : reste à consommer', '=SUMIF(Cartes!N2:N,"Active",Cartes!E2:E)'],
    ['Cartes périmées sans utilisation', '=SUMIF(Cartes!N2:N,"Périmée",Cartes!E2:E)'],
  ];
  sy.getRange(3, 1, rows.length, 2).setValues(rows);
  sy.getRange('B4:B7').setNumberFormat('#,##0.00 €');
  sy.getRange('A10').setValue('Ventes par mois').setFontWeight('bold');
  sy.getRange('A11').setFormula(
    '=QUERY(Cartes!A2:E,"select year(A), month(A)+1, count(B), sum(E) where B is not null ' +
    'group by year(A), month(A)+1 label year(A) \'Année\', month(A)+1 \'Mois\', count(B) \'Cartes\', sum(E) \'Montant\'",0)'
  );
  sy.setColumnWidth(1, 280);
}

/** Reçoit les envois du site. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (data.secret !== SECRET) return reply({ ok: false, error: 'secret' });
    const sh = SpreadsheetApp.getActive().getSheetByName('Cartes');
    if (!sh) return reply({ ok: false, error: 'setup' });
    const row = findRow(sh, data.code);

    if (data.event === 'sale') {
      if (row) return reply({ ok: true, duplicate: true }); // déjà enregistrée
      const r = sh.getLastRow() + 1;
      sh.getRange(r, 1, 1, 13).setValues([[
        toDate(data.purchased_at), data.code, data.carte, data.suite, Number(data.amount) || 0,
        data.first_name, data.last_name, data.email, data.phone, data.recipient, data.message,
        toDate(data.expires_at), '',
      ]]);
      sh.getRange(r, COL.canal).setValue('Site');
      return reply({ ok: true });
    }

    if (data.event === 'redeemed') {
      if (!row) return reply({ ok: false, error: 'code introuvable' });
      sh.getRange(row, COL.used).setValue(toDate(data.redeemed_at) || new Date());
      return reply({ ok: true });
    }
    return reply({ ok: false, error: 'event' });
  } finally {
    lock.releaseLock();
  }
}

function findRow(sh, code) {
  if (!code || sh.getLastRow() < 2) return 0;
  const codes = sh.getRange(2, COL.code, sh.getLastRow() - 1, 1).getValues();
  for (let i = 0; i < codes.length; i++) if (String(codes[i][0]).trim() === code) return i + 2;
  return 0;
}

function toDate(iso) {
  return iso ? new Date(iso) : '';
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
