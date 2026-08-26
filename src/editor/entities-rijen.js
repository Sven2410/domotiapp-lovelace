/**
 * De rekenkant van de entiteiten-editor: config in, rijen uit, en terug.
 *
 * Los van de editor omdat het ZONDER DOM te toetsen is, en omdat er precies
 * hier iets stilletjes fout ging dat je op het scherm als iets heel anders
 * ziet.
 *
 * DE LUS DIE DIT MOET OVERLEVEN
 *
 * Home Assistant duwt de config die de editor wegschrijft bij ELKE toetsaanslag
 * terug door `setConfig`. De editor herkent zijn eigen echo door te vergelijken:
 *
 *     uitgekleed(naarRijen(config)) === uitgekleed(this.rows_)
 *
 * Klopt dat niet, dan bouwt hij zichzelf opnieuw op -- en verdwijnt het
 * invoerveld onder je vingers. Dat is wat "ik word er telkens uit gegooid met
 * typen" was. De oorzaak was dat `naarRijen` de uitlijning, de beeldmaat en de
 * kolomkoppen liet vallen: wat eruit ging kwam er anders in terug.
 *
 * De test daarop is dus geen detail maar de kern: alles wat `uitgekleed`
 * WEGSCHRIJFT moet `naarRijen` ook weer INLEZEN.
 */

import {
  BEELD_STANDAARD,
  asItem,
  clampBeeld,
  clampCols,
  clampUitlijning,
  clampVorm,
  gevuld,
} from "../cards/entities-logica.js";

/** Een rij heeft precies zoveel plekken als kolommen: niet meer, niet minder. */
export function vul(row) {
  row.bewaard ??= [];
  while (row.items.length < row.columns) row.items.push(row.bewaard.pop() ?? { entity: "" });
  while (row.items.length > row.columns) {
    const eruit = row.items.pop();
    // Alleen ingevulde plekken zijn het bewaren waard, en alleen zolang deze
    // editor openstaat. Een klik op "2" mag geen werk weggooien.
    if (gevuld(eruit)) row.bewaard.push(eruit);
  }
  return row;
}

/**
 * Breng elke configvorm terug tot rijen met vaste plekken.
 *
 * Staan er meer entiteiten in een rij dan er kolommen zijn -- een oude config,
 * of met de hand geschreven YAML -- dan wordt die rij opgeknipt in meerdere
 * rijen van hetzelfde kolomaantal. Dat is precies wat de kaart al tekende, want
 * die laat een te volle rij doorlopen naar de volgende regel. Afkappen zou hier
 * betekenen dat het openen van de editor stilletjes entiteiten wist.
 */
export function naarRijen(config) {
  const ruw = Array.isArray(config.rows) && config.rows.length
    ? config.rows.map((r) => ({
        columns: clampCols(r.columns),
        layout: clampVorm(r.layout),
        align: clampUitlijning(r.align),
        image_size: clampBeeld(r.image_size),
        column_names: Array.isArray(r.column_names) ? [...r.column_names] : [],
        items: (r.items ?? r.entities ?? []).map(asItem),
      }))
    : (() => {
        const flat = (config.items ?? config.entities ?? []).map(asItem);
        return flat.length
          ? [
              {
                columns: clampCols(config.columns),
                layout: clampVorm(config.layout),
                align: clampUitlijning(config.align),
                image_size: clampBeeld(config.image_size),
                column_names: Array.isArray(config.column_names) ? [...config.column_names] : [],
                items: flat,
              },
            ]
          : [];
      })();

  const uit = [];
  for (const row of ruw) {
    const groepen = [];
    for (let i = 0; i < row.items.length; i += row.columns) {
      groepen.push(row.items.slice(i, i + row.columns));
    }
    if (!groepen.length) groepen.push([]);
    groepen.forEach((items, n) =>
      uit.push(
        vul({
          columns: row.columns,
          layout: row.layout,
          // ALLE eigenschappen van de rij gaan mee, niet alleen vorm en
          // kolommen. Stond dit er niet, dan verloor de editor bij het inlezen
          // de uitlijning, de beeldmaat en de kolomkoppen -- en omdat Home
          // Assistant de config bij ELKE toetsaanslag terugduwt door
          // `setConfig`, herkende de editor zijn eigen echo daarna niet meer.
          // Gevolg: een complete herbouw per aanslag, en dus een invoerveld dat
          // onder je vingers verdween. Zie de kop van dit bestand.
          align: row.align,
          image_size: row.image_size,
          // Alleen op de EERSTE groep: valt een handgeschreven rij van vijf
          // entiteiten in drie stukken uiteen, dan hoort er niet drie keer
          // dezelfde kop boven te staan.
          column_names: n === 0 ? row.column_names : [],
          items,
        }),
      ),
    );
  }
  return uit;
}

/**
 * Wat er werkelijk naar de dashboardconfig gaat: geen lege plekken, geen lege
 * rijen, en nergens een object dat wij daarna nog aanraken.
 *
 * Die laatste is geen netheid maar de kern. Home Assistant bevriest wat het
 * krijgt; deelden we onze eigen items uit, dan zouden ze na een wijziging
 * onaanraakbaar zijn. Zie de kop.
 *
 * `layout: row` blijft weg: dat is de standaard, en YAML waarin op elke rij het
 * gewone geval staat opgeschreven is moeilijker te lezen dan YAML waarin alleen
 * de uitzondering staat.
 */
export const uitgekleed = (rows) =>
  rows
    .map((r) => {
      // Alleen zoveel namen als er kolommen zijn, en alleen als er iets staat.
      const namen = (r.column_names ?? []).slice(0, r.columns).map((n) => String(n ?? "").trim());
      return {
        columns: r.columns,
        ...(r.layout && r.layout !== "row" ? { layout: r.layout } : {}),
        ...(r.align === "midden" ? { align: "midden" } : {}),
        ...(r.layout === "beeld" && r.image_size !== BEELD_STANDAARD
          ? { image_size: clampBeeld(r.image_size) }
          : {}),
        ...(namen.some(Boolean) ? { column_names: namen } : {}),
        items: r.items.filter(gevuld).map((i) => structuredClone(i)),
      };
    })
    .filter((r) => r.items.length);

