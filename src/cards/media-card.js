/**
 * Eén mediaspeler: wat er speelt, de knoppen, en het volume.
 *
 * Gebouwd naar wat de Mushroom-mediakaart doet, in de vormtaal van deze familie
 * -- dezelfde chip, dezelfde rijhoogte, dezelfde schuif als de lampkaart. De
 * kaart is één rasterrij zolang er niets speelt en groeit met de volumeregel
 * mee zodra dat wel zo is, precies zoals de lampkaart zijn kleurstrips uitklapt.
 *
 * WAT ER GETOOND WORDT, BESLIST DE SPELER
 *
 * Welke knoppen erop staan komt uit `supported_features` van de entiteit, niet
 * uit een instelling. Een Chromecast die geen "vorige" kent krijgt hem niet, een
 * radiostream zonder pauze krijgt stop, en een tv die alleen via zijn eigen
 * afstandsbediening luider gaat krijgt geen volumeregel in plaats van een schuif
 * die nergens op aankomt. Dat is dezelfde afspraak als bij de rolluikkaart
 * (positie) en de lampkaart (dimbaar of niet): het apparaat vertelt het zelf.
 * De logica staat in `media-logica.js` en heeft daar zijn eigen tests.
 *
 * DE HOES
 *
 * Speelt er iets met een albumhoes, dan staat die in de chip in plaats van een
 * icoon -- dezelfde regel als de clublogo's en profielfoto's elders in de
 * familie: wat de entiteit zelf meebrengt is specifieker dan het domeinicoon.
 * Je eigen icoon wint nog steeds van allebei.
 *
 * Het icoon en de kaart zijn twee knoppen, zoals overal in de familie: op het
 * icoon tikken start of pauzeert, op de kaart tikken opent de speler.
 *
 * ## Twee vormen
 *
 * **Rij** is de standaard: één rasterrij hoog, bedoeld om er zes onder elkaar te
 * zetten. **Groot** is telefoonformaat -- grote hoes, grote knoppen -- en is er
 * voor waar de kaart alle ruimte krijgt: een bubble-pop-up, een kolom van één
 * kaart, een tablet aan de muur. Dezelfde kaart, dezelfde logica; alleen de
 * maten verschillen, en dat scheelt een tweede kaart die uit de pas gaat lopen.
 *
 * In de grote vorm is de hoes de knop die start en pauzeert. De chip is dan weg:
 * een icoon van 40 pixels naast een hoes van 260 is ruis.
 *
 * ## De derde regel
 *
 * Shuffle, herhalen, zoeken en speakers staan apart van vorige/afspelen/volgende.
 * Die drie raak je aan terwijl je luistert; deze vier stel je één keer in of
 * gebruik je om iets nieuws te kiezen. Alles bij elkaar op één regel maakt van
 * een kaart een afstandsbediening.
 *
 * Zoeken en groeperen verschijnen alleen bij een speler van Music Assistant --
 * daar komt de bibliotheek vandaan, en de speakerlijst komt uit het MA-label.
 * Het zoekscherm zelf staat in `src/media/zoekscherm.js` en vult het hele
 * scherm; deze kaart opent het alleen.
 */

import { DacCard, registerCard, registerEditor, toneValue, TONES, INCOMPLETE } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { bindSlider, sliderCss, sliderHtml } from "../slider.js";
import {
  bindActions,
  defaultTapAction,
  isDead,
  localizeState,
  nameOf,
  pictureOf,
  runAction,
  stateOf,
} from "../ha.js";
import {
  extraVoor,
  geluidsSpeler,
  herhaalStand,
  isActief,
  isGedempt,
  isSpelend,
  isUit,
  knoppenVoor,
  mediaIcoon,
  shuffleAan,
  volgendeHerhaling,
  volumePct,
  volumeVoor,
  watSpeeltEr,
} from "./media-logica.js";
import { toonZoekscherm } from "../media/zoekscherm.js";

