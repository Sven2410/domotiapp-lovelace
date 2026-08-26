/**
 * Music Assistant over het hele scherm.
 *
 * Dit is geen resultatenlijstje in een kaart van 56 pixels. Muziek zoeken is
 * bladeren: je typt drie letters, je kijkt naar hoesjes, je bedenkt je. Dat
 * vraagt ruimte, en die is er -- de kaart blijft klein, dit scherm gaat er
 * overheen en vult alles.
 *
 * ## Waarom dit in `document.body` hangt en niet in de kaart
 *
 * Een kaart staat in een kolom met `overflow` en `transform` eromheen. Een
 * `position: fixed` daarbinnen wordt door de browser tegen die kolom
 * uitgelijnd in plaats van tegen het scherm, en dan hangt je "volledige scherm"
 * ineens in een strook van 300 pixels. Home Assistant lost dat voor zijn eigen
 * dialogen op dezelfde manier op: het element wordt aan `document.body`
 * gehangen en daar geopend.
 *
 * ## Wat er wél en niet over de websocket gaat
 *
 * Zoeken gaat via de integratie (`media/search`), want daarvoor is de
 * MA-config-entry nodig en die hoort een kaart niet op te zoeken. De lijst met
 * gelabelde speakers ook (`media/speakers`), want een label uitrollen over
 * entiteit, apparaat en gebied is serverwerk.
 *
 * Afspelen, groeperen, shuffle en herhalen zijn gewone service-aanroepen op een
 * entiteit. Die doet dit scherm zelf: er staat geen enkele reden tegenover om
 * daar een eigen commando voor te schrijven, en elke doorgeefluik is een plek
 * waar iets stiller kan afwijken.
 */

import { meldAan } from "../registratie.js";
import { sheet, tokens, baseCss } from "../theme.js";
import { resolve } from "../icons.js";
import { bindActions, stateOf } from "../ha.js";
import { bindSlider, sliderCss, sliderHtml } from "../slider.js";
import { zetScrollSlot } from "../scrollslot.js";
import { Herkansing, nogNietGereed } from "../herkansing.js";
import { KENMERK, isGedempt, kan, volumePct } from "../cards/media-logica.js";
import {
  BIB_SOORTEN,
  ZOEK_SOORTEN as SOORTEN,
  SOORT_ENKELVOUD,
  bibSoortNa,
  BIB_WOORD,
  haalBibliotheek,
  haalLijstNummers,
  haalUitLijst,
  kanFavoriet,
  maakLijst,
  verwijderLijst,
  voegToeAanLijst,
  zetFavoriet,
} from "./bibliotheek.js";

/** Hoe lang we wachten met zoeken nadat er een toets is losgelaten. */
const TIK_PAUZE_MS = 350;

/** Het Nederlandse woord bij een `media_type`, voor het label op een treffer. */
const SOORT_WOORD = {
  track: "Nummer",
  album: "Album",
  artist: "Artiest",
  playlist: "Afspeellijst",
  radio: "Radio",
  podcast: "Podcast",
  audiobook: "Luisterboek",
};

/** Wat er onder de naam van een treffer staat. */
function ondertitel(t) {
  const artiesten = Array.isArray(t.artists)
    ? t.artists.map((a) => (typeof a === "string" ? a : a?.name)).filter(Boolean).join(", ")
    : "";
  const album = typeof t.album === "string" ? t.album : t.album?.name;
  const woord = SOORT_WOORD[t.media_type] ?? "";
  return [artiesten, album].filter(Boolean).join(" · ") || woord;
}

