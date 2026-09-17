/**
 * Het energiedashboard van Home Assistant uitlezen.
 *
 * ## Waarom dit er is
 *
 * Het energieblok op het infoscherm toonde één sensor uit de kaartconfig: een
 * vermogen of een teller, met de laatste 24 uur erachter. Gevraagd op
 * 17 september 2026: *"als je op de energie klikt dat hij een heel overzicht
 * laat zien van de historie en geschiedenis etc. Dit moet hij van de ingestelde
 * waardes halen van HA energydashboard."*
 *
 * Dat is een andere bron. Het energiedashboard weet wat een aansluiting is, wat
 * zonnepanelen zijn, wat er is teruggeleverd en welke apparaten apart gemeten
 * worden -- en het weet dat van de klant zelf, want die heeft het ingesteld.
 * Wij hoeven dus niets te raden en niets te laten kiezen.
 *
 * ## Het contract, gemeten en niet aangenomen
 *
 * Tegen HA 2026.8.1 op 17 september 2026:
 *
 *     energy/get_prefs
 *       -> {energy_sources: [...], device_consumption: [...], device_consumption_water: [...]}
 *
 *     recorder/statistics_during_period
 *       {start_time, end_time, statistic_ids, period: "hour"|"day"|"week"|"month", types: ["change"]}
 *       -> {"<statistic_id>": [{start, end, sum, state, change}, ...]}
 *
 *     recorder/get_statistics_metadata
 *       {statistic_ids} -> [{statistic_id, display_unit_of_measurement, unit_class, ...}]
 *
 * **`change` is het getal dat je wilt** en niet `sum` of `state`: het is wat er
 * in díé periode verbruikt of opgewekt is. `sum` is de meterstand sinds het
 * begin der tijden en `state` de stand van de sensor zelf.
 *
 * ## De val die hier in zit en die een uur kostte
 *
 * **In HA 2026.8 bestaan `flow_from` en `flow_to` niet meer.** Een
 * grid-aansluiting is sinds die versie één "unified connection" met
 * `stat_energy_from` (import) en `stat_energy_to` (export) op het bronobject
 * zelf -- net als bij een batterij. Elk voorbeeld dat je online vindt gebruikt
 * nog de oude vorm, en `energy/save_prefs` antwoordt daarop met een kaal
 * `invalid_format` zonder te zeggen wélke sleutel niet deugt. Dat staat pas in
 * het HA-log.
 *
 * Deze module leest allebei de vormen, want een klant die nog niet is
 * overgestapt heeft de oude in zijn opslag staan.
 */

/* --------------------------------------------------------------- periodes */

/**
 * De vier vensters, met de emmer waarin ze gemeten worden.
 *
 * Hetzelfde rijtje als het energiedashboard van Home Assistant zelf, en om
 * dezelfde reden: een dag in uren, een week en een maand in dagen, een jaar in
 * maanden. Een jaar in dagen zou 365 staafjes zijn op een scherm dat je van
 * drie meter afstand bekijkt.
 */
export const PERIODES = {
  dag: { naam: "Dag", periode: "hour", stap: "dag" },
  week: { naam: "Week", periode: "day", stap: "week" },
  maand: { naam: "Maand", periode: "day", stap: "maand" },
  jaar: { naam: "Jaar", periode: "month", stap: "jaar" },
};

/** Middernacht in de tijdzone van het scherm, en niet in UTC (valkuil: zie demo). */
const middernacht = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * Van wanneer tot wanneer, voor een periode en een aantal stappen terug.
 *
 * `offset` is 0 voor nu, -1 voor de vorige, enzovoort. De bovengrens loopt tot
 * het EINDE van de periode en niet tot dit moment: anders krimpt de grafiek van
 * "vandaag" in de loop van de dag, en dan lijkt het alsof er minder verbruikt
 * is dan gisteren terwijl de dag simpelweg nog niet om is.
 */
