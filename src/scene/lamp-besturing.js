/**
 * Welke besturing hoort bij welke lamp, en welke waarde krijgt een lamp bij de
 * eerste aanraking (SPEC 6 en SPEC 7).
 *
 * Bewust een pure module: geen lit, geen DOM, geen `hass`. Alles hier is een
 * functie van (stateObject, huidige waarde) naar een nieuwe waarde in het
 * opslagschema van SPEC 10.4. Daardoor is het in een gewone `node --test` te
 * toetsen, zonder jsdom — en jsdom zou over dit gedrag ook niets kunnen zeggen.
 *
 * De waarden die hier in en uit gaan zijn **exact** de objecten uit SPEC 10.4:
 *
 *   `{ state: "off" }`
 *   `{ state: "on", brightness?, color_temp_kelvin? | hs_color? }`
 *
 * `undefined` betekent **niet ingesteld** (SPEC 7.2). Er is geen vlag en geen
 * null-waarde; afwezigheid ís de toestand.
 */

/** Kleurmodi die een kleurkiezer verdienen (SPEC 6.1). */
export const KLEURMODI = ["hs", "rgb", "rgbw", "rgbww", "xy"];

export const MODUS_KLEURTEMP = "color_temp";
export const MODUS_ONOFF = "onoff";

/**
 * HA's eigen defaults, gebruikt als een lamp geen Kelvin-grenzen meldt
 * (SPEC 6.3; `components/light/const.py:93-94`).
 */
export const DEFAULT_MIN_KELVIN = 2000;
export const DEFAULT_MAX_KELVIN = 6535;

/** De opslag werkt op HA's eigen schaal 1..255 (SPEC 10.4). */
export const MIN_BRIGHTNESS = 1;
export const MAX_BRIGHTNESS = 255;

/**
 * De schaal waarop de **gebruiker** helderheid ziet en zet (SPEC 4.4).
 *
 * De opslag blijft 0..255; dit is uitsluitend de schaal van de regelaar en het
 * label. Zonder dit toonde het label "50 %" terwijl de tooltip van
 * `ha-control-slider` "127" liet zien — twee getallen voor hetzelfde.
 */
export const MIN_PROCENT = 1;
export const MAX_PROCENT = 100;

/** De twee standen van een lamp die kleur én kleurtemperatuur kan (SPEC 6.5). */
export const STAND_KLEUR = "kleur";
export const STAND_WIT = "wit";

/** States waarbij er geen huidige stand is om over te nemen (SPEC 7.3). */
export const NIET_BESCHIKBAAR = ["unavailable", "unknown"];

/**
 * De vier kleurattributen uit het schema. Er staat er hooguit één in een
 * waarde; deze lijst is er om de andere drie te kunnen wissen zodra er één
 * gezet wordt (SPEC 10.4).
 */
export const KLEURSLEUTELS = [
  "color_temp_kelvin",
  "rgb_color",
  "hs_color",
  "xy_color",
];

/** Wat de kleurkiezer toont zolang noch de waarde noch de lamp een kleur heeft. */
export const STANDAARD_HS = [0, 100];

/**
 * Welke besturing hoort bij deze lamp (SPEC 6.1).
 *
 * Let op de regel uit SPEC 6.2: `brightness` staat **niet** in
 * `supported_color_modes` zodra er een rijkere modus is. Er wordt dus nooit op
 * `brightness` gezocht. Alleen de exacte lijst `["onoff"]` betekent
 * niet-dimbaar; elke andere lijst krijgt een helderheidsregelaar.
 *
 * Een lamp die `unavailable` is heeft helemaal geen `supported_color_modes`:
 * Home Assistant schrijft de state attributes alleen weg voor een beschikbare
 * entiteit (`helpers/entity.py:1118-1124`, zie ook SPEC 5.1). Zo'n lamp is wél
 * instelbaar (SPEC 7.3), dus hij krijgt aan/uit plus helderheid — precies wat
 * de waarde bij het aanzetten — "aan op 100 %, zonder kleurattribuut" — nodig heeft.
 *
 * @param {{state: string, attributes?: object}|undefined|null} stateObj
 * @returns {{
 *   bekend: boolean, beschikbaar: boolean,
 *   helderheid: boolean, kleurtemp: boolean, kleur: boolean,
 *   minKelvin: number, maxKelvin: number, kelvinUitDefaults: boolean
 * }}
 */
