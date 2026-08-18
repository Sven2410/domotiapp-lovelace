/**
 * Tests op de lampbesturing van de editor (SPEC 6 en 7).
 *
 * Elke test is gelabeld als **NIEUW GEDRAG** of **REGRESSIEWACHT**, volgens de
 * werkafspraak in CLAUDE.md. Alles in dit bestand is NIEUW GEDRAG: vóór fase
 * 4b-1 bestond `src/lamp-besturing.js` niet, dus deze tests kunnen op de code
 * van vóór de wijziging niet eens laden — dat is in het faserapport met de
 * uitvoer aangetoond.
 *
 * Er staat hier bewust geen enkele jsdom-test. jsdom stubt `ha-control-slider`
 * volledig en beoordeelt de CSS-cascade niet; of een regelaar een klik
 * accepteert en of een niet-ingestelde lamp grijs rendert, is alleen in een
 * echte browser vast te stellen. Wat hier wél hard te toetsen is, is de
 * afbeelding van (lampstate, huidige waarde) naar een waarde in het
 * opslagschema van SPEC 10.4.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_MAX_KELVIN,
  DEFAULT_MIN_KELVIN,
  MAX_BRIGHTNESS,
  STANDAARD_HS,
  VERLOOP_STOPS,
  aanwaarde,
  alsProcent,
  beginwaarde,
  bepaalBesturing,
  isIngesteld,
  nieuweLampen,
  kelvinNaarCss,
  kelvinNaarRgb,
  kelvinVerloop,
  metAanUit,
  metHelderheid,
  metKleur,
  metKleurtemp,
  toonAan,
  toonHelderheid,
  toonHs,
  toonKelvin,
  meldingNieuweLampen,
  toonwaarde,
  zichtbareBesturingen,
} from "../../src/scene/lamp-besturing.js";

/** De vier lampsoorten uit SPEC 6.2, zoals ze in fase 1 zijn gemeten. */
const AANUIT = {
  state: "off",
  attributes: { supported_color_modes: ["onoff"] },
};
const DIM = {
  state: "off",
  attributes: { supported_color_modes: ["brightness"] },
};
const KLEURTEMP = {
  state: "off",
  attributes: {
    supported_color_modes: ["color_temp"],
    min_color_temp_kelvin: 2202,
    max_color_temp_kelvin: 6535,
  },
};
const RGB = {
  state: "off",
  attributes: { supported_color_modes: ["rgb"] },
};

// --------------------------------------------------------------------------

