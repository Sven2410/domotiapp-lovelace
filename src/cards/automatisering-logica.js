/**
 * Wat de automatiseringskaart zegt en controleert, los van hoe hij eruitziet.
 *
 * Het UITVOEREN gebeurt aan de serverkant (`custom_components/.../automatisering/`).
 * De vorm van een regel staat in de kop van `automatisering/regels.py`; `dagen`
 * begint daar ook op maandag, met 0.
 */

import { locale, nt, t, tn } from "../taal.js";
import { dienstVoor, keerPositie } from "./cover-logica.js";

export const SOORTEN = [
  { sleutel: "tijd", label: nt("Tijd"), icoon: "clock" },
  { sleutel: "zonsopkomst", label: nt("Zonsopkomst"), icoon: "sunrise" },
  { sleutel: "zonsondergang", label: nt("Zonsondergang"), icoon: "sunset" },
];

/** Stappen en grens van de verschuiving; de server toetst dezelfde grens. */
export const VERSCHIL_STAP = 15;
export const VERSCHIL_MAX = 180;

const ALLE_DAGEN = [0, 1, 2, 3, 4, 5, 6];

/**
 * De lampen en rolluiken op de kaart als `{entity, naam}`, zonder dubbele en zonder wat er
 * niet hoort. De eigenaar, 31 oktober 2026: "rolluiken mogen er ook in". Aan is dan open op
 * een stand (100 is helemaal open), uit is dicht.
 */
export function lampenUit(config) {
  const uit = new Map();
  const lijstVan = (x) => (Array.isArray(x) ? x : []);
  for (const item of lijstVan(config?.lampen)) {
    const entity = typeof item === "string" ? item : item?.entity;
    if (typeof entity !== "string" || !entity.startsWith("light.") || uit.has(entity)) continue;
    uit.set(entity, {
      entity,
      naam: typeof item === "object" ? String(item.name ?? "") : "",
      aanUit: lijstVan(config.alleen_aan_uit).includes(entity),
    });
  }
  for (const item of lijstVan(config?.rolluiken)) {
    const entity = typeof item === "string" ? item : item?.entity;
    if (typeof entity !== "string" || !entity.startsWith("cover.") || uit.has(entity)) continue;
    uit.set(entity, {
      entity,
      naam: typeof item === "object" ? String(item.name ?? "") : "",
      rolluik: true,
      omgekeerd: lijstVan(config.omgekeerd).includes(entity),
    });
  }
  return [...uit.values()];
}

export const isRolluik = (entity) => String(entity).startsWith("cover.");

/** Zijn dit alleen rolluiken? Dan zegt het scherm open en dicht in plaats van aan en uit. */
export const alleenRolluiken = (lampen) => Boolean(lampen?.length) && lampen.every(isRolluik);

/** Een stand op de knop: "50%", of "Uit" en "Dicht" bij 0. */
export const niveauTekst = (pct, rolluiken = false) => (pct === 0 ? (rolluiken ? t("Dicht") : t("Uit")) : `${pct}%`);

