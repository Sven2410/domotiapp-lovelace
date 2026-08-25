/**
 * Een keuzelijst die je op de regel zelf uitklapt, zonder omweg.
 *
 * Dezelfde gedachte als `tijdveld.js`, en om dezelfde reden. Een
 * `input_select` op de entiteitenkaart toonde alleen zijn huidige stand. Wilde
 * je een andere kiezen, dan moest je de regel opentikken, wachten op het venster
 * van Home Assistant, daar de lijst zoeken, kiezen en het venster weer sluiten.
 * De schuifschakelaar naast een lamp en het tijdveld naast een wekker lossen
 * precies dat op: de bediening staat waar de waarde staat. Dit is die
 * bediening, voor alles wat een lijst standen heeft.
 *
 * Hier staat alleen het rekenwerk: welke entiteit een lijst heeft, wat erin
 * staat, wat er nu gekozen is, en welke service-aanroep eruit komt als je iets
 * anders kiest. Geen DOM, geen `hass`.
 *
 * TWEE DOMEINEN, EEN VORM
 *
 *   input_select  de helper van Home Assistant. `options` in de attributen,
 *                 de gekozen stand is de toestand zelf.
 *   select        een apparaat met een keuzelijst -- een wasprogramma, een
 *                 modus op een omvormer. Zelfde attributen, andere service.
 *
 * Allebei heten hun service `select_option` met de sleutel `option`. Alleen het
 * domein verschilt, en dat is precies het soort verschil dat je een keer over
 * het hoofd ziet: `input_select.select_option` op een `select`-entiteit doet
 * niets, zonder fout op de kaart.
 *
 * WAAROM ER GEEN WACHTTIJD IN ZIT, ANDERS DAN BIJ HET TIJDVELD
 *
 * Een tijdveld meldt zich per vak -- `17112026` typen gaf acht tussenwaarden --
 * en daarom wacht dat 600ms. Een keuzelijst kent dat probleem niet: één keuze is
 * één `change`, en er bestaan geen tussenstanden om weg te filteren. Wachten zou
 * hier alleen betekenen dat de lamp een halve seconde later aangaat.
 */

/** Het domein van een entiteit, zonder iets uit ha.js nodig te hebben. */
const domeinVan = (entityId) => String(entityId ?? "").split(".")[0];

/** De domeinen die een lijst standen dragen waaruit je mag kiezen. */
export const KEUZE_DOMEINEN = new Set(["input_select", "select"]);

/**
 * Hoort hier een keuzelijst te staan?
 *
 * Op het domein, niet op de toestand: de kaart bouwt zijn DOM voordat er een
 * `hass` is, en de config kent het domein al.
 */
export const kanKiezen = (entityId) => KEUZE_DOMEINEN.has(domeinVan(entityId));

/**
 * De standen waaruit gekozen kan worden.
 *
 * Leeg als de entiteit er geen meldt. Dat gebeurt echt: een entiteit die
 * `unavailable` is, verliest zijn attributen, en een integratie die nog aan het
 * opstarten is meldt soms een lege lijst. Een lege lijst is hier een eerlijk
 * antwoord -- de kaart hoort dan zijn gewone statustekst te tonen en geen lege
 * uitklapper die nergens heen gaat.
 */
export function keuzes(st) {
  if (!st || !kanKiezen(st.entity_id)) return [];
  const opties = st.attributes?.options;
  if (!Array.isArray(opties)) return [];
  return opties.filter((o) => typeof o === "string" && o !== "");
}

/**
 * Wat er nu gekozen staat, of "" als dat niet bekend is.
 *
 * `unknown` en `unavailable` zijn geen keuze maar de afwezigheid ervan, en een
 * toestand die niet in de lijst voorkomt evenmin -- dat laatste komt voor vlak
 * nadat iemand de opties van een helper heeft aangepast. In beide gevallen is
 * "niets geselecteerd" eerlijker dan de eerste optie tonen alsof die gekozen is.
 */
export function huidigeKeuze(st, opties = keuzes(st)) {
  const s = String(st?.state ?? "");
  if (!s || s === "unknown" || s === "unavailable") return "";
  return opties.includes(s) ? s : "";
}

/**
 * De service-aanroep die deze keuze vastlegt, als `[domein, service, data]`.
 *
 * `null` bij een lege waarde of een waarde die niet in de lijst staat: een
 * keuze die de entiteit niet kent is geen opdracht maar een fout, en Home
 * Assistant weigert hem toch.
 */
export function kiesOproep(entityId, waarde, opties = []) {
  const domein = domeinVan(entityId);
  const v = String(waarde ?? "");
  if (!v || !KEUZE_DOMEINEN.has(domein)) return null;
  if (opties.length && !opties.includes(v)) return null;
  return [domein, "select_option", { entity_id: entityId, option: v }];
}
