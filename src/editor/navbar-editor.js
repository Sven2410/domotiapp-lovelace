/**
 * De editor van de navbalk: een lijst knoppen die je kunt bijmaken, verplaatsen
 * en weggooien.
 *
 * Net als bij de entiteitenkaart kan dit geen enkele `ha-form` zijn. Een navbalk
 * is een LIJST van knoppen met elk hun eigen naam, icoon en pad, en `ha-form`
 * kent geen herhalende rij. De trucs die de andere kaarten gebruiken -- platte
 * sleutels als `naam:light.x` -- werken hier niet, want twee knoppen mogen
 * hetzelfde pad hebben en een knop hoeft helemaal geen entiteit te hebben.
 *
 * Wat er hier bovenop komt en bij de entiteitenkaart niet nodig was: VOLGORDE.
 * De volgorde is bij deze kaart betekenisvol -- de eerste knoppen staan in de
 * balk, de rest valt achter "Meer" -- dus er staan pijltjes bij. Boven de lijst
 * loopt een streep die laat zien waar die grens ligt, want anders verplaats je
 * een knop en zie je pas na het opslaan wat er gebeurde.
 *
 * TWEE VALLEN DIE HIER AL EENS GELD KOSTTEN, ALLEBEI OVERGENOMEN
 *
 * 1. Home Assistant BEVRIEST de config die je meestuurt (`deepFreeze` in
 *    `hui-dialog-edit-card`), inclusief de objecten erin. Deel je je eigen
 *    item-objecten uit, dan is elke volgende `item.name = ...` een TypeError in
 *    een stille catch: de eerste letter komt aan en de rest niet. Vandaar dat
 *    `emit_()` kopieen weggeeft.
 * 2. En diezelfde config komt bij ELKE toetsaanslag terug via `setConfig`. Zou
 *    dat een herbouw uitlokken, dan verdwijnt het veld onder je vingers. Daarom
 *    de echo-herkenning: eerst op identiteit, dan op inhoud.
 *
 * Zie `docs/` en de kop van `entities-editor.js` voor het hele verhaal; dit
 * bestand herhaalt de oplossing, niet het onderzoek.
 */

import "./icon-picker.js";
import "./tone-picker.js";
import { meldAan } from "../registratie.js";
import { icons, resolve } from "../icons.js";
import { naamVan } from "./icoon-zoek.js";
import {
  BALK_MAX,
  BALK_MIN,
  ITEMS_MAX,
  SUB_MAX,
  VOORAF,
  voegSubToe,
  asItem,
  gevuld,
  heeftSub,
  klemBalk,
  subVan,
  verdeel,
} from "../cards/navbar-logica.js";

