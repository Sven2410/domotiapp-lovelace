/**
 * Twee bewakers op de CSS van de kaarten.
 *
 * 1. Elke `:hover`-regel op een kaart staat achter `@media (hover: hover)`.
 * 2. Geen enkel sjabloonliteral wordt halverwege een CSS-commentaar afgesloten.
 *
 * De tweede staat onderaan dit bestand en heeft daar zijn eigen uitleg. Hier
 * eerst de hover.
 *
 * ---------------------------------------------------------------------------
 *
 * Bewaakt dat elke `:hover`-regel op een KAART achter `@media (hover: hover)`
 * staat.
 *
 * ## Waarom dit een bewaker is en geen smaakregel
 *
 * Een telefoon heeft geen muis, maar Chrome en Safari op Android en iOS passen
 * `:hover` wél toe op wat je aantikt -- en laten het daarna staan tot je ergens
 * anders tikt. Tik je op een knop die een pop-up opent, dan sluit je die pop-up
 * en blijft de knop erachter oplichten. Dat leest als "deze staat aan": op de
 * navbalk als de pagina waar je bent, op een kamerknop als een kamer die
 * geselecteerd is. De eigenaar meldde het op 26 augustus 2026 met twee
 * schermafdrukken -- eerst op een knop van zijn dashboard, daarna op de
 * navbalk, en met de zin "dat is bij iedere knop".
 *
 * `@media (hover: hover)` is het enige middel dat werkt. Focus wegnemen na een
 * tik helpt niet: het gaat niet om focus. De hover-stand van een aanraakscherm
 * is er niet met JavaScript af te halen.
 *
 * ## Wat dit NIET bewijst
 *
 * Dat de kaart er goed uitziet met een muis. Dat de regel in de bron staat is
 * te controleren zonder browser; hoe hij rendert niet (CLAUDE.md verbiedt
 * jsdom, en terecht). De meting op een echt aanraakscherm staat in
 * docs/feedback-26-augustus/RAPPORT.md.
 *
 * ## Waarom de editors er niet in zitten
 *
 * Een kaarteditor bedien je in de bewerkdialoog van Home Assistant, en die
 * wordt in de praktijk met een muis bediend. Blijft daar een knop oplichten,
 * dan is dat lelijk; op een dashboard is het misleidend. De grens ligt bij
 * `src/editor/`.
 */

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const WORTEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(WORTEL, "src");

/** Elk bestand dat kaart-CSS draagt. `src/editor/` valt er expres buiten. */
function bronbestanden(map) {
  const uit = [];
  for (const item of readdirSync(map, { withFileTypes: true })) {
    const pad = join(map, item.name);
    if (item.isDirectory()) {
      if (item.name === "editor") continue;
      uit.push(...bronbestanden(pad));
    } else if (item.name.endsWith(".js")) {
      uit.push(pad);
    }
  }
  return uit;
}

/**
 * Staat deze positie binnen een `@media (...hover: hover...)`-blok?
 *
 * Er wordt geteld en niet geregexed: een blok kan andere blokken bevatten
 * (`@keyframes`, een tweede `@media`), en een patroon dat "van @media tot de
 * eerste }" leest, sluit dan te vroeg af. Tellen is saai en klopt.
 */
