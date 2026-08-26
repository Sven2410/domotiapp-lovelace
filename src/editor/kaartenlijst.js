/**
 * Een lijst kaarten bewerken met de eigen gereedschappen van Home Assistant.
 *
 * WAT DIT IS
 *
 * De tabbladenkaart bewaart kaarten. Tot vandaag kon je die kiezen uit een
 * eigen lijst en bewerken met `hui-card-element-editor`. Dat werkte, maar het
 * was niet wat de eigenaar wilde: "ik wil echt dat drag en drop en bewerken
 * zoals in Bubble Card". Met een schermafdruk erbij van HA's eigen
 * "Toevoegen aan dashboard" en van het driepuntsmenu met Bewerken, Dupliceren,
 * Kopiëren, Knippen en Verwijderen.
 *
 * Dat kan, en het hoeft niet nagemaakt te worden: Home Assistant heeft er
 * elementen voor, en die zijn in de bewerkmodus allemaal geladen. Gemeten op
 * 26 augustus 2026 in een echte bewerkdialoog:
 *
 *   hui-section          gedefinieerd
 *   hui-card-edit-mode   gedefinieerd
 *   ha-sortable          gedefinieerd
 *
 * De aanpak is overgenomen van Bubble Card (`src/cards/pop-up/cards/editor/`),
 * die dit als eerste heeft uitgezocht. Wat hier staat is niet zijn code maar
 * zijn vondst: de twee trucs eronder.
 *
 * TRUC 1 -- DE OVERLAY MET HET POTLOOD EN HET DRIEPUNTSMENU
 *
 * `hui-card-edit-mode` is het element dat Home Assistant om elke kaart in een
 * sectie hangt zodra je een dashboard bewerkt. Het tekent de overlay, het
 * potlood en het menu. Het heeft alleen `hass`, een `lovelace` met `editMode`,
 * en een `path` nodig -- die lovelace mag NEP zijn, want wij vangen alles op
 * wat eruit komt. Wat het menu doet, meldt het met gebeurtenissen die omhoog
 * borrelen: `ll-edit-card`, `ll-duplicate-card`, `ll-delete-card`,
 * `ll-copy-card`, `ll-change-grid-options`, `ll-move-to-section`.
 *
 * Slepen doet `ha-sortable` eromheen, met `item-moved`.
 *
 * TRUC 2 -- DE ECHTE KAARTKIEZER
 *
 * `hui-dialog-create-card` is niet aan te roepen: hij is intern en er is geen
 * functie voor. Maar hij wordt wél geopend door een gebeurtenis die een SECTIE
 * afvuurt: `ll-create-card`. Dus maak je een `hui-section` die nergens staat
 * (`display: none`), geef je hem een nepdashboard met alleen onze kaarten erin,
 * en vuur je die gebeurtenis af vanuit zijn layout-element. Home Assistant
 * opent zijn eigen dialoog, en wat de gebruiker kiest komt terug in de
 * `saveConfig` van dat nepdashboard.
 *
 * DE VAL DIE DAARBIJ HOORT, EN DIE GEMETEN IS
 *
 * Kiest de gebruiker in die dialoog een KAARTSOORT (het tabblad "Per kaart"),
 * dan opent Home Assistant daarna zijn eigen `hui-dialog-edit-card` voor die
 * nieuwe kaart. En dat is exact dezelfde dialoog waar ONZE editor in staat:
 * Home Assistant hergebruikt het element en zet er andere parameters in. Onze
 * editor was daarna weg -- gemeten, `domotiapp-tabs-card-editor` niet meer in
 * de DOM, en de halve config van de tabbladenkaart eruit.
 *
 * Daarom wordt die tweede dialoog ONDERSCHEPT: bij het `show-dialog`-signaal
 * met `dialogTag: "hui-dialog-edit-card"` wordt de gebeurtenis gestopt en de
 * kaartconfig eruit gehaald. De gebruiker heeft dan gekozen wat hij wilde
 * kiezen, de kaart komt in de lijst, en bewerken doet hij een regel lager in de
 * editor die er al stond. Geen tweede dialoog, geen verdwenen config.
 */

