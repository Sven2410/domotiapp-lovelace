/**
 * Het rekenwerk van het infoscherm, zonder DOM: openingstijden, wat er nú
 * geldig is, de volgorde van het nieuws, de klok, en sinds ronde 2 het raster
 * van het welkomscherm.
 *
 * Los van de kaart zodat het in een gewone unittest kan (CLAUDE.md: geen
 * jsdom). De serverkant heeft van `openingVandaag` een tweeling in
 * `infoscherm/store.py` (`vandaag_open`); dit is de kant die het scherm
 * tekent, die de kant die de nacht bewaakt. Zo ook `overlapt` en
 * `standaardIndeling`: de server weigert wat hier al niet mag.
 */

export const DAGEN = ["ma", "di", "wo", "do", "vr", "za", "zo"];

export const DAGNAMEN = {
  ma: "maandag",
  di: "dinsdag",
  wo: "woensdag",
  do: "donderdag",
  vr: "vrijdag",
  za: "zaterdag",
  zo: "zondag",
};

const MAANDEN = ["januari", "februari", "maart", "april", "mei", "juni", "juli",
  "augustus", "september", "oktober", "november", "december"];
const MAANDEN_KORT = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

const twee = (n) => String(n).padStart(2, "0");

/** `Date` -> "ma".."zo". JavaScript telt vanaf zondag, wij vanaf maandag. */
export const dagSleutel = (d) => DAGEN[(d.getDay() + 6) % 7];

/** Lokale datum als "JJJJ-MM-DD", zonder de UTC-verschuiving van toISOString. */
export const isoDatum = (d) => `${d.getFullYear()}-${twee(d.getMonth() + 1)}-${twee(d.getDate())}`;

export const klok = (d) => `${twee(d.getHours())}:${twee(d.getMinutes())}`;

/** Lokale datum én tijd als "JJJJ-MM-DDTUU:MM", voor mededelingen met een tijdstip. */
export const isoDatumTijd = (d) => `${isoDatum(d)}T${klok(d)}`;

export const datumLang = (d) =>
  `${DAGNAMEN[dagSleutel(d)]} ${d.getDate()} ${MAANDEN[d.getMonth()]}`;

/** "2026-09-20" -> "20 september". Voor een datum uit de opslag. */
export function datumKort(iso) {
  if (!iso) return "";
  const [, m, dg] = iso.split("-").map(Number);
  return `${dg} ${MAANDEN[m - 1]}`;
}

/** "ma", "di", ... voor een dagvoorspelling; "vandaag" en "morgen" met naam. */
export function dagKort(d, nu) {
  const iso = isoDatum(d);
  if (iso === isoDatum(nu)) return "vandaag";
  const morgen = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + 1);
  if (iso === isoDatum(morgen)) return "morgen";
  return DAGNAMEN[dagSleutel(d)];
}

/**
 * Geldt dit item nu? `van` en `tot` zijn beide inclusief; ontbreken ze, dan is
 * die kant open.
 *
 * Sinds ronde 3 mag een grens een TIJD dragen ("2026-09-20T12:00"); een kale
 * datum is de hele dag. `nu` mag een datum zijn ("2026-09-20", dan telt de dag)
 * of een datum met tijd (`isoDatumTijd`). Tekstvergelijking volstaat omdat
 * alles op dezelfde manier is opgeschreven: jaar-maand-dag, dan uur:minuut.
 */
export function geldigNu(item, nu) {
  const moment = nu.length === 10 ? `${nu}T00:00` : nu;
  const van = item?.van ? (item.van.length === 10 ? `${item.van}T00:00` : item.van) : null;
  const tot = item?.tot ? (item.tot.length === 10 ? `${item.tot}T23:59` : item.tot) : null;
  if (van && van > moment) return false;
  if (tot && tot < moment) return false;
  return true;
}

export const actieveMededelingen = (lijst, nu) =>
  (lijst ?? []).filter((m) => m.tekst && geldigNu(m, nu));

/**
 * De mededelingen die nog KOMEN: een `van` in de toekomst. Voor de pagina
 * Mededelingen (ronde 4), zodat de receptie op het scherm ziet wat er klaar
 * staat. Op volgorde van `van`.
 */
export function komendeMededelingen(lijst, nu) {
  const moment = nu.length === 10 ? `${nu}T00:00` : nu;
  return (lijst ?? [])
    .filter((m) => m.tekst && m.van && (m.van.length === 10 ? `${m.van}T00:00` : m.van) > moment)
    .sort((a, b) => String(a.van).localeCompare(String(b.van)));
}

