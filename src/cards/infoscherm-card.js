/**
 * DomotiApp Infoscherm -- het scherm in de wachtkamer.
 *
 * Een iPad van 11 inch in kioskmodus, en dat is een ander ding dan een
 * dashboard: niemand die ernaar kijkt kent Home Assistant, en niemand hoort
 * er iets van te zien. Geen merk, geen kop, geen zijbalk (die haalt de
 * kiosk-mode-integratie weg). Wat er WEL staat: het logo, de klok, het weer,
 * wie er vandaag is, de mededelingen, het nieuws, de verjaardagen en -- als
 * de receptie dat wil -- de verlichting.
 *
 * DEZE KAART HEEFT GEEN CONFIG; ALLES KOMT UIT DE OPSLAG
 *
 * "Het normale infoscherm is gewoon één keer de kaart toevoegen en klaar,
 * niks instellen" (10 september 2026). De INSTALLATIE -- weerentiteit,
 * energiesensor, lampen, agenda's, kioskaccounts -- kiest de installateur in
 * de kaarteditor van het BEHEER (`infoscherm-beheer-card.js`); die kaart
 * stuurt zijn config naar de opslag zodra een beheerder hem ziet. Al het
 * andere -- namen, mededelingen, openingstijden, de indeling, het logo -- doet
 * de receptie in datzelfde beheer, en dat is live. Deze kaart leest alleen.
 * (In ronde 3 stond de installatie een uitgave lang in de editor van deze
 * kaart; dat was andersom dan bedoeld.)
 *
 * ÉÉN SCHERM, GEEN TABBLADEN
 *
 * Het welkomscherm is een raster van zes bij zes waarin de receptie blokken
 * sleept (beheer, blok Indeling). Elk blok heeft een kop, en een kop waar een
 * pagina achter zit is een knop met "Alles bekijken" erin: tik erop en je
 * staat op de volledige lijst, met een terugknop. Na de terugvaltijd staat het
 * scherm vanzelf weer op Welkom.
 *
 * DE EERSTE KAART BUITEN HET RASTER
 *
 * Elke andere kaart van de familie staat op rasterrijen van 56px omdat hij
 * náást een andere kaart staat. Deze staat nooit naast iets: hij vult zijn
 * `panel`-view. Zijn maat is het scherm, en alles erin schaalt mee met de
 * breedte (`--s`). SPEC 20.2.
 *
 * DE EERSTE KAART MET EEN EIGEN ACCENT
 *
 * Kleur is op deze kaarten identiteit, en hier is de identiteit die van de
 * KLANT: het accent komt uit het beheer. De toestandsregel blijft staan --
 * alleen de chip van een medewerker of een lamp draagt de toestand. SPEC 20.3.
 *
 * WAT ER ANDERS IS DAN OP EEN DASHBOARD
 *
 * - De verbinding kan wegvallen; het scherm blijft dan zijn laatste inhoud
 *   tonen met een klein merkje, en gaat niet op zwart.
 * - De commando's van de serverkant bestaan pas als de integratie is opgezet
 *   (valkuil 28). Een iPad die de hele nacht aanstaat is precies het toestel
 *   dat als eerste terug is na een herstart; vandaar `Herkansing`.
 */

import { DacCard, escapeHtml, registerCard } from "../base.js";
import { resolve } from "../icons.js";
import { attrsOf, fmtNumber, isOn, localizeState, stateOf } from "../ha.js";
import { Herkansing, Verbindingswacht } from "../herkansing.js";
import {
  abonneer,
  bestandUrl,
  haalStand,
  nogNietGereed,
  zetAanwezig,
} from "../infoscherm-client.js";
import { WEER_NAAM, weerAnimatie, weerAnimatieCss } from "../weer-animatie.js";
import {
  BLOK_INFO,
  actieveMededelingen,
  aanwezigEerst,
  blokOntbreekt,
  blokSchaal,
  dagKort,
  datumLang,
  energiePunten,
  energieReeks,
  energieSamenvatting,
  formatEnergie,
  geslotenRegel,
  groepeerOpFunctie,
  heeftOpeningstijden,
  isTellerstand,
  isoDatumTijd,
  klok,
  komendeMededelingen,
  komendeVerjaardagen,
  lijnPad,
  mededelingPeriode,
  nieuwsLijst,
  openingVandaag,
  openingsRegels,
  paginas,
  pasLijst,
  relatieveTijd,
  splitsAanwezig,
  standaardIndeling,
  verdunReeks,
  vloeiendPad,
} from "./infoscherm-logica.js";

const TAG = "domotiapp-infoscherm-card";

/* Drie iconen die de familie nog niet had. Zelfde tekenstijl als icons.js. */
const teken = (body) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
const ICOON = {
  news: teken(`<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2"/><path d="M7.2 9.2h9.6M7.2 12.6h9.6M7.2 16h5.6"/>`),
  cake: teken(
    `<path d="M4.4 19.4h15.2v-6.2a2 2 0 0 0-2-2H6.4a2 2 0 0 0-2 2z"/><path d="M4.4 15.6c1.3 0 1.3 1.2 2.5 1.2s1.3-1.2 2.5-1.2 1.3 1.2 2.6 1.2 1.3-1.2 2.5-1.2 1.3 1.2 2.5 1.2 1.3-1.2 2.6-1.2"/><path d="M12 11.2V8.4M9 11.2V8.8M15 11.2V8.8"/><path d="M12 8.4a1.3 1.3 0 0 0 1-2.2L12 4.6l-1 1.6a1.3 1.3 0 0 0 1 2.2z"/>`
  ),
  offline: teken(`<path d="M3.4 6.8a13.6 13.6 0 0 1 17.2 0M6.6 10.4a9 9 0 0 1 10.8 0M9.8 14a4.4 4.4 0 0 1 4.4 0"/><circle cx="12" cy="18" r="1"/><path d="M4 4l16 16"/>`),
  back: teken(`<path d="m14.6 6.2-5.6 5.8 5.6 5.8"/>`),
};
const icoon = (naam) => ICOON[naam] ?? resolve(naam);

const PAGINA_KOP = {
  aanwezig: { eyebrow: "Wie is er vandaag", titel: "Aanwezig", onder: "Tik op uw naam om u aan of af te melden." },
  nieuws: { eyebrow: "Nieuws", titel: "Wat er speelt", onder: "" },
  weer: { eyebrow: "Weer", titel: "Vandaag en de komende dagen", onder: "" },
  verlichting: { eyebrow: "Verlichting", titel: "Lampen", onder: "Tik op een lamp om hem aan of uit te zetten." },
  agenda: { eyebrow: "Agenda", titel: "Vandaag", onder: "" },
  verjaardagen: { eyebrow: "Verjaardagen", titel: "Wie is er binnenkort jarig", onder: "" },
  energie: { eyebrow: "Energie", titel: "Verbruik", onder: "" },
  mededelingen: { eyebrow: "Mededelingen", titel: "Wat er speelt", onder: "" },
};

/* De afgelopen 24 uur in de energiegrafiek. */
const ENERGIE_VENSTER = 24;

