/**
 * Het rekenwerk van de brandstofkaart, zonder DOM (sinds 0.143.0).
 *
 * De eigenaar, 27 november 2026: *"kan jij zelf niet met lovelace iets maken? Dus een brandstofprijzen kaart van NL?"*,
 * met een voorbeeld van een Duitse kaart: *"kan die het zo maken bijvoorbeeld? In de style van een tankstation etc"*.
 * En: *"nee ik wil de adviesprijzen"* -- de landelijke adviesprijs (GLA) per brandstof, niet per pomp.
 *
 * De prijzen haalt de server (`brandstof.py`); hier staat hoe ze op een bord komen: de laatste cijfer klein en hoog,
 * zoals op een tankstation ("2,37" en dan "7"), cijfers van zeven segmenten, en de trend tegenover gisteren.
 */

import { nt, t } from "../taal.js";

/** Wat er te kiezen is, met de slugs van `brandstof.py`. De namen op het bord komen van de bron. */
export const BRANDSTOFFEN = [
  { slug: "euro95", naam: "Euro95" },
  { slug: "diesel", naam: "Diesel" },
  { slug: "lpg", naam: "LPG" },
  { slug: "super", naam: "Super" },
  { slug: "super-mlv", naam: "Super MLV" },
  { slug: "premium-benzines", naam: "Premium benzines" },
  { slug: "premium-diesels", naam: "Premium diesels" },
];

export const STANDAARD = ["euro95", "diesel", "lpg", "super"];

/** De brandstoffen op deze kaart, in de volgorde van de config; zonder keuze de standaard. */
export function gekozen(config) {
  const lijst = Array.isArray(config?.brandstoffen) && config.brandstoffen.length ? config.brandstoffen : STANDAARD;
  return [...new Set(lijst.map(String))];
}

/** "2,377" als `{hoofd: "2,37", staart: "7"}`: de laatste cijfer staat op het bord klein en hoog. */
export function prijsDelen(prijs) {
  if (prijs === null || prijs === undefined || prijs === "") return null;
  const n = Number(prijs);
  if (!Number.isFinite(n)) return null;
  const tekst = n.toFixed(3).replace(".", ",");
  return { hoofd: tekst.slice(0, -1), staart: tekst.slice(-1) };
}

/**
 * De trend tegenover gisteren: omhoog is duurder (rood), omlaag goedkoper (groen). Rood en groen zijn hier status, en
 * dat mag (zie theme.js). Het verschil in centen, zoals de bron het ook geeft.
 *
 * @returns {{richting: "op"|"af"|"gelijk", tekst: string, toon: "bad"|"good"|"neutral"}|null}
 */
export function trend(verschil) {
  const v = Number(verschil);
  if (verschil === null || verschil === undefined || !Number.isFinite(v)) return null;
  const cent = Math.round(v * 1000) / 10;
  if (cent === 0) return { richting: "gelijk", tekst: t("gelijk"), toon: "neutral" };
  const getal = Math.abs(cent).toFixed(1).replace(".", ",");
  return cent > 0
    ? { richting: "op", tekst: t("+{ct} ct", { ct: getal }), toon: "bad" }
    : { richting: "af", tekst: t("−{ct} ct", { ct: getal }), toon: "good" };
}

/**
 * Het pad van een lijntje door de reeks, in een vak van `breed` bij `hoog`. Een vlakke reeks staat in het midden.
 *
 * @param {Array<[string, number]>} reeks oud naar nieuw
 */
export function lijnPad(reeks, breed = 100, hoog = 24) {
  const prijzen = (reeks ?? []).map((r) => Number(r?.[1])).filter(Number.isFinite);
  if (prijzen.length < 2) return "";
  const min = Math.min(...prijzen);
  const max = Math.max(...prijzen);
  const rand = 2;
  const y = (p) => (max === min ? hoog / 2 : rand + ((max - p) / (max - min)) * (hoog - 2 * rand));
  return prijzen
    .map((p, i) => `${i ? "L" : "M"}${((i / (prijzen.length - 1)) * breed).toFixed(2)} ${y(p).toFixed(2)}`)
    .join(" ");
}

/* ------------------------------------------------------- zeven segmenten
 *
 * Een cijfer zoals op een prijsbord: zeven staafjes, de uitgezette heel zwak zichtbaar. Eigen SVG, want webfonts laden
 * we niet (zie CLAUDE.md, vormtaal), en een gewoon lettertype leest niet als een tankstation.
 *
 *    aaa
 *   f   b
 *    ggg
 *   e   c
 *    ddd
 */
const AAN = {
  0: "abcdef",
  1: "bc",
  2: "abged",
  3: "abgcd",
  4: "fgbc",
  5: "afgcd",
  6: "afgedc",
  7: "abc",
  8: "abcdefg",
  9: "abcdfg",
};

const STAAF = {
  a: [2.2, 0.4, 7.6, 2],
  g: [2.2, 9, 7.6, 2],
  d: [2.2, 17.6, 7.6, 2],
  f: [0.4, 2.2, 2, 6.9],
  b: [9.6, 2.2, 2, 6.9],
  e: [0.4, 10.9, 2, 6.9],
  c: [9.6, 10.9, 2, 6.9],
};

/** Welke staafjes er aan staan voor dit teken, of null als het geen cijfer is. */
export const segmenten = (teken) => AAN[teken] ?? null;

/**
 * Het SVG van een getal als "2,37". Een komma is een puntje onderaan. `klein` voor de staart: kleiner en hoog, zoals de
 * 9 op een Duits bord en de laatste cijfer op een Nederlands.
 */
export function cijferSvg(tekst) {
  const tekens = [...String(tekst ?? "")];
  let x = 0;
  const delen = [];
  for (const teken of tekens) {
    if (teken === "," || teken === ".") {
      delen.push(`<rect class="aan" x="${x + 0.6}" y="17.6" width="2.2" height="2.2" rx="0.6"/>`);
      x += 4;
      continue;
    }
    const aan = segmenten(teken);
    if (aan === null) continue;
    for (const [naam, [sx, sy, w, h]] of Object.entries(STAAF)) {
      delen.push(
        `<rect class="${aan.includes(naam) ? "aan" : "uit"}" x="${(x + sx).toFixed(1)}" y="${sy}" width="${w}" height="${h}" rx="0.9"/>`
      );
    }
    x += 14;
  }
  const breed = Math.max(1, x - 2);
  // Een tikje schuin, zoals een bord: de transform houdt de tekening binnen het vak.
  return `<svg class="cijfers" viewBox="-1 0 ${breed + 3} 20" style="--breed:${breed + 3}" aria-hidden="true"><g transform="skewX(-6) translate(2 0)">${delen.join("")}</g></svg>`;
}

/** De tekst voor een schermlezer en voor wie selecteert: "€ 2,377 per liter". */
export const prijsTekst = (prijs) => t("€ {prijs} per liter", { prijs: Number(prijs).toFixed(3).replace(".", ",") });

/** "Adviesprijs van 27 nov" op de kaart; `datum` is "2026-11-27". */
export function datumRegel(datum, locale) {
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(datum ?? "")) ? new Date(`${datum}T12:00:00`) : null;
  if (!d || Number.isNaN(d.getTime())) return t(GLA);
  return t("{gla} van {datum}", { gla: t(GLA), datum: d.toLocaleDateString(locale, { day: "numeric", month: "short" }) });
}

const GLA = nt("Landelijke adviesprijs");
