/**
 * De filters boven de timeline van de camerakaart — NIEUW GEDRAG.
 *
 * Gevraagd op 28 augustus 2026: filteren op datum, op soort en op camera, met
 * vijf soorten om op aan te vinken. `src/cards/camera-filters.js` bestond niet,
 * dus alles hier faalt per definitie op de code van vóór deze ronde: `node
 * --test` kan het bestand daar niet eens laden.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  ALGEMEEN,
  SOORTEN,
  alsDatumveld,
  alsGrootte,
  camerasVoorFilter,
  dagStap,
  perDag,
  dagLabel,
  dagOm,
  dagenMetBeelden,
  filterBeelden,
  raadSoort,
  soortVan,
  soortVanBeeld,
  soortenVoorFilter,
  telPerSoort,
  tijdVanBeeld,
  uitDatumveld,
  verschuifDag,
} from "../../src/cards/camera-filters.js";

/** Een moment op een vaste dag, zodat de proeven niet van de klok afhangen. */
const DAG = new Date(2026, 7, 28).getTime(); // 28 augustus 2026, 00:00 lokaal
const om = (uur, minuut = 0) => DAG + uur * 3600000 + minuut * 60000;

/** Een beeld zoals de bewakingsmotor het teruggeeft. */
const beeld = (melder, naam, tijd, camera = "camera.oprit") => ({
  id: `${melder}-${tijd}`,
  camera,
  melder,
  naam,
  tijd: new Date(tijd).toISOString(),
  url: "/api/domotiapp_lovelace/beeld/x.jpg",
});

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

  it("geeft NIETS terug als er niets te herkennen valt", () => {
    // Tot 0.30.0 werd dit stilzwijgend "beweging", en dan verscheen er een
    // filterknop voor iets dat niemand had ingesteld: *"Je hebt Voorkant erbij
    // gezet als filter maar die heb ik helemaal niet gedefinieerd als
    // beweging."*
    assert.equal(raadSoort("binary_sensor.voorkant"), null);
    assert.equal(raadSoort("binary_sensor.oprit_motion"), null);
    assert.equal(raadSoort("binary_sensor.gang"), null);
  });
});

describe("de soort van een beeld", () => {
  it("volgt wat er in de editor gekozen is", () => {
    const b = beeld("binary_sensor.oprit_motion", "Beweging", om(9));
    // Niets gekozen en niets te raden: geen soort.
    assert.equal(soortVanBeeld(b), null);
    assert.equal(
      soortVanBeeld(b, { "meldersoort:binary_sensor.oprit_motion": "beweging" }),
      "beweging"
    );
    assert.equal(
      soortVanBeeld(b, { "meldersoort:binary_sensor.oprit_motion": "voertuig" }),
      "voertuig"
    );
  });

  it("negeert een keuze die niet bestaat", () => {
    const b = beeld("binary_sensor.oprit_person", "Persoon", om(9));
    assert.equal(soortVanBeeld(b, { "meldersoort:binary_sensor.oprit_person": "onzin" }), "mens");
  });

  it("werkt ook voor een beeld waarvan de melder van de kaart af is", () => {
    // Het beeld draagt zijn melder mee; de config weet er niets meer van.
    assert.equal(soortVanBeeld(beeld("binary_sensor.oude_pet", "Huisdier", om(9)), {}), "dier");
  });

  it("leest de tijd van een beeld, en zegt null bij onzin", () => {
    assert.equal(tijdVanBeeld(beeld("x", "y", om(9))), om(9));
    assert.equal(tijdVanBeeld({ tijd: "geen datum" }), null);
    assert.equal(tijdVanBeeld({}), null);
  });
});