export function bepaalBesturing(stateObj) {
  if (!stateObj) {
    // Niet in hass.states: geen besturing, wel een melding (SPEC 6.4).
    return {
      bekend: false,
      beschikbaar: false,
      helderheid: false,
      kleurtemp: false,
      kleur: false,
      minKelvin: DEFAULT_MIN_KELVIN,
      maxKelvin: DEFAULT_MAX_KELVIN,
      kelvinUitDefaults: false,
    };
  }

  const attributen = stateObj.attributes ?? {};
  const modi = Array.isArray(attributen.supported_color_modes)
    ? attributen.supported_color_modes
    : null;

  const alleenAanUit =
    modi !== null && modi.length === 1 && modi[0] === MODUS_ONOFF;

  const kleurtemp = modi !== null && modi.includes(MODUS_KLEURTEMP);
  const kleur = modi !== null && modi.some((modus) => KLEURMODI.includes(modus));

  const min = attributen.min_color_temp_kelvin;
  const max = attributen.max_color_temp_kelvin;
  const grenzenBekend =
    typeof min === "number" && typeof max === "number" && min < max;

  return {
    bekend: true,
    beschikbaar: !NIET_BESCHIKBAAR.includes(stateObj.state),
    helderheid: !alleenAanUit,
    kleurtemp,
    kleur,
    minKelvin: grenzenBekend ? Math.round(min) : DEFAULT_MIN_KELVIN,
    maxKelvin: grenzenBekend ? Math.round(max) : DEFAULT_MAX_KELVIN,
    kelvinUitDefaults: kleurtemp && !grenzenBekend,
  };
}

/**
 * De stand die een **niet-ingestelde** lamp toont: altijd uit (SPEC 7.3).
 *
 * Dit is geen opgeslagen waarde — een niet-ingestelde lamp staat niet in de
 * opslag (SPEC 7.2) — maar wat de schakelaar laat zien zolang niemand de rij
 * heeft aangeraakt.
 *
 * Tot fase 4b-1-fix4 nam deze functie de huidige stand van de echte lamp over,
 * waardoor de schakelaar aan stond als de lamp toevallig brandde. Dat is
 * omgedraaid, om twee redenen: je ziet in één oogopslag welke lampen nog werk
 * nodig hebben, en een klant kan niet per ongeluk een lamp op vol vermogen
 * laten staan doordat hij hem net aan had.
 *
 * De huidige stand van de lamp blijft wél de bron voor helderheid en kleur —
 * alleen pas op het moment dat iemand de lamp aanzet. Zie `aanwaarde`.
 *
 * @returns {{state: "off"}}
 */
export function beginwaarde() {
  // Uit heeft geen andere sleutels (SPEC 10.4).
  return { state: "off" };
}

/**
 * De waarde die een lamp krijgt op het moment dat hij wordt **aangezet**.
 *
 * Hier zit het deel van SPEC 7.3 dat overeind blijft: helderheid en kleur komen
 * van de echte lamp zoals die er op dat moment bij staat. Dat maakt "zet de
 * kamer zoals ik hem wil hebben en tik elke lamp één keer aan" nog steeds de
 * snelste werkwijze.
 *
 * Staat de lamp op dat moment zelf uit, of is hij `unavailable` of `unknown`,
 * dan is er geen huidige stand om over te nemen en is het antwoord **aan op
 * 100 %, zonder kleurattribuut**. Bewust geen kleur: we weten niet welke
 * kleurmodus die lamp aankan zolang hij weg is, en een gegokt kleurattribuut
 * zou bij het toepassen kunnen falen.
 *
 * @param {object|undefined|null} stateObj
 * @param {object} [besturing]
 * @returns {{state: "on", brightness?: number, color_temp_kelvin?: number, hs_color?: number[]}}
 */
export function aanwaarde(stateObj, besturing) {
  const kan = besturing ?? bepaalBesturing(stateObj);

  if (kan.bekend && kan.beschikbaar && stateObj.state === "on") {
    return { state: "on", ...huidigeAttributen(stateObj, kan) };
  }

  return kan.helderheid
    ? { state: "on", brightness: MAX_BRIGHTNESS }
    : { state: "on" };
}

