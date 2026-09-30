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

import { DacCard, registerBadge, registerEditor } from "../base.js";
import { DacEditor, row, section, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { bindActions, defaultTapAction, isOn, lightTone, localizeState, runAction, stateOf } from "../ha.js";
import { SjabloonSet, isSjabloon } from "../sjabloon.js";
import {
  KLEUREN,
  SOORT_STANDAARD,
  alarmKleur,
  alarmStand,
  badgeSoort,
  energieBand,
  energieKleur,
  heeftAanUit,
  icoonBron,
  kleurCss,
  lampKleur,
  lampenAan,
  vermogen,
} from "./badge-logica.js";

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

/**
 * Waar de kleur vandaan komt, zoals `icoonBron` het doet voor het icoon.
 *
 * Een sjabloon in `tone_template` gaat voor, daarna de keuze in de lijst
 * (`tone`), en als laatste `color` -- de sleutel van Mushroom. Zijn badges
 * kwamen daarvandaan, en de belofte was dat de YAML over te nemen is met alleen
 * een andere `type:`. Tot 0.51.0 las deze badge `color` niet, en dan werd een
 * overgenomen kleur stil blauw: *"DIe kleur dinges werkt nu niet namelijk"*.
 */
const kleurBron = (c) => {
  const sjabloon = String(c?.tone_template ?? "").trim();
  if (sjabloon) return sjabloon;
  return c?.tone ?? c?.color ?? "";
};

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
    const ids = this.config?.entity ? [this.config.entity] : [];
    // De lampenteller let op ALLE lampen, ook de uitgesloten en de groepen:
    // een lamp die erbij komt of van groep wisselt, moet de telling ook
    // bijwerken. Goedkoop -- het is een vergelijking per lamp op identiteit.
    if (badgeSoort(this.config) === "lights") {
      for (const id of Object.keys(this.hass?.states ?? {})) {
        if (id.startsWith("light.")) ids.push(id);
      }
    }
    return ids;
  }

  /** De lampen die aan staan, als de lampenteller aan staat; anders null. */
  lampen_() {
    if (badgeSoort(this.config) !== "lights") return null;
    return lampenAan(this.hass?.states, this.config.light_exclude);
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
   * Sinds 0.51.0, op zijn vraag van 29 september 2026: *"Alle andere dingen
   * gewoon blauw tenzij anders aangegeven in de GUI"*.
   *
   * 1. Energie en alarm: de kleur van de band of de stand. Daar zijn die
   *    soorten voor, en een kleur in het algemene veld zou ze overschrijven.
   * 2. Wat er in de GUI gekozen is (`tone`), of een sjabloon (`tone_template`),
   *    of `color` uit een overgenomen Mushroom-badge. Een rookmelder die rook
   *    ziet hoort rood te zijn, en dat weet alleen het sjabloon.
   * 3. De lampenteller: de kleur van de verlichting die brandt.
   * 4. Een lamp: de kleur die hij maakt.
   * 5. Anders BLAUW. Behalve een apparaat dat UIT staat: dat is gedempt. Een
   *    badge die er hetzelfde uitziet of het apparaat aan of uit staat, is
   *    kapot -- dezelfde vormregel als op de knoppen.
   */
  toon_(uitkomst) {
    const c = this.config;
    const soort = badgeSoort(c);
    const DEMP = "var(--dac-ink-3)";
    const BLAUW = "var(--dac-accent-hi)";

    if (soort === "energy") return kleurCss(energieKleur(uitkomst?.band, c)) ?? DEMP;
    if (soort === "alarm") return uitkomst?.stand ? kleurCss(alarmKleur(uitkomst.stand, c)) ?? BLAUW : BLAUW;

    const gevraagd = kleurCss(this.sjablonen_.waarde("tone", kleurBron(c)));
    const lampen = this.lampen_();
    if (lampen) {
      if (!lampen.length) return DEMP;
      return gevraagd ?? lampKleur(this.hass?.states, lampen, this.licht_) ?? "var(--dac-lit)";
    }
    if (gevraagd) return gevraagd;

    const id = c.entity;
    const st = stateOf(this.hass, id);
    if (!st) return BLAUW;
    if (id.startsWith("light.")) return isOn(st) ? lightTone(st, this.licht_) ?? "var(--dac-lit)" : DEMP;
    // Buiten de aan/uit-domeinen zegt "aan" niets -- zie badge-logica.js.
    if (!heeftAanUit(id)) return BLAUW;
    return isOn(st) ? BLAUW : DEMP;
  }

  /**
   * Wat een energie- of alarmbadge nu zegt: tekst, icoon, en waar de kleur
   * vandaan komt. Null voor de andere soorten.
   */
  uitkomst_() {
    const c = this.config;
    const soort = badgeSoort(c);
    const st = stateOf(this.hass, c.entity);
    if (soort === "energy") {
      const v = vermogen(st);
      if (!v) return { tekst: st ? localizeState(this.hass, st) : "Geen sensor", band: null, icoon: "bolt" };
      return { tekst: v.tekst, band: energieBand(v.watt, c), icoon: "bolt" };
    }
    if (soort === "alarm") {
      if (!st) return { tekst: "Geen entiteit", stand: null, icoon: "shield" };
      const { waarde, stand } = alarmStand(st, c);
      // Een attribuut dat niet bestaat gaf een lege regel, en dan zie je niet
      // dat je je vergist hebt in de naam. Gevonden in de editor op
      // 29 september 2026 met "arm mode".
      if (c.alarm_attribute && !waarde) return { tekst: "Attribuut ontbreekt", stand: null, icoon: "shield" };
      const ruw = c.alarm_attribute ? waarde : localizeState(this.hass, st);
      return { tekst: stand?.tekst ?? ruw, stand, icoon: stand?.icoon ?? "shield", ruw: waarde };
    }
    return null;
  }

  paint() {
    const c = this.config;

    // De sjablonen krijgen `entity` mee, want zo staan ze in zijn YAML:
    // `{% set s = states(entity) %}`. `user` en `config` erbij omdat dat de twee
    // andere dingen zijn waar een badge naar vraagt zonder ze te kunnen weten.
    const velden = Object.fromEntries(SJABLOONVELDEN.map((naam) => [naam, c[naam]]));
    velden.icon = icoonBron(c);
    velden.tone = kleurBron(c);
    // Bij een lampenteller, energie of alarm is de onderste regel van de soort
    // zelf. Een sjabloon dat er nog van vroeger in staat, hoeft dan geen
    // abonnement meer te hebben; bij energie en alarm de kleur ook niet.
    const soort = badgeSoort(c);
    const lampen = this.lampen_();
    const uitkomst = this.uitkomst_();
    if (soort) delete velden.content;
    if (uitkomst) delete velden.tone;
    this.sjablonen_.zet(this.hass, velden, {
      entity: c.entity ?? "",
      user: this.hass?.user?.name ?? "",
    });

    const fouten = this.sjablonen_.fouten();
    this.toggleAttribute("fout", fouten.length > 0);

    const label = this.sjablonen_.waarde("label", c.label);
    const content = fouten.length
      ? "Sjabloonfout"
      : lampen
        ? String(lampen.length)
        : uitkomst
          ? uitkomst.tekst
          : this.sjablonen_.waarde("content", c.content);

    this.text(".label", label);
    this.text(".content", content);
    // Bij de lampenteller zegt de tooltip WELKE lampen het zijn. Een getal in de
    // kop van de view roept meteen de vraag op welke er dan nog branden.
    this.$(".badge").title = fouten.length
      ? fouten.join("\n")
      : lampen?.length
        ? lampen.map((id) => this.hass.states[id]?.attributes?.friendly_name ?? id).join("\n")
        : uitkomst?.ruw && uitkomst.ruw !== uitkomst.tekst
          ? `${uitkomst.tekst} (${uitkomst.ruw})`
          : (c.label ?? "");

    // Eén regel of twee: dat bepaalt hoe groot het label staat.
    const regels = (label ? 1 : 0) + (content ? 1 : 0);
    this.setAttribute("regels", String(regels));

    this.$(".badge").style.setProperty("--tone", this.toon_(uitkomst));

    // Het icoon. Een lege waarde betekent geen icoon, en dat is een geldige
    // keuze -- een badge met alleen een getal erin is een badge.
    const ico = this.$(".ico");
    const wens = fouten.length
      ? "warning"
      : this.sjablonen_.waarde("icon", icoonBron(c)) ||
        (lampen ? "bulb" : "") ||
        (uitkomst?.icoon ?? "");
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

/** De keuzelijst "Soort badge". Geen lege waarde: die is niet te kiezen (valkuil 55). */
const SOORT_KEUZES = [
  { value: "tekst", label: "Eigen tekst (sjablonen)" },
  { value: "lights", label: "Lampenteller" },
  { value: "energy", label: "Energie" },
  { value: "alarm", label: "Alarm" },
];

/** Een kleurlijst, met "Automatisch" erbij waar dat iets betekent. */
const kleurKeuzes = ({ automatisch = false, extra = "" } = {}) => [
  ...(automatisch ? [{ value: "auto", label: "Automatisch" }] : []),
  ...KLEUREN.map(([value, label]) => ({ value, label })),
  // Een kleur die er al stond maar niet in de lijst staat (een #hex, een oude
  // naam) houdt zijn eigen regel. Hem stil laten vallen zou betekenen dat de
  // badge een kleur draagt die nergens te zien is -- de vormregel over een oude
  // `tone` in CLAUDE.md.
  ...(extra ? [{ value: extra, label: extra }] : []),
];

/** Welke keuze uit de lijst hoort bij deze kleur, of de kleur zelf. */
const naarKeuze = (waarde) => {
  const css = kleurCss(waarde);
  if (!css) return waarde;
  const keuze = KLEUREN.find(([sleutel]) => kleurCss(sleutel) === css);
  return keuze ? keuze[0] : waarde;
};

const IN_LIJST = new Set(["auto", ...KLEUREN.map(([k]) => k)]);

class DomotiappTemplateBadgeEditor extends DacEditor {
  defaults() {
    return { tap_action: { action: "more-info" } };
  }

  /**
   * Wat er in de YAML staat, in de vorm die de editor toont.
   *
   * Alleen voor de WEERGAVE; `setConfig` stuurt geen `config-changed`, dus een
   * dashboard dat alleen geopend wordt om te kijken verandert niet. Zodra hij
   * iets verzet, wordt de nette vorm weggeschreven (zie `serialize`).
   *
   * - Jinja in `icon` hoort in het sjabloonveld, niet in de kiezer. De YAML van
   *   de eigenaar zag er zo uit.
   * - `light_counter: true` uit 0.49.0 is de soort Lampenteller.
   * - De kleur: een sjabloon gaat naar het sjabloonveld, een naam naar de keuze
   *   uit de lijst die dezelfde kleur geeft (`goed` wordt Groen, `red` wordt
   *   Rood), en `color` van Mushroom telt mee als er niets anders staat.
   */
  setConfig(config) {
    const c = { ...config };
    if (isSjabloon(c.icon) && !String(c.icon_template ?? "").trim()) {
      c.icon_template = c.icon;
      delete c.icon;
    }

    c.mode = badgeSoort(c) || "tekst";
    delete c.light_counter;

    if (c.tone === undefined && !String(c.tone_template ?? "").trim() && c.color !== undefined) {
      c.tone = c.color;
    }
    delete c.color;
    if (isSjabloon(c.tone) && !String(c.tone_template ?? "").trim()) {
      c.tone_template = c.tone;
      delete c.tone;
    }
    c.tone = c.tone ? naarKeuze(c.tone) : "auto";
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

  /**
   * Een andere soort kiezen vult in wat die soort nodig heeft.
   *
   * In de EDITOR en niet in de badge, en dat is met opzet. Zou de badge zelf
   * "Lampen aan" tonen bij een leeg label, dan kon je dat label nooit meer
   * weghalen: een leeg veld wordt uit de config geschrapt (valkuil 55), en dan
   * is leeg niet te onderscheiden van nooit ingevuld. Zo staat het er één keer
   * in, zichtbaar in het veld, en mag je het daarna gewoon aanpassen.
   *
   * Kop en icoon worden alleen vervangen als ze leeg zijn of nog de standaard
   * van de vorige soort dragen: wie "Verbruik thuis" typte, houdt dat.
   */
  patch_(patch, replace = false) {
    const straks = replace ? { ...patch } : { ...this.config_, ...patch };
    const voor = badgeSoort(this.config_);
    const na = badgeSoort(straks);
    if (na !== voor) {
      patch = replace ? straks : { ...patch };
      const oud = SOORT_STANDAARD[voor] ?? {};
      const nieuw = SOORT_STANDAARD[na] ?? {};
      for (const sleutel of ["label", "icon"]) {
        if (sleutel === "icon" && String(straks.icon_template ?? "").trim()) continue;
        if (!straks[sleutel] || straks[sleutel] === oud[sleutel]) patch[sleutel] = nieuw[sleutel];
      }
      for (const [sleutel, waarde] of Object.entries(nieuw)) {
        if (sleutel !== "label" && sleutel !== "icon" && straks[sleutel] === undefined) patch[sleutel] = waarde;
      }
    }
    super.patch_(patch, replace);
  }

  /**
   * Wat er in de YAML komt: alleen wat iets betekent.
   *
   * "Eigen tekst" en "Automatisch" zijn wat er gebeurt als er niets staat, dus
   * die schrijven niets weg. `light_counter` en `color` zijn opgegaan in `mode`
   * en `tone`.
   */
  serialize(config) {
    const uit = { ...config };
    if (!SOORT_KEUZES.some((k) => k.value === uit.mode) || uit.mode === "tekst") delete uit.mode;
    if (uit.tone === "auto") delete uit.tone;
    delete uit.light_counter;
    delete uit.color;
    return uit;
  }

  schema() {
    const c = this.config_ ?? {};
    const soort = badgeSoort(c);
    const kleur = (naam) => ({
      name: naam,
      selector: sel.select(kleurKeuzes({ extra: IN_LIJST.has(c[naam]) ? "" : c[naam] ?? "" })),
    });

    const blok = {
      // Eén keuzelijst en daaronder het blok van die soort -- de vorm die hij
      // op 28 augustus 2026 voor de presets van de camera vroeg (valkuil 33).
      lights: [
        section(
          "Niet meetellen",
          "mdi:lightbulb-off-outline",
          [{ name: "light_exclude", selector: { entity: { domain: "light", multiple: true } } }],
          true
        ),
      ],
      // Getal en kleur naast elkaar ZONDER hulptekst eronder: `ha-form` lijnt
      // de cellen van een rij bovenlangs uit, en een hulptekst van twee regels
      // naast een van één zet ze scheef (valkuil 39). De uitleg staat daarom
      // bij de sensor erboven.
      energy: [
        section(
          "Energie",
          "mdi:flash",
          [
            { name: "entity", selector: sel.entity(["sensor"]) },
            row({ name: "energy_green_max", selector: sel.number(-1000000, 1000000, 1) }, kleur("energy_color_low")),
            row({ name: "energy_orange_max", selector: sel.number(-1000000, 1000000, 1) }, kleur("energy_color_mid")),
            kleur("energy_color_high"),
          ],
          true
        ),
      ],
      alarm: [
        section(
          "Alarm",
          "mdi:shield-home-outline",
          [
            { name: "entity", selector: sel.entity() },
            { name: "alarm_attribute", selector: sel.text() },
            row({ name: "alarm_disarmed", selector: sel.text() }, kleur("alarm_disarmed_color")),
            row({ name: "alarm_partial", selector: sel.text() }, kleur("alarm_partial_color")),
            row({ name: "alarm_armed", selector: sel.text() }, kleur("alarm_armed_color")),
          ],
          true
        ),
      ],
    }[soort] ?? [];

    // De kleur van het icoon kiest de soort zelf bij energie en alarm; een
    // algemene kleur zou die overschrijven en hoort er dan niet te staan.
    const eigenKleur = soort !== "energy" && soort !== "alarm";

    return [
      { name: "mode", selector: sel.select(SOORT_KEUZES) },
      ...blok,
      ...(soort ? [] : [{ name: "entity", selector: sel.entity() }]),
      { name: "label", selector: sel.multiline() },
      ...(soort ? [] : [{ name: "content", selector: sel.multiline() }]),
      { name: "icon_template", selector: sel.multiline() },
      ...(eigenKleur
        ? [
            {
              name: "tone",
              selector: sel.select(
                kleurKeuzes({ automatisch: true, extra: IN_LIJST.has(c.tone) ? "" : c.tone ?? "" })
              ),
            },
            { name: "tone_template", selector: sel.multiline() },
          ]
        : []),
      { name: "tap_action", selector: sel.action("more-info") },
      { name: "hold_action", selector: sel.action("none") },
    ];
  }

  label(s) {
    return (
      {
        mode: "Soort badge",
        light_exclude: "Lampen die hij overslaat",
        entity: badgeSoort(this.config_) === "energy"
          ? "Vermogen"
          : badgeSoort(this.config_) === "alarm"
            ? "Alarm"
            : "Entiteit (optioneel)",
        energy_green_max: "Tot en met (W)",
        energy_color_low: "Kleur",
        energy_orange_max: "Daarna tot en met (W)",
        energy_color_mid: "Kleur",
        energy_color_high: "Kleur daarboven",
        alarm_attribute: "Status uit een attribuut (optioneel)",
        alarm_disarmed: "Uitgeschakeld bij",
        alarm_disarmed_color: "Kleur",
        alarm_partial: "Deels ingeschakeld bij",
        alarm_partial_color: "Kleur",
        alarm_armed: "Ingeschakeld bij",
        alarm_armed_color: "Kleur",
        label: "Bovenste regel",
        content: "Onderste regel",
        icon_template: "Icoon via een sjabloon (optioneel)",
        tone: "Kleur van het icoon",
        tone_template: "Kleur via een sjabloon (optioneel)",
        tap_action: "Bij tikken",
        hold_action: "Bij vasthouden",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    const soort = badgeSoort(this.config_);
    return {
      mode:
        "Eigen tekst: jij bepaalt wat er staat, met sjablonen. Lampenteller: het aantal lampen dat aan staat. Energie: een vermogen met een kleur per grens. Alarm: de stand van je alarm met een kleur per stand.",
      light_exclude:
        "Bijvoorbeeld een nachtlampje dat altijd brandt. Lichtgroepen telt hij sowieso niet mee, anders telt een lamp in een groep dubbel.",
      entity:
        soort === "energy"
          ? "De sensor met het vermogen, in W of kW. De grenzen hieronder zijn in watt: tot en met de eerste grens krijgt de eerste kleur (terugleveren ook), tot en met de tweede de tweede, en daarboven de derde."
          : soort === "alarm"
            ? "Het alarm. Vul hieronder bij elke stand in welke status daarbij hoort; meerdere mogen, met een komma ertussen. Hoofdletters maken niet uit."
            : "Alleen nodig als de badge iets van één ding laat zien. In de sjablonen hieronder is hij beschikbaar als `entity`, zodat je `states(entity)` kunt schrijven.",
      alarm_attribute:
        "Leeg laten: de toestand van het alarm zelf (disarmed, armed_away...). Staat de status bij jouw alarm in een attribuut, zet hier de naam van dat attribuut.",
      label:
        "De kleine regel bovenin, bijvoorbeeld Alarm of Vaatwasser. Mag een sjabloon zijn.",
      content:
        "De dikke regel eronder: wat er op dit moment aan de hand is. Hier hoort het sjabloon, bijvoorbeeld {% if is_state(entity, 'on') %}Rook!{% else %}Geen rook{% endif %}.",
      icon_template:
        "Alleen invullen als het icoon per toestand moet verschillen. Onze eigen iconen heten dai:, die van Home Assistant mdi: — bijvoorbeeld {% if is_state(entity,'on') %}dai:alarmOn{% else %}dai:alarmOff{% endif %}. De naam die je nodig hebt staat onder het icoon in de kiezer hierboven. Staat hier iets, dan wint het van het gekozen icoon.",
      tone:
        soort === "lights"
          ? "Automatisch: de kleur van de lampen die branden, en grijs als alles uit is."
          : "Automatisch: blauw, en gedempt als het apparaat uit staat. Een lamp krijgt de kleur die hij maakt.",
      tone_template:
        "Voor een kleur die meebeweegt, bijvoorbeeld {% if is_state(entity, 'on') %}rood{% else %}groen{% endif %}. Kent de namen uit de lijst hierboven, en ook red, orange, amber en #ff8800. Staat hier iets, dan wint het van de keuze erboven.",
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
