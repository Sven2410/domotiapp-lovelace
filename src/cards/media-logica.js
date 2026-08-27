/**
 * Wat een mediaspeler kan en wat er op de kaart hoort te staan.
 *
 * Los van de kaart, en zonder DOM, om één reden: dit is het deel dat fout gaat.
 * Welke knoppen een speler aankan zit in een bitmasker dat per integratie
 * anders uitvalt -- een Chromecast kan geen vorige track, een radiostream heeft
 * geen pauze, een tv meldt een zender in plaats van een titel. Dat is te toetsen
 * in een gewone unittest, en dat gebeurt in `tests/js/media-logica.test.mjs`.
 *
 * De regel uit de familie geldt ook hier: wat het apparaat kan lees je uit het
 * apparaat, in plaats van er een instelling van te maken. Niemand hoort in een
 * editor aan te vinken dat zijn speaker een volumeknop heeft.
 */

/**
 * `MediaPlayerEntityFeature` uit Home Assistant.
 * Vaste waarden; ze mogen daar nooit meer veranderen, want elke integratie
 * schrijft ze weg in zijn state.
 */
export const KENMERK = {
  PAUSE: 1,
  SEEK: 2,
  VOLUME_SET: 4,
  VOLUME_MUTE: 8,
  PREVIOUS_TRACK: 16,
  NEXT_TRACK: 32,
  TURN_ON: 128,
  TURN_OFF: 256,
  PLAY_MEDIA: 512,
  VOLUME_STEP: 1024,
  SELECT_SOURCE: 2048,
  STOP: 4096,
  PLAY: 16384,
  SHUFFLE_SET: 32768,
  REPEAT_SET: 262144,
  GROUPING: 524288,
};

/** Kan deze speler dat? Een speler zonder `supported_features` kan niets. */
export const kan = (st, kenmerk) =>
  Boolean(Number(st?.attributes?.supported_features ?? 0) & kenmerk);

export const isUit = (st) => !st || st.state === "off";
/** Staat hij aan? Dan valt er iets te bedienen, ook als er niets speelt. */
export const staatAan = (st) =>
  Boolean(st) && !["off", "unavailable", "unknown"].includes(st.state);
export const isSpelend = (st) => st?.state === "playing";
/** Speelt er iets, of staat er iets klaar? Dan horen de knoppen er te staan. */
export const isActief = (st) =>
  Boolean(st) && !["off", "unavailable", "unknown", "idle", "standby"].includes(st.state);

/**
 * De knoppen die deze speler aankan, in de volgorde waarin ze horen te staan.
 *
 * Aan/uit staat vooraan en niet achteraan: het is de enige knop die de rest
 * betekenisloos maakt, en hij staat het verst van de knop waar je per ongeluk
 * op tikt terwijl je "volgende" bedoelt.
 */
export function knoppenVoor(st) {
  if (!st) return [];
  const uit = [];
  if (kan(st, KENMERK.TURN_ON) || kan(st, KENMERK.TURN_OFF)) uit.push("power");
  if (isUit(st)) return uit;
  if (kan(st, KENMERK.PREVIOUS_TRACK)) uit.push("prev");
  if (kan(st, KENMERK.PLAY) || kan(st, KENMERK.PAUSE) || kan(st, KENMERK.PLAY_MEDIA)) {
    uit.push("play");
  } else if (kan(st, KENMERK.STOP)) {
    // Een stream zonder pauze: stoppen is het enige dat hij kent.
    uit.push("stop");
  }
  if (kan(st, KENMERK.NEXT_TRACK)) uit.push("next");
  return uit;
}

/**
 * Op welke speler het volume slaat.
 *
 * Meestal de speler zelf. Maar bij een tv met een soundbar eronder zit het
 * geluid niet in de tv: de tv speelt, de soundbar bepaalt hoe hard. Dan vul je
 * die soundbar in als geluidsentiteit, en gaat alles op de volumeregel -- de
 * schuif, dempen, de stapjes -- naar hem toe in plaats van naar de speler.
 */
export const geluidsSpeler = (config) => config?.volume_entity || config?.entity;

/**
 * Wat er op de volumeregel hoort te staan.
 *
 * Een schuif als de speler een niveau aanneemt, anders twee knoppen als hij
 * alleen stapjes kent, en dempen als hij dat apart kan. Kan hij niets van dit
 * alles -- een tv die alleen via zijn afstandsbediening luider gaat -- dan komt
 * die regel er niet, in plaats van een schuif die nergens op aankomt. En staat
 * hij uit, dan valt er niets te regelen: dan is de kaart één rasterrij.
 */
