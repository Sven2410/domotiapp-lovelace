/**
 * De werkkaart van de familie: entiteiten in rijen die je zelf samenstelt.
 *
 * Hier zat tot 20 augustus 2026 een tweede kaart naast: de knopkaart, een
 * control als rij, tegel of compacte pil. Die twee deden hetzelfde werk in twee
 * vormtalen -- dezelfde chip, dezelfde tweeknoppenverdeling, dezelfde
 * kleurregels, twee keer geschreven en twee keer onderhouden. Een knop is niets
 * anders dan een entiteitenkaart met een rij van een kolom, dus is de knopkaart
 * hierin opgegaan en bestaat `custom:domotiapp-button-card` niet meer.
 *
 * Wat daarvan hierheen kwam: de drie vormen (rij, tegel, compact), het tonen of
 * verbergen van icoon en naam per entiteit, dubbeltikken, en een plek zonder
 * entiteit -- dat laatste is geen fout maar een navigatieknop.
 *
 * De vorm zit **per rij**, niet per kaart en niet per entiteit. Per kaart zou
 * betekenen dat een raster tegels boven een lijst twee kaarten kost; per
 * entiteit zou blokjes van ongelijke hoogte naast elkaar zetten in dezelfde rij.
 * Een rij is precies de eenheid waarop een vorm klopt.
 *
 * WAAR HET VLAK ZIT
 *
 * De kaart heeft een vlak en de entiteiten erin zijn plat -- zo stond hij er al.
 * Maar een raster ruimtetegels hoort er anders uit te zien: losse blokken, elk
 * met een eigen rand, zoals de knopkaart ze tekende. Dat is `surface: items`.
 * En `surface: none` geeft helemaal geen vlak, voor als de kaart al in iets
 * anders zit. Een instelling, drie eerlijke standen; geen kaart die zelf raadt
 * wat je bedoelde.
 *
 * DE REST, ONVERANDERD
 *
 * Heeft een entiteit een eigen afbeelding -- een clublogo, een profielfoto, het
 * merk van een integratie -- dan wordt die getoond in plaats van een icoon,
 * tenzij je zelf een icoon hebt gekozen. Dat is de volgorde die klopt: wat de
 * entiteit zelf meebrengt is specifieker dan wat het domein oplevert, en wat jij
 * kiest is specifieker dan allebei.
 *
 * Alleen het icoon draagt de toestand. Een raster van zes oplichtende vlakken is
 * geen lijst meer maar een lichtkrant.
 *
 * Het icoon en de regel zijn twee knoppen. Op het icoon tikken schakelt, op de
 * regel tikken doet wat jij instelt -- meestal openen of navigeren. Dat is het
 * verschil tussen een lijst die je kunt bedienen en een lijst waar je alleen
 * naar kunt kijken.
 *
 * TWEE MANIEREN OM DE TOESTAND TE TONEN
 *
 * Standaard staat de toestand als tweede regel onder de naam. Zet je `Status
 * rechts` aan, dan staat hij rechts op de regel in plaats van eronder -- de
 * vorm die Home Assistants eigen entiteitenkaart heeft, en die in een kolom van
 * een entiteit per regel rustiger leest omdat alle waarden onder elkaar
 * uitkomen.
 *
 * En een regel die een lamp of een stopcontact aanstuurt kan in plaats van een
 * tekst een schuifschakelaar krijgen. Die vertelt hetzelfde -- aan of uit --
 * maar je kunt hem ook bedienen, en dat scheelt de omweg via het icoon. Waar
 * een schakelaar staat, staat geen statustekst: dat zou twee keer hetzelfde
 * zeggen.
 *
 * Een tijd of een datum gaat sinds die schakelaar op dezelfde manier. Een
 * `input_datetime` -- en net zo goed een `time`, `date` of `datetime` van een
 * apparaat -- krijgt op de plek van de statustekst een veld waarin je hem
 * meteen zet. Dat is bewust geen instelling: de waarde stond er toch al, hem
 * bewerkbaar tonen kost geen ruimte, en de omweg erlangs kostte vier
 * handelingen -- regel opentikken, venster afwachten, veld zoeken, venster
 * sluiten -- voor het verzetten van een wektijd. Wie er helemaal geen waarde
 * wil zet `Status tonen` uit; dan verdwijnt met de tekst ook het veld. Het
 * rekenwerk erachter staat in `tijdveld.js`.
 */

