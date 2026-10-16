/**
 * DomotiApp Wifi: de QR-code van een wifi-netwerk, om gasten te laten
 * inloggen zonder iets over te typen.
 *
 * Gevraagd op 16 oktober 2026: *"en ik wil een wifi gastennetwerk kaart hebben
 * dat ook op het dashboard kan ik heb een qr code van unifi als entiteit
 * namelijk"*. Op het infoscherm staat hetzelfde als blok; deze kaart is voor
 * een gewoon dashboard. Wat UniFi geeft en wat niet staat in de kop van
 * `wifi-logica.js` -- kort: de QR-code en de netwerknaam wel, het wachtwoord
 * niet. Dat typ je zelf in, als je het als tekst wilt tonen.
 *
 * Drie rasterrijen hoog. De QR is 148 pixels: precies de PNG van UniFi
 * (schaal 4), dus niets opgeschaald. Met de marge en de rand is dat 182, en
 * `--dac-raster` maakt er 184 van. Bij 152 was het 186, en dan rondt het raster
 * op naar vier rijen (gemeten op 16 oktober 2026). Tik op de kaart en de code
 * staat groot in beeld (`wifi-groot.js`), om aan een gast te laten zien.
 */

import { DacCard, INCOMPLETE, TONES, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { meetRaster } from "../rasterhoogte.js";
import { eersteWifiQr, geenQrReden, netwerkNaam, qrAdres } from "./wifi-logica.js";
import { toonWifiGroot } from "./wifi-groot.js";

const TAG = "domotiapp-wifi-card";
const STANDAARD_TITEL = "Wifi voor gasten";

class WifiCard extends DacCard {
  static css = /* css */ `
    :host { display: block; container-type: inline-size; }
    *, *::before, *::after { box-sizing: border-box; }
    /* Het vak heeft één kind, de rij: meetRaster telt de kinderen van het vak
       ONDER elkaar op, en de code en de tekst naast elkaar telden zo als 298
       pixels (vijf rijen) terwijl het er 182 waren. */
    .card {
      min-height: var(--dac-raster, 56px);
      display: flex; flex-direction: column; justify-content: center; padding: 16px;
      cursor: pointer; -webkit-tap-highlight-color: transparent;
    }
    .rij { display: flex; align-items: center; gap: 16px; min-width: 0; }
    .card:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
    /* De PNG van UniFi heeft zijn eigen witte rand (vier modules); een vlak
       eromheen is niet nodig. Scherp opschalen met pixelated. */
    .qr {
      flex: 0 0 auto; width: 148px; height: 148px; border-radius: var(--dac-radius-sm);
      overflow: hidden; display: grid; place-items: center;
    }
    .qr img { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
    .qr .leeg {
      width: 100%; height: 100%; display: grid; place-items: center; padding: 12px; box-sizing: border-box;
      font-size: 12px; line-height: 1.35; text-align: center; color: var(--dac-ink-3);
      background: rgba(var(--dac-tint), .05); border: 1px dashed var(--dac-border-hi); border-radius: var(--dac-radius-sm);
    }
    .txt { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1 1 auto; }
    .titel { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--dac-ink-3); }
    .titel .icon { width: 15px; height: 15px; color: var(--tone); }
    .naam { font-size: 19px; font-weight: 600; letter-spacing: -.01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ww { font-size: 13px; color: var(--dac-ink-2); margin-top: 2px; overflow-wrap: anywhere; }
    .ww b { color: var(--dac-ink); font-weight: 600; font-variant-numeric: tabular-nums; user-select: all; }
    .hint { font-size: 12px; color: var(--dac-ink-3); margin-top: 4px; line-height: 1.35; }
    [hidden] { display: none !important; }
    @media (hover: hover) { .card:hover { background: var(--dac-hover); } }
    /* Smal (een halve sectie op een telefoon): een kleinere code, anders
       wordt de tekst ernaast een strookje van een woord breed. */
    @container (max-width: 330px) {
      .card { padding: 14px; }
      .rij { gap: 12px; }
      .qr { width: 112px; height: 112px; }
      .naam { font-size: 16px; }
      .hint { display: none; }
    }
  `;

  validate(config) {
    // Nooit gooien in setConfig: zonder entiteit een uitlegkaart.
    const c = { name: "", password: "", title: "", ...config };
    if (!c.entity) c[INCOMPLETE] = "Kies de QR-code van het wifi-netwerk (bij UniFi Network: de entiteit QR-code van het netwerk).";
    return c;
  }

  template() {
    return `
      <div class="card surface" role="button" tabindex="0" style="--tone:${TONES.accent}">
        <div class="rij">
          <div class="qr"><img alt="QR-code van de wifi" hidden /><div class="leeg" hidden></div></div>
          <div class="txt">
            <div class="titel">${resolve("wifi")}<span></span></div>
            <div class="naam"></div>
            <div class="ww" hidden>Wachtwoord <b></b></div>
            <div class="hint">Scan de code met de camera van je telefoon.</div>
          </div>
        </div>
      </div>`;
  }

  wire() {
    const groot = () => {
      const adres = qrAdres(this.hass, this.config.entity);
      if (!adres) return;
      toonWifiGroot({
        adres,
        titel: this.config.title || STANDAARD_TITEL,
        naam: netwerkNaam(this.hass, this.config.entity, this.config.name),
        wachtwoord: this.config.password,
      });
    };
    this.on(this.$(".card"), "click", groot);
    this.on(this.$(".card"), "keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        groot();
      }
    });
  }

  paint() {
    const c = this.config;
    // Een QR die niet bestaat heeft geen naam; zijn entity_id is er geen.
    const naam = this.hass?.states?.[c.entity] ? netwerkNaam(this.hass, c.entity, c.name) : c.name || "";
    this.text(".titel span", c.title || STANDAARD_TITEL);
    this.text(".naam", naam);
    this.$(".ww").hidden = !c.password;
    this.text(".ww b", c.password ?? "");

    // Het adres van NU: het token erin wisselt elke vijf minuten. Alleen een
    // ander adres zetten, anders knippert de code bij elke toestand van hass.
    const adres = qrAdres(this.hass, c.entity);
    const img = this.$(".qr img");
    if (adres && img.dataset.adres !== adres) {
      img.dataset.adres = adres;
      img.src = adres;
    }
    img.hidden = !adres;
    const leeg = this.$(".qr .leeg");
    leeg.hidden = Boolean(adres);
    this.text(leeg, adres ? "" : geenQrReden(this.hass, c.entity) ?? "");
    this.$(".card").setAttribute("aria-label", `${c.title || STANDAARD_TITEL}: ${naam}. Tik om de QR-code groot te tonen.`);
    meetRaster(this.$(".card"));
  }

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    // De hele sectie: de code en de tekst ernaast hebben samen zo'n 360
    // pixels nodig. Op de helft (zes kolommen) wordt de code kleiner.
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: this.minRijen_(".card", 3) };
  }

  static getConfigElement() {
    return document.createElement(`${TAG}-editor`);
  }

  /** Met de QR-code van een gastnetwerk als die er is. */
  static getStubConfig(hass) {
    const id = eersteWifiQr(hass);
    return id ? { entity: id } : {};
  }
}

