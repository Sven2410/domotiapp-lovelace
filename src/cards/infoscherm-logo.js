/**
 * Het rekenwerk aan een logo voor het infoscherm, zonder DOM: waar het
 * zichtbare deel zit, en of het op het welkomblok te zien is. Het canvaswerk
 * eromheen staat in `infoscherm-logo-beeld.js`.
 *
 * WAAROM DIT BESTAAT
 *
 * Op 12 oktober 2026 bleef het logo van een klant weg op de iPad. Dat lag aan
 * de CSS (zie `.logo` in de infoschermkaart en valkuil 69), maar het plaatje
 * maakte het erger: 1410 bij 620, 93% doorzichtig, zwarte letters en een
 * dunne rode lijn, en de tekening besloeg maar 45% van de hoogte. Op een
 * donker scherm valt zwart weg, en in het beheer was dat niet te zien, want
 * daar stond het voorbeeld op het vlak van het thema van Home Assistant.
 *
 * Drie dingen volgen daaruit:
 * - het voorbeeld in het beheer staat op dezelfde ondergrond als op het
 *   scherm (`logoOndergrond`);
 * - het beheer waarschuwt als het grootste deel van een doorzichtig logo
 *   wegvalt (`logoWaarschuwing`);
 * - bij het uploaden gaat de lege rand eraf (`zichtbaarKader`, `metLucht`),
 *   anders is de tekening maar half zo hoog als het vak.
 */

import { tokens } from "../theme.js";
import { contrast, leesKleur, opOndergrond } from "../thema-logica.js";

/** Eén waarde uit de donkere tokens van `theme.js`. */
const token = (naam) =>
  tokens
    .split(";")
    .map((regel) => regel.trim())
    .find((regel) => regel.startsWith(`${naam}:`))
    ?.slice(naam.length + 1)
    .trim();

/**
 * De kleuren van het scherm, per uiterlijk: de achtergrond (`--dac-bg`) en
 * het vlak van een blok erop (`--dac-surface`). Donker zijn de tokens van
 * de kaarten zelf; licht is van het infoscherm alleen, en gaat van hier het
 * scherm in (`.scherm.licht`).
 */
export const SCHERM = {
  donker: { achtergrond: token("--dac-bg"), vlak: token("--dac-surface") },
  licht: { achtergrond: "#f3f1ec", vlak: "rgba(20, 20, 10, 0.045)" },
};

/**
 * Waar het logo op staat, als `[r, g, b]`: het vlak van het welkomblok over
 * de achtergrond. Sinds 0.61.1 heeft het welkomblok een vlak en een rand, net
 * als de andere blokken -- zijn keuze op 12 oktober 2026: *"ja alles met
 * kader"*. Daarvoor stond het logo rechtstreeks op de achtergrond.
 */
export function logoOndergrond(uiterlijk) {
  const s = SCHERM[uiterlijk === "licht" ? "licht" : "donker"];
  return opOndergrond(leesKleur(s.vlak), leesKleur(s.achtergrond)).map(Math.round);
}

/** Onder deze dekking telt een pixel als doorzichtig (0-255). */
export const DREMPEL_RAND = 10;

/** Een pixel met minder contrast dan dit tegen de achtergrond valt weg. */
export const MIN_CONTRAST = 2;

/**
 * Het kleinste vak waarin alle pixels met een dekking boven `drempel` vallen.
 * `data` is RGBA, vier getallen per pixel, zoals `ImageData.data`.
 *
 * @returns {{x: number, y: number, w: number, h: number} | null} null als er
 *   niets zichtbaars in staat
 */
export function zichtbaarKader(data, breed, hoog, drempel = DREMPEL_RAND) {
  let x0 = breed;
  let y0 = hoog;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < hoog; y++) {
    const rij = y * breed * 4;
    for (let x = 0; x < breed; x++) {
      if (data[rij + x * 4 + 3] > drempel) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        y1 = y;
      }
    }
  }
  if (x1 < 0) return null;
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/**
 * Het kader met wat lucht eromheen, binnen het plaatje. Zonder lucht snijdt
 * de rand van een zachte schaduw of een afgeronde letter er net af.
 */
export function metLucht(kader, breed, hoog, deel = 0.02, minimaal = 2) {
  const lucht = Math.max(minimaal, Math.round(Math.max(kader.w, kader.h) * deel));
  const x = Math.max(0, kader.x - lucht);
  const y = Math.max(0, kader.y - lucht);
  return {
    x,
    y,
    w: Math.min(breed, kader.x + kader.w + lucht) - x,
    h: Math.min(hoog, kader.y + kader.h + lucht) - y,
  };
}

/**
 * Loont het bijsnijden? Alleen als er in de breedte of de hoogte minstens
 * `deel` af gaat; een rand van een paar pixels opnieuw coderen is zinloos.
 */
export const moetBijsnijden = (kader, breed, hoog, deel = 0.03) =>
  !!kader && (kader.w <= breed * (1 - deel) || kader.h <= hoog * (1 - deel));

/**
 * Hoe een logo op het welkomblok staat, bij elk van de twee uiterlijken.
 *
 * `doorzichtig` is het deel van de pixels dat grotendeels doorzichtig is.
 * `wegvallend[uiterlijk]` is het deel van de DEKKENDE pixels dat na het
 * mengen met die ondergrond minder dan `MIN_CONTRAST` contrast heeft.
 *
 * @returns {{doorzichtig: number, wegvallend: {donker: number, licht: number}} | null}
 */
export function logoAnalyse(data, breed, hoog) {
  const totaal = breed * hoog;
  if (!totaal) return null;
  const achter = ["donker", "licht"].map((naam) => [naam, logoOndergrond(naam)]);
  const weg = { donker: 0, licht: 0 };
  let doorzichtig = 0;
  let dekkend = 0;
  for (let i = 0; i < totaal * 4; i += 4) {
    const a = data[i + 3];
    if (a < 128) {
      doorzichtig++;
      continue;
    }
    dekkend++;
    const pixel = [data[i], data[i + 1], data[i + 2], a / 255];
    for (const [naam, bg] of achter) {
      if (contrast(opOndergrond(pixel, bg), bg) < MIN_CONTRAST) weg[naam]++;
    }
  }
  return {
    doorzichtig: doorzichtig / totaal,
    wegvallend: {
      donker: dekkend ? weg.donker / dekkend : 0,
      licht: dekkend ? weg.licht / dekkend : 0,
    },
  };
}

/**
 * De waarschuwing onder het logo in het beheer, of "" als er niets te
 * melden is. Een logo ZONDER doorzichtige achtergrond draagt zijn eigen vlak
 * en is dus altijd te zien; daar wordt niets over gezegd.
 */
export function logoWaarschuwing(analyse, uiterlijk) {
  if (!analyse || analyse.doorzichtig < 0.05) return "";
  const licht = uiterlijk === "licht";
  if ((analyse.wegvallend[licht ? "licht" : "donker"] ?? 0) < 0.5) return "";
  return licht
    ? "Dit logo valt grotendeels weg op het lichte scherm: het is licht op een doorzichtige achtergrond. Gebruik een versie met donkere letters, of zet Uiterlijk op Donker."
    : "Dit logo valt grotendeels weg op het donkere scherm: het is donker op een doorzichtige achtergrond. Gebruik een versie met lichte letters, of zet Uiterlijk op Licht.";
}
