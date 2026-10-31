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
    uit.set(entity, { entity, naam: typeof item === "object" ? String(item.name ?? "") : "" });
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

/** De regel in één zin: "Aan bij zonsondergang · uit om 23:00 · 60% · Elke dag". */
export function regelTekst(regel) {
  const delen = [];
  if (regel.aan) delen.push(t("Aan {moment}", { moment: momentTekst(regel.aan) }));
  if (regel.uit) delen.push((regel.aan ? t("uit {moment}", { moment: momentTekst(regel.uit) }) : t("Uit {moment}", { moment: momentTekst(regel.uit) })));
  if (regel.aan && regel.helderheid != null && regel.helderheid < 100) delen.push(`${regel.helderheid}%`);
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
  helderheid: 100,
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

/** Wat er naar de server gaat. */
export function naarServer(regel) {
  return {
    ...(regel.id ? { id: regel.id } : {}),
    lampen: regel.lampen,
    helderheid: regel.helderheid ?? 100,
    aan: regel.aan ?? null,
    uit: regel.uit ?? null,
    dagen: [...regel.dagen].sort((a, b) => a - b),
    vakantie: Boolean(regel.vakantie),
  };
}