const css = /* css */ `
  :host { display: block; height: 100%; }

  /* --ss is de schaal van het SCHERM (de breedte gedeeld door die van een
     iPad van 11 inch). --s is wat alles gebruikt; buiten de blokken is dat
     hetzelfde getal, en in een blok komt daar de maat van het blok bij
     (zie .blok hieronder). */
  .scherm {
    --tone: var(--dac-accent-hi);
    --ss: 1;
    --s: var(--ss);
    position: relative; width: 100%; height: var(--hoogte, 100dvh);
    overflow: hidden; background: var(--dac-bg); color: var(--dac-ink);
    display: flex; flex-direction: column;
    padding: calc(22px * var(--s)) calc(36px * var(--s)) calc(22px * var(--s));
    gap: calc(18px * var(--s));
    user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  /* Een wachtkamer is overdag licht; dan een lichte uitvoering. Alleen de
     ladders veranderen, de vorm niet. */
  .scherm.licht {
    --dac-bg: #f3f1ec; --dac-bg-raise: #ffffff;
    --dac-surface: rgba(20, 20, 10, 0.045); --dac-surface-hi: rgba(20, 20, 10, 0.08);
    --dac-border: rgba(20, 20, 10, 0.10); --dac-border-hi: rgba(20, 20, 10, 0.2);
    --dac-ink: #1a1a17; --dac-ink-2: rgba(26, 26, 23, 0.66); --dac-ink-3: rgba(26, 26, 23, 0.42);
    --dac-shadow: none;
  }

  .icon { width: 1em; height: 1em; display: block; }
  /* De vakken staan op display: flex, en dat wint van het [hidden] van de
     browser. Zonder deze regel staat een verborgen vak gewoon in beeld. */
  [hidden] { display: none !important; }

  /* ------------------------------------------------------------ kop */
  /* Er is geen kop meer boven het raster (ronde 4): logo, klok en datum
     staan in het welkomblok. Zie .blok.welkom hieronder. */
  /* Het logo volgt zijn eigen verhouding: een lang logo wordt lang, een breed
     logo breed. Alleen zonder beeld (de eerste letter van de naam) is het een
     vierkant. Gemeld op 10 september 2026: "nu is het een vast vierkantje". */
  .logo {
    height: calc(64px * var(--s)); max-width: calc(260px * var(--s)); flex: 0 0 auto;
    display: grid; place-items: center; overflow: hidden;
    color: var(--tone); font-weight: 700; font-size: calc(22px * var(--s));
  }
  .logo:not(.beeld) {
    width: calc(64px * var(--s)); border-radius: var(--dac-radius-sm);
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 32%, transparent);
  }
  .logo:empty { display: none; }
  .logo img { height: 100%; width: auto; max-width: 100%; object-fit: contain; display: block; }
  .w-klok { display: flex; flex-direction: column; flex: 0 0 auto; min-width: 0; }
  .klok { font-size: calc(48px * var(--s)); font-weight: 300; line-height: 1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .datum { font-size: calc(15px * var(--s)); color: var(--dac-ink-2); margin-top: calc(3px * var(--s)); white-space: nowrap; }

  /* ------------------------------------------------------------ pagina's */
  .pagina { display: none; flex: 1 1 auto; min-height: 0; flex-direction: column; gap: calc(16px * var(--s)); }
  .pagina.actief { display: flex; }

  .eyebrow { font-size: calc(12px * var(--s)); font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--dac-ink-3); }
  .titel { font-size: calc(34px * var(--s)); font-weight: 600; letter-spacing: -0.01em; line-height: 1.15; }
  .onder { font-size: calc(17px * var(--s)); color: var(--dac-ink-2); }
  .paginakop { display: flex; align-items: center; gap: calc(20px * var(--s)); flex: 0 0 auto; }
  .paginakop .pk-tekst { display: flex; flex-direction: column; gap: calc(3px * var(--s)); min-width: 0; flex: 1 1 auto; }
  .terug {
    display: flex; align-items: center; gap: calc(6px * var(--s)); height: calc(48px * var(--s)); padding: 0 calc(18px * var(--s)) 0 calc(12px * var(--s));
    border-radius: var(--dac-radius-pill); font: inherit; font-size: calc(16px * var(--s)); font-weight: 600; cursor: pointer;
    color: var(--dac-ink); background: var(--dac-surface); border: 1px solid var(--dac-border-hi); flex: 0 0 auto;
  }
  .terug .icon { font-size: calc(22px * var(--s)); }
  .terug:active { background: var(--dac-surface-hi); }
  .p-inhoud { flex: 1 1 auto; min-height: 0; overflow-y: auto; }

  /* ------------------------------------------------------------ het raster */
  .raster {
    display: grid; flex: 1 1 auto; min-height: 0;
    grid-template-columns: repeat(6, minmax(0, 1fr)); grid-template-rows: repeat(6, minmax(0, 1fr));
    gap: calc(14px * var(--s));
  }
  /* ALLES IN EEN BLOK SCHAALT MET HET BLOK. Elke maat in een blok is
     calc(px * var(--s)), en --s is hier de schermschaal maal de maat van het
     blok (--b, uit blokSchaal: 2×2 is 1) maal de pasfactor (--pas, uit
     pasLijst: een tikje kleiner als er dan net een rij bij past). Gevraagd
     op 10 september 2026: "alles van alle kaarten moet meegeschaald worden
     als je ze kleiner en groter maakt." De kop van een blok doet daar niet
     aan mee: die is op elk blok even groot, anders leest het raster als
     zeven verschillende kaarten. */
  .blok {
    --s: calc(var(--ss) * var(--b, 1) * var(--pas, 1));
    display: flex; flex-direction: column; min-height: 0; min-width: 0; overflow: hidden;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius); box-shadow: var(--dac-shadow);
    container-type: inline-size;
  }
  .blok > .bk { --s: var(--ss); }
  /* Het welkomblok meet ook zijn hoogte (container-type: size), zodat een
     laag blok logo, klok en tekst naast elkaar zet en een hoog blok onder
     elkaar. Een rasterblok heeft zijn maat van het raster, dus dat mag. */
  .blok.welkom { background: none; border: none; box-shadow: none; justify-content: center; container-type: size; }
  .bk {
    display: flex; align-items: center; gap: calc(10px * var(--s)); flex: 0 0 auto; width: 100%;
    padding: calc(11px * var(--s)) calc(16px * var(--s)); text-align: left; font: inherit; color: inherit;
    background: none; border: none; border-bottom: 1px solid var(--dac-border);
  }
  .bk .bk-ico { font-size: calc(20px * var(--s)); color: var(--dac-ink-3); flex: 0 0 auto; display: flex; }
  .bk .bk-titel { font-size: calc(16px * var(--s)); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bk .bk-sub { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); white-space: nowrap; }
  /* Een kop met een pagina erachter is een knop, en dat moet je zien: de
     titel in het accent en rechts een pil "Alles bekijken" met een pijl. */
  .bk[data-pagina] { cursor: pointer; }
  .bk[data-pagina] .bk-ico, .bk[data-pagina] .bk-titel { color: var(--tone); }
  .bk-meer {
    margin-left: auto; flex: 0 0 auto; display: flex; align-items: center; gap: calc(3px * var(--s));
    font-size: calc(12px * var(--s)); font-weight: 600; color: var(--tone);
    padding: calc(4px * var(--s)) calc(6px * var(--s)) calc(4px * var(--s)) calc(10px * var(--s)); border-radius: var(--dac-radius-pill);
    background: color-mix(in srgb, var(--tone) 14%, transparent); border: 1px solid color-mix(in srgb, var(--tone) 34%, transparent);
  }
  .bk-meer .icon { font-size: calc(16px * var(--s)); }
  .bk[data-pagina]:active { background: color-mix(in srgb, var(--tone) 12%, transparent); }
  .bk[data-pagina]:active .bk-meer { background: var(--tone); color: #fff; }
  @container (max-width: 250px) { .bk-meer .txt { display: none; } .bk-meer { padding-left: calc(6px * var(--s)); } }
  .bi { flex: 1 1 auto; min-height: 0; overflow: hidden; padding: calc(12px * var(--s)) calc(16px * var(--s)); display: flex; flex-direction: column; gap: calc(10px * var(--s)); }
  /* Een blok van één rasterrij is 98px hoog en heeft een kop: alles erin
     wordt compact, anders staat er een halve tegel. Een blok dat "dicht"
     is, is een blok waar de gewone tegels niet in passen: dezelfde compacte
     tegels, zodat er vier medewerkers in een blok van twee bij twee gaan.
     Gemeld op 10 september 2026: "passen er niet 4 personen op en geen
     4 verlichtingen zoals je ziet." */
  .blok.klein .bk { padding: calc(6px * var(--s)) calc(14px * var(--s)); }
  .blok.klein .bi { padding: calc(6px * var(--s)) calc(12px * var(--s)); gap: calc(6px * var(--s)); }
  .blok.dicht .bi { gap: calc(6px * var(--s)); }
  .blok.dicht .tegels, .blok.dicht .lampen { gap: calc(6px * var(--s)); }
  .blok.klein .persoon, .blok.klein .lamp, .blok.dicht .persoon, .blok.dicht .lamp { min-height: 0; padding: calc(5px * var(--s)) calc(10px * var(--s)); gap: calc(10px * var(--s)); }
  .blok.klein .avatar, .blok.klein .lamp .chip, .blok.dicht .avatar, .blok.dicht .lamp .chip { width: calc(32px * var(--s)); height: calc(32px * var(--s)); font-size: calc(13px * var(--s)); }
  /* Eén rij hoog: vier lampen (of personen) in twee rijen van twee, dus
     een smalle regel per tegel. Gemeld op 10 september 2026 met een blok
     van 2×1 en "toon 4": "nu passen er maar 2 op." */
  .blok.klein .lampen, .blok.klein .tegels { gap: calc(4px * var(--s)); }
  .blok.klein .lampen .lamp, .blok.klein .tegels .persoon { padding: calc(3px * var(--s)) calc(8px * var(--s)); gap: calc(8px * var(--s)); border-radius: var(--dac-radius-sm); }
  .blok.klein .lampen .lamp .chip, .blok.klein .tegels .avatar { width: calc(22px * var(--s)); height: calc(22px * var(--s)); font-size: calc(14px * var(--s)); border-radius: calc(6px * var(--s)); }
  .blok.klein .tegels .avatar { font-size: calc(10px * var(--s)); }
  .blok.klein .lampen .l-naam, .blok.klein .tegels .p-naam { font-size: calc(13px * var(--s)); }
  .blok.klein .lamp .chip, .blok.dicht .lamp .chip { font-size: calc(18px * var(--s)); }
  .blok.klein .p-functie, .blok.klein .p-status, .blok.klein .l-status,
  .blok.dicht .p-functie, .blok.dicht .p-status, .blok.dicht .l-status { display: none; }
  .blok.klein .chip { width: calc(34px * var(--s)); height: calc(34px * var(--s)); font-size: calc(18px * var(--s)); }
  .blok.klein.mededeling .m-tekst { font-size: calc(16px * var(--s)); }
  .blok.klein .afspraak, .blok.klein .vj { padding: calc(6px * var(--s)) calc(12px * var(--s)); }
  .blok.klein .bericht { padding: calc(6px * var(--s)) calc(10px * var(--s)); }
  .blok.klein .bericht .foto { display: none; }
  /* Alles links uitgelijnd: het logo hoort linksboven, ook in een hoog blok
     (het stond in het midden omdat het vak de hele breedte kreeg). */
  .blok.welkom .bi { padding: calc(4px * var(--s)) calc(6px * var(--s)); justify-content: center; align-items: flex-start; gap: calc(8px * var(--s)); }
  .leeg { color: var(--dac-ink-3); font-size: calc(16px * var(--s)); padding: calc(10px * var(--s)) 0; }

  /* welkom */
  .welkomtekst { font-size: calc(30px * var(--s)); font-weight: 600; letter-spacing: -0.01em; line-height: 1.15; }
  .welkom-onder { font-size: calc(16px * var(--s)); color: var(--dac-ink-2); }
  .blok.welkom .logo { height: calc(52px * var(--s)); max-width: 100%; }
  .blok.welkom .logo:not(.beeld) { width: calc(52px * var(--s)); }
  .blok.welkom .w-tekstvak { display: flex; flex-direction: column; gap: calc(3px * var(--s)); min-width: 0; }
  /* Breed of laag: logo, klok en tekst naast elkaar, met de tekst rechts. */
  @container (min-width: 560px), (max-height: 150px) {
    .blok.welkom .bi { flex-direction: row; align-items: center; gap: calc(28px * var(--s)); }
    .blok.welkom .w-tekstvak { flex: 1 1 auto; }
    .blok.welkom .logo { height: calc(64px * var(--s)); max-width: calc(260px * var(--s)); }
    .blok.welkom .logo:not(.beeld) { width: calc(64px * var(--s)); }
  }

  /* weer */
  .w-nu { display: flex; align-items: center; gap: calc(16px * var(--s)); }
  .w-icoon { font-size: calc(72px * var(--s)); flex: 0 0 auto; color: var(--dac-ink-2); }
  .temp { font-size: calc(42px * var(--s)); font-weight: 300; line-height: 1; font-variant-numeric: tabular-nums; }
  .w-tekst { font-size: calc(15px * var(--s)); color: var(--dac-ink-2); margin-top: calc(4px * var(--s)); line-height: 1.3; }
  /* Een weerblok van één kolom is zo'n 180px breed: icoon en getal passen
     dan niet naast elkaar. Gemeld op 10 september 2026 met een schermafdruk
     waarop de 13° half onder de rand stond: "het weer moet zichtbaar zijn op
     1 kolom." Onder elkaar dus, kleiner, en de uren weg. */
  @container (max-width: 240px) {
    .blok.weer .w-nu { gap: calc(8px * var(--s)); }
    .blok.weer .w-icoon { font-size: calc(44px * var(--s)); }
    .blok.weer .temp { font-size: calc(30px * var(--s)); }
    .blok.weer .w-tekst { font-size: calc(12px * var(--s)); margin-top: calc(2px * var(--s)); }
    .blok.weer .uren { display: none; }
  }
  /* Eén rij hoog: icoon en getal kleiner, en de tekst op één regel erbij.
     Die tekst stond eerst uit; gemeld op 10 september 2026: "nu wordt het
     weer wel laten zien maar de tekst niet." */
  .blok.klein .w-icoon { font-size: calc(38px * var(--s)); }
  .blok.klein .temp { font-size: calc(26px * var(--s)); }
  .blok.klein .w-tekst { font-size: calc(13px * var(--s)); margin-top: calc(1px * var(--s)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .blok.klein .w-nu { gap: calc(12px * var(--s)); }
  .blok.klein .w-nu > div:last-child { min-width: 0; }
  .uren { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: calc(8px * var(--s)); }
  .uur, .dag { display: flex; flex-direction: column; align-items: center; gap: calc(4px * var(--s)); padding: calc(8px * var(--s)) 0; border-radius: var(--dac-radius-sm); background: var(--dac-surface); }
  .uur .u, .dag .u { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); }
  .uur .icon, .dag .icon { font-size: calc(30px * var(--s)); color: var(--dac-ink-2); }
  .uur .t, .dag .t { font-size: calc(16px * var(--s)); font-variant-numeric: tabular-nums; }
  .dag .t2 { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); font-variant-numeric: tabular-nums; }
  .weerpagina { display: flex; flex-direction: column; gap: calc(20px * var(--s)); }
  .weerpagina .w-nu { padding: calc(8px * var(--s)) 0; }
  .weerpagina .w-icoon { font-size: calc(120px * var(--s)); }
  .weerpagina .temp { font-size: calc(64px * var(--s)); }
  .weerpagina .w-tekst { font-size: calc(19px * var(--s)); }
  .weerpagina .uren { grid-template-columns: repeat(8, minmax(0, 1fr)); }
  /* De dagen even breed als de uren erboven, en gecentreerd: zes dagen
     onder acht uren stonden links uitgelijnd met een gat rechts (gemeld op
     10 september 2026 met een schermafdruk). */
  .dagen { display: flex; justify-content: center; gap: calc(8px * var(--s)); }
  .dagen .dag { flex: 0 0 calc((100% - 7 * 8px * var(--s)) / 8); box-sizing: border-box; }

  /* De chip van een lamp. */
  .chip {
    width: calc(46px * var(--s)); height: calc(46px * var(--s)); flex: 0 0 auto; font-size: calc(24px * var(--s));
    border-radius: var(--dac-radius-sm); display: grid; place-items: center; color: var(--tone);
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 32%, transparent);
  }

  /* mededelingen: een baan die per mededeling een scherm breed is, met
     scroll-snap zodat een veeg op de iPad op de volgende landt. Geen accent
     op het vlak en geen icoon: "gewoon de kleuren van de andere kaarten",
     10 september 2026. */
  .blok.mededeling .bi { padding: 0; gap: 0; }
  .m-baan {
    display: flex; flex: 1 1 auto; min-height: 0; overflow-x: auto; overflow-y: hidden;
    scroll-snap-type: x mandatory; scrollbar-width: none; -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain; touch-action: pan-x;
  }
  .m-baan::-webkit-scrollbar { display: none; }
  /* Met een muis kun je een scrollvak niet vegen; op de pc sleept een
     pointer de baan zelf (zie sleepMededeling_), zonder snap tijdens het
     slepen, anders springt hij terug. Gemeld op 10 september 2026: "ik kan
     niet swipen op mededelingen." */
  .m-baan.sleept { scroll-snap-type: none; cursor: grabbing; scroll-behavior: auto; }
  @media (hover: hover) { .m-baan { cursor: grab; } }
  .m-slide {
    flex: 0 0 100%; width: 100%; scroll-snap-align: start; scroll-snap-stop: always;
    display: flex; align-items: center; min-width: 0; box-sizing: border-box;
    padding: calc(12px * var(--s)) calc(18px * var(--s));
  }
  .m-tekst { font-size: calc(18px * var(--s)); line-height: 1.35; white-space: pre-wrap; overflow: hidden; overflow-wrap: anywhere; max-height: 100%; }
  .m-stippen { display: flex; gap: calc(2px * var(--s)); justify-content: center; padding: 0 0 calc(4px * var(--s)); flex: 0 0 auto; }
  /* Elke stip is ook een knop: tikken springt naar die mededeling. Het
     raakvlak is groter dan de stip zelf. */
  .m-stippen span { width: calc(6px * var(--s)); height: calc(6px * var(--s)); border-radius: 50%; background: var(--dac-border-hi); background-clip: content-box; padding: calc(4px * var(--s)); box-sizing: content-box; cursor: pointer; }
  .m-stippen span.nu { background-color: var(--tone); }
  .blok.klein .m-stippen { display: none; }
  .blok.klein .m-slide { padding: calc(6px * var(--s)) calc(14px * var(--s)); }

  /* de pagina Mededelingen */
  .m-pagina { display: flex; flex-direction: column; gap: calc(14px * var(--s)); }
  .m-lijst { display: grid; grid-template-columns: repeat(auto-fill, minmax(calc(340px * var(--s)), 1fr)); gap: calc(12px * var(--s)); align-content: start; }
  .m-item { padding: calc(16px * var(--s)) calc(20px * var(--s)); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); display: flex; flex-direction: column; gap: calc(6px * var(--s)); min-width: 0; }
  .m-item .m-p { font-size: calc(12px * var(--s)); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--tone); }
  .m-item .m-t { font-size: calc(19px * var(--s)); line-height: 1.4; white-space: pre-wrap; overflow-wrap: anywhere; }
  .m-kop { padding-top: calc(6px * var(--s)); }

  /* openingstijden */
  .ot { display: grid; grid-template-columns: minmax(0, 1fr); gap: calc(5px * var(--s)) calc(24px * var(--s)); font-size: calc(15px * var(--s)); }
  .ot.twee { grid-template-columns: repeat(2, minmax(0, 1fr)); font-size: calc(13px * var(--s)); column-gap: calc(16px * var(--s)); }
  /* NIET "laag" noemen: dat is de klasse van de lagen (detail, nacht) en die
     staan op display: none. Gemeten op 10 september 2026: een leeg blok. */
  .ot.compact { font-size: calc(13px * var(--s)); row-gap: calc(3px * var(--s)); }
  .ot div { display: flex; justify-content: space-between; gap: calc(12px * var(--s)); }
  .ot span:first-child { color: var(--dac-ink-2); }
  .ot .vandaag span:first-child { color: var(--tone); font-weight: 600; }
  .ot .vandaag span:last-child { font-weight: 600; }
  .ot .dicht span:last-child { color: var(--dac-ink-3); }
  .ot .num { font-variant-numeric: tabular-nums; white-space: nowrap; }
  .ot-nu { font-size: calc(15px * var(--s)); color: var(--dac-ink-2); }

  /* DE LIJSTEN IN EEN BLOK VULLEN HET BLOK. Elke lijst is een raster; pasBij_
     zet er inline grid-template-rows op (repeat(n, 1fr)) zodat de rijen die
     erin passen even hoog worden en samen precies de hoogte vullen. Zonder
     die inline regel (op een pagina, of vóór het meten) staan de rijen op
     hun eigen maat, bovenaan. Gemeld op 10 september 2026: "maak dan alles
     dezelfde grootte en passend." */
  .bi > .tegels, .bi > .n-lijst, .bi > .lampen, .bi > .afspraken, .bi > .vj-lijst { flex: 1 1 auto; min-height: 0; }

  /* aanwezig */
  .tegels { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(10px * var(--s)); align-content: start; }
  .tegels.kol-1 { grid-template-columns: minmax(0, 1fr); }
  .tegels.kol-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .persoon {
    display: flex; align-items: center; gap: calc(12px * var(--s));
    padding: calc(10px * var(--s)) calc(12px * var(--s)); cursor: pointer;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius); box-shadow: var(--dac-shadow); min-height: calc(64px * var(--s));
    text-align: left; font: inherit; color: inherit; min-width: 0;
  }
  .p-inhoud .persoon { padding: calc(14px * var(--s)) calc(16px * var(--s)); min-height: calc(84px * var(--s)); gap: calc(16px * var(--s)); }
  .persoon:active { background: var(--dac-surface-hi); }
  .avatar {
    width: calc(46px * var(--s)); height: calc(46px * var(--s)); flex: 0 0 auto; overflow: hidden;
    border-radius: var(--dac-radius-sm); display: grid; place-items: center;
    font-size: calc(16px * var(--s)); font-weight: 700;
    color: var(--dac-ink-3); background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .p-inhoud .avatar { width: calc(60px * var(--s)); height: calc(60px * var(--s)); font-size: calc(20px * var(--s)); }
  .rond .avatar { border-radius: 50%; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .persoon.aan .avatar { color: var(--tone); background: color-mix(in srgb, var(--tone) 14%, transparent); border-color: color-mix(in srgb, var(--tone) 40%, transparent); }
  .persoon:not(.aan) .avatar img { opacity: 0.45; filter: grayscale(1); }
  .p-tekst { min-width: 0; display: flex; flex-direction: column; gap: calc(1px * var(--s)); }
  .p-naam { font-size: calc(16px * var(--s)); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .p-inhoud .p-naam { font-size: calc(19px * var(--s)); }
  .p-functie { font-size: calc(13px * var(--s)); color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .p-status { font-size: calc(12px * var(--s)); font-weight: 600; color: var(--dac-ink-3); }
  .persoon.aan .p-status { color: var(--tone); }
  .kolommen { display: flex; gap: calc(20px * var(--s)); align-items: flex-start; }
  .kolom { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: calc(10px * var(--s)); }
  .kolom .eyebrow { padding: 0 calc(4px * var(--s)); }
  /* Twee groepen naast elkaar: binnen elke groep twee tegels naast elkaar,
     anders is een tegel van 780px breed voor één naam. Drie of meer groepen:
     één tegel per rij. */
  .kolom .tegels { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .kolommen.drie .kolom .tegels { grid-template-columns: minmax(0, 1fr); }

  /* De tegels zijn een <div role="button"> en geen <button>: Chrome maakt van
     een <button> geen echte flexcontainer (de inhoud wordt gecentreerd en
     krijgt geen hoogte), en dan schoof de samenvatting over de titel heen.
     Gemeten op 9 september 2026 met de NOS-feed. */
  .persoon, .bericht, .lamp { -webkit-appearance: none; appearance: none; }
  .persoon:focus-visible, .bericht:focus-visible, .lamp:focus-visible, .bk:focus-visible, .terug:focus-visible { outline: 2px solid var(--tone); outline-offset: 2px; }

  /* nieuws */
  .n-lijst { display: grid; grid-template-columns: minmax(0, 1fr); gap: calc(8px * var(--s)); align-content: start; }
  .nieuws-raster { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(14px * var(--s)); align-content: start; }
  .bericht {
    display: flex; align-items: stretch; gap: calc(12px * var(--s)); padding: calc(10px * var(--s)) calc(12px * var(--s)); cursor: pointer;
    background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius);
    box-shadow: var(--dac-shadow); text-align: left; font: inherit; color: inherit; min-width: 0; box-sizing: border-box;
  }
  .nieuws-raster .bericht { padding: calc(16px * var(--s)) calc(18px * var(--s)); gap: calc(16px * var(--s)); min-height: calc(110px * var(--s)); }
  .bericht:active { background: var(--dac-surface-hi); }
  .bericht.eigen { border-color: color-mix(in srgb, var(--tone) 40%, transparent); }
  /* De foto groeit mee met de rij: in een blok dat de rijen uitsmeert wordt
     hij hoger, en de tekst blijft in het midden staan. */
  .bericht .foto { width: calc(84px * var(--s)); min-height: calc(60px * var(--s)); flex: 0 0 auto; border-radius: var(--dac-radius-sm); overflow: hidden; background: var(--dac-surface); }
  .nieuws-raster .bericht .foto { width: calc(120px * var(--s)); min-height: calc(84px * var(--s)); }
  .bericht .foto:empty { display: none; }
  .bericht .foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .b-tekst { min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: calc(3px * var(--s)); flex: 1 1 auto; }
  .b-bron { font-size: calc(11px * var(--s)); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dac-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bericht.eigen .b-bron { color: var(--tone); }
  /* De titel mag drie regels: twee sneden een NOS-kop halverwege af
     (gemeld op 10 september 2026 met een schermafdruk). */
  .b-titel { font-size: calc(15px * var(--s)); font-weight: 600; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
  .nieuws-raster .b-titel { font-size: calc(18px * var(--s)); }
  .b-samenvatting { font-size: calc(14px * var(--s)); color: var(--dac-ink-2); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  /* verlichting en agenda */
  .lampen { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(10px * var(--s)); align-content: start; }
  .lampen.kol-1 { grid-template-columns: minmax(0, 1fr); }
  .lampen.kol-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lamp {
    display: flex; align-items: center; gap: calc(12px * var(--s)); padding: calc(10px * var(--s)) calc(12px * var(--s)); cursor: pointer;
    background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius);
    box-shadow: var(--dac-shadow); text-align: left; font: inherit; color: inherit; min-height: calc(64px * var(--s)); min-width: 0;
  }
  .p-inhoud .lamp { padding: calc(16px * var(--s)) calc(18px * var(--s)); min-height: calc(92px * var(--s)); gap: calc(16px * var(--s)); }
  .lamp:active { background: var(--dac-surface-hi); }
  .lamp .chip { --tone: var(--dac-ink-3); width: calc(46px * var(--s)); height: calc(46px * var(--s)); font-size: calc(24px * var(--s)); background: var(--dac-surface); border-color: var(--dac-border); color: var(--dac-ink-3); }
  .p-inhoud .lamp .chip { width: calc(60px * var(--s)); height: calc(60px * var(--s)); font-size: calc(30px * var(--s)); }
  .lamp.aan .chip { --tone: var(--lampkleur, var(--dac-lit)); color: var(--tone); background: color-mix(in srgb, var(--tone) 14%, transparent); border-color: color-mix(in srgb, var(--tone) 32%, transparent); }
  .lamp.dood { opacity: 0.5; }
  .l-tekst { min-width: 0; }
  .l-naam { font-size: calc(16px * var(--s)); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .p-inhoud .l-naam { font-size: calc(19px * var(--s)); }
  .l-status { font-size: calc(13px * var(--s)); color: var(--dac-ink-2); margin-top: calc(2px * var(--s)); }

  .afspraken { display: grid; grid-template-columns: minmax(0, 1fr); gap: calc(8px * var(--s)); align-content: start; }
  .afspraak { display: flex; box-sizing: border-box; align-items: center; gap: calc(14px * var(--s)); padding: calc(10px * var(--s)) calc(14px * var(--s)); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); min-width: 0; }
  .p-inhoud .afspraak { padding: calc(14px * var(--s)) calc(20px * var(--s)); }
  .a-tijd { font-size: calc(16px * var(--s)); font-variant-numeric: tabular-nums; color: var(--tone); font-weight: 600; flex: 0 0 auto; }
  .p-inhoud .a-tijd { font-size: calc(20px * var(--s)); min-width: calc(120px * var(--s)); }
  .a-tekst { font-size: calc(16px * var(--s)); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .p-inhoud .a-tekst { font-size: calc(19px * var(--s)); white-space: normal; }
  .a-kalender { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); margin-left: auto; flex: 0 0 auto; }

  /* verjaardagen */
  .vj-lijst { display: grid; grid-template-columns: minmax(0, 1fr); gap: calc(8px * var(--s)); align-content: start; }
  .vj-raster { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: calc(12px * var(--s)); align-content: start; }
  .vj { display: flex; align-items: center; gap: calc(14px * var(--s)); padding: calc(10px * var(--s)) calc(14px * var(--s)); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); min-width: 0; }
  .vj-raster .vj { padding: calc(14px * var(--s)) calc(18px * var(--s)); }
  .vj-ico { width: calc(40px * var(--s)); height: calc(40px * var(--s)); flex: 0 0 auto; border-radius: var(--dac-radius-sm); display: grid; place-items: center; font-size: calc(22px * var(--s)); color: var(--dac-ink-3); background: var(--dac-surface); border: 1px solid var(--dac-border); }
  .vj.vandaag .vj-ico { color: var(--tone); background: color-mix(in srgb, var(--tone) 14%, transparent); border-color: color-mix(in srgb, var(--tone) 40%, transparent); }
  .vj-tekst { min-width: 0; display: flex; flex-direction: column; gap: calc(1px * var(--s)); flex: 1 1 auto; }
  .vj-naam { font-size: calc(16px * var(--s)); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .vj-sub { font-size: calc(13px * var(--s)); color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .vj.vandaag .vj-sub { color: var(--tone); font-weight: 600; }
  .vj-wanneer { font-size: calc(14px * var(--s)); color: var(--dac-ink-3); flex: 0 0 auto; font-variant-numeric: tabular-nums; }
  .vj.vandaag .vj-wanneer { color: var(--tone); font-weight: 600; }
  .blok.klein .vj-ico { width: calc(30px * var(--s)); height: calc(30px * var(--s)); font-size: calc(17px * var(--s)); }
  .blok.klein .vj-sub { display: none; }
  /* Eén kolom breed: geen plek voor icoon, naam én datum naast elkaar; de
     naam bleef leeg (gemeten op 10 september 2026 in een blok van 141 px).
     Dan de datum onder de naam en het icoon weg. */
  @container (max-width: 240px) {
    .blok.verjaardagen .vj { flex-direction: column; align-items: flex-start; gap: calc(2px * var(--s)); }
    .blok.verjaardagen .vj-ico { display: none; }
    .blok.verjaardagen .vj-tekst { width: 100%; }
    .blok.verjaardagen .vj-wanneer { font-size: calc(12px * var(--s)); }
  }

  /* energie: het getal in neutrale inkt, de lijn in het accent. De grafiek
     is een SVG die met het vak meerekt (preserveAspectRatio none); de lijn
     houdt zijn dikte door vector-effect. De opschriften staan in HTML naast
     en onder het vak, zodat ze niet mee vervormen. */
  .blok.energie .bi { gap: calc(8px * var(--s)); }
  /* Alleen het getal, in het midden; "nu · afgelopen 24 uur" is weg
     (10 september 2026). */
  .e-nu { display: flex; align-items: center; justify-content: center; flex: 0 0 auto; min-width: 0; }
  .e-waarde { font-size: calc(36px * var(--s)); font-weight: 300; line-height: 1; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .e-sub { font-size: calc(13px * var(--s)); color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .e-grafiek { position: relative; flex: 1 1 auto; min-height: calc(36px * var(--s)); }
  .e-grafiek svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }
  .e-grafiek .e-vlak { fill: var(--tone); fill-opacity: 0.16; stroke: none; }
  .e-grafiek .e-lijn { fill: none; stroke: var(--tone); stroke-width: 2px; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
  .e-grafiek .e-nul { stroke: var(--dac-border-hi); stroke-width: 1px; vector-effect: non-scaling-stroke; }
  .e-grafiek .e-piek { position: absolute; left: 0; top: 0; font-size: calc(11px * var(--s)); color: var(--dac-ink-3); font-variant-numeric: tabular-nums; pointer-events: none; }
  .e-grafiek .e-stip { position: absolute; right: 0; width: calc(8px * var(--s)); height: calc(8px * var(--s)); border-radius: 50%; background: var(--tone); border: 2px solid var(--dac-bg-raise); transform: translate(50%, -50%); box-sizing: content-box; }
  .e-as { display: flex; justify-content: space-between; flex: 0 0 auto; font-size: calc(11px * var(--s)); color: var(--dac-ink-3); font-variant-numeric: tabular-nums; }
  .e-leeg { font-size: calc(14px * var(--s)); color: var(--dac-ink-3); }
  /* Eén rij hoog: getal links, grafiek rechts. */
  .blok.klein.energie .bi { flex-direction: row; align-items: stretch; gap: calc(14px * var(--s)); }
  .blok.klein .e-nu { flex: 0 0 auto; padding: 0 calc(6px * var(--s)); }
  .blok.klein .e-waarde { font-size: calc(26px * var(--s)); }
  .blok.klein .e-as, .blok.klein .e-piek { display: none; }
  .blok.klein .e-grafiek { min-height: 0; }
  @container (max-width: 240px) { .blok.energie .e-as span:nth-child(2) { display: none; } }
  /* De pagina: de samenvatting als tegels, daaronder de grote grafiek. */
  .e-pagina { display: flex; flex-direction: column; gap: calc(20px * var(--s)); height: 100%; min-height: 0; }
  .e-tegels { display: grid; grid-template-columns: repeat(auto-fit, minmax(calc(150px * var(--s)), 1fr)); gap: calc(12px * var(--s)); flex: 0 0 auto; }
  .e-tegel { padding: calc(14px * var(--s)) calc(18px * var(--s)); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); display: flex; flex-direction: column; gap: calc(4px * var(--s)); min-width: 0; }
  .e-tegel .e-l { font-size: calc(12px * var(--s)); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dac-ink-3); }
  .e-tegel .e-w { font-size: calc(30px * var(--s)); font-weight: 300; line-height: 1.1; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .e-pagina .e-vak { flex: 1 1 auto; min-height: calc(200px * var(--s)); display: flex; flex-direction: column; gap: calc(8px * var(--s)); padding: calc(18px * var(--s)); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); }
  .e-pagina .e-grafiek { min-height: calc(160px * var(--s)); }
  .e-pagina .e-titel { font-size: calc(14px * var(--s)); color: var(--dac-ink-2); flex: 0 0 auto; }

  /* ------------------------------------------------------------ lagen */
  .laag { position: absolute; inset: 0; display: none; background: var(--dac-bg); color: var(--dac-ink); }
  .laag.open { display: flex; }

  /* Het geopende bericht ligt op een DICHTE achtergrond. Hij was 96%
     doorschijnend, en dat las als "geblurd"; gemeld op 10 september 2026. */
  .detail { padding: calc(32px * var(--s)) calc(36px * var(--s)); flex-direction: column; gap: calc(16px * var(--s)); background: var(--dac-bg); }
  .detail .sluit { align-self: flex-start; display: flex; align-items: center; gap: calc(6px * var(--s)); font: inherit; font-size: calc(16px * var(--s)); font-weight: 600; color: var(--dac-ink); background: var(--dac-surface); border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-pill); height: calc(48px * var(--s)); padding: 0 calc(18px * var(--s)) 0 calc(12px * var(--s)); cursor: pointer; }
  .detail .sluit .icon { font-size: calc(22px * var(--s)); }
  .detail .d-bron { font-size: calc(13px * var(--s)); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--tone); }
  .detail .d-titel { font-size: calc(32px * var(--s)); font-weight: 600; line-height: 1.15; }
  .detail .d-inhoud { display: flex; gap: calc(28px * var(--s)); min-height: 0; flex: 1 1 auto; }
  .detail .d-foto { flex: 0 0 40%; border-radius: var(--dac-radius); overflow: hidden; max-height: 100%; }
  .detail .d-foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .detail .d-foto:empty { display: none; }
  .detail .d-tekst { font-size: calc(20px * var(--s)); line-height: 1.5; color: var(--dac-ink-2); white-space: pre-wrap; overflow-y: auto; }
  .detail .d-datum { font-size: calc(14px * var(--s)); color: var(--dac-ink-3); }

  .merkje {
    position: absolute; top: calc(10px * var(--s)); right: calc(14px * var(--s)); display: none; align-items: center; gap: calc(6px * var(--s));
    font-size: calc(12px * var(--s)); color: var(--dac-ink-3); background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius-pill); padding: calc(4px * var(--s)) calc(10px * var(--s));
  }
  .merkje.open { display: flex; }
  .merkje .icon { font-size: calc(14px * var(--s)); }

  /* hover bestaat niet op een wachtkamerscherm; alleen echte muizen. */
  @media (hover: hover) {
    .persoon:hover, .lamp:hover, .bericht:hover, .terug:hover { background: var(--dac-surface-hi); }
    .bk[data-pagina]:hover .bk-meer { background: color-mix(in srgb, var(--tone) 26%, transparent); }
  }

  ${weerAnimatieCss}
`;

