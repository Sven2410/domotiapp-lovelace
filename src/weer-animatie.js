/**
 * Bewegende weericonen voor het infoscherm.
 *
 * Gevraagd op 10 september 2026: *"Ook wil ik gewoon beweegbare icons hebben
 * voor de weerkaart zoals regen bewolkt etc."* De iconen in `icons.js` zijn
 * stil en dat hoort zo op een dashboardkaart van één rasterrij; op een
 * wachtkamerscherm van elf inch mag de regen vallen.
 *
 * HOE HET IN ELKAAR ZIT
 *
 * Dezelfde tekenstijl als `icons.js` (viewBox 24, lijn 1.6, `currentColor`),
 * opgebouwd uit losse delen -- zon, maan, wolk, druppels, vlokken, flits,
 * mist, wind -- die elk een klasse dragen. De beweging staat NIET in de SVG
 * maar in de CSS van de kaart (`weerAnimatieCss`), zodat de kaart hem ook
 * kan uitzetten: de receptie heeft daar een schakelaar voor.
 *
 * De kleuren komen uit de thematokens: de zon is `--dac-solar`, regen en
 * sneeuw zijn `--dac-grid-in` (lichtblauw), de flits `--dac-solar`. Geen
 * rood en geen groen -- die zijn voor status (CLAUDE.md, vormregels).
 *
 * WAAROM DE REDUCED-MOTION-REGEL HIER NIET GELDT
 *
 * `baseCss` in theme.js zet elke animatie uit als het toestel om minder
 * beweging vraagt, en dat is goed voor een dashboard. Dit is een
 * weerpictogram op een scherm dat zelf niets anders doet dan informeren;
 * de beweging is langzaam (seconden per cyclus, geen knipperen behalve de
 * flits, en die komt eens per vier seconden) en is precies waar de eigenaar
 * om vroeg. Zijn eigen Chrome staat op reduced motion (CLAUDE.md, *Meten in
 * een echte browser*), dus zonder deze uitzondering zou hij bij het testen
 * niets zien bewegen. Uitzetten kan altijd nog met de schakelaar.
 */

const S = (klasse, body) => `<g class="${klasse}">${body}</g>`;

/* ------------------------------------------------------------ delen */

const ZON = (x = 12, y = 12, r = 4.6, k = 1) =>
  S(
    "wa-zon",
    `<circle class="wa-zonkern" cx="${x}" cy="${y}" r="${r}"/>` +
      S(
        "wa-stralen",
        [0, 45, 90, 135, 180, 225, 270, 315]
          .map((hoek) => {
            const a = (hoek * Math.PI) / 180;
            const r1 = r + 2.2 * k;
            const r2 = r + 3.9 * k;
            return `<line x1="${(x + Math.cos(a) * r1).toFixed(2)}" y1="${(y + Math.sin(a) * r1).toFixed(2)}" x2="${(x + Math.cos(a) * r2).toFixed(2)}" y2="${(y + Math.sin(a) * r2).toFixed(2)}"/>`;
          })
          .join("")
      )
  );

const MAAN = (x = 12, y = 12, k = 1) =>
  S(
    "wa-maan",
    `<path transform="translate(${x - 12 * k} ${y - 12 * k}) scale(${k})" d="M20.2 13.6A8.4 8.4 0 0 1 10.4 3.8a8.4 8.4 0 1 0 9.8 9.8z"/>` +
      `<circle class="wa-ster" cx="${x + 6.5 * k}" cy="${y - 7 * k}" r="0.7"/>` +
      `<circle class="wa-ster" cx="${x + 8.5 * k}" cy="${y - 3.5 * k}" r="0.5"/>`
  );

/* Een wolk met zijn onderkant op y=15 (in de 24-box), geschaald met k en
   verschoven met dx/dy. Met `k` kleiner past er een zon boven. */
const WOLK = (dx = 0, dy = 0, k = 1) =>
  S(
    "wa-wolk",
    `<path transform="translate(${dx} ${dy}) scale(${k})" d="M7 17.5h10.2a3.8 3.8 0 0 0 .5-7.6A5.8 5.8 0 0 0 6.6 8.8 4.3 4.3 0 0 0 7 17.5z"/>`
  );

const DRUPPELS = (n = 3, snel = false) =>
  S(
    `wa-regen ${snel ? "snel" : ""}`,
    Array.from({ length: n }, (_, i) => {
      const x = 8 + (i * 8) / Math.max(1, n - 1);
      return `<line class="wa-druppel" x1="${x}" y1="19" x2="${x - 0.8}" y2="21.8"/>`;
    }).join("")
  );

const VLOKKEN = (n = 3) =>
  S(
    "wa-sneeuw",
    Array.from({ length: n }, (_, i) => {
      const x = 8 + (i * 8) / Math.max(1, n - 1);
      return `<circle class="wa-vlok" cx="${x}" cy="20.4" r="0.9"/>`;
    }).join("")
  );

