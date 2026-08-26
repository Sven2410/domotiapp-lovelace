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
 * Twee dingen, meer niet: herkennen dat een fout "nog niet klaar" betekent, en
 * daarna met oplopende tussenpozen opnieuw vragen. Geen abonnement op
 * `homeassistant_start`: dat zou een tweede weg zijn die alleen bij een
 * herstart werkt en niet bij een integratie die pas later wordt toegevoegd.
 */

/**
 * De wachttijden tussen twee pogingen, in milliseconden.
 *
 * Kort beginnen omdat het meestal binnen een seconde goed is, en daarna
 * oplopen tot een halve minuut. Samen ruim twee minuten -- lang genoeg voor
 * een grote installatie die na een herstart nog met andere integraties bezig
 * is, en kort genoeg om niet eindeloos tegen een integratie te praten die
 * verwijderd is.
 */
export const WACHTTIJDEN = [400, 1000, 2000, 4000, 8000, 15000, 30000, 30000, 30000];

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
  constructor(doe, { wachttijden = WACHTTIJDEN, klok, stopKlok } = {}) {
    this.doe_ = doe;
    this.wachttijden_ = wachttijden;
    this.klok_ = klok ?? ((fn, ms) => setTimeout(fn, ms));
    this.stopKlok_ = stopKlok ?? ((id) => clearTimeout(id));
    this.poging = 0;
    this.timer_ = null;
  }

  /** Zijn er nog pogingen over? */
  get magNog() {
    return this.poging < this.wachttijden_.length;
  }

  /**
   * Plan de volgende poging.
   *
   * Geeft `false` terug als het op is; dan hoort de kaart de fout te tonen in
   * plaats van te blijven laden. Een tweede aanroep terwijl er al een poging
   * klaarstaat doet niets: anders zou elke nieuwe `hass` een extra timer
   * opleveren, en die komen in Home Assistant per seconde langs.
   */
  plan() {
    if (this.timer_) return true;
    if (!this.magNog) return false;
    const wacht = this.wachttijden_[this.poging];
    this.poging += 1;
    this.timer_ = this.klok_(() => {
      this.timer_ = null;
      this.doe_();
    }, wacht);
    return true;
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