describe("filteren", () => {
  const beelden = [
    beeld("binary_sensor.oprit_person", "Persoon", om(9)),
    beeld("binary_sensor.oprit_vehicle", "Auto", om(8)),
    beeld("binary_sensor.tuin_person", "Persoon", om(7), "camera.tuin"),
    beeld("binary_sensor.deurbel", "Deurbel", om(6)),
    beeld("binary_sensor.oprit_person", "Persoon", verschuifDag(DAG, -1) + 3600000),
  ];

  it("laat ALLES zien zonder filters", () => {
    assert.equal(filterBeelden(beelden).length, 5);
    assert.equal(filterBeelden(beelden, { soorten: new Set() }).length, 5);
  });

  it("filtert op soort", () => {
    const uit = filterBeelden(beelden, { soorten: new Set(["mens"]) });
    assert.equal(uit.length, 3);
  });

  it("filtert op meerdere soorten tegelijk", () => {
    const uit = filterBeelden(beelden, { soorten: new Set(["voertuig", "aanbellen"]) });
    assert.deepEqual(uit.map((b) => b.naam), ["Auto", "Deurbel"]);
  });

  it("filtert op camera", () => {
    const uit = filterBeelden(beelden, { camera: "camera.tuin" });
    assert.equal(uit.length, 1);
    assert.equal(uit[0].camera, "camera.tuin");
  });

  it("filtert op dag", () => {
    assert.equal(filterBeelden(beelden, { dag: DAG }).length, 4);
    assert.equal(filterBeelden(beelden, { dag: verschuifDag(DAG, -1) }).length, 1);
    assert.equal(filterBeelden(beelden, { dag: verschuifDag(DAG, -2) }).length, 0);
  });

  it("combineert dag, soort en camera", () => {
    const uit = filterBeelden(beelden, {
      dag: DAG,
      soorten: new Set(["mens"]),
      camera: "camera.oprit",
    });
    assert.equal(uit.length, 1);
    assert.equal(uit[0].melder, "binary_sensor.oprit_person");
  });

  it("houdt een beeld zonder leesbare tijd zolang er geen dag gekozen is", () => {
    const stuk = [{ id: "x", camera: "camera.oprit", melder: "binary_sensor.a", tijd: "?" }];
    assert.equal(filterBeelden(stuk).length, 1);
    assert.equal(filterBeelden(stuk, { dag: DAG }).length, 0);
  });

  it("telt per soort voor het getal op de knop", () => {
    assert.deepEqual(telPerSoort(beelden), { mens: 3, voertuig: 1, aanbellen: 1 });
  });

  it("telt met de soort uit de editor mee", () => {
    const telling = telPerSoort(beelden, {
      "meldersoort:binary_sensor.tuin_person": "dier",
    });
    assert.deepEqual(telling, { mens: 2, dier: 1, voertuig: 1, aanbellen: 1 });
  });

  it("noemt de dagen waarop er beelden zijn, nieuwste eerst", () => {
    assert.deepEqual(dagenMetBeelden(beelden), [DAG, verschuifDag(DAG, -1)]);
    assert.deepEqual(dagenMetBeelden([]), []);
  });
});

describe("welke filterknoppen er horen te staan", () => {
  it("toont alleen de soorten die aan een melder hangen", () => {
    const melders = [
      { entity: "binary_sensor.a", soort: "mens" },
      { entity: "binary_sensor.b", soort: "voertuig" },
    ];
    assert.deepEqual(
      soortenVoorFilter(melders).map((s) => s.sleutel),
      ["mens", "voertuig"]
    );
  });

  it("houdt de vaste volgorde aan, hoe de melders ook staan", () => {
    const melders = [
      { entity: "a", soort: "ontgrendeling" },
      { entity: "b", soort: "dier" },
      { entity: "c", soort: "mens" },
    ];
    assert.deepEqual(
      soortenVoorFilter(melders).map((s) => s.sleutel),
      ["mens", "dier", "ontgrendeling"]
    );
  });

  it("laat een melder ZONDER soort geen knop opleveren", () => {
    // Dit is de melding van 28 augustus 2026: "Voorkant" hing nergens aan en
    // kreeg toch een knop "Beweging".
    const melders = [
      { entity: "binary_sensor.voorkant", soort: null },
      { entity: "binary_sensor.oprit_person", soort: "mens" },
    ];
    assert.deepEqual(
      soortenVoorFilter(melders).map((s) => s.sleutel),
      ["mens"]
    );
  });

  it("geeft een lege rij als er niets is ingesteld", () => {
    assert.deepEqual(soortenVoorFilter([{ entity: "x", soort: null }]), []);
    assert.deepEqual(soortenVoorFilter([]), []);
    assert.deepEqual(soortenVoorFilter(undefined), []);
  });

  it("toont Beweging pas als je hem zelf gekozen hebt", () => {
    assert.deepEqual(soortenVoorFilter([{ entity: "x", soort: null }]), []);
    assert.deepEqual(
      soortenVoorFilter([{ entity: "x", soort: "beweging" }]).map((s) => s.sleutel),
      ["beweging"]
    );
  });
});

