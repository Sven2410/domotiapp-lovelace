/**
 * Vier bewakers op de bron van de kaarten.
 *
 * 1. Elke `:hover`-regel op een kaart staat achter `@media (hover: hover)`.
 * 2. Geen enkel sjabloonliteral wordt halverwege een CSS-commentaar afgesloten.
 * 3. Elke `var(--dac-...)` die gebruikt wordt, bestaat ook echt in theme.js.
 * 4. Er staan geen stuurtekens in de bron (een heredoc die backslashes at).
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
import { dirname, join, relative, sep } from "node:path";

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

/**
 * Elk bronbestand van het project, elk pad precies één keer.
 *
 * `bronbestanden(SRC)` loopt al recursief, maar slaat `editor/` over -- die
 * heeft zijn eigen regel bij de hover. Voor de bewakers hieronder tellen de
 * editors wél mee, dus die komen er apart bij. Een Set eromheen, want anders
 * meldt elke fout in `src/` zich twee keer.
 */
function alleBronbestanden() {
  const paden = new Set(bronbestanden(SRC));
  try {
    for (const p of bronbestanden(join(SRC, "editor"))) paden.add(p);
  } catch {
    /* geen editor-map: dan is dit al compleet */
  }
  return [...paden];
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

/* ---------------------------------------------------------------------------
 * Bewaker 3: een themavariabele die niet bestaat.
 *
 * ## Waarom dit een bewaker is
 *
 * CSS klaagt niet over `var(--dac-radius-s)` als die niet bestaat. De regel
 * wordt ongeldig en de eigenschap valt gewoon weg -- geen fout in de console,
 * geen waarschuwing bij het bouwen, niets.
 *
 * Gemeld op 27 augustus 2026: *"gebruik rondingen, nu is alles vierkant, het
 * moet in de style van alle andere kaarten."* Dat klopte. De tokens heten
 * `--dac-radius` en `--dac-radius-sm`; in drie nieuwe kaarten, het
 * sleeptimerscherm én de gestapelde klimaatkaart stond `--dac-radius-s`. Elf
 * plekken, allemaal met een `border-radius` die het stil niet deed.
 *
 * Een variabele die een kaart ZELF definieert telt mee als bestaand -- de
 * personenkaart zet zijn eigen `--dac-ring`, en dat mag.
 */
const TOKEN_RE = /var\(\s*(--dac-[a-z0-9-]+)/gi;
const gedefinieerd = new Set();
{
  const thema = readFileSync(join(SRC, "theme.js"), "utf8");
  for (const m of thema.matchAll(/(--dac-[a-z0-9-]+)\s*:/gi)) gedefinieerd.add(m[1]);
}
// En wat JavaScript zelf op een element zet -- de gemeten rasterhoogte
// (`--dac-raster`) staat nergens in het thema en hoort daar ook niet: hij wordt
// per kaart gemeten. Zie rasterhoogte.js.
{
  for (const pad of alleBronbestanden()) {
    const bron = readFileSync(pad, "utf8");
    for (const m of bron.matchAll(/setProperty\(\s*["'](--dac-[a-z0-9-]+)["']/gi)) {
      gedefinieerd.add(m[1]);
    }
  }
}
let tokens = 0;
{
  for (const pad of alleBronbestanden()) {
    const bron = readFileSync(pad, "utf8");
    const naam = relative(WORTEL, pad).split(sep).join("/");
    // Wat dit bestand zelf definieert mag het ook zelf gebruiken.
    const eigen = new Set([...bron.matchAll(/(--dac-[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
    for (const m of bron.matchAll(TOKEN_RE)) {
      const naamToken = m[1];
      if (gedefinieerd.has(naamToken) || eigen.has(naamToken)) continue;
      tokens += 1;
      fouten.push(`${naam}: var(${naamToken}) bestaat niet in theme.js`);
    }
  }
}

/* ---------------------------------------------------------------------------
 * Bewaker 4: stuurtekens in de bron.
 *
 * De twee patronen staan hieronder als constante, opgebouwd uit tekencodes.
 * Dat is met opzet: een bewaker die zelf een backspace in zijn bron heeft staan
 * om er een te herkennen, is precies het soort grap dat je een uur kost.
 *
 * Valkuil 13 in CLAUDE.md waarschuwt ervoor: schrijf broncode met backslashes
 * niet via een shell-heredoc, want die eet ze op. Op 27 augustus 2026 gebeurde
 * dat twee keer op een dag, en de tweede keer was het stil: een regex met
 * BACKSPACE-tekens (0x08) in plaats van de bedoelde grens.
 *
 *     /lat/   werd    /<0x08>lat<0x08>/
 *
 * Dat is geldige JavaScript. Het bouwt, het laadt, en de regex matcht nooit --
 * waarna de autokaart de locatie van de eigenaar niet herkende en "we weten het
 * niet" toonde. Een half uur zoeken, en met deze bewaker een seconde.
 */
const NEWLINE = String.fromCharCode(10);
// Backspace (8), verticale tab (11) en formfeed (12). Tab en newline horen er
// wel te mogen staan, dus die zitten er niet bij.
const STUURTEKENS = new RegExp(
  "[" + String.fromCharCode(8, 11, 12) + "]",
  "g",
);

let stuur = 0;
{
  for (const pad of alleBronbestanden()) {
    const bron = readFileSync(pad, "utf8");
    const naam = relative(WORTEL, pad).split(sep).join("/");
    // Backspace, verticale tab en formfeed. Een tab en een newline horen er
    // wel te mogen staan.
    const raak = [...bron.matchAll(STUURTEKENS)];
    if (raak.length) {
      stuur += raak.length;
      const regel = bron.slice(0, raak[0].index).split(NEWLINE).length;
      fouten.push(`${naam}: ${raak.length} stuurteken(s) in de bron, eerste op regel ${regel}`);
    }
  }
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
    "geen sjabloon dat midden in een CSS-commentaar ophoudt, " +
    "elke var(--dac-...) bestaat, en er staan geen stuurtekens in de bron.",
);
