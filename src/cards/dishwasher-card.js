/**
 * De vaatwasser: wat hij doet, hoe lang nog, en de drie knoppen eromheen.
 *
 * Nagebouwd naar een kaart die de eigenaar ooit zelf maakte (de "Ultimate
 * Dishwasher"), met dezelfde velden en twee dingen erbij die hij miste: een
 * VOORTGANGSBALK voor de tijd en een ANIMATIE zolang hij draait.
 *
 * WAAROM DE ANIMATIE AAN DE BALK HANGT EN NIET AAN HET ICOON
 *
 * Een draaiend icoon trekt de aandacht van een afstand, en dat is precies wat
 * een vaatwasser niet verdient -- er is niets aan de hand, hij doet gewoon zijn
 * werk. De balk beweegt daarom en het icoon niet: wie ernaar kijkt ziet dat er
 * iets loopt, wie er langsloopt wordt niet gestoord. Wie bewegingen uit heeft
 * staan (`prefers-reduced-motion`) krijgt een stilstaande balk; de stand en het
 * woord blijven.
 *
 * WAAROM ER GEEN GROENE STARTKNOP IS
 *
 * De kaart die hij had, had een groene Start en een rode Stop. Groen is in deze
 * familie gereserveerd voor de status "goed" (zie theme.js), en een startknop is
 * geen status. Start draagt daarom het accent. Rood blijft wél op Stop staan:
 * dat is een waarschuwing en geen identiteit, en een stopknop die eruitziet als
 * de rest is een stopknop die je per ongeluk indrukt.
 *
 * De rangorde van wat er in de statusregel komt -- draait verslaat een
 * klepsensor die achterloopt, een open klep verslaat "klaar om te starten" --
 * staat in `vaatwasser-logica.js`, met tests eronder.
 *
 * DE GEPLANDE START
 *
 * Sinds 0.47.0 zegt de kaart wanneer een energiebeheerder hem gaat starten:
 * "Start om 14:00" in plaats van "Klaar om te starten". De sensor komt uit het
 * veld Geplande start, of -- leeg gelaten -- van DomotiApp Coach, die hem
 * vindbaar maakt via de schakelaar onder Slimme sturing. Dat moment verandert
 * niet, maar de WOORDEN wel: om middernacht wordt "morgen" vandaag, en na het
 * moment zelf hoort de tekst weg te gaan. Daarom tikt de kaart op die twee
 * momenten zelf een keer; zie `planTik_`.
 *
 * IN COMBINATIE MET DE COACH
 *
 * Sinds 0.58.0 kan de kaart een apparaat van DomotiApp Coach volgen (het vinkje
 * in de editor). Dan staan de knoppen van het coachpaneel erop: Ingeruimd (of
 * "Morgen starten" als de klaar-tijd van vandaag voorbij is), Nu starten, en
 * Handmatig. Handmatig klapt de programmakeuze en Start/Stop van de machine
 * zelf open -- dat is in het paneel ook een stap verder weg, omdat het de
 * enige knoppen zijn die langs de coach heen gaan. Lege velden vult de kaart
 * met wat de klant bij de coach koos. Zie `coach-logica.js` voor hoe de kaart
 * het apparaat en zijn entiteiten vindt.
 *
 * WASMACHINE EN DROGER (sinds 0.70.0)
 *
 * Gevraagd op 15 oktober 2026, voor Miele: dit is de kaart voor elk apparaat
 * met een programma, met merk, type en productfoto. Kies je de statussensor
 * van Miele, dan zoekt de kaart de rest van het apparaat zelf: resterende
 * tijd, voortgang (uit verstreken en resterende tijd), programma en fase,
 * start, pauze en stop (alleen als Miele ze beschikbaar maakt), TwinDos, het
 * verbruik en de geplande start. Zie programma-logica.js. Het `type` bleef
 * `domotiapp-dishwasher-card`, want dat staat in dashboards.
 *
 * ALLEEN UITLEZEN, EN DE LAATSTE BEURT (sinds 0.78.0)
 *
 * Een wasmachine en een droger hebben geen eigen knoppen meer: *"wasmachines
 * en drogers moeten alleen read only en info kaarten zijn"*. Staat hij uit,
 * dan tonen de tegels de laatste beurt, uit de recorder (`laatsteBeurt` in
 * programma-logica.js); zodra hij aangaat weer de live gegevens. De
 * vaatwasser blijft zoals hij was.
 *
 * Sinds 0.79.0 staan de knoppen van de COACH er wel, als de coach hem mag
 * sturen (`welkeKnoppen` in programma-logica.js).
 */

