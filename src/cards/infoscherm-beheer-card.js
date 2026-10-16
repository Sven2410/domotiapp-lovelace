/**
 * DomotiApp Infoscherm Beheer -- wat de receptie op haar pc ziet.
 *
 * Alles wat op het wachtkamerscherm staat wordt hier onderhouden: de
 * medewerkers, de mededelingen, de verjaardagen, de openingstijden, de
 * INDELING van het scherm (slepen, groter en kleiner maken, blokken erbij en
 * eraf), de namen van de lampen, en de instellingen met het logo. Niets
 * hiervan staat in een kaartconfig: de receptie is een gewone gebruiker, en
 * die kan geen dashboard opslaan. Het gaat allemaal naar de serverkant
 * (`infoscherm/`), en elk open scherm krijgt het meteen.
 *
 * DE KAARTEDITOR VAN DEZE KAART IS DE INSTALLATIE
 *
 * De ENTITEITEN (weer, energie, lampen, agenda's) en de kioskaccounts kiest
 * de installateur in de kaarteditor van DEZE kaart, en de kaart stuurt die
 * config naar de opslag zodra een beheerder hem ziet (`sync_`). Het
 * infoscherm zelf heeft geen config: "één keer de kaart toevoegen en klaar"
 * (10 september 2026). Tot 0.37.0 zat hier een blok Installatie voor, in
 * 0.38.0 en 0.39.0 stond het in de editor van het infoscherm; allebei was
 * niet wat hij bedoelde. Een beheerkaart ZONDER die velden in zijn config
 * (een tweede beheerkaart voor de receptie, bijvoorbeeld) laat de opslag met
 * rust.
 *
 * GEEN ha-form
 *
 * De editors van deze familie zijn op `ha-form` gebouwd, en dat is goed voor
 * een INSTALLATEUR die een kaart instelt. Dit is geen editor maar een kaart
 * die een receptioniste de hele dag openheeft. Gewone invoervelden, in de
 * vormtaal van de familie. Zo ziet ze nooit een YAML, nooit een entiteit, en
 * nooit een dialoog van Home Assistant.
 *
 * ALLES WORDT VANZELF OPGESLAGEN
 *
 * Tot 0.36.0 had elk blok een eigen knop Opslaan, en dat ging mis: wie in
 * Medewerkers typte, naar Praktijk ging en dáár op Opslaan drukte, dacht dat
 * alles was opgeslagen -- maar Medewerkers stond nog open. Gemeld op
 * 10 september 2026: *"ook heb ik bugs met het opslaan, niet alles wordt
 * opgeslagen."* Sinds ronde 2 gaat elke wijziging na een korte adempauze
 * (700 ms na de laatste toetsaanslag, meteen bij een schakelaar of een sleep)
 * naar de server, per onderdeel. Bovenin staat wat er gebeurt: "Opslaan…",
 * "Opgeslagen 10:42", of de fout. En omdat de server elke wijziging aan elk
 * open scherm doorgeeft, staat het binnen een seconde op de iPad.
 *
 * WAT ER NIET OPNIEUW GETEKEND WORDT
 *
 * Typen tekent NIETS opnieuw: het veld schrijft rechtstreeks in de werkkopie.
 * Anders verliest het veld zijn focus bij elke letter -- precies de fout die
 * de entiteiten-editor twee uitgaven heeft gekost (valkuil 23). Een stand
 * van de server tekent alleen de blokken opnieuw waarvan de inhoud echt
 * anders is, en NOOIT een blok waar op dat moment de focus in staat: dat
 * wacht tot de focus het blok verlaat. Een onderdeel dat nog niet is
 * opgeslagen wordt nooit door de server overschreven. Alleen de aanwezigheid
 * wordt tussendoor bijgewerkt, in het schakelaartje zelf, want die komt van
 * de iPad en die wil je zien.
 *
 * RUIMTES (16 OKTOBER 2026)
 *
 * Het blok Ruimtes leest de boekingen live uit de agenda's van de ruimtes
 * (`calendar/event/subscribe`, twee weken vooruit) en schrijft via de server
 * (`ruimtes/boek`, `ruimtes/vrijgeven`), die dubbel boeken weigert. De code
 * voor het scherm is een eigen onderdeel (`code`), want hij staat niet in de
 * stand: die gaat ook naar de iPad. Het formulier voor een nieuwe boeking
 * wordt NIET opgeslagen (`data-s="boeken"`); pas de knop Boeken stuurt het.
 *
 * Sinds 0.76.0 maakt het beheer ook zelf een ruimte (veld Nieuwe ruimte): *"De
 * receptioniste moet dat zelf kunnen maken."* De server maakt dan een Lokale
 * agenda (zie de kop van ruimtes.py). Zo'n ruimte (`gemaakt`) kan hier ook weer
 * weg; een ruimte die de installateur in de kaartconfig koos niet.
 *
 * ALLES BEGINT DICHT
 *
 * Tot 0.72.0 stond er een instelling "Staat open bij het laden", met
 * Medewerkers als standaard. De eigenaar op 16 oktober 2026: *"Elke keer als
 * ik beheer open van het infoscherm staat medewerkers opengeklapt alles moet
 * gewoon dichtgeklapt blijven tot ik zelf iets open klap."* De instelling is
 * weg; een `open:` die nog in een config staat doet niets meer. Wat er open
 * is bepaalt alleen een klik, en dat blijft open zolang de kaart er staat.
 */

import { DacCard, escapeHtml, registerCard, registerEditor } from "../base.js";
import { DacEditor, sel } from "../editor/base.js";
import { resolve } from "../icons.js";
import { Herkansing, Verbindingswacht } from "../herkansing.js";
import { volgRaster } from "../rasterhoogte.js";
import { vraagBevestiging } from "../vraag.js";
import {
  Abonnement,
  AgendaAbonnement,
  bestandUrl,
  bewaar,
  boekRuimte,
  geefRuimteVrij,
  haalGebruikers,
  haalStand,
  nieuweRuimte,
  nogNietGereed,
  ruimteWeg,
  syncInstallatie,
  upload,
  vergeetBestand,
  verwijderBestand,
  ververFeeds,
  zetRuimteCode,
} from "../infoscherm-client.js";
import {
  BLOK_INFO,
  BLOK_SOORTEN,
  DAGEN,
  DAGNAMEN,
  KOLOMMEN,
  RIJEN,
  blokOntbreekt,
  initialen,
  isoDatum,
  isoDatumTijd,
  overlapt,
  pastVrij,
  standaardIndeling,
  vrijePlek,
} from "./infoscherm-logica.js";
import { logoOndergrond, logoWaarschuwing } from "./infoscherm-logo.js";
import { DAGEN_VOORUIT, afsprakenUit, controleerFormulier, dagBegin, perDag, plusDagen, tijdTekst } from "./ruimtes-logica.js";
import { netwerkNaam, qrAdres } from "./wifi-logica.js";
import { analyseerLogo, snijLogoBij } from "./infoscherm-logo-beeld.js";

const TAG = "domotiapp-infoscherm-beheer-card";

/* Wat er in de opslag staat, per onderdeel; elk onderdeel heeft zijn eigen save. */
const SECTIES = ["personen", "mededelingen", "verjaardagen", "praktijk", "scherm", "installatie", "indeling", "instellingen"];

const teken = (body) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ` +
  `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
const ICOON = {
  layout: teken(`<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="2"/><path d="M3.4 9.6h17.2M9.6 9.6v11"/>`),
  cake: teken(
    `<path d="M4.4 19.4h15.2v-6.2a2 2 0 0 0-2-2H6.4a2 2 0 0 0-2 2z"/><path d="M4.4 15.6c1.3 0 1.3 1.2 2.5 1.2s1.3-1.2 2.5-1.2 1.3 1.2 2.6 1.2 1.3-1.2 2.5-1.2 1.3 1.2 2.5 1.2 1.3-1.2 2.6-1.2"/><path d="M12 11.2V8.4M9 11.2V8.8M15 11.2V8.8"/><path d="M12 8.4a1.3 1.3 0 0 0 1-2.2L12 4.6l-1 1.6a1.3 1.3 0 0 0 1 2.2z"/>`
  ),
  grip: teken(`<circle cx="9" cy="6" r="1.2" fill="currentColor"/><circle cx="15" cy="6" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="18" r="1.2" fill="currentColor"/><circle cx="15" cy="18" r="1.2" fill="currentColor"/>`),
};
const icoon = (naam) => ICOON[naam] ?? resolve(naam);

const BLOKKEN = [
  { key: "personen", titel: "Medewerkers", icoon: "people", secties: ["personen"] },
  { key: "mededelingen", titel: "Mededelingen", icoon: "bell", secties: ["mededelingen", "scherm"] },
  { key: "verjaardagen", titel: "Verjaardagen", icoon: "cake", secties: ["verjaardagen"] },
  { key: "praktijk", titel: "Openingstijden", icoon: "clock", secties: ["praktijk"] },
  { key: "indeling", titel: "Indeling van het scherm", icoon: "layout", secties: ["indeling"] },
  { key: "verlichting", titel: "Verlichting", icoon: "bulb", secties: ["installatie", "instellingen"] },
  // 13 oktober 2026: de airco's, net als de lampen.
  { key: "klimaat", titel: "Klimaat", icoon: "airco", secties: ["installatie", "instellingen"] },
  // 16 oktober 2026: de ruimtes, met de code om op het scherm te boeken.
  { key: "ruimtes", titel: "Ruimtes", icoon: "door", secties: ["installatie", "code"] },
  // 16 oktober 2026: de wifi voor gasten. De QR-code kiest de installateur;
  // naam en wachtwoord op het scherm staan in `scherm`.
  { key: "wifi", titel: "Wifi voor gasten", icoon: "wifi", secties: ["scherm"] },
  { key: "instellingen", titel: "Instellingen en logo", icoon: "cog", secties: ["scherm", "instellingen"] },
];

/* De installatie in de kaartconfig; leeg tot de installateur iets kiest. */
const INSTALLATIE_VELDEN = ["weather", "energy", "lights", "climates", "rooms", "wifi", "calendars", "waste", "kiosk_users"];
const lijstVan = (x) => (Array.isArray(x) ? x.filter((v) => typeof v === "string" && v) : typeof x === "string" && x ? [x] : []);

const STANDAARD = {
  title: "Infoscherm",
  weather: "",
  energy: "",
  lights: [],
  climates: [],
  rooms: [],
  wifi: "",
  calendars: [],
  waste: [],
  kiosk_users: [],
  show_personen: true,
  show_mededelingen: true,
  show_verjaardagen: true,
  show_praktijk: true,
  show_indeling: true,
  show_verlichting: true,
  show_klimaat: true,
  show_ruimtes: true,
  show_wifi: true,
  show_instellingen: true,
};