const HAGEL = () =>
  S(
    "wa-hagel",
    [8, 12, 16].map((x) => `<circle class="wa-korrel" cx="${x}" cy="20.4" r="0.8"/>`).join("")
  );

const FLITS = () => S("wa-bliksem", `<path class="wa-flits" d="M12.6 12.4l-2.8 4.4h3l-1.6 4.2 3.6-5.2h-3z"/>`);

const MIST = () =>
  S(
    "wa-mist",
    `<line x1="4" y1="10" x2="20" y2="10"/><line x1="6" y1="14" x2="18" y2="14"/><line x1="4.5" y1="18" x2="19.5" y2="18"/>`
  );

const WIND = () =>
  S(
    "wa-windlijnen",
    `<path class="wa-wind" d="M3 9.5h10.5a2.3 2.3 0 1 0-2.3-2.3"/>` +
      `<path class="wa-wind" d="M3 14h14.5a2.6 2.6 0 1 1-2.6 2.6"/>` +
      `<path class="wa-wind" d="M3 18.5h7.5a1.8 1.8 0 1 1-1.8 1.8"/>`
  );

const UITZONDERLIJK = () =>
  S("wa-let-op", `<path d="M12 4.2 2.8 19.6h18.4z"/><path d="M12 10.2v4.6M12 17.6v.1"/>`);

/* ------------------------------------------------------------ samenstellen */

const SAMENSTELLING = {
  sunny: () => ZON(12, 12, 4.8),
  "clear-night": () => MAAN(),
  partlycloudy: (nacht) => (nacht ? MAAN(16, 7.5, 0.55) : ZON(16.5, 7.5, 2.9, 0.7)) + WOLK(-1.2, 1.6, 0.95),
  cloudy: () => S("wa-wolk achter", `<path transform="translate(5 -3.5) scale(.62)" d="M7 17.5h10.2a3.8 3.8 0 0 0 .5-7.6A5.8 5.8 0 0 0 6.6 8.8 4.3 4.3 0 0 0 7 17.5z"/>`) + WOLK(-1, 1.8, 0.95),
  rainy: () => WOLK(0, -1.5, 0.95) + DRUPPELS(3),
  pouring: () => WOLK(0, -1.5, 0.95) + DRUPPELS(4, true),
  hail: () => WOLK(0, -1.5, 0.95) + HAGEL(),
  lightning: () => WOLK(0, -2, 0.95) + FLITS(),
  "lightning-rainy": () => WOLK(0, -2, 0.95) + FLITS() + DRUPPELS(2),
  snowy: () => WOLK(0, -1.5, 0.95) + VLOKKEN(3),
  "snowy-rainy": () => WOLK(0, -1.5, 0.95) + S("wa-regen", `<line class="wa-druppel" x1="9" y1="19" x2="8.2" y2="21.8"/>`) + S("wa-sneeuw", `<circle class="wa-vlok" cx="15" cy="20.4" r="0.9"/>`),
  fog: () => MIST(),
  windy: () => WIND(),
  "windy-variant": () => WOLK(1.5, -3, 0.75) + WIND(),
  exceptional: () => UITZONDERLIJK(),
};

/**
 * Het bewegende icoon voor een toestand van een `weather`-entiteit.
 *
 * @param {string} toestand  de state van de entiteit, of een `condition` uit de voorspelling
 * @param {boolean} [nacht]  dan de maan in plaats van de zon bij "partlycloudy"
 * @returns {string} SVG-markup
 */