const CSS = `
  .dac-nav { display: flex; flex-direction: column; gap: 12px; }

  .dac-nav .knoppen { display: flex; flex-direction: column; gap: 8px; }

  .dac-nav .item {
    border: 1px solid var(--divider-color); border-radius: 12px;
    background: var(--card-background-color); overflow: hidden;
  }
  .dac-nav .item[open] { border-color: var(--primary-color); }

  .dac-nav .item > summary {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 8px 8px 12px; cursor: pointer; list-style: none;
  }
  .dac-nav .item > summary::-webkit-details-marker { display: none; }
  .dac-nav .item[open] > summary { border-bottom: 1px solid var(--divider-color); }
  .dac-nav .item > summary:hover { background: rgba(127,127,127,.06); }

  .dac-nav .voor {
    flex: 0 0 auto; width: 30px; height: 30px; display: grid; place-items: center;
    border-radius: 9px; background: rgba(127,127,127,.14); color: var(--primary-color);
  }
  .dac-nav .voor svg, .dac-nav .voor ha-icon, .dac-nav .voor img {
    width: 17px; height: 17px; --mdc-icon-size: 17px;
  }

  .dac-nav .titel { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
  .dac-nav .titel b {
    font-size: 13px; font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-nav .titel small {
    font-size: 11.5px; color: var(--secondary-text-color);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-nav .item[data-leeg="true"] .titel b {
    font-weight: 500; font-style: italic; color: var(--secondary-text-color);
  }

  .dac-nav .rondknop {
    flex: 0 0 auto; width: 28px; height: 28px; display: grid; place-items: center;
    cursor: pointer; border: 0; background: transparent; border-radius: 999px;
    color: var(--secondary-text-color); font-size: 15px; line-height: 1;
  }
  .dac-nav .rondknop:hover { background: rgba(127,127,127,.16); }
  .dac-nav .rondknop:disabled { opacity: .3; cursor: default; }
  .dac-nav .rondknop:disabled:hover { background: transparent; }
  .dac-nav .weg:hover { color: var(--error-color, #d03b3b); }

  .dac-nav .body { padding: 10px; display: flex; flex-direction: column; gap: 10px; }

  /* De grens tussen wat in de balk staat en wat achter Meer valt. */
  .dac-nav .grens {
    display: flex; align-items: center; gap: 10px;
    margin: 2px 0; font-size: 11px; font-weight: 600; letter-spacing: .1em;
    text-transform: uppercase; color: var(--secondary-text-color);
  }
  .dac-nav .grens::after {
    content: ""; flex: 1 1 auto; height: 1px; background: var(--divider-color);
  }

  .dac-nav .toevoegen {
    padding: 13px; cursor: pointer; font: inherit; font-size: 14px; font-weight: 500;
    border: 1px dashed var(--divider-color); border-radius: 12px;
    background: transparent; color: var(--primary-color); text-align: center;
  }
  .dac-nav .toevoegen:hover { background: rgba(127,127,127,.08); }
  .dac-nav .toevoegen:disabled { opacity: .4; cursor: default; }

  .dac-nav .uitleg {
    margin: 0; font-size: 12px; line-height: 1.45; color: var(--secondary-text-color);
  }

  /* ---- de subknoppen van een knop ---- */

  .dac-nav .subkop {
    display: flex; align-items: center; gap: 8px;
    margin-top: 2px; font-size: 11px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; color: var(--secondary-text-color);
  }
  .dac-nav .subkop::after {
    content: ""; flex: 1 1 auto; height: 1px; background: var(--divider-color);
  }

  .dac-nav .sublijst { display: flex; flex-direction: column; gap: 6px; }

  .dac-nav .sub {
    border: 1px solid var(--divider-color); border-radius: 10px;
    background: rgba(127,127,127,.05); overflow: hidden;
  }
  .dac-nav .sub > summary {
    display: flex; align-items: center; gap: 9px;
    padding: 6px 6px 6px 10px; cursor: pointer; list-style: none;
    font-size: 12.5px;
  }
  .dac-nav .sub > summary::-webkit-details-marker { display: none; }
  .dac-nav .sub[open] > summary { border-bottom: 1px solid var(--divider-color); }
  .dac-nav .sub > summary:hover { background: rgba(127,127,127,.06); }
  .dac-nav .sub .voor { width: 24px; height: 24px; border-radius: 7px; }
  .dac-nav .sub .voor svg, .dac-nav .sub .voor ha-icon, .dac-nav .sub .voor img {
    width: 14px; height: 14px; --mdc-icon-size: 14px;
  }
  .dac-nav .sub .body { padding: 8px; gap: 8px; }

  .dac-nav .subtoevoegen {
    padding: 9px; cursor: pointer; font: inherit; font-size: 13px;
    border: 1px dashed var(--divider-color); border-radius: 10px;
    background: transparent; color: var(--primary-color); text-align: center;
  }
  .dac-nav .subtoevoegen:hover { background: rgba(127,127,127,.08); }
  .dac-nav .subtoevoegen:disabled { opacity: .4; cursor: default; }

  /* ---- het keuzemenu achter "Subknop toevoegen" ----
     Een gewone details/summary en geen ha-button-menu: dit moet het ook doen
     als Home Assistant zijn menu-element nog niet geladen heeft, en een lijst
     die openklapt is hier net zo duidelijk. */
  .dac-nav .subkeuze { position: relative; }
  .dac-nav .subkeuze > summary {
    display: block; list-style: none;
    padding: 9px; cursor: pointer; font-size: 13px;
    border: 1px dashed var(--divider-color); border-radius: 10px;
    color: var(--primary-color); text-align: center;
  }
  .dac-nav .subkeuze > summary::-webkit-details-marker { display: none; }
  .dac-nav .subkeuze > summary:hover { background: rgba(127,127,127,.08); }
  .dac-nav .subkeuze[vol] > summary { opacity: .4; pointer-events: none; }

  .dac-nav .keuzes {
    display: flex; flex-direction: column; gap: 4px;
    margin-top: 6px; padding: 6px;
    border: 1px solid var(--divider-color); border-radius: 10px;
    background: var(--card-background-color);
  }
  .dac-nav .keuzes button {
    display: flex; align-items: center; gap: 10px; width: 100%;
    padding: 8px 10px; cursor: pointer; text-align: left; font: inherit;
    border: 0; border-radius: 8px; background: transparent;
    color: var(--primary-text-color);
  }
  .dac-nav .keuzes button:hover { background: rgba(127,127,127,.1); }
  .dac-nav .keuzes .voor {
    flex: 0 0 auto; width: 26px; height: 26px; display: grid; place-items: center;
    border-radius: 8px; background: rgba(127,127,127,.12);
  }
  .dac-nav .keuzes .voor svg, .dac-nav .keuzes .voor ha-icon,
  .dac-nav .keuzes .voor img {
    width: 16px; height: 16px; --mdc-icon-size: 16px;
  }
  .dac-nav .keuzes .tekst { display: flex; flex-direction: column; min-width: 0; }
  .dac-nav .keuzes .tekst b { font-size: 13px; font-weight: 500; }
  .dac-nav .keuzes .tekst small { font-size: 11.5px; color: var(--secondary-text-color); }
`;

