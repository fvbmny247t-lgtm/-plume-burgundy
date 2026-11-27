"""Copie des cartes cadeaux dans le registre Google Sheets de Plume Suites.

Le tableur expose un petit script (Apps Script, voir docs/registre-cartes-cadeaux.gs)
publié comme application web. On lui envoie chaque vente et chaque utilisation.

Réglages (.env) :
    GIFTCARD_SHEET_WEBHOOK_URL  adresse de l'application web du script
    GIFTCARD_SHEET_SECRET       même mot secret que dans le script

Sans ces réglages, rien n'est envoyé. Un échec n'empêche jamais la vente :
il est seulement journalisé, et la carte reste dans l'administration du site.
"""
import os
import logging

import httpx

logger = logging.getLogger(__name__)


async def push(event: str, card: dict) -> None:
    url = os.environ.get("GIFTCARD_SHEET_WEBHOOK_URL", "").strip()
    secret = os.environ.get("GIFTCARD_SHEET_SECRET", "").strip()
    if not url or not secret:
        return
    carte, _, suite = (card.get("coffret_name") or "").partition(" — ")
    payload = {
        "secret": secret,
        "event": event,  # "sale" ou "redeemed"
        "code": card.get("code"),
        "purchased_at": card.get("purchased_at"),
        "carte": carte,
        "suite": suite,
        "amount": card.get("amount"),
        "first_name": card.get("buyer_first_name") or "",
        "last_name": card.get("buyer_last_name") or card.get("buyer_name") or "",
        "email": card.get("buyer_email") or "",
        "phone": card.get("buyer_phone") or "",
        "recipient": card.get("recipient_name") or "",
        "message": card.get("message") or "",
        "expires_at": card.get("expires_at"),
        "redeemed_at": card.get("redeemed_at"),
    }
    try:
        # Apps Script répond par une redirection vers le résultat : il faut la suivre.
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            r = await client.post(url, json=payload)
        if r.status_code >= 400 or '"ok":true' not in r.text.replace(" ", ""):
            logger.error("gift card sheet sync %s refused: %s %s", event, r.status_code, r.text[:200])
    except Exception as e:  # noqa: BLE001
        logger.error("gift card sheet sync %s failed: %s", event, e)
