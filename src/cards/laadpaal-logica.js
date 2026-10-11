/**
 * Wat een laadpaalkaart moet zeggen, los van hoe hij eruitziet.
 *
 * De kaart is gevraagd op 11 oktober 2026: *"mooi strak moderne kaart met een
 * afbeelding van de laadpaal en de noodzakelijke sensoren en aansturingsknoppen
 * en instellingen zoals schema etc."*, voor in een bubble-pop-up, zodat
 * klanten niet telkens naar de coach hoeven.
 *
 * Alles komt van DomotiApp Coach (contract 1, v0.110.0): een sensor `coach`
 * met de stand en het plan, een select `modus`, schakelaars `pauze` en
 * `schema`, een time `klaar_om` en een number `laden_tot`. Zie
 * `coach-logica.js` voor hoe de kaart ze vindt.
 *
 * De TOESTAND van de coach-sensor is tekst voor mensen ("laadt op zon", "wacht
 * tot 20:00"). Die wordt getoond zoals hij is, maar er wordt niets uit
 * afgeleid: wat de kaart DOET (welk icoon, welke kleur) komt uit `stand`, een
 * vaste sleutel. Zie valkuil 67.
 *
 * Geen DOM en geen `hass`: dit hoort in een gewone Node-test.
 */

/** Het model van een laadpaal bij de coach. */
export const LAADPAAL_MODELLEN = ["Laadpaal"];

/**
 * Per stand: het woord als de coach geen tekst heeft, het icoon en de kleur.
 *
 * Laden op zon draagt de identiteitskleur van zon, laden van het net het
 * accent. Groen en rood zijn status (theme.js): vol is goed, een storing is
 * kritiek. Wachten en geen auto zijn rust.
 */
export const STANDEN = {
  laadt_zon: { label: "Laadt op zon", icoon: "sun", tone: "solar" },
  laadt: { label: "Laadt", icoon: "bolt", tone: "accent" },
  wacht: { label: "Wacht", icoon: "clock", tone: "neutral" },
  vol: { label: "Vol", icoon: "battery", tone: "good" },
  geen_auto: { label: "Geen auto", icoon: "plug", tone: "neutral" },
  pauze: { label: "Gepauzeerd", icoon: "pause", tone: "warn" },
  storing: { label: "Storing", icoon: "warning", tone: "bad" },
};

/**
 * De knoppen voor de modus, in de volgorde van de coachkaart.
 *
 * Planning is GEEN knop (sinds 0.59.1). De eigenaar zag op 11 oktober 2026
 * vier afgekapte knoppen ("Plann...", "Conti...") en vroeg "wat is de knop
 * planning". Planning is wat het schema aanzet; dat staat als regel naast de
 * knoppen (`modusRegel`). De select houdt zijn vier opties.
 */
export const MODI = [
  { sleutel: "snel", label: "Snel", icoon: "bolt" },
  { sleutel: "continu", label: "Continu", icoon: "plug" },
  { sleutel: "zon", label: "Zon", icoon: "sun" },
];

const LEEG = new Set(["", "unknown", "unavailable"]);

/** Een tijdstip met zone als `Date`, of null. */
function moment(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(s)) return null;
  const d = new Date(s);
  return Number.isNaN(+d) ? null : d;
}

