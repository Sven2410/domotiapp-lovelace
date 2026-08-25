/**
 * De navbalk: een vaste rij knoppen onderaan het scherm, met een meer-menu
 * voor wat er in de breedte niet bij past.
 *
 * WAAROM DEZE KAART ANDERS IS DAN DE REST VAN DE FAMILIE
 *
 * Elke andere kaart hier valt netjes op een rasterrij en scrollt mee. Deze
 * niet, en dat is het hele punt: navigatie die wegscrollt is geen navigatie.
 * De balk staat vast onderaan het scherm -- op de telefoon van rand tot rand,
 * op een breed scherm als een gecentreerde pil -- en blijft staan waar je ook
 * bent op de pagina.
 *
 * Dat botst met het rooster van Home Assistant. De kaart zit in een view, dus
 * hij krijgt daar een vak toegewezen, en dat vak zou als gat achterblijven
 * terwijl de balk er zwevend overheen staat. Daarom zet de kaart zijn eigen
 * `hui-card` buiten de rasterstroom (`position: absolute`, nul bij nul) zodra
 * hij op een echt dashboard staat. Twee dingen daarbij, allebei met opzet:
 *
 *   - `display: none` zou hetzelfde gat oplossen en de balk mee weghalen: de
 *     balk zit in de shadow root van deze kaart, en een verborgen voorouder
 *     verbergt ook wat vast gepositioneerd is. Vandaar `absolute` en niet
 *     `none`.
 *   - In de BEWERKMODUS en in de voorbeeldweergave van de kaarteditor gebeurt
 *     dit niet. Daar moet je de kaart kunnen aanklikken, slepen en zien, en dan
 *     tekent hij zich gewoon als een kaart in zijn vak.
 *
 * En de view krijgt onderaan ruimte bij, precies zo hoog als de balk. Zonder dat
 * ligt de balk over de laatste kaart heen en is die niet meer te bedienen --
 * wat je pas merkt als je hem nodig hebt.
 *
 * WAT DEZE KAART NIET DOET
 *
 * Geen badges, geen entiteiten, geen actie bij vasthouden, en geen knop die
 * oplicht omdat je op die pagina staat. Dat is een keuze van de eigenaar
 * (25 augustus 2026): een naam, een icoon en een pad, en verder niets. Elk van
 * die drie is er los in te zetten zodra hij het mist; ze zijn er nu niet omdat
 * een navbalk die tien instellingen heeft geen navbalk meer is.
 */

import { DacCard, INCOMPLETE, registerCard, toneValue } from "../base.js";
import "../editor/navbar-editor.js";
import { icons, resolve } from "../icons.js";
import { runAction } from "../ha.js";
import { actieVoor, BALK_MAX, BALK_MIN, itemsVan, klemBalk, verdeel } from "./navbar-logica.js";

/* ------------------------------------------------------- waar we in zitten */

/** Eén stap omhoog, dwars door shadow roots heen. */
const omhoog = (knoop) =>
  knoop.parentElement ?? (knoop.parentNode && knoop.parentNode.host) ?? null;

/**
 * Elke voorouder, van hier tot aan het document.
 *
 * Een eigen deep-query dóór shadow roots heen is hier expres vermeden -- die
 * heeft in dit project al twee keer ten onrechte "niets gevonden" opgeleverd
 * (zie CLAUDE.md, valkuil 10). Omhoog lopen is een andere beweging: er is maar
 * één weg, en elke stap is te controleren.
 */
function* voorouders(start) {
  let knoop = omhoog(start);
  let stappen = 0;
  while (knoop && stappen++ < 40) {
    yield knoop;
    knoop = omhoog(knoop);
  }
}

