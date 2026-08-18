/**
 * De editor van de entiteitenkaart: rijen die dichtklappen, en per entiteit
 * alles eronder.
 *
 * De vorige opzet zette eerst alle entiteiten onder elkaar en daarna alle
 * instellingen van die entiteiten er weer onder. Bij twee entiteiten viel dat
 * nog te volgen; bij zes stond je te tellen welk vierde blok bij welke vierde
 * regel hoorde. Wat je instelt hoort te staan waar het over gaat, dus zit nu
 * elke entiteit in een eigen uitklapblok met zijn eigen kiezer, naam, icoon,
 * kleur, status en tikgedrag erin.
 *
 * En een rij zelf klapt ook dicht. Dat is niet alleen netjes: het is het enige
 * dat een kaart van vier rijen met elf entiteiten nog te overzien houdt. Je
 * klapt de rij dicht waar je klaar mee bent en begint aan de volgende. Vandaar
 * ook dat een verse kaart met niets meer opent dan één knop: rij toevoegen.
 *
 * Het kolomaantal ís het aantal plekken. Twee kolommen is twee entiteiten, niet
 * twee entiteiten naast elkaar met een derde eronder -- dat laatste is wat een
 * tweede rij is. Daarom staat er geen "entiteit toevoegen" meer: de plekken
 * staan er al, en er is er nooit één meer dan er kolommen zijn. Wat er bij het
 * verlagen niet meer past wordt binnen deze sessie bewaard, zodat je van drie
 * naar twee en terug kunt zonder je werk kwijt te zijn.
 *
 * Dit is de enige editor in de familie die niet één `ha-form` is, en dat is geen
 * luxe. De config is genest -- rijen met items met eigen instellingen -- en
 * `ha-form` kent geen herhalende rij. De andere kaarten omzeilen dat met platte
 * sleutels (`naam:light.x`), maar dat werkt alleen zolang er één lijst is. Bij
 * twee rijen die dezelfde entiteit mogen bevatten loopt die truc vast.
 *
 * DE VAL DIE HIER STOND, EN WAAROM ALLES ERAAN HING
 *
 * Home Assistant BEVRIEST de config die je hem geeft. `hui-dialog-edit-card`
 * doet `deepFreeze(ev.detail.config)` op precies het object dat wij meesturen --
 * en daar zaten onze eigen item-objecten in, want `filter()` maakt wel een
 * nieuwe lijst maar geen nieuwe items. Vanaf de tweede wijziging was elke
 * `item.name = ...` dus een `TypeError: Cannot add property name, object is not
 * extensible`. De eerste wijziging kwam aan, de rest liep dood in een stille
 * fout: één letter in het naamveld, één icoon dat bleef hangen, een schakelaar
 * die terugsprong. Daarom geeft `emit_()` nu kopieën weg en houden we onze eigen
 * objecten voor onszelf.
 *
 * En Home Assistant duwt die config bij ELKE toetsaanslag terug via `setConfig`
 * (`hui-element-editor._handleUIConfigChanged` -> `value` -> `setConfig`). Zou
 * de editor daarop opnieuw opbouwen, dan verdwijnt het invoerveld onder je
 * vingers en komt alleen de eerste letter aan. Vandaar de echo-herkenning
 * hieronder: eerst op identiteit, want HA geeft letterlijk hetzelfde object
 * terug, en anders op inhoud.
 *
 * Wat NIET nodig is: de velden terugschrijven. `ha-form` houdt zijn eigen `data`
 * bij (`this.data = {...this.data, ...newValue}`) en onze twee kiezers doen dat
 * ook. Alleen de koppen -- de samenvatting van een dichtgeklapte rij -- moeten
 * bijgewerkt worden, en die schrijven in niets waar iemand in staat te typen.
 */

import "./icon-picker.js";
import "./tone-picker.js";
import { meldAan } from "../registratie.js";

const clampCols = (n) => Math.min(Math.max(1, Number(n) || 2), 3);
const asItem = (i) => (typeof i === "string" ? { entity: i } : { ...i });

