/**
 * Een camerabeeld in een kaart, met of zonder Home Assistants eigen speler.
 *
 * Twee kaarten hebben dit nodig -- de 3D-printer (kijken of het nog goed gaat)
 * en de beveiligingscamera -- en het is precies het soort ding dat je geen twee
 * keer wilt schrijven.
 *
 * ## Waarom `hui-image` en niet zelf een `<img>`
 *
 * `hui-image` is het element dat Home Assistant in zijn eigen picture-kaarten
 * gebruikt. Het kent de tokens van de camera-proxy, het ververst zichzelf, en
 * met `cameraView: "live"` schakelt het over op de echte stream (HLS of WebRTC)
 * in plaats van een plaatje per twee seconden. Dat allemaal nabouwen zou
 * betekenen dat we per integratie gaan raden welke stream er is.
 *
 * ## Waarom er tóch een terugval is
 *
 * Het is een LUI GELADEN element. Op een dashboard zonder picture-kaart is
 * `customElements.get("hui-image")` gewoon `undefined` -- precies de val van
 * valkuil 26, waar `dialog-box` ons al een keer een knop opleverde die soms wel
 * en soms niets deed. Staat hij er niet, dan tonen we het beeld zelf via de
 * camera-proxy. Dat is een stilstaand plaatje dat elke paar seconden ververst;
 * minder mooi, maar het is er altijd.
 *
 * De terugval gebruikt `entity_picture` uit de attributen van de camera zelf.
 * Daar zit het token in dat Home Assistant per entiteit uitgeeft, en dat is de
 * enige manier om zonder toegangstoken bij het beeld te komen.
 */

/**
 * Het beeldelement voor deze camera, opnieuw gebruikt als het al goed staat.
 *
 * Geeft `null` terug als er geen camera is opgegeven -- dan hoort er ook geen
 * lege lijst in de kaart te staan.
 *
 * @param {HTMLElement|null} bestaand het element dat er nu staat
 * @param {object} hass
 * @param {string} entityId de camera
 * @param {{live?: boolean, fit?: string}} opties
 * @returns {HTMLElement|null}
 */
export function camerabeeld(bestaand, hass, entityId, { live = false, fit = "cover" } = {}) {
  if (!entityId) return null;

  const kanHui = typeof customElements !== "undefined" && customElements.get("hui-image");
  const wens = kanHui ? "hui-image" : "img";

  // Hergebruiken en niet opnieuw maken: een `hui-image` die elke ronde vervangen
  // wordt, begint elke ronde opnieuw met verbinden -- en dan zie je bij een
  // livestream om de seconde een zwart vlak.
  let el = bestaand;
  if (!el || el.localName !== wens) {
    el = document.createElement(wens);
    el.className = "beeld";
  }

  if (kanHui) {
    // ALLEEN zetten wat werkelijk verandert.
    //
    // `cameraImage` en `cameraView` zijn de twee eigenschappen waar `hui-image`
    // zijn stream op herstart. Ze elke ronde opnieuw toekennen -- ook met
    // dezelfde waarde -- is vragen om een verbinding die opnieuw begint terwijl
    // de vorige nog aan het onderhandelen is. Dat is precies de fout die hij op
    // 27 augustus 2026 opstuurde:
    //
    //     Failed to set remote answer sdp: Called in wrong state: stable
    //
    // Die komt uit HA's eigen WebRTC-speler en betekent: er kwam een antwoord
    // binnen op een onderhandeling die al rond was. Twee starts over elkaar heen.
    const nieuweView = live ? "live" : "auto";
    if (el.cameraImage !== entityId) el.cameraImage = entityId;
    if (el.cameraView !== nieuweView) el.cameraView = nieuweView;
    if (el.fitMode !== fit) el.fitMode = fit;
    // `hass` moet wél elke keer mee: daar zitten de tokens in waarmee het beeld
    // opgehaald wordt, en die verlopen.
    el.hass = hass;
  } else {
    const st = hass?.states?.[entityId];
    const bron = st?.attributes?.entity_picture;
    if (bron && el.dataset.bron !== bron) {
      el.dataset.bron = bron;
      el.src = bron;
    }
    el.alt = st?.attributes?.friendly_name ?? entityId;
    el.style.objectFit = fit;
  }
  return el;
}

/**
 * Zet het beeld in dit vak, en haal weg wat er niet meer hoort.
 *
 * @returns {HTMLElement|null} het beeldelement, of null als er geen camera is
 */
export function zetCamerabeeld(vak, hass, entityId, opties) {
  if (!vak) return null;
  const bestaand = vak.querySelector(".beeld");
  const el = camerabeeld(bestaand, hass, entityId, opties);
  if (!el) {
    bestaand?.remove();
    return null;
  }
  if (el !== bestaand) {
    bestaand?.remove();
    vak.appendChild(el);
  }
  return el;
}