/** Zet de lamp aan of uit. Uit wist alles (SPEC 10.4). */
export function metAanUit(waarde, aan, stateObj, besturing) {
  if (!aan) {
    return { state: "off" };
  }
  if (waarde && waarde.state === "on") {
    return { ...waarde };
  }
  return aanwaarde(stateObj, besturing);
}

/**
 * Zet de helderheid.
 *
 * Een lamp die op "uit" stond gaat hiermee aan: `state: "off"` met een
 * `brightness` erbij zou een schemafout zijn, en "uit op 40 %" betekent niets.
 */
export function metHelderheid(waarde, brightness, stateObj, besturing) {
  const kan = besturing ?? bepaalBesturing(stateObj);
  const basis = basisAan(waarde, stateObj, kan);
  if (!kan.helderheid) {
    // Een ["onoff"]-lamp kent geen helderheid; het veld hoort er niet te staan.
    return basis;
  }
  basis.brightness = klem(brightness, MIN_BRIGHTNESS, MAX_BRIGHTNESS);
  return basis;
}

/** Zet de kleurtemperatuur in Kelvin (SPEC 6.3). Wist een eventuele kleur. */
export function metKleurtemp(waarde, kelvin, stateObj, besturing) {
  const kan = besturing ?? bepaalBesturing(stateObj);
  const basis = basisAan(waarde, stateObj, kan);
  wisKleur(basis);
  basis.color_temp_kelvin = klem(kelvin, kan.minKelvin, kan.maxKelvin);
  return basis;
}

/** Zet de kleur als `hs_color`. Wist een eventuele kleurtemperatuur. */
export function metKleur(waarde, hs, stateObj, besturing) {
  const kan = besturing ?? bepaalBesturing(stateObj);
  const basis = basisAan(waarde, stateObj, kan);
  wisKleur(basis);
  basis.hs_color = [klem(hs?.[0], 0, 360), klem(hs?.[1], 0, 100)];
  return basis;
}

/**
 * Wat de besturingen tonen: de ingestelde waarde, of — zolang de lamp niet
 * ingesteld is — uit (SPEC 7.3).
 *
 * `stateObj` en `besturing` doen er sinds fase 4b-1-fix4 niet meer toe voor een
 * niet-ingestelde lamp; ze staan er nog omdat elke andere functie in deze
 * module dezelfde vorm heeft en de aanroepers ze toch al bij de hand hebben.
 */
export function toonwaarde(waarde, _stateObj, _besturing) {
  return waarde ?? beginwaarde();
}

/** De stand van de helderheidsregelaar, ook als er niets is opgeslagen. */
export function toonHelderheid(waarde, stateObj, besturing) {
  const zicht = toonwaarde(waarde, stateObj, besturing);
  if (typeof zicht.brightness === "number") {
    return klem(zicht.brightness, MIN_BRIGHTNESS, MAX_BRIGHTNESS);
  }
  const huidig = stateObj?.attributes?.brightness;
  if (typeof huidig === "number") {
    return klem(huidig, MIN_BRIGHTNESS, MAX_BRIGHTNESS);
  }
  return MAX_BRIGHTNESS;
}

/** De stand van de kleurtemperatuurregelaar, ook als er niets is opgeslagen. */
export function toonKelvin(waarde, stateObj, besturing) {
  const kan = besturing ?? bepaalBesturing(stateObj);
  const zicht = toonwaarde(waarde, stateObj, kan);
  if (typeof zicht.color_temp_kelvin === "number") {
    return klem(zicht.color_temp_kelvin, kan.minKelvin, kan.maxKelvin);
  }
  const huidig = stateObj?.attributes?.color_temp_kelvin;
  if (typeof huidig === "number") {
    return klem(huidig, kan.minKelvin, kan.maxKelvin);
  }
  return Math.round((kan.minKelvin + kan.maxKelvin) / 2);
}

/** De stand van de kleurkiezer als `[tint, verzadiging]`. */
export function toonHs(waarde, stateObj, besturing) {
  const zicht = toonwaarde(waarde, stateObj, besturing);
  if (isHs(zicht.hs_color)) {
    return [klem(zicht.hs_color[0], 0, 360), klem(zicht.hs_color[1], 0, 100)];
  }
  const huidig = stateObj?.attributes?.hs_color;
  if (isHs(huidig)) {
    return [klem(huidig[0], 0, 360), klem(huidig[1], 0, 100)];
  }
  return [...STANDAARD_HS];
}