/** "2026-09-20T12:00" of "2026-09-20" -> "20 september 12:00" / "20 september". */
export function datumTijdKort(iso) {
  if (!iso) return "";
  const [datum, tijd] = iso.split("T");
  return tijd ? `${datumKort(datum)} ${tijd}` : datumKort(datum);
}

/**
 * De periode van een mededeling in woorden: "tot en met 20 september",
 * "vanaf 20 september 12:00", "20 t/m 24 september", of leeg als hij altijd
 * geldt.
 */
export function mededelingPeriode(m) {
  const van = datumTijdKort(m?.van);
  const tot = datumTijdKort(m?.tot);
  if (van && tot) return `${van} t/m ${tot}`;
  if (van) return `vanaf ${van}`;
  if (tot) return `tot en met ${tot}`;
  return "";
}

/**
 * Het nieuws: alleen nog wat er van buiten komt, nieuwste eerst.
 *
 * Tot 0.37.0 stonden hier de berichten van het pand vóór de feeds. Sinds
 * ronde 3 zijn die mededelingen: *"Nieuws van het pand mag helemaal weg, dat
 * moet gewoon mededelingen worden."*
 */
export function nieuwsLijst(feeds) {
  return (feeds ?? [])
    .filter((n) => n.titel)
    .map((n) => ({ ...n, eigen: false }))
    .sort((a, b) => String(b.datum ?? "").localeCompare(String(a.datum ?? "")));
}

/* ------------------------------------------------------------ verjaardagen */

/**
 * De verjaardagen op volgorde van "hoe lang nog", vandaag eerst.
 *
 * Elk item krijgt `dagen` (0 = vandaag), `wanneer` ("vandaag", "morgen",
 * "za 12 sep") en `leeftijd` (het getal dat iemand WORDT; null als het jaar
 * niet getoond mag worden of niet ingevuld is). 29 februari valt in een
 * gewoon jaar op 1 maart.
 */
export function komendeVerjaardagen(lijst, nu) {
  const vandaag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
  const uit = [];
  for (const v of lijst ?? []) {
    if (!v?.naam || !v?.datum) continue;
    const [jaar, maand, dag] = v.datum.split("-").map(Number);
    if (!maand || !dag) continue;
    let volgende = new Date(vandaag.getFullYear(), maand - 1, dag);
    if (volgende < vandaag) volgende = new Date(vandaag.getFullYear() + 1, maand - 1, dag);
    const dagen = Math.round((volgende - vandaag) / 86400000);
    const leeftijd = v.jaar_tonen !== false && jaar > 1900 ? volgende.getFullYear() - jaar : null;
    uit.push({
      ...v,
      dagen,
      leeftijd,
      wanneer: dagen === 0 ? "vandaag" : dagen === 1 ? "morgen" : `${DAGEN[(volgende.getDay() + 6) % 7]} ${volgende.getDate()} ${MAANDEN_KORT[volgende.getMonth()]}`,
    });
  }
  return uit.sort((a, b) => a.dagen - b.dagen || a.naam.localeCompare(b.naam, "nl"));
}

/** "08:00 – 12:30, 13:30 – 17:00", of "gesloten". */
export const formatteerTijdvakken = (tijden) =>
  tijden?.length ? tijden.map(([a, b]) => `${a} – ${b}`).join(", ") : "gesloten";

/** De tijdvakken van een dag, met een uitzondering op die datum erin verwerkt. */
export function tijdenOp(praktijk, datum) {
  const iso = isoDatum(datum);
  let tijden = praktijk?.openingstijden?.[dagSleutel(datum)] ?? [];
  let reden = "";
  for (const u of praktijk?.uitzonderingen ?? []) {
    if (u.datum === iso) {
      tijden = u.tijden ?? [];
      reden = u.reden ?? "";
    }
  }
  return { tijden, reden };
}

/**
 * Open op dit moment? Plus wat het scherm daarbij wil zeggen: tot hoe laat,
 * of wanneer weer.
 */
export function openingVandaag(praktijk, nu) {
  const { tijden, reden } = tijdenOp(praktijk, nu);
  const k = klok(nu);
  const vak = tijden.find(([a, b]) => a <= k && k < b);
  const later = tijden.find(([a]) => a > k);
  return {
    open: Boolean(vak),
    tot: vak ? vak[1] : null,
    straks: later ? later[0] : null,
    tijden,
    reden,
  };
}

