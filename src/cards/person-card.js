/**
 * Wie er thuis is, in zo min mogelijk ruimte.
 *
 * Bewust klein. Deze kaart staat bovenaan een home-view waar hij bekeken wordt,
 * niet gelezen: de vraag is "is er iemand", en die is beantwoord door een
 * ringkleur voordat er ook maar een woord verwerkt is. Een persoonstegel zo
 * groot als een bedieningskaart duwt de bediening zelf onder de vouw, en zes
 * ervan duwen hem een scherm naar beneden.
 *
 * Thuis is groen, weg is rood, geen melding is oranje. Dat laatste is geen fout
 * maar wel iets om naar te kijken: een tracker die niets zegt is meestal een
 * telefoon met de app uit, en dat wil je zien voordat je conclusies trekt uit
 * "niemand thuis".
 *
 * DE TEKST ERONDER IS WEG, DE KLEUR NIET
 *
 * Er stond "Thuis", "Afwezig" of "Onbekend" onder elke naam. Dat zei precies
 * wat de ring al zei, en het kostte de kaart een hele rasterrij: hij was 120px
 * hoog waar 56 volstaat. Sinds 20 augustus 2026 staat er alleen nog de ring en
 * de naam, en past een rij personen op een enkele rasterrij -- dezelfde hoogte
 * als een knop ernaast.
 *
 * Weg van het scherm is niet weg uit de kaart: het `aria-label` noemt de plaats
 * nog steeds voluit, inclusief de zonenaam ("Werk", "School"). Wie de kaart met
 * een schermlezer gebruikt of erop tikt, krijgt het hele verhaal.
 *
 * De naam mag per persoon overschreven worden. Een device_tracker heet
 * standaard naar het toestel -- "OPPO A94 5G" is geen mens.
 */

import { DacCard, registerCard, registerEditor, rowsFor, INCOMPLETE } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { icons } from "../icons.js";
import { bindActions, moreInfo, nameOf, stateOf } from "../ha.js";

/** De eigen woorden van de tracker voor waar iemand is. */
function place(st) {
  if (!st) return { label: "Onbekend", home: null };
  switch (st.state) {
    case "home":
      return { label: "Thuis", home: true };
    case "not_home":
      return { label: "Afwezig", home: false };
    case "unknown":
    case "unavailable":
      return { label: "Onbekend", home: null };
    default:
      // Een zone met een naam: "Werk", "School". Veel bruikbaarder dan "afwezig".
      return { label: st.state, home: false };
  }
}

class PersonCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }

    .card {
      height: 100%; padding: 4px 10px;
      display: flex; flex-direction: column; justify-content: center;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .chips {
      display: grid; gap: 6px;
      grid-template-columns: repeat(var(--cols, 6), minmax(0, 1fr));
    }
    .p {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 0 2px; background: none; border: 0; cursor: pointer;
      font: inherit; color: inherit; border-radius: var(--dac-radius-sm);
      transition: background 200ms ease;
    }
    @media (hover: hover) { .p:hover { background: var(--dac-surface); } }
    .nm {
      font-size: 11px; font-weight: 500; line-height: 1.15; text-align: center;
      max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .av {
      position: relative; flex: 0 0 auto;
      width: 28px; height: 28px; border-radius: 50%;
      display: grid; place-items: center; overflow: hidden;
      font-size: 12px; font-weight: 600;
      color: var(--dac-ink); background: var(--dac-surface-hi);
      /* Ring buiten de avatar getekend, zodat een foto er nooit door bijgesneden
         wordt. Dunner dan hij was: de ring steekt buiten de avatar uit en zou
         bij deze maten tegen de naam eronder aan komen te staan. */
      box-shadow: 0 0 0 1.5px var(--dac-bg), 0 0 0 3px var(--tone);
    }
    .av img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .av .icon { width: 55%; height: 55%; color: var(--dac-ink-2); }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  validate(config) {
    const raw = config.persons ?? config.entities ?? (config.entity ? [config.entity] : []);
    if (!raw.length) return { ...config, [INCOMPLETE]: "Kies minstens één persoon." };
    return {
      ...config,
      persons: raw.map((p) => (typeof p === "string" ? { entity: p } : p)),
    };
  }

  watched() {
    return this.config.persons.map((p) => p.entity);
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    const cols = c.columns ?? Math.min(c.persons.length, 6);

    const items = c.persons
      .map(
        (p, i) => `
      <button class="p" type="button" data-i="${i}" style="--tone:var(--dac-ink-3)">
        <span class="av"><span class="ph"></span></span>
        <span class="nm"></span>
      </button>`
      )
      .join("");

    return `<div class="card surface"><div class="chips" style="--cols:${cols}">${items}</div></div>`;
  }

  wire() {
    this.$$(".p").forEach((el) => {
      const cfg = this.config.persons[+el.dataset.i];
      this.teardown_.push(bindActions(el, { onTap: () => moreInfo(this, cfg.entity) }));
    });
  }

  paint() {
    this.$$(".p").forEach((el) => {
      const cfg = this.config.persons[+el.dataset.i];
      const st = stateOf(this.hass, cfg.entity);
      const where = place(st);

      el.style.setProperty(
        "--tone",
        where.home === true
          ? "var(--dac-good)"
          : where.home === false
            ? "var(--dac-bad)"
            : "var(--dac-warn)"
      );

      const name = nameOf(this.hass, cfg.entity, cfg.name);
      this.text(el.querySelector(".nm"), name);

      // Foto als die er is, anders de initiaal, anders een getekend figuur.
      const ph = el.querySelector(".ph");
      const pic = st?.attributes?.entity_picture;
      const wanted = pic ? `img:${pic}` : name ? `ini:${name[0]}` : "icon";
      if (ph.dataset.kind !== wanted) {
        ph.dataset.kind = wanted;
        ph.innerHTML = pic
          ? `<img src="${pic}" alt="" loading="lazy" />`
          : name
            ? name[0].toUpperCase()
            : icons.person;
      }

      el.setAttribute("aria-label", `${name}, ${where.label}`);
    });
  }

  /**
   * Eén regel personen is 28 avatar + 4 tussenruimte + 13 naam = 45.
   *
   * Plus 8 binnenmarge en 2 rand komt dat op 55 uit, en dat is precies binnen
   * één rasterrij van Home Assistant (56). Daar zat de hele oefening in: met de
   * statusregel erbij was het er 84 en dus twee rijen, en een kaart die alleen
   * zegt wie er thuis is hoort geen 120 pixels van een dashboard te kosten.
   */
  rows_() {
    const cols = this.config?.columns ?? Math.min(this.config?.persons?.length ?? 1, 6);
    const lines = Math.ceil((this.config?.persons?.length ?? 1) / cols);
    return rowsFor(10 + lines * 45 + (lines - 1) * 6);
  }

  getCardSize() {
    return this.rows_();
  }

  getGridOptions() {
    const rows = this.rows_();
    return { columns: "full", rows, min_rows: rows, max_rows: rows };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-person-card-editor");
  }

  static getStubConfig(hass) {
    const persons = Object.keys(hass?.states ?? {})
      .filter((e) => e.startsWith("person."))
      .slice(0, 6);
    return { persons };
  }
}

/**
 * De editor werkt op een platte vorm, de config op een lijst met objecten.
 *
 * `ha-form` kent geen herhalende rij, dus wordt elke gekozen persoon een eigen
 * tekstveld `naam:<entity>` in het formulier, en vouwt `serialize` die terug in
 * `persons: [{ entity, name }]`. De steiger komt nooit in de YAML terecht.
 */
class PersonEditor extends DacEditor {
  setConfig(config) {
    const flat = { ...config };
    const list = (config.persons ?? []).map((p) => (typeof p === "string" ? { entity: p } : p));
    flat.persons = list.map((p) => p.entity);
    for (const p of list) if (p.name) flat[`naam:${p.entity}`] = p.name;
    super.setConfig(flat);
  }

  serialize(config) {
    const out = { ...config };
    const ids = out.persons ?? [];
    out.persons = ids.map((id) => {
      const name = out[`naam:${id}`];
      return name ? { entity: id, name } : id;
    });
    for (const k of Object.keys(out)) if (k.startsWith("naam:")) delete out[k];
    return out;
  }

  schema() {
    const ids = (this.config_?.persons ?? []).filter((x) => typeof x === "string");
    return [
      { name: "persons", selector: { entity: { domain: ["person", "device_tracker"], multiple: true } } },
      ...ids.map((id) => ({ name: `naam:${id}`, selector: sel.text() })),
    ];
  }

  label(s) {
    if (s.name === "persons") return "Personen";
    if (s.name.startsWith("naam:")) {
      const id = s.name.slice(5);
      return `Naam voor ${this.hass?.states?.[id]?.attributes?.friendly_name ?? id}`;
    }
    return super.label(s);
  }

  helper(s) {
    if (s.name === "persons")
      return "Thuis is groen, weg is rood, geen melding is oranje. Per persoon kun je hieronder een eigen naam zetten.";
    return undefined;
  }
}

registerEditor("domotiapp-person-card-editor", PersonEditor);
registerCard("domotiapp-person-card", PersonCard, {
  name: "DomotiApp Personen",
  description: "Wie er thuis is, compact. Het hele huishouden in één kaart.",
});