describe("bepaalBesturing — NIEUW GEDRAG (SPEC 6.1 en 6.2)", () => {
  it("geeft alleen aan/uit bij exact [onoff]", () => {
    const kan = bepaalBesturing(AANUIT);
    assert.equal(kan.helderheid, false);
    assert.equal(kan.kleurtemp, false);
    assert.equal(kan.kleur, false);
  });

  it("geeft een helderheidsregelaar bij [brightness]", () => {
    const kan = bepaalBesturing(DIM);
    assert.equal(kan.helderheid, true);
    assert.equal(kan.kleurtemp, false);
    assert.equal(kan.kleur, false);
  });

  it("geeft helderheid én Kelvin bij [color_temp] — brightness staat er níét in", () => {
    // Dit is de kern van SPEC 6.2: een color_temp-lamp meldt geen brightness,
    // en is tóch dimbaar. Zoeken op "brightness" zou hier de verkeerde
    // besturing opleveren.
    assert.equal(KLEURTEMP.attributes.supported_color_modes.includes("brightness"), false);

    const kan = bepaalBesturing(KLEURTEMP);
    assert.equal(kan.helderheid, true);
    assert.equal(kan.kleurtemp, true);
    assert.equal(kan.kleur, false);
  });

  it("geeft helderheid én een kleurkiezer bij [rgb]", () => {
    const kan = bepaalBesturing(RGB);
    assert.equal(kan.helderheid, true);
    assert.equal(kan.kleur, true);
    assert.equal(kan.kleurtemp, false);
  });

  it("herkent alle vijf de kleurmodi uit SPEC 6.1", () => {
    for (const modus of ["hs", "rgb", "rgbw", "rgbww", "xy"]) {
      const kan = bepaalBesturing({
        state: "on",
        attributes: { supported_color_modes: [modus] },
      });
      assert.equal(kan.kleur, true, `${modus} hoort een kleurkiezer te geven`);
      assert.equal(kan.helderheid, true, `${modus} hoort dimbaar te zijn`);
    }
  });

  it("geeft white geen eigen besturing (SPEC 6.1, buiten v1)", () => {
    const kan = bepaalBesturing({
      state: "on",
      attributes: { supported_color_modes: ["white"] },
    });
    assert.equal(kan.helderheid, true);
    assert.equal(kan.kleur, false);
    assert.equal(kan.kleurtemp, false);
  });

  it("neemt de Kelvin-grenzen van de lamp over", () => {
    const kan = bepaalBesturing(KLEURTEMP);
    assert.equal(kan.minKelvin, 2202);
    assert.equal(kan.maxKelvin, 6535);
    assert.equal(kan.kelvinUitDefaults, false);
  });

  it("valt terug op 2000–6535 K als de grenzen ontbreken (SPEC 6.3)", () => {
    const kan = bepaalBesturing({
      state: "on",
      attributes: { supported_color_modes: ["color_temp"] },
    });
    assert.equal(kan.minKelvin, DEFAULT_MIN_KELVIN);
    assert.equal(kan.maxKelvin, DEFAULT_MAX_KELVIN);
    // De vlag bestaat zodat de editor dat één keer kan loggen (SPEC 18.5).
    assert.equal(kan.kelvinUitDefaults, true);
  });

  it("meldt een lamp die niet in hass.states staat als onbekend (SPEC 6.4)", () => {
    const kan = bepaalBesturing(undefined);
    assert.equal(kan.bekend, false);
    assert.equal(kan.helderheid, false);
    assert.equal(kan.kleurtemp, false);
    assert.equal(kan.kleur, false);
  });

  it("geeft een unavailable lamp aan/uit plus helderheid (SPEC 7.3)", () => {
    // Een unavailable entiteit heeft geen state attributes, dus ook geen
    // supported_color_modes (helpers/entity.py:1118-1124). Hij is wél
    // instelbaar, en "aan op 100 %" bij het aanzetten vraagt om helderheid.
    const kan = bepaalBesturing({ state: "unavailable", attributes: {} });
    assert.equal(kan.bekend, true);
    assert.equal(kan.beschikbaar, false);
    assert.equal(kan.helderheid, true);
    assert.equal(kan.kleurtemp, false);
    assert.equal(kan.kleur, false);
  });
});

// --------------------------------------------------------------------------

describe("beginwaarde — NIEUW GEDRAG (fase 4b-1-fix4)", () => {
  it("geeft altijd uit, ook als de echte lamp brandt", () => {
    // Dit is de kern van de wijziging. Vóór fix4 nam deze functie de huidige
    // stand over en stond de schakelaar dus aan bij een brandende lamp.
    const brandt = {
      state: "on",
      attributes: {
        supported_color_modes: ["color_temp"],
        color_mode: "color_temp",
        brightness: 153,
        color_temp_kelvin: 2700,
      },
    };
    assert.deepEqual(beginwaarde(brandt), { state: "off" });
    assert.deepEqual(beginwaarde(DIM), { state: "off" });
    assert.deepEqual(beginwaarde({ state: "unavailable", attributes: {} }), {
      state: "off",
    });
    assert.deepEqual(beginwaarde(undefined), { state: "off" });
  });

  it("levert een uit-waarde zonder andere sleutels (SPEC 10.4)", () => {
    assert.deepEqual(Object.keys(beginwaarde()), ["state"]);
  });

  it("de schakelaar van een niet-ingestelde lamp staat uit, wat de lamp ook doet", () => {
    const brandt = {
      state: "on",
      attributes: { supported_color_modes: ["brightness"], brightness: 200 },
    };
    assert.equal(toonAan(undefined, brandt), false);
    assert.equal(toonAan(undefined, DIM), false);
    assert.equal(toonAan(undefined, { state: "unavailable", attributes: {} }), false);
  });
});

// --------------------------------------------------------------------------

