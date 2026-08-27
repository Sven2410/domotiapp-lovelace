/**
 * De 3D-printer: wat hij aan het maken is, hoe ver hij is, en wat erin zit.
 *
 * Gevraagd op 27 augustus 2026 voor een Bambu Lab X1D met een AMS 2 Pro. Zijn
 * lijstje: *"Camera die live het beeld streamt, image/afbeelding die laat zien
 * wat het wordt, bedtemperatuur, eindtijd, nozzletemperatuur, printstatus,
 * printvoortgang, de deur van de printer (openingssensor). Dan heb ik ook nog
 * een AMS 2 Pro met 4 kleuren, dus ik wil tray 1 t/m 4 kunnen invullen. Haal uit
 * de attributen de kleur van de tray."* En kort daarna: *"een schakelaar om hem
 * in te schakelen; als ik hem uit zet moet het een melding geven, weet je zeker
 * dat je hem uit wil zetten. Dit om per ongeluk uitzetten te voorkomen."*
 *
 * ## De aan/uit-knop vraagt alleen bij UITZETTEN
 *
 * Aanzetten is gratis: staat hij al aan, dan gebeurt er niets. Uitzetten midden
 * in een print van veertien uur is dat allerminst, en dat is precies wat zijn
 * reden is. Dus: aan gaat meteen, uit gaat via `vraagBevestiging` -- en als er
 * een print loopt staat dat er met zoveel woorden bij, mét hoe ver hij is. Zie
 * valkuil 26 voor waarom dat ons eigen scherm is en niet HA's `dialog-box`.
 *
 * ## Waarom camera én afbeelding, met een knop ertussen
 *
 * Hij vroeg om allebei, en ze doen ook echt iets anders: de camera zegt of het
 * nog goed gáát, de plaat zegt wat het wórdt. Ze naast elkaar zetten maakt de
 * kaart twee keer zo hoog voor een dashboard waar je meestal maar naar één van
 * de twee kijkt. Vandaar één beeldvlak met een schakelknop in de hoek, en de
 * camera als standaard zodra er iets loopt.
 *
 * ## De trays van de AMS
 *
 * Vier vakjes met de kleur die er echt in zit. Bambu levert die kleur als
 * `RRGGBBAA` in de attributen, en dat is niet iets wat CSS zomaar aanneemt --
 * zie `printer-logica.js`, waar het omgerekend en getoetst wordt. Een tray die
 * leeg is blijft leeg: een grijs vakje met een streepje, en niet een zwart vakje
 * dat op zwart filament lijkt.
 */

