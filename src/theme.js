/**
 * Design tokens for the DomotiApp card family.
 *
 * These are the Coach's tokens, copied verbatim from
 * domotiapp-coach/frontend/src/theme.js. They are not re-derived here and they
 * must not drift: the whole point of this package is that a card on the
 * dashboard and a tile in the Coach panel look like they came from one hand.
 * If a value changes there, change it here in the same commit.
 *
 * Sinds 0.54.0 staat hier MEER dan bij de Coach: een lichte set (lichtTokens)
 * en een handvol tokens die tussen donker en licht omkeren. De Coach heeft
 * alleen een donker paneel. De donkere waarden die ze delen zijn nog steeds
 * letterlijk dezelfde, en dat bewaakt tests/js/thema-contrast.test.mjs.
 *
 * The energy-stream hues were searched against the #12120f card surface under
 * the categorical rules (OKLCH lightness band, chroma floor, all-pairs CVD
 * separation, normal-vision floor and contrast). Do not swap them without
 * re-running that search -- the margins are tight.
 *
 * Red and green are deliberately absent from the identity colours: they are
 * reserved for status (kritiek / goed). A rolluik wearing green would read as
 * "in orde" rather than as "rolluik".
 *
 * Everything is declared on :host, so a card_mod block or a wrapping element
 * can still override a single token per card without forking this file.
 */