describe("welke camera's in het filter horen", () => {
  const OPRIT = "camera.oprit";
  const TUIN = "camera.tuin";
  const VOORKANT = "camera.voorkant";

  it("laat een camera weg waar geen melder aan hangt", () => {
    // De melding van 28 augustus 2026: "Voorkant staat bij mij er nog bij
    // terwijl ik geen bewegingsmelder heb gekoppeld aan die camera."
    const uit = camerasVoorFilter([OPRIT, TUIN, VOORKANT], [OPRIT, TUIN], []);
    assert.deepEqual(uit, [OPRIT, TUIN]);
  });

  it("houdt de volgorde van de kaart aan", () => {
    assert.deepEqual(camerasVoorFilter([OPRIT, TUIN], [TUIN, OPRIT], []), [OPRIT, TUIN]);
  });

  it("laat alle camera's staan zodra één melder bij allemaal hoort", () => {
    const uit = camerasVoorFilter([OPRIT, TUIN, VOORKANT], [OPRIT, null], []);
    assert.deepEqual(uit, [OPRIT, TUIN, VOORKANT]);
  });

  it("houdt een camera die nog beelden heeft, ook zonder melder", () => {
    // Anders staan er beelden in de strook waar je niet meer op kunt filteren.
    const uit = camerasVoorFilter(
      [OPRIT, VOORKANT],
      [OPRIT],
      [{ camera: VOORKANT, melder: "binary_sensor.oud" }]
    );
    assert.deepEqual(uit, [OPRIT, VOORKANT]);
  });

  it("geeft een lege lijst als er nergens een melder aan hangt", () => {
    assert.deepEqual(camerasVoorFilter([OPRIT, TUIN], [], []), []);
  });
});

describe("een beeld zonder soort", () => {
  const zonder = beeld("binary_sensor.voorkant", "Voorkant", om(9));
  const mens = beeld("binary_sensor.oprit_person", "Persoon", om(8));

  it("staat er gewoon bij zolang er niet gefilterd wordt", () => {
    assert.equal(filterBeelden([zonder, mens]).length, 2);
  });

  it("valt buiten elk soortfilter", () => {
    const uit = filterBeelden([zonder, mens], { soorten: new Set(["mens"]) });
    assert.deepEqual(uit.map((b) => b.naam), ["Persoon"]);
  });

  it("telt bij geen enkele knop mee", () => {
    assert.deepEqual(telPerSoort([zonder, mens]), { mens: 1 });
  });
});