export function volumeVoor(st) {
  // Ook een speler die stil staat mag harder: je zet het volume goed vóórdat
  // de muziek begint, niet erna. Alleen uit en onbereikbaar krijgen niets.
  if (!staatAan(st)) return [];
  const uit = [];
  if (kan(st, KENMERK.VOLUME_MUTE)) uit.push("mute");
  if (kan(st, KENMERK.VOLUME_SET)) uit.push("slider");
  else if (kan(st, KENMERK.VOLUME_STEP)) uit.push("steps");
  return uit;
}

/** Het volume als heel getal van 0 tot 100. */
export const volumePct = (st) =>
  Math.round(Math.min(1, Math.max(0, Number(st?.attributes?.volume_level ?? 0))) * 100);

/**
 * Heeft deze speler een volume dat iets BETEKENT?
 *
 * Gemeld op 27 augustus 2026, met een schermafdruk van zijn tv-ontvanger:
 * *"als ik een mediabox heb en geen speaker heb geselecteerd, staat het geluid
 * op nul, maar dan speelt het tv-geluid -- dus dan moet dat weg."*
 *
 * Zijn kastje meldt geen `volume_level` en kan er ook niets mee. `volumePct`
 * maakt van een ontbrekende waarde een 0, en dus stond er "0%" op de kaart
 * terwijl de tv gewoon geluid gaf. Dat is niet alleen lelijk maar ook onwaar --
 * het geluid komt van de televisie, en die staat niet op nul.
 *
 * Een percentage hoort er dus alleen te staan als de speler het getal ook
 * werkelijk kent.
 */
export const heeftVolume = (st) =>
  st?.attributes?.volume_level !== undefined && st?.attributes?.volume_level !== null;

export const isGedempt = (st) => Boolean(st?.attributes?.is_volume_muted);

/**
 * Is dit een speler van Music Assistant?
 *
 * `mass_player_type` zet MA op elke speler die van hem is. Dat is de enige zeef
 * die de kaart zelf kan uitvoeren -- het platform van een entiteit staat in het
 * entity registry en dat is serverwerk. Hij is goed genoeg voor waar hij voor
 * gebruikt wordt: bepalen of de zoekknop en het groeperen zin hebben.
 *
 * LET OP: dit attribuut verdwijnt zodra een entiteit `unavailable` is. Een
 * weggevallen speaker verliest dus zijn zoekknop. Dat is de juiste kant om op
 * te falen: zoeken op een speaker die er niet is, levert alleen een foutmelding.
 */
export const isMaSpeler = (st) => Boolean(st?.attributes?.mass_player_type);

export const shuffleAan = (st) => Boolean(st?.attributes?.shuffle);

/** `off`, `all` of `one` -- de drie standen die `media_player.repeat_set` kent. */
export const herhaalStand = (st) => {
  const stand = st?.attributes?.repeat;
  return ["off", "all", "one"].includes(stand) ? stand : "off";
};

/** Uit -> alles -> één -> uit. De volgorde die elke muziekspeler heeft. */
export const volgendeHerhaling = (stand) =>
  ({ off: "all", all: "one", one: "off" })[herhaalStandNaam(stand)] ?? "all";

const herhaalStandNaam = (stand) => (["off", "all", "one"].includes(stand) ? stand : "off");

/**
 * De knoppen op de derde regel: shuffle, herhalen, zoeken, speakers.
 *
 * Ze staan bewust niet bij vorige/afspelen/volgende. Die drie zijn wat je
 * tijdens het luisteren aanraakt; deze vier stel je één keer in of gebruik je om
 * iets nieuws te kiezen. Zeven knoppen op één regel van 56 pixels is geen kaart
 * meer maar een afstandsbediening.
 */
export function extraVoor(st, { zoeken = true, sleep = false } = {}) {
  if (!staatAan(st)) return [];
  const uit = [];
  if (kan(st, KENMERK.SHUFFLE_SET)) uit.push("shuffle");
  if (kan(st, KENMERK.REPEAT_SET)) uit.push("repeat");
  // De sleeptimer staat er alleen als hij aangezet is in de editor. Hij hoort
  // bij een speaker naast een bed en niet bij de tv in de woonkamer, en een
  // knoppenrij die voor iedereen even lang is leest rustiger. Standaard uit,
  // dus een bestaande kaart verandert niet.
  if (sleep) uit.push("sleep");
  // Eén knop voor Music Assistant, niet twee. Het groeperen zat achter een
  // eigen icoon naast de zoekknop, en dat bleek dubbelop: het zoekscherm toont
  // de speakers onderin, dus wie op zoeken tikt komt ze vanzelf tegen.
  if (zoeken && isMaSpeler(st)) uit.push("search");
  return uit;
}