describe("aanwaarde — NIEUW GEDRAG (fase 4b-1-fix4)", () => {
  it("neemt bij het aanzetten de huidige stand van de lamp over", () => {
    const lamp = {
      state: "on",
      attributes: {
        supported_color_modes: ["color_temp"],
        min_color_temp_kelvin: 2202,
        max_color_temp_kelvin: 6535,
        color_mode: "color_temp",
        brightness: 153,
        color_temp_kelvin: 2700,
      },
    };
    assert.deepEqual(aanwaarde(lamp), {
      state: "on",
      brightness: 153,
      color_temp_kelvin: 2700,
    });
    // En via de schakelaar, wat de editor daadwerkelijk aanroept.
    assert.deepEqual(metAanUit(undefined, true, lamp), {
      state: "on",
      brightness: 153,
      color_temp_kelvin: 2700,
    });
  });

  it("neemt de kleur over van een aanstaande rgb-lamp als hs_color", () => {
    const lamp = {
      state: "on",
      attributes: {
        supported_color_modes: ["rgb"],
        color_mode: "rgb",
        brightness: 204,
        hs_color: [120, 75],
      },
    };
    assert.deepEqual(aanwaarde(lamp), {
      state: "on",
      brightness: 204,
      hs_color: [120, 75],
    });
  });

  it("geeft 100 % als de lamp zelf uit staat", () => {
    // Er is dan geen huidige helderheid om over te nemen.
    assert.deepEqual(aanwaarde(DIM), { state: "on", brightness: MAX_BRIGHTNESS });
  });

  it("laat brightness weg bij een aan/uit-lamp (SPEC 10.4)", () => {
    assert.deepEqual(aanwaarde({ ...AANUIT, state: "on" }), { state: "on" });
  });

  it("geeft een unavailable lamp aan op 100 %, zonder kleurattribuut", () => {
    assert.deepEqual(aanwaarde({ state: "unavailable", attributes: {} }), {
      state: "on",
      brightness: MAX_BRIGHTNESS,
    });
  });

  it("geeft een unknown lamp dezelfde aanwaarde", () => {
    assert.deepEqual(aanwaarde({ state: "unknown", attributes: {} }), {
      state: "on",
      brightness: MAX_BRIGHTNESS,
    });
  });

  it("neemt geen kleur over die niet bij de huidige color_mode hoort", () => {
    // De lamp staat op kleurtemperatuur maar draagt nog een oude hs_color.
    // Twee kleurattributen tegelijk is een schemafout (SPEC 10.4).
    const lamp = {
      state: "on",
      attributes: {
        supported_color_modes: ["color_temp", "hs"],
        color_mode: "color_temp",
        brightness: 100,
        color_temp_kelvin: 3000,
        hs_color: [30, 50],
      },
    };
    const waarde = aanwaarde(lamp);
    assert.equal(waarde.color_temp_kelvin, 3000);
    assert.equal("hs_color" in waarde, false);
  });
});

// --------------------------------------------------------------------------

describe("REGRESSIEWACHT — wat fase 4b-1-fix4 níét mocht veranderen", () => {
  /**
   * Deze twee slagen ook op de code van vóór fix4, en dat hoort zo. Ze bewaken
   * dat het omdraaien van de beginstand niet stiekem het datamodel of het
   * "eerste aanraking"-gedrag heeft meegenomen.
   */
  const BRANDT = {
    state: "on",
    attributes: { supported_color_modes: ["brightness"], brightness: 200 },
  };

  it("een regelaar aanraken zonder eerst de schakelaar zet de lamp aan op die waarde", () => {
    const waarde = metHelderheid(undefined, 102, BRANDT);
    assert.deepEqual(waarde, { state: "on", brightness: 102 });
    assert.equal(toonAan(waarde, BRANDT), true);
  });

  it("niets aanraken laat de lamp buiten de opslag", () => {
    // `undefined` blijft `undefined`: er is geen mutatie die van "niet
    // ingesteld" een uit-waarde maakt zonder dat iemand iets aanraakt.
    assert.equal(isIngesteld(undefined), false);
    assert.equal(toonAan(undefined, BRANDT), false);
    // En wat de schakelaar toont is géén opgeslagen waarde: de lamp staat nog
    // steeds niet in `lights`.
    const scene = { icon: "mdi:x", lights: {} };
    assert.equal("light.x" in scene.lights, false);
    assert.deepEqual(nieuweLampen([scene, scene, scene], ["light.x"], 3), ["light.x"]);
  });
});

// --------------------------------------------------------------------------

