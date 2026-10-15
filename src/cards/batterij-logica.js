/**
 * Wat een thuisbatterijkaart moet zeggen, los van hoe hij eruitziet.
 *
 * Gevraagd op 11 oktober 2026, samen met de laadpaal: een kaart voor de
 * thuisbatterij die met DomotiApp Coach werkt, voor in een bubble-pop-up.
 *
 * Alles komt van de coach (contract 1, v0.112.1): een sensor `coach` met de
 * stand en het plan, knoppen `vol_laden`, `leegladen` en `terug_naar_plan`, een
 * number `leeg_tot` en een schakelaar `vakantiestand`. Zie `coach-logica.js`
 * voor hoe de kaart ze vindt.
 *
 * De toestand van de sensor is de naam van de stand, tekst voor mensen. Die
 * wordt getoond, maar wat de kaart DOET komt uit `stand` (valkuil 67).
 *
 * ALLEEN UITLEZEN (coach 0.123.0, 15 oktober 2026)
 *
 * Een batterij die de coach niet stuurt, zoals een Growatt (altijd, de keuze
 * van de eigenaar), heeft `alleen_lezen: true`. De coach draait dan geen stand:
 * `stand` is "stil", `plan` leeg, `soc` null. De kaart leest de accustand en
 * het vermogen dan zelf uit de entiteiten van de klant (`entiteiten`), en de
 * knoppen gaan weg: die bestaan wel, maar doen niets. Zie `uitgelezenStand`.
 *
 * Geen DOM en geen `hass`: dit hoort in een gewone Node-test.
 */

import { klantEntiteiten } from "./coach-logica.js";
import { getalTekst, tikken } from "./laadpaal-logica.js";

/** Het model van een thuisbatterij bij de coach. */
export const BATTERIJ_MODELLEN = ["Thuisbatterij"];

/**
 * Per stand: het woord als de coach geen tekst heeft, het icoon en de kleur.
 *
 * Zonneladen draagt de kleur van zon; wat de batterij verder doet het accent.
 * Rood en groen zijn status (theme.js), en een batterij die laadt of ontlaadt
 * is geen oordeel. Stil is rust.
 */
export const STANDEN = {
  nul_op_de_meter: { label: "Nul op de meter", icoon: "house", tone: "accent" },
  zonneladen: { label: "Zonneladen", icoon: "sun", tone: "solar" },
  laden: { label: "Laden", icoon: "arrowUp", tone: "accent" },
  ontladen: { label: "Ontladen", icoon: "arrowDown", tone: "accent" },
  stil: { label: "Stil", icoon: "pause", tone: "neutral" },
};

/** Het icoon en de kleur bij een stand; een onbekende stand is rust. */
export const standVorm = (stand) => STANDEN[stand] ?? { label: "", icoon: "battery", tone: "neutral" };

const LEEG = new Set(["", "unknown", "unavailable"]);

function moment(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(s)) return null;
  const d = new Date(s);
  return Number.isNaN(+d) ? null : d;
}