const css = /* css */ `
  /* Een containerquery en geen mediaquery: de kaart staat in een kolom van
     een sections-view, en die is smal terwijl het venster breed is. */
  :host { container-type: inline-size; }
  .card { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 14px; }
  .icon { width: 1em; height: 1em; display: block; }
  [hidden] { display: none !important; }

  .kop { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .kop h2 { margin: 0; font-size: 17px; font-weight: 600; }
  .kop .eyebrow { margin-bottom: 2px; }
  .status { font-size: 12px; color: var(--dac-ink-3); display: flex; align-items: center; gap: 6px; text-align: right; }
  .status.bezig { color: var(--dac-ink-2); }
  .status.fout { color: var(--dac-bad); }
  .status.ok { color: var(--dac-good); }

  /* Een blok: kop met pijl, inhoud eronder. Eén tegelijk open houdt het overzicht. */
  .blok { border: 1px solid var(--dac-border); border-radius: var(--dac-radius-sm); overflow: hidden; }
  .blok > .bk {
    display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; cursor: pointer;
    background: var(--dac-surface); border: none; font: inherit; color: inherit; text-align: left;
  }
  .blok > .bk .icon { font-size: 18px; color: var(--dac-ink-3); transition: transform 160ms; }
  .blok.open > .bk .icon.pijl { transform: rotate(180deg); }
  .blok > .bk b { font-size: 14px; font-weight: 600; flex: 1 1 auto; }
  .blok > .bk .tel { font-size: 12px; color: var(--dac-ink-3); }
  .blok > .bk .bfout { font-size: 11px; font-weight: 600; color: var(--dac-bad); }
  .blok > .inhoud { display: none; padding: 14px; flex-direction: column; gap: 12px; }
  .blok.open > .inhoud { display: flex; }

  /* velden */
  .rij { display: grid; gap: 10px; align-items: center; }
  .veld { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .veld label { font-size: 12px; color: var(--dac-ink-2); }
  input[type="text"], input[type="url"], input[type="date"], input[type="datetime-local"], input[type="time"], input[type="number"], input[type="color"], textarea, select {
    font: inherit; font-size: 14px; color: var(--dac-ink); background: var(--dac-surface);
    border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-sm); padding: 8px 10px;
    min-height: 40px; width: 100%; min-width: 0; color-scheme: var(--dac-scheme);
  }
  input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  textarea { min-height: 72px; resize: vertical; line-height: 1.4; }
  /* De keuzelijst van de browser tekent zijn eigen menu, en dat menu nam de
     doorschijnende achtergrond van het veld over: op een lichte pagina werd
     het licht, en de opties stonden er grijs in. Gemeld op 10 september
     2026: "bij de beheerderskaart zie ik nog steeds een licht theme." Een
     dichte achtergrond en de inkt van de kaart, ook op elke optie. */
  select { background-color: var(--dac-bg-raise); }
  select option { background-color: var(--dac-bg-raise); color: var(--dac-ink); }
  /* Een keuze uit twee of drie: geen keuzelijst maar knoppen naast elkaar,
     in de vormtaal van de kaart. Dan is er ook geen browsermenu meer dat
     zijn eigen kleuren kiest. */
  .segment { display: flex; flex-wrap: wrap; gap: 4px; padding: 3px; border-radius: var(--dac-radius-sm); background: var(--dac-surface); border: 1px solid var(--dac-border-hi); min-height: 40px; box-sizing: border-box; }
  .segment button {
    flex: 1 1 auto; min-width: 0; padding: 6px 10px; border-radius: 9px; border: 1px solid transparent; cursor: pointer;
    font: inherit; font-size: 13px; font-weight: 600; color: var(--dac-ink-2); background: none; white-space: nowrap;
  }
  .segment button.aan { color: var(--dac-accent-hi); background: var(--dac-accent-soft); border-color: color-mix(in srgb, var(--dac-accent-hi) 40%, transparent); }
  .segment button:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  input[type="color"] { padding: 2px 4px; width: 56px; }
  input[type="number"] { max-width: 120px; }
  input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--dac-accent-hi); margin: 0; }
  .vink { display: flex; align-items: center; gap: 8px; font-size: 13px; min-height: 40px; cursor: pointer; }
  .vink .id { font-size: 11px; color: var(--dac-ink-3); margin-left: 4px; }

  /* de schakelaar voor aan/uit-dingen */
  .schakel { position: relative; width: 44px; height: 24px; flex: 0 0 auto; }
  .schakel input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer; }
  .schakel span { position: absolute; inset: 0; border-radius: 999px; background: var(--dac-border-hi); transition: background 120ms; }
  .schakel span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: var(--dac-knob); box-shadow: var(--dac-knob-schaduw); transition: transform 120ms; }
  .schakel input:checked + span { background: var(--dac-accent-hi); }
  .schakel input:checked + span::after { transform: translateX(20px); }

  .knop {
    display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; cursor: pointer;
    font: inherit; font-size: 13px; font-weight: 600; color: var(--dac-ink-2);
    background: var(--dac-surface); border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-pill);
  }
  .knop .icon { font-size: 16px; }
  .knop.klein { height: 32px; padding: 0 10px; font-size: 12px; }
  .knop.ico { width: 32px; height: 32px; padding: 0; justify-content: center; border-radius: var(--dac-radius-sm); }
  .knop.gevaar { color: var(--dac-bad); }
  .knop:disabled { opacity: 0.5; cursor: default; }
  .voet { display: flex; justify-content: flex-start; align-items: center; gap: 10px; flex-wrap: wrap; }
  .melding { font-size: 12px; color: var(--dac-ink-3); }
  .melding.fout { color: var(--dac-bad); }
  .melding.goed { color: var(--dac-good); }

  /* lijsten */
  .lijst { display: flex; flex-direction: column; gap: 8px; }
  .item { display: grid; gap: 10px; align-items: center; padding: 10px 12px; border-radius: var(--dac-radius-sm); background: var(--dac-surface); }
  .item.persoon { grid-template-columns: 28px 44px minmax(0, 1.4fr) minmax(0, 1fr) auto auto; }
  .item.mededeling { grid-template-columns: minmax(0, 2fr) 190px 190px auto; align-items: start; }
  .item.mededeling textarea { min-height: 40px; }
  .item.verjaardag { grid-template-columns: minmax(0, 2fr) 170px auto auto; }
  .item.feed { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto; }
  .item.uitz { grid-template-columns: 150px auto 110px 110px minmax(0, 1fr) auto; }
  .item.lamp, .item.airco, .item.ruimte { grid-template-columns: 28px minmax(0, 1fr) minmax(0, 1fr); }
  .item.lamp .ent, .item.airco .ent, .item.ruimte .ent { font-size: 13px; color: var(--dac-ink-2); display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .item.lamp .ent b, .item.airco .ent b, .item.ruimte .ent b { color: var(--dac-ink); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item.lamp .ent span, .item.airco .ent span, .item.ruimte .ent span { font-size: 11px; color: var(--dac-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item.ruimte { grid-template-columns: 28px minmax(0, 1fr) minmax(0, 1fr) auto; }
  .item.ruimte .van { font-size: 11px; color: var(--dac-ink-3); }
  .rij.toevoegen { grid-template-columns: minmax(0, 1fr) auto; align-items: end; }
  .item.boeking { grid-template-columns: 110px minmax(0, 1fr) minmax(0, 1.4fr) auto; padding: 6px 8px 6px 12px; font-size: 13px; }
  .r-tijd { font-variant-numeric: tabular-nums; font-weight: 600; }
  .r-ruimte { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .r-titel { color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .r-dag { font-size: 12px; font-weight: 600; color: var(--dac-ink-3); margin-top: 4px; }
  .knoppen { display: flex; gap: 6px; align-items: center; justify-content: flex-end; }
  /* De greep om een rij te verslepen: echte pointer-events, geen pijltjes.
     Gevraagd op 10 september 2026: "drag en drop ipv pijltjes". */
  .greep { width: 28px; height: 44px; display: grid; place-items: center; color: var(--dac-ink-3); cursor: grab; touch-action: none; border-radius: 6px; }
  .greep .icon { font-size: 20px; }
  .item.sleept { opacity: 0.9; border: 1px solid var(--dac-accent-hi); box-shadow: 0 8px 24px rgba(0,0,0,calc(.35 * var(--dac-diepte))); cursor: grabbing; position: relative; z-index: 2; }
  .item.sleept .greep { cursor: grabbing; }
  .avatar { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; font-size: 14px; font-weight: 700; color: var(--dac-ink-3); background: var(--dac-surface-hi); border: 1px solid var(--dac-border); cursor: pointer; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .avatar.aan { color: var(--dac-accent-hi); background: var(--dac-accent-soft); border-color: color-mix(in srgb, var(--dac-accent-hi) 40%, transparent); }
  .leeg { font-size: 13px; color: var(--dac-ink-3); padding: 6px 2px; }

  .b-onder { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .plaatje { width: 96px; height: 64px; border-radius: var(--dac-radius-sm); overflow: hidden; background: var(--dac-surface-hi); display: grid; place-items: center; color: var(--dac-ink-3); font-size: 20px; }
  .plaatje img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .plaatje.wifi { width: 96px; height: 96px; }
  .plaatje.wifi img { object-fit: contain; image-rendering: pixelated; }
  /* Het logo volgt zijn eigen verhouding, net als op het scherm. Flex en geen
     grid, om dezelfde reden als daar (.logo in de infoschermkaart): in een
     grid werd een liggend logo zo hoog als de volle breedte en viel de
     onderkant weg. */
  .plaatje.logo { width: auto; min-width: 64px; max-width: 220px; height: 64px; padding: 4px; display: flex; align-items: center; justify-content: center; }
  .plaatje.logo img { width: auto; height: 100%; max-width: 100%; min-width: 0; object-fit: contain; }
  /* Het voorbeeld staat op de ondergrond van het SCHERM (het vlak van het
     welkomblok), niet op die van Home Assistant: een zwart logo op een
     doorzichtige achtergrond zag er hier prima uit en viel op de iPad weg
     (12 oktober 2026). Vaste kleuren, met opzet: het is een stukje van het
     scherm, en dat volgt het thema niet. */
  .plaatje.logo.op-donker { background: rgb(${logoOndergrond("donker")}); }
  .plaatje.logo.op-licht { background: rgb(${logoOndergrond("licht")}); }
  .hulp.logo-waarschuwing { color: var(--dac-warn); }

  .ot-tabel { display: grid; grid-template-columns: 90px auto 100px 100px 100px 100px; gap: 6px 10px; align-items: center; font-size: 13px; }
  .ot-tabel .k { font-size: 11px; color: var(--dac-ink-3); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .ot-tabel input[type="time"] { min-height: 34px; padding: 4px 6px; font-size: 13px; }
  .ot-tabel .dag { color: var(--dac-ink-2); }
  .ot-tabel input:disabled { opacity: 0.35; }

  .twee { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .drie { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .hulp { font-size: 12px; color: var(--dac-ink-3); line-height: 1.4; }
  .hulp.stappen { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
  .hulp b { color: var(--dac-ink-2); }
  .feedfout { font-size: 12px; color: var(--dac-bad); }
  .sub { font-size: 13px; font-weight: 600; margin-top: 4px; }

  /* ------------------------------------------------------------ de indeling */
  .raster {
    position: relative; width: 100%; aspect-ratio: 1194 / 660; border-radius: var(--dac-radius-sm);
    background-color: var(--dac-surface);
    background-image:
      linear-gradient(to right, var(--dac-border) 1px, transparent 1px),
      linear-gradient(to bottom, var(--dac-border) 1px, transparent 1px);
    background-size: calc(100% / ${KOLOMMEN}) calc(100% / ${RIJEN});
    border: 1px solid var(--dac-border-hi); overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none;
  }
  .ib { position: absolute; padding: 3px; box-sizing: border-box; cursor: grab; touch-action: none; }
  .ib.sleept { cursor: grabbing; z-index: 2; }
  .ib-in {
    position: relative; width: 100%; height: 100%; box-sizing: border-box; overflow: hidden;
    border-radius: 8px; background: var(--dac-accent-soft); border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 50%, transparent);
    display: flex; flex-direction: column; gap: 2px; padding: 6px 8px; font-size: 12px;
  }
  .ib.sleept .ib-in { box-shadow: 0 8px 24px rgba(0,0,0,calc(.35 * var(--dac-diepte))); }
  .ib.ongeldig .ib-in { background: color-mix(in srgb, var(--dac-bad) 18%, transparent); border-color: var(--dac-bad); }
  .ib.ontbreekt .ib-in { border-style: dashed; background: var(--dac-surface-hi); }
  .ib-kop { display: flex; align-items: center; gap: 6px; font-weight: 600; min-width: 0; }
  .ib-kop .icon { font-size: 14px; color: var(--dac-accent-hi); flex: 0 0 auto; }
  .ib.ontbreekt .ib-kop .icon { color: var(--dac-ink-3); }
  .ib-kop span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ib-nb { font-size: 11px; color: var(--dac-ink-3); line-height: 1.3; }
  .ib-weg { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border-radius: 6px; border: none; background: var(--dac-surface-hi); color: var(--dac-ink-2); cursor: pointer; display: grid; place-items: center; font: inherit; }
  .ib-weg .icon { font-size: 14px; }
  .ib-aantal { margin-top: auto; display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--dac-ink-2); }
  .ib-aantal button { width: 22px; height: 22px; border-radius: 6px; border: 1px solid var(--dac-border-hi); background: var(--dac-surface); color: var(--dac-ink); cursor: pointer; font: inherit; font-size: 14px; line-height: 1; display: grid; place-items: center; }
  .ib-aantal b { min-width: 28px; text-align: center; }
  .ib-greep { position: absolute; right: 2px; bottom: 2px; width: 16px; height: 16px; cursor: nwse-resize; border-right: 3px solid var(--dac-accent-hi); border-bottom: 3px solid var(--dac-accent-hi); border-radius: 0 0 4px 0; opacity: .8; }
  .ib.ontbreekt .ib-greep { border-color: var(--dac-ink-3); }

  .geen { padding: 24px; text-align: center; color: var(--dac-ink-3); font-size: 14px; }
  .file { display: none; }

  @container (max-width: 720px) {
    .item.persoon { grid-template-columns: 28px 44px minmax(0, 1fr) auto; }
    .item.persoon .veld:nth-child(4) { grid-column: 3 / -1; }
    .item.mededeling, .item.verjaardag, .item.uitz { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .item.feed { grid-template-columns: minmax(0, 1fr); }
    .ot-tabel { grid-template-columns: 70px auto 1fr 1fr; }
    .ot-tabel .vak2 { display: none; }
    .twee, .drie { grid-template-columns: minmax(0, 1fr); }
    .ib-aantal, .ib-nb { display: none; }
  }
`;

const kloon = (x) => JSON.parse(JSON.stringify(x ?? null));
const at = (s) => escapeHtml(s ?? "");
const klem = (n, a, b) => Math.min(b, Math.max(a, n));

/* Hoe lang er na de laatste toetsaanslag gewacht wordt voordat het weggaat. */
const ADEMPAUZE_TEKST = 700;
const ADEMPAUZE_KNOP = 150;

export class InfoschermBeheerCard extends DacCard {
  static css = css;

  constructor() {
    super();
    this.stand_ = null;
    this.rechten_ = {};
    this.feedFouten_ = {};
    this.werk_ = {};
    this.vuil_ = new Set();
    this.bezig_ = new Set();
    this.versie_ = {};
    this.timers_ = {};
    this.fouten_ = {};
    this.uitgesteld_ = new Set();
    this.open_ = null;
    this.meldingen_ = {};
    /* De boekingen per ruimte, live uit de agenda (zie abonneerRuimtes_),
       en wat er in het formulier voor een nieuwe staat. */
    this.ruimteAbos_ = new Map();
    this.ruimteAfspraken_ = new Map();
    this.ruimteDag_ = "";
    this.boekForm_ = {};
    this.nieuweRuimte_ = "";
    this.ruimteMelding_ = null;
    this.logoAnalyses_ = new Map();
    this.herkansing_ = new Herkansing(() => this.haal_());
    this.verbinding_ = new Verbindingswacht();
    // Stand en feeds van de server; overleeft een herstart (zie Abonnement).
    this.abo_ = new Abonnement((bericht) => {
      if (bericht?.soort === "stand") this.nieuweStand_(bericht.stand);
      if (bericht?.soort === "feeds") {
        this.feedFouten_ = bericht.feed_fouten ?? {};
        this.teken_("instellingen");
      }
    });
    this.fout_ = null;
    this.laatstOpgeslagen_ = "";
  }

  validate(config) {
    // Staat er in de RUWE config iets van de installatie? Alleen dan is deze
    // kaart de bron ervan (zie sync_). Mag nooit gooien.
    this.installatieInConfig_ = INSTALLATIE_VELDEN.some((k) => config[k] !== undefined);
    return {
      ...STANDAARD,
      ...config,
      weather: typeof config.weather === "string" ? config.weather : "",
      energy: typeof config.energy === "string" ? config.energy : "",
      lights: lijstVan(config.lights),
      climates: lijstVan(config.climates),
      rooms: lijstVan(config.rooms),
      wifi: typeof config.wifi === "string" ? config.wifi : "",
      calendars: lijstVan(config.calendars),
      waste: lijstVan(config.waste),
      kiosk_users: lijstVan(config.kiosk_users),
    };
  }

  watched() {
    return [];
  }

