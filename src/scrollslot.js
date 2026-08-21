/**
 * Het scrollen van de pagina vastzetten zolang er een scherm overheen ligt.
 *
 * ## Waarom `overscroll-behavior` op de lijsten niet genoeg was
 *
 * Het zoekscherm hangt in `document.body` en is `position: fixed`. Zijn LIJSTEN
 * scrollen en die hebben `overscroll-behavior: contain`, dus daar houdt het op.
 * Maar de laag eronder -- het volle scherm met de kop, de tabbladen en de lege
 * ruimte -- scrollt zelf niet. Scroll je dáár, dan is er niets om te scrollen en
 * gaat de beweging naar de eerstvolgende scrollbare voorouder. Dat is de pagina,
 * en dus zag je Home Assistant achter het scherm langsschuiven.
 *
 * Dat het de PAGINA is en niet een kader binnen Home Assistant, volgt uit waar
 * we hangen: onze voorouder is `body`, dus is het venster de enige die de
 * beweging kan overnemen.
 *
 * ## Waarom `position: fixed` en niet alleen `overflow: hidden`
 *
 * `overflow: hidden` op de body houdt Safari op iOS niet tegen; die scrollt de
 * pagina alsnog. `position: fixed` doet dat wel, maar haalt de pagina uit de
 * stroom en dus springt hij naar boven -- vandaar dat de scrollpositie bewaard
 * wordt en bij het loslaten teruggezet.
 *
 * ## Twee schermen tegelijk
 *
 * Ligt er al een slot op (een vlag op de body), dan doet dit niets en geeft het
 * een lege sleutel terug. Anders zou het tweede scherm `position: fixed` als
 * "oorspronkelijke waarde" bewaren en de pagina bij het sluiten vast laten
 * staan -- een dashboard dat niet meer scrollt, zonder foutmelding.
 */

const VLAG = "dacScrollSlot";

/** De stijlen die we overschrijven, en dus eerst moeten onthouden. */
const VELDEN = ["position", "top", "left", "right", "width", "overflow"];

/**
 * Zet het scrollen vast.
 *
 * @returns {() => void} de sleutel: aanroepen geeft het scrollen weer vrij, op
 *   de plek waar de bezoeker was. Twee keer aanroepen mag.
 */
export function zetScrollSlot(doc = globalThis.document, win = globalThis.window) {
  const body = doc?.body;
  if (!body?.style || body.dataset?.[VLAG]) return () => {};

  const y = win?.scrollY ?? doc.documentElement?.scrollTop ?? 0;
  const bewaard = Object.fromEntries(VELDEN.map((veld) => [veld, body.style[veld]]));
  if (body.dataset) body.dataset[VLAG] = "1";

  body.style.position = "fixed";
  body.style.top = `-${y}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";

  let los = false;
  return () => {
    if (los) return;
    los = true;
    for (const veld of VELDEN) body.style[veld] = bewaard[veld];
    if (body.dataset) delete body.dataset[VLAG];
    win?.scrollTo?.(0, y);
  };
}
