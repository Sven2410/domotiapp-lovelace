/**
 * De schuifschakelaar van de familie.
 *
 * Een knop die schakelt is een knop; een schakelaar laat zien in welke stand
 * hij staat, ook als je er niet aan zit. Dat is het verschil dat deze regel
 * oplevert op een dashboard waar dezelfde kaart soms een script start en soms
 * een `switch` bedient: bij het script hoort een knop, bij de switch hoort dit.
 *
 * Hij is te bedienen zoals je hem ziet: schuiven. Tikken werkt ook -- iedereen
 * doet dat, en een schakelaar die alleen op slepen reageert leest als kapot --
 * maar de greep volgt je vinger, en waar je loslaat bepaalt de stand. Dat is
 * dezelfde afspraak als bij `bindSlider`: je pakt hem waar je hem ziet.
 *
 * Waarom het schakelen bij LOSLATEN gebeurt en niet op `click`: tijdens een
 * sleep is er ook een click, en dan zou een sleep naar rechts eerst aanzetten
 * (loslaten) en daarna weer uitzetten (click). Toetsenbordbediening heeft geen
 * pointer en komt wél via `click` binnen -- die tak staat er dus apart in,
 * herkenbaar aan `detail === 0`.
 *
 * De schakelaar stopt zijn eigen events. Zonder dat telt een tik erop ook als
 * een tik op de kaart eronder, en dan opent er een pop-up terwijl je alleen het
 * licht wilde aandoen. Dezelfde reden waarom de chip dat doet.
 */

/** De afstand die de greep aflegt. Moet kloppen met `toggleCss` hieronder. */
const REIS = 22;

/** @param {{label?: string, cls?: string}} opts */
export const toggleHtml = ({ label = "Aan of uit", cls = "" } = {}) =>
  `<button class="toggle ${cls}" type="button" role="switch" aria-checked="false"` +
  ` aria-label="${label}"><span class="knob"></span></button>`;

/** Zet de stand. Schrijft alleen als er iets verandert. */
export function setToggle(el, on) {
  if (!el) return;
  const waarde = String(Boolean(on));
  if (el.getAttribute("aria-checked") !== waarde) el.setAttribute("aria-checked", waarde);
}

/**
 * Hang gedrag aan een schakelaar.
 *
 * @param {HTMLElement} el
 * @param {{value: () => boolean, set: (aan: boolean) => void, disabled?: () => boolean}} opts
 * @returns {() => void} teardown
 */
export function bindToggle(el, opts) {
  const knob = el.querySelector(".knob");

  let slepen = false;
  let startX = 0;
  let verschoven = false;
  let doorPointer = false;

  const uit = () => {
    slepen = false;
    el.classList.remove("dragging");
    knob?.style.removeProperty("--knob");
  };

  const schakel = (naar) => {
    if (naar === opts.value()) return;
    // De stand meteen laten zien. Home Assistant bevestigt hem een tel later
    // met een verse state; tot die tijd staat de schakelaar waar je hem zette,
    // in plaats van terug te springen en dan alsnog om te gaan.
    setToggle(el, naar);
    opts.set(naar);
  };

  const down = (e) => {
    if (opts.disabled?.()) return;
    if (e.button != null && e.button !== 0) return;
    e.stopPropagation();
    slepen = true;
    verschoven = false;
    doorPointer = false;
    startX = e.clientX;
    el.classList.add("dragging");
    try {
      el.setPointerCapture?.(e.pointerId);
    } catch {
      // Vangen lukte niet. Slepen werkt dan nog steeds binnen het element.
    }
  };

  const move = (e) => {
    if (!slepen) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) verschoven = true;
    const basis = opts.value() ? REIS : 0;
    const px = Math.min(REIS, Math.max(0, basis + dx));
    knob?.style.setProperty("--knob", `${px}px`);
  };

  const up = (e) => {
    if (!slepen) return;
    e.stopPropagation();
    const dx = e.clientX - startX;
    const basis = opts.value() ? REIS : 0;
    const px = Math.min(REIS, Math.max(0, basis + dx));
    uit();
    try {
      if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
    } catch {
      // Al losgelaten.
    }
    doorPointer = true;
    // Geschoven: waar je loslaat bepaalt de stand. Getikt: gewoon omdraaien.
    schakel(verschoven ? px > REIS / 2 : !opts.value());
  };

  const cancel = () => {
    if (!slepen) return;
    uit();
  };

  const click = (e) => {
    // De schakelaar heeft zijn werk al gedaan bij het loslaten; deze click is
    // de nasleep daarvan. Wel tegenhouden, anders opent de kaart eronder.
    e.stopPropagation();
    e.preventDefault();
    if (doorPointer) {
      doorPointer = false;
      return;
    }
    // Geen pointer eraan te pas gekomen: toetsenbord, of hulptechnologie.
    if (opts.disabled?.()) return;
    schakel(!opts.value());
  };

  el.addEventListener("pointerdown", down);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", cancel);
  el.addEventListener("click", click);

  return () => {
    el.removeEventListener("pointerdown", down);
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", cancel);
    el.removeEventListener("click", click);
  };
}

/**
 * De opmaak. Eén maat voor de hele familie.
 *
 * De kleur komt van `--tone`, net als bij de chip ernaast: een aanstaande
 * schakelaar draagt de kleur van waar hij bij hoort, een uitstaande is stil.
 */
export const toggleCss = /* css */ `
  .toggle {
    flex: 0 0 auto; position: relative; margin-left: auto;
    width: 46px; height: 26px; padding: 0; cursor: pointer;
    border-radius: var(--dac-radius-pill);
    background: rgba(255, 255, 255, .08);
    border: 1px solid var(--dac-border);
    touch-action: pan-y; -webkit-tap-highlight-color: transparent;
    transition: background 200ms ease, border-color 200ms ease;
  }
  .toggle .knob {
    position: absolute; top: 2px; left: 2px; width: 20px; height: 20px;
    border-radius: 50%; background: var(--dac-ink-2); pointer-events: none;
    transform: translateX(var(--knob, 0px));
    transition: transform 220ms cubic-bezier(.3, .8, .4, 1), background 200ms ease;
  }
  .toggle[aria-checked="true"] {
    background: color-mix(in srgb, var(--tone) 28%, transparent);
    border-color: color-mix(in srgb, var(--tone) 55%, transparent);
  }
  .toggle[aria-checked="true"] .knob { --knob: ${REIS}px; background: var(--dac-ink); }
  .toggle.dragging .knob { transition: none; }
  .toggle:hover { border-color: var(--dac-border-hi); }
`;
