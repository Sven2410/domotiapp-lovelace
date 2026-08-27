/**
 * Tabbladen: één plek op het dashboard waar meerdere kaarten achter elkaar
 * wonen, met een rij knoppen erboven om te wisselen.
 *
 * De eigenaar gebruikte hiervoor `custom:simple-tabs` in zijn bubble-pop-ups.
 * Dit is dezelfde functie in de vormtaal van de familie, met de configvorm van
 * simple-tabs erin gehouden (`title` en `card` werken naast `name` en `cards`),
 * zodat een bestaande config over te zetten is zonder hem te herschrijven.
 *
 * DE EIS DIE DE VORM BEPAALT: DE KEUZE HOORT BIJ HET APPARAAT
 *
 * Wisselt hij op zijn telefoon van Woning naar Weer, dan mag de tablet in de
 * gang op Woning blijven staan. Dat sluit alles uit wat server-side is. De
 * keuze staat daarom in `localStorage`, onder een sleutel die uit de namen van
 * de tabs wordt afgeleid -- er is dus niets in te stellen, en dat was de tweede
 * eis. Het hele verhaal staat in `tabs-logica.js`.
 *
 * WAAROM DE KINDKAARTEN LUI GEBOUWD WORDEN
 *
 * Een tabbladenkaart met zes tabs is zes kaarten die je bijna nooit ziet. Ze
 * allemaal bouwen bij het openen van een pop-up kost tijd op een wandtablet, en
 * elke kaart abonneert zich op zijn eigen entiteiten. Een tab wordt daarom
 * gebouwd bij zijn eerste bezoek en daarna bewaard: wisselen blijft dan gratis,
 * en wat je nooit opent kost niets.
 *
 * WAAROM `set hass` HIER OVERSCHREVEN IS
 *
 * `DacCard` roept `paint()` alleen aan als een entiteit uit `watched()` is
 * veranderd. Deze kaart heeft zelf geen entiteiten -- maar zijn KINDEREN wel, en
 * die moeten elke nieuwe `hass` krijgen. Zonder deze overschrijving staat er een
 * tabbladenkaart met kaarten erin die nooit meer bijwerken, en dat is precies
 * het soort fout dat je pas ziet als er iets in huis verandert.
 */

import { DacCard, INCOMPLETE, escapeHtml, registerCard, toneValue } from "../base.js";
import "../editor/tabs-editor.js";
import { resolve } from "../icons.js";
import { meetRaster, volgRaster } from "../rasterhoogte.js";
import { heeftHaGereedschap, kaartenLijst } from "../editor/kaartenlijst.js";
import { openTab, schrijfKeuze, sleutelVoor, tabsVan } from "./tabs-logica.js";
import { KOLOMMEN, grenzenVan, pasIndelingToe } from "./tab-indeling.js";

/** Eén stap omhoog, dwars door shadow roots heen. */
const omhoog = (knoop) =>
  knoop.parentElement ?? (knoop.parentNode && knoop.parentNode.host) ?? null;

/** Elke voorouder, van hier tot aan het document. */
function* voorouders(start) {
  let knoop = omhoog(start);
  let stappen = 0;
  while (knoop && stappen++ < 40) {
    yield knoop;
    knoop = omhoog(knoop);
  }
}

/**
 * De editor die bij dit voorbeeld hoort, of null.
 *
 * DE KANT WAAROP DEZE VERWIJZING LOOPT IS EEN KEUZE
 *
 * Het ligt voor de hand dat de EDITOR zich meldt bij het voorbeeld. Dat gaat
 * mis op de volgorde: Home Assistant bouwt het voorbeeld en de editor los van
 * elkaar, en wie er eerst is verschilt per keer. Andersom is er geen race: de
 * kaart zoekt pas als hij aan het tekenen is, en dan staat de editor er.
 *
 * Er wordt alleen BINNEN de eigen bewerkdialoog gezocht, niet in het hele
 * document. Twee dialogen tegelijk bestaan niet, maar een dashboard vol
 * tabbladenkaarten wel -- en dan zou een zoektocht door alles de verkeerde
 * editor kunnen vinden.
 */