export function venster(soort, offset = 0, nu = new Date()) {
  const o = Math.round(offset) || 0;
  if (soort === "dag") {
    const van = middernacht(nu);
    van.setDate(van.getDate() + o);
    const tot = new Date(van);
    tot.setDate(tot.getDate() + 1);
    return { van, tot, periode: "hour" };
  }
  if (soort === "week") {
    // De week begint op maandag. JavaScript telt vanaf zondag.
    const van = middernacht(nu);
    const dag = (van.getDay() + 6) % 7;
    van.setDate(van.getDate() - dag + o * 7);
    const tot = new Date(van);
    tot.setDate(tot.getDate() + 7);
    return { van, tot, periode: "day" };
  }
  if (soort === "maand") {
    const van = new Date(nu.getFullYear(), nu.getMonth() + o, 1);
    const tot = new Date(nu.getFullYear(), nu.getMonth() + o + 1, 1);
    return { van, tot, periode: "day" };
  }
  const van = new Date(nu.getFullYear() + o, 0, 1);
  const tot = new Date(nu.getFullYear() + o + 1, 0, 1);
  return { van, tot, periode: "month" };
}

const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli",
  "augustus", "september", "oktober", "november", "december"];

/** Hoe het venster heet op het scherm: "Vandaag", "Deze week", "maart 2026". */
export function vensterNaam(soort, offset = 0, nu = new Date()) {
  const o = Math.round(offset) || 0;
  const v = venster(soort, o, nu).van;
  if (soort === "dag") {
    if (o === 0) return "Vandaag";
    if (o === -1) return "Gisteren";
    return `${v.getDate()} ${MAANDEN[v.getMonth()]}`;
  }
  if (soort === "week") {
    if (o === 0) return "Deze week";
    if (o === -1) return "Vorige week";
    const tot = new Date(v);
    tot.setDate(tot.getDate() + 6);
    return `${v.getDate()} ${MAANDEN[v.getMonth()].slice(0, 3)} – ${tot.getDate()} ${MAANDEN[tot.getMonth()].slice(0, 3)}`;
  }
  if (soort === "maand") {
    if (o === 0) return "Deze maand";
    const jaar = v.getFullYear() === nu.getFullYear() ? "" : ` ${v.getFullYear()}`;
    return `${MAANDEN[v.getMonth()]}${jaar}`;
  }
  return o === 0 ? "Dit jaar" : String(v.getFullYear());
}

/* ----------------------------------------------------------------- bronnen */

/**
 * Wat een bron is nadat we hem uit de voorkeuren hebben gehaald.
 *
 * `rol` is waar het om draait: het zegt wat het getal BETEKENT, en dat is niet
 * uit de statistiek zelf af te leiden. Teruglevering en verbruik zijn allebei
 * kWh die door dezelfde meter lopen.
 */
export const ROLLEN = {
  verbruik: { naam: "Van het net", tone: "var(--dac-grid-in)", teken: 1 },
  teruglevering: { naam: "Teruggeleverd", tone: "var(--dac-grid-out)", teken: -1 },
  zon: { naam: "Zonnepanelen", tone: "var(--dac-solar)", teken: 1 },
  accu_uit: { naam: "Uit de accu", tone: "var(--dac-device-2)", teken: 1 },
  accu_in: { naam: "Naar de accu", tone: "var(--dac-device-2)", teken: -1 },
  gas: { naam: "Gas", tone: "var(--dac-device-1)", teken: 1 },
  water: { naam: "Water", tone: "var(--dac-grid-in)", teken: 1 },
  apparaat: { naam: "Apparaat", tone: "var(--dac-house)", teken: 1 },
};

const tekst = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);

/**
 * De bronnen uit `energy/get_prefs`, plat en met hun rol erbij.
 *
 * Leest de NIEUWE vorm (2026.8: `stat_energy_from` / `stat_energy_to` op de
 * grid-bron zelf) en de OUDE (`flow_from` / `flow_to` met een lijst erin),
 * want een opslag die nog niet is omgezet heeft die laatste.
 */
