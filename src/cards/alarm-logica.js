/**
 * Wat een alarmpaneel aankan, en wanneer het om een code vraagt.
 *
 * Los van de kaart en zonder DOM, want dit is het deel waar een fout niet
 * lelijk maar gevaarlijk is: een kaart die denkt dat er geen code nodig is,
 * stuurt een opdracht die het paneel weigert -- en de klant staat met zijn jas
 * aan naar een knop te kijken die niets doet.
 *
 * ALLES KOMT UIT HET PANEEL ZELF
 *
 * `supported_features` zegt welke standen er zijn, `code_format` of er een code
 * bestaat en van welke soort, en `code_arm_required` of die code ook bij
 * inschakelen nodig is. Alarmo, de manual-integratie en een alarmsysteem van een
 * merk zetten dat alle drie -- dus hoeft niemand het in te stellen, en klopt de
 * kaart ook als je het in Alarmo omzet.
 */

/** `AlarmControlPanelEntityFeature` uit Home Assistant. */
export const KENMERK = {
  ARM_HOME: 1,
  ARM_AWAY: 2,
  ARM_NIGHT: 4,
  TRIGGER: 8,
  ARM_CUSTOM_BYPASS: 16,
  ARM_VACATION: 32,
};

/**
 * De drie standen van deze kaart, in de volgorde waarin ze op de kaart staan.
 *
 * Uitschakelen kan altijd -- daar is geen kenmerk voor, en een paneel dat niet
 * uitgeschakeld kan worden bestaat niet. De andere twee hangen aan hun kenmerk.
 */
export const STANDEN = [
  {
    sleutel: "disarmed",
    label: "Uitgeschakeld",
    dienst: "alarm_disarm",
    icoon: "lockOpen",
    kenmerk: null,
  },
  {
    sleutel: "armed_away",
    label: "Afwezig",
    dienst: "alarm_arm_away",
    icoon: "away",
    kenmerk: KENMERK.ARM_AWAY,
  },
  {
    sleutel: "armed_home",
    label: "Thuis",
    dienst: "alarm_arm_home",
    icoon: "house",
    kenmerk: KENMERK.ARM_HOME,
  },
];

const kenmerken = (st) => Number(st?.attributes?.supported_features ?? 0);

/**
 * De standen die dit paneel werkelijk aankan.
 *
 * Een knop die het paneel niet kent, hoort er niet te staan: hij zou een fout
 * opleveren die de klant niet kan plaatsen. Meldt een paneel niets (of is het
 * even weg), dan blijven alle drie staan -- dan is niets weten geen reden om de
 * bediening weg te halen.
 */
export function beschikbareStanden(st) {
  const f = kenmerken(st);
  if (!f) return STANDEN;
  return STANDEN.filter((s) => s.kenmerk === null || (f & s.kenmerk) !== 0);
}

/** `"number"`, `"text"` of `null`. Null betekent: dit paneel kent geen code. */
export const codeSoort = (st) => st?.attributes?.code_format ?? null;

/**
 * Moet er een code ingevoerd worden voor deze opdracht?
 *
 * Uitschakelen: altijd, zodra het paneel een code kent. Inschakelen: wat het
 * paneel zelf zegt in `code_arm_required` -- en dát is de instelling die in
 * Alarmo omgezet wordt, niet iets in deze kaart.
 *
 * De kaartinstelling `codeBijInschakelen` kan die keuze overrulen, en bestaat
 * voor één geval: een paneel dat geen code eist maar waar je er toch een wilt
 * voordat het alarm scherp staat. `"nooit"` doet het omgekeerde -- en dat is
 * een belofte die de kaart niet kan waarmaken als het paneel er wél een wil, dus
 * dan wint het paneel alsnog en meldt de kaart de fout die het teruggeeft.
 *
 * @param {object|null} st
 * @param {string} sleutel de stand waar naartoe gegaan wordt
 * @param {"paneel"|"altijd"|"nooit"} codeBijInschakelen
 * @param {boolean} eigenCode staat er een code bij DomotiApp zelf?
 */
export function heeftCodeNodig(st, sleutel, codeBijInschakelen = "paneel", eigenCode = false) {
  const paneelCode = Boolean(codeSoort(st));
  if (!paneelCode && !eigenCode) return false;

  // Uitschakelen vraagt altijd om de code. Dat is de hele reden dat er een is.
  if (sleutel === "disarmed") return true;

  if (codeBijInschakelen === "altijd") return true;
  if (codeBijInschakelen === "nooit") return false;

  // "Volg het paneel": alleen een paneel kan zeggen dat het bij inschakelen ook
  // een code wil. Een code van DomotiApp doet dat niet uit zichzelf -- die is er
  // om het alarm niet zomaar uit te kunnen zetten, en inschakelen is nooit het
  // gevaarlijke deel.
  return paneelCode && st?.attributes?.code_arm_required !== false;
}

/** De stand die bij een sleutel hoort, of undefined. */
export const standVan = (sleutel) => STANDEN.find((s) => s.sleutel === sleutel);