function bewerkerVan(kaart) {
  let dialoog = null;
  for (const v of voorouders(kaart)) {
    const tag = v.tagName?.toLowerCase?.() ?? "";
    if (tag === "hui-dialog-edit-card") {
      dialoog = v;
      break;
    }
  }
  if (!dialoog) return null;

  const zoek = (knoop, diepte = 0) => {
    if (!knoop || diepte > 25) return null;
    if (knoop.tagName?.toLowerCase?.() === "domotiapp-tabs-card-editor") return knoop;
    for (const k of knoop.children ?? []) {
      const t = zoek(k, diepte + 1);
      if (t) return t;
    }
    if (knoop.shadowRoot) {
      for (const k of knoop.shadowRoot.children) {
        const t = zoek(k, diepte + 1);
        if (t) return t;
      }
    }
    return null;
  };
  return zoek(dialoog);
}

class TabsCard extends DacCard {
  static css = /* css */ `
    :host { display: block; }

    .card {
      min-height: var(--dac-raster, 56px);
      padding: 8px;
      display: flex; flex-direction: column; gap: 10px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ------------------------------------------------------------ de rij */

    .balk {
      flex: 0 0 auto;
      display: flex; align-items: center; gap: 3px;
      padding: 3px;
      background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
      /* Meer tabs dan er passen schuiven in plaats van af te breken: een tweede
         regel knoppen verandert de hoogte van de kaart bij elke wissel. */
      overflow-x: auto; scrollbar-width: none;
    }
    .balk::-webkit-scrollbar { display: none; }
    :host([uitgelijnd="links"]) .balk { justify-content: flex-start; }
    :host([uitgelijnd="rechts"]) .balk { justify-content: flex-end; }

    .tab {
      flex: 1 1 0; min-width: 0;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 8px 12px;
      border: 0; border-radius: var(--dac-radius-pill);
      background: none; cursor: pointer;
      font: inherit; font-size: 13px; font-weight: 500; letter-spacing: -.01em;
      color: var(--dac-ink-2);
      white-space: nowrap;
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .tab:hover { color: var(--dac-ink); } }
    /* De actieve tab draagt de kleur. Dat is hier geen statuskleur maar
       navigatie: je moet kunnen zien waar je bent. */
    .tab[aria-selected="true"] {
      background: color-mix(in srgb, var(--tone) 20%, transparent);
      color: var(--tone);
    }
    .tab .ic { display: flex; flex: 0 0 auto; }
    .tab .icon, .tab ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }
    .tab .nm { overflow: hidden; text-overflow: ellipsis; }
    :host([geen-namen]) .tab .nm { display: none; }

    /* --------------------------------------------------------- de inhoud */

    .vakken { flex: 1 1 auto; min-height: 0; display: block; }
    .vak { display: none; }

    /* De kaarten in een tab staan in HETZELFDE raster als in een sectie van
       Home Assistant: twaalf kolommen, 8px ertussen. Dat is wat de schuif
       "Indeling" in de kaartdialoog bedient, en zonder dit raster zou die
       schuif een getal wegschrijven dat niemand leest. Zie tab-indeling.js.

       Een kaart zonder keuze staat op alle twaalf de kolommen, dus een tabblad
       van vóór deze ronde ziet er precies zo uit als eerst. */
    .vak[data-open="true"] {
      display: grid;
      grid-template-columns: repeat(${KOLOMMEN}, minmax(0, 1fr));
      gap: 8px;
      align-content: start;
    }
    .vak > * { grid-column: span ${KOLOMMEN}; }

    /* ---- het gereedschap in het voorbeeld van de kaarteditor ---- */

    /* Ook een raster, en om dezelfde reden: wat je in het voorbeeld ziet moet
       zijn wat er op het dashboard staat. */
    .vak .dac-kaarten {
      display: grid;
      grid-template-columns: repeat(${KOLOMMEN}, minmax(0, 1fr));
      gap: 8px;
      align-content: start;
    }
    .vak .dac-kaart {
      position: relative; user-select: none; -webkit-user-select: none;
      grid-column: span ${KOLOMMEN};
    }

    .voegtoe {
      width: 100%; margin-top: 8px; padding: 13px;
      cursor: pointer; font: inherit; font-size: 14px; font-weight: 500;
      border: 1px dashed var(--dac-border-hi); border-radius: var(--dac-radius-sm);
      background: transparent; color: var(--dac-accent-hi); text-align: center;
    }
    @media (hover: hover) {
      .voegtoe:hover { background: var(--dac-surface); }
    }

    .leeg {
      padding: 14px 4px; text-align: center;
      font-size: 12.5px; color: var(--dac-ink-3);
    }

    :focus-visible { outline: 2px solid var(--tone); outline-offset: 2px; }
  `;