const css = /* css */ `
  :host {
    ${tokens}
    position: fixed; inset: 0; z-index: 9999;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }

  .laag {
    position: absolute; inset: 0;
    background: color-mix(in srgb, var(--dac-bg) 92%, transparent);
    backdrop-filter: blur(14px);
    display: flex; flex-direction: column;
    animation: op 180ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }

  /* ---------------------------------------------------------------- kop */
  header {
    flex: 0 0 auto; display: flex; align-items: center; gap: 12px;
    padding: max(14px, env(safe-area-inset-top)) 16px 12px;
    border-bottom: 1px solid var(--dac-border);
  }
  header .wie { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
  header .wie b { font-size: 15px; font-weight: 600; }
  header .wie span { font-size: 12px; color: var(--dac-ink-2); }

  .rond {
    flex: 0 0 auto; width: 38px; height: 38px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    color: var(--dac-ink-2); font: inherit;
  }
  @media (hover: hover) { .rond:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .rond .icon { width: 18px; height: 18px; }

  /* ------------------------------------------------------------ zoeken */
  /* De zoekbalk is breed en heeft het woord "zoeken" erin -- op een tablet zie
     je anders een leeg vak en weet je niet of er iets gebeurt. */
  .zoek {
    flex: 0 0 auto; padding: 14px 16px 8px; display: flex; gap: 10px; align-items: center;
    flex-wrap: wrap;
  }
  .zoek .veld {
    flex: 1 1 auto; display: flex; align-items: center; gap: 12px;
    padding: 0 18px; height: 56px; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .zoek .veld .icon { width: 20px; height: 20px; }
  .zoekknop {
    flex: 0 0 auto; height: 56px; padding: 0 26px; cursor: pointer;
    font: inherit; font-size: 15px; font-weight: 600;
    border-radius: var(--dac-radius-pill); color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 18%, transparent);
    border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
    transition: background 160ms ease;
  }
  @media (hover: hover) { .zoekknop:hover { background: color-mix(in srgb, var(--dac-accent-hi) 28%, transparent); } }
  .zoek .veld:focus-within { border-color: var(--dac-accent-hi); }
  .zoek .veld .icon { width: 18px; height: 18px; color: var(--dac-ink-3); flex: 0 0 auto; }
  .zoek input {
    flex: 1 1 auto; min-width: 0; height: 100%;
    background: none; border: 0; outline: none;
    font: inherit; font-size: 16px; color: var(--dac-ink);
  }
  .zoek input::placeholder { color: var(--dac-ink-3); }

  /* ------------------------------------------------------------ tabbladen */
  /* Drie plekken: zoeken, je favorieten, je afspeellijsten. Ze staan bovenaan
     en niet in een menu, want dit is de indeling van het scherm -- niet een
     instelling die je een keer kiest. */
  .tabs {
    flex: 0 0 auto; display: flex; gap: 6px; padding: 10px 16px 0;
  }
  .tabs button {
    flex: 1 1 0; padding: 12px 10px; cursor: pointer; font: inherit; font-size: 14px;
    font-weight: 600; color: var(--dac-ink-2); background: none;
    border: 0; border-bottom: 2px solid transparent;
    transition: color 160ms ease, border-color 160ms ease;
  }
  @media (hover: hover) { .tabs button:hover { color: var(--dac-ink); } }
  .tabs button[aria-selected="true"] {
    color: var(--dac-ink); border-bottom-color: var(--dac-accent-hi);
  }

  .soorten {
    flex: 0 0 auto; display: flex; gap: 8px; padding: 6px 16px 10px;
    overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none;
  }
  .soorten::-webkit-scrollbar { display: none; }
  .soorten button {
    flex: 0 0 auto; padding: 7px 14px; cursor: pointer; font: inherit; font-size: 12.5px;
    border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border); color: var(--dac-ink-2);
  }
  .soorten button[aria-pressed="true"] {
    background: color-mix(in srgb, var(--dac-accent-hi) 18%, transparent);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 45%, transparent);
    color: var(--dac-ink); font-weight: 600;
  }

  /* -------------------------------------------------------- resultaten */
  .lijst {
    /* overscroll-behavior: contain houdt het scrollen HIER. Zonder dat
       scrolde de pagina achter het scherm mee zodra je onderaan de lijst was --
       je scrolt dan in twee dingen tegelijk. */
    flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain;
    padding: 4px 16px 20px;
    display: grid; gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    align-content: start;
  }

  /* De regel is een wikkel: de knop links, het hartje of het kruisje rechts.
     Een knop in een knop bestaat niet in HTML, dus staan ze naast elkaar.
     min-width 0 op de wikkel én op de knop: zonder de eerste rekt een lange
     naam de rasterkolom op, zonder de tweede loopt hij door de rand heen. */
  .rij { position: relative; display: flex; align-items: center; min-width: 0; }
  .rij .tr { flex: 1 1 auto; min-width: 0; }
  /* Het hartje ligt OP de tegel en niet ernaast: naast de tegel valt hij buiten
     het vlak en lijkt hij bij niets te horen. De tekst maakt ruimte met een
     rechtermarge, zodat een lange naam er niet onder verdwijnt. */
  .rij[data-knoppen="1"] .tr .tekst { padding-right: 42px; }
  .rij[data-knoppen="2"] .tr .tekst { padding-right: 84px; }
  /* De knoppen aan de rechterkant van een regel, op de tegel en niet ernaast. */
  .rij .knoppen {
    position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
    display: flex; align-items: center; gap: 2px;
  }
  .rij .hart, .rij .weg, .rij .meer { position: static; transform: none; }

  /* De drie puntjes: dezelfde maat als het hartje, en ze openen hetzelfde menu
     als vasthouden. Vasthouden blijft werken, maar het is een verborgen
     handeling -- wie hem niet kent, kon niets aan een afspeellijst toevoegen. */
  .meer {
    flex: 0 0 auto; width: 42px; height: 42px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: none; border: 0; color: var(--dac-ink-3);
    transition: color 160ms ease, background 160ms ease;
  }
  @media (hover: hover) { .meer:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .meer .icon { width: 20px; height: 20px; }

  /* Een hidden-attribuut verliest het van een display in een regel
     hierboven. Dat is geen detail: zonder deze regel bleef de zoekbalk op het
     favorietenblad staan, en stond de terugknop van een afspeellijst er terwijl
     er geen lijst open was. Gemeten, niet bedacht. */
  .zoek[hidden], .soorten[hidden], .lijstkop[hidden], .tabs[hidden] { display: none; }

  .tr {
    display: flex; align-items: center; gap: 12px; padding: 8px;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius-sm);
    cursor: pointer; text-align: left; font: inherit; color: inherit;
    transition: background 160ms ease, border-color 160ms ease;
  }
  @media (hover: hover) { .tr:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .tr:active { transform: scale(.99); }
  .tr .hoes {
    flex: 0 0 auto; width: 52px; height: 52px; border-radius: 9px; overflow: hidden;
    display: grid; place-items: center;
    background: rgba(255,255,255,.05); border: 1px solid var(--dac-border);
    color: var(--dac-ink-3);
  }
  .tr .hoes img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .tr .hoes .icon { width: 20px; height: 20px; }
  .tr .tekst { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .tr .nm {
    font-size: 13.5px; font-weight: 500; line-height: 1.25;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .tr .ond {
    font-size: 11.5px; color: var(--dac-ink-2); line-height: 1.25;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .tr .soort {
    align-self: flex-start; margin-top: 2px; padding: 1px 7px; border-radius: var(--dac-radius-pill);
    font-size: 10px; letter-spacing: .04em; text-transform: none;
    background: rgba(255,255,255,.06); color: var(--dac-ink-3);
  }

  /* ------------------------------------------------------------ meldingen */
  .melding {
    grid-column: 1 / -1; margin: 30px auto; max-width: 460px; text-align: center;
    color: var(--dac-ink-2); font-size: 13.5px; line-height: 1.5;
  }
  .melding b { display: block; color: var(--dac-ink); font-size: 15px; margin-bottom: 6px; }
  .melding.fout b { color: var(--dac-bad); }

  /* -------------------------------------------------------------- speakers */
  /* De kop van de speakerbalk is een knop: op een telefoon nam die balk het
     halve scherm in beslag, en dan blader je door je muziek in een strook van
     vier regels. Dicht toont hij wie er speelt; open de hele lijst. */
  .voetkop {
    display: flex; align-items: center; gap: 10px; width: 100%;
    padding: 12px 4px; cursor: pointer; font: inherit; text-align: left;
    background: none; border: 0; color: inherit;
  }
  .voetkop .waar {
    flex: 1 1 auto; min-width: 0; font-size: 12.5px; color: var(--dac-ink-2);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .voetkop .pijl {
    flex: 0 0 auto; display: grid; place-items: center;
    transition: transform 200ms ease;
  }
  .voetkop .pijl .icon { width: 18px; height: 18px; color: var(--dac-ink-3); }
  footer[open] .voetkop .pijl { transform: rotate(180deg); }
  footer:not([open]) .sprekers { display: none; }
  /* Ook open blijft de lijst binnen de perken: hooguit de helft van het scherm,
     en scrollen doe je erin en niet erachter. */
  footer[open] .sprekers {
    max-height: min(46vh, 340px); overflow-y: auto; overscroll-behavior: contain;
  }

  footer {
    flex: 0 0 auto; border-top: 1px solid var(--dac-border);
    padding: 10px 16px max(12px, env(safe-area-inset-bottom));
    display: flex; flex-direction: column; gap: 8px;
  }
  footer[hidden] { display: none; }
  footer .kop {
    font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
    color: var(--dac-ink-3);
  }
  /* Per speaker een regel: aan- of uitzetten links, en zijn eigen volume
     ernaast. Dat laatste is geen luxe -- in een groep staat de een in de keuken
     naast je en de ander twee kamers verderop. */
  .sprekers {
    display: grid; gap: 6px;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  .spreker {
    display: flex; align-items: center; gap: 10px;
    padding: 4px 10px 4px 4px; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .spreker[data-mee="true"] {
    background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 40%, transparent);
  }
  .mee {
    flex: 0 0 auto; display: flex; align-items: center; gap: 8px; min-width: 0;
    padding: 6px 10px; cursor: pointer; font: inherit; font-size: 12.5px;
    background: none; border: 0; border-radius: var(--dac-radius-pill);
    color: var(--dac-ink-2); text-align: left;
  }
  .spreker[data-mee="true"] .mee { color: var(--dac-ink); font-weight: 600; }
  .mee .icon { width: 15px; height: 15px; flex: 0 0 auto; }
  .mee span {
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;
  }
  .spreker[data-zelf="true"] .mee { cursor: default; }
  .mee[disabled] { opacity: .4; cursor: not-allowed; }

  ${sliderCss}
  .spreker .slider { height: 28px; flex: 1 1 60px; min-width: 60px; }
  .spreker .slider .track { border-radius: 8px; }
  .spreker .pct {
    flex: 0 0 auto; min-width: 34px; text-align: right;
    font-size: 11px; color: var(--dac-ink-2); font-variant-numeric: tabular-nums;
  }
  .spreker .stil { flex: 1 1 auto; font-size: 11px; color: var(--dac-ink-3); text-align: right; }

  /* ---------------------------------------------------------------- menu */
  /* --------------------------------------------------------------- hartje */
  /* Het hartje staat rechts op de regel en is een eigen knop, net als het icoon
     op de entiteitenkaart: op de regel tikken speelt af, op het hartje tikken
     zet hem in je favorieten. Twee dingen, twee knoppen. */
  .hart, .weg {
    flex: 0 0 auto; width: 42px; height: 42px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: none; border: 0; color: var(--dac-ink-3);
    transition: color 160ms ease, background 160ms ease;
  }
  @media (hover: hover) { .hart:hover, .weg:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .hart[aria-pressed="true"] { color: var(--dac-device-1); }
  .hart .icon, .weg .icon { width: 20px; height: 20px; }

  /* ------------------------------------------------------- afspeellijsten */
  .lijstkop {
    flex: 0 0 auto; display: flex; align-items: center; gap: 10px;
    padding: 4px 16px 10px;
  }
  .lijstkop b { flex: 1 1 auto; min-width: 0; font-size: 15px; font-weight: 600;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lijstkop .terug { flex: 0 0 auto; }

  .nieuwe {
    flex: 0 0 auto; margin: 0 16px 10px; padding: 14px; cursor: pointer;
    font: inherit; font-size: 14px; font-weight: 600; text-align: center;
    border-radius: var(--dac-radius); color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 12%, transparent);
    border: 1px dashed color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
  }
  @media (hover: hover) { .nieuwe:hover { background: color-mix(in srgb, var(--dac-accent-hi) 20%, transparent); } }
  .nieuwe[hidden] { display: none; }

  /* De naamregel van een nieuwe lijst. Geen prompt(): die is op een tablet in
     kioskmodus niet te zien, en hij blokkeert alles eromheen. */
  .nieuwrij {
    flex: 0 0 auto; display: flex; gap: 10px; padding: 0 16px 10px;
  }
  .nieuwrij[hidden] { display: none; }
  .nieuwrij input {
    flex: 1 1 auto; min-width: 0; height: 52px; padding: 0 18px;
    border-radius: var(--dac-radius-pill); background: var(--dac-surface);
    border: 1px solid var(--dac-border); outline: none;
    font: inherit; font-size: 16px; color: var(--dac-ink);
  }
  .nieuwrij input:focus { border-color: var(--dac-accent-hi); }

  /* Een korte melding onderin. Niet over de lijst heen: wie iets aan een
     afspeellijst toevoegt terwijl hij aan het zoeken is, hoort zijn
     zoekresultaten te houden. */
  .toast {
    position: absolute; left: 50%; transform: translateX(-50%);
    bottom: max(90px, env(safe-area-inset-bottom));
    max-width: min(560px, 92vw); padding: 14px 22px; z-index: 3;
    border-radius: var(--dac-radius-pill); font-size: 14px; font-weight: 500;
    color: var(--dac-ink); background: var(--dac-bg-raise);
    border: 1px solid var(--dac-border-hi);
    box-shadow: 0 18px 40px -18px rgba(0,0,0,.9);
    animation: op 180ms ease;
  }
  .toast[hidden] { display: none; }
  .toast[data-fout="true"] {
    color: var(--dac-bad);
    border-color: color-mix(in srgb, var(--dac-bad) 50%, transparent);
  }

  /* ------------------------------------------------------------ telefoon */
  /* Gemeten op de telefoon van de eigenaar (390px breed): de knop "Zoeken" viel
     buiten beeld, de tabbladen stonden krap, en de speakerbalk nam het halve
     scherm. Dit blok is geen opsmuk maar de reden dat het scherm daar bruikbaar
     is. */
  @media (max-width: 560px) {
    header { padding: max(10px, env(safe-area-inset-top)) 12px 10px; }
    .tabs { padding: 6px 8px 0; gap: 2px; }
    .tabs button { padding: 12px 4px; font-size: 13px; }

    /* Het veld op de eerste regel, de knop eronder over de volle breedte. Naast
       elkaar passen ze niet: dan wordt het veld zo smal dat er twee woorden in
       staan, of valt de knop van het scherm. */
    .zoek { padding: 10px 12px 6px; gap: 8px; }
    .zoek .veld { flex: 1 1 100%; height: 50px; padding: 0 14px; }
    .zoekknop { flex: 1 1 100%; height: 46px; padding: 0; }

    .soorten { padding: 4px 12px 8px; }
    .lijst { padding: 4px 12px 16px; grid-template-columns: 1fr; }
    .nieuwe, .nieuwrij { margin-inline: 12px; padding-inline: 0; }
    .lijstkop { padding: 4px 12px 8px; }

    footer { padding: 0 12px max(8px, env(safe-area-inset-bottom)); }
    .toast { bottom: max(110px, env(safe-area-inset-bottom)); }
    /* Een menu dat halverwege het scherm begint en 60vh hoog is, past niet meer.
       Op een telefoon is bijna de hele hoogte beter dan een lijst die eronder
       doorloopt. */
    .menu { max-height: 70vh; min-width: 180px; }
  }

  .menu {
    position: fixed; z-index: 2; min-width: 190px; padding: 6px;
    background: var(--dac-bg-raise); border: 1px solid var(--dac-border-hi);
    border-radius: var(--dac-radius-sm); box-shadow: 0 24px 48px -20px rgba(0,0,0,.9);
    display: flex; flex-direction: column;
    /* Scrollen, en dat is geen luxe: "Aan welke lijst?" toont alle bewerkbare
       afspeellijsten, en dat zijn er bij de eigenaar twintig. Zonder dit liep
       het menu onder de onderkant van het scherm door en was de lijst die je
       net had gemaakt onbereikbaar -- alfabetisch stond hij achteraan. */
    max-height: min(60vh, 420px); overflow-y: auto; overscroll-behavior: contain;
  }
  .menu[hidden] { display: none; }
  .menu button {
    padding: 10px 12px; cursor: pointer; font: inherit; font-size: 13px; text-align: left;
    background: none; border: 0; border-radius: 8px; color: var(--dac-ink);
  }
  @media (hover: hover) { .menu button:hover { background: var(--dac-surface-hi); } }
  .menu .titel {
    padding: 6px 12px 8px; font-size: 11.5px; color: var(--dac-ink-3);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px;
  }
`;