/** Een rij heeft precies zoveel plekken als kolommen: niet meer, niet minder. */
function vul(row) {
  row.bewaard ??= [];
  while (row.items.length < row.columns) row.items.push(row.bewaard.pop() ?? { entity: "" });
  while (row.items.length > row.columns) {
    const eruit = row.items.pop();
    // Alleen ingevulde plekken zijn het bewaren waard, en alleen zolang deze
    // editor openstaat. Eén klik op "2" mag geen werk weggooien.
    if (eruit.entity) row.bewaard.push(eruit);
  }
  return row;
}

/**
 * Breng elke configvorm terug tot rijen met vaste plekken.
 *
 * Staan er meer entiteiten in een rij dan er kolommen zijn -- een oude config,
 * of met de hand geschreven YAML -- dan wordt die rij opgeknipt in meerdere
 * rijen van hetzelfde kolomaantal. Dat is precies wat de kaart al tekende, want
 * die laat een te volle rij doorlopen naar de volgende regel. Afkappen zou hier
 * betekenen dat het openen van de editor stilletjes entiteiten wist.
 */
function toRows(config) {
  const ruw = Array.isArray(config.rows) && config.rows.length
    ? config.rows.map((r) => ({
        columns: clampCols(r.columns),
        items: (r.items ?? r.entities ?? []).map(asItem),
      }))
    : (() => {
        const flat = (config.items ?? config.entities ?? []).map(asItem);
        return flat.length ? [{ columns: clampCols(config.columns), items: flat }] : [];
      })();

  const uit = [];
  for (const row of ruw) {
    const groepen = [];
    for (let i = 0; i < row.items.length; i += row.columns) {
      groepen.push(row.items.slice(i, i + row.columns));
    }
    if (!groepen.length) groepen.push([]);
    for (const items of groepen) uit.push(vul({ columns: row.columns, items }));
  }
  return uit;
}

/**
 * Wat er werkelijk naar de dashboardconfig gaat: geen lege plekken, geen lege
 * rijen, en nergens een object dat wij daarna nog aanraken.
 *
 * Die laatste is geen netheid maar de kern. Home Assistant bevriest wat het
 * krijgt; deelden we onze eigen items uit, dan zouden ze na één wijziging
 * onaanraakbaar zijn. Zie de kop.
 */
const uitgekleed = (rows) =>
  rows
    .map((r) => ({
      columns: r.columns,
      items: r.items.filter((i) => i.entity).map((i) => structuredClone(i)),
    }))
    .filter((r) => r.items.length);