/** Een getal, of null. Een lege tekst is geen nul. */
function getal(x) {
  if (x === null || x === undefined || x === "") return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

/**
 * Wat de coach over de laadpaal zegt, uit de attributen van zijn sensor.
 *
 * @param {object|null} st de state van de sensor `coach`
 * @returns {object|null} null als de sensor er niet is of niet bereikbaar
 */
export function laadpaalStand(st) {
  const a = st?.attributes;
  if (!a || st.state === "unavailable") return null;
  const stand = String(a.stand ?? "");
  const metAuto = stand !== "geen_auto";
  const ruw = String(st.state ?? "").trim();
  // De tekst van de coach zoals hij is, met een hoofdletter vooraan. Zonder
  // tekst het woord van de stand.
  const tekst = LEEG.has(ruw)
    ? STANDEN[stand]?.label ?? ""
    : ruw.charAt(0).toUpperCase() + ruw.slice(1);
  const sessie = a.sessie && typeof a.sessie === "object" ? a.sessie : null;
  return {
    stand,
    tekst,
    reden: String(a.reason ?? ""),
    // De accustand van de auto, groot op de kaart. Hij vroeg erom op
    // 11 oktober 2026: "in de laadpaal kaart moet ook de batterij % komen van
    // de auto". Zonder sensor in de auto telt de coach zelf door vanaf een
    // opgegeven stand (`soc_geschat`), en dan staat er "± 62%".
    // Zonder auto geen percentage (0.59.1). De coach geeft de laatst bekende
    // stand door, en dat is goed, maar op de kaart las "77%" als een auto die
    // er niet was. De eigenaar: "waarom staat er 77%".
    soc: metAuto ? getal(a.soc) : null,
    socGeschat: a.soc_geschat === true,
    actieradius: metAuto ? getal(a.actieradius_km) : null,
    doel: getal(a.target_percent),
    doelBeurt: a.doel_beurt === true,
    modus: String(a.modus ?? ""),
    // Welke modus er ECHT geldt, en welke knoppen iets doen (coach 0.111.1).
    // Met een planning voor vandaag wint de planning van de voorkeur van de
    // paal: bij hem stond de select op "zon" terwijl het schema gold. Een
    // coach zonder deze attributen: null, en dan volgt de kaart de select.
    modusActief: typeof a.modus_actief === "string" ? a.modus_actief : null,
    modusKeuzes: Array.isArray(a.modus_keuzes) ? a.modus_keuzes : null,
    planningNu: a.planning_nu === true,
    modusBeurt: a.modus_beurt === true,
    pauze: a.pauze === true,
    // Zonder auto rekent de coach toch door: wat er zou gebeuren als er nu een
    // auto aan ging, met de laatst bekende accustand. In de echte dump van
    // 0.112.1 stond er bij "geen_auto" een plan van twee uur en "vol rond
    // 23:02". Dat is een vooruitblik en geen plan; de coach-sessie: "toon het
    // alleen als stand niet geen_auto is".
    klaarVerwacht: metAuto ? moment(a.expected_done) : null,
    kwhNodig: metAuto ? getal(a.kwh_needed) : null,
    amps: getal(a.amps),
    merk: String(a.brand ?? ""),
    // Wat de integratie van de paal zelf zegt (coach 0.112.1), voor de foto.
    // Een lege tekst is "niet bekend".
    fabrikant: String(a.paal_fabrikant ?? ""),
    model: String(a.paal_model ?? ""),
    plan: metAuto && Array.isArray(a.plan) ? a.plan : [],
    sessie,
    schemaAan: a.schema_aan === true,
    perDag: a.per_dag === true,
    schemaDagen: Array.isArray(a.schema_dagen) ? a.schema_dagen : [],
    klaarOmVolgende: moment(a.klaar_om_volgende),
  };
}

/** Het icoon en de kleur bij een stand; een onbekende stand is rust. */
export const standVorm = (stand) => STANDEN[stand] ?? { label: "", icoon: "plug", tone: "neutral" };

/**
 * De knoppen voor de modus, met welke er aan staat.
 *
 * Alleen de standen die de select echt aanbiedt: een coach die er later een
 * bij krijgt of er een weghaalt, krijgt geen knop die niets doet. Een select
 * die niet bereikbaar is geeft geen knoppen.
 *
 * Met de stand van de coach erbij (0.111.1) ook alleen de knoppen die NU iets
 * doen (`modus_keuzes`): met een planning voor vandaag is dat alleen Snel
 * (coach 0.112.3; daarvoor ook Planning, en die is hier geen knop meer). Een tik op Zon wordt dan wel onthouden, maar de planning wint, en op de
 * kaart gebeurt er niets zichtbaars -- daarom laat het paneel ze dan weg, en
 * deze kaart ook. Aan staat `modus_actief`, niet de voorkeur van de paal.
 *
 * @param {object|null} st de state van de select `modus`
 * @param {object|null} [stand] uit `laadpaalStand()`
 */
export function modusKnoppen(st, stand = null) {
  if (!st || st.state === "unavailable") return [];
  const opties = Array.isArray(st.attributes?.options) ? st.attributes.options : null;
  const keuzes = stand?.modusKeuzes ?? null;
  const actief = stand?.modusActief ?? st.state;
  return MODI.filter((m) => (!opties || opties.includes(m.sleutel)) && (!keuzes || keuzes.includes(m.sleutel))).map(
    (m) => ({ ...m, aan: actief === m.sleutel })
  );
}

/**
 * Wat er geldt zonder dat er een knop aan staat, als één regel, of null.
 *
 * Twee gevallen, allebei met `modus_actief` "planning" (de coach-sessie,
 * 11 oktober 2026):
 *
 * - met een planning voor vandaag (`planning_nu`): "Planning", met de tijd
 *   waarop hij klaar moet zijn (`klaar_om_volgende`, anders de time-entiteit);
 * - zonder: de voorkeur van de paal is "Goedkoopst", de goedkoopste bekende
 *   uren zonder klaar-tijd.
 *
 * Staat er een andere modus aan, dan zegt die knop het al, en is er geen regel.
 * Een coach zonder `modus_actief` (van vóór 0.111.1) weet niet of de planning
 * vandaag geldt: dan alleen "Planning".
 *
 * @param {object|null} st de state van de select `modus`
 * @param {object|null} stand uit `laadpaalStand()`
 * @param {object|null} [klaarSt] de state van de time `klaar_om`
 * @returns {{icoon: string, woord: string, tijd: string}|null}
 */
export function modusRegel(st, stand, klaarSt = null) {
  if (!st || st.state === "unavailable") return null;
  const actief = stand?.modusActief ?? st.state;
  if (actief !== "planning") return null;
  if (stand?.modusActief == null) return { icoon: "calendar", woord: "Planning", tijd: "" };
  if (!stand.planningNu) return { icoon: "clock", woord: "Goedkoopst", tijd: "" };
  const uitTijd = /^\d{1,2}:\d{2}/.test(String(klaarSt?.state ?? "")) ? String(klaarSt.state).slice(0, 5) : "";
  const tijd = stand.klaarOmVolgende ? klok(stand.klaarOmVolgende) : uitTijd;
  return { icoon: "calendar", woord: "Planning", tijd };
}

/* ------------------------------------------------------------- het plan */

/**
 * Het laadplan als balk: vanaf nu tot het eind van het plan.
 *
 * Een blok dat al voorbij is valt weg, een blok dat nu loopt begint bij nu.
 * Het venster is minstens `minUren` en hooguit `maxUren` breed: een plan van
 * één uur naast een balk van 24 uur is een streepje, en een plan voor overmorgen
 * hoort niet op een kaart die over vannacht gaat.
 *
 * Een blok draagt de kleur van wat het meeste levert: zon of net. `zonDeel`
 * staat erbij voor wie het preciezer wil tekenen.
 *
 * @param {Array<object>} plan `plan` van de coach: {start, end, charging, kw, kwh, solar_kwh, price, why}
 * @param {Date} nu
 * @returns {{van: Date, tot: Date, blokken: object[], tikken: {pct: number, tekst: string}[]}|null}
 */
export function planBalk(plan, nu = new Date(), { minUren = 6, maxUren = 24 } = {}) {
  const blokken = [];
  let laatste = null;
  for (const b of plan ?? []) {
    const start = moment(b?.start);
    const eind = moment(b?.end);
    if (!start || !eind || +eind <= +nu || +eind <= +start) continue;
    if (!laatste || +eind > +laatste) laatste = eind;
    if (b.charging !== true) continue;
    const kwh = getal(b.kwh) ?? 0;
    const zon = getal(b.solar_kwh) ?? 0;
    const zonDeel = kwh > 0 ? Math.min(1, Math.max(0, zon / kwh)) : 0;
    blokken.push({ start, eind, kw: getal(b.kw), prijs: getal(b.price), waarom: String(b.why ?? ""), zonDeel });
  }
  if (!laatste) return null;

  const van = new Date(+nu);
  const uur = 3_600_000;
  const tot = new Date(Math.min(+nu + maxUren * uur, Math.max(+nu + minUren * uur, +laatste)));
  const breed = +tot - +van;
  const pct = (d) => ((+d - +van) / breed) * 100;

  const uit = [];
  for (const b of blokken) {
    const s = Math.max(+b.start, +van);
    const e = Math.min(+b.eind, +tot);
    if (e <= s) continue;
    uit.push({
      ...b,
      links: pct(s),
      breedte: pct(e) - pct(s),
      soort: b.zonDeel >= 0.5 ? "zon" : "net",
    });
  }
  return { van, tot, blokken: uit, tikken: tikken(van, tot) };
}

const klok = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

/**
 * Hele uren onder de balk, hooguit vijf, plus "nu" aan het begin. Ook voor de
 * batterijkaart.
 *
 * Een tik vlak naast "nu" (binnen een tiende van de balk) valt weg: twee
 * tijden over elkaar heen zijn er nul.
 */
export function tikken(van, tot) {
  const uren = (+tot - +van) / 3_600_000;
  const stap = uren <= 6 ? 2 : uren <= 12 ? 3 : 6;
  const uit = [{ pct: 0, tekst: "nu" }];
  const eerste = new Date(+van);
  eerste.setMinutes(0, 0, 0);
  eerste.setHours(eerste.getHours() + 1);
  while (eerste.getHours() % stap) eerste.setHours(eerste.getHours() + 1);
  for (let t = new Date(+eerste); +t < +tot; t.setHours(t.getHours() + stap)) {
    const pct = ((+t - +van) / (+tot - +van)) * 100;
    if (pct < 10 || pct > 92) continue;
    uit.push({ pct, tekst: klok(t) });
  }
  return uit;
}

/* ------------------------------------------------------------ het schema */

/** Dagen in de volgorde van de coach: INDEX 0 IS MAANDAG (Python `weekday()`). */
export const DAGEN_KORT = ["ma", "di", "wo", "do", "vr", "za", "zo"];

/**
 * Welke plek in `schema_dagen` vandaag is.
 *
 * JavaScript telt vanaf zondag (`getDay()` is 0 op zondag), de coach vanaf
 * maandag. Dat is precies het soort verschil dat een dag te vroeg of te laat
 * uitkomt zonder dat iemand het ziet; zie het contract.
 */
export const vandaagIndex = (nu = new Date()) => (nu.getDay() + 6) % 7;

/**
 * Het weekschema als zeven regels, of [] als het er niet (goed) is.
 *
 * @param {Array<{aan: boolean, klaar_om: string}>} dagen `schema_dagen`
 * @param {Date} nu om vandaag aan te wijzen
 */
export function weekSchema(dagen, nu = new Date()) {
  if (!Array.isArray(dagen) || dagen.length !== 7) return [];
  const vandaag = vandaagIndex(nu);
  return dagen.map((d, i) => ({
    dag: DAGEN_KORT[i],
    aan: d?.aan === true,
    klaarOm: /^\d{1,2}:\d{2}/.test(String(d?.klaar_om ?? "")) ? String(d.klaar_om).slice(0, 5) : "",
    vandaag: i === vandaag,
  }));
}

/* ------------------------------------------------------- de laadbeurt */

const NL = new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 });
const EURO = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });

/** Een getal zoals een mens het schrijft: 12,4. */
export const getalTekst = (n) => (n == null ? "" : NL.format(n));

const DAGNAMEN = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];

/** "18:02", "gisteren 18:02" of "zaterdag 18:02". */
function wanneer(d, nu) {
  const dag = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const verschil = Math.round((+dag(nu) - +dag(d)) / 86_400_000);
  if (verschil <= 0) return klok(d);
  if (verschil === 1) return `gisteren ${klok(d)}`;
  if (verschil < 7) return `${DAGNAMEN[d.getDay()]} ${klok(d)}`;
  return `${d.getDate()}-${d.getMonth() + 1} ${klok(d)}`;
}

/**
 * De lopende of de vorige laadbeurt als twee regels tekst, of null.
 *
 * Of hij loopt zegt `actief` (gemeten in de echte dump van coach 0.111.0,
 * 11 oktober 2026): waar zolang de kabel erin zit, ook als de auto vol is.
 * Een sensor zonder `actief` valt terug op `einde`, dat null is zolang de beurt
 * loopt.
 *
 * De KOSTEN heten "incl. zon", en dat is geen versiering. De coach rekent er de
 * zon in mee tegen wat die anders had opgeleverd (zoals "betaald" bij
 * Bespaard), terwijl het verslag op de telefoon alleen het net noemt. Bij hem
 * thuis was dat EUR 3,59 tegen EUR 3,13; twee bedragen met hetzelfde woord
 * ervoor is er één te veel.
 *
 * Een getal dat ontbreekt valt weg in plaats van als "0" te verschijnen: nul
 * euro is iets anders dan "niet bekend".
 *
 * @param {object|null} sessie `{actief, begin, einde, kwh, kosten, kosten_net, zon_kwh, soc_begin, soc_eind}`
 * @param {Date} nu
 * @returns {{kop: string, tijd: string, accu: string, tekst: string}|null}
 */
