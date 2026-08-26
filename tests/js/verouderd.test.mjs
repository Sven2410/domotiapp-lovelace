/**
 * De pagina die zichzelf ververst als hij verouderde code draait.
 *
 * NIEUW GEDRAG. Aanleiding: de eigenaar moest op 26 augustus 2026 met de hand
 * de frontendcache van zijn Android-telefoon legen om een kaart weer aan de
 * praat te krijgen, terwijl zijn server de nieuwe bundel al serveerde.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import {
  CONTROLE_INTERVAL,
  LADER_URL,
  hashUit,
  oordeel,
  serverHash,
  startVerversing,
} from "../../src/verouderd.js";

/** Een document dat genoeg kan om de bewaking te laten draaien. */
function nepDoc({ zichtbaar = "visible", dialoog = false } = {}) {
  const luisteraars = new Map();
  return {
    visibilityState: zichtbaar,
    addEventListener: (naam, fn) => luisteraars.set(naam, fn),
    removeEventListener: (naam) => luisteraars.delete(naam),
    querySelector: () => (dialoog ? {} : null),
    /** Doe alsof de app naar de voorgrond komt. */
    wordZichtbaar() {
      this.visibilityState = "visible";
      return luisteraars.get("visibilitychange")?.();
    },
    luisteraars,
  };
}

/** Een lader die `hash` teruggeeft, en telt hoe vaak hij bevraagd is. */
function nepLader(hash, { ok = true } = {}) {
  const haal = async (url) => {
    haal.aanroepen.push(url);
    return { ok, text: async () => `import("/x/y.js?v=${hash}");\n` };
  };
  haal.aanroepen = [];
  return haal;
}

describe("hashUit — NIEUW GEDRAG", () => {
  it("haalt de hash uit een module-URL", () => {
    assert.equal(hashUit("/domotiapp_lovelace/domotiapp-lovelace.js?v=9d59a9920158"), "9d59a9920158");
  });

  it("haalt dezelfde hash uit het antwoord van de lader", () => {
    assert.equal(hashUit('import("/domotiapp_lovelace/domotiapp-lovelace.js?v=abc123");\n'), "abc123");
  });

  it("geeft null als er geen hash in staat", () => {
    assert.equal(hashUit("/domotiapp_lovelace/domotiapp-lovelace.js"), null);
    assert.equal(hashUit(undefined), null);
    assert.equal(hashUit(""), null);
  });
});

describe("oordeel — NIEUW GEDRAG", () => {
  it("herladen als de server een andere bundel heeft", () => {
    assert.equal(oordeel("oud", "nieuw", null), "herladen");
  });

  it("actueel als ze gelijk zijn", () => {
    assert.equal(oordeel("zelfde", "zelfde", null), "actueel");
  });

  it("onbekend als één van de twee ontbreekt — dan nooit herladen", () => {
    assert.equal(oordeel(null, "nieuw", null), "onbekend");
    assert.equal(oordeel("oud", null, null), "onbekend");
  });

  it("HERLAADT NIET TWEE KEER voor dezelfde serverhash — de lusbeveiliging", () => {
    assert.equal(oordeel("oud", "nieuw", "nieuw"), "al-geprobeerd");
  });

  it("herlaadt wél weer als er dáárna een nieuwere versie komt", () => {
    assert.equal(oordeel("oud", "nieuwer", "nieuw"), "herladen");
  });
});

describe("serverHash — NIEUW GEDRAG", () => {
  it("vraagt de lader op zijn vaste URL, zonder cache", async () => {
    const haal = nepLader("abc123");
    assert.equal(await serverHash(haal), "abc123");
    assert.equal(haal.aanroepen[0], LADER_URL);
  });

  it("geeft null bij een foutantwoord in plaats van te gooien", async () => {
    assert.equal(await serverHash(nepLader("abc", { ok: false })), null);
  });

  it("geeft null als er helemaal geen netwerk is", async () => {
    const stuk = async () => {
      throw new Error("offline");
    };
    assert.equal(await serverHash(stuk), null);
  });
});

