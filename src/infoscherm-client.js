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
 */

import { nogNietGereed } from "./herkansing.js";

const PREFIX = "domotiapp_lovelace/infoscherm";
const URL = "/api/domotiapp_lovelace/infoscherm";

const token = (hass) => hass?.auth?.data?.access_token ?? hass?.auth?.accessToken ?? "";

const roep = (hass, type, extra = {}) => hass.connection.sendMessagePromise({ type: `${PREFIX}/${type}`, ...extra });

/** Alles wat een kaart nodig heeft: de stand, de feeds en de rechten. */
export const haalStand = (hass) => roep(hass, "get");

/**
 * Blijf op de hoogte. `cb({soort, ...})` krijgt `stand` of `feeds`.
 * @returns {Promise<Function>} opzeggen
 */
export const abonneer = (hass, cb) =>
  hass.connection.subscribeMessage(cb, { type: `${PREFIX}/subscribe` });

export const zetAanwezig = (hass, persoon, aanwezig) => roep(hass, "aanwezig", { persoon, aanwezig });

/** `soort` is personen, mededelingen, verjaardagen, praktijk, scherm, indeling, installatie of instellingen. */
export const bewaar = (hass, soort, waarde) => roep(hass, `${soort}/save`, { [soort]: waarde });

/**
 * De kaartconfig van het infoscherm naar de opslag (alleen een admin). Het
 * antwoord zegt of er iets veranderd is.
 */
export const syncInstallatie = (hass, installatie) => roep(hass, "installatie/sync", { installatie });

export const verwijderBestand = (hass, bestand) => roep(hass, "bestand/verwijder", { bestand });
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
  const antwoord = await fetch(`${URL}/upload`, {
    method: "POST",
    body,
    headers: { Authorization: `Bearer ${token(hass)}` },
  });
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

/**
 * De `blob:`-URL van een bestand, uit de cache of vers opgehaald.
 *
 * Meerdere kaarten op één pagina delen de cache, en een tweede vraag om
 * hetzelfde ID terwijl de eerste nog loopt krijgt dezelfde belofte.
 *
 * @returns {Promise<string|null>} null als het bestand er niet (meer) is
 */
export function bestandUrl(hass, id) {
  if (!id) return Promise.resolve(null);
  if (blobs.has(id)) return blobs.get(id);
  const belofte = (async () => {
    try {
      const antwoord = await fetch(`${URL}/bestand/${id}`, {
        headers: { Authorization: `Bearer ${token(hass)}` },
      });
      if (!antwoord.ok) throw new Error(String(antwoord.status));
      return URL_createObjectURL(await antwoord.blob());
    } catch {
      // Niet blijvend onthouden: een 401 na een verlopen token hoort de
      // volgende keer gewoon opnieuw geprobeerd te worden.
      blobs.delete(id);
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
  belofte?.then((url) => url && globalThis.URL.revokeObjectURL(url));
}