/** De favorieten die op deze kaart horen: minstens één lamp of rolluik van de kaart. */
export function favorietenVoor(favorieten, lampen) {
  const hier = new Set(lampen.map((l) => l.entity));
  return (favorieten ?? []).filter((f) => f.lampen?.some((l) => hier.has(l)));
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
  // Een rolluik dat zijn stand niet kent, gaat alleen open en dicht. Dat zijn er veel.
  if (isRolluik(entity)) return !st || (Number(st.attributes?.supported_features) & 4) === 4;
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

/**
 * Het voorbeeld: de lampen nu al zo zetten als de regel ze straks zet. De eigenaar,
 * 31 oktober 2026: "bijvoorbeeld ingesteld op 50% dat alles naar 50% gaat als je op
 * voorbeeld klikt". Bij stoppen gaan ze terug zoals ze stonden.
 *
 * Dit draait in de browser en niet in de motor: het is een proef van wie kijkt, en
 * geen regel. Gaat de pagina dicht tijdens een voorbeeld, dan blijven de lampen staan.
 */

const weg = (st) => !st || st.state === "unavailable" || st.state === "unknown";

/** Hoe een lamp of rolluik nu staat, om straks terug te zetten; null als hij er niet is. */
export function lampStand(st) {
  if (weg(st)) return null;
  if (isRolluik(st.entity_id)) {
    return { rolluik: true, aan: st.state !== "closed" && st.state !== "closing", positie: st.attributes?.current_position ?? null };
  }
  return { aan: st.state === "on", helderheid: st.state === "on" ? st.attributes?.brightness ?? null : null };
}

/**
 * Wat elke lamp in het voorbeeld hoort te doen: een percentage, of null voor gewoon
 * aan. Een lamp die er niet is, doet niet mee.
 */
export function voorbeeldDoelen(lampen, helderheden, dimt, states) {
  const doelen = {};
  for (const lamp of lampen ?? []) {
    if (weg(states?.[lamp])) continue;
    const pct = helderheden?.[lamp] ?? 100;
    // 0 is uit of dicht, ook voor iets zonder schuif.
    doelen[lamp] = pct === 0 ? 0 : dimt(lamp) ? pct : null;
  }
  return doelen;
}

/** Eén aanroep per waarde, alleen voor wat anders is dan `gezet`. */
export function voorbeeldOproepen(doelen, gezet = {}, omgekeerd = []) {
  const samen = new Map();
  const bij = (domein, dienst, extra, id) => {
    const sleutel = JSON.stringify([domein, dienst, extra]);
    if (!samen.has(sleutel)) samen.set(sleutel, [domein, dienst, extra, []]);
    samen.get(sleutel)[3].push(id);
  };
  for (const [id, pct] of Object.entries(doelen)) {
    if (id in gezet && gezet[id] === pct) continue;
    if (isRolluik(id)) {
      const anders = omgekeerd.includes(id);
      if (pct === 0) bij("cover", dienstVoor("dicht", anders), {}, id);
      else if (pct == null || pct === 100) bij("cover", dienstVoor("open", anders), {}, id);
      else bij("cover", "set_cover_position", { position: keerPositie(pct, anders) }, id);
    } else if (pct === 0) bij("light", "turn_off", {}, id);
    else bij("light", "turn_on", pct == null ? {} : { brightness_pct: pct }, id);
  }
  return [...samen.values()].map(([domein, dienst, extra, ids]) => [domein, dienst, { entity_id: ids, ...extra }]);
}

/**
 * Terug zoals ze stonden: wat uit stond weer uit, wat aan stond op zijn eigen
 * helderheid. Een lamp die aan stond zonder helderheid hoeft niets. Alleen de
 * helderheid: de kleur raakt het voorbeeld niet aan.
 */
export function terugOproepen(standen) {
  const uit = [];
  const perWaarde = new Map();
  const rolluiken = [];
  for (const [lamp, stand] of Object.entries(standen)) {
    if (!stand) continue;
    // De stand zoals Home Assistant hem meldde, dus zonder omkeren.
    if (stand.rolluik) {
      if (stand.positie != null) rolluiken.push(["cover", "set_cover_position", { entity_id: [lamp], position: stand.positie }]);
      else rolluiken.push(["cover", stand.aan ? "open_cover" : "close_cover", { entity_id: [lamp] }]);
    } else if (!stand.aan) uit.push(lamp);
    else if (stand.helderheid != null) perWaarde.set(stand.helderheid, [...(perWaarde.get(stand.helderheid) ?? []), lamp]);
  }
  return [
    ...(uit.length ? [["light", "turn_off", { entity_id: uit }]] : []),
    ...[...perWaarde].map(([brightness, ids]) => ["light", "turn_on", { entity_id: ids, brightness }]),
    ...rolluiken,
  ];
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
  const rolluik = alleenRolluiken(regel.lampen);
  if (regel.aan) {
    const moment = momentTekst(regel.aan);
    delen.push(rolluik ? t("Open {moment}", { moment }) : t("Aan {moment}", { moment }));
  }
  if (regel.uit) {
    const moment = momentTekst(regel.uit);
    if (rolluik) delen.push(regel.aan ? t("dicht {moment}", { moment }) : t("Dicht {moment}", { moment }));
    else delen.push(regel.aan ? t("uit {moment}", { moment }) : t("Uit {moment}", { moment }));
  }
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

/**
 * De lampen kort: tot drie op naam, daarna een telling. De eigenaar, 31 oktober 2026:
 * "Heb je veel lampen geselecteerd dan wordt het heel on overzichtelijk in het overzicht".
 */
export function lampenKort(regel, lampen, naamVan = (id) => id, max = 3) {
  const ids = regel.lampen ?? [];
  if (ids.length <= max) return lampenTekst(regel, lampen, naamVan);
  const kop = lampenTekst({ lampen: ids.slice(0, max - 1) }, lampen, naamVan);
  const rest = ids.length - (max - 1);
  return tn(rest, "{kop} en {n} andere", "{kop} en {n} andere", { kop });
}

/** De kop van een rij: de naam die de klant gaf, en anders de lampen. */
export function regelKop(regel, lampen, naamVan = (id) => id) {
  return String(regel.naam ?? "").trim() || lampenKort(regel, lampen, naamVan);
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

/**
 * De iconen om uit te kiezen bij een favoriet. Een kort rijtje van ons eigen: de klant zoekt
 * hier geen icoon op, hij tikt er een aan. Dezelfde eerste twee als de knoppen die er bij de
 * eerste klant al stonden.
 */
export const FAVORIET_ICONEN = ["star", "homeLeave", "sleep", "bulb", "moon", "sun", "sofa", "tv", "door", "key", "shutter"];

/** Een nieuwe favoriet: nog geen moment en geen dagen, want hij gaat op een tik. */
export const nieuweFavoriet = (lampen) => ({
  favoriet: true,
  naam: "",
  icoon: FAVORIET_ICONEN[0],
  lampen: lampen.length === 1 ? [lampen[0].entity] : [],
  helderheden: lampen.length === 1 ? { [lampen[0].entity]: 100 } : {},
});

/**
 * Kant-en-klare favorieten met vinkjes. De eigenaar, 31 oktober 2026: "Ik wil dat je ook al voor
 * gedefineerde favorieten hebt en dat je dingen kan aanvinken etc. Zoals Woning verlaten. En dan een
 * vinkje alles uit behalve buitenverlichting bijvoorbeeld." En: "de klant moet zelf ook gewoon een
 * favoriet kunnen maken."
 *
 * Een vinkje is geen eigen gegeven: of hij aan staat, volgt uit de lampen en standen van de favoriet.
 * De server kent dus alleen lampen en standen, een favoriet die de klant met de hand zo zette krijgt
 * dezelfde vinkjes, en wat je na het aanvinken nog zelf aanpast, gaat nooit verloren in een tweede waarheid.
 */

/** Hoe de ruimte voor buiten heet. Elke installatie krijgt hem standaard. */
const BUITEN = new Set(["buiten", "outside", "outdoor", "outdoors"]);

/**
 * Is dit buitenverlichting? Dat zegt de ruimte waar de lamp in staat, en verder niets. De eigenaar,
 * 31 oktober 2026: "je gebruikt gewoon de ruimte waar de lampen in staat", want bij elke installatie
 * komt er standaard een ruimte Buiten met de buitenverlichting erin. Daarom geen gok op een naam: een
 * lamp in de ruimte Tuin of met Buitenlamp als naam telt niet, tot hij in die ruimte staat.
 */
export function isBuiten(entity, hass) {
  return BUITEN.has(plat(hass?.areas?.[ruimteVan(hass, entity)]?.name).trim());
}

/** De drie delen waar de vinkjes over gaan. */
function delenVan(lampen, buiten) {
  const lichten = lampen.filter((l) => !l.rolluik).map((l) => l.entity);
  return {
    binnen: lichten.filter((id) => !buiten(id)),
    buiten: lichten.filter((id) => buiten(id)),
    rolluiken: lampen.filter((l) => l.rolluik).map((l) => l.entity),
  };
}

/**
 * De vinkjes van deze favoriet, op volgorde. Wat op deze kaart niets kan, staat er niet.
 *
 * @param {object} favoriet `lampen` en `helderheden`
 * @param {Array} lampen de lijst van de kaart, uit `lampenUit`
 * @param {(entity: string) => boolean} buiten
 * @param {(entity: string) => string} naamVan
 * @returns {Array<{sleutel: string, label: string, tekst: string, aan: boolean, onder: boolean}>}
 */
export function favorietVinkjes(favoriet, lampen, buiten, naamVan = (id) => id) {
  const d = delenVan(lampen, buiten);
  const gekozen = new Set(favoriet.lampen ?? []);
  const stand = (id) => favoriet.helderheden?.[id] ?? 100;
  const allemaal = (ids, past) => ids.length > 0 && ids.every((id) => gekozen.has(id) && past(stand(id)));
  const uit = (pct) => pct === 0;
  const kort = (ids) => lampenKort({ lampen: ids }, lampen, naamVan);
  const lichten = [...d.binnen, ...d.buiten];
  const alleUit = allemaal(d.binnen.length ? d.binnen : d.buiten, uit);
  const behalve = alleUit && d.binnen.length > 0 && d.buiten.length > 0 && !d.buiten.some((id) => gekozen.has(id) && uit(stand(id)));
  const vinkje = (sleutel, label, tekst, aan, onder = false) => ({ sleutel, label, tekst, aan, onder });
  const rij = [];
  if (lichten.length) rij.push(vinkje("alleUit", t("Alle lampen uit"), tn(behalve ? d.binnen.length : lichten.length, "{n} lamp", "{n} lampen"), alleUit));
  if (alleUit && d.binnen.length && d.buiten.length) {
    rij.push(vinkje("behalveBuiten", t("Behalve de buitenverlichting"), kort(d.buiten), behalve, true));
  }
  if (d.buiten.length && (!alleUit || behalve || !d.binnen.length)) {
    rij.push(vinkje("buitenAan", t("Buitenverlichting aan"), kort(d.buiten), allemaal(d.buiten, (pct) => pct > 0)));
  }
  if (d.buiten.length && d.binnen.length && !alleUit) {
    rij.push(vinkje("buitenUit", t("Buitenverlichting uit"), kort(d.buiten), allemaal(d.buiten, uit)));
  }
  if (d.rolluiken.length) {
    const aantal = tn(d.rolluiken.length, "{n} rolluik", "{n} rolluiken");
    rij.push(vinkje("rolluikenDicht", t("Rolluiken dicht"), aantal, allemaal(d.rolluiken, uit)));
    rij.push(vinkje("rolluikenOpen", t("Rolluiken open"), aantal, allemaal(d.rolluiken, (pct) => pct === 100)));
  }
  return rij;
}

/**
 * De favoriet na een tik op een vinkje. Alleen wat bij dat vinkje hoort verandert: een lamp die de klant
 * zelf op 40% zette, blijft daar staan als hij de rolluiken aanvinkt.
 */
export function metVinkje(favoriet, lampen, buiten, sleutel, aan) {
  const d = delenVan(lampen, buiten);
  const per = { ...(favoriet.helderheden ?? {}) };
  let lijst = [...(favoriet.lampen ?? [])];
  const zet = (ids, pct) => {
    for (const id of ids) {
      if (!lijst.includes(id)) lijst.push(id);
      per[id] = pct;
    }
  };
  const weg = (ids) => {
    lijst = lijst.filter((id) => !ids.includes(id));
    for (const id of ids) delete per[id];
  };
  if (sleutel === "alleUit") {
    if (aan) zet([...d.binnen, ...d.buiten], 0);
    else weg([...d.binnen, ...d.buiten.filter((id) => (per[id] ?? 100) === 0)]);
  } else if (sleutel === "behalveBuiten") {
    if (aan) weg(d.buiten);
    else zet(d.buiten, 0);
  } else if (sleutel === "buitenAan" || sleutel === "buitenUit") {
    if (aan) zet(d.buiten, sleutel === "buitenAan" ? 100 : 0);
    else weg(d.buiten);
  } else if (sleutel === "rolluikenDicht" || sleutel === "rolluikenOpen") {
    if (aan) zet(d.rolluiken, sleutel === "rolluikenOpen" ? 100 : 0);
    else weg(d.rolluiken);
  }
  return { ...favoriet, lampen: lijst, helderheden: per };
}

/**
 * De sjablonen: een naam, een icoon en de vinkjes die alvast aan staan. Met opzet maar twee. De eigenaar,
 * 31 oktober 2026: "Ik wil maar 2 voor gemaakt efavorieten. Alles uit en woning verlaten. WOning verlaten is dan
 * standaard buitenverlichting niet uit. ALles uit is ook de buitenverlichting uit. Zo houden we de kaart
 * overzichtelijk en kan de klant daarna gewoon zelf zijn eigen favorieten maken".
 */
export const FAVORIET_SJABLONEN = [
  {
    sleutel: "verlaten",
    naam: nt("Woning verlaten"),
    icoon: "homeLeave",
    vinkjes: ["alleUit", "behalveBuiten"],
    uitleg: nt("Alle lampen uit. Je kiest zelf of de buitenverlichting meedoet."),
  },
  {
    sleutel: "allesuit",
    naam: nt("Alles uit"),
    icoon: "power",
    vinkjes: ["alleUit"],
    uitleg: nt("Alle lampen uit, ook de buitenverlichting."),
  },
];

/**
 * De regel onder een sjabloon. "Behalve de buitenverlichting" hoort daar niet: dat las de eigenaar als een vast
 * onderdeel, en het is een vinkje in de volgende stap. Zonder buitenlampen valt er niets te kiezen.
 */
export const sjabloonUitleg = (sjabloon, lampen, buiten) =>
  lampen.some((l) => !l.rolluik && buiten(l.entity)) ? t(sjabloon.uitleg) : t("Alle lampen uit");

/** Een favoriet uit een sjabloon. Een vinkje dat op deze kaart niets kan, doet niets. */
export function favorietUitSjabloon(sjabloon, lampen, buiten) {
  const start = { favoriet: true, naam: t(sjabloon.naam), icoon: sjabloon.icoon, lampen: [], helderheden: {} };
  return sjabloon.vinkjes.reduce((f, sleutel) => metVinkje(f, lampen, buiten, sleutel, true), start);
}

/** De sjablonen die hier iets doen: op een kaart met alleen rolluiken is er geen lamp om uit te zetten. */
export const sjablonenVoor = (lampen, buiten) =>
  FAVORIET_SJABLONEN.filter((s) => favorietUitSjabloon(s, lampen, buiten).lampen.length > 0);

/** Wat er naar de server gaat. 0 is uit of dicht; iets zonder schuif op een andere stand is gewoon aan. */
export function favorietNaarServer(favoriet, dimt = () => true) {
  const per = favoriet.helderheden ?? {};
  const helderheden = {};
  for (const lamp of favoriet.lampen) {
    const pct = per[lamp] ?? 100;
    if (pct === 0 || dimt(lamp)) helderheden[lamp] = pct;
  }
  return {
    ...(favoriet.id ? { id: favoriet.id } : {}),
    naam: String(favoriet.naam ?? "").trim(),
    icoon: favoriet.icoon || FAVORIET_ICONEN[0],
    lampen: favoriet.lampen,
    helderheden,
  };
}

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
  if (regel.favoriet && !String(regel.naam ?? "").trim()) return t("Geef de favoriet een naam.");
  if (!regel.lampen?.length) return t("Kies minstens één lamp.");
  if (regel.favoriet) return null;
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
  const naam = String(regel.naam ?? "").trim();
  return {
    ...(regel.id ? { id: regel.id } : {}),
    ...(naam ? { naam } : {}),
    lampen: regel.lampen,
    helderheden: Object.fromEntries(regel.lampen.filter(dimt).map((l) => [l, per[l] ?? 100])),
    aan: regel.aan ?? null,
    uit: regel.uit ?? null,
    dagen: [...regel.dagen].sort((a, b) => a - b),
    vakantie: Boolean(regel.vakantie),
  };
}
