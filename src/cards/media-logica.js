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
export function extraVoor(st, { zoeken = true } = {}) {
  if (!staatAan(st)) return [];
  const uit = [];
  if (kan(st, KENMERK.SHUFFLE_SET)) uit.push("shuffle");
  if (kan(st, KENMERK.REPEAT_SET)) uit.push("repeat");
  if (zoeken && isMaSpeler(st)) uit.push("search");
  // Groeperen vraagt twee dingen: de speler moet het kunnen, en het moet een
  // MA-speler zijn -- de speakerlijst komt uit het MA-label.
  if (zoeken && isMaSpeler(st) && kan(st, KENMERK.GROUPING)) uit.push("speakers");
  return uit;
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
