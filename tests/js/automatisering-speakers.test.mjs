/**
 * Speakers van Music Assistant op de automatiseringskaart (0.101.0). De eigenaar, 2 november 2026: "ik wil dat de klant in
 * de automatisering kaart ook media kan afspelen. Nu heb je verlichting en rolluiken".
 *
 * NIEUW GEDRAG, behalve wat met REGRESSIEWACHT begint.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as L from "../../src/cards/automatisering-logica.js";

const KAART = {
  lampen: ["light.woonkamer", "light.tuin"],
  rolluiken: ["cover.voor"],
  speakers: [{ entity: "media_player.keuken", name: "Keuken" }, "media_player.bad", "light.verkeerd"],
};
const LAMPEN = L.lampenUit(KAART);
const LIJST = { uri: "library://playlist/12", naam: "Ochtend", soort: "playlist", beeld: "https://ma.local/hoes.jpg" };
const buiten = (id) => id === "light.tuin";

describe("speakers op de kaart", () => {
  it("komen uit `speakers`, met hun naam, en alleen media_player", () => {
    assert.deepEqual(
      LAMPEN.filter((l) => l.speaker),
      [
        { entity: "media_player.keuken", naam: "Keuken", speaker: true },
        { entity: "media_player.bad", naam: "", speaker: true },
      ]
    );
  });

  it("krijgen geen schuif in een groep, want hun volume staat in het blok Muziek", () => {
    assert.equal(L.magDimmen("media_player.keuken", LAMPEN, { attributes: {} }), false);
  });

  it("de kop boven de lijst noemt wat er is", () => {
    assert.equal(L.lijstKopVan(LAMPEN), "Lampen, rolluiken en speakers");
    assert.equal(L.lijstKopVan(L.lampenUit({ speakers: ["media_player.x"] })), "Speakers");
    assert.equal(L.lijstKopVan(L.lampenUit({ lampen: ["light.a"], rolluiken: ["cover.b"] })), "Lampen en rolluiken");
  });

  it("REGRESSIEWACHT: een kaart zonder speakers houdt dezelfde lijst", () => {
    assert.deepEqual(
      L.lampenUit({ lampen: ["light.a"], rolluiken: ["cover.b"] }).map((l) => l.entity),
      ["light.a", "cover.b"]
    );
  });
});

describe("het volume en wat er speelt", () => {
  it("muziekVan leest het volume uit de helderheden, en stoppen alleen bij een favoriet", () => {
    assert.deepEqual(L.muziekVan({ lampen: ["media_player.bad"], helderheden: { "media_player.bad": 40 } }), {
      volume: 40,
      stoppen: false,
    });
    assert.deepEqual(L.muziekVan({ favoriet: true, lampen: ["media_player.bad"], helderheden: { "media_player.bad": 0 } }), {
      volume: L.VOLUME_STANDAARD,
      stoppen: true,
    });
    assert.equal(L.muziekVan({ lampen: [], helderheden: {} }).volume, L.VOLUME_STANDAARD);
  });

  it("metMuziek zet alle speakers en laat de lampen staan", () => {
    const uit = L.metMuziek({ "light.woonkamer": 60, "media_player.bad": 25 }, ["light.woonkamer", "media_player.bad", "media_player.keuken"], 35);
    assert.deepEqual(uit, { "light.woonkamer": 60, "media_player.bad": 35, "media_player.keuken": 35 });
  });

  it("mediaUit maakt van een zoekresultaat wat er in de regel komt", () => {
    const treffer = { name: "Ochtend", uri: "library://playlist/12", media_type: "playlist", image: "https://ma.local/hoes.jpg", favorite: true };
    assert.deepEqual(L.mediaUit(treffer), LIJST);
    assert.equal(L.mediaUit({ name: "zonder uri" }), null);
    assert.deepEqual(L.mediaUit({ uri: "x://1", name: "Radio", media_type: "radio", image: null }), { uri: "x://1", naam: "Radio", soort: "radio" });
  });

  it("een regel die afspeelt moet iets gekozen hebben, een die alleen stopt niet", () => {
    const basis = { lampen: ["media_player.bad"], helderheden: { "media_player.bad": 30 }, dagen: [0], aan: { soort: "tijd", tijd: "07:00" }, uit: null };
    assert.equal(L.waaromNiet(basis), "Kies wat er moet spelen.");
    assert.equal(L.waaromNiet({ ...basis, media: LIJST }), null);
    assert.equal(L.waaromNiet({ ...basis, aan: null, uit: { soort: "tijd", tijd: "23:00" } }), null);
  });

  it("een favoriet die stopt hoeft niets gekozen te hebben", () => {
    const fav = { favoriet: true, naam: "Weg", lampen: ["media_player.bad"], helderheden: { "media_player.bad": 0 } };
    assert.equal(L.waaromNiet(fav), null);
    assert.equal(L.waaromNiet({ ...fav, helderheden: { "media_player.bad": 30 } }), "Kies wat er moet spelen.");
  });
});

describe("naar de server", () => {
  it("een regel: lampen met hun helderheid, speakers met het volume, en media", () => {
    const regel = {
      lampen: ["light.woonkamer", "media_player.bad", "media_player.keuken"],
      helderheden: { "light.woonkamer": 60, "media_player.bad": 35, "media_player.keuken": 35 },
      media: LIJST,
      aan: { soort: "tijd", tijd: "07:00" },
      uit: null,
      dagen: [4, 0],
    };
    const uit = L.naarServer(regel, (id) => id.startsWith("light."));
    assert.deepEqual(uit.helderheden, { "light.woonkamer": 60, "media_player.bad": 35, "media_player.keuken": 35 });
    assert.deepEqual(uit.media, LIJST);
  });

  it("REGRESSIEWACHT: media gaat niet mee als er niets afspeelt", () => {
    const zonderSpeaker = L.naarServer({ lampen: ["light.woonkamer"], helderheden: {}, media: LIJST, aan: { soort: "tijd", tijd: "07:00" }, dagen: [0] });
    assert.equal("media" in zonderSpeaker, false);
    const alleenUit = L.naarServer({ lampen: ["media_player.bad"], helderheden: {}, media: LIJST, aan: null, uit: { soort: "tijd", tijd: "23:00" }, dagen: [0] });
    assert.equal("media" in alleenUit, false);
  });

  it("een favoriet die stopt: 0, zonder media; een die speelt: het volume, met media", () => {
    const stop = L.favorietNaarServer({ favoriet: true, naam: "Weg", lampen: ["media_player.bad"], helderheden: { "media_player.bad": 0 }, media: LIJST });
    assert.deepEqual(stop.helderheden, { "media_player.bad": 0 });
    assert.equal("media" in stop, false);
    const speel = L.favorietNaarServer({ favoriet: true, naam: "Diner", lampen: ["media_player.bad"], helderheden: { "media_player.bad": 15 }, media: LIJST });
    assert.deepEqual(speel.helderheden, { "media_player.bad": 15 });
    assert.deepEqual(speel.media, LIJST);
  });
});

describe("de vinkjes en de tekst", () => {
  it("een favoriet heeft een vinkje Muziek uit, en dat zet alle speakers op 0", () => {
    const leeg = { favoriet: true, lampen: [], helderheden: {} };
    const v = L.favorietVinkjes(leeg, LAMPEN, buiten);
    assert.ok(v.some((x) => x.sleutel === "muziekUit" && !x.aan && x.tekst === "2 speakers"));
    const aan = L.metVinkje(leeg, LAMPEN, buiten, "muziekUit", true);
    assert.deepEqual(aan.helderheden, { "media_player.keuken": 0, "media_player.bad": 0 });
    assert.ok(L.favorietVinkjes(aan, LAMPEN, buiten).find((x) => x.sleutel === "muziekUit").aan);
    assert.deepEqual(L.metVinkje(aan, LAMPEN, buiten, "muziekUit", false).lampen, []);
  });

  it("REGRESSIEWACHT: Alle lampen uit raakt de speakers niet", () => {
    const fav = L.metVinkje({ favoriet: true, lampen: [], helderheden: {} }, LAMPEN, buiten, "alleUit", true);
    assert.deepEqual(fav.lampen.sort(), ["light.tuin", "light.woonkamer"]);
  });

  it("de zin van een regel met alleen speakers zegt afspelen en stoppen, met wat er speelt, zonder volume", () => {
    const regel = {
      lampen: ["media_player.bad"],
      helderheden: { "media_player.bad": 30 },
      media: LIJST,
      aan: { soort: "tijd", tijd: "07:00" },
      uit: { soort: "tijd", tijd: "08:00" },
      dagen: [0, 1, 2, 3, 4],
    };
    assert.equal(L.regelTekst(regel), "Afspelen om 07:00 · stoppen om 08:00 · Ochtend · Werkdagen");
  });

  it("met een lamp erbij is het aan en uit, met de helderheid van de lamp", () => {
    const regel = {
      lampen: ["light.woonkamer", "media_player.bad"],
      helderheden: { "light.woonkamer": 60, "media_player.bad": 30 },
      media: LIJST,
      aan: { soort: "tijd", tijd: "07:00" },
      uit: null,
      dagen: [5, 6],
    };
    assert.equal(L.regelTekst(regel), "Aan om 07:00 · 60% · Ochtend · Weekend");
  });

  it("het voorbeeld laat de speakers met rust", () => {
    const doelen = L.voorbeeldDoelen(["light.woonkamer", "media_player.bad"], { "light.woonkamer": 50, "media_player.bad": 30 }, () => true, {
      "light.woonkamer": { state: "off" },
      "media_player.bad": { state: "idle" },
    });
    assert.deepEqual(doelen, { "light.woonkamer": 50 });
  });
});