  /**
   * De installatie uit de kaartconfig naar de opslag: zo weet het scherm
   * welke entiteiten er zijn en de server welke accounts kiosk zijn. Alleen
   * een beheerder mag dat, alleen als deze kaart de velden in zijn config
   * heeft, en alleen als er iets afwijkt; dezelfde payload gaat niet twee
   * keer.
   */
  async sync_() {
    if (!this.hass?.connection || !this.stand_ || !this.hass.user?.is_admin || !this.installatieInConfig_) return;
    const c = this.config;
    const wens = {
      weer: c.weather || null,
      energie: c.energy || null,
      agendas: c.calendars,
      afval: c.waste,
      verlichting: c.lights,
      klimaat: c.climates,
      ruimtes: c.rooms,
      wifi: c.wifi || null,
      kiosk_gebruikers: c.kiosk_users,
    };
    // De lampen als VERZAMELING: hun volgorde is van de receptie (sinds
    // 0.62.0 versleepbaar), en een andere volgorde in de kaartconfig is dus
    // geen verschil. De server houdt die volgorde ook aan.
    const sleutel = JSON.stringify({
      ...wens,
      verlichting: [...(c.lights ?? [])].sort(),
      klimaat: [...(c.climates ?? [])].sort(),
      ruimtes: [...(c.rooms ?? [])].sort(),
    });
    const i = this.stand_.installatie ?? {};
    const nu = JSON.stringify({
      weer: i.weer ?? null,
      energie: i.energie ?? null,
      agendas: i.agendas ?? [],
      afval: i.afval ?? [],
      verlichting: (i.verlichting ?? []).map((l) => l.entity).sort(),
      klimaat: (i.klimaat ?? []).map((a) => a.entity).sort(),
      // Een ruimte die het beheer maakte staat niet in de kaartconfig, en hoort
      // dus niet als verschil te tellen.
      ruimtes: (i.ruimtes ?? []).filter((r) => !r.gemaakt).map((r) => r.entity).sort(),
      wifi: i.wifi ?? null,
      kiosk_gebruikers: this.stand_.instellingen?.kiosk_gebruikers ?? [],
    });
    if (sleutel === nu || sleutel === this.laatstGesynct_) return;
    this.laatstGesynct_ = sleutel;
    try {
      await syncInstallatie(this.hass, wens);
    } catch {
      // De volgende stand probeert het opnieuw.
      this.laatstGesynct_ = "";
    }
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: "full", rows: "auto", min_rows: this.minRijen_(".card", 6) };
  }

  blokken_() {
    return BLOKKEN.filter((b) => this.config[`show_${b.key}`] !== false && (!b.admin || this.rechten_.is_admin));
  }

  blokInfo_(key) {
    return BLOKKEN.find((b) => b.key === key);
  }

  /* ------------------------------------------------------------ template */

  template() {
    const c = this.config;
    return `
      <div class="card surface ${c.bare ? "bare" : ""}">
        <div class="kop">
          <div>
            <div class="eyebrow">DomotiApp Infoscherm</div>
            <h2>${at(c.title)}</h2>
          </div>
          <div class="status"></div>
        </div>
        <div class="geen" hidden></div>
        ${BLOKKEN.map(
          (b) => `<section class="blok" data-blok="${b.key}" hidden>
              <button class="bk" type="button">${icoon(b.icoon)}<b>${b.titel}</b><span class="bfout" hidden></span><span class="tel"></span>${resolve("chevronDown")}</button>
              <div class="inhoud"></div>
            </section>`
        ).join("")}
        <input class="file" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml">
      </div>`;
  }

  wire() {
    const card = this.$(".card");
    this.teardown_.push(volgRaster(card));
    this.teardown_.push(() => this.herkansing_.stop());
    this.teardown_.push(() => {
      for (const t of Object.values(this.timers_)) clearTimeout(t);
      this.timers_ = {};
    });

    this.on(card, "click", (e) => this.klik_(e));
    this.on(card, "input", (e) => this.invoer_(e));
    this.on(card, "change", (e) => this.invoer_(e));
    this.on(card, "pointerdown", (e) => this.sleepStart_(e));
    this.on(card, "focusout", (e) => this.focusWeg_(e));
    // Enter in het veld Nieuwe ruimte is hetzelfde als Toevoegen.
    this.on(card, "keydown", (e) => {
      if (e.key === "Enter" && e.target?.dataset?.veld === "r_nieuw_naam") {
        e.preventDefault();
        this.maakRuimte_();
      }
    });
    this.on(this.$(".file"), "change", (e) => this.bestandGekozen_(e));

    // `open_` begint op null en verandert alleen door een klik (zie de kop).
    this.teardown_.push(() => this.abo_.stop());
    this.teardown_.push(() => this.zegRuimtesOp_());
    // Een beheer staat de hele dag open: na middernacht een nieuw venster.
    const dag = setInterval(() => this.abonneerRuimtes_(), 10 * 60000);
    this.teardown_.push(() => clearInterval(dag));
    this.haal_();
    this.abo_.start(this.hass);
  }

  set hass(hass) {
    const terug = this.verbinding_.herverbonden(hass);
    super.hass = hass;
    if (terug && this.built_) {
      this.haal_();
      this.abo_.start(hass);
      for (const abo of this.ruimteAbos_.values()) abo.start(hass);
    }
  }

  get hass() {
    return super.hass;
  }

  /* ------------------------------------------------------------ data */

  async haal_() {
    if (!this.hass?.connection) return;
    try {
      const r = await haalStand(this.hass);
      this.rechten_ = r;
      this.feedFouten_ = r.feed_fouten ?? {};
      // De code staat niet in de stand (die gaat ook naar de iPad); het
      // antwoord op `get` geeft hem alleen aan wie mag beheren.
      if (!this.vuil_.has("code") && !this.bezig_.has("code")) this.werk_.code = r.ruimte_code ?? "";
      this.fout_ = null;
      this.herkansing_.herstel();
      this.nieuweStand_(r.stand, true);
    } catch (fout) {
      if (nogNietGereed(fout)) {
        this.herkansing_.plan();
        this.status_("Home Assistant start nog op…", "bezig");
        return;
      }
      this.fout_ = fout?.message ?? "Het beheer kon niet laden.";
      this.paint();
    }
  }

  /**
   * Een verse stand van de server.
   *
   * Alleen onderdelen die niet vuil zijn en niet onderweg worden overgenomen,
   * en alleen als ze echt anders zijn. Van de personen wordt de AANWEZIGHEID
   * wél altijd overgenomen (behalve van een schakelaar die hier net is
   * omgezet), want die komt van de iPad.
   */
  nieuweStand_(stand, alles = false) {
    const eerste = !this.stand_;
    this.stand_ = stand;
    this.sync_();
    this.abonneerRuimtes_();
    const opnieuw = new Set();
    for (const s of SECTIES) {
      if (this.vuil_.has(s) || this.bezig_.has(s)) {
        if (s === "personen") this.neemAanwezigOver_(stand.personen);
        continue;
      }
      if (alles || eerste || JSON.stringify(this.werk_[s]) !== JSON.stringify(stand[s])) {
        this.werk_[s] = kloon(stand[s]);
        for (const b of BLOKKEN) if (b.secties.includes(s)) opnieuw.add(b.key);
      }
    }
    if (eerste || alles) return this.paint();
    this.paintKader_();
    for (const key of opnieuw) this.teken_(key);
    return undefined;
  }

  /**
   * Per ruimte een abonnement op de boekingen van vandaag tot twee weken
   * vooruit. Een boeking op de iPad of in de agenda van Home Assistant staat
   * er daarmee binnen een tel. Alleen voor wie mag beheren.
   */
  abonneerRuimtes_() {
    const mag = this.rechten_.mag_beheren !== false;
    const ruimtes = mag ? (this.stand_?.installatie?.ruimtes ?? []).map((r) => r.entity) : [];
    const nu = new Date();
    const dag = isoDatum(nu);
    const nieuweDag = dag !== this.ruimteDag_;
    this.ruimteDag_ = dag;
    for (const [entity, abo] of [...this.ruimteAbos_]) {
      if (nieuweDag || !ruimtes.includes(entity)) {
        abo.stop();
        this.ruimteAbos_.delete(entity);
        if (!ruimtes.includes(entity)) this.ruimteAfspraken_.delete(entity);
      }
    }
    if (!this.hass?.connection) return;
    const van = dagBegin(nu);
    const tot = plusDagen(van, DAGEN_VOORUIT);
    for (const entity of ruimtes) {
      if (this.ruimteAbos_.has(entity)) continue;
      const abo = new AgendaAbonnement(entity, van, tot, (events) => {
        if (this.ruimteAbos_.get(entity) !== abo) return;
        if (events) this.ruimteAfspraken_.set(entity, afsprakenUit(events));
        this.teken_("ruimtes");
      });
      this.ruimteAbos_.set(entity, abo);
      abo.start(this.hass);
    }
  }

  zegRuimtesOp_() {
    for (const abo of this.ruimteAbos_.values()) abo.stop();
    this.ruimteAbos_.clear();
  }

  /** De aanwezigheid van de iPad in de werkkopie en in de schakelaars, zonder hertekenen. */
  neemAanwezigOver_(personen) {
    const w = this.werk_.personen;
    if (!Array.isArray(w)) return;
    const server = new Map((personen ?? []).map((p) => [p.id, p.aanwezig]));
    w.forEach((p, i) => {
      if (!p.id || p._aanwezig || !server.has(p.id) || server.get(p.id) === p.aanwezig) return;
      p.aanwezig = server.get(p.id);
      const item = this.$(`.blok[data-blok="personen"] .item[data-i="${i}"]`);
      const inp = item?.querySelector('input[data-veld="aanwezig"]');
      if (inp) inp.checked = p.aanwezig;
      const lbl = item?.querySelector(".vink .vl");
      if (lbl) lbl.textContent = p.aanwezig ? "Aanwezig" : "Afwezig";
      item?.querySelector(".avatar")?.classList.toggle("aan", p.aanwezig);
    });
    this.tel_("personen");
  }

  /* ------------------------------------------------------------ paint */

  paint() {
    if (!this.$(".card")) return;
    this.paintKader_();
    if (!this.magTonen_()) return;
    for (const b of this.blokken_()) this.teken_(b.key);
  }

  magTonen_() {
    return !this.fout_ && this.stand_ && this.rechten_.mag_beheren !== false;
  }

  /** De kop, de uitleg als er niets te tonen valt, en welke blokken er zijn. */
  paintKader_() {
    const geen = this.$(".geen");
    if (this.fout_) {
      geen.hidden = false;
      geen.textContent = this.fout_;
    } else if (this.stand_ && this.rechten_.mag_beheren === false) {
      geen.hidden = false;
      geen.textContent = "Dit account mag het infoscherm niet beheren. Log in als receptie of beheerder.";
    } else {
      geen.hidden = true;
    }
    const magTonen = this.magTonen_();
    const zichtbaar = new Set(this.blokken_().map((b) => b.key));
    for (const sec of this.$$(".blok")) {
      sec.hidden = !magTonen || !zichtbaar.has(sec.dataset.blok);
      sec.classList.toggle("open", sec.dataset.blok === this.open_);
    }
    if (!magTonen) return;
    if (this.hass?.connected === false) this.status_("Geen verbinding", "fout");
    else if (!this.bezig_.size && !this.vuil_.size) this.status_(this.laatstOpgeslagen_ ? `Opgeslagen ${this.laatstOpgeslagen_}` : "", "ok");
  }

  status_(tekst, soort = "") {
    const el = this.$(".status");
    if (!el) return;
    el.textContent = tekst;
    el.className = `status ${soort}`;
  }

  /**
   * Teken één blok opnieuw uit de werkkopie -- tenzij de focus erin staat.
   * Dan wacht het tot de focus het blok verlaat (`focusWeg_`), want anders
   * verdwijnt het veld onder de vingers van de receptie.
   */
  teken_(blok, forceer = false) {
    const sec = this.$(`.blok[data-blok="${blok}"]`);
    if (!sec || !this.stand_) return;
    const actief = this.shadowRoot.activeElement;
    if (!forceer && actief && sec.contains(actief) && actief.matches("input, textarea, select")) {
      this.uitgesteld_.add(blok);
      this.tel_(blok);
      return;
    }
    this.uitgesteld_.delete(blok);
    const html = {
      personen: () => this.htmlPersonen_(this.werk_.personen),
      mededelingen: () => this.htmlMededelingen_(this.werk_.mededelingen, this.werk_.scherm),
      verjaardagen: () => this.htmlVerjaardagen_(this.werk_.verjaardagen),
      praktijk: () => this.htmlPraktijk_(this.werk_.praktijk),
      indeling: () => this.htmlIndeling_(this.werk_.indeling),
      verlichting: () => this.htmlVerlichting_(this.werk_.installatie, this.werk_.instellingen),
      klimaat: () => this.htmlKlimaat_(this.werk_.installatie, this.werk_.instellingen),
      ruimtes: () => this.htmlRuimtes_(this.werk_.installatie),
      wifi: () => this.htmlWifi_(this.werk_.scherm, this.werk_.installatie),
      instellingen: () => this.htmlInstellingen_(this.werk_.scherm, this.werk_.instellingen),
    }[blok]();
    const inhoud = sec.querySelector(".inhoud");
    inhoud.innerHTML = html + this.htmlVoet_(blok);
    this.plaatjes_(inhoud);
    if (blok === "instellingen") this.logoVoorbeeld_();
    this.tel_(blok);
  }

  focusWeg_(e) {
    if (!this.uitgesteld_.size) return;
    const van = e.target?.closest?.(".blok")?.dataset.blok;
    const naar = e.relatedTarget?.closest?.(".blok")?.dataset.blok;
    if (van && van !== naar && this.uitgesteld_.has(van)) {
      // Pas na de focuswissel zelf, anders is het nieuwe veld het oude.
      setTimeout(() => this.teken_(van), 0);
    }
  }

  tel_(blok) {
    const sec = this.$(`.blok[data-blok="${blok}"]`);
    if (!sec) return;
    const w = this.werk_;
    const tel = {
      personen: () => `${(w.personen ?? []).filter((p) => p.aanwezig).length} van ${(w.personen ?? []).length} aanwezig`,
      mededelingen: () => `${(w.mededelingen ?? []).length}`,
      verjaardagen: () => `${(w.verjaardagen ?? []).length}`,
      praktijk: () => "",
      indeling: () => `${(w.indeling?.blokken ?? []).length} blokken`,
      verlichting: () => `${(w.installatie?.verlichting ?? []).length} lampen${w.instellingen?.verlichting_tonen === false ? " · uit" : ""}`,
      klimaat: () => {
        const n = (w.installatie?.klimaat ?? []).length;
        const uit = w.instellingen?.klimaat_tonen === false ? " · uit" : w.instellingen?.klimaat_bedienen === false ? " · alleen kijken" : "";
        return `${n === 1 ? "1 airco" : `${n} airco's`}${uit}`;
      },
      ruimtes: () => {
        const n = (w.installatie?.ruimtes ?? []).length;
        return `${n === 1 ? "1 ruimte" : `${n} ruimtes`}${n && !w.code ? " · boeken op het scherm uit" : ""}`;
      },
      wifi: () => (w.installatie?.wifi ? netwerkNaam(this.hass, w.installatie.wifi, w.scherm?.wifi_naam) : "geen QR-code gekozen"),
      instellingen: () => `${(w.instellingen?.feeds ?? []).length} nieuwsbron(nen)`,
    }[blok]();
    sec.querySelector(".tel").textContent = tel;
    const info = this.blokInfo_(blok);
    const fout = info.secties.map((s) => this.fouten_[s]).find(Boolean);
    const bf = sec.querySelector(".bfout");
    bf.hidden = !fout;
    bf.textContent = fout ? "niet opgeslagen" : "";
  }

  htmlVoet_(blok) {
    const info = this.blokInfo_(blok);
    const fout = info.secties.map((s) => this.fouten_[s]).find(Boolean);
    // De melding van een boeking staat bij de knop Boeken (htmlRuimtes_):
    // onderaan het blok, onder de lijst van ruimtes, zag je hem niet.
    const m = blok === "ruimtes" ? null : this.meldingen_[blok];
    if (!fout && !m) return "";
    return `<div class="voet"><span class="melding ${fout || m?.fout ? "fout" : ""}">${at(fout ? `Niet opgeslagen: ${fout}` : m?.tekst)}</span></div>`;
  }

  veld_(label, naam, waarde, { type = "text", i, extra = "", s } = {}) {
    return `<div class="veld"><label>${at(label)}</label><input type="${type}" data-veld="${naam}" ${s ? `data-s="${s}"` : ""} ${
      i !== undefined ? `data-i="${at(String(i))}"` : ""
    } value="${at(waarde)}" ${extra}></div>`;
  }

  /**
   * Een schakelaar met een tekst erachter. De tekst heeft een eigen klasse
   * (`.vl`): wie hem met `span:last-child` zoekt vindt het BINNENSTE span van
   * de schakelaar zelf, en schrijft "Aanwezig" dwars door het knopje heen.
   * Precies dat stond op een schermafdruk van 10 september 2026.
   */
  schakel_(naam, aan, { i, label, s } = {}) {
    return `<label class="vink"><span class="schakel"><input type="checkbox" data-veld="${naam}" ${s ? `data-s="${s}"` : ""} ${
      i !== undefined ? `data-i="${at(String(i))}"` : ""
    } ${aan ? "checked" : ""}><span></span></span>${label ? `<span class="vl">${at(label)}</span>` : ""}</label>`;
  }

  /** Een keuze uit een paar mogelijkheden: knoppen naast elkaar (zie .segment). */
  keuze_(label, naam, waarde, opties, { s } = {}) {
    return `<div class="veld"><label>${at(label)}</label><div class="segment" role="radiogroup" data-veld="${naam}" ${s ? `data-s="${s}"` : ""}>${opties
      .map(
        ([v, l]) =>
          `<button type="button" role="radio" data-actie="segment" data-waarde="${at(v)}" aria-checked="${String(v) === String(waarde ?? "")}" class="${
            String(v) === String(waarde ?? "") ? "aan" : ""
          }">${at(l)}</button>`
      )
      .join("")}</div></div>`;
  }

  /* ------------------------------------------------------------ de blokken */

  htmlPersonen_(lijst = []) {
    const rijen = lijst
      .map(
        (p, i) => `<div class="item persoon" data-i="${i}">
          <div class="greep" title="Sleep om de volgorde te wijzigen">${ICOON.grip}</div>
          <div class="avatar ${p.aanwezig ? "aan" : ""}" data-actie="foto" data-i="${i}" data-bestand="${at(p.foto)}" title="Foto kiezen">${at(initialen(p.naam))}</div>
          ${this.veld_("Naam", "naam", p.naam, { i })}
          ${this.veld_("Functie", "functie", p.functie, { i })}
          ${this.schakel_("aanwezig", p.aanwezig, { i, label: p.aanwezig ? "Aanwezig" : "Afwezig" })}
          <div class="knoppen">
            ${p.foto ? `<button class="knop ico" type="button" data-actie="fotoweg" data-i="${i}" title="Foto weghalen">${resolve("close")}</button>` : ""}
            <button class="knop ico gevaar" type="button" data-actie="verwijder" data-i="${i}" title="Verwijderen">${resolve("minus")}</button>
          </div>
        </div>`
      )
      .join("");
    return `<div class="hulp">Tik op de cirkel om een foto te kiezen. Zonder foto staan de initialen op het scherm (eerste letter van de voornaam en van het laatste woord van de achternaam). Sleep aan de greep links om de volgorde te wijzigen; dat is de volgorde op het scherm. De schakelaar zet iemand aan- of afwezig, ook achteraf. Alles wordt vanzelf opgeslagen.</div>
      <div class="lijst">${rijen || `<div class="leeg">Nog geen medewerkers.</div>`}</div>
      <div><button class="knop" type="button" data-actie="nieuw">${resolve("plus")} Medewerker toevoegen</button></div>`;
  }

  htmlMededelingen_(lijst = [], scherm = {}) {
    const rijen = lijst
      .map(
        (m, i) => `<div class="item mededeling" data-i="${i}">
          <div class="veld"><label>Tekst op het scherm</label><textarea data-veld="tekst" data-i="${i}" rows="2">${at(m.tekst)}</textarea></div>
          ${this.veld_("Vanaf", "van", m.van, { i, type: "datetime-local" })}
          ${this.veld_("Tot en met", "tot", m.tot, { i, type: "datetime-local" })}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="verwijder" data-i="${i}" title="Verwijderen">${resolve("minus")}</button></div>
        </div>`
      )
      .join("");
    return `<div class="hulp">Wat er in het blok Mededelingen op het welkomscherm staat: "Vrijdag 20 september zijn wij vanaf 12:00 gesloten", een nieuwe collega, een verbouwing. Zonder datum en tijd staat een mededeling er altijd. Met meerdere schuiven ze vanzelf door; op de iPad kan er ook geveegd worden.</div>
      <div class="lijst">${rijen || `<div class="leeg">Geen mededeling.</div>`}</div>
      <div class="voet">
        <button class="knop" type="button" data-actie="nieuw">${resolve("plus")} Mededeling toevoegen</button>
        ${this.veld_("Elke mededeling blijft staan (seconden)", "mededeling_interval", scherm.mededeling_interval ?? 10, { type: "number", s: "scherm", extra: 'min="3" max="600"' })}
      </div>`;
  }

  htmlVerjaardagen_(lijst = []) {
    const rijen = lijst
      .map(
        (v, i) => `<div class="item verjaardag" data-i="${i}">
          ${this.veld_("Naam", "naam", v.naam, { i })}
          ${this.veld_("Geboortedatum", "datum", v.datum, { i, type: "date" })}
          ${this.schakel_("jaar_tonen", v.jaar_tonen !== false, { i, label: "Leeftijd tonen" })}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="verwijder" data-i="${i}" title="Verwijderen">${resolve("minus")}</button></div>
        </div>`
      )
      .join("");
    return `<div class="hulp">Iedereen die op het scherm gefeliciteerd mag worden: medewerkers, vrijwilligers, bewoners. Het blok Verjaardagen op het welkomscherm toont wie er vandaag en binnenkort jarig is; "Het hele jaar" in de kop geeft het hele jaar.</div>
      <div class="lijst">${rijen || `<div class="leeg">Nog geen verjaardagen.</div>`}</div>
      <div><button class="knop" type="button" data-actie="nieuw">${resolve("plus")} Verjaardag toevoegen</button></div>`;
  }

  htmlPraktijk_(p = {}) {
    const ot = p.openingstijden ?? {};
    const rijenOt = DAGEN.map((dag) => {
      const vakken = ot[dag] ?? [];
      const dicht = vakken.length === 0;
      const v = (n, k) => vakken[n]?.[k] ?? "";
      return `<span class="dag">${DAGNAMEN[dag]}</span>
        ${this.schakel_("ot_open", !dicht, { i: dag, label: dicht ? "gesloten" : "open" })}
        <input type="time" data-veld="ot_0_0" data-i="${dag}" value="${v(0, 0)}" ${dicht ? "disabled" : ""}>
        <input type="time" data-veld="ot_0_1" data-i="${dag}" value="${v(0, 1)}" ${dicht ? "disabled" : ""}>
        <input type="time" class="vak2" data-veld="ot_1_0" data-i="${dag}" value="${v(1, 0)}" ${dicht ? "disabled" : ""}>
        <input type="time" class="vak2" data-veld="ot_1_1" data-i="${dag}" value="${v(1, 1)}" ${dicht ? "disabled" : ""}>`;
    }).join("");
    const uitz = (p.uitzonderingen ?? [])
      .map(
        (u, i) => `<div class="item uitz" data-i="${i}">
          ${this.veld_("Datum", "u_datum", u.datum, { i, type: "date" })}
          ${this.schakel_("u_open", (u.tijden ?? []).length > 0, { i, label: (u.tijden ?? []).length ? "open" : "gesloten" })}
          ${this.veld_("Van", "u_van", u.tijden?.[0]?.[0] ?? "", { i, type: "time", extra: u.tijden?.length ? "" : "disabled" })}
          ${this.veld_("Tot", "u_tot", u.tijden?.[0]?.[1] ?? "", { i, type: "time", extra: u.tijden?.length ? "" : "disabled" })}
          ${this.veld_("Reden (op het scherm)", "u_reden", u.reden, { i })}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="u_verwijder" data-i="${i}" title="Verwijderen">${resolve("minus")}</button></div>
        </div>`
      )
      .join("");
    return `
      <div class="veld"><label>Openingstijden</label>
        <div class="ot-tabel">
          <span class="k"></span><span class="k"></span><span class="k">Open</span><span class="k">Dicht</span><span class="k vak2">Open</span><span class="k vak2">Dicht</span>
          ${rijenOt}
        </div>
        <div class="hulp">Twee vakken per dag voor een middagpauze. Het welkomscherm zegt ermee "Vandaag geopend tot 17:00" of "Gesloten · morgen open om 08:00".</div>
      </div>
      <div class="veld"><label>Afwijkende dagen (feestdagen, studiedagen)</label>
        <div class="lijst">${uitz || `<div class="leeg">Geen afwijkende dagen.</div>`}</div>
        <div style="margin-top:8px"><button class="knop" type="button" data-actie="u_nieuw">${resolve("plus")} Afwijkende dag toevoegen</button></div>
      </div>`;
  }

  /** De indeling: een verkleind scherm waarin de blokken te slepen zijn. */
  htmlIndeling_(ind) {
    const blokken = ind?.blokken ?? [];
    const vandaag = isoDatumTijd(new Date());
    const ibs = blokken
      .map((b) => {
        const info = BLOK_INFO[b.soort];
        if (!info) return "";
        const ontbreekt = blokOntbreekt(b.soort, this.stand_, [], vandaag);
        return `<div class="ib ${ontbreekt ? "ontbreekt" : ""}" data-id="${at(b.id)}" style="${this.ibStijl_(b)}" title="${at(ontbreekt ? `${info.naam}: ${ontbreekt}` : `${info.naam} -- sleep om te verplaatsen, hoek rechtsonder om de maat te wijzigen`)}">
          <div class="ib-in">
            <div class="ib-kop">${resolve(info.icoon, "question")}<span>${info.naam}</span></div>
            ${ontbreekt ? `<div class="ib-nb">${at(ontbreekt)}</div>` : ""}
            ${
              info.aantal
                ? `<div class="ib-aantal"><span>Toon</span><button type="button" data-actie="aantal_min" data-id="${at(b.id)}" title="Minder">−</button><b>${
                    b.aantal > 0 ? b.aantal : "alle"
                  }</b><button type="button" data-actie="aantal_plus" data-id="${at(b.id)}" title="Meer">+</button></div>`
                : ""
            }
            <button class="ib-weg" type="button" data-actie="blok_weg" data-id="${at(b.id)}" title="Van het scherm halen">${resolve("close")}</button>
            <div class="ib-greep" title="Maat wijzigen"></div>
          </div>
        </div>`;
      })
      .join("");
    const inGebruik = new Set(blokken.map((b) => b.soort));
    const opties = BLOK_SOORTEN.filter((s) => !inGebruik.has(s));
    return `<div class="hulp">Zo staat het welkomscherm op de iPad. Sleep een blok om het te verplaatsen, trek aan de hoek rechtsonder om het groter of kleiner te maken, en zet met − en + hoeveel er in een blok staat ("alle" = zoveel als er is). Een gestippeld blok staat NIET op het scherm zolang er niets in te tonen valt; de reden staat erin. Elke wijziging gaat meteen naar het scherm.</div>
      <div class="raster">${ibs}</div>
      <div class="knoppen" style="justify-content: flex-start">
        <select data-actie="blok_toevoegen" ${opties.length ? "" : "disabled"} style="width:auto">
          <option value="">${opties.length ? "Blok toevoegen…" : "Alle blokken staan op het scherm"}</option>
          ${opties.map((s) => `<option value="${s}">${BLOK_INFO[s].naam}</option>`).join("")}
        </select>
        <button class="knop" type="button" data-actie="indeling_standaard">Standaardindeling</button>
      </div>`;
  }

  ibStijl_(b) {
    return `left:${((b.x / KOLOMMEN) * 100).toFixed(3)}%;top:${((b.y / RIJEN) * 100).toFixed(3)}%;width:${((b.w / KOLOMMEN) * 100).toFixed(3)}%;height:${((b.h / RIJEN) * 100).toFixed(3)}%`;
  }

  htmlVerlichting_(inst = {}, instellingen = {}) {
    const lampen = inst.verlichting ?? [];
    const rijen = lampen
      .map((l, i) => {
        const a = this.hass?.states?.[l.entity]?.attributes ?? {};
        return `<div class="item lamp" data-i="${i}" data-lijst="verlichting">
          <div class="greep" title="Sleep om de volgorde te wijzigen">${ICOON.grip}</div>
          <div class="ent"><b>${at(a.friendly_name ?? l.entity)}</b><span>${at(l.entity)}</span></div>
          ${this.veld_("Naam op het scherm", "l_naam", l.naam, { i, s: "installatie", extra: `placeholder="${at(a.friendly_name ?? "")}"` })}
        </div>`;
      })
      .join("");
    return `
      ${this.schakel_("verlichting_tonen", instellingen.verlichting_tonen !== false, { label: "Verlichting op het scherm tonen", s: "instellingen" })}
      <div class="hulp">De namen zoals ze op het scherm staan. Leeg = de naam uit Home Assistant. Sleep aan de greep links om de volgorde te wijzigen; dat is de volgorde op het scherm. Welke lampen erbij horen kiest de installateur in de kaartinstellingen van DEZE kaart (bewerkmodus, potlood bij de kaart); een nieuwe lamp komt achteraan.</div>
      <div class="lijst">${rijen || `<div class="leeg">Er zijn nog geen lampen gekozen.</div>`}</div>`;
  }

  /**
   * De airco's: dezelfde vorm als de lampen. De namen en de volgorde zijn van
   * de receptie, welke airco's erbij horen kiest de installateur. Daarnaast
   * twee schakelaars: op het scherm tonen, en daar laten bedienen.
   */
  htmlKlimaat_(inst = {}, instellingen = {}) {
    const aircos = inst.klimaat ?? [];
    const rijen = aircos
      .map((k, i) => {
        const a = this.hass?.states?.[k.entity]?.attributes ?? {};
        return `<div class="item airco" data-i="${i}" data-lijst="klimaat">
          <div class="greep" title="Sleep om de volgorde te wijzigen">${ICOON.grip}</div>
          <div class="ent"><b>${at(a.friendly_name ?? k.entity)}</b><span>${at(k.entity)}</span></div>
          ${this.veld_("Naam op het scherm", "k_naam", k.naam, { i, s: "installatie", extra: `placeholder="${at(a.friendly_name ?? "")}"` })}
        </div>`;
      })
      .join("");
    return `
      ${this.schakel_("klimaat_tonen", instellingen.klimaat_tonen !== false, { label: "Airco's op het scherm tonen", s: "instellingen" })}
      ${this.schakel_("klimaat_bedienen", instellingen.klimaat_bedienen !== false, { label: "Op het scherm laten bedienen", s: "instellingen" })}
      <div class="hulp">Op het welkomscherm staat per airco de temperatuur in de ruimte en wat er ingesteld is. Wie op het blok tikt, kan de airco's daar aan- en uitzetten en bijstellen; zet "laten bedienen" uit als bezoekers alleen mogen kijken. Het blok zelf zet je op het scherm met Indeling, Blok toevoegen. De namen hieronder zijn die op het scherm (leeg = de naam uit Home Assistant), en slepen aan de greep bepaalt de volgorde. Welke airco's erbij horen kiest de installateur in de kaartinstellingen van DEZE kaart.</div>
      <div class="lijst">${rijen || `<div class="leeg">Er zijn nog geen airco's gekozen.</div>`}</div>`;
  }

  /**
   * De ruimtes: een nieuwe boeking, wat er geboekt is, de code voor het
   * scherm, en de namen en de volgorde (net als de lampen en de airco's).
   */
  htmlRuimtes_(inst = {}) {
    const ruimtes = inst.ruimtes ?? [];
    const naam = (r) => r.naam || this.hass?.states?.[r.entity]?.attributes?.friendly_name || r.entity;
    const rijen = ruimtes
      .map((r, i) => {
        const a = this.hass?.states?.[r.entity]?.attributes ?? {};
        const weg = r.gemaakt
          ? `<button class="knop ico gevaar" type="button" data-actie="r_weg" data-ruimte="${at(r.entity)}" title="Ruimte weghalen">${resolve("minus")}</button>`
          : `<span class="van" title="Deze agenda koos de installateur in de kaartinstellingen; daar gaat hij ook weer weg.">installateur</span>`;
        return `<div class="item ruimte" data-i="${i}" data-lijst="ruimtes">
          <div class="greep" title="Sleep om de volgorde te wijzigen">${ICOON.grip}</div>
          <div class="ent"><b>${at(a.friendly_name ?? r.entity)}</b><span>${at(r.entity)}</span></div>
          ${this.veld_("Naam op het scherm", "r_naam", r.naam, { i, s: "installatie", extra: `placeholder="${at(a.friendly_name ?? "")}"` })}
          <div class="knoppen">${weg}</div>
        </div>`;
      })
      .join("");
    const m = this.ruimteMelding_;
    const namenEnVolgorde = `
      <div class="sub">Ruimtes</div>
      <div class="hulp">Elke ruimte heeft een eigen agenda in Home Assistant; daar staan de boekingen in. De namen hieronder zijn die op het scherm (leeg = de naam van de agenda), en slepen aan de greep bepaalt de volgorde. Weghalen haalt ook de agenda weg, met alle boekingen erin.</div>
      <div class="lijst">${rijen || `<div class="leeg">Er zijn nog geen ruimtes.</div>`}</div>
      <div class="rij toevoegen">
        ${this.veld_("Nieuwe ruimte", "r_nieuw_naam", this.nieuweRuimte_ ?? "", { s: "ruimte_nieuw", extra: 'placeholder="Bijvoorbeeld: Spreekruimte" autocomplete="off"' })}
        <button class="knop" type="button" data-actie="r_nieuw">${resolve("plus")}<span>Toevoegen</span></button>
      </div>
      ${m ? `<div class="voet"><span class="melding ${m.fout ? "fout" : "goed"}" role="status">${at(m.tekst)}</span></div>` : ""}`;
    // Nog geen ruimtes: eerst er een maken. Tot 0.76.0 kon dat alleen een
    // beheerder, met een Lokale agenda en de kaartinstellingen; gemeld op
    // 16 oktober 2026: "De receptioniste moet dat zelf kunnen maken."
    if (!ruimtes.length) {
      return `
        <div class="hulp">Voeg hieronder een ruimte toe, bijvoorbeeld de spreekruimte of de kleine vergaderruimte. Daarna kun je hier boeken, en een code instellen om op de iPad te boeken. Op het scherm komt het blok met Indeling, Blok toevoegen, Ruimtes.</div>
        ${namenEnVolgorde}`;
    }

    const f = this.boekForm_;
    if (!ruimtes.some((r) => r.entity === f.ruimte)) f.ruimte = ruimtes[0].entity;
    if (!f.datum) f.datum = isoDatum(new Date());
    const nu = new Date();
    const dagen = perDag(
      ruimtes.map((r) => ({ entity: r.entity, naam: naam(r), afspraken: this.ruimteAfspraken_.get(r.entity) ?? [] })),
      nu
    );
    const geladen = ruimtes.every((r) => this.ruimteAfspraken_.has(r.entity));
    const lijst = dagen.length
      ? dagen
          .map(
            (d) => `<div class="r-dag">${at(d.label)}</div>${d.boekingen
              .map(
                (b) => `<div class="item boeking">
                  <span class="r-tijd">${at(tijdTekst(b.afspraak))}</span>
                  <span class="r-ruimte">${at(b.naam)}</span>
                  <span class="r-titel">${at(b.afspraak.titel)}</span>
                  <div class="knoppen">${
                    b.afspraak.uid
                      ? `<button class="knop ico gevaar" type="button" data-actie="r_vrij" data-ruimte="${at(b.entity)}" data-uid="${at(b.afspraak.uid)}" data-rid="${at(b.afspraak.recurrence_id ?? "")}" title="Vrijgeven">${resolve("minus")}</button>`
                      : ""
                  }</div>
                </div>`
              )
              .join("")}`
          )
          .join("")
      : `<div class="leeg">${geladen ? "De komende twee weken is er niets geboekt." : "De agenda's worden gelezen…"}</div>`;

    return `
      <div class="hulp">Wat hier geboekt wordt, staat in de agenda van die ruimte in Home Assistant. Op het scherm staat alleen of een ruimte vrij of bezet is en tot wanneer; de omschrijving komt er nooit op.</div>
      <div class="sub">Nieuwe boeking</div>
      ${this.keuze_("Ruimte", "ruimte", f.ruimte, ruimtes.map((r) => [r.entity, naam(r)]), { s: "boeken" })}
      <div class="rij drie">
        ${this.veld_("Datum", "datum", f.datum ?? "", { type: "date", s: "boeken" })}
        ${this.veld_("Van", "van", f.van ?? "", { type: "time", s: "boeken" })}
        ${this.veld_("Tot", "tot", f.tot ?? "", { type: "time", s: "boeken" })}
      </div>
      ${this.veld_("Omschrijving (niet op het scherm)", "omschrijving", f.omschrijving ?? "", { s: "boeken", extra: 'placeholder="Bijvoorbeeld: teamoverleg"' })}
      <div class="voet"><button class="knop" type="button" data-actie="r_boek">${resolve("plus")}<span>Boeken</span></button>${
        this.meldingen_.ruimtes ? `<span class="melding ${this.meldingen_.ruimtes.fout ? "fout" : "goed"}" role="status">${at(this.meldingen_.ruimtes.tekst)}</span>` : ""
      }</div>
      <div class="sub">Geboekt, de komende twee weken</div>
      <div class="lijst">${lijst}</div>
      <div class="sub">Boeken op het scherm</div>
      ${this.veld_("Code", "code", this.werk_.code ?? "", { s: "code", extra: 'inputmode="numeric" autocomplete="off" maxlength="8" placeholder="Bijvoorbeeld 4821"' })}
      <div class="hulp">Met deze code kunnen medewerkers op de iPad zelf een ruimte boeken: op het scherm op Ruimtes tikken, dan op Boeken. Vier tot acht cijfers. Leeg = boeken op het scherm staat uit. De code staat nooit op het scherm zelf.</div>
      ${namenEnVolgorde}`;
  }

  /**
   * De wifi voor gasten: de QR-code ter controle, en wat er op het scherm
   * naast staat. De code zelf kiest de installateur.
   */
  htmlWifi_(s = {}, inst = {}) {
    const id = inst?.wifi;
    if (!id) {
      return `<div class="hulp">Er is nog geen QR-code gekozen. Dat doet de installateur in de kaartinstellingen van DEZE kaart (bewerkmodus, potlood bij de kaart): bij UniFi Network de entiteit QR-code van het gastnetwerk.</div>`;
    }
    const adres = qrAdres(this.hass, id);
    const uitUnifi = netwerkNaam(this.hass, id, "");
    return `
      <div class="b-onder">
        <div class="plaatje wifi">${adres ? `<img src="${at(adres)}" alt="QR-code van de wifi">` : "–"}</div>
        <div class="hulp">Deze code staat op het scherm; wie hem scant met de camera van zijn telefoon, is meteen verbonden. Het blok zet je op het scherm met Indeling, Blok toevoegen.</div>
      </div>
      <div class="rij twee">
        ${this.veld_("Netwerknaam op het scherm", "wifi_naam", s.wifi_naam ?? "", { s: "scherm", extra: `placeholder="${at(uitUnifi)}"` })}
        ${this.veld_("Wachtwoord op het scherm", "wifi_wachtwoord", s.wifi_wachtwoord ?? "", { s: "scherm", extra: 'placeholder="Leeg = alleen de QR-code" autocomplete="off"' })}
      </div>
      <div class="hulp">Leeg = de naam uit UniFi. Het wachtwoord geeft UniFi niet door aan Home Assistant; het zit alleen in de QR-code. Vul het in voor wie niet kan scannen. Wordt het in UniFi vernieuwd, dan past de QR-code zich vanzelf aan, deze tekst niet.</div>`;
  }

  htmlInstellingen_(s = {}, instellingen = {}) {
    const feeds = (instellingen.feeds ?? [])
      .map(
        (f, i) => `<div class="item feed" data-i="${i}">
          ${this.veld_("Naam", "f_naam", f.naam, { i, s: "instellingen" })}
          ${this.veld_("Adres van de RSS-feed", "f_url", f.url, { i, type: "url", s: "instellingen" })}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="f_verwijder" data-i="${i}" title="Verwijderen">${resolve("minus")}</button></div>
          ${this.feedFouten_[f.url] ? `<div class="feedfout" style="grid-column: 1 / -1">Niet opgehaald: ${at(this.feedFouten_[f.url])}</div>` : ""}
        </div>`
      )
      .join("");
    return `
      <div class="rij twee">
        <div class="veld"><label>Logo</label>
          <div class="b-onder">
            <div class="plaatje logo${s.logo ? ` op-${s.uiterlijk === "licht" ? "licht" : "donker"}` : ""}" data-bestand="${at(s.logo)}">${s.logo ? "" : resolve("camera")}</div>
            <button class="knop klein" type="button" data-actie="logo">${resolve("camera")} ${s.logo ? "Ander logo" : "Logo kiezen"}</button>
            ${s.logo ? `<button class="knop klein" type="button" data-actie="logoweg">${resolve("close")} Logo weg</button>` : ""}
          </div>
          <div class="hulp">Het logo houdt zijn eigen verhouding: lang, breed of vierkant. Het voorbeeld staat op de ondergrond van het scherm (Uiterlijk hieronder). Een doorzichtige rand gaat er bij het uploaden af.</div>
          <div class="hulp logo-waarschuwing" hidden></div>
        </div>
        <div class="veld"><label>Accentkleur op het scherm</label>
          <div class="b-onder">
            <input type="color" data-veld="accent_kleur" data-s="scherm" value="${at(s.accent || "#026fa1")}">
            <input type="text" data-veld="accent" data-s="scherm" value="${at(s.accent)}" placeholder="leeg = standaard" style="max-width: 140px">
          </div>
        </div>
      </div>
      <div class="rij drie">
        ${this.keuze_("Uiterlijk", "uiterlijk", s.uiterlijk ?? "donker", [["donker", "Donker"], ["licht", "Licht"]], { s: "scherm" })}
        ${this.keuze_("Vorm van de foto's", "foto_vorm", s.foto_vorm ?? "rond", [["rond", "Rond"], ["vierkant", "Afgerond vierkant"]], { s: "scherm" })}
        ${this.keuze_("Pagina Aanwezig", "aanwezig_weergave", s.aanwezig_weergave ?? "gescheiden", [
          ["gescheiden", "Aanwezig en afwezig naast elkaar"],
          ["functie", "Per functie, naast elkaar"],
          ["lijst", "Eén lijst"],
        ], { s: "scherm" })}
      </div>
      <div class="rij drie">
        ${this.veld_("Terug naar Welkom na (seconden, 0 = nooit)", "terug_na", s.terug_na ?? 60, { type: "number", s: "scherm", extra: 'min="0" max="3600"' })}
        ${this.veld_("Schaal (1 = iPad 11 inch)", "schaal", s.schaal ?? 1, { type: "number", s: "scherm", extra: 'min="0.5" max="2" step="0.05"' })}
      </div>
      ${this.schakel_("aanwezig_teller", s.aanwezig_teller !== false, { label: "Teller bij Aanwezig (x van y)", s: "scherm" })}
      ${this.schakel_("weer_animatie", s.weer_animatie !== false, { label: "Bewegende weericonen", s: "scherm" })}
      <div class="veld"><label>Het blok Welkom</label>
        <div class="hulp">Wat er in het welkomblok op het scherm staat, naast de klok. Alleen het logo? Zet de tekst leeg. De openingstijden staan in hun eigen blok.</div>
        <div class="rij twee" style="margin-top: 6px">
          ${this.veld_("Tekst (leeg = geen tekst)", "welkom_tekst", s.welkom_tekst ?? "Welkom", { s: "scherm" })}
          <div class="veld" style="gap: 0">
            ${this.schakel_("logo_verbergen", s.logo_verbergen === true, { label: "Logo op het scherm verbergen", s: "scherm" })}
          </div>
        </div>
      </div>
      <div class="veld"><label>Nieuws (RSS)</label>
        <div class="hulp">Bijvoorbeeld het NOS-nieuws: https://feeds.nos.nl/nosnieuwsalgemeen. Wordt elk kwartier opgehaald.</div>
        <div class="lijst">${feeds || `<div class="leeg">Geen bronnen.</div>`}</div>
        <div class="knoppen" style="justify-content: flex-start; margin-top: 8px">
          <button class="knop" type="button" data-actie="f_nieuw">${resolve("plus")} Bron toevoegen</button>
          <button class="knop" type="button" data-actie="f_ververs">Nu ophalen</button>
        </div>
      </div>`;
  }

  /**
   * Het voorbeeld van het logo op de achtergrond van het gekozen uiterlijk,
   * en de waarschuwing als het daar grotendeels wegvalt. Ook na een andere
   * keuze bij Uiterlijk, zonder het blok opnieuw te tekenen.
   */
  logoVoorbeeld_() {
    const vak = this.$(".plaatje.logo");
    const melding = this.$(".logo-waarschuwing");
    if (!vak || !melding) return;
    const id = this.werk_?.scherm?.logo || null;
    const uiterlijk = () => (this.werk_?.scherm?.uiterlijk === "licht" ? "licht" : "donker");
    vak.classList.toggle("op-donker", !!id && uiterlijk() === "donker");
    vak.classList.toggle("op-licht", !!id && uiterlijk() === "licht");
    const zet = (analyse) => {
      if ((this.werk_?.scherm?.logo || null) !== id) return;
      const tekst = id ? logoWaarschuwing(analyse, uiterlijk()) : "";
      melding.textContent = tekst;
      melding.hidden = !tekst;
    };
    if (!id) return zet(null);
    if (!this.logoAnalyses_.has(id)) {
      const meting = bestandUrl(this.hass, id)
        .then((url) => (url ? analyseerLogo(url) : null))
        .then((analyse) => {
          if (!analyse) this.logoAnalyses_.delete(id);
          return analyse;
        });
      this.logoAnalyses_.set(id, meting);
    }
    this.logoAnalyses_.get(id).then(zet);
  }

  /** Foto's en logo's uit de blob-cache in de zojuist getekende blokken. */
  plaatjes_(wortel) {
    for (const el of wortel.querySelectorAll("[data-bestand]:not([data-bestand=''])")) {
      bestandUrl(this.hass, el.dataset.bestand).then((url) => {
        if (url && el.isConnected) el.innerHTML = `<img alt="" src="${url}">`;
      });
    }
  }

  /* ------------------------------------------------------------ invoer */

  /** Iets is gewijzigd: onthouden, en na een adempauze opslaan. */
  markeer_(sectie, blok, ms = ADEMPAUZE_KNOP) {
    this.vuil_.add(sectie);
    this.bron_ = { ...(this.bron_ ?? {}), [sectie]: blok };
    this.versie_[sectie] = (this.versie_[sectie] ?? 0) + 1;
    this.fouten_[sectie] = null;
    if (blok) {
      this.meldingen_[blok] = null;
      this.tel_(blok);
    }
    this.status_("Opslaan…", "bezig");
    clearTimeout(this.timers_[sectie]);
    this.timers_[sectie] = setTimeout(() => this.bewaar_(sectie), ms);
  }

  invoer_(e) {
    const el = e.target;
    if (el?.dataset?.actie === "blok_toevoegen") return this.blokToevoegen_(el.value, el);
    const veld = el?.dataset?.veld;
    if (!veld) return undefined;
    const blok = el.closest(".blok")?.dataset.blok;
    if (!blok) return undefined;
    // Het formulier voor een nieuwe boeking: alleen onthouden. Pas de knop
    // Boeken stuurt het, en dan naar de agenda en niet naar de opslag.
    if (el.dataset.s === "boeken") {
      this.boekForm_[veld] = el.value;
      return undefined;
    }
    if (el.dataset.s === "ruimte_nieuw") {
      this.nieuweRuimte_ = el.value;
      return undefined;
    }
    const info = this.blokInfo_(blok);
    const sectie = el.dataset.s || info.secties[0];
    const i = el.dataset.i;
    const w = this.werk_[sectie];
    const waarde = el.type === "checkbox" ? el.checked : el.value;
    // Typen wacht op de laatste letter en wordt bij `input` verwerkt; een
    // schakelaar, keuze of datum gaat meteen, bij `change`. Zo telt niets dubbel.
    const tekst = el.type === "text" || el.type === "url" || el.type === "number" || el.tagName === "TEXTAREA";
    const kleur = el.type === "color";
    if ((tekst || kleur) && e.type !== "input") return undefined;
    if (!tekst && !kleur && e.type !== "change") return undefined;

    if (sectie === "personen" || sectie === "mededelingen" || sectie === "verjaardagen") {
      const item = w[Number(i)];
      if (!item) return undefined;
      item[veld] = waarde;
      if (veld === "naam") {
        const av = el.closest(".item")?.querySelector(".avatar");
        if (av && !av.querySelector("img")) av.textContent = initialen(waarde);
      }
      if (veld === "aanwezig") {
        // Een schakelaar die hier is omgezet gaat als bewuste keuze mee; de
        // andere blijven van de iPad (zie `bewaar_`).
        item._aanwezig = true;
        const lbl = el.closest(".vink")?.querySelector(".vl");
        if (lbl) lbl.textContent = waarde ? "Aanwezig" : "Afwezig";
        el.closest(".item")?.querySelector(".avatar")?.classList.toggle("aan", waarde);
      }
    } else if (sectie === "praktijk") {
      this.invoerPraktijk_(w, veld, i, waarde, el);
    } else if (sectie === "scherm") {
      if (veld === "accent_kleur") {
        w.accent = waarde;
        const t = el.closest(".b-onder")?.querySelector('[data-veld="accent"]');
        if (t) t.value = waarde;
      } else if (veld === "accent") {
        w.accent = String(waarde).trim() || null;
      } else if (el.type === "number") {
        const n = Number(waarde);
        if (!Number.isFinite(n)) return undefined;
        w[veld] = n;
      } else {
        w[veld] = waarde;
      }
      if (veld === "uiterlijk") this.logoVoorbeeld_();
    } else if (sectie === "installatie") {
      if (veld === "l_naam") {
        const l = w.verlichting?.[Number(i)];
        if (l) l.naam = waarde;
      } else if (veld === "k_naam") {
        const k = w.klimaat?.[Number(i)];
        if (k) k.naam = waarde;
      } else if (veld === "r_naam") {
        const r = w.ruimtes?.[Number(i)];
        if (r) r.naam = waarde;
      }
    } else if (sectie === "code") {
      // Alleen cijfers, zoals de server ze wil. Wat er anders getypt wordt,
      // verdwijnt meteen uit het veld in plaats van straks een fout te geven.
      const code = String(waarde).replace(/[^0-9]/g, "").slice(0, 8);
      if (el.value !== code) el.value = code;
      this.werk_.code = code;
    } else if (sectie === "instellingen") {
      if (veld.startsWith("f_")) {
        const f = w.feeds[Number(i)];
        if (f) f[veld.slice(2)] = waarde;
      } else {
        w[veld] = waarde;
      }
    }
    this.markeer_(sectie, blok, tekst ? ADEMPAUZE_TEKST : ADEMPAUZE_KNOP);
    return undefined;
  }

  invoerPraktijk_(p, veld, i, waarde, el) {
    if (veld === "ot_open") {
      p.openingstijden ??= {};
      p.openingstijden[i] = waarde ? [["08:00", "17:00"]] : [];
      const rij = el.closest(".ot-tabel");
      for (const inp of rij.querySelectorAll(`input[type="time"][data-i="${i}"]`)) {
        inp.disabled = !waarde;
        const [, n, k] = inp.dataset.veld.split("_");
        inp.value = p.openingstijden[i][Number(n)]?.[Number(k)] ?? "";
      }
      const lbl = el.closest(".vink")?.querySelector(".vl");
      if (lbl) lbl.textContent = waarde ? "open" : "gesloten";
    } else if (veld.startsWith("ot_")) {
      const [, n, k] = veld.split("_").map(Number);
      p.openingstijden ??= {};
      const vakken = p.openingstijden[i] ?? [];
      while (vakken.length <= n) vakken.push(["", ""]);
      vakken[n][k] = waarde;
      // Een leeg tweede vak telt niet mee.
      p.openingstijden[i] = vakken.filter((v, idx) => idx === 0 || (v[0] && v[1]));
      if (!p.openingstijden[i].length) p.openingstijden[i] = [["", ""]];
    } else if (veld.startsWith("u_")) {
      const u = p.uitzonderingen[Number(i)];
      if (!u) return;
      const naam = veld.slice(2);
      if (naam === "open") {
        u.tijden = waarde ? [["08:00", "17:00"]] : [];
        const item = el.closest(".item");
        for (const inp of item.querySelectorAll('input[type="time"]')) {
          inp.disabled = !waarde;
          inp.value = waarde ? (inp.dataset.veld === "u_van" ? "08:00" : "17:00") : "";
        }
        const lbl = el.closest(".vink")?.querySelector(".vl");
        if (lbl) lbl.textContent = waarde ? "open" : "gesloten";
      } else if (naam === "van" || naam === "tot") {
        u.tijden = [[naam === "van" ? waarde : u.tijden?.[0]?.[0] ?? "", naam === "tot" ? waarde : u.tijden?.[0]?.[1] ?? ""]];
      } else {
        u[naam] = waarde;
      }
    } else {
      p[veld] = waarde;
    }
  }

  /* ------------------------------------------------------------ de indeling */

  blokToevoegen_(soort, select) {
    if (select) select.value = "";
    const info = BLOK_INFO[soort];
    if (!info) return;
    const w = this.werk_.indeling ?? (this.werk_.indeling = { blokken: [] });
    if (w.blokken.some((b) => b.soort === soort)) return;
    let [bw, bh] = info.maat;
    let plek = vrijePlek(w.blokken, bw, bh);
    // Past de gewenste maat niet, dan kleiner; past 1x1 ook niet, dan is het vol.
    while (!plek && (bw > 1 || bh > 1)) {
      if (bh > 1) bh -= 1;
      else bw -= 1;
      plek = vrijePlek(w.blokken, bw, bh);
    }
    if (!plek) {
      this.meldingen_.indeling = { tekst: "Er is geen plek meer. Maak eerst een ander blok kleiner of haal er een weg.", fout: true };
      return this.teken_("indeling", true);
    }
    w.blokken.push({
      id: `b-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
      soort,
      x: plek.x,
      y: plek.y,
      w: bw,
      h: bh,
      aantal: info.aantal ? 3 : 0,
    });
    this.markeer_("indeling", "indeling");
    return this.teken_("indeling", true);
  }

  /**
   * Een rij in een lijst verslepen aan zijn greep. De rij volgt de vinger
   * door telkens vóór de rij te springen waar de vinger boven de helft van
   * staat; bij het loslaten wordt de werkkopie in die volgorde gezet.
   */
  sleepLijst_(e, greep) {
    const item = greep.closest(".item");
    const lijst = item?.parentElement;
    const blok = item?.closest(".blok")?.dataset.blok;
    if (!item || !lijst || !blok) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const sectie = this.blokInfo_(blok).secties[0];
    // De meeste lijsten zijn de sectie zelf (personen); de lampen zijn een
    // lijst IN de installatie, en dat zegt `data-lijst` op de rij.
    const w = item.dataset.lijst ? this.werk_[sectie]?.[item.dataset.lijst] : this.werk_[sectie];
    const van = Number(item.dataset.i);
    if (!Array.isArray(w) || !w[van]) return;

    e.preventDefault();
    item.classList.add("sleept");

    // De luisteraars staan op window en NIET op de greep met pointer capture:
    // de rij wordt tijdens het slepen in de DOM verplaatst, en Chrome laat
    // de capture los zodra het element uit het document gaat. Gemeten op
    // 10 september 2026: de rij sprong één plek en bleef daarna "hangen",
    // zonder pointerup en zonder opslaan.
    const beweeg = (ev) => {
      const anderen = [...lijst.children].filter((x) => x !== item);
      let doel = null;
      for (const ander of anderen) {
        const r = ander.getBoundingClientRect();
        if (ev.clientY < r.top + r.height / 2) {
          doel = ander;
          break;
        }
      }
      if (item.nextElementSibling !== doel && item !== doel) lijst.insertBefore(item, doel);
    };
    const klaar = () => {
      window.removeEventListener("pointermove", beweeg, true);
      window.removeEventListener("pointerup", klaar, true);
      window.removeEventListener("pointercancel", klaar, true);
      item.classList.remove("sleept");
      const naar = [...lijst.children].indexOf(item);
      if (naar !== van && naar >= 0) {
        const [rij] = w.splice(van, 1);
        w.splice(naar, 0, rij);
        this.markeer_(sectie, blok);
      }
      this.teken_(blok, true);
    };
    window.addEventListener("pointermove", beweeg, true);
    window.addEventListener("pointerup", klaar, true);
    window.addEventListener("pointercancel", klaar, true);
    this.teardown_.push(klaar);
  }

  /** Slepen en de maat wijzigen, met echte pointer-events en pointer capture. */
  sleepStart_(e) {
    const greep = e.target.closest?.(".greep");
    if (greep) return this.sleepLijst_(e, greep);
    const ib = e.target.closest?.(".ib");
    if (!ib || e.target.closest("button, input, select")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const raster = ib.closest(".raster");
    const w = this.werk_.indeling;
    const blok = w?.blokken?.find((b) => b.id === ib.dataset.id);
    if (!blok || !raster) return;
    const modus = e.target.closest(".ib-greep") ? "maat" : "plaats";
    const r = raster.getBoundingClientRect();
    const celW = r.width / KOLOMMEN;
    const celH = r.height / RIJEN;
    const start = { x: e.clientX, y: e.clientY };
    let kandidaat = { ...blok };
    let bewogen = false;

    e.preventDefault();
    try { ib.setPointerCapture(e.pointerId); } catch { /* geen capture: dan gewoon doorgaan */ }
    ib.classList.add("sleept");

    // Twee blokken van dezelfde maat mogen van plek ruilen: laat je het
    // ene precies op het andere los, dan gaat dat andere naar de plek waar
    // dit vandaan kwam. Gevraagd op 10 september 2026: "als een blok even
    // groot is en ik zet hem over het andere blok moeten ze swappen."
    const ruilpartner = (kand) => {
      if (modus !== "plaats") return null;
      const rakend = w.blokken.filter((b) => b.id !== kand.id && overlapt(b, kand));
      if (rakend.length !== 1) return null;
      const ander = rakend[0];
      return ander.w === kand.w && ander.h === kand.h && ander.x === kand.x && ander.y === kand.y ? ander : null;
    };
    const beweeg = (ev) => {
      const dx = Math.round((ev.clientX - start.x) / celW);
      const dy = Math.round((ev.clientY - start.y) / celH);
      if (dx || dy) bewogen = true;
      kandidaat =
        modus === "plaats"
          ? { ...blok, x: klem(blok.x + dx, 0, KOLOMMEN - blok.w), y: klem(blok.y + dy, 0, RIJEN - blok.h) }
          : { ...blok, w: klem(blok.w + dx, 1, KOLOMMEN - blok.x), h: klem(blok.h + dy, 1, RIJEN - blok.y) };
      ib.classList.toggle("ongeldig", !pastVrij(w.blokken, kandidaat) && !ruilpartner(kandidaat));
      ib.style.cssText = this.ibStijl_(kandidaat);
    };
    const klaar = () => {
      ib.removeEventListener("pointermove", beweeg);
      ib.removeEventListener("pointerup", klaar);
      ib.removeEventListener("pointercancel", klaar);
      ib.classList.remove("sleept", "ongeldig");
      const anders = kandidaat.x !== blok.x || kandidaat.y !== blok.y || kandidaat.w !== blok.w || kandidaat.h !== blok.h;
      const ander = bewogen && anders ? ruilpartner(kandidaat) : null;
      if (ander) {
        Object.assign(ander, { x: blok.x, y: blok.y });
        Object.assign(blok, { x: kandidaat.x, y: kandidaat.y });
        this.markeer_("indeling", "indeling");
      } else if (bewogen && anders && pastVrij(w.blokken, kandidaat)) {
        Object.assign(blok, kandidaat);
        this.markeer_("indeling", "indeling");
      }
      this.teken_("indeling", true);
    };
    ib.addEventListener("pointermove", beweeg);
    ib.addEventListener("pointerup", klaar);
    ib.addEventListener("pointercancel", klaar);
  }

  /* ------------------------------------------------------------ klikken */

  async klik_(e) {
    const bk = e.target.closest(".bk");
    if (bk) {
      const blok = bk.closest(".blok").dataset.blok;
      this.open_ = this.open_ === blok ? null : blok;
      for (const sec of this.$$(".blok")) sec.classList.toggle("open", sec.dataset.blok === this.open_);
      if (this.open_ && this.uitgesteld_.has(this.open_)) this.teken_(this.open_, true);
      return;
    }
    const knop = e.target.closest("[data-actie]");
    if (!knop || knop.disabled || knop.tagName === "SELECT") return;
    const blok = knop.closest(".blok")?.dataset.blok;
    const actie = knop.dataset.actie;

    if (actie === "segment") {
      // Een knop in een keuzegroep: de groep krijgt de waarde en gaat
      // dezelfde weg als een keuzelijst (zie invoer_).
      const groep = knop.closest(".segment");
      for (const b of groep.querySelectorAll("button")) {
        b.classList.toggle("aan", b === knop);
        b.setAttribute("aria-checked", String(b === knop));
      }
      groep.value = knop.dataset.waarde;
      return this.invoer_({ target: groep, type: "change" });
    }
    if (actie === "r_boek") return this.boekRuimte_();
    if (actie === "r_nieuw") return this.maakRuimte_();
    if (actie === "r_weg") return this.haalRuimteWeg_(knop);
    if (actie === "r_vrij") return this.geefVrij_(knop);
    const i = Number(knop.dataset.i);
    const info = this.blokInfo_(blok);
    const sectie = info?.secties[0];
    const w = this.werk_[sectie];

    if (actie === "nieuw") {
      const leeg = { personen: { naam: "", functie: "", aanwezig: false }, mededelingen: { tekst: "" }, verjaardagen: { naam: "", datum: "", jaar_tonen: true } }[sectie];
      w.push(leeg);
      this.teken_(blok, true);
      this.$(`.blok[data-blok="${blok}"] .item:last-of-type input[type="text"], .blok[data-blok="${blok}"] .item:last-of-type textarea`)?.focus();
      return;
    }
    if (actie === "verwijder") {
      const item = w[i];
      const naam = item?.naam || item?.titel || item?.tekst || "dit item";
      if (item && (item.id || item.naam || item.titel || item.tekst)) {
        const ja = await vraagBevestiging({ title: "Verwijderen?", text: `"${naam}" verdwijnt meteen van het scherm.`, confirmText: "Verwijderen" });
        if (!ja) return;
      }
      w.splice(i, 1);
      this.markeer_(sectie, blok);
      return this.teken_(blok, true);
    }
    if (actie === "foto" || actie === "logo") {
      this.doel_ = actie === "logo" ? { sectie: "scherm", blok, veld: "logo" } : { sectie, blok, i, veld: "foto" };
      const file = this.$(".file");
      file.value = "";
      file.click();
      return;
    }
    if (actie === "fotoweg" || actie === "logoweg") {
      if (actie === "logoweg") {
        this.werk_.scherm.logo = null;
        this.markeer_("scherm", blok);
      } else {
        w[i].foto = null;
        this.markeer_(sectie, blok);
      }
      return this.teken_(blok, true);
    }
    if (actie === "u_nieuw") {
      w.uitzonderingen ??= [];
      w.uitzonderingen.push({ datum: "", tijden: [], reden: "" });
      return this.teken_(blok, true);
    }
    if (actie === "u_verwijder") {
      w.uitzonderingen.splice(i, 1);
      this.markeer_(sectie, blok);
      return this.teken_(blok, true);
    }
    if (actie === "f_nieuw") {
      const inst = this.werk_.instellingen;
      inst.feeds ??= [];
      inst.feeds.push({ naam: "", url: "" });
      return this.teken_(blok, true);
    }
    if (actie === "f_verwijder") {
      this.werk_.instellingen.feeds.splice(i, 1);
      this.markeer_("instellingen", blok);
      return this.teken_(blok, true);
    }
    if (actie === "f_ververs") {
      knop.disabled = true;
      try {
        const r = await ververFeeds(this.hass);
        this.feedFouten_ = r.feed_fouten ?? {};
        this.meldingen_[blok] = { tekst: `${(r.feeds ?? []).length} bericht(en) opgehaald.` };
      } catch (fout) {
        this.meldingen_[blok] = { tekst: fout?.message ?? "Ophalen lukte niet.", fout: true };
      }
      return this.teken_(blok, true);
    }
    if (actie === "blok_weg" || actie === "aantal_min" || actie === "aantal_plus") {
      const ind = this.werk_.indeling;
      const b = ind?.blokken?.find((x) => x.id === knop.dataset.id);
      if (!b) return;
      if (actie === "blok_weg") ind.blokken = ind.blokken.filter((x) => x !== b);
      else if (actie === "aantal_min") b.aantal = b.aantal <= 1 ? 0 : b.aantal - 1;
      else b.aantal = Math.min(50, (b.aantal || 0) + 1);
      this.markeer_("indeling", "indeling");
      return this.teken_("indeling", true);
    }
    if (actie === "indeling_standaard") {
      const ja = await vraagBevestiging({ title: "Standaardindeling?", text: "De blokken gaan terug naar hun oorspronkelijke plek en maat.", confirmText: "Terugzetten" });
      if (!ja) return;
      this.werk_.indeling = standaardIndeling();
      this.markeer_("indeling", "indeling");
      return this.teken_("indeling", true);
    }
    return undefined;
  }

  async bestandGekozen_(e) {
    const bestand = e.target.files?.[0];
    const doel = this.doel_;
    this.doel_ = null;
    if (!bestand || !doel) return;
    const { sectie, blok, i, veld } = doel;
    this.meldingen_[blok] = { tekst: "Bezig met uploaden…" };
    this.teken_(blok, true);
    try {
      // Een logo verliest eerst zijn doorzichtige rand (zie infoscherm-logo.js).
      const { bestand: klaar, bijgesneden } = veld === "logo" ? await snijLogoBij(bestand) : { bestand, bijgesneden: false };
      const meta = await upload(this.hass, klaar);
      const w = this.werk_[sectie];
      const houder = i === undefined ? w : w[i];
      const oud = houder[veld];
      houder[veld] = meta.id;
      // Het oude bestand hangt nergens meer aan zodra dit is opgeslagen; nu al
      // vergeten in de cache is genoeg, de server ruimt het op bij opslaan.
      if (oud) this.oudeBestanden_ = [...(this.oudeBestanden_ ?? []), oud];
      // Eerst markeren, dan de melding: markeer_ wist de melding van het blok,
      // en tot 0.61.0 stond het andersom, zodat "geüpload" nooit te zien was.
      this.markeer_(sectie, blok);
      this.meldingen_[blok] = { tekst: `${meta.naam || "Bestand"} geüpload.${bijgesneden ? " De lege rand eromheen is weggesneden." : ""}` };
    } catch (fout) {
      this.meldingen_[blok] = { tekst: fout?.message ?? "Uploaden lukte niet.", fout: true };
    }
    this.teken_(blok, true);
  }

  /* ------------------------------------------------------------ ruimtes */

  /** Het formulier naar de agenda van de ruimte, via de server. */
  async boekRuimte_() {
    const f = this.boekForm_;
    const nagekeken = controleerFormulier(f);
    const meld = (tekst, fout = false) => {
      this.meldingen_.ruimtes = { tekst, fout };
      this.teken_("ruimtes", true);
    };
    if (nagekeken.fout) return meld(nagekeken.fout, true);
    try {
      await boekRuimte(this.hass, { ruimte: f.ruimte, start: nagekeken.start, eind: nagekeken.eind, omschrijving: (f.omschrijving ?? "").trim() });
    } catch (fout) {
      return meld(fout?.message ?? "Boeken lukte niet.", true);
    }
    const r = (this.werk_.installatie?.ruimtes ?? []).find((x) => x.entity === f.ruimte);
    const naam = r?.naam || this.hass?.states?.[f.ruimte]?.attributes?.friendly_name || f.ruimte;
    this.boekForm_ = { ruimte: f.ruimte, datum: f.datum };
    return meld(`${naam} is geboekt, ${f.van} tot ${f.tot}.`);
  }

  /** Een ruimte maken: de server maakt er een Lokale agenda bij. */
  async maakRuimte_() {
    const naam = (this.nieuweRuimte_ ?? "").trim();
    const meld = (tekst, fout = false) => {
      this.ruimteMelding_ = { tekst, fout };
      this.teken_("ruimtes", true);
    };
    if (!naam) return meld("Geef de ruimte een naam.", true);
    if (this.ruimteBezig_) return undefined;
    this.ruimteBezig_ = true;
    meld(`${naam} wordt aangemaakt…`);
    try {
      const r = await nieuweRuimte(this.hass, naam);
      this.nieuweRuimte_ = "";
      meld(r.gemaakt ? `${naam} staat erbij, met een eigen agenda.` : `Er was al een agenda ${naam}; die staat er nu bij.`);
    } catch (fout) {
      meld(fout?.message ?? "Dat lukte niet.", true);
    } finally {
      this.ruimteBezig_ = false;
    }
    return undefined;
  }

  /** Een ruimte die het beheer maakte weghalen, met zijn agenda. */
  async haalRuimteWeg_(knop) {
    const entity = knop.dataset.ruimte;
    const r = (this.werk_.installatie?.ruimtes ?? []).find((x) => x.entity === entity);
    const naam = r?.naam || this.hass?.states?.[entity]?.attributes?.friendly_name || entity;
    const ja = await vraagBevestiging({
      title: `${naam} weghalen?`,
      text: "De ruimte verdwijnt van het scherm, en zijn agenda verdwijnt uit Home Assistant, met alle boekingen erin.",
      confirmText: "Weghalen",
    });
    if (!ja) return;
    try {
      await ruimteWeg(this.hass, entity);
      this.ruimteMelding_ = { tekst: `${naam} is weggehaald.`, fout: false };
    } catch (fout) {
      this.ruimteMelding_ = { tekst: fout?.message ?? "Weghalen lukte niet.", fout: true };
    }
    this.teken_("ruimtes", true);
  }

  async geefVrij_(knop) {
    const { ruimte, uid, rid } = knop.dataset;
    const rij = knop.closest(".item");
    const wat = [...(rij?.querySelectorAll(".r-tijd, .r-ruimte") ?? [])].map((x) => x.textContent).join(", ");
    const ja = await vraagBevestiging({ title: "Vrijgeven?", text: `De boeking ${wat} verdwijnt uit de agenda.`, confirmText: "Vrijgeven" });
    if (!ja) return;
    try {
      await geefRuimteVrij(this.hass, { ruimte, uid, recurrence_id: rid || null });
      this.meldingen_.ruimtes = { tekst: "Vrijgegeven.", fout: false };
    } catch (fout) {
      this.meldingen_.ruimtes = { tekst: fout?.message ?? "Vrijgeven lukte niet.", fout: true };
    }
    this.teken_("ruimtes", true);
  }

  /* ------------------------------------------------------------ opslaan */

  /** Wat er naar de server gaat: zonder lege rijen en zonder werkvelden. */
  payload_(sectie) {
    const w = this.werk_[sectie];
    switch (sectie) {
      case "personen":
        return (w ?? [])
          .filter((p) => p.naam?.trim())
          .map(({ _aanwezig, aanwezig, ...p }) => (_aanwezig ? { ...p, aanwezig } : p));
      case "mededelingen":
        return (w ?? []).filter((m) => m.tekst?.trim());
      case "verjaardagen":
        return (w ?? []).filter((v) => v.naam?.trim() && v.datum);
      case "praktijk":
        return {
          openingstijden: Object.fromEntries(DAGEN.map((d) => [d, (w.openingstijden?.[d] ?? []).filter((v) => v[0] && v[1])])),
          uitzonderingen: (w.uitzonderingen ?? []).filter((u) => u.datum).map((u) => ({ ...u, tijden: (u.tijden ?? []).filter((v) => v[0] && v[1]) })),
        };
      case "instellingen":
        return { ...w, feeds: (w.feeds ?? []).filter((f) => f.url?.trim()) };
      default:
        return w;
    }
  }

  async bewaar_(sectie) {
    if (!this.hass || this.bezig_.has(sectie)) {
      // Onderweg: zodra dat klaar is komt deze wijziging mee (zie hieronder).
      return;
    }
    const versie = this.versie_[sectie] ?? 0;
    this.bezig_.add(sectie);
    this.status_("Opslaan…", "bezig");
    try {
      // De code heeft een eigen commando: hij staat niet in de stand.
      const r = sectie === "code" ? await zetRuimteCode(this.hass, this.werk_.code ?? "") : await bewaar(this.hass, sectie, this.payload_(sectie));
      const resultaat = r[sectie];
      this.koppel_(sectie, resultaat);
      if (this.stand_) this.stand_[sectie] = kloon(resultaat);
      this.fouten_[sectie] = null;
      if ((this.versie_[sectie] ?? 0) === versie) this.vuil_.delete(sectie);
      const nu = new Date();
      this.laatstOpgeslagen_ = `${String(nu.getHours()).padStart(2, "0")}:${String(nu.getMinutes()).padStart(2, "0")}`;
      // Bestanden die door een nieuw bestand vervangen zijn mogen weg.
      for (const oud of this.oudeBestanden_ ?? []) {
        if (!this.inGebruik_(oud)) {
          verwijderBestand(this.hass, oud).catch(() => {});
          vergeetBestand(oud);
        }
      }
      this.oudeBestanden_ = [];
    } catch (fout) {
      this.fouten_[sectie] = fout?.message ?? "Opslaan lukte niet.";
    } finally {
      this.bezig_.delete(sectie);
    }
    // Is er intussen verder getypt, dan nog een keer.
    if (this.vuil_.has(sectie) && (this.versie_[sectie] ?? 0) !== versie && !this.fouten_[sectie]) {
      clearTimeout(this.timers_[sectie]);
      this.timers_[sectie] = setTimeout(() => this.bewaar_(sectie), ADEMPAUZE_KNOP);
    }
    for (const b of BLOKKEN) if (b.secties.includes(sectie)) this.tel_(b.key);
    // Andere blokken die dit onderdeel tonen (de lampnamen na een vinkje in
    // Installatie, bijvoorbeeld) mogen nu bijgetekend worden; het blok waar
    // de wijziging vandaan kwam blijft met rust.
    if (!this.fouten_[sectie]) {
      for (const b of BLOKKEN) if (b.secties.includes(sectie) && b.key !== this.bron_?.[sectie]) this.teken_(b.key);
    }
    if (this.fouten_[sectie]) {
      this.status_(`Niet opgeslagen: ${this.fouten_[sectie]}`, "fout");
      for (const b of BLOKKEN) if (b.secties.includes(sectie)) this.teken_(b.key);
    } else if (!this.bezig_.size && !this.vuil_.size) {
      this.status_(`Opgeslagen ${this.laatstOpgeslagen_}`, "ok");
    }
  }

  /**
   * De ID's (en initialen) die de server uitdeelde terug in de werkkopie,
   * zonder te hertekenen. De server geeft de lijst in dezelfde volgorde
   * terug als hij gestuurd is; alleen de rijen zonder naam zijn er niet in.
   */
  koppel_(sectie, resultaat) {
    const w = this.werk_[sectie];
    if (!Array.isArray(w) || !Array.isArray(resultaat)) return;
    const vol = { personen: (p) => p.naam?.trim(), mededelingen: (m) => m.tekst?.trim(), verjaardagen: (v) => v.naam?.trim() && v.datum }[sectie];
    if (!vol) return;
    let k = 0;
    w.forEach((item, i) => {
      if (!vol(item)) return;
      const van = resultaat[k];
      k += 1;
      if (!van) return;
      item.id = van.id;
      if (sectie === "personen") {
        item.initialen = van.initialen;
        if (item._aanwezig) delete item._aanwezig;
      }
      const rij = this.$(`.blok[data-blok="${sectie}"] .item[data-i="${i}"]`);
      if (rij) rij.dataset.id = van.id;
    });
  }

  inGebruik_(id) {
    const s = this.stand_ ?? {};
    return (
      s.scherm?.logo === id ||
      (s.personen ?? []).some((p) => p.foto === id) ||
      (this.werk_.personen ?? []).some((p) => p.foto === id) ||
      this.werk_.scherm?.logo === id
    );
  }
}

