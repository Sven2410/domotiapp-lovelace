/**
 * DomotiApp Brandstof: de landelijke adviesprijzen als prijsborden, zoals bij een tankstation (sinds 0.143.0).
 *
 * Zie de kop van `brandstof-logica.js` voor de woorden van de eigenaar, en `brandstof.py` voor waar de prijzen
 * vandaan komen. Hier staat waarom de kaart eruitziet zoals hij eruitziet.
 *
 * ## Een bord per brandstof
 *
 * Een tankstation toont zijn prijzen op een bord: de naam, en een groot getal in cijfers van zeven segmenten, met de
 * laatste cijfer klein en hoog. Dat is het hele idee van de kaart, dus elke brandstof krijgt zo'n bord. Daarbij de trend
 * tegenover gisteren (rood omhoog, groen omlaag: status, geen identiteit) en een lijntje van een maand, want een prijs
 * zegt pas iets naast die van de week ervoor.
 *
 * Het voorbeeld van de eigenaar was een Duitse kaart met een rij per tankstation. Die prijzen per pomp zijn er voor
 * Nederland niet open; hij koos de adviesprijs. Er staat dus geen pomp, geen adres en geen "open" op.
 *
 * ## Ophalen
 *
 * De kaart vraagt de server (`domotiapp_lovelace/brandstof/prijzen`), bij het tekenen, als de pagina weer zichtbaar
 * wordt, en elk half uur. De server haalt pas op als het langer dan een uur geleden is; tien tablets met de kaart halen de
 * bron dus één keer per uur op. Na een herstart kent Home Assistant het commando even niet (valkuil 28): dan straks
 * opnieuw.
 */