describe("meldingNieuweLampen — NIEUW GEDRAG (fase 4b-1-fix4)", () => {
  it("gebruikt enkelvoud bij één lamp", () => {
    assert.equal(meldingNieuweLampen(1), "1 lamp nog niet ingesteld");
  });

  it("gebruikt meervoud vanaf twee", () => {
    assert.equal(meldingNieuweLampen(2), "2 lampen nog niet ingesteld");
    assert.equal(meldingNieuweLampen(5), "5 lampen nog niet ingesteld");
  });

  it("noemt geen scene — dat detail hoort in de editor (SPEC 3.4)", () => {
    for (const aantal of [1, 2, 7]) {
      assert.equal(/scene/i.test(meldingNieuweLampen(aantal)), false);
    }
  });

  it("zwijgt als er niets te melden is", () => {
    assert.equal(meldingNieuweLampen(0), null);
    assert.equal(meldingNieuweLampen(-1), null);
    assert.equal(meldingNieuweLampen(undefined), null);
  });
});

// --------------------------------------------------------------------------

describe("de mutaties houden zich aan het schema — NIEUW GEDRAG (SPEC 10.4)", () => {
  it("uitzetten wist helderheid en kleur", () => {
    const waarde = { state: "on", brightness: 100, color_temp_kelvin: 3000 };
    assert.deepEqual(metAanUit(waarde, false, KLEURTEMP), { state: "off" });
  });

  it("aanzetten van een uitstaande lamp geeft 100 %", () => {
    assert.deepEqual(metAanUit({ state: "off" }, true, DIM), {
      state: "on",
      brightness: MAX_BRIGHTNESS,
    });
  });

  it("aanzetten van een niet-ingestelde lamp neemt de huidige stand over", () => {
    const lamp = {
      state: "on",
      attributes: { supported_color_modes: ["brightness"], brightness: 77 },
    };
    assert.deepEqual(metAanUit(undefined, true, lamp), {
      state: "on",
      brightness: 77,
    });
  });

  it("aanzetten laat een al ingestelde aan-waarde ongemoeid", () => {
    const waarde = { state: "on", brightness: 12, hs_color: [200, 40] };
    assert.deepEqual(metAanUit(waarde, true, RGB), waarde);
    assert.notEqual(metAanUit(waarde, true, RGB), waarde, "moet een kopie zijn");
  });

  it("de helderheid verzetten zet een uitstaande lamp aan", () => {
    // "uit op 40 %" bestaat niet; state off met brightness is een schemafout.
    //
    // Sinds fase 4b-1-fix2 is dit pad in de editor niet meer met de muis te
    // bereiken: bij een uit-lamp staat er geen helderheidsregelaar meer (zie
    // `zichtbareBesturingen`). De regel blijft hier staan als vangnet — de
    // module mag ook langs een andere route nooit een uit-lamp met een
    // helderheid opleveren.
    const waarde = metHelderheid({ state: "off" }, 102, DIM);
    assert.deepEqual(waarde, { state: "on", brightness: 102 });
  });

  it("de helderheid blijft binnen 1..255", () => {
    assert.equal(metHelderheid(undefined, 0, DIM).brightness, 1);
    assert.equal(metHelderheid(undefined, 999, DIM).brightness, 255);
    assert.equal(metHelderheid(undefined, "onzin", DIM).brightness, 1);
  });

  it("een aan/uit-lamp krijgt nooit een brightness", () => {
    const waarde = metHelderheid(undefined, 128, AANUIT);
    assert.deepEqual(waarde, { state: "on" });
  });

  it("kleurtemperatuur wist een eerder gezette kleur", () => {
    const waarde = metKleurtemp(
      { state: "on", brightness: 50, hs_color: [10, 20] },
      2700,
      KLEURTEMP,
    );
    assert.deepEqual(waarde, {
      state: "on",
      brightness: 50,
      color_temp_kelvin: 2700,
    });
  });

  it("een kleur wist een eerder gezette kleurtemperatuur", () => {
    const waarde = metKleur(
      { state: "on", brightness: 50, color_temp_kelvin: 2700 },
      [210, 80],
      RGB,
    );
    assert.deepEqual(waarde, {
      state: "on",
      brightness: 50,
      hs_color: [210, 80],
    });
  });

  it("kleurtemperatuur blijft binnen de grenzen van de lamp", () => {
    assert.equal(metKleurtemp(undefined, 1000, KLEURTEMP).color_temp_kelvin, 2202);
    assert.equal(metKleurtemp(undefined, 99999, KLEURTEMP).color_temp_kelvin, 6535);
  });

  it("hs_color blijft binnen 0..360 en 0..100", () => {
    assert.deepEqual(metKleur(undefined, [400, 150], RGB).hs_color, [360, 100]);
    assert.deepEqual(metKleur(undefined, [-5, -5], RGB).hs_color, [0, 0]);
  });

  it("mutaties raken de oorspronkelijke waarde niet aan", () => {
    const origineel = { state: "on", brightness: 10 };
    metHelderheid(origineel, 200, DIM);
    metKleurtemp(origineel, 3000, KLEURTEMP);
    assert.deepEqual(origineel, { state: "on", brightness: 10 });
  });
});

