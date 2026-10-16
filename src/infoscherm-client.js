/**
 * De verbinding van de infoschermkaarten met de serverkant.
 *
 * Twee kaarten praten met dezelfde commando's -- het scherm op de iPad en het
 * beheer op de pc -- en dan hoort dit op één plek. Wat hier staat is dun:
 * commando's aanroepen, het abonnement, uploaden, en een cache van
 * `blob:`-URL's voor de bestanden.
 *
 * WAAROM BLOB-URL'S EN GEEN ONDERTEKENDE URL'S
 *
 * De bewaking geeft haar beelden een ondertekende URL van twee uur mee. Voor
 * een timeline die je even openhoudt is dat prima; voor een iPad die weken
 * dezelfde pagina toont niet -- het logo zou na twee uur stil verdwijnen. Hier
 * haalt de kaart het bestand met het token van zijn eigen verbinding op en
 * zet het in een `blob:`-URL. Die verloopt nooit, en een bestand verandert
 * nooit meer nadat het is geüpload (een nieuw logo is een nieuw ID).
 *
 * HET TOKEN VERLOOPT NA EEN HALF UUR, EN DE PAGINA VERVERST HET NIET VANZELF
 *
 * Tot 0.61.0 las dit bestand `hass.auth.data.access_token` rechtstreeks. Dat
 * token is een half uur geldig; de websocket blijft daarna gewoon open (die is
 * bij het verbinden één keer ingelogd), maar een `fetch` met het oude token
 * krijgt een 401. Op een iPad die dagen dezelfde pagina toont was elk logo of
 * elke foto die na het eerste half uur werd geüpload dus onzichtbaar, en een
 * upload uit een beheerpagina die sinds de ochtend openstond mislukte. Gemeld
 * door een beheersessie op 12 oktober 2026; zie valkuil 15 voor dezelfde 401
 * bij het herladen van de config entry. `haal` gaat daarom via
 * `hass.fetchWithAuth`, die het token eerst ververst als het verlopen is.
 */

import { BlijvendAbonnement, nogNietGereed } from "./herkansing.js";

const PREFIX = "domotiapp_lovelace/infoscherm";
const URL = "/api/domotiapp_lovelace/infoscherm";

/** Zo lang wordt een bestand dat niet opgehaald kon worden met rust gelaten. */
export const RUST_NA_FOUT = 30_000;

/**
 * Een verzoek met een GELDIG token. `hass.fetchWithAuth` ververst het token
 * zelf als het verlopen is; bestaat die niet (een nagebootste `hass`), dan
 * doen we hetzelfde met de hand.
 */
