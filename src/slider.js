/**
 * Een schuif die je overal kunt pakken.
 *
 * Hier stond een `<input type="range">`, en dat werkt met een muis prima. Met een
 * vinger niet: je moest de knop zelf raken en dan pas slepen, en die knop is een
 * paar pixels breed. Mushroom doet het anders -- je drukt ergens op de balk, de
 * waarde springt daarheen, en je sleept verder zonder los te laten. Dat is wat
 * hieronder staat.
 *
 * `setPointerCapture` is het stuk dat het af maakt: zodra de vinger neer is,
 * blijven alle bewegingen naar dit element gaan, ook als je buiten de kaart
 * uitkomt. Zonder dat verlies je de schuif zodra je iets te ver naar boven veegt.
 *
 * `onInput` gaat bij elke beweging af en is voor het beeld. `onCommit` gaat één
 * keer af bij loslaten en is voor de service-aanroep: turn_on op elke pixel
 * overspoelt de bus en laat oudere Zigbee-lampen zichtbaar stotteren.
 */

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * @param {HTMLElement} el het element dat de schaal is (de hele balk)
 * @param {{min?:number, max?:number, step?:number,
 *          value:() => number, onInput:(v:number)=>void, onCommit:(v:number)=>void,
 *          disabled?:() => boolean}} opts
 * @returns {() => void} teardown
 */
export function bindSlider(el, opts) {
  const min = opts.min ?? 0;
  const max = opts.max ?? 100;
  const step = opts.step ?? 1;

  let dragging = false;

  const valueAt = (clientX) => {
    const r = el.getBoundingClientRect();
    if (!r.width) return min;
    const ratio = clamp((clientX - r.left) / r.width, 0, 1);
    const raw = min + ratio * (max - min);
    return clamp(Math.round(raw / step) * step, min, max);
  };

  /**
   * Vangen en loslaten mag nooit de rest onderuit halen.
   *
   * `releasePointerCapture` gooit een NotFoundError zodra er geen actieve
   * pointer meer is -- na een onderbroken gebaar, of wanneer het besturings-
   * systeem de aanraking al heeft ingetrokken. Onafgevangen betekent dat: geen
   * onCommit, dus geen service-aanroep, dus een schuif die je verzet en die
   * daarna terugspringt.
   */
  const capture = (id) => {
    try {
      el.setPointerCapture?.(id);
    } catch {
      // Vangen lukte niet; slepen werkt dan nog steeds, alleen niet buiten het
      // element. Dat is geen reden om de beweging af te breken.
    }
  };

  const release = (id) => {
    try {
      if (el.hasPointerCapture?.(id)) el.releasePointerCapture(id);
    } catch {
      // Al losgelaten. Prima.
    }
  };

  const down = (e) => {
    if (opts.disabled?.()) return;
    if (e.button != null && e.button !== 0) return;
    dragging = true;
    capture(e.pointerId);
    el.classList.add("dragging");
    // De waarde springt meteen naar waar je drukt -- geen dood eerste contact.
    opts.onInput(valueAt(e.clientX));
    e.preventDefault();
  };

  const move = (e) => {
    if (!dragging) return;
    opts.onInput(valueAt(e.clientX));
    e.preventDefault();
  };

  const up = (e) => {
    if (!dragging) return;
    dragging = false;
    release(e.pointerId);
    el.classList.remove("dragging");
    opts.onCommit(valueAt(e.clientX));
  };

  const cancel = (e) => {
    if (!dragging) return;
    dragging = false;
    release(e?.pointerId);
    el.classList.remove("dragging");
    // Afgebroken gebaar: terug naar wat het apparaat zegt, niet naar waar de
    // vinger toevallig was.
    opts.onInput(opts.value());
  };

  const key = (e) => {
    if (opts.disabled?.()) return;
    const big = (max - min) / 10;
    const map = {
      ArrowLeft: -step, ArrowDown: -step,
      ArrowRight: step, ArrowUp: step,
      PageDown: -big, PageUp: big,
      Home: -Infinity, End: Infinity,
    };
    if (!(e.key in map)) return;
    e.preventDefault();
    const now = opts.value();
    const next = clamp(
      map[e.key] === -Infinity ? min : map[e.key] === Infinity ? max : now + map[e.key],
      min,
      max
    );
    opts.onInput(next);
    opts.onCommit(next);
  };

  el.addEventListener("pointerdown", down);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", cancel);
  el.addEventListener("keydown", key);

  return () => {
    el.removeEventListener("pointerdown", down);
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", cancel);
    el.removeEventListener("keydown", key);
  };
}

/** De opbouw die `bindSlider` verwacht. */
export const sliderHtml = (cls = "") => `
  <div class="slider ${cls}" role="slider" tabindex="0"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div class="track"><div class="fill"></div></div>
    <div class="thumb"></div>
  </div>`;

/** Gedeelde opmaak: dikke balk, dikke greep, hele breedte is raakvlak. */
export const sliderCss = /* css */ `
  .slider {
    position: relative; flex: 1 1 90px; min-width: 70px; height: 36px;
    cursor: ew-resize; touch-action: none; -webkit-tap-highlight-color: transparent;
    display: flex; align-items: center;
  }
  .slider .track {
    position: absolute; inset: 0; border-radius: 10px;
    background: var(--strip, rgba(255,255,255,.075)); overflow: hidden;
  }
  .slider .fill {
    position: absolute; inset: 0 auto 0 0; width: var(--v, 0%);
    background: linear-gradient(90deg,
      color-mix(in srgb, var(--tone) 55%, transparent), var(--tone));
    transition: width 90ms linear;
  }
  .slider.dragging .fill { transition: none; }

  /* De greep is een dikke witte balk. Hij wijst alleen aan waar je staat --
     pakken kan overal, dus hij hoeft niet groot genoeg te zijn om te raken. */
  .slider .thumb {
    position: absolute; top: 5px; bottom: 5px; left: var(--v, 0%);
    width: 5px; margin-left: -2.5px; border-radius: 3px;
    background: rgba(255,255,255,.95); box-shadow: 0 0 6px rgba(0,0,0,.55);
    pointer-events: none; transition: left 90ms linear;
  }
  .slider.dragging .thumb { transition: none; }
  .slider[data-strip] .fill { display: none; }
  .slider:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; border-radius: 10px; }
`;