/**
 * De sleutel van een opengeklapt blok: "i2" voor een knop, "i2s0" voor een
 * subknop eronder. Eén patroon, zodat verplaatsen en verwijderen ze allebei
 * meenemen.
 */
const SLEUTEL = /^i(\d+)(s\d+)?$/;

/** Een knop zonder lege sleutels. Los, want een subknop is dezelfde vorm. */
const kaal = (i) => ({
  ...(i.name ? { name: i.name } : {}),
  ...(i.icon ? { icon: i.icon } : {}),
  ...(i.path ? { path: i.path } : {}),
  // Een voorgedefinieerde knop draagt een hele actieconfig. Vergeet je hem
  // hier, dan overleeft "Herstart Home Assistant" zijn eigen editor niet.
  ...(i.action ? { action: structuredClone(i.action) } : {}),
});

/** Wat er in de YAML komt: geen lege sleutels, en altijd verse objecten. */
const uitgekleed = (items) =>
  items.filter(gevuld).map((i) => {
    const sub = (i.items ?? []).filter(gevuld).map(kaal);
    return { ...kaal(i), ...(sub.length ? { items: sub } : {}) };
  });

class NavbarEditor extends HTMLElement {
  constructor() {
    super();
    this.items_ = [];
    this.rest_ = {};
    // Welke blokken openstaan. Een herbouw mag niet dichtslaan wat je net
    // opengeklapt had.
    this.open_ = new Set();
  }

  setConfig(config) {
    this.rest_ = { ...config };
    delete this.rest_.items;

    // Onze eigen wijziging die via Home Assistant terugkomt, bij elke
    // toetsaanslag. Eerst op identiteit -- HA geeft letterlijk hetzelfde object
    // terug -- en anders op inhoud, voor de gevallen waarin er onderweg een
    // kopie van gemaakt is.
    if (this.gebouwd_ && config === this.uitObject_) return;

    // Geen kale `asItem`: zie de opmerking in navbar-logica.js bij itemsVan.
    const binnen = (Array.isArray(config?.items) ? config.items : []).map((i) => asItem(i));
    if (this.gebouwd_ && JSON.stringify(uitgekleed(binnen)) === this.uit_) return;

    this.items_ = binnen;
    this.build_();
  }

