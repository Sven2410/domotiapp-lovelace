/**
 * De bibliotheek van Music Assistant, aan de kaartkant.
 *
 * Hier staat WAT er gevraagd wordt, niet hoe het eruitziet -- het tekenen zit in
 * `zoekscherm.js`. Dat is niet alleen netheid: de vorm van een verzoek is
 * precies waar dit stuk fout kan gaan, en zo is dat te toetsen zonder browser.
 *
 * ## De twee vormen van een favoriet
 *
 * Aanzetten gaat op **uri**: Music Assistant zoekt zelf op wat erachter zit, en
 * zet het item zo nodig eerst in de bibliotheek. Uitzetten gaat op
 * **bibliotheeknummer plus soort**, want dan bestaat het item al en heeft MA
 * geen uri nodig -- die kent hij zelf.
 *
 * Dat is niet ons ontwerp maar dat van MA, en het is precies het soort verschil
 * dat je een keer omdraait. Daarom staat het in één functie met een test eronder
 * in plaats van op twee plekken in een klikafhandelaar.
 *
 * ## Waarom dit over onze eigen commando's gaat en niet rechtstreeks naar MA
 *
 * De API van Music Assistant vraagt sinds 2.9 authenticatie. Home Assistant is
 * al ingelogd, dus leent de serverkant die verbinding -- zie het blok in
 * `ma.py`. Een kaart in de browser zou anders een eigen token moeten dragen.
 */

/** De soorten die de bibliotheek kent, in de volgorde van de filterknoppen. */
export const BIB_SOORTEN = [
  ["playlists", "Afspeellijsten"],
  ["radio", "Radio"],
  ["tracks", "Nummers"],
  ["albums", "Albums"],
  ["artists", "Artiesten"],
];

/** Van onze soortnaam naar het woord dat onder een regel komt te staan. */
export const BIB_WOORD = {
  playlists: "Afspeellijst",
  radio: "Radiozender",
  tracks: "Nummer",
  albums: "Album",
  artists: "Artiest",
};

const CMD = (naam) => `domotiapp_lovelace/media/${naam}`;

/**
 * Het bericht dat een hartje aan- of uitzet.
 *
 * Geeft `null` terug als het niet kan: uitzetten van iets dat nog niet in de
 * bibliotheek staat heeft geen bibliotheeknummer, en dan is er niets om weg te
 * halen. Dat is geen fout maar een knop die niet had moeten kunnen.
 */
export function favorietBericht(item, aan) {
  if (!item) return null;
  if (aan) {
    if (!item.uri) return null;
    return { type: CMD("favorite"), favorite: true, uri: item.uri };
  }
  const soort = soortVan(item);
  if (!soort || !item.library_item_id) return null;
  return {
    type: CMD("favorite"),
    favorite: false,
    kind: soort,
    library_item_id: String(item.library_item_id),
  };
}

/**
 * Van het `media_type` van een item naar onze soortnaam.
 *
 * MA praat in enkelvoud (`track`), onze commando's in meervoud (`tracks`), en
 * `radio` is in allebei hetzelfde. Die laatste uitzondering is de reden dat dit
 * een tabel is en geen `+ "s"`.
 */
export function soortVan(item) {
  const t = item?.media_type;
  return {
    track: "tracks",
    album: "albums",
    artist: "artists",
    playlist: "playlists",
    radio: "radio",
    podcast: "podcasts",
    audiobook: "audiobooks",
  }[t] ?? null;
}

/**
 * De omgekeerde tabel van `soortVan`: van onze soortnaam naar MA's media_type.
 *
 * Nodig zodra de serverkant vertelt waar een net-favoriet item in de bibliotheek
 * belandde: dat antwoord komt in ONZE woorden terug, en het item op het scherm
 * draagt MA's woord.
 */
export const SOORT_ENKELVOUD = {
  tracks: "track",
  albums: "album",
  artists: "artist",
  playlists: "playlist",
  radio: "radio",
  podcasts: "podcast",
  audiobooks: "audiobook",
};

/** Kan dit item favoriet gemaakt worden? Een item zonder uri niet. */
export const kanFavoriet = (item) => Boolean(item?.uri);

/* -------------------------------------------------------------- verzoeken */

export const haalBibliotheek = (hass, soort, { favoriet = false, zoek = "", limiet = 50 } = {}) =>
  hass
    .callWS({
      type: CMD("library"),
      kind: soort,
      favorite: favoriet,
      ...(zoek ? { search: zoek } : {}),
      limit: limiet,
    })
    .then((a) => a?.items ?? []);

export const zetFavoriet = (hass, item, aan) => {
  const bericht = favorietBericht(item, aan);
  if (!bericht) return Promise.reject(new Error("Dit item kan niet favoriet gemaakt worden."));
  return hass.callWS(bericht);
};

export const maakLijst = (hass, naam) =>
  hass.callWS({ type: CMD("playlist/create"), name: naam }).then((a) => a?.playlist ?? null);

export const verwijderLijst = (hass, lijst) =>
  hass.callWS({ type: CMD("playlist/remove"), library_item_id: String(lijst.library_item_id) });

export const haalLijstNummers = (hass, lijst) =>
  hass
    .callWS({
      type: CMD("playlist/tracks"),
      library_item_id: String(lijst.library_item_id),
      provider: lijst.provider ?? "library",
    })
    .then((a) => a?.tracks ?? []);

export const voegToeAanLijst = (hass, lijst, uris) =>
  hass.callWS({
    type: CMD("playlist/add_tracks"),
    library_item_id: String(lijst.library_item_id),
    uris,
  });

export const haalUitLijst = (hass, lijst, posities) =>
  hass.callWS({
    type: CMD("playlist/remove_tracks"),
    library_item_id: String(lijst.library_item_id),
    positions: posities,
  });
