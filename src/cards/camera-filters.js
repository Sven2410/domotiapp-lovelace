/**
 * De filters boven de timeline van de camerakaart.
 *
 * Gevraagd op 28 augustus 2026: *"ik wil bij de camera card filters gaan
 * krijgen dat ik kan filteren op datum maar ook op type. Ik wil 5 icons hebben.
 * Mens dier voertuig aanbellen en ontgrendeling waarop ik kan filteren"* en,
 * even later, over de strook die er sinds 0.29.0 al staat: *"ik wil gewoon op
 * de meldingen en die foto's die er nu onder staan een time line met filters
 * zoals tijd, welke camera etc."*
 *
 * ## Waar de beelden vandaan komen -- en waarom hier niets opnieuw geteld wordt
 *
 * De timeline is er al: de bewakingsmotor in `custom_components/.../bewaking/`
 * maakt bij een detectie een snapshot, bewaart hem een week, en de kaart haalt
 * die lijst op met `bewaking/timeline`. Elk beeld weet van welke MELDER het
 * kwam, van welke camera en hoe laat.
 *
 * Dit bestand voegt daar niets aan toe behalve een zeef. Met opzet:
 *
 * - **Niet opnieuw dunnen.** De motor heeft een rustperiode per melder
 *   (standaard 60 seconden) en dat is precies waar de eigenaar op doelde met
 *   *"dat per 1 minuut, snap je, want je stuurt mij ook een melding."* Wat er in
 *   de timeline staat is dus al één beeld per gebeurtenis.
 * - **Niet de geschiedenis van Home Assistant lezen.** Die kent geen foto's, en
 *   de foto is hier het punt.
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
    woorden: ["person", "persoon", "personen", "mens", "people", "human"],
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
 * De zesde soort: gewone beweging.
 *
 * Een `binary_sensor.oprit_motion` is geen van de vijf die hij noemde, en die
 * hangt bij hem wél op de kaart. Daarom bestaat deze soort -- maar je moet hem
 * ZELF kiezen in de editor.
 *
 * **Hij is met opzet geen terugval meer.** Tot 0.30.0 kreeg elke melder die op
 * geen enkel woord matchte deze soort erbij geraden, en dan verscheen er een
 * filterknop voor iets dat niemand had ingesteld. Gemeld op 28 augustus 2026:
 * *"Je hebt Voorkant erbij gezet als filter maar die heb ik helemaal niet
 * gedefinieerd als beweging."* Terecht: raden mag om je werk uit handen te
 * nemen, niet om een knop te verzinnen.
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
 *
 * **Matcht er niets, dan is het antwoord `null` en niet "beweging".** Zie
 * `ALGEMEEN` voor waarom. Een melder zonder soort is geen fout: hij hoort
 * gewoon bij geen enkele knop tot je er zelf een kiest.
 */
export function raadSoort(entityId, naam) {
  const domein = String(entityId ?? "").split(".")[0];
  if (domein === "lock") return "ontgrendeling";

  const woorden = new Set([...woordenIn(entityId), ...woordenIn(naam)]);
  for (const soort of SOORTEN) {
    if (soort.woorden.some((w) => woorden.has(w))) return soort.sleutel;
  }
  return null;
}

/**
 * Onder welke soort valt dit beeld? `null` als er geen soort bekend is.
 *
 * Wat er in de editor bij die melder is gekozen wint; anders wordt het geraden.
 * Het beeld draagt zijn melder mee (`beeld.melder`), dus dit werkt ook voor een
 * beeld van een melder die inmiddels van de kaart af is.
 */
export function soortVanBeeld(beeld, config = {}) {
  const melder = beeld?.melder;
  const gekozen = melder ? config[`meldersoort:${melder}`] : null;
  if (gekozen && ALLE_SOORTEN.some((s) => s.sleutel === gekozen)) return gekozen;
  return raadSoort(melder, beeld?.naam);
}