export const tokens = /* css */ `
  --dac-bg:            #0c0c0a;
  --dac-bg-raise:      #12120f;
  --dac-surface:       rgba(255, 255, 255, 0.038);
  --dac-surface-hi:    rgba(255, 255, 255, 0.070);
  --dac-border:        rgba(232, 228, 222, 0.10);
  --dac-border-hi:     rgba(232, 228, 222, 0.20);

  --dac-ink:           #e8e4de;
  --dac-ink-2:         rgba(232, 228, 222, 0.62);
  --dac-ink-3:         rgba(232, 228, 222, 0.38);

  --dac-accent:        #026fa1;
  --dac-accent-hi:     #198fd9;
  --dac-accent-soft:   rgba(2, 111, 161, 0.18);
  --dac-accent-glow:   rgba(25, 143, 217, 0.30);

  /* Energy streams -- validated categorical set. See the note above. */
  --dac-solar:         #dc7300;
  --dac-house:         #235efa;
  --dac-grid-in:       #129be4;
  --dac-grid-out:      #bc10c8;
  --dac-device-1:      #fd0774;
  --dac-device-2:      #039580;

  /* Status -- reserved meaning, always shipped with an icon and a label. */
  --dac-good:          #0ca30c;
  --dac-warn:          #fab219;
  --dac-bad:           #d03b3b;

  /* Light that is actually on. Warm, and distinct from --dac-warn, which means
     "let op". A lamp is not a warning. */
  --dac-lit:           #f5c451;

  --dac-radius:        20px;
  --dac-radius-sm:     12px;
  --dac-radius-pill:   999px;

  /* Home Assistant's own UI font, so the cards match the rest of HA. */
  --dac-font:          var(--ha-font-family-body,
                         var(--paper-font-body1_-_font-family,
                           Roboto, "Noto Sans", "Segoe UI", system-ui, sans-serif));

  /* Alleen de haarlijn bovenlangs, en GEEN slagschaduw meer.
   *
   * Er stond 0 18px 40px -24px rgba(0,0,0,0.9) bij. Op een kaart van drie
   * rijen valt dat weg, maar op een kaart van EEN rij -- een entiteitenkaart
   * met een regel erin, de meest gebruikte vorm in dit huis -- zit die
   * schaduw net zo hoog als de kaart zelf, en dan is het geen schaduw meer
   * maar een donkere vlek eronder. Staan er drie van die kaarten onder elkaar,
   * dan tellen de vlekken op tot banden.
   *
   * De eigenaar heeft daar sinds 0.10.0 zijn thema van verdacht. Het was dit,
   * en dat bleek toen hij zijn thema uitzette en de vlek bleef staan
   * (26 augustus 2026). Dit is dus een BEWUSTE afwijking van de tokens van de
   * Coach; verandert daar de schaduw, dan blijft deze regel staan. */
  --dac-shadow:        0 1px 0 rgba(255, 255, 255, 0.04) inset;

  /* One row height for every interactive card in the family, so a column of
     mixed cards lines up instead of stepping. */
  --dac-row-h:         56px;

  /* ---- Wat er tussen donker en licht OMKEERT --------------------------------
   *
   * Tot 0.54.0 stonden deze waarden los in de kaarten, als wit op een paar
   * procent. Op een donkere kaart is dat een tint; op een witte achtergrond is
   * wit op vijf procent niets. Ze staan nu hier, met in donker precies de
   * waarde die er stond, zodat het lichte thema ze kan omkeren zonder dat er
   * in donker een pixel verschuift.
   *
   * --dac-tint is een kale r, g, b: de kleur waarmee een vlak zich van zijn
   * ondergrond afzet. Gebruik: rgba(var(--dac-tint), .05). */
  --dac-tint:          255, 255, 255;

  /* Wat de browser zelf tekent: keuzelijsten, tijdvelden, schuifbalken. */
  --dac-scheme:        dark;

  /* Tekst op een vlak in de accentkleur. Op het diepe accent is dat lichte
     inkt; op het heldere accent donkere, want wit op #198fd9 haalt 3,4:1. */
  --dac-on-accent:     #e8e4de;
  --dac-on-accent-hi:  #0c0c0a;

  /* Het waas achter een scherm dat over de pagina ligt. */
  --dac-scrim:         color-mix(in srgb, #000 58%, transparent);

  /* Hoe zwaar een slagschaduw onder iets ZWEVENDS is (de navbalk, een menu,
     een vraag). Een factor en geen kleur: elke plek houdt zijn eigen maat en
     vermenigvuldigt zijn alfa hiermee. Op wit is dezelfde schaduw een vlek. */
  --dac-diepte:        1;

  /* De schuifschakelaar. In donker is de knop inkt op een getint spoor; in
     licht een witte knop met een schaduwtje, zoals een schakelaar op een licht
     scherm eruit hoort te zien. */
  --dac-knob:          var(--dac-ink);
  --dac-knob-uit:      var(--dac-ink-2);
  --dac-knob-schaduw:  none;
  --dac-spoor-aan:     28%;
  --dac-spoor-rand:    55%;

  /* Een DICHT invoerveld: het tijdveld en de keuzelijsten van de wekker. Dicht
     en niet doorschijnend, omdat de browser het uitklappaneel van een
     keuzelijst met deze kleur tekent. Tot 0.54.0 was dit de kaartkleur van
     het thema van Home Assistant (#1c1c1c in het standaardthema); een vaste
     waarde, zodat het veld leesbaar blijft als onze instelling en het thema
     van Home Assistant het niet eens zijn. */
  --dac-veld:          #1b1b19;
`;

