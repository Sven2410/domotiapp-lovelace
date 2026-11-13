/**
 * Het rekenwerk achter de botkaart, "Vraag het Coach Assist", zonder DOM.
 *
 * De namen sinds 13 november 2026 (de eigenaar): DomotiTech is het bedrijf, COACH het systeem, Coach Assist de digitale
 * hulp. Wat de klant leest zegt geen "bot" meer ("Niet meer bot"); de technische namen (`domotiapp-bot-card`, de
 * bestanden, de commando's) blijven, want die staan in dashboards. Tot dan heette de kaart "Vraag het de DomotiTech Bot".
 *
 * De eigenaar, 12 november 2026: "het moet in een popup komen zoals Vraag het de DomotiTech Bot snap je? Alles in HA
 * [...] Niet iedereen heeft en wil telegram." En: "Lovelace moet een eigen kaart hebben en dat moet hetzelfde zijn in
 * de coach".
 *
 * Een VRAAG en een TICKET zijn twee dingen. De eigenaar, 13 november 2026: "Gewoon een vraag stellen over de installatie
 * en echt een ticket aan maken zijn aparte dingen." Vragen zijn één doorlopend gesprek per huis, zoals een chat (het
 * gesprek met `id` 0 in het contract). Een ticket is een storing of een aanvraag, met een nummer, een stand en zo nodig
 * foto's.
 *
 * WIE WAT DOET
 *
 * De COACH bewaart het gesprek en de tickets en geeft ze door over zijn websocket (`domotiapp_coach/tickets/*`, contract 1,
 * met de wijziging van 13 november 2026 in de afspraak). Deze kaart maakt niets zelf: hij abonneert zich, toont wat er
 * is, en stuurt `new`, `reply` en `read`. Een foto gaat eerst over HTTP naar de coach, en dan als id mee. Het antwoorden gebeurt
 * buiten Home Assistant. Een huis is één huishouden: iedereen in die Home Assistant ziet alle tickets van het huis.
 *
 * HET CONTRACT
 *
 * Net als bij de laadpaalkaart (zie de kop van `coach-logica.js`): een contract dat hoger is dan 1 is geen fout, want
 * toevoegen mag. Een stand of soort die deze kaart niet kent, staat er met een gewoon woord: een nieuwe stand is voor
 * de klant "In behandeling". `bij_beheerder` (ligt ter beslissing bij de eigenaar) heet voor de klant "Ligt bij
 * DomotiTech".
 *
 * Tekst van de klant en van DomotiTech is TEKST: de kaart zet hem met `textContent` of `escapeHtml`, nooit als html.
 */

import { locale, nt, t, tn } from "../taal.js";

export const BOT_CONTRACT = 1;
export const COMMANDO = "domotiapp_coach/tickets";
export const COACH_DOMEIN = "domotiapp_coach";

/** De langste tekst die de coach aanneemt. */
export const MAX_TEKST = 4000;

/** Het gesprek van het huis heeft dit nummer; de tickets beginnen bij 1. */
export const GESPREK = 0;

/** Foto's bij een ticket: hoeveel per bericht, en hoe groot ze de deur uit gaan. */
export const MAX_FOTOS = 4;
export const FOTO_PX = 2000;
export const FOTO_KWALITEIT = 0.85;
export const BIJLAGE_PAD = "/api/domotiapp_coach/tickets/bijlage";

/** De twee soorten ticket, in de volgorde van het scherm. Een vraag is geen ticket meer: die gaat in het gesprek. */
export const SOORTEN = [
  { id: "storing", naam: nt("Storing"), icoon: "warning", uitleg: nt("Iets doet het niet zoals het hoort.") },
  { id: "aanvraag", naam: nt("Aanvraag"), icoon: "plus", uitleg: nt("Iets erbij of iets anders: een lamp, een knop, een regel.") },
];

export const soortVan = (id) => SOORTEN.find((s) => s.id === id) ?? { id, naam: nt("Ticket"), icoon: "chat" };

/** Zo heet de digitale hulp sinds 13 november 2026 (was "de DomotiTech Bot"). Een naam: niet vertalen. */
export const ASSIST = "Coach Assist";

/**
 * Wie een bericht schreef, zoals de klant het leest. De coach zet bij een antwoord `naam`; tot 13 november 2026 was
 * dat "DomotiTech", en die oude berichten blijven zo in zijn opslag staan. Die en een antwoord zonder naam heten
 * "Coach Assist", net als in het paneel van de coach, zodat oude en nieuwe antwoorden er gelijk uitzien.
 */
export function afzender(bericht) {
  const naam = bericht?.naam || "";
  if (bericht?.van === "klant") return naam;
  return !naam || naam === "DomotiTech" ? ASSIST : naam;
}

/** De stand zoals de klant hem leest. */
export function standNaam(stand) {
  if (stand === "nieuw") return t("Ontvangen");
  if (stand === "klaar") return t("Afgerond");
  if (stand === "bij_beheerder") return t("Ligt bij DomotiTech");
  return t("In behandeling");
}

/** Hoort de stand bij een lopend ticket? Alleen `klaar` is het niet meer. */
export const loopt = (ticket) => ticket?.stand !== "klaar";

/** Kent deze coach de afspraak? Een hoger contract is geen fout. */
export const kentContract = (bericht) => Number(bericht?.contract) >= BOT_CONTRACT;

/** Staat de coach in deze Home Assistant? */
export const heeftCoach = (hass) => Boolean(hass?.config?.components?.includes(COACH_DOMEIN));

const tijd = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
};

