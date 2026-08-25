/**
 * Wat de entiteitenkaart uit een config afleidt, los van hoe hij eruitziet.
 *
 * Drie dingen, en ze staan hier omdat ze alle drie stilletjes fout kunnen gaan
 * zonder dat je het op een dashboard meteen ziet:
 *
 * 1. Elke configvorm terugbrengen tot rijen. Er zijn er drie in omloop: de
 *    huidige (`rows`), de eerste (`items` of `entities` met één `columns`), en
 *    een item dat gewoon een entiteits-id als string is. Ze moeten alle drie
 *    blijven werken, want ze hangen op draaiende dashboards.
 * 2. Of een plek iets voorstelt. Sinds de knopkaart hierin opging mag een plek
 *    zonder entiteit bestaan -- dat is een navigatieknop -- en dus is "heeft een
 *    entiteit" niet meer hetzelfde als "is ingevuld".
 * 3. Hoe hoog de kaart wil zijn. Dat is rekenwerk met vier variabelen (vorm,
 *    kolommen, aantal plekken, wel of geen kaartvlak) en het bepaalt of een
 *    kaart in het raster van Home Assistant op dezelfde hoogte uitkomt als een
 *    Mushroom-kaart ernaast. Eén afrondingsfout hier en de hele kolom loopt uit
 *    de pas.
 *
 * Geen DOM, geen thema, geen `hass`: anders is het niet te toetsen in een
 * gewone Node-test, en juist dit hoort getoetst te zijn.
 */

/**
 * Hoe hoog een plek is, per vorm.
 *
 * `row` blijft 44. Met 5px padding boven en onder plus de rand van 2 komt dat
 * precies op 56 uit: één rasterrij van Home Assistant, dezelfde hoogte als een
 * Mushroom-kaart ernaast. Aan dat getal mag niet gerekend worden.
 */
export const HOOGTE = { row: 44, tile: 96, compact: 44 };

/** De ruimte tussen twee plekken en tussen twee rijen. */
export const GAP = 6;

/** Padding boven en onder plus de rand -- alleen als de kaart zelf een vlak heeft. */
export const KADER = 12;

/**
 * De regelhoogte van een kaartnaam, plus de ruimte eronder.
 *
 * Een kaart met een naam wordt daarmee een rasterrij hoger: een enkele regel
 * gaat van 12 + 44 = 56 naar 12 + 22 + 6 + 44 = 84, en dat is 2 rijen. Dat is
 * geen verrassing maar de bedoeling -- een kop hoort ruimte te kosten, en een
 * kaart die zijn kop in dezelfde 56px propt duwt de regel eronder plat.
 */
export const TITEL_H = 22;

export const VORMEN = ["row", "tile", "compact"];
export const VLAKKEN = ["card", "items", "none"];

/**
 * De naam van de kaart als geheel, of "".
 *
 * Optioneel, en met opzet los van de naam van een entiteit: die staat op de
 * regel. Dit is de kop erboven, voor als een kaart een groep is die een naam
 * verdient zonder dat er een losse sectiekop boven hoeft.
 *
 * Alleen spaties telt als leeg. Anders levert een per ongeluk aangetikte
 * spatiebalk een onzichtbare kop op die de kaart wel een rasterrij hoger maakt,
 * en dan zoek je waar die lege ruimte vandaan komt.
 */
export const kaartNaam = (config) =>
  typeof config?.name === "string" ? config.name.trim() : "";

/** Een item mag een string zijn, of een object met alles erop. */
export const asItem = (i) => (typeof i === "string" ? { entity: i } : { ...i });

/** Eén, twee of drie kolommen. Meer past niet zonder namen te verminken. */
export const clampCols = (n) => Math.min(Math.max(1, Number(n) || 2), 3);

export const clampVorm = (v) => (VORMEN.includes(v) ? v : "row");

/**
 * Heeft deze plek iets om te tonen?
 *
 * Een entiteit is het normale geval. Maar een plek zonder entiteit die wel een
 * naam, een icoon of een tikactie draagt is een navigatieknop, en die hoort niet
 * weggegooid te worden omdat er geen entiteit achter zit.
 */
export const gevuld = (item) =>
  Boolean(item?.entity || item?.name || item?.icon || item?.tap_action);

/**
 * Breng elke configvorm terug tot rijen.
 *
 * De oude vorm -- één `items`- of `entities`-lijst met één `columns` -- blijft
 * werken en wordt één rij. Dashboards die al draaien hoeven niet aangepast.
 */
export function toRows(config) {
  if (Array.isArray(config?.rows) && config.rows.length) {
    return config.rows.map((r) => ({
      columns: clampCols(r.columns),
      layout: clampVorm(r.layout),
      items: (r.items ?? r.entities ?? []).map(asItem),
    }));
  }
  const flat = (config?.items ?? config?.entities ?? []).map(asItem);
  if (!flat.length) return [];
  return [{ columns: clampCols(config.columns), layout: clampVorm(config.layout), items: flat }];
}

/**
 * Welk vlak deze kaart draagt.
 *
 * `bare: true` was de oude spelling van "geen vlak" en blijft werken; hij stond
 * niet in de editor, maar wel in de kaart, en een config die ergens draait mag
 * niet stilletjes van uiterlijk veranderen.
 */
export function vlakVan(config) {
  if (VLAKKEN.includes(config?.surface)) return config.surface;
  return config?.bare ? "none" : "card";
}

/**
 * Hoeveel regels een rij inneemt.
 *
 * Meer plekken dan kolommen komt alleen uit met de hand geschreven YAML -- de
 * editor geeft een rij precies zoveel plekken als kolommen -- maar de kaart laat
 * ze wél doorlopen naar de volgende regel, dus telt hij ze ook mee. Afkappen zou
 * betekenen dat er entiteiten in de config staan die nergens te zien zijn.
 */
export const regelsIn = (row) => Math.max(1, Math.ceil((row.items?.length || 1) / row.columns));

/**
 * Hoe hoog deze kaart wil zijn, in pixels.
 *
 * Verwacht een config die al door `toRows` is gegaan, dus met `rows` erop.
 */
export function kaartHoogte(config) {
  const rijen = config?.rows ?? [];
  const kop = kaartNaam(config) ? TITEL_H + GAP : 0;
  if (!rijen.length) return KADER + kop + HOOGTE.row;
  let px = (vlakVan(config) === "card" ? KADER : 0) + kop;
  for (const r of rijen) {
    const n = regelsIn(r);
    px += n * HOOGTE[clampVorm(r.layout)] + (n - 1) * GAP;
  }
  return px + (rijen.length - 1) * GAP;
}