// --------------------------------------------------------------------------

describe("wat de besturingen tonen — NIEUW GEDRAG (SPEC 7.3)", () => {
  it("toont een niet-ingestelde lamp als uit (fase 4b-1-fix4)", () => {
    const lamp = {
      state: "on",
      attributes: { supported_color_modes: ["brightness"], brightness: 128 },
    };
    assert.deepEqual(toonwaarde(undefined, lamp), { state: "off" });
    // De helderheid van de levende lamp blijft wel de terugval zodra er wél
    // een regelaar staat — die verschijnt pas als de lamp aan gaat.
    assert.equal(toonHelderheid(undefined, lamp), 128);
  });

  it("toont de ingestelde waarde zodra die er is", () => {
    const lamp = {
      state: "on",
      attributes: { supported_color_modes: ["brightness"], brightness: 128 },
    };
    assert.equal(toonHelderheid({ state: "on", brightness: 26 }, lamp), 26);
  });

  it("valt voor Kelvin terug op het midden van het bereik", () => {
    assert.equal(toonKelvin({ state: "on" }, KLEURTEMP), Math.round((2202 + 6535) / 2));
  });

  it("valt voor kleur terug op de standaardkleur", () => {
    assert.deepEqual(toonHs({ state: "on" }, RGB), STANDAARD_HS);
  });

  it("rekent helderheid om naar procenten, alleen om te tonen", () => {
    assert.equal(alsProcent(255), 100);
    assert.equal(alsProcent(128), 50);
    // Gewijzigd in fase 10: `brightness: 1` is 0,39 % en rondde af naar 0 —
    // "aan op 0 %" is geen stand die iets betekent, en de regelaar begint ook
    // op 1. Alleen een werkelijke 0 blijft 0, en die komt in de opslag niet voor.
    assert.equal(alsProcent(1), 1);
    assert.equal(alsProcent(0), 0);
  });

  it("aanwaarde van een uitstaande aan/uit-lamp blijft zonder brightness", () => {
    assert.deepEqual(aanwaarde(AANUIT), { state: "on" });
  });
});

// --------------------------------------------------------------------------
// Fase 4b-1-fix3: de resetknop en het uitgrijzen verdwijnen uit de UI, en er
// komt een melding voor lampen die nog niet in alle drie de scenes staan.
// --------------------------------------------------------------------------

