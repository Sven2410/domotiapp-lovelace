/**
 * De beveiligingscamera: live kijken, inzoomen, en naar een preset draaien.
 *
 * Gevraagd op 27 augustus 2026: *"En kan je een beveiligingscamerakaart maken?
 * Met een camera die presets ondersteunt, dat dat ook weergegeven wordt. Live
 * kunnen kijken en kunnen inzoomen bijvoorbeeld."*
 *
 * ## Hoe "presets ondersteunt" wordt herkend
 *
 * Er is geen standaard voor. Wat er in Home Assistant terechtkomt hangt af van
 * de integratie: Reolink zet zijn presets in een `select`-entiteit (één lijst,
 * één keuze), Amcrest en Dahua leveren losse `button`-entiteiten, en wie zijn
 * camera via ONVIF binnenhaalt heeft een `select` met een andere naam.
 *
 * De kaart doet daarom geen aanname. Kies je een `select`, dan worden zijn
 * opties de knoppen -- en die lijst komt uit de entiteit zelf, dus hij verandert
 * mee als je in de camera-app een preset toevoegt. Kies je losse knoppen, dan
 * zijn dat de knoppen. Beide tegelijk mag ook.
 *
 * ## Op het beeld staat niets
 *
 * Gevraagd op 27 augustus 2026: *"ik wil alle icons weg hebben."* Er stonden er
 * vier -- uitzoomen, inzoomen, live, en groot bekijken -- en alle vier hadden ze
 * een weg eromheen die je toch al gebruikt:
 *
 * - zoomen doe je met twee vingers, met het wiel of met een dubbeltik;
 * - groot bekijken doe je door op het beeld te tikken;
 * - live zet je in de editor, want dat is een keuze per kaart en niet iets wat
 *   je per keer aan- en uitzet.
 *
 * Wat er wél op het beeld staat, staat er omdat het nergens anders kan: de naam,
 * het merkje "Beweging", "LIVE", het draaikruis -- en de presets, die daar op
 * zijn verzoek zijn beland: *"nu komt die keuzelijst eronder te staan maar hij
 * moet in het beeld komen."*
 *
 * ## Inzoomen
 *
 * Met het wiel, met twee vingers, of met een dubbeltik. Het rekenwerk (klemmen,
 * zoomen rondom de vinger) staat in `zoom-logica.js` met tests eronder; hier
 * staat alleen het luisteren naar vingers.
 *
 * Belangrijk: zolang er ingezoomd is, mag een sleep NIET als een tik op de kaart
 * gelden. Anders opent er een pop-up zodra je het beeld verschuift.
 */

import { DacCard, INCOMPLETE, TONES, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel, section } from "../editor/base.js";
import { resolve } from "../icons.js";
import { isOn, moreInfo, nameOf, stateOf } from "../ha.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { zetCamerabeeld } from "./camerabeeld.js";
import { cameraVanMelder, hoortBij } from "./camera-logica.js";
import {
  ALGEMEEN,
  ALLE_SOORTEN,
  SOORTEN,
  alsDatumveld,
  dagLabel,
  dagOm,
  dun,
  filterGebeurtenissen,
  gebeurtenissenUit,
  positie,
  raadSoort,
  soortVan,
  telPerSoort,
  tijdLabel,
  uitDatumveld,
  uurMerken,
  verschuifDag,
} from "./camera-tijdlijn.js";
import { MIN_ZOOM, alsTransform, klemPositie, zoomRondom } from "./zoom-logica.js";

/** De vier richtingen, met de service-aanroep die erbij hoort. */
const RICHTINGEN = [
  { k: "up", icoon: "arrowUp", label: "Omhoog" },
  { k: "left", icoon: "chevronRight", label: "Links", draai: 180 },
  { k: "right", icoon: "chevronRight", label: "Rechts" },
  { k: "down", icoon: "arrowDown", label: "Omlaag" },
];

/**
 * Staat er iets ingevuld dat met presets of draaien te maken heeft?
 *
 * Nodig voor de terugval van het nieuwe vinkje: een kaart die al presets had
 * voordat dat vinkje bestond, hoort ze te houden. Zonder deze toets zouden zijn
 * bestaande camerakaarten hun presets kwijtraken op het moment van bijwerken --
 * dat is precies het soort stille achteruitgang waar je pas een dag later
 * achterkomt.
 */
function heeftPtzVelden(c) {
  return Boolean(
    c.presets ||
      (Array.isArray(c.preset_buttons) && c.preset_buttons.length) ||
      RICHTINGEN.some((r) => c[`ptz_${r.k}`])
  );
}

class CameraCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }

    .card {
      padding: 0; overflow: hidden;
      display: flex; flex-direction: column;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ---- het beeld ----
       GEEN vaste beeldverhouding. Die stond op 16:9 met cover, en dan wordt
       een camera die iets anders levert bijgesneden -- gemeld op 27 augustus
       2026 met een schermafdruk: "de kaart mag auto grootte worden, nu zie je
       dat er een deel mist". Klopte: bij zijn oprit viel de boven- en onderkant
       weg.

       Nu volgt de kaart het beeld. De minimumhoogte is er alleen voor het moment
       dat er nog niets geladen is; zodra het beeld er staat, bepaalt dat de
       hoogte. */
    .vak {
      position: relative; width: 100%; min-height: 120px;
      overflow: hidden; background: #000;
      touch-action: none; cursor: default;
      display: flex;
    }
    :host([zoom]) .vak { cursor: grab; }
    :host([sleept]) .vak { cursor: grabbing; }

    .schuif {
      transform: var(--tf, none); transform-origin: center center;
      transition: transform 160ms ease-out;
      will-change: transform;
    }
    :host([sleept]) .schuif { transition: none; }
    /* height:auto en contain: het beeld houdt zijn eigen verhouding en er
       gaat niets af. */
    .schuif { width: 100%; }
    .schuif .beeld, .schuif img, .schuif hui-image {
      display: block; width: 100%; height: auto; object-fit: contain;
    }
    .vak .leeg {
      position: absolute; inset: 0; display: grid; place-items: center;
      font-size: 12.5px; color: var(--dac-ink-3);
    }

    /* De naam en de meldingen liggen op het beeld. Een balk eronder zou de
       kaart een rasterrij hoger maken voor twee woorden. */
    .over {
      position: absolute; left: 0; right: 0; top: 0; z-index: 2;
      display: flex; align-items: center; gap: 7px; padding: 9px 10px;
      background: linear-gradient(to bottom, rgba(0,0,0,.62), transparent);
      pointer-events: none;
    }
    .over .nm {
      font-size: 13px; font-weight: 600; color: #fff; min-width: 0;
      text-shadow: 0 1px 3px rgba(0,0,0,.7);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .over .rek { flex: 1 1 auto; }
    .merk {
      flex: 0 0 auto; display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 8px; border-radius: var(--dac-radius-pill);
      font-size: 10.5px; font-weight: 600; letter-spacing: .02em;
      background: color-mix(in srgb, var(--dac-bg) 62%, transparent);
      color: var(--dac-ink-2); border: 1px solid var(--dac-border-hi);
    }
    .merk .icon { width: 11px; height: 11px; }
    .merk[hidden] { display: none; }
    /* Meerdere melders naast elkaar. Ze mogen afbreken: bij een camera die
       persoon, auto én dier los meldt kunnen er drie tegelijk aanstaan. */
    .melders { display: flex; gap: 5px; flex-wrap: wrap; justify-content: flex-end; min-width: 0; }
    .merk[data-soort="live"] { color: var(--dac-bad); border-color: color-mix(in srgb, var(--dac-bad) 55%, transparent); }
    .merk[data-soort="live"] .stip {
      width: 6px; height: 6px; border-radius: 50%; background: var(--dac-bad);
      animation: knipper 2s ease-in-out infinite;
    }
    @keyframes knipper { 0%, 100% { opacity: 1 } 50% { opacity: .25 } }
    @media (prefers-reduced-motion: reduce) { .merk[data-soort="live"] .stip { animation: none; } }
    .merk[data-soort="beweging"] { color: var(--dac-warn); border-color: color-mix(in srgb, var(--dac-warn) 55%, transparent); }

    /* Er staan GEEN knoppen meer op het beeld.
       Gevraagd op 27 augustus 2026: "ook het plusje en minnetje wil ik weg
       hebben, ik wil gewoon inzoomen met mijn vingers. Ook de camera kan weg
       want als je erop tikt dan vergroot hij toch wel. Ik wil alle icons weg
       hebben dus."

       Zoomen gaat met twee vingers, met het wiel of met een dubbeltik; groot
       bekijken met een gewone tik. Live staat in de editor. Wat overblijft is
       het beeld -- en de presets, als je die hebt. */

    /* De richtingsknoppen, links onderin. Alleen als ze zijn ingesteld. */
    .ptz {
      position: absolute; left: 8px; bottom: 8px; z-index: 3;
      display: grid; grid-template-columns: repeat(3, 28px); grid-template-rows: repeat(2, 28px);
      gap: 3px;
    }
    .ptz[hidden] { display: none; }
    .ptz button {
      display: grid; place-items: center; cursor: pointer; padding: 0; font: inherit;
      color: var(--dac-ink);
      background: color-mix(in srgb, var(--dac-bg) 68%, transparent);
      backdrop-filter: blur(8px);
      border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-sm);
    }
    .ptz button .icon { width: 14px; height: 14px; }
    .ptz [data-r="up"] { grid-area: 1 / 2; }
    .ptz [data-r="left"] { grid-area: 2 / 1; }
    .ptz [data-r="down"] { grid-area: 2 / 2; }
    .ptz [data-r="right"] { grid-area: 2 / 3; }

    /* ---- de presets, IN het beeld ----
       "Nu komt die keuzelijst eronder te staan maar hij moet in het beeld
       komen." Dus liggen ze over de onderrand, met een verloop erachter zodat
       ze leesbaar blijven op elk beeld. */
    .presets {
      position: absolute; left: 0; right: 0; bottom: 0; z-index: 3;
      display: flex; gap: 6px; padding: 22px 10px 9px; overflow-x: auto;
      scrollbar-width: none; -webkit-overflow-scrolling: touch;
      background: linear-gradient(to top, rgba(0,0,0,.66), transparent);
    }
    .presets::-webkit-scrollbar { display: none; }
    .presets[hidden] { display: none; }
    .presets button {
      flex: 0 0 auto; padding: 7px 12px; cursor: pointer; font: inherit;
      font-size: 12px; font-weight: 500; white-space: nowrap;
      color: var(--dac-ink); border-radius: var(--dac-radius-pill);
      background: color-mix(in srgb, var(--dac-bg) 68%, transparent);
      backdrop-filter: blur(8px);
      border: 1px solid var(--dac-border-hi);
      transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
    }
    .presets button[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
      background: color-mix(in srgb, var(--dac-accent) 16%, transparent);
    }
    @media (hover: hover) { .presets button:hover { border-color: var(--dac-border-hi); } }

    /* ---- meerdere camera's ---- */
    /* Lucht tussen het beeld en de knoppen. Ze plakten tegen de onderrand aan
       -- gemeld op 27 augustus 2026: "de geselecteerde mogelijkheden staan veel
       te dicht op de camera". */
    .cams { display: flex; gap: 6px; padding: 11px 10px; overflow-x: auto; scrollbar-width: none; }
    .cams::-webkit-scrollbar { display: none; }
    .cams[hidden] { display: none; }
    .cams button {
      flex: 0 0 auto; padding: 6px 11px; cursor: pointer; font: inherit;
      font-size: 11.5px; white-space: nowrap;
      color: var(--dac-ink-3); background: transparent;
      border: 1px solid transparent; border-radius: var(--dac-radius-pill);
    }
    /* De camera waar je naar KIJKT valt op, in het accent. Dat stond eerst op
       een grijstint die naast de andere knoppen nauwelijks verschilde -- en dan
       weet je niet welke je ziet. Gemeld op 27 augustus 2026. */
    .cams button[aria-pressed="true"] {
      color: var(--dac-accent-hi); font-weight: 600;
      background: color-mix(in srgb, var(--dac-accent) 18%, transparent);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
    }

    /* ---- de tijdlijn ----
       Gevraagd op 28 augustus 2026: "ik wil gewoon op de meldingen een time
       line met filters zoals tijd welke camera etc."

       Onder het beeld, want dat was zijn keuze toen ik hem drie plekken
       voorlegde. Alles hierin is dus zichtbaar zodra het vinkje aanstaat -- er
       zit geen tweede klik tussen. */
    .tijdlijn { position: relative; padding: 0 10px 11px; display: flex; flex-direction: column; gap: 8px; }
    .tijdlijn[hidden] { display: none; }
    .tijdlijn .rij { display: flex; align-items: center; gap: 6px; min-width: 0; }

    /* De dagkiezer. De pijlen zijn 30px breed: kleiner is op een telefoon
       mikken, en dit is een knop die je vaak achter elkaar indrukt. */
    .tijdlijn .pijl {
      flex: 0 0 auto; width: 30px; height: 30px; display: grid; place-items: center;
      padding: 0; font: inherit; cursor: pointer; color: var(--dac-ink-2);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
    }
    .tijdlijn .pijl .icon { width: 15px; height: 15px; }
    .tijdlijn .pijl[data-dag="-1"] .icon { transform: rotate(180deg); }
    .tijdlijn .pijl[disabled] { opacity: .35; cursor: default; }
    .tijdlijn .datum {
      flex: 0 0 auto; padding: 6px 12px; cursor: pointer; font: inherit;
      font-size: 12px; font-weight: 600; color: var(--dac-ink);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
    }
    /* Het echte datumveld ligt eronder en is onzichtbaar: de knop opent zijn
       kiezer. Op display:none zetten mag niet -- dan weigert Chrome
       showPicker(). */
    .tijdlijn .datumveld {
      position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;
    }
    .tijdlijn .rek { flex: 1 1 auto; }
    .tijdlijn .totaal { flex: 0 0 auto; font-size: 11.5px; color: var(--dac-ink-3); }

    /* De vijf filterknoppen. Hij vroeg om vijf iconen; ze staan er alle vijf,
       ook als er geen melder van die soort is -- dan gedempt, zodat de rij niet
       van vorm verandert zodra je een melder toevoegt. */
    .tijdlijn .soorten { display: flex; gap: 6px; flex-wrap: wrap; }
    .tijdlijn .soorten button {
      flex: 0 0 auto; display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 9px; cursor: pointer; font: inherit; font-size: 11.5px;
      color: var(--dac-ink-3); background: var(--dac-surface);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
    }
    .tijdlijn .soorten button .icon { width: 14px; height: 14px; }
    .tijdlijn .soorten button[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      background: color-mix(in srgb, var(--dac-accent) 18%, transparent);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
    }
    .tijdlijn .soorten button[data-leeg] { opacity: .38; }

    /* De camerakeuze, alleen bij meer dan één camera op de kaart. */
    .tijdlijn .cameras { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
    .tijdlijn .cameras::-webkit-scrollbar { display: none; }
    .tijdlijn .cameras[hidden] { display: none; }
    .tijdlijn .cameras button {
      flex: 0 0 auto; padding: 4px 10px; cursor: pointer; font: inherit;
      font-size: 11px; white-space: nowrap; color: var(--dac-ink-3);
      background: transparent; border: 1px solid transparent;
      border-radius: var(--dac-radius-pill);
    }
    .tijdlijn .cameras button[aria-pressed="true"] {
      color: var(--dac-accent-hi); font-weight: 600;
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
    }

    /* De balk: één etmaal van links naar rechts, met een streepje op 0, 6, 12
       en 18 uur zodat je ziet of iets 's nachts of 's middags gebeurde. */
    .balk {
      position: relative; height: 30px; border-radius: var(--dac-radius-sm);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      overflow: hidden;
    }
    .balk .uur {
      position: absolute; top: 0; bottom: 0; width: 1px;
      background: var(--dac-border-hi);
    }
    .balk .uurtekst {
      position: absolute; bottom: 1px; font-size: 8.5px; color: var(--dac-ink-3);
      transform: translateX(2px);
    }
    .balk .merk-g {
      position: absolute; top: 4px; width: 4px; height: 15px; margin-left: -2px;
      border-radius: 2px; background: var(--dac-accent-hi); cursor: pointer;
      border: none; padding: 0;
    }
    .balk .merk-g[data-aan] { background: var(--dac-ink); height: 21px; top: 3px; }
    .balk .leeg {
      position: absolute; inset: 0; display: grid; place-items: center;
      font-size: 11px; color: var(--dac-ink-3);
    }

    /* De lijst. Maximaal een kaarthoogte hoog en dan scrollen: een dag met
       veertig gebeurtenissen mag de kaart niet tot onder de vouw duwen. */
    .lijst {
      display: flex; flex-direction: column; gap: 2px;
      max-height: 168px; overflow-y: auto; overscroll-behavior: contain;
      scrollbar-width: thin;
    }
    .lijst button {
      display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
      padding: 6px 8px; cursor: pointer; font: inherit; font-size: 12px;
      color: var(--dac-ink-2); background: transparent; border: none;
      border-radius: var(--dac-radius-sm);
    }
    .lijst button[data-aan] { background: var(--dac-surface-hi); color: var(--dac-ink); }
    .lijst .tijd { flex: 0 0 auto; font-variant-numeric: tabular-nums; font-weight: 600; }
    .lijst .icon { width: 15px; height: 15px; flex: 0 0 auto; }
    .lijst .wat { flex: 1 1 auto; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .lijst .bij { flex: 0 0 auto; font-size: 10.5px; color: var(--dac-ink-3); }
    .lijst .niets { padding: 10px 8px; font-size: 12px; color: var(--dac-ink-3); }

    :host([dead]) .card { opacity: .5; }
  `;

  validate(config) {
    const c = { name: "", ...config };
    if (!c.camera && !(Array.isArray(c.cameras) && c.cameras.length)) {
      c[INCOMPLETE] = "Kies een camera. Presets, richtingsknoppen en een bewegingsmelder mogen daarna.";
    }
    // Het vinkje "Presets en draaien" is er pas sinds 28 augustus 2026. Een
    // kaart die zijn presets al had, houdt ze.
    if (c.presets_aan === undefined) c.presets_aan = heeftPtzVelden(c);

    // De kaart cachet gebeurtenissen per dag en per melderlijst. Verandert de
    // config, dan klopt die voorraad niet meer -- valkuil 24: een cache die
    // blijft staan terwijl alles eronder vervangen is.
    this.gebeurtenissen_ = null;
    this.opgehaald_ = null;
    return c;
  }

  watched() {
    const c = this.config;
    return [
      ...this.cameras_(),
      c.presets,
      ...this.melders_().map((m) => m.entity),
      ...(Array.isArray(c.preset_buttons) ? c.preset_buttons : []),
    ].filter(Boolean);
  }

  /**
   * De bewegingsmelders van deze kaart, met hun naam.
   *
   * Gevraagd op 27 augustus 2026: *"ik wil ook meerdere
   * bewegingsmelder-entiteiten kunnen selecteren en een naam erbij die dan
   * tevoorschijn komt. Ik heb bijvoorbeeld een beweging voor persoon, auto, etc.
   * en dan kan ik bij de persoon-entiteit de naam erbij zetten."*
   *
   * Dat is precies wat een Reolink levert: naast `_motion` ook `_person`,
   * `_vehicle` en `_pet`. Eén merkje "Beweging" gooit die informatie weg -- het
   * verschil tussen een auto op de oprit en iemand aan de deur is nu juist het
   * hele punt van zo'n camera.
   *
   * Het oude enkele veld `motion` blijft werken; een kaart die dat gebruikt
   * verandert niet.
   */
  melders_() {
    const c = this.config;
    const ids = [
      ...(Array.isArray(c.motion_sensors) ? c.motion_sensors : []),
      ...(c.motion ? [c.motion] : []),
    ].filter((x) => typeof x === "string");

    return [...new Set(ids)].map((entity) => {
      const naam = c[`melder:${entity}`] || nameOf(this.hass, entity) || "Beweging";
      return {
        entity,
        // De naam uit de editor; anders die van Home Assistant zelf.
        naam,
        // Bij welke camera hij hoort, als je dat zelf hebt gekozen.
        bijCamera: c[`melderbij:${entity}`],
        // Mens, dier, voertuig, aanbellen of ontgrendeling. Wat je zelf koos
        // wint; anders wordt het geraden uit het entity_id en de naam, zodat een
        // Reolink meteen klopt zonder dat er iets ingevuld hoeft te worden.
        soort: c[`meldersoort:${entity}`] || raadSoort(entity, naam),
      };
    });
  }

  /** De melders zoals de tijdlijn ze nodig heeft: mét de camera waar ze bij horen. */
  meldersVoorTijdlijn_() {
    const alle = this.cameras_();
    return this.melders_().map((m) => ({
      entity: m.entity,
      naam: m.naam,
      soort: m.soort,
      camera: cameraVanMelder(this.hass, m.entity, alle, m.bijCamera),
    }));
  }

  /** Alle camera's van deze kaart, met de hoofdcamera vooraan. */
  cameras_() {
    const c = this.config;
    const lijst = [c.camera, ...(Array.isArray(c.cameras) ? c.cameras : [])].filter(Boolean);
    return [...new Set(lijst)];
  }

  /** Naar welke camera kijken we nu? */
  huidig_() {
    const lijst = this.cameras_();
    return lijst.includes(this.cam_) ? this.cam_ : lijst[0];
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    this.stand_ = this.stand_ ?? { zoom: MIN_ZOOM, x: 0, y: 0 };

    return `
      <div class="card surface">
        <div class="vak">
          <div class="schuif"></div>
          <div class="over">
            <span class="nm"></span>
            <span class="rek"></span>
            <span class="melders"></span>
            <span class="merk" data-soort="live" hidden><span class="stip"></span><span>LIVE</span></span>
          </div>
          <div class="ptz" hidden>
            ${RICHTINGEN.map(
              (r) =>
                `<button type="button" data-r="${r.k}" aria-label="${r.label}"` +
                `${r.draai ? ` style="transform: rotate(${r.draai}deg)"` : ""}>` +
                `${resolve(r.icoon)}</button>`
            ).join("")}
          </div>
          <div class="presets" hidden></div>
        </div>
        <div class="cams" hidden></div>
        <div class="tijdlijn" hidden>
          <div class="rij dagrij">
            <button type="button" class="pijl" data-dag="-1" aria-label="Dag terug">
              ${resolve("chevronRight")}
            </button>
            <button type="button" class="datum">Vandaag</button>
            <input class="datumveld" type="date" aria-label="Kies een datum">
            <button type="button" class="pijl" data-dag="1" aria-label="Dag verder">
              ${resolve("chevronRight")}
            </button>
            <span class="rek"></span>
            <span class="totaal"></span>
          </div>
          <div class="rij soorten"></div>
          <div class="rij cameras" hidden></div>
          <div class="balk"></div>
          <div class="lijst"></div>
        </div>
      </div>`;
  }

  wire() {
    this.teardown_.push(volgRaster(this.$(".card")));
    this.on(this.$(".ptz"), "click", (e) => {
      const knop = e.target.closest?.("[data-r]");
      if (!knop) return;
      e.stopPropagation();
      this.draai_(knop.dataset.r);
    });
    this.on(this.$(".presets"), "click", (e) => {
      const knop = e.target.closest?.("[data-p]");
      if (!knop) return;
      e.stopPropagation();
      this.preset_(knop.dataset.p, knop.dataset.soort);
    });
    this.on(this.$(".cams"), "click", (e) => {
      const knop = e.target.closest?.("[data-cam]");
      if (!knop) return;
      e.stopPropagation();
      this.cam_ = knop.dataset.cam;
      // Een andere camera begint weer op 1x: de uitsnede van de vorige zegt
      // niets over deze.
      this.stand_ = { zoom: MIN_ZOOM, x: 0, y: 0 };
      this.paint();
    });

    this.tijdlijnLuisteraars_();
    this.zoomLuisteraars_();
    this.bewaakStream_();
  }

  /**
   * De knoppen van de tijdlijn.
   *
   * Allemaal met `stopPropagation`: de kaart eronder opent bij een tik het beeld
   * groot, en een datumkiezer die dat óók doet is onbruikbaar.
   */
  tijdlijnLuisteraars_() {
    const blok = this.$(".tijdlijn");

    this.on(blok, "click", (e) => {
      const pijl = e.target.closest?.(".pijl");
      if (pijl && !pijl.disabled) {
        e.stopPropagation();
        this.zetDag_(verschuifDag(this.dag_ ?? Date.now(), Number(pijl.dataset.dag)));
        return;
      }
      if (e.target.closest?.(".datum")) {
        e.stopPropagation();
        const veld = this.$(".datumveld");
        veld.value = alsDatumveld(this.dag_ ?? Date.now());
        // `showPicker` is een NATIEVE kalender: die staat buiten de pagina en is
        // dus niet met de browsertool te bedienen. Vandaar de terugval op focus
        // -- dan verschijnt hij alsnog bij een tik.
        try {
          veld.showPicker?.();
        } catch {
          veld.focus();
        }
        return;
      }
      const soort = e.target.closest?.("[data-soort-filter]");
      if (soort) {
        e.stopPropagation();
        this.wisselSoort_(soort.dataset.soortFilter);
        return;
      }
      const cam = e.target.closest?.("[data-camfilter]");
      if (cam) {
        e.stopPropagation();
        this.camFilter_ = cam.dataset.camfilter || null;
        this.paintTijdlijn_();
        return;
      }
      const item = e.target.closest?.("[data-tijd]");
      if (item) {
        e.stopPropagation();
        this.licht_(item.dataset.tijd === this.gekozen_ ? null : item.dataset.tijd);
      }
    });

    this.on(this.$(".datumveld"), "change", (e) => {
      e.stopPropagation();
      const gekozen = uitDatumveld(e.target.value);
      if (gekozen !== null) this.zetDag_(gekozen);
    });
  }

  /** Een andere dag: de voorraad van de vorige klopt dan niet meer. */
  zetDag_(dag) {
    // Nooit de toekomst in. Daar staat per definitie niets, en een lege dag
    // waar je zelf naartoe kon lopen leest als een kaart die stuk is.
    const vandaag = dagOm(Date.now()).vanaf;
    this.dag_ = Math.min(dagOm(dag).vanaf, vandaag);
    this.gebeurtenissen_ = null;
    this.gekozen_ = null;
    this.paintTijdlijn_();
    this.haalGebeurtenissen_();
  }

  /** Een soort aan- of uitzetten. Alles uit betekent alles tonen. */
  wisselSoort_(sleutel) {
    this.soorten_ = this.soorten_ instanceof Set ? this.soorten_ : new Set();
    if (this.soorten_.has(sleutel)) this.soorten_.delete(sleutel);
    else this.soorten_.add(sleutel);
    this.gekozen_ = null;
    this.paintTijdlijn_();
  }

  /**
   * Eén gebeurtenis oplichten -- in de lijst én op de balk tegelijk.
   *
   * Dat is wat hij koos toen ik vroeg wat een tik moest doen: "alleen de
   * gebeurtenis oplichten". Er wordt dus niets geopend en niets afgespeeld; de
   * balk en de lijst wijzen naar hetzelfde moment.
   */
  licht_(sleutel) {
    this.gekozen_ = sleutel;
    for (const el of this.$$(".lijst [data-tijd], .balk [data-tijd]")) {
      el.toggleAttribute("data-aan", Boolean(sleutel) && el.dataset.tijd === sleutel);
    }
    if (!sleutel) return;
    this.$(`.lijst [data-tijd="${sleutel}"]`)?.scrollIntoView({ block: "nearest" });
  }

  /**
   * Het wiel, de vingers, en dubbeltikken.
   *
   * Alles op het VAK en niet op het beeld: het beeld verschuift onder je vinger
   * vandaan zodra je sleept, en dan raakt de pointer-capture zijn doel kwijt.
   */
  zoomLuisteraars_() {
    const vak = this.$(".vak");
    const punten = new Map();
    let sleepVan = null;
    let knijpVan = null;
    let bewogen = 0;

    const puntIn = (e) => {
      const r = vak.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 };
    };

    this.on(vak, "wheel", (e) => {
      // Alleen als er iets te zoomen valt; anders houden we het scrollen van de
      // pagina tegen op een kaart waar niets gebeurt.
      e.preventDefault();
      this.zet_(zoomRondom(this.stand_, e.deltaY < 0 ? 1.18 : 1 / 1.18, puntIn(e)));
    }, { passive: false });

    this.on(vak, "pointerdown", (e) => {
      punten.set(e.pointerId, e);
      vak.setPointerCapture?.(e.pointerId);
      bewogen = 0;
      if (punten.size === 2) {
        const [a, b] = [...punten.values()];
        knijpVan = { afstand: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), stand: { ...this.stand_ } };
        sleepVan = null;
      } else if (this.stand_.zoom > MIN_ZOOM) {
        sleepVan = { x: e.clientX, y: e.clientY, stand: { ...this.stand_ } };
        this.setAttribute("sleept", "");
      }
    });

    this.on(vak, "pointermove", (e) => {
      if (!punten.has(e.pointerId)) return;
      punten.set(e.pointerId, e);
      bewogen = Math.max(bewogen, Math.abs(e.movementX ?? 0) + Math.abs(e.movementY ?? 0));

      if (knijpVan && punten.size === 2) {
        const [a, b] = [...punten.values()];
        const nu = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const midden = {
          x: (a.clientX + b.clientX) / 2,
          y: (a.clientY + b.clientY) / 2,
        };
        const r = vak.getBoundingClientRect();
        this.zet_(
          zoomRondom(knijpVan.stand, nu / (knijpVan.afstand || 1), {
            x: (midden.x - r.left) / r.width - 0.5,
            y: (midden.y - r.top) / r.height - 0.5,
          })
        );
        return;
      }

      if (sleepVan) {
        const r = vak.getBoundingClientRect();
        // Delen door de zoomfactor: op 4x levert dezelfde vingerbeweging een
        // vier keer kleinere verschuiving in het beeld op, en dat is precies wat
        // je verwacht.
        const dx = (e.clientX - sleepVan.x) / r.width / this.stand_.zoom;
        const dy = (e.clientY - sleepVan.y) / r.height / this.stand_.zoom;
        this.zet_({
          zoom: this.stand_.zoom,
          ...klemPositie(sleepVan.stand.x - dx, sleepVan.stand.y - dy, this.stand_.zoom),
        });
      }
    });

    const los = (e) => {
      punten.delete(e.pointerId);
      if (punten.size < 2) knijpVan = null;
      if (!punten.size) {
        sleepVan = null;
        this.removeAttribute("sleept");
      }
    };
    this.on(vak, "pointerup", los);
    this.on(vak, "pointercancel", los);

    // Dubbeltikken: heen en weer tussen 1x en 2,5x, op de plek waar je tikt.
    this.on(vak, "dblclick", (e) => {
      if (e.target.closest(".presets, .ptz")) return;
      e.preventDefault();
      this.zet_(
        this.stand_.zoom > MIN_ZOOM
          ? { zoom: MIN_ZOOM, x: 0, y: 0 }
          : zoomRondom({ zoom: MIN_ZOOM, x: 0, y: 0 }, 2.5, puntIn(e))
      );
    });

    // Eén tik op het beeld opent hem groot -- maar alleen als er niet gesleept
    // is. Zonder deze toets opent er een pop-up elke keer dat je de uitsnede
    // verschuift.
    this.on(vak, "click", (e) => {
      if (e.target.closest(".presets, .ptz")) return;
      if (bewogen > 6) return;
      if (this.config.tap_zoom === false) return;
      moreInfo(this, this.huidig_());
    });
  }

  /** Zet een nieuwe zoomstand en teken hem. */
  zet_(stand) {
    this.stand_ = stand;
    this.toggleAttribute("zoom", stand.zoom > MIN_ZOOM);
    this.$(".schuif").style.setProperty("--tf", alsTransform(stand));
  }

  /**
   * Een richtingsknop indrukken.
   *
   * De knoppen zijn `button`-entiteiten uit de integratie zelf. Dat is de enige
   * universele weg: `ptz_move` heet bij elke integratie anders en heeft overal
   * andere parameters, en een kaart die per merk een service kent is een kaart
   * die stukgaat op het volgende merk.
   */
  draai_(richting) {
    const id = this.config[`ptz_${richting}`];
    if (!id) return;
    const domein = String(id).split(".")[0];
    this.hass.callService(domein, domein === "button" ? "press" : "turn_on", { entity_id: id });
  }

  preset_(waarde, soort) {
    if (soort === "knop") {
      const domein = String(waarde).split(".")[0];
      return this.hass.callService(domein, domein === "button" ? "press" : "turn_on", {
        entity_id: waarde,
      });
    }
    const id = this.config.presets;
    const domein = String(id).split(".")[0];
    return this.hass.callService(domein, "select_option", { entity_id: id, option: waarde });
  }

  paint() {
    const c = this.config;
    const cam = this.huidig_();
    const st = stateOf(this.hass, cam);
    const dood = !st || st.state === "unavailable";
    this.toggleAttribute("dead", Boolean(dood));

    this.text(".nm", c.name || nameOf(this.hass, cam, "Camera"));

    // Zolang de stream omgevallen is: stilstaand beeld. Zie bewaakStream_.
    //
    // En de EERSTE seconden ook. Gemeld op 27 augustus 2026: *"het duurt ook
    // best lang voordat de stream laadt, is daar wat aan te doen?"*
    //
    // Ja: een WebRTC-verbinding opzetten kost een paar seconden, en zolang die
    // bezig is staat er niets. Het stilstaande beeld is er wél meteen -- dat is
    // één plaatje via de camera-proxy. Dus begint de kaart daarmee en gaat hij
    // daarna pas live. Je ziet je oprit meteen, en een tel later beweegt hij.
    const live =
      (this.live_ === true || c.live_view === true) && !this.streamStuk_ && this.magLive_();
    const vak = this.$(".schuif");
    if (dood) {
      // Het beeld blijft STAAN. Het werd hier weggegooid, en dat is precies
      // verkeerd bij een camera die af en toe een seconde wegvalt -- een
      // Reolink doet dat -- want dan wordt er bij elke terugkeer een nieuwe
      // WebRTC-verbinding opgezet. Twee van die starts over elkaar heen geven
      // de fout die hij opstuurde ("Called in wrong state: stable").
      //
      // Alleen de melding komt erover. Verdwijnt de entiteit helemaal, dan
      // ruimt `zetCamerabeeld` hem alsnog op.
      if (!this.$(".vak .leeg")) {
        const leeg = document.createElement("span");
        leeg.className = "leeg";
        leeg.textContent = "Deze camera is niet bereikbaar";
        this.$(".vak").appendChild(leeg);
      }
    } else {
      this.$(".vak .leeg")?.remove();
      zetCamerabeeld(vak, this.hass, cam, { live });
    }

    const liveMerk = this.$('.merk[data-soort="live"]');
    liveMerk.hidden = !live || dood;

    this.paintMelders_();


    this.zet_(this.stand_);
    this.paintPtz_();
    this.paintPresets_();
    this.paintCams_(cam);
    this.paintTijdlijn_();
    this.volgMelders_();

    meetRaster(this.$(".card"));
  }

  /* ------------------------------------------------------------- tijdlijn */

  /**
   * Haal de dag op uit de geschiedenis van Home Assistant.
   *
   * `history/history_during_period` is een kerncommando en staat er dus altijd
   * -- anders dan onze eigen WS-commando's, die pas bestaan zodra de config
   * entry is opgezet (valkuil 28). Toch met een `try`: een gebruiker zonder
   * recorder krijgt hier een fout, en dan hoort er "geen gebeurtenissen" te
   * staan en geen kapotte kaart.
   */
  async haalGebeurtenissen_() {
    if (!this.config.tijdlijn || !this.hass) return;
    const melders = this.meldersVoorTijdlijn_();
    if (!melders.length) return;

    const dag = this.dag_ ?? dagOm(Date.now()).vanaf;
    const { vanaf, tot } = dagOm(dag);
    const sleutel = `${vanaf}|${melders.map((m) => m.entity).join(",")}`;
    if (this.bezig_ === sleutel) return;
    this.bezig_ = sleutel;

    try {
      const ruw = await this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(vanaf).toISOString(),
        // Nooit in de toekomst vragen: bij vandaag is dat "nu".
        end_time: new Date(Math.min(tot, Date.now())).toISOString(),
        entity_ids: melders.map((m) => m.entity),
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
      });
      if (!this.isConnected || this.bezig_ !== sleutel) return;
      this.gebeurtenissen_ = dun(gebeurtenissenUit(ruw, melders, { vanaf }));
      this.opgehaald_ = sleutel;
    } catch (fout) {
      // Niets in de console gooien: dit draait op elk dashboard met een
      // camerakaart, en een rode regel per kaart is geen informatie.
      this.gebeurtenissen_ = [];
      this.opgehaald_ = sleutel;
      this.foutTijdlijn_ = String(fout?.message ?? fout ?? "");
    } finally {
      if (this.bezig_ === sleutel) this.bezig_ = null;
    }
    this.paintTijdlijn_();
  }

  /**
   * Ververs de tijdlijn zodra een melder aangaat.
   *
   * Anders zie je de gebeurtenis waar je zelf naar staat te kijken pas na een
   * herlading.
   *
   * **Vijf seconden, en dat is gemeten.** Het stond eerst op twee, en dat is te
   * kort: de recorder van Home Assistant schrijft zijn regels met een pauze weg,
   * en `history_during_period` leest alleen wat er al staat. Op 28 augustus 2026
   * in de testinstance:
   *
   *     melder gaat aan   10:55:41
   *     opgehaald         10:55:43  ->  11 gebeurtenissen (de nieuwe ontbrak)
   *     opgehaald         10:55:59  ->  12 gebeurtenissen
   *
   * Met twee seconden vraag je dus net te vroeg en blijft de tijdlijn staan tot
   * de volgende melder afgaat. Dat de melder zelf meteen als merkje op het beeld
   * verschijnt maakt het erger, niet beter: je ziet dat er iets is en de lijst
   * eronder zwijgt.
   *
   * Drie melders die tegelijk afgaan geven nog steeds één ronde in plaats van
   * drie.
   */
  volgMelders_() {
    if (!this.config.tijdlijn) return;
    const sig = this.melders_()
      .map((m) => `${m.entity}=${stateOf(this.hass, m.entity)?.state ?? ""}`)
      .join(",");
    if (this.melderSig_ === sig) return;
    const eerste = this.melderSig_ === undefined;
    this.melderSig_ = sig;
    if (eerste) return;
    // Alleen vandaag: kijk je terug naar dinsdag, dan hoort die dag niet te
    // verspringen omdat er nu iemand langsloopt.
    if ((this.dag_ ?? dagOm(Date.now()).vanaf) !== dagOm(Date.now()).vanaf) return;

    clearTimeout(this.verversTimer_);
    this.verversTimer_ = setTimeout(() => {
      this.opgehaald_ = null;
      this.haalGebeurtenissen_();
    }, 5000);
    this.teardown_.push(() => clearTimeout(this.verversTimer_));
  }

  /** Wat er na de filters overblijft, met de dag erbij. */
  zichtbaar_() {
    return filterGebeurtenissen(this.gebeurtenissen_ ?? [], {
      soorten: this.soorten_,
      camera: this.camFilter_,
    });
  }

  paintTijdlijn_() {
    const blok = this.$(".tijdlijn");
    if (!blok) return;
    const aan = this.config.tijdlijn === true && this.melders_().length > 0;
    blok.hidden = !aan;
    if (!aan) return;

    this.dag_ = this.dag_ ?? dagOm(Date.now()).vanaf;
    if (this.opgehaald_ === null || this.opgehaald_ === undefined) this.haalGebeurtenissen_();

    const vandaag = dagOm(Date.now()).vanaf;
    this.text(".datum", dagLabel(this.dag_));
    this.$('.pijl[data-dag="1"]').disabled = this.dag_ >= vandaag;

    const alles = this.gebeurtenissen_ ?? [];
    const lijst = this.zichtbaar_();
    this.text(".totaal", alles.length ? `${lijst.length} van ${alles.length}` : "");

    this.paintSoorten_(alles);
    this.paintCameraFilter_();
    this.paintBalk_(lijst);
    this.paintLijst_(lijst);
    this.herstelLicht_();
  }

  /**
   * Zet de oplichtende gebeurtenis terug na een hertekening.
   *
   * Zonder dit verdwijnt hij zodra er een `hass` binnenkomt -- en bij hem komen
   * die meerdere keren per seconde. Anders dan `licht_` scrollt deze niet: dan
   * zou de lijst onder je vinger vandaan springen terwijl je aan het lezen bent.
   */
  herstelLicht_() {
    if (!this.gekozen_) return;
    for (const el of this.$$(".lijst [data-tijd], .balk [data-tijd]")) {
      el.toggleAttribute("data-aan", el.dataset.tijd === this.gekozen_);
    }
  }

  /**
   * De vijf filterknoppen -- en de zesde, als er een gewone bewegingsmelder is.
   *
   * "Ik wil 5 icons hebben. Mens dier voertuig aanbellen en ontgrendeling
   * waarop ik kan filteren." Die vijf staan er altijd, ook op een dag waarop er
   * niets van die soort was; anders springt de rij van breedte zodra er een
   * kraai voorbijkomt.
   */
  paintSoorten_(alles) {
    const vak = this.$(".soorten");
    const tellen = telPerSoort(alles);
    const heeftAlgemeen = this.melders_().some((m) => m.soort === ALGEMEEN.sleutel);
    const rij = [...SOORTEN, ...(heeftAlgemeen ? [ALGEMEEN] : [])];
    const gekozen = this.soorten_ instanceof Set ? this.soorten_ : new Set();

    const sig = rij.map((s) => `${s.sleutel}:${tellen[s.sleutel] ?? 0}:${gekozen.has(s.sleutel)}`).join(",");
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML = rij
      .map((s) => {
        const aantal = tellen[s.sleutel] ?? 0;
        return (
          `<button type="button" data-soort-filter="${s.sleutel}"` +
          ` aria-pressed="${gekozen.has(s.sleutel)}" aria-label="${s.label}"` +
          `${aantal ? "" : " data-leeg"}>${resolve(s.icoon)}` +
          `<span>${aantal}</span></button>`
        );
      })
      .join("");
  }

  /** Filteren op camera; alleen als er meer dan één op de kaart staat. */
  paintCameraFilter_() {
    const vak = this.$(".tijdlijn .cameras");
    const lijst = this.cameras_();
    vak.hidden = lijst.length < 2;
    if (lijst.length < 2) return;

    const namen = lijst.map((id) => this.camNaam_(id));
    const sig = `${lijst.join(",")}|${namen.join(",")}|${this.camFilter_ ?? ""}`;
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML =
      `<button type="button" data-camfilter="" aria-pressed="${!this.camFilter_}">Alle</button>` +
      lijst
        .map(
          (id, i) =>
            `<button type="button" data-camfilter="${this.veilig_(id)}"` +
            ` aria-pressed="${this.camFilter_ === id}">${this.veilig_(namen[i])}</button>`
        )
        .join("");
  }

  paintBalk_(lijst) {
    const balk = this.$(".balk");
    const { vanaf, tot } = dagOm(this.dag_);
    const sig = `${vanaf}|${lijst.map((g) => g.tijd).join(",")}`;
    if (balk.dataset.sig === sig) return;
    balk.dataset.sig = sig;

    const uren = uurMerken()
      .map(
        (u) =>
          `<span class="uur" style="left:${(u.plek * 100).toFixed(3)}%"></span>` +
          `<span class="uurtekst" style="left:${(u.plek * 100).toFixed(3)}%">${u.uur}u</span>`
      )
      .join("");
    const merken = lijst
      .map((g) => {
        const links = positie(g.tijd, vanaf, tot) * 100;
        return (
          `<button type="button" class="merk-g" data-tijd="${g.tijd}"` +
          ` style="left:${links.toFixed(3)}%"` +
          ` aria-label="${this.veilig_(`${tijdLabel(g.tijd)} ${g.naam}`)}"></button>`
        );
      })
      .join("");
    balk.innerHTML = uren + merken + (lijst.length ? "" : `<span class="leeg">Niets gezien</span>`);
  }

  paintLijst_(lijst) {
    const vak = this.$(".lijst");
    const meer = this.cameras_().length > 1;
    const sig = lijst.map((g) => `${g.tijd}:${g.entity}:${g.aantal ?? 1}`).join(",");
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;

    if (!lijst.length) {
      vak.innerHTML = `<div class="niets">Geen gebeurtenissen op deze dag.</div>`;
      return;
    }
    vak.innerHTML = lijst
      .map((g) => {
        const soort = soortVan(g.soort);
        const bij = meer && g.camera ? this.camNaam_(g.camera) : "";
        const hoevaak = (g.aantal ?? 1) > 1 ? ` ${g.aantal}×` : "";
        return (
          `<button type="button" data-tijd="${g.tijd}">` +
          `<span class="tijd">${tijdLabel(g.tijd)}</span>` +
          `${resolve(soort.icoon)}` +
          `<span class="wat">${this.veilig_(g.naam)}${hoevaak}</span>` +
          `<span class="bij">${this.veilig_(bij)}</span></button>`
        );
      })
      .join("");
  }

  /**
   * Houd de livestream in de gaten, en val terug als hij omvalt.
   *
   * WAAROM DIT ER IS
   *
   * Opgestuurd op 27 augustus 2026, met een schermafdruk van een rode balk over
   * zijn oprit heen:
   *
   *     Failed to connect WebRTC stream: Failed to execute
   *     'setRemoteDescription' on 'RTCPeerConnection': Failed to set remote
   *     answer sdp: Called in wrong state: stable
   *
   * *"Dit krijg ik ook vaak bij de camerakaart."*
   *
   * Die melding komt uit Home Assistants eigen speler en betekent dat er twee
   * onderhandelingen over elkaar heen liepen. De twee oorzaken die AAN ONZE KANT
   * lagen zijn hierboven weg (de stream werd herstart bij elke hass, en het
   * beeld werd weggegooid zodra de camera een seconde wegviel).
   *
   * Maar een stream kan ook omvallen door het netwerk, door de camera, of door
   * een TURN-server die niet antwoordt. Daar kunnen wij niets aan doen -- wél
   * aan wat je dan ziet. En dat hoort geen rode balk over je oprit te zijn.
   *
   * Dus: valt de stream om, dan schakelt de kaart terug naar het stilstaande
   * beeld dat zichzelf ververst. Je ziet je oprit, alleen niet bewegend. Na een
   * halve minuut probeert hij het opnieuw; lukt het dan wel, dan merk je er
   * niets van.
   *
   * HOE DE FOUT HERKEND WORDT
   *
   * `ha-camera-stream` zet er een `ha-alert` neer. Er is geen event dat wij
   * kunnen opvangen -- dat is nagekeken -- dus wordt er gekeken of dat element
   * verschijnt. Broos? Ja. Maar het alternatief is de gebruiker met een rode
   * balk laten zitten, en het faalt netjes: verandert HA zijn opmaak, dan doet
   * deze bewaker gewoon niets meer.
   */
  bewaakStream_() {
    const kijk = () => {
      if (!this.isConnected) return;
      const beeld = this.$(".schuif")?.querySelector(".beeld");
      if (!beeld?.shadowRoot) return;

      // 1. Een foutmelding: hui-image -> ha-camera-stream -> de melding.
      if (this.zoekAlert_(beeld.shadowRoot, 4) && !this.streamStuk_) {
        this.valTerug_();
        return;
      }

      // 2. Een BEVROREN stream. Die geeft geen foutmelding -- het beeld blijft
      // gewoon op het laatste plaatje staan, en dat is precies wat hij op zijn
      // wandtablet ziet: *"op een wall tablet gaat hij soms stilstaan en moet ik
      // heel het dashboard vernieuwen."*
      //
      // Een videostream die loopt telt zijn `currentTime` op. Staat die stil
      // terwijl het element wel speelt, dan is de verbinding dood zonder dat
      // iemand dat gemeld heeft.
      const video = this.zoekVideo_(beeld.shadowRoot, 4);
      if (video && !video.paused) {
        const nu = video.currentTime;
        if (this.laatsteTijd_ === nu) {
          this.stilTellen_ = (this.stilTellen_ ?? 0) + 1;
          // Vijf rondes van twee seconden: tien seconden zonder één frame. Een
          // hik is dan voorbij, een dode stream niet.
          if (this.stilTellen_ >= 5) this.herstart_();
        } else {
          this.stilTellen_ = 0;
          this.laatsteTijd_ = nu;
        }
      }
    };

    const timer = setInterval(kijk, 2000);
    this.teardown_.push(() => {
      clearInterval(timer);
      clearTimeout(this.streamHerkansing_);
    });

    // 3. Terug uit de achtergrond. Een tablet dat zijn scherm uitzet bevriest de
    // pagina; komt hij terug, dan is de stream vrijwel altijd dood. Dit is
    // dezelfde les als valkuil 30 -- een toestel dat dagen open blijft staan
    // gedraagt zich anders dan een tabblad dat je net opende.
    const wakker = () => {
      if (document.visibilityState === "visible") this.herstart_();
    };
    document.addEventListener("visibilitychange", wakker);
    this.teardown_.push(() => document.removeEventListener("visibilitychange", wakker));
  }

  /**
   * Mag de stream al starten?
   *
   * De eerste anderhalve seconde niet: dan staat er een gewoon plaatje, dat er
   * direct is. Daarna schakelt de kaart zelf om.
   *
   * Anderhalve seconde en niet meteen, want een plaatje dat één keer verschijnt
   * en meteen weer plaatsmaakt voor een zwart vlak is erger dan even wachten.
   */
  magLive_() {
    if (this.liveVrij_) return true;
    if (!this.liveTimer_) {
      this.liveTimer_ = setTimeout(() => {
        this.liveVrij_ = true;
        if (this.isConnected) this.paint();
      }, 1500);
      this.teardown_.push(() => {
        clearTimeout(this.liveTimer_);
        this.liveTimer_ = null;
        this.liveVrij_ = false;
      });
    }
    return false;
  }

  /** Val terug op stilstaand beeld, en probeer het over een halve minuut weer. */
  valTerug_() {
    this.streamStuk_ = true;
    this.paint();
    clearTimeout(this.streamHerkansing_);
    this.streamHerkansing_ = setTimeout(() => {
      this.streamStuk_ = false;
      this.paint();
    }, 30000);
  }

  /**
   * Zet de stream opnieuw op, zonder het dashboard te verversen.
   *
   * `cameraView` even op "auto" en dan terug op "live" is genoeg: `hui-image`
   * gooit zijn verbinding weg en begint opnieuw. Dat is precies wat hij nu met
   * de hand doet door de pagina te herladen.
   */
  herstart_() {
    const beeld = this.$(".schuif")?.querySelector(".beeld");
    if (!beeld || beeld.localName !== "hui-image") return;
    if (beeld.cameraView !== "live") return;
    this.stilTellen_ = 0;
    this.laatsteTijd_ = null;
    beeld.cameraView = "auto";
    // Een tel later terug naar live: anders ziet `hui-image` geen verandering en
    // blijft de dode verbinding staan.
    clearTimeout(this.herstartTimer_);
    this.herstartTimer_ = setTimeout(() => {
      const nu = this.$(".schuif")?.querySelector(".beeld");
      if (nu && nu.localName === "hui-image" && !this.streamStuk_) nu.cameraView = "live";
    }, 600);
    this.teardown_.push(() => clearTimeout(this.herstartTimer_));
  }

  /** Zoek het video-element binnen deze shadow roots. */
  zoekVideo_(root, diepte) {
    if (!root || diepte <= 0) return null;
    const eigen = root.querySelector?.("video");
    if (eigen) return eigen;
    for (const kind of root.querySelectorAll?.("*") ?? []) {
      if (kind.shadowRoot) {
        const gevonden = this.zoekVideo_(kind.shadowRoot, diepte - 1);
        if (gevonden) return gevonden;
      }
    }
    return null;
  }

  /** Zoek een `ha-alert` binnen deze shadow roots, tot een paar lagen diep. */
  zoekAlert_(root, diepte) {
    if (!root || diepte <= 0) return null;
    const eigen = root.querySelector?.("ha-alert");
    if (eigen) return eigen;
    for (const kind of root.querySelectorAll?.("*") ?? []) {
      if (kind.shadowRoot) {
        const gevonden = this.zoekAlert_(kind.shadowRoot, diepte - 1);
        if (gevonden) return gevonden;
      }
    }
    return null;
  }

  /**
   * Een merkje per melder die AANSTAAT, met zijn eigen naam.
   *
   * Alleen wat aanstaat: een rij grijze merkjes voor alles wat er niet is, is
   * geen informatie maar behang.
   */
  paintMelders_() {
    const vak = this.$(".melders");
    const camera = this.huidig_();
    const alle = this.cameras_();
    const aan = this.melders_().filter(
      (m) =>
        isOn(stateOf(this.hass, m.entity)) &&
        hoortBij(this.hass, m.entity, alle, m.bijCamera, camera)
    );

    const sig = camera + "::" + aan.map((m) => `${m.entity}|${m.naam}|${m.soort}`).join(",");
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    // Het icoon volgt de SOORT. Hier stond `person` vast, en dan draagt een
    // merkje "Auto oprit" een poppetje -- gezien op 28 augustus 2026 in de
    // testinstance, nadat de soorten er waren. Dezelfde instelling die het
    // filter in de tijdlijn stuurt, stuurt nu ook dit.
    vak.innerHTML = aan
      .map(
        (m) =>
          `<span class="merk" data-soort="beweging">${resolve(soortVan(m.soort).icoon)}` +
          `<span>${this.veilig_(m.naam)}</span></span>`
      )
      .join("");
  }

  paintPtz_() {
    const c = this.config;
    const vak = this.$(".ptz");
    const heeft = c.presets_aan !== false && RICHTINGEN.some((r) => c[`ptz_${r.k}`]);
    vak.hidden = !heeft;
    if (!heeft) return;
    for (const r of RICHTINGEN) {
      const knop = vak.querySelector(`[data-r="${r.k}"]`);
      if (knop) knop.hidden = !c[`ptz_${r.k}`];
    }
  }

  paintPresets_() {
    const c = this.config;
    const vak = this.$(".presets");

    // Twee bronnen, en ze mogen naast elkaar bestaan: een select met opties, en
    // losse knoppen. Zie de kop voor waarom dat nodig is.
    const uit = [];
    // Eén vinkje zet de hele boel uit -- zijn verzoek van 28 augustus 2026. De
    // gekozen entiteiten blijven gewoon in de config staan, dus aanvinken zet
    // alles terug zoals het was.
    const keuze = c.presets_aan === false ? null : stateOf(this.hass, c.presets);
    const opties = keuze?.attributes?.options;
    if (Array.isArray(opties)) {
      for (const optie of opties) {
        uit.push({ waarde: optie, naam: optie, soort: "keuze", aan: keuze.state === optie });
      }
    }
    const knoppen =
      c.presets_aan !== false && Array.isArray(c.preset_buttons) ? c.preset_buttons : [];
    for (const id of knoppen) {
      const knop = stateOf(this.hass, id);
      if (!knop) continue;
      uit.push({ waarde: id, naam: nameOf(this.hass, id, id), soort: "knop", aan: false });
    }

    vak.hidden = !uit.length;
    if (!uit.length) return;

    const sig = uit.map((p) => `${p.waarde}|${p.aan}`).join(",");
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML = uit
      .map(
        (p) =>
          `<button type="button" data-p="${this.veilig_(p.waarde)}" data-soort="${p.soort}"` +
          ` aria-pressed="${p.aan}">${this.veilig_(p.naam)}</button>`
      )
      .join("");
  }

  /**
   * De naam van een camera in de kiezerrij.
   *
   * `nameOf(hass, id, configured)` neemt zijn derde parameter als OVERRIDE, niet
   * als terugval -- staat er iets, dan wint dat altijd. Hier stond `id`, en dus
   * kwam er altijd `camera.oprit` op de knop te staan in plaats van "Oprit".
   * Gemeld op 27 augustus 2026, en het was precies dat.
   *
   * Nu: wat je zelf in de editor invult wint, daarna de naam uit Home Assistant,
   * en pas als laatste het entity_id.
   */
  camNaam_(id) {
    const c = this.config;
    // Het veld "Naam" bovenaan de editor is de naam van de HOOFDCAMERA. Dat
    // stond nergens: de extra camera's kregen elk een eigen naamveld, de
    // hoofdcamera niet, en die viel dus terug op de entiteitnaam.
    //
    // Gemeld op 27 augustus 2026 met een schermafdruk: hij vulde "Oprit" in als
    // naam, de kaart zette dat linksboven op het beeld, en in de kiezerrij
    // eronder stond alsnog "Oprit Vloeiend". *"De andere namen pakt hij wel als
    // ik ze invul."* Precies -- die hadden een veld.
    if (id === c.camera && c.name) return c.name;
    return c[`cam:${id}`] || nameOf(this.hass, id) || id;
  }

  paintCams_(huidig) {
    const lijst = this.cameras_();
    const vak = this.$(".cams");
    vak.hidden = lijst.length < 2;
    if (lijst.length < 2) return;

    const namen = lijst.map((id) => this.camNaam_(id));
    const sig = `${lijst.join(",")}|${namen.join(",")}|${huidig}`;
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML = lijst
      .map(
        (id, i) =>
          `<button type="button" data-cam="${this.veilig_(id)}"` +
          ` aria-pressed="${id === huidig}">${this.veilig_(namen[i])}</button>`
      )
      .join("");
  }

  veilig_(tekst) {
    const d = document.createElement("div");
    d.textContent = tekst ?? "";
    return d.innerHTML;
  }

  getCardSize() {
    return 5;
  }

  /**
   * Deze kaart duwt zijn inhoud NIET op naar een rasterhoogte.
   *
   * Elke andere kaart doet dat wel: `--dac-raster` zet een `min-height` op 56,
   * 120, 184 of 248, zodat een DomotiApp-kaart naast een Mushroom-kaart in
   * dezelfde kolom blijft uitlijnen (zie rasterhoogte.js).
   *
   * Hier kan dat niet, en het hoeft ook niet:
   *
   * - **Het kan niet.** Sinds de vaste 16:9 eraf is (er ging beeld verloren)
   *   bepaalt de camera de hoogte. Die is willekeurig, dus uitlijnen op een
   *   raster zou betekenen dat er altijd een strook leeg bijkomt.
   * - **Het hoeft niet.** Gemeld op 27 augustus 2026 met een schermafdruk uit
   *   zijn beveiligingspop-up: *"nog steeds veel ruimte aan de onderkant."* In
   *   een pop-up is er helemaal geen raster om op uit te lijnen -- die strook
   *   was puur verlies.
   *
   * `meetRaster` blijft wél draaien, want `min_rows` heeft die meting nodig:
   * zonder eerlijke ondergrens mag het formaatgreepje het vak kleiner slepen dan
   * de inhoud, en dan schildert de kaart over zijn buurman heen (valkuil 12).
   * Alleen de `min-height` is eraf.
   */
  getGridOptions() {
    return {
      columns: 12,
      rows: "auto",
      min_columns: 6,
      min_rows: this.minRijen_(".card", 3),
    };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-camera-card-editor");
  }

  static getStubConfig(hass, entities) {
    const cam = entities?.find((e) => e.startsWith("camera."));
    return cam ? { camera: cam } : {};
  }
}

class CameraEditor extends DacEditor {
  pickers() {
    return [];
  }

  /**
   * Zaai wat de KAART als standaard hanteert, zodat het formulier hetzelfde
   * zegt als wat er gebeurt.
   *
   * `defaults()` kan dit niet: die kent de config nog niet, en of "Presets en
   * draaien" aan hoort te staan hangt ervan af of er al presets ingevuld zijn.
   *
   * Dit is precies de fout die hij op 28 augustus 2026 meldde bij het andere
   * vakje: *"tikken op het beeld groot werkt ook al als het uit staat."* Dat
   * vakje stond op uit omdat de sleutel ontbrak, terwijl de kaart een
   * ontbrekende sleutel als AAN behandelt. Een vinkje dat het tegenovergestelde
   * beweert van wat de kaart doet is erger dan geen vinkje.
   */
  setConfig(config) {
    const c = config ?? {};
    const melders = [
      ...(Array.isArray(c.motion_sensors) ? c.motion_sensors : []),
      ...(c.motion ? [c.motion] : []),
    ].filter((x) => typeof x === "string");

    const zaad = { presets_aan: heeftPtzVelden(c) };
    // En de GERADEN soort per melder, om dezelfde reden: de kaart heeft er al
    // een gekozen, dus een leeg keuzevak liegt erover.
    for (const id of melders) {
      const naam = c[`melder:${id}`] || this.hass_?.states?.[id]?.attributes?.friendly_name;
      zaad[`meldersoort:${id}`] = raadSoort(id, naam);
    }
    super.setConfig({ ...zaad, ...c });
  }

  schema() {
    const c = this.config_ ?? {};
    const lijst = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);
    // Een naamveld per gekozen camera en per gekozen melder, precies zoals de
    // rolluikkaart dat doet met zijn `naam:`-velden.
    const extraCams = lijst(c.cameras).map((id) => ({
      name: `cam:${id}`,
      selector: sel.text(),
    }));
    // Per melder een naam, en -- als er meer dan één camera op de kaart staat --
    // bij welke camera hij hoort.
    const alleCams = [c.camera, ...lijst(c.cameras)].filter(Boolean);
    const extraMelders = lijst(c.motion_sensors).flatMap((id) => {
      const velden = [
        { name: `melder:${id}`, selector: sel.text() },
        {
          name: `meldersoort:${id}`,
          selector: sel.select(
            ALLE_SOORTEN.map((soort) => ({ value: soort.sleutel, label: soort.label }))
          ),
        },
      ];
      if (alleCams.length > 1) {
        velden.push({
          name: `melderbij:${id}`,
          selector: sel.select([
            { value: "", label: "Bij alle camera's" },
            ...alleCams.map((cam) => ({
              value: cam,
              label: this.hass?.states?.[cam]?.attributes?.friendly_name ?? cam,
            })),
          ]),
        });
      }
      return velden;
    });

    return [
      { name: "camera", selector: sel.entity("camera") },
      { name: "name", selector: sel.text() },
      { name: "live_view", selector: sel.bool() },
      { name: "cameras", selector: { entity: { domain: "camera", multiple: true } } },
      ...extraCams,

      // Presets en draaien: één vinkje, en daaronder het uitklapblok met de
      // entiteiten. Gevraagd op 28 augustus 2026: "ik wil dat de presets onder
      // een uitklapmenu vallen, dat ik ze kan aanzetten met 1 vinkje (...) zo
      // houd je overzicht op de GUI. Draaien links rechts etc hoort daar ook
      // onder."
      //
      // Het vinkje staat ERBOVEN en niet erin: ha-form kan geen schakelaar in
      // de kop van een uitklapblok zetten, en die er met de hand in prikken zou
      // betekenen dat we in de shadow-DOM van Home Assistant gaan zitten
      // knutselen. Zo zie je in één regel of het aanstaat, en klap je alleen
      // open als je iets wilt kiezen.
      { name: "presets_aan", selector: sel.bool() },
      ...(c.presets_aan
        ? [
            section("Presets en draaien", "mdi:arrow-all", [
              { name: "presets", selector: sel.entity(["select", "input_select"]) },
              {
                name: "preset_buttons",
                selector: { entity: { domain: ["button", "scene", "script"], multiple: true } },
              },
              { name: "ptz_up", selector: sel.entity(["button", "switch"]) },
              { name: "ptz_down", selector: sel.entity(["button", "switch"]) },
              { name: "ptz_left", selector: sel.entity(["button", "switch"]) },
              { name: "ptz_right", selector: sel.entity(["button", "switch"]) },
            ]),
          ]
        : []),

      {
        name: "motion_sensors",
        selector: {
          entity: { domain: ["binary_sensor", "event", "lock"], multiple: true },
        },
      },
      ...extraMelders,

      // En dezelfde vorm voor de tijdlijn.
      { name: "tijdlijn", selector: sel.bool() },
    ];
  }

  label(s) {
    // De naamvelden dragen het entity_id in hun naam; het label is de naam van
    // die entiteit, zodat de editor leesbaar blijft.
    if (s.name.startsWith("cam:")) {
      return `Naam voor ${nameOf(this.hass, s.name.slice(4)) || s.name.slice(4)}`;
    }
    if (s.name.startsWith("melder:")) {
      return `Naam voor ${nameOf(this.hass, s.name.slice(7)) || s.name.slice(7)}`;
    }
    if (s.name.startsWith("melderbij:")) {
      return `↳ hoort bij welke camera`;
    }
    if (s.name.startsWith("meldersoort:")) {
      return `↳ wat ziet hij`;
    }
    return (
      {
        camera: "Camera",
        name: "Naam",
        live_view: "Altijd live",
        presets: "Presets (keuzelijst)",
        preset_buttons: "Presets als losse knoppen",
        motion: "Bewegingsmelder",
        motion_sensors: "Bewegingsmelders",
        ptz_up: "Draaien: omhoog",
        ptz_down: "Draaien: omlaag",
        ptz_left: "Draaien: links",
        ptz_right: "Draaien: rechts",
        cameras: "Nog meer camera's op deze kaart",
        presets_aan: "Presets en draaien",
        tijdlijn: "Tijdlijn met gebeurtenissen",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name.startsWith("meldersoort:")) {
      return "Bepaalt onder welk icoon hij in de tijdlijn valt, en welk icoon er op het beeld staat als hij afgaat. Hij wordt geraden uit de naam — een Reolink klopt vanzelf.";
    }
    if (s.name.startsWith("melderbij:")) {
      return "Laat dit op 'alle camera's' staan als je het niet weet. De kaart koppelt een melder vanzelf aan de camera waar hij op hetzelfde apparaat zit — bij een Reolink hoeft je dus niets in te vullen.";
    }
    const uitleg = {
      camera:
        "Op de kaart staat een beeld dat zichzelf ververst. Inzoomen doe je met twee vingers, met het scrollwiel of met een dubbeltik; een gewone tik opent hem groot. Er staan geen knoppen op het beeld.",
      name:
        "De naam van de camera zelf. Hij staat linksboven op het beeld, en ook in de rij eronder als je meer camera's op deze kaart hebt staan.",
      live_view:
        "De stream staat dan altijd open. Mooier, maar op een dashboard met zes camera's zijn dat zes streams die de hele dag doorlopen.",
      presets_aan:
        "Eén vinkje voor de hele bediening: de presetknoppen in het beeld en het draaikruis linksonder. Zet je het uit, dan blijft alles wat je gekozen hebt gewoon staan — het is alleen weg van het beeld.",
      tijdlijn:
        "Onder het beeld komt dan een balk met alles wat je melders vandaag gezien hebben, met knoppen om op mens, dier, voertuig, aanbellen en ontgrendeling te filteren. Hij leest de geschiedenis van Home Assistant, dus hij gaat zo ver terug als je recorder bewaart — standaard tien dagen.",
      motion:
        "Het oude enkele veld. Gebruik liever Bewegingsmelders hierboven; deze blijft werken voor kaarten die hem al hebben.",
      presets:
        "De `select` van je camera-integratie — Reolink en ONVIF leveren die. De kaart maakt van elke optie een knop, onderin het beeld, dus een preset die je in de camera-app toevoegt verschijnt er vanzelf bij.",
      preset_buttons:
        "Voor integraties die geen keuzelijst maar losse knoppen leveren, zoals Amcrest en Dahua. Ze mogen naast de keuzelijst staan.",
      motion_sensors:
        "Zolang er een aanstaat komt er een merkje op het beeld, en elke keer dat hij aangaat is een regel in de tijdlijn. Kies er gerust meerdere: een Reolink meldt persoon, voertuig en huisdier los van elkaar, en dan zie je wélke het is. Een deurbel (`event`) en een slot (`lock`) mogen er ook bij. Per melder kun je hieronder een naam en een soort invullen.",
      ptz_up:
        "De vier richtingsknoppen van je integratie. Vul je er geen in, dan komt het draaikruis er niet.",
      cameras:
        "Onder het beeld komt dan een rij met namen om tussen te wisselen; de camera waar je naar kijkt licht op. Handig voor de camera's die bij elkaar horen — voordeur, oprit, achtertuin. Per camera kun je hieronder een eigen naam invullen.",
    };
    return uitleg[s.name];
  }
}

registerEditor("domotiapp-camera-card-editor", CameraEditor);
registerCard("domotiapp-camera-card", CameraCard, {
  name: "DomotiApp Camera",
  description:
    "Live beeld met inzoomen en schuiven, de presets van je camera als knoppen, een draaikruis en een merkje zodra er beweging is.",
});

export { CameraCard };
