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

const twee = (n) => String(n).padStart(2, "0");

/** `Date` -> "ma".."zo". JavaScript telt vanaf zondag, wij vanaf maandag. */
export const dagSleutel = (d) => DAGEN[(d.getDay() + 6) % 7];

/** Lokale datum als "JJJJ-MM-DD", zonder de UTC-verschuiving van toISOString. */
export const isoDatum = (d) => `${d.getFullYear()}-${twee(d.getMonth() + 1)}-${twee(d.getDate())}`;

export const klok = (d) => `${twee(d.getHours())}:${twee(d.getMinutes())}`;

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
 * Geldt dit item vandaag? `van` en `tot` zijn beide inclusief; ontbreken ze,
 * dan is die kant open.
 */
export function geldigNu(item, vandaag) {
  if (item?.van && item.van > vandaag) return false;
  if (item?.tot && item.tot < vandaag) return false;
  return true;
}

export const actieveMededelingen = (lijst, vandaag) =>
  (lijst ?? []).filter((m) => m.tekst && geldigNu(m, vandaag));

/**
 * Eigen nieuws en nieuws van buiten in één lijst.
 *
 * Eigen berichten eerst -- dat is het nieuws van het pand, en daar is het
 * scherm voor. Vastgezette berichten daarbinnen bovenaan, de rest op
 * aanmaakdatum. Daarna de feeds, nieuwste eerst.
 */
export function nieuwsLijst(eigen, feeds, vandaag) {
  const eigenNu = (eigen ?? [])
    .filter((n) => n.titel && geldigNu(n, vandaag))
    .map((n) => ({ ...n, eigen: true, datum: n.gemaakt ?? null }))
    .sort((a, b) => Number(Boolean(b.vast)) - Number(Boolean(a.vast)) || String(b.gemaakt ?? "").localeCompare(String(a.gemaakt ?? "")));
  const buiten = (feeds ?? [])
    .filter((n) => n.titel)
    .map((n) => ({ ...n, eigen: false }))
    .sort((a, b) => String(b.datum ?? "").localeCompare(String(a.datum ?? "")));
  return [...eigenNu, ...buiten];
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
 * lampen gekozen, en de receptie heeft het niet uitgezet. De keuze
 * "altijd/nooit/beheer" uit de kaartconfig is er sinds ronde 2 niet meer --
 * er IS geen kaartconfig meer.
 */
export function verlichtingZichtbaar(stand) {
  if (!((stand?.installatie?.verlichting?.length ?? 0) > 0)) return false;
  return stand?.instellingen?.verlichting_tonen !== false;
}

/**
 * Welke pagina's er achter de koppen zitten. Welkom is het scherm zelf; de
 * rest is er alleen als er iets te tonen valt.
 */
export function paginas(stand, feeds) {
  const uit = ["welkom"];
  if ((stand?.personen?.length ?? 0) > 0) uit.push("aanwezig");
  if ((stand?.nieuws?.length ?? 0) > 0 || (feeds?.length ?? 0) > 0) uit.push("nieuws");
  if (stand?.installatie?.weer) uit.push("weer");
  if (verlichtingZichtbaar(stand)) uit.push("verlichting");
  if ((stand?.installatie?.agendas?.length ?? 0) > 0) uit.push("agenda");
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
  return `${t.getDate()} ${MAANDEN[t.getMonth()].slice(0, 3)}`;
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
  mededeling: { naam: "Mededeling", icoon: "bell", pagina: null, aantal: false, maat: [2, 1] },
  openingstijden: { naam: "Openingstijden", icoon: "clock", pagina: null, aantal: false, maat: [2, 3] },
  aanwezig: { naam: "Aanwezig", icoon: "people", pagina: "aanwezig", aantal: true, maat: [2, 3] },
  nieuws: { naam: "Nieuws", icoon: "news", pagina: "nieuws", aantal: true, maat: [2, 4] },
  verlichting: { naam: "Verlichting", icoon: "bulb", pagina: "verlichting", aantal: true, maat: [2, 1] },
  agenda: { naam: "Agenda", icoon: "calendar", pagina: "agenda", aantal: true, maat: [2, 2] },
};

export const BLOK_SOORTEN = Object.keys(BLOK_INFO);

export function standaardIndeling() {
  const blokken = [
    ["welkom", 0, 0, 6, 1, 0],
    ["weer", 0, 1, 2, 2, 0],
    ["aanwezig", 2, 1, 2, 3, 4],
    ["nieuws", 4, 1, 2, 5, 3],
    ["openingstijden", 0, 3, 2, 3, 0],
    ["mededeling", 2, 4, 2, 1, 0],
    ["verlichting", 2, 5, 2, 1, 4],
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
 * @returns {string|null} null als het zichtbaar is, anders waarom niet
 */
export function blokOntbreekt(soort, stand, feeds, vandaag) {
  const s = stand ?? {};
  switch (soort) {
    case "welkom":
      return null;
    case "weer":
      return s.installatie?.weer ? null : "Geen weerentiteit gekozen (Installatie)";
    case "mededeling":
      return actieveMededelingen(s.mededelingen, vandaag).length ? null : "Geen mededeling die nu geldt";
    case "openingstijden":
      return heeftOpeningstijden(s.praktijk) ? null : "Geen openingstijden ingevuld";
    case "aanwezig":
      return (s.personen?.length ?? 0) > 0 ? null : "Nog geen medewerkers";
    case "nieuws":
      return null;
    case "verlichting":
      if (!((s.installatie?.verlichting?.length ?? 0) > 0)) return "Geen lampen gekozen (Installatie)";
      return verlichtingZichtbaar(s) ? null : "Verlichting staat uit in het beheer";
    case "agenda":
      return (s.installatie?.agendas?.length ?? 0) > 0 ? null : "Geen agenda gekozen (Installatie)";
    default:
      return "Onbekend blok";
  }
  // `feeds` doet hier niets: een nieuwsblok zonder nieuws zegt dat zelf.
}
