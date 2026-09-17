/**
 * De DomotiApp-badge: een pil in de kop van de view, met Jinja erin.
 *
 * ## Waar hij vandaan komt
 *
 * De eigenaar bouwde de kop van zijn dashboard met `custom:mushroom-template-badge`
 * -- acht stuks: alarm, vaatwasser, rookmelders, 3D-printer, verbruik, wifi,
 * lampen aan, instellingen. Op 17 september 2026 vroeg hij om een eigen badge,
 * met als reden: *"ik wil helemaal weg van custom cards van derden, puur mijn
 * eigen kaart."* Dat is dezelfde beweging als bij de kaarten: één pakket, één
 * vormtaal, en geen tweede HACS-afhankelijkheid die bij een HA-versie kan
 * omvallen.
 *
 * ## Waarom dit één badge is en geen acht
 *
 * Zijn acht badges verschillen alleen in welk sjabloon er in `icon` en `content`
 * staat. Een alarm-badge, een printer-badge en een vaatwasser-badge bouwen zou
 * drie keer dezelfde badge zijn met drie keer een andere `if`-boom erin -- en de
 * negende die hij morgen bedenkt zou er weer niet bij zitten. Eén badge die
 * Jinja aankan, dekt ze allemaal, en zijn bestaande YAML is er letterlijk in
 * over te nemen: alleen de regel `type:` verandert.
 *
 * ## Het rekenwerk staat aan de serverkant
 *
 * `states()`, `is_state()` en de filters zijn Python. Wij sturen het sjabloon
 * naar Home Assistant en krijgen een abonnement terug dat vanzelf een nieuwe
 * waarde stuurt zodra er iets verandert waar het sjabloon van afhangt. Zie
 * `src/sjabloon.js` voor het gemeten contract en voor de val die daar NIET in
 * gemaakt is (valkuil 42).
 *
 * ## De vorm
 *
 * Gemeten tegen HA 2026.8.1: een eigen badge is 36 px hoog met een ronding van
 * 18 px, 12 px binnenmarge en 8 px tussen icoon en tekst. Die maten staan
 * hieronder omdat een badge van ons náást een badge van Home Assistant staat --
 * in dezelfde rij, in dezelfde kop. Een badge die twee pixels hoger is, is een
 * badge die uit de rij loopt.
 *
 * **En de achtergrond moet er helemaal af kunnen.** Dat was zijn tweede eis:
 * *"waar ik ook de achtergrond helemaal weg kan halen en geen omranding etc."*
 * Op zijn dashboard staan de badges zonder vlak, als een rij iconen met tekst.
 * Dat deed hij tot nu toe met een `card_mod`-blok per badge; hier is het het
 * vinkje **Achtergrond weglaten** dat elke kaart in deze familie al heeft. Er
 * gaat dan méér weg dan bij een kaart: niet alleen de vulling en de schaduw maar
 * ook de rand en de binnenmarge, want een pil zonder vulling met wél een rand is
 * geen van beide.
 */

import { DacCard, registerBadge, registerEditor, toneValue } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { bindActions, defaultTapAction, isOn, lightTone, runAction, stateOf } from "../ha.js";
import { SjabloonSet, isSjabloon } from "../sjabloon.js";
import { heeftAanUit, icoonBron, kleurnaam } from "./badge-logica.js";

const BADGE_TYPE = "domotiapp-template-badge";
const EDITOR_TYPE = "domotiapp-template-badge-editor";

/**
 * De velden die een sjabloon mogen zijn.
 *
 * `label` en `content` staan erbij omdat de eigenaar er rekenwerk in zet
 * (`{{ states('sensor.slimme_meter') | float | round(0) }} W`), en `tone` omdat
 * een rookmelder die rook ziet rood hoort te zijn -- zie de opmerking bij de
 * kleur hieronder.
 */
const SJABLOONVELDEN = ["icon", "content", "label", "tone"];