/**
 * Wat een menukeuze of een sleepbeweging met de lijst doet.
 *
 * Zonder DOM en zonder `hass`, zodat het in een gewone Node-test past -- en dat
 * is hier geen netheid maar noodzaak: dit is indexrekenwerk, en indexrekenwerk
 * gaat stilletjes fout. Een kaart dupliceren die op de laatste plek staat, een
 * kaart verplaatsen naar een positie die er niet is, een menu dat een pad
 * meestuurt van een kaart die er niet meer is.
 *
 * Geeft een NIEUWE lijst terug, of `null` als er niets te doen was. Dat laatste
 * is belangrijk: dan hoeft de editor niets opnieuw te tekenen en verlies je je
 * plek in het scherm niet.
 *
 * @param {object[]} kaarten
 * @param {string} soort   verplaats | dupliceer | verwijder | rooster
 * @param {object} gegevens
 * @returns {object[]|null}
 */
export function pasToe(kaarten, soort, gegevens = {}) {
  const lijst = Array.isArray(kaarten) ? [...kaarten] : [];
  const i = Number(gegevens.index);

  switch (soort) {
    case "verplaats": {
      const van = Number(gegevens.van);
      const naar = Number(gegevens.naar);
      if (!Number.isInteger(van) || !Number.isInteger(naar)) return null;
      if (van < 0 || van >= lijst.length || naar < 0 || naar >= lijst.length) return null;
      if (van === naar) return null;
      const [weg] = lijst.splice(van, 1);
      lijst.splice(naar, 0, weg);
      return lijst;
    }
    case "dupliceer": {
      if (!Number.isInteger(i) || !lijst[i]) return null;
      // Een kopie en niet hetzelfde object: Home Assistant bevriest wat er
      // langskomt, en twee verwijzingen naar één bevroren config betekent dat
      // je de tweede kaart nooit meer los kunt aanpassen.
      lijst.splice(i + 1, 0, structuredClone(lijst[i]));
      return lijst;
    }
    case "verwijder": {
      if (!Number.isInteger(i) || !lijst[i]) return null;
      lijst.splice(i, 1);
      return lijst;
    }
    case "rooster": {
      if (!Number.isInteger(i) || !lijst[i] || !gegevens.rooster) return null;
      lijst[i] = {
        ...lijst[i],
        grid_options: { ...(lijst[i].grid_options ?? {}), ...gegevens.rooster },
      };
      return lijst;
    }
    default:
      return null;
  }
}

/** De nep-lovelace die elk van HA's bewerkelementen genoeg vindt. */
const nepLovelace = (config) => ({
  ...(config ? { config } : {}),
  editMode: true,
  saveConfig: async () => {},
});

import { pasIndelingToe } from "../cards/tab-indeling.js";

/** Het `home-assistant`-element, of null als we ergens anders draaien. */
const gastheer = () => document.querySelector("home-assistant");

/**
 * Bouwt de sleepbare lijst met kaarten, elk in de overlay van Home Assistant.
 *
 * @param {object} opties
 * @param {object} opties.hass
 * @param {object[]} opties.kaarten     de configs
 * @param {Function} opties.maakKaart   (config) => Element | null
 * @param {Function} opties.opActie     (soort, gegevens) => void
 * @returns {Element} het element om in de editor te hangen
 */