/**
 * De eerstvolgende opening ná nu, tot twee weken vooruit.
 * @returns {{dag: string, tijd: string} | null}  dag is "morgen", "maandag", ...
 */
export function volgendeOpening(praktijk, nu) {
  const vandaag = openingVandaag(praktijk, nu);
  if (vandaag.straks) return { dag: "vandaag", tijd: vandaag.straks };
  for (let i = 1; i <= 14; i += 1) {
    const d = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + i);
    const { tijden } = tijdenOp(praktijk, d);
    if (tijden.length) {
      return { dag: i === 1 ? "morgen" : DAGNAMEN[dagSleutel(d)], tijd: tijden[0][0] };
    }
  }
  return null;
}

/** Zeven regels voor het blok Openingstijden, maandag eerst, vandaag gemarkeerd. */
export function openingsRegels(praktijk, nu) {
  const vandaag = dagSleutel(nu);
  return DAGEN.map((dag) => {
    const eigen = dag === vandaag ? tijdenOp(praktijk, nu) : null;
    const tijden = eigen ? eigen.tijden : praktijk?.openingstijden?.[dag] ?? [];
    return {
      dag,
      naam: DAGNAMEN[dag],
      tekst: formatteerTijdvakken(tijden),
      reden: eigen?.reden ?? "",
      vandaag: dag === vandaag,
    };
  });
}

/** Heeft de praktijk überhaupt openingstijden ingevuld? Anders geen blok. */
export const heeftOpeningstijden = (praktijk) =>
  DAGEN.some((dag) => (praktijk?.openingstijden?.[dag] ?? []).length > 0);

/**
 * Staat de verlichting op het scherm? Twee dingen: de installateur heeft
 * lampen gekozen (sinds ronde 3 weer in de kaartconfig; de kaart zet ze in
 * `installatie`), en de receptie heeft het niet uitgezet.
 */
export function verlichtingZichtbaar(stand) {
  if (!((stand?.installatie?.verlichting?.length ?? 0) > 0)) return false;
  return stand?.instellingen?.verlichting_tonen !== false;
}

/**
 * Welke pagina's er achter de koppen zitten. Welkom is het scherm zelf; de
 * rest is er alleen als er iets te tonen valt.
 */
export function paginas(stand, feeds, nu = null) {
  const uit = ["welkom"];
  if ((stand?.personen?.length ?? 0) > 0) uit.push("aanwezig");
  if (nu ? actieveMededelingen(stand?.mededelingen, nu).length > 0 : (stand?.mededelingen?.length ?? 0) > 0) uit.push("mededelingen");
  if ((feeds?.length ?? 0) > 0) uit.push("nieuws");
  if (stand?.installatie?.weer) uit.push("weer");
  if (stand?.installatie?.energie) uit.push("energie");
  if (verlichtingZichtbaar(stand)) uit.push("verlichting");
  if ((stand?.installatie?.agendas?.length ?? 0) > 0) uit.push("agenda");
  if ((stand?.verjaardagen?.length ?? 0) > 0) uit.push("verjaardagen");
  return uit;
}

/**
 * 'Sven Kool' -> 'SK', 'Dennis van den dam' -> 'DD'.
 *
 * De eerste letter van het EERSTE woord en de eerste letter van het LAATSTE
 * woord, hoofdletter of niet. Tot 0.36.0 telden alleen woorden met een
 * hoofdletter mee, en dan werd een tussenvoegsel in kleine letters
 * overgeslagen: 'van den dam' viel weg en er stond 'DE'. Gemeld op
 * 10 september 2026. Tweeling van `initialen` in store.py.
 */
export function initialen(naam) {
  const delen = String(naam ?? "").trim().split(/\s+/).filter(Boolean);
  if (!delen.length) return "?";
  if (delen.length === 1) return delen[0].slice(0, 2).toUpperCase();
  return (delen[0][0] + delen[delen.length - 1][0]).toUpperCase();
}

/** Personen per functie, in de volgorde waarin de functies voor het eerst voorkomen. */
export function groepeerOpFunctie(personen) {
  const groepen = new Map();
  for (const p of personen ?? []) {
    const sleutel = p.functie || "";
    if (!groepen.has(sleutel)) groepen.set(sleutel, []);
    groepen.get(sleutel).push(p);
  }
  return [...groepen].map(([functie, leden]) => ({ functie, personen: leden }));
}

