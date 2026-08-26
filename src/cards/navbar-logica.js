/**
 * Wat er in de balk past en wat achter "Meer" verdwijnt.
 *
 * Dit is het hele rekenwerk van de navbalk, zonder DOM en zonder `hass`. De
 * kaart eromheen is niet in een gewone Node-test te vangen; dit wel, en juist
 * hier zit het gedrag dat stilletjes fout gaat: de knop die net wel of net niet
 * meer past.
 *
 * DE VAL DIE HIER ZIT, EN WAAROM `verdeel` ZO REKENT
 *
 * "Toon vier knoppen" en "er zijn vijf knoppen" geeft niet vier in de balk en
 * een in het menu. De meer-knop is zelf ook een knop en neemt een plek in, dus
 * het worden er drie in de balk en twee in het menu. Reken je dat niet zo, dan
 * staan er bij vijf items vijf dingen in een balk die er vier breed is, en op
 * een telefoon vallen ze over elkaar heen. Dat is precies waarvoor deze kaart
 * bestaat -- je krijgt er in de breedte niet veel kwijt.
 *
 * Past alles, dan is er geen meer-knop. Een menu met niets erin is een knop die
 * niets doet.
 */

/** Hoeveel knoppen er in de balk mogen staan, de meer-knop meegerekend. */
export const BALK_MIN = 2;
export const BALK_MAX = 6;
export const BALK_STANDAARD = 4;

/** Meer dan dit wordt onbeheersbaar in de editor en onvindbaar in het menu. */
export const ITEMS_MAX = 20;

/**
 * Hoeveel subknoppen er onder één knop mogen hangen.
 *
 * Ze klappen boven de knop open, en die lijst mag het scherm niet vullen: dan
 * is het geen menu meer maar een pagina, en dan hoort het een pagina te zijn.
 */
export const SUB_MAX = 8;

/** Houd het aantal binnen de grenzen; alles onleesbaars wordt de standaard. */
export function klemBalk(waarde) {
  // Niets ingevuld is niet hetzelfde als nul ingevuld. `Number(null)` en
  // `Number("")` zijn allebei 0, en dat zou hier op de ondergrens klemmen: een
  // config zonder `max` kreeg dan twee knoppen in plaats van de standaard vier.
  if (waarde === null || waarde === undefined || waarde === "") return BALK_STANDAARD;
  const n = Math.round(Number(waarde));
  if (!Number.isFinite(n)) return BALK_STANDAARD;
  return Math.min(BALK_MAX, Math.max(BALK_MIN, n));
}

/**
 * Een knop uit de config, in de vorm die de kaart verwacht.
 *
 * Een string is toegestaan en betekent "alleen een pad". Dat is de vorm waarin
 * een met de hand geschreven config er meestal uitziet, en hem weigeren zou
 * betekenen dat de kaart leeg blijft zonder te zeggen waarom.
 */
export function asItem(ruw, diep = true) {
  if (typeof ruw === "string") return { name: "", icon: "", path: ruw, items: [] };
  const i = ruw ?? {};
  return {
    name: typeof i.name === "string" ? i.name : "",
    icon: typeof i.icon === "string" ? i.icon : "",
    // `url` en `navigation_path` zijn hoe Home Assistant en de navbar-kaart uit
    // HACS het noemen. Een config die daarvandaan komt hoort te werken.
    path:
      typeof i.path === "string"
        ? i.path
        : typeof i.url === "string"
          ? i.url
          : typeof i.navigation_path === "string"
            ? i.navigation_path
            : "",
    // Eén laag diep en niet meer. Een menu in een menu in een navbalk is geen
    // navigatie meer maar een boomstructuur, en die hoort in de zijbalk van
    // Home Assistant en niet in een balk van vijf knoppen. `diep = false` is
    // wat die grens bewaakt: een subknop met zelf weer `items` verliest ze
    // hier, in plaats van in de kaart een verrassing te worden.
    items:
      diep && Array.isArray(i.items)
        ? i.items.slice(0, SUB_MAX).map((s) => asItem(s, false))
        : [],
  };
}

/**
 * De subknoppen van een knop die echt iets voorstellen.
 *
 * Los van `asItem` omdat de kaart en de editor er allebei op rekenen en het
 * antwoord hetzelfde moet zijn: een half ingevulde subknop hoort in de editor
 * te blijven staan terwijl je hem maakt, en niet in de kaart te verschijnen.
 */
export const subVan = (item) => (Array.isArray(item?.items) ? item.items.filter(gevuld) : []);

/** Heeft deze knop een menu in plaats van een bestemming? */
export const heeftSub = (item) => subVan(item).length > 0;

/**
 * Heeft deze plek iets om te tonen?
 *
 * Een naam of een icoon is genoeg. Een knop zonder pad doet niets, maar hem
 * verbergen zou betekenen dat een half ingevulde knop uit de editor verdwijnt
 * terwijl je hem aan het maken bent.
 */
export const gevuld = (item) =>
  Boolean(item && (item.name?.trim() || item.icon?.trim() || item.path?.trim()));

/** De knoppen uit een config, genormaliseerd en afgekapt. */
export function itemsVan(config) {
  const ruw = Array.isArray(config?.items) ? config.items : [];
  // Expres een pijlfunctie en geen kale `asItem`: Array.map geeft de INDEX als
  // tweede argument mee, en dat is bij deze functie het vlaggetje dat bepaalt
  // of de subknoppen meekomen. Met `.map(asItem)` verloor knop 0 -- en alleen
  // knop 0 -- zijn hele menu. Gevonden door de test hieronder, niet op de kaart.
  return ruw.slice(0, ITEMS_MAX).map((i) => asItem(i));
}

/**
 * Splits de knoppen in wat in de balk staat en wat achter "Meer" zit.
 *
 * @returns {{balk: object[], meer: object[], heeftMeer: boolean}}
 */
export function verdeel(items, maxBalk = BALK_STANDAARD) {
  const zichtbaar = (items ?? []).filter(gevuld);
  const max = klemBalk(maxBalk);

  if (zichtbaar.length <= max) {
    return { balk: zichtbaar, meer: [], heeftMeer: false };
  }
  // De meer-knop kost zelf een plek in de balk.
  const ruimte = Math.max(1, max - 1);
  return {
    balk: zichtbaar.slice(0, ruimte),
    meer: zichtbaar.slice(ruimte),
    heeftMeer: true,
  };
}

/**
 * Wat een tik op een pad moet doen, als actie van Home Assistant.
 *
 * Drie soorten paden, en ze horen alle drie te werken zonder dat iemand een
 * keuzelijst hoeft in te vullen:
 *
 *   /lovelace/keuken   een view op dit dashboard  -> navigate
 *   #keuken            een pop-up van bubble-card -> navigate (zelfde view)
 *   https://...        iets buiten HA             -> url
 *
 * Een leeg pad geeft `{action: "none"}` en niet `null`: de kaart geeft dit
 * rechtstreeks aan `runAction`, en die kent "none" al als "doe niets".
 */
export function actieVoor(pad) {
  const p = String(pad ?? "").trim();
  if (!p) return { action: "none" };
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(p) || p.startsWith("mailto:"))
    return { action: "url", url_path: p };
  return { action: "navigate", navigation_path: p };
}
