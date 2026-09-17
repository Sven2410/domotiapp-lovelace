/**
 * De terugknop, nu ook als KAART.
 *
 * ## Waarom deze er alsnog komt
 *
 * In 0.44.0 is de terugknop als **badge** gebouwd (`domotiapp-terug-badge`).
 * Dat was een verkeerde lezing van de vraag. De eigenaar schreef op
 * 17 september 2026: *"Ook wil ik net als de mushroom chips card een terug
 * button die elke keer een stap navigeert naar het home path wat ik kan opgeven
 * in de GUI."* -- en `mushroom-chips-card` is een KAART. Hij zocht hem daarna
 * twee keer in de kaartkiezer en vond hem niet: *"Ik zie geen domotiapp terug
 * kaart kan dat kloppen?"*
 *
 * Dat klopte, en het is meer dan een vindbaarheidskwestie. Een badge staat in
 * de KOP van een view en nergens anders. De eigenaar bouwt zijn dashboard met
 * pop-ups (bubble-card), en een pop-up heeft geen kop -- daar is een badge dus
 * niet te plaatsen. Precies de plek waar een terugknop het hardst nodig is, was
 * de enige plek waar hij niet kon staan.
 *
 * De badge blijft gewoon bestaan: in de kop van een view is een badge de juiste
 * vorm, en wie hem daar al heeft staan hoeft niets te veranderen. Ze delen hun
 * gedrag via `terugDoel()` in `badges/badge-logica.js`, zodat de twee niet uit
 * elkaar kunnen lopen.
 *
 * ## Waarom de kaart geen vlak heeft
 *
 * De knop is de pil, niet de kaart. Dat is hoe een chip eruitziet, en het is de
 * reden dat een rij chips leest als een rij knoppen en niet als een rij
 * kaarten. Deze kaart is daarom een doorzichtige houder met een uitlijning --
 * net als de sectiekop, die ook nooit een vlak heeft gehad.
 *
 * "Achtergrond weglaten" haalt hier dus de pil weg en niet het kaartvlak (dat
 * er niet is): geen vulling, geen rand, geen binnenmarge. Dat is dezelfde
 * uitzondering als op de badge, en om dezelfde reden -- zie de kop van
 * `badges/template-badge.js`.
 *
 * ## Leeg pad is niet hetzelfde als geen knop
 *
 * Zonder pad gaat hij ÉÉN STAP terug in de geschiedenis, net als de back-chip
 * van Mushroom. Met een pad gaat hij daarheen, ook als je via vijf pop-ups bent
 * gekomen -- dat is wat "het home path" betekent. De navigatie loopt via
 * `runAction` en niet via een eigen `pushState`, zodat een pad dat met `#`
 * begint hier hetzelfde doet als overal elders in het pakket: een pop-up openen
 * in plaats van de pagina herladen.
 */