/** Het icoon en het voorleeslabel per knop. */
const KNOPPEN = {
  power: { icon: "power", label: "Aan of uit" },
  prev: { icon: "prev", label: "Vorige" },
  play: { icon: "play", label: "Afspelen of pauzeren" },
  stop: { icon: "stop", label: "Stoppen" },
  next: { icon: "next", label: "Volgende" },
  shuffle: { icon: "shuffle", label: "Willekeurig afspelen" },
  repeat: { icon: "repeat", label: "Herhalen" },
  search: { icon: "search", label: "Zoeken in Music Assistant" },
};

class MediaCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }

    .card {
      min-height: 56px; padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 7px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

    .top { display: flex; align-items: center; gap: 11px; min-height: 40px; }

    .chip { width: 40px; height: 40px; cursor: pointer; }
    .chip .icon, .chip ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
    /* Een speler die uit staat is stil, net als een lamp die uit is. */
    .top[data-on="false"] .chip {
      color: var(--dac-ink-3); background: rgba(255,255,255,.05); border-color: var(--dac-border);
    }
    .top[data-on="true"] .chip {
      box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
    }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* ---- de knoppen ---- */
    .ctl { flex: 0 0 auto; display: flex; align-items: center; gap: 6px; }
    .ctl:empty { display: none; }

    .k {
      width: 34px; height: 34px; flex: 0 0 auto; padding: 0; cursor: pointer;
      display: grid; place-items: center; border-radius: var(--dac-radius-pill);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      color: var(--dac-ink-2); font: inherit;
      transition: background 200ms ease, color 200ms ease, border-color 200ms ease,
                  transform 120ms ease;
    }
    .k:hover { background: var(--dac-surface-hi); color: var(--dac-ink); border-color: var(--dac-border-hi); }
    .k:active { transform: scale(.94); }
    .k .icon { width: 17px; height: 17px; }

    /* Afspelen is de knop waar je naar zoekt, dus die draagt de kleur. De rest
       blijft stil -- vijf gekleurde knopjes naast elkaar is een speelgoedauto. */
    .k.hoofd {
      color: var(--tone);
      background: color-mix(in srgb, var(--tone) 14%, transparent);
      border-color: color-mix(in srgb, var(--tone) 32%, transparent);
    }
    .k.hoofd:hover { background: color-mix(in srgb, var(--tone) 22%, transparent); }

    /* ---- volume ---- */
    ${sliderCss}
    .vol { display: flex; align-items: center; gap: 8px; }
    .vol[hidden] { display: none; }
    .vol .slider { height: 30px; }
    .vol .k { width: 30px; height: 30px; }
    .vol .k .icon { width: 16px; height: 16px; }
    .pct {
      flex: 0 0 auto; min-width: 36px; text-align: right;
      font-size: 11.5px; color: var(--dac-ink-2);
    }

    /* ---- derde regel ---- */
    .extra { display: flex; align-items: center; gap: 6px; }
    .extra[hidden] { display: none; }
    .extra .k { width: 30px; height: 30px; }
    .extra .k .icon { width: 16px; height: 16px; }
    /* Aan is aan: een shuffle die aanstaat draagt de kleur van de kaart, net
       als een brandende chip. Anders moet je de stand uit het icoon raden. */
    .extra .k[aria-pressed="true"] {
      color: var(--tone);
      background: color-mix(in srgb, var(--tone) 16%, transparent);
      border-color: color-mix(in srgb, var(--tone) 36%, transparent);
    }
    .extra .rek { flex: 1 1 auto; }

    /* ================= groot: telefoonformaat ================= */
    :host([layout="groot"]) .card { padding: 16px; gap: 14px; justify-content: flex-start; }

    .hoesgroot {
      width: 100%; aspect-ratio: 1 / 1; max-height: min(46vh, 320px);
      border-radius: var(--dac-radius); overflow: hidden; cursor: pointer;
      display: grid; place-items: center;
      background: color-mix(in srgb, var(--tone) 12%, var(--dac-surface));
      border: 1px solid var(--dac-border);
      transition: transform 220ms ease, border-color 220ms ease;
    }
    .hoesgroot:active { transform: scale(.99); }
    .hoesgroot img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .hoesgroot .icon { width: 64px; height: 64px; color: var(--tone); opacity: .8; }
    :host(:not([layout="groot"])) .hoesgroot { display: none; }

    /* De naam en wat er speelt komen onder de hoes te staan, gecentreerd, en
       een maat groter -- dit is de kaart waar je vanaf twee meter naar kijkt. */
    :host([layout="groot"]) .top { flex-direction: column; gap: 2px; text-align: center; }
    :host([layout="groot"]) .chip { display: none; }
    :host([layout="groot"]) .txt { width: 100%; align-items: center; }
    :host([layout="groot"]) .nm { font-size: 18px; font-weight: 600; white-space: normal; }
    :host([layout="groot"]) .st { font-size: 13.5px; }

    :host([layout="groot"]) .ctl { width: 100%; justify-content: center; gap: 14px; }
    :host([layout="groot"]) .ctl .k { width: 54px; height: 54px; }
    :host([layout="groot"]) .ctl .k .icon { width: 24px; height: 24px; }
    /* Afspelen is de knop waar je met je duim naartoe gaat, dus die is groter. */
    :host([layout="groot"]) .ctl .k.hoofd { width: 72px; height: 72px; }
    :host([layout="groot"]) .ctl .k.hoofd .icon { width: 30px; height: 30px; }

    :host([layout="groot"]) .vol { gap: 12px; }
    :host([layout="groot"]) .vol .k { width: 44px; height: 44px; }
    :host([layout="groot"]) .vol .k .icon { width: 20px; height: 20px; }
    :host([layout="groot"]) .vol .slider { height: 44px; }
    :host([layout="groot"]) .vol .slider .track { border-radius: 12px; }
    :host([layout="groot"]) .pct { font-size: 13.5px; min-width: 46px; }

    :host([layout="groot"]) .extra { justify-content: center; gap: 14px; padding-top: 2px; }
    :host([layout="groot"]) .extra .k { width: 46px; height: 46px; }
    :host([layout="groot"]) .extra .k .icon { width: 20px; height: 20px; }
    :host([layout="groot"]) .extra .rek { display: none; }

    .top.unavailable, .vol.unavailable { opacity: .42; }
    .top.unavailable .k, .top.unavailable .chip,
    .vol.unavailable .slider, .vol.unavailable .k { pointer-events: none; }
  `;

  validate(config) {
    if (!config.entity) {
      return { ...config, [INCOMPLETE]: "Kies een mediaspeler." };
    }
    return {
      layout: "row",
      show_artwork: true,
      show_volume: true,
      show_controls: true,
      show_search: true,
      ...config,
    };
  }

  watched() {
    // De geluidsentiteit hoort erbij: verandert daar het volume, dan moet de
    // schuif meebewegen ook al doet de speler zelf niets.
    return [this.config.entity, this.config.volume_entity].filter(Boolean);
  }

  tone_() {
    return this.config.tone ? toneValue(this.config.tone) : TONES.accent;
  }

  groot_() {
    return this.config.layout === "groot";
  }

  template() {
    if (this.config.bare) this.setAttribute("bare", "");
    this.setAttribute("layout", this.groot_() ? "groot" : "row");
    return `
      <div class="card surface" style="--tone:${this.tone_()}">
        ${this.groot_() ? `<div class="hoesgroot" role="button" tabindex="0"></div>` : ""}
        <div class="top" data-on="false">
          <span class="chip" role="button" tabindex="0"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="ctl"></span>
        </div>
        <div class="vol" hidden></div>
        <div class="extra" hidden></div>
      </div>`;
  }

  wire() {
    const c = this.config;
    const fire = (which, fallback) => runAction(this, this.hass, c, c[which] ?? fallback);

    this.teardown_.push(
      bindActions(this.$(".top"), {
        onTap: () => fire("tap_action", { action: "more-info" }),
        onHold: () => fire("hold_action", { action: "more-info" }),
      })
    );

    const chip = this.$(".chip");
    this.teardown_.push(
      bindActions(chip, {
        onTap: () => fire("icon_tap_action", defaultTapAction(c.entity)),
        onHold: () => fire("icon_hold_action", { action: "more-info" }),
      })
    );
    this.on(chip, "click", (e) => e.stopPropagation());
    this.on(chip, "pointerdown", (e) => e.stopPropagation());

    // In de grote vorm is de hoes de knop: tikken start of pauzeert, net als de
    // chip in de rijvorm. Dat is dezelfde afspraak, alleen groter.
    const hoes = this.$(".hoesgroot");
    if (hoes) {
      this.teardown_.push(
        bindActions(hoes, {
          onTap: () => fire("icon_tap_action", defaultTapAction(c.entity)),
          onHold: () => fire("icon_hold_action", { action: "more-info" }),
        })
      );
      this.on(hoes, "click", (e) => e.stopPropagation());
      this.on(hoes, "pointerdown", (e) => e.stopPropagation());
    }

    // Eén luisteraar voor alle knoppen samen, want wélke knoppen er staan
    // verandert met de toestand van de speler. Ze per stuk aanhangen zou bij
    // elke hertekening opnieuw moeten -- en zo krijg je drie keer dezelfde
    // luisteraar op één knop (zie de kop van base.js).
    const klik = (e) => {
      const knop = e.target.closest?.("[data-k]");
      if (!knop) return;
      e.stopPropagation();
      this.doe_(knop.dataset.k);
    };
    this.on(this.$(".ctl"), "click", klik);
    this.on(this.$(".vol"), "click", klik);
    this.on(this.$(".extra"), "click", klik);
    // Anders leest een tik op een knop ook als een tik op de kaart.
    this.on(this.$(".ctl"), "pointerdown", (e) => e.stopPropagation());
    this.on(this.$(".vol"), "pointerdown", (e) => e.stopPropagation());
    this.on(this.$(".extra"), "pointerdown", (e) => e.stopPropagation());

    this.sliders_ = new Map();
  }

  /** Eén knop, één service-aanroep. */
  doe_(soort) {
    const id = this.config.entity;
    const st = stateOf(this.hass, id);
    const roep = (service, data = {}) =>
      this.hass.callService("media_player", service, { entity_id: id, ...data });

    switch (soort) {
      case "power":
        return roep(isUit(st) ? "turn_on" : "turn_off");
      case "prev":
        return roep("media_previous_track");
      case "next":
        return roep("media_next_track");
      case "play":
        return roep(isSpelend(st) ? "media_pause" : "media_play");
      case "stop":
        return roep("media_stop");
      case "mute": {
        const geluid = geluidsSpeler(this.config);
        return this.hass.callService(
          "media_player",
          "volume_mute",
          { is_volume_muted: !isGedempt(stateOf(this.hass, geluid)) },
          { entity_id: geluid }
        );
      }
      case "vol-":
      case "vol+":
        return this.hass.callService(
          "media_player",
          soort === "vol+" ? "volume_up" : "volume_down",
          {},
          { entity_id: geluidsSpeler(this.config) }
        );
      case "shuffle":
        return this.hass.callService(
          "media_player",
          "shuffle_set",
          { shuffle: !shuffleAan(st) },
          { entity_id: id }
        );
      case "repeat":
        return this.hass.callService(
          "media_player",
          "repeat_set",
          { repeat: volgendeHerhaling(herhaalStand(st)) },
          { entity_id: id }
        );
      case "search":
        // Eén knop, één scherm: zoeken bovenaan, de speakers onderin.
        return toonZoekscherm(this.hass, id, nameOf(this.hass, id, this.config.name));
      default:
        return undefined;
    }
  }

  paint() {
    const c = this.config;
    const st = stateOf(this.hass, c.entity);
    const dood = !st || st.state === "unavailable";
    const aan = isActief(st);

    const top = this.$(".top");
    top.dataset.on = String(aan);
    top.classList.toggle("unavailable", dood);
    this.$(".card").style.setProperty("--tone", this.tone_());

    // De hoes wint van het domeinicoon, jouw icoon wint van allebei.
    const chip = this.$(".chip");
    const pic = c.show_artwork === false ? null : pictureOf(this.hass, c.entity, c.icon);
    const wens = pic ? `pic:${pic}` : c.icon || mediaIcoon(st);
    if (chip.dataset.icon !== wens) {
      chip.dataset.icon = wens;
      chip.classList.toggle("pic", Boolean(pic));
      chip.innerHTML = pic ? `<img src="${pic}" alt="" loading="lazy" />` : resolve(wens, "speaker");
    }
    chip.style.setProperty("--tone", aan && !pic ? this.tone_() : "var(--dac-ink-3)");

    // De grote hoes: de albumhoes als die er is, anders het icoon op formaat.
    const hoes = this.$(".hoesgroot");
    if (hoes && hoes.dataset.icon !== wens) {
      hoes.dataset.icon = wens;
      hoes.innerHTML = pic
        ? `<img src="${pic}" alt="" loading="lazy" />`
        : resolve(c.icon || mediaIcoon(st), "speaker");
    }

    const naam = nameOf(this.hass, c.entity, c.name);
    const speelt = watSpeeltEr(st, (s) => localizeState(this.hass, s));
    this.text(".nm", naam);
    this.text(".st", speelt);
    chip.setAttribute("aria-label", `${naam} afspelen of pauzeren`);
    this.$(".hoesgroot")?.setAttribute("aria-label", `${naam} afspelen of pauzeren`);
    top.setAttribute("aria-label", `${naam}, ${speelt}`);

    this.paintKnoppen_(st, dood);
    this.paintVolume_(st, dood);
    this.paintExtra_(st, dood);
  }

  paintKnoppen_(st, dood) {
    const ctl = this.$(".ctl");
    const soorten = this.config.show_controls === false || dood ? [] : knoppenVoor(st);
    const sig = soorten.join(",");
    if (ctl.dataset.sig !== sig) {
      ctl.dataset.sig = sig;
      ctl.innerHTML = soorten
        .map(
          (s) =>
            `<button class="k ${s === "play" || s === "stop" ? "hoofd" : ""}" type="button"` +
            ` data-k="${s}" aria-label="${KNOPPEN[s].label}">${resolve(KNOPPEN[s].icon)}</button>`
        )
        .join("");
    }

    // Alleen het afspeelicoon wisselt met de toestand; de rest staat vast.
    const play = ctl.querySelector('[data-k="play"]');
    if (play) {
      const wens = isSpelend(st) ? "pause" : "play";
      if (play.dataset.icon !== wens) {
        play.dataset.icon = wens;
        play.innerHTML = resolve(wens);
      }
    }
  }

  paintVolume_(st, dood) {
    const box = this.$(".vol");
    // Het volume kan bij een ándere entiteit horen dan de speler: een tv met een
    // soundbar eronder. Dan bepaalt die soundbar wat er te regelen valt.
    const geluid = geluidsSpeler(this.config);
    const gst = geluid === this.config.entity ? st : stateOf(this.hass, geluid);
    const delen = this.config.show_volume === false || dood ? [] : volumeVoor(gst);
    box.hidden = !delen.length;
    if (!delen.length) {
      box.dataset.sig = "";
      this.sliders_?.delete("volume");
      return;
    }

    const sig = delen.join(",");
    if (box.dataset.sig !== sig) {
      box.dataset.sig = sig;
      box.innerHTML =
        (delen.includes("mute")
          ? `<button class="k" type="button" data-k="mute" aria-label="Dempen">${resolve("volume")}</button>`
          : "") +
        (delen.includes("slider") ? sliderHtml("volume") : "") +
        (delen.includes("steps")
          ? `<button class="k" type="button" data-k="vol-" aria-label="Zachter">${resolve("minus")}</button>` +
            `<button class="k" type="button" data-k="vol+" aria-label="Harder">${resolve("plus")}</button>`
          : "") +
        `<span class="pct tnum"></span>`;
      this.sliders_?.delete("volume");
      box.querySelector(".slider")?.setAttribute("aria-label", "Volume");
    }

    const gedempt = isGedempt(gst);
    const pct = volumePct(gst);

    const mute = box.querySelector('[data-k="mute"]');
    if (mute) {
      const wens = gedempt ? "volumeMute" : "volume";
      if (mute.dataset.icon !== wens) {
        mute.dataset.icon = wens;
        mute.innerHTML = resolve(wens);
      }
      mute.setAttribute("aria-pressed", String(gedempt));
    }

    const el = box.querySelector(".slider");
    if (el) {
      this.attach_(el, "volume", {
        value: () => volumePct(stateOf(this.hass, geluidsSpeler(this.config))),
        onInput: (v) => this.setSlider_(el, v),
        onCommit: (v) =>
          this.hass.callService(
            "media_player",
            "volume_set",
            { volume_level: v / 100 },
            { entity_id: geluidsSpeler(this.config) }
          ),
        disabled: () => isDead(stateOf(this.hass, geluidsSpeler(this.config))),
      });
      // Tijdens het slepen niet overschrijven: dan trilt de schuif tussen waar
      // je vinger is en wat de speler net terugmeldde.
      if (!el.classList.contains("dragging")) this.setSlider_(el, pct);
    }
    // Gedempt is geen volume van 0: de schuif blijft staan waar hij stond, en
    // de tekst zegt wat er aan de hand is.
    this.text(".pct", gedempt ? "Gedempt" : `${pct}%`);
  }

  paintExtra_(st, dood) {
    const box = this.$(".extra");
    const soorten =
      dood || this.config.show_controls === false
        ? []
        : extraVoor(st, { zoeken: this.config.show_search !== false });
    box.hidden = !soorten.length;
    const sig = soorten.join(",");
    if (box.dataset.sig !== sig) {
      box.dataset.sig = sig;
      box.innerHTML = soorten
        .map((soort, i) =>
          // De rek duwt zoeken en speakers naar rechts, weg van shuffle en
          // herhalen: instellen links, iets nieuws kiezen rechts.
          `${soort === "search" && i > 0 ? `<span class="rek"></span>` : ""}` +
          `<button class="k" type="button" data-k="${soort}"` +
          ` aria-label="${KNOPPEN[soort].label}">${resolve(KNOPPEN[soort].icon)}</button>`
        )
        .join("");
    }
    if (!soorten.length) return;

    const shuffleKnop = box.querySelector('[data-k="shuffle"]');
    if (shuffleKnop) shuffleKnop.setAttribute("aria-pressed", String(shuffleAan(st)));

    const herhaalKnop = box.querySelector('[data-k="repeat"]');
    if (herhaalKnop) {
      const stand = herhaalStand(st);
      const wens = stand === "one" ? "repeatOne" : "repeat";
      if (herhaalKnop.dataset.icon !== wens) {
        herhaalKnop.dataset.icon = wens;
        herhaalKnop.innerHTML = resolve(wens);
      }
      herhaalKnop.setAttribute("aria-pressed", String(stand !== "off"));
      herhaalKnop.setAttribute(
        "aria-label",
        { off: "Herhalen: uit", all: "Herhalen: alles", one: "Herhalen: dit nummer" }[stand]
      );
    }

    // Staat het zoekscherm open op déze speler, dan houdt het zijn hass bij --
    // anders weet het niet wie er meespeelt in de groep.
    const scherm = document.querySelector("domotiapp-media-browser");
    if (scherm?.hasAttribute("open")) scherm.hass = this.hass;
  }

  /** Hang een schuif aan zodra hij bestaat, en niet twee keer. */
  attach_(el, soort, opts) {
    if (!el || this.sliders_.has(soort)) return;
    const off = bindSlider(el, opts);
    this.sliders_.set(soort, off);
    this.teardown_.push(off);
  }

  setSlider_(el, v) {
    if (!el) return;
    el.style.setProperty("--v", `${v}%`);
    el.setAttribute("aria-valuenow", String(v));
    this.text(".pct", `${v}%`);
  }

  getCardSize() {
    if (this.config?.layout === "groot") return 8;
    const st = stateOf(this.hass, this.config?.entity);
    return 1 + (volumeVoor(st).length ? 1 : 0) + (extraVoor(st).length ? 1 : 0);
  }

  getGridOptions() {
    // "auto": de kaart is zo hoog als zijn inhoud. Dat geldt voor allebei de
    // vormen -- de rijvorm groeit met de volumeregel mee, en de grote vorm met
    // de hoes. Een vast aantal rasterrijen zou bij de een een strook leeg laten
    // en bij de ander de hoes afkappen.
    if (this.config?.layout === "groot") {
      return { columns: 12, rows: "auto", min_columns: 6, min_rows: 6 };
    }
    return { columns: 12, rows: "auto", min_columns: 4, min_rows: 1 };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-media-card-editor");
  }

  static getStubConfig(hass, entities) {
    const speler = entities?.find((e) => e.startsWith("media_player."));
    return speler ? { entity: speler } : {};
  }
}

class MediaEditor extends DacEditor {
  defaults() {
    return {
      layout: "row",
      show_artwork: true,
      show_volume: true,
      show_controls: true,
      show_search: true,
      icon_tap_action: { action: "toggle" },
      tap_action: { action: "more-info" },
    };
  }

  pickers() {
    return [
      { key: "icon", kind: "icon", label: "Icoon", fallback: "speaker" },
      { key: "tone", kind: "tone", label: "Kleur" },
    ];
  }

  schema() {
    return [
      { name: "entity", selector: sel.entity("media_player") },
      { name: "name", selector: sel.text() },
      {
        name: "layout",
        selector: sel.select([
          { value: "row", label: "Rij (één rasterrij hoog)" },
          { value: "groot", label: "Groot (telefoonformaat, grote knoppen)" },
        ]),
      },
      { name: "volume_entity", selector: sel.entity("media_player") },
      { name: "show_artwork", selector: sel.bool() },
      { name: "show_controls", selector: sel.bool() },
      { name: "show_volume", selector: sel.bool() },
      { name: "show_search", selector: sel.bool() },
      { name: "icon_tap_action", selector: sel.action("toggle") },
      { name: "icon_hold_action", selector: sel.action("more-info") },
      { name: "tap_action", selector: sel.action("more-info") },
      { name: "hold_action", selector: sel.action("more-info") },
    ];
  }

  label(s) {
    return (
      {
        entity: "Mediaspeler",
        name: "Naam (overschrijft die van de speler)",
        layout: "Vorm",
        volume_entity: "Geluid van (optioneel)",
        show_artwork: "Albumhoes tonen",
        show_controls: "Knoppen tonen",
        show_volume: "Volume tonen",
        show_search: "Zoeken en groeperen tonen",
        icon_tap_action: "Tikken op het icoon",
        icon_hold_action: "Vasthouden op het icoon",
        tap_action: "Tikken op de kaart",
        hold_action: "Vasthouden op de kaart",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "entity")
      return "Welke knoppen er verschijnen leest de kaart uit de speler zelf: wat hij niet kan, komt er niet op.";
    if (s.name === "layout")
      return "Groot is bedoeld voor een pop-up of een kolom waar de kaart alle ruimte krijgt: grote hoes, grote knoppen.";
    if (s.name === "volume_entity")
      return "Zit het geluid ergens anders dan het beeld — een tv met een soundbar eronder — kies dan hier de speler die het volume regelt. Leeg laten betekent: de speler zelf.";
    if (s.name === "show_artwork")
      return "Speelt er iets met een hoes, dan vult die de chip. Een eigen icoon gaat voor.";
    if (s.name === "show_volume")
      return "De volumeregel verschijnt zodra er iets speelt en verdwijnt als de speler uit gaat.";
    if (s.name === "show_search")
      return "De zoekknop opent Music Assistant over het hele scherm. Alleen bij een speler van Music Assistant; groeperen komt erbij als de speler dat aankan.";
    return undefined;
  }
}

registerEditor("domotiapp-media-card-editor", MediaEditor);
registerCard("domotiapp-media-card", MediaCard, {
  name: "DomotiApp Mediaspeler",
  description: "Wat er speelt, de knoppen die de speler aankan, en het volume.",
});