class MediaBrowser extends HTMLElement {
  static get sheet_() {
    if (!Object.hasOwn(this, "s_")) this.s_ = sheet(baseCss + css);
    return this.s_;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [new.target.sheet_];
    this.soort_ = "";
    this.treffers_ = [];
    this.speakers_ = null;
    this.opruimen_ = [];
    // Ook hier bestaan onze commando's pas als de config entry is opgezet.
    // Zie de kop van herkansing.js; dit scherm ging tot 0.18.0 meteen op de
    // kale fout, en dat is precies de melding die de eigenaar op zijn telefoon
    // zag -- alleen dan voor de scenes.
    this.zoekHerkansing_ = new Herkansing(() => this.zoek_());
    this.speakerHerkansing_ = new Herkansing(() => this.haalSpeakers_());
  }

  /* ------------------------------------------------------------ openen */

  /**
   * @param {object} hass
   * @param {string} entityId de speler waar dit scherm bij hoort
   * @param {string} naam
   */
  open(hass, entityId, naam, { radioModus = false, speakers = null } = {}) {
    this.hass = hass;
    this.entity_ = entityId;
    this.naam_ = naam;
    this.radioModus_ = radioModus;
    this.speakerKeuze_ = Array.isArray(speakers) && speakers.length ? speakers : null;
    if (!this.gebouwd_) this.bouw_();
    this.setAttribute("open", "");
    // Escape hangt aan het document en niet aan dit element.
    //
    // Aan de host leek genoeg -- het scherm vult alles, dus de focus zit erin.
    // Maar de speakerlijst wordt bij elke toestandswijziging opnieuw getekend,
    // en dan verdwijnt de knop waar de focus op stond. De focus valt terug op
    // body, Escape komt nooit meer bij ons aan, en het scherm laat zich alleen
    // nog met het kruisje sluiten. Gemeten, niet bedacht.
    this.escape_ ??= (e) => {
      if (e.key === "Escape" && this.hasAttribute("open")) this.sluit();
    };
    document.addEventListener("keydown", this.escape_, true);
    // De pagina eronder staat stil zolang dit scherm openligt. Zonder dit
    // scrolde Home Assistant mee zodra je op de laag zelf scrolde in plaats van
    // in een lijst -- gemeld op 20 augustus 2026. `??=`, want `open()` wordt ook
    // aangeroepen op een scherm dat al openstaat (een andere speler); een tweede
    // slot zou het eerste kwijtmaken en de pagina vast laten staan.
    this.scrollLos_ ??= zetScrollSlot();
    this.$(".wie b").textContent = naam;
    this.$(".wie span").textContent = "Music Assistant";
    this.sprekerSig_ = null;
    // Altijd dichtgeklapt beginnen. Wie het scherm opent komt muziek zoeken;
    // waar het heen gaat staat in de kop, en openklappen is een tik.
    this.$("footer")?.removeAttribute("open");
    this.$(".voetkop")?.setAttribute("aria-expanded", "false");
    // Altijd op het zoekblad beginnen. Wie het scherm opent wil meestal iets
    // zoeken; en een scherm dat opent waar je het vorige keer liet, laat je
    // eerst uitzoeken waar je bent.
    this.lijst_ = null;
    this.soort_ = "";
    this.naarTab_("zoeken");
    this.haalSpeakers_();
    // Focus ná de animatie: een input die tijdens een transform focus krijgt,
    // laat sommige mobiele browsers de pagina meescrollen.
    setTimeout(() => this.$(".zoek input")?.focus(), 60);
  }

  sluit() {
    this.removeAttribute("open");
    this.menuDicht_();
    if (this.escape_) document.removeEventListener("keydown", this.escape_, true);
    this.scrollLos_?.();
    this.scrollLos_ = null;
  }

  set hass(hass) {
    this.hass_ = hass;
    if (this.gebouwd_ && this.hasAttribute("open")) this.tekenSpeakers_();
  }

  get hass() {
    return this.hass_;
  }

  $(sel) {
    return this.shadowRoot.querySelector(sel);
  }

  /* ------------------------------------------------------------- opbouw */