export function sessieTekst(sessie, nu = new Date()) {
  if (!sessie) return null;
  const begin = moment(sessie.begin);
  const einde = moment(sessie.einde);
  const loopt = typeof sessie.actief === "boolean" ? sessie.actief : !einde;
  const delen = [];
  const kwh = getal(sessie.kwh);
  const kosten = getal(sessie.kosten);
  const zon = getal(sessie.zon_kwh);
  if (kwh != null) delen.push(`${getalTekst(kwh)} kWh`);
  if (zon != null && zon > 0) delen.push(`${getalTekst(zon)} kWh zon`);
  // Wat er uit de thuisbatterij kwam (coach 0.112.0, gezien in de dump van
  // 0.112.1). De eigenaar op 11 oktober 2026: ja, tonen.
  const uitAccu = getal(sessie.accu_kwh);
  if (uitAccu != null && uitAccu > 0) delen.push(`${getalTekst(uitAccu)} kWh accu`);
  // Sinds coach 0.112.0 ook `kosten_net`: alleen het net, het bedrag uit het
  // verslag op de telefoon. Dat staat dan vooraan, want dat is wat hij kent.
  const net = getal(sessie.kosten_net);
  if (net != null) delen.push(`${EURO.format(net)} net`);
  if (kosten != null) delen.push(`${EURO.format(kosten)} incl. zon`);
  let tijd = "";
  if (begin && loopt) tijd = `sinds ${wanneer(begin, nu)}`;
  else if (begin && einde) tijd = `${wanneer(begin, nu)} – ${klok(einde)}`;
  const van = getal(sessie.soc_begin);
  const tot = getal(sessie.soc_eind);
  const accu = van != null && tot != null ? `${Math.round(van)}% → ${Math.round(tot)}%` : "";
  return { kop: loopt ? "Deze laadbeurt" : "Vorige laadbeurt", tekst: delen.join(" · "), tijd, accu };
}

