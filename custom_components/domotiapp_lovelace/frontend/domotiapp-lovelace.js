var ks=Object.defineProperty;var xs=(a,e,t)=>e in a?ks(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var j=(a,e,t)=>xs(a,typeof e!="symbol"?e+"":e,t);var X=`
  --dac-bg:            #0c0c0a;
  --dac-bg-raise:      #12120f;
  --dac-surface:       rgba(255, 255, 255, 0.038);
  --dac-surface-hi:    rgba(255, 255, 255, 0.070);
  --dac-border:        rgba(232, 228, 222, 0.10);
  --dac-border-hi:     rgba(232, 228, 222, 0.20);

  --dac-ink:           #e8e4de;
  --dac-ink-2:         rgba(232, 228, 222, 0.62);
  --dac-ink-3:         rgba(232, 228, 222, 0.38);

  --dac-accent:        #026fa1;
  --dac-accent-hi:     #198fd9;
  --dac-accent-soft:   rgba(2, 111, 161, 0.18);
  --dac-accent-glow:   rgba(25, 143, 217, 0.30);

  /* Energy streams -- validated categorical set. See the note above. */
  --dac-solar:         #dc7300;
  --dac-house:         #235efa;
  --dac-grid-in:       #129be4;
  --dac-grid-out:      #bc10c8;
  --dac-device-1:      #fd0774;
  --dac-device-2:      #039580;

  /* Status -- reserved meaning, always shipped with an icon and a label. */
  --dac-good:          #0ca30c;
  --dac-warn:          #fab219;
  --dac-bad:           #d03b3b;

  /* Light that is actually on. Warm, and distinct from --dac-warn, which means
     "let op". A lamp is not a warning. */
  --dac-lit:           #f5c451;

  --dac-radius:        20px;
  --dac-radius-sm:     12px;
  --dac-radius-pill:   999px;

  /* Home Assistant's own UI font, so the cards match the rest of HA. */
  --dac-font:          var(--ha-font-family-body,
                         var(--paper-font-body1_-_font-family,
                           Roboto, "Noto Sans", "Segoe UI", system-ui, sans-serif));

  /* Alleen de haarlijn bovenlangs, en GEEN slagschaduw meer.
   *
   * Er stond 0 18px 40px -24px rgba(0,0,0,0.9) bij. Op een kaart van drie
   * rijen valt dat weg, maar op een kaart van EEN rij -- een entiteitenkaart
   * met een regel erin, de meest gebruikte vorm in dit huis -- zit die
   * schaduw net zo hoog als de kaart zelf, en dan is het geen schaduw meer
   * maar een donkere vlek eronder. Staan er drie van die kaarten onder elkaar,
   * dan tellen de vlekken op tot banden.
   *
   * De eigenaar heeft daar sinds 0.10.0 zijn thema van verdacht. Het was dit,
   * en dat bleek toen hij zijn thema uitzette en de vlek bleef staan
   * (26 augustus 2026). Dit is dus een BEWUSTE afwijking van de tokens van de
   * Coach; verandert daar de schaduw, dan blijft deze regel staan. */
  --dac-shadow:        0 1px 0 rgba(255, 255, 255, 0.04) inset;

  /* One row height for every interactive card in the family, so a column of
     mixed cards lines up instead of stepping. */
  --dac-row-h:         56px;
`,ke=`
  *, *::before, *::after { box-sizing: border-box; }

  /* Het kaartvlak: vulling, rand, hoeken en schaduw.
   *
   * "Achtergrond weglaten" (bare: true) haalt hiervan de VULLING en de
   * SCHADUW weg, en laat de rand en de hoeken staan. Dat was tot 0.10.0 anders
   * -- toen ging de rand mee, en dan houd je geen doorzichtige kaart over maar
   * losse inhoud zonder vorm. Op een donker dashboard is die haarlijn het
   * enige dat nog zegt waar de kaart begint en ophoudt; de eigenaar miste hem
   * op 26 augustus 2026 op de eerste kaart waar hij het vinkje aanzette. Wie
   * echt niets wil, zet de kaart in een surface: none (entiteitenkaart) of
   * laat het vinkje uit en gebruikt geen kaart. */
  .surface {
    background: var(--dac-surface);
    border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius);
    box-shadow: var(--dac-shadow);
  }

  .eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dac-ink-3);
  }

  /* Numerals must line up as values change -- never let them jitter. */
  .tnum { font-variant-numeric: tabular-nums; font-feature-settings: "tnum" 1; }

  /* The icon chip: identity colour at low opacity, icon at full. Used by every
     card in the family, which is most of why they read as a set. */
  .chip {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: var(--dac-radius-sm);
    color: var(--tone);
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 32%, transparent);
  }

  /* Draagt de entiteit een eigen afbeelding -- een clublogo, een profielfoto,
     het merk van een integratie -- dan vult die de chip helemaal. Een logo in
     een hoekje van 18 pixels is geen logo meer. De rand blijft staan, zodat de
     vorm klopt met de iconen ernaast. */
  .chip.pic {
    overflow: hidden;
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--dac-border);
  }
  .chip.pic img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .icon { display: block; }

  /* Safari on iOS leaves a tapped element focused and draws a heavy ring around
     it that stays after the sheet it opened is closed again. Keyboard users are
     not left without: :focus-visible below still marks the element. */
  button, [role="button"] {
    -webkit-tap-highlight-color: transparent;
  }

  :focus-visible {
    outline: 2px solid var(--dac-accent-hi);
    outline-offset: 2px;
    border-radius: 8px;
  }

  .unavailable { opacity: 0.42; }

  /* Shown when a card has been added but not yet pointed at anything.
     A card that throws instead takes the whole preview down with "Ongeldige
     configuratie", which tells the installer nothing about what is missing. */
  .needs {
    display: flex; align-items: center; gap: 14px;
    min-height: var(--dac-raster, 56px);
    padding: 18px 18px;
    background: var(--dac-surface);
    border: 1px dashed var(--dac-border-hi);
    border-radius: var(--dac-radius);
  }
  .needs .mark {
    width: 40px; height: 40px; flex: 0 0 auto;
    display: grid; place-items: center; border-radius: var(--dac-radius-sm);
    color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 32%, transparent);
  }
  .needs .mark .icon { width: 20px; height: 20px; }
  .needs b { display: block; font-size: 13.5px; font-weight: 600; }
  .needs span { display: block; margin-top: 2px; font-size: 12.5px; color: var(--dac-ink-2); }
  /* Een knop in een foutblok. Alleen daar waar opnieuw proberen ergens toe
     leidt -- een verkeerde entiteit wordt niet beter van nog een poging, een
     integratie die nog aan het opstarten was wel. */
  .needs button.opnieuw {
    display: inline-block; margin-top: 8px;
    font: inherit; font-size: 12px; font-weight: 500; cursor: pointer;
    padding: 6px 12px; border-radius: var(--dac-radius-pill);
    border: 1px solid var(--dac-border-hi);
    background: transparent; color: var(--dac-ink);
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;function J(a){let e=new CSSStyleSheet;return e.replaceSync(a),e}var jn=null,xi=a=>{jn=a},he=a=>String(a??"").split(".")[0],k=(a,e)=>e&&a?.states?.[e]||null,F=(a,e)=>k(a,e)?.attributes??{},$t=(a,e,t)=>t?null:F(a,e).entity_picture||null;function _i(a){if(!a||a.state!=="on")return null;let e=a.attributes??{};if(Array.isArray(e.entity_id))return null;let t=e.rgb_color;return Array.isArray(t)&&t.length>=3?`rgb(${t[0]},${t[1]},${t[2]})`:null}function C(a,e,t){return t||F(a,e).friendly_name||e||""}var _s=new Set(["scene","script","input_button","button","event"]),En=a=>_s.has(he(a));function ee(a){return!a||a.state==="unavailable"?!0:a.state==="unknown"?!En(a.entity_id):!1}function xe(a){if(!a)return!1;let e=a.state;if(e==="unavailable"||e==="unknown")return!1;switch(he(a.entity_id)){case"cover":return e==="open"||e==="opening";case"alarm_control_panel":return e.startsWith("armed")||e==="triggered"||e==="arming";case"climate":case"water_heater":case"humidifier":return e!=="off";case"person":case"device_tracker":return e==="home";case"media_player":return e!=="off"&&e!=="idle"&&e!=="standby";default:return e==="on"||e==="playing"||e==="active"||e==="heat"}}var ws=new Set(["light","switch","fan","input_boolean","automation","siren","humidifier","remote","water_heater"]),wi=a=>ws.has(he(a));function yi(a,e,t){if(!a||a.themes!==e.themes||a.language!==e.language)return!0;for(let n of t)if(n&&a.states?.[n]!==e.states?.[n])return!0;return!1}function Et(a,e,t={}){a.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!1}))}var Q=(a,e)=>Et(a,"hass-more-info",{entityId:e});function Je(a){switch(he(a)){case"light":case"switch":case"fan":case"input_boolean":case"automation":case"siren":return{action:"toggle"};case"script":case"scene":case"input_button":case"button":return{action:"toggle"};default:return{action:"more-info"}}}function ys(a){switch(he(a)){case"scene":return["scene","turn_on"];case"script":return["script","turn_on"];case"input_button":return["input_button","press"];case"button":return["button","press"];case"lock":return["lock","open"];case"cover":return["cover","toggle"];case"media_player":return["media_player","media_play_pause"];default:return["homeassistant","toggle"]}}function ue(a,e,t,n){if(!(!n||n.action==="none")){if(n.confirmation){let i=n.confirmation===!0?{}:n.confirmation;if(!jn){console.warn("DomotiApp: geen bevestigingsscherm geladen; de actie is niet uitgevoerd.");return}jn(i).then(r=>{r&&bi(a,e,t,n)});return}bi(a,e,t,n)}}function bi(a,e,t,n){switch(n.action){case"more-info":Q(a,n.entity||t.entity);break;case"toggle":{let i=n.entity||t.entity;if(!i)break;let[r,o]=ys(i);e.callService(r,o,{entity_id:i});break}case"perform-action":case"call-service":{let i=n.perform_action||n.service;if(!i)break;let[r,o]=i.split(".");e.callService(r,o,n.data??n.service_data??{},n.target);break}case"navigate":if(!n.navigation_path)break;history.pushState(null,"",n.navigation_path),Et(window,"location-changed",{replace:!1});break;case"url":n.url_path&&window.open(n.url_path,n.target??"_blank");break;case"assist":Et(a,"show-dialog",{dialogTag:"ha-voice-command-dialog",dialogImport:()=>{},dialogParams:{}});break;case"fire-dom-event":Et(a,"ll-custom",n);break;default:break}}function R(a,{onTap:e,onHold:t,onDouble:n}){let o=0,s=0,d=null,l=p=>{p.button!=null&&p.button!==0||(o=Date.now())},c=()=>{let p=o?Date.now()-o:0;if(o=0,t&&p>=500){navigator.vibrate?.(18),t();return}if(!n){e?.();return}if(s++,s===1){d=setTimeout(()=>{s=0,e?.()},260);return}clearTimeout(d),s=0,n()};return a.addEventListener("pointerdown",l),a.addEventListener("click",c),a.addEventListener("contextmenu",p=>p.preventDefault()),()=>{clearTimeout(d),a.removeEventListener("pointerdown",l),a.removeEventListener("click",c)}}function Y(a,e){if(!e)return"";let t=he(e.entity_id),n=e.attributes.device_class;return a.formatEntityState?.(e)??a.localize?.(`component.${t}.entity_component.${n??"_"}.state.${e.state}`)??a.localize?.(`component.${t}.entity_component._.state.${e.state}`)??e.state}function G(a,e,t){let n=Number(e);return Number.isFinite(n)?n.toLocaleString(a?.locale?.language??"nl",{minimumFractionDigits:t??0,maximumFractionDigits:t??0}):"--"}var vi=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],zi=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"],ki=(a=new Date)=>new Date(a.getFullYear(),a.getMonth(),a.getDate()),$n=(a,e)=>Math.round((ki(e)-ki(a))/864e5);function et(a){if(!a)return null;if(a instanceof Date)return Number.isNaN(+a)?null:a;let e=String(a).trim(),t=e.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);if(t)return new Date(+t[3],+t[2]-1,+t[1]);if(t=e.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/),t)return new Date(+t[1],+t[2]-1,+t[3]);let n=new Date(e);return Number.isNaN(+n)?null:n}function An(a,e=new Date){if(!a)return"";let t=$n(e,a);return t<0?`${Math.abs(t)} dagen geleden`:t===0?"vandaag":t===1?"morgen":t===2?"overmorgen":t<=6?vi[a.getDay()]:`${vi[a.getDay()].slice(0,2)} ${a.getDate()} ${zi[a.getMonth()]}`}var ji=a=>a?`${a.getDate()} ${zi[a.getMonth()]}`:"";function zs(a){let e=Math.max(1,Math.ceil((a+8)/64));return e*56+(e-1)*8}function js(a){if(!a)return 0;let e=getComputedStyle(a),t=[...a.children].filter(r=>r.getBoundingClientRect().height>0);if(!t.length)return 0;let n=parseFloat(e.rowGap)||0;return t.reduce((r,o)=>r+o.getBoundingClientRect().height,0)+n*(t.length-1)+parseFloat(e.paddingTop)+parseFloat(e.paddingBottom)+parseFloat(e.borderTopWidth)+parseFloat(e.borderBottomWidth)}function L(a,e=4){if(!a)return;let t=js(a);if(!t){e>0&&requestAnimationFrame(()=>L(a,e-1));return}let n=`${zs(t)}px`;a.style.getPropertyValue("--dac-raster")!==n&&a.style.setProperty("--dac-raster",n)}function Ve(a){let e=parseFloat(a?.style?.getPropertyValue?.("--dac-raster")??"");return!Number.isFinite(e)||e<=0?null:Math.max(1,Math.round((e+8)/64))}function P(a){if(!a||typeof ResizeObserver>"u")return()=>{};let e=new ResizeObserver(()=>{for(let t of a.children)e.observe(t);L(a)});e.observe(a);for(let t of a.children)e.observe(t);return L(a),()=>e.disconnect()}var Es="home-assistant";function Ei({leesRegistry:a,definities:e,waarschuw:t=()=>{},plan:n=(d,l)=>setTimeout(d,l),nu:i=()=>Date.now(),marker:r=Es,intervalMs:o=20,maxWachtMs:s=1e4}){let d=i();function l(){let h=a();if(!h)return!1;for(let[g,m]of e)try{h.get(g)||h.define(g,m)}catch(b){t(`kon ${g} niet registreren: ${b&&b.message}`)}return!0}function c(){let h=a();return!h||!h.get(r)?!1:l()}if(c())return!0;let p=()=>{if(!c()){if(i()-d>=s){t(`${r} is na ${s} ms niet verschenen; de kaart wordt alsnog geregistreerd`),l();return}n(p,o)}};return n(p,o),!1}var $i=[];function S(a,e){$i.push([a,e])}function Pe({type:a,name:e,description:t,preview:n=!0,documentationURL:i}){window.customCards=window.customCards??[],!window.customCards.some(r=>r.type===a)&&window.customCards.push({type:a,name:e??a,description:t??"",preview:n,documentationURL:i??"https://github.com/Sven2410/domotiapp-lovelace"})}function Ai(a=()=>{}){Ei({leesRegistry:()=>globalThis.customElements,definities:$i,waarschuw:a})}var $s=`
  :host {
    ${X}
    display: block;
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  :host([hidden]) { display: none; }
`,O={accent:"var(--dac-accent-hi)",solar:"var(--dac-solar)",house:"var(--dac-house)",water:"var(--dac-grid-in)",magenta:"var(--dac-grid-out)",pink:"var(--dac-device-1)",teal:"var(--dac-device-2)",lit:"var(--dac-lit)",good:"var(--dac-good)",warn:"var(--dac-warn)",bad:"var(--dac-bad)",neutral:"var(--dac-ink-3)"},Si={accent:"Accent",solar:"Oranje",house:"Blauw",water:"Lichtblauw",magenta:"Magenta",pink:"Roze",teal:"Groenblauw",lit:"Lampgeel",good:"Goed",warn:"Let op",bad:"Kritiek",neutral:"Neutraal"},U=a=>String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),B=(a,e="accent")=>O[a]??(a&&/[#(]|^var/.test(a)?a:O[e]),T=Symbol("incomplete"),As=a=>`
  <div class="needs">
    <span class="mark"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6"/>
      <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>
    </svg></span>
    <span><b>Nog niets gekozen</b><span>${a}</span></span>
  </div>`,Ms=56,Mi=8,me=a=>Math.max(1,Math.ceil((a+Mi)/(Ms+Mi))),A=class extends HTMLElement{static get styleSheets_(){return Object.hasOwn(this,"sheets_")||(this.sheets_=[J($s+ke+this.css)]),this.sheets_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=new.target.styleSheets_,this.built_=!1,this.wired_=!1,this.teardown_=[],this.bewaakFocusRing_()}bewaakFocusRing_(){let e=0,t=0;this.shadowRoot.addEventListener("pointerdown",()=>{e=Date.now()},!0),this.shadowRoot.addEventListener("keydown",()=>{t=Date.now()},!0),this.shadowRoot.addEventListener("focusin",n=>{if(t>=e)return;let i=n.target;!i?.matches||i.matches("input, textarea, select, [contenteditable]")||requestAnimationFrame(()=>{t>=e||i.isConnected&&i.matches(":focus-visible")&&i.blur?.()})},!0)}setConfig(e){let t=this.validate(e??{});this.config=t,this.built_&&(this.destroy_(),this.shadowRoot.replaceChildren(),this.built_=!1,this.wired_=!1),this.isConnected&&this.build_()}set hass(e){let t=this.hass_;if(this.hass_=e,!!this.config){if(!this.built_){this.build_();return}this.config[T]||yi(t,e,this.watched())&&this.paint()}}get hass(){return this.hass_}connectedCallback(){if(this.config){if(!this.built_){this.build_();return}this.config[T]||this.wired_||(this.wire(),this.wired_=!0,this.hass_&&this.paint())}}disconnectedCallback(){this.destroy_(),this.wired_=!1}validate(e){return e}watched(){return this.config?.entity?[this.config.entity]:[]}template(){return""}wire(){}paint(){}build_(){let e=document.createElement("template"),t=this.config?.[T];if(e.innerHTML=t?As(t):this.template(),this.shadowRoot.appendChild(e.content),this.built_=!0,t){this.teardown_.push(P(this.$(".needs")));return}this.wire(),this.wired_=!0,this.hass_&&this.paint()}destroy_(){for(let e of this.teardown_)try{e()}catch{}this.teardown_=[]}on(e,t,n,i){e&&(e.addEventListener(t,n,i),this.teardown_.push(()=>e.removeEventListener(t,n,i)))}$(e){return this.shadowRoot.querySelector(e)}$$(e){return[...this.shadowRoot.querySelectorAll(e)]}text(e,t){let n=typeof e=="string"?this.$(e):e;n&&n.textContent!==String(t)&&(n.textContent=t)}getCardSize(){return 1}minRijen_(e=".card",t=1){return Ve(this.$(e))??t}};j(A,"css","");function N(a,e,{name:t,description:n,preview:i=!0}={}){S(a,e),Pe({type:a,name:t,description:n,preview:i})}function I(a,e){S(a,e)}var u=(a,e="none")=>`<svg class="icon" viewBox="0 0 24 24" fill="${e}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${a}</svg>`,E={house:u(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
    <path d="M5.4 12.9V20a.9.9 0 0 0 .9.9h11.4a.9.9 0 0 0 .9-.9v-7.1"/>
    <path d="M9.8 20.9v-5.2h4.4v5.2"/>`),floorB:u(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M9.4 17.8V14h2.4a1.9 1.9 0 0 1 0 3.8Z"/>`),floor1:u(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M10.6 15.2 12 14v3.9"/>`),floor2:u(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M10.4 14.8a1.6 1.6 0 0 1 3.1.5c0 1.4-3.1 1.8-3.1 3.5h3.2"/>`),garage:u(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M8.2 20.4v-5.6h7.6v5.6M8.2 17.6h7.6"/>`),garageOpen:u(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M7.6 14.4h8.8M7.6 12.4h8.8"/>`),garageClosed:u(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M7.6 13.2h8.8M7.6 15.4h8.8M7.6 17.6h8.8M7.6 19.8h8.8"/>`),bed:u(`<path d="M3.2 20.2V8.4"/>
    <path d="M3.2 16.4h17.6v3.8"/>
    <path d="M20.8 16.4v-3.1a2.3 2.3 0 0 0-2.3-2.3H9.9v5.4"/>
    <circle cx="6.8" cy="12.7" r="2"/>`),bedDouble:u(`<path d="M2.4 20.4V8.2M21.6 20.4V8.2"/>
    <path d="M2.4 16.6h19.2v3.8"/>
    <path d="M21.6 16.6v-2.9a2.2 2.2 0 0 0-2.2-2.2H4.6a2.2 2.2 0 0 0-2.2 2.2v2.9"/>
    <path d="M12 11.5v5.1"/>
    <path d="M5.2 11.5V9.9a.9.9 0 0 1 .9-.9h3.6a.9.9 0 0 1 .9.9v1.6"/>
    <path d="M13.4 11.5V9.9a.9.9 0 0 1 .9-.9h3.6a.9.9 0 0 1 .9.9v1.6"/>`),hanger:u(`<path d="M12 8.4V7.2a2.1 2.1 0 1 1 2.1-2.1"/>
    <path d="M12 8.4 3.2 15.6a1.4 1.4 0 0 0 .9 2.5h15.8a1.4 1.4 0 0 0 .9-2.5L12 8.4Z"/>`),wardrobe:u(`<rect x="4.2" y="2.8" width="15.6" height="17" rx="1.8"/>
    <path d="M12 2.8v17"/>
    <path d="M10.2 10.6v2.4M13.8 10.6v2.4"/>
    <path d="M6.6 19.8v1.6M17.4 19.8v1.6"/>`),sofa:u(`<path d="M5.2 11.6V8.4a1.9 1.9 0 0 1 1.9-1.9h9.8a1.9 1.9 0 0 1 1.9 1.9v3.2"/>
    <path d="M3 17.4v-4.1a2 2 0 0 1 4 0v1.5h10v-1.5a2 2 0 0 1 4 0v4.1z"/>
    <path d="M5.8 17.4v2.2M18.2 17.4v2.2"/>`),kitchen:u(`<path d="M4.4 10.2h15.2v5.2a4 4 0 0 1-4 4H8.4a4 4 0 0 1-4-4z"/>
    <path d="M2.4 12.2h2M19.6 12.2h2"/>
    <path d="M9.4 7.4c0-1.1 1.2-1.1 1.2-2.2M13.4 7.4c0-1.1 1.2-1.1 1.2-2.2"/>`),shower:u(`<path d="M4.6 20.6V7.2a2.6 2.6 0 0 1 2.6-2.6h5.2A2.6 2.6 0 0 1 15 7.2v1.6"/>
    <path d="M11 12.4a4 4 0 0 1 8 0z"/>
    <path d="M12.8 15.4v1.6M15 15.4v1.6M17.2 15.4v1.6M13.9 18.8v1.6M16.1 18.8v1.6"/>`),toilet:u(`<path d="M7 3.6h3.6v4.8H7z"/>
    <path d="M5.2 8.4h11.6l-1 5.2a4.6 4.6 0 0 1-4.5 3.7h-1a4.6 4.6 0 0 1-4.5-3.7z"/>
    <path d="M9.2 17.4v2.8h4.2v-2.8M7.6 20.2h7.4"/>`),desk:u(`<rect x="4.6" y="4.2" width="14.8" height="9.4" rx="1.8"/>
    <path d="M10.4 13.6v2.6h3.2v-2.6"/>
    <path d="M2.8 18.4h18.4"/>
    <path d="M5.2 18.4v2.4M18.8 18.4v2.4"/>`),stairs:u(`<path d="M3.6 20.4V16h4.3v-4.3h4.3V7.4h4.3V3.2h4.1"/>
    <path d="M3.6 20.4h16.8"/>`),parasol:u(`<path d="M12 20.8V9.4"/>
    <path d="M2.8 9.4a9.2 9.2 0 0 1 18.4 0z"/>
    <path d="M6.6 9.4C6.6 5.9 9 3 12 3s5.4 2.9 5.4 6.4"/>
    <path d="M12 20.8a2.2 2.2 0 0 0 2.2-2.2"/>`),fence:u(`<path d="M4.4 20.4V8.6L6.8 6l2.4 2.6v11.8M14.8 20.4V8.6L17.2 6l2.4 2.6v11.8"/>
    <path d="M2.6 11.4h18.8M2.6 15.4h18.8"/>
    <path d="M9.2 11.4v4M14.8 11.4v4"/>`),tree:u(`<path d="M12 3 7.6 9.4h8.8z"/>
    <path d="M12 7.6 5.8 16.2h12.4z"/>
    <path d="M12 16.2v4.4"/>
    <path d="M9.4 20.6h5.2"/>`),shutter:u(`<path d="M3.6 4.2h16.8M5.2 4.2v13.4M18.8 4.2v13.4"/>
    <path d="M5.2 7.6h13.6M5.2 11h13.6M5.2 14.4h13.6M5.2 17.6h13.6"/>`),shutterOpen:u(`<path d="M3.6 4.2h16.8M5.2 4.2v15.6M18.8 4.2v15.6"/>
    <path d="M5.2 6.6h13.6M5.2 8.6h13.6"/>`),awning:u(`<path d="M2.8 11.4 6.2 5h11.6l3.4 6.4z"/>
    <path d="M2.8 11.4c1.5 1.7 3 1.7 4.5 0s3-1.7 4.5 0 3 1.7 4.5 0 3-1.7 4.5 0"/>
    <path d="M12 14.6v4.8"/>`),arrowUp:u('<path d="M12 19.4V5M6.4 10.6 12 5l5.6 5.6"/>'),arrowDown:u('<path d="M12 4.6V19M17.6 13.4 12 19l-5.6-5.6"/>'),stop:u('<rect x="6.4" y="6.4" width="11.2" height="11.2" rx="1.8"/>'),bulb:u(`<path d="M9.4 18.4h5.2M10.4 21.2h3.2"/>
    <path d="M12 2.9a6.2 6.2 0 0 0-3.6 11.2c.5.4.8 1 .8 1.7v.4h5.6v-.4c0-.7.3-1.3.8-1.7A6.2 6.2 0 0 0 12 2.9Z"/>`),bulbGroup:u(`<path d="M7.6 15.6h4M8.2 17.8h2.8"/>
    <path d="M9.6 3.4a4.8 4.8 0 0 0-2.8 8.7c.4.3.6.8.6 1.3v.5h4.4v-.5c0-.5.2-1 .6-1.3a4.8 4.8 0 0 0-2.8-8.7Z"/>
    <path d="M16 8.4a4.4 4.4 0 0 1 2.4 8c-.3.3-.5.7-.5 1.1v.4h-3.8"/>
    <path d="M15.4 20.6h2.4"/>`),switchOn:u(`<rect x="2.8" y="7.4" width="18.4" height="9.2" rx="4.6"/>
    <circle cx="16.6" cy="12" r="2.6" fill="currentColor" stroke="none"/>`),person:u(`<circle cx="12" cy="7.6" r="3.6"/>
    <path d="M4.8 20.4v-1.2a5 5 0 0 1 5-5h4.4a5 5 0 0 1 5 5v1.2"/>`),people:u(`<circle cx="9.4" cy="8.2" r="3.2"/>
    <path d="M3.4 20v-1a4.6 4.6 0 0 1 4.6-4.6h2.8A4.6 4.6 0 0 1 15.4 19v1"/>
    <path d="M16.2 5.3a3.2 3.2 0 0 1 0 5.9"/>
    <path d="M17.6 14.6a4.6 4.6 0 0 1 3 4.3V20"/>`),away:u(`<circle cx="10.4" cy="7.6" r="3.4"/>
    <path d="M3.6 20.4v-1.2a4.8 4.8 0 0 1 4.8-4.8h2.6"/>
    <path d="M14.6 17.4h6M18 14.8l2.6 2.6-2.6 2.6"/>`),bin:u(`<path d="M3.6 6.8h16.8"/>
    <path d="M9.4 6.8V4.6a.9.9 0 0 1 .9-.9h3.4a.9.9 0 0 1 .9.9v2.2"/>
    <path d="m5.9 6.8 1 12.5a1 1 0 0 0 1 .9h8.2a1 1 0 0 0 1-.9l1-12.5"/>
    <path d="M10.2 10.6v5.8M13.8 10.6v5.8"/>`),binWheeled:u(`<path d="M5.6 7.4h12.8l-1 10.6a1 1 0 0 1-1 .9H7.6a1 1 0 0 1-1-.9z"/>
    <path d="M4.4 7.4h15.2M9.6 7.4V5.2h4.8v2.2"/>
    <circle cx="8.6" cy="20.4" r="1.3"/><circle cx="15.4" cy="20.4" r="1.3"/>`),calendar:u(`<rect x="3.6" y="5.4" width="16.8" height="15" rx="2"/>
    <path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6"/>`),sun:u(`<circle cx="12" cy="12" r="4.1"/>
    <path d="M12 2.4v2.3M12 19.3v2.3M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.4 12h2.3M19.3 12h2.3M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>`),cloud:u('<path d="M7.2 18.4a4.2 4.2 0 0 1-.5-8.4 5.6 5.6 0 0 1 10.8-1.2 3.9 3.9 0 0 1 .6 7.7z"/>'),cloudSun:u(`<path d="M6.8 8.2a3.4 3.4 0 1 1 4.6 3.2"/>
    <path d="M5 4.6 6.1 5.7M3.2 9.2h1.6M9.4 4.6 8.3 5.7M6.8 1.9v1.5"/>
    <path d="M9.4 19.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10 1 3.6 3.6 0 0 1 .5 6.8z"/>`),rain:u(`<path d="M7.4 15.4a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M9 18.2 8.2 20.6M12.4 18.2l-.8 2.4M15.8 18.2l-.8 2.4"/>`),snow:u(`<path d="M7.4 14.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M9 17.6v3M7.6 18.4l2.8 1.4M10.4 18.4l-2.8 1.4"/>
    <path d="M15 17.6v3M13.6 18.4l2.8 1.4M16.4 18.4l-2.8 1.4"/>`),fog:u(`<path d="M7.4 12.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M4.4 16h15.2M6.4 19.4h11.2"/>`),wind:u(`<path d="M3.4 8.4h9.4a2.7 2.7 0 1 0-2.7-2.7"/>
    <path d="M3.4 12.6h13.2a2.7 2.7 0 1 1-2.7 2.7"/>
    <path d="M3.4 16.8h6.2a2.5 2.5 0 1 1-2.5 2.5"/>`),drop:u('<path d="M12 3.4s5.6 6.1 5.6 9.8a5.6 5.6 0 0 1-11.2 0C6.4 9.5 12 3.4 12 3.4Z"/>'),humidity:u(`<path d="M12 3.4s5.6 6.1 5.6 9.8a5.6 5.6 0 0 1-11.2 0C6.4 9.5 12 3.4 12 3.4Z"/>
    <path d="M10.1 16.1 13.9 12"/>
    <circle cx="10.2" cy="12.3" r=".95"/>
    <circle cx="13.8" cy="15.8" r=".95"/>`),lux:u(`<circle cx="12" cy="6.9" r="2.8"/>
    <path d="M12 1.9v1.3M16.4 3.5l-.9.9M18.4 8.1h-1.3M5.6 8.1H4.3M7.6 4.4l.9.9"/>
    <path d="M8.6 14.1 9.7 12M12 14.5v-2.1M15.4 14.1 14.3 12"/>
    <path d="M5.6 16.2h12.8a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H5.6a1.2 1.2 0 0 1-1.2-1.2v-2.4a1.2 1.2 0 0 1 1.2-1.2Z"/>`),windSpeed:u(`<path d="M3.6 6.6h7.6a2.3 2.3 0 1 0-2.3-2.3"/>
    <path d="M3.6 10.6h4.8"/>
    <path d="M4.6 20.2a7.4 7.4 0 0 1 14.8 0"/>
    <path d="M12 20.2 16.2 15"/>
    <circle cx="12" cy="20.2" r=".9"/>`),weatherCode:u(`<path d="M7.6 14.4a3.7 3.7 0 0 1-.5-7.4 4.9 4.9 0 0 1 9.5-1 3.4 3.4 0 0 1 .5 6.7"/>
    <path d="M10.6 16.4 9.8 21M15 16.4l-.8 4.6"/>
    <path d="M8.6 17.9h7.2M8.2 19.6h7.2"/>`),forecast:u(`<path d="M7.4 11.8a3.6 3.6 0 0 1-.4-7.2 4.8 4.8 0 0 1 9.3-1 3.3 3.3 0 0 1 .5 6.5"/>
    <path d="m3.8 20.4 4.2-4.1 3 2.6 4.5-5.1"/>
    <path d="M15.9 12.8h4.3v4.3"/>`),rainfall:u(`<path d="M7.6 2.6 6.7 4.8M12 2.2l-.9 2.2M16.4 2.6l-.9 2.2"/>
    <path d="M9.2 7.4h5.6a1 1 0 0 1 1 1v10.8a2.4 2.4 0 0 1-2.4 2.4h-2.8a2.4 2.4 0 0 1-2.4-2.4V8.4a1 1 0 0 1 1-1Z"/>
    <path d="M9.2 11.8h2.1M9.2 14.8h2.1M9.2 17.8h2.1"/>`),weatherStation:u(`<path d="M12 8.2v12.4"/>
    <path d="M8.2 20.6h7.6"/>
    <circle cx="12" cy="6.4" r="1.1"/>
    <path d="M10.9 6.4H7.6a1.7 1.7 0 1 0 1.7 1.7"/>
    <path d="M13.1 6.4h3.3a1.7 1.7 0 1 1-1.7-1.7"/>
    <path d="M9.6 12.6h4.8M9.6 16h4.8"/>`),rainRadar:u(`<circle cx="12" cy="12" r="8.6"/>
    <circle cx="12" cy="12" r="4.3"/>
    <path d="M12 12 18.1 7.9"/>
    <circle cx="12" cy="12" r=".9"/>
    <path d="M8.6 16.2l-.8 1.9M11.4 17l-.8 1.9M14.2 16.2l-.8 1.9"/>`),uv:u(`<circle cx="12" cy="11.4" r="3.4"/>
    <path d="M12 3.6v1.8M12 17.4v1.6M4.6 11.4h1.8M17.6 11.4h1.8M6.6 6l1.3 1.3M16.1 15.5l1.3 1.3M6.6 16.8l1.3-1.3M16.1 7.3l1.3-1.3"/>
    <path d="M8.4 21.4h7.2"/>`),sunset:u(`<path d="M3.4 19.6h17.2M6.6 16.2a5.4 5.4 0 0 1 10.8 0"/>
    <path d="M12 3.2v3.4M5.2 6.6l1.8 1.8M18.8 6.6 17 8.4"/>`),sunrise:u(`<path d="M3.4 19.6h17.2M6.6 16.2a5.4 5.4 0 0 1 10.8 0"/>
    <path d="M12 8.2V3.4M9.4 5.8 12 3.2l2.6 2.6"/>`),thermo:u(`<path d="M14.2 14.6V5.6a2.2 2.2 0 1 0-4.4 0v9a4.2 4.2 0 1 0 4.4 0Z"/>
    <path d="M12 9.4v5.8"/>`),shield:u(`<path d="M12 3.2 4.8 5.9v5.5c0 4.4 3 8 7.2 9.4 4.2-1.4 7.2-5 7.2-9.4V5.9z"/>
    <path d="m9.1 12 2 2 3.8-4"/>`),bolt:u('<path d="M13.4 2.6 5.2 13.6h5.6L10.4 21.4l8.4-11.2h-5.6z"/>'),wifi:u(`<path d="M4.2 9.2a11.4 11.4 0 0 1 15.6 0"/>
    <path d="M7.4 12.6a6.9 6.9 0 0 1 9.2 0"/>
    <path d="M10.4 15.9a2.6 2.6 0 0 1 3.2 0"/>
    <circle cx="12" cy="19" r="1.1"/>`),smokeDetector:u(`<path d="M3 4.6h18"/>
    <path d="M6 4.6h12v5.4a2.6 2.6 0 0 1-2.6 2.6H8.6A2.6 2.6 0 0 1 6 10V4.6Z"/>
    <path d="M8.8 8h6.4"/>
    <circle cx="12" cy="10.2" r=".95" fill="currentColor" stroke="none"/>
    <path d="M8.8 16c1.5-1.3 2.8.5 4.3-.8M9.4 19.4c1.5-1.3 2.8.5 4.3-.8"/>`),co:u(`<path d="M10.6 9.2A3.4 3.4 0 1 0 10.6 14.8"/>
    <circle cx="16.2" cy="12" r="3.2"/>`),smoke:u(`<path d="M6.6 20.4c0-2.2 2.5-2.2 2.5-4.4S6.6 13.8 6.6 11.6 9.1 9.4 9.1 7.2"/>
    <path d="M12.7 20.4c0-2 2.2-2 2.2-4s-2.2-2-2.2-4 2.2-2 2.2-4"/>
    <path d="M18.3 20.4c0-1.8 1.9-1.8 1.9-3.6s-1.9-1.8-1.9-3.6"/>`),star:u('<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9.9 5.6L12 16.4l-5 2.6.9-5.6-4-3.9 5.6-.8z"/>'),moon:u('<path d="M20.4 14.3A8.6 8.6 0 0 1 9.7 3.6a8.8 8.8 0 1 0 10.7 10.7Z"/>'),radio:u(`<rect x="2.8" y="8.4" width="18.4" height="11.4" rx="2"/>
    <path d="m7.4 8.4 9.8-4.2"/>
    <circle cx="15.8" cy="14.1" r="2.9"/>
    <path d="M6.2 12.2h4.4M6.2 16h4.4"/>`),play:u('<path d="M8.6 5.8 18.4 12l-9.8 6.2z"/>'),pause:u('<path d="M9.6 5.8v12.4M14.4 5.8v12.4"/>'),next:u('<path d="m6.4 6.4 8.2 5.6-8.2 5.6z"/><path d="M17.6 6.2v11.6"/>'),prev:u('<path d="m17.6 6.4-8.2 5.6 8.2 5.6z"/><path d="M6.4 6.2v11.6"/>'),volume:u(`<path d="M4.4 9.4h3.2L12 5.9v12.2L7.6 14.6H4.4z"/>
    <path d="M15.4 9.6a3.4 3.4 0 0 1 0 4.8"/>
    <path d="M17.9 7.1a7 7 0 0 1 0 9.8"/>`),volumeMute:u(`<path d="M4.4 9.4h3.2L12 5.9v12.2L7.6 14.6H4.4z"/>
    <path d="m15.8 9.8 4.4 4.4M20.2 9.8l-4.4 4.4"/>`),search:u('<circle cx="10.6" cy="10.6" r="6.2"/><path d="m15.2 15.2 4.4 4.4"/>'),shuffle:u(`<path d="M3.6 7.6h3c1.2 0 2.3.6 3 1.6l4.2 5.6c.7 1 1.8 1.6 3 1.6h2.4"/>
    <path d="M3.6 16.4h3c1.2 0 2.3-.6 3-1.6"/>
    <path d="M13.8 9.2c.7-1 1.8-1.6 3-1.6h2.4"/>
    <path d="m17 5.4 2.2 2.2-2.2 2.2"/><path d="m17 14.2 2.2 2.2-2.2 2.2"/>`),repeat:u(`<path d="M7.4 7.4h9.2a2.6 2.6 0 0 1 2.6 2.6v1.2"/>
    <path d="m9.6 5.2-2.2 2.2 2.2 2.2"/>
    <path d="M16.6 16.6H7.4a2.6 2.6 0 0 1-2.6-2.6v-1.2"/>
    <path d="m14.4 18.8 2.2-2.2-2.2-2.2"/>`),repeatOne:u(`<path d="M7.4 7.4h9.2a2.6 2.6 0 0 1 2.6 2.6v1.2"/>
    <path d="m9.6 5.2-2.2 2.2 2.2 2.2"/>
    <path d="M16.6 16.6H7.4a2.6 2.6 0 0 1-2.6-2.6v-1.2"/>
    <path d="m14.4 18.8 2.2-2.2-2.2-2.2"/>
    <rect x="9.2" y="8.5" width="5.6" height="7" rx="1.4" fill="var(--icoon-vlak, #12120f)" stroke="none"/>
    <path d="M10.9 10.6 12.3 9.5v5"/>
    <path d="M11 14.5h2.6"/>`),speakers:u(`<rect x="3.6" y="3.8" width="8.8" height="16.4" rx="2"/>
    <circle cx="8" cy="14.4" r="2.6"/><path d="M8 7.6h.1"/>
    <path d="M15.6 6.6h4.8v10.8h-4.8"/>`),music:u(`<path d="M9.6 17.4V6.4l8.2-1.6v11"/>
    <ellipse cx="7.6" cy="17.6" rx="2.2" ry="1.9"/>
    <ellipse cx="15.8" cy="15.8" rx="2.2" ry="1.9"/>`),leaf:u(`<path d="M4.6 19.6c-1.4-7.6 3.4-14 14.9-15.2 1.1 8.4-3.3 15.3-14.9 15.2Z"/>
    <path d="M4.2 20.4c2.6-4.6 6-7.6 10.4-9.6"/>`),keuzelijst:u(`<path d="M9.4 6.2h11.2M9.4 12h11.2M9.4 17.8h11.2"/>
    <path d="M3.4 12.2 4.9 13.7 7.6 10.6"/>
    <path d="M4 6.2h1.6M4 17.8h1.6"/>`),cog:u(`<circle cx="12" cy="12" r="3.1"/>
    <path d="M12 3.4v2.2M12 18.4v2.2M20.6 12h-2.2M5.6 12H3.4M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6M18.1 18.1l-1.6-1.6M7.5 7.5 5.9 5.9"/>`),grid:u(`<rect x="3.6" y="3.6" width="7.2" height="7.2" rx="1.8"/>
    <rect x="13.2" y="3.6" width="7.2" height="7.2" rx="1.8"/>
    <rect x="3.6" y="13.2" width="7.2" height="7.2" rx="1.8"/>
    <rect x="13.2" y="13.2" width="7.2" height="7.2" rx="1.8"/>`),door:u(`<path d="M5.4 20.6h13.2"/>
    <path d="M6.8 20.6V4.6a.9.9 0 0 1 .9-.9h8.6a.9.9 0 0 1 .9.9v16"/>
    <circle cx="14.4" cy="12.4" r="1"/>`),window:u(`<rect x="4.2" y="3.8" width="15.6" height="16.4" rx="1.6"/>
    <path d="M12 3.8v16.4M4.2 12h15.6"/>`),lock:u(`<rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2"/>
    <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/>
    <circle cx="12" cy="15.3" r="1.2"/>`),lockOpen:u(`<rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2"/>
    <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.4-1.1"/>
    <circle cx="12" cy="15.3" r="1.2"/>`),fan:u(`<circle cx="12" cy="12" r="1.9"/>
    <path d="M12 10.1c0-3 .6-6.4 3-6.4 1.7 0 2.4 2.6-.4 4.6"/>
    <path d="M13.9 12c3 0 6.4.6 6.4 3 0 1.7-2.6 2.4-4.6-.4"/>
    <path d="M12 13.9c0 3-.6 6.4-3 6.4-1.7 0-2.4-2.6.4-4.6"/>
    <path d="M10.1 12c-3 0-6.4-.6-6.4-3 0-1.7 2.6-2.4 4.6.4"/>`),airco:u(`<rect x="3.4" y="4.6" width="17.2" height="8.2" rx="2"/>
    <path d="M6.6 9.6h10.8"/>
    <path d="M7.4 16.2c1.6 0 1.6 2.2 3.2 2.2M13.4 16.2c1.6 0 1.6 2.2 3.2 2.2"/>`),tv:u(`<rect x="2.8" y="4.4" width="18.4" height="12.2" rx="1.8"/>
    <path d="M8.4 20.2h7.2M12 16.6v3.6"/>`),speaker:u(`<rect x="5.6" y="2.8" width="12.8" height="18.4" rx="2"/>
    <circle cx="12" cy="15" r="3.2"/><circle cx="12" cy="6.8" r="1.2"/>`),camera:u(`<path d="M3.4 8.6A1.6 1.6 0 0 1 5 7h8a1.6 1.6 0 0 1 1.6 1.6v6.8A1.6 1.6 0 0 1 13 17H5a1.6 1.6 0 0 1-1.6-1.6z"/>
    <path d="m14.6 11 6-3v8l-6-3z"/>`),car:u(`<path d="M4.2 15.4h15.6"/>
    <path d="M6.2 15.4v2.4a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-2.4M20.3 15.4v2.4a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-2.4"/>
    <path d="M3.8 15.4v-3.2l2-4.6a1.3 1.3 0 0 1 1.2-.8h10a1.3 1.3 0 0 1 1.2.8l2 4.6v3.2z"/>
    <circle cx="7.4" cy="12.5" r=".95"/><circle cx="16.6" cy="12.5" r=".95"/>`),plug:u(`<path d="M9 3.4v5.2M15 3.4v5.2"/>
    <path d="M6.4 8.6h11.2v2.2a5.6 5.6 0 0 1-11.2 0z"/>
    <path d="M12 16.4v4.2"/>`),battery:u(`<rect x="2.8" y="7.4" width="16.4" height="9.2" rx="2"/>
    <path d="M21.2 10.6v2.8"/>
    <rect x="5.2" y="9.8" width="6" height="4.4" rx="1" fill="currentColor" stroke="none"/>`),gaugeArrow:u(`<path d="M4.2 17.4a8.4 8.4 0 1 1 15.6 0"/>
    <path d="m12 13.6 3.6-3.8"/><circle cx="12" cy="14.8" r="1.3"/>`),clock:u('<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 1.9"/>'),washer:u(`<rect x="4.2" y="2.8" width="15.6" height="18.4" rx="2"/>
    <circle cx="12" cy="14" r="4.4"/>
    <path d="M4.2 7.4h15.6M15.4 5.1h1.6"/>`),dishwasher:u(`<rect x="4.2" y="2.8" width="15.6" height="18.4" rx="2"/>
    <path d="M4.2 7.8h15.6M7.2 5.3h2.4"/>
    <path d="M9 11.4c1 1.4 1 2.8 0 4.2M12 11.4c1 1.4 1 2.8 0 4.2M15 11.4c1 1.4 1 2.8 0 4.2"/>`),printer:u(`<path d="M7 9V4.6a.6.6 0 0 1 .6-.6h8.8a.6.6 0 0 1 .6.6V9"/>
    <rect x="3.6" y="9" width="16.8" height="7.2" rx="1.8"/>
    <path d="M7 15.4h10v4a.6.6 0 0 1-.6.6H7.6a.6.6 0 0 1-.6-.6z"/>`),key:u(`<circle cx="7.8" cy="12" r="3.8"/>
    <path d="M11.6 12h8.6M17.4 12v3M20.2 12v2.2"/>`),power:u(`<path d="M12 3.6v8"/>
    <path d="M17.4 6.6a7.6 7.6 0 1 1-10.8 0"/>`),plus:u('<path d="M12 5.2v13.6M5.2 12h13.6"/>'),minus:u('<path d="M5.2 12h13.6"/>'),chevronRight:u('<path d="m9.4 6.2 5.6 5.8-5.6 5.8"/>'),chevronDown:u('<path d="m6.2 9.4 5.8 5.6 5.8-5.6"/>'),close:u('<path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"/>'),check:u('<path d="m5.2 12.6 4.4 4.4 9.2-10"/>'),dots:u('<circle cx="5.4" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.6" cy="12" r="1.5"/>'),warning:u('<path d="M12 4.2 2.8 20h18.4z"/><path d="M12 10v4.4M12 17.4v.1"/>'),question:u(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>`),pencil:u(`<path d="M4.5 19.5h3.2L18.4 8.8a1.9 1.9 0 0 0 0-2.7l-.5-.5a1.9 1.9 0 0 0-2.7 0L4.5 16.3z"/>
    <path d="m14.6 6.8 2.6 2.6"/>`),een:u(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10.6 9.9 12.4 8.6v6.9"/>`),twee:u(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10 9.7a2.1 2.1 0 1 1 3.9 1.1L9.9 15.5h4.2"/>`),drie:u(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10 9.5a2 2 0 1 1 1.8 2.6 2.1 2.1 0 1 1-1.7 2.7"/>`),vier:u(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M13.4 8.6 9.7 13.3h5"/>
    <path d="M13.4 8.6v6.9"/>`),vijf:u(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M14 8.7h-3.6v3.1h1.4a2.1 2.1 0 1 1-2 2.8"/>`),zes:u(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M13.8 9a2.2 2.2 0 0 0-3.7 1.7v2.4"/>
    <circle cx="12.1" cy="13.4" r="2.1"/>`),zeven:u(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M9.7 8.7h4.6l-2.8 6.8"/>`),acht:u(`<circle cx="12" cy="12" r="8.6"/>
    <circle cx="12" cy="10.3" r="1.7"/>
    <circle cx="12" cy="13.8" r="1.9"/>`),negen:u(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10.2 15a2.2 2.2 0 0 0 3.7-1.7v-2.4"/>
    <circle cx="11.9" cy="10.6" r="2.1"/>`),tien:u(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M8.6 10.3 10 9.2v5.7"/>
    <ellipse cx="13.9" cy="12.1" rx="1.7" ry="2.8"/>`),beach:u(`<circle cx="17" cy="6.6" r="2.6"/>
    <path d="M17 1.8v1.2M17 10.2v1.2M21.8 6.6h-1.2M13.4 6.6h-1.2M20.4 3.2l-.9.9M14.5 9.1l-.9.9"/>
    <path d="M2.4 15.4c1.6-1.5 3.2-1.5 4.8 0s3.2 1.5 4.8 0 3.2-1.5 4.8 0 3.2 1.5 4.8 0"/>
    <path d="M2.4 19.4c1.6-1.5 3.2-1.5 4.8 0s3.2 1.5 4.8 0 3.2-1.5 4.8 0 3.2 1.5 4.8 0"/>`),sleep:u(`<path d="M3.4 12.4h6.2l-6.2 7.2h6.2"/>
    <path d="M11.8 7.6h4.6l-4.6 5.4h4.6"/>
    <path d="M18.2 3.6h3.4l-3.4 4h3.4"/>`),boiler:u(`<rect x="5" y="3.4" width="14" height="12.8" rx="1.8"/>
    <path d="M12 6.8c1.9 1.8 2.8 3.2 2.8 4.4a2.8 2.8 0 0 1-5.6 0c0-1.2.9-2.6 2.8-4.4z"/>
    <path d="M8.4 16.2v4M15.6 16.2v4"/>
    <path d="M6.8 20.2h3.2M14 20.2h3.2"/>`),pressure:u(`<circle cx="12" cy="10.4" r="6.4"/>
    <path d="m12 10.4 3.2-3.2"/>
    <circle cx="12" cy="10.4" r=".8"/>
    <path d="M6.9 6.5 8 7.7M17.1 6.5 16 7.7M12 4v1.6"/>
    <path d="M9.6 16.2 8.8 20.4h6.4l-.8-4.2"/>`),bell:u(`<path d="M17.8 16.6H6.2l1.5-2.3V10a4.3 4.3 0 0 1 8.6 0v4.3z"/>
    <path d="M10.2 19.2a2 2 0 0 0 3.6 0"/>
    <path d="M12 5.7V4.2"/>`),refill:u(`<path d="M12 2.8c1.7 2 2.6 3.5 2.6 4.6a2.6 2.6 0 0 1-5.2 0c0-1.1.9-2.6 2.6-4.6z"/>
    <path d="M5.8 11.8h12.4v6.6a2.2 2.2 0 0 1-2.2 2.2H8a2.2 2.2 0 0 1-2.2-2.2z"/>
    <path d="M5.8 15.6c1.4-1.2 2.7-1.2 4.1 0s2.7 1.2 4.1 0 2.7-1.2 4.2 0"/>`),football:u(`<circle cx="12" cy="12" r="8.6"/>
    <path d="m12 7.3 3.7 2.7-1.4 4.4H9.7L8.3 10z"/>
    <path d="M12 7.3V3.4M15.7 10l3.7-1.2M14.3 14.4l2.3 3.1M9.7 14.4l-2.3 3.1M8.3 10 4.6 8.8"/>`),sports:u(`<circle cx="7.6" cy="15.6" r="4"/>
    <path d="M4.6 12.9a5.6 5.6 0 0 0 6 6"/>
    <ellipse cx="16.2" cy="7.6" rx="3.4" ry="4.2"/>
    <path d="M14.1 10.9 11 14.4"/>
    <path d="M13.6 6.2h5.2M13.4 8.8h5.6M15.3 3.7v7.8M17.4 3.9v7.6"/>`),raceCar:u(`<circle cx="7" cy="16.4" r="2.6"/>
    <circle cx="17.4" cy="16.4" r="2.6"/>
    <path d="M2.4 16.4h2M9.6 16.4h5.2M20 16.4h1.6"/>
    <path d="M4.4 14.2h1.4l1.6-2.4h4.2l1.6-2.6h2.4l.8 2.6h2.4l1.6 1.4-.4 1"/>
    <path d="M2.2 18.4h3.2M19.6 8.4h2.2M20.7 8.4v2.6"/>`),cctv:u(`<path d="M3.8 9.5 16.2 6l1.3 4.6L5.1 14.1z"/>
    <path d="m17.9 10.9 2.9-.8-.6-2.2-2.9.8"/>
    <path d="M9.4 13.3v1.9a2.4 2.4 0 0 1-2.4 2.4H5"/>
    <path d="M5 15.4v5M3 20.4h4"/>`),floorHeating:u(`<path d="M2.8 20.6h18.4"/>
    <path d="M5.6 17.6V5.8a2 2 0 0 1 4 0v11.8a2 2 0 0 0 4 0V5.8a2 2 0 0 1 4 0v11.8"/>`),heatPump:u(`<rect x="2.8" y="6.2" width="13.4" height="11.6" rx="1.8"/>
    <circle cx="9.5" cy="12" r="3.5"/>
    <circle cx="9.5" cy="12" r=".8"/>
    <path d="M9.5 8.5a3.5 3.5 0 0 1 3 1.8M9.5 15.5a3.5 3.5 0 0 1-3-1.8"/>
    <path d="M18.8 9.2c1.3 1.8 1.3 3.8 0 5.6M21.2 7.4c2 2.9 2 6.3 0 9.2"/>`),qr:u(`<rect x="3.4" y="3.4" width="6.4" height="6.4" rx="1.2"/>
    <rect x="14.2" y="3.4" width="6.4" height="6.4" rx="1.2"/>
    <rect x="3.4" y="14.2" width="6.4" height="6.4" rx="1.2"/>
    <path d="M6.5 6.6h.2M17.3 6.6h.2M6.5 17.4h.2"/>
    <path d="M14.2 14.2h2.8M14.2 17.6v3.2M17.8 20.8h3M20.6 14.2v3.2"/>`),siren:u(`<path d="M7 15.6a5 5 0 0 1 10 0z"/>
    <path d="M5.4 18.8h13.2a1 1 0 0 0 0-2H5.4a1 1 0 0 0 0 2z"/>
    <path d="M12 5.4v2M6.6 7.6l1.5 1.5M17.4 7.6l-1.5 1.5M2.8 13.2h2M19.2 13.2h2"/>`),sirenOff:u(`<path d="M7 15.6a5 5 0 0 1 10 0z"/>
    <path d="M5.4 18.8h13.2a1 1 0 0 0 0-2H5.4a1 1 0 0 0 0 2z"/>
    <path d="M3.6 3.6 20.4 20.4"/>`),petrol:u(`<path d="M4.6 20.8V5.4a2 2 0 0 1 2-2h5.4a2 2 0 0 1 2 2v15.4"/>
    <path d="M3.2 20.8h12.2"/>
    <rect x="6.6" y="6.2" width="5.2" height="4.2" rx=".8"/>
    <path d="M14 9.6h2.2a1.6 1.6 0 0 1 1.6 1.6v5.6a1.6 1.6 0 0 0 3.2 0V8.4l-2.4-2.4"/>`),diesel:u(`<path d="M5 20.6V7.4a2 2 0 0 1 2-2h4.6a2 2 0 0 1 2 2v13.2"/>
    <path d="M3.6 20.6h11.4"/>
    <path d="M7.4 8.8h3.8M7.4 11.4h3.8"/>
    <path d="M18 8.6c1.6 1.9 2.4 3.2 2.4 4.3a2.4 2.4 0 0 1-4.8 0c0-1.1.8-2.4 2.4-4.3z"/>`),gas:u(`<path d="M12 3.4c3.4 3.4 5.3 6.2 5.3 8.7a5.3 5.3 0 0 1-10.6 0c0-2.5 1.9-5.3 5.3-8.7z"/>
    <path d="M12 20.6a2.8 2.8 0 0 1-2.8-2.8c0-1.4 1-2.7 2.8-4.3 1.8 1.6 2.8 2.9 2.8 4.3a2.8 2.8 0 0 1-2.8 2.8z"/>`),fuelStation:u(`<path d="M2.6 8.4 12 3.6l9.4 4.8"/>
    <path d="M2.6 8.4h18.8"/>
    <path d="M7.6 20.6v-8.4h6.4v8.4"/>
    <path d="M6 20.6h9.6"/>
    <path d="M16.4 13.6h1.6a1.4 1.4 0 0 1 1.4 1.4v2.6a1.3 1.3 0 0 0 2.6 0v-5.4"/>`),homeThermo:u(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
    <path d="M5.4 12.9V20a.9.9 0 0 0 .9.9h11.4a.9.9 0 0 0 .9-.9v-7.1"/>
    <path d="M10.6 17.3v-3.5a1.4 1.4 0 0 1 2.8 0v3.5a2.2 2.2 0 1 1-2.8 0z"/>`),homeStatus:u(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
    <path d="M5.4 12.9V20a.9.9 0 0 0 .9.9h11.4a.9.9 0 0 0 .9-.9v-7.1"/>
    <path d="m9.2 16.9 1.9 1.9 3.7-3.9"/>`),lounge:u(`<path d="M6.4 10.8V7.6a2.4 2.4 0 0 1 2.4-2.4h6.4a2.4 2.4 0 0 1 2.4 2.4v3.2"/>
    <path d="M4.6 17.4v-4.6a2 2 0 0 1 4 0v1.4h6.8v-1.4a2 2 0 0 1 4 0v4.6z"/>
    <path d="M6.2 17.4v2M17.8 17.4v2"/>`),dumbbell:u(`<path d="M9.2 12h5.6"/>
    <rect x="6.2" y="8.6" width="3" height="6.8" rx="1"/>
    <rect x="14.8" y="8.6" width="3" height="6.8" rx="1"/>
    <path d="M3.6 10.2v3.6M20.4 10.2v3.6"/>`),storage:u(`<rect x="3.2" y="12.4" width="8" height="8" rx="1"/>
    <rect x="12.8" y="12.4" width="8" height="8" rx="1"/>
    <rect x="8" y="3.4" width="8" height="8" rx="1"/>
    <path d="M6.4 12.4v2.4M16 12.4v2.4M11.2 3.4v2.4"/>`),celsius:u(`<circle cx="6.6" cy="7.2" r="2.6"/>
    <path d="M19.4 9.4a5.6 5.6 0 1 0 0 7.4"/>`)};E.domotitech='<img class="icon" alt="" aria-hidden="true" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ4AAAEOCAYAAAB4sfmlAAAACXBIWXMAAAsSAAALEgHS3X78AAAc4UlEQVR4nO3de5RcdWEH8O9vFhDayC5MHkgIO4jksUnYQaEKKntDBB/g2aE91gpsM/Qf/+gjM7zk1NpMbG1RwdkckKfArBNBrcqs+IKE7GwSoO/MqoAFK7P12B4Jc8y0KNrTk9s/fr87e/c9v5l77+/One/nnIXM6947uzvf/b1/wrZtEBHpiJm+ACLqPAwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItJ2gukLoM4RzxbTAFIAEgAGAdQBVNRXuZYfKZm6NgqWsG3b9DVQyKnAyAHoX+apdQAlALlafqTq60WRUQwOWlQ8W0wCGAUw1MLLxwGM1vIjZU8vikKBwUHzxLPFPsgSxk4PDjcGlkAih8FBs8SzRQtAActXS3TUIUsfOQ+PSQYxOAiA56WMxUwBSNfyIxUfz0EBYHcsIZ4tpgBU4W9oALIn5kg8W8z5fB7yGUscXSygUsZiJgGkavmRYwbOTW1icHQpn9oydNUBWKy6dB4GR5cxXMpYzPW1/EjB9EVQ8xgcXSQkpYzFjNXyI2nTF0HNYXB0CdUgucv0dSxjCrLqwnaPkGNwRJwa/VmA7NHoBGz36ADsjo2weLaYAXAEnRMaANALoKzmx1BIscQRQfFsMQFZymhljkmY7OZo03BicESMGsxVgPzLHQXjkKNN2e4RIgyOiFDdrAUAw4YvxQ9TkIPFqqYvhCQGRwSEvJvVK2w0DRE2jnY41c06gWiHBiCrXkfYaBoOLHF0qA7sZvUSB4sZxuDoQKqbNYfoNIC2gpPkDGJwdJCIN4C2gut7GMLg6BAR7Gb1Sh2y5FE2fSHdJJLB4ZoBmvTgcBXINTONFIlDOps1jDjDNkCRCw41arICb/8y1wEkgx5HEKIG0CnI1c7Lc78Hqis4pb5M9+yw0TQgUQyOAoAdPhx6vJYfSflw3AWpBtB8UOdbxDRkG0K5mSerEMnAbBsMG00DEMXg8O0N1fIjwq9jO1TVpATz80xanifS5n4sXpiGDA82mvqEA8BCxLVosMnQmAJwQTuTy2r5kUotP2IB2Ab5IQ5aP+QM28BKiN2GwREC8WyxL54tjgJ4DGZ7Tcbg4bBuVcVJAtjtxfE09QJ4TFX5yGOsqmjwo6qiivUlmF80OONnr4Th98lGU4+xxGGQmmdyBGZDw1mur+DnSVQpJglZqgnajni2WFHtR+QBBocB8WwxEc8WyzC/BqinVZPl1PIjx9Rf/ushSzlBGgRQUSUfahODI2Cqwa4C870m19fyI0YWyFGlGwuytBMkNpp6hMERENUAWoD5BtBpyF6TgsFrcKouFuQKX0Fio6kHGBwBUAOjKvBnYJqOScgRsKEY36CqLikAewycPq+CnFrA4PBZiBba2V3Lj4Ryz5JafiQD2e4RNDaatojB4ZN4tpiMZ4sVmG8ArQO4Ouyrhauq0wVgo2lHYHD4QNWfywjH5DSrlh8pGb6Opri6bE01mqYDPm/HYnB4SDWAliAnp5leNyPQrlavqNm3FoIPj14AD6uqJS2DI0c1LDVyNGQL7WRr+ZFR0xfRLh9nOi9nDHIkbejag8KCJY42uUoZprtZAdk+cEEUQgMA1GAxIyNNIasubDRdBIOjDa5u1jCsAToJINFpVZPlqPDIGjj1IIAqG00XxuBogWs2axi6WQFgT1i7Wr2gSlAmumu5AfYiGByaXEPGw7AGqNPVGvlRkKq79moE313rNJpGovrnFTaO6pmE+Tkmjq7cT1VVHcow057EDbAVBkdn6ur1JQyHR1cG9lysqnSWOtSsVtMXYpJrglzQYz0AjjQFwODoJIEsuNMpDIdH12+AzeDoDHtq+ZHQzGoNC9XWYMFMeACy0bRg6NxGsY0j3OqQjXEdMdfEFDVQqwxzc4O6bi8XBkd4+fbLePHEvx0BkNB8WfXZbRsumHMcZ/8UXZlnt23wvPRkcIg60GUbYJ9g+gJoQX7PNUkA0B1OnVjgvj601j3ty1DuWn4kHc8WATPhMQg1WKwbSohs4wgXZzMkDjZqkcH5LUAXLUvI4AiP3WwA9YbB+S2OfDxbLER5khyDw7y2t1yk+QzOb3FEeoYtg8MsljJ8pMa8mAyPyM6wZXCYMQngHJYy/GdwcpwjkjNsGRzBmoaczWp1+1yHIKleDgtmwyNSM2yjGByTpi9gAXXIHduT3dBVF0auIeqmwgMAdsazxVIU2j2iGBxh+2COQQZGrptGFoaR4fktjmHIqkvC4DW0LYrBUYDZvyqOMch2jDSrJeERkvBwZthaBq+hLZELDvVX3eQAHAZGyLkmx5ms1vYCmOjURtPIBQfQaEkPcj/SOhgYHUXtW2vB3ChTR0fOsI3sXJVafiSjtmAchX8rRU2p45c6rP2iihYmuS1w3zG09lc7NN8rNb/lGMyuIbtDtXl0zAzbyM2OnUu1YKfVlxfTrqchG2BHWbKIDlVleNjwZUxDhkfoBwRGPjjmcjVIJSFnaSYw89c3ifmlkynIv7ZlAOVO+KFSa1R4+FlCbUZHrMHSdcFBtBTDCyG77Q7zyGIGB9Ecqr2hBHMrijlCu4ctg6MLbbpv4sMQ4k1aL7Lt/3rho9u+4r5r/Ref2WoDH9U9vwDue/EPL/mB7uuCpNrGSjC/j04ot2OIbK8KLe7/4qfeuzK+QmvY86u1144BmBUcNvDRlevif6x7/ld/WgOAP9F9XZCcsR6GlyMEXIPFwtS+FslxHEReUYsCmZyaD4RwOwYGB9Ey1IDCC2B+KkNoZtgyOIiaoKoJSZid4wKEZIYtg4OoSaqB0oLcfNok4zNsGRxEGtQclxSCnQu1EKN72DI4iFpQy49k0MWNpgwOohapRtNtCEejaS7IEzI4iNpQy4+UYX5hIADYFeT0/K4cALb2k48lhWsbQlvI/wuIObflf22BYz/7+HBoBt9QuNTyI85qXmWYHaa+I54tOmNPfBXJ4Dhz19ctAAkhRAJqFqwtkIwBvbYQLR1z7afGneJZ3RaiEgOO2QIVyLUlKkKIyn/c+sHQzSmgYNTyI8dUeIzC7EjTQMKj44PjzL/8WsKGsABYQiAJ/xO/FzPzF4bdD5x92+N1G6gAKMcEygAq0x9jmHQLNUzd5MbXDt/DoyOD44xPfC0FIAXAign0m74eFydUhgDsAoD+Tz8+ZUOUYwLl6i1XhXqNBfKGWlWsDLMLA+2IZ4sVvzYw74jZsWf8xd/1AUjZEKkYMGy7ahsxAdhOa8ScWohw3WEL2RLsVFXcT22ijUOeq/F8oY41/1zOdzPmesyGcN8et4UoxYDyyzdfWV36nfuDs2ODEZJVxbapBlxPhTo4Vn/8q6keIG0LMQyoDyBmf2A7MDhmXu+sWSpQqt50Jas0EaTaPUowtzBQHUDC6zU9Qhccaz7+1QSAjC3XCO3twcyHPYLB0ThRDBi3IQov3/QBVmcixvSqYj2/9YaJDdvP/6NDl22senXM0ATH6j//SioGkbGFbHh0rqqLgsN5H9MxIQoACv9+4/uroEgwGR4xIV7feNWF/wuB0UPbNua8OKbR4Fh161f6hEAKQA4C/THXh7SLgwMx0biOcQCjP7nh/WVQx1PhUYCBsR5r3nou4medjh5gyhbCmrQ2tFV1MRIcq2/9cp8NkQGQEUIlsAAYHPOCw7k9BWD0x9n3FUAdTU2HLyPg8Dh55ak/ffMlG9apz9MUgLbCI/DgWH3rlzMAcjZEL+D6sDM4lgoO59jTthC5n2TeWwB1LFPhcfZlW9G74mTnM9BWeAQWHKs+9mjKhhh1xl3M+7AzOJoJDue10wByP2aAdCwT4XHaOWvqZ2092z16esoGrIMthIfvwbHqlkeTEBgFMOT+ADE42goOBwOkgwUdHjEhXt/8wQtPcU+7sIHxg9aGlO6xfAuOVbc82mcDGQHsgissGByeBofzvOkYkHlp53vZldthgg6PNVvOfn3VuWec4ty2AfQI7J4Y2pDTOY4v0+pX3fKoBTlnY5cfx6d5+gE8dt6eJ8vn7XnSMn0x1DxnGwYEtBzhq9Wj/73A3bu2Tb6Y1jmO5yWOVTc/koMQuwCZZgIASxy+lzjUfY3vwxiA3It/dkUV1DGC2sMlsf18rFhxMoBGiQPqd+eCiaH1TS0f4VlwrL75kYTtbJvn+kVncBgJDgCo2wKjL/3pFTlQxwgiPNasX/uLVZvWngbMC466LZAsX7q+utwxPKmqrL75EQuyamJ6r02a0Qtg13l3PlndcOc+y/TFUHPUVPgxP8/x6s9qv1rkoV7IP/7Lajs4Vt30SBrABMzv7k0L6wcwseHOfaX1d+1LmL4YWp7f4WH/6jenL/Hw4PaDL+aWO0ZbwbHqpkcKMD9tmJozDKCy/q59OdMXQsvzMzyO2/Ypr73266WesuuyQy9aSz2h5eBQoWFylSPS1wtg18a79lc23rXfyH4c1Dw/w+OXr/1muacsuQBQS8Gx+sYvFcDQ6GSDAI5s+Pz+0YHP7ze6lSAtza/wEL98/fVlnjJ42aHFqyzawcHQiJSdACqb7t5vmb4QWlIGHm+/8Jv/+fUrzZz3PYdeSiz0gFZwMDQiqR/AxKa7949uuvsplj5CyDVILOi9W3oB5BZ6oOngWH3jl3JgaETZTgDVzXc/pT1vgfznCo/pgE+94z2HXrLm3tlUcKy+cW8aHD7eDXoBPDZwz4HSwD0HWPoIGRUeKQS/5WRu7h3LBsfqG/cmsUwLK0XOMIDKwD0HLNMXQrPV8iMVyPV4gzS0/fBLs3rhlgyOVTfs7YNc6oyDu7pPP4CJgXsOjG65l6WPMKnlR0oAdgd82oz7xnIljhw4jLzb7QRQ2XIvSx9hUsuP5NBGY+nJbzjxVM2XzGr7WjQ4Vt2w14L8pSHqBzCx5V6WPkIm3eoLj5+24jTNl/RuP/xSIzyWKnEUWroiirKdAMpb75vgqNMQUO0dLVVZfnvFG1p5meX8Y8HgWHXD3hwQqj1ZKTwGARzZet9EzvSFEADZcaHVyxIT4nVnPQ5NjT8Y84JjpWwQzcy9n2iOXZvvn6hsvX8iYfpCupnqotXq9Tzx9BX/2eLphpx/LFTiyIC9KNScQQCVzfeX+YfGLK1SR++bTjuz3RPOCo6VWZY2SFsvgPzm+8vlgQfKCdMX041UqaPQ7PP71q08ZflnLezyp3+cBOaXONJgaYNaMwSgsuWBMoesm9FUdeXklaf+9KSTTmjnPH3A/OBgaYPaIYesP1AuDTxQZrdtgGr5kSqaGNfxxnPftM6L8zWCY2V2rwX2pJA3hgFUN31hkqWPYC25XmjPilN+fsYa3XFf81SA2SUO/pDJS70AHtv8hcnywIOTCcPX0i3KSz24KplY0+4J9r3zLceA2cHBQT3khyEAlYEHJ1kN9lktP1Je7LE3ro2/evrpK9o9RWNKP4ODgiB7Xh48WNn84EHL8LVE3bx2jlhPT/2MLWev9ODYjc2a3MHB3hTy2yCAiYGHDo4OPHSQjaf+mLfz/OqL1/ee2F5PiqPs/MOXvWOJlrETQHXgoYOsvniv7L5xxuazXz/9tLarKI5G4yuDg0yR1ZeHD1Y2P3zIMn0xUXR6Yk195ZtXtzzYa46pp951XtW5EQMaXbFEJgwCmNj08KHSxsLhhOmL6XTipBP7Yied8PM1yXN+tWbLOi+bHwruG55UfIg8MAxgeHPh8NhxIPNC+l3z6uq0tEv2P9+3/vLzUz0CawDXpubeKLhvsKpCYbMDQHVT4XBu49hhNqDqKcGfQZxjT73rvFlBzuCgMOqFXFW/OjB2OLfpi08zQJbwzn3P9b1z3/MVuKa9eyw39w4GB4VZI0A2ffHp3EDxGQbIHBc/+VwKQBX+rQ08tv/dM42ijjC0cUy6/n0MrkEmiuX6dwKcT9ONnADJDBSfKdjA6Asjl1QNX5NRFz/5XAJyRuywz6fKLXSnExxVn08OyBFtZchgqB697cPlVg90xie+1gc50jWhvix1m4PYoq0XcgzIzk3FZ8aEEKPPX3fx3D80kfb2J37Y1wNkIEQQC27tXqi0AQDCtmXb68rsXvkPAQj3Exo3xKwX2jMPNJ5jz7nDBiYFUIBA6einP+J7K/mZu76egAwQC4AlhGgU32wh62XOdbvfja1uCHXvzG35X+d2rPF8oY41cwwx857lc12P2RCzbzuvb7xYXZs6Y0zMvo6Y69jOa92c99a4YoHZr5/zvty3e2a9DzHre+SIzb7ZeK/H1XmPu44nb895n4t8f2euVeC4en7PrNfP+ZnN+R6r25O2QOGFay8uIOLe8b0fpG0hcj1Av/tnFFPfQ+f72tP4PAr0iJmfDxo/75nX2o3nz/udmAaQPPDu9Qt+bv0IjjqEKAAYPfqZj1QX/S4EYG3uG31QIWILWDFgkMERueBwjlcXsstw9PlrL64iIi767g/6AKR6BHJQgTH3w+9TcFx94N3rF52m73Vw7AYwevSz14SyD/6s3d9I2EKkAFjCVTdkcMxcSAcHR+M31BZiMiZDpPTcNe8I5e/icn7nO99PAMjYQqQB9DbCIJjgGH/q0vVLLrPhVXBMAki/8tlrqkudLEzO+uRjfZBrkKRsIUOEwRGZ4HD9rDAOoHQcovSjj7w99CFy4Xe+n47J38thYOa9Bxgc9R4g8dSlC1dRHF4ER/bo7dd09KbUa/9KhoiASAMYYnBEKjjktUKgR7aHlI4D5R/9wdtD0aj61m9N9cWEsACkIJAC0Ov++RoIjqvLly5eRXG4g+MYgF6N4KgDsI7efk0ofgBeOeuvSglbIA0gLYB+BkekggO2aBx/WghRBlC2haj86PcvCuz3+G3fmkoCsGxZshhyfr5o/HxmBBwcYxND69PNvAd3cJQBDDUZHFO2ENbR28PZluGVs/66lAJE2qnKMDhmv9cODw7X6wUgG1crACq2QKUHqD73oYvKaFNy/EjSFkj0AElbliyGYvN+V0IRHFMArImhpasojlaCYwqA9cod10Y6NNzWfmo8ASAdk9tH9DM4IhkcrtfP/oDZwGSPAGwZLMec6wRwTN2HHvncpC3QByAZE0gAcjjA3OOFMDjqgEhODK2vokm6weFZaMSzRQszA7eWGkpcgRxRWnW+1FLwRqz71HjKFiIdA4YZHF0THFDB0Xh+j/Nv9f+eeT+zmSN2QHBsmxjaUIYGd3CUAAwvERxth4YKizRk3a7dUW+TmAmTMoCK2tEqEGf/zTcTtkAGahMrBgeDw32+DgqO6w9aGwrQ5A6OHIBdiwRHHRDWK3dc21IDUjxbTEOOefd7nskUZAmlDKAcVMlk3d9+My2E6pFR9zE4GBwdEBx7Jq0NLS3f2GxwXP3KHdct20UzV4CBsZhpqBBBAEFy9m2PJ225G14qJmZKVAwO5+gMDvlYKIJjbNLakEaLmgmOPa/ccZ1WKsWzxSTkzD2/1gdolTPRrrTUHhTtWnfb430x2SefA9DP4HCOzuCQjxkPjrZCA5gdHBaAiTnBMXX0c9dp7bcSzxYzAPLtXFRA6pArJpUhg8SX9pH+Tz9u2RDpmMAO5z4Gh/tY8hEGB4IKjrHyto1ptMkdHEkAR+YEx7ajn7uu3OzB4tliAZj5gHSYccgg8SVEEp/5VgKyITVtC9HP4HCOJR9hcCCI4Bg75EFoAK7gAICV2b0VCAyq00we/dx1VjMHiWeLfZB/uf1ahShovoZI/2e/nY4BadupyjE4GByuC/ApOMYOXeZNaMy9RkCOq5hSXzonKSA6oQHICUYPA6jGs8VCPFv0dEPu6ZuvLLx885UWgHMAjEFWm4j84mloAHNKHK1QPScPe3ExITcNWQoZ9bp3JnH7t/tkCURkAPSzxDH7fbHE0VaJY/fkZZty8FhbwaF6T8roviX7piB7jTyvypxz+3esmFwWbpjBweBoMziuP7x9UwE+aDc4KohWFUWX0zMzWsuPeDq78tw7vpuw5SzdTEyIXoDBweBoOjjqAFKHtg+U4ZOWgyOeLeYgV54maQoyQApeH/gt+e+lAWRstfQhg2P2dTA45IvVuad6BNKHtg/4ukxAS8ERzxYTAF72/GqioQ5ZjSl43RZybv57SVuITGxOlzeDwzn+7PO6H+uS4BgHkH7mPQO+z9lqNTgK6NzxGkEahyyFlL086FtGn+iD7PXKAOhncDjHn31e92NdEBzZpy8fCGwlPu3gUGM2fuHP5USWf9WY0SdStkAmBgwxOGaf1/1YhINjKiaQfvryzYGuxNdKcKQAPObP5UTeNNQS/l73xpy354kEZHduWqgJdgyOyAfHHgC5Z6/YHPiiWq0ERw76jaJ1zCzI407GKmbvIufs0Oaw1P/DNlmuXXXMBEjVywOft+fJPiEn2GVsIXu8GByRC44pW4jMs1dsLsMQr4PDCYgyZlbrKrd8dbPP29hcCXIhIFNT9b02BiDnx5T/8+58MgkgHYNIQbWFAAyODg6Oui3E6D+8d0sOhrUbHHXMXu8isHqW6tlJQQaJ3xvvBsGXhlTHhjv3JdW4kFQMoh9gcHRYcIwByPz9+7aGYq3fVntVLBhe+9PNVRpxgqSTSyOTkCWQsl8n2HjX/iSAtC2Q6nGVRBgcM68JUXCMAcj90/u3VhEibc9VCSM1FD6lvjp1ZKvvAQIAA5/f3yiJAGq6P4MjDMExBiD3jx84v4oQimRwuKkqjQXXtnodJpAAAYBNdz+VjAEpW+6v2whcBkdgwVEHUIqFODAckQ+OuVR3cidWaQILEAAYuOdAAqrUFhOze7UYHJ4HxzSAUQgU/vkD54eiDWM5XRccbqpKk0Zn9dIEGiAAsOXeA40NugFYQk26Y3C0HRzjAAr/etWg9kLgpnV1cLh1YIgEHiCOrfdNpABYxwVSMaCfwaEVHNMxIUYBlP7lqsEqOhSDYwEqRDLwZuMovxkLEADYev9E8jiEBdlLM8jgkLfnBMd0D1CyhSgc+WAyEpu0MziW4WoTCfukPqMBAgADD5T7YkDquPx+JW1nUebuDI4pQJQAlCrDF0QiLNwYHE1SY0WcEAlz74zxAHFs+sJkX0xuxJwEkBAQScjbjVJchIKjDqBkCzkY8vupt1ab/DZ1JAZHC1whYkHOrTE1VsQZ4g/MngdUDkNwLGbgoYPOnKSEEEgAwjoO9NlCDHZQcEwBqNhq3+If/u7bIleqWAqDwyNqNG1CfVnq7nYn501jZiJgFfKXFGEOhXZtLhxOHFffR1sgIUssog9AUriWUAQCC466DVR6BCq2/BlUnvu9C8tevudOxOAIgBqEltB4ScWvneU63UDxmYQtv5d9QogkAKiqUJ8rOIaaCI5pIURVPR8AKkKW2mALlHsAPPehi8q+v6EOxeAgIm1z170lIloWg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEjb/wMjwhH4i90hIgAAAABJRU5ErkJggg==" />';function f(a,e="question"){return a?E[a]?E[a]:a.includes(":")?`<ha-icon class="icon" icon="${a}"></ha-icon>`:E[e]??E.question:E[e]??E.question}function Mn(a,e={}){switch(String(a??"").split(".")[0]){case"light":return"bulb";case"switch":return"switchOn";case"cover":return e.device_class==="awning"||e.device_class==="blind"?"awning":"shutter";case"person":case"device_tracker":return"person";case"climate":return"thermo";case"binary_sensor":return e.device_class==="smoke"?"smoke":"shield";case"alarm_control_panel":return"shield";case"scene":case"script":case"input_button":case"button":return"star";case"weather":return"cloudSun";case"date":return"calendar";case"time":case"datetime":return"clock";case"input_datetime":return e.has_time===!1?"calendar":"clock";case"input_select":case"select":return"keuzelijst";case"media_player":return e.device_class==="tv"?"tv":e.device_class==="receiver"?"radio":"speaker";default:return"question"}}function tt(a){switch(a){case"sunny":case"clear-night":return"sun";case"partlycloudy":return"cloudSun";case"cloudy":return"cloud";case"rainy":case"pouring":case"hail":case"lightning":case"lightning-rainy":return"rain";case"snowy":case"snowy-rainy":return"snow";case"fog":return"fog";case"windy":case"windy-variant":return"wind";default:return"cloud"}}var At=[["Woning",["house","homeStatus","homeThermo","floorB","floor1","floor2","garage","door","window","stairs","grid"]],["Kamers",["bed","bedDouble","wardrobe","hanger","sofa","lounge","kitchen","shower","toilet","desk","garage","storage"]],["Buiten",["tree","parasol","fence","sun","awning","car","beach"]],["Rolluiken",["shutter","shutterOpen","awning","garageOpen","garageClosed","arrowUp","arrowDown","stop"]],["Licht en stroom",["bulb","bulbGroup","switchOn","power","plug","bolt","battery"]],["Personen",["person","people","away"]],["Apparaten",["tv","speaker","camera","cctv","car","washer","dishwasher","printer","fan","airco","radio","boiler"]],["Media",["play","pause","next","prev","volume","volumeMute","shuffle","repeat","repeatOne","search","speakers","music"]],["Afval",["bin","binWheeled","calendar"]],["Verwarming en klimaat",["floorHeating","heatPump","boiler","thermo","homeThermo","celsius","gas","pressure","refill"]],["Auto en tanken",["car","petrol","diesel","gas","fuelStation","raceCar","plug"]],["Weer",["sun","cloud","cloudSun","rain","snow","fog","wind","drop","uv","sunrise","sunset","thermo"]],["Weermetingen",["humidity","lux","windSpeed","rainfall","weatherCode","forecast","weatherStation","rainRadar","uv","pressure","thermo"]],["Status",["shield","lock","lockOpen","key","wifi","smoke","smokeDetector","co","warning","check","close","clock","gaugeArrow","bell","pressure","refill","sleep","siren","sirenOff","homeStatus"]],["Cijfers",["een","twee","drie","vier","vijf","zes","zeven","acht","negen","tien"]],["Sport en vrije tijd",["football","sports","dumbbell","raceCar","beach"]],["Overig",["star","moon","leaf","cog","qr","keuzelijst","dots","plus","minus","chevronRight","chevronDown","question","pencil","domotitech"]]],Oi={house:["huis","woning","thuis","home","hal","gang","entree","overzicht"],floorB:["begane grond","beneden","vloer","verdieping","etage","ground floor"],floor1:["1e verdieping","eerste","boven","vloer","etage","first floor"],floor2:["2e verdieping","tweede","zolder","vloer","etage","second floor"],garage:["garage","schuur","carport","berging"],door:["deur","voordeur","achterdeur","toegang","door","opening"],window:["raam","venster","ruit","window","kozijn"],stairs:["trap","overloop","traphal","stairs","treden","boven"],grid:["raster","kamers","overzicht","tegels","menu","grid","apps"],floorHeating:["vloerverwarming","vloer","verwarming","vloerverwarmingg","leidingen","cv","warm","underfloor","floor heating"],heatPump:["warmtepomp","pomp","buitenunit","heat pump","verwarming","koelen","airco","hybride"],qr:["qr","qr-code","qrcode","code","scan","wifi code","streepjescode","gast"],siren:["sirene","alarm","alarmsirene","geluid","brandalarm","siren","aan"],sirenOff:["sirene uit","alarm uit","sirene uitzetten","stil","dempen","siren off","uitschakelen"],petrol:["benzine","tanken","brandstof","pomp","benzinepomp","petrol","euro 95","brandstofpomp"],diesel:["diesel","tanken","brandstof","pomp","dieselpomp","druppel"],gas:["gas","aardgas","vlam","gasverbruik","gasmeter","brander","gaskachel"],fuelStation:["tankstation","tanken","pompstation","benzinestation","luifel","fuel station","brandstof"],homeThermo:["klimaat","klimaat in de woning","woning thermometer","binnentemperatuur","temperatuur","huis thermometer","verwarming","thermostaat"],homeStatus:["woning status","status","huis status","alles in orde","huisstatus","woning","controle","check"],lounge:["lounge","fauteuil","stoel","zithoek","loungestoel","zitkamer","relax"],dumbbell:["sportschool","halter","gewicht","fitness","gym","dumbbell","krachttraining","sporten"],storage:["opslag","dozen","berging","zolder","kelder","opbergen","voorraad","storage","kast"],celsius:["celsius","graden","temperatuur","graad","c","thermometer","warmte"],domotitech:["domotitech","logo","merk","website","domoti","domotica"],beach:["strand","zee","golven","kust","vakantie","zon en zee","beach","zomer","water"],sleep:["slapen","zzz","slaapstand","nachtmodus","slaap","sleep","rust","nacht","welterusten","dutje"],boiler:["ketel","cv","cv-ketel","boiler","verwarming","ketelstatus","boiler status","vlam","warmte"],pressure:["druk","bar","waterdruk","manometer","meter","pressure","keteldruk","spanning"],bell:["notificatie","melding","bel","meldingen","alert","waarschuwing","notification","bericht"],refill:["bijvullen","water bijvullen","vullen","water","peil","niveau","reservoir","refill","aanvullen"],football:["voetbal","bal","voetballen","sport","wedstrijd","football","soccer","eredivisie"],sports:["sport","sporten","sportief","bewegen","tennis","racket","wedstrijd","sports","verschillende sporten"],raceCar:["formule 1","f1","racewagen","raceauto","autosport","race","grand prix","verstappen","circuit"],cctv:["camera","bewakingscamera","cctv","beveiliging","toezicht","surveillance","buitencamera","beveiligingscamera"],bed:["slaapkamer","bed","slapen","slaap","sleep","bedroom","nacht","welterusten","logeerkamer"],bedDouble:["tweepersoonsbed","2 persoonsbed","bed","slaapkamer","slapen","sleep","double bed","twee personen","ouderslaapkamer","nacht"],wardrobe:["kledingkast","kast","garderobe","kleding","wardrobe","closet","inloopkast","slaapkamer"],hanger:["kleerhanger","hanger","kleding","kleren","garderobe","wasgoed","kledingkast","outfit"],sofa:["woonkamer","bank","sofa","zithoek","salon","living","livingroom","couch"],kitchen:["keuken","koken","pan","kitchen","cooking","eten","fornuis","kookplaat"],shower:["badkamer","douche","shower","bad","bathroom","wassen","sanitair"],toilet:["wc","toilet","sanitair","badkamer","restroom","plee"],desk:["kantoor","werkkamer","bureau","desk","office","computer","monitor","beeldscherm"],tree:["tuin","boom","buiten","garden","tree","achtertuin","voortuin","groen","natuur"],parasol:["terras","buiten","parasol","tuin","balkon","veranda","zonnescherm","outdoor","patio"],fence:["erf","hek","buiten","tuin","schutting","oprit","poort","fence","omheining"],shutter:["rolluik","gordijn","zonwering","shutter","screen","jaloezie","dicht","gesloten","cover"],shutterOpen:["rolluik open","gordijn open","zonwering","shutter","cover","omhoog"],awning:["zonnescherm","luifel","markies","awning","terras","zonwering","buiten"],garageOpen:["garagedeur open","garage","deur open","omhoog","geopend"],garageClosed:["garagedeur dicht","garage","deur dicht","gesloten","omlaag"],arrowUp:["omhoog","pijl omhoog","open","up","boven","openen","stijgen"],arrowDown:["omlaag","pijl omlaag","dicht","down","beneden","sluiten","dalen"],stop:["stop","stoppen","halt","vierkant","square"],bulb:["lamp","licht","verlichting","peer","light","bulb","spot","schemerlamp"],bulbGroup:["lampen","lichtgroep","verlichting","groep","lights","alle lampen"],switchOn:["schakelaar","knop","switch","aan uit","toggle","aanuit"],power:["aan uit","power","stroom","uitknop","aanknop","standby"],plug:["stopcontact","stekker","plug","socket","outlet","smart plug"],bolt:["stroom","energie","bliksem","elektriciteit","verbruik","power","energy","watt","kwh"],battery:["batterij","accu","battery","lading","opladen","percentage"],person:["persoon","iemand","gebruiker","person","wie","profiel","aanwezig"],people:["personen","mensen","gezin","iedereen","familie","people","gasten"],away:["weg","afwezig","niet thuis","away","vertrokken","uit huis"],tv:["televisie","tv","scherm","kijken","netflix","mediaspeler","chromecast"],speaker:["speaker","luidspreker","boxje","geluid","audio","sonos"],camera:["camera","beveiliging","bewaking","cctv","deurbel","opname","beeld"],car:["auto","wagen","car","laadpaal","opladen","voertuig","oprit","buiten"],washer:["wasmachine","was","wassen","washer","wasdroger","droger","laundry","wasruimte"],dishwasher:["vaatwasser","afwas","vaat","dishwasher","afwasmachine"],printer:["printer","printen","3d printer","papier","print"],fan:["ventilator","fan","ventilatie","afzuiging","wtw","luchtverversing","koelen"],airco:["airco","airconditioning","koeling","warmtepomp","klimaat","verwarming","hvac"],radio:["radio","zender","fm","stream","muziek","antenne"],play:["afspelen","play","start","spelen","muziek","starten"],pause:["pauze","pause","pauzeren","stil","onderbreken"],next:["volgende","next","verder","vooruit","overslaan","skip"],prev:["vorige","previous","terug","achteruit","prev"],volume:["volume","geluid","harder","luid","audio","sound"],volumeMute:["stil","mute","gedempt","geluid uit","dempen"],shuffle:["willekeurig","shuffle","husselen","door elkaar","random"],repeat:["herhalen","repeat","loop","opnieuw","herhaling"],repeatOne:["een herhalen","repeat one","herhalen","loop","dit nummer"],search:["zoeken","zoek","search","vergrootglas","vinden","opzoeken"],speakers:["speakers","groep","multiroom","luidsprekers","audio","koppelen"],music:["muziek","noot","music","nummer","liedje","spotify","audio"],bin:["afval","vuilnis","prullenbak","bak","container","waste","trash","kliko"],binWheeled:["kliko","container","afval","vuilnisbak","rolcontainer","ophaaldag","waste"],calendar:["agenda","kalender","datum","afspraak","planning","calendar","dag"],sun:["zon","zonnig","helder","sun","zonnepanelen","dag","weer","buiten"],cloud:["bewolkt","wolk","cloud","betrokken","grijs","weer"],cloudSun:["halfbewolkt","wolk","zon","weer","wisselend","partly cloudy"],rain:["regen","buien","nat","rain","neerslag","weer","paraplu"],snow:["sneeuw","winter","vorst","snow","koud","ijs","weer"],fog:["mist","nevel","fog","zicht","weer"],wind:["wind","waait","storm","bries","windkracht","weer"],drop:["druppel","vocht","luchtvochtigheid","water","regen","humidity","nat","lekkage"],uv:["uv","uv index","zon","straling","zonkracht","huid"],humidity:["vochtigheid","luchtvochtigheid","vocht","humidity","procent","rv","hygrometer","weer"],lux:["lux","lichtsterkte","helderheid","verlichtingssterkte","illuminance","lichtsensor","lichtmeter","lumen"],windSpeed:["windsnelheid","wind","windkracht","beaufort","anemometer","wind speed","km/u","storm","weer"],rainfall:["regen","neerslag","regenmeter","millimeter","mm","rainfall","buien","hoeveelheid","weer"],weatherCode:["weercode","code","weather code","weertype","conditie","weer"],forecast:["voorspelling","verwachting","forecast","vooruitzicht","morgen","weerbericht","weer"],weatherStation:["weerstation","station","meetstation","weather station","mast","anemometer","weer"],rainRadar:["buienradar","regenradar","radar","buien","neerslagradar","rain radar","weer"],sunrise:["zonsopkomst","opkomst","ochtend","sunrise","dageraad","vroeg"],sunset:["zonsondergang","ondergang","avond","sunset","schemer"],thermo:["temperatuur","thermometer","graden","warm","koud","thermostaat","klimaat","verwarming"],shield:["beveiliging","schild","alarm","veilig","bescherming","shield","security"],lock:["slot","op slot","vergrendeld","gesloten","lock","sleutel","dicht","beveiligd"],lockOpen:["slot open","ontgrendeld","geopend","unlock","los","open"],key:["sleutel","key","toegang","code","wachtwoord","slot"],wifi:["wifi","netwerk","internet","verbinding","router","signaal","wlan"],smoke:["rookmelder","rook","brand","smoke","melder","vuur","alarm"],smokeDetector:["rookmelder","melder","rook","brand","smoke detector","detector","plafond","alarm"],co:["koolmonoxide","co","gas","melder","cv","kachel","carbon monoxide","vergiftiging"],warning:["waarschuwing","let op","attentie","warning","uitroepteken","storing","probleem"],check:["goed","vinkje","in orde","klaar","check","gelukt"],close:["sluiten","kruis","dicht","annuleren","close","weg"],clock:["klok","tijd","uur","wekker","timer","clock","wanneer"],gaugeArrow:["meter","wijzer","stand","gauge","niveau","druk","snelheid"],een:["1","een","eerste","one"],twee:["2","twee","tweede","two"],drie:["3","drie","derde","three"],vier:["4","vier","vierde","four"],vijf:["5","vijf","vijfde","five"],zes:["6","zes","zesde","six"],zeven:["7","zeven","zevende","seven"],acht:["8","acht","achtste","eight"],negen:["9","negen","negende","nine"],tien:["10","tien","tiende","ten"],star:["ster","favoriet","star","belangrijk","voorkeur","top"],moon:["maan","nacht","slapen","donker","moon","nachtstand","avond"],leaf:["blad","groen","eco","duurzaam","plant","natuur","besparen","tuin"],keuzelijst:["keuzelijst","keuze","lijst","modus","stand","programma","dropdown","select","kiezen","opties"],cog:["instellingen","tandwiel","beheer","settings","configuratie","opties","systeem"],dots:["meer","drie puntjes","menu","opties","extra","overig","more"],plus:["plus","meer","erbij","toevoegen","hoger","omhoog","add"],minus:["min","minder","eraf","lager","verwijderen","omlaag"],chevronRight:["pijl rechts","verder","volgende","chevron","open","meer"],chevronDown:["pijl omlaag","uitklappen","openklappen","chevron","meer","dropdown"],question:["vraagteken","onbekend","hulp","help","vraag","geen idee"],pencil:["potlood","bewerken","wijzigen","aanpassen","edit","pen","instellen"]},Sn=a=>String(a??"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();function Ss(a,e){let t=[...(Oi[a]??[]).map(Sn),Sn(a)],n=0;for(let i=0;i<t.length;i++){let r=t[i];if(!r)continue;let o=0;for(let s of[r,...r.split(" ")])s===e?o=Math.max(o,3):s.startsWith(e)?o=Math.max(o,2):s.includes(e)&&(o=Math.max(o,1));if(o&&(n=Math.max(n,o+.5/(1+i))),n>=3.5)break}return n}function Os(a,e){let t=0;for(let n of e){let i=Ss(a,n);if(!i)return 0;t+=i}return t}var _e=a=>Oi[a]?.[0]??a;function Ns(a=At){let e=[];for(let[,t]of a)for(let n of t)e.includes(n)||e.push(n);return e}function Ni(a,e=At){let t=Sn(a).split(" ").filter(Boolean);if(!t.length)return e;let n=[];for(let i of Ns(e)){let r=Os(i,t);r&&n.push({sleutel:i,score:r})}return n.sort((i,r)=>r.score-i.score||_e(i.sleutel).localeCompare(_e(r.sleutel))),[[`${n.length} gevonden`,n.map(i=>i.sleutel)]]}var Cs=`
  :host { ${X} display: block; font-family: var(--dac-font); }
  *, *::before, *::after { box-sizing: border-box; }

  .label {
    font-size: 12px; font-weight: 500; margin-bottom: 6px;
    color: var(--secondary-text-color, var(--dac-ink-2));
  }

  .box {
    border: 1px solid var(--divider-color, var(--dac-border));
    border-radius: 12px; overflow: hidden;
    background: var(--card-background-color, var(--dac-bg-raise));
  }

  .current {
    display: flex; align-items: center; gap: 12px; padding: 10px 12px;
    cursor: pointer; background: none; border: 0; width: 100%; text-align: left;
    font: inherit; color: var(--primary-text-color, var(--dac-ink));
  }
  .current:hover { background: rgba(127,127,127,0.08); }
  .current .preview {
    width: 38px; height: 38px; display: grid; place-items: center; border-radius: 11px;
    color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 32%, transparent);
  }
  .current .preview .icon, .current .preview ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
  .current .who { min-width: 0; }
  .current .who b { display: block; font-size: 13.5px; font-weight: 500; }
  .current .who small { font-size: 11.5px; color: var(--secondary-text-color, var(--dac-ink-3)); }
  .current .caret { margin-left: auto; color: var(--secondary-text-color, var(--dac-ink-3)); }
  .current .caret .icon { width: 18px; height: 18px; transition: transform 220ms ease; }
  :host([open]) .current .caret .icon { transform: rotate(180deg); }

  .panel { display: none; border-top: 1px solid var(--divider-color, var(--dac-border)); padding: 10px 12px 12px; }
  :host([open]) .panel { display: block; }

  /* Het zoekveld blijft staan terwijl het raster eronder scrollt: bij een
     zoekopdracht die niets oplevert wil je het woord kunnen aanpassen zonder
     eerst terug te scrollen. */
  .zoekrij {
    position: sticky; top: 0; z-index: 1;
    display: flex; align-items: center; gap: 8px;
    padding: 2px 0 10px;
    background: var(--card-background-color, var(--dac-bg-raise));
  }
  .zoekveld {
    flex: 1 1 auto; min-width: 0; position: relative;
    display: flex; align-items: center;
  }
  .zoekveld .loep {
    position: absolute; left: 9px; display: flex; pointer-events: none;
    color: var(--secondary-text-color, var(--dac-ink-3));
  }
  .zoekveld .loep .icon { width: 16px; height: 16px; }
  .zoekveld input {
    width: 100%; font: inherit; font-size: 13px;
    padding: 8px 30px 8px 31px; border-radius: 9px;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--primary-text-color, var(--dac-ink));
  }
  .zoekveld input:focus { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  /* Een type=search krijgt van de browser zijn eigen kruisje. Naast het onze
     staan er dan twee naast elkaar, en de linker doet iets anders dan de
     rechter. Het onze blijft, want dat past bij de rest van de kiezer. */
  .zoekveld input::-webkit-search-cancel-button,
  .zoekveld input::-webkit-search-decoration { -webkit-appearance: none; appearance: none; }
  .zoekveld .wis {
    position: absolute; right: 4px; display: none; place-items: center;
    width: 24px; height: 24px; padding: 0; border: 0; border-radius: 999px;
    background: none; cursor: pointer; color: var(--secondary-text-color, var(--dac-ink-3));
  }
  .zoekveld .wis .icon { width: 15px; height: 15px; }
  :host([zoekt]) .zoekveld .wis { display: grid; }
  .zoekveld .wis:hover { color: var(--primary-text-color, var(--dac-ink)); }

  .groepen { max-height: 320px; overflow-y: auto; }

  .group + .group { margin-top: 12px; }
  .group h4 {
    margin: 0 0 6px; font-size: 10.5px; font-weight: 600; letter-spacing: .12em;
    text-transform: uppercase; color: var(--secondary-text-color, var(--dac-ink-3));
  }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(62px, 1fr)); gap: 6px; }

  .opt {
    display: grid; grid-template-rows: auto auto; gap: 3px;
    justify-items: center; align-content: center;
    padding: 7px 3px 5px; cursor: pointer;
    border-radius: 10px; border: 1px solid transparent; background: rgba(127,127,127,0.08);
    color: var(--primary-text-color, var(--dac-ink));
    transition: border-color 160ms ease, background 160ms ease;
  }
  .opt:hover { background: rgba(127,127,127,0.16); }
  .opt[aria-pressed="true"] {
    border-color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 18%, transparent);
    color: var(--dac-accent-hi);
  }
  .opt .icon { width: 19px; height: 19px; }
  .opt .naam {
    max-width: 100%; font-size: 9.5px; line-height: 1.15; text-align: center;
    color: var(--secondary-text-color, var(--dac-ink-3));
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .opt[aria-pressed="true"] .naam { color: inherit; }

  .niets {
    padding: 18px 4px; text-align: center; font-size: 12.5px;
    color: var(--secondary-text-color, var(--dac-ink-3));
  }

  .mdi { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
  .mdi label { font-size: 11.5px; color: var(--secondary-text-color, var(--dac-ink-3)); white-space: nowrap; }
  .mdi input {
    flex: 1 1 auto; min-width: 0; font: inherit; font-size: 13px;
    padding: 8px 10px; border-radius: 8px;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--primary-text-color, var(--dac-ink));
  }
  .mdi input:focus { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  .mdi button {
    font: inherit; font-size: 12px; padding: 8px 12px; border-radius: 8px; cursor: pointer;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--secondary-text-color, var(--dac-ink-2));
  }
  .mdi button:hover { color: var(--primary-text-color, var(--dac-ink)); }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
`,On=null,Ci=a=>a.map(([e,t])=>`
      <div class="group">
        <h4>${e}</h4>
        <div class="grid">
          ${t.map(n=>`<button type="button" class="opt" data-icon="${n}" title="${_e(n)} (${n})" aria-pressed="false">${E[n]??""}<span class="naam">${_e(n)}</span></button>`).join("")}
        </div>
      </div>`).join(""),Nn=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),On=On??[J(Cs)],this.shadowRoot.adoptedStyleSheets=On,this.value_="",this.vraag_="",this.label="Icoon",this.fallback="question",this.auto=!0}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}connectedCallback(){this.built_||(this.built_=!0,this.build_())}build_(){this.shadowRoot.innerHTML=`
      <div class="label"></div>
      <div class="box">
        <button type="button" class="current" aria-expanded="false">
          <span class="preview"></span>
          <span class="who"><b></b><small></small></span>
          <span class="caret">${E.chevronDown}</span>
        </button>
        <div class="panel">
          <div class="zoekrij">
            <span class="zoekveld">
              <span class="loep">${E.search}</span>
              <input id="zoek" type="search" placeholder="Zoek een icoon -- slapen, gordijn, vaatwasser"
                     spellcheck="false" autocomplete="off" />
              <button type="button" class="wis" title="Zoekopdracht wissen">${E.close}</button>
            </span>
          </div>
          <div class="groepen">${Ci(At)}</div>
          <div class="mdi">
            <label for="mdi">Of Home Assistant-icoon</label>
            <input id="mdi" type="text" placeholder="mdi:washing-machine" spellcheck="false" />
            <button type="button" class="clear">Wissen</button>
          </div>
        </div>
      </div>`,this.$(".current").addEventListener("click",()=>{let n=this.toggleAttribute("open");this.$(".current").setAttribute("aria-expanded",String(n)),n&&requestAnimationFrame(()=>this.$("#zoek").focus())});let e=this.$("#zoek");e.addEventListener("input",()=>this.zoek_(e.value)),e.addEventListener("keydown",n=>{if(n.key==="Escape"){n.stopPropagation(),this.zoek_(""),e.value="";return}if(n.key!=="Enter")return;let i=this.shadowRoot.querySelectorAll(".opt");i.length===1&&(n.preventDefault(),this.emit_(i[0].dataset.icon))}),this.$(".wis").addEventListener("click",()=>{e.value="",this.zoek_(""),e.focus()}),this.$(".groepen").addEventListener("click",n=>{let i=n.target.closest?.(".opt");i&&this.emit_(i.dataset.icon)});let t=this.$("#mdi");t.addEventListener("change",()=>this.emit_(t.value.trim())),this.$(".clear").addEventListener("click",()=>this.emit_("")),this.paint_()}zoek_(e){this.vraag_=e??"",this.toggleAttribute("zoekt",!!this.vraag_.trim());let t=Ni(this.vraag_),n=this.$(".groepen"),i=t.length===1&&!t[0][1].length;n.innerHTML=i?`<div class="niets">Geen icoon gevonden voor "${this.vraag_.trim()}".<br>Een <code>mdi:</code>-naam hieronder werkt altijd.</div>`:Ci(t),n.scrollTop=0,this.markeer_()}markeer_(){for(let e of this.shadowRoot.querySelectorAll(".opt"))e.setAttribute("aria-pressed",String(e.dataset.icon===this.value_))}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Icoon";let e=this.value_,t=e||this.fallback||"question";this.$(".preview").innerHTML=f(t,this.fallback),this.$(".who b").textContent=e?e.includes(":")?e:_e(e):this.auto?"Automatisch":"Kies een icoon",this.$(".who small").textContent=e?e.includes(":")?"Home Assistant-icoon":`DomotiApp-icoon -- ${e}`:this.auto?"Past zich aan de entiteit aan":"Nog niets gekozen",this.markeer_();let n=this.$("#mdi");if(this.shadowRoot.activeElement===n)return;let i=e&&e.includes(":")?e:"";n.value!==i&&(n.value=i)}emit_(e){this.value_=e,this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};S("dac-icon-picker",Nn);var Ts=/^(#[0-9a-f]{3,8}|var\(--[\w-]+\)|rgba?\([^)]*\))$/i,Ls=`
  :host { ${X} display: block; font-family: var(--dac-font); }
  *, *::before, *::after { box-sizing: border-box; }

  .label { font-size: 12px; font-weight: 500; margin-bottom: 6px;
           color: var(--secondary-text-color, var(--dac-ink-2)); }

  .box {
    border: 1px solid var(--divider-color, var(--dac-border));
    border-radius: 12px; padding: 12px;
    background: var(--card-background-color, var(--dac-bg-raise));
  }
  :host([compact]) .box { border: 0; padding: 0; background: none; }
  :host([compact]) .label { font-size: 11.5px; margin-bottom: 5px; }

  .rij { display: flex; align-items: center; gap: 8px; }
  :host([compact]) .rij { gap: 6px; }

  .sw {
    position: relative; width: 34px; height: 34px; padding: 0; cursor: pointer;
    border-radius: 10px; border: 2px solid transparent; background: var(--c);
    display: grid; place-items: center; color: #0c0c0a; flex: 0 0 auto;
  }
  :host([compact]) .sw { width: 28px; height: 28px; border-radius: 8px; }
  .sw .icon { width: 16px; height: 16px; opacity: 0; }
  .sw[aria-pressed="true"] { border-color: var(--primary-text-color, var(--dac-ink)); }
  .sw[aria-pressed="true"] .icon { opacity: 1; }

  /* Het vakje IS de knop: de systeemkleurkiezer ligt er onzichtbaar overheen.
     Leeg toont hij het hele spectrum, zodat je ziet dat er iets te kiezen valt
     in plaats van een leeg gat. */
  .sw.eigen { overflow: hidden; }
  .sw.eigen.leeg {
    background: conic-gradient(#fd0774, #dc7300, #f5c451, #039580, #129be4, #235efa, #bc10c8, #fd0774);
  }
  .sw.eigen input[type="color"] {
    position: absolute; inset: 0; width: 100%; height: 100%;
    opacity: 0; cursor: pointer; border: 0; padding: 0;
  }

  input[type="text"] {
    flex: 1 1 auto; min-width: 0; font: inherit; font-size: 13px;
    padding: 8px 10px; border-radius: 8px;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--primary-text-color, var(--dac-ink));
  }
  input[type="text"]:focus { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  input[type="text"][aria-invalid="true"] { border-color: var(--error-color, #d03b3b); }
  :host([compact]) input[type="text"] { display: none; }

  .wissen {
    font: inherit; font-size: 12px; padding: 8px 12px; border-radius: 8px; cursor: pointer;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--secondary-text-color, var(--dac-ink-2));
    flex: 0 0 auto;
  }
  @media (hover: hover) { .wissen:hover { color: var(--primary-text-color, var(--dac-ink)); } }
  /* Zonder kleur valt er niets te wissen, en een knop die niets doet leidt af. */
  .wissen[hidden] { display: none; }
  :host([compact]) .wissen { padding: 6px 9px; font-size: 11.5px; }

  .note { margin: 10px 0 0; font-size: 11.5px; line-height: 1.45;
          color: var(--secondary-text-color, var(--dac-ink-3)); }
  :host([compact]) .note { display: none; }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
`,Cn=null,Tn=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),Cn=Cn??[J(Ls)],this.shadowRoot.adoptedStyleSheets=Cn,this.value_="",this.label="Kleur"}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}set compact(e){this.toggleAttribute("compact",!!e)}get compact(){return this.hasAttribute("compact")}connectedCallback(){this.built_||(this.built_=!0,this.build_())}kleur_(){return O[this.value_]??this.value_}build_(){this.shadowRoot.innerHTML=`
      <div class="label"></div>
      <div class="box">
        <div class="rij">
          <span class="sw eigen leeg" role="button" tabindex="-1" title="Kleur kiezen"
                aria-pressed="false">
            ${E.check}
            <input type="color" aria-label="Kleur kiezen" />
          </span>
          <input id="vrij" type="text" spellcheck="false"
                 aria-label="Kleur als tekst"
                 placeholder="#198fd9 of var(--primary-color)" />
          <button type="button" class="wissen">Wissen</button>
        </div>
        <p class="note">
          Leeg laten betekent dat de kaart de kleur zelf kiest. Een eigen kleur
          mag een hexwaarde zijn of een variabele uit je thema:
          <b>var(--primary-color)</b> volgt je thema mee, een hexwaarde staat vast.
        </p>
      </div>`;let e=this.$('input[type="color"]');e.addEventListener("input",()=>this.emit_(e.value));let t=this.$("#vrij");t.addEventListener("change",()=>{let n=t.value.trim();if(!n){this.emit_("");return}let i=Ts.test(n);t.setAttribute("aria-invalid",String(!i)),i&&this.emit_(n)}),this.$(".wissen").addEventListener("click",()=>this.emit_("")),this.paint_()}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Kleur";let e=!!this.value_,t=this.$(".sw");t.setAttribute("aria-pressed",String(e)),t.classList.toggle("leeg",!e),t.style.setProperty("--c",e?this.kleur_():"transparent"),t.title=e?`Kleur: ${Si[this.value_]??this.value_}`:"Kleur kiezen",/^#[0-9a-f]{6}$/i.test(this.kleur_())&&(this.$('input[type="color"]').value=this.kleur_()),this.$(".wissen").hidden=!e;let n=this.$("#vrij");if(this.shadowRoot.activeElement!==n){let i=this.value_ in O?"":this.value_;n.value!==i&&(n.value=i),n.setAttribute("aria-invalid","false")}}emit_(e){this.value_=e??"",this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.value_},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};S("dac-tone-picker",Tn);var _={entity:a=>({entity:a?{domain:a}:{}}),text:()=>({text:{}}),multiline:()=>({text:{multiline:!0}}),bool:()=>({boolean:{}}),number:(a,e,t=1)=>({number:{min:a,max:e,step:t,mode:"box"}}),select:a=>({select:{mode:"dropdown",options:a}}),action:(a="more-info")=>({ui_action:{default_action:a}})},Ln=(...a)=>({type:"grid",name:"",schema:a});var Ds=[{name:"bare",selector:_.bool()}],Hs={bare:"Haalt de vulling en de schaduw onder de kaart weg. De rand blijft staan, zodat de kaart nog een vorm heeft op een dashboard zonder vlakken."},D=class extends HTMLElement{constructor(){super(),this.config_={},this.built_=!1}setConfig(e){this.config_={...this.defaults(),...e},this.render_()}defaults(){return{}}set hass(e){this.hass_=e,this.form_&&(this.form_.hass=e);for(let t of this.pickers_??[])t.hass=e;this.render_()}get hass(){return this.hass_}connectedCallback(){this.render_()}schema(){return[]}gedeeldeVelden(){return Ds}volledigSchema_(){return[...this.schema(),...this.gedeeldeVelden()]}pickers(){return[]}label(e){return Is[e.name]??e.name}helper(){}async render_(){if(!this.hass_||!this.config_)return;if(this.built_){this.sync_();return}this.built_=!0,await customElements.whenDefined("ha-form"),this.replaceChildren(),this.pickers_=[];let e=this.pickers();this.pickerSig_=e.map(o=>o.key).join("|");let t=o=>{let s=document.createElement("div");return s.style.cssText=`display:flex;flex-direction:column;gap:12px;${o}`,s},n=t("margin-bottom:16px"),i=t("margin-top:16px");for(let o of e){let s=document.createElement(o.kind==="tone"?"dac-tone-picker":"dac-icon-picker");s.label=o.label,s.fallback=o.fallback,o.auto===!1&&(s.auto=!1),o.statuses===!1&&(s.statuses=!1),o.compact&&(s.compact=!0),s.hass=this.hass_,s.value=this.config_[o.key],s.addEventListener("value-changed",d=>{d.stopPropagation(),this.patch_({[o.key]:d.detail.value})}),this.pickers_.push(s),s.dataset.key=o.key,(o.after?i:n).appendChild(s)}n.children.length&&this.appendChild(n);let r=document.createElement("ha-form");r.hass=this.hass_,r.data=this.config_,r.schema=this.volledigSchema_(),r.computeLabel=o=>this.label(o),r.computeHelper=o=>this.helper(o)??Hs[o.name],r.addEventListener("value-changed",o=>{o.stopPropagation(),this.patch_(o.detail.value,!0)}),this.form_=r,this.appendChild(r),i.children.length&&this.appendChild(i)}sync_(){let e=this.pickers().map(t=>t.key).join("|");if(this.pickerSig_!==void 0&&this.pickerSig_!==e){this.built_=!1,this.form_=null,this.render_();return}this.form_&&(this.form_.hass=this.hass_,this.form_.schema=this.volledigSchema_(),this.form_.data=this.config_);for(let t of this.pickers_??[])t.hass=this.hass_,t.value=this.config_[t.dataset.key]}patch_(e,t=!1){let n=t?{...e}:{...this.config_,...e};this.config_.type&&(n.type=this.config_.type);for(let[i,r]of Object.entries(n))(r===""||r===void 0||r===null)&&delete n[i];this.config_=n,this.sync_(),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.serialize(n)},bubbles:!0,composed:!0}))}serialize(e){return e}},Is={entity:"Entiteit",entities:"Entiteiten",name:"Naam",icon:"Icoon",tone:"Kleur",secondary:"Tweede regel",layout:"Vorm",tap_action:"Tikken",hold_action:"Vasthouden",double_tap_action:"Dubbeltikken",show_state:"Status tonen",show_name:"Naam tonen",show_icon:"Icoon tonen",fill:"Vullen",collapsible:"Inklapbaar",title:"Titel",subtitle:"Ondertitel",weather:"Weerentiteit",sun:"Zon-entiteit",person:"Persoon",persons:"Personen",covers:"Rolluiken",lights:"Lampen",sensors:"Sensoren",greeting:"Begroeting",show_clock:"Klok tonen",show_weather:"Weer tonen",show_chips:"Weerdetails tonen",compact:"Compact",columns:"Kolommen",group:"Groepsregel tonen",invert:"Open en dicht omdraaien",label:"Label",color:"Kleur",date_format:"Datumnotatie",bare:"Achtergrond weglaten"};function Rs(a=new Date){let e=a.getHours();return e<6?"Goedenacht":e<12?"Goedemorgen":e<18?"Goedemiddag":"Goedenavond"}var Vs=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],Ps=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],Dn={humidity:{icon:"drop",tone:"water",label:"Luchtvochtigheid"},wind:{icon:"wind",tone:"neutral",label:"Wind"},uv:{icon:"uv",tone:"solar",label:"UV-index"},precipitation:{icon:"rain",tone:"water",label:"Neerslag"},pressure:{icon:"gaugeArrow",tone:"neutral",label:"Luchtdruk"},sunrise:{icon:"sunrise",tone:"warn",label:"Zonsopkomst"},sunset:{icon:"sunset",tone:"warn",label:"Zonsondergang"}},Bs=["humidity","wind","uv","precipitation","sunset"],Ks=a=>a==null||Number.isNaN(+a)?"":["N","NO","O","ZO","Z","ZW","W","NW"][Math.round(+a/45)%8],Mt=class extends A{validate(e){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768,...e}}watched(){let e=this.config;return[e.weather,e.weather_uv,e.sun,e.precipitation_entity].filter(Boolean)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.show_rule===!1&&this.setAttribute("no-rule",""),`
      <div class="strip">
        <div class="who">
          <div class="hello"></div>
          <div class="date"></div>
        </div>
        ${e.show_chips===!1?"":'<div class="chips"></div>'}
        ${e.show_weather===!1?"":`
        <div class="now">
          <span class="ic"></span>
          <span>
            <span class="temp tnum"></span>
            <span class="cond"></span>
          </span>
        </div>`}
        ${e.show_clock===!1?"":'<div class="clock tnum"></div>'}
      </div>`}wire(){let e=()=>{let n=6e4-Date.now()%6e4+50;this.timer_=setTimeout(()=>{this.paintClock_(),e()},n)};e(),this.teardown_.push(()=>clearTimeout(this.timer_));let t=Number(this.config.hide_below)||0;if(t>0){let n=matchMedia(`(max-width: ${t-1}px)`),i=()=>this.toggleAttribute("narrow",n.matches);i(),n.addEventListener("change",i),this.teardown_.push(()=>n.removeEventListener("change",i))}}paintClock_(){let e=new Date,t=this.config.name??this.hass?.user?.name??"",n=Rs(e);this.$(".hello").innerHTML=t?`${n}, <b>${t}</b>`:n,this.text(".date",`${Vs[e.getDay()]} ${e.getDate()} ${Ps[e.getMonth()]}`);let i=this.$(".clock");i&&this.text(i,e.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"}))}paint(){this.paintClock_();let e=this.config,t=k(this.hass,e.weather),n=F(this.hass,e.weather),i=this.$(".now");if(i&&t){let d=tt(t.state);i.style.setProperty("--wtone",B(e.tone,"water"));let l=this.hass?.config?.unit_system?.temperature??"\xB0C";this.$(".temp").innerHTML=n.temperature!=null?`${G(this.hass,n.temperature,0)}<span>${l}</span>`:"--";let c=i.querySelector(".ic");c.dataset.icon!==d&&(c.dataset.icon=d,c.innerHTML=f(d,"cloud")),this.text(i.querySelector(".cond"),Y(this.hass,t))}let r=this.$(".chips");if(!r)return;let o=Bs.map(d=>this.chip_(d,n)).filter(Boolean),s=o.map(d=>`${d.key}${d.value}`).join("|");r.dataset.sig!==s&&(r.dataset.sig=s,r.innerHTML=o.map(d=>`<span class="chip2" style="--tone:${B(Dn[d.key].tone)}" title="${Dn[d.key].label}">
             ${E[Dn[d.key].icon]??""}${d.value}
           </span>`).join(""))}chip_(e,t){let n=this.config;switch(e){case"humidity":return t.humidity!=null?{key:e,value:`${Math.round(t.humidity)}%`}:null;case"wind":{if(t.wind_speed==null)return null;let i=this.hass?.config?.unit_system?.wind_speed??"km/h",r=Ks(t.wind_bearing);return{key:e,value:`${G(this.hass,t.wind_speed,0)} ${i}${r?` ${r}`:""}`}}case"uv":{let r=F(this.hass,n.weather_uv).uv_index??t.uv_index??(n.weather_uv?Number(k(this.hass,n.weather_uv)?.state):null);return r!=null&&!Number.isNaN(+r)?{key:e,value:`UV ${G(this.hass,r,1)}`}:null}case"precipitation":{let i=k(this.hass,n.precipitation_entity);if(i){let r=Number(i.state);if(Number.isNaN(r))return null;let o=i.attributes.unit_of_measurement??"mm";return{key:e,value:`${G(this.hass,r,1)} ${o}`}}return t.precipitation!=null&&!Number.isNaN(+t.precipitation)?{key:e,value:`${G(this.hass,t.precipitation,1)} mm`}:null}case"pressure":return t.pressure!=null?{key:e,value:`${G(this.hass,t.pressure,0)} ${t.pressure_unit??"hPa"}`}:null;case"sunset":case"sunrise":{let r=k(this.hass,n.sun)?.attributes?.[e==="sunset"?"next_setting":"next_rising"];if(!r)return null;let o=new Date(r);return Number.isNaN(+o)?null:{key:e,value:o.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"})}}default:return null}}getCardSize(){return 2}getGridOptions(){return{columns:"full",rows:2,min_rows:2,max_rows:2}}static getConfigElement(){return document.createElement("domotiapp-header-card-editor")}static getStubConfig(e){return{weather:Object.keys(e?.states??{}).find(n=>n.startsWith("weather.")),sun:"sun.sun"}}};j(Mt,"css",`
    :host { display: block; height: 100%; }
    /* Onder het afkappunt bestaat de kaart niet -- ook geen lege ruimte, want
       in een sections-view laat een verborgen kaart anders zijn gat staan. */
    :host([narrow]) { display: none; }

    .strip {
      height: 100%; min-height: 96px;
      display: grid; grid-template-columns: 1fr auto; align-items: center;
      gap: 6px 18px;
      padding: 10px 16px;
      background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius);
      box-shadow: var(--dac-shadow);
      position: relative; overflow: hidden;
    }
    :host([bare]) .strip { background: none; box-shadow: none; }

    /* Haarlijn accent onderlangs, dezelfde die de Coach-kop draagt. */
    .strip::after {
      content: ""; position: absolute; inset: auto 0 0 0; height: 1px;
      background: linear-gradient(90deg, transparent, var(--dac-accent) 22%,
                  var(--dac-accent-hi) 50%, var(--dac-accent) 78%, transparent);
      opacity: .55;
    }
    :host([no-rule]) .strip::after { display: none; }

    .who { min-width: 0; grid-column: 1; grid-row: 1; }
    .hello {
      font-size: 15.5px; font-weight: 400; letter-spacing: -.01em; line-height: 1.2;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .hello b { font-weight: 600; }
    .date { margin-top: 2px; font-size: 11.5px; color: var(--dac-ink-3); white-space: nowrap; }

    /* De weerdetails krijgen de ruimte die overblijft en schuiven horizontaal
       weg als die op is, in plaats van de strip twee regels hoog te maken. */
    /* De weerdetails krijgen de hele tweede regel voor zich, dus ze passen.
       Mocht het toch krap worden, dan valt er een hele chip weg en nooit een
       halve waarde -- "20:5" leest als een storing, niet als een hint. */
    .chips {
      grid-column: 1; grid-row: 2; min-width: 0;
      display: flex; align-items: center; flex-wrap: nowrap; gap: 18px;
      overflow: hidden;
    }
    .chips:empty { display: none; }
    .chip2 {
      display: inline-flex; align-items: center; gap: 6px; flex: 0 0 auto;
      font-size: 12.5px; color: var(--dac-ink-2); white-space: nowrap;
      font-variant-numeric: tabular-nums;
    }
    .chip2 .icon, .chip2 ha-icon { width: 15px; height: 15px; --mdc-icon-size: 15px; color: var(--tone); }

    .now { grid-column: 2; grid-row: 1; display: flex; align-items: center; gap: 9px; justify-self: end; }
    .now .ic { display: flex; color: var(--wtone); }
    .now .ic .icon, .now .ic ha-icon { width: 22px; height: 22px; --mdc-icon-size: 22px; }
    .now .temp { font-size: 21px; font-weight: 300; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
        /* Het gradenteken als superscript, met lucht ertussen. Strak tegen het
       cijfer aan gezet leest het als een rendermisser. */
    .now .temp span {
      font-size: .5em; margin-left: 3px; vertical-align: .5em;
      color: var(--dac-ink-3); letter-spacing: .01em;
    }
    .now .cond {
      font-size: 10.5px; letter-spacing: .09em; text-transform: uppercase;
      color: var(--dac-ink-3); white-space: nowrap;
    }

    .clock {
      grid-column: 2; grid-row: 2; justify-self: end;
      font-size: 19px; font-weight: 400; letter-spacing: -.01em;
      font-variant-numeric: tabular-nums;
    }

    @media (max-width: 620px) {
      .now .cond { display: none; }
      .chips { gap: 12px; }
    }
  `);var Hn=class extends D{defaults(){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768}}schema(){return[Ln({name:"weather",selector:_.entity("weather")},{name:"weather_uv",selector:{entity:{domain:["weather","sensor"]}}}),Ln({name:"sun",selector:_.entity("sun")},{name:"precipitation_entity",selector:_.entity("sensor")}),{name:"name",selector:_.text()},{name:"hide_below",selector:_.number(0,1400,8)}]}label(e){return{weather:"Weer (temperatuur, wind)",weather_uv:"Tweede weerbron (UV-index)",precipitation_entity:"Neerslagsensor",show_rule:"Accentlijn tonen",hide_below:"Verbergen onder breedte (px)",name:"Naam"}[e.name]??super.label(e)}helper(e){if(e.name==="weather_uv")return"Alleen voor de UV-index. Handig als je hoofdbron die niet meelevert.";if(e.name==="precipitation_entity")return"Een sensor in mm of mm/h, bijvoorbeeld neerslagintensiteit of regen laatste uur.";if(e.name==="hide_below")return"768 verbergt de header op telefoons en houdt hem op tablets en desktops. 0 zet het uit.";if(e.name==="name")return"Leeg laten voor de naam van de ingelogde gebruiker."}};I("domotiapp-header-card-editor",Hn);N("domotiapp-header-card",Mt,{name:"DomotiApp Header",description:"Smalle strip met begroeting, weer en klok. Verbergt zichzelf op telefoons."});var St=class extends A{validate(e){return{icon:"",tone:"accent",line:!0,...e}}watched(){return this.config.secondary_entity?[this.config.secondary_entity]:[]}template(){let e=this.config,t=e.icon!==null&&e.icon!==!1;return t||this.setAttribute("no-icon",""),`
      <div class="sep" style="--tone:${B(e.tone)}">
        ${t?`<span class="chip">${f(e.icon,"star")}</span>`:""}
        <h3></h3>
        ${e.line===!1?"":'<span class="rule"></span>'}
        <span class="sub"><span class="si"></span><span class="sv"></span></span>
      </div>`}paint(){this.text("h3",this.config.name??"");let e=this.$(".sub");if(!e)return;let t=k(this.hass,this.config.secondary_entity),n=e.querySelector(".si"),i=e.querySelector(".sv");if(!t){i.textContent="",n.innerHTML="";return}let r=this.config.secondary_icon??"";n.dataset.icon!==r&&(n.dataset.icon=r,n.innerHTML=r?f(r):"");let o=t.attributes.unit_of_measurement;i.textContent=o?`${t.state} ${o}`:t.attributes.current_temperature!=null?`${t.attributes.current_temperature} \xB0C`:Y(this.hass,t)}getCardSize(){return 1}getGridOptions(){return{columns:"full",rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-separator-card-editor")}static getStubConfig(){return{name:"Nieuwe sectie",icon:"house",tone:"accent"}}};j(St,"css",`
    :host { display: block; height: 100%; }

    .sep {
      display: flex; align-items: center; gap: 10px;
      height: 100%; min-height: 34px;
    }

    .chip { width: 30px; height: 30px; }
    .chip .icon, .chip ha-icon { width: 16px; height: 16px; --mdc-icon-size: 16px; }

    /* De naam wordt getoond zoals hij is ingetypt. Er stond hier
       text-transform: uppercase, en dan geeft het toetsenbord "Woonkamer" en
       het scherm "WOONKAMER" -- een kaart hoort niet te corrigeren wat iemand
       schrijft. */
    h3 {
      margin: 0; min-width: 0;
      font-size: 14px; font-weight: 600; letter-spacing: -.01em;
      color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .rule {
      flex: 1 1 auto; height: 1px; min-width: 12px;
      background: linear-gradient(90deg,
        color-mix(in srgb, var(--tone) 45%, transparent), transparent);
    }

    .sub {
      flex: 0 0 auto; display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--dac-ink-2);
      font-variant-numeric: tabular-nums;
    }
    .sub:empty { display: none; }
    .sub .si { display: flex; color: var(--tone); }
    .sub .si:empty { display: none; }
    .sub .si .icon, .sub .si ha-icon { width: 14px; height: 14px; --mdc-icon-size: 14px; }

    /* Without an icon the title should still start where the icons above and
       below it start, or the column develops a wobble. */
    :host([no-icon]) .sep { padding-left: 2px; }
  `);var In=class extends D{defaults(){return{line:!0,tone:"accent"}}gedeeldeVelden(){return[]}pickers(){return[{key:"icon",kind:"icon",label:"Icoon links",fallback:"star",auto:!1},{key:"secondary_icon",kind:"icon",label:"Icoon bij de waarde rechts",auto:!1}]}schema(){return[{name:"name",selector:_.text()},{name:"line",selector:_.bool()},{name:"secondary_entity",selector:_.entity()}]}label(e){return{line:"Lijn tonen",secondary_entity:"Waarde rechts (optioneel)"}[e.name]??super.label(e)}helper(e){if(e.name==="secondary_entity")return"Toont de status van deze entiteit rechts van de lijn, bijvoorbeeld een temperatuur of een aantal."}};I("domotiapp-separator-card-editor",In);N("domotiapp-separator-card",St,{name:"DomotiApp Separator",description:"Sectiekop met icoon en vervagende lijn."});var Rn=(a,e,t)=>Math.min(t,Math.max(e,a));function we(a,e){let t=e.min??0,n=e.max??100,i=e.step??1,r=!1,o=m=>{let b=a.getBoundingClientRect();if(!b.width)return t;let v=Rn((m-b.left)/b.width,0,1),y=t+v*(n-t);return Rn(Math.round(y/i)*i,t,n)},s=m=>{try{a.setPointerCapture?.(m)}catch{}},d=m=>{try{a.hasPointerCapture?.(m)&&a.releasePointerCapture(m)}catch{}},l=m=>{e.disabled?.()||m.button!=null&&m.button!==0||(r=!0,s(m.pointerId),a.classList.add("dragging"),e.onInput(o(m.clientX)),m.preventDefault())},c=m=>{r&&(e.onInput(o(m.clientX)),m.preventDefault())},p=m=>{r&&(r=!1,d(m.pointerId),a.classList.remove("dragging"),e.onCommit(o(m.clientX)))},h=m=>{r&&(r=!1,d(m?.pointerId),a.classList.remove("dragging"),e.onInput(e.value()))},g=m=>{if(e.disabled?.())return;let b=(n-t)/10,v={ArrowLeft:-i,ArrowDown:-i,ArrowRight:i,ArrowUp:i,PageDown:-b,PageUp:b,Home:-1/0,End:1/0};if(!(m.key in v))return;m.preventDefault();let y=e.value(),x=Rn(v[m.key]===-1/0?t:v[m.key]===1/0?n:y+v[m.key],t,n);e.onInput(x),e.onCommit(x)};return a.addEventListener("pointerdown",l),a.addEventListener("pointermove",c),a.addEventListener("pointerup",p),a.addEventListener("pointercancel",h),a.addEventListener("keydown",g),()=>{a.removeEventListener("pointerdown",l),a.removeEventListener("pointermove",c),a.removeEventListener("pointerup",p),a.removeEventListener("pointercancel",h),a.removeEventListener("keydown",g)}}var se=(a="")=>`
  <div class="slider ${a}" role="slider" tabindex="0"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div class="track"><div class="fill"></div></div>
    <div class="thumb"></div>
  </div>`,ye=`
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
`;var Gs=new Set(["brightness","color_temp","hs","rgb","rgbw","rgbww","xy","white"]),Us=new Set(["hs","rgb","rgbw","rgbww","xy"]),Pn=a=>a?.attributes?.supported_color_modes??[],Ws=a=>Pn(a).some(e=>Gs.has(e)),Ot=a=>Pn(a).some(e=>Us.has(e)),Nt=a=>Pn(a).includes("color_temp"),Ti=a=>Math.max(1,Math.round((a??0)/255*100)),Ct=class extends A{validate(e){let t=e.entity??e.lights?.[0]??e.entities?.[0],n=typeof t=="string"?t:t?.entity;return n?{show_colour:!0,...e,entity:n}:{...e,[T]:"Kies een lamp."}}watched(){return[this.config.entity]}template(){return this.config.bare&&this.setAttribute("bare",""),`
      <div class="card surface">
        <div class="lamp" data-on="false" style="--tone:var(--dac-lit)">
          <button class="chip" type="button" aria-label="Aan of uit"></button>
          <span class="txt"><span class="nm"></span><span class="v tnum"></span></span>
          <span class="ctl" style="display:contents"></span>
        </div>
        <div class="colour" hidden></div>
      </div>`}wire(){let e=this.config.entity;this.teardown_.push(R(this.$(".chip"),{onTap:()=>this.hass.callService("light","toggle",{entity_id:e}),onHold:()=>Q(this,e)})),this.on(this.$(".card"),"click",t=>{t.target.closest(".toggle")&&this.hass.callService("light","toggle",{entity_id:e})}),this.teardown_.push(P(this.$(".card"))),this.sliders_=new Map}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let i=we(e,n);this.sliders_.set(t,i),this.teardown_.push(i)}setSlider_(e,t,n=0,i=100){if(!e)return;let r=i>n?(t-n)/(i-n)*100:0;e.style.setProperty("--v",`${r}%`),e.setAttribute("aria-valuemin",String(n)),e.setAttribute("aria-valuemax",String(i)),e.setAttribute("aria-valuenow",String(t))}paint(){let e=this.config,t=k(this.hass,e.entity),n=ee(t),i=t?.state==="on",r=this.$(".lamp");r.dataset.on=String(i),r.classList.toggle("unavailable",n);let o=this.$(".chip"),s=e.icon||"bulb";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=f(s,"bulb")),this.text(".nm",C(this.hass,e.entity,e.name));let d=i?t?.attributes?.rgb_color:null;r.style.setProperty("--tone",d?`rgb(${d[0]},${d[1]},${d[2]})`:"var(--dac-lit)");let l=this.$(".ctl"),c=n?"none":Ws(t)?"range":"toggle";if(l.dataset.kind!==c&&(l.dataset.kind=c,l.innerHTML=c==="range"?se("brightness"):c==="toggle"?'<button class="toggle" type="button" role="switch" aria-checked="false" aria-label="Aan of uit"></button>':"",this.sliders_.delete("brightness")),c==="range"){let p=l.querySelector(".slider");if(this.attach_(p,"brightness",{value:()=>t?.state==="on"?Ti(k(this.hass,e.entity)?.attributes?.brightness):0,onInput:h=>{this.setSlider_(p,h),this.text(".v",h===0?"Uit":`${h}%`)},onCommit:h=>{h===0?this.hass.callService("light","turn_off",{entity_id:e.entity}):this.hass.callService("light","turn_on",{entity_id:e.entity,brightness_pct:h})},disabled:()=>ee(k(this.hass,e.entity))}),!p.classList.contains("dragging")){let h=i?Ti(t.attributes.brightness):0;this.setSlider_(p,h),this.text(".v",i?`${h}%`:"Uit")}}else c==="toggle"?(l.querySelector(".toggle")?.setAttribute("aria-checked",String(i)),this.text(".v",i?"Aan":"Uit")):this.text(".v","Niet bereikbaar");this.paintColour_(t,i),L(this.$(".card"))}paintColour_(e,t){let n=this.$(".colour"),i=this.config.show_colour!==!1&&(Ot(e)||Nt(e));if(n.hidden=!(i&&t),!i)return;let r=`${Ot(e)?"c":""}${Nt(e)?"t":""}`;if(n.dataset.sig!==r){n.dataset.sig=r,n.innerHTML=(Ot(e)?`<span data-kind="hue" style="display:contents">${se("hue")}</span>`:"")+(Nt(e)?`<span data-kind="kelvin" style="display:contents">${se("kelvin")}</span>`:"");let l=n.querySelector(".slider.hue");l&&(l.dataset.strip="",l.style.setProperty("--strip","linear-gradient(90deg, hsl(0 90% 55%), hsl(60 90% 55%), hsl(120 90% 55%), hsl(180 90% 55%), hsl(240 90% 55%), hsl(300 90% 55%), hsl(360 90% 55%))"),l.setAttribute("aria-label","Kleur"));let c=n.querySelector(".slider.kelvin");c&&(c.dataset.strip="",c.style.setProperty("--strip","linear-gradient(90deg,#ffb15e,#ffd6a8,#fff5e8,#eaf1ff,#cbdcff)"),c.setAttribute("aria-label","Kleurtemperatuur")),this.sliders_.delete("hue"),this.sliders_.delete("kelvin")}if(!t)return;let o=this.config.entity,s=n.querySelector(".slider.hue");s&&(this.attach_(s,"hue",{min:0,max:360,value:()=>k(this.hass,o)?.attributes?.hs_color?.[0]??0,onInput:l=>this.setSlider_(s,l,0,360),onCommit:l=>{let c=k(this.hass,o)?.attributes?.hs_color?.[1]??100;this.hass.callService("light","turn_on",{entity_id:o,hs_color:[l,c]})}}),s.classList.contains("dragging")||this.setSlider_(s,Math.round(e.attributes.hs_color?.[0]??0),0,360));let d=n.querySelector(".slider.kelvin");if(d){let l=e.attributes.min_color_temp_kelvin??2e3,c=e.attributes.max_color_temp_kelvin??6500;if(this.attach_(d,"kelvin",{min:l,max:c,step:50,value:()=>k(this.hass,o)?.attributes?.color_temp_kelvin??l,onInput:p=>this.setSlider_(d,p,l,c),onCommit:p=>this.hass.callService("light","turn_on",{entity_id:o,color_temp_kelvin:p})}),!d.classList.contains("dragging")){let p=e.attributes.color_temp_kelvin;p!=null&&this.setSlider_(d,p,l,c)}}}getCardSize(){let e=k(this.hass,this.config?.entity);return e?.state==="on"&&(Ot(e)||Nt(e))?2:1}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",1)}}static getConfigElement(){return document.createElement("domotiapp-light-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("light."));return n?{entity:n}:{}}};j(Ct,"css",`
    :host { display: block; }

    /* De hoogte komt op een rasterrij van Home Assistant uit; --dac-raster
       wordt gemeten en gezet door volgRaster in rasterhoogte.js. Uit is deze
       kaart 56px, met kleurstrips 120px -- en nooit de 93px ertussenin, want
       dan begint de kaart eronder op een halve rij. */
    .card {
      min-height: var(--dac-raster, 56px); padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 7px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .lamp { display: flex; align-items: center; gap: 11px; min-height: 40px; }

    .chip { width: 40px; height: 40px; cursor: pointer; }
    .chip .icon, .chip ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
    .lamp[data-on="false"] .chip {
      color: var(--dac-ink-3); background: rgba(255,255,255,.05); border-color: var(--dac-border);
    }
    /* Een brandende lamp gloeit een beetje. Dat is de enige plek in de familie
       waar een schaduw betekenis draagt in plaats van diepte. */
    .lamp[data-on="true"] .chip {
      box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
    }

    .txt { min-width: 0; flex: 0 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .v { font-size: 11.5px; color: var(--dac-ink-2); font-variant-numeric: tabular-nums; line-height: 1.25; }

    ${ye}

    .colour { display: flex; gap: 8px; }
    .colour[hidden] { display: none; }
    .colour .slider { height: 30px; flex: 1 1 0; }
    .colour .slider .track { border-radius: 8px; }
    .colour .slider .thumb { top: 4px; bottom: 4px; width: 6px; margin-left: -3px; }

    /* ---- aan/uit, voor lampen die alleen dat kunnen ---- */
    .toggle {
      flex: 0 0 auto; margin-left: auto; width: 52px; height: 30px; padding: 0; cursor: pointer;
      border-radius: var(--dac-radius-pill); position: relative;
      background: rgba(255,255,255,.08); border: 1px solid var(--dac-border);
      transition: background 200ms ease, border-color 200ms ease;
    }
    .toggle::after {
      content: ""; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px;
      border-radius: 50%; background: var(--dac-ink-2);
      transition: transform 220ms cubic-bezier(.3,.8,.4,1), background 200ms ease;
    }
    .lamp[data-on="true"] .toggle {
      background: color-mix(in srgb, var(--tone) 28%, transparent);
      border-color: color-mix(in srgb, var(--tone) 55%, transparent);
    }
    .lamp[data-on="true"] .toggle::after { transform: translateX(22px); background: var(--dac-ink); }

    .lamp.unavailable { opacity: .42; }
    .lamp.unavailable .slider, .lamp.unavailable .toggle { pointer-events: none; }
  `);var Vn=class extends D{defaults(){return{show_colour:!0}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"bulb"}]}schema(){return[{name:"entity",selector:_.entity("light")},{name:"name",selector:_.text()},{name:"show_colour",selector:_.bool()}]}label(e){return{entity:"Lamp",name:"Naam (overschrijft die van de lamp)",show_colour:"Kleurstrips tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"E\xE9n lamp per kaart. Dimbaar krijgt een schuif, alleen schakelbaar een tuimelaar.";if(e.name==="show_colour")return"Kleur en kleurtemperatuur verschijnen zodra de lamp aan is. De kaart is dan twee rijen hoog."}};I("domotiapp-light-card-editor",Vn);N("domotiapp-light-card",Ct,{name:"DomotiApp Verlichting",description:"E\xE9n lamp op \xE9\xE9n rasterrij: dimmen, kleur en kleurtemperatuur."});function Li(a){if(!a)return null;let e=Number(a.state);return Number.isFinite(e)?e:null}function qs(a){let e=a?.attributes?.hvac_action;return e||(a?.state==="off"?"off":a?.state==="cool"?"cooling":a?.state==="heat"?"idle":null)}var Bn={heating:"var(--dac-solar)",cooling:"var(--dac-grid-in)",drying:"var(--dac-grid-in)",fan:"var(--dac-grid-in)"},Kn={heating:"Verwarmt",cooling:"Koelt",drying:"Ontvochtigt",fan:"Ventileert",idle:"Uit",off:"Uit"},Tt=class extends A{validate(e){return e.entity||e.temperature||e.humidity?{...e}:{...e,[T]:"Kies een thermostaat, of een temperatuursensor."}}watched(){let e=this.config;return[e.entity,e.temperature,e.humidity].filter(Boolean)}step_(){let e=F(this.hass,this.config.entity);return Number(this.config.step??e.target_temp_step)||.5}gestapeld_(){return this.config.layout==="gestapeld"}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.entity||this.setAttribute("readout",""),this.setAttribute("vorm",this.gestapeld_()?"gestapeld":"rij"),`
      <div class="card surface">
        <div class="kop">
          <button class="chip" type="button" aria-label="Meer info"></button>
          <div class="txt">
            <div class="nm"></div>
            <div class="read">
              <span class="temp"></span>
              <span class="sep"></span>
              <span class="hum"></span>
            </div>
          </div>
        </div>
        <div class="tegels">
          <div class="tegel t-temp"><span class="w"></span><span class="l">Temperatuur</span></div>
          <div class="tegel t-hum"><span class="w"></span><span class="l">Vochtigheid</span></div>
        </div>
        ${e.entity?`<div class="set">
                 <button type="button" data-d="-1" aria-label="Lager">${E.minus}</button>
                 <span class="target tnum"></span>
                 <button type="button" data-d="1" aria-label="Hoger">${E.plus}</button>
               </div>`:""}
      </div>`}wire(){let e=this.config;this.teardown_.push(()=>clearTimeout(this.sendTimer_)),this.gestapeld_()&&this.teardown_.push(P(this.$(".card"))),this.teardown_.push(R(this.$(".chip"),{onTap:()=>Q(this,e.entity||e.temperature||e.humidity)}));let t=this.$(".set");t&&t.querySelectorAll("button").forEach(n=>this.on(n,"click",()=>this.nudge_(Number(n.dataset.d))))}nudge_(e){let t=this.config,n=F(this.hass,t.entity),i=this.step_(),r=Number(n.min_temp??5),o=Number(n.max_temp??35),s=this.pending_??Number(n.temperature);if(!Number.isFinite(s))return;let d=Math.min(o,Math.max(r,Math.round((s+e*i)/i)*i));this.pending_=d,this.paintTarget_(),clearTimeout(this.sendTimer_),this.sendTimer_=setTimeout(()=>{this.sendTimer_=null,this.hass.callService("climate","set_temperature",{entity_id:t.entity,temperature:this.pending_}),setTimeout(()=>{this.pending_=null,this.paint()},1500)},450)}paintTarget_(){let e=this.$(".target");if(!e)return;let t=F(this.hass,this.config.entity),n=this.pending_??Number(t.temperature);e.classList.toggle("pending",this.pending_!=null),e.textContent=Number.isFinite(n)?`${G(this.hass,n,n%1?1:0)}\xB0`:"--"}paint(){let e=this.config,t=e.entity?k(this.hass,e.entity):null,n=e.entity?ee(t):!1;this.toggleAttribute("dead",n);let i=qs(t),r=e.tone?B(e.tone):Bn[i]??"var(--dac-ink-3)";this.$(".card").style.setProperty("--tone",r),this.toggleAttribute("busy",!!Bn[i]);let o=this.$(".chip"),s=e.icon||"thermo";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=f(s,"thermo")),o.style.setProperty("--tone",Bn[i]?r:"var(--dac-ink-3)"),this.text(".nm",C(this.hass,e.entity||e.temperature||e.humidity,e.name));let d=e.temperature?Li(k(this.hass,e.temperature)):Number(F(this.hass,e.entity).current_temperature),l=this.hass?.config?.unit_system?.temperature??"\xB0C";this.text(".temp",Number.isFinite(d)?`${G(this.hass,d,1)} ${l}`:"--");let c=e.humidity?Li(k(this.hass,e.humidity)):null,p=this.$(".hum");if(this.gestapeld_()){this.text(".temp",""),p.textContent=Kn[i]??"";let g=this.$(".t-temp"),m=this.$(".t-hum");g.hidden=!Number.isFinite(d),m.hidden=c==null,g.hidden||(g.querySelector(".w").textContent=`${G(this.hass,d,1)} ${l}`),m.hidden||(m.querySelector(".w").textContent=`${G(this.hass,c,0)}%`)}else p.innerHTML=c==null?"":`${E.drop}${G(this.hass,c,0)}%`,this.text(".sep",c==null?"":"\xB7"),e.entity&&!e.humidity&&Kn[i]&&i!=="idle"&&(this.text(".sep","\xB7"),p.textContent=Kn[i]);this.paintTarget_();let h=this.$(".set");if(h){let g=F(this.hass,e.entity),m=this.pending_??Number(g.temperature);h.querySelector('[data-d="-1"]').disabled=n||m<=Number(g.min_temp??5),h.querySelector('[data-d="1"]').disabled=n||m>=Number(g.max_temp??35)}this.gestapeld_()&&L(this.$(".card"))}getCardSize(){return this.gestapeld_()?3:1}getGridOptions(){return this.gestapeld_()?{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",this.config.entity?3:2)}:{columns:12,rows:1,min_columns:4,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-climate-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("climate."));return n?{entity:n}:{}}};j(Tt,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 7px 12px;
      display: flex; align-items: center; gap: 11px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .chip {
      width: 40px; height: 40px; flex: 0 0 auto; cursor: pointer;
      transition: color 220ms ease, background 220ms ease,
                  border-color 220ms ease, box-shadow 220ms ease;
    }
    .chip .icon, .chip ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
    /* Alleen als er echt iets gebeurt gloeit het icoon. "Aan maar niets aan het
       doen" is de normale toestand van een thermostaat en hoort stil te zijn. */
    :host([busy]) .chip {
      box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
    }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .read {
      display: flex; align-items: center; gap: 7px;
      font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2);
      font-variant-numeric: tabular-nums;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .read .sep { color: var(--dac-ink-3); }
    .read .hum { display: inline-flex; align-items: center; gap: 4px; }
    .read .hum .icon { width: 12px; height: 12px; color: var(--dac-grid-in); }
    .read .hum:empty { display: none; }

    /* Zonder thermostaat is de meting het onderwerp, dus die mag groter. */
    :host([readout]) .read { font-size: 15px; color: var(--dac-ink); }
    :host([readout]) .read .hum .icon { width: 14px; height: 14px; }

    /* ---- stelknop ---- */
    .set {
      flex: 0 0 auto; display: inline-flex; align-items: center; gap: 2px; padding: 3px;
      background: rgba(255,255,255,.05); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
    }
    .set button {
      width: 32px; height: 32px; display: grid; place-items: center; padding: 0; cursor: pointer;
      border: 0; background: transparent; color: var(--dac-ink-2);
      border-radius: var(--dac-radius-pill);
      transition: background 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .set button:hover { color: var(--dac-ink); background: rgba(255,255,255,.08); } }
    .set button:active { background: rgba(255,255,255,.14); }
    .set button:disabled { opacity: .3; cursor: default; }
    .set button .icon { width: 16px; height: 16px; }
    .set .target {
      min-width: 44px; text-align: center;
      font-size: 14.5px; font-weight: 500; letter-spacing: -.01em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
    }
    /* Terwijl je tikt loopt het getal voor op de ketel. Dat mag je zien. */
    .set .target.pending { color: var(--tone); }

    :host([dead]) .card { opacity: .42; }
    :host([dead]) .set { pointer-events: none; }

    /* ---- gestapeld ----------------------------------------------------
       Gevraagd op 27 augustus 2026: "anders past het niet op telefoon."
       Op een telefoon is de kolom smal, en dan duwt de stelknop rechts de
       naam en de meting samen tot er niets meer van te lezen valt. Dus:
       kop bovenaan, de metingen als twee tegels eronder, en de stelknop
       over de volle breedte daaronder. Dat is de vorm van zijn eigen
       klimaat-pop-up.

       De rij-vorm blijft de standaard. Een kaart die uit zichzelf van vorm
       verandert bij een smalle kolom zou hetzelfde dashboard op twee
       schermen anders laten lezen, en dat is niet aan de kaart. */
    :host([vorm="gestapeld"]) { height: auto; }
    :host([vorm="gestapeld"]) .card {
      flex-direction: column; align-items: stretch; gap: 8px; padding: 10px 12px;
      /* Niet 100%: de hoogte volgt de inhoud, en meetRaster duwt hem daarna op
         naar 56, 120, 184 of 248 zodat hij op HA's rasterrijen valt. */
      height: auto; min-height: var(--dac-raster, 120px);
    }
    .kop { display: flex; align-items: center; gap: 11px; min-width: 0; }
    :host(:not([vorm="gestapeld"])) .kop {
      display: contents;
    }

    .tegels { display: none; }
    :host([vorm="gestapeld"]) .tegels {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
    }
    .tegel {
      display: flex; flex-direction: column; align-items: center; gap: 1px;
      padding: 7px 6px;
      background: rgba(255,255,255,.038); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-s);
    }
    .tegel .w {
      font-size: 15px; font-weight: 500; letter-spacing: -.01em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
    }
    .tegel .l { font-size: 10.5px; line-height: 1.2; color: var(--dac-ink-3); }
    /* Een tegel zonder meting hoort er niet te staan; de andere neemt de
       volle breedte, anders staat er een gat naast. */
    .tegel[hidden] { display: none; }
    :host([vorm="gestapeld"]) .tegels:has(.tegel[hidden]) { grid-template-columns: 1fr; }

    /* Over de volle breedte, en de knoppen aan de uiteinden: op een telefoon
       wil je met \xE9\xE9n duim bij allebei kunnen. */
    :host([vorm="gestapeld"]) .set { display: flex; justify-content: space-between; }
    :host([vorm="gestapeld"]) .set .target { flex: 1 1 auto; font-size: 16px; }
    /* In de gestapelde vorm staat de meting in de tegels, dus de regel onder
       de naam draagt alleen nog wat de ketel doet. */
    :host([vorm="gestapeld"]) .read .sep { display: none; }
  `);var Gn=class extends D{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"thermo"}]}schema(){return[{name:"entity",selector:_.entity("climate")},{name:"temperature",selector:{entity:{domain:"sensor",device_class:"temperature"}}},{name:"humidity",selector:{entity:{domain:"sensor",device_class:"humidity"}}},{name:"name",selector:_.text()},{name:"layout",selector:_.select([{value:"rij",label:"Rij (\xE9\xE9n rasterrij hoog)"},{value:"gestapeld",label:"Onder elkaar (past op een telefoon)"}])},{name:"step",selector:_.number(.1,5,.1)}]}label(e){return{entity:"Thermostaat (optioneel)",temperature:"Temperatuursensor (optioneel)",humidity:"Vochtigheidssensor (optioneel)",name:"Naam",layout:"Vorm",step:"Stap van de knoppen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Leeg laten voor een kaart die alleen meet. Met thermostaat komen de stelknoppen erbij.";if(e.name==="temperature")return"Wint van de meting van de thermostaat zelf. Handig als er een betere sensor in de kamer hangt.";if(e.name==="layout")return"Onder elkaar zet de metingen als twee tegels neer met de stelknop over de volle breedte eronder. Bedoeld voor een smalle kolom of een pop-up, waar de rij-vorm de naam en de meting samendrukt.";if(e.name==="step")return"Leeg laten volgt de thermostaat, en anders een halve graad."}};I("domotiapp-climate-card-editor",Gn);N("domotiapp-climate-card",Tt,{name:"DomotiApp Klimaat",description:"Thermostaat, losse temperatuur- en vochtsensor, of allebei."});var Di=({label:a="Aan of uit",cls:e=""}={})=>`<button class="toggle ${e}" type="button" role="switch" aria-checked="false" aria-label="${a}"><span class="knob"></span></button>`;function Un(a,e){if(!a)return;let t=String(!!e);a.getAttribute("aria-checked")!==t&&a.setAttribute("aria-checked",t)}function Hi(a,e){let t=a.querySelector(".knob"),n=!1,i=0,r=!1,o=!1,s=()=>{n=!1,a.classList.remove("dragging"),t?.style.removeProperty("--knob")},d=m=>{m!==e.value()&&(Un(a,m),e.set(m))},l=m=>{if(!e.disabled?.()&&!(m.button!=null&&m.button!==0)){m.stopPropagation(),n=!0,r=!1,o=!1,i=m.clientX,a.classList.add("dragging");try{a.setPointerCapture?.(m.pointerId)}catch{}}},c=m=>{if(!n)return;let b=m.clientX-i;Math.abs(b)>3&&(r=!0);let v=e.value()?22:0,y=Math.min(22,Math.max(0,v+b));t?.style.setProperty("--knob",`${y}px`)},p=m=>{if(!n)return;m.stopPropagation();let b=m.clientX-i,v=e.value()?22:0,y=Math.min(22,Math.max(0,v+b));s();try{a.hasPointerCapture?.(m.pointerId)&&a.releasePointerCapture(m.pointerId)}catch{}o=!0,d(r?y>22/2:!e.value())},h=()=>{n&&s()},g=m=>{if(m.stopPropagation(),m.preventDefault(),o){o=!1;return}e.disabled?.()||d(!e.value())};return a.addEventListener("pointerdown",l),a.addEventListener("pointermove",c),a.addEventListener("pointerup",p),a.addEventListener("pointercancel",h),a.addEventListener("click",g),()=>{a.removeEventListener("pointerdown",l),a.removeEventListener("pointermove",c),a.removeEventListener("pointerup",p),a.removeEventListener("pointercancel",h),a.removeEventListener("click",g)}}var Ii=`
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
  .toggle[aria-checked="true"] .knob { --knob: 22px; background: var(--dac-ink); }
  .toggle.dragging .knob { transition: none; }
  @media (hover: hover) { .toggle:hover { border-color: var(--dac-border-hi); } }
`;var Lt=a=>String(a??"").split(".")[0],Ri=new Set(["input_datetime","time","date","datetime"]),Vi=a=>Ri.has(Lt(a)),le=a=>String(a).padStart(2,"0");function Fs(a){let e=String(a??"");return/^\d{4}-\d{2}-\d{2}[ T]\d{1,2}:\d{2}/.test(e)?"datetime-local":/^\d{4}-\d{2}-\d{2}$/.test(e)?"date":/^\d{1,2}:\d{2}/.test(e)?"time":null}function Wn(a){if(!a)return null;let e=Lt(a.entity_id);if(e==="time")return"time";if(e==="date")return"date";if(e==="datetime")return"datetime-local";if(e!=="input_datetime")return null;let t=a.attributes??{};return typeof t.has_date=="boolean"||typeof t.has_time=="boolean"?t.has_date&&t.has_time?"datetime-local":t.has_date?"date":t.has_time?"time":null:Fs(a.state)}var Zs=a=>`${a.getFullYear()}-${le(a.getMonth()+1)}-${le(a.getDate())}T${le(a.getHours())}:${le(a.getMinutes())}`;function Xs(a){let e=-a.getTimezoneOffset(),t=e<0?"-":"+",n=Math.abs(e);return`${t}${le(Math.floor(n/60))}:${le(n%60)}`}function Pi(a,e=Wn(a)){if(!a||!e)return"";let t=String(a.state??"");if(!t||t==="unknown"||t==="unavailable")return"";if(e==="time"){let i=t.match(/^(\d{1,2}):(\d{2})/);return i?`${le(i[1])}:${i[2]}`:""}if(e==="date"){let i=t.match(/^(\d{4}-\d{2}-\d{2})$/);return i?i[1]:""}if(Lt(a.entity_id)==="datetime"){let i=new Date(t);return Number.isNaN(+i)?"":Zs(i)}let n=t.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})/);return n?`${n[1]}T${le(n[2].split(":")[0])}:${n[2].split(":")[1]}`:""}function Bi(a,e,t){let n=Lt(a),i=String(t??"");if(!i||!Ri.has(n)||!e)return null;if(e==="time"){let h=i.match(/^(\d{1,2}):(\d{2})/);if(!h)return null;let g=`${le(h[1])}:${h[2]}:00`;return n==="time"?["time","set_value",{entity_id:a,time:g}]:["input_datetime","set_datetime",{entity_id:a,time:g}]}if(e==="date")return/^\d{4}-\d{2}-\d{2}$/.test(i)?n==="date"?["date","set_value",{entity_id:a,date:i}]:["input_datetime","set_datetime",{entity_id:a,date:i}]:null;let r=i.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})/);if(!r)return null;let[,o,s,d,l,c]=r,p=`${le(l)}:${c}:00`;if(n==="datetime"){let h=Xs(new Date(+o,+s-1,+d,+l,+c));return["datetime","set_value",{entity_id:a,datetime:`${o}-${s}-${d}T${p}${h}`}]}return["input_datetime","set_datetime",{entity_id:a,datetime:`${o}-${s}-${d} ${p}`}]}var Ki=a=>String(a??"").split(".")[0],Gi=new Set(["input_select","select"]),qn=a=>Gi.has(Ki(a));function Se(a){if(!a||!qn(a.entity_id))return[];let e=a.attributes?.options;return Array.isArray(e)?e.filter(t=>typeof t=="string"&&t!==""):[]}function Dt(a,e=Se(a)){let t=String(a?.state??"");return!t||t==="unknown"||t==="unavailable"?"":e.includes(t)?t:""}function Ht(a,e,t=[]){let n=Ki(a),i=String(e??"");return!i||!Gi.has(n)||t.length&&!t.includes(i)?null:[n,"select_option",{entity_id:a,option:i}]}var Ui={auto:"automatisch",automatic:"automatisch",eco:"eco",intensiv:"intensief",intensive:"intensief",kurz:"kort",quick:"snel",express:"snel",speed:"snel",glas:"glas",glass:"glas",delicate:"fijn",normal:"normaal",night:"nacht",silence:"stil",quiet:"stil",hygiene:"hygi\xEBne",hygienic:"hygi\xEBne",favorite:"favoriet",favourite:"favoriet",steam:"stoom",fresh:"fris",care:"verzorging",machinecare:"machineverzorging",machine:"machine",prerinse:"voorspoelen",rinse:"spoelen",presoak:"voorweken",soak:"weken",wash:"wassen",dry:"drogen",half:"half",load:"belading",mixed:"gemengd",maximum:"maximaal",cleaning:"reinigen",clean:"reinigen",pots:"pannen",chef:"chef",kitchen:"keuken",party:"feest",daily:"dagelijks",super:"super",turbo:"turbo",energy:"energie",saving:"zuinig",off:"uit",on:"aan",none:"geen",standby:"stand-by",ready:"gereed",pause:"pauze",stop:"stop",start:"start",finished:"klaar",low:"laag",medium:"midden",high:"hoog"},Qs=/^.*program(?:me)?[_.\- ]/i,Ys=30,Js=95;function el(a){return String(a??"").replace(Qs,"").replace(/([a-z])([A-Z])/g,"$1 $2").replace(/([a-zA-Z])(\d)/g,"$1 $2").replace(/(\d)([a-zA-Z])/g,"$1 $2").split(/[\s_.\-]+/).filter(Boolean)}function tl(a){let e=el(a);if(!e.length)return"";let t=[];for(let i=0;i<e.length;i++){let r=e[i],o=r.toLowerCase();if(/^\d+$/.test(o)){let l=Number(o);t.push(l>=Ys&&l<=Js?`${l} \xB0C`:o);continue}let s=e[i+1]?.toLowerCase(),d=s?Ui[o+s]:void 0;if(d){t.push(d),i++;continue}t.push(Ui[o]??r)}let n=t.join(" ");return n.charAt(0).toUpperCase()+n.slice(1)}function nl(a,e){let t=i=>String(i??"").toLowerCase().replace(/[^a-z0-9]/g,""),n=t(e);return!!n&&n!==t(a)}function It(a,e){return nl(a,e)?String(e):tl(a)||String(a??"")}var Vt={row:44,tile:96,compact:44,beeld:120},ze=6,Wi=12,Fn=22,al=["row","tile","compact","beeld"],il=["links","midden"],Zn=48,Xn=320,Rt=120,de=a=>{if(a==null||a==="")return Rt;let e=Math.round(Number(a));return Number.isFinite(e)?Math.min(Xn,Math.max(Zn,e)):Rt},nt=a=>il.includes(a)?a:"links";function qi(a,e){let t=Array.isArray(a)?a:[],n=Array.from({length:e},(i,r)=>typeof t[r]=="string"?t[r].trim():"");return n.some(Boolean)?n:[]}var rl=["card","items","none","open"],Pt=a=>typeof a?.name=="string"?a.name.trim():"",at=a=>typeof a=="string"?{entity:a}:{...a},it=a=>Math.min(Math.max(1,Number(a)||2),3),Be=a=>al.includes(a)?a:"row",ae=a=>!!(a?.entity||a?.name||a?.icon||a?.tap_action);function Fi(a){if(Array.isArray(a?.rows)&&a.rows.length)return a.rows.map(n=>{let i=it(n.columns);return{columns:i,layout:Be(n.layout),align:nt(n.align),image_size:de(n.image_size),column_names:qi(n.column_names,i),items:(n.items??n.entities??[]).map(at)}});let e=(a?.items??a?.entities??[]).map(at);if(!e.length)return[];let t=it(a.columns);return[{columns:t,layout:Be(a.layout),align:nt(a.align),image_size:de(a.image_size),column_names:qi(a.column_names,t),items:e}]}function Bt(a){return rl.includes(a?.surface)?a.surface:a?.bare?"none":"card"}var ol=a=>Math.max(1,Math.ceil((a.items?.length||1)/a.columns)),sl=22;function ll(a){let e=Be(a?.layout);return e!=="beeld"?Vt[e]:de(a?.image_size)+34}function Qn(a){let e=a?.rows??[],t=Pt(a)?Fn+ze:0;if(!e.length)return Wi+t+Vt.row;let n=(Bt(a)==="card"?Wi:0)+t;for(let i of e){let r=ol(i);n+=r*ll(i)+(r-1)*ze,i.column_names?.length&&(n+=sl+ze)}return n+(e.length-1)*ze}function rt(a){for(a.bewaard??=[];a.items.length<a.columns;)a.items.push(a.bewaard.pop()??{entity:""});for(;a.items.length>a.columns;){let e=a.items.pop();ae(e)&&a.bewaard.push(e)}return a}function Zi(a){let e=Array.isArray(a.rows)&&a.rows.length?a.rows.map(n=>({columns:it(n.columns),layout:Be(n.layout),align:nt(n.align),image_size:de(n.image_size),column_names:Array.isArray(n.column_names)?[...n.column_names]:[],items:(n.items??n.entities??[]).map(at)})):(()=>{let n=(a.items??a.entities??[]).map(at);return n.length?[{columns:it(a.columns),layout:Be(a.layout),align:nt(a.align),image_size:de(a.image_size),column_names:Array.isArray(a.column_names)?[...a.column_names]:[],items:n}]:[]})(),t=[];for(let n of e){let i=[];for(let r=0;r<n.items.length;r+=n.columns)i.push(n.items.slice(r,r+n.columns));i.length||i.push([]),i.forEach((r,o)=>t.push(rt({columns:n.columns,layout:n.layout,align:n.align,image_size:n.image_size,column_names:o===0?n.column_names:[],items:r})))}return t}var Yn=a=>a.map(e=>{let t=(e.column_names??[]).slice(0,e.columns).map(n=>String(n??"").trim());return{columns:e.columns,...e.layout&&e.layout!=="row"?{layout:e.layout}:{},...e.align==="midden"?{align:"midden"}:{},...e.layout==="beeld"&&e.image_size!==Rt?{image_size:de(e.image_size)}:{},...t.some(Boolean)?{column_names:t}:{},items:e.items.filter(ae).map(n=>structuredClone(n))}}).filter(e=>e.items.length);function Jn(a,e,t){let n=new Set;for(let i of a){let r=/^r(\d+)(?:i(\d+))?$/.exec(i);if(!r)continue;let o=Number(r[1]),s=r[2]===void 0?"":`i${r[2]}`;if(t==="weg"){if(o===e)continue;n.add(o>e?`r${o-1}${s}`:i);continue}n.add(o>e?`r${o+1}${s}`:i)}return n}var Xi=[{waarde:"row",label:"Rij"},{waarde:"tile",label:"Tegel"},{waarde:"compact",label:"Compact"},{waarde:"beeld",label:"Beeld"}],dl=[{waarde:"links",label:"Links"},{waarde:"midden",label:"Midden"}],cl=a=>Xi.find(e=>e.waarde===a)?.label??"Rij",pl=`
  .dac-ed { display: flex; flex-direction: column; gap: 12px; }

  .dac-ed .beeldvak, .dac-ed .kolomvak { display: block; }

  /* ---------------------------------------------------------------- rij */
  .dac-ed .rij {
    border: 1px solid var(--divider-color); border-radius: 12px;
    background: var(--card-background-color); overflow: hidden;
  }
  .dac-ed .rij[open] { border-color: var(--primary-color); }

  .dac-ed .rij > summary {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 10px 10px 12px; cursor: pointer; list-style: none;
  }
  .dac-ed .rij > summary::-webkit-details-marker { display: none; }
  .dac-ed .rij[open] > summary { border-bottom: 1px solid var(--divider-color); }
  .dac-ed .rij > summary:hover { background: rgba(127,127,127,.06); }

  .dac-ed .pijl {
    flex: 0 0 auto; color: var(--secondary-text-color); font-size: 15px; line-height: 1;
    transition: transform 180ms ease;
  }
  .dac-ed details[open] > summary .pijl { transform: rotate(90deg); }

  .dac-ed .titel { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
  .dac-ed .titel b {
    font-size: 13px; font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-ed .titel small {
    font-size: 11.5px; color: var(--secondary-text-color);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .dac-ed .segment {
    flex: 0 0 auto; display: inline-flex; gap: 2px; padding: 3px;
    background: rgba(127,127,127,.12); border-radius: 999px;
  }
  .dac-ed .segment button {
    min-width: 28px; height: 24px; padding: 0 7px; cursor: pointer;
    border: 0; background: transparent; border-radius: 999px;
    font: inherit; font-size: 12px; color: var(--secondary-text-color);
  }
  .dac-ed .segment button[aria-pressed="true"] {
    background: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600;
  }

  /* De vorm van de rij. Staat in de rij zelf en niet in de kop: de kop is met
     het kolomaantal en de prullenbak al vol, en op een telefoon breekt hij dan. */
  .dac-ed .vormrij {
    display: flex; align-items: center; gap: 10px; padding: 2px 2px 4px 2px;
  }
  .dac-ed .vormrij > b {
    flex: 1 1 auto; min-width: 0; font-size: 12.5px; font-weight: 500;
    color: var(--secondary-text-color);
  }
  .dac-ed .vormrij .segment button { min-width: 0; padding: 0 10px; }

  .dac-ed .weg {
    flex: 0 0 auto; width: 28px; height: 28px; display: grid; place-items: center;
    cursor: pointer; border: 0; background: transparent; border-radius: 999px;
    color: var(--secondary-text-color); font-size: 16px; line-height: 1;
  }
  .dac-ed .weg:hover { background: rgba(127,127,127,.16); color: var(--error-color, #d03b3b); }
  .dac-ed .weg[hidden] { display: none; }
  /* Dupliceren is geen weggooien, dus geen rood. */
  .dac-ed .weg.dupliceer:hover { color: var(--primary-color, #198fd9); }
  .dac-ed .weg.dupliceer svg { width: 15px; height: 15px; }

  .dac-ed .rijbody { padding: 10px; display: flex; flex-direction: column; gap: 8px; }

  /* --------------------------------------------------------------- item */
  .dac-ed .item {
    border: 1px solid var(--divider-color); border-radius: 10px;
    background: rgba(127,127,127,.04);
  }
  .dac-ed .item > summary {
    display: flex; align-items: center; gap: 9px;
    padding: 8px 8px 8px 10px; cursor: pointer; list-style: none;
  }
  .dac-ed .item > summary::-webkit-details-marker { display: none; }
  .dac-ed .item[open] > summary { border-bottom: 1px solid var(--divider-color); }

  /* Het kolomnummer, zodat je ziet welke plek in de rij dit blok is. */
  .dac-ed .nr {
    flex: 0 0 auto; width: 20px; height: 20px; display: grid; place-items: center;
    border-radius: 6px; font-size: 11px; font-weight: 600;
    background: rgba(127,127,127,.16); color: var(--secondary-text-color);
  }
  .dac-ed .item[data-leeg="true"] .nr { opacity: .5; }
  .dac-ed .item[data-leeg="true"] .titel b {
    font-weight: 500; font-style: italic; color: var(--secondary-text-color);
  }

  .dac-ed .itembody { padding: 10px; display: flex; flex-direction: column; gap: 10px; }

  /* ------------------------------------------------------------- knoppen */
  .dac-ed .rijtoevoegen {
    padding: 13px; cursor: pointer; font: inherit; font-size: 14px; font-weight: 500;
    border: 1px dashed var(--divider-color); border-radius: 12px;
    background: transparent; color: var(--primary-color); text-align: center;
  }
  .dac-ed .rijtoevoegen:hover { background: rgba(127,127,127,.08); }

  .dac-ed .uitleg {
    margin: 0; font-size: 12px; line-height: 1.45; color: var(--secondary-text-color);
  }
`,ea=class extends HTMLElement{constructor(){super(),this.rows_=[],this.rest_={},this.open_=new Set,this.koppen_=[]}setConfig(e){if(this.rest_={...e},delete this.rest_.rows,delete this.rest_.items,delete this.rest_.entities,delete this.rest_.columns,delete this.rest_.layout,delete this.rest_.align,delete this.rest_.image_size,delete this.rest_.column_names,this.gebouwd_&&e===this.uitObject_)return;let t=Zi(e);this.gebouwd_&&JSON.stringify(Yn(t))===this.uit_||(this.rows_=t,this.eersteKeer_||(this.eersteKeer_=!0,this.rows_.length===1&&this.open_.add("r0")),this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}connectedCallback(){this.gebouwd_||this.build_()}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}rijWeg_(e){this.open_=Jn(this.open_,e,"weg")}rijErbij_(e){this.open_=Jn(this.open_,e,"erbij")}itemWeg_(e,t){let n=new Set;for(let i of this.open_){let r=/^r(\d+)i(\d+)$/.exec(i);if(!r||Number(r[1])!==e){n.add(i);continue}let o=Number(r[2]);o!==t&&n.add(o>t?`r${e}i${o-1}`:i)}this.open_=n}legePlekkenOpen_(e,t){e.items.forEach((n,i)=>{ae(n)||this.open_.add(`r${t}i${i}`)})}async build_(){if(!this.hass_||!this.rows_)return;await customElements.whenDefined("ha-form"),this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=pl;let t=document.createElement("div");if(t.className="dac-ed",this.append(e,t),t.appendChild(this.kaartBlok_()),this.rows_.forEach((i,r)=>t.appendChild(this.rijBlok_(i,r))),!this.rows_.length){let i=document.createElement("p");i.className="uitleg",i.textContent="Een rij is een regel op de kaart, met een, twee of drie entiteiten naast elkaar. Elke rij heeft zijn eigen indeling en zijn eigen vorm. Een rij van een kolom is een losse knop.",t.appendChild(i)}let n=document.createElement("button");n.type="button",n.className="rijtoevoegen",n.textContent="\uFF0B  Rij toevoegen",n.addEventListener("click",()=>{let i=rt({columns:2,layout:"row",items:[]});this.rows_.push(i);let r=this.rows_.length-1;this.open_.add(`r${r}`),this.legePlekkenOpen_(i,r),this.emit_(),this.build_()}),t.appendChild(n)}binnenKop_(e,t){return e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),t(n)}),e}segment_(e,t,n,{inKop:i=!1}={}){let r=document.createElement("span");r.className="segment";let o=e.map(d=>{let l=document.createElement("button");l.type="button",l.textContent=d.label,d.titel&&(l.title=d.titel);let c=()=>{t()!==d.waarde&&n(d.waarde)};return i?this.binnenKop_(l,c):l.addEventListener("click",c),r.appendChild(l),[l,d.waarde]}),s=()=>o.forEach(([d,l])=>d.setAttribute("aria-pressed",String(t()===l)));return s(),{wrap:r,vernieuw:s}}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"name",selector:{text:{}}},{name:"surface",selector:{select:{mode:"dropdown",options:[{value:"card",label:"Om de hele kaart"},{value:"open",label:"Alleen een rand, geen vulling"},{value:"none",label:"Geen vlak"}]}}},{name:"state_position",selector:{select:{mode:"dropdown",options:[{value:"below",label:"Onder de naam"},{value:"right",label:"Rechts op de regel"}]}}}],e.computeLabel=t=>({name:"Naam van de kaart (optioneel)",surface:"Waar het kaartvlak zit",state_position:"Waar de status staat"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="name")return"Een kop boven de entiteiten. Laat leeg voor geen kop -- de kaart is dan een rasterrij lager.";if(t.name==="surface")return"Alleen een rand geeft een doorzichtige kaart die nog wel een vorm heeft; geen vlak laat de plekken los op het dashboard staan.";if(t.name==="state_position")return"Rechts is de vorm van de entiteitenkaart van Home Assistant: de waarden komen onder elkaar uit. Regels met een schakelaar of een tijdveld tonen geen tekst, en op een tegel staat de status altijd onder de naam."},e.data={name:this.rest_.name??"",surface:this.rest_.surface??(this.rest_.bare?"none":"card"),state_position:this.rest_.state_position??"below"},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{};typeof n.name=="string"&&n.name.trim()?this.rest_.name=n.name:delete this.rest_.name,n.surface==="items"||n.surface==="none"||n.surface==="open"?this.rest_.surface=n.surface:delete this.rest_.surface,delete this.rest_.bare,n.state_position==="right"?this.rest_.state_position="right":delete this.rest_.state_position,this.emit_()}),e}rijBlok_(e,t){let n=document.createElement("details");n.className="rij",this.onthoud_(n,`r${t}`);let i=document.createElement("summary"),r=document.createElement("span");r.className="pijl",r.textContent="\u203A";let o=document.createElement("span");o.className="titel";let s=document.createElement("b");s.textContent=`Rij ${t+1}`;let d=document.createElement("small");o.append(s,d);let l=this.segment_([1,2,3].map($=>({waarde:$,label:String($),titel:`${$} entiteit${$>1?"en":""} in deze rij`})),()=>e.columns,$=>{e.columns=$,rt(e),this.open_.add(`r${t}`),this.legePlekkenOpen_(e,t),this.emit_(),this.build_()},{inKop:!0}),c=document.createElement("button");c.type="button",c.className="weg dupliceer",c.title="Rij dupliceren",c.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M6.5 15H5.6A1.6 1.6 0 0 1 4 13.4V5.6A1.6 1.6 0 0 1 5.6 4h7.8A1.6 1.6 0 0 1 15 5.6v.9"/></svg>',this.binnenKop_(c,()=>{this.rows_.splice(t+1,0,structuredClone(this.rows_[t])),this.rijErbij_(t),this.open_.add(`r${t+1}`),this.emit_(),this.build_()});let p=document.createElement("button");p.type="button",p.className="weg",p.title="Rij verwijderen",p.textContent="\u2715",this.binnenKop_(p,()=>{this.rows_.splice(t,1),this.rijWeg_(t),this.emit_(),this.build_()}),i.append(r,o,l.wrap,c,p);let h=document.createElement("div");h.className="rijbody";let g=this.segment_(Xi.map($=>({waarde:$.waarde,label:$.label})),()=>e.layout,$=>{e.layout=$,ve(),this.emit_()}),m=document.createElement("div");m.className="vormrij";let b=document.createElement("b");b.textContent="Vorm van deze rij",m.append(b,g.wrap),h.appendChild(m);let v=this.segment_(dl.map($=>({waarde:$.waarde,label:$.label})),()=>e.align??"links",$=>{e.align=$,this.emit_()}),y=document.createElement("div");y.className="vormrij";let x=document.createElement("b");x.textContent="Uitlijning",y.append(x,v.wrap),h.appendChild(y);let M=document.createElement("div");M.className="beeldvak";let K=document.createElement("ha-form");K.hass=this.hass_,K.schema=[{name:"image_size",selector:{number:{min:Zn,max:Xn,step:4,mode:"slider"}}}],K.computeLabel=()=>"Grootte van de afbeelding",K.computeHelper=()=>"In pixels. Groot genoeg om een QR-code te scannen begint rond de 160.",K.data={image_size:de(e.image_size)},K.addEventListener("value-changed",$=>{$.stopPropagation(),e.image_size=de($.detail.value?.image_size),this.emit_()}),M.appendChild(K),h.appendChild(M);let ve=()=>{let $=e.layout==="beeld";M.style.display=$?"":"none",y.style.display=$?"none":""};ve();let Ye=document.createElement("div");Ye.className="kolomvak";let oe=document.createElement("ha-form");oe.hass=this.hass_;let ui=()=>Array.from({length:e.columns},($,ne)=>({name:`k${ne}`,selector:{text:{}}}));oe.schema=ui(),oe.computeLabel=$=>`Kop boven kolom ${Number($.name.slice(1))+1}`,oe.computeHelper=$=>$.name==="k0"?"Laat leeg voor geen koppen. Handig als er twee dingen naast elkaar staan die allebei een naam verdienen.":void 0;let mi=()=>Object.fromEntries(Array.from({length:e.columns},($,ne)=>[`k${ne}`,e.column_names?.[ne]??""]));oe.data=mi(),oe.addEventListener("value-changed",$=>{$.stopPropagation();let ne=$.detail.value??{};e.column_names=Array.from({length:e.columns},(fi,vs)=>ne[`k${vs}`]??""),this.emit_()}),Ye.appendChild(oe),h.appendChild(Ye);let gi=()=>{let $=e.items.filter(ae),ne=[`${e.columns} kolom${e.columns>1?"men":""}`];e.layout!=="row"&&ne.push(cl(e.layout)),ne.push($.length?$.map(fi=>this.itemNaam_(fi)).join(", "):"nog leeg"),e.column_names?.some?.(Boolean)&&ne.push("met kolomkoppen"),d.textContent=ne.join(" \xB7 "),l.vernieuw(),g.vernieuw(),v.vernieuw(),ve(),oe.schema.length!==e.columns&&(oe.schema=ui()),oe.data=mi()};return this.koppen_.push(gi),e.items.forEach(($,ne)=>h.appendChild(this.itemBlok_(e,$,t,ne))),n.append(i,h),gi(),n}itemNaam_(e){return e.name||this.hass_?.states?.[e.entity]?.attributes?.friendly_name||e.entity||"Knop"}itemBlok_(e,t,n,i){let r=document.createElement("details");r.className="item",this.onthoud_(r,`r${n}i${i}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="pijl",s.textContent="\u203A";let d=document.createElement("span");d.className="nr",d.textContent=String(i+1),d.title=`Plek ${i+1} in de rij`;let l=document.createElement("span");l.className="titel";let c=document.createElement("b"),p=document.createElement("small");l.append(c,p);let h=document.createElement("button");h.type="button",h.className="weg",h.title="Deze plek leegmaken",h.textContent="\u2715",this.binnenKop_(h,()=>{e.items.splice(i,1),this.itemWeg_(n,i),rt(e),this.emit_(),this.build_()}),o.append(s,d,l,h);let g=document.createElement("div");g.className="itembody";let m=document.createElement("ha-form");m.hass=this.hass_,m.schema=[{name:"entity",selector:{entity:{}}}],m.computeLabel=()=>"Entiteit",m.computeHelper=()=>"Mag leeg blijven: zonder entiteit wordt dit een navigatieknop. Geef hem dan een naam, een icoon en een tikactie.",m.addEventListener("value-changed",x=>{x.stopPropagation(),t.entity=x.detail.value.entity??"",this.emit_()});let b=document.createElement("dac-icon-picker");b.label="Icoon",b.hass=this.hass_,b.addEventListener("value-changed",x=>{x.stopPropagation(),x.detail.value?t.icon=x.detail.value:delete t.icon,this.emit_()});let v=document.createElement("ha-form");v.hass=this.hass_,v.schema=[{name:"name",selector:{text:{}}},{name:"toggle",selector:{boolean:{}}},{name:"show_icon",selector:{boolean:{}}},{name:"show_name",selector:{boolean:{}}},{name:"show_state",selector:{boolean:{}}},{name:"icon_tap_action",selector:{ui_action:{default_action:"toggle"}}},{name:"icon_hold_action",selector:{ui_action:{default_action:"more-info"}}},{name:"tap_action",selector:{ui_action:{default_action:"more-info"}}},{name:"hold_action",selector:{ui_action:{default_action:"more-info"}}},{name:"double_tap_action",selector:{ui_action:{default_action:"none"}}}],v.computeLabel=x=>({name:"Naam (overschrijft die van de entiteit)",toggle:"Schakelaar tonen",show_icon:"Icoon tonen",show_name:"Naam tonen",show_state:"Status tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de regel",hold_action:"Vasthouden op de regel",double_tap_action:"Dubbeltikken op de regel"})[x.name]??x.name,v.computeHelper=x=>{if(x.name==="icon_tap_action")return"Het icoon en de regel zijn twee knoppen: het icoon schakelt, de regel opent of navigeert.";if(x.name==="toggle")return"Een schuifschakelaar in plaats van de statustekst. Alleen voor wat twee standen heeft: een lamp, een stopcontact, een schakelaar.";if(x.name==="show_state")return"Een tijd of datum -- een input_datetime, of een klok van een apparaat -- verschijnt hier als een veld dat je meteen kunt zetten. Uit haalt met de tekst ook dat veld weg.";if(x.name==="double_tap_action")return"Laat dit op geen actie staan als je het niet gebruikt: een regel die op dubbeltikken wacht, reageert trager op een gewone tik."},v.addEventListener("value-changed",x=>{x.stopPropagation();let M=x.detail.value;M.name?t.name=M.name:delete t.name,M.toggle===!0?t.toggle=!0:delete t.toggle;for(let K of["show_icon","show_name","show_state"])M[K]===!1?t[K]=!1:delete t[K];for(let K of["icon_tap_action","icon_hold_action","tap_action","hold_action"])M[K]?t[K]=M[K]:delete t[K];M.double_tap_action&&M.double_tap_action.action!=="none"?t.double_tap_action=M.double_tap_action:delete t.double_tap_action,this.emit_()});let y=()=>{c.textContent=ae(t)?this.itemNaam_(t):"Kies een entiteit",p.textContent=t.entity||(ae(t)?"Zonder entiteit: een navigatieknop":""),r.dataset.leeg=String(!ae(t)),h.hidden=!ae(t)};return this.koppen_.push(y),m.data={entity:t.entity||void 0},b.value=t.icon??"",v.data={name:t.name??"",toggle:t.toggle??!1,show_icon:t.show_icon??!0,show_name:t.show_name??!0,show_state:t.show_state??!0,icon_tap_action:t.icon_tap_action,icon_hold_action:t.icon_hold_action,tap_action:t.tap_action,hold_action:t.hold_action,double_tap_action:t.double_tap_action},g.append(m,b,v),r.append(o,g),y(),r}emit_(){let e=Yn(this.rows_),t={...this.rest_,rows:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_)n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};S("domotiapp-entities-card-editor",ea);var Kt=class extends A{validate(e){let t=Fi(e);return t.some(n=>n.items.some(ae))?{show_state:!0,state_position:"below",...e,rows:t}:{...e,[T]:"Voeg een rij toe en kies daar entiteiten in."}}watched(){return this.config.rows.flatMap(e=>e.items.map(t=>t.entity))}item_(e,t){return this.config.rows[+e]?.items[+t]}tone_(e){return e.tone?B(e.tone):this.config.tone?B(this.config.tone):he(e.entity)!=="light"?O.accent:_i(k(this.hass,e.entity))??O.lit}metSchakelaar_(e){return!!e.toggle&&wi(e.entity)}metTijd_(e){return!Vi(e.entity)||this.metSchakelaar_(e)?!1:(e.show_state??this.config.show_state)!==!1}metKeuze_(e){return!qn(e.entity)||this.metSchakelaar_(e)?!1:(e.show_state??this.config.show_state)!==!1}template(){let e=this.config;this.setAttribute("vlak",Bt(e)),this.style.containerType="inline-size";let t=Bt(e)==="items",n=e.rows.map((o,s)=>{let d=e.state_position==="right"&&o.layout!=="tile",l=`<span class="st${d?" rechts":""}"></span>`,c=o.items.map((h,g)=>`
          <div class="it${t?" surface":""}" role="button" tabindex="0"
               data-r="${s}" data-i="${g}">
            ${o.layout==="tile"?'<span class="wash"></span>':""}
            ${h.show_icon===!1?"":'<span class="chip" role="button" tabindex="0"></span>'}
            <span class="txt">${h.show_name===!1?"":'<span class="nm"></span>'}${d?"":l}</span>
            ${d?l:""}
            ${this.metSchakelaar_(h)?Di({label:"Aan of uit"}):""}
            ${this.metTijd_(h)?'<span class="tijdslot" style="display:contents"></span>':""}
            ${this.metKeuze_(h)?'<span class="keuzeslot" style="display:contents"></span>':""}
          </div>`).join("");return`${o.column_names.length?`<div class="kolomkoppen" data-vorm="${o.layout}" data-uit="${o.align}"
              style="--cols:${o.columns}">${o.column_names.map(h=>`<span>${U(h)}</span>`).join("")}</div>`:""}
      <div class="row" data-vorm="${o.layout}" data-uit="${o.align}"
           style="--cols:${o.columns};--it-h:${o.layout==="beeld"?o.image_size+34:Vt[o.layout]}px;--beeld:${o.image_size}px">${c}</div>`}).join("");return`<div class="card surface">${Pt(e)?'<h3 class="kaartnaam"></h3>':""}${n}</div>`}wire(){this.$$(".it").forEach(e=>{let t=this.item_(e.dataset.r,e.dataset.i);if(!t)return;let n=(s,d)=>ue(this,this.hass,t,t[s]??d),i={action:t.entity?"more-info":"none"};this.teardown_.push(R(e,{onTap:()=>n("tap_action",i),onHold:()=>n("hold_action",i),onDouble:t.double_tap_action?()=>n("double_tap_action",{action:"none"}):void 0}));let r=e.querySelector(".chip");if(r&&(this.teardown_.push(R(r,{onTap:()=>n("icon_tap_action",Je(t.entity)),onHold:()=>n("icon_hold_action",i)})),this.on(r,"click",s=>s.stopPropagation()),this.on(r,"pointerdown",s=>s.stopPropagation())),e.querySelector(".tijdslot")){let s=p=>{let h=p.target?.closest?.(".tijd");if(h&&(p.stopPropagation(),p.type==="click"))try{h.showPicker?.()}catch{}};this.on(e,"pointerdown",s,!0),this.on(e,"click",s,!0);let d=null,l=null,c=()=>{clearTimeout(l),l=null;let p=d;d=null,p&&this.hass.callService(p[0],p[1],p[2])};this.teardown_.push(()=>clearTimeout(l)),this.on(e,"change",p=>{let h=p.target?.closest?.(".tijd");h&&(p.stopPropagation(),d=Bi(t.entity,h.type,h.value),clearTimeout(l),l=setTimeout(c,600))}),this.on(e,"focusout",p=>{p.target?.closest?.(".tijd")&&c()})}if(e.querySelector(".keuzeslot")){let s=d=>{d.target?.closest?.(".keuze")&&d.stopPropagation()};this.on(e,"pointerdown",s,!0),this.on(e,"click",s,!0),this.on(e,"keydown",s,!0),this.on(e,"change",d=>{let l=d.target?.closest?.(".keuze");if(!l)return;d.stopPropagation();let c=k(this.hass,t.entity),p=Ht(t.entity,l.value,Se(c));p&&this.hass.callService(p[0],p[1],p[2])})}let o=e.querySelector(".toggle");o&&this.teardown_.push(Hi(o,{value:()=>xe(k(this.hass,t.entity)),set:s=>this.hass.callService("homeassistant",s?"turn_on":"turn_off",{entity_id:t.entity}),disabled:()=>ee(k(this.hass,t.entity))}))})}paint(){let e=this.$(".kaartnaam");e&&this.text(e,Pt(this.config)),this.$$(".it").forEach(t=>{let n=this.item_(t.dataset.r,t.dataset.i);if(!n)return;let i=k(this.hass,n.entity),r=xe(i),o=!!n.entity&&ee(i);t.dataset.on=String(r),t.classList.toggle("unavailable",o);let s=this.tone_(n);t.style.setProperty("--tone",s);let d=C(this.hass,n.entity,n.name),l=t.querySelector(".chip");if(l){let x=$t(this.hass,n.entity,n.icon),M=n.icon||(x?`pic:${x}`:Mn(n.entity,F(this.hass,n.entity)));l.dataset.icon!==M&&(l.dataset.icon=M,l.classList.toggle("pic",!!x),l.innerHTML=x?`<img src="${x}" alt="" loading="lazy" />`:f(n.icon||Mn(n.entity,F(this.hass,n.entity)))),l.style.setProperty("--tone",x?"var(--dac-ink-3)":r?s:"var(--dac-ink-3)"),l.setAttribute("aria-label",n.entity?`${d} schakelen`:"Icoon")}let c=t.querySelector(".nm");c&&this.text(c,d);let p=t.querySelector(".toggle");p&&(Un(p,r),p.style.setProperty("--tone",s),p.setAttribute("aria-label",`${d} aan of uit`));let h=t.querySelector(".tijdslot"),g=null;if(h){let x=o?null:Wn(i);h.dataset.soort!==(x??"")&&(h.dataset.soort=x??"",h.innerHTML=x?`<input class="tijd" type="${x}" step="60" />`:""),g=h.querySelector(".tijd")}if(g&&(g.setAttribute("aria-label",`${d} instellen`),this.shadowRoot.activeElement!==g)){let x=Pi(i,h.dataset.soort);g.value!==x&&(g.value=x)}let m=t.querySelector(".keuzeslot"),b=null;if(m){let x=o?[]:Se(i),M=x.map(ve=>It(ve,this.hass?.formatEntityState?.(i,ve))),K=JSON.stringify([x,M]);m.dataset.opties!==K&&(m.dataset.opties=K,m.innerHTML=x.length?`<select class="keuze">${x.map((ve,Ye)=>`<option value="${U(ve)}">${U(M[Ye])}</option>`).join("")}</select>`:""),b=m.querySelector(".keuze")}if(b&&(b.setAttribute("aria-label",`${d} kiezen`),this.shadowRoot.activeElement!==b)){let x=Dt(i);b.value!==x&&(b.value=x)}let v=t.querySelector(".st"),y=n.show_state??this.config.show_state;if(p||g||b)v.textContent="";else if(y===!1)v.textContent="";else if(o)v.textContent="Niet bereikbaar";else if(!i||En(i.entity_id))v.textContent="";else if(he(i.entity_id)==="light"&&r&&i.attributes.brightness!=null)v.textContent=`${Math.round(i.attributes.brightness/255*100)}%`;else{let x=i.attributes.unit_of_measurement;v.textContent=x?`${i.state} ${x}`:Y(this.hass,i)}t.setAttribute("aria-label",`${d}${i?`, ${Y(this.hass,i)}`:""}`)})}getCardSize(){return me(Qn(this.config))}getGridOptions(){let e=me(Qn(this.config));return{columns:12,rows:e,min_columns:4,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-entities-card-editor")}static getStubConfig(){return{rows:[]}}};j(Kt,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 5px 10px;
      display: flex; flex-direction: column; justify-content: center; gap: ${ze}px;
    }
    /* Zonder eigen kaartvlak vervalt ook de binnenmarge: die hoort bij het vlak,
       en zonder vlak duwt hij de inhoud alleen maar uit het raster. */
    :host([vlak="items"]) .card, :host([vlak="none"]) .card {
      background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0;
    }
    /* En de tussenvorm: geen vulling, w\xE9l de rand. Dat is wat "achtergrond
       weglaten" op de andere kaarten in de familie doet. */
    :host([vlak="open"]) .card { background: none; box-shadow: none; }

    /* De kop van de kaart. Optioneel; zie kaartNaam() in entities-logica.js.
       Hij staat in de flexkolom boven de rijen, dus de kaart centreert kop en
       rijen samen in zijn vak in plaats van de kop los bovenaan te plakken. */
    .kaartnaam {
      flex: 0 0 auto; margin: 0; padding: 0 2px;
      font-size: 13px; font-weight: 600; letter-spacing: -.01em; line-height: ${Fn}px;
      color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .row {
      display: grid; gap: ${ze}px;
      grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
    }
    /* Een enkele rij vult de kaart. Dat is het geval van de losse knop: een
       kaart van 56px hoog hoort een knop van 56px te tonen, geen pil van 44 met
       lucht eromheen. Bij meer rijen niet, want dan zouden ze de ruimte
       verdelen en staat een tegelrij naast een gewone rij uit te rekken. */
    .card > .row:only-child { flex: 1 1 auto; }

    .it {
      position: relative; overflow: hidden; height: 100%;
      display: flex; align-items: center; gap: 10px;
      min-height: var(--it-h, 44px); padding: 2px 6px 2px 2px;
      background: none; border: 0; border-radius: var(--dac-radius-sm);
      font: inherit; color: inherit; text-align: left; cursor: pointer;
      transition: background 200ms ease, border-color 200ms ease, transform 200ms ease;
      touch-action: manipulation;
    }
    @media (hover: hover) { .it:hover { background: var(--dac-surface); } }
    /* Draagt de plek zelf het vlak, dan hoort hij ook zelf te reageren -- en
       met dezelfde ronding als elke andere kaart in de familie.

       De rand staat er expliciet bij. .surface in theme.js zet hem wel, maar
       .it hierboven zet border op 0 en staat verderop in dezelfde stylesheet;
       bij gelijke specificiteit wint de laatste. Het gevolg was een blokje met
       een achtergrond en zonder rand -- precies het verschil tussen een knop en
       een vlek. */
    .it.surface {
      border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius); padding: 2px 10px 2px 6px;
    }
    @media (hover: hover) { .it.surface:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
    .it.surface:active { transform: scale(.985); }

    .chip {
      width: 36px; height: 36px; flex: 0 0 auto; cursor: pointer;
      transition: color 200ms ease, background 200ms ease,
                  border-color 200ms ease, box-shadow 200ms ease;
    }
    .chip .icon, .chip ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }
    .it[data-on="true"] .chip {
      box-shadow: 0 0 12px -3px color-mix(in srgb, var(--tone) 55%, transparent);
    }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11px; line-height: 1.25; color: var(--dac-ink-2);
      font-variant-numeric: tabular-nums;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st:empty { display: none; }

    /* Rechts uitgelijnd: de naam neemt de ruimte, de waarde staat tegen de rand
       aan. Zo komen de waarden van een lijst onder elkaar uit in plaats van
       ergens midden in de regel te eindigen. */
    .st.rechts {
      flex: 0 0 auto; margin-left: auto; padding-left: 10px;
      max-width: 55%; text-align: right; font-size: 12px;
    }

    /* ---- tegel: icoon boven het label, voor een raster ruimtes of scenes ---- */
    .row[data-vorm="tile"] .it {
      flex-direction: column; align-items: flex-start; justify-content: space-between;
      gap: 0; padding: 14px;
    }
    .row[data-vorm="tile"] .chip { width: 40px; height: 40px; }
    .row[data-vorm="tile"] .chip .icon,
    .row[data-vorm="tile"] .chip ha-icon { width: 21px; height: 21px; --mdc-icon-size: 21px; }
    .row[data-vorm="tile"] .txt { flex: 0 0 auto; margin-top: 12px; width: 100%; }
    .row[data-vorm="tile"] .nm { font-size: 14px; }

    /* ---- kolomkoppen ----
       Namen boven de kolommen, voor een kaart die twee dingen naast elkaar
       zet die allebei een naam verdienen -- een ketel naast een warmtepomp,
       met dezelfde meetwaarden eronder. Gevraagd op 26 augustus 2026.

       Ze staan in een EIGEN raster met dezelfde kolommen en niet als eerste
       rij in het bestaande raster: anders zouden ze meetellen in de
       rijhoogte van de plekken eronder en even hoog worden als een knop. */
    .kolomkoppen {
      display: grid; gap: ${ze}px;
      grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
      padding: 0 2px;
    }
    .kolomkoppen span {
      /* Vol formaat en volle inkt. Dit is een KOP boven een kolom -- "Begane
         grond" naast "1e verdieping" -- en niet een bijschrift; op 11px in
         --dac-ink-3 las hij als iets dat je mocht overslaan. Gemeld op
         26 augustus 2026. Verander je dit formaat, verander dan KOP_H mee:
         daar hangt de rasterhoogte van de kaart aan. */
      font-size: 14px; font-weight: 600; letter-spacing: -.01em;
      color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    /* De kop staat boven zijn kolom, dus hij hoort te liggen waar de kolom
       ligt. Bij de BEELDVORM staat de afbeelding altijd in het midden van zijn
       vak -- zie hieronder -- en dan is een kop die links blijft plakken scheef
       ten opzichte van het enige dat eronder staat. Gemeld op 26 augustus 2026
       met een schermafdruk van drie QR-codes met hun naam ernaast in plaats van
       erboven. */
    .kolomkoppen[data-uit="midden"] span,
    .kolomkoppen[data-vorm="beeld"] span { text-align: center; }

    /* ---- gecentreerd ----
       Standaard staat alles links: dat is wat een lijst leesbaar maakt. Maar een
       raster van vier gelijke plekken -- of een afbeelding met een naam
       eronder -- leest beter als het midden ligt waar het oog het zoekt. */
    .row[data-uit="midden"] .it { justify-content: center; text-align: center; }
    .row[data-uit="midden"] .txt { flex: 0 0 auto; align-items: center; }
    .row[data-uit="midden"] .st.rechts { margin-left: 0; }
    .row[data-vorm="tile"][data-uit="midden"] .it { align-items: center; }
    .row[data-vorm="tile"][data-uit="midden"] .txt { text-align: center; }

    /* ---- beeld: de afbeelding is de kaart ----
       Voor alles wat je moet KUNNEN ZIEN in plaats van aflezen: een QR-code van
       je wifi, een plattegrond, een cameraplaatje. De afbeelding komt boven de
       naam en is zo groot als je hem instelt; zonder afbeelding blijft het
       icoon staan, op dezelfde maat, zodat de rij niet verspringt. */
    .row[data-vorm="beeld"] .it {
      flex-direction: column; align-items: center; justify-content: center;
      gap: 8px; padding: 10px;
    }
    .row[data-vorm="beeld"] .chip {
      width: var(--beeld, 120px); height: var(--beeld, 120px);
      border-radius: var(--dac-radius-sm);
    }
    .row[data-vorm="beeld"] .chip .icon,
    .row[data-vorm="beeld"] .chip ha-icon {
      width: 45%; height: 45%; --mdc-icon-size: 45%;
    }
    /* Een foto vult het vak helemaal -- een QR-code met een rand van 20% is
       een QR-code die je telefoon niet meer pakt. */
    .row[data-vorm="beeld"] .chip.pic { background: none; border-color: var(--dac-border); }
    .row[data-vorm="beeld"] .chip.pic img { object-fit: contain; }
    .row[data-vorm="beeld"] .txt { flex: 0 0 auto; align-items: center; text-align: center; }
    .row[data-vorm="beeld"] .nm { font-size: 13.5px; white-space: normal; }
    .row[data-vorm="beeld"] .st { white-space: normal; }

    /* ---- compact: icoon en naam, meer niet. Voor een dichte favorietenrij. ---- */
    .row[data-vorm="compact"] .it { padding: 4px 14px 4px 4px; border-radius: var(--dac-radius-pill); }
    .row[data-vorm="compact"] .chip { width: 32px; height: 32px; border-radius: var(--dac-radius-pill); }
    .row[data-vorm="compact"] .chip .icon,
    .row[data-vorm="compact"] .chip ha-icon { width: 17px; height: 17px; --mdc-icon-size: 17px; }

    ${Ii}
    .toggle { width: 42px; height: 24px; }
    .toggle .knob { width: 18px; height: 18px; }
    .toggle[aria-checked="true"] .knob { --knob: 20px; }
    /* Op een tegel is er rechts van de tekst geen ruimte, dus staat de
       schakelaar bovenin naast het icoon -- daar waar op een rij het icoon zelf
       staat, en dus waar je hand al is. */
    .row[data-vorm="tile"] .toggle { position: absolute; top: 14px; right: 14px; margin: 0; }
    .row[data-vorm="compact"] .toggle { width: 40px; height: 23px; }
    .row[data-vorm="compact"] .toggle .knob { width: 17px; height: 17px; }
    .row[data-vorm="compact"] .toggle[aria-checked="true"] .knob { --knob: 19px; }

    /* ---- een tijd of datum, te zetten waar hij staat ----

       Het is een echt invoerveld van de browser en geen nagebouwde kiezer: dan opent op een
       telefoon de klok van het toestel zelf, met de duim waar de duim hoort, en
       werkt op een toetsenbord gewoon typen. Wat we ervan afhalen is het
       kalenderknopje van de browser -- dat staat er in een eigen maat en kleur
       overheen -- en het veld opent zijn kiezer daarom zelf bij een tik.

       color-scheme: dark is geen sier: zonder dat tekent de browser de vakjes
       en het uitklappaneel licht, en die vallen buiten onze shadow root. Dat is
       hetzelfde soort val als de select in de wekkereditor (fase 12). */
    .tijd {
      flex: 0 0 auto; margin-left: auto; min-width: 0;
      font: inherit; font-size: 13px; line-height: 1.2;
      font-variant-numeric: tabular-nums;
      color: var(--dac-ink); color-scheme: dark;
      background-color: var(--dac-surface);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      padding: 5px 10px; cursor: pointer; text-align: center;
      transition: background 200ms ease, border-color 200ms ease;
    }
    @media (hover: hover) { .tijd:hover { background-color: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
    .tijd:focus-visible { outline: 2px solid var(--tone); outline-offset: 1px; }
    .tijd::-webkit-calendar-picker-indicator { display: none; }
    .tijd::-webkit-datetime-edit { padding: 0; }
    /* Datum en tijd samen is een lang veld; op een regel van 44px moet dat er
       nog naast een naam passen. */
    .tijd[type="datetime-local"] { font-size: 12px; padding: 5px 8px; }
    .row[data-vorm="tile"] .tijd { position: absolute; top: 14px; right: 14px; margin: 0; }

    /* De keuzelijst. Zelfde pil als het tijdveld, met EEN belangrijk verschil:
       de achtergrondkleur mag niet doorzichtig zijn.

       De browser tekent het uitklappaneel van een select met de achtergrond van
       de select zelf, en dat paneel valt buiten onze shadow root. Transparant
       betekent daar "val terug op wit", en met lichte tekst wordt de lijst dan
       onleesbaar. Dat is precies de fout uit fase 12, die een release lang
       onopgemerkt bleef omdat niemand de dropdown had uitgeklapt. Vandaar een
       ondoorzichtige kleur hier en op de opties, bewaakt door
       scripts/check-controls.mjs. */
    .keuze {
      flex: 0 0 auto; margin-left: auto; max-width: 55%;
      font: inherit; font-size: 13px; line-height: 1.2;
      color: var(--dac-ink); color-scheme: dark;
      background-color: var(--dac-bg-raise);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      padding: 5px 8px 5px 10px; cursor: pointer;
      text-overflow: ellipsis;
      transition: background 200ms ease, border-color 200ms ease;
    }
    @media (hover: hover) { .keuze:hover { border-color: var(--dac-border-hi); } }
    .keuze:focus-visible { outline: 2px solid var(--tone); outline-offset: 1px; }
    .keuze option { background-color: var(--dac-bg-raise); color: var(--dac-ink); }
    .keuze option:checked { background-color: var(--dac-accent); color: var(--dac-ink); }
    .row[data-vorm="tile"] .keuze {
      position: absolute; top: 12px; right: 12px; margin: 0; max-width: calc(100% - 24px);
    }

    /* Een vleug identiteitskleur op een tegel, zodat je hem van een afstand
       herkent voordat de tekst leesbaar is. Alleen op de tegelvorm: in een rij
       zou het net het oplichten worden dat er juist uit moest. */
    .wash {
      position: absolute; top: -70px; right: -60px; width: 190px; height: 190px;
      border-radius: 50%; pointer-events: none; opacity: .10;
      background: radial-gradient(circle, var(--tone) 0%, transparent 70%);
      transition: opacity 260ms ease;
    }
    .it[data-on="true"] .wash { opacity: .2; }

    .it.unavailable { opacity: .42; pointer-events: none; }

    /* Onder de 260px passen twee namen niet meer naast elkaar zonder te
       verminken, dus dan gaat elke rij terug naar een kolom. Een tegelrij niet:
       daar staat de naam onder het icoon en past hij nog prima. */
    @container (max-width: 260px) {
      .row:not([data-vorm="tile"]) { grid-template-columns: 1fr; }
    }
  `);N("domotiapp-entities-card",Kt,{name:"DomotiApp Entiteiten",description:"Entiteiten in rijen, elk met een eigen kolomindeling en vorm: regel, tegel of compacte pil. Ook voor een losse knop."});var W={PAUSE:1,SEEK:2,VOLUME_SET:4,VOLUME_MUTE:8,PREVIOUS_TRACK:16,NEXT_TRACK:32,TURN_ON:128,TURN_OFF:256,PLAY_MEDIA:512,VOLUME_STEP:1024,SELECT_SOURCE:2048,STOP:4096,PLAY:16384,SHUFFLE_SET:32768,REPEAT_SET:262144,GROUPING:524288},q=(a,e)=>!!(Number(a?.attributes?.supported_features??0)&e),Ke=a=>!a||a.state==="off",ta=a=>!!a&&!["off","unavailable","unknown"].includes(a.state),ot=a=>a?.state==="playing",Qi=a=>!!a&&!["off","unavailable","unknown","idle","standby"].includes(a.state);function Yi(a){if(!a)return[];let e=[];return(q(a,W.TURN_ON)||q(a,W.TURN_OFF))&&e.push("power"),Ke(a)||(q(a,W.PREVIOUS_TRACK)&&e.push("prev"),q(a,W.PLAY)||q(a,W.PAUSE)||q(a,W.PLAY_MEDIA)?e.push("play"):q(a,W.STOP)&&e.push("stop"),q(a,W.NEXT_TRACK)&&e.push("next")),e}var Oe=a=>a?.volume_entity||a?.entity;function na(a){if(!ta(a))return[];let e=[];return q(a,W.VOLUME_MUTE)&&e.push("mute"),q(a,W.VOLUME_SET)?e.push("slider"):q(a,W.VOLUME_STEP)&&e.push("steps"),e}var je=a=>Math.round(Math.min(1,Math.max(0,Number(a?.attributes?.volume_level??0)))*100),st=a=>!!a?.attributes?.is_volume_muted,aa=a=>!!a?.attributes?.mass_player_type,ia=a=>!!a?.attributes?.shuffle,ra=a=>{let e=a?.attributes?.repeat;return["off","all","one"].includes(e)?e:"off"},Ji=a=>({off:"all",all:"one",one:"off"})[hl(a)]??"all",hl=a=>["off","all","one"].includes(a)?a:"off";function oa(a,{zoeken:e=!0}={}){if(!ta(a))return[];let t=[];return q(a,W.SHUFFLE_SET)&&t.push("shuffle"),q(a,W.REPEAT_SET)&&t.push("repeat"),e&&aa(a)&&t.push("search"),t}function er(a,{tonen:e=!0}={}){if(!e||!ta(a)||!q(a,W.SELECT_SOURCE)||aa(a))return null;let t=a?.attributes?.source_list;return!Array.isArray(t)||t.length<2?null:{nu:a.attributes.source??null,aantal:t.length}}function Gt(a,e=t=>t?.state??""){if(!a)return"";if(a.state==="unavailable")return"Niet bereikbaar";if(a.state==="off")return"Uit";if(a.state==="standby")return"Stand-by";let t=a.attributes??{},n=t.media_title||t.media_channel||"",i=t.media_artist||t.media_series_title||t.media_album_name||t.app_name||t.source||"";return a.state==="idle"||!n?i||e(a):i&&i!==n?`${n} \xB7 ${i}`:n}function lt(a){let e=a?.attributes?.device_class;return e==="tv"?"tv":e==="receiver"?"radio":"speaker"}var ul="domotiapp-media-speler:";function sa(a,e){let t=s=>e?.states?.[s]?.attributes?.friendly_name??s,n=s=>!!e?.states?.[s],i=()=>Object.keys(e?.states??{}).filter(s=>s.startsWith("media_player."));return(Array.isArray(a?.players)&&a.players.length?[...new Set([...n(a?.entity)?[a.entity]:[],...a.players.filter(n)])]:ml(i(),e)).sort((s,d)=>String(t(s)).localeCompare(String(t(d)),"nl"))}function ml(a,e){let t=a.filter(n=>aa(e?.states?.[n]));return t.length?t:a}var tr=a=>ul+(a??[]).join("|");function nr(a,e,t){if(!a?.speaker_select)return a?.entity??"";let n=null;try{n=t?.getItem?.(tr(e))??null}catch{n=null}return n&&e?.includes(n)?n:a.entity&&e?.includes(a.entity)?a.entity:a.entity||e?.[0]||""}function ar(a,e,t){try{return a?.setItem?.(tr(e),String(t)),!0}catch{return!1}}var la="dacScrollSlot",ir=["position","top","left","right","width","overflow"];function rr(a=globalThis.document,e=globalThis.window){let t=a?.body;if(!t?.style||t.dataset?.[la])return()=>{};let n=e?.scrollY??a.documentElement?.scrollTop??0,i=Object.fromEntries(ir.map(o=>[o,t.style[o]]));t.dataset&&(t.dataset[la]="1"),t.style.position="fixed",t.style.top=`-${n}px`,t.style.left="0",t.style.right="0",t.style.width="100%",t.style.overflow="hidden";let r=!1;return()=>{if(!r){r=!0;for(let o of ir)t.style[o]=i[o];t.dataset&&delete t.dataset[la],e?.scrollTo?.(0,n)}}}var gl=[400,1e3,2e3,4e3,8e3,15e3,3e4],fl=6e4;function Ne(a){let e=a?.code;return e==="unknown_command"?!0:e==="not_allowed"&&/niet geladen/i.test(String(a?.message??""))}var ge=class{constructor(e,{wachttijden:t=gl,traag:n=fl,klok:i,stopKlok:r}={}){this.doe_=e,this.wachttijden_=t,this.traag_=n,this.klok_=i??((o,s)=>setTimeout(o,s)),this.stopKlok_=r??(o=>clearTimeout(o)),this.poging=0,this.timer_=null}get magNog(){return this.poging<this.wachttijden_.length}plan(){let e=this.magNog;if(this.timer_)return e;let t=e?this.wachttijden_[this.poging]:this.traag_;return this.poging+=1,this.timer_=this.klok_(()=>{this.timer_=null,this.doe_()},t),e}herstel(){this.stop(),this.poging=0}stop(){this.timer_!==null&&(this.stopKlok_(this.timer_),this.timer_=null)}},Ge=class{constructor(){this.was_=!0}herverbonden(e){let t=e?.connected!==!1,n=t&&!this.was_;return this.was_=t,n}};var or=[["playlists","Afspeellijsten"],["radio","Radio"],["tracks","Nummers"],["albums","Albums"],["artists","Artiesten"]];var Ee=a=>`domotiapp_lovelace/media/${a}`;function bl(a,e){if(!a)return null;if(e)return a.uri?{type:Ee("favorite"),favorite:!0,uri:a.uri}:null;let t=sr(a);return!t||!a.library_item_id?null:{type:Ee("favorite"),favorite:!1,kind:t,library_item_id:String(a.library_item_id)}}function sr(a){let e=a?.media_type;return{track:"tracks",album:"albums",artist:"artists",playlist:"playlists",radio:"radio",podcast:"podcasts",audiobook:"audiobooks"}[e]??null}var lr={tracks:"track",albums:"album",artists:"artist",playlists:"playlist",radio:"radio",podcasts:"podcast",audiobooks:"audiobook"},da=[["","Alles"],["track","Nummers"],["album","Albums"],["artist","Artiesten"],["playlist","Afspeellijsten"],["radio","Radio"]];function dr(a,e,t=null){return a?.kind??sr(e)??t??"playlists"}var ca=a=>!!a?.uri,Ut=(a,e,{favoriet:t=!1,zoek:n="",limiet:i=50}={})=>a.callWS({type:Ee("library"),kind:e,favorite:t,...n?{search:n}:{},limit:i}).then(r=>r?.items??[]),cr=(a,e,t)=>{let n=bl(e,t);return n?a.callWS(n):Promise.reject(new Error("Dit item kan niet favoriet gemaakt worden."))},pr=(a,e)=>a.callWS({type:Ee("playlist/create"),name:e}).then(t=>t?.playlist??null),hr=(a,e)=>a.callWS({type:Ee("playlist/remove"),library_item_id:String(e.library_item_id)}),ur=(a,e)=>a.callWS({type:Ee("playlist/tracks"),library_item_id:String(e.library_item_id),provider:e.provider??"library"}).then(t=>t?.tracks??[]),mr=(a,e,t)=>a.callWS({type:Ee("playlist/add_tracks"),library_item_id:String(e.library_item_id),uris:t}),gr=(a,e,t)=>a.callWS({type:Ee("playlist/remove_tracks"),library_item_id:String(e.library_item_id),positions:t});var vl=350,kl={track:"Nummer",album:"Album",artist:"Artiest",playlist:"Afspeellijst",radio:"Radio",podcast:"Podcast",audiobook:"Luisterboek"};function xl(a){let e=Array.isArray(a.artists)?a.artists.map(i=>typeof i=="string"?i:i?.name).filter(Boolean).join(", "):"",t=typeof a.album=="string"?a.album:a.album?.name,n=kl[a.media_type]??"";return[e,t].filter(Boolean).join(" \xB7 ")||n}var _l=`
  :host {
    ${X}
    position: fixed; inset: 0; z-index: 9999;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }

  .laag {
    position: absolute; inset: 0;
    background: color-mix(in srgb, var(--dac-bg) 92%, transparent);
    backdrop-filter: blur(14px);
    display: flex; flex-direction: column;
    animation: op 180ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }

  /* ---------------------------------------------------------------- kop */
  header {
    flex: 0 0 auto; display: flex; align-items: center; gap: 12px;
    padding: max(14px, env(safe-area-inset-top)) 16px 12px;
    border-bottom: 1px solid var(--dac-border);
  }
  header .wie { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
  header .wie b { font-size: 15px; font-weight: 600; }
  header .wie span { font-size: 12px; color: var(--dac-ink-2); }

  .rond {
    flex: 0 0 auto; width: 38px; height: 38px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    color: var(--dac-ink-2); font: inherit;
  }
  @media (hover: hover) { .rond:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .rond .icon { width: 18px; height: 18px; }

  /* ------------------------------------------------------------ zoeken */
  /* De zoekbalk is breed en heeft het woord "zoeken" erin -- op een tablet zie
     je anders een leeg vak en weet je niet of er iets gebeurt. */
  .zoek {
    flex: 0 0 auto; padding: 14px 16px 8px; display: flex; gap: 10px; align-items: center;
    flex-wrap: wrap;
  }
  .zoek .veld {
    flex: 1 1 auto; display: flex; align-items: center; gap: 12px;
    padding: 0 18px; height: 56px; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .zoek .veld .icon { width: 20px; height: 20px; }
  .zoekknop {
    flex: 0 0 auto; height: 56px; padding: 0 26px; cursor: pointer;
    font: inherit; font-size: 15px; font-weight: 600;
    border-radius: var(--dac-radius-pill); color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 18%, transparent);
    border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
    transition: background 160ms ease;
  }
  @media (hover: hover) { .zoekknop:hover { background: color-mix(in srgb, var(--dac-accent-hi) 28%, transparent); } }
  .zoek .veld:focus-within { border-color: var(--dac-accent-hi); }
  .zoek .veld .icon { width: 18px; height: 18px; color: var(--dac-ink-3); flex: 0 0 auto; }
  .zoek input {
    flex: 1 1 auto; min-width: 0; height: 100%;
    background: none; border: 0; outline: none;
    font: inherit; font-size: 16px; color: var(--dac-ink);
  }
  .zoek input::placeholder { color: var(--dac-ink-3); }

  /* ------------------------------------------------------------ tabbladen */
  /* Drie plekken: zoeken, je favorieten, je afspeellijsten. Ze staan bovenaan
     en niet in een menu, want dit is de indeling van het scherm -- niet een
     instelling die je een keer kiest. */
  .tabs {
    flex: 0 0 auto; display: flex; gap: 6px; padding: 10px 16px 0;
  }
  .tabs button {
    flex: 1 1 0; padding: 12px 10px; cursor: pointer; font: inherit; font-size: 14px;
    font-weight: 600; color: var(--dac-ink-2); background: none;
    border: 0; border-bottom: 2px solid transparent;
    transition: color 160ms ease, border-color 160ms ease;
  }
  @media (hover: hover) { .tabs button:hover { color: var(--dac-ink); } }
  .tabs button[aria-selected="true"] {
    color: var(--dac-ink); border-bottom-color: var(--dac-accent-hi);
  }

  .soorten {
    flex: 0 0 auto; display: flex; gap: 8px; padding: 6px 16px 10px;
    overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none;
  }
  .soorten::-webkit-scrollbar { display: none; }
  .soorten button {
    flex: 0 0 auto; padding: 7px 14px; cursor: pointer; font: inherit; font-size: 12.5px;
    border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border); color: var(--dac-ink-2);
  }
  .soorten button[aria-pressed="true"] {
    background: color-mix(in srgb, var(--dac-accent-hi) 18%, transparent);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 45%, transparent);
    color: var(--dac-ink); font-weight: 600;
  }

  /* -------------------------------------------------------- resultaten */
  .lijst {
    /* overscroll-behavior: contain houdt het scrollen HIER. Zonder dat
       scrolde de pagina achter het scherm mee zodra je onderaan de lijst was --
       je scrolt dan in twee dingen tegelijk. */
    flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain;
    padding: 4px 16px 20px;
    display: grid; gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    align-content: start;
  }

  /* De regel is een wikkel: de knop links, het hartje of het kruisje rechts.
     Een knop in een knop bestaat niet in HTML, dus staan ze naast elkaar.
     min-width 0 op de wikkel \xE9n op de knop: zonder de eerste rekt een lange
     naam de rasterkolom op, zonder de tweede loopt hij door de rand heen. */
  .rij { position: relative; display: flex; align-items: center; min-width: 0; }
  .rij .tr { flex: 1 1 auto; min-width: 0; }
  /* Het hartje ligt OP de tegel en niet ernaast: naast de tegel valt hij buiten
     het vlak en lijkt hij bij niets te horen. De tekst maakt ruimte met een
     rechtermarge, zodat een lange naam er niet onder verdwijnt. */
  .rij[data-knoppen="1"] .tr .tekst { padding-right: 42px; }
  .rij[data-knoppen="2"] .tr .tekst { padding-right: 84px; }
  /* De knoppen aan de rechterkant van een regel, op de tegel en niet ernaast. */
  .rij .knoppen {
    position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
    display: flex; align-items: center; gap: 2px;
  }
  .rij .hart, .rij .weg, .rij .meer { position: static; transform: none; }

  /* De drie puntjes: dezelfde maat als het hartje, en ze openen hetzelfde menu
     als vasthouden. Vasthouden blijft werken, maar het is een verborgen
     handeling -- wie hem niet kent, kon niets aan een afspeellijst toevoegen. */
  .meer {
    flex: 0 0 auto; width: 42px; height: 42px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: none; border: 0; color: var(--dac-ink-3);
    transition: color 160ms ease, background 160ms ease;
  }
  @media (hover: hover) { .meer:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .meer .icon { width: 20px; height: 20px; }

  /* Een hidden-attribuut verliest het van een display in een regel
     hierboven. Dat is geen detail: zonder deze regel bleef de zoekbalk op het
     favorietenblad staan, en stond de terugknop van een afspeellijst er terwijl
     er geen lijst open was. Gemeten, niet bedacht. */
  .zoek[hidden], .soorten[hidden], .lijstkop[hidden], .tabs[hidden] { display: none; }

  .tr {
    display: flex; align-items: center; gap: 12px; padding: 8px;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius-sm);
    cursor: pointer; text-align: left; font: inherit; color: inherit;
    transition: background 160ms ease, border-color 160ms ease;
  }
  @media (hover: hover) { .tr:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .tr:active { transform: scale(.99); }
  .tr .hoes {
    flex: 0 0 auto; width: 52px; height: 52px; border-radius: 9px; overflow: hidden;
    display: grid; place-items: center;
    background: rgba(255,255,255,.05); border: 1px solid var(--dac-border);
    color: var(--dac-ink-3);
  }
  .tr .hoes img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .tr .hoes .icon { width: 20px; height: 20px; }
  .tr .tekst { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .tr .nm {
    font-size: 13.5px; font-weight: 500; line-height: 1.25;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .tr .ond {
    font-size: 11.5px; color: var(--dac-ink-2); line-height: 1.25;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .tr .soort {
    align-self: flex-start; margin-top: 2px; padding: 1px 7px; border-radius: var(--dac-radius-pill);
    font-size: 10px; letter-spacing: .04em; text-transform: none;
    background: rgba(255,255,255,.06); color: var(--dac-ink-3);
  }

  /* ------------------------------------------------------------ meldingen */
  .melding {
    grid-column: 1 / -1; margin: 30px auto; max-width: 460px; text-align: center;
    color: var(--dac-ink-2); font-size: 13.5px; line-height: 1.5;
  }
  .melding b { display: block; color: var(--dac-ink); font-size: 15px; margin-bottom: 6px; }
  .melding.fout b { color: var(--dac-bad); }

  /* -------------------------------------------------------------- speakers */
  /* De kop van de speakerbalk is een knop: op een telefoon nam die balk het
     halve scherm in beslag, en dan blader je door je muziek in een strook van
     vier regels. Dicht toont hij wie er speelt; open de hele lijst. */
  .voetkop {
    display: flex; align-items: center; gap: 10px; width: 100%;
    padding: 12px 4px; cursor: pointer; font: inherit; text-align: left;
    background: none; border: 0; color: inherit;
  }
  .voetkop .waar {
    flex: 1 1 auto; min-width: 0; font-size: 12.5px; color: var(--dac-ink-2);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .voetkop .pijl {
    flex: 0 0 auto; display: grid; place-items: center;
    transition: transform 200ms ease;
  }
  .voetkop .pijl .icon { width: 18px; height: 18px; color: var(--dac-ink-3); }
  footer[open] .voetkop .pijl { transform: rotate(180deg); }
  footer:not([open]) .sprekers { display: none; }
  /* Ook open blijft de lijst binnen de perken: hooguit de helft van het scherm,
     en scrollen doe je erin en niet erachter. */
  footer[open] .sprekers {
    max-height: min(46vh, 340px); overflow-y: auto; overscroll-behavior: contain;
  }

  footer {
    flex: 0 0 auto; border-top: 1px solid var(--dac-border);
    padding: 10px 16px max(12px, env(safe-area-inset-bottom));
    display: flex; flex-direction: column; gap: 8px;
  }
  footer[hidden] { display: none; }
  footer .kop {
    font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase;
    color: var(--dac-ink-3);
  }
  /* Per speaker een regel: aan- of uitzetten links, en zijn eigen volume
     ernaast. Dat laatste is geen luxe -- in een groep staat de een in de keuken
     naast je en de ander twee kamers verderop. */
  .sprekers {
    display: grid; gap: 6px;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  .spreker {
    display: flex; align-items: center; gap: 10px;
    padding: 4px 10px 4px 4px; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .spreker[data-mee="true"] {
    background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 40%, transparent);
  }
  .mee {
    flex: 0 0 auto; display: flex; align-items: center; gap: 8px; min-width: 0;
    padding: 6px 10px; cursor: pointer; font: inherit; font-size: 12.5px;
    background: none; border: 0; border-radius: var(--dac-radius-pill);
    color: var(--dac-ink-2); text-align: left;
  }
  .spreker[data-mee="true"] .mee { color: var(--dac-ink); font-weight: 600; }
  .mee .icon { width: 15px; height: 15px; flex: 0 0 auto; }
  .mee span {
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;
  }
  .spreker[data-zelf="true"] .mee { cursor: default; }
  .mee[disabled] { opacity: .4; cursor: not-allowed; }

  ${ye}
  .spreker .slider { height: 28px; flex: 1 1 60px; min-width: 60px; }
  .spreker .slider .track { border-radius: 8px; }
  .spreker .pct {
    flex: 0 0 auto; min-width: 34px; text-align: right;
    font-size: 11px; color: var(--dac-ink-2); font-variant-numeric: tabular-nums;
  }
  .spreker .stil { flex: 1 1 auto; font-size: 11px; color: var(--dac-ink-3); text-align: right; }

  /* ---------------------------------------------------------------- menu */
  /* --------------------------------------------------------------- hartje */
  /* Het hartje staat rechts op de regel en is een eigen knop, net als het icoon
     op de entiteitenkaart: op de regel tikken speelt af, op het hartje tikken
     zet hem in je favorieten. Twee dingen, twee knoppen. */
  .hart, .weg {
    flex: 0 0 auto; width: 42px; height: 42px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: none; border: 0; color: var(--dac-ink-3);
    transition: color 160ms ease, background 160ms ease;
  }
  @media (hover: hover) { .hart:hover, .weg:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .hart[aria-pressed="true"] { color: var(--dac-device-1); }
  .hart .icon, .weg .icon { width: 20px; height: 20px; }

  /* ------------------------------------------------------- afspeellijsten */
  .lijstkop {
    flex: 0 0 auto; display: flex; align-items: center; gap: 10px;
    padding: 4px 16px 10px;
  }
  .lijstkop b { flex: 1 1 auto; min-width: 0; font-size: 15px; font-weight: 600;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lijstkop .terug { flex: 0 0 auto; }

  .nieuwe {
    flex: 0 0 auto; margin: 0 16px 10px; padding: 14px; cursor: pointer;
    font: inherit; font-size: 14px; font-weight: 600; text-align: center;
    border-radius: var(--dac-radius); color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 12%, transparent);
    border: 1px dashed color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
  }
  @media (hover: hover) { .nieuwe:hover { background: color-mix(in srgb, var(--dac-accent-hi) 20%, transparent); } }
  .nieuwe[hidden] { display: none; }

  /* De naamregel van een nieuwe lijst. Geen prompt(): die is op een tablet in
     kioskmodus niet te zien, en hij blokkeert alles eromheen. */
  .nieuwrij {
    flex: 0 0 auto; display: flex; gap: 10px; padding: 0 16px 10px;
  }
  .nieuwrij[hidden] { display: none; }
  .nieuwrij input {
    flex: 1 1 auto; min-width: 0; height: 52px; padding: 0 18px;
    border-radius: var(--dac-radius-pill); background: var(--dac-surface);
    border: 1px solid var(--dac-border); outline: none;
    font: inherit; font-size: 16px; color: var(--dac-ink);
  }
  .nieuwrij input:focus { border-color: var(--dac-accent-hi); }

  /* Een korte melding onderin. Niet over de lijst heen: wie iets aan een
     afspeellijst toevoegt terwijl hij aan het zoeken is, hoort zijn
     zoekresultaten te houden. */
  .toast {
    position: absolute; left: 50%; transform: translateX(-50%);
    bottom: max(90px, env(safe-area-inset-bottom));
    max-width: min(560px, 92vw); padding: 14px 22px; z-index: 3;
    border-radius: var(--dac-radius-pill); font-size: 14px; font-weight: 500;
    color: var(--dac-ink); background: var(--dac-bg-raise);
    border: 1px solid var(--dac-border-hi);
    box-shadow: 0 18px 40px -18px rgba(0,0,0,.9);
    animation: op 180ms ease;
  }
  .toast[hidden] { display: none; }
  .toast[data-fout="true"] {
    color: var(--dac-bad);
    border-color: color-mix(in srgb, var(--dac-bad) 50%, transparent);
  }

  /* ------------------------------------------------------------ telefoon */
  /* Gemeten op de telefoon van de eigenaar (390px breed): de knop "Zoeken" viel
     buiten beeld, de tabbladen stonden krap, en de speakerbalk nam het halve
     scherm. Dit blok is geen opsmuk maar de reden dat het scherm daar bruikbaar
     is. */
  @media (max-width: 560px) {
    header { padding: max(10px, env(safe-area-inset-top)) 12px 10px; }
    .tabs { padding: 6px 8px 0; gap: 2px; }
    .tabs button { padding: 12px 4px; font-size: 13px; }

    /* Het veld op de eerste regel, de knop eronder over de volle breedte. Naast
       elkaar passen ze niet: dan wordt het veld zo smal dat er twee woorden in
       staan, of valt de knop van het scherm. */
    .zoek { padding: 10px 12px 6px; gap: 8px; }
    .zoek .veld { flex: 1 1 100%; height: 50px; padding: 0 14px; }
    .zoekknop { flex: 1 1 100%; height: 46px; padding: 0; }

    .soorten { padding: 4px 12px 8px; }
    .lijst { padding: 4px 12px 16px; grid-template-columns: 1fr; }
    .nieuwe, .nieuwrij { margin-inline: 12px; padding-inline: 0; }
    .lijstkop { padding: 4px 12px 8px; }

    footer { padding: 0 12px max(8px, env(safe-area-inset-bottom)); }
    .toast { bottom: max(110px, env(safe-area-inset-bottom)); }
    /* Een menu dat halverwege het scherm begint en 60vh hoog is, past niet meer.
       Op een telefoon is bijna de hele hoogte beter dan een lijst die eronder
       doorloopt. */
    .menu { max-height: 70vh; min-width: 180px; }
  }

  .menu {
    position: fixed; z-index: 2; min-width: 190px; padding: 6px;
    background: var(--dac-bg-raise); border: 1px solid var(--dac-border-hi);
    border-radius: var(--dac-radius-sm); box-shadow: 0 24px 48px -20px rgba(0,0,0,.9);
    display: flex; flex-direction: column;
    /* Scrollen, en dat is geen luxe: "Aan welke lijst?" toont alle bewerkbare
       afspeellijsten, en dat zijn er bij de eigenaar twintig. Zonder dit liep
       het menu onder de onderkant van het scherm door en was de lijst die je
       net had gemaakt onbereikbaar -- alfabetisch stond hij achteraan. */
    max-height: min(60vh, 420px); overflow-y: auto; overscroll-behavior: contain;
  }
  .menu[hidden] { display: none; }
  .menu button {
    padding: 10px 12px; cursor: pointer; font: inherit; font-size: 13px; text-align: left;
    background: none; border: 0; border-radius: 8px; color: var(--dac-ink);
  }
  @media (hover: hover) { .menu button:hover { background: var(--dac-surface-hi); } }
  .menu .titel {
    padding: 6px 12px 8px; font-size: 11.5px; color: var(--dac-ink-3);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px;
  }
`,pa=class extends HTMLElement{static get sheet_(){return Object.hasOwn(this,"s_")||(this.s_=J(ke+_l)),this.s_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[new.target.sheet_],this.soort_="",this.treffers_=[],this.speakers_=null,this.opruimen_=[],this.zoekHerkansing_=new ge(()=>this.zoek_()),this.speakerHerkansing_=new ge(()=>this.haalSpeakers_())}open(e,t,n,{radioModus:i=!1,speakers:r=null}={}){this.hass=e,this.entity_=t,this.naam_=n,this.radioModus_=i,this.speakerKeuze_=Array.isArray(r)&&r.length?r:null,this.gebouwd_||this.bouw_(),this.setAttribute("open",""),this.escape_??=o=>{o.key==="Escape"&&this.hasAttribute("open")&&this.sluit()},document.addEventListener("keydown",this.escape_,!0),this.scrollLos_??=rr(),this.$(".wie b").textContent=n,this.$(".wie span").textContent="Music Assistant",this.sprekerSig_=null,this.$("footer")?.removeAttribute("open"),this.$(".voetkop")?.setAttribute("aria-expanded","false"),this.lijst_=null,this.soort_="",this.naarTab_("zoeken"),this.haalSpeakers_(),setTimeout(()=>this.$(".zoek input")?.focus(),60)}sluit(){this.removeAttribute("open"),this.menuDicht_(),this.escape_&&document.removeEventListener("keydown",this.escape_,!0),this.scrollLos_?.(),this.scrollLos_=null}set hass(e){this.hass_=e,this.gebouwd_&&this.hasAttribute("open")&&this.tekenSpeakers_()}get hass(){return this.hass_}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.gebouwd_=!0,this.shadowRoot.innerHTML=`
      <div class="laag">
        <header>
          <span class="wie"><b></b><span></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${f("close")}</button>
        </header>
        <nav class="tabs" role="tablist">
          <button type="button" role="tab" data-tab="zoeken" aria-selected="true">Zoeken</button>
          <button type="button" role="tab" data-tab="favorieten" aria-selected="false">Favorieten</button>
          <button type="button" role="tab" data-tab="lijsten" aria-selected="false">Afspeellijsten</button>
        </nav>
        <div class="lijstkop" hidden>
          <button class="rond terug" type="button" aria-label="Terug">${f("chevronRight")}</button>
          <b></b>
          <button class="rond weglijst" type="button" aria-label="Deze afspeellijst verwijderen">${f("bin")}</button>
        </div>
        <button class="nieuwe" type="button" hidden>+  Nieuwe afspeellijst</button>
        <div class="nieuwrij" hidden>
          <input type="text" placeholder="Naam van de afspeellijst" aria-label="Naam van de nieuwe afspeellijst" />
          <button class="zoekknop" type="button" data-maak>Maken</button>
        </div>
        <div class="zoek">
          <label class="veld">
            ${f("search")}
            <input type="search" placeholder="Zoeken naar een nummer, album, artiest of afspeellijst"
                   autocomplete="off" spellcheck="false" enterkeyhint="search"
                   aria-label="Zoeken in Music Assistant" />
          </label>
          <button class="zoekknop" type="button">Zoeken</button>
        </div>
        <nav class="soorten">
          ${da.map(([t,n])=>`<button type="button" data-soort="${t}" aria-pressed="${t===""}">${n}</button>`).join("")}
        </nav>
        <div class="lijst"></div>
        <footer hidden>
          <button class="voetkop" type="button" aria-expanded="false">
            <span class="kop">Speelt af op</span>
            <span class="waar"></span>
            <span class="pijl">${f("chevronDown")}</span>
          </button>
          <div class="sprekers"></div>
        </footer>
        <div class="menu" hidden></div>
      </div>`,this.aan_(this.$(".sluit"),"click",()=>this.sluit()),this.aan_(this.$(".laag"),"pointerdown",t=>{t.target===this.$(".laag")?this.sluit():t.target.closest(".menu")||this.menuDicht_()});let e=this.$(".zoek input");this.aan_(this.$(".zoekknop"),"click",()=>{clearTimeout(this.timer_),this.zoek_(),e.focus()}),this.aan_(e,"input",()=>this.tikPauze_()),this.aan_(e,"keydown",t=>{t.key==="Enter"&&(clearTimeout(this.timer_),this.zoek_()),t.key==="Escape"&&this.sluit()}),this.lijstLuisteraars_(),this.aan_(this.$(".voetkop"),"click",()=>{let n=this.$("footer").toggleAttribute("open");this.$(".voetkop").setAttribute("aria-expanded",String(n)),this.voetOpen_=n}),this.aan_(this.$(".tabs"),"click",t=>{let n=t.target.closest("[data-tab]");n&&this.naarTab_(n.dataset.tab)}),this.aan_(this.$(".terug"),"click",()=>{this.lijst_=null,this.naarTab_("lijsten")}),this.aan_(this.$(".weglijst"),"click",()=>this.lijstWeg_()),this.aan_(this.$(".nieuwe"),"click",()=>{this.$(".nieuwrij").hidden=!1,this.$(".nieuwe").hidden=!0,this.$(".nieuwrij input").value="",this.$(".nieuwrij input").focus()}),this.aan_(this.$("[data-maak]"),"click",()=>this.lijstMaken_()),this.aan_(this.$(".nieuwrij input"),"keydown",t=>{t.key==="Enter"&&this.lijstMaken_(),t.key==="Escape"&&(this.$(".nieuwrij").hidden=!0,this.$(".nieuwe").hidden=!1)}),this.aan_(this.$(".soorten"),"click",t=>{let n=t.target.closest("[data-soort]");if(n){this.modus_==="favorieten"?this.bibSoort_=n.dataset.soort:this.soort_=n.dataset.soort;for(let i of this.shadowRoot.querySelectorAll("[data-soort]"))i.setAttribute("aria-pressed",String(i===n));clearTimeout(this.timer_),this.modus_==="favorieten"?this.haalFavorieten_():this.zoek_()}}),this.aan_(this.$(".sprekers"),"click",t=>{let n=t.target.closest("button[data-speaker]");n&&!n.disabled&&this.wisselSpeaker_(n.dataset.speaker)}),this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen: nummers, albums, artiesten, afspeellijsten en radio.")}aan_(e,t,n,i){e.addEventListener(t,n,i),this.opruimen_.push(()=>e.removeEventListener(t,n,i))}tikPauze_(){clearTimeout(this.timer_),this.timer_=setTimeout(()=>this.zoek_(),vl)}async zoek_(){let e=this.$(".zoek input");if(!e)return;let t=e.value.trim();if(!t){this.treffers_=this.zoekTreffers_=[],this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen.");return}let n=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Zoeken\u2026",t);try{let i=await this.hass.callWS({type:"domotiapp_lovelace/media/search",query:t,...this.soort_?{media_types:[this.soort_]}:{},limit:20});if(n!==this.beurt_)return;this.treffers_=this.zoekTreffers_=i?.results??[],this.zoekHerkansing_.herstel(),this.teken_()}catch(i){if(n!==this.beurt_)return;if(Ne(i)){this.zoekHerkansing_.plan(),this.leegMelding_("Home Assistant start nog op","Zodra DomotiApp klaar is met opstarten, wordt er vanzelf gezocht.");return}this.leegMelding_("Zoeken lukte niet",i?.message??"Music Assistant gaf geen antwoord.",!0)}}naarTab_(e){this.modus_=e;for(let n of this.shadowRoot.querySelectorAll("[data-tab]"))n.setAttribute("aria-selected",String(n.dataset.tab===e));let t=e==="lijsten"&&this.lijst_;if(this.$(".zoek").hidden=e!=="zoeken",this.$(".soorten").hidden=e==="lijsten",this.$(".lijstkop").hidden=!t,this.$(".nieuwe").hidden=e!=="lijsten"||!!this.lijst_,this.$(".nieuwrij").hidden=!0,e==="zoeken"){if(this.tekenSoorten_(da,this.soort_),this.treffers_=this.zoekTreffers_??[],!this.treffers_.length){this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen.");return}this.teken_();return}if(e==="favorieten"){this.haalFavorieten_();return}t?this.openLijst_(this.lijst_):this.haalLijsten_()}tekenSoorten_(e,t){this.$(".soorten").innerHTML=e.map(([n,i])=>`<button type="button" data-soort="${n}" aria-pressed="${n===t}">${i}</button>`).join("")}async haalFavorieten_(){this.bibSoort_??="playlists",this.tekenSoorten_(or,this.bibSoort_);let e=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026","Je favorieten uit Music Assistant.");try{let t=await Ut(this.hass,this.bibSoort_,{favoriet:!0});if(e!==this.beurt_)return;if(this.treffers_=t,!t.length){this.leegMelding_("Nog geen favorieten","Zoek iets op en tik op het hartje om het hier te zetten.");return}this.teken_()}catch(t){if(e!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}async favorietOm_(e,t){let n=!e.favorite;e.favorite=n,t?.setAttribute("aria-pressed",String(n));try{let i=await cr(this.hass,e,n);n&&i?.library_item_id&&(e.library_item_id=i.library_item_id,i.kind&&(e.media_type=lr[i.kind]??e.media_type)),n&&(this.bibSoort_=dr(i,e,this.bibSoort_)),this.modus_==="favorieten"&&!n&&this.haalFavorieten_()}catch(i){e.favorite=!n,t?.setAttribute("aria-pressed",String(!n)),this.leegMelding_("Dat lukte niet",i?.message??"Music Assistant gaf geen antwoord.",!0)}}async haalLijsten_(){let e=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026","Je afspeellijsten uit Music Assistant.");try{let t=await Ut(this.hass,"playlists",{});if(e!==this.beurt_)return;if(this.treffers_=t,!t.length){this.leegMelding_("Nog geen afspeellijsten","Maak er een met de knop hierboven.");return}this.teken_()}catch(t){if(e!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}async openLijst_(e){this.lijst_=e,this.modus_="lijsten",this.$(".lijstkop").hidden=!1,this.$(".lijstkop b").textContent=e.name??"Afspeellijst",this.$(".nieuwe").hidden=!0,this.$(".weglijst").hidden=!e.is_editable;let t=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026",e.name??"");try{let n=await ur(this.hass,e);if(t!==this.beurt_)return;if(this.treffers_=n,!n.length){this.leegMelding_("Deze lijst is leeg","Zoek iets op en kies 'Aan afspeellijst toevoegen'.");return}this.teken_()}catch(n){if(t!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",n?.message??"Music Assistant gaf geen antwoord.",!0)}}async lijstMaken_(){let e=this.$(".nieuwrij input").value.trim();if(e){this.$(".nieuwrij").hidden=!0;try{await pr(this.hass,e),this.lijst_=null,this.naarTab_("lijsten")}catch(t){this.leegMelding_("Maken lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}}async lijstWeg_(){let e=this.lijst_;if(!e)return;let t=this.$(".weglijst");if(t.dataset.zeker!=="ja"){t.dataset.zeker="ja",t.title="Nog een keer tikken om te verwijderen",t.style.color="var(--dac-bad)",setTimeout(()=>{t.dataset.zeker="",t.style.color=""},4e3);return}t.dataset.zeker="",t.style.color="";try{await hr(this.hass,e),this.lijst_=null,this.naarTab_("lijsten")}catch(n){this.leegMelding_("Verwijderen lukte niet",n?.message??"Music Assistant gaf geen antwoord.",!0)}}async nummerWeg_(e){let t=this.lijst_;if(!(!t||e.position==null))try{await gr(this.hass,t,[e.position]),this.melding_(`"${e.name}" uit de lijst gehaald`),await this.naVerwerking_(t)}catch(n){this.melding_(n?.message??"Verwijderen lukte niet",!0)}}async naVerwerking_(e){for(let t of[900,2500]){if(await new Promise(n=>setTimeout(n,t)),this.lijst_!==e||!this.hasAttribute("open"))return;await this.openLijst_(e)}}async kiesLijstVoor_(e){this.menuDicht_();let t=[];try{t=await Ut(this.hass,"playlists",{})}catch{t=[]}let n=t.filter(r=>r.is_editable),i=this.$(".menu");i.innerHTML='<span class="titel">Aan welke lijst?</span>'+(n.length?n.map((r,o)=>`<button type="button" data-lijst="${o}">${this.veilig_(r.name)}</button>`).join(""):'<span class="titel">Geen bewerkbare lijst. Maak er eerst een.</span>'),i.hidden=!1,this.menuPlaats_(i),i.scrollTop=0,i.onclick=async r=>{let o=r.target.closest("[data-lijst]");if(!o)return;let s=n[+o.dataset.lijst];this.menuDicht_();try{await mr(this.hass,s,[e.uri]),this.melding_(`"${e.name}" toegevoegd aan "${s.name}"`)}catch(d){this.melding_(d?.message??"Toevoegen lukte niet",!0)}}}melding_(e,t=!1){let n=this.$(".toast");n||(n=document.createElement("div"),n.className="toast",this.$(".laag").appendChild(n)),n.textContent=e,n.dataset.fout=String(t),n.hidden=!1,clearTimeout(this.toastTimer_),this.toastTimer_=setTimeout(()=>{n.hidden=!0},t?6e3:3e3)}leegMelding_(e,t,n=!1){this.$(".lijst").innerHTML=`<div class="melding${n?" fout":""}"><b>${e}</b>${t}</div>`}teken_(){let e=this.$(".lijst");if(!this.treffers_.length){this.leegMelding_("Niets gevonden","Probeer een andere naam of een ander soort.");return}let t=this.modus_==="lijsten"&&this.lijst_;e.innerHTML=this.treffers_.map((n,i)=>{let r=n.image?`<img src="${n.image}" alt="" loading="lazy" />`:f(n.media_type==="radio"?"radio":"music"),o=ca(n)&&!t?`<button class="hart" type="button" data-hart="${i}" aria-pressed="${!!n.favorite}"
                 aria-label="Favoriet">${f("star")}</button>`:"",s=t?`<button class="weg" type="button" data-weg="${i}"
               aria-label="Uit deze afspeellijst halen">${f("close")}</button>`:"",d=`<button class="meer" type="button" data-meer="${i}"
               aria-label="Meer met ${this.veilig_(n.name)}">${f("dots")}</button>`,l=(o||s?1:0)+1;return`
          <div class="rij" data-i="${i}" data-knoppen="${l}">
            <button class="tr" type="button">
              <span class="hoes">${r}</span>
              <span class="tekst">
                <span class="nm">${this.veilig_(n.name)}</span>
                <span class="ond">${this.veilig_(xl(n))}</span>
              </span>
            </button><span class="knoppen">${o}${s}${d}</span>
          </div>`}).join(""),this.trefferBinding_?.(),this.trefferBinding_=R(e,{onTap:()=>{let n=this.laatsteTreffer_;n&&(this.modus_==="lijsten"&&!this.lijst_?this.openLijst_(n):this.speel_(n,"replace",{radio:this.radioStandaard_(n)}))},onHold:()=>{let n=this.laatsteTreffer_;n&&this.menuOpen_(n)}})}lijstLuisteraars_(){let e=this.$(".lijst");this.aan_(e,"click",t=>{let n=t.target.closest("[data-hart]"),i=t.target.closest("[data-weg]"),r=t.target.closest("[data-meer]");!n&&!i&&!r||(t.stopImmediatePropagation(),t.preventDefault(),n?this.favorietOm_(this.treffers_[+n.dataset.hart],n):i?this.nummerWeg_(this.treffers_[+i.dataset.weg]):(this.menuPlek_=r.getBoundingClientRect(),this.menuOpen_(this.treffers_[+r.dataset.meer])))}),this.aan_(e,"pointerdown",t=>{t.target.closest("[data-hart], [data-weg], [data-meer]")&&t.stopImmediatePropagation()}),this.aan_(e,"pointerdown",t=>{let n=t.target.closest("[data-i]");this.laatsteTreffer_=n?this.treffers_[+n.dataset.i]:null,this.menuPlek_=n?n.getBoundingClientRect():null})}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}speel_(e,t,{radio:n=!1}={}){e?.uri&&(this.menuDicht_(),this.hass.callService("music_assistant","play_media",{media_id:e.uri,...e.media_type?{media_type:e.media_type}:{},enqueue:t,...n?{radio_mode:!0}:{}},{entity_id:this.entity_}),t==="replace"&&this.sluit())}kanRadio_(e){return["track","album","artist"].includes(e?.media_type)}radioStandaard_(e){return!!this.radioModus_&&this.kanRadio_(e)}menuOpen_(e){let t=this.$(".menu"),n=this.modus_==="lijsten"&&this.lijst_;t.innerHTML=`<span class="titel">${this.veilig_(e.name)}</span><button type="button" data-w="replace">Nu afspelen</button>`+(this.kanRadio_(e)?'<button type="button" data-radio>Afspelen en doorgaan</button>':"")+'<button type="button" data-w="next">Hierna afspelen</button><button type="button" data-w="add">Achteraan in de wachtrij</button>'+(ca(e)?`<button type="button" data-fav>${e.favorite?"Uit favorieten":"Favoriet maken"}</button>`:"")+(e.uri&&!n&&e.media_type!=="playlist"?'<button type="button" data-toe>Aan afspeellijst toevoegen</button>':""),t.hidden=!1,this.menuPlaats_(t),t.onclick=i=>{let r=i.target.closest("[data-w]");if(r)return this.speel_(e,r.dataset.w,{radio:r.dataset.w==="replace"&&this.radioStandaard_(e)});if(i.target.closest("[data-radio]"))return this.speel_(e,"replace",{radio:!0});if(i.target.closest("[data-fav]"))return this.menuDicht_(),this.favorietOm_(e,this.shadowRoot.querySelector(`[data-hart="${this.treffers_.indexOf(e)}"]`));if(i.target.closest("[data-toe]"))return this.kiesLijstVoor_(e)}}menuPlaats_(e){let t=this.menuPlek_,n=e.offsetWidth||210,i=e.offsetHeight||160,r=Math.min(Math.max(8,(t?.left??40)+12),window.innerWidth-n-8),o=(t?.bottom??80)+6,s=o+i<=window.innerHeight-8?o:Math.max(8,(t?.top??80)-i-6);e.style.left=`${r}px`,e.style.top=`${Math.min(s,Math.max(8,window.innerHeight-i-8))}px`}menuDicht_(){let e=this.$(".menu");e&&(e.hidden=!0)}async haalSpeakers_(){if(this.speakerKeuze_){this.speakers_={label_exists:!0,entities:this.speakerKeuze_.map(e=>{let t=k(this.hass,e);return t?{entity_id:e,name:t.attributes?.friendly_name??e,can_group:q(t,W.GROUPING)}:null}).filter(Boolean),filtered_out:0},this.tekenSpeakers_();return}try{this.speakers_=await this.hass.callWS({type:"domotiapp_lovelace/media/speakers"}),this.speakerHerkansing_.herstel()}catch(e){this.speakers_=null,Ne(e)&&this.speakerHerkansing_.plan()}this.tekenSpeakers_()}groepNu_(){let t=this.hass?.states?.[this.entity_]?.attributes?.group_members;return new Set(Array.isArray(t)?t:[])}tekenSpeakers_(){let e=this.$("footer");if(!e)return;let t=this.speakers_;if(!t||!t.label_exists||!t.entities?.length){e.hidden=!t||t.label_exists===void 0,e.hidden||(this.$(".sprekers").innerHTML=`<span class="ond" style="color:var(--dac-ink-2);font-size:12.5px">Plak het label <b>${this.veilig_(t?.label_name??"Music Assistant Media")}</b> op je speakers om ze hier samen te laten spelen.</span>`);return}e.hidden=!1;let n=this.groepNu_(),i=t.entities.filter(o=>o.entity_id===this.entity_||n.has(o.entity_id));this.$(".waar").textContent=i.length?i.map(o=>o.name).join(", "):this.naam_??"";let r=t.entities.map(o=>`${o.entity_id}:${o.entity_id===this.entity_||n.has(o.entity_id)}`).join("|");if(this.sprekerSig_!==r){this.sprekerSig_=r,this.schuiven_?.forEach(o=>o()),this.schuiven_=new Map,this.$(".sprekers").innerHTML=t.entities.map(o=>{let s=o.entity_id===this.entity_,d=s||n.has(o.entity_id),l=q(k(this.hass,o.entity_id),W.VOLUME_SET);return`
            <div class="spreker" data-speaker="${o.entity_id}" data-zelf="${s}" data-mee="${d}">
              <button class="mee" type="button" data-speaker="${o.entity_id}"
                      aria-pressed="${d}" ${!s&&!o.can_group?"disabled":""}
                      title="${s?"Deze speler":o.can_group?"Laat deze speaker meespelen":"Deze speaker laat zich niet koppelen"}">
                ${f(d?"volume":"speaker")}<span>${this.veilig_(o.name)}</span>
              </button>
              ${d&&l?`${se()}<span class="pct tnum"></span>`:d?'<span class="stil">geen volumeregeling</span>':""}
            </div>`}).join("");for(let o of this.shadowRoot.querySelectorAll(".spreker")){let s=o.querySelector(".slider");if(!s)continue;let d=o.dataset.speaker;s.setAttribute("aria-label",`Volume ${o.querySelector("span")?.textContent??""}`);let l=we(s,{value:()=>je(k(this.hass,d)),onInput:c=>this.zetSchuif_(s,c),onCommit:c=>this.hass.callService("media_player","volume_set",{volume_level:c/100},{entity_id:d})});this.schuiven_.set(d,l)}}for(let o of this.shadowRoot.querySelectorAll(".spreker")){let s=o.dataset.speaker,d=o.querySelector(".slider");if(!d||d.classList.contains("dragging"))continue;let l=k(this.hass,s),c=je(l);this.zetSchuif_(d,c,st(l))}}zetSchuif_(e,t,n=!1){e.style.setProperty("--v",`${t}%`),e.setAttribute("aria-valuenow",String(t));let i=e.parentElement.querySelector(".pct");i&&(i.textContent=n?"gedempt":`${t}%`)}wisselSpeaker_(e){if(e===this.entity_)return;if(this.groepNu_().has(e)){this.hass.callService("media_player","unjoin",{},{entity_id:e});return}this.hass.callService("media_player","join",{group_members:[e]},{entity_id:this.entity_});let n=k(this.hass,this.entity_);if(typeof n?.attributes?.volume_level!="number")return;let i=je(n),r=k(this.hass,e);q(r,W.VOLUME_SET)&&je(r)!==i&&this.hass.callService("media_player","volume_set",{volume_level:i/100},{entity_id:e})}disconnectedCallback(){clearTimeout(this.timer_),this.zoekHerkansing_.stop(),this.speakerHerkansing_.stop(),this.scrollLos_?.(),this.scrollLos_=null,this.schuiven_?.forEach(e=>e()),this.schuiven_=null,this.escape_&&document.removeEventListener("keydown",this.escape_,!0),this.trefferBinding_?.();for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}};S("domotiapp-media-browser",pa);function fr(a,e,t,n={}){let i=document.querySelector("domotiapp-media-browser");return i||(i=document.createElement("domotiapp-media-browser"),document.body.appendChild(i)),i.tabIndex=-1,i.open(a,e,t,n),i.focus?.(),i}var wl=`
  :host {
    ${X}
    position: fixed; inset: 0; z-index: 9999;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }

  .laag {
    position: absolute; inset: 0;
    background: color-mix(in srgb, var(--dac-bg) 92%, transparent);
    backdrop-filter: blur(14px);
    display: flex; flex-direction: column;
    animation: op 180ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }

  header {
    flex: 0 0 auto; display: flex; align-items: center; gap: 12px;
    padding: max(14px, env(safe-area-inset-top)) 16px 12px;
    border-bottom: 1px solid var(--dac-border);
  }
  header .wie { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
  header .wie b { font-size: 15px; font-weight: 600; }
  header .wie span { font-size: 12px; color: var(--dac-ink-2); }

  .rond {
    flex: 0 0 auto; width: 38px; height: 38px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    color: var(--dac-ink-2); font: inherit;
  }
  @media (hover: hover) { .rond:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .rond .icon { width: 18px; height: 18px; }

  .zoek { flex: 0 0 auto; padding: 14px 16px 8px; display: flex; gap: 10px; align-items: center; }
  .zoek .veld {
    flex: 1 1 auto; display: flex; align-items: center; gap: 12px;
    padding: 0 18px; height: 56px; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .zoek .veld:focus-within { border-color: var(--dac-accent-hi); }
  .zoek .veld .icon { width: 18px; height: 18px; color: var(--dac-ink-3); flex: 0 0 auto; }
  .zoek input {
    flex: 1 1 auto; min-width: 0; height: 100%;
    background: none; border: 0; outline: none;
    font: inherit; font-size: 16px; color: var(--dac-ink);
  }
  .zoek input::placeholder { color: var(--dac-ink-3); }

  .tel {
    flex: 0 0 auto; padding: 0 16px 8px; font-size: 12px; color: var(--dac-ink-3);
  }

  /* ------------------------------------------------------------- de lijst */
  .lijst {
    flex: 1 1 auto; min-height: 0; overflow-y: auto;
    padding: 4px 16px max(20px, env(safe-area-inset-bottom));
    display: flex; flex-direction: column; gap: 6px;
  }

  .bron {
    display: flex; align-items: center; gap: 14px;
    padding: 0 18px; min-height: 58px; cursor: pointer; text-align: left;
    border-radius: var(--dac-radius); font: inherit; color: inherit;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    transition: background 160ms ease, border-color 160ms ease;
  }
  @media (hover: hover) { .bron:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .bron b { flex: 1 1 auto; min-width: 0; font-size: 15px; font-weight: 500;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* Waar je nu naar kijkt, staat als eerste en draagt het accent. Zonder die
     markering zoek je in een lijst van 233 namen naar de zender die al aanstaat. */
  .bron[aria-current="true"] {
    background: color-mix(in srgb, var(--dac-accent-hi) 16%, transparent);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 46%, transparent);
  }
  .bron[aria-current="true"] b { font-weight: 600; }
  .bron .nu {
    flex: 0 0 auto; font-size: 11px; font-weight: 600; letter-spacing: .06em;
    color: var(--dac-accent-hi);
  }
  .bron .icon { width: 18px; height: 18px; flex: 0 0 auto; color: var(--dac-ink-3); }

  .leeg { padding: 40px 8px; text-align: center; color: var(--dac-ink-3); font-size: 14px; }
`,ha=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[J(wl+ke)],this.filter_="",this.opruimen_=[]}connectedCallback(){this.gebouwd_||this.bouw_()}disconnectedCallback(){for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}bouw_(){this.shadowRoot.innerHTML=`
      <div class="laag">
        <header>
          <span class="wie"><b class="naam"></b><span class="sub"></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${f("close")}</button>
        </header>
        <div class="zoek">
          <label class="veld">
            ${f("search")}
            <input type="search" placeholder="Zoek een zender of app" aria-label="Zoeken" />
          </label>
        </div>
        <div class="tel"></div>
        <div class="lijst" role="listbox"></div>
      </div>`,this.gebouwd_=!0;let e=(t,n,i)=>{t.addEventListener(n,i),this.opruimen_.push(()=>t.removeEventListener(n,i))};e(this.$(".sluit"),"click",()=>this.sluit()),e(this.$(".laag"),"click",t=>{t.target===this.$(".laag")&&this.sluit()}),e(this.$("input"),"input",t=>{this.filter_=t.target.value.trim().toLowerCase(),this.teken_()}),e(this.$("input"),"keydown",t=>{t.key==="Enter"&&this.$(".bron")?.click()}),e(this,"keydown",t=>{t.key==="Escape"&&this.hasAttribute("open")&&this.sluit()}),e(this.$(".lijst"),"click",t=>{let n=t.target.closest(".bron");n&&this.kies_(n.dataset.bron)})}$(e){return this.shadowRoot.querySelector(e)}open(e,t,n){this.hass=e,this.entity_=t,this.naam_=n,this.filter_="",this.gebouwd_||this.bouw_(),this.$("input").value="",this.setAttribute("open",""),this.teken_(),setTimeout(()=>this.$("input")?.focus(),60)}sluit(){this.removeAttribute("open")}bronnen_(){let e=k(this.hass,this.entity_),t=e?.attributes?.source_list??[],n=e?.attributes?.source,i=this.filter_?t.filter(r=>String(r).toLowerCase().includes(this.filter_)):[...t];return i.sort((r,o)=>r===n?-1:o===n?1:0),{lijst:i,nu:n,totaal:t.length}}teken_(){let{lijst:e,nu:t,totaal:n}=this.bronnen_();this.$(".naam").textContent=this.naam_??"Bron kiezen",this.$(".sub").textContent=t?`Nu: ${t}`:"",this.$(".tel").textContent=this.filter_?`${e.length} van ${n}`:`${n} bronnen`;let i=this.$(".lijst");if(!e.length){i.innerHTML='<div class="leeg">Niets gevonden.</div>';return}i.innerHTML=e.map(r=>{let o=String(r).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),s=r===t;return`<button class="bron" type="button" role="option" data-bron="${o}"
                  aria-current="${s}" aria-selected="${s}">
                  <b>${o}</b>${s?'<span class="nu">NU</span>':""}
                </button>`}).join("")}kies_(e){!e||!this.hass||(this.hass.callService("media_player","select_source",{entity_id:this.entity_,source:e}),this.sluit())}};S("domotiapp-bron-kiezer",ha);function br(a,e,t){let n=document.querySelector("domotiapp-bron-kiezer");return n||(n=document.createElement("domotiapp-bron-kiezer"),document.body.appendChild(n)),n.tabIndex=-1,n.open(a,e,t),n.focus?.(),n}var yl=`
  :host {
    ${X}
    position: fixed; inset: 0; z-index: 9999;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }

  .laag {
    position: absolute; inset: 0;
    background: color-mix(in srgb, var(--dac-bg) 92%, transparent);
    backdrop-filter: blur(14px);
    display: flex; flex-direction: column;
    animation: op 180ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }

  header {
    flex: 0 0 auto; display: flex; align-items: center; gap: 12px;
    padding: max(14px, env(safe-area-inset-top)) 16px 12px;
    border-bottom: 1px solid var(--dac-border);
  }
  header .wie { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
  header .wie b { font-size: 15px; font-weight: 600; }
  header .wie span { font-size: 12px; color: var(--dac-ink-2); }

  .rond {
    flex: 0 0 auto; width: 38px; height: 38px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    color: var(--dac-ink-2); font: inherit;
  }
  @media (hover: hover) { .rond:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .rond .icon { width: 18px; height: 18px; }

  .zoek { flex: 0 0 auto; padding: 14px 16px 8px; display: flex; gap: 10px; align-items: center; }
  .zoek .veld {
    flex: 1 1 auto; display: flex; align-items: center; gap: 12px;
    padding: 0 18px; height: 52px; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .zoek .veld:focus-within { border-color: var(--dac-accent-hi); }
  .zoek .veld .icon { width: 18px; height: 18px; color: var(--dac-ink-3); flex: 0 0 auto; }
  .zoek input {
    flex: 1 1 auto; min-width: 0; height: 100%;
    background: none; border: 0; outline: none;
    font: inherit; font-size: 16px; color: var(--dac-ink);
  }
  /* Bij vier speakers is een zoekveld overbodig en in de weg. */
  .zoek[hidden] { display: none; }

  .tel { flex: 0 0 auto; padding: 4px 18px 8px; font-size: 12px; color: var(--dac-ink-3); }

  .lijst {
    flex: 1 1 auto; min-height: 0; overflow-y: auto;
    padding: 0 12px max(16px, env(safe-area-inset-bottom));
    display: flex; flex-direction: column; gap: 8px;
  }

  .sp {
    display: flex; align-items: center; gap: 14px; width: 100%;
    padding: 12px 14px; cursor: pointer; text-align: left; font: inherit;
    border-radius: var(--dac-radius-sm);
    border: 1px solid var(--dac-border); background: var(--dac-surface);
    color: var(--dac-ink);
  }
  @media (hover: hover) { .sp:hover { background: var(--dac-surface-hi); } }
  .sp[aria-current="true"] { border-color: var(--dac-accent-hi); }

  .sp .ico {
    flex: 0 0 auto; width: 38px; height: 38px; display: grid; place-items: center;
    border-radius: var(--dac-radius-sm); background: var(--dac-bg-raise);
    color: var(--dac-ink-2);
  }
  .sp[data-speelt="true"] .ico { color: var(--dac-accent-hi); }
  .sp .ico .icon { width: 19px; height: 19px; }

  .sp .tekst { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
  .sp .tekst b { font-size: 14.5px; font-weight: 500;
                 white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sp .tekst span { font-size: 12px; color: var(--dac-ink-2);
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sp[data-uit="true"] .tekst span { color: var(--dac-ink-3); }

  .sp .nu {
    flex: 0 0 auto; font-size: 10px; font-weight: 700; letter-spacing: .1em;
    padding: 3px 8px; border-radius: var(--dac-radius-pill);
    background: color-mix(in srgb, var(--dac-accent) 24%, transparent);
    color: var(--dac-accent-hi);
  }

  .leeg { padding: 28px 16px; text-align: center; color: var(--dac-ink-3); font-size: 13px; }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
`,ua=null,ma=a=>String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),ga=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),ua=ua??[J(yl)],this.shadowRoot.adoptedStyleSheets=ua,this.opruimen_=[],this.filter_="",this.lijst_=[]}connectedCallback(){this.gebouwd_||this.bouw_()}disconnectedCallback(){for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}bouw_(){this.shadowRoot.innerHTML=`
      <div class="laag">
        <header>
          <span class="wie"><b class="naam">Speaker kiezen</b><span class="sub"></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${f("close")}</button>
        </header>
        <div class="zoek">
          <label class="veld">
            ${f("search")}
            <input type="search" placeholder="Zoek een speaker" aria-label="Zoeken" />
          </label>
        </div>
        <div class="tel"></div>
        <div class="lijst" role="listbox"></div>
      </div>`,this.gebouwd_=!0;let e=(t,n,i)=>{t.addEventListener(n,i),this.opruimen_.push(()=>t.removeEventListener(n,i))};e(this.$(".sluit"),"click",()=>this.sluit()),e(this.$(".laag"),"click",t=>{t.target===this.$(".laag")&&this.sluit()}),e(this.$("input"),"input",t=>{this.filter_=t.target.value.trim().toLowerCase(),this.teken_()}),e(this.$("input"),"keydown",t=>{t.key==="Enter"&&this.$(".sp")?.click()}),e(this,"keydown",t=>{t.key==="Escape"&&this.hasAttribute("open")&&this.sluit()}),e(this.$(".lijst"),"click",t=>{let n=t.target.closest(".sp");n&&this.kies_(n.dataset.id)})}$(e){return this.shadowRoot.querySelector(e)}open(e,t,n,i){this.hass=e,this.lijst_=Array.isArray(t)?t:[],this.huidig_=n,this.opKeuze_=i,this.filter_="",this.gebouwd_||this.bouw_(),this.$("input").value="",this.$(".zoek").hidden=this.lijst_.length<8,this.setAttribute("open",""),this.teken_(),this.$(".zoek").hidden||setTimeout(()=>this.$("input")?.focus(),60)}sluit(){this.removeAttribute("open")}teken_(){let e=this.lijst_,t=this.filter_?e.filter(i=>String(C(this.hass,i)).toLowerCase().includes(this.filter_)):[...e];this.$(".sub").textContent=this.huidig_?`Nu: ${C(this.hass,this.huidig_)}`:"",this.$(".tel").textContent=this.filter_?`${t.length} van ${e.length}`:`${e.length} speaker${e.length===1?"":"s"}`;let n=this.$(".lijst");if(!t.length){n.innerHTML='<div class="leeg">Niets gevonden.</div>';return}n.innerHTML=t.map(i=>{let r=k(this.hass,i),o=i===this.huidig_,s=Ke(r)?"Uit":Gt(r,d=>Y(this.hass,d));return`<button class="sp" type="button" role="option" data-id="${ma(i)}"
                  data-speelt="${ot(r)}" data-uit="${Ke(r)}"
                  aria-current="${o}" aria-selected="${o}">
                  <span class="ico">${f(lt(r),"speaker")}</span>
                  <span class="tekst">
                    <b>${ma(C(this.hass,i))}</b>
                    <span>${ma(s)}</span>
                  </span>
                  ${o?'<span class="nu">NU</span>':""}
                </button>`}).join("")}kies_(e){e&&(this.opKeuze_?.(e),this.sluit())}};S("domotiapp-speler-kiezer",ga);function vr(a,e,t,n){let i=document.querySelector("domotiapp-speler-kiezer");return i||(i=document.createElement("domotiapp-speler-kiezer"),document.body.appendChild(i)),i.tabIndex=-1,i.open(a,e,t,n),i.focus?.(),i}var Wt={power:{icon:"power",label:"Aan of uit"},prev:{icon:"prev",label:"Vorige"},play:{icon:"play",label:"Afspelen of pauzeren"},stop:{icon:"stop",label:"Stoppen"},next:{icon:"next",label:"Volgende"},shuffle:{icon:"shuffle",label:"Willekeurig afspelen"},repeat:{icon:"repeat",label:"Herhalen"},search:{icon:"search",label:"Zoeken in Music Assistant"}},qt=class extends A{setConfig(e){this.ruw_=e,super.setConfig(this.metSpeler_(e))}metSpeler_(e){if(!e?.speaker_select)return e;let t=sa(e,this.hass),n=nr(e,t,this.opslag_());return n&&n!==e.entity?{...e,entity:n}:e}set hass(e){let t=!this.hass_;if(super.hass=e,!t||!this.ruw_?.speaker_select)return;let n=this.metSpeler_(this.ruw_);n.entity&&n.entity!==this.config?.entity&&super.setConfig(n)}get hass(){return super.hass}opslag_(){try{return window.localStorage}catch{return null}}spelers_(){return sa(this.ruw_??this.config,this.hass)}groepsSpelers_(){let e=this.config.speakers;return Array.isArray(e)&&e.length||!this.config.speaker_select?e:this.spelers_()}kiesSpeler_(e){!e||e===this.config.entity||(ar(this.opslag_(),this.spelers_(),e),super.setConfig({...this.ruw_,entity:e}))}validate(e){return e.entity?{layout:"row",show_artwork:!0,show_volume:!0,show_source:!0,show_controls:!0,show_search:!0,...e}:{...e,[T]:e.speaker_select?"Zet er een mediaspeler in, of wacht tot Home Assistant er een meldt.":"Kies een mediaspeler."}}watched(){return[this.config.entity,this.config.volume_entity].filter(Boolean)}tone_(){return this.config.tone?B(this.config.tone):O.accent}groot_(){return this.config.layout==="groot"}template(){return this.config.bare&&this.setAttribute("bare",""),this.setAttribute("layout",this.groot_()?"groot":"row"),`
      <div class="card surface" style="--tone:${this.tone_()}">
        ${this.config.speaker_select?`<button type="button" class="spelers" data-k="speler">
                 ${f("speakers")}
                 <span class="waar"></span>
                 <span class="pijl">${f("chevronDown")}</span>
               </button>`:""}
        ${this.groot_()?'<div class="hoesgroot" role="button" tabindex="0"></div>':""}
        <div class="top" data-on="false">
          <span class="chip" role="button" tabindex="0"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="ctl"></span>
        </div>
        <div class="vol" hidden></div>
        <div class="extra" hidden></div>
      </div>`}wire(){let e=this.config,t=(s,d)=>ue(this,this.hass,e,e[s]??d);this.teardown_.push(P(this.$(".card"))),this.teardown_.push(R(this.$(".top"),{onTap:()=>t("tap_action",{action:"more-info"}),onHold:()=>t("hold_action",{action:"more-info"})}));let n=this.$(".chip");this.teardown_.push(R(n,{onTap:()=>t("icon_tap_action",Je(e.entity)),onHold:()=>t("icon_hold_action",{action:"more-info"})})),this.on(n,"click",s=>s.stopPropagation()),this.on(n,"pointerdown",s=>s.stopPropagation());let i=this.$(".hoesgroot");i&&(this.teardown_.push(R(i,{onTap:()=>t("icon_tap_action",Je(e.entity)),onHold:()=>t("icon_hold_action",{action:"more-info"})})),this.on(i,"click",s=>s.stopPropagation()),this.on(i,"pointerdown",s=>s.stopPropagation()));let r=s=>{let d=s.target.closest?.("[data-k]");d&&(s.stopPropagation(),this.doe_(d.dataset.k))},o=this.$(".spelers");o&&(this.on(o,"click",r),this.on(o,"pointerdown",s=>s.stopPropagation())),this.on(this.$(".ctl"),"click",r),this.on(this.$(".vol"),"click",r),this.on(this.$(".extra"),"click",r),this.on(this.$(".ctl"),"pointerdown",s=>s.stopPropagation()),this.on(this.$(".vol"),"pointerdown",s=>s.stopPropagation()),this.on(this.$(".extra"),"pointerdown",s=>s.stopPropagation()),this.sliders_=new Map}doe_(e){let t=this.config.entity,n=k(this.hass,t),i=(r,o={})=>this.hass.callService("media_player",r,{entity_id:t,...o});switch(e){case"power":return i(Ke(n)?"turn_on":"turn_off");case"bron":return br(this.hass,t,C(this.hass,t,this.config.name));case"prev":return i("media_previous_track");case"next":return i("media_next_track");case"play":return i(ot(n)?"media_pause":"media_play");case"stop":return i("media_stop");case"mute":{let r=Oe(this.config);return this.hass.callService("media_player","volume_mute",{is_volume_muted:!st(k(this.hass,r))},{entity_id:r})}case"vol-":case"vol+":return this.hass.callService("media_player",e==="vol+"?"volume_up":"volume_down",{},{entity_id:Oe(this.config)});case"shuffle":return this.hass.callService("media_player","shuffle_set",{shuffle:!ia(n)},{entity_id:t});case"repeat":return this.hass.callService("media_player","repeat_set",{repeat:Ji(ra(n))},{entity_id:t});case"speler":{let r=this.spelers_();return vr(this.hass,r,t,o=>this.kiesSpeler_(o))}case"search":return fr(this.hass,t,C(this.hass,t,this.config.name),{radioModus:this.config.radio_mode===!0,speakers:this.groepsSpelers_()});default:return}}paint(){let e=this.config,t=k(this.hass,e.entity),n=!t||t.state==="unavailable",i=Qi(t),r=this.$(".top");r.dataset.on=String(i),r.classList.toggle("unavailable",n),this.$(".card").style.setProperty("--tone",this.tone_());let o=this.$(".chip"),s=e.show_artwork===!1?null:$t(this.hass,e.entity,e.icon),d=s?`pic:${s}`:e.icon||lt(t);o.dataset.icon!==d&&(o.dataset.icon=d,o.classList.toggle("pic",!!s),o.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:f(d,"speaker")),o.style.setProperty("--tone",i&&!s?this.tone_():"var(--dac-ink-3)");let l=this.$(".hoesgroot");l&&l.dataset.icon!==d&&(l.dataset.icon=d,l.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:f(e.icon||lt(t),"speaker"));let c=C(this.hass,e.entity,e.name),p=Gt(t,g=>Y(this.hass,g)),h=this.$(".spelers");if(h){let g=C(this.hass,e.entity);this.text(".spelers .waar",g),h.setAttribute("aria-label",`Speaker kiezen. Nu: ${g}`)}this.text(".nm",c),this.text(".st",p),o.setAttribute("aria-label",`${c} afspelen of pauzeren`),this.$(".hoesgroot")?.setAttribute("aria-label",`${c} afspelen of pauzeren`),r.setAttribute("aria-label",`${c}, ${p}`),this.paintKnoppen_(t,n),this.paintVolume_(t,n),this.paintExtra_(t,n),L(this.$(".card"))}paintKnoppen_(e,t){let n=this.$(".ctl"),i=this.config.show_controls===!1||t?[]:Yi(e),r=i.join(",");n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=i.map(s=>`<button class="k ${s==="play"||s==="stop"?"hoofd":""}" type="button" data-k="${s}" aria-label="${Wt[s].label}">${f(Wt[s].icon)}</button>`).join(""));let o=n.querySelector('[data-k="play"]');if(o){let s=ot(e)?"pause":"play";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=f(s))}}paintVolume_(e,t){let n=this.$(".vol"),i=Oe(this.config),r=i===this.config.entity?e:k(this.hass,i),o=this.config.show_volume===!1||t?[]:na(r),s=t?null:er(e,{tonen:this.config.show_source!==!1});if(n.hidden=!o.length&&!s,n.hidden){n.dataset.sig="",this.sliders_?.delete("volume");return}let d=[...o,s?"bron":""].join(",");n.dataset.sig!==d&&(n.dataset.sig=d,n.innerHTML=(o.includes("mute")?`<button class="k" type="button" data-k="mute" aria-label="Dempen">${f("volume")}</button>`:"")+(o.includes("slider")?se("volume"):"")+(o.includes("steps")?`<button class="k" type="button" data-k="vol-" aria-label="Zachter">${f("minus")}</button><button class="k" type="button" data-k="vol+" aria-label="Harder">${f("plus")}</button>`:"")+'<span class="pct tnum"></span>'+(s?`<button class="bronknop" type="button" data-k="bron">${f("tv")}<b></b></button>`:""),this.sliders_?.delete("volume"),n.querySelector(".slider")?.setAttribute("aria-label","Volume"));let l=n.querySelector(".bronknop");if(l){let m=s.nu||"Bron";this.text(l.querySelector("b"),m),l.setAttribute("aria-label",`Bron kiezen, nu ${m}`),l.title=`Kies uit ${s.aantal} bronnen`}let c=st(r),p=je(r),h=n.querySelector('[data-k="mute"]');if(h){let m=c?"volumeMute":"volume";h.dataset.icon!==m&&(h.dataset.icon=m,h.innerHTML=f(m)),h.setAttribute("aria-pressed",String(c))}let g=n.querySelector(".slider");g&&(this.attach_(g,"volume",{value:()=>je(k(this.hass,Oe(this.config))),onInput:m=>this.setSlider_(g,m),onCommit:m=>this.hass.callService("media_player","volume_set",{volume_level:m/100},{entity_id:Oe(this.config)}),disabled:()=>ee(k(this.hass,Oe(this.config)))}),g.classList.contains("dragging")||this.setSlider_(g,p)),this.text(".pct",c?"Gedempt":`${p}%`)}paintExtra_(e,t){let n=this.$(".extra"),i=t||this.config.show_controls===!1?[]:oa(e,{zoeken:this.config.show_search!==!1});n.hidden=!i.length;let r=i.join(",");if(n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=i.map((l,c)=>`${l==="search"&&c>0?'<span class="rek"></span>':""}<button class="k" type="button" data-k="${l}" aria-label="${Wt[l].label}">${f(Wt[l].icon)}</button>`).join("")),!i.length)return;let o=n.querySelector('[data-k="shuffle"]');o&&o.setAttribute("aria-pressed",String(ia(e)));let s=n.querySelector('[data-k="repeat"]');if(s){let l=ra(e),c=l==="one"?"repeatOne":"repeat";s.dataset.icon!==c&&(s.dataset.icon=c,s.innerHTML=f(c)),s.setAttribute("aria-pressed",String(l!=="off")),s.setAttribute("aria-label",{off:"Herhalen: uit",all:"Herhalen: alles",one:"Herhalen: dit nummer"}[l])}let d=document.querySelector("domotiapp-media-browser");d?.hasAttribute("open")&&(d.hass=this.hass)}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let i=we(e,n);this.sliders_.set(t,i),this.teardown_.push(i)}setSlider_(e,t){e&&(e.style.setProperty("--v",`${t}%`),e.setAttribute("aria-valuenow",String(t)),this.text(".pct",`${t}%`))}getCardSize(){if(this.config?.layout==="groot")return 8;let e=k(this.hass,this.config?.entity);return 1+(na(e).length?1:0)+(oa(e).length?1:0)}getGridOptions(){let e=this.config?.layout==="groot",t=this.minRijen_(".card",e?6:this.getCardSize());return e?{columns:12,rows:"auto",min_columns:6,min_rows:t}:{columns:12,rows:"auto",min_columns:4,min_rows:t}}static getConfigElement(){return document.createElement("domotiapp-media-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("media_player."));return n?{entity:n}:{}}};j(qt,"css",`
    :host { display: block; }

    /* Op een rasterrij van Home Assistant; --dac-raster wordt gemeten en
       gezet door volgRaster in rasterhoogte.js. Zonder dat is deze kaart 93px
       met een volumeregel en 130px met een derde regel erbij -- allebei ergens
       tussen twee rasterrijen in. */
    .card {
      min-height: var(--dac-raster, 56px); padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 7px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ---- de speakerbalk ----
       Alleen als "algemene mediaspeler" aanstaat. Hij staat BOVEN de speler en
       niet ernaast: waar de muziek heen gaat is de eerste vraag, en pas daarna
       wat er speelt. Dat is ook de volgorde waarin een Sonos-kaart het zet. */
    .spelers {
      flex: 0 0 auto; display: flex; align-items: center; gap: 8px;
      width: 100%; padding: 7px 10px; cursor: pointer; font: inherit;
      border-radius: var(--dac-radius-pill);
      border: 1px solid var(--dac-border); background: var(--dac-surface);
      color: var(--dac-ink-2); text-align: left;
    }
    @media (hover: hover) { .spelers:hover { background: var(--dac-surface-hi); } }
    .spelers .icon { width: 16px; height: 16px; flex: 0 0 auto; }
    .spelers .waar {
      flex: 1 1 auto; min-width: 0; font-size: 12.5px; color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .spelers .pijl { flex: 0 0 auto; display: flex; color: var(--dac-ink-3); }
    .spelers .pijl .icon { width: 15px; height: 15px; }
    .spelers[hidden] { display: none; }

    .top { display: flex; align-items: center; gap: 11px; min-height: 40px; }

    .chip { width: 40px; height: 40px; cursor: pointer; }
    .chip .icon, .chip ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
    /* Een speler die uit staat is stil, net als een lamp die uit is. */
    .top[data-on="false"] .chip {
      color: var(--dac-ink-3); background: rgba(255,255,255,.05); border-color: var(--dac-border);
    }
    .top[data-on="true"] .chip {
      box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
    }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* ---- de knoppen ---- */
    .ctl { flex: 0 0 auto; display: flex; align-items: center; gap: 6px; }
    .ctl:empty { display: none; }

    .k {
      width: 34px; height: 34px; flex: 0 0 auto; padding: 0; cursor: pointer;
      display: grid; place-items: center; border-radius: var(--dac-radius-pill);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      color: var(--dac-ink-2); font: inherit;
      transition: background 200ms ease, color 200ms ease, border-color 200ms ease,
                  transform 120ms ease;
    }
    @media (hover: hover) { .k:hover { background: var(--dac-surface-hi); color: var(--dac-ink); border-color: var(--dac-border-hi); } }
    .k:active { transform: scale(.94); }
    .k .icon { width: 17px; height: 17px; }

    /* Afspelen is de knop waar je naar zoekt, dus die draagt de kleur. De rest
       blijft stil -- vijf gekleurde knopjes naast elkaar is een speelgoedauto. */
    .k.hoofd {
      color: var(--tone);
      background: color-mix(in srgb, var(--tone) 14%, transparent);
      border-color: color-mix(in srgb, var(--tone) 32%, transparent);
    }
    @media (hover: hover) { .k.hoofd:hover { background: color-mix(in srgb, var(--tone) 22%, transparent); } }

    /* ---- volume ---- */
    ${ye}
    .vol { display: flex; align-items: center; gap: 8px; }
    .vol[hidden] { display: none; }
    .vol .slider { height: 30px; }
    .vol .k { width: 30px; height: 30px; }
    .vol .k .icon { width: 16px; height: 16px; }
    .pct {
      flex: 0 0 auto; min-width: 36px; text-align: right;
      font-size: 11.5px; color: var(--dac-ink-2);
    }

    /* De bronknop staat rechts op de volumeregel en draagt de naam van de
       zender die nu aanstaat -- dat is de informatie waar je naar kijkt. De
       geluidsbalk krimpt ervoor; hij heeft aan de helft genoeg, de naam van een
       zender niet. Zonder max-width duwt "794 Voorst Veluwezoom" de schuif weg. */
    .bronknop {
      flex: 0 0 auto; max-width: 45%; height: 30px; padding: 0 12px; cursor: pointer;
      display: flex; align-items: center; gap: 7px;
      border-radius: var(--dac-radius-pill); font: inherit; font-size: 12px;
      color: var(--dac-ink-2); background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      transition: background 200ms ease, color 200ms ease, border-color 200ms ease;
    }
    @media (hover: hover) { .bronknop:hover { background: var(--dac-surface-hi); color: var(--dac-ink); border-color: var(--dac-border-hi); } }
    .bronknop .icon { width: 15px; height: 15px; flex: 0 0 auto; }
    .bronknop b {
      min-width: 0; font-weight: 600;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    /* In telefoonformaat is er breedte zat en kijk je van verder weg. */
    :host([layout="groot"]) .bronknop { height: 44px; padding: 0 18px; font-size: 14px; }
    :host([layout="groot"]) .bronknop .icon { width: 18px; height: 18px; }

    /* ---- derde regel ---- */
    .extra { display: flex; align-items: center; gap: 6px; }
    .extra[hidden] { display: none; }
    .extra .k { width: 30px; height: 30px; }
    .extra .k .icon { width: 16px; height: 16px; }
    /* Aan is aan: een shuffle die aanstaat draagt de kleur van de kaart, net
       als een brandende chip. Anders moet je de stand uit het icoon raden. */
    .extra .k[aria-pressed="true"] {
      color: var(--tone);
      background: color-mix(in srgb, var(--tone) 16%, transparent);
      border-color: color-mix(in srgb, var(--tone) 36%, transparent);
    }
    .extra .rek { flex: 1 1 auto; }

    /* ================= groot: telefoonformaat ================= */
    :host([layout="groot"]) .card { padding: 16px; gap: 14px; justify-content: flex-start; }

    .hoesgroot {
      width: 100%; aspect-ratio: 1 / 1; max-height: min(46vh, 320px);
      border-radius: var(--dac-radius); overflow: hidden; cursor: pointer;
      display: grid; place-items: center;
      background: color-mix(in srgb, var(--tone) 12%, var(--dac-surface));
      border: 1px solid var(--dac-border);
      transition: transform 220ms ease, border-color 220ms ease;
    }
    .hoesgroot:active { transform: scale(.99); }
    .hoesgroot img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .hoesgroot .icon { width: 64px; height: 64px; color: var(--tone); opacity: .8; }
    :host(:not([layout="groot"])) .hoesgroot { display: none; }

    /* De naam en wat er speelt komen onder de hoes te staan, gecentreerd, en
       een maat groter -- dit is de kaart waar je vanaf twee meter naar kijkt. */
    :host([layout="groot"]) .top { flex-direction: column; gap: 2px; text-align: center; }
    :host([layout="groot"]) .chip { display: none; }
    :host([layout="groot"]) .txt { width: 100%; align-items: center; }
    :host([layout="groot"]) .nm { font-size: 18px; font-weight: 600; white-space: normal; }
    :host([layout="groot"]) .st { font-size: 13.5px; }

    :host([layout="groot"]) .ctl { width: 100%; justify-content: center; gap: 14px; }
    :host([layout="groot"]) .ctl .k { width: 54px; height: 54px; }
    :host([layout="groot"]) .ctl .k .icon { width: 24px; height: 24px; }
    /* Afspelen is de knop waar je met je duim naartoe gaat, dus die is groter. */
    :host([layout="groot"]) .ctl .k.hoofd { width: 72px; height: 72px; }
    :host([layout="groot"]) .ctl .k.hoofd .icon { width: 30px; height: 30px; }

    :host([layout="groot"]) .vol { gap: 12px; }
    :host([layout="groot"]) .vol .k { width: 44px; height: 44px; }
    :host([layout="groot"]) .vol .k .icon { width: 20px; height: 20px; }
    :host([layout="groot"]) .vol .slider { height: 44px; }
    :host([layout="groot"]) .vol .slider .track { border-radius: 12px; }
    :host([layout="groot"]) .pct { font-size: 13.5px; min-width: 46px; }

    :host([layout="groot"]) .extra { justify-content: center; gap: 14px; padding-top: 2px; }
    :host([layout="groot"]) .extra .k { width: 46px; height: 46px; }
    :host([layout="groot"]) .extra .k .icon { width: 20px; height: 20px; }
    :host([layout="groot"]) .extra .rek { display: none; }

    .top.unavailable, .vol.unavailable { opacity: .42; }
    .top.unavailable .k, .top.unavailable .chip,
    .vol.unavailable .slider, .vol.unavailable .k { pointer-events: none; }
  `);var fa=class extends D{defaults(){return{layout:"row",show_artwork:!0,show_volume:!0,show_source:!0,show_controls:!0,show_search:!0,icon_tap_action:{action:"toggle"},tap_action:{action:"more-info"}}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"speaker"}]}schema(){return[{name:"entity",selector:_.entity("media_player")},{name:"name",selector:_.text()},{name:"speaker_select",selector:_.bool()},{name:"players",selector:{entity:{domain:"media_player",multiple:!0}}},{name:"layout",selector:_.select([{value:"row",label:"Rij (\xE9\xE9n rasterrij hoog)"},{value:"groot",label:"Groot (telefoonformaat, grote knoppen)"}])},{name:"volume_entity",selector:_.entity("media_player")},{name:"show_artwork",selector:_.bool()},{name:"show_controls",selector:_.bool()},{name:"show_volume",selector:_.bool()},{name:"show_source",selector:_.bool()},{name:"radio_mode",selector:_.bool()},{name:"speakers",selector:{entity:{domain:"media_player",integration:"music_assistant",multiple:!0}}},{name:"show_search",selector:_.bool()},{name:"icon_tap_action",selector:_.action("toggle")},{name:"icon_hold_action",selector:_.action("more-info")},{name:"tap_action",selector:_.action("more-info")},{name:"hold_action",selector:_.action("more-info")}]}label(e){return{entity:"Mediaspeler",name:"Naam (overschrijft die van de speler)",speaker_select:"Algemene mediaspeler",players:"Welke speakers je mag kiezen",layout:"Vorm",volume_entity:"Geluid van (optioneel)",show_artwork:"Albumhoes tonen",show_controls:"Knoppen tonen",show_volume:"Volume tonen",show_source:"Bronknop tonen",radio_mode:"Doorspelen na een nummer",speakers:"Speakers om mee te groeperen",show_search:"Zoeken en groeperen tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Welke knoppen er verschijnen leest de kaart uit de speler zelf: wat hij niet kan, komt er niet op.";if(e.name==="speaker_select")return"De kaart krijgt er een balk bij waarmee je kiest waar de muziek heen gaat. De speler hierboven is de standaard; de keuze wordt per apparaat onthouden, dus je telefoon en de tablet in de gang kunnen op iets anders staan.";if(e.name==="players")return"Laat je dit leeg, dan staan de speakers van Music Assistant in de lijst -- geen televisies of streamers, want daar stuur je geen muziek naartoe. Vul je er zelf een paar in, dan is dat de lijst, wat er ook in staat.";if(e.name==="layout")return"Groot is bedoeld voor een pop-up of een kolom waar de kaart alle ruimte krijgt: grote hoes, grote knoppen.";if(e.name==="volume_entity")return"Zit het geluid ergens anders dan het beeld \u2014 een tv met een soundbar eronder \u2014 kies dan hier de speler die het volume regelt. Leeg laten betekent: de speler zelf.";if(e.name==="show_artwork")return"Speelt er iets met een hoes, dan vult die de chip. Een eigen icoon gaat voor.";if(e.name==="show_volume")return"De volumeregel verschijnt zodra er iets speelt en verdwijnt als de speler uit gaat.";if(e.name==="speakers")return'De speakers die onderin het zoekscherm staan om samen te laten spelen. Laat je dit leeg op een algemene mediaspeler, dan zijn dat dezelfde speakers als in de keuzelijst; op een gewone kaart valt hij terug op het label "Music Assistant Media" in Home Assistant.';if(e.name==="radio_mode")return"Zoals Spotify: is het gekozen nummer klaar, dan zoekt Music Assistant er zelf muziek bij in plaats van te stoppen. Staat dit uit, dan kan het nog steeds per keer via het menu bij een treffer.";if(e.name==="show_source")return"Voor een tv-ontvanger of een versterker met ingangen: een knop met de zender die nu aanstaat, die een zoekbaar overzicht opent. Kan de speler geen bron kiezen, dan verschijnt hij niet.";if(e.name==="show_search")return"De zoekknop opent Music Assistant over het hele scherm. Alleen bij een speler van Music Assistant; groeperen komt erbij als de speler dat aankan."}};I("domotiapp-media-card-editor",fa);N("domotiapp-media-card",qt,{name:"DomotiApp Mediaspeler",description:"Wat er speelt, de knoppen die de speler aankan, en het volume."});var dt=[{sleutel:"smoke",label:"Rook",icoon:"smoke",alarm:"Rook gedetecteerd",rust:"Geen"},{sleutel:"co",label:"Koolmonoxide",icoon:"co",alarm:"Koolmonoxide gedetecteerd",rust:"Geen"},{sleutel:"heat",label:"Warmte",icoon:"thermo",alarm:"Te warm",rust:"Normaal"},{sleutel:"temperature",label:"Temperatuur",icoon:"thermo",meting:!0},{sleutel:"battery",label:"Batterij",icoon:"battery",meting:!0}],kr=a=>a?.rust??"Rustig",ba=20;function va(a){if(!a||a.state==="unavailable"||a.state==="unknown")return null;if(String(a.entity_id??"").startsWith("binary_sensor."))return a.state==="on"?0:null;let e=Number(a.state);return Number.isFinite(e)?e:null}var zl=a=>!!a&&a.state==="on",jl=a=>!a||a.state==="unavailable"||a.state==="unknown";function xr(a,e){let t=a.filter(i=>!i.meting);for(let i of t)if(zl(e(i.sleutel)))return{soort:"alarm",tekst:i.alarm,tone:"bad",icoon:i.icoon};if(a.length&&a.every(i=>jl(e(i.sleutel))))return{soort:"weg",tekst:"Niet bereikbaar",tone:"neutral",icoon:"smokeDetector"};let n=va(e("battery"));return n!=null&&n<=ba?{soort:"batterij",tekst:`Batterij bijna leeg (${Math.round(n)}%)`,tone:"warn",icoon:"battery"}:t.length?{soort:"goed",tekst:"Alles rustig",tone:"good",icoon:"smokeDetector"}:{soort:"meting",tekst:"",tone:"accent",icoon:"smokeDetector"}}var El={good:O.good,warn:O.warn,bad:O.bad,neutral:O.neutral,accent:O.accent},Ft=class extends A{validate(e){return dt.filter(n=>e[n.sleutel]).length?{...e}:{...e,[T]:"Kies minstens \xE9\xE9n entiteit: rook, koolmonoxide, warmte, temperatuur of batterij."}}watched(){return dt.map(e=>this.config[e.sleutel]).filter(Boolean)}gekozen_(){return dt.filter(e=>this.config[e.sleutel])}toestand_(){let e=xr(this.gekozen_(),t=>k(this.hass,this.config[t]));return{...e,tone:El[e.tone]??O.accent}}batterijPct_(){return va(k(this.hass,this.config.battery))}template(){this.config.bare&&this.setAttribute("bare","");let e=this.gekozen_().map(t=>`<span class="pil" data-soort="${t.sleutel}" title="${t.label}">${f(t.icoon)}<b></b></span>`).join("");return`
      <div class="card surface">
        <div class="top" role="button" tabindex="0" style="--tone:${O.good}">
          <span class="chip"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
        </div>
        <div class="meta">${e}</div>
      </div>`}wire(){let e=this.config,t=this.gekozen_()[0];this.teardown_.push(R(this.$(".top"),{onTap:()=>e.tap_action?ue(this,this.hass,e,e.tap_action):Q(this,e.smoke??e[t.sleutel]),onHold:()=>ue(this,this.hass,e,e.hold_action??{action:"more-info"})})),this.$$(".pil").forEach(i=>{let r=e[i.dataset.soort];r&&(this.on(i,"click",o=>{o.stopPropagation(),Q(this,r)}),this.on(i,"pointerdown",o=>o.stopPropagation()),i.style.cursor="pointer")});let n=this.$(".card");if(n&&typeof ResizeObserver=="function"){let i=new ResizeObserver(()=>this.pasAan_());i.observe(n),this.teardown_.push(()=>i.disconnect())}this.teardown_.push(P(this.$(".card")))}paint(){let e=this.config,t=this.toestand_(),n=this.$(".top");this.toggleAttribute("alarm",t.soort==="alarm"),n.style.setProperty("--tone",t.tone),n.classList.toggle("unavailable",t.soort==="weg");let i=this.$(".chip"),r=e.icon||t.icoon;i.dataset.icon!==r&&(i.dataset.icon=r,i.innerHTML=f(r,"smoke")),i.style.setProperty("--tone",t.tone);let o=this.gekozen_()[0];this.text(".nm",e.name||C(this.hass,e.smoke??e[o.sleutel],null)),this.text(".st",t.tekst),n.setAttribute("aria-label",`${this.$(".nm").textContent}${t.tekst?`, ${t.tekst}`:""}`),this.$$(".pil").forEach(s=>this.paintPil_(s)),this.$(".meta").hidden=this.gekozen_().length<=1&&!this.config.always_meta,this.pasAan_(),L(this.$(".card"))}pasAan_(){let e=this.$(".meta");if(!e||e.hidden)return;let t=()=>{let i=e.querySelector(".pil")?.offsetHeight??0;return i&&Math.round((e.scrollHeight+i/2)/i-.5)||1};this.removeAttribute("krapper"),!(t()<=1)&&this.setAttribute("krapper","")}paintPil_(e){let t=dt.find(s=>s.sleutel===e.dataset.soort),n=k(this.hass,this.config[t.sleutel]),i=e.querySelector("b"),r=s=>e.setAttribute("aria-label",`${t.label}: ${s}`);if(!n||ee(n)){i.textContent="\u2014",r("onbekend"),e.dataset.let="";return}if(t.meting){let s=n.attributes.unit_of_measurement??"",d=Number(n.state);i.textContent=Number.isFinite(d)?`${G(this.hass,d,t.sleutel==="temperature"?1:0)} ${s}`.trim():Y(this.hass,n);let l=t.sleutel==="battery"?this.batterijPct_():null;e.dataset.let=l!=null&&l<=ba?"warn":"",r(i.textContent);return}let o=xe(n);i.textContent=o?"Alarm":kr(t),r(i.textContent),e.dataset.let=o?"bad":""}regels_(){return this.gekozen_().length>1?2:1}getCardSize(){return this.regels_()}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",this.regels_())}}static getConfigElement(){return document.createElement("domotiapp-smoke-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("binary_sensor.")&&/rook|smoke/i.test(i));return n?{smoke:n}:{}}};j(Ft,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .top { display: flex; align-items: center; gap: 11px; min-height: 40px; cursor: pointer; }
    .chip { width: 40px; height: 40px; }
    .chip .icon { width: 20px; height: 20px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    /* De naam BREEKT AF en wordt niet afgekapt.
       "Slaapkamer B.G." is de langste naam in het huis van de eigenaar en paste
       er net niet op; met een ellipsis lees je dan "Slaapkamer B..." en weet je
       niet welke kamer het is. Twee regels mag, en de kaart groeit mee (zie
       getGridOptions) -- dus er valt niets meer af. Meer dan twee regels zou de
       kop groter maken dan de metingen eronder, en dan is het geen kop meer. */
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
      overflow: hidden; overflow-wrap: anywhere;
    }
    .st { font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2); }
    /* Bij alarm draagt de tekst de kleur mee: wie de chip niet ziet, leest hem. */
    :host([alarm]) .st { color: var(--tone); font-weight: 600; }

    /* Een alarm hoort te bewegen. Niet fel -- de kaart moet opvallen, niet
       knipperen als een kermis. Wie bewegingen uit heeft staan (prefers-reduced-
       motion) krijgt hem stil; de kleur en het woord blijven. */
    :host([alarm]) .chip { animation: pols 1.6s ease-in-out infinite; }
    @keyframes pols {
      0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--tone) 55%, transparent); }
      50% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--tone) 0%, transparent); }
    }

    /* ---- de metingen ----
       E\xE9n regel, en die SCHUIFT NIET. Dat deed hij wel, met een vervaging aan
       de rechterkant om te laten zien dat er meer stond -- en dat is precies de
       verkeerde afspraak voor een kaart die bij een klant op de muur hangt: wie
       niet w\xE9\xE9t dat je kunt vegen, ziet gegevens die er niet zijn. Gemeld door
       de eigenaar op 26 augustus 2026: "ik wil niet kunnen scrollen want
       klanten weten dan niet of er iets verborgen zit."

       Wat er in de plaats komt zijn twee dingen samen. De kaart MEET hoeveel
       regels de pillen nodig hebben (pasAan_) en kleedt ze uit tot ze op een
       regel passen: eerst het omhulsel van de pil -- de rand, het vlak en de
       binnenmarge -- en als dat niet genoeg is ook de tussenruimte en een halve
       punt van de letter. Past het dan nog niet, dan BREEKT de rij af en GROEIT
       de kaart mee (rows: auto, zie getGridOptions). Dat laatste is de reden
       dat er niets meer verborgen kan raken: er is geen vaste hoogte meer
       waarin het moet passen.

       De gegevens zelf blijven dus altijd staan; alleen de decoratie eromheen
       gaat weg, en anders wordt de kaart een rasterrij hoger.

       De labels ("Rook", "Temperatuur", "Batterij") zijn er helemaal af. Het
       icoon zegt hetzelfde in een zesde van de breedte, en de kaart heeft die
       breedte hard nodig -- hij claimt twee vaste rasterrijen, dus afbreken
       naar een derde regel kan niet. De woorden staan nog wel in het
       title-attribuut en in aria-label, dus een schermlezer en een muis
       vinden ze terug. */
    .meta {
      display: flex; flex-wrap: wrap; gap: 13px;
      overflow: hidden;
    }
    .meta[hidden] { display: none; }

    /* GEEN omhulsel om een meting. Er zat een pil omheen -- een vlak met een
       rand -- en die viel weg zodra de kaart smal werd. Dat gaf twee gezichten
       voor hetzelfde ding: een brede kaart met omlijnde metingen naast een
       smalle met kale. De eigenaar zag de omlijnde versie terug op een kaart
       met \xE9\xE9n sensor en meldde het op 26 augustus 2026: "dan hebben de icons
       een omlijning dat moet niet."

       Nu is er \xE9\xE9n gezicht: het icoon met zijn waarde, en verder niets. Een
       meting is geen knop, dus hij hoort er ook niet als een uit te zien. */
    .pil {
      flex: 0 0 auto;
      display: flex; align-items: center; gap: 5px;
      font-size: 11.5px; color: var(--dac-ink-2);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .pil .icon { width: 14px; height: 14px; color: var(--dac-ink-3); flex: 0 0 auto; }
    .pil b { font-weight: 600; color: var(--dac-ink); }
    /* Een pil die zelf iets te melden heeft -- een lege batterij, een melder die
       aanslaat -- kleurt mee. De rest blijft stil. */
    .pil[data-let="warn"] { color: var(--dac-warn); border-color: color-mix(in srgb, var(--dac-warn) 40%, transparent); }
    .pil[data-let="warn"] .icon, .pil[data-let="warn"] b { color: var(--dac-warn); }
    .pil[data-let="bad"] { color: var(--dac-bad); border-color: color-mix(in srgb, var(--dac-bad) 45%, transparent); }
    .pil[data-let="bad"] .icon, .pil[data-let="bad"] b { color: var(--dac-bad); }

    .top.unavailable { opacity: .42; }

    /* ---- krapper ----
       Gemeten en niet geraden. Een @container-regel op een vaste breedte kan
       dit niet: of de rij past hangt af van HOEVEEL metingen er staan (een
       melder met alleen rook en batterij past ruim waar een met vijf sensoren
       klem zit) en van hoe breed de waarden zijn -- "100 %" is breder dan
       "5 %". Daarom meet pasAan_ de echte rij en zet deze stand. */
    :host([krapper]) .meta { gap: 9px; }
    :host([krapper]) .pil { font-size: 11px; gap: 4px; }
    :host([krapper]) .pil .icon { width: 13px; height: 13px; }
  `);var ka=class extends D{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"smoke"}]}schema(){return[{name:"name",selector:_.text()},{name:"smoke",selector:_.entity()},{name:"co",selector:_.entity()},{name:"heat",selector:_.entity()},{name:"temperature",selector:_.entity()},{name:"battery",selector:_.entity()},{name:"tap_action",selector:_.action("more-info")},{name:"hold_action",selector:_.action("more-info")}]}label(e){return{name:"Naam (overschrijft die van de melder)",smoke:"Rook",co:"Koolmonoxide",heat:"Warmte",temperature:"Temperatuur",battery:"Batterij",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="smoke")return"Alle vijf zijn optioneel: vul in wat je melder heeft. Wat je leeg laat, komt niet op de kaart.";if(e.name==="battery")return"Een percentage of een 'batterij bijna leeg'-sensor. Onder de 20% meldt de kaart het uit zichzelf."}};I("domotiapp-smoke-card-editor",ka);N("domotiapp-smoke-card",Ft,{name:"DomotiApp Rookmelder",description:"Rook, koolmonoxide, warmte, temperatuur en batterij \u2014 alles optioneel."});var $l=["zo","ma","di","wo","do","vr","za"],_r=5,wr=8,Zt=class extends A{validate(e){if(!e.entity)return{...e,[T]:"Kies een weerentiteit."};let t=Math.min(Math.max(1,Number(e.days)||_r),wr);return{show_current:!0,forecast_type:"daily",...e,days:t}}watched(){return[this.config.entity]}template(){this.config.bare&&this.setAttribute("bare","");let e=this.config;return`
      <div class="card surface">
        <div class="nu" role="button" tabindex="0" ${e.show_current===!1?"hidden":""}>
          <span class="chip" style="--tone:${O.accent}"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="graden tnum"></span>
        </div>
        <div class="rij" style="--n:${e.days}"></div>
      </div>`}wire(){this.teardown_.push(P(this.$(".card"))),this.teardown_.push(R(this.$(".nu"),{onTap:()=>Q(this,this.config.entity),onHold:()=>Q(this,this.config.entity)})),this.abonneer_()}async abonneer_(){let e=this.config;this.opzeggen_?.(),this.opzeggen_=null;let t=this.hass?.connection;if(!t?.subscribeMessage){this.forecastFout_="Geen verbinding voor de voorspelling.",this.paintRij_();return}try{let n=await t.subscribeMessage(i=>{this.forecast_=i?.forecast??[],this.forecastFout_=null,this.paintRij_()},{type:"weather/subscribe_forecast",forecast_type:e.forecast_type==="hourly"?"hourly":"daily",entity_id:e.entity});if(!this.isConnected){n();return}this.opzeggen_=n,this.teardown_.push(()=>{try{n()}catch{}this.opzeggen_=null})}catch{this.forecastFout_=e.forecast_type==="hourly"?"Deze weerbron geeft geen uurvoorspelling.":"Deze weerbron geeft geen dagvoorspelling.",this.paintRij_()}}paint(){let e=this.config,t=k(this.hass,e.entity),n=ee(t);this.$(".nu").classList.toggle("unavailable",n);let r=this.$(".chip"),o=e.icon||tt(t?.state);r.dataset.icon!==o&&(r.dataset.icon=o,r.innerHTML=f(o,"cloud")),this.text(".nm",C(this.hass,e.entity,e.name)),this.text(".st",n?"Niet bereikbaar":Y(this.hass,t));let s=this.$(".graden"),d=t?.attributes?.temperature,l=t?.attributes?.temperature_unit??"\xB0C";s.innerHTML=d==null?"":`${G(this.hass,d,Number.isInteger(d)?0:1)}<small>${l}</small>`,this.paintRij_(),L(this.$(".card"))}paintRij_(){let e=this.$(".rij");if(!e)return;let t=this.config;if(this.forecastFout_&&!this.forecast_?.length){e.style.setProperty("--n",1),e.innerHTML=`<div class="leeg">${this.forecastFout_}</div>`;return}let n=(this.forecast_??[]).slice(0,t.days);if(!n.length){e.style.setProperty("--n",1),e.innerHTML='<div class="leeg">Nog geen voorspelling ontvangen\u2026</div>';return}e.style.setProperty("--n",n.length);let i=k(this.hass,t.entity)?.attributes?.temperature_unit??"";e.innerHTML=n.map((r,o)=>{let s=this.wanneer_(r.datetime,o),d=f(tt(r.condition),"cloud"),l=r.temperature==null?"":`${G(this.hass,r.temperature,0)}\xB0`,c=r.templow==null?"":`${G(this.hass,r.templow,0)}\xB0`,p=r.precipitation_probability==null?"":`<span class="nat">${f("drop")}${Math.round(r.precipitation_probability)}%</span>`;return`
          <div class="dag" style="--tone:${O.accent}">
            <span class="wanneer">${s}</span>
            ${d}
            <span class="max tnum">${l}</span>
            ${c?`<span class="min tnum">${c}</span>`:""}
            ${p}
          </div>`}).join("")}wanneer_(e,t){let n=new Date(e);if(Number.isNaN(+n))return"";if(this.config.forecast_type==="hourly")return`${String(n.getHours()).padStart(2,"0")}:00`;let i=new Date,r=n.getDate()===i.getDate()&&n.getMonth()===i.getMonth()&&n.getFullYear()===i.getFullYear();return t===0&&r?"vandaag":$l[n.getDay()]}regels_(){return this.config?.show_current===!1?1:2}getCardSize(){return this.regels_()+1}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-forecast-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("weather."));return n?{entity:n}:{}}};j(Zt,"css",`
    :host { display: block; height: 100%; }

    /* Op een rasterrij van Home Assistant; --dac-raster wordt gemeten en
       gezet door volgRaster in rasterhoogte.js. De hoogte van een dagtegel
       hangt af van wat je weerbron levert, dus uitrekenen kan hier niet --
       meten wel. */
    .card {
      min-height: var(--dac-raster, 56px); padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ---- vandaag ---- */
    .nu { display: flex; align-items: center; gap: 11px; min-height: 40px; cursor: pointer; }
    .nu[hidden] { display: none; }
    .chip { width: 40px; height: 40px; }
    .chip .icon { width: 22px; height: 22px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .graden {
      flex: 0 0 auto; font-size: 22px; font-weight: 300; letter-spacing: -.02em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
    }
    .graden small { font-size: 12px; color: var(--dac-ink-2); margin-left: 2px; }

    /* ---- de rij dagen ---- */
    .rij {
      display: grid; gap: 4px;
      grid-template-columns: repeat(var(--n, 5), minmax(0, 1fr));
    }
    .rij[hidden] { display: none; }
    .dag {
      display: flex; flex-direction: column; align-items: center; gap: 3px;
      padding: 6px 2px; border-radius: var(--dac-radius-sm);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
    }
    .dag .wanneer {
      font-size: 10.5px; font-weight: 600; letter-spacing: .04em;
      color: var(--dac-ink-3); text-transform: none;
    }
    .dag .icon { width: 20px; height: 20px; color: var(--tone); }
    .dag .max {
      font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums;
    }
    .dag .min {
      font-size: 11px; color: var(--dac-ink-3); font-variant-numeric: tabular-nums;
    }
    /* Regen hoort te zien te zijn zonder de tekst te lezen. Een druppel met een
       percentage, en alleen als de bron er een geeft. */
    .dag .nat {
      display: flex; align-items: center; gap: 2px;
      font-size: 10px; color: var(--dac-grid-in); font-variant-numeric: tabular-nums;
    }
    .dag .nat .icon { width: 10px; height: 10px; color: var(--dac-grid-in); }
    .dag .nat:empty { display: none; }

    .leeg {
      padding: 10px 2px; text-align: center;
      font-size: 12px; color: var(--dac-ink-3);
    }

    .unavailable { opacity: .42; }
  `);var xa=class extends D{defaults(){return{show_current:!0,forecast_type:"daily",days:_r}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"cloudSun"}]}schema(){return[{name:"entity",selector:_.entity("weather")},{name:"name",selector:_.text()},{name:"forecast_type",selector:_.select([{value:"daily",label:"Per dag"},{value:"hourly",label:"Per uur"}])},{name:"days",selector:_.number(1,wr)},{name:"show_current",selector:_.bool()}]}label(e){return{entity:"Weerentiteit",name:"Naam (overschrijft die van de weerbron)",forecast_type:"Voorspelling",days:"Hoeveel punten",show_current:"Nu-regel tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Meer hoeft er niet ingevuld te worden: de kaart leest zelf uit wat je weerbron levert.";if(e.name==="forecast_type")return"Niet elke weerbron kan allebei. Kan hij het niet, dan zegt de kaart dat in plaats van leeg te blijven."}};I("domotiapp-forecast-card-editor",xa);N("domotiapp-forecast-card",Zt,{name:"DomotiApp Weersvoorspelling",description:"Vandaag groot, de dagen erna op een rij. E\xE9n entiteit invullen."});var ct={OPEN:1,CLOSE:2,SET_POSITION:4,STOP:8},pt=(a,e)=>!!((a?.attributes?.supported_features??0)&e),Al=(a={})=>{switch(a.device_class){case"garage":return{open:"garageOpen",closed:"garageClosed"};case"awning":case"blind":return{open:"awning",closed:"awning"};default:return{open:"shutterOpen",closed:"shutter"}}},Xt=class extends A{validate(e){let t=e.covers??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,covers:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[T]:"Kies minstens \xE9\xE9n rolluik of zonnescherm."}}watched(){return this.config.covers.map(e=>e.entity)}keysHtml(e){return`
      <div class="keys">
        <button type="button" data-act="open" aria-label="Open">${E.arrowUp}</button>
        ${e?`<button type="button" data-act="stop" aria-label="Stop">${E.stop}</button>`:""}
        <button type="button" data-act="close" aria-label="Dicht">${E.arrowDown}</button>
      </div>`}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`<div class="card surface">${e.covers.map((n,i)=>`
      <div class="cv" data-i="${i}" data-shown="closed" style="--tone:${B(n.tone??e.tone,"solar")}">
        <button class="chip" type="button" aria-label="Meer info"></button>
        <div class="txt"><div class="nm"></div><div class="st"></div></div>
        ${this.keysHtml(e.show_stop!==!1)}
        <div class="pos" hidden></div>
      </div>`).join("")}</div>`}wire(){this.dragging_=new Set,this.bound_=new Set,this.assumed_=new Map,this.$$(".cv").forEach(e=>{let t=e.dataset.i;e.querySelectorAll(".keys button").forEach(i=>{this.on(i,"click",()=>{let r=i.dataset.act,o={open:"open_cover",stop:"stop_cover",close:"close_cover"};this.hass.callService("cover",o[r],{entity_id:this.config.covers[+t].entity}),r!=="stop"&&(this.assumed_.set(t,r==="open"?"open":"closed"),this.paint())})});let n=this.config.covers[+t].entity;this.teardown_.push(R(e.querySelector(".chip"),{onTap:()=>Q(this,n)}))})}paint(){this.$$(".cv").forEach(e=>{let t=e.dataset.i,n=this.config.covers[+t],i=k(this.hass,n.entity),r=F(this.hass,n.entity),o=!i||i.state==="unavailable",s=i?.state??"unknown";e.classList.toggle("unavailable",o),e.querySelector(".nm").textContent=C(this.hass,n.entity,n.name);let d=pt(i,ct.SET_POSITION)&&r.current_position!=null,l=d?r.current_position>0?"open":"closed":s==="open"||s==="closed"?s:this.assumed_.get(t)??"closed";e.dataset.shown=l;let c=Al(r),p=(l==="open"?n.icon_open:n.icon_closed)??(l==="open"?this.config.icon_open:this.config.icon_closed)??n.icon??c[l],h=e.querySelector(".chip");h.dataset.icon!==p&&(h.dataset.icon=p,h.innerHTML=f(p,c[l]));let g=e.querySelector(".st");this.dragging_.has(t)||(g.textContent=o?"Niet bereikbaar":s==="opening"?"Gaat open":s==="closing"?"Gaat dicht":d?`${r.current_position}% open`:s==="open"?"Open":s==="closed"?"Dicht":""),e.querySelectorAll(".keys button").forEach(v=>{if(v.dataset.act==="stop"){v.disabled=o||!pt(i,ct.STOP);return}let y=v.dataset.act==="open";v.disabled=o||(y?!pt(i,ct.OPEN):!pt(i,ct.CLOSE))});let m=e.querySelector(".pos"),b=d&&this.config.show_position!==!1;if(m.hidden=!b,b){if(m.dataset.built||(m.dataset.built="1",m.innerHTML=se("position"),m.querySelector(".slider").setAttribute("aria-label","Positie")),!this.bound_.has(t)){this.bound_.add(t);let y=m.querySelector(".slider"),x=M=>{y.style.setProperty("--v",`${M}%`),y.setAttribute("aria-valuenow",String(M)),e.querySelector(".st").textContent=`${M}% open`};this.teardown_.push(we(y,{value:()=>F(this.hass,n.entity).current_position??0,onInput:x,onCommit:M=>this.hass.callService("cover","set_cover_position",{entity_id:n.entity,position:M})}))}let v=m.querySelector(".slider");if(!v.classList.contains("dragging")){let y=r.current_position??0;v.style.setProperty("--v",`${y}%`),v.setAttribute("aria-valuenow",String(y))}}})}rows_(){let e=this.config?.covers??[],t=e.some(n=>pt(k(this.hass,n.entity),ct.SET_POSITION));return me(12+Math.max(1,e.length)*42+(t?30:0))}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-cover-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("cover."));return{covers:n?[n]:[]}}};j(Xt,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; padding: 6px 12px;
      display: flex; flex-direction: column; justify-content: center;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .cv {
      display: grid; grid-template-columns: 40px 1fr auto; gap: 11px; align-items: center;
      flex: 1 1 auto; min-height: 40px;
    }
    .cv + .cv { border-top: 1px solid var(--dac-border); }

    .chip {
      width: 40px; height: 40px; cursor: pointer;
      transition: color 220ms ease, background 220ms ease,
                  border-color 220ms ease, box-shadow 220ms ease;
    }
    .chip .icon, .chip ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
    /* Open licht op, dicht is een rusttoestand. De toestand zit in het icoon en
       niet in een gemarkeerde knop: een opgelichte pijl-omlaag leest als "deze
       knop staat aan", en een knop staat nergens aan. */
    .cv[data-shown="open"] .chip {
      color: var(--tone);
      background: color-mix(in srgb, var(--tone) 16%, transparent);
      border-color: color-mix(in srgb, var(--tone) 38%, transparent);
      box-shadow: 0 0 14px -3px color-mix(in srgb, var(--tone) 60%, transparent);
    }
    .cv[data-shown="closed"] .chip {
      color: var(--dac-ink-3); background: rgba(255,255,255,.05); border-color: var(--dac-border);
    }

    .txt { min-width: 0; }
    .nm { font-size: 13.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .st { margin-top: 2px; font-size: 11.5px; color: var(--dac-ink-2); font-variant-numeric: tabular-nums; }
    .st:empty { display: none; }

    /* ---- open / stop / dicht ---- */
    .keys {
      display: inline-flex; gap: 2px; padding: 3px; flex: 0 0 auto;
      background: rgba(255,255,255,.05); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
    }
    .keys button {
      width: 36px; height: 32px; display: grid; place-items: center; padding: 0; cursor: pointer;
      border: 0; background: transparent; color: var(--dac-ink-2);
      border-radius: var(--dac-radius-pill);
      transition: background 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .keys button:hover { color: var(--dac-ink); background: rgba(255,255,255,.08); } }
    .keys button:active { background: rgba(255,255,255,.14); }
    .keys button .icon { width: 18px; height: 18px; }
    .keys button:disabled { opacity: .3; cursor: default; }

    /* ---- positie, alleen bij motoren die terugmelden ---- */
    .pos { grid-column: 1 / -1; margin: 2px 0 4px; display: flex; }
    .pos[hidden] { display: none; }
    ${ye}

    .cv.unavailable { opacity: .42; pointer-events: none; }

    @media (max-width: 380px) { .keys button { width: 34px; } }
  `);var _a=class extends D{defaults(){return{show_stop:!0,show_position:!0}}pickers(){return[{key:"icon_open",kind:"icon",label:"Icoon als het open staat",fallback:"shutterOpen"},{key:"icon_closed",kind:"icon",label:"Icoon als het dicht is",fallback:"shutter"}]}setConfig(e){let t={...e},n=(e.covers??e.entities??(e.entity?[e.entity]:[])).map(i=>typeof i=="string"?{entity:i}:i);t.covers=n.map(i=>i.entity);for(let i of n)i.name&&(t[`naam:${i.entity}`]=i.name);super.setConfig(t)}serialize(e){let t={...e},n=t.covers??[];t.covers=n.map(i=>{let r=t[`naam:${i}`];return r?{entity:i,name:r}:i});for(let i of Object.keys(t))i.startsWith("naam:")&&delete t[i];return t}schema(){let e=(this.config_?.covers??[]).filter(t=>typeof t=="string");return[{name:"covers",selector:{entity:{domain:"cover",multiple:!0}}},...e.map(t=>({name:`naam:${t}`,selector:_.text()})),{name:"show_stop",selector:_.bool()}]}label(e){if(e.name.startsWith("naam:")){let t=e.name.slice(5);return`Naam voor ${this.hass?.states?.[t]?.attributes?.friendly_name??t}`}return{covers:"Rolluiken",show_stop:"Stopknop tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="covers")return"Melden ze hun stand terug, dan komt er vanzelf een schuif bij. Zo niet, dan blijven het open, stop en dicht, en volgt het icoon de knop die je indrukt. Per rolluik kun je hieronder een eigen naam zetten."}};I("domotiapp-cover-card-editor",_a);N("domotiapp-cover-card",Xt,{name:"DomotiApp Rolluiken",description:"Open, stop en dicht, met een eigen icoon voor open en dicht."});function Ml(a){if(!a)return{label:"Onbekend",home:null};switch(a.state){case"home":return{label:"Thuis",home:!0};case"not_home":return{label:"Afwezig",home:!1};case"unknown":case"unavailable":return{label:"Onbekend",home:null};default:return{label:a.state,home:!1}}}var Qt=class extends A{validate(e){let t=e.persons??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,persons:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[T]:"Kies minstens \xE9\xE9n persoon."}}watched(){return this.config.persons.map(e=>e.entity)}template(){let e=this.config;e.bare&&this.setAttribute("bare","");let t=e.columns??Math.min(e.persons.length,6),n=e.persons.map((i,r)=>`
      <button class="p" type="button" data-i="${r}" style="--tone:var(--dac-ink-3)">
        <span class="av"><span class="ph"></span></span>
        <span class="nm"></span>
      </button>`).join("");return`<div class="card surface"><div class="chips" style="--cols:${t}">${n}</div></div>`}wire(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i];this.teardown_.push(R(e,{onTap:()=>Q(this,t.entity)}))})}paint(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i],n=k(this.hass,t.entity),i=Ml(n);e.style.setProperty("--tone",i.home===!0?"var(--dac-good)":i.home===!1?"var(--dac-bad)":"var(--dac-warn)");let r=C(this.hass,t.entity,t.name);this.text(e.querySelector(".nm"),r);let o=e.querySelector(".ph"),s=n?.attributes?.entity_picture,d=s?`img:${s}`:r?`ini:${r[0]}`:"icon";o.dataset.kind!==d&&(o.dataset.kind=d,o.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:r?r[0].toUpperCase():E.person),e.setAttribute("aria-label",`${r}, ${i.label}`)})}rows_(){let e=this.config?.columns??Math.min(this.config?.persons?.length??1,6),t=Math.ceil((this.config?.persons?.length??1)/e);return me(10+t*45+(t-1)*6)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:"full",rows:e,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-person-card-editor")}static getStubConfig(e){return{persons:Object.keys(e?.states??{}).filter(n=>n.startsWith("person.")).slice(0,6)}}};j(Qt,"css",`
    :host {
      display: block; height: 100%;
      /* Hoever de ring buiten de avatar steekt. Op twee plekken nodig: hij
         tekent de ring en hij corrigeert de uitlijning. */
      --dac-ring: 3px;
    }

    /* De ring om een avatar wordt met box-shadow BUITEN de avatar getekend, en
       een box-shadow telt niet mee in de afmetingen. Het blok dat gecentreerd
       wordt is dus korter dan wat je ziet: bovenaan steekt de ring eruit,
       onderaan houdt de naam op waar zijn regel ophoudt. Gevolg: de inhoud
       staat een halve ring te hoog. Dat is precies wat de eigenaar op
       26 augustus 2026 meldde ("ik heb nu het idee dat hij iets te ver naar
       boven staat"), en het is nagemeten:

         midden van de kaart          443,2
         midden van wat je ziet       441,7   (ringbovenkant tot naamonderkant)
         afwijking                     -1,5   = de helft van de ring

       De correctie zit in de binnenmarge en niet in een marge op de inhoud, en
       dat is geen smaak: de SOM van boven en onder blijft 8px, dus de kaart
       wordt er geen pixel hoger van. Dat luistert nauw -- zie de rekensom bij
       getGridOptions hieronder, waar deze kaart op 55 van de 56 uitkomt. */
    .card {
      height: 100%;
      padding: calc(4px + var(--dac-ring) / 2) 10px calc(4px - var(--dac-ring) / 2);
      display: flex; flex-direction: column; justify-content: center;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .chips {
      display: grid; gap: 6px;
      grid-template-columns: repeat(var(--cols, 6), minmax(0, 1fr));
    }
    .p {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 0 2px; background: none; border: 0; cursor: pointer;
      font: inherit; color: inherit; border-radius: var(--dac-radius-sm);
      transition: background 200ms ease;
    }
    @media (hover: hover) { .p:hover { background: var(--dac-surface); } }
    .nm {
      font-size: 11px; font-weight: 500; line-height: 1.15; text-align: center;
      max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .av {
      position: relative; flex: 0 0 auto;
      width: 28px; height: 28px; border-radius: 50%;
      display: grid; place-items: center; overflow: hidden;
      font-size: 12px; font-weight: 600;
      color: var(--dac-ink); background: var(--dac-surface-hi);
      /* Ring buiten de avatar getekend, zodat een foto er nooit door bijgesneden
         wordt. Dunner dan hij was: de ring steekt buiten de avatar uit en zou
         bij deze maten tegen de naam eronder aan komen te staan. */
      box-shadow: 0 0 0 1.5px var(--dac-bg), 0 0 0 var(--dac-ring) var(--tone);
    }
    .av img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .av .icon { width: 55%; height: 55%; color: var(--dac-ink-2); }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `);var wa=class extends D{setConfig(e){let t={...e},n=(e.persons??[]).map(i=>typeof i=="string"?{entity:i}:i);t.persons=n.map(i=>i.entity);for(let i of n)i.name&&(t[`naam:${i.entity}`]=i.name);super.setConfig(t)}serialize(e){let t={...e},n=t.persons??[];t.persons=n.map(i=>{let r=t[`naam:${i}`];return r?{entity:i,name:r}:i});for(let i of Object.keys(t))i.startsWith("naam:")&&delete t[i];return t}schema(){let e=(this.config_?.persons??[]).filter(t=>typeof t=="string");return[{name:"persons",selector:{entity:{domain:["person","device_tracker"],multiple:!0}}},...e.map(t=>({name:`naam:${t}`,selector:_.text()}))]}label(e){if(e.name==="persons")return"Personen";if(e.name.startsWith("naam:")){let t=e.name.slice(5);return`Naam voor ${this.hass?.states?.[t]?.attributes?.friendly_name??t}`}return super.label(e)}helper(e){if(e.name==="persons")return"Thuis is groen, weg is rood, geen melding is oranje. Per persoon kun je hieronder een eigen naam zetten."}};I("domotiapp-person-card-editor",wa);N("domotiapp-person-card",Qt,{name:"DomotiApp Personen",description:"Wie er thuis is, compact. Het hele huishouden in \xE9\xE9n kaart."});var Sl=[[/gft|groente|tuin|organi/i,"teal","binWheeled"],[/pmd|plastic|verpakking/i,"solar","binWheeled"],[/papier|karton/i,"water","binWheeled"],[/rest|grijs/i,"neutral","binWheeled"],[/textiel|kleding/i,"pink","bin"],[/glas/i,"magenta","bin"],[/kerstboom|snoei|takken/i,"teal","bin"]];function Ol(a){for(let[e,t,n]of Sl)if(e.test(a))return{tone:t,icon:n};return{tone:"accent",icon:"bin"}}var yr=a=>String(a??"").replace(/^(afvalbeheer|afvalwijzer|mijnafvalwijzer)\s*/i,"").replace(/\s*(mijnafvalwijzer)\s*/i," ").trim(),Yt=class extends A{validate(e){let t=e.sensors??e.entities??(e.entity?[e.entity]:[]);return t.length?{show_hero:!0,show_list:!0,...e,sensors:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[T]:"Kies minstens \xE9\xE9n afvalsensor waarvan de status een datum is."}}watched(){return this.config.sensors.map(e=>e.entity)}read_(){let e=new Date;return this.config.sensors.map(t=>{let n=k(this.hass,t.entity);if(!n)return null;let i=et(n.state)??et(n.attributes.date)??et(n.attributes.next_date);if(!i)return null;let r=t.label??yr(C(this.hass,t.entity,t.name)),o=Ol(t.label??t.entity+r),s=this.config.tones?.[t.entity];return{label:r,date:i,days:$n(e,i),tone:B(s??t.tone??o.tone),icon:t.icon??o.icon}}).filter(t=>t&&t.days>=0).sort((t,n)=>t.date-n.date)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`
      <div class="card surface">
        ${e.title?`<div class="head"><b>${e.title}</b></div>`:""}
        ${e.show_hero===!1?"":`<div class="hero" hidden>
          <span class="bin"></span>
          <span class="what">
            <span class="eyebrow"></span>
            <span class="big"></span>
          </span>
          <span class="when"><span class="n tnum"></span><span class="eyebrow u"></span></span>
        </div>`}
        ${e.show_list===!1?"":'<div class="list"></div>'}
        <div class="empty" hidden>Geen ophaaldata gevonden. Controleer of de gekozen sensoren een datum als toestand hebben.</div>
      </div>`}paint(){let e=this.read_(),t=this.$(".hero"),n=this.$(".list"),i=this.$(".empty");if(i.hidden=e.length>0,t&&(t.hidden=e.length===0,e.length)){let r=e[0];t.style.setProperty("--tone",r.tone),this.setAttribute("urgency",r.days===0?"today":r.days===1?"tomorrow":"later");let o=t.querySelector(".bin");o.dataset.icon!==r.icon&&(o.dataset.icon=r.icon,o.innerHTML=f(r.icon,"bin")),this.text(t.querySelector(".eyebrow"),An(r.date)),this.text(t.querySelector(".big"),r.label),this.text(t.querySelector(".n"),r.days===0?"nu":String(r.days)),this.text(t.querySelector(".u"),r.days===0?"aan de weg":r.days===1?"dag":"dagen")}if(n){let r=this.config.show_hero===!1?e:e.slice(1),o=r.map(s=>`${s.label}${+s.date}`).join("|");if(n.dataset.sig===o)return;n.dataset.sig=o,n.innerHTML=r.map(s=>{let d=An(s.date),l=s.days<=6?`<small>${ji(s.date)}</small>`:"";return`
        <div class="r" style="--tone:${s.tone}">
          <i></i><span>${s.label}</span>
          <span class="d">${d}${l}</span>
        </div>`}).join("")}}rows_(){let e=this.config?.sensors?.length??1;return this.config?.show_list===!1?1:this.config?.show_hero===!1?Math.max(1,me(20+e*33)):Math.max(2,e)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-waste-card-editor")}static getStubConfig(e){return{sensors:Object.keys(e?.states??{}).filter(n=>/afval|waste|trash|garbage|ophaal/i.test(n)&&n.startsWith("sensor.")).filter(n=>et(e.states[n]?.state)).slice(0,6),title:"Afvalkalender"}}};j(Yt,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; padding: 10px 12px;
      display: flex; flex-direction: column; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ---- hero ---- */
    .hero {
      display: flex; align-items: center; gap: 12px; flex: 0 0 auto;
      min-height: 56px; padding: 8px 12px; border-radius: var(--dac-radius-sm);
      background: color-mix(in srgb, var(--tone) 11%, transparent);
      border: 1px solid color-mix(in srgb, var(--tone) 34%, transparent);
    }
    .hero .bin {
      width: 40px; height: 40px; flex: 0 0 auto; display: grid; place-items: center;
      border-radius: var(--dac-radius-sm); color: var(--tone);
      background: color-mix(in srgb, var(--tone) 18%, transparent);
    }
    .hero .bin .icon, .hero .bin ha-icon { width: 21px; height: 21px; --mdc-icon-size: 21px; }
    .hero .what { min-width: 0; }
    .hero .big {
      font-size: 18px; font-weight: 500; letter-spacing: -.02em; line-height: 1.15;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .hero .when {
      margin-left: auto; text-align: right; flex: 0 0 auto;
      display: flex; align-items: baseline; gap: 5px;
    }
    .hero .when .n { font-size: 18px; font-weight: 500; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }

    /* Today and tomorrow are the only two states that need to shout. */
    :host([urgency="today"]) .hero { animation: pulse 2.6s ease-in-out infinite; }
    @keyframes pulse {
      0%, 100% { border-color: color-mix(in srgb, var(--tone) 34%, transparent); }
      50%      { border-color: color-mix(in srgb, var(--tone) 72%, transparent); }
    }

    /* ---- list ---- */
    .list { flex: 1 1 auto; display: flex; flex-direction: column; }
    .r {
      display: grid; grid-template-columns: 10px 1fr auto; gap: 12px; align-items: center;
      flex: 1 1 auto; min-height: 32px; padding: 0 2px; font-size: 13px;
    }
    .r + .r { border-top: 1px solid var(--dac-border); }
    .r i { width: 10px; height: 10px; border-radius: 3px; background: var(--tone); }
    .r .d { color: var(--dac-ink-2); font-variant-numeric: tabular-nums; text-align: right; }
    .r .d small { color: var(--dac-ink-3); margin-left: 6px; }

    .empty { padding: 18px 2px; font-size: 13px; color: var(--dac-ink-3); }
  `);var ya=class extends D{defaults(){return{show_hero:!0,show_list:!0}}setConfig(e){let t={...e};for(let[n,i]of Object.entries(e.tones??{}))t[`kleur:${n}`]=i;delete t.tones,super.setConfig(t)}serialize(e){let t={...e},n={};for(let i of Object.keys(t))i.startsWith("kleur:")&&(t[i]&&(n[i.slice(6)]=t[i]),delete t[i]);return Object.keys(n).length?t.tones=n:delete t.tones,t}ids_(){return(this.config_?.sensors??[]).map(e=>typeof e=="string"?e:e.entity).filter(Boolean)}pickers(){return this.ids_().map(e=>({key:`kleur:${e}`,kind:"tone",label:`Kleur voor ${yr(this.hass?.states?.[e]?.attributes?.friendly_name??e)||e}`,compact:!0,after:!0}))}schema(){return[{name:"sensors",selector:{entity:{domain:"sensor",multiple:!0}}}]}label(e){return{sensors:"Afvalsensoren",show_hero:"Eerstvolgende uitlichten",show_list:"Overige data tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="sensors")return"Sensoren waarvan de status een datum is, bijvoorbeeld 18-08-2026. De kaart sorteert zelf; laat een kleur leeg om de bakkleur op de naam te laten kiezen."}};I("domotiapp-waste-card-editor",ya);N("domotiapp-waste-card",Yt,{name:"DomotiApp Afvalkalender",description:"Eerstvolgende ophaling als hero, de rest eronder. Kleur per fractie."});function Ce(a){if(a==null||a==="")return 4;let e=Math.round(Number(a));return Number.isFinite(e)?Math.min(6,Math.max(2,e)):4}function Jt(a,e=!0){if(typeof a=="string")return{name:"",icon:"",path:a,action:null,items:[]};let t=a??{};return{name:typeof t.name=="string"?t.name:"",icon:typeof t.icon=="string"?t.icon:"",path:typeof t.path=="string"?t.path:typeof t.url=="string"?t.url:typeof t.navigation_path=="string"?t.navigation_path:"",action:t.action&&typeof t.action=="object"?{...t.action}:null,items:e&&Array.isArray(t.items)?t.items.slice(0,8).map(n=>Jt(n,!1)):[]}}var $e=a=>Array.isArray(a?.items)?a.items.filter(Ae):[],zr=a=>$e(a).length>0,Ae=a=>!!(a&&(a.name?.trim()||a.icon?.trim()||a.path?.trim()||a.action));function jr(a){return(Array.isArray(a?.items)?a.items:[]).slice(0,20).map(t=>Jt(t))}var Er=[{id:"domotitech",label:"DomotiTech",uitleg:"Opent domotitech.nl in een nieuw tabblad, met het logo erop.",bovenaan:!0,maak:()=>({name:"DomotiTech",icon:"domotitech",path:"https://domotitech.nl",action:null,items:[]})},{id:"herstart",label:"Herstart Home Assistant",uitleg:"Roept homeassistant.restart aan, met een bevestiging ervoor.",bovenaan:!0,maak:()=>({name:"Herstart",icon:"power",path:"",action:{action:"perform-action",perform_action:"homeassistant.restart",confirmation:{title:"Weet je het zeker?",text:"Weet je het zeker dat je Home Assistant wilt herstarten?"}},items:[]})}];function $r(a,e,t=!1){let n=Array.isArray(a)?[...a]:[];if(n.length>=8)return{lijst:n,plek:-1};let i=t?0:n.length;return n.splice(i,0,e),{lijst:n,plek:i}}function en(a,e=4){let t=(a??[]).filter(Ae),n=Ce(e);if(t.length<=n)return{balk:t,meer:[],heeftMeer:!1};let i=Math.max(1,n-1);return{balk:t.slice(0,i),meer:t.slice(i),heeftMeer:!0}}function za(a){if(a&&typeof a=="object")return a.action?a.action:za(a.path);let e=String(a??"").trim();return e?/^[a-z][a-z0-9+.-]*:\/\//i.test(e)||e.startsWith("mailto:")?{action:"url",url_path:e}:{action:"navigate",navigation_path:e}:{action:"none"}}var Tl=`
  .dac-nav { display: flex; flex-direction: column; gap: 12px; }

  .dac-nav .knoppen { display: flex; flex-direction: column; gap: 8px; }

  .dac-nav .item {
    border: 1px solid var(--divider-color); border-radius: 12px;
    background: var(--card-background-color); overflow: hidden;
  }
  .dac-nav .item[open] { border-color: var(--primary-color); }

  .dac-nav .item > summary {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 8px 8px 12px; cursor: pointer; list-style: none;
  }
  .dac-nav .item > summary::-webkit-details-marker { display: none; }
  .dac-nav .item[open] > summary { border-bottom: 1px solid var(--divider-color); }
  .dac-nav .item > summary:hover { background: rgba(127,127,127,.06); }

  .dac-nav .voor {
    flex: 0 0 auto; width: 30px; height: 30px; display: grid; place-items: center;
    border-radius: 9px; background: rgba(127,127,127,.14); color: var(--primary-color);
  }
  .dac-nav .voor svg, .dac-nav .voor ha-icon, .dac-nav .voor img {
    width: 17px; height: 17px; --mdc-icon-size: 17px;
  }

  .dac-nav .titel { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
  .dac-nav .titel b {
    font-size: 13px; font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-nav .titel small {
    font-size: 11.5px; color: var(--secondary-text-color);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-nav .item[data-leeg="true"] .titel b {
    font-weight: 500; font-style: italic; color: var(--secondary-text-color);
  }

  .dac-nav .rondknop {
    flex: 0 0 auto; width: 28px; height: 28px; display: grid; place-items: center;
    cursor: pointer; border: 0; background: transparent; border-radius: 999px;
    color: var(--secondary-text-color); font-size: 15px; line-height: 1;
  }
  .dac-nav .rondknop:hover { background: rgba(127,127,127,.16); }
  .dac-nav .rondknop:disabled { opacity: .3; cursor: default; }
  .dac-nav .rondknop:disabled:hover { background: transparent; }
  .dac-nav .weg:hover { color: var(--error-color, #d03b3b); }

  .dac-nav .body { padding: 10px; display: flex; flex-direction: column; gap: 10px; }

  /* De grens tussen wat in de balk staat en wat achter Meer valt. */
  .dac-nav .grens {
    display: flex; align-items: center; gap: 10px;
    margin: 2px 0; font-size: 11px; font-weight: 600; letter-spacing: .1em;
    text-transform: uppercase; color: var(--secondary-text-color);
  }
  .dac-nav .grens::after {
    content: ""; flex: 1 1 auto; height: 1px; background: var(--divider-color);
  }

  .dac-nav .toevoegen {
    padding: 13px; cursor: pointer; font: inherit; font-size: 14px; font-weight: 500;
    border: 1px dashed var(--divider-color); border-radius: 12px;
    background: transparent; color: var(--primary-color); text-align: center;
  }
  .dac-nav .toevoegen:hover { background: rgba(127,127,127,.08); }
  .dac-nav .toevoegen:disabled { opacity: .4; cursor: default; }

  .dac-nav .uitleg {
    margin: 0; font-size: 12px; line-height: 1.45; color: var(--secondary-text-color);
  }

  /* ---- de subknoppen van een knop ---- */

  .dac-nav .subkop {
    display: flex; align-items: center; gap: 8px;
    margin-top: 2px; font-size: 11px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; color: var(--secondary-text-color);
  }
  .dac-nav .subkop::after {
    content: ""; flex: 1 1 auto; height: 1px; background: var(--divider-color);
  }

  .dac-nav .sublijst { display: flex; flex-direction: column; gap: 6px; }

  .dac-nav .sub {
    border: 1px solid var(--divider-color); border-radius: 10px;
    background: rgba(127,127,127,.05); overflow: hidden;
  }
  .dac-nav .sub > summary {
    display: flex; align-items: center; gap: 9px;
    padding: 6px 6px 6px 10px; cursor: pointer; list-style: none;
    font-size: 12.5px;
  }
  .dac-nav .sub > summary::-webkit-details-marker { display: none; }
  .dac-nav .sub[open] > summary { border-bottom: 1px solid var(--divider-color); }
  .dac-nav .sub > summary:hover { background: rgba(127,127,127,.06); }
  .dac-nav .sub .voor { width: 24px; height: 24px; border-radius: 7px; }
  .dac-nav .sub .voor svg, .dac-nav .sub .voor ha-icon, .dac-nav .sub .voor img {
    width: 14px; height: 14px; --mdc-icon-size: 14px;
  }
  .dac-nav .sub .body { padding: 8px; gap: 8px; }

  .dac-nav .subtoevoegen {
    padding: 9px; cursor: pointer; font: inherit; font-size: 13px;
    border: 1px dashed var(--divider-color); border-radius: 10px;
    background: transparent; color: var(--primary-color); text-align: center;
  }
  .dac-nav .subtoevoegen:hover { background: rgba(127,127,127,.08); }
  .dac-nav .subtoevoegen:disabled { opacity: .4; cursor: default; }

  /* ---- het keuzemenu achter "Subknop toevoegen" ----
     Een gewone details/summary en geen ha-button-menu: dit moet het ook doen
     als Home Assistant zijn menu-element nog niet geladen heeft, en een lijst
     die openklapt is hier net zo duidelijk. */
  .dac-nav .subkeuze { position: relative; }
  .dac-nav .subkeuze > summary {
    display: block; list-style: none;
    padding: 9px; cursor: pointer; font-size: 13px;
    border: 1px dashed var(--divider-color); border-radius: 10px;
    color: var(--primary-color); text-align: center;
  }
  .dac-nav .subkeuze > summary::-webkit-details-marker { display: none; }
  .dac-nav .subkeuze > summary:hover { background: rgba(127,127,127,.08); }
  .dac-nav .subkeuze[vol] > summary { opacity: .4; pointer-events: none; }

  .dac-nav .keuzes {
    display: flex; flex-direction: column; gap: 4px;
    margin-top: 6px; padding: 6px;
    border: 1px solid var(--divider-color); border-radius: 10px;
    background: var(--card-background-color);
  }
  .dac-nav .keuzes button {
    display: flex; align-items: center; gap: 10px; width: 100%;
    padding: 8px 10px; cursor: pointer; text-align: left; font: inherit;
    border: 0; border-radius: 8px; background: transparent;
    color: var(--primary-text-color);
  }
  .dac-nav .keuzes button:hover { background: rgba(127,127,127,.1); }
  .dac-nav .keuzes .voor {
    flex: 0 0 auto; width: 26px; height: 26px; display: grid; place-items: center;
    border-radius: 8px; background: rgba(127,127,127,.12);
  }
  .dac-nav .keuzes .voor svg, .dac-nav .keuzes .voor ha-icon,
  .dac-nav .keuzes .voor img {
    width: 16px; height: 16px; --mdc-icon-size: 16px;
  }
  .dac-nav .keuzes .tekst { display: flex; flex-direction: column; min-width: 0; }
  .dac-nav .keuzes .tekst b { font-size: 13px; font-weight: 500; }
  .dac-nav .keuzes .tekst small { font-size: 11.5px; color: var(--secondary-text-color); }
`,Ar=/^i(\d+)(s\d+)?$/,Mr=a=>({...a.name?{name:a.name}:{},...a.icon?{icon:a.icon}:{},...a.path?{path:a.path}:{},...a.action?{action:structuredClone(a.action)}:{}}),Sr=a=>a.filter(Ae).map(e=>{let t=(e.items??[]).filter(Ae).map(Mr);return{...Mr(e),...t.length?{items:t}:{}}}),ja=class extends HTMLElement{constructor(){super(),this.items_=[],this.rest_={},this.open_=new Set}setConfig(e){if(this.rest_={...e},delete this.rest_.items,this.gebouwd_&&e===this.uitObject_)return;let t=(Array.isArray(e?.items)?e.items:[]).map(n=>Jt(n));this.gebouwd_&&JSON.stringify(Sr(t))===this.uit_||(this.items_=t,this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}connectedCallback(){this.gebouwd_||this.build_()}async build_(){if(!this.hass_)return;await customElements.whenDefined("ha-form"),this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=Tl;let t=document.createElement("div");t.className="dac-nav",this.append(e,t),t.appendChild(this.kaartBlok_());let n=document.createElement("div");n.className="knoppen",t.appendChild(n);let{balk:i}=en(this.items_,this.rest_.max),r=i.length,o=this.items_.filter(Ae);if(this.items_.forEach((d,l)=>{if(o.indexOf(d)===r&&o.length>r){let p=document.createElement("div");p.className="grens",p.textContent="Achter de meer-knop",n.appendChild(p)}n.appendChild(this.itemBlok_(d,l))}),!this.items_.length){let d=document.createElement("p");d.className="uitleg",d.textContent="Elke knop heeft een naam, een icoon en een pad -- bijvoorbeeld /lovelace/keuken voor een view op dit dashboard, of #keuken voor een pop-up. Wat er niet meer in de balk past valt vanzelf achter de meer-knop rechts.",t.appendChild(d)}let s=document.createElement("button");s.type="button",s.className="toevoegen",s.textContent="\uFF0B  Knop toevoegen",s.disabled=this.items_.length>=20,s.addEventListener("click",()=>{this.items_.push({name:"",icon:"",path:""}),this.open_.add(`i${this.items_.length-1}`),this.emit_(),this.build_()}),t.appendChild(s)}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"max",selector:{number:{min:2,max:6,step:1,mode:"box"}}},{name:"labels",selector:{boolean:{}}},{name:"bare",selector:{boolean:{}}}],e.computeLabel=t=>({max:"Knoppen in de balk",labels:"Namen onder de iconen",bare:"Achtergrond weglaten"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="max")return`De meer-knop telt zelf mee. Staan er meer knoppen dan dit, dan komen de eerste ${Ce(this.rest_.max)-1} in de balk en valt de rest achter "Meer".`;if(t.name==="labels")return"Uit geeft een rij kale iconen. Dan passen er meer naast elkaar op een telefoon.";if(t.name==="bare")return"Haalt de pil onder de balk weg: alleen de iconen blijven over, zwevend boven het dashboard."},e.data={max:Ce(this.rest_.max),labels:this.rest_.labels!==!1,bare:!!this.rest_.bare},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{};this.rest_.max=Ce(n.max),n.labels===!1?this.rest_.labels=!1:delete this.rest_.labels,n.bare?this.rest_.bare=!0:delete this.rest_.bare,this.emit_(),this.build_()}),e}itemBlok_(e,t){let n=document.createElement("details");n.className="item",this.onthoud_(n,`i${t}`);let i=document.createElement("summary"),r=document.createElement("span");r.className="voor";let o=document.createElement("span");o.className="titel";let s=document.createElement("b"),d=document.createElement("small");o.append(s,d);let l=()=>{let v=!Ae(e);n.dataset.leeg=String(v),r.innerHTML=f(e.icon,"grid"),s.textContent=e.name||(v?"Nieuwe knop":e.path||"Zonder naam");let y=$e(e).length;d.textContent=y?`Menu met ${y} knop${y===1?"":"pen"}`:e.path?e.path:e.icon?`${_e(e.icon)} -- nog geen pad`:"Nog geen pad"};l(),this.koppen_.push(l);let c=this.kopKnop_("Omhoog",E.arrowUp,()=>this.verplaats_(t,-1));c.disabled=t===0;let p=this.kopKnop_("Omlaag",E.arrowDown,()=>this.verplaats_(t,1));p.disabled=t===this.items_.length-1;let h=this.kopKnop_("Verwijderen",E.close,()=>this.verwijder_(t));h.classList.add("weg"),i.append(r,o,c,p,h),n.appendChild(i);let g=document.createElement("div");g.className="body";let m=document.createElement("dac-icon-picker");m.label="Icoon",m.fallback="grid",m.auto=!1,m.hass=this.hass_,m.value=e.icon,m.addEventListener("value-changed",v=>{v.stopPropagation(),e.icon=v.detail.value??"",this.emit_()});let b=document.createElement("ha-form");return b.hass=this.hass_,b.schema=[{name:"name",selector:{text:{}}},{name:"path",selector:{text:{}}}],b.computeLabel=v=>({name:"Naam",path:"Waar gaat hij heen"})[v.name]??v.name,b.computeHelper=v=>{if(v.name!=="path")return;let y="/lovelace/keuken voor een view, #keuken voor een pop-up van bubble-card, of een https-adres voor iets buiten Home Assistant.";return zr(e)?`${y}

Deze knop heeft subknoppen en klapt dus open in plaats van ergens heen te gaan; zijn eigen pad wordt niet gebruikt.`:y},b.data={name:e.name,path:e.path},b.addEventListener("value-changed",v=>{v.stopPropagation();let y=v.detail.value??{};e.name=y.name??"",e.path=y.path??"",this.emit_()}),g.append(m,b,...this.subBlok_(e,t)),n.appendChild(g),n}subBlok_(e,t){Array.isArray(e.items)||(e.items=[]);let n=document.createElement("div");n.className="subkop",n.textContent="Subknoppen";let i=document.createElement("div");i.className="sublijst",e.items.forEach((s,d)=>i.appendChild(this.subItemBlok_(e,s,t,d)));let r=this.subKeuze_(e,t),o=document.createElement("p");return o.className="uitleg",o.textContent="Hangt hier iets onder, dan klapt deze knop een menu open BOVEN zichzelf in plaats van ergens heen te gaan. Valt de knop zelf achter de meer-knop, dan staan zijn subknoppen daar ingesprongen onder hem.",[n,i,r,o]}subKeuze_(e,t){let n=document.createElement("details");n.className="subkeuze",e.items.length>=8&&n.setAttribute("vol","");let i=document.createElement("summary");i.textContent="\uFF0B  Subknop toevoegen",n.appendChild(i);let r=document.createElement("div");r.className="keuzes",n.appendChild(r);let o=(s,d)=>{let{lijst:l,plek:c}=$r(e.items,s,d);c<0||(e.items=l,this.open_.add(`i${t}`),this.open_.add(`i${t}s${c}`),this.emit_(),this.build_(),requestAnimationFrame(()=>{this.querySelectorAll("details.sub")[c]?.scrollIntoView({block:"nearest"})}))};r.appendChild(this.keuzeKnop_("plus","Lege subknop","Zelf een naam, een icoon en een pad invullen.",()=>o({name:"",icon:"",path:"",action:null,items:[]},!1)));for(let s of Er){let d=s.maak();r.appendChild(this.keuzeKnop_(d.icon,s.label,s.uitleg,()=>o(s.maak(),s.bovenaan)))}return n}keuzeKnop_(e,t,n,i){let r=document.createElement("button");r.type="button";let o=document.createElement("span");o.className="voor",o.innerHTML=f(e,"plus");let s=document.createElement("span");s.className="tekst";let d=document.createElement("b");d.textContent=t;let l=document.createElement("small");return l.textContent=n,s.append(d,l),r.append(o,s),r.addEventListener("click",i),r}subItemBlok_(e,t,n,i){let r=document.createElement("details");r.className="sub",this.onthoud_(r,`i${n}s${i}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="voor";let d=document.createElement("span");d.className="titel";let l=document.createElement("b"),c=document.createElement("small");d.append(l,c);let p=()=>{s.innerHTML=f(t.icon,"grid"),l.textContent=t.name||(Ae(t)?t.path||"Zonder naam":"Nieuwe subknop"),c.textContent=t.action?`Roept ${t.action.perform_action??t.action.service??t.action.action} aan`:t.path||"Nog geen pad"};p(),this.koppen_.push(p);let h=this.kopKnop_("Omhoog",E.arrowUp,()=>this.verplaatsSub_(e,n,i,-1));h.disabled=i===0;let g=this.kopKnop_("Omlaag",E.arrowDown,()=>this.verplaatsSub_(e,n,i,1));g.disabled=i===e.items.length-1;let m=this.kopKnop_("Verwijderen",E.close,()=>this.verwijderSub_(e,n,i));m.classList.add("weg"),o.append(s,d,h,g,m),r.appendChild(o);let b=document.createElement("div");b.className="body";let v=document.createElement("dac-icon-picker");v.label="Icoon",v.fallback="grid",v.auto=!1,v.hass=this.hass_,v.value=t.icon,v.addEventListener("value-changed",x=>{x.stopPropagation(),t.icon=x.detail.value??"",this.emit_()});let y=document.createElement("ha-form");return y.hass=this.hass_,y.schema=[{name:"name",selector:{text:{}}},{name:"path",selector:{text:{}}}],y.computeLabel=x=>({name:"Naam",path:"Waar gaat hij heen"})[x.name]??x.name,t.action&&(y.schema=[{name:"name",selector:{text:{}}}],y.computeHelper=x=>x.name==="name"?`Deze knop voert een actie uit (${t.action.perform_action??t.action.service??t.action.action}) en gaat dus nergens heen. Weg met de knop rechtsboven.`:void 0),y.data={name:t.name,path:t.path},y.addEventListener("value-changed",x=>{x.stopPropagation();let M=x.detail.value??{};t.name=M.name??"",t.path=M.path??"",this.emit_()}),b.append(v,y),r.appendChild(b),r}verplaatsSub_(e,t,n,i){let r=n+i;if(r<0||r>=e.items.length)return;[e.items[n],e.items[r]]=[e.items[r],e.items[n]];let o=this.open_.has(`i${t}s${n}`),s=this.open_.has(`i${t}s${r}`);this.open_.delete(`i${t}s${n}`),this.open_.delete(`i${t}s${r}`),s&&this.open_.add(`i${t}s${n}`),o&&this.open_.add(`i${t}s${r}`),this.emit_(),this.build_()}verwijderSub_(e,t,n){e.items.splice(n,1);let i=new Set;for(let r of this.open_){let o=/^i(\d+)s(\d+)$/.exec(r);if(!o||Number(o[1])!==t){i.add(r);continue}let s=Number(o[2]);s!==n&&i.add(`i${t}s${s>n?s-1:s}`)}this.open_=i,this.emit_(),this.build_()}kopKnop_(e,t,n){let i=document.createElement("button");return i.type="button",i.className="rondknop",i.title=e,i.setAttribute("aria-label",e),i.innerHTML=t,i.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),i.disabled||n()}),i}verplaats_(e,t){let n=e+t;n<0||n>=this.items_.length||([this.items_[e],this.items_[n]]=[this.items_[n],this.items_[e]],this.schuifOpen_(e,n),this.emit_(),this.build_())}verwijder_(e){this.items_.splice(e,1);let t=new Set;for(let n of this.open_){let i=Ar.exec(n);if(!i)continue;let r=Number(i[1]);r!==e&&t.add(`i${r>e?r-1:r}${i[2]??""}`)}this.open_=t,this.emit_(),this.build_()}schuifOpen_(e,t){let n=new Set;for(let i of this.open_){let r=Ar.exec(i);if(!r)continue;let o=Number(r[1]),s=r[2]??"";o===e?n.add(`i${t}${s}`):o===t?n.add(`i${e}${s}`):n.add(i)}this.open_=n}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}emit_(){let e=Sr(this.items_),t={...this.rest_,items:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_??[])n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};S("domotiapp-navbar-card-editor",ja);var Or=a=>a.parentElement??(a.parentNode&&a.parentNode.host)??null;function*ht(a){let e=Or(a),t=0;for(;e&&t++<40;)yield e,e=Or(e)}function Ll(a){for(let e of ht(a)){let t=e.tagName?.toLowerCase?.()??"";if(/(^|-)(edit|preview)/.test(t))return!0}return!1}function Dl(a){for(let e of ht(a))if(e.tagName?.toLowerCase?.()==="hui-card")return e;return null}function Hl(a){for(let e of ht(a))if(e.tagName?.toLowerCase?.()==="hui-section")return e;return null}function Il(a){for(let e of ht(a))if(e.classList?.contains?.("section"))return e;return null}function Nr(a){for(let e of ht(a)){let t=e.tagName?.toLowerCase?.()??"";if(t==="hui-view"||t.endsWith("-view"))return e}return null}var tn=class extends A{validate(e){let t=jr(e),n={labels:!0,tone:"accent",...e,items:t,max:Ce(e?.max)};return t.filter(i=>i.name||i.icon||i.path).length||(n[T]="Voeg knoppen toe in de editor: een naam, een icoon en waar hij heen gaat."),n}watched(){return[]}template(){let e=this.config;e.labels===!1&&this.setAttribute("geen-namen",""),e.bare&&this.setAttribute("bare","");let{balk:t,meer:n,heeftMeer:i}=en(e.items,e.max),r=e.items.filter(c=>c.name||c.icon||c.path),o=(c,p)=>{let g=$e(c).length?` data-menu="s${p}" aria-haspopup="true" aria-expanded="false"`:"";return`
      <button type="button" class="knop" data-i="${p}" title="${U(c.name)}"${g}>
        <span class="ico">${f(c.icon,"grid")}</span>
        <span class="naam">${U(c.name)}</span>
      </button>`},s=(c,p,h=null,g="")=>`
      <button type="button" class="regel${g?` ${g}`:""}" data-i="${p}"${h===null?"":` data-s="${h}"`}>
        <span class="mi">${f(c.icon,"grid")}</span>
        <span class="mt">${U(c.name||c.path)}</span>
      </button>`,d=n.map(c=>{let p=r.indexOf(c),h=$e(c);return h.length?`
      <div class="regel kop">
        <span class="mi">${f(c.icon,"grid")}</span>
        <span class="mt">${U(c.name||c.path)}</span>
      </div>`+h.map((m,b)=>s(m,p,b,"sub")).join(""):s(c,p)}).join(""),l=t.map(c=>{let p=$e(c);if(!p.length)return"";let h=r.indexOf(c);return`<div class="menu submenu" data-id="s${h}" role="menu">${p.map((g,m)=>s(g,h,m)).join("")}</div>`}).join("");return`
      <div class="balk" style="--tone:${B(e.tone)}">
        ${t.map(c=>o(c,r.indexOf(c))).join("")}
        ${i?`<button type="button" class="knop meer" data-menu="meer" aria-expanded="false" aria-haspopup="true">
                 <span class="ico">${E.dots}</span>
                 <span class="naam">Meer</span>
               </button>`:""}
        ${l}
        <div class="menu meermenu" data-id="meer" role="menu">
          ${d}
        </div>
      </div>`}wire(){for(let e of this.$$(".knop[data-i], .regel[data-i]"))e.dataset.menu||this.on(e,"click",()=>{this.sluitMenus_(),this.ga_(Number(e.dataset.i),e.dataset.s)});for(let e of this.$$("[data-menu]"))this.on(e,"click",t=>{t.stopPropagation(),this.wisselMenu_(e)});this.on(window,"pointerdown",e=>{if(!this.ietsOpen_())return;let t=e.composedPath?.()??[];[...this.$$(".menu[open]"),...this.$$("[data-menu]")].some(i=>t.includes(i))||this.sluitMenus_()},!0),this.on(window,"keydown",e=>{e.key==="Escape"&&this.ietsOpen_()&&this.sluitMenus_()}),this.on(window,"location-changed",()=>this.sluitMenus_())}paint(){}ga_(e,t){let n=this.config.items.filter(r=>r.name||r.icon||r.path)[e];if(!n)return;let i=t===void 0?n:$e(n)[Number(t)];i&&ue(this,this.hass,{},za(i))}ietsOpen_(){return!!this.$(".menu[open]")}menuVan_(e){return this.$$(".menu").find(t=>t.dataset.id===e.dataset.menu)??null}wisselMenu_(e){let t=this.menuVan_(e),n=!!t?.hasAttribute("open");this.sluitMenus_(),!(!t||n)&&(t.setAttribute("open",""),e.setAttribute("aria-expanded","true"),this.plaatsMenu_(t,e))}sluitMenus_(){for(let e of this.$$(".menu[open]"))e.removeAttribute("open");for(let e of this.$$("[data-menu]"))e.setAttribute("aria-expanded","false")}plaatsMenu_(e,t){if(!e.classList.contains("submenu"))return;let n=this.$(".balk")?.getBoundingClientRect(),i=t.getBoundingClientRect();if(!n?.width)return;let r=e.offsetWidth/2,o=i.left+i.width/2-n.left,s=r+6,d=n.width-r-6,l=d<s?n.width/2:Math.min(Math.max(o,s),d);e.style.setProperty("--x",`${Math.round(l)}px`)}connectedCallback(){super.connectedCallback(),requestAnimationFrame(()=>this.plaats_())}disconnectedCallback(){super.disconnectedCallback(),this.herstel_()}plaats_(){if(!this.isConnected||!this.config)return;if(Ll(this)){this.setAttribute("in-editor","");return}this.removeAttribute("in-editor");let e=Dl(this);this.klapIn_(e);let t=e?.parentElement;t?.classList?.contains?.("card")&&this.klapIn_(t);let n=Hl(this);n?.config?.cards?.length===1&&this.klapIn_(Il(n));let i=Nr(this),r=this.$(".balk");if(i&&r&&!this.viewStijl_){this.view_=i,this.viewStijl_=i.style.paddingBottom??"";let o=Math.round(r.getBoundingClientRect().height)||62;i.style.paddingBottom=`${o+32}px`}this.meetMidden_(),i&&!this.waarnemer_&&(this.waarnemer_=new ResizeObserver(()=>this.meetMidden_()),this.waarnemer_.observe(i))}meetMidden_(){let e=this.view_??Nr(this);if(!e)return;let t=e.getBoundingClientRect();t.width&&this.style.setProperty("--dac-nav-mid",`${Math.round(t.left+t.width/2)}px`)}klapIn_(e){e&&(this.ingeklapt_??=new Map,!this.ingeklapt_.has(e)&&(this.ingeklapt_.set(e,e.getAttribute("style")),e.style.position="absolute",e.style.width="0",e.style.height="0",e.style.minHeight="0",e.style.margin="0",e.style.padding="0",e.style.overflow="visible"))}herstel_(){this.waarnemer_?.disconnect(),this.waarnemer_=null;for(let[e,t]of this.ingeklapt_??[])t?e.setAttribute("style",t):e.removeAttribute("style");this.ingeklapt_=null,this.view_&&(this.view_.style.paddingBottom=this.viewStijl_||"",this.view_=null,this.viewStijl_=null)}getCardSize(){return 1}getGridOptions(){return{columns:"full",rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-navbar-card-editor")}static getStubConfig(){return{items:[{name:"Thuis",icon:"house",path:""},{name:"Licht",icon:"bulb",path:""},{name:"Media",icon:"music",path:""},{name:"Instellingen",icon:"cog",path:""}],max:4,labels:!0}}};j(tn,"css",`
    :host { display: block; }

    /* ------------------------------------------------------------ de balk */

    .balk {
      position: fixed;
      z-index: 5;
      left: 8px; right: 8px;
      bottom: calc(10px + env(safe-area-inset-bottom, 0px));

      display: flex; align-items: center; justify-content: center;
      gap: 2px;
      padding: 5px;

      background: color-mix(in srgb, var(--dac-bg-raise) 88%, transparent);
      border: 1px solid var(--dac-border);
      /* Dezelfde hoek als elke andere losse kaart in de familie, en niet een
         pil. Een balk met een andere ronding dan de kaarten erboven leest als
         iets dat er niet bij hoort -- gemeld op 26 augustus 2026. */
      border-radius: var(--dac-radius);
      box-shadow: 0 20px 44px -20px rgba(0, 0, 0, .92),
                  0 1px 0 rgba(255, 255, 255, .04) inset;
      /* Achter een halfdoorzichtige balk hoort iets te bewegen, anders is hij
         gewoon donkergrijs. Valt vanzelf weg waar de browser het niet kan. */
      backdrop-filter: blur(16px) saturate(140%);
      -webkit-backdrop-filter: blur(16px) saturate(140%);
    }

    /* Vanaf een tablet is randbreed te breed: dan wordt het een pil die zo
       breed is als zijn knoppen, gecentreerd onderaan. */
    @media (min-width: 620px) {
      .balk {
        /* --dac-nav-mid wordt gemeten en gezet in plaats_(): het midden van de
           VIEW, niet van het venster. De zijbalk van Home Assistant hoort niet
           bij de pagina, en een pil die daar overheen gecentreerd staat, staat
           scheef boven de kaarten. Valt terug op het venstermidden zolang er
           nog niets gemeten is. */
        left: var(--dac-nav-mid, 50vw); right: auto;
        transform: translateX(-50%);
        width: max-content; max-width: calc(100vw - 32px);
        bottom: calc(16px + env(safe-area-inset-bottom, 0px));
      }
    }

    /* De vulling en het waas gaan weg, de rand blijft -- zie theme.js. */
    :host([bare]) .balk {
      background: none; box-shadow: none;
      backdrop-filter: none; -webkit-backdrop-filter: none;
    }

    /* In de bewerkmodus en in het voorbeeld staat de balk gewoon in zijn vak,
       zodat je hem kunt aanklikken en slepen. */
    :host([in-editor]) .balk {
      position: relative; inset: auto; transform: none;
      width: 100%; max-width: none; bottom: auto;
      backdrop-filter: none; -webkit-backdrop-filter: none;
    }

    /* ---------------------------------------------------------- de knoppen */

    .knop {
      flex: 1 1 0; min-width: 0;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 2px;
      padding: 7px 6px;
      border: 0; border-radius: var(--dac-radius-pill);
      background: none; cursor: pointer;
      font: inherit; color: var(--dac-ink-2);
      -webkit-tap-highlight-color: transparent;
      transition: background 160ms ease, color 160ms ease;
    }
    @media (min-width: 620px) {
      .knop { flex: 0 0 auto; min-width: 66px; }
    }
    @media (hover: hover) { .knop:hover { background: var(--dac-surface); color: var(--dac-ink); } }
    .knop:active { transform: scale(.96); }
    .knop[aria-expanded="true"] { background: var(--dac-surface-hi); color: var(--tone); }

    /* Bewust GEEN .chip: die klasse staat in theme.js en tekent een gevulde
       cirkel met een rand in de accentkleur. Dat is de vorm van een tegel, niet
       van een navigatieknop -- vier ringen naast elkaar leest als vier knoppen
       die aanstaan. Hier is het icoon zelf de knop. */
    .knop .ico { display: flex; color: var(--dac-ink); }
    @media (hover: hover) { .knop:hover .ico { color: var(--tone); } }
    .knop .icon, .knop ha-icon {
      width: 22px; height: 22px; --mdc-icon-size: 22px;
    }

    .knop .naam {
      max-width: 100%;
      font-size: 10.5px; font-weight: 500; line-height: 1.1; letter-spacing: -.01em;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    /* Zonder namen is het een rij iconen en mag de knop compacter. */
    :host([geen-namen]) .knop { padding: 9px 10px; }
    :host([geen-namen]) .knop .naam { display: none; }

    /* ------------------------------------------------------------- de menu's

       Er zijn er twee soorten, en ze delen alles behalve waar ze hangen:

       - het MEER-menu, rechts onder de meer-knop, met wat er niet in de balk
         paste. Dat was er al.
       - een SUBMENU, boven de knop waar je op tikte, met de knoppen die je daar
         zelf onder hebt gehangen. Dat is er sinds 26 augustus 2026 bij: de
         eigenaar miste "extra navigatie knoppen die boven de geklikte icon
         openen".

       Een submenu staat GECENTREERD boven zijn knop en niet aan een van de
       randen: dat is wat de tik aanwijst. De horizontale plek wordt gemeten en
       in --x gezet (plaatsMenu_), want die hangt af van waar de knop staat, en
       dat kan CSS niet weten. */

    .menu {
      position: absolute;
      bottom: calc(100% + 10px);
      min-width: 190px; max-width: min(280px, calc(100vw - 32px));
      max-height: min(60vh, 420px); overflow-y: auto;

      display: none; flex-direction: column; gap: 2px;
      padding: 6px;

      background: color-mix(in srgb, var(--dac-bg-raise) 96%, transparent);
      border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius);
      box-shadow: 0 24px 52px -20px rgba(0, 0, 0, .94);
      backdrop-filter: blur(16px) saturate(140%);
      -webkit-backdrop-filter: blur(16px) saturate(140%);
    }
    /* Het meer-menu hangt aan de rechterrand, want daar hangt zijn knop ook. */
    .menu.meermenu { right: 4px; }
    /* Een submenu hangt om --x heen. Zonder gemeten waarde valt hij op het
       midden van de balk terug -- dan staat hij misschien niet onder de goede
       knop, maar wel in beeld. */
    .menu.submenu { left: var(--x, 50%); transform: translateX(-50%); }

    .menu[open] { display: flex; }
    .menu.meermenu[open] { animation: opkomen 160ms ease-out; }
    .menu.submenu[open] { animation: opkomen-mid 160ms ease-out; }
    @keyframes opkomen {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: none; }
    }
    /* Een eigen animatie, want een submenu draagt al een transform om zich te
       centreren. Zou hij opkomen gebruiken, dan gooit de laatste stap
       (transform: none) die centrering weg en springt het menu naar rechts. */
    @keyframes opkomen-mid {
      from { opacity: 0; transform: translate(-50%, 6px); }
      to   { opacity: 1; transform: translate(-50%, 0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .menu[open] { animation: none; }
    }

    .regel {
      display: flex; align-items: center; gap: 11px;
      width: 100%; padding: 9px 10px;
      border: 0; border-radius: var(--dac-radius-sm);
      background: none; cursor: pointer; text-align: left;
      font: inherit; font-size: 13.5px; color: var(--dac-ink);
      -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) { .regel:hover { background: var(--dac-surface); } }
    .regel:active { background: var(--dac-surface-hi); }
    .regel .mi { display: flex; flex: 0 0 auto; color: var(--dac-ink); }
    .regel .icon, .regel ha-icon {
      width: 19px; height: 19px; --mdc-icon-size: 19px;
    }
    .regel .mt { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    /* Een subknop van een knop die zelf achter Meer viel. Die krijgt geen menu
       in een menu -- dat is navigeren in een boom -- maar staat ingesprongen
       onder zijn eigen knop. */
    .regel.sub { padding-left: 26px; font-size: 13px; color: var(--dac-ink-2); }
    .regel.sub .icon, .regel.sub ha-icon {
      width: 17px; height: 17px; --mdc-icon-size: 17px;
    }
    /* De knop waar die subknoppen onder hangen is zelf geen bestemming meer:
       hij is een kopje. */
    .regel.kop { font-weight: 600; }

    :focus-visible { outline: 2px solid var(--tone); outline-offset: 2px; }
  `);N("domotiapp-navbar-card",tn,{name:"DomotiApp Navbalk",description:`Vaste navigatiebalk onderaan het scherm, met een meer-menu voor wat er in de breedte niet bij past. ${2} tot ${6} knoppen in de balk.`});var Rl="dac-tabs:";function Aa(a){let e=a??{},t=typeof e.name=="string"?e.name:typeof e.title=="string"?e.title:"",n=Array.isArray(e.cards)?e.cards.filter(r=>r&&typeof r=="object"):[],i=n.length?n:e.card&&typeof e.card=="object"?[e.card]:[];return{name:t,icon:typeof e.icon=="string"?e.icon:"",cards:i}}var nn=a=>!!(a&&(a.name?.trim()||a.icon?.trim()||a.cards?.length));function Cr(a){return(Array.isArray(a?.tabs)?a.tabs:[]).slice(0,8).map(Aa).filter(nn)}function Vl(a,e){if(!e)return 0;let t=Math.round(Number(a?.default_tab));return!Number.isFinite(t)||t<1||t>e?0:t-1}function Ma(a){let e=(a??[]).map((t,n)=>(t?.name?.trim()||t?.icon?.trim()||`tab${n}`).toLowerCase()).join("|");return Rl+e}function Pl(a,e,t){let n=null;try{n=a?.getItem?.(e)??null}catch{return null}let i=Number(n);return n===null||n===""||!Number.isInteger(i)?null:i>=0&&i<t?i:null}function Tr(a,e,t){try{return a?.setItem?.(e,String(t)),!0}catch{return!1}}function Lr(a,e,t){return Pl(t,Ma(e),e.length)??Vl(a,e.length)}var Bl=[["tile","Tegel"],["entities","Entiteiten"],["button","Knop"],["gauge","Meter"],["history-graph","Geschiedenis"],["statistic","Statistiek"],["sensor","Sensorgrafiek"],["light","Lamp"],["thermostat","Thermostaat"],["humidifier","Luchtbevochtiger"],["media-control","Mediaspeler"],["weather-forecast","Weersverwachting"],["markdown","Tekst (Markdown)"],["picture","Afbeelding"],["picture-entity","Afbeelding met entiteit"],["glance","Overzicht"],["area","Ruimte"],["alarm-panel","Alarmpaneel"],["calendar","Agenda"],["todo-list","Takenlijst"],["map","Kaart"],["iframe","Webpagina"],["vertical-stack","Stapel (onder elkaar)"],["horizontal-stack","Stapel (naast elkaar)"],["grid","Raster"],["conditional","Voorwaardelijk"]];function Dr(){let a=(window.customCards??[]).filter(e=>e&&typeof e.type=="string").map(e=>({type:`custom:${e.type}`,naam:e.name||e.type,uitleg:e.description||"",eigen:!0}));return a.sort((e,t)=>{let n=e.type.startsWith("custom:domotiapp-")?0:1,i=t.type.startsWith("custom:domotiapp-")?0:1;return n-i||e.naam.localeCompare(t.naam,"nl")}),[...a,...Bl.map(([e,t])=>({type:e,naam:t,uitleg:"",eigen:!1}))]}function Hr(a,e){let t=String(e??"").trim().toLowerCase();return t?a.filter(n=>`${n.naam} ${n.type} ${n.uitleg}`.toLowerCase().includes(t)):a}async function Ir(a,e){let t={type:a};try{let n=await window.loadCardHelpers?.();try{n?.createCardElement?.(t)}catch{}let i=a.startsWith("custom:")?a.slice(7):`hui-${a}-card`,o=await customElements.get(i)?.getStubConfig?.(e,Object.keys(e?.states??{}),[]);if(o&&typeof o=="object")return{...o,type:a}}catch{}return t}var Rr=()=>!!customElements.get("hui-card-element-editor");function Kl(a){let e=a?.columns,t=a?.rows,n=12;if(e!=null&&e!=="full"){let o=Math.round(Number(e));n=Number.isFinite(o)?Math.min(12,Math.max(1,o)):12}let i={gridColumn:`span ${n}`},r=Math.round(Number(t));return t!=="auto"&&Number.isFinite(r)&&r>=1&&(i.height=`${r*64-8}px`),i}function an(a,e){if(!a?.style)return;let{gridColumn:t,height:n}=Kl(e);a.style.gridColumn=t,a.style.height=n??""}function Vr(a,e,t={}){let n=Array.isArray(a)?[...a]:[],i=Number(t.index);switch(e){case"verplaats":{let r=Number(t.van),o=Number(t.naar);if(!Number.isInteger(r)||!Number.isInteger(o)||r<0||r>=n.length||o<0||o>=n.length||r===o)return null;let[s]=n.splice(r,1);return n.splice(o,0,s),n}case"dupliceer":return!Number.isInteger(i)||!n[i]?null:(n.splice(i+1,0,structuredClone(n[i])),n);case"verwijder":return!Number.isInteger(i)||!n[i]?null:(n.splice(i,1),n);case"rooster":return!Number.isInteger(i)||!n[i]||!t.rooster?null:(n[i]={...n[i],grid_options:{...n[i].grid_options??{},...t.rooster}},n);default:return null}}var Pr=a=>({...a?{config:a}:{},editMode:!0,saveConfig:async()=>{}}),Gl=()=>document.querySelector("home-assistant");function Br({kaarten:a,hass:e,maakKaart:t,opActie:n}){let i=document.createElement("ha-sortable");i.disabled=!1,i.draggableSelector=".dac-kaart",i.rollback=!1,i.invertSwap=!0,i.options={delay:100,delayOnTouchOnly:!0,direction:"vertical",invertedSwapThreshold:.7};let r=document.createElement("div");r.className="dac-kaarten";let o=[];a.forEach((l,c)=>{let p=t(l,c);if(!p)return;let h=document.createElement("div");h.className="dac-kaart",an(h,l?.grid_options);let g=document.createElement("hui-card-edit-mode");g.hass=e,g.lovelace=Pr(),g.path=[0,0,c],g.hiddenOverlay=!1,g.appendChild(p),o.push(g),h.appendChild(g),r.appendChild(h)}),i.appendChild(r);let s=l=>{for(let c of o)c.hiddenOverlay=!l};i.addEventListener("drag-start",()=>s(!1)),i.addEventListener("drag-end",()=>s(!0)),i.addEventListener("item-moved",l=>{l.stopPropagation(),n("verplaats",{van:l.detail.oldIndex,naar:l.detail.newIndex})});let d={"ll-edit-card":l=>n("bewerk",{index:l.detail.path[2]}),"ll-duplicate-card":l=>n("dupliceer",{index:l.detail.path[2]}),"ll-delete-card":l=>n("verwijder",{index:l.detail.path[2]}),"ll-copy-card":l=>n("kopieer",{index:l.detail.path[2]}),"ll-change-grid-options":l=>n("rooster",{index:l.detail.path?.[2],rooster:l.detail.gridOptions}),"ll-move-to-section":()=>{}};for(let[l,c]of Object.entries(d))i.addEventListener(l,p=>{p.stopPropagation(),c(p)});return i}function Kr(a){try{let e=typeof structuredClone=="function"?structuredClone(a):JSON.parse(JSON.stringify(a));return sessionStorage.setItem("dashboardCardClipboard",JSON.stringify(e)),!0}catch{return!1}}function Gr({hass:a,kaarten:e}){let t=Gl();return!t||!customElements.get("hui-section")?Promise.resolve(null):new Promise(n=>{let i=null,r=null,o=!1,s=()=>{o||(o=!0,t.removeEventListener("show-dialog",d,!0),window.removeEventListener("dialog-closed",l,!0),n(i?{kaart:i}:r?{kaarten:r}:null))},d=g=>{if(g?.detail?.dialogTag!=="hui-dialog-edit-card")return;let m=g.detail?.dialogParams?.cardConfig;g.stopImmediatePropagation?.(),g.stopPropagation(),m&&(i=m);let b=t.querySelector("hui-dialog-create-card");typeof b?.closeDialog=="function"&&b.closeDialog(),setTimeout(s,0)},l=g=>{g?.detail?.dialog==="hui-dialog-create-card"&&setTimeout(s,0)};t.addEventListener("show-dialog",d,!0),window.addEventListener("dialog-closed",l,!0);let c={type:"grid",cards:[...e]},p=document.createElement("hui-section");p.style.display="none",p.hass=a,p.index=0,p.viewIndex=0,p.config=c,p.lovelace={...Pr({views:[{path:"domotiapp-kiezer",title:"DomotiApp",sections:[c]}]}),saveConfig:async g=>{let m=g?.views?.[0]?.sections?.[0]?.cards;Array.isArray(m)&&(r=m)}},t.appendChild(p),(async()=>{try{typeof p._initializeConfig=="function"?await p._initializeConfig():await p.updateComplete;let g=p._layoutElement;if(!g)throw new Error("de proxysectie heeft geen layout-element");g.dispatchEvent(new CustomEvent("ll-create-card",{bubbles:!0,composed:!0}))}catch(g){console.warn("DomotiApp: de kaartkiezer van Home Assistant ging niet open",g),s()}finally{setTimeout(()=>p.remove(),0)}})()})}var rn=()=>!!(customElements.get("hui-card-edit-mode")&&customElements.get("ha-sortable")&&customElements.get("hui-section"));var Ul=`
  .dac-tabs { display: flex; flex-direction: column; gap: 12px; }
  .dac-tabs .lijst { display: flex; flex-direction: column; gap: 8px; }

  .dac-tabs .tab {
    border: 1px solid var(--divider-color); border-radius: 12px;
    background: var(--card-background-color); overflow: hidden;
  }
  .dac-tabs .tab[open] { border-color: var(--primary-color); }
  .dac-tabs .tab > summary {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 8px 8px 12px; cursor: pointer; list-style: none;
  }
  .dac-tabs .tab > summary::-webkit-details-marker { display: none; }
  .dac-tabs .tab[open] > summary { border-bottom: 1px solid var(--divider-color); }
  .dac-tabs .tab > summary:hover { background: rgba(127,127,127,.06); }

  .dac-tabs .voor {
    flex: 0 0 auto; width: 30px; height: 30px; display: grid; place-items: center;
    border-radius: 9px; background: rgba(127,127,127,.14); color: var(--primary-color);
  }
  .dac-tabs .voor svg, .dac-tabs .voor ha-icon, .dac-tabs .voor img {
    width: 17px; height: 17px; --mdc-icon-size: 17px;
  }

  .dac-tabs .titel { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
  .dac-tabs .titel b {
    font-size: 13px; font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-tabs .titel small {
    font-size: 11.5px; color: var(--secondary-text-color);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-tabs .tab[data-leeg="true"] .titel b {
    font-weight: 500; font-style: italic; color: var(--secondary-text-color);
  }

  .dac-tabs .rondknop {
    flex: 0 0 auto; width: 28px; height: 28px; display: grid; place-items: center;
    cursor: pointer; border: 0; background: transparent; border-radius: 999px;
    color: var(--secondary-text-color);
  }
  .dac-tabs .rondknop:hover { background: rgba(127,127,127,.16); }
  .dac-tabs .rondknop:disabled { opacity: .3; cursor: default; }
  .dac-tabs .rondknop:disabled:hover { background: transparent; }
  .dac-tabs .weg:hover { color: var(--error-color, #d03b3b); }
  .dac-tabs .rondknop svg { width: 15px; height: 15px; }

  .dac-tabs .body { padding: 10px; display: flex; flex-direction: column; gap: 10px; }

  .dac-tabs .inhoud {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    background: rgba(127,127,127,.08);
    font-size: 12.5px; color: var(--secondary-text-color);
  }
  .dac-tabs .inhoud b { color: var(--primary-text-color); font-weight: 600; }

  .dac-tabs .toevoegen {
    padding: 13px; cursor: pointer; font: inherit; font-size: 14px; font-weight: 500;
    border: 1px dashed var(--divider-color); border-radius: 12px;
    background: transparent; color: var(--primary-color); text-align: center;
  }
  .dac-tabs .toevoegen:hover { background: rgba(127,127,127,.08); }
  .dac-tabs .toevoegen:disabled { opacity: .4; cursor: default; }

  .dac-tabs .uitleg {
    margin: 0; font-size: 12px; line-height: 1.45; color: var(--secondary-text-color);
  }

  /* ---- de kaart in een tab ---- */

  .dac-tabs .kaartkop {
    display: flex; align-items: center; gap: 8px;
    font-size: 12.5px; color: var(--secondary-text-color);
  }
  .dac-tabs .kaartkop b {
    flex: 1 1 auto; min-width: 0; color: var(--primary-text-color); font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-tabs .kaartkop button {
    flex: 0 0 auto; padding: 5px 10px; cursor: pointer; font: inherit; font-size: 12px;
    border: 1px solid var(--divider-color); border-radius: 999px;
    background: transparent; color: var(--primary-color);
  }
  .dac-tabs .kaartkop button:hover { background: rgba(127,127,127,.10); }
  .dac-tabs .kaartkop button.weg { color: var(--error-color, #d03b3b); }

  .dac-tabs .kaartvak { display: flex; flex-direction: column; gap: 10px; }

  /* De kaarten zoals ze er echt uitzien, met de overlay van Home Assistant
     eromheen. De ruimte tussen twee kaarten is dezelfde die een sectie
     aanhoudt, zodat de voorbeeldweergave klopt met wat je straks ziet. */
  .dac-tabs .dac-kaarten { display: flex; flex-direction: column; gap: 8px; }
  .dac-tabs .dac-kaart { position: relative; }
  /* Slepen mag niet als tekstselectie beginnen. */
  .dac-tabs .dac-kaart { user-select: none; -webkit-user-select: none; }

  .dac-tabs .bewerkvak {
    border: 1px solid var(--primary-color); border-radius: 10px;
    background: rgba(127,127,127,.05); overflow: hidden;
  }
  .dac-tabs .bewerkvak > .kop {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 8px 8px 12px;
    border-bottom: 1px solid var(--divider-color);
    font-size: 12.5px; color: var(--secondary-text-color);
  }
  .dac-tabs .bewerkvak > .kop b {
    flex: 1 1 auto; min-width: 0; color: var(--primary-text-color); font-weight: 600;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-tabs .bewerkvak > .kop button {
    flex: 0 0 auto; padding: 5px 10px; cursor: pointer; font: inherit; font-size: 12px;
    border: 1px solid var(--divider-color); border-radius: 999px;
    background: transparent; color: var(--primary-color);
  }
  .dac-tabs .bewerkvak > .body { padding: 8px; }

  /* De drie tabbladen van HA's eigen kaartdialoog, hier binnen ons bewerkvak.
     Zie de kop van kaartTabbladen_ voor waarom ze hier staan en niet boven
     de hele dialoog. */
  .dac-tabs .bewerkvak > .kaarttabs {
    display: flex; gap: 2px; padding: 6px 8px 0;
    border-bottom: 1px solid var(--divider-color);
  }
  .dac-tabs .bewerkvak > .kaarttabs button {
    flex: 1 1 0; min-width: 0; padding: 8px 6px 9px;
    font: inherit; font-size: 12.5px; cursor: pointer;
    border: 0; border-bottom: 2px solid transparent;
    background: transparent; color: var(--secondary-text-color);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .dac-tabs .bewerkvak > .kaarttabs button[aria-selected="true"] {
    color: var(--primary-color); border-bottom-color: var(--primary-color);
  }

  .dac-tabs .subkop {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; color: var(--secondary-text-color);
  }
  .dac-tabs .subkop::after {
    content: ""; flex: 1 1 auto; height: 1px; background: var(--divider-color);
  }

  .dac-tabs .sub {
    border: 1px solid var(--divider-color); border-radius: 10px;
    background: rgba(127,127,127,.05); overflow: hidden;
  }
  .dac-tabs .sub > summary {
    display: flex; align-items: center; gap: 9px;
    padding: 6px 6px 6px 10px; cursor: pointer; list-style: none;
  }
  .dac-tabs .sub > summary::-webkit-details-marker { display: none; }
  .dac-tabs .sub[open] > summary { border-bottom: 1px solid var(--divider-color); }
  .dac-tabs .sub > summary:hover { background: rgba(127,127,127,.06); }
  .dac-tabs .sub .voor { width: 24px; height: 24px; border-radius: 7px; }
  .dac-tabs .sub .voor svg, .dac-tabs .sub .voor ha-icon, .dac-tabs .sub .voor img {
    width: 14px; height: 14px; --mdc-icon-size: 14px;
  }
  .dac-tabs .sub .titel b { font-size: 12.5px; }
  .dac-tabs .sub .body { padding: 8px; }
  .dac-tabs .kiezer { display: flex; flex-direction: column; gap: 8px; }
  .dac-tabs .kiezer input {
    width: 100%; box-sizing: border-box; padding: 9px 11px;
    font: inherit; font-size: 13.5px;
    color: var(--primary-text-color);
    background-color: var(--card-background-color);
    border: 1px solid var(--divider-color); border-radius: 10px;
  }
  .dac-tabs .soorten {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 6px;
    max-height: 260px; overflow-y: auto; padding: 2px;
  }
  .dac-tabs .soort {
    display: flex; flex-direction: column; gap: 2px; align-items: flex-start;
    padding: 8px 10px; cursor: pointer; text-align: left; font: inherit;
    border: 1px solid var(--divider-color); border-radius: 10px;
    background: transparent; color: var(--primary-text-color);
  }
  .dac-tabs .soort:hover { background: rgba(127,127,127,.10); border-color: var(--primary-color); }
  .dac-tabs .soort b { font-size: 13px; font-weight: 600; }
  .dac-tabs .soort small {
    font-size: 11px; color: var(--secondary-text-color);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .dac-tabs .leeg { font-size: 12.5px; color: var(--secondary-text-color); }
`,Wr=a=>a.filter(nn).map(e=>({...e.name?{name:e.name}:{},...e.icon?{icon:e.icon}:{},...e.cards?.length?{cards:e.cards.map(t=>structuredClone(t))}:{}}));function Ue(a){let e=String(a?.type??"").replace(/^custom:/,"");return e?(window.customCards??[]).find(n=>n?.type===e)?.name||e:"een kaart"}function Sa(a){let e=a.cards?.length??0;return e?e===1?Ue(a.cards[0]):`${e} kaarten`:"Nog geen kaart"}var Oa=class extends HTMLElement{constructor(){super(),this.tabs_=[],this.rest_={},this.open_=new Set}setConfig(e){if(this.rest_={...e},delete this.rest_.tabs,this.gebouwd_&&e===this.uitObject_)return;let t=(Array.isArray(e?.tabs)?e.tabs:[]).map(Aa);this.gebouwd_&&JSON.stringify(Wr(t))===this.uit_||(this.tabs_=t,this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker, hui-card-element-editor, hui-card-visibility-editor, hui-card-layout-editor"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}set lovelace(e){this.lovelace_=e;for(let t of this.querySelectorAll("hui-card-element-editor"))t.lovelace=e}get lovelace(){return this.lovelace_}connectedCallback(){this.gebouwd_||this.build_()}async build_(){if(!this.hass_)return;if(await customElements.whenDefined("ha-form"),!this.helpers_)try{this.helpers_=await window.loadCardHelpers?.()}catch{this.helpers_=null}this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=Ul;let t=document.createElement("div");t.className="dac-tabs",this.append(e,t),t.appendChild(this.kaartBlok_());let n=document.createElement("div");n.className="lijst",t.appendChild(n),this.tabs_.forEach((r,o)=>n.appendChild(this.tabBlok_(r,o)));let i=document.createElement("button");i.type="button",i.className="toevoegen",i.textContent="\uFF0B  Tabblad toevoegen",i.disabled=this.tabs_.length>=8,i.addEventListener("click",()=>{this.tabs_.push({name:"",icon:"",cards:[]}),this.open_.add(`t${this.tabs_.length-1}`),this.emit_(),this.build_()}),t.appendChild(i)}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"default_tab",selector:{number:{min:1,max:8,step:1,mode:"box"}}},{name:"alignment",selector:{select:{mode:"dropdown",options:[{value:"vullen",label:"Verdeeld over de breedte"},{value:"links",label:"Links"},{value:"rechts",label:"Rechts"}]}}},{name:"show_names",selector:{boolean:{}}},{name:"bare",selector:{boolean:{}}}],e.computeLabel=t=>({default_tab:"Welk tabblad staat open op een nieuw apparaat",alignment:"Uitlijning van de rij",show_names:"Namen naast de iconen",bare:"Achtergrond weglaten"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="default_tab")return"Telt vanaf 1. Dit geldt alleen zolang een apparaat nog niets gekozen heeft \u2014 daarna onthoudt elk apparaat zijn eigen tabblad, en dat van je telefoon staat los van dat van de tablet.";if(t.name==="show_names")return"Uit geeft een rij kale iconen. Dan passen er meer naast elkaar op een telefoon.";if(t.name==="bare")return"Haalt het vlak onder de kaart weg. De rij tabbladen houdt zijn eigen pil."},e.data={default_tab:Number(this.rest_.default_tab)||1,alignment:this.rest_.alignment??"vullen",show_names:this.rest_.show_names!==!1,bare:!!this.rest_.bare},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{},i=Number(n.default_tab);Number.isFinite(i)&&i>1?this.rest_.default_tab=i:delete this.rest_.default_tab,n.alignment==="links"||n.alignment==="rechts"?this.rest_.alignment=n.alignment:delete this.rest_.alignment,n.show_names===!1?this.rest_.show_names=!1:delete this.rest_.show_names,n.bare?this.rest_.bare=!0:delete this.rest_.bare,this.emit_()}),e}tabBlok_(e,t){let n=document.createElement("details");n.className="tab",this.onthoud_(n,`t${t}`);let i=document.createElement("summary"),r=document.createElement("span");r.className="voor";let o=document.createElement("span");o.className="titel";let s=document.createElement("b"),d=document.createElement("small");o.append(s,d);let l=()=>{n.dataset.leeg=String(!nn(e)),r.innerHTML=f(e.icon,"grid"),s.textContent=e.name||`Tabblad ${t+1}`,d.textContent=Sa(e)};l(),this.koppen_.push(l);let c=this.kopKnop_("Omhoog",E.arrowUp,()=>this.verplaats_(t,-1));c.disabled=t===0;let p=this.kopKnop_("Omlaag",E.arrowDown,()=>this.verplaats_(t,1));p.disabled=t===this.tabs_.length-1;let h=this.kopKnop_("Verwijderen",E.close,()=>this.verwijder_(t));h.classList.add("weg"),i.append(r,o,c,p,h),n.appendChild(i);let g=document.createElement("div");g.className="body";let m=document.createElement("dac-icon-picker");m.label="Icoon",m.fallback="grid",m.auto=!1,m.hass=this.hass_,m.value=e.icon,m.addEventListener("value-changed",v=>{v.stopPropagation(),e.icon=v.detail.value??"",this.emit_()});let b=document.createElement("ha-form");return b.hass=this.hass_,b.schema=[{name:"name",selector:{text:{}}}],b.computeLabel=()=>"Naam",b.computeHelper=()=>"Deze naam bepaalt ook onder welke sleutel een apparaat zijn keuze onthoudt. Hernoem je hem, dan begint elk apparaat \xE9\xE9n keer opnieuw bij het eerste tabblad.",b.data={name:e.name},b.addEventListener("value-changed",v=>{v.stopPropagation(),e.name=v.detail.value?.name??"",this.emit_()}),g.append(m,b,this.inhoudBlok_(e,t)),n.appendChild(g),n}inhoudBlok_(e,t){let n=document.createElement("div");if(n.className="kaartvak",Array.isArray(e.cards)||(e.cards=[]),!Rr()){let r=document.createElement("div");return r.className="inhoud",r.innerHTML=`${f("grid")}<span>Inhoud: <b>${Sa(e)}</b> \u2014 aan te passen via Code-editor weergeven.</span>`,n.appendChild(r),n}if(rn()){let r=document.createElement("div");return r.className="inhoud",r.innerHTML=`${f("grid")}<span>${e.cards.length?`<b>${Sa(e)}</b> \u2014 te bewerken in het voorbeeld hiernaast: slepen om te verplaatsen, het potlood om te bewerken.`:"Nog geen kaart \u2014 voeg er een toe in het voorbeeld hiernaast."}</span>`,n.appendChild(r),this.bewerkt_?.tab===t&&e.cards[this.bewerkt_.index]&&n.appendChild(this.bewerkVak_(e,t,this.bewerkt_.index)),n}if(e.cards.length){let r=document.createElement("div");r.className="subkop",r.textContent=e.cards.length===1?"Kaart":`${e.cards.length} kaarten`,n.appendChild(r),e.cards.forEach((o,s)=>n.appendChild(this.kaartBlok2_(e,o,t,s)))}if(this.kiest_===`t${t}`)return n.appendChild(this.kiezerBlok_(e,t)),n;let i=document.createElement("button");return i.type="button",i.className="toevoegen",i.textContent="\uFF0B  Kaart toevoegen",i.addEventListener("click",()=>{this.kiest_=`t${t}`,this.zoek_="",this.build_()}),n.appendChild(i),n}uitVoorbeeld(e,t,n){let i=this.tabs_[e];if(i){if(t==="toevoegen"){this.voegToeViaHa_(i,e);return}this.kaartActie_(i,e,t,n)}}toonBewerkVak_(){let e=this.querySelector(".bewerkvak"),t=this.bewerkt_?.tab,n=this.bewerkt_?.index,i=Number.isInteger(t)?this.tabs_[t]:null;if(!i||!i.cards[n]){e?.remove();return}let r=this.bewerkVak_(i,t,n);e?e.replaceWith(r):this.querySelectorAll(".kaartvak")[t]?.appendChild(r),r.scrollIntoView({block:"nearest"})}kaartActie_(e,t,n,i){if(n==="bewerk"){(this.bewerkt_?.tab!==t||this.bewerkt_?.index!==i.index)&&(this.kaartBlad_="config"),this.bewerkt_={tab:t,index:i.index},this.open_.add(`t${t}`);let o=this.querySelectorAll("details.tab")[t];o&&(o.open=!0),this.toonBewerkVak_();return}if(n==="kopieer"){Kr(e.cards[i.index]);return}let r=Vr(e.cards,n,i);r&&(e.cards=r,this.bewerkt_=null,this.emit_(),this.build_())}bewerkVak_(e,t,n){let i=document.createElement("div");i.className="bewerkvak";let r=document.createElement("div");r.className="kop";let o=document.createElement("b");o.textContent=Ue(e.cards[n]);let s=document.createElement("button");s.type="button",s.textContent="Klaar",s.addEventListener("click",()=>{this.bewerkt_=null,this.build_()}),r.append(o,s);let d=document.createElement("div");d.className="body";let l=this.kaartTabbladen_(e,t,n,d,o);l&&i.append(r,l,d);let c=document.createElement("hui-card-element-editor");return c.hass=this.hass_,this.lovelace_&&(c.lovelace=this.lovelace_),c.value=e.cards[n],c.addEventListener("config-changed",p=>{p.stopPropagation();let h=p.detail?.config;h&&(e.cards[n]=h,this.emit_(),o.textContent=Ue(h))}),c.addEventListener("GUImode-changed",p=>p.stopPropagation()),this.kaartEditor_=c,d.appendChild(c),l||i.append(r,d),i}kaartTabbladen_(e,t,n,i,r){let o=!!customElements.get("hui-card-visibility-editor"),s=!!customElements.get("hui-card-layout-editor");if(!o&&!s)return null;let d=document.createElement("div");d.className="kaarttabs";let l=[{id:"config",naam:"Configuratie"},...o?[{id:"zicht",naam:"Zichtbaarheid"}]:[],...s?[{id:"indeling",naam:"Indeling"}]:[]],c=h=>{this.kaartBlad_=h;for(let g of d.querySelectorAll("button"))g.setAttribute("aria-selected",String(g.dataset.blad===h));i.replaceChildren(this.bladInhoud_(h,e,t,n,r))};for(let h of l){let g=document.createElement("button");g.type="button",g.dataset.blad=h.id,g.textContent=h.naam,g.setAttribute("role","tab"),g.setAttribute("aria-selected","false"),g.addEventListener("click",()=>c(h.id)),d.appendChild(g)}let p=l.some(h=>h.id===this.kaartBlad_)?this.kaartBlad_:"config";return setTimeout(()=>c(p),0),d}bladInhoud_(e,t,n,i,r){if(e==="config")return this.kaartEditor_;let o=document.createElement(e==="zicht"?"hui-card-visibility-editor":"hui-card-layout-editor");return o.hass=this.hass_,o.config=t.cards[i],e==="indeling"&&(o.sectionConfig={type:"grid",column_span:1}),o.addEventListener("value-changed",s=>{s.stopPropagation();let d=s.detail?.value;d&&(t.cards[i]=d,o.config=d,this.emit_(),r.textContent=Ue(d))}),o}async voegToeViaHa_(e,t){let n=await Gr({hass:this.hass_,kaarten:e.cards});n&&(n.kaarten?(e.cards=n.kaarten,this.bewerkt_=null):(e.cards.push(n.kaart),this.bewerkt_={tab:t,index:e.cards.length-1}),this.open_.add(`t${t}`),this.emit_(),this.build_())}kaartBlok2_(e,t,n,i){let r=document.createElement("details");r.className="sub",this.onthoud_(r,`t${n}k${i}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="voor",s.innerHTML=f("grid");let d=document.createElement("span");d.className="titel";let l=document.createElement("b");l.textContent=Ue(t);let c=document.createElement("small");c.textContent=String(t?.type??""),d.append(l,c);let p=this.kopKnop_("Omhoog",E.arrowUp,()=>this.verplaatsKaart_(e,n,i,-1));p.disabled=i===0;let h=this.kopKnop_("Omlaag",E.arrowDown,()=>this.verplaatsKaart_(e,n,i,1));h.disabled=i===e.cards.length-1;let g=this.kopKnop_("Verwijderen",E.close,()=>this.verwijderKaart_(e,n,i));g.classList.add("weg"),o.append(s,d,p,h,g),r.appendChild(o);let m=document.createElement("div");m.className="body";let b=document.createElement("hui-card-element-editor");return b.hass=this.hass_,this.lovelace_&&(b.lovelace=this.lovelace_),b.value=t,b.addEventListener("config-changed",v=>{v.stopPropagation();let y=v.detail?.config;y&&(e.cards[i]=y,this.emit_(),l.textContent=Ue(y),c.textContent=String(y.type??""))}),b.addEventListener("GUImode-changed",v=>v.stopPropagation()),m.appendChild(b),r.appendChild(m),r}verplaatsKaart_(e,t,n,i){let r=n+i;if(r<0||r>=e.cards.length)return;[e.cards[n],e.cards[r]]=[e.cards[r],e.cards[n]];let o=this.open_.has(`t${t}k${n}`),s=this.open_.has(`t${t}k${r}`);this.open_.delete(`t${t}k${n}`),this.open_.delete(`t${t}k${r}`),s&&this.open_.add(`t${t}k${n}`),o&&this.open_.add(`t${t}k${r}`),this.emit_(),this.build_()}verwijderKaart_(e,t,n){e.cards.splice(n,1);let i=new Set;for(let r of this.open_){let o=new RegExp(`^t${t}k(\\d+)$`).exec(r);if(!o){i.add(r);continue}let s=Number(o[1]);s!==n&&i.add(`t${t}k${s>n?s-1:s}`)}this.open_=i,this.emit_(),this.build_()}kiezerBlok_(e,t){let n=document.createElement("div");n.className="kiezer";let i=document.createElement("input");i.type="text",i.placeholder="Zoek een kaart...",i.value=this.zoek_??"";let r=document.createElement("div");r.className="soorten";let o=()=>{let d=Hr(Dr(),this.zoek_);if(r.replaceChildren(),!d.length){let l=document.createElement("p");l.className="leeg",l.textContent="Niets gevonden. Kies iets anders, of gebruik de code-editor.",r.appendChild(l);return}for(let l of d){let c=document.createElement("button");c.type="button",c.className="soort";let p=document.createElement("b");p.textContent=l.naam;let h=document.createElement("small");h.textContent=l.uitleg||l.type,c.append(p,h),c.addEventListener("click",async()=>{e.cards.push(await Ir(l.type,this.hass_)),this.kiest_=null,this.open_.add(`t${t}`),this.open_.add(`t${t}k${e.cards.length-1}`),this.emit_(),this.build_()}),r.appendChild(c)}};o(),i.addEventListener("input",()=>{this.zoek_=i.value,o()});let s=document.createElement("button");return s.type="button",s.className="toevoegen",s.textContent="Annuleren",s.addEventListener("click",()=>{this.kiest_=null,this.build_()}),n.append(i,r,s),n}kopKnop_(e,t,n){let i=document.createElement("button");return i.type="button",i.className="rondknop",i.title=e,i.setAttribute("aria-label",e),i.innerHTML=t,i.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),i.disabled||n()}),i}verplaats_(e,t){let n=e+t;if(n<0||n>=this.tabs_.length)return;[this.tabs_[e],this.tabs_[n]]=[this.tabs_[n],this.tabs_[e]];let i=this.open_.has(`t${e}`),r=this.open_.has(`t${n}`);this.open_.delete(`t${e}`),this.open_.delete(`t${n}`),r&&this.open_.add(`t${e}`),i&&this.open_.add(`t${n}`),this.emit_(),this.build_()}verwijder_(e){this.tabs_.splice(e,1);let t=new Set;for(let n of this.open_){let i=Number(n.slice(1));i!==e&&t.add(`t${i>e?i-1:i}`)}this.open_=t,this.emit_(),this.build_()}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}emit_(){let e=Wr(this.tabs_),t={...this.rest_,tabs:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_??[])n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};S("domotiapp-tabs-card-editor",Oa);var qr=a=>a.parentElement??(a.parentNode&&a.parentNode.host)??null;function*Zr(a){let e=qr(a),t=0;for(;e&&t++<40;)yield e,e=qr(e)}function Fr(a){let e=null;for(let n of Zr(a))if((n.tagName?.toLowerCase?.()??"")==="hui-dialog-edit-card"){e=n;break}if(!e)return null;let t=(n,i=0)=>{if(!n||i>25)return null;if(n.tagName?.toLowerCase?.()==="domotiapp-tabs-card-editor")return n;for(let r of n.children??[]){let o=t(r,i+1);if(o)return o}if(n.shadowRoot)for(let r of n.shadowRoot.children){let o=t(r,i+1);if(o)return o}return null};return t(e)}var sn=class extends A{constructor(){super(),this.kinderen_=new Map,this.open_=0}validate(e){let t=Cr(e),n={tone:"accent",...e,tabs:t};return t.length||(n[T]="Voeg tabbladen toe: elk met een naam, een icoon en een kaart erin."),n}watched(){return[]}setConfig(e){this.kinderen_.clear(),super.setConfig(e)}set hass(e){super.hass=e;for(let t of this.kinderen_.values())if(t)for(let n of t)n&&(n.hass=e)}get hass(){return super.hass}template(){let e=this.config;e.bare&&this.setAttribute("bare",""),e.show_names===!1&&this.setAttribute("geen-namen",""),(e.alignment==="links"||e.alignment==="rechts")&&this.setAttribute("uitgelijnd",e.alignment);let t=e.tabs.map((i,r)=>`
        <button type="button" class="tab" role="tab" data-i="${r}" aria-selected="false"
                title="${U(i.name)}">
          ${i.icon?`<span class="ic">${f(i.icon,"grid")}</span>`:""}
          <span class="nm">${U(i.name||`Tab ${r+1}`)}</span>
        </button>`).join(""),n=e.tabs.map((i,r)=>`<div class="vak" data-i="${r}" role="tabpanel"></div>`).join("");return`
      <div class="card surface" style="--tone:${B(e.tone)}">
        <div class="balk" role="tablist">${t}</div>
        <div class="vakken">${n}</div>
      </div>`}wire(){for(let e of this.$$(".tab"))this.on(e,"click",()=>this.kies_(Number(e.dataset.i)));this.teardown_.push(P(this.$(".card"))),this.kies_(Lr(this.config,this.config.tabs,this.opslag_()),!1)}paint(){}opslag_(){try{return window.localStorage}catch{return null}}kies_(e,t=!0){let n=this.config.tabs;if(!n.length)return;let i=Math.min(Math.max(0,e),n.length-1);this.open_=i;for(let r of this.$$(".tab"))r.setAttribute("aria-selected",String(Number(r.dataset.i)===i));for(let r of this.$$(".vak"))r.dataset.open=String(Number(r.dataset.i)===i);t&&Tr(this.opslag_(),Ma(n),i),this.bouw_(i)}async bouw_(e){if(this.kinderen_.has(e)){L(this.$(".card"));return}let t=this.$(`.vak[data-i="${e}"]`),n=this.config.tabs[e];if(!(!t||!n)){if(!n.cards.length){let i=document.createElement("div");i.className="leeg",i.textContent="Deze tab heeft nog geen kaart.",t.replaceChildren(i),L(this.$(".card")),this.knopLater_(e);return}this.kinderen_.set(e,null);try{if(!await window.loadCardHelpers?.())throw new Error("loadCardHelpers ontbreekt");let r=Fr(this),o=!!r,s=n.cards.map(d=>{let l=document.createElement("hui-card");return l.hass=this.hass,l.preview=o,l.config=d,an(l,d?.grid_options),l});if(this.kinderen_.set(e,s),r&&rn()){t.replaceChildren(Br({hass:this.hass,kaarten:n.cards,maakKaart:(d,l)=>s[l]??null,opActie:(d,l)=>r.uitVoorbeeld?.(e,d,l)}),this.voegToeKnop_(e)),L(this.$(".card"));return}t.replaceChildren(...s),L(this.$(".card"))}catch(i){this.kinderen_.delete(e),t.innerHTML=`<div class="leeg">Deze kaart kon niet geladen worden: ${U(i?.message??i)}</div>`,L(this.$(".card"))}}}knopLater_(e,t=60){let n=this.$(`.vak[data-i="${e}"]`);if(!n||n.querySelector(".voegtoe")||this.config?.tabs?.[e]?.cards?.length)return;if(this.inVoorbeeld_()){n.appendChild(this.voegToeKnop_(e)),L(this.$(".card"));return}if(t<=0)return;let i=setTimeout(()=>this.knopLater_(e,t-1),50);this.teardown_.push(()=>clearTimeout(i))}inVoorbeeld_(){for(let e of Zr(this))if(e.tagName?.toLowerCase?.()==="hui-dialog-edit-card")return!0;return!1}voegToeKnop_(e){let t=document.createElement("button");return t.type="button",t.className="voegtoe",t.textContent="\uFF0B  Kaart toevoegen",t.addEventListener("click",n=>{n.stopPropagation(),Fr(this)?.uitVoorbeeld?.(e,"toevoegen",{})}),t}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-tabs-card-editor")}static getStubConfig(){return{tabs:[{name:"Woning",icon:"house",card:null},{name:"Weer",icon:"cloudSun",card:null}]}}};j(sn,"css",`
    :host { display: block; }

    .card {
      min-height: var(--dac-raster, 56px);
      padding: 8px;
      display: flex; flex-direction: column; gap: 10px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ------------------------------------------------------------ de rij */

    .balk {
      flex: 0 0 auto;
      display: flex; align-items: center; gap: 3px;
      padding: 3px;
      background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
      /* Meer tabs dan er passen schuiven in plaats van af te breken: een tweede
         regel knoppen verandert de hoogte van de kaart bij elke wissel. */
      overflow-x: auto; scrollbar-width: none;
    }
    .balk::-webkit-scrollbar { display: none; }
    :host([uitgelijnd="links"]) .balk { justify-content: flex-start; }
    :host([uitgelijnd="rechts"]) .balk { justify-content: flex-end; }

    .tab {
      flex: 1 1 0; min-width: 0;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 8px 12px;
      border: 0; border-radius: var(--dac-radius-pill);
      background: none; cursor: pointer;
      font: inherit; font-size: 13px; font-weight: 500; letter-spacing: -.01em;
      color: var(--dac-ink-2);
      white-space: nowrap;
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .tab:hover { color: var(--dac-ink); } }
    /* De actieve tab draagt de kleur. Dat is hier geen statuskleur maar
       navigatie: je moet kunnen zien waar je bent. */
    .tab[aria-selected="true"] {
      background: color-mix(in srgb, var(--tone) 20%, transparent);
      color: var(--tone);
    }
    .tab .ic { display: flex; flex: 0 0 auto; }
    .tab .icon, .tab ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }
    .tab .nm { overflow: hidden; text-overflow: ellipsis; }
    :host([geen-namen]) .tab .nm { display: none; }

    /* --------------------------------------------------------- de inhoud */

    .vakken { flex: 1 1 auto; min-height: 0; display: block; }
    .vak { display: none; }

    /* De kaarten in een tab staan in HETZELFDE raster als in een sectie van
       Home Assistant: twaalf kolommen, 8px ertussen. Dat is wat de schuif
       "Indeling" in de kaartdialoog bedient, en zonder dit raster zou die
       schuif een getal wegschrijven dat niemand leest. Zie tab-indeling.js.

       Een kaart zonder keuze staat op alle twaalf de kolommen, dus een tabblad
       van v\xF3\xF3r deze ronde ziet er precies zo uit als eerst. */
    .vak[data-open="true"] {
      display: grid;
      grid-template-columns: repeat(${12}, minmax(0, 1fr));
      gap: 8px;
      align-content: start;
    }
    .vak > * { grid-column: span ${12}; }

    /* ---- het gereedschap in het voorbeeld van de kaarteditor ---- */

    /* Ook een raster, en om dezelfde reden: wat je in het voorbeeld ziet moet
       zijn wat er op het dashboard staat. */
    .vak .dac-kaarten {
      display: grid;
      grid-template-columns: repeat(${12}, minmax(0, 1fr));
      gap: 8px;
      align-content: start;
    }
    .vak .dac-kaart {
      position: relative; user-select: none; -webkit-user-select: none;
      grid-column: span ${12};
    }

    .voegtoe {
      width: 100%; margin-top: 8px; padding: 13px;
      cursor: pointer; font: inherit; font-size: 14px; font-weight: 500;
      border: 1px dashed var(--dac-border-hi); border-radius: var(--dac-radius-sm);
      background: transparent; color: var(--dac-accent-hi); text-align: center;
    }
    @media (hover: hover) {
      .voegtoe:hover { background: var(--dac-surface); }
    }

    .leeg {
      padding: 14px 4px; text-align: center;
      font-size: 12.5px; color: var(--dac-ink-3);
    }

    :focus-visible { outline: 2px solid var(--tone); outline-offset: 2px; }
  `);N("domotiapp-tabs-card",sn,{name:"DomotiApp Tabbladen",description:"Meerdere kaarten achter tabbladen, met een rij knoppen erboven. De gekozen tab wordt per apparaat onthouden."});var V={UIT:"uit",KLAAR:"klaar",UITGESTELD:"uitgesteld",DRAAIT:"draait",PAUZE:"pauze",AF:"af",FOUT:"fout",ONBEKEND:"onbekend"},Wl=[[V.FOUT,["error","fout","aborting","afgebroken"]],[V.DRAAIT,["run","active","washing","drying","rinsing","bezig","draait","on"]],[V.PAUZE,["pause","paused","pauze","onderbroken"]],[V.UITGESTELD,["delayedstart","delayed","scheduled","uitgesteld","wachten"]],[V.AF,["finished","complete","done","klaar met","afgelopen"]],[V.KLAAR,["ready","idle","standby","klaar","gereed"]],[V.UIT,["off","inactive","uit"]]],ql=new Set([V.DRAAIT]);function Qr(a){let e=String(a??"").toLowerCase().trim();if(!e||e==="unknown"||e==="unavailable")return V.ONBEKEND;let t=e.split(/[^a-z0-9]+/).filter(Boolean);for(let[n,i]of Wl)for(let r of i)if(r.includes(" ")?e.includes(r):t.includes(r))return n;return V.ONBEKEND}var Yr=a=>ql.has(Qr(a?.state));function Jr(a,e=new Date){if(!a)return null;let t=String(a.state??"").trim();if(!t||t==="unknown"||t==="unavailable")return null;let n=a.attributes??{};if(n.device_class==="timestamp"||/^\d{4}-\d{2}-\d{2}[T ]/.test(t)){let s=new Date(t);return Number.isNaN(+s)?null:Math.max(0,Math.round((s-e)/6e4))}let i=t.match(/^(\d{1,3}):(\d{2})(?::(\d{2}))?$/);if(i)return Number(i[1])*60+Number(i[2])+(i[3]?Math.round(Number(i[3])/60):0);let r=Number(t);if(!Number.isFinite(r))return null;let o=String(n.unit_of_measurement??"min").toLowerCase();return o.startsWith("s")?Math.round(r/60):o.startsWith("h")||o.startsWith("u")?Math.round(r*60):Math.round(r)}function Xr(a){if(a==null)return"";if(a<=0)return"Klaar";if(a<60)return`nog ${a} min`;let e=Math.floor(a/60),t=a%60;return t?`nog ${e} u ${t} min`:`nog ${e} uur`}function eo(a){if(!a)return null;let e=String(a.state??"").trim();if(!e||e==="unknown"||e==="unavailable")return null;let t=Number(e);return Number.isFinite(t)?Math.min(100,Math.max(0,Math.round(t))):null}var Fl=a=>!!a&&a.state==="on",to=a=>a===V.DRAAIT||a===V.PAUZE||a===V.UITGESTELD;function no({status:a,deur:e,rest:t,pct:n}={}){let i=Qr(a?.state),r=Fl(e);if(i===V.DRAAIT){let o=[];return t!=null?o.push(Xr(t)):n!=null&&o.push(`${n}%`),{soort:i,tekst:o.length?`Draait \xB7 ${o.join(" ")}`:"Draait",tone:"accent",waarschuwing:""}}return i===V.PAUZE?{soort:i,tekst:"Gepauzeerd",tone:"warn",waarschuwing:r?"Klep open":""}:i===V.FOUT?{soort:i,tekst:"Storing",tone:"bad",waarschuwing:r?"Klep open":""}:i===V.AF?{soort:i,tekst:"Programma klaar",tone:"good",waarschuwing:""}:i===V.UITGESTELD?{soort:i,tekst:t!=null?`Start over ${Xr(t).replace(/^nog /,"")}`:"Uitgestelde start",tone:"accent",waarschuwing:r?"Klep open":""}:r?{soort:i,tekst:"Klep open",tone:"warn",waarschuwing:""}:i===V.UIT?{soort:i,tekst:"Uit",tone:"neutral",waarschuwing:""}:i===V.KLAAR?{soort:i,tekst:"Klaar om te starten",tone:"neutral",waarschuwing:""}:{soort:V.ONBEKEND,tekst:"Niet bereikbaar",tone:"neutral",waarschuwing:""}}function ao(a){let e=String(a??"");switch(e.split(".")[0]){case"button":return["button","press",{entity_id:e}];case"input_button":return["input_button","press",{entity_id:e}];case"script":return["script","turn_on",{entity_id:e}];case"scene":return["scene","turn_on",{entity_id:e}];case"switch":case"input_boolean":return["homeassistant","turn_on",{entity_id:e}];case"automation":return["automation","trigger",{entity_id:e}];default:return null}}var Zl={good:O.good,warn:O.warn,bad:O.bad,neutral:O.neutral,accent:O.accent},ln=class extends A{validate(e){let t={name:"",icon:"dishwasher",...e};return!t.status&&!t.remaining&&!t.progress&&!t.program&&(t[T]="Kies minstens een statussensor. Resterende tijd, voortgang, programma en de knoppen mogen daarna."),t}watched(){return[this.config.status,this.config.remaining,this.config.progress,this.config.program,this.config.door,this.config.smart,this.config.start,this.config.stop].filter(Boolean)}template(){this.config.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size";let t=(n,i,r)=>`
      <button type="button" class="knop ${n}" hidden>
        ${f(i)}<span class="lb">${U(r)}</span>
      </button>`;return`
      <div class="card surface" style="--tone:${O.accent}">
        <div class="top" role="button" tabindex="0">
          <span class="chip"></span>
          <span class="txt">
            <span class="nm"></span>
            <span class="st"></span>
          </span>
        </div>

        <div class="balk" hidden><span class="vul"></span></div>

        <div class="rij programma" hidden>
          <span class="programslot" style="display:contents"></span>
        </div>

        <div class="rij knoppen" hidden>
          ${t("slim","bolt","Slim")}
          ${t("start","play","Start")}
          ${t("stop","stop","Stop")}
        </div>
      </div>`}wire(){let e=this.config;this.on(this.$(".top"),"click",()=>{let t=e.status||e.remaining||e.program;t&&this.moreInfo_(t)}),this.on(this.$(".knop.start"),"click",()=>this.druk_(e.start)),this.on(this.$(".knop.stop"),"click",()=>this.druk_(e.stop)),this.on(this.$(".knop.slim"),"click",()=>{if(!e.smart)return;let t=xe(k(this.hass,e.smart));this.hass.callService("homeassistant",t?"turn_off":"turn_on",{entity_id:e.smart})}),this.on(this.$(".rij.programma"),"change",t=>{let n=t.target?.closest?.(".keuze");if(!n||!e.program)return;t.stopPropagation();let i=Ht(e.program,n.value,Se(k(this.hass,e.program)));i&&this.hass.callService(i[0],i[1],i[2])}),this.teardown_.push(P(this.$(".card")))}moreInfo_(e){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0}))}druk_(e){let t=ao(e);t&&this.hass.callService(t[0],t[1],t[2])}paint(){let e=this.config,t=k(this.hass,e.status),n=k(this.hass,e.door),i=Jr(k(this.hass,e.remaining)),r=eo(k(this.hass,e.progress)),o=no({status:t,deur:n,rest:i,pct:r}),s=Yr(t);this.toggleAttribute("draait",s),this.toggleAttribute("onbekend",s&&r==null);let d=this.$(".top"),l=Zl[o.tone]??O.accent;this.$(".card").style.setProperty("--tone",l),d.classList.toggle("unavailable",o.soort==="onbekend");let c=this.$(".chip"),p=e.icon||"dishwasher";c.dataset.icon!==p&&(c.dataset.icon=p,c.innerHTML=f(p,"dishwasher")),c.style.setProperty("--tone",l),this.text(".nm",e.name||C(this.hass,e.status,null)||"Vaatwasser");let h=this.$(".st"),g=U(o.tekst),m=o.waarschuwing?` &middot; <span class="let">${U(o.waarschuwing)}</span>`:"";h.dataset.tekst!==g+m&&(h.dataset.tekst=g+m,h.innerHTML=g+m),d.setAttribute("aria-label",`${this.$(".nm").textContent}, ${o.tekst}`);let b=this.$(".balk"),v=to(o.soort)&&(r!=null||s);if(b.hidden=!v,v){let y=this.$(".vul"),x=r!=null?`${r}%`:"";x&&y.style.width!==x&&(y.style.width=x),b.setAttribute("role","progressbar"),r!=null?(b.setAttribute("aria-valuenow",String(r)),b.setAttribute("aria-valuemin","0"),b.setAttribute("aria-valuemax","100")):b.removeAttribute("aria-valuenow")}this.paintBediening_(),L(this.$(".card"))}paintBediening_(){let e=this.config,t=this.$(".programslot"),n=k(this.hass,e.program),i=e.program?Se(n):[],r=i.map(l=>It(l,this.hass?.formatEntityState?.(n,l))),o=JSON.stringify([i,r]);t.dataset.opties!==o&&(t.dataset.opties=o,t.innerHTML=i.length?`<select class="keuze" aria-label="Programma">${i.map((l,c)=>`<option value="${U(l)}">${U(r[c])}</option>`).join("")}</select>`:"");let s=t.querySelector(".keuze");if(s&&this.shadowRoot.activeElement!==s){let l=Dt(n);s.value!==l&&(s.value=l)}let d=this.$(".knop.slim");d.hidden=!e.smart,e.smart&&(d.dataset.aan=String(xe(k(this.hass,e.smart)))),this.$(".knop.start").hidden=!e.start,this.$(".knop.stop").hidden=!e.stop,this.$(".rij.programma").hidden=!s,this.$(".rij.knoppen").hidden=!e.smart&&!e.start&&!e.stop}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-dishwasher-card-editor")}static getStubConfig(e,t){return{status:((i,r)=>t?.find(o=>o.startsWith(i)&&r.test(o))??"")("sensor.",/vaatwas|dishwash/i),name:"Vaatwasser"}}};j(ln,"css",`
    :host { display: block; }

    /* De tussenruimte is 8 en niet 9, en dat is gemeten en geen smaak.
       Met 9 komt de volledige kaart op 40 + 6 + 40 aan inhoud, plus 2x9 gap,
       plus 2x8 padding, plus 2x1 rand = 122px. Dat is TWEE pixels over de
       120 van twee rasterrijen, en dus klimt de kaart naar drie rijen met 64px
       lucht eronder. Met 8 komt hij op precies 120 uit. */
    .card {
      min-height: var(--dac-raster, 56px);
      padding: 8px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ------------------------------------------------------------- de kop */

    .top { display: flex; align-items: center; gap: 11px; min-height: 40px; cursor: pointer; }
    .chip { width: 40px; height: 40px; }
    .chip .icon { width: 20px; height: 20px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st .let { color: var(--dac-warn); font-weight: 600; }

    /* --------------------------------------------------------- de balk */

    .balk {
      flex: 0 0 auto; position: relative; height: 6px; border-radius: 999px;
      background: var(--dac-surface-hi); overflow: hidden;
    }
    .balk[hidden] { display: none; }
    .vul {
      position: absolute; inset: 0 auto 0 0; width: 0%;
      border-radius: 999px;
      background: linear-gradient(90deg,
        color-mix(in srgb, var(--tone) 55%, transparent), var(--tone));
      transition: width 600ms ease;
    }

    /* Zolang hij draait loopt er een glans over de balk. Niet fel en niet snel:
       de kaart hoort te laten zien d\xE1t er iets loopt, niet om aandacht te
       vragen -- er is niets aan de hand. */
    :host([draait]) .vul::after {
      content: ""; position: absolute; inset: 0;
      background: linear-gradient(90deg,
        transparent 0%,
        color-mix(in srgb, #fff 34%, transparent) 50%,
        transparent 100%);
      animation: glans 2.4s linear infinite;
    }
    @keyframes glans {
      from { transform: translateX(-100%); }
      to   { transform: translateX(100%); }
    }

    /* Zonder voortgangssensor is er geen stand, maar w\xE9l iets te melden: dan
       schuift er een streepje heen en weer in plaats van een lege balk. */
    :host([draait][onbekend]) .vul {
      width: 34%;
      animation: heenweer 2.6s ease-in-out infinite;
    }
    @keyframes heenweer {
      0%, 100% { transform: translateX(-8%); }
      50%      { transform: translateX(200%); }
    }

    @media (prefers-reduced-motion: reduce) {
      :host([draait]) .vul::after,
      :host([draait][onbekend]) .vul { animation: none; }
    }

    /* ------------------------------------------------------- de bediening

       TWEE RIJEN EN NIET EEN, EN DAT IS GEMETEN

       Ze stonden naast elkaar: de programmakeuze, en daarnaast Slim, Start en
       Stop. In een pop-up van 430 pixels breed liep dat mis -- de keuzelijst
       nam de ruimte die hij kon krijgen en de drie knoppen werden zo smal dat
       hun woorden over elkaar vielen ("Slim" en "Start" in elkaar geschoven op
       de schermafdruk van 26 augustus 2026). Dat is de val van flex: 1 1 auto
       naast flex: 1 1 0: allebei willen groeien, en wie het eerst komt wint.

       Nu heeft de keuzelijst een regel voor zichzelf -- hij draagt de langste
       tekst van de kaart -- en delen de knoppen de regel eronder in gelijke
       stukken. Dat kost een rasterrij, en die is het waard: een startknop die
       "Sta" zegt is geen startknop. */

    .rij { flex: 0 0 auto; display: flex; align-items: center; gap: 8px; }
    .rij[hidden] { display: none; }

    /* De programmakeuze. Ondoorzichtige achtergrond, net als op de
       entiteitenkaart: de browser tekent het uitklappaneel met de kleur van de
       select zelf, en dat paneel valt buiten onze shadow root (de fout van
       fase 12). Bewaakt door scripts/check-controls.mjs. */
    .keuze {
      flex: 1 1 auto; min-width: 0;
      font: inherit; font-size: 13px; line-height: 1.2;
      color: var(--dac-ink); color-scheme: dark;
      background-color: var(--dac-bg-raise);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      padding: 7px 10px; cursor: pointer;
      text-overflow: ellipsis;
    }
    @media (hover: hover) { .keuze:hover { border-color: var(--dac-border-hi); } }
    .keuze:focus-visible { outline: 2px solid var(--tone); outline-offset: 1px; }
    .keuze option { background-color: var(--dac-bg-raise); color: var(--dac-ink); }
    .keuze option:checked { background-color: var(--dac-accent); color: var(--dac-ink); }

    .knop {
      flex: 1 1 0; min-width: 0;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 9px 10px;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      background: var(--dac-surface); cursor: pointer;
      font: inherit; font-size: 12.5px; font-weight: 500; color: var(--dac-ink-2);
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
    }
    .knop .icon { width: 15px; height: 15px; flex: 0 0 auto; }
    @media (hover: hover) { .knop:hover { color: var(--dac-ink); border-color: var(--dac-border-hi); } }
    .knop:active { transform: scale(.97); }
    .knop[hidden] { display: none; }

    /* Start draagt het accent en geen groen -- zie de kop van dit bestand. */
    .knop.start {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }
    @media (hover: hover) { .knop.start:hover { background: color-mix(in srgb, var(--dac-accent-hi) 24%, transparent); } }

    .knop.stop {
      color: var(--dac-bad);
      border-color: color-mix(in srgb, var(--dac-bad) 40%, transparent);
    }
    @media (hover: hover) { .knop.stop:hover { background: color-mix(in srgb, var(--dac-bad) 14%, transparent); } }

    /* De slimme knop is een schakelaar en laat dat ook zien. */
    .knop.slim[data-aan="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }

    .top.unavailable { opacity: .42; }

    /* Smal: dan vervallen de woorden op de knoppen en blijven de iconen. Drie
       knoppen met tekst passen niet in een halve kolom. */
    @container (max-width: 320px) {
      .knop .lb { display: none; }
      .knop { flex: 0 0 auto; padding: 9px 14px; }
      .keuze { flex: 1 1 auto; }
    }

    :focus-visible { outline: 2px solid var(--tone); outline-offset: 2px; }
  `);var Na=class extends D{defaults(){return{icon:"dishwasher"}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"dishwasher",auto:!1}]}schema(){return[{name:"name",selector:_.text()},{name:"status",selector:_.entity(["sensor","binary_sensor"])},{name:"remaining",selector:_.entity(["sensor"])},{name:"progress",selector:_.entity(["sensor","number"])},{name:"program",selector:_.entity(["select","input_select"])},{name:"start",selector:_.entity(["button","input_button","script","switch","automation"])},{name:"stop",selector:_.entity(["button","input_button","script","switch","automation"])},{name:"door",selector:_.entity(["binary_sensor"])},{name:"smart",selector:_.entity(["input_boolean","switch"])}]}label(e){return{name:"Naam",status:"Statussensor",remaining:"Resterende tijd",progress:"Voortgang (0-100%)",program:"Programmakeuze",start:"Start / pauze",stop:"Stop",door:"Klep- of deursensor",smart:"Slimme sturing"}[e.name]??super.label(e)}helper(e){return{status:"De sensor die Run, Ready, Finished of iets in die geest meldt. De kaart vertaalt dat zelf.",remaining:"Een tijdstip, een aantal minuten of een klok als 1:24:00 \u2014 alle drie worden gelezen. Een tijdstip is het moment waarop hij klaar is, geen duur.",progress:"Zonder deze sensor is er geen stand, en schuift er een streepje heen en weer zolang hij draait.",program:"Een keuzelijst met de programma's. Verschijnt als uitklaplijst op de kaart.",start:"Een knop, een script of een schakelaar \u2014 de kaart kiest zelf de juiste service.",stop:"Idem. Deze knop is rood, want hij onderbreekt iets dat loopt.",door:"Staat de klep open, dan zegt de kaart dat in plaats van 'klaar om te starten'.",smart:"De input_boolean van je eigen slimme sturing. De knop licht op als hij aanstaat."}[e.name]}};I("domotiapp-dishwasher-card-editor",Na);N("domotiapp-dishwasher-card",ln,{name:"DomotiApp Vaatwasser",description:"Status, resterende tijd met voortgangsbalk, programmakeuze en de knoppen \u2014 met een balk die loopt zolang hij draait."});var dn=globalThis,cn=dn.ShadowRoot&&(dn.ShadyCSS===void 0||dn.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ca=Symbol(),io=new WeakMap,ut=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==Ca)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(cn&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=io.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&io.set(t,e))}return e}toString(){return this.cssText}},fe=a=>new ut(typeof a=="string"?a:a+"",void 0,Ca),te=(a,...e)=>{let t=a.length===1?a[0]:e.reduce((n,i,r)=>n+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+a[r+1],a[0]);return new ut(t,a,Ca)},ro=(a,e)=>{if(cn)a.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let n=document.createElement("style"),i=dn.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=t.cssText,a.appendChild(n)}},Ta=cn?a=>a:a=>a instanceof CSSStyleSheet?(e=>{let t="";for(let n of e.cssRules)t+=n.cssText;return fe(t)})(a):a;var{is:Xl,defineProperty:Ql,getOwnPropertyDescriptor:Yl,getOwnPropertyNames:Jl,getOwnPropertySymbols:ed,getPrototypeOf:td}=Object,pn=globalThis,oo=pn.trustedTypes,nd=oo?oo.emptyScript:"",ad=pn.reactiveElementPolyfillSupport,mt=(a,e)=>a,La={toAttribute(a,e){switch(e){case Boolean:a=a?nd:null;break;case Object:case Array:a=a==null?a:JSON.stringify(a)}return a},fromAttribute(a,e){let t=a;switch(e){case Boolean:t=a!==null;break;case Number:t=a===null?null:Number(a);break;case Object:case Array:try{t=JSON.parse(a)}catch{t=null}}return t}},lo=(a,e)=>!Xl(a,e),so={attribute:!0,type:String,converter:La,reflect:!1,useDefault:!1,hasChanged:lo};Symbol.metadata??=Symbol("metadata"),pn.litPropertyMetadata??=new WeakMap;var be=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=so){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),i=this.getPropertyDescriptor(e,n,t);i!==void 0&&Ql(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){let{get:i,set:r}=Yl(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:i,set(o){let s=i?.call(this);r?.call(this,o),this.requestUpdate(e,s,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??so}static _$Ei(){if(this.hasOwnProperty(mt("elementProperties")))return;let e=td(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(mt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(mt("properties"))){let t=this.properties,n=[...Jl(t),...ed(t)];for(let i of n)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[n,i]of t)this.elementProperties.set(n,i)}this._$Eh=new Map;for(let[t,n]of this.elementProperties){let i=this._$Eu(t,n);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let i of n)t.unshift(Ta(i))}else e!==void 0&&t.push(Ta(e));return t}static _$Eu(e,t){let n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ro(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:La).toAttribute(t,n.type);this._$Em=e,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){let n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let r=n.getPropertyOptions(i),o=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:La;this._$Em=i;let s=o.fromAttribute(t,r.type);this[i]=s??this._$Ej?.get(i)??s,this._$Em=null}}requestUpdate(e,t,n,i=!1,r){if(e!==void 0){let o=this.constructor;if(i===!1&&(r=this[e]),n??=o.getPropertyOptions(e),!((n.hasChanged??lo)(r,t)||n.useDefault&&n.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:r},o){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),r!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[i,r]of n){let{wrapped:o}=r,s=this[i];o!==!0||this._$AL.has(i)||s===void 0||this.C(i,void 0,r,s)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};be.elementStyles=[],be.shadowRootOptions={mode:"open"},be[mt("elementProperties")]=new Map,be[mt("finalized")]=new Map,ad?.({ReactiveElement:be}),(pn.reactiveElementVersions??=[]).push("2.1.2");var Ba=globalThis,co=a=>a,hn=Ba.trustedTypes,po=hn?hn.createPolicy("lit-html",{createHTML:a=>a}):void 0,bo="$lit$",Me=`lit$${Math.random().toFixed(9).slice(2)}$`,vo="?"+Me,id=`<${vo}>`,De=document,ft=()=>De.createComment(""),bt=a=>a===null||typeof a!="object"&&typeof a!="function",Ka=Array.isArray,rd=a=>Ka(a)||typeof a?.[Symbol.iterator]=="function",Da=`[ 	
\f\r]`,gt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ho=/-->/g,uo=/>/g,Te=RegExp(`>|${Da}(?:([^\\s"'>=/]+)(${Da}*=${Da}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),mo=/'/g,go=/"/g,ko=/^(?:script|style|textarea|title)$/i,Ga=a=>(e,...t)=>({_$litType$:a,strings:e,values:t}),w=Ga(1),Ru=Ga(2),Vu=Ga(3),He=Symbol.for("lit-noChange"),z=Symbol.for("lit-nothing"),fo=new WeakMap,Le=De.createTreeWalker(De,129);function xo(a,e){if(!Ka(a)||!a.hasOwnProperty("raw"))throw Error("invalid template strings array");return po!==void 0?po.createHTML(e):e}var od=(a,e)=>{let t=a.length-1,n=[],i,r=e===2?"<svg>":e===3?"<math>":"",o=gt;for(let s=0;s<t;s++){let d=a[s],l,c,p=-1,h=0;for(;h<d.length&&(o.lastIndex=h,c=o.exec(d),c!==null);)h=o.lastIndex,o===gt?c[1]==="!--"?o=ho:c[1]!==void 0?o=uo:c[2]!==void 0?(ko.test(c[2])&&(i=RegExp("</"+c[2],"g")),o=Te):c[3]!==void 0&&(o=Te):o===Te?c[0]===">"?(o=i??gt,p=-1):c[1]===void 0?p=-2:(p=o.lastIndex-c[2].length,l=c[1],o=c[3]===void 0?Te:c[3]==='"'?go:mo):o===go||o===mo?o=Te:o===ho||o===uo?o=gt:(o=Te,i=void 0);let g=o===Te&&a[s+1].startsWith("/>")?" ":"";r+=o===gt?d+id:p>=0?(n.push(l),d.slice(0,p)+bo+d.slice(p)+Me+g):d+Me+(p===-2?s:g)}return[xo(a,r+(a[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},vt=class a{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let r=0,o=0,s=e.length-1,d=this.parts,[l,c]=od(e,t);if(this.el=a.createElement(l,n),Le.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(i=Le.nextNode())!==null&&d.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let p of i.getAttributeNames())if(p.endsWith(bo)){let h=c[o++],g=i.getAttribute(p).split(Me),m=/([.?@])?(.*)/.exec(h);d.push({type:1,index:r,name:m[2],strings:g,ctor:m[1]==="."?Ia:m[1]==="?"?Ra:m[1]==="@"?Va:qe}),i.removeAttribute(p)}else p.startsWith(Me)&&(d.push({type:6,index:r}),i.removeAttribute(p));if(ko.test(i.tagName)){let p=i.textContent.split(Me),h=p.length-1;if(h>0){i.textContent=hn?hn.emptyScript:"";for(let g=0;g<h;g++)i.append(p[g],ft()),Le.nextNode(),d.push({type:2,index:++r});i.append(p[h],ft())}}}else if(i.nodeType===8)if(i.data===vo)d.push({type:2,index:r});else{let p=-1;for(;(p=i.data.indexOf(Me,p+1))!==-1;)d.push({type:7,index:r}),p+=Me.length-1}r++}}static createElement(e,t){let n=De.createElement("template");return n.innerHTML=e,n}};function We(a,e,t=a,n){if(e===He)return e;let i=n!==void 0?t._$Co?.[n]:t._$Cl,r=bt(e)?void 0:e._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(a),i._$AT(a,t,n)),n!==void 0?(t._$Co??=[])[n]=i:t._$Cl=i),i!==void 0&&(e=We(a,i._$AS(a,e.values),i,n)),e}var Ha=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??De).importNode(t,!0);Le.currentNode=i;let r=Le.nextNode(),o=0,s=0,d=n[0];for(;d!==void 0;){if(o===d.index){let l;d.type===2?l=new kt(r,r.nextSibling,this,e):d.type===1?l=new d.ctor(r,d.name,d.strings,this,e):d.type===6&&(l=new Pa(r,this,e)),this._$AV.push(l),d=n[++s]}o!==d?.index&&(r=Le.nextNode(),o++)}return Le.currentNode=De,i}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}},kt=class a{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=z,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=We(this,e,t),bt(e)?e===z||e==null||e===""?(this._$AH!==z&&this._$AR(),this._$AH=z):e!==this._$AH&&e!==He&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):rd(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==z&&bt(this._$AH)?this._$AA.nextSibling.data=e:this.T(De.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=vt.createElement(xo(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{let r=new Ha(i,this),o=r.u(this.options);r.p(t),this.T(o),this._$AH=r}}_$AC(e){let t=fo.get(e.strings);return t===void 0&&fo.set(e.strings,t=new vt(e)),t}k(e){Ka(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,n,i=0;for(let r of e)i===t.length?t.push(n=new a(this.O(ft()),this.O(ft()),this,this.options)):n=t[i],n._$AI(r),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let n=co(e).nextSibling;co(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},qe=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,r){this.type=1,this._$AH=z,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=z}_$AI(e,t=this,n,i){let r=this.strings,o=!1;if(r===void 0)e=We(this,e,t,0),o=!bt(e)||e!==this._$AH&&e!==He,o&&(this._$AH=e);else{let s=e,d,l;for(e=r[0],d=0;d<r.length-1;d++)l=We(this,s[n+d],t,d),l===He&&(l=this._$AH[d]),o||=!bt(l)||l!==this._$AH[d],l===z?e=z:e!==z&&(e+=(l??"")+r[d+1]),this._$AH[d]=l}o&&!i&&this.j(e)}j(e){e===z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},Ia=class extends qe{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===z?void 0:e}},Ra=class extends qe{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==z)}},Va=class extends qe{constructor(e,t,n,i,r){super(e,t,n,i,r),this.type=5}_$AI(e,t=this){if((e=We(this,e,t,0)??z)===He)return;let n=this._$AH,i=e===z&&n!==z||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==z&&(n===z||i);i&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Pa=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){We(this,e)}};var sd=Ba.litHtmlPolyfillSupport;sd?.(vt,kt),(Ba.litHtmlVersions??=[]).push("3.3.3");var _o=(a,e,t)=>{let n=t?.renderBefore??e,i=n._$litPart$;if(i===void 0){let r=t?.renderBefore??null;n._$litPart$=i=new kt(e.insertBefore(ft(),r),r,void 0,t??{})}return i._$AI(a),i};var Ua=globalThis,Z=class extends be{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=_o(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return He}};Z._$litElement$=!0,Z.finalized=!0,Ua.litElementHydrateSupport?.({LitElement:Z});var ld=Ua.litElementPolyfillSupport;ld?.({LitElement:Z});(Ua.litElementVersions??=[]).push("4.2.2");var re=te`
  :host {
    ${fe(X)}
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  ${fe(ke)}
`;var dd=["unavailable","unknown"],cd=["color_temp_kelvin","rgb_color","hs_color","xy_color"];function un({scene:a,memberEntityIds:e,states:t}){let n=[],i=[],r=a?.lights??{},o=Array.isArray(e)?e:[],s=t??{};for(let d of o){let l=r[d];if(!l||typeof l!="object")continue;let c=s[d];if(!c||dd.includes(c.state)){i.push(d);continue}if(l.state==="off"){n.push({service:"turn_off",data:{entity_id:d,transition:1}});continue}let p={entity_id:d,transition:1};typeof l.brightness=="number"&&(p.brightness=l.brightness);for(let h of cd)if(l[h]!==void 0){p[h]=l[h];break}n.push({service:"turn_on",data:p})}return{oproepen:n,overgeslagen:i}}async function mn(a,e){let t=await Promise.allSettled(e.map(i=>a(i.service,i.data))),n=[];return t.forEach((i,r)=>{i.status==="rejected"&&n.push({entityId:e[r].data.entity_id,fout:i.reason})}),n}var qa=["hs","rgb","rgbw","rgbww","xy"],Fa="color_temp",pd="onoff";var Ie="kleur";var hd=["unavailable","unknown"],yo=["color_temp_kelvin","rgb_color","hs_color","xy_color"],ud=[0,100];function ce(a){if(!a)return{bekend:!1,beschikbaar:!1,helderheid:!1,kleurtemp:!1,kleur:!1,minKelvin:2e3,maxKelvin:6535,kelvinUitDefaults:!1};let e=a.attributes??{},t=Array.isArray(e.supported_color_modes)?e.supported_color_modes:null,n=t!==null&&t.length===1&&t[0]===pd,i=t!==null&&t.includes(Fa),r=t!==null&&t.some(l=>qa.includes(l)),o=e.min_color_temp_kelvin,s=e.max_color_temp_kelvin,d=typeof o=="number"&&typeof s=="number"&&o<s;return{bekend:!0,beschikbaar:!hd.includes(a.state),helderheid:!n,kleurtemp:i,kleur:r,minKelvin:d?Math.round(o):2e3,maxKelvin:d?Math.round(s):6535,kelvinUitDefaults:i&&!d}}function md(){return{state:"off"}}function zo(a,e){let t=e??ce(a);return t.bekend&&t.beschikbaar&&a.state==="on"?{state:"on",...xd(a,t)}:t.helderheid?{state:"on",brightness:255}:{state:"on"}}function jo(a,e,t,n){return e?a&&a.state==="on"?{...a}:zo(t,n):{state:"off"}}function Eo(a,e,t,n){let i=n??ce(t),r=ei(a,t,i);return i.helderheid&&(r.brightness=H(e,1,255)),r}function Za(a,e,t,n){let i=n??ce(t),r=ei(a,t,i);return Do(r),r.color_temp_kelvin=H(e,i.minKelvin,i.maxKelvin),r}function Xa(a,e,t,n){let i=n??ce(t),r=ei(a,t,i);return Do(r),r.hs_color=[H(e?.[0],0,360),H(e?.[1],0,100)],r}function gn(a,e,t){return a??md()}function $o(a,e,t){let n=gn(a,e,t);if(typeof n.brightness=="number")return H(n.brightness,1,255);let i=e?.attributes?.brightness;return typeof i=="number"?H(i,1,255):255}function Qa(a,e,t){let n=t??ce(e),i=gn(a,e,n);if(typeof i.color_temp_kelvin=="number")return H(i.color_temp_kelvin,n.minKelvin,n.maxKelvin);let r=e?.attributes?.color_temp_kelvin;return typeof r=="number"?H(r,n.minKelvin,n.maxKelvin):Math.round((n.minKelvin+n.maxKelvin)/2)}function fn(a,e,t){let n=gn(a,e,t);if(Wa(n.hs_color))return[H(n.hs_color[0],0,360),H(n.hs_color[1],0,100)];let i=e?.attributes?.hs_color;return Wa(i)?[H(i[0],0,360),H(i[1],0,100)]:[...ud]}function Ya(a){return a!=null&&typeof a=="object"}function Ao(a,e,t){let n=Array.isArray(e)?e:[],i=Array.isArray(a)?a:[],r=Number.isInteger(t)?t:i.length;return n.filter(o=>{for(let s=0;s<r;s+=1)if(!Ya(i[s]?.lights?.[o]))return!0;return!1})}function Mo(a){return!Number.isInteger(a)||a<=0?null:a===1?"1 lamp nog niet ingesteld":`${a} lampen nog niet ingesteld`}function Ja(a,e,t){return gn(a,e,t).state==="on"}function So(a,e,t){let n=t??ce(e);if(!n.bekend)return{aanuit:!1,helderheid:!1,kleurtemp:!1,kleur:!1,kleurkeuze:!1,stand:null};let i=Ja(a,e,n),r=Oo(n),o=r?gd(a,e,n):null;return{aanuit:!0,helderheid:i&&n.helderheid,kleurtemp:i&&n.kleurtemp&&(!r||o==="wit"),kleur:i&&n.kleur&&(!r||o===Ie),kleurkeuze:i&&r,stand:i?o:null}}function Oo(a){return!!(a?.kleurtemp&&a?.kleur)}function gd(a,e,t){let n=t??ce(e);if(a&&typeof a=="object"){if(typeof a.color_temp_kelvin=="number")return"wit";if(yo.slice(1).some(r=>a[r]!==void 0))return Ie}let i=e?.attributes?.color_mode;return i===Fa&&n.kleurtemp?"wit":qa.includes(i)&&n.kleur?Ie:"wit"}function No(a,e,t,n){let i=n??ce(t);return Oo(i)?e==="wit"?Za(a,Qa(a,t,i),t,i):Xa(a,fn(a,t,i),t,i):a}function Co(a){let e=H(a,0,255);return e<=0?0:Math.max(1,Math.round(e/255*100))}function To(a){let e=H(a,1,100);return H(Math.round(e/100*255),1,255)}var fd=1e3,bd=4e4,wo=7;function vd(a){let e=H(a,fd,bd)/100,t=e<=66?255:329.698727446*(e-60)**-.1332047592,n=e<=66?99.4708025861*Math.log(e)-161.1195681661:288.1221695283*(e-60)**-.0755148492,i;return e>=66?i=255:e<=19?i=0:i=138.5177312231*Math.log(e-10)-305.0447927307,[H(t,0,255),H(n,0,255),H(i,0,255)]}function kd(a){let[e,t,n]=vd(a);return`rgb(${e}, ${t}, ${n})`}function Lo(a,e){let t=Math.min(a,e),n=Math.max(a,e);return`linear-gradient(to right, ${Array.from({length:wo},(r,o)=>{let s=o/(wo-1),d=t+(n-t)*s;return`${kd(d)} ${Math.round(s*100)}%`}).join(", ")})`}function xd(a,e){let t=a.attributes??{},n={};e.helderheid&&(n.brightness=typeof t.brightness=="number"?H(t.brightness,1,255):255);let i=t.color_mode;return e.kleurtemp&&i===Fa&&typeof t.color_temp_kelvin=="number"?n.color_temp_kelvin=H(t.color_temp_kelvin,e.minKelvin,e.maxKelvin):e.kleur&&qa.includes(i)&&Wa(t.hs_color)&&(n.hs_color=[H(t.hs_color[0],0,360),H(t.hs_color[1],0,100)]),n}function ei(a,e,t){return a&&a.state==="on"?{...a}:zo(e,t)}function Do(a){for(let e of yo)delete a[e]}function Wa(a){return Array.isArray(a)&&a.length===2&&typeof a[0]=="number"&&typeof a[1]=="number"}function H(a,e,t){let n=Number(a);return Number.isFinite(n)?Math.min(t,Math.max(e,Math.round(n))):e}var bn="domotiapp-scene-card",ti="domotiapp-scene-card-editor",Ho="domotiapp-scene-editor";var xt=["een","twee","drie"],Io="pencil",Ro=["grid_options","layout_options","view_layout","visibility"];var Vo="entity_id",Fe=class extends Z{constructor(){super();j(this,"_label",t=>t.name==="entity"?"Lichtgroep":t.name==="bare"?"Achtergrond weglaten":this._friendlyName(t.name));j(this,"_helper",t=>t.name==="entity"?"De lichtgroep waarvan deze kaart de scenes beheert.":t.name==="bare"?"Haalt de vulling en de schaduw onder de kaart weg. De rand blijft staan.":t.name);this._getypt={}}setConfig(t){this._config={...t}}_lichtgroepen(){let t=this.hass?.states??{};return Object.keys(t).filter(n=>n.startsWith("light.")&&Array.isArray(t[n].attributes?.[Vo]))}_leden(){let t=this._config?.entity,n=this.hass?.states?.[t]?.attributes?.[Vo];return Array.isArray(n)?n.filter(i=>i!==t):[]}_entiteitSchema(){let t=this._lichtgroepen();return[{name:"entity",required:!0,selector:t.length?{entity:{include_entities:t}}:{entity:{domain:"light"}}},{name:"bare",selector:{boolean:{}}}]}_namenSchema(t){return t.map(n=>({name:n,selector:{text:{}}}))}_naamData(t){let n=this._config?.name_overrides??{},i={};for(let r of t)r in this._getypt?i[r]=this._getypt[r]:n[r]&&(i[r]=n[r]);return i}_friendlyName(t){return this.hass?.states?.[t]?.attributes?.friendly_name||t}_entiteitGewijzigd(t){t.stopPropagation();let n=t.detail.value??{},i={...this._config,entity:n.entity};n.bare?i.bare=!0:delete i.bare,i.entity!==this._config?.entity&&(delete i.name_overrides,this._getypt={}),this._stuurDoor(i)}_namenGewijzigd(t){t.stopPropagation(),this._getypt={...this._getypt,...t.detail.value};let n={};for(let[r,o]of Object.entries(this._getypt))typeof o=="string"&&o.trim()&&(n[r]=o.trim());let i={...this._config};Object.keys(n).length?i.name_overrides=n:delete i.name_overrides,this._stuurDoor(i)}_stuurDoor(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return z;let t=this._leden();return w`
      <ha-form
        .hass=${this.hass}
        .data=${{entity:this._config.entity??"",bare:!!this._config.bare}}
        .schema=${this._entiteitSchema()}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._entiteitGewijzigd}
      ></ha-form>

      ${t.length?w`
            <div class="namen">
              <div class="kop">Namen van de lampen</div>
              <div class="uitleg">
                Laat een veld leeg om de naam uit Home Assistant te gebruiken.
              </div>
              <ha-form
                .hass=${this.hass}
                .data=${this._naamData(t)}
                .schema=${this._namenSchema(t)}
                .computeLabel=${this._label}
                .computeHelper=${this._helper}
                @value-changed=${this._namenGewijzigd}
              ></ha-form>
            </div>
          `:z}
    `}};j(Fe,"properties",{hass:{attribute:!1},_config:{state:!0},_getypt:{state:!0}}),j(Fe,"styles",[re,te`
      .namen {
        margin-top: 16px;
      }
      .kop {
        font-size: 13.5px;
        font-weight: 500;
        color: var(--dac-ink);
        margin-bottom: 4px;
      }
      .uitleg {
        font-size: 12px;
        line-height: 1.45;
        color: var(--dac-ink-2);
        margin-bottom: 8px;
      }
    `]);var _d="domotiapp_lovelace/snapshot/create",wd="domotiapp_lovelace/snapshot/close",vn=class{constructor({roepCommandoAan:e,entityId:t}){this._roep=e,this._entityId=t,this._aanmaak=null,this._afsluiting=null}get heeftSnapshot(){return this._aanmaak!==null}get isGesloten(){return this._afsluiting!==null}async zorgVoorSnapshot(){return this._aanmaak===null&&(this._aanmaak=this._roep(_d,{entity_id:this._entityId}).catch(e=>{throw this._aanmaak=null,e})),this._aanmaak}async sluit({opslaan:e=!1}={}){return this.heeftSnapshot?this._afsluiting!==null?this._afsluiting:(this._afsluiting=(async()=>{try{await this._aanmaak}catch{return{gedaan:!1}}return await this._roep(wd,{entity_id:this._entityId,restore:!e}),{gedaan:!0}})(),this._afsluiting):{gedaan:!1}}};async function Po({beheer:a,oproepen:e,voerUit:t}){return await a.zorgVoorSnapshot(),t(e)}var ai="laden",ii="klaar",Bo="fout",jd=`linear-gradient(to right, ${[0,60,120,180,240,300,360].map(a=>`hsl(${a}, 100%, 50%)`).join(", ")})`,Ze=class extends Z{constructor(){super(),this._scenes=null,this._leden=[],this._tab=0,this._toestand=ai,this._melding="",this._bezig=!1,this._kelvinGemeld=new Set,this._snapshot=null}firstUpdated(){this._haalOp()}async _haalOp(){this._toestand=ai;try{let e=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:this.entityId});return this._neemOver(e),this._toestand=ii,e}catch(e){return this._melding=e?.message??String(e),this._toestand=Bo,null}}_neemOver(e){this._scenes=Array.from({length:3},(t,n)=>{let i=e.scenes?.[n]??{};return{icon:i.icon||xt[n],lights:{...i.lights??{}}}}),this._leden=e.member_entity_ids??[],this._melding=""}_stateVan(e){return this.hass?.states?.[e]}_besturingVan(e){let t=ce(this._stateVan(e));return t.kelvinUitDefaults&&!this._kelvinGemeld.has(e)&&(this._kelvinGemeld.add(e),console.warn(`domotiapp-scene-editor: ${e} meldt geen Kelvin-grenzen; ${t.minKelvin}\u2013${t.maxKelvin} K aangehouden (SPEC 6.3).`)),t}_waardeVan(e){return this._scenes?.[this._tab]?.lights?.[e]}_zetLamp(e,t){this._scenes=this._scenes.map((n,i)=>{if(i!==this._tab)return n;let r={...n.lights};return t===void 0?delete r[e]:r[e]=t,{...n,lights:r}})}_zetIcoon(e){this._scenes=this._scenes.map((t,n)=>n===this._tab?{...t,icon:e||xt[n]}:t)}_kiesTab(e){this._tab=e}get _kanOpslaan(){return this._toestand===ii&&!this._bezig&&this._leden.length>0}async _slaOp(){if(!this._kanOpslaan)return;this._bezig=!0,this._melding="";try{await this.hass.callWS({type:"domotiapp_lovelace/scenes/save",entity_id:this.entityId,scenes:this._scenes})}catch(t){this._melding=t?.message??String(t),this._bezig=!1;return}let e=await this._haalOp();this._bezig=!1,e&&this.dispatchEvent(new CustomEvent("scenes-opgeslagen",{detail:e,bubbles:!0,composed:!0})),this._sluit({opslaan:!0})}get _beheer(){return this._snapshot===null&&(this._snapshot=new vn({entityId:this.entityId,roepCommandoAan:(e,t)=>this.hass.callWS({type:e,...t})})),this._snapshot}get _kanVoorbeeld(){return this._toestand===ii&&!this._bezig&&this._leden.length>0}async _voorbeeld(){if(!this._kanVoorbeeld)return;let{oproepen:e}=un({scene:this._scenes[this._tab],memberEntityIds:this._leden,states:this.hass.states});this._bezig=!0,this._melding="";try{let t=await Po({beheer:this._beheer,oproepen:e,voerUit:n=>mn((i,r)=>this.hass.callService("light",i,r),n)});t.length&&(this._melding=`Deze lampen reageerden niet: ${t.map(n=>this._naam(n.entityId)).join(", ")}.`)}catch(t){this._melding=`Het voorbeeld is niet gestart: ${t?.message??String(t)}`}finally{this._bezig=!1}}_sluit({opslaan:e=!1}={}){this.dispatchEvent(new CustomEvent("editor-gesloten",{bubbles:!0,composed:!0})),this._sluitSnapshot({opslaan:e})}async _sluitSnapshot({opslaan:e}){try{await this._beheer.sluit({opslaan:e})}catch(t){console.warn(`domotiapp-scene-editor: de snapshot kon niet worden ${e?"verwijderd":"hersteld"}: ${t?.message??t}`)}}disconnectedCallback(){super.disconnectedCallback(),this._snapshot&&this._snapshot.heeftSnapshot&&this._sluitSnapshot({opslaan:!1})}_dialoogGesloten(e){e.stopPropagation(),this._sluit()}_naam(e){return this.nameOverrides?.[e]||this._stateVan(e)?.attributes?.friendly_name||e}render(){return w`
      <ha-dialog
        open
        .headerTitle=${"Scenes bewerken"}
        @closed=${this._dialoogGesloten}
      >
        ${this._renderInhoud()}
        <div slot="footer" class="acties">
          <ha-button
            appearance="plain"
            .disabled=${!this._kanVoorbeeld}
            @click=${this._voorbeeld}
          >
            Voorbeeld
          </ha-button>
          <ha-button @click=${()=>this._sluit()}>Annuleren</ha-button>
          <ha-button .disabled=${!this._kanOpslaan} @click=${this._slaOp}>
            Opslaan
          </ha-button>
        </div>
      </ha-dialog>
    `}_renderInhoud(){return this._toestand===ai?w`<div class="inhoud">Bezig met laden…</div>`:this._toestand===Bo?w`
        <div class="inhoud">
          <ha-alert alert-type="error">${this._melding}</ha-alert>
        </div>
      `:w`
      <div class="inhoud">
        <ha-tab-group>
          ${this._scenes.map((e,t)=>w`
              <ha-tab-group-tab
                panel=${`scene-${t+1}`}
                .active=${t===this._tab}
                @click=${()=>this._kiesTab(t)}
              >
                Scene ${t+1}
              </ha-tab-group-tab>
            `)}
        </ha-tab-group>

        <dac-icon-picker
          .hass=${this.hass}
          label="Icoon van deze scene"
          fallback="een"
          .auto=${!1}
          .value=${this._scenes[this._tab].icon}
          @value-changed=${e=>this._zetIcoon(e.detail.value)}
        ></dac-icon-picker>

        ${this._melding?w`<ha-alert alert-type="error">${this._melding}</ha-alert>`:z}
        ${this._leden.length===0?w`<ha-alert alert-type="info">
              Deze lichtgroep bevat geen lampen.
            </ha-alert>`:w`<div class="lampen">
              ${this._leden.map(e=>this._renderLamp(e))}
            </div>`}
      </div>
    `}_renderLamp(e){let t=this._stateVan(e),n=this._besturingVan(e),i=this._waardeVan(e),r=Ja(i,t,n),o=So(i,t,n);return w`
      <div class="lamp">
        <div class="kop">
          <div class="naam">
            <span class="tekst">
              ${this._naam(e)}
              ${n.bekend?n.beschikbaar?z:w`<span class="hint">niet bereikbaar</span>`:w`<span class="hint">lamp niet gevonden</span>`}
            </span>
            ${Ya(i)?z:w`<span class="nieuw">nieuw</span>`}
          </div>
          ${n.bekend?w`
                <div class="bediening">
                  ${o.kleurkeuze?this._renderKleurkeuze(e,t,n,i,o.stand):z}
                  <ha-switch
                    .checked=${r}
                    @change=${s=>this._zetLamp(e,jo(i,s.target.checked,t,n))}
                  ></ha-switch>
                </div>
              `:z}
        </div>
        ${this._renderBesturing(e,t,n,i,o)}
      </div>
    `}_renderBesturing(e,t,n,i,r){return w`
      ${r.helderheid?this._renderHelderheid(e,t,n,i):z}
      ${r.kleurtemp?this._renderKleurtemp(e,t,n,i):z}
      ${r.kleur?this._renderKleur(e,t,n,i):z}
    `}_renderHelderheid(e,t,n,i){let r=Co($o(i,t,n)),o=s=>{s.stopPropagation(),this._zetLamp(e,Eo(this._waardeVan(e),To(s.detail.value),t,n))};return w`
      <div class="besturing">
        <div class="label">
          <span>Helderheid</span><span>${r} %</span>
        </div>
        <ha-control-slider
          touch-action="pan-y"
          unit="%"
          .min=${1}
          .max=${100}
          .step=${1}
          .value=${r}
          @slider-moved=${o}
          @value-changed=${o}
        ></ha-control-slider>
      </div>
    `}_renderKleurkeuze(e,t,n,i,r){let o=s=>d=>{d.stopPropagation(),s!==r&&this._zetLamp(e,No(this._waardeVan(e),s,t,n))};return w`
      <div class="kleurkeuze">
        <button
          class="keuze ${r===Ie?"actief":""}"
          aria-pressed=${r===Ie?"true":"false"}
          @click=${o(Ie)}
        >
          Kleur
        </button>
        <button
          class="keuze ${r==="wit"?"actief":""}"
          aria-pressed=${r==="wit"?"true":"false"}
          @click=${o("wit")}
        >
          Wit
        </button>
      </div>
    `}_renderKleurtemp(e,t,n,i){let r=Qa(i,t,n),o=s=>{s.stopPropagation(),this._zetLamp(e,Za(this._waardeVan(e),s.detail.value,t,n))};return w`
      <div class="besturing">
        <div class="label">
          <span>Kleurtemperatuur</span><span>${r} K</span>
        </div>
        <ha-control-slider
          touch-action="pan-y"
          mode="cursor"
          .min=${n.minKelvin}
          .max=${n.maxKelvin}
          .step=${1}
          .value=${r}
          style=${`--control-slider-background: ${Lo(n.minKelvin,n.maxKelvin)}; --control-slider-background-opacity: 1`}
          @slider-moved=${o}
          @value-changed=${o}
        ></ha-control-slider>
      </div>
    `}_renderKleur(e,t,n,i){let[r,o]=fn(i,t,n),s=d=>l=>{l.stopPropagation();let c=fn(this._waardeVan(e),t,n),p=d==="tint"?[l.detail.value,c[1]]:[c[0],l.detail.value];this._zetLamp(e,Xa(this._waardeVan(e),p,t,n))};return w`
      <div class="besturing">
        <div class="label">
          <span>Kleur</span><span>${r}° / ${o} %</span>
        </div>
        <div class="kleurregelaars">
          <div class="schuiven">
            <ha-control-slider
              touch-action="pan-y"
              mode="cursor"
              .min=${0}
              .max=${360}
              .step=${1}
              .value=${r}
              style=${`--control-slider-background: ${jd}; --control-slider-background-opacity: 1`}
              @slider-moved=${s("tint")}
              @value-changed=${s("tint")}
            ></ha-control-slider>
            <ha-control-slider
              touch-action="pan-y"
              .min=${0}
              .max=${100}
              .step=${1}
              .value=${o}
              style=${`--control-slider-color: hsl(${r}, 100%, 50%)`}
              @slider-moved=${s("verzadiging")}
              @value-changed=${s("verzadiging")}
            ></ha-control-slider>
          </div>
          <div
            class="staal"
            style=${`background: hsl(${r}, ${o}%, 50%)`}
          ></div>
        </div>
      </div>
    `}};j(Ze,"properties",{hass:{attribute:!1},entityId:{attribute:!1},nameOverrides:{attribute:!1},_scenes:{state:!0},_leden:{state:!0},_tab:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0}}),j(Ze,"styles",[re,te`
      /* De dialoog zelf is die van Home Assistant -- Escape, de focus-trap, de
         scroll-lock en de stapeling ten opzichte van andere dialogen zijn geen
         dingen die je namaakt. Wat we wel doen is hem onze kleuren en maten
         geven, zodat wat erin staat bij de kaarten hoort. */
      ha-dialog {
        --mdc-theme-surface: var(--dac-bg-raise, #12120f);
        --mdc-dialog-heading-ink-color: var(--dac-ink);
        --mdc-dialog-content-ink-color: var(--dac-ink);
        --dialog-content-padding: 16px;
      }

      .inhoud {
        display: flex;
        flex-direction: column;
        gap: 14px;
        min-width: 280px;
      }

      .lampen {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      /* Eén lamp is één blok in dezelfde vorm als een kaart: hetzelfde
         oppervlak, dezelfde rand, dezelfde kleine ronding. */
      .lamp {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        background: var(--dac-surface);
        border: 1px solid var(--dac-border);
        border-radius: var(--dac-radius-sm);
      }

      .kop {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* De keuzeknoppen staan naast de schakelaar, in dezelfde rij (SPEC 6.5). */
      .bediening {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      /* Dezelfde pil als de kolomkiezer in de entiteiteneditor. */
      .kleurkeuze {
        display: inline-flex;
        gap: 2px;
        padding: 3px;
        background: rgba(127, 127, 127, 0.12);
        border-radius: var(--dac-radius-pill);
      }
      .keuze {
        appearance: none;
        border: 0;
        cursor: pointer;
        min-width: 44px;
        height: 24px;
        padding: 0 10px;
        border-radius: var(--dac-radius-pill);
        background: transparent;
        color: var(--dac-ink-3);
        font: inherit;
        font-size: 12px;
        line-height: 1;
      }
      .keuze.actief {
        background: var(--dac-accent-hi);
        color: #0c0c0a;
        font-weight: 600;
      }

      .naam {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        color: var(--dac-ink);
        font-size: 13.5px;
        font-weight: 500;
      }
      .naam .tekst {
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .hint {
        display: block;
        color: var(--dac-ink-3);
        font-size: 11.5px;
        font-weight: 400;
      }

      /* Klein en rustig, op dezelfde regel als de naam, zodat de rij er niet
         hoger van wordt. */
      .nieuw {
        flex: none;
        margin-left: 8px;
        padding: 1px 7px;
        border-radius: var(--dac-radius-pill);
        background: color-mix(in srgb, var(--dac-accent-hi) 16%, transparent);
        border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 34%, transparent);
        color: var(--dac-accent-hi);
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .besturing {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .label {
        display: flex;
        justify-content: space-between;
        color: var(--dac-ink-2);
        font-size: 11.5px;
        font-variant-numeric: tabular-nums;
      }

      ha-control-slider {
        --control-slider-thickness: 32px;
        --control-slider-border-radius: var(--dac-radius-sm);
        --control-slider-color: var(--dac-accent-hi);
      }

      .kleurregelaars {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .kleurregelaars .schuiven {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }

      /* Een kleurstaal moet de gekozen kleur tonen; dat is de gegevenswaarde
         zelf en geen themakleur. De rand eromheen is dat wel. */
      .staal {
        width: 36px;
        height: 36px;
        flex: none;
        border-radius: var(--dac-radius-sm);
        border: 1px solid var(--dac-border-hi);
      }

      .acties {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      ha-tab-group {
        --ha-tab-group-indicator-color: var(--dac-accent-hi);
      }
    `]);var Ed="0.19.0",$d=["type","entity","name_overrides","bare"],xn="laden",_t="klaar",ri="leeg",oi="geen-groep",Ko="opslagfout",Go="fout",wt=class extends Z{constructor(){super();j(this,"_opnieuw",()=>{this._herkansing.herstel(),this._haalScenesOp()});this._scenes=null,this._leden=[],this._toestand=xn,this._melding="",this._bezig=!1,this._editorOpen=!1,this._opgehaaldVoor=null,this._bestondVorigeKeer=!1,this._herkansing=new ge(()=>this._haalScenesOp()),this._verbinding=new Ge}static getConfigElement(){return document.createElement(ti)}static getStubConfig(t){return{entity:Object.keys(t?.states??{}).find(i=>i.startsWith("light.")&&Array.isArray(t.states[i].attributes?.entity_id))??""}}updated(){let t=this.renderRoot?.querySelector(".card, .needs");t!==this._rasterVak&&(this._rasterUit?.(),this._rasterVak=t,this._rasterUit=t?P(t):null),L(t)}disconnectedCallback(){super.disconnectedCallback(),this._herkansing.stop(),this._rasterUit?.(),this._rasterUit=null,this._rasterVak=null}setConfig(t){if(!t?.entity)throw new Error("Kies een lichtgroep bij 'entity'.");let n=Object.keys(t).filter(i=>!$d.includes(i)&&!Ro.includes(i));n.length&&console.warn(`${bn}: onbekende sleutels in de configuratie: ${n.join(", ")}`),this._config=t,this.toggleAttribute("bare",!!t.bare)}getCardSize(){return 1}getGridOptions(){return{rows:"auto",columns:"full",min_columns:6,min_rows:Ve(this.renderRoot?.querySelector?.(".card"))??1}}willUpdate(){let t=this._config?.entity;if(!this.hass||!t)return;let n=!!this.hass.states[t];if(this._opgehaaldVoor!==t){this._opgehaaldVoor=t,this._bestondVorigeKeer=n,this._haalScenesOp();return}if(this._verbinding.herverbonden(this.hass)){this._bestondVorigeKeer=n,this._herkansing.herstel(),this._haalScenesOp();return}if(n&&!this._bestondVorigeKeer&&this._toestand===oi){this._bestondVorigeKeer=!0,this._haalScenesOp();return}this._bestondVorigeKeer=n}async _haalScenesOp(){let t=this._config.entity;this._toestand=xn,this._melding="";try{let n=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:t});this._scenes=n.scenes,this._leden=n.member_entity_ids??[],this._toestand=this._leden.length===0?ri:_t,this._herkansing.herstel()}catch(n){this._verwerkFout(n,t)}}_verwerkFout(t,n){let i=t?.code;if(this._melding=t?.message??String(t),Ne(t)&&this._herkansing.plan()){this._toestand=xn;return}if(i==="home_assistant_error"){this._toestand=Ko;return}if(!this.hass.states[n]){this._toestand=oi;return}this._toestand=Go}_naam(t){return this._config?.name_overrides?.[t]||this.hass?.states?.[t]?.attributes?.friendly_name||t}async _pasSceneToe(t){if(this._bezig||this._toestand!==_t)return;let{oproepen:n}=un({scene:this._scenes?.[t],memberEntityIds:this._leden,states:this.hass.states});if(n.length){this._bezig=!0;try{let i=await mn((r,o)=>this.hass.callService("light",r,o),n);i.length&&this._meldMislukking(i.map(r=>r.entityId))}finally{this._bezig=!1}}}_meldMislukking(t){let n=t.map(r=>this._naam(r)).join(", "),i=t.length===1?`${n} reageerde niet.`:`Deze lampen reageerden niet: ${n}.`;this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:i},bubbles:!0,composed:!0}))}_bewerk(){this._toestand===_t&&(this._editorOpen=!0)}_sluitEditor(){this._editorOpen=!1}_scenesOpgeslagen(t){t.stopPropagation(),this._scenes=t.detail.scenes,this._leden=t.detail.member_entity_ids??[],this._toestand=this._leden.length===0?ri:_t}render(){if(!this._config)return z;switch(this._toestand){case oi:return this._renderFout(`Lichtgroep ${this._config.entity} bestaat niet (meer). Pas de kaart aan.`);case Ko:return this._renderFout("De opgeslagen scenes van deze kamer zijn onleesbaar.",this._melding);case Go:return this._renderFout("De scenes konden niet geladen worden.",this._melding,!0);default:return this._renderKaart()}}_renderFout(t,n,i=!1){return w`
      <div class="needs">
        <span class="mark">${this._icoon("question")}</span>
        <span>
          <b>${t}</b>
          ${n?w`<span class="detail">${n}</span>`:z}
          ${i?w`<button type="button" class="opnieuw" @click=${this._opnieuw}>
                Opnieuw proberen
              </button>`:z}
        </span>
      </div>
    `}_icoon(t){let n=document.createElement("template");return n.innerHTML=f(t),n.content.cloneNode(!0)}_renderKaart(){let t=this._toestand===ri,n=this._toestand===xn,i=this._iconen();return w`
      <div class="card surface">
        <div class="rij">
          <div class="scenes">
            ${i.map((r,o)=>w`
                <button
                  type="button"
                  class="chip"
                  ?disabled=${t||n||this._bezig}
                  aria-label=${`Scene ${o+1}`}
                  title=${`Scene ${o+1}`}
                  @click=${()=>this._pasSceneToe(o)}
                >
                  ${this._icoon(r)}
                </button>
              `)}
          </div>
          <span class="scheiding"></span>
          <button
            type="button"
            class="chip potlood"
            ?disabled=${t||n}
            aria-label="Scenes bewerken"
            title="Scenes bewerken"
            @click=${this._bewerk}
          >
            ${this._icoon(Io)}
          </button>
        </div>
        ${t?w`<div class="mededeling">Deze lichtgroep bevat geen lampen.</div>`:this._renderNieuweLampen()}
      </div>
      ${this._editorOpen?this._renderEditor():z}
    `}_renderNieuweLampen(){if(this._toestand!==_t)return z;let t=Ao(this._scenes,this._leden,3).length,n=Mo(t);return n?w`<div class="mededeling">${n}</div>`:z}_renderEditor(){return w`
      <domotiapp-scene-editor
        .hass=${this.hass}
        .entityId=${this._config.entity}
        .nameOverrides=${this._config.name_overrides}
        @editor-gesloten=${this._sluitEditor}
        @scenes-opgeslagen=${this._scenesOpgeslagen}
      ></domotiapp-scene-editor>
    `}_iconen(){return Array.from({length:3},(t,n)=>this._scenes?.[n]?.icon||xt[n])}};j(wt,"properties",{hass:{attribute:!1},_config:{state:!0},_scenes:{state:!0},_leden:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0},_editorOpen:{state:!0}}),j(wt,"styles",[re,te`
      :host { display: block; }

      /* Dezelfde maat als elke andere regelkaart in de familie: 56px is één
         rij in HA's sections-raster, zodat een scenekaart naast een knopkaart
         geen halve regel verschilt. */
      .card {
        min-height: var(--dac-raster, 56px);
        padding: 7px 12px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
      }


      /* Achtergrond weglaten: de VULLING gaat weg, de rand blijft. Zie de
         uitleg bij .surface in theme.js. */
      :host([bare]) .card {
        background: none;
        box-shadow: none;
      }

      .rij {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* De drie scenes verdelen de ruimte links van de scheiding. Zonder
         justify-content plakken ze tegen de linkerrand en valt er een gat vóór
         de scheidingslijn. */
      .scenes {
        flex: 1 1 auto;
        display: flex;
        align-items: center;
        justify-content: space-around;
        gap: 8px;
      }

      /* Een scene is een knop met dezelfde chip als overal: identiteitskleur op
         lage dekking, icoon op volle. */
      .chip {
        width: 40px;
        height: 40px;
        padding: 0;
        cursor: pointer;
        font: inherit;
        --tone: var(--dac-accent-hi);
        transition: background 200ms ease, border-color 200ms ease,
          box-shadow 200ms ease, transform 200ms ease;
      }
      .chip .icon,
      .chip ha-icon {
        width: 20px;
        height: 20px;
        --mdc-icon-size: 20px;
      }
      @media (hover: hover) {
        .chip:hover {
          box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
        }
      }
      .chip:active {
        transform: scale(0.94);
      }
      .chip[disabled] {
        opacity: 0.42;
        pointer-events: none;
      }

      /* Het potlood is geen scene en hoort er ook niet als één uit te zien:
         neutrale inkt, geen vulling, geen rand. */
      .potlood {
        --tone: var(--dac-ink-3);
        background: none;
        border-color: transparent;
      }
      @media (hover: hover) {
        .potlood:hover {
          background: var(--dac-surface-hi);
          box-shadow: none;
        }
      }

      .scheiding {
        width: 1px;
        align-self: stretch;
        margin: 4px 0;
        flex: 0 0 auto;
        background: var(--dac-border);
      }

      .mededeling {
        font-size: 11.5px;
        line-height: 1.3;
        color: var(--dac-ink-2);
        padding: 0 2px;
      }

      .detail {
        margin-top: 2px;
        color: var(--dac-ink-3);
        word-break: break-word;
      }
    `]);S(bn,wt);S(ti,Fe);S(Ho,Ze);Pe({type:bn,name:"DomotiApp Scene",description:`Drie lichtscenes per kamer, vastgelegd bij de lichtgroep (v${Ed}).`,preview:!1});var Re="domotiapp-alarm-card",si="domotiapp-alarm-card-editor",Uo="domotiapp-alarm-editor",Wo="DomotiApp Wekker",qo="https://github.com/Sven2410/domotiapp-lovelace",pe="domotiapp_lovelace",ie=Object.freeze({get:`${pe}/alarms/get`,save:`${pe}/alarms/save`,setEnabled:`${pe}/alarms/set_enabled`,delete:`${pe}/alarms/delete`,stop:`${pe}/alarms/stop`,clearMessage:`${pe}/alarms/clear_message`,search:`${pe}/sound/search`,entities:`${pe}/entities/list`,previewStart:`${pe}/preview/start`,subscribe:`${pe}/updates/subscribe`}),_n="#026FA1";function Fo(a){let e=typeof a?.name=="string"?a.name.trim():"",t=typeof a?.time=="string"?a.time.trim():"";return e&&t?`Wil je de wekker "${e}" van ${t} verwijderen?`:e?`Wil je de wekker "${e}" verwijderen?`:t?`Wil je de wekker van ${t} verwijderen?`:"Wil je deze wekker verwijderen?"}var Ad="07:00";var Md=["uri","name","media_type","image"],Sd="Let op: deze tijd bestaat twee nachten per jaar niet, of twee keer. Bij de overgang naar zomertijd wordt het uur van 02:00 tot 03:00 overgeslagen; die nacht gaat deze wekker niet af. Bij de overgang naar wintertijd komt dat uur twee keer voorbij; die nacht gaat hij twee keer af. Kies een tijd v\xF3\xF3r 02:00 of n\xE1 03:00 als dat een probleem is.",Od="Dit geluid stopt van zichzelf. Een los nummer is na een paar minuten voorbij; daarna is het stil. Kies een afspeellijst of een radiostation als de wekker moet blijven spelen tot je hem uitzet.";var Nd="Music Assistant Wekker",Cd="Verlichting Wekker";function wn(){return{id:null,name:"",time:Ad,days:[],enabled:!0,sound:null,endless:null,speaker:"",volume_pct:40,light:null}}function Zo(a){let e=wn();return!a||typeof a!="object"?e:{id:typeof a.id=="string"?a.id:null,name:typeof a.name=="string"?a.name:"",time:li(a.time)?a.time:e.time,days:Array.isArray(a.days)?[...a.days]:[],enabled:a.enabled!==!1,sound:yt(a.sound),endless:null,speaker:typeof a.speaker=="string"?a.speaker:"",volume_pct:Number.isInteger(a.volume_pct)?a.volume_pct:e.volume_pct,light:a.light&&typeof a.light=="object"?{entity_id:a.light.entity_id,brightness_pct:Number.isInteger(a.light.brightness_pct)?a.light.brightness_pct:60}:null}}function yt(a){if(!a||typeof a!="object"||Array.isArray(a)||typeof a.uri!="string"||!a.uri)return null;let e={};for(let t of Md)e[t]=a[t]===void 0?null:a[t];return e}function li(a){if(typeof a!="string"||a.length!==5||a[2]!==":")return!1;let e=Number(a.slice(0,2)),t=Number(a.slice(3));return!/^\d\d$/.test(a.slice(0,2))||!/^\d\d$/.test(a.slice(3))?!1:e>=0&&e<=23&&t>=0&&t<=59}function di(a){let e=[];return!a||typeof a!="object"?{ok:!1,ontbreekt:["alles"]}:((typeof a.name!="string"||!a.name.trim())&&e.push("een naam"),li(a.time)||e.push("een geldige tijd"),a.speaker||e.push("een speaker"),(!a.sound||!a.sound.uri)&&e.push("een geluid"),(!Number.isInteger(a.volume_pct)||a.volume_pct<1||a.volume_pct>100)&&e.push("een volume tussen 1 en 100"),{ok:e.length===0,ontbreekt:e})}function Xo(a){let e=[...new Set(a.days||[])].sort((n,i)=>n-i),t={name:(a.name||"").trim(),time:a.time,days:e,enabled:e.length===0?!0:a.enabled!==!1,sound:yt(a.sound),speaker:a.speaker,volume_pct:a.volume_pct,light:a.light?{entity_id:a.light.entity_id,brightness_pct:a.light.brightness_pct}:null};return a.id&&(t.id=a.id),t}function Qo(a,e){let t=new Set(a||[]);return t.has(e)?t.delete(e):t.add(e),[...t].sort((n,i)=>n-i)}function Yo(a){return li(a)&&a.slice(0,2)==="02"?Sd:null}function Jo(a){return a===!1?Od:null}function es(a){return typeof a?.endless=="boolean"?a.endless:null}function yn(a,e){let t=e==="lamp",n=t?Cd:Nd,i=t?"lampen":"speakers";return!a||typeof a!="object"?`De lijst met ${i} is niet op te halen.`:a.label_exists===!1?`Het label '${n}' bestaat nog niet. De beheerder moet dat label aanmaken en op de ${i} zetten die als wekker mogen dienen.`:Array.isArray(a.entities)&&a.entities.length>0?null:Number(a.filtered_out)>0?t?`De entiteiten met het label '${n}' zijn geen lampen.`:"De gelabelde speakers zijn geen Music Assistant-speakers, of ze kunnen geen volume instellen.":`Er zijn nog geen ${i} met het label '${n}'.`}function ts(a,e){return yn(e,"speaker")!==null?!1:di(a).ok}var Ld=[[1,"ma"],[2,"di"],[3,"wo"],[4,"do"],[5,"vr"],[6,"za"],[7,"zo"]],Dd=[["","Alles"],["playlist","Afspeellijsten"],["radio","Radio"],["artist","Artiesten"],["album","Albums"],["track","Nummers"],["podcast","Podcasts"]],zt="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",Hd="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",Id="M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z",Xe=class extends Z{constructor(){super(),this._concept=wn(),this._zoekterm="",this._soort="",this._treffers=null,this._zoekt=!1,this._melding=null,this._speelt=!1,this._bezig=!1,this._afmeldenVoorbeeld=null,this._opEscape=e=>{e.key==="Escape"&&this._annuleren()}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this._opEscape,!0)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this._opEscape,!0),this._stopVoorbeeld()}willUpdate(e){e.has("wekker")&&(this._concept=this.wekker?Zo(this.wekker):wn(),this._treffers=null,this._zoekterm="",this._melding=null)}_zet(e){this._concept={...this._concept,...e}}async _startVoorbeeld(){if(!(this._speelt||!this.hass)){if(!this._concept.speaker||!this._concept.sound){this._melding={tekst:"Kies eerst een speaker en een geluid.",fout:!0};return}this._melding=null;try{this._afmeldenVoorbeeld=await this.hass.connection.subscribeMessage(()=>{},{type:ie.previewStart,speaker:this._concept.speaker,sound:yt(this._concept.sound),volume_pct:this._concept.volume_pct,light:this._concept.light??null}),this._speelt=!0}catch(e){this._melding={tekst:e?.message??"Het voorbeeld kon niet starten.",fout:!0}}}}_stopVoorbeeld(){if(this._afmeldenVoorbeeld){try{this._afmeldenVoorbeeld()}catch(e){console.warn(`domotiapp-alarm-editor: afmelden mislukt: ${e?.message??e}`)}this._afmeldenVoorbeeld=null}this._speelt=!1}async _zoek(){let e=(this._zoekterm||"").trim();if(!(!e||!this.hass)){this._zoekt=!0,this._melding=null;try{let t={type:ie.search,query:e,limit:20};this._soort&&(t.media_types=[this._soort]);let n=await this.hass.callWS(t);this._treffers=n.results??[]}catch(t){this._treffers=[],this._melding={tekst:t?.message??"Zoeken is mislukt.",fout:!0}}finally{this._zoekt=!1}}}_kiesGeluid(e){this._zet({sound:yt(e),endless:es(e)}),this._treffers=null}async _opslaan(){if(this._bezig||!this.hass)return;let e=di(this._concept);if(!e.ok){this._melding={tekst:`Er ontbreekt nog ${e.ontbreekt.join(", ")}.`,fout:!0};return}this._bezig=!0;try{let t=await this.hass.callWS({type:ie.save,person:this.person,alarm:Xo(this._concept)});this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-opgeslagen",{detail:{toestand:t},bubbles:!0,composed:!0}))}catch(t){this._melding={tekst:t?.message??"Opslaan is mislukt.",fout:!0}}finally{this._bezig=!1}}_annuleren(){this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-dicht",{bubbles:!0,composed:!0}))}_svg(e){return w`<svg class="icoon" viewBox="0 0 24 24" aria-hidden="true">
      <path d=${e} />
    </svg>`}render(){if(!this.hass)return z;let e=this._concept,t=this.entiteiten?.speakers,n=this.entiteiten?.lights,i=yn(t,"speaker"),r=yn(n,"lamp"),o=Yo(e.time),s=Jo(e.endless),d=ts(e,t);return w`
      <div class="kop">
        <h2>${e.id?"Wekker bewerken":"Nieuwe wekker"}</h2>
      </div>

      <div class="blok">
        <label class="veld" for="tijd">Tijd</label>
        <div class="vak tijd">
          <input
            id="tijd"
            type="time"
            .value=${e.time}
            required
            @input=${l=>this._zet({time:l.target.value})}
          />
        </div>
        ${o?w`<div class="waarschuwing">
              ${this._svg(zt)}<span>${o}</span>
            </div>`:z}
      </div>

      <div class="blok">
        <label class="veld">Herhaling</label>
        <div class="dagen">
          ${Ld.map(([l,c])=>w`<button
              type="button"
              aria-pressed=${e.days.includes(l)?"true":"false"}
              aria-label=${c}
              @click=${()=>this._zet({days:Qo(e.days,l)})}
            >
              ${c}
            </button>`)}
        </div>
        <div class="uitleg">
          ${e.days.length===0?"Geen dag aangevinkt: deze wekker gaat \xE9\xE9n keer af, de eerstvolgende keer dat die tijd voorbijkomt.":"Deze wekker herhaalt zich op de aangevinkte dagen."}
        </div>
      </div>

      <div class="blok">
        <label class="veld" for="naam">Naam</label>
        <div class="vak">
          <input
            id="naam"
            type="text"
            .value=${e.name}
            placeholder="Bijvoorbeeld: Werk"
            @input=${l=>this._zet({name:l.target.value})}
          />
        </div>
      </div>

      <div class="blok">
        <label class="veld" for="speaker">Speaker</label>
        ${i?w`<div class="uitleg">${this._svg(zt)}<span>${i}</span></div>`:w`<div class="vak">
              <select
                id="speaker"
                .value=${e.speaker}
                @change=${l=>this._zet({speaker:l.target.value})}
              >
                <option value="">Kies een speaker…</option>
                ${(t?.entities??[]).map(l=>w`<option value=${l.entity_id} ?selected=${l.entity_id===e.speaker}>
                    ${l.name}
                  </option>`)}
              </select>
            </div>`}
      </div>

      <div class="blok">
        <label class="veld" for="zoek">Geluid</label>
        ${e.sound?w`<div class="gekozen">
              ${e.sound.image?w`<img src=${e.sound.image} alt="" />`:z}
              <span>${e.sound.name||e.sound.uri}</span>
              <span class="soort" style="margin-left:auto">${e.sound.media_type??""}</span>
            </div>`:z}
        <div class="rij" style="margin-top:8px">
          <div class="vak">
            <input
              id="zoek"
              type="text"
              .value=${this._zoekterm}
              placeholder="Zoek media"
              @input=${l=>{this._zoekterm=l.target.value}}
              @keydown=${l=>{l.key==="Enter"&&(l.preventDefault(),this._zoek())}}
            />
          </div>
          <div class="vak auto">
            <select
              aria-label="Soort"
              @change=${l=>{this._soort=l.target.value}}
            >
              ${Dd.map(([l,c])=>w`<option value=${l}>${c}</option>`)}
            </select>
          </div>
          <button
            class="knop zoekknop"
            type="button"
            title="Zoeken"
            aria-label="Zoeken"
            ?disabled=${this._zoekt}
            @click=${()=>this._zoek()}
          >
            ${this._svg(this._zoekt?Id:Hd)}
          </button>
        </div>
        ${this._treffers?w`<div class="treffers">
              ${this._treffers.length===0?w`<div class="treffer">Niets gevonden.</div>`:this._treffers.map(l=>w`<button
                      class="treffer"
                      type="button"
                      @click=${()=>this._kiesGeluid(l)}
                    >
                      ${l.image?w`<img src=${l.image} alt="" />`:z}
                      <span>${l.name}</span>
                      <span class="soort">${l.media_type??""}</span>
                    </button>`)}
            </div>`:z}
        ${s?w`<div class="waarschuwing">${this._svg(zt)}<span>${s}</span></div>`:z}
      </div>

      <div class="blok">
        <label class="veld" for="volume">Volume: ${e.volume_pct}%</label>
        <input
          id="volume"
          type="range"
          min="1"
          max="100"
          .value=${String(e.volume_pct)}
          @input=${l=>this._zet({volume_pct:Number(l.target.value)})}
        />
        <div class="uitleg">
          Het niveau waar de wekker in twintig seconden naartoe groeit.
        </div>
      </div>

      <div class="blok">
        <label class="veld" for="lamp">Wake-up light (optioneel)</label>
        ${r?w`<div class="uitleg">${this._svg(zt)}<span>${r}</span></div>`:w`
              <div class="vak">
                <select
                  id="lamp"
                  @change=${l=>this._zet({light:l.target.value?{entity_id:l.target.value,brightness_pct:e.light?.brightness_pct??60}:null})}
                >
                  <option value="">Geen lamp</option>
                  ${(n?.entities??[]).map(l=>w`<option
                      value=${l.entity_id}
                      ?selected=${l.entity_id===e.light?.entity_id}
                    >
                      ${l.name}
                    </option>`)}
                </select>
              </div>
              ${e.light?w`<label class="veld" style="margin-top:10px" for="helderheid">
                      Helderheid: ${e.light.brightness_pct}%
                    </label>
                    <input
                      id="helderheid"
                      type="range"
                      min="1"
                      max="100"
                      .value=${String(e.light.brightness_pct)}
                      @input=${l=>this._zet({light:{...e.light,brightness_pct:Number(l.target.value)}})}
                    />`:z}
            `}
      </div>

      ${this._melding?w`<div class="blok">
            <div class="waarschuwing ${this._melding.fout?"fout":""}">
              ${this._svg(zt)}<span>${this._melding.tekst}</span>
            </div>
          </div>`:z}

      <div class="voet">
        <button
          class="knop voorbeeld"
          type="button"
          @click=${()=>this._speelt?this._stopVoorbeeld():this._startVoorbeeld()}
        >
          ${this._speelt?"Voorbeeld stoppen":"Voorbeeld"}
        </button>
        <button class="knop" type="button" @click=${()=>this._annuleren()}>Annuleren</button>
        <button
          class="knop primair"
          type="button"
          ?disabled=${!d||this._bezig}
          @click=${()=>this._opslaan()}
        >
          Opslaan
        </button>
      </div>
    `}};j(Xe,"properties",{hass:{attribute:!1},person:{attribute:!1},wekker:{attribute:!1},entiteiten:{attribute:!1},_concept:{state:!0},_zoekterm:{state:!0},_soort:{state:!0},_treffers:{state:!0},_zoekt:{state:!0},_melding:{state:!0},_speelt:{state:!0},_bezig:{state:!0}}),j(Xe,"styles",[re,te`
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${fe(_n)});
      display: block;
      /* De editor meet zich aan zijn EIGEN breedte, niet aan die van het venster.
         Een kaart in een bubble pop-up is smal terwijl het venster breed is, dus
         een media query zou hier precies het verkeerde meten. Gemeten in fase 8:
         container queries worden ondersteund (CSS.supports gaf true).

         Met een naam, om dezelfde reden als bij de kaart: een naamloze query
         pakt de dichtstbijzijnde container-voorouder, en dat kan er een van HA
         zijn. */
      container: domotiapp-editor / inline-size;
    }
    .blok {
      padding: 12px 16px;
      border-bottom: 1px solid var(--dac-border);
    }
    .kop {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--dac-border);
    }
    .kop h2 {
      margin: 0;
      flex: 1;
      font-size: 15px;
      font-weight: 500;
      color: var(--dac-ink);
    }
    label.veld {
      display: block;
      color: var(--dac-ink-2);
      font-size: 11.5px;
      margin-bottom: 6px;
    }
    /* --- native invoervelden: het VAK is van ons, de CONTROL niet ---
       (fase 10, en dit is de kern van die ronde)

       De rand, de radius, de achtergrond en de padding zitten op een div.vak.
       De control erbinnen krijgt width 100% en verder GEEN padding en GEEN rand.
       Daarmee zijn zijn contentbox en zijn borderbox per constructie even breed,
       en kan hij niet breder uitvallen dan de ruimte die er is — ongeacht welk
       boxmodel de browser op dat soort control toepast.

       Waarom dat niet vanzelf spreekt. Hiervoor stond hier width 100% MET
       box-sizing border-box, padding en een rand, en dat is op Chrome
       aantoonbaar goed: gemeten 320 px getekend bij 320 px beschikbaar. iOS past
       box-sizing border-box echter NIET toe op input[type="time"]. Gemeten op de
       iPhone van de eigenaar (scherm 393 CSS px, kaart 356,4, binnenruimte 324,0):

           naamveld   (input[type=text]) eigen rand eindigt op 358,5   goed
           speaker    (select)           eigen rand eindigt op 358,5   goed
           TIJDVELD   (input[type=time]) eigen rand eindigt op 372,6   FOUT

       en uit de centrering van de cijfers volgt een veldbreedte van 348,9 px —
       precies 324 + 2*12 padding + 2*1 rand = 350. Het veld stak daarmee ~9 px
       voorbij de kaartrand, waar het werd afgeknipt: geen afgeronde rechterhoek
       meer, en de tijd 12,5 px uit het midden.

       Een max-width 100% erbij zou NIET helpen: leest de UA de width als
       contentbox, dan doet hij dat met max-width ook. Alleen padding 0 en rand 0
       op de control zelf sluit het uit. */
    .vak {
      display: block;
      padding: 10px;
      border: 1px solid var(--dac-border);
      border-radius: 6px;
      background: var(--card-background-color, #fff);
    }
    .vak.tijd {
      /* Iets meer ruimte links en rechts dan de andere velden: de cijfers zijn
         hier 24 px en gaan er anders optisch tegenaan liggen. */
      padding: 10px 12px;
    }
    /* De soortkiezer in de zoekrij is de enige die zich naar zijn inhoud voegt in
       plaats van de rij te vullen. Dan moet ook de control erin auto zijn: een
       width van 100% van een vak dat zelf auto is, is een rondje. */
    .vak.auto {
      flex: 0 0 auto;
    }
    .vak.auto select {
      width: auto;
    }
    .vak input,
    .vak select {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 0;
      border: 0;
      margin: 0;
      color: var(--dac-ink);
      font-family: inherit;
      font-size: 13.5px;
    }
    /* Een input heeft geen uitklappaneel, dus die mag het vak eronder laten
       zien. Een select niet — zie het blok hieronder. Ze staan bewust apart in
       plaats van dat de een de ander overschrijft: dan is aan de regel zelf te
       zien welke keuze waar geldt. */
    .vak input {
      background: transparent;
    }
    /* --- het uitklappaneel van een select (fase 12) ---

       Fase 10 zette background transparent op de control, omdat het vak
       eronder de achtergrond al levert. Voor een input klopt dat. Voor een
       select niet: de browser tekent het UITKLAPPANEEL met de
       background-color van de select zelf, en dat paneel valt buiten onze
       shadow root. Transparant betekent daar niet "neem het vak eronder" maar
       "val terug op de standaard van het platform" — en die is wit.

       Gemeten op de kaart van 1.1.0, bij alle DRIE de dropdowns (speaker, soort
       en lamp):

           background-color   rgba(0, 0, 0, 0)     <- doorzichtig
           color              rgb(225, 225, 225)   <- bijna wit

       Wit op wit dus. Alleen de gemarkeerde regel was leesbaar, omdat de browser
       daar zijn eigen markering overheen tekent. Zie de screenshots van de
       eigenaar in docs/fase-11/.

       De reparatie is een achtergrondkleur en geen padding of rand, dus de regel
       van fase 10 (valkuil 70) blijft staan: de control houdt padding 0 en rand
       0 zolang hij width 100% krijgt. */
    .vak select {
      background-color: var(--card-background-color, #fff);
    }
    .vak select option {
      background-color: var(--card-background-color, #fff);
      color: var(--dac-ink);
    }
    /* Het gemarkeerde item houdt de accentkleur die de dagknoppen ook gebruiken.
       Dat is de enige plek waar #026FA1 hier voorkomt en het is een accent, zoals
       SPEC 1.1 voorschrijft. Zonder deze regel valt de markering terug op die van
       het platform, en die gaat uit van zwarte tekst op een lichte balk — bij een
       donker thema is dat opnieuw onleesbaar. */
    .vak select option:checked {
      background-color: var(--domotiapp-accent);
      color: #fff;
    }
    .vak input[type="time"] {
      font-size: 24px;
      font-variant-numeric: tabular-nums;
      /* iOS centreert de waarde van een tijdveld zelf; Chrome lijnt hem links uit.
         Expliciet centreren maakt van dat verschil een keuze in plaats van een
         toevalligheid.

         Wat het NIET doet is beide platformen hetzelfde laten tonen, en dat is
         gemeten: Chrome tekent er een eigen klokknop rechts in (CSS 315,9 → 335,5)
         en centreert de waarde in wat daarvan overblijft, zodat de cijfers 19,9 px
         links van het midden van de kaart uitkomen. iOS heeft die knop niet en
         centreert wel echt. De DOOS is op beide gelijk; het beeld erbinnen niet. */
      text-align: center;
    }
    /* Onder de 300 px wordt het veld zelf smal genoeg dat de native tijdweergave
       eronder kan lijden. Dan liever kleinere cijfers dan afgesneden cijfers. */
    @container domotiapp-editor (max-width: 300px) {
      .vak input[type="time"] {
        font-size: 20px;
      }
    }
    /* De twee schuiven zijn het enige native control dat width 100% krijgt en
       GEEN vak nodig heeft: ze dragen zelf geen padding en geen rand, dus hun
       contentbox en borderbox zijn al gelijk. Gemeten: box-sizing staat hier op
       content-box en tóch is de schuif 320 px bij 320 px beschikbaar — wat laat
       zien dat het boxmodel niet de kwaal is maar de padding. Geef ze er dus ook
       nooit een. */
    input[type="range"] {
      width: 100%;
      padding: 0;
      border: 0;
      accent-color: var(--domotiapp-accent);
    }
    .dagen {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .dagen button {
      flex: 1 1 0;
      min-width: 38px;
      padding: 8px 0;
      border: 1px solid var(--dac-border);
      border-radius: 18px;
      background: none;
      color: var(--dac-ink-2);
      cursor: pointer;
      font-family: inherit;
      font-size: 11.5px;
    }
    .dagen button[aria-pressed="true"] {
      background: var(--domotiapp-accent);
      border-color: var(--domotiapp-accent);
      color: #fff;
    }
    /* Wikkelen, om dezelfde reden als de voetregel. Gemeten in fase 8 bij een
       kaart van 244 px: het zoekveld werd tot 27 px platgeknepen tussen de
       soortkiezer (127 px) en het vergrootglas (42 px) — je zag niet meer wat je
       typte. De ondergrens van 8em zorgt dat het veld leesbaar blijft en dat de
       rest naar de volgende regel gaat in plaats van dat het veld verdwijnt. */
    .rij {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .rij > :first-child {
      flex: 1 1 8em;
      min-width: 8em;
    }
    button.knop {
      border: 1px solid var(--dac-border);
      border-radius: 18px;
      background: none;
      color: var(--dac-ink);
      padding: 9px 16px;
      cursor: pointer;
      font-family: inherit;
      font-size: 13.5px;
      white-space: nowrap;
    }
    @media (hover: hover) {
      button.knop:hover:not(:disabled) {
        background: var(--dac-border);
      }
    }
    button.knop:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    /* Het vergrootglas naast het zoekveld: vierkant en zo smal mogelijk, want op
       een telefoon vecht deze regel om de breedte met het veld ernaast. */
    button.knop.zoekknop {
      flex: 0 0 auto;
      width: 42px;
      padding: 9px 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    button.knop.primair {
      background: var(--domotiapp-accent);
      border-color: var(--domotiapp-accent);
      color: #fff;
    }
    .waarschuwing,
    .uitleg {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      color: var(--dac-ink-2);
      font-size: 11.5px;
      margin-top: 8px;
    }
    .waarschuwing.fout {
      color: var(--dac-bad);
    }
    .icoon {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
      fill: currentColor;
    }
    .treffers {
      margin-top: 8px;
      max-height: 260px;
      overflow-y: auto;
      border: 1px solid var(--dac-border);
      border-radius: 6px;
    }
    .treffer {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      /* width 100% samen met eigen padding — dezelfde vorm als het tijdveld.
         Chrome geeft een button border-box uit zijn eigen UA-stylesheet (gemeten:
         303 px getekend bij 303 px beschikbaar), maar dat is een standaard van de
         browser en geen afspraak van ons. Hier staat hij expliciet, zodat het niet
         uitmaakt wat de UA vindt. */
      box-sizing: border-box;
      padding: 8px 10px;
      border: none;
      border-bottom: 1px solid var(--dac-border);
      background: none;
      color: var(--dac-ink);
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      font-size: 11.5px;
    }
    .treffer:last-child {
      border-bottom: none;
    }
    @media (hover: hover) {
      .treffer:hover {
        background: var(--dac-border);
      }
    }
    .treffer img,
    .gekozen img {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      object-fit: cover;
      flex: 0 0 auto;
      background: var(--dac-border);
    }
    /* De naam van een treffer is vrije tekst uit Music Assistant en heeft geen
       bovengrens; hij moet dus kunnen krimpen. Zonder deze twee regels loopt de
       rij over en duwt hij de soort naar buiten — gemeten bij een kaart van
       208 px: de badge "podcast" stak 16 px buiten de kaart en de treffer meldde
       scrollWidth 206 bij clientWidth 157. Zelfde vorm als de bevestigingsregel
       uit fase 9, nu in een toestand die niemand eerder had opengezet. */
    .treffer span:not(.soort) {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .treffer .soort {
      /* Hier stond in de eerste opzet flex 0 0 auto. De mutatieproef wees uit dat
         die regel niets doet: hem terugzetten op 0 1 auto verandert geen enkele
         positie, ook niet samen met de mutatie hierboven (beide uitkomsten waren
         tot op de tiende gelijk). De reden is de white-space hieronder — een badge
         die niet mag afbreken kan niet onder zijn tekstbreedte geknepen worden.
         Dat is exact valkuil 34, derde rij, en dezelfde bevinding als bij
         button.tekstknop in fase 9. */
      color: var(--dac-ink-2);
      margin-left: auto;
      white-space: nowrap;
    }
    .gekozen {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border: 1px solid var(--dac-border);
      border-radius: 6px;
      color: var(--dac-ink);
      font-size: 11.5px;
    }
    /* WIKKELEN, en dat is de kern van de reparatie uit fase 8.
       Er staan drie knoppen zodra een voorbeeld speelt, en die pasten niet in een
       smalle kaart. Met justify-content:flex-end spilt de overloop naar LINKS,
       dus de knop Voorbeeld stoppen liep de kaart uit — gemeten: 67 px buiten
       de linkerrand bij een kaart van 244 px.

       Waarom wikkelen en niet een korter label: een korter label (Stoppen)
       verliest betekenis naast Annuleren en Opslaan — stoppen wát? — en het helpt
       maar tot de volgende lettergrootte. Wikkelen werkt bij elke breedte en bij
       elke tekstgrootte, ook die van een gebruiker die groot leest.

       flex:0 0 auto erbij: zonder dat knijpt flexbox de knoppen eerst plat
       vóór hij wikkelt, en dan staat de tekst tegen de rand van zijn eigen knop. */
    .voet {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: flex-end;
      padding: 12px 16px;
    }
    .voet button {
      flex: 0 0 auto;
    }
    .voet .voorbeeld {
      margin-right: auto;
    }
  `]);var ns="person",Rd="Kies een persoon in de kaartinstellingen.",as="De gekozen persoon is niet gevonden.",Vd="De opgeslagen wekkers van deze persoon zijn onleesbaar.",Vm=Object.freeze(["grid_options","layout_options","view_layout","visibility"]);function is(a){if(!a||typeof a!="object"||Array.isArray(a))throw new Error("De kaartconfig ontbreekt of is geen object.");let e=a.person;if(e==null||e==="")return{...a};if(typeof e!="string")throw new Error("'person' moet een entity-ID zijn, zoals person.sven.");if(!e.startsWith(`${ns}.`))throw new Error(`'${e}' zit niet in het domein ${ns}. Kies een persoon, zoals person.sven.`);return{...a}}function rs(a){return{type:`custom:${a}`}}function os(a,e){return a?e?{soort:"ok",tekst:null,isFout:!1}:{soort:"weg",tekst:as,isFout:!0}:{soort:"ontbreekt",tekst:Rd,isFout:!1}}function ss(a,e){return a==="not_found"?as:a==="home_assistant_error"?Vd:e||"Er ging iets mis bij het ophalen van de wekkers."}var Pd=["ma","di","wo","do","vr","za","zo"],Bd="Geen wekkers ingesteld",Kd="Eenmalig",Gd="Eenmalig \u2014 afgelopen",Ud="Geen wekker actief",ls="Stoppen",Wd="Er is een melding over deze wekker, maar de tekst ontbreekt.";function qd(a){return!Array.isArray(a)||a.length===0?Kd:[...new Set(a)].sort((t,n)=>t-n).map(t=>Pd[t-1]??"?").join(" ")}function Fd(a,e){return!a||Array.isArray(a.days)&&a.days.length>0?!1:Date.parse(a?.one_shot_at??"")<=e}function ds(a,e){return Fd(a,e)?Gd:qd(a?.days)}function cs(a){let e=a?.last_message;return!e||typeof e!="object"||Array.isArray(e)?null:{tekst:typeof e.text=="string"&&e.text.trim()?e.text:Wd,severity:e.severity==="error"?"error":"notice",isFout:e.severity==="error",kind:typeof e.kind=="string"?e.kind:null}}function ps(a){let e=a?.alarms;if(!Array.isArray(e)||e.length===0)return Bd;let t=a?.next_fire?.text;return typeof t=="string"&&t.trim()?t:Ud}function hs(a,e){let t=[...new Set((e??[]).filter(o=>typeof o=="string"))];if(t.length===0)return null;let n=t.map(o=>(a??[]).find(s=>s?.id===o)).filter(Boolean),i=n.map(o=>o.name).filter(Boolean),r=[...new Set(n.map(o=>o.time).filter(Boolean))];return{ids:t,naam:i.length?i.join(" en "):"Wekker",tijd:r.join(" en ")}}var Zd="0.19.0",Xd="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",Qd="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z",us="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",Yd="M13,14H11V9H13M13,18H11V16H13M1,21H23L12,2L1,21Z",zn=(a,e="icoon")=>w`<svg class=${e} viewBox="0 0 24 24" aria-hidden="true">
    <path d=${a} />
  </svg>`,jt=class extends Z{constructor(){super(),this._toestand=null,this._fout=null,this._bevestigVoor=null,this._bezig=!1,this._tijdelijkeMelding=null,this._editorVoor=void 0,this._entiteiten=null,this._abonnementVoor=null,this._afmelden=null,this._herkansing=new ge(()=>this._haalOp()),this._verbinding=new Ge}setConfig(e){let t=is(e),n=t.person!==this._config?.person;this._config=t,this.toggleAttribute("bare",!!e?.bare),n&&(this._toestand=null,this._fout=null,this._bevestigVoor=null,this._herstartAbonnement())}static getConfigElement(){return document.createElement(si)}static getStubConfig(){return rs(Re)}getGridOptions(){return{rows:"auto",columns:12,min_columns:6,min_rows:Ve(this.renderRoot?.querySelector?.(".card"))??1}}getCardSize(){if(this._stop())return 3;let e=this._toestand?.alarms?.length??0;return 1+Math.max(e,1)}connectedCallback(){super.connectedCallback(),this._herstartAbonnement()}disconnectedCallback(){super.disconnectedCallback(),this._herkansing.stop(),this._stopAbonnement(),this._rasterUit?.(),this._rasterUit=null,this._rasterVak=null}updated(e){e.has("hass")&&this.hass&&(this._startAbonnement(),this._verbinding.herverbonden(this.hass)&&(this._herkansing.herstel(),this._haalOp())),this._volgRaster()}_volgRaster(){let e=this.renderRoot?.querySelector(".card, .needs");e!==this._rasterVak&&(this._rasterUit?.(),this._rasterVak=e,this._rasterUit=e?P(e):null),L(e)}async _startAbonnement(){let e=this._config?.person;if(!(!this.hass||!e||!this.isConnected)&&this._abonnementVoor!==e){this._abonnementVoor=e;try{let t=await this.hass.connection.subscribeMessage(n=>this._opGebeurtenis(n),{type:ie.subscribe,person:e});if(this._abonnementVoor!==e){t();return}this._afmelden=t}catch(t){console.warn(`${Re}: abonneren mislukt: ${t?.message??t}`)}await this._haalOp()}}_stopAbonnement(){if(this._afmelden){try{this._afmelden()}catch(e){console.warn(`${Re}: afmelden mislukt: ${e?.message??e}`)}this._afmelden=null}this._abonnementVoor=null}_herstartAbonnement(){this._stopAbonnement(),this._startAbonnement()}_opGebeurtenis(e){let t=e?.alarm_id,n=e?.event;if(typeof t=="string"&&this._toestand){let i=new Set(this._toestand.ringing??[]);n==="started"?i.add(t):i.delete(t),this._toestand={...this._toestand,ringing:[...i]}}this._haalOp()}async _haalOp(){let e=this._config?.person;if(!(!this.hass||!e))try{let t=await this.hass.callWS({type:ie.get,person:e});if(this._config?.person!==e)return;this._toestand=t,this._fout=null,this._herkansing.herstel()}catch(t){if(this._config?.person!==e||Ne(t)&&this._herkansing.plan())return;this._toestand=null,this._fout=ss(t?.code,t?.message)}}async _roep(e){if(!(!this.hass||this._bezig)){this._bezig=!0;try{let t=await this.hass.callWS(e);t&&typeof t=="object"&&(this._toestand=t,this._fout=null)}catch(t){this._toon(t?.message??"De opdracht is niet gelukt.")}finally{this._bezig=!1}}}async _openEditor(e){if(this._bevestigVoor=null,this._editorVoor=e,!!this.hass)try{this._entiteiten=await this.hass.callWS({type:ie.entities})}catch(t){this._entiteiten=null,console.warn(`${Re}: entiteitenlijst ophalen mislukt: ${t?.message??t}`)}}_sluitEditor(){this._editorVoor=void 0}_toon(e){this._tijdelijkeMelding=e,clearTimeout(this._meldingTimer),this._meldingTimer=setTimeout(()=>{this._tijdelijkeMelding=null},6e3)}_person(){return this._config?.person}_zetAan(e,t){this._roep({type:ie.setEnabled,person:this._person(),alarm_id:e.id,enabled:t})}_verwijder(e){this._bevestigVoor=null,this._roep({type:ie.delete,person:this._person(),alarm_id:e.id})}_begrepen(e){this._roep({type:ie.clearMessage,person:this._person(),alarm_id:e.id})}async _stopAlles(e){for(let t of e)await this._roep({type:ie.stop,person:this._person(),alarm_id:t})}_stop(){return this._toestand?hs(this._toestand.alarms,this._toestand.ringing):null}render(){if(!this._config)return z;let e=this._config.person,t=!!(e&&this.hass?.states?.[e]),n=os(e,t);if(n.soort!=="ok")return this._mededeling(n.tekst,n.isFout);if(this._fout)return this._mededeling(this._fout,!0);if(!this._toestand)return this._mededeling("Wekkers ophalen\u2026",!1);let i=this._stop();return this._editorVoor!==void 0&&!i?w`<div class="card surface">
        <domotiapp-alarm-editor
          .hass=${this.hass}
          .person=${this._config.person}
          .wekker=${this._editorVoor}
          .entiteiten=${this._entiteiten}
          @editor-dicht=${()=>this._sluitEditor()}
          @editor-opgeslagen=${r=>{this._toestand=r.detail.toestand,this._sluitEditor()}}
        ></domotiapp-alarm-editor>
      </div>`:w`<div class="card surface">
      ${i?this._stopknop(i):this._lijst()}
      ${this._tijdelijkeMelding?w`<div class="onderrij">
            ${zn(us,"icoon klein")}
            <span class="boodschap">${this._tijdelijkeMelding}</span>
          </div>`:z}
    </div>`}_mededeling(e,t){return w`<div class="card surface">
      <div class="mededeling ${t?"fout":""}">${e}</div>
    </div>`}_stopknop(e){return w`<button
      class="stopknop"
      @click=${()=>this._stopAlles(e.ids)}
    >
      <div class="stop-tijd">${e.tijd}</div>
      <div class="stop-naam">${e.naam}</div>
      <div class="stop-woord">${ls}</div>
    </button>`}_lijst(){let e=this._toestand.alarms??[],t=Date.now();return w`
      <div class="kop ${e.length===0?"leeg":""}">
        <span class="volgende">${ps(this._toestand)}</span>
        <button
          class="icoonknop"
          title="Wekker toevoegen"
          aria-label="Wekker toevoegen"
          @click=${()=>this._openEditor(null)}
        >
          ${zn(Xd)}
        </button>
      </div>
      ${e.map(n=>this._rij(n,t))}
    `}_bevestiging(e){return w`<div class="onderrij bevestiging">
      <span class="boodschap">${Fo(e)}</span>
      <button
        class="tekstknop"
        @click=${()=>{this._bevestigVoor=null}}
      >
        Annuleren
      </button>
      <button class="tekstknop gevaar" @click=${()=>this._verwijder(e)}>
        Verwijderen
      </button>
    </div>`}_rij(e,t){let n=cs(e),i=!!e.enabled;return w`
      <div class="rij ${i?"":"uit"}">
        <button
          class="tikvlak"
          type="button"
          aria-label="Wekker ${e.name} bewerken"
          @click=${()=>this._openEditor(e)}
        >
          <div class="tijd">${e.time}</div>
          <div class="tekst">
            <div class="naam">${e.name}</div>
            <div class="sub">${ds(e,t)}</div>
          </div>
        </button>
        <button
          class="schakelaar"
          role="switch"
          aria-checked=${i?"true":"false"}
          aria-label="Wekker ${e.name} aan of uit"
          @click=${()=>this._zetAan(e,!i)}
        ></button>
        <button
          class="icoonknop"
          title="Verwijderen"
          aria-label="Wekker ${e.name} verwijderen"
          @click=${()=>{this._bevestigVoor=e.id}}
        >
          ${zn(Qd)}
        </button>
      </div>
      ${this._bevestigVoor===e.id?this._bevestiging(e):z}
      ${n?w`<div class="onderrij ${n.isFout?"fout":""}">
            ${zn(n.isFout?Yd:us,"icoon klein")}
            <span class="boodschap">${n.tekst}</span>
            <button class="tekstknop" @click=${()=>this._begrepen(e)}>
              Begrepen
            </button>
          </div>`:z}
    `}};j(jt,"properties",{hass:{attribute:!1},_config:{state:!0},_toestand:{state:!0},_fout:{state:!0},_bevestigVoor:{state:!0},_bezig:{state:!0},_tijdelijkeMelding:{state:!0},_editorVoor:{state:!0},_entiteiten:{state:!0}}),j(jt,"styles",[re,te`
    /* unsafeCSS en niet de constante rechtstreeks: lit weigert een gewone
       string in een css-template en gooit dan — op modulescope, wat SPEC 19.4
       verbiedt. De waarde is onze eigen constante en komt nergens van buiten. */
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${fe(_n)});
      /* De kaart meet zich aan zijn eigen breedte en niet aan het venster: in een
         bubble pop-up is de kaart smal terwijl het venster breed is. Gemeten in
         fase 8 bij 244 px: de naam werd tot een enkele letter platgeknepen en de
         dagen stapelden verticaal.

         display:block is hier GEEN opmaakvoorkeur maar een voorwaarde. Gemeten:
         HA geeft de kaarthost display:inline, en op een inline element doet
         container-type niets — de host wordt dan geen query-container en de
         regels hieronder komen nooit aan bod.

         En de container heeft een NAAM. Zonder naam kiest de browser de
         dichtstbijzijnde container-voorouder, en dat kan er een van HA zelf zijn;
         dan hangt onze opmaak af van de afmeting van iets waar wij niet over
         gaan. */
      display: block;
      container: domotiapp-kaart / inline-size;
    }
    /* De kaart komt uit op een rasterrij van Home Assistant. --dac-raster wordt
       gemeten en gezet door volgRaster in rasterhoogte.js; een vast aantal
       rijen in getGridOptions kan hier niet, want deze kaart groeit met de
       wekkers mee en zou dan door zijn eigen vak heen steken. */
    .card {
      min-height: var(--dac-raster, 56px);
    }

    /* Achtergrond weglaten -- zie de andere kaarten in de familie: de vulling
       gaat weg, de rand blijft staan. */
    :host([bare]) .card {
      background: none;
      box-shadow: none;
    }

    /* Geen overflow:hidden op de kaart: de stopknop houdt daarom zelf de
       hoekafronding van de kaart. Er staat sinds fase 7 niets meer boven de kaart
       te zweven — de volle-viewportlaag die het overloopmenu afsloot, is precies
       wat die knoppen onklikbaar maakte. */
    .mededeling {
      padding: 16px;
      color: var(--dac-ink-2);
      font-size: 13.5px;
    }
    .mededeling.fout {
      color: var(--dac-bad);
    }

    /* --- de lijst --- */
    .rij {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--dac-border);
    }
    button.tikvlak {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
      border: none;
      background: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      color: inherit;
    }
    .tijd {
      font-size: 28px;
      line-height: 1.1;
      font-weight: 400;
      color: var(--dac-ink);
      font-variant-numeric: tabular-nums;
      min-width: 82px;
      flex: 0 0 auto;
    }
    /* Onder de 300 px is er geen ruimte voor 28 px cijfers naast een naam, een
       schakelaar en een prullenbak. Kleinere cijfers zijn dan beter dan een naam
       van een letter. */
    @container domotiapp-kaart (max-width: 300px) {
      .tijd {
        font-size: 22px;
        min-width: 62px;
      }
      .rij {
        gap: 8px;
        padding: 10px 12px;
      }
    }
    /* De onderste regel van de kaart krijgt geen streep: er staat niets onder om
       van te scheiden. Sinds de kopbalk boven staat is dat de laatste wekkerrij, en
       niet meer de voetregel die er toen achter kwam. */
    .rij:last-child,
    .onderrij:last-child {
      border-bottom: none;
    }
    .rij.uit .tijd,
    .rij.uit .naam {
      color: var(--dac-ink-2);
    }
    .tekst {
      flex: 1;
      min-width: 0;
    }
    .naam {
      color: var(--dac-ink);
      font-size: 13.5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .sub {
      color: var(--dac-ink-2);
      font-size: 11.5px;
    }

    /* --- de schakelaar; eigen knop, zie de kop van dit bestand --- */
    .schakelaar {
      flex: 0 0 auto;
      width: 44px;
      height: 24px;
      border-radius: 12px;
      border: none;
      padding: 0;
      cursor: pointer;
      position: relative;
      background: var(--disabled-text-color, #9e9e9e);
      transition: background 0.2s ease;
    }
    .schakelaar[aria-checked="true"] {
      background: var(--domotiapp-accent);
    }
    .schakelaar::after {
      content: "";
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--card-background-color, #fff);
      transition: transform 0.2s ease;
    }
    .schakelaar[aria-checked="true"]::after {
      transform: translateX(20px);
    }

    /* --- knoppen en iconen --- */
    button.icoonknop {
      flex: 0 0 auto;
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: none;
      cursor: pointer;
      color: var(--dac-ink-2);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
    }
    @media (hover: hover) {
      button.icoonknop:hover {
        background: var(--dac-border);
      }
    }
    .icoon {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }
    .icoon.klein {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
    }

    /* --- melding en bevestiging op een rij ---

       WIKKELT, sinds fase 9. Gemeten in een échte Bubble Card-pop-up op 390 px —
       telefoonbreedte, de conditie waarin de klant hem gebruikt — met een wekker
       die "Zaterdagochtendzwemtraining" heet: de knop "Verwijderen" stak 27 px
       buiten de kaart en 9 px buiten de pop-up, en dat laatste betekent dat een
       deel van hem niet meer aan te wijzen is. Met een korte naam gebeurt het
       onder een kaartbreedte van 276 px.

       Waarom het niet opviel: .boodschap had flex 1, dus min-width auto,
       en dan kan de tekst niet onder zijn langste woord krimpen. De rij liep over
       en duwde de knoppen naar rechts naar buiten. Fase 8 heeft dit voor .voet
       en de zoekrij opgelost maar deze rij niet meegenomen, omdat de meting de
       bevestiging nooit heeft geopend.

       Dat het uitgerekend de knop van een ONOMKEERBARE handeling is die wegvalt,
       is de reden dat dit geen schoonheidsfoutje is. */
    .onderrij {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 0 16px 12px 16px;
      border-bottom: 1px solid var(--dac-border);
      font-size: 11.5px;
    }
    .onderrij .boodschap {
      /* Een ondergrens in plaats van flex 1: onder de 8em gaan de knoppen naar
         de volgende regel in plaats van dat ze de rij uit worden geduwd. */
      flex: 1 1 8em;
      /* min-width 0 haalt de impliciete ondergrens van de flexitem weg en
         overflow-wrap breekt een naam die zelf breder is dan de kaart — een
         wekkernaam is invoer van de klant en heeft geen bovengrens. */
      min-width: 0;
      overflow-wrap: anywhere;
      color: var(--dac-ink-2);
    }
    .onderrij.fout .boodschap,
    .onderrij.fout .icoon {
      color: var(--dac-bad);
    }
    button.tekstknop {
      /* Hier stond in de eerste opzet van fase 9 een flex 0 0 auto, geleend van de
         voetregel in de editor (fase 8). De mutatieproef wees uit dat die regel
         hier NIETS doet: hem terugzetten op de standaard 0 1 auto veranderde bij
         390, 244 én 180 px geen enkele positie. De reden is de white-space
         hieronder — een knop die niet mag afbreken kan door flexbox niet onder
         zijn tekstbreedte geknepen worden, dus er valt niets te krimpen. Volgens
         valkuil 34, derde rij, gaat zo'n regel eruit in plaats van dat er een
         test bij verzonnen wordt. */
      border: 1px solid var(--dac-border);
      border-radius: 16px;
      background: none;
      color: var(--dac-ink);
      padding: 6px 14px;
      cursor: pointer;
      font-size: 11.5px;
      font-family: inherit;
      white-space: nowrap;
    }
    @media (hover: hover) {
      button.tekstknop:hover {
        background: var(--dac-border);
      }
    }
    button.tekstknop.gevaar {
      color: var(--dac-bad);
      border-color: var(--dac-bad);
    }

    /* De bevestigingsregel mag niet in het niets opgaan tussen de wekkers: hij
       vraagt iets onomkeerbaars. Zelfde vorm als een melding, met de tekst in de
       primaire kleur in plaats van de secundaire. */
    .onderrij.bevestiging .boodschap {
      color: var(--dac-ink);
    }

    /* --- kopbalk (SPEC 3.1 en 3.2) ---
       Bovenaan sinds fase 6b: met tien wekkers stonden de eerstvolgende wektijd en
       de plusknop onder de vouw. Bij een lege lijst is dit de hele kaart en hoort er
       geen scheidingslijn onder — er staat niets om van te scheiden. */
    .kop {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: var(--dac-ink-2);
      font-size: 13.5px;
      border-bottom: 1px solid var(--dac-border);
    }
    .kop.leeg {
      border-bottom: none;
    }
    .kop .volgende {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* --- de stoptoestand (SPEC 4) --- */
    button.stopknop {
      display: block;
      width: 100%;
      /* width 100% met eigen padding van 16 px links en rechts — dezelfde vorm die
         in fase 10 op iOS bij het tijdveld misging. Chrome geeft een button
         border-box uit zijn UA-stylesheet (gemeten in de stoptoestand: 352 px
         getekend bij 352 px beschikbaar), maar op die standaard willen we niet
         leunen bij de knop die de wekker uitzet. */
      box-sizing: border-box;
      border: none;
      border-radius: var(--dac-radius);
      cursor: pointer;
      background: var(--domotiapp-accent);
      color: #fff;
      padding: 32px 16px;
      font-family: inherit;
      text-align: center;
    }
    .stopknop .stop-tijd {
      font-size: 44px;
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
    }
    .stopknop .stop-naam {
      font-size: 15px;
      opacity: 0.9;
      margin-top: 4px;
    }
    .stopknop .stop-woord {
      margin-top: 20px;
      font-size: 24px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
  `]);var Qe=class Qe extends Z{constructor(){super(...arguments);j(this,"_label",t=>({person:"Persoon",bare:"Achtergrond weglaten"})[t.name]??t.name)}setConfig(t){this._config={...t}}render(){return!this._config||!this.hass?z:w`
      <div class="uitleg">
        Elke persoon heeft zijn eigen wekkerlijst. De kaart toont alleen de
        wekkers van de gekozen persoon.
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${Qe._SCHEMA}
        .computeLabel=${this._label}
        @value-changed=${this._gewijzigd}
      ></ha-form>
    `}_gewijzigd(t){t.stopPropagation();let n={...this._config,...t.detail.value};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:n},bubbles:!0,composed:!0}))}};j(Qe,"properties",{hass:{attribute:!1},_config:{state:!0}}),j(Qe,"styles",[re,te`
    .uitleg {
      padding: 0 0 12px 0;
      color: var(--dac-ink-2);
      font-size: 11.5px;
    }
  `]),j(Qe,"_SCHEMA",[{name:"person",required:!0,selector:{entity:{filter:{domain:"person"}}}},{name:"bare",selector:{boolean:{}}}]);var ci=Qe;S(Re,jt);S(si,ci);S(Uo,Xe);Pe({type:Re,name:Wo,description:`Wekkerkaart van DomotiApp (v${Zd}).`,preview:!1,documentationURL:qo});var Jd=`
  :host {
    ${X}
    position: fixed; inset: 0; z-index: 10000;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }
  /* DIT was waarom het vak op een telefoon niet paste, en niet de maten.
     Zonder deze regel telt de padding NIET mee in de breedte, dus een vak van
     "min(420px, 100%)" werd op een scherm van 390 CSS-pixels 350 + 44 padding
     + 2 rand = 396 breed, in een laag die er maar 350 te geven had. Het liep
     dus over zijn eigen marge heen en raakte allebei de schermranden. Gemeten
     op 26 augustus 2026: 466 breed in een venster van 500. */
  *, *::before, *::after { box-sizing: border-box; }

  /* De marge om het vak heen is wat een dialoog op een telefoon een dialoog
     laat lijken in plaats van een tweede scherm. De inkeping van het toestel
     telt mee: op een telefoon met een ronde hoek of een balk onderin valt een
     vak dat tot de rand loopt daar deels achter. */
  .laag {
    position: absolute; inset: 0;
    display: grid; place-items: center;
    padding:
      max(24px, env(safe-area-inset-top))
      max(24px, env(safe-area-inset-right))
      max(24px, env(safe-area-inset-bottom))
      max(24px, env(safe-area-inset-left));
    background: color-mix(in srgb, #000 58%, transparent);
    animation: op 140ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }

  /* 340px en niet 420: op een telefoon van 390 CSS-pixels breed werd dat vak
     zo goed als schermbreed, en dan leest een vraag als een pagina. Gemeld op
     26 augustus 2026 met een schermafdruk van de herstartvraag. De maten
     eronder zijn in dezelfde slag kleiner geworden: een vraag van twee regels
     hoort geen kaart van een halve telefoon te zijn. */
  .vak {
    width: min(340px, 100%);
    max-width: 100%;
    padding: 16px 18px 14px;
    border-radius: var(--dac-radius);
    background: var(--dac-bg-raise);
    border: 1px solid var(--dac-border);
    box-shadow: 0 24px 60px -20px rgba(0,0,0,.7);
    animation: omhoog 160ms ease;
  }
  @keyframes omhoog { from { transform: translateY(8px); opacity: 0 } to { transform: none; opacity: 1 } }

  h2 { margin: 0 0 6px; font-size: 15.5px; font-weight: 600; letter-spacing: -.01em; }
  p { margin: 0; font-size: 13px; line-height: 1.45; color: var(--dac-ink-2); }

  .knoppen { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  button {
    padding: 7px 14px; cursor: pointer; font: inherit; font-size: 13px; font-weight: 500;
    border-radius: var(--dac-radius-pill); border: 1px solid var(--dac-border);
    background: transparent; color: var(--dac-ink-2);
  }
  @media (hover: hover) { button:hover { background: var(--dac-surface); color: var(--dac-ink); } }
  button.ja {
    border-color: transparent; color: #0c0c0a;
    background: var(--dac-accent-hi);
  }
  @media (hover: hover) { button.ja:hover { background: var(--dac-accent-hi); filter: brightness(1.08); } }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
`,pi=null,ms=a=>String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),hi=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),pi=pi??[J(Jd)],this.shadowRoot.adoptedStyleSheets=pi}connectedCallback(){this.gebouwd_||this.bouw_()}bouw_(){this.shadowRoot.innerHTML=`
      <div class="laag" role="dialog" aria-modal="true">
        <div class="vak">
          <h2></h2>
          <p></p>
          <div class="knoppen">
            <button type="button" class="nee"></button>
            <button type="button" class="ja"></button>
          </div>
        </div>
      </div>`,this.gebouwd_=!0,this.$(".nee").addEventListener("click",()=>this.klaar_(!1)),this.$(".ja").addEventListener("click",()=>this.klaar_(!0)),this.$(".laag").addEventListener("click",e=>{e.target===this.$(".laag")&&this.klaar_(!1)}),this.addEventListener("keydown",e=>{e.key==="Escape"&&this.klaar_(!1)})}$(e){return this.shadowRoot.querySelector(e)}open(e){return this.gebouwd_||this.bouw_(),this.$("h2").innerHTML=ms(e.title??"Weet je het zeker?"),this.$("p").innerHTML=ms(e.text??"Weet je zeker dat je dit wilt doen?"),this.$(".nee").textContent=e.dismissText??"Annuleren",this.$(".ja").textContent=e.confirmText??"OK",this.setAttribute("open",""),setTimeout(()=>this.$(".nee")?.focus(),40),new Promise(t=>{this.antwoord_=t})}klaar_(e){if(!this.hasAttribute("open"))return;this.removeAttribute("open");let t=this.antwoord_;this.antwoord_=null,t?.(e)}};S("domotiapp-vraag",hi);function ec(a={}){let e=document.querySelector("domotiapp-vraag");e||(e=document.createElement("domotiapp-vraag"),document.body.appendChild(e)),e.tabIndex=-1;let t=e.open(a);return e.focus?.(),t}xi(ec);var tc="/api/domotiapp_lovelace/loader.js",gs="domotiapp-lovelace-verversing";function fs(a){let e=/[?&]v=([0-9a-fA-F]+)/.exec(String(a??""));return e?e[1].toLowerCase():null}async function nc(a){try{let e=await a(tc,{cache:"no-store"});return e?.ok?fs(await e.text()):null}catch{return null}}function ac(){try{return globalThis.sessionStorage?.getItem(gs)??null}catch{return null}}function ic(a){try{globalThis.sessionStorage?.setItem(gs,a)}catch{return!1}return!0}function rc(a,e,t){return!a||!e?"onbekend":a===e?"actueel":t===e?"al-geprobeerd":"herladen"}function bs({eigenUrl:a,haal:e=globalThis.fetch?.bind(globalThis),herlaad:t=()=>globalThis.location?.reload(),doc:n=globalThis.document,interval:i=18e5,klok:r=setInterval}={}){let o=fs(a);if(!o||!e)return()=>{};let s=!1,d=async()=>{if(!s&&!n?.querySelector?.("dialog[open], ha-dialog[open]")){s=!0;try{let p=await nc(e);if(rc(o,p,ac())!=="herladen"||!ic(p))return;t()}finally{s=!1}}},l=()=>n?.visibilityState==="visible"?d():void 0;n?.addEventListener?.("visibilitychange",l);let c=r(l,i);return()=>{n?.removeEventListener?.("visibilitychange",l),clearInterval(c)}}var oc="0.19.0";Ai(a=>console.warn(`domotiapp-lovelace: ${a}`));bs({eigenUrl:import.meta.url});console.info(`%c DOMOTIAPP-LOVELACE %c ${oc} `,"background:#026fa1;color:#e8e4de;font-weight:600;border-radius:3px 0 0 3px;padding:2px 6px","background:#12120f;color:#e8e4de;border-radius:0 3px 3px 0;padding:2px 6px");export{oc as VERSION};