import { DacCard, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { bindActions, runAction } from "../ha.js";
import { terugDoel } from "../badges/badge-logica.js";
import { terugTitel, uitlijning, uitlijningen } from "./terug-logica.js";

const CARD_TYPE = "domotiapp-terug-card";
const EDITOR_TYPE = "domotiapp-terug-card-editor";

class DomotiappTerugCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }

    /* De houder vult de rasterrij en zet de knop op zijn plek. Hij is
       doorzichtig: het vlak dat je ziet is de pil, niet de kaart. */
    .houder {
      display: flex; align-items: center; height: 100%; min-height: 36px;
      justify-content: var(--uit, flex-start);
    }

    /* Dezelfde maten als de badge en als die van Home Assistant zelf: 36px
       hoog, 18px rond, 0 12px binnenmarge, 8px ertussen. Een terugknop in een
       pop-up staat naast een chip van hem, en dan is twee pixels verschil een
       knop die uit de rij loopt. */
    .chip {
      display: inline-flex; align-items: center; gap: 8px;
      max-width: 100%;
      height: 36px; padding: 0 12px;
      border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      box-shadow: var(--dac-shadow);
      cursor: pointer; font: inherit; color: inherit;
      /* LINKS, en dat moet er expliciet staan: dit is een <button>, en de
         useragent-stijl van Chrome geeft die text-align: center. Op de badge is
         dat op 17 september 2026 met een schermafdruk gemeld. */
      text-align: left;
      transition: background 200ms ease, border-color 200ms ease, transform 160ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) {
      .chip:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); }
      .chip:hover .ico { color: var(--dac-accent-hi); }
    }
    .chip:active { transform: scale(.97); }

    /* Achtergrond weglaten haalt ook de rand en de binnenmarge weg. Een pil
       zonder vulling met wel een rand is geen van beide, en met binnenmarge
       zonder vlak begint de tekst 12px naast de kaarten erboven. */
    :host([bare]) .chip {
      background: none; border-color: transparent; box-shadow: none;
      padding: 0; height: auto; min-height: 30px;
    }
    @media (hover: hover) {
      :host([bare]) .chip:hover { background: none; border-color: transparent; }
    }

    .ico { flex: 0 0 auto; display: flex; color: var(--dac-ink-2); transition: color 200ms ease; }
    .ico .icon, .ico ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }

    .tekst {
      min-width: 0; font-size: 13px; font-weight: 600; letter-spacing: -.01em;
      color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .tekst:empty { display: none; }

    .chip:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  validate(config) {
    return { icon: "arrowLeft", align: "links", ...config };
  }

  /** Niets om op te letten: deze knop leest geen enkele entiteit. */
  watched() {
    return [];
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    return `
      <div class="houder" style="--uit:${uitlijning(c.align)}">
        <button class="chip" type="button">
          <span class="ico"></span>
          <span class="tekst"></span>
        </button>
      </div>`;
  }

  wire() {
    this.teardown_.push(
      bindActions(this.$(".chip"), { onTap: () => this.terug_() }),
    );
  }

  /** Terug: naar het opgegeven pad, of één stap in de geschiedenis. */
  terug_() {
    const doel = terugDoel(this.config);
    if (doel.soort === "geschiedenis") {
      history.back();
      return;
    }
    runAction(this, this.hass, this.config, {
      action: "navigate",
      navigation_path: doel.pad,
    });
  }

  paint() {
    const c = this.config;
    const wens = c.icon || "arrowLeft";
    const ico = this.$(".ico");
    if (ico.dataset.icon !== wens) {
      ico.dataset.icon = wens;
      ico.innerHTML = resolve(wens, "arrowLeft");
    }
    this.text(".tekst", c.label ?? "");
    this.$(".chip").title = terugTitel(c);
  }

  getCardSize() {
    return 1;
  }

  /**
   * Eén rasterrij, en de breedte mag je zelf kiezen.
   *
   * `columns` staat er met opzet NIET in: een terugknop van twaalf kolommen is
   * een halve meter lucht naast een pijltje, en in een pop-up wil je hem naast
   * iets anders kunnen zetten. De hoogte staat wel vast -- de knop is 36px en
   * groeit nergens van.
   */
  getGridOptions() {
    return { rows: 1, min_rows: 1, max_rows: 1 };
  }

  static getConfigElement() {
    return document.createElement(EDITOR_TYPE);
  }

  /**
   * Wat er staat zodra je hem uit de lijst kiest.
   *
   * Zonder pad, dus hij doet meteen iets zinnigs: één stap terug. Wie een vaste
   * plek wil, vult die in.
   */
  static getStubConfig() {
    return { icon: "arrowLeft", label: "Terug", align: "links" };
  }
}

/* ================================== editor ================================ */

class DomotiappTerugCardEditor extends DacEditor {
  defaults() {
    return { icon: "arrowLeft", align: "links" };
  }

  pickers() {
    return [{ key: "icon", kind: "icon", label: "Icoon", fallback: "arrowLeft", auto: false }];
  }

  schema() {
    return [
      { name: "path", selector: sel.text() },
      { name: "label", selector: sel.text() },
      {
        name: "align",
        // Uit de logica, zodat de keuzelijst en wat de kaart kan niet uit
        // elkaar kunnen lopen. De hoofdletter is alleen voor het oog.
        selector: sel.select(
          uitlijningen().map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })),
        ),
      },
    ];
  }

  label(s) {
    return (
      {
        path: "Waar gaat hij heen",
        label: "Tekst ernaast (optioneel)",
        align: "Uitlijning",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      path: "Het pad waar je altijd op uitkomt, bijvoorbeeld /dashboard/thuis. Begint het met een # dan opent hij een pop-up op de huidige view. Laat je het leeg, dan gaat hij één stap terug in de geschiedenis — net als de terugknop van je browser.",
      label: "Laat leeg voor alleen het pijltje. Dat is meestal genoeg en het scheelt breedte.",
      align: "Waar de knop binnen de kaart staat. De kaart zelf is doorzichtig.",
      bare: "Haalt de pil helemaal weg: geen vulling, geen rand en geen binnenmarge. Dan staat er alleen nog een pijltje met tekst.",
    }[s.name];
  }
}

registerEditor(EDITOR_TYPE, DomotiappTerugCardEditor);
registerCard(CARD_TYPE, DomotiappTerugCard, {
  name: "DomotiApp Terug",
  description:
    "Een terugknop die je overal kunt neerzetten, ook in een pop-up: naar een vaste plek die je zelf opgeeft, of één stap terug als je niets invult.",
});

export { DomotiappTerugCard };
