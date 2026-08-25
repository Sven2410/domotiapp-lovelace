/**
 * De editor van de tabbladenkaart: de tabs zelf, in volgorde.
 *
 * Wat hier WEL kan: een tab bijmaken, hernoemen, een icoon geven, verplaatsen
 * en weggooien. Dat is de vorm van de kaart, en dat is wat je vaak doet.
 *
 * Wat hier NIET kan: de kaart kiezen die in een tab zit. Home Assistant heeft
 * daar wel een component voor -- dezelfde kaartkiezer als in de bewerkdialoog --
 * maar die is intern en niet aan te roepen zonder je vast te maken aan een
 * versie. Een half nagemaakte kaartkiezer zou minder kunnen dan de echte en bij
 * de eerste wijziging in Home Assistant breken. De inhoud van een tab hoort
 * daarom (voorlopig) in de code-editor, en dat staat er ook met zoveel woorden
 * bij in plaats van dat je het moet ontdekken.
 *
 * Voor het overige gelden dezelfde twee vallen als bij de navbalk-editor: Home
 * Assistant BEVRIEST de config die je meestuurt, en duwt hem bij elke
 * toetsaanslag terug via `setConfig`. Zie de kop van `navbar-editor.js`.
 */

import "./icon-picker.js";
import "./tone-picker.js";
import { meldAan } from "../registratie.js";
import { icons, resolve } from "../icons.js";
import { naamVan } from "./icoon-zoek.js";
import { TABS_MAX, asTab, gevuld } from "../cards/tabs-logica.js";

const CSS = `
  .dac-tabs { display: flex; flex-direction: column; gap: 12px; }
  .dac-tabs .lijst { display: flex; flex-direction: column; gap: 8px; }

  .dac-tabs .tab {
    border: 1px solid var(--divider-color); border-radius: 12px;
    background: var(--card-background-color); overflow: hidden;
  }
  .dac-tabs .tab[open] { border-color: var(--primary-color); }
  .dac-tabs .tab > summary {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 8px 8px 12px; cursor: pointer; list-style: none;
  }
  .dac-tabs .tab > summary::-webkit-details-marker { display: none; }
  .dac-tabs .tab[open] > summary { border-bottom: 1px solid var(--divider-color); }
  .dac-tabs .tab > summary:hover { background: rgba(127,127,127,.06); }

  .dac-tabs .voor {
    flex: 0 0 auto; width: 30px; height: 30px; display: grid; place-items: center;
    border-radius: 9px; background: rgba(127,127,127,.14); color: var(--primary-color);
  }
  .dac-tabs .voor svg, .dac-tabs .voor ha-icon {
    width: 17px; height: 17px; --mdc-icon-size: 17px;
  }

  .dac-tabs .titel { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
  .dac-tabs .titel b {
    font-size: 13px; font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-tabs .titel small {
    font-size: 11.5px; color: var(--secondary-text-color);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-tabs .tab[data-leeg="true"] .titel b {
    font-weight: 500; font-style: italic; color: var(--secondary-text-color);
  }

  .dac-tabs .rondknop {
    flex: 0 0 auto; width: 28px; height: 28px; display: grid; place-items: center;
    cursor: pointer; border: 0; background: transparent; border-radius: 999px;
    color: var(--secondary-text-color);
  }
  .dac-tabs .rondknop:hover { background: rgba(127,127,127,.16); }
  .dac-tabs .rondknop:disabled { opacity: .3; cursor: default; }
  .dac-tabs .rondknop:disabled:hover { background: transparent; }
  .dac-tabs .weg:hover { color: var(--error-color, #d03b3b); }
  .dac-tabs .rondknop svg { width: 15px; height: 15px; }

  .dac-tabs .body { padding: 10px; display: flex; flex-direction: column; gap: 10px; }

  .dac-tabs .inhoud {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    background: rgba(127,127,127,.08);
    font-size: 12.5px; color: var(--secondary-text-color);
  }
  .dac-tabs .inhoud b { color: var(--primary-text-color); font-weight: 600; }

  .dac-tabs .toevoegen {
    padding: 13px; cursor: pointer; font: inherit; font-size: 14px; font-weight: 500;
    border: 1px dashed var(--divider-color); border-radius: 12px;
    background: transparent; color: var(--primary-color); text-align: center;
  }
  .dac-tabs .toevoegen:hover { background: rgba(127,127,127,.08); }
  .dac-tabs .toevoegen:disabled { opacity: .4; cursor: default; }

  .dac-tabs .uitleg {
    margin: 0; font-size: 12px; line-height: 1.45; color: var(--secondary-text-color);
  }
`;

/** Wat er in de YAML komt: geen lege sleutels, en altijd verse objecten. */
const uitgekleed = (tabs) =>
  tabs.filter(gevuld).map((t) => ({
    ...(t.name ? { name: t.name } : {}),
    ...(t.icon ? { icon: t.icon } : {}),
    // De kaart zelf wordt hier niet bewerkt, maar moet wél bewaard blijven --
    // anders gooit een naamswijziging in deze editor de inhoud van de tab weg.
    ...(t.card ? { card: structuredClone(t.card) } : {}),
  }));

