/**
 * Het rekenwerk aan een logo voor het infoscherm, zonder DOM: waar het
 * zichtbare deel zit, en of het op de achtergrond van het scherm te zien is.
 * Het canvaswerk eromheen staat in `infoscherm-logo-beeld.js`.
 *
 * WAAROM DIT BESTAAT
 *
 * Op 12 oktober 2026 bleef het logo van een klant weg op de iPad. De opslag
 * klopte, het bestand kwam gewoon binnen; het lag aan het plaatje zelf. Het
 * was 1410 bij 620 pixels, met een doorzichtige achtergrond (93% van de
 * pixels), zwarte letters en een dunne rode lijn, en het zichtbare deel besloeg
 * maar 45% van de hoogte. Het scherm stond op Donker. De zwarte letters vielen
 * weg tegen #0c0c0a, en van het geheel bleef een rood bloemetje van zo'n 25 px
 * over. In het beheer was dat niet te zien, want daar stond het voorbeeld op
 * het vlak van het thema van Home Assistant.
 *
 * Drie dingen volgen daaruit:
 * - het voorbeeld in het beheer staat op de achtergrond van het SCHERM
 *   (`SCHERM_ACHTERGROND`);
 * - het beheer waarschuwt als het grootste deel van een doorzichtig logo
 *   wegvalt (`logoWaarschuwing`);
 * - bij het uploaden gaat de lege rand eraf (`zichtbaarKader`, `metLucht`),
 *   anders tekent het welkomblok het zichtbare deel op de helft van de hoogte.
 */

import { contrast, leesKleur, opOndergrond } from "../thema-logica.js";

/**
 * De achtergrond van het scherm, per uiterlijk. Het welkomblok heeft geen
 * eigen vlak (`.blok.welkom { background: none }`), dus het logo staat hier
 * rechtstreeks op. Donker is `--dac-bg` uit `theme.js`; een toets houdt die
 * twee gelijk.
 */
export const SCHERM_ACHTERGROND = { donker: "#0c0c0a", licht: "#f3f1ec" };

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
 * Hoe een logo op de twee achtergronden van het scherm staat.
 *
 * `doorzichtig` is het deel van de pixels dat grotendeels doorzichtig is.
 * `wegvallend[uiterlijk]` is het deel van de DEKKENDE pixels dat na het
 * mengen met die achtergrond minder dan `MIN_CONTRAST` contrast heeft.
 *
 * @returns {{doorzichtig: number, wegvallend: {donker: number, licht: number}} | null}
 */
export function logoAnalyse(data, breed, hoog) {
  const totaal = breed * hoog;
  if (!totaal) return null;
  const achter = Object.entries(SCHERM_ACHTERGROND).map(([naam, hex]) => [naam, leesKleur(hex)]);
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
