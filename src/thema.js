/**
 * Licht of donker: meten, en het op het element zetten.
 *
 * De beslissing zelf staat in thema-logica.js en is daar zonder browser te
 * toetsen. Hier staat wat een browser nodig heeft: de tekstkleur van het thema
 * uitlezen, het attribuut `dac-thema` zetten, en de instelling van de
 * integratie ophalen.
 *
 * ## Hoe de instelling bij de kaart komt
 *
 * De keuze (auto / licht / donker) staat bij de integratie. Hij komt mee in het
 * antwoord van de LADER (loader.py), het scriptje dat Home Assistant op elke
 * pagina als eerste ophaalt: die zet hem in een globale voordat de bundel
 * geladen is. De kaarten weten het dus al bij hun eerste tekenbeurt, zonder
 * een donkere flits op een licht dashboard.
 *
 * Geen WebSocket-commando, met opzet. Dat is er pas als de config entry is
 * opgezet (valkuil 28), en een kaart die na een herstart een paar seconden in
 * het verkeerde thema staat is precies de flits die dit moet voorkomen.
 *
 * ## Hoe een WIJZIGING bij de kaart komt
 *
 * De lader wordt alleen bij een paginalading uitgevoerd, en in de companion-app
 * komt die dagen niet (valkuil 30). Daarom halen we hem zelf opnieuw op, op
 * drie momenten:
 *
 * - als er een kaart in beeld komt (hoogstens eens per vijf seconden): wie de
 *   instelling verzet en terugloopt naar zijn dashboard, ziet het meteen;
 * - als de pagina zichtbaar wordt: de telefoon die uit je zak komt;
 * - elke vijf minuten: het wandtablet dat nooit uit beeld gaat en waar niemand
 *   een andere view op kiest. Gemeten op 30 september 2026: zonder dit bleef
 *   een dashboard dat openstond licht nadat de keuze elders op automatisch
 *   was gezet.
 */

import { GLOBALE, alsInstelling, gemetenThema, instellingUit, themaVoor } from "./thema-logica.js";
import { LADER_URL, hashUit } from "./verouderd.js";

/** Niet vaker dan dit opnieuw vragen, hoeveel kaarten er ook in beeld komen. */
const TUSSENPOOS = 5000;

/** En minstens zo vaak, voor een scherm waar verder niets op gebeurt. */
const RONDE = 300000;

/** Wat er geldt tot we het weten: meten, zoals `auto`. */
let instelling = alsInstelling(globalThis[GLOBALE]);

/** De elementen die nu in de pagina hangen en het thema volgen. */
const volgers = new Set();

let laatsteVraag = 0;
let bezig = false;

/**
 * Is er een lader om iets aan te vragen?
 *
 * Alleen als deze bundel door Home Assistant geladen is: dan draagt zijn eigen
 * URL de `?v=` die de lader eraan gaf. De werkbank in dev/ en de demopagina
 * op de website laden hem zonder, en daar is geen lader -- vragen zou daar
 * elke paar tellen een 404 opleveren op andermans server.
 */
const heeftLader = Boolean(hashUit(import.meta.url));

/** De instelling zoals hij nu bekend is: "auto", "licht" of "donker". */
export const huidigeInstelling = () => instelling ?? "auto";

/** Draagt dit element op dit moment het lichte thema? */
export const isLicht = (el) => el?.getAttribute?.("dac-thema") === "licht";

/**
 * De tekstkleur van het thema, zoals de browser hem berekend heeft.
 *
 * Leest de meetprop uit `themaCss` (theme.js). Een element zonder die regel
 * geeft hier zijn eigen tekstkleur terug (de beginwaarde van
 * column-rule-color is currentcolor), en dat is nog altijd een redelijke
 * meting.
 */
function meet(el) {
  try {
    return getComputedStyle(el).columnRuleColor;
  } catch {
    return "";
  }
}