  bouw_() {
    this.gebouwd_ = true;
    this.shadowRoot.innerHTML = `
      <div class="laag">
        <header>
          <span class="wie"><b></b><span></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${resolve("close")}</button>
        </header>
        <nav class="tabs" role="tablist">
          <button type="button" role="tab" data-tab="zoeken" aria-selected="true">Zoeken</button>
          <button type="button" role="tab" data-tab="favorieten" aria-selected="false">Favorieten</button>
          <button type="button" role="tab" data-tab="lijsten" aria-selected="false">Afspeellijsten</button>
        </nav>
        <div class="lijstkop" hidden>
          <button class="rond terug" type="button" aria-label="Terug">${resolve("chevronRight")}</button>
          <b></b>
          <button class="rond weglijst" type="button" aria-label="Deze afspeellijst verwijderen">${resolve("bin")}</button>
        </div>
        <button class="nieuwe" type="button" hidden>+  Nieuwe afspeellijst</button>
        <div class="nieuwrij" hidden>
          <input type="text" placeholder="Naam van de afspeellijst" aria-label="Naam van de nieuwe afspeellijst" />
          <button class="zoekknop" type="button" data-maak>Maken</button>
        </div>
        <div class="zoek">
          <label class="veld">
            ${resolve("search")}
            <input type="search" placeholder="Zoeken naar een nummer, album, artiest of afspeellijst"
                   autocomplete="off" spellcheck="false" enterkeyhint="search"
                   aria-label="Zoeken in Music Assistant" />
          </label>
          <button class="zoekknop" type="button">Zoeken</button>
        </div>
        <nav class="soorten">
          ${SOORTEN.map(
            ([waarde, label]) =>
              `<button type="button" data-soort="${waarde}" aria-pressed="${waarde === "" }">${label}</button>`
          ).join("")}
        </nav>
        <div class="lijst"></div>
        <footer hidden>
          <button class="voetkop" type="button" aria-expanded="false">
            <span class="kop">Speelt af op</span>
            <span class="waar"></span>
            <span class="pijl">${resolve("chevronDown")}</span>
          </button>
          <div class="sprekers"></div>
        </footer>
        <div class="menu" hidden></div>
      </div>`;

    this.aan_(this.$(".sluit"), "click", () => this.sluit());
    this.aan_(this.$(".laag"), "pointerdown", (e) => {
      // Buiten alles klikken sluit. De kop, de lijst en de voet vangen hun
      // eigen kliks, dus dit gaat alleen over de lege ruimte ernaast.
      if (e.target === this.$(".laag")) this.sluit();
      else if (!e.target.closest(".menu")) this.menuDicht_();
    });

    // `.zoek input` en niet `input`: sinds het afspeellijstenblad staat het
    // naamveld van een nieuwe lijst eerder in de shadow root, en dan hingen alle
    // zoekbindingen aan het verkeerde veld. Gemeten: typen in het naamveld
    // vuurde zoekopdrachten af.
    const veld = this.$(".zoek input");
    this.aan_(this.$(".zoekknop"), "click", () => {
      clearTimeout(this.timer_);
      this.zoek_();
      veld.focus();
    });
    this.aan_(veld, "input", () => this.tikPauze_());
    this.aan_(veld, "keydown", (e) => {
      if (e.key === "Enter") {
        clearTimeout(this.timer_);
        this.zoek_();
      }
      if (e.key === "Escape") this.sluit();
    });
    this.lijstLuisteraars_();

    // De speakerbalk klapt in en uit. Dicht op een telefoon: gemeten op het
    // toestel van de eigenaar nam hij daar het halve scherm in beslag, en dan
    // blader je door je muziek in een strook van vier regels.
    this.aan_(this.$(".voetkop"), "click", () => {
      const voet = this.$("footer");
      const open = voet.toggleAttribute("open");
      this.$(".voetkop").setAttribute("aria-expanded", String(open));
      this.voetOpen_ = open;
    });

    this.aan_(this.$(".tabs"), "click", (e) => {
      const knop = e.target.closest("[data-tab]");
      if (knop) this.naarTab_(knop.dataset.tab);
    });
    this.aan_(this.$(".terug"), "click", () => {
      this.lijst_ = null;
      this.naarTab_("lijsten");
    });
    this.aan_(this.$(".weglijst"), "click", () => this.lijstWeg_());
    this.aan_(this.$(".nieuwe"), "click", () => {
      this.$(".nieuwrij").hidden = false;
      this.$(".nieuwe").hidden = true;
      this.$(".nieuwrij input").value = "";
      this.$(".nieuwrij input").focus();
    });
    this.aan_(this.$("[data-maak]"), "click", () => this.lijstMaken_());
    this.aan_(this.$(".nieuwrij input"), "keydown", (e) => {
      if (e.key === "Enter") this.lijstMaken_();
      if (e.key === "Escape") {
        this.$(".nieuwrij").hidden = true;
        this.$(".nieuwe").hidden = false;
      }
    });

    this.aan_(this.$(".soorten"), "click", (e) => {
      const knop = e.target.closest("[data-soort]");
      if (!knop) return;
      // Dezelfde knoppenbalk, twee verschillende dingen eronder: bij zoeken is
      // dit een filter op de zoekopdracht (enkelvoud, "track"), bij favorieten
      // kiest hij WELKE bibliotheek je ziet (meervoud, "tracks"). Ze in één
      // veld bewaren betekende dat het favorietenblad de zoekopdracht van het
      // andere blad ging vergiftigen -- en andersom.
      if (this.modus_ === "favorieten") this.bibSoort_ = knop.dataset.soort;
      else this.soort_ = knop.dataset.soort;
      for (const b of this.shadowRoot.querySelectorAll("[data-soort]")) {
        b.setAttribute("aria-pressed", String(b === knop));
      }
      clearTimeout(this.timer_);
      if (this.modus_ === "favorieten") this.haalFavorieten_();
      else this.zoek_();
    });

    this.aan_(this.$(".sprekers"), "click", (e) => {
      const knop = e.target.closest("button[data-speaker]");
      if (knop && !knop.disabled) this.wisselSpeaker_(knop.dataset.speaker);
    });

    this.leegMelding_(
      "Zoek in Music Assistant",
      "Typ een naam en kies uit alles wat je bibliotheek en je providers kennen: nummers, albums, artiesten, afspeellijsten en radio."
    );
  }

  aan_(el, type, fn, opts) {
    el.addEventListener(type, fn, opts);
    this.opruimen_.push(() => el.removeEventListener(type, fn, opts));
  }

  /* ------------------------------------------------------------- zoeken */

  tikPauze_() {
    clearTimeout(this.timer_);
    // Bij elke toets zoeken overspoelt MA en zijn providers, en het resultaat
    // van de derde letter komt dan soms ná dat van de vijfde binnen.
    this.timer_ = setTimeout(() => this.zoek_(), TIK_PAUZE_MS);
  }

  async zoek_() {
    // Het veld kan weg zijn: een herkansing die afgaat terwijl het scherm net
    // opnieuw is opgebouwd, heeft niets om te lezen.
    const veld = this.$(".zoek input");
    if (!veld) return;
    const vraag = veld.value.trim();
    if (!vraag) {
      this.treffers_ = this.zoekTreffers_ = [];
      this.leegMelding_(
        "Zoek in Music Assistant",
        "Typ een naam en kies uit alles wat je bibliotheek en je providers kennen."
      );
      return;
    }

    // Elke zoekopdracht krijgt een nummer. Alleen het antwoord op de laatste
    // wordt getekend: een trage provider mag geen oud resultaat over een nieuw
    // heen leggen.
    const beurt = (this.beurt_ = (this.beurt_ ?? 0) + 1);
    this.leegMelding_("Zoeken…", vraag);

    try {
      const antwoord = await this.hass.callWS({
        type: "domotiapp_lovelace/media/search",
        query: vraag,
        ...(this.soort_ ? { media_types: [this.soort_] } : {}),
        limit: 20,
      });
      if (beurt !== this.beurt_) return;
      this.treffers_ = this.zoekTreffers_ = antwoord?.results ?? [];
      this.zoekHerkansing_.herstel();
      this.teken_();
    } catch (fout) {
      if (beurt !== this.beurt_) return;

      // Home Assistant kent het commando nog niet: dat is niet stuk, dat is te
      // vroeg. Zeg dat ook zo -- "Zoeken lukte niet" stuurt iemand op zoek
      // naar een fout die er niet is -- en vraag het straks zelf opnieuw.
      if (nogNietGereed(fout)) {
        this.zoekHerkansing_.plan();
        this.leegMelding_(
          "Home Assistant start nog op",
          "Zodra DomotiApp klaar is met opstarten, wordt er vanzelf gezocht."
        );
        return;
      }

      this.leegMelding_(
        "Zoeken lukte niet",
        fout?.message ?? "Music Assistant gaf geen antwoord.",
        true
      );
    }
  }

  /* ---------------------------------------------------------- tabbladen */

