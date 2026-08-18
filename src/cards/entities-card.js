/**
 * Een lijst entiteiten, ingedeeld in rijen die je zelf samenstelt.
 *
 * De eerste opzet had één lijst en één kolomaantal voor de hele kaart, en dat
 * viel uit elkaar zodra je twee korte namen naast elkaar wilde met daaronder één
 * lange. Nu is een rij de eenheid: elke rij heeft zijn eigen kolomaantal en zijn
 * eigen entiteiten, en per entiteit stel je naam, icoon, tikgedrag en het al dan
 * niet tonen van de toestand in.
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
 * Het icoon en de regel zijn twee knoppen, net als op de knopkaart. Op het icoon
 * tikken schakelt, op de regel tikken doet wat jij instelt -- meestal openen of
 * navigeren. Dat is het verschil tussen een lijst die je kunt bedienen en een
 * lijst waar je alleen naar kunt kijken.
 */

import { DacCard, registerCard, registerEditor, rowsFor, toneValue, TONES, INCOMPLETE } from "../base.js";
import { resolve, defaultIcon } from "../icons.js";
import "../editor/entities-editor.js";
import {
  attrsOf,
  bindActions,
  defaultTapAction,
  domainOf,
  isDead,
  isOn,
  isStateless,
  lightTone,
  localizeState,
  nameOf,
  pictureOf,
  runAction,
  stateOf,
} from "../ha.js";

const ITEM_H = 44;
const GAP = 6;

/** Eén item mag een string zijn, of een object met alles erop. */
const asItem = (i) => (typeof i === "string" ? { entity: i } : { ...i });

/**
 * Breng elke configvorm terug tot rijen.
 *
 * De oude vorm -- één `items`- of `entities`-lijst met één `columns` -- blijft
 * werken en wordt één rij. Dashboards die al draaien hoeven niet aangepast.
 */
export function toRows(config) {
  if (Array.isArray(config.rows) && config.rows.length) {
    return config.rows.map((r) => ({
      columns: Math.min(Math.max(1, Number(r.columns) || 2), 3),
      items: (r.items ?? r.entities ?? []).map(asItem),
    }));
  }
  const flat = (config.items ?? config.entities ?? []).map(asItem);
  if (!flat.length) return [];
  return [{ columns: Math.min(Math.max(1, Number(config.columns) || 2), 3), items: flat }];
}

class EntitiesCard extends DacCard {
  static css = /* css */ `
    :host { display: block; height: 100%; }

    /* 5px boven en onder plus 44px per regel plus de rand van 2 komt precies op
       56 uit: één rasterrij, dezelfde hoogte als een Mushroom-kaart ernaast. */
    .card {
      height: 100%; min-height: 56px; padding: 5px 10px;
      display: flex; flex-direction: column; justify-content: center; gap: ${GAP}px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

    .row {
      display: grid; gap: ${GAP}px;
      grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
    }

    .it {
      display: flex; align-items: center; gap: 10px;
      min-height: ${ITEM_H}px; padding: 2px 6px 2px 2px;
      background: none; border: 0; border-radius: var(--dac-radius-sm);
      font: inherit; color: inherit; text-align: left; cursor: pointer;
      transition: background 200ms ease;
    }
    .it:hover { background: var(--dac-surface); }

    .chip {
      width: 36px; height: 36px; flex: 0 0 auto; cursor: pointer;
      transition: color 200ms ease, background 200ms ease,
                  border-color 200ms ease, box-shadow 200ms ease;
    }
    .chip .icon, .chip ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }
    .it[data-on="true"] .chip {
      box-shadow: 0 0 12px -3px color-mix(in srgb, var(--tone) 55%, transparent);
    }

    .txt { min-width: 0; display: flex; flex-direction: column; }
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

    .it.unavailable { opacity: .42; pointer-events: none; }

    /* Onder de 260px passen twee namen niet meer naast elkaar zonder te
       verminken, dus dan gaat elke rij terug naar één kolom. */
    @container (max-width: 260px) {
      .row { grid-template-columns: 1fr; }
    }
  `;

  validate(config) {
    const rows = toRows(config);
    if (!rows.some((r) => r.items.length)) {
      return { ...config, [INCOMPLETE]: "Voeg een rij toe en kies daar entiteiten in." };
    }
    return { show_state: true, ...config, rows };
  }

  watched() {
    return this.config.rows.flatMap((r) => r.items.map((i) => i.entity));
  }

  item_(r, i) {
    return this.config.rows[+r]?.items[+i];
  }

