/**
 * Tests op de registratiestrategie (fase 4a-fix).
 *
 * Deze tests bootsen de custom-element-registry na met een handvol regels
 * JavaScript — bewust géén jsdom. Wat hier getoetst wordt is niet "gedraagt een
 * browser zich zo", maar "kiest onze strategie de juiste registry, ook als die
 * halverwege wordt vervangen". Dat is precies de laag waarop de regressie zat,
 * en het is met twee nagebootste registry's exact te reproduceren.
 *
 * Het gedrag van HA's polyfill dat hier nagebootst wordt, is in de browser
 * afgelezen uit de gepatchte registry zelf:
 *
 *   get(e) { return this.h.get(e)?.g }
 *
 * Geen fallback naar de native registry. Wie daarvóór registreert, is daarna
 * onzichtbaar.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  HA_MARKER,
  registreerWanneerGereed,
} from "../../src/scene/registreer.js";

/** Een registry zonder enige kennis van een andere registry. */
function maakRegistry(voorgedefinieerd = []) {
  const map = new Map(voorgedefinieerd.map((naam) => [naam, class {}]));
  return {
    get: (naam) => map.get(naam),
    define: (naam, klasse) => {
      if (map.has(naam)) {
        throw new Error(`"${naam}" has already been used with this registry`);
      }
      map.set(naam, klasse);
    },
    namen: () => [...map.keys()],
  };
}

/** Een planner die taken bewaart zodat de test de tijd bestuurt. */
function maakPlanner() {
  const taken = [];
  return {
    plan: (fn) => taken.push(fn),
    aantalOpenstaand: () => taken.length,
    loopEen: () => {
      const fn = taken.shift();
      if (fn) fn();
      return Boolean(fn);
    },
    loopAlles: (maximaal = 50) => {
      let rondes = 0;
      while (taken.length && rondes < maximaal) {
        taken.shift()();
        rondes += 1;
      }
      return rondes;
    },
  };
}

const KLASSE_A = class {};
const KLASSE_B = class {};
const DEFINITIES = [
  ["domotiapp-lovelace-card", KLASSE_A],
  ["domotiapp-lovelace-card-editor", KLASSE_B],
];