  constructor() {
    super();
    /** De gebouwde kaart per tab-index. Lui gevuld, daarna bewaard. */
    this.kinderen_ = new Map();
    this.open_ = 0;
  }

  validate(config) {
    const tabs = tabsVan(config);
    const c = { tone: "accent", ...config, tabs };
    if (!tabs.length) {
      c[INCOMPLETE] = "Voeg tabbladen toe: elk met een naam, een icoon en een kaart erin.";
    }
    return c;
  }

  /** Geen eigen entiteiten. De kinderen hebben ze, en die krijgen `hass` hieronder. */
  watched() {
    return [];
  }

  /**
   * Een nieuwe config betekent een nieuwe kaartenlijst, dus de cache moet leeg.
   *
   * `DacCard.setConfig` gooit de hele shadow-DOM weg en bouwt opnieuw op. De
   * gebouwde kindkaarten in `kinderen_` hingen in die weggegooide DOM: ze staan
   * nergens meer, maar de Map wist dat niet en `bouw_()` haakte af op
   * `kinderen_.has(i)`. Het gevolg was een tab die na de eerste wijziging in de
   * editor LEEG bleef -- dus ook: een kaart toevoegen die daarna niet
   * verscheen. Gemeld op 26 augustus 2026 met een schermafdruk van een tab die
   * "Deze tab heeft nog geen kaart" bleef zeggen.
   *
   * Op een echt dashboard draait `setConfig` één keer; in de editor bij elke
   * toetsaanslag, en daar is opnieuw bouwen precies de bedoeling.
   */
  setConfig(config) {
    this.kinderen_.clear();
    super.setConfig(config);
  }

  /**
   * Elke nieuwe `hass` moet naar de kinderen, ook als deze kaart zelf niets
   * hoeft te hertekenen. Zie de kop.
   */
  set hass(hass) {
    super.hass = hass;
    // De `null` is de bouw-vlag uit bouw_(): een tab die nog aan het laden is.
    // Zonder deze toets zet de eerste hass een eigenschap op null en valt de hele
    // view om -- gemeten in de echte instance, de kaart bleef leeg.
    //
    // Een tab draagt sinds 26 augustus 2026 een LIJST kaarten, dus dit is een
    // lijst van lijsten.
    for (const kaarten of this.kinderen_.values()) {
      if (!kaarten) continue;
      for (const el of kaarten) if (el) el.hass = hass;
    }
    // Home Assistant vraagt `getGridOptions()` opnieuw bij elke nieuwe `hass`
    // (valkuil 8), en dit raster hoort dat ook te doen: een kaart die van vorm
    // verandert -- een lamp die uitgaat, een thermostaat die "Onder elkaar"
    // wordt gezet -- geeft dan een andere ondergrens op.
    this.herijkIndeling_();
  }

  get hass() {
    return super.hass;
  }

  template() {
    const c = this.config;
    if (c.bare) this.setAttribute("bare", "");
    if (c.show_names === false) this.setAttribute("geen-namen", "");
    if (c.alignment === "links" || c.alignment === "rechts") {
      this.setAttribute("uitgelijnd", c.alignment);
    }

    const knoppen = c.tabs
      .map(
        (tab, i) => `
        <button type="button" class="tab" role="tab" data-i="${i}" aria-selected="false"
                title="${escapeHtml(tab.name)}">
          ${tab.icon ? `<span class="ic">${resolve(tab.icon, "grid")}</span>` : ""}
          <span class="nm">${escapeHtml(tab.name || `Tab ${i + 1}`)}</span>
        </button>`
      )
      .join("");

    const vakken = c.tabs
      .map((_, i) => `<div class="vak" data-i="${i}" role="tabpanel"></div>`)
      .join("");

    return `
      <div class="card surface" style="--tone:${toneValue(c.tone)}">
        <div class="balk" role="tablist">${knoppen}</div>
        <div class="vakken">${vakken}</div>
      </div>`;
  }