  /**
   * Naar een tabblad.
   *
   * Elk tabblad heeft zijn eigen kop: zoeken heeft een zoekveld en soortknoppen,
   * favorieten heeft alleen soortknoppen (er valt niets te zoeken, je bladert),
   * en afspeellijsten heeft geen van beide maar wel een knop om er een te maken.
   * Wat er niet bij hoort verdwijnt, in plaats van uitgegrijsd te blijven staan.
   */
  naarTab_(tab) {
    this.modus_ = tab;
    for (const b of this.shadowRoot.querySelectorAll("[data-tab]")) {
      b.setAttribute("aria-selected", String(b.dataset.tab === tab));
    }

    const inLijst = tab === "lijsten" && this.lijst_;
    this.$(".zoek").hidden = tab !== "zoeken";
    this.$(".soorten").hidden = tab === "lijsten";
    this.$(".lijstkop").hidden = !inLijst;
    this.$(".nieuwe").hidden = tab !== "lijsten" || Boolean(this.lijst_);
    this.$(".nieuwrij").hidden = true;

    if (tab === "zoeken") {
      this.tekenSoorten_(SOORTEN, this.soort_);
      // Het andere blad heeft `treffers_` overschreven met zijn eigen lijst --
      // dat is wat er op het scherm staat. Wie terugkomt hoort zijn zoekresultaat
      // terug te zien, met de hartjes zoals ze nu zijn, en niet de favorieten
      // van het vorige blad.
      this.treffers_ = this.zoekTreffers_ ?? [];
      if (!this.treffers_.length) {
        this.leegMelding_(
          "Zoek in Music Assistant",
          "Typ een naam en kies uit alles wat je bibliotheek en je providers kennen."
        );
        return;
      }
      this.teken_();
      return;
    }
    if (tab === "favorieten") {
      this.haalFavorieten_();
      return;
    }
    if (inLijst) this.openLijst_(this.lijst_);
    else this.haalLijsten_();
  }

  /** De filterknoppen; ze dienen zowel het zoeken als de favorieten. */
  tekenSoorten_(soorten, gekozen) {
    this.$(".soorten").innerHTML = soorten
      .map(
        ([waarde, label]) =>
          `<button type="button" data-soort="${waarde}" aria-pressed="${waarde === gekozen}">${label}</button>`
      )
      .join("");
  }

  /* -------------------------------------------------------- favorieten */

  async haalFavorieten_() {
    // Eén lege waarde ("Alles") bestaat hier niet -- MA levert per soort. Welke
    // soort dat is staat in `bibSoort_`: gezet door de soortknoppen hierboven,
    // of door het laatste hartje dat je aanzette. Zie `favorietOm_`.
    this.bibSoort_ ??= "playlists";
    this.tekenSoorten_(BIB_SOORTEN, this.bibSoort_);
    const beurt = (this.beurt_ = (this.beurt_ ?? 0) + 1);
    this.leegMelding_("Ophalen…", "Je favorieten uit Music Assistant.");
    try {
      const items = await haalBibliotheek(this.hass, this.bibSoort_, { favoriet: true });
      if (beurt !== this.beurt_) return;
      this.treffers_ = items;
      if (!items.length) {
        this.leegMelding_(
          "Nog geen favorieten",
          `Zoek iets op en tik op het hartje om het hier te zetten.`
        );
        return;
      }
      this.teken_();
    } catch (fout) {
      if (beurt !== this.beurt_) return;
      this.leegMelding_("Ophalen lukte niet", fout?.message ?? "Music Assistant gaf geen antwoord.", true);
    }
  }

  /** Het hartje om. Meteen tekenen, want wachten op MA voelt als een dode knop. */
  async favorietOm_(item, knop) {
    const nieuw = !item.favorite;
    item.favorite = nieuw;
    knop?.setAttribute("aria-pressed", String(nieuw));
    try {
      const antwoord = await zetFavoriet(this.hass, item, nieuw);
      // Een zoekresultaat heeft nog geen bibliotheeknummer; dat krijgt het pas
      // doordat MA het bij het favoriet maken in de bibliotheek zet. De
      // serverkant geeft het terug, en zonder dit op te slaan kon je een
      // zoekresultaat wel favoriet maken maar niet meteen weer afvinken.
      if (nieuw && antwoord?.library_item_id) {
        item.library_item_id = antwoord.library_item_id;
        if (antwoord.kind) item.media_type = SOORT_ENKELVOUD[antwoord.kind] ?? item.media_type;
      }
      // Het favorietenblad opent op de soort die je nét favoriet maakte.
      //
      // Dit was de melding "hij slaat favorieten niet op": een nummer favoriet
      // maken en dan naar Favorieten gaan liet je naar favoriete AFSPEELLIJSTEN
      // kijken, want daar viel het blad op terug. Het nummer stond er wel, maar
      // niet in de lijst waar je naar keek.
      if (nieuw) this.bibSoort_ = bibSoortNa(antwoord, item, this.bibSoort_);
      // In het favorietenblad hoort een afgevinkt item te verdwijnen: het is
      // geen favoriet meer, dus het staat niet meer in de lijst van favorieten.
      if (this.modus_ === "favorieten" && !nieuw) this.haalFavorieten_();
    } catch (fout) {
      item.favorite = !nieuw;
      knop?.setAttribute("aria-pressed", String(!nieuw));
      this.leegMelding_("Dat lukte niet", fout?.message ?? "Music Assistant gaf geen antwoord.", true);
    }
  }

  /* ----------------------------------------------------- afspeellijsten */

  async haalLijsten_() {
    const beurt = (this.beurt_ = (this.beurt_ ?? 0) + 1);
    this.leegMelding_("Ophalen…", "Je afspeellijsten uit Music Assistant.");
    try {
      const items = await haalBibliotheek(this.hass, "playlists", {});
      if (beurt !== this.beurt_) return;
      this.treffers_ = items;
      if (!items.length) {
        this.leegMelding_("Nog geen afspeellijsten", "Maak er een met de knop hierboven.");
        return;
      }
      this.teken_();
    } catch (fout) {
      if (beurt !== this.beurt_) return;
      this.leegMelding_("Ophalen lukte niet", fout?.message ?? "Music Assistant gaf geen antwoord.", true);
    }
  }

  async openLijst_(lijst) {
    this.lijst_ = lijst;
    this.modus_ = "lijsten";
    this.$(".lijstkop").hidden = false;
    this.$(".lijstkop b").textContent = lijst.name ?? "Afspeellijst";
    this.$(".nieuwe").hidden = true;
    // Een lijst van een provider die niet bewerkbaar is (Spotify bijvoorbeeld)
    // mag je wel zien maar niet weggooien. De knop verdwijnt dan.
    this.$(".weglijst").hidden = !lijst.is_editable;

    const beurt = (this.beurt_ = (this.beurt_ ?? 0) + 1);
    this.leegMelding_("Ophalen…", lijst.name ?? "");
    try {
      const nummers = await haalLijstNummers(this.hass, lijst);
      if (beurt !== this.beurt_) return;
      this.treffers_ = nummers;
      if (!nummers.length) {
        this.leegMelding_("Deze lijst is leeg", "Zoek iets op en kies 'Aan afspeellijst toevoegen'.");
        return;
      }
      this.teken_();
    } catch (fout) {
      if (beurt !== this.beurt_) return;
      this.leegMelding_("Ophalen lukte niet", fout?.message ?? "Music Assistant gaf geen antwoord.", true);
    }
  }

  async lijstMaken_() {
    const naam = this.$(".nieuwrij input").value.trim();
    if (!naam) return;
    this.$(".nieuwrij").hidden = true;
    try {
      await maakLijst(this.hass, naam);
      this.lijst_ = null;
      this.naarTab_("lijsten");
    } catch (fout) {
      this.leegMelding_("Maken lukte niet", fout?.message ?? "Music Assistant gaf geen antwoord.", true);
    }
  }

  async lijstWeg_() {
    const lijst = this.lijst_;
    if (!lijst) return;
    // Twee keer tikken om te bevestigen. Geen dialoog: die staat op een tablet
    // in kioskmodus achter het scherm, en dit is niet onomkeerbaar genoeg voor
    // een heel scherm -- de nummers blijven gewoon in de bibliotheek staan.
    const knop = this.$(".weglijst");
    if (knop.dataset.zeker !== "ja") {
      knop.dataset.zeker = "ja";
      knop.title = "Nog een keer tikken om te verwijderen";
      knop.style.color = "var(--dac-bad)";
      setTimeout(() => {
        knop.dataset.zeker = "";
        knop.style.color = "";
      }, 4000);
      return;
    }
    knop.dataset.zeker = "";
    knop.style.color = "";
    try {
      await verwijderLijst(this.hass, lijst);
      this.lijst_ = null;
      this.naarTab_("lijsten");
    } catch (fout) {
      this.leegMelding_("Verwijderen lukte niet", fout?.message ?? "Music Assistant gaf geen antwoord.", true);
    }
  }

