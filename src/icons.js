/**
 * Inline stroke icons for the card family.
 *
 * Drawn in-house for the same reason the Coach panel draws its own: one
 * consistent line weight, no icon dependency, no network request. Every icon is
 * a 24x24 viewBox using currentColor, so sizing and colouring happen entirely
 * in CSS.
 *
 * Line weight is 1.6 to match domotiapp-coach/frontend/src/icons.js exactly. If
 * you add one, draw it at that weight -- a 2px icon next to a 1.6px icon is the
 * single most visible way to make a set stop looking like a set.
 *
 * Home Assistant's own `mdi:` names still work anywhere a config asks for an
 * icon: `resolve()` falls back to <ha-icon> for anything not drawn here. That
 * keeps the door open without putting two line weights on screen by default.
 */

const draw = (body, fill = "none") =>
  `<svg class="icon" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" ` +
  `stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ` +
  `aria-hidden="true" focusable="false">${body}</svg>`;

export const icons = {
  /* ---- house and rooms ---- */
  house: draw(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
    <path d="M5.4 12.9V20a.9.9 0 0 0 .9.9h11.4a.9.9 0 0 0 .9-.9v-7.1"/>
    <path d="M9.8 20.9v-5.2h4.4v5.2"/>`),

  floorB: draw(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M9.4 17.8V14h2.4a1.9 1.9 0 0 1 0 3.8Z"/>`),

  floor1: draw(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M10.6 15.2 12 14v3.9"/>`),

  floor2: draw(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M10.4 14.8a1.6 1.6 0 0 1 3.1.5c0 1.4-3.1 1.8-3.1 3.5h3.2"/>`),

  garage: draw(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M8.2 20.4v-5.6h7.6v5.6M8.2 17.6h7.6"/>`),

  /* Garagedeur open en dicht: het paneel staat omhoog of het staat ervoor. */
  garageOpen: draw(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M7.6 14.4h8.8M7.6 12.4h8.8"/>`),

  garageClosed: draw(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M7.6 13.2h8.8M7.6 15.4h8.8M7.6 17.6h8.8M7.6 19.8h8.8"/>`),

  /* ---- rooms. Een navbalk wijst naar plekken, en de set had er geen enkele.
     Allemaal op dezelfde 1.6 lijndikte; zie de kop van dit bestand. ---- */

  bed: draw(`<path d="M3.2 20.2V8.4"/>
    <path d="M3.2 16.4h17.6v3.8"/>
    <path d="M20.8 16.4v-3.1a2.3 2.3 0 0 0-2.3-2.3H9.9v5.4"/>
    <circle cx="6.8" cy="12.7" r="2"/>`),

  bedDouble: draw(`<path d="M2.4 20.4V8.2M21.6 20.4V8.2"/>
    <path d="M2.4 16.6h19.2v3.8"/>
    <path d="M21.6 16.6v-2.9a2.2 2.2 0 0 0-2.2-2.2H4.6a2.2 2.2 0 0 0-2.2 2.2v2.9"/>
    <path d="M12 11.5v5.1"/>
    <path d="M5.2 11.5V9.9a.9.9 0 0 1 .9-.9h3.6a.9.9 0 0 1 .9.9v1.6"/>
    <path d="M13.4 11.5V9.9a.9.9 0 0 1 .9-.9h3.6a.9.9 0 0 1 .9.9v1.6"/>`),

  hanger: draw(`<path d="M12 8.4V7.2a2.1 2.1 0 1 1 2.1-2.1"/>
    <path d="M12 8.4 3.2 15.6a1.4 1.4 0 0 0 .9 2.5h15.8a1.4 1.4 0 0 0 .9-2.5L12 8.4Z"/>`),

  wardrobe: draw(`<rect x="4.2" y="2.8" width="15.6" height="17" rx="1.8"/>
    <path d="M12 2.8v17"/>
    <path d="M10.2 10.6v2.4M13.8 10.6v2.4"/>
    <path d="M6.6 19.8v1.6M17.4 19.8v1.6"/>`),

  sofa: draw(`<path d="M5.2 11.6V8.4a1.9 1.9 0 0 1 1.9-1.9h9.8a1.9 1.9 0 0 1 1.9 1.9v3.2"/>
    <path d="M3 17.4v-4.1a2 2 0 0 1 4 0v1.5h10v-1.5a2 2 0 0 1 4 0v4.1z"/>
    <path d="M5.8 17.4v2.2M18.2 17.4v2.2"/>`),

  kitchen: draw(`<path d="M4.4 10.2h15.2v5.2a4 4 0 0 1-4 4H8.4a4 4 0 0 1-4-4z"/>
    <path d="M2.4 12.2h2M19.6 12.2h2"/>
    <path d="M9.4 7.4c0-1.1 1.2-1.1 1.2-2.2M13.4 7.4c0-1.1 1.2-1.1 1.2-2.2"/>`),

  shower: draw(`<path d="M4.6 20.6V7.2a2.6 2.6 0 0 1 2.6-2.6h5.2A2.6 2.6 0 0 1 15 7.2v1.6"/>
    <path d="M11 12.4a4 4 0 0 1 8 0z"/>
    <path d="M12.8 15.4v1.6M15 15.4v1.6M17.2 15.4v1.6M13.9 18.8v1.6M16.1 18.8v1.6"/>`),

  toilet: draw(`<path d="M7 3.6h3.6v4.8H7z"/>
    <path d="M5.2 8.4h11.6l-1 5.2a4.6 4.6 0 0 1-4.5 3.7h-1a4.6 4.6 0 0 1-4.5-3.7z"/>
    <path d="M9.2 17.4v2.8h4.2v-2.8M7.6 20.2h7.4"/>`),

  desk: draw(`<rect x="4.6" y="4.2" width="14.8" height="9.4" rx="1.8"/>
    <path d="M10.4 13.6v2.6h3.2v-2.6"/>
    <path d="M2.8 18.4h18.4"/>
    <path d="M5.2 18.4v2.4M18.8 18.4v2.4"/>`),

  stairs: draw(`<path d="M3.6 20.4V16h4.3v-4.3h4.3V7.4h4.3V3.2h4.1"/>
    <path d="M3.6 20.4h16.8"/>`),

  parasol: draw(`<path d="M12 20.8V9.4"/>
    <path d="M2.8 9.4a9.2 9.2 0 0 1 18.4 0z"/>
    <path d="M6.6 9.4C6.6 5.9 9 3 12 3s5.4 2.9 5.4 6.4"/>
    <path d="M12 20.8a2.2 2.2 0 0 0 2.2-2.2"/>`),

  fence: draw(`<path d="M4.4 20.4V8.6L6.8 6l2.4 2.6v11.8M14.8 20.4V8.6L17.2 6l2.4 2.6v11.8"/>
    <path d="M2.6 11.4h18.8M2.6 15.4h18.8"/>
    <path d="M9.2 11.4v4M14.8 11.4v4"/>`),

  /* Een naaldboom en geen bol met een steel: die laatste stond hier eerst en
     las op 19px -- de maat in het meer-menu -- als een ballon. Gezien in de
     echte kiezer op 25 augustus 2026. */
  tree: draw(`<path d="M12 3 7.6 9.4h8.8z"/>
    <path d="M12 7.6 5.8 16.2h12.4z"/>
    <path d="M12 16.2v4.4"/>
    <path d="M9.4 20.6h5.2"/>`),

  /* ---- covers. A shutter reads by its slats; an awning by its slope. ---- */
  shutter: draw(`<path d="M3.6 4.2h16.8M5.2 4.2v13.4M18.8 4.2v13.4"/>
    <path d="M5.2 7.6h13.6M5.2 11h13.6M5.2 14.4h13.6M5.2 17.6h13.6"/>`),

  shutterOpen: draw(`<path d="M3.6 4.2h16.8M5.2 4.2v15.6M18.8 4.2v15.6"/>
    <path d="M5.2 6.6h13.6M5.2 8.6h13.6"/>`),

  awning: draw(`<path d="M2.8 11.4 6.2 5h11.6l3.4 6.4z"/>
    <path d="M2.8 11.4c1.5 1.7 3 1.7 4.5 0s3-1.7 4.5 0 3 1.7 4.5 0 3-1.7 4.5 0"/>
    <path d="M12 14.6v4.8"/>`),

  arrowUp: draw(`<path d="M12 19.4V5M6.4 10.6 12 5l5.6 5.6"/>`),
  arrowDown: draw(`<path d="M12 4.6V19M17.6 13.4 12 19l-5.6-5.6"/>`),
  stop: draw(`<rect x="6.4" y="6.4" width="11.2" height="11.2" rx="1.8"/>`),

  /* ---- light ---- */
  bulb: draw(`<path d="M9.4 18.4h5.2M10.4 21.2h3.2"/>
    <path d="M12 2.9a6.2 6.2 0 0 0-3.6 11.2c.5.4.8 1 .8 1.7v.4h5.6v-.4c0-.7.3-1.3.8-1.7A6.2 6.2 0 0 0 12 2.9Z"/>`),

  bulbGroup: draw(`<path d="M7.6 15.6h4M8.2 17.8h2.8"/>
    <path d="M9.6 3.4a4.8 4.8 0 0 0-2.8 8.7c.4.3.6.8.6 1.3v.5h4.4v-.5c0-.5.2-1 .6-1.3a4.8 4.8 0 0 0-2.8-8.7Z"/>
    <path d="M16 8.4a4.4 4.4 0 0 1 2.4 8c-.3.3-.5.7-.5 1.1v.4h-3.8"/>
    <path d="M15.4 20.6h2.4"/>`),

  switchOn: draw(`<rect x="2.8" y="7.4" width="18.4" height="9.2" rx="4.6"/>
    <circle cx="16.6" cy="12" r="2.6" fill="currentColor" stroke="none"/>`),

  /* ---- people ---- */
  person: draw(`<circle cx="12" cy="7.6" r="3.6"/>
    <path d="M4.8 20.4v-1.2a5 5 0 0 1 5-5h4.4a5 5 0 0 1 5 5v1.2"/>`),

  people: draw(`<circle cx="9.4" cy="8.2" r="3.2"/>
    <path d="M3.4 20v-1a4.6 4.6 0 0 1 4.6-4.6h2.8A4.6 4.6 0 0 1 15.4 19v1"/>
    <path d="M16.2 5.3a3.2 3.2 0 0 1 0 5.9"/>
    <path d="M17.6 14.6a4.6 4.6 0 0 1 3 4.3V20"/>`),

  away: draw(`<circle cx="10.4" cy="7.6" r="3.4"/>
    <path d="M3.6 20.4v-1.2a4.8 4.8 0 0 1 4.8-4.8h2.6"/>
    <path d="M14.6 17.4h6M18 14.8l2.6 2.6-2.6 2.6"/>`),

  /* ---- waste ---- */
  bin: draw(`<path d="M3.6 6.8h16.8"/>
    <path d="M9.4 6.8V4.6a.9.9 0 0 1 .9-.9h3.4a.9.9 0 0 1 .9.9v2.2"/>
    <path d="m5.9 6.8 1 12.5a1 1 0 0 0 1 .9h8.2a1 1 0 0 0 1-.9l1-12.5"/>
    <path d="M10.2 10.6v5.8M13.8 10.6v5.8"/>`),

  binWheeled: draw(`<path d="M5.6 7.4h12.8l-1 10.6a1 1 0 0 1-1 .9H7.6a1 1 0 0 1-1-.9z"/>
    <path d="M4.4 7.4h15.2M9.6 7.4V5.2h4.8v2.2"/>
    <circle cx="8.6" cy="20.4" r="1.3"/><circle cx="15.4" cy="20.4" r="1.3"/>`),

  calendar: draw(`<rect x="3.6" y="5.4" width="16.8" height="15" rx="2"/>
    <path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6"/>`),

  /* ---- weather, used by the header ---- */
  sun: draw(`<circle cx="12" cy="12" r="4.1"/>
    <path d="M12 2.4v2.3M12 19.3v2.3M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.4 12h2.3M19.3 12h2.3M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>`),

  cloud: draw(`<path d="M7.2 18.4a4.2 4.2 0 0 1-.5-8.4 5.6 5.6 0 0 1 10.8-1.2 3.9 3.9 0 0 1 .6 7.7z"/>`),

  cloudSun: draw(`<path d="M6.8 8.2a3.4 3.4 0 1 1 4.6 3.2"/>
    <path d="M5 4.6 6.1 5.7M3.2 9.2h1.6M9.4 4.6 8.3 5.7M6.8 1.9v1.5"/>
    <path d="M9.4 19.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10 1 3.6 3.6 0 0 1 .5 6.8z"/>`),

  rain: draw(`<path d="M7.4 15.4a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M9 18.2 8.2 20.6M12.4 18.2l-.8 2.4M15.8 18.2l-.8 2.4"/>`),

  snow: draw(`<path d="M7.4 14.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M9 17.6v3M7.6 18.4l2.8 1.4M10.4 18.4l-2.8 1.4"/>
    <path d="M15 17.6v3M13.6 18.4l2.8 1.4M16.4 18.4l-2.8 1.4"/>`),

  fog: draw(`<path d="M7.4 12.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M4.4 16h15.2M6.4 19.4h11.2"/>`),

  wind: draw(`<path d="M3.4 8.4h9.4a2.7 2.7 0 1 0-2.7-2.7"/>
    <path d="M3.4 12.6h13.2a2.7 2.7 0 1 1-2.7 2.7"/>
    <path d="M3.4 16.8h6.2a2.5 2.5 0 1 1-2.5 2.5"/>`),

  drop: draw(`<path d="M12 3.4s5.6 6.1 5.6 9.8a5.6 5.6 0 0 1-11.2 0C6.4 9.5 12 3.4 12 3.4Z"/>`),

  /* Een druppel MET een procentteken erin. `drop` blijft de algemene druppel
     -- lekkage, water, nat -- en dit is de meting die een vochtsensor geeft.
     Twee iconen omdat het twee dingen zijn: een lekkage is geen percentage. */
  humidity: draw(`<path d="M12 3.4s5.6 6.1 5.6 9.8a5.6 5.6 0 0 1-11.2 0C6.4 9.5 12 3.4 12 3.4Z"/>
    <path d="M10.1 16.1 13.9 12"/>
    <circle cx="10.2" cy="12.3" r=".95"/>
    <circle cx="13.8" cy="15.8" r=".95"/>`),

  /* Licht dat op een sensorvlak valt. Niet nog een zonnetje: het onderwerp is
     de meting, dus het meetvlak staat eronder en vangt de stralen op. */
  lux: draw(`<circle cx="12" cy="6.9" r="2.8"/>
    <path d="M12 1.9v1.3M16.4 3.5l-.9.9M18.4 8.1h-1.3M5.6 8.1H4.3M7.6 4.4l.9.9"/>
    <path d="M8.6 14.1 9.7 12M12 14.5v-2.1M15.4 14.1 14.3 12"/>
    <path d="M5.6 16.2h12.8a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H5.6a1.2 1.2 0 0 1-1.2-1.2v-2.4a1.2 1.2 0 0 1 1.2-1.2Z"/>`),

  /* Wind MET een meter eronder. `wind` zegt dat het waait, dit zegt hoe hard. */
  windSpeed: draw(`<path d="M3.6 6.6h7.6a2.3 2.3 0 1 0-2.3-2.3"/>
    <path d="M3.6 10.6h4.8"/>
    <path d="M4.6 20.2a7.4 7.4 0 0 1 14.8 0"/>
    <path d="M12 20.2 16.2 15"/>
    <circle cx="12" cy="20.2" r=".9"/>`),

  /* De code die een weerdienst teruggeeft: een wolk met een cijferrooster. */
  weatherCode: draw(`<path d="M7.6 14.4a3.7 3.7 0 0 1-.5-7.4 4.9 4.9 0 0 1 9.5-1 3.4 3.4 0 0 1 .5 6.7"/>
    <path d="M10.6 16.4 9.8 21M15 16.4l-.8 4.6"/>
    <path d="M8.6 17.9h7.2M8.2 19.6h7.2"/>`),

  /* Voorspelling: een wolk met de lijn die de kant op gaat waar het heen gaat. */
  forecast: draw(`<path d="M7.4 11.8a3.6 3.6 0 0 1-.4-7.2 4.8 4.8 0 0 1 9.3-1 3.3 3.3 0 0 1 .5 6.5"/>
    <path d="m3.8 20.4 4.2-4.1 3 2.6 4.5-5.1"/>
    <path d="M15.9 12.8h4.3v4.3"/>`),

  /* De regenmeter: hoeveel er gevallen is, niet dát het regent. */
  rainfall: draw(`<path d="M7.6 2.6 6.7 4.8M12 2.2l-.9 2.2M16.4 2.6l-.9 2.2"/>
    <path d="M9.2 7.4h5.6a1 1 0 0 1 1 1v10.8a2.4 2.4 0 0 1-2.4 2.4h-2.8a2.4 2.4 0 0 1-2.4-2.4V8.4a1 1 0 0 1 1-1Z"/>
    <path d="M9.2 11.8h2.1M9.2 14.8h2.1M9.2 17.8h2.1"/>`),

  /* Het weerstation zelf: een mast met cupjes en een voet. */
  weatherStation: draw(`<path d="M12 8.2v12.4"/>
    <path d="M8.2 20.6h7.6"/>
    <circle cx="12" cy="6.4" r="1.1"/>
    <path d="M10.9 6.4H7.6a1.7 1.7 0 1 0 1.7 1.7"/>
    <path d="M13.1 6.4h3.3a1.7 1.7 0 1 1-1.7-1.7"/>
    <path d="M9.6 12.6h4.8M9.6 16h4.8"/>`),

  /* Buienradar: de ringen met de veeg, en de bui die eroverheen trekt. */
  rainRadar: draw(`<circle cx="12" cy="12" r="8.6"/>
    <circle cx="12" cy="12" r="4.3"/>
    <path d="M12 12 18.1 7.9"/>
    <circle cx="12" cy="12" r=".9"/>
    <path d="M8.6 16.2l-.8 1.9M11.4 17l-.8 1.9M14.2 16.2l-.8 1.9"/>`),

  uv: draw(`<circle cx="12" cy="11.4" r="3.4"/>
    <path d="M12 3.6v1.8M12 17.4v1.6M4.6 11.4h1.8M17.6 11.4h1.8M6.6 6l1.3 1.3M16.1 15.5l1.3 1.3M6.6 16.8l1.3-1.3M16.1 7.3l1.3-1.3"/>
    <path d="M8.4 21.4h7.2"/>`),

  sunset: draw(`<path d="M3.4 19.6h17.2M6.6 16.2a5.4 5.4 0 0 1 10.8 0"/>
    <path d="M12 3.2v3.4M5.2 6.6l1.8 1.8M18.8 6.6 17 8.4"/>`),

  sunrise: draw(`<path d="M3.4 19.6h17.2M6.6 16.2a5.4 5.4 0 0 1 10.8 0"/>
    <path d="M12 8.2V3.4M9.4 5.8 12 3.2l2.6 2.6"/>`),

  thermo: draw(`<path d="M14.2 14.6V5.6a2.2 2.2 0 1 0-4.4 0v9a4.2 4.2 0 1 0 4.4 0Z"/>
    <path d="M12 9.4v5.8"/>`),

  /* ---- status and generic ---- */
  shield: draw(`<path d="M12 3.2 4.8 5.9v5.5c0 4.4 3 8 7.2 9.4 4.2-1.4 7.2-5 7.2-9.4V5.9z"/>
    <path d="m9.1 12 2 2 3.8-4"/>`),

  bolt: draw(`<path d="M13.4 2.6 5.2 13.6h5.6L10.4 21.4l8.4-11.2h-5.6z"/>`),

  wifi: draw(`<path d="M4.2 9.2a11.4 11.4 0 0 1 15.6 0"/>
    <path d="M7.4 12.6a6.9 6.9 0 0 1 9.2 0"/>
    <path d="M10.4 15.9a2.6 2.6 0 0 1 3.2 0"/>
    <circle cx="12" cy="19" r="1.1"/>`),

  /* De melder zelf, aan het plafond, met twee sliertjes rook eronder. Het
     bestaande `smoke` is de rook; dit is het apparaat. */
  smokeDetector: draw(`<path d="M3 4.6h18"/>
    <path d="M6 4.6h12v5.4a2.6 2.6 0 0 1-2.6 2.6H8.6A2.6 2.6 0 0 1 6 10V4.6Z"/>
    <path d="M8.8 8h6.4"/>
    <circle cx="12" cy="10.2" r=".95" fill="currentColor" stroke="none"/>
    <path d="M8.8 16c1.5-1.3 2.8.5 4.3-.8M9.4 19.4c1.5-1.3 2.8.5 4.3-.8"/>`),

  /* Koolmonoxide: de twee letters. Een driehoek met een uitroepteken zegt
     "let op" en niet "CO", en dat verschil is op een melderkaart het hele
     punt -- daar staat naast rook, warmte en batterij ook nog een tweede
     alarmsoort. */
  co: draw(`<path d="M10.6 9.2A3.4 3.4 0 1 0 10.6 14.8"/>
    <circle cx="16.2" cy="12" r="3.2"/>`),
  /* Rook, en geen wolk.

     Hier stond een bol met drie streepjes eronder, en dat leest als een
     regenwolk -- op een rookmelderkaart is dat precies het verkeerde woord.
     Gemeld door de eigenaar op 25 augustus 2026, met de kaart ernaast. Rook
     is wat er OMHOOG kringelt, dus dat is wat er nu staat: drie slierten van
     verschillende hoogte. */
  smoke: draw(`<path d="M6.6 20.4c0-2.2 2.5-2.2 2.5-4.4S6.6 13.8 6.6 11.6 9.1 9.4 9.1 7.2"/>
    <path d="M12.7 20.4c0-2 2.2-2 2.2-4s-2.2-2-2.2-4 2.2-2 2.2-4"/>
    <path d="M18.3 20.4c0-1.8 1.9-1.8 1.9-3.6s-1.9-1.8-1.9-3.6"/>`),

  star: draw(`<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9.9 5.6L12 16.4l-5 2.6.9-5.6-4-3.9 5.6-.8z"/>`),

  moon: draw(`<path d="M20.4 14.3A8.6 8.6 0 0 1 9.7 3.6a8.8 8.8 0 1 0 10.7 10.7Z"/>`),

  radio: draw(`<rect x="2.8" y="8.4" width="18.4" height="11.4" rx="2"/>
    <path d="m7.4 8.4 9.8-4.2"/>
    <circle cx="15.8" cy="14.1" r="2.9"/>
    <path d="M6.2 12.2h4.4M6.2 16h4.4"/>`),

  /* ---- media. Getekend op de maat waarop ze werkelijk staan: 17px in een
     knop van 34. Een pauzeteken met drie strepen valt daar uit elkaar. ---- */
  play: draw(`<path d="M8.6 5.8 18.4 12l-9.8 6.2z"/>`),

  pause: draw(`<path d="M9.6 5.8v12.4M14.4 5.8v12.4"/>`),

  next: draw(`<path d="m6.4 6.4 8.2 5.6-8.2 5.6z"/><path d="M17.6 6.2v11.6"/>`),

  prev: draw(`<path d="m17.6 6.4-8.2 5.6 8.2 5.6z"/><path d="M6.4 6.2v11.6"/>`),

  volume: draw(`<path d="M4.4 9.4h3.2L12 5.9v12.2L7.6 14.6H4.4z"/>
    <path d="M15.4 9.6a3.4 3.4 0 0 1 0 4.8"/>
    <path d="M17.9 7.1a7 7 0 0 1 0 9.8"/>`),

  volumeMute: draw(`<path d="M4.4 9.4h3.2L12 5.9v12.2L7.6 14.6H4.4z"/>
    <path d="m15.8 9.8 4.4 4.4M20.2 9.8l-4.4 4.4"/>`),

  search: draw(`<circle cx="10.6" cy="10.6" r="6.2"/><path d="m15.2 15.2 4.4 4.4"/>`),

  shuffle: draw(`<path d="M3.6 7.6h3c1.2 0 2.3.6 3 1.6l4.2 5.6c.7 1 1.8 1.6 3 1.6h2.4"/>
    <path d="M3.6 16.4h3c1.2 0 2.3-.6 3-1.6"/>
    <path d="M13.8 9.2c.7-1 1.8-1.6 3-1.6h2.4"/>
    <path d="m17 5.4 2.2 2.2-2.2 2.2"/><path d="m17 14.2 2.2 2.2-2.2 2.2"/>`),

  repeat: draw(`<path d="M7.4 7.4h9.2a2.6 2.6 0 0 1 2.6 2.6v1.2"/>
    <path d="m9.6 5.2-2.2 2.2 2.2 2.2"/>
    <path d="M16.6 16.6H7.4a2.6 2.6 0 0 1-2.6-2.6v-1.2"/>
    <path d="m14.4 18.8 2.2-2.2-2.2-2.2"/>`),

  /* Herhalen van één nummer: dezelfde lus, met een 1 die je ook op 16px als een
     1 leest. De eerste poging was een kaal streepje in het midden, en dat werd
     op de kaart aangezien voor een lus met een streep erdoor -- "wat doet dat?"
     is dan een terechte vraag. Nu staat de 1 in een uitgespaard vlak, met een
     schuine aanzet en een voetje, zoals een cijfer hoort. */
  repeatOne: draw(`<path d="M7.4 7.4h9.2a2.6 2.6 0 0 1 2.6 2.6v1.2"/>
    <path d="m9.6 5.2-2.2 2.2 2.2 2.2"/>
    <path d="M16.6 16.6H7.4a2.6 2.6 0 0 1-2.6-2.6v-1.2"/>
    <path d="m14.4 18.8 2.2-2.2-2.2-2.2"/>
    <rect x="9.2" y="8.5" width="5.6" height="7" rx="1.4" fill="var(--icoon-vlak, #12120f)" stroke="none"/>
    <path d="M10.9 10.6 12.3 9.5v5"/>
    <path d="M11 14.5h2.6"/>`),

  /* Speakers koppelen: één speaker met een tweede die half achter hem staat. */
  speakers: draw(`<rect x="3.6" y="3.8" width="8.8" height="16.4" rx="2"/>
    <circle cx="8" cy="14.4" r="2.6"/><path d="M8 7.6h.1"/>
    <path d="M15.6 6.6h4.8v10.8h-4.8"/>`),

  music: draw(`<path d="M9.6 17.4V6.4l8.2-1.6v11"/>
    <ellipse cx="7.6" cy="17.6" rx="2.2" ry="1.9"/>
    <ellipse cx="15.8" cy="15.8" rx="2.2" ry="1.9"/>`),

  leaf: draw(`<path d="M4.6 19.6c-1.4-7.6 3.4-14 14.9-15.2 1.1 8.4-3.3 15.3-14.9 15.2Z"/>
    <path d="M4.2 20.4c2.6-4.6 6-7.6 10.4-9.6"/>`),

  /* Een keuzelijst. Drie regels met een markering voor de middelste: dat is
     "hier kies je er een uit", en niet "hier staat een lijst". */
  keuzelijst: draw(`<path d="M9.4 6.2h11.2M9.4 12h11.2M9.4 17.8h11.2"/>
    <path d="M3.4 12.2 4.9 13.7 7.6 10.6"/>
    <path d="M4 6.2h1.6M4 17.8h1.6"/>`),
  cog: draw(`<circle cx="12" cy="12" r="3.1"/>
    <path d="M12 3.4v2.2M12 18.4v2.2M20.6 12h-2.2M5.6 12H3.4M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6M18.1 18.1l-1.6-1.6M7.5 7.5 5.9 5.9"/>`),

  /* ---- rooms and devices, so a whole dashboard can be built from this set ---- */
  grid: draw(`<rect x="3.6" y="3.6" width="7.2" height="7.2" rx="1.8"/>
    <rect x="13.2" y="3.6" width="7.2" height="7.2" rx="1.8"/>
    <rect x="3.6" y="13.2" width="7.2" height="7.2" rx="1.8"/>
    <rect x="13.2" y="13.2" width="7.2" height="7.2" rx="1.8"/>`),

  door: draw(`<path d="M5.4 20.6h13.2"/>
    <path d="M6.8 20.6V4.6a.9.9 0 0 1 .9-.9h8.6a.9.9 0 0 1 .9.9v16"/>
    <circle cx="14.4" cy="12.4" r="1"/>`),

  window: draw(`<rect x="4.2" y="3.8" width="15.6" height="16.4" rx="1.6"/>
    <path d="M12 3.8v16.4M4.2 12h15.6"/>`),

  lock: draw(`<rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2"/>
    <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/>
    <circle cx="12" cy="15.3" r="1.2"/>`),

  lockOpen: draw(`<rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2"/>
    <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.4-1.1"/>
    <circle cx="12" cy="15.3" r="1.2"/>`),

  fan: draw(`<circle cx="12" cy="12" r="1.9"/>
    <path d="M12 10.1c0-3 .6-6.4 3-6.4 1.7 0 2.4 2.6-.4 4.6"/>
    <path d="M13.9 12c3 0 6.4.6 6.4 3 0 1.7-2.6 2.4-4.6-.4"/>
    <path d="M12 13.9c0 3-.6 6.4-3 6.4-1.7 0-2.4-2.6.4-4.6"/>
    <path d="M10.1 12c-3 0-6.4-.6-6.4-3 0-1.7 2.6-2.4 4.6.4"/>`),

  airco: draw(`<rect x="3.4" y="4.6" width="17.2" height="8.2" rx="2"/>
    <path d="M6.6 9.6h10.8"/>
    <path d="M7.4 16.2c1.6 0 1.6 2.2 3.2 2.2M13.4 16.2c1.6 0 1.6 2.2 3.2 2.2"/>`),

  tv: draw(`<rect x="2.8" y="4.4" width="18.4" height="12.2" rx="1.8"/>
    <path d="M8.4 20.2h7.2M12 16.6v3.6"/>`),

  speaker: draw(`<rect x="5.6" y="2.8" width="12.8" height="18.4" rx="2"/>
    <circle cx="12" cy="15" r="3.2"/><circle cx="12" cy="6.8" r="1.2"/>`),

  camera: draw(`<path d="M3.4 8.6A1.6 1.6 0 0 1 5 7h8a1.6 1.6 0 0 1 1.6 1.6v6.8A1.6 1.6 0 0 1 13 17H5a1.6 1.6 0 0 1-1.6-1.6z"/>
    <path d="m14.6 11 6-3v8l-6-3z"/>`),

  car: draw(`<path d="M4.2 15.4h15.6"/>
    <path d="M6.2 15.4v2.4a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-2.4M20.3 15.4v2.4a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-2.4"/>
    <path d="M3.8 15.4v-3.2l2-4.6a1.3 1.3 0 0 1 1.2-.8h10a1.3 1.3 0 0 1 1.2.8l2 4.6v3.2z"/>
    <circle cx="7.4" cy="12.5" r=".95"/><circle cx="16.6" cy="12.5" r=".95"/>`),

  plug: draw(`<path d="M9 3.4v5.2M15 3.4v5.2"/>
    <path d="M6.4 8.6h11.2v2.2a5.6 5.6 0 0 1-11.2 0z"/>
    <path d="M12 16.4v4.2"/>`),

  battery: draw(`<rect x="2.8" y="7.4" width="16.4" height="9.2" rx="2"/>
    <path d="M21.2 10.6v2.8"/>
    <rect x="5.2" y="9.8" width="6" height="4.4" rx="1" fill="currentColor" stroke="none"/>`),

  gaugeArrow: draw(`<path d="M4.2 17.4a8.4 8.4 0 1 1 15.6 0"/>
    <path d="m12 13.6 3.6-3.8"/><circle cx="12" cy="14.8" r="1.3"/>`),

  clock: draw(`<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 1.9"/>`),

  washer: draw(`<rect x="4.2" y="2.8" width="15.6" height="18.4" rx="2"/>
    <circle cx="12" cy="14" r="4.4"/>
    <path d="M4.2 7.4h15.6M15.4 5.1h1.6"/>`),

  dishwasher: draw(`<rect x="4.2" y="2.8" width="15.6" height="18.4" rx="2"/>
    <path d="M4.2 7.8h15.6M7.2 5.3h2.4"/>
    <path d="M9 11.4c1 1.4 1 2.8 0 4.2M12 11.4c1 1.4 1 2.8 0 4.2M15 11.4c1 1.4 1 2.8 0 4.2"/>`),

  printer: draw(`<path d="M7 9V4.6a.6.6 0 0 1 .6-.6h8.8a.6.6 0 0 1 .6.6V9"/>
    <rect x="3.6" y="9" width="16.8" height="7.2" rx="1.8"/>
    <path d="M7 15.4h10v4a.6.6 0 0 1-.6.6H7.6a.6.6 0 0 1-.6-.6z"/>`),

  key: draw(`<circle cx="7.8" cy="12" r="3.8"/>
    <path d="M11.6 12h8.6M17.4 12v3M20.2 12v2.2"/>`),

  power: draw(`<path d="M12 3.6v8"/>
    <path d="M17.4 6.6a7.6 7.6 0 1 1-10.8 0"/>`),

  plus: draw(`<path d="M12 5.2v13.6M5.2 12h13.6"/>`),
  minus: draw(`<path d="M5.2 12h13.6"/>`),

  chevronRight: draw(`<path d="m9.4 6.2 5.6 5.8-5.6 5.8"/>`),
  chevronDown: draw(`<path d="m6.2 9.4 5.8 5.6 5.8-5.6"/>`),
  close: draw(`<path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"/>`),
  check: draw(`<path d="m5.2 12.6 4.4 4.4 9.2-10"/>`),
  dots: draw(`<circle cx="5.4" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.6" cy="12" r="1.5"/>`),
  warning: draw(`<path d="M12 4.2 2.8 20h18.4z"/><path d="M12 10v4.4M12 17.4v.1"/>`),
  question: draw(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>`),

  pencil: draw(`<path d="M4.5 19.5h3.2L18.4 8.8a1.9 1.9 0 0 0 0-2.7l-.5-.5a1.9 1.9 0 0 0-2.7 0L4.5 16.3z"/>
    <path d="m14.6 6.8 2.6 2.6"/>`),

  /* Genummerde ringen, 1 tot en met 10.
     Getekend in dezelfde 1.6px-lijn als de rest, in een ring van r=8.6 zodat ze
     naast elk ander icoon uit de set even zwaar staan. De drie eerste zijn ook
     de standaardiconen van de scenekaart; de rest is er voor kanalen, zones,
     stappen -- alles waar een cijfer duidelijker is dan een plaatje. */
  een: draw(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10.6 9.9 12.4 8.6v6.9"/>`),

  twee: draw(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10 9.7a2.1 2.1 0 1 1 3.9 1.1L9.9 15.5h4.2"/>`),

  drie: draw(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10 9.5a2 2 0 1 1 1.8 2.6 2.1 2.1 0 1 1-1.7 2.7"/>`),

  vier: draw(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M13.4 8.6 9.7 13.3h5"/>
    <path d="M13.4 8.6v6.9"/>`),

  vijf: draw(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M14 8.7h-3.6v3.1h1.4a2.1 2.1 0 1 1-2 2.8"/>`),

  zes: draw(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M13.8 9a2.2 2.2 0 0 0-3.7 1.7v2.4"/>
    <circle cx="12.1" cy="13.4" r="2.1"/>`),

  zeven: draw(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M9.7 8.7h4.6l-2.8 6.8"/>`),

  acht: draw(`<circle cx="12" cy="12" r="8.6"/>
    <circle cx="12" cy="10.3" r="1.7"/>
    <circle cx="12" cy="13.8" r="1.9"/>`),

  negen: draw(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10.2 15a2.2 2.2 0 0 0 3.7-1.7v-2.4"/>
    <circle cx="11.9" cy="10.6" r="2.1"/>`),

  tien: draw(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M8.6 10.3 10 9.2v5.7"/>
    <ellipse cx="13.9" cy="12.1" rx="1.7" ry="2.8"/>`),

  /* ---- tien iconen die er op 26 augustus 2026 bij gevraagd zijn ----
     Allemaal op dezelfde 1.6 lijndikte; zie de kop van dit bestand. Wie er een
     bij tekent, tekent hem op die dikte -- een 2px icoon naast een 1.6px icoon
     is de snelste manier om een set te laten ophouden een set te zijn. ---- */

  /* Het strand: de zon boven twee golven. Geen palmboom -- die maakt er een
     vakantiebestemming van, en dit is een plek in huis of een modus. */
  beach: draw(`<circle cx="17" cy="6.6" r="2.6"/>
    <path d="M17 1.8v1.2M17 10.2v1.2M21.8 6.6h-1.2M13.4 6.6h-1.2M20.4 3.2l-.9.9M14.5 9.1l-.9.9"/>
    <path d="M2.4 15.4c1.6-1.5 3.2-1.5 4.8 0s3.2 1.5 4.8 0 3.2-1.5 4.8 0 3.2 1.5 4.8 0"/>
    <path d="M2.4 19.4c1.6-1.5 3.2-1.5 4.8 0s3.2 1.5 4.8 0 3.2-1.5 4.8 0 3.2 1.5 4.8 0"/>`),

  /* Slapen: drie Z's die kleiner worden, zoals in een stripverhaal. Het bed
     staat er al in de set; dit is de TOESTAND, niet de kamer. */
  sleep: draw(`<path d="M3.4 12.4h6.2l-6.2 7.2h6.2"/>
    <path d="M11.8 7.6h4.6l-4.6 5.4h4.6"/>
    <path d="M18.2 3.6h3.4l-3.4 4h3.4"/>`),

  /* De ketel: een kastje aan de muur met een vlam erin en twee leidingen
     eronder. Dat laatste is wat hem van een boiler onderscheidt. */
  boiler: draw(`<rect x="5" y="3.4" width="14" height="12.8" rx="1.8"/>
    <path d="M12 6.8c1.9 1.8 2.8 3.2 2.8 4.4a2.8 2.8 0 0 1-5.6 0c0-1.2.9-2.6 2.8-4.4z"/>
    <path d="M8.4 16.2v4M15.6 16.2v4"/>
    <path d="M6.8 20.2h3.2M14 20.2h3.2"/>`),

  /* Druk in bar: een manometer met wijzer en aansluiting. */
  pressure: draw(`<circle cx="12" cy="10.4" r="6.4"/>
    <path d="m12 10.4 3.2-3.2"/>
    <circle cx="12" cy="10.4" r=".8"/>
    <path d="M6.9 6.5 8 7.7M17.1 6.5 16 7.7M12 4v1.6"/>
    <path d="M9.6 16.2 8.8 20.4h6.4l-.8-4.2"/>`),

  /* Een melding: de klassieke bel. */
  bell: draw(`<path d="M17.8 16.6H6.2l1.5-2.3V10a4.3 4.3 0 0 1 8.6 0v4.3z"/>
    <path d="M10.2 19.2a2 2 0 0 0 3.6 0"/>
    <path d="M12 5.7V4.2"/>`),

  /* Bijvullen: een druppel die in een vat valt, met de vulstand erin. */
  refill: draw(`<path d="M12 2.8c1.7 2 2.6 3.5 2.6 4.6a2.6 2.6 0 0 1-5.2 0c0-1.1.9-2.6 2.6-4.6z"/>
    <path d="M5.8 11.8h12.4v6.6a2.2 2.2 0 0 1-2.2 2.2H8a2.2 2.2 0 0 1-2.2-2.2z"/>
    <path d="M5.8 15.6c1.4-1.2 2.7-1.2 4.1 0s2.7 1.2 4.1 0 2.7-1.2 4.2 0"/>`),

  /* Voetbal: de bal, met het middelste vlak en de naden eromheen. */
  football: draw(`<circle cx="12" cy="12" r="8.6"/>
    <path d="m12 7.3 3.7 2.7-1.4 4.4H9.7L8.3 10z"/>
    <path d="M12 7.3V3.4M15.7 10l3.7-1.2M14.3 14.4l2.3 3.1M9.7 14.4l-2.3 3.1M8.3 10 4.6 8.8"/>`),

  /* Sport in het algemeen: een bal en een racket, zodat het niet één tak van
     sport wordt. */
  sports: draw(`<circle cx="7.6" cy="15.6" r="4"/>
    <path d="M4.6 12.9a5.6 5.6 0 0 0 6 6"/>
    <ellipse cx="16.2" cy="7.6" rx="3.4" ry="4.2"/>
    <path d="M14.1 10.9 11 14.4"/>
    <path d="M13.6 6.2h5.2M13.4 8.8h5.6M15.3 3.7v7.8M17.4 3.9v7.6"/>`),

  /* Formule 1: twee wielen, een lage neus en een achtervleugel. */
  raceCar: draw(`<circle cx="7" cy="16.4" r="2.6"/>
    <circle cx="17.4" cy="16.4" r="2.6"/>
    <path d="M2.4 16.4h2M9.6 16.4h5.2M20 16.4h1.6"/>
    <path d="M4.4 14.2h1.4l1.6-2.4h4.2l1.6-2.6h2.4l.8 2.6h2.4l1.6 1.4-.4 1"/>
    <path d="M2.2 18.4h3.2M19.6 8.4h2.2M20.7 8.4v2.6"/>`),

  /* Een bewakingscamera: het huis heeft er al een fototoestel-icoon
     (`camera`); dit is de camera aan de muur, en die lijkt er niet op. */
  cctv: draw(`<path d="M3.8 9.5 16.2 6l1.3 4.6L5.1 14.1z"/>
    <path d="m17.9 10.9 2.9-.8-.6-2.2-2.9.8"/>
    <path d="M9.4 13.3v1.9a2.4 2.4 0 0 1-2.4 2.4H5"/>
    <path d="M5 15.4v5M3 20.4h4"/>`),

  /* ---- vijftien iconen die er op 26 augustus 2026 bij gevraagd zijn ----
     Zelfde lijndikte van 1.6 als de rest; zie de kop van dit bestand. ---- */

  /* Vloerverwarming: de leidingen die onder de vloer heen en weer lopen, met
     de vloer eronder. Geen radiator -- dat is juist wat het NIET is. */
  floorHeating: draw(`<path d="M2.8 20.6h18.4"/>
    <path d="M5.6 17.6V5.8a2 2 0 0 1 4 0v11.8a2 2 0 0 0 4 0V5.8a2 2 0 0 1 4 0v11.8"/>`),

  /* Warmtepomp: de buitenunit met zijn ventilator, en de warmte die eraf komt. */
  heatPump: draw(`<rect x="2.8" y="6.2" width="13.4" height="11.6" rx="1.8"/>
    <circle cx="9.5" cy="12" r="3.5"/>
    <circle cx="9.5" cy="12" r=".8"/>
    <path d="M9.5 8.5a3.5 3.5 0 0 1 3 1.8M9.5 15.5a3.5 3.5 0 0 1-3-1.8"/>
    <path d="M18.8 9.2c1.3 1.8 1.3 3.8 0 5.6M21.2 7.4c2 2.9 2 6.3 0 9.2"/>`),

  /* Een QR-code: de drie zoekvierkanten en wat blokjes. Genoeg om herkend te
     worden, niet zoveel dat het op 18 pixels dichtslibt. */
  qr: draw(`<rect x="3.4" y="3.4" width="6.4" height="6.4" rx="1.2"/>
    <rect x="14.2" y="3.4" width="6.4" height="6.4" rx="1.2"/>
    <rect x="3.4" y="14.2" width="6.4" height="6.4" rx="1.2"/>
    <path d="M6.5 6.6h.2M17.3 6.6h.2M6.5 17.4h.2"/>
    <path d="M14.2 14.2h2.8M14.2 17.6v3.2M17.8 20.8h3M20.6 14.2v3.2"/>`),

  /* De sirene: de koepel op zijn voet, met geluid eraf. */
  siren: draw(`<path d="M7 15.6a5 5 0 0 1 10 0z"/>
    <path d="M5.4 18.8h13.2a1 1 0 0 0 0-2H5.4a1 1 0 0 0 0 2z"/>
    <path d="M12 5.4v2M6.6 7.6l1.5 1.5M17.4 7.6l-1.5 1.5M2.8 13.2h2M19.2 13.2h2"/>`),

  /* Dezelfde sirene met een streep erdoor: uitzetten. Het geluid is weg, want
     dat is precies wat er niet meer gebeurt. */
  sirenOff: draw(`<path d="M7 15.6a5 5 0 0 1 10 0z"/>
    <path d="M5.4 18.8h13.2a1 1 0 0 0 0-2H5.4a1 1 0 0 0 0 2z"/>
    <path d="M3.6 3.6 20.4 20.4"/>`),

  /* Benzine: de pomp zelf. */
  petrol: draw(`<path d="M4.6 20.8V5.4a2 2 0 0 1 2-2h5.4a2 2 0 0 1 2 2v15.4"/>
    <path d="M3.2 20.8h12.2"/>
    <rect x="6.6" y="6.2" width="5.2" height="4.2" rx=".8"/>
    <path d="M14 9.6h2.2a1.6 1.6 0 0 1 1.6 1.6v5.6a1.6 1.6 0 0 0 3.2 0V8.4l-2.4-2.4"/>`),

  /* Diesel: dezelfde pomp met de druppel ernaast, want het verschil zit in wat
     eruit komt en niet in het apparaat. */
  diesel: draw(`<path d="M5 20.6V7.4a2 2 0 0 1 2-2h4.6a2 2 0 0 1 2 2v13.2"/>
    <path d="M3.6 20.6h11.4"/>
    <path d="M7.4 8.8h3.8M7.4 11.4h3.8"/>
    <path d="M18 8.6c1.6 1.9 2.4 3.2 2.4 4.3a2.4 2.4 0 0 1-4.8 0c0-1.1.8-2.4 2.4-4.3z"/>`),

  /* Gas: de vlam. Dubbel, zodat hij niet met een enkele waakvlam of met
     `boiler` verward wordt. */
  gas: draw(`<path d="M12 3.4c3.4 3.4 5.3 6.2 5.3 8.7a5.3 5.3 0 0 1-10.6 0c0-2.5 1.9-5.3 5.3-8.7z"/>
    <path d="M12 20.6a2.8 2.8 0 0 1-2.8-2.8c0-1.4 1-2.7 2.8-4.3 1.8 1.6 2.8 2.9 2.8 4.3a2.8 2.8 0 0 1-2.8 2.8z"/>`),

  /* Het tankstation: de luifel met de pomp eronder. */
  fuelStation: draw(`<path d="M2.6 8.4 12 3.6l9.4 4.8"/>
    <path d="M2.6 8.4h18.8"/>
    <path d="M7.6 20.6v-8.4h6.4v8.4"/>
    <path d="M6 20.6h9.6"/>
    <path d="M16.4 13.6h1.6a1.4 1.4 0 0 1 1.4 1.4v2.6a1.3 1.3 0 0 0 2.6 0v-5.4"/>`),

  /* Het klimaat in de woning: het huis met een thermometer erin. */
  homeThermo: draw(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
    <path d="M5.4 12.9V20a.9.9 0 0 0 .9.9h11.4a.9.9 0 0 0 .9-.9v-7.1"/>
    <path d="M10.6 17.3v-3.5a1.4 1.4 0 0 1 2.8 0v3.5a2.2 2.2 0 1 1-2.8 0z"/>`),

  /* De status van de woning: het huis met het vinkje. Alles in orde. */
  homeStatus: draw(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
    <path d="M5.4 12.9V20a.9.9 0 0 0 .9.9h11.4a.9.9 0 0 0 .9-.9v-7.1"/>
    <path d="m9.2 16.9 1.9 1.9 3.7-3.9"/>`),

  /* De lounge: een fauteuil. `sofa` is de brede bank; dit is de losse stoel,
     zodat een lounge en een woonkamer niet hetzelfde plaatje krijgen. */
  lounge: draw(`<path d="M6.4 10.8V7.6a2.4 2.4 0 0 1 2.4-2.4h6.4a2.4 2.4 0 0 1 2.4 2.4v3.2"/>
    <path d="M4.6 17.4v-4.6a2 2 0 0 1 4 0v1.4h6.8v-1.4a2 2 0 0 1 4 0v4.6z"/>
    <path d="M6.2 17.4v2M17.8 17.4v2"/>`),

  /* De sportschool: een halter. */
  dumbbell: draw(`<path d="M9.2 12h5.6"/>
    <rect x="6.2" y="8.6" width="3" height="6.8" rx="1"/>
    <rect x="14.8" y="8.6" width="3" height="6.8" rx="1"/>
    <path d="M3.6 10.2v3.6M20.4 10.2v3.6"/>`),

  /* Opslag: drie dozen met plakband erop. */
  storage: draw(`<rect x="3.2" y="12.4" width="8" height="8" rx="1"/>
    <rect x="12.8" y="12.4" width="8" height="8" rx="1"/>
    <rect x="8" y="3.4" width="8" height="8" rx="1"/>
    <path d="M6.4 12.4v2.4M16 12.4v2.4M11.2 3.4v2.4"/>`),

  /* Graden Celsius. */
  celsius: draw(`<circle cx="6.6" cy="7.2" r="2.6"/>
    <path d="M19.4 9.4a5.6 5.6 0 1 0 0 7.4"/>`),
};

/**
 * Het logo van DomotiTech.
 *
 * Geen getekend pad maar het bestand zelf, ingebakken als data-URI: dit is een
 * merk, en een merk hoort niet nagetekend te worden op onze lijndikte. Vandaar
 * ook dat het een `<img>` is en geen `<svg>` -- `currentColor` heeft er niets
 * te zoeken, het logo draagt zijn eigen kleuren. Dat mag: zie de kleurregel in
 * CLAUDE.md, waar iconen de uitzondering zijn.
 *
 * Gevraagd op 26 augustus 2026 voor een subknop in de navbalk die naar
 * domotitech.nl gaat; het bestand kwam diezelfde dag als `dev/domotitech.png`.
 */
icons.domotitech =
  `<img class="icon" alt="" aria-hidden="true" src="data:image/png;base64,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" />`;

/**
 * Turn whatever a config asked for into markup.
 *
 * A bare name is one of ours. Anything with a colon in it is Home Assistant's
 * -- `mdi:washing-machine` and the like -- and gets handed to <ha-icon>, which
 * HA has already loaded. That is the escape hatch for the long tail; the drawn
 * set stays the default so a screen keeps one line weight.
 *
 * @param {string|undefined|null} name
 * @param {string} fallback a key in `icons`, used when name is empty
 */
export function resolve(name, fallback = "question") {
  if (!name) return icons[fallback] ?? icons.question;
  if (icons[name]) return icons[name];
  if (name.includes(":")) return `<ha-icon class="icon" icon="${name}"></ha-icon>`;
  return icons[fallback] ?? icons.question;
}

/**
 * The icon a domain wears when the config does not say.
 *
 * Cover is deliberately split by device_class: a shutter and an awning are
 * different objects, and drawing both as a rectangle loses that.
 */
export function defaultIcon(entityId, attrs = {}) {
  const domain = String(entityId ?? "").split(".")[0];
  switch (domain) {
    case "light":
      return "bulb";
    case "switch":
      return "switchOn";
    case "cover":
      return attrs.device_class === "awning" || attrs.device_class === "blind"
        ? "awning"
        : "shutter";
    case "person":
    case "device_tracker":
      return "person";
    case "climate":
      return "thermo";
    case "binary_sensor":
      return attrs.device_class === "smoke" ? "smoke" : "shield";
    case "alarm_control_panel":
      return "shield";
    case "scene":
    case "script":
    case "input_button":
    case "button":
      return "star";
    case "weather":
      return "cloudSun";
    // Alles wat een moment draagt. `date` krijgt de kalender, de rest de klok --
    // en die twee zijn op een regel van 18 pixels nog uit elkaar te houden.
    case "date":
      return "calendar";
    case "time":
    case "datetime":
      return "clock";
    case "input_datetime":
      return attrs.has_time === false ? "calendar" : "clock";
    // Alles met een lijst standen. Zonder deze regel staat er een vraagteken
    // naast een keuzelijst, en dat leest als een kaart die de entiteit niet
    // kent -- gezien in de echte instance op 25 augustus 2026.
    case "input_select":
    case "select":
      return "keuzelijst";
    case "media_player":
      // Een tv is geen speaker. Wat er hangt is uit de entiteit zelf te lezen,
      // dus dat hoeft niemand in te stellen.
      if (attrs.device_class === "tv") return "tv";
      if (attrs.device_class === "receiver") return "radio";
      return "speaker";
    default:
      return "question";
  }
}

/** Map a weather state onto one of the drawn weather icons. */
export function weatherIcon(state) {
  switch (state) {
    case "sunny":
    case "clear-night":
      return "sun";
    case "partlycloudy":
      return "cloudSun";
    case "cloudy":
      return "cloud";
    case "rainy":
    case "pouring":
    case "hail":
    case "lightning":
    case "lightning-rainy":
      return "rain";
    case "snowy":
    case "snowy-rainy":
      return "snow";
    case "fog":
      return "fog";
    case "windy":
    case "windy-variant":
      return "wind";
    default:
      return "cloud";
  }
}