describe("van dag naar dag springen", () => {
  const dagen = [DAG, verschuifDag(DAG, -1), verschuifDag(DAG, -4)];

  it("springt naar de eerstvolgende dag waar iets staat", () => {
    // Van vandaag terug is gisteren; van gisteren terug is vier dagen geleden,
    // en niet eergisteren -- daar staat niets.
    assert.equal(dagStap(dagen, DAG, -1), verschuifDag(DAG, -1));
    assert.equal(dagStap(dagen, verschuifDag(DAG, -1), -1), verschuifDag(DAG, -4));
  });

  it("springt ook weer vooruit", () => {
    assert.equal(dagStap(dagen, verschuifDag(DAG, -4), 1), verschuifDag(DAG, -1));
    assert.equal(dagStap(dagen, verschuifDag(DAG, -1), 1), DAG);
  });

  it("geeft null als er in die richting niets meer is", () => {
    assert.equal(dagStap(dagen, DAG, 1), null);
    assert.equal(dagStap(dagen, verschuifDag(DAG, -4), -1), null);
    assert.equal(dagStap([], DAG, -1), null);
  });

  it("werkt vanaf een dag die zelf niets heeft", () => {
    assert.equal(dagStap(dagen, verschuifDag(DAG, -2), -1), verschuifDag(DAG, -4));
    assert.equal(dagStap(dagen, verschuifDag(DAG, -2), 1), verschuifDag(DAG, -1));
  });
});

describe("het opslagscherm: per dag", () => {
  it("groepeert per dag, nieuwste dag eerst", () => {
    const beelden = [
      beeld("binary_sensor.a", "A", om(9)),
      beeld("binary_sensor.b", "B", verschuifDag(DAG, -1) + 3600000),
      beeld("binary_sensor.c", "C", om(20)),
    ];
    const groepen = perDag(beelden);
    assert.deepEqual(groepen.map((g) => g.dag), [DAG, verschuifDag(DAG, -1)]);
    // Binnen een dag ook nieuwste eerst.
    assert.deepEqual(groepen[0].beelden.map((b) => b.naam), ["C", "A"]);
  });

  it("telt de bytes per dag op", () => {
    const met = (tijd, bytes) => ({ ...beeld("binary_sensor.a", "A", tijd), bytes });
    const groepen = perDag([met(om(9), 100), met(om(10), 250)]);
    assert.equal(groepen[0].bytes, 350);
  });

  it("zet een beeld zonder leesbare tijd onderaan in een eigen bak", () => {
    const groepen = perDag([
      beeld("binary_sensor.a", "A", om(9)),
      { id: "x", camera: "camera.oprit", melder: "binary_sensor.b", tijd: "?" },
    ]);
    assert.deepEqual(groepen.map((g) => g.dag), [DAG, null]);
  });

  it("geeft een lege lijst voor niets", () => {
    assert.deepEqual(perDag([]), []);
    assert.deepEqual(perDag(undefined), []);
  });
});

describe("een aantal bytes leesbaar maken", () => {
  it("kiest de eenheid waar een mens iets aan heeft", () => {
    assert.equal(alsGrootte(0), "0 B");
    assert.equal(alsGrootte(900), "900 B");
    assert.equal(alsGrootte(150 * 1024), "150 kB");
    assert.equal(alsGrootte(75 * 1024 * 1024), "75 MB");
    assert.equal(alsGrootte(2.5 * 1024 * 1024 * 1024), "2.5 GB");
  });

  it("valt terug op nul bij onzin", () => {
    assert.equal(alsGrootte(undefined), "0 B");
    assert.equal(alsGrootte("veel"), "0 B");
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

  it("noemt vandaag en gisteren bij naam, en niets 'Alles'", () => {
    const nu = om(14, 0);
    assert.equal(dagLabel(nu, nu), "Vandaag");
    assert.equal(dagLabel(verschuifDag(nu, -1), nu), "Gisteren");
    assert.equal(dagLabel(verschuifDag(nu, -2), nu), "wo 26 aug");
    assert.equal(dagLabel(null, nu), "Alles");
  });

  it("gaat heen en weer naar een datumveld", () => {
    assert.equal(alsDatumveld(om(23, 59)), "2026-08-28");
    assert.equal(uitDatumveld("2026-08-28"), DAG);
    assert.equal(uitDatumveld("onzin"), null);
    assert.equal(uitDatumveld(null), null);
  });
});
