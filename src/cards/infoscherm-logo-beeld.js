/**
 * Het canvaswerk aan een logo in het beheer van het infoscherm: de lege rand
 * wegsnijden vóór het uploaden, en meten of het op het scherm te zien is. Het
 * rekenwerk zelf staat in `infoscherm-logo.js` (daar staat ook waarom).
 *
 * Alles hier mag mislukken zonder dat de receptie er last van heeft: dan gaat
 * het bestand zoals het is, en komt er geen waarschuwing.
 */

import { logoAnalyse, metLucht, moetBijsnijden, zichtbaarKader } from "./infoscherm-logo.js";

/* Alleen deze soorten kunnen doorzichtig zijn EN blijven hetzelfde als ze via
   een canvas gaan. Een GIF kan bewegen en een SVG is geen raster; die blijven
   zoals ze zijn. */
const SNIJBAAR = new Set(["image/png", "image/webp"]);

/* Om te meten is een klein plaatje genoeg, en dat scheelt rekenwerk bij een
   logo van duizenden pixels breed. */
const MEETMAAT = 400;

async function laad(url) {
  const img = new Image();
  img.src = url;
  await img.decode();
  return img;
}

function pixels(img, breed, hoog, kader = { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight }) {
  const canvas = document.createElement("canvas");
  canvas.width = breed;
  canvas.height = hoog;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, kader.x, kader.y, kader.w, kader.h, 0, 0, breed, hoog);
  return { canvas, data: ctx.getImageData(0, 0, breed, hoog).data };
}

/**
 * Meet een logo dat al in de pagina staat (een `blob:`-URL).
 * @returns {Promise<ReturnType<typeof logoAnalyse>>} null als het niet lukte
 */
export async function analyseerLogo(url) {
  try {
    const img = await laad(url);
    const schaal = Math.min(1, MEETMAAT / Math.max(img.naturalWidth, img.naturalHeight));
    const breed = Math.max(1, Math.round(img.naturalWidth * schaal));
    const hoog = Math.max(1, Math.round(img.naturalHeight * schaal));
    return logoAnalyse(pixels(img, breed, hoog).data, breed, hoog);
  } catch {
    return null;
  }
}

/**
 * Snijd de doorzichtige rand van een logo weg, met wat lucht eromheen.
 * @returns {Promise<{bestand: File, bijgesneden: boolean}>}
 */
export async function snijLogoBij(bestand) {
  if (!SNIJBAAR.has(bestand?.type)) return { bestand, bijgesneden: false };
  const url = URL.createObjectURL(bestand);
  try {
    const img = await laad(url);
    const breed = img.naturalWidth;
    const hoog = img.naturalHeight;
    const kader = zichtbaarKader(pixels(img, breed, hoog).data, breed, hoog);
    if (!moetBijsnijden(kader, breed, hoog)) return { bestand, bijgesneden: false };
    const vak = metLucht(kader, breed, hoog);
    const { canvas } = pixels(img, vak.w, vak.h, vak);
    const blob = await new Promise((klaar) => canvas.toBlob(klaar, "image/png"));
    if (!blob) return { bestand, bijgesneden: false };
    const naam = String(bestand.name || "logo").replace(/\.[^.]+$/, "") + ".png";
    return { bestand: new File([blob], naam, { type: "image/png" }), bijgesneden: true };
  } catch {
    return { bestand, bijgesneden: false };
  } finally {
    URL.revokeObjectURL(url);
  }
}
