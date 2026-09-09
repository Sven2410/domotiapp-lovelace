"""Uploaden en uitserveren van de bestanden van het infoscherm.

## Waarom niet HA's eigen `/api/image/upload`

Die route is er, en de fotokiezer in de editor gebruikt hem ook. Maar hij is
**alleen voor beheerders**, en de receptioniste die het logo of een
personeelsfoto plaatst is dat met opzet niet. Vandaar een eigen route, die
iedere ingelogde gebruiker mag gebruiken, behalve het kioskaccount.

## Uitserveren

Met `requires_auth = True`. De kaart haalt het bestand op met het token van
zijn verbinding en zet het in een `blob:`-URL; zo hoeft er geen handtekening
met een looptijd in het spel te komen, en dat is precies wat je wilt op een
iPad die wekenlang dezelfde pagina openhoudt.

SVG wordt met een `sandbox`-CSP uitgeserveerd: een `<script>` in een logo
draait dan nergens, ook niet als iemand de URL rechtstreeks opent.
"""

from __future__ import annotations

import logging
from typing import Any

from aiohttp import web

from homeassistant.components.http import KEY_HASS_USER, HomeAssistantView
from homeassistant.core import HomeAssistant, callback
from homeassistant.util import dt as dt_util
from homeassistant.util.ulid import ulid_now

from ..const import DOMAIN
from . import bestanden
from .const import DATA_STORE, DATA_VIEW_REGISTERED, MAX_BESTAND, URL_PREFIX
from .store import InfoFout

_LOGGER = logging.getLogger(__name__)

CACHE_HEADER = "public, max-age=31536000, immutable"


def _store(hass: HomeAssistant):
    return hass.data.get(DOMAIN, {}).get(DATA_STORE)


class UploadView(HomeAssistantView):
    """`POST /api/domotiapp_lovelace/infoscherm/upload`, multipart met `bestand`."""

    url = f"{URL_PREFIX}/upload"
    name = f"api:{DOMAIN}:infoscherm:upload"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def post(self, request: web.Request) -> web.Response:
        store = _store(self._hass)
        if store is None:
            return self.json_message("De integratie is niet geladen", 503)

        gebruiker = request.get(KEY_HASS_USER)
        if gebruiker is None or store.is_kiosk(gebruiker.id):
            return self.json_message("Dit account mag geen bestanden plaatsen", 403)

        try:
            lezer = await request.multipart()
        except (ValueError, AssertionError):
            return self.json_message("Stuur het bestand als multipart/form-data", 400)

        naam = ""
        inhoud = b""
        while (deel := await lezer.next()) is not None:
            if deel.name != "bestand":
                continue
            naam = deel.filename or ""
            inhoud = await deel.read(decode=False)
            break

        if not inhoud:
            return self.json_message("Er zat geen bestand in het verzoek", 400)
        if len(inhoud) > MAX_BESTAND:
            return self.json_message(
                f"Het bestand is groter dan {MAX_BESTAND // (1024 * 1024)} MB", 413
            )
        soort = bestanden.herken_soort(inhoud)
        if soort is None:
            return self.json_message("Alleen PNG, JPG, GIF, WebP en SVG zijn toegestaan", 415)

        bestand_id = ulid_now()
        await self._hass.async_add_executor_job(
            bestanden.bewaar, self._hass, bestand_id, soort, inhoud
        )
        meta: dict[str, Any] = {
            "naam": naam[:120],
            "soort": soort,
            "grootte": len(inhoud),
            "gemaakt": dt_util.utcnow().isoformat(),
            "door": gebruiker.name or "",
        }
        try:
            await store.async_registreer_bestand(bestand_id, meta)
        except InfoFout as fout:
            await self._hass.async_add_executor_job(
                bestanden.verwijder, self._hass, bestand_id, soort
            )
            return self.json_message(str(fout), 409)

        return self.json({"id": bestand_id, **meta, "url": f"{URL_PREFIX}/bestand/{bestand_id}"})


class BestandView(HomeAssistantView):
    """`GET /api/domotiapp_lovelace/infoscherm/bestand/<id>`."""

    url = f"{URL_PREFIX}/bestand/{{bestand_id}}"
    name = f"api:{DOMAIN}:infoscherm:bestand"
    requires_auth = True

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass

    async def get(self, request: web.Request, bestand_id: str) -> web.Response:
        store = _store(self._hass)
        if store is None or not bestanden.is_geldig_id(bestand_id):
            return web.Response(status=404)
        meta = store.bestand(bestand_id)
        if meta is None:
            return web.Response(status=404)

        inhoud = await self._hass.async_add_executor_job(
            bestanden.lees, self._hass, bestand_id, meta["soort"]
        )
        if inhoud is None:
            return web.Response(status=404)

        headers = {
            "Cache-Control": CACHE_HEADER,
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "sandbox; default-src 'none'; style-src 'unsafe-inline'",
        }
        return web.Response(
            body=inhoud, content_type=bestanden.SOORTEN[meta["soort"]], headers=headers
        )


@callback
def async_registreer(hass: HomeAssistant) -> None:
    """Meld de views aan, hooguit één keer per HA-run."""
    data = hass.data.setdefault(DOMAIN, {})
    if data.get(DATA_VIEW_REGISTERED):
        return
    hass.http.register_view(UploadView(hass))
    hass.http.register_view(BestandView(hass))
    data[DATA_VIEW_REGISTERED] = True
    _LOGGER.debug("Infoschermviews geregistreerd op %s", URL_PREFIX)
