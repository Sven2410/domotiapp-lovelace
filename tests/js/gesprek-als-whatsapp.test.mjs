/**
 * Het gesprek van Coach Assist zoals WhatsApp (0.127.0). De eigenaar, 15 november 2026: "Blokken rechts van je eigen
 * tekst, blokken links van de antwoorden. En duidelijk aangeven of het de gebruiker is met de naam of de coach",
 * "standaard naar het laatste bericht scrollen", en "Evt de historische dagen ingevouwen? Tot een week max", en in de werkplaats: "Bij datum een dropdown niet zo veel datums laten zien ivm ruimtegebrek".
 *
 * NIEUW GEDRAG (op één REGRESSIEWACHT na): op 0.126.0 bestaan `isEigen`, `dagKop` en `inDagen` niet, en staat elk klantbericht rechts, ook dat van
 * een andere bewoner. Hoe het eruitziet en dat het onderaan opent, staat gemeten in `docs/gesprek-als-whatsapp/RAPPORT.md`.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as B from "../../src/cards/bot-logica.js";
import { _reset } from "../../src/taal.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.220.0-tickets.json", import.meta.url), "utf8"));
const BRAM = "9f1c2d3e4b5a69788796a5b4c3d2e1f0";
const ANNA = "1a2b3c4d5e6f708192a3b4c5d6e7f809";

// Zondag 15 november 2026, 12:00, in de tijdzone van de proef.
const NU = new Date(2026, 10, 15, 12, 0);
const op = (dagenTerug, uur = 10) => new Date(2026, 10, 15 - dagenTerug, uur, 0).toISOString();
const sleutel = (dagenTerug) => new Date(2026, 10, 15 - dagenTerug).getTime();

let volg = 0;
const klant = (at, user_id = BRAM) => ({ id: ++volg, van: "klant", naam: "Bram", tekst: "vraag", at, user_id });
const antwoord = (at) => ({ id: ++volg, van: "domotitech", naam: "DomotiTech", tekst: "antwoord", at });

describe("welke kant", () => {
  it("rechts staat alleen wat de gebruiker die kijkt zelf schreef (de echte dump van coach v0.220.0)", () => {
    const [bram, coach, anna] = DUMP.list.gesprek.berichten;
    assert.deepEqual([bram, coach, anna].map((b) => B.isEigen(b, BRAM)), [true, false, false]);
    assert.deepEqual([bram, coach, anna].map((b) => B.isEigen(b, ANNA)), [false, false, true]);
  });

  it("een klantbericht zonder user_id blijft rechts, zoals tot nu", () => {
    assert.equal(B.isEigen({ van: "klant", naam: "Bram" }, BRAM), true);
    assert.equal(B.isEigen({ van: "domotitech" }, BRAM), false);
  });

  it("REGRESSIEWACHT: de naam boven het blok: de bewoner, of Coach Assist", () => {
    assert.deepEqual(DUMP.list.gesprek.berichten.map(B.afzender), ["Bram", "Coach Assist", "Anna"]);
  });
});

describe("de dagscheiding", () => {
  it("Vandaag, Gisteren, de weekdag binnen een week, en anders de datum", () => {
    _reset();
    assert.equal(B.dagKop(sleutel(0), NU), "Vandaag");
    assert.equal(B.dagKop(sleutel(1), NU), "Gisteren");
    assert.equal(B.dagKop(sleutel(2), NU), "Vrijdag 13 november");
    assert.equal(B.dagKop(sleutel(9), NU), "6 november");
    assert.equal(B.dagKop(new Date(2025, 11, 31).getTime(), NU), "31 december 2025");
  });

  it("in het Engels", () => {
    _reset({ instelling: "en" });
    assert.equal(B.dagKop(sleutel(0), NU), "Today");
    assert.equal(B.dagKop(sleutel(1), NU), "Yesterday");
    assert.match(B.dagKop(sleutel(2), NU), /^Friday,? (13 November|November 13)$/);
    _reset();
  });

  it("de tijd in een blok is alleen de klok", () => {
    _reset();
    assert.equal(B.klokVan(new Date(2026, 10, 13, 9, 4).toISOString()), "09:04");
    assert.equal(B.klokVan("geen tijd"), "");
  });
});

describe("de eerdere dagen in één keuzelijst", () => {
  const gesprek = () => {
    volg = 0;
    return {
      id: 0,
      berichten: [
        klant(op(10)), antwoord(op(10, 11)), // ouder dan een week voor het laatste
        klant(op(9)), // ook
        klant(op(3)), antwoord(op(3, 11)),
        klant(op(1)), antwoord(op(1, 11)),
        klant(op(0)), antwoord(op(0, 11)),
      ],
      gelezen: { [BRAM]: 9 },
    };
  };

  it("in beeld alleen de laatste dag, de rest nieuwste eerst in de lijst, en ouder dan een week samen", () => {
    _reset();
    const { dagen, keuzes, keuze } = B.inDagen(gesprek(), { userId: BRAM, nu: NU });
    assert.deepEqual(dagen.map((d) => d.kop), ["Vandaag"]);
    assert.deepEqual(keuzes, [
      { waarde: String(sleutel(1)), tekst: "Gisteren · 2 berichten" },
      { waarde: String(sleutel(3)), tekst: "Donderdag 12 november · 2 berichten" },
      { waarde: B.OUDER, tekst: "Oudere berichten · 3 berichten" },
    ]);
    assert.equal(keuze, "");
  });

  it("een gekozen dag staat op zijn plek in het gesprek, en blijft in de lijst", () => {
    const { dagen, keuzes, keuze } = B.inDagen(gesprek(), { userId: BRAM, nu: NU, keuze: sleutel(3) });
    assert.deepEqual(dagen.map((d) => d.kop), ["Donderdag 12 november", "Vandaag"]);
    assert.equal(keuzes.length, 3);
    assert.equal(keuze, String(sleutel(3)));
  });

  it("Oudere berichten zet alle oude dagen tegelijk erbij", () => {
    const { dagen } = B.inDagen(gesprek(), { userId: BRAM, nu: NU, keuze: B.OUDER });
    assert.deepEqual(dagen.map((d) => d.kop), ["5 november", "6 november", "Vandaag"]);
  });

  it("een dag met een antwoord dat je nog niet las staat in beeld, en niet in de lijst", () => {
    const g = gesprek();
    g.gelezen[BRAM] = 4; // het antwoord van drie dagen terug (id 5) nog niet gezien
    const { dagen, keuzes } = B.inDagen(g, { userId: BRAM, nu: NU });
    assert.deepEqual(dagen.map((d) => d.kop), ["Donderdag 12 november", "Gisteren", "Vandaag"]);
    assert.deepEqual(keuzes.map((k) => k.waarde), [B.OUDER]);
  });

  it("wat het scherm vasthoudt blijft in beeld, ook na read", () => {
    const { dagen } = B.inDagen(gesprek(), { userId: BRAM, nu: NU, vast: new Set([sleutel(1)]) });
    assert.deepEqual(dagen.map((d) => d.kop), ["Gisteren", "Vandaag"]);
  });

  it("de laatste dag staat in beeld, ook als dat niet vandaag is", () => {
    const g = gesprek();
    g.berichten = g.berichten.slice(0, 5);
    const { dagen, keuzes } = B.inDagen(g, { userId: BRAM, nu: NU });
    assert.deepEqual(dagen.map((d) => d.kop), ["Donderdag 12 november"]);
    // Een week terug gerekend vanaf dat laatste bericht: tien en negen dagen geleden vallen er net binnen.
    assert.deepEqual(keuzes.map((k) => k.tekst), ["6 november · 1 bericht", "5 november · 2 berichten"]);
  });

  it("alleen vandaag: geen lijst", () => {
    volg = 0;
    assert.deepEqual(B.inDagen({ id: 0, berichten: [klant(op(0)), antwoord(op(0, 11))], gelezen: {} }, { userId: BRAM, nu: NU }).keuzes, []);
  });

  it("een keuze die er niet meer is telt niet", () => {
    const { dagen, keuze } = B.inDagen(gesprek(), { userId: BRAM, nu: NU, keuze: sleutel(2) });
    assert.equal(keuze, "");
    assert.deepEqual(dagen.map((d) => d.kop), ["Vandaag"]);
  });

  it("in een ticket staat alles in beeld, zonder lijst", () => {
    const { dagen, keuzes } = B.inDagen(gesprek(), { userId: BRAM, nu: NU, invouwen: false });
    assert.equal(dagen.length, 5);
    assert.deepEqual(keuzes, []);
  });

  it("een bericht zonder tijd hoort bij de dag ervoor", () => {
    volg = 0;
    const g = { id: 0, berichten: [klant(op(1)), { ...antwoord(null), at: null }, klant(op(0))], gelezen: {} };
    const { dagen } = B.inDagen(g, { userId: BRAM, nu: NU, invouwen: false });
    assert.deepEqual(dagen.map((d) => d.berichten.map((b) => b.id)), [[1, 2], [3]]);
  });

  it("in het Engels zoals het paneel van de coach", () => {
    _reset({ instelling: "en" });
    const { keuzes } = B.inDagen(gesprek(), { userId: BRAM, nu: NU });
    assert.deepEqual(keuzes.map((k) => k.tekst), ["Yesterday · 2 messages", keuzes[1].tekst, "Older messages · 3 messages"]);
    _reset();
  });
});

describe("het scherm", () => {
  const BRON = readFileSync(new URL("../../src/cards/bot-scherm.js", import.meta.url), "utf8");

  it("zet een bericht rechts met isEigen, en de naam en de tijd erbij", () => {
    assert.match(BRON, /el\.dataset\.zij = isEigen\(b, uid\) \? "eigen" : "ander";/);
    assert.match(BRON, /\.textContent = naam;/);
    assert.match(BRON, /klok\.textContent = klokVan\(b\.at\);/);
    assert.match(BRON, /\.bericht \{ max-width: 80%;/);
  });

  it("gaat naar onderen bij openen en na je eigen bericht, en bij een antwoord alleen als je al onderaan stond", () => {
    // Sinds 0.138.0 ook bij de puntjes van Coach Assist, en dan ook alleen als je al onderaan stond.
    assert.match(BRON, /const omlaag = vers \|\| \(nieuw && \(isEigen\(laatste, uid\) \|\| onderaan\)\) \|\| \(puntjesErbij && onderaan\);/);
    assert.match(BRON, /vak\.scrollTop = omlaag \? vak\.scrollHeight : plek;/);
  });

  it("de lijst heeft 16px tekst, anders zoomt Safari in", () => {
    assert.match(BRON, /\.keuze \{[^}]*font-size: 16px;/);
    assert.match(BRON, /<select class="keuze dagen" hidden><\/select>/);
  });

  it("vouwt in het gesprek, niet in een ticket", () => {
    assert.match(BRON, /this\.tekenBerichten_\(vak, gesprek, false, true\);/);
    assert.match(BRON, /this\.tekenBerichten_\(this\.\$\("\.ticket-stand \.berichten"\), ticket, ontvangen, false\);/);
  });
});