export function bronnenUit(prefs) {
  const uit = [];
  const zet = (rol, statistiek, naam) => {
    const id = tekst(statistiek);
    if (!id) return;
    if (uit.some((b) => b.statistiek === id && b.rol === rol)) return;
    // Een APPARAAT zonder naam houdt zijn statistiek-id. "Apparaat" drie keer
    // onder elkaar zegt niets, en er zijn er meestal meer dan een; bij de
    // andere rollen is er per definitie hooguit een handvol en is de rolnaam
    // juist het duidelijkst.
    const terugval = rol === "apparaat" ? id : (ROLLEN[rol]?.naam ?? id);
    uit.push({ rol, statistiek: id, naam: naam ?? terugval });
  };

  for (const bron of prefs?.energy_sources ?? []) {
    const naam = tekst(bron?.name);
    switch (bron?.type) {
      case "grid": {
        // De nieuwe vorm.
        zet("verbruik", bron.stat_energy_from, naam);
        zet("teruglevering", bron.stat_energy_to, naam ? `${naam} terug` : null);
        // De oude vorm, voor een opslag die nog niet is omgezet.
        for (const f of bron.flow_from ?? []) zet("verbruik", f?.stat_energy_from, naam);
        for (const f of bron.flow_to ?? []) zet("teruglevering", f?.stat_energy_to, naam ? `${naam} terug` : null);
        break;
      }
      case "solar":
        zet("zon", bron.stat_energy_from, naam);
        break;
      case "battery":
        zet("accu_uit", bron.stat_energy_from, naam);
        zet("accu_in", bron.stat_energy_to, naam ? `${naam} laden` : null);
        break;
      case "gas":
        zet("gas", bron.stat_energy_from, naam);
        break;
      case "water":
        zet("water", bron.stat_energy_from, naam);
        break;
      default:
        break;
    }
  }

  for (const d of prefs?.device_consumption ?? []) {
    zet("apparaat", d?.stat_consumption, tekst(d?.name));
  }
  for (const d of prefs?.device_consumption_water ?? []) {
    zet("apparaat", d?.stat_consumption, tekst(d?.name));
  }
  return uit;
}

/** Alle statistiek-ids die we moeten opvragen, zonder dubbele. */
export const statistiekIds = (bronnen) => [...new Set(bronnen.map((b) => b.statistiek))];

/** Heeft dit dashboard genoeg om iets te tonen? */
export const heeftBronnen = (bronnen) => bronnen.some((b) => b.rol !== "apparaat");

/* ------------------------------------------------------------- de cijfers */

const getal = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/**
 * Het totaal per bron over het hele venster.
 *
 * Optelling van `change`, en met opzet niet het verschil tussen de eerste en de
 * laatste `sum`: een meter die tussendoor teruggezet wordt (een nieuwe
 * omvormer, een sensor die opnieuw begint) geeft dan een negatief getal van
 * duizenden kWh. `change` heeft dat al afgehandeld.
 */
export function totalen(bronnen, stats) {
  const uit = {};
  for (const bron of bronnen) {
    const rijen = stats?.[bron.statistiek] ?? [];
    let som = 0;
    for (const r of rijen) som += getal(r?.change);
    uit[bron.statistiek] = Math.max(0, Math.round(som * 1000) / 1000);
  }
  return uit;
}

/** Het totaal van alle bronnen met deze rol. */
export function totaalVoor(bronnen, stats, rol) {
  const per = totalen(bronnen, stats);
  let som = 0;
  for (const b of bronnen) if (b.rol === rol) som += per[b.statistiek] ?? 0;
  return Math.round(som * 1000) / 1000;
}

/**
 * De staafjes: per tijdvak wat er per rol in- en uitging.
 *
 * Elk tijdvak is één staaf. De emmers komen uit de statistieken zelf en niet
 * uit een eigen berekening, want Home Assistant weet wanneer een dag begint --
 * inclusief de nacht waarin de klok verzet wordt.
 */