describe("nieuweLampen — NIEUW GEDRAG (fase 4b-1-fix3)", () => {
  const LEDEN = ["light.een", "light.twee", "light.drie"];
  const AAN = { state: "on" };

  /** Drie scenes bouwen uit een lijstje per scene van ingestelde lampen. */
  function scenes(...perScene) {
    return perScene.map((ids) => ({
      icon: "mdi:x",
      lights: Object.fromEntries(ids.map((id) => [id, AAN])),
    }));
  }

  it("telt een lamp die in alle drie de scenes staat niet als nieuw", () => {
    const drie = scenes(["light.een"], ["light.een"], ["light.een"]);
    assert.deepEqual(nieuweLampen(drie, ["light.een"], 3), []);
  });

  it("telt een lamp die in twee van de drie staat WEL als nieuw", () => {
    // Een lamp uit willen hebben in scene 3 is ook een keuze; zolang die keuze
    // niet gemaakt is, blijft de melding staan.
    const twee = scenes(["light.een"], ["light.een"], []);
    assert.deepEqual(nieuweLampen(twee, ["light.een"], 3), ["light.een"]);
  });

  it("telt een lamp die in één van de drie staat als nieuw", () => {
    const een = scenes(["light.een"], [], []);
    assert.deepEqual(nieuweLampen(een, ["light.een"], 3), ["light.een"]);
  });

  it("telt een lamp die nergens staat als nieuw", () => {
    assert.deepEqual(nieuweLampen(scenes([], [], []), ["light.een"], 3), ["light.een"]);
  });

  it("laat een lamp die uit de groep is gehaald vallen, ook al staat hij nog in de opslag", () => {
    // SPEC 13.5: zijn waarden blijven bewaard, maar hij hoort niet meer bij deze
    // kamer en mag dus geen melding meer opleveren.
    const opslag = scenes(["light.weg"], [], []);
    assert.deepEqual(nieuweLampen(opslag, ["light.een"], 3), ["light.een"]);
    assert.deepEqual(nieuweLampen(opslag, [], 3), []);
  });

  it("geeft de lampen terug in de volgorde van de ledenlijst", () => {
    const geen = scenes([], [], []);
    assert.deepEqual(nieuweLampen(geen, LEDEN, 3), LEDEN);
  });

  it("behandelt een ontbrekend scene-object als 'daar staat hij niet in'", () => {
    // Zou de server ooit minder dan drie scenes leveren, dan is de lamp per
    // definitie niet in alle drie ingesteld.
    const tweeScenes = scenes(["light.een"], ["light.een"]);
    assert.deepEqual(nieuweLampen(tweeScenes, ["light.een"], 3), ["light.een"]);
  });

  it("gaat om met lege of ontbrekende invoer", () => {
    assert.deepEqual(nieuweLampen(undefined, undefined, 3), []);
    assert.deepEqual(nieuweLampen([], ["light.een"], 3), ["light.een"]);
  });

  it("isIngesteld onderscheidt afwezig van een waarde", () => {
    assert.equal(isIngesteld(undefined), false);
    assert.equal(isIngesteld(null), false);
    assert.equal(isIngesteld({ state: "off" }), true);
    assert.equal(isIngesteld({ state: "on", brightness: 10 }), true);
  });
});

// --------------------------------------------------------------------------
// Bevinding 4 uit de handmatige test van fase 4b-1: een lamp die op "uit" werd
// gezet toonde nog steeds een helderheid en een kleurtemperatuur. De opslag was
// correct (`{"state": "off"}`), maar wat de gebruiker zag klopte er niet mee.
// --------------------------------------------------------------------------

describe("zichtbareBesturingen — NIEUW GEDRAG (bevinding 4 van 4b-1)", () => {
  const AAN_DIM = { state: "on", attributes: { supported_color_modes: ["brightness"], brightness: 51 } };
  const AAN_KLEURTEMP = {
    state: "on",
    attributes: {
      supported_color_modes: ["color_temp"],
      color_mode: "color_temp",
      brightness: 58,
      color_temp_kelvin: 4075,
      min_color_temp_kelvin: 2000,
      max_color_temp_kelvin: 6535,
    },
  };

  it("toont geen helderheid en geen kleurbesturing bij een lamp op uit", () => {
    // De lamp zelf brandt: zonder deze regel vallen toonHelderheid en
    // toonKelvin terug op de levende lamp en toont de editor 23 % en 4075 K
    // naast een lamp die als "uit" wordt opgeslagen.
    const zichtbaar = zichtbareBesturingen({ state: "off" }, AAN_KLEURTEMP);
    assert.deepEqual(zichtbaar, {
      aanuit: true,
      helderheid: false,
      kleurtemp: false,
      kleur: false,
      // Bij "uit" hoort er geen enkele regelaar, en dus ook geen keuze.
      kleurkeuze: false,
      stand: null,
    });
  });

  it("toont ze wel zodra dezelfde lamp op aan staat", () => {
    const zichtbaar = zichtbareBesturingen(
      { state: "on", brightness: 58, color_temp_kelvin: 4075 },
      AAN_KLEURTEMP,
    );
    assert.deepEqual(zichtbaar, {
      aanuit: true,
      helderheid: true,
      kleurtemp: true,
      kleur: false,
      // Deze lamp kan alleen kleurtemperatuur: geen keuzeknoppen (SPEC 6.5).
      kleurkeuze: false,
      stand: null,
    });
  });

  it("toont bij een niet-ingestelde lamp geen regelaars (fase 4b-1-fix4)", () => {
    // Sinds fix4 begint een niet-ingestelde lamp op uit, ook als hij brandt.
    // En een uit-lamp toont geen regelaars — dat is de regel uit fix2.
    assert.equal(zichtbareBesturingen(undefined, AAN_DIM).helderheid, false);
    assert.equal(zichtbareBesturingen(undefined, DIM).helderheid, false);
    assert.equal(zichtbareBesturingen(undefined, AAN_DIM).aanuit, true);
  });

  it("geeft een aan/uit-lamp nooit een helderheidsregelaar", () => {
    const zichtbaar = zichtbareBesturingen({ state: "on" }, { ...AANUIT, state: "on" });
    assert.equal(zichtbaar.aanuit, true);
    assert.equal(zichtbaar.helderheid, false);
  });

  it("geeft een lamp die niet bestaat helemaal geen besturing (SPEC 6.4)", () => {
    assert.deepEqual(zichtbareBesturingen(undefined, undefined), {
      aanuit: false,
      helderheid: false,
      kleurtemp: false,
      kleur: false,
      kleurkeuze: false,
      stand: null,
    });
  });
});