  wire() {
    for (const knop of this.$$(".tab")) {
      this.on(knop, "click", () => this.kies_(Number(knop.dataset.i)));
    }
    // De hoogte van deze kaart hangt aan de kaarten erin, en die komen later
    // binnen. Zonder waarnemer blijft de kaart op de hoogte van zijn eerste tab
    // staan, ook als de tweede twee keer zo hoog is.
    this.teardown_.push(volgRaster(this.$(".card")));

    // De onthouden keuze van DIT apparaat, of de standaard.
    this.kies_(openTab(this.config, this.config.tabs, this.opslag_()), false);
  }

  paint() {
    // Niets te schilderen: deze kaart leest geen entiteiten. De kinderen doen
    // dat zelf, en die krijgen hun `hass` via de setter hierboven.
  }

  /** `localStorage`, of niets als de browser hem dichthoudt. */
  opslag_() {
    try {
      return window.localStorage;
    } catch {
      return null;
    }
  }

  kies_(index, onthouden = true) {
    const tabs = this.config.tabs;
    if (!tabs.length) return;
    const i = Math.min(Math.max(0, index), tabs.length - 1);
    this.open_ = i;

    for (const knop of this.$$(".tab")) {
      knop.setAttribute("aria-selected", String(Number(knop.dataset.i) === i));
    }
    for (const vak of this.$$(".vak")) {
      vak.dataset.open = String(Number(vak.dataset.i) === i);
    }

    if (onthouden) schrijfKeuze(this.opslag_(), sleutelVoor(tabs), i);
    this.bouw_(i);
  }

  /**
   * Bouw de kaart van deze tab, als dat nog niet gebeurd is.
   *
   * `loadCardHelpers` is de weg die Home Assistant zelf aanbiedt om een kaart
   * uit een config te maken. Hij is asynchroon, dus tussen de klik en de kaart
   * zit een tel -- vandaar dat het vak al zichtbaar is voordat de inhoud er
   * staat, in plaats van andersom.
   */
  async bouw_(i) {
    if (this.kinderen_.has(i)) {
      meetRaster(this.$(".card"));
      return;
    }
    const vak = this.$(`.vak[data-i="${i}"]`);
    const tab = this.config.tabs[i];
    if (!vak || !tab) return;

    if (!tab.cards.length) {
      const leeg = document.createElement("div");
      leeg.className = "leeg";
      leeg.textContent = "Deze tab heeft nog geen kaart.";
      vak.replaceChildren(leeg);
      meetRaster(this.$(".card"));
      // In het voorbeeld van de editor hoort hier de knop te staan waarmee je er
      // een toevoegt. Zonder die knop verwees de editor ernaast naar iets dat er
      // niet was: "voeg er een toe in het voorbeeld hiernaast", en dan een leeg
      // vak. Gemeld op 26 augustus 2026.
      this.knopLater_(i);
      return;
    }

    // Twee keer tegelijk bouwen kan: twee kliks vlak achter elkaar. De vlag
    // staat er vóór het wachten, zodat de tweede aanroep afhaakt.
    this.kinderen_.set(i, null);
    try {
      const helpers = await window.loadCardHelpers?.();
      if (!helpers) throw new Error("loadCardHelpers ontbreekt");
      // Alle kaarten van deze tab, onder elkaar. Geen `vertical-stack`
      // eromheen: die zou een eigen vlak meebrengen en zijn eigen
      // tussenruimte, en dan staat er een kaart in een kaart in een tab.
      // `hui-card` en niet `createCardElement`: dat is het element waar Home
      // Assistant zelf elke kaart in een sectie in zet, en het is de plek waar
      // ZICHTBAARHEID wordt afgehandeld. Gemeten op 26 augustus 2026 met een
      // voorwaarde die niet klopte: `hidden` werd `true` en de hoogte 0, waar
      // een kale `createCardElement` de kaart gewoon liet staan. Zonder dit
      // schrijft het tabblad Zichtbaarheid iets weg dat niemand leest.
      //
      // In het VOORBEELD van de editor staat `preview` aan, want een kaart die
      // op dit moment verborgen zou zijn moet je wel kunnen aanwijzen.
      const bewerker = bewerkerVan(this);
      const inVoorbeeld = Boolean(bewerker);
      const elementen = tab.cards.map((kaart) => {
        const el = document.createElement("hui-card");
        el.hass = this.hass;
        el.preview = inVoorbeeld;
        el.config = kaart;
        pasIndelingToe(el, kaart?.grid_options);
        return el;
      });
      this.kinderen_.set(i, elementen);

      // In het VOORBEELD van de kaarteditor komt het gereedschap van Home
      // Assistant eromheen te staan: de overlay met het potlood en het
      // driepuntsmenu, slepen, en een knop om er een bij te zetten. Zo bewerk
      // je de tab waar je hem ziet, en niet in een lijst ernaast. Zie de kop
      // van kaartenlijst.js.
      if (bewerker && heeftHaGereedschap()) {
        vak.replaceChildren(
          kaartenLijst({
            hass: this.hass,
            kaarten: tab.cards,
            maakKaart: (_, index) => elementen[index] ?? null,
            opActie: (soort, gegevens) => bewerker.uitVoorbeeld?.(i, soort, gegevens),
          }),
          this.voegToeKnop_(i),
        );
        meetRaster(this.$(".card"));
        return;
      }

      vak.replaceChildren(...elementen);
      // De kaarten zijn er, hun opmaak nog niet -- meetRaster heeft daar zijn
      // eigen herkansing voor.
      meetRaster(this.$(".card"));
      // En hun GRENZEN zijn er ook nog niet: `hui-card` maakt het echte
      // kaartelement pas als hij zijn config krijgt, en een gemeten ondergrens
      // komt daar nog een opmaakronde na. Zie herijkIndeling_.
      this.herijkIndeling_();
    } catch (e) {
      this.kinderen_.delete(i);
      vak.innerHTML = `<div class="leeg">Deze kaart kon niet geladen worden: ${escapeHtml(
        e?.message ?? e
      )}</div>`;
      meetRaster(this.$(".card"));
    }
  }

