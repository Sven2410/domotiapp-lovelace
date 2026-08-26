/**
 * Wat de entiteitenkaart uit een config afleidt.
 *
 * NIEUW GEDRAG: `entities-logica.js` bestond niet vóór deze ronde, en de drie
 * dingen die het doet zijn precies de drie die stilletjes fout kunnen gaan.
 *
 * - De VORM per rij is nieuw (hij kwam van de knopkaart, die hierin opging).
 *   Een rij zonder vorm hoort `row` te zijn, en onzin hoort dat ook te zijn --
 *   een kaart die op `layout: tegel` (het Nederlandse woord) omvalt is een kaart
 *   die op een klantdashboard omvalt.
 * - Een plek ZONDER entiteit mag bestaan: dat is een navigatieknop. Vóór deze
 *   ronde was "geen entiteit" hetzelfde als "leeg", en dan zou de editor zo'n
 *   knop bij het opslaan weggooien.
 * - De HOOGTE bepaalt of de kaart in het raster van Home Assistant op dezelfde
 *   hoogte uitkomt als een Mushroom-kaart ernaast. Die 56px voor één regel is
 *   een harde afspraak; zie `kaart-vormregels`.
 *
 * REGRESSIEWACHT: de oude configvormen (`items`, `entities`, een item als
 * string) hangen op draaiende dashboards en moeten blijven werken.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BEELD_MAX,
  BEELD_MIN,
  BEELD_STANDAARD,
  GAP,
  HOOGTE,
  KADER,
  KOP_H,
  clampBeeld,
  clampCols,
  clampUitlijning,
  clampVorm,
  gevuld,
  kolomNamen,
  TITEL_H,
  kaartHoogte,
  kaartNaam,
  regelsIn,
  rijHoogte,
  toRows,
  vlakVan,
} from "../../src/cards/entities-logica.js";

/** Home Assistants rasterrij: 56px hoog, 8px ertussen. */
const rowsFor = (px) => Math.max(1, Math.ceil((px + 8) / (56 + 8)));

describe("toRows() — REGRESSIEWACHT op de oude configvormen", () => {
  it("een platte items-lijst wordt één rij", () => {
    const rows = toRows({ items: ["light.a", "light.b"], columns: 2 });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].columns, 2);
    assert.deepEqual(
      rows[0].items.map((i) => i.entity),
      ["light.a", "light.b"]
    );
  });

  it("`entities` doet hetzelfde als `items`", () => {
    assert.deepEqual(toRows({ entities: ["light.a"] }), toRows({ items: ["light.a"] }));
  });

  it("een item als string wordt een object", () => {
    assert.deepEqual(toRows({ items: ["light.a"] })[0].items[0], { entity: "light.a" });
  });

  it("een lege config levert geen rijen op", () => {
    assert.deepEqual(toRows({}), []);
    assert.deepEqual(toRows({ rows: [] }), []);
  });

  it("kopieert de items in plaats van ze door te geven", () => {
    const bron = { items: [{ entity: "light.a" }] };
    toRows(bron)[0].items[0].name = "aangeraakt";
    assert.equal(bron.items[0].name, undefined);
  });
});

describe("toRows() — de vorm per rij, NIEUW GEDRAG", () => {
  it("een rij zonder vorm is een gewone rij", () => {
    assert.equal(toRows({ rows: [{ columns: 1, items: ["light.a"] }] })[0].layout, "row");
  });

  it("neemt tegel en compact over", () => {
    const rows = toRows({
      rows: [
        { columns: 3, layout: "tile", items: ["light.a"] },
        { columns: 2, layout: "compact", items: ["light.b"] },
      ],
    });
    assert.deepEqual(rows.map((r) => r.layout), ["tile", "compact"]);
  });

  it("een vorm die niet bestaat valt terug op een gewone rij", () => {
    for (const onzin of ["tegel", "TILE", "", null, 3, undefined]) {
      assert.equal(clampVorm(onzin), "row", `${onzin} hoort row te worden`);
    }
  });

  it("de oude platte vorm mag zijn layout meenemen", () => {
    // Zo zag een knopkaart eruit: `layout: tile` op het hoogste niveau.
    assert.equal(toRows({ items: ["light.a"], columns: 1, layout: "tile" })[0].layout, "tile");
  });

  it("houdt het kolomaantal tussen 1 en 3", () => {
    assert.equal(clampCols(9), 3);
    assert.equal(clampCols(-5), 1);
    assert.equal(clampCols("2"), 2);
    // Niets en nul zijn allebei "niet ingevuld" en worden de standaard van twee.
    assert.equal(clampCols(undefined), 2);
    assert.equal(clampCols(0), 2);
  });
});