class DomotiappTemplateBadge extends DacCard {
  static css = /* css */ `
    :host { display: block; }

    /* De maten van Home Assistants eigen badge, nagemeten op 2026.8.1:
       36 px hoog, 18 px rond, 0 12px binnenmarge, 8 px ertussen. Een badge van
       ons staat in dezelfde rij als een van hem, dus deze getallen zijn geen
       smaak. */
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      height: 36px; padding: 0 12px;
      border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      box-shadow: var(--dac-shadow);
      cursor: pointer; font: inherit; color: inherit;
      max-width: 100%;
      /* LINKS, en dat moet er expliciet staan.
         Dit is een <button>, en de useragent-stijl van Chrome geeft die
         text-align: center. De onderste regel is meestal de breedste en valt
         daardoor niet op, maar de bovenste is kort en stond dus gecentreerd --
         wat er op een dashboard uitziet als rechts uitgelijnd. Gemeld op
         17 september 2026 met een schermafdruk: "de bovenste titel moet links
         uitgelijnd worden. Nu is dat rechts uitgelijnd."

         Waarom het een <button> BLIJFT (valkuil 43 zegt div role=button): die
         valkuil gaat over -webkit-line-clamp en hoogte in een button, en dat
         staat hier niet. Wat een echte button wél geeft en een div niet, is dat
         Enter en spatie hem bedienen. Dat is meer waard dan het vermijden van
         deze ene regel. */
      text-align: left;
      transition: background 200ms ease, border-color 200ms ease, transform 160ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) {
      .badge:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); }
    }
    .badge:active { transform: scale(.97); }
    /* Zonder actie is het geen knop en hoort hij er ook niet als een te voelen. */
    :host([stil]) .badge { cursor: default; }
    @media (hover: hover) { :host([stil]) .badge:hover { background: var(--dac-surface); border-color: var(--dac-border); } }
    :host([stil]) .badge:active { transform: none; }

    /* Achtergrond weglaten: hier gaat ook de RAND en de BINNENMARGE weg.
       Een pil zonder vulling met wel een rand is geen pil en geen tekst; en met
       binnenmarge zonder vlak staan twee badges naast elkaar 24 px uit elkaar
       zonder dat er iets tussen staat. Dit is dus bewust meer dan wat de
       schakelaar "achtergrond weglaten" op een kaart doet -- zie de kop van
       dit bestand. */
    :host([bare]) .badge {
      background: none; border-color: transparent; box-shadow: none;
      padding: 0; height: auto; min-height: 30px;
    }
    @media (hover: hover) {
      :host([bare]) .badge:hover { background: none; border-color: transparent; }
      :host([bare]) .badge:hover .ico { color: var(--tone); }
    }

    .ico {
      flex: 0 0 auto; display: flex; color: var(--tone);
      transition: color 200ms ease;
    }
    .ico .icon, .ico ha-icon {
      width: 18px; height: 18px; --mdc-icon-size: 18px;
    }
    .ico:empty { display: none; }

    /* Een afbeelding in plaats van een icoon -- een pasfoto, een logo. Rond,
       want in een pil is een vierkantje een hoek te veel. */
    .ico img {
      width: 22px; height: 22px; border-radius: 50%; object-fit: cover; display: block;
    }

    .info {
      min-width: 0; display: flex; flex-direction: column; justify-content: center;
      line-height: 1.15;
    }
    .info:empty { display: none; }

    /* Het label is de kop en de content de waarde. Dat is de volgorde waarin de
       eigenaar ze gebruikt -- "Alarm" boven "Uitgeschakeld" -- en het is ook de
       volgorde die Home Assistants eigen badge aanhoudt. */
    .label {
      font-size: 10.5px; font-weight: 500; letter-spacing: .01em;
      color: var(--dac-ink-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .label:empty { display: none; }

    .content {
      font-size: 13px; font-weight: 600; letter-spacing: -.01em;
      color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      font-variant-numeric: tabular-nums;
    }
    .content:empty { display: none; }

    /* Staat er maar één regel, dan mag die de maat van de badge dragen in
       plaats van klein bovenin te blijven hangen. */
    :host([regels="1"]) .label { font-size: 13px; font-weight: 600; color: var(--dac-ink); }

    /* Een kapot sjabloon zegt wat er mis is in plaats van leeg te blijven. In
       de editor typ je halverwege elke zin iets ongeldigs, dus het is geen
       alarm -- alleen een aanwijzing, in de kleur die "kritiek" betekent. */
    :host([fout]) .badge { border-color: color-mix(in srgb, var(--dac-bad) 55%, transparent); }
    :host([fout]) .ico { color: var(--dac-bad); }
    :host([fout]) .content { color: var(--dac-bad); font-weight: 500; }

    .badge:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `;

  validate(config) {
    // Een badge zonder entiteit is geldig: zijn "Thuis / Instellingen"-badge
    // wijst nergens heen en is alleen een knop. Vandaar geen INCOMPLETE hier --
    // er is niets dat ontbreekt.
    return { ...config };
  }

  /**
   * Waar deze badge op let.
   *
   * Alleen de eigen entiteit. Alles wat in een sjabloon staat wordt door Home
   * Assistant zelf gevolgd (zie sjabloon.js), dus die entiteiten hoeven hier
   * niet bij -- ze zouden de badge twee keer laten tekenen bij elke wijziging.
   */
  watched() {
    return this.config?.entity ? [this.config.entity] : [];
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    const heeftActie = (c.tap_action?.action ?? "standaard") !== "none";
    if (!heeftActie) this.setAttribute("stil", "");

    return `
      <button class="badge" type="button">
        <span class="ico"></span>
        <span class="info">
          <span class="label"></span>
          <span class="content"></span>
        </span>
      </button>`;
  }

