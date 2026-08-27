"""Van een persoon naar een melding op zijn telefoon.

Gevraagd op 27 augustus 2026: *"Dan wil ik kunnen kiezen welke personen
meldingen ontvangen."*

## Waarom je een PERSOON kiest en geen dienst

`notify.mobile_app_iphone_van_sven` is geen naam die iemand onthoudt, en hij
verandert zodra de telefoon anders gaat heten. Een persoon is wat er in het
huishouden bestaat. De vertaling van het een naar het ander doet deze module.

## Hoe die vertaling loopt, en waarom precies zo

    person.sven
      -> attribuut `device_trackers`
      -> de tracker die van de integratie `mobile_app` komt
      -> de config entry van die tracker
      -> `entry.data["device_name"]`
      -> notify.<slugify("mobile_app_" + device_name)>

Die laatste stap is niet verzonnen: de legacy notify-laag registreert per doel
een dienst met `slugify(f"{prefix}_{name}")`
(`components/notify/legacy.py:280`), en `mobile_app` levert zijn doelen aan als
`{entry.data[ATTR_DEVICE_NAME]: webhook_id}`
(`components/mobile_app/notify.py:148`).

**De naam van het APPARAAT uit het apparatenregister wordt met opzet niet
gebruikt.** Die kun je in de interface hernoemen zonder dat de dienst meegaat,
en dan zou de melding stil bij niemand aankomen.

Wat er uitkomt wordt tot slot langs `hass.services.has_service` gehaald. Wat
daar niet doorheen komt, wordt gemeld als "niet gevonden" en niet als een
gok -- de editor toont per persoon welke dienst hij gevonden heeft, zodat de
klant het kan controleren in plaats van te moeten vertrouwen.

## Het beeld in de melding

Als ondertekende URL, geldig een week, ondertekend namens de *content user* en
niet namens degene die toevallig de kaart openhad. Een melding wordt uren later
opengeklikt, en een handtekening van een gebruiker die zich inmiddels heeft
afgemeld is dan waardeloos.

Buitenshuis heeft de telefoon een extern adres nodig (Nabu Casa, Tailscale,
eigen domein). Is dat er niet, dan gaat de melding **wel** uit maar zonder
plaatje, met een regel in het logboek. Een melding zonder foto is een melding;
geen melding is niets.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.http.auth import async_sign_path
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.network import NoURLAvailableError, get_url
from homeassistant.util import slugify

from .const import GELDIG_MELDING, URL_PREFIX

_LOGGER = logging.getLogger(__name__)

MOBILE_APP_DOMEIN = "mobile_app"
NOTIFY_DOMEIN = "notify"
NOTIFY_PREFIX = "mobile_app"
ATTR_DEVICE_TRACKERS = "device_trackers"
ATTR_DEVICE_NAME = "device_name"


@callback
def dienst_voor(hass: HomeAssistant, persoon: str) -> str | None:
    """De notify-dienst van deze persoon, of None.

    Geeft alleen de naam ná `has_service`. Een naam die niet bestaat is hier
    erger dan geen naam: hij ziet er in de editor goed uit en doet niets.
    """
    for kandidaat in _kandidaten(hass, persoon):
        if hass.services.has_service(NOTIFY_DOMEIN, kandidaat):
            return kandidaat
    return None


@callback
def _kandidaten(hass: HomeAssistant, persoon: str) -> list[str]:
    """Mogelijke dienstnamen voor deze persoon, beste eerst."""
    state = hass.states.get(persoon)
    if state is None:
        return []

    trackers = state.attributes.get(ATTR_DEVICE_TRACKERS) or []
    if not isinstance(trackers, (list, tuple)):
        return []

    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    uit: list[str] = []

    for tracker in trackers:
        entry = ent_reg.async_get(tracker)
        if entry is None or entry.platform != MOBILE_APP_DOMEIN:
            continue

        # De naam waarop de dienst geregistreerd is, uit de config entry.
        config_entry = (
            hass.config_entries.async_get_entry(entry.config_entry_id)
            if entry.config_entry_id
            else None
        )
        if config_entry and (naam := config_entry.data.get(ATTR_DEVICE_NAME)):
            _voeg_toe(uit, slugify(f"{NOTIFY_PREFIX}_{naam}"))

        # Terugval op het apparatenregister. Minder betrouwbaar (hernoemen telt
        # daar wél mee), maar beter dan niets voor wie een oude registratie
        # heeft waarin `device_name` ontbreekt.
        if entry.device_id and (apparaat := dev_reg.async_get(entry.device_id)):
            for naam in (apparaat.name, apparaat.name_by_user):
                if naam:
                    _voeg_toe(uit, slugify(f"{NOTIFY_PREFIX}_{naam}"))

    return uit


def _voeg_toe(lijst: list[str], waarde: str) -> None:
    if waarde not in lijst:
        lijst.append(waarde)


@callback
def overzicht(hass: HomeAssistant) -> list[dict[str, Any]]:
    """Alle personen met de dienst die erbij gevonden is. Voor de editor.

    Een persoon zonder dienst blijft in de lijst staan, met `dienst: null`. Hem
    verbergen zou de vraag "waarom staat mijn vrouw er niet bij" opleveren, en
    het antwoord daarop is nu juist wat de klant moet zien.
    """
    uit: list[dict[str, Any]] = []
    for state in hass.states.async_all("person"):
        uit.append(
            {
                "entity_id": state.entity_id,
                "naam": state.attributes.get("friendly_name") or state.entity_id,
                "dienst": dienst_voor(hass, state.entity_id),
                "thuis": state.state == "home",
            }
        )
    uit.sort(key=lambda p: p["naam"].lower())
    return uit


@callback
def beeld_url(hass: HomeAssistant, beeld_id: str) -> str | None:
    """Een absolute, ondertekende URL naar het beeld, of None.

    None betekent: er is geen adres waarop de telefoon dit ophaalt. Dan gaat de
    melding zonder plaatje.
    """
    pad = async_sign_path(
        hass, f"{URL_PREFIX}/{beeld_id}", GELDIG_MELDING, use_content_user=True
    )
    try:
        basis = get_url(hass, prefer_external=True)
    except NoURLAvailableError:
        _LOGGER.info(
            "Geen extern adres bekend; de melding gaat zonder beeld. Stel een "
            "externe URL in (Nabu Casa of eigen domein) om de foto mee te sturen."
        )
        return None
    return f"{basis}{pad}"


async def async_stuur(
    hass: HomeAssistant,
    *,
    ontvangers: list[str],
    diensten: dict[str, str],
    titel: str,
    tekst: str,
    beeld_id: str | None,
    camera: str,
) -> list[str]:
    """Stuur de melding. Geeft terug naar welke diensten hij is gegaan.

    Eén mislukte ontvanger houdt de andere niet tegen: als de telefoon van de
    een uitstaat, hoort de ander zijn melding gewoon te krijgen.
    """
    url = beeld_url(hass, beeld_id) if beeld_id else None

    data: dict[str, Any] = {}
    if url:
        # `image` is wat de Android-app leest, `attachment` wat iOS leest. Beide
        # meesturen kost niets en scheelt een tabel met welk toestel wat kan.
        data["image"] = url
        data["attachment"] = {"url": url, "content-type": "jpeg"}
    # Zo blijft een reeks meldingen van dezelfde camera één regel op het scherm
    # in plaats van een stapel.
    data["tag"] = f"domotiapp-{camera}"
    data["group"] = "domotiapp-bewaking"

    gelukt: list[str] = []
    for persoon in ontvangers:
        dienst = diensten.get(persoon) or dienst_voor(hass, persoon)
        if not dienst:
            _LOGGER.warning(
                "Geen notify-dienst gevonden voor %s; die krijgt geen melding", persoon
            )
            continue
        try:
            await hass.services.async_call(
                NOTIFY_DOMEIN,
                dienst,
                {"title": titel, "message": tekst, "data": data},
                blocking=True,
            )
        except Exception as fout:  # noqa: BLE001 - één telefoon mag de rest niet blokkeren
            _LOGGER.warning("Melding naar %s (%s) mislukte: %s", persoon, dienst, fout)
            continue
        gelukt.append(dienst)

    return gelukt
