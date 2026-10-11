/**
 * De kaarten die met DomotiApp Coach samenwerken: het apparaat vinden, en wat
 * erbij hoort.
 *
 * Sinds coach v0.110.0 (contract 1, afgesproken op 11 oktober 2026) maakt de
 * coach per apparaat een eigen apparaat in Home Assistant, met gewone
 * entiteiten eraan: een sensor die zegt wat de coach van plan is, en knoppen en
 * schakelaars om hem bij te sturen. Geen websocket van de coach: een kaart in
 * een pop-up moet ook werken voor een bewoner, in een automatisering en in een
 * bubble-card zonder eigen code.
 *
 * HOE DE KAART ZIJN ENTITEITEN VINDT
 *
 * In de editor kies je het APPARAAT. Welke entiteit welke rol heeft, staat in
 * de `translation_key` -- een vaste sleutel van de coach, die niet verandert als
 * de klant een entiteit hernoemt. Home Assistant geeft die mee aan de frontend
 * (`hass.entities[id].translation_key`, gemeten in 2026.8 op 11 oktober 2026),
 * samen met `device_id` en `platform`.
 *
 * DE TOESTAND IS VOOR MENSEN
 *
 * Valkuil 67: de vaatwasserkaart is gebouwd tegen een coach waar de toestand
 * een tijdstip was, en zag niets meer toen dat een dag later tekst werd. Het
 * contract is daarom: de toestand mag veranderen, de attributen niet. Deze
 * kaarten lezen alleen attributen, en `contract` zegt welke afspraak er geldt.
 *
 * HET CONTRACT IS VAN TWEE KANTEN
 *
 * De eigenaar op 11 oktober 2026: "wanneer er iets bij komt in de coach wat
 * invloed heeft op de lovelace kaart, dat dat goed opgepakt wordt." De coach
 * heeft zijn kant vastgelegd (CLAUDE.md van domotiapp-coach, "Wat gelijk moet
 * blijven"): niets hernoemen of weghalen wat een kaart leest, toevoegen mag,
 * en anders gaat `contract` omhoog. Deze kant:
 *
 * - Een kaart leest NOOIT de tekst van een toestand om iets te beslissen. Tonen
 *   mag; kiezen gebeurt op attributen en vaste sleutels.
 * - Heeft een kaart meer nodig dan contract 1 biedt, dan wordt het eerst aan
 *   de coach-sessie gevraagd, en niet zelf afgeleid of geraden.
 * - Er wordt niets uitgebracht dat een nieuw attribuut leest voordat het in een
 *   echte dump van de coach gezien is.
 * - Een `contract` dat hoger is dan `COACH_CONTRACT` is geen fout: toevoegen
 *   mag. Een lager contract (of geen) is een coach die bijgewerkt moet worden.
 *
 * Geen DOM: dit hoort in een gewone Node-test.
 */

/** Zo heet de coach als fabrikant van zijn apparaten. */
export const COACH_FABRIKANT = "DomotiApp Coach";

/** Het domein van de integratie, zoals het in `hass.entities[id].platform` staat. */
export const COACH_PLATFORM = "domotiapp_coach";

/** De afspraak waar deze kaarten tegen gebouwd zijn. */
export const COACH_CONTRACT = 1;

/** De soorten met een programma, als `model` van het apparaat. */
export const PROGRAMMA_MODELLEN = ["Vaatwasser", "Wasmachine", "Droger"];

/**
 * De apparaten van de coach met een van deze modellen, op naam gesorteerd.
 *
 * @param {object} hass
 * @param {string[]} modellen
 * @returns {{id: string, naam: string, model: string}[]}
 */
export function coachApparaten(hass, modellen) {
  const lijst = [];
  for (const [id, d] of Object.entries(hass?.devices ?? {})) {
    if (d?.manufacturer !== COACH_FABRIKANT || !modellen.includes(d?.model)) continue;
    lijst.push({ id, naam: d.name_by_user || d.name || id, model: d.model });
  }
  return lijst.sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
}