/**
 * Het lichte thema: dezelfde namen, andere waarden.
 *
 * GEEN OMGEKEERD DONKER. Een donkere kaart zet zich af door LICHTER te zijn dan
 * zijn ondergrond, een lichte door een tikje donkerder: op een witte pagina is
 * de kaart een zachtgrijs vlak met een haarlijn, en alles wat erin ligt stapelt
 * daar nog een tint bovenop. De inkt is bijna zwart met een warme zweem, net
 * zoals de lichte inkt geen zuiver wit is.
 *
 * WAAR DE WAARDEN VANDAAN KOMEN
 *
 * Vlak, rand en inkt zijn die van het infoscherm, dat sinds 0.36.0 een lichte
 * uitvoering heeft en bij een klant op een iPad hangt. De inktladder is een
 * stap zwaarder gezet (68% en 50% in plaats van 66% en 42%): het infoscherm
 * heeft grote letters, een kaart van 56 pixels niet. De grond (wat een scherm
 * dat over de pagina ligt als achtergrond krijgt) is lichter dan daar, zodat
 * hij op een witte pagina niet als een beige vlak afsteekt.
 *
 * Accent, status en lampgeel zijn DONKERDER dan in donker. Het heldere accent
 * (#198fd9) haalt op een lichte kaart 3,1:1 en de lamp (#f5c451) 1,5:1 -- op
 * donker zijn dat de kleuren die het best lezen, op wit de slechtste. De
 * waarden hieronder zijn uitgerekend tegen het lichte kaartvlak op wit; de
 * toets staat in tests/js/thema-contrast.test.mjs.
 *
 * De zes identiteitskleuren (zon, huis, net, apparaten) zijn NIET aangepast.
 * Die zijn als set doorgezocht op onderlinge afstand, en die afstand verandert
 * niet van de achtergrond. Ze staan daarom niet in deze lijst.
 */
export const lichtTokens = /* css */ `
  --dac-bg:            #f6f5f2;
  --dac-bg-raise:      #ffffff;
  --dac-surface:       rgba(20, 20, 10, 0.045);
  --dac-surface-hi:    rgba(20, 20, 10, 0.080);
  --dac-border:        rgba(20, 20, 10, 0.11);
  --dac-border-hi:     rgba(20, 20, 10, 0.22);

  --dac-ink:           #1a1a17;
  --dac-ink-2:         rgba(26, 26, 23, 0.68);
  --dac-ink-3:         rgba(26, 26, 23, 0.50);

  --dac-accent:        #026fa1;
  --dac-accent-hi:     #0672a8;
  --dac-accent-soft:   rgba(2, 111, 161, 0.12);
  --dac-accent-glow:   rgba(2, 111, 161, 0.22);

  --dac-good:          #0b850b;
  --dac-warn:          #b07400;
  --dac-bad:           #c62f2f;

  --dac-lit:           #c98d00;

  /* Op wit is er geen haarlijn bovenlangs nodig: de rand doet het werk. */
  --dac-shadow:        none;

  --dac-tint:          20, 20, 10;
  --dac-scheme:        light;

  --dac-on-accent:     #ffffff;
  --dac-on-accent-hi:  #ffffff;

  --dac-scrim:         rgba(20, 20, 10, 0.34);
  --dac-diepte:        0.3;

  --dac-knob:          #ffffff;
  --dac-knob-uit:      #ffffff;
  --dac-knob-schaduw:  0 1px 2px rgba(20, 20, 10, 0.30);
  --dac-spoor-aan:     82%;
  --dac-spoor-rand:    82%;

  --dac-veld:          #ffffff;
`;

/**
 * Wat elk element van de familie naast zijn tokens nodig heeft om het thema te
 * volgen. Zet dit ACHTER het eigen :host-blok.
 *
 * DE MEETPROP
 *
 * Of het dashboard licht of donker is, lezen we af aan de tekstkleur van het
 * thema van Home Assistant. Die staat in --primary-text-color, maar daar kan
 * van alles in staan: een naam (white), een var(), een color-mix(). Wie dat als
 * tekst uitleest moet de halve CSS-kleurensyntaxis nabouwen. Dus laten we de
 * browser het werk doen: de variabele gaat in een echte kleureigenschap, en
 * getComputedStyle geeft die terug als rgb(). column-rule-color is gekozen
 * omdat hij niet erft en buiten een kolommenindeling niets tekent.
 *
 * Zie thema.js voor wie dit uitleest en thema-logica.js voor de beslissing.
 */
export const themaCss = /* css */ `
  :host {
    column-rule-color: var(--primary-text-color, transparent);
    color-scheme: var(--dac-scheme);
  }
  :host([dac-thema="licht"]) { ${lichtTokens} }
`;

