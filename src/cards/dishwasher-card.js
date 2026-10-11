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
  startMoment,
  statusUitCoach,
  toestand,
  vindStartSensor,
  voortgangPct,
} from "./vaatwasser-logica.js";

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
    .chip .icon { width: 20px; height: 20px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st .let { color: var(--dac-warn); font-weight: 600; }

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
    const c = { name: "", icon: "dishwasher", ...config };
    // Met de coach is er altijd iets te tonen: zijn stand, en anders de zin
    // waarom niet.
    if (!c.coach && !c.status && !c.remaining && !c.progress && !c.program) {
      c[INCOMPLETE] =
        "Kies minstens een statussensor. Resterende tijd, voortgang, programma en de knoppen mogen daarna.";
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
    return [
      c.status,
      c.remaining,
      this.startSensor_(),
      c.progress,
      c.program,
      c.door,
      c.smart,
      c.start,
      c.stop,
    ].filter(Boolean);
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

  /** De config zoals de kaart hem gebruikt: met de coach erbij, de lege velden ingevuld. */
  velden_() {
    const coach = this.coach_();
    if (!coach?.rollen.start) return this.config;
    return metCoachVelden(this.config, klantEntiteiten(stateOf(this.hass, coach.rollen.start)));
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
          <span class="chip"></span>
          <span class="txt">
            <span class="nm"></span>
            <span class="st"></span>
          </span>
        </div>

        <div class="balk" hidden><span class="vul"></span></div>

        <div class="rij coach" hidden>
          ${knop("vrijgave", "check", "Ingeruimd")}
          ${knop("nu", "play", "Nu starten")}
          ${knop("hand", "handmatig", "Handmatig")}
        </div>
        <p class="coachhint" hidden></p>

        <div class="bediening" hidden>
          <div class="rij programma" hidden>
            <span class="programslot" style="display:contents"></span>
          </div>

          <div class="rij knoppen" hidden>
            ${knop("slim", "bolt", "Slim")}
            ${knop("start", "play", "Start")}
            ${knop("stop", "stop", "Stop")}
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

    this.on(this.$(".knop.start"), "click", () => this.druk_(this.velden_().start));
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
    });
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
    const startSt = stateOf(this.hass, this.startSensor_());
    const coach = this.coach_() ? coachStand(startSt) : null;
    const status = stateOf(this.hass, c.status) ?? (c.status ? null : statusUitCoach(coach));
    const deur = stateOf(this.hass, c.door);
    const rest = restMinuten(stateOf(this.hass, c.remaining));
    const pct = voortgangPct(stateOf(this.hass, c.progress));
    const start = startMoment(startSt);

    const nu = toestand({ status, deur, rest, pct, start });
    this.planTik_(start);
    const loopt = draait(status);

    this.toggleAttribute("draait", loopt);
    this.toggleAttribute("coach", Boolean(c.coach));
    this.toggleAttribute("onbekend", loopt && pct == null);

    const top = this.$(".top");
    const tone = TOON[nu.tone] ?? TONES.accent;
    this.$(".card").style.setProperty("--tone", tone);
    top.classList.toggle("unavailable", nu.soort === "onbekend");

    const chip = this.$(".chip");
    const wens = c.icon || "dishwasher";
    if (chip.dataset.icon !== wens) {
      chip.dataset.icon = wens;
      chip.innerHTML = resolve(wens, "dishwasher");
    }
    chip.style.setProperty("--tone", tone);

    // Met de coach de naam die de klant daar gaf: een statussensor heet bij
    // Home Connect "Vaatwasser Operation state".
    const apparaat = this.hass?.devices?.[this.coach_()?.keuze.id ?? ""];
    this.text(
      ".nm",
      c.name || apparaat?.name_by_user || apparaat?.name || nameOf(this.hass, c.status, null) || "Vaatwasser"
    );
    const stEl = this.$(".st");
    const tekst = escapeHtml(nu.tekst);
    const let_ = nu.waarschuwing ? ` &middot; <span class="let">${escapeHtml(nu.waarschuwing)}</span>` : "";
    if (stEl.dataset.tekst !== tekst + let_) {
      stEl.dataset.tekst = tekst + let_;
      stEl.innerHTML = tekst + let_;
    }
    top.setAttribute("aria-label", `${this.$(".nm").textContent}, ${nu.tekst}`);

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

    this.paintBediening_(c, startSt, coach, loopt);
    meetRaster(this.$(".card"));
  }

  /**
   * @param {object} c de velden uit `velden_()`
   * @param {object|null} startSt de startsensor (van de coach)
   * @param {object|null} coach uit `coachStand()`, of null zonder coach
   * @param {boolean} loopt draait hij volgens de statussensor?
   */
  paintBediening_(c, startSt, coach, loopt) {
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
        ? `<select class="keuze" aria-label="Programma">${opties
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

    this.$(".knop.start").hidden = !c.start;
    this.$(".knop.stop").hidden = !c.stop;

    const handmatig = Boolean(lijst || c.start || c.stop);
    // Zonder coach staat alles open, zoals altijd. Met de coach pas na
    // Handmatig: dat zijn de knoppen die langs de coach heen gaan.
    const open = !metCoach || this.handOpen_;
    this.$(".rij.programma").hidden = !lijst || !open;
    this.$(".rij.knoppen").hidden = (!metSlim && !c.start && !c.stop) || !open;
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
    const knoppen = melding ? [] : coachKnoppen({ coach, rollen: info.rollen, loopt });
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
    hand.setAttribute("aria-label", "Handmatige besturing");
    hand.title = "Handmatige besturing";
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
      name: "Vaatwasser",
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
  stop: { name: "stop", selector: sel.entity(["button", "input_button", "script", "switch", "automation"]) },
  door: { name: "door", selector: sel.entity(["binary_sensor"]) },
  smart: { name: "smart", selector: sel.entity(["input_boolean", "switch"]) },
};

class DishwasherEditor extends DacEditor {
  defaults() {
    return { icon: "dishwasher" };
  }

  pickers() {
    return [{ key: "icon", kind: "icon", label: "Icoon", fallback: "dishwasher", auto: false }];
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
    const velden = editorVelden({ coach: Boolean(c.coach), entiteiten: this.coachEntiteiten_() });
    return [
      { name: "name", selector: sel.text() },

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
        ? [section("Afwijken van de coach", "mdi:pencil", velden.afwijken.map((naam) => VELD[naam]), true)]
        : []),
    ];
  }

  label(s) {
    return (
      {
        name: "Naam",
        coach: "In combinatie met DomotiApp Coach",
        coach_device: "Apparaat bij de coach",
        afwijken: "Afwijken van de coach",
        status: "Statussensor",
        remaining: "Resterende tijd",
        progress: "Voortgang (0-100%)",
        program: "Programmakeuze",
        start: "Start / pauze",
        stop: "Stop",
        door: "Klep- of deursensor",
        smart: "Slimme sturing",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    const uitleg = {
      coach:
        "Zet de knoppen van de coach op de kaart: Ingeruimd, Nu starten en Handmatig. Daarvoor is coach 0.110.0 of nieuwer nodig. Wat de coach al weet (status, programma, knoppen, klep) haalt de kaart daar vandaan; die velden staan hieronder dan niet meer.",
      coach_device: "Leeg laten: de vaatwasser van de coach, als er precies één is.",
      afwijken:
        "Kies zelf andere sensoren of knoppen dan de coach gebruikt. Wat je daar invult gaat voor; wat je leeg laat, komt van de coach.",
      status: "De sensor die Run, Ready, Finished of iets in die geest meldt. De kaart vertaalt dat zelf.",
      remaining:
        "Een tijdstip, een aantal minuten of een klok als 1:24:00 — alle drie worden gelezen. Een tijdstip is het moment waarop hij klaar is, geen duur.",
      progress:
        "Zonder deze sensor is er geen stand, en schuift er een streepje heen en weer zolang hij draait.",
      program: "Een keuzelijst met de programma's. Verschijnt als uitklaplijst op de kaart.",
      start: "Een knop, een script of een schakelaar — de kaart kiest zelf de juiste service.",
      stop: "Idem. Deze knop is rood, want hij onderbreekt iets dat loopt.",
      door: "Staat de klep open, dan zegt de kaart dat in plaats van 'klaar om te starten'.",
      smart: "De input_boolean van je eigen slimme sturing. De knop licht op als hij aanstaat.",
    };
    return uitleg[s.name];
  }
}

registerEditor("domotiapp-dishwasher-card-editor", DishwasherEditor);
registerCard("domotiapp-dishwasher-card", DishwasherCard, {
  name: "DomotiApp Vaatwasser",
  description:
    "Status, resterende tijd met voortgangsbalk, programmakeuze en de knoppen — met een balk die loopt zolang hij draait.",
});

export { DishwasherCard };