/** Waar een tab naar wijst, in één regel. */
function inhoudRegel(tab) {
  if (!tab.card) return "Nog geen kaart";
  const type = String(tab.card.type ?? "").replace(/^custom:/, "");
  if (type === "vertical-stack" || type === "horizontal-stack" || type === "grid") {
    return `${type} met ${(tab.card.cards ?? []).length} kaarten`;
  }
  return type || "een kaart";
}

class TabsEditor extends HTMLElement {
  constructor() {
    super();
    this.tabs_ = [];
    this.rest_ = {};
    this.open_ = new Set();
  }

  setConfig(config) {
    this.rest_ = { ...config };
    delete this.rest_.tabs;

    if (this.gebouwd_ && config === this.uitObject_) return;
    const binnen = (Array.isArray(config?.tabs) ? config.tabs : []).map(asTab);
    if (this.gebouwd_ && JSON.stringify(uitgekleed(binnen)) === this.uit_) return;

    this.tabs_ = binnen;
    this.build_();
  }

  set hass(hass) {
    this.hass_ = hass;
    for (const el of this.querySelectorAll("ha-form, dac-icon-picker, dac-tone-picker")) {
      el.hass = hass;
    }
    if (!this.gebouwd_) this.build_();
  }

  get hass() {
    return this.hass_;
  }

  connectedCallback() {
    if (!this.gebouwd_) this.build_();
  }

  /* ------------------------------------------------------------- opbouw */

  async build_() {
    if (!this.hass_) return;
    await customElements.whenDefined("ha-form");
    this.gebouwd_ = true;
    this.replaceChildren();
    this.koppen_ = [];

    const style = document.createElement("style");
    style.textContent = CSS;
    const wrap = document.createElement("div");
    wrap.className = "dac-tabs";
    this.append(style, wrap);

    wrap.appendChild(this.kaartBlok_());
    wrap.appendChild(this.kleurKiezer_());

    const lijst = document.createElement("div");
    lijst.className = "lijst";
    wrap.appendChild(lijst);
    this.tabs_.forEach((tab, i) => lijst.appendChild(this.tabBlok_(tab, i)));

    const uitleg = document.createElement("p");
    uitleg.className = "uitleg";
    uitleg.textContent =
      "De kaart die in een tab zit, stel je in via Code-editor weergeven. " +
      "Naam, icoon en volgorde kunnen hier; de inhoud blijft staan als je die aanpast.";
    wrap.appendChild(uitleg);

    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "toevoegen";
    knop.textContent = "＋  Tabblad toevoegen";
    knop.disabled = this.tabs_.length >= TABS_MAX;
    knop.addEventListener("click", () => {
      this.tabs_.push({ name: "", icon: "", card: null });
      this.open_.add(`t${this.tabs_.length - 1}`);
      this.emit_();
      this.build_();
    });
    wrap.appendChild(knop);
  }