export async function haal(hass, pad, init = {}) {
  if (typeof hass?.fetchWithAuth === "function") return hass.fetchWithAuth(pad, init);
  const auth = hass?.auth;
  if (auth?.expired && typeof auth.refreshAccessToken === "function") await auth.refreshAccessToken();
  const token = auth?.data?.access_token ?? auth?.accessToken ?? "";
  return fetch(pad, { ...init, headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` } });
}

const roep = (hass, type, extra = {}) => hass.connection.sendMessagePromise({ type: `${PREFIX}/${type}`, ...extra });

/** Alles wat een kaart nodig heeft: de stand, de feeds en de rechten. */
export const haalStand = (hass) => roep(hass, "get");

/**
 * Blijf op de hoogte: `cb({soort, ...})` krijgt `stand` of `feeds`. Een
 * abonnement dat een herstart van Home Assistant overleeft; zie
 * `BlijvendAbonnement` in herkansing.js voor het waarom.
 */
export class Abonnement extends BlijvendAbonnement {
  constructor(cb, opties = {}) {
    super({ type: `${PREFIX}/subscribe` }, cb, opties);
  }
}

export const zetAanwezig = (hass, persoon, aanwezig) => roep(hass, "aanwezig", { persoon, aanwezig });

/** `soort` is personen, mededelingen, verjaardagen, praktijk, scherm, indeling, installatie of instellingen. */
export const bewaar = (hass, soort, waarde) => roep(hass, `${soort}/save`, { [soort]: waarde });

/**
 * De kaartconfig van het infoscherm naar de opslag (alleen een admin). Het
 * antwoord zegt of er iets veranderd is.
 */
export const syncInstallatie = (hass, installatie) => roep(hass, "installatie/sync", { installatie });

export const verwijderBestand = (hass, bestand) => roep(hass, "bestand/verwijder", { bestand });

/* ------------------------------------------------------- de ruimtes */

/**
 * Een ruimte boeken (16 oktober 2026). Het scherm geeft ALTIJD een code mee
 * (ook een lege), het beheer nooit; zo weet de server wie er vraagt. Een
 * omschrijving telt alleen vanuit het beheer. Gooit met de fout van de server
 * (`{code, message}`): `bezet`, `verkeerde_code`, `te_vaak`, `geen_code`, ...
 */
export const boekRuimte = (hass, { ruimte, start, eind, omschrijving, code }) =>
  roep(hass, "ruimtes/boek", {
    ruimte,
    start,
    eind,
    ...(omschrijving ? { omschrijving } : {}),
    ...(code !== undefined ? { code } : {}),
  });

/** Een boeking weghalen; alleen het beheer. Bij een herhalende alleen deze keer. */
export const geefRuimteVrij = (hass, { ruimte, uid, recurrence_id }) =>
  roep(hass, "ruimtes/vrijgeven", { ruimte, uid, ...(recurrence_id ? { recurrence_id } : {}) });

/** De code om op het scherm te boeken; leeg zet het uit. Alleen het beheer. */
export const zetRuimteCode = (hass, code) => roep(hass, "ruimtes/code", { code });

/**
 * De afspraken van één agenda tussen `van` en `tot`, live: Home Assistant
 * stuurt een nieuwe lijst zodra de agenda iets wegschrijft
 * (`calendar/event/subscribe`, er sinds 2026.8). `cb` krijgt de lijst, of
 * null als de agenda hem niet kon lezen.
 *
 * Bestaat de agenda (nog) niet, dan later opnieuw: na een herstart komt de
 * Lokale agenda soms pas na het scherm.
 */
export class AgendaAbonnement extends BlijvendAbonnement {
  constructor(entity, van, tot, cb, opties = {}) {
    super(
      { type: "calendar/event/subscribe", entity_id: entity, start: van.toISOString(), end: tot.toISOString() },
      (bericht) => cb(Array.isArray(bericht?.events) ? bericht.events : null),
      { ookBij: (fout) => fout?.code === "not_found", ...opties }
    );
  }
}
export const ververFeeds = (hass) => roep(hass, "feeds/ververs");
export const haalGebruikers = (hass) => roep(hass, "gebruikers");

export { nogNietGereed };

/**
 * Eén bestand naar de server. Geeft de meta terug (`id`, `soort`, `url`, ...).
 * Gooit met een leesbare boodschap.
 */
export async function upload(hass, bestand) {
  const body = new FormData();
  body.append("bestand", bestand, bestand.name);
  const antwoord = await haal(hass, `${URL}/upload`, { method: "POST", body });
  let gegevens = null;
  try {
    gegevens = await antwoord.json();
  } catch {
    /* geen JSON: de status zegt genoeg */
  }
  if (!antwoord.ok) {
    throw new Error(gegevens?.message ?? `Home Assistant antwoordde met ${antwoord.status}`);
  }
  return gegevens;
}

/* ------------------------------------------------------- de blob-cache */

const blobs = new Map();
const mislukt = new Map();

/**
 * De `blob:`-URL van een bestand, uit de cache of vers opgehaald.
 *
 * Meerdere kaarten op één pagina delen de cache, en een tweede vraag om
 * hetzelfde ID terwijl de eerste nog loopt krijgt dezelfde belofte.
 *
 * Mislukt het, dan wordt dat niet blijvend onthouden: een kaart mag het later
 * opnieuw vragen. Maar niet meteen: het scherm tekent bij elke wijziging in
 * Home Assistant, en een bestand dat weg is zou anders bij elke lamp die
 * omgaat opnieuw opgevraagd worden. Binnen `RUST_NA_FOUT` is het antwoord
 * meteen null.
 *
 * @returns {Promise<string|null>} null als het bestand er niet (meer) is
 */
export function bestandUrl(hass, id, nu = Date.now()) {
  if (!id) return Promise.resolve(null);
  if (blobs.has(id)) return blobs.get(id);
  if (nu - (mislukt.get(id) ?? -Infinity) < RUST_NA_FOUT) return Promise.resolve(null);
  const belofte = (async () => {
    try {
      const antwoord = await haal(hass, `${URL}/bestand/${id}`);
      if (!antwoord.ok) throw new Error(String(antwoord.status));
      const url = URL_createObjectURL(await antwoord.blob());
      mislukt.delete(id);
      return url;
    } catch {
      blobs.delete(id);
      mislukt.set(id, nu);
      return null;
    }
  })();
  blobs.set(id, belofte);
  return belofte;
}

// `URL` is hierboven een tekst; de browserklasse hangt aan `globalThis`.
const URL_createObjectURL = (blob) => globalThis.URL.createObjectURL(blob);

/** Vergeet een bestand, bijvoorbeeld na verwijderen in het beheer. */
export function vergeetBestand(id) {
  const belofte = blobs.get(id);
  blobs.delete(id);
  mislukt.delete(id);
  belofte?.then((url) => url && globalThis.URL.revokeObjectURL(url));
}