  set hass(hass) {
    this.hass_ = hass;
    // Alleen doorgeven, niet herbouwen: HA duwt hier een nieuw hass-object
    // doorheen bij elke toestandswijziging in huis.
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
    wrap.className = "dac-nav";
    this.append(style, wrap);

    wrap.appendChild(this.kaartBlok_());
    wrap.appendChild(this.kleurKiezer_());

    const lijst = document.createElement("div");
    lijst.className = "knoppen";
    wrap.appendChild(lijst);

    const { balk } = verdeel(this.items_, this.rest_.max);
    const inBalk = balk.length;
    const gevuldeItems = this.items_.filter(gevuld);

    this.items_.forEach((item, i) => {
      // De streep staat vóór de eerste knop die niet meer in de balk past. Op
      // de positie in de GEVULDE lijst, want een half ingevulde knop telt in de
      // kaart niet mee en zou de streep anders verschuiven.
      const plek = gevuldeItems.indexOf(item);
      if (plek === inBalk && gevuldeItems.length > inBalk) {
        const grens = document.createElement("div");
        grens.className = "grens";
        grens.textContent = "Achter de meer-knop";
        lijst.appendChild(grens);
      }
      lijst.appendChild(this.itemBlok_(item, i));
    });

    if (!this.items_.length) {
      const uitleg = document.createElement("p");
      uitleg.className = "uitleg";
      uitleg.textContent =
        "Elke knop heeft een naam, een icoon en een pad -- bijvoorbeeld /lovelace/keuken " +
        "voor een view op dit dashboard, of #keuken voor een pop-up. Wat er niet meer in " +
        "de balk past valt vanzelf achter de meer-knop rechts.";
      wrap.appendChild(uitleg);
    }

    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "toevoegen";
    knop.textContent = "＋  Knop toevoegen";
    knop.disabled = this.items_.length >= ITEMS_MAX;
    knop.addEventListener("click", () => {
      this.items_.push({ name: "", icon: "", path: "" });
      this.open_.add(`i${this.items_.length - 1}`);
      this.emit_();
      this.build_();
    });
    wrap.appendChild(knop);
  }

