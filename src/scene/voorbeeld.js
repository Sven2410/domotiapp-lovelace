/**
 * Voorbeeld en snapshot (SPEC 9), als pure logica.
 *
 * Geen lit, geen DOM, geen `hass`: alles hier praat via één functie
 * `roepCommandoAan(type, data)` die in de editor `hass.callWS` is en in de
 * tests een nagebootste. Daardoor is de hele levensloop van de snapshot te
 * toetsen zonder browser — en juist die levensloop is waar het misgaat als je
 * hem in een component verstopt.
 *
 * **De kaart maakt de snapshot niet zelf.** Sinds fase 4b-2 doet de integratie
 * dat, achter twee commando's; de kaart stuurt alleen een entity-ID mee. Zie
 * SPEC 9.2 voor het waarom: zo hoeft de kaart nooit een registry-entry-ID te
 * kennen (SPEC 10.2).
 *
 * De twee eigenschappen die deze module garandeert, en die allebei een eigen
 * test hebben:
 *
 * 1. **Hooguit één snapshot.** Het tweede voorbeeld maakt er geen tweede aan,
 *    ook niet als er twee voorbeelden tegelijk lopen.
 * 2. **Hooguit één keer sluiten.** `ha-dialog` kan het sluiten twee keer
 *    melden (het `closed`-event plus onze eigen knop); het herstel loopt dan
 *    toch één keer.
 */

export const COMMANDO_CREATE = "domotiapp_lovelace/snapshot/create";
export const COMMANDO_CLOSE = "domotiapp_lovelace/snapshot/close";

/**
 * Houdt bij of er een snapshot is en zorgt dat aanmaken en sluiten elk hoogstens
 * één keer gebeuren.
 */
export class Snapshotbeheer {
  /**
   * @param {object} args
   * @param {(type: string, data: object) => Promise<any>} args.roepCommandoAan
   * @param {string} args.entityId  entity-ID van de light group
   */
  constructor({ roepCommandoAan, entityId }) {
    this._roep = roepCommandoAan;
    this._entityId = entityId;
    /** De lopende of afgeronde aanmaak. `null` zolang er niets is gevraagd. */
    this._aanmaak = null;
    /** De lopende of afgeronde afsluiting. */
    this._afsluiting = null;
  }

  /** Is er een voorbeeld geweest, en dus een snapshot om op te ruimen? */
  get heeftSnapshot() {
    return this._aanmaak !== null;
  }

  /** Is de snapshot al gesloten? */
  get isGesloten() {
    return this._afsluiting !== null;
  }

  /**
   * Zorg dat er een snapshot is (SPEC 9.3).
   *
   * De belofte wordt bewaard, niet het resultaat: twee voorbeelden vlak na
   * elkaar wachten daardoor op dezelfde aanroep in plaats van er twee te doen.
   * Mislukt het aanmaken, dan wordt de belofte losgelaten zodat een volgende
   * poging het opnieuw mag proberen — en de fout gaat door naar de aanroeper,
   * want zonder snapshot mag er niets omgezet worden.
   */
  async zorgVoorSnapshot() {
    if (this._aanmaak === null) {
      this._aanmaak = this._roep(COMMANDO_CREATE, {
        entity_id: this._entityId,
      }).catch((fout) => {
        this._aanmaak = null;
        throw fout;
      });
    }
    return this._aanmaak;
  }

  /**
   * Sluit de snapshot af (SPEC 9.1 en 9.3).
   *
   * @param {object} args
   * @param {boolean} args.opslaan  bij Opslaan wordt er niet hersteld
   * @returns {Promise<{gedaan: boolean}>} `gedaan: false` als er niets te doen was
   */
  async sluit({ opslaan = false } = {}) {
    // Is er nooit op Voorbeeld gedrukt, dan is er niets omgezet en valt er
    // niets te herstellen of te verwijderen (SPEC 9.1).
    if (!this.heeftSnapshot) {
      return { gedaan: false };
    }
    // De vlag wordt vóór de eerste await gezet, dus een tweede sluit-event dat
    // in dezelfde tick binnenkomt vindt hem al staan.
    if (this._afsluiting !== null) {
      return this._afsluiting;
    }

    this._afsluiting = (async () => {
      // Wacht een lopende aanmaak af; anders zou het verwijderen langs een
      // scene kunnen lopen die er nog niet is.
      try {
        await this._aanmaak;
      } catch {
        // De aanmaak faalde: er is dan ook niets aangemaakt om te sluiten.
        return { gedaan: false };
      }
      await this._roep(COMMANDO_CLOSE, {
        entity_id: this._entityId,
        restore: !opslaan,
      });
      return { gedaan: true };
    })();

    return this._afsluiting;
  }
}

/**
 * Eén voorbeeld: eerst de snapshot, dan pas de lampen (SPEC 9.1).
 *
 * De volgorde is de hele les. Mislukt het maken van de snapshot, dan wordt
 * `voerUit` niet aangeroepen en gaat er dus **geen enkele lamp om** — een
 * voorbeeld zonder weg terug is precies het stille faalgedrag dat SPEC 18
 * bestrijdt.
 *
 * De aanroepen zelf komen van `bouwServiceOproepen()` uit `apply-scene.js`,
 * dezelfde functie die het toepassen van een scene gebruikt. Voorbeeld en
 * toepassen doen daardoor per constructie hetzelfde; het enige verschil is dat
 * het voorbeeld het concept uit de editor meekrijgt in plaats van de
 * opgeslagen scene.
 *
 * @param {object} args
 * @param {Snapshotbeheer} args.beheer
 * @param {{service: string, data: object}[]} args.oproepen
 * @param {(oproepen: any[]) => Promise<{entityId: string}[]>} args.voerUit
 * @returns {Promise<{entityId: string, fout: unknown}[]>} de lampen die faalden
 */
export async function voerVoorbeeldUit({ beheer, oproepen, voerUit }) {
  await beheer.zorgVoorSnapshot();
  return voerUit(oproepen);
}
