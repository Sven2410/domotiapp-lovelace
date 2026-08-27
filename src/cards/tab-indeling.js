/**
 * De indeling van een kaart binnen een tabblad.
 *
 * WAAROM DIT ER IS
 *
 * De eigenaar, met een schermafdruk van HA's eigen kaartdialoog erbij: *"in het
 * visuele kaart toevoegen werkt nu, dat is top, alleen mis ik deze editor om de
 * kaart size aan te passen en zichtbaar ook."* Die dialoog heeft drie
 * tabbladen -- Configuratie, Zichtbaarheid, Indeling -- en de laatste twee
 * ontbraken zodra je een kaart IN een tab bewerkte.
 *
 * De editor is het halve werk. Een schuif die een `grid_options` wegschrijft
 * die niemand leest, is erger dan geen schuif. Daarom rekent dit bestand die
 * `grid_options` om naar een plek in een raster, en zet de tabbladenkaart zijn
 * kaarten sindsdien in een raster van twaalf kolommen -- hetzelfde raster als
 * een sectie van Home Assistant, zodat de schuif in die dialoog doet wat hij
 * belooft.
 *
 * Zonder DOM, zodat het in een gewone Node-test past. Zie valkuil 8 in
 * CLAUDE.md voor waar die 56 en die 8 vandaan komen: dat is HA's rasterrij en
 * de ruimte ertussen, en daar staan onze kaarten al op afgestemd.
 */

/** Zoveel kolommen breed is een sectie bij Home Assistant, en dus een tab. */
export const KOLOMMEN = 12;

/** Eén rasterrij, en de ruimte tussen twee rijen. Zie valkuil 8. */
export const RIJHOOGTE = 56;
export const RIJGAT = 8;

/**
 * Klem een getal tussen een onder- en bovengrens, als die er zijn.
 *
 * Ontbreekt een grens, dan klemt hij niet. Een onzingrens (tekst, NaN) telt
 * niet mee: een kaart die iets raars opgeeft mag de indeling niet slopen.
 */
function klem(n, min, max) {
  // `Number(null)` is 0 en `Number("")` ook, en een grens van 0 zou elke kaart
  // platslaan. Een ontbrekende grens moet dus vóór de omrekening eruit.
  const getal = (v) => {
    if (v === null || v === undefined || v === "") return null;
    const g = Math.round(Number(v));
    return Number.isFinite(g) ? g : null;
  };
  let uit = n;
  const lo = getal(min);
  const hi = getal(max);
  if (lo !== null) uit = Math.max(uit, lo);
  if (hi !== null) uit = Math.min(uit, hi);
  return uit;
}

/**
 * Waar een kaart met deze `grid_options` in het raster komt te staan.
 *
 * DE GRENZEN ZIJN GEEN LUXE. Een `grid_options` in een dashboard is een getal
 * dat er ooit is ingezet en daarna is blijven staan; de kaart eronder kan
 * sindsdien van vorm zijn veranderd. Home Assistant klemt zo'n getal in een
 * sectie tussen `min_rows` en `max_rows` uit `getGridOptions()` van de kaart
 * zelf (valkuil 12), en tot 27 augustus 2026 deed dit raster dat NIET.
 *
 * Wat dat kostte, gemeten op de installatie van de eigenaar: twaalf
 * klimaatkaarten in een tabblad, allemaal met `{columns: 6, rows: 1}` uit de
 * tijd dat die kaart één rasterrij hoog was. Op "Onder elkaar" tekent hij er
 * drie. Vak 56px, inhoud 120px, en dus elke kaart 64px over zijn buurman heen.
 * Dat is de schermafdruk die hij stuurde.
 *
 * @param {object} [gridOptions] wat er in de config staat
 * @param {object} [grenzen] `getGridOptions()` van de kaart zelf
 * @returns {{gridColumn: string, height?: string}}
 */
export function indelingVoorKaart(gridOptions, grenzen) {
  const kolommen = gridOptions?.columns;
  const rijen = gridOptions?.rows;

  // Geen keuze en "full" komen op hetzelfde neer: de hele breedte. Dat is ook
  // wat er stond voordat er een raster was, dus een bestaand tabblad verandert
  // niet van uiterlijk.
  let breedte = KOLOMMEN;
  if (kolommen !== undefined && kolommen !== null && kolommen !== "full") {
    const n = Math.round(Number(kolommen));
    breedte = Number.isFinite(n) ? Math.min(KOLOMMEN, Math.max(1, n)) : KOLOMMEN;
  }
  breedte = Math.min(KOLOMMEN, Math.max(1, klem(breedte, grenzen?.min_columns, grenzen?.max_columns)));

  const uit = { gridColumn: `span ${breedte}` };

  // Alleen een GEKOZEN aantal rijen geeft een vaste hoogte. "auto" en niets
  // laten de kaart zelf zijn hoogte bepalen -- en dat moet ook, want onze
  // eigen kaarten duwen hun inhoud op naar 56, 120, 184 of 248 (valkuil 8).
  const r = Math.round(Number(rijen));
  if (rijen !== "auto" && Number.isFinite(r) && r >= 1) {
    // Zegt de kaart zelf dat hij "auto" is en geeft hij geen bovengrens, dan
    // is een vaste hoogte alleen veilig zolang hij niet onder zijn eigen
    // ondergrens komt. Die ondergrens is gemeten (`gemetenRijen`), dus hij
    // klopt ook nadat de inhoud gegroeid is.
    uit.height = `${Math.max(1, klem(r, grenzen?.min_rows, grenzen?.max_rows)) * (RIJHOOGTE + RIJGAT) - RIJGAT}px`;
  }
  return uit;
}

/**
 * Zet die indeling op een element.
 *
 * Apart van het rekenwerk zodat het rekenwerk zonder DOM te toetsen is, en op
 * één plek zodat het voorbeeld in de editor en de kaart op het dashboard niet
 * uit elkaar kunnen lopen.
 */
export function pasIndelingToe(element, gridOptions, grenzen) {
  if (!element?.style) return;
  const { gridColumn, height } = indelingVoorKaart(gridOptions, grenzen);
  element.style.gridColumn = gridColumn;
  // Leeg zetten en niet weglaten: een kaart die zijn vaste hoogte kwijtraakt
  // moet hem ook echt kwijt zijn.
  element.style.height = height ?? "";
}

/**
 * De grenzen die een kaart IN een `hui-card` zelf opgeeft, of null.
 *
 * Home Assistant zet het echte kaartelement in de shadow root van `hui-card`
 * en houdt het daar ook vast als `_element`. Allebei geprobeerd, want die
 * eigenschap is niet officieel: valt hij ooit weg, dan blijft de shadow root
 * over.
 *
 * Null en geen `{}` bij "nog niet te vinden", zodat de aanroeper het verschil
 * ziet tussen *een kaart zonder grenzen* en *een kaart die er nog niet is* --
 * op dat laatste hoort hij te wachten.
 */
export function grenzenVan(huiCard) {
  const el = huiCard?._element ?? huiCard?.shadowRoot?.firstElementChild ?? null;
  if (typeof el?.getGridOptions !== "function") return null;
  try {
    const g = el.getGridOptions();
    return g && typeof g === "object" ? g : null;
  } catch {
    // Een kaart van iemand anders mag gooien; dat is geen reden om de hele
    // tab niet te tekenen. Zonder grenzen valt hij terug op wat er in de
    // config staat, en dat is precies het gedrag van vóór deze ronde.
    return null;
  }
}