describe("startVerversing — NIEUW GEDRAG", () => {
  /** Een verse sessionStorage per test, anders lekt de lusbeveiliging door. */
  function verseOpslag() {
    const kaart = new Map();
    globalThis.sessionStorage = {
      getItem: (k) => kaart.get(k) ?? null,
      setItem: (k, v) => kaart.set(k, v),
    };
  }

  it("herlaadt zodra de pagina zichtbaar wordt en de server nieuwer is", async () => {
    verseOpslag();
    const doc = nepDoc();
    let herladen = 0;
    startVerversing({
      eigenUrl: "/x.js?v=aaa111",
      haal: nepLader("bbb222"),
      herlaad: () => (herladen += 1),
      doc,
      klok: () => 0,
    });

    await doc.wordZichtbaar();
    assert.equal(herladen, 1);
  });

  it("herlaadt NIET als deze pagina al de nieuwste bundel draait", async () => {
    verseOpslag();
    const doc = nepDoc();
    let herladen = 0;
    startVerversing({
      eigenUrl: "/x.js?v=abc123",
      haal: nepLader("abc123"),
      herlaad: () => (herladen += 1),
      doc,
      klok: () => 0,
    });

    await doc.wordZichtbaar();
    assert.equal(herladen, 0);
  });

  it("herlaadt hoogstens één keer voor dezelfde nieuwe bundel", async () => {
    verseOpslag();
    const doc = nepDoc();
    let herladen = 0;
    startVerversing({
      eigenUrl: "/x.js?v=aaa111",
      haal: nepLader("bbb222"),
      herlaad: () => (herladen += 1),
      doc,
      klok: () => 0,
    });

    await doc.wordZichtbaar();
    await doc.wordZichtbaar();
    await doc.wordZichtbaar();
    assert.equal(herladen, 1, "een tweede herlading is een lus");
  });

  it("raakt niets aan als we onze eigen hash niet kennen", async () => {
    verseOpslag();
    const doc = nepDoc();
    const haal = nepLader("bbb222");
    startVerversing({
      eigenUrl: "/x.js",
      haal,
      herlaad: () => assert.fail("mocht niet herladen"),
      doc,
      klok: () => 0,
    });

    await doc.wordZichtbaar();
    assert.equal(haal.aanroepen.length, 0, "en vraagt de lader niet eens");
    assert.equal(doc.luisteraars.size, 0, "en luistert nergens naar");
  });

  it("herlaadt niet terwijl er een dialoog openstaat", async () => {
    verseOpslag();
    const doc = nepDoc({ dialoog: true });
    let herladen = 0;
    startVerversing({
      eigenUrl: "/x.js?v=aaa111",
      haal: nepLader("bbb222"),
      herlaad: () => (herladen += 1),
      doc,
      klok: () => 0,
    });

    await doc.wordZichtbaar();
    assert.equal(herladen, 0, "iemand was bezig");
  });

  it("controleert ook zonder zichtbaarheidswissel — voor een wandtablet", () => {
    verseOpslag();
    const doc = nepDoc();
    let periodiek = null;
    startVerversing({
      eigenUrl: "/x.js?v=aaa111",
      haal: nepLader("bbb222"),
      herlaad: () => {},
      doc,
      klok: (fn, ms) => {
        periodiek = { fn, ms };
        return 1;
      },
    });

    assert.ok(periodiek, "er hoort een periodieke controle te staan");
    assert.equal(periodiek.ms, CONTROLE_INTERVAL);
  });

  it("stopt met luisteren als de bundel wordt opgeruimd", () => {
    verseOpslag();
    const doc = nepDoc();
    const stop = startVerversing({
      eigenUrl: "/x.js?v=aaa111",
      haal: nepLader("bbb222"),
      herlaad: () => {},
      doc,
      klok: () => 0,
    });

    assert.equal(doc.luisteraars.size, 1);
    stop();
    assert.equal(doc.luisteraars.size, 0);
  });
});