function getal(x) {
  if (x === null || x === undefined || x === "") return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

/**
 * Wat de coach over de batterij zegt, uit de attributen van zijn sensor.
 *
 * @param {object|null} st de state van de sensor `coach`
 * @returns {object|null} null als de sensor er niet is of niet bereikbaar
 */
export function batterijStand(st) {
  const a = st?.attributes;
  if (!a || st.state === "unavailable") return null;
  const stand = String(a.stand ?? "");
  const ruw = String(st.state ?? "").trim();
  const override = a.override === "vol" || a.override === "leeg" ? a.override : null;
  return {
    stand,
    // Wat de integratie van de batterij zelf zegt (coach 0.112.1), voor de
    // foto. Bij hem thuis "Anker" en "Anker SOLIX Solarbank Max AC": het model
    // draagt het merk zelf ook. Een lege tekst is "niet bekend".
    fabrikant: String(a.accu_fabrikant ?? ""),
    model: String(a.accu_model ?? ""),
    // De capaciteit in kWh (coach 0.123.0): eerst een sensor, anders wat de
    // installateur intypte, anders null. Ook voor de foto: een Growatt meldt
    // geen model, en een ARK is aan zijn aantal modules te herkennen.
    capaciteit: getal(a.capaciteit),
    alleenLezen: a.alleen_lezen === true,
    entiteiten: klantEntiteiten(st),
    tekst: LEEG.has(ruw) ? STANDEN[stand]?.label ?? "" : ruw.charAt(0).toUpperCase() + ruw.slice(1),
    reden: String(a.reason ?? ""),
    zelf: a.zelf === true,
    soc: getal(a.soc),
    temperatuur: getal(a.temperatuur),
    plan: Array.isArray(a.plan) ? a.plan : [],
    vandaag: getal(a.opgeleverd_vandaag),
    maand: getal(a.opgeleverd_maand),
    totaal: getal(a.opgeleverd_totaal),
    sinds: /^\d{4}-\d{2}-\d{2}$/.test(String(a.opgeleverd_sinds ?? "")) ? String(a.opgeleverd_sinds) : "",
    override,
    // Het doel van een LOPENDE leegbeurt, alleen gevuld zolang `override`
    // "leeg" is. De instelling zelf is de number `leeg_tot`, en die staat
    // standaard op de ondergrens (coach-sessie, 11 oktober 2026).
    leegTot: getal(a.leeg_tot),
    vakantie: a.vakantie === true,
    vakantieMax: getal(a.vakantie_max),
    reserve: getal(a.reserve),
    ondergrens: getal(a.ondergrens),
  };
}

/**
 * De number `leeg_tot`, met de ondergrens van de batterij als minimum.
 *
 * De number zelf gaat van 0 tot 100 (de echte dump van 0.112.1), maar de coach
 * laadt nooit verder leeg dan de ondergrens. Bij hem thuis stond hij op 5, en
 * de ondergrens is 5: een tik op − gaf dan 0, de coach zette het terug, en de
 * kaart sprong van 0% naar 5%. Met de ondergrens als minimum staat − daar uit.
 *
 * @param {object|null} st de state van de number `leeg_tot`
 * @param {ReturnType<typeof batterijStand>} stand
 */
export function leegTotMetGrens(st, stand) {
  if (!st || stand?.ondergrens == null) return st;
  const min = Math.max(getal(st.attributes?.min) ?? 0, stand.ondergrens);
  return { ...st, attributes: { ...st.attributes, min } };
}

/**
 * Een vermogen in kW uit een sensor, op zijn eenheid, of null.
 *
 * Growatt meldt laden en ontladen bij een MIX in kW en bij een SPH in W (de
 * coach-sessie, 15 oktober 2026). Een andere eenheid, of geen, is niet te
 * lezen: raden zou een factor duizend kunnen schelen.
 */
export function kilowatt(st) {
  if (!st || LEEG.has(String(st.state ?? ""))) return null;
  const n = getal(st.state);
  if (n == null) return null;
  const eenheid = String(st.attributes?.unit_of_measurement ?? "");
  if (eenheid === "kW") return n;
  if (eenheid === "W") return n / 1000;
  return null;
}

/** Onder dit vermogen in kW staat hij stil. Growatt meldt in tienden van een kW. */
const STIL_KW = 0.05;

/**
 * Wat een batterij die de coach alleen uitleest NU doet, uit zijn eigen sensoren.
 *
 * Voor een batterij die de coach stuurt verandert er niets. Bij `alleenLezen`:
 *
 * - de accustand uit de entiteit `soc`;
 * - de stand uit laden min ontladen (`charge_power`, `discharge_power`): laden,
 *   ontladen of stil, en het vermogen in `vermogen` (kW, laden positief; zie
 *   `vermogenTekst`). Zijn ze er allebei niet, dan "Vermogen onbekend", en
 *   geen stand die doet alsof hij het weet;
 * - geen plan, opdracht, leegbeurt, vakantiestand of grenzen: dat zijn dingen
 *   van een coach die stuurt. De vakantiestand kan nog aan staan van vroeger,
 *   en de grens zou dan op de balk komen zonder dat hij iets doet.
 *
 * Growatt zelf haalt alles eens per vijf minuten uit de cloud; de kaart toont
 * wat Home Assistant nu heeft.
 *
 * @param {ReturnType<typeof batterijStand>} stand
 * @param {(entityId: string) => object|null|undefined} toestand bijvoorbeeld `(id) => hass.states[id]`
 */
export function uitgelezenStand(stand, toestand) {
  if (!stand?.alleenLezen) return stand;
  const e = stand.entiteiten ?? {};
  const lees = (rol) => (e[rol] ? toestand(e[rol]) ?? null : null);
  const socSt = lees("soc");
  const soc = socSt && !LEEG.has(String(socSt.state ?? "")) ? getal(socSt.state) : null;
  const laden = kilowatt(lees("charge_power"));
  const ontladen = kilowatt(lees("discharge_power"));
  const netto = laden == null && ontladen == null ? null : (laden ?? 0) - (ontladen ?? 0);
  const sleutel = netto == null ? "" : netto >= STIL_KW ? "laden" : netto <= -STIL_KW ? "ontladen" : "stil";
  return {
    ...stand,
    stand: sleutel,
    tekst: sleutel ? STANDEN[sleutel].label : "Vermogen onbekend",
    reden: "",
    zelf: false,
    soc,
    vermogen: netto,
    plan: [],
    override: null,
    leegTot: null,
    vakantie: false,
    vakantieMax: null,
    reserve: null,
    ondergrens: null,
  };
}

/**
 * De knoppen voor een handmatige opdracht, in volgorde.
 *
 * Vol laden en Leegladen staan aan als die opdracht loopt (`override`).
 * Terug naar het plan staat er alleen als er iets te beëindigen valt: zonder
 * opdracht volgt hij het plan al, en een knop die niets doet is ruis. Een
 * knop zonder entiteit staat er niet.
 *
 * @param {ReturnType<typeof batterijStand>} stand
 * @param {Record<string, string>} rollen uit `coachRollen()`
 */
export function opdrachtKnoppen(stand, rollen) {
  // Een batterij die de coach alleen uitleest heeft de knoppen wel, maar ze
  // doen niets (coach 0.123.0). Verbergen is het eerlijkst.
  if (!stand || stand.alleenLezen) return [];
  const uit = [
    { rol: "vol", entity: rollen.vol_laden, label: "Vol laden", kort: "Vol laden", icoon: "arrowUp", aan: stand.override === "vol" },
    { rol: "leeg", entity: rollen.leegladen, label: "Leegladen", kort: "Leegladen", icoon: "arrowDown", aan: stand.override === "leeg" },
  ];
  if (stand.override) {
    // "Naar plan" op een smalle kaart: de hele naam werd daar afgekapt.
    uit.push({ rol: "plan", entity: rollen.terug_naar_plan, label: "Terug naar het plan", kort: "Naar plan", icoon: "calendar", aan: false });
  }
  return uit.filter((k) => k.entity);
}

/**
 * Het plan als staafjes rond een nullijn: laden omhoog, ontladen omlaag.
 *
 * Gemeten aan de coach (11 oktober 2026): `kw` is het gemiddelde dat de coach
 * voor dat blok verwacht, laden positief en ontladen negatief. Ook bij "nul op
 * de meter" is het niet nul: overdag slaat hij zon op, 's avonds levert hij het
 * huis. Een blok is niet altijd een uur (met kwartierprijzen een kwartier), dus
 * de breedte komt uit start en eind. Hooguit 48 blokken.
 *
 * Het venster loopt van nu tot het eind van het plan, minstens zes uur en
 * hooguit een etmaal, net als het laadplan op de laadpaalkaart.
 *
 * @param {Array<object>} plan `{start, end, actie, kw, price, soc_eind}`
 * @param {Date} nu
 * @returns {{van: Date, tot: Date, staven: object[], tikken: object[], max: number}|null}
 */
export function planStaven(plan, nu = new Date(), { minUren = 6, maxUren = 24 } = {}) {
  const blokken = [];
  let laatste = null;
  for (const b of plan ?? []) {
    const start = moment(b?.start);
    const eind = moment(b?.end);
    if (!start || !eind || +eind <= +nu || +eind <= +start) continue;
    if (!laatste || +eind > +laatste) laatste = eind;
    blokken.push({ start, eind, kw: getal(b.kw) ?? 0, actie: String(b.actie ?? ""), prijs: getal(b.price) });
  }
  if (!laatste) return null;
  const uur = 3_600_000;
  const van = new Date(+nu);
  const tot = new Date(Math.min(+nu + maxUren * uur, Math.max(+nu + minUren * uur, +laatste)));
  const breed = +tot - +van;
  const pct = (d) => ((+d - +van) / breed) * 100;
  // De schaal is het grootste vermogen in beeld, zodat een rustige nacht naast
  // een volle middag niet onzichtbaar wordt. Minstens 0,1 kW, anders deelt een
  // plan van alleen nullen door nul.
  const zichtbaar = blokken.filter((b) => +b.eind > +van && +b.start < +tot);
  const max = Math.max(0.1, ...zichtbaar.map((b) => Math.abs(b.kw)));
  const staven = [];
  for (const b of zichtbaar) {
    const s = Math.max(+b.start, +van);
    const e = Math.min(+b.eind, +tot);
    if (e <= s || Math.abs(b.kw) < 0.01) continue;
    staven.push({
      ...b,
      links: pct(s),
      breedte: pct(e) - pct(s),
      hoogte: (Math.abs(b.kw) / max) * 100,
      richting: b.kw > 0 ? "laden" : "ontladen",
    });
  }
  return { van, tot, staven, tikken: tikken(van, tot), max };
}

const EURO = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
const MAANDEN = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/**
 * Wat de batterij heeft opgeleverd, als een regel tekst, of "".
 *
 * Wat de coach nog niet weet is `None` en niet 0 (11 oktober 2026): dat valt
 * weg, want "€ 0,00 vandaag" is iets anders dan "nog niet bekend".
 * `opgeleverd_sinds` is de oudste dag in de boekhouding, een datum zonder tijd.
 */
export function opgeleverdTekst(stand) {
  if (!stand) return "";
  const delen = [];
  if (stand.vandaag != null) delen.push(`vandaag ${EURO.format(stand.vandaag)}`);
  if (stand.maand != null) delen.push(`deze maand ${EURO.format(stand.maand)}`);
  if (stand.totaal != null) {
    const m = stand.sinds.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const sinds = m ? ` sinds ${Number(m[3])} ${MAANDEN[Number(m[2]) - 1]} ${m[1]}` : "";
    delen.push(`${EURO.format(stand.totaal)}${sinds}`);
  }
  return delen.join(" · ");
}

/** De grenzen onder de accubalk: "ondergrens 10% · reserve 20% · vakantie tot 60%". */
export function grenzenTekst(stand) {
  if (!stand) return "";
  const delen = [];
  if (stand.ondergrens != null) delen.push(`ondergrens ${Math.round(stand.ondergrens)}%`);
  if (stand.reserve != null) delen.push(`reserve ${Math.round(stand.reserve)}%`);
  if (stand.vakantie && stand.vakantieMax != null) delen.push(`vakantie tot ${Math.round(stand.vakantieMax)}%`);
  return delen.join(" · ");
}

/**
 * Het vermogen van een batterij die de coach alleen uitleest: "4,7 kW", of "".
 *
 * Rechts onder de lading, op de plek van de temperatuur, en niet in de regel
 * met de stand: daar werd "Ontladen · 4,7 kW" op een halve kaart afgekapt tot
 * "Ontladen · 4,7 …", en het getal is wat je wilt zien (gemeten op
 * 15 oktober 2026). Stil heeft geen vermogen om te noemen.
 */
export function vermogenTekst(stand) {
  if (stand?.vermogen == null || stand.stand === "stil") return "";
  return `${getalTekst(Math.round(Math.abs(stand.vermogen) * 10) / 10)} kW`;
}

/** De temperatuur als tekst: "21 °C", of "". */
export const temperatuurTekst = (stand) =>
  stand?.temperatuur == null ? "" : `${getalTekst(Math.round(stand.temperatuur * 10) / 10)} °C`;

/** Waar de integratie haar afbeeldingen serveert. */
export const AFBEELDINGEN_BASIS = "/domotiapp_lovelace/afbeeldingen/";

/**
 * De foto's die de kaart meebrengt.
 *
 * Productfoto's van de fabrikant, gebruikt met toestemming van de eigenaar als
 * installateur (11 oktober 2026: "ja anker heb ik ook toestemming voor"). De
 * paden staan in dashboards zodra iemand er een kiest: nooit hernoemen.
 */
export const BATTERIJ_FOTOS = {
  anker_solarbank_max_ac: {
    label: "Anker SOLIX Solarbank Max AC",
    pad: "thuisbatterijen/anker-solarbank-max-ac.webp",
  },
  anker_solarbank_max_ac_uitbreiding: {
    label: "Anker SOLIX Solarbank Max AC met uitbreiding",
    pad: "thuisbatterijen/anker-solarbank-max-ac-uitbreiding.webp",
  },
  // Sinds 0.69.0, met toestemming van de eigenaar als installateur
  // (15 oktober 2026: "ja growatt mag in de publieke repo"). Zes modules op
  // een BMS; een ARK met een ander aantal modules is hoger of lager.
  growatt_ark_15_3h: {
    label: "Growatt ARK 15.3H",
    pad: "thuisbatterijen/growatt-ark-15-3h.webp",
  },
};

/** Eén module van een Growatt ARK (ARK 2.5H-A1): 51,2 V maal 50 Ah, 2,56 kWh. */
const ARK_MODULE_KWH = 2.56;

/** De foto per aantal modules. De reeks loopt van 3 (7.6H) tot 10 (25.6H). */
const ARK_FOTOS = { 6: "growatt_ark_15_3h" };

/**
 * Welke ARK het is, aan zijn capaciteit, of null.
 *
 * Een ARK heet naar zijn capaciteit, naar beneden afgekapt: zes modules is
 * 15,36 kWh en heet 15.3H. Dat getal typt de installateur bij de coach. Het
 * moet dicht bij een heel aantal modules liggen, anders is het iets anders:
 * bij de klant kwam er ongeveer 12 kWh uit per 100%, en wie dat intypt is er
 * twee modules naast. Bij twijfel geen foto (de coach-sessie, 15 oktober 2026).
 */
function arkBijCapaciteit(kwh) {
  if (!Number.isFinite(kwh) || kwh <= 0) return null;
  const modules = Math.round(kwh / ARK_MODULE_KWH);
  if (Math.abs(kwh - modules * ARK_MODULE_KWH) > 0.15) return null;
  return ARK_FOTOS[modules] ?? null;
}

/**
 * Welke foto er bij een batterij hoort, of null.
 *
 * Op het model, en op een DEEL van de tekst: bij hem thuis is het "Anker SOLIX
 * Solarbank Max AC", met het merk er zelf in. Alleen een Solarbank Max AC krijgt
 * de foto; een andere Solarbank ziet er anders uit, en een verkeerde foto is
 * erger dan geen. De uitbreiding is aan het model niet te zien: die kies je in
 * de editor.
 *
 * Een Growatt meldt bij een MIX geen model (`growatt_server` zet het op null),
 * en het model dat er wel staat is dat van de omvormer: de accustand hangt aan
 * de omvormer. Een ARK herkent Automatisch daarom aan het getal in een model
 * als "ARK 15.3H", en anders aan de capaciteit uit de coach.
 *
 * @param {{fabrikant?: string, model?: string, capaciteit?: number|null}|null} accu uit `batterijStand()`
 * @returns {string|null} een sleutel uit `BATTERIJ_FOTOS`
 */
export function fotoBijAccu(accu) {
  const model = `${accu?.model ?? ""}`.toLowerCase();
  if (/\bsolarbank\s+max\s+ac\b/.test(model)) return "anker_solarbank_max_ac";
  const fabrikant = `${accu?.fabrikant ?? ""}`.toLowerCase();
  if (/\bgrowatt\b/.test(fabrikant) || /\bgrowatt\b/.test(model)) {
    const ark = model.match(/\bark[\s-]*(\d+(?:[.,]\d+)?)\s*h\b/);
    return arkBijCapaciteit(ark ? Number(ark[1].replace(",", ".")) : accu?.capaciteit ?? NaN);
  }
  return null;
}

/**
 * Het adres van de afbeelding op de kaart, of "".
 *
 * - `eigen`: de eigen afbeelding (leeg als er geen is);
 * - `geen`: geen afbeelding;
 * - een model uit `BATTERIJ_FOTOS`: die foto;
 * - Automatisch (of niets gekozen): een eigen afbeelding als die er is, anders
 *   de foto bij merk en model van de batterij (`fotoBijAccu`), anders niets.
 *
 * Tot coach 0.112.1 meldde de coach geen merk, en was het zonder keuze altijd de
 * Solarbank. Nu kiest Automatisch, net als op de laadpaalkaart.
 *
 * @param {string} keuze `afbeelding` uit de config
 * @param {{fabrikant?: string, model?: string}|null} accu uit `batterijStand()`
 * @param {string} eigen `image` uit de config
 */
export function batterijAfbeelding(keuze, accu, eigen = "") {
  if (keuze === "geen") return "";
  if (keuze === "eigen") return eigen || "";
  const foto = BATTERIJ_FOTOS[keuze] ?? (!eigen ? BATTERIJ_FOTOS[fotoBijAccu(accu)] : null);
  if (foto) return AFBEELDINGEN_BASIS + foto.pad;
  return eigen || "";
}
