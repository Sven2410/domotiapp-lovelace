/**
 * Het abonnement in Coach Assist (0.128.0). De eigenaar, 15 november 2026: DomotiCare 10 vragen per dag, Plus 25,
 * Onbeperkt; "elk abbo heeft geen maandlimiet". Daarna ook nieuwe tickets per dag, tegen spam: 5, 10 of geen grens. De afspraak met de coach staat in de
 * notities van de werkmap ("Wijziging 15-11-2026"); de vorm is die van de werkplaats.
 *
 * NIEUW GEDRAG: op 0.127.0 kent de kaart `pakket` niet, en zegt hij bij `pakket_op` alleen "Versturen lukte niet".
 * Hoe het eruitziet staat gemeten in `docs/pakket-vragen-per-dag/RAPPORT.md`.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as B from "../../src/cards/bot-logica.js";
import { _reset } from "../../src/taal.js";

const NU = new Date("2026-11-15T14:00:00+01:00");
const pakket = (extra = {}) => ({
  naam: "DomotiCare", vragen_per_dag: 10, vragen_vandaag: 3, vragen_over: 7,
  tickets_per_dag: 5, tickets_vandaag: 1, tickets_over: 4, opnieuw: "2026-11-16T00:00:00+01:00", ...extra,
});
const gesprek = (n = 1) => ({ id: 0, soort: "vraag", berichten: Array.from({ length: n }, (_, i) => ({ id: i + 1, van: "klant", tekst: "x" })), gelezen: {} });

describe("het pakket in het abonnement", () => {
  it("staat in de eerste lijst, en is null bij een coach die het niet kent", () => {
    assert.deepEqual(B.verwerk(null, { contract: 1, gesprek: gesprek(), tickets: [], pakket: pakket() }).pakket, pakket());
    assert.equal(B.verwerk(null, { contract: 1, gesprek: gesprek(), tickets: [] }).pakket, null);
    assert.equal(B.verwerk(null, { contract: 1, gesprek: gesprek(), tickets: [], pakket: null }).pakket, null);
  });

  it("na een vraag staat het bijgewerkte pakket naast het gesprek", () => {
    const stand = B.verwerk(null, { contract: 1, gesprek: gesprek(), tickets: [], pakket: pakket() });
    const bij = B.verwerk(stand, { ticket: gesprek(2), pakket: pakket({ vragen_vandaag: 4, vragen_over: 6 }) });
    assert.equal(bij.gesprek.berichten.length, 2);
    assert.equal(bij.pakket.vragen_over, 6);
  });

  it("een ander bericht laat het pakket staan", () => {
    const stand = B.verwerk(null, { contract: 1, gesprek: gesprek(), tickets: [], pakket: pakket() });
    const bij = B.verwerk(stand, { ticket: { id: 3, soort: "storing", berichten: [] } });
    assert.equal(bij.pakket.vragen_over, 7);
    assert.deepEqual(bij.tickets.map((x) => x.id), [3]);
  });

  it("na set_plan komt het pakket alleen, en gesprek en tickets blijven", () => {
    const stand = B.verwerk(null, { contract: 1, gesprek: gesprek(2), tickets: [{ id: 1, berichten: [] }], pakket: null });
    const bij = B.verwerk(stand, { pakket: pakket({ naam: "DomotiCare Plus", vragen_per_dag: 25, vragen_over: 23 }) });
    assert.equal(bij.pakket.naam, "DomotiCare Plus");
    assert.equal(bij.gesprek.berichten.length, 2);
    assert.equal(bij.tickets.length, 1);
    assert.equal(B.verwerk(bij, { pakket: null }).pakket, null);
  });
});

describe("wat er vandaag over is", () => {
  const stand = (p) => ({ gesprek: gesprek(), tickets: [], pakket: p });

  it("zonder pakket niets, en bij onbeperkt geen getal", () => {
    assert.equal(B.pakketOver(stand(null), NU), null);
    const p = B.pakketOver(stand(pakket({ naam: "DomotiCare Onbeperkt", vragen_per_dag: null, vragen_over: null, tickets_per_dag: null, tickets_over: null })), NU);
    assert.deepEqual([p.naam, p.vragen, p.tickets], ["DomotiCare Onbeperkt", null, null]);
  });

  it("vóór middernacht wat de coach zegt, voor vragen en tickets", () => {
    const p = B.pakketOver(stand(pakket()), NU);
    assert.deepEqual([p.vragen, p.tickets], [7, 4]);
    assert.equal(p.opnieuw, new Date("2026-11-16T00:00:00+01:00").getTime());
    assert.deepEqual(Object.values(B.pakketOver(stand(pakket({ vragen_over: 0, tickets_over: 0 })), NU)).slice(1, 3), [0, 0]);
  });

  it("een coach die alleen vragen telt: geen grens op tickets", () => {
    const p = B.pakketOver(stand({ naam: "DomotiCare", vragen_per_dag: 10, vragen_over: 7, opnieuw: "2026-11-16T00:00:00+01:00" }), NU);
    assert.deepEqual([p.vragen, p.tickets], [7, null]);
  });

  it("na middernacht weer alles, ook zonder bericht van de coach", () => {
    const p = B.pakketOver(stand(pakket({ vragen_over: 0, tickets_over: 0 })), new Date("2026-11-16T00:00:01+01:00"));
    assert.deepEqual([p.vragen, p.tickets, p.opnieuw], [10, 5, null]);
  });
});

describe("Geen DomotiCare", () => {
  it("alleen coach_assist: false is zonder; ontbreekt het, dan zit het erin", () => {
    assert.equal(B.zonderAssist({ pakket: pakket({ naam: "Geen DomotiCare", coach_assist: false }) }), true);
    assert.equal(B.zonderAssist({ pakket: pakket({ coach_assist: true }) }), false);
    assert.equal(B.zonderAssist({ pakket: pakket() }), false);
    assert.equal(B.zonderAssist({ pakket: null }), false);
    assert.equal(B.zonderAssist(null), false);
  });

  it("de fout van de coach in een zin", () => {
    _reset();
    assert.equal(B.foutTekst({ code: "geen_coach_assist", message: "x" }), "Coach Assist zit niet in je abonnement.");
  });

  it("de kaart verbergt zich zoals Home Assistant, behalve in de bewerkmodus, en opent dan niets", () => {
    const kaart = readFileSync(new URL("../../src/cards/bot-card.js", import.meta.url), "utf8");
    assert.match(kaart, /this\.zetZichtbaar_\(!zonder \|\| this\.preview\);/);
    assert.match(kaart, /new CustomEvent\("card-visibility-changed", \{ detail: \{ value: zichtbaar \} \}\)/);
    assert.match(kaart, /:host\(\[hidden\]\) \{ display: none; \}/);
    assert.match(kaart, /this\.connectedWhileHidden = true;/);
    assert.match(kaart, /if \(!zonderAssist\(this\.stand_\)\) toonBotScherm\(this\);/);
    assert.match(kaart, /if \(zonderAssist\(this\.stand_\)\) scherm\.sluit\(\);/);
  });
});

describe("de woorden", () => {
  it("de teller, in het Nederlands en het Engels", () => {
    _reset();
    assert.equal(B.tellerTekst(7), "Nog 7 vragen vandaag");
    assert.equal(B.tellerTekst(1), "Nog 1 vraag vandaag");
    assert.equal(B.tellerTekst(null), "");
    _reset({ instelling: "en" });
    assert.equal(B.tellerTekst(7), "7 questions left today");
    assert.equal(B.tellerTekst(1), "1 question left today");
    _reset();
  });

  it("bij de tickets alleen als er 2 of minder over zijn", () => {
    _reset();
    assert.equal(B.ticketTellerTekst(4), "");
    assert.equal(B.ticketTellerTekst(2), "Nog 2 tickets vandaag");
    assert.equal(B.ticketTellerTekst(1), "Nog 1 ticket vandaag");
    assert.equal(B.ticketTellerTekst(null), "");
  });

  it("pakket_op is de zin van de coach in de taal van de kaart, en geen 'Versturen lukte niet'", () => {
    _reset();
    const zin = B.foutTekst({ code: "pakket_op", message: "You have asked your questions for today." });
    assert.equal(zin, "Je hebt je vragen voor vandaag gesteld. Morgen kun je weer vragen stellen. Is er iets kapot? Meld dan een storing.");
    assert.equal(B.foutTekst({ code: "pakket_op" }, { nieuw: true }),
      "Je hebt vandaag al het maximum aantal tickets gemaakt. Morgen kan het weer. Is het dringend? Neem dan contact op met je installateur.");
  });
});

describe("het scherm", () => {
  const BRON = readFileSync(new URL("../../src/cards/bot-scherm.js", import.meta.url), "utf8");

  it("zet het veld op 0 uit en laat de tekst staan", () => {
    assert.match(BRON, /schrijf\.querySelector\("textarea"\)\.disabled = op;/);
    assert.doesNotMatch(BRON.slice(BRON.indexOf("tekenPakket_() {"), BRON.indexOf("tekenLijst_() {")), /\.value = ""/);
  });

  it("Meld een storing opent Nieuw ticket en neemt de tekst mee", () => {
    assert.match(BRON, /this\.naar_\("nieuw"\);\n\s+this\.\$\('\.schrijf\[data-voor="nieuw"\] textarea'\)\.value = tekst;/);
  });

  it("gaat om middernacht vanzelf weer open, en een geweigerde vraag zet het dicht", () => {
    assert.match(BRON, /this\.middernacht_ = setTimeout\(\(\) => this\.teken\(\)/);
    assert.match(BRON, /if \(voor === "vragen"\) this\.vragenOp_ = true;\n\s+else this\.ticketsOp_ = true;/);
  });

  it("het etiket met het pakket: in de kop en op de tegel, en zijn stijl staat vóór het stijlblad dat hem gebruikt", () => {
    // Stond hij erna, dan was hij bij het laden nog leeg: "undefined .rond" in het stijlblad, en de sluitknop vierkant.
    assert.ok(BRON.indexOf("export const etiketCss") < BRON.indexOf("const css = /* css */"));
    assert.match(BRON, /<span class="kopregel"><b id="kop"><\/b><span class="etiket" hidden><\/span><\/span>/);
    const kaart = readFileSync(new URL("../../src/cards/bot-card.js", import.meta.url), "utf8");
    assert.match(kaart, /pakketOver\(this\.stand_\)\?\.naam/);
    assert.match(kaart, /\.kopregel \{[^}]*height: calc\(13px \* 1\.25\); overflow: hidden;/);
  });

  it("op 0 tickets: Nieuw ticket en Versturen weg, en Meld een storing ook", () => {
    assert.match(BRON, /this\.\$\("\.nieuw"\)\.parentElement\.hidden = ticketsOp;/);
    assert.match(BRON, /\.verstuur'\)\.hidden = ticketsOp;/);
    assert.match(BRON, /this\.\$\("\.meld"\)\.hidden = p\?\.tickets === 0;/);
  });
});