describe("gevuld() — een plek zonder entiteit, NIEUW GEDRAG", () => {
  it("een entiteit vult een plek", () => {
    assert.equal(gevuld({ entity: "light.a" }), true);
  });

  it("een naam, een icoon of een tikactie ook: dat is een navigatieknop", () => {
    assert.equal(gevuld({ name: "Woning" }), true);
    assert.equal(gevuld({ icon: "house" }), true);
    assert.equal(gevuld({ tap_action: { action: "navigate", navigation_path: "/huis" } }), true);
  });

  it("een echt lege plek is leeg", () => {
    assert.equal(gevuld({}), false);
    assert.equal(gevuld({ entity: "" }), false);
    assert.equal(gevuld(undefined), false);
  });

  it("een kleur alleen maakt nog geen knop", () => {
    // Anders zou een plek die je per ongeluk een kleur gaf blijven staan als
    // een blokje zonder tekst en zonder icoon.
    assert.equal(gevuld({ tone: "house" }), false);
  });
});

describe("vlakVan()", () => {
  it("standaard draagt de kaart zelf het vlak", () => {
    assert.equal(vlakVan({}), "card");
    assert.equal(vlakVan({ surface: "onzin" }), "card");
  });

  it("neemt items en none over", () => {
    assert.equal(vlakVan({ surface: "items" }), "items");
    assert.equal(vlakVan({ surface: "none" }), "none");
  });

  it("REGRESSIEWACHT: `bare: true` blijft de oude spelling van geen vlak", () => {
    assert.equal(vlakVan({ bare: true }), "none");
  });

  it("`surface` wint van `bare`", () => {
    assert.equal(vlakVan({ bare: true, surface: "card" }), "card");
  });
});

describe("regelsIn()", () => {
  it("evenveel plekken als kolommen is één regel", () => {
    assert.equal(regelsIn({ columns: 3, items: [1, 2, 3] }), 1);
  });

  it("meer plekken dan kolommen loopt door naar de volgende regel", () => {
    // Alleen met de hand geschreven YAML, maar dan hoort de kaart wel de goede
    // hoogte te vragen in plaats van de helft af te snijden.
    assert.equal(regelsIn({ columns: 2, items: [1, 2, 3, 4, 5] }), 3);
  });

  it("een lege rij is nog altijd één regel hoog", () => {
    assert.equal(regelsIn({ columns: 2, items: [] }), 1);
  });
});

describe("kaartNaam() — de optionele kop boven de kaart — NIEUW GEDRAG", () => {
  it("geeft de naam terug zoals hij is ingetypt", () => {
    assert.equal(kaartNaam({ name: "Slaapkamer" }), "Slaapkamer");
  });

  it("knipt de randen af maar laat de spatie ertussen staan", () => {
    assert.equal(kaartNaam({ name: "  Boven de trap  " }), "Boven de trap");
  });

  it("is leeg bij niets, en bij alleen spaties", () => {
    // Alleen spaties zou anders een onzichtbare kop opleveren die de kaart wel
    // een rasterrij hoger maakt -- en dan zoek je waar die ruimte vandaan komt.
    for (const config of [{}, { name: "" }, { name: "   " }, { name: 42 }, null]) {
      assert.equal(kaartNaam(config), "");
    }
  });
});

describe("een kop kost een rasterrij — NIEUW GEDRAG", () => {
  const kaart = (rows, extra = {}) => ({ rows: toRows({ rows }), ...extra });
  const EEN_RIJ = [{ columns: 1, items: ["light.a"] }];

  it("telt de kop en de ruimte eronder mee", () => {
    const zonder = kaartHoogte(kaart(EEN_RIJ));
    const met = kaartHoogte(kaart(EEN_RIJ, { name: "Slaapkamer" }));
    assert.equal(zonder, 56);
    assert.equal(met, zonder + TITEL_H + GAP, "22 voor de regel, 6 eronder");
    assert.equal(met, 84);
  });

  it("maakt van één rasterrij er twee, en niet meer", () => {
    assert.equal(rowsFor(kaartHoogte(kaart(EEN_RIJ))), 1);
    assert.equal(rowsFor(kaartHoogte(kaart(EEN_RIJ, { name: "Slaapkamer" }))), 2);
  });

  it("rekent de kop ook mee als de kaart geen vlak heeft", () => {
    const zonder = kaartHoogte(kaart(EEN_RIJ, { surface: "none" }));
    const met = kaartHoogte(kaart(EEN_RIJ, { surface: "none", name: "Slaapkamer" }));
    assert.equal(met - zonder, TITEL_H + GAP);
  });

  it("laat een lege naam de hoogte niet veranderen", () => {
    assert.equal(kaartHoogte(kaart(EEN_RIJ, { name: "   " })), kaartHoogte(kaart(EEN_RIJ)));
  });
});