  /**
   * Een nummer uit de open afspeellijst. Op POSITIE, want zo wil MA het -- en
   * die posities beginnen bij 1, niet bij 0.
   */
  async nummerWeg_(item) {
    const lijst = this.lijst_;
    if (!lijst || item.position == null) return;
    try {
      await haalUitLijst(this.hass, lijst, [item.position]);
      this.melding_(`"${item.name}" uit de lijst gehaald`);
      // Music Assistant verwerkt dit niet meteen. Meteen terugkijken geeft de
      // oude lijst; gemeten op de installatie van de eigenaar duurde het een
      // paar seconden. Dus: even wachten, en dan pas opnieuw ophalen.
      await this.naVerwerking_(lijst);
    } catch (fout) {
      this.melding_(fout?.message ?? "Verwijderen lukte niet", true);
    }
  }

  /**
   * Haal de lijst opnieuw op zodra Music Assistant klaar is.
   *
   * Twee pogingen, want de vertraging is niet vast: MA verwerkt toevoegen en
   * verwijderen in een achtergrondtaak en cachet de nummers van een lijst. De
   * serverkant vraagt inmiddels om een verse lijst (`force_refresh`), maar dat
   * helpt niet als de taak nog loopt.
   */
  async naVerwerking_(lijst) {
    for (const wacht of [900, 2500]) {
      await new Promise((r) => setTimeout(r, wacht));
      if (this.lijst_ !== lijst || !this.hasAttribute("open")) return;
      await this.openLijst_(lijst);
    }
  }

  /** Het menu "aan welke lijst?" achter een treffer. */
  async kiesLijstVoor_(treffer) {
    this.menuDicht_();
    let lijsten = [];
    try {
      lijsten = await haalBibliotheek(this.hass, "playlists", {});
    } catch {
      lijsten = [];
    }
    const bewerkbaar = lijsten.filter((l) => l.is_editable);
    const menu = this.$(".menu");
    menu.innerHTML =
      `<span class="titel">Aan welke lijst?</span>` +
      (bewerkbaar.length
        ? bewerkbaar
            .map((l, i) => `<button type="button" data-lijst="${i}">${this.veilig_(l.name)}</button>`)
            .join("")
        : `<span class="titel">Geen bewerkbare lijst. Maak er eerst een.</span>`);
    menu.hidden = false;
    // Opnieuw plaatsen: deze lijst is veel hoger dan het menu dat er stond.
    this.menuPlaats_(menu);
    menu.scrollTop = 0;
    menu.onclick = async (e) => {
      const knop = e.target.closest("[data-lijst]");
      if (!knop) return;
      const lijst = bewerkbaar[+knop.dataset.lijst];
      this.menuDicht_();
      try {
        await voegToeAanLijst(this.hass, lijst, [treffer.uri]);
        // Music Assistant zet er een achtergrondtaak voor klaar en bevestigt
        // niets. Zonder dit bericht gebeurde er zichtbaar níéts, en dat leest
        // als "toevoegen werkt niet" -- precies wat er gemeld werd.
        this.melding_(`"${treffer.name}" toegevoegd aan "${lijst.name}"`);
      } catch (fout) {
        this.melding_(fout?.message ?? "Toevoegen lukte niet", true);
      }
    };
  }

  /**
   * Een korte melding die vanzelf weer weggaat.
   *
   * Niet `leegMelding_`: die vervangt de hele lijst, en dat is precies verkeerd
   * als je net iets aan een afspeellijst hebt toegevoegd terwijl je aan het
   * zoeken bent -- dan ben je je zoekresultaten kwijt.
   */
  melding_(tekst, fout = false) {
    let balk = this.$(".toast");
    if (!balk) {
      balk = document.createElement("div");
      balk.className = "toast";
      this.$(".laag").appendChild(balk);
    }
    balk.textContent = tekst;
    balk.dataset.fout = String(fout);
    balk.hidden = false;
    clearTimeout(this.toastTimer_);
    this.toastTimer_ = setTimeout(() => {
      balk.hidden = true;
    }, fout ? 6000 : 3000);
  }

  leegMelding_(kop, tekst, fout = false) {
    this.$(".lijst").innerHTML =
      `<div class="melding${fout ? " fout" : ""}"><b>${kop}</b>${tekst}</div>`;
  }

  teken_() {
    const lijst = this.$(".lijst");
    if (!this.treffers_.length) {
      this.leegMelding_("Niets gevonden", "Probeer een andere naam of een ander soort.");
      return;
    }
    const inLijst = this.modus_ === "lijsten" && this.lijst_;
    lijst.innerHTML = this.treffers_
      .map((t, i) => {
        const hoes = t.image
          ? `<img src="${t.image}" alt="" loading="lazy" />`
          : resolve(t.media_type === "radio" ? "radio" : "music");
        // Het hartje staat naast de regel en niet erin: een knop in een knop
        // bestaat niet in HTML, en een tik erop moet iets ánders doen dan een
        // tik op de regel.
        const hart =
          kanFavoriet(t) && !inLijst
            ? `<button class="hart" type="button" data-hart="${i}" aria-pressed="${Boolean(t.favorite)}"
                 aria-label="Favoriet">${resolve("star")}</button>`
            : "";
        const weg = inLijst
          ? `<button class="weg" type="button" data-weg="${i}"
               aria-label="Uit deze afspeellijst halen">${resolve("close")}</button>`
          : "";
        // De drie puntjes openen hetzelfde menu als vasthouden.
        const meer = `<button class="meer" type="button" data-meer="${i}"
               aria-label="Meer met ${this.veilig_(t.name)}">${resolve("dots")}</button>`;
        const aantal = (hart || weg ? 1 : 0) + 1;
        return `
          <div class="rij" data-i="${i}" data-knoppen="${aantal}">
            <button class="tr" type="button">
              <span class="hoes">${hoes}</span>
              <span class="tekst">
                <span class="nm">${this.veilig_(t.name)}</span>
                <span class="ond">${this.veilig_(ondertitel(t))}</span>
              </span>
            </button><span class="knoppen">${hart}${weg}${meer}</span>
          </div>`;
      })
      .join("");

    // Eén binding per hertekening, en de vorige wordt opgeruimd: `bindActions`
    // hangt aan de lijst, niet aan elke knop.
    this.trefferBinding_?.();
    this.trefferBinding_ = bindActions(lijst, {
      onTap: () => {
        const t = this.laatsteTreffer_;
        if (!t) return;
        // In het afspeellijstenblad opent een tik de lijst in plaats van hem af
        // te spelen: je wilt zien wat erin zit. Afspelen doe je met vasthouden,
        // net als overal in dit scherm.
        if (this.modus_ === "lijsten" && !this.lijst_) this.openLijst_(t);
        else this.speel_(t, "replace", { radio: this.radioStandaard_(t) });
      },
      onHold: () => {
        const t = this.laatsteTreffer_;
        if (t) this.menuOpen_(t);
      },
    });

  }

