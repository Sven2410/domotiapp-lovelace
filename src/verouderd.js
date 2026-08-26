/**
 * De pagina die zichzelf ververst als hij verouderd is.
 *
 * ## Waarom dit er is
 *
 * Op 26 augustus 2026 meldde de eigenaar dat één Android-telefoon de scenes
 * niet laadde en de andere wel. Gemeten op zijn eigen installatie: zijn Home
 * Assistant serveerde de nieuwste bundel, tot op de hash. De telefoon draaide
 * gewoon een oude. Hij loste het op door in de companion-app de frontendcache
 * te legen, en vroeg toen het enige juiste: kan dat niet vanzelf?
 *
 * ## Waarom `loader.py` dit niet al oploste
 *
 * De lader lost op dat een verouderde `index.html` naar een verouderde bundel
 * wijst: zijn URL staat vast, hij wordt nooit gecachet, en hij geeft de hash
 * van dít moment. Elke paginalading komt daardoor op de juiste bundel uit.
 *
 * Maar dat werkt alleen bij een PAGINALADING, en dat is precies wat er in de
 * companion-app niet gebeurt. Die houdt zijn webview dagen in leven; een
 * herstart van Home Assistant verbreekt de websocket en herstelt hem, en de
 * JavaScript blijft staan. De kaart die daar draait kan weken oud zijn.
 *
 * ## Hoe dit werkt
 *
 * De bundel weet met welke hash hij zelf geladen is: die staat in de `?v=` van
 * zijn eigen module-URL (`import.meta.url`). De lader weet welke hash er NU
 * geldt. Verschillen die twee, dan draait deze pagina oude code, en dan is één
 * `location.reload()` genoeg -- de lader zet de herlading vanzelf op de nieuwe
 * bundel.
 *
 * ## De twee dingen die hier gevaarlijk zijn
 *
 * 1. **Een herlaadlus.** Herlaadt de pagina en blijkt hij daarna nog steeds
 *    verouderd, dan herlaadt hij weer, en weer. Daarom onthoudt dit in
 *    `sessionStorage` voor WELKE serverhash er al een keer herladen is; die
 *    tweede keer gebeurt niet.
 * 2. **Herladen terwijl iemand bezig is.** Daarom alleen op het moment dat de
 *    pagina zichtbaar WORDT -- op een telefoon is dat precies wanneer je de app
 *    opent, vóór je iets aanraakt -- en nooit terwijl er een dialoog openstaat.
 *
 * Weten we onze eigen hash niet, dan gebeurt er niets. Niet weten is geen
 * reden om iemands dashboard te herladen.
 */

/** De lader. Vaste URL, `no-store`, nooit in een cache. Zie loader.py. */
export const LADER_URL = "/api/domotiapp_lovelace/loader.js";

/** Onthoudt voor welke serverhash we al herlaadden. Tegen een lus. */
const SLEUTEL = "domotiapp-lovelace-verversing";

/** Elk half uur, voor een wandtablet dat nooit uit beeld gaat. */
export const CONTROLE_INTERVAL = 1800000;

/**
 * De `?v=`-hash uit een stuk tekst: een module-URL of het antwoord van de
 * lader. Beide bevatten precies één `?v=`, en het is dezelfde.
 */
export function hashUit(tekst) {
  const gevonden = /[?&]v=([0-9a-fA-F]+)/.exec(String(tekst ?? ""));
  return gevonden ? gevonden[1].toLowerCase() : null;
}

/**
 * De hash die op de server geldt, of `null` als dat niet te bepalen is.
 *
 * `cache: "no-store"` bovenop de header van de lader zelf: de service worker
 * laat `/api/` al met rust, maar een webview die we niet kennen hoeft dat niet
 * te doen.
 */
export async function serverHash(haal) {
  try {
    const antwoord = await haal(LADER_URL, { cache: "no-store" });
    if (!antwoord?.ok) return null;
    return hashUit(await antwoord.text());
  } catch {
    // Geen netwerk is geen nieuws. Volgende keer beter.
    return null;
  }
}

/** Kleine hulpjes rond sessionStorage, die in een webview mag gooien. */
function gelezen() {
  try {
    return globalThis.sessionStorage?.getItem(SLEUTEL) ?? null;
  } catch {
    return null;
  }
}

function bewaard(waarde) {
  try {
    globalThis.sessionStorage?.setItem(SLEUTEL, waarde);
  } catch {
    // Geen opslag betekent geen lusbeveiliging, en dan liever niet herladen.
    return false;
  }
  return true;
}

/**
 * Beslist of deze pagina herladen moet worden.
 *
 * Los van de DOM zodat de beslissing zonder browser te testen is -- dat is
 * precies het soort rekenwerk waar een gewone unittest voor is (CLAUDE.md:
 * geen jsdom).
 *
 * @returns {"herladen"|"actueel"|"onbekend"|"al-geprobeerd"}
 */
export function oordeel(eigen, server, alGeprobeerd) {
  if (!eigen || !server) return "onbekend";
  if (eigen === server) return "actueel";
  if (alGeprobeerd === server) return "al-geprobeerd";
  return "herladen";
}

/**
 * Zet de bewaking aan. Roept `herlaad()` hoogstens één keer aan.
 *
 * Alles wat de buitenwereld raakt gaat via parameters, zodat een test hem
 * volledig kan naspelen.
 */
export function startVerversing({
  eigenUrl,
  haal = globalThis.fetch?.bind(globalThis),
  herlaad = () => globalThis.location?.reload(),
  doc = globalThis.document,
  interval = CONTROLE_INTERVAL,
  klok = setInterval,
} = {}) {
  const eigen = hashUit(eigenUrl);
  // Weten we niet welke bundel we zijn, dan bemoeien we ons nergens mee.
  if (!eigen || !haal) return () => {};

  let bezig = false;

  const controleer = async () => {
    if (bezig) return;
    // Niet herladen terwijl iemand iets openstaan heeft -- een kaarteditor,
    // het mediazoekscherm, een bevestigingsvraag. Dan is de volgende ronde
    // vroeg genoeg.
    if (doc?.querySelector?.("dialog[open], ha-dialog[open]")) return;
    bezig = true;
    try {
      const server = await serverHash(haal);
      if (oordeel(eigen, server, gelezen()) !== "herladen") return;
      if (!bewaard(server)) return;
      herlaad();
    } finally {
      bezig = false;
    }
  };

  // Geeft de belofte terug. Een luisteraar doet daar niets mee, maar zonder dat
  // valt er in een test niets te awaiten en meet je de toestand van vóór de
  // controle.
  const bijZichtbaar = () => (doc?.visibilityState === "visible" ? controleer() : undefined);

  doc?.addEventListener?.("visibilitychange", bijZichtbaar);
  const timer = klok(bijZichtbaar, interval);

  return () => {
    doc?.removeEventListener?.("visibilitychange", bijZichtbaar);
    clearInterval(timer);
  };
}
