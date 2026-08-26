/**
 * De editor van de tabbladenkaart: de tabs zelf, in volgorde.
 *
 * Wat hier WEL kan: een tab bijmaken, hernoemen, een icoon geven, verplaatsen
 * en weggooien. Dat is de vorm van de kaart, en dat is wat je vaak doet.
 *
 * En sinds 26 augustus 2026: de KAART die in een tab zit. Dat kon hier eerst
 * niet -- de kaartkiezer van Home Assistant is intern -- en de eigenaar wilde
 * het toch: "Kan je de tablad editor niet zo maken dat ik Kaarten kan toevoegen
 * zoals de gewone Home Assistant UI editor?"
 *
 * Het is een taakverdeling geworden: kiezen doet een eigen lijst, bewerken doet
 * `hui-card-element-editor` van Home Assistant zelf -- met de GUI van de kaart
 * en de knop naar de code-editor erin. Zie `kaartkiezer.js` voor wat er gemeten
 * is en waarom het zo verdeeld is.
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
import {
  beginConfig,
  filterSoorten,
  heeftKaartEditor,
  kaartsoorten,
} from "./kaartkiezer.js";
import { heeftHaGereedschap, kiesKaartViaHa, naarKlembord, pasToe } from "./kaartenlijst.js";

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

  /* ---- de kaart in een tab ---- */

  .dac-tabs .kaartkop {
    display: flex; align-items: center; gap: 8px;
    font-size: 12.5px; color: var(--secondary-text-color);
  }
  .dac-tabs .kaartkop b {
    flex: 1 1 auto; min-width: 0; color: var(--primary-text-color); font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-tabs .kaartkop button {
    flex: 0 0 auto; padding: 5px 10px; cursor: pointer; font: inherit; font-size: 12px;
    border: 1px solid var(--divider-color); border-radius: 999px;
    background: transparent; color: var(--primary-color);
  }
  .dac-tabs .kaartkop button:hover { background: rgba(127,127,127,.10); }
  .dac-tabs .kaartkop button.weg { color: var(--error-color, #d03b3b); }

  .dac-tabs .kaartvak { display: flex; flex-direction: column; gap: 10px; }

  /* De kaarten zoals ze er echt uitzien, met de overlay van Home Assistant
     eromheen. De ruimte tussen twee kaarten is dezelfde die een sectie
     aanhoudt, zodat de voorbeeldweergave klopt met wat je straks ziet. */
  .dac-tabs .dac-kaarten { display: flex; flex-direction: column; gap: 8px; }
  .dac-tabs .dac-kaart { position: relative; }
  /* Slepen mag niet als tekstselectie beginnen. */
  .dac-tabs .dac-kaart { user-select: none; -webkit-user-select: none; }

  .dac-tabs .bewerkvak {
    border: 1px solid var(--primary-color); border-radius: 10px;
    background: rgba(127,127,127,.05); overflow: hidden;
  }
  .dac-tabs .bewerkvak > .kop {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 8px 8px 12px;
    border-bottom: 1px solid var(--divider-color);
    font-size: 12.5px; color: var(--secondary-text-color);
  }
  .dac-tabs .bewerkvak > .kop b {
    flex: 1 1 auto; min-width: 0; color: var(--primary-text-color); font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-tabs .bewerkvak > .kop button {
    flex: 0 0 auto; padding: 5px 10px; cursor: pointer; font: inherit; font-size: 12px;
    border: 1px solid var(--divider-color); border-radius: 999px;
    background: transparent; color: var(--primary-color);
  }
  .dac-tabs .bewerkvak > .body { padding: 8px; }

  .dac-tabs .subkop {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; color: var(--secondary-text-color);
  }
  .dac-tabs .subkop::after {
    content: ""; flex: 1 1 auto; height: 1px; background: var(--divider-color);
  }

  .dac-tabs .sub {
    border: 1px solid var(--divider-color); border-radius: 10px;
    background: rgba(127,127,127,.05); overflow: hidden;
  }
  .dac-tabs .sub > summary {
    display: flex; align-items: center; gap: 9px;
    padding: 6px 6px 6px 10px; cursor: pointer; list-style: none;
  }
  .dac-tabs .sub > summary::-webkit-details-marker { display: none; }
  .dac-tabs .sub[open] > summary { border-bottom: 1px solid var(--divider-color); }
  .dac-tabs .sub > summary:hover { background: rgba(127,127,127,.06); }
  .dac-tabs .sub .voor { width: 24px; height: 24px; border-radius: 7px; }
  .dac-tabs .sub .voor svg, .dac-tabs .sub .voor ha-icon {
    width: 14px; height: 14px; --mdc-icon-size: 14px;
  }
  .dac-tabs .sub .titel b { font-size: 12.5px; }
  .dac-tabs .sub .body { padding: 8px; }
  .dac-tabs .kiezer { display: flex; flex-direction: column; gap: 8px; }
  .dac-tabs .kiezer input {
    width: 100%; box-sizing: border-box; padding: 9px 11px;
    font: inherit; font-size: 13.5px;
    color: var(--primary-text-color);
    background-color: var(--card-background-color);
    border: 1px solid var(--divider-color); border-radius: 10px;
  }
  .dac-tabs .soorten {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px;
    max-height: 260px; overflow-y: auto; padding: 2px;
  }
  .dac-tabs .soort {
    display: flex; flex-direction: column; gap: 2px; align-items: flex-start;
    padding: 8px 10px; cursor: pointer; text-align: left; font: inherit;
    border: 1px solid var(--divider-color); border-radius: 10px;
    background: transparent; color: var(--primary-text-color);
  }
  .dac-tabs .soort:hover { background: rgba(127,127,127,.10); border-color: var(--primary-color); }
  .dac-tabs .soort b { font-size: 13px; font-weight: 600; }
  .dac-tabs .soort small {
    font-size: 11px; color: var(--secondary-text-color);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .dac-tabs .leeg { font-size: 12.5px; color: var(--secondary-text-color); }
`;

/** Wat er in de YAML komt: geen lege sleutels, en altijd verse objecten. */
const uitgekleed = (tabs) =>
  tabs.filter(gevuld).map((t) => ({
    ...(t.name ? { name: t.name } : {}),
    ...(t.icon ? { icon: t.icon } : {}),
    // Verse kopieën, want Home Assistant BEVRIEST wat er langskomt: geef je
    // hetzelfde object terug dat je van hem kreeg, dan is de eerstvolgende
    // wijziging in de kaarteditor een TypeError in een stille catch.
    //
    // Altijd `cards` en nooit meer `card`: een tab draagt een lijst. Een
    // bestaande config met `card` wordt bij het inlezen omgezet (zie asTab) en
    // komt er hier dus als lijst weer uit.
    ...(t.cards?.length ? { cards: t.cards.map((k) => structuredClone(k)) } : {}),
  }));

/** De naam van één kaart, zonder het voorvoegsel dat niemand leest. */
function kaartNaam(kaart) {
  const type = String(kaart?.type ?? "").replace(/^custom:/, "");
  if (!type) return "een kaart";
  // De custom kaarten melden zichzelf aan met een leesbare naam; die is beter
  // dan hun tagnaam.
  const bekend = (window.customCards ?? []).find((c) => c?.type === type);
  return bekend?.name || type;
}

/** Waar een tab naar wijst, in één regel. */
function inhoudRegel(tab) {
  const n = tab.cards?.length ?? 0;
  if (!n) return "Nog geen kaart";
  if (n === 1) return kaartNaam(tab.cards[0]);
  return `${n} kaarten`;
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
    for (const el of this.querySelectorAll(
      "ha-form, dac-icon-picker, dac-tone-picker, hui-card-element-editor",
    )) {
      el.hass = hass;
    }
    if (!this.gebouwd_) this.build_();
  }

  get hass() {
    return this.hass_;
  }

  /**
   * Home Assistant zet dit op de config-editor -- maar alleen als de
   * eigenschap BESTAAT: `hui-element-editor` doet `if ("lovelace" in
   * configElement)`. Op een kale HTMLElement is dat false, en dan krijgen we
   * hem nooit. Vandaar dit paar, dat verder alleen doorgeeft.
   *
   * `hui-card-element-editor` heeft hem nodig om de editor van sommige kaarten
   * te bouwen -- die kijken naar de rest van het dashboard.
   */
  set lovelace(lovelace) {
    this.lovelace_ = lovelace;
    for (const el of this.querySelectorAll("hui-card-element-editor")) el.lovelace = lovelace;
  }

  get lovelace() {
    return this.lovelace_;
  }

  connectedCallback() {
    if (!this.gebouwd_) this.build_();
  }

  /* ------------------------------------------------------------- opbouw */

  async build_() {
    if (!this.hass_) return;
    await customElements.whenDefined("ha-form");
    // De kaarthelpers van Home Assistant; hiermee worden de kaarten in de
    // lijst getekend. Eén keer ophalen en bewaren, want `build_` draait bij
    // elke wijziging.
    if (!this.helpers_) {
      try {
        this.helpers_ = await window.loadCardHelpers?.();
      } catch {
        this.helpers_ = null;
      }
    }
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


    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "toevoegen";
    knop.textContent = "＋  Tabblad toevoegen";
    knop.disabled = this.tabs_.length >= TABS_MAX;
    knop.addEventListener("click", () => {
      this.tabs_.push({ name: "", icon: "", cards: [] });
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

    body.append(kiezer, form, this.inhoudBlok_(tab, i));
    det.appendChild(body);
    return det;
  }

  /* ------------------------------------------------- de kaart in een tab */

  /**
   * Het blok waarin de kaart van deze tab gekozen en bewerkt wordt.
   *
   * Drie standen, en welke je krijgt hangt af van wat er is:
   *
   *   geen kaart       -> de kiezer, of een knop die hem opent
   *   een kaart        -> de editor van Home Assistant, met een kop erboven
   *   geen kaarteditor -> de oude tekst: dan is de code-editor de weg
   *
   * Die laatste is geen theorie. `hui-card-element-editor` wordt lui geladen;
   * in de bewerkdialoog is hij er (gemeten op 26 augustus 2026), maar deze
   * editor kan ook ergens anders staan, en dan is een zin die uitlegt wat je
   * moet doen beter dan een leeg vak.
   */
  inhoudBlok_(tab, i) {
    const blok = document.createElement("div");
    blok.className = "kaartvak";
    if (!Array.isArray(tab.cards)) tab.cards = [];

    if (!heeftKaartEditor()) {
      const uitleg = document.createElement("div");
      uitleg.className = "inhoud";
      uitleg.innerHTML = `${resolve("grid")}<span>Inhoud: <b>${inhoudRegel(tab)}</b> — aan te passen via Code-editor weergeven.</span>`;
      blok.appendChild(uitleg);
      return blok;
    }

    // MET het gereedschap van Home Assistant staat de lijst in het VOORBEELD,
    // rechts in de dialoog -- daar waar de tab ook echt is. De kaart tekent hem
    // daar zelf (zie tabs-card.js); hier staat alleen een regel die zegt waar
    // je moet kijken, plus de editor van de kaart die je aan het bewerken bent.
    if (heeftHaGereedschap()) {
      const wijs = document.createElement("div");
      wijs.className = "inhoud";
      wijs.innerHTML = `${resolve("grid")}<span>${
        tab.cards.length
          ? `<b>${inhoudRegel(tab)}</b> — te bewerken in het voorbeeld hiernaast: slepen om te verplaatsen, het potlood om te bewerken.`
          : "Nog geen kaart — voeg er een toe in het voorbeeld hiernaast."
      }</span>`;
      blok.appendChild(wijs);

      // De kaart die op dit moment bewerkt wordt. Eén tegelijk: het potlood
      // wijst er maar één aan.
      if (this.bewerkt_?.tab === i && tab.cards[this.bewerkt_.index]) {
        blok.appendChild(this.bewerkVak_(tab, i, this.bewerkt_.index));
      }
      return blok;
    }

    if (tab.cards.length) {
      const kop = document.createElement("div");
      kop.className = "subkop";
      kop.textContent = tab.cards.length === 1 ? "Kaart" : `${tab.cards.length} kaarten`;
      blok.appendChild(kop);
      tab.cards.forEach((kaart, j) => blok.appendChild(this.kaartBlok2_(tab, kaart, i, j)));
    }

    if (this.kiest_ === `t${i}`) {
      blok.appendChild(this.kiezerBlok_(tab, i));
      return blok;
    }

    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "toevoegen";
    knop.textContent = "＋  Kaart toevoegen";
    knop.addEventListener("click", () => {
      this.kiest_ = `t${i}`;
      this.zoek_ = "";
      this.build_();
    });
    blok.appendChild(knop);
    return blok;
  }

  /**
   * Wat het voorbeeld terugmeldt.
   *
   * De kaart in het voorbeeld tekent de lijst en vangt de gebeurtenissen van
   * Home Assistant op; wat eruit komt landt hier. De kaart weet niets van de
   * config -- die staat hier -- en deze editor weet niets van de overlay.
   */
  uitVoorbeeld(i, soort, gegevens) {
    const tab = this.tabs_[i];
    if (!tab) return;
    if (soort === "toevoegen") {
      this.voegToeViaHa_(tab, i);
      return;
    }
    this.kaartActie_(tab, i, soort, gegevens);
  }

  /**
   * Alleen het blok waarin een kaart bewerkt wordt opnieuw zetten.
   *
   * Niet `build_()`: die gooit de hele editor weg, en dan verlies je je plek en
   * je focus. Zie de opmerking bij `config-changed` verderop -- dat was de
   * klacht "dan word ik er weer uit gegooid".
   */
  toonBewerkVak_() {
    const oud = this.querySelector(".bewerkvak");
    const i = this.bewerkt_?.tab;
    const j = this.bewerkt_?.index;
    const tab = Number.isInteger(i) ? this.tabs_[i] : null;

    if (!tab || !tab.cards[j]) {
      oud?.remove();
      return;
    }
    const nieuw = this.bewerkVak_(tab, i, j);
    if (oud) oud.replaceWith(nieuw);
    else this.querySelectorAll(".kaartvak")[i]?.appendChild(nieuw);
    nieuw.scrollIntoView({ block: "nearest" });
  }

  /**
   * Wat het menu, het potlood of een sleepbeweging betekent.
   *
   * Twee dingen die geen lijstwijziging zijn staan hier; de rest is
   * indexrekenwerk en dat staat in `pasToe` -- zonder DOM, met tests eronder.
   */
  kaartActie_(tab, i, soort, gegevens) {
    if (soort === "bewerk") {
      this.bewerkt_ = { tab: i, index: gegevens.index };
      // Alleen het bewerkblok verversen, en de tab openklappen als hij dicht
      // stond -- een herbouw van de hele editor zou de schuifbalk terugzetten
      // en het blok buiten beeld laten openen. Dat las als "hij doet niets".
      this.open_.add(`t${i}`);
      const det = this.querySelectorAll("details.tab")[i];
      if (det) det.open = true;
      this.toonBewerkVak_();
      return;
    }
    if (soort === "kopieer") {
      // Knippen is bij Home Assistant kopiëren én verwijderen; die twee
      // gebeurtenissen komen allebei langs, dus hier alleen het kopiëren.
      naarKlembord(tab.cards[gegevens.index]);
      return;
    }

    const nieuw = pasToe(tab.cards, soort, gegevens);
    if (!nieuw) return;
    tab.cards = nieuw;
    // De kaart die openstond kan van plek zijn veranderd of weg zijn; het
    // bewerkvak sluit daarom, in plaats van de verkeerde kaart te tonen.
    this.bewerkt_ = null;
    this.emit_();
    this.build_();
  }

  /** Het blok waarin één kaart bewerkt wordt. */
  bewerkVak_(tab, i, j) {
    const vak = document.createElement("div");
    vak.className = "bewerkvak";

    const kop = document.createElement("div");
    kop.className = "kop";
    const naam = document.createElement("b");
    naam.textContent = kaartNaam(tab.cards[j]);
    const dicht = document.createElement("button");
    dicht.type = "button";
    dicht.textContent = "Klaar";
    dicht.addEventListener("click", () => {
      this.bewerkt_ = null;
      this.build_();
    });
    kop.append(naam, dicht);

    const body = document.createElement("div");
    body.className = "body";

    const editor = document.createElement("hui-card-element-editor");
    editor.hass = this.hass_;
    if (this.lovelace_) editor.lovelace = this.lovelace_;
    editor.value = tab.cards[j];
    // DE VAL: `hui-card-element-editor` vuurt `config-changed`, en dat is
    // precies de gebeurtenis waarmee wij onze eigen config aan de dialoog
    // doorgeven. Laat je hem doorborrelen, dan denkt Home Assistant dat de
    // tabbladenkaart zelf van type veranderd is en overschrijft hij alles.
    editor.addEventListener("config-changed", (e) => {
      e.stopPropagation();
      const verse = e.detail?.config;
      if (!verse) return;
      tab.cards[j] = verse;
      this.emit_();
      naam.textContent = kaartNaam(verse);
      // EN VERDER NIETS. Hier stond een herbouw van de hele editor, met een
      // wachttijd van 700ms erop. Dat is precies wat de eigenaar meldde als
      // "dan word ik er weer uit gegooid": elke toetsaanslag in dit veld gooide
      // 700ms later de hele editor weg en bouwde hem opnieuw op -- met een
      // verse hui-card-element-editor, zonder focus, en met de schuifbalk
      // terug bovenaan.
      //
      // Het hoeft ook niet: het VOORBEELD wordt door Home Assistant zelf
      // opnieuw getekend zodra de config verandert, en daar staat de lijst.
    });
    editor.addEventListener("GUImode-changed", (e) => e.stopPropagation());

    body.appendChild(editor);
    vak.append(kop, body);
    return vak;
  }

  /** De echte kaartkiezer van Home Assistant, met wat eruit komt. */
  async voegToeViaHa_(tab, i) {
    const uit = await kiesKaartViaHa({ hass: this.hass_, kaarten: tab.cards });
    if (!uit) return;

    if (uit.kaarten) {
      // De weg via een entiteit: Home Assistant heeft de lijst zelf bijgewerkt.
      tab.cards = uit.kaarten;
      this.bewerkt_ = null;
    } else {
      tab.cards.push(uit.kaart);
      // Meteen open: je hebt hem net gekozen, dus je wilt hem invullen.
      this.bewerkt_ = { tab: i, index: tab.cards.length - 1 };
    }
    this.open_.add(`t${i}`);
    this.emit_();
    this.build_();
  }

  /**
   * Eén kaart uit een tab: de kop met zijn knoppen, en de editor eronder.
   *
   * Een uitklapblok en geen open editor, want een tab mag meerdere kaarten
   * dragen en drie editors onder elkaar is geen scherm meer. Dicht zie je wat
   * erin zit en in welke volgorde; open bewerk je er één.
   */
  kaartBlok2_(tab, kaart, i, j) {
    const det = document.createElement("details");
    det.className = "sub";
    this.onthoud_(det, `t${i}k${j}`);

    const sum = document.createElement("summary");
    const voor = document.createElement("span");
    voor.className = "voor";
    voor.innerHTML = resolve("grid");
    const titel = document.createElement("span");
    titel.className = "titel";
    const b = document.createElement("b");
    b.textContent = kaartNaam(kaart);
    const small = document.createElement("small");
    small.textContent = String(kaart?.type ?? "");
    titel.append(b, small);

    const omhoog = this.kopKnop_("Omhoog", icons.arrowUp, () => this.verplaatsKaart_(tab, i, j, -1));
    omhoog.disabled = j === 0;
    const omlaag = this.kopKnop_("Omlaag", icons.arrowDown, () =>
      this.verplaatsKaart_(tab, i, j, 1),
    );
    omlaag.disabled = j === tab.cards.length - 1;
    const weg = this.kopKnop_("Verwijderen", icons.close, () => this.verwijderKaart_(tab, i, j));
    weg.classList.add("weg");

    sum.append(voor, titel, omhoog, omlaag, weg);
    det.appendChild(sum);

    const body = document.createElement("div");
    body.className = "body";

    const editor = document.createElement("hui-card-element-editor");
    editor.hass = this.hass_;
    if (this.lovelace_) editor.lovelace = this.lovelace_;
    editor.value = kaart;
    // DE VAL: `hui-card-element-editor` vuurt `config-changed`, en dat is
    // precies de gebeurtenis waarmee wij onze eigen config aan de dialoog
    // doorgeven. Laat je hem doorborrelen, dan denkt Home Assistant dat de
    // tabbladenkaart zelf van type veranderd is en overschrijft hij alles.
    editor.addEventListener("config-changed", (e) => {
      e.stopPropagation();
      const verse = e.detail?.config;
      if (!verse) return;
      tab.cards[j] = verse;
      this.emit_();
      b.textContent = kaartNaam(verse);
      small.textContent = String(verse.type ?? "");
    });
    // Idem voor de GUI/YAML-schakelaar: die hoort bij DEZE editor en niet bij
    // de dialoog eromheen.
    editor.addEventListener("GUImode-changed", (e) => e.stopPropagation());

    body.appendChild(editor);
    det.appendChild(body);
    return det;
  }

  verplaatsKaart_(tab, i, j, richting) {
    const k = j + richting;
    if (k < 0 || k >= tab.cards.length) return;
    [tab.cards[j], tab.cards[k]] = [tab.cards[k], tab.cards[j]];
    const jOpen = this.open_.has(`t${i}k${j}`);
    const kOpen = this.open_.has(`t${i}k${k}`);
    this.open_.delete(`t${i}k${j}`);
    this.open_.delete(`t${i}k${k}`);
    if (kOpen) this.open_.add(`t${i}k${j}`);
    if (jOpen) this.open_.add(`t${i}k${k}`);
    this.emit_();
    this.build_();
  }

  verwijderKaart_(tab, i, j) {
    tab.cards.splice(j, 1);
    // Dezelfde val als overal waar de sleutels nummers zijn: zonder dit erft
    // kaart 3 de open-stand van zijn weggegooide buurman.
    const nieuw = new Set();
    for (const sleutel of this.open_) {
      const m = new RegExp(`^t${i}k(\\d+)$`).exec(sleutel);
      if (!m) {
        nieuw.add(sleutel);
        continue;
      }
      const n = Number(m[1]);
      if (n === j) continue;
      nieuw.add(`t${i}k${n > j ? n - 1 : n}`);
    }
    this.open_ = nieuw;
    this.emit_();
    this.build_();
  }

  /** De lijst met kaarttypes, met een zoekveld erboven. */
  kiezerBlok_(tab, i) {
    const vak = document.createElement("div");
    vak.className = "kiezer";

    const zoek = document.createElement("input");
    zoek.type = "text";
    zoek.placeholder = "Zoek een kaart...";
    zoek.value = this.zoek_ ?? "";

    const lijst = document.createElement("div");
    lijst.className = "soorten";

    const teken = () => {
      const gevonden = filterSoorten(kaartsoorten(), this.zoek_);
      lijst.replaceChildren();
      if (!gevonden.length) {
        const leeg = document.createElement("p");
        leeg.className = "leeg";
        leeg.textContent = "Niets gevonden. Kies iets anders, of gebruik de code-editor.";
        lijst.appendChild(leeg);
        return;
      }
      for (const soort of gevonden) {
        const knop = document.createElement("button");
        knop.type = "button";
        knop.className = "soort";
        const b = document.createElement("b");
        b.textContent = soort.naam;
        const small = document.createElement("small");
        small.textContent = soort.uitleg || soort.type;
        knop.append(b, small);
        knop.addEventListener("click", async () => {
          tab.cards.push(await beginConfig(soort.type, this.hass_));
          this.kiest_ = null;
          this.open_.add(`t${i}`);
          // De nieuwe kaart staat open: je hebt hem net gekozen, dus je wilt
          // hem meteen invullen.
          this.open_.add(`t${i}k${tab.cards.length - 1}`);
          this.emit_();
          this.build_();
        });
        lijst.appendChild(knop);
      }
    };
    teken();

    // Niet herbouwen bij elke toetsaanslag: dan verdwijnt het veld onder je
    // vingers -- dezelfde val als bij de config zelf. Alleen de lijst wordt
    // hertekend; het veld blijft staan.
    zoek.addEventListener("input", () => {
      this.zoek_ = zoek.value;
      teken();
    });

    const stop = document.createElement("button");
    stop.type = "button";
    stop.className = "toevoegen";
    stop.textContent = "Annuleren";
    stop.addEventListener("click", () => {
      this.kiest_ = null;
      this.build_();
    });

    vak.append(zoek, lijst, stop);
    return vak;
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