/**
 * Welk apparaat de kaart volgt.
 *
 * Gekozen in de editor gaat voor, ook als het er (nog) niet is: dan zegt de
 * kaart dat, in plaats van stil een ander apparaat te pakken. Niets gekozen:
 * het enige apparaat van het VOORKEURSMODEL (een vaatwasserkaart pakt de
 * vaatwasser, ook als er een wasmachine naast staat), anders het enige van de
 * hele lijst. Zijn er meer, dan moet de klant kiezen.
 *
 * @param {object} hass
 * @param {string} gekozen het apparaat uit de editor, of ""
 * @param {string[]} modellen welke modellen deze kaart kan volgen
 * @param {string} voorkeur het model dat bij deze kaart hoort
 * @returns {{id: string|null, reden: "gekozen"|"weg"|"enige"|"geen"|"meerdere"}}
 */
export function kiesApparaat(hass, gekozen, modellen, voorkeur = modellen[0]) {
  if (gekozen) {
    return { id: gekozen, reden: hass?.devices?.[gekozen] ? "gekozen" : "weg" };
  }
  const alle = coachApparaten(hass, modellen);
  const eigen = alle.filter((a) => a.model === voorkeur);
  if (eigen.length === 1) return { id: eigen[0].id, reden: "enige" };
  if (!eigen.length && alle.length === 1) return { id: alle[0].id, reden: "enige" };
  return { id: null, reden: alle.length ? "meerdere" : "geen" };
}

/**
 * De entiteiten van dit coach-apparaat, per rol: `{start: "sensor.x", ...}`.
 *
 * Alleen entiteiten van de coach zelf (`platform`): een klant kan een eigen
 * entiteit aan hetzelfde apparaat hangen, en die heeft geen rol. Zonder
 * `translation_key` is het een coach van vóór contract 1; die levert niets op.
 * Staan er twee met dezelfde sleutel, dan wint de eerste op entity_id -- zo
 * geeft dezelfde invoer altijd dezelfde uitkomst.
 *
 * @param {object} hass
 * @param {string|null} deviceId
 * @returns {Record<string, string>}
 */
export function coachRollen(hass, deviceId) {
  if (!deviceId) return {};
  const rollen = {};
  const ids = Object.keys(hass?.entities ?? {}).sort();
  for (const id of ids) {
    const e = hass.entities[id];
    if (e?.device_id !== deviceId || e.platform !== COACH_PLATFORM || !e.translation_key) continue;
    if (!(e.translation_key in rollen)) rollen[e.translation_key] = id;
  }
  return rollen;
}

/**
 * Het contract van een coach-sensor, of 0 als er geen is.
 *
 * 0 betekent een coach van vóór v0.110.0: de sensor bestaat misschien wel, maar
 * zijn attributen zijn niet afgesproken.
 */
export function contractVan(st) {
  const n = Number(st?.attributes?.contract);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

/**
 * De entiteiten van de klant zelf, zoals hij ze bij de coach invulde.
 *
 * De coach zet ze in het attribuut `entiteiten` van zijn sensor (een lege
 * weggelaten). Alleen tekst die op een entity_id lijkt telt: wat er verder in
 * staat is geen entiteit om aan te roepen.
 *
 * @param {object|null} st de state van de coach-sensor
 * @returns {Record<string, string>}
 */
export function klantEntiteiten(st) {
  const ruw = st?.attributes?.entiteiten;
  if (!ruw || typeof ruw !== "object") return {};
  const uit = {};
  for (const [sleutel, waarde] of Object.entries(ruw)) {
    if (typeof waarde === "string" && /^[a-z_]+\.[a-z0-9_]+$/.test(waarde)) uit[sleutel] = waarde;
  }
  return uit;
}

/**
 * Wat de kaart zegt als de coach aan staat en er toch niets te volgen is, of "".
 *
 * Zonder deze zin blijft de rij met knoppen gewoon leeg, en dan lijkt de kaart
 * kapot terwijl er een coach van vóór v0.110.0 draait.
 *
 * @param {{reden: string}} keuze uit `kiesApparaat()`
 * @param {number} contract uit `contractVan()` op de startsensor
 * @param {string} [versie] de coach die deze kaart nodig heeft (laadpaal en batterij: 0.112.1)
 */
export function coachMelding(keuze, contract, versie = "0.110.0") {
  if (keuze.reden === "geen") return `Geen apparaat van DomotiApp Coach gevonden. Daarvoor is coach ${versie} of nieuwer nodig.`;
  if (keuze.reden === "meerdere") return "Kies in de editor welk apparaat van de coach deze kaart volgt.";
  if (keuze.reden === "weg") return "Het gekozen apparaat van de coach bestaat niet meer.";
  if (!contract) return `Werk DomotiApp Coach bij naar ${versie} of nieuwer.`;
  return "";
}
