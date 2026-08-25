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
 */

import { DacCard, INCOMPLETE, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { isOn, nameOf, stateOf } from "../ha.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { huidigeKeuze, keuzes, kiesOproep } from "./keuzeveld.js";
import {
  bezig,
  draait,
  drukOproep,
  restMinuten,
  toestand,
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
    :host([bare]) .card {
      background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0;
    }

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

    /* ------------------------------------------------------- de bediening */

    .rij { flex: 0 0 auto; display: flex; align-items: center; gap: 8px; }
    .rij[hidden] { display: none; }

    /* De programmakeuze. Ondoorzichtige achtergrond, net als op de
       entiteitenkaart: de browser tekent het uitklappaneel met de kleur van de
       select zelf, en dat paneel valt buiten onze shadow root (de fout van
       fase 12). Bewaakt door scripts/check-controls.mjs. */
    .keuze {
      flex: 1 1 auto; min-width: 0;
      font: inherit; font-size: 13px; line-height: 1.2;
      color: var(--dac-ink); color-scheme: dark;
      background-color: var(--dac-bg-raise);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      padding: 7px 10px; cursor: pointer;
      text-overflow: ellipsis;
    }
    .keuze:hover { border-color: var(--dac-border-hi); }
    .keuze:focus-visible { outline: 2px solid var(--tone); outline-offset: 1px; }
    .keuze option { background-color: var(--dac-bg-raise); color: var(--dac-ink); }
    .keuze option:checked { background-color: var(--dac-accent); color: var(--dac-ink); }

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
    .knop:hover { color: var(--dac-ink); border-color: var(--dac-border-hi); }
    .knop:active { transform: scale(.97); }
    .knop[hidden] { display: none; }

    /* Start draagt het accent en geen groen -- zie de kop van dit bestand. */
    .knop.start {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }
    .knop.start:hover { background: color-mix(in srgb, var(--dac-accent-hi) 24%, transparent); }

    .knop.stop {
      color: var(--dac-bad);
      border-color: color-mix(in srgb, var(--dac-bad) 40%, transparent);
    }
    .knop.stop:hover { background: color-mix(in srgb, var(--dac-bad) 14%, transparent); }

    /* De slimme knop is een schakelaar en laat dat ook zien. */
    .knop.slim[data-aan="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }

    .top.unavailable { opacity: .42; }

    /* Smal: dan vervallen de woorden op de knoppen en blijven de iconen. Drie
       knoppen met tekst passen niet in een halve kolom. */
    @container (max-width: 320px) {
      .knop .lb { display: none; }
      .knop { flex: 0 0 auto; padding: 9px 14px; }
      .keuze { flex: 1 1 auto; }
    }

    :focus-visible { outline: 2px solid var(--tone); outline-offset: 2px; }
  `;

  validate(config) {
    const c = { name: "", icon: "dishwasher", ...config };
    if (!c.status && !c.remaining && !c.progress && !c.program) {
      c[INCOMPLETE] =
        "Kies minstens een statussensor. Resterende tijd, voortgang, programma en de knoppen mogen daarna.";
    }
    return c;
  }

  watched() {
    return [
      this.config.status,
      this.config.remaining,
      this.config.progress,
      this.config.program,
      this.config.door,
      this.config.smart,
      this.config.start,
      this.config.stop,
    ].filter(Boolean);
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    // Zonder dit kijkt de @container-query naar een container van Home Assistant.
    this.style.containerType = "inline-size";

    const knop = (klasse, icoon, label) => `
      <button type="button" class="knop ${klasse}" hidden>
        ${resolve(icoon)}<span class="lb">${escapeHtml(label)}</span>
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

        <div class="rij" hidden>
          <span class="programslot" style="display:contents"></span>
          ${knop("slim", "bolt", "Slim")}
          ${knop("start", "play", "Start")}
          ${knop("stop", "stop", "Stop")}
        </div>
      </div>`;
  }

  wire() {
    const c = this.config;

    // Tikken op de kop opent de entiteit die het meest te zeggen heeft.
    this.on(this.$(".top"), "click", () => {
      const id = c.status || c.remaining || c.program;
      if (id) this.moreInfo_(id);
    });

    this.on(this.$(".knop.start"), "click", () => this.druk_(c.start));
    this.on(this.$(".knop.stop"), "click", () => this.druk_(c.stop));
    this.on(this.$(".knop.slim"), "click", () => {
      if (!c.smart) return;
      const aan = isOn(stateOf(this.hass, c.smart));
      this.hass.callService("homeassistant", aan ? "turn_off" : "turn_on", {
        entity_id: c.smart,
      });
    });

    // De keuzelijst wordt in `paint()` gebouwd -- de opties staan in de
    // attributen. Daarom hangt het gedrag aan de RIJ en niet aan de lijst.
    this.on(this.$(".rij"), "change", (e) => {
      const lijst = e.target?.closest?.(".keuze");
      if (!lijst || !c.program) return;
      e.stopPropagation();
      const oproep = kiesOproep(c.program, lijst.value, keuzes(stateOf(this.hass, c.program)));
      if (oproep) this.hass.callService(oproep[0], oproep[1], oproep[2]);
    });

    this.teardown_.push(volgRaster(this.$(".card")));
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
    const c = this.config;
    const status = stateOf(this.hass, c.status);
    const deur = stateOf(this.hass, c.door);
    const rest = restMinuten(stateOf(this.hass, c.remaining));
    const pct = voortgangPct(stateOf(this.hass, c.progress));

    const nu = toestand({ status, deur, rest, pct });
    const loopt = draait(status);

    this.toggleAttribute("draait", loopt);
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

    this.text(".nm", c.name || nameOf(this.hass, c.status, null) || "Vaatwasser");
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

    this.paintBediening_();
    meetRaster(this.$(".card"));
  }

  paintBediening_() {
    const c = this.config;

    // De programmakeuze wordt pas gebouwd als de opties bekend zijn.
    const slot = this.$(".programslot");
    const st = stateOf(this.hass, c.program);
    const opties = c.program ? keuzes(st) : [];
    const vinger = JSON.stringify(opties);
    if (slot.dataset.opties !== vinger) {
      slot.dataset.opties = vinger;
      slot.innerHTML = opties.length
        ? `<select class="keuze" aria-label="Programma">${opties
            .map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`)
            .join("")}</select>`
        : "";
    }
    const lijst = slot.querySelector(".keuze");
    if (lijst && this.shadowRoot.activeElement !== lijst) {
      const gekozen = huidigeKeuze(st);
      if (lijst.value !== gekozen) lijst.value = gekozen;
    }

    const slim = this.$(".knop.slim");
    slim.hidden = !c.smart;
    if (c.smart) slim.dataset.aan = String(isOn(stateOf(this.hass, c.smart)));

    this.$(".knop.start").hidden = !c.start;
    this.$(".knop.stop").hidden = !c.stop;

    this.$(".rij").hidden = !lijst && !c.smart && !c.start && !c.stop;
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

class DishwasherEditor extends DacEditor {
  defaults() {
    return { icon: "dishwasher" };
  }

  pickers() {
    return [{ key: "icon", kind: "icon", label: "Icoon", fallback: "dishwasher", auto: false }];
  }

  schema() {
    return [
      { name: "name", selector: sel.text() },
      { name: "status", selector: sel.entity(["sensor", "binary_sensor"]) },
      { name: "remaining", selector: sel.entity(["sensor"]) },
      { name: "progress", selector: sel.entity(["sensor", "number"]) },
      { name: "program", selector: sel.entity(["select", "input_select"]) },
      { name: "start", selector: sel.entity(["button", "input_button", "script", "switch", "automation"]) },
      { name: "stop", selector: sel.entity(["button", "input_button", "script", "switch", "automation"]) },
      { name: "door", selector: sel.entity(["binary_sensor"]) },
      { name: "smart", selector: sel.entity(["input_boolean", "switch"]) },
    ];
  }

  label(s) {
    return (
      {
        name: "Naam",
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