  /**
   * Geef elke kaart in een tab de hoogte die hij MAG hebben.
   *
   * WAAROM DIT ER IS -- gemeld op 27 augustus 2026 met een schermafdruk waarop
   * zes thermostaten dwars door elkaar heen liepen.
   *
   * Een `grid_options` in een dashboard is een getal dat er ooit is ingezet.
   * Op zijn installatie stond bij twaalf klimaatkaarten `{columns: 6, rows: 1}`
   * -- terecht, want die kaart WAS één rasterrij. Daarna kreeg hij de vorm
   * "Onder elkaar" en werden het er drie. Home Assistant zou dat getal in een
   * sectie tegen `min_rows` aan klemmen (valkuil 12); dit raster nam het rauw
   * over, gaf een vak van 56px aan een kaart die 120px tekent, en dus liep elke
   * kaart 64px over zijn buurman.
   *
   * De grenzen worden ELKE keer opnieuw uitgelezen en niet onthouden. Ze zijn
   * gemeten (`gemetenRijen`), dus ze veranderen: bij het opbouwen is er nog
   * niets te meten en geeft de kaart zijn schatting, een opmaakronde later de
   * echte maat, en bij een toestandswijziging weer een andere.
   */
  herijkIndeling_(pogingen = 3) {
    let ietsGevonden = false;
    for (const [i, elementen] of this.kinderen_.entries()) {
      if (!elementen) continue;
      const kaarten = this.config?.tabs?.[i]?.cards ?? [];
      elementen.forEach((el, n) => {
        const grenzen = grenzenVan(el);
        if (grenzen) ietsGevonden = true;
        pasIndelingToe(el, kaarten[n]?.grid_options, grenzen);
      });
    }
    // Nog geen enkele kaart die zijn grenzen kent: dan staat het echte element
    // er nog niet. Een `isConnected`-toets zou hier niet helpen (valkuil 25),
    // dus gewoon nog een opmaakronde wachten.
    if (!ietsGevonden && pogingen > 0) {
      requestAnimationFrame(() => this.herijkIndeling_(pogingen - 1));
    }
  }

