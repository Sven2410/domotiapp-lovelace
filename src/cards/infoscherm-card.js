/**
 * DomotiApp Infoscherm -- het scherm in de wachtkamer.
 *
 * Een iPad van 11 inch in kioskmodus, en dat is een ander ding dan een
 * dashboard: niemand die ernaar kijkt kent Home Assistant, en niemand hoort
 * er iets van te zien. Geen merk, geen kop, geen zijbalk (die haalt de
 * kiosk-mode-integratie weg). Wat er WEL staat: het logo en de naam van de
 * praktijk, de klok, het weer, wie er vandaag is, het nieuws van het pand en
 * -- als de receptie dat wil -- de verlichting.
 *
 * GEEN KAARTCONFIG
 *
 * Sinds ronde 2 (10 september 2026) heeft deze kaart geen editor en geen
 * instellingen: *"Dat is gewoon toevoegen en dan klaar."* Alles komt uit de
 * opslag van de integratie -- de entiteiten kiest de installateur in het blok
 * Installatie van het beheer, de rest de receptie. Daardoor is ALLES live: een
 * wijziging in het beheer staat binnen een seconde op de iPad, zonder dat
 * iemand een dashboard hoeft op te slaan. Wat er in een oude YAML nog aan
 * `weather:` of `lights:` staat wordt genegeerd.
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
 * - Buiten de openingstijden dimt het scherm naar een klok met "Gesloten,
 *   morgen open om 08:00". Een tik haalt het gewone scherm even terug.
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
import { abonneer, bestandUrl, haalStand, nogNietGereed, zetAanwezig } from "../infoscherm-client.js";
import { WEER_NAAM, weerAnimatie, weerAnimatieCss } from "../weer-animatie.js";
import {
  BLOK_INFO,
  actieveMededelingen,
  aanwezigEerst,
  blokOntbreekt,
  dagKort,
  datumLang,
  geslotenRegel,
  groepeerOpFunctie,
  heeftOpeningstijden,
  isoDatum,
  klok,
  nieuwsLijst,
  omDeBeurt,
  openingVandaag,
  openingsRegels,
  paginas,
  relatieveTijd,
  splitsAanwezig,
  standaardIndeling,
} from "./infoscherm-logica.js";

const TAG = "domotiapp-infoscherm-card";

/* Drie iconen die de familie nog niet had. Zelfde tekenstijl als icons.js. */
const teken = (body) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
const ICOON = {
  news: teken(`<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2"/><path d="M7.2 9.2h9.6M7.2 12.6h9.6M7.2 16h5.6"/>`),
  megaphone: teken(`<path d="M4 11v2a1 1 0 0 0 1 1h2l5 4V6L7 10H5a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>`),
  moon: teken(`<path d="M19.6 14.4A8 8 0 0 1 9.6 4.4a8 8 0 1 0 10 10z"/>`),
  offline: teken(`<path d="M3.4 6.8a13.6 13.6 0 0 1 17.2 0M6.6 10.4a9 9 0 0 1 10.8 0M9.8 14a4.4 4.4 0 0 1 4.4 0"/><circle cx="12" cy="18" r="1"/><path d="M4 4l16 16"/>`),
  back: teken(`<path d="m14.6 6.2-5.6 5.8 5.6 5.8"/>`),
};
const icoon = (naam) => ICOON[naam] ?? resolve(naam);

const PAGINA_KOP = {
  aanwezig: { eyebrow: "Wie is er vandaag", titel: "Aanwezig", onder: "Tik op uw naam om u aan of af te melden." },
  nieuws: { eyebrow: "Nieuws", titel: "Wat er speelt", onder: "" },
  weer: { eyebrow: "Weer", titel: "De komende dagen", onder: "" },
  verlichting: { eyebrow: "Verlichting", titel: "Lampen", onder: "Tik op een lamp om hem aan of uit te zetten." },
  agenda: { eyebrow: "Agenda", titel: "Vandaag", onder: "" },
};

