/**
 * Het rekenwerk van het infoscherm, zonder DOM: openingstijden, wat er nú
 * geldig is, de volgorde van het nieuws, de klok.
 *
 * Los van de kaart zodat het in een gewone unittest kan (CLAUDE.md: geen
 * jsdom). De serverkant heeft van `openingVandaag` een tweeling in
 * `infoscherm/store.py` (`vandaag_open`); dit is de kant die het scherm
 * tekent, die de kant die de nacht bewaakt.
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
 * Welke pagina's het scherm heeft, in volgorde.
 *
 * Verlichting hangt van drie dingen af: staat er een lamp in de config, wat
 * de installateur koos (`altijd`, `nooit`, `beheer`), en bij `beheer` wat de
 * receptie in het beheer aanzette. Zo kan een tablet in een kantoor de
 * lampen altijd tonen en die in de wachtkamer alleen als de receptie het wil.
 */
export function paginas(config, stand) {
  const uit = ["welkom"];
  if (config.show_aanwezig !== false && (stand?.personen?.length ?? 0) > 0) uit.push("aanwezig");
  if (config.show_nieuws !== false) uit.push("nieuws");
  if (verlichtingZichtbaar(config, stand)) uit.push("verlichting");
  if (config.show_agenda !== false && (config.calendars?.length ?? 0) > 0) uit.push("agenda");
  return uit;
}

export function verlichtingZichtbaar(config, stand) {
  if (!(config.lights?.length > 0)) return false;
  const keuze = config.verlichting ?? "beheer";
  if (keuze === "altijd") return true;
  if (keuze === "nooit") return false;
  return stand?.instellingen?.verlichting_tonen !== false;
}

/** 'Marieke de Vries' -> 'MV'. Tweeling van `initialen` in store.py. */
export function initialen(naam) {
  const woorden = String(naam ?? "").trim().split(/\s+/).filter(Boolean);
  const hoofd = woorden.filter((w) => w[0] === w[0].toUpperCase() && /\p{L}/u.test(w[0]));
  const delen = hoofd.length ? hoofd : woorden;
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