import { DacCard, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { Herkansing, Verbindingswacht, nogNietGereed } from "../herkansing.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { resolve } from "../icons.js";
import { locale, nt, t } from "../taal.js";
import { BRANDSTOFFEN, cijferSvg, datumRegel, gekozen, lijnPad, prijsDelen, prijsTekst, trend } from "./brandstof-logica.js";

const COMMANDO = "domotiapp_lovelace/brandstof/prijzen";
const VERVERS_MS = 30 * 60 * 1000;
const PIJL = { op: "▲", af: "▼", gelijk: "=" };

class BrandstofCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }
    .card {
      min-height: var(--dac-raster, 120px); padding: 12px;
      display: flex; flex-direction: column; gap: 10px;
      container-type: inline-size;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .kop { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .kop .chip { width: 36px; height: 36px; flex: 0 0 auto; }
    .kop .chip .icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }
    .kop .tekst { display: flex; flex-direction: column; min-width: 0; }
    .nm { font-size: 14.5px; font-weight: 600; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sub { font-size: 11.5px; line-height: 1.3; color: var(--dac-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sub[data-oud] { color: var(--dac-warn); }

    .borden { display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
    .bord {
      display: flex; flex-direction: column; gap: 6px; min-width: 0;
      padding: 9px 10px 8px; border-radius: var(--dac-radius-sm);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
    }
    .bord .boven { display: flex; align-items: center; justify-content: space-between; gap: 6px; min-width: 0; }
    .bord .naam {
      font-size: 12px; font-weight: 600; letter-spacing: .02em; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .bord .trend {
      flex: 0 0 auto; display: inline-flex; align-items: center; gap: 3px;
      font-size: 11px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--trend);
    }
    .bord .trend i { font-style: normal; font-size: 9px; }

    /* Het getal: € klein ervoor, de cijfers groot, de laatste klein en hoog. De cijfers zijn SVG met zeven
       segmenten (brandstof-logica.js); de uitgezette staafjes zwak, zoals op een echt bord. */
    .prijs { display: flex; align-items: flex-start; gap: 3px; color: var(--dac-ink); min-width: 0; }
    .prijs .euro { font-size: 13px; font-weight: 600; color: var(--dac-ink-2); margin-top: 4px; }
    .prijs .cijfers { height: 30px; width: auto; aspect-ratio: var(--breed) / 20; display: block; flex: 0 1 auto; min-width: 0; }
    .prijs .staart .cijfers { height: 16px; }
    .cijfers .aan { fill: currentColor; }
    .cijfers .uit { fill: rgba(var(--dac-tint), .06); }

    .lijn { display: block; width: 100%; height: 22px; overflow: visible; }
    .lijn path { fill: none; stroke: var(--dac-accent-hi); stroke-width: 1.6; vector-effect: non-scaling-stroke; stroke-linejoin: round; stroke-linecap: round; }

    .status { font-size: 12.5px; color: var(--dac-ink-3); text-align: center; padding: 8px 0; }
    .status:empty { display: none; }
    .bron { font-size: 10.5px; color: var(--dac-ink-3); }
  `;

  constructor() {
    super();
    this.verbinding_ = new Verbindingswacht();
    this.herkansing_ = new Herkansing(() => this.haal_());
    this.stand_ = null;
    this.fout_ = null;
    this.gehaald_ = 0;
  }

  validate(config) {
    return { name: "", grafiek: true, ...config };
  }

  watched() {
    return [];
  }

  template() {
    this.toggleAttribute("bare", Boolean(this.config.bare));
    return `<div class="card surface">
        <div class="kop">
          <span class="chip" style="--tone:${TONES.accent}">${resolve(this.config.icon || "petrol")}</span>
          <span class="tekst"><span class="nm"></span><span class="sub"></span></span>
        </div>
        <div class="borden"></div>
        <div class="status"></div>
        <div class="bron"></div>
      </div>`;
  }

  wire() {
    this.teardown_.push(volgRaster(this.$(".card")));
    this.on(document, "visibilitychange", () => {
      if (document.visibilityState === "visible" && Date.now() - this.gehaald_ >= VERVERS_MS) this.haal_();
    });
    const klok = setInterval(() => {
      if (Date.now() - this.gehaald_ >= VERVERS_MS) this.haal_();
    }, 60000);
    this.teardown_.push(() => clearInterval(klok), () => this.herkansing_.stop());
    this.haal_();
  }

  set hass(hass) {
    const terug = this.verbinding_.herverbonden(hass);
    const eerste = !this.hass;
    super.hass = hass;
    if (this.wired_ && (terug || (eerste && !this.stand_))) this.haal_();
  }

  get hass() {
    return super.hass;
  }

  async haal_() {
    const hass = this.hass;
    if (!hass?.connection) return;
    try {
      this.stand_ = await hass.connection.sendMessagePromise({ type: COMMANDO });
      this.fout_ = null;
      this.gehaald_ = Date.now();
      this.herkansing_.herstel();
    } catch (fout) {
      if (nogNietGereed(fout) && this.herkansing_.plan()) return;
      this.fout_ = t("De prijzen konden niet opgehaald worden.");
    }
    this.paint();
  }

  paint() {
    const c = this.config;
    const stand = this.stand_;
    this.text(".nm", c.name || t("Brandstofprijzen"));
    const sub = this.$(".sub");
    // Is de laatste poging mislukt, dan staan de prijzen van de vorige keer er nog, en zegt de kop van wanneer.
    const oud = Boolean(stand?.fout && stand?.producten?.length);
    sub.toggleAttribute("data-oud", oud);
    this.text(sub, stand ? (oud ? t("Niet bijgewerkt · {regel}", { regel: datumRegel(stand.datum, locale()) }) : datumRegel(stand.datum, locale())) : "");

    const per = new Map((stand?.producten ?? []).map((p) => [p.slug, p]));
    const producten = gekozen(c).map((s) => per.get(s)).filter(Boolean);
    const vak = this.$(".borden");
    const sig = JSON.stringify([producten.map((p) => [p.slug, p.prijs, p.verschil, p.reeks?.length]), c.grafiek]);
    if (vak.dataset.sig !== sig) {
      vak.dataset.sig = sig;
      vak.innerHTML = producten.map((p) => this.bord_(p)).join("");
    }
    const leeg = !producten.length;
    this.text(
      ".status",
      !leeg ? "" : this.fout_ ?? (stand?.fout ? t("De prijzen konden niet opgehaald worden.") : stand ? t("Geen prijzen voor deze brandstoffen.") : t("Prijzen ophalen…"))
    );
    this.text(".bron", stand && !leeg ? t("Bron: {bron}", { bron: stand.bron }) : "");
    meetRaster(this.$(".card"));
  }

  bord_(p) {
    const delen = prijsDelen(p.prijs);
    const tr = trend(p.verschil);
    const pad = this.config.grafiek !== false ? lijnPad(p.reeks) : "";
    const kleur = tr ? (tr.toon === "bad" ? TONES.bad : tr.toon === "good" ? TONES.good : "var(--dac-ink-3)") : "";
    return `<div class="bord" data-slug="${escapeHtml(p.slug)}">
        <div class="boven">
          <span class="naam">${escapeHtml(p.naam)}</span>
          ${tr ? `<span class="trend" style="--trend:${kleur}" title="${escapeHtml(t("Tegenover gisteren"))}"><i>${PIJL[tr.richting]}</i>${escapeHtml(tr.tekst)}</span>` : ""}
        </div>
        ${
          delen
            ? `<div class="prijs" role="img" aria-label="${escapeHtml(`${p.naam}: ${prijsTekst(p.prijs)}`)}">
                <span class="euro">€</span>${cijferSvg(delen.hoofd)}<span class="staart">${cijferSvg(delen.staart)}</span>
              </div>`
            : ""
        }
        ${pad ? `<svg class="lijn" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><path d="${pad}"/></svg>` : ""}
      </div>`;
  }

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto", min_columns: 6, min_rows: this.minRijen_(".card", 2) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-brandstof-card-editor");
  }

  static getStubConfig() {
    return {};
  }
}

class BrandstofEditor extends DacEditor {
  defaults() {
    return { grafiek: true };
  }

  pickers() {
    return [{ key: "icon", kind: "icon", label: t("Icoon"), fallback: "petrol" }];
  }

  schema() {
    return [
      { name: "name", selector: sel.text() },
      {
        name: "brandstoffen",
        selector: { select: { multiple: true, mode: "list", options: BRANDSTOFFEN.map((b) => ({ value: b.slug, label: b.naam })) } },
      },
      { name: "grafiek", selector: sel.bool() },
    ];
  }

  label(s) {
    return (
      { name: t("Titel"), brandstoffen: t("Brandstoffen"), grafiek: t("Verloop van een maand") }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      name: t("Leeg laten: Brandstofprijzen."),
      brandstoffen: t("Niets aangevinkt: Euro95, Diesel, LPG en Super. De prijs is de landelijke adviesprijs van die dag, eens per uur opgehaald."),
      grafiek: t("Een lijntje onder elke prijs met de laatste dertig dagen."),
    }[s.name];
  }
}

registerEditor("domotiapp-brandstof-card-editor", BrandstofEditor);
registerCard("domotiapp-brandstof-card", BrandstofCard, {
  name: nt("DomotiApp Brandstof"),
  description: nt("De landelijke adviesprijzen van brandstof in Nederland, als prijsborden zoals bij een tankstation, met de trend tegenover gisteren."),
});

export { BrandstofCard };