const CSS = `
  .dac-ed { display: flex; flex-direction: column; gap: 12px; }

  /* ---------------------------------------------------------------- rij */
  .dac-ed .rij {
    border: 1px solid var(--divider-color); border-radius: 12px;
    background: var(--card-background-color); overflow: hidden;
  }
  .dac-ed .rij[open] { border-color: var(--primary-color); }

  .dac-ed .rij > summary {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 10px 10px 12px; cursor: pointer; list-style: none;
  }
  .dac-ed .rij > summary::-webkit-details-marker { display: none; }
  .dac-ed .rij[open] > summary { border-bottom: 1px solid var(--divider-color); }
  .dac-ed .rij > summary:hover { background: rgba(127,127,127,.06); }

  .dac-ed .pijl {
    flex: 0 0 auto; color: var(--secondary-text-color); font-size: 15px; line-height: 1;
    transition: transform 180ms ease;
  }
  .dac-ed details[open] > summary .pijl { transform: rotate(90deg); }

  .dac-ed .titel { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
  .dac-ed .titel b {
    font-size: 13px; font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-ed .titel small {
    font-size: 11.5px; color: var(--secondary-text-color);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .dac-ed .kolommen {
    flex: 0 0 auto; display: inline-flex; gap: 2px; padding: 3px;
    background: rgba(127,127,127,.12); border-radius: 999px;
  }
  .dac-ed .kolommen button {
    min-width: 28px; height: 24px; padding: 0 7px; cursor: pointer;
    border: 0; background: transparent; border-radius: 999px;
    font: inherit; font-size: 12px; color: var(--secondary-text-color);
  }
  .dac-ed .kolommen button[aria-pressed="true"] {
    background: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600;
  }

  .dac-ed .weg {
    flex: 0 0 auto; width: 28px; height: 28px; display: grid; place-items: center;
    cursor: pointer; border: 0; background: transparent; border-radius: 999px;
    color: var(--secondary-text-color); font-size: 16px; line-height: 1;
  }
  .dac-ed .weg:hover { background: rgba(127,127,127,.16); color: var(--error-color, #d03b3b); }
  .dac-ed .weg[hidden] { display: none; }

  .dac-ed .rijbody { padding: 10px; display: flex; flex-direction: column; gap: 8px; }

  /* --------------------------------------------------------------- item */
  .dac-ed .item {
    border: 1px solid var(--divider-color); border-radius: 10px;
    background: rgba(127,127,127,.04);
  }
  .dac-ed .item > summary {
    display: flex; align-items: center; gap: 9px;
    padding: 8px 8px 8px 10px; cursor: pointer; list-style: none;
  }
  .dac-ed .item > summary::-webkit-details-marker { display: none; }
  .dac-ed .item[open] > summary { border-bottom: 1px solid var(--divider-color); }

  /* Het kolomnummer, zodat je ziet welke plek in de rij dit blok is. */
  .dac-ed .nr {
    flex: 0 0 auto; width: 20px; height: 20px; display: grid; place-items: center;
    border-radius: 6px; font-size: 11px; font-weight: 600;
    background: rgba(127,127,127,.16); color: var(--secondary-text-color);
  }
  .dac-ed .item[data-leeg="true"] .nr { opacity: .5; }
  .dac-ed .item[data-leeg="true"] .titel b {
    font-weight: 500; font-style: italic; color: var(--secondary-text-color);
  }

  .dac-ed .itembody { padding: 10px; display: flex; flex-direction: column; gap: 10px; }

  /* ------------------------------------------------------------- knoppen */
  .dac-ed .rijtoevoegen {
    padding: 13px; cursor: pointer; font: inherit; font-size: 14px; font-weight: 500;
    border: 1px dashed var(--divider-color); border-radius: 12px;
    background: transparent; color: var(--primary-color); text-align: center;
  }
  .dac-ed .rijtoevoegen:hover { background: rgba(127,127,127,.08); }

  .dac-ed .uitleg {
    margin: 0; font-size: 12px; line-height: 1.45; color: var(--secondary-text-color);
  }
`;

class EntitiesEditor extends HTMLElement {
  constructor() {
    super();
    this.rows_ = [];
    this.rest_ = {};
    // Welke blokken openstaan, op sleutel `r2` en `r2i0`. Een herbouw mag niet
    // dichtslaan wat je net had opengeklapt.
    this.open_ = new Set();
    // Per blok een functie die zijn kop bijwerkt. Alleen de koppen: de velden
    // houden zichzelf bij, en erin schrijven terwijl iemand typt is vragen om
    // een cursor die wegspringt. Zie de kop van dit bestand.
    this.koppen_ = [];
  }

