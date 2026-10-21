/**
 * Wat een robotstofzuigerkaart moet zeggen, los van hoe hij eruitziet.
 *
 * Gevraagd op 15 oktober 2026, via de beheersessie: een kaart voor de
 * robotstofzuiger, "net als de thuisbatterij": eerst een merk, dan een type, en
 * bij dat type een productfoto. Overzichtelijk: de entiteiten die nodig zijn,
 * plus de kaart van het huis, en niet alle driehonderd.
 *
 * Wat erop staat koos de eigenaar dezelfde middag zelf: naast foto, status,
 * accu en start/pauze/naar het station vier blokken.
 * - kamers kiezen en laten schoonmaken, met de live kaart erbij;
 * - de stand (zuigen, dweilen, allebei, dweilen na zuigen), de zuigkracht en
 *   hoe nat hij dweilt;
 * - het station: zelfreiniging, drogen en leegzuigen, met de watertanks en de
 *   stofzak;
 * - onderhoud: hoofd- en zijborstel, filter en sensoren in procenten.
 * De instellingen (de vijftig schakelaars) blijven eraf. Zoeken en de laatste
 * beurt heeft hij niet genoemd, en staan er dus niet op.
 *
 * CleanGenius noemde hij ook niet, en staat er TOCH op. In de dump van de L40s
 * stond hij op Routine, en dan zet de integratie de stand, de zuigkracht en
 * het dweilen alle drie op `unavailable`: CleanGenius kiest ze zelf, en zijn
 * eigen stand staat in `cleangenius_mode`. Zonder die rij had die robot niets
 * van wat de eigenaar vroeg, en was er op de kaart geen weg terug.
 *
 * De eerste twee zijn Dreames, met de HACS-integratie `dreame_vacuum`
 * (Tasshack). Hun dumps staan als vaste testinvoer in
 * `tests/js/vaste-invoer/dreame-*.json`: een X50 Ultra Complete met 302
 * entiteiten en een r9419h met 216.
 *
 * HOE DE KAART DE REST VINDT
 *
 * In de editor kies je één `vacuum`-entiteit. De rest zoekt de kaart op het
 * APPARAAT en de `translation_key` (`stofzuigerDelen`), niet op de naam: bij de
 * ene heet alles `x50_ultra_complete_*` en bij de andere `dreame_boven_*`, en
 * een klant kan alles hernoemen. Een andere integratie zonder die sleutels
 * krijgt de kop, de bediening en (als de stofzuiger het kan) de zuigkracht uit
 * de stofzuiger zelf; de blokken waar niets voor gevonden is blijven weg.
 *
 * DRIE VALKUILEN UIT DE DUMP
 *
 * - De TOESTAND van de stofzuiger zegt "docked" terwijl het station de pads
 *   droogt. Wat er echt gebeurt staat in de sensor `state` ("drying"); die gaat
 *   voor op de kaart.
 * - De batterij zit niet in de featureflags (geen BATTERY). Hij staat in de
 *   sensor `battery_level` en in het attribuut `battery`. Let op:
 *   `battery_charge_level` is de LAADGRENS (een instelling), niet de lading.
 * - De `friendly_name` van de X50 is "X50 Ultra Complete  X50 Ultra Complete",
 *   met een dubbele spatie. De kaart neemt daarom de naam van het APPARAAT als
 *   je zelf niets invult (`naamVan`).
 *
 * Geen DOM en geen `hass`-methodes: dit hoort in een gewone Node-test. Waar de
 * vertaling van Home Assistant nodig is, krijgt een functie `vertaal` mee:
 * `(st, waarde) => hass.formatEntityState(st, waarde)`.
 */

import {
  AFBEELDINGEN_BASIS,
  merkKeuzes as merken,
  productAfbeelding,
  typeBijApparaat as typeBij,
  typeKeuzes as types,
} from "./productfoto.js";
import { isVertaald, keuzeNaam } from "./programmanaam.js";
import { locale, nt, t, tc, tn } from "../taal.js";

const domeinVan = (id) => String(id ?? "").split(".")[0];

const LEEG = new Set(["", "unknown", "unavailable"]);

/** Heeft deze entiteit iets te zeggen? */
export const heeftWaarde = (st) => Boolean(st) && !LEEG.has(String(st.state ?? ""));