/**
 * Aanwezig en afwezig uit elkaar, elk in de volgorde van het beheer.
 *
 * Gemeld op 10 september 2026: *"aanwezig en afwezig staan door elkaar heen"*.
 * De volgorde uit het beheer blijft binnen elke groep staan; alleen de groepen
 * komen los van elkaar.
 */
export function splitsAanwezig(personen) {
  const lijst = personen ?? [];
  return {
    aanwezig: lijst.filter((p) => p.aanwezig),
    afwezig: lijst.filter((p) => !p.aanwezig),
  };
}

/** Aanwezigen eerst, dan de rest, allebei in de volgorde van het beheer. */
export function aanwezigEerst(personen) {
  const { aanwezig, afwezig } = splitsAanwezig(personen);
  return [...aanwezig, ...afwezig];
}

/** "zojuist", "12 min geleden", "vandaag 09:30", "gisteren", "8 sep". */
export function relatieveTijd(iso, nu) {
  if (!iso) return "";
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return "";
  const min = Math.round((nu - t) / 60000);
  if (min < 1) return "zojuist";
  if (min < 60) return `${min} min geleden`;
  if (isoDatum(t) === isoDatum(nu)) return `vandaag ${klok(t)}`;
  const gisteren = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() - 1);
  if (isoDatum(t) === isoDatum(gisteren)) return `gisteren ${klok(t)}`;
  return `${t.getDate()} ${MAANDEN_KORT[t.getMonth()]}`;
}

/** Om de beurt een van de teksten; met één tekst altijd die ene. */
export const omDeBeurt = (lijst, tel) =>
  lijst?.length ? lijst[((tel % lijst.length) + lijst.length) % lijst.length] : "";

/**
 * De uitleg onder de klok in de nachtstand.
 *
 * "Gesloten · morgen open om 08:00", "Gesloten · Studiedag", of alleen
 * "Gesloten" als er de komende twee weken niets open is.
 */
export function geslotenRegel(praktijk, nu) {
  const vandaag = openingVandaag(praktijk, nu);
  const delen = ["Gesloten"];
  if (vandaag.reden) delen.push(vandaag.reden);
  const volgende = volgendeOpening(praktijk, nu);
  if (volgende) delen.push(`${volgende.dag} open om ${volgende.tijd}`);
  return delen.join(" · ");
}

/* ------------------------------------------------------------ het raster */

/**
 * Het welkomscherm is een raster van zes bij zes. De receptie sleept de
 * blokken in het beheer; het scherm tekent ze op precies die plek. Tweeling
 * van `KOLOMMEN`, `RIJEN` en `standaard_indeling` in store.py.
 */
export const KOLOMMEN = 6;
export const RIJEN = 6;

/**
 * Wat een blok is: de naam op de kop, het icoon, of er een pagina achter zit
 * (dan is de kop een knop), of het een aantal heeft, en de maat waarmee het
 * wordt toegevoegd.
 */
export const BLOK_INFO = {
  welkom: { naam: "Welkom", icoon: "house", pagina: null, aantal: false, maat: [6, 1] },
  weer: { naam: "Weer", icoon: "sun", pagina: "weer", aantal: false, maat: [2, 2] },
  mededeling: { naam: "Mededelingen", icoon: "bell", pagina: "mededelingen", aantal: false, maat: [2, 1] },
  openingstijden: { naam: "Openingstijden", icoon: "clock", pagina: null, aantal: false, maat: [2, 3] },
  aanwezig: { naam: "Aanwezig", icoon: "people", pagina: "aanwezig", aantal: true, maat: [2, 3] },
  nieuws: { naam: "Nieuws", icoon: "news", pagina: "nieuws", aantal: true, maat: [2, 4] },
  verlichting: { naam: "Verlichting", icoon: "bulb", pagina: "verlichting", aantal: true, maat: [2, 1] },
  agenda: { naam: "Agenda", icoon: "calendar", pagina: "agenda", aantal: true, maat: [2, 2] },
  verjaardagen: { naam: "Verjaardagen", icoon: "cake", pagina: "verjaardagen", aantal: true, maat: [2, 2] },
  energie: { naam: "Energie", icoon: "bolt", pagina: "energie", aantal: false, maat: [2, 2] },
};

/**
 * De blokken die een LIJST tonen (tegels, berichten, lampen, afspraken,
 * verjaardagen). Die schalen alleen met de breedte: een hoger blok toont
 * meer, geen groter. Alle andere blokken schalen met allebei.
 */
export const LIJSTBLOKKEN = new Set(["aanwezig", "nieuws", "verlichting", "agenda", "verjaardagen"]);