/**
 * Is deze lamp ingesteld?
 *
 * Afwezigheid ís de toestand "niet ingesteld" (SPEC 7.2). Er is geen vlag en
 * geen null-waarde, en dat blijft zo — ook nu de resetknop uit de UI verdwenen
 * is. Het datamodel is namelijk waar SPEC 7.1 op leunt: een lamp die nergens
 * is ingesteld wordt bij het toepassen niet aangeraakt, en dat is precies wat
 * een lamp beschermt die later aan de light group van een klant wordt
 * toegevoegd.
 */
export function isIngesteld(waarde) {
  return waarde !== undefined && waarde !== null && typeof waarde === "object";
}

/**
 * De lampen die nog niet in **alle** scenes zijn ingesteld.
 *
 * Zolang een lamp in ook maar één scene ontbreekt, telt hij mee. Dat is
 * strenger dan "komt nergens voor", en met opzet: een lamp uit willen hebben in
 * scene 2 is óók een keuze, en die keuze moet iemand een keer maken. Zou de
 * melding al verdwijnen zodra de lamp in scene 1 staat, dan blijft hij in de
 * andere twee stilletjes onaangeraakt.
 *
 * Er wordt over de **groepsleden** geïtereerd, niet over de sleutels in de
 * opslag. Een lamp die uit de light group is gehaald verdwijnt daarmee vanzelf
 * uit deze lijst, ook al staan zijn waarden er nog in (SPEC 13.5).
 *
 * Bewust een functie van (scenes, ledenlijst) zonder `hass`: de kaart leest in
 * rusttoestand geen enkele lampstate (SPEC 3.1), en dat hoeft hiervoor ook
 * niet — beide gegevens komen al uit `scenes/get`.
 *
 * @param {{lights?: Record<string, object>}[]} scenes
 * @param {string[]} memberEntityIds
 * @param {number} [aantalScenes] hoeveel scenes er horen te zijn
 * @returns {string[]} entity-ID's, in de volgorde van de ledenlijst
 */
export function nieuweLampen(scenes, memberEntityIds, aantalScenes) {
  const leden = Array.isArray(memberEntityIds) ? memberEntityIds : [];
  const rijen = Array.isArray(scenes) ? scenes : [];
  // Ontbreekt er een scene-object, dan is er per definitie een scene waarin de
  // lamp niet is ingesteld. Daarom wordt er over het verwachte aantal gelopen
  // en niet over de lengte van wat er toevallig binnenkwam.
  const aantal = Number.isInteger(aantalScenes) ? aantalScenes : rijen.length;

  return leden.filter((entityId) => {
    for (let index = 0; index < aantal; index += 1) {
      if (!isIngesteld(rijen[index]?.lights?.[entityId])) {
        return true;
      }
    }
    return false;
  });
}

/**
 * De regel tekst op de kaart, of `null` als er niets te melden is (SPEC 3.4).
 *
 * Kort houden is hier de hele opgave: de kaart is één rij in een bubble pop-up.
 * In wélke scene een lamp ontbreekt staat er daarom niet bij — dat detail staat
 * in de editor, bij het "nieuw"-label per tabblad.
 *
 * @param {number} aantal
 * @returns {string|null}
 */
export function meldingNieuweLampen(aantal) {
  if (!Number.isInteger(aantal) || aantal <= 0) {
    return null;
  }
  return aantal === 1
    ? "1 lamp nog niet ingesteld"
    : `${aantal} lampen nog niet ingesteld`;
}

/**
 * De stand die de aan/uit-schakelaar hoort te tonen.
 *
 * Dit is per definitie hetzelfde als wat er opgeslagen wordt: `true` betekent
 * `state: "on"` en `false` betekent `state: "off"`. Er is geen derde
 * mogelijkheid, ook niet bij een niet-ingestelde lamp — die toont de stand die
 * de eerste aanraking zou opleveren (SPEC 7.3).
 */
export function toonAan(waarde, stateObj, besturing) {
  return toonwaarde(waarde, stateObj, besturing).state === "on";
}

