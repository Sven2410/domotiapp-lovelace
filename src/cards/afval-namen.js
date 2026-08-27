/**
 * De naam van een afvalbak korter maken, zonder gemeentenamen te kennen.
 *
 * Gemeld op 27 augustus 2026, met twee schermafdrukken naast elkaar: bij één van
 * zijn klanten stond er *"Circulus Circulus Restafval"* waar bij hemzelf gewoon
 * *"Restafval"* staat.
 *
 * ## Waar die dubbele naam vandaan komt
 *
 * Home Assistant stelt de weergavenaam van een entiteit samen uit de naam van
 * het APPARAAT en die van de entiteit zelf. Heet het apparaat "Circulus" en de
 * entiteit "Circulus Restafval", dan wordt de `friendly_name` dus "Circulus
 * Circulus Restafval". Bij Mijnafvalwijzer valt dat toevallig goed uit, bij
 * Circulus niet.
 *
 * ## Waarom niet gewoon een lijstje met integraties
 *
 * Dat stond er: `afvalbeheer|afvalwijzer|mijnafvalwijzer` werd weggeknipt. Dat
 * werkt precies zolang tot de volgende klant een andere gemeente heeft -- en
 * dan staat het er weer. Elke nieuwe integratie zou een nieuwe regel in die
 * lijst betekenen, en dat is een lijst die per definitie achterloopt.
 *
 * ## Wat er wél werkt: het gedeelde begin weghalen
 *
 * Op één kaart staan de bakken van één gemeente. Wat ze in hun naam DELEN is dus
 * geen informatie -- het is ruis die bij elke regel hetzelfde is:
 *
 *     Circulus Circulus Restafval  ->  Restafval
 *     Circulus Circulus PMD        ->  PMD
 *     Circulus Circulus Papier     ->  Papier
 *     Circulus Circulus GFT        ->  GFT
 *
 * En bij Mijnafvalwijzer, waar de namen niets delen, verandert er niets. Geen
 * lijst om bij te houden.
 *
 * Er zijn twee grenzen. Er blijft ALTIJD minstens één woord staan -- anders
 * verdwijnt de naam van een bak die toevallig net zo heet als het voorvoegsel.
 * En bij één sensor valt er niets te vergelijken; dan blijft alleen het
 * opruimen van een herhaald woord over.
 */

/** Woorden, met de oorspronkelijke spatiëring weggegooid. */
const woorden = (naam) => String(naam ?? "").trim().split(/\s+/).filter(Boolean);

/**
 * Haal een woord weg dat direct achter zichzelf staat.
 *
 * "Circulus Circulus Restafval" -> "Circulus Restafval". Dit werkt ook met één
 * sensor, waar er niets te vergelijken valt.
 */
export function zonderHerhaling(naam) {
  const w = woorden(naam);
  const uit = w.filter((woord, i) => i === 0 || woord.toLowerCase() !== w[i - 1].toLowerCase());
  return uit.join(" ");
}

/**
 * Hoeveel woorden delen deze namen aan het begin?
 *
 * Hoofdletterongevoelig, want "Circulus" en "circulus" zijn hetzelfde woord.
 */
export function gedeeldBegin(namen) {
  const lijst = namen.map(woorden).filter((w) => w.length);
  if (lijst.length < 2) return 0;

  let n = 0;
  const kortste = Math.min(...lijst.map((w) => w.length));
  while (n < kortste) {
    const woord = lijst[0][n].toLowerCase();
    if (!lijst.every((w) => w[n].toLowerCase() === woord)) break;
    n++;
  }
  // Nooit alles: er moet een naam overblijven.
  return Math.min(n, kortste - 1);
}

/**
 * De korte namen voor deze lijst bakken.
 *
 * @param {string[]} namen de volledige namen, in dezelfde volgorde
 * @returns {string[]}
 */
export function korteNamen(namen) {
  const schoon = namen.map((n) => zonderHerhaling(n));
  const weg = gedeeldBegin(schoon);
  return schoon.map((naam) => {
    const w = woorden(naam);
    const rest = w.slice(weg);
    return (rest.length ? rest : w).join(" ");
  });
}
