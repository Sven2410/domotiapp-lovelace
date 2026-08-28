/**
 * De tijdlijn onder het camerabeeld — NIEUW GEDRAG.
 *
 * Gevraagd op 28 augustus 2026: filteren op datum, op soort en op camera, met
 * vijf soorten om op aan te vinken. Deze bestanden bestonden niet, dus alles
 * hier faalt per definitie op de code van vóór deze ronde: `node --test` kan
 * `src/cards/camera-tijdlijn.js` daar niet eens laden.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  ALGEMEEN,
  SOORTEN,
  alsDatumveld,
  dagLabel,
  dagOm,
  dun,
  filterGebeurtenissen,
  gebeurtenissenUit,
  isActief,
  positie,
  raadSoort,
  soortVan,
  telPerSoort,
  tijdLabel,
  uitDatumveld,
  verschuifDag,
} from "../../src/cards/camera-tijdlijn.js";

/** Een moment op een vaste dag, zodat de proeven niet van de klok afhangen. */
const DAG = new Date(2026, 7, 28).getTime(); // 28 augustus 2026, 00:00 lokaal
const om = (uur, minuut = 0) => DAG + uur * 3600000 + minuut * 60000;
/** De geschiedenis geeft seconden terug, geen milliseconden. */
const sec = (ms) => ms / 1000;

describe("de vijf soorten", () => {
  it("zijn er vijf, en precies die hij noemde", () => {
    assert.deepEqual(
      SOORTEN.map((s) => s.sleutel),
      ["mens", "dier", "voertuig", "aanbellen", "ontgrendeling"]
    );
  });

  it("geeft de algemene soort terug voor een sleutel die niet bestaat", () => {
    assert.equal(soortVan("bestaatniet"), ALGEMEEN);
    assert.equal(soortVan("mens").icoon, "person");
  });
});

describe("raden welke soort een melder is", () => {
  it("herkent wat een Reolink levert", () => {
    assert.equal(raadSoort("binary_sensor.oprit_person"), "mens");
    assert.equal(raadSoort("binary_sensor.oprit_pet"), "dier");
    assert.equal(raadSoort("binary_sensor.oprit_vehicle"), "voertuig");
    assert.equal(raadSoort("binary_sensor.deurbel_visitor"), "aanbellen");
  });

  it("herkent Nederlandse namen", () => {
    assert.equal(raadSoort("binary_sensor.melder_1", "Voordeur persoon"), "mens");
    assert.equal(raadSoort("binary_sensor.melder_2", "Huisdier tuin"), "dier");
    assert.equal(raadSoort("binary_sensor.melder_3", "Auto oprit"), "voertuig");
    assert.equal(raadSoort("binary_sensor.melder_4", "Er is aangebeld"), "aanbellen");
  });

  it("noemt een slot een ontgrendeling, hoe het ook heet", () => {
    assert.equal(raadSoort("lock.voordeur"), "ontgrendeling");
    assert.equal(raadSoort("lock.mooie_naam", "Poort"), "ontgrendeling");
    assert.equal(raadSoort("binary_sensor.deur_ontgrendeld"), "ontgrendeling");
  });

  it("laat de persoonsmelder van een DEURBEL een mensmelding zijn", () => {
    // Op stukjes zoeken maakt hier een aanbelmelding van, want "deurbel" bevat
    // "bel". Dat is precies het geval waar deze test op staat.
    assert.equal(raadSoort("binary_sensor.deurbel_person"), "mens");
    assert.equal(raadSoort("binary_sensor.deurbel_bel"), "aanbellen");
  });

  it("valt terug op de algemene soort bij een gewone bewegingsmelder", () => {
    assert.equal(raadSoort("binary_sensor.oprit_motion"), "beweging");
    assert.equal(raadSoort("binary_sensor.gang"), "beweging");
  });
});

describe("wat telt als 'er gebeurt iets'", () => {
  it("is 'on' bij een bewegingsmelder", () => {
    assert.equal(isActief("binary_sensor.x", "on"), true);
    assert.equal(isActief("binary_sensor.x", "off"), false);
  });

  it("is 'unlocked' bij een slot en niet 'on'", () => {
    assert.equal(isActief("lock.voordeur", "unlocked"), true);
    assert.equal(isActief("lock.voordeur", "locked"), false);
  });

  it("is elke gevulde waarde bij een event-entiteit", () => {
    assert.equal(isActief("event.deurbel", "2026-08-28T10:00:00.000+00:00"), true);
    assert.equal(isActief("event.deurbel", "unknown"), false);
  });
});