/* De schaal per breedte en per hoogte in rastercellen; 2 cellen is 1. */
const SCHAAL_BREEDTE = [0, 0.85, 1, 1.12, 1.25, 1.35, 1.45];
const SCHAAL_HOOGTE = [0, 0.8, 1, 1.15, 1.3, 1.4, 1.5];

/**
 * Hoe groot alles in een blok is, als factor bovenop de schermschaal.
 *
 * Gevraagd op 10 september 2026: *"alles van alle kaarten moet meegeschaald
 * worden als je ze kleiner en groter maakt."* Een blok van 2×2 is de maat 1;
 * breder of hoger wordt groter, smaller of lager kleiner. Een lijstblok
 * volgt alleen zijn breedte (zie `LIJSTBLOKKEN`); de rest het meetkundig
 * gemiddelde van breedte en hoogte, zodat een welkomblok van 6×1 niet
 * reusachtig wordt.
 */
export function blokSchaal(soort, w, h) {
  const bw = SCHAAL_BREEDTE[Math.min(KOLOMMEN, Math.max(1, Math.round(w) || 1))];
  const bh = SCHAAL_HOOGTE[Math.min(RIJEN, Math.max(1, Math.round(h) || 1))];
  const s = LIJSTBLOKKEN.has(soort) ? bw : Math.sqrt(bw * bh);
  return Math.round(s * 1000) / 1000;
}

/**
 * Hoeveel rijen van een lijst er in een blok passen, en hoe groot ze dan
 * worden.
 *
 * Gemeld op 10 september 2026 met een schermafdruk van het nieuws: zes
 * berichten met eronder een gat waar bijna een zevende in paste, en "toon"
 * op tien. *"Maak dan alles dezelfde grootte en passend; in dit geval moeten
 * er 7 passen."* Dus: eerst tellen hoeveel rijen er op hun eigen maat
 * passen. Blijft er méér dan een deel van een rij over (`drempel`), dan gaat
 * alles een tikje kleiner (`pas` < 1) zodat er een rij bij past -- maar
 * nooit kleiner dan `minPas`. Wat er dan staat wordt over de hoogte
 * uitgesmeerd: elke rij even hoog, zonder gat onderaan.
 *
 * Alles binnen een blok is evenredig met de schaal (elke maat is
 * `calc(px * var(--s))`), dus een rij van `hoogte` wordt bij `pas` precies
 * `pas * hoogte` hoog. Daarom is dit een som en geen zoektocht.
 *
 * @returns {{rijen: number, tonen: number, pas: number}}
 */
export function pasLijst({ beschikbaar, hoogte, gap = 0, aantal, kolommen = 1, minPas = 0.72, drempel = 0.4 }) {
  if (!aantal || !(hoogte > 0) || !(beschikbaar > 0)) return { rijen: 0, tonen: 0, pas: 1 };
  const kol = Math.max(1, kolommen);
  const nodig = Math.ceil(aantal / kol);
  let rijen = Math.floor((beschikbaar + gap) / (hoogte + gap));
  let pas = 1;
  if (rijen < nodig) {
    const kandidaat = rijen + 1;
    const per = (beschikbaar - (kandidaat - 1) * gap) / kandidaat;
    const k = per / hoogte;
    const over = beschikbaar - rijen * hoogte - Math.max(0, rijen - 1) * gap;
    if (rijen === 0 || (k >= minPas && over >= drempel * hoogte)) {
      rijen = kandidaat;
      pas = Math.min(1, Math.max(rijen === 1 ? 0.5 : minPas, k));
    }
  }
  rijen = Math.min(rijen, nodig);
  return { rijen, tonen: Math.min(aantal, rijen * kol), pas: Math.round(pas * 1000) / 1000 };
}

export const BLOK_SOORTEN = Object.keys(BLOK_INFO);

/**
 * Sinds ronde 4 is er geen kop meer boven het raster: het welkomblok
 * linksboven draagt logo, klok en welkomtekst. Gemeld op 10 september 2026:
 * *"ik heb nu bovenin loze ruimte; ik wil de klok naar links, dat links het
 * vak is met de klok en logo."*
 */
export function standaardIndeling() {
  const blokken = [
    ["welkom", 0, 0, 2, 2, 0],
    ["weer", 0, 2, 2, 2, 0],
    ["openingstijden", 0, 4, 2, 2, 0],
    ["aanwezig", 2, 0, 2, 3, 6],
    ["mededeling", 2, 3, 2, 1, 0],
    ["verlichting", 2, 4, 2, 2, 4],
    ["nieuws", 4, 0, 2, 6, 6],
  ];
  return {
    blokken: blokken.map(([soort, x, y, w, h, aantal]) => ({ id: `std-${soort}`, soort, x, y, w, h, aantal })),
  };
}