export class InfoschermCard extends DacCard {
  static css = css;

  constructor() {
    super();
    this.stand_ = null;
    this.feeds_ = [];
    this.pagina_ = "welkom";
    this.uren_ = [];
    this.dagen_ = [];
    this.afspraken_ = [];
    this.herkansing_ = new Herkansing(() => this.haal_());
    this.verbinding_ = new Verbindingswacht();
    this.fout_ = null;
    /* De laatst gewenste HTML per vak, zodat een herschildering niets
       aanraakt dat niet veranderd is -- ook niet als er intussen een foto
       in het vak is gezet. Zonder dit knipperden de foto's bij elke tik. */
    this.html_ = new Map();
    this.weerEntiteit_ = null;
    this.weerOpzeggen_ = [];
    this.agendaSleutel_ = "";
    /* Tot wanneer een scrollbeweging van de mededelingen van onszelf is en
       niet van een vinger; daarna zet een scroll de klok opnieuw. */
    this.mAuto_ = 0;
    /* De energiesensor: de punten van de afgelopen dag uit de recorder, met
       de live waarden erachteraan. */
    this.energie_ = { entiteit: null, punten: [], geladen: 0 };
  }

  /**
   * Er valt niets in te stellen. Wat er wel in de config staat (een oude
   * `weather` of `lights` uit ronde 3) wordt genegeerd en nooit een fout:
   * een kaart mag niet gooien in setConfig (CLAUDE.md).
   */
  validate(config) {
    return { ...config };
  }