/* ------------------------------------------------------ de accustand */

/**
 * De accustand als tekst: "62%", "± 62%" als de coach hem schat, of "".
 *
 * Afgerond op hele procenten: "62,4%" op een laadpaal zegt niets meer dan 62.
 */
export function socTekst(stand) {
  if (stand?.soc == null) return "";
  const pct = `${Math.round(stand.soc)}%`;
  return stand.socGeschat ? `± ${pct}` : pct;
}

/* --------------------------------------------------- vermogen en stapper */

/**
 * Het vermogen van de paal als tekst ("7,4 kW"), of "" als hij niets doet.
 *
 * Paalintegraties melden in W of in kW; de eenheid staat in de attributen.
 */
export function vermogenTekst(st) {
  if (!st || LEEG.has(String(st.state ?? ""))) return "";
  const n = getal(st.state);
  if (n == null) return "";
  const eenheid = String(st.attributes?.unit_of_measurement ?? "W");
  const kw = /^kW$/i.test(eenheid) ? n : /^MW$/i.test(eenheid) ? n * 1000 : n / 1000;
  if (Math.abs(kw) < 0.05) return "";
  return `${getalTekst(Math.round(kw * 10) / 10)} kW`;
}

/**
 * De volgende waarde van een number-entiteit na een tik op − of +, of null.
 *
 * Min, max en stap komen uit de entiteit (laden_tot: 10-100, stap 5). Op de
 * rand gebeurt er niets: null, en dan roept de kaart ook niets aan.
 *
 * @param {object|null} st
 * @param {1|-1} richting
 */