class WifiEditor extends DacEditor {
  schema() {
    return [
      { name: "entity", required: true, selector: sel.entity(["image"]) },
      { name: "name", selector: sel.text() },
      { name: "password", selector: sel.text() },
      { name: "title", selector: sel.text() },
    ];
  }

  label(s) {
    return {
      entity: "QR-code van het wifi-netwerk",
      name: "Netwerknaam",
      password: "Wachtwoord (als tekst erbij)",
      title: "Kopje",
    }[s.name] ?? super.label(s);
  }

  helper(s) {
    return {
      entity:
        "Bij UniFi Network heeft elk wifi-netwerk een entiteit QR-code. Die staat standaard UIT (en is er alleen met een beheerdersaccount in UniFi): zet hem aan bij de entiteiten van het netwerk.",
      name: "Leeg laten: de naam van het netwerk uit UniFi.",
      password:
        "UniFi geeft het wachtwoord niet door aan Home Assistant; het zit alleen in de QR-code. Vul het hier in als je het ook als tekst wilt tonen, voor wie niet kan scannen. Wordt het in UniFi vernieuwd, dan past de QR-code zich aan, deze tekst niet.",
      title: `Leeg laten: "${STANDAARD_TITEL}".`,
    }[s.name];
  }
}

registerEditor(`${TAG}-editor`, WifiEditor);
registerCard(TAG, WifiCard, {
  name: "DomotiApp Wifi",
  description: "De QR-code van een wifi-netwerk (bijvoorbeeld het gastnetwerk van UniFi), met de netwerknaam. Tik erop en de code staat groot in beeld.",
});

export { WifiCard };
