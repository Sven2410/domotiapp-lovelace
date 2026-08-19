/**
 * Het alarmpaneel: drie standen, drie knoppen, en geen woord te veel.
 *
 * Uitgeschakeld, Afwezig, Thuis. Home Assistants eigen paneelkaart toont ook
 * nacht, kwetsbaar, aangepast en een toetsenblok, en dat is precies waarom die
 * kaart op een tablet in de gang niet werkt: je staat met je jas aan te zoeken
 * welke van de zes knoppen "weg" betekent.
 *
 * De knop van de huidige stand is ingedrukt en draagt kleur; de andere twee zijn
 * stil. Zo zie je van een meter afstand of het alarm aanstaat, zonder te lezen.
 *
 * ROOD EN GROEN MOGEN HIER, om dezelfde reden als op de rookmelderkaart: dit
 * ís status. Een alarm dat afgaat is kritiek en hoort er kritiek uit te zien.
 * De kleur komt nooit alleen -- er staat altijd een woord bij.
 *
 * GEEN CODE-VELD. Vraagt jouw paneel een pincode bij het in- of uitschakelen,
 * dan werkt deze kaart niet: hij stuurt de opdracht zonder code. Dat is een
 * bewuste beperking en geen omissie -- een pincode op een dashboardkaart is een
 * pincode die op tafel ligt.
 */

import { DacCard, registerCard, registerEditor, rowsFor, TONES, INCOMPLETE } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { bindActions, isDead, localizeState, moreInfo, nameOf, stateOf } from "../ha.js";

/**
 * De drie standen, met de dienst die erbij hoort.
 *
 * `alarm_arm_home` heet bij Home Assistant "home" en niet "stay"; wat de klant
 * leest is "Thuis", want zo zegt hij het zelf.
 */
const STANDEN = [
  { sleutel: "disarmed", label: "Uitgeschakeld", dienst: "alarm_disarm", icoon: "lockOpen" },
  { sleutel: "armed_away", label: "Afwezig", dienst: "alarm_arm_away", icoon: "away" },
  { sleutel: "armed_home", label: "Thuis", dienst: "alarm_arm_home", icoon: "house" },
];

/** Hoe elke toestand van het paneel eruitziet. */
const UITERLIJK = {
  disarmed: { tekst: "Uitgeschakeld", tone: TONES.neutral, icoon: "lockOpen" },
  armed_away: { tekst: "Ingeschakeld — afwezig", tone: TONES.good, icoon: "shield" },
  armed_home: { tekst: "Ingeschakeld — thuis", tone: TONES.good, icoon: "shield" },
  armed_night: { tekst: "Ingeschakeld — nacht", tone: TONES.good, icoon: "shield" },
  armed_vacation: { tekst: "Ingeschakeld — vakantie", tone: TONES.good, icoon: "shield" },
  armed_custom_bypass: { tekst: "Ingeschakeld — aangepast", tone: TONES.good, icoon: "shield" },
  arming: { tekst: "Inschakelen…", tone: TONES.warn, icoon: "shield" },
  pending: { tekst: "Aftellen…", tone: TONES.warn, icoon: "clock" },
  triggered: { tekst: "ALARM", tone: TONES.bad, icoon: "warning" },
};

class AlarmPanelCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

    .top { display: flex; align-items: center; gap: 11px; min-height: 40px; cursor: pointer; }
    .chip { width: 40px; height: 40px; }
    .chip .icon { width: 20px; height: 20px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st { font-size: 11.5px; line-height: 1.25; color: var(--tone); font-weight: 600; }

    /* Afgegaan alarm: de chip pulseert. Stil bij prefers-reduced-motion; de
       kleur en het woord ALARM blijven staan. */
    :host([af]) .chip { animation: pols 1.2s ease-in-out infinite; }
    @keyframes pols {
      0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--tone) 60%, transparent); }
      50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--tone) 0%, transparent); }
    }

    /* ---- de drie knoppen ---- */
    .standen { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .stand {
      display: flex; align-items: center; justify-content: center; gap: 7px;
      min-height: 38px; padding: 0 8px; cursor: pointer; font: inherit; font-size: 12.5px;
      border-radius: var(--dac-radius-sm);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      color: var(--dac-ink-2);
      transition: background 200ms ease, color 200ms ease, border-color 200ms ease;
    }
    .stand:hover { background: var(--dac-surface-hi); color: var(--dac-ink); }
    .stand:active { transform: scale(.985); }
    .stand .icon { width: 16px; height: 16px; flex: 0 0 auto; }
    .stand[aria-pressed="true"] {
      color: var(--tone); font-weight: 600;
      background: color-mix(in srgb, var(--tone) 16%, transparent);
      border-color: color-mix(in srgb, var(--tone) 40%, transparent);
    }
    /* Onder de 300px passen drie woorden niet meer naast elkaar; dan blijven de
       iconen staan en verdwijnt de tekst van de niet-actieve knoppen niet --
       hij wordt kleiner. Verdwijnen zou raden worden. */
    @container (max-width: 300px) {
      .stand { flex-direction: column; gap: 2px; font-size: 10.5px; padding: 4px; }
    }

    .top.unavailable, .standen.unavailable { opacity: .42; }
    .standen.unavailable { pointer-events: none; }
  `;

  validate(config) {
    if (!config.entity) {
      return { ...config, [INCOMPLETE]: "Kies een alarmpaneel." };
    }
    return { ...config };
  }

  watched() {
    return [this.config.entity];
  }

  uiterlijk_() {
    const st = stateOf(this.hass, this.config.entity);
    if (!st || st.state === "unavailable") {
      return { tekst: "Niet bereikbaar", tone: TONES.neutral, icoon: "shield" };
    }
    return (
      UITERLIJK[st.state] ?? {
        tekst: localizeState(this.hass, st),
        tone: TONES.accent,
        icoon: "shield",
      }
    );
  }

  template() {
    if (this.config.bare) this.setAttribute("bare", "");
    this.style.containerType = "inline-size";
    return `
      <div class="card surface">
        <div class="top" role="button" tabindex="0" style="--tone:${TONES.neutral}">
          <span class="chip"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
        </div>
        <div class="standen" role="group" aria-label="Alarmstand">
          ${STANDEN.map(
            (s) => `<button class="stand" type="button" data-stand="${s.sleutel}"
              aria-pressed="false">${resolve(s.icoon)}<span>${s.label}</span></button>`
          ).join("")}
        </div>
      </div>`;
  }

  wire() {
    this.teardown_.push(
      bindActions(this.$(".top"), {
        onTap: () => moreInfo(this, this.config.entity),
        onHold: () => moreInfo(this, this.config.entity),
      })
    );

    // Eén luisteraar voor de drie knoppen: ze veranderen niet van samenstelling,
    // maar dit scheelt drie opruimacties bij elke aankoppeling.
    this.on(this.$(".standen"), "click", (e) => {
      const knop = e.target.closest("[data-stand]");
      if (!knop) return;
      e.stopPropagation();
      const stand = STANDEN.find((s) => s.sleutel === knop.dataset.stand);
      if (!stand) return;
      this.hass.callService("alarm_control_panel", stand.dienst, {
        entity_id: this.config.entity,
      });
    });
    this.on(this.$(".standen"), "pointerdown", (e) => e.stopPropagation());
  }

  paint() {
    const c = this.config;
    const st = stateOf(this.hass, c.entity);
    const dood = isDead(st) && st?.state !== "unknown";
    const nu = this.uiterlijk_();

    const top = this.$(".top");
    top.style.setProperty("--tone", nu.tone);
    this.$(".standen").style.setProperty("--tone", nu.tone);
    top.classList.toggle("unavailable", dood);
    this.$(".standen").classList.toggle("unavailable", dood);
    this.toggleAttribute("af", st?.state === "triggered");

    const chip = this.$(".chip");
    const wens = c.icon || nu.icoon;
    if (chip.dataset.icon !== wens) {
      chip.dataset.icon = wens;
      chip.innerHTML = resolve(wens, "shield");
    }
    chip.style.setProperty("--tone", nu.tone);

    this.text(".nm", nameOf(this.hass, c.entity, c.name));
    this.text(".st", nu.tekst);
    top.setAttribute("aria-label", `${this.$(".nm").textContent}, ${nu.tekst}`);

    // Welke knop staat ingedrukt? Tijdens het inschakelen is dat de stand waar
    // het paneel naartoe gaat, en die weet alleen het paneel zelf niet -- dan
    // staat er geen enkele ingedrukt, en dat klopt: hij is nog niet aan.
    for (const knop of this.$$(".stand")) {
      knop.setAttribute("aria-pressed", String(knop.dataset.stand === st?.state));
    }
  }

  getCardSize() {
    return 2;
  }

  getGridOptions() {
    const rijen = rowsFor(14 + 40 + 8 + 38);
    return { columns: 12, rows: rijen, min_columns: 4, min_rows: rijen, max_rows: rijen };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-alarm-panel-card-editor");
  }

  static getStubConfig(hass, entities) {
    const paneel = entities?.find((e) => e.startsWith("alarm_control_panel."));
    return paneel ? { entity: paneel } : {};
  }
}

class AlarmPanelEditor extends DacEditor {
  pickers() {
    return [{ key: "icon", kind: "icon", label: "Icoon", fallback: "shield" }];
  }

  schema() {
    return [
      { name: "entity", selector: sel.entity("alarm_control_panel") },
      { name: "name", selector: sel.text() },
    ];
  }

  label(s) {
    return (
      { entity: "Alarmpaneel", name: "Naam (overschrijft die van het paneel)" }[s.name] ??
      super.label(s)
    );
  }

  helper(s) {
    if (s.name === "entity")
      return "Drie knoppen: Uitgeschakeld, Afwezig en Thuis. Vraagt je paneel een pincode, dan werkt deze kaart niet — hij stuurt geen code mee.";
    return undefined;
  }
}

registerEditor("domotiapp-alarm-panel-card-editor", AlarmPanelEditor);
registerCard("domotiapp-alarm-panel-card", AlarmPanelCard, {
  name: "DomotiApp Alarmpaneel",
  description: "Uitgeschakeld, Afwezig en Thuis — drie knoppen, meer niet.",
});