/**
 * Welke besturingen er bij deze lamp zichtbaar horen te zijn.
 *
 * De regel die deze functie draagt: **de editor toont nooit iets wat niet in de
 * opgeslagen waarde kan staan.** Een lamp op "uit" heeft volgens SPEC 10.4 geen
 * `brightness` en geen kleurattribuut, dus horen die regelaars er dan ook niet
 * te staan. Zonder deze regel toont de editor een uit-lamp met een helderheid
 * en een kleurtemperatuur eronder — waarden die uit de *levende* lamp komen en
 * die bij Opslaan nergens terechtkomen.
 *
 * Sinds fase 10 draagt hij een tweede regel, en die is belangrijker: **een lamp
 * toont nooit een kleurkiezer én een kelvinregelaar tegelijk** (SPEC 6.5). Een
 * lamp heeft per moment maar één `color_mode`, en de opslag kent hooguit één
 * kleurattribuut (SPEC 10.4). Twee regelaars naast elkaar nodigen uit tot een
 * keuze die de lamp niet kan uitvoeren.
 *
 * De regel zit hier en niet in het lit-template, zodat hij toetsbaar is zonder
 * DOM.
 *
 * @returns {{
 *   aanuit: boolean, helderheid: boolean, kleurtemp: boolean, kleur: boolean,
 *   kleurkeuze: boolean, stand: "kleur"|"wit"|null
 * }}
 */
export function zichtbareBesturingen(waarde, stateObj, besturing) {
  const kan = besturing ?? bepaalBesturing(stateObj);

  if (!kan.bekend) {
    // Niet in hass.states: geen besturing, alleen een melding (SPEC 6.4).
    return {
      aanuit: false,
      helderheid: false,
      kleurtemp: false,
      kleur: false,
      kleurkeuze: false,
      stand: null,
    };
  }

  const aan = toonAan(waarde, stateObj, kan);
  const keuze = heeftKleurkeuze(kan);
  const stand = keuze ? kleurstandVan(waarde, stateObj, kan) : null;

  return {
    aanuit: true,
    helderheid: aan && kan.helderheid,
    // Kan de lamp allebei, dan bepaalt de stand welke van de twee er staat.
    kleurtemp: aan && kan.kleurtemp && (!keuze || stand === STAND_WIT),
    kleur: aan && kan.kleur && (!keuze || stand === STAND_KLEUR),
    // De knoppen verschijnen alleen als er iets te kiezen valt, en alleen bij
    // een lamp die aan staat — bij "uit" hoort er geen enkele regelaar.
    kleurkeuze: aan && keuze,
    stand: aan ? stand : null,
  };
}

/**
 * Kan deze lamp allebei, en valt er dus iets te kiezen? (SPEC 6.5)
 *
 * Bij een lamp die er maar één kan, komen de knoppen niet: er valt niets te
 * kiezen en een knop zou suggereren dat de lamp iets kan wat hij niet kan.
 */
export function heeftKleurkeuze(besturing) {
  return Boolean(besturing?.kleurtemp && besturing?.kleur);
}

/**
 * Welke stand er actief is: "kleur" of "wit" (SPEC 6.5).
 *
 * De volgorde waarin dat bepaald wordt:
 *
 * 1. **Wat er is opgeslagen.** Staat er een `color_temp_kelvin` in, dan is het
 *    wit; staat er een van de kleurattributen in, dan is het kleur. Dat is de
 *    enige bron die altijd klopt met wat er bij Opslaan meegaat.
 * 2. **De huidige `color_mode` van de lamp.** Is de lamp nog niet ingesteld,
 *    dan volgt de stand de lamp zoals hij er nu bij staat — dezelfde regel die
 *    `aanwaarde` gebruikt voor de beginwaarde.
 * 3. **Wit als standaard.** Heeft de lamp geen `color_mode` (uit, `unavailable`
 *    of `unknown`), dan is er niets om op te varen. Wit is dan de veiligere
 *    keuze: een lamp aanzetten levert in de opslag alleen `brightness` op —
 *    zonder kleurattribuut (zie `aanwaarde`) — en dat is precies wit licht op
 *    de eigen stand van de lamp. Zou "kleur" de standaard zijn, dan zou de
 *    editor een kleur tonen die de gebruiker nooit heeft gekozen.
 */
