/**
 * Wat een thuisbatterijkaart moet zeggen, los van hoe hij eruitziet.
 *
 * Gevraagd op 11 oktober 2026, samen met de laadpaal: een kaart voor de
 * thuisbatterij die met DomotiApp Coach werkt, voor in een bubble-pop-up.
 *
 * Alles komt van de coach (contract 1, v0.112.0): een sensor `coach` met de
 * stand en het plan, knoppen `vol_laden`, `leegladen` en `terug_naar_plan`, een
 * number `leeg_tot` en een schakelaar `vakantiestand`. Zie `coach-logica.js`
 * voor hoe de kaart ze vindt.
 *
 * De toestand van de sensor is de naam van de stand, tekst voor mensen. Die
 * wordt getoond, maar wat de kaart DOET komt uit `stand` (valkuil 67).
 *
 * Geen DOM en geen `hass`: dit hoort in een gewone Node-test.
 */

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
    leegTot: getal(a.leeg_tot),
    vakantie: a.vakantie === true,
    vakantieMax: getal(a.vakantie_max),
    reserve: getal(a.reserve),
    ondergrens: getal(a.ondergrens),
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
  if (!stand) return [];
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
};

/**
 * Het adres van de afbeelding op de kaart, of "".
 *
 * De coach meldt (nog) niet welk merk de batterij is, dus er is geen
 * Automatisch: zonder keuze is het de Solarbank, omdat dat de batterij is die
 * de eigenaar levert.
 */
export function batterijAfbeelding(keuze, eigen = "") {
  if (keuze === "geen") return "";
  if (keuze === "eigen") return eigen || "";
  const foto = BATTERIJ_FOTOS[keuze] ?? BATTERIJ_FOTOS.anker_solarbank_max_ac;
  return AFBEELDINGEN_BASIS + foto.pad;
}