export const overlapt = (a, b) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

export const inRaster = (b) =>
  b.x >= 0 && b.y >= 0 && b.w >= 1 && b.h >= 1 && b.x + b.w <= KOLOMMEN && b.y + b.h <= RIJEN;

/** Mag dit blok hier staan? Binnen het raster, en zonder een ander blok te raken. */
export function pastVrij(blokken, kandidaat) {
  if (!inRaster(kandidaat)) return false;
  return !(blokken ?? []).some((b) => b.id !== kandidaat.id && overlapt(b, kandidaat));
}

/** De eerste vrije plek voor een blok van w bij h, van linksboven af. */
export function vrijePlek(blokken, w, h) {
  for (let y = 0; y + h <= RIJEN; y += 1) {
    for (let x = 0; x + w <= KOLOMMEN; x += 1) {
      if (pastVrij(blokken, { id: "", x, y, w, h })) return { x, y };
    }
  }
  return null;
}

/**
 * Is er voor dit blok iets te tonen? Een blok zonder inhoud staat niet op
 * het scherm -- een weervak zonder weerentiteit is een leeg vak, en een leeg
 * vak in een wachtkamer leest als kapot. In het beheer staat het blok er wél,
 * met de reden erbij, zodat de receptie weet wat er ontbreekt.
 *
 * `vandaag` mag ook een datum met tijd zijn (`isoDatumTijd`), voor
 * mededelingen met een tijdstip.
 *
 * @returns {string|null} null als het zichtbaar is, anders waarom niet
 */
export function blokOntbreekt(soort, stand, feeds, vandaag) {
  const s = stand ?? {};
  switch (soort) {
    case "welkom":
      return null;
    case "weer":
      return s.installatie?.weer ? null : "Geen weerentiteit gekozen (kaartinstellingen van het infoscherm)";
    case "mededeling":
      return actieveMededelingen(s.mededelingen, vandaag).length ? null : "Geen mededeling die nu geldt";
    case "verjaardagen":
      return (s.verjaardagen?.length ?? 0) > 0 ? null : "Nog geen verjaardagen";
    case "openingstijden":
      return heeftOpeningstijden(s.praktijk) ? null : "Geen openingstijden ingevuld";
    case "aanwezig":
      return (s.personen?.length ?? 0) > 0 ? null : "Nog geen medewerkers";
    case "nieuws":
      return null;
    case "energie":
      return s.installatie?.energie ? null : "Geen energiesensor gekozen (kaartinstellingen van het infoscherm)";
    case "verlichting":
      if (!((s.installatie?.verlichting?.length ?? 0) > 0)) return "Geen lampen gekozen (kaartinstellingen van het infoscherm)";
      return verlichtingZichtbaar(s) ? null : "Verlichting staat uit in het beheer";
    case "agenda":
      return (s.installatie?.agendas?.length ?? 0) > 0 ? null : "Geen agenda gekozen (kaartinstellingen van het infoscherm)";
    default:
      return "Onbekend blok";
  }
  // `feeds` doet hier niets: een nieuwsblok zonder nieuws zegt dat zelf.
}

/* ------------------------------------------------------------ energie */

/**
 * Is deze sensor een TELLERSTAND (kWh, altijd stijgend) en geen vermogen
 * (W)? Een tellerstand teken je niet als lijn -- die loopt alleen maar op --
 * maar als verbruik per uur.
 */
export function isTellerstand(attributen) {
  const a = attributen ?? {};
  if (a.state_class === "total_increasing" || a.state_class === "total") return true;
  return /wh$/i.test(String(a.unit_of_measurement ?? "").trim());
}

/**
 * De rijen van `history/history_during_period` naar punten `{t, v}` (ms,
 * getal). Beide vormen van Home Assistant worden gelezen: de volle
 * (`state`, `last_updated`) en de compacte (`s`, `lu` in seconden). Wat
 * geen getal is (unavailable, unknown) valt weg.
 */
export function energiePunten(rijen) {
  const uit = [];
  for (const r of rijen ?? []) {
    const v = Number(r?.s ?? r?.state);
    if (!Number.isFinite(v)) continue;
    const lu = r?.lu ?? r?.last_updated;
    const t = typeof lu === "number" ? lu * 1000 : Date.parse(lu);
    if (!Number.isFinite(t)) continue;
    uit.push({ t, v });
  }
  return uit.sort((a, b) => a.t - b.t);
}

