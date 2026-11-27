/**
 * De kaart met alle tankstations van Nederland, onder de prijsborden van de brandstofkaart (sinds 0.144.0).
 *
 * De eigenaar, 27 november 2026: *"of zou je een map kunnen maken met zoekbalk in heel NL?"*, en daarna *"ik wil alleen
 * een map dan met tankstations en dan gewoon de gemiddelde adviesprijs bovenaan. Geen prijzen in de buurt"*.
 *
 * ## Een eigen Leaflet, met de ondergrond van Home Assistant
 *
 * De eerste opzet gebruikte `ha-map`, de kaart van Home Assistant zelf. Dat werkte in de testinstance (2026.8), maar de
 * frontend van nu (gelezen op 27 november 2026, `src/components/map/ha-map.ts`) tekent met een vector-engine en geeft
 * geen Leaflet meer prijs: eigen punten kunnen er alleen als entiteit op, en ruim 4000 tankstations zijn geen
 * entiteiten. Bij een klant op 2026.11 had de kaart dus geen enkel punt gehad. Daarom zit Leaflet (1.9.4, BSD-2, zie
 * `frontend/LICENTIES.md`) in de bundel.
 *
 * De ondergrond komt waar Home Assistant hem sinds 2026.9 zelf haalt: de tegelproxy van de core
 * (`/api/map_tiles/raster/...`, component `map_tiles`), met een token van `map_tiles/access_token` in het adres; een
 * `<img>` stuurt geen inlog mee. De core houdt twee tokens geldig en wisselt elk half uur, dus hier elke twintig
 * minuten een nieuw, en meteen een nieuw als een tegel geweigerd wordt. Een Home Assistant zonder die proxy (zoals
 * 2026.8, waar de oude ondergrond van CARTO intussen alleen nog "API KEY REQUIRED" geeft) krijgt de tegels van
 * OpenStreetMap rechtstreeks, zoals de demo van Home Assistant. In donker gaat er een filter over de tegels.
 *
 * De punten gaan als één laag op een canvas: ruim 4000 losse elementen zou op een telefoon haperen.
 *
 * ## De stations
 *
 * Een momentopname uit OpenStreetMap in de integratie (`/domotiapp_lovelace/gegevens/tankstations-nl.json`), pas
 * opgehaald als de kaart in beeld komt. Een klant vraagt Overpass nooit zelf; zie `scripts/tankstations.py`. De
 * naamsvermelding "© OpenStreetMap-bijdragers" staat onder de kaart.
 *
 * ## Zoeken
 *
 * Op naam, merk, straat, postcode en plaats (`zoekStations`); bij gelijke stand het dichtst bij huis. Een tik op een
 * uitkomst of een punt zoomt erheen en zet de gegevens onder de kaart: adres, openingstijden, brandstoffen en een route.
 * Een prijs per pomp is er niet; daar is in Nederland geen open bron voor, en de eigenaar wil hem niet.
 *
 * Weet OpenStreetMap de openingstijden of de brandstoffen niet, dan staat er "onbekend" en niet niets (sinds 0.144.1).
 * De eigenaar zag bij een pomp alleen naam, adres en Route, en vroeg: *"waarom geen openingstijden en welke
 * brandstof?"* Een lege plek zegt niet dát het ontbreekt. Een derde van de stations heeft geen openingstijden, twee
 * derde geen brandstoffen.
 */

import * as L from "leaflet/dist/leaflet-src.esm.js";
import leafletCss from "leaflet/dist/leaflet.css";
import { escapeHtml } from "../base.js";
import { resolve } from "../icons.js";
import { t } from "../taal.js";
import { normaal, routeLink, stationNaam, stationRegels, stationUit, zoekStations } from "./brandstof-logica.js";

export const STATIONS_URL = "/domotiapp_lovelace/gegevens/tankstations-nl.json";
const NEDERLAND = { lat: 52.2, lon: 5.3, zoom: 7 };