  /** De installatie uit de opslag: weer, energie, agenda's, lampen met naam. */
  installatie_() {
    const i = this.stand_?.installatie ?? {};
    return {
      weer: i.weer ?? null,
      energie: i.energie ?? null,
      agendas: Array.isArray(i.agendas) ? i.agendas : [],
      verlichting: Array.isArray(i.verlichting) ? i.verlichting : [],
    };
  }

  /** De stand zoals de logica hem wil, met een installatie die er altijd is. */
  standNu_() {
    return this.stand_ ? { ...this.stand_, installatie: this.installatie_() } : null;
  }

  watched() {
    const i = this.installatie_();
    return [i.weer, i.energie, "sun.sun", ...i.verlichting.map((l) => l.entity)].filter(Boolean);
  }

  getCardSize() {
    return 12;
  }

  /* ------------------------------------------------------------ template */

  template() {
    const pagina = (p) => `
      <section class="pagina" data-p="${p}">
        <div class="paginakop">
          <button class="terug" type="button">${ICOON.back}<span>Terug</span></button>
          <div class="pk-tekst"><div class="eyebrow">${PAGINA_KOP[p].eyebrow}</div><div class="titel pk-titel">${PAGINA_KOP[p].titel}</div></div>
          <div class="onder">${PAGINA_KOP[p].onder}</div>
        </div>
        <div class="p-inhoud" data-p="${p}"></div>
      </section>`;
    return `
      <div class="scherm">
        <section class="pagina actief" data-p="welkom"><div class="raster"></div></section>
        ${Object.keys(PAGINA_KOP).map(pagina).join("")}

        <div class="laag detail">
          <button class="sluit" type="button">${ICOON.back}<span>Terug</span></button>
          <div class="d-bron"></div>
          <div class="d-titel"></div>
          <div class="d-datum"></div>
          <div class="d-inhoud"><div class="d-foto"></div><div class="d-tekst"></div></div>
        </div>

        <div class="merkje">${ICOON.offline}<span>Geen verbinding</span></div>
      </div>`;
  }

  /* ------------------------------------------------------------ wire */

  wire() {
    const scherm = this.$(".scherm");

    // Elke aanraking is een teken van leven voor de terugvaltimer.
    this.on(scherm, "pointerdown", () => this.leeft_(), { capture: true, passive: true });

    // Een veeg door de mededelingen: de teller mee, en de klok opnieuw zodat
    // hij niet meteen weer doorschuift onder iemands vinger.
    this.on(
      scherm,
      "scroll",
      (e) => {
        const baan = e.target;
        if (!baan?.classList?.contains("m-baan")) return;
        this.mededelingTeller_(baan);
        if (Date.now() > this.mAuto_) this.mededelingStart_();
      },
      { capture: true, passive: true }
    );

    // Eén luisteraar voor alles wat klikbaar is; de vakken worden vaak
    // opnieuw getekend, en een luisteraar per tegel zou dan telkens weg zijn.
    // Met een muis (of pen) is de baan van de mededelingen te slepen.
    this.on(scherm, "pointerdown", (e) => {
      const baan = e.target?.closest?.(".m-baan");
      if (baan && e.pointerType !== "touch") this.sleepMededeling_(e, baan);
    });

    this.on(scherm, "click", (e) => {
      const doel = e.target;
      const stip = doel.closest(".m-stippen span");
      if (stip) return this.mededelingNaar_(stip.closest(".blok")?.querySelector(".m-baan"), [...stip.parentElement.children].indexOf(stip));
      const kop = doel.closest(".bk[data-pagina]");
      if (kop) return this.gaNaar_(kop.dataset.pagina);
      if (doel.closest(".terug")) return this.gaNaar_("welkom");
      if (doel.closest(".detail .sluit")) return this.sluitBericht_();
      const persoon = doel.closest(".persoon[data-id]");
      if (persoon) return this.tikPersoon_(persoon.dataset.id);
      const lamp = doel.closest(".lamp[data-id]");
      if (lamp) return this.tikLamp_(lamp.dataset.id);
      const bericht = doel.closest(".bericht[data-id]");
      if (bericht) return this.openBericht_(bericht.dataset.id);
      return undefined;
    });

    // De hoogte is het scherm minus wat er boven de kaart staat: met
    // kiosk-mode is dat niets, zonder is het de kop van Home Assistant. In de
    // bewerkdialoog een vaste maat, anders is het voorbeeld schermvullend.
    // Gemeten in de ResizeObserver en niet alleen bij het bouwen: op dat
    // moment hangt de kaart nog niet in de view en is zijn bovenkant 0
    // (valkuil 25), dus het eerste antwoord is altijd 100dvh.
    //
    // In de BEWERKMODUS van het dashboard zet Home Assistant onder de kaart
    // een balk met "Bewerken"; een beeldvullende kaart duwt die balk onder
    // de rand van het venster, en een panel-view scrolt niet. Gemeten op
    // 10 september 2026: de knop stond op y=874 in een venster van 855 hoog.
    // Dat is waarom de installateur "geen verlichting kon toevoegen": de
    // editor was vanaf het dashboard niet te openen. Dus: in de bewerkmodus
    // 72px korter, zodat de balk in beeld staat.
    const hoogte = () => {
      if (this.inDialoog_()) return scherm.style.setProperty("--hoogte", "600px");
      const top = Math.max(0, Math.round(this.getBoundingClientRect().top));
      const marge = top + (this.inBewerkmodus_() ? 72 : 0);
      const wens = marge ? `calc(100dvh - ${marge}px)` : "100dvh";
      if (scherm.style.getPropertyValue("--hoogte") !== wens) scherm.style.setProperty("--hoogte", wens);
      return undefined;
    };

    // De maat: alles schaalt met de breedte, met de hoogte als plafond.
    const meet = () => {
      hoogte();
      const r = scherm.getBoundingClientRect();
      if (!r.width) return;
      const schaal = Number(this.stand_?.scherm?.schaal) || 1;
      const s = Math.min(r.width / 1194, r.height ? r.height / 834 : 9) * schaal;
      scherm.style.setProperty("--ss", Math.max(0.35, s).toFixed(3));
      requestAnimationFrame(() => this.pasAlleBij_());
    };
    this.meet_ = meet;
    const ro = new ResizeObserver(meet);
    ro.observe(scherm);
    this.teardown_.push(() => ro.disconnect());
    this.on(window, "resize", hoogte);
    meet();

    // De klok tikt op de minuut; het raster kijkt mee, want een mededeling
    // met een tijdstip komt of gaat op de minuut.
    const naarDeMinuut = () => {
      this.paintKlok_();
      this.paintRaster_();
      this.klokTimer_ = setTimeout(naarDeMinuut, 60000 - (Date.now() % 60000) + 20);
    };
    naarDeMinuut();
    this.teardown_.push(() => clearTimeout(this.klokTimer_));

    // De mededelingen schuiven vanzelf door.
    this.mededelingStart_();
    this.teardown_.push(() => clearInterval(this.mTimer_));

    // Terugvaltimer.
    this.leeft_();
    this.teardown_.push(() => clearTimeout(this.terugTimer_));

    // Agenda om de tien minuten; de energiegeschiedenis om het kwartier
    // (tussendoor komen de live waarden via hass binnen).
    const agenda = setInterval(() => this.haalAgenda_(), 10 * 60000);
    this.teardown_.push(() => clearInterval(agenda));
    const energie = setInterval(() => this.laadEnergie_(true), 15 * 60000);
    this.teardown_.push(() => clearInterval(energie));

    this.teardown_.push(() => this.herkansing_.stop());
    this.teardown_.push(() => this.zegWeerOp_());

    this.haal_();
    this.luister_();
  }

