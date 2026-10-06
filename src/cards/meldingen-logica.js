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
  return `${namen.slice(0, -1).join(", ")} en ${namen[namen.length - 1]}`;
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
    buiten?.datum === isoDag(dag) ? ` · staat buiten${door ? ` (${door})` : ""}` : "";

  if (v.length) return `Vandaag ${opsomming(v)}${staatBuiten(nu)}`;
  if (m.length) {
    const gezet = staatBuiten(morgenDag);
    if (gezet) return `Morgen ${opsomming(m)}${gezet}`;
    // Al verstuurd: dan is "melding om 22:00" niet waar, want er komt vanavond
    // geen tweede (zie de kop van meldingen/motor.py). Gemeld op 6 oktober
    // 2026: hij zette de tijd op 22:00 en wachtte op een melding die niet kon
    // komen, terwijl hier "melding om 22:00" stond.
    if (verstuurd) return `Morgen ${opsomming(m)} · melding verstuurd`;
    const tijd = tijdKort(tijdMorgen);
    return `Morgen ${opsomming(m)}${tijd ? ` · melding om ${tijd}` : ""}`;
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
 * Voorlopig één. De kaart is sinds 0.50.0 ALGEMEEN: hij toont de personen, en
 * wat iemand kan krijgen staat in de pop-up achter het potlood. Gevraagd op
 * 26 september 2026: *"Nu staat daar alleen afval meldingen dan maar in de
 * toekomst moeten er meerdere dingen bij komen."* Een nieuwe soort is een regel
 * hier, een schakelaar in de editor, en de serverkant die hem verstuurt.
 */
export const SOORTEN = [{ id: "afval", naam: "Afvalmeldingen", icoon: "bin" }];

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
export function afvalRegel({ config, stand, vandaag, morgen, door, nu = new Date() } = {}) {
  if (stand && !stand.bekend) return "Actief zodra het dashboard is opgeslagen";
  if (!config?.afval_vandaag && !config?.afval_morgen) return "Nog geen afvalsensor gekozen";
  // De tijden die de SERVER gebruikt gaan voor die van deze kaart. Staat
  // dezelfde kaart op twee dashboards met andere tijden, dan geldt er één, en
  // de andere kaart hoort niet te beweren dat zijn tijd geldt.
  const tijdMorgen = tijdKort(stand?.tijden?.morgen) || tijdKort(config.tijd_morgen) || "19:30";
  const tijdVandaag = tijdKort(stand?.tijden?.vandaag) || tijdKort(config.tijd_vandaag) || "07:30";
  const verstuurd = stand?.verstuurd?.morgen === isoDag(nu);
  const wat = kopRegel({ vandaag, morgen, tijdMorgen, buiten: stand?.buiten, door, verstuurd, nu });
  if (wat) return wat;
  const momenten = [
    config.afval_morgen ? `de avond ervoor om ${tijdMorgen}` : "",
    config.afval_vandaag ? `de ochtend zelf om ${tijdVandaag}` : "",
  ].filter(Boolean);
  const zin = momenten.join(" en ");
  return zin[0].toUpperCase() + zin.slice(1);
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
    return { tekst: `Verstuurd naar ${naam}: “${uitkomst.titel}”. Kijk op de telefoon.`, fout: false };
  }
  if (uitkomst?.zonder_telefoon?.length) {
    return { tekst: `Niet verstuurd: geen werkende telefoon gevonden voor ${naam}.`, fout: true };
  }
  return { tekst: "Niet verstuurd.", fout: true };
}
