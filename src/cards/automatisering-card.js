/**
 * DomotiApp Automatiseringen: de klant maakt zelf eenvoudige automatiseringen.
 *
 * Gevraagd op 31 oktober 2026, via de beheersessie. De eigenaar zet in de editor
 * de lampen met de goede naam; daaruit kiest de klant. Met een plusje een nieuwe
 * regel: welke lampen, hoe fel, wanneer aan en wanneer uit (een tijd, of de zon
 * met een verschuiving), en op welke dagen. Elke regel kan uit en weg. Eerst
 * verlichting, later rolluiken.
 *
 * ## De vakantiemodus staat apart
 *
 * De eigenaar, nadrukkelijk: het plusje maakt een gewone automatisering, en er
 * staat niet bij elke regel iets over vakantie. Vakantie is een eigen blok met een
 * schakelaar en een eigen plusje. Staat hij aan, dan pauzeren de gewone regels, en
 * lopen de vakantieregels elke dag tot een kwartier vroeger of later.
 *
 * ## Wat de kaart doet en wat niet
 *
 * De kaart VOERT NIETS UIT. Dat doet de integratie (`automatisering/`), die ook
 * zelf toetst welke lampen er mogen; zie de kop van `const.py` daar.
 */

import { DacCard, INCOMPLETE, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { nameOf } from "../ha.js";
import { BlijvendAbonnement, Verbindingswacht } from "../herkansing.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { bindToggle, setToggle, toggleCss, toggleHtml } from "../toggle.js";
import { vraagBevestiging } from "../vraag.js";
import {
  favorietenVoor,
  lampenKort,
  lampenUit,
  nieuweFavoriet,
  nieuweRegel,
  regelKop,
  regelTekst,
  regelsVoor,
} from "./automatisering-logica.js";
import { automatiseringScherm, toonAutomatiseringScherm } from "./automatisering-scherm.js";
import { nt, t } from "../taal.js";

const COMMANDO = "domotiapp_lovelace/automatisering";

class AutomatiseringCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }

    .card {
      min-height: var(--dac-raster, 56px);
      padding: 11px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .kop { display: flex; align-items: center; gap: 10px; min-height: 34px; }
    /* Elke titel is vet en heeft een icoon, allemaal gelijk. De eigenaar, 31 oktober 2026: "Alle
       titels moeten vet gedrukt zijn en een icon hebben." Het icoon is even breed als dat van een
       rij, zodat de tekst eronder op dezelfde lijn begint. */
    .titel { flex: 1 1 auto; min-width: 0; font-size: 14px; font-weight: 700; letter-spacing: -.01em; color: var(--dac-ink); }
    .kico { width: 36px; height: 34px; flex: 0 0 auto; display: grid; place-items: center; color: var(--dac-accent-hi); }
    .kico .icon { width: 19px; height: 19px; }

    .plus, .weg {
      width: 34px; height: 34px; flex: 0 0 auto; padding: 0; cursor: pointer;
      display: grid; place-items: center; border-radius: var(--dac-radius-pill);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      color: var(--dac-ink-2); font: inherit;
      transition: background 160ms ease, color 160ms ease;
    }
    @media (hover: hover) {
      .plus:hover, .weg:hover { background: var(--dac-surface-hi); color: var(--dac-ink); }
    }
    .plus .icon, .weg .icon { width: 16px; height: 16px; }

    .lijst { display: flex; flex-direction: column; }
    .lijst .rij { padding: 9px 0; }
    .lijst .rij:first-child { padding-top: 2px; }
    .lijst .rij:last-child { padding-bottom: 2px; }
    .lijst .rij + .rij { border-top: 1px solid var(--dac-border); }
    .leeg, .uitleg { font-size: 12px; line-height: 1.4; color: var(--dac-ink-2); }
    .pauze { font-size: 12px; line-height: 1.4; color: var(--dac-warn); }

    .rij {
      display: flex; align-items: center; gap: 10px; min-height: 40px;
      cursor: pointer; -webkit-tap-highlight-color: transparent;
    }
    .ico {
      width: 36px; height: 36px; flex: 0 0 auto; display: grid; place-items: center;
      border-radius: 50%; color: var(--dac-ink-3);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      transition: color 160ms ease, border-color 160ms ease;
    }
    .ico .icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }
    /* Alleen het icoon draagt de toestand. */
    .rij[data-aan="true"] .ico {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 45%, transparent);
    }
    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; gap: 1px; }
    .nm { font-size: 13.5px; font-weight: 500; line-height: 1.25; }
    .st, .lp { font-size: 11.5px; line-height: 1.3; color: var(--dac-ink-2); }
    .nm, .lp { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rij[data-aan="false"] .nm { color: var(--dac-ink-2); }

    .vakantie, .favorieten {
      display: flex; flex-direction: column; gap: 8px;
      padding-top: 10px; border-top: 1px solid var(--dac-border);
    }

    ${toggleCss}
    .toggle { width: 42px; height: 24px; flex: 0 0 auto; }
    .toggle .knob { width: 18px; height: 18px; }
    .toggle[aria-checked="true"] .knob { --knob: 20px; }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  constructor() {
    super();
    this.verbinding_ = new Verbindingswacht();
    this.stand_ = null;
  }

  validate(config) {
    const c = { ...config };
    if (!lampenUit(c).length) c[INCOMPLETE] = t("Kies minstens één lamp of rolluik.");
    return c;
  }

  lampen_() {
    return lampenUit(this.config);
  }

  naamVanLamp_(id) {
    return this.lampen_().find((l) => l.entity === id)?.naam || nameOf(this.hass, id);
  }

  metVakantie_() {
    return this.config.vakantie !== false;
  }

  metFavorieten_() {
    return this.config.favorieten !== false;
  }

  watched() {
    return this.lampen_().map((l) => l.entity);
  }

  template() {
    this.toggleAttribute("bare", Boolean(this.config.bare));
    const plus = (groep, label) =>
      `<button class="plus" type="button" data-groep="${groep}" aria-label="${escapeHtml(label)}">${resolve("plus")}</button>`;
    const titel = (icoon, tekst) => `<span class="kico">${resolve(icoon)}</span><span class="titel">${escapeHtml(tekst)}</span>`;
    return `
      <div class="card surface" style="--tone:${TONES.accent}">
        <div class="kop">
          ${titel("clock", this.config.name || t("Automatiseringen"))}
          ${plus("gewoon", t("Nieuwe automatisering"))}
        </div>
        <div class="pauze" hidden>${escapeHtml(t("Gepauzeerd: de vakantiemodus staat aan."))}</div>
        <div class="leeg" data-groep="gewoon" hidden>${escapeHtml(t("Nog geen automatiseringen. Maak er een met het plusje."))}</div>
        <div class="lijst" data-groep="gewoon"></div>
        ${
          this.metFavorieten_()
            ? `<div class="favorieten">
                <div class="kop">
                  ${titel("star", t("Favorieten"))}
                  ${plus("favoriet", t("Nieuwe favoriet"))}
                </div>
                <div class="leeg" data-groep="favoriet" hidden>${escapeHtml(t("Knoppen voor de favorietenkaart: één tik zet alles zoals je het hier kiest."))}</div>
                <div class="lijst" data-groep="favoriet"></div>
              </div>`
            : ""
        }
        ${
          this.metVakantie_()
            ? `<div class="vakantie">
                <div class="kop vrij" data-aan="false">
                  ${titel("beach", t("Vakantiemodus"))}
                  ${toggleHtml({ label: t("Vakantiemodus") })}
                </div>
                <div class="kop">
                  ${titel("calendar", t("Vakantieregels"))}
                  ${plus("vakantie", t("Nieuwe vakantieregel"))}
                </div>
                <div class="lijst" data-groep="vakantie"></div>
                <div class="uitleg">${escapeHtml(t("Elke dag tot 15 minuten vroeger of later, zodat het huis bewoond lijkt."))}</div>
              </div>`
            : ""
        }
      </div>`;
  }

  wire() {
    for (const plus of this.$$(".plus")) {
      this.on(plus, "click", () =>
        toonAutomatiseringScherm(
          this,
          plus.dataset.groep === "favoriet" ? { ...nieuweFavoriet(this.lampen_()), kiezen: true } : nieuweRegel(this.lampen_(), plus.dataset.groep === "vakantie")
        )
      );
    }
    for (const lijst of this.$$(".lijst")) this.on(lijst, "click", (e) => this.tikOpLijst_(e));
    const schakelaar = this.$(".vrij .toggle");
    if (schakelaar) {
      bindToggle(schakelaar, {
        value: () => this.stand_?.vakantie === true,
        set: (aan) => this.zetVakantie_(aan),
        disabled: () => !this.stand_,
      });
    }

    this.abonnement_ = new BlijvendAbonnement({ type: `${COMMANDO}/subscribe` }, (stand) => {
      this.stand_ = stand;
      if (this.hass) this.paint();
    });
    this.abonnement_.start(this.hass);
    this.teardown_.push(() => this.abonnement_.stop());
    this.teardown_.push(volgRaster(this.$(".card")));
    this.teardown_.push(() => {
      this.stand_ = null;
      // Een wijziging in de editor bouwt de kaart opnieuw; dan klopt het scherm niet meer.
      const scherm = automatiseringScherm();
      if (scherm?.isVan(this)) scherm.sluit();
    });
  }

  set hass(hass) {
    const terug = this.verbinding_.herverbonden(hass);
    super.hass = hass;
    if (terug && this.wired_) this.abonnement_?.start(hass);
  }

  get hass() {
    return super.hass;
  }

  regel_(id) {
    return this.stand_?.regels?.find((r) => r.id === id);
  }

  tikOpLijst_(e) {
    const rij = e.target.closest(".rij");
    if (!rij) return;
    if (rij.dataset.favoriet) {
      const favoriet = this.stand_?.favorieten?.find((f) => f.id === rij.dataset.favoriet);
      if (!favoriet) return;
      if (e.target.closest(".weg")) this.verwijderFavoriet_(favoriet);
      else toonAutomatiseringScherm(this, { ...favoriet, favoriet: true });
      return;
    }
    const regel = this.regel_(rij.dataset.id);
    if (!regel) return;
    if (e.target.closest(".weg")) this.verwijder_(regel);
    else toonAutomatiseringScherm(this, regel);
  }

  /** Een commando, met de melding in het log als het misgaat. Het abonnement zet de stand weer goed. */
  stuur_(bericht) {
    return this.hass.connection.sendMessagePromise(bericht);
  }

  /** Het scherm roept dit aan, en toont zelf de fout. */
  opslaan(regel) {
    return this.stuur_({ type: `${COMMANDO}/opslaan`, regel });
  }

  /** Het scherm roept dit aan, en toont zelf de fout. */
  opslaanFavoriet(favoriet) {
    return this.stuur_({ type: `${COMMANDO}/favoriet_opslaan`, favoriet });
  }

  async verwijderFavoriet_(favoriet) {
    const ja = await vraagBevestiging({
      title: t("Favoriet verwijderen?"),
      text: favoriet.naam,
      confirmText: t("Verwijderen"),
    });
    if (ja) this.stuur_({ type: `${COMMANDO}/favoriet_verwijder`, favoriet: favoriet.id }).catch((f) => this.mislukt_(f));
  }

  async verwijder_(regel) {
    const ja = await vraagBevestiging({
      title: t("Automatisering verwijderen?"),
      text: regelKop(regel, this.lampen_(), (id) => nameOf(this.hass, id)),
      confirmText: t("Verwijderen"),
    });
    if (ja) this.stuur_({ type: `${COMMANDO}/verwijder`, regel: regel.id }).catch((f) => this.mislukt_(f));
  }

  mislukt_(fout) {
    console.warn("DomotiApp Automatiseringen:", fout);
    if (this.hass) this.paint();
  }

  zetVakantie_(aan) {
    this.stuur_({ type: `${COMMANDO}/vakantie`, aan }).catch((f) => this.mislukt_(f));
  }

  rijenHtml_(regels) {
    const naamVan = (id) => nameOf(this.hass, id);
    return regels
      .map(
        (r) => `
        <div class="rij" data-id="${escapeHtml(r.id)}" data-aan="${r.actief !== false}">
          <span class="ico">${resolve("bulb")}</span>
          <span class="txt">
            <span class="nm">${escapeHtml(regelKop(r, this.lampen_(), naamVan))}</span>
            <span class="st">${escapeHtml(regelTekst(r))}</span>
            ${r.naam ? `<span class="lp">${escapeHtml(lampenKort(r, this.lampen_(), naamVan))}</span>` : ""}
          </span>
          <button class="weg" type="button" aria-label="${escapeHtml(t("Verwijderen"))}">${resolve("bin")}</button>
          ${toggleHtml({ label: t("Aan of uit") })}
        </div>`
      )
      .join("");
  }

  /** De favorieten: geen schakelaar, want ze gaan op een tik op de favorietenkaart. */
  tekenFavorieten_(lijst, favorieten) {
    const sig = JSON.stringify(favorieten) + this.lampen_().map((l) => l.naam).join();
    if (lijst.dataset.sig === sig) return;
    lijst.dataset.sig = sig;
    const naamVan = (id) => nameOf(this.hass, id);
    lijst.innerHTML = favorieten
      .map(
        (f) => `
        <div class="rij" data-favoriet="${escapeHtml(f.id)}" data-aan="true">
          <span class="ico">${resolve(f.icoon, "star")}</span>
          <span class="txt">
            <span class="nm">${escapeHtml(f.naam)}</span>
            <span class="lp">${escapeHtml(lampenKort(f, this.lampen_(), naamVan))}</span>
          </span>
          <button class="weg" type="button" aria-label="${escapeHtml(t("Verwijderen"))}">${resolve("bin")}</button>
        </div>`
      )
      .join("");
  }

  /** Teken een lijst opnieuw als er iets aan veranderde, en koppel de schakelaars. */
  tekenLijst_(lijst, regels) {
    const sig = JSON.stringify(regels) + this.lampen_().map((l) => l.naam).join();
    if (lijst.dataset.sig === sig) return;
    lijst.dataset.sig = sig;
    lijst.innerHTML = this.rijenHtml_(regels);
    for (const rij of lijst.querySelectorAll(".rij")) {
      const schakelaar = rij.querySelector(".toggle");
      const id = rij.dataset.id;
      setToggle(schakelaar, rij.dataset.aan === "true");
      bindToggle(schakelaar, {
        value: () => this.regel_(id)?.actief !== false,
        set: (actief) => this.stuur_({ type: `${COMMANDO}/actief`, regel: id, actief }).catch((f) => this.mislukt_(f)),
      });
    }
  }

  paint() {
    const stand = this.stand_;
    if (stand) {
      const lampen = this.lampen_();
      const gewoon = regelsVoor(stand.regels, lampen, false);
      this.tekenLijst_(this.$('.lijst[data-groep="gewoon"]'), gewoon);
      this.$('.leeg[data-groep="gewoon"]').hidden = gewoon.length > 0;
      const fav = this.$('.lijst[data-groep="favoriet"]');
      if (fav) {
        const favorieten = favorietenVoor(stand.favorieten, lampen);
        this.tekenFavorieten_(fav, favorieten);
        this.$('.leeg[data-groep="favoriet"]').hidden = favorieten.length > 0;
      }
      const vak = this.$('.lijst[data-groep="vakantie"]');
      if (vak) {
        this.tekenLijst_(vak, regelsVoor(stand.regels, lampen, true));
        const schakelaar = this.$(".vrij .toggle");
        setToggle(schakelaar, stand.vakantie === true);
        this.$(".vrij").dataset.aan = String(stand.vakantie === true);
      }
      this.$(".pauze").hidden = !(stand.vakantie === true && gewoon.length);
    }
    meetRaster(this.$(".card"));
  }

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: this.minRijen_(".card", 2) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-automatisering-card-editor");
  }

  static getStubConfig(hass, entities) {
    return { lampen: (entities ?? []).filter((e) => e.startsWith("light.")).slice(0, 3) };
  }
}

