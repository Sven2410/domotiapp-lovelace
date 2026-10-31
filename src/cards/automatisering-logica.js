/**
 * Wat de automatiseringskaart zegt en controleert, los van hoe hij eruitziet.
 *
 * Het UITVOEREN gebeurt aan de serverkant (`custom_components/.../automatisering/`).
 * De vorm van een regel staat in de kop van `automatisering/regels.py`; `dagen`
 * begint daar ook op maandag, met 0.
 */

import { locale, nt, t } from "../taal.js";

export const SOORTEN = [
  { sleutel: "tijd", label: nt("Tijd"), icoon: "clock" },
  { sleutel: "zonsopkomst", label: nt("Zonsopkomst"), icoon: "sunrise" },
  { sleutel: "zonsondergang", label: nt("Zonsondergang"), icoon: "sunset" },
];

/** Stappen en grens van de verschuiving; de server toetst dezelfde grens. */
export const VERSCHIL_STAP = 15;
export const VERSCHIL_MAX = 180;

const ALLE_DAGEN = [0, 1, 2, 3, 4, 5, 6];

/** De lampen op de kaart als `{entity, naam}`, zonder dubbele en zonder wat geen lamp is. */
export function lampenUit(config) {
  const uit = new Map();
  for (const item of Array.isArray(config?.lampen) ? config.lampen : []) {
    const entity = typeof item === "string" ? item : item?.entity;
    if (typeof entity !== "string" || !entity.startsWith("light.") || uit.has(entity)) continue;
    uit.set(entity, {
      entity,
      naam: typeof item === "object" ? String(item.name ?? "") : "",
      aanUit: Array.isArray(config.alleen_aan_uit) && config.alleen_aan_uit.includes(entity),
    });
  }
  return [...uit.values()];
}

/**
 * De regels die op deze kaart horen: de goede groep, en minstens één lamp van
 * deze kaart. Twee kaarten voor twee verdiepingen delen zo één opslag.
 */
export function regelsVoor(regels, lampen, vakantie) {
  const hier = new Set(lampen.map((l) => l.entity));
  return (regels ?? []).filter((r) => Boolean(r.vakantie) === Boolean(vakantie) && r.lampen?.some((l) => hier.has(l)));
}

/** Een lamp kan dimmen, tenzij hij zelf zegt van niet. Een lamp die even weg is, weet het niet. */
export function kanDimmen(st) {
  const standen = st?.attributes?.supported_color_modes;
  return !Array.isArray(standen) || standen.some((s) => s !== "onoff");
}

/**
 * Mag deze lamp een helderheid krijgen? Niet als de lamp zegt dat hij het niet kan,
 * en niet als de beheerder hem op "alleen aan en uit" zette: een dimblokje met lampen
 * die niet kunnen dimmen meldt wel `brightness`.
 */
export function magDimmen(entity, lampen, st) {
  return kanDimmen(st) && !lampen.find((l) => l.entity === entity)?.aanUit;
}

/**
 * De helderheden om mee te beginnen, per lamp. Een regel van vóór 0.94.0 heeft één
 * `helderheid`, en die geldt dan voor al zijn lampen.
 */
export function startHelderheden(regel) {
  if (regel.helderheden) return { ...regel.helderheden };
  return Object.fromEntries((regel.lampen ?? []).map((l) => [l, regel.helderheid ?? 100]));
}

/**
 * Zoeken en filteren in de lijst lampen. De eigenaar, 31 oktober 2026: "nu hebben we een
 * aardige lijst. Ik wil dat je kan filteren op ruimte bijvoorbeeld en een zoekbalk."
 */

/** Waar een lamp staat: de ruimte van de entiteit, anders die van zijn apparaat, anders "". */
export function ruimteVan(hass, entity) {
  const reg = hass?.entities?.[entity];
  return reg?.area_id ?? hass?.devices?.[reg?.device_id]?.area_id ?? "";
}

/** De ruimtes van deze lampen op naam, en "Geen ruimte" als laatste. */
export function ruimtesVan(lampen, hass) {
  const ids = new Set(lampen.map((l) => ruimteVan(hass, l.entity)));
  const metNaam = [...ids]
    .filter(Boolean)
    .map((id) => ({ id, naam: hass?.areas?.[id]?.name ?? id }))
    .sort((a, b) => a.naam.localeCompare(b.naam, locale()));
  return ids.has("") ? [...metNaam, { id: "", naam: t("Geen ruimte") }] : metNaam;
}