describe("de schakelaar volgt de opgeslagen waarde — NIEUW GEDRAG (bevinding 4 van 4b-1)", () => {
  const AAN_KLEURTEMP = {
    state: "on",
    attributes: {
      supported_color_modes: ["color_temp"],
      color_mode: "color_temp",
      brightness: 58,
      color_temp_kelvin: 4075,
    },
  };

  it("de schakelaar uitzetten levert precies {state: off} op", () => {
    // Sinds fix4 staat een niet-ingestelde lamp al op uit; de weg naar
    // {state: off} loopt daarom via een lamp die eerst aan stond.
    assert.equal(toonAan(undefined, AAN_KLEURTEMP), false);

    const aan = metAanUit(undefined, true, AAN_KLEURTEMP);
    assert.equal(aan.state, "on");

    const naKlik = metAanUit(aan, false, AAN_KLEURTEMP);
    assert.deepEqual(naKlik, { state: "off" });
    assert.equal(Object.keys(naKlik).length, 1, "geen andere sleutels bij state off");
  });

  it("van uit naar aan levert een geldige aan-waarde op (SPEC 7.3)", () => {
    const uit = { state: "off" };
    const aan = metAanUit(uit, true, AAN_KLEURTEMP);
    // De lamp brandt, dus de huidige stand wordt overgenomen.
    assert.deepEqual(aan, { state: "on", brightness: 58, color_temp_kelvin: 4075 });
    assert.equal(toonAan(aan, AAN_KLEURTEMP), true);
  });

  it("de getoonde schakelaarstand en de opgeslagen waarde lopen nooit uiteen", () => {
    const gevallen = [
      undefined,
      { state: "off" },
      { state: "on" },
      { state: "on", brightness: 58 },
      { state: "on", brightness: 58, color_temp_kelvin: 4075 },
    ];
    for (const lamp of [AAN_KLEURTEMP, KLEURTEMP, { state: "unavailable", attributes: {} }]) {
      for (const waarde of gevallen) {
        const getoond = toonAan(waarde, lamp);
        const opgeslagen = toonwaarde(waarde, lamp).state === "on";
        assert.equal(getoond, opgeslagen);
        // En wat er zichtbaar is, hoort bij die stand.
        const zichtbaar = zichtbareBesturingen(waarde, lamp);
        if (!getoond) {
          assert.equal(zichtbaar.helderheid, false);
          assert.equal(zichtbaar.kleurtemp, false);
          assert.equal(zichtbaar.kleur, false);
        }
      }
    }
  });

  it("elke mutatie levert een waarde op waarvan de schakelaarstand klopt", () => {
    const start = { state: "on", brightness: 58, color_temp_kelvin: 4075 };
    const mutaties = [
      metAanUit(start, false, AAN_KLEURTEMP),
      metAanUit(start, true, AAN_KLEURTEMP),
      metHelderheid(start, 200, AAN_KLEURTEMP),
      metKleurtemp(start, 3000, AAN_KLEURTEMP),
      metKleur(start, [200, 80], RGB),
    ];
    for (const waarde of mutaties) {
      assert.equal(toonAan(waarde, AAN_KLEURTEMP), waarde.state === "on");
      if (waarde.state === "off") {
        assert.deepEqual(waarde, { state: "off" }, "uit heeft geen andere sleutels");
      }
    }
  });
});

// --------------------------------------------------------------------------
// Bevinding 2 uit de handmatige test van fase 4b-1: de Kelvin-regelaar was
// grijs, waardoor je een getal koos in plaats van een kleur.
// --------------------------------------------------------------------------