describe("registreerWanneerGereed — NIEUW GEDRAG (fase 4a-fix)", () => {
  it("registreert meteen als HA's frontend er al is", () => {
    const registry = maakRegistry([HA_MARKER]);
    const planner = maakPlanner();

    const meteen = registreerWanneerGereed({
      leesRegistry: () => registry,
      definities: DEFINITIES,
      plan: planner.plan,
    });

    assert.equal(meteen, true);
    assert.equal(registry.get("domotiapp-lovelace-card"), KLASSE_A);
    assert.equal(registry.get("domotiapp-lovelace-card-editor"), KLASSE_B);
    assert.equal(planner.aantalOpenstaand(), 0, "geen wachtlus nodig");
  });

  it("registreert NIET in een registry waarin HA nog niet geladen is", () => {
    const vroeg = maakRegistry();
    const planner = maakPlanner();

    const meteen = registreerWanneerGereed({
      leesRegistry: () => vroeg,
      definities: DEFINITIES,
      plan: planner.plan,
    });

    assert.equal(meteen, false);
    assert.deepEqual(vroeg.namen(), [], "niets in de vroege registry");
    assert.equal(planner.aantalOpenstaand(), 1, "er wacht een poging");
  });

  it("landt in de registry die HA vervangt, niet in de oude", () => {
    // Dit is het kerngeval. Eerst de native registry, daarna vervangt de
    // polyfill hem — precies wat HA's frontend doet.
    const nativeRegistry = maakRegistry();
    const polyfillRegistry = maakRegistry();
    let huidig = nativeRegistry;

    const planner = maakPlanner();
    registreerWanneerGereed({
      leesRegistry: () => huidig,
      definities: DEFINITIES,
      plan: planner.plan,
    });

    // Nog niets, want HA is er nog niet.
    assert.deepEqual(nativeRegistry.namen(), []);
    planner.loopEen();
    assert.deepEqual(nativeRegistry.namen(), []);

    // De polyfill neemt het over en HA definieert zijn eigen element.
    huidig = polyfillRegistry;
    polyfillRegistry.define(HA_MARKER, class {});

    planner.loopAlles();

    assert.deepEqual(
      nativeRegistry.namen(),
      [],
      "de oude registry blijft leeg — daar zat de bug",
    );
    assert.equal(polyfillRegistry.get("domotiapp-lovelace-card"), KLASSE_A);
    assert.equal(polyfillRegistry.get("domotiapp-lovelace-card-editor"), KLASSE_B);
  });

  it("blijft niet eindeloos wachten en registreert na de tijdslimiet alsnog", () => {
    const registry = maakRegistry();
    const planner = maakPlanner();
    let klok = 0;
    const waarschuwingen = [];

    registreerWanneerGereed({
      leesRegistry: () => registry,
      definities: DEFINITIES,
      plan: planner.plan,
      nu: () => klok,
      maxWachtMs: 100,
      waarschuw: (bericht) => waarschuwingen.push(bericht),
    });

    klok = 50;
    planner.loopEen();
    assert.deepEqual(registry.namen(), [], "nog binnen de tijdslimiet");

    klok = 150;
    planner.loopAlles();

    assert.deepEqual(registry.namen(), [
      "domotiapp-lovelace-card",
      "domotiapp-lovelace-card-editor",
    ]);
    assert.equal(waarschuwingen.length, 1);
    assert.match(waarschuwingen[0], /niet verschenen/);
  });

  it("gooit nooit, ook niet als define faalt", () => {
    const registry = maakRegistry([HA_MARKER]);
    registry.define = () => {
      throw new Error("naam al in gebruik");
    };
    const waarschuwingen = [];

    assert.doesNotThrow(() =>
      registreerWanneerGereed({
        leesRegistry: () => registry,
        definities: DEFINITIES,
        plan: () => {},
        waarschuw: (bericht) => waarschuwingen.push(bericht),
      }),
    );
    assert.equal(waarschuwingen.length, 2, "één waarschuwing per definitie");
  });

  it("registreert niets dubbel", () => {
    const registry = maakRegistry([HA_MARKER, "domotiapp-lovelace-card"]);
    const bestaande = registry.get("domotiapp-lovelace-card");

    registreerWanneerGereed({
      leesRegistry: () => registry,
      definities: DEFINITIES,
      plan: () => {},
    });

    assert.equal(
      registry.get("domotiapp-lovelace-card"),
      bestaande,
      "de bestaande definitie blijft staan",
    );
    assert.equal(registry.get("domotiapp-lovelace-card-editor"), KLASSE_B);
  });

  it("gaat om met een registry die er nog helemaal niet is", () => {
    const planner = maakPlanner();
    assert.doesNotThrow(() =>
      registreerWanneerGereed({
        leesRegistry: () => undefined,
        definities: DEFINITIES,
        plan: planner.plan,
      }),
    );
  });
});

describe("De oude strategie faalt op ditzelfde geval", () => {
  /**
   * De code van vóór deze fix, letterlijk in de vorm die in de bundel stond:
   *
   *   customElements.get(x) || customElements.define(x, z);
   *
   * Eén keer, op modulescope, tegen de registry die op dát moment toevallig
   * actief is. Deze test toont wat daar misging.
   */
  function oudeStrategie(registry, definities) {
    for (const [naam, klasse] of definities) {
      if (!registry.get(naam)) {
        registry.define(naam, klasse);
      }
    }
  }

  it("verliest de definities zodra HA de registry vervangt", () => {
    const nativeRegistry = maakRegistry();
    const polyfillRegistry = maakRegistry();

    // Wij winnen de race en registreren in de native registry.
    oudeStrategie(nativeRegistry, DEFINITIES);
    assert.equal(nativeRegistry.get("domotiapp-lovelace-card"), KLASSE_A);

    // Daarna installeert HA zijn polyfill en definieert zijn eigen elementen.
    polyfillRegistry.define(HA_MARKER, class {});

    // Dit is wat HA vervolgens ziet, en waarom elke kaart "Configuratiefout"
    // toonde terwijl window.customCards wél gevuld was.
    assert.equal(
      polyfillRegistry.get("domotiapp-lovelace-card"),
      undefined,
      "onzichtbaar voor HA — precies de waargenomen regressie",
    );
  });
});
