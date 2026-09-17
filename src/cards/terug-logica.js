/**
 * Het rekenwerk van de terugkaart, los van het element.
 *
 * Twee redenen dat dit een eigen bestand is. De eerste is valkuil 27: een
 * bestand dat `base.js` importeert trekt `class ... extends HTMLElement` mee en
 * dat gooit een gewone Node-test om. De tweede is dat allebei deze functies een
 * VAL bevatten die je in een browser niet ziet gebeuren -- zie hieronder.
 */

/**
 * Waar de knop binnen de kaart staat.
 *
 * De val: een onbekende of ontbrekende waarde mag NOOIT als lege string terug
 * komen. `justify-content: ` (leeg) is een ongeldige verklaring, de browser
 * negeert hem zonder een woord, en dan valt de knop terug op de standaard van
 * flex -- die toevallig ook links is. Het werkt dus, totdat iemand de standaard
 * verandert. Dit geeft altijd een echte waarde terug.
 *
 * En de sleutels zijn Nederlands omdat ze in de YAML van de eigenaar belanden.
 * `align: midden` is te lezen; `align: center` zou het enige Engelse woord in
 * een verder Nederlandse configuratie zijn.
 */
const UITLIJNING = { links: "flex-start", midden: "center", rechts: "flex-end" };

export function uitlijning(align) {
  return UITLIJNING[align] ?? UITLIJNING.links;
}

/** De keuzes die de editor aanbiedt, in deze volgorde. */
export function uitlijningen() {
  return Object.keys(UITLIJNING);
}

/**
 * Wat er in de tooltip staat.
 *
 * De val: een knop zonder tekst is alleen een pijltje, en een pijltje zonder
 * tooltip zegt een schermlezer niets. Daarom is er ALTIJD een tekst, ook als er
 * niets is ingevuld.
 *
 * De volgorde is die van het meest naar het minst specifieke: staat er een
 * eigen tekst, dan is dat wat hij bedoelt; staat er alleen een pad, dan is het
 * pad het enige wat er over de knop te zeggen valt; anders is het gewoon terug.
 */
export function terugTitel(config) {
  const label = String(config?.label ?? "").trim();
  if (label) return label;
  const pad = String(config?.path ?? "").trim();
  return pad ? `Naar ${pad}` : "Terug";
}