/**
 * De editor: de lampen die de klant kan kiezen, met per lamp een eigen naam.
 *
 * `ha-form` werkt plat, net als bij de personenkaart: `naam:light.x` is steiger,
 * en die komt nooit in de YAML terecht. In de YAML staat `lampen: [{entity, name}]`.
 */
class AutomatiseringEditor extends DacEditor {
  defaults() {
    return { vakantie: true, favorieten: true };
  }

  setConfig(config) {
    const flat = { ...config };
    const lijst = lampenUit(config);
    flat.lampen = lijst.filter((l) => !l.rolluik).map((l) => l.entity);
    const rolluiken = lijst.filter((l) => l.rolluik).map((l) => l.entity);
    if (rolluiken.length) flat.rolluiken = rolluiken;
    else delete flat.rolluiken;
    for (const l of lijst) if (l.naam) flat[`naam:${l.entity}`] = l.naam;
    super.setConfig(flat);
  }

  serialize(config) {
    const uit = { ...config };
    const metNaam = (id) => {
      const name = uit[`naam:${id}`];
      return name ? { entity: id, name } : id;
    };
    uit.lampen = (uit.lampen ?? []).map(metNaam);
    const rolluiken = (uit.rolluiken ?? []).map(metNaam);
    if (rolluiken.length) uit.rolluiken = rolluiken;
    else delete uit.rolluiken;
    const omgekeerd = (uit.omgekeerd ?? []).filter((id) => (config.rolluiken ?? []).includes(id));
    if (omgekeerd.length) uit.omgekeerd = omgekeerd;
    else delete uit.omgekeerd;
    for (const k of Object.keys(uit)) if (k.startsWith("naam:")) delete uit[k];
    // Alleen wat nog op de kaart staat; leeg hoort niet in de YAML.
    const aanUit = (uit.alleen_aan_uit ?? []).filter((id) => (config.lampen ?? []).includes(id));
    if (aanUit.length) uit.alleen_aan_uit = aanUit;
    else delete uit.alleen_aan_uit;
    if (uit.favorieten !== false) delete uit.favorieten;
    if (uit.vakantie !== false) delete uit.vakantie;
    if (uit.vakantie === false) delete uit.vakantie_entiteit;
    return uit;
  }