export function staven(bronnen, stats, { van, tot, periode = "hour" } = {}) {
  const perTijd = new Map();
  const vanMs = van instanceof Date ? van.getTime() : Number(van) || 0;
  const totMs = tot instanceof Date ? tot.getTime() : Number(tot) || Infinity;

  for (const bron of bronnen) {
    for (const r of stats?.[bron.statistiek] ?? []) {
      const start = Number(r?.start);
      if (!Number.isFinite(start) || start < vanMs || start >= totMs) continue;
      if (!perTijd.has(start)) perTijd.set(start, { start, rollen: {} });
      const vak = perTijd.get(start);
      vak.rollen[bron.rol] = (vak.rollen[bron.rol] ?? 0) + getal(r?.change);
    }
  }

  const gevonden = [...perTijd.values()]
    .sort((a, b) => a.start - b.start)
    .map((vak) => {
      const rollen = {};
      for (const [rol, waarde] of Object.entries(vak.rollen)) {
        rollen[rol] = Math.max(0, Math.round(waarde * 1000) / 1000);
      }
      return { start: vak.start, rollen };
    });

  return vulAan(gevonden, { van, tot, periode });
}

/**
 * Het venster aanvullen met lege tijdvakken.
 *
 * Zonder dit volgt de grafiek alleen de uren waarvan de recorder iets weet, en
 * dan is een dag om 01:00 twee staven van een half scherm breed. Elke staaf zou
 * bovendien gedurende de dag versmallen, want er komen er steeds meer bij.
 *
 * Een dag hoort 24 staven te hebben, ook de uren die nog moeten komen: dan
 * staat "we zijn hier" op een vaste plek en is een dag met weinig verbruik
 * zichtbaar leeg in plaats van zichtbaar kort.
 *
 * ## Waarom dit met de kalender rekent en niet met een vast aantal milliseconden
 *
 * De eerste versie leidde de stap af uit de gevonden tijdvakken: het kleinste
 * gat tussen twee rijen. Op een jaar gaf dat **veertien staven** in plaats van
 * twaalf -- februari is de kortste maand, dus de stap werd 28 dagen, en daar
 * passen er 13,04 in een jaar. Gemeten op de testinstance op 17 september 2026.
 *
 * Een maand is geen vast aantal dagen en een dag is geen vast aantal uren (de
 * nacht waarin de klok verzet wordt telt er 23 of 25). Dus loopt dit met
 * `Date` over de kalender, net zoals Home Assistant zijn emmers maakt.
 */
export function vulAan(rijen, { van, tot, periode = "hour" } = {}) {
  const vanMs = van instanceof Date ? van.getTime() : Number(van);
  const totMs = tot instanceof Date ? tot.getTime() : Number(tot);
  if (!Number.isFinite(vanMs) || !Number.isFinite(totMs) || totMs <= vanMs) return rijen;

  /** De volgende grens op de kalender, niet op de klok. */
  const volgende = (d) => {
    const n = new Date(d);
    if (periode === "month") n.setMonth(n.getMonth() + 1);
    else if (periode === "day" || periode === "week") n.setDate(n.getDate() + 1);
    else n.setHours(n.getHours() + 1);
    return n;
  };

  const perStart = new Map(rijen.map((r) => [r.start, r]));
  const uit = [];
  let t = new Date(vanMs);
  // Een bovengrens tegen een verkeerde periode: honderden staven op een scherm
  // van drie meter afstand is geen grafiek meer.
  for (let i = 0; i < 400 && t.getTime() < totMs; i += 1) {
    uit.push(perStart.get(t.getTime()) ?? { start: t.getTime(), rollen: {} });
    t = volgende(t);
  }

  // Rijen die niet op het raster vallen horen er ook te staan; liever een staaf
  // te veel dan een meting die verdwijnt.
  for (const r of rijen) if (!uit.some((x) => x.start === r.start)) uit.push(r);
  return uit.sort((a, b) => a.start - b.start);
}

/**
 * Waar de stroom vandaan kwam en waar hij heen ging.
 *
 * Twee getallen die het energiedashboard zelf ook uitrekent en die de vraag
 * beantwoorden waarvoor iemand naar dit scherm kijkt:
 *
 * - **eigen verbruik**: wat er van de zon rechtstreeks het pand in ging, dus
 *   opgewekt min teruggeleverd. Nooit negatief -- teruglevering kan bij een
 *   thuisaccu groter zijn dan de opwek in datzelfde uur.
 * - **totaal verbruikt**: van het net plus uit de accu plus wat er van de zon
 *   zelf gebruikt is.
 */
