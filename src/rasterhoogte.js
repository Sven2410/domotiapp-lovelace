/**
 * Kaarten die op de rasterrijen van Home Assistant uitkomen, zonder een vast
 * aantal rijen op te geven.
 *
 * ## Het probleem
 *
 * Het sections-raster van Home Assistant is 56px per rij met 8px ertussen. Een
 * kaart die daar niet op uitkomt, laat de kaart eronder op een halve rij
 * beginnen -- en dan stapt een kolom waarin een DomotiApp-kaart naast een
 * Mushroom-kaart staat zichtbaar uit de pas. Vijf kaarten deden dat: de
 * lampkaart was 93px, de mediakaart 130px, de weersvoorspelling 103px.
 *
 * ## Waarom niet gewoon `rows: <getal>`
 *
 * Dat is geprobeerd en het brak. Bij een getal klemt `computeCardGridSize` de
 * hoogte van het vak op `rows * 64 - 8` en zet `fit-rows`. Wordt de inhoud
 * daarna hoger -- een melding erbij, een wekker erbij -- dan steekt de kaart
 * dwars door zijn eigen rand en over de knop eronder heen. Dat staat met zoveel
 * woorden in `scene-card.js` en `alarm-card.js`, en het is de reden dat die twee
 * `"auto"` opgeven.
 *
 * Bovendien vraagt Home Assistant `getGridOptions()` alleen opnieuw als de kaart
 * een nieuwe `hass` krijgt. Op 20 augustus 2026 gemeten: bij een
 * toestandswijziging wél (teller ging 0 -> 1 -> 2), maar op `ll-rebuild`,
 * `card-updated`, `iron-resize` en een venster-resize géén. Een kaart die
 * hoger wordt zonder toestandswijziging -- een foutmelding, een icoon dat
 * inlaadt -- kan zijn eigen rijaantal dus niet corrigeren.
 *
 * ## Wat dit bestand doet
 *
 * De kaarten houden `rows: "auto"`, zodat overlopen onmogelijk blijft. In plaats
 * daarvan groeit hun INHOUD naar de eerstvolgende rasterhoogte: 56, 120, 184,
 * 248. Home Assistant geeft een auto-kaart precies de hoogte van zijn inhoud, en
 * een kaart van 120px gevolgd door 8px tussenruimte eindigt exact op de lijn
 * waar rij 3 begint. Alles lijnt dus uit, en er kan niets afgeknepen worden --
 * groeit de inhoud alsnog voorbij de maat, dan groeit de kaart gewoon mee naar
 * de volgende rasterhoogte.
 *
 * De maat wordt gemeten, niet uitgerekend. Een tabel met pixelmaten naast de CSS
 * loopt uit de pas zodra iemand een `padding` aanpast; een meting niet.
 */

/** Eén rasterrij, en de ruimte ertussen. Zie ook `rowsFor` in base.js. */
export const ROW_H = 56;
export const ROW_GAP = 8;

/** De eerstvolgende rasterhoogte die deze inhoud kan dragen. */
export function opRaster(px) {
  const rijen = Math.max(1, Math.ceil((px + ROW_GAP) / (ROW_H + ROW_GAP)));
  return rijen * ROW_H + (rijen - 1) * ROW_GAP;
}

/**
 * De hoogte die de inhoud van dit vak WIL, los van de hoogte die hij heeft.
 *
 * Opgeteld uit de kinderen, de tussenruimte, de binnenmarge en de rand -- en dus
 * niet uit de hoogte van het vak zelf. Dat verschil is de hele truc: zou dit de
 * eigen hoogte lezen, dan zou het opduwen van `min-height` de volgende meting
 * beïnvloeden en zou de kaart bij elke meting een rij groeien.
 *
 * Kinderen die niets innemen tellen niet mee; een `[hidden]`-blok hoort geen
 * tussenruimte te kosten.
 */
export function inhoudsHoogte(vak) {
  if (!vak) return 0;
  const s = getComputedStyle(vak);
  const kids = [...vak.children].filter((el) => el.getBoundingClientRect().height > 0);
  if (!kids.length) return 0;
  const gap = parseFloat(s.rowGap) || 0;
  const som = kids.reduce((n, el) => n + el.getBoundingClientRect().height, 0);
  return (
    som +
    gap * (kids.length - 1) +
    parseFloat(s.paddingTop) +
    parseFloat(s.paddingBottom) +
    parseFloat(s.borderTopWidth) +
    parseFloat(s.borderBottomWidth)
  );
}