import { DacCard, INCOMPLETE, TONES, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { isOn, moreInfo, nameOf, stateOf } from "../ha.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { vraagBevestiging } from "../vraag.js";
import { zetCamerabeeld } from "./camerabeeld.js";
import {
  STANDEN,
  alsDuur,
  draait,
  klaarOm,
  restMinuten,
  stand,
  temperatuur,
  tray,
  voortgangPct,
} from "./printer-logica.js";

/** De vier trays van een AMS. Meer dan vier is een tweede AMS, en dus een tweede kaart. */
const TRAYS = [1, 2, 3, 4];

const TOON = {
  good: TONES.good,
  warn: TONES.warn,
  bad: TONES.bad,
  neutral: TONES.neutral,
  accent: TONES.accent,
};

class PrinterCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }

    .card {
      min-height: var(--dac-raster, 120px); padding: 10px 12px;
      display: flex; flex-direction: column; gap: 9px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ---- kop ---- */
    .kop { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .ico {
      width: 38px; height: 38px; flex: 0 0 auto; display: grid; place-items: center;
      border-radius: var(--dac-radius-sm); cursor: pointer;
      background: color-mix(in srgb, var(--tone) 16%, transparent);
      border: 1px solid color-mix(in srgb, var(--tone) 34%, transparent);
      color: var(--tone);
    }
    .ico .icon, .ico ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
    /* Alleen zolang er iets loopt. Een printer die klaar is hoort stil te staan;
       zie de kop van dishwasher-card.js voor dezelfde afweging. */
    :host([loopt]) .ico {
      animation: pols 2.4s ease-in-out infinite;
    }
    @keyframes pols {
      0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--tone) 38%, transparent); }
      50% { box-shadow: 0 0 12px 1px color-mix(in srgb, var(--tone) 30%, transparent); }
    }
    @media (prefers-reduced-motion: reduce) { :host([loopt]) .ico { animation: none; } }

    .tekst { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
    .nm {
      font-size: 14px; font-weight: 600; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11.5px; line-height: 1.3; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st b { color: var(--tone); font-weight: 500; }

    /* De schakelaar. Een echte knop en geen vinkje: dit is een apparaat dat je
       aanzet, geen instelling die je aanvinkt. */
    .aanuit {
      flex: 0 0 auto; width: 40px; height: 34px; display: grid; place-items: center;
      cursor: pointer; padding: 0; font: inherit;
      background: var(--dac-surface); color: var(--dac-ink-3);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      transition: color 180ms ease, border-color 180ms ease, background 180ms ease;
    }
    .aanuit[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
      background: color-mix(in srgb, var(--dac-accent) 18%, transparent);
    }
    .aanuit .icon { width: 17px; height: 17px; }
    @media (hover: hover) { .aanuit:hover { border-color: var(--dac-border-hi); } }
    .aanuit[hidden] { display: none; }

    /* ---- beeld ---- */
    .beeldvak {
      position: relative; width: 100%; overflow: hidden;
      border-radius: var(--dac-radius-sm); background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      aspect-ratio: 16 / 9;
    }
    .beeldvak[hidden] { display: none; }
    .beeldvak .beeld, .beeldvak img, .beeldvak hui-image {
      display: block; width: 100%; height: 100%; object-fit: cover;
    }
    .beeldvak .leeg {
      position: absolute; inset: 0; display: grid; place-items: center;
      font-size: 12px; color: var(--dac-ink-3);
    }
    .wissel {
      position: absolute; right: 8px; top: 8px; z-index: 2;
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 9px; cursor: pointer; font: inherit; font-size: 11px; font-weight: 500;
      color: var(--dac-ink); border: 1px solid var(--dac-border-hi);
      border-radius: var(--dac-radius-pill);
      background: color-mix(in srgb, var(--dac-bg) 72%, transparent);
      backdrop-filter: blur(8px);
    }
    .wissel .icon { width: 13px; height: 13px; }
    .wissel[hidden] { display: none; }

    /* ---- voortgang ---- */
    .voort { display: flex; flex-direction: column; gap: 5px; }
    .voort[hidden] { display: none; }
    .balk {
      position: relative; height: 6px; border-radius: 3px; overflow: hidden;
      background: var(--dac-surface-hi);
    }
    .balk i {
      display: block; height: 100%; width: var(--pct, 0%);
      background: var(--tone); border-radius: 3px;
      transition: width 400ms ease;
    }
    /* Zonder voortgangssensor loopt er een streepje heen en weer: er gebeurt
       iets, maar we weten niet hoeveel. Hetzelfde als bij de vaatwasser. */
    .balk[data-onbekend="true"] i {
      width: 32%; animation: schuif 2.2s ease-in-out infinite;
    }
    @keyframes schuif { 0% { margin-left: -32% } 100% { margin-left: 100% } }
    @media (prefers-reduced-motion: reduce) {
      .balk[data-onbekend="true"] i { animation: none; margin-left: 0; }
    }
    .voortregel {
      display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
      font-size: 11.5px; color: var(--dac-ink-3); font-variant-numeric: tabular-nums;
    }
    .voortregel .pct { font-size: 13px; font-weight: 600; color: var(--dac-ink); }

    /* ---- tegels ---- */
    .tegels { display: grid; grid-template-columns: repeat(var(--kolommen, 3), minmax(0, 1fr)); gap: 7px; }
    .tegels[hidden] { display: none; }
    .tegel {
      display: flex; flex-direction: column; align-items: center; gap: 1px;
      padding: 7px 5px; min-width: 0;
      background: rgba(255,255,255,.038); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
    }
    .tegel .w {
      font-size: 14px; font-weight: 500; letter-spacing: -.01em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
    }
    .tegel .l {
      font-size: 10px; line-height: 1.2; color: var(--dac-ink-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
    }
    .tegel[data-let="true"] .w { color: var(--dac-warn); }

    /* ---- de AMS ---- */
    .ams { display: flex; align-items: center; gap: 7px; }
    .ams[hidden] { display: none; }
    .ams .kopje {
      font-size: 10px; color: var(--dac-ink-3); flex: 0 0 auto;
      writing-mode: horizontal-tb;
    }
    .ams .rij { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; flex: 1 1 auto; }
    .tray {
      display: flex; align-items: center; gap: 6px; min-width: 0;
      padding: 5px 7px; border-radius: var(--dac-radius-sm);
      background: rgba(255,255,255,.038); border: 1px solid var(--dac-border);
    }
    .tray .vlak {
      width: 15px; height: 15px; flex: 0 0 auto; border-radius: 4px;
      background: var(--kleur, transparent);
      border: 1px solid rgba(255,255,255,.22);
      box-shadow: inset 0 0 0 1px rgba(0,0,0,.28);
    }
    /* Leeg is een streepje en geen zwart vlakje: zwart filament bestaat, "niets"
       hoort daar niet op te lijken. */
    .tray[data-leeg="true"] .vlak {
      background: repeating-linear-gradient(
        -45deg, transparent 0 3px, var(--dac-border-hi) 3px 4px
      );
    }
    .tray .txt { min-width: 0; display: flex; flex-direction: column; }
    .tray .nr { font-size: 9.5px; color: var(--dac-ink-3); line-height: 1.1; }
    .tray .so {
      font-size: 11px; color: var(--dac-ink-2); line-height: 1.2;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    /* Hoeveel er nog op de rol zit, als een streepje onder het kleurvlakje.
       Een getal erbij zou vier keer op een rij staan en de rij onleesbaar
       maken; een streepje lees je in één blik. Bambu meldt dit alleen als de
       rol een chip heeft (remain_enabled), dus het staat er niet altijd. */
    .tray .vlak { position: relative; }
    .tray .vlak i {
      position: absolute; left: 0; right: 0; bottom: -4px; height: 2px;
      border-radius: 1px; background: var(--dac-border-hi);
    }
    .tray .vlak i::after {
      content: ""; display: block; height: 100%; width: var(--rest, 0%);
      border-radius: 1px; background: var(--dac-ink-2);
    }
    /* De tray die de printer op dit moment gebruikt. Eén rand, geen kleur:
       kleur is hier het filament en niet de toestand. */
    .tray[data-actief="true"] {
      border-color: var(--dac-accent-hi);
      background: color-mix(in srgb, var(--dac-accent) 14%, transparent);
    }

    :host([dead]) .card { opacity: .45; }

    /* Smal: de tegels onder elkaar in twee kolommen, en de trays zonder tekst.
       Op een telefoon is vier keer "PLA" naast elkaar toch niet te lezen. */
    @container (max-width: 340px) {
      .tegels { --kolommen: 2 !important; }
      .tray .txt { display: none; }
      .tray { justify-content: center; padding: 6px 4px; }
    }
  `;

  validate(config) {
    const c = { name: "", icon: "printer3d", ...config };
    const iets =
      c.status || c.progress || c.camera || c.image || c.nozzle_temp || c.bed_temp || c.power;
    if (!iets) {
      c[INCOMPLETE] =
        "Kies minstens een printstatus. Camera, voortgang, temperaturen, de deur en de trays van de AMS mogen daarna.";
    }
    return c;
  }

  watched() {
    const c = this.config;
    return [
      c.status,
      c.progress,
      c.remaining,
      c.nozzle_temp,
      c.bed_temp,
      c.door,
      c.power,
      c.camera,
      c.image,
      ...TRAYS.map((n) => c[`tray_${n}`]),
    ].filter(Boolean);
  }

  /** Heeft deze kaart een beeld te tonen, en zo ja welke? */
  beeldSoort_() {
    const c = this.config;
    if (c.camera && c.image) return this.beeld_ ?? (draait(stateOf(this.hass, c.status)) ? "camera" : "image");
    if (c.camera) return "camera";
    if (c.image) return "image";
    return null;
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    // Zonder dit kijkt de @container-query naar een container van Home Assistant.
    this.style.containerType = "inline-size";

    return `
      <div class="card surface" style="--tone:${TONES.accent}">
        <div class="kop">
          <button class="ico" type="button" aria-label="Meer info"></button>
          <span class="tekst">
            <span class="nm"></span>
            <span class="st"></span>
          </span>
          <button class="aanuit" type="button" aria-pressed="false"
                  aria-label="Printer aan of uit" hidden>${resolve("power")}</button>
        </div>

        <div class="beeldvak" hidden>
          <button class="wissel" type="button" hidden></button>
        </div>

        <div class="voort" hidden>
          <div class="balk"><i></i></div>
          <div class="voortregel">
            <span class="pct"></span>
            <span class="rest"></span>
          </div>
        </div>

        <div class="tegels" hidden></div>

        <div class="ams" hidden>
          <span class="kopje">AMS</span>
          <div class="rij"></div>
        </div>
      </div>`;
  }

  wire() {
    const c = this.config;
    this.teardown_.push(volgRaster(this.$(".card")));

    this.on(this.$(".ico"), "click", () =>
      moreInfo(this, c.status || c.power || c.camera || c.progress)
    );

    const knop = this.$(".aanuit");
    this.on(knop, "click", (e) => {
      e.stopPropagation();
      this.schakel_();
    });

    const wissel = this.$(".wissel");
    this.on(wissel, "click", (e) => {
      e.stopPropagation();
      this.beeld_ = this.beeldSoort_() === "camera" ? "image" : "camera";
      this.paint();
    });

    // Tikken op het beeld opent de camera groot -- dat is wat je wilt als je
    // ziet dat er iets misgaat.
    this.on(this.$(".beeldvak"), "click", (e) => {
      if (e.target.closest(".wissel")) return;
      const wat = this.beeldSoort_() === "camera" ? c.camera : c.image;
      if (wat) moreInfo(this, wat);
    });
  }

  /**
   * Aan of uit, en bij UIT eerst vragen.
   *
   * De reden staat in de kop: een printer die je per ongeluk uitzet, gooit een
   * print van veertien uur weg. Aanzetten heeft die vraag niet nodig.
   */
  async schakel_() {
    const id = this.config.power;
    if (!id) return;
    const st = stateOf(this.hass, id);
    const aan = isOn(st);
    const domein = String(id).split(".")[0];

    if (aan) {
      const pct = voortgangPct(stateOf(this.hass, this.config.progress));
      const bezig = draait(stateOf(this.hass, this.config.status));
      const ja = await vraagBevestiging({
        title: "Printer uitzetten?",
        text: bezig
          ? `Er loopt een print${pct === null ? "" : ` (${pct}% klaar)`}. Uitzetten breekt hem af, en dat is niet terug te draaien.`
          : "Weet je zeker dat je de printer wilt uitzetten?",
        confirmText: "Uitzetten",
        dismissText: "Aan laten",
      });
      if (!ja) return;
    }

    this.hass.callService(domein, aan ? "turn_off" : "turn_on", { entity_id: id });
  }

  paint() {
    const c = this.config;
    const status = stateOf(this.hass, c.status);
    const soort = stand(status);
    const info = STANDEN[soort] ?? STANDEN.unknown;
    const loopt = draait(status);
    const dood = c.status && (!status || status.state === "unavailable");

    this.toggleAttribute("dead", Boolean(dood));
    this.toggleAttribute("loopt", loopt && !dood);
    this.$(".card").style.setProperty("--tone", TOON[info.toon] ?? TONES.accent);

    this.$(".ico").innerHTML = resolve(c.icon || "printer3d");
    this.text(".nm", c.name || nameOf(this.hass, c.status || c.power || c.camera, "3D-printer"));

    // Het woord van de kaart, en als de sensor iets anders zegt dan wat wij
    // ervan maken, staat het zijne erachter. Anders lijkt de kaart te liegen.
    const eigen = String(status?.state ?? "").trim();
    const anders = soort === "unknown" && eigen && eigen.toLowerCase() !== "unknown";
    const regel = `<b>${this.veilig_(anders ? eigen : info.woord)}</b>${this.bijzin_()}`;
    const st_ = this.$(".st");
    if (st_.innerHTML !== regel) st_.innerHTML = regel;

    this.paintAanUit_();
    this.paintBeeld_(loopt);
    this.paintVoortgang_(loopt);
    this.paintTegels_();
    this.paintAms_();

    meetRaster(this.$(".card"));
  }

  /** Wat er achter de stand komt te staan: hoe laat hij klaar is. */
  bijzin_() {
    const rest = restMinuten(stateOf(this.hass, this.config.remaining));
    if (rest === null || rest <= 0) return "";
    return ` · nog ${this.veilig_(alsDuur(rest))}, klaar om ${this.veilig_(klaarOm(rest))}`;
  }

  paintAanUit_() {
    const knop = this.$(".aanuit");
    const id = this.config.power;
    knop.hidden = !id;
    if (!id) return;
    const aan = isOn(stateOf(this.hass, id));
    knop.setAttribute("aria-pressed", String(aan));
    knop.setAttribute("aria-label", aan ? "Printer uitzetten" : "Printer aanzetten");
  }

  paintBeeld_(loopt) {
    const c = this.config;
    const vak = this.$(".beeldvak");
    const soort = this.beeldSoort_();
    vak.hidden = !soort;
    if (!soort) return;

    // De wisselknop staat er alleen als er ook echt iets te wisselen valt.
    const wissel = this.$(".wissel");
    wissel.hidden = !(c.camera && c.image);
    if (!wissel.hidden) {
      const naar = soort === "camera" ? "Voorbeeld" : "Camera";
      wissel.innerHTML = `${resolve(soort === "camera" ? "grid" : "camera")}<span>${naar}</span>`;
      wissel.setAttribute("aria-label", `Toon ${naar.toLowerCase()}`);
    }

    if (soort === "camera") {
      // Live zodra er een print loopt: dán wil je bewegend beeld. Staat hij
      // stil, dan is een plaatje per paar seconden genoeg en scheelt het een
      // stream die de hele dag openstaat.
      zetCamerabeeld(vak, this.hass, c.camera, { live: c.live_view === true || loopt });
      vak.querySelector(".leeg")?.remove();
      return;
    }

    // De voorbeeldplaat is een `image`-entiteit: die draagt zijn plaatje in
    // `entity_picture`, met een token dat verandert zodra er een nieuwe komt.
    vak.querySelector("hui-image")?.remove();
    const st = stateOf(this.hass, c.image);
    const bron = st?.attributes?.entity_picture;
    let img = vak.querySelector("img.beeld");
    if (bron) {
      if (!img) {
        img = document.createElement("img");
        img.className = "beeld";
        img.alt = "Wat de printer aan het maken is";
        vak.appendChild(img);
      }
      if (img.dataset.bron !== bron) {
        img.dataset.bron = bron;
        img.src = bron;
      }
      vak.querySelector(".leeg")?.remove();
    } else {
      img?.remove();
      if (!vak.querySelector(".leeg")) {
        const leeg = document.createElement("span");
        leeg.className = "leeg";
        leeg.textContent = "Nog geen voorbeeld";
        vak.appendChild(leeg);
      }
    }
  }

  paintVoortgang_(loopt) {
    const c = this.config;
    const vak = this.$(".voort");
    const pct = voortgangPct(stateOf(this.hass, c.progress));
    const rest = restMinuten(stateOf(this.hass, c.remaining));

    // Geen voortgang en niets dat loopt: dan is er ook niets te tonen.
    vak.hidden = pct === null && !loopt;
    if (vak.hidden) return;

    const balk = this.$(".balk");
    balk.dataset.onbekend = String(pct === null);
    balk.querySelector("i").style.setProperty("--pct", `${pct ?? 0}%`);
    this.text(".pct", pct === null ? "Bezig" : `${pct}%`);
    this.text(
      ".rest",
      rest === null || rest <= 0 ? "" : `nog ${alsDuur(rest)} · klaar om ${klaarOm(rest)}`
    );
  }

  paintTegels_() {
    const c = this.config;
    const vak = this.$(".tegels");
    const uit = [];

    const nozzle = temperatuur(stateOf(this.hass, c.nozzle_temp));
    if (nozzle) uit.push({ w: `${nozzle.waarde}${nozzle.eenheid}`, l: "Nozzle" });

    const bed = temperatuur(stateOf(this.hass, c.bed_temp));
    if (bed) uit.push({ w: `${bed.waarde}${bed.eenheid}`, l: "Bed" });

    const deur = stateOf(this.hass, c.door);
    if (deur) {
      const open = isOn(deur);
      uit.push({ w: open ? "Open" : "Dicht", l: "Deur", let: open });
    }

    vak.hidden = !uit.length;
    if (!uit.length) return;
    vak.style.setProperty("--kolommen", String(uit.length));
    const sig = uit.map((t) => `${t.w}|${t.l}|${t.let ?? ""}`).join(",");
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML = uit
      .map(
        (t) =>
          `<div class="tegel" data-let="${Boolean(t.let)}">` +
          `<span class="w">${this.veilig_(t.w)}</span>` +
          `<span class="l">${this.veilig_(t.l)}</span></div>`
      )
      .join("");
  }

  paintAms_() {
    const c = this.config;
    const vak = this.$(".ams");
    const gebruikt = TRAYS.filter((n) => c[`tray_${n}`] || c[`tray_${n}_color`]);
    vak.hidden = !gebruikt.length;
    if (!gebruikt.length) return;

    const rij = this.$(".ams .rij");
    const gegevens = TRAYS.map((n) =>
      tray(stateOf(this.hass, c[`tray_${n}`]), {
        color: c[`tray_${n}_color`],
        label: c[`tray_${n}_label`],
      })
    );
    // De uitgebreide naam van de rol, alleen voor de tooltip.
    const gegevens_naam = TRAYS.map(
      (n) => stateOf(this.hass, c[`tray_${n}`])?.attributes?.name ?? ""
    );

    const sig = gegevens
      .map((t) => `${t.kleur}|${t.soort}|${t.leeg}|${t.actief}|${t.rest}`)
      .join(",");
    if (rij.dataset.sig === sig) return;
    rij.dataset.sig = sig;
    rij.innerHTML = gegevens
      .map((t, i) => {
        // De VOLLEDIGE naam in de tooltip. Op de kaart staat het materiaal --
        // kort en het past altijd -- maar wie wil weten welke rol erin zit,
        // leest hier "Bambu PLA Matte".
        const vol = gegevens_naam[i];
        const titel =
          `Tray ${i + 1}` +
          (t.leeg ? ": leeg" : vol || t.soort ? `: ${vol || t.soort}` : "") +
          (t.rest === null ? "" : ` — nog ${t.rest}%`) +
          (t.actief ? " (in gebruik)" : "");
        return (
          `<div class="tray" data-leeg="${t.leeg}" data-actief="${t.actief}"` +
          ` style="--kleur:${t.kleur ?? "transparent"}" title="${this.veilig_(titel)}">` +
          `<span class="vlak">${
            t.rest === null ? "" : `<i style="--rest:${t.rest}%"></i>`
          }</span>` +
          `<span class="txt"><span class="nr">Tray ${i + 1}</span>` +
          `<span class="so">${this.veilig_(t.leeg ? "leeg" : t.soort || "gevuld")}</span></span>` +
          `</div>`
        );
      })
      .join("");
  }

  /** Tekst uit een integratie is data, geen markup. */
  veilig_(tekst) {
    const d = document.createElement("div");
    d.textContent = tekst ?? "";
    return d.innerHTML;
  }

  getCardSize() {
    return this.config?.camera || this.config?.image ? 6 : 3;
  }

  getGridOptions() {
    // "auto" met een GEMETEN ondergrens: deze kaart groeit met wat je invult --
    // een beeldvlak erbij is drie rasterrijen. Een vast getal zou de kaart over
    // zijn buurman laten schilderen (valkuil 8 en 12).
    return {
      columns: 12,
      rows: "auto",
      min_columns: 6,
      min_rows: this.minRijen_(".card", 2),
    };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-printer-card-editor");
  }

  static getStubConfig(hass, entities) {
    const status = entities?.find(
      (e) => /^sensor\./.test(e) && /(print|stage|status)/i.test(e)
    );
    return status ? { status } : {};
  }
}

class PrinterEditor extends DacEditor {
  defaults() {
    return { icon: "printer3d" };
  }

  pickers() {
    return [{ key: "icon", kind: "icon", label: "Icoon", fallback: "printer3d", auto: false }];
  }

  schema() {
    return [
      { name: "name", selector: sel.text() },
      { name: "status", selector: sel.entity(["sensor", "binary_sensor"]) },
      { name: "power", selector: sel.entity(["switch", "input_boolean"]) },
      { name: "progress", selector: sel.entity(["sensor", "number"]) },
      { name: "remaining", selector: sel.entity(["sensor"]) },
      { name: "nozzle_temp", selector: sel.entity(["sensor", "number"]) },
      { name: "bed_temp", selector: sel.entity(["sensor", "number"]) },
      { name: "door", selector: sel.entity(["binary_sensor"]) },
      { name: "camera", selector: sel.entity("camera") },
      { name: "live_view", selector: sel.bool() },
      { name: "image", selector: sel.entity(["image", "camera"]) },
      // De vier trays. Elk een entiteit, met een kleur als reserve voor wie
      // geen entiteit per tray heeft -- niet elke integratie levert die.
      ...TRAYS.flatMap((n) => [
        { name: `tray_${n}`, selector: sel.entity(["sensor", "select", "text"]) },
        { name: `tray_${n}_color`, selector: sel.text() },
        { name: `tray_${n}_label`, selector: sel.text() },
      ]),
    ];
  }

  label(s) {
    const trayLabels = {};
    for (const n of TRAYS) {
      trayLabels[`tray_${n}`] = `Tray ${n}`;
      trayLabels[`tray_${n}_color`] = `Tray ${n}: kleur met de hand`;
      trayLabels[`tray_${n}_label`] = `Tray ${n}: naam met de hand`;
    }
    return (
      {
        name: "Naam",
        status: "Printstatus",
        power: "Aan/uit-schakelaar",
        progress: "Printvoortgang (0-100%)",
        remaining: "Eindtijd of resterende tijd",
        nozzle_temp: "Nozzletemperatuur",
        bed_temp: "Bedtemperatuur",
        door: "Deur van de printer",
        camera: "Camera",
        live_view: "Altijd live beeld",
        image: "Voorbeeld van de print",
        ...trayLabels,
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "status")
      return "De sensor die meldt wat hij doet. RUNNING, IDLE, FINISH, PAUSE en FAILED worden herkend, en die van Octoprint en Klipper ook.";
    if (s.name === "power")
      return "Zetten en uitzetten. Bij UITzetten vraagt de kaart eerst of je het zeker weet — en loopt er een print, dan staat erbij hoe ver hij was.";
    if (s.name === "remaining")
      return "Een aantal minuten, een klok als 1:24:00 of het tijdstip waarop hij klaar is: alle drie worden gelezen. De kaart toont beide — hoe lang nog én hoe laat.";
    if (s.name === "camera")
      return "Het live beeld van de printer. Staat er ook een voorbeeld ingesteld, dan komt er een knop om te wisselen.";
    if (s.name === "live_view")
      return "Normaal ververst het beeld een paar keer per minuut en gaat hij alleen echt live zolang er een print loopt. Met deze knop staat de stream altijd aan — mooier, maar het kost een verbinding die de hele dag openstaat.";
    if (s.name === "image")
      return "De `image`-entiteit met de plaat van wat hij aan het maken is.";
    if (s.name === "tray_1")
      return "De vier trays van de AMS. De kaart haalt de kleur en het soort filament uit de attributen van de entiteit; Bambu levert die als hexwaarde. Lukt dat niet, vul dan hieronder zelf een kleur in.";
    if (/^tray_\d_color$/.test(s.name))
      return "Alleen nodig als de entiteit zijn kleur niet meelevert. Een hexwaarde (#FF6B00) of een kleurnaam.";
    return undefined;
  }
}

registerEditor("domotiapp-printer-card-editor", PrinterEditor);
registerCard("domotiapp-printer-card", PrinterCard, {
  name: "DomotiApp 3D-printer",
  description:
    "Live camerabeeld of het voorbeeld, voortgang met eindtijd, temperaturen, de deur en de vier trays van de AMS met hun echte kleur.",
});

export { PrinterCard };