/** Zonder hoofdletters en accenten: "Café" vind je met "cafe". */
const plat = (s) => String(s ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/**
 * De lampen die overblijven. Elk woord moet in de naam of in de ruimte staan, dus
 * "lamp woon" vindt de lamp in de woonkamer.
 *
 * @param {Array<{entity: string}>} lampen
 * @param {{zoek?: string, ruimte?: string|null}} filter `ruimte` null is alle ruimtes, "" geen ruimte
 * @param {(entity: string) => string} naamVan
 * @param {object} hass
 */
export function lampenGefilterd(lampen, { zoek = "", ruimte = null } = {}, naamVan = (id) => id, hass = null) {
  const woorden = plat(zoek).split(/\s+/).filter(Boolean);
  return lampen.filter((l) => {
    const hier = ruimteVan(hass, l.entity);
    if (ruimte !== null && hier !== ruimte) return false;
    const tekst = plat(`${naamVan(l.entity)} ${hass?.areas?.[hier]?.name ?? ""}`);
    return woorden.every((w) => tekst.includes(w));
  });
}

/**
 * De helderheid in groepen: lampen die samen op 50% gaan, staan bij elkaar. De eigenaar,
 * 31 oktober 2026: een lamp erbij kiezen "die ook 50% doet en dan de optie een nieuwe
 * helderheid". Op de server blijft het per lamp (`helderheden`); de groep bestaat alleen
 * in het scherm.
 *
 * Een lamp die je kiest, komt in de actieve groep. Een lege groep is er alleen net na
 * "Nieuwe helderheid", en telt niet mee in `helderhedenUit`.
 */

/** Uit een regel: lampen met dezelfde waarde samen, op volgorde van de eerste lamp. */
export function groepenUit(lampen, helderheden, dimt = () => true) {
  const groepen = [];
  for (const lamp of lampen ?? []) {
    if (!dimt(lamp)) continue;
    const pct = helderheden?.[lamp] ?? 100;
    const groep = groepen.find((g) => g.pct === pct);
    if (groep) groep.lampen.push(lamp);
    else groepen.push({ pct, lampen: [lamp] });
  }
  return groepen;
}

/** Terug naar wat de server kent: per lamp een waarde. */
export const helderhedenUit = (groepen) =>
  Object.fromEntries(groepen.flatMap((g) => g.lampen.map((lamp) => [lamp, g.pct])));

/** Een lamp erbij, in de actieve groep. Zonder groep begint er een op 100%. */
export function metLamp(groepen, actief, lamp) {
  if (!groepen.length) return { groepen: [{ pct: 100, lampen: [lamp] }], actief: 0 };
  const index = groepen[actief] ? actief : groepen.length - 1;
  return {
    groepen: groepen.map((g, i) => (i === index ? { ...g, lampen: [...g.lampen, lamp] } : g)),
    actief: index,
  };
}

/** Een lamp eruit. Een groep die daardoor leeg raakt, gaat ook weg. */
export function zonderLamp(groepen, actief, lamp) {
  const huidig = groepen[actief];
  const uit = groepen
    .map((g) => (g.lampen.includes(lamp) ? { ...g, lampen: g.lampen.filter((l) => l !== lamp), raakte: true } : g))
    .filter((g) => g.lampen.length || !g.raakte)
    .map(({ raakte, ...g }) => g);
  const plek = uit.findIndex((g) => g.pct === huidig?.pct && g.lampen.every((l) => huidig.lampen.includes(l)));
  return { groepen: uit, actief: plek >= 0 ? plek : Math.max(0, uit.length - 1) };
}

/** Een nieuwe, lege groep die actief wordt, op de waarde van de actieve. Er is er hooguit één leeg. */
export function nieuweGroep(groepen, actief) {
  const leeg = groepen.findIndex((g) => !g.lampen.length);
  if (leeg >= 0) return { groepen, actief: leeg };
  return { groepen: [...groepen, { pct: groepen[actief]?.pct ?? 100, lampen: [] }], actief: groepen.length };
}

/** Maandag tot en met zondag, kort, in de taal van de kaart. */
export const dagNamen = () =>
  ALLE_DAGEN.map((i) => new Date(2026, 10, 2 + i).toLocaleDateString(locale(), { weekday: "short" }).replace(".", ""));

export function dagenTekst(dagen) {
  const d = [...(dagen ?? [])].sort((a, b) => a - b).join();
  if (d === "0,1,2,3,4,5,6") return t("Elke dag");
  if (d === "0,1,2,3,4") return t("Werkdagen");
  if (d === "5,6") return t("Weekend");
  const namen = dagNamen();
  return [...(dagen ?? [])]
    .sort((a, b) => a - b)
    .map((i) => namen[i])
    .join(", ");
}

/** 30 -> "30 min", 60 -> "1 uur", 90 -> "1 uur 30 min". */
export function duurTekst(minuten) {
  const m = Math.abs(minuten);
  const uren = Math.floor(m / 60);
  const rest = m % 60;
  if (!uren) return t("{n} min", { n: rest });
  return rest ? t("{u} uur {n} min", { u: uren, n: rest }) : t("{u} uur", { u: uren });
}

/** Wat de stapper zegt. */
export function verschilTekst(verschil) {
  if (!verschil) return t("Op dat moment");
  const duur = duurTekst(verschil);
  return verschil < 0 ? t("{duur} ervoor", { duur }) : t("{duur} erna", { duur });
}

/** Een moment in een zin: "om 07:00", "bij zonsondergang", "30 min voor zonsopkomst". */
export function momentTekst(moment) {
  if (!moment) return "";
  if (moment.soort === "tijd") return t("om {tijd}", { tijd: moment.tijd });
  const zon = moment.soort === "zonsopkomst" ? t("zonsopkomst") : t("zonsondergang");
  const v = moment.verschil ?? 0;
  if (!v) return t("bij {zon}", { zon });
  const duur = duurTekst(v);
  return v < 0 ? t("{duur} voor {zon}", { duur, zon }) : t("{duur} na {zon}", { duur, zon });
}

/** "60%", of "20-60%" als de lampen verschillen. Niets als alles op 100% gaat. */
export function helderheidTekst(regel) {
  const waarden = regel.helderheden ? Object.values(regel.helderheden) : [regel.helderheid];
  const goed = waarden.filter((w) => w != null);
  if (!goed.length) return "";
  const [laag, hoog] = [Math.min(...goed), Math.max(...goed)];
  if (laag === 100) return "";
  return laag === hoog ? `${laag}%` : `${laag}-${hoog}%`;
}

/** De regel in één zin: "Aan bij zonsondergang · uit om 23:00 · 60% · Elke dag". */
export function regelTekst(regel) {
  const delen = [];
  if (regel.aan) delen.push(t("Aan {moment}", { moment: momentTekst(regel.aan) }));
  if (regel.uit) delen.push((regel.aan ? t("uit {moment}", { moment: momentTekst(regel.uit) }) : t("Uit {moment}", { moment: momentTekst(regel.uit) })));
  if (regel.aan) {
    const tekst = helderheidTekst(regel);
    if (tekst) delen.push(tekst);
  }
  delen.push(dagenTekst(regel.dagen));
  return delen.join(" · ");
}

/** De namen van de lampen in een regel; een lamp die niet op de kaart staat houdt zijn eigen naam. */
export function lampenTekst(regel, lampen, naamVan = (id) => id) {
  return (regel.lampen ?? [])
    .map((id) => lampen.find((l) => l.entity === id)?.naam || naamVan(id))
    .join(", ");
}

/** Een nieuwe regel: wat de meeste mensen willen, en één lamp staat er meteen in. */
export const nieuweRegel = (lampen, vakantie = false) => ({
  lampen: lampen.length === 1 ? [lampen[0].entity] : [],
  helderheden: lampen.length === 1 ? { [lampen[0].entity]: 100 } : {},
  aan: { soort: "zonsondergang", verschil: 0 },
  uit: { soort: "tijd", tijd: "23:00" },
  dagen: [...ALLE_DAGEN],
  vakantie: Boolean(vakantie),
});

/** Andere soort kiezen in het scherm; "geen" is null. */
export function metSoort(sleutel) {
  if (sleutel === "geen") return null;
  return sleutel === "tijd" ? { soort: "tijd", tijd: "18:00" } : { soort: sleutel, verschil: 0 };
}

/** Eén stap op de stapper, binnen de grens. */
export const stapVerschil = (verschil, richting) =>
  Math.max(-VERSCHIL_MAX, Math.min(VERSCHIL_MAX, (verschil ?? 0) + richting * VERSCHIL_STAP));

/** Een lamp of dag aan of uit in een lijst; de dagen blijven op volgorde. */
export function wissel(lijst, waarde) {
  return lijst.includes(waarde) ? lijst.filter((x) => x !== waarde) : [...lijst, waarde];
}

/** Waarom deze regel nog niet opgeslagen kan worden, of null. */
export function waaromNiet(regel) {
  if (!regel.lampen?.length) return t("Kies minstens één lamp.");
  if (!regel.aan && !regel.uit) return t("Kies wanneer hij aan of uit gaat.");
  for (const m of [regel.aan, regel.uit]) {
    if (m?.soort === "tijd" && !/^\d{2}:\d{2}$/.test(m.tijd ?? "")) return t("Vul een tijd in.");
  }
  if (!regel.dagen?.length) return t("Kies minstens één dag.");
  return null;
}

/**
 * Wat er naar de server gaat.
 *
 * @param {object} regel
 * @param {(entity: string) => boolean} [dimt] alleen deze lampen krijgen een helderheid
 */
export function naarServer(regel, dimt = () => true) {
  const per = regel.helderheden ?? startHelderheden(regel);
  return {
    ...(regel.id ? { id: regel.id } : {}),
    lampen: regel.lampen,
    helderheden: Object.fromEntries(regel.lampen.filter(dimt).map((l) => [l, per[l] ?? 100])),
    aan: regel.aan ?? null,
    uit: regel.uit ?? null,
    dagen: [...regel.dagen].sort((a, b) => a - b),
    vakantie: Boolean(regel.vakantie),
  };
}