/** Styles every card in the family shares. */
export const baseCss = /* css */ `
  *, *::before, *::after { box-sizing: border-box; }

  /* Het kaartvlak: vulling, rand, hoeken en schaduw.
   *
   * "Achtergrond weglaten" (bare: true) haalt hiervan de VULLING en de
   * SCHADUW weg, en laat de rand en de hoeken staan. Dat was tot 0.10.0 anders
   * -- toen ging de rand mee, en dan houd je geen doorzichtige kaart over maar
   * losse inhoud zonder vorm. Op een donker dashboard is die haarlijn het
   * enige dat nog zegt waar de kaart begint en ophoudt; de eigenaar miste hem
   * op 26 augustus 2026 op de eerste kaart waar hij het vinkje aanzette. Wie
   * echt niets wil, zet de kaart in een surface: none (entiteitenkaart) of
   * laat het vinkje uit en gebruikt geen kaart. */
  .surface {
    background: var(--dac-surface);
    border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius);
    box-shadow: var(--dac-shadow);
  }

  .eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dac-ink-3);
  }

  /* Numerals must line up as values change -- never let them jitter. */
  .tnum { font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1; }

  /* The icon chip: identity colour at low opacity, icon at full. Used by every
     card in the family, which is most of why they read as a set. */
  .chip {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: var(--dac-radius-sm);
    color: var(--tone);
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 32%, transparent);
  }

  /* Draagt de entiteit een eigen afbeelding -- een clublogo, een profielfoto,
     het merk van een integratie -- dan vult die de chip helemaal. Een logo in
     een hoekje van 18 pixels is geen logo meer. De rand blijft staan, zodat de
     vorm klopt met de iconen ernaast. */
  .chip.pic {
    overflow: hidden;
    background: rgba(var(--dac-tint), 0.06);
    border-color: var(--dac-border);
  }
  .chip.pic img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .icon { display: block; }

  /* Safari on iOS leaves a tapped element focused and draws a heavy ring around
     it that stays after the sheet it opened is closed again. Keyboard users are
     not left without: :focus-visible below still marks the element. */
  button, [role="button"] {
    -webkit-tap-highlight-color: transparent;
  }

  :focus-visible {
    outline: 2px solid var(--dac-accent-hi);
    outline-offset: 2px;
    border-radius: 8px;
  }

  .unavailable { opacity: 0.42; }

  /* Shown when a card has been added but not yet pointed at anything.
     A card that throws instead takes the whole preview down with "Ongeldige
     configuratie", which tells the installer nothing about what is missing. */
  .needs {
    display: flex; align-items: center; gap: 14px;
    min-height: var(--dac-raster, 56px);
    padding: 18px 18px;
    background: var(--dac-surface);
    border: 1px dashed var(--dac-border-hi);
    border-radius: var(--dac-radius);
  }
  .needs .mark {
    width: 40px; height: 40px; flex: 0 0 auto;
    display: grid; place-items: center; border-radius: var(--dac-radius-sm);
    color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 32%, transparent);
  }
  .needs .mark .icon { width: 20px; height: 20px; }
  .needs b { display: block; font-size: 13.5px; font-weight: 600; }
  .needs span { display: block; margin-top: 2px; font-size: 12.5px; color: var(--dac-ink-2); }
  /* Een knop in een foutblok. Alleen daar waar opnieuw proberen ergens toe
     leidt -- een verkeerde entiteit wordt niet beter van nog een poging, een
     integratie die nog aan het opstarten was wel. */
  .needs button.opnieuw {
    display: inline-block; margin-top: 8px;
    font: inherit; font-size: 12px; font-weight: 500; cursor: pointer;
    padding: 6px 12px; border-radius: var(--dac-radius-pill);
    border: 1px solid var(--dac-border-hi);
    background: transparent; color: var(--dac-ink);
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

/** Build a constructable stylesheet once per component class. */
export function sheet(css) {
  const s = new CSSStyleSheet();
  s.replaceSync(css);
  return s;
}
