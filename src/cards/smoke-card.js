/**
 * De rookmelder: één regel die zegt of het goed is, en de metingen eronder.
 *
 * Een rookmelder is 364 dagen per jaar saai, en dat is precies de eis. De kaart
 * moet in één oogopslag "rustig" zeggen, en op de ene dag dat het misgaat moet
 * er geen twijfel zijn. Vandaar dat de kop de toestand draagt en niet een
 * getal: temperatuur en batterij zijn ondersteunend, geen nieuws.
 *
 * ALLE ENTITEITEN ZIJN OPTIONEEL
 *
 * Rook, koolmonoxide, warmte, temperatuur en batterij: vul in wat je melder
 * heeft. Een Zigbee-melder van veertig euro meldt rook en batterij; een
 * bekabelde meldt daarnaast warmte en CO. De kaart toont wat er is en verzint
 * niets bij -- een lege regel "Koolmonoxide: onbekend" is erger dan geen regel.
 *
 * ROOD EN GROEN MOGEN HIER WEL
 *
 * In de rest van de familie zijn die kleuren gereserveerd voor status en dus
 * verboden als identiteit. Dit ís status: rook is kritiek, rustig is goed. Dat
 * is de uitzondering waar de regel voor bedoeld is. Ze komen nooit alleen: er
 * staat altijd een icoon en een woord bij, want kleur alleen is voor wie hem
 * ziet.
 */

import { DacCard, registerCard, registerEditor, TONES, INCOMPLETE } from "../base.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import {
  bindActions,
  fmtNumber,
  isDead,
  isOn,
  localizeState,
  moreInfo,
  nameOf,
  runAction,
  stateOf,
} from "../ha.js";
import {
  BATTERIJ_LAAG,
  SOORTEN,
  batterijPct,
  rustWoord,
  toestand,
} from "./smoke-logica.js";

/** Van een kleurnaam uit de logica naar de token van het thema. */
const TOON = {
  good: TONES.good,
  warn: TONES.warn,
  bad: TONES.bad,
  neutral: TONES.neutral,
  accent: TONES.accent,
};

class SmokeCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .top { display: flex; align-items: center; gap: 11px; min-height: 40px; cursor: pointer; }
    .chip { width: 40px; height: 40px; }
    .chip .icon { width: 20px; height: 20px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st { font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2); }
    /* Bij alarm draagt de tekst de kleur mee: wie de chip niet ziet, leest hem. */
    :host([alarm]) .st { color: var(--tone); font-weight: 600; }

    /* Een alarm hoort te bewegen. Niet fel -- de kaart moet opvallen, niet
       knipperen als een kermis. Wie bewegingen uit heeft staan (prefers-reduced-
       motion) krijgt hem stil; de kleur en het woord blijven. */
    :host([alarm]) .chip { animation: pols 1.6s ease-in-out infinite; }
    @keyframes pols {
      0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--tone) 55%, transparent); }
      50% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--tone) 0%, transparent); }
    }

    /* ---- de metingen ----
       Eén regel, en die SCHUIFT NIET. Dat deed hij wel, met een vervaging aan
       de rechterkant om te laten zien dat er meer stond -- en dat is precies de
       verkeerde afspraak voor een kaart die bij een klant op de muur hangt: wie
       niet wéét dat je kunt vegen, ziet gegevens die er niet zijn. Gemeld door
       de eigenaar op 26 augustus 2026: "ik wil niet kunnen scrollen want
       klanten weten dan niet of er iets verborgen zit."

       Wat er in de plaats komt zijn twee dingen samen. De kaart MEET hoeveel
       regels de pillen nodig hebben (pasAan_) en kleedt ze uit tot ze op een
       regel passen: eerst het omhulsel van de pil -- de rand, het vlak en de
       binnenmarge -- en als dat niet genoeg is ook de tussenruimte en een halve
       punt van de letter. Past het dan nog niet, dan BREEKT de rij af en GROEIT
       de kaart mee (rows: auto, zie getGridOptions). Dat laatste is de reden
       dat er niets meer verborgen kan raken: er is geen vaste hoogte meer
       waarin het moet passen.

       De gegevens zelf blijven dus altijd staan; alleen de decoratie eromheen
       gaat weg, en anders wordt de kaart een rasterrij hoger.

       De labels ("Rook", "Temperatuur", "Batterij") zijn er helemaal af. Het
       icoon zegt hetzelfde in een zesde van de breedte, en de kaart heeft die
       breedte hard nodig -- hij claimt twee vaste rasterrijen, dus afbreken
       naar een derde regel kan niet. De woorden staan nog wel in het
       title-attribuut en in aria-label, dus een schermlezer en een muis
       vinden ze terug. */
    .meta {
      display: flex; flex-wrap: wrap; gap: 6px;
      overflow: hidden;
    }
    .meta[hidden] { display: none; }
    .pil {
      flex: 0 0 auto;
      display: flex; align-items: center; gap: 7px; padding: 5px 11px 5px 8px;
      border-radius: var(--dac-radius-pill);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      font-size: 11.5px; color: var(--dac-ink-2);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .pil .icon { width: 14px; height: 14px; color: var(--dac-ink-3); flex: 0 0 auto; }
    .pil b { font-weight: 600; color: var(--dac-ink); }
    /* Een pil die zelf iets te melden heeft -- een lege batterij, een melder die
       aanslaat -- kleurt mee. De rest blijft stil. */
    .pil[data-let="warn"] { color: var(--dac-warn); border-color: color-mix(in srgb, var(--dac-warn) 40%, transparent); }
    .pil[data-let="warn"] .icon, .pil[data-let="warn"] b { color: var(--dac-warn); }
    .pil[data-let="bad"] { color: var(--dac-bad); border-color: color-mix(in srgb, var(--dac-bad) 45%, transparent); }
    .pil[data-let="bad"] .icon, .pil[data-let="bad"] b { color: var(--dac-bad); }

    .top.unavailable { opacity: .42; }

    /* ---- twee stappen uitkleden ----
       Gemeten en niet geraden. Een @container-regel op een vaste breedte kan
       dit niet: of de rij past hangt af van HOEVEEL metingen er staan (een
       melder met alleen rook en batterij past ruim waar een met vijf sensoren
       klem zit) en van hoe breed de waarden zijn -- "100 %" is breder dan
       "5 %". Daarom meet pasAan_ de echte rij en zet deze twee standen. */
    :host([krap]) .meta { gap: 13px; }
    :host([krap]) .pil {
      padding: 0; gap: 5px;
      background: none; border-color: transparent;
    }
    :host([krap]) .pil[data-let="warn"],
    :host([krap]) .pil[data-let="bad"] { border-color: transparent; }

    :host([krapper]) .meta { gap: 9px; }
    :host([krapper]) .pil { font-size: 11px; gap: 4px; }
    :host([krapper]) .pil .icon { width: 13px; height: 13px; }
  `;

  validate(config) {
    const gekozen = SOORTEN.filter((s) => config[s.sleutel]);
    if (!gekozen.length) {
      return {
        ...config,
        [INCOMPLETE]: "Kies minstens één entiteit: rook, koolmonoxide, warmte, temperatuur of batterij.",
      };
    }
    return { ...config };
  }

  watched() {
    return SOORTEN.map((s) => this.config[s.sleutel]).filter(Boolean);
  }

  /** De soorten die deze kaart daadwerkelijk toont. */
  gekozen_() {
    return SOORTEN.filter((s) => this.config[s.sleutel]);
  }

  /**
   * Wat er nu aan de hand is.
   *
   * De rangorde -- alarm boven onbereikbaar, onbereikbaar boven een lege
   * batterij -- staat in `smoke-logica.js` en heeft daar zijn eigen tests.
   */
  toestand_() {
    const nu = toestand(this.gekozen_(), (sleutel) =>
      stateOf(this.hass, this.config[sleutel])
    );
    return { ...nu, tone: TOON[nu.tone] ?? TONES.accent };
  }

  /** De batterijstand als getal, of null. */
  batterijPct_() {
    return batterijPct(stateOf(this.hass, this.config.battery));
  }

  template() {
    if (this.config.bare) this.setAttribute("bare", "");
    const pillen = this.gekozen_()
      .map(
        (s) => `<span class="pil" data-soort="${s.sleutel}" title="${s.label}">${resolve(s.icoon)}<b></b></span>`
      )
      .join("");
    return `
      <div class="card surface">
        <div class="top" role="button" tabindex="0" style="--tone:${TONES.good}">
          <span class="chip"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
        </div>
        <div class="meta">${pillen}</div>
      </div>`;
  }

  wire() {
    const c = this.config;
    // Tikken opent de melder die het meest te zeggen heeft: de rookmelder als
    // die er is, anders de eerste die ingevuld staat.
    const eerste = this.gekozen_()[0];
    this.teardown_.push(
      bindActions(this.$(".top"), {
        onTap: () =>
          c.tap_action
            ? runAction(this, this.hass, c, c.tap_action)
            : moreInfo(this, c.smoke ?? c[eerste.sleutel]),
        onHold: () => runAction(this, this.hass, c, c.hold_action ?? { action: "more-info" }),
      })
    );

    this.$$(".pil").forEach((pil) => {
      const id = c[pil.dataset.soort];
      if (!id) return;
      this.on(pil, "click", (e) => {
        e.stopPropagation();
        moreInfo(this, id);
      });
      this.on(pil, "pointerdown", (e) => e.stopPropagation());
      pil.style.cursor = "pointer";
    });

    // De rij past of past niet afhankelijk van de BREEDTE van de kaart, en die
    // verandert zonder dat er een waarde verandert: een venster dat smaller
    // wordt, een sectie die van twee kolommen naar een gaat. `paint()` draait
    // dan niet. Waargenomen wordt `.card` en niet `.meta`: `pasAan_()`
    // verandert de breedte van `.meta` zelf, en dan meldt de waarnemer zijn
    // eigen werk terug.
    const kaart = this.$(".card");
    if (kaart && typeof ResizeObserver === "function") {
      const waarnemer = new ResizeObserver(() => this.pasAan_());
      waarnemer.observe(kaart);
      this.teardown_.push(() => waarnemer.disconnect());
    }
    this.teardown_.push(volgRaster(this.$(".card")));
  }

  paint() {
    const c = this.config;
    const nu = this.toestand_();
    const top = this.$(".top");

    this.toggleAttribute("alarm", nu.soort === "alarm");
    top.style.setProperty("--tone", nu.tone);
    top.classList.toggle("unavailable", nu.soort === "weg");

    const chip = this.$(".chip");
    const wens = c.icon || nu.icoon;
    if (chip.dataset.icon !== wens) {
      chip.dataset.icon = wens;
      chip.innerHTML = resolve(wens, "smoke");
    }
    chip.style.setProperty("--tone", nu.tone);

    const eerste = this.gekozen_()[0];
    this.text(".nm", c.name || nameOf(this.hass, c.smoke ?? c[eerste.sleutel], null));
    this.text(".st", nu.tekst);
    top.setAttribute("aria-label", `${this.$(".nm").textContent}${nu.tekst ? `, ${nu.tekst}` : ""}`);

    this.$$(".pil").forEach((pil) => this.paintPil_(pil));
    this.$(".meta").hidden = this.gekozen_().length <= 1 && !this.config.always_meta;
    this.pasAan_();
    meetRaster(this.$(".card"));
  }

  /**
   * Kleedt de metingenrij net zover uit tot hij op een regel past.
   *
   * Twee standen, in deze volgorde: eerst het omhulsel van de pillen weg
   * (`krap`), dan de tussenruimte en een halve punt van de letter (`krapper`).
   * Daarna houdt het op -- verder uitkleden zou de waarden zelf raken, en die
   * horen te blijven staan. Wat er dan nog niet past breekt af naar een
   * volgende regel, en de kaart wordt een rasterrij hoger.
   *
   * WAAROM ER NA ELKE STAP OPNIEUW GEMETEN WORDT
   *
   * Elke stand verandert de breedte van de pillen, dus na het zetten van een
   * stand zegt de vorige meting niets meer. Er wordt daarom teruggerekend vanaf
   * de ruimste stand: uitkleden, meten, verder uitkleden. Andersom -- meten en
   * dan een stand kiezen -- meet je de rij zoals hij ER NU UITZIET en niet
   * zoals hij eruit zou zien.
   *
   * Gemeten wordt het AANTAL REGELS en niet de overloop: de rij mag afbreken,
   * dus hij loopt nooit over. De hoogte van de eerste pil is de maat van een
   * regel; staat er nog niets, dan valt er ook niets aan te passen.
   */
  pasAan_() {
    const meta = this.$(".meta");
    if (!meta || meta.hidden) return;

    const regels = () => {
      const pil = meta.querySelector(".pil");
      const hoog = pil?.offsetHeight ?? 0;
      if (!hoog) return 1;
      // Halve regel marge: subpixels mogen geen tweede regel verzinnen.
      return Math.round((meta.scrollHeight + hoog / 2) / hoog - 0.5) || 1;
    };

    this.removeAttribute("krap");
    this.removeAttribute("krapper");
    if (regels() <= 1) return;

    this.setAttribute("krap", "");
    if (regels() <= 1) return;

    this.setAttribute("krapper", "");
  }

  paintPil_(pil) {
    const soort = SOORTEN.find((s) => s.sleutel === pil.dataset.soort);
    const st = stateOf(this.hass, this.config[soort.sleutel]);
    const waarde = pil.querySelector("b");

    // Het label staat niet meer op de kaart, dus het moet ergens anders te
    // vinden zijn: een muis krijgt het via `title` (gezet in template()), een
    // schermlezer via aria-label -- en die moet de WAARDE meelezen, anders
    // hoort iemand "temperatuur" zonder te horen hoeveel.
    const zeg = (tekst) => pil.setAttribute("aria-label", `${soort.label}: ${tekst}`);

    if (!st || isDead(st)) {
      waarde.textContent = "—";
      zeg("onbekend");
      pil.dataset.let = "";
      return;
    }

    if (soort.meting) {
      const eenheid = st.attributes.unit_of_measurement ?? "";
      const n = Number(st.state);
      waarde.textContent = Number.isFinite(n)
        ? `${fmtNumber(this.hass, n, soort.sleutel === "temperature" ? 1 : 0)} ${eenheid}`.trim()
        : localizeState(this.hass, st);
      // Alleen de batterij heeft een grens die iets betekent. Een temperatuur
      // van 24 graden is geen nieuws; die kleurt dus niet.
      const pct = soort.sleutel === "battery" ? this.batterijPct_() : null;
      pil.dataset.let = pct != null && pct <= BATTERIJ_LAAG ? "warn" : "";
      zeg(waarde.textContent);
      return;
    }

    const aan = isOn(st);
    waarde.textContent = aan ? "Alarm" : rustWoord(soort);
    zeg(waarde.textContent);
    pil.dataset.let = aan ? "bad" : "";
  }

  regels_() {
    return this.gekozen_().length > 1 ? 2 : 1;
  }

  getCardSize() {
    return this.regels_();
  }

  /**
   * `rows: "auto"` en een GEMETEN ondergrens, en geen vast getal meer.
   *
   * Tot 26 augustus 2026 stond hier een vaste hoogte van twee rasterrijen. Dat
   * werkte zolang de metingen op een regel pasten, en dwong daarmee de rij om
   * te schuiven zodra dat niet zo was -- want in een vak dat niet meegroeit
   * moet het overschot ergens heen. Nu groeit het vak mee, en dan kan de rij
   * gewoon afbreken. Zie valkuil 8 en 12 in CLAUDE.md voor waarom dat "auto"
   * met een gemeten `min_rows` moet zijn en niet een groter vast getal.
   */
  getGridOptions() {
    return {
      columns: 12,
      rows: "auto",
      min_columns: 4,
      min_rows: this.minRijen_(".card", this.regels_()),
    };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-smoke-card-editor");
  }

  static getStubConfig(hass, entities) {
    const rook = entities?.find(
      (e) => e.startsWith("binary_sensor.") && /rook|smoke/i.test(e)
    );
    return rook ? { smoke: rook } : {};
  }
}

class SmokeEditor extends DacEditor {
  pickers() {
    return [
      { key: "icon", kind: "icon", label: "Icoon", fallback: "smoke" },
    ];
  }

  schema() {
    return [
      { name: "name", selector: sel.text() },
      { name: "smoke", selector: sel.entity() },
      { name: "co", selector: sel.entity() },
      { name: "heat", selector: sel.entity() },
      { name: "temperature", selector: sel.entity() },
      { name: "battery", selector: sel.entity() },
      { name: "tap_action", selector: sel.action("more-info") },
      { name: "hold_action", selector: sel.action("more-info") },
    ];
  }

  label(s) {
    return (
      {
        name: "Naam (overschrijft die van de melder)",
        smoke: "Rook",
        co: "Koolmonoxide",
        heat: "Warmte",
        temperature: "Temperatuur",
        battery: "Batterij",
        tap_action: "Tikken op de kaart",
        hold_action: "Vasthouden op de kaart",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "smoke")
      return "Alle vijf zijn optioneel: vul in wat je melder heeft. Wat je leeg laat, komt niet op de kaart.";
    if (s.name === "battery")
      return "Een percentage of een 'batterij bijna leeg'-sensor. Onder de 20% meldt de kaart het uit zichzelf.";
    return undefined;
  }
}

registerEditor("domotiapp-smoke-card-editor", SmokeEditor);
registerCard("domotiapp-smoke-card", SmokeCard, {
  name: "DomotiApp Rookmelder",
  description: "Rook, koolmonoxide, warmte, temperatuur en batterij — alles optioneel.",
});
