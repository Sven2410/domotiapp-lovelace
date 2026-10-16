"""De commando's van het infoscherm, en het abonnement dat elk open scherm bijwerkt.

| Commando | Wie |
|---|---|
| `infoscherm/get` | iedere ingelogde gebruiker |
| `infoscherm/subscribe` | iedere ingelogde gebruiker |
| `infoscherm/aanwezig` | iedere ingelogde gebruiker, ook kiosk |
| `infoscherm/personen/save` | iedereen behalve kiosk |
| `infoscherm/mededelingen/save` | idem |
| `infoscherm/verjaardagen/save` | idem |
| `infoscherm/praktijk/save` | idem (alleen nog de openingstijden) |
| `infoscherm/scherm/save` | idem (logo, accent, uiterlijk, terugvaltijd, ...) |
| `infoscherm/indeling/save` | idem (de blokken op het welkomscherm) |
| `infoscherm/installatie/save` | idem; de ENTITEITEN erin alleen als admin, de lampnamen mag iedereen |
| `infoscherm/installatie/sync` | alleen admin: de infoschermkaart stuurt zijn kaartconfig (weer, energie, lampen, agenda's, kioskaccounts) |
| `infoscherm/instellingen/save` | idem; `kiosk_gebruikers` erin alleen als admin |
| `infoscherm/bestand/verwijder` | idem |
| `infoscherm/feeds/ververs` | idem |
| `infoscherm/gebruikers` | alleen admin |
| `infoscherm/ruimtes/boek` | iedere ingelogde gebruiker; een kioskaccount alleen met de code |
| `infoscherm/ruimtes/vrijgeven` | iedereen behalve kiosk |
| `infoscherm/ruimtes/code` | iedereen behalve kiosk |
| `infoscherm/ruimtes/nieuw` | iedereen behalve kiosk: maakt een Lokale agenda, ook zonder adminrecht |
| `infoscherm/ruimtes/weg` | iedereen behalve kiosk, alleen voor een ruimte die het beheer maakte |

Zie `const.py` voor waarom de grens niet bij HA's adminvlag ligt maar bij het
kioskaccount. Een kioskaccount dat toch een beheercommando stuurt krijgt
`unauthorized`; de kaart op de iPad toont dat beheer niet eens.

De code om een ruimte te boeken zit NIET in de stand, want die gaat ook naar
de iPad. `infoscherm/get` geeft hem alleen aan wie mag beheren
(`ruimte_code`); zie `ruimtes.py`.

Na elke wijziging gaat de HELE stand naar elke abonnee. Hij is klein (tekst en
een paar ID's), en het scheelt een kaart die per soort wijziging iets anders
moet samenvoegen -- op een iPad die wekenlang aanstaat is "gooi weg en teken
opnieuw" de vorm die niet uit de pas kan lopen.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv

from ..const import DOMAIN
from . import bestanden
from .const import (
    DATA_ABONNEES,
    DATA_FEEDS,
    DATA_RUIMTES,
    DATA_STORE,
    DATA_WS_REGISTERED,
    EVENT_FEEDS,
    EVENT_STAND,
)
from .ruimtes import RuimteFout
from .store import InfoFout

_LOGGER = logging.getLogger(__name__)


@callback
def async_register(hass: HomeAssistant) -> None:
    data = hass.data.setdefault(DOMAIN, {})
    if data.get(DATA_WS_REGISTERED):
        return
    for commando in (
        ws_get,
        ws_subscribe,
        ws_aanwezig,
        ws_personen_save,
        ws_mededelingen_save,
        ws_verjaardagen_save,
        ws_praktijk_save,
        ws_scherm_save,
        ws_indeling_save,
        ws_installatie_save,
        ws_installatie_sync,
        ws_instellingen_save,
        ws_bestand_verwijder,
        ws_feeds_ververs,
        ws_gebruikers,
        ws_ruimte_boek,
        ws_ruimte_vrijgeven,
        ws_ruimte_code,
        ws_ruimte_nieuw,
        ws_ruimte_weg,
    ):
        websocket_api.async_register_command(hass, commando)
    data[DATA_WS_REGISTERED] = True
    _LOGGER.debug("Infoschermcommando's geregistreerd")


# --------------------------------------------------------------------------
# Abonnees
# --------------------------------------------------------------------------


@callback
def async_meld_stand(hass: HomeAssistant) -> None:
    """De nieuwe stand naar elk open scherm en elk open beheer."""
    store = hass.data.get(DOMAIN, {}).get(DATA_STORE)
    if store is None:
        return
    _stuur(hass, {"soort": EVENT_STAND, "stand": store.snapshot()})


@callback
def async_meld_feeds(hass: HomeAssistant) -> None:
    lezer = hass.data.get(DOMAIN, {}).get(DATA_FEEDS)
    if lezer is None:
        return
    _stuur(hass, {"soort": EVENT_FEEDS, "feeds": lezer.items(), "feed_fouten": lezer.fouten()})


@callback
def _stuur(hass: HomeAssistant, bericht: dict[str, Any]) -> None:
    for connection, msg_id in list(hass.data.get(DOMAIN, {}).get(DATA_ABONNEES) or []):
        connection.send_message(websocket_api.event_message(msg_id, bericht))


# --------------------------------------------------------------------------
# Hulp
# --------------------------------------------------------------------------


def _store(hass: HomeAssistant, connection, msg):
    store = hass.data.get(DOMAIN, {}).get(DATA_STORE)
    if store is None:
        connection.send_error(msg["id"], "not_loaded", "De integratie is niet geladen")
    return store


def _mag_beheren(store, connection) -> bool:
    gebruiker = connection.user
    return gebruiker is not None and not store.is_kiosk(gebruiker.id)


def _beheer(hass: HomeAssistant, connection, msg):
    """De store, of None nadat er al een fout is gestuurd."""
    store = _store(hass, connection, msg)
    if store is None:
        return None
    if not _mag_beheren(store, connection):
        connection.send_error(
            msg["id"], websocket_api.ERR_UNAUTHORIZED, "Dit account mag het infoscherm niet beheren"
        )
        return None
    return store


def _rechten(store, connection) -> dict[str, Any]:
    gebruiker = connection.user
    return {
        "mag_beheren": _mag_beheren(store, connection),
        "is_admin": bool(gebruiker and gebruiker.is_admin),
        "gebruiker": gebruiker.id if gebruiker else None,
    }


# --------------------------------------------------------------------------
# Lezen
# --------------------------------------------------------------------------


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/infoscherm/get"})
@callback
def ws_get(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    store = _store(hass, connection, msg)
    if store is None:
        return
    lezer = hass.data.get(DOMAIN, {}).get(DATA_FEEDS)
    rechten = _rechten(store, connection)
    connection.send_result(
        msg["id"],
        {
            "stand": store.snapshot(),
            "feeds": lezer.items() if lezer else [],
            "feed_fouten": lezer.fouten() if lezer else {},
            **rechten,
            # Alleen voor wie mag beheren; de iPad krijgt hem nooit.
            **({"ruimte_code": store.ruimte_code} if rechten["mag_beheren"] else {}),
        },
    )


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/infoscherm/subscribe"})
@callback
def ws_subscribe(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    data = hass.data.setdefault(DOMAIN, {})
    abonnees = data.setdefault(DATA_ABONNEES, [])
    inschrijving = (connection, msg["id"])
    abonnees.append(inschrijving)

    @callback
    def opzeggen() -> None:
        try:
            abonnees.remove(inschrijving)
        except ValueError:
            pass

    connection.subscriptions[msg["id"]] = opzeggen
    connection.send_result(msg["id"])


# --------------------------------------------------------------------------
# Het scherm
# --------------------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/infoscherm/aanwezig",
        vol.Required("persoon"): cv.string,
        vol.Required("aanwezig"): bool,
    }
)
@websocket_api.async_response
async def ws_aanwezig(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Eén persoon aan- of afmelden. Ook het kioskaccount mag dit."""
    store = _store(hass, connection, msg)
    if store is None:
        return
    persoon = await store.async_zet_aanwezig(msg["persoon"], msg["aanwezig"])
    if persoon is None:
        connection.send_error(msg["id"], "not_found", "Deze persoon staat niet (meer) in de lijst")
        return
    async_meld_stand(hass)
    connection.send_result(msg["id"], {"persoon": persoon})


