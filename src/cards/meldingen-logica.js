/**
 * Wat de meldingenkaart zegt, los van hoe hij eruitziet.
 *
 * Het versturen gebeurt aan de serverkant (`custom_components/.../meldingen/`),
 * want om 07:30 heeft niemand een dashboard open. De kaart laat zien wie er aan
 * staat en wat er komt. Voor dat laatste leest hij dezelfde afvalsensoren, met
 * DEZELFDE regels als `meldingen/afval.py`: wat de kaart "Morgen GFT" noemt,
 * hoort de telefoon ook zo te zeggen.
 *
 * Geen DOM en geen `hass`, zodat het in een gewone Node-test past.
 */

import { nt, t } from "../taal.js";

/** Wat een ophaalsensor zegt als er niets is. Zie `GEEN` in afval.py. */
const GEEN = new Set([
  "", "geen", "none", "unknown", "unavailable", "-", "nee", "niets", "no",
  "false", "off", "0", "geen afval", "geen ophaling",
]);

const NAMEN = {
  gft: "GFT", pmd: "PMD", kca: "KCA", pbd: "PBD",
  papier: "Papier", "oud papier": "Oud papier", restafval: "Restafval", rest: "Restafval",
  textiel: "Textiel", kerstbomen: "Kerstbomen", kerstboom: "Kerstboom", glas: "Glas",
  plastic: "Plastic", grofvuil: "Grofvuil", snoeiafval: "Snoeiafval",
};

const GEEN_SOORT = /^[\d\s:./-]+$/;
const SCHEIDING = /\s*(?:,|;|\/|&|\+|\ben\b|\band\b)\s*/i;

/** De soorten afval in deze toestand, netjes geschreven. Leeg = niets. */
export function afvalSoorten(toestand) {
  const tekst = String(toestand ?? "").trim();
  if (GEEN.has(tekst.toLowerCase()) || GEEN_SOORT.test(tekst)) return [];
  const uit = [];
  for (const ruw of tekst.split(SCHEIDING)) {
    const stuk = ruw.trim();
    if (!stuk || GEEN.has(stuk.toLowerCase()) || GEEN_SOORT.test(stuk)) continue;
    let naam = NAMEN[stuk.toLowerCase()];
    if (!naam) naam = stuk[0] === stuk[0].toUpperCase() ? stuk : stuk[0].toUpperCase() + stuk.slice(1);
    if (!uit.includes(naam)) uit.push(naam);
  }
  return uit;
}

/** "GFT", "GFT en Papier", "GFT, PMD en Papier". */
export function opsomming(namen) {
  if (!namen?.length) return "";
  if (namen.length === 1) return namen[0];
  return `${namen.slice(0, -1).join(", ")} ${t("en")} ${namen[namen.length - 1]}`;
}

/** "19:30:00" of "7:30" als "19:30" / "07:30", of "". */
export function tijdKort(tijd) {
  const m = String(tijd ?? "").match(/^\s*(\d{1,2}):(\d{2})/);
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return "";
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

/** Een datum als "2026-09-27", in lokale tijd -- zo schrijft de server hem ook. */
export const isoDag = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * De regel onder de titel: wat er komt, en of het al buiten staat.
 *
 * Leeg als er vandaag en morgen niets opgehaald wordt. Een zin die zegt dat er
 * niets is, maakt de kaart alleen hoger (zie CLAUDE.md, *Vormregels*).
 *
 * @param {object} p
 * @param {string} [p.vandaag]  de toestand van de sensor voor vandaag
 * @param {string} [p.morgen]   idem voor morgen
 * @param {string} [p.tijdMorgen] wanneer de avondmelding komt
 * @param {{datum: string}|null} [p.buiten] van de server: wie tikte "Staat buiten"
 * @param {string} [p.door]     de naam van wie dat deed
 * @param {boolean} [p.verstuurd] is de avondmelding van vandaag al uitgegaan?
 * @param {Date} [p.nu]
 */
export function kopRegel({ vandaag, morgen, tijdMorgen, buiten, door, verstuurd = false, nu = new Date() } = {}) {
  const v = afvalSoorten(vandaag);
  const m = afvalSoorten(morgen);
  const morgenDag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + 1);
  const staatBuiten = (dag) =>
    buiten?.datum === isoDag(dag) ? ` · ${door ? t("staat buiten ({door})", { door }) : t("staat buiten")}` : "";

  if (v.length) return `${t("Vandaag {wat}", { wat: opsomming(v) })}${staatBuiten(nu)}`;
  if (m.length) {
    const gezet = staatBuiten(morgenDag);
    const morgenWat = t("Morgen {wat}", { wat: opsomming(m) });
    if (gezet) return `${morgenWat}${gezet}`;
    // Al verstuurd: dan is "melding om 22:00" niet waar, want er komt vanavond
    // geen tweede (zie de kop van meldingen/motor.py). Gemeld op 6 oktober
    // 2026: hij zette de tijd op 22:00 en wachtte op een melding die niet kon
    // komen, terwijl hier "melding om 22:00" stond.
    if (verstuurd) return `${morgenWat} · ${t("melding verstuurd")}`;
    const tijd = tijdKort(tijdMorgen);
    return `${morgenWat}${tijd ? ` · ${t("melding om {tijd}", { tijd })}` : ""}`;
  }
  return "";
}