  kaartBlok_() {
    const form = document.createElement("ha-form");
    form.hass = this.hass_;
    form.schema = [
      {
        name: "default_tab",
        selector: { number: { min: 1, max: TABS_MAX, step: 1, mode: "box" } },
      },
      {
        name: "alignment",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "vullen", label: "Verdeeld over de breedte" },
              { value: "links", label: "Links" },
              { value: "rechts", label: "Rechts" },
            ],
          },
        },
      },
      { name: "show_names", selector: { boolean: {} } },
      { name: "bare", selector: { boolean: {} } },
    ];
    form.computeLabel = (s) =>
      ({
        default_tab: "Welk tabblad staat open op een nieuw apparaat",
        alignment: "Uitlijning van de rij",
        show_names: "Namen naast de iconen",
        bare: "Achtergrond weglaten",
      })[s.name] ?? s.name;
    form.computeHelper = (s) => {
      if (s.name === "default_tab")
        return (
          "Telt vanaf 1. Dit geldt alleen zolang een apparaat nog niets gekozen heeft — " +
          "daarna onthoudt elk apparaat zijn eigen tabblad, en dat van je telefoon staat " +
          "los van dat van de tablet."
        );
      if (s.name === "show_names")
        return "Uit geeft een rij kale iconen. Dan passen er meer naast elkaar op een telefoon.";
      if (s.name === "bare")
        return "Haalt het vlak onder de kaart weg. De rij tabbladen houdt zijn eigen pil.";
      return undefined;
    };
    form.data = {
      default_tab: Number(this.rest_.default_tab) || 1,
      alignment: this.rest_.alignment ?? "vullen",
      show_names: this.rest_.show_names !== false,
      bare: Boolean(this.rest_.bare),
    };
    form.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      const v = e.detail.value ?? {};
      // De standaard hoort niet in de YAML: wat er staat is wat afwijkt.
      const n = Number(v.default_tab);
      if (Number.isFinite(n) && n > 1) this.rest_.default_tab = n;
      else delete this.rest_.default_tab;
      if (v.alignment === "links" || v.alignment === "rechts") this.rest_.alignment = v.alignment;
      else delete this.rest_.alignment;
      if (v.show_names === false) this.rest_.show_names = false;
      else delete this.rest_.show_names;
      if (v.bare) this.rest_.bare = true;
      else delete this.rest_.bare;
      this.emit_();
    });
    return form;
  }

  kleurKiezer_() {
    const el = document.createElement("dac-tone-picker");
    el.label = "Kleur van het actieve tabblad";
    el.hass = this.hass_;
    el.value = this.rest_.tone ?? "accent";
    el.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      const v = e.detail.value;
      if (v && v !== "accent") this.rest_.tone = v;
      else delete this.rest_.tone;
      this.emit_();
    });
    return el;
  }

  /* ----------------------------------------------------------- een tab */

  tabBlok_(tab, i) {
    const det = document.createElement("details");
    det.className = "tab";
    this.onthoud_(det, `t${i}`);

    const sum = document.createElement("summary");
    const voor = document.createElement("span");
    voor.className = "voor";
    const titel = document.createElement("span");
    titel.className = "titel";
    const b = document.createElement("b");
    const small = document.createElement("small");
    titel.append(b, small);

    const kop = () => {
      det.dataset.leeg = String(!gevuld(tab));
      voor.innerHTML = resolve(tab.icon, "grid");
      b.textContent = tab.name || `Tabblad ${i + 1}`;
      small.textContent = inhoudRegel(tab);
    };
    kop();
    this.koppen_.push(kop);

    const omhoog = this.kopKnop_("Omhoog", icons.arrowUp, () => this.verplaats_(i, -1));
    omhoog.disabled = i === 0;
    const omlaag = this.kopKnop_("Omlaag", icons.arrowDown, () => this.verplaats_(i, 1));
    omlaag.disabled = i === this.tabs_.length - 1;
    const weg = this.kopKnop_("Verwijderen", icons.close, () => this.verwijder_(i));
    weg.classList.add("weg");

    sum.append(voor, titel, omhoog, omlaag, weg);
    det.appendChild(sum);

    const body = document.createElement("div");
    body.className = "body";

    const kiezer = document.createElement("dac-icon-picker");
    kiezer.label = "Icoon";
    kiezer.fallback = "grid";
    kiezer.auto = false;
    kiezer.hass = this.hass_;
    kiezer.value = tab.icon;
    kiezer.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      tab.icon = e.detail.value ?? "";
      this.emit_();
    });

    const form = document.createElement("ha-form");
    form.hass = this.hass_;
    form.schema = [{ name: "name", selector: { text: {} } }];
    form.computeLabel = () => "Naam";
    form.computeHelper = () =>
      "Deze naam bepaalt ook onder welke sleutel een apparaat zijn keuze onthoudt. " +
      "Hernoem je hem, dan begint elk apparaat één keer opnieuw bij het eerste tabblad.";
    form.data = { name: tab.name };
    form.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      tab.name = e.detail.value?.name ?? "";
      this.emit_();
    });

    const inhoud = document.createElement("div");
    inhoud.className = "inhoud";
    inhoud.innerHTML = `${resolve("grid")}<span>Inhoud: <b>${inhoudRegel(tab)}</b> — aan te passen via Code-editor weergeven.</span>`;

    body.append(kiezer, form, inhoud);
    det.appendChild(body);
    return det;
  }

  kopKnop_(titel, svg, onClick) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "rondknop";
    knop.title = titel;
    knop.setAttribute("aria-label", titel);
    knop.innerHTML = svg;
    // Een knop in een `summary` mag het blok niet openklappen.
    knop.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!knop.disabled) onClick();
    });
    return knop;
  }

  /* -------------------------------------------------------- bewerkingen */

  verplaats_(i, richting) {
    const j = i + richting;
    if (j < 0 || j >= this.tabs_.length) return;
    [this.tabs_[i], this.tabs_[j]] = [this.tabs_[j], this.tabs_[i]];
    const iOpen = this.open_.has(`t${i}`);
    const jOpen = this.open_.has(`t${j}`);
    this.open_.delete(`t${i}`);
    this.open_.delete(`t${j}`);
    if (jOpen) this.open_.add(`t${i}`);
    if (iOpen) this.open_.add(`t${j}`);
    this.emit_();
    this.build_();
  }

  verwijder_(i) {
    this.tabs_.splice(i, 1);
    const nieuw = new Set();
    for (const k of this.open_) {
      const n = Number(k.slice(1));
      if (n === i) continue;
      nieuw.add(`t${n > i ? n - 1 : n}`);
    }
    this.open_ = nieuw;
    this.emit_();
    this.build_();
  }

  onthoud_(det, sleutel) {
    det.open = this.open_.has(sleutel);
    det.addEventListener("toggle", () => {
      if (det.open) this.open_.add(sleutel);
      else this.open_.delete(sleutel);
    });
  }

  /* ---------------------------------------------------------------- uit */

  emit_() {
    const tabs = uitgekleed(this.tabs_);
    const config = { ...this.rest_, tabs };
    this.uit_ = JSON.stringify(tabs);
    this.uitObject_ = config;
    for (const kop of this.koppen_ ?? []) kop();
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }
}

meldAan("domotiapp-tabs-card-editor", TabsEditor);
