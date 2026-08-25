/**
 * Zoeken in de iconenset.
 *
 * NIEUW GEDRAG: `src/editor/icoon-zoek.js` bestond niet vóór deze ronde. De
 * kiezer toonde honderd iconen in elf groepen en had geen zoekveld; wie het
 * woord "slapen" in zijn hoofd had, moest gaan scannen -- en vond niets, want
 * het icoon heet `bed` en er stond geen bed in.
 *
 * Wat hier getoetst wordt is precies wat een zoekveld waardeloos maakt zodra
 * het niet klopt:
 *
 * - Het woord dat de eigenaar typt is Nederlands; de sleutel is Engels. "sleep"
 *   moet het bed vinden en "gordijn" het rolluik, anders is de hele exercitie
 *   voor niets geweest. Dit is de aanleiding: hij vroeg om precies dat.
 * - Elk woord in de zoekopdracht moet raak zijn. "lamp keuken" mag niet elke
 *   lamp én elke keuken opleveren.
 * - Een zoekopdracht die niets oplevert hoort LEEG terug te komen, niet stil
 *   terug te vallen op alles. Dat laatste leest als "hij doet niks".
 * - Volgorde: wat precies past staat boven wat er toevallig in zit.
 * - En de bewaker: elk getekend icoon staat in het raster én heeft zoekwoorden.
 *   Vergeet je die bij een nieuw icoon, dan is het alleen op zijn Engelse
 *   sleutel te vinden, en dat is in de praktijk onvindbaar.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { icons } from "../../src/icons.js";
import {
  GROEPEN,
  TERMEN,
  alleSleutels,
  naamVan,
  normaliseer,
  ontbrekendeTermen,
  scoreIcoon,
  scoreWoord,
  zoekIconen,
} from "../../src/editor/icoon-zoek.js";

/** De platte lijst sleutels die een zoekopdracht oplevert. */
const zoek = (vraag) => zoekIconen(vraag).flatMap(([, keys]) => keys);

describe("normaliseren", () => {
  it("slaat hoofdletters, accenten en dubbele spaties plat", () => {
    assert.equal(normaliseer("  Slaap Kamer "), "slaap kamer");
    assert.equal(normaliseer("café"), "cafe");
    assert.equal(normaliseer("1e   verdieping"), "1e verdieping");
  });

  it("houdt niets over van leegte", () => {
    for (const leeg of ["", "   ", null, undefined, "!!!"]) {
      assert.equal(normaliseer(leeg), "");
    }
  });
});

describe("het Nederlandse woord vindt het Engelse icoon", () => {
  it("vindt het bed op slapen -- de vraag waar dit voor gebouwd is", () => {
    for (const woord of ["sleep", "slaap", "slapen", "slaapkamer", "bed", "nacht"]) {
      assert.ok(zoek(woord).includes("bed"), `"${woord}" vond het bed niet`);
    }
  });

  it("vindt de kamers die er vóór deze ronde niet waren", () => {
    const paren = [
      ["keuken", "kitchen"],
      ["koken", "kitchen"],
      ["woonkamer", "sofa"],
      ["bank", "sofa"],
      ["badkamer", "shower"],
      ["douche", "shower"],
      ["wc", "toilet"],
      ["kantoor", "desk"],
      ["trap", "stairs"],
      ["tuin", "tree"],
      ["terras", "parasol"],
      ["hek", "fence"],
      ["kledingkast", "wardrobe"],
      ["kleerhanger", "hanger"],
      ["tweepersoonsbed", "bedDouble"],
    ];
    for (const [woord, sleutel] of paren) {
      assert.ok(zoek(woord).includes(sleutel), `"${woord}" vond ${sleutel} niet`);
    }
  });

  it("vindt bestaande iconen op het woord dat de kaart gebruikt", () => {
    const paren = [
      ["gordijn", "shutter"],
      ["wasmachine", "washer"],
      ["vaatwasser", "dishwasher"],
      ["stopcontact", "plug"],
      ["afval", "bin"],
      ["luchtvochtigheid", "drop"],
      ["instellingen", "cog"],
      ["begane grond", "floorB"],
      ["2 persoons", "bedDouble"],
    ];
    for (const [woord, sleutel] of paren) {
      assert.ok(zoek(woord).includes(sleutel), `"${woord}" vond ${sleutel} niet`);
    }
  });
});