  /**
   * Zet de toevoegknop in een LEGE tab, zodra de editor te vinden is.
   *
   * Waarom met een herkansing en niet meteen: Home Assistant bouwt het
   * VOORBEELD en de EDITOR los van elkaar, en wie er eerst is verschilt per
   * keer. Bij een tab MET kaarten valt dat niet op -- daar wordt er pas gekeken
   * na `await loadCardHelpers()`, en dan staat alles er. Een lege tab tekent
   * meteen, en dan is de editor er nog niet. Gemeten op 26 augustus 2026: de
   * kaart en de editor stonden er allebei, en tóch bleef de knop weg.
   *
   * Er wordt hoogstens een halve seconde gekeken. Staat de editor er dan nog
   * niet, dan is dit geen voorbeeld maar een echt dashboard -- en daar hoort
   * geen knop.
   */
  knopLater_(i, pogingen = 60) {
    // Het vak wordt ELKE ronde opnieuw opgezocht en niet vastgehouden. Een
    // vastgehouden verwijzing is de val die deze knop de eerste keer kostte:
    // bij de eerste opbouw hangt de kaart nog NIET in het document, `isConnected`
    // is dan false, en een enkele toets daarop stopte de hele herkansing --
    // waarna de knop nooit meer kwam. Gemeten op 26 augustus 2026.
    const vak = this.$(`.vak[data-i="${i}"]`);
    if (!vak || vak.querySelector(".voegtoe")) return;
    // Inmiddels toch een kaart erin? Dan tekent `bouw_` de lijst en hoort deze
    // herkansing zich er niet meer mee te bemoeien.
    if (this.config?.tabs?.[i]?.cards?.length) return;
    // Er wordt op de DIALOOG gewacht en niet op de editor. Gemeten op
    // 26 augustus 2026: de dialoog staat er binnen een tel, de editor erin pas
    // een stuk later -- een halve seconde wachten was te kort en de knop bleef
    // weg. En de editor hoeft hier ook niet te bestaan: die wordt pas bij de
    // KLIK opgezocht, en dan is hij er zeker.
    if (this.inVoorbeeld_()) {
      vak.appendChild(this.voegToeKnop_(i));
      meetRaster(this.$(".card"));
      return;
    }
    if (pogingen <= 0) return;
    const id = setTimeout(() => this.knopLater_(i, pogingen - 1), 50);
    this.teardown_.push(() => clearTimeout(id));
  }

  /** Staat deze kaart in het voorbeeld van een kaarteditor? */
  inVoorbeeld_() {
    for (const v of voorouders(this)) {
      if (v.tagName?.toLowerCase?.() === "hui-dialog-edit-card") return true;
    }
    return false;
  }

  /**
   * De knop onder de kaarten in het voorbeeld, in de vorm die HA aanhoudt.
   *
   * De editor wordt pas bij de KLIK opgezocht en niet nu: hij komt later dan de
   * kaart, en een knop die op een verwijzing van vroeger wacht is een knop die
   * er soms niet is. Zie `knopLater_`.
   */
  voegToeKnop_(i) {
    const knop = document.createElement("button");
    knop.type = "button";
    knop.className = "voegtoe";
    knop.textContent = "＋  Kaart toevoegen";
    knop.addEventListener("click", (e) => {
      e.stopPropagation();
      bewerkerVan(this)?.uitVoorbeeld?.(i, "toevoegen", {});
    });
    return knop;
  }

  /* ------------------------------------------------- Lovelace-afspraken */

  getCardSize() {
    return 3;
  }

  getGridOptions() {
    // Zoals elke kaart die kan groeien: "auto" plus een GEMETEN ondergrens, want
    // een getal uit het formaatgreepje zou de kaart over zijn buurman laten
    // schilderen. Zie gemetenRijen in rasterhoogte.js.
    return {
      columns: 12,
      rows: "auto",
      min_columns: 6,
      min_rows: this.minRijen_(".card", 2),
    };
  }

  static getConfigElement() {
    return document.createElement("domotiapp-tabs-card-editor");
  }

  static getStubConfig() {
    return {
      tabs: [
        { name: "Woning", icon: "house", card: null },
        { name: "Weer", icon: "cloudSun", card: null },
      ],
    };
  }
}

registerCard("domotiapp-tabs-card", TabsCard, {
  name: "DomotiApp Tabbladen",
  description:
    "Meerdere kaarten achter tabbladen, met een rij knoppen erboven. De gekozen tab wordt per apparaat onthouden.",
});

export { TabsCard };
