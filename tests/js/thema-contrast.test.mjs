/**
 * De lichte tokens zijn te LEZEN — NIEUW GEDRAG (0.54.0).
 *
 * Een licht thema maken door het donkere om te keren geeft kleuren die op wit
 * wegvallen: het heldere accent (#198fd9) haalt op een lichte kaart 3,1:1 en
 * het lampgeel (#f5c451) 1,5:1. Deze toets rekent elke kleur uit tegen het
 * vlak waar hij op komt te staan: het lichte kaartvlak op een witte pagina.
 *
 * De ondergrenzen zijn die van WCAG waar het om tekst gaat (4,5:1 voor gewone
 * tekst, 3:1 voor grote tekst en voor iconen). Eén kleur haalt de 3:1 met opzet
 * niet: het lampgeel. Geel dat op wit 3:1 haalt is bruin. Het staat daarom
 * nooit alleen: de chip draagt dezelfde kleur als vulling en rand, en de naam
 * en de stand staan ernaast in inkt.
 *
 * En de andere kant: in DONKER mag er niets verschoven zijn. Dat staat
 * onderaan, als REGRESSIEWACHT.
 *
 * Sinds 0.66.0 zijn de lichte waarden die van het paneel van de Coach (zijn
 * `lightTokens`, v0.113.0): de eigenaar op 14 oktober 2026, *"ja
 * gelijktrekken"*. Het kaartvlak is daardoor WIT, met een rand, en niet meer
 * zachtgrijs. De test "de kaart is te onderscheiden van wit" (0.54.0) beschreef
 * het oude vlak en is vervangen door een test op de rand. Op 0.65.1 falen de
 * nieuwe tests hieronder (NIEUW GEDRAG, 0.66.0).
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { lichtTokens, themaCss, tokens } from "../../src/theme.js";
import { LICHT_VLAK, contrast, leesKleur, opOndergrond } from "../../src/thema-logica.js";

const WIT = [255, 255, 255];

const waarde = (css, naam) => {
  const gevonden = new RegExp(`--dac-${naam}:\\s*([^;]+);`).exec(css);
  assert.ok(gevonden, `--dac-${naam} ontbreekt`);
  return gevonden[1].trim();
};
const kleur = (css, naam) => {
  const k = leesKleur(waarde(css, naam));
  assert.ok(k, `--dac-${naam} is geen kleur die te lezen is: ${waarde(css, naam)}`);
  return k;
};

/** Het kaartvlak: het oppervlak van de kaart over de pagina erachter. */
const vlak = opOndergrond(kleur(lichtTokens, "surface"), WIT);

/** Het contrast van een token tegen het lichte kaartvlak. */
const opKaart = (naam) => contrast(opOndergrond(kleur(lichtTokens, naam), vlak), vlak);

describe("de lichte tokens tegen het lichte kaartvlak op wit", () => {
  it("het kaartvlak is wat thema-logica.js ervan zegt", () => {
    // LICHT_VLAK staat daar als getal, omdat de lampkleur ertegen gerekend
    // wordt. Verandert --dac-surface, dan hoort dat getal mee te gaan.
    for (let i = 0; i < 3; i += 1) assert.ok(Math.abs(vlak[i] - LICHT_VLAK[i]) < 0.6, `${vlak} tegen ${LICHT_VLAK}`);
  });

  it("NIEUW GEDRAG (0.66.0): de kaart is wit, en de rand zet hem af van een witte pagina", () => {
    assert.deepEqual(vlak, WIT);
    const rand = opOndergrond(kleur(lichtTokens, "border"), WIT);
    // Een haarlijn hoeft geen 3:1 te halen, maar moet er wel zijn: 0,11 zwart
    // over wit is ongeveer #e3e3e2.
    assert.ok(rand[0] < 232 && rand[0] > 215, `rand ${rand}`);
  });

  const ONDERGRENS = {
    ink: 7,
    "ink-2": 4.5,
    "ink-3": 3,
    accent: 4.5,
    "accent-hi": 4.5,
    good: 3,
    warn: 3,
    bad: 4.5,
    lit: 2.5,
  };
  for (const [naam, grens] of Object.entries(ONDERGRENS)) {
    it(`--dac-${naam} haalt ${grens}:1`, () => {
      const c = opKaart(naam);
      assert.ok(c >= grens, `--dac-${naam} haalt ${c.toFixed(2)}:1, nodig ${grens}:1`);
    });
  }

  it("tekst op een accentvlak is wit en haalt 4,5:1", () => {
    for (const [tekst, vulling] of [
      ["on-accent", "accent"],
      ["on-accent-hi", "accent-hi"],
    ]) {
      const c = contrast(kleur(lichtTokens, tekst), kleur(lichtTokens, vulling));
      assert.ok(c >= 4.5, `--dac-${tekst} op --dac-${vulling}: ${c.toFixed(2)}:1`);
    }
  });

  it("de zes identiteitskleuren zijn NIET aangepast", () => {
    // Die zijn als set doorgezocht op onderlinge afstand; zie de kop van
    // theme.js. Een lichte variant ervan vraagt diezelfde zoektocht opnieuw.
    for (const naam of ["solar", "house", "grid-in", "grid-out", "device-1", "device-2"]) {
      assert.ok(!new RegExp(`--dac-${naam}:`).test(lichtTokens), `--dac-${naam} staat in de lichte tokens`);
    }
  });
});

