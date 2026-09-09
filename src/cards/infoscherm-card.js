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
 * DE EERSTE KAART BUITEN HET RASTER
 *
 * Elke andere kaart van de familie staat op rasterrijen van 56px omdat hij
 * náást een andere kaart staat. Deze staat nooit naast iets: hij vult zijn
 * `panel`-view. Zijn maat is het scherm, en alles erin schaalt mee met de
 * breedte (`--s`), zodat een tv van 55 inch dezelfde verhoudingen krijgt als
 * de iPad waarvoor hij is ontworpen. SPEC 20.2.
 *
 * DE EERSTE KAART MET EEN EIGEN ACCENT
 *
 * Kleur is op deze kaarten identiteit, en hier is de identiteit die van de
 * KLANT: het accent komt uit het beheer (of uit de config van de
 * installateur). De toestandsregel blijft staan -- alleen de chip van een
 * medewerker of een lamp draagt de toestand. SPEC 20.3.
 *
 * WAT ER ANDERS IS DAN OP EEN DASHBOARD
 *
 * - Na een minuut zonder aanraking gaat het scherm terug naar Welkom. Wie op
 *   Nieuws bleef staan en wegliep laat anders de volgende bezoeker een
 *   nieuwsbericht zien in plaats van "welkom, neemt u plaats".
 * - Buiten de openingstijden dimt het scherm naar een klok met "Gesloten,
 *   morgen open om 08:00". Een tik haalt het gewone scherm even terug.
 * - De verbinding kan wegvallen; het scherm blijft dan zijn laatste inhoud
 *   tonen met een klein merkje, en gaat niet op zwart.
 * - De commando's van de serverkant bestaan pas als de integratie is opgezet
 *   (valkuil 28). Een iPad die de hele nacht aanstaat is precies het toestel
 *   dat als eerste terug is na een herstart; vandaar `Herkansing`.
 */

import { DacCard, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, row, section, sel } from "../editor/base.js";
import { icons, resolve, weatherIcon } from "../icons.js";
import { attrsOf, fmtNumber, isOn, localizeState, stateOf } from "../ha.js";
import { Herkansing, Verbindingswacht } from "../herkansing.js";
import { abonneer, bestandUrl, haalStand, nogNietGereed, zetAanwezig } from "../infoscherm-client.js";
import {
  actieveMededelingen,
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
} from "./infoscherm-logica.js";

const TAG = "domotiapp-infoscherm-card";

/* Twee iconen die de familie nog niet had. Zelfde tekenstijl als icons.js. */
const teken = (body) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
const ICOON = {
  news: teken(`<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2"/><path d="M7.2 9.2h9.6M7.2 12.6h9.6M7.2 16h5.6"/>`),
  megaphone: teken(`<path d="M4 11v2a1 1 0 0 0 1 1h2l5 4V6L7 10H5a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>`),
  moon: teken(`<path d="M19.6 14.4A8 8 0 0 1 9.6 4.4a8 8 0 1 0 10 10z"/>`),
  offline: teken(`<path d="M3.4 6.8a13.6 13.6 0 0 1 17.2 0M6.6 10.4a9 9 0 0 1 10.8 0M9.8 14a4.4 4.4 0 0 1 4.4 0"/><circle cx="12" cy="18" r="1"/><path d="M4 4l16 16"/>`),
};

const PAGINA_ICOON = {
  welkom: "house",
  aanwezig: "people",
  nieuws: "news",
  verlichting: "bulb",
  agenda: "calendar",
};
const PAGINA_NAAM = {
  welkom: "Welkom",
  aanwezig: "Aanwezig",
  nieuws: "Nieuws",
  verlichting: "Verlichting",
  agenda: "Agenda",
};

const icoon = (naam) => ICOON[naam] ?? resolve(naam);

const STANDAARD = {
  verlichting: "beheer",
  show_aanwezig: true,
  show_nieuws: true,
  show_agenda: true,
  show_weer: true,
  show_openingstijden: true,
  show_mededeling: true,
  show_uurweer: true,
  terug_na: 60,
  carrousel: 0,
  nachtstand: true,
  groepeer_functie: false,
  uiterlijk: "donker",
  foto_vorm: "rond",
  schaal: 1,
  aanwezig_teller: true,
  nieuws_afbeeldingen: true,
};

