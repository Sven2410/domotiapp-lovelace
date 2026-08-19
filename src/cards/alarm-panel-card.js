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
 * DE CODE
 *
 * Uitschakelen kan om een code vragen, inschakelen niet. Dat is de standaard, en
 * hij komt uit twee mogelijke bronnen -- de kaart kiest zelf welke:
 *
 * 1. **Het paneel zelf.** Meldt de entiteit `code_format`, dan heeft je
 *    alarmsysteem een eigen code (Alarmo, de manual-integratie, een systeem van
 *    een merk). De kaart toont het codepaneel en stuurt de ingetikte code mee
 *    met de service. Of er ook bij inschakelen een code nodig is, zegt het
 *    paneel met `code_arm_required` -- daar gaat deze kaart niet over.
 * 2. **DomotiApp zelf.** Heeft je paneel geen eigen code, dan kun je er een
 *    instellen bij de integratie (Configureren -> Alarmcode). Die staat gehasht
 *    aan de serverkant, en de kaart vraagt hem alleen bij uitschakelen.
 *
 * Wat er in geen van beide gevallen gebeurt: een code in de dashboardconfig.
 * Die zou met een rechterklik te lezen zijn, in elke backup staan en meegaan als
 * je het dashboard deelt.
 *
 * En wat het niet is: een slot op Home Assistant. Wie kan inloggen, kan
 * `alarm_control_panel.alarm_disarm` ook rechtstreeks aanroepen. Dit houdt tegen
 * dat iemand die langsloopt het alarm van de muur af uitzet.
 */