describe("kaartHoogte() — de afspraak met het raster van Home Assistant", () => {
  const kaart = (rows, extra = {}) => ({ rows: toRows({ rows }), ...extra });

  it("één rij van één entiteit is precies één rasterrij", () => {
    const px = kaartHoogte(kaart([{ columns: 1, items: ["light.a"] }]));
    assert.equal(px, KADER + HOOGTE.row, "12 + 44");
    assert.equal(px, 56);
    assert.equal(rowsFor(px), 1);
  });

  it("drie regels onder elkaar tellen de tussenruimte mee", () => {
    const px = kaartHoogte(
      kaart([
        { columns: 1, items: ["light.a"] },
        { columns: 1, items: ["light.b"] },
        { columns: 1, items: ["light.c"] },
      ])
    );
    assert.equal(px, KADER + 3 * HOOGTE.row + 2 * GAP);
  });

  it("een tegelrij is hoger dan een gewone rij", () => {
    const tegel = kaartHoogte(kaart([{ columns: 2, layout: "tile", items: ["a", "b"] }]));
    const rij = kaartHoogte(kaart([{ columns: 2, items: ["a", "b"] }]));
    assert.equal(tegel, KADER + HOOGTE.tile);
    assert.ok(tegel > rij);
    assert.equal(rowsFor(tegel), 2);
  });

  it("een rij van drie kolommen met drie entiteiten blijft één regel", () => {
    assert.equal(
      kaartHoogte(kaart([{ columns: 3, items: ["a", "b", "c"] }])),
      KADER + HOOGTE.row
    );
  });

  it("zonder eigen kaartvlak vervalt de binnenmarge", () => {
    const met = kaartHoogte(kaart([{ columns: 1, items: ["light.a"] }]));
    const zonder = kaartHoogte(kaart([{ columns: 1, items: ["light.a"] }], { surface: "items" }));
    assert.equal(met - zonder, KADER);
    assert.equal(rowsFor(zonder), 1, "een losse knop blijft één rasterrij");
  });

  it("een kaart zonder rijen vraagt nog steeds één rasterrij", () => {
    assert.equal(rowsFor(kaartHoogte({ rows: [] })), 1);
  });

  it("mengt vormen zonder de tussenruimte kwijt te raken", () => {
    const px = kaartHoogte(
      kaart([
        { columns: 3, layout: "tile", items: ["a", "b", "c"] },
        { columns: 1, items: ["light.d"] },
      ])
    );
    assert.equal(px, KADER + HOOGTE.tile + GAP + HOOGTE.row);
  });
});

/**
 * Kolomkoppen, de beeldvorm en het centreren.
 *
 * NIEUW GEDRAG (26 augustus 2026), alle drie gevraagd door de eigenaar:
 * "Ook wil ik een naam kunnen toevoegen aan een kolom", "een entiteit met een
 * afbeelding iets groter maken dan kan ik er een wifi kaart van maken" en "dat
 * ik ze kan centreren nu zijn ze links uitgelijnd".
 *
 * Wat hier bewaakt wordt is het rekenwerk eromheen, want dat is waar het
 * stilletjes fout gaat: koppen die niet bij hun kolommen passen, een
 * afbeelding die de kaart uit het raster duwt, en een oude config die per
 * ongeluk van vorm verandert.
 */
describe("kolomNamen()", () => {
  it("geeft precies zoveel namen als er kolommen zijn", () => {
    assert.deepEqual(kolomNamen(["Ketel", "Warmtepomp"], 2), ["Ketel", "Warmtepomp"]);
  });

  it("vult aan met leegte als er namen missen", () => {
    // Eén naam bij twee kolommen mag de rij niet laten verschuiven.
    assert.deepEqual(kolomNamen(["Ketel"], 2), ["Ketel", ""]);
  });

  it("kapt af als er te veel namen staan", () => {
    assert.deepEqual(kolomNamen(["a", "b", "c"], 2), ["a", "b"]);
  });

  it("geeft niets terug als er niets ingevuld is", () => {
    // Anders staat er een lege koppenrij die de kaart wél hoger maakt.
    assert.deepEqual(kolomNamen(["", "   "], 2), []);
    assert.deepEqual(kolomNamen([], 2), []);
    assert.deepEqual(kolomNamen(null, 2), []);
  });

  it("trimt, en negeert wat geen tekst is", () => {
    assert.deepEqual(kolomNamen(["  Ketel  ", 42], 2), ["Ketel", ""]);
  });
});

