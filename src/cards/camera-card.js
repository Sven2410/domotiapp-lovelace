/**
 * De beveiligingscamera: live kijken, inzoomen, en naar een preset draaien.
 *
 * Gevraagd op 27 augustus 2026: *"En kan je een beveiligingscamerakaart maken?
 * Met een camera die presets ondersteunt, dat dat ook weergegeven wordt. Live
 * kunnen kijken en kunnen inzoomen bijvoorbeeld."*
 *
 * ## Hoe "presets ondersteunt" wordt herkend
 *
 * Er is geen standaard voor. Wat er in Home Assistant terechtkomt hangt af van
 * de integratie: Reolink zet zijn presets in een `select`-entiteit (één lijst,
 * één keuze), Amcrest en Dahua leveren losse `button`-entiteiten, en wie zijn
 * camera via ONVIF binnenhaalt heeft een `select` met een andere naam.
 *
 * De kaart doet daarom geen aanname. Kies je een `select`, dan worden zijn
 * opties de knoppen -- en die lijst komt uit de entiteit zelf, dus hij verandert
 * mee als je in de camera-app een preset toevoegt. Kies je losse knoppen, dan
 * zijn dat de knoppen. Beide tegelijk mag ook.
 *
 * ## Waarom er twee soorten "live" zijn
 *
 * `hui-image` met `cameraView: "live"` opent een echte stream. Dat is wat je
 * wilt zodra je kíjkt, en niet wat je wilt op een dashboard met zes camera's
 * dat de hele dag openstaat -- dat zijn zes streams. Vandaar: op de kaart een
 * plaatje dat zichzelf ververst, en live zodra je hem aanzet of het beeld groot
 * maakt. Wie het anders wil, zet "Altijd live" aan.
 *
 * ## Inzoomen
 *
 * Met het wiel, met twee vingers, of met de knoppen. Het rekenwerk (klemmen,
 * zoomen rondom de vinger) staat in `zoom-logica.js` met tests eronder; hier
 * staat alleen het luisteren naar vingers.
 *
 * Belangrijk: zolang er ingezoomd is, mag een sleep NIET als een tik op de kaart
 * gelden. Anders opent er een pop-up zodra je het beeld verschuift.
 */

