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
  ALLE_SOORTEN,
  alsGrootte,
  camerasVoorFilter,
  dagLabel,
  dagOm,
  dagStap,
  dagenMetBeelden,
  filterBeelden,
  perDag,
  raadSoort,
  soortVan,
  soortVanBeeld,
  soortenVoorFilter,
  telPerSoort,
  verschuifDag,
} from "./camera-filters.js";
import { teVersturen } from "./bewaking-logica.js";
import { vraagBevestiging } from "../vraag.js";
import { zetScrollSlot } from "../scrollslot.js";
import { MIN_ZOOM, alsTransform, klemPositie, zoomRondom } from "./zoom-logica.js";

/**
 * Hoeveel dagen de dagenlijst laat zien.
 *
 * Gelijk aan wat de bewakingsmotor bewaart (`MAX_LEEFTIJD`, zeven dagen). Zet je
 * die daar hoger, zet hem hier dan ook hoger -- een dag die je kunt aanwijzen
 * maar waar niets meer staat is een lege belofte.
 */
const BEWAARDAGEN = 7;

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
 * voordat dat vinkje bestond, hoort ze te houden. Zonder deze toets zouden
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

    /* ---- de filters boven de timeline ----
       Gevraagd op 28 augustus 2026: *"ik wil gewoon op de meldingen en die
       foto's die er nu onder staan een time line met filters zoals tijd, welke
       camera etc."*

       Ze staan BOVEN de strook en niet erin: de strook schuift opzij, en een
       filter dat wegscrollt terwijl je zoekt is geen filter. */
    .filters {
      display: flex; flex-direction: column; gap: 7px; padding: 0 10px 8px;
      position: relative;
    }
    .filters[hidden] { display: none; }
    .filters .rij { display: flex; align-items: center; gap: 6px; min-width: 0; }

    /* De dagkiezer. De pijlen zijn 30px breed: kleiner is op een telefoon
       mikken, en dit is een knop die je vaak achter elkaar indrukt. */
    .filters .pijl {
      flex: 0 0 auto; width: 30px; height: 30px; display: grid; place-items: center;
      padding: 0; font: inherit; cursor: pointer; color: var(--dac-ink-2);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
    }
    .filters .pijl .icon { width: 15px; height: 15px; }
    .filters .pijl[data-dag="-1"] .icon { transform: rotate(180deg); }
    .filters .pijl[disabled] { opacity: .35; cursor: default; }
    /* Het vak dat zegt WELKE dag je ziet, en dat je opent om een andere te
       kiezen. Gemeld op 28 augustus 2026: *"ik wil gewoon op vandaag klikken en
       dan kalender."* Eén tik dus, geen kalendericoon ernaast. */
    .filters .datum {
      flex: 0 0 auto; padding: 6px 12px; font: inherit; cursor: pointer;
      font-size: 12px; font-weight: 600; color: var(--dac-ink);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill); white-space: nowrap;
    }
    .filters .datum[aria-expanded="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
    }

    /* ---- de dagenlijst ----
       GEEN kalender van de browser meer. *"Ik wil geen kalender trouwens (...)
       nu staat er een hele kalender, ik wil gewoon de kalender van een week
       terug, want dat wordt ook maar zo gebruikt. Beelden van 3 weken geleden
       zijn toch al gewist, dus onnodig een hele kalender."*

       Precies zo: de bewaartermijn is een week, dus alles daarbuiten is een
       maand aanwijzen waar niets staat. Zeven regels, met erachter hoeveel
       beelden er die dag liggen. */
    /* position:fixed en niet absolute: de kaart staat op overflow:hidden (voor
       de ronde hoeken van het beeld), en dan wordt een lijstje dat eronder
       uitsteekt afgeknipt -- in de proef waren vier van de zeven dagen te zien.
       De plek wordt bij het openen uitgerekend, want een vast venster kent de
       kaart niet. */
    .filters .dagmenu {
      position: fixed; z-index: 12; min-width: 180px;
      padding: 5px; display: flex; flex-direction: column;
      background: var(--dac-bg-raise); border: 1px solid var(--dac-border-hi);
      border-radius: var(--dac-radius-sm); box-shadow: 0 18px 40px -14px rgba(0,0,0,.72);
    }
    .filters .dagmenu[hidden] { display: none; }
    .filters .dagmenu button {
      display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
      padding: 7px 10px; cursor: pointer; font: inherit; font-size: 12.5px;
      color: var(--dac-ink); background: transparent; border: none;
      border-radius: var(--dac-radius-sm);
    }
    .filters .dagmenu button[aria-current="true"] { color: var(--dac-accent-hi); font-weight: 600; }
    .filters .dagmenu button[data-leeg] { color: var(--dac-ink-3); }
    .filters .dagmenu .telling { margin-left: auto; font-size: 11px; color: var(--dac-ink-3); }
    @media (hover: hover) {
      .filters .dagmenu button:hover { background: var(--dac-surface); }
    }

    .filters .opslag {
      flex: 0 0 auto; width: 30px; height: 30px; display: grid; place-items: center;
      padding: 0; font: inherit; cursor: pointer; color: var(--dac-ink-2);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
    }
    .filters .opslag .icon { width: 15px; height: 15px; }
    .filters .rek { flex: 1 1 auto; }
    /* Er staat GEEN teller "13 van 13" naast de dagkiezer. Die stond er wel;
       weggehaald op verzoek, 28 augustus 2026: "dat 25 van de 31 mag wel weg, is
       niet relevant." Je ziet de beelden zelf al staan. */

    /* De vijf filterknoppen. Hij vroeg om vijf iconen; ze staan er alle vijf,
       ook als er van die soort niets is -- dan gedempt, zodat de rij niet van
       vorm verandert zodra er een kraai voorbijkomt. */
    .filters .soorten { display: flex; gap: 6px; flex-wrap: wrap; }
    .filters .soorten[hidden] { display: none; }
    .filters .soorten button {
      flex: 0 0 auto; display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 9px; cursor: pointer; font: inherit; font-size: 11.5px;
      color: var(--dac-ink-3); background: var(--dac-surface);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
    }
    .filters .soorten button .icon { width: 14px; height: 14px; }
    .filters .soorten button[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      background: color-mix(in srgb, var(--dac-accent) 18%, transparent);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
    }
    .filters .soorten button[data-leeg] { opacity: .38; }

    /* De camerakeuze, alleen bij meer dan één camera op de kaart. */
    .filters .camkeuze { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
    .filters .camkeuze::-webkit-scrollbar { display: none; }
    .filters .camkeuze[hidden] { display: none; }
    .filters .camkeuze button {
      flex: 0 0 auto; padding: 4px 10px; cursor: pointer; font: inherit;
      font-size: 11px; white-space: nowrap; color: var(--dac-ink-3);
      background: transparent; border: 1px solid transparent;
      border-radius: var(--dac-radius-pill);
    }
    .filters .camkeuze button[aria-pressed="true"] {
      color: var(--dac-accent-hi); font-weight: 600;
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
    }

    /* ---- de timeline ----
       Gevraagd op 27 augustus 2026: *"Ik wil ook een timeline hebben. (...) dan
       komt er een timeline onder de kaart met de snapshots."*

       Een strook miniaturen, meer niet. Geen knoppen, geen kopjes, geen
       datumscheidingen: een kaart is beeld. Wélke camera het was staat als
       klein label in de miniatuur, want de eigenaar koos ervoor de camera's
       door elkaar te tonen op tijd. */
    .tijdlijn {
      display: flex; gap: 6px; padding: 0 10px 11px;
      overflow-x: auto; scrollbar-width: none;
    }
    .tijdlijn::-webkit-scrollbar { display: none; }
    .tijdlijn[hidden] { display: none; }
    /* 104x60 en niet kleiner. Op 27 augustus 2026 in een echte browser gemeten:
       bij 76x44 was het label 30,7 van de 44 pixels hoog -- dan is de miniatuur
       een tekstvakje met een randje beeld eromheen, en een kaart hoort beeld te
       zijn. Bij deze maat is één regel 15px van de 60. */
    .tijdlijn .mini {
      flex: 0 0 auto; position: relative; padding: 0; cursor: pointer;
      width: 104px; height: 60px; overflow: hidden;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-sm);
      background: #000;
    }
    .tijdlijn .mini img { width: 100%; height: 100%; object-fit: cover; display: block; }
    /* Twee regels over de onderrand: de melder en het tijdstip. Ze staan op het
       beeld en niet eronder, anders wordt de strook twee keer zo hoog voor twee
       woorden. */
    /* Eén regel: "Persoon · 22:58". Staan er meerdere camera's op de kaart, dan
       komt de camera daar als tweede regel bóven -- want dan zijn de camera's
       door elkaar gemengd en zegt de tijd alleen niet genoeg. */
    .tijdlijn .bij {
      position: absolute; left: 0; right: 0; bottom: 0;
      padding: 10px 5px 3px; font-size: 9.5px; line-height: 1.25; color: #fff;
      background: linear-gradient(to top, rgba(0,0,0,.8), transparent);
      text-align: left; text-shadow: 0 1px 2px rgba(0,0,0,.85);
    }
    .tijdlijn .bij span {
      display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .tijdlijn .bij .cam { font-size: 8.5px; color: rgba(255,255,255,.72); }
    .tijdlijn .bij b { font-weight: 600; }
    @media (hover: hover) { .tijdlijn .mini:hover { border-color: var(--dac-border-hi); } }
    .tijdlijn .leeg {
      font-size: 11.5px; color: var(--dac-ink-3); padding: 2px 0 6px;
    }

    /* Groot bekijken. Eén laag over de kaart heen, tikken sluit hem.
       Bewust geen dialoog van Home Assistant: die verwacht een eigen element en
       een eigen levensduur, en dit is één plaatje. */
    /* z-index 14: HOGER dan het opslagscherm (12), want je opent een beeld
       vanuit dat scherm. Stond op 9, en dan opende het beeld eronder -- je klikte
       en er gebeurde zichtbaar niets. Gemeten op 28 augustus 2026. */
    .groot {
      position: fixed; inset: 0; z-index: 14; display: grid; place-items: center;
      background: rgba(0,0,0,.86); padding: 16px; cursor: zoom-out;
    }
    .groot[hidden] { display: none; }
    /* Op het grote beeld dezelfde knop. Buiten het beeld tikken sluit hem ook,
       maar *"dat moet de klant maar net weten"* -- en daar heeft hij gelijk in. */
    .groot .gterug {
      position: absolute; left: 14px; top: 14px; z-index: 1; cursor: pointer;
      background: color-mix(in srgb, var(--dac-bg) 78%, transparent);
      backdrop-filter: blur(8px); color: #fff; border-color: rgba(255,255,255,.22);
    }
    .groot img { max-width: 100%; max-height: 84vh; border-radius: var(--dac-radius-sm); }
    .groot .onder {
      position: absolute; left: 0; right: 0; bottom: 14px;
      text-align: center; color: #fff; font-size: 12.5px;
      text-shadow: 0 1px 3px rgba(0,0,0,.8);
    }

    /* ---- het opslagscherm ----
       Gevraagd op 28 augustus 2026: *"een soort opslag icoontje waar we alle
       snapshots kunnen zien met de datum (...) en dan een verwijder snapshots
       knop of iets dat ik handmatig ook kan verwijderen."*

       Eén laag over het scherm, net als de laag om groot te bekijken. Bewust
       geen dialoog van Home Assistant: die verwacht een eigen element en een
       eigen levensduur, en dit hangt aan één kaart. */
    .archief {
      position: fixed; inset: 0; z-index: 12; display: flex; flex-direction: column;
      background: var(--dac-bg); color: var(--dac-ink);
    }
    .archief[hidden] { display: none; }
    .archief .akop {
      display: flex; align-items: center; gap: 10px; flex: 0 0 auto;
      padding: 14px 16px; border-bottom: 1px solid var(--dac-border);
    }
    .archief .atitel { font-size: 15px; font-weight: 600; }
    .archief .astat { font-size: 11.5px; color: var(--dac-ink-3); }
    .archief .rek { flex: 1 1 auto; }
    .archief .awis {
      flex: 0 0 auto; cursor: pointer; font: inherit; color: var(--dac-ink-2);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
      padding: 6px 12px; font-size: 12px;
    }
    .archief .awis[disabled] { opacity: .4; cursor: default; }

    /* Een TERUGKNOP met het woord erbij, en niet alleen een kruisje rechtsboven.
       Gemeld op 28 augustus 2026: *"ik heb geen terug knopje om uit het menu te
       gaan."* Er stond wel een kruisje, maar dat moet je maar net zien -- en dit
       scherm ligt over het hele dashboard, dus wie het niet vindt zit vast. */
    .archief .aterug, .groot .gterug {
      flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 12px 6px 8px; cursor: pointer; font: inherit; font-size: 12.5px;
      color: var(--dac-ink); background: var(--dac-surface);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
    }
    .archief .aterug .icon, .groot .gterug .icon {
      width: 15px; height: 15px; transform: rotate(180deg);
    }

    .archief .alijst {
      flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain;
      padding: 12px 16px 20px;
    }
    .archief .dagkop {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 0 8px; font-size: 12.5px; font-weight: 600;
    }
    .archief .dagkop .bij { font-weight: 400; font-size: 11px; color: var(--dac-ink-3); }
    .archief .dagkop button {
      margin-left: auto; padding: 4px 10px; cursor: pointer; font: inherit;
      font-size: 11px; color: var(--dac-ink-3); background: transparent;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
    }
    /* Een raster dat meegroeit: op een telefoon twee op een rij, op een scherm
       zoveel als er passen. */
    .archief .dagraster {
      display: grid; gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
    }
    .archief .kiek {
      position: relative; padding: 0; cursor: pointer; overflow: hidden;
      aspect-ratio: 16 / 9; background: #000;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-sm);
    }
    .archief .kiek img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .archief .kiek .bij {
      position: absolute; left: 0; right: 0; bottom: 0;
      padding: 12px 6px 4px; font-size: 10px; line-height: 1.3; color: #fff;
      text-align: left; text-shadow: 0 1px 2px rgba(0,0,0,.85);
      background: linear-gradient(to top, rgba(0,0,0,.82), transparent);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .archief .kiek .weg {
      position: absolute; top: 4px; right: 4px; width: 24px; height: 24px;
      display: grid; place-items: center; padding: 0; cursor: pointer;
      color: #fff; background: rgba(0,0,0,.55); border: none;
      border-radius: 50%;
    }
    .archief .kiek .weg .icon { width: 13px; height: 13px; }
    .archief .aleeg { padding: 30px 0; text-align: center; color: var(--dac-ink-3); font-size: 12.5px; }

    /* Waar het staat en hoe groot het is. Hij vroeg er zelf naar, en het
       verandert elke dag -- dus hoort het op het scherm en niet alleen in een
       rapport. */
    .archief .awaar {
      flex: 0 0 auto; padding: 10px 16px 14px; font-size: 10.5px; line-height: 1.5;
      color: var(--dac-ink-3); border-top: 1px solid var(--dac-border);
    }
    .archief .awaar code { font-size: 10.5px; color: var(--dac-ink-2); }

    :host([dead]) .card { opacity: .5; }
  `;

  validate(config) {
    const c = { name: "", ...config };
    if (!c.camera && !(Array.isArray(c.cameras) && c.cameras.length)) {
      c[INCOMPLETE] = "Kies een camera. Presets, richtingsknoppen en een bewegingsmelder mogen daarna.";
    }
    // Het vinkje "Presets en draaien" is er pas sinds 0.30.0. Een kaart die zijn
    // presets al had, houdt ze.
    if (c.presets_aan === undefined) c.presets_aan = heeftPtzVelden(c);
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
        // `null` als er niets gekozen is en er ook niets te raden valt. Dan
        // krijgt hij geen filterknop -- zie `soortenVoorFilter`.
        soort: c[`meldersoort:${entity}`] || raadSoort(entity, naam),
      };
    });
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
        <div class="filters" hidden>
          <div class="rij dagrij">
            <button type="button" class="pijl" data-dag="-1" aria-label="Dag terug">
              ${resolve("chevronRight")}
            </button>
            <button type="button" class="datum">Vandaag</button>
            <button type="button" class="pijl" data-dag="1" aria-label="Dag verder">
              ${resolve("chevronRight")}
            </button>
            <span class="rek"></span>
            <button type="button" class="opslag" aria-label="Alle snapshots">
              ${resolve("storage")}
            </button>
          </div>
          <div class="dagmenu" hidden></div>
          <div class="rij soorten"></div>
          <div class="rij camkeuze" hidden></div>
        </div>
        <div class="tijdlijn" hidden></div>
      </div>
      <div class="groot" hidden>
        <button type="button" class="gterug">${resolve("chevronRight")}<span>Terug</span></button>
        <img alt=""><div class="onder"></div>
      </div>
      <div class="archief" hidden>
        <div class="akop">
          <button type="button" class="aterug">${resolve("chevronRight")}<span>Terug</span></button>
          <span class="atitel">Snapshots</span>
          <span class="astat"></span>
          <span class="rek"></span>
          <button type="button" class="awis">Alles wissen</button>
        </div>
        <div class="alijst"></div>
        <div class="awaar"></div>
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

    this.filterLuisteraars_();
    this.wielScroll_();
    this.zoomLuisteraars_();
    this.bewaakStream_();
    this.bewakingWire_();
  }

  /**
   * De knoppen van de filterbalk.
   *
   * Allemaal met `stopPropagation`: de kaart eronder opent bij een tik het beeld
   * groot, en een datumkiezer die dat óók doet is onbruikbaar.
   */
  filterLuisteraars_() {
    const blok = this.$(".filters");

    this.on(blok, "click", (e) => {
      const pijl = e.target.closest?.(".pijl");
      if (pijl && !pijl.disabled) {
        e.stopPropagation();
        const stap = Number(pijl.dataset.dag);
        const nu = this.dag_ ?? dagOm(Date.now()).vanaf;
        // Spring naar de eerstvolgende dag waar iets STAAT. Per dag stappen
        // betekent op een rustige week vier keer klikken voor niets.
        const doel = dagStap(dagenMetBeelden(this.beelden_ ?? []), nu, stap);
        this.zetDag_(doel ?? verschuifDag(nu, stap));
        return;
      }
      if (e.target.closest?.(".opslag")) {
        e.stopPropagation();
        this.openArchief_();
        return;
      }
      if (e.target.closest?.(".datum")) {
        e.stopPropagation();
        this.wisselDagmenu_();
        return;
      }
      const dagkeuze = e.target.closest?.("[data-kies]");
      if (dagkeuze) {
        e.stopPropagation();
        this.sluitDagmenu_();
        this.zetDag_(Number(dagkeuze.dataset.kies));
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
        this.paintFilters_();
        this.paintTijdlijn_(true);
      }
    });

    // Buiten het menu tikken sluit het. Op `document` en niet op de kaart: een
    // tik ergens anders op het dashboard hoort hem ook weg te doen.
    const buiten = (e) => {
      if (this.$(".dagmenu")?.hidden) return;
      if (e.composedPath().includes(this.$(".dagmenu"))) return;
      if (e.composedPath().includes(this.$(".datum"))) return;
      this.sluitDagmenu_();
    };
    document.addEventListener("click", buiten, true);
    this.teardown_.push(() => document.removeEventListener("click", buiten, true));

    // Een vast menu schuift niet mee met de pagina; dan hoort het dicht te gaan
    // in plaats van los boven het dashboard te blijven hangen.
    const weg = () => { if (!this.$(".dagmenu")?.hidden) this.sluitDagmenu_(); };
    window.addEventListener("scroll", weg, true);
    window.addEventListener("resize", weg);
    this.teardown_.push(() => {
      window.removeEventListener("scroll", weg, true);
      window.removeEventListener("resize", weg);
    });
  }

  /* ------------------------------------------------------------ dagenlijst */

  wisselDagmenu_() {
    const menu = this.$(".dagmenu");
    if (!menu.hidden) return this.sluitDagmenu_();
    this.paintDagmenu_();
    menu.hidden = false;
    this.$(".datum").setAttribute("aria-expanded", "true");

    // De plek uitrekenen: onder de knop, tenzij dat niet meer past -- dan
    // erboven. Op een telefoon in liggende stand is dat het verschil tussen een
    // lijst die je ziet en een lijst die half onder de rand hangt.
    const knop = this.$(".datum").getBoundingClientRect();
    const vak = menu.getBoundingClientRect();
    const onder = knop.bottom + 4;
    const past = onder + vak.height <= window.innerHeight - 8;
    menu.style.left = `${Math.max(8, Math.min(knop.left, window.innerWidth - vak.width - 8))}px`;
    menu.style.top = past ? `${onder}px` : `${Math.max(8, knop.top - vak.height - 4)}px`;
  }

  sluitDagmenu_() {
    this.$(".dagmenu").hidden = true;
    this.$(".datum").setAttribute("aria-expanded", "false");
  }

  /**
   * De zeven dagen die er toe doen.
   *
   * Niet meer en niet minder: de bewakingsmotor bewaart een week, dus een dag
   * daarbuiten aanwijzen levert per definitie een lege strook op. *"Beelden van
   * 3 weken geleden zijn toch al gewist, dus onnodig een hele kalender."*
   *
   * Met het aantal beelden erachter, zodat je in één blik ziet waar iets staat
   * -- dat is precies wat je in een kalender komt zoeken.
   */
  paintDagmenu_() {
    const vandaag = dagOm(Date.now()).vanaf;
    const nu = this.dag_ ?? vandaag;
    const alle = this.beelden_ ?? [];
    const rijen = [];
    for (let i = 0; i < BEWAARDAGEN; i++) {
      const dag = verschuifDag(vandaag, -i);
      const aantal = filterBeelden(alle, { dag, config: this.config }).length;
      rijen.push({ dag, label: dagLabel(dag), aantal });
    }
    this.$(".dagmenu").innerHTML = rijen
      .map(
        (r) =>
          `<button type="button" data-kies="${r.dag}"` +
          ` aria-current="${r.dag === nu}"${r.aantal ? "" : " data-leeg"}>` +
          `<span>${escape_(r.label)}</span>` +
          `<span class="telling">${r.aantal || "—"}</span></button>`
      )
      .join("");
  }

  /**
   * Het muiswiel over een rij die OPZIJ scrolt.
   *
   * Gemeld op 28 augustus 2026: *"ik kan niet scrollen op de timeline op pc, op
   * telefoon kan het wel."* Klopt, en het is geen fout in de strook: op een
   * telefoon veeg je opzij, en een muiswiel draait omhoog en omlaag -- precies
   * de kant die de strook niet op kan. De scrollbalk staat er bovendien niet
   * (`scrollbar-width: none`), want vier grijze streepjes onder een kaart is
   * geen vormgeving.
   *
   * Dus: verticaal wielen wordt hier horizontaal schuiven. Alleen als er
   * werkelijk iets te schuiven valt in die richting -- staat de strook al aan
   * het eind, dan mag de PAGINA het wiel weer hebben, anders blijft je dashboard
   * onder je muis hangen.
   */
  wielScroll_() {
    for (const sel of [".tijdlijn", ".cams", ".camkeuze", ".presets"]) {
      const rij = this.$(sel);
      if (!rij) continue;
      this.on(
        rij,
        "wheel",
        (e) => {
          // Wielt iemand al opzij (een trackpad, een muis met kantelwiel), laat
          // de browser dat dan zelf doen.
          if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
          const ruimte = rij.scrollWidth - rij.clientWidth;
          if (ruimte <= 1) return;
          const heen = e.deltaY > 0;
          const aanHetEind = heen
            ? Math.ceil(rij.scrollLeft) >= ruimte
            : rij.scrollLeft <= 0;
          if (aanHetEind) return;
          e.preventDefault();
          rij.scrollLeft += e.deltaY;
        },
        { passive: false }
      );
    }
  }

  /** Een andere dag kiezen. Voorbij vandaag heeft geen zin: daar staat niets. */
  zetDag_(dag) {
    const vandaag = dagOm(Date.now()).vanaf;
    this.dag_ = Math.min(dagOm(dag).vanaf, vandaag);
    this.paintFilters_();
    this.paintTijdlijn_(true);
  }

  /** Een soort aan- of uitzetten. Alles uit betekent alles tonen. */
  wisselSoort_(sleutel) {
    this.soorten_ = this.soorten_ instanceof Set ? this.soorten_ : new Set();
    if (this.soorten_.has(sleutel)) this.soorten_.delete(sleutel);
    else this.soorten_.add(sleutel);
    this.paintFilters_();
    this.paintTijdlijn_(true);
  }

  /** Wat er na de filters overblijft. */
  zichtbareBeelden_() {
    return filterBeelden(this.beelden_ ?? [], {
      soorten: this.soorten_,
      camera: this.camFilter_,
      dag: this.dag_ ?? dagOm(Date.now()).vanaf,
      config: this.config,
    });
  }

  /**
   * De filterbalk tekenen.
   *
   * Hij verschijnt alleen als de snapshots aanstaan -- filters op een strook die
   * er niet is, is drie regels ruis.
   */
  paintFilters_() {
    const blok = this.$(".filters");
    if (!blok) return;
    blok.hidden = !this.config.snapshots;
    if (blok.hidden) return;

    const alle = this.beelden_ ?? [];

    // De kaart begint op VANDAAG en niet op "alles". Gevraagd op 28 augustus
    // 2026: *"het vak van vandaag moet vandaag of de datum laten zien."*
    const dag = this.dag_ ?? dagOm(Date.now()).vanaf;
    this.text(".datum", dagLabel(dag));

    // Een pijl staat uit als er in die richting geen dag met beelden meer is.
    const dagen = dagenMetBeelden(alle);
    this.$('.pijl[data-dag="-1"]').disabled = dagStap(dagen, dag, -1) === null;
    this.$('.pijl[data-dag="1"]').disabled =
      dag >= dagOm(Date.now()).vanaf || dagStap(dagen, dag, 1) === null;

    // De tellers gaan over de dag en de camera die je ZIET, niet over de hele
    // voorraad. Anders staat er 4 op de knop en komen er 2 tevoorschijn als je
    // hem indrukt -- en dan is het getal geen informatie maar een raadsel.
    this.paintSoorten_(
      filterBeelden(alle, { camera: this.camFilter_, dag, config: this.config })
    );
    this.paintCamFilter_();
  }

  /**
   * De filterknoppen: precies de soorten die in de editor aan een melder hangen.
   *
   * Hier stond eerst een vaste rij van vijf, waarvan de lege gedempt waren, plus
   * een zesde die verscheen zodra een melder op geen enkel woord matchte.
   * Gemeld op 28 augustus 2026: *"Je hebt Voorkant erbij gezet als filter maar
   * die heb ik helemaal niet gedefinieerd als beweging. Ik wil alleen dat je de
   * filters laat zien die ook gedefinieerd zijn in de GUI."*
   *
   * Dat is de regel geworden. Een knop is een belofte dat er iets te filteren
   * valt; een knop voor een soort die nergens is ingesteld belooft iets wat
   * niemand heeft gemaakt. Staat er niets ingesteld, dan is er ook geen rij.
   */
  paintSoorten_(alle) {
    const vak = this.$(".soorten");
    const tellen = telPerSoort(alle, this.config);
    const rij = soortenVoorFilter(this.melders_());
    const gekozen = this.soorten_ instanceof Set ? this.soorten_ : new Set();

    vak.hidden = !rij.length;
    const sig = rij
      .map((s) => `${s.sleutel}:${tellen[s.sleutel] ?? 0}:${gekozen.has(s.sleutel)}`)
      .join(",");
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
  /**
   * Filteren op camera -- maar alleen op de camera's die iets kunnen opleveren.
   *
   * Zie `camerasVoorFilter` voor het waarom. Blijft er één camera over, dan is
   * er niets te kiezen en verdwijnt de rij; "Alle" naast één naam is geen keuze.
   */
  paintCamFilter_() {
    const vak = this.$(".camkeuze");
    const alle = this.cameras_();
    const melderCameras = this.melders_().map((m) =>
      cameraVanMelder(this.hass, m.entity, alle, m.bijCamera)
    );
    const lijst = camerasVoorFilter(alle, melderCameras, this.beelden_ ?? []);

    vak.hidden = lijst.length < 2;
    if (lijst.length < 2) {
      // Stond er een camerafilter aan die nu wegvalt, dan hoort hij ook uit te
      // gaan -- anders blijft de strook leeg zonder dat er nog een knop is om
      // dat mee terug te draaien.
      if (this.camFilter_ && !lijst.includes(this.camFilter_)) {
        this.camFilter_ = null;
        this.paintTijdlijn_(true);
      }
      return;
    }
    if (this.camFilter_ && !lijst.includes(this.camFilter_)) {
      this.camFilter_ = null;
      this.paintTijdlijn_(true);
    }

    const namen = lijst.map((id) => this.camNaam_(id));
    const sig = `${lijst.join(",")}|${namen.join(",")}|${this.camFilter_ ?? ""}`;
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML =
      `<button type="button" data-camfilter="" aria-pressed="${!this.camFilter_}">Alle</button>` +
      lijst
        .map(
          (id, i) =>
            `<button type="button" data-camfilter="${escape_(id)}"` +
            ` aria-pressed="${this.camFilter_ === id}">${escape_(namen[i])}</button>`
        )
        .join("");
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
    this.paintFilters_();
    this.paintTijdlijn_();

    meetRaster(this.$(".card"));
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

  /* ------------------------------------------------ snapshots en timeline */

  /**
   * Zet de timeline aan: regels doorgeven, ophalen wat er ligt, en meeluisteren.
   *
   * Draait bij elke aankoppeling, dus ook na elke toetsaanslag in de editor --
   * `setConfig` gooit de DOM weg en bouwt opnieuw. Vandaar de vertraging op het
   * doorgeven: tikt iemand "120" in het rustperiodeveld, dan is dat anders drie
   * schrijfrondes op de server.
   *
   * ## Waarom de KAART de regels doorgeeft en niet de editor
   *
   * Omdat een dashboard ook met de hand bewerkt wordt, en omdat het gekopieerd
   * wordt naar een tweede installatie. De config van de kaart is de bron; de
   * serverkant volgt. Een kaart die getoond wordt, zet de server recht.
   *
   * ## En waarom het VOORBEELD in de editor dat juist NIET doet
   *
   * Dit stond er eerst wel, met de redenering dat het zichzelf zou herstellen:
   * annuleer je de dialoog, dan zou de echte kaart zijn eigen config er weer
   * overheen zetten. **Op 27 augustus 2026 in de browser nagemeten, en dat
   * gebeurt niet.** Het voorbeeld had `wachttijd: 12` opgestuurd, er is op
   * Annuleren gedrukt, en vier seconden later stond er nog steeds 12 op de
   * server terwijl in het dashboard 0 stond.
   *
   * De reden: de echte kaart wordt bij het sluiten van de dialoog niet opnieuw
   * opgebouwd. `wire()` draait bij een aankoppeling en na `setConfig`, en geen
   * van beide gebeurt als je annuleert. Een instelling die je hebt ingetypt en
   * daarna weggeklikt, blijft dan draaien.
   *
   * Daarom schrijft het voorbeeld niets. Hij toont de timeline wel -- dat is
   * juist nuttig terwijl je de kaart instelt -- maar de regels gaan pas naar de
   * server als je Opslaan hebt gedrukt, want dan wordt de echte kaart met de
   * nieuwe config opnieuw opgebouwd en doet híj het.
   */
  bewakingWire_() {
    const strook = this.$(".tijdlijn");
    if (!strook) return;

    if (!this.config.snapshots) {
      strook.hidden = true;
      this.beelden_ = [];
      return;
    }

    this.on(strook, "click", (e) => {
      const knop = e.target.closest?.("[data-beeld]");
      if (!knop) return;
      e.stopPropagation();
      this.toonGroot_(knop.dataset.beeld);
    });

    const groot = this.$(".groot");
    this.on(groot, "click", (e) => {
      e.stopPropagation();
      groot.hidden = true;
    });
    this.archiefLuisteraars_();

    const verbinding = this.hass?.connection;
    if (!verbinding?.sendMessagePromise) return;

    // Ophalen wat er al ligt, en daarna bijblijven.
    this.bewakingHaal_();
    this.bewakingLuister_();

    // En de regels doorgeven, ná de rust. Zie de kop hierboven. De controle op
    // "sta ik in een dialoog" gebeurt pas in `bewakingRegels_`, niet hier: op
    // dit moment hangt het voorbeeld nog niet in de dialoog, en dan wijst de
    // keten omhoog nog nergens heen.
    clearTimeout(this.regelTimer_);
    this.regelTimer_ = setTimeout(() => this.bewakingRegels_(), 1500);
    this.teardown_.push(() => clearTimeout(this.regelTimer_));
  }

  /**
   * Staat deze kaart in een dialoog in plaats van op een dashboard?
   *
   * Gemeten op 27 augustus 2026, met de kaarteditor open:
   *
   *     echt:      hui-grid-section > hui-sections-view > hui-root >
   *                ha-panel-lovelace > home-assistant-main > home-assistant
   *     voorbeeld: hui-grid-section > hui-dialog-edit-card > home-assistant
   *
   * **Niet op `this.preview` sturen.** Dat lijkt de aangewezen vlag, maar in
   * dezelfde meting stond hij op ALLEBEI op `true`: zodra het dashboard in
   * bewerkmodus staat, zet Home Assistant hem ook op de echte kaart.
   *
   * De keten omhoog loopt via `getRootNode().host`, want elke stap zit in een
   * eigen shadow root; `parentElement` houdt bij de eerste op.
   */
  inDialoog_() {
    let node = this;
    for (let i = 0; i < 40; i++) {
      const host = node.getRootNode?.()?.host;
      if (!host) return false;
      const tag = host.localName ?? "";
      // `hui-dialog-edit-card` is de kaarteditor; `hui-card-preview` is het
      // voorbeeld in de kaartkiezer. Beide zijn dialogen en geen dashboard.
      if (tag.startsWith("hui-dialog") || tag === "hui-card-preview") return true;
      node = host;
    }
    return false;
  }

  /** De camera's van deze kaart, als filter voor de timeline. */
  bewakingCameras_() {
    return this.cameras_();
  }

  async bewakingHaal_() {
    try {
      const antwoord = await this.hass.connection.sendMessagePromise({
        type: "domotiapp_lovelace/bewaking/timeline",
        cameras: this.bewakingCameras_(),
        // ALLES ophalen, niet de eerste zestig. De kaart toont sinds 0.31.0 één
        // dag tegelijk, en dan moet hij weten welke dagen er zijn -- anders
        // springen de pijlen naar een dag die alleen buiten de eerste zestig
        // bestaat. Het opslagscherm heeft dezelfde voorraad nodig.
        //
        // Dat het goedkoper is dan het lijkt: er worden alleen miniaturen
        // GETEKEND voor de dag die je ziet. Vóór deze ronde stonden er zestig
        // <img> in de strook, nu een handvol.
        limiet: 0,
      });
      this.beelden_ = antwoord?.beelden ?? [];
    } catch (fout) {
      // Een integratie die nog aan het opstarten is antwoordt `Unknown
      // command.` Dat is geen fout van de kaart; de strook blijft dan leeg tot
      // de volgende keer.
      this.beelden_ = [];
    }
    this.paintFilters_();
    this.paintTijdlijn_(true);
  }

  async bewakingLuister_() {
    try {
      const afmelden = await this.hass.connection.subscribeMessage(
        (bericht) => this.bewakingBericht_(bericht),
        {
          type: "domotiapp_lovelace/bewaking/subscribe",
          cameras: this.bewakingCameras_(),
        }
      );
      // Kan de kaart in de tussentijd al losgekoppeld zijn -- dan meteen weer af.
      if (!this.isConnected) afmelden();
      else this.teardown_.push(afmelden);
    } catch (fout) {
      /* zie bewakingHaal_ */
    }
  }

  bewakingBericht_(bericht) {
    const beelden = this.beelden_ ?? [];
    if (bericht?.soort === "nieuw" && bericht.beeld) {
      this.beelden_ = [bericht.beeld, ...beelden];
    } else if (bericht?.soort === "opgeruimd" && Array.isArray(bericht.ids)) {
      const weg = new Set(bericht.ids);
      this.beelden_ = beelden.filter((b) => !weg.has(b.id));
    } else {
      return;
    }
    this.paintFilters_();
    this.paintTijdlijn_(true);
    this.paintArchief_();
  }

  async bewakingRegels_() {
    // Het voorbeeld in de kaarteditor schrijft niets. Zie `bewakingWire_` voor
    // de meting waar dat uit voortkomt.
    if (this.inDialoog_()) return;

    const verbinding = this.hass?.connection;
    if (!verbinding?.sendMessagePromise) return;

    let bestaand = {};
    try {
      const antwoord = await verbinding.sendMessagePromise({
        type: "domotiapp_lovelace/bewaking/get",
      });
      bestaand = antwoord?.regels ?? {};
    } catch (fout) {
      return;
    }

    for (const regel of teVersturen(this.hass, this.config, bestaand)) {
      try {
        await verbinding.sendMessagePromise({
          type: "domotiapp_lovelace/bewaking/save",
          regel,
        });
      } catch (fout) {
        // Een regel die de server weigert houdt de volgende niet tegen. De
        // reden staat in de console van wie hem opzoekt; de kaart zelf gaat er
        // niet over klagen op het dashboard.
        console.warn("DomotiApp: bewakingsregel geweigerd", regel.camera, fout);
      }
    }
  }

  /**
   * @param {boolean} [opnieuw] forceer een hertekening, ook als de ID's
   *   hetzelfde zijn. Nodig als er alleen een FILTER veranderd is: de lijst
   *   beelden is dan dezelfde, en de vergelijking hieronder zou de nieuwe
   *   selectie tegenhouden.
   */
  paintTijdlijn_(opnieuw = false) {
    const strook = this.$(".tijdlijn");
    if (!strook) return;
    if (!this.config.snapshots) {
      strook.hidden = true;
      return;
    }
    strook.hidden = false;
    if (opnieuw) this.tijdlijnTeken_ = null;

    const beelden = this.zichtbareBeelden_();

    // Meer camera's op de kaart? Dan zegt de miniatuur er welke het was. Bij één
    // camera is dat dezelfde tekst onder elk plaatje en dus ruis.
    const meerdere = this.cameras_().length > 1;

    // ALLEEN opnieuw tekenen als er werkelijk iets veranderd is.
    //
    // `paint()` draait bij elke relevante `hass`, en bij de eigenaar komt die
    // meerdere keren per seconde binnen (479 componenten). Zonder deze
    // vergelijking wordt de hele strook dan meermalen per seconde opnieuw
    // opgebouwd -- met nieuwe <img>-elementen, dus zichtbaar geknipper, en dat
    // is precies de valkuil die de camerastream in 0.27.0 ook had.
    // De namen horen in de vergelijking: hernoemt de klant een camera in de
    // editor, dan verandert de lijst met ID's niet en zou de strook de oude
    // naam blijven tonen.
    const teken = `${meerdere}|${this.cameras_().map((c) => this.camNaam_(c)).join("|")}|${beelden
      .map((b) => b.id)
      .join(",")}`;
    
    if (this.tijdlijnTeken_ === teken) return;
    this.tijdlijnTeken_ = teken;

    if (!beelden.length) {
      // Twee verschillende dingen, en ze horen niet dezelfde zin te krijgen:
      // er is nog nooit iets gemaakt, of je hebt weggefilterd wat er is.
      const gefilterd = (this.beelden_ ?? []).length > 0;
      strook.innerHTML = `<span class="leeg">${
        gefilterd ? "Niets binnen dit filter." : "Nog geen beelden."
      }</span>`;
      return;
    }

    strook.innerHTML = beelden
      .map((beeld) => {
        // `camNaam_` en niet `nameOf`: dat is dezelfde naam als in de
        // kiezerrij erboven, inclusief het "Naam"-veld en de `cam:`-velden uit
        // de editor. Op 27 augustus 2026 in de browser gezien: de kiezer zei
        // "Achterdeur" en de miniatuur eronder "127_0_0_1_2".
        const cam = escape_(this.camNaam_(beeld.camera));
        const naam = escape_(beeld.naam ?? "");
        const klok = escape_(tijdVan(this.hass, beeld.tijd));
        const camRegel = meerdere ? `<span class="cam">${cam}</span>` : "";
        return (
          `<button type="button" class="mini" data-beeld="${escape_(beeld.id)}" ` +
          `aria-label="${meerdere ? cam + ", " : ""}${naam} om ${klok}">` +
          `<img src="${escape_(beeld.url)}" alt="" loading="lazy">` +
          `<span class="bij">${camRegel}<span><b>${naam}</b> · ${klok}</span></span>` +
          `</button>`
        );
      })
      .join("");
  }

  /* --------------------------------------------------------- opslagscherm */

  /**
   * Het opslagscherm openen: alle snapshots, per dag, met hun datum.
   *
   * Gevraagd op 28 augustus 2026: *"dan wil ik een soort opslag icoontje waar we
   * alle snapshots kunnen zien met de datum, want dat kan toch ook als je de
   * timeline doorscrollt in de tijd."*
   *
   * Het toont ALLES, ongefilterd. De filters op de kaart zijn er om iets terug
   * te vinden; dit scherm is er om te zien wat er ligt -- en om het weg te
   * kunnen gooien. Een filter dat stilletjes meeloopt zou betekenen dat
   * "alles wissen" niet alles wist.
   */
  openArchief_() {
    const laag = this.$(".archief");
    laag.hidden = false;
    this.slotLos_?.();
    this.slotLos_ = zetScrollSlot();
    this.teardown_.push(() => this.slotLos_?.());
    this.paintArchief_();
  }

  sluitArchief_() {
    this.$(".archief").hidden = true;
    this.slotLos_?.();
    this.slotLos_ = null;
  }

  archiefLuisteraars_() {
    const laag = this.$(".archief");
    this.on(laag, "click", async (e) => {
      e.stopPropagation();
      if (e.target.closest?.(".aterug")) return this.sluitArchief_();

      const weg = e.target.closest?.("[data-weg]");
      if (weg) {
        const beeld = (this.beelden_ ?? []).find((b) => b.id === weg.dataset.weg);
        return this.wis_([weg.dataset.weg], beeld ? `dit beeld van ${beeld.naam ?? "de camera"}` : "dit beeld");
      }

      const dag = e.target.closest?.("[data-wisdag]");
      if (dag) {
        const groep = perDag(this.beelden_ ?? []).find(
          (g) => String(g.dag) === dag.dataset.wisdag
        );
        if (!groep) return;
        return this.wis_(
          groep.beelden.map((b) => b.id),
          `${groep.beelden.length} beelden van ${dagLabel(groep.dag).toLowerCase()}`
        );
      }

      if (e.target.closest?.(".awis")) {
        const alle = this.beelden_ ?? [];
        if (!alle.length) return;
        return this.wis_(alle.map((b) => b.id), `alle ${alle.length} beelden`);
      }

      const kiek = e.target.closest?.("[data-beeld]");
      if (kiek) this.toonGroot_(kiek.dataset.beeld);
    });
  }

  /**
   * Wissen, met een vraag ervoor.
   *
   * `vraagBevestiging` en niet `dialog-box` van Home Assistant: die is er op een
   * vers geladen dashboard gewoon niet (valkuil 26). En weggegooid beeld komt
   * niet terug, dus dit is precies het geval waar een vraag voor is.
   */
  async wis_(ids, wat) {
    if (!ids?.length) return;
    const ja = await vraagBevestiging({
      title: "Snapshots verwijderen",
      text: `Weet je zeker dat je ${wat} wilt verwijderen? Weg is weg.`,
      confirmText: "Verwijderen",
      dismissText: "Annuleren",
    });
    if (!ja) return;
    try {
      await this.hass.connection.sendMessagePromise({
        type: "domotiapp_lovelace/bewaking/verwijder",
        ids,
      });
    } catch (fout) {
      console.warn("DomotiApp: verwijderen mislukt", fout);
      return;
    }
    // De server meldt het via het abonnement, maar wachten op dat rondje maakt
    // een knop die pas na een tel iets doet. Hier meteen, en het bericht dat
    // straks binnenkomt haalt niets dubbels weg.
    const weg = new Set(ids);
    this.beelden_ = (this.beelden_ ?? []).filter((b) => !weg.has(b.id));
    this.paintFilters_();
    this.paintTijdlijn_(true);
    this.paintArchief_();
  }

  paintArchief_() {
    const laag = this.$(".archief");
    if (!laag || laag.hidden) return;

    const alle = this.beelden_ ?? [];
    const groepen = perDag(alle);
    const bytes = alle.reduce((som, b) => som + (Number(b.bytes) || 0), 0);
    const meerdere = this.cameras_().length > 1;

    this.text(".astat", alle.length ? `${alle.length} beelden · ${alsGrootte(bytes)}` : "");
    this.$(".awis").disabled = !alle.length;

    this.$(".alijst").innerHTML = groepen.length
      ? groepen
          .map((groep) => {
            const kop =
              groep.dag === null ? "Zonder datum" : dagLabel(groep.dag);
            return (
              `<div class="dagkop"><span>${escape_(kop)}</span>` +
              `<span class="bij">${groep.beelden.length} · ${alsGrootte(groep.bytes)}</span>` +
              `<button type="button" data-wisdag="${groep.dag}">Wis deze dag</button></div>` +
              `<div class="dagraster">` +
              groep.beelden
                .map((beeld) => {
                  const cam = meerdere ? `${escape_(this.camNaam_(beeld.camera))} · ` : "";
                  const klok = escape_(tijdVan(this.hass, beeld.tijd));
                  return (
                    `<button type="button" class="kiek" data-beeld="${escape_(beeld.id)}">` +
                    `<img src="${escape_(beeld.url)}" alt="" loading="lazy">` +
                    `<span class="bij">${cam}${escape_(beeld.naam ?? "")} · ${klok}</span>` +
                    `<span class="weg" role="button" data-weg="${escape_(beeld.id)}"` +
                    ` aria-label="Verwijder">${resolve("close")}</span>` +
                    `</button>`
                  );
                })
                .join("") +
              `</div>`
            );
          })
          .join("")
      : `<div class="aleeg">Er liggen geen snapshots.</div>`;

    // Eén regel, en alleen wat je als gebruiker moet weten. Er stond eerst bij
    // waar de bestanden staan en waarom niet in `www` -- gemeld op 28 augustus
    // 2026: *"verwijder dat bericht beneden van de opslag, zeg alleen dat ze een
    // week bewaard worden."* Terecht: waar ze staan is iets voor wie de
    // integratie installeert, niet voor wie naar zijn oprit kijkt. Dat verhaal
    // staat in het rapport en in de helptekst van de editor.
    this.text(
      ".awaar",
      "Snapshots blijven een week staan en verdwijnen daarna vanzelf, oudste eerst. Per camera worden er hoogstens 500 bewaard."
    );
  }

  toonGroot_(beeldId) {
    const beeld = (this.beelden_ ?? []).find((b) => b.id === beeldId);
    if (!beeld) return;
    const laag = this.$(".groot");
    laag.querySelector("img").src = beeld.url;
    laag.querySelector(".onder").textContent =
      `${this.camNaam_(beeld.camera)} · ${beeld.naam ?? ""} · ${tijdVan(this.hass, beeld.tijd, true)}`;
    laag.hidden = false;
  }

  static getConfigElement() {
    return document.createElement("domotiapp-camera-card-editor");
  }

  static getStubConfig(hass, entities) {
    const cam = entities?.find((e) => e.startsWith("camera."));
    return cam ? { camera: cam } : {};
  }
}