  setConfig(config) {
    this.rest_ = { ...config };
    delete this.rest_.rows;
    delete this.rest_.items;
    delete this.rest_.entities;
    delete this.rest_.columns;

    // Onze eigen wijziging die via Home Assistant terugkomt, bij ELKE
    // toetsaanslag. Zou die een herbouw uitlokken, dan verdwijnt het veld waar
    // je in typt onder je vingers en komt alleen de eerste letter aan.
    //
    // Eerst op identiteit: Home Assistant geeft letterlijk hetzelfde object
    // terug dat wij meestuurden (alleen bevroren). Dat is de betrouwbaarste
    // toets die er is. De inhoudsvergelijking eronder vangt de gevallen waarin
    // er onderweg toch een kopie van gemaakt is.
    if (this.gebouwd_ && config === this.uitObject_) return;

    const binnen = toRows(config);
    if (this.gebouwd_ && JSON.stringify(uitgekleed(binnen)) === this.uit_) return;

    this.rows_ = binnen;
    if (!this.eersteKeer_) {
      this.eersteKeer_ = true;
      // Eén rij staat open, want dan is er niets te overzien. Bij meer rijen
      // begint alles dicht: dat is precies waar het dichtklappen voor is.
      if (this.rows_.length === 1) this.open_.add("r0");
    }
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

  /* ------------------------------------------------- onthouden open-stand */

  /** Onthoud of een blok openstaat, zodat een herbouw het niet dichtslaat. */
  onthoud_(det, sleutel) {
    det.open = this.open_.has(sleutel);
    det.addEventListener("toggle", () => {
      if (det.open) this.open_.add(sleutel);
      else this.open_.delete(sleutel);
    });
  }

  /**
   * Schuif de onthouden open-stand mee als er een rij tussenuit valt.
   *
   * De sleutels zijn nummers, dus zonder dit erft rij 3 na het verwijderen van
   * rij 2 de open-stand van zijn buurman, en klapt er willekeurig iets open.
   */
  rijWeg_(r) {
    const nieuw = new Set();
    for (const k of this.open_) {
      const m = /^r(\d+)(?:i(\d+))?$/.exec(k);
      if (!m) continue;
      const n = Number(m[1]);
      if (n === r) continue;
      nieuw.add(n > r ? `r${n - 1}${m[2] === undefined ? "" : `i${m[2]}`}` : k);
    }
    this.open_ = nieuw;
  }

  /** Hetzelfde, voor een plek die leeggemaakt wordt en waar de rest opschuift. */
  itemWeg_(r, i) {
    const nieuw = new Set();
    for (const k of this.open_) {
      const m = /^r(\d+)i(\d+)$/.exec(k);
      if (!m || Number(m[1]) !== r) {
        nieuw.add(k);
        continue;
      }
      const n = Number(m[2]);
      if (n === i) continue;
      nieuw.add(n > i ? `r${r}i${n - 1}` : k);
    }
    this.open_ = nieuw;
  }

  /** Zet de lege plekken van een rij open: daar moet je nog wat mee. */
  legePlekkenOpen_(row, r) {
    row.items.forEach((it, i) => {
      if (!it.entity) this.open_.add(`r${r}i${i}`);
    });
  }

  /* ------------------------------------------------------------ opbouw */

  async build_() {
    if (!this.hass_ || !this.rows_) return;
    await customElements.whenDefined("ha-form");
    this.gebouwd_ = true;
    this.replaceChildren();
    this.koppen_ = [];

    const style = document.createElement("style");
    style.textContent = CSS;
    const wrap = document.createElement("div");
    wrap.className = "dac-ed";
    this.append(style, wrap);

    this.rows_.forEach((row, r) => wrap.appendChild(this.rijBlok_(row, r)));

    if (!this.rows_.length) {
      const uitleg = document.createElement("p");
      uitleg.className = "uitleg";
      uitleg.textContent =
        "Een rij is één regel op de kaart, met één, twee of drie entiteiten naast elkaar. " +
        "Elke rij heeft zijn eigen indeling.";
      wrap.appendChild(uitleg);
    }

    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "rijtoevoegen";
    knop.textContent = "＋  Rij toevoegen";
    knop.addEventListener("click", () => {
      const row = vul({ columns: 2, items: [] });
      this.rows_.push(row);
      const r = this.rows_.length - 1;
      this.open_.add(`r${r}`);
      this.legePlekkenOpen_(row, r);
      this.emit_();
      this.build_();
    });
    wrap.appendChild(knop);
  }

  /**
   * Een knop in een `summary` mag het blok niet openklappen.
   *
   * Zonder dit klapt de rij dicht zodra je op "2 kolommen" tikt, want de browser
   * ziet elke klik in een samenvatting als een klik op de samenvatting.
   */
  binnenKop_(el, onClick) {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick(e);
    });
    return el;
  }

  /* --------------------------------------------------------------- rij */

  rijBlok_(row, r) {
    const det = document.createElement("details");
    det.className = "rij";
    this.onthoud_(det, `r${r}`);

    // ---- kop: nummer, samenvatting, kolommen, verwijderen ----
    const sum = document.createElement("summary");

    const pijl = document.createElement("span");
    pijl.className = "pijl";
    pijl.textContent = "›";

    const titel = document.createElement("span");
    titel.className = "titel";
    const naam = document.createElement("b");
    naam.textContent = `Rij ${r + 1}`;
    const sub = document.createElement("small");
    titel.append(naam, sub);

    const kol = document.createElement("span");
    kol.className = "kolommen";
    const kolKnoppen = [1, 2, 3].map((n) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = String(n);
      b.title = `${n} entiteit${n > 1 ? "en" : ""} in deze rij`;
      kol.appendChild(
        this.binnenKop_(b, () => {
          if (row.columns === n) return;
          row.columns = n;
          vul(row);
          this.open_.add(`r${r}`);
          this.legePlekkenOpen_(row, r);
          this.emit_();
          this.build_();
        })
      );
      return b;
    });

    // De samenvatting is wat een dichtgeklapte rij nog bruikbaar maakt: je moet
    // hem kunnen herkennen zonder hem open te doen.
    const vernieuwKop = () => {
      const gevuld = row.items.filter((i) => i.entity);
      const kolommen = `${row.columns} kolom${row.columns > 1 ? "men" : ""}`;
      sub.textContent = gevuld.length
        ? `${kolommen} · ${gevuld.map((i) => this.itemNaam_(i)).join(", ")}`
        : `${kolommen} · nog leeg`;
      kolKnoppen.forEach((b) =>
        b.setAttribute("aria-pressed", String(row.columns === Number(b.textContent)))
      );
    };
    this.koppen_.push(vernieuwKop);

    const weg = document.createElement("button");
    weg.type = "button";
    weg.className = "weg";
    weg.title = "Rij verwijderen";
    weg.textContent = "✕";
    this.binnenKop_(weg, () => {
      this.rows_.splice(r, 1);
      this.rijWeg_(r);
      this.emit_();
      this.build_();
    });

    sum.append(pijl, titel, kol, weg);

    // ---- body: de plekken in deze rij ----
    const body = document.createElement("div");
    body.className = "rijbody";
    row.items.forEach((item, i) => body.appendChild(this.itemBlok_(row, item, r, i)));

    det.append(sum, body);
    vernieuwKop();
    return det;
  }

  /* -------------------------------------------------------------- item */

  itemNaam_(item) {
    return (
      item.name ||
      this.hass_?.states?.[item.entity]?.attributes?.friendly_name ||
      item.entity
    );
  }

  itemBlok_(row, item, r, i) {
    const det = document.createElement("details");
    det.className = "item";
    this.onthoud_(det, `r${r}i${i}`);

    const sum = document.createElement("summary");

    const pijl = document.createElement("span");
    pijl.className = "pijl";
    pijl.textContent = "›";

    const nr = document.createElement("span");
    nr.className = "nr";
    nr.textContent = String(i + 1);
    nr.title = `Plek ${i + 1} in de rij`;

    const titel = document.createElement("span");
    titel.className = "titel";
    const naam = document.createElement("b");
    const sub = document.createElement("small");
    titel.append(naam, sub);

    const weg = document.createElement("button");
    weg.type = "button";
    weg.className = "weg";
    weg.title = "Deze plek leegmaken";
    weg.textContent = "✕";
    this.binnenKop_(weg, () => {
      // Leeghalen laat de rest opschuiven, want zo tekent de kaart het ook:
      // een gat in kolom 1 bestaat daar niet.
      row.items.splice(i, 1);
      this.itemWeg_(r, i);
      vul(row);
      this.emit_();
      this.build_();
    });

    sum.append(pijl, nr, titel, weg);

    // ---- alles van déze entiteit, onder déze entiteit ----
    const body = document.createElement("div");
    body.className = "itembody";

    const kiezer = document.createElement("ha-form");
    kiezer.hass = this.hass_;
    kiezer.schema = [{ name: "entity", selector: { entity: {} } }];
    kiezer.computeLabel = () => "Entiteit";
    kiezer.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      item.entity = e.detail.value.entity ?? "";
      // Geen herbouw: de kiezer die dit afvuurt zou onder je handen verdwijnen.
      this.emit_();
    });

    const icoon = document.createElement("dac-icon-picker");
    icoon.label = "Icoon";
    icoon.hass = this.hass_;
    icoon.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      if (e.detail.value) item.icon = e.detail.value;
      else delete item.icon;
      this.emit_();
    });

    const kleur = document.createElement("dac-tone-picker");
    kleur.label = "Kleur";
    kleur.hass = this.hass_;
    kleur.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      if (e.detail.value) item.tone = e.detail.value;
      else delete item.tone;
      this.emit_();
    });

    const rest = document.createElement("ha-form");
    rest.hass = this.hass_;
    rest.schema = [
      { name: "name", selector: { text: {} } },
      { name: "show_state", selector: { boolean: {} } },
      { name: "icon_tap_action", selector: { ui_action: { default_action: "toggle" } } },
      { name: "icon_hold_action", selector: { ui_action: { default_action: "more-info" } } },
      { name: "tap_action", selector: { ui_action: { default_action: "more-info" } } },
      { name: "hold_action", selector: { ui_action: { default_action: "more-info" } } },
    ];
    rest.computeLabel = (s) =>
      ({
        name: "Naam (overschrijft die van de entiteit)",
        show_state: "Status tonen",
        icon_tap_action: "Tikken op het icoon",
        icon_hold_action: "Vasthouden op het icoon",
        tap_action: "Tikken op de regel",
        hold_action: "Vasthouden op de regel",
      })[s.name] ?? s.name;
    rest.computeHelper = (s) =>
      s.name === "icon_tap_action"
        ? "Het icoon en de regel zijn twee knoppen: het icoon schakelt, de regel opent of navigeert."
        : undefined;
    rest.addEventListener("value-changed", (e) => {
      e.stopPropagation();
      const v = e.detail.value;
      if (v.name) item.name = v.name;
      else delete item.name;
      // `false` moet blijven staan, alleen de standaard mag weg.
      if (v.show_state === false) item.show_state = false;
      else delete item.show_state;
      for (const k of ["icon_tap_action", "icon_hold_action", "tap_action", "hold_action"]) {
        if (v[k]) item[k] = v[k];
        else delete item[k];
      }
      this.emit_();
    });

    // De kop: die mag bij elke wijziging opnieuw, want er staat niemand in te
    // typen. Naam en entiteit erin veranderen terwijl je ze invult.
    const vernieuwKop = () => {
      naam.textContent = item.entity ? this.itemNaam_(item) : "Kies een entiteit";
      sub.textContent = item.entity || "";
      det.dataset.leeg = String(!item.entity);
      weg.hidden = !item.entity;
    };
    this.koppen_.push(vernieuwKop);

    // De velden: één keer vullen, bij het opbouwen. Daarna houden ze zichzelf
    // bij -- `ha-form` en allebei de kiezers doen dat -- en erin schrijven
    // terwijl iemand typt zou de cursor laten wegspringen.
    kiezer.data = { entity: item.entity || undefined };
    icoon.value = item.icon ?? "";
    kleur.value = item.tone ?? "";
    rest.data = {
      name: item.name ?? "",
      show_state: item.show_state ?? true,
      icon_tap_action: item.icon_tap_action,
      icon_hold_action: item.icon_hold_action,
      tap_action: item.tap_action,
      hold_action: item.hold_action,
    };

    body.append(kiezer, icoon, kleur, rest);
    det.append(sum, body);
    vernieuwKop();
    return det;
  }

  /* ------------------------------------------------------------ uitvoer */

  emit_() {
    const rows = uitgekleed(this.rows_);
    const config = { ...this.rest_, rows };

    // Onthouden wat we wegschreven, zodat we onze eigen echo herkennen.
    this.uit_ = JSON.stringify(rows);
    this.uitObject_ = config;

    for (const kop of this.koppen_) kop();

    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config },
        bubbles: true,
        composed: true,
      })
    );
  }
}

meldAan("domotiapp-entities-card-editor", EntitiesEditor);
