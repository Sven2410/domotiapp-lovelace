/**
 * Het dialoog van de windbeveiliging (sinds 0.134.0).
 *
 * De eigenaar tikte op de rij Windbeveiliging en kreeg de windsensor te zien; hij wilde hem wijzigen, net als een regel.
 * Hier staan aan of uit, de grens, de sensor, en per zonnescherm of hij meedoet en of de motor omgekeerd is. Het staat
 * in de opslag van de integratie, voor het hele huis (zie de kop van `automatisering/wind.py`). Alleen een beheerder
 * kan opslaan; een ander ziet hetzelfde om te lezen.
 *
 * Hangt aan `document.body` (valkuil 34), net als het scherm van een regel, en gebruikt diens stijlblad.
 */

import { meldAan } from "../registratie.js";
import { sheet } from "../theme.js";
import { volgThema } from "../thema.js";
import { resolve } from "../icons.js";
import { moreInfo } from "../ha.js";
import { t } from "../taal.js";
import { sensorNamen, stapGrens, verdachteSchermen, windBlok, windConcept, windNaarServer, windSensoren, windKmh, windWaaromNiet } from "./automatisering-logica.js";
import { schermSheets } from "./automatisering-scherm.js";

const eigenCss = /* css */ `
  .nu { display: flex; flex-direction: column; gap: 2px; }
  .nu b { font-size: 14px; font-weight: 600; }
  .nu[data-soort="te_hard"] b, .nu[data-soort="geen_meting"] b { color: var(--dac-warn); }
  .nu span { font-size: 12.5px; line-height: 1.35; color: var(--dac-ink-2); }
  .nu .laatst { color: var(--dac-ink-3); }
  .nu .nieuw { align-self: flex-start; margin-top: 8px; padding: 0 12px; }
  .alleen { font-size: 12.5px; line-height: 1.4; color: var(--dac-ink-2); }
  button:disabled { cursor: default; }
  /* Hier loopt de tekst door op een volgende regel: de waarschuwing bij omgekeerd en het eind van een sensornaam (de _2
     die twee gelijke namen uit elkaar houdt) zijn juist wat er niet af mag. */
  .vt small { white-space: normal; line-height: 1.35; }
  .opties .keus { height: auto; padding-top: 7px; padding-bottom: 7px; border-radius: 14px; text-align: left; }
  .opties .keus .tk { white-space: normal; overflow-wrap: anywhere; line-height: 1.3; }
  .vinkje:disabled, .keus:disabled { opacity: .6; }
`;

