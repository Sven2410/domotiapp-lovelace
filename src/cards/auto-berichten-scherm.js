/**
 * De berichten van de auto, open na een tik op de tegel Berichten van de autokaart (sinds 0.141.0).
 *
 * Elk bericht met zijn onderwerp, wanneer het kwam (op de klok van Home Assistant) en de tekst. Onderaan **Alles
 * wissen** als het merk een wisknop heeft (zie `wisKnopVan` in auto-berichten.js); dat wist bij de fabrikant zelf, dus
 * eerst een vraag. Daarna komt de lijst vanzelf leeg binnen zodra de integratie ververst (bij Ford binnen 20 s).
 *
 * Het hangt aan `document.body` (valkuil 34), en de pagina eronder staat vast zolang het open is (`zetScrollSlot`).
 * De KAART kent de berichten (`bron.berichtenInhoud_()`) en drukt op de knop (`bron.wis_()`); het scherm tekent en
 * vraagt, en tekent opnieuw als de kaart een nieuwe toestand krijgt. Alle tekst van de auto gaat er met
 * `textContent` in, nooit als html.
 */

import { meldAan } from "../registratie.js";
import { sheet, tokens, themaCss } from "../theme.js";
import { volgThema } from "../thema.js";
import { resolve } from "../icons.js";
import { zetScrollSlot } from "../scrollslot.js";
import { vraagBevestiging } from "../vraag.js";
import { locale, t, tn } from "../taal.js";

const css = /* css */ `
  ${themaCss}
  :host {
    ${tokens}
    position: fixed; inset: 0; z-index: 9999;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }
  *, *::before, *::after { box-sizing: border-box; }
  [hidden] { display: none !important; }

  .laag {
    position: absolute; inset: 0; display: grid; place-items: center;
    padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
      max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
    background: var(--dac-scrim); animation: op 140ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }
  .vak {
    width: min(460px, 100%); max-height: 100%; min-height: 0;
    display: flex; flex-direction: column;
    border-radius: var(--dac-radius); background: var(--dac-bg-raise); border: 1px solid var(--dac-border);
    box-shadow: 0 24px 60px -20px rgba(0,0,0,calc(.7 * var(--dac-diepte)));
    outline: none;
  }
  .kop { display: flex; align-items: center; gap: 10px; padding: 14px 14px 10px 18px; }
  .kop .tekst { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
  h2 {
    margin: 0; font-size: 15.5px; font-weight: 600; letter-spacing: -.01em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sub { font-size: 12px; color: var(--dac-ink-3); }
  .sluit {
    flex: 0 0 auto; width: 36px; height: 36px; padding: 0; display: grid; place-items: center; cursor: pointer;
    border-radius: var(--dac-radius-pill); border: 1px solid var(--dac-border);
    background: var(--dac-surface); color: var(--dac-ink-2);
  }
  .sluit .icon { width: 16px; height: 16px; }

  .lijst {
    flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain;
    padding: 0 18px; border-top: 1px solid var(--dac-border); border-bottom: 1px solid var(--dac-border);
  }
  .bericht { padding: 12px 0; display: flex; flex-direction: column; gap: 3px; }
  .bericht + .bericht { border-top: 1px solid var(--dac-border); }
  .bericht .regel { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .bericht .ond { font-size: 14px; font-weight: 600; line-height: 1.3; min-width: 0; overflow-wrap: anywhere; }
  .bericht .wn { flex: 0 0 auto; font-size: 11.5px; color: var(--dac-ink-3); font-variant-numeric: tabular-nums; }
  .bericht .txt { font-size: 13px; line-height: 1.45; color: var(--dac-ink-2); white-space: pre-line; overflow-wrap: anywhere; }
  .leeg { padding: 22px 0; font-size: 13px; color: var(--dac-ink-3); text-align: center; }

  .voet { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px 14px 18px; }
  .uitkomst { font-size: 12px; color: var(--dac-ink-3); min-width: 0; }
  .uitkomst[data-fout] { color: var(--dac-bad); }
  .wis {
    flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
    min-height: 40px; padding: 8px 14px; font: inherit; font-size: 13px; font-weight: 500;
    border-radius: var(--dac-radius-pill); border: 1px solid var(--dac-border);
    background: transparent; color: var(--dac-ink-2);
  }
  .wis .icon { width: 15px; height: 15px; }
  .wis:disabled { opacity: .5; cursor: default; }
  @media (hover: hover) {
    .sluit:hover, .wis:not(:disabled):hover { background: var(--dac-hover); color: var(--dac-ink); }
  }
  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
`;

let sheets = null;

