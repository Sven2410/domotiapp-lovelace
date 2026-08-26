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
 * Waar een kaart met deze `grid_options` in het raster komt te staan.
 *
 * @param {object} [gridOptions]
 * @returns {{gridColumn: string, height?: string}}
 */
export function indelingVoorKaart(gridOptions) {
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

  const uit = { gridColumn: `span ${breedte}` };

  // Alleen een GEKOZEN aantal rijen geeft een vaste hoogte. "auto" en niets
  // laten de kaart zelf zijn hoogte bepalen -- en dat moet ook, want onze
  // eigen kaarten duwen hun inhoud op naar 56, 120, 184 of 248 (valkuil 8).
  const r = Math.round(Number(rijen));
  if (rijen !== "auto" && Number.isFinite(r) && r >= 1) {
    uit.height = `${r * (RIJHOOGTE + RIJGAT) - RIJGAT}px`;
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
export function pasIndelingToe(element, gridOptions) {
  if (!element?.style) return;
  const { gridColumn, height } = indelingVoorKaart(gridOptions);
  element.style.gridColumn = gridColumn;
  // Leeg zetten en niet weglaten: een kaart die zijn vaste hoogte kwijtraakt
  // moet hem ook echt kwijt zijn.
  element.style.height = height ?? "";
}