/* ------------------------------------------------------------ editor */

const LABELS = {
  title: "Titel",
  weather: "Weerentiteit",
  energy: "Energiesensor (vermogen of tellerstand)",
  lights: "Lampen en schakelaars op het scherm",
  climates: "Airco's op het scherm",
  rooms: "Ruimtes om te boeken (een agenda per ruimte)",
  wifi: "Wifi voor gasten (de QR-code)",
  calendars: "Agenda's (de afspraken van vandaag)",
  kiosk_users: "Kioskaccounts",
  show_personen: "Blok Medewerkers",
  show_mededelingen: "Blok Mededelingen",
  show_verjaardagen: "Blok Verjaardagen",
  show_praktijk: "Blok Openingstijden",
  show_indeling: "Blok Indeling",
  show_verlichting: "Blok Verlichting",
  show_klimaat: "Blok Klimaat",
  show_ruimtes: "Blok Ruimtes",
  show_wifi: "Blok Wifi voor gasten",
  show_instellingen: "Blok Instellingen en logo",
};

const HELPERS = {
  weather: "Leeg = geen weer op het scherm.",
  energy:
    "Het blok Energie: een vermogenssensor (W of kW) geeft een live lijn van de afgelopen 24 uur; een tellerstand (kWh) het verbruik per uur. Leeg = geen energie op het scherm.",
  lights: "De namen en de volgorde op het scherm stelt de receptie in het blok Verlichting in; daar staat ook de schakelaar om ze te tonen. Een nieuwe lamp komt achteraan.",
  climates:
    "Elke climate-entiteit: een airco, maar ook een warmtepomp of een thermostaat. Op het scherm de temperatuur in de ruimte en wat er ingesteld is, en op de pagina erachter bedienen. Namen, volgorde, tonen en bedienen stelt de receptie in het blok Klimaat in.",
  rooms:
    "Meestal hoeft hier niets: de receptie maakt de ruimtes zelf in het beheer (blok Ruimtes, Nieuwe ruimte), en dat maakt er een Lokale agenda bij. Kies hier alleen een agenda die er al is, bijvoorbeeld een van Outlook of Google die boekingen aanneemt. Op het scherm staat alleen vrij of bezet.",
  wifi:
    "Bij UniFi Network de entiteit QR-code van het GASTnetwerk. Die staat standaard uit (en is er alleen met een beheerdersaccount in UniFi): zet hem aan bij de entiteiten van het netwerk. Kies niet het gewone netwerk: wie de code scant, heeft het wachtwoord.",
  kiosk_users:
    "Het account waarmee de iPad is ingelogd. Zo'n account mag alleen aanwezigheid omzetten en lampen en airco's bedienen, en niets beheren. Alleen een beheerder ziet deze lijst.",
  show_instellingen:
    "Logo, accent, uiterlijk, het welkomblok en de nieuwsbronnen. Zet dit blok uit op een dashboard voor een receptie die daar niet aan hoeft te zitten.",
};