const css = /* css */ `
  :host { display: block; height: 100%; }

  .scherm {
    --tone: var(--dac-accent-hi);
    --s: 1;
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
  .kop { display: flex; align-items: center; justify-content: space-between; gap: calc(24px * var(--s)); flex: 0 0 auto; }
  .merk { display: flex; align-items: center; gap: calc(16px * var(--s)); min-width: 0; }
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
  .praktijk { display: flex; flex-direction: column; gap: calc(3px * var(--s)); min-width: 0; }
  .naam { font-size: calc(24px * var(--s)); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .adres { font-size: calc(15px * var(--s)); color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tijd { display: flex; flex-direction: column; align-items: flex-end; flex: 0 0 auto; }
  .klok { font-size: calc(58px * var(--s)); font-weight: 300; line-height: 1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .datum { font-size: calc(16px * var(--s)); color: var(--dac-ink-2); margin-top: calc(2px * var(--s)); }

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
  .blok {
    display: flex; flex-direction: column; min-height: 0; min-width: 0; overflow: hidden;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius); box-shadow: var(--dac-shadow);
    container-type: inline-size;
  }
  .blok.welkom { background: none; border: none; box-shadow: none; justify-content: center; }
  .blok.mededeling {
    border-color: color-mix(in srgb, var(--tone) 40%, transparent);
    background: color-mix(in srgb, var(--tone) 10%, transparent);
  }
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
     wordt compact, anders staat er een halve tegel. */
  .blok.klein .bk { padding: calc(6px * var(--s)) calc(14px * var(--s)); }
  .blok.klein .bi { padding: calc(6px * var(--s)) calc(12px * var(--s)); gap: calc(6px * var(--s)); }
  .blok.klein .persoon, .blok.klein .lamp { min-height: 0; padding: calc(5px * var(--s)) calc(10px * var(--s)); gap: calc(10px * var(--s)); }
  .blok.klein .avatar, .blok.klein .lamp .chip { width: calc(32px * var(--s)); height: calc(32px * var(--s)); font-size: calc(13px * var(--s)); }
  .blok.klein .lamp .chip { font-size: calc(18px * var(--s)); }
  .blok.klein .p-functie, .blok.klein .p-status, .blok.klein .l-status { display: none; }
  .blok.klein .chip { width: calc(34px * var(--s)); height: calc(34px * var(--s)); font-size: calc(18px * var(--s)); }
  .blok.klein.mededeling .tekst { font-size: calc(16px * var(--s)); }
  .blok.klein .afspraak { padding: calc(6px * var(--s)) calc(12px * var(--s)); }
  .blok.klein .bericht { padding: calc(6px * var(--s)) calc(10px * var(--s)); }
  .blok.klein .bericht .foto { display: none; }
  .blok.mededeling .bi { flex-direction: row; align-items: center; gap: calc(14px * var(--s)); padding: calc(12px * var(--s)) calc(18px * var(--s)); }
  .blok.welkom .bi { padding: 0 calc(4px * var(--s)); justify-content: center; gap: calc(4px * var(--s)); }
  .leeg { color: var(--dac-ink-3); font-size: calc(16px * var(--s)); padding: calc(10px * var(--s)) 0; }

  /* welkom */
  .welkomtekst { font-size: calc(34px * var(--s)); font-weight: 600; letter-spacing: -0.01em; line-height: 1.15; }
  .welkom-onder { font-size: calc(17px * var(--s)); color: var(--dac-ink-2); }

  /* weer */
  .w-nu { display: flex; align-items: center; gap: calc(16px * var(--s)); }
  .w-icoon { font-size: calc(72px * var(--s)); flex: 0 0 auto; color: var(--dac-ink-2); }
  .temp { font-size: calc(42px * var(--s)); font-weight: 300; line-height: 1; font-variant-numeric: tabular-nums; }
  .w-tekst { font-size: calc(15px * var(--s)); color: var(--dac-ink-2); margin-top: calc(4px * var(--s)); line-height: 1.3; }
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
  .dagen { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: calc(8px * var(--s)); }

  /* mededeling */
  .chip {
    width: calc(46px * var(--s)); height: calc(46px * var(--s)); flex: 0 0 auto; font-size: calc(24px * var(--s));
    border-radius: var(--dac-radius-sm); display: grid; place-items: center; color: var(--tone);
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 32%, transparent);
  }
  .blok.mededeling .eyebrow { color: var(--tone); }
  .blok.mededeling .tekst { font-size: calc(18px * var(--s)); line-height: 1.35; }

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
  .n-lijst { display: flex; flex-direction: column; gap: calc(8px * var(--s)); }
  .nieuws-raster { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(14px * var(--s)); align-content: start; }
  .bericht {
    display: flex; gap: calc(12px * var(--s)); padding: calc(10px * var(--s)) calc(12px * var(--s)); cursor: pointer;
    background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius);
    box-shadow: var(--dac-shadow); text-align: left; font: inherit; color: inherit; min-width: 0;
  }
  .nieuws-raster .bericht { padding: calc(16px * var(--s)) calc(18px * var(--s)); gap: calc(16px * var(--s)); min-height: calc(110px * var(--s)); }
  .bericht:active { background: var(--dac-surface-hi); }
  .bericht.eigen { border-color: color-mix(in srgb, var(--tone) 40%, transparent); }
  .bericht .foto { width: calc(84px * var(--s)); height: calc(60px * var(--s)); flex: 0 0 auto; border-radius: var(--dac-radius-sm); overflow: hidden; background: var(--dac-surface); }
  .nieuws-raster .bericht .foto { width: calc(120px * var(--s)); height: calc(84px * var(--s)); }
  .bericht .foto:empty { display: none; }
  .bericht .foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .b-tekst { min-width: 0; display: flex; flex-direction: column; gap: calc(3px * var(--s)); flex: 1 1 auto; }
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

  .afspraken { display: flex; flex-direction: column; gap: calc(8px * var(--s)); }
  .afspraak { display: flex; align-items: center; gap: calc(14px * var(--s)); padding: calc(10px * var(--s)) calc(14px * var(--s)); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); min-width: 0; }
  .p-inhoud .afspraak { padding: calc(14px * var(--s)) calc(20px * var(--s)); }
  .a-tijd { font-size: calc(16px * var(--s)); font-variant-numeric: tabular-nums; color: var(--tone); font-weight: 600; flex: 0 0 auto; }
  .p-inhoud .a-tijd { font-size: calc(20px * var(--s)); min-width: calc(120px * var(--s)); }
  .a-tekst { font-size: calc(16px * var(--s)); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .p-inhoud .a-tekst { font-size: calc(19px * var(--s)); white-space: normal; }
  .a-kalender { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); margin-left: auto; flex: 0 0 auto; }

  /* ------------------------------------------------------------ lagen */
  .laag { position: absolute; inset: 0; display: none; background: var(--dac-bg); color: var(--dac-ink); }
  .laag.open { display: flex; }
  .nacht { flex-direction: column; align-items: center; justify-content: center; gap: calc(12px * var(--s)); cursor: pointer; }
  .nacht .klok { font-size: calc(140px * var(--s)); opacity: 0.85; }
  .nacht .datum { font-size: calc(22px * var(--s)); }
  .nacht .gesloten { margin-top: calc(24px * var(--s)); display: flex; align-items: center; gap: calc(12px * var(--s)); font-size: calc(20px * var(--s)); color: var(--dac-ink-2); }
  .nacht .gesloten .icon { font-size: calc(24px * var(--s)); color: var(--dac-ink-3); }
  .nacht .logo { margin-bottom: calc(20px * var(--s)); height: calc(96px * var(--s)); max-width: calc(360px * var(--s)); }
  .nacht .logo:not(.beeld) { width: calc(96px * var(--s)); }

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
    this.welkomTel_ = 0;
    this.mededelingTel_ = 0;
    this.nachtSluimer_ = 0;
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
  }

  /** Er is geen kaartconfig; alles komt uit het beheer. */
  validate() {
    return {};
  }

  watched() {
    const i = this.stand_?.installatie;
    return [i?.weer, "sun.sun", ...(i?.verlichting ?? []).map((l) => l.entity)].filter(Boolean);
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
        <div class="kop">
          <div class="merk">
            <div class="logo"></div>
            <div class="praktijk"><div class="naam"></div><div class="adres"></div></div>
          </div>
          <div class="tijd"><div class="klok">--:--</div><div class="datum"></div></div>
        </div>

        <section class="pagina actief" data-p="welkom"><div class="raster"></div></section>
        ${Object.keys(PAGINA_KOP).map(pagina).join("")}

        <div class="laag detail">
          <button class="sluit" type="button">${ICOON.back}<span>Terug</span></button>
          <div class="d-bron"></div>
          <div class="d-titel"></div>
          <div class="d-datum"></div>
          <div class="d-inhoud"><div class="d-foto"></div><div class="d-tekst"></div></div>
        </div>

        <div class="laag nacht">
          <div class="logo"></div>
          <div class="klok">--:--</div>
          <div class="datum"></div>
          <div class="gesloten">${ICOON.moon}<span></span></div>
        </div>

        <div class="merkje">${ICOON.offline}<span>Geen verbinding</span></div>
      </div>`;
  }

  /* ------------------------------------------------------------ wire */

  wire() {
    const scherm = this.$(".scherm");

    // Elke aanraking is een teken van leven voor de terugvaltimer en de nachtstand.
    this.on(scherm, "pointerdown", () => this.leeft_(), { capture: true, passive: true });

    // Eén luisteraar voor alles wat klikbaar is; de vakken worden vaak
    // opnieuw getekend, en een luisteraar per tegel zou dan telkens weg zijn.
    this.on(scherm, "click", (e) => {
      const doel = e.target;
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
      if (doel.closest(".nacht")) {
        // Even kijken mag: de nachtstand komt na de terugvaltijd vanzelf terug.
        this.nachtSluimer_ = Date.now() + Math.max(30, this.terugNa_() || 60) * 1000;
        this.paintNacht_();
      }
      return undefined;
    });

    // De hoogte is het scherm minus wat er boven de kaart staat: met
    // kiosk-mode is dat niets, zonder is het de kop van Home Assistant. In de
    // bewerkdialoog een vaste maat, anders is het voorbeeld schermvullend.
    // Gemeten in de ResizeObserver en niet alleen bij het bouwen: op dat
    // moment hangt de kaart nog niet in de view en is zijn bovenkant 0
    // (valkuil 25), dus het eerste antwoord is altijd 100dvh.
    const hoogte = () => {
      if (this.inDialoog_()) return scherm.style.setProperty("--hoogte", "600px");
      const top = Math.max(0, Math.round(this.getBoundingClientRect().top));
      const wens = top ? `calc(100dvh - ${top}px)` : "100dvh";
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
      scherm.style.setProperty("--s", Math.max(0.35, s).toFixed(3));
      requestAnimationFrame(() => this.pasAlleBij_());
    };
    this.meet_ = meet;
    const ro = new ResizeObserver(meet);
    ro.observe(scherm);
    this.teardown_.push(() => ro.disconnect());
    this.on(window, "resize", hoogte);
    meet();

    // De klok tikt op de minuut, de nachtstand kijkt mee.
    const tik = () => {
      this.paintKlok_();
      this.paintNacht_();
    };
    const naarDeMinuut = () => {
      tik();
      this.klokTimer_ = setTimeout(naarDeMinuut, 60000 - (Date.now() % 60000) + 20);
    };
    naarDeMinuut();
    this.teardown_.push(() => clearTimeout(this.klokTimer_));

    // Welkomsttekst en mededeling wisselen om de twintig seconden.
    const wissel = setInterval(() => {
      this.welkomTel_ += 1;
      this.mededelingTel_ += 1;
      this.paintRaster_();
    }, 20000);
    this.teardown_.push(() => clearInterval(wissel));

    // Terugvaltimer.
    this.leeft_();
    this.teardown_.push(() => clearTimeout(this.terugTimer_));

    // Agenda om de tien minuten.
    const agenda = setInterval(() => this.haalAgenda_(), 10 * 60000);
    this.teardown_.push(() => clearInterval(agenda));

    this.teardown_.push(() => this.herkansing_.stop());
    this.teardown_.push(() => this.zegWeerOp_());

    this.haal_();
    this.luister_();
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
    this.haalAgenda_();
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
    const entiteit = this.stand_?.installatie?.weer || null;
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
    const agendas = this.stand_?.installatie?.agendas ?? [];
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
    const beschikbaar = paginas(this.stand_, this.feeds_);
    this.pagina_ = beschikbaar.includes(pagina) ? pagina : "welkom";
    this.paintPaginas_();
    this.paintPagina_(this.pagina_);
    this.$(`.p-inhoud[data-p="${this.pagina_}"]`)?.scrollTo?.(0, 0);
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
    this.text(".d-bron", item.eigen ? this.stand_?.praktijk?.naam || "Mededeling" : item.bron ?? "");
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

  /** Een afbeelding in een vak: een eigen bestand via de blob-cache, een feed via zijn URL. */
  plaatje_(vak, item) {
    if (this.stand_?.scherm?.nieuws_afbeeldingen === false) return;
    if (item.eigen && item.afbeelding) {
      bestandUrl(this.hass, item.afbeelding).then((url) => {
        if (url && vak.isConnected) vak.innerHTML = `<img alt="" src="${url}">`;
      });
    } else if (!item.eigen && item.afbeelding && /^https?:/.test(item.afbeelding)) {
      vak.innerHTML = `<img alt="" src="${escapeHtml(item.afbeelding)}" loading="lazy">`;
    }
  }

  nieuws_() {
    return nieuwsLijst(this.stand_?.nieuws, this.feeds_, isoDatum(new Date()));
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
    this.paintKop_();
    this.paintRaster_();
    this.paintPaginas_();
    this.paintPagina_(this.pagina_);
    this.paintNacht_();
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

  paintKop_() {
    const p = this.stand_?.praktijk ?? {};
    const logoId = this.stand_?.scherm?.logo ?? "";
    this.text(".naam", p.naam || (this.fout_ ? "Infoscherm" : ""));
    this.text(".adres", p.adres || "");
    for (const logo of this.$$(".logo")) {
      const wens = `${logoId}|${p.naam ? p.naam.slice(0, 1).toUpperCase() : ""}`;
      if (logo.dataset.wens === wens) continue;
      logo.dataset.wens = wens;
      logo.classList.remove("beeld");
      logo.textContent = p.naam ? p.naam.slice(0, 1).toUpperCase() : "";
      if (logoId) {
        bestandUrl(this.hass, logoId).then((url) => {
          if (!url || logo.dataset.wens !== wens) return;
          logo.innerHTML = `<img alt="" src="${url}">`;
          logo.classList.add("beeld");
        });
      }
    }
    this.paintKlok_();
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
    const vandaag = isoDatum(new Date());
    const wens = new Map();
    for (const blok of indeling.blokken) {
      if (!BLOK_INFO[blok.soort]) continue;
      if (blokOntbreekt(blok.soort, this.stand_, this.feeds_, vandaag)) continue;
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
    for (const el of this.$$(".raster .blok")) this.pasBij_(el);
  }

  pasBij_(el) {
    const bi = el.querySelector(".bi");
    if (!bi) return;
    const onder = bi.getBoundingClientRect().bottom - parseFloat(getComputedStyle(bi).paddingBottom);
    // De uurvoorspelling in een laag weerblok: past hij niet, dan weg.
    const uren = bi.querySelector(".uren");
    if (uren) {
      uren.hidden = false;
      uren.hidden = uren.getBoundingClientRect().bottom > onder + 1;
    }
    const lijst = bi.querySelector(".tegels, .n-lijst, .lampen, .afspraken, .ot");
    if (!lijst) return;
    let verborgen = 0;
    const kinderen = [...lijst.children];
    for (const kind of kinderen) kind.hidden = false;
    for (const kind of kinderen) {
      if (kind.getBoundingClientRect().bottom > onder + 1) {
        kind.hidden = true;
        verborgen += 1;
      }
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
        const p = this.stand_?.praktijk ?? {};
        const nu = new Date();
        const teksten = p.welkom?.length ? p.welkom : ["Welkom"];
        let onder = "";
        if (heeftOpeningstijden(p)) {
          const opening = openingVandaag(p, nu);
          onder = opening.open ? `Vandaag geopend tot ${opening.tot}` : geslotenRegel(p, nu);
        }
        zet(`<div class="welkomtekst">${escapeHtml(omDeBeurt(teksten, this.welkomTel_))}</div>${onder ? `<div class="welkom-onder">${escapeHtml(onder)}</div>` : ""}`);
        break;
      }
      case "weer": {
        zet(this.htmlWeerNu_() + (blok.h >= 2 ? this.htmlUren_(blok.w >= 3 ? 6 : 4) : ""));
        break;
      }
      case "mededeling": {
        const lijst = actieveMededelingen(this.stand_?.mededelingen, isoDatum(new Date()));
        const m = omDeBeurt(lijst, this.mededelingTel_);
        zet(`<div class="chip">${ICOON.megaphone}</div><div class="tekst">${escapeHtml(m?.tekst ?? "")}</div>`);
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
        const lampen = this.stand_?.installatie?.verlichting ?? [];
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

  htmlWeerNu_() {
    const entiteit = this.stand_?.installatie?.weer;
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
    const bron = n.eigen ? this.stand_?.praktijk?.naam || "Mededeling" : n.bron ?? "";
    return `<div class="bericht ${n.eigen ? "eigen" : ""}" role="button" tabindex="0" data-id="${escapeHtml(n.id)}">
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
    const meerdere = (this.stand_?.installatie?.agendas?.length ?? 0) > 1;
    return `<div class="afspraak"><span class="a-tijd">${escapeHtml(tijd)}</span><span class="a-tekst">${escapeHtml(ev.summary ?? "")}</span>${
      meerdere ? `<span class="a-kalender">${escapeHtml(naam)}</span>` : ""
    }</div>`;
  }

  /* ------------------------------------------------------------ de pagina's */

  paintPaginas_() {
    const lijst = paginas(this.stand_, this.feeds_);
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
      case "verlichting": {
        const lampen = this.stand_?.installatie?.verlichting ?? [];
        this.vul_(vak, `<div class="lampen kol-3">${lampen.map((l) => this.htmlLamp_(l)).join("")}</div>`, false);
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

  paintNacht_() {
    const laag = this.$(".nacht");
    if (!laag) return;
    const p = this.stand_?.praktijk;
    const nu = new Date();
    let aan = false;
    if (this.stand_?.scherm?.nachtstand !== false && p && heeftOpeningstijden(p) && !this.inDialoog_()) {
      aan = !openingVandaag(p, nu).open && Date.now() > this.nachtSluimer_;
    }
    if (aan) this.text(".nacht .gesloten span", geslotenRegel(p, nu));
    laag.classList.toggle("open", aan);
  }

  paintMerkje_() {
    const merkje = this.$(".merkje");
    if (!merkje) return;
    const weg = this.hass?.connected === false;
    merkje.classList.toggle("open", weg || Boolean(this.fout_));
    this.text(".merkje span", weg ? "Geen verbinding" : this.fout_ ?? "");
  }
}

registerCard(TAG, InfoschermCard, {
  name: "DomotiApp Infoscherm",
  description:
    "Beeldvullend scherm voor een wachtkamer: logo, klok, weer, wie er is, nieuws en verlichting. Geen instellingen: alles komt uit DomotiApp Infoscherm Beheer.",
  preview: false,
});
InfoschermCard.getStubConfig = () => ({});
