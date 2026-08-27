/**
 * Speakers aan elkaar koppelen: wie speelt er mee, en wie kan dat.
 *
 * Zonder DOM, want dit is precies het rekenwerk waar een fout stil in blijft:
 * een koppelknop die altijd uit staat, of eentje die je aanbiedt op een speaker
 * die zich niet laat koppelen en dan een foutmelding geeft.
 *
 * ## Wie is de baas van een groep
 *
 * Home Assistant zet `group_members` op ELKE speler in de groep, met de baas
 * vooraan. Dat betekent dat je de lijst niet mag lezen als "wie hangt er aan
 * mij" -- op een speaker die zelf meespeelt staat dezelfde lijst, en dan zou
 * "koppel deze los" op de verkeerde speler landen.
 *
 * `join` gaat daarom altijd naar de BAAS met de anderen als `group_members`, en
 * `unjoin` altijd naar de speaker die eruit moet. Dat is ook wat Music Assistant
 * en Sonos ervan verwachten.
 */

/** De speakers die op dit moment samen spelen met deze speler. */
export function groepVan(hass, entityId) {
  const leden = hass?.states?.[entityId]?.attributes?.group_members;
  return new Set(Array.isArray(leden) ? leden : []);
}

/**
 * Kan deze speler überhaupt gekoppeld worden?
 *
 * `MediaPlayerEntityFeature.GROUPING` is bit 524288. Een tv-kastje of een
 * Chromecast-audio-groep meldt dat niet, en een knop aanbieden die gegarandeerd
 * mislukt is erger dan geen knop.
 */
export const KENMERK_GROUPING = 524288;

export function kanKoppelen(hass, entityId) {
  const st = hass?.states?.[entityId];
  if (!st || st.state === "unavailable") return false;
  return (Number(st.attributes?.supported_features) & KENMERK_GROUPING) !== 0;
}

/**
 * Hoe staat deze speaker ervoor ten opzichte van de speler van de kaart?
 *
 * @returns {"zelf"|"mee"|"los"|"kan-niet"}
 */
export function koppelStand(hass, entityId, hoofd) {
  if (entityId === hoofd) return "zelf";
  if (!kanKoppelen(hass, entityId)) return "kan-niet";
  return speeltMee(hass, entityId, hoofd) ? "mee" : "los";
}

/**
 * Speelt deze speaker mee met de hoofdspeler?
 *
 * DE LIJST VAN DE HOOFDSPELER IS LEIDEND. Dat is de afspraak van Home
 * Assistant: `group_members` staat op elke speler in de groep, met de baas
 * vooraan. Sonos en Music Assistant houden zich daaraan.
 *
 * De eigen lijst van de speaker is alleen een AANVULLING, voor integraties die
 * hem uitsluitend bij het lid zetten en niet bij de baas. Hij mag de lijst van
 * het hoofd niet tegenspreken.
 *
 * WAAROM DAT ANDERSOM GEPROBEERD IS EN WEER IS TERUGGEDRAAID
 *
 * In de testinstance bleef de demo-integratie na een `unjoin` de losgekoppelde
 * speaker in de lijst van de baas melden, terwijl die speaker zelf `[]` zei. De
 * verleiding is dan om de speaker zelf te geloven. Dat is één meting later
 * gemeten en het klopte niet: dezelfde demo zet bij `join` óók alleen de lijst
 * van de baas bij, dus met die regel leek KOPPELEN vervolgens niet te werken.
 *
 * De demo is in beide richtingen onbetrouwbaar aan de kant van het lid. Dat is
 * geen reden om de code te sturen op wat een demo doet -- het is een reden om
 * de afspraak van Home Assistant te volgen en het verschil op te schrijven.
 */
export function speeltMee(hass, entityId, hoofd) {
  if (groepVan(hass, hoofd).has(entityId)) return true;
  // Alleen als het hoofd helemaal niets meldt: dan is de eigen lijst van de
  // speaker het enige dat er is.
  if (groepVan(hass, hoofd).size === 0) {
    const eigen = hass?.states?.[entityId]?.attributes?.group_members;
    if (Array.isArray(eigen) && eigen.includes(hoofd)) return true;
  }
  return false;
}

/**
 * De service-aanroep die deze speaker erbij zet of eruit haalt.
 *
 * Geeft `null` terug als er niets te doen valt -- de speler zelf loskoppelen van
 * zichzelf is geen handeling, het is een lege groep.
 *
 * @returns {{domein: string, service: string, data: object, doel: object}|null}
 */
export function koppelOproep(hass, entityId, hoofd) {
  const stand = koppelStand(hass, entityId, hoofd);
  if (stand === "zelf" || stand === "kan-niet") return null;

  if (stand === "mee") {
    // Loskoppelen doet de speaker ZELF: hij verlaat de groep. Dit naar de baas
    // sturen zou de hele groep opheffen.
    return {
      domein: "media_player",
      service: "unjoin",
      data: {},
      doel: { entity_id: entityId },
    };
  }

  return {
    domein: "media_player",
    service: "join",
    data: { group_members: [entityId] },
    doel: { entity_id: hoofd },
  };
}
