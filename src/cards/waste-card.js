/**
 * Afvalkalender: which bin, and how long you have.
 *
 * The card is built around the only question anyone actually asks it -- "do I
 * need to put something out tonight" -- so the soonest pickup is the hero and
 * everything else is a list underneath. A row of four equal dates makes the
 * reader do the sorting, which is work a card should have done.
 *
 * Dates are read with our own parser rather than `new Date()`. Dutch waste
 * integrations emit `18-08-2026`, which JavaScript reads as an American
 * month-day: silently the wrong day for the first twelve of each month, and
 * NaN for the rest. That is a bug you find in December.
 *
 * Fraction colours follow the actual bins -- orange for PMD, blue for paper,
 * grey for restafval -- because that is the mapping already in the customer's
 * head. GFT gets the teal identity token rather than the status green: it
 * reads as the green bin without spending the colour that means "in orde".
 */

import { DacCard, registerCard, registerEditor, rowsFor, toneValue, INCOMPLETE, escapeHtml } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { dayCount, daysBetween, nameOf, parseDate, relativeDay, shortDate, stateOf } from "../ha.js";
import { korteNamen } from "./afval-namen.js";

/** Bin colours, matched on what the sensor happens to be called. */
const FRACTIONS = [
  [/gft|groente|tuin|organi/i, "teal", "binWheeled"],
  [/pmd|plastic|verpakking/i, "solar", "binWheeled"],
  [/papier|karton/i, "water", "binWheeled"],
  [/rest|grijs/i, "neutral", "binWheeled"],
  [/textiel|kleding/i, "pink", "bin"],
  [/glas/i, "magenta", "bin"],
  [/kerstboom|snoei|takken/i, "teal", "bin"],
];

function fractionStyle(label) {
  for (const [re, tone, icon] of FRACTIONS) {
    if (re.test(label)) return { tone, icon };
  }
  return { tone: "accent", icon: "bin" };
}

/** Strip the boilerplate integrations put in front of the useful bit. */
/** Waarom een bak niet in de gewone lijst staat, in gewone taal. */
const REDEN = {
  "geen datum": "geen datum",
  voorbij: "is geweest",
  "bestaat niet": "sensor ontbreekt",
};

const cleanLabel = (name) =>
  String(name ?? "")
    .replace(/^(afvalbeheer|afvalwijzer|mijnafvalwijzer)\s*/i, "")
    .replace(/\s*(mijnafvalwijzer)\s*/i, " ")
    .trim();

class WasteCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }

    .card {
      height: 100%; padding: 10px 12px;
      display: flex; flex-direction: column; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* Een bak zonder ophaaldatum: hij staat er wél, maar rustig. Verdwijnen
       zou erger zijn -- dan vul je vier bakken in, zie je er twee, en staat er
       nergens waarom. */
    .r[data-stil="true"] { opacity: .55; }
    .r[data-stil="true"] .d { font-style: italic; }

    /* ---- de brede vorm ----
       Gevraagd op 27 augustus 2026: "ook wil ik de afvalkaart over de breedte
       kunnen maken en een stuk minder hoog, om veel meer ruimte te besparen."

       Alle bakken naast elkaar in plaats van onder elkaar. Vier bakken passen
       dan op EEN rasterrij in plaats van vier -- dat scheelt 192 pixels op een
       dashboard waar hij hem naast andere kaarten zet.

       De eerstvolgende bak licht op; de rest staat er rustig bij. Zonder dat
       verschil zijn het vier gelijke vakjes en moet je de datums lezen om te
       zien welke er woensdag uit moet. */
    :host([vorm="breed"]) .hero,
    :host([vorm="breed"]) .list { display: none; }

    /* De titel NAAST de bakken, niet erboven.
       Gemeten op 27 augustus 2026: met de titel erboven wilde de inhoud 71px in
       een kaart van 56 -- hij liep er 16 pixels uit. Dat is precies valkuil 12,
       en de kaart schildert dan over zijn buurman.

       Naast elkaar past het wél, en het is bovendien wat hij vroeg: zo min
       mogelijk hoogte. */
    :host([vorm="breed"]) .card {
      flex-direction: row; align-items: center; gap: 12px; padding: 8px 12px;
    }
    :host([vorm="breed"]) .head { flex: 0 0 auto; }
    :host([vorm="breed"]) .head b { font-size: 12.5px; }

    .breed { display: none; }
    :host([vorm="breed"]) .breed {
      display: grid; gap: 6px; flex: 1 1 auto;
      grid-template-columns: repeat(auto-fit, minmax(86px, 1fr));
      align-content: center;
    }
    /* GEEN vlak en GEEN rand per bak.
       Die stonden er eerst -- elk bakje een gekleurde achtergrond in zijn eigen
       fractiekleur -- en met vier bakken naast elkaar werd dat een lappendeken.
       Zijn oordeel op 27 augustus 2026 was kort: "ziet er niet uit."

       Het botste ook met de vormregel van deze familie: alleen het ICOON draagt
       de toestand, niet het hele vlak (zie CLAUDE.md). Op een kaart met acht
       lampen is dat het verschil tussen een rij en een muur; hier tussen een
       kalender en een kleurenkaart.

       Dus: de stip draagt de kleur, de tekst is neutraal, en de eerstvolgende
       valt op doordat hij als enige in VOLLE inkt staat. */
    .breed .b {
      display: flex; align-items: center; gap: 8px; min-width: 0;
      padding: 2px 0;
    }
    .breed .b[data-stil="true"] { opacity: .45; }
    .breed .b i {
      width: 10px; height: 10px; flex: 0 0 auto; border-radius: 3px;
      background: var(--tone);
    }
    /* De eerstvolgende krijgt een ring om zijn stip: hetzelfde teken dat de
       lampkaart gebruikt, en het kost geen vlak. */
    .breed .b[data-eerst="true"] i {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--tone) 28%, transparent);
    }
    .breed .t { min-width: 0; display: flex; flex-direction: column; line-height: 1.2; }
    .breed .n {
      font-size: 12px; font-weight: 500; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .breed .w {
      font-size: 10.5px; color: var(--dac-ink-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      font-variant-numeric: tabular-nums;
    }
    .breed .b[data-eerst="true"] .n { color: var(--dac-ink); font-weight: 600; }
    .breed .b[data-eerst="true"] .w { color: var(--dac-ink-2); }

    /* ---- hero ---- */
    .hero {
      display: flex; align-items: center; gap: 12px; flex: 0 0 auto;
      min-height: 56px; padding: 8px 12px; border-radius: var(--dac-radius-sm);
      background: color-mix(in srgb, var(--tone) 11%, transparent);
      border: 1px solid color-mix(in srgb, var(--tone) 34%, transparent);
    }
    .hero .bin {
      width: 40px; height: 40px; flex: 0 0 auto; display: grid; place-items: center;
      border-radius: var(--dac-radius-sm); color: var(--tone);
      background: color-mix(in srgb, var(--tone) 18%, transparent);
    }
    .hero .bin .icon, .hero .bin ha-icon { width: 21px; height: 21px; --mdc-icon-size: 21px; }
    .hero .what { min-width: 0; }
    .hero .big {
      font-size: 18px; font-weight: 500; letter-spacing: -.02em; line-height: 1.15;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .hero .when {
      margin-left: auto; text-align: right; flex: 0 0 auto;
      display: flex; align-items: baseline; gap: 5px;
    }
    .hero .when .n { font-size: 18px; font-weight: 500; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }

    /* Today and tomorrow are the only two states that need to shout. */
    :host([urgency="today"]) .hero { animation: pulse 2.6s ease-in-out infinite; }
    @keyframes pulse {
      0%, 100% { border-color: color-mix(in srgb, var(--tone) 34%, transparent); }
      50%      { border-color: color-mix(in srgb, var(--tone) 72%, transparent); }
    }

    /* ---- list ---- */
    .list { flex: 1 1 auto; display: flex; flex-direction: column; }
    .r {
      display: grid; grid-template-columns: 10px 1fr auto; gap: 12px; align-items: center;
      flex: 1 1 auto; min-height: 32px; padding: 0 2px; font-size: 13px;
    }
    .r + .r { border-top: 1px solid var(--dac-border); }
    .r i { width: 10px; height: 10px; border-radius: 3px; background: var(--tone); }
    .r .d { color: var(--dac-ink-2); font-variant-numeric: tabular-nums; text-align: right; }
    .r .d small { color: var(--dac-ink-3); margin-left: 6px; }

    .empty { padding: 18px 2px; font-size: 13px; color: var(--dac-ink-3); }
  `;

  validate(config) {
    const list = config.sensors ?? config.entities ?? (config.entity ? [config.entity] : []);
    if (!list.length) {
      return { ...config, [INCOMPLETE]: "Kies minstens één afvalsensor waarvan de status een datum is." };
    }
    return {
      show_hero: true,
      show_list: true,
      ...config,
      sensors: list.map((s) => (typeof s === "string" ? { entity: s } : s)),
    };
  }

  watched() {
    return this.config.sensors.map((s) => s.entity);
  }

  /**
   * Lees elke sensor, en laat er GEEN stil verdwijnen.
   *
   * Wat hier veranderd is, en waarom -- gemeld op 27 augustus 2026 met twee
   * schermafdrukken naast elkaar: *"ik zie volledige namen en mis de helft."*
   *
   * De helft miste omdat een sensor zonder bruikbare datum werd weggefilterd.
   * Dat leest als een kaart die stuk is: je vult vier bakken in, je ziet er
   * twee, en er staat nergens waarom. Nu komen ze allemaal terug -- de bakken
   * met een datum bovenaan op volgorde, en wat er niet te plaatsen valt
   * daaronder met de reden erbij.
   *
   * En de namen worden ingekort op wat ze DELEN, niet op een lijstje bekende
   * integraties. Zie afval-namen.js.
   */
  read_() {
    const now = new Date();
    const ruw = this.config.sensors.map((cfg) => {
      const st = stateOf(this.hass, cfg.entity);
      const date = st
        ? parseDate(st.state) ??
          parseDate(st.attributes.date) ??
          parseDate(st.attributes.next_date)
        : null;
      return { cfg, st, date };
    });

    // De namen samen inkorten: wat elke bak in zijn naam deelt is geen
    // informatie. Dat kan alleen als je ze naast elkaar legt.
    const vol = ruw.map((r) => cleanLabel(nameOf(this.hass, r.cfg.entity, r.cfg.name)));
    const kort = korteNamen(vol);

    return ruw
      .map((r, i) => {
        const label = r.cfg.label ?? kort[i] ?? vol[i];
        const style = fractionStyle(r.cfg.label ?? r.cfg.entity + label);
        // Wat de config zegt wint van wat de naam suggereert: een gemeente die
        // haar bakken anders kleurt hoeft niet met de regexen te vechten.
        const perEntity = this.config.tones?.[r.cfg.entity];
        return {
          label,
          entity: r.cfg.entity,
          date: r.date,
          days: r.date ? daysBetween(now, r.date) : null,
          tone: toneValue(perEntity ?? r.cfg.tone ?? style.tone),
          icon: r.cfg.icon ?? style.icon,
          // Waarom hij niet in de gewone lijst staat, als dat zo is.
          reden: !r.st
            ? "bestaat niet"
            : !r.date
              ? "geen datum"
              : daysBetween(now, r.date) < 0
                ? "voorbij"
                : null,
        };
      })
      .sort((a, b) => {
        // Eerst wat er nog komt, op datum. Daarna de rest, op naam.
        if (!a.reden && !b.reden) return a.date - b.date;
        if (!a.reden) return -1;
        if (!b.reden) return 1;
        return a.label.localeCompare(b.label);
      });
  }

  /** Alleen de bakken die nog opgehaald worden. */
  komend_(items) {
    return items.filter((i) => !i.reden);
  }

  /** Staat deze kaart over de breedte? */
  breed_() {
    return this.config.layout === "breed";
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    this.setAttribute("vorm", this.breed_() ? "breed" : "lijst");
    return `
      <div class="card surface">
        ${c.title ? `<div class="head"><b>${c.title}</b></div>` : ""}
        ${c.show_hero === false ? "" : `<div class="hero" hidden>
          <span class="bin"></span>
          <span class="what">
            <span class="eyebrow"></span>
            <span class="big"></span>
          </span>
          <span class="when"><span class="n tnum"></span><span class="eyebrow u"></span></span>
        </div>`}
        ${c.show_list === false ? "" : `<div class="list"></div>`}
        <div class="breed"></div>
        <div class="empty" hidden>Geen ophaaldata gevonden. Controleer of de gekozen sensoren een datum als toestand hebben.</div>
      </div>`;
  }

  paint() {
    const items = this.read_();
    // De uitgelichte bak is de eerstvolgende die ECHT nog komt. Een bak zonder
    // datum hoort daar niet te staan, ook al staat hij vooraan in de lijst.
    const komend = this.komend_(items);
    const hero = this.$(".hero");
    const list = this.$(".list");
    const empty = this.$(".empty");

    empty.hidden = items.length > 0;

    if (this.breed_()) {
      this.paintBreed_(items, komend[0]);
      return;
    }

    if (hero) {
      hero.hidden = komend.length === 0;
      if (komend.length) {
        const next = komend[0];
        hero.style.setProperty("--tone", next.tone);
        this.setAttribute(
          "urgency",
          next.days === 0 ? "today" : next.days === 1 ? "tomorrow" : "later"
        );

        const bin = hero.querySelector(".bin");
        if (bin.dataset.icon !== next.icon) {
          bin.dataset.icon = next.icon;
          bin.innerHTML = resolve(next.icon, "bin");
        }
        this.text(hero.querySelector(".eyebrow"), relativeDay(next.date));
        this.text(hero.querySelector(".big"), next.label);
        this.text(hero.querySelector(".n"), next.days === 0 ? "nu" : String(next.days));
        this.text(
          hero.querySelector(".u"),
          next.days === 0 ? "aan de weg" : next.days === 1 ? "dag" : "dagen"
        );
      }
    }

    if (list) {
      // Skipping the hero's own fraction would leave a gap in the calendar, so
      // the list stays complete and simply starts where the hero left off.
      // De uitgelichte bak staat al bovenaan; die niet nog eens in de lijst.
      const eersteKomend = komend[0];
      const rest =
        this.config.show_hero === false ? items : items.filter((i) => i !== eersteKomend);
      const wanted = rest.map((i) => `${i.label}${+i.date}${i.reden ?? ""}`).join("|");
      if (list.dataset.sig === wanted) return;
      list.dataset.sig = wanted;

      list.innerHTML = rest
        .map((i) => {
          // Een bak zonder bruikbare datum verdwijnt niet meer, maar krijgt de
          // reden achter zijn naam. Gedempt, want het is geen ophaaldag.
          if (i.reden) {
            return `
        <div class="r" data-stil="true" style="--tone:${i.tone}">
          <i></i><span>${escapeHtml(i.label)}</span>
          <span class="d">${REDEN[i.reden] ?? i.reden}</span>
        </div>`;
          }
          // Beyond a week `relativeDay` already falls back to a date, so
          // appending the short date again just prints it twice.
          const when = relativeDay(i.date);
          const extra = i.days <= 6 ? `<small>${shortDate(i.date)}</small>` : "";
          return `
        <div class="r" style="--tone:${i.tone}">
          <i></i><span>${escapeHtml(i.label)}</span>
          <span class="d">${when}${extra}</span>
        </div>`;
        })
        .join("");
    }
  }

  /**
   * Alle bakken naast elkaar, op één rasterrij.
   *
   * Wat hier anders is dan in de lijst: er is geen uitgelichte regel bovenaan,
   * maar de eerstvolgende bak licht op tussen de andere. Dat scheelt de hele
   * kop -- en dat is precies waar de ruimtewinst zit.
   */
  paintBreed_(items, eerste) {
    const vak = this.$(".breed");
    if (!vak) return;
    const sig = items.map((i) => `${i.label}|${+i.date}|${i.reden ?? ""}`).join(",");
    if (vak.dataset.sig === sig) return;
    vak.dataset.sig = sig;

    vak.innerHTML = items
      .map((i) => {
        const wanneer = i.reden
          ? REDEN[i.reden] ?? i.reden
          : i.days === 0
            ? "vandaag"
            : i.days === 1
              ? "morgen"
              : relativeDay(i.date);
        return `
          <div class="b" style="--tone:${i.tone}" data-eerst="${i === eerste}"
               data-stil="${Boolean(i.reden)}" title="${escapeHtml(i.label)}">
            <i></i>
            <span class="t">
              <span class="n">${escapeHtml(i.label)}</span>
              <span class="w">${escapeHtml(wanneer)}</span>
            </span>
          </div>`;
      })
      .join("");
  }

  /**
   * Eén rasterrij per fractie.
   *
   * Vier fracties is dus vier rijen: precies de hoogte van vier Mushroom-kaarten
   * ernaast, en dat is waar de kaart naast komt te staan. De inhoud is lager dan
   * dat, maar de lijstregels rekken mee, zodat er geen gat onderin valt maar de
   * regels wat meer lucht krijgen.
   */
  rows_() {
    const n = this.config?.sensors?.length ?? 1;
    // De brede vorm is één rasterrij, hoeveel bakken er ook staan -- ze staan
    // naast elkaar. Bij meer dan vier breekt het raster af naar een tweede rij;
    // vandaar de deling.
    if (this.breed_()) return Math.max(1, Math.ceil(n / 4));
    if (this.config?.show_list === false) return 1;
    if (this.config?.show_hero === false) return Math.max(1, rowsFor(20 + n * 33));
    return Math.max(2, n);
  }

  getCardSize() {
    return this.rows_();
  }

  getGridOptions() {
    const rows = this.rows_();
    return { columns: 12, rows, min_columns: 6, min_rows: rows, max_rows: rows };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-waste-card-editor");
  }

  static getStubConfig(hass) {
    const sensors = Object.keys(hass?.states ?? {})
      .filter((e) => /afval|waste|trash|garbage|ophaal/i.test(e) && e.startsWith("sensor."))
      .filter((e) => parseDate(hass.states[e]?.state))
      .slice(0, 6);
    return { sensors, title: "Afvalkalender" };
  }
}

/**
 * De editor werkt plat, de config houdt de kleuren in een map.
 *
 * `ha-form` kent geen herhalende rij, dus krijgt elke gekozen sensor een eigen
 * platte sleutel `kleur:<entity>`, die `serialize` terugvouwt naar `tones`. De
 * kleur zelf kiest hij met onze eigen stalenrij en niet met een keuzelijst: een
 * kleur kies je op kleur, niet op de naam "Groenblauw".
 */
class WasteEditor extends DacEditor {
  defaults() {
    return { show_hero: true, show_list: true };
  }

  setConfig(config) {
    const flat = { ...config };
    for (const [id, tone] of Object.entries(config.tones ?? {})) flat[`kleur:${id}`] = tone;
    delete flat.tones;
    super.setConfig(flat);
  }

  serialize(config) {
    const out = { ...config };
    const tones = {};
    for (const k of Object.keys(out)) {
      if (!k.startsWith("kleur:")) continue;
      if (out[k]) tones[k.slice(6)] = out[k];
      delete out[k];
    }
    if (Object.keys(tones).length) out.tones = tones;
    else delete out.tones;
    return out;
  }

  /** De sensoren van deze kaart, in de vorm waarin je ze kunt aanwijzen. */
  ids_() {
    return (this.config_?.sensors ?? [])
      .map((s) => (typeof s === "string" ? s : s.entity))
      .filter(Boolean);
  }

  /**
   * De kleur per fractie is een rij stalen, niet een keuzelijst.
   *
   * Er stonden namen in een dropdown -- "Oranje", "Groenblauw" -- en dan zit je
   * te gokken welke van de twee blauwen je bedoelt en wat de bak straks wordt.
   * Een kleur kies je op kleur. Ze staan ná het formulier, want je kunt pas een
   * kleur per sensor kiezen als je de sensoren hebt aangewezen.
   */
  pickers() {
    const ids = this.ids_();
    // Dezelfde inkorting als op de kaart. Anders staat er in de editor "Kleur
    // voor Circulus Circulus Restafval" boven een staal dat op de kaart bij
    // "Restafval" hoort, en ben je aan het zoeken welke bij welke is.
    const namen = korteNamen(
      ids.map((id) => cleanLabel(this.hass?.states?.[id]?.attributes?.friendly_name ?? id) || id)
    );
    return ids.map((id, i) => ({
      key: `kleur:${id}`,
      kind: "tone",
      label: `Kleur voor ${namen[i] || id}`,
      compact: true,
      after: true,
    }));
  }

  schema() {
    return [
      { name: "sensors", selector: { entity: { domain: "sensor", multiple: true } } },
      {
        name: "layout",
        selector: sel.select([
          { value: "lijst", label: "Lijst (eerstvolgende uitgelicht)" },
          { value: "breed", label: "Over de breedte (veel lager)" },
        ]),
      },
    ];
  }

  label(s) {
    return (
      {
        sensors: "Afvalsensoren",
        layout: "Vorm",
        show_hero: "Eerstvolgende uitlichten",
        show_list: "Overige data tonen",
      }[s.name] ?? super.label(s)
    );
  }

  helper(s) {
    if (s.name === "layout")
      return "Over de breedte zet alle bakken naast elkaar in plaats van onder elkaar. Vier bakken passen dan op één rasterrij in plaats van vier — dat scheelt bijna tweehonderd pixels. De eerstvolgende licht op.";
    if (s.name === "sensors")
      return "Sensoren waarvan de status een datum is, bijvoorbeeld 18-08-2026. De kaart sorteert zelf; laat een kleur leeg om de bakkleur op de naam te laten kiezen.";
    return undefined;
  }
}

registerEditor("domotiapp-waste-card-editor", WasteEditor);
registerCard("domotiapp-waste-card", WasteCard, {
  name: "DomotiApp Afvalkalender",
  description: "Eerstvolgende ophaling als hero, de rest eronder. Kleur per fractie.",
});
