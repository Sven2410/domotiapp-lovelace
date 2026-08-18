/**
 * Gedeelde constanten voor de kaart.
 *
 * Dit bestand importeert niets en mag niets gooien: het wordt op modulescope
 * uitgevoerd bij élke pagina van élke gebruiker (SPEC 17.1).
 */

export const CARD_TYPE = "domotiapp-scene-card";
export const EDITOR_TYPE = "domotiapp-scene-card-editor";

/** De editor achter het potlood (SPEC 4). */
export const SCENE_EDITOR_TYPE = "domotiapp-scene-editor";

/** Precies drie scenes, uit één constante (SPEC 3, INVENTARIS punt n). */
export const SCENE_COUNT = 3;

/**
 * Standaardiconen bij een lege opslag (SPEC 3).
 *
 * Namen uit onze eigen getekende set, niet uit mdi. Een verse scenekaart hoort
 * er hetzelfde uit te zien als de kaart ernaast, en die haalt zijn iconen hier
 * vandaan. Wie zelf een `mdi:`-icoon kiest krijgt dat gewoon: `resolve()` in
 * icons.js laat alles met een dubbele punt door naar `ha-icon`.
 */
export const DEFAULT_ICONS = ["een", "twee", "drie"];

/** Het potlood is hardcoded (SPEC 3). */
export const PENCIL_ICON = "pencil";

/** Sleutels die Lovelace zelf aan een kaartconfig hangt (SPEC 12.1). */
export const LOVELACE_LAYOUT_KEYS = [
  "grid_options",
  "layout_options",
  "view_layout",
  "visibility",
];
