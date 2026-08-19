/**
 * Het werkpaard: één control, drie vormen.
 *
 * Het meeste van een dashboard is deze kaart. Hij vervangt de stapel `tile`,
 * `mushroom-entity-card` en bubble-knoppen waar een gegroeid dashboard mee
 * eindigt -- vier families die één klus doen in vier vormtalen.
 *
 * Het icoon en de kaart zijn twee knoppen. Op het icoon tikken schakelt de
 * entiteit, op de kaart tikken doet wat jij instelt -- meestal navigeren naar
 * een pop-up. Dat is hoe een ruimtetegel werkt: het lampje aan zonder de kamer
 * te openen, of de kamer openen zonder het lampje aan te doen.
 *
 * Alleen het icoon licht op als er iets aanstaat. Het hele vlak laten oplichten
 * was te veel: een kolom van acht aanstaande knoppen werd een muur in plaats van
 * een rij.
 *
 * De kleur volgt wat er hangt. Een lamp draagt zijn eigen kleur, want die weet
 * je pas als hij brandt; al het andere krijgt het accent. Een keuze "kleur volgt
 * toestand" stond hier ook, maar dat is geen keuze -- een knop die er hetzelfde
 * uitziet of het apparaat nu aan of uit staat, is een kapotte knop.
 *
 * Draagt de entiteit een eigen afbeelding -- een clublogo, een profielfoto, het
 * merk van een integratie -- dan staat die in de chip in plaats van een icoon.
 * Zelf een icoon kiezen wint nog steeds: wat jij kiest is specifieker dan wat de
 * entiteit meebrengt, en dat is weer specifieker dan wat het domein oplevert.
 *
 * Een kaart zonder entiteit mag en is nuttig: dat is een navigatieknop.
 *
 * Staat er een `switch` of een `input_boolean` achter, dan kan er een
 * schuifschakelaar rechts op de kaart. Dezelfde knop die een script start hoort
 * er anders uit te zien dan een die een stopcontact bedient: bij een script
 * hoort een knop, bij twee standen die blijven staan hoort een schakelaar die
 * laat zien in welke stand hij staat. Het icoon blijft gewoon schakelen, dus je
 * hebt er twee manieren voor -- dat is geen dubbelop maar dezelfde afspraak als
 * elders in de familie: het icoon schakelt, de kaart doet wat jij instelt.
 */

import { DacCard, registerCard, registerEditor, toneValue, TONES } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve, defaultIcon } from "../icons.js";
import { bindToggle, setToggle, toggleCss, toggleHtml } from "../toggle.js";
import {
  attrsOf,
  bindActions,
  defaultTapAction,
  domainOf,
  isDead,
  isOn,
  isStateless,
  kanSchakelen,
  lightTone,
  localizeState,
  nameOf,
  pictureOf,
  runAction,
  stateOf,
} from "../ha.js";

class ButtonCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }

    /* Achtergrond, rand, ronding en schaduw komen van .surface in theme.js,
       niet uit dit bestand. Ze stonden hier wel, met --dac-radius-sm in plaats
       van --dac-radius, en dat is precies hoe je het ziet op een dashboard:
       een rolluikkaart met ronde hoeken en een knop eronder met scherpere. Eén
       kaart die zijn eigen vorm nabouwt, loopt vroeg of laat uit de pas. */
    .btn {
      position: relative; overflow: hidden;
      width: 100%; height: 100%; padding: 0; margin: 0;
      font: inherit; color: inherit; text-align: left; cursor: pointer;
      display: flex; align-items: center; gap: 12px;
      transition: border-color 220ms ease, background 220ms ease, transform 220ms ease;
      touch-action: manipulation;
    }
    .btn:hover { border-color: var(--dac-border-hi); background: var(--dac-surface-hi); }
    .btn:active { transform: scale(.985); }

    /* Alleen het icoon draagt de toestand. Zie de kop. */
    .chip {
      cursor: pointer;
      transition: color 220ms ease, background 220ms ease,
                  border-color 220ms ease, box-shadow 220ms ease;
    }
    :host([on]) .chip {
      box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
    }
    .chip .icon, .chip ha-icon { display: block; --mdc-icon-size: 20px; }

    /* Onder elkaar, niet achter elkaar. Dit waren inline-spans in een gewone
       blokcontainer, en dan lopen naam en toestand op één regel door -- wat
       precies het verschil was met de licht-, klimaat- en entiteitenkaart. */
    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      font-variant-numeric: tabular-nums;
    }

    /* ---- row: the default. A pill you can put six of in a column. ---- */
    :host([layout="row"]) .btn { min-height: 56px; padding: 7px 12px; gap: 11px; }
    :host([layout="row"]) .chip { width: 40px; height: 40px; }
    :host([layout="row"]) .chip .icon, :host([layout="row"]) .chip ha-icon { width: 20px; height: 20px; }

    /* ---- tile: icon over label, for a grid of rooms or scenes. ---- */
    :host([layout="tile"]) .btn {
      flex-direction: column; align-items: flex-start; justify-content: space-between;
      gap: 0; padding: 14px; min-height: 96px;
    }
    :host([layout="tile"]) .chip { width: 40px; height: 40px; }
    :host([layout="tile"]) .chip .icon, :host([layout="tile"]) .chip ha-icon { width: 21px; height: 21px; }
    :host([layout="tile"]) .txt { flex: 0 0 auto; margin-top: 12px; width: 100%; }
    :host([layout="tile"]) .nm { font-size: 14px; }

    /* ---- compact: icon and name, nothing else. For a dense favourites row. ---- */
    :host([layout="compact"]) .btn {
      min-height: 44px; padding: 6px 14px 6px 6px; border-radius: var(--dac-radius-pill);
    }
    :host([layout="compact"]) .chip { width: 32px; height: 32px; border-radius: var(--dac-radius-pill); }
    :host([layout="compact"]) .chip .icon, :host([layout="compact"]) .chip ha-icon { width: 17px; height: 17px; }
    :host([layout="compact"]) .nm { font-size: 13px; }

    ${toggleCss}

    /* De schakelaar staat rechts op de rij. Op een tegel is er rechts geen
       ruimte naast de tekst, dus staat hij bovenin naast het icoon -- daar waar
       op een rij het icoon zelf staat, en dus waar je hand al is. */
    :host([layout="tile"]) .toggle { position: absolute; top: 14px; right: 14px; margin: 0; }
    :host([layout="compact"]) .toggle { width: 40px; height: 23px; }
    :host([layout="compact"]) .toggle .knob { width: 17px; height: 17px; }
    :host([layout="compact"]) .toggle[aria-checked="true"] .knob { --knob: 19px; }

    /* Een vleug identiteitskleur op een tegel, zodat je hem van een afstand
       herkent voordat de tekst leesbaar is. Alleen op de tegelvorm: in een rij
       zou het net het oplichten worden dat er juist uit moest. */
    .wash {
      position: absolute; top: -70px; right: -60px; width: 190px; height: 190px;
      border-radius: 50%; pointer-events: none; opacity: 0;
      background: radial-gradient(circle, var(--tone) 0%, transparent 70%);
      transition: opacity 260ms ease;
    }
    :host([layout="tile"]) .wash { opacity: .10; }
    :host([layout="tile"][on]) .wash { opacity: .2; }

  `;

  validate(config) {
    return {
      layout: "row",
      show_state: true,
      show_name: true,
      show_icon: true,
      ...config,
    };
  }

  watched() {
    return [this.config.entity].filter(Boolean);
  }

  /**
   * De kleur die deze knop nu draagt.
   *
   * Eén lamp draagt de kleur die hij maakt -- daar hangt hij tenslotte voor. Een
   * groep niet: die leent zijn kleur van het lid dat toevallig aan staat, en dan
   * wordt een kamer met vier witte spots paars omdat er één ledstrip in hangt.
   * Groepen krijgen dus de vaste lichtkleur; alles wat geen lamp is, het accent.
   * Zie `lightTone` in ha.js.
   */
  tone_() {
    const c = this.config;
    if (c.tone) return toneValue(c.tone);
    if (domainOf(c.entity) !== "light") return TONES.accent;
    return lightTone(stateOf(this.hass, c.entity)) ?? TONES.lit;
  }

  /**
   * Hoort er een schakelaar op deze kaart?
   *
   * Alleen als jij dat vraagt, en alleen op iets dat twee standen heeft die
   * blijven staan. Een schakelaar op een scene of een sensor belooft een "uit"
   * die er niet is; zie `kanSchakelen` in ha.js.
   */
  metSchakelaar_() {
    return Boolean(this.config.toggle) && kanSchakelen(this.config.entity);
  }

  template() {
    const c = this.config;
    this.setAttribute("layout", ["row", "tile", "compact"].includes(c.layout) ? c.layout : "row");

    return `
      <div class="btn surface" role="button" tabindex="0" style="--tone:${this.tone_()}">
        <span class="wash"></span>
        ${c.show_icon === false ? "" : `<span class="chip" role="button" tabindex="0"></span>`}
        <span class="txt">
          ${c.show_name === false ? "" : `<span class="nm"></span>`}
          ${c.show_state === false ? "" : `<span class="st"></span>`}
        </span>
        ${this.metSchakelaar_() ? toggleHtml({ label: "Aan of uit" }) : ""}
      </div>`;
  }

  wire() {
    const c = this.config;
    const fire = (which, fallback) => runAction(this, this.hass, c, c[which] ?? fallback);

    this.teardown_.push(
      bindActions(this.$(".btn"), {
        // De kaart opent, het icoon schakelt. Dat is dezelfde verdeling die de
        // editor wegschrijft, zodat een handgeschreven config en een geklikte
        // config zich hetzelfde gedragen.
        onTap: () => fire("tap_action", { action: c.entity ? "more-info" : "none" }),
        onHold: () => fire("hold_action", { action: c.entity ? "more-info" : "none" }),
        onDouble: c.double_tap_action
          ? () => fire("double_tap_action", { action: "none" })
          : undefined,
      })
    );

    // Het icoon is een eigen knop. Standaard schakelt hij de entiteit, zodat een
    // ruimtetegel met een lichtgroep meteen doet wat je verwacht.
    const chip = this.$(".chip");
    if (!chip) return;
    this.teardown_.push(
      bindActions(chip, {
        onTap: (e) => fire("icon_tap_action", defaultTapAction(c.entity)),
        onHold: () => fire("icon_hold_action", { action: c.entity ? "more-info" : "none" }),
      })
    );
    // Anders telt een tik op het icoon ook als een tik op de kaart.
    this.on(chip, "click", (e) => e.stopPropagation());
    this.on(chip, "pointerdown", (e) => e.stopPropagation());

    const schakelaar = this.$(".toggle");
    if (!schakelaar) return;
    this.teardown_.push(
      bindToggle(schakelaar, {
        value: () => isOn(stateOf(this.hass, c.entity)),
        set: (aan) =>
          this.hass.callService("homeassistant", aan ? "turn_on" : "turn_off", {
            entity_id: c.entity,
          }),
        disabled: () => isDead(stateOf(this.hass, c.entity)),
      })
    );
  }

  paint() {
    const c = this.config;
    const st = stateOf(this.hass, c.entity);
    const on = isOn(st);
    const dead = Boolean(c.entity) && isDead(st);

    this.toggleAttribute("on", on);
    this.$(".btn").classList.toggle("unavailable", dead);

    // De kleur van de kaart volgt de lamp, dus die moet elke keer opnieuw.
    this.$(".btn").style.setProperty("--tone", this.tone_());

    const chip = this.$(".chip");
    if (chip) {
      const pic = pictureOf(this.hass, c.entity, c.icon);
      const wanted = pic
        ? `pic:${pic}`
        : c.icon || defaultIcon(c.entity, attrsOf(this.hass, c.entity));
      if (chip.dataset.icon !== wanted) {
        chip.dataset.icon = wanted;
        chip.classList.toggle("pic", Boolean(pic));
        chip.innerHTML = pic
          ? `<img src="${pic}" alt="" loading="lazy" />`
          : resolve(wanted);
      }
      // Uit is een echte toestand en hoort er ook zo uit te zien: de chip wordt
      // stil in plaats van zijn kleur te houden. Een afbeelding draagt haar
      // eigen kleuren en hoeft niet mee te kleuren.
      chip.style.setProperty("--tone", on && !pic ? this.tone_() : "var(--dac-ink-3)");
      chip.setAttribute(
        "aria-label",
        c.entity ? `${nameOf(this.hass, c.entity, c.name)} schakelen` : "Icoon"
      );
    }

    this.text(".nm", nameOf(this.hass, c.entity, c.name));

    const schakelaar = this.$(".toggle");
    if (schakelaar) {
      setToggle(schakelaar, on);
      // De schakelaar draagt dezelfde kleur als de chip, ook als de lamp
      // erachter van kleur verandert.
      schakelaar.style.setProperty("--tone", this.tone_());
      schakelaar.setAttribute(
        "aria-label",
        `${nameOf(this.hass, c.entity, c.name)} aan of uit`
      );
    }

    const stEl = this.$(".st");
    if (stEl) this.text(stEl, this.secondary_(st, dead));

    this.$(".btn").setAttribute(
      "aria-label",
      `${nameOf(this.hass, c.entity, c.name)}${st ? `, ${localizeState(this.hass, st)}` : ""}`
    );
  }

  /** Wat er onder de naam staat. */
  secondary_(st, dead) {
    if (dead) return "Niet bereikbaar";
    if (!st) return "";

    // A scene has no state worth printing. "Onbekend" under every scene button
    // is noise that makes a row of them look broken.
    if (isStateless(st.entity_id)) return "";

    // A dimmed lamp should say how dim, not just "aan".
    if (domainOf(st.entity_id) === "light" && st.state === "on" && st.attributes.brightness != null) {
      return `${Math.round((st.attributes.brightness / 255) * 100)}%`;
    }
    return localizeState(this.hass, st);
  }

  getCardSize() {
    return this.config?.layout === "tile" ? 2 : 1;
  }

  getGridOptions() {
    if (this.config?.layout === "tile") {
      return { columns: 6, rows: 2, min_columns: 3, min_rows: 2, max_rows: 2 };
    }
    return { columns: 12, rows: 1, min_columns: 4, min_rows: 1, max_rows: 1 };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-button-card-editor");
  }

  static getStubConfig(hass, entities) {
    const pick =
      entities?.find((e) => e.startsWith("light.")) ??
      entities?.find((e) => e.startsWith("switch.")) ??
      entities?.[0];
    return { entity: pick, layout: "row" };
  }
}

class ButtonEditor extends DacEditor {
  // Zonder deze stonden alle vinkjes uit terwijl de instelling aanstond:
  // aanzetten deed dan niets en alleen uitzetten had zichtbaar effect.
  /**
   * De acties staan er expliciet in.
   *
   * Ze weglaten en op de kaart terugvallen leek netter, maar de actie-editor van
   * Home Assistant vult zichzelf dan met "geen actie" en schrijft dat weg. Wat
   * er in de YAML staat is nu ook wat de kaart doet.
   */
  defaults() {
    return {
      layout: "row",
      show_state: true,
      show_name: true,
      show_icon: true,
      toggle: false,
      icon_tap_action: { action: "toggle" },
      tap_action: { action: "more-info" },
    };
  }

  pickers() {
    return [
      { key: "icon", kind: "icon", label: "Icoon", fallback: "star" },
      { key: "tone", kind: "tone", label: "Kleur" },
    ];
  }

  // Alles op één niveau. De instellingen zaten in uitklapblokken en die openden
  // leeg, omdat een ha-form-raster zonder `name` zijn velden niet tekent.
  schema() {
    return [
      { name: "entity", selector: sel.entity() },
      { name: "name", selector: sel.text() },
      {
        name: "layout",
        selector: sel.select([
          { value: "row", label: "Rij" },
          { value: "tile", label: "Tegel" },
          { value: "compact", label: "Compact" },
        ]),
      },
      { name: "toggle", selector: sel.bool() },
      { name: "show_icon", selector: sel.bool() },
      { name: "show_name", selector: sel.bool() },
      { name: "show_state", selector: sel.bool() },
      { name: "icon_tap_action", selector: sel.action("toggle") },
      { name: "icon_hold_action", selector: sel.action("more-info") },
      { name: "tap_action", selector: sel.action("more-info") },
      { name: "hold_action", selector: sel.action("more-info") },
      { name: "double_tap_action", selector: sel.action("none") },
    ];
  }

  label(s) {
    return (
      {
        entity: "Entiteit",
        name: "Naam (overschrijft die van de entiteit)",
        layout: "Vorm",
        toggle: "Schakelaar tonen",
        show_icon: "Icoon tonen",
        show_name: "Naam tonen",
        show_state: "Status tonen",
        icon_tap_action: "Tikken op het icoon",
        icon_hold_action: "Vasthouden op het icoon",
        tap_action: "Tikken op de kaart",
        hold_action: "Vasthouden op de kaart",
        double_tap_action: "Dubbeltikken op de kaart",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "entity")
      return "Mag leeg blijven: zonder entiteit wordt dit een navigatieknop.";
    if (s.name === "toggle")
      return "Een schuifschakelaar rechts op de kaart, voor wat twee standen heeft: een lamp, een stopcontact, een schakelaar. Op een scene of een script verschijnt hij niet.";
    if (s.name === "icon_tap_action")
      return "Handig: het icoon schakelt de lichtgroep, de kaart navigeert naar de ruimte.";
    if (s.name === "tap_action")
      return "Wat er gebeurt als je naast het icoon tikt, bijvoorbeeld navigeren naar een pop-up.";
    return undefined;
  }
}

registerEditor("domotiapp-button-card-editor", ButtonEditor);
registerCard("domotiapp-button-card", ButtonCard, {
  name: "DomotiApp Knop",
  description: "Eén control als rij, tegel of compacte pil. Vervangt tile, mushroom-entity en bubble-knoppen.",
});