export function samenvatting(bronnen, stats) {
  const netIn = totaalVoor(bronnen, stats, "verbruik");
  const netUit = totaalVoor(bronnen, stats, "teruglevering");
  const zon = totaalVoor(bronnen, stats, "zon");
  const accuUit = totaalVoor(bronnen, stats, "accu_uit");
  const accuIn = totaalVoor(bronnen, stats, "accu_in");
  const gas = totaalVoor(bronnen, stats, "gas");
  const water = totaalVoor(bronnen, stats, "water");

  const eigen = Math.max(0, Math.round((zon - netUit) * 1000) / 1000);
  const verbruikt = Math.round((netIn + accuUit + eigen) * 1000) / 1000;
  // Hoeveel procent van wat je gebruikte kwam niet van het net. Zonder verbruik
  // is dat geen 0 maar "niets te zeggen" -- vandaar null.
  const zelfvoorzienend = verbruikt > 0
    ? Math.round(((eigen + accuUit) / verbruikt) * 100)
    : null;

  return { netIn, netUit, zon, accuUit, accuIn, gas, water, eigen, verbruikt, zelfvoorzienend };
}

/* --------------------------------------------------------------- weergave */

/** Een hoeveelheid met zijn eenheid, met zo veel cijfers als zinnig is. */
export function toonWaarde(waarde, eenheid = "kWh") {
  const v = getal(waarde);
  const cijfers = Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2;
  const getalTekst = v.toLocaleString("nl-NL", {
    minimumFractionDigits: cijfers,
    maximumFractionDigits: cijfers,
  });
  return eenheid ? `${getalTekst} ${eenheid}` : getalTekst;
}

/** Een bedrag in euro's. */
export const toonGeld = (waarde) =>
  getal(waarde).toLocaleString("nl-NL", { style: "currency", currency: "EUR" });

const DAGKORT = ["zo", "ma", "di", "wo", "do", "vr", "za"];

/** Wat er onder een staaf staat. */
export function staafLabel(start, soort) {
  const d = new Date(start);
  if (soort === "dag") return String(d.getHours()).padStart(2, "0");
  if (soort === "week") return DAGKORT[d.getDay()];
  if (soort === "maand") return String(d.getDate());
  return MAANDEN[d.getMonth()].slice(0, 3);
}

/**
 * De prijs per eenheid die in de voorkeuren staat, als er een vaste prijs is.
 *
 * Alleen `number_energy_price`: een prijs die uit een entiteit of uit een
 * kostenstatistiek komt verandert per uur, en die achteraf per staaf uitrekenen
 * zou een tweede reeks statistieken vergen. Wat hier uitkomt is dus een
 * SCHATTING, en het scherm zegt dat er ook bij.
 */
export function vastePrijzen(prefs) {
  const uit = {};
  const bruikbaar = (v) => {
    const p = Number(v);
    return Number.isFinite(p) && p > 0 ? p : null;
  };

  for (const bron of prefs?.energy_sources ?? []) {
    // De oude vorm draagt de prijs BINNEN flow_from, niet op de bron. Eerst op
    // de bron kijken en dan pas doorlopen zou die hele bron overslaan -- en dat
    // deed het ook, tot de test erover viel.
    for (const f of bron?.flow_from ?? []) {
      const fp = bruikbaar(f?.number_energy_price);
      if (f?.stat_energy_from && fp) uit[f.stat_energy_from] = fp;
    }

    const p = bruikbaar(bron?.number_energy_price);
    if (!p) continue;
    if (bron.stat_energy_from) uit[bron.stat_energy_from] = p;
  }
  return uit;
}

/** Wat het venster ongeveer gekost heeft, voor zover er vaste prijzen staan. */
export function kosten(bronnen, stats, prijzen) {
  const per = totalen(bronnen, stats);
  let som = 0;
  let compleet = true;
  for (const b of bronnen) {
    if (b.rol === "apparaat" || b.rol === "teruglevering") continue;
    const p = prijzen?.[b.statistiek];
    if (p == null) {
      if ((per[b.statistiek] ?? 0) > 0) compleet = false;
      continue;
    }
    som += (per[b.statistiek] ?? 0) * p;
  }
  return { bedrag: Math.round(som * 100) / 100, compleet };
}