function inHoverBlok(bron, positie) {
  const opens = [];
  let diepte = 0;
  for (let i = 0; i < positie; i++) {
    const c = bron[i];
    if (c === "{") {
      // Het stukje bron vóór deze accolade, tot aan het vorige blokteken.
      const start = Math.max(bron.lastIndexOf("{", i - 1), bron.lastIndexOf("}", i - 1)) + 1;
      opens[diepte] = bron.slice(start, i);
      diepte++;
    } else if (c === "}") {
      diepte = Math.max(0, diepte - 1);
    }
  }
  return opens.slice(0, diepte).some((kop) => /@media[^{]*hover:\s*hover/.test(kop));
}

/**
 * Sjabloonliterals die halverwege een CSS-commentaar ophouden.
 *
 * DE FOUT DIE HIERMEE GEVANGEN WORDT
 *
 * Alle CSS in dit project staat in een sjabloonliteral, tussen backticks. Zet
 * je in een CSS-COMMENTAAR een woord tussen backticks -- wat in de rest van dit
 * project de gewoonte is om code aan te halen -- dan sluit die backtick de
 * string af. De rest van het commentaar is vanaf dat moment JavaScript.
 *
 * Meestal is dat een bouwfout en ben je binnen een minuut klaar. Maar niet
 * altijd: `zie de uitleg bij .surface in theme.js` werd
 * `... ` + .surface + ` ...`, en `.surface` is geldige JavaScript. Het bouwde,
 * het laadde, en toen viel de HELE bundel om op `X(...).surface is not a
 * function` -- waarmee geen enkele kaart meer geregistreerd werd en het
 * dashboard leeg bleef. Zonder deze bewaker was de volgende stap zoeken in een
 * bundel van 400 kB.
 *
 * HOE HET GEMETEN WORDT
 *
 * Niet op backticks in commentaar -- die zijn na het afsluiten van de string
 * niet meer als zodanig te herkennen. Wél op het gevolg: het sjabloon houdt dan
 * op MIDDEN in een blokcommentaar. Elk sjabloon dat een commentaar OPENT zonder
 * het te sluiten is dus fout, en dat is precies te tellen.
 */
function sjabloonFouten(bron, naam) {
  const uit = [];
  let i = 0;
  const n = bron.length;

  // Een kleine scanner, want een reguliere expressie kan geen strings van
  // commentaar onderscheiden en dat is hier nu net het onderwerp.
  while (i < n) {
    const c = bron[i];
    const volgende = bron[i + 1];

    if (c === "/" && volgende === "/") {
      i = bron.indexOf("\n", i);
      if (i === -1) break;
      continue;
    }
    if (c === "/" && volgende === "*") {
      const eind = bron.indexOf("*/", i + 2);
      i = eind === -1 ? n : eind + 2;
      continue;
    }
    if (c === '"' || c === "'") {
      i++;
      while (i < n && bron[i] !== c) i += bron[i] === "\\" ? 2 : 1;
      i++;
      continue;
    }
    if (c === "`") {
      const start = i + 1;
      let j = start;
      let diepte = 0;
      while (j < n) {
        if (bron[j] === "\\") {
          j += 2;
          continue;
        }
        if (bron[j] === "$" && bron[j + 1] === "{") {
          diepte++;
          j += 2;
          continue;
        }
        if (diepte > 0 && bron[j] === "}") {
          diepte--;
          j++;
          continue;
        }
        if (diepte === 0 && bron[j] === "`") break;
        j++;
      }
      const inhoud = bron.slice(start, j);
      const open = inhoud.lastIndexOf("/*");
      if (open !== -1 && inhoud.indexOf("*/", open) === -1) {
        const regel = bron.slice(0, start + open).split("\n").length;
        uit.push(
          `${naam}:${regel} — een sjabloon eindigt midden in een CSS-commentaar; ` +
            "staat er een backtick in dat commentaar?",
        );
      }
      i = j + 1;
      continue;
    }
    i++;
  }
  return uit;
}

const fouten = [];
let bewaakt = 0;
let sjablonen = 0;

for (const pad of bronbestanden(SRC)) {
  const bron = readFileSync(pad, "utf8");
  const naam = relative(WORTEL, pad).replace(/\\/g, "/");

  for (const m of bron.matchAll(/:hover\b/g)) {
    bewaakt++;
    if (!inHoverBlok(bron, m.index)) {
      const regel = bron.slice(0, m.index).split("\n").length;
      fouten.push(`${naam}:${regel} — :hover buiten @media (hover: hover)`);
    }
  }

  const stuk = sjabloonFouten(bron, naam);
  sjablonen += stuk.length;
  fouten.push(...stuk);
}

// De editors doen niet mee aan de hover-regel, maar wél aan de backtick-regel:
// een kapot sjabloon in een editor sloopt dezelfde bundel.
for (const pad of bronbestanden(join(SRC, "editor"))) {
  const bron = readFileSync(pad, "utf8");
  const naam = relative(WORTEL, pad).replace(/\\/g, "/");
  const stuk = sjabloonFouten(bron, naam);
  sjablonen += stuk.length;
  fouten.push(...stuk);
}

if (fouten.length > 0) {
  console.error("FOUT in de CSS van de kaarten:");
  for (const f of fouten) console.error(`  - ${f}`);
  if (fouten.length > sjablonen) {
    console.error(
      "\nEen :hover hoort in een @media (hover: hover) { ... }. Zonder dat blijft de\n" +
        "knop oplichten nadat je hem hebt aangetikt, ook als de pop-up erachter al\n" +
        "dicht is.",
    );
  }
  if (sjablonen > 0) {
    console.error(
      "\nEen backtick in een CSS-commentaar sluit het sjabloon af. Haal hem weg --\n" +
        "aanhalen doe je in CSS-commentaar zonder backticks.",
    );
  }
  process.exit(1);
}

console.log(
  `OK: ${bewaakt} hover-regel(s) op kaarten achter @media (hover: hover), ` +
    "en geen sjabloon dat midden in een CSS-commentaar ophoudt.",
);