/**
 * De bronnen van deze speler, of niets.
 *
 * Een tv-ontvanger heeft geen albums maar zenders, en die staan in `source_list`.
 * Drie voorwaarden, en alle drie doen ertoe:
 *
 * - de speler moet `SELECT_SOURCE` kunnen, anders is er niets om te kiezen;
 * - de lijst moet gevuld zijn -- een Sonos meldt het kenmerk soms wel en levert
 *   dan een lege lijst, en een knop die een leeg scherm opent is een kapotte knop;
 * - hij moet aanstaan. Een uitgeschakelde ontvanger accepteert geen zender, en
 *   de zender die er dan nog in staat is die van gisteren.
 *
 * De speler zelf bepaalt dit, niet de geluidsentiteit: het volume mag van de
 * soundbar komen, de zender komt altijd van het kastje.
 */
export function bronVoor(st, { tonen = true } = {}) {
  if (!tonen || !staatAan(st) || !kan(st, KENMERK.SELECT_SOURCE)) return null;

  // Een speler van Music Assistant heeft geen bronnen maar een wachtrij. Zijn
  // `source_list` is er eentje lang en heet "Music Assistant Queue" -- dat is
  // de eigen boekhouding van MA en geen keuze die iemand maakt. Gemeten op de
  // Sonos van de eigenaar: de MA-entiteit meldt precies dat, terwijl de
  // Sonos-entiteit ernaast veertien echte bronnen heeft (zijn radiozenders).
  if (isMaSpeler(st)) return null;

  const lijst = st?.attributes?.source_list;
  // Eén bron is geen keuze. Een scherm openen waar maar één regel in staat,
  // waarvan je er al naar luistert, is een knop die niets doet.
  if (!Array.isArray(lijst) || lijst.length < 2) return null;

  return { nu: st.attributes.source ?? null, aantal: lijst.length };
}

/**
 * Wat er onder de naam staat.
 *
 * Een titel met een artiest erachter als het muziek is, de zender als het
 * televisie is, en anders de bron of de app -- want "aan het spelen" zonder te
 * zeggen wát is precies de regel die niemand mist als hij er niet staat.
 *
 * @param {object|null} st
 * @param {(st: object) => string} vertaal de vertaling van Home Assistant zelf
 */
export function watSpeeltEr(st, vertaal = (s) => s?.state ?? "") {
  if (!st) return "";
  if (st.state === "unavailable") return "Niet bereikbaar";
  if (st.state === "off") return "Uit";
  if (st.state === "standby") return "Stand-by";

  const a = st.attributes ?? {};
  const titel = a.media_title || a.media_channel || "";
  const onder =
    a.media_artist || a.media_series_title || a.media_album_name || a.app_name || a.source || "";

  if (st.state === "idle" || !titel) {
    // Niets aan het spelen: dan is de app of de bron het enige dat iets zegt.
    return onder || vertaal(st);
  }
  return onder && onder !== titel ? `${titel} · ${onder}` : titel;
}

/** Het icoon dat bij dit soort speler hoort. */
export function mediaIcoon(st) {
  const dc = st?.attributes?.device_class;
  if (dc === "tv") return "tv";
  if (dc === "receiver") return "radio";
  return "speaker";
}

/* ==========================================================================
   DE ALGEMENE MEDIASPELER

   Gevraagd op 26 augustus 2026: "een vinkje bij de mediaspeler kaart dat het
   een algemene mediaspeler wordt zodat ik speaker kan selecteren waar ik media
   op wil afspelen -- een soort sonos card. De inhoud moet hetzelfde blijven."

   Dat laatste is wat de vorm bepaalt. De kaart wordt NIET iets anders: hij
   krijgt er een keuze bovenop, en die keuze wisselt alleen welke speler hij
   bedient. Zoeken, groeperen, Music Assistant, het volume -- alles blijft
   werken zoals het werkte, want alles hangt aan `config.entity` en dat is
   precies de sleutel die de keuze omzet.

   DE KEUZE HOORT BIJ HET APPARAAT, net als bij de tabbladenkaart. Kies je op je
   telefoon de keuken, dan mag de tablet in de gang op de woonkamer blijven
   staan. Dus `localStorage`, en niets server-side.
   ========================================================================== */