export function kleurstandVan(waarde, stateObj, besturing) {
  const kan = besturing ?? bepaalBesturing(stateObj);

  if (waarde && typeof waarde === "object") {
    if (typeof waarde.color_temp_kelvin === "number") {
      return STAND_WIT;
    }
    if (KLEURSLEUTELS.slice(1).some((sleutel) => waarde[sleutel] !== undefined)) {
      return STAND_KLEUR;
    }
  }

  const modus = stateObj?.attributes?.color_mode;
  if (modus === MODUS_KLEURTEMP && kan.kleurtemp) {
    return STAND_WIT;
  }
  if (KLEURMODI.includes(modus) && kan.kleur) {
    return STAND_KLEUR;
  }

  return STAND_WIT;
}

/**
 * Zet de lamp in de gevraagde stand (SPEC 6.5).
 *
 * Wisselen is geen cosmetische handeling: het **verwijdert het kleurattribuut
 * van de andere stand** en zet er een van de nieuwe stand voor in de plaats.
 * Daarmee kunnen er nooit twee in de opgeslagen waarde staan, ook niet na een
 * reeks wissels heen en weer.
 *
 * De waarde die de nieuwe stand krijgt is dezelfde die de regelaar toont —
 * `toonKelvin` en `toonHs` — zodat wisselen geen sprong in beeld oplevert.
 *
 * Staat de lamp op "uit", dan gaat hij hiermee aan: een `state: "off"` met een
 * kleurattribuut zou een schemafout zijn.
 */
export function metKleurstand(waarde, stand, stateObj, besturing) {
  const kan = besturing ?? bepaalBesturing(stateObj);

  if (!heeftKleurkeuze(kan)) {
    // Niets te kiezen; de waarde blijft zoals hij is.
    return waarde;
  }

  if (stand === STAND_WIT) {
    return metKleurtemp(waarde, toonKelvin(waarde, stateObj, kan), stateObj, kan);
  }
  return metKleur(waarde, toonHs(waarde, stateObj, kan), stateObj, kan);
}

/**
 * Helderheid als percentage, uitsluitend om te tonen (SPEC 4.4 en 10.4).
 *
 * Een brandende lamp komt nooit op 0 % uit. `brightness: 1` is 0,39 % en zou
 * naar 0 afronden — "aan op 0 %" is geen stand die iets betekent, en de
 * regelaar begint ook op 1. Alleen een werkelijke 0 (die in de opslag niet
 * voorkomt, want daar begint het bij 1) blijft 0.
 */
export function alsProcent(brightness) {
  const b = klem(brightness, 0, MAX_BRIGHTNESS);
  if (b <= 0) {
    return 0;
  }
  return Math.max(MIN_PROCENT, Math.round((b / MAX_BRIGHTNESS) * MAX_PROCENT));
}

/**
 * Een percentage terug naar HA's schaal 1..255 (SPEC 10.4).
 *
 * De tegenhanger van `alsProcent`. De opslag verandert niet van schaal; deze
 * omrekening staat uitsluitend tussen de regelaar en de waarde.
 */
export function vanProcent(procent) {
  const pct = klem(procent, MIN_PROCENT, MAX_PROCENT);
  return klem(
    Math.round((pct / MAX_PROCENT) * MAX_BRIGHTNESS),
    MIN_BRIGHTNESS,
    MAX_BRIGHTNESS,
  );
}

// --------------------------------------------------------------------------
// Kleurtemperatuur als kleur
// --------------------------------------------------------------------------

/**
 * Het bereik waarbinnen de benadering hieronder zinnig is. Buiten deze grenzen
 * wordt geklemd; ze liggen ruim buiten alles wat een lamp meldt.
 */
export const KELVIN_ONDERGRENS = 1000;
export const KELVIN_BOVENGRENS = 40000;

/** Zoveel tussenstops krijgt het verloop, de uiteinden meegerekend. */
export const VERLOOP_STOPS = 7;

/**
 * Een kleurtemperatuur in Kelvin omgezet naar een benaderde RGB-kleur.
 *
 * Dit is de gangbare benadering van de kleur van een zwarte straler (de
 * "Tanner Helland"-formule): warm licht loopt naar oranje, koel licht naar
 * blauwwit. Ze hoeft niet colorimetrisch exact te zijn — ze dient om een
 * regelaar te laten zien wélke kleur je kiest in plaats van alleen een getal.
 *
 * @param {number} kelvin
 * @returns {[number, number, number]} r, g, b in 0..255
 */
