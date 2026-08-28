/**
 * De tijdlijn onder het camerabeeld: wat er gebeurd is, en wanneer.
 *
 * Gevraagd op 28 augustus 2026: *"ik wil bij de camera card filters gaan
 * krijgen dat ik kan filteren op datum maar ook op type. Ik wil 5 icons hebben.
 * Mens dier voertuig aanbellen en ontgrendeling waarop ik kan filteren"* en,
 * even later: *"ik wil gewoon op de meldingen (...) een time line met filters
 * zoals tijd welke camera etc."*
 *
 * ## Waar de gebeurtenissen vandaan komen
 *
 * Uit de melders die al op de kaart staan -- zijn eigen woorden: *"je haalt de
 * gebeurtenissen toch uit wat je zelf hebt gemaakt."* Elke keer dat
 * `binary_sensor.oprit_person` aanging is een gebeurtenis met een tijd en een
 * soort. Dat werkt bij ELKE integratie en heeft geen NVR, geen Frigate en geen
 * extra opslag nodig.
 *
 * De prijs staat er eerlijk bij: het gaat zo ver terug als de recorder van Home
 * Assistant bewaart, en dat is standaard tien dagen.
 *
 * ## Waarom er per melder gedund wordt
 *
 * Een Reolink zet zijn `_person` binnen een halve minuut een paar keer aan en
 * uit terwijl er één iemand langsloopt. Ongefilterd wordt dat vijf regels voor
 * één gebeurtenis. Alles van dezelfde melder binnen een minuut telt daarom als
 * één -- precies de minuut die hij noemde toen hij het over zijn eigen melding
 * had.
 *
 * ## Waarom dit bestand geen DOM kent
 *
 * Zodat het in een gewone Node-test te toetsen is. Wat er getekend wordt staat
 * in `camera-card.js`; wat er WAAR is staat hier.
 */

/**
 * De vijf soorten waar hij op wil kunnen filteren, in de volgorde waarin ze op
 * de kaart staan.
 *
 * `woorden` zijn HELE woorden uit het entity_id of de naam, geen stukjes. Dat
 * onderscheid is niet decoratief: `binary_sensor.deurbel_person` bevat "bel",
 * en op stukjes zoeken maakt van de persoonsmelder van een deurbel een
 * aanbelmelding.
 */
export const SOORTEN = [
  {
    sleutel: "mens",
    label: "Mens",
    icoon: "person",
    woorden: ["person", "persoon", "personen", "mens", "people", "human", "visitor_person"],
  },
  {
    sleutel: "dier",
    label: "Dier",
    icoon: "dier",
    woorden: ["pet", "pets", "dier", "dieren", "huisdier", "animal", "dog", "hond", "cat", "kat"],
  },
  {
    sleutel: "voertuig",
    label: "Voertuig",
    icoon: "car",
    woorden: ["vehicle", "voertuig", "car", "auto", "truck", "vrachtwagen", "motorcycle"],
  },
  {
    sleutel: "aanbellen",
    label: "Aanbellen",
    icoon: "bell",
    woorden: ["doorbell", "deurbel", "aanbellen", "aangebeld", "visitor", "bezoeker", "bel", "ring", "chime"],
  },
  {
    sleutel: "ontgrendeling",
    label: "Ontgrendeling",
    icoon: "lockOpen",
    woorden: ["unlock", "unlocked", "ontgrendeld", "ontgrendeling", "slot", "lock", "opener", "deuropener", "buzzer"],
  },
];

/**
 * De zesde, en waarom hij er is.
 *
 * Hij vroeg om vijf iconen en die krijgt hij. Maar een gewone
 * `binary_sensor.oprit_motion` is geen van die vijf, en die hangt bij hem wél op
 * de kaart. Zo'n melder onder één van de vijf schuiven zou het filter laten
 * liegen; hem weglaten zou gebeurtenissen opleveren die je nergens kunt
 * aanvinken. Dus krijgt hij een eigen knop -- en die verschijnt ALLEEN als er
 * werkelijk zo'n melder is.
 */
export const ALGEMEEN = { sleutel: "beweging", label: "Beweging", icoon: "cctv", woorden: [] };

/** Alle soorten die een melder kan dragen, inclusief de algemene. */
export const ALLE_SOORTEN = [...SOORTEN, ALGEMEEN];