describe("gebeurtenissen uit de geschiedenis", () => {
  const melders = [
    { entity: "binary_sensor.oprit_person", naam: "Persoon", soort: "mens", camera: "camera.oprit" },
    { entity: "binary_sensor.oprit_vehicle", naam: "Auto", soort: "voertuig", camera: "camera.oprit" },
  ];

  it("maakt er één per keer dat de melder aangaat", () => {
    const ruw = {
      "binary_sensor.oprit_person": [
        { s: "off", lu: sec(DAG) },
        { s: "on", lu: sec(om(8, 12)) },
        { s: "off", lu: sec(om(8, 13)) },
        { s: "on", lu: sec(om(17, 40)) },
        { s: "off", lu: sec(om(17, 41)) },
      ],
    };
    const uit = gebeurtenissenUit(ruw, melders, { vanaf: DAG });
    assert.deepEqual(
      uit.map((g) => tijdLabel(g.tijd)),
      ["17:40", "08:12"]
    );
    assert.equal(uit[0].soort, "mens");
    assert.equal(uit[0].camera, "camera.oprit");
  });

  it("telt de stand aan het BEGIN van de dag niet mee", () => {
    // De melder stond al aan toen het venster begon: die beweging was er al
    // voordat je ging kijken, en hoort dus niet als gebeurtenis van vandaag.
    const ruw = {
      "binary_sensor.oprit_person": [
        { s: "on", lu: sec(DAG - 3600000) },
        { s: "off", lu: sec(om(0, 4)) },
        { s: "on", lu: sec(om(9, 0)) },
      ],
    };
    const uit = gebeurtenissenUit(ruw, melders, { vanaf: DAG });
    assert.deepEqual(uit.map((g) => tijdLabel(g.tijd)), ["09:00"]);
  });

  it("laat een melder zonder geschiedenis gewoon weg", () => {
    assert.deepEqual(gebeurtenissenUit({}, melders, { vanaf: DAG }), []);
    assert.deepEqual(gebeurtenissenUit(null, melders, { vanaf: DAG }), []);
  });

  it("zet de nieuwste bovenaan, ook over melders heen", () => {
    const ruw = {
      "binary_sensor.oprit_person": [
        { s: "off", lu: sec(DAG) },
        { s: "on", lu: sec(om(7, 0)) },
      ],
      "binary_sensor.oprit_vehicle": [
        { s: "off", lu: sec(DAG) },
        { s: "on", lu: sec(om(19, 30)) },
      ],
    };
    const uit = gebeurtenissenUit(ruw, melders, { vanaf: DAG });
    assert.deepEqual(uit.map((g) => g.soort), ["voertuig", "mens"]);
  });

  it("neemt elke waarde van een event-entiteit als gebeurtenis", () => {
    const bel = [{ entity: "event.deurbel", naam: "Deurbel", soort: "aanbellen", camera: null }];
    const ruw = {
      "event.deurbel": [
        { s: "unknown", lu: sec(DAG) },
        { s: "2026-08-28T08:00:00+00:00", lu: sec(om(8, 0)) },
        { s: "2026-08-28T09:00:00+00:00", lu: sec(om(9, 0)) },
      ],
    };
    const uit = gebeurtenissenUit(ruw, bel, { vanaf: DAG });
    assert.deepEqual(uit.map((g) => tijdLabel(g.tijd)), ["09:00", "08:00"]);
  });
});

