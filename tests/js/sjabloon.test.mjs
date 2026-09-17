/**
 * De sjabloonlaag onder de badge.
 *
 * NIEUW GEDRAG (17 september 2026). Er was geen sjabloonondersteuning in dit
 * pakket; de eigenaar gebruikte daarvoor `custom:mushroom-template-badge` en
 * vroeg om een eigen badge.
 *
 * Wat hier getoetst wordt is het stuk dat zonder browser te toetsen is: welke
 * waarde een sjabloon is, wat er met het antwoord van Home Assistant gebeurt, en
 * -- het belangrijkste -- dat een set velden zijn abonnementen VASTHOUDT zolang
 * er niets verandert. Dat laatste is geen zuinigheid maar valkuil 23: `ha-form`
 * schrijft de config bij elke toetsaanslag terug, en een set die dan elk
 * abonnement opzegt en opnieuw opent laat de badge bij elke letter leeg
 * knipperen.
 *
 * De verbinding wordt nagebootst: `subscribeMessage` geeft een opzegfunctie
 * terug en onthoudt wie er luistert, zodat een test een nieuwe waarde kan
 * insturen zoals de server dat zou doen.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SjabloonSet, isSjabloon, schoon } from "../../src/sjabloon.js";

/** Een nagebootste HA-verbinding die bijhoudt wat er geabonneerd is. */
function nepHass() {
  const abonnementen = [];
  return {
    hass: {
      connection: {
        async subscribeMessage(terugroep, bericht) {
          const abo = { terugroep, bericht, opgezegd: false };
          abonnementen.push(abo);
          return () => {
            abo.opgezegd = true;
          };
        },
      },
    },
    abonnementen,
    /** Doe alsof de server een nieuwe waarde stuurt voor het n-de abonnement. */
    stuur(n, waarde) {
      abonnementen[n].terugroep({ result: waarde });
    },
    stuurFout(n, fout) {
      abonnementen[n].terugroep({ error: fout, level: "ERROR" });
    },
    open() {
      return abonnementen.filter((a) => !a.opgezegd).length;
    },
  };
}

/** Even wachten tot de `.then` van subscribeMessage geweest is. */
const tik = () => new Promise((r) => setTimeout(r, 0));

describe("isSjabloon", () => {
  it("herkent allebei de Jinja-vormen", () => {
    assert.equal(isSjabloon("{{ states('light.x') }}"), true);
    assert.equal(isSjabloon("{% if true %}a{% endif %}"), true);
  });

  it("laat gewone tekst met rust", () => {
    assert.equal(isSjabloon("Alarm"), false);
    assert.equal(isSjabloon("mdi:fire"), false);
    assert.equal(isSjabloon(""), false);
    assert.equal(isSjabloon(undefined), false);
    assert.equal(isSjabloon(42), false);
  });
});

describe("schoon", () => {
  it("haalt de regeleindes van een YAML-blok weg", () => {
    // `icon: |` met een {% if %} erin levert dit op, en "\n  mdi:fire\n" is
    // geen icoonnaam.
    assert.equal(schoon("\n  mdi:alarm-light\n"), "mdi:alarm-light");
  });

  it("maakt van een getal en een lijst iets leesbaars", () => {
    assert.equal(schoon(7), "7");
    assert.equal(schoon(["a", "b"]), "a, b");
  });

  it("geeft lege tekst voor niets", () => {
    assert.equal(schoon(null), "");
    assert.equal(schoon(undefined), "");
  });
});