/**
 * Staat deze persoon aan? Wie de server nog niet kent: ja.
 *
 * Zo staat hij ook aan de serverkant (`MeldingOpslag.aan`). Een nieuwe persoon
 * die je toevoegt, wil je een melding laten krijgen -- anders had je hem niet
 * toegevoegd.
 */
export const staatAan = (stand, persoon) => stand?.aan?.[persoon] ?? true;

/** De personen uit de config: alleen `person.*`, zonder dubbelen. */
export function personenUit(config) {
  const lijst = Array.isArray(config?.personen)
    ? config.personen
    : typeof config?.personen === "string"
      ? [config.personen]
      : [];
  return [...new Set(lijst.filter((p) => typeof p === "string" && p.startsWith("person.")))];
}

/**
 * De soorten meldingen, in de volgorde waarin ze in de pop-up staan.
 *
 * Afval, en sinds 0.85.0 de robotstofzuiger. De kaart is sinds 0.50.0 ALGEMEEN: hij toont de personen, en
 * wat iemand kan krijgen staat in de pop-up achter het potlood. Gevraagd op
 * 26 september 2026: *"Nu staat daar alleen afval meldingen dan maar in de
 * toekomst moeten er meerdere dingen bij komen."* Een nieuwe soort is een regel
 * hier, een schakelaar in de editor, en de serverkant die hem verstuurt.
 */
export const SOORTEN = [
  { id: "afval", naam: nt("Afvalmeldingen"), icoon: "bin" },
  // Sinds 0.85.0. Wat er gemeld wordt staat in meldingen/stofzuiger.py.
  { id: "stofzuiger", naam: nt("Robotstofzuiger"), icoon: "stofzuiger" },
];

/**
 * Waarover de robotstofzuiger meldt, in de volgorde van de editor. Dezelfde
 * sleutels als `GEBEURTENISSEN` in meldingen/stofzuiger.py. `kort` is het
 * woord in de regel onder de soort in de pop-up.
 */
export const STOFZUIGER_GEBEURTENISSEN = [
  { id: "klaar", naam: nt("Klaar met schoonmaken"), kort: nt("klaar") },
  { id: "storing", naam: nt("Storing"), kort: nt("storing") },
  { id: "station", naam: nt("Water en stofzak"), kort: nt("tanks") },
  { id: "onderhoud", naam: nt("Onderhoud"), kort: nt("onderhoud") },
];

/** De gekozen gebeurtenissen; zonder keuze alle, net als `stofzuiger_uit` in kaarten.py. */
export function stofzuigerGebeurtenissen(config) {
  const gekozen = config?.stofzuiger_meldingen;
  if (!Array.isArray(gekozen)) return STOFZUIGER_GEBEURTENISSEN.map((g) => g.id);
  return STOFZUIGER_GEBEURTENISSEN.map((g) => g.id).filter((id) => gekozen.includes(id));
}

