/**
 * Inzoomen en schuiven op een beeld, zonder DOM.
 *
 * Gevraagd op 27 augustus 2026 bij de beveiligingscamerakaart: *"Live kunnen
 * kijken en kunnen inzoomen bijvoorbeeld."*
 *
 * WAAROM DIT REKENWERK APART STAAT
 *
 * Inzoomen is één regel CSS (`transform: scale()`), en schuiven is dat ook. Wat
 * er misgaat is het KLEMMEN: schuif je verder dan de rand, dan kijk je naar de
 * achtergrond in plaats van naar de camera, en dat ziet eruit als een camera die
 * het niet doet. Die grens hangt af van de zoomfactor -- op 1x mag je helemaal
 * niet schuiven, op 3x een derde van het beeld -- en dat is precies het soort
 * som dat je één keer wilt uitschrijven en daarna niet meer.
 */

/** Verder dan 6x is bij een camera van 2 megapixel alleen nog blokjes. */
export const MAX_ZOOM = 6;
export const MIN_ZOOM = 1;

/** Houd de zoomfactor binnen wat zinnig is. */
export function klemZoom(z) {
  const n = Number(z);
  if (!Number.isFinite(n)) return MIN_ZOOM;
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, n));
}

/**
 * Hoe ver je vanuit het midden mag schuiven, in fractie van het beeld.
 *
 * Op 1x is dat nul: er is niets buiten beeld, dus er valt niets te halen. Op 2x
 * is de helft van het beeld buiten het vak, en daarvan zit de helft aan elke
 * kant -- dus een kwart per kant.
 */
export function maxSchuif(zoom) {
  const z = klemZoom(zoom);
  return Math.max(0, (1 - 1 / z) / 2);
}

/**
 * De nieuwe kijkpositie, geklemd binnen het beeld.
 *
 * `x` en `y` zijn fracties van de beeldbreedte en -hoogte, met 0 in het midden.
 * Fracties en geen pixels, zodat een venster dat van maat verandert niet ineens
 * naar een andere hoek kijkt.
 */
export function klemPositie(x, y, zoom) {
  const grens = maxSchuif(zoom);
  const veilig = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0);
  // `+ 0` maakt van een min-nul een gewone nul. Dat is geen muggenzifterij: op
  // 1x klemt alles naar nul, en zonder dit staat er `translate(-0.000%)` in de
  // stijl van elke kaart die ooit ingezoomd is geweest.
  const klem = (n) => Math.max(-grens, Math.min(grens, veilig(n))) + 0;
  return { x: klem(x), y: klem(y) };
}

/**
 * Zoom in of uit rondom een punt, zodat dat punt blijft staan waar het staat.
 *
 * Dit is het verschil tussen inzoomen dat aanvoelt als inzoomen en inzoomen dat
 * aanvoelt als het beeld dat wegspringt. Zoom je op het midden terwijl je naar
 * de linkerbovenhoek kijkt, dan schuift wat je bekeek uit beeld.
 *
 * @param {{zoom: number, x: number, y: number}} nu de huidige stand
 * @param {number} factor waarmee vermenigvuldigd wordt (1.2 = 20% erbij)
 * @param {{x: number, y: number}} punt waar de vinger of de muis zit, als
 *   fractie vanaf het midden (-0.5 tot 0.5)
 */
export function zoomRondom(nu, factor, punt = { x: 0, y: 0 }) {
  const oud = klemZoom(nu?.zoom ?? 1);
  const nieuw = klemZoom(oud * (Number(factor) || 1));

  // Niets veranderd (we zaten al aan een grens): dan hoort de positie ook niet
  // te verschuiven.
  if (nieuw === oud) return { zoom: oud, ...klemPositie(nu?.x, nu?.y, oud) };

  // Het punt onder de vinger zit op deze plek in het beeld; die plek moet na de
  // zoom op dezelfde schermpositie uitkomen.
  const px = Number(punt?.x) || 0;
  const py = Number(punt?.y) || 0;
  const x = (nu?.x ?? 0) + px * (1 / oud - 1 / nieuw);
  const y = (nu?.y ?? 0) + py * (1 / oud - 1 / nieuw);

  return { zoom: nieuw, ...klemPositie(x, y, nieuw) };
}

/** De CSS-transform voor deze stand. */
export function alsTransform({ zoom = 1, x = 0, y = 0 } = {}) {
  const z = klemZoom(zoom);
  const p = klemPositie(x, y, z);
  // Eerst schalen, dan verplaatsen: de verplaatsing is een fractie van het
  // GESCHAALDE beeld, en dat is precies wat maxSchuif uitrekent.
  return `scale(${z}) translate(${(-p.x * 100).toFixed(3)}%, ${(-p.y * 100).toFixed(3)}%)`;
}
