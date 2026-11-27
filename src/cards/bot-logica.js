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
 * Tot wanneer Coach Assist aan dit gesprek of ticket werkt (coach v0.243.0), in milliseconden, of `null`. De eigenaar
 * op 25-11-2026: "Laat ook zien dat een bericht in behandeling is met 3 puntjes die bewegen". De coach zet `bezig` =
 * {sinds, tot}, met tijdzone, haalt het weg bij een antwoord, en laat een verlopen `bezig` zelf weg. Maar een scherm
 * dat lang openstaat krijgt geen bericht als `tot` voorbijgaat, dus de kaart kijkt zelf ook. `tot` is een echt moment:
 * naast `Date.now()`, niet naast de klok van het huis.
 */
export function bezigTot(ticket, nu = Date.now()) {
  const tot = Date.parse(ticket?.bezig?.tot ?? "");
  return Number.isFinite(tot) && tot > nu ? tot : null;
}

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
  if (stand === "klaar") return t("Gesloten");
  if (stand === "bij_beheerder") return t("Ligt bij DomotiTech");
  return t("In behandeling");
}

/**
 * Het etiket van een ticket in de lijst: Open, In behandeling of Gesloten. De eigenaar, 15 november 2026: "de klant
 * moet ook goed kunnen zien wat open staat en gesloten is". `soort` kiest de kleur. Ligt het bij DomotiTech, dan is het
 * in behandeling; dat staat er in woorden naast (`standNaam`).
 */