describe("NIEUW GEDRAG (0.66.0): de lichte waarden zijn die van de Coach", () => {
  // Overgenomen uit domotiapp-coach/frontend/src/theme.js, `lightTokens`,
  // zoals die er stond op 14 oktober 2026 (coach v0.119.1; de set is van
  // v0.113.0). Verandert hij daar, dan hoort hij hier mee te gaan.
  const COACH = {
    bg: "#f1f0ec",
    "bg-raise": "#ffffff",
    surface: "#ffffff",
    "surface-hi": "rgba(20, 20, 15, 0.045)",
    border: "rgba(20, 20, 15, 0.11)",
    "border-hi": "rgba(20, 20, 15, 0.22)",
    ink: "#1c1b18",
    "ink-2": "rgba(28, 27, 24, 0.74)",
    "ink-3": "rgba(28, 27, 24, 0.60)",
    accent: "#026fa1",
    "accent-hi": "#0a6aa6",
    "accent-soft": "rgba(2, 111, 161, 0.12)",
    "accent-glow": "rgba(10, 106, 166, 0.20)",
    good: "#0a8a0a",
    warn: "#946200",
    bad: "#c63131",
    // Zijn `--dac-veil` heet hier `--dac-tint`.
    tint: "20, 20, 15",
  };
  // Deze drie waren in 0.65.1 al gelijk aan het paneel; hun tests slagen daar
  // ook, en zijn dus REGRESSIEWACHT.
  const AL_GELIJK = new Set(["bg-raise", "accent", "accent-soft"]);
  for (const [naam, verwacht] of Object.entries(COACH)) {
    const label = `${AL_GELIJK.has(naam) ? "REGRESSIEWACHT: " : ""}--dac-${naam} is ${verwacht}, net als in het paneel`;
    it(label, () => assert.equal(waarde(lichtTokens, naam), verwacht));
  }

  it("REGRESSIEWACHT: met opzet anders dan de Coach, geen slagschaduw onder een kaart (valkuil 22)", () => {
    assert.equal(waarde(lichtTokens, "shadow"), "none");
  });

  it("een hover zonder eigen rand is in licht een tint, geen wit op wit", () => {
    assert.equal(waarde(lichtTokens, "hover"), "var(--dac-surface-hi)");
  });
});

describe("wat het lichte thema omkeert staat ook in het donkere", () => {
  it("elke lichte token bestaat in donker", () => {
    // Anders heeft een kaart in donker een var() zonder waarde, en dat geeft
    // geen fout maar een doorzichtig vlak.
    const namen = [...lichtTokens.matchAll(/--dac-([\w-]+):/g)].map((m) => m[1]);
    assert.ok(namen.length > 20);
    for (const naam of namen) assert.ok(new RegExp(`--dac-${naam}:`).test(tokens), `--dac-${naam} ontbreekt in donker`);
  });

  it("het lichte blok hangt aan het attribuut dat thema.js zet", () => {
    assert.ok(themaCss.includes(':host([dac-thema="licht"])'));
    assert.ok(themaCss.includes("column-rule-color: var(--primary-text-color, transparent)"));
  });
});

describe("REGRESSIEWACHT: in donker is er niets verschoven", () => {
  const VAST = {
    bg: "#0c0c0a",
    "bg-raise": "#12120f",
    surface: "rgba(255, 255, 255, 0.038)",
    "surface-hi": "rgba(255, 255, 255, 0.070)",
    border: "rgba(232, 228, 222, 0.10)",
    "border-hi": "rgba(232, 228, 222, 0.20)",
    ink: "#e8e4de",
    "ink-2": "rgba(232, 228, 222, 0.62)",
    "ink-3": "rgba(232, 228, 222, 0.38)",
    accent: "#026fa1",
    "accent-hi": "#198fd9",
    good: "#0ca30c",
    warn: "#fab219",
    bad: "#d03b3b",
    lit: "#f5c451",
    // Wat tot 0.54.0 los in de kaarten stond, met de waarde die er stond.
    tint: "255, 255, 255",
    "on-accent-hi": "#0c0c0a",
    diepte: "1",
    "spoor-aan": "28%",
    "spoor-rand": "55%",
    knob: "var(--dac-ink)",
    "knob-uit": "var(--dac-ink-2)",
    // Sinds 0.66.0 een eigen naam voor wat er stond: het kaartvlak.
    hover: "var(--dac-surface)",
  };
  for (const [naam, verwacht] of Object.entries(VAST)) {
    it(`--dac-${naam} is ${verwacht}`, () => assert.equal(waarde(tokens, naam), verwacht));
  }
});