const css = /* css */ `
  :host { display: block; height: 100%; }

  .scherm {
    --tone: var(--dac-accent-hi);
    --s: 1;
    position: relative; width: 100%; height: var(--hoogte, 100dvh);
    overflow: hidden; background: var(--dac-bg); color: var(--dac-ink);
    display: flex; flex-direction: column;
    padding: calc(28px * var(--s)) calc(40px * var(--s)) calc(20px * var(--s));
    gap: calc(20px * var(--s));
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
  .logo {
    width: calc(64px * var(--s)); height: calc(64px * var(--s)); flex: 0 0 auto;
    border-radius: var(--dac-radius-sm); display: grid; place-items: center; overflow: hidden;
    color: var(--tone); font-weight: 700; font-size: calc(20px * var(--s));
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 32%, transparent);
  }
  .logo img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .logo.beeld { background: none; border: none; }
  .praktijk { display: flex; flex-direction: column; gap: calc(3px * var(--s)); min-width: 0; }
  .naam { font-size: calc(24px * var(--s)); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .adres { font-size: calc(15px * var(--s)); color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tijd { display: flex; flex-direction: column; align-items: flex-end; flex: 0 0 auto; }
  .klok { font-size: calc(64px * var(--s)); font-weight: 300; line-height: 1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .datum { font-size: calc(17px * var(--s)); color: var(--dac-ink-2); margin-top: calc(2px * var(--s)); }

  /* ------------------------------------------------------------ pagina's */
  .pagina { display: none; flex: 1 1 auto; min-height: 0; flex-direction: column; gap: calc(20px * var(--s)); }
  .pagina.actief { display: flex; }

  .eyebrow { font-size: calc(12px * var(--s)); font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--dac-ink-3); }
  .titel { font-size: calc(36px * var(--s)); font-weight: 600; letter-spacing: -0.01em; line-height: 1.15; }
  .onder { font-size: calc(18px * var(--s)); color: var(--dac-ink-2); }
  .kopregel { display: flex; flex-direction: column; gap: calc(4px * var(--s)); flex: 0 0 auto; }

  .vak {
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius); box-shadow: var(--dac-shadow);
    padding: calc(20px * var(--s)) calc(24px * var(--s));
    display: flex; flex-direction: column; gap: calc(14px * var(--s)); min-height: 0;
  }

  /* welkom */
  .welkom-raster { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(20px * var(--s)); flex: 1 1 auto; min-height: 0; }
  .kolom { display: flex; flex-direction: column; gap: calc(20px * var(--s)); min-height: 0; }
  .weer-nu { display: flex; align-items: center; gap: calc(18px * var(--s)); }
  .weer-chip {
    width: calc(68px * var(--s)); height: calc(68px * var(--s)); flex: 0 0 auto;
    border-radius: var(--dac-radius-sm); display: grid; place-items: center;
    color: var(--dac-solar); font-size: calc(38px * var(--s));
    background: color-mix(in srgb, var(--dac-solar) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--dac-solar) 32%, transparent);
  }
  .weer-chip.koud { --w: var(--dac-grid-in); color: var(--w); background: color-mix(in srgb, var(--w) 14%, transparent); border-color: color-mix(in srgb, var(--w) 32%, transparent); }
  .temp { font-size: calc(42px * var(--s)); font-weight: 300; line-height: 1; font-variant-numeric: tabular-nums; }
  .weer-tekst { font-size: calc(16px * var(--s)); color: var(--dac-ink-2); margin-top: calc(4px * var(--s)); }
  .uren { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: calc(10px * var(--s)); }
  .uur { display: flex; flex-direction: column; align-items: center; gap: calc(5px * var(--s)); padding: calc(10px * var(--s)) 0; border-radius: var(--dac-radius-sm); background: var(--dac-surface); }
  .uur .u { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); }
  .uur .icon { font-size: calc(22px * var(--s)); color: var(--dac-ink-2); }
  .uur .t { font-size: calc(17px * var(--s)); font-variant-numeric: tabular-nums; }

  .mededeling {
    border-color: color-mix(in srgb, var(--tone) 40%, transparent);
    background: color-mix(in srgb, var(--tone) 10%, transparent);
    flex-direction: row; align-items: center; gap: calc(16px * var(--s)); flex: 0 0 auto;
  }
  .mededeling .chip { color: var(--tone); }
  .chip {
    width: calc(46px * var(--s)); height: calc(46px * var(--s)); flex: 0 0 auto; font-size: calc(24px * var(--s));
    border-radius: var(--dac-radius-sm); display: grid; place-items: center;
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 32%, transparent);
  }
  .mededeling .eyebrow { color: var(--tone); }
  .mededeling .tekst { font-size: calc(18px * var(--s)); line-height: 1.35; }

  .openingstijden { flex: 1 1 auto; }
  .ot { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(6px * var(--s)) calc(28px * var(--s)); font-size: calc(16px * var(--s)); }
  .ot div { display: flex; justify-content: space-between; gap: calc(12px * var(--s)); }
  .ot span:first-child { color: var(--dac-ink-2); }
  .ot .vandaag span:first-child { color: var(--tone); font-weight: 600; }
  .ot .vandaag span:last-child { font-weight: 600; }
  .ot .dicht span:last-child { color: var(--dac-ink-3); }
  .ot .num { font-variant-numeric: tabular-nums; }
  .welkomtekst { font-size: calc(36px * var(--s)); font-weight: 600; letter-spacing: -0.01em; line-height: 1.15; }
  .welkom-onder { font-size: calc(18px * var(--s)); color: var(--dac-ink-2); }

  /* aanwezig */
  .personen { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: calc(14px * var(--s)); align-content: start; overflow-y: auto; flex: 1 1 auto; min-height: 0; padding-bottom: calc(4px * var(--s)); }
  .groep { grid-column: 1 / -1; padding-top: calc(6px * var(--s)); }
  .persoon {
    display: flex; align-items: center; gap: calc(16px * var(--s));
    padding: calc(16px * var(--s)) calc(18px * var(--s)); cursor: pointer;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius); box-shadow: var(--dac-shadow); min-height: calc(88px * var(--s));
    text-align: left; font: inherit; color: inherit;
  }
  .persoon:active { background: var(--dac-surface-hi); }
  .avatar {
    width: calc(60px * var(--s)); height: calc(60px * var(--s)); flex: 0 0 auto; overflow: hidden;
    border-radius: var(--dac-radius-sm); display: grid; place-items: center;
    font-size: calc(20px * var(--s)); font-weight: 700;
    color: var(--dac-ink-3); background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .rond .avatar { border-radius: 50%; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .persoon.aan .avatar { color: var(--tone); background: color-mix(in srgb, var(--tone) 14%, transparent); border-color: color-mix(in srgb, var(--tone) 40%, transparent); }
  .persoon.aan .avatar img { opacity: 1; }
  .persoon:not(.aan) .avatar img { opacity: 0.45; filter: grayscale(1); }
  .p-tekst { min-width: 0; display: flex; flex-direction: column; gap: calc(2px * var(--s)); }
  .p-naam { font-size: calc(19px * var(--s)); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .p-functie { font-size: calc(14px * var(--s)); color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .p-status { font-size: calc(13px * var(--s)); font-weight: 600; color: var(--dac-ink-3); margin-top: calc(2px * var(--s)); }
  .persoon.aan .p-status { color: var(--tone); }

  /* De tegels zijn een <div role="button"> en geen <button>: Chrome maakt van
     een <button> geen echte flexcontainer (de inhoud wordt gecentreerd en
     krijgt geen hoogte), en dan schoof de samenvatting over de titel heen.
     Gemeten op 9 september 2026 met de NOS-feed. */
  .persoon, .bericht, .lamp { -webkit-appearance: none; appearance: none; }
  .persoon:focus-visible, .bericht:focus-visible, .lamp:focus-visible { outline: 2px solid var(--tone); outline-offset: 2px; }

  /* nieuws */
  .nieuws { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(14px * var(--s)); align-content: start; overflow-y: auto; flex: 1 1 auto; min-height: 0; }
  .bericht {
    display: flex; gap: calc(16px * var(--s)); padding: calc(16px * var(--s)) calc(18px * var(--s)); cursor: pointer;
    background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius);
    box-shadow: var(--dac-shadow); text-align: left; font: inherit; color: inherit; min-height: calc(96px * var(--s));
  }
  .bericht.eigen { border-color: color-mix(in srgb, var(--tone) 40%, transparent); }
  .bericht .foto { width: calc(96px * var(--s)); height: calc(72px * var(--s)); flex: 0 0 auto; border-radius: var(--dac-radius-sm); overflow: hidden; background: var(--dac-surface); }
  .bericht .foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .b-tekst { min-width: 0; display: flex; flex-direction: column; gap: calc(4px * var(--s)); }
  .b-bron { font-size: calc(12px * var(--s)); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dac-ink-3); }
  .bericht.eigen .b-bron { color: var(--tone); }
  .b-titel { font-size: calc(18px * var(--s)); font-weight: 600; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .b-samenvatting { font-size: calc(14px * var(--s)); color: var(--dac-ink-2); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .leeg { color: var(--dac-ink-3); font-size: calc(18px * var(--s)); padding: calc(24px * var(--s)); text-align: center; grid-column: 1 / -1; }

  /* verlichting en agenda */
  .lampen { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: calc(14px * var(--s)); align-content: start; overflow-y: auto; flex: 1 1 auto; min-height: 0; }
  .lamp {
    display: flex; align-items: center; gap: calc(16px * var(--s)); padding: calc(18px * var(--s)) calc(20px * var(--s)); cursor: pointer;
    background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius);
    box-shadow: var(--dac-shadow); text-align: left; font: inherit; color: inherit; min-height: calc(96px * var(--s));
  }
  .lamp:active { background: var(--dac-surface-hi); }
  .lamp .chip { --tone: var(--dac-ink-3); color: var(--dac-ink-3); width: calc(60px * var(--s)); height: calc(60px * var(--s)); font-size: calc(30px * var(--s)); background: var(--dac-surface); border-color: var(--dac-border); }
  .lamp.aan .chip { --tone: var(--lampkleur, var(--dac-lit)); color: var(--tone); background: color-mix(in srgb, var(--tone) 14%, transparent); border-color: color-mix(in srgb, var(--tone) 32%, transparent); }
  .lamp.dood { opacity: 0.5; }
  .l-naam { font-size: calc(19px * var(--s)); font-weight: 600; }
  .l-status { font-size: calc(14px * var(--s)); color: var(--dac-ink-2); margin-top: calc(3px * var(--s)); }

  .afspraken { display: flex; flex-direction: column; gap: calc(10px * var(--s)); overflow-y: auto; flex: 1 1 auto; min-height: 0; }
  .afspraak { display: flex; align-items: center; gap: calc(18px * var(--s)); padding: calc(14px * var(--s)) calc(20px * var(--s)); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); }
  .a-tijd { font-size: calc(20px * var(--s)); font-variant-numeric: tabular-nums; color: var(--tone); font-weight: 600; min-width: calc(120px * var(--s)); }
  .a-tekst { font-size: calc(19px * var(--s)); }
  .a-kalender { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); margin-left: auto; }

  /* ------------------------------------------------------------ tabs */
  .tabs { display: flex; justify-content: center; gap: calc(10px * var(--s)); flex: 0 0 auto; }
  .tabs:empty { display: none; }
  .tab {
    display: flex; align-items: center; gap: calc(10px * var(--s)); height: calc(50px * var(--s)); padding: 0 calc(22px * var(--s));
    border-radius: var(--dac-radius-pill); font: inherit; font-size: calc(16px * var(--s)); font-weight: 500; cursor: pointer;
    color: var(--dac-ink-2); background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .tab .icon { font-size: calc(21px * var(--s)); }
  .tab.actief { color: var(--dac-ink); font-weight: 600; background: color-mix(in srgb, var(--tone) 22%, transparent); border-color: color-mix(in srgb, var(--tone) 50%, transparent); }

  /* ------------------------------------------------------------ lagen */
  .laag { position: absolute; inset: 0; display: none; background: var(--dac-bg); color: var(--dac-ink); }
  .laag.open { display: flex; }
  .nacht { flex-direction: column; align-items: center; justify-content: center; gap: calc(12px * var(--s)); cursor: pointer; }
  .nacht .klok { font-size: calc(140px * var(--s)); opacity: 0.85; }
  .nacht .datum { font-size: calc(22px * var(--s)); }
  .nacht .gesloten { margin-top: calc(24px * var(--s)); display: flex; align-items: center; gap: calc(12px * var(--s)); font-size: calc(20px * var(--s)); color: var(--dac-ink-2); }
  .nacht .gesloten .icon { font-size: calc(24px * var(--s)); color: var(--dac-ink-3); }
  .nacht .logo { margin-bottom: calc(20px * var(--s)); width: calc(96px * var(--s)); height: calc(96px * var(--s)); }

  .detail { padding: calc(40px * var(--s)); flex-direction: column; gap: calc(18px * var(--s)); background: color-mix(in srgb, var(--dac-bg) 96%, transparent); }
  .detail .sluit { align-self: flex-end; display: flex; align-items: center; gap: calc(8px * var(--s)); font: inherit; font-size: calc(16px * var(--s)); color: var(--dac-ink-2); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill); height: calc(46px * var(--s)); padding: 0 calc(18px * var(--s)); cursor: pointer; }
  .detail .d-bron { font-size: calc(13px * var(--s)); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--tone); }
  .detail .d-titel { font-size: calc(34px * var(--s)); font-weight: 600; line-height: 1.15; }
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
    .persoon:hover, .lamp:hover, .bericht:hover, .tab:hover { background: var(--dac-surface-hi); }
  }
`;