import { DacCard, INCOMPLETE, TONES, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { isOn, moreInfo, nameOf, stateOf } from "../ha.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { zetCamerabeeld } from "./camerabeeld.js";
import { MAX_ZOOM, MIN_ZOOM, alsTransform, klemPositie, zoomRondom } from "./zoom-logica.js";

/** De vier richtingen, met de service-aanroep die erbij hoort. */
const RICHTINGEN = [
  { k: "up", icoon: "arrowUp", label: "Omhoog" },
  { k: "left", icoon: "chevronRight", label: "Links", draai: 180 },
  { k: "right", icoon: "chevronRight", label: "Rechts" },
  { k: "down", icoon: "arrowDown", label: "Omlaag" },
];

class CameraCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }

    .card {
      min-height: var(--dac-raster, 184px); padding: 0; overflow: hidden;
      display: flex; flex-direction: column;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ---- het beeld ---- */
    .vak {
      position: relative; width: 100%; aspect-ratio: 16 / 9;
      overflow: hidden; background: #000;
      touch-action: none; cursor: default;
    }
    :host([zoom]) .vak { cursor: grab; }
    :host([sleept]) .vak { cursor: grabbing; }

    .schuif {
      position: absolute; inset: 0;
      transform: var(--tf, none); transform-origin: center center;
      transition: transform 160ms ease-out;
      will-change: transform;
    }
    :host([sleept]) .schuif { transition: none; }
    .schuif .beeld, .schuif img, .schuif hui-image {
      display: block; width: 100%; height: 100%; object-fit: cover;
    }
    .vak .leeg {
      position: absolute; inset: 0; display: grid; place-items: center;
      font-size: 12.5px; color: var(--dac-ink-3);
    }

    /* De naam en de meldingen liggen op het beeld. Een balk eronder zou de
       kaart een rasterrij hoger maken voor twee woorden. */
    .over {
      position: absolute; left: 0; right: 0; top: 0; z-index: 2;
      display: flex; align-items: center; gap: 7px; padding: 9px 10px;
      background: linear-gradient(to bottom, rgba(0,0,0,.62), transparent);
      pointer-events: none;
    }
    .over .nm {
      font-size: 13px; font-weight: 600; color: #fff; min-width: 0;
      text-shadow: 0 1px 3px rgba(0,0,0,.7);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .over .rek { flex: 1 1 auto; }
    .merk {
      flex: 0 0 auto; display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 8px; border-radius: var(--dac-radius-pill);
      font-size: 10.5px; font-weight: 600; letter-spacing: .02em;
      background: color-mix(in srgb, var(--dac-bg) 62%, transparent);
      color: var(--dac-ink-2); border: 1px solid var(--dac-border-hi);
    }
    .merk .icon { width: 11px; height: 11px; }
    .merk[hidden] { display: none; }
    .merk[data-soort="live"] { color: var(--dac-bad); border-color: color-mix(in srgb, var(--dac-bad) 55%, transparent); }
    .merk[data-soort="live"] .stip {
      width: 6px; height: 6px; border-radius: 50%; background: var(--dac-bad);
      animation: knipper 2s ease-in-out infinite;
    }
    @keyframes knipper { 0%, 100% { opacity: 1 } 50% { opacity: .25 } }
    @media (prefers-reduced-motion: reduce) { .merk[data-soort="live"] .stip { animation: none; } }
    .merk[data-soort="beweging"] { color: var(--dac-warn); border-color: color-mix(in srgb, var(--dac-warn) 55%, transparent); }

    /* De knoppen rechtsonder in het beeld. */
    .knoppen {
      position: absolute; right: 8px; bottom: 8px; z-index: 3;
      display: flex; gap: 5px;
    }
    .knoppen button {
      width: 30px; height: 30px; display: grid; place-items: center; cursor: pointer;
      padding: 0; font: inherit; color: var(--dac-ink);
      background: color-mix(in srgb, var(--dac-bg) 68%, transparent);
      backdrop-filter: blur(8px);
      border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-pill);
    }
    .knoppen button[aria-pressed="true"] { color: var(--dac-accent-hi); }
    .knoppen button:disabled { opacity: .32; cursor: default; }
    .knoppen button .icon { width: 15px; height: 15px; }
    @media (hover: hover) { .knoppen button:hover:not(:disabled) { border-color: var(--dac-accent-hi); } }

    /* De richtingsknoppen, links onderin. Alleen als ze zijn ingesteld. */
    .ptz {
      position: absolute; left: 8px; bottom: 8px; z-index: 3;
      display: grid; grid-template-columns: repeat(3, 28px); grid-template-rows: repeat(2, 28px);
      gap: 3px;
    }
    .ptz[hidden] { display: none; }
    .ptz button {
      display: grid; place-items: center; cursor: pointer; padding: 0; font: inherit;
      color: var(--dac-ink);
      background: color-mix(in srgb, var(--dac-bg) 68%, transparent);
      backdrop-filter: blur(8px);
      border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-sm);
    }
    .ptz button .icon { width: 14px; height: 14px; }
    .ptz [data-r="up"] { grid-area: 1 / 2; }
    .ptz [data-r="left"] { grid-area: 2 / 1; }
    .ptz [data-r="down"] { grid-area: 2 / 2; }
    .ptz [data-r="right"] { grid-area: 2 / 3; }

    /* ---- de presets ---- */
    .presets {
      display: flex; gap: 6px; padding: 8px 10px; overflow-x: auto;
      scrollbar-width: none; -webkit-overflow-scrolling: touch;
    }
    .presets::-webkit-scrollbar { display: none; }
    .presets[hidden] { display: none; }
    .presets button {
      flex: 0 0 auto; padding: 7px 12px; cursor: pointer; font: inherit;
      font-size: 12px; font-weight: 500; white-space: nowrap;
      color: var(--dac-ink-2); background: var(--dac-surface);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
    }
    .presets button[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
      background: color-mix(in srgb, var(--dac-accent) 16%, transparent);
    }
    @media (hover: hover) { .presets button:hover { border-color: var(--dac-border-hi); } }

    /* ---- meerdere camera's ---- */
    .cams { display: flex; gap: 6px; padding: 0 10px 9px; overflow-x: auto; scrollbar-width: none; }
    .cams::-webkit-scrollbar { display: none; }
    .cams[hidden] { display: none; }
    .cams button {
      flex: 0 0 auto; padding: 6px 11px; cursor: pointer; font: inherit;
      font-size: 11.5px; white-space: nowrap;
      color: var(--dac-ink-3); background: transparent;
      border: 1px solid transparent; border-radius: var(--dac-radius-pill);
    }
    .cams button[aria-pressed="true"] {
      color: var(--dac-ink); background: var(--dac-surface);
      border-color: var(--dac-border);
    }

    :host([dead]) .card { opacity: .5; }
  `;

  validate(config) {
    const c = { name: "", ...config };
    if (!c.camera && !(Array.isArray(c.cameras) && c.cameras.length)) {
      c[INCOMPLETE] = "Kies een camera. Presets, richtingsknoppen en een bewegingsmelder mogen daarna.";
    }
    return c;
  }

  watched() {
    const c = this.config;
    return [
      ...this.cameras_(),
      c.presets,
      c.motion,
      ...(Array.isArray(c.preset_buttons) ? c.preset_buttons : []),
    ].filter(Boolean);
  }

  /** Alle camera's van deze kaart, met de hoofdcamera vooraan. */
  cameras_() {
    const c = this.config;
    const lijst = [c.camera, ...(Array.isArray(c.cameras) ? c.cameras : [])].filter(Boolean);
    return [...new Set(lijst)];
  }

  /** Naar welke camera kijken we nu? */
  huidig_() {
    const lijst = this.cameras_();
    return lijst.includes(this.cam_) ? this.cam_ : lijst[0];
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    this.stand_ = this.stand_ ?? { zoom: MIN_ZOOM, x: 0, y: 0 };

    return `
      <div class="card surface">
        <div class="vak">
          <div class="schuif"></div>
          <div class="over">
            <span class="nm"></span>
            <span class="rek"></span>
            <span class="merk" data-soort="beweging" hidden>${resolve("person")}<span>Beweging</span></span>
            <span class="merk" data-soort="live" hidden><span class="stip"></span><span>LIVE</span></span>
          </div>
          <div class="ptz" hidden>
            ${RICHTINGEN.map(
              (r) =>
                `<button type="button" data-r="${r.k}" aria-label="${r.label}"` +
                `${r.draai ? ` style="transform: rotate(${r.draai}deg)"` : ""}>` +
                `${resolve(r.icoon)}</button>`
            ).join("")}
          </div>
          <div class="knoppen">
            <button type="button" data-k="uit" aria-label="Uitzoomen">${resolve("minus")}</button>
            <button type="button" data-k="in" aria-label="Inzoomen">${resolve("plus")}</button>
            <button type="button" data-k="live" aria-pressed="false" aria-label="Live kijken">${resolve("cctv")}</button>
            <button type="button" data-k="groot" aria-label="Groot bekijken">${resolve("camera")}</button>
          </div>
        </div>
        <div class="presets" hidden></div>
        <div class="cams" hidden></div>
      </div>`;
  }

  wire() {
    this.teardown_.push(volgRaster(this.$(".card")));
    this.on(this.$(".knoppen"), "click", (e) => {
      const knop = e.target.closest?.("[data-k]");
      if (!knop) return;
      e.stopPropagation();
      this.knop_(knop.dataset.k);
    });
    this.on(this.$(".ptz"), "click", (e) => {
      const knop = e.target.closest?.("[data-r]");
      if (!knop) return;
      e.stopPropagation();
      this.draai_(knop.dataset.r);
    });
    this.on(this.$(".presets"), "click", (e) => {
      const knop = e.target.closest?.("[data-p]");
      if (!knop) return;
      e.stopPropagation();
      this.preset_(knop.dataset.p, knop.dataset.soort);
    });
    this.on(this.$(".cams"), "click", (e) => {
      const knop = e.target.closest?.("[data-cam]");
      if (!knop) return;
      e.stopPropagation();
      this.cam_ = knop.dataset.cam;
      // Een andere camera begint weer op 1x: de uitsnede van de vorige zegt
      // niets over deze.
      this.stand_ = { zoom: MIN_ZOOM, x: 0, y: 0 };
      this.paint();
    });

    this.zoomLuisteraars_();
  }

  /**
   * Het wiel, de vingers, en dubbeltikken.
   *
   * Alles op het VAK en niet op het beeld: het beeld verschuift onder je vinger
   * vandaan zodra je sleept, en dan raakt de pointer-capture zijn doel kwijt.
   */
  zoomLuisteraars_() {
    const vak = this.$(".vak");
    const punten = new Map();
    let sleepVan = null;
    let knijpVan = null;
    let bewogen = 0;

    const puntIn = (e) => {
      const r = vak.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 };
    };

    this.on(vak, "wheel", (e) => {
      // Alleen als er iets te zoomen valt; anders houden we het scrollen van de
      // pagina tegen op een kaart waar niets gebeurt.
      e.preventDefault();
      this.zet_(zoomRondom(this.stand_, e.deltaY < 0 ? 1.18 : 1 / 1.18, puntIn(e)));
    }, { passive: false });

    this.on(vak, "pointerdown", (e) => {
      punten.set(e.pointerId, e);
      vak.setPointerCapture?.(e.pointerId);
      bewogen = 0;
      if (punten.size === 2) {
        const [a, b] = [...punten.values()];
        knijpVan = { afstand: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), stand: { ...this.stand_ } };
        sleepVan = null;
      } else if (this.stand_.zoom > MIN_ZOOM) {
        sleepVan = { x: e.clientX, y: e.clientY, stand: { ...this.stand_ } };
        this.setAttribute("sleept", "");
      }
    });

    this.on(vak, "pointermove", (e) => {
      if (!punten.has(e.pointerId)) return;
      punten.set(e.pointerId, e);
      bewogen = Math.max(bewogen, Math.abs(e.movementX ?? 0) + Math.abs(e.movementY ?? 0));

      if (knijpVan && punten.size === 2) {
        const [a, b] = [...punten.values()];
        const nu = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const midden = {
          x: (a.clientX + b.clientX) / 2,
          y: (a.clientY + b.clientY) / 2,
        };
        const r = vak.getBoundingClientRect();
        this.zet_(
          zoomRondom(knijpVan.stand, nu / (knijpVan.afstand || 1), {
            x: (midden.x - r.left) / r.width - 0.5,
            y: (midden.y - r.top) / r.height - 0.5,
          })
        );
        return;
      }

      if (sleepVan) {
        const r = vak.getBoundingClientRect();
        // Delen door de zoomfactor: op 4x levert dezelfde vingerbeweging een
        // vier keer kleinere verschuiving in het beeld op, en dat is precies wat
        // je verwacht.
        const dx = (e.clientX - sleepVan.x) / r.width / this.stand_.zoom;
        const dy = (e.clientY - sleepVan.y) / r.height / this.stand_.zoom;
        this.zet_({
          zoom: this.stand_.zoom,
          ...klemPositie(sleepVan.stand.x - dx, sleepVan.stand.y - dy, this.stand_.zoom),
        });
      }
    });

    const los = (e) => {
      punten.delete(e.pointerId);
      if (punten.size < 2) knijpVan = null;
      if (!punten.size) {
        sleepVan = null;
        this.removeAttribute("sleept");
      }
    };
    this.on(vak, "pointerup", los);
    this.on(vak, "pointercancel", los);

    // Dubbeltikken: heen en weer tussen 1x en 2,5x, op de plek waar je tikt.
    this.on(vak, "dblclick", (e) => {
      if (e.target.closest(".knoppen, .ptz")) return;
      e.preventDefault();
      this.zet_(
        this.stand_.zoom > MIN_ZOOM
          ? { zoom: MIN_ZOOM, x: 0, y: 0 }
          : zoomRondom({ zoom: MIN_ZOOM, x: 0, y: 0 }, 2.5, puntIn(e))
      );
    });

    // Eén tik op het beeld opent hem groot -- maar alleen als er niet gesleept
    // is. Zonder deze toets opent er een pop-up elke keer dat je de uitsnede
    // verschuift.
    this.on(vak, "click", (e) => {
      if (e.target.closest(".knoppen, .ptz")) return;
      if (bewogen > 6) return;
      if (this.config.tap_zoom === false) return;
      moreInfo(this, this.huidig_());
    });
  }

  /** Zet een nieuwe zoomstand en teken hem. */
  zet_(stand) {
    this.stand_ = stand;
    this.toggleAttribute("zoom", stand.zoom > MIN_ZOOM);
    this.$(".schuif").style.setProperty("--tf", alsTransform(stand));
    const uit = this.$('[data-k="uit"]');
    const in_ = this.$('[data-k="in"]');
    if (uit) uit.disabled = stand.zoom <= MIN_ZOOM;
    if (in_) in_.disabled = stand.zoom >= MAX_ZOOM;
  }

  knop_(wat) {
    if (wat === "in") return this.zet_(zoomRondom(this.stand_, 1.5));
    if (wat === "uit") return this.zet_(zoomRondom(this.stand_, 1 / 1.5));
    if (wat === "live") {
      this.live_ = !this.live_;
      return this.paint();
    }
    if (wat === "groot") return moreInfo(this, this.huidig_());
    return undefined;
  }

  /**
   * Een richtingsknop indrukken.
   *
   * De knoppen zijn `button`-entiteiten uit de integratie zelf. Dat is de enige
   * universele weg: `ptz_move` heet bij elke integratie anders en heeft overal
   * andere parameters, en een kaart die per merk een service kent is een kaart
   * die stukgaat op het volgende merk.
   */
  draai_(richting) {
    const id = this.config[`ptz_${richting}`];
    if (!id) return;
    const domein = String(id).split(".")[0];
    this.hass.callService(domein, domein === "button" ? "press" : "turn_on", { entity_id: id });
  }

  preset_(waarde, soort) {
    if (soort === "knop") {
      const domein = String(waarde).split(".")[0];
      return this.hass.callService(domein, domein === "button" ? "press" : "turn_on", {
        entity_id: waarde,
      });
    }
    const id = this.config.presets;
    const domein = String(id).split(".")[0];
    return this.hass.callService(domein, "select_option", { entity_id: id, option: waarde });
  }

  paint() {
    const c = this.config;
    const cam = this.huidig_();
    const st = stateOf(this.hass, cam);
    const dood = !st || st.state === "unavailable";
    this.toggleAttribute("dead", Boolean(dood));

    this.text(".nm", c.name || nameOf(this.hass, cam, "Camera"));

    const live = this.live_ === true || c.live_view === true;
    const vak = this.$(".schuif");
    if (dood) {
      vak.querySelector(".beeld")?.remove();
      if (!this.$(".vak .leeg")) {
        const leeg = document.createElement("span");
        leeg.className = "leeg";
        leeg.textContent = "Deze camera is niet bereikbaar";
        this.$(".vak").appendChild(leeg);
      }
    } else {
      this.$(".vak .leeg")?.remove();
      zetCamerabeeld(vak, this.hass, cam, { live });
    }

    const liveMerk = this.$('.merk[data-soort="live"]');
    liveMerk.hidden = !live || dood;
    const knopLive = this.$('[data-k="live"]');
    knopLive.setAttribute("aria-pressed", String(live));
    // Staat "altijd live" aan, dan valt er niets te schakelen.
    knopLive.disabled = c.live_view === true;

    const beweging = this.$('.merk[data-soort="beweging"]');
    beweging.hidden = !(c.motion && isOn(stateOf(this.hass, c.motion)));

    this.zet_(this.stand_);
    this.paintPtz_();
    this.paintPresets_();
    this.paintCams_(cam);

    meetRaster(this.$(".card"));
  }

  paintPtz_() {
    const c = this.config;
    const vak = this.$(".ptz");
    const heeft = RICHTINGEN.some((r) => c[`ptz_${r.k}`]);
    vak.hidden = !heeft;
    if (!heeft) return;
    for (const r of RICHTINGEN) {
      const knop = vak.querySelector(`[data-r="${r.k}"]`);
      if (knop) knop.hidden = !c[`ptz_${r.k}`];
    }
  }

  paintPresets_() {
    const c = this.config;
    const vak = this.$(".presets");

    // Twee bronnen, en ze mogen naast elkaar bestaan: een select met opties, en
    // losse knoppen. Zie de kop voor waarom dat nodig is.
    const uit = [];
    const keuze = stateOf(this.hass, c.presets);
    const opties = keuze?.attributes?.options;
    if (Array.isArray(opties)) {
      for (const optie of opties) {
        uit.push({ waarde: optie, naam: optie, soort: "keuze", aan: keuze.state === optie });
      }
    }
    for (const id of Array.isArray(c.preset_buttons) ? c.preset_buttons : []) {
      const knop = stateOf(this.hass, id);
      if (!knop) continue;
      uit.push({ waarde: id, naam: nameOf(this.hass, id, id), soort: "knop", aan: false });
    }

    vak.hidden = !uit.length;
    if (!uit.length) return;

    const sig = uit.map((p) => `${p.waarde}|${p.aan}`).join(",");
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML = uit
      .map(
        (p) =>
          `<button type="button" data-p="${this.veilig_(p.waarde)}" data-soort="${p.soort}"` +
          ` aria-pressed="${p.aan}">${this.veilig_(p.naam)}</button>`
      )
      .join("");
  }

  paintCams_(huidig) {
    const lijst = this.cameras_();
    const vak = this.$(".cams");
    vak.hidden = lijst.length < 2;
    if (lijst.length < 2) return;

    const sig = `${lijst.join(",")}|${huidig}`;
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML = lijst
      .map(
        (id) =>
          `<button type="button" data-cam="${this.veilig_(id)}"` +
          ` aria-pressed="${id === huidig}">${this.veilig_(nameOf(this.hass, id, id))}</button>`
      )
      .join("");
  }

  veilig_(tekst) {
    const d = document.createElement("div");
    d.textContent = tekst ?? "";
    return d.innerHTML;
  }

  getCardSize() {
    return 5;
  }

  getGridOptions() {
    return {
      columns: 12,
      rows: "auto",
      min_columns: 6,
      min_rows: this.minRijen_(".card", 3),
    };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-camera-card-editor");
  }

  static getStubConfig(hass, entities) {
    const cam = entities?.find((e) => e.startsWith("camera."));
    return cam ? { camera: cam } : {};
  }
}

class CameraEditor extends DacEditor {
  pickers() {
    return [];
  }

  schema() {
    return [
      { name: "camera", selector: sel.entity("camera") },
      { name: "name", selector: sel.text() },
      { name: "live_view", selector: sel.bool() },
      { name: "presets", selector: sel.entity(["select", "input_select"]) },
      {
        name: "preset_buttons",
        selector: { entity: { domain: ["button", "scene", "script"], multiple: true } },
      },
      { name: "motion", selector: sel.entity(["binary_sensor"]) },
      { name: "ptz_up", selector: sel.entity(["button", "switch"]) },
      { name: "ptz_down", selector: sel.entity(["button", "switch"]) },
      { name: "ptz_left", selector: sel.entity(["button", "switch"]) },
      { name: "ptz_right", selector: sel.entity(["button", "switch"]) },
      { name: "cameras", selector: { entity: { domain: "camera", multiple: true } } },
      { name: "tap_zoom", selector: sel.bool() },
    ];
  }

  label(s) {
    return (
      {
        camera: "Camera",
        name: "Naam",
        live_view: "Altijd live",
        presets: "Presets (keuzelijst)",
        preset_buttons: "Presets als losse knoppen",
        motion: "Bewegingsmelder",
        ptz_up: "Draaien: omhoog",
        ptz_down: "Draaien: omlaag",
        ptz_left: "Draaien: links",
        ptz_right: "Draaien: rechts",
        cameras: "Nog meer camera's op deze kaart",
        tap_zoom: "Tikken opent het beeld groot",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    const uitleg = {
      camera:
        "Op de kaart staat een beeld dat zichzelf ververst; met de knop rechtsonder gaat hij echt live. Inzoomen kan met het wiel, met twee vingers of met + en −.",
      live_view:
        "De stream staat dan altijd open. Mooier, maar op een dashboard met zes camera's zijn dat zes streams die de hele dag doorlopen.",
      presets:
        "De `select` van je camera-integratie — Reolink en ONVIF leveren die. De kaart maakt van elke optie een knop, dus een preset die je in de camera-app toevoegt verschijnt er vanzelf bij.",
      preset_buttons:
        "Voor integraties die geen keuzelijst maar losse knoppen leveren, zoals Amcrest en Dahua. Ze mogen naast de keuzelijst staan.",
      motion:
        "Zolang deze aanstaat komt er een merkje 'Beweging' op het beeld te staan.",
      ptz_up:
        "De vier richtingsknoppen van je integratie. Vul je er geen in, dan komt het draaikruis er niet.",
      cameras:
        "Onder het beeld komt dan een rij met namen om tussen te wisselen. Handig voor de camera's die bij elkaar horen — voordeur, oprit, achtertuin.",
    };
    return uitleg[s.name];
  }
}

registerEditor("domotiapp-camera-card-editor", CameraEditor);
registerCard("domotiapp-camera-card", CameraCard, {
  name: "DomotiApp Camera",
  description:
    "Live beeld met inzoomen en schuiven, de presets van je camera als knoppen, een draaikruis en een merkje zodra er beweging is.",
});

export { CameraCard };
