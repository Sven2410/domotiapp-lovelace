/**
 * Van een sleutel uit een keuzelijst naar een naam die een mens leest.
 *
 * NIEUW GEDRAG: `src/cards/programmanaam.js` bestond niet vóór deze ronde. Op
 * de code van ervoor faalt dit bestand met ERR_MODULE_NOT_FOUND; de uitvoer
 * daarvan staat in docs/feedback-26-augustus/RAPPORT.md.
 *
 * De aanleiding is één schermafdruk: in de uitklaplijst van de vaatwasserkaart
 * stond `dishcare_dishwasher_program_kurz_60`. Dat is wat de entiteit meldt, en
 * het is niet wat er op een dashboard hoort te staan.
 *
 * Wat hier bewaakt wordt, en waarom elk geval erin zit:
 *
 * - **De vertaling van Home Assistant wint.** Levert de integratie er een, dan
 *   is die beter dan de onze: hij komt van de fabrikant en volgt de taal van de
 *   gebruiker.
 * - **Herkennen wannéér er vertaald is.** `formatEntityState` valt terug op de
 *   sleutel zelf, soms met streepjes vervangen. Zien we dat aan voor een
 *   vertaling, dan komt de sleutel alsnog op de kaart.
 * - **Een getal is soms een temperatuur en soms een variant.** `kurz_60` is
 *   zestig graden, `auto_1` is de eerste van drie automatische programma's.
 * - **Drie schrijfwijzen van dezelfde sleutel.** BSH schrijft `Eco50`,
 *   Home Assistant `dishcare_dishwasher_program_eco_50`, een YAML-helper
 *   `eco-50`. Alle drie horen "Eco 50 °C" te geven.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isVertaald, keuzeNaam, programmaNaam, woordenVan } from "../../src/cards/programmanaam.js";

describe("woordenVan", () => {
  it("knipt het pad naar de lijst eraf", () => {
    assert.deepEqual(woordenVan("dishcare_dishwasher_program_kurz_60"), ["kurz", "60"]);
  });

  it("knipt camelCase en de overgang naar cijfers", () => {
    assert.deepEqual(woordenVan("Dishcare.Dishwasher.Program.Eco50"), ["Eco", "50"]);
  });

  it("leest een sleutel zonder voorvoegsel gewoon uit", () => {
    assert.deepEqual(woordenVan("eco-50"), ["eco", "50"]);
  });

  it("houdt zich staande bij rommel", () => {
    assert.deepEqual(woordenVan(""), []);
    assert.deepEqual(woordenVan(null), []);
    assert.deepEqual(woordenVan(undefined), []);
  });
});

describe("programmaNaam", () => {
  it("maakt Nederlands van de Duitse programmanamen van BSH", () => {
    assert.equal(programmaNaam("dishcare_dishwasher_program_kurz_60"), "Kort 60 °C");
    assert.equal(programmaNaam("dishcare_dishwasher_program_intensiv_70"), "Intensief 70 °C");
    assert.equal(programmaNaam("dishcare_dishwasher_program_eco_50"), "Eco 50 °C");
    assert.equal(programmaNaam("dishcare_dishwasher_program_glas_40"), "Glas 40 °C");
  });

  it("schrijft de drie schrijfwijzen van hetzelfde programma hetzelfde op", () => {
    const uit = "Eco 50 °C";
    assert.equal(programmaNaam("Dishcare.Dishwasher.Program.Eco50"), uit);
    assert.equal(programmaNaam("dishcare_dishwasher_program_eco_50"), uit);
    assert.equal(programmaNaam("eco-50"), uit);
  });

  it("houdt een laag getal een variant en maakt er geen temperatuur van", () => {
    assert.equal(programmaNaam("dishcare_dishwasher_program_auto_1"), "Automatisch 1");
    assert.equal(programmaNaam("dishcare_dishwasher_program_auto_2"), "Automatisch 2");
  });

  it("vertaalt de programma's die uit meer dan een woord bestaan", () => {
    assert.equal(programmaNaam("dishcare_dishwasher_program_pre_rinse"), "Voorspoelen");
    assert.equal(programmaNaam("dishcare_dishwasher_program_machine_care"), "Machineverzorging");
    assert.equal(programmaNaam("dishcare_dishwasher_program_night_wash"), "Nacht wassen");
  });

  it("laat een woord dat het niet kent gewoon staan", () => {
    assert.equal(programmaNaam("dishcare_dishwasher_program_kurz_60_vario"), "Kort 60 °C vario");
  });

  it("geeft een lege sleutel leeg terug", () => {
    assert.equal(programmaNaam(""), "");
    assert.equal(programmaNaam(null), "");
  });
});

describe("isVertaald", () => {
  it("herkent een echte vertaling", () => {
    assert.equal(isVertaald("dishcare_dishwasher_program_kurz_60", "Kort 60 °C"), true);
  });

  it("herkent de sleutel die terugkomt zoals hij was", () => {
    const sleutel = "dishcare_dishwasher_program_kurz_60";
    assert.equal(isVertaald(sleutel, sleutel), false);
  });

  it("herkent de sleutel met andere scheidingstekens ook als onvertaald", () => {
    // Dit is wat Home Assistant doet als hij geen vertaling heeft: hij poetst
    // de sleutel op. Zien we dat aan voor een vertaling, dan staat er alsnog
    // Duits op de kaart.
    assert.equal(
      isVertaald("dishcare_dishwasher_program_kurz_60", "Dishcare Dishwasher Program Kurz 60"),
      false,
    );
  });

  it("noemt niets ingevuld niet vertaald", () => {
    assert.equal(isVertaald("eco_50", ""), false);
    assert.equal(isVertaald("eco_50", undefined), false);
  });
});

describe("keuzeNaam", () => {
  it("neemt de vertaling van Home Assistant over als die er is", () => {
    assert.equal(keuzeNaam("dishcare_dishwasher_program_eco_50", "Eco 50°C"), "Eco 50°C");
  });

  it("valt terug op onze eigen naam als Home Assistant de sleutel teruggeeft", () => {
    const sleutel = "dishcare_dishwasher_program_kurz_60";
    assert.equal(keuzeNaam(sleutel, sleutel), "Kort 60 °C");
  });

  it("werkt zonder tweede argument, want formatEntityState hoeft niet te bestaan", () => {
    assert.equal(keuzeNaam("dishcare_dishwasher_program_kurz_60"), "Kort 60 °C");
  });

  it("laat een gewone helperoptie met rust", () => {
    // Een input_select van de gebruiker heeft al leesbare opties. Die mogen
    // niet ineens anders gaan heten omdat een woord toevallig in het
    // woordenboek staat -- de eerste letter is het enige dat verandert.
    assert.equal(keuzeNaam("Thuis"), "Thuis");
    assert.equal(keuzeNaam("Vakantie"), "Vakantie");
  });
});