/** De robots op de kaart: alleen `vacuum.*`, zonder dubbelen. */
export function stofzuigersUit(config) {
  const r = config?.stofzuigers;
  const lijst = Array.isArray(r) ? r : typeof r === "string" ? [r] : [];
  return [...new Set(lijst.filter((s) => typeof s === "string" && s.startsWith("vacuum.")))];
}

/**
 * Wat deze persoon van de robotstofzuiger wil (sinds 0.86.0).
 *
 * De kaart zegt wat er te KIEZEN is (`stofzuiger_meldingen` en `stofzuigers`);
 * ieder kiest daar zelf uit in de pop-up. Gevraagd op 25 oktober 2026: *"ik wil
 * dat de gebruiker ook zelf kan kiezen welke meldingen hij van de stofzuiger
 * wilt ontvangen."* Een lijst die de persoon nooit aanraakte is alles, net als
 * `_ontvangers` in meldingen/motor.py.
 *
 * @returns {{gebeurtenissen: string[], robots: string[]}} wat hij krijgt,
 *   binnen wat de kaart aanbiedt, in de volgorde van de kaart
 */
export function persoonKeuze(config, stand, persoon) {
  const keuze = stand?.keuzes?.[persoon] ?? {};
  const aangeboden = stofzuigerGebeurtenissen(config);
  const robots = stofzuigersUit(config);
  return {
    gebeurtenissen: Array.isArray(keuze.gebeurtenissen)
      ? aangeboden.filter((g) => keuze.gebeurtenissen.includes(g))
      : aangeboden,
    robots: Array.isArray(keuze.robots) ? robots.filter((r) => keuze.robots.includes(r)) : robots,
  };
}

/**
 * De nieuwe lijst na één tik op een keuze, of `null` als dat weer "alles" is.
 *
 * `null` en niet de volle lijst: komt er later een robot of een soort bij op de
 * kaart, dan krijgt wie alles had die er vanzelf bij.
 *
 * @param {string[]} alle wat er te kiezen is
 * @param {string[]} nu wat er nu gekozen is
 * @param {string} waarde waarop getikt is
 * @param {boolean} aan
 */
export function nieuweKeuze(alle, nu, waarde, aan) {
  const nieuw = alle.filter((x) => (x === waarde ? aan : nu.includes(x)));
  return nieuw.length === alle.length ? null : nieuw;
}

/**
 * De regel onder de robotstofzuiger in de pop-up: waarover, en van welke robot.
 *
 * "Klaar, storing en onderhoud · X50 Ultra Complete en dreame boven". Er is
 * geen tijd: deze melding komt als er iets gebeurt. Met `persoon` (sinds
 * 0.86.0) wat die persoon zelf koos.
 *
 * @param {object} p
 * @param {object} p.config
 * @param {object} [p.stand] van de server
 * @param {string[]} [p.namen] de namen van de robots, in de volgorde van de config
 */
export function stofzuigerRegel({ config, stand, namen = [], persoon } = {}) {
  if (stand && !stand.bekend) return t("Actief zodra het dashboard is opgeslagen");
  if (!stofzuigersUit(config).length) return t("Nog geen stofzuiger gekozen");
  // Met een persoon: wat HIJ gekozen heeft. `namen` horen dan bij zijn robots.
  const ids = persoon ? persoonKeuze(config, stand, persoon).gebeurtenissen : stofzuigerGebeurtenissen(config);
  if (!ids.length) return t("Niets gekozen om te melden");
  const woorden = STOFZUIGER_GEBEURTENISSEN.filter((g) => ids.includes(g.id)).map((g) => t(g.kort));
  const wat = opsomming(woorden);
  const zin = wat[0].toUpperCase() + wat.slice(1);
  return namen.length ? `${zin} · ${opsomming(namen)}` : zin;
}

/**
 * Staat deze soort aan op deze kaart?
 *
 * Een `true` of `false` onder de naam van de soort beslist. Staat die er niet,
 * dan is de kaart van vóór 0.50.0: toen WAS hij één soort, en die stond in
 * `soort` -- met afval als standaard. Zo leest `soort_aan` in kaarten.py het ook,
 * en dat moet gelijk blijven: wat de kaart als aan toont, hoort de server te
 * versturen.
 */