  /**
   * Staat het dashboard in de bewerkmodus? Dan hangt de kaart in
   * `hui-card-options`, de schil met de knop Bewerken eronder.
   */
  inBewerkmodus_() {
    // Omhoog door de boom, ook door shadow roots heen: `hui-card-options`
    // is een gewone voorouder van `hui-card` (geen shadow host), dus alleen
    // naar hosts kijken vindt hem niet -- gemeten op 10 september 2026.
    let node = this.parentNode;
    while (node) {
      if (node.tagName?.toLowerCase() === "hui-card-options") return true;
      node = node.parentNode ?? node.host ?? null;
    }
    return false;
  }

  /** Zit deze kaart in HA's bewerkdialoog? Dan geen schermvullende hoogte. */
  inDialoog_() {
    let node = this;
    while (node) {
      const wortel = node.getRootNode?.();
      const host = wortel?.host;
      if (!host) return false;
      const tag = host.tagName?.toLowerCase() ?? "";
      if (tag === "hui-dialog-edit-card" || tag === "hui-card-preview" || tag.startsWith("hui-dialog")) return true;
      node = host;
    }
    return false;
  }

  /* ------------------------------------------------------------ data */

  async haal_() {
    if (!this.hass?.connection) return;
    try {
      const r = await haalStand(this.hass);
      this.feeds_ = r.feeds ?? [];
      this.fout_ = null;
      this.herkansing_.herstel();
      this.nieuweStand_(r.stand);
    } catch (fout) {
      if (nogNietGereed(fout)) {
        this.herkansing_.plan();
        return;
      }
      this.fout_ = fout?.message ?? "Het infoscherm kon niet laden.";
      this.paint();
    }
  }

  /** Een verse stand: alles tekenen, en de abonnementen die van de entiteiten afhangen bijstellen. */
  nieuweStand_(stand) {
    this.stand_ = stand;
    this.meet_?.();
    this.abonneerWeer_();
    this.laadEnergie_();
    this.haalAgenda_();
    this.mededelingStart_();
    this.paint();
  }

  /**
   * Een abonnement dat zichzelf opzegt als de kaart intussen is afgebroken.
   *
   * NIET op `this.isConnected` toetsen, zoals de weerkaart doet. Home
   * Assistant zet `hass` VOORDAT het element in de view hangt (valkuil 25),
   * dus `wire()` draait terwijl `isConnected` nog false is -- en dan zegt zo'n
   * toets het abonnement meteen weer op, terwijl de kaart even later gewoon
   * in beeld komt en nooit meer een wijziging ontvangt. Gemeten op
   * 9 september 2026 (valkuil 42).
   */
  async abonnement_(start) {
    let dood = false;
    this.teardown_.push(() => { dood = true; });
    const opzeggen = await start();
    if (dood) opzeggen();
    else this.teardown_.push(() => { try { opzeggen(); } catch { /* verbinding al weg */ } });
    return opzeggen;
  }

  async luister_() {
    if (!this.hass?.connection?.subscribeMessage) return;
    try {
      await this.abonnement_(() =>
        abonneer(this.hass, (bericht) => {
          if (bericht?.soort === "stand") this.nieuweStand_(bericht.stand);
          else if (bericht?.soort === "feeds") {
            this.feeds_ = bericht.feeds ?? [];
            this.paint();
          }
        })
      );
    } catch {
      // Nog niet klaar: haal_ plant de herkansing, en na een herverbinding
      // wordt er opnieuw geluisterd.
    }
  }

  set hass(hass) {
    const terug = this.verbinding_.herverbonden(hass);
    super.hass = hass;
    if (terug && this.built_) {
      this.haal_();
      this.luister_();
    }
    this.paintMerkje_();
  }

  get hass() {
    return super.hass;
  }

  zegWeerOp_() {
    for (const fn of this.weerOpzeggen_) {
      try { fn(); } catch { /* verbinding al weg */ }
    }
    this.weerOpzeggen_ = [];
    this.weerEntiteit_ = null;
  }

  /** Uur- en dagvoorspelling van de weerentiteit uit de installatie. */
  async abonneerWeer_() {
    const entiteit = this.installatie_().weer;
    if (entiteit === this.weerEntiteit_) return;
    this.zegWeerOp_();
    this.weerEntiteit_ = entiteit;
    this.uren_ = [];
    this.dagen_ = [];
    if (!entiteit || !this.hass?.connection?.subscribeMessage) return;
    for (const [soort, doel] of [["hourly", "uren_"], ["daily", "dagen_"]]) {
      try {
        const opzeggen = await this.hass.connection.subscribeMessage(
          (bericht) => {
            if (this.weerEntiteit_ !== entiteit) return;
            this[doel] = bericht?.forecast ?? [];
            this.paintRaster_();
            this.paintPagina_("weer");
          },
          { type: "weather/subscribe_forecast", forecast_type: soort, entity_id: entiteit }
        );
        if (this.weerEntiteit_ !== entiteit) opzeggen();
        else this.weerOpzeggen_.push(opzeggen);
      } catch {
        // Een weerbron zonder deze voorspelling: dan blijft dat vak leeg.
      }
    }
  }