  /** Wat over de balk als geheel gaat. */
  kaartBlok_() {
    const form = document.createElement("ha-form");
    form.hass = this.hass_;
    form.schema = [
      { name: "max", selector: { number: { min: BALK_MIN, max: BALK_MAX, step: 1, mode: "box" } } },
      { name: "labels", selector: { boolean: {} } },
      { name: "bare", selector: { boolean: {} } },
    ];
    form.computeLabel = (s) =>
      ({
        max: "Knoppen in de balk",
        labels: "Namen onder de iconen",
        bare: "Achtergrond weglaten",
      })[s.name] ?? s.name;
    form.computeHelper = (s) => {
      if (s.name === "max")
        return (
          "De meer-knop telt zelf mee. Staan er meer knoppen dan dit, dan komen de eerste " +
          `${klemBalk(this.rest_.max) - 1} in de balk en valt de rest achter "Meer".`
        );
      if (s.name === "labels")
        return "Uit geeft een rij kale iconen. Dan passen er meer naast elkaar op een telefoon.";
      if (s.name === "bare")
        return "Haalt de pil onder de balk weg: alleen de iconen blijven over, zwevend boven het dashboard.";
      return undefined;
    };
    form.data = {
      max: klemBalk(this.rest_.max),
      labels: this.rest_.labels !== false,
      bare: Boolean(this.rest_.bare),
    };
    form.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      const v = e.detail.value ?? {};
      this.rest_.max = klemBalk(v.max);
      // De standaard hoort niet in de YAML: wat er staat is wat afwijkt.
      if (v.labels === false) this.rest_.labels = false;
      else delete this.rest_.labels;
      if (v.bare) this.rest_.bare = true;
      else delete this.rest_.bare;
      this.emit_();
      // Het aantal in de balk verschuift de grensstreep, dus die moet opnieuw.
      this.build_();
    });
    return form;
  }

  kleurKiezer_() {
    const el = document.createElement("dac-tone-picker");
    el.label = "Kleur";
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

  /* --------------------------------------------------------------- knop */

  itemBlok_(item, i) {
    const det = document.createElement("details");
    det.className = "item";
    this.onthoud_(det, `i${i}`);

    const sum = document.createElement("summary");

    const voor = document.createElement("span");
    voor.className = "voor";

    const titel = document.createElement("span");
    titel.className = "titel";
    const b = document.createElement("b");
    const small = document.createElement("small");
    titel.append(b, small);

    // De kop van een dichtgeklapt blok is het enige dat bijgewerkt moet worden
    // terwijl je typt; hij schrijft in niets waar iemand in staat te typen.
    const kop = () => {
      const leeg = !gevuld(item);
      det.dataset.leeg = String(leeg);
      voor.innerHTML = resolve(item.icon, "grid");
      b.textContent = item.name || (leeg ? "Nieuwe knop" : item.path || "Zonder naam");
      const sub = subVan(item).length;
      // Een knop met een menu gaat nergens heen, dus zijn pad noemen zou
      // liegen. Wat hij wél doet staat er dan: hoeveel knoppen erin zitten.
      small.textContent = sub
        ? `Menu met ${sub} knop${sub === 1 ? "" : "pen"}`
        : item.path
          ? item.path
          : item.icon
            ? `${naamVan(item.icon)} -- nog geen pad`
            : "Nog geen pad";
    };
    kop();
    this.koppen_.push(kop);

    const omhoog = this.kopKnop_("Omhoog", icons.arrowUp, () => this.verplaats_(i, -1));
    omhoog.disabled = i === 0;
    const omlaag = this.kopKnop_("Omlaag", icons.arrowDown, () => this.verplaats_(i, 1));
    omlaag.disabled = i === this.items_.length - 1;
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
    kiezer.value = item.icon;
    kiezer.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      item.icon = e.detail.value ?? "";
      this.emit_();
    });

    const form = document.createElement("ha-form");
    form.hass = this.hass_;
    form.schema = [
      { name: "name", selector: { text: {} } },
      { name: "path", selector: { text: {} } },
    ];
    form.computeLabel = (s) => ({ name: "Naam", path: "Waar gaat hij heen" })[s.name] ?? s.name;
    form.computeHelper = (s) => {
      if (s.name !== "path") return undefined;
      const basis =
        "/lovelace/keuken voor een view, #keuken voor een pop-up van bubble-card, of een https-adres voor iets buiten Home Assistant.";
      // Eerlijk zijn over wat er gebeurt: een knop met subknoppen klapt open en
      // gaat niet naar zijn eigen pad. Twee dingen op één tik (kort tikken
      // navigeert, lang tikken opent) is bediening die niemand vindt.
      return heeftSub(item)
        ? `${basis}

Deze knop heeft subknoppen en klapt dus open in plaats van ergens heen te gaan; zijn eigen pad wordt niet gebruikt.`
        : basis;
    };
    form.data = { name: item.name, path: item.path };
    form.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      const v = e.detail.value ?? {};
      item.name = v.name ?? "";
      item.path = v.path ?? "";
      this.emit_();
    });

    body.append(kiezer, form, ...this.subBlok_(item, i));
    det.appendChild(body);
    return det;
  }

  /* ---------------------------------------------------------- subknoppen */

  /**
   * De knoppen die boven deze knop openklappen.
   *
   * Zelfde vorm als een gewone knop -- naam, icoon, pad -- want dat is wat het
   * is. Het verschil zit in waar hij verschijnt, niet in wat hij kan.
   */
  subBlok_(item, i) {
    if (!Array.isArray(item.items)) item.items = [];

    const kop = document.createElement("div");
    kop.className = "subkop";
    kop.textContent = "Subknoppen";

    const lijst = document.createElement("div");
    lijst.className = "sublijst";
    item.items.forEach((sub, j) => lijst.appendChild(this.subItemBlok_(item, sub, i, j)));

    const knop = this.subKeuze_(item, i);

    const uitleg = document.createElement("p");
    uitleg.className = "uitleg";
    uitleg.textContent =
      "Hangt hier iets onder, dan klapt deze knop een menu open BOVEN zichzelf in " +
      "plaats van ergens heen te gaan. Valt de knop zelf achter de meer-knop, dan " +
      "staan zijn subknoppen daar ingesprongen onder hem.";

    return [kop, lijst, knop, uitleg];
  }

  /**
   * "Subknop toevoegen", met de kant-en-klare knoppen eronder.
   *
   * De eigenaar vroeg er op 27 augustus 2026 om: "ik wil gewoon als ik subknop
   * toevoegen klik een optie hebben om domotitech aan te klikken". Dus is de
   * knop een menu geworden -- eerst de lege, dan wat er kant en klaar is.
   */
  subKeuze_(item, i) {
    const det = document.createElement("details");
    det.className = "subkeuze";
    if (item.items.length >= SUB_MAX) det.setAttribute("vol", "");

    const sum = document.createElement("summary");
    sum.textContent = "＋  Subknop toevoegen";
    det.appendChild(sum);

    const keuzes = document.createElement("div");
    keuzes.className = "keuzes";
    det.appendChild(keuzes);

    const zet = (knop, bovenaan) => {
      const { lijst, plek } = voegSubToe(item.items, knop, bovenaan);
      if (plek < 0) return;
      item.items = lijst;
      this.open_.add(`i${i}`);
      this.open_.add(`i${i}s${plek}`);
      this.emit_();
      this.build_();
      // En in beeld brengen. Zonder dit blijft de schuifbalk staan waar hij
      // stond, en dan lijkt het alsof er ergens anders iets is bijgekomen.
      requestAnimationFrame(() => {
        this.querySelectorAll("details.sub")[plek]?.scrollIntoView({ block: "nearest" });
      });
    };

    keuzes.appendChild(
      this.keuzeKnop_("plus", "Lege subknop", "Zelf een naam, een icoon en een pad invullen.", () =>
        // ACHTERAAN, in de volgorde waarin je ze maakt. Gemeld op 26 augustus 2026.
        zet({ name: "", icon: "", path: "", action: null, items: [] }, false),
      ),
    );

    for (const v of VOORAF) {
      const gemaakt = v.maak();
      keuzes.appendChild(
        this.keuzeKnop_(gemaakt.icon, v.label, v.uitleg, () => zet(v.maak(), v.bovenaan)),
      );
    }

    return det;
  }

  /** Een regel in dat menu: icoon, naam, en een zin over wat hij doet. */
  keuzeKnop_(icoon, label, uitleg, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    const voor = document.createElement("span");
    voor.className = "voor";
    voor.innerHTML = resolve(icoon, "plus");
    const tekst = document.createElement("span");
    tekst.className = "tekst";
    const naam = document.createElement("b");
    naam.textContent = label;
    const klein = document.createElement("small");
    klein.textContent = uitleg;
    tekst.append(naam, klein);
    b.append(voor, tekst);
    b.addEventListener("click", onClick);
    return b;
  }

  subItemBlok_(ouder, sub, i, j) {
    const det = document.createElement("details");
    det.className = "sub";
    this.onthoud_(det, `i${i}s${j}`);

    const sum = document.createElement("summary");
    const voor = document.createElement("span");
    voor.className = "voor";
    const titel = document.createElement("span");
    titel.className = "titel";
    const b = document.createElement("b");
    const small = document.createElement("small");
    titel.append(b, small);

    const kop = () => {
      voor.innerHTML = resolve(sub.icon, "grid");
      b.textContent = sub.name || (gevuld(sub) ? sub.path || "Zonder naam" : "Nieuwe subknop");
      small.textContent = sub.action
        ? `Roept ${sub.action.perform_action ?? sub.action.service ?? sub.action.action} aan`
        : sub.path || "Nog geen pad";
    };
    kop();
    this.koppen_.push(kop);

    const omhoog = this.kopKnop_("Omhoog", icons.arrowUp, () => this.verplaatsSub_(ouder, i, j, -1));
    omhoog.disabled = j === 0;
    const omlaag = this.kopKnop_("Omlaag", icons.arrowDown, () =>
      this.verplaatsSub_(ouder, i, j, 1),
    );
    omlaag.disabled = j === ouder.items.length - 1;
    const weg = this.kopKnop_("Verwijderen", icons.close, () => this.verwijderSub_(ouder, i, j));
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
    kiezer.value = sub.icon;
    kiezer.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      sub.icon = e.detail.value ?? "";
      this.emit_();
    });

    const form = document.createElement("ha-form");
    form.hass = this.hass_;
    form.schema = [
      { name: "name", selector: { text: {} } },
      { name: "path", selector: { text: {} } },
    ];
    form.computeLabel = (s) => ({ name: "Naam", path: "Waar gaat hij heen" })[s.name] ?? s.name;
    // Een kant-en-klare knop DOET iets in plaats van ergens heen te gaan. Zijn
    // pad wordt dan niet gebruikt, en een veld dat niets doet is een veld waar
    // je aan blijft zitten.
    if (sub.action) {
      form.schema = [{ name: "name", selector: { text: {} } }];
      form.computeHelper = (s) =>
        s.name === "name"
          ? `Deze knop voert een actie uit (${
              sub.action.perform_action ?? sub.action.service ?? sub.action.action
            }) en gaat dus nergens heen. Weg met de knop rechtsboven.`
          : undefined;
    }
    form.data = { name: sub.name, path: sub.path };
    form.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      const v = e.detail.value ?? {};
      sub.name = v.name ?? "";
      sub.path = v.path ?? "";
      this.emit_();
    });

    body.append(kiezer, form);
    det.appendChild(body);
    return det;
  }

  verplaatsSub_(ouder, i, j, richting) {
    const k = j + richting;
    if (k < 0 || k >= ouder.items.length) return;
    [ouder.items[j], ouder.items[k]] = [ouder.items[k], ouder.items[j]];
    const jOpen = this.open_.has(`i${i}s${j}`);
    const kOpen = this.open_.has(`i${i}s${k}`);
    this.open_.delete(`i${i}s${j}`);
    this.open_.delete(`i${i}s${k}`);
    if (kOpen) this.open_.add(`i${i}s${j}`);
    if (jOpen) this.open_.add(`i${i}s${k}`);
    this.emit_();
    this.build_();
  }

  verwijderSub_(ouder, i, j) {
    ouder.items.splice(j, 1);
    // Dezelfde val als bij de knoppen zelf: de sleutels zijn nummers, dus
    // zonder dit erft subknop 3 de open-stand van zijn weggegooide buurman.
    const nieuw = new Set();
    for (const k of this.open_) {
      const m = /^i(\d+)s(\d+)$/.exec(k);
      if (!m || Number(m[1]) !== i) {
        nieuw.add(k);
        continue;
      }
      const n = Number(m[2]);
      if (n === j) continue;
      nieuw.add(`i${i}s${n > j ? n - 1 : n}`);
    }
    this.open_ = nieuw;
    this.emit_();
    this.build_();
  }

  kopKnop_(titel, svg, onClick) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "rondknop";
    knop.title = titel;
    knop.setAttribute("aria-label", titel);
    knop.innerHTML = svg;
    // Een knop in een `summary` mag het blok niet openklappen: de browser ziet
    // elke klik in een samenvatting als een klik op de samenvatting.
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
    if (j < 0 || j >= this.items_.length) return;
    [this.items_[i], this.items_[j]] = [this.items_[j], this.items_[i]];
    this.schuifOpen_(i, j);
    this.emit_();
    this.build_();
  }

  verwijder_(i) {
    this.items_.splice(i, 1);
    // De sleutels zijn nummers, dus zonder dit erft knop 3 na het verwijderen
    // van knop 2 de open-stand van zijn buurman. Sinds er subknoppen zijn, zit
    // er ook een tweede nummer in ("i2s0"), en dat moet mee verschuiven --
    // `Number("i2s0".slice(1))` is NaN, en dan verdwenen ze allemaal.
    const nieuw = new Set();
    for (const k of this.open_) {
      const m = SLEUTEL.exec(k);
      if (!m) continue;
      const n = Number(m[1]);
      if (n === i) continue;
      nieuw.add(`i${n > i ? n - 1 : n}${m[2] ?? ""}`);
    }
    this.open_ = nieuw;
    this.emit_();
    this.build_();
  }

  /** Twee blokken wisselen van plek, dus hun open-stand wisselt mee. */
  schuifOpen_(i, j) {
    // Alles wat bij knop i hoort gaat mee naar j en andersom -- het blok zelf
    // ("i2") én de subblokken erin ("i2s0", "i2s1"). Zonder dat laatste blijft
    // een opengeklapte subknop achter bij de knop die er niet meer is.
    const nieuw = new Set();
    for (const k of this.open_) {
      const m = SLEUTEL.exec(k);
      if (!m) continue;
      const n = Number(m[1]);
      const staart = m[2] ?? "";
      if (n === i) nieuw.add(`i${j}${staart}`);
      else if (n === j) nieuw.add(`i${i}${staart}`);
      else nieuw.add(k);
    }
    this.open_ = nieuw;
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
    const items = uitgekleed(this.items_);
    const config = { ...this.rest_, items };

    // Onthouden wat we wegschreven, zodat we onze eigen echo herkennen.
    this.uit_ = JSON.stringify(items);
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

meldAan("domotiapp-navbar-card-editor", NavbarEditor);