  /**
   * De luisteraars op de lijst. EEN KEER, bij het opbouwen.
   *
   * Ze stonden in `teken_()`, en dat is precies de val die in dit project al
   * eerder tijd heeft gekost: `teken_()` draait bij elke hertekening, dus na
   * twee keer tekenen hingen er twee klikluisteraars en verwijderde een tik op
   * het kruisje TWEE nummers uit de afspeellijst. Gemeten in de werkbank.
   *
   * Ze hoeven ook niet opnieuw: het element `.lijst` blijft staan, en welke
   * regel geraakt is lezen ze uit het `data-`attribuut van het doel.
   */
  lijstLuisteraars_() {
    const lijst = this.$(".lijst");

    // Het hartje en het kruisje zijn eigen knoppen. Zonder dit telt een tik
    // erop ook als een tik op de regel, en dan speelt er muziek terwijl je
    // alleen een hartje wilde zetten -- dezelfde afspraak als bij de chip op de
    // entiteitenkaart.
    //
    // stopIMMEDIATEPropagation, en dat is geen detail. `bindActions` hangt zijn
    // click-luisteraar aan DIT ZELFDE element, en `stopPropagation` houdt alleen
    // de OUDERS tegen -- niet een tweede luisteraar op hetzelfde element. Het
    // gevolg stond in de melding van de eigenaar: een tik op het hartje zette de
    // favoriet én startte de muziek. Dat deze luisteraar als eerste geregistreerd
    // is (in bouw_, vóór teken_) is wat hem de kans geeft de andere te stoppen.
    this.aan_(lijst, "click", (e) => {
      const hart = e.target.closest("[data-hart]");
      const weg = e.target.closest("[data-weg]");
      const meer = e.target.closest("[data-meer]");
      if (!hart && !weg && !meer) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      if (hart) this.favorietOm_(this.treffers_[+hart.dataset.hart], hart);
      else if (weg) this.nummerWeg_(this.treffers_[+weg.dataset.weg]);
      else {
        this.menuPlek_ = meer.getBoundingClientRect();
        this.menuOpen_(this.treffers_[+meer.dataset.meer]);
      }
    });
    this.aan_(lijst, "pointerdown", (e) => {
      if (e.target.closest("[data-hart], [data-weg], [data-meer]")) e.stopImmediatePropagation();
    });
    // `bindActions` zegt of het een tik of een vasthoud was, maar niet waarop.
    // Dat lezen we bij het neergaan van de vinger.
    this.aan_(lijst, "pointerdown", (e) => {
      const knop = e.target.closest("[data-i]");
      this.laatsteTreffer_ = knop ? this.treffers_[+knop.dataset.i] : null;
      this.menuPlek_ = knop ? knop.getBoundingClientRect() : null;
    });
  }

  /** Tekst uit Music Assistant is data, geen markup. */
  veilig_(tekst) {
    const d = document.createElement("div");
    d.textContent = tekst ?? "";
    return d.innerHTML;
  }

  /* ----------------------------------------------------------- afspelen */

  /**
   * @param {"replace"|"next"|"add"} wachtrij
   * @param {{radio?: boolean}} opties
   *
   * `radio_mode` is wat Spotify doet nadat het gekozen nummer klaar is: Music
   * Assistant zoekt er zelf muziek bij en speelt door in plaats van te stoppen.
   * Het is een gewone optie van `music_assistant.play_media`; wij bieden hem
   * alleen aan waar hij ergens op slaat -- bij een radiozender valt er niets
   * bij te zoeken, die speelt zelf al door.
   */
  speel_(treffer, wachtrij, { radio = false } = {}) {
    if (!treffer?.uri) return;
    this.menuDicht_();
    this.hass.callService(
      "music_assistant",
      "play_media",
      {
        media_id: treffer.uri,
        ...(treffer.media_type ? { media_type: treffer.media_type } : {}),
        enqueue: wachtrij,
        ...(radio ? { radio_mode: true } : {}),
      },
      { entity_id: this.entity_ }
    );
    // Meteen weg bij "nu afspelen": je wilde muziek, niet een scherm. Bij
    // hierna en achteraan blijf je waar je bent -- daar ben je aan het stapelen.
    if (wachtrij === "replace") this.sluit();
  }

  /**
   * Valt er iets bij te zoeken?
   *
   * Alleen bij muziek. Een radiozender speelt zelf al door, en een afspeellijst
   * heeft zijn eigen einde -- daar hoort Music Assistant niet ongevraagd
   * achteraan te plakken.
   */
  kanRadio_(treffer) {
    return ["track", "album", "artist"].includes(treffer?.media_type);
  }

  /** Doorspelen als de kaart daarom vraagt. Zie de instelling `radio_mode`. */
  radioStandaard_(treffer) {
    return Boolean(this.radioModus_) && this.kanRadio_(treffer);
  }

  menuOpen_(treffer) {
    const menu = this.$(".menu");
    const inLijst = this.modus_ === "lijsten" && this.lijst_;
    menu.innerHTML =
      `<span class="titel">${this.veilig_(treffer.name)}</span>` +
      `<button type="button" data-w="replace">Nu afspelen</button>` +
      (this.kanRadio_(treffer)
        ? `<button type="button" data-radio>Afspelen en doorgaan</button>`
        : "") +
      `<button type="button" data-w="next">Hierna afspelen</button>` +
      `<button type="button" data-w="add">Achteraan in de wachtrij</button>` +
      (kanFavoriet(treffer)
        ? `<button type="button" data-fav>${treffer.favorite ? "Uit favorieten" : "Favoriet maken"}</button>`
        : "") +
      // Een afspeellijst in een afspeellijst stoppen kan niet, en een artiest
      // ook niet -- MA neemt losse nummers en albums aan.
      (treffer.uri && !inLijst && treffer.media_type !== "playlist"
        ? `<button type="button" data-toe>Aan afspeellijst toevoegen</button>`
        : "");
    menu.hidden = false;

    this.menuPlaats_(menu);

    menu.onclick = (e) => {
      const knop = e.target.closest("[data-w]");
      if (knop) {
        return this.speel_(treffer, knop.dataset.w, {
          radio: knop.dataset.w === "replace" && this.radioStandaard_(treffer),
        });
      }
      if (e.target.closest("[data-radio]")) {
        return this.speel_(treffer, "replace", { radio: true });
      }
      if (e.target.closest("[data-fav]")) {
        this.menuDicht_();
        return this.favorietOm_(treffer, this.shadowRoot.querySelector(
          `[data-hart="${this.treffers_.indexOf(treffer)}"]`
        ));
      }
      if (e.target.closest("[data-toe]")) return this.kiesLijstVoor_(treffer);
      return undefined;
    };
  }

  /**
   * Zet het menu ergens waar het HELEMAAL past.
   *
   * De vorige versie klemde de bovenkant op `innerHeight - 160`, alsof een menu
   * nooit hoger dan 160 pixels zou zijn. "Aan welke lijst?" is dat wel: bij de
   * eigenaar staan er twintig bewerkbare afspeellijsten in, en dan liep het
   * menu onder de onderkant van het scherm door -- met de lijst die hij net had
   * gemaakt achteraan, want de volgorde is alfabetisch.
   *
   * Nu wordt de werkelijke hoogte gemeten, ná het tekenen, en past het menu
   * boven de aanklikplek als het eronder niet past.
   */
  menuPlaats_(menu) {
    const r = this.menuPlek_;
    const breed = menu.offsetWidth || 210;
    const hoog = menu.offsetHeight || 160;
    const links = Math.min(Math.max(8, (r?.left ?? 40) + 12), window.innerWidth - breed - 8);

    const onder = (r?.bottom ?? 80) + 6;
    const boven =
      onder + hoog <= window.innerHeight - 8
        ? onder
        : Math.max(8, (r?.top ?? 80) - hoog - 6);

    menu.style.left = `${links}px`;
    menu.style.top = `${Math.min(boven, Math.max(8, window.innerHeight - hoog - 8))}px`;
  }

  menuDicht_() {
    const menu = this.$(".menu");
    if (menu) menu.hidden = true;
  }

  /* ----------------------------------------------------------- speakers */

  async haalSpeakers_() {
    // Staat de keuze in de kaart, dan is dat de lijst. Geen label om te plakken,
    // geen serverronde: de kaart weet welke speakers erbij horen omdat je ze
    // daar hebt aangewezen.
    if (this.speakerKeuze_) {
      this.speakers_ = {
        label_exists: true,
        entities: this.speakerKeuze_
          .map((id) => {
            const st = stateOf(this.hass, id);
            return st
              ? {
                  entity_id: id,
                  name: st.attributes?.friendly_name ?? id,
                  can_group: kan(st, KENMERK.GROUPING),
                }
              : null;
          })
          // Een speaker die niet meer bestaat hoort niet als lege regel te
          // blijven staan; dan lijkt de kaart stuk terwijl er een entiteit weg is.
          .filter(Boolean),
        filtered_out: 0,
      };
      this.tekenSpeakers_();
      return;
    }
    try {
      this.speakers_ = await this.hass.callWS({
        type: "domotiapp_lovelace/media/speakers",
      });
      this.speakerHerkansing_.herstel();
    } catch (fout) {
      // Geen speakerlijst is geen reden om het zoeken te blokkeren: dan staat
      // de voet er gewoon niet. Maar is Home Assistant alleen nog niet klaar,
      // dan komt de balk er zo alsnog -- zonder dat het scherm dicht en open
      // hoeft.
      this.speakers_ = null;
      if (nogNietGereed(fout)) this.speakerHerkansing_.plan();
    }
    this.tekenSpeakers_();
  }

  /** Wie speelt er nu mee? De speler zelf staat altijd vooraan. */
  groepNu_() {
    const st = this.hass?.states?.[this.entity_];
    const leden = st?.attributes?.group_members;
    return new Set(Array.isArray(leden) ? leden : []);
  }