  /** Eén lamp draagt zijn eigen kleur, een groep niet. Zie `lightTone` in ha.js. */
  tone_(item) {
    if (item.tone) return toneValue(item.tone);
    if (this.config.tone) return toneValue(this.config.tone);
    if (domainOf(item.entity) !== "light") return TONES.accent;
    return lightTone(stateOf(this.hass, item.entity)) ?? TONES.lit;
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    this.style.containerType = "inline-size";

    const rows = c.rows
      .map(
        (row, r) => `
      <div class="row" style="--cols:${row.columns}">
        ${row.items
          .map(
            (_, i) => `
          <div class="it" role="button" tabindex="0" data-r="${r}" data-i="${i}">
            <span class="chip" role="button" tabindex="0"></span>
            <span class="txt"><span class="nm"></span><span class="st"></span></span>
          </div>`
          )
          .join("")}
      </div>`
      )
      .join("");

    return `<div class="card surface">${rows}</div>`;
  }

  wire() {
    this.$$(".it").forEach((el) => {
      const item = this.item_(el.dataset.r, el.dataset.i);
      if (!item) return;
      const fire = (which, fallback) =>
        runAction(this, this.hass, item, item[which] ?? fallback);

      // De regel opent, het icoon schakelt -- dezelfde verdeling als op de
      // knopkaart, zodat een dashboard één gewoonte heeft in plaats van twee.
      this.teardown_.push(
        bindActions(el, {
          onTap: () => fire("tap_action", { action: "more-info" }),
          onHold: () => fire("hold_action", { action: "more-info" }),
        })
      );

      const chip = el.querySelector(".chip");
      this.teardown_.push(
        bindActions(chip, {
          onTap: () => fire("icon_tap_action", defaultTapAction(item.entity)),
          onHold: () => fire("icon_hold_action", { action: "more-info" }),
        })
      );
      // Anders telt een tik op het icoon ook als een tik op de regel.
      this.on(chip, "click", (e) => e.stopPropagation());
      this.on(chip, "pointerdown", (e) => e.stopPropagation());
    });
  }

  paint() {
    this.$$(".it").forEach((el) => {
      const item = this.item_(el.dataset.r, el.dataset.i);
      if (!item) return;

      const st = stateOf(this.hass, item.entity);
      const on = isOn(st);
      const dead = isDead(st);

      el.dataset.on = String(on);
      el.classList.toggle("unavailable", dead);

      const tone = this.tone_(item);
      el.style.setProperty("--tone", tone);

      // Zelf gekozen icoon wint. Anders de eigen afbeelding van de entiteit,
      // en pas als die er niet is het icoon van het domein.
      const chip = el.querySelector(".chip");
      const pic = pictureOf(this.hass, item.entity, item.icon);
      const wanted = item.icon || (pic ? `pic:${pic}` : defaultIcon(item.entity, attrsOf(this.hass, item.entity)));
      if (chip.dataset.icon !== wanted) {
        chip.dataset.icon = wanted;
        chip.classList.toggle("pic", Boolean(pic));
        chip.innerHTML = pic
          ? `<img src="${pic}" alt="" loading="lazy" />`
          : resolve(item.icon || defaultIcon(item.entity, attrsOf(this.hass, item.entity)));
      }
      // Een afbeelding heeft de kleur van zichzelf; alleen een icoon kleurt mee.
      chip.style.setProperty("--tone", pic ? "var(--dac-ink-3)" : on ? tone : "var(--dac-ink-3)");

      const name = nameOf(this.hass, item.entity, item.name);
      this.text(el.querySelector(".nm"), name);
      chip.setAttribute("aria-label", `${name} schakelen`);

      const stEl = el.querySelector(".st");
      const toon = item.show_state ?? this.config.show_state;
      if (toon === false) {
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

  lines_() {
    return (this.config?.rows ?? []).reduce(
      (n, r) => n + Math.ceil((r.items.length || 1) / r.columns),
      0
    );
  }

  getCardSize() {
    return Math.max(1, this.lines_());
  }

  getGridOptions() {
    const lines = Math.max(1, this.lines_());
    const rows = rowsFor(12 + lines * ITEM_H + (lines - 1) * GAP);
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
   * kon beginnen. Nu opent de editor met één knop: rij toevoegen.
   */
  static getStubConfig() {
    return { rows: [] };
  }
}

registerCard("domotiapp-entities-card", EntitiesCard, {
  name: "DomotiApp Entiteiten",
  description: "Rijen entiteiten, elk met een eigen kolomindeling.",
});
