/**
 * Een tijdveld (`<input type="time">`) op een kaart: de tijd op het midden.
 *
 * REGRESSIEWACHT, en hij faalt op 0.80.2. Safari op iOS centreert de waarde
 * van een tijdveld met de flexbox van het veld zelf: in `html.css` van WebKit
 * is `input[type=time]` `inline-flex` met `align-items: center`, en de waarde
 * (`::-webkit-date-and-time-value`) is een blok daarin. Wie het veld
 * `display: block` geeft, zet die waarde bovenaan het vak. De laadpaalkaart
 * deed dat sinds 0.62.2. Gemeten op een schermafdruk van een iPhone op
 * 19 oktober 2026: "08:00" stond met zijn midden ruim 6 CSS-pixels boven dat
 * van "100%" in het vak ernaast, terwijl de vakken even hoog waren. In Chrome
 * staat de tijd ook met `display: block` op het midden, dus in de browser van
 * de werkbank is het niet te zien. Vandaar deze toets op de CSS.
 *
 * NIEUW GEDRAG: op de laadpaalkaart hebben tijdveld en stapper dezelfde
 * achtergrond. In licht was het tijdveld wit en de stapper grijs, en dan oogt
 * het witte vak kleiner dan het grijze.
 */

import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

const MAP = new URL("../../src/cards/", import.meta.url);

/** De klassen van de tijdvelden in een bronbestand. */
function tijdKlassen(bron) {
  const uit = new Set();
  for (const m of bron.matchAll(/<input\b[^>]*>/g)) {
    if (!/type="time"/.test(m[0])) continue;
    const k = m[0].match(/class="([^"]+)"/);
    if (k) for (const c of k[1].split(/\s+/)) uit.add(c);
  }
  return uit;
}

/** De CSS-regels in een bron: [kiezer, lijf]. */
function regels(css) {
  return [...css.matchAll(/([^{}]*)\{([^{}]*)\}/g)].map((m) => [m[1].trim().split("\n").pop().trim(), m[2]]);
}

/** Regels die een tijdveld een `display` geven die zijn waarde niet centreert. */
function blokTijdvelden(bron) {
  const fout = [];
  for (const klasse of tijdKlassen(bron)) {
    // Precies het veld zelf: `.tijd`, `.tijd:hover`, niet `.tijd::-webkit-...`.
    const eigen = new RegExp(`(^|[\\s,])\\.${klasse}(?![\\w-]|::)`);
    for (const [kiezer, lijf] of regels(bron)) {
      if (!eigen.test(kiezer)) continue;
      const d = lijf.match(/(?:^|[;\s])display\s*:\s*([\w-]+)/);
      // Verbergen (het tweede tijdvak in het beheer van het infoscherm) mag.
      if (!d || d[1] === "none") continue;
      const flex = /^(inline-)?flex$/.test(d[1]);
      const midden = /align-items\s*:\s*center/.test(lijf);
      if (!flex || !midden) fout.push(`${kiezer}: display ${d[1]}${flex ? " zonder align-items: center" : ""}`);
    }
  }
  return fout;
}

describe("een tijdveld op een kaart", () => {
  it("REGRESSIEWACHT: geen display die de tijd bovenaan zet", () => {
    const fout = [];
    let velden = 0;
    for (const naam of readdirSync(MAP).filter((n) => n.endsWith(".js"))) {
      const bron = readFileSync(new URL(naam, MAP), "utf8");
      velden += tijdKlassen(bron).size;
      for (const f of blokTijdvelden(bron)) fout.push(`${naam}: ${f}`);
    }
    // De laadpaalkaart en de entiteitenkaart; vindt hij er geen meer, dan
    // bewaakt hij ook niets meer.
    assert.ok(velden >= 2, `maar ${velden} tijdvelden gevonden`);
    assert.deepEqual(fout, []);
  });

  it("de wacht vangt het ook echt: het tijdveld van de laadpaal in 0.80.2", () => {
    const bron = `<input class="tijd" type="time" step="60" />
    .tijd {
      -webkit-appearance: none; appearance: none; display: block;
      width: 100%; height: 38px;
    }`;
    assert.deepEqual(blokTijdvelden(bron), [".tijd: display block"]);
  });

  it("en laat een flexvak en de binnenkant van het veld met rust", () => {
    const bron = `<input class="tijd" type="time" />
    .tijd { display: flex; align-items: center; justify-content: center; }
    .tijd::-webkit-datetime-edit { display: block; }
    .tijdvak { display: block; }
    .lijst .tijd { display: none; }`;
    assert.deepEqual(blokTijdvelden(bron), []);
  });

  it("NIEUW GEDRAG: op de laadpaalkaart dezelfde achtergrond als de stapper ernaast", () => {
    const bron = readFileSync(new URL("laadpaal-card.js", MAP), "utf8");
    const achtergrond = (kiezer) => {
      const r = regels(bron).find(([k]) => k === kiezer);
      assert.ok(r, `${kiezer} niet gevonden`);
      return r[1].match(/background(?:-color)?\s*:\s*([^;]+);/)[1].trim();
    };
    assert.equal(achtergrond(".tijd"), achtergrond(".set"));
  });
});