export function kaartenLijst({ kaarten, hass, maakKaart, opActie }) {
  const sortable = document.createElement("ha-sortable");
  sortable.disabled = false;
  sortable.draggableSelector = ".dac-kaart";
  sortable.rollback = false;
  sortable.invertSwap = true;
  // `delay` met `delayOnTouchOnly`: op een aanraakscherm moet je even
  // vasthouden voordat het slepen begint, anders kun je de lijst niet meer
  // scrollen zonder per ongeluk een kaart te verslepen.
  sortable.options = {
    delay: 100,
    delayOnTouchOnly: true,
    direction: "vertical",
    invertedSwapThreshold: 0.7,
  };

  const houder = document.createElement("div");
  houder.className = "dac-kaarten";

  const overlays = [];
  kaarten.forEach((config, i) => {
    // De index gaat mee: wie de kaarten al gebouwd heeft, wil ze op volgorde
    // kunnen teruggeven in plaats van ze nog een keer te maken.
    const el = maakKaart(config, i);
    if (!el) return;
    const vak = document.createElement("div");
    vak.className = "dac-kaart";
    // Dezelfde plek in het raster als op het dashboard: wat je in het
    // voorbeeld ziet moet zijn wat er straks staat. Zie tab-indeling.js.
    pasIndelingToe(vak, config?.grid_options);

    const overlay = document.createElement("hui-card-edit-mode");
    overlay.hass = hass;
    overlay.lovelace = nepLovelace();
    // Het pad dat Home Assistant in een sectie gebruikt: [view, sectie, kaart].
    // De eerste twee zijn nep; alleen de laatste zegt ons iets.
    overlay.path = [0, 0, i];
    overlay.hiddenOverlay = false;
    overlay.appendChild(el);
    overlays.push(overlay);

    vak.appendChild(overlay);
    houder.appendChild(vak);
  });

  sortable.appendChild(houder);

  // Tijdens het slepen hoort de overlay weg te zijn: anders sleep je een kaart
  // met een potlood en een menu eroverheen, en dat leest als twee dingen.
  const toonOverlay = (aan) => {
    for (const o of overlays) o.hiddenOverlay = !aan;
  };
  sortable.addEventListener("drag-start", () => toonOverlay(false));
  sortable.addEventListener("drag-end", () => toonOverlay(true));

  sortable.addEventListener("item-moved", (e) => {
    e.stopPropagation();
    opActie("verplaats", { van: e.detail.oldIndex, naar: e.detail.newIndex });
  });

  // Alles wat het driepuntsmenu afvuurt. Stuk voor stuk stoppen: laat je ze
  // door, dan komen ze uit bij het dashboard eronder en bewerkt Home Assistant
  // de VIEW in plaats van onze tab.
  const menu = {
    "ll-edit-card": (e) => opActie("bewerk", { index: e.detail.path[2] }),
    "ll-duplicate-card": (e) => opActie("dupliceer", { index: e.detail.path[2] }),
    "ll-delete-card": (e) => opActie("verwijder", { index: e.detail.path[2] }),
    "ll-copy-card": (e) => opActie("kopieer", { index: e.detail.path[2] }),
    "ll-change-grid-options": (e) =>
      opActie("rooster", { index: e.detail.path?.[2], rooster: e.detail.gridOptions }),
    // Verplaatsen naar een andere sectie bestaat hier niet: er is geen andere
    // sectie. Wel stoppen, anders gaat hij op zoek naar het dashboard.
    "ll-move-to-section": () => {},
  };
  for (const [naam, doe] of Object.entries(menu)) {
    sortable.addEventListener(naam, (e) => {
      e.stopPropagation();
      doe(e);
    });
  }

  return sortable;
}

/**
 * Legt een kaartconfig op het klembord van Home Assistant.
 *
 * Zodat "Kopiëren" en "Knippen" ook echt ergens toe leiden: HA leest bij
 * plakken uit `sessionStorage`. Dat is wat de eigen kopieerknop van een sectie
 * ook doet.
 */
export function naarKlembord(config) {
  try {
    const kopie =
      typeof structuredClone === "function" ? structuredClone(config) : JSON.parse(JSON.stringify(config));
    sessionStorage.setItem("dashboardCardClipboard", JSON.stringify(kopie));
    return true;
  } catch {
    // Een privévenster dat sessionStorage dichthoudt is geen reden om de
    // editor te laten vallen.
    return false;
  }
}

/**
 * Opent de echte kaartkiezer van Home Assistant en geeft terug wat er gekozen
 * is.
 *
 * @param {object} opties
 * @param {object} opties.hass
 * @param {object[]} opties.kaarten   de kaarten die er nu in zitten
 * @returns {Promise<{kaarten: object[]}|{kaart: object}|null>}
 *          `kaarten` als Home Assistant de hele lijst terugstuurde (dat doet
 *          hij bij een keuze via een entiteit), `kaart` als er een kaartsoort
 *          gekozen is, `null` als er geannuleerd is.
 */