  tekenSpeakers_() {
    const voet = this.$("footer");
    if (!voet) return;
    const lijst = this.speakers_;
    if (!lijst || !lijst.label_exists || !lijst.entities?.length) {
      // Geen label geplakt: dan hoort hier uitleg te staan en geen lege balk.
      // Maar alleen als er iets te zeggen valt -- zonder Music Assistant is de
      // hele voet zinloos.
      voet.hidden = !lijst || lijst.label_exists === undefined;
      if (!voet.hidden) {
        this.$(".sprekers").innerHTML =
          `<span class="ond" style="color:var(--dac-ink-2);font-size:12.5px">` +
          `Plak het label <b>${this.veilig_(lijst?.label_name ?? "Music Assistant Media")}</b> ` +
          `op je speakers om ze hier samen te laten spelen.</span>`;
      }
      return;
    }

    voet.hidden = false;
    const groep = this.groepNu_();

    // Dicht moet de balk nog steeds zeggen waar het geluid heen gaat -- anders
    // is inklappen alleen maar iets kwijtraken.
    const meespelend = lijst.entities.filter(
      (sp) => sp.entity_id === this.entity_ || groep.has(sp.entity_id)
    );
    this.$(".waar").textContent = meespelend.length
      ? meespelend.map((sp) => sp.name).join(", ")
      : this.naam_ ?? "";

    // Alleen opnieuw opbouwen als de samenstelling verandert. Elke hertekening
    // gooit de knop weg waar iemand net op stond -- en daarmee de focus. De
    // volumes worden daaronder los bijgewerkt, zonder iets te hertekenen.
    const sig = lijst.entities
      .map((s) => `${s.entity_id}:${s.entity_id === this.entity_ || groep.has(s.entity_id)}`)
      .join("|");
    if (this.sprekerSig_ !== sig) {
      this.sprekerSig_ = sig;
      this.schuiven_?.forEach((off) => off());
      this.schuiven_ = new Map();
      this.$(".sprekers").innerHTML = lijst.entities
        .map((s) => {
          const zelf = s.entity_id === this.entity_;
          const mee = zelf || groep.has(s.entity_id);
          const kanVolume = kan(stateOf(this.hass, s.entity_id), KENMERK.VOLUME_SET);
          return `
            <div class="spreker" data-speaker="${s.entity_id}" data-zelf="${zelf}" data-mee="${mee}">
              <button class="mee" type="button" data-speaker="${s.entity_id}"
                      aria-pressed="${mee}" ${!zelf && !s.can_group ? "disabled" : ""}
                      title="${zelf ? "Deze speler" : s.can_group ? "Laat deze speaker meespelen" : "Deze speaker laat zich niet koppelen"}">
                ${resolve(mee ? "volume" : "speaker")}<span>${this.veilig_(s.name)}</span>
              </button>
              ${
                mee && kanVolume
                  // Zonder eigen klassenaam: `sliderHtml("spreker")` gaf de schuif
                  // dezelfde klasse als de regel eromheen, en dan erft hij de
                  // pilvorm én komt hij mee uit `querySelectorAll(".spreker")`.
                  ? `${sliderHtml()}<span class="pct tnum"></span>`
                  : mee
                    ? `<span class="stil">geen volumeregeling</span>`
                    : ""
              }
            </div>`;
        })
        .join("");

      // Elke schuif regelt zijn eigen speaker, en schrijft pas bij loslaten.
      for (const rij of this.shadowRoot.querySelectorAll(".spreker")) {
        const el = rij.querySelector(".slider");
        if (!el) continue;
        const id = rij.dataset.speaker;
        el.setAttribute("aria-label", `Volume ${rij.querySelector("span")?.textContent ?? ""}`);
        const off = bindSlider(el, {
          value: () => volumePct(stateOf(this.hass, id)),
          onInput: (v) => this.zetSchuif_(el, v),
          onCommit: (v) =>
            this.hass.callService(
              "media_player",
              "volume_set",
              { volume_level: v / 100 },
              { entity_id: id }
            ),
        });
        this.schuiven_.set(id, off);
      }
    }

    // De standen bijwerken: dat mag wél elke keer, want er wordt niets vervangen.
    for (const rij of this.shadowRoot.querySelectorAll(".spreker")) {
      const id = rij.dataset.speaker;
      const el = rij.querySelector(".slider");
      if (!el || el.classList.contains("dragging")) continue;
      const st = stateOf(this.hass, id);
      const pct = volumePct(st);
      this.zetSchuif_(el, pct, isGedempt(st));
    }
  }

  zetSchuif_(el, pct, gedempt = false) {
    el.style.setProperty("--v", `${pct}%`);
    el.setAttribute("aria-valuenow", String(pct));
    const label = el.parentElement.querySelector(".pct");
    if (label) label.textContent = gedempt ? "gedempt" : `${pct}%`;
  }

  wisselSpeaker_(entityId) {
    if (entityId === this.entity_) return;
    const groep = this.groepNu_();

    if (groep.has(entityId)) {
      // Loskoppelen doe je bij de speaker zelf: hij verlaat de groep.
      this.hass.callService("media_player", "unjoin", {}, { entity_id: entityId });
      return;
    }

    // Koppelen doe je bij de speler van deze kaart: die wordt de baas van de
    // groep, en dat is ook de speler waar de muziek al op staat.
    this.hass.callService(
      "media_player",
      "join",
      { group_members: [entityId] },
      { entity_id: this.entity_ }
    );

    // EN METEEN HET VOLUME GELIJKZETTEN.
    //
    // Dit is geen nettigheid maar een veiligheid. Een speaker die uit een
    // vorige sessie op vol volume staat, begint bij het koppelen op vol volume
    // -- in een slaapkamer, om elf uur 's avonds, en een kleine speaker kan er
    // stuk van gaan. Wat je hoort hoort te zijn wat de schuif aangeeft, dus
    // krijgt de nieuwe speaker het volume van de speler waar hij bij komt.
    const hoofd = stateOf(this.hass, this.entity_);
    // Alleen overnemen als de hoofdspeaker ECHT een volume heeft. Een speler
    // zonder `volume_level` -- een tv-kastje, een groep die het niet meldt --
    // geeft hier 0, en dan zou de speaker die erbij komt op stil gezet worden.
    // Dat is een speaker die het niet doet en waar je de oorzaak niet van ziet.
    if (typeof hoofd?.attributes?.volume_level !== "number") return;
    const nu = volumePct(hoofd);
    const erbij = stateOf(this.hass, entityId);
    if (!kan(erbij, KENMERK.VOLUME_SET)) return;
    if (volumePct(erbij) === nu) return;
    this.hass.callService(
      "media_player",
      "volume_set",
      { volume_level: nu / 100 },
      { entity_id: entityId }
    );
  }

  disconnectedCallback() {
    clearTimeout(this.timer_);
    // Een scherm dat weg is hoeft niets meer te vragen.
    this.zoekHerkansing_.stop();
    this.speakerHerkansing_.stop();
    // Ook hier losmaken: wordt het scherm uit de DOM gehaald terwijl het
    // openstaat (een dashboard dat opnieuw opbouwt), dan is er niemand meer die
    // `sluit()` aanroept en zou de pagina voorgoed vaststaan.
    this.scrollLos_?.();
    this.scrollLos_ = null;
    this.schuiven_?.forEach((off) => off());
    this.schuiven_ = null;
    if (this.escape_) document.removeEventListener("keydown", this.escape_, true);
    this.trefferBinding_?.();
    for (const fn of this.opruimen_) fn();
    this.opruimen_ = [];
    this.gebouwd_ = false;
  }
}

meldAan("domotiapp-media-browser", MediaBrowser);

/**
 * Het ene scherm dat alle mediakaarten delen.
 *
 * Eén per pagina en niet één per kaart: een dashboard met zes speakers zou
 * anders zes volledige schermen in de DOM hebben staan, met zes abonnementen op
 * `hass`. Welke speler het scherm bedient wordt bij het openen meegegeven.
 */
export function toonZoekscherm(hass, entityId, naam, opties = {}) {
  let scherm = document.querySelector("domotiapp-media-browser");
  if (!scherm) {
    scherm = document.createElement("domotiapp-media-browser");
    document.body.appendChild(scherm);
  }
  // Zonder tabindex vangt het scherm geen Escape voordat er ergens geklikt is.
  scherm.tabIndex = -1;
  scherm.open(hass, entityId, naam, opties);
  scherm.focus?.();
  return scherm;
}
