/**
 * Opnieuw proberen zolang Home Assistant nog aan het opstarten is.
 *
 * WAT ER MIS WAS, EN HOE HET GEMETEN IS
 *
 * De eigenaar meldde op 26 augustus 2026 dat op één telefoon in huis de scenes
 * niet laadden -- "De scenes konden niet geladen worden. Unknown command." --
 * terwijl dezelfde kaart op een andere telefoon en op Windows gewoon werkte.
 * Het vermoeden was Android, of de gebruiker: het toestel dat het niet deed had
 * een gewone account en geen beheerdersaccount.
 *
 * Allebei nagemeten in een echte instance (Home Assistant 2026.8.3), en allebei
 * onjuist. Hetzelfde commando, één keer als beheerder en één keer als gewone
 * gebruiker:
 *
 *     als BEHEERDER          success: true, drie scenes
 *     als GEWONE GEBRUIKER   success: true, drie scenes
 *
 * Wat het WEL is: een wedloop met het opstarten. De WebSocket-commando's van
 * deze integratie worden geregistreerd als de config entry wordt opgezet, en
 * tot dat moment kent Home Assistant het commando eenvoudigweg niet. Gemeten
 * door meteen na een herstart te vragen:
 *
 *     [  3.36s] websocket open
 *     [  3.36s] FOUT — unknown_command: Unknown command.
 *     [  3.87s] OK — scenes geladen
 *
 * Precies de fout van de schermafdruk, een halve seconde lang -- en op een
 * installatie met veel integraties duurt dat venster veel langer dan hier. Wie
 * het eerst terug is na een herstart, verliest. De companion-app op een telefoon
 * verbindt meteen opnieuw en tekent het scherm dat openstond; een laptop die
 * later wordt opengeklapt, is te laat om het te merken.
 *
 * En daarna bleef het staan, want de kaart vroeg het nooit opnieuw.
 *
 * WAT DIT DOET
 *
 * Drie dingen: herkennen dat een fout "nog niet klaar" betekent, daarna met
 * oplopende tussenpozen opnieuw vragen, en opmerken dat de verbinding weg is
 * geweest. Geen abonnement op `homeassistant_start`: dat zou een derde weg
 * zijn die alleen bij een herstart werkt en niet bij een integratie die pas
 * later wordt toegevoegd.
 *
 * BIJSTELLING VAN 26 AUGUSTUS 2026, DEZELFDE AVOND
 *
 * De eerste versie hierboven was niet genoeg, en de eigenaar meldde de fout
 * diezelfde avond opnieuw. Wat er ontbrak, gemeten op zijn eigen installatie:
 *
 * - Zijn Home Assistant had 0.17.0 al -- de bundel die zijn server uitserveert
 *   was tot op de hash gelijk aan de onze. De serverkant was dus in orde.
 * - Maar de herkansing GAF NA TWEE MINUTEN DEFINITIEF OP, en daarna bracht
 *   niets hem terug. Op een installatie met 479 componenten en 179 config
 *   entries is twee minuten geen ruime marge.
 * - En de enige weg terug was een herlading van de pagina, die in de
 *   companion-app op een telefoon nooit vanzelf komt.
 *
 * Vandaar `TRAGE_WACHTTIJD` (opgeven bestaat niet meer, alleen langzamer
 * vragen) en `Verbindingswacht` (na een herstart meteen opnieuw).
 */

/**
 * De wachttijden waarin de kaart nog LAADT, in milliseconden.
 *
 * Kort beginnen omdat het meestal binnen een seconde goed is, en daarna
 * oplopen tot een halve minuut. Samen ruim een minuut: lang genoeg voor een
 * gewone herstart, kort genoeg om iemand niet minutenlang naar een
 * laadanimatie te laten kijken terwijl er iets echt mis is.
 */
export const WACHTTIJDEN = [400, 1000, 2000, 4000, 8000, 15000, 30000];

/**
 * De wachttijd daarná, en die houdt NIET op.
 *
 * De eerste versie gaf na negen pogingen definitief op, en dat was fout.
 * Gemeten op de installatie van de eigenaar op 26 augustus 2026: 479
 * componenten en 179 config entries. Hoe lang Home Assistant daar over zijn
 * config entries doet is niet te voorspellen, en de companion-app op een
 * telefoon houdt zijn pagina dagen vast -- dus één keer opgeven betekent daar
 * een kaart die tot de volgende herlading kapot blijft. Die herlading komt in
 * die app nooit vanzelf.
 *
 * Na de wachttijden hierboven toont de kaart dus wél de fout -- eerlijk zijn
 * over wat er niet lukt -- maar blijft dit op de achtergrond doorvragen, en
 * vult de kaart zichzelf in zodra het antwoord er is.
 *
 * Eén keer per minuut. Dat is één WebSocket-bericht, alleen zolang de kaart in
 * beeld is (`disconnectedCallback` zet hem stil), en het is de prijs voor een
 * kaart die zichzelf herstelt zonder dat er iemand aan te pas komt.
 */
export const TRAGE_WACHTTIJD = 60000;

