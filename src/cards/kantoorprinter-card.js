/**
 * De printer (papier, geen 3D): of hij klaar is, hoeveel inkt er nog in zit,
 * en hoeveel hij al gedrukt heeft.
 *
 * Gevraagd op 21 oktober 2026, voor een HP OfficeJet Pro 9730e bij een klant.
 * Zie kantoorprinter-logica.js voor wat IPP geeft en hoe de kaart de rest van
 * het apparaat vindt.
 *
 *   [foto/chip] Printer                       994
 *               Klaar voor gebruik       afdrukken
 *   [ Zwart 30% ] [ Cyaan 50% ] [ Magenta 50% ] [ Geel 60% ]
 *
 * Een tik op de kop opent de printer in Home Assistant, een tik op een patroon
 * dat patroon. Er valt niets te bedienen: IPP kan een printer niet sturen.
 *
 * KLEUR: de chip draagt de toestand (gestopt rood, bijna op let op, printen
 * het accent). De balk van een patroon draagt de kleur van de INKT, net als de
 * tray op de 3D-printerkaart; het getal is neutrale inkt.
 */

import { DacCard, INCOMPLETE, TONES, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { moreInfo, stateOf } from "../ha.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { metType, merkKeuzes, productAfbeelding, typeKeuzes } from "./productfoto.js";
import { PRINTERS, printerDelen, printerMelding, printerStand } from "./kantoorprinter-logica.js";
import { locale, nt, t } from "../taal.js";

class KantoorprinterCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }
    [hidden] { display: none !important; }

    .card {
      min-height: var(--dac-raster, 56px);
      padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .kop { display: flex; align-items: center; gap: 12px; min-width: 0; cursor: pointer; }
    .kop.dood { opacity: .42; }
    .chip { width: 40px; height: 40px; }
    .chip .icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
    /* Liggend: een printer is breder dan hoog. Op een eigen vlak in de tint
       van het thema, zodat een witte printer niet wegvalt op een lichte kaart. */
    .foto {
      flex: 0 0 auto; display: block; width: 56px; height: 40px; padding: 3px;
      object-fit: contain; object-position: center;
      border-radius: var(--dac-radius-sm);
      background: radial-gradient(ellipse at 50% 45%, rgba(var(--dac-tint), .2), rgba(var(--dac-tint), .06) 75%);
      border: 1px solid var(--dac-border);
    }

    .txt { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .nm {
      font-size: 14px; font-weight: 500; line-height: 1.25; color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st { display: flex; align-items: flex-start; gap: 5px; min-width: 0; font-size: 12px; line-height: 1.3; color: var(--dac-ink-2); }
    .st .stip { flex: 0 0 auto; width: 13px; height: 13px; color: var(--tone); display: grid; }
    .st .stip .icon { width: 13px; height: 13px; --mdc-icon-size: 13px; }
    .st .sw { min-width: 0; white-space: pre-line; }

    /* Het aantal afdrukken, rechts in de kop. */
    .teller { flex: 0 0 auto; display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
    .teller .n {
      font-size: 20px; font-weight: 600; line-height: 1; letter-spacing: -.02em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink); white-space: nowrap;
    }
    .teller .l { font-size: 11px; line-height: 1.2; color: var(--dac-ink-3); white-space: nowrap; }

    /* De patronen: naast elkaar, elk met een balk in de kleur van de inkt. */
    .inkt { display: grid; grid-template-columns: repeat(var(--n, 4), minmax(0, 1fr)); gap: 6px; }
    .patroon {
      min-width: 0; display: flex; flex-direction: column; gap: 4px; padding: 6px 8px; cursor: pointer;
      background: rgba(var(--dac-tint), .038); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
    }
    @media (hover: hover) { .patroon:hover { background: var(--dac-hover); } }
    .patroon .rij { display: flex; align-items: baseline; justify-content: space-between; gap: 4px; min-width: 0; }
    .patroon .naam { min-width: 0; font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .patroon .pct { flex: 0 0 auto; font-size: 11.5px; line-height: 1.25; font-weight: 500; color: var(--dac-ink); font-variant-numeric: tabular-nums; }
    .patroon .balk { height: 5px; border-radius: var(--dac-radius-pill); background: rgba(var(--dac-tint), .1); overflow: hidden; }
    .patroon .balk i { display: block; height: 100%; border-radius: inherit; background: var(--inkt, var(--dac-ink-3)); }
    .patroon.laag .naam { color: var(--dac-warn); font-weight: 600; }

    /* Smal, een halve kaart op een telefoon: alleen de balk en het getal. */
    @container (max-width: 300px) {
      .kop { gap: 8px; }
      .foto { width: 42px; height: 30px; padding: 2px; }
      .chip { width: 32px; height: 32px; }
      .nm { font-size: 13px; }
      .teller .n { font-size: 16px; }
      /* Het getal zegt het zelf, en een status over drie regels maakte de
         kaart drie rijen hoog (gemeten op 175 breed, 21 oktober 2026). */
      .teller .l { display: none; }
      .st .sw { white-space: pre; overflow: hidden; text-overflow: ellipsis; }
      .inkt { gap: 4px; }
      .patroon { padding: 5px 5px; }
      .patroon .naam { display: none; }
      .patroon .rij { justify-content: center; }
    }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  validate(config) {
    // Nooit gooien in setConfig: zonder entiteit een uitlegkaart.
    const c = { name: "", merk: "auto", ...config };
    if (!c.entity) c[INCOMPLETE] = t("Kies de statussensor van de printer.");
    return c;
  }

  set hass(hass) {
    const oud = this.hass_;
    super.hass = hass;
    if (!oud || !this.built_ || !this.wired_ || this.config?.[INCOMPLETE]) return;
    if (oud.entities !== hass?.entities || oud.devices !== hass?.devices) this.paint();
  }

  get hass() {
    return super.hass;
  }

  /** De delen van het apparaat, vastgehouden zolang het register hetzelfde is. */
  delen_() {
    const hass = this.hass_;
    const id = this.config?.entity;
    if (!hass || !id) return { patronen: [] };
    const m = this.delenMemo_;
    if (m && m.entities === hass.entities && m.id === id) return m.uit;
    const uit = printerDelen(hass, id);
    this.delenMemo_ = { entities: hass.entities, id, uit };
    return uit;
  }

  watched() {
    const d = this.delen_();
    return [this.config.entity, ...d.patronen, d.totaal, d.zwartwit, d.kleur].filter(Boolean);
  }

  apparaat_() {
    const reg = this.hass_?.entities?.[this.config.entity];
    return reg?.device_id ? this.hass_?.devices?.[reg.device_id] ?? null : null;
  }

  stand_() {
    const d = this.delen_();
    const st = (id) => stateOf(this.hass, id);
    const apparaat = this.apparaat_();
    return printerStand(
      st(this.config.entity),
      { patronen: d.patronen.map(st), totaal: st(d.totaal), zwartwit: st(d.zwartwit), kleur: st(d.kleur) },
      apparaat?.name_by_user || apparaat?.name || "",
    );
  }

  template() {
    if (this.config.bare) this.setAttribute("bare", "");
    this.style.containerType = "inline-size";
    return `
      <div class="card surface" style="--tone:${TONES.neutral}">
        <div class="kop" role="button" tabindex="0">
          <img class="foto" alt="" hidden />
          <span class="chip"></span>
          <div class="txt">
            <span class="nm"></span>
            <span class="st"><span class="stip" hidden></span><span class="sw"></span></span>
          </div>
          <span class="teller" hidden><span class="n"></span><span class="l">${t("afdrukken")}</span></span>
        </div>
        <div class="inkt" hidden></div>
      </div>`;
  }

  wire() {
    this.on(this.$(".kop"), "click", () => moreInfo(this, this.config.entity));
    this.on(this.$(".inkt"), "click", (e) => {
      const p = e.target?.closest?.(".patroon[data-id]");
      if (p) moreInfo(this, p.dataset.id);
    });
    this.teardown_.push(volgRaster(this.$(".card")));
  }

  paint() {
    const c = this.config;
    const s = this.stand_();
    const melding = printerMelding(s);
    const tone = TONES[melding.tone] ?? TONES.neutral;
    this.$(".card").style.setProperty("--tone", tone);
    this.$(".kop").classList.toggle("dood", !s);

    const apparaat = this.apparaat_();
    const naam = c.name || apparaat?.name_by_user || apparaat?.name || stateOf(this.hass, c.entity)?.attributes?.friendly_name || t("Printer");
    this.text(".nm", naam);

    // Foto of chip; met een foto draagt het icoontje in de statusregel de kleur.
    const icoon = c.icon || "printer";
    const metFoto = this.paintFoto_();
    const chip = this.$(".chip");
    chip.hidden = metFoto;
    if (chip.dataset.icon !== icoon) {
      chip.dataset.icon = icoon;
      chip.innerHTML = resolve(icoon, "printer");
    }
    chip.style.setProperty("--tone", tone);
    const stip = this.$(".stip");
    stip.hidden = !metFoto || melding.tone === "neutral";
    if (!stip.hidden && stip.dataset.icon !== icoon) {
      stip.dataset.icon = icoon;
      stip.innerHTML = resolve(icoon, "printer");
    }
    this.text(".st .sw", melding.regels.join("\n"));

    const teller = this.$(".teller");
    teller.hidden = s?.afdrukken == null;
    const getal = (n) => Number(n).toLocaleString(locale());
    if (!teller.hidden) {
      this.text(".teller .n", getal(s.afdrukken));
      const uitsplitsing =
        s.zwartwit != null && s.kleur != null
          ? t("{zwartwit} zwart-wit, {kleur} in kleur", { zwartwit: getal(s.zwartwit), kleur: getal(s.kleur) })
          : "";
      teller.title = uitsplitsing;
    }
    this.$(".kop").setAttribute("aria-label", [naam, ...melding.regels, s?.afdrukken != null ? `${getal(s.afdrukken)} ${t("afdrukken")}` : ""].filter(Boolean).join(", "));

    this.paintInkt_(s);
    meetRaster(this.$(".card"));
  }

  paintInkt_(s) {
    const vak = this.$(".inkt");
    const lijst = s?.inkt ?? [];
    vak.hidden = !lijst.length;
    vak.style.setProperty("--n", String(Math.max(1, lijst.length)));
    const html = lijst
      .map((i) => {
        const pct = i.procent == null ? "–" : `${Math.round(i.procent)}%`;
        const label = i.laag ? t("{inkt}, bijna op", { inkt: i.label }) : i.label;
        return `
        <div class="patroon${i.laag ? " laag" : ""}" data-id="${escapeHtml(i.id)}" role="button" tabindex="0" title="${escapeHtml(label)} ${pct}" aria-label="${escapeHtml(label)} ${pct}">
          <span class="rij"><span class="naam">${escapeHtml(i.label)}</span><span class="pct">${pct}</span></span>
          <span class="balk"><i style="width:${i.procent ?? 0}%;${i.kleur ? `--inkt:${escapeHtml(i.kleur)}` : ""}"></i></span>
        </div>`;
      })
      .join("");
    if (vak.dataset.html !== html) {
      vak.dataset.html = html;
      vak.innerHTML = html;
    }
  }

  /** De productfoto bij merk en type, of geen. Een foto die niet laadt geeft de chip terug. */
  paintFoto_() {
    const bron = productAfbeelding(this.config, this.apparaat_(), PRINTERS);
    const img = this.$(".foto");
    if (img.dataset.bron !== bron) {
      img.dataset.bron = bron;
      img.dataset.kapot = "";
      if (bron) {
        img.onerror = () => {
          img.dataset.kapot = "1";
          if (this.hass_ && this.wired_) this.paint();
        };
        img.src = bron;
      } else {
        img.removeAttribute("src");
      }
    }
    const toon = Boolean(bron) && img.dataset.kapot !== "1";
    img.hidden = !toon;
    return toon;
  }

  getCardSize() {
    return 2;
  }

  getGridOptions() {
    return { columns: 6, rows: "auto", min_columns: 4, min_rows: this.minRijen_(".card", 2) };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-kantoorprinter-card-editor");
  }

  /** De statussensor van een printer van IPP: een enum met idle, printing en stopped. */
  static getStubConfig(hass, entities) {
    const sensoren = (entities ?? []).filter((e) => String(e).startsWith("sensor."));
    const printer = sensoren.find((e) => {
      const opties = hass?.states?.[e]?.attributes?.options;
      return Array.isArray(opties) && opties.includes("printing") && opties.includes("stopped");
    });
    return printer ? { entity: printer } : {};
  }
}

class KantoorprinterEditor extends DacEditor {
  defaults() {
    return { merk: "auto" };
  }

  pickers() {
    return [
      { key: "icon", kind: "icon", label: t("Icoon (zonder foto)"), fallback: "printer", auto: false },
      ...(this.config_?.merk === "eigen" ? [{ key: "image", kind: "foto", label: t("Eigen afbeelding"), fallback: "printer" }] : []),
    ];
  }

  apparaat_() {
    const reg = this.hass_?.entities?.[this.config_?.entity];
    return reg?.device_id ? this.hass_?.devices?.[reg.device_id] ?? null : null;
  }

  schema() {
    const types = typeKeuzes(this.config_?.merk, PRINTERS);
    return [
      { name: "entity", required: true, selector: sel.entity(["sensor"]) },
      { name: "name", selector: sel.text() },
      { name: "merk", selector: sel.select(merkKeuzes(PRINTERS)) },
      ...(types.length ? [{ name: "model", selector: sel.select(types) }] : []),
    ];
  }

  serialize(config) {
    return metType(config, this.apparaat_(), PRINTERS);
  }

  label(s) {
    return { entity: t("Printer"), name: t("Naam"), merk: t("Merk"), model: t("Type") }[s.name] ?? super.label(s);
  }

  helper(s) {
    return {
      entity: t(
        "De sensor met de status van de printer (Klaar, Printen, Gestopt), van de integratie Internet Printing Protocol (IPP). De inkt en het aantal afdrukken van hetzelfde apparaat zoekt de kaart zelf.",
      ),
      name: t("Leeg laten: de naam van het apparaat in Home Assistant."),
      merk: t("Automatisch toont de productfoto als het type bekend is, en anders het icoon."),
      model: t("Het type bepaalt de productfoto."),
    }[s.name];
  }
}

registerEditor("domotiapp-kantoorprinter-card-editor", KantoorprinterEditor);
registerCard("domotiapp-kantoorprinter-card", KantoorprinterCard, {
  name: nt("DomotiApp Printer"),
  description: nt("Een printer voor papier: of hij klaar is, de inkt per kleur en het aantal afdrukken. Met een productfoto per merk en type."),
});

export { KantoorprinterCard };
