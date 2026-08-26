import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { naarRijen, schuifOpen, uitgekleed } from "../../src/editor/entities-rijen.js";

/**
 * De echo-lus van de entiteiten-editor.
 *
 * Home Assistant duwt de config die de editor wegschrijft bij ELKE toetsaanslag
 * terug door `setConfig`. De editor herkent zijn eigen echo door
 * `uitgekleed(naarRijen(config))` te vergelijken met wat hij zelf wegschreef.
 * Klopt dat niet, dan herbouwt hij -- en verdwijnt het invoerveld onder je
 * vingers.
 *
 * Dat is precies wat er misging: `naarRijen` liet de uitlijning, de beeldmaat
 * en de kolomkoppen vallen. Vandaar dat deze suite ze stuk voor stuk narekent.
 */
describe("de rijen van de entiteitenkaart, heen en terug", () => {
  const rondje = (config) => uitgekleed(naarRijen(config));

  it("houdt kolomkoppen, uitlijning en beeldmaat vast", () => {
    const rows = [
      {
        columns: 2,
        layout: "beeld",
        align: "midden",
        image_size: 200,
        column_names: ["Begane grond", "1e verdieping"],
        items: [{ entity: "light.a" }, { entity: "light.b" }],
      },
    ];
    assert.deepEqual(rondje({ rows }), rows);
  });

  it("blijft staan als hij zijn eigen uitvoer opnieuw inleest", () => {
    // DIT is de lus waar het om gaat. Twee rondjes moeten hetzelfde geven;
    // deed het dat niet, dan herbouwde de editor bij elke toetsaanslag.
    const config = {
      rows: [
        {
          columns: 2,
          column_names: ["Ketel", "Warmtepomp"],
          align: "midden",
          items: [{ entity: "sensor.a" }, { entity: "sensor.b" }],
        },
      ],
    };
    const een = rondje(config);
    const twee = rondje({ rows: een });
    assert.equal(JSON.stringify(twee), JSON.stringify(een));
  });

  it("leest de platte configvorm net zo goed", () => {
    // De oude vorm: geen `rows`, alles op de kaart zelf.
    const uit = rondje({
      columns: 2,
      layout: "beeld",
      align: "midden",
      image_size: 160,
      column_names: ["Wifi", "Gast"],
      items: ["sensor.a", "sensor.b"],
    });
    assert.equal(uit.length, 1);
    assert.deepEqual(uit[0].column_names, ["Wifi", "Gast"]);
    assert.equal(uit[0].align, "midden");
    assert.equal(uit[0].image_size, 160);
  });

  it("zet de koppen alleen boven de eerste van een opgeknipte rij", () => {
    // Handgeschreven YAML mag meer entiteiten in een rij hebben dan kolommen;
    // die rij valt uiteen. Drie keer dezelfde kop zou dan onzin zijn.
    const uit = rondje({
      rows: [
        {
          columns: 2,
          column_names: ["Links", "Rechts"],
          items: [{ entity: "a" }, { entity: "b" }, { entity: "c" }, { entity: "d" }],
        },
      ],
    });
    assert.equal(uit.length, 2);
    assert.deepEqual(uit[0].column_names, ["Links", "Rechts"]);
    assert.equal(uit[1].column_names, undefined);
  });

  it("laat een rij zonder afwijkingen ook zonder sleutels", () => {
    // REGRESSIEWACHT: de gewone rij mag geen `align: links` of `image_size`
    // in de YAML krijgen. Wat er staat is wat afwijkt.
    const uit = rondje({ rows: [{ columns: 2, items: [{ entity: "light.a" }] }] });
    assert.deepEqual(uit, [{ columns: 2, items: [{ entity: "light.a" }] }]);
  });

  it("gooit lege plekken en lege rijen weg", () => {
    // REGRESSIEWACHT op het gedrag dat er al was.
    const uit = rondje({
      rows: [
        { columns: 2, items: [{ entity: "" }, { entity: "" }] },
        { columns: 1, items: [{ entity: "light.a" }] },
      ],
    });
    assert.equal(uit.length, 1);
    assert.equal(uit[0].items[0].entity, "light.a");
  });
});

describe("schuifOpen — NIEUW GEDRAG (rij dupliceren, 27-08-2026)", () => {
  const set = (...k) => new Set(k);
  const uit = (s) => [...s].sort();

  it("REGRESSIEWACHT: bij verwijderen schuift alles erna een plek terug", () => {
    assert.deepEqual(uit(schuifOpen(set("r0", "r1", "r2"), 1, "weg")), ["r0", "r1"]);
  });

  it("REGRESSIEWACHT: verwijderen neemt de plekken van die rij mee", () => {
    assert.deepEqual(uit(schuifOpen(set("r1", "r1i0", "r2i1"), 1, "weg")), ["r1i1"]);
  });

  it("bij dupliceren schuift alles ná die rij een plek op", () => {
    // Rij 1 wordt gedupliceerd: de kopie komt op r2, dus de oude r2 wordt r3.
    assert.deepEqual(uit(schuifOpen(set("r0", "r1", "r2"), 1, "erbij")), ["r0", "r1", "r3"]);
  });

  it("de gedupliceerde rij zelf blijft staan waar hij stond", () => {
    assert.ok(schuifOpen(set("r1", "r1i0"), 1, "erbij").has("r1"));
    assert.ok(schuifOpen(set("r1", "r1i0"), 1, "erbij").has("r1i0"));
  });

  it("neemt de plekken van latere rijen mee omhoog", () => {
    assert.deepEqual(uit(schuifOpen(set("r2i0", "r2i1"), 0, "erbij")), ["r3i0", "r3i1"]);
  });

  it("dupliceren van de laatste rij verschuift niets", () => {
    assert.deepEqual(uit(schuifOpen(set("r0", "r1"), 1, "erbij")), ["r0", "r1"]);
  });

  it("laat de meegegeven set met rust", () => {
    const origineel = set("r0", "r1");
    schuifOpen(origineel, 0, "erbij");
    assert.deepEqual(uit(origineel), ["r0", "r1"]);
  });

  it("gooit onbegrijpelijke sleutels weg in plaats van erover te vallen", () => {
    assert.deepEqual(uit(schuifOpen(set("r0", "rommel", ""), 0, "erbij")), ["r0"]);
  });
});
