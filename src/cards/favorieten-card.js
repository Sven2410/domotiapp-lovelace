/**
 * De favorietenkaart: knoppen die de klant zelf maakt.
 *
 * De eigenaar, 31 oktober 2026: "ik wil een nieuwe kaart. Een favorietrn kaart. Zoals nu
 * woning verlaten etc maar dat kan de klant zelf in de automatisering kaart aanmaken. Heeft
 * die 3 knoppen aangemaakt dan 2 naast elkaar en de ander over de volle breedte snap je alles
 * goed mooi uitlijnen".
 *
 * Deze kaart maakt niets en kent geen lampen: hij toont wat er in de opslag van de
 * automatiseringen staat (`automatisering/store.py`), en een tik vraagt de SERVER om het uit
 * te voeren. Die toetst nog een keer of de lamp op de automatiseringskaart staat.
 *
 * Elke knop is een eigen vlak van één rasterrij, dus 56 hoog met 8 ertussen: naast een losse
 * knop of een Mushroom-kaart loopt hij gelijk, zoals de Vormregels vragen. Een oneven laatste
 * knop gaat over de volle breedte.
 *
 * Zonder favorieten zegt de kaart waar je ze maakt, op zijn verzoek: "Heb je nog geen favorieten
 * gemaakt moet er komen te staan iets van maak je favorieten in de woning instellingen". Waar
 * dat is, verschilt per dashboard: `pad` maakt van die regel een link.
 */

import { DacCard, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { runAction } from "../ha.js";
import { resolve } from "../icons.js";
import { BlijvendAbonnement, Verbindingswacht } from "../herkansing.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { nt, t } from "../taal.js";

const COMMANDO = "domotiapp_lovelace/automatisering";

/** Zo lang draagt het icoon de kleur na een tik: bevestigd, of mislukt. */
const NASLEEP_MS = 1400;

class FavorietenCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }

    .raster { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .knop:last-child:nth-child(odd) { grid-column: 1 / -1; }

    .knop, .leeg {
      height: 56px; padding: 0 12px 0 10px;
      display: flex; align-items: center; gap: 10px; min-width: 0;
      border-radius: var(--dac-radius); border: 1px solid var(--dac-border);
    }
    .knop {
      cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation; user-select: none;
      transition: background 200ms ease, border-color 200ms ease, transform 200ms ease;
    }
    @media (hover: hover) { .knop:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
    .knop:active { transform: scale(.985); }
    :host([bare]) .knop, :host([bare]) .leeg { background: none; }

    .chip { width: 36px; height: 36px; transition: color 200ms ease, background 200ms ease, border-color 200ms ease, box-shadow 200ms ease; }
    .chip .icon, .chip ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }
    /* Een favoriet staat niet aan of uit, dus het icoon licht alleen even op na een tik. */
    .knop[data-stand="goed"] .chip { box-shadow: 0 0 12px -2px color-mix(in srgb, var(--tone) 70%, transparent); }
    .knop[data-stand="fout"] { --tone: var(--dac-warn); }

    .nm { min-width: 0; font-size: 13px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .leeg { padding: 0 14px; font-size: 12.5px; line-height: 1.3; color: var(--dac-ink-2); }
    .leeg[role="button"] { cursor: pointer; }
    @media (hover: hover) { .leeg[role="button"]:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  constructor() {
    super();
    this.verbinding_ = new Verbindingswacht();
    this.favorieten_ = null;
    this.nasleep_ = new Map();
  }

  validate(config) {
    return { ...config };
  }

  watched() {
    return [];
  }

  template() {
    this.toggleAttribute("bare", Boolean(this.config.bare));
    return `<div class="raster" style="--tone:${TONES.accent}"></div>`;
  }

  wire() {
    const raster = this.$(".raster");
    this.on(raster, "click", (e) => {
      if (e.target.closest(".leeg")) this.naarInstellingen_();
      else this.tik_(e.target.closest(".knop"));
    });
    this.on(raster, "keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (e.target.closest(".leeg")) this.naarInstellingen_();
      else this.tik_(e.target.closest(".knop"));
    });
    this.abonnement_ = new BlijvendAbonnement({ type: `${COMMANDO}/subscribe` }, (stand) => {
      this.favorieten_ = stand.favorieten ?? [];
      if (this.hass) this.paint();
    });
    this.abonnement_.start(this.hass);
    this.teardown_.push(() => this.abonnement_.stop());
    this.teardown_.push(volgRaster(raster));
    this.teardown_.push(() => {
      for (const timer of this.nasleep_.values()) clearTimeout(timer);
      this.nasleep_.clear();
      this.favorieten_ = null;
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

  naarInstellingen_() {
    if (this.config.pad) runAction(this, this.hass, this.config, { action: "navigate", navigation_path: this.config.pad });
  }

  tik_(knop) {
    if (!knop) return;
    const id = knop.dataset.id;
    this.hass.connection
      .sendMessagePromise({ type: `${COMMANDO}/favoriet_uitvoeren`, favoriet: id })
      .then(() => this.toon_(id, "goed"))
      .catch((fout) => {
        console.warn("DomotiApp Favorieten:", fout);
        this.toon_(id, "fout");
      });
  }

  toon_(id, stand) {
    const knop = this.$(`.knop[data-id="${CSS.escape(id)}"]`);
    if (!knop) return;
    knop.dataset.stand = stand;
    clearTimeout(this.nasleep_.get(id));
    this.nasleep_.set(id, setTimeout(() => delete knop.dataset.stand, NASLEEP_MS));
  }

  paint() {
    const raster = this.$(".raster");
    const favorieten = this.favorieten_;
    if (favorieten) {
      const sig = JSON.stringify(favorieten.map((f) => [f.id, f.naam, f.icoon]));
      if (raster.dataset.sig !== sig) {
        raster.dataset.sig = sig;
        raster.innerHTML = favorieten.length
          ? favorieten
              .map(
                (f) => `<div class="knop surface" role="button" tabindex="0" data-id="${escapeHtml(f.id)}">
                  <span class="chip">${resolve(f.icoon, "star")}</span>
                  <span class="nm">${escapeHtml(f.naam)}</span>
                </div>`
              )
              .join("")
          : `<div class="leeg surface" style="grid-column:1/-1"${this.config.pad ? ` role="button" tabindex="0"` : ""}>${escapeHtml(t("Nog geen favorieten. Maak ze in de woninginstellingen."))}</div>`;
      }
    }
    meetRaster(raster);
  }

  getCardSize() {
    return 1;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: this.minRijen_(".raster", 1) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-favorieten-card-editor");
  }

  static getStubConfig() {
    return {};
  }
}

/** Alleen de link: wat erop staat, maakt de klant op de automatiseringskaart. */
class FavorietenEditor extends DacEditor {
  schema() {
    return [{ name: "pad", selector: sel.text() }];
  }

  label(s) {
    return s.name === "pad" ? t("Woninginstellingen") : super.label(s);
  }

  helper(s) {
    return s.name === "pad" ? t("Leeg laten: geen link. Bijvoorbeeld #instellingen: een tik op de lege kaart gaat daarheen.") : undefined;
  }
}

registerEditor("domotiapp-favorieten-card-editor", FavorietenEditor);
registerCard("domotiapp-favorieten-card", FavorietenCard, {
  name: nt("DomotiApp Favorieten"),
  description: nt("Knoppen die de klant zelf maakt op de automatiseringskaart: één tik zet lampen en rolluiken zoals hij koos."),
});

export { FavorietenCard };