export function soortAan(config, soort) {
  const waarde = config?.[soort];
  if (typeof waarde === "boolean") return waarde;
  return String(config?.soort || "afval") === soort;
}

/** De soorten die op deze kaart aan staan. */
export const soortenVan = (config) => SOORTEN.filter((s) => soortAan(config, s.id));

/**
 * Het id waaronder de server de melding van deze soort kent.
 *
 * Voor afval is dat `id` uit de config of anders "afval", zoals het altijd was:
 * onder die naam staat bij hem al opgeslagen wie er aan en uit staat. Zie
 * `melding_uit` in kaarten.py.
 */
export const meldingId = (config, soort = "afval") =>
  soort === "afval" ? String(config?.id || "").trim() || "afval" : soort;

/**
 * Krijgt deze persoon iets van deze kaart?
 *
 * Voor het icoon op de rij: alleen het icoon draagt de toestand. Staat er geen
 * enkele soort aan op de kaart, dan krijgt niemand iets -- en dat hoort de rij
 * ook te zeggen.
 *
 * @param {Record<string, object>} standen per soort de stand van de server
 * @param {string[]} soorten de soorten op deze kaart
 * @param {string} persoon
 */
export function krijgtIets(standen, soorten, persoon) {
  return soorten.some((soort) => staatAan(standen?.[soort], persoon));
}

/**
 * De regel onder een soort in de pop-up: wat er komt, of wat er ontbreekt.
 *
 * Voor afval is dat dezelfde regel die eerst in de kop van de kaart stond
 * (`kopRegel`), en anders de tijden -- zodat er altijd staat WANNEER de melding
 * komt. Kent de server de kaart nog niet, dan staat dat er: in de editor is dat
 * het eerste wat je wilt weten.
 */
export function afvalRegel({ config, stand, vandaag, morgen, door, persoon, nu = new Date() } = {}) {
  if (stand && !stand.bekend) return t("Actief zodra het dashboard is opgeslagen");
  if (!config?.afval_vandaag && !config?.afval_morgen) return t("Nog geen afvalsensor gekozen");
  // Met een persoon (0.87.0): alleen de momenten die hij koos, en geen "melding
  // om" als hij voor de bakken van morgen niets krijgt.
  const keuze = persoon ? afvalKeuze(config, stand, persoon) : null;
  if (keuze && !keuze.momenten.length) return t("Niets gekozen om te melden");
  const wil = (m) => !keuze || keuze.momenten.includes(m);
  const niet = new Set((keuze?.bakkenNiet ?? []).map((b) => b.toLowerCase()));
  const krijgtMorgen = wil("morgen") && afvalSoorten(morgen).some((b) => !niet.has(b.toLowerCase()));
  // De tijden die de SERVER gebruikt gaan voor die van deze kaart. Staat
  // dezelfde kaart op twee dashboards met andere tijden, dan geldt er één, en
  // de andere kaart hoort niet te beweren dat zijn tijd geldt.
  const tijdMorgen = tijdKort(stand?.tijden?.morgen) || tijdKort(config.tijd_morgen) || "19:30";
  const tijdVandaag = tijdKort(stand?.tijden?.vandaag) || tijdKort(config.tijd_vandaag) || "07:30";
  const verstuurd = stand?.verstuurd?.morgen === isoDag(nu);
  const wat = kopRegel({
    vandaag, morgen, tijdMorgen: krijgtMorgen ? tijdMorgen : "", buiten: stand?.buiten, door, verstuurd: verstuurd && krijgtMorgen, nu,
  });
  if (wat) return wat;
  const momenten = [
    config.afval_morgen && wil("morgen") ? t("de avond ervoor om {tijd}", { tijd: tijdMorgen }) : "",
    config.afval_vandaag && wil("vandaag") ? t("de ochtend zelf om {tijd}", { tijd: tijdVandaag }) : "",
  ].filter(Boolean);
  const zin = momenten.join(` ${t("en")} `);
  return zin[0].toUpperCase() + zin.slice(1);
}

