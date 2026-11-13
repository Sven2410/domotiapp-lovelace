/**
 * De botkaart tegen wat coach v0.220.0 echt stuurt (contract 1). NIEUW GEDRAG: op 0.123.0 bestaat `bot-logica.js` niet.
 *
 * `vaste-invoer/coach-0.220.0-tickets.json` is gemaakt met `tickets.py` van de uitgebrachte coach zelf (`overzicht` voor
 * `list` en het eerste event van `subscribe`, `voor_buiten` voor een event), met dezelfde vorm als de dump die de
 * werkplaats stuurde. Twee bewoners: Bram las het antwoord in het gesprek niet, Anna wel; een storing met een foto
 * bij de beheerder, een aanvraag die klaar is, en een storing van alleen een foto (lege tekst, onderwerp "Foto").
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import * as B from "../../src/cards/bot-logica.js";
import { _reset } from "../../src/taal.js";

const DUMP = JSON.parse(readFileSync(new URL("./vaste-invoer/coach-0.220.0-tickets.json", import.meta.url), "utf8"));
const BRAM = "9f1c2d3e4b5a69788796a5b4c3d2e1f0";
const ANNA = "1a2b3c4d5e6f708192a3b4c5d6e7f809";

describe("coach v0.220.0: list en subscribe", () => {
  it("is contract 1, met het gesprek apart en de tickets nieuwste eerst", () => {
    assert.equal(B.kentContract(DUMP.list), true);
    const stand = B.verwerk(null, DUMP.list);
    assert.equal(stand.gesprek.id, B.GESPREK);
    assert.equal(stand.gesprek.berichten.length, 3);
    assert.deepEqual(stand.tickets.map((x) => x.id), [3, 1, 2]);
  });

  it("kent elke soort en elke stand die erin staat", () => {
    _reset();
    for (const x of DUMP.list.tickets) {
      assert.ok(B.SOORTEN.some((s) => s.id === x.soort), x.soort);
      assert.notEqual(B.soortVan(x.soort).naam, "Ticket");
    }
    assert.deepEqual(DUMP.list.tickets.map((x) => B.standNaam(x.stand)), ["Ontvangen", "Ligt bij DomotiTech", "Afgerond"]);
    // Het gesprek heeft geen stand.
    assert.equal("stand" in DUMP.list.gesprek, false);
  });

  it("telt per bewoner wat hij nog niet las", () => {
    _reset();
    const stand = B.verwerk(null, DUMP.list);
    // Bram: het antwoord in het gesprek, op zijn storing, en op de aanvraag van Anna die hij nooit opende.
    assert.equal(B.allesOngelezen(stand, BRAM), 3);
    // Anna: alleen het antwoord op de storing van Bram.
    assert.equal(B.allesOngelezen(stand, ANNA), 1);
    assert.equal(B.tegelRegel({ coach: true, stand, userId: ANNA }), "1 nieuw antwoord");
    // Een eigen vraag die nog open staat is niets nieuws voor Anna.
    assert.equal(B.ongelezen(stand.gesprek, ANNA), 0);
  });

  it("noemt de lopende tickets als alles gelezen is", () => {
    _reset();
    const stand = B.verwerk(null, DUMP.list);
    const alles = (x) => ({ ...x, gelezen: { [ANNA]: Math.max(...x.berichten.map((b) => b.id)) } });
    const gelezen = { gesprek: alles(stand.gesprek), tickets: stand.tickets.map(alles) };
    assert.equal(B.tegelRegel({ coach: true, stand: gelezen, userId: ANNA }), "2 tickets lopen");
  });
});

describe("coach v0.220.0: foto's", () => {
  it("staan als {id, type, grootte} bij het bericht, en een bericht zonder foto heeft geen sleutel", () => {
    const [alleenFoto, storing] = DUMP.list.tickets;
    const foto = storing.berichten[0].bijlagen[0];
    assert.deepEqual(Object.keys(foto).sort(), ["grootte", "id", "type"]);
    assert.equal(B.bijlagePad(foto.id), `${B.BIJLAGE_PAD}/${foto.id}`);
    assert.equal("bijlagen" in storing.berichten[1], false);
    // Alleen een foto: lege tekst, en de coach geeft het onderwerp.
    assert.equal(alleenFoto.berichten[0].tekst, "");
    assert.equal(alleenFoto.onderwerp, "Foto");
    assert.ok(B.bijlagePad(alleenFoto.berichten[0].bijlagen[0].id));
  });
});

describe("coach v0.220.0: een event na een antwoord", () => {
  it("vervangt het ticket en laat het gesprek staan", () => {
    const stand = B.verwerk(null, DUMP.list);
    const bij = B.verwerk(stand, DUMP.event);
    assert.equal(bij.gesprek, stand.gesprek);
    assert.deepEqual(bij.tickets.find((x) => x.id === 1), DUMP.event.ticket);
    assert.equal(bij.tickets.length, 3);
  });
});