export function kiesKaartViaHa({ hass, kaarten }) {
  const ha = gastheer();
  if (!ha || !customElements.get("hui-section")) return Promise.resolve(null);

  return new Promise((klaar) => {
    let gekozenKaart = null;
    let nieuweLijst = null;
    let afgerond = false;

    const rondAf = () => {
      if (afgerond) return;
      afgerond = true;
      ha.removeEventListener("show-dialog", vangDialoog, true);
      window.removeEventListener("dialog-closed", vangSluiting, true);
      if (gekozenKaart) klaar({ kaart: gekozenKaart });
      else if (nieuweLijst) klaar({ kaarten: nieuweLijst });
      else klaar(null);
    };

    // DE ONDERSCHEPPING. Zie de kop van dit bestand: zonder dit vervangt Home
    // Assistant de dialoog waar onze editor in staat.
    const vangDialoog = (e) => {
      if (e?.detail?.dialogTag !== "hui-dialog-edit-card") return;
      const config = e.detail?.dialogParams?.cardConfig;
      e.stopImmediatePropagation?.();
      e.stopPropagation();
      if (config) gekozenKaart = config;

      // En de kiezer zelf sluiten. Normaal doet hij dat als hij de kaart
      // doorgeeft aan de bewerkdialoog -- maar die doorgifte hebben we net
      // tegengehouden, dus blijft hij staan wachten op iets dat niet komt.
      // Gemeten: zonder dit bleef "Toevoegen aan dashboard" open en gebeurde
      // er verder niets.
      const kiezer = ha.querySelector("hui-dialog-create-card");
      if (typeof kiezer?.closeDialog === "function") kiezer.closeDialog();
      setTimeout(rondAf, 0);
    };

    const vangSluiting = (e) => {
      if (e?.detail?.dialog !== "hui-dialog-create-card") return;
      // Een tel wachten: Home Assistant roept `saveConfig` soms pas ná het
      // sluiten aan (dat is de weg via een entiteit, waar hij de kaart direct
      // toevoegt zonder editor te tonen).
      setTimeout(rondAf, 0);
    };

    ha.addEventListener("show-dialog", vangDialoog, true);
    window.addEventListener("dialog-closed", vangSluiting, true);

    const sectieConfig = { type: "grid", cards: [...kaarten] };
    const proxy = document.createElement("hui-section");
    proxy.style.display = "none";
    proxy.hass = hass;
    proxy.index = 0;
    proxy.viewIndex = 0;
    proxy.config = sectieConfig;
    proxy.lovelace = {
      ...nepLovelace({
        views: [{ path: "domotiapp-kiezer", title: "DomotiApp", sections: [sectieConfig] }],
      }),
      saveConfig: async (nieuw) => {
        const uit = nieuw?.views?.[0]?.sections?.[0]?.cards;
        if (Array.isArray(uit)) nieuweLijst = uit;
      },
    };

    ha.appendChild(proxy);

    const start = async () => {
      try {
        if (typeof proxy._initializeConfig === "function") await proxy._initializeConfig();
        else await proxy.updateComplete;
        const layout = proxy._layoutElement;
        if (!layout) throw new Error("de proxysectie heeft geen layout-element");
        layout.dispatchEvent(new CustomEvent("ll-create-card", { bubbles: true, composed: true }));
      } catch (fout) {
        console.warn("DomotiApp: de kaartkiezer van Home Assistant ging niet open", fout);
        rondAf();
      } finally {
        // De sectie heeft zijn werk gedaan zodra de gebeurtenis weg is.
        setTimeout(() => proxy.remove(), 0);
      }
    };
    start();
  });
}

/** Zijn de gereedschappen van Home Assistant er? Zo niet: de eenvoudige weg. */
export const heeftHaGereedschap = () =>
  Boolean(
    customElements.get("hui-card-edit-mode") &&
      customElements.get("ha-sortable") &&
      customElements.get("hui-section"),
  );