const veilig = (tekst) =>
  String(tekst ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

let eigen = null;

class WindScherm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    eigen = eigen ?? sheet(eigenCss);
    this.shadowRoot.adoptedStyleSheets = [...schermSheets(), eigen];
    this.bron = null;
    this.concept = null;
  }

  $(s) {
    return this.shadowRoot.querySelector(s);
  }

  bouw_() {
    this.shadowRoot.innerHTML = `
      <div class="laag">
        <div class="vak" role="dialog" aria-modal="true" aria-labelledby="kop" tabindex="-1">
          <header>
            <span class="kopicoon">${resolve("wind")}</span>
            <b id="kop"></b>
            <button class="sluit" type="button">${resolve("close")}</button>
          </header>
          <div class="form"></div>
          <div class="fout" role="status" hidden></div>
          <div class="knoppen">
            <button class="nee" type="button"></button>
            <button class="ja" type="button"></button>
          </div>
        </div>
      </div>`;
    this.gebouwd_ = true;
    this.$(".sluit").addEventListener("click", () => this.sluit());
    this.$(".nee").addEventListener("click", () => this.sluit());
    this.$(".ja").addEventListener("click", () => this.bewaar_());
    this.$(".laag").addEventListener("click", (e) => {
      if (e.target === this.$(".laag")) this.sluit();
    });
    this.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.hasAttribute("open")) this.sluit();
    });
    this.$(".form").addEventListener("click", (e) => this.tik_(e.target.closest("[data-k]")));
  }

  /**
   * @param {object} bron de kaart: `hass`, `naamVanLamp_(id)` en `opslaanWind(instelling)`
   * @param {object} wind `wind` uit de stand van de server
   */
  open(bron, wind) {
    volgThema(this);
    if (!this.gebouwd_) this.bouw_();
    this.bron = bron;
    this.wind_ = wind;
    this.concept = windConcept(wind);
    this.foutTekst_ = "";
    this.bezig_ = false;
    this.$("#kop").textContent = t("Windbeveiliging");
    this.$(".sluit").setAttribute("aria-label", t("Sluiten"));
    this.$(".ja").textContent = t("Opslaan");
    this.$(".ja").hidden = !this.magWijzigen_();
    this.$(".nee").textContent = this.magWijzigen_() ? t("Annuleren") : t("Sluiten");
    this.setAttribute("open", "");
    this.teken_();
    setTimeout(() => this.$(".vak")?.focus(), 40);
  }

  /** Een nieuwe stand van de server terwijl het open is: de wind van nu, niet wat er gekozen wordt. */
  ververs(wind) {
    if (!this.concept || !wind) return;
    this.wind_ = wind;
    this.teken_();
  }

  sluit() {
    this.removeAttribute("open");
    this.bron = null;
    this.concept = null;
  }

  isVan(kaart) {
    return this.hasAttribute("open") && this.bron === kaart;
  }

  magWijzigen_() {
    return this.bron?.hass?.user?.is_admin === true;
  }

  naam_(id) {
    return this.bron?.naamVanLamp_?.(id) ?? this.bron?.hass?.states?.[id]?.attributes?.friendly_name ?? id;
  }

  kop_(icoon, tekst) {
    return `<div class="kop"><span class="kt">${resolve(icoon)}${veilig(tekst)}</span></div>`;
  }

  vinkje_(k, aan, titel, onder, { ingesprongen = false } = {}) {
    const uit = this.magWijzigen_() ? "" : " disabled";
    return `<button type="button" class="vinkje" role="checkbox" aria-checked="${aan}" data-k="${veilig(k)}"${ingesprongen ? ' data-onder="true"' : ""}${uit}>
      <span class="vak-v">${resolve("check")}</span>
      <span class="vt"><b>${veilig(titel)}</b>${onder ? `<small>${veilig(onder)}</small>` : ""}</span>
    </button>`;
  }

  teken_() {
    const c = this.concept;
    if (!c) return;
    const hass = this.bron?.hass;
    const states = hass?.states ?? {};
    const focus = this.shadowRoot.activeElement?.dataset?.k;
    const uit = this.magWijzigen_() ? "" : " disabled";
    const blok = windBlok(this.wind_, states, (id) => this.naam_(id));
    const kiesbaar = this.wind_?.kiesbaar ?? [];
    const verdacht = new Set(verdachteSchermen(kiesbaar, Object.keys(c.omgekeerd).filter((id) => c.omgekeerd[id]), states));
    const sensoren = windSensoren(states, c.sensor, (id) => this.naam_(id));
    const sensorNaam = sensorNamen(sensoren, (id) => this.naam_(id));
    const metingVan = (id) => {
      const kmh = windKmh(states[id]);
      return kmh == null ? t("geen meting") : t("{kmh} km/h", { kmh: Math.round(kmh) });
    };

    this.$(".form").innerHTML = `
      ${
        blok
          ? `<div class="groep nu" data-soort="${veilig(blok.soort)}">
              <b>${veilig(blok.kop)}</b>
              <span>${veilig(blok.uitleg)}</span>
              ${blok.regels.length ? `<span class="laatst">${veilig(blok.regels.at(-1))}</span>` : ""}
              ${this.wind_?.sensor ? `<button type="button" class="nieuw" data-k="sensorinfo:">${resolve("windSpeed")}${veilig(t("Windsensor bekijken"))}</button>` : ""}
            </div>`
          : ""
      }
      ${this.magWijzigen_() ? "" : `<div class="groep"><div class="alleen">${veilig(t("Alleen een beheerder kan de windbeveiliging wijzigen."))}</div></div>`}
      <div class="groep">
        <div class="vinkjes">${this.vinkje_("aan:", c.aan, t("Windbeveiliging aan"), t("Bij harde wind gaan de zonneschermen in, en rollen ze niet uit."))}</div>
      </div>
      ${
        c.aan
          ? `<div class="groep">
              ${this.kop_("windSpeed", t("Windgrens"))}
              <div class="stapper">
                <button type="button" data-k="grens:min" aria-label="${veilig(t("Lager"))}"${uit || (c.max <= 5 ? " disabled" : "")}>${resolve("minus")}</button>
                <span class="wat">${veilig(t("{kmh} km/h", { kmh: c.max }))}</span>
                <button type="button" data-k="grens:plus" aria-label="${veilig(t("Hoger"))}"${uit || (c.max >= 100 ? " disabled" : "")}>${resolve("plus")}</button>
              </div>
            </div>
            <div class="groep">
              ${this.kop_("wind", t("Windsensor"))}
              ${
                sensoren.length
                  ? `<div class="opties">${sensoren
                      .map(
                        (id) =>
                          `<button type="button" class="keus" role="radio" aria-checked="${id === c.sensor}" data-k="sensor:${veilig(id)}"${uit}>${resolve("windSpeed")}<span class="tk">${veilig(sensorNaam.get(id))} · ${veilig(metingVan(id))}</span></button>`
                      )
                      .join("")}</div>`
                  : `<div class="niets">${veilig(t("Geen sensor met een windsnelheid gevonden."))}</div>`
              }
            </div>`
          : ""
      }
      <div class="groep">
        ${this.kop_("awning", t("Zonneschermen"))}
        <div class="vinkjes">${kiesbaar
          .map(
            (id) =>
              this.vinkje_(`mee:${id}`, !c.zonder.includes(id), this.naam_(id), c.aan ? t("Doet mee met de windbeveiliging") : "") +
              this.vinkje_(
                `om:${id}`,
                c.omgekeerd[id] === true,
                t("Motor omgekeerd"),
                verdacht.has(id) ? t("Meldt zich niet als zonnescherm: rolt dicht hem uit? Zet dit dan aan.") : t("Dicht is bij dit scherm uitrollen."),
                { ingesprongen: true }
              )
          )
          .join("")}</div>
      </div>`;
    if (focus) this.$(".form").querySelector(`[data-k="${CSS.escape(focus)}"]`)?.focus();
    this.kijkNa_();
  }

  kijkNa_() {
    const reden = this.magWijzigen_() ? windWaaromNiet(this.concept) : "";
    const tekst = this.foutTekst_ || reden;
    const fout = this.$(".fout");
    fout.textContent = tekst;
    fout.hidden = !tekst;
    this.$(".ja").disabled = Boolean(reden) || this.bezig_;
  }

  tik_(knop) {
    if (!knop || !this.concept) return;
    const [soort, ...rest] = knop.dataset.k.split(":");
    const waarde = rest.join(":");
    if (soort === "sensorinfo") {
      const sensor = this.wind_?.sensor;
      const kaart = this.bron;
      this.sluit();
      if (sensor && kaart) moreInfo(kaart, sensor);
      return;
    }
    if (!this.magWijzigen_()) return;
    const c = this.concept;
    if (soort === "aan") c.aan = !c.aan;
    else if (soort === "grens") c.max = stapGrens(c.max, waarde === "plus" ? 1 : -1);
    else if (soort === "sensor") c.sensor = waarde;
    else if (soort === "mee") c.zonder = c.zonder.includes(waarde) ? c.zonder.filter((id) => id !== waarde) : [...c.zonder, waarde];
    else if (soort === "om") c.omgekeerd = { ...c.omgekeerd, [waarde]: !c.omgekeerd[waarde] };
    this.foutTekst_ = "";
    this.teken_();
  }

  async bewaar_() {
    if (!this.concept || !this.magWijzigen_() || windWaaromNiet(this.concept) || this.bezig_) return;
    this.bezig_ = true;
    this.kijkNa_();
    try {
      await this.bron.opslaanWind(windNaarServer(this.concept));
      this.sluit();
    } catch (fout) {
      this.bezig_ = false;
      this.foutTekst_ = fout?.message || t("Opslaan is niet gelukt.");
      if (this.concept) this.kijkNa_();
    }
  }
}

meldAan("domotiapp-wind-scherm", WindScherm);

/** Open het ene winddialoog van deze pagina. */
export function toonWindScherm(kaart, wind) {
  let scherm = document.querySelector("domotiapp-wind-scherm");
  if (!scherm) {
    scherm = document.createElement("domotiapp-wind-scherm");
    document.body.appendChild(scherm);
  }
  scherm.tabIndex = -1;
  scherm.open(kaart, wind);
  return scherm;
}

export const windScherm = () => document.querySelector("domotiapp-wind-scherm");