const SPELER_VOORVOEGSEL = "domotiapp-media-speler:";

/**
 * De speakers waaruit je mag kiezen.
 *
 * Niets ingesteld betekent ALLE mediaspelers in huis -- dat is wat "algemeen"
 * betekent. Staat er een lijst, dan is dat de lijst; de vaste speler van de
 * kaart hoort er altijd bij, anders kun je nooit terug naar waar je begon.
 *
 * Op naam gesorteerd, want een keuzelijst op entiteits-id leest als een
 * databasedump.
 */
export function spelersVan(config, hass) {
  const naam = (id) => hass?.states?.[id]?.attributes?.friendly_name ?? id;
  const bestaat = (id) => Boolean(hass?.states?.[id]);
  const alle = () => Object.keys(hass?.states ?? {}).filter((id) => id.startsWith("media_player."));

  // Let op de volgorde: eerst kijken of er een lijst IS, en pas daarna of er
  // iets van over is. Filteren we eerst, dan valt een lijst met alleen een
  // verhuisde entiteit terug op "alle speakers in huis" -- precies het
  // tegenovergestelde van wat er ingesteld staat.
  const ingesteld = Array.isArray(config?.players) && config.players.length;
  const lijst = ingesteld
    ? [
        ...new Set([
          ...(bestaat(config?.entity) ? [config.entity] : []),
          ...config.players.filter(bestaat),
        ]),
      ]
    : automatisch(alle(), hass);

  return lijst.sort((a, b) => String(naam(a)).localeCompare(String(naam(b)), "nl"));
}

/**
 * Welke spelers er vanzelf in de lijst komen als er niets is ingesteld.
 *
 * ALLEEN DE SPEAKERS VAN MUSIC ASSISTANT, en dat is een keuze met een reden.
 * "Alle mediaspelers in huis" leverde een lijst met de Apple TV en de
 * televisie erin -- gemeld op 26 augustus 2026. Dat zijn geen plekken waar je
 * muziek naartoe stuurt; dat zijn schermen. Music Assistant markeert zijn eigen
 * spelers met `mass_player_type`, en dat is precies het onderscheid dat je hier
 * wilt.
 *
 * Draait er geen Music Assistant, dan valt hij terug op alles. Anders is de
 * keuzelijst leeg en lijkt de kaart stuk, terwijl er niets stuk is.
 */
function automatisch(ids, hass) {
  const ma = ids.filter((id) => isMaSpeler(hass?.states?.[id]));
  return ma.length ? ma : ids;
}

/**
 * De sleutel waaronder de keuze van dit apparaat staat.
 *
 * Afgeleid van de LIJST en niet van de kaart: twee kaarten met dezelfde
 * speakers zijn voor de gebruiker dezelfde keuze, en een kaart die je hernoemt
 * hoort zijn keuze niet kwijt te raken. Dezelfde afweging als bij de
 * tabbladenkaart.
 */
export const spelerSleutel = (lijst) => SPELER_VOORVOEGSEL + (lijst ?? []).join("|");

/**
 * Welke speler de kaart bedient: het onthouden ervan, anders die uit de config.
 *
 * Een onthouden speler die niet meer bestaat -- verhuisd, hernoemd, integratie
 * eruit -- telt als niets onthouden. Anders bedient de kaart een entiteit die
 * er niet is en blijft hij leeg zonder te zeggen waarom.
 */
export function actieveSpeler(config, lijst, opslag) {
  if (!config?.speaker_select) return config?.entity ?? "";
  let ruw = null;
  try {
    ruw = opslag?.getItem?.(spelerSleutel(lijst)) ?? null;
  } catch {
    // Een privévenster dat localStorage dichthoudt is geen reden om niets te
    // spelen.
    ruw = null;
  }
  if (ruw && lijst?.includes(ruw)) return ruw;
  if (config.entity && lijst?.includes(config.entity)) return config.entity;
  return config.entity || lijst?.[0] || "";
}

/** Onthoud de gekozen speler. Faalt stil: een keuze is geen data. */
export function schrijfSpeler(opslag, lijst, id) {
  try {
    opslag?.setItem?.(spelerSleutel(lijst), String(id));
    return true;
  } catch {
    return false;
  }
}