import { DacCard, registerCard, rowsFor, toneValue, TONES, INCOMPLETE } from "../base.js";
import { resolve, defaultIcon } from "../icons.js";
import { bindToggle, setToggle, toggleCss, toggleHtml } from "../toggle.js";
import { kanTijdZetten, tijdSoort, veldWaarde, zetOproep } from "./tijdveld.js";
import "../editor/entities-editor.js";
import {
  GAP,
  HOOGTE,
  gevuld,
  kaartHoogte,
  toRows,
  vlakVan,
} from "./entities-logica.js";
import {
  attrsOf,
  bindActions,
  defaultTapAction,
  domainOf,
  isDead,
  isOn,
  isStateless,
  kanSchakelen,
  lightTone,
  localizeState,
  nameOf,
  pictureOf,
  runAction,
  stateOf,
} from "../ha.js";

class EntitiesCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 5px 10px;
      display: flex; flex-direction: column; justify-content: center; gap: ${GAP}px;
    }
    /* Zonder eigen kaartvlak vervalt ook de binnenmarge: die hoort bij het vlak,
       en zonder vlak duwt hij de inhoud alleen maar uit het raster. */
    :host([vlak="items"]) .card, :host([vlak="none"]) .card {
      background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0;
    }

    .row {
      display: grid; gap: ${GAP}px;
      grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
    }
    /* Een enkele rij vult de kaart. Dat is het geval van de losse knop: een
       kaart van 56px hoog hoort een knop van 56px te tonen, geen pil van 44 met
       lucht eromheen. Bij meer rijen niet, want dan zouden ze de ruimte
       verdelen en staat een tegelrij naast een gewone rij uit te rekken. */
    .card > .row:only-child { flex: 1 1 auto; }

    .it {
      position: relative; overflow: hidden; height: 100%;
      display: flex; align-items: center; gap: 10px;
      min-height: var(--it-h, 44px); padding: 2px 6px 2px 2px;
      background: none; border: 0; border-radius: var(--dac-radius-sm);
      font: inherit; color: inherit; text-align: left; cursor: pointer;
      transition: background 200ms ease, border-color 200ms ease, transform 200ms ease;
      touch-action: manipulation;
    }
    .it:hover { background: var(--dac-surface); }
    /* Draagt de plek zelf het vlak, dan hoort hij ook zelf te reageren -- en
       met dezelfde ronding als elke andere kaart in de familie.

       De rand staat er expliciet bij. .surface in theme.js zet hem wel, maar
       .it hierboven zet border op 0 en staat verderop in dezelfde stylesheet;
       bij gelijke specificiteit wint de laatste. Het gevolg was een blokje met
       een achtergrond en zonder rand -- precies het verschil tussen een knop en
       een vlek. */
    .it.surface {
      border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius); padding: 2px 10px 2px 6px;
    }
    .it.surface:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); }
    .it.surface:active { transform: scale(.985); }

    .chip {
      width: 36px; height: 36px; flex: 0 0 auto; cursor: pointer;
      transition: color 200ms ease, background 200ms ease,
                  border-color 200ms ease, box-shadow 200ms ease;
    }
    .chip .icon, .chip ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }
    .it[data-on="true"] .chip {
      box-shadow: 0 0 12px -3px color-mix(in srgb, var(--tone) 55%, transparent);
    }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11px; line-height: 1.25; color: var(--dac-ink-2);
      font-variant-numeric: tabular-nums;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st:empty { display: none; }

    /* Rechts uitgelijnd: de naam neemt de ruimte, de waarde staat tegen de rand
       aan. Zo komen de waarden van een lijst onder elkaar uit in plaats van
       ergens midden in de regel te eindigen. */
    .st.rechts {
      flex: 0 0 auto; margin-left: auto; padding-left: 10px;
      max-width: 55%; text-align: right; font-size: 12px;
    }

    /* ---- tegel: icoon boven het label, voor een raster ruimtes of scenes ---- */
    .row[data-vorm="tile"] .it {
      flex-direction: column; align-items: flex-start; justify-content: space-between;
      gap: 0; padding: 14px;
    }
    .row[data-vorm="tile"] .chip { width: 40px; height: 40px; }
    .row[data-vorm="tile"] .chip .icon,
    .row[data-vorm="tile"] .chip ha-icon { width: 21px; height: 21px; --mdc-icon-size: 21px; }
    .row[data-vorm="tile"] .txt { flex: 0 0 auto; margin-top: 12px; width: 100%; }
    .row[data-vorm="tile"] .nm { font-size: 14px; }

    /* ---- compact: icoon en naam, meer niet. Voor een dichte favorietenrij. ---- */
    .row[data-vorm="compact"] .it { padding: 4px 14px 4px 4px; border-radius: var(--dac-radius-pill); }
    .row[data-vorm="compact"] .chip { width: 32px; height: 32px; border-radius: var(--dac-radius-pill); }
    .row[data-vorm="compact"] .chip .icon,
    .row[data-vorm="compact"] .chip ha-icon { width: 17px; height: 17px; --mdc-icon-size: 17px; }

    ${toggleCss}
    .toggle { width: 42px; height: 24px; }
    .toggle .knob { width: 18px; height: 18px; }
    .toggle[aria-checked="true"] .knob { --knob: 20px; }
    /* Op een tegel is er rechts van de tekst geen ruimte, dus staat de
       schakelaar bovenin naast het icoon -- daar waar op een rij het icoon zelf
       staat, en dus waar je hand al is. */
    .row[data-vorm="tile"] .toggle { position: absolute; top: 14px; right: 14px; margin: 0; }
    .row[data-vorm="compact"] .toggle { width: 40px; height: 23px; }
    .row[data-vorm="compact"] .toggle .knob { width: 17px; height: 17px; }
    .row[data-vorm="compact"] .toggle[aria-checked="true"] .knob { --knob: 19px; }

    /* ---- een tijd of datum, te zetten waar hij staat ----

       Het is een echt invoerveld van de browser en geen nagebouwde kiezer: dan opent op een
       telefoon de klok van het toestel zelf, met de duim waar de duim hoort, en
       werkt op een toetsenbord gewoon typen. Wat we ervan afhalen is het
       kalenderknopje van de browser -- dat staat er in een eigen maat en kleur
       overheen -- en het veld opent zijn kiezer daarom zelf bij een tik.

       color-scheme: dark is geen sier: zonder dat tekent de browser de vakjes
       en het uitklappaneel licht, en die vallen buiten onze shadow root. Dat is
       hetzelfde soort val als de select in de wekkereditor (fase 12). */
    .tijd {
      flex: 0 0 auto; margin-left: auto; min-width: 0;
      font: inherit; font-size: 13px; line-height: 1.2;
      font-variant-numeric: tabular-nums;
      color: var(--dac-ink); color-scheme: dark;
      background-color: var(--dac-surface);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      padding: 5px 10px; cursor: pointer; text-align: center;
      transition: background 200ms ease, border-color 200ms ease;
    }
    .tijd:hover { background-color: var(--dac-surface-hi); border-color: var(--dac-border-hi); }
    .tijd:focus-visible { outline: 2px solid var(--tone); outline-offset: 1px; }
    .tijd::-webkit-calendar-picker-indicator { display: none; }
    .tijd::-webkit-datetime-edit { padding: 0; }
    /* Datum en tijd samen is een lang veld; op een regel van 44px moet dat er
       nog naast een naam passen. */
    .tijd[type="datetime-local"] { font-size: 12px; padding: 5px 8px; }
    .row[data-vorm="tile"] .tijd { position: absolute; top: 14px; right: 14px; margin: 0; }

    /* Een vleug identiteitskleur op een tegel, zodat je hem van een afstand
       herkent voordat de tekst leesbaar is. Alleen op de tegelvorm: in een rij
       zou het net het oplichten worden dat er juist uit moest. */
    .wash {
      position: absolute; top: -70px; right: -60px; width: 190px; height: 190px;
      border-radius: 50%; pointer-events: none; opacity: .10;
      background: radial-gradient(circle, var(--tone) 0%, transparent 70%);
      transition: opacity 260ms ease;
    }
    .it[data-on="true"] .wash { opacity: .2; }

    .it.unavailable { opacity: .42; pointer-events: none; }

    /* Onder de 260px passen twee namen niet meer naast elkaar zonder te
       verminken, dus dan gaat elke rij terug naar een kolom. Een tegelrij niet:
       daar staat de naam onder het icoon en past hij nog prima. */
    @container (max-width: 260px) {
      .row:not([data-vorm="tile"]) { grid-template-columns: 1fr; }
    }
  `;

  validate(config) {
    const rows = toRows(config);
    if (!rows.some((r) => r.items.some(gevuld))) {
      return { ...config, [INCOMPLETE]: "Voeg een rij toe en kies daar entiteiten in." };
    }
    return { show_state: true, state_position: "below", ...config, rows };
  }

  watched() {
    return this.config.rows.flatMap((r) => r.items.map((i) => i.entity));
  }

  item_(r, i) {
    return this.config.rows[+r]?.items[+i];
  }

  /** Een losse lamp draagt zijn eigen kleur, een groep niet. Zie `lightTone` in ha.js. */
  tone_(item) {
    if (item.tone) return toneValue(item.tone);
    if (this.config.tone) return toneValue(this.config.tone);
    if (domainOf(item.entity) !== "light") return TONES.accent;
    return lightTone(stateOf(this.hass, item.entity)) ?? TONES.lit;
  }

  /**
   * Hoort er een schakelaar op deze regel?
   *
   * Alleen als jij het vraagt, en alleen op iets met twee standen die blijven
   * staan -- zie `kanSchakelen` in ha.js. Een schakelaar op een sensor belooft
   * een "uit" die niet bestaat.
   */
  metSchakelaar_(item) {
    return Boolean(item.toggle) && kanSchakelen(item.entity);
  }

  /**
   * Hoort er een tijd- of datumveld op deze regel?
   *
   * Zonder dat je erom vraagt, want de waarde stond er toch al -- zie de kop.
   * Wie hem niet wil zet `Status tonen` uit; dat is dezelfde knop die de tekst
   * weghaalt, en het veld is hier wat de tekst was. Een schakelaar wint, maar
   * die twee komen nooit samen voor: geen enkel tijddomein is schakelbaar.
   */
  metTijd_(item) {
    if (!kanTijdZetten(item.entity)) return false;
    if (this.metSchakelaar_(item)) return false;
    return (item.show_state ?? this.config.show_state) !== false;
  }

  template() {
    const c = this.config;
    this.setAttribute("vlak", vlakVan(c));
    this.style.containerType = "inline-size";
    const eigenVlak = vlakVan(c) === "items";

    const rows = c.rows
      .map((row, r) => {
        // Op een tegel staat de status altijd onder de naam; daar is geen
        // rechterkant om tegenaan te zetten.
        const rechts = c.state_position === "right" && row.layout !== "tile";
        const st = `<span class="st${rechts ? " rechts" : ""}"></span>`;
        const items = row.items
          .map(
            (item, i) => `
          <div class="it${eigenVlak ? " surface" : ""}" role="button" tabindex="0"
               data-r="${r}" data-i="${i}">
            ${row.layout === "tile" ? `<span class="wash"></span>` : ""}
            ${item.show_icon === false ? "" : `<span class="chip" role="button" tabindex="0"></span>`}
            <span class="txt">${item.show_name === false ? "" : `<span class="nm"></span>`}${rechts ? "" : st}</span>
            ${rechts ? st : ""}
            ${this.metSchakelaar_(item) ? toggleHtml({ label: "Aan of uit" }) : ""}
            ${this.metTijd_(item) ? `<span class="tijdslot" style="display:contents"></span>` : ""}
          </div>`
          )
          .join("");
        return `
      <div class="row" data-vorm="${row.layout}"
           style="--cols:${row.columns};--it-h:${HOOGTE[row.layout]}px">${items}</div>`;
      })
      .join("");

    return `<div class="card surface">${rows}</div>`;
  }

  wire() {
    this.$$(".it").forEach((el) => {
      const item = this.item_(el.dataset.r, el.dataset.i);
      if (!item) return;
      const fire = (which, fallback) =>
        runAction(this, this.hass, item, item[which] ?? fallback);
      // Zonder entiteit valt er niets te openen: dan is dit een navigatieknop en
      // doet alleen wat jij instelt nog iets.
      const heen = { action: item.entity ? "more-info" : "none" };

      // De regel opent, het icoon schakelt -- twee knoppen op een regel, zodat
      // je het licht aan kunt doen zonder de kamer te openen.
      this.teardown_.push(
        bindActions(el, {
          onTap: () => fire("tap_action", heen),
          onHold: () => fire("hold_action", heen),
          onDouble: item.double_tap_action
            ? () => fire("double_tap_action", { action: "none" })
            : undefined,
        })
      );

      const chip = el.querySelector(".chip");
      if (chip) {
        this.teardown_.push(
          bindActions(chip, {
            onTap: () => fire("icon_tap_action", defaultTapAction(item.entity)),
            onHold: () => fire("icon_hold_action", heen),
          })
        );
        // Anders telt een tik op het icoon ook als een tik op de regel.
        this.on(chip, "click", (e) => e.stopPropagation());
        this.on(chip, "pointerdown", (e) => e.stopPropagation());
      }

      // Het tijdveld bestaat hier nog niet: `paint()` bouwt het pas als bekend
      // is of er een klok, een kalender of allebei in zit. Daarom hangt het
      // gedrag aan de REGEL en niet aan het veld -- een luisteraar op het veld
      // zelf zou bij elke verbouwing weg zijn, en dat is precies hoe een kaart
      // eruitziet die het doet en na een verhuizing niet meer (valkuil 2).
      if (el.querySelector(".tijdslot")) {
        // In de vangfase, want de regel eronder luistert zelf in de bubbelfase:
        // stoppen we pas daar, dan is de pop-up al open voordat het veld zijn
        // eigen tik krijgt. Het veld zelf houdt zijn tik gewoon -- vangen
        // stopt de doorgifte, niet wat de browser er standaard mee doet.
        const houdTegen = (e) => {
          const veld = e.target?.closest?.(".tijd");
          if (!veld) return;
          e.stopPropagation();
          // En de kiezer meteen open, want daar was het om te doen. Lukt dat
          // niet -- een browser die het niet kent, of een kiezer die al opent
          // op een aanraakscherm -- dan blijft het een gewoon veld.
          if (e.type === "click") {
            try {
              veld.showPicker?.();
            } catch {
              // Geen kiezer. Typen werkt nog steeds.
            }
          }
        };
        this.on(el, "pointerdown", houdTegen, true);
        this.on(el, "click", houdTegen, true);

        // Een invoerveld meldt zich per VAK: typ je 08:45, dan komt er een
        // wijziging na de 8 (00:30), na de 4 (08:30) en zo verder. Ongefilterd
        // zouden dat vier service-aanroepen zijn, met drie tijden ertussen die
        // niemand bedoelde -- en op een wektijd hangt een automatisering die
        // van zo'n tussenstand wakker wordt. Dus: wachten tot het stil is, en
        // meteen sturen zodra je het veld verlaat.
        let wachtend = null;
        let timer = null;
        const stuur = () => {
          clearTimeout(timer);
          timer = null;
          const oproep = wachtend;
          wachtend = null;
          if (oproep) this.hass.callService(oproep[0], oproep[1], oproep[2]);
        };
        this.teardown_.push(() => clearTimeout(timer));

        this.on(el, "change", (e) => {
          const veld = e.target?.closest?.(".tijd");
          if (!veld) return;
          e.stopPropagation();
          wachtend = zetOproep(item.entity, veld.type, veld.value);
          clearTimeout(timer);
          timer = setTimeout(stuur, 600);
        });
        // `blur` stijgt niet op, `focusout` wel -- en die is hier nodig omdat
        // het veld pas in `paint()` gebouwd wordt.
        this.on(el, "focusout", (e) => {
          if (e.target?.closest?.(".tijd")) stuur();
        });
      }

      const schakelaar = el.querySelector(".toggle");
      if (!schakelaar) return;
      this.teardown_.push(
        bindToggle(schakelaar, {
          value: () => isOn(stateOf(this.hass, item.entity)),
          set: (aan) =>
            this.hass.callService("homeassistant", aan ? "turn_on" : "turn_off", {
              entity_id: item.entity,
            }),
          disabled: () => isDead(stateOf(this.hass, item.entity)),
        })
      );
    });
  }

  paint() {
    this.$$(".it").forEach((el) => {
      const item = this.item_(el.dataset.r, el.dataset.i);
      if (!item) return;

      const st = stateOf(this.hass, item.entity);
      const on = isOn(st);
      // Een plek zonder entiteit is een navigatieknop, geen kapotte entiteit.
      const dead = Boolean(item.entity) && isDead(st);

      el.dataset.on = String(on);
      el.classList.toggle("unavailable", dead);

      const tone = this.tone_(item);
      el.style.setProperty("--tone", tone);

      const name = nameOf(this.hass, item.entity, item.name);

      // Zelf gekozen icoon wint. Anders de eigen afbeelding van de entiteit,
      // en pas als die er niet is het icoon van het domein.
      const chip = el.querySelector(".chip");
      if (chip) {
        const pic = pictureOf(this.hass, item.entity, item.icon);
        const wanted =
          item.icon || (pic ? `pic:${pic}` : defaultIcon(item.entity, attrsOf(this.hass, item.entity)));
        if (chip.dataset.icon !== wanted) {
          chip.dataset.icon = wanted;
          chip.classList.toggle("pic", Boolean(pic));
          chip.innerHTML = pic
            ? `<img src="${pic}" alt="" loading="lazy" />`
            : resolve(item.icon || defaultIcon(item.entity, attrsOf(this.hass, item.entity)));
        }
        // Een afbeelding heeft de kleur van zichzelf; alleen een icoon kleurt mee.
        chip.style.setProperty("--tone", pic ? "var(--dac-ink-3)" : on ? tone : "var(--dac-ink-3)");
        chip.setAttribute("aria-label", item.entity ? `${name} schakelen` : "Icoon");
      }

      const nmEl = el.querySelector(".nm");
      if (nmEl) this.text(nmEl, name);

      const schakelaar = el.querySelector(".toggle");
      if (schakelaar) {
        setToggle(schakelaar, on);
        schakelaar.style.setProperty("--tone", tone);
        schakelaar.setAttribute("aria-label", `${name} aan of uit`);
      }

      // Het veld wordt pas gebouwd als bekend is wat erin moet: een klok, een
      // kalender of allebei. Dat staat in de attributen, en die zijn er pas met
      // een `hass` -- vandaar hier en niet in `template()`.
      const tijdslot = el.querySelector(".tijdslot");
      let tijdveld = null;
      if (tijdslot) {
        const soort = dead ? null : tijdSoort(st);
        if (tijdslot.dataset.soort !== (soort ?? "")) {
          tijdslot.dataset.soort = soort ?? "";
          tijdslot.innerHTML = soort
            ? `<input class="tijd" type="${soort}" step="60" />`
            : "";
        }
        tijdveld = tijdslot.querySelector(".tijd");
      }
      if (tijdveld) {
        tijdveld.setAttribute("aria-label", `${name} instellen`);
        // Niet schrijven terwijl iemand in het veld staat: dan springt de
        // cursor weg bij elke toestandswijziging in huis.
        if (this.shadowRoot.activeElement !== tijdveld) {
          const waarde = veldWaarde(st, tijdslot.dataset.soort);
          if (tijdveld.value !== waarde) tijdveld.value = waarde;
        }
      }

      const stEl = el.querySelector(".st");
      const toon = item.show_state ?? this.config.show_state;
      // Waar een schakelaar of een tijdveld staat zegt de control al wat de
      // tekst zou zeggen.
      if (schakelaar || tijdveld) {
        stEl.textContent = "";
      } else if (toon === false) {
        stEl.textContent = "";
      } else if (dead) {
        stEl.textContent = "Niet bereikbaar";
      } else if (!st || isStateless(st.entity_id)) {
        stEl.textContent = "";
      } else if (domainOf(st.entity_id) === "light" && on && st.attributes.brightness != null) {
        stEl.textContent = `${Math.round((st.attributes.brightness / 255) * 100)}%`;
      } else {
        const unit = st.attributes.unit_of_measurement;
        stEl.textContent = unit ? `${st.state} ${unit}` : localizeState(this.hass, st);
      }

      el.setAttribute("aria-label", `${name}${st ? `, ${localizeState(this.hass, st)}` : ""}`);
    });
  }

  getCardSize() {
    return rowsFor(kaartHoogte(this.config));
  }

  getGridOptions() {
    const rows = rowsFor(kaartHoogte(this.config));
    return { columns: 12, rows, min_columns: 4, min_rows: rows, max_rows: rows };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-entities-card-editor");
  }

  /**
   * Een verse kaart wijst nergens naar.
   *
   * Er stonden twee willekeurige entiteiten in, en dat las als een kaart die al
   * iets doet terwijl er niets gekozen was -- je moest eerst opruimen voordat je
   * kon beginnen. Nu opent de editor met een knop: rij toevoegen.
   */
  static getStubConfig() {
    return { rows: [] };
  }
}

registerCard("domotiapp-entities-card", EntitiesCard, {
  name: "DomotiApp Entiteiten",
  description:
    "Entiteiten in rijen, elk met een eigen kolomindeling en vorm: regel, tegel of compacte pil. Ook voor een losse knop.",
});