/**
 * Bovenaan de installatie (wat een installateur eenmalig kiest), daaronder
 * de kaart zelf. De kioskaccounts komen als keuzelijst uit de
 * gebruikerslijst van Home Assistant, opgehaald zodra de editor een `hass`
 * heeft; een gewone gebruiker mag die lijst niet opvragen en ziet het veld
 * dan niet.
 *
 * Staat er in de config nog niets van de installatie (na de update van
 * 0.39.0, waar hij in het infoscherm stond), dan komt wat er in de opslag
 * staat als beginwaarde in het formulier: zo hoeft niemand alles opnieuw te
 * kiezen, en zodra er iets wijzigt gaat het geheel mee de config in.
 */
export class InfoschermBeheerEditor extends DacEditor {
  defaults() {
    return { ...STANDAARD };
  }

  setConfig(config) {
    this.ruwLeeg_ = !INSTALLATIE_VELDEN.some((k) => config?.[k] !== undefined);
    super.setConfig(config);
    this.zaai_();
  }

  set hass(hass) {
    super.hass = hass;
    if (this.gebruikers_ === undefined && hass?.connection && hass.user?.is_admin) {
      this.gebruikers_ = null;
      haalGebruikers(hass)
        .then((g) => {
          this.gebruikers_ = (g.gebruikers ?? []).map((u) => ({ value: u.id, label: `${u.naam}${u.is_admin ? " (beheerder)" : ""}` }));
          this.sync_();
        })
        .catch(() => {
          this.gebruikers_ = [];
        });
    }
    if (this.zaad_ === undefined && hass?.connection) {
      this.zaad_ = null;
      haalStand(hass)
        .then((r) => {
          const i = r.stand?.installatie ?? {};
          this.zaad_ = {
            weather: i.weer ?? "",
            energy: i.energie ?? "",
            lights: (i.verlichting ?? []).map((l) => l.entity),
            climates: (i.klimaat ?? []).map((a) => a.entity),
            rooms: (i.ruimtes ?? []).map((r) => r.entity),
            wifi: i.wifi ?? "",
            calendars: i.agendas ?? [],
            kiosk_users: r.stand?.instellingen?.kiosk_gebruikers ?? [],
          };
          this.zaai_();
        })
        .catch(() => {
          this.zaad_ = {};
        });
    }
  }

