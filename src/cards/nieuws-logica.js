/**
 * De nieuwskaart: welke nieuwsbronnen en rubrieken er zijn, en wat er van de config overblijft.
 *
 * De eigenaar, 8 november 2026: "Ik zit dan te denken aan een navigatie menu bovenaan zoals NOS, AD etc (...) en welke je
 * aanklikt dan de sub catogorienen zoals algemeen, sport etc". Bovenaan dus de bronnen, daaronder de rubrieken van de
 * gekozen bron.
 *
 * Hier staan alleen de SLEUTELS. De adressen staan op de server (`nieuws.py`, zie de kop daar waarom), en een sleutel die
 * de server niet kent, weigert hij. `tests/test_nieuws.py` leest het blok hieronder als JSON en eist dat het precies de
 * bronnen en rubrieken van de server zijn; houd het dus geldige JSON.
 *
 * Wat er is, is op 8 november 2026 opgehaald en gelezen met de lezer van de integratie. Niet in de lijst, met reden:
 * De Telegraaf gaf op elke rubriek hetzelfde als op de voorpagina, RTL Nieuws heeft geen rubrieken (404), en de regio van
 * het AD en de NOS gaven niets. De Volkskrant geeft geen samenvatting mee, alleen een titel en een foto.
 *
 * Alleen taal.js als import, zodat het in een gewone Node-test past.
 */

import { nt } from "../taal.js";

// prettier-ignore
export const BRONNEN = /* bronnen */ {
  "nos": { "naam": "NOS", "rubrieken": ["algemeen", "binnenland", "buitenland", "politiek", "economie", "tech", "opmerkelijk", "cultuur", "sport", "voetbal"] },
  "nu": { "naam": "NU.nl", "rubrieken": ["algemeen", "binnenland", "buitenland", "politiek", "economie", "tech", "wetenschap", "opmerkelijk", "entertainment", "sport", "voetbal"] },
  "ad": { "naam": "AD", "rubrieken": ["algemeen", "binnenland", "buitenland", "politiek", "economie", "tech", "wetenschap", "show", "sport", "voetbal", "auto", "eten", "gezond"] },
  "rtl": { "naam": "RTL Nieuws", "rubrieken": ["algemeen"] },
  "telegraaf": { "naam": "De Telegraaf", "rubrieken": ["algemeen"] },
  "nrc": { "naam": "NRC", "rubrieken": ["algemeen"] },
  "volkskrant": { "naam": "de Volkskrant", "rubrieken": ["algemeen"] }
} /* einde */;

export const RUBRIEKEN = {
  algemeen: nt("Algemeen"),
  binnenland: nt("Binnenland"),
  buitenland: nt("Buitenland"),
  politiek: nt("Politiek"),
  economie: nt("Economie"),
  tech: nt("Tech"),
  wetenschap: nt("Wetenschap"),
  opmerkelijk: nt("Opmerkelijk"),
  cultuur: nt("Cultuur en media"),
  entertainment: nt("Entertainment"),
  show: nt("Show"),
  sport: nt("Sport"),
  voetbal: nt("Voetbal"),
  auto: nt("Auto's"),
  eten: nt("Koken en eten"),
  gezond: nt("Gezond"),
};

export const AANTAL_STANDAARD = 10;
export const AANTAL_MAX = 15;

/** Om het kwartier opnieuw, net zo vaak als de server ophaalt. */
export const VERVERS_MS = 15 * 60 * 1000;

const bestaat = (bron) => Object.hasOwn(BRONNEN, bron);

/** De bronnen bovenaan: die uit de config die bestaan, elk één keer; zonder keuze allemaal. */
export function bronnenUit(waarde) {
  const lijst = [...new Set((Array.isArray(waarde) ? waarde : waarde ? [waarde] : []).filter(bestaat))];
  return lijst.length ? lijst : Object.keys(BRONNEN);
}

/** De rubrieken van een bron; een onbekende bron heeft er geen. */
export const rubriekenVan = (bron) => (bestaat(bron) ? BRONNEN[bron].rubrieken : []);

/**
 * Wat er gekozen is, nagekeken: een bron uit de lijst bovenaan (anders de eerste), en een rubriek die die bron heeft
 * (anders Algemeen). Bij het wisselen van bron blijft de rubriek staan als de nieuwe bron hem ook heeft: wie Sport leest
 * en van NOS naar AD gaat, wil daar ook Sport.
 */
export function keuze(bronnen, bron, rubriek) {
  const b = bronnen.includes(bron) ? bron : bronnen[0];
  const r = rubriekenVan(b);
  return { bron: b, rubriek: r.includes(rubriek) ? rubriek : r[0] };
}

/** Hoeveel berichten: een heel getal van 1 tot en met 15 (zoveel geeft de server per rubriek), anders 10. */
export function aantalUit(waarde) {
  const n = Math.round(Number(waarde));
  return Number.isFinite(n) && waarde !== "" && waarde != null ? Math.min(Math.max(1, n), AANTAL_MAX) : AANTAL_STANDAARD;
}

/** Een link die we durven te openen of te tonen: alleen http en https. */
export const veiligeLink = (link) => (/^https?:\/\//i.test(String(link ?? "")) ? String(link) : null);