/**
 * Zet --dac-raster op dit vak op de rasterhoogte die de inhoud nodig heeft.
 *
 * Roep dit aan waar de kaart zijn inhoud verandert -- aan het eind van
 * `paint()`, of in `updated()` bij een lit-kaart. Idempotent: schrijft alleen
 * als de maat werkelijk verandert.
 */
export function meetRaster(vak, pogingen = 4) {
  if (!vak) return;
  const px = inhoudsHoogte(vak);
  if (!px) {
    // De kaart staat er wel, maar de opmaak is nog niet rond -- alles meet nul.
    // Dat gebeurt bij het opbouwen van een view: `paint()` draait dan vóór de
    // eerste opmaakronde. Gemeten op 20 augustus 2026: zonder deze herkansing
    // bleef een lampkaart na het opslaan van een dashboard op 93px staan, want
    // er kwam geen tweede `paint()` meer en de waarnemer meldde niets.
    if (pogingen > 0) requestAnimationFrame(() => meetRaster(vak, pogingen - 1));
    return;
  }
  const doel = `${opRaster(px)}px`;
  if (vak.style.getPropertyValue("--dac-raster") === doel) return;
  vak.style.setProperty("--dac-raster", doel);
}

/**
 * Hoeveel rasterrijen de gemeten inhoud van dit vak nodig heeft, of null.
 *
 * DIT IS DE ONDERGRENS DIE EEN KAART AAN HOME ASSISTANT MOET OPGEVEN, en het is
 * geen luxe. `rows: "auto"` beschermt alleen zolang niemand er een getal
 * overheen zet -- en dat gebeurt vanzelf, want het formaatgreepje in de
 * kaarteditor schrijft `grid_options: {rows: N}` in de config. Home Assistant
 * klemt dat getal tussen `min_rows` en `max_rows` uit `getGridOptions()`; staat
 * `min_rows` op 1, dan mag het vak kleiner worden dan de inhoud en schildert de
 * kaart dwars over zijn buurman heen.
 *
 * Gemeten op 25 augustus 2026 in de echte instance: een mediakaart met
 * `grid_options: {columns: 12, rows: 2}` kreeg een vak van 120px, tekende zijn
 * 184px en liep 56px over de kaart eronder. Precies die config stond op zijn
 * eigen dashboard. Met de gemeten ondergrens klemt Home Assistant de 2 naar 3 en
 * is er niets meer om overheen te lopen.
 *
 * Leest de meting die `meetRaster` heeft weggeschreven en niet de eigen hoogte
 * van het vak: die laatste is al door Home Assistant afgeknepen, en dan zou de
 * ondergrens de afknijping bevestigen.
 */
export function gemetenRijen(vak) {
  const px = parseFloat(vak?.style?.getPropertyValue?.("--dac-raster") ?? "");
  if (!Number.isFinite(px) || px <= 0) return null;
  return Math.max(1, Math.round((px + ROW_GAP) / (ROW_H + ROW_GAP)));
}

/**
 * Blijf de rasterhoogte volgen voor wat er ná het tekenen nog verandert.
 *
 * `meetRaster` in `paint()` dekt alles wat de kaart zelf doet. Het dekt níét
 * wat er daarna binnenkomt: een `ha-icon` laadt asynchroon, een lange naam
 * breekt over twee regels zodra de kolom smaller wordt, een webfont komt later.
 * Daar is deze waarnemer voor.
 *
 * Hij is nadrukkelijk NIET de enige melder. Een kind dat op `display: none`
 * gaat, meldt zich in Chrome niet af bij de waarnemer -- gemeten op 20 augustus
 * 2026: de kleurstrips van een lamp die uitging verdwenen wel, maar de kaart
 * bleef op 120px staan omdat er geen enkele melding kwam. Vandaar dat de kaart
 * het zelf zegt in `paint()`.
 *
 * De lus loopt niet weg: het opduwen van min-height verandert de hoogte van het
 * vak, de waarnemer vuurt nog één keer, de gemeten inhoudshoogte is dan
 * ongewijzigd en `meetRaster` schrijft niets meer.
 *
 * @returns {() => void} opruimen
 */
export function volgRaster(vak) {
  if (!vak || typeof ResizeObserver === "undefined") return () => {};

  const ro = new ResizeObserver(() => {
    // Kinderen kunnen erbij zijn gekomen sinds de vorige ronde -- de
    // weersvoorspelling bouwt zijn dagrij opnieuw op. Nog een keer aanmelden is
    // gratis: een element dat al bekeken wordt, wordt niet dubbel gemeld.
    for (const kind of vak.children) ro.observe(kind);
    meetRaster(vak);
  });
  ro.observe(vak);
  for (const kind of vak.children) ro.observe(kind);
  meetRaster(vak);

  return () => ro.disconnect();
}