/* ------------------------------------------------- afval per persoon (0.87.0) */

/** De twee momenten van afval, in de volgorde van de pop-up. */
export const AFVAL_MOMENTEN = [
  { id: "morgen", naam: nt("De avond ervoor") },
  { id: "vandaag", naam: nt("De ochtend zelf") },
];

/** De momenten die op deze kaart een sensor hebben. */
export const afvalMomenten = (config) =>
  AFVAL_MOMENTEN.map((m) => m.id).filter((id) => (id === "morgen" ? config?.afval_morgen : config?.afval_vandaag));

/**
 * De bakken om uit te kiezen: eerst wat in de editor staat (`afval_bakken`),
 * dan wat de server de sensor ooit zag noemen (`stand.bakken`). Netjes
 * geschreven, zoals in de melding.
 */
export function afvalBakken(config, stand) {
  const rauw = config?.afval_bakken;
  const lijst = Array.isArray(rauw) ? rauw : typeof rauw === "string" ? [rauw] : [];
  const uit = [];
  for (const naam of [...lijst.flatMap((b) => afvalSoorten(b)), ...(stand?.bakken ?? [])]) {
    if (!uit.some((x) => x.toLowerCase() === String(naam).toLowerCase())) uit.push(String(naam));
  }
  return uit;
}

/**
 * Wat deze persoon van afval wil. Gevraagd op 25 oktober 2026, na hetzelfde
 * voor de stofzuiger: *"ja doe dat ook voor afval"*.
 *
 * `momenten` is wat hij krijgt (niets gekozen: allebei). Bij de bakken wordt
 * bewaard wat hij NIET wil (`bakken_niet`): een bak die later opduikt, krijgt
 * hij gewoon. Zo filtert de server ook (`async_verstuur` in meldingen/motor.py).
 *
 * @returns {{momenten: string[], bakkenNiet: string[]}}
 */
export function afvalKeuze(config, stand, persoon) {
  const keuze = stand?.keuzes?.[persoon] ?? {};
  const alle = afvalMomenten(config);
  return {
    momenten: Array.isArray(keuze.momenten) ? alle.filter((m) => keuze.momenten.includes(m)) : alle,
    bakkenNiet: Array.isArray(keuze.bakken_niet) ? keuze.bakken_niet.map(String) : [],
  };
}

/**
 * De nieuwe lijst "niet" na een tik op een bak, of `null` als hij weer alles wil.
 *
 * @param {string[]} niet wat hij nu niet wil
 * @param {string} bak
 * @param {boolean} aan wil hij hem nu wel?
 */
export function nieuwNiet(niet, bak, aan) {
  const zonder = niet.filter((b) => b.toLowerCase() !== bak.toLowerCase());
  const nieuw = aan ? zonder : [...zonder, bak];
  return nieuw.length ? nieuw : null;
}

/**
 * Wat er onder de proefknop komt te staan, uit het antwoord van de server.
 *
 * De server geeft `{verstuurd, zonder_telefoon, titel}` terug, of `{reden}` als
 * hij niet kon (zie `async_verstuur` in meldingen/motor.py). "Verstuurd" is wat
 * Home Assistant aan de telefoon doorgaf; of hij aankwam weet niemand, en daar
 * hoort de klant zelf naar te kijken.
 *
 * @param {object} uitkomst het antwoord van `meldingen/proef`
 * @param {string} naam     de voornaam van de persoon
 * @returns {{tekst: string, fout: boolean}}
 */
export function proefUitkomst(uitkomst, naam) {
  if (uitkomst?.reden) return { tekst: uitkomst.reden, fout: true };
  if (uitkomst?.verstuurd?.length) {
    return { tekst: t("Verstuurd naar {naam}: “{titel}”. Kijk op de telefoon.", { naam, titel: uitkomst.titel }), fout: false };
  }
  if (uitkomst?.zonder_telefoon?.length) {
    return { tekst: t("Niet verstuurd: geen werkende telefoon gevonden voor {naam}.", { naam }), fout: true };
  }
  return { tekst: t("Niet verstuurd."), fout: true };
}