const darkModeVan = (el) => {
  const hass = el.hass ?? el.hass_ ?? document.querySelector("home-assistant")?.hass;
  return hass?.themes?.darkMode;
};

/**
 * Zet het thema op één element. Geeft `true` terug als het daardoor wisselde.
 *
 * `alleenMeten` is voor wat in een dialoog van Home Assistant zelf staat (de
 * icoonkiezer, de fotokiezer): die dialoog volgt het thema van Home Assistant
 * en niet onze instelling, en een donkere kiezer in een witte dialoog is geen
 * keuze van de klant maar een fout.
 */
export function pasThemaToe(el, { alleenMeten = false } = {}) {
  if (!el?.isConnected) return false;
  const gemeten = gemetenThema({ tekst: meet(el), darkMode: darkModeVan(el) });
  const thema = themaVoor(alleenMeten ? "auto" : huidigeInstelling(), gemeten);
  if (el.getAttribute("dac-thema") === thema) return false;
  el.setAttribute("dac-thema", thema);
  return true;
}

function pasOveralToe() {
  for (const [el, opties] of volgersMetOpties()) {
    if (pasThemaToe(el, opties)) el.themaGewisseld_?.();
  }
}

/* De opties horen bij het element, niet bij de aanroep: een wijziging van de
   instelling moet hem op dezelfde manier opnieuw toepassen. */
const optiesVan = new WeakMap();
function* volgersMetOpties() {
  for (const el of volgers) yield [el, optiesVan.get(el)];
}

async function vraagInstelling() {
  if (!heeftLader || bezig || typeof fetch !== "function") return;
  const nu = Date.now();
  if (nu - laatsteVraag < TUSSENPOOS) return;
  laatsteVraag = nu;
  bezig = true;
  try {
    const antwoord = await fetch(LADER_URL, { cache: "no-store" });
    if (!antwoord?.ok) return;
    const nieuw = instellingUit(await antwoord.text());
    // Een lader die de instelling niet noemt is een lader van een oudere
    // versie (de bundel is dan vers en de server nog niet herstart). Dat is
    // geen reden om een bekende instelling weg te gooien.
    if (!nieuw || nieuw === instelling) return;
    instelling = nieuw;
    pasOveralToe();
  } catch {
    // Geen netwerk is geen nieuws. De volgende kaart die in beeld komt vraagt
    // het opnieuw.
  } finally {
    bezig = false;
  }
}

/**
 * Laat een element het thema volgen zolang het in de pagina hangt.
 *
 * Aanroepen in `connectedCallback`; de teruggegeven functie in
 * `disconnectedCallback`. Wisselt het thema later (de instelling is verzet),
 * dan krijgt het element een `themaGewisseld_()` als het die heeft.
 */
export function volgThema(el, opties) {
  // De kiezers in een editor melden zich niet af. Zonder dit groeit de lijst
  // met elke dialoog die opengaat.
  if (volgers.size > 64) {
    for (const oud of volgers) if (!oud.isConnected) volgers.delete(oud);
  }
  volgers.add(el);
  if (opties) optiesVan.set(el, opties);
  pasThemaToe(el, opties);
  // Niet wachten op het antwoord: de kaart tekent zich met wat er nu bekend
  // is, en wisselt als de instelling anders blijkt.
  vraagInstelling();
  return () => {
    volgers.delete(el);
  };
}

/** Opnieuw meten, voor wie weet dat het thema van Home Assistant wisselde. */
export function meetOpnieuw(el) {
  if (pasThemaToe(el, optiesVan.get(el))) el.themaGewisseld_?.();
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") vraagInstelling();
  });
  setInterval(() => {
    // Zonder kaarten valt er niets te wisselen, en een pagina die niemand ziet
    // haalt het in zodra hij zichtbaar wordt.
    if (volgers.size && document.visibilityState === "visible") vraagInstelling();
  }, RONDE);
}
