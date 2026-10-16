/**
 * Het stijlblad van het infoscherm: geen klasse met twee eigen regels.
 *
 * REGRESSIEWACHT, en hij faalt op 0.73.0 en 0.74.0. Voor het boekscherm van
 * de ruimtes kwam er een regel `.b-titel { font-size: calc(32px ...) }` bij,
 * maar `.b-titel` was al de titel van een nieuwsbericht (15px). De nieuwe regel
 * stond later en won: de nieuwskoppen werden twee keer zo groot, en in een blok
 * dat op vijf stond pasten er nog drie. Gemeld op 16 oktober 2026 met een
 * schermafdruk; gemeten 28,6 tegen 15,3 pixels voor de kop van het blok.
 *
 * Het stijlblad is één sjabloon in een bestand van drieduizend regels, en een
 * klassenaam kies je zonder alle andere te kennen. Wat hier geteld wordt: een
 * regel die met één klasse begint, op het bovenste niveau (twee spaties in).
 * Komt die klasse twee keer zo voor, dan zijn het twee dingen met één naam.
 * Een samengestelde regel (`.blok.klein .bericht`) telt niet: dat is een
 * uitzondering op een bestaande, en dat is juist de bedoeling.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { MEER, meerTekst } from "../../src/cards/infoscherm-logica.js";

function stijlblad(pad) {
  const bron = readFileSync(new URL(`../../${pad}`, import.meta.url), "utf8");
  const begin = bron.indexOf("const css = /* css */ `");
  assert.ok(begin >= 0, `geen stijlblad gevonden in ${pad}`);
  return bron.slice(begin, bron.indexOf("`;", begin));
}

function dubbel(css) {
  const tel = new Map();
  for (const m of css.matchAll(/^ {2}\.([a-z][a-z0-9-]*) \{/gm)) tel.set(m[1], (tel.get(m[1]) ?? 0) + 1);
  return [...tel].filter(([, n]) => n > 1).map(([k]) => k);
}

describe("het stijlblad van het infoscherm", () => {
  it("REGRESSIEWACHT: geen klasse heeft twee eigen regels", () => {
    assert.deepEqual(dubbel(stijlblad("src/cards/infoscherm-card.js")), []);
  });

  it("de wacht vangt het ook echt: de regel van 0.73.0 erbij geeft .b-titel", () => {
    const css = `  .b-titel { font-size: calc(15px * var(--s)); }\n  .rb-titel { font-size: 32px; }\n  .b-titel { font-size: calc(32px * var(--s)); }\n`;
    assert.deepEqual(dubbel(css), ["b-titel"]);
  });
});

/**
 * De knop in de kop van een blok. NIEUW GEDRAG (16 oktober 2026): tot dan
 * stond er overal "Alles bekijken". *"nu zegt elk blok meer bekijken maar dat
 * vind ik niet toepasselijk voor sommige blokken verander die namen"*.
 */
describe("de knop in de kop van een blok", () => {
  it("zegt per blok wat je er vindt of kunt doen", () => {
    assert.equal(meerTekst("nieuws", {}), "Meer nieuws");
    assert.equal(meerTekst("aanwezig", {}), "Aan- en afmelden");
    assert.equal(meerTekst("verlichting", {}), "Bedienen");
    assert.equal(meerTekst("weer", {}), "Verwachting");
    assert.equal(meerTekst("wifi", {}), "Groot tonen");
  });

  it("geen blok met een pagina zegt nog Alles bekijken", () => {
    for (const [soort, tekst] of Object.entries(MEER)) assert.notEqual(tekst, "Alles bekijken", soort);
  });

  it("de ruimtes: Boeken als er geboekt kan worden, anders Planning", () => {
    assert.equal(meerTekst("ruimtes", { boeken_op_scherm: true }), "Boeken");
    assert.equal(meerTekst("ruimtes", { boeken_op_scherm: false }), "Planning");
  });

  it("het klimaat: Bedienen alleen als het op het scherm mag", () => {
    assert.equal(meerTekst("klimaat", { instellingen: {} }), "Bedienen");
    assert.equal(meerTekst("klimaat", { instellingen: { klimaat_bedienen: false } }), "Alle airco's");
  });

  it("kort genoeg voor een blok van twee breed (hooguit 16 tekens)", () => {
    for (const [soort, tekst] of Object.entries(MEER)) assert.ok(tekst.length <= 16, `${soort}: ${tekst}`);
    assert.ok("Alle airco's".length <= 16);
  });
});