describe("kelvinNaarRgb — NIEUW GEDRAG (bevinding 2 van 4b-1)", () => {
  it("maakt warm licht oranje: veel rood, weinig blauw", () => {
    const [r, g, b] = kelvinNaarRgb(2000);
    assert.equal(r, 255, "warm licht is verzadigd rood");
    assert.ok(b < g, `blauw (${b}) hoort onder groen (${g}) te liggen`);
    assert.ok(g < r, `groen (${g}) hoort onder rood (${r}) te liggen`);
  });

  it("maakt licht aan de bovenkant van het lampbereik bijna wit", () => {
    // 6535 K is HA's eigen bovengrens (SPEC 6.3). Daar liggen de drie kanalen
    // dicht bij elkaar: het verloop eindigt in blauwwit, niet in oranje.
    const [r, g, b] = kelvinNaarRgb(6535);
    assert.ok(r - b <= 8, `rood (${r}) en blauw (${b}) horen dicht bijeen te liggen`);
    assert.ok(b >= 240, `blauw (${b}) hoort hoog te zijn`);
    assert.ok(g >= 240, `groen (${g}) hoort hoog te zijn`);
  });

  it("laat blauw het maximum halen en rood zakken boven 6600 K", () => {
    const [r, , b] = kelvinNaarRgb(10000);
    assert.equal(b, 255, "koel licht is verzadigd blauw");
    assert.ok(r < 255, `rood (${r}) hoort onder het maximum te liggen`);
  });

  it("laat blauw monotoon stijgen met de kleurtemperatuur", () => {
    // Dit is de eigenschap waar het verloop op leunt: van links naar rechts
    // wordt het licht koeler, nooit tussendoor weer warmer.
    let vorige = -1;
    for (let kelvin = 2000; kelvin <= 6500; kelvin += 250) {
      const blauw = kelvinNaarRgb(kelvin)[2];
      assert.ok(blauw >= vorige, `blauw daalde bij ${kelvin} K`);
      vorige = blauw;
    }
  });

  it("klemt buiten het bereik in plaats van onzin te geven", () => {
    assert.deepEqual(kelvinNaarRgb(0), kelvinNaarRgb(1000));
    assert.deepEqual(kelvinNaarRgb(999999), kelvinNaarRgb(40000));
    for (const kanaal of kelvinNaarRgb(Number.NaN)) {
      assert.ok(Number.isInteger(kanaal) && kanaal >= 0 && kanaal <= 255);
    }
  });

  it("geeft een bruikbare CSS-waarde", () => {
    assert.match(kelvinNaarCss(2700), /^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/);
  });
});

describe("kelvinVerloop — NIEUW GEDRAG (bevinding 2 van 4b-1)", () => {
  it("begint en eindigt op de grenzen van díé lamp", () => {
    // De grenzen van light.test_lamp_kleurtemp op de testinstance.
    const verloop = kelvinVerloop(2202, 6535);
    assert.ok(
      verloop.startsWith(`linear-gradient(to right, ${kelvinNaarCss(2202)} 0%`),
      `verloop begon niet op de ondergrens: ${verloop}`,
    );
    assert.ok(
      verloop.endsWith(`${kelvinNaarCss(6535)} 100%)`),
      `verloop eindigde niet op de bovengrens: ${verloop}`,
    );
  });

  it("gebruikt een andere lamp ook echt andere uiteinden", () => {
    // Een lamp met een smaller bereik hoort een ander verloop te krijgen; het
    // verloop hoort bij de lamp, niet bij een vast bereik.
    assert.notEqual(kelvinVerloop(2202, 6535), kelvinVerloop(2700, 4000));
    assert.ok(kelvinVerloop(2700, 4000).includes(`${kelvinNaarCss(2700)} 0%`));
  });

  it("zet de stops gelijkmatig neer", () => {
    const verloop = kelvinVerloop(2000, 6000);
    const percentages = [...verloop.matchAll(/(\d{1,3})%/g)].map((m) => Number(m[1]));
    assert.equal(percentages.length, VERLOOP_STOPS);
    assert.equal(percentages[0], 0);
    assert.equal(percentages[percentages.length - 1], 100);
    for (let i = 1; i < percentages.length; i += 1) {
      assert.ok(percentages[i] > percentages[i - 1], "stops horen te stijgen");
    }
  });

  it("gaat om met omgedraaide grenzen", () => {
    assert.equal(kelvinVerloop(6535, 2202), kelvinVerloop(2202, 6535));
  });
});