export function kelvinNaarRgb(kelvin) {
  const t = klem(kelvin, KELVIN_ONDERGRENS, KELVIN_BOVENGRENS) / 100;

  const rood =
    t <= 66 ? 255 : 329.698727446 * (t - 60) ** -0.1332047592;

  const groen =
    t <= 66
      ? 99.4708025861 * Math.log(t) - 161.1195681661
      : 288.1221695283 * (t - 60) ** -0.0755148492;

  let blauw;
  if (t >= 66) {
    blauw = 255;
  } else if (t <= 19) {
    blauw = 0;
  } else {
    blauw = 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  }

  return [klem(rood, 0, 255), klem(groen, 0, 255), klem(blauw, 0, 255)];
}

/** Dezelfde kleur, als CSS-waarde. */
export function kelvinNaarCss(kelvin) {
  const [r, g, b] = kelvinNaarRgb(kelvin);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Het CSS-verloop voor de kleurtemperatuurregelaar van één lamp.
 *
 * De uiteinden zijn de **grenzen van die lamp** (SPEC 6.3), niet een vast
 * bereik: een lamp die pas bij 2202 K begint hoort links geen kleur te tonen
 * die hij niet kan maken.
 *
 * @param {number} minKelvin
 * @param {number} maxKelvin
 * @returns {string} een `linear-gradient(...)`
 */
export function kelvinVerloop(minKelvin, maxKelvin) {
  const min = Math.min(minKelvin, maxKelvin);
  const max = Math.max(minKelvin, maxKelvin);

  const stops = Array.from({ length: VERLOOP_STOPS }, (_, index) => {
    const deel = index / (VERLOOP_STOPS - 1);
    const kelvin = min + (max - min) * deel;
    return `${kelvinNaarCss(kelvin)} ${Math.round(deel * 100)}%`;
  });

  return `linear-gradient(to right, ${stops.join(", ")})`;
}

// --------------------------------------------------------------------------
// Interne hulpjes
// --------------------------------------------------------------------------

/** De huidige stand van een aanstaande lamp, beperkt tot wat het schema kent. */
function huidigeAttributen(stateObj, kan) {
  const attributen = stateObj.attributes ?? {};
  const uit = {};

  if (kan.helderheid) {
    // Een aanstaande dimbare lamp meldt altijd een brightness. Meldt hij er
    // toch geen, dan is 100 % het antwoord dat SPEC 7.3 zelf kiest voor
    // "er is geen huidige stand". Dit is een beginwaarde uit een levende lamp
    // en niet een default bij ongeldige opslag; die laatste is verboden
    // (SPEC 18.3) en komt hier niet voor.
    uit.brightness =
      typeof attributen.brightness === "number"
        ? klem(attributen.brightness, MIN_BRIGHTNESS, MAX_BRIGHTNESS)
        : MAX_BRIGHTNESS;
  }

  // Hooguit één kleurattribuut (SPEC 10.4), en alleen de modus die de lamp op
  // dit moment daadwerkelijk gebruikt.
  const modus = attributen.color_mode;
  if (
    kan.kleurtemp &&
    modus === MODUS_KLEURTEMP &&
    typeof attributen.color_temp_kelvin === "number"
  ) {
    uit.color_temp_kelvin = klem(
      attributen.color_temp_kelvin,
      kan.minKelvin,
      kan.maxKelvin,
    );
  } else if (
    kan.kleur &&
    KLEURMODI.includes(modus) &&
    isHs(attributen.hs_color)
  ) {
    uit.hs_color = [
      klem(attributen.hs_color[0], 0, 360),
      klem(attributen.hs_color[1], 0, 100),
    ];
  }

  return uit;
}

/** Een kopie van de waarde, gegarandeerd aan, klaar om een attribuut op te zetten. */
function basisAan(waarde, stateObj, kan) {
  if (waarde && waarde.state === "on") {
    return { ...waarde };
  }
  return aanwaarde(stateObj, kan);
}

function wisKleur(waarde) {
  for (const sleutel of KLEURSLEUTELS) {
    delete waarde[sleutel];
  }
}

function isHs(waarde) {
  return (
    Array.isArray(waarde) &&
    waarde.length === 2 &&
    typeof waarde[0] === "number" &&
    typeof waarde[1] === "number"
  );
}

function klem(getal, min, max) {
  const waarde = Number(getal);
  if (!Number.isFinite(waarde)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.round(waarde)));
}