/** Het moment van een beeld in milliseconden, of null als de tijd onleesbaar is. */
export function tijdVanBeeld(beeld) {
  const ms = Date.parse(beeld?.tijd ?? "");
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Wat er na de filters overblijft.
 *
 * Een LEGE soortenkeuze betekent alles, niet niets. Anders zou de strook leeg
 * openen en zou je vijf knoppen moeten aantikken voordat er iets staat.
 *
 * `dag` is het begin van een dag; is hij niet opgegeven, dan tellen alle dagen
 * mee. Een beeld zonder leesbare tijd valt buiten een dagfilter, maar blijft
 * staan als er geen dag gekozen is -- weggooien wat je niet kunt plaatsen zou
 * betekenen dat een beeld stil verdwijnt.
 */
export function filterBeelden(beelden, { soorten, camera, dag, config } = {}) {
  const kies = soorten instanceof Set ? soorten : new Set(soorten ?? []);
  const grens = dag === undefined || dag === null ? null : dagOm(dag);
  return (Array.isArray(beelden) ? beelden : []).filter((beeld) => {
    if (kies.size) {
      // Een beeld zonder soort hoort bij geen enkele knop, en valt dus buiten
      // elk soortfilter. Zonder filter staat hij er gewoon bij.
      const soort = soortVanBeeld(beeld, config);
      if (!soort || !kies.has(soort)) return false;
    }
    if (camera && beeld.camera !== camera) return false;
    if (grens) {
      const ms = tijdVanBeeld(beeld);
      if (ms === null || ms < grens.vanaf || ms >= grens.tot) return false;
    }
    return true;
  });
}

/** Tel per soort, zodat er een getal op de filterknop kan. */
export function telPerSoort(beelden, config = {}) {
  const uit = {};
  for (const beeld of Array.isArray(beelden) ? beelden : []) {
    const s = soortVanBeeld(beeld, config);
    if (s) uit[s] = (uit[s] ?? 0) + 1;
  }
  return uit;
}

/**
 * Welke filterknoppen horen er op deze kaart te staan?
 *
 * Gevraagd op 28 augustus 2026: *"Ik wil alleen dat je de filters laat zien die
 * ook gedefinieerd zijn in de GUI."* Dus geen vaste rij van vijf meer waarvan er
 * drie gedempt staan, maar precies de soorten die aan zijn melders hangen -- in
 * de volgorde van `ALLE_SOORTEN`, zodat de knoppen niet van plek wisselen als er
 * eentje bijkomt.
 *
 * @param {Array<{soort: string|null}>} melders de melders van de kaart
 * @returns {Array<object>} de soorten, in vaste volgorde
 */
export function soortenVoorFilter(melders) {
  const aanwezig = new Set(
    (Array.isArray(melders) ? melders : []).map((m) => m?.soort).filter(Boolean)
  );
  return ALLE_SOORTEN.filter((s) => aanwezig.has(s.sleutel));
}

/** De dagen waarop er beelden zijn, nieuwste eerst. */
export function dagenMetBeelden(beelden) {
  const dagen = new Set();
  for (const beeld of Array.isArray(beelden) ? beelden : []) {
    const ms = tijdVanBeeld(beeld);
    if (ms !== null) dagen.add(dagOm(ms).vanaf);
  }
  return [...dagen].sort((a, b) => b - a);
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
 * rekenwerk is dat je zelf moet doen. `null` is "alle dagen".
 */
export function dagLabel(dag, nu = Date.now()) {
  if (dag === null || dag === undefined) return "Alles";
  const vandaag = dagOm(nu).vanaf;
  const gekozen = dagOm(dag).vanaf;
  const verschil = Math.round((vandaag - gekozen) / 86400000);
  if (verschil === 0) return "Vandaag";
  if (verschil === 1) return "Gisteren";
  const d = new Date(gekozen);
  return `${DAGEN[d.getDay()]} ${d.getDate()} ${MAANDEN[d.getMonth()]}`;
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