  wire() {
    this.sjablonen_ = new SjabloonSet(() => this.paint());
    this.teardown_.push(() => this.sjablonen_.stop());

    const knop = this.$(".badge");
    this.teardown_.push(
      bindActions(knop, {
        onTap: () => this.doe_("tap_action"),
        onHold: () => this.doe_("hold_action"),
        onDouble: () => this.doe_("double_tap_action"),
      }),
    );
  }

  /**
   * Voer de ingestelde actie uit.
   *
   * Zonder `tap_action` doet een badge met een entiteit wat die entiteit
   * normaal doet (meer-info voor een sensor, schakelen voor een lamp), en een
   * badge zonder entiteit doet niets. Dat laatste is met opzet: zijn
   * "Lampen aan"-badge staat er alleen om te tellen.
   */
  doe_(sleutel) {
    const c = this.config;
    const actie =
      c[sleutel] ??
      (sleutel === "tap_action" && c.entity ? defaultTapAction(c.entity) : null);
    if (!actie) return;
    runAction(this, this.hass, c, actie);
  }

  /**
   * Welke kleur het icoon draagt.
   *
   * Drie lagen, in deze volgorde:
   *
   * 1. Wat het `tone`-veld zegt. Dat mag een sjabloon zijn, en dat is precies
   *    waar het voor is: een rookmelder die rook ziet hoort rood te zijn, en
   *    dat weet alleen het sjabloon. Er staat bewust GEEN kleurkiezer in de
   *    editor -- zie de vormregels in CLAUDE.md: kleur is op deze kaarten
   *    identiteit en geen keuze. Een sjabloon dat een status uitrekent is iets
   *    anders dan een vakje waaruit je een kleur mag prikken.
   * 2. Een lamp draagt de kleur die hij maakt, net als op elke andere kaart.
   * 3. Anders: aan is het accent, uit is gedempt, en zonder entiteit is het
   *    neutrale inkt. Een badge die er hetzelfde uitziet of het apparaat aan of
   *    uit staat, is kapot -- dat is dezelfde regel als op de knoppen.
   */
  toon_() {
    const gevraagd = kleurnaam(this.sjablonen_.waarde("tone", this.config.tone));
    if (gevraagd) return toneValue(gevraagd, "accent");

    const id = this.config.entity;
    const st = stateOf(this.hass, id);
    if (!st) return "var(--dac-ink-2)";
    if (id.startsWith("light.")) return lightTone(st);
    // Buiten de aan/uit-domeinen zegt "aan" niets -- zie badge-logica.js.
    if (!heeftAanUit(id)) return "var(--dac-ink-2)";
    return isOn(st) ? "var(--dac-accent-hi)" : "var(--dac-ink-3)";
  }

  paint() {
    const c = this.config;

    // De sjablonen krijgen `entity` mee, want zo staan ze in zijn YAML:
    // `{% set s = states(entity) %}`. `user` en `config` erbij omdat dat de twee
    // andere dingen zijn waar een badge naar vraagt zonder ze te kunnen weten.
    const velden = Object.fromEntries(SJABLOONVELDEN.map((naam) => [naam, c[naam]]));
    velden.icon = icoonBron(c);
    this.sjablonen_.zet(this.hass, velden, {
      entity: c.entity ?? "",
      user: this.hass?.user?.name ?? "",
    });

    const fouten = this.sjablonen_.fouten();
    this.toggleAttribute("fout", fouten.length > 0);

    const label = this.sjablonen_.waarde("label", c.label);
    const content = fouten.length
      ? "Sjabloonfout"
      : this.sjablonen_.waarde("content", c.content);

    this.text(".label", label);
    this.text(".content", content);
    this.$(".badge").title = fouten.length ? fouten.join("\n") : (c.label ?? "");

    // Eén regel of twee: dat bepaalt hoe groot het label staat.
    const regels = (label ? 1 : 0) + (content ? 1 : 0);
    this.setAttribute("regels", String(regels));

    this.$(".badge").style.setProperty("--tone", this.toon_());

    // Het icoon. Een lege waarde betekent geen icoon, en dat is een geldige
    // keuze -- een badge met alleen een getal erin is een badge.
    const ico = this.$(".ico");
    const wens = fouten.length ? "warning" : this.sjablonen_.waarde("icon", icoonBron(c));
    if (ico.dataset.icon !== wens) {
      ico.dataset.icon = wens;
      ico.innerHTML = wens ? resolve(wens) : "";
    }
  }

  /** Home Assistant vraagt dit voor de hoogte van het voorbeeld in de kiezer. */
  getCardSize() {
    return 1;
  }

  static getConfigElement() {
    return document.createElement(EDITOR_TYPE);
  }