export function stapWaarde(st, richting) {
  if (!st || LEEG.has(String(st.state ?? ""))) return null;
  const nu = getal(st.state);
  if (nu == null) return null;
  const a = st.attributes ?? {};
  const stap = getal(a.step) || 1;
  const min = getal(a.min) ?? -Infinity;
  const max = getal(a.max) ?? Infinity;
  const volgende = Math.min(max, Math.max(min, Math.round((nu + richting * stap) / stap) * stap));
  return volgende === nu ? null : volgende;
}

/* ------------------------------------------------------- de afbeelding */

/** Waar de integratie zijn afbeeldingen uitserveert (sinds 0.56.0). */
export const AFBEELDINGEN_BASIS = "/domotiapp_lovelace/afbeeldingen/";

/**
 * De foto's die de kaart meebrengt.
 *
 * Productfoto's van de fabrikant, gebruikt met toestemming van de eigenaar als
 * installateur (11 oktober 2026). De paden staan in dashboards van klanten zodra
 * iemand er een kiest: NOOIT hernoemen, alleen aanvullen (zie
 * tests/test_afbeeldingen.py).
 */
export const LAADPAAL_FOTOS = {
  easee_charge_up: { label: "Easee Charge Up", pad: "laadpalen/easee-charge-up.webp", merk: "easee" },
  easee_charge_max_pro: {
    label: "Easee Charge Max & Pro",
    pad: "laadpalen/easee-charge-max-pro.webp",
    merk: "easee",
  },
  alfen_eve_single_plus: {
    label: "Alfen Eve Single Plus",
    pad: "laadpalen/alfen-eve-single-plus.webp",
    merk: "alfen",
  },
  alfen_eve_double_plus: {
    label: "Alfen Eve Double Plus",
    pad: "laadpalen/alfen-eve-double-plus.webp",
    merk: "alfen",
  },
};

/**
 * Welke foto er bij een paal hoort, of null.
 *
 * Op de fabrikant, met het model als verfijning. Sinds coach 0.112.1 staan
 * die er allebei, zoals de integratie van de paal ze meldt; bij hem thuis
 * "Easee" en "Charge Max". Een coach van daarvoor meldt alleen `brand`
 * ("easee"), en dan is het de gewone foto van dat merk.
 *
 * Op een DEEL van de tekst, niet op de hele: een model draagt soms zelf het
 * merk ("Anker SOLIX Solarbank Max AC" bij de batterij), en een integratie
 * schrijft "Charge Max" waar een andere "Easee Charge Max" schrijft.
 *
 * @param {{fabrikant?: string, model?: string, merk?: string}|null} paal uit `laadpaalStand()`
 * @returns {string|null} een sleutel uit `LAADPAAL_FOTOS`
 */
export function fotoBijPaal(paal) {
  const fabrikant = `${paal?.fabrikant || paal?.merk || ""}`.toLowerCase();
  const model = `${paal?.model ?? ""}`.toLowerCase();
  if (/\beasee\b/.test(fabrikant)) return /\bup\b/.test(model) ? "easee_charge_up" : "easee_charge_max_pro";
  if (/\balfen\b/.test(fabrikant)) return /\bdouble\b/.test(model) ? "alfen_eve_double_plus" : "alfen_eve_single_plus";
  return null;
}

/**
 * Het adres van de afbeelding op de kaart, of "".
 *
 * - `eigen`: de eigen afbeelding (leeg als er geen is);
 * - `geen`: geen afbeelding;
 * - een model uit `LAADPAAL_FOTOS`: die foto;
 * - niets gekozen: een eigen afbeelding als die er is, anders de foto bij
 *   merk en model van de paal (`fotoBijPaal`), anders niets.
 *
 * @param {string} keuze `afbeelding` uit de config
 * @param {{fabrikant?: string, model?: string, merk?: string}|null} paal uit `laadpaalStand()`
 * @param {string} eigen `eigen_afbeelding` uit de config
 */
export function laadpaalAfbeelding(keuze, paal, eigen = "") {
  if (keuze === "geen") return "";
  if (keuze === "eigen") return eigen || "";
  const foto = LAADPAAL_FOTOS[keuze] ?? (!eigen ? LAADPAAL_FOTOS[fotoBijPaal(paal)] : null);
  if (foto) return AFBEELDINGEN_BASIS + foto.pad;
  return eigen || "";
}