/**
 * Wat de grafiek tekent.
 *
 * Een vermogenssensor: de punten van de afgelopen 24 uur zoals ze zijn, met
 * `nu` als laatste punt (de lijn loopt tot de rechterrand). Een tellerstand:
 * het verbruik per uur van de afgelopen 24 uur, één punt per uur, zodat
 * "verbruik" ook echt verbruik is. `venster` is het aantal uren.
 *
 * @returns {{punten: Array<{t:number,v:number}>, van: number, tot: number, perUur: boolean}}
 */
export function energieReeks(punten, { nu, tellerstand = false, venster = 24 } = {}) {
  const tot = nu;
  const van = tot - venster * 3600000;
  const alles = (punten ?? []).filter((p) => p.t <= tot);
  const binnen = alles.filter((p) => p.t >= van - 3600000);
  if (!tellerstand) {
    const lijst = binnen.filter((p) => p.t >= van);
    // Het laatste punt vóór het venster maakt de lijn links compleet, hoe
    // oud het ook is: een sensor die uren niets meldt is nog steeds die waarde.
    const ervoor = alles.filter((p) => p.t < van).pop();
    if (ervoor) lijst.unshift({ t: van, v: ervoor.v });
    const laatste = lijst[lijst.length - 1];
    if (laatste && laatste.t < tot) lijst.push({ t: tot, v: laatste.v });
    return { punten: lijst, van, tot, perUur: false };
  }
  // Per uur: het verschil tussen de laatste stand van het uur en die ervoor.
  const uren = [];
  const eersteUur = Math.floor(van / 3600000) * 3600000;
  let vorige = alles.filter((p) => p.t < eersteUur).pop()?.v ?? null;
  for (let u = eersteUur; u < tot; u += 3600000) {
    const inUur = binnen.filter((p) => p.t >= u && p.t < u + 3600000);
    const eind = inUur.length ? inUur[inUur.length - 1].v : null;
    if (eind !== null && vorige !== null) {
      // Een teller die terugspringt is gereset: dat uur telt als nul.
      uren.push({ t: u, v: eind >= vorige ? Math.round((eind - vorige) * 1000) / 1000 : 0 });
    }
    if (eind !== null) vorige = eind;
  }
  return { punten: uren.filter((p) => p.t >= van), van, tot, perUur: true };
}

/**
 * De samenvatting boven de grafiek: nu, gemiddeld, piek, en het totaal van
 * de reeks (alleen zinvol bij verbruik per uur).
 */
export function energieSamenvatting(reeks) {
  const p = reeks?.punten ?? [];
  if (!p.length) return { nu: null, gemiddeld: null, piek: null, totaal: null };
  const waarden = p.map((x) => x.v);
  const som = waarden.reduce((a, b) => a + b, 0);
  return {
    nu: waarden[waarden.length - 1],
    gemiddeld: som / waarden.length,
    piek: Math.max(...waarden),
    totaal: reeks.perUur ? som : null,
  };
}

/**
 * Een SVG-pad voor de lijn en een voor het vlak eronder, in een vak van
 * `w` bij `h`. Nul staat onderaan (of het minimum, als er negatieve
 * waarden zijn -- teruglevering), de piek op 5% van de bovenrand.
 */
export function lijnPad(reeks, { w = 1000, h = 400 } = {}) {
  const p = reeks?.punten ?? [];
  if (p.length < 2 || !(reeks.tot > reeks.van)) return { lijn: "", vlak: "", min: 0, max: 0 };
  const waarden = p.map((x) => x.v);
  const min = Math.min(0, ...waarden);
  const top = Math.max(...waarden);
  const max = top > min ? min + (top - min) / 0.95 : min + 1;
  const x = (t) => (((t - reeks.van) / (reeks.tot - reeks.van)) * w).toFixed(1);
  const y = (v) => (h - ((v - min) / (max - min)) * h).toFixed(1);
  const lijn = p.map((q, i) => `${i ? "L" : "M"}${x(q.t)},${y(q.v)}`).join(" ");
  const nul = y(Math.max(min, 0));
  const vlak = `${lijn} L${x(p[p.length - 1].t)},${nul} L${x(p[0].t)},${nul} Z`;
  return { lijn, vlak, min, max };
}

/**
 * "1,2 kW", "350 W", "0,45 kWh". Watt wordt kilowatt vanaf 1000; een
 * eenheid die de sensor zelf al in kilo geeft blijft staan.
 */
