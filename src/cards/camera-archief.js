/**
 * Het opslagscherm en het vergrote beeld, als eigen laag aan `document.body`.
 *
 * ## Waarom dit niet in de kaart zit
 *
 * Het zat er wel, en op een dashboard werkte dat. Maar op 28 augustus 2026
 * stuurde de eigenaar drie schermafdrukken uit zijn eigen huis, en daar staat de
 * camerakaart **in een pop-up van bubble-card**. Wat er misging:
 *
 * - de terugknop was onvindbaar -- *"ik zie geen pijltje?"*;
 * - de dagenlijst opende niet -- *"als ik op vandaag klik wordt hij blauw en
 *   gebeurt er niets"*.
 *
 * Eén oorzaak voor allebei: **`position: fixed` is niet vast aan het scherm
 * zodra een voorouder een `transform` of een `filter` heeft.** Zo'n voorouder
 * wordt dan zelf het referentievlak. Een pop-up die openschuift heeft die
 * transform, en dus vulde het opslagscherm de pop-up in plaats van het scherm --
 * met zijn kop erbuiten -- en landde de dagenlijst op coördinaten die tegen het
 * verkeerde vlak gerekend waren.
 *
 * Dat staat al sinds 26 augustus in `vraag.js` beschreven, met dezelfde
 * oplossing: aan `document.body` hangen. Daar is geen voorouder meer die het
 * referentievlak kan verzetten.
 *
 * ## Waarom het vergrote beeld hier ook in zit
 *
 * Omdat je het vanuit deze lijst opent, en twee losse lagen elkaar dan om de
 * beurt afdekken. In 0.31.1 stond het beeld op z-index 9 en de lijst op 10:
 * je tikte op een miniatuur en er gebeurde zichtbaar niets. Eén element dat
 * allebei tekent kan die volgorde niet verkeerd hebben.
 *
 * ## Wat dit element NIET doet
 *
 * Wissen. Het meldt alleen dát er gewist moet worden; de kaart stelt de vraag en
 * praat met de server. Dit element weet niets van websockets.
 */

import { meldAan } from "../registratie.js";
import { sheet, tokens } from "../theme.js";
import { resolve } from "../icons.js";
import { alsGrootte, dagLabel, perDag } from "./camera-filters.js";

const css = /* css */ `
  :host {
    ${tokens}
    position: fixed; inset: 0; z-index: 9990;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }
  *, *::before, *::after { box-sizing: border-box; }

  .scherm {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    background: var(--dac-bg);
    padding:
      env(safe-area-inset-top) env(safe-area-inset-right)
      env(safe-area-inset-bottom) env(safe-area-inset-left);
  }

  .kop {
    display: flex; align-items: center; gap: 10px; flex: 0 0 auto;
    padding: 14px 16px; border-bottom: 1px solid var(--dac-border);
  }
  .titel { font-size: 15px; font-weight: 600; }
  .stat { font-size: 11.5px; color: var(--dac-ink-3); }
  .rek { flex: 1 1 auto; }

  /* De terugknop draagt het WOORD en niet alleen een pijl. Een kruisje
     rechtsboven had hij niet gevonden, en dit scherm ligt over alles heen: wie
     de uitgang niet ziet, zit vast. */
  .terug {
    flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px 7px 10px; cursor: pointer; font: inherit; font-size: 13px;
    color: var(--dac-ink); background: var(--dac-surface);
    border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-pill);
  }
  .terug .icon { width: 16px; height: 16px; transform: rotate(180deg); }

  .wis {
    flex: 0 0 auto; padding: 7px 13px; cursor: pointer; font: inherit;
    font-size: 12.5px; color: var(--dac-ink-2); background: var(--dac-surface);
    border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
  }
  .wis[disabled] { opacity: .4; cursor: default; }

  .lijst {
    flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain;
    padding: 12px 16px 20px;
  }
  .dagkop {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 0 8px; font-size: 12.5px; font-weight: 600;
  }
  .dagkop .bij { font-weight: 400; font-size: 11px; color: var(--dac-ink-3); }
  .dagkop button {
    margin-left: auto; padding: 5px 11px; cursor: pointer; font: inherit;
    font-size: 11px; color: var(--dac-ink-3); background: transparent;
    border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
  }
  .raster {
    display: grid; gap: 8px;
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  }
  .kiek {
    position: relative; padding: 0; cursor: pointer; overflow: hidden;
    aspect-ratio: 16 / 9; background: #000;
    border: 1px solid var(--dac-border); border-radius: var(--dac-radius-sm);
  }
  .kiek img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .kiek .bij {
    position: absolute; left: 0; right: 0; bottom: 0;
    padding: 12px 6px 4px; font-size: 10px; line-height: 1.3; color: #fff;
    text-align: left; text-shadow: 0 1px 2px rgba(0,0,0,.85);
    background: linear-gradient(to top, rgba(0,0,0,.82), transparent);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .kiek .weg {
    position: absolute; top: 4px; right: 4px; width: 26px; height: 26px;
    display: grid; place-items: center; padding: 0; cursor: pointer;
    color: #fff; background: rgba(0,0,0,.55); border: none; border-radius: 50%;
  }
  .kiek .weg .icon { width: 13px; height: 13px; }
  .leeg { padding: 30px 0; text-align: center; color: var(--dac-ink-3); font-size: 12.5px; }

  .voet {
    flex: 0 0 auto; padding: 10px 16px 14px; font-size: 10.5px; line-height: 1.5;
    color: var(--dac-ink-3); border-top: 1px solid var(--dac-border);
  }

  /* Het vergrote beeld ligt IN dit element, dus altijd erboven. */
  .groot {
    position: absolute; inset: 0; z-index: 2; display: grid; place-items: center;
    background: rgba(0,0,0,.9); padding: 16px; cursor: zoom-out;
  }
  .groot[hidden] { display: none; }
  .groot img { max-width: 100%; max-height: 82vh; border-radius: var(--dac-radius-sm); }
  .groot .terug {
    position: absolute; top: max(14px, env(safe-area-inset-top)); left: 14px;
    color: #fff; background: rgba(0,0,0,.55); border-color: rgba(255,255,255,.24);
    backdrop-filter: blur(8px);
  }
  .groot .onder {
    position: absolute; left: 0; right: 0; bottom: max(16px, env(safe-area-inset-bottom));
    text-align: center; color: #fff; font-size: 12.5px;
    text-shadow: 0 1px 3px rgba(0,0,0,.8);
  }
`;

