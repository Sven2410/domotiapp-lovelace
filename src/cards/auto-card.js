/**
 * De auto: hoe vol, hoe ver, en wat er openstaat.
 *
 * Gevraagd op 27 augustus 2026. Zie de kop van `auto-logica.js` voor zijn
 * woorden; hier staat waarom de kaart eruitziet zoals hij eruitziet.
 *
 * ## Waarom de aandrijving een KEUZE is en geen gok
 *
 * Een elektrische auto heeft een accubalk, een benzineauto een tankbalk, en een
 * hybride allebei. Dat had de kaart kunnen raden aan de hand van welke sensoren
 * er zijn ingevuld -- en dan zou hij bij een half ingevulde kaart de verkeerde
 * balk tonen, zonder dat er iets te zien is dat verkeerd staat. Nu kiest de
 * eigenaar het in de editor, en de editor toont daarna alleen de velden die bij
 * die keuze horen. Dat is ook het antwoord op "minimalistische GUI-editor":
 * niet minder kunnen invullen, maar minder tegelijk zien.
 *
 * ## Waarom de foto de kaart niet vult
 *
 * De verleiding is een grote foto met de gegevens erover heen. Dat leest mooi op
 * één kaart en slecht op een dashboard: een donkere auto op een donkere
 * achtergrond maakt witte cijfers onleesbaar, en dat hangt af van de foto die de
 * klant kiest. De foto staat daarom naast de gegevens en niet eronder. Wie hem
 * groot wil, zet hem groot -- dan komt hij bovenaan, met de gegevens eronder op
 * hun eigen vlak.
 *
 * ## De balken
 *
 * Twee soorten, met dezelfde vorm: een lijn met een gevulde kop. De kleur volgt
 * de STAND en niet de identiteit -- onder de 20% oranje, onder de 10% rood. Dat
 * mag hier, want dit is precies het geval waarvoor rood en groen in deze familie
 * gereserveerd zijn (zie theme.js): status, geen identiteit.
 */

import { DacCard, INCOMPLETE, TONES, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { isOn, moreInfo, nameOf, stateOf } from "../ha.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import {
  AANDRIJVING,
  afstand,
  alsDuur,
  heeftAccu,
  heeftTank,
  laadStand,
  laadTekst,
  ladenTot,
  locatie,
  niveau,
  pct,
  statusregel,
} from "./auto-logica.js";

const TOON = {
  good: TONES.good,
  warn: TONES.warn,
  bad: TONES.bad,
  neutral: TONES.neutral,
  accent: TONES.accent,
};

class AutoCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }

    .card {
      min-height: var(--dac-raster, 120px); padding: 10px 12px;
      display: flex; flex-direction: column; gap: 10px;
      /* De kaart mag langer worden, nooit breder. Gemeld op 27 augustus 2026:
         de knoppenrij rechtsboven kromp niet mee en duwde zichzelf buiten de
         kaart. Dit is het vangnet; de regels hieronder zorgen dat het niet
         nodig is. */
      overflow: hidden;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ---- kop ---- */
    /* flex-wrap: past de knoppenrij niet naast de naam, dan gaat hij eronder
       staan in plaats van eruit. Langer mag, breder niet. */
    .kop { display: flex; align-items: center; gap: 11px; min-width: 0; flex-wrap: wrap; }
    .foto {
      flex: 0 0 auto; width: 76px; height: 46px; border-radius: var(--dac-radius-sm);
      overflow: hidden; background: var(--dac-surface); cursor: pointer;
      display: grid; place-items: center;
      border: 1px solid var(--dac-border);
    }
    .foto img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .foto .icon, .foto ha-icon {
      width: 22px; height: 22px; --mdc-icon-size: 22px; color: var(--dac-ink-3);
    }
    /* Groot: de foto gaat bovenaan over de volle breedte. */
    :host([foto="groot"]) .card { gap: 0; padding: 0; }
    :host([foto="groot"]) .kop { padding: 10px 12px; }
    :host([foto="groot"]) .binnen { padding: 0 12px 11px; display: flex; flex-direction: column; gap: 10px; }
    :host([foto="groot"]) .foto {
      width: 100%; height: auto; aspect-ratio: 16 / 7; border-radius: 0;
      border: 0; border-bottom: 1px solid var(--dac-border);
      order: -1;
    }
    :host(:not([foto="groot"])) .binnen { display: contents; }

    .tekst { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
    .nm {
      font-size: 14.5px; font-weight: 600; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11.5px; line-height: 1.3; color: var(--melding, var(--dac-ink-2));
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* De knoppen rechtsboven: slot en klimaat. Klein, want het zijn dingen die
       je zelden doet en nooit per ongeluk wilt doen. */
    .acties { display: flex; gap: 6px; flex: 0 1 auto; margin-left: auto; }
    .acties button {
      width: 34px; height: 34px; display: grid; place-items: center; cursor: pointer;
      padding: 0; font: inherit; color: var(--dac-ink-3);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
      transition: color 180ms ease, border-color 180ms ease, background 180ms ease;
    }
    .acties button[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
      background: color-mix(in srgb, var(--dac-accent) 16%, transparent);
    }
    .acties button[data-let="true"] { color: var(--dac-warn); border-color: color-mix(in srgb, var(--dac-warn) 45%, transparent); }
    .acties button .icon { width: 16px; height: 16px; }
    @media (hover: hover) { .acties button:hover { border-color: var(--dac-border-hi); } }

    /* ---- balken ---- */
    .balken { display: flex; flex-direction: column; gap: 8px; }
    .balken[hidden] { display: none; }
    .meter { display: flex; flex-direction: column; gap: 4px; }
    .meter .regel {
      display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
      font-size: 11px; color: var(--dac-ink-3);
    }
    .meter .regel .l { display: inline-flex; align-items: center; gap: 5px; }
    .meter .regel .l .icon { width: 12px; height: 12px; color: var(--balk); }
    .meter .regel .w {
      font-size: 12.5px; font-weight: 600; color: var(--dac-ink);
      font-variant-numeric: tabular-nums;
    }
    .lijn {
      height: 6px; border-radius: 3px; overflow: hidden;
      background: var(--dac-surface-hi);
    }
    .lijn i {
      display: block; height: 100%; width: var(--pct, 0%);
      background: var(--balk, var(--dac-accent-hi)); border-radius: 3px;
      transition: width 500ms ease, background 300ms ease;
    }
    /* Zolang hij laadt, loopt er een glans over de balk. Dat is het enige
       bewegende op deze kaart, en het staat alleen aan als er echt iets
       gebeurt. */
    .lijn[data-laadt="true"] i {
      background-image: linear-gradient(
        90deg, transparent 0%, rgba(255,255,255,.34) 50%, transparent 100%
      );
      background-size: 42% 100%; background-repeat: no-repeat;
      animation: glans 1.9s linear infinite;
    }
    @keyframes glans { from { background-position: -42% 0 } to { background-position: 142% 0 } }
    @media (prefers-reduced-motion: reduce) { .lijn[data-laadt="true"] i { animation: none; } }

    /* ---- tegels ---- */
    /* auto-fit met een ondergrens: de tegels vullen de breedte die er IS, en
       vallen op een smalle kaart vanzelf op een tweede rij. Een vast aantal
       kolommen perst ze samen tot de tekst eruit loopt. */
    .tegels {
      display: grid; gap: 7px;
      grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));
    }
    .tegels[hidden] { display: none; }
    .tegel {
      display: flex; flex-direction: column; align-items: center; gap: 1px;
      padding: 7px 5px; min-width: 0;
      background: rgba(255,255,255,.038); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm); cursor: pointer;
    }
    .tegel .w {
      font-size: 13.5px; font-weight: 500; color: var(--dac-ink);
      font-variant-numeric: tabular-nums; max-width: 100%;
      /* Afbreken en niet afknippen. "Niet aan de lader" werd anders "Niet aan
         de lad...", en dan staat er een tegel die je niet kunt lezen. In een
         raster worden de tegels toch al even hoog, dus een tweede regel kost
         niets. */
      text-align: center; line-height: 1.15;
      overflow-wrap: anywhere;
    }
    .tegel .l {
      font-size: 10px; line-height: 1.2; color: var(--dac-ink-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
    }
    /* Alleen waar de STAND iets zegt -- thuis, of aan het laden. De rest blijft
       in neutrale inkt; zie theme.js, het getal draagt nooit de kleur. */
    .tegel[style*="--tegeltoon"] .w { color: var(--tegeltoon); }

    :host([dead]) .card { opacity: .45; }

    @container (max-width: 340px) {
      :host(:not([foto="groot"])) .foto { display: none; }
    }
  `;

  validate(config) {
    const c = { name: "", icon: "car", drivetrain: "electric", photo_size: "klein", ...config };
    const iets =
      c.battery || c.fuel || c.range || c.range_electric || c.sensors?.length || c.lock || c.image;
    if (!iets) {
      c[INCOMPLETE] =
        "Kies de aandrijving en vul minstens één sensor in — de accu, de tank of de actieradius.";
    }
    return c;
  }

  watched() {
    const c = this.config;
    return [
      c.battery,
      c.fuel,
      c.range,
      c.range_electric,
      c.charging,
      c.charging_ready,
      c.charging_power,
      c.plug,
      c.lock,
      c.doors,
      c.windows,
      c.odometer,
      c.climate,
      c.location,
      ...(Array.isArray(c.sensors) ? c.sensors : []),
    ].filter(Boolean);
  }

  soort_() {
    return AANDRIJVING[this.config.drivetrain] ? this.config.drivetrain : "electric";
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    this.setAttribute("foto", c.photo_size === "groot" ? "groot" : "klein");
    this.style.containerType = "inline-size";

    return `
      <div class="card surface">
        <div class="kop">
          <span class="foto" role="button" tabindex="0"></span>
          <span class="tekst">
            <span class="nm"></span>
            <span class="st"></span>
          </span>
          <span class="acties"></span>
        </div>
        <div class="binnen">
          <div class="balken" hidden></div>
          <div class="tegels" hidden></div>
        </div>
      </div>`;
  }

  wire() {
    this.teardown_.push(volgRaster(this.$(".card")));

    this.on(this.$(".foto"), "click", () => {
      const c = this.config;
      moreInfo(this, c.battery || c.range || c.fuel || c.lock);
    });

    // Eén luisteraar voor alle knoppen samen: wélke er staan verandert met de
    // toestand van de auto (zie de kop van base.js).
    this.on(this.$(".acties"), "click", (e) => {
      const knop = e.target.closest?.("[data-k]");
      if (!knop) return;
      e.stopPropagation();
      this.doe_(knop.dataset.k);
    });

    this.on(this.$(".tegels"), "click", (e) => {
      const tegel = e.target.closest?.("[data-id]");
      if (tegel) moreInfo(this, tegel.dataset.id);
    });
  }

  doe_(wat) {
    const c = this.config;
    if (wat === "lock") {
      const st = stateOf(this.hass, c.lock);
      const opSlot = String(st?.state) === "locked";
      return this.hass.callService("lock", opSlot ? "unlock" : "lock", { entity_id: c.lock });
    }
    if (wat === "climate") {
      const st = stateOf(this.hass, c.climate);
      const domein = String(c.climate).split(".")[0];
      return this.hass.callService(domein, isOn(st) ? "turn_off" : "turn_on", {
        entity_id: c.climate,
      });
    }
    if (wat === "location") return moreInfo(this, c.location);
    return undefined;
  }

  paint() {
    const c = this.config;
    const soort = this.soort_();

    const accu = heeftAccu(soort) ? pct(stateOf(this.hass, c.battery), c.battery_max) : null;
    const tank = heeftTank(soort) ? pct(stateOf(this.hass, c.fuel), c.fuel_max) : null;
    const radius = afstand(stateOf(this.hass, c.range));
    const laden = laadStand(stateOf(this.hass, c.charging));
    const laadMin = ladenTot(stateOf(this.hass, c.charging_ready));
    const slotSt = stateOf(this.hass, c.lock);
    const open = isOn(stateOf(this.hass, c.doors)) || isOn(stateOf(this.hass, c.windows));
    // Waar hij staat, als thuis of afwezig. Zie `locatie` in auto-logica.js:
    // een coordinaat wordt tegen de locatie van Home Assistant gelegd, en een
    // tracker die zelf "home" zegt wordt gewoon geloofd.
    const waar = locatie(stateOf(this.hass, c.location), this.hass, Number(c.home_radius) || undefined);

    const dood =
      c.battery && !stateOf(this.hass, c.battery) && c.range && !stateOf(this.hass, c.range);
    this.toggleAttribute("dead", Boolean(dood));

    this.text(".nm", c.name || nameOf(this.hass, c.battery || c.range || c.lock, "Auto"));

    const regel = statusregel({
      open,
      slot: slotSt ? String(slotSt.state) : null,
      laden,
      laadMinuten: laadMin,
      radius,
      aandrijving: soort,
    });
    this.text(".st", regel.tekst);
    this.$(".st").style.setProperty("--melding", TOON[regel.toon] ?? TONES.neutral);

    this.paintFoto_();
    this.paintActies_(slotSt, open);
    this.paintBalken_({ accu, tank, radius, laden, soort });
    this.paintTegels_(waar, laden);

    meetRaster(this.$(".card"));
  }

  paintFoto_() {
    const vak = this.$(".foto");
    const bron = this.config.image;
    if (!bron) {
      if (vak.dataset.bron !== "") {
        vak.dataset.bron = "";
        vak.innerHTML = resolve(this.config.icon || "car");
      }
      return;
    }
    if (vak.dataset.bron === bron) return;
    vak.dataset.bron = bron;
    const img = document.createElement("img");
    img.src = bron;
    img.alt = this.config.name || "De auto";
    img.loading = "lazy";
    // Een pad dat niet klopt geeft anders een gebroken plaatje; dan liever het
    // icoon terug, precies zoals bij een kaart zonder foto.
    img.onerror = () => {
      vak.dataset.bron = "";
      vak.innerHTML = resolve(this.config.icon || "car");
    };
    vak.replaceChildren(img);
  }

  paintActies_(slotSt, open) {
    const c = this.config;
    const vak = this.$(".acties");
    const knoppen = [];

    if (c.lock && slotSt) {
      const opSlot = String(slotSt.state) === "locked";
      knoppen.push({
        k: "lock",
        icon: opSlot ? "lock" : "lockOpen",
        label: opSlot ? "Openen" : "Op slot zetten",
        aan: opSlot,
        let: !opSlot,
      });
    }
    if (c.climate) {
      const aan = isOn(stateOf(this.hass, c.climate));
      knoppen.push({ k: "climate", icon: "airco", label: "Klimaat", aan });
    }
    // De locatie stond hier ook als knop. Die is eruit: waar de auto staat is
    // iets om te lezen, en de rij duwde zichzelf buiten de kaart. Hij staat nu
    // als tegel onderaan -- zie paintTegels_.

    const sig = knoppen.map((k) => `${k.k}|${k.icon}|${k.aan}|${k.let}`).join(",");
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML = knoppen
      .map(
        (k) =>
          `<button type="button" data-k="${k.k}" aria-pressed="${Boolean(k.aan)}"` +
          ` data-let="${Boolean(k.let)}" aria-label="${k.label}">${resolve(k.icon)}</button>`
      )
      .join("");
  }

  paintBalken_({ accu, tank, radius, laden, soort }) {
    const c = this.config;
    const vak = this.$(".balken");
    const meters = [];

    if (accu !== null) {
      const n = niveau(accu);
      meters.push({
        sleutel: "accu",
        icoon: "battery",
        label: "Accu",
        pct: accu,
        // Zolang hij laadt is de kleur die van het laden en niet die van de
        // stand: een accu op 8% die aan de lader hangt is geen alarm.
        toon: laden === "charging" ? "accent" : n.toon,
        waarde: `${accu}%`,
        laadt: laden === "charging",
      });
    }
    if (tank !== null) {
      const n = niveau(tank);
      meters.push({
        sleutel: "tank",
        icoon: soort === "hybrid" ? "petrol" : AANDRIJVING[soort].icoon,
        label: "Tank",
        pct: tank,
        toon: n.toon,
        waarde: `${tank}%`,
        laadt: false,
      });
    }
    // De actieradius staat als tekst bij de balk waar hij bij hoort, en krijgt
    // alleen een eigen regel als er geen enkele balk is.
    if (!meters.length && radius) {
      meters.push({
        sleutel: "radius",
        icoon: "gaugeArrow",
        label: "Actieradius",
        pct: null,
        toon: "neutral",
        waarde: `${radius.waarde} ${radius.eenheid}`,
        laadt: false,
      });
    }

    vak.hidden = !meters.length;
    if (!meters.length) return;

    const extra = radius ? `${radius.waarde} ${radius.eenheid}` : "";
    const laadMin = ladenTot(stateOf(this.hass, c.charging_ready));
    const sig = meters.map((m) => `${m.sleutel}:${m.pct}:${m.toon}:${m.laadt}`).join(",") + extra + laadMin;
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;

    vak.innerHTML = meters
      .map((m, i) => {
        // De actieradius hoort bij de eerste balk: dat is de accu bij een
        // elektrische auto en de tank bij een benzineauto.
        const rechts =
          i === 0 && m.sleutel !== "radius" && extra
            ? `<span class="w">${this.veilig_(m.waarde)} · ${this.veilig_(extra)}</span>`
            : `<span class="w">${this.veilig_(m.waarde)}</span>`;
        const bij =
          m.laadt && laadMin ? ` · nog ${this.veilig_(alsDuur(laadMin))}` : "";
        return `
          <div class="meter" style="--balk:${TOON[m.toon] ?? TONES.neutral}">
            <div class="regel">
              <span class="l">${resolve(m.icoon)}<span>${this.veilig_(m.label)}${bij}</span></span>
              ${rechts}
            </div>
            ${
              m.pct === null
                ? ""
                : `<div class="lijn" data-laadt="${m.laadt}"><i style="--pct:${m.pct}%"></i></div>`
            }
          </div>`;
      })
      .join("");
  }

  /**
   * De tegels onderaan.
   *
   * Hier staan sinds 27 augustus 2026 ook de LOCATIE en de LAADSTATUS in, en
   * daar is een reden voor die uit zijn eigen melding komt.
   *
   * De locatie zat als knop in de rij rechtsboven. Die rij kromp niet mee en
   * duwde zichzelf buiten de kaart -- *"die voertuigtracker wordt buiten de
   * kaart rechts gezet, dat is niet de bedoeling"*. Maar los daarvan was het ook
   * de verkeerde vorm: waar de auto staat is iets om te LEZEN, geen knop om in
   * te drukken. Als tegel staat het er gewoon, en tikken opent nog steeds de
   * kaart van Home Assistant.
   *
   * De laadstatus stond helemaal nergens zolang er niet geladen werd -- *"wat
   * doet laadstatus? want als ik daar mijn sensor in vul die op NOT_PLUGGED_IN
   * staat, dan zie ik niks"*. Terecht: een veld dat je invult hoort iets te
   * laten zien.
   */
  paintTegels_(waar, laden) {
    const c = this.config;
    const vak = this.$(".tegels");
    const uit = [];

    const voegToe = (id, label) => {
      const st = stateOf(this.hass, id);
      if (!st || st.state === "unavailable" || st.state === "unknown") return;
      const eenheid = st.attributes?.unit_of_measurement ?? "";
      const n = Number(st.state);
      const waarde = Number.isFinite(n)
        ? `${Math.round(n * 10) / 10}${eenheid ? ` ${eenheid}` : ""}`
        : st.state;
      uit.push({ id, w: waarde, l: label ?? nameOf(this.hass, id, id) });
    };

    // Waar hij staat. De afstand komt erbij als hij NIET thuis is en we hem
    // hebben uitgerekend -- "Afwezig" alleen zegt weinig, "Afwezig · 12 km" wel.
    if (c.location && waar?.tekst) {
      const ver =
        waar.thuis === false && waar.meters !== null
          ? waar.meters >= 1000
            ? ` · ${Math.round(waar.meters / 100) / 10} km`
            : ` · ${waar.meters} m`
          : "";
      uit.push({
        id: c.location,
        w: waar.tekst + ver,
        l: "Waar hij staat",
        toon: waar.thuis === true ? "good" : null,
      });
    }

    // De laadstatus, ook als er niet geladen wordt.
    if (c.charging) {
      const st = stateOf(this.hass, c.charging);
      const tekst = laadTekst(laden, st);
      if (tekst) {
        uit.push({
          id: c.charging,
          w: tekst,
          l: "Laadstatus",
          toon: laden === "charging" ? "accent" : laden === "complete" ? "good" : null,
        });
      }
    }

    if (c.odometer) voegToe(c.odometer, "Kilometerstand");
    if (c.charging_power) voegToe(c.charging_power, "Laadvermogen");
    for (const id of Array.isArray(c.sensors) ? c.sensors : []) voegToe(id, null);

    vak.hidden = !uit.length;
    if (!uit.length) return;

    const sig = uit.map((t) => `${t.id}|${t.w}|${t.toon ?? ""}`).join(",");
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;
    vak.innerHTML = uit
      .map(
        (t) =>
          `<div class="tegel" data-id="${this.veilig_(t.id)}" role="button" tabindex="0"` +
          `${t.toon ? ` style="--tegeltoon:${TOON[t.toon] ?? TONES.neutral}"` : ""}>` +
          `<span class="w">${this.veilig_(t.w)}</span>` +
          `<span class="l">${this.veilig_(t.l)}</span></div>`
      )
      .join("");
  }

  veilig_(tekst) {
    const d = document.createElement("div");
    d.textContent = tekst ?? "";
    return d.innerHTML;
  }

  getCardSize() {
    return this.config?.photo_size === "groot" ? 5 : 3;
  }

  getGridOptions() {
    return {
      columns: 12,
      rows: "auto",
      min_columns: 6,
      min_rows: this.minRijen_(".card", 2),
    };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-auto-card-editor");
  }

  static getStubConfig(hass, entities) {
    const accu = entities?.find((e) => /^sensor\..*(battery|accu|soc)/i.test(e));
    return accu ? { battery: accu, drivetrain: "electric" } : { drivetrain: "electric" };
  }
}

class AutoEditor extends DacEditor {
  defaults() {
    return { icon: "car", drivetrain: "electric", photo_size: "klein" };
  }

  pickers() {
    return [
      // Onze eigen fotokiezer en niet `{ image: {} }` in het schema. Die
      // selector van Home Assistant wordt lui geladen en komt in onze editor
      // nooit: het veld blijft een leeg vak van nul pixels hoog. Gemeten op
      // 27 augustus 2026; zie de kop van foto-picker.js.
      { key: "image", kind: "foto", label: "Foto van de auto" },
      { key: "icon", kind: "icon", label: "Icoon (zonder foto)", fallback: "car" },
    ];
  }

  /**
   * Wat er te zien is hangt af van de aandrijving.
   *
   * Dat is wat "minimalistische GUI-editor" hier betekent: niet minder kunnen
   * invullen, maar niet alles tegelijk zien. Wie elektrisch kiest, krijgt geen
   * tankvelden -- en kan er dus ook geen half invullen die daarna stil niets
   * doen.
   */
  schema() {
    const soort = AANDRIJVING[this.config_?.drivetrain] ? this.config_.drivetrain : "electric";
    const velden = [
      { name: "name", selector: sel.text() },
      {
        name: "drivetrain",
        selector: sel.select(
          Object.entries(AANDRIJVING).map(([value, { label }]) => ({ value, label }))
        ),
      },
      {
        name: "photo_size",
        selector: sel.select([
          { value: "klein", label: "Klein, naast de naam" },
          { value: "groot", label: "Groot, over de hele breedte" },
        ]),
      },
      { name: "range", selector: sel.entity(["sensor", "number"]) },
    ];

    if (heeftAccu(soort)) {
      velden.push(
        { name: "battery", selector: sel.entity(["sensor", "number"]) },
        { name: "battery_max", selector: sel.number(1, 400, 1) },
        { name: "charging", selector: sel.entity(["sensor", "binary_sensor", "switch"]) },
        { name: "charging_ready", selector: sel.entity(["sensor"]) },
        { name: "charging_power", selector: sel.entity(["sensor"]) }
      );
    }
    if (heeftTank(soort)) {
      velden.push(
        { name: "fuel", selector: sel.entity(["sensor", "number"]) },
        { name: "fuel_max", selector: sel.number(1, 200, 1) }
      );
    }

    velden.push(
      { name: "lock", selector: sel.entity("lock") },
      { name: "doors", selector: sel.entity(["binary_sensor"]) },
      { name: "windows", selector: sel.entity(["binary_sensor"]) },
      { name: "climate", selector: sel.entity(["switch", "climate", "button"]) },
      { name: "location", selector: sel.entity(["device_tracker", "sensor", "person"]) },
      { name: "home_radius", selector: sel.number(10, 2000, 10) },
      { name: "odometer", selector: sel.entity(["sensor"]) },
      { name: "sensors", selector: { entity: { multiple: true } } }
    );
    return velden;
  }

  label(s) {
    return (
      {
        name: "Naam",
        drivetrain: "Aandrijving",
        image: "Foto van de auto",
        photo_size: "Hoe groot staat de foto",
        range: "Actieradius",
        battery: "Accupercentage",
        battery_max: "Accu-inhoud (kWh), als de sensor geen procenten geeft",
        charging: "Laadstatus",
        charging_ready: "Klaar met laden om / nog te gaan",
        charging_power: "Laadvermogen",
        fuel: "Tankniveau",
        fuel_max: "Tankinhoud (liter), als de sensor geen procenten geeft",
        lock: "Portierslot",
        doors: "Deuren open",
        windows: "Ramen open",
        climate: "Voorverwarmen of koelen",
        location: "Waar hij staat",
        home_radius: "Hoe dichtbij is thuis (meter)",
        odometer: "Kilometerstand",
        sensors: "Extra sensoren als tegel",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    const uitleg = {
      drivetrain:
        "Bepaalt welke balken er op de kaart komen — een accu, een tank, of allebei — en welke velden je hieronder ziet.",
      image:
        "Kies een bestand of sleep er een op. Home Assistant zet hem in zijn eigen media-opslag; je kunt ook een pad als /local/auto.png intypen.",
      range:
        "In de eenheid van de sensor zelf. De kaart rekent niets om: staat je Home Assistant op mijlen, dan zie je mijlen.",
      battery_max:
        "Alleen nodig als je accusensor in kWh meldt in plaats van in procenten. Dan rekent de kaart het percentage zelf uit.",
      fuel_max: "Alleen nodig als je tanksensor in liters meldt in plaats van in procenten.",
      charging_ready:
        "Een aantal minuten, een klok of het tijdstip waarop hij vol is — alle drie worden gelezen.",
      doors: "Staat er iets open, dan zegt de kaart dat en gaat al het andere even opzij.",
      location:
        "Een device_tracker die home of not_home meldt, of een sensor met een coordinaat — beide worden gelezen. Bij een coordinaat rekent de kaart de afstand tot de locatie van je Home Assistant uit en maakt daar Thuis of Afwezig van.",
      home_radius:
        "Alleen van belang bij een sensor met een coordinaat. Binnen deze afstand van je huis heet de auto thuis. Leeg laten is 100 meter — ruim genoeg voor een oprit of een parkeerplaats om de hoek.",
      sensors:
        "Alles wat je verder nog kwijt wilt: bandenspanning, buitentemperatuur, de volgende beurt. Ze komen als tegels onderaan te staan, met de naam uit Home Assistant.",
    };
    return uitleg[s.name];
  }
}

registerEditor("domotiapp-auto-card-editor", AutoEditor);
registerCard("domotiapp-auto-card", AutoCard, {
  name: "DomotiApp Auto",
  description:
    "Brandstof, hybride of elektrisch: accu- en tankbalk, actieradius, laadstatus, het slot en zoveel eigen sensoren als je kwijt wilt — met een foto van de auto erbij.",
});

export { AutoCard };