describe("SjabloonSet", () => {
  it("abonneert alleen op velden met Jinja erin", async () => {
    const n = nepHass();
    const set = new SjabloonSet(() => {});
    set.zet(n.hass, { icon: "mdi:fire", content: "{{ 1 + 1 }}" }, {});
    await tik();

    assert.equal(n.abonnementen.length, 1, "alleen content is een sjabloon");
    assert.equal(n.abonnementen[0].bericht.type, "render_template");
    assert.equal(n.abonnementen[0].bericht.report_errors, true);
  });

  it("geeft de variabelen mee, zodat `entity` in het sjabloon bestaat", async () => {
    const n = nepHass();
    const set = new SjabloonSet(() => {});
    set.zet(n.hass, { content: "{{ states(entity) }}" }, { entity: "light.x" });
    await tik();

    assert.deepEqual(n.abonnementen[0].bericht.variables, { entity: "light.x" });
  });

  it("toont de tekst zelf zolang er geen sjabloon in staat", () => {
    const n = nepHass();
    const set = new SjabloonSet(() => {});
    set.zet(n.hass, { label: "Alarm" }, {});
    assert.equal(set.waarde("label", "Alarm"), "Alarm");
  });

  it("toont NIETS in plaats van de Jinja zolang het antwoord er niet is", () => {
    const n = nepHass();
    const set = new SjabloonSet(() => {});
    const sjabloon = "{% if is_state(entity, 'on') %}Aan{% endif %}";
    set.zet(n.hass, { content: sjabloon }, {});
    // Zou hier het sjabloon zelf staan, dan las een dashboard even
    // "{% if is_state(...) %}" -- erger dan een lege badge.
    assert.equal(set.waarde("content", sjabloon), "");
  });

  it("meldt één keer zodra de waarde verandert, en niet als hij gelijk blijft", async () => {
    const n = nepHass();
    let meldingen = 0;
    const set = new SjabloonSet(() => meldingen++);
    set.zet(n.hass, { content: "{{ x }}" }, {});
    await tik();

    n.stuur(0, "Aan");
    assert.equal(meldingen, 1);
    assert.equal(set.waarde("content", "{{ x }}"), "Aan");

    n.stuur(0, "Aan");
    assert.equal(meldingen, 1, "dezelfde waarde tekent niet opnieuw");

    n.stuur(0, "Uit");
    assert.equal(meldingen, 2);
    assert.equal(set.waarde("content", "{{ x }}"), "Uit");
  });

  it("HOUDT het abonnement vast als er niets verandert (valkuil 23)", async () => {
    const n = nepHass();
    const set = new SjabloonSet(() => {});
    const velden = { content: "{{ x }}" };

    set.zet(n.hass, velden, { entity: "light.x" });
    await tik();
    // Dit is wat er bij elke toetsaanslag in de editor gebeurt.
    set.zet(n.hass, velden, { entity: "light.x" });
    set.zet(n.hass, velden, { entity: "light.x" });
    await tik();

    assert.equal(n.abonnementen.length, 1, "geen tweede abonnement");
    assert.equal(n.abonnementen[0].opgezegd, false);
  });

  it("vervangt het abonnement wél als het sjabloon verandert", async () => {
    const n = nepHass();
    const set = new SjabloonSet(() => {});
    set.zet(n.hass, { content: "{{ a }}" }, {});
    await tik();
    set.zet(n.hass, { content: "{{ b }}" }, {});
    await tik();

    assert.equal(n.abonnementen.length, 2);
    assert.equal(n.abonnementen[0].opgezegd, true, "het oude is opgezegd");
    assert.equal(n.abonnementen[1].opgezegd, false);
  });

  it("vervangt het abonnement als de variabelen veranderen", async () => {
    const n = nepHass();
    const set = new SjabloonSet(() => {});
    set.zet(n.hass, { content: "{{ states(entity) }}" }, { entity: "light.a" });
    await tik();
    set.zet(n.hass, { content: "{{ states(entity) }}" }, { entity: "light.b" });
    await tik();

    assert.equal(n.abonnementen.length, 2);
    assert.equal(n.abonnementen[0].opgezegd, true);
  });

  it("zegt op zodra een veld geen sjabloon meer is", async () => {
    const n = nepHass();
    const set = new SjabloonSet(() => {});
    set.zet(n.hass, { content: "{{ x }}" }, {});
    await tik();
    set.zet(n.hass, { content: "Gewoon tekst" }, {});
    await tik();

    assert.equal(n.open(), 0);
    assert.equal(set.waarde("content", "Gewoon tekst"), "Gewoon tekst");
  });

  it("zegt op zodra een veld helemaal uit de config verdwijnt", async () => {
    const n = nepHass();
    const set = new SjabloonSet(() => {});
    set.zet(n.hass, { content: "{{ x }}", label: "{{ y }}" }, {});
    await tik();
    assert.equal(n.open(), 2);

    set.zet(n.hass, { content: "{{ x }}" }, {});
    await tik();
    assert.equal(n.open(), 1);
  });

  it("houdt een sjabloonfout vast zonder om te vallen", async () => {
    const n = nepHass();
    let meldingen = 0;
    const set = new SjabloonSet(() => meldingen++);
    set.zet(n.hass, { content: "{{ kapot( }}" }, {});
    await tik();

    n.stuurFout(0, "TemplateSyntaxError: unexpected '}', expected ')'");
    assert.equal(meldingen, 1);
    assert.match(set.fout("content"), /TemplateSyntaxError/);
    assert.deepEqual(set.fouten(), [
      "content: TemplateSyntaxError: unexpected '}', expected ')'",
    ]);
    assert.equal(set.waarde("content", "{{ kapot( }}"), "");
  });

  it("herstelt zodra het sjabloon weer klopt", async () => {
    const n = nepHass();
    const set = new SjabloonSet(() => {});
    set.zet(n.hass, { content: "{{ x }}" }, {});
    await tik();

    n.stuurFout(0, "TemplateError: boem");
    assert.equal(set.fouten().length, 1);

    n.stuur(0, "Aan");
    assert.equal(set.fouten().length, 0);
    assert.equal(set.waarde("content", "{{ x }}"), "Aan");
  });

  it("zegt alles op bij stop()", async () => {
    const n = nepHass();
    const set = new SjabloonSet(() => {});
    set.zet(n.hass, { content: "{{ a }}", label: "{{ b }}", icon: "{{ c }}" }, {});
    await tik();
    assert.equal(n.open(), 3);

    set.stop();
    assert.equal(n.open(), 0);
  });

  it("valt niet om zonder verbinding", () => {
    const set = new SjabloonSet(() => {});
    // Dit is het kaartvoorbeeld in de kiezer: een config zonder `hass`.
    set.zet(undefined, { content: "{{ x }}" }, {});
    assert.equal(set.waarde("content", "{{ x }}"), "");
    set.stop();
  });

  it("zegt een abonnement op dat pas NA het opzeggen binnenkomt", async () => {
    // De editor kan opzeggen terwijl subscribeMessage nog onderweg is. Blijft
    // die dan staan, dan stapelen er abonnementen op bij elke toetsaanslag.
    const abonnementen = [];
    let losmaken;
    const traag = {
      connection: {
        subscribeMessage(terugroep, bericht) {
          const abo = { terugroep, bericht, opgezegd: false };
          abonnementen.push(abo);
          return new Promise((res) => {
            losmaken = () => res(() => { abo.opgezegd = true; });
          });
        },
      },
    };

    const set = new SjabloonSet(() => {});
    set.zet(traag, { content: "{{ x }}" }, {});
    set.stop();
    losmaken();
    await tik();

    assert.equal(abonnementen[0].opgezegd, true, "alsnog opgezegd");
  });
});
