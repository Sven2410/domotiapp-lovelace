/**
 * De terugknop: één badge die je terugbrengt waar je vandaan kwam.
 *
 * ## Waarom dit een eigen badge is en geen instelling op de sjabloonbadge
 *
 * Het kan al met `domotiapp-template-badge`: een icoon, geen tekst, en een
 * `tap_action` met `action: navigate`. Maar dan zijn het vier velden invullen
 * voor een knop die één ding doet, en drie daarvan gaan over dingen die deze
 * knop niet heeft (een entiteit, twee tekstregels, een kleur).
 *
 * De eigenaar vroeg er op 17 september 2026 om, met de chips-kaart van Mushroom
 * als voorbeeld: *"Ook wil ik net als de mushroom chips card een terug button
 * die elke keer een stap navigeert naar het home path wat ik kan opgeven in de
 * GUI. Ook daar de mogelijkheid om background weg te halen."*
 *
 * Dus: één veld dat ertoe doet (waar hij heen gaat), en de rest heeft een
 * verstandige standaard.
 *
 * ## Leeg pad is niet hetzelfde als geen knop
 *
 * Laat je het pad leeg, dan gaat hij ÉÉN STAP terug in de geschiedenis --
 * precies wat de `back`-chip van Mushroom doet. Dat is met opzet het gedrag
 * zonder configuratie: een terugknop die nergens heen kan is geen terugknop, en
 * "terug" betekent voor de meeste mensen "waar ik vandaan kwam" en niet "naar
 * de voorpagina".
 *
 * Vul je wel een pad in, dan gaat hij daarheen -- ook als je via vijf pop-ups
 * bent gekomen. Dat is wat hij bedoelt met "het home path": één vaste plek waar
 * je altijd op uitkomt.
 *
 * ## De navigatie gaat via history en niet via een herlading
 *
 * `history.pushState` plus een `location-changed`-gebeurtenis: dat is hoe Home
 * Assistant zelf van view wisselt, en het is de enige manier waarop een pad dat
 * met `#` begint een bubble-card-pop-up opent in plaats van de pagina opnieuw
 * te laden. Het staat niet hier maar in `runAction` (`ha.js`), zodat een
 * terugknop en een gewone navigatieactie niet uit elkaar kunnen lopen.
 */

import { DacCard, registerBadge, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { bindActions, runAction } from "../ha.js";
import { terugDoel } from "./badge-logica.js";

const BADGE_TYPE = "domotiapp-terug-badge";
const EDITOR_TYPE = "domotiapp-terug-badge-editor";

class DomotiappTerugBadge extends DacCard {
  static css = /* css */ `
    :host { display: block; }

    /* Dezelfde maten als de sjabloonbadge en als die van Home Assistant zelf:
       36px hoog, 18px rond. Een terugknop staat naast de andere badges in de
       kop, en dan is twee pixels verschil een knop die uit de rij loopt. */
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      height: 36px; padding: 0 12px;
      border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      box-shadow: var(--dac-shadow);
      cursor: pointer; font: inherit; color: inherit;
      text-align: left;
      transition: background 200ms ease, border-color 200ms ease, transform 160ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) {
      .badge:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); }
      .badge:hover .ico { color: var(--dac-accent-hi); }
    }
    .badge:active { transform: scale(.97); }

    /* Achtergrond weglaten haalt ook de rand en de binnenmarge weg -- zie de
       kop van template-badge.js voor waarom dat op een badge meer is dan op
       een kaart. Een knop zonder vlak naast een knop zonder vlak hoort geen
       24px lucht tussen zich te hebben waar niets staat. */
    :host([bare]) .badge {
      background: none; border-color: transparent; box-shadow: none;
      padding: 0; height: auto; min-height: 30px;
    }
    @media (hover: hover) {
      :host([bare]) .badge:hover { background: none; border-color: transparent; }
    }

    .ico { flex: 0 0 auto; display: flex; color: var(--dac-ink-2); transition: color 200ms ease; }
    .ico .icon, .ico ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }

    .tekst {
      min-width: 0; font-size: 13px; font-weight: 600; letter-spacing: -.01em;
      color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .tekst:empty { display: none; }

    .badge:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  validate(config) {
    return { icon: "arrowLeft", ...config };
  }

  /** Niets om op te letten: deze knop leest geen enkele entiteit. */
  watched() {
    return [];
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    return `
      <button class="badge" type="button">
        <span class="ico"></span>
        <span class="tekst"></span>
      </button>`;
  }

  wire() {
    this.teardown_.push(
      bindActions(this.$(".badge"), { onTap: () => this.terug_() }),
    );
  }

  /**
   * Terug: naar het opgegeven pad, of één stap in de geschiedenis.
   *
   * De navigatie loopt via `runAction` en niet via een eigen `pushState`, zodat
   * een pad dat met `#` begint hier hetzelfde doet als overal elders in het
   * pakket: een pop-up openen in plaats van de pagina herladen.
   */
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
    this.$(".badge").title = c.label || (this.config.path ? `Naar ${this.config.path}` : "Terug");
  }

  getCardSize() {
    return 1;
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
    return { icon: "arrowLeft", label: "Terug" };
  }
}

/* ================================== editor ================================ */

class DomotiappTerugBadgeEditor extends DacEditor {
  defaults() {
    return { icon: "arrowLeft" };
  }

  pickers() {
    return [{ key: "icon", kind: "icon", label: "Icoon", fallback: "arrowLeft", auto: false }];
  }

  schema() {
    return [
      { name: "path", selector: sel.text() },
      { name: "label", selector: sel.text() },
    ];
  }

  label(s) {
    return { path: "Waar gaat hij heen", label: "Tekst ernaast (optioneel)" }[s.name] ?? super.label(s);
  }

  helper(s) {
    return {
      path: "Het pad waar je altijd op uitkomt, bijvoorbeeld /dashboard/thuis. Begint het met een # dan opent hij een pop-up op de huidige view. Laat je het leeg, dan gaat hij één stap terug in de geschiedenis — net als de terugknop van je browser.",
      label: "Laat leeg voor alleen het pijltje. Dat is meestal genoeg en het scheelt breedte in de kop.",
    }[s.name];
  }
}

registerEditor(EDITOR_TYPE, DomotiappTerugBadgeEditor);
registerBadge(BADGE_TYPE, DomotiappTerugBadge, {
  name: "DomotiApp Terug",
  description:
    "Een pijltje terug in de kop van je view: naar een vaste plek die je zelf opgeeft, of één stap terug als je niets invult.",
});

export { DomotiappTerugBadge };
