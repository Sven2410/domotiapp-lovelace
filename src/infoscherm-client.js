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

import { Herkansing, nogNietGereed } from "./herkansing.js";

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
 * abonnement dat een herstart van Home Assistant overleeft.
 *
 * WAAROM DIT EEN KLASSE IS
 *
 * Tot 0.62.2 riep een kaart bij een herverbinding gewoon opnieuw
 * `subscribeMessage` aan, en liet het daarbij. Maar vlak na een herstart kent
 * Home Assistant onze commando's nog niet (valkuil 28): het abonneren mislukte
 * met `unknown_command`, stil, en niemand probeerde het opnieuw. Gemeten op
 * 12 oktober 2026: na een herstart zei de server "3 van 8" aanwezig en het
 * scherm na anderhalve minuut nog "2 van 8". Op een iPad die 24/7 aan de muur
 * hangt kwam er daarna geen nieuws, geen mededeling en geen aanmelding meer
 * binnen, tot iemand de pagina herlaadde. De vraag die het boven bracht:
 * *"Blijven de artikelen zo staan tot je handmatig ververst? Want dat moet
 * niet het geval zijn."*
 *
 * Dus:
 * - mislukt het omdat Home Assistant nog opstart (`nogNietGereed`), dan
 *   opnieuw, met de wachttijden van `Herkansing`, en dat houdt niet op;
 * - `resubscribe: false`: de bibliotheek van Home Assistant abonneert NIET
 *   zelf opnieuw bij een herverbinding. Dat doet de kaart (`start` vanuit de
 *   hass-setter), en zo is er nooit meer dan één abonnement;
 * - een nieuwe `start` zegt het vorige abonnement eerst op.
 *
 * Toets NIET op `isConnected` van de kaart (valkuil 42): die is false terwijl
 * `wire()` draait.
 */
export class Abonnement {
  /**
   * @param {Function} cb  krijgt elk bericht
   * @param {object} [opties]  doorgegeven aan `Herkansing` (wachttijden, klok)
   */
  constructor(cb, opties = {}) {
    this.cb_ = cb;
    this.hass_ = null;
    this.opzeggen_ = null;
    this.nr_ = 0;
    this.herkansing_ = new Herkansing(() => this.start(this.hass_), opties);
  }

  /** (Opnieuw) abonneren met deze `hass`. Een vorig abonnement gaat eerst weg. */
  async start(hass) {
    this.hass_ = hass;
    this.zegOp_();
    const nr = ++this.nr_;
    if (!hass?.connection?.subscribeMessage) return;
    try {
      const opzeggen = await hass.connection.subscribeMessage(
        this.cb_,
        { type: `${PREFIX}/subscribe` },
        { resubscribe: false }
      );
      if (nr !== this.nr_) {
        stil(opzeggen);
        return;
      }
      this.opzeggen_ = opzeggen;
      this.herkansing_.herstel();
    } catch (fout) {
      if (nr === this.nr_ && nogNietGereed(fout)) this.herkansing_.plan();
    }
  }

  /** Opzeggen, en niet meer opnieuw proberen: de kaart gaat van het scherm. */
  stop() {
    this.nr_ += 1;
    this.herkansing_.stop();
    this.zegOp_();
  }

  /** Is er nu een abonnement? */
  get actief() {
    return this.opzeggen_ !== null;
  }

  zegOp_() {
    const opzeggen = this.opzeggen_;
    this.opzeggen_ = null;
    if (opzeggen) stil(opzeggen);
  }
}

/** Opzeggen mag mislukken: na een herverbinding bestaat het abonnement al niet meer. */
function stil(opzeggen) {
  try {
    Promise.resolve(opzeggen()).catch(() => {});
  } catch {
    /* verbinding al weg */
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
