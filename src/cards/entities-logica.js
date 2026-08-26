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
export const HOOGTE = { row: 44, tile: 96, compact: 44, beeld: 120 };

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

export const VORMEN = ["row", "tile", "compact", "beeld"];

/** Waar de inhoud van een plek tegenaan staat. */
export const UITLIJNINGEN = ["links", "midden"];

/**
 * Hoe groot een afbeelding op een plek mag worden.
 *
 * De ondergrens is de maat van een gewone chip; de bovengrens is wat er op een
 * halve kolom van een telefoon nog past. Daartussen is het aan de gebruiker --
 * een QR-code moet je kunnen scannen, en dat lukt niet op 36 pixels.
 */
export const BEELD_MIN = 48;
export const BEELD_MAX = 320;
export const BEELD_STANDAARD = 120;

export const clampBeeld = (n) => {
  // Niets ingevuld is niet hetzelfde als nul ingevuld: `Number(null)` en
  // `Number("")` zijn allebei 0, en die zouden hier op de ondergrens klemmen.
  // Een rij zonder `image_size` kreeg dan 48 pixels in plaats van de standaard.
  // Dezelfde val als bij `klemBalk` in navbar-logica.js.
  if (n === null || n === undefined || n === "") return BEELD_STANDAARD;
  const px = Math.round(Number(n));
  if (!Number.isFinite(px)) return BEELD_STANDAARD;
  return Math.min(BEELD_MAX, Math.max(BEELD_MIN, px));
};

export const clampUitlijning = (v) => (UITLIJNINGEN.includes(v) ? v : "links");

/**
 * De namen boven de kolommen van een rij, of een lege lijst.
 *
 * Zoveel namen als er kolommen zijn: staat er één naam bij twee kolommen, dan
 * blijft de tweede leeg in plaats van dat de rij verschuift. Alleen spaties
 * telt als leeg -- anders levert een aangetikte spatiebalk een onzichtbare kop
 * op die de kaart wel hoger maakt.
 */
export function kolomNamen(ruw, kolommen) {
  const lijst = Array.isArray(ruw) ? ruw : [];
  const namen = Array.from({ length: kolommen }, (_, i) =>
    typeof lijst[i] === "string" ? lijst[i].trim() : "",
  );
  return namen.some(Boolean) ? namen : [];
}
export const VLAKKEN = ["card", "items", "none", "open"];

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
    return config.rows.map((r) => {
      const columns = clampCols(r.columns);
      return {
        columns,
        layout: clampVorm(r.layout),
        align: clampUitlijning(r.align),
        image_size: clampBeeld(r.image_size),
        column_names: kolomNamen(r.column_names, columns),
        items: (r.items ?? r.entities ?? []).map(asItem),
      };
    });
  }
  const flat = (config?.items ?? config?.entities ?? []).map(asItem);
  if (!flat.length) return [];
  const columns = clampCols(config.columns);
  return [
    {
      columns,
      layout: clampVorm(config.layout),
      align: clampUitlijning(config.align),
      image_size: clampBeeld(config.image_size),
      // Bij de platte vorm staan de kolomnamen op de kaart zelf: er is maar één
      // rij, dus er valt niets te verwarren.
      column_names: kolomNamen(config.column_names, columns),
      items: flat,
    },
  ];
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
 * De hoogte van de kolomkoppen boven een rij.
 *
 * De GEMETEN regelhoogte van 14px tekst op 600 is 22.4px; dit getal komt daar
 * vandaan en niet uit een schatting (gemeten op 26 augustus 2026 in de
 * testinstance). Verandert het formaat in `entities-card.js`, dan verandert dit
 * getal mee -- anders komt de kaart op een halve rasterrij uit en schildert hij
 * over zijn buurman (valkuil 8 en 12).
 */
export const KOP_H = 22;

/**
 * Hoe hoog één regel van deze rij is.
 *
 * Voor de beeldvorm hangt dat af van de ingestelde afmeting: de afbeelding,
 * plus de binnenmarge en de naam eronder. De andere vormen hebben een vaste
 * maat, en die staat in HOOGTE.
 */
export function rijHoogte(row) {
  const vorm = clampVorm(row?.layout);
  if (vorm !== "beeld") return HOOGTE[vorm];
  return clampBeeld(row?.image_size) + 34;
}

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
    px += n * rijHoogte(r) + (n - 1) * GAP;
    // Kolomkoppen staan boven de rij en kosten dus hun eigen regel.
    if (r.column_names?.length) px += KOP_H + GAP;
  }
  return px + (rijen.length - 1) * GAP;
}