/**
 * Alleen het tijdstip; bij een ouder beeld de dag ervoor.
 *
 * De taal komt van Home Assistant en niet van de browser. Zonder die parameter
 * viel de weekdag terug op de taal van het besturingssysteem -- in de proef van
 * 27 augustus 2026 stond er "Thu 27 Aug" op een Nederlandstalig dashboard. De
 * rest van de familie doet het al zo (`ha.js`, `header-card.js`).
 */
function tijdVan(hass, iso, volledig = false) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const taal = hass?.locale?.language ?? "nl";
  const klok = d.toLocaleTimeString(taal, { hour: "2-digit", minute: "2-digit" });
  const vandaag = new Date();
  const zelfdeDag =
    d.getDate() === vandaag.getDate() &&
    d.getMonth() === vandaag.getMonth() &&
    d.getFullYear() === vandaag.getFullYear();
  if (zelfdeDag && !volledig) return klok;
  const dag = d.toLocaleDateString(taal, { weekday: "short", day: "numeric", month: "short" });
  return `${dag} ${klok}`;
}

/**
 * Tekst die in HTML terechtkomt.
 *
 * De namen komen uit de config van de klant en uit Home Assistant, en de URL
 * komt van de server -- geen van drieen is een reden om er zonder te werken.
 *
 * Dit is niet hetzelfde als `veilig_` hierboven, en dat is met opzet: die zet
 * tekst om via `textContent` en laat aanhalingstekens staan. Dat mag daar,
 * want daar gaan alleen entity-ID's doorheen. Hier gaat een NAAM in een
 * `aria-label`-attribuut, en die mag de klant zelf intypen.
 */