function veilig(waarde) {
  return String(waarde ?? "").replace(/[&<>"']/g, (t) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]
  );
}

class CameraArchief extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [sheet(css)];
    this.beelden_ = [];
  }

  /**
   * Open het scherm.
   *
   * @param {object} opts
   * @param {Array<object>} opts.beelden
   * @param {(camera: string) => string} opts.camNaam
   * @param {boolean} opts.meerdere staan er meer camera's op de kaart?
   * @param {(iso: string, volledig?: boolean) => string} opts.klok
   * @param {(ids: string[], wat: string) => void} opts.wis
   * @param {string} [opts.beeld] open meteen dit ene beeld groot, zonder lijst
   */
  open(opts) {
    this.opts_ = opts;
    this.beelden_ = opts.beelden ?? [];
    if (!this.gebouwd_) this.bouw_();
    this.setAttribute("open", "");
    this.alleenBeeld_ = Boolean(opts.beeld);
    this.$(".scherm").hidden = this.alleenBeeld_;
    if (opts.beeld) this.toonGroot_(opts.beeld);
    else this.$(".groot").hidden = true;
    this.teken_();
  }

  /** Nieuwe voorraad, terwijl het scherm openstaat. */
  zet(beelden) {
    this.beelden_ = beelden ?? [];
    if (this.hasAttribute("open")) this.teken_();
  }

  sluit() {
    this.removeAttribute("open");
    this.opts_?.dicht?.();
  }

  $(sel) {
    return this.shadowRoot.querySelector(sel);
  }

  bouw_() {
    this.gebouwd_ = true;
    this.shadowRoot.innerHTML = `
      <div class="scherm">
        <div class="kop">
          <button type="button" class="terug">${resolve("chevronRight")}<span>Terug</span></button>
          <span class="titel">Snapshots</span>
          <span class="stat"></span>
          <span class="rek"></span>
          <button type="button" class="wis">Alles wissen</button>
        </div>
        <div class="lijst"></div>
        <div class="voet">Snapshots blijven een week staan en verdwijnen daarna vanzelf, oudste eerst. Per camera worden er hoogstens 500 bewaard.</div>
      </div>
      <div class="groot" hidden>
        <button type="button" class="terug">${resolve("chevronRight")}<span>Terug</span></button>
        <img alt=""><div class="onder"></div>
      </div>`;

    this.shadowRoot.addEventListener("click", (e) => {
      e.stopPropagation();
      const groot = this.$(".groot");

      // De terugknop van het grote beeld eerst: die ligt bovenop.
      if (!groot.hidden) {
        if (e.composedPath().includes(groot)) {
          // Ook buiten het beeld tikken sluit hem; dat werkte al en blijft zo.
          if (this.alleenBeeld_) return this.sluit();
          groot.hidden = true;
          return;
        }
      }

      if (e.target.closest?.(".terug")) return this.sluit();

      const weg = e.target.closest?.("[data-weg]");
      if (weg) {
        const beeld = this.beelden_.find((b) => b.id === weg.dataset.weg);
        return this.opts_?.wis?.(
          [weg.dataset.weg],
          beeld ? `dit beeld van ${beeld.naam ?? "de camera"}` : "dit beeld"
        );
      }

      const dag = e.target.closest?.("[data-wisdag]");
      if (dag) {
        const groep = perDag(this.beelden_).find((g) => String(g.dag) === dag.dataset.wisdag);
        if (!groep) return;
        return this.opts_?.wis?.(
          groep.beelden.map((b) => b.id),
          `${groep.beelden.length} beelden van ${dagLabel(groep.dag).toLowerCase()}`
        );
      }

      if (e.target.closest?.(".wis")) {
        if (!this.beelden_.length) return;
        return this.opts_?.wis?.(
          this.beelden_.map((b) => b.id),
          `alle ${this.beelden_.length} beelden`
        );
      }

      const kiek = e.target.closest?.("[data-beeld]");
      if (kiek) this.toonGroot_(kiek.dataset.beeld);
    });

    // Escape sluit, net als bij de bevestigingsvraag.
    this.tabIndex = -1;
    this.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      if (!this.$(".groot").hidden && !this.alleenBeeld_) this.$(".groot").hidden = true;
      else this.sluit();
    });
  }

  toonGroot_(beeldId) {
    const beeld = this.beelden_.find((b) => b.id === beeldId);
    if (!beeld) return;
    const laag = this.$(".groot");
    laag.querySelector("img").src = beeld.url;
    laag.querySelector(".onder").textContent =
      `${this.opts_.camNaam(beeld.camera)} · ${beeld.naam ?? ""} · ${this.opts_.klok(beeld.tijd, true)}`;
    laag.hidden = false;
  }

  teken_() {
    if (this.alleenBeeld_) return;
    const groepen = perDag(this.beelden_);
    const bytes = this.beelden_.reduce((som, b) => som + (Number(b.bytes) || 0), 0);
    const meerdere = this.opts_.meerdere;

    this.$(".stat").textContent = this.beelden_.length
      ? `${this.beelden_.length} beelden · ${alsGrootte(bytes)}`
      : "";
    this.$(".wis").disabled = !this.beelden_.length;

    this.$(".lijst").innerHTML = groepen.length
      ? groepen
          .map((groep) => {
            const kop = groep.dag === null ? "Zonder datum" : dagLabel(groep.dag);
            return (
              `<div class="dagkop"><span>${veilig(kop)}</span>` +
              `<span class="bij">${groep.beelden.length} · ${alsGrootte(groep.bytes)}</span>` +
              `<button type="button" data-wisdag="${groep.dag}">Wis deze dag</button></div>` +
              `<div class="raster">` +
              groep.beelden
                .map((beeld) => {
                  const cam = meerdere ? `${veilig(this.opts_.camNaam(beeld.camera))} · ` : "";
                  return (
                    `<button type="button" class="kiek" data-beeld="${veilig(beeld.id)}">` +
                    `<img src="${veilig(beeld.url)}" alt="" loading="lazy">` +
                    `<span class="bij">${cam}${veilig(beeld.naam ?? "")} · ` +
                    `${veilig(this.opts_.klok(beeld.tijd))}</span>` +
                    `<span class="weg" role="button" data-weg="${veilig(beeld.id)}"` +
                    ` aria-label="Verwijder">${resolve("close")}</span></button>`
                  );
                })
                .join("") +
              `</div>`
            );
          })
          .join("")
      : `<div class="leeg">Er liggen geen snapshots.</div>`;

    // Staat het grote beeld open op iets dat net gewist is? Dan hoort het dicht.
    const groot = this.$(".groot");
    if (!groot.hidden && this.alleenBeeld_ === false) {
      const nog = this.beelden_.some((b) => groot.querySelector("img").src.includes(b.id));
      if (!nog) groot.hidden = true;
    }
  }
}

meldAan("domotiapp-camera-archief", CameraArchief);

/** Het ene scherm van de hele pagina, net als bij de bevestigingsvraag. */
export function openArchief(opts) {
  let scherm = document.querySelector("domotiapp-camera-archief");
  if (!scherm) {
    scherm = document.createElement("domotiapp-camera-archief");
    document.body.appendChild(scherm);
  }
  scherm.open(opts);
  scherm.focus?.();
  return scherm;
}

/** Werk de voorraad bij als het scherm openstaat; anders doet dit niets. */
export function ververArchief(beelden) {
  document.querySelector("domotiapp-camera-archief")?.zet(beelden);
}