/**
 * Betekent deze fout "de integratie is er nog niet"?
 *
 * Twee gevallen, en die zijn niet hetzelfde:
 *
 * - `unknown_command`: Home Assistant kent het commando niet. Dat is de
 *   opstartwedloop hierboven -- de registratie hangt aan de config entry.
 * - `not_allowed` met onze eigen tekst erin: het commando is er wel, maar de
 *   opslaglaag niet. Dat is `_meld_niet_geladen` in `websocket.py`, en dat
 *   gebeurt tussen het herladen van de entry en het opnieuw opzetten ervan.
 *
 * Andere `not_allowed`-fouten zijn met opzet GEEN reden om door te vragen: die
 * gaan over rechten, en die worden niet beter door het nog een keer te vragen.
 */
export function nogNietGereed(fout) {
  const code = fout?.code;
  if (code === "unknown_command") return true;
  return code === "not_allowed" && /niet geladen/i.test(String(fout?.message ?? ""));
}

/**
 * Een teller met een klok eraan: hij weet hoe vaak er al geprobeerd is.
 *
 * Bewust een klein object en geen mixin op de kaart: zo is het zonder DOM te
 * testen, en dat is precies wat je van getallen wilt.
 */
export class Herkansing {
  /**
   * @param {Function} doe          wat er bij een herkansing moet gebeuren
   * @param {object} [opties]
   * @param {number[]} [opties.wachttijden]
   * @param {Function} [opties.klok]   `setTimeout`, apart zodat een test hem kan vervangen
   * @param {Function} [opties.stopKlok] `clearTimeout`
   */
  constructor(doe, { wachttijden = WACHTTIJDEN, traag = TRAGE_WACHTTIJD, klok, stopKlok } = {}) {
    this.doe_ = doe;
    this.wachttijden_ = wachttijden;
    this.traag_ = traag;
    this.klok_ = klok ?? ((fn, ms) => setTimeout(fn, ms));
    this.stopKlok_ = stopKlok ?? ((id) => clearTimeout(id));
    this.poging = 0;
    this.timer_ = null;
  }

  /** Zitten we nog in de wachttijden waarin de kaart mag blijven laden? */
  get magNog() {
    return this.poging < this.wachttijden_.length;
  }

  /**
   * Plan de volgende poging. Er wordt ALTIJD een volgende gepland.
   *
   * De teruggegeven waarde zegt niet of er nog geprobeerd wordt, maar of de
   * kaart nog mag blijven LADEN. Bij `false` hoort de kaart de fout te tonen;
   * het doorvragen loopt dan op de trage wachttijd door, zodat de kaart
   * zichzelf invult zodra het antwoord er alsnog is.
   *
   * Een tweede aanroep terwijl er al een poging klaarstaat plant er geen
   * tweede bij: anders zou elke nieuwe `hass` een extra timer opleveren, en
   * die komen in Home Assistant per seconde langs.
   */
  plan() {
    const blijfLaden = this.magNog;
    if (this.timer_) return blijfLaden;
    const wacht = blijfLaden ? this.wachttijden_[this.poging] : this.traag_;
    this.poging += 1;
    this.timer_ = this.klok_(() => {
      this.timer_ = null;
      this.doe_();
    }, wacht);
    return blijfLaden;
  }

  /** Het is gelukt (of er wordt met de hand opnieuw geprobeerd): begin overnieuw. */
  herstel() {
    this.stop();
    this.poging = 0;
  }

  /** Geen herkansing meer plannen -- de kaart gaat van het scherm. */
  stop() {
    if (this.timer_ === null) return;
    this.stopKlok_(this.timer_);
    this.timer_ = null;
  }
}

/**
 * Merkt op dat de verbinding met Home Assistant weg was en er weer is.
 *
 * Dit is het tweede en belangrijkste deel van de reparatie. Een herstart van
 * Home Assistant verbreekt de websocket en herstelt hem daarna; precies in dat
 * gat worden onze commando's opnieuw geregistreerd. Een kaart die op dat
 * moment opnieuw vraagt, hoeft de wachttijden hierboven niet eens af te lopen.
 *
 * Waarom dit erbij moet en de wachttijden alleen niet volstaan: in de
 * companion-app op een telefoon blijft een pagina dagen leven. Er komt geen
 * herlading die het alsnog goed zet -- de app herstelt zijn websocket en laat
 * de JavaScript staan. De herverbinding is daar het ENIGE signaal dat er iets
 * veranderd is.
 *
 * Bewust `hass.connected` en niet een luisteraar op `hass.connection`: dat
 * eerste is een gewone eigenschap die Home Assistant zelf bijwerkt en die bij
 * elke `willUpdate` langskomt, het tweede is intern gereedschap dat per versie
 * kan verschuiven.
 */
export class Verbindingswacht {
  constructor() {
    // Begin op "verbonden", anders telt de allereerste willUpdate al als een
    // herverbinding en haalt elke kaart bij het openen twee keer op.
    this.was_ = true;
  }

  /**
   * Meld de `hass` van dit moment.
   *
   * @returns {boolean} `true` als de verbinding NET is teruggekomen.
   */
  herverbonden(hass) {
    // `!== false` en niet `=== true`: een hass zonder deze eigenschap -- een
    // stub in de werkbank, een oudere frontend -- geldt als verbonden. Anders
    // zou zo'n omgeving elke ronde een herverbinding zien.
    const nu = hass?.connected !== false;
    const terug = nu && !this.was_;
    this.was_ = nu;
    return terug;
  }
}