import { DacCard, INCOMPLETE, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, section, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { isOn, nameOf, stateOf } from "../ha.js";
import { bewusteWijziging, meetRaster, volgRaster } from "../rasterhoogte.js";
import {
  COACH_FABRIKANT,
  PROGRAMMA_MODELLEN,
  coachRollen,
  contractVan,
  kiesApparaat,
  klantEntiteiten,
} from "./coach-logica.js";
import { huidigeKeuze, keuzes, kiesOproep } from "./keuzeveld.js";
import { metType, merkKeuzes, productAfbeelding, typeKeuzes } from "./productfoto.js";
import {
  ALLEEN_LEZEN,
  BEURT_DAGEN,
  BEURT_ROLLEN,
  PROGRAMMA_APPARATEN,
  ROLLEN,
  SOORTEN,
  apparaatRollen,
  apparaatSoort,
  beurtTegels,
  beurtWanneer,
  knopKan,
  laatsteBeurt,
  metApparaatVelden,
  programmaTegels,
  reeksenUitWs,
  startUitDuur,
  veldenVanApparaat,
  voortgangUitTijden,
  welkeKnoppen,
} from "./programma-logica.js";
import { keuzeNaam } from "./programmanaam.js";
import {
  bezig,
  editorVelden,
  coachKnoppen,
  coachMelding,
  coachStand,
  draait,
  drukOproep,
  metCoachVelden,
  restMinuten,
  SOORT,
  startMoment,
  statusDuiding,
  statusUitCoach,
  toestand,
  vindStartSensor,
  voortgangPct,
} from "./vaatwasser-logica.js";
import { nt, t } from "../taal.js";

/** De rollen van het apparaat, met wat alleen de laatste beurt leest. */
const ALLE_ROLLEN = { ...ROLLEN, ...BEURT_ROLLEN };

/**
 * Zo lang na het uitgaan leest de kaart de recorder pas: die schrijft met
 * vertraging weg (valkuil 32, vijf seconden bleek genoeg).
 */
const RECORDER_MARGE = 8_000;

/** Van een kleurnaam uit de logica naar de token van het thema. */
const TOON = {
  good: TONES.good,
  warn: TONES.warn,
  bad: TONES.bad,
  neutral: TONES.neutral,
  accent: TONES.accent,
};

class DishwasherCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }

    /* De tussenruimte is 8 en niet 9, en dat is gemeten en geen smaak.
       Met 9 komt de volledige kaart op 40 + 6 + 40 aan inhoud, plus 2x9 gap,
       plus 2x8 padding, plus 2x1 rand = 122px. Dat is TWEE pixels over de
       120 van twee rasterrijen, en dus klimt de kaart naar drie rijen met 64px
       lucht eronder. Met 8 komt hij op precies 120 uit. */
    .card {
      min-height: var(--dac-raster, 56px);
      padding: 8px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ------------------------------------------------------------- de kop */

    .top { display: flex; align-items: center; gap: 11px; min-height: 40px; cursor: pointer; }
    .chip { width: 40px; height: 40px; }
    .chip .icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      display: flex; align-items: center; gap: 5px; min-width: 0;
      font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2);
    }
    .st .sw { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .st .let { color: var(--dac-warn); font-weight: 600; }
    /* Met een foto in de kop draagt dit icoontje de toestand, net als op de
       robotstofzuiger: alleen het icoon draagt de kleur (Vormregels). */
    .st .stip { flex: 0 0 auto; width: 13px; height: 13px; color: var(--tone); display: grid; }
    .st .stip .icon { width: 13px; height: 13px; --mdc-icon-size: 13px; }
    .st .stip[hidden] { display: none; }


    /* De productfoto in de kop, op een eigen vlak in de tint van het thema:
       een witte machine verdwijnt anders op een lichte kaart. Staand, want een
       wasmachine en een droger zijn hoger dan breed. */
    .foto {
      flex: 0 0 auto; display: block; width: 44px; height: 52px; padding: 4px;
      object-fit: contain; object-position: center;
      border-radius: var(--dac-radius-sm);
      background: radial-gradient(ellipse at 50% 45%, rgba(var(--dac-tint), .2), rgba(var(--dac-tint), .06) 75%);
      border: 1px solid var(--dac-border);
    }
    .foto[hidden], .chip[hidden] { display: none; }

    /* De tegels (sinds 0.71.0): deur, programma, fase, klaar om, verbruik en
       TwinDos, ALTIJD, met een streep waar niets is. In de vorm van de tegels
       op de airco-kaart: de waarde groot, het label eronder, een tik opent de
       sensor. Vier naast elkaar bij acht tegels (de wasmachine), drie bij vijf
       (de droger). */
    .tegels { --kol: 3; flex: 0 0 auto; display: grid; grid-template-columns: repeat(var(--kol), minmax(0, 1fr)); gap: 6px; }
    .tegels[hidden] { display: none; }
    .tegels[data-n="1"] { --kol: 1; }
    .tegels[data-n="2"] { --kol: 2; }
    .tegels[data-n="4"], .tegels[data-n="7"], .tegels[data-n="8"] { --kol: 4; }
    .tegel {
      display: flex; flex-direction: column; align-items: center; gap: 1px;
      padding: 5px 4px; min-width: 0; cursor: pointer;
      background: rgba(var(--dac-tint), .038); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
      -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) { .tegel:hover { border-color: var(--dac-border-hi); } }
    .tegel .w {
      font-size: 13px; font-weight: 500; line-height: 1.3; font-variant-numeric: tabular-nums; color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
    }
    /* Het label mag over twee regels: "Energie verwacht" paste op een
       droger van 246 breed niet in de tegel. */
    .tegel .l {
      font-size: 10.5px; line-height: 1.2; color: var(--dac-ink-3); text-align: center; text-wrap: balance;
      display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; max-width: 100%;
    }
    /* Op een smalle kaart minder naast elkaar: vier op 300 maakt van "Katoen"
       "Kat...". Drie tot 220; daaronder twee, want drie op 175 kapt "0,4 kWh"
       af. Twee op 246 maakte de kaart zes rijen hoog (gemeten op
       15 oktober 2026). */
    @container (max-width: 340px) {
      .tegels[data-n="4"], .tegels[data-n="7"], .tegels[data-n="8"] { --kol: 3; }
    }
    /* Met [data-n] en niet alleen .tegels: anders wint de regel voor acht
       hierboven, die zwaarder weegt (gemeten: drie naast elkaar op 175). */
    @container (max-width: 220px) {
      .tegels[data-n] { --kol: 2; }
      .tegels[data-n="1"] { --kol: 1; }
    }

    /* Een halve kaart op een telefoon (rond 175): de statusregel mag dan
       doorlopen. Afgekapt stond er "Draait · nog 4...", en de resterende tijd
       is juist wat je wilt zien (gemeten op 15 oktober 2026). */
    @container (max-width: 240px) {
      .st { align-items: flex-start; }
      .st .sw { white-space: normal; }
    }

    /* --------------------------------------------------------- de balk */

    .balk {
      flex: 0 0 auto; position: relative; height: 6px; border-radius: 999px;
      background: var(--dac-surface-hi); overflow: hidden;
    }
    .balk[hidden] { display: none; }
    .vul {
      position: absolute; inset: 0 auto 0 0; width: 0%;
      border-radius: 999px;
      background: linear-gradient(90deg,
        color-mix(in srgb, var(--tone) 55%, transparent), var(--tone));
      transition: width 600ms ease;
    }

    /* Zolang hij draait loopt er een glans over de balk. Niet fel en niet snel:
       de kaart hoort te laten zien dát er iets loopt, niet om aandacht te
       vragen -- er is niets aan de hand. */
    :host([draait]) .vul::after {
      content: ""; position: absolute; inset: 0;
      background: linear-gradient(90deg,
        transparent 0%,
        color-mix(in srgb, #fff 34%, transparent) 50%,
        transparent 100%);
      animation: glans 2.4s linear infinite;
    }
    @keyframes glans {
      from { transform: translateX(-100%); }
      to   { transform: translateX(100%); }
    }

    /* Zonder voortgangssensor is er geen stand, maar wél iets te melden: dan
       schuift er een streepje heen en weer in plaats van een lege balk. */
    :host([draait][onbekend]) .vul {
      width: 34%;
      animation: heenweer 2.6s ease-in-out infinite;
    }
    @keyframes heenweer {
      0%, 100% { transform: translateX(-8%); }
      50%      { transform: translateX(200%); }
    }

    @media (prefers-reduced-motion: reduce) {
      :host([draait]) .vul::after,
      :host([draait][onbekend]) .vul { animation: none; }
    }

    /* ------------------------------------------------------- de bediening

       TWEE RIJEN EN NIET EEN, EN DAT IS GEMETEN

       Ze stonden naast elkaar: de programmakeuze, en daarnaast Slim, Start en
       Stop. In een pop-up van 430 pixels breed liep dat mis -- de keuzelijst
       nam de ruimte die hij kon krijgen en de drie knoppen werden zo smal dat
       hun woorden over elkaar vielen ("Slim" en "Start" in elkaar geschoven op
       de schermafdruk van 26 augustus 2026). Dat is de val van flex: 1 1 auto
       naast flex: 1 1 0: allebei willen groeien, en wie het eerst komt wint.

       Nu heeft de keuzelijst een regel voor zichzelf -- hij draagt de langste
       tekst van de kaart -- en delen de knoppen de regel eronder in gelijke
       stukken. Dat kost een rasterrij, en die is het waard: een startknop die
       "Sta" zegt is geen startknop. */

    .rij { flex: 0 0 auto; display: flex; align-items: center; gap: 8px; }

    /* De programmakeuze en de knoppen eronder, als één blok: zonder coach twee
       regels, zoals hierboven gemeten. MET de coach staat er geen Slim meer, en
       dan passen de keuzelijst en Start/Stop naast elkaar -- op een smalle
       kaart lopen ze vanzelf door naar een tweede regel. Gemeld op 11 oktober
       2026 met een schermafdruk: Handmatig open gaf een lege strook boven de
       kop. Gemeten: 195px inhoud, 11 boven de drie rijen (184), dus vier rijen
       (248) met 53px lucht. Op een regel is het 154, en dat zijn er drie. */
    .bediening { flex: 0 0 auto; display: flex; flex-direction: column; gap: 8px; }
    .bediening[hidden] { display: none; }
    /* Tussen twee regels 6 en niet 8: op 320 en 280 breed kwam de open kaart
       op 185, één pixel boven drie rijen, en dan wordt het er vier. */
    :host([coach]) .bediening { flex-direction: row; flex-wrap: wrap; row-gap: 6px; column-gap: 8px; }
    /* 140 + 8 + 180 = 328: past op een telefoon van 380 (binnen 354), en
       daaronder gaat het naar twee regels. Gemeten op 11 oktober 2026; met
       160 en 200 liep het op 380 al door. */
    :host([coach]) .bediening .programma { flex: 1 1 140px; }
    :host([coach]) .bediening .knoppen { flex: 1 1 180px; }
    .rij[hidden] { display: none; }

    /* De programmakeuze. Ondoorzichtige achtergrond, net als op de
       entiteitenkaart: de browser tekent het uitklappaneel met de kleur van de
       select zelf, en dat paneel valt buiten onze shadow root (de fout van
       fase 12). Bewaakt door scripts/check-controls.mjs. */
    .keuze {
      flex: 1 1 auto; min-width: 0;
      font: inherit; font-size: 13px; line-height: 1.2;
      color: var(--dac-ink); color-scheme: var(--dac-scheme);
      background-color: var(--dac-bg-raise);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      padding: 7px 10px; cursor: pointer;
      text-overflow: ellipsis;
    }
    @media (hover: hover) { .keuze:hover { border-color: var(--dac-border-hi); } }
    .keuze:focus-visible { outline: 2px solid var(--tone); outline-offset: 1px; }
    .keuze option { background-color: var(--dac-bg-raise); color: var(--dac-ink); }
    .keuze option:checked { background-color: var(--dac-accent); color: var(--dac-on-accent); }

    .knop {
      flex: 1 1 0; min-width: 0;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 9px 10px;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      background: var(--dac-surface); cursor: pointer;
      font: inherit; font-size: 12.5px; font-weight: 500; color: var(--dac-ink-2);
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
    }
    .knop .icon { width: 15px; height: 15px; flex: 0 0 auto; }
    @media (hover: hover) { .knop:hover { color: var(--dac-ink); border-color: var(--dac-border-hi); } }
    .knop:active { transform: scale(.97); }
    .knop[hidden] { display: none; }

    /* Start draagt het accent en geen groen -- zie de kop van dit bestand. */
    .knop.start {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }
    @media (hover: hover) { .knop.start:hover { background: color-mix(in srgb, var(--dac-accent-hi) 24%, transparent); } }

    .knop.stop {
      color: var(--dac-bad);
      border-color: color-mix(in srgb, var(--dac-bad) 40%, transparent);
    }
    @media (hover: hover) { .knop.stop:hover { background: color-mix(in srgb, var(--dac-bad) 14%, transparent); } }

    /* De slimme knop is een schakelaar en laat dat ook zien, en de vrijgave
       van de coach ook: "Vrijgegeven" is aan, en erop drukken trekt hem in. */
    .knop[data-aan="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }

    /* Handmatig klapt open, en dat mag je zien. */
    .knop.hand[aria-expanded="true"] { color: var(--dac-ink); border-color: var(--dac-border-hi); }

    /* Een tekst die niet past wordt afgekapt, niet over de buurknop heen
       geschreven. "Woensdag starten" is de langste. */
    .knop .lb { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* Waarom de knoppen van de coach er niet staan, als dat zo is. */
    .coachhint {
      flex: 0 0 auto; margin: 0; padding: 0 2px;
      font-size: 11.5px; line-height: 1.35; color: var(--dac-ink-2);
    }
    .coachhint[hidden] { display: none; }

    .top.unavailable { opacity: .42; }

    /* Smal: dan vervallen de woorden op de knoppen en blijven de iconen. Drie
       knoppen met tekst passen niet in een halve kolom. */
    @container (max-width: 320px) {
      .knop .lb { display: none; }
      .knop { flex: 0 0 auto; padding: 9px 14px; }
      .keuze { flex: 1 1 auto; }
    }

    /* DE RIJ VAN DE COACH OP EEN TELEFOON
       Gemeld op 11 oktober 2026 vanaf zijn iPhone, in een bubble-pop-up van
       ongeveer 380 breed: "Morgen ..." en "Handmat..." -- drie knoppen met
       icoon en woord passen daar niet. Alleen iconen (de regel hierboven) is
       hier geen uitweg: een vinkje, een driehoek en een hand zeggen samen niet
       wat er gebeurt. Dus in stappen, en Handmatig geeft als eerste toe, want
       dat is de knop die je het minst nodig hebt:
         - tot 440: Handmatig alleen het handje (de naam staat in aria-label
           en title), de andere twee houden icoon en woord;
         - tot 340: ook hun icoon weg, kleinere letter;
         - tot 290: het korte woord ("Morgen", "Nu"). */
    .knop .kort { display: none; }
    @container (max-width: 440px) {
      .rij.coach .knop.hand { flex: 0 0 auto; padding: 9px 13px; }
      .rij.coach .knop.hand .lb { display: none; }
    }
    @container (max-width: 340px) {
      .rij.coach .knop.vrijgave, .rij.coach .knop.nu { flex: 1 1 0; padding: 9px 6px; font-size: 12px; }
      .rij.coach .knop.vrijgave .lb, .rij.coach .knop.nu .lb { display: inline; }
      .rij.coach .knop.vrijgave > .icon, .rij.coach .knop.nu > .icon { display: none; }
    }
    @container (max-width: 290px) {
      .rij.coach .knop.vrijgave .lb, .rij.coach .knop.nu .lb { display: none; }
      .rij.coach .knop.vrijgave .kort, .rij.coach .knop.nu .kort { display: inline; }
    }

    :focus-visible { outline: 2px solid var(--tone); outline-offset: 2px; }
  `;

  validate(config) {
    // Geen vast icoon meer: zonder keuze is het dat van de soort (een
    // wasmachine krijgt geen vaatwasser). Een vaatwasser blijft een vaatwasser.
    const c = { name: "", merk: "auto", ...config };
    // Met de coach is er altijd iets te tonen: zijn stand, en anders de zin
    // waarom niet.
    if (!c.coach && !c.status && !c.remaining && !c.progress && !c.program) {
      c[INCOMPLETE] = t(
        "Kies minstens een statussensor. Resterende tijd, voortgang, programma en de knoppen mogen daarna."
      );
    }
    return c;
  }

  /**
   * Een ander register (de coach net geïnstalleerd, een apparaat erbij) is
   * geen wijziging in een toestand, en `watched()` ziet het dus niet.
   */
  set hass(hass) {
    const oud = this.hass_;
    super.hass = hass;
    if (!oud || !this.config?.coach || this.config[INCOMPLETE] || !this.built_ || !this.wired_) return;
    if (oud.entities !== hass?.entities || oud.devices !== hass?.devices) this.paint();
  }

  get hass() {
    return super.hass;
  }

  watched() {
    const c = this.velden_();
    const r = this.rollen_(c.status);
    const k = this.coach_()?.rollen ?? {};
    return [
      c.status,
      c.remaining,
      this.startSensor_(),
      // De knoppen van de coach: sinds 0.79.0 staan ze er alleen als ze
      // beschikbaar zijn, en dat verandert als het vinkje "mag sturen" omgaat.
      k.ingeruimd_morgen,
      k.ingeruimd_nu,
      k.vrijgave_intrekken,
      c.progress,
      c.program,
      c.door,
      c.smart,
      c.start,
      c.pause,
      c.stop,
      // Wat de kaart van het apparaat zelf leest (Miele).
      r.deur,
      r.eind,
      r.verstreken,
      r.startIn,
      r.programma,
      r.fase,
      r.twinDos1,
      r.twinDos2,
      r.energie,
      r.energieVerwacht,
      r.water,
      r.waterVerwacht,
    ].filter(Boolean);
  }

  /**
   * De entiteiten die bij de statussensor horen, per rol (programma-logica.js).
   * Vastgehouden zolang het register en de sensor dezelfde zijn.
   */
  rollen_(statusId) {
    const hass = this.hass_;
    if (!hass || !statusId) return {};
    const m = this.rollenMemo_;
    if (m && m.entities === hass.entities && m.status === statusId) return m.uit;
    const uit = apparaatRollen(hass, statusId, ALLE_ROLLEN);
    this.rollenMemo_ = { entities: hass.entities, status: statusId, uit };
    return uit;
  }

  /** Het apparaat van de statussensor in Home Assistant, of null. */
  apparaat_(statusId) {
    const reg = this.hass_?.entities?.[statusId];
    return reg?.device_id ? this.hass_?.devices?.[reg.device_id] ?? null : null;
  }

  /**
   * Het apparaat van de coach en zijn entiteiten per rol, of null zonder coach.
   *
   * Vastgehouden zolang het register en de keuze dezelfde zijn: dit draait bij
   * elke wijziging in het huis, en het register is een ronde langs alles.
   */
  coach_() {
    const c = this.config;
    const hass = this.hass_;
    if (!c?.coach || !hass) return null;
    const m = this.coachMemo_;
    const gekozen = c.coach_device || "";
    if (m && m.entities === hass.entities && m.devices === hass.devices && m.gekozen === gekozen) return m.uit;
    const keuze = kiesApparaat(hass, gekozen, PROGRAMMA_MODELLEN, "Vaatwasser");
    const uit = { keuze, rollen: coachRollen(hass, keuze.id) };
    this.coachMemo_ = { entities: hass.entities, devices: hass.devices, gekozen, uit };
    return uit;
  }

  /**
   * De config zoals de kaart hem gebruikt: met de coach erbij, en dan wat het
   * apparaat van de statussensor zelf levert in de plekken die nog leeg zijn.
   */
  velden_() {
    const coach = this.coach_();
    const basis = coach?.rollen.start
      ? metCoachVelden(this.config, klantEntiteiten(stateOf(this.hass, coach.rollen.start)))
      : this.config;
    return metApparaatVelden(basis, this.rollen_(basis.status));
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    // Zonder dit kijkt de @container-query naar een container van Home Assistant.
    this.style.containerType = "inline-size";

    const knop = (klasse, icoon, label) => `
      <button type="button" class="knop ${klasse}" hidden>
        ${resolve(icoon)}<span class="lb">${escapeHtml(label)}</span><span class="kort">${escapeHtml(label)}</span>
      </button>`;

    return `
      <div class="card surface" style="--tone:${TONES.accent}">
        <div class="top" role="button" tabindex="0">
          <img class="foto" alt="" hidden />
          <span class="chip"></span>
          <span class="txt">
            <span class="nm"></span>
            <span class="st"><span class="stip" hidden></span><span class="sw"></span></span>
          </span>
        </div>

        <div class="balk" hidden><span class="vul"></span></div>

        <div class="tegels" hidden></div>

        <div class="rij coach" hidden>
          ${knop("vrijgave", "check", t("Ingeruimd"))}
          ${knop("nu", "play", t("Nu starten"))}
          ${knop("hand", "handmatig", t("Handmatig"))}
        </div>
        <p class="coachhint" hidden></p>

        <div class="bediening" hidden>
          <div class="rij programma" hidden>
            <span class="programslot" style="display:contents"></span>
          </div>

          <div class="rij knoppen" hidden>
            ${knop("slim", "bolt", t("Slim"))}
            ${knop("start", "play", t("Start"))}
            ${knop("pauze", "pause", t("Pauze"))}
            ${knop("stop", "stop", t("Stop"))}
          </div>
        </div>
      </div>`;
  }

  wire() {
    const c = this.config;

    // Tikken op de kop opent de entiteit die het meest te zeggen heeft. Met de
    // coach kan dat een veld zijn dat hij invulde, dus pas bij de tik gelezen.
    this.on(this.$(".top"), "click", () => {
      const v = this.velden_();
      const id = v.status || v.remaining || v.program || this.startSensor_();
      if (id) this.moreInfo_(id);
    });

    // Een tegel opent zijn sensor: daar staat de geschiedenis.
    const tegels = this.$(".tegels");
    const openTegel = (e) => {
      const tegel = e.target?.closest?.(".tegel");
      if (tegel?.dataset.id) this.moreInfo_(tegel.dataset.id);
    };
    this.on(tegels, "click", openTegel);
    this.on(tegels, "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openTegel(e);
      }
    });

    this.on(this.$(".knop.start"), "click", () => this.druk_(this.velden_().start));
    this.on(this.$(".knop.pauze"), "click", () => this.druk_(this.velden_().pause));
    this.on(this.$(".knop.stop"), "click", () => this.druk_(this.velden_().stop));

    // De knoppen van de coach dragen hun entiteit in `data-entity`: welke het
    // is hangt af van de stand (Ingeruimd geeft vrij, Vrijgegeven trekt in).
    for (const klasse of ["vrijgave", "nu"]) {
      const knop = this.$(`.knop.${klasse}`);
      this.on(knop, "click", () => this.druk_(knop.dataset.entity));
    }
    this.on(this.$(".knop.hand"), "click", () => {
      this.handOpen_ = !this.handOpen_;
      // Open en dicht is twee hoogtes om en om, en dat ziet de pendeldemper
      // anders aan voor een lus: dan bleef de kaart groot (0.58.1).
      bewusteWijziging(this.$(".card"));
      this.paint();
    });
    this.on(this.$(".knop.slim"), "click", () => {
      if (!c.smart) return;
      const aan = isOn(stateOf(this.hass, c.smart));
      this.hass.callService("homeassistant", aan ? "turn_off" : "turn_on", {
        entity_id: c.smart,
      });
    });

    // De keuzelijst wordt in `paint()` gebouwd -- de opties staan in de
    // attributen. Daarom hangt het gedrag aan de RIJ en niet aan de lijst.
    this.on(this.$(".rij.programma"), "change", (e) => {
      const lijst = e.target?.closest?.(".keuze");
      const program = this.velden_().program;
      if (!lijst || !program) return;
      e.stopPropagation();
      const oproep = kiesOproep(program, lijst.value, keuzes(stateOf(this.hass, program)));
      if (oproep) this.hass.callService(oproep[0], oproep[1], oproep[2]);
    });

    this.teardown_.push(volgRaster(this.$(".card")));
    this.teardown_.push(() => {
      clearTimeout(this.tik_);
      this.tik_ = null;
      // Weer in beeld is opnieuw lezen: ondertussen kan er een beurt bij zijn.
      clearTimeout(this.beurtTimer_);
      this.beurtMemo_ = null;
    });
  }

  /**
   * De laatste beurt van een wasmachine of droger die uit staat, of null.
   *
   * Uit de recorder, één keer per keer dat hij uitging: de sleutel is het
   * moment waarop de status "uit" werd. Net na het uitgaan pas na
   * `RECORDER_MARGE`, anders mist de recorder de laatste regels. Tot het
   * antwoord er is staat er null, en dan tekent de kaart de tegels van nu.
   */
  beurt_(statusSt, r) {
    const sleutel = `${statusSt.entity_id}|${statusSt.last_changed}`;
    const m = this.beurtMemo_;
    if (m?.sleutel === sleutel) return m.beurt;
    const memo = { sleutel, beurt: null };
    this.beurtMemo_ = memo;
    clearTimeout(this.beurtTimer_);
    const wacht = Math.max(0, Date.parse(statusSt.last_changed) + RECORDER_MARGE - Date.now());
    const opties = statusSt.attributes?.options ?? null;
    this.beurtTimer_ = setTimeout(() => this.haalBeurt_(memo, { ...r, status: statusSt.entity_id }, opties), wacht);
    return null;
  }

  async haalBeurt_(memo, rollen, opties) {
    const ids = [...new Set(["status", "programma", "energie", "water", "temperatuur", "droogtegraad"].map((x) => rollen[x]).filter(Boolean))];
    try {
      const antwoord = await this.hass.callWS({
        type: "history/history_during_period",
        start_time: new Date(Date.now() - BEURT_DAGEN * 86_400_000).toISOString(),
        entity_ids: ids,
        minimal_response: true,
        no_attributes: true,
      });
      if (this.beurtMemo_ !== memo) return;
      memo.beurt = laatsteBeurt(reeksenUitWs(antwoord), rollen, opties);
      if (this.hass_ && this.isConnected) this.paint();
    } catch {
      // Geen recorder, of geen recht: dan blijven de tegels van nu staan.
    }
  }

  /**
   * De sensor met de geplande start: het veld, of die van DomotiApp Coach.
   *
   * Zoeken is een ronde langs ALLE entiteiten, en `watched()` draait bij elke
   * wijziging in het huis. Daarom wordt een vondst vastgehouden zolang hij nog
   * bij de schakelaar hoort, en wordt er zonder vondst hooguit eens per halve
   * minuut opnieuw gezocht -- de coach kan na de kaart opstarten.
   */
  startSensor_() {
    const c = this.config;
    // Met de coach aan is het de sensor van het gekozen apparaat, ook als er
    // nog een Geplande start in de YAML staat: dat veld is er met de coach niet
    // meer (sinds 0.58.1), en een veld dat je niet ziet hoort niet te sturen.
    // Een coach van vóór v0.110.0 heeft er geen; dan blijft het zoeken via de
    // schakelaar.
    const coach = this.coach_()?.rollen.start;
    if (coach) return coach;
    if (c?.planned_start) return c.planned_start;
    // Miele: de starttijd van het apparaat zelf (programma-logica.js).
    const vanApparaat = this.velden_().planned_start;
    if (vanApparaat) return vanApparaat;
    const states = this.hass_?.states;
    if (!c?.smart || !states) return "";
    if (this.gevonden_ && states[this.gevonden_]?.attributes?.release_switch === c.smart) {
      return this.gevonden_;
    }
    const nu = Date.now();
    if (this.gezochtVoor_ === c.smart && nu - this.gezochtOm_ < 30_000) return this.gevonden_;
    this.gezochtVoor_ = c.smart;
    this.gezochtOm_ = nu;
    this.gevonden_ = vindStartSensor(states, c.smart);
    return this.gevonden_;
  }

  /**
   * Nog een keer tekenen als de woorden gaan verschuiven.
   *
   * Twee momenten: middernacht, waar "morgen om 02:00" "om 02:00" wordt, en
   * net na de geplande start zelf, waar de tekst weg moet als de machine niet
   * is gaan draaien. Hooguit een uur vooruit, zodat een laptop die heeft
   * geslapen niet op een verlopen wekker blijft wachten.
   */
  planTik_(start) {
    clearTimeout(this.tik_);
    this.tik_ = null;
    if (!start) return;
    const nu = new Date();
    const middernacht = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + 1, 0, 0, 1);
    const wacht = Math.min(+middernacht, +start + 61_000) - +nu;
    this.tik_ = setTimeout(
      () => {
        this.tik_ = null;
        if (this.hass_ && this.isConnected) this.paint();
      },
      Math.max(1_000, Math.min(wacht, 3_600_000))
    );
  }

  /** De tegels, alleen opnieuw opgebouwd als er iets in verandert. */
  paintTegels_(lijst) {
    const vak = this.$(".tegels");
    vak.hidden = lijst.length === 0;
    vak.dataset.n = String(lijst.length);
    const sig = JSON.stringify(lijst);
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML = lijst
      .map(
        (tegel) => `
        <div class="tegel" role="button" tabindex="0" data-id="${escapeHtml(tegel.id)}" title="${escapeHtml(`${tegel.label}: ${tegel.waarde}`)}" aria-label="${escapeHtml(`${tegel.label}: ${tegel.waarde}`)}">
          <span class="w">${escapeHtml(tegel.waarde)}</span>
          <span class="l">${escapeHtml(tegel.label)}</span>
        </div>`
      )
      .join("");
  }

  /**
   * De productfoto bij merk en type (productfoto.js), of geen. Een foto die
   * niet laadt geeft de chip terug, en die draagt de toestand.
   *
   * @returns {boolean} staat er een foto?
   */
  paintFoto_(statusId) {
    const bron = productAfbeelding(this.config, this.apparaat_(statusId), PROGRAMMA_APPARATEN);
    const img = this.$(".foto");
    if (img.dataset.bron !== bron) {
      img.dataset.bron = bron;
      img.dataset.kapot = "";
      if (bron) {
        img.onerror = () => {
          img.dataset.kapot = "1";
          if (this.hass_ && this.wired_) this.paint();
        };
        img.src = bron;
      } else {
        img.removeAttribute("src");
      }
    }
    const toon = Boolean(bron) && img.dataset.kapot !== "1";
    img.hidden = !toon;
    return toon;
  }

  moreInfo_(entityId) {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      })
    );
  }

  druk_(entityId) {
    const oproep = drukOproep(entityId);
    if (oproep) this.hass.callService(oproep[0], oproep[1], oproep[2]);
  }

  paint() {
    const c = this.velden_();
    const r = this.rollen_(c.status);
    const st = (id) => stateOf(this.hass, id);
    const startSt = st(this.startSensor_());
    const coach = this.coach_() ? coachStand(startSt) : null;
    const status = st(c.status) ?? (c.status ? null : statusUitCoach(coach));
    const deur = st(c.door);
    const rest = restMinuten(st(c.remaining));
    // Zonder voortgangssensor, maar met verstreken en resterende tijd (Miele):
    // samen zijn ze de duur van het programma.
    const pct =
      voortgangPct(st(c.progress)) ??
      (r.verstreken && !c.progress ? voortgangUitTijden(restMinuten(st(r.verstreken)), restMinuten(st(r.rest))) : null);
    const start = startMoment(startSt) ?? startUitDuur(st(r.startIn));
    const soortNaam = apparaatSoort(this.apparaat_(c.status));
    const soort = SOORTEN[soortNaam];
    const alleenLezen = ALLEEN_LEZEN.has(soortNaam);

    const deurWoord = t(soort.deur);
    const nu = toestand({ status, deur, rest, pct, start, deurWoord });
    // Een wasmachine of droger die uit staat: de laatste beurt (zie de kop).
    const beurt =
      alleenLezen && status?.entity_id && statusDuiding(status).soort === SOORT.UIT ? this.beurt_(status, r) : null;
    if (beurt) nu.tekst = `${nu.tekst} · ${t("laatste beurt {wanneer}", { wanneer: beurtWanneer(beurt) })}`;
    // Met een beurt erop ook om middernacht: dan wordt "vandaag" "gisteren".
    this.planTik_(start ?? (beurt ? new Date(Date.now() + 86_400_000 * 2) : null));
    const loopt = draait(status);

    this.toggleAttribute("draait", loopt);
    this.toggleAttribute("coach", Boolean(c.coach));
    this.toggleAttribute("onbekend", loopt && pct == null);

    const top = this.$(".top");
    const tone = TOON[nu.tone] ?? TONES.accent;
    this.$(".card").style.setProperty("--tone", tone);
    top.classList.toggle("unavailable", nu.soort === "onbekend");

    // Het icoon van de soort, tenzij er een gekozen is: een wasmachine krijgt
    // geen vaatwasser.
    const chip = this.$(".chip");
    const wens = c.icon || soort.icoon;
    if (chip.dataset.icon !== wens) {
      chip.dataset.icon = wens;
      chip.innerHTML = resolve(wens, "dishwasher");
    }
    chip.style.setProperty("--tone", tone);

    // De productfoto. Met een foto draagt een icoontje in de statusregel de
    // toestand, zoals op de robotstofzuiger.
    const metFoto = this.paintFoto_(c.status);
    chip.hidden = metFoto;
    const stip = this.$(".stip");
    stip.hidden = !metFoto || nu.tone === "neutral";
    if (!stip.hidden && stip.dataset.icon !== wens) {
      stip.dataset.icon = wens;
      stip.innerHTML = resolve(wens, "dishwasher");
    }

    // Met de coach de naam die de klant daar gaf: een statussensor heet bij
    // Home Connect "Vaatwasser Operation state".
    const apparaat = this.hass?.devices?.[this.coach_()?.keuze.id ?? ""];
    this.text(
      ".nm",
      c.name || apparaat?.name_by_user || apparaat?.name || nameOf(this.hass, c.status, null) || t(soort.naam)
    );
    const stEl = this.$(".st .sw");
    const tekst = escapeHtml(nu.tekst);
    const let_ = nu.waarschuwing ? ` &middot; <span class="let">${escapeHtml(nu.waarschuwing)}</span>` : "";
    if (stEl.dataset.tekst !== tekst + let_) {
      stEl.dataset.tekst = tekst + let_;
      stEl.innerHTML = tekst + let_;
    }
    top.setAttribute("aria-label", `${this.$(".nm").textContent}, ${nu.tekst}`);

    // De tegels: deur, programma, fase, klaar om, verbruik en TwinDos, in de
    // woorden van Home Assistant, altijd (programma-logica.js).
    const fmt = this.hass?.formatEntityState ? (s) => this.hass.formatEntityState(s) : null;
    this.paintTegels_(
      beurt
        ? beurtTegels({ rollen: { ...r, status: c.status }, beurt, st, fmt, deurWoord })
        : programmaTegels({ rollen: r, st, fmt, deurWoord })
    );
    this.toggleAttribute("beurt", Boolean(beurt));

    // De balk hoort bij een LOPEND programma en niet bij een sensor die zijn
    // laatste waarde vasthoudt: een balk op 38% naast het woord "Uit" leest als
    // "gepauzeerd op 38%". Draait hij zonder voortgangssensor, dan schuift er
    // een streepje in plaats van een lege goot.
    const balk = this.$(".balk");
    const toon = bezig(nu.soort) && (pct != null || loopt);
    balk.hidden = !toon;
    if (toon) {
      const vul = this.$(".vul");
      const breedte = pct != null ? `${pct}%` : "";
      if (breedte && vul.style.width !== breedte) vul.style.width = breedte;
      balk.setAttribute("role", "progressbar");
      if (pct != null) {
        balk.setAttribute("aria-valuenow", String(pct));
        balk.setAttribute("aria-valuemin", "0");
        balk.setAttribute("aria-valuemax", "100");
      } else {
        balk.removeAttribute("aria-valuenow");
      }
    }

    this.paintBediening_(c, startSt, coach, loopt, welkeKnoppen(soortNaam, startSt));
    meetRaster(this.$(".card"));
  }

  /**
   * @param {object} c de velden uit `velden_()`
   * @param {object|null} startSt de startsensor (van de coach)
   * @param {object|null} coach uit `coachStand()`, of null zonder coach
   * @param {boolean} loopt draait hij volgens de statussensor?
   * @param {{eigen: boolean, coach: boolean}} mag uit `welkeKnoppen`: bij een
   *   wasmachine of droger geen eigen knoppen, en die van de coach alleen als
   *   die hem mag sturen
   */
  paintBediening_(c, startSt, coach, loopt, mag = { eigen: true, coach: true }) {
    if (!mag.eigen) {
      for (const s of [".bediening", ".rij.programma", ".rij.knoppen"]) this.$(s).hidden = true;
      if (mag.coach) this.paintCoach_(startSt, coach, loopt, false);
      else for (const s of [".rij.coach", ".coachhint"]) this.$(s).hidden = true;
      return;
    }
    const metCoach = Boolean(this.config.coach);

    // De programmakeuze wordt pas gebouwd als de opties bekend zijn.
    const slot = this.$(".programslot");
    const st = stateOf(this.hass, c.program);
    const opties = c.program ? keuzes(st) : [];

    // De WAARDE blijft de sleutel van de entiteit -- daar wordt straks mee
    // geschakeld -- en alleen het label wordt Nederlands. Zie
    // programmanaam.js voor waar die naam vandaan komt.
    const namen = opties.map((o) => keuzeNaam(o, this.hass?.formatEntityState?.(st, o)));

    // De vingerafdruk draagt de NAMEN mee en niet alleen de sleutels: de
    // vertaling van Home Assistant komt soms een tel later binnen dan de lijst,
    // en zonder dit blijft de kaart dan op de sleutels staan tot je hem
    // herlaadt.
    const vinger = JSON.stringify([opties, namen]);
    if (slot.dataset.opties !== vinger) {
      slot.dataset.opties = vinger;
      slot.innerHTML = opties.length
        ? `<select class="keuze" aria-label="${escapeHtml(t("Programma"))}">${opties
            .map((o, i) => `<option value="${escapeHtml(o)}">${escapeHtml(namen[i])}</option>`)
            .join("")}</select>`
        : "";
    }
    const lijst = slot.querySelector(".keuze");
    if (lijst && this.shadowRoot.activeElement !== lijst) {
      const gekozen = huidigeKeuze(st);
      if (lijst.value !== gekozen) lijst.value = gekozen;
    }

    // Met de coach is Ingeruimd de slimme sturing; de schakelaar ernaast zou
    // hetzelfde twee keer zeggen.
    const slim = this.$(".knop.slim");
    const metSlim = Boolean(c.smart) && !metCoach;
    slim.hidden = !metSlim;
    if (metSlim) slim.dataset.aan = String(isOn(stateOf(this.hass, c.smart)));

    // Een knop staat er alleen als hij te drukken is: Miele maakt start, pauze
    // en stop pas beschikbaar als die actie kan (programma-logica.js).
    const kan = (id) => Boolean(id) && knopKan(stateOf(this.hass, id));
    const kanStart = kan(c.start);
    const kanPauze = kan(c.pause);
    const kanStop = kan(c.stop);
    this.$(".knop.start").hidden = !kanStart;
    this.$(".knop.pauze").hidden = !kanPauze;
    this.$(".knop.stop").hidden = !kanStop;

    const handmatig = Boolean(lijst || kanStart || kanPauze || kanStop);
    // Zonder coach staat alles open, zoals altijd. Met de coach pas na
    // Handmatig: dat zijn de knoppen die langs de coach heen gaan.
    const open = !metCoach || this.handOpen_;
    this.$(".rij.programma").hidden = !lijst || !open;
    this.$(".rij.knoppen").hidden = (!metSlim && !kanStart && !kanPauze && !kanStop) || !open;
    // Het blok telt als één kind van de kaart (zie rasterhoogte.js): leeg hoort
    // het geen tussenruimte te kosten.
    this.$(".bediening").hidden = this.$(".rij.programma").hidden && this.$(".rij.knoppen").hidden;

    this.paintCoach_(startSt, coach, loopt, handmatig);
  }

  /** De rij van de coach: Ingeruimd, Nu starten, Handmatig -- of waarom niet. */
  paintCoach_(startSt, coach, loopt, handmatig) {
    const rij = this.$(".rij.coach");
    const hint = this.$(".coachhint");
    const info = this.coach_();
    if (!info) {
      rij.hidden = true;
      hint.hidden = true;
      return;
    }

    const melding = coachMelding(info.keuze, contractVan(startSt));
    const beschikbaar = (id) => knopKan(stateOf(this.hass, id));
    const knoppen = melding ? [] : coachKnoppen({ coach, rollen: info.rollen, loopt, beschikbaar });
    this.text(".coachhint", melding);
    hint.hidden = !melding;

    for (const klasse of ["vrijgave", "nu"]) {
      const el = this.$(`.knop.${klasse}`);
      const k = knoppen.find((x) => x.rol === klasse);
      el.hidden = !k;
      if (!k) continue;
      el.dataset.entity = k.entity;
      el.dataset.aan = String(k.aan);
      el.setAttribute("aria-label", k.aria);
      el.title = k.aria;
      const lb = el.querySelector(".lb");
      if (lb.textContent !== k.label) lb.textContent = k.label;
      const kort = el.querySelector(".kort");
      if (kort.textContent !== k.kort) kort.textContent = k.kort;
    }

    const hand = this.$(".knop.hand");
    hand.hidden = !handmatig;
    hand.setAttribute("aria-expanded", String(Boolean(this.handOpen_)));
    // In een smalle kolom valt het woord weg (zie de @container hierboven);
    // dan is dit de enige naam die de knop nog heeft.
    hand.setAttribute("aria-label", t("Handmatige besturing"));
    hand.title = t("Handmatige besturing");
    rij.hidden = !knoppen.length && !handmatig;
  }

  /* ------------------------------------------------- Lovelace-afspraken */

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    return {
      columns: 12,
      rows: "auto",
      min_columns: 6,
      min_rows: this.minRijen_(".card", 2),
    };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-dishwasher-card-editor");
  }

  static getStubConfig(hass, entities) {
    const zoek = (voorvoegsel, patroon) =>
      entities?.find((e) => e.startsWith(voorvoegsel) && patroon.test(e)) ?? "";
    return {
      status: zoek("sensor.", /vaatwas|dishwash/i),
      name: t("Vaatwasser"),
    };
  }
}

/** De velden van de editor, op naam: `editorVelden` kiest welke er staan. */
const VELD = {
  status: { name: "status", selector: sel.entity(["sensor", "binary_sensor"]) },
  remaining: { name: "remaining", selector: sel.entity(["sensor"]) },
  progress: { name: "progress", selector: sel.entity(["sensor", "number"]) },
  program: { name: "program", selector: sel.entity(["select", "input_select"]) },
  start: { name: "start", selector: sel.entity(["button", "input_button", "script", "switch", "automation"]) },
  pause: { name: "pause", selector: sel.entity(["button", "input_button", "script", "switch", "automation"]) },
  stop: { name: "stop", selector: sel.entity(["button", "input_button", "script", "switch", "automation"]) },
  door: { name: "door", selector: sel.entity(["binary_sensor"]) },
  smart: { name: "smart", selector: sel.entity(["input_boolean", "switch"]) },
};

class DishwasherEditor extends DacEditor {
  defaults() {
    return { merk: "auto" };
  }

  /** De fotokiezer alleen bij een ander merk: anders is het een veld dat niets doet. */
  pickers() {
    return [
      { key: "icon", kind: "icon", label: t("Icoon (zonder foto)"), fallback: this.soort_().icoon, auto: false },
      ...(this.config_?.merk === "eigen"
        ? [{ key: "image", kind: "foto", label: t("Eigen afbeelding"), fallback: this.soort_().icoon }]
        : []),
    ];
  }

  /** De statussensor, ook als de coach hem levert. */
  status_() {
    return this.config_?.status || this.coachEntiteiten_().status || "";
  }

  /** Het apparaat van de statussensor in Home Assistant, of null. */
  apparaat_() {
    const reg = this.hass_?.entities?.[this.status_()];
    return reg?.device_id ? this.hass_?.devices?.[reg.device_id] ?? null : null;
  }

  soort_() {
    return SOORTEN[apparaatSoort(this.apparaat_())];
  }

  /** Een wasmachine of droger: geen eigen knoppen, dus ook geen velden ervoor. */
  alleenLezen_() {
    return ALLEEN_LEZEN.has(apparaatSoort(this.apparaat_()));
  }

  /**
   * Een merk uit de lijst heeft altijd een type: dat van het apparaat als het
   * dat merk is, en anders het eerste. Een ander merk heeft geen type.
   */
  serialize(config) {
    return metType(config, this.apparaat_(), PROGRAMMA_APPARATEN);
  }

  /** Wat de coach van dit apparaat levert, zoals de kaart het ook zou vinden. */
  coachEntiteiten_() {
    const c = this.config_ ?? {};
    const hass = this.hass_;
    if (!c.coach || !hass) return {};
    const keuze = kiesApparaat(hass, c.coach_device || "", PROGRAMMA_MODELLEN, "Vaatwasser");
    const start = coachRollen(hass, keuze.id).start;
    return klantEntiteiten(stateOf(hass, start));
  }

  schema() {
    const c = this.config_ ?? {};
    const velden = editorVelden({
      coach: Boolean(c.coach),
      entiteiten: this.coachEntiteiten_(),
      apparaat: veldenVanApparaat(apparaatRollen(this.hass_, this.status_())),
      alleenLezen: this.alleenLezen_(),
    });
    // Merk en type komen al vertaald uit productfoto.js.
    const types = typeKeuzes(c.merk, PROGRAMMA_APPARATEN);
    return [
      { name: "name", selector: sel.text() },
      { name: "merk", selector: sel.select(merkKeuzes(PROGRAMMA_APPARATEN)) },
      ...(types.length ? [{ name: "model", selector: sel.select(types) }] : []),

      // Eén vinkje, en het blok eronder alleen als het aan staat: dezelfde vorm
      // als de presets op de camerakaart (zie Vormregels in CLAUDE.md). De
      // eigenaar op 11 oktober 2026: "Heeft een klant de coach: vinkje aan.
      // Zonder coach: vinkje uit, gewone vaatwasserkaart."
      { name: "coach", selector: sel.bool() },
      ...(c.coach
        ? [
            section(
              "DomotiApp Coach",
              "mdi:leaf",
              [
                {
                  name: "coach_device",
                  selector: {
                    device: {
                      filter: PROGRAMMA_MODELLEN.map((model) => ({ manufacturer: COACH_FABRIKANT, model })),
                    },
                  },
                },
              ],
              true
            ),
          ]
        : []),

      // Alleen wat de coach niet levert; de rest onder Afwijken. Gevraagd op
      // 11 oktober 2026, met alle oude velden nog ingevuld: "Alleen lijkt mij
      // dat deze sensoren invulvelden dan weg kunnen als ik het vinkje aan zet
      // van de coach toch?" Zie `editorVelden` in vaatwasser-logica.js.
      ...velden.zichtbaar.map((naam) => VELD[naam]),
      ...(c.coach && velden.afwijken.length ? [{ name: "afwijken", selector: sel.bool() }] : []),
      ...(c.coach && c.afwijken && velden.afwijken.length
        ? [section(t("Afwijken van de coach"), "mdi:pencil", velden.afwijken.map((naam) => VELD[naam]), true)]
        : []),
    ];
  }

  label(s) {
    return (
      {
        name: t("Naam"),
        merk: t("Merk"),
        model: t("Type"),
        pause: t("Pauze"),
        coach: t("In combinatie met DomotiApp Coach"),
        coach_device: t("Apparaat bij de coach"),
        afwijken: t("Afwijken van de coach"),
        status: t("Statussensor"),
        remaining: t("Resterende tijd"),
        progress: t("Voortgang (0-100%)"),
        program: t("Programmakeuze"),
        start: t("Start / pauze"),
        stop: t("Stop"),
        door: t("Klep- of deursensor"),
        smart: t("Slimme sturing"),
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    const uitleg = {
      coach: this.alleenLezen_()
        ? t("Leest bij de coach wanneer hij gaat starten. Mag de coach hem sturen (het vinkje bij de coach), dan staan zijn knoppen erbij: Mag draaien en Nu starten. De eigen knoppen van de machine staan op een wasmachine of droger niet op de kaart.")
        : t("Zet de knoppen van de coach op de kaart: Ingeruimd, Nu starten en Handmatig. Daarvoor is coach 0.110.0 of nieuwer nodig. Wat de coach al weet (status, programma, knoppen, klep) haalt de kaart daar vandaan; die velden staan hieronder dan niet meer."),
      coach_device: t("Leeg laten: de vaatwasser van de coach, als er precies één is."),
      afwijken:
        t("Kies zelf andere sensoren of knoppen dan de coach gebruikt. Wat je daar invult gaat voor; wat je leeg laat, komt van de coach."),
      merk: t("Automatisch toont de productfoto als het type bekend is, en anders het icoon."),
      model: t("Het type bepaalt de productfoto."),
      pause: t("Een knop die het programma pauzeert. Staat alleen op de kaart als hij te drukken is."),
      status:
        t("De sensor die Run, Ready, Finished of iets in die geest meldt. De kaart vertaalt dat zelf. Bij Miele zoekt de kaart de rest van het apparaat zelf: resterende tijd, programma en fase, TwinDos, verbruik en de geplande start, en bij een vaatwasser start, pauze en stop. Een wasmachine of droger heeft geen eigen knoppen, en toont als hij uit staat de laatste beurt."),
      remaining:
        t("Een tijdstip, een aantal minuten of een klok als 1:24:00 — alle drie worden gelezen. Een tijdstip is het moment waarop hij klaar is, geen duur."),
      progress:
        t("Zonder deze sensor is er geen stand, en schuift er een streepje heen en weer zolang hij draait."),
      program: t("Een keuzelijst met de programma's. Verschijnt als uitklaplijst op de kaart."),
      start: t("Een knop, een script of een schakelaar — de kaart kiest zelf de juiste service."),
      stop: t("Idem. Deze knop is rood, want hij onderbreekt iets dat loopt."),
      door: t("Staat de klep open, dan zegt de kaart dat in plaats van 'klaar om te starten'."),
      smart: t("De input_boolean van je eigen slimme sturing. De knop licht op als hij aanstaat."),
    };
    return uitleg[s.name];
  }
}

registerEditor("domotiapp-dishwasher-card-editor", DishwasherEditor);
registerCard("domotiapp-dishwasher-card", DishwasherCard, {
  name: nt("DomotiApp Vaatwasser, wasmachine en droger"),
  description: nt(
    "Een apparaat met een programma: status, resterende tijd met voortgangsbalk, programma en de knoppen, met een productfoto per merk en type. Bij Miele vindt hij de rest van het apparaat zelf."
  ),
});

export { DishwasherCard };