describe("elk woord moet raak zijn", () => {
  it("geeft alleen wat aan álle woorden voldoet", () => {
    const uit = zoek("slaapkamer kast");
    assert.ok(uit.includes("wardrobe"));
    // Het bed voldoet aan "slaapkamer" maar niet aan "kast".
    assert.ok(!uit.includes("bed"));
  });

  it("komt leeg terug als er niets past, en valt niet terug op alles", () => {
    const uit = zoek("qqqzzz");
    assert.deepEqual(uit, []);
    assert.equal(zoekIconen("qqqzzz").length, 1, "één (lege) groep, geen elf");
  });

  it("geeft zonder zoekopdracht het hele raster ongewijzigd terug", () => {
    for (const leeg of ["", "   ", null, undefined]) {
      assert.equal(zoekIconen(leeg), GROEPEN);
    }
  });
});

describe("volgorde", () => {
  it("zet een exacte treffer boven een gedeeltelijke", () => {
    assert.equal(zoek("bed")[0], "bed", "het bed hoort bovenaan bij 'bed'");
    assert.equal(zoek("wc")[0], "toilet");
    assert.equal(zoek("kledingkast")[0], "wardrobe");
  });

  it("weegt een woord dat vooraan in de lijst staat zwaarder", () => {
    // "buiten" is voor de parasol het tweede woord en voor de auto het achtste:
    // allebei raak, maar niet even raak.
    const uit = zoek("buiten");
    assert.ok(uit.indexOf("parasol") < uit.indexOf("car"));
  });

  it("scoort exact hoger dan begint-met, en die weer hoger dan bevat", () => {
    assert.ok(scoreWoord("bed", "bed") > scoreWoord("bed", "slaap"));
    assert.ok(scoreWoord("bed", "slaapk") > 0);
    assert.equal(scoreWoord("bed", "vaatwasser"), 0);
  });

  it("telt de woorden van een zoekopdracht bij elkaar op", () => {
    const een = scoreIcoon("wardrobe", ["kast"]);
    const twee = scoreIcoon("wardrobe", ["kast", "kleding"]);
    assert.ok(twee > een);
    assert.equal(scoreIcoon("wardrobe", ["kast", "vaatwasser"]), 0);
  });
});

describe("de bewaker", () => {
  it("heeft van elk getekend icoon een plek in het raster én zoekwoorden", () => {
    const uit = ontbrekendeTermen(Object.keys(icons));
    assert.deepEqual(
      uit,
      { zonderTermen: [], zonderTekening: [], nietInRaster: [] },
      "een nieuw icoon hoort in icons.js, in GROEPEN én in TERMEN"
    );
  });

  it("laat nooit een camelCase-sleutel als naam op het scherm komen", () => {
    // "garage", "radio" en "wifi" zijn in het Nederlands hetzelfde woord, dus
    // naam == sleutel is daar juist goed. Wat NIET goed is, is een sleutel als
    // `floorB`, `bedDouble` of `garageOpen` die onder een icoon verschijnt:
    // dat is een vergeten TERMEN-regel, en het is aan de hoofdletter te zien.
    const lelijk = alleSleutels().filter((k) => /[A-Z]/.test(naamVan(k)));
    assert.deepEqual(lelijk, [], "deze iconen tonen nog hun sleutel als naam");
  });

  it("laat geen sleutel in TERMEN staan die nergens in het raster hangt", () => {
    const inRaster = new Set(alleSleutels());
    const zwevend = Object.keys(TERMEN).filter((k) => !inRaster.has(k));
    assert.deepEqual(zwevend, []);
  });
});