  async haalAgenda_() {
    const agendas = this.installatie_().agendas;
    if (!agendas.length || !this.hass?.connection) {
      this.afspraken_ = [];
      this.agendaSleutel_ = "";
      return;
    }
    this.agendaSleutel_ = agendas.join(",");
    const nu = new Date();
    const start = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
    const eind = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + 1);
    try {
      const r = await this.hass.connection.sendMessagePromise({
        type: "call_service",
        domain: "calendar",
        service: "get_events",
        service_data: { entity_id: agendas, start_date_time: start.toISOString(), end_date_time: eind.toISOString() },
        return_response: true,
      });
      const antwoord = r?.response ?? {};
      const lijst = [];
      for (const [kalender, waarde] of Object.entries(antwoord)) {
        for (const ev of waarde?.events ?? []) lijst.push({ kalender, ...ev });
      }
      lijst.sort((a, b) => String(a.start).localeCompare(String(b.start)));
      this.afspraken_ = lijst;
    } catch {
      this.afspraken_ = [];
    }
    this.paintRaster_();
    this.paintPagina_("agenda");
  }

  /* ------------------------------------------------------------ energie */

  /**
   * De afgelopen dag van de energiesensor uit de recorder. Opnieuw als de
   * sensor verandert, of (met `vernieuw`) om het kwartier; tussendoor
   * plakt `energieLive_` de verse waarden erachteraan.
   */
  async laadEnergie_(vernieuw = false) {
    const entiteit = this.installatie_().energie;
    if (entiteit === this.energie_.entiteit && this.energie_.geladen && !vernieuw) return;
    if (entiteit !== this.energie_.entiteit) this.energie_ = { entiteit, punten: [], geladen: 0 };
    if (!entiteit || !this.hass?.connection?.sendMessagePromise) return;
    const eind = new Date();
    const start = new Date(eind.getTime() - (ENERGIE_VENSTER + 1) * 3600000);
    try {
      const r = await this.hass.connection.sendMessagePromise({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: eind.toISOString(),
        entity_ids: [entiteit],
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
      });
      if (this.energie_.entiteit !== entiteit) return;
      this.energie_.punten = energiePunten(r?.[entiteit]);
      this.energie_.geladen = Date.now();
    } catch {
      // Geen recorder, of nog niet klaar: dan alleen de live waarden.
      this.energie_.geladen = Date.now();
    }
    this.energieLive_();
    this.paintRaster_();
    this.paintPagina_("energie");
  }

  /** De huidige waarde van de sensor achter de reeks, als hij nieuwer is. */
  energieLive_() {
    const e = this.energie_;
    if (!e.entiteit) return;
    const st = stateOf(this.hass, e.entiteit);
    const v = Number(st?.state);
    if (!st || !Number.isFinite(v)) return;
    const t = Date.parse(st.last_updated) || Date.now();
    const laatste = e.punten[e.punten.length - 1];
    if (laatste && laatste.t >= t) return;
    e.punten.push({ t, v });
    const grens = Date.now() - (ENERGIE_VENSTER + 2) * 3600000;
    if (e.punten.length > 2000 || (e.punten[0] && e.punten[0].t < grens)) {
      e.punten = e.punten.filter((p) => p.t >= grens);
    }
  }

  /**
   * Het energieblok (of, met `groot`, de pagina). Een vermogenssensor geeft
   * de lijn van de afgelopen 24 uur en het getal van nu; een tellerstand
   * (kWh) het verbruik per uur, met het totaal van de dag.
   */
  htmlEnergie_(groot = false, klein = false) {
    const entiteit = this.installatie_().energie;
    if (!entiteit) return "";
    this.energieLive_();
    const a = attrsOf(this.hass, entiteit);
    const eenheid = a.unit_of_measurement ?? "W";
    const teller = isTellerstand(a);
    const nu = Date.now();
    const reeks = energieReeks(this.energie_.punten, { nu, tellerstand: teller, venster: ENERGIE_VENSTER });
    const sam = energieSamenvatting(reeks);
    // De pagina tekent elke meting; het blok een vloeiende lijn door het
    // gemiddelde per halfuur, anders is het een kras (10 september 2026).
    const pad = groot ? lijnPad(reeks) : vloeiendPad(verdunReeks(reeks, 48));
    const st = stateOf(this.hass, entiteit);
    const dood = !st || st.state === "unavailable" || st.state === "unknown";
    const huidig = teller ? sam.nu : Number(st?.state);
    const fmt = (v) => formatEnergie(v, eenheid);
    const laatste = reeks.punten[reeks.punten.length - 1];
    const stipTop = laatste && pad.max > pad.min ? (1 - (laatste.v - pad.min) / (pad.max - pad.min)) * 100 : null;
    const ticks = (n) => {
      const uit = [];
      for (let i = 0; i < n; i += 1) uit.push(klok(new Date(reeks.van + ((reeks.tot - reeks.van) * i) / (n - 1))));
      uit[n - 1] = "nu";
      return uit;
    };
    const grafiek = pad.lijn
      ? `<div class="e-grafiek">
          <svg viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
            <line class="e-nul" x1="0" y1="400" x2="1000" y2="400"/>
            <path class="e-vlak" d="${pad.vlak}"/>
            <path class="e-lijn" d="${pad.lijn}"/>
          </svg>
          <span class="e-piek">piek ${escapeHtml(fmt(sam.piek))}</span>
          ${stipTop !== null ? `<span class="e-stip" style="top:${stipTop.toFixed(1)}%"></span>` : ""}
        </div>`
      : `<div class="e-grafiek"><div class="e-leeg">${dood ? "Sensor niet bereikbaar." : "Nog geen geschiedenis."}</div></div>`;
    if (groot) {
      const tegel = (l, w) => `<div class="e-tegel"><span class="e-l">${l}</span><span class="e-w">${escapeHtml(w)}</span></div>`;
      return `<div class="e-pagina">
        <div class="e-tegels">
          ${tegel(teller ? "Afgelopen uur" : "Nu", dood ? "--" : fmt(huidig))}
          ${tegel("Gemiddeld", fmt(sam.gemiddeld))}
          ${tegel("Piek", fmt(sam.piek))}
          ${teller ? tegel("Afgelopen 24 uur", fmt(sam.totaal)) : ""}
        </div>
        <div class="e-vak">
          <div class="e-titel">${teller ? "Verbruik per uur, afgelopen 24 uur" : "Vermogen, afgelopen 24 uur"} · ${escapeHtml(a.friendly_name ?? entiteit)}</div>
          ${grafiek}
          <div class="e-as">${ticks(5).map((t) => `<span>${t}</span>`).join("")}</div>
        </div>
      </div>`;
    }
    return `<div class="e-nu"><span class="e-waarde">${dood ? "--" : escapeHtml(fmt(huidig))}</span></div>
      ${grafiek}
      ${klein ? "" : `<div class="e-as">${ticks(3).map((t) => `<span>${t}</span>`).join("")}</div>`}`;
  }

  /* ------------------------------------------------------------ gedrag */

  terugNa_() {
    const t = Number(this.stand_?.scherm?.terug_na);
    return Number.isFinite(t) ? t : 60;
  }

  leeft_() {
    clearTimeout(this.terugTimer_);
    const t = this.terugNa_();
    if (t > 0) {
      this.terugTimer_ = setTimeout(() => {
        this.sluitBericht_();
        this.gaNaar_("welkom");
      }, t * 1000);
    }
  }

  gaNaar_(pagina) {
    const beschikbaar = paginas(this.standNu_(), this.feeds_, isoDatumTijd(new Date()));
    this.pagina_ = beschikbaar.includes(pagina) ? pagina : "welkom";
    this.paintPaginas_();
    this.paintPagina_(this.pagina_);
    this.$(`.p-inhoud[data-p="${this.pagina_}"]`)?.scrollTo?.(0, 0);
    // Terug op Welkom: de blokken opnieuw passend maken. Terwijl een pagina
    // openstond was het raster `display: none`, en een meting daar zet ALLES
    // op verborgen (elke tegel staat dan "onder de rand" van een vak van nul
    // hoog). Gemeld op 10 september 2026: "dan is al mijn content een keer
    // weg en even later komt het weer terug."
    if (this.pagina_ === "welkom") this.pasAlleBij_();
  }

  /* ------------------------------------------------------------ mededelingen */

  /** De klok van de mededelingen (opnieuw) starten met de tijd uit het beheer. */
  mededelingStart_() {
    clearInterval(this.mTimer_);
    const s = Number(this.stand_?.scherm?.mededeling_interval);
    const seconden = Number.isFinite(s) && s >= 3 ? s : 10;
    this.mTimer_ = setInterval(() => this.mededelingVolgende_(), seconden * 1000);
  }

  mIndex_(baan) {
    return baan.clientWidth ? Math.round(baan.scrollLeft / baan.clientWidth) : 0;
  }

  /** Naar de volgende mededeling schuiven; na de laatste weer de eerste. */
  mededelingVolgende_() {
    const baan = this.$(".raster .m-baan");
    if (!baan || baan.children.length < 2) return;
    const n = baan.children.length;
    const i = (this.mIndex_(baan) + 1) % n;
    // Dit schuiven is van ons; een scroll-event in de komende seconde is dus
    // geen veeg en zet de klok niet opnieuw.
    this.mAuto_ = Date.now() + 1200;
    baan.scrollTo({ left: i * baan.clientWidth, behavior: "smooth" });
  }

  /** Naar mededeling `i` schuiven, met de klok opnieuw. */
  mededelingNaar_(baan, i) {
    if (!baan || !baan.clientWidth) return;
    const n = baan.children.length;
    const doel = Math.max(0, Math.min(n - 1, i));
    this.mAuto_ = Date.now() + 1200;
    baan.scrollTo({ left: doel * baan.clientWidth, behavior: "smooth" });
    this.mededelingStart_();
  }

  /**
   * De baan met een muis of pen slepen. Een vinger hoeft dit niet: daar
   * scrolt het vak zelf, met snap. Tijdens het slepen staat de snap uit
   * (anders springt de baan telkens terug); bij het loslaten landt hij op
   * de dichtstbijzijnde mededeling, of één verder als er genoeg is gesleept.
   */
  sleepMededeling_(e, baan) {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const startX = e.clientX;
    const startLeft = baan.scrollLeft;
    const startIndex = this.mIndex_(baan);
    let bewogen = false;
    const beweeg = (ev) => {
      const dx = ev.clientX - startX;
      if (!bewogen && Math.abs(dx) < 4) return;
      if (!bewogen) {
        bewogen = true;
        baan.classList.add("sleept");
      }
      baan.scrollLeft = startLeft - dx;
      ev.preventDefault();
    };
    const klaar = (ev) => {
      window.removeEventListener("pointermove", beweeg, true);
      window.removeEventListener("pointerup", klaar, true);
      window.removeEventListener("pointercancel", klaar, true);
      if (!bewogen) return;
      const dx = ev.clientX - startX;
      const breedte = baan.clientWidth || 1;
      // Meer dan een vijfde van de breedte is een veeg naar de buur; minder
      // valt terug op waar je was.
      const doel = Math.abs(dx) > breedte / 5 ? startIndex - Math.sign(dx) : startIndex;
      baan.classList.remove("sleept");
      this.mededelingNaar_(baan, doel);
      // De klik die op het loslaten volgt mag niets openen.
      const stopKlik = (k) => {
        k.stopPropagation();
        k.preventDefault();
      };
      baan.addEventListener("click", stopKlik, { capture: true, once: true });
      setTimeout(() => baan.removeEventListener("click", stopKlik, { capture: true }), 300);
    };
    window.addEventListener("pointermove", beweeg, true);
    window.addEventListener("pointerup", klaar, true);
    window.addEventListener("pointercancel", klaar, true);
    this.teardown_.push(() => {
      window.removeEventListener("pointermove", beweeg, true);
      window.removeEventListener("pointerup", klaar, true);
      window.removeEventListener("pointercancel", klaar, true);
    });
  }

  /** "2 van 3" in de kop, en de stip eronder. */
  mededelingTeller_(baan) {
    const blok = baan.closest(".blok");
    const n = baan.children.length;
    const i = Math.min(n - 1, this.mIndex_(baan));
    const sub = blok?.querySelector(".bk-sub");
    if (sub) this.text(sub, n > 1 ? `${i + 1} van ${n}` : "");
    blok?.querySelectorAll(".m-stippen span").forEach((el, k) => el.classList.toggle("nu", k === i));
  }

  async tikPersoon_(id) {
    const p = this.stand_?.personen?.find((x) => x.id === id);
    if (!p || !this.hass) return;
    const nieuw = !p.aanwezig;
    p.aanwezig = nieuw; // meteen tonen; de server bevestigt via het abonnement
    this.paintRaster_();
    this.paintPagina_("aanwezig");
    try {
      await zetAanwezig(this.hass, id, nieuw);
    } catch {
      p.aanwezig = !nieuw;
      this.paintRaster_();
      this.paintPagina_("aanwezig");
    }
  }

  tikLamp_(id) {
    if (!this.hass) return;
    this.hass.callService("homeassistant", "toggle", { entity_id: id });
  }

  openBericht_(id) {
    const item = this.nieuws_().find((n) => n.id === id);
    if (!item) return;
    const laag = this.$(".detail");
    this.text(".d-bron", item.bron ?? "");
    this.text(".d-titel", item.titel);
    this.text(".d-datum", relatieveTijd(item.datum, new Date()));
    this.text(".d-tekst", item.tekst || "");
    const foto = this.$(".d-foto");
    foto.replaceChildren();
    this.plaatje_(foto, item);
    laag.classList.add("open");
  }

  sluitBericht_() {
    this.$(".detail")?.classList.remove("open");
  }

  /** De afbeelding bij een bericht van buiten, via zijn URL. Altijd; de schakelaar is weg. */
  plaatje_(vak, item) {
    if (item.afbeelding && /^https?:/.test(item.afbeelding)) {
      vak.innerHTML = `<img alt="" src="${escapeHtml(item.afbeelding)}" loading="lazy">`;
    }
  }

  nieuws_() {
    return nieuwsLijst(this.feeds_);
  }

  /**
   * Schrijf HTML in een vak, maar alleen als het anders is dan wat er de
   * vorige keer gewenst was. Daarna de foto's erin zetten.
   */
  vul_(vak, html, naFoto = true) {
    if (!vak) return false;
    const sleutel = vak;
    if (this.html_.get(sleutel) === html) return false;
    this.html_.set(sleutel, html);
    vak.innerHTML = html;
    if (naFoto) this.fotos_(vak);
    return true;
  }

  /** Foto's van medewerkers en plaatjes bij het nieuws in een zojuist getekend vak. */
  fotos_(wortel) {
    for (const el of wortel.querySelectorAll(".avatar[data-foto]:not([data-foto=''])")) {
      bestandUrl(this.hass, el.dataset.foto).then((url) => {
        if (url && el.isConnected) el.innerHTML = `<img alt="" src="${url}">`;
      });
    }
    const lijst = this.nieuws_();
    for (const el of wortel.querySelectorAll(".bericht[data-id]")) {
      const item = lijst.find((n) => n.id === el.dataset.id);
      const foto = el.querySelector(".foto");
      if (item && foto && item.afbeelding) this.plaatje_(foto, item);
    }
  }

  /* ------------------------------------------------------------ paint */

  paint() {
    if (!this.$(".scherm")) return;
    this.paintUiterlijk_();
    this.paintRaster_();
    this.paintPaginas_();
    this.paintPagina_(this.pagina_);
    this.paintMerkje_();
  }

  paintUiterlijk_() {
    const s = this.stand_?.scherm ?? {};
    const scherm = this.$(".scherm");
    scherm.style.setProperty("--tone", s.accent || "var(--dac-accent-hi)");
    scherm.classList.toggle("licht", s.uiterlijk === "licht");
    scherm.classList.toggle("rond", (s.foto_vorm ?? "rond") === "rond");
    scherm.classList.toggle("stil", s.weer_animatie === false);
  }

  /** Het logo in een vak; zonder logo blijft het vak leeg en dus onzichtbaar. */
  paintLogo_(logo, logoId) {
    if (!logo || logo.dataset.wens === logoId) return;
    logo.dataset.wens = logoId;
    logo.classList.remove("beeld");
    logo.textContent = "";
    if (logoId) {
      bestandUrl(this.hass, logoId).then((url) => {
        if (!url || logo.dataset.wens !== logoId) return;
        logo.innerHTML = `<img alt="" src="${url}">`;
        logo.classList.add("beeld");
      });
    }
  }

  paintKlok_() {
    const nu = new Date();
    for (const el of this.$$(".klok")) this.text(el, klok(nu));
    for (const el of this.$$(".datum")) this.text(el, datumLang(nu));
  }

  /** Alle blokken van het welkomscherm, op hun plek in het raster. */
  paintRaster_() {
    const raster = this.$(".raster");
    if (!raster || !this.stand_) return;
    const indeling = this.stand_.indeling?.blokken?.length ? this.stand_.indeling : standaardIndeling();
    const nu = isoDatumTijd(new Date());
    const stand = this.standNu_();
    const wens = new Map();
    for (const blok of indeling.blokken) {
      if (!BLOK_INFO[blok.soort]) continue;
      if (blokOntbreekt(blok.soort, stand, this.feeds_, nu)) continue;
      wens.set(blok.id, blok);
    }
    // Blokken die weg zijn: weg. Blokken die er nog niet zijn: erbij.
    for (const el of [...raster.children]) {
      if (!wens.has(el.dataset.id)) {
        this.html_.delete(el.querySelector(".bi"));
        el.remove();
      }
    }
    for (const blok of wens.values()) {
      let el = raster.querySelector(`.blok[data-id="${CSS.escape(blok.id)}"]`);
      if (!el) {
        el = document.createElement("div");
        el.className = `blok ${blok.soort}`;
        el.dataset.id = blok.id;
        el.dataset.soort = blok.soort;
        el.innerHTML = `${this.htmlKop_(blok.soort)}<div class="bi"></div>`;
        raster.appendChild(el);
      }
      const area = `${blok.y + 1} / ${blok.x + 1} / span ${blok.h} / span ${blok.w}`;
      if (el.style.gridArea !== area) el.style.gridArea = area;
      el.classList.toggle("klein", blok.h === 1);
      // De maat van het blok bepaalt hoe groot alles erin is (zie de CSS
      // bij .blok).
      const b = String(blokSchaal(blok.soort, blok.w, blok.h));
      if (el.style.getPropertyValue("--b") !== b) el.style.setProperty("--b", b);
      this.paintBlok_(el, blok);
    }
    this.pasAlleBij_();
  }

  /**
   * Wat niet in een blok past, gaat eruit -- en de kop zegt hoeveel er meer
   * is. Een tegel die half onder de rand verdwijnt leest als kapot; gemeten
   * op 10 september 2026 met vijf tegels in een blok van drie rijen, waarvan
   * de vijfde op de helft was afgesneden.
   */
  pasAlleBij_() {
    // Niet meten terwijl een pagina openstaat: het raster is dan `display:
    // none`, elke maat is nul, en alles zou verborgen worden (zie `gaNaar_`).
    const raster = this.$(".raster");
    if (!raster || !raster.getBoundingClientRect().height) return;
    for (const el of raster.querySelectorAll(".blok")) this.pasBij_(el);
  }

  pasBij_(el) {
    const bi = el.querySelector(".bi");
    if (!bi) return;
    // Eerst alles terug op de eigen maat, anders meet je de vorige keer.
    el.style.removeProperty("--pas");
    const onder = () => bi.getBoundingClientRect().bottom - parseFloat(getComputedStyle(bi).paddingBottom);
    // De uurvoorspelling in het weerblok: past hij net niet, dan alles in
    // het blok iets kleiner (tot 72%) zodat hij erbij past; pas daarna weg.
    // In een blok van 2×2 viel hij er altijd net af en bleef de onderste
    // helft leeg; gemeld op 10 september 2026: "bij weer mag er ook wel de
    // uurverwachting onder, nu is de kaart zo leeg."
    const uren = bi.querySelector(".uren");
    if (uren) {
      uren.hidden = false;
      const boven = bi.getBoundingClientRect().top + parseFloat(getComputedStyle(bi).paddingTop);
      const nodig = uren.getBoundingClientRect().bottom - boven;
      const ruimte = onder() - boven;
      if (nodig > ruimte + 1 && ruimte / nodig >= 0.72) el.style.setProperty("--pas", (ruimte / nodig).toFixed(3));
      uren.hidden = uren.getBoundingClientRect().bottom > onder() + 1;
    }
    const lijst = bi.querySelector(".tegels, .n-lijst, .lampen, .afspraken, .ot, .vj-lijst");
    if (!lijst) return;
    const kinderen = [...lijst.children];
    for (const kind of kinderen) kind.hidden = false;
    let verborgen = 0;
    if (lijst.matches(".ot")) {
      // De openingstijden zijn geen lijst van tegels. Passen de zeven regels
      // net niet, dan alles iets kleiner (tot 72%); pas daarna valt er
      // onderaan iets weg.
      const laatste = kinderen[kinderen.length - 1];
      const nodig = laatste ? laatste.getBoundingClientRect().bottom - lijst.getBoundingClientRect().top : 0;
      const ruimte = onder() - lijst.getBoundingClientRect().top;
      if (nodig > ruimte && ruimte / nodig >= 0.72) el.style.setProperty("--pas", (ruimte / nodig).toFixed(3));
      for (const kind of kinderen) {
        if (kind.getBoundingClientRect().bottom > onder() + 1) {
          kind.hidden = true;
          verborgen += 1;
        }
      }
    } else {
      // Een lijst van tegels: tellen hoeveel rijen er passen, een tikje
      // kleiner als er dan net een rij bij kan, en de rijen die er staan
      // over de hoogte uitsmeren (zie pasLijst en de CSS bij .bi > .tegels).
      //
      // Meten op de EIGEN maat: zolang de lijst flex: 1 is, met een vaste
      // hoogte uit het blok, maakt Chrome zijn automatische rijen zo hoog
      // als er past en niet zo hoog als de inhoud (gemeten op 10 september
      // 2026: lampen van 17px met een chip van 31px erin). Dus even
      // flex: none, meten, en daarna terug.
      lijst.style.gridTemplateRows = "";
      lijst.style.flex = "0 0 auto";
      const meet = () => {
        const stijl = getComputedStyle(lijst);
        const gap = parseFloat(stijl.rowGap) || 0;
        const kolommen = stijl.gridTemplateColumns.split(" ").filter(Boolean).length || 1;
        const hoogte = Math.max(0, ...kinderen.map((k) => k.getBoundingClientRect().height));
        const beschikbaar = onder() - lijst.getBoundingClientRect().top;
        return pasLijst({ beschikbaar, hoogte, gap, aantal: kinderen.length, kolommen });
      };
      el.classList.remove("dicht");
      let uit = meet();
      // Passen de gewone tegels niet allemaal, dan de dichte -- maar alleen
      // als er dan ook echt meer in gaan.
      if (!el.classList.contains("klein") && lijst.matches(".tegels, .lampen") && uit.tonen < kinderen.length) {
        el.classList.add("dicht");
        const dicht = meet();
        if (dicht.tonen > uit.tonen) uit = dicht;
        else el.classList.remove("dicht");
      }
      lijst.style.flex = "";
      if (uit.pas < 1) el.style.setProperty("--pas", String(uit.pas));
      kinderen.forEach((kind, i) => {
        kind.hidden = i >= uit.tonen;
      });
      verborgen = kinderen.length - uit.tonen;
      if (uit.rijen > 0) lijst.style.gridTemplateRows = `repeat(${uit.rijen}, minmax(0, 1fr))`;
    }
    const meer = Number(el.dataset.meer ?? 0) + verborgen;
    const sub = el.querySelector(".bk-sub");
    if (!sub) return;
    const basis = sub.dataset.basis ?? "";
    this.text(sub, meer > 0 ? `${basis ? `${basis} · ` : ""}nog ${meer}` : basis);
  }

  htmlKop_(soort) {
    const info = BLOK_INFO[soort];
    if (soort === "welkom") return "";
    if (info.pagina) {
      return `<button class="bk" type="button" data-pagina="${info.pagina}">
        <span class="bk-ico">${icoon(info.icoon)}</span><span class="bk-titel">${info.naam}</span><span class="bk-sub"></span>
        <span class="bk-meer"><span class="txt">Alles bekijken</span>${resolve("chevronRight")}</span>
      </button>`;
    }
    return `<div class="bk"><span class="bk-ico">${icoon(info.icoon)}</span><span class="bk-titel">${info.naam}</span><span class="bk-sub"></span></div>`;
  }

  paintBlok_(el, blok) {
    const bi = el.querySelector(".bi");
    const sub = el.querySelector(".bk-sub");
    const zet = (html, tekst = "") => {
      this.vul_(bi, html);
      if (sub) {
        sub.dataset.basis = tekst;
        this.text(sub, tekst);
      }
    };
    const aantal = Number(blok.aantal) || 0;
    const kolommen = (w) => (w >= 4 ? "kol-3" : w >= 2 ? "" : "kol-1");
    switch (blok.soort) {
      case "welkom": {
        // Het welkomblok draagt sinds ronde 4 ook de klok en de datum; er is
        // geen kop meer boven het raster. Wat er verder in staat kiest de
        // receptie: het logo, een tekst, de regel met de openingstijd.
        const p = this.stand_?.praktijk ?? {};
        const s = this.stand_?.scherm ?? {};
        const nu = new Date();
        let onder = "";
        if (s.welkom_onder !== false && heeftOpeningstijden(p)) {
          const opening = openingVandaag(p, nu);
          onder = opening.open ? `Vandaag geopend tot ${opening.tot}` : geslotenRegel(p, nu);
        }
        const tekst = s.welkom_tekst ?? "Welkom";
        const logo = s.logo_verbergen !== true && s.logo ? `<div class="logo" data-logo="${escapeHtml(s.logo)}"></div>` : "";
        const regels = `${tekst ? `<div class="welkomtekst">${escapeHtml(tekst)}</div>` : ""}${onder ? `<div class="welkom-onder">${escapeHtml(onder)}</div>` : ""}`;
        // De tijd zelf staat NIET in deze html: die schrijft paintKlok_ elke
        // minuut in de bestaande elementen, zodat het blok (en het logo erin)
        // niet elke minuut opnieuw getekend wordt.
        const klokHtml = `<div class="w-klok"><div class="klok">--:--</div><div class="datum"></div></div>`;
        if (this.vul_(bi, `${logo}${klokHtml}${regels ? `<div class="w-tekstvak">${regels}</div>` : ""}`, false)) {
          const vak = bi.querySelector(".logo[data-logo]");
          if (vak) this.paintLogo_(vak, vak.dataset.logo);
        }
        this.paintKlok_();
        break;
      }
      case "weer": {
        zet(this.htmlWeerNu_() + (blok.h >= 2 ? this.htmlUren_(blok.w >= 3 ? 6 : 4) : ""));
        break;
      }
      case "energie": {
        zet(this.htmlEnergie_(false, blok.h === 1), "");
        break;
      }
      case "mededeling": {
        const lijst = actieveMededelingen(this.stand_?.mededelingen, isoDatumTijd(new Date()));
        const slides = lijst.map((m) => `<div class="m-slide"><div class="m-tekst">${escapeHtml(m.tekst)}</div></div>`).join("");
        const stippen = lijst.length > 1 ? `<div class="m-stippen">${lijst.map((_, k) => `<span class="${k === 0 ? "nu" : ""}"></span>`).join("")}</div>` : "";
        if (this.vul_(bi, `<div class="m-baan">${slides}</div>${stippen}`, false)) {
          // Nieuwe inhoud: vooraan beginnen, en de klok opnieuw.
          const baan = bi.querySelector(".m-baan");
          if (baan) {
            baan.scrollLeft = 0;
            this.mededelingTeller_(baan);
          }
          this.mededelingStart_();
        } else if (sub) {
          const baan = bi.querySelector(".m-baan");
          if (baan) this.mededelingTeller_(baan);
        }
        break;
      }
      case "openingstijden": {
        const p = this.stand_?.praktijk ?? {};
        const nu = new Date();
        const regels = openingsRegels(p, nu);
        const opening = openingVandaag(p, nu);
        // Twee kolommen als het blok breed is en laag: maandag t/m donderdag
        // links, de rest rechts. Het raster vult van links naar rechts, dus
        // herordenen.
        // Twee kolommen alleen als het blok er breed genoeg voor is; in een
        // laag blok van twee kolommen breed liepen de tijden over elkaar
        // (gemeten op 10 september 2026 op 1194 px). Laag en smal: één kolom,
        // kleiner, en wat niet past valt onderaan weg.
        const twee = blok.w >= 3;
        const volgorde = twee ? [0, 4, 1, 5, 2, 6, 3].map((i) => regels[i]) : regels;
        // In twee kolommen is er geen plek voor spaties rond de streepjes.
        const compact = (t) => (twee ? t.replace(/ – /g, "–").replace(/, /g, " · ") : t);
        const html = `<div class="ot ${twee ? "twee" : ""} ${blok.h <= 2 ? "compact" : ""}">${volgorde
          .map(
            (r) => `<div class="${r.vandaag ? "vandaag" : ""} ${r.tekst === "gesloten" ? "dicht" : ""}"><span>${escapeHtml(twee ? r.naam.slice(0, 2) : r.naam)}${
              r.reden ? ` · ${escapeHtml(r.reden)}` : ""
            }</span><span class="num">${escapeHtml(compact(r.tekst))}</span></div>`
          )
          .join("")}</div>`;
        const nuTekst = opening.open ? `Nu geopend, tot ${opening.tot}` : opening.straks ? `Nu gesloten, om ${opening.straks} weer open` : "Vandaag gesloten";
        zet(html, nuTekst);
        break;
      }
      case "verjaardagen": {
        const lijst = komendeVerjaardagen(this.stand_?.verjaardagen, new Date());
        const tonen = aantal > 0 ? lijst.slice(0, aantal) : lijst;
        el.dataset.meer = String(lijst.length - tonen.length);
        const jarig = lijst.filter((v) => v.dagen === 0).length;
        zet(
          tonen.length ? `<div class="vj-lijst">${tonen.map((v) => this.htmlVerjaardag_(v)).join("")}</div>` : `<div class="leeg">Geen verjaardagen.</div>`,
          jarig ? `${jarig} vandaag jarig` : ""
        );
        break;
      }
      case "aanwezig": {
        const personen = this.stand_?.personen ?? [];
        const gesorteerd = aanwezigEerst(personen);
        const tonen = aantal > 0 ? gesorteerd.slice(0, aantal) : gesorteerd;
        const rest = gesorteerd.length - tonen.length;
        const html = `<div class="tegels ${kolommen(blok.w)}">${tonen.map((p) => this.htmlPersoon_(p)).join("")}</div>`;
        const teller = this.stand_?.scherm?.aanwezig_teller !== false ? `${personen.filter((p) => p.aanwezig).length} van ${personen.length}` : "";
        el.dataset.meer = String(rest);
        zet(html, teller);
        break;
      }
      case "nieuws": {
        const lijst = this.nieuws_();
        const tonen = aantal > 0 ? lijst.slice(0, aantal) : lijst;
        const html = tonen.length
          ? `<div class="n-lijst">${tonen.map((n) => this.htmlBericht_(n)).join("")}</div>`
          : `<div class="leeg">Er is op dit moment geen nieuws.</div>`;
        el.dataset.meer = String(lijst.length - tonen.length);
        zet(html, "");
        break;
      }
      case "verlichting": {
        const lampen = this.installatie_().verlichting;
        const tonen = aantal > 0 ? lampen.slice(0, aantal) : lampen;
        el.dataset.meer = String(lampen.length - tonen.length);
        zet(`<div class="lampen ${kolommen(blok.w)}">${tonen.map((l) => this.htmlLamp_(l)).join("")}</div>`, "");
        break;
      }
      case "agenda": {
        const lijst = this.afspraken_;
        const tonen = aantal > 0 ? lijst.slice(0, aantal) : lijst;
        el.dataset.meer = String(lijst.length - tonen.length);
        zet(
          tonen.length ? `<div class="afspraken">${tonen.map((ev) => this.htmlAfspraak_(ev)).join("")}</div>` : `<div class="leeg">Geen afspraken vandaag.</div>`,
          lijst.length ? `${lijst.length} vandaag` : ""
        );
        break;
      }
      default:
        zet("");
    }
  }

  /* ------------------------------------------------------------ stukjes html */

  nacht_() {
    return stateOf(this.hass, "sun.sun")?.state === "below_horizon";
  }

  htmlVerjaardag_(v) {
    const sub = v.dagen === 0 ? (v.leeftijd ? `Vandaag jarig · wordt ${v.leeftijd}` : "Vandaag jarig") : v.leeftijd ? `wordt ${v.leeftijd}` : "";
    return `<div class="vj ${v.dagen === 0 ? "vandaag" : ""}">
      <div class="vj-ico">${ICOON.cake}</div>
      <div class="vj-tekst"><div class="vj-naam">${escapeHtml(v.naam)}</div>${sub ? `<div class="vj-sub">${escapeHtml(sub)}</div>` : ""}</div>
      <div class="vj-wanneer">${escapeHtml(v.wanneer)}</div>
    </div>`;
  }

  htmlWeerNu_() {
    const entiteit = this.installatie_().weer;
    const st = stateOf(this.hass, entiteit);
    const a = attrsOf(this.hass, entiteit);
    const temp = a.temperature;
    const delen = [];
    if (st) delen.push(WEER_NAAM[st.state] ?? localizeState(this.hass, st));
    if (typeof a.humidity === "number") delen.push(`${Math.round(a.humidity)}% vochtig`);
    if (typeof a.wind_speed === "number") delen.push(`wind ${fmtNumber(this.hass, a.wind_speed, 0)} ${a.wind_speed_unit ?? "km/h"}`);
    return `<div class="w-nu"><div class="w-icoon">${weerAnimatie(st?.state, this.nacht_())}</div><div><div class="temp">${
      typeof temp === "number" ? `${fmtNumber(this.hass, temp, 0)}°` : "--°"
    }</div><div class="w-tekst">${escapeHtml(delen.join(" · "))}</div></div></div>`;
  }

  htmlUren_(n) {
    const nu = Date.now();
    const komende = this.uren_.filter((f) => new Date(f.datetime).getTime() > nu - 30 * 60000).slice(0, n);
    if (!komende.length) return "";
    return `<div class="uren" style="grid-template-columns: repeat(${komende.length}, minmax(0, 1fr))">${komende
      .map((f) => {
        const t = new Date(f.datetime);
        return `<div class="uur"><span class="u">${klok(t)}</span>${weerAnimatie(f.condition, t.getHours() < 7 || t.getHours() >= 21)}<span class="t">${
          typeof f.temperature === "number" ? `${Math.round(f.temperature)}°` : "--"
        }</span></div>`;
      })
      .join("")}</div>`;
  }

  htmlDagen_() {
    const nu = new Date();
    const dagen = this.dagen_.slice(0, 7);
    if (!dagen.length) return "";
    return `<div class="dagen">${dagen
      .map((f) => {
        const d = new Date(f.datetime);
        return `<div class="dag"><span class="u">${escapeHtml(dagKort(d, nu))}</span>${weerAnimatie(f.condition)}<span class="t">${
          typeof f.temperature === "number" ? `${Math.round(f.temperature)}°` : "--"
        }</span>${typeof f.templow === "number" ? `<span class="t2">${Math.round(f.templow)}°</span>` : ""}</div>`;
      })
      .join("")}</div>`;
  }

  htmlPersoon_(p) {
    return `<div class="persoon ${p.aanwezig ? "aan" : ""}" role="button" tabindex="0" data-id="${escapeHtml(p.id)}">
      <div class="avatar" data-foto="${escapeHtml(p.foto ?? "")}">${escapeHtml(p.initialen || "?")}</div>
      <div class="p-tekst">
        <div class="p-naam">${escapeHtml(p.naam)}</div>
        ${p.functie ? `<div class="p-functie">${escapeHtml(p.functie)}</div>` : ""}
        <div class="p-status">${p.aanwezig ? "Aanwezig" : "Afwezig"}</div>
      </div>
    </div>`;
  }

  htmlBericht_(n, groot = false) {
    const bron = n.bron ?? "";
    return `<div class="bericht" role="button" tabindex="0" data-id="${escapeHtml(n.id)}">
      <div class="foto"></div>
      <div class="b-tekst">
        <div class="b-bron">${escapeHtml(bron)}${n.datum ? ` · ${escapeHtml(relatieveTijd(n.datum, new Date()))}` : ""}</div>
        <div class="b-titel">${escapeHtml(n.titel)}</div>
        ${groot && n.tekst ? `<div class="b-samenvatting">${escapeHtml(n.tekst)}</div>` : ""}
      </div>
    </div>`;
  }

  htmlLamp_(lamp) {
    const id = lamp.entity;
    const st = stateOf(this.hass, id);
    const a = st?.attributes ?? {};
    const aan = isOn(st);
    const dood = !st || st.state === "unavailable";
    const rgb = a.rgb_color;
    const kleur = aan && Array.isArray(rgb) && !(rgb[0] > 240 && rgb[1] > 240 && rgb[2] > 240) ? `rgb(${rgb.join(",")})` : "";
    const status = dood ? "Niet bereikbaar" : aan ? (typeof a.brightness === "number" ? `Aan · ${Math.round((a.brightness / 255) * 100)}%` : "Aan") : "Uit";
    // De naam uit het beheer gaat voor; de receptie mag hem daar wijzigen.
    const naam = lamp.naam || a.friendly_name || id;
    return `<div class="lamp ${aan ? "aan" : ""} ${dood ? "dood" : ""}" role="button" tabindex="0" data-id="${escapeHtml(id)}" style="${kleur ? `--lampkleur:${kleur}` : ""}">
      <div class="chip">${resolve("bulb")}</div>
      <div class="l-tekst"><div class="l-naam">${escapeHtml(naam)}</div><div class="l-status">${status}</div></div>
    </div>`;
  }

  htmlAfspraak_(ev) {
    const heleDag = !String(ev.start).includes("T");
    const tijd = heleDag ? "hele dag" : `${klok(new Date(ev.start))}${ev.end ? ` – ${klok(new Date(ev.end))}` : ""}`;
    const naam = attrsOf(this.hass, ev.kalender).friendly_name ?? ev.kalender;
    const meerdere = this.installatie_().agendas.length > 1;
    return `<div class="afspraak"><span class="a-tijd">${escapeHtml(tijd)}</span><span class="a-tekst">${escapeHtml(ev.summary ?? "")}</span>${
      meerdere ? `<span class="a-kalender">${escapeHtml(naam)}</span>` : ""
    }</div>`;
  }

  /* ------------------------------------------------------------ de pagina's */

  paintPaginas_() {
    const lijst = paginas(this.standNu_(), this.feeds_, isoDatumTijd(new Date()));
    if (!lijst.includes(this.pagina_)) this.pagina_ = "welkom";
    for (const sec of this.$$(".pagina")) sec.classList.toggle("actief", sec.dataset.p === this.pagina_);
  }

  /** De inhoud van één pagina. Alleen de zichtbare wordt getekend; de rest bij het openen. */
  paintPagina_(pagina) {
    if (pagina !== this.pagina_ || pagina === "welkom") return;
    const vak = this.$(`.p-inhoud[data-p="${pagina}"]`);
    if (!vak) return;
    const s = this.stand_?.scherm ?? {};
    switch (pagina) {
      case "aanwezig": {
        const personen = this.stand_?.personen ?? [];
        const tegels = (lijst) => `<div class="tegels">${lijst.map((p) => this.htmlPersoon_(p)).join("")}</div>`;
        const weergave = s.aanwezig_weergave ?? "gescheiden";
        let html;
        if (weergave === "functie") {
          const groepen = groepeerOpFunctie(personen);
          html = `<div class="kolommen ${groepen.length >= 3 ? "drie" : "twee"}">${groepen
            .map((g) => `<div class="kolom"><div class="eyebrow">${escapeHtml(g.functie || "Overig")} · ${g.personen.length}</div>${tegels(g.personen)}</div>`)
            .join("")}</div>`;
        } else if (weergave === "lijst") {
          html = `<div class="tegels kol-3">${personen.map((p) => this.htmlPersoon_(p)).join("")}</div>`;
        } else {
          const { aanwezig, afwezig } = splitsAanwezig(personen);
          html = `<div class="kolommen twee">
            <div class="kolom"><div class="eyebrow">Aanwezig · ${aanwezig.length}</div>${aanwezig.length ? tegels(aanwezig) : `<div class="leeg">Niemand aangemeld.</div>`}</div>
            <div class="kolom"><div class="eyebrow">Afwezig · ${afwezig.length}</div>${afwezig.length ? tegels(afwezig) : `<div class="leeg">Iedereen is er.</div>`}</div>
          </div>`;
        }
        this.vul_(vak, html);
        const aantal = personen.filter((p) => p.aanwezig).length;
        this.text(".pagina[data-p='aanwezig'] .pk-titel", s.aanwezig_teller !== false && personen.length ? `${aantal} van ${personen.length} aanwezig` : "Aanwezig");
        break;
      }
      case "nieuws": {
        const lijst = this.nieuws_();
        this.vul_(vak, lijst.length ? `<div class="nieuws-raster">${lijst.map((n) => this.htmlBericht_(n, true)).join("")}</div>` : `<div class="leeg">Er is op dit moment geen nieuws.</div>`);
        break;
      }
      case "weer": {
        this.vul_(vak, `<div class="weerpagina">${this.htmlWeerNu_()}${this.htmlUren_(8)}${this.htmlDagen_()}</div>`, false);
        break;
      }
      case "energie": {
        this.vul_(vak, this.htmlEnergie_(true), false);
        break;
      }
      case "verlichting": {
        const lampen = this.installatie_().verlichting;
        this.vul_(vak, `<div class="lampen kol-3">${lampen.map((l) => this.htmlLamp_(l)).join("")}</div>`, false);
        break;
      }
      case "verjaardagen": {
        const lijst = komendeVerjaardagen(this.stand_?.verjaardagen, new Date());
        this.vul_(vak, lijst.length ? `<div class="vj-raster">${lijst.map((v) => this.htmlVerjaardag_(v)).join("")}</div>` : `<div class="leeg">Geen verjaardagen.</div>`, false);
        break;
      }
      case "mededelingen": {
        // Alle mededelingen die nu gelden, onder elkaar en helemaal
        // uitgeschreven; daaronder wat er klaarstaat. Gevraagd op
        // 10 september 2026: "een ander tabblad waar alle meldingen op staan,
        // overzichtelijk."
        const nu = isoDatumTijd(new Date());
        const actief = actieveMededelingen(this.stand_?.mededelingen, nu);
        const komend = komendeMededelingen(this.stand_?.mededelingen, nu);
        const item = (m) => `<div class="m-item">${
          mededelingPeriode(m) ? `<div class="m-p">${escapeHtml(mededelingPeriode(m))}</div>` : ""
        }<div class="m-t">${escapeHtml(m.tekst)}</div></div>`;
        this.vul_(
          vak,
          `<div class="m-pagina">
            <div class="m-lijst">${actief.length ? actief.map(item).join("") : `<div class="leeg">Geen mededelingen.</div>`}</div>
            ${komend.length ? `<div class="eyebrow m-kop">Binnenkort</div><div class="m-lijst">${komend.map(item).join("")}</div>` : ""}
          </div>`,
          false
        );
        break;
      }
      case "agenda": {
        const lijst = this.afspraken_;
        this.vul_(vak, lijst.length ? `<div class="afspraken">${lijst.map((ev) => this.htmlAfspraak_(ev)).join("")}</div>` : `<div class="leeg">Geen afspraken vandaag.</div>`, false);
        break;
      }
      default:
    }
  }

  paintMerkje_() {
    const merkje = this.$(".merkje");
    if (!merkje) return;
    const weg = this.hass?.connected === false;
    merkje.classList.toggle("open", weg || Boolean(this.fout_));
    this.text(".merkje span", weg ? "Geen verbinding" : this.fout_ ?? "");
  }
}

/* Geen editor: er valt niets in te stellen. De installatie staat in de
   kaarteditor van DomotiApp Infoscherm Beheer. */

registerCard(TAG, InfoschermCard, {
  name: "DomotiApp Infoscherm",
  description:
    "Beeldvullend scherm voor een wachtkamer: logo, klok, weer, energie, wie er is, mededelingen, nieuws, verjaardagen en verlichting. Toevoegen en klaar; alles komt uit DomotiApp Infoscherm Beheer.",
  preview: false,
});
InfoschermCard.getStubConfig = () => ({});