export function weerAnimatie(toestand, nacht = false) {
  const maak = SAMENSTELLING[toestand] ?? SAMENSTELLING.cloudy;
  return (
    `<svg class="icon wa" data-weer="${toestand ?? ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
    `stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${maak(nacht)}</svg>`
  );
}

/** De Nederlandse naam van een toestand, voor onder het icoon. */
export const WEER_NAAM = {
  sunny: "Zonnig",
  "clear-night": "Heldere nacht",
  partlycloudy: "Half bewolkt",
  cloudy: "Bewolkt",
  rainy: "Regen",
  pouring: "Stortregen",
  hail: "Hagel",
  lightning: "Onweer",
  "lightning-rainy": "Onweer met regen",
  snowy: "Sneeuw",
  "snowy-rainy": "Natte sneeuw",
  fog: "Mist",
  windy: "Winderig",
  "windy-variant": "Winderig en bewolkt",
  exceptional: "Uitzonderlijk weer",
};

/**
 * De CSS die de delen laat bewegen. Hoort in de kaart die de iconen tekent;
 * met `.stil` op een voorouder staat alles stil.
 */
export const weerAnimatieCss = /* css */ `
  .wa { overflow: visible; }
  .wa .wa-zon { color: var(--dac-solar); }
  .wa .wa-maan { color: var(--dac-ink-2); }
  .wa .wa-ster { fill: currentColor; stroke: none; }
  .wa .wa-druppel { stroke: var(--dac-grid-in); }
  .wa .wa-vlok { fill: var(--dac-grid-in); stroke: none; }
  .wa .wa-korrel { fill: var(--dac-grid-in); stroke: none; }
  .wa .wa-flits { fill: var(--dac-solar); stroke: var(--dac-solar); stroke-width: 0.6; }
  .wa .wa-mist line, .wa .wa-wind { stroke: var(--dac-ink-2); }
  .wa .wa-let-op { color: var(--dac-warn); }
  .wa .achter { color: var(--dac-ink-3); }

  .wa .wa-stralen { transform-box: fill-box; transform-origin: center; animation: wa-draai 36s linear infinite; }
  .wa .wa-zonkern { transform-box: fill-box; transform-origin: center; animation: wa-puls 4s ease-in-out infinite; }
  .wa .wa-wolk { animation: wa-zweef 5s ease-in-out infinite alternate; }
  .wa .wa-wolk.achter { animation-duration: 7s; animation-direction: alternate-reverse; }
  .wa .wa-druppel { animation: wa-regen 1.5s linear infinite; }
  .wa .wa-druppel:nth-child(2) { animation-delay: -0.5s; }
  .wa .wa-druppel:nth-child(3) { animation-delay: -1s; }
  .wa .wa-druppel:nth-child(4) { animation-delay: -0.25s; }
  .wa .wa-regen.snel .wa-druppel { animation-duration: 0.9s; }
  .wa .wa-vlok { animation: wa-sneeuw 3.2s ease-in-out infinite; }
  .wa .wa-vlok:nth-child(2) { animation-delay: -1.1s; }
  .wa .wa-vlok:nth-child(3) { animation-delay: -2.2s; }
  .wa .wa-korrel { animation: wa-regen 0.8s linear infinite; }
  .wa .wa-korrel:nth-child(2) { animation-delay: -0.3s; }
  .wa .wa-korrel:nth-child(3) { animation-delay: -0.55s; }
  .wa .wa-flits { animation: wa-flits 4s linear infinite; }
  .wa .wa-mist line { animation: wa-mist 6s ease-in-out infinite alternate; }
  .wa .wa-mist line:nth-child(2) { animation-delay: -2s; animation-direction: alternate-reverse; }
  .wa .wa-mist line:nth-child(3) { animation-delay: -4s; }
  .wa .wa-wind { stroke-dasharray: 9 5; animation: wa-wind 2.4s linear infinite; }
  .wa .wa-wind:nth-child(2) { animation-delay: -0.8s; }
  .wa .wa-wind:nth-child(3) { animation-delay: -1.6s; }
  .wa .wa-maan { transform-box: fill-box; transform-origin: center; animation: wa-puls 7s ease-in-out infinite; }
  .wa .wa-ster { animation: wa-twinkel 3s ease-in-out infinite; }
  .wa .wa-ster:nth-child(3) { animation-delay: -1.4s; }

  .stil .wa * { animation: none !important; }

  @keyframes wa-draai { to { transform: rotate(360deg); } }
  @keyframes wa-puls { 50% { transform: scale(1.06); } }
  @keyframes wa-zweef { from { transform: translateX(-0.5px); } to { transform: translateX(0.5px); } }
  @keyframes wa-regen { 0% { transform: translateY(-1.6px); opacity: 0; } 25% { opacity: 1; } 75% { opacity: 1; } 100% { transform: translateY(2.4px); opacity: 0; } }
  @keyframes wa-sneeuw { 0% { transform: translate(0, -1.8px); opacity: 0; } 25% { opacity: 1; } 60% { transform: translate(0.7px, 0.6px); } 100% { transform: translate(-0.3px, 2.6px); opacity: 0; } }
  @keyframes wa-flits { 0%, 84% { opacity: 0.3; } 87% { opacity: 1; } 89% { opacity: 0.35; } 92% { opacity: 1; } 100% { opacity: 0.3; } }
  @keyframes wa-mist { from { transform: translateX(-1.2px); } to { transform: translateX(1.2px); } }
  @keyframes wa-wind { to { stroke-dashoffset: -28; } }
  @keyframes wa-twinkel { 50% { opacity: 0.2; } }

  /* Zie de kop van weer-animatie.js: hier bewust wél bewegen, ook met
     prefers-reduced-motion. De regel in baseCss heeft dezelfde specificiteit
     als de klassen hierboven niet halen; daarom hier met !important, en met
     een langere selector zodat hij wint. */
  @media (prefers-reduced-motion: reduce) {
    .wa.wa .wa-stralen { animation-duration: 36s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-zonkern, .wa.wa .wa-maan { animation-duration: 4s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-wolk { animation-duration: 5s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-druppel { animation-duration: 1.5s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-regen.snel .wa-druppel { animation-duration: 0.9s !important; }
    .wa.wa .wa-vlok { animation-duration: 3.2s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-korrel { animation-duration: 0.8s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-flits { animation-duration: 4s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-mist line { animation-duration: 6s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-wind { animation-duration: 2.4s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-ster { animation-duration: 3s !important; animation-iteration-count: infinite !important; }
    .stil .wa.wa * { animation: none !important; }
  }
`;