function getal(x) {
  if (x === null || x === undefined || x === "" || typeof x === "boolean") return null;
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

const getalTekst = (n) => (n == null ? "" : new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(n));

/** Een sleutel als woorden: `not_installed_or_full` -> "Not installed or full". */
function opgeschoond(sleutel) {
  const los = String(sleutel ?? "").replace(/[_-]+/g, " ").trim();
  return los ? los.charAt(0).toUpperCase() + los.slice(1) : "";
}

/** De vertaling van Home Assistant als die er echt is, anders "". */
function haWoord(vertaal, st, waarde) {
  if (!vertaal || !st) return "";
  let w = "";
  try {
    w = vertaal(st, waarde) ?? "";
  } catch {
    w = "";
  }
  return isVertaald(waarde, w) ? String(w) : "";
}

/* ------------------------------------------------------- de stofzuiger */

/** De featureflags van `vacuum` in Home Assistant 2026.8. */
export const KAN = {
  PAUZE: 4,
  STOP: 8,
  TERUG: 16,
  ZUIGKRACHT: 32,
  START: 8192,
};

const kan = (st, vlag) => (Number(st?.attributes?.supported_features) & vlag) !== 0;

/**
 * Per domein: welke `translation_key` welke rol op de kaart heeft.
 *
 * De sleutels zijn die van `dreame_vacuum`; zie de twee dumps. De rest van de
 * kaart leest alleen deze namen, zodat een volgend merk hier een regel bijkrijgt
 * en verder niets.
 */
export const ROLLEN = {
  sensor: {
    state: "toestand",
    error: "fout",
    battery_level: "batterij",
    current_room: "kamerNu",
    cleaning_progress: "voortgang",
    drying_progress: "drogenVoortgang",
    drying_left: "drogenRest",
    self_wash_base_status: "basis",
    auto_empty_status: "legen",
    clean_water_tank_status: "schoonwater",
    dirty_water_tank_status: "vuilwater",
    dust_bag_status: "stofzak",
    low_water_warning: "water",
  },
  binary_sensor: { charging_state: "laden" },
  select: {
    cleangenius: "cleangenius",
    cleangenius_mode: "cgModus",
    cleaning_mode: "modus",
    suction_level: "zuigkracht",
    mop_pad_humidity: "vochtigheid",
  },
  button: { self_clean: "wassenKnop", manual_drying: "drogenKnop", start_auto_empty: "legenKnop" },
  // De live kaart. Bij Dreame heten de opgeslagen kaarten `saved_map` en die
  // van de wifi `wifi_map`: die horen er niet bij.
  camera: { map: "kaart" },
  image: { map: "kaart" },
};

/** Een onderhoudsonderdeel: `<onderdeel>_left` in procenten. */
const ONDERHOUD = /^(.+)_left$/;

/**
 * De andere entiteiten van hetzelfde apparaat, per rol.
 *
 * Op APPARAAT en `translation_key`. Een verborgen entiteit telt niet mee, een
 * uitgeschakelde staat niet eens in `hass.entities`. `onderhoud` is een lijst
 * van sensoren die `<onderdeel>_left` heten en in procenten meten;
 * `restTijd` geeft per onderdeel de sensor `<onderdeel>_time_left`.
 *
 * @param {{entities?: object, states?: object}} hass
 * @param {string} stofzuigerId
 */
export function stofzuigerDelen(hass, stofzuigerId) {
  const uit = { onderhoud: [], restTijd: {} };
  const toestel = hass?.entities?.[stofzuigerId]?.device_id;
  if (!toestel) return uit;
  for (const [id, reg] of Object.entries(hass.entities)) {
    if (id === stofzuigerId || reg?.device_id !== toestel || reg?.hidden) continue;
    const st = hass.states?.[id];
    if (!st) continue;
    const domein = domeinVan(id);
    const tk = String(reg.translation_key ?? "");
    const rol = ROLLEN[domein]?.[tk];
    if (rol) {
      uit[rol] ??= id;
      continue;
    }
    if (domein !== "sensor") continue;
    const tijd = /^(.+)_time_left$/.exec(tk);
    if (tijd) {
      uit.restTijd[`${tijd[1]}_left`] ??= id;
      continue;
    }
    if (ONDERHOUD.test(tk) && st.attributes?.unit_of_measurement === "%") {
      uit.onderhoud.push({ id, tk });
    } else if (st.attributes?.device_class === "battery") {
      uit.batterij ??= id;
    }
  }
  uit.onderhoud.sort((a, b) => volgorde(a.tk) - volgorde(b.tk));
  return uit;
}

/**
 * De naam van de stofzuiger als je zelf niets invult.
 *
 * Niet de `friendly_name`: bij `dreame_vacuum` staat `has_entity_name` uit en
 * begint `original_name` met een spatie, en dan wordt het "X50 Ultra Complete
 * X50 Ultra Complete". De naam van het apparaat is wat de klant ziet in Home
 * Assistant.
 *
 * @param {object} hass
 * @param {string} id
 * @param {string} [ingevuld] `name` uit de config
 */
export function naamVan(hass, id, ingevuld) {
  if (ingevuld) return String(ingevuld);
  const reg = hass?.entities?.[id];
  const apparaat = reg?.device_id ? hass?.devices?.[reg.device_id] : null;
  const eigen = String(reg?.name ?? "").trim();
  if (eigen) return eigen;
  const toestel = String(apparaat?.name_by_user || apparaat?.name || "").trim();
  if (toestel) return toestel;
  const fn = String(hass?.states?.[id]?.attributes?.friendly_name ?? "").replace(/\s+/g, " ").trim();
  return fn || String(id ?? "");
}

/* --------------------------------------------------------------- de kop */

/**
 * Wat de sensor `state` van `dreame_vacuum` zegt, in gewone woorden.
 *
 * Eigen woorden en niet die van de integratie: die vertaling bestaat niet in
 * elke taal, en waar hij bestaat is hij een letterlijke ("Status
 * zelfwassing-basis"). Een waarde die hier niet staat valt terug op Home
 * Assistant en dan op de sleutel zelf.
 */
export const TOESTAND_WOORDEN = {
  sweeping: nt("Zuigt"),
  mopping: nt("Dweilt"),
  sweeping_and_mopping: nt("Zuigt en dweilt"),
  paused: nt("Gepauzeerd"),
  error: nt("Storing"),
  returning: nt("Terug naar het station"),
  charging: nt("Laadt op"),
  smart_charging: nt("Laadt slim op"),
  charging_completed: nt("Opgeladen"),
  drying: nt("Droogt de dweilpads"),
  washing: nt("Wast de dweilpads"),
  washing_paused: nt("Wassen gepauzeerd"),
  returning_washing: nt("Terug om de pads te wassen"),
  returning_install_mop: nt("Terug om de pads te plaatsen"),
  returning_remove_mop: nt("Terug om de pads af te doen"),
  returning_auto_empty: nt("Terug om te legen"),
  auto_emptying: nt("Leegt de stofbak"),
  clean_add_water: nt("Vult water bij"),
  water_check: nt("Controleert het water"),
  building: nt("Maakt een plattegrond"),
  upgrading: nt("Wordt bijgewerkt"),
  station_reset: nt("Station wordt hersteld"),
  remote_control: nt("Op afstand bestuurd"),
  second_cleaning: nt("Tweede ronde"),
  spot_cleaning: nt("Maakt een plek schoon"),
  clean_summon: nt("Komt eraan"),
  human_following: nt("Volgt iemand"),
  shortcut: nt("Snelkoppeling"),
  monitoring: nt("Bewaakt"),
  monitoring_paused: nt("Bewaken gepauzeerd"),
};

/** De toestand van de stofzuiger zelf, als er geen fijnere is. */
export const ACTIVITEIT_WOORDEN = {
  cleaning: nt("Maakt schoon"),
  docked: nt("In het station"),
  idle: nt("Staat stil"),
  paused: nt("Gepauzeerd"),
  returning: nt("Terug naar het station"),
  error: nt("Storing"),
};

/** Wat geen fout is, in de sensor `error`. */
const GEEN_FOUT = new Set(["no_error", "none", "ok", "0"]);

/** Minuten als tekst: "45 min", "2 uur", "1 uur 30 min". */
export function duurTekst(minuten) {
  const m = getal(minuten);
  if (m == null || m < 0) return "";
  const r = Math.round(m);
  if (r < 60) return `${r} min`;
  const u = Math.floor(r / 60);
  const rest = r % 60;
  return rest ? t("{u} uur {m} min", { u, m: rest }) : t("{u} uur", { u });
}

/**
 * Alles wat de kop nodig heeft.
 *
 * `soort` stuurt de kleur van de chip (alleen het icoon draagt de toestand):
 * `schoon` en `terug` zijn het accent, `pauze` is let op, `storing` is rood,
 * en in het station staan of stilstaan is neutraal.
 *
 * @param {object} hass met `states`
 * @param {string} id de stofzuiger
 * @param {object} delen uit `stofzuigerDelen`
 * @param {(st: object, waarde?: string) => string} [vertaal]
 */
export function stofzuigerStand(hass, id, delen = {}, vertaal) {
  const st = hass?.states?.[id];
  const s = (rol) => (delen[rol] ? hass?.states?.[delen[rol]] : null);
  const a = st?.attributes ?? {};
  const beschikbaar = Boolean(st) && st.state !== "unavailable";
  const activiteit = beschikbaar && st.state !== "unknown" ? String(st.state) : "";

  // De batterij: de sensor, en anders wat de stofzuiger zelf meldt.
  const bat = s("batterij");
  const batterij = heeftWaarde(bat) ? getal(bat.state) : getal(a.battery_level ?? a.battery);
  const laden = s("laden");
  const laadt = laden ? laden.state === "on" : a.charging === true;

  // De tekst: eerst wat er echt gebeurt.
  const toestand = s("toestand");
  const fijn = heeftWaarde(toestand) ? String(toestand.state) : "";
  let tekst = "";
  if (fijn && fijn !== "idle") tekst = TOESTAND_WOORDEN[fijn] ? t(TOESTAND_WOORDEN[fijn]) : haWoord(vertaal, toestand, fijn);
  if (!tekst) {
    tekst = ACTIVITEIT_WOORDEN[activiteit]
      ? t(ACTIVITEIT_WOORDEN[activiteit])
      : haWoord(vertaal, st, activiteit) || opgeschoond(fijn || activiteit);
  }
  if (!beschikbaar) tekst = t("Niet bereikbaar");

  // Wat erachter komt: de kamer en de voortgang als hij bezig is, de
  // droogtijd als het station droogt. Is er niets te melden, dan niets.
  const delenDetail = [];
  const bezig = activiteit === "cleaning";
  const pauze = activiteit === "paused";
  if (bezig || pauze) {
    const kamer = s("kamerNu");
    if (heeftWaarde(kamer)) delenDetail.push(String(kamer.state));
    const v = getal(s("voortgang")?.state);
    if (v != null && v > 0) delenDetail.push(`${getalTekst(v)} %`);
  } else if (fijn === "drying" || s("basis")?.state === "drying") {
    const v = getal(s("drogenVoortgang")?.state);
    if (v != null) delenDetail.push(`${getalTekst(v)} %`);
    const rest = duurTekst(s("drogenRest")?.state);
    if (rest) delenDetail.push(t("nog {duur}", { duur: rest }));
  }

  // Een storing blijft altijd staan.
  const f = s("fout");
  let fout = "";
  if (heeftWaarde(f) && !GEEN_FOUT.has(String(f.state).toLowerCase())) {
    const beschrijving = String(f.attributes?.description ?? "").trim();
    fout = beschrijving || haWoord(vertaal, f, f.state) || opgeschoond(f.state);
  } else if (activiteit === "error") {
    fout = t("Storing");
  }

  let soort = "stil";
  if (!beschikbaar) soort = "dood";
  else if (fout) soort = "storing";
  else if (bezig) soort = "schoon";
  else if (activiteit === "returning") soort = "terug";
  else if (pauze) soort = "pauze";

  return {
    beschikbaar,
    activiteit,
    bezig,
    pauze,
    terug: activiteit === "returning",
    inStation: activiteit === "docked",
    tekst,
    detail: delenDetail.join(" · "),
    fout,
    batterij,
    laadt,
    soort,
  };
}

/** Van een soort naar een kleurnaam uit `TONES`. */
export const SOORT_TOON = {
  schoon: "accent",
  terug: "accent",
  pauze: "warn",
  storing: "bad",
  stil: "neutral",
  dood: "neutral",
};

/* ----------------------------------------------------------- bediening */

/**
 * De knoppen onder de kop: de hoofdknop en naar het station. Meer niet; dat is
 * wat de eigenaar noemde (start, pauze, terug naar het station).
 *
 * De hoofdknop is wat je nu het liefst doet: pauzeren als hij bezig is of
 * terugrijdt, hervatten als hij gepauzeerd staat, en anders starten. Zijn er
 * kamers gekozen en kent de integratie `vacuum_clean_segment`, dan start hij
 * alleen die.
 *
 * @param {object} st de stofzuiger
 * @param {{kamers?: number[], segmentDienst?: boolean}} [opties]
 * @returns {Array<{rol: string, label: string, icoon: string, oproep: Array|null, uit: boolean}>}
 */
export function bedieningKnoppen(st, { kamers = [], segmentDienst = false } = {}) {
  if (!st) return [];
  const id = st.entity_id;
  const dood = st.state === "unavailable";
  const roep = (dienst) => ["vacuum", dienst, { entity_id: id }];
  const uit = [];

  if (st.state === "cleaning" || st.state === "returning") {
    if (kan(st, KAN.PAUZE)) uit.push({ rol: "pauze", label: t("Pauzeren"), icoon: "pause", oproep: roep("pause") });
    else if (kan(st, KAN.STOP)) uit.push({ rol: "stop", label: t("Stoppen"), icoon: "stop", oproep: roep("stop") });
  } else if (st.state === "paused") {
    if (kan(st, KAN.START)) uit.push({ rol: "hervat", label: t("Hervatten"), icoon: "play", oproep: roep("start") });
  } else if (kamers.length && segmentDienst) {
    uit.push({
      rol: "kamers",
      label: tn(kamers.length, "Start {n} kamer", "Start {n} kamers"),
      icoon: "play",
      oproep: ["dreame_vacuum", "vacuum_clean_segment", { entity_id: id, segments: [...kamers] }],
    });
  } else if (kan(st, KAN.START)) {
    uit.push({ rol: "start", label: t("Starten"), icoon: "play", oproep: roep("start") });
  }

  if (kan(st, KAN.TERUG)) {
    uit.push({
      rol: "station",
      label: t("Naar station"),
      icoon: "house",
      oproep: roep("return_to_base"),
      uit: st.state === "docked" || st.state === "returning",
    });
  }
  return uit.map((k) => ({ ...k, uit: dood || Boolean(k.uit) }));
}

/* --------------------------------------------------------------- kamers */

/**
 * De kamers van de kaart die nu actief is.
 *
 * `dreame_vacuum` geeft per kaart een lijst (`rooms: {"Kaart 1": [...]}`), en
 * zegt in `selected_map` welke kaart de robot nu gebruikt. Een huis met drie
 * verdiepingen heeft drie kaarten; alleen de kamers van de actieve horen op de
 * kaart, want daar staat de robot.
 *
 * @returns {Array<{id: number, naam: string, icoon: string}>}
 */
export function kamersVan(st) {
  const a = st?.attributes ?? {};
  let lijst = a.rooms;
  if (lijst && !Array.isArray(lijst) && typeof lijst === "object") {
    const sleutels = Object.keys(lijst);
    const kaart = a.selected_map;
    lijst = kaart != null && Array.isArray(lijst[kaart]) ? lijst[kaart] : sleutels.length === 1 ? lijst[sleutels[0]] : null;
  }
  if (!Array.isArray(lijst)) return [];
  return lijst
    .filter((r) => r && r.id != null && getal(r.id) != null && String(r.name ?? "").trim())
    .map((r) => ({ id: Number(r.id), naam: String(r.name).trim(), icoon: typeof r.icon === "string" ? r.icon : "" }));
}

/** De kamers waar hij nu mee bezig is: de gekozen segmenten, en anders de huidige. */
export function actieveKamers(st) {
  const a = st?.attributes ?? {};
  if (st?.state !== "cleaning" && st?.state !== "paused") return new Set();
  const lijst = Array.isArray(a.active_segments) ? a.active_segments : [];
  const uit = new Set(lijst.map(Number).filter(Number.isFinite));
  if (!uit.size && getal(a.current_segment) != null) uit.add(Number(a.current_segment));
  return uit;
}

/* ----------------------------------------------------------- de keuzes */

/**
 * De keuzelijsten van de stofzuiger als rijen knoppen.
 *
 * `kort` is het woord op de knop als het volle woord niet past (vier knoppen
 * naast elkaar op een telefoon); het volle woord staat in de `title` en de
 * `aria-label`.
 */
export const KEUZES = {
  cleangenius: {
    naam: "CleanGenius",
    woorden: { off: nt("Uit"), routine_cleaning: nt("Routine"), deep_cleaning: nt("Grondig") },
  },
  // De stand terwijl CleanGenius aan staat: alleen deze twee.
  cgModus: {
    naam: nt("Stand"),
    woorden: { vacuum_and_mop: nt("Zuigen en dweilen"), mop_after_vacuum: nt("Dweilen na zuigen") },
    kort: { vacuum_and_mop: nt("Allebei"), mop_after_vacuum: nt("Na zuigen") },
  },
  modus: {
    naam: nt("Stand"),
    woorden: {
      sweeping: nt("Zuigen"),
      mopping: nt("Dweilen"),
      sweeping_and_mopping: nt("Zuigen en dweilen"),
      mopping_after_sweeping: nt("Dweilen na zuigen"),
    },
    kort: { sweeping_and_mopping: nt("Allebei"), mopping_after_sweeping: nt("Na zuigen") },
  },
  zuigkracht: {
    naam: nt("Zuigkracht"),
    woorden: { quiet: nt("Stil"), silent: nt("Stil"), standard: nt("Standaard"), strong: nt("Sterk"), turbo: nt("Turbo"), max: nt("Max") },
  },
  vochtigheid: {
    naam: nt("Dweilen"),
    woorden: { slightly_dry: nt("Iets droog"), moist: nt("Vochtig"), wet: nt("Nat") },
  },
};

/** In welke volgorde de rijen op de kaart staan. */
/**
 * Een woord uit `KEUZES` in de taal van nu. Met het context-Engels van een
 * stand (`tc`): "Stil" is hier "Quiet", zoals Dreame het zegt, en niet "Idle".
 */
const keuzeWoord = (nl) => tc("stand", nl);

export const KEUZE_VOLGORDE = ["cleangenius", "cgModus", "modus", "zuigkracht", "vochtigheid"];

/**
 * Eén rij knoppen voor een `select`, of null als er niets te kiezen valt.
 *
 * @param {object|null} st de select
 * @param {string} soort een sleutel uit `KEUZES`
 * @param {(st: object, waarde?: string) => string} [vertaal]
 */
export function keuzeRij(st, soort, vertaal) {
  const def = KEUZES[soort];
  if (!def || !heeftWaarde(st)) return null;
  const opties = (Array.isArray(st.attributes?.options) ? st.attributes.options : [])
    .map(String)
    .filter((o) => !LEEG.has(o));
  if (opties.length < 2) return null;
  return {
    id: st.entity_id,
    soort,
    naam: t(def.naam),
    gekozen: String(st.state),
    opties: opties.map((o) => {
      const voluit = def.woorden[o] ? keuzeWoord(def.woorden[o]) : keuzeNaam(o, haWoord(vertaal, st, o));
      return { waarde: o, label: def.kort?.[o] ? t(def.kort[o]) : voluit, voluit };
    }),
    oproep: (waarde) => ["select", "select_option", { entity_id: st.entity_id, option: waarde }],
  };
}

/**
 * De zuigkracht van de stofzuiger zelf (`fan_speed_list`), voor een merk
 * zonder select. Alleen als hij `FAN_SPEED` kan.
 */
export function zuigkrachtVanStofzuiger(st) {
  const lijst = st?.attributes?.fan_speed_list;
  if (!kan(st, KAN.ZUIGKRACHT) || !Array.isArray(lijst) || lijst.length < 2 || st.state === "unavailable") return null;
  const woorden = KEUZES.zuigkracht.woorden;
  return {
    id: st.entity_id,
    soort: "zuigkracht",
    naam: t(KEUZES.zuigkracht.naam),
    gekozen: String(st.attributes.fan_speed ?? ""),
    opties: lijst.map(String).map((o) => {
      const voluit = woorden[o.toLowerCase()] ? keuzeWoord(woorden[o.toLowerCase()]) : keuzeNaam(o);
      return { waarde: o, label: voluit, voluit };
    }),
    oproep: (waarde) => ["vacuum", "set_fan_speed", { entity_id: st.entity_id, fan_speed: waarde }],
  };
}

/**
 * Alle rijen die op de kaart horen, in volgorde.
 *
 * De vochtigheid van de dweilpads zegt niets als hij alleen zuigt, en blijft
 * dan weg. Een select die de integratie op `unavailable` zet valt vanzelf weg:
 * zo staat er met CleanGenius aan alleen zijn eigen stand (`cgModus`), en
 * zonder CleanGenius de gewone stand, de zuigkracht en het dweilen.
 *
 * De zuigkracht van de stofzuiger zelf (`fan_speed`) is er alleen voor een
 * merk dat GEEN select heeft. Heeft hij er wel een en staat die op
 * `unavailable`, dan is dat met opzet (CleanGenius), en dan geen omweg.
 *
 * @param {object} hass met `states`
 * @param {string} id de stofzuiger
 * @param {object} delen uit `stofzuigerDelen`
 */
export function keuzeRijen(hass, id, delen, vertaal) {
  const rijen = {};
  for (const soort of KEUZE_VOLGORDE) {
    const st = delen?.[soort] ? hass?.states?.[delen[soort]] : null;
    rijen[soort] = keuzeRij(st, soort, vertaal);
  }
  if (!delen?.zuigkracht) rijen.zuigkracht ??= zuigkrachtVanStofzuiger(hass?.states?.[id]);
  if (rijen.modus?.gekozen === "sweeping") rijen.vochtigheid = null;
  return KEUZE_VOLGORDE.map((s) => rijen[s]).filter(Boolean);
}

/** Staat CleanGenius aan? Dan kiest hij zuigkracht en dweilen zelf. */
export const cleanGeniusAan = (rijen) => rijen.some((r) => r.soort === "cleangenius" && r.gekozen !== "off");

/* ------------------------------------------------------------- station */

/**
 * De watertanks en de stofzak: de eigenaar wil ze op de kaart zien, ook als ze
 * in orde zijn. Per sensor de woorden voor wat NIET in orde is; al het andere
 * wat er in `IN_ORDE` staat is "In orde".
 *
 * De waarschuwing over het water (`low_water_warning`) hoort bij de
 * schoonwatertank: "Bijna leeg" of "Op" komt daar te staan, ook als de tank
 * zelf "geplaatst" zegt.
 */
const TANKS = [
  ["schoonwater", nt("Schoon water"), { not_installed: nt("Niet geplaatst"), low_water: nt("Bijna leeg") }],
  ["vuilwater", nt("Vuil water"), { not_installed_or_full: nt("Vol of weg"), not_installed: nt("Niet geplaatst"), full: nt("Vol") }],
  ["stofzak", nt("Stofzak"), { not_installed: nt("Niet geplaatst"), check: nt("Controleren"), full: nt("Vol") }],
];

const WATER = {
  no_water_left: nt("Op"),
  no_water_left_dismiss: nt("Op"),
  no_water_left_after_clean: nt("Op"),
  no_water_for_clean: nt("Te weinig"),
  low_water: nt("Bijna leeg"),
  tank_not_installed: nt("Niet geplaatst"),
};

/** Wat in orde is, voor elke sensor van het station. */
const IN_ORDE = new Set(["installed", "active", "enabled", "no_warning", "idle", "ok", "normal"]);

/**
 * De drie knoppen van het station, met de woorden van de eigenaar:
 * zelfreiniging, drogen en leegzuigen. `actief` als het station dat nu doet.
 */
const STATION_KNOPPEN = [
  ["wassenKnop", nt("Reinigen"), "drop", (h) => h.basis === "washing"],
  ["drogenKnop", nt("Drogen"), "wind", (h) => h.basis === "drying" || h.drogen],
  ["legenKnop", nt("Leegzuigen"), "bin", (h) => h.legen === "active"],
];

/**
 * Het station: de tanks en de stofzak, en de knoppen. Heeft de stofzuiger geen
 * station (of geen van deze entiteiten), dan zijn beide lijsten leeg.
 *
 * @returns {{tanks: Array<{id: string, naam: string, tekst: string, ok: boolean}>,
 *            knoppen: Array<{rol: string, id: string, label: string, icoon: string, actief: boolean}>}}
 */
export function stationStand(hass, id, delen = {}, vertaal) {
  const s = (rol) => (delen[rol] ? hass?.states?.[delen[rol]] : null);
  const tanks = [];
  for (const [rol, naam, woorden] of TANKS) {
    const st = s(rol);
    if (!heeftWaarde(st)) continue;
    const v = String(st.state).toLowerCase();
    let tekst = IN_ORDE.has(v) ? "" : woorden[v] ? t(woorden[v]) : haWoord(vertaal, st, st.state) || opgeschoond(v);
    if (rol === "schoonwater" && !tekst) {
      const w = s("water");
      const wv = heeftWaarde(w) ? String(w.state).toLowerCase() : "";
      if (wv && !IN_ORDE.has(wv)) tekst = WATER[wv] ? t(WATER[wv]) : haWoord(vertaal, w, w.state) || opgeschoond(wv);
    }
    tanks.push({ id: st.entity_id, naam: t(naam), tekst: tekst || t("In orde"), ok: !tekst });
  }
  const hier = {
    basis: s("basis")?.state,
    legen: s("legen")?.state,
    drogen: hass?.states?.[id]?.attributes?.drying === true,
  };
  const knoppen = [];
  for (const [rol, label, icoon, actief] of STATION_KNOPPEN) {
    const st = s(rol);
    if (!st || st.state === "unavailable") continue;
    knoppen.push({ rol, id: st.entity_id, label: t(label), icoon, actief: Boolean(actief(hier)) });
  }
  return { tanks, knoppen };
}

/* ------------------------------------------------------------ onderhoud */

/**
 * De onderdelen die op de kaart komen, in deze volgorde. De eigenaar noemde er
 * vier (hoofd- en zijborstel, filter en sensoren); de wielen en de antikalk van
 * de X50 staan dus niet op de kaart, al meet hij ze wel.
 */
export const ONDERHOUD_NAMEN = {
  main_brush_left: nt("Hoofdborstel"),
  side_brush_left: nt("Zijborstel"),
  filter_left: nt("Filter"),
  sensor_dirty_left: nt("Sensoren"),
};

const VOLGORDE = Object.keys(ONDERHOUD_NAMEN);
function volgorde(tk) {
  const i = VOLGORDE.indexOf(tk);
  return i < 0 ? VOLGORDE.length : i;
}

/** Onder dit percentage is een onderdeel aan de beurt. */
export const ONDERHOUD_GRENS = 10;

/** Uren of dagen als tekst: "8 dagen", "23 uur". */
function restTekst(st) {
  const n = getal(st?.state);
  if (n == null || n < 0) return "";
  const eenheid = String(st.attributes?.unit_of_measurement ?? "").toLowerCase();
  if (eenheid === "d") return n === 1 ? t("{n} dag", { n: 1 }) : t("{n} dagen", { n: Math.round(n) });
  if (eenheid === "h") return n >= 48 ? t("{n} dagen", { n: Math.round(n / 24) }) : t("{u} uur", { u: Math.round(n) });
  if (eenheid === "min") return duurTekst(n);
  return "";
}

/**
 * De onderdelen, met hoeveel er nog over is.
 *
 * `toon` is `warn` onder de grens en `bad` op nul: dat is status, en mag dus
 * de kleur van de kaart dragen. Het GETAL blijft in neutrale inkt; de kleur
 * zit in het balkje.
 *
 * @returns {Array<{id: string, naam: string, procent: number, rest: string, toon: string|null}>}
 */
export function onderhoudLijst(hass, delen = {}) {
  const uit = [];
  for (const { id, tk } of delen.onderhoud ?? []) {
    const naam = ONDERHOUD_NAMEN[tk];
    if (!naam) continue;
    const st = hass?.states?.[id];
    const procent = heeftWaarde(st) ? getal(st.state) : null;
    if (procent == null) continue;
    const rest = restTekst(hass?.states?.[delen.restTijd?.[tk]]);
    const toon = procent <= 0 ? "bad" : procent <= ONDERHOUD_GRENS ? "warn" : null;
    uit.push({ id, naam: t(naam), procent: Math.max(0, Math.min(100, procent)), rest, toon });
  }
  return uit;
}

/* -------------------------------------------------------- de kaart (map) */

/**
 * Het plaatje van de live kaart, of "".
 *
 * Een camera (of image) heeft zijn adres in `entity_picture`, met een token en
 * een `v=` die verandert zodra de kaart verandert: tijdens het schoonmaken
 * zie je hem dus meelopen zonder dat de kaart iets hoeft te vragen.
 */
export function kaartBeeld(hass, kaartId) {
  const st = kaartId ? hass?.states?.[kaartId] : null;
  if (!st || st.state === "unavailable") return "";
  const pic = st.attributes?.entity_picture;
  return typeof pic === "string" && pic ? pic : "";
}

/* --------------------------------------------------------------- foto's */

export { AFBEELDINGEN_BASIS };

/**
 * De merken en hun types, elk met een productfoto. De regels (wat
 * Automatisch kiest, wat een eigen afbeelding doet) staan in productfoto.js;
 * de warmtepompboiler deelt ze.
 *
 * Een type erbij is één regel hier plus een WebP onder
 * `afbeeldingen/robotstofzuigers/` (en die naam in `VASTE_WEBP` van
 * `tests/test_afbeeldingen.py`). Een tweede Dreame met een onbekende code krijgt
 * het icoon tot hij hier staat.
 */
export const STOFZUIGERS = {
  dreame: {
    label: "Dreame",
    fabrikant: "dreame",
    modellen: {
      x50_ultra_complete: {
        label: "X50 Ultra Complete",
        pad: "robotstofzuigers/dreame-x50-ultra-complete.webp",
        codes: ["dreame.vacuum.r5048h"],
      },
      // De eigenaar op 15 oktober 2026, via de beheersessie: de r9419h is de
      // L40s Pro Ultra. De code staat nergens online; dit is zijn woord.
      l40s_pro_ultra: {
        label: "L40s Pro Ultra",
        pad: "robotstofzuigers/dreame-l40s-pro-ultra.webp",
        codes: ["dreame.vacuum.r9419h"],
      },
    },
  },
};

/** Merk en type bij een apparaat uit `hass.devices`, of null. */
export const typeBijApparaat = (apparaat, lijst = STOFZUIGERS) => typeBij(apparaat, lijst);

/** Het adres van de afbeelding op de kaart, of "". Zie `productAfbeelding`. */
export const stofzuigerAfbeelding = (config, apparaat, lijst = STOFZUIGERS) => productAfbeelding(config, apparaat, lijst);

/** De keuzes voor Merk in de editor. */
export const merkKeuzes = (lijst = STOFZUIGERS) => merken(lijst);

/** De keuzes voor Type bij een merk. */
export const typeKeuzes = (merk, lijst = STOFZUIGERS) => types(merk, lijst);

/* ---------------------------------------------------------- de blokken */

/** De blokken onder de bediening, in volgorde, met hun naam in de editor. */
export const BLOKKEN = [
  { value: "kaart", label: nt("Kaart van het huis") },
  { value: "kamers", label: nt("Kamers") },
  { value: "modus", label: nt("Stand, zuigkracht, dweilen en CleanGenius") },
  { value: "station", label: nt("Station") },
  { value: "onderhoud", label: nt("Onderhoud") },
];

/** Staat dit blok aan? `verberg` is een lijst; wat er niet in staat, staat aan. */
export const blokAan = (config, blok) => !(Array.isArray(config?.verberg) && config.verberg.includes(blok));