export function formatEnergie(waarde, eenheid = "W", decimalen = null) {
  if (waarde === null || waarde === undefined || !Number.isFinite(Number(waarde))) return "--";
  let v = Number(waarde);
  let e = String(eenheid ?? "").trim();
  if (/^wh?$/i.test(e) && Math.abs(v) >= 1000) {
    v /= 1000;
    e = `k${e}`;
  }
  const d = decimalen ?? (Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2);
  const tekst = v.toLocaleString("nl-NL", { minimumFractionDigits: d, maximumFractionDigits: d });
  return e ? `${tekst} ${e}` : tekst;
}

/**
 * Minder punten: het venster in `n` gelijke vakken, per vak het gemiddelde.
 * Voor het kleine blok, waar een lijn met elke meting een kras wordt.
 * Gemeld op 10 september 2026: *"ik vind de lijn te gedetailleerd, maak hem
 * mooier en vloeiender; bij Alles bekijken mag hij wel zo gedetailleerd."*
 * Een leeg vak neemt de waarde van het vorige (de sensor meldde niets, dus
 * hij stond nog zo). Het laatste punt blijft het laatste punt, zodat de
 * lijn tot "nu" loopt.
 */
export function verdunReeks(reeks, n = 48) {
  const p = reeks?.punten ?? [];
  // Ook een KORTE reeks gaat op het gelijke rooster: metingen die dicht op
  // elkaar staan naast een groot gat gaven in de kromme een lus (gemeten op
  // 10 september 2026 met vijf waarden binnen een minuut). Gelijke stappen
  // maken de bochten gelijkmatig.
  if (p.length < 2 || !(reeks.tot > reeks.van)) return reeks;
  const stap = (reeks.tot - reeks.van) / n;
  const uit = [];
  let vorige = p[0].v;
  for (let i = 0; i < n; i += 1) {
    const a = reeks.van + i * stap;
    const b = a + stap;
    const inVak = p.filter((q) => q.t >= a && q.t < b);
    const v = inVak.length ? inVak.reduce((s, q) => s + q.v, 0) / inVak.length : vorige;
    vorige = v;
    uit.push({ t: a + stap / 2, v: Math.round(v * 1000) / 1000 });
  }
  uit.unshift({ t: reeks.van, v: p[0].v });
  uit.push({ t: reeks.tot, v: p[p.length - 1].v });
  return { ...reeks, punten: uit };
}

/**
 * Als `lijnPad`, maar met een vloeiende kromme door de punten (Catmull-Rom
 * naar cubische Béziers). De hoekpunten blijven op hun plek; alleen het
 * stuk ertussen buigt.
 */
export function vloeiendPad(reeks, { w = 1000, h = 400, spanning = 0.5 } = {}) {
  const recht = lijnPad(reeks, { w, h });
  const p = reeks?.punten ?? [];
  if (p.length < 3 || !recht.lijn) return recht;
  const { min, max } = recht;
  const xy = p.map((q) => [((q.t - reeks.van) / (reeks.tot - reeks.van)) * w, h - ((q.v - min) / (max - min)) * h]);
  const f = (n) => n.toFixed(1);
  let d = `M${f(xy[0][0])},${f(xy[0][1])}`;
  for (let i = 0; i < xy.length - 1; i += 1) {
    const p0 = xy[i - 1] ?? xy[i];
    const p1 = xy[i];
    const p2 = xy[i + 1];
    const p3 = xy[i + 2] ?? p2;
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * spanning * 2, p1[1] + ((p2[1] - p0[1]) / 6) * spanning * 2];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * spanning * 2, p2[1] - ((p3[1] - p1[1]) / 6) * spanning * 2];
    // Binnen het vak blijven: een bocht mag niet onder de nullijn duiken, en
    // niet terug in de tijd (dat geeft een lus).
    c1[1] = Math.min(h, Math.max(0, c1[1]));
    c2[1] = Math.min(h, Math.max(0, c2[1]));
    c1[0] = Math.min(p2[0], Math.max(p1[0], c1[0]));
    c2[0] = Math.min(p2[0], Math.max(c1[0], c2[0]));
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  const nul = f(h - ((Math.max(min, 0) - min) / (max - min)) * h);
  const laatste = xy[xy.length - 1];
  const vlak = `${d} L${f(laatste[0])},${nul} L${f(xy[0][0])},${nul} Z`;
  return { lijn: d, vlak, min, max };
}
