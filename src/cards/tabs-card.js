/**
 * Tabbladen: één plek op het dashboard waar meerdere kaarten achter elkaar
 * wonen, met een rij knoppen erboven om te wisselen.
 *
 * De eigenaar gebruikte hiervoor `custom:simple-tabs` in zijn bubble-pop-ups.
 * Dit is dezelfde functie in de vormtaal van de familie, met de configvorm van
 * simple-tabs erin gehouden (`title` en `card` werken naast `name` en `cards`),
 * zodat een bestaande config over te zetten is zonder hem te herschrijven.
 *
 * DE EIS DIE DE VORM BEPAALT: DE KEUZE HOORT BIJ HET APPARAAT
 *
 * Wisselt hij op zijn telefoon van Woning naar Weer, dan mag de tablet in de
 * gang op Woning blijven staan. Dat sluit alles uit wat server-side is. De
 * keuze staat daarom in `localStorage`, onder een sleutel die uit de namen van
 * de tabs wordt afgeleid -- er is dus niets in te stellen, en dat was de tweede
 * eis. Het hele verhaal staat in `tabs-logica.js`.
 *
 * WAAROM DE KINDKAARTEN LUI GEBOUWD WORDEN
 *
 * Een tabbladenkaart met zes tabs is zes kaarten die je bijna nooit ziet. Ze
 * allemaal bouwen bij het openen van een pop-up kost tijd op een wandtablet, en
 * elke kaart abonneert zich op zijn eigen entiteiten. Een tab wordt daarom
 * gebouwd bij zijn eerste bezoek en daarna bewaard: wisselen blijft dan gratis,
 * en wat je nooit opent kost niets.
 *
 * WAAROM `set hass` HIER OVERSCHREVEN IS
 *
 * `DacCard` roept `paint()` alleen aan als een entiteit uit `watched()` is
 * veranderd. Deze kaart heeft zelf geen entiteiten -- maar zijn KINDEREN wel, en
 * die moeten elke nieuwe `hass` krijgen. Zonder deze overschrijving staat er een
 * tabbladenkaart met kaarten erin die nooit meer bijwerken, en dat is precies
 * het soort fout dat je pas ziet als er iets in huis verandert.
 */

import { DacCard, INCOMPLETE, escapeHtml, registerCard, toneValue } from "../base.js";
import "../editor/tabs-editor.js";
import { resolve } from "../icons.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { openTab, schrijfKeuze, sleutelVoor, tabsVan } from "./tabs-logica.js";

class TabsCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }

    .card {
      min-height: var(--dac-raster, 56px);
      padding: 8px;
      display: flex; flex-direction: column; gap: 10px;
    }
    :host([bare]) .card {
      background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0;
    }

    /* ------------------------------------------------------------ de rij */

    .balk {
      flex: 0 0 auto;
      display: flex; align-items: center; gap: 3px;
      padding: 3px;
      background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
      /* Meer tabs dan er passen schuiven in plaats van af te breken: een tweede
         regel knoppen verandert de hoogte van de kaart bij elke wissel. */
      overflow-x: auto; scrollbar-width: none;
    }
    .balk::-webkit-scrollbar { display: none; }
    :host([uitgelijnd="links"]) .balk { justify-content: flex-start; }
    :host([uitgelijnd="rechts"]) .balk { justify-content: flex-end; }

    .tab {
      flex: 1 1 0; min-width: 0;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 8px 12px;
      border: 0; border-radius: var(--dac-radius-pill);
      background: none; cursor: pointer;
      font: inherit; font-size: 13px; font-weight: 500; letter-spacing: -.01em;
      color: var(--dac-ink-2);
      white-space: nowrap;
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, color 180ms ease;
    }
    .tab:hover { color: var(--dac-ink); }
    /* De actieve tab draagt de kleur. Dat is hier geen statuskleur maar
       navigatie: je moet kunnen zien waar je bent. */
    .tab[aria-selected="true"] {
      background: color-mix(in srgb, var(--tone) 20%, transparent);
      color: var(--tone);
    }
    .tab .ic { display: flex; flex: 0 0 auto; }
    .tab .icon, .tab ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }
    .tab .nm { overflow: hidden; text-overflow: ellipsis; }
    :host([geen-namen]) .tab .nm { display: none; }

    /* --------------------------------------------------------- de inhoud */

    .vakken { flex: 1 1 auto; min-height: 0; display: block; }
    .vak { display: none; }
    .vak[data-open="true"] { display: block; }

    /* De kaarten in een tab staan onder elkaar met dezelfde tussenruimte als
       Home Assistant zelf aanhoudt. */
    .vak > * + * { margin-top: 8px; }

    .leeg {
      padding: 14px 4px; text-align: center;
      font-size: 12.5px; color: var(--dac-ink-3);
    }

    :focus-visible { outline: 2px solid var(--tone); outline-offset: 2px; }
  `;

  constructor() {
    super();
    /** De gebouwde kaart per tab-index. Lui gevuld, daarna bewaard. */
    this.kinderen_ = new Map();
    this.open_ = 0;
  }

  validate(config) {
    const tabs = tabsVan(config);
    const c = { tone: "accent", ...config, tabs };
    if (!tabs.length) {
      c[INCOMPLETE] = "Voeg tabbladen toe: elk met een naam, een icoon en een kaart erin.";
    }
    return c;
  }

  /** Geen eigen entiteiten. De kinderen hebben ze, en die krijgen `hass` hieronder. */
  watched() {
    return [];
  }

  /**
   * Elke nieuwe `hass` moet naar de kinderen, ook als deze kaart zelf niets
   * hoeft te hertekenen. Zie de kop.
   */
  set hass(hass) {
    super.hass = hass;
    // De `null` is de bouw-vlag uit bouw_(): een tab die nog aan het laden is.
    // Zonder deze toets zet de eerste hass een eigenschap op null en valt de hele
    // view om -- gemeten in de echte instance, de kaart bleef leeg.
    for (const el of this.kinderen_.values()) if (el) el.hass = hass;
  }

  get hass() {
    return super.hass;
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    if (c.show_names === false) this.setAttribute("geen-namen", "");
    if (c.alignment === "links" || c.alignment === "rechts") {
      this.setAttribute("uitgelijnd", c.alignment);
    }

    const knoppen = c.tabs
      .map(
        (tab, i) => `
        <button type="button" class="tab" role="tab" data-i="${i}" aria-selected="false"
                title="${escapeHtml(tab.name)}">
          ${tab.icon ? `<span class="ic">${resolve(tab.icon, "grid")}</span>` : ""}
          <span class="nm">${escapeHtml(tab.name || `Tab ${i + 1}`)}</span>
        </button>`
      )
      .join("");

    const vakken = c.tabs
      .map((_, i) => `<div class="vak" data-i="${i}" role="tabpanel"></div>`)
      .join("");

    return `
      <div class="card surface" style="--tone:${toneValue(c.tone)}">
        <div class="balk" role="tablist">${knoppen}</div>
        <div class="vakken">${vakken}</div>
      </div>`;
  }

  wire() {
    for (const knop of this.$$(".tab")) {
      this.on(knop, "click", () => this.kies_(Number(knop.dataset.i)));
    }
    // De hoogte van deze kaart hangt aan de kaarten erin, en die komen later
    // binnen. Zonder waarnemer blijft de kaart op de hoogte van zijn eerste tab
    // staan, ook als de tweede twee keer zo hoog is.
    this.teardown_.push(volgRaster(this.$(".card")));

    // De onthouden keuze van DIT apparaat, of de standaard.
    this.kies_(openTab(this.config, this.config.tabs, this.opslag_()), false);
  }

  paint() {
    // Niets te schilderen: deze kaart leest geen entiteiten. De kinderen doen
    // dat zelf, en die krijgen hun `hass` via de setter hierboven.
  }

  /** `localStorage`, of niets als de browser hem dichthoudt. */
  opslag_() {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  kies_(index, onthouden = true) {
    const tabs = this.config.tabs;
    if (!tabs.length) return;
    const i = Math.min(Math.max(0, index), tabs.length - 1);
    this.open_ = i;

    for (const knop of this.$$(".tab")) {
      knop.setAttribute("aria-selected", String(Number(knop.dataset.i) === i));
    }
    for (const vak of this.$$(".vak")) {
      vak.dataset.open = String(Number(vak.dataset.i) === i);
    }

    if (onthouden) schrijfKeuze(this.opslag_(), sleutelVoor(tabs), i);
    this.bouw_(i);
  }

  /**
   * Bouw de kaart van deze tab, als dat nog niet gebeurd is.
   *
   * `loadCardHelpers` is de weg die Home Assistant zelf aanbiedt om een kaart
   * uit een config te maken. Hij is asynchroon, dus tussen de klik en de kaart
   * zit een tel -- vandaar dat het vak al zichtbaar is voordat de inhoud er
   * staat, in plaats van andersom.
   */
  async bouw_(i) {
    if (this.kinderen_.has(i)) {
      meetRaster(this.$(".card"));
      return;
    }
    const vak = this.$(`.vak[data-i="${i}"]`);
    const tab = this.config.tabs[i];
    if (!vak || !tab) return;

    if (!tab.card) {
      vak.innerHTML = `<div class="leeg">Deze tab heeft nog geen kaart.</div>`;
      meetRaster(this.$(".card"));
      return;
    }

    // Twee keer tegelijk bouwen kan: twee kliks vlak achter elkaar. De vlag
    // staat er vóór het wachten, zodat de tweede aanroep afhaakt.
    this.kinderen_.set(i, null);
    try {
      const helpers = await window.loadCardHelpers?.();
      if (!helpers) throw new Error("loadCardHelpers ontbreekt");
      const el = helpers.createCardElement(tab.card);
      el.hass = this.hass;
      this.kinderen_.set(i, el);
      vak.replaceChildren(el);
      // De kaart is er, maar zijn opmaak nog niet -- meetRaster heeft daar zijn
      // eigen herkansing voor.
      meetRaster(this.$(".card"));
    } catch (e) {
      this.kinderen_.delete(i);
      vak.innerHTML = `<div class="leeg">Deze kaart kon niet geladen worden: ${escapeHtml(
        e?.message ?? e
      )}</div>`;
      meetRaster(this.$(".card"));
    }
  }

  /* ------------------------------------------------- Lovelace-afspraken */

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    // Zoals elke kaart die kan groeien: "auto" plus een GEMETEN ondergrens, want
    // een getal uit het formaatgreepje zou de kaart over zijn buurman laten
    // schilderen. Zie gemetenRijen in rasterhoogte.js.
    return {
      columns: 12,
      rows: "auto",
      min_columns: 6,
      min_rows: this.minRijen_(".card", 2),
    };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-tabs-card-editor");
  }

  static getStubConfig() {
    return {
      tabs: [
        { name: "Woning", icon: "house", card: null },
        { name: "Weer", icon: "cloudSun", card: null },
      ],
    };
  }
}

registerCard("domotiapp-tabs-card", TabsCard, {
  name: "DomotiApp Tabbladen",
  description:
    "Meerdere kaarten achter tabbladen, met een rij knoppen erboven. De gekozen tab wordt per apparaat onthouden.",
});

export { TabsCard };