function escape_(waarde) {
  return String(waarde ?? "").replace(/[&<>"']/g, (teken) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[teken])
  );
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
   * Dit is precies de fout die hij op 28 augustus 2026 meldde bij een ánder
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
      const geraden = raadSoort(id, naam);
      // Alleen zaaien wat er WERKELIJK uit de naam volgt. Vindt hij niets, dan
      // blijft het vakje leeg -- dat is eerlijker dan er "Beweging" in zetten en
      // daar een filterknop op baseren die niemand heeft gekozen.
      if (geraden) zaad[`meldersoort:${id}`] = geraden;
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

    // Alles van de snapshots zit achter één vinkje. Gevraagd op 27 augustus
    // 2026: *"Als ik in de algemene camera kaart het vinkje timeline en
    // snapshot aan zet dan pas alles kunnen invullen."* Staat het uit, dan
    // staat er ook niets aan de serverkant en ligt er geen enkel beeld op
    // schijf.
    const snapshotVelden = c.snapshots
      ? [
          { name: "snapshot_rustperiode", selector: sel.number(0, 3600) },
          { name: "snapshot_wachttijd", selector: sel.number(0, 60) },
          {
            name: "snapshot_ontvangers",
            selector: { entity: { domain: "person", multiple: true } },
          },
          { name: "snapshot_alleen_afwezig", selector: sel.bool() },
        ]
      : [];

    return [
      { name: "camera", selector: sel.entity("camera") },
      { name: "name", selector: sel.text() },
      { name: "live_view", selector: sel.bool() },
      { name: "cameras", selector: { entity: { domain: "camera", multiple: true } } },
      ...extraCams,

      // Presets en draaien: één vinkje, en daaronder het uitklapblok met de
      // entiteiten. Gevraagd op 28 augustus 2026: *"ik wil dat de presets onder
      // een uitklapmenu vallen, dat ik ze kan aanzetten met 1 vinkje (...) zo
      // houd je overzicht op de GUI. Draaien links rechts etc hoort daar ook
      // onder."*
      //
      // Het vinkje staat ERBOVEN en niet in de kop van het blok: `ha-form` kan
      // daar geen schakelaar zetten, en die er met de hand in prikken zou
      // betekenen dat we in de shadow-DOM van Home Assistant gaan knutselen.
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

      // En dezelfde vorm voor de snapshots. Die stonden al achter één vinkje --
      // dat vroeg hij op 27 augustus -- maar de vier velden eronder stonden los
      // in het formulier. Nu zitten ze in een blok, net als de presets.
      { name: "snapshots", selector: sel.bool() },
      ...(snapshotVelden.length
        ? [section("Snapshots en meldingen", "mdi:camera-burst", snapshotVelden)]
        : []),
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
        snapshots: "Snapshots en timeline",
        snapshot_rustperiode: "Rustperiode per melder (seconden)",
        snapshot_wachttijd: "Wachten voor het beeld (seconden)",
        snapshot_ontvangers: "Wie krijgt een melding",
        snapshot_alleen_afwezig: "Alleen melden als er niemand thuis is",
        presets_aan: "Presets en draaien",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name.startsWith("meldersoort:")) {
      return "Bepaalt onder welke filterknop zijn beelden in de timeline vallen, en welk icoon er op het beeld staat als hij afgaat. Hij wordt geraden uit de naam — een Reolink klopt vanzelf.";
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
      presets:
        "De `select` van je camera-integratie — Reolink en ONVIF leveren die. De kaart maakt van elke optie een knop, onderin het beeld, dus een preset die je in de camera-app toevoegt verschijnt er vanzelf bij.",
      preset_buttons:
        "Voor integraties die geen keuzelijst maar losse knoppen leveren, zoals Amcrest en Dahua. Ze mogen naast de keuzelijst staan.",
      motion:
        "Het oude enkele veld. Gebruik liever Bewegingsmelders hierboven; deze blijft werken voor kaarten die hem al hebben.",
      motion_sensors:
        "Zolang er een aanstaat komt er een merkje op het beeld. Kies er gerust meerdere: een Reolink meldt persoon, voertuig en huisdier los van elkaar, en dan zie je wélke het is. Een deurbel (`event`) en een slot (`lock`) mogen er ook bij. Per melder kun je hieronder een naam en een soort invullen — die soort bepaalt onder welke filterknop hij in de timeline valt.",
      ptz_up:
        "De vier richtingsknoppen van je integratie. Vul je er geen in, dan komt het draaikruis er niet.",
      cameras:
        "Onder het beeld komt dan een rij met namen om tussen te wisselen; de camera waar je naar kijkt licht op. Handig voor de camera's die bij elkaar horen — voordeur, oprit, achtertuin. Per camera kun je hieronder een eigen naam invullen.",
      snapshots:
        "Bij elke detectie legt Home Assistant een beeld vast en zet dat onder de kaart in een strook, met filters erboven op dag, soort en camera — ook als er nergens een scherm aanstaat. Beelden blijven een week staan; daarboven wijkt vanzelf de oudste. Staat dit uit, dan wordt er niets vastgelegd en niets bewaard.",
      snapshot_rustperiode:
        "Hoe lang dezelfde melder daarna met rust wordt gelaten. Dit is het antwoord op tien meldingen achter elkaar. De klok loopt PER MELDER: meldt je camera persoon, voertuig en huisdier apart, dan houden die elkaar niet tegen — een auto die de oprit op rijdt en de bestuurder die uitstapt leveren allebei een beeld op. Nul betekent: alles vastleggen.",
      snapshot_wachttijd:
        "Wacht zoveel seconden na de detectie voordat het beeld genomen wordt. Op nul krijg je het moment zelf; op een of twee seconden staat degene meestal beter in beeld dan met zijn rug ernaartoe. Deze wachttijd verandert niets aan de rustperiode.",
      snapshot_ontvangers:
        "De personen die een melding op hun telefoon krijgen, met het beeld erbij. De kaart zoekt zelf de mobiele app van die persoon op. Buitenshuis heeft de telefoon een extern adres nodig (Nabu Casa of een eigen domein) om de foto te laden; zonder dat komt de melding wél aan, maar zonder plaatje.",
      snapshot_alleen_afwezig:
        "Dan blijft de telefoon stil zolang er iemand thuis is. Het beeld komt nog steeds in de timeline te staan — alleen de melding blijft achterwege. Dit scheelt in de praktijk meer meldingen dan de rustperiode.",
      presets_aan:
        "Eén vinkje voor de hele bediening: de presetknoppen in het beeld en het draaikruis linksonder. Zet je het uit, dan blijft alles wat je gekozen hebt gewoon staan — het is alleen weg van het beeld.",
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