/** Nieuwste eerst: wat het laatst bijgewerkt is, staat bovenaan. */
export const sorteer = (tickets) =>
  [...tickets].sort((a, b) => tijd(b.bijgewerkt ?? b.gemaakt) - tijd(a.bijgewerkt ?? a.gemaakt) || b.id - a.id);

/** Een leeg gesprek, voor een coach die nog niets stuurde. */
export const leegGesprek = () => ({ id: GESPREK, soort: "vraag", berichten: [], gelezen: {} });

/**
 * Een bericht van het abonnement erbij. Het eerste is alles (`gesprek` en `tickets`, met `contract`), daarna één
 * ticket per wijziging (`ticket`; met `id` 0 is dat het gesprek). Geeft de nieuwe stand `{gesprek, tickets}`, of
 * `null` als het bericht er niets mee te maken had.
 */
export function verwerk(stand, bericht) {
  if (Array.isArray(bericht?.tickets)) {
    return { gesprek: bericht.gesprek ?? leegGesprek(), tickets: sorteer(bericht.tickets.filter((x) => x.id !== GESPREK)) };
  }
  const ticket = bericht?.ticket;
  if (!ticket || ticket.id == null) return null;
  const tickets = stand?.tickets ?? [];
  if (Number(ticket.id) === GESPREK) return { gesprek: ticket, tickets };
  return { gesprek: stand?.gesprek ?? leegGesprek(), tickets: sorteer([...tickets.filter((x) => x.id !== ticket.id), ticket]) };
}

/** Het laatste bericht dat deze gebruiker zag. */
const gezien = (ticket, userId) => Number(ticket?.gelezen?.[userId] ?? 0);

/** Hoeveel antwoorden van DomotiTech deze gebruiker nog niet las. */
export const ongelezen = (ticket, userId) =>
  (ticket?.berichten ?? []).filter((b) => b.van !== "klant" && Number(b.id) > gezien(ticket, userId)).length;

/** Moet `read` gestuurd worden als dit ticket open staat? Alleen als er iets na het gelezene kwam. */
export function moetLezen(ticket, userId) {
  const laatste = (ticket?.berichten ?? []).reduce((m, b) => Math.max(m, Number(b.id) || 0), 0);
  return laatste > gezien(ticket, userId);
}

/** Hoeveel antwoorden deze gebruiker nog niet las, in het gesprek en in de tickets samen. */
export const allesOngelezen = (stand, userId) =>
  ongelezen(stand?.gesprek, userId) + (stand?.tickets ?? []).reduce((n, x) => n + ongelezen(x, userId), 0);

/** De regel onder de naam op de kaart. Leeg als er niets te melden is. */
export function tegelRegel({ coach, stand, userId, teOud }) {
  if (!coach) return t("Heeft COACH nodig");
  if (teOud) return t("Werk COACH bij");
  if (!stand) return "";
  const nieuw = allesOngelezen(stand, userId);
  if (nieuw) return tn(nieuw, "{n} nieuw antwoord", "{n} nieuwe antwoorden");
  const open = stand.tickets.filter(loopt).length;
  return open ? tn(open, "{n} ticket loopt", "{n} tickets lopen") : "";
}

/**
 * Wat de coach aanneemt: niet leeg na het bijknippen, en niet te lang. Een ticket mag zonder tekst als er een foto bij
 * zit; in het gesprek kan geen foto.
 */
export function waaromNiet(tekst, { fotos = 0 } = {}) {
  const schoon = String(tekst ?? "").trim();
  if (!schoon && !fotos) return t("Typ eerst wat je wilt vragen.");
  if (schoon.length > MAX_TEKST) return t("Dat is te lang: hoogstens {n} tekens.", { n: MAX_TEKST });
  if (fotos > MAX_FOTOS) return t("Hoogstens {n} foto's per bericht.", { n: MAX_FOTOS });
  return null;
}

/** De maat waarop een foto de deur uit gaat: de lange kant hoogstens `FOTO_PX`, nooit groter dan hij was. */
export function fotoMaat(breed, hoog, max = FOTO_PX) {
  const schaal = Math.min(1, max / Math.max(breed, hoog, 1));
  return { breed: Math.max(1, Math.round(breed * schaal)), hoog: Math.max(1, Math.round(hoog * schaal)) };
}

/** Het pad van een foto bij de coach. Een id is 32 tekens hex; iets anders wordt nooit een adres. */
export const bijlagePad = (id) => (/^[0-9a-f]{32}$/.test(String(id)) ? `${BIJLAGE_PAD}/${id}` : null);

const dag = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Wanneer: vandaag een tijd, gisteren "gisteren 14:05", anders een datum. */
export function wanneer(iso, nu = new Date()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const klok = d.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" });
  const verschil = Math.round((dag(nu) - dag(d)) / 86400000);
  if (verschil === 0) return klok;
  if (verschil === 1) return t("gisteren {tijd}", { tijd: klok });
  const opties = { day: "numeric", month: "short" };
  if (d.getFullYear() !== nu.getFullYear()) opties.year = "numeric";
  return d.toLocaleDateString(locale(), opties);
}

/** Een fout van de coach in een zin. Wat de coach zelf zegt, wordt niet vertaald. */
export function foutTekst(fout) {
  if (fout?.code === "unknown_command") return t("COACH kent Coach Assist nog niet. Werk COACH bij.");
  if (fout?.code === "foto") return t("De foto kon niet mee: {fout}", { fout: String(fout.message ?? "") });
  const uitleg = String(fout?.message ?? "").trim();
  return uitleg ? t("Versturen lukte niet: {fout}", { fout: uitleg }) : t("Versturen lukte niet.");
}
