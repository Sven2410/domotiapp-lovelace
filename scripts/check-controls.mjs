/**
 * Bewaakt dat een native formuliercontrol met `width: 100%` een EIGEN
 * achtergrondkleur houdt (fase 12).
 *
 * ## Waarom dit een script is en geen test
 *
 * Opmaak bestaat pas als een echte browser een echte cascade toepast, en
 * CLAUDE.md verbiedt jsdom. Een unittest kan deze fout dus niet vangen. Wat wél
 * kan is bewaken dat de regel in de bron staat — precies zoals
 * `check-registratie.mjs` de registratieregel bewaakt zonder een browser te
 * starten (valkuil 1). Het is een zwakkere garantie dan een meting, en daarom
 * staat hier ook wat het NIET bewijst: dat de kleuren leesbaar zijn. Dat is in
 * fase 12 in de browser gemeten en staat in docs/fase-12/RAPPORT.md.
 *
 * ## Wat het vangt
 *
 * Fase 10 verhuisde rand en padding van de control naar een wrapper en zette
 * `background: transparent` op de control. Voor een `input` klopt dat. Voor een
 * `select` niet: de browser tekent het UITKLAPPANEEL met de achtergrondkleur van
 * de select zelf, en dat paneel valt buiten onze shadow root. Transparant
 * betekent daar "val terug op wit", en met de lichte tekst van een donker thema
 * werd de lijst onleesbaar. Dat is een release lang onopgemerkt gebleven omdat
 * niemand de dropdown had uitgeklapt.
 *
 * ## Waarom er sinds 25 augustus 2026 twee bestanden bewaakt worden
 *
 * De entiteitenkaart kreeg een keuzelijst op de regel zelf, voor een
 * `input_select`. Die staat niet in een `.vak` — dat is een vorm van de
 * wekkereditor — maar de fout van fase 12 is er precies dezelfde. Een bewaker
 * die alleen naar één bestand kijkt, mist hem op de volgende plek waar iemand
 * een select neerzet. Dat is deze plek geworden.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const WORTEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const EDITOR = join(WORTEL, "src", "alarm", "editor.js");

const bron = readFileSync(EDITOR, "utf8");
const fouten = [];

// 1. Elke select in de editor hoort in een .vak te staan (de eis van fase 10).
const selects = (bron.match(/<select\b/g) ?? []).length;
const vakken = (bron.match(/class="vak[^"]*"[\s\S]{0,120}?<select\b/g) ?? []).length;
if (selects === 0) {
  fouten.push("geen enkele <select> gevonden — is de editor verbouwd?");
} else if (vakken !== selects) {
  fouten.push(
    `${selects} <select> gevonden maar ${vakken} met een .vak eromheen; ` +
      "een control zonder vak krijgt zijn padding en rand weer zelf (fase 10)",
  );
}

// 2. De select en zijn opties hebben een EIGEN achtergrondkleur, en die is niet
//    transparant. Dit is de regel die in fase 12 is toegevoegd.
const eisen = [
  [/\.vak select\s*\{[^}]*background-color:\s*var\(/, ".vak select mist een eigen background-color"],
  [/\.vak select option\s*\{[^}]*background-color:\s*var\(/, ".vak select option mist een eigen background-color"],
  [/\.vak select option:checked\s*\{[^}]*background-color:/, ".vak select option:checked mist een markering"],
];
for (const [patroon, boodschap] of eisen) {
  if (!patroon.test(bron)) fouten.push(boodschap);
}

// 3. En nergens mag een select transparant gezet worden.
if (/\.vak select[^{]*\{[^}]*background(-color)?:\s*transparent/.test(bron)) {
  fouten.push("een .vak select staat op background transparent — dat is de fout van fase 12");
}

// 4. Dezelfde eis voor elke keuzelijst op een kaart. Zie de kop.
//
//    De lijst hieronder is geen opsomming van wat er nu is maar van wat er
//    bewaakt moet worden: elk bestand dat een `.keuze` tekent hoort erin. Zet
//    iemand er een select bij zonder dit bestand aan te vullen, dan is dat de
//    volgende plek waar de fout van fase 12 terugkomt.
const KAARTEN = ["entities-card.js", "dishwasher-card.js"];
let keuzelijsten = 0;

for (const naam of KAARTEN) {
  const bron2 = readFileSync(join(WORTEL, "src", "cards", naam), "utf8");
  if (!/<select\b/.test(bron2) && !/\.keuze\s*\{/.test(bron2)) continue;
  keuzelijsten++;
  const kaartEisen = [
    [/\.keuze\s*\{[^}]*background-color:\s*var\(/, ".keuze mist een eigen background-color"],
    [/\.keuze option\s*\{[^}]*background-color:\s*var\(/, ".keuze option mist een eigen background-color"],
    [/\.keuze option:checked\s*\{[^}]*background-color:/, ".keuze option:checked mist een markering"],
  ];
  for (const [patroon, boodschap] of kaartEisen) {
    if (!patroon.test(bron2)) fouten.push(`${naam}: ${boodschap}`);
  }
  if (/\.keuze[^{]*\{[^}]*background(-color)?:\s*transparent/.test(bron2)) {
    fouten.push(`${naam}: .keuze staat op background transparent — de fout van fase 12`);
  }
}

if (fouten.length > 0) {
  console.error("FOUT in de opmaak van de formuliercontrols:");
  for (const f of fouten) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `OK: ${selects} select(s) in de wekkereditor, elk in een .vak` +
    (keuzelijsten ? `, plus ${keuzelijsten} keuzelijst(en) op kaarten` : "") +
    ", allemaal met een eigen achtergrondkleur en een markering.",
);