# --------------------------------------------------------------------------
# Het beheer
# --------------------------------------------------------------------------


async def _zet(hass, connection, msg, sleutel, zetter) -> None:
    store = _beheer(hass, connection, msg)
    if store is None:
        return
    try:
        resultaat = await zetter(store, msg[sleutel])
    except InfoFout as fout:
        connection.send_error(msg["id"], "invalid_format", str(fout))
        return
    async_meld_stand(hass)
    connection.send_result(msg["id"], {sleutel: resultaat})


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/personen/save", vol.Required("personen"): list}
)
@websocket_api.async_response
async def ws_personen_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    await _zet(hass, connection, msg, "personen", lambda s, v: s.async_zet_personen(v))


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/infoscherm/mededelingen/save",
        vol.Required("mededelingen"): list,
    }
)
@websocket_api.async_response
async def ws_mededelingen_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    await _zet(hass, connection, msg, "mededelingen", lambda s, v: s.async_zet_mededelingen(v))


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/infoscherm/verjaardagen/save",
        vol.Required("verjaardagen"): list,
    }
)
@websocket_api.async_response
async def ws_verjaardagen_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    await _zet(hass, connection, msg, "verjaardagen", lambda s, v: s.async_zet_verjaardagen(v))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/praktijk/save", vol.Required("praktijk"): dict}
)
@websocket_api.async_response
async def ws_praktijk_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    await _zet(hass, connection, msg, "praktijk", lambda s, v: s.async_zet_praktijk(v))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/scherm/save", vol.Required("scherm"): dict}
)
@websocket_api.async_response
async def ws_scherm_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    await _zet(hass, connection, msg, "scherm", lambda s, v: s.async_zet_scherm(v))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/indeling/save", vol.Required("indeling"): dict}
)
@websocket_api.async_response
async def ws_indeling_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    await _zet(hass, connection, msg, "indeling", lambda s, v: s.async_zet_indeling(v))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/installatie/save", vol.Required("installatie"): dict}
)
@websocket_api.async_response
async def ws_installatie_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Weer, agenda's en lampen. De entiteiten kiest de installateur (admin);
    een receptie-account mag alleen de namen van de lampen wijzigen."""
    is_admin = bool(connection.user and connection.user.is_admin)
    await _zet(
        hass,
        connection,
        msg,
        "installatie",
        lambda s, v: s.async_zet_installatie(v, mag_entiteiten_wijzigen=is_admin),
    )


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/installatie/sync", vol.Required("installatie"): dict}
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_installatie_sync(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """De infoschermkaart stuurt wat er in zijn kaartconfig staat (ronde 3).

    Alleen een admin, want alleen een admin kan die config gemaakt hebben; het
    kioskaccount op de iPad ziet dezelfde kaart en stuurt niets. Een stand
    gaat alleen rond als er echt iets veranderd is, anders zou elke
    paginalading van een beheerder alle schermen laten hertekenen."""
    store = _store(hass, connection, msg)
    if store is None:
        return
    try:
        resultaat = await store.async_zet_installatie_van_kaart(msg["installatie"])
    except InfoFout as fout:
        connection.send_error(msg["id"], "invalid_format", str(fout))
        return
    if resultaat["gewijzigd"]:
        async_meld_stand(hass)
    connection.send_result(msg["id"], resultaat)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/infoscherm/instellingen/save",
        vol.Required("instellingen"): dict,
    }
)
@websocket_api.async_response
async def ws_instellingen_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Instellingen. Wie de kioskaccounts zijn mag alleen een admin bepalen:
    anders kan een receptie-account zichzelf en het kiosk-account omwisselen."""
    is_admin = bool(connection.user and connection.user.is_admin)

    async def zetter(store, waarde):
        resultaat = await store.async_zet_instellingen(waarde, mag_kiosk_wijzigen=is_admin)
        if (lezer := hass.data.get(DOMAIN, {}).get(DATA_FEEDS)) is not None:
            hass.async_create_background_task(lezer.async_ververs(), "infoscherm feeds")
        return resultaat

    await _zet(hass, connection, msg, "instellingen", zetter)


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/bestand/verwijder", vol.Required("bestand"): cv.string}
)
@websocket_api.async_response
async def ws_bestand_verwijder(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    store = _beheer(hass, connection, msg)
    if store is None:
        return
    bestand_id = msg["bestand"]
    if not bestanden.is_geldig_id(bestand_id):
        connection.send_error(msg["id"], "invalid_format", "Dat is geen bestands-ID")
        return
    meta = await store.async_vergeet_bestand(bestand_id)
    if meta is not None:
        await hass.async_add_executor_job(bestanden.verwijder, hass, bestand_id, meta["soort"])
    async_meld_stand(hass)
    connection.send_result(msg["id"], {"verwijderd": meta is not None})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/infoscherm/feeds/ververs"})
@websocket_api.async_response
async def ws_feeds_ververs(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Nu ophalen in plaats van over een kwartier, na het invullen van een bron."""
    store = _beheer(hass, connection, msg)
    if store is None:
        return
    lezer = hass.data.get(DOMAIN, {}).get(DATA_FEEDS)
    if lezer is not None:
        await lezer.async_ververs()
    connection.send_result(
        msg["id"],
        {"feeds": lezer.items() if lezer else [], "feed_fouten": lezer.fouten() if lezer else {}},
    )


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/infoscherm/gebruikers"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_gebruikers(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """De accounts waaruit een admin de kioskaccounts kiest."""
    gebruikers = await hass.auth.async_get_users()
    connection.send_result(
        msg["id"],
        {
            "gebruikers": [
                {"id": g.id, "naam": g.name or g.id, "is_admin": g.is_admin}
                for g in gebruikers
                if g.is_active and not g.system_generated
            ]
        },
    )


# --------------------------------------------------------------------------
# Ruimtes (16 oktober 2026)
# --------------------------------------------------------------------------


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/infoscherm/ruimtes/boek",
        vol.Required("ruimte"): cv.entity_id,
        vol.Required("start"): cv.string,
        vol.Required("eind"): cv.string,
        vol.Optional("omschrijving"): vol.Any(cv.string, None),
        vol.Optional("code"): vol.Any(cv.string, None),
    }
)
@websocket_api.async_response
async def ws_ruimte_boek(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Een ruimte boeken. Het scherm stuurt altijd een code mee, het beheer
    niet; een kioskaccount zonder code krijgt `geen_code`."""
    store = _store(hass, connection, msg)
    if store is None:
        return
    ruimtes = hass.data[DOMAIN][DATA_RUIMTES]
    gebruiker = connection.user
    op_scherm = "code" in msg or not _mag_beheren(store, connection)
    try:
        if op_scherm:
            ruimtes.controleer_code(gebruiker.id if gebruiker else "", msg.get("code"))
        resultaat = await ruimtes.async_boek(
            ruimte=msg["ruimte"],
            start=msg["start"],
            eind=msg["eind"],
            # Op het scherm is er geen veld voor; wat er toch meekomt telt niet.
            titel=None if op_scherm else msg.get("omschrijving"),
            op_scherm=op_scherm,
            door=(gebruiker.name or "") if gebruiker else "",
        )
    except RuimteFout as fout:
        connection.send_error(msg["id"], fout.code, str(fout))
        return
    connection.send_result(msg["id"], resultaat)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/infoscherm/ruimtes/vrijgeven",
        vol.Required("ruimte"): cv.entity_id,
        vol.Required("uid"): cv.string,
        vol.Optional("recurrence_id"): vol.Any(cv.string, None),
    }
)
@websocket_api.async_response
async def ws_ruimte_vrijgeven(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Een boeking weghalen. Alleen in het beheer."""
    store = _beheer(hass, connection, msg)
    if store is None:
        return
    try:
        await hass.data[DOMAIN][DATA_RUIMTES].async_vrijgeven(
            ruimte=msg["ruimte"], uid=msg["uid"], recurrence_id=msg.get("recurrence_id")
        )
    except RuimteFout as fout:
        connection.send_error(msg["id"], fout.code, str(fout))
        return
    connection.send_result(msg["id"], {"vrijgegeven": True})


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/ruimtes/code", vol.Required("code"): vol.Any(str, None)}
)
@websocket_api.async_response
async def ws_ruimte_code(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """De code om op het scherm te boeken. Leeg zet boeken op het scherm uit.
    De stand gaat rond, want `boeken_op_scherm` kan veranderd zijn."""
    await _zet(hass, connection, msg, "code", lambda s, v: s.async_zet_ruimte_code(v))


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/ruimtes/nieuw", vol.Required("naam"): cv.string}
)
@websocket_api.async_response
async def ws_ruimte_nieuw(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Een ruimte maken, met een eigen Lokale agenda. Ook voor een receptie
    zonder adminrecht: zie de kop van ruimtes.py."""
    store = _beheer(hass, connection, msg)
    if store is None:
        return
    try:
        resultaat = await hass.data[DOMAIN][DATA_RUIMTES].async_nieuw(msg["naam"])
    except RuimteFout as fout:
        connection.send_error(msg["id"], fout.code, str(fout))
        return
    async_meld_stand(hass)
    connection.send_result(msg["id"], resultaat)


@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/infoscherm/ruimtes/weg", vol.Required("ruimte"): cv.entity_id}
)
@websocket_api.async_response
async def ws_ruimte_weg(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    """Een ruimte die het beheer maakte weghalen, met zijn agenda."""
    store = _beheer(hass, connection, msg)
    if store is None:
        return
    try:
        resultaat = await hass.data[DOMAIN][DATA_RUIMTES].async_weg(msg["ruimte"])
    except RuimteFout as fout:
        connection.send_error(msg["id"], fout.code, str(fout))
        return
    async_meld_stand(hass)
    connection.send_result(msg["id"], resultaat)