class AutoBerichtenScherm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    sheets = sheets ?? [sheet(css)];
    this.shadowRoot.adoptedStyleSheets = sheets;
    this.bron = null;
  }

  $(s) {
    return this.shadowRoot.querySelector(s);
  }

  bouw_() {
    this.shadowRoot.innerHTML = `
      <div class="laag" role="dialog" aria-modal="true">
        <div class="vak" tabindex="-1">
          <div class="kop">
            <span class="tekst"><h2></h2><span class="sub"></span></span>
            <button class="sluit" type="button">${resolve("close")}</button>
          </div>
          <div class="lijst"></div>
          <div class="voet">
            <span class="uitkomst" role="status"></span>
            <button class="wis" type="button">${resolve("bin")}<span></span></button>
          </div>
        </div>
      </div>`;
    this.gebouwd_ = true;
    this.$(".sluit").addEventListener("click", () => this.sluit());
    this.$(".laag").addEventListener("click", (e) => {
      if (e.target === this.$(".laag")) this.sluit();
    });
    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.hasAttribute("open")) this.sluit();
    });
    this.$(".wis").addEventListener("click", () => this.wis_());
  }

  open(bron) {
    volgThema(this);
    if (!this.gebouwd_) this.bouw_();
    this.bron = bron;
    this.uitkomst_ = null;
    this.$(".sluit").setAttribute("aria-label", t("Sluiten"));
    this.$(".wis span").textContent = t("Alles wissen");
    this.scrollLos_ ??= zetScrollSlot();
    this.setAttribute("open", "");
    this.teken();
    this.$(".lijst").scrollTop = 0;
    setTimeout(() => this.$(".vak")?.focus(), 40);
  }

  sluit() {
    this.scrollLos_?.();
    this.scrollLos_ = null;
    this.removeAttribute("open");
    this.bron = null;
  }

  isVan(kaart) {
    return this.hasAttribute("open") && this.bron === kaart;
  }

  teken() {
    const inhoud = this.bron?.berichtenInhoud_?.();
    if (!inhoud) return;
    const { naam, berichten, knop, tijd } = inhoud;
    this.$("h2").textContent = naam;
    this.$(".sub").textContent = berichten
      ? berichten.length
        ? tn(berichten.length, "{n} bericht", "{n} berichten")
        : t("Geen berichten")
      : t("Niet bereikbaar");
    this.$(".laag").setAttribute("aria-label", t("Berichten van {naam}", { naam }));

    const lijst = this.$(".lijst");
    const sig = JSON.stringify(berichten?.map((b) => b.sleutel) ?? null);
    if (lijst.dataset.sig !== sig) {
      lijst.dataset.sig = sig;
      lijst.replaceChildren(
        ...(berichten?.length
          ? berichten.map((b) => {
              const el = document.createElement("div");
              el.className = "bericht";
              el.innerHTML = `<div class="regel"><span class="ond"></span><span class="wn"></span></div><div class="txt"></div>`;
              el.querySelector(".ond").textContent = b.onderwerp || t("Bericht");
              el.querySelector(".wn").textContent = b.datum ? wanneerKort(tijd(b.datum)) : "";
              el.querySelector(".txt").textContent = b.tekst;
              el.querySelector(".txt").hidden = !b.tekst;
              return el;
            })
          : [leeg(berichten ? t("Er staan geen berichten van de auto.") : t("De auto zegt nu niets. Probeer het straks nog eens."))])
      );
    }

    // Is de lijst na het wissen leeg binnengekomen, dan is "de lijst wordt leeg" geen nieuws meer.
    if (berichten && !berichten.length && !this.bezig_ && this.uitkomst_ && !this.uitkomst_.fout) this.uitkomst_ = null;
    const wis = this.$(".wis");
    wis.hidden = !knop;
    wis.disabled = !berichten?.length || this.bezig_;
    const uit = this.$(".uitkomst");
    uit.textContent = this.uitkomst_?.tekst ?? "";
    uit.toggleAttribute("data-fout", Boolean(this.uitkomst_?.fout));
  }

  async wis_() {
    const inhoud = this.bron?.berichtenInhoud_?.();
    if (!inhoud?.knop || !inhoud.berichten?.length || this.bezig_) return;
    const bron = this.bron;
    const ja = await vraagBevestiging({
      title: t("Alle berichten wissen?"),
      text: inhoud.merk
        ? t("Ze worden bij {merk} gewist. Dat is niet terug te draaien.", { merk: inhoud.merk })
        : t("Ze worden bij de fabrikant gewist. Dat is niet terug te draaien."),
      confirmText: t("Wissen"),
    });
    if (!ja || this.bron !== bron) return;
    this.bezig_ = true;
    this.uitkomst_ = { tekst: t("Bezig met wissen…") };
    this.teken();
    try {
      await bron.wis_();
      this.uitkomst_ = { tekst: t("Gewist. De lijst wordt leeg zodra de auto het bevestigt.") };
    } catch (fout) {
      this.uitkomst_ = { tekst: t("Wissen mislukt: {fout}", { fout: fout?.message ?? fout }), fout: true };
    }
    this.bezig_ = false;
    if (this.bron === bron) this.teken();
  }
}

function leeg(tekst) {
  const el = document.createElement("div");
  el.className = "leeg";
  el.textContent = tekst;
  return el;
}

/** "10 nov, 07:50", of met het jaar als het niet dit jaar is. `w` is een wandtijd (zie wandklok.js). */
function wanneerKort(w) {
  if (!w || Number.isNaN(w.getTime())) return "";
  const opties = { day: "numeric", month: "short" };
  if (w.getFullYear() !== new Date().getFullYear()) opties.year = "numeric";
  return `${w.toLocaleDateString(locale(), opties)}, ${w.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" })}`;
}

meldAan("domotiapp-auto-berichten", AutoBerichtenScherm);

/** Open het ene berichtenscherm van deze pagina voor deze kaart. */
export function toonAutoBerichten(kaart) {
  let scherm = document.querySelector("domotiapp-auto-berichten");
  if (!scherm) {
    scherm = document.createElement("domotiapp-auto-berichten");
    document.body.appendChild(scherm);
  }
  scherm.tabIndex = -1;
  scherm.open(kaart);
  return scherm;
}

/** Het open scherm, als het er is. */
export const autoBerichtenScherm = () => document.querySelector("domotiapp-auto-berichten");
