/**
 * Het logo op het infoscherm: de lege rand, en of het op het scherm te zien is.
 *
 * NIEUW GEDRAG (12 oktober 2026). `src/cards/infoscherm-logo.js` bestond niet
 * vóór deze ronde; op de code van ervoor faalt dit bestand met
 * ERR_MODULE_NOT_FOUND.
 *
 * ## Waarom dit stuk een test verdient
 *
 * Bij een klant bleef het logo weg op de iPad, terwijl alles klopte: het
 * plaatje had zwarte letters op een doorzichtige achtergrond, en het scherm
 * stond op Donker. Niemand zag het aankomen, want in het beheer stond het op
 * het vlak van Home Assistant. Het nabouwsel hieronder heeft dezelfde vorm:
 * 93% doorzichtig, zwarte letters, een dunne rode lijn, en het zichtbare deel
 * over 45% van de hoogte.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  SCHERM,
  logoAnalyse,
  logoOndergrond,
  logoWaarschuwing,
  metLucht,
  moetBijsnijden,
  zichtbaarKader,
} from "../../src/cards/infoscherm-logo.js";
import { leesKleur } from "../../src/thema-logica.js";

/** Een doorzichtig plaatje, met rechthoeken `[x, y, w, h, [r, g, b, a]]` erop. */
function plaatje(breed, hoog, vlakken = []) {
  const data = new Uint8ClampedArray(breed * hoog * 4);
  for (const [x0, y0, w, h, kleur] of vlakken) {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) data.set(kleur, (y * breed + x) * 4);
    }
  }
  return data;
}

const ZWART = [10, 10, 10, 255];
const ROOD = [208, 2, 27, 255];
const WIT = [255, 255, 255, 255];

/* Het logo van de klant, op een tiende van de maat: 141 x 62, de inhoud van
   rij 17 tot 45 (45% van de hoogte), zwarte letters en een dunne rode lijn. */
const KLANT = { breed: 141, hoog: 62 };
const klantLogo = (letters = ZWART) =>
  plaatje(KLANT.breed, KLANT.hoog, [
    [20, 17, 100, 20, letters], // de naam
    [20, 40, 100, 5, letters], // de ondertitel
    [10, 17, 4, 28, ROOD], // het beeldmerk, een dunne lijn
  ]);

describe("zichtbaarKader", () => {
  it("vindt het vak om de inhoud van het logo van de klant", () => {
    const kader = zichtbaarKader(klantLogo(), KLANT.breed, KLANT.hoog);
    assert.deepEqual(kader, { x: 10, y: 17, w: 110, h: 28 });
    // Zonder bijsnijden is het zichtbare deel 28 van de 62 rijen hoog: het
    // welkomblok tekende het op minder dan de helft van zijn hoogte.
    assert.ok(kader.h / KLANT.hoog < 0.46);
  });

  it("telt een pixel die bijna doorzichtig is niet mee", () => {
    const data = plaatje(10, 10, [[2, 2, 3, 3, ZWART], [8, 8, 1, 1, [0, 0, 0, 10]]]);
    assert.deepEqual(zichtbaarKader(data, 10, 10), { x: 2, y: 2, w: 3, h: 3 });
  });

  it("geeft null bij een helemaal doorzichtig plaatje", () => {
    assert.equal(zichtbaarKader(plaatje(5, 5), 5, 5), null);
  });
});

describe("metLucht", () => {
  it("legt 2% van de lange kant om het vak, minstens 2 pixels", () => {
    assert.deepEqual(metLucht({ x: 100, y: 170, w: 1100, h: 280 }, 1410, 620), { x: 78, y: 148, w: 1144, h: 324 });
    assert.deepEqual(metLucht({ x: 10, y: 10, w: 20, h: 20 }, 100, 100), { x: 8, y: 8, w: 24, h: 24 });
  });

  it("blijft binnen het plaatje", () => {
    assert.deepEqual(metLucht({ x: 0, y: 1, w: 100, h: 98 }, 100, 100), { x: 0, y: 0, w: 100, h: 100 });
  });
});