describe("dunnen", () => {
  const g = (entity, tijd) => ({ entity, tijd, soort: "mens", naam: "P", camera: null });

  it("plakt wat binnen een minuut van dezelfde melder kwam aan elkaar", () => {
    const uit = dun([
      g("binary_sensor.a", om(8, 3)),
      g("binary_sensor.a", om(8, 2) + 30000),
      g("binary_sensor.a", om(8, 2)),
    ]);
    assert.equal(uit.length, 1);
    assert.equal(uit[0].aantal, 3);
    // De EERSTE tijd wint: dat is het moment waarop het begon.
    assert.equal(tijdLabel(uit[0].tijd), "08:02");
  });

  it("laat twee VERSCHILLENDE melders op hetzelfde moment staan", () => {
    const uit = dun([g("binary_sensor.a", om(8, 0)), g("binary_sensor.b", om(8, 0))]);
    assert.equal(uit.length, 2);
  });

  it("laat een tweede bezoek een uur later gewoon staan", () => {
    const uit = dun([g("binary_sensor.a", om(9, 0)), g("binary_sensor.a", om(8, 0))]);
    assert.equal(uit.length, 2);
  });
});

describe("filteren", () => {
  const lijst = [
    { tijd: om(9), entity: "a", soort: "mens", camera: "camera.oprit", naam: "P" },
    { tijd: om(8), entity: "b", soort: "voertuig", camera: "camera.oprit", naam: "A" },
    { tijd: om(7), entity: "c", soort: "mens", camera: "camera.tuin", naam: "P" },
    { tijd: om(6), entity: "d", soort: "aanbellen", camera: null, naam: "Bel" },
  ];

  it("laat ALLES zien als er geen soort is aangevinkt", () => {
    assert.equal(filterGebeurtenissen(lijst, { soorten: new Set() }).length, 4);
    assert.equal(filterGebeurtenissen(lijst, {}).length, 4);
  });

  it("filtert op soort", () => {
    const uit = filterGebeurtenissen(lijst, { soorten: new Set(["mens"]) });
    assert.deepEqual(uit.map((g) => g.entity), ["a", "c"]);
  });

  it("filtert op meerdere soorten tegelijk", () => {
    const uit = filterGebeurtenissen(lijst, { soorten: new Set(["mens", "aanbellen"]) });
    assert.deepEqual(uit.map((g) => g.entity), ["a", "c", "d"]);
  });

  it("filtert op camera, en houdt de melders die bij allemaal horen", () => {
    const uit = filterGebeurtenissen(lijst, { camera: "camera.oprit" });
    assert.deepEqual(uit.map((g) => g.entity), ["a", "b", "d"]);
  });

  it("combineert soort en camera", () => {
    const uit = filterGebeurtenissen(lijst, {
      soorten: new Set(["mens"]),
      camera: "camera.tuin",
    });
    assert.deepEqual(uit.map((g) => g.entity), ["c"]);
  });

  it("telt per soort voor het getal op de knop", () => {
    assert.deepEqual(telPerSoort(lijst), { mens: 2, voertuig: 1, aanbellen: 1 });
  });
});

describe("de dag", () => {
  it("loopt van middernacht tot middernacht", () => {
    const { vanaf, tot } = dagOm(om(14, 30));
    assert.equal(vanaf, DAG);
    assert.equal(tot - vanaf, 86400000);
  });

  it("schuift een dag terug over een maandgrens heen", () => {
    const eerste = new Date(2026, 8, 1, 12, 0).getTime();
    assert.equal(alsDatumveld(verschuifDag(eerste, -1)), "2026-08-31");
  });

  it("noemt vandaag en gisteren bij naam", () => {
    const nu = om(14, 0);
    assert.equal(dagLabel(nu, nu), "Vandaag");
    assert.equal(dagLabel(verschuifDag(nu, -1), nu), "Gisteren");
    assert.equal(dagLabel(verschuifDag(nu, -2), nu), "wo 26 aug");
  });

  it("gaat heen en weer naar een datumveld", () => {
    assert.equal(alsDatumveld(om(23, 59)), "2026-08-28");
    assert.equal(uitDatumveld("2026-08-28"), DAG);
    assert.equal(uitDatumveld("onzin"), null);
    assert.equal(uitDatumveld(null), null);
  });

  it("zet een moment op zijn plek op de balk", () => {
    assert.equal(positie(DAG, DAG, DAG + 86400000), 0);
    assert.equal(positie(om(12), DAG, DAG + 86400000), 0.5);
    assert.equal(positie(om(30), DAG, DAG + 86400000), 1);
    assert.equal(positie(DAG - 1000, DAG, DAG + 86400000), 0);
  });
});
