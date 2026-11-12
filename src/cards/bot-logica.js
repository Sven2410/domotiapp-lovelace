/**
 * Het rekenwerk achter de botkaart, "Vraag het de DomotiTech Bot", zonder DOM.
 *
 * De eigenaar, 12 november 2026: "het moet in een popup komen zoals Vraag het de DomotiTech Bot snap je? Alles in HA
 * [...] Niet iedereen heeft en wil telegram." En: "Lovelace moet een eigen kaart hebben en dat moet hetzelfde zijn in
 * de coach". De klant stelt een vraag, doet een aanvraag of meldt een storing; dat is een TICKET, en DomotiTech
 * antwoordt erop.
 *
 * WIE WAT DOET
 *
 * De COACH bewaart de tickets en geeft ze door over zijn websocket (`domotiapp_coach/tickets/*`, contract 1). Deze kaart
 * maakt niets zelf: hij abonneert zich, toont wat er is, en stuurt `new`, `reply` en `read`. Het antwoorden gebeurt
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

/** De drie soorten, in de volgorde van het scherm. */
export const SOORTEN = [
  { id: "vraag", naam: nt("Vraag"), icoon: "question", uitleg: nt("Hoe vol is mijn accu? Waarom ging de lamp aan?") },
  { id: "aanvraag", naam: nt("Aanvraag"), icoon: "plus", uitleg: nt("Iets erbij of iets anders: een lamp, een knop, een regel.") },
  { id: "storing", naam: nt("Storing"), icoon: "warning", uitleg: nt("Iets doet het niet zoals het hoort.") },
];

export const soortVan = (id) => SOORTEN.find((s) => s.id === id) ?? { id, naam: nt("Vraag"), icoon: "question" };

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

/**
 * Een bericht van het abonnement erbij. Het eerste is de hele lijst (`tickets`, met `contract`), daarna één ticket per
 * wijziging (`ticket`). Geeft de nieuwe lijst, of `null` als het bericht er niets mee te maken had.
 */
export function verwerk(tickets, bericht) {
  if (Array.isArray(bericht?.tickets)) return sorteer(bericht.tickets);
  const ticket = bericht?.ticket;
  if (!ticket || ticket.id == null) return null;
  return sorteer([...(tickets ?? []).filter((x) => x.id !== ticket.id), ticket]);
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

/** De regel onder de naam op de kaart. Leeg als er niets te melden is. */
export function tegelRegel({ coach, tickets, userId, teOud }) {
  if (!coach) return t("Heeft DomotiApp Coach nodig");
  if (teOud) return t("Werk DomotiApp Coach bij");
  if (!tickets) return "";
  const nieuw = tickets.reduce((n, x) => n + ongelezen(x, userId), 0);
  if (nieuw) return tn(nieuw, "{n} nieuw antwoord", "{n} nieuwe antwoorden");
  const open = tickets.filter(loopt).length;
  return open ? tn(open, "{n} vraag loopt", "{n} vragen lopen") : "";
}

/** Een tekst die de coach aanneemt: niet leeg na het bijknippen, en niet te lang. */
export function waaromNiet(tekst) {
  const schoon = String(tekst ?? "").trim();
  if (!schoon) return t("Typ eerst wat je wilt vragen.");
  if (schoon.length > MAX_TEKST) return t("Dat is te lang: hoogstens {n} tekens.", { n: MAX_TEKST });
  return null;
}

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
  if (fout?.code === "unknown_command") return t("De coach kent de bot nog niet. Werk DomotiApp Coach bij.");
  const uitleg = String(fout?.message ?? "").trim();
  return uitleg ? t("Versturen lukte niet: {fout}", { fout: uitleg }) : t("Versturen lukte niet.");
}