  /**
   * Wat er staat zodra je hem uit de lijst kiest.
   *
   * Met een sjabloon erin en niet leeg, want een lege badge laat niet zien
   * waarvoor hij bedoeld is. Dit is het kortste voorbeeld dat het hele idee
   * toont: een waarde die meebeweegt.
   */
  static getStubConfig(hass, entities) {
    const lamp = entities?.find((e) => e.startsWith("light."));
    if (!lamp) {
      return {
        label: "Lampen aan",
        icon: "bulb",
        content: "{{ states.light | selectattr('state','eq','on') | list | count }}",
      };
    }
    return {
      entity: lamp,
      label: "Lamp",
      icon: "bulb",
      content: "{% if is_state(entity, 'on') %}Aan{% else %}Uit{% endif %}",
    };
  }
}

/* ================================== editor ================================ */

class DomotiappTemplateBadgeEditor extends DacEditor {
  defaults() {
    return { tap_action: { action: "more-info" } };
  }

  /**
   * Jinja in `icon` hoort in het sjabloonveld te staan, niet in de kiezer.
   *
   * Een icoonkiezer met `{% if is_state(entity,'on') %}mdi:fire{% endif %}` in
   * zijn waarde toont een leeg vakje en een onleesbaar bijschrift. De YAML van
   * de eigenaar ziet er precies zo uit, dus hij wordt hier -- alleen voor de
   * WEERGAVE -- naar het juiste veld getild.
   *
   * De config zelf blijft onaangeraakt tot er iets gewijzigd wordt: `setConfig`
   * stuurt geen `config-changed`, dus een dashboard dat alleen geopend wordt om
   * te kijken verandert niet. Zodra hij wél iets verzet, wordt de nette vorm
   * weggeschreven.
   */
  setConfig(config) {
    const c = { ...config };
    if (isSjabloon(c.icon) && !String(c.icon_template ?? "").trim()) {
      c.icon_template = c.icon;
      delete c.icon;
    }
    super.setConfig(c);
  }

  /**
   * De icoonkiezer, met onze eigen set voorop.
   *
   * `auto: false`: een badge heeft geen entiteit nodig, dus "volg de entiteit"
   * is hier geen zinnige standaard -- er is vaak niets om te volgen.
   */
  pickers() {
    return [{ key: "icon", kind: "icon", label: "Icoon", fallback: "shield", auto: false }];
  }

  schema() {
    return [
      { name: "entity", selector: sel.entity() },
      { name: "label", selector: sel.multiline() },
      { name: "content", selector: sel.multiline() },
      { name: "icon_template", selector: sel.multiline() },
      { name: "tone", selector: sel.text() },
      { name: "tap_action", selector: sel.action("more-info") },
      { name: "hold_action", selector: sel.action("none") },
    ];
  }

  label(s) {
    return (
      {
        entity: "Entiteit (optioneel)",
        label: "Bovenste regel",
        content: "Onderste regel",
        icon_template: "Icoon via een sjabloon (optioneel)",
        tone: "Kleur van het icoon",
        tap_action: "Bij tikken",
        hold_action: "Bij vasthouden",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    return {
      entity:
        "Alleen nodig als de badge iets van één ding laat zien. In de sjablonen hieronder is hij beschikbaar als `entity`, zodat je `states(entity)` kunt schrijven.",
      label:
        "De kleine regel bovenin, bijvoorbeeld Alarm of Vaatwasser. Mag een sjabloon zijn.",
      content:
        "De dikke regel eronder: wat er op dit moment aan de hand is. Hier hoort het sjabloon, bijvoorbeeld {% if is_state(entity, 'on') %}Rook!{% else %}Geen rook{% endif %}.",
      icon_template:
        "Alleen invullen als het icoon per toestand moet verschillen. Onze eigen iconen heten dai:, die van Home Assistant mdi: — bijvoorbeeld {% if is_state(entity,'on') %}dai:alarmOn{% else %}dai:alarmOff{% endif %}. De naam die je nodig hebt staat onder het icoon in de kiezer hierboven. Staat hier iets, dan wint het van het gekozen icoon.",
      tone:
        "Leeg laten is het beste: dan volgt het icoon vanzelf de toestand. Wil je het sturen, zet er dan goed, let op of kritiek in — of een sjabloon dat dat uitrekent, voor een melder die rood hoort te worden.",
      hold_action: "Wat er gebeurt als je hem ingedrukt houdt. Laat op Geen actie staan als je niets wilt.",
    }[s.name];
  }
}

registerEditor(EDITOR_TYPE, DomotiappTemplateBadgeEditor);
registerBadge(BADGE_TYPE, DomotiappTemplateBadge, {
  name: "DomotiApp Badge",
  description:
    "Een pil in de kop van je view: icoon, een kop en een waarde. Alle drie mogen een sjabloon zijn, en de achtergrond kan er helemaal af.",
});

export { DomotiappTemplateBadge, SJABLOONVELDEN };