  schema() {
    const ids = (this.config_?.lampen ?? []).filter((x) => typeof x === "string");
    const rolluiken = (this.config_?.rolluiken ?? []).filter((x) => typeof x === "string");
    return [
      { name: "name", selector: sel.text() },
      { name: "lampen", selector: { entity: { domain: "light", multiple: true } } },
      { name: "rolluiken", selector: { entity: { domain: "cover", multiple: true } } },
      ...[...ids, ...rolluiken].map((id) => ({ name: `naam:${id}`, selector: sel.text() })),
      ...(ids.length ? [{ name: "alleen_aan_uit", selector: { entity: { include_entities: ids, multiple: true } } }] : []),
      ...(rolluiken.length ? [{ name: "omgekeerd", selector: { entity: { include_entities: rolluiken, multiple: true } } }] : []),
      { name: "favorieten", selector: sel.bool() },
      { name: "vakantie", selector: sel.bool() },
      ...(this.config_?.vakantie !== false
        ? [{ name: "vakantie_entiteit", selector: sel.entity(["input_boolean", "switch"]) }]
        : []),
    ];
  }

  label(s) {
    if (s.name.startsWith("naam:")) {
      const id = s.name.slice(5);
      return t("Naam voor {naam}", { naam: this.hass?.states?.[id]?.attributes?.friendly_name ?? id });
    }
    return (
      {
        name: t("Titel"),
        lampen: t("Lampen die de klant kan kiezen"),
        rolluiken: t("Rolluiken die de klant kan kiezen"),
        alleen_aan_uit: t("Alleen aan en uit"),
        omgekeerd: t("Motor omgekeerd"),
        favorieten: t("Favorieten op deze kaart"),
        vakantie: t("Vakantiemodus op deze kaart"),
        vakantie_entiteit: t("Bestaande vakantiestand"),
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      name: t("Leeg laten: Automatiseringen."),
      lampen: t("Alleen deze lampen zijn te kiezen, ook als iemand anders dan de kaart het vraagt. Per lamp kun je hieronder een eigen naam zetten."),
      rolluiken: t("Aan is open op de gekozen stand, uit is dicht. Een rolluik dat zijn stand niet kent, gaat alleen open en dicht."),
      omgekeerd: t("Rolluiken waarvan de motor andersom is aangesloten, net als het vinkje op de rolluikkaart."),
      favorieten: t("Hier maakt de klant de knoppen voor de favorietenkaart."),
      alleen_aan_uit: t("Lampen die kunnen dimmen volgens Home Assistant, maar het niet doen, zoals een dimblokje met vaste spots. Die krijgen geen schuif."),
      vakantie_entiteit: t("Leeg laten: de schakelaar die de integratie zelf heeft. Kies hier een stand die er al was, dan volgt de kaart die."),
    }[s.name];
  }
}

registerEditor("domotiapp-automatisering-card-editor", AutomatiseringEditor);
registerCard("domotiapp-automatisering-card", AutomatiseringCard, {
  name: nt("DomotiApp Automatiseringen"),
  description: nt("De klant maakt zelf eenvoudige automatiseringen voor de lampen die jij kiest, met een vakantiemodus."),
});

export { AutomatiseringCard };