/**
 * Staat deze kaart in een editor of in een voorbeeld?
 *
 * Op de tagnaam en niet op een eigenschap: Home Assistant hernoemt zijn
 * wrappers vaker dan het van vorm verandert, en elke wrapper die met bewerken
 * of voorbeeld te maken heeft heeft dat woord in zijn naam staan --
 * `hui-card-preview`, `hui-dialog-edit-card`, `hui-card-edit-mode`.
 */
function inBewerker(el) {
  for (const v of voorouders(el)) {
    const tag = v.tagName?.toLowerCase?.() ?? "";
    if (/(^|-)(edit|preview)/.test(tag)) return true;
  }
  return false;
}

/** Het vak dat Home Assistant aan deze kaart gaf, of null. */
function vakVan(el) {
  for (const v of voorouders(el)) {
    if (v.tagName?.toLowerCase?.() === "hui-card") return v;
  }
  return null;
}

/** De view waar deze kaart in staat, zodat er onderaan ruimte bij kan. */
function viewVan(el) {
  for (const v of voorouders(el)) {
    const tag = v.tagName?.toLowerCase?.() ?? "";
    if (tag === "hui-view" || tag.endsWith("-view")) return v;
  }
  return null;
}

/* --------------------------------------------------------------- de kaart */

class NavbarCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }

    /* ------------------------------------------------------------ de balk */

    .balk {
      position: fixed;
      z-index: 5;
      left: 8px; right: 8px;
      bottom: calc(10px + env(safe-area-inset-bottom, 0px));

      display: flex; align-items: center; justify-content: center;
      gap: 2px;
      padding: 5px;

      background: color-mix(in srgb, var(--dac-bg-raise) 88%, transparent);
      border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
      box-shadow: 0 20px 44px -20px rgba(0, 0, 0, .92),
                  0 1px 0 rgba(255, 255, 255, .04) inset;
      /* Achter een halfdoorzichtige balk hoort iets te bewegen, anders is hij
         gewoon donkergrijs. Valt vanzelf weg waar de browser het niet kan. */
      backdrop-filter: blur(16px) saturate(140%);
      -webkit-backdrop-filter: blur(16px) saturate(140%);
    }

    /* Vanaf een tablet is randbreed te breed: dan wordt het een pil die zo
       breed is als zijn knoppen, gecentreerd onderaan. */
    @media (min-width: 620px) {
      .balk {
        /* --dac-nav-mid wordt gemeten en gezet in plaats_(): het midden van de
           VIEW, niet van het venster. De zijbalk van Home Assistant hoort niet
           bij de pagina, en een pil die daar overheen gecentreerd staat, staat
           scheef boven de kaarten. Valt terug op het venstermidden zolang er
           nog niets gemeten is. */
        left: var(--dac-nav-mid, 50vw); right: auto;
        transform: translateX(-50%);
        width: max-content; max-width: calc(100vw - 32px);
        bottom: calc(16px + env(safe-area-inset-bottom, 0px));
      }
    }

    :host([bare]) .balk {
      background: none; border: 0; box-shadow: none;
      backdrop-filter: none; -webkit-backdrop-filter: none;
    }

    /* In de bewerkmodus en in het voorbeeld staat de balk gewoon in zijn vak,
       zodat je hem kunt aanklikken en slepen. */
    :host([in-editor]) .balk {
      position: relative; inset: auto; transform: none;
      width: 100%; max-width: none; bottom: auto;
      backdrop-filter: none; -webkit-backdrop-filter: none;
    }

    /* ---------------------------------------------------------- de knoppen */

    .knop {
      flex: 1 1 0; min-width: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 2px;
      padding: 7px 6px;
      border: 0; border-radius: var(--dac-radius-pill);
      background: none; cursor: pointer;
      font: inherit; color: var(--dac-ink-2);
      -webkit-tap-highlight-color: transparent;
      transition: background 160ms ease, color 160ms ease;
    }
    @media (min-width: 620px) {
      .knop { flex: 0 0 auto; min-width: 66px; }
    }
    .knop:hover { background: var(--dac-surface); color: var(--dac-ink); }
    .knop:active { transform: scale(.96); }
    .knop[aria-expanded="true"] { background: var(--dac-surface-hi); color: var(--tone); }

    /* Bewust GEEN .chip: die klasse staat in theme.js en tekent een gevulde
       cirkel met een rand in de accentkleur. Dat is de vorm van een tegel, niet
       van een navigatieknop -- vier ringen naast elkaar leest als vier knoppen
       die aanstaan. Hier is het icoon zelf de knop. */
    .knop .ico { display: flex; color: var(--dac-ink); }
    .knop:hover .ico { color: var(--tone); }
    .knop .icon, .knop ha-icon {
      width: 22px; height: 22px; --mdc-icon-size: 22px;
    }

    .knop .naam {
      max-width: 100%;
      font-size: 10.5px; font-weight: 500; line-height: 1.1; letter-spacing: -.01em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    /* Zonder namen is het een rij iconen en mag de knop compacter. */
    :host([geen-namen]) .knop { padding: 9px 10px; }
    :host([geen-namen]) .knop .naam { display: none; }

    /* -------------------------------------------------------- het meer-menu */

    .menu {
      position: absolute;
      right: 4px; bottom: calc(100% + 10px);
      min-width: 190px; max-width: min(280px, calc(100vw - 32px));
      max-height: min(60vh, 420px); overflow-y: auto;

      display: none; flex-direction: column; gap: 2px;
      padding: 6px;

      background: color-mix(in srgb, var(--dac-bg-raise) 96%, transparent);
      border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius);
      box-shadow: 0 24px 52px -20px rgba(0, 0, 0, .94);
      backdrop-filter: blur(16px) saturate(140%);
      -webkit-backdrop-filter: blur(16px) saturate(140%);
    }
    :host([menu-open]) .menu {
      display: flex;
      animation: opkomen 160ms ease-out;
    }
    @keyframes opkomen {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      :host([menu-open]) .menu { animation: none; }
    }

    .regel {
      display: flex; align-items: center; gap: 11px;
      width: 100%; padding: 9px 10px;
      border: 0; border-radius: var(--dac-radius-sm);
      background: none; cursor: pointer; text-align: left;
      font: inherit; font-size: 13.5px; color: var(--dac-ink);
      -webkit-tap-highlight-color: transparent;
    }
    .regel:hover { background: var(--dac-surface); }
    .regel:active { background: var(--dac-surface-hi); }
    .regel .mi { display: flex; flex: 0 0 auto; color: var(--dac-ink); }
    .regel .icon, .regel ha-icon {
      width: 19px; height: 19px; --mdc-icon-size: 19px;
    }
    .regel .mt { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    :focus-visible { outline: 2px solid var(--tone); outline-offset: 2px; }
  `;

  validate(config) {
    const items = itemsVan(config);
    const c = {
      labels: true,
      tone: "accent",
      ...config,
      items,
      max: klemBalk(config?.max),
    };
    if (!items.filter((i) => i.name || i.icon || i.path).length) {
      c[INCOMPLETE] = "Voeg knoppen toe in de editor: een naam, een icoon en waar hij heen gaat.";
    }
    return c;
  }

  /** Geen entiteiten: deze kaart hoeft nooit opnieuw getekend te worden. */
  watched() {
    return [];
  }

  template() {
    const c = this.config;
    if (c.labels === false) this.setAttribute("geen-namen", "");
    if (c.bare) this.setAttribute("bare", "");

    const { balk, meer, heeftMeer } = verdeel(c.items, c.max);

    const knop = (item, index) => `
      <button type="button" class="knop" data-i="${index}" title="${escape_(item.name)}">
        <span class="ico">${resolve(item.icon, "grid")}</span>
        <span class="naam">${escape_(item.name)}</span>
      </button>`;

    const regel = (item, index) => `
      <button type="button" class="regel" data-i="${index}">
        <span class="mi">${resolve(item.icon, "grid")}</span>
        <span class="mt">${escape_(item.name || item.path)}</span>
      </button>`;

    // De index is die van de VOLLEDIGE lijst, niet van de deellijst: dan hoeft
    // een tik niet uit te zoeken waar hij vandaan komt.
    const vol = c.items.filter((i) => i.name || i.icon || i.path);

    return `
      <div class="balk" style="--tone:${toneValue(c.tone)}">
        ${balk.map((item) => knop(item, vol.indexOf(item))).join("")}
        ${
          heeftMeer
            ? `<button type="button" class="knop meer" aria-expanded="false" aria-haspopup="true">
                 <span class="ico">${icons.dots}</span>
                 <span class="naam">Meer</span>
               </button>`
            : ""
        }
        <div class="menu" role="menu">
          ${meer.map((item) => regel(item, vol.indexOf(item))).join("")}
        </div>
      </div>`;
  }

  wire() {
    for (const el of this.$$(".knop[data-i], .regel[data-i]")) {
      this.on(el, "click", () => {
        this.sluitMenu_();
        this.ga_(Number(el.dataset.i));
      });
    }

    const meer = this.$(".meer");
    if (meer) {
      this.on(meer, "click", (e) => {
        e.stopPropagation();
        this.wisselMenu_();
      });
    }

    // Buiten het menu tikken sluit het. Op `window` en in de capture-fase,
    // want een dashboard zit vol lagen die een klik onderweg opeten; en op
    // `composedPath`, want de balk zit in een shadow root en `e.target` wijst
    // dan naar de host in plaats van naar de knop.
    this.on(
      window,
      "pointerdown",
      (e) => {
        if (!this.hasAttribute("menu-open")) return;
        const pad = e.composedPath?.() ?? [];
        if (pad.includes(this.$(".menu")) || pad.includes(this.$(".meer"))) return;
        this.sluitMenu_();
      },
      true
    );

    this.on(window, "keydown", (e) => {
      if (e.key === "Escape" && this.hasAttribute("menu-open")) this.sluitMenu_();
    });

    // Een view-wissel hoort het menu te sluiten: anders sta je op de nieuwe
    // pagina met het menu van de vorige nog open.
    this.on(window, "location-changed", () => this.sluitMenu_());
  }

  paint() {
    // Niets te schilderen: deze kaart leest geen enkele entiteit. De methode
    // staat er zodat duidelijk is dat dat een keuze is en geen vergeten stap.
  }

  /* ------------------------------------------------------------- gedrag */

  ga_(index) {
    const item = this.config.items.filter((i) => i.name || i.icon || i.path)[index];
    if (!item) return;
    runAction(this, this.hass, {}, actieVoor(item.path));
  }

  wisselMenu_() {
    const open = this.toggleAttribute("menu-open");
    this.$(".meer")?.setAttribute("aria-expanded", String(open));
  }

  sluitMenu_() {
    if (!this.hasAttribute("menu-open")) return;
    this.removeAttribute("menu-open");
    this.$(".meer")?.setAttribute("aria-expanded", "false");
  }

  /* ------------------------------------------ uit het rooster, en weer terug */

  connectedCallback() {
    super.connectedCallback();
    // Pas ná de opbouw: `inBewerker` leest voorouders, en die zijn er in
    // dezelfde tik waarin de kaart wordt aangehangen soms nog niet allemaal.
    requestAnimationFrame(() => this.plaats_());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.herstel_();
  }

  plaats_() {
    if (!this.isConnected || !this.config) return;

    if (inBewerker(this)) {
      this.setAttribute("in-editor", "");
      return;
    }
    this.removeAttribute("in-editor");

    // Het vak uit de rasterstroom halen. Niet verbergen: een verborgen
    // voorouder verbergt ook wat vast gepositioneerd is, en dan is de balk weg.
    const vak = vakVan(this);
    if (vak && !this.vakStijl_) {
      this.vak_ = vak;
      this.vakStijl_ = vak.getAttribute("style") ?? "";
      vak.style.position = "absolute";
      vak.style.width = "0";
      vak.style.height = "0";
      vak.style.margin = "0";
      vak.style.padding = "0";
      vak.style.overflow = "visible";
      // GEEN pointer-events: none hier. Dat stond er wel, en het maakte de hele
      // balk onklikbaar: pointer-events erft door, en de balk is een afstammeling
      // van dit vak ook al staat hij ergens anders op het scherm. Gemeten met een
      // hit-test op het klikpunt -- die kwam uit op de view eronder in plaats van
      // op de knop. Het vak is nul bij nul, dus het vangt uit zichzelf niets af.
    }

    // Ruimte onderaan de view, zodat de balk niet over de laatste kaart ligt.
    const view = viewVan(this);
    const balk = this.$(".balk");
    if (view && balk && !this.viewStijl_) {
      this.view_ = view;
      this.viewStijl_ = view.style.paddingBottom ?? "";
      const hoog = Math.round(balk.getBoundingClientRect().height) || 62;
      view.style.paddingBottom = `${hoog + 32}px`;
    }

    this.meetMidden_();
    // De zijbalk van Home Assistant klapt in en uit, en dan verschuift het
    // midden van de inhoud. Een eenmalige meting zou daarna liegen.
    if (view && !this.waarnemer_) {
      this.waarnemer_ = new ResizeObserver(() => this.meetMidden_());
      this.waarnemer_.observe(view);
    }
  }

  /** Het midden van de view, als CSS-variabele voor de vaste balk. */
  meetMidden_() {
    const view = this.view_ ?? viewVan(this);
    if (!view) return;
    const r = view.getBoundingClientRect();
    if (!r.width) return;
    this.style.setProperty("--dac-nav-mid", `${Math.round(r.left + r.width / 2)}px`);
  }

  herstel_() {
    this.waarnemer_?.disconnect();
    this.waarnemer_ = null;
    if (this.vak_) {
      if (this.vakStijl_) this.vak_.setAttribute("style", this.vakStijl_);
      else this.vak_.removeAttribute("style");
      this.vak_ = null;
      this.vakStijl_ = null;
    }
    if (this.view_) {
      this.view_.style.paddingBottom = this.viewStijl_ || "";
      this.view_ = null;
      this.viewStijl_ = null;
    }
  }

  /* ------------------------------------------------- Lovelace-afspraken */

  getCardSize() {
    return 1;
  }

  /**
   * Eén rij, en die telt alleen in de bewerkmodus.
   *
   * Op een echt dashboard staat het vak buiten de rasterstroom, dus dit getal
   * bepaalt daar niets. In de bewerkmodus wél, en daar hoort de balk precies
   * één rij te zijn, net als elke andere regelkaart.
   */
  getGridOptions() {
    return { columns: "full", rows: 1, min_rows: 1, max_rows: 1 };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-navbar-card-editor");
  }

  static getStubConfig() {
    return {
      items: [
        { name: "Thuis", icon: "house", path: "" },
        { name: "Licht", icon: "bulb", path: "" },
        { name: "Media", icon: "music", path: "" },
        { name: "Instellingen", icon: "cog", path: "" },
      ],
      max: 4,
      labels: true,
    };
  }
}

/** Tekst uit een config gaat via innerHTML naar het scherm. */
const escape_ = (tekst) =>
  String(tekst ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

registerCard("domotiapp-navbar-card", NavbarCard, {
  name: "DomotiApp Navbalk",
  description: `Vaste navigatiebalk onderaan het scherm, met een meer-menu voor wat er in de breedte niet bij past. ${BALK_MIN} tot ${BALK_MAX} knoppen in de balk.`,
});

export { NavbarCard };