/** Eén keer per pagina ophalen, voor elke brandstofkaart samen. */
let stationsBelofte = null;
export function laadStations() {
  stationsBelofte ??= fetch(STATIONS_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((d) => ({ datum: d.datum, stations: (d.stations ?? []).map((rij) => stationUit(rij, d.velden)) }))
    .catch((fout) => {
      stationsBelofte = null;
      throw fout;
    });
  return stationsBelofte;
}

const PROXY = "/api/map_tiles/raster/{z}/{x}/{y}.png?token={token}";
const OSM = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_NAAM = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';
const TOKEN_VERVERS_MS = 20 * 60 * 1000;

/** Een token van de tegelproxy, of null als deze Home Assistant hem niet heeft. Drie pogingen: net na een herstart is het commando er nog niet. */
async function tegelToken(hass) {
  for (const wacht of [0, 1000, 3000]) {
    if (wacht) await new Promise((r) => setTimeout(r, wacht));
    try {
      const uit = await hass?.connection?.sendMessagePromise({ type: "map_tiles/access_token" });
      if (uit?.token) return uit.token;
    } catch {
      // Geen proxy, of nog niet gereed.
    }
  }
  return null;
}

export const pompenCss = /* css */ `
  ${leafletCss}
  .pompen { display: flex; flex-direction: column; gap: 8px; }
  .pompen .zoek { position: relative; }
  .pompen input {
    width: 100%; height: 40px; padding: 0 12px 0 34px; font: inherit; font-size: 16px;
    color: var(--dac-ink); background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius-pill); color-scheme: var(--dac-scheme); outline: none;
  }
  .pompen input:focus { border-color: var(--dac-accent-hi); }
  .pompen .zoek .icon {
    position: absolute; left: 12px; top: 12px; width: 16px; height: 16px; --mdc-icon-size: 16px;
    color: var(--dac-ink-3); pointer-events: none;
  }
  .pompen .uitkomsten { display: flex; flex-direction: column; border-radius: var(--dac-radius-sm); overflow: hidden; }
  .pompen .uitkomsten:empty { display: none; }
  .pompen .uitkomst {
    display: flex; flex-direction: column; gap: 1px; padding: 8px 12px; cursor: pointer; text-align: left;
    background: var(--dac-surface); border: 1px solid var(--dac-border); font: inherit; color: var(--dac-ink);
  }
  .pompen .uitkomst + .uitkomst { border-top: 0; }
  .pompen .uitkomst .t { font-size: 13.5px; font-weight: 600; }
  .pompen .uitkomst .a { font-size: 12px; color: var(--dac-ink-3); }
  .pompen .geen { font-size: 12.5px; color: var(--dac-ink-3); padding: 2px 4px; }
  .pompen .kaart {
    position: relative; height: 320px; border-radius: var(--dac-radius-sm); overflow: hidden;
    border: 1px solid var(--dac-border); background: var(--dac-surface);
  }
  .pompen .leaflet { position: absolute; inset: 0; background: var(--dac-surface-hi); font: inherit; }
  /* De tegels van OpenStreetMap zijn licht; in donker gaan ze om, zodat de kaart niet als een lamp in het dashboard staat. */
  :host([dac-thema="donker"]) .pompen .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(.9) contrast(.85) saturate(.55); }
  /* De knoppen en de naamsvermelding van Leaflet zijn wit; hier in de vormtaal van de kaart, ook in donker. */
  .pompen .leaflet-bar { border: 1px solid var(--dac-border); box-shadow: none; }
  .pompen .leaflet-bar a { background: var(--dac-bg-raise); color: var(--dac-ink); border-bottom-color: var(--dac-border); }
  .pompen .leaflet-control-attribution { font-size: 10px; background: var(--dac-bg-raise); color: var(--dac-ink-3); }
  .pompen .leaflet-control-attribution a { color: var(--dac-accent-hi); }
  .pompen .kaart .melding {
    position: absolute; inset: 0; display: grid; place-items: center; padding: 16px; text-align: center;
    font-size: 12.5px; color: var(--dac-ink-3);
  }
  .pompen .station {
    display: flex; flex-direction: column; gap: 4px; padding: 10px 12px;
    background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius-sm);
  }
  .pompen .station .t { font-size: 14px; font-weight: 600; }
  .pompen .station .a, .pompen .station .o { font-size: 12.5px; color: var(--dac-ink-2); }
  /* Wat OpenStreetMap niet weet, staat er wel: dan is te zien dat het ontbreekt (de eigenaar, 27 november 2026). */
  .pompen .station .o[data-onbekend] { color: var(--dac-ink-3); font-style: italic; }
  .pompen .station .soorten { display: flex; flex-wrap: wrap; gap: 5px; }
  .pompen .station .soort {
    font-size: 11.5px; padding: 2px 8px; border-radius: var(--dac-radius-pill);
    border: 1px solid var(--dac-border); color: var(--dac-ink-2);
  }
  .pompen .station .route { align-self: flex-start; font-size: 13px; font-weight: 600; color: var(--dac-accent-hi); text-decoration: none; padding: 4px 0; }
  .pompen .osm { font-size: 10.5px; color: var(--dac-ink-3); }
`;

export class Pompenkaart {
  /**
   * @param {HTMLElement} vak het element `.pompen` in de kaart
   * @param {{hass: object, licht_: boolean, meet: () => void}} kaart de brandstofkaart
   */
  constructor(vak, kaart) {
    this.vak = vak;
    this.kaart = kaart;
    this.stations = null;
    this.gekozen = null;
    this.dood = false;
    vak.innerHTML = `
      <div class="zoek">${resolve("search")}<input type="search" enterkeyhint="search" autocomplete="off"
        placeholder="${escapeHtml(t("Zoek een tankstation: plaats, merk of straat"))}"
        aria-label="${escapeHtml(t("Zoek een tankstation"))}"></div>
      <div class="uitkomsten" role="listbox"></div>
      <div class="kaart"><div class="melding">${escapeHtml(t("Kaart laden…"))}</div></div>
      <div class="station" hidden></div>
      <div class="osm">${escapeHtml(t("Tankstations © OpenStreetMap-bijdragers (ODbL)"))}</div>`;
    const invoer = vak.querySelector("input");
    invoer.addEventListener("input", () => this.zoek_(invoer.value));
    invoer.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.vak.querySelector(".uitkomst")?.click();
      if (e.key === "Escape") {
        invoer.value = "";
        this.zoek_("");
      }
    });
    vak.querySelector(".uitkomsten").addEventListener("click", (e) => {
      const knop = e.target.closest(".uitkomst");
      if (!knop) return;
      // Eerst het station, dan pas het lijstje leeg: `zoek_("")` gooit de uitkomsten weg.
      const station = this.uitkomsten_?.[Number(knop.dataset.i)];
      invoer.value = "";
      invoer.blur();
      this.zoek_("");
      this.kies_(station, true);
    });
    this.start_();
  }

  stop() {
    this.dood = true;
    clearInterval(this.tokenKlok_);
    this.waarnemer_?.disconnect();
    this.map?.remove();
    this.map = null;
  }

  /** Het thema veranderde: de tegels volgen via `dac-thema` op de kaart (CSS), hier is niets te doen. */
  bij() {}

  async start_() {
    const melding = this.vak.querySelector(".melding");
    let data = null;
    try {
      data = await laadStations();
    } catch {
      data = null;
    }
    if (this.dood) return;
    if (!data) {
      melding.textContent = t("De tankstations konden niet geladen worden.");
      return;
    }
    this.stations = data.stations;
    const vak = document.createElement("div");
    vak.className = "leaflet";
    this.vak.querySelector(".kaart").replaceChildren(vak);
    const thuis = this.thuis_();
    const map = L.map(vak, { zoomControl: true, attributionControl: true, minZoom: 6, maxZoom: 19 });
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a>');
    map.setView(thuis ? [thuis.lat, thuis.lon] : [NEDERLAND.lat, NEDERLAND.lon], thuis ? 11 : NEDERLAND.zoom);
    this.map = map;
    // Leaflet meet zijn vak bij het begin; in een pop-up of een raster dat nog opschuift klopt dat niet meteen.
    this.waarnemer_ = new ResizeObserver(() => this.map?.invalidateSize());
    this.waarnemer_.observe(vak);

    await this.ondergrond_();
    if (this.dood) return;
    const kleur = getComputedStyle(this.vak).getPropertyValue("--dac-accent-hi").trim() || "#198fd9";
    const tekenaar = L.canvas({ padding: 0.5, tolerance: 6 });
    const punten = L.layerGroup();
    for (const s of this.stations) {
      const punt = L.circleMarker([s.lat, s.lon], { renderer: tekenaar, radius: 5, weight: 1.5, color: "#ffffff", fillColor: kleur, fillOpacity: 0.95 });
      punt.on("click", () => this.kies_(s, false));
      punt.addTo(punten);
    }
    punten.addTo(map);
    this.kleur = kleur;
    this.kaart.meet?.();
  }

  /** De tegels: via de proxy van de core als die er is, anders van OpenStreetMap zelf. */
  async ondergrond_() {
    const hass = this.kaart.hass;
    const token = await tegelToken(hass);
    if (this.dood) return;
    if (!token) {
      this.bron = "osm";
      L.tileLayer(OSM, { attribution: OSM_NAAM, maxZoom: 19, referrerPolicy: "origin" }).addTo(this.map);
      return;
    }
    this.bron = "proxy";
    const basis = String(hass?.auth?.data?.hassUrl || location.origin).replace(/\/$/, "");
    const laag = L.tileLayer(`${basis}${PROXY}`, { attribution: OSM_NAAM, maxZoom: 19, token }).addTo(this.map);
    const ververs = async () => {
      const nieuw = await tegelToken(hass);
      if (nieuw && nieuw !== laag.options.token) {
        laag.options.token = nieuw;
        laag.redraw();
      }
    };
    this.tokenKlok_ = setInterval(ververs, TOKEN_VERVERS_MS);
    // Een geweigerde tegel is meestal een verlopen token (na een slaapstand); hooguit eens per minuut opnieuw vragen.
    let laatst = 0;
    laag.on("tileerror", () => {
      if (Date.now() - laatst < 60000) return;
      laatst = Date.now();
      ververs();
    });
  }

  thuis_() {
    const c = this.kaart.hass?.config;
    const lat = Number(c?.latitude);
    const lon = Number(c?.longitude);
    return Number.isFinite(lat) && Number.isFinite(lon) && (lat || lon) ? { lat, lon } : null;
  }

  zoek_(tekst) {
    const vak = this.vak.querySelector(".uitkomsten");
    if (!this.stations || !normaal(tekst)) {
      this.uitkomsten_ = [];
      vak.innerHTML = "";
      this.kaart.meet?.();
      return;
    }
    this.uitkomsten_ = zoekStations(this.stations, tekst, { max: 6, bij: this.thuis_() });
    vak.innerHTML = this.uitkomsten_.length
      ? this.uitkomsten_
          .map(
            (s, i) => `<button class="uitkomst" type="button" role="option" data-i="${i}">
                <span class="t">${escapeHtml(stationNaam(s))}</span>
                <span class="a">${escapeHtml([s.adres, s.plaats].filter(Boolean).join(", ") || s.merk)}</span>
              </button>`
          )
          .join("")
      : `<div class="geen">${escapeHtml(t("Geen tankstation gevonden."))}</div>`;
    this.kaart.meet?.();
  }

  kies_(s, vliegen) {
    if (!s) return;
    this.gekozen = s;
    const kaart = this.map;
    if (kaart) {
      if (vliegen) kaart.flyTo([s.lat, s.lon], 15, { duration: 0.6 });
      this.merk_?.remove();
      this.merk_ = L.circleMarker([s.lat, s.lon], { radius: 10, weight: 3, color: this.kleur, fill: false, interactive: false }).addTo(kaart);
    }
    const vak = this.vak.querySelector(".station");
    const regels = stationRegels(s);
    const adres = [s.adres, [s.postcode, s.plaats].filter(Boolean).join(" ")].filter(Boolean).join(", ");
    vak.hidden = false;
    vak.innerHTML = `
      <span class="t">${escapeHtml(stationNaam(s))}</span>
      ${s.merk && s.merk !== stationNaam(s) ? `<span class="a">${escapeHtml(s.merk)}</span>` : ""}
      ${adres ? `<span class="a">${escapeHtml(adres)}</span>` : ""}
      <span class="o"${regels.open.bekend ? "" : " data-onbekend"}>${escapeHtml(regels.open.tekst)}</span>
      ${
        regels.brandstoffen.bekend
          ? `<span class="soorten">${regels.brandstoffen.soorten.map((b) => `<span class="soort">${escapeHtml(b)}</span>`).join("")}</span>`
          : `<span class="o" data-onbekend>${escapeHtml(regels.brandstoffen.tekst)}</span>`
      }
      <a class="route" href="${escapeHtml(routeLink(s))}" target="_blank" rel="noopener noreferrer">${escapeHtml(t("Route"))}</a>`;
    this.kaart.meet?.();
  }
}