export function standEtiket(stand) {
  if (stand === "klaar") return { tekst: t("Gesloten"), soort: "dicht" };
  if (stand === "nieuw") return { tekst: t("Open"), soort: "open" };
  return { tekst: t("In behandeling"), soort: "bezig" };
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
 * Een bericht van het abonnement erbij. Het eerste is alles (`gesprek`, `tickets` en sinds 15 november 2026
 * `pakket`, met `contract`), daarna één ticket per wijziging (`ticket`; met `id` 0 is dat het gesprek, en na een vraag
 * staat het bijgewerkte `pakket` ernaast), of een nieuw pakket alleen (`{pakket}`, na `set_plan`). Geeft de nieuwe stand `{gesprek, tickets, pakket}`, of `null` als het bericht er niets mee te
 * maken had. Een coach die het pakket niet kent stuurt het niet mee: dan is het `null`, en is er geen grens.
 */
export function verwerk(stand, bericht) {
  if (Array.isArray(bericht?.tickets)) {
    return {
      gesprek: bericht.gesprek ?? leegGesprek(),
      tickets: sorteer(bericht.tickets.filter((x) => x.id !== GESPREK)),
      pakket: bericht.pakket ?? null,
    };
  }
  // Na een vraag staat het pakket naast het gesprek; na `set_plan` komt het alleen.
  const pakket = bericht && "pakket" in bericht ? (bericht.pakket ?? null) : (stand?.pakket ?? null);
  if (bericht && "pakket" in bericht && !("ticket" in bericht)) {
    return { gesprek: stand?.gesprek ?? leegGesprek(), tickets: stand?.tickets ?? [], pakket: bericht.pakket ?? null };
  }
  const ticket = bericht?.ticket;
  if (!ticket || ticket.id == null) return null;
  const tickets = stand?.tickets ?? [];
  if (Number(ticket.id) === GESPREK) return { gesprek: ticket, tickets, pakket };
  return { gesprek: stand?.gesprek ?? leegGesprek(), tickets: sorteer([...tickets.filter((x) => x.id !== ticket.id), ticket]), pakket };
}

/*
 * HET ABONNEMENT (DomotiCare)
 *
 * De eigenaar, 15 november 2026: klanten krijgen een pakket met een aantal vragen per dag (10, 25 of onbeperkt), en
 * "elk abbo heeft geen maandlimiet". Daarna ook een grens op nieuwe tickets, tegen spam (5, 10 of geen). Een reactie op
 * een ticket telt niet. De coach houdt de grens en weigert wat te veel is (`pakket_op`); de kaart laat zien hoeveel er
 * over is, en zet het veld of de knop op 0 uit. Zie de afspraak "Wijziging 15-11-2026".
 */

/**
 * Wat er vandaag nog over is: `{naam, vragen, tickets, opnieuw}`, of `null` zonder pakket. `vragen` en `tickets` zijn
 * het aantal dat over is, of `null` als daar geen grens op zit (onbeperkt, of een coach die alleen vragen telt).
 *
 * De coach telt (uit alles wat hij bewaard heeft, niet uit de laatste 100 die hij meestuurt) en stuurt het mee: in
 * `list`, naast het gesprek na elke vraag, en na `set_plan`. Om middernacht komt er geen bericht; na `opnieuw` (de
 * volgende middernacht van Home Assistant) is het daarom weer de hele grens. Zo doet het paneel het ook.
 */
export function pakketOver(stand, nu = new Date()) {
  const pakket = stand?.pakket;
  if (!pakket || typeof pakket !== "object") return null;
  const opnieuw = tijd(pakket.opnieuw) || null;
  const voorbij = Boolean(opnieuw) && nu.getTime() >= opnieuw;
  const grens = (perDag, over) => {
    const per = perDag == null ? null : Number(perDag);
    if (per == null || !Number.isFinite(per)) return null;
    if (voorbij) return per;
    const nog = over == null ? per : Number(over);
    return Math.max(0, Number.isFinite(nog) ? nog : per);
  };
  return {
    naam: String(pakket.naam ?? ""),
    vragen: grens(pakket.vragen_per_dag, pakket.vragen_over),
    tickets: grens(pakket.tickets_per_dag, pakket.tickets_over),
    opnieuw: voorbij ? null : opnieuw,
  };
}

/**
 * Geen DomotiCare: het huis heeft een pakket zonder Coach Assist (`coach_assist: false`). De eigenaar, 15 november
 * 2026: "ik wil ook een optie geen domoticare of iets. Dan moet er geen AI assistant in zitten etc", en daarna "Ja
 * zonder care wel een storing melden". De kaart heet dan Meld een storing: alleen Tickets, en een nieuw ticket is altijd
 * een storing. Een vraag of aanvraag weigert de coach (`geen_coach_assist`). Ontbreekt het veld, dan zit het er wel in.
 */
export const zonderAssist = (stand) => stand?.pakket?.coach_assist === false;

/** De regel onder het vraagveld. Leeg bij onbeperkt of zonder pakket. */
export const tellerTekst = (over) =>
  over == null ? "" : tn(over, "Nog {n} vraag vandaag", "Nog {n} vragen vandaag");

/** Bij zoveel vragen of minder valt de teller op. */
export const WEINIG_VRAGEN = 3;

/** De regel bij Nieuw ticket. Alleen als er nog `WEINIG_TICKETS` of minder over zijn. */
export const ticketTellerTekst = (over) =>
  over == null || over > WEINIG_TICKETS ? "" : tn(over, "Nog {n} ticket vandaag", "Nog {n} tickets vandaag");

export const WEINIG_TICKETS = 2;

/** Wat de klant leest als zijn vragen voor vandaag op zijn. Dezelfde zin als de coach bij `pakket_op`. */
export const vragenOpTekst = () =>
  t("Je hebt je vragen voor vandaag gesteld. Morgen kun je weer vragen stellen. Is er iets kapot? Meld dan een storing.");

/** En als de tickets voor vandaag op zijn (tegen spam). Dezelfde zin als de coach bij `pakket_op` op `new`. */
export const ticketsOpTekst = () =>
  t("Je hebt vandaag al het maximum aantal tickets gemaakt. Morgen kan het weer. Is het dringend? Neem dan contact op met je installateur.");

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

/*
 * HET GESPREK ZOALS WHATSAPP
 *
 * De eigenaar, 15 november 2026, nadat een klant het gesprek een paar keer gebruikte: "kijk even goed hoe whatsapp het
 * doet. Blokken rechts van je eigen tekst, blokken links van de antwoorden. En duidelijk aangeven of het de gebruiker
 * is met de naam of de coach snap je", "standaard naar het laatste bericht scrollen, ipv bovenaan beginnen", en "Evt de
 * historische dagen ingevouwen? Tot een week max". Afgestemd met de werkplaats van de coach, zodat het paneel daar
 * hetzelfde leest; daar zei hij ook: "Bij datum een dropdown niet zo veel datums laten zien ivm ruimtegebrek".
 */

/** Hoeveel dagen vóór het laatste bericht een eigen keuze in de lijst krijgen; wat ouder is, is samen één keuze. */
export const DAGEN_TERUG = 7;

/**
 * Staat dit bericht rechts? Alleen wat de gebruiker die kijkt zelf schreef, zoals WhatsApp in een groep: een andere
 * bewoner staat links, met zijn naam. Een klantbericht zonder `user_id` (de coach zet hem sinds v0.220.0) telt als
 * eigen, zoals het tot 0.127.0 stond.
 */
export const isEigen = (bericht, userId) =>
  bericht?.van === "klant" && (!bericht.user_id || !userId || bericht.user_id === userId);

/** De klok van een bericht, zonder dag: die staat in de scheiding erboven. */
export function klokVan(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" });
}

/** De scheiding boven een dag: Vandaag, Gisteren, binnen een week de weekdag met de datum, en anders de datum. */
export function dagKop(sleutel, nu = new Date()) {
  const d = new Date(sleutel);
  const verschil = Math.round((dag(nu) - sleutel) / 86400000);
  if (verschil === 0) return t("Vandaag");
  if (verschil === 1) return t("Gisteren");
  const opties = { day: "numeric", month: "long" };
  if (verschil > 1 && verschil < 7) opties.weekday = "long";
  if (d.getFullYear() !== nu.getFullYear()) opties.year = "numeric";
  const tekst = d.toLocaleDateString(locale(), opties);
  return tekst.charAt(0).toUpperCase() + tekst.slice(1);
}

/** Kies je in de keuzelijst `OUDER`, dan staan alle dagen van vóór `DAGEN_TERUG` erbij. */
export const OUDER = "ouder";

const berichtenTekst = (n) => tn(n, "{n} bericht", "{n} berichten");

/**
 * De berichten van een gesprek in dagen: welke in beeld staan, en welke in de keuzelijst.
 *
 * - De LAATSTE dag met berichten staat altijd in beeld, ook als dat niet vandaag is: anders opent een stil gesprek leeg.
 * - Een dag met een antwoord dat deze gebruiker nog niet las ook (`ongelezen`). Het scherm onthoudt die in `vast`,
 *   zodat hij niet wegvalt zodra `read` terugkomt.
 * - Alle andere dagen staan in één keuzelijst, nieuwste eerst ("Gisteren · 2 berichten"). De eigenaar, 15 november 2026,
 *   in de werkplaats van de coach: "Bij datum een dropdown niet zo veel datums laten zien ivm ruimtegebrek". Wat meer dan
 *   `DAGEN_TERUG` dagen vóór het laatste bericht ligt, is daarin één keuze `OUDER`.
 * - Eén keuze tegelijk (`keuze`: de sleutel van een dag, of `OUDER`): die dag staat dan op zijn plek in het gesprek, en
 *   blijft in de lijst staan zodat hij gekozen blijft.
 * - Met `invouwen: false` (een ticket) staat alles in beeld en is er geen lijst.
 *
 * Een bericht zonder bruikbare tijd hoort bij de dag van het bericht ervoor.
 */
export function inDagen(ticket, { userId = "", nu = new Date(), invouwen = true, vast = new Set(), keuze = null } = {}) {
  const gelezen = gezien(ticket, userId);
  const dagen = [];
  for (const b of ticket?.berichten ?? []) {
    const ms = tijd(b.at);
    const sleutel = ms ? dag(new Date(ms)) : (dagen.at(-1)?.sleutel ?? dag(nu));
    let groep = dagen.at(-1);
    if (groep?.sleutel !== sleutel) dagen.push((groep = { sleutel, berichten: [], ongelezen: false }));
    groep.berichten.push(b);
    if (b.van !== "klant" && Number(b.id) > gelezen) groep.ongelezen = true;
  }
  const laatste = dagen.at(-1)?.sleutel;
  for (const g of dagen) {
    g.kop = dagKop(g.sleutel, nu);
    g.laatste = g.sleutel === laatste;
    g.oud = Math.round((laatste - g.sleutel) / 86400000) > DAGEN_TERUG;
    g.vast = !invouwen || g.laatste || g.ongelezen || vast.has(g.sleutel);
  }
  const rest = dagen.filter((g) => !g.vast);
  const keuzes = rest.filter((g) => !g.oud).reverse().map((g) => ({ waarde: String(g.sleutel), tekst: `${g.kop} · ${berichtenTekst(g.berichten.length)}` }));
  const oud = rest.filter((g) => g.oud).reduce((n, g) => n + g.berichten.length, 0);
  if (oud) keuzes.push({ waarde: OUDER, tekst: `${t("Oudere berichten")} · ${berichtenTekst(oud)}` });
  // Een keuze die er niet (meer) is, telt niet: die dag is intussen vast in beeld, of weg.
  const gekozen = keuzes.some((k) => k.waarde === String(keuze)) ? String(keuze) : "";
  const inBeeld = (g) => g.vast || (gekozen === OUDER ? g.oud : gekozen === String(g.sleutel));
  return { dagen: dagen.filter(inBeeld), keuzes, keuze: gekozen };
}

/**
 * Een fout van de coach in een zin. Wat de coach zelf zegt, wordt niet vertaald; `pakket_op` wel, want die zin kennen
 * we, en hij hangt af van wat er verstuurd werd (`nieuw`: een nieuw ticket, anders een vraag).
 */
export function foutTekst(fout, { nieuw = false } = {}) {
  if (fout?.code === "unknown_command") return t("COACH kent Coach Assist nog niet. Werk COACH bij.");
  if (fout?.code === "pakket_op") return nieuw ? ticketsOpTekst() : vragenOpTekst();
  if (fout?.code === "ticket_gesloten") return t("Dit ticket is gesloten. Is het er weer? Maak dan een nieuw ticket.");
  if (fout?.code === "geen_coach_assist") return t("Coach Assist zit niet in je abonnement. Een storing melden kan altijd.");
  if (fout?.code === "foto") return t("De foto kon niet mee: {fout}", { fout: String(fout.message ?? "") });
  const uitleg = String(fout?.message ?? "").trim();
  return uitleg ? t("Versturen lukte niet: {fout}", { fout: uitleg }) : t("Versturen lukte niet.");
}