describe("clampBeeld()", () => {
  it("houdt de maat tussen de grenzen", () => {
    assert.equal(clampBeeld(160), 160);
    assert.equal(clampBeeld(10), BEELD_MIN);
    assert.equal(clampBeeld(9999), BEELD_MAX);
  });

  it("valt terug op de standaard bij onzin", () => {
    assert.equal(clampBeeld(undefined), BEELD_STANDAARD);
    assert.equal(clampBeeld("groot"), BEELD_STANDAARD);
    assert.equal(clampBeeld(null), BEELD_STANDAARD);
  });
});

describe("clampUitlijning()", () => {
  it("kent links en midden, en verder niets", () => {
    assert.equal(clampUitlijning("midden"), "midden");
    assert.equal(clampUitlijning("links"), "links");
    assert.equal(clampUitlijning("centraal"), "links");
    assert.equal(clampUitlijning(undefined), "links");
  });
});

describe("de beeldvorm", () => {
  it("staat in de lijst met vormen", () => {
    assert.equal(clampVorm("beeld"), "beeld");
  });

  it("rekent zijn hoogte uit de ingestelde maat", () => {
    // De afbeelding plus de binnenmarge en de naam eronder.
    assert.equal(rijHoogte({ layout: "beeld", image_size: 160 }), 194);
    assert.equal(rijHoogte({ layout: "beeld" }), BEELD_STANDAARD + 34);
  });

  it("laat de vaste maten met rust", () => {
    assert.equal(rijHoogte({ layout: "row" }), HOOGTE.row);
    assert.equal(rijHoogte({ layout: "tile" }), HOOGTE.tile);
    assert.equal(rijHoogte({}), HOOGTE.row);
  });
});

describe("toRows() draagt de nieuwe velden mee", () => {
  it("leest ze van een rij", () => {
    const [rij] = toRows({
      rows: [
        {
          columns: 2,
          layout: "beeld",
          align: "midden",
          image_size: 200,
          column_names: ["Ketel", "Warmtepomp"],
          items: ["light.a", "light.b"],
        },
      ],
    });
    assert.equal(rij.layout, "beeld");
    assert.equal(rij.align, "midden");
    assert.equal(rij.image_size, 200);
    assert.deepEqual(rij.column_names, ["Ketel", "Warmtepomp"]);
  });

  it("leest ze ook van de platte vorm", () => {
    // Daar is maar één rij, dus staan ze op de kaart zelf.
    const [rij] = toRows({
      columns: 2,
      align: "midden",
      column_names: ["Links", "Rechts"],
      items: ["light.a", "light.b"],
    });
    assert.equal(rij.align, "midden");
    assert.deepEqual(rij.column_names, ["Links", "Rechts"]);
  });

  it("laat een bestaande config precies zoals hij was — REGRESSIEWACHT", () => {
    const [rij] = toRows({ items: ["light.a", "light.b"] });
    assert.equal(rij.align, "links");
    assert.equal(rij.image_size, BEELD_STANDAARD);
    assert.deepEqual(rij.column_names, []);
    assert.equal(rij.layout, "row");
  });
});

describe("kolomkoppen kosten hun eigen regel", () => {
  it("maakt de kaart hoger", () => {
    const zonder = toRows({ columns: 2, items: ["light.a", "light.b"] });
    const met = toRows({ columns: 2, column_names: ["A", "B"], items: ["light.a", "light.b"] });
    const h1 = kaartHoogte({ rows: zonder });
    const h2 = kaartHoogte({ rows: met });
    assert.equal(h2 - h1, KOP_H + GAP);
  });

  it("kost niets als er geen koppen staan", () => {
    const leeg = toRows({ columns: 2, column_names: ["", ""], items: ["light.a", "light.b"] });
    const zonder = toRows({ columns: 2, items: ["light.a", "light.b"] });
    assert.equal(kaartHoogte({ rows: leeg }), kaartHoogte({ rows: zonder }));
  });
});