/** De soort bij een sleutel, of de algemene als hij niet bestaat. */
export function soortVan(sleutel) {
  return ALLE_SOORTEN.find((s) => s.sleutel === sleutel) ?? ALGEMEEN;
}

/** De losse woorden in een entity_id of een naam, kleingeschreven. */
function woordenIn(tekst) {
  return String(tekst ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Raad de soort van een melder uit zijn entity_id en zijn naam.
 *
 * De volgorde is de rangorde: een deurbel die een PERSOON ziet is een
 * mensmelding, geen aanbelmelding. Wat een melder werkelijk detecteert is
 * specifieker dan waar hij op zit.
 *
 * Het domein telt mee waar dat een feit is: een `lock` die van slot gaat is een
 * ontgrendeling, hoe hij ook heet.
 */
export function raadSoort(entityId, naam) {
  const domein = String(entityId ?? "").split(".")[0];
  if (domein === "lock") return "ontgrendeling";

  const woorden = new Set([...woordenIn(entityId), ...woordenIn(naam)]);
  for (const soort of SOORTEN) {
    if (soort.woorden.some((w) => woorden.has(w))) return soort.sleutel;
  }
  return ALGEMEEN.sleutel;
}

/**
 * Staat deze toestand voor "er gebeurt iets"?
 *
 * Per domein anders, en dat is geen detail: een slot dat op `unlocked` staat is
 * de gebeurtenis, een bewegingsmelder op `on`.
 */
export function isActief(entityId, staat) {
  const domein = String(entityId ?? "").split(".")[0];
  const s = String(staat ?? "").toLowerCase();
  if (domein === "lock") return s === "unlocked" || s === "open" || s === "opening";
  if (domein === "cover") return s === "open" || s === "opening";
  // Een `event`-entiteit draagt het tijdstip van de laatste gebeurtenis als
  // toestand. Elke NIEUWE waarde is dus een gebeurtenis; alleen "unknown" niet.
  if (domein === "event") return s !== "unknown" && s !== "unavailable" && s !== "";
  return s === "on";
}

/** Hoort deze toestand bij "er is niets aan de hand"? */
function isRust(entityId, staat) {
  const s = String(staat ?? "").toLowerCase();
  if (s === "unavailable" || s === "unknown") return false;
  return !isActief(entityId, staat);
}

/**
 * Maak gebeurtenissen van de geschiedenis die Home Assistant teruggaf.
 *
 * `ruw` is wat `history/history_during_period` oplevert: per entiteit een lijst
 * met `{s: toestand, lu: seconden}`. De eerste regel is de stand BIJ HET BEGIN
 * van het venster en hoort dus geen gebeurtenis te zijn -- die beweging was er
 * al voordat je ging kijken.
 *
 * @param {object} ruw antwoord van de websocket
 * @param {Array<{entity: string, naam: string, soort: string, camera: string|null}>} melders
 * @param {{vanaf: number}} venster begin van de dag in milliseconden
 * @returns {Array<{tijd: number, entity: string, naam: string, soort: string, camera: string|null}>}
 */
export function gebeurtenissenUit(ruw, melders, { vanaf = 0 } = {}) {
  const uit = [];
  for (const melder of melders) {
    const regels = ruw?.[melder.entity];
    if (!Array.isArray(regels)) continue;

    let vorigeActief = null;
    for (const regel of regels) {
      const staat = regel?.s ?? regel?.state;
      const seconden = regel?.lu ?? regel?.last_updated;
      if (staat === undefined || seconden === undefined) continue;
      const tijd = Number(seconden) * 1000;
      const actief = isActief(melder.entity, staat);

      // Een `event`-entiteit heeft geen rusttoestand: elke nieuwe waarde is een
      // gebeurtenis op zich.
      const eventDomein = String(melder.entity).split(".")[0] === "event";
      const nieuw = eventDomein ? actief : actief && vorigeActief === false;

      if (nieuw && tijd >= vanaf) {
        uit.push({
          tijd,
          entity: melder.entity,
          naam: melder.naam,
          soort: melder.soort,
          camera: melder.camera ?? null,
        });
      }
      if (actief) vorigeActief = true;
      else if (isRust(melder.entity, staat)) vorigeActief = false;
    }
  }
  return uit.sort((a, b) => b.tijd - a.tijd);
}

/**
 * Plak wat van dezelfde melder vlak achter elkaar kwam aan elkaar.
 *
 * Zie de kop: één iemand die langsloopt zet een Reolink een paar keer aan en
 * uit. De eerste tijd wint -- dat is het moment waarop het begon, en dat is wat
 * je zoekt als je terugkijkt.
 *
 * @param {Array} lijst aflopend op tijd gesorteerd
 * @param {number} ms hoe lang na elkaar nog "hetzelfde" is
 */
export function dun(lijst, ms = 60000) {
  const uit = [];
  for (const g of lijst) {
    const zelfde = uit.find(
      (eerder) => eerder.entity === g.entity && Math.abs(eerder.tijd - g.tijd) < ms
    );
    if (zelfde) {
      zelfde.tijd = Math.min(zelfde.tijd, g.tijd);
      zelfde.aantal = (zelfde.aantal ?? 1) + 1;
      continue;
    }
    uit.push({ ...g, aantal: 1 });
  }
  return uit;
}

/**
 * Wat er na de filters overblijft.
 *
 * Een LEGE soortenkeuze betekent alles, niet niets. Anders zou de kaart leeg
 * openen en zou je vijf knoppen moeten aantikken voordat er iets staat.
 */
export function filterGebeurtenissen(lijst, { soorten, camera } = {}) {
  const kies = soorten instanceof Set ? soorten : new Set(soorten ?? []);
  return lijst.filter((g) => {
    if (kies.size && !kies.has(g.soort)) return false;
    // Een melder zonder eigen camera hoort bij allemaal en blijft dus staan.
    if (camera && g.camera && g.camera !== camera) return false;
    return true;
  });
}

/** Tel per soort, zodat er een getal op de filterknop kan. */
export function telPerSoort(lijst) {
  const uit = {};
  for (const g of lijst) uit[g.soort] = (uit[g.soort] ?? 0) + 1;
  return uit;
}

/** Begin en eind van de dag waar dit moment in valt, in de tijdzone van de kijker. */
export function dagOm(moment) {
  const d = new Date(moment);
  const vanaf = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const tot = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
  return { vanaf, tot };
}

/** Dezelfde dag, een aantal dagen verder of terug. */
export function verschuifDag(moment, dagen) {
  const d = new Date(moment);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + dagen).getTime();
}

const DAGEN = ["zo", "ma", "di", "wo", "do", "vr", "za"];
const MAANDEN = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/**
 * Hoe de gekozen dag heet.
 *
 * "Vandaag" en "Gisteren" in woorden, want dat is hoe je erover praat. Verder
 * terug krijgt de dag en de datum -- "wo 26 aug" -- omdat "5 dagen geleden"
 * rekenwerk is dat je zelf moet doen.
 */
export function dagLabel(dag, nu = Date.now()) {
  const vandaag = dagOm(nu).vanaf;
  const gekozen = dagOm(dag).vanaf;
  const verschil = Math.round((vandaag - gekozen) / 86400000);
  if (verschil === 0) return "Vandaag";
  if (verschil === 1) return "Gisteren";
  const d = new Date(gekozen);
  return `${DAGEN[d.getDay()]} ${d.getDate()} ${MAANDEN[d.getMonth()]}`;
}

/** De klok bij een gebeurtenis: 14:32. */
export function tijdLabel(moment) {
  const d = new Date(moment);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Waar op de balk dit moment staat, van 0 (begin van de dag) tot 1. */
export function positie(moment, vanaf, tot) {
  if (!(tot > vanaf)) return 0;
  return Math.min(1, Math.max(0, (moment - vanaf) / (tot - vanaf)));
}

/** De uren waar een streepje bij hoort, met hun plek op de balk. */
export function uurMerken(uren = [0, 6, 12, 18]) {
  return uren.map((u) => ({ uur: u, plek: u / 24 }));
}

/** Voor `<input type="date">`: yyyy-mm-dd in de eigen tijdzone. */
export function alsDatumveld(moment) {
  const d = new Date(moment);
  return (
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-` +
    `${String(d.getDate()).padStart(2, "0")}`
  );
}

/** En terug. Geeft null als er onzin in staat. */
export function uitDatumveld(tekst) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(tekst ?? ""));
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
}