  get hass() {
    return super.hass;
  }

  /** De opslag als beginwaarde, alleen als de config zelf nog leeg is. */
  zaai_() {
    if (!this.zaad_ || !this.ruwLeeg_ || this.gezaaid_) return;
    this.gezaaid_ = true;
    this.config_ = { ...this.config_, ...this.zaad_ };
    this.sync_();
  }

  schema() {
    const installatie = [
      { name: "weather", selector: sel.entity("weather") },
      { name: "energy", selector: sel.entity("sensor") },
      { name: "lights", selector: { entity: { multiple: true, domain: ["light", "switch"] } } },
      { name: "climates", selector: { entity: { multiple: true, domain: "climate" } } },
      { name: "rooms", selector: { entity: { multiple: true, domain: "calendar" } } },
      { name: "wifi", selector: sel.entity("image") },
      { name: "calendars", selector: { entity: { multiple: true, domain: "calendar" } } },
      { name: "waste", selector: { entity: { multiple: true, domain: "sensor" } } },
    ];
    if (this.gebruikers_?.length) {
      installatie.push({ name: "kiosk_users", selector: { select: { multiple: true, mode: "list", options: this.gebruikers_ } } });
    }
    return [
      ...installatie,
      { name: "title", selector: sel.text() },
      ...BLOKKEN.map((b) => ({ name: `show_${b.key}`, selector: sel.bool() })),
    ];
  }

  label(item) {
    return LABELS[item.name] ?? super.label(item);
  }

  helper(item) {
    return HELPERS[item.name];
  }
}

registerCard(TAG, InfoschermBeheerCard, {
  name: "DomotiApp Infoscherm Beheer",
  description:
    "Voor de receptie: medewerkers, mededelingen, verjaardagen, openingstijden, de indeling van het scherm en het logo. Alles wordt vanzelf opgeslagen en staat meteen op het scherm. De installateur kiest hier ook het weer, de energiesensor, de lampen, de agenda's en het kioskaccount.",
  preview: false,
});
registerEditor(`${TAG}-editor`, InfoschermBeheerEditor);
InfoschermBeheerCard.getConfigElement = () => document.createElement(`${TAG}-editor`);
InfoschermBeheerCard.getStubConfig = () => ({ title: "Infoscherm" });