export class InfoschermCard extends DacCard {
  static css = css;

  constructor() {
    super();
    this.stand_ = null;
    this.feeds_ = [];
    this.rechten_ = {};
    this.pagina_ = "welkom";
    this.forecast_ = [];
    this.afspraken_ = [];
    this.welkomTel_ = 0;
    this.mededelingTel_ = 0;
    this.nachtSluimer_ = 0;
    this.herkansing_ = new Herkansing(() => this.haal_());
    this.verbinding_ = new Verbindingswacht();
    this.fout_ = null;
  }

  validate(config) {
    const c = { ...STANDAARD, ...config };
    c.lights = Array.isArray(c.lights) ? c.lights : c.lights ? [c.lights] : [];
    c.calendars = Array.isArray(c.calendars) ? c.calendars : c.calendars ? [c.calendars] : [];
    c.terug_na = Math.max(0, Number(c.terug_na) || 0);
    c.carrousel = Math.max(0, Number(c.carrousel) || 0);
    c.schaal = Math.min(2, Math.max(0.5, Number(c.schaal) || 1));
    return c;
  }

  watched() {
    return [this.config.weather, ...this.config.lights].filter(Boolean);
  }

  getCardSize() {
    return 12;
  }

  /* ------------------------------------------------------------ template */

  template() {
    const c = this.config;
    return `
      <div class="scherm ${c.uiterlijk === "licht" ? "licht" : ""} ${c.foto_vorm === "rond" ? "rond" : ""}">
        <div class="kop">
          <div class="merk">
            <div class="logo"></div>
            <div class="praktijk"><div class="naam"></div><div class="adres"></div></div>
          </div>
          <div class="tijd"><div class="klok">--:--</div><div class="datum"></div></div>
        </div>

        <section class="pagina" data-p="welkom">
          <div class="kopregel"><div class="welkomtekst"></div><div class="welkom-onder"></div></div>
          <div class="welkom-raster">
            <div class="kolom">
              <div class="vak weer" ${c.show_weer && c.weather ? "" : "hidden"}>
                <div class="eyebrow weer-kop">Het weer</div>
                <div class="weer-nu">
                  <div class="weer-chip"></div>
                  <div><div class="temp">--°</div><div class="weer-tekst"></div></div>
                </div>
                <div class="uren" ${c.show_uurweer ? "" : "hidden"}></div>
              </div>
              <div class="vak agenda-kort" hidden>
                <div class="eyebrow">Vandaag</div>
                <div class="afspraken klein"></div>
              </div>
            </div>
            <div class="kolom">
              <div class="vak mededeling" hidden>
                <div class="chip">${ICOON.megaphone}</div>
                <div><div class="eyebrow">Mededeling</div><div class="tekst"></div></div>
              </div>
              <div class="vak openingstijden" hidden>
                <div class="eyebrow">Openingstijden</div>
                <div class="ot"></div>
                <div class="onder ot-nu"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="pagina" data-p="aanwezig">
          <div class="kopregel">
            <div class="eyebrow">Wie is er vandaag</div>
            <div class="titel a-titel">Aanwezig</div>
            <div class="onder">Tik op uw naam om u aan of af te melden.</div>
          </div>
          <div class="personen"></div>
        </section>

        <section class="pagina" data-p="nieuws">
          <div class="kopregel"><div class="eyebrow">Nieuws</div><div class="titel">Wat er speelt</div></div>
          <div class="nieuws"></div>
        </section>

        <section class="pagina" data-p="verlichting">
          <div class="kopregel">
            <div class="eyebrow">Verlichting</div>
            <div class="titel">Lampen</div>
            <div class="onder">Tik op een lamp om hem aan of uit te zetten.</div>
          </div>
          <div class="lampen"></div>
        </section>

        <section class="pagina" data-p="agenda">
          <div class="kopregel"><div class="eyebrow">Agenda</div><div class="titel">Vandaag</div></div>
          <div class="afspraken groot"></div>
        </section>

        <nav class="tabs"></nav>

        <div class="laag detail">
          <button class="sluit" type="button">${resolve("close")} Sluiten</button>
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

    this.on(this.$(".tabs"), "click", (e) => {
      const tab = e.target.closest(".tab");
      if (tab) this.gaNaar_(tab.dataset.p);
    });

    this.on(this.$(".personen"), "click", (e) => {
      const el = e.target.closest(".persoon");
      if (el) this.tikPersoon_(el.dataset.id);
    });

    this.on(this.$(".lampen"), "click", (e) => {
      const el = e.target.closest(".lamp");
      if (el) this.tikLamp_(el.dataset.id);
    });

    this.on(this.$(".nieuws"), "click", (e) => {
      const el = e.target.closest(".bericht");
      if (el) this.openBericht_(el.dataset.id);
    });
    this.on(this.$(".detail .sluit"), "click", () => this.sluitBericht_());

    this.on(this.$(".nacht"), "click", () => {
      // Even kijken mag: de nachtstand komt na de terugvaltijd vanzelf terug.
      this.nachtSluimer_ = Date.now() + Math.max(30, this.config.terug_na || 60) * 1000;
      this.paintNacht_();
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
      const s = Math.min(r.width / 1194, r.height ? r.height / 834 : 9) * this.config.schaal;
      scherm.style.setProperty("--s", Math.max(0.35, s).toFixed(3));
    };
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
      this.paintWelkom_();
    }, 20000);
    this.teardown_.push(() => clearInterval(wissel));

    // Terugvaltimer en carrousel.
    this.leeft_();
    this.teardown_.push(() => {
      clearTimeout(this.terugTimer_);
      clearInterval(this.carrouselTimer_);
    });
    if (this.config.carrousel > 0) {
      this.carrouselTimer_ = setInterval(() => this.volgendePagina_(), this.config.carrousel * 1000);
    }

    // Agenda om de tien minuten.
    if (this.config.calendars.length) {
      const agenda = setInterval(() => this.haalAgenda_(), 10 * 60000);
      this.teardown_.push(() => clearInterval(agenda));
    }

    this.teardown_.push(() => this.herkansing_.stop());

    this.haal_();
    this.luister_();
    this.abonneerWeer_();
    this.haalAgenda_();
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
      this.stand_ = r.stand;
      this.feeds_ = r.feeds ?? [];
      this.rechten_ = r;
      this.fout_ = null;
      this.herkansing_.herstel();
      this.paint();
    } catch (fout) {
      if (nogNietGereed(fout)) {
        this.herkansing_.plan();
        return;
      }
      this.fout_ = fout?.message ?? "Het infoscherm kon niet laden.";
      this.paint();
    }
  }

  /**
   * Een abonnement dat zichzelf opzegt als de kaart intussen is afgebroken.
   *
   * NIET op `this.isConnected` toetsen, zoals de weerkaart doet. Home
   * Assistant zet `hass` VOORDAT het element in de view hangt (valkuil 25),
   * dus `wire()` draait terwijl `isConnected` nog false is -- en dan zegt zo'n
   * toets het abonnement meteen weer op, terwijl de kaart even later gewoon
   * in beeld komt en nooit meer een wijziging ontvangt. Gemeten op
   * 9 september 2026: de tik op een naam werkte (dat is een eigen aanroep),
   * maar een wijziging uit het beheer kwam nooit op het scherm.
   */
  async abonnement_(start) {
    let dood = false;
    this.teardown_.push(() => { dood = true; });
    const opzeggen = await start();
    if (dood) opzeggen();
    else this.teardown_.push(() => { try { opzeggen(); } catch { /* verbinding al weg */ } });
  }

  async luister_() {
    if (!this.hass?.connection?.subscribeMessage) return;
    try {
      await this.abonnement_(() =>
        abonneer(this.hass, (bericht) => {
          if (bericht?.soort === "stand") this.stand_ = bericht.stand;
          else if (bericht?.soort === "feeds") this.feeds_ = bericht.feeds ?? [];
          else return;
          this.paint();
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

  async abonneerWeer_() {
    const c = this.config;
    if (!c.weather || !c.show_uurweer || !this.hass?.connection?.subscribeMessage) return;
    try {
      await this.abonnement_(() =>
        this.hass.connection.subscribeMessage(
          (bericht) => {
            this.forecast_ = bericht?.forecast ?? [];
            this.paintWeer_();
          },
          { type: "weather/subscribe_forecast", forecast_type: "hourly", entity_id: c.weather }
        )
      );
    } catch {
      this.forecast_ = [];
      this.paintWeer_();
    }
  }

  async haalAgenda_() {
    const c = this.config;
    if (!c.calendars.length || !this.hass?.connection) return;
    const nu = new Date();
    const start = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
    const eind = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + 1);
    try {
      const r = await this.hass.connection.sendMessagePromise({
        type: "call_service",
        domain: "calendar",
        service: "get_events",
        service_data: { entity_id: c.calendars, start_date_time: start.toISOString(), end_date_time: eind.toISOString() },
        return_response: true,
      });
      const antwoord = r?.response ?? {};
      const lijst = [];
      for (const [kalender, waarde] of Object.entries(antwoord)) {
        for (const ev of waarde?.events ?? []) {
          lijst.push({ kalender, ...ev });
        }
      }
      lijst.sort((a, b) => String(a.start).localeCompare(String(b.start)));
      this.afspraken_ = lijst;
    } catch {
      this.afspraken_ = [];
    }
    this.paintAgenda_();
  }

  /* ------------------------------------------------------------ gedrag */

  leeft_() {
    clearTimeout(this.terugTimer_);
    const t = this.config.terug_na;
    if (t > 0) {
      this.terugTimer_ = setTimeout(() => {
        this.sluitBericht_();
        this.gaNaar_("welkom");
      }, t * 1000);
    }
  }

  gaNaar_(pagina) {
    const beschikbaar = paginas(this.config, this.stand_);
    this.pagina_ = beschikbaar.includes(pagina) ? pagina : "welkom";
    this.paintPaginas_();
  }

  volgendePagina_() {
    const lijst = paginas(this.config, this.stand_);
    const i = lijst.indexOf(this.pagina_);
    this.gaNaar_(lijst[(i + 1) % lijst.length]);
  }

  async tikPersoon_(id) {
    const p = this.stand_?.personen?.find((x) => x.id === id);
    if (!p || !this.hass) return;
    const nieuw = !p.aanwezig;
    p.aanwezig = nieuw; // meteen tonen; de server bevestigt via het abonnement
    this.paintPersonen_();
    try {
      await zetAanwezig(this.hass, id, nieuw);
    } catch {
      p.aanwezig = !nieuw;
      this.paintPersonen_();
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
    if (!this.config.nieuws_afbeeldingen) return;
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

  /* ------------------------------------------------------------ paint */

  paint() {
    if (!this.$(".scherm")) return;
    this.paintAccent_();
    this.paintKop_();
    this.paintWelkom_();
    this.paintWeer_();
    this.paintPersonen_();
    this.paintNieuws_();
    this.paintLampen_();
    this.paintAgenda_();
    this.paintPaginas_();
    this.paintNacht_();
    this.paintMerkje_();
  }

  paintAccent_() {
    const kleur = this.config.accent || this.stand_?.praktijk?.accent;
    this.$(".scherm").style.setProperty("--tone", kleur || "var(--dac-accent-hi)");
  }

  paintKop_() {
    const p = this.stand_?.praktijk ?? {};
    this.text(".naam", p.naam || (this.fout_ ? "Infoscherm" : ""));
    this.text(".adres", p.adres || "");
    for (const logo of this.$$(".logo")) {
      if (logo.dataset.id === (p.logo ?? "")) continue;
      logo.dataset.id = p.logo ?? "";
      logo.classList.remove("beeld");
      logo.textContent = p.naam ? p.naam.slice(0, 1).toUpperCase() : "";
      if (p.logo) {
        bestandUrl(this.hass, p.logo).then((url) => {
          if (!url || logo.dataset.id !== p.logo) return;
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

  paintWelkom_() {
    const c = this.config;
    const p = this.stand_?.praktijk ?? {};
    const nu = new Date();
    const teksten = p.welkom?.length ? p.welkom : ["Welkom"];
    this.text(".welkomtekst", omDeBeurt(teksten, this.welkomTel_));

    const opening = openingVandaag(p, nu);
    let onder = "";
    if (heeftOpeningstijden(p)) {
      onder = opening.open ? `Vandaag geopend tot ${opening.tot}` : geslotenRegel(p, nu);
    }
    this.text(".welkom-onder", onder);

    const mededelingen = c.show_mededeling ? actieveMededelingen(this.stand_?.mededelingen, isoDatum(nu)) : [];
    const vak = this.$(".mededeling");
    vak.hidden = mededelingen.length === 0;
    if (mededelingen.length) this.text(".mededeling .tekst", omDeBeurt(mededelingen, this.mededelingTel_).tekst);

    const ot = this.$(".openingstijden");
    ot.hidden = !(c.show_openingstijden && heeftOpeningstijden(p));
    if (!ot.hidden) {
      const regels = openingsRegels(p, nu);
      // Twee kolommen, maandag t/m donderdag links en de rest rechts, leest
      // als een lijst; het raster vult van links naar rechts, dus herordenen.
      const volgorde = [0, 4, 1, 5, 2, 6, 3].map((i) => regels[i]);
      this.$(".ot").innerHTML = volgorde
        .map(
          (r) => `<div class="${r.vandaag ? "vandaag" : ""} ${r.tekst === "gesloten" ? "dicht" : ""}">
            <span>${escapeHtml(r.naam)}${r.reden ? ` · ${escapeHtml(r.reden)}` : ""}</span><span class="num">${escapeHtml(r.tekst)}</span></div>`
        )
        .join("");
      this.text(".ot-nu", opening.open ? `Nu geopend, tot ${opening.tot}` : opening.straks ? `Nu gesloten, om ${opening.straks} weer open` : "Vandaag gesloten");
    }
  }

  paintWeer_() {
    const c = this.config;
    const vak = this.$(".weer");
    if (!vak || vak.hidden) return;
    const st = stateOf(this.hass, c.weather);
    const a = attrsOf(this.hass, c.weather);
    const chip = this.$(".weer-chip");
    const wens = weatherIcon(st?.state);
    if (chip.dataset.icon !== wens) {
      chip.dataset.icon = wens;
      chip.innerHTML = resolve(wens, "cloud");
    }
    const temp = a.temperature;
    chip.classList.toggle("koud", typeof temp === "number" && temp < 5);
    this.text(".temp", typeof temp === "number" ? `${fmtNumber(this.hass, temp, 0)}°` : "--°");
    const delen = [];
    if (st) delen.push(localizeState(this.hass, st));
    if (typeof a.humidity === "number") delen.push(`${Math.round(a.humidity)}% vochtig`);
    if (typeof a.wind_speed === "number") delen.push(`wind ${fmtNumber(this.hass, a.wind_speed, 0)} ${a.wind_speed_unit ?? "km/h"}`);
    this.text(".weer-tekst", delen.join(" · "));
    this.text(".weer-kop", a.friendly_name ? `Het weer · ${a.friendly_name}` : "Het weer");

    const uren = this.$(".uren");
    if (uren.hidden) return;
    const nu = Date.now();
    const komende = this.forecast_.filter((f) => new Date(f.datetime).getTime() > nu - 30 * 60000).slice(0, 4);
    uren.innerHTML = komende
      .map((f) => {
        const t = new Date(f.datetime);
        return `<div class="uur"><span class="u">${klok(t)}</span>${resolve(weatherIcon(f.condition), "cloud")}<span class="t">${
          typeof f.temperature === "number" ? `${Math.round(f.temperature)}°` : "--"
        }</span></div>`;
      })
      .join("");
    uren.hidden = komende.length === 0;
  }

  paintPersonen_() {
    const c = this.config;
    const personen = this.stand_?.personen ?? [];
    const vak = this.$(".personen");
    const tegel = (p) => `
      <div class="persoon ${p.aanwezig ? "aan" : ""}" role="button" tabindex="0" data-id="${escapeHtml(p.id)}" data-foto="${escapeHtml(p.foto ?? "")}">
        <div class="avatar">${escapeHtml(p.initialen || "?")}</div>
        <div class="p-tekst">
          <div class="p-naam">${escapeHtml(p.naam)}</div>
          ${p.functie ? `<div class="p-functie">${escapeHtml(p.functie)}</div>` : ""}
          <div class="p-status">${p.aanwezig ? "Aanwezig" : "Afwezig"}</div>
        </div>
      </div>`;
    let html;
    if (c.groepeer_functie) {
      html = groepeerOpFunctie(personen)
        .map((g) => `${g.functie ? `<div class="eyebrow groep">${escapeHtml(g.functie)}</div>` : ""}${g.personen.map(tegel).join("")}`)
        .join("");
    } else {
      html = personen.map(tegel).join("");
    }
    if (vak.innerHTML !== html) {
      vak.innerHTML = html;
      for (const el of vak.querySelectorAll(".persoon[data-foto]:not([data-foto=''])")) {
        bestandUrl(this.hass, el.dataset.foto).then((url) => {
          if (url && el.isConnected) el.querySelector(".avatar").innerHTML = `<img alt="" src="${url}">`;
        });
      }
    }
    const aantal = personen.filter((p) => p.aanwezig).length;
    this.text(".a-titel", c.aanwezig_teller && personen.length ? `${aantal} van ${personen.length} aanwezig` : "Aanwezig");
  }

  paintNieuws_() {
    const lijst = this.nieuws_();
    const vak = this.$(".nieuws");
    const html = lijst.length
      ? lijst
          .map(
            (n) => `<div class="bericht ${n.eigen ? "eigen" : ""}" role="button" tabindex="0" data-id="${escapeHtml(n.id)}">
              <div class="foto" ${n.afbeelding && this.config.nieuws_afbeeldingen ? "" : "hidden"}></div>
              <div class="b-tekst">
                <div class="b-bron">${escapeHtml(n.eigen ? this.stand_?.praktijk?.naam || "Mededeling" : n.bron ?? "")}${
                  n.datum ? ` · ${escapeHtml(relatieveTijd(n.datum, new Date()))}` : ""
                }</div>
                <div class="b-titel">${escapeHtml(n.titel)}</div>
                ${n.tekst ? `<div class="b-samenvatting">${escapeHtml(n.tekst)}</div>` : ""}
              </div>
            </div>`
          )
          .join("")
      : `<div class="leeg">Er is op dit moment geen nieuws.</div>`;
    if (vak.innerHTML === html) return;
    vak.innerHTML = html;
    for (const el of vak.querySelectorAll(".bericht")) {
      const item = lijst.find((n) => n.id === el.dataset.id);
      const foto = el.querySelector(".foto");
      if (item && foto && !foto.hidden) this.plaatje_(foto, item);
    }
  }

  paintLampen_() {
    const vak = this.$(".lampen");
    const html = this.config.lights
      .map((id) => {
        const st = stateOf(this.hass, id);
        const a = st?.attributes ?? {};
        const aan = isOn(st);
        const dood = !st || st.state === "unavailable";
        const rgb = a.rgb_color;
        const kleur = aan && Array.isArray(rgb) && !(rgb[0] > 240 && rgb[1] > 240 && rgb[2] > 240) ? `rgb(${rgb.join(",")})` : "";
        const status = dood ? "Niet bereikbaar" : aan ? (typeof a.brightness === "number" ? `Aan · ${Math.round((a.brightness / 255) * 100)}%` : "Aan") : "Uit";
        return `<div class="lamp ${aan ? "aan" : ""} ${dood ? "dood" : ""}" role="button" tabindex="0" data-id="${escapeHtml(id)}" style="${kleur ? `--lampkleur:${kleur}` : ""}">
          <div class="chip">${resolve("bulb")}</div>
          <div><div class="l-naam">${escapeHtml(a.friendly_name ?? id)}</div><div class="l-status">${status}</div></div>
        </div>`;
      })
      .join("");
    if (vak.innerHTML !== html) vak.innerHTML = html;
  }

  paintAgenda_() {
    const kort = this.$(".agenda-kort");
    const lijst = this.afspraken_;
    const regel = (ev) => {
      const heleDag = !String(ev.start).includes("T");
      const tijd = heleDag ? "hele dag" : `${klok(new Date(ev.start))}${ev.end ? ` – ${klok(new Date(ev.end))}` : ""}`;
      const naam = attrsOf(this.hass, ev.kalender).friendly_name ?? ev.kalender;
      return `<div class="afspraak"><span class="a-tijd">${escapeHtml(tijd)}</span><span class="a-tekst">${escapeHtml(ev.summary ?? "")}</span>${
        this.config.calendars.length > 1 ? `<span class="a-kalender">${escapeHtml(naam)}</span>` : ""
      }</div>`;
    };
    const html = lijst.length ? lijst.map(regel).join("") : `<div class="leeg">Geen afspraken vandaag.</div>`;
    const groot = this.$(".afspraken.groot");
    if (groot.innerHTML !== html) groot.innerHTML = html;
    kort.hidden = !(this.config.calendars.length && this.config.show_agenda_welkom !== false && lijst.length);
    if (!kort.hidden) {
      const kortHtml = lijst.slice(0, 3).map(regel).join("");
      const doel = kort.querySelector(".afspraken");
      if (doel.innerHTML !== kortHtml) doel.innerHTML = kortHtml;
    }
  }

  paintPaginas_() {
    const lijst = paginas(this.config, this.stand_);
    if (!lijst.includes(this.pagina_)) this.pagina_ = "welkom";
    for (const sec of this.$$(".pagina")) sec.classList.toggle("actief", sec.dataset.p === this.pagina_);
    const tabs = this.$(".tabs");
    const html =
      lijst.length > 1
        ? lijst
            .map(
              (p) => `<button class="tab ${p === this.pagina_ ? "actief" : ""}" type="button" data-p="${p}">${icoon(PAGINA_ICOON[p])}<span>${PAGINA_NAAM[p]}</span></button>`
            )
            .join("")
        : "";
    if (tabs.innerHTML !== html) tabs.innerHTML = html;
  }

  paintNacht_() {
    const laag = this.$(".nacht");
    if (!laag) return;
    const p = this.stand_?.praktijk;
    const nu = new Date();
    let aan = false;
    if (this.config.nachtstand && p && heeftOpeningstijden(p) && !this.inDialoog_()) {
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

/* ------------------------------------------------------------ editor */

const LABELS = {
  weather: "Weerentiteit",
  lights: "Lampen",
  calendars: "Agenda's",
  verlichting: "Verlichtingspagina",
  show_aanwezig: "Pagina Aanwezig",
  show_nieuws: "Pagina Nieuws",
  show_agenda: "Pagina Agenda",
  show_weer: "Weer tonen",
  show_uurweer: "Uurvoorspelling tonen",
  show_openingstijden: "Openingstijden tonen",
  show_mededeling: "Mededeling tonen",
  show_agenda_welkom: "Afspraken ook op Welkom",
  terug_na: "Terug naar Welkom na (seconden)",
  carrousel: "Pagina's automatisch wisselen (seconden)",
  nachtstand: "Nachtstand buiten openingstijden",
  groepeer_functie: "Medewerkers per functie groeperen",
  aanwezig_teller: "Teller (x van y aanwezig)",
  uiterlijk: "Uiterlijk",
  foto_vorm: "Vorm van de foto's",
  nieuws_afbeeldingen: "Afbeeldingen bij het nieuws",
  accent: "Accentkleur (overschrijft het beheer)",
  schaal: "Schaal",
};

const HELPERS = {
  verlichting:
    "Bij 'Volgens het beheer' bepaalt de receptie in het beheer of de lampen op dit scherm staan. Kies 'Altijd' voor een tablet in een kantoor waar alleen medewerkers zitten.",
  terug_na: "0 = nooit. Zo laat een bezoeker die op Nieuws bleef staan niet de volgende bezoeker een nieuwsbericht zien.",
  carrousel: "0 = uit. Elke tik zet de klok opnieuw.",
  nachtstand: "Buiten de openingstijden uit het beheer dimt het scherm naar een klok met 'Gesloten · morgen open om 08:00'. Een tik haalt het scherm even terug.",
  calendars: "De afspraken van vandaag uit deze agenda's, op een eigen pagina.",
  accent: "Meestal leeg laten: de kleur komt uit het beheer, waar de receptie hem instelt.",
  schaal: "1 is de maat van een iPad van 11 inch. Groter voor een tv aan de muur, kleiner voor een tablet van 8 inch.",
};

export class InfoschermEditor extends DacEditor {
  defaults() {
    return { ...STANDAARD };
  }

  gedeeldeVelden() {
    return [];
  }

  schema() {
    return [
      { name: "weather", selector: sel.entity("weather") },
      { name: "lights", selector: { entity: { multiple: true, domain: ["light", "switch"] } } },
      {
        name: "verlichting",
        selector: sel.select([
          { value: "beheer", label: "Volgens het beheer" },
          { value: "altijd", label: "Altijd tonen" },
          { value: "nooit", label: "Nooit tonen" },
        ]),
      },
      { name: "calendars", selector: { entity: { multiple: true, domain: "calendar" } } },
      section("Pagina's en blokken", "mdi:view-dashboard-outline", [
        row({ name: "show_aanwezig", selector: sel.bool() }, { name: "show_nieuws", selector: sel.bool() }),
        row({ name: "show_agenda", selector: sel.bool() }, { name: "show_agenda_welkom", selector: sel.bool() }),
        row({ name: "show_weer", selector: sel.bool() }, { name: "show_uurweer", selector: sel.bool() }),
        row({ name: "show_openingstijden", selector: sel.bool() }, { name: "show_mededeling", selector: sel.bool() }),
        row({ name: "groepeer_functie", selector: sel.bool() }, { name: "aanwezig_teller", selector: sel.bool() }),
        { name: "nieuws_afbeeldingen", selector: sel.bool() },
      ]),
      section("Gedrag", "mdi:timer-outline", [
        { name: "terug_na", selector: sel.number(0, 3600) },
        { name: "carrousel", selector: sel.number(0, 3600) },
        { name: "nachtstand", selector: sel.bool() },
      ]),
      section("Uiterlijk", "mdi:palette-outline", [
        {
          name: "uiterlijk",
          selector: sel.select([
            { value: "donker", label: "Donker" },
            { value: "licht", label: "Licht" },
          ]),
        },
        {
          name: "foto_vorm",
          selector: sel.select([
            { value: "rond", label: "Rond" },
            { value: "vierkant", label: "Afgerond vierkant" },
          ]),
        },
        { name: "schaal", selector: sel.number(0.5, 2, 0.05) },
        { name: "accent", selector: sel.text() },
      ]),
    ];
  }

  label(item) {
    if (item.type === "expandable") return item.title ?? "";
    return LABELS[item.name] ?? super.label(item);
  }

  helper(item) {
    return HELPERS[item.name];
  }
}

registerCard(TAG, InfoschermCard, {
  name: "DomotiApp Infoscherm",
  description:
    "Beeldvullend scherm voor een wachtkamer: logo, klok, weer, wie er is, nieuws en verlichting. De inhoud komt uit DomotiApp Infoscherm Beheer.",
  preview: false,
});
registerEditor(`${TAG}-editor`, InfoschermEditor);
InfoschermCard.getConfigElement = () => document.createElement(`${TAG}-editor`);
InfoschermCard.getStubConfig = () => ({ terug_na: 60 });
