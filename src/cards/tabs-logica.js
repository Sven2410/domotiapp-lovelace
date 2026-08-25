/**
 * Welke tab er openstaat, en waar dat onthouden wordt.
 *
 * De eigenaar gebruikt `custom:simple-tabs` in zijn pop-ups en wil hetzelfde in
 * zijn eigen vormtaal, met één harde eis erbij: **de gekozen tab hoort bij het
 * APPARAAT, niet bij het dashboard**. Schakelt hij op zijn telefoon van Woning
 * naar Weer, dan mag de tablet in de gang op Woning blijven staan. En dat moet
 * werken zonder dat er iets in de GUI ingesteld hoeft te worden.
 *
 * Dat sluit de voor de hand liggende oplossingen uit. Een `input_select` per
 * apparaat is server-side en dus voor iedereen gelijk; een sleutel die de
 * eigenaar zelf invult is precies het instellen dat er niet mag zijn. Wat
 * overblijft is `localStorage`: dat staat per browser, overleeft een herlading,
 * en er is niets voor in te vullen.
 *
 * DE SLEUTEL MOET STABIEL ZIJN EN TOCH UNIEK
 *
 * Twee tabbladenkaarten op hetzelfde dashboard mogen elkaars keuze niet
 * overschrijven, en dezelfde kaart moet zichzelf na een herlading terugvinden.
 * Er is geen id in een Lovelace-kaartconfig, dus die sleutel wordt afgeleid uit
 * de namen van de tabs: dat is wat een kaart identificeert en wat niet verandert
 * zolang de kaart hetzelfde doet. Hernoem je een tab, dan begint hij een keer
 * opnieuw bij de eerste -- dat is de prijs, en die is lager dan een veld dat
 * iemand moet invullen.
 *
 * Geen DOM en geen `hass`: de opslag komt als parameter binnen, zodat dit in een
 * gewone Node-test past.
 */

/** Meer tabs dan dit passen niet naast elkaar zonder te verminken. */
export const TABS_MAX = 8;

/** Waar de keuze onder wordt weggeschreven. */
export const SLEUTEL_VOORVOEGSEL = "dac-tabs:";

/**
 * Een tab uit de config, in de vorm die de kaart verwacht.
 *
 * `title` is hoe `simple-tabs` het noemt en `name` hoe de rest van deze familie
 * het noemt; allebei werken, want een config die je overzet hoort te blijven
 * werken. Hetzelfde voor `card` (één kaart) tegenover `cards` (een lijst): een
 * lijst wordt een `vertical-stack`, want dat is wat iemand bedoelt.
 */
export function asTab(ruw) {
  const t = ruw ?? {};
  const naam = typeof t.name === "string" ? t.name : typeof t.title === "string" ? t.title : "";
  let kaart = null;
  if (t.card && typeof t.card === "object") kaart = t.card;
  else if (Array.isArray(t.cards) && t.cards.length)
    kaart = t.cards.length === 1 ? t.cards[0] : { type: "vertical-stack", cards: t.cards };
  return { name: naam, icon: typeof t.icon === "string" ? t.icon : "", card: kaart };
}

/** Heeft deze tab iets om te tonen? */
export const gevuld = (tab) => Boolean(tab && (tab.name?.trim() || tab.icon?.trim() || tab.card));

/** De tabs uit een config, genormaliseerd, afgekapt en zonder lege plekken. */
export function tabsVan(config) {
  const ruw = Array.isArray(config?.tabs) ? config.tabs : [];
  return ruw.slice(0, TABS_MAX).map(asTab).filter(gevuld);
}

/**
 * Welke tab openstaat als er nog niets onthouden is.
 *
 * `default_tab` telt vanaf 1, want dat is wat iemand bedoelt met "de tweede
 * tab". Buiten bereik of onzin wordt de eerste.
 */
export function standaardTab(config, aantal) {
  if (!aantal) return 0;
  const n = Math.round(Number(config?.default_tab));
  if (!Number.isFinite(n) || n < 1 || n > aantal) return 0;
  return n - 1;
}

/**
 * De sleutel waaronder de keuze van dit apparaat wordt bewaard.
 *
 * Afgeleid uit de namen van de tabs. Zie de kop voor waarom er geen veld voor
 * is. Genormaliseerd, zodat een hoofdletter of een spatie erbij geen nieuwe
 * sleutel oplevert.
 */
export function sleutelVoor(tabs) {
  const namen = (tabs ?? [])
    .map((t, i) => (t?.name?.trim() || t?.icon?.trim() || `tab${i}`).toLowerCase())
    .join("|");
  return SLEUTEL_VOORVOEGSEL + namen;
}

/**
 * De onthouden keuze van dit apparaat, of null.
 *
 * `opslag` is een object met `getItem`; in de browser is dat `localStorage`, in
 * een test een nagemaakt object. Alles wat geen bruikbare index is telt als
 * "niets onthouden" -- een privé-venster, gewiste opslag, een tab die
 * inmiddels weg is.
 */
export function leesKeuze(opslag, sleutel, aantal) {
  let ruw = null;
  try {
    ruw = opslag?.getItem?.(sleutel) ?? null;
  } catch {
    // Sommige browsers gooien op localStorage in een privé-venster. Dat is geen
    // fout in de kaart; dan is er gewoon niets onthouden.
    return null;
  }
  const n = Number(ruw);
  if (ruw === null || ruw === "" || !Number.isInteger(n)) return null;
  return n >= 0 && n < aantal ? n : null;
}

/** Onthoud de keuze van dit apparaat. Faalt stil: een keuze is geen data. */
export function schrijfKeuze(opslag, sleutel, index) {
  try {
    opslag?.setItem?.(sleutel, String(index));
    return true;
  } catch {
    return false;
  }
}

/**
 * Welke tab er open moet staan: het onthouden ervan, anders de standaard.
 */
export function openTab(config, tabs, opslag) {
  const onthouden = leesKeuze(opslag, sleutelVoor(tabs), tabs.length);
  return onthouden ?? standaardTab(config, tabs.length);
}