describe("moetBijsnijden", () => {
  it("ja bij het logo van de klant", () => {
    const kader = zichtbaarKader(klantLogo(), KLANT.breed, KLANT.hoog);
    assert.equal(moetBijsnijden(kader, KLANT.breed, KLANT.hoog), true);
  });

  it("nee als er maar een paar pixels af zouden gaan, of niets zichtbaar is", () => {
    assert.equal(moetBijsnijden({ x: 1, y: 1, w: 98, h: 98 }, 100, 100), false);
    assert.equal(moetBijsnijden(null, 100, 100), false);
  });
});

describe("logoAnalyse en logoWaarschuwing", () => {
  it("het logo van de klant valt weg op het donkere scherm, niet op het lichte", () => {
    const analyse = logoAnalyse(klantLogo(), KLANT.breed, KLANT.hoog);
    assert.ok(analyse.doorzichtig > 0.6, `doorzichtig ${analyse.doorzichtig}`);
    assert.ok(analyse.wegvallend.donker > 0.8, `donker ${analyse.wegvallend.donker}`);
    assert.equal(analyse.wegvallend.licht, 0);
    assert.match(logoWaarschuwing(analyse, "donker"), /valt grotendeels weg op het donkere scherm/);
    assert.equal(logoWaarschuwing(analyse, "licht"), "");
  });

  it("zonder uiterlijk is het scherm donker, zoals in het beheer", () => {
    const analyse = logoAnalyse(klantLogo(), KLANT.breed, KLANT.hoog);
    assert.equal(logoWaarschuwing(analyse, undefined), logoWaarschuwing(analyse, "donker"));
  });

  it("de versie met witte letters valt weg op het lichte scherm", () => {
    const analyse = logoAnalyse(klantLogo(WIT), KLANT.breed, KLANT.hoog);
    assert.equal(logoWaarschuwing(analyse, "donker"), "");
    assert.match(logoWaarschuwing(analyse, "licht"), /valt grotendeels weg op het lichte scherm/);
  });

  it("een logo met een eigen vlak is altijd te zien, ook als dat vlak zwart is", () => {
    const data = plaatje(20, 10, [[0, 0, 20, 10, ZWART], [4, 3, 12, 4, WIT]]);
    const analyse = logoAnalyse(data, 20, 10);
    assert.equal(analyse.doorzichtig, 0);
    assert.equal(logoWaarschuwing(analyse, "donker"), "");
  });

  it("een rode lijn naast zwarte letters is niet genoeg", () => {
    // Het bloemetje van 25 px dat overbleef: wel te zien, maar het logo niet.
    const analyse = logoAnalyse(klantLogo(), KLANT.breed, KLANT.hoog);
    assert.ok(analyse.wegvallend.donker < 1);
  });

  it("zonder meting geen waarschuwing", () => {
    assert.equal(logoWaarschuwing(null, "donker"), "");
    assert.equal(logoAnalyse(new Uint8ClampedArray(0), 0, 0), null);
  });
});

describe("SCHERM en logoOndergrond", () => {
  it("donker leest --dac-bg en --dac-surface uit de tokens van de kaarten", () => {
    assert.equal(SCHERM.donker.achtergrond, "#0c0c0a");
    assert.deepEqual(leesKleur(SCHERM.donker.vlak), [255, 255, 255, 0.038]);
  });

  // NIEUW GEDRAG (0.61.1): het welkomblok heeft een vlak, en het logo staat
  // daarop -- niet meer op de kale achtergrond.
  it("het logo staat op het vlak van het welkomblok, een tikje anders dan de achtergrond", () => {
    assert.deepEqual(logoOndergrond("donker"), [21, 21, 19]);
    assert.deepEqual(logoOndergrond("licht"), [233, 231, 226]);
    assert.deepEqual(logoOndergrond(undefined), logoOndergrond("donker"));
  });
});