import { DacCard, registerCard, registerEditor, rowsFor, TONES, INCOMPLETE } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { bindActions, isDead, localizeState, moreInfo, nameOf, stateOf } from "../ha.js";
import { vraagCode } from "../codepad.js";
import {
  STANDEN,
  beschikbareStanden,
  codeSoort,
  heeftCodeNodig,
  standVan,
} from "./alarm-logica.js";

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
    .standen { display: grid; grid-template-columns: repeat(var(--n, 3), 1fr); gap: 6px; }
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
    return { code_arm: "paneel", ...config };
  }

  watched() {
    return [this.config.entity];
  }

  /** De standen die dit paneel aankan; zie `beschikbareStanden`. */
  standen_() {
    return beschikbareStanden(stateOf(this.hass, this.config.entity));
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
        <div class="standen" role="group" aria-label="Alarmstand"
             style="--n:${this.standen_().length}">
          ${this.standen_().map(
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

    // Eén luisteraar voor alle knoppen: dat scheelt een opruimactie per knop bij
    // elke aankoppeling, en de knoppen kunnen van samenstelling veranderen zodra
    // het paneel meer standen gaat melden.
    this.on(this.$(".standen"), "click", (e) => {
      const knop = e.target.closest("[data-stand]");
      if (!knop) return;
      e.stopPropagation();
      this.kies_(knop.dataset.stand);
    });
    this.on(this.$(".standen"), "pointerdown", (e) => e.stopPropagation());

    // Heeft DomotiApp zelf een code? Eén vraag per aankoppeling; het antwoord is
    // een enkele boolean en verandert alleen als een admin hem omzet.
    this.eigenCode_ = false;
    this.hass
      ?.callWS?.({ type: "domotiapp_lovelace/panel/code/status" })
      .then((antwoord) => {
        this.eigenCode_ = Boolean(antwoord?.has_code);
      })
      .catch(() => {
        // Oudere integratie of geen verbinding: dan is er geen eigen code, en
        // valt de kaart terug op wat het paneel zelf zegt.
        this.eigenCode_ = false;
      });
  }

  /**
   * Een stand gekozen: meteen doen, of eerst om de code vragen.
   *
   * De code gaat NOOIT als tekst het dashboard in. Bij een paneel met een eigen
   * code wordt hij doorgegeven aan de service; bij een code van DomotiApp gaat
   * hij naar de server om gecontroleerd te worden, en pas daarna volgt de
   * opdracht -- zonder code, want het paneel kent er geen.
   */
  kies_(sleutel) {
    const stand = standVan(sleutel);
    if (!stand) return;
    const st = stateOf(this.hass, this.config.entity);

    if (!heeftCodeNodig(st, sleutel, this.config.code_arm, this.eigenCode_)) {
      this.voerUit_(stand);
      return;
    }

    vraagCode({
      titel: nameOf(this.hass, this.config.entity, this.config.name),
      actie: sleutel === "disarmed" ? "Uitschakelen" : `Inschakelen — ${stand.label}`,
      soort: codeSoort(st) === "text" ? "text" : "number",
      onOk: (code) => this.metCode_(stand, code),
    });
  }

  /** Zonder code: gewoon de dienst aanroepen. */
  voerUit_(stand) {
    this.hass.callService("alarm_control_panel", stand.dienst, {
      entity_id: this.config.entity,
    });
  }

  /**
   * Met code. Geeft terug of het gelukt is, zodat het codepaneel het kan zeggen.
   *
   * Het lastige geval is een paneel dat een verkeerde code STIL weigert -- dat
   * doen er meer dan één: de service slaagt, en er gebeurt niets. Vandaar dat we
   * daarna kijken of de toestand ook echt verandert. Gebeurt dat niet binnen drie
   * seconden, dan is het antwoord "er is niets veranderd" en niet "gelukt".
   */
  async metCode_(stand, code) {
    const id = this.config.entity;
    const st = stateOf(this.hass, id);
    const vorige = st?.state;

    // Code van DomotiApp: eerst laten controleren aan de serverkant.
    if (!codeSoort(st)) {
      try {
        const antwoord = await this.hass.callWS({
          type: "domotiapp_lovelace/panel/code/verify",
          code,
        });
        if (!antwoord?.ok) return { ok: false, fout: "Die code klopt niet." };
      } catch (fout) {
        return {
          ok: false,
          fout: fout?.message ?? "De code kon niet gecontroleerd worden.",
        };
      }
      this.voerUit_(stand);
      return { ok: await this.veranderdeBinnen_(vorige, 3000) };
    }

    // Code van het paneel zelf: meesturen en het paneel laten oordelen.
    try {
      await this.hass.callService(
        "alarm_control_panel",
        stand.dienst,
        { code },
        { entity_id: id }
      );
    } catch (fout) {
      return { ok: false, fout: fout?.message ?? "Het paneel weigerde de opdracht." };
    }
    if (await this.veranderdeBinnen_(vorige, 3000)) return { ok: true };
    return { ok: false, fout: "Het paneel deed niets. Klopt de code?" };
  }

  /** Wacht tot de toestand verandert, of tot de tijd om is. */
  async veranderdeBinnen_(vorige, ms) {
    const stap = 150;
    for (let gewacht = 0; gewacht < ms; gewacht += stap) {
      await new Promise((r) => setTimeout(r, stap));
      if (stateOf(this.hass, this.config.entity)?.state !== vorige) return true;
    }
    return false;
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

    // De standen die het paneel kent, kunnen veranderen: Alarmo meldt een modus
    // pas zodra hij aanstaat voor dat gebied. Dan hoort de knop erbij te komen
    // in plaats van pas na een herlaadbeurt.
    const standen = this.standen_();
    const doos = this.$(".standen");
    const sig = standen.map((s) => s.sleutel).join(",");
    if (doos.dataset.sig !== sig) {
      doos.dataset.sig = sig;
      doos.style.setProperty("--n", String(standen.length));
      doos.innerHTML = standen
        .map(
          (s) => `<button class="stand" type="button" data-stand="${s.sleutel}"
            aria-pressed="false">${resolve(s.icoon)}<span>${s.label}</span></button>`
        )
        .join("");
    }

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

  defaults() {
    return { code_arm: "paneel" };
  }

  schema() {
    return [
      { name: "entity", selector: sel.entity("alarm_control_panel") },
      { name: "name", selector: sel.text() },
      {
        name: "code_arm",
        selector: sel.select([
          { value: "paneel", label: "Volg het paneel (meestal: alleen bij uitschakelen)" },
          { value: "altijd", label: "Altijd, ook bij inschakelen" },
          { value: "nooit", label: "Nooit bij inschakelen" },
        ]),
      },
    ];
  }

  label(s) {
    return (
      {
        entity: "Alarmpaneel",
        name: "Naam (overschrijft die van het paneel)",
        code_arm: "Code bij inschakelen",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "entity")
      return "De kaart toont alleen de standen die je paneel aankan: Uitgeschakeld, Afwezig en Thuis.";
    if (s.name === "code_arm")
      return "Uitschakelen vraagt altijd om de code, als er een is. De code stel je in bij de integratie (Configureren → Alarmcode), of hij komt uit je alarmsysteem zelf.";
    return undefined;
  }
}

registerEditor("domotiapp-alarm-panel-card-editor", AlarmPanelEditor);
registerCard("domotiapp-alarm-panel-card", AlarmPanelCard, {
  name: "DomotiApp Alarmpaneel",
  description: "Uitgeschakeld, Afwezig en Thuis — drie knoppen, meer niet.",
});
