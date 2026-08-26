var Wo=Object.defineProperty;var Go=(a,e,t)=>e in a?Wo(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var z=(a,e,t)=>Go(a,typeof e!="symbol"?e+"":e,t);var ae=`
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
`,be=`
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

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;function se(a){let e=new CSSStyleSheet;return e.replaceSync(a),e}var he=a=>String(a??"").split(".")[0],k=(a,e)=>e&&a?.states?.[e]||null,q=(a,e)=>k(a,e)?.attributes??{},vt=(a,e,t)=>t?null:q(a,e).entity_picture||null;function ni(a){if(!a||a.state!=="on")return null;let e=a.attributes??{};if(Array.isArray(e.entity_id))return null;let t=e.rgb_color;return Array.isArray(t)&&t.length>=3?`rgb(${t[0]},${t[1]},${t[2]})`:null}function R(a,e,t){return t||q(a,e).friendly_name||e||""}var qo=new Set(["scene","script","input_button","button","event"]),gn=a=>qo.has(he(a));function J(a){return!a||a.state==="unavailable"?!0:a.state==="unknown"?!gn(a.entity_id):!1}function ve(a){if(!a)return!1;let e=a.state;if(e==="unavailable"||e==="unknown")return!1;switch(he(a.entity_id)){case"cover":return e==="open"||e==="opening";case"alarm_control_panel":return e.startsWith("armed")||e==="triggered"||e==="arming";case"climate":case"water_heater":case"humidifier":return e!=="off";case"person":case"device_tracker":return e==="home";case"media_player":return e!=="off"&&e!=="idle"&&e!=="standby";default:return e==="on"||e==="playing"||e==="active"||e==="heat"}}var Fo=new Set(["light","switch","fan","input_boolean","automation","siren","humidifier","remote","water_heater"]),ai=a=>Fo.has(he(a));function ii(a,e,t){if(!a||a.themes!==e.themes||a.language!==e.language)return!0;for(let n of t)if(n&&a.states?.[n]!==e.states?.[n])return!0;return!1}function bt(a,e,t={}){a.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!1}))}var Y=(a,e)=>bt(a,"hass-more-info",{entityId:e});function qe(a){switch(he(a)){case"light":case"switch":case"fan":case"input_boolean":case"automation":case"siren":return{action:"toggle"};case"script":case"scene":case"input_button":case"button":return{action:"toggle"};default:return{action:"more-info"}}}function Zo(a){switch(he(a)){case"scene":return["scene","turn_on"];case"script":return["script","turn_on"];case"input_button":return["input_button","press"];case"button":return["button","press"];case"lock":return["lock","open"];case"cover":return["cover","toggle"];case"media_player":return["media_player","media_play_pause"];default:return["homeassistant","toggle"]}}function ue(a,e,t,n){if(!(!n||n.action==="none"))switch(n.action){case"more-info":Y(a,n.entity||t.entity);break;case"toggle":{let i=n.entity||t.entity;if(!i)break;let[r,o]=Zo(i);e.callService(r,o,{entity_id:i});break}case"perform-action":case"call-service":{let i=n.perform_action||n.service;if(!i)break;let[r,o]=i.split(".");e.callService(r,o,n.data??n.service_data??{},n.target);break}case"navigate":if(!n.navigation_path)break;history.pushState(null,"",n.navigation_path),bt(window,"location-changed",{replace:!1});break;case"url":n.url_path&&window.open(n.url_path,n.target??"_blank");break;case"assist":bt(a,"show-dialog",{dialogTag:"ha-voice-command-dialog",dialogImport:()=>{},dialogParams:{}});break;case"fire-dom-event":bt(a,"ll-custom",n);break;default:break}}function V(a,{onTap:e,onHold:t,onDouble:n}){let o=0,s=0,d=null,l=p=>{p.button!=null&&p.button!==0||(o=Date.now())},c=()=>{let p=o?Date.now()-o:0;if(o=0,t&&p>=500){navigator.vibrate?.(18),t();return}if(!n){e?.();return}if(s++,s===1){d=setTimeout(()=>{s=0,e?.()},260);return}clearTimeout(d),s=0,n()};return a.addEventListener("pointerdown",l),a.addEventListener("click",c),a.addEventListener("contextmenu",p=>p.preventDefault()),()=>{clearTimeout(d),a.removeEventListener("pointerdown",l),a.removeEventListener("click",c)}}function te(a,e){if(!e)return"";let t=he(e.entity_id),n=e.attributes.device_class;return a.formatEntityState?.(e)??a.localize?.(`component.${t}.entity_component.${n??"_"}.state.${e.state}`)??a.localize?.(`component.${t}.entity_component._.state.${e.state}`)??e.state}function F(a,e,t){let n=Number(e);return Number.isFinite(n)?n.toLocaleString(a?.locale?.language??"nl",{minimumFractionDigits:t??0,maximumFractionDigits:t??0}):"--"}var ei=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],ri=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"],ti=(a=new Date)=>new Date(a.getFullYear(),a.getMonth(),a.getDate()),fn=(a,e)=>Math.round((ti(e)-ti(a))/864e5);function Fe(a){if(!a)return null;if(a instanceof Date)return Number.isNaN(+a)?null:a;let e=String(a).trim(),t=e.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);if(t)return new Date(+t[3],+t[2]-1,+t[1]);if(t=e.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/),t)return new Date(+t[1],+t[2]-1,+t[3]);let n=new Date(e);return Number.isNaN(+n)?null:n}function bn(a,e=new Date){if(!a)return"";let t=fn(e,a);return t<0?`${Math.abs(t)} dagen geleden`:t===0?"vandaag":t===1?"morgen":t===2?"overmorgen":t<=6?ei[a.getDay()]:`${ei[a.getDay()].slice(0,2)} ${a.getDate()} ${ri[a.getMonth()]}`}var oi=a=>a?`${a.getDate()} ${ri[a.getMonth()]}`:"";function Xo(a){let e=Math.max(1,Math.ceil((a+8)/64));return e*56+(e-1)*8}function Yo(a){if(!a)return 0;let e=getComputedStyle(a),t=[...a.children].filter(r=>r.getBoundingClientRect().height>0);if(!t.length)return 0;let n=parseFloat(e.rowGap)||0;return t.reduce((r,o)=>r+o.getBoundingClientRect().height,0)+n*(t.length-1)+parseFloat(e.paddingTop)+parseFloat(e.paddingBottom)+parseFloat(e.borderTopWidth)+parseFloat(e.borderBottomWidth)}function O(a,e=4){if(!a)return;let t=Yo(a);if(!t){e>0&&requestAnimationFrame(()=>O(a,e-1));return}let n=`${Xo(t)}px`;a.style.getPropertyValue("--dac-raster")!==n&&a.style.setProperty("--dac-raster",n)}function He(a){let e=parseFloat(a?.style?.getPropertyValue?.("--dac-raster")??"");return!Number.isFinite(e)||e<=0?null:Math.max(1,Math.round((e+8)/64))}function B(a){if(!a||typeof ResizeObserver>"u")return()=>{};let e=new ResizeObserver(()=>{for(let t of a.children)e.observe(t);O(a)});e.observe(a);for(let t of a.children)e.observe(t);return O(a),()=>e.disconnect()}var Jo="home-assistant";function si({leesRegistry:a,definities:e,waarschuw:t=()=>{},plan:n=(d,l)=>setTimeout(d,l),nu:i=()=>Date.now(),marker:r=Jo,intervalMs:o=20,maxWachtMs:s=1e4}){let d=i();function l(){let u=a();if(!u)return!1;for(let[g,h]of e)try{u.get(g)||u.define(g,h)}catch(f){t(`kon ${g} niet registreren: ${f&&f.message}`)}return!0}function c(){let u=a();return!u||!u.get(r)?!1:l()}if(c())return!0;let p=()=>{if(!c()){if(i()-d>=s){t(`${r} is na ${s} ms niet verschenen; de kaart wordt alsnog geregistreerd`),l();return}n(p,o)}};return n(p,o),!1}var li=[];function C(a,e){li.push([a,e])}function Ve({type:a,name:e,description:t,preview:n=!0,documentationURL:i}){window.customCards=window.customCards??[],!window.customCards.some(r=>r.type===a)&&window.customCards.push({type:a,name:e??a,description:t??"",preview:n,documentationURL:i??"https://github.com/Sven2410/domotiapp-lovelace"})}function di(a=()=>{}){si({leesRegistry:()=>globalThis.customElements,definities:li,waarschuw:a})}var Qo=`
  :host {
    ${ae}
    display: block;
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  :host([hidden]) { display: none; }
`,M={accent:"var(--dac-accent-hi)",solar:"var(--dac-solar)",house:"var(--dac-house)",water:"var(--dac-grid-in)",magenta:"var(--dac-grid-out)",pink:"var(--dac-device-1)",teal:"var(--dac-device-2)",lit:"var(--dac-lit)",good:"var(--dac-good)",warn:"var(--dac-warn)",bad:"var(--dac-bad)",neutral:"var(--dac-ink-3)"},kt={accent:"Accent",solar:"Oranje",house:"Blauw",water:"Lichtblauw",magenta:"Magenta",pink:"Roze",teal:"Groenblauw",lit:"Lampgeel",good:"Goed",warn:"Let op",bad:"Kritiek",neutral:"Neutraal"},K=a=>String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),I=(a,e="accent")=>M[a]??(a&&/[#(]|^var/.test(a)?a:M[e]),T=Symbol("incomplete"),es=a=>`
  <div class="needs">
    <span class="mark"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6"/>
      <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>
    </svg></span>
    <span><b>Nog niets gekozen</b><span>${a}</span></span>
  </div>`,ts=56,ci=8,me=a=>Math.max(1,Math.ceil((a+ci)/(ts+ci))),A=class extends HTMLElement{static get styleSheets_(){return Object.hasOwn(this,"sheets_")||(this.sheets_=[se(Qo+be+this.css)]),this.sheets_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=new.target.styleSheets_,this.built_=!1,this.wired_=!1,this.teardown_=[],this.bewaakFocusRing_()}bewaakFocusRing_(){let e=0,t=0;this.shadowRoot.addEventListener("pointerdown",()=>{e=Date.now()},!0),this.shadowRoot.addEventListener("keydown",()=>{t=Date.now()},!0),this.shadowRoot.addEventListener("focusin",n=>{if(t>=e)return;let i=n.target;!i?.matches||i.matches("input, textarea, select, [contenteditable]")||requestAnimationFrame(()=>{t>=e||i.isConnected&&i.matches(":focus-visible")&&i.blur?.()})},!0)}setConfig(e){let t=this.validate(e??{});this.config=t,this.built_&&(this.destroy_(),this.shadowRoot.replaceChildren(),this.built_=!1,this.wired_=!1),this.isConnected&&this.build_()}set hass(e){let t=this.hass_;if(this.hass_=e,!!this.config){if(!this.built_){this.build_();return}this.config[T]||ii(t,e,this.watched())&&this.paint()}}get hass(){return this.hass_}connectedCallback(){if(this.config){if(!this.built_){this.build_();return}this.config[T]||this.wired_||(this.wire(),this.wired_=!0,this.hass_&&this.paint())}}disconnectedCallback(){this.destroy_(),this.wired_=!1}validate(e){return e}watched(){return this.config?.entity?[this.config.entity]:[]}template(){return""}wire(){}paint(){}build_(){let e=document.createElement("template"),t=this.config?.[T];if(e.innerHTML=t?es(t):this.template(),this.shadowRoot.appendChild(e.content),this.built_=!0,t){this.teardown_.push(B(this.$(".needs")));return}this.wire(),this.wired_=!0,this.hass_&&this.paint()}destroy_(){for(let e of this.teardown_)try{e()}catch{}this.teardown_=[]}on(e,t,n,i){e&&(e.addEventListener(t,n,i),this.teardown_.push(()=>e.removeEventListener(t,n,i)))}$(e){return this.shadowRoot.querySelector(e)}$$(e){return[...this.shadowRoot.querySelectorAll(e)]}text(e,t){let n=typeof e=="string"?this.$(e):e;n&&n.textContent!==String(t)&&(n.textContent=t)}getCardSize(){return 1}minRijen_(e=".card",t=1){return He(this.$(e))??t}};z(A,"css","");function N(a,e,{name:t,description:n,preview:i=!0}={}){C(a,e),Ve({type:a,name:t,description:n,preview:i})}function H(a,e){C(a,e)}var m=(a,e="none")=>`<svg class="icon" viewBox="0 0 24 24" fill="${e}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${a}</svg>`,E={house:m(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
    <path d="M5.4 12.9V20a.9.9 0 0 0 .9.9h11.4a.9.9 0 0 0 .9-.9v-7.1"/>
    <path d="M9.8 20.9v-5.2h4.4v5.2"/>`),floorB:m(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M9.4 17.8V14h2.4a1.9 1.9 0 0 1 0 3.8Z"/>`),floor1:m(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M10.6 15.2 12 14v3.9"/>`),floor2:m(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M10.4 14.8a1.6 1.6 0 0 1 3.1.5c0 1.4-3.1 1.8-3.1 3.5h3.2"/>`),garage:m(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M8.2 20.4v-5.6h7.6v5.6M8.2 17.6h7.6"/>`),garageOpen:m(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M7.6 14.4h8.8M7.6 12.4h8.8"/>`),garageClosed:m(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M7.6 13.2h8.8M7.6 15.4h8.8M7.6 17.6h8.8M7.6 19.8h8.8"/>`),bed:m(`<path d="M3.2 20.2V8.4"/>
    <path d="M3.2 16.4h17.6v3.8"/>
    <path d="M20.8 16.4v-3.1a2.3 2.3 0 0 0-2.3-2.3H9.9v5.4"/>
    <circle cx="6.8" cy="12.7" r="2"/>`),bedDouble:m(`<path d="M2.4 20.4V8.2M21.6 20.4V8.2"/>
    <path d="M2.4 16.6h19.2v3.8"/>
    <path d="M21.6 16.6v-2.9a2.2 2.2 0 0 0-2.2-2.2H4.6a2.2 2.2 0 0 0-2.2 2.2v2.9"/>
    <path d="M12 11.5v5.1"/>
    <path d="M5.2 11.5V9.9a.9.9 0 0 1 .9-.9h3.6a.9.9 0 0 1 .9.9v1.6"/>
    <path d="M13.4 11.5V9.9a.9.9 0 0 1 .9-.9h3.6a.9.9 0 0 1 .9.9v1.6"/>`),hanger:m(`<path d="M12 8.4V7.2a2.1 2.1 0 1 1 2.1-2.1"/>
    <path d="M12 8.4 3.2 15.6a1.4 1.4 0 0 0 .9 2.5h15.8a1.4 1.4 0 0 0 .9-2.5L12 8.4Z"/>`),wardrobe:m(`<rect x="4.2" y="2.8" width="15.6" height="17" rx="1.8"/>
    <path d="M12 2.8v17"/>
    <path d="M10.2 10.6v2.4M13.8 10.6v2.4"/>
    <path d="M6.6 19.8v1.6M17.4 19.8v1.6"/>`),sofa:m(`<path d="M5.2 11.6V8.4a1.9 1.9 0 0 1 1.9-1.9h9.8a1.9 1.9 0 0 1 1.9 1.9v3.2"/>
    <path d="M3 17.4v-4.1a2 2 0 0 1 4 0v1.5h10v-1.5a2 2 0 0 1 4 0v4.1z"/>
    <path d="M5.8 17.4v2.2M18.2 17.4v2.2"/>`),kitchen:m(`<path d="M4.4 10.2h15.2v5.2a4 4 0 0 1-4 4H8.4a4 4 0 0 1-4-4z"/>
    <path d="M2.4 12.2h2M19.6 12.2h2"/>
    <path d="M9.4 7.4c0-1.1 1.2-1.1 1.2-2.2M13.4 7.4c0-1.1 1.2-1.1 1.2-2.2"/>`),shower:m(`<path d="M4.6 20.6V7.2a2.6 2.6 0 0 1 2.6-2.6h5.2A2.6 2.6 0 0 1 15 7.2v1.6"/>
    <path d="M11 12.4a4 4 0 0 1 8 0z"/>
    <path d="M12.8 15.4v1.6M15 15.4v1.6M17.2 15.4v1.6M13.9 18.8v1.6M16.1 18.8v1.6"/>`),toilet:m(`<path d="M7 3.6h3.6v4.8H7z"/>
    <path d="M5.2 8.4h11.6l-1 5.2a4.6 4.6 0 0 1-4.5 3.7h-1a4.6 4.6 0 0 1-4.5-3.7z"/>
    <path d="M9.2 17.4v2.8h4.2v-2.8M7.6 20.2h7.4"/>`),desk:m(`<rect x="4.6" y="4.2" width="14.8" height="9.4" rx="1.8"/>
    <path d="M10.4 13.6v2.6h3.2v-2.6"/>
    <path d="M2.8 18.4h18.4"/>
    <path d="M5.2 18.4v2.4M18.8 18.4v2.4"/>`),stairs:m(`<path d="M3.6 20.4V16h4.3v-4.3h4.3V7.4h4.3V3.2h4.1"/>
    <path d="M3.6 20.4h16.8"/>`),parasol:m(`<path d="M12 20.8V9.4"/>
    <path d="M2.8 9.4a9.2 9.2 0 0 1 18.4 0z"/>
    <path d="M6.6 9.4C6.6 5.9 9 3 12 3s5.4 2.9 5.4 6.4"/>
    <path d="M12 20.8a2.2 2.2 0 0 0 2.2-2.2"/>`),fence:m(`<path d="M4.4 20.4V8.6L6.8 6l2.4 2.6v11.8M14.8 20.4V8.6L17.2 6l2.4 2.6v11.8"/>
    <path d="M2.6 11.4h18.8M2.6 15.4h18.8"/>
    <path d="M9.2 11.4v4M14.8 11.4v4"/>`),tree:m(`<path d="M12 3 7.6 9.4h8.8z"/>
    <path d="M12 7.6 5.8 16.2h12.4z"/>
    <path d="M12 16.2v4.4"/>
    <path d="M9.4 20.6h5.2"/>`),shutter:m(`<path d="M3.6 4.2h16.8M5.2 4.2v13.4M18.8 4.2v13.4"/>
    <path d="M5.2 7.6h13.6M5.2 11h13.6M5.2 14.4h13.6M5.2 17.6h13.6"/>`),shutterOpen:m(`<path d="M3.6 4.2h16.8M5.2 4.2v15.6M18.8 4.2v15.6"/>
    <path d="M5.2 6.6h13.6M5.2 8.6h13.6"/>`),awning:m(`<path d="M2.8 11.4 6.2 5h11.6l3.4 6.4z"/>
    <path d="M2.8 11.4c1.5 1.7 3 1.7 4.5 0s3-1.7 4.5 0 3 1.7 4.5 0 3-1.7 4.5 0"/>
    <path d="M12 14.6v4.8"/>`),arrowUp:m('<path d="M12 19.4V5M6.4 10.6 12 5l5.6 5.6"/>'),arrowDown:m('<path d="M12 4.6V19M17.6 13.4 12 19l-5.6-5.6"/>'),stop:m('<rect x="6.4" y="6.4" width="11.2" height="11.2" rx="1.8"/>'),bulb:m(`<path d="M9.4 18.4h5.2M10.4 21.2h3.2"/>
    <path d="M12 2.9a6.2 6.2 0 0 0-3.6 11.2c.5.4.8 1 .8 1.7v.4h5.6v-.4c0-.7.3-1.3.8-1.7A6.2 6.2 0 0 0 12 2.9Z"/>`),bulbGroup:m(`<path d="M7.6 15.6h4M8.2 17.8h2.8"/>
    <path d="M9.6 3.4a4.8 4.8 0 0 0-2.8 8.7c.4.3.6.8.6 1.3v.5h4.4v-.5c0-.5.2-1 .6-1.3a4.8 4.8 0 0 0-2.8-8.7Z"/>
    <path d="M16 8.4a4.4 4.4 0 0 1 2.4 8c-.3.3-.5.7-.5 1.1v.4h-3.8"/>
    <path d="M15.4 20.6h2.4"/>`),switchOn:m(`<rect x="2.8" y="7.4" width="18.4" height="9.2" rx="4.6"/>
    <circle cx="16.6" cy="12" r="2.6" fill="currentColor" stroke="none"/>`),person:m(`<circle cx="12" cy="7.6" r="3.6"/>
    <path d="M4.8 20.4v-1.2a5 5 0 0 1 5-5h4.4a5 5 0 0 1 5 5v1.2"/>`),people:m(`<circle cx="9.4" cy="8.2" r="3.2"/>
    <path d="M3.4 20v-1a4.6 4.6 0 0 1 4.6-4.6h2.8A4.6 4.6 0 0 1 15.4 19v1"/>
    <path d="M16.2 5.3a3.2 3.2 0 0 1 0 5.9"/>
    <path d="M17.6 14.6a4.6 4.6 0 0 1 3 4.3V20"/>`),away:m(`<circle cx="10.4" cy="7.6" r="3.4"/>
    <path d="M3.6 20.4v-1.2a4.8 4.8 0 0 1 4.8-4.8h2.6"/>
    <path d="M14.6 17.4h6M18 14.8l2.6 2.6-2.6 2.6"/>`),bin:m(`<path d="M3.6 6.8h16.8"/>
    <path d="M9.4 6.8V4.6a.9.9 0 0 1 .9-.9h3.4a.9.9 0 0 1 .9.9v2.2"/>
    <path d="m5.9 6.8 1 12.5a1 1 0 0 0 1 .9h8.2a1 1 0 0 0 1-.9l1-12.5"/>
    <path d="M10.2 10.6v5.8M13.8 10.6v5.8"/>`),binWheeled:m(`<path d="M5.6 7.4h12.8l-1 10.6a1 1 0 0 1-1 .9H7.6a1 1 0 0 1-1-.9z"/>
    <path d="M4.4 7.4h15.2M9.6 7.4V5.2h4.8v2.2"/>
    <circle cx="8.6" cy="20.4" r="1.3"/><circle cx="15.4" cy="20.4" r="1.3"/>`),calendar:m(`<rect x="3.6" y="5.4" width="16.8" height="15" rx="2"/>
    <path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6"/>`),sun:m(`<circle cx="12" cy="12" r="4.1"/>
    <path d="M12 2.4v2.3M12 19.3v2.3M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.4 12h2.3M19.3 12h2.3M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>`),cloud:m('<path d="M7.2 18.4a4.2 4.2 0 0 1-.5-8.4 5.6 5.6 0 0 1 10.8-1.2 3.9 3.9 0 0 1 .6 7.7z"/>'),cloudSun:m(`<path d="M6.8 8.2a3.4 3.4 0 1 1 4.6 3.2"/>
    <path d="M5 4.6 6.1 5.7M3.2 9.2h1.6M9.4 4.6 8.3 5.7M6.8 1.9v1.5"/>
    <path d="M9.4 19.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10 1 3.6 3.6 0 0 1 .5 6.8z"/>`),rain:m(`<path d="M7.4 15.4a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M9 18.2 8.2 20.6M12.4 18.2l-.8 2.4M15.8 18.2l-.8 2.4"/>`),snow:m(`<path d="M7.4 14.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M9 17.6v3M7.6 18.4l2.8 1.4M10.4 18.4l-2.8 1.4"/>
    <path d="M15 17.6v3M13.6 18.4l2.8 1.4M16.4 18.4l-2.8 1.4"/>`),fog:m(`<path d="M7.4 12.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M4.4 16h15.2M6.4 19.4h11.2"/>`),wind:m(`<path d="M3.4 8.4h9.4a2.7 2.7 0 1 0-2.7-2.7"/>
    <path d="M3.4 12.6h13.2a2.7 2.7 0 1 1-2.7 2.7"/>
    <path d="M3.4 16.8h6.2a2.5 2.5 0 1 1-2.5 2.5"/>`),drop:m('<path d="M12 3.4s5.6 6.1 5.6 9.8a5.6 5.6 0 0 1-11.2 0C6.4 9.5 12 3.4 12 3.4Z"/>'),uv:m(`<circle cx="12" cy="11.4" r="3.4"/>
    <path d="M12 3.6v1.8M12 17.4v1.6M4.6 11.4h1.8M17.6 11.4h1.8M6.6 6l1.3 1.3M16.1 15.5l1.3 1.3M6.6 16.8l1.3-1.3M16.1 7.3l1.3-1.3"/>
    <path d="M8.4 21.4h7.2"/>`),sunset:m(`<path d="M3.4 19.6h17.2M6.6 16.2a5.4 5.4 0 0 1 10.8 0"/>
    <path d="M12 3.2v3.4M5.2 6.6l1.8 1.8M18.8 6.6 17 8.4"/>`),sunrise:m(`<path d="M3.4 19.6h17.2M6.6 16.2a5.4 5.4 0 0 1 10.8 0"/>
    <path d="M12 8.2V3.4M9.4 5.8 12 3.2l2.6 2.6"/>`),thermo:m(`<path d="M14.2 14.6V5.6a2.2 2.2 0 1 0-4.4 0v9a4.2 4.2 0 1 0 4.4 0Z"/>
    <path d="M12 9.4v5.8"/>`),shield:m(`<path d="M12 3.2 4.8 5.9v5.5c0 4.4 3 8 7.2 9.4 4.2-1.4 7.2-5 7.2-9.4V5.9z"/>
    <path d="m9.1 12 2 2 3.8-4"/>`),bolt:m('<path d="M13.4 2.6 5.2 13.6h5.6L10.4 21.4l8.4-11.2h-5.6z"/>'),wifi:m(`<path d="M4.2 9.2a11.4 11.4 0 0 1 15.6 0"/>
    <path d="M7.4 12.6a6.9 6.9 0 0 1 9.2 0"/>
    <path d="M10.4 15.9a2.6 2.6 0 0 1 3.2 0"/>
    <circle cx="12" cy="19" r="1.1"/>`),smokeDetector:m(`<path d="M3 4.6h18"/>
    <path d="M6 4.6h12v5.4a2.6 2.6 0 0 1-2.6 2.6H8.6A2.6 2.6 0 0 1 6 10V4.6Z"/>
    <path d="M8.8 8h6.4"/>
    <circle cx="12" cy="10.2" r=".95" fill="currentColor" stroke="none"/>
    <path d="M8.8 16c1.5-1.3 2.8.5 4.3-.8M9.4 19.4c1.5-1.3 2.8.5 4.3-.8"/>`),co:m(`<path d="M10.6 9.2A3.4 3.4 0 1 0 10.6 14.8"/>
    <circle cx="16.2" cy="12" r="3.2"/>`),smoke:m(`<path d="M6.6 20.4c0-2.2 2.5-2.2 2.5-4.4S6.6 13.8 6.6 11.6 9.1 9.4 9.1 7.2"/>
    <path d="M12.7 20.4c0-2 2.2-2 2.2-4s-2.2-2-2.2-4 2.2-2 2.2-4"/>
    <path d="M18.3 20.4c0-1.8 1.9-1.8 1.9-3.6s-1.9-1.8-1.9-3.6"/>`),star:m('<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9.9 5.6L12 16.4l-5 2.6.9-5.6-4-3.9 5.6-.8z"/>'),moon:m('<path d="M20.4 14.3A8.6 8.6 0 0 1 9.7 3.6a8.8 8.8 0 1 0 10.7 10.7Z"/>'),radio:m(`<rect x="2.8" y="8.4" width="18.4" height="11.4" rx="2"/>
    <path d="m7.4 8.4 9.8-4.2"/>
    <circle cx="15.8" cy="14.1" r="2.9"/>
    <path d="M6.2 12.2h4.4M6.2 16h4.4"/>`),play:m('<path d="M8.6 5.8 18.4 12l-9.8 6.2z"/>'),pause:m('<path d="M9.6 5.8v12.4M14.4 5.8v12.4"/>'),next:m('<path d="m6.4 6.4 8.2 5.6-8.2 5.6z"/><path d="M17.6 6.2v11.6"/>'),prev:m('<path d="m17.6 6.4-8.2 5.6 8.2 5.6z"/><path d="M6.4 6.2v11.6"/>'),volume:m(`<path d="M4.4 9.4h3.2L12 5.9v12.2L7.6 14.6H4.4z"/>
    <path d="M15.4 9.6a3.4 3.4 0 0 1 0 4.8"/>
    <path d="M17.9 7.1a7 7 0 0 1 0 9.8"/>`),volumeMute:m(`<path d="M4.4 9.4h3.2L12 5.9v12.2L7.6 14.6H4.4z"/>
    <path d="m15.8 9.8 4.4 4.4M20.2 9.8l-4.4 4.4"/>`),search:m('<circle cx="10.6" cy="10.6" r="6.2"/><path d="m15.2 15.2 4.4 4.4"/>'),shuffle:m(`<path d="M3.6 7.6h3c1.2 0 2.3.6 3 1.6l4.2 5.6c.7 1 1.8 1.6 3 1.6h2.4"/>
    <path d="M3.6 16.4h3c1.2 0 2.3-.6 3-1.6"/>
    <path d="M13.8 9.2c.7-1 1.8-1.6 3-1.6h2.4"/>
    <path d="m17 5.4 2.2 2.2-2.2 2.2"/><path d="m17 14.2 2.2 2.2-2.2 2.2"/>`),repeat:m(`<path d="M7.4 7.4h9.2a2.6 2.6 0 0 1 2.6 2.6v1.2"/>
    <path d="m9.6 5.2-2.2 2.2 2.2 2.2"/>
    <path d="M16.6 16.6H7.4a2.6 2.6 0 0 1-2.6-2.6v-1.2"/>
    <path d="m14.4 18.8 2.2-2.2-2.2-2.2"/>`),repeatOne:m(`<path d="M7.4 7.4h9.2a2.6 2.6 0 0 1 2.6 2.6v1.2"/>
    <path d="m9.6 5.2-2.2 2.2 2.2 2.2"/>
    <path d="M16.6 16.6H7.4a2.6 2.6 0 0 1-2.6-2.6v-1.2"/>
    <path d="m14.4 18.8 2.2-2.2-2.2-2.2"/>
    <rect x="9.2" y="8.5" width="5.6" height="7" rx="1.4" fill="var(--icoon-vlak, #12120f)" stroke="none"/>
    <path d="M10.9 10.6 12.3 9.5v5"/>
    <path d="M11 14.5h2.6"/>`),speakers:m(`<rect x="3.6" y="3.8" width="8.8" height="16.4" rx="2"/>
    <circle cx="8" cy="14.4" r="2.6"/><path d="M8 7.6h.1"/>
    <path d="M15.6 6.6h4.8v10.8h-4.8"/>`),music:m(`<path d="M9.6 17.4V6.4l8.2-1.6v11"/>
    <ellipse cx="7.6" cy="17.6" rx="2.2" ry="1.9"/>
    <ellipse cx="15.8" cy="15.8" rx="2.2" ry="1.9"/>`),leaf:m(`<path d="M4.6 19.6c-1.4-7.6 3.4-14 14.9-15.2 1.1 8.4-3.3 15.3-14.9 15.2Z"/>
    <path d="M4.2 20.4c2.6-4.6 6-7.6 10.4-9.6"/>`),keuzelijst:m(`<path d="M9.4 6.2h11.2M9.4 12h11.2M9.4 17.8h11.2"/>
    <path d="M3.4 12.2 4.9 13.7 7.6 10.6"/>
    <path d="M4 6.2h1.6M4 17.8h1.6"/>`),cog:m(`<circle cx="12" cy="12" r="3.1"/>
    <path d="M12 3.4v2.2M12 18.4v2.2M20.6 12h-2.2M5.6 12H3.4M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6M18.1 18.1l-1.6-1.6M7.5 7.5 5.9 5.9"/>`),grid:m(`<rect x="3.6" y="3.6" width="7.2" height="7.2" rx="1.8"/>
    <rect x="13.2" y="3.6" width="7.2" height="7.2" rx="1.8"/>
    <rect x="3.6" y="13.2" width="7.2" height="7.2" rx="1.8"/>
    <rect x="13.2" y="13.2" width="7.2" height="7.2" rx="1.8"/>`),door:m(`<path d="M5.4 20.6h13.2"/>
    <path d="M6.8 20.6V4.6a.9.9 0 0 1 .9-.9h8.6a.9.9 0 0 1 .9.9v16"/>
    <circle cx="14.4" cy="12.4" r="1"/>`),window:m(`<rect x="4.2" y="3.8" width="15.6" height="16.4" rx="1.6"/>
    <path d="M12 3.8v16.4M4.2 12h15.6"/>`),lock:m(`<rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2"/>
    <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/>
    <circle cx="12" cy="15.3" r="1.2"/>`),lockOpen:m(`<rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2"/>
    <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.4-1.1"/>
    <circle cx="12" cy="15.3" r="1.2"/>`),fan:m(`<circle cx="12" cy="12" r="1.9"/>
    <path d="M12 10.1c0-3 .6-6.4 3-6.4 1.7 0 2.4 2.6-.4 4.6"/>
    <path d="M13.9 12c3 0 6.4.6 6.4 3 0 1.7-2.6 2.4-4.6-.4"/>
    <path d="M12 13.9c0 3-.6 6.4-3 6.4-1.7 0-2.4-2.6.4-4.6"/>
    <path d="M10.1 12c-3 0-6.4-.6-6.4-3 0-1.7 2.6-2.4 4.6.4"/>`),airco:m(`<rect x="3.4" y="4.6" width="17.2" height="8.2" rx="2"/>
    <path d="M6.6 9.6h10.8"/>
    <path d="M7.4 16.2c1.6 0 1.6 2.2 3.2 2.2M13.4 16.2c1.6 0 1.6 2.2 3.2 2.2"/>`),tv:m(`<rect x="2.8" y="4.4" width="18.4" height="12.2" rx="1.8"/>
    <path d="M8.4 20.2h7.2M12 16.6v3.6"/>`),speaker:m(`<rect x="5.6" y="2.8" width="12.8" height="18.4" rx="2"/>
    <circle cx="12" cy="15" r="3.2"/><circle cx="12" cy="6.8" r="1.2"/>`),camera:m(`<path d="M3.4 8.6A1.6 1.6 0 0 1 5 7h8a1.6 1.6 0 0 1 1.6 1.6v6.8A1.6 1.6 0 0 1 13 17H5a1.6 1.6 0 0 1-1.6-1.6z"/>
    <path d="m14.6 11 6-3v8l-6-3z"/>`),car:m(`<path d="M4.2 15.4h15.6"/>
    <path d="M6.2 15.4v2.4a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-2.4M20.3 15.4v2.4a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-2.4"/>
    <path d="M3.8 15.4v-3.2l2-4.6a1.3 1.3 0 0 1 1.2-.8h10a1.3 1.3 0 0 1 1.2.8l2 4.6v3.2z"/>
    <circle cx="7.4" cy="12.5" r=".95"/><circle cx="16.6" cy="12.5" r=".95"/>`),plug:m(`<path d="M9 3.4v5.2M15 3.4v5.2"/>
    <path d="M6.4 8.6h11.2v2.2a5.6 5.6 0 0 1-11.2 0z"/>
    <path d="M12 16.4v4.2"/>`),battery:m(`<rect x="2.8" y="7.4" width="16.4" height="9.2" rx="2"/>
    <path d="M21.2 10.6v2.8"/>
    <rect x="5.2" y="9.8" width="6" height="4.4" rx="1" fill="currentColor" stroke="none"/>`),gaugeArrow:m(`<path d="M4.2 17.4a8.4 8.4 0 1 1 15.6 0"/>
    <path d="m12 13.6 3.6-3.8"/><circle cx="12" cy="14.8" r="1.3"/>`),clock:m('<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 1.9"/>'),washer:m(`<rect x="4.2" y="2.8" width="15.6" height="18.4" rx="2"/>
    <circle cx="12" cy="14" r="4.4"/>
    <path d="M4.2 7.4h15.6M15.4 5.1h1.6"/>`),dishwasher:m(`<rect x="4.2" y="2.8" width="15.6" height="18.4" rx="2"/>
    <path d="M4.2 7.8h15.6M7.2 5.3h2.4"/>
    <path d="M9 11.4c1 1.4 1 2.8 0 4.2M12 11.4c1 1.4 1 2.8 0 4.2M15 11.4c1 1.4 1 2.8 0 4.2"/>`),printer:m(`<path d="M7 9V4.6a.6.6 0 0 1 .6-.6h8.8a.6.6 0 0 1 .6.6V9"/>
    <rect x="3.6" y="9" width="16.8" height="7.2" rx="1.8"/>
    <path d="M7 15.4h10v4a.6.6 0 0 1-.6.6H7.6a.6.6 0 0 1-.6-.6z"/>`),key:m(`<circle cx="7.8" cy="12" r="3.8"/>
    <path d="M11.6 12h8.6M17.4 12v3M20.2 12v2.2"/>`),power:m(`<path d="M12 3.6v8"/>
    <path d="M17.4 6.6a7.6 7.6 0 1 1-10.8 0"/>`),plus:m('<path d="M12 5.2v13.6M5.2 12h13.6"/>'),minus:m('<path d="M5.2 12h13.6"/>'),chevronRight:m('<path d="m9.4 6.2 5.6 5.8-5.6 5.8"/>'),chevronDown:m('<path d="m6.2 9.4 5.8 5.6 5.8-5.6"/>'),close:m('<path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"/>'),check:m('<path d="m5.2 12.6 4.4 4.4 9.2-10"/>'),dots:m('<circle cx="5.4" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.6" cy="12" r="1.5"/>'),warning:m('<path d="M12 4.2 2.8 20h18.4z"/><path d="M12 10v4.4M12 17.4v.1"/>'),question:m(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>`),pencil:m(`<path d="M4.5 19.5h3.2L18.4 8.8a1.9 1.9 0 0 0 0-2.7l-.5-.5a1.9 1.9 0 0 0-2.7 0L4.5 16.3z"/>
    <path d="m14.6 6.8 2.6 2.6"/>`),een:m(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10.6 9.9 12.4 8.6v6.9"/>`),twee:m(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10 9.7a2.1 2.1 0 1 1 3.9 1.1L9.9 15.5h4.2"/>`),drie:m(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10 9.5a2 2 0 1 1 1.8 2.6 2.1 2.1 0 1 1-1.7 2.7"/>`),vier:m(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M13.4 8.6 9.7 13.3h5"/>
    <path d="M13.4 8.6v6.9"/>`),vijf:m(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M14 8.7h-3.6v3.1h1.4a2.1 2.1 0 1 1-2 2.8"/>`),zes:m(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M13.8 9a2.2 2.2 0 0 0-3.7 1.7v2.4"/>
    <circle cx="12.1" cy="13.4" r="2.1"/>`),zeven:m(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M9.7 8.7h4.6l-2.8 6.8"/>`),acht:m(`<circle cx="12" cy="12" r="8.6"/>
    <circle cx="12" cy="10.3" r="1.7"/>
    <circle cx="12" cy="13.8" r="1.9"/>`),negen:m(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10.2 15a2.2 2.2 0 0 0 3.7-1.7v-2.4"/>
    <circle cx="11.9" cy="10.6" r="2.1"/>`),tien:m(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M8.6 10.3 10 9.2v5.7"/>
    <ellipse cx="13.9" cy="12.1" rx="1.7" ry="2.8"/>`),beach:m(`<circle cx="17" cy="6.6" r="2.6"/>
    <path d="M17 1.8v1.2M17 10.2v1.2M21.8 6.6h-1.2M13.4 6.6h-1.2M20.4 3.2l-.9.9M14.5 9.1l-.9.9"/>
    <path d="M2.4 15.4c1.6-1.5 3.2-1.5 4.8 0s3.2 1.5 4.8 0 3.2-1.5 4.8 0 3.2 1.5 4.8 0"/>
    <path d="M2.4 19.4c1.6-1.5 3.2-1.5 4.8 0s3.2 1.5 4.8 0 3.2-1.5 4.8 0 3.2 1.5 4.8 0"/>`),sleep:m(`<path d="M3.4 12.4h6.2l-6.2 7.2h6.2"/>
    <path d="M11.8 7.6h4.6l-4.6 5.4h4.6"/>
    <path d="M18.2 3.6h3.4l-3.4 4h3.4"/>`),boiler:m(`<rect x="5" y="3.4" width="14" height="12.8" rx="1.8"/>
    <path d="M12 6.8c1.9 1.8 2.8 3.2 2.8 4.4a2.8 2.8 0 0 1-5.6 0c0-1.2.9-2.6 2.8-4.4z"/>
    <path d="M8.4 16.2v4M15.6 16.2v4"/>
    <path d="M6.8 20.2h3.2M14 20.2h3.2"/>`),pressure:m(`<circle cx="12" cy="10.4" r="6.4"/>
    <path d="m12 10.4 3.2-3.2"/>
    <circle cx="12" cy="10.4" r=".8"/>
    <path d="M6.9 6.5 8 7.7M17.1 6.5 16 7.7M12 4v1.6"/>
    <path d="M9.6 16.2 8.8 20.4h6.4l-.8-4.2"/>`),bell:m(`<path d="M17.8 16.6H6.2l1.5-2.3V10a4.3 4.3 0 0 1 8.6 0v4.3z"/>
    <path d="M10.2 19.2a2 2 0 0 0 3.6 0"/>
    <path d="M12 5.7V4.2"/>`),refill:m(`<path d="M12 2.8c1.7 2 2.6 3.5 2.6 4.6a2.6 2.6 0 0 1-5.2 0c0-1.1.9-2.6 2.6-4.6z"/>
    <path d="M5.8 11.8h12.4v6.6a2.2 2.2 0 0 1-2.2 2.2H8a2.2 2.2 0 0 1-2.2-2.2z"/>
    <path d="M5.8 15.6c1.4-1.2 2.7-1.2 4.1 0s2.7 1.2 4.1 0 2.7-1.2 4.2 0"/>`),football:m(`<circle cx="12" cy="12" r="8.6"/>
    <path d="m12 7.3 3.7 2.7-1.4 4.4H9.7L8.3 10z"/>
    <path d="M12 7.3V3.4M15.7 10l3.7-1.2M14.3 14.4l2.3 3.1M9.7 14.4l-2.3 3.1M8.3 10 4.6 8.8"/>`),sports:m(`<circle cx="7.6" cy="15.6" r="4"/>
    <path d="M4.6 12.9a5.6 5.6 0 0 0 6 6"/>
    <ellipse cx="16.2" cy="7.6" rx="3.4" ry="4.2"/>
    <path d="M14.1 10.9 11 14.4"/>
    <path d="M13.6 6.2h5.2M13.4 8.8h5.6M15.3 3.7v7.8M17.4 3.9v7.6"/>`),raceCar:m(`<circle cx="7" cy="16.4" r="2.6"/>
    <circle cx="17.4" cy="16.4" r="2.6"/>
    <path d="M2.4 16.4h2M9.6 16.4h5.2M20 16.4h1.6"/>
    <path d="M4.4 14.2h1.4l1.6-2.4h4.2l1.6-2.6h2.4l.8 2.6h2.4l1.6 1.4-.4 1"/>
    <path d="M2.2 18.4h3.2M19.6 8.4h2.2M20.7 8.4v2.6"/>`),cctv:m(`<path d="M3.8 9.5 16.2 6l1.3 4.6L5.1 14.1z"/>
    <path d="m17.9 10.9 2.9-.8-.6-2.2-2.9.8"/>
    <path d="M9.4 13.3v1.9a2.4 2.4 0 0 1-2.4 2.4H5"/>
    <path d="M5 15.4v5M3 20.4h4"/>`)};function v(a,e="question"){return a?E[a]?E[a]:a.includes(":")?`<ha-icon class="icon" icon="${a}"></ha-icon>`:E[e]??E.question:E[e]??E.question}function vn(a,e={}){switch(String(a??"").split(".")[0]){case"light":return"bulb";case"switch":return"switchOn";case"cover":return e.device_class==="awning"||e.device_class==="blind"?"awning":"shutter";case"person":case"device_tracker":return"person";case"climate":return"thermo";case"binary_sensor":return e.device_class==="smoke"?"smoke":"shield";case"alarm_control_panel":return"shield";case"scene":case"script":case"input_button":case"button":return"star";case"weather":return"cloudSun";case"date":return"calendar";case"time":case"datetime":return"clock";case"input_datetime":return e.has_time===!1?"calendar":"clock";case"input_select":case"select":return"keuzelijst";case"media_player":return e.device_class==="tv"?"tv":e.device_class==="receiver"?"radio":"speaker";default:return"question"}}function Ze(a){switch(a){case"sunny":case"clear-night":return"sun";case"partlycloudy":return"cloudSun";case"cloudy":return"cloud";case"rainy":case"pouring":case"hail":case"lightning":case"lightning-rainy":return"rain";case"snowy":case"snowy-rainy":return"snow";case"fog":return"fog";case"windy":case"windy-variant":return"wind";default:return"cloud"}}var xt=[["Woning",["house","floorB","floor1","floor2","garage","door","window","stairs","grid"]],["Kamers",["bed","bedDouble","wardrobe","hanger","sofa","kitchen","shower","toilet","desk","garage"]],["Buiten",["tree","parasol","fence","sun","awning","car","beach"]],["Rolluiken",["shutter","shutterOpen","awning","garageOpen","garageClosed","arrowUp","arrowDown","stop"]],["Licht en stroom",["bulb","bulbGroup","switchOn","power","plug","bolt","battery"]],["Personen",["person","people","away"]],["Apparaten",["tv","speaker","camera","cctv","car","washer","dishwasher","printer","fan","airco","radio","boiler"]],["Media",["play","pause","next","prev","volume","volumeMute","shuffle","repeat","repeatOne","search","speakers","music"]],["Afval",["bin","binWheeled","calendar"]],["Weer",["sun","cloud","cloudSun","rain","snow","fog","wind","drop","uv","sunrise","sunset","thermo"]],["Status",["shield","lock","lockOpen","key","wifi","smoke","smokeDetector","co","warning","check","close","clock","gaugeArrow","bell","pressure","refill","sleep"]],["Cijfers",["een","twee","drie","vier","vijf","zes","zeven","acht","negen","tien"]],["Sport en vrije tijd",["football","sports","raceCar","beach"]],["Overig",["star","moon","leaf","cog","keuzelijst","dots","plus","minus","chevronRight","chevronDown","question","pencil"]]],pi={house:["huis","woning","thuis","home","hal","gang","entree","overzicht"],floorB:["begane grond","beneden","vloer","verdieping","etage","ground floor"],floor1:["1e verdieping","eerste","boven","vloer","etage","first floor"],floor2:["2e verdieping","tweede","zolder","vloer","etage","second floor"],garage:["garage","schuur","carport","berging"],door:["deur","voordeur","achterdeur","toegang","door","opening"],window:["raam","venster","ruit","window","kozijn"],stairs:["trap","overloop","traphal","stairs","treden","boven"],grid:["raster","kamers","overzicht","tegels","menu","grid","apps"],beach:["strand","zee","golven","kust","vakantie","zon en zee","beach","zomer","water"],sleep:["slapen","zzz","slaapstand","nachtmodus","slaap","sleep","rust","nacht","welterusten","dutje"],boiler:["ketel","cv","cv-ketel","boiler","verwarming","ketelstatus","boiler status","vlam","warmte"],pressure:["druk","bar","waterdruk","manometer","meter","pressure","keteldruk","spanning"],bell:["notificatie","melding","bel","meldingen","alert","waarschuwing","notification","bericht"],refill:["bijvullen","water bijvullen","vullen","water","peil","niveau","reservoir","refill","aanvullen"],football:["voetbal","bal","voetballen","sport","wedstrijd","football","soccer","eredivisie"],sports:["sport","sporten","sportief","bewegen","tennis","racket","wedstrijd","sports","verschillende sporten"],raceCar:["formule 1","f1","racewagen","raceauto","autosport","race","grand prix","verstappen","circuit"],cctv:["camera","bewakingscamera","cctv","beveiliging","toezicht","surveillance","buitencamera","beveiligingscamera"],bed:["slaapkamer","bed","slapen","slaap","sleep","bedroom","nacht","welterusten","logeerkamer"],bedDouble:["tweepersoonsbed","2 persoonsbed","bed","slaapkamer","slapen","sleep","double bed","twee personen","ouderslaapkamer","nacht"],wardrobe:["kledingkast","kast","garderobe","kleding","wardrobe","closet","inloopkast","slaapkamer"],hanger:["kleerhanger","hanger","kleding","kleren","garderobe","wasgoed","kledingkast","outfit"],sofa:["woonkamer","bank","sofa","zithoek","salon","living","livingroom","couch"],kitchen:["keuken","koken","pan","kitchen","cooking","eten","fornuis","kookplaat"],shower:["badkamer","douche","shower","bad","bathroom","wassen","sanitair"],toilet:["wc","toilet","sanitair","badkamer","restroom","plee"],desk:["kantoor","werkkamer","bureau","desk","office","computer","monitor","beeldscherm"],tree:["tuin","boom","buiten","garden","tree","achtertuin","voortuin","groen","natuur"],parasol:["terras","buiten","parasol","tuin","balkon","veranda","zonnescherm","outdoor","patio"],fence:["erf","hek","buiten","tuin","schutting","oprit","poort","fence","omheining"],shutter:["rolluik","gordijn","zonwering","shutter","screen","jaloezie","dicht","gesloten","cover"],shutterOpen:["rolluik open","gordijn open","zonwering","shutter","cover","omhoog"],awning:["zonnescherm","luifel","markies","awning","terras","zonwering","buiten"],garageOpen:["garagedeur open","garage","deur open","omhoog","geopend"],garageClosed:["garagedeur dicht","garage","deur dicht","gesloten","omlaag"],arrowUp:["omhoog","pijl omhoog","open","up","boven","openen","stijgen"],arrowDown:["omlaag","pijl omlaag","dicht","down","beneden","sluiten","dalen"],stop:["stop","stoppen","halt","vierkant","square"],bulb:["lamp","licht","verlichting","peer","light","bulb","spot","schemerlamp"],bulbGroup:["lampen","lichtgroep","verlichting","groep","lights","alle lampen"],switchOn:["schakelaar","knop","switch","aan uit","toggle","aanuit"],power:["aan uit","power","stroom","uitknop","aanknop","standby"],plug:["stopcontact","stekker","plug","socket","outlet","smart plug"],bolt:["stroom","energie","bliksem","elektriciteit","verbruik","power","energy","watt","kwh"],battery:["batterij","accu","battery","lading","opladen","percentage"],person:["persoon","iemand","gebruiker","person","wie","profiel","aanwezig"],people:["personen","mensen","gezin","iedereen","familie","people","gasten"],away:["weg","afwezig","niet thuis","away","vertrokken","uit huis"],tv:["televisie","tv","scherm","kijken","netflix","mediaspeler","chromecast"],speaker:["speaker","luidspreker","boxje","geluid","audio","sonos"],camera:["camera","beveiliging","bewaking","cctv","deurbel","opname","beeld"],car:["auto","wagen","car","laadpaal","opladen","voertuig","oprit","buiten"],washer:["wasmachine","was","wassen","washer","wasdroger","droger","laundry","wasruimte"],dishwasher:["vaatwasser","afwas","vaat","dishwasher","afwasmachine"],printer:["printer","printen","3d printer","papier","print"],fan:["ventilator","fan","ventilatie","afzuiging","wtw","luchtverversing","koelen"],airco:["airco","airconditioning","koeling","warmtepomp","klimaat","verwarming","hvac"],radio:["radio","zender","fm","stream","muziek","antenne"],play:["afspelen","play","start","spelen","muziek","starten"],pause:["pauze","pause","pauzeren","stil","onderbreken"],next:["volgende","next","verder","vooruit","overslaan","skip"],prev:["vorige","previous","terug","achteruit","prev"],volume:["volume","geluid","harder","luid","audio","sound"],volumeMute:["stil","mute","gedempt","geluid uit","dempen"],shuffle:["willekeurig","shuffle","husselen","door elkaar","random"],repeat:["herhalen","repeat","loop","opnieuw","herhaling"],repeatOne:["een herhalen","repeat one","herhalen","loop","dit nummer"],search:["zoeken","zoek","search","vergrootglas","vinden","opzoeken"],speakers:["speakers","groep","multiroom","luidsprekers","audio","koppelen"],music:["muziek","noot","music","nummer","liedje","spotify","audio"],bin:["afval","vuilnis","prullenbak","bak","container","waste","trash","kliko"],binWheeled:["kliko","container","afval","vuilnisbak","rolcontainer","ophaaldag","waste"],calendar:["agenda","kalender","datum","afspraak","planning","calendar","dag"],sun:["zon","zonnig","helder","sun","zonnepanelen","dag","weer","buiten"],cloud:["bewolkt","wolk","cloud","betrokken","grijs","weer"],cloudSun:["halfbewolkt","wolk","zon","weer","wisselend","partly cloudy"],rain:["regen","buien","nat","rain","neerslag","weer","paraplu"],snow:["sneeuw","winter","vorst","snow","koud","ijs","weer"],fog:["mist","nevel","fog","zicht","weer"],wind:["wind","waait","storm","bries","windkracht","weer"],drop:["druppel","vocht","luchtvochtigheid","water","regen","humidity","nat","lekkage"],uv:["uv","uv index","zon","straling","zonkracht","huid"],sunrise:["zonsopkomst","opkomst","ochtend","sunrise","dageraad","vroeg"],sunset:["zonsondergang","ondergang","avond","sunset","schemer"],thermo:["temperatuur","thermometer","graden","warm","koud","thermostaat","klimaat","verwarming"],shield:["beveiliging","schild","alarm","veilig","bescherming","shield","security"],lock:["slot","op slot","vergrendeld","gesloten","lock","sleutel","dicht","beveiligd"],lockOpen:["slot open","ontgrendeld","geopend","unlock","los","open"],key:["sleutel","key","toegang","code","wachtwoord","slot"],wifi:["wifi","netwerk","internet","verbinding","router","signaal","wlan"],smoke:["rookmelder","rook","brand","smoke","melder","vuur","alarm"],smokeDetector:["rookmelder","melder","rook","brand","smoke detector","detector","plafond","alarm"],co:["koolmonoxide","co","gas","melder","cv","kachel","carbon monoxide","vergiftiging"],warning:["waarschuwing","let op","attentie","warning","uitroepteken","storing","probleem"],check:["goed","vinkje","in orde","klaar","check","gelukt"],close:["sluiten","kruis","dicht","annuleren","close","weg"],clock:["klok","tijd","uur","wekker","timer","clock","wanneer"],gaugeArrow:["meter","wijzer","stand","gauge","niveau","druk","snelheid"],een:["1","een","eerste","one"],twee:["2","twee","tweede","two"],drie:["3","drie","derde","three"],vier:["4","vier","vierde","four"],vijf:["5","vijf","vijfde","five"],zes:["6","zes","zesde","six"],zeven:["7","zeven","zevende","seven"],acht:["8","acht","achtste","eight"],negen:["9","negen","negende","nine"],tien:["10","tien","tiende","ten"],star:["ster","favoriet","star","belangrijk","voorkeur","top"],moon:["maan","nacht","slapen","donker","moon","nachtstand","avond"],leaf:["blad","groen","eco","duurzaam","plant","natuur","besparen","tuin"],keuzelijst:["keuzelijst","keuze","lijst","modus","stand","programma","dropdown","select","kiezen","opties"],cog:["instellingen","tandwiel","beheer","settings","configuratie","opties","systeem"],dots:["meer","drie puntjes","menu","opties","extra","overig","more"],plus:["plus","meer","erbij","toevoegen","hoger","omhoog","add"],minus:["min","minder","eraf","lager","verwijderen","omlaag"],chevronRight:["pijl rechts","verder","volgende","chevron","open","meer"],chevronDown:["pijl omlaag","uitklappen","openklappen","chevron","meer","dropdown"],question:["vraagteken","onbekend","hulp","help","vraag","geen idee"],pencil:["potlood","bewerken","wijzigen","aanpassen","edit","pen","instellen"]},kn=a=>String(a??"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();function ns(a,e){let t=[...(pi[a]??[]).map(kn),kn(a)],n=0;for(let i=0;i<t.length;i++){let r=t[i];if(!r)continue;let o=0;for(let s of[r,...r.split(" ")])s===e?o=Math.max(o,3):s.startsWith(e)?o=Math.max(o,2):s.includes(e)&&(o=Math.max(o,1));if(o&&(n=Math.max(n,o+.5/(1+i))),n>=3.5)break}return n}function as(a,e){let t=0;for(let n of e){let i=ns(a,n);if(!i)return 0;t+=i}return t}var ke=a=>pi[a]?.[0]??a;function is(a=xt){let e=[];for(let[,t]of a)for(let n of t)e.includes(n)||e.push(n);return e}function hi(a,e=xt){let t=kn(a).split(" ").filter(Boolean);if(!t.length)return e;let n=[];for(let i of is(e)){let r=as(i,t);r&&n.push({sleutel:i,score:r})}return n.sort((i,r)=>r.score-i.score||ke(i.sleutel).localeCompare(ke(r.sleutel))),[[`${n.length} gevonden`,n.map(i=>i.sleutel)]]}var rs=`
  :host { ${ae} display: block; font-family: var(--dac-font); }
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
`,xn=null,ui=a=>a.map(([e,t])=>`
      <div class="group">
        <h4>${e}</h4>
        <div class="grid">
          ${t.map(n=>`<button type="button" class="opt" data-icon="${n}" title="${ke(n)} (${n})" aria-pressed="false">${E[n]??""}<span class="naam">${ke(n)}</span></button>`).join("")}
        </div>
      </div>`).join(""),_n=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),xn=xn??[se(rs)],this.shadowRoot.adoptedStyleSheets=xn,this.value_="",this.vraag_="",this.label="Icoon",this.fallback="question",this.auto=!0}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}connectedCallback(){this.built_||(this.built_=!0,this.build_())}build_(){this.shadowRoot.innerHTML=`
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
          <div class="groepen">${ui(xt)}</div>
          <div class="mdi">
            <label for="mdi">Of Home Assistant-icoon</label>
            <input id="mdi" type="text" placeholder="mdi:washing-machine" spellcheck="false" />
            <button type="button" class="clear">Wissen</button>
          </div>
        </div>
      </div>`,this.$(".current").addEventListener("click",()=>{let n=this.toggleAttribute("open");this.$(".current").setAttribute("aria-expanded",String(n)),n&&requestAnimationFrame(()=>this.$("#zoek").focus())});let e=this.$("#zoek");e.addEventListener("input",()=>this.zoek_(e.value)),e.addEventListener("keydown",n=>{if(n.key==="Escape"){n.stopPropagation(),this.zoek_(""),e.value="";return}if(n.key!=="Enter")return;let i=this.shadowRoot.querySelectorAll(".opt");i.length===1&&(n.preventDefault(),this.emit_(i[0].dataset.icon))}),this.$(".wis").addEventListener("click",()=>{e.value="",this.zoek_(""),e.focus()}),this.$(".groepen").addEventListener("click",n=>{let i=n.target.closest?.(".opt");i&&this.emit_(i.dataset.icon)});let t=this.$("#mdi");t.addEventListener("change",()=>this.emit_(t.value.trim())),this.$(".clear").addEventListener("click",()=>this.emit_("")),this.paint_()}zoek_(e){this.vraag_=e??"",this.toggleAttribute("zoekt",!!this.vraag_.trim());let t=hi(this.vraag_),n=this.$(".groepen"),i=t.length===1&&!t[0][1].length;n.innerHTML=i?`<div class="niets">Geen icoon gevonden voor "${this.vraag_.trim()}".<br>Een <code>mdi:</code>-naam hieronder werkt altijd.</div>`:ui(t),n.scrollTop=0,this.markeer_()}markeer_(){for(let e of this.shadowRoot.querySelectorAll(".opt"))e.setAttribute("aria-pressed",String(e.dataset.icon===this.value_))}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Icoon";let e=this.value_,t=e||this.fallback||"question";this.$(".preview").innerHTML=v(t,this.fallback),this.$(".who b").textContent=e?e.includes(":")?e:ke(e):this.auto?"Automatisch":"Kies een icoon",this.$(".who small").textContent=e?e.includes(":")?"Home Assistant-icoon":`DomotiApp-icoon -- ${e}`:this.auto?"Past zich aan de entiteit aan":"Nog niets gekozen",this.markeer_();let n=this.$("#mdi");if(this.shadowRoot.activeElement===n)return;let i=e&&e.includes(":")?e:"";n.value!==i&&(n.value=i)}emit_(e){this.value_=e,this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};C("dac-icon-picker",_n);var os=["accent","solar","house","water","magenta","pink","teal","lit","neutral"],ss=["good","warn","bad"],ls=/^(#[0-9a-f]{3,8}|var\(--[\w-]+\)|rgba?\([^)]*\))$/i,ds=`
  :host { ${ae} display: block; font-family: var(--dac-font); }
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

  h4 { margin: 0 0 7px; font-size: 10.5px; font-weight: 600; letter-spacing: .12em;
       text-transform: uppercase; color: var(--secondary-text-color, var(--dac-ink-3)); }
  h4 + .row { margin-bottom: 14px; }
  .row:last-child { margin-bottom: 0; }

  .row { display: flex; flex-wrap: wrap; gap: 8px; }
  :host([compact]) .row { gap: 6px; }

  .sw {
    position: relative; width: 34px; height: 34px; padding: 0; cursor: pointer;
    border-radius: 10px; border: 2px solid transparent; background: var(--c);
    display: grid; place-items: center; color: #0c0c0a;
  }
  :host([compact]) .sw { width: 28px; height: 28px; border-radius: 8px; }
  .sw .icon { width: 16px; height: 16px; opacity: 0; }
  .sw[aria-pressed="true"] { border-color: var(--primary-text-color, var(--dac-ink)); }
  .sw[aria-pressed="true"] .icon { opacity: 1; }
  .sw.auto {
    background: repeating-linear-gradient(45deg,
      rgba(127,127,127,.25) 0 5px, transparent 5px 10px);
    color: var(--primary-text-color, var(--dac-ink));
  }

  /* De eigen kleur is een echte kleurkiezer van het systeem, met het invoerveld
     eroverheen gelegd zodat de swatch zelf de knop is. */
  .eigen { position: relative; overflow: hidden; }
  .eigen.leeg {
    background: conic-gradient(#fd0774, #dc7300, #f5c451, #039580, #129be4, #235efa, #bc10c8, #fd0774);
  }
  .eigen input[type="color"] {
    position: absolute; inset: 0; width: 100%; height: 100%;
    opacity: 0; cursor: pointer; border: 0; padding: 0;
  }

  .vrij { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
  .vrij label { font-size: 11.5px; color: var(--secondary-text-color, var(--dac-ink-3));
                white-space: nowrap; }
  .vrij input[type="text"] {
    flex: 1 1 auto; min-width: 0; font: inherit; font-size: 13px;
    padding: 8px 10px; border-radius: 8px;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--primary-text-color, var(--dac-ink));
  }
  .vrij input[type="text"]:focus { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  .vrij input[type="text"][aria-invalid="true"] { border-color: var(--error-color, #d03b3b); }
  .vrij button {
    font: inherit; font-size: 12px; padding: 8px 12px; border-radius: 8px; cursor: pointer;
    border: 1px solid var(--divider-color, var(--dac-border));
    background: transparent; color: var(--secondary-text-color, var(--dac-ink-2));
  }
  .vrij button:hover { color: var(--primary-text-color, var(--dac-ink)); }
  :host([compact]) .vrij { display: none; }

  .note { margin: 10px 0 0; font-size: 11.5px; line-height: 1.45;
          color: var(--secondary-text-color, var(--dac-ink-3)); }

  .chosen { margin-top: 10px; font-size: 12px; color: var(--secondary-text-color, var(--dac-ink-2)); }
  .chosen b { color: var(--primary-text-color, var(--dac-ink)); font-weight: 500; }
  :host([compact]) .chosen, :host([compact]) .note { display: none; }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
`,wn=null,yn=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),wn=wn??[se(ds)],this.shadowRoot.adoptedStyleSheets=wn,this.value_="",this.label="Kleur",this.statuses=!1}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}set compact(e){this.toggleAttribute("compact",!!e)}get compact(){return this.hasAttribute("compact")}connectedCallback(){this.built_||(this.built_=!0,this.build_())}eigen_(){return!!this.value_&&!(this.value_ in M)}swatch(e){return`<button type="button" class="sw" data-tone="${e}" style="--c:${M[e]}"
      title="${kt[e]}" aria-label="${kt[e]}" aria-pressed="false">${E.check}</button>`}build_(){this.shadowRoot.innerHTML=`
      <div class="label"></div>
      <div class="box">
        ${this.statuses?"<h4>Identiteit</h4>":""}
        <div class="row">
          <button type="button" class="sw auto" data-tone="" title="Automatisch"
            aria-label="Automatisch" aria-pressed="false">${E.check}</button>
          ${os.map(n=>this.swatch(n)).join("")}
          <span class="sw eigen leeg" title="Eigen kleur" aria-pressed="false">
            ${E.check}
            <input type="color" aria-label="Eigen kleur kiezen" />
          </span>
        </div>
        ${this.statuses?`<h4>Status</h4>
               <div class="row">${ss.map(n=>this.swatch(n)).join("")}</div>
               <p class="note">
                 Statuskleuren betekenen iets: goed, let op, kritiek. Gebruik ze niet om
                 een kaart mooier te maken &mdash; dan zegt rood straks niets meer.
               </p>`:""}
        <div class="vrij">
          <label for="vrij">Of eigen kleur</label>
          <input id="vrij" type="text" spellcheck="false" placeholder="#198fd9 of var(--primary-color)" />
          <button type="button" class="wissen">Wissen</button>
        </div>
        <p class="note vrijnote">
          Een eigen kleur mag een hexwaarde zijn of een variabele uit je thema.
          <b>var(--primary-color)</b> volgt je thema mee; een hexwaarde staat vast.
        </p>
        <div class="chosen"></div>
      </div>`,this.shadowRoot.querySelectorAll("button.sw").forEach(n=>n.addEventListener("click",()=>this.emit_(n.dataset.tone)));let e=this.$('input[type="color"]');e.addEventListener("input",()=>this.emit_(e.value));let t=this.$("#vrij");t.addEventListener("change",()=>{let n=t.value.trim();if(!n){this.emit_("");return}let i=ls.test(n);t.setAttribute("aria-invalid",String(!i)),i&&this.emit_(n)}),this.$(".wissen").addEventListener("click",()=>this.emit_("")),this.paint_()}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Kleur";let e=this.eigen_();this.shadowRoot.querySelectorAll("button.sw").forEach(i=>i.setAttribute("aria-pressed",String((i.dataset.tone||"")===this.value_)));let t=this.$(".eigen");t.setAttribute("aria-pressed",String(e)),t.classList.toggle("leeg",!e),t.style.setProperty("--c",e?this.value_:"transparent"),t.title=e?`Eigen kleur: ${this.value_}`:"Eigen kleur",e&&/^#[0-9a-f]{6}$/i.test(this.value_)&&(this.$('input[type="color"]').value=this.value_);let n=this.$("#vrij");if(this.shadowRoot.activeElement!==n){let i=e?this.value_:"";n.value!==i&&(n.value=i),n.setAttribute("aria-invalid","false")}this.$(".chosen").innerHTML=this.value_?e?`Gekozen: <b>${this.value_}</b> &mdash; eigen kleur.`:`Gekozen: <b>${kt[this.value_]??this.value_}</b>`:"Gekozen: <b>Automatisch</b> &mdash; de kaart kiest op domein en toestand."}emit_(e){this.value_=e??"",this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.value_},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};C("dac-tone-picker",yn);var x={entity:a=>({entity:a?{domain:a}:{}}),text:()=>({text:{}}),multiline:()=>({text:{multiline:!0}}),bool:()=>({boolean:{}}),number:(a,e,t=1)=>({number:{min:a,max:e,step:t,mode:"box"}}),select:a=>({select:{mode:"dropdown",options:a}}),action:(a="more-info")=>({ui_action:{default_action:a}})},$n=(...a)=>({type:"grid",name:"",schema:a});var cs=[{name:"bare",selector:x.bool()}],ps={bare:"Haalt de vulling en de schaduw onder de kaart weg. De rand blijft staan, zodat de kaart nog een vorm heeft op een dashboard zonder vlakken."},L=class extends HTMLElement{constructor(){super(),this.config_={},this.built_=!1}setConfig(e){this.config_={...this.defaults(),...e},this.render_()}defaults(){return{}}set hass(e){this.hass_=e,this.form_&&(this.form_.hass=e);for(let t of this.pickers_??[])t.hass=e;this.render_()}get hass(){return this.hass_}connectedCallback(){this.render_()}schema(){return[]}gedeeldeVelden(){return cs}volledigSchema_(){return[...this.schema(),...this.gedeeldeVelden()]}pickers(){return[]}label(e){return zn[e.name]??e.name}helper(){}async render_(){if(!this.hass_||!this.config_)return;if(this.built_){this.sync_();return}this.built_=!0,await customElements.whenDefined("ha-form"),this.replaceChildren(),this.pickers_=[];let e=this.pickers();this.pickerSig_=e.map(o=>o.key).join("|");let t=o=>{let s=document.createElement("div");return s.style.cssText=`display:flex;flex-direction:column;gap:12px;${o}`,s},n=t("margin-bottom:16px"),i=t("margin-top:16px");for(let o of e){let s=document.createElement(o.kind==="tone"?"dac-tone-picker":"dac-icon-picker");s.label=o.label,s.fallback=o.fallback,o.auto===!1&&(s.auto=!1),o.statuses===!1&&(s.statuses=!1),o.compact&&(s.compact=!0),s.hass=this.hass_,s.value=this.config_[o.key],s.addEventListener("value-changed",d=>{d.stopPropagation(),this.patch_({[o.key]:d.detail.value})}),this.pickers_.push(s),s.dataset.key=o.key,(o.after?i:n).appendChild(s)}n.children.length&&this.appendChild(n);let r=document.createElement("ha-form");r.hass=this.hass_,r.data=this.config_,r.schema=this.volledigSchema_(),r.computeLabel=o=>this.label(o),r.computeHelper=o=>this.helper(o)??ps[o.name],r.addEventListener("value-changed",o=>{o.stopPropagation(),this.patch_(o.detail.value,!0)}),this.form_=r,this.appendChild(r),i.children.length&&this.appendChild(i)}sync_(){let e=this.pickers().map(t=>t.key).join("|");if(this.pickerSig_!==void 0&&this.pickerSig_!==e){this.built_=!1,this.form_=null,this.render_();return}this.form_&&(this.form_.hass=this.hass_,this.form_.schema=this.volledigSchema_(),this.form_.data=this.config_);for(let t of this.pickers_??[])t.hass=this.hass_,t.value=this.config_[t.dataset.key]}patch_(e,t=!1){let n=t?{...e}:{...this.config_,...e};this.config_.type&&(n.type=this.config_.type);for(let[i,r]of Object.entries(n))(r===""||r===void 0||r===null)&&delete n[i];this.config_=n,this.sync_(),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.serialize(n)},bubbles:!0,composed:!0}))}serialize(e){return e}},zn={entity:"Entiteit",entities:"Entiteiten",name:"Naam",icon:"Icoon",tone:"Kleur",secondary:"Tweede regel",layout:"Vorm",tap_action:"Tikken",hold_action:"Vasthouden",double_tap_action:"Dubbeltikken",show_state:"Status tonen",show_name:"Naam tonen",show_icon:"Icoon tonen",fill:"Vullen",collapsible:"Inklapbaar",title:"Titel",subtitle:"Ondertitel",weather:"Weerentiteit",sun:"Zon-entiteit",person:"Persoon",persons:"Personen",covers:"Rolluiken",lights:"Lampen",sensors:"Sensoren",greeting:"Begroeting",show_clock:"Klok tonen",show_weather:"Weer tonen",show_chips:"Weerdetails tonen",compact:"Compact",columns:"Kolommen",group:"Groepsregel tonen",invert:"Open en dicht omdraaien",label:"Label",color:"Kleur",date_format:"Datumnotatie",bare:"Achtergrond weglaten"};function hs(a=new Date){let e=a.getHours();return e<6?"Goedenacht":e<12?"Goedemorgen":e<18?"Goedemiddag":"Goedenavond"}var us=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],ms=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],jn={humidity:{icon:"drop",tone:"water",label:"Luchtvochtigheid"},wind:{icon:"wind",tone:"neutral",label:"Wind"},uv:{icon:"uv",tone:"solar",label:"UV-index"},precipitation:{icon:"rain",tone:"water",label:"Neerslag"},pressure:{icon:"gaugeArrow",tone:"neutral",label:"Luchtdruk"},sunrise:{icon:"sunrise",tone:"warn",label:"Zonsopkomst"},sunset:{icon:"sunset",tone:"warn",label:"Zonsondergang"}},gs=["humidity","wind","uv","precipitation","sunset"],fs=a=>a==null||Number.isNaN(+a)?"":["N","NO","O","ZO","Z","ZW","W","NW"][Math.round(+a/45)%8],_t=class extends A{validate(e){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768,...e}}watched(){let e=this.config;return[e.weather,e.weather_uv,e.sun,e.precipitation_entity].filter(Boolean)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.show_rule===!1&&this.setAttribute("no-rule",""),`
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
      </div>`}wire(){let e=()=>{let n=6e4-Date.now()%6e4+50;this.timer_=setTimeout(()=>{this.paintClock_(),e()},n)};e(),this.teardown_.push(()=>clearTimeout(this.timer_));let t=Number(this.config.hide_below)||0;if(t>0){let n=matchMedia(`(max-width: ${t-1}px)`),i=()=>this.toggleAttribute("narrow",n.matches);i(),n.addEventListener("change",i),this.teardown_.push(()=>n.removeEventListener("change",i))}}paintClock_(){let e=new Date,t=this.config.name??this.hass?.user?.name??"",n=hs(e);this.$(".hello").innerHTML=t?`${n}, <b>${t}</b>`:n,this.text(".date",`${us[e.getDay()]} ${e.getDate()} ${ms[e.getMonth()]}`);let i=this.$(".clock");i&&this.text(i,e.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"}))}paint(){this.paintClock_();let e=this.config,t=k(this.hass,e.weather),n=q(this.hass,e.weather),i=this.$(".now");if(i&&t){let d=Ze(t.state);i.style.setProperty("--wtone",I(e.tone,"water"));let l=this.hass?.config?.unit_system?.temperature??"\xB0C";this.$(".temp").innerHTML=n.temperature!=null?`${F(this.hass,n.temperature,0)}<span>${l}</span>`:"--";let c=i.querySelector(".ic");c.dataset.icon!==d&&(c.dataset.icon=d,c.innerHTML=v(d,"cloud")),this.text(i.querySelector(".cond"),te(this.hass,t))}let r=this.$(".chips");if(!r)return;let o=gs.map(d=>this.chip_(d,n)).filter(Boolean),s=o.map(d=>`${d.key}${d.value}`).join("|");r.dataset.sig!==s&&(r.dataset.sig=s,r.innerHTML=o.map(d=>`<span class="chip2" style="--tone:${I(jn[d.key].tone)}" title="${jn[d.key].label}">
             ${E[jn[d.key].icon]??""}${d.value}
           </span>`).join(""))}chip_(e,t){let n=this.config;switch(e){case"humidity":return t.humidity!=null?{key:e,value:`${Math.round(t.humidity)}%`}:null;case"wind":{if(t.wind_speed==null)return null;let i=this.hass?.config?.unit_system?.wind_speed??"km/h",r=fs(t.wind_bearing);return{key:e,value:`${F(this.hass,t.wind_speed,0)} ${i}${r?` ${r}`:""}`}}case"uv":{let r=q(this.hass,n.weather_uv).uv_index??t.uv_index??(n.weather_uv?Number(k(this.hass,n.weather_uv)?.state):null);return r!=null&&!Number.isNaN(+r)?{key:e,value:`UV ${F(this.hass,r,1)}`}:null}case"precipitation":{let i=k(this.hass,n.precipitation_entity);if(i){let r=Number(i.state);if(Number.isNaN(r))return null;let o=i.attributes.unit_of_measurement??"mm";return{key:e,value:`${F(this.hass,r,1)} ${o}`}}return t.precipitation!=null&&!Number.isNaN(+t.precipitation)?{key:e,value:`${F(this.hass,t.precipitation,1)} mm`}:null}case"pressure":return t.pressure!=null?{key:e,value:`${F(this.hass,t.pressure,0)} ${t.pressure_unit??"hPa"}`}:null;case"sunset":case"sunrise":{let r=k(this.hass,n.sun)?.attributes?.[e==="sunset"?"next_setting":"next_rising"];if(!r)return null;let o=new Date(r);return Number.isNaN(+o)?null:{key:e,value:o.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"})}}default:return null}}getCardSize(){return 2}getGridOptions(){return{columns:"full",rows:2,min_rows:2,max_rows:2}}static getConfigElement(){return document.createElement("domotiapp-header-card-editor")}static getStubConfig(e){return{weather:Object.keys(e?.states??{}).find(n=>n.startsWith("weather.")),sun:"sun.sun"}}};z(_t,"css",`
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
  `);var En=class extends L{defaults(){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768}}pickers(){return[{key:"tone",kind:"tone",label:"Kleur weericoon"}]}schema(){return[$n({name:"weather",selector:x.entity("weather")},{name:"weather_uv",selector:{entity:{domain:["weather","sensor"]}}}),$n({name:"sun",selector:x.entity("sun")},{name:"precipitation_entity",selector:x.entity("sensor")}),{name:"name",selector:x.text()},{name:"hide_below",selector:x.number(0,1400,8)}]}label(e){return{weather:"Weer (temperatuur, wind)",weather_uv:"Tweede weerbron (UV-index)",precipitation_entity:"Neerslagsensor",show_rule:"Accentlijn tonen",hide_below:"Verbergen onder breedte (px)",name:"Naam"}[e.name]??super.label(e)}helper(e){if(e.name==="weather_uv")return"Alleen voor de UV-index. Handig als je hoofdbron die niet meelevert.";if(e.name==="precipitation_entity")return"Een sensor in mm of mm/h, bijvoorbeeld neerslagintensiteit of regen laatste uur.";if(e.name==="hide_below")return"768 verbergt de header op telefoons en houdt hem op tablets en desktops. 0 zet het uit.";if(e.name==="name")return"Leeg laten voor de naam van de ingelogde gebruiker."}};H("domotiapp-header-card-editor",En);N("domotiapp-header-card",_t,{name:"DomotiApp Header",description:"Smalle strip met begroeting, weer en klok. Verbergt zichzelf op telefoons."});var wt=class extends A{validate(e){return{icon:"",tone:"accent",line:!0,...e}}watched(){return this.config.secondary_entity?[this.config.secondary_entity]:[]}template(){let e=this.config,t=e.icon!==null&&e.icon!==!1;return t||this.setAttribute("no-icon",""),`
      <div class="sep" style="--tone:${I(e.tone)}">
        ${t?`<span class="chip">${v(e.icon,"star")}</span>`:""}
        <h3></h3>
        ${e.line===!1?"":'<span class="rule"></span>'}
        <span class="sub"><span class="si"></span><span class="sv"></span></span>
      </div>`}paint(){this.text("h3",this.config.name??"");let e=this.$(".sub");if(!e)return;let t=k(this.hass,this.config.secondary_entity),n=e.querySelector(".si"),i=e.querySelector(".sv");if(!t){i.textContent="",n.innerHTML="";return}let r=this.config.secondary_icon??"";n.dataset.icon!==r&&(n.dataset.icon=r,n.innerHTML=r?v(r):"");let o=t.attributes.unit_of_measurement;i.textContent=o?`${t.state} ${o}`:t.attributes.current_temperature!=null?`${t.attributes.current_temperature} \xB0C`:te(this.hass,t)}getCardSize(){return 1}getGridOptions(){return{columns:"full",rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-separator-card-editor")}static getStubConfig(){return{name:"Nieuwe sectie",icon:"house",tone:"accent"}}};z(wt,"css",`
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
  `);var Sn=class extends L{defaults(){return{line:!0,tone:"accent"}}gedeeldeVelden(){return[]}pickers(){return[{key:"icon",kind:"icon",label:"Icoon links",fallback:"star",auto:!1},{key:"tone",kind:"tone",label:zn.tone},{key:"secondary_icon",kind:"icon",label:"Icoon bij de waarde rechts",auto:!1}]}schema(){return[{name:"name",selector:x.text()},{name:"line",selector:x.bool()},{name:"secondary_entity",selector:x.entity()}]}label(e){return{line:"Lijn tonen",secondary_entity:"Waarde rechts (optioneel)"}[e.name]??super.label(e)}helper(e){if(e.name==="secondary_entity")return"Toont de status van deze entiteit rechts van de lijn, bijvoorbeeld een temperatuur of een aantal."}};H("domotiapp-separator-card-editor",Sn);N("domotiapp-separator-card",wt,{name:"DomotiApp Separator",description:"Sectiekop met icoon en vervagende lijn."});var An=(a,e,t)=>Math.min(t,Math.max(e,a));function xe(a,e){let t=e.min??0,n=e.max??100,i=e.step??1,r=!1,o=h=>{let f=a.getBoundingClientRect();if(!f.width)return t;let b=An((h-f.left)/f.width,0,1),w=t+b*(n-t);return An(Math.round(w/i)*i,t,n)},s=h=>{try{a.setPointerCapture?.(h)}catch{}},d=h=>{try{a.hasPointerCapture?.(h)&&a.releasePointerCapture(h)}catch{}},l=h=>{e.disabled?.()||h.button!=null&&h.button!==0||(r=!0,s(h.pointerId),a.classList.add("dragging"),e.onInput(o(h.clientX)),h.preventDefault())},c=h=>{r&&(e.onInput(o(h.clientX)),h.preventDefault())},p=h=>{r&&(r=!1,d(h.pointerId),a.classList.remove("dragging"),e.onCommit(o(h.clientX)))},u=h=>{r&&(r=!1,d(h?.pointerId),a.classList.remove("dragging"),e.onInput(e.value()))},g=h=>{if(e.disabled?.())return;let f=(n-t)/10,b={ArrowLeft:-i,ArrowDown:-i,ArrowRight:i,ArrowUp:i,PageDown:-f,PageUp:f,Home:-1/0,End:1/0};if(!(h.key in b))return;h.preventDefault();let w=e.value(),$=An(b[h.key]===-1/0?t:b[h.key]===1/0?n:w+b[h.key],t,n);e.onInput($),e.onCommit($)};return a.addEventListener("pointerdown",l),a.addEventListener("pointermove",c),a.addEventListener("pointerup",p),a.addEventListener("pointercancel",u),a.addEventListener("keydown",g),()=>{a.removeEventListener("pointerdown",l),a.removeEventListener("pointermove",c),a.removeEventListener("pointerup",p),a.removeEventListener("pointercancel",u),a.removeEventListener("keydown",g)}}var le=(a="")=>`
  <div class="slider ${a}" role="slider" tabindex="0"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div class="track"><div class="fill"></div></div>
    <div class="thumb"></div>
  </div>`,_e=`
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
`;var bs=new Set(["brightness","color_temp","hs","rgb","rgbw","rgbww","xy","white"]),vs=new Set(["hs","rgb","rgbw","rgbww","xy"]),Nn=a=>a?.attributes?.supported_color_modes??[],ks=a=>Nn(a).some(e=>bs.has(e)),yt=a=>Nn(a).some(e=>vs.has(e)),$t=a=>Nn(a).includes("color_temp"),mi=a=>Math.max(1,Math.round((a??0)/255*100)),zt=class extends A{validate(e){let t=e.entity??e.lights?.[0]??e.entities?.[0],n=typeof t=="string"?t:t?.entity;return n?{show_colour:!0,...e,entity:n}:{...e,[T]:"Kies een lamp."}}watched(){return[this.config.entity]}template(){return this.config.bare&&this.setAttribute("bare",""),`
      <div class="card surface">
        <div class="lamp" data-on="false" style="--tone:var(--dac-lit)">
          <button class="chip" type="button" aria-label="Aan of uit"></button>
          <span class="txt"><span class="nm"></span><span class="v tnum"></span></span>
          <span class="ctl" style="display:contents"></span>
        </div>
        <div class="colour" hidden></div>
      </div>`}wire(){let e=this.config.entity;this.teardown_.push(V(this.$(".chip"),{onTap:()=>this.hass.callService("light","toggle",{entity_id:e}),onHold:()=>Y(this,e)})),this.on(this.$(".card"),"click",t=>{t.target.closest(".toggle")&&this.hass.callService("light","toggle",{entity_id:e})}),this.teardown_.push(B(this.$(".card"))),this.sliders_=new Map}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let i=xe(e,n);this.sliders_.set(t,i),this.teardown_.push(i)}setSlider_(e,t,n=0,i=100){if(!e)return;let r=i>n?(t-n)/(i-n)*100:0;e.style.setProperty("--v",`${r}%`),e.setAttribute("aria-valuemin",String(n)),e.setAttribute("aria-valuemax",String(i)),e.setAttribute("aria-valuenow",String(t))}paint(){let e=this.config,t=k(this.hass,e.entity),n=J(t),i=t?.state==="on",r=this.$(".lamp");r.dataset.on=String(i),r.classList.toggle("unavailable",n);let o=this.$(".chip"),s=e.icon||"bulb";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=v(s,"bulb")),this.text(".nm",R(this.hass,e.entity,e.name));let d=i?t?.attributes?.rgb_color:null;r.style.setProperty("--tone",d?`rgb(${d[0]},${d[1]},${d[2]})`:"var(--dac-lit)");let l=this.$(".ctl"),c=n?"none":ks(t)?"range":"toggle";if(l.dataset.kind!==c&&(l.dataset.kind=c,l.innerHTML=c==="range"?le("brightness"):c==="toggle"?'<button class="toggle" type="button" role="switch" aria-checked="false" aria-label="Aan of uit"></button>':"",this.sliders_.delete("brightness")),c==="range"){let p=l.querySelector(".slider");if(this.attach_(p,"brightness",{value:()=>t?.state==="on"?mi(k(this.hass,e.entity)?.attributes?.brightness):0,onInput:u=>{this.setSlider_(p,u),this.text(".v",u===0?"Uit":`${u}%`)},onCommit:u=>{u===0?this.hass.callService("light","turn_off",{entity_id:e.entity}):this.hass.callService("light","turn_on",{entity_id:e.entity,brightness_pct:u})},disabled:()=>J(k(this.hass,e.entity))}),!p.classList.contains("dragging")){let u=i?mi(t.attributes.brightness):0;this.setSlider_(p,u),this.text(".v",i?`${u}%`:"Uit")}}else c==="toggle"?(l.querySelector(".toggle")?.setAttribute("aria-checked",String(i)),this.text(".v",i?"Aan":"Uit")):this.text(".v","Niet bereikbaar");this.paintColour_(t,i),O(this.$(".card"))}paintColour_(e,t){let n=this.$(".colour"),i=this.config.show_colour!==!1&&(yt(e)||$t(e));if(n.hidden=!(i&&t),!i)return;let r=`${yt(e)?"c":""}${$t(e)?"t":""}`;if(n.dataset.sig!==r){n.dataset.sig=r,n.innerHTML=(yt(e)?`<span data-kind="hue" style="display:contents">${le("hue")}</span>`:"")+($t(e)?`<span data-kind="kelvin" style="display:contents">${le("kelvin")}</span>`:"");let l=n.querySelector(".slider.hue");l&&(l.dataset.strip="",l.style.setProperty("--strip","linear-gradient(90deg, hsl(0 90% 55%), hsl(60 90% 55%), hsl(120 90% 55%), hsl(180 90% 55%), hsl(240 90% 55%), hsl(300 90% 55%), hsl(360 90% 55%))"),l.setAttribute("aria-label","Kleur"));let c=n.querySelector(".slider.kelvin");c&&(c.dataset.strip="",c.style.setProperty("--strip","linear-gradient(90deg,#ffb15e,#ffd6a8,#fff5e8,#eaf1ff,#cbdcff)"),c.setAttribute("aria-label","Kleurtemperatuur")),this.sliders_.delete("hue"),this.sliders_.delete("kelvin")}if(!t)return;let o=this.config.entity,s=n.querySelector(".slider.hue");s&&(this.attach_(s,"hue",{min:0,max:360,value:()=>k(this.hass,o)?.attributes?.hs_color?.[0]??0,onInput:l=>this.setSlider_(s,l,0,360),onCommit:l=>{let c=k(this.hass,o)?.attributes?.hs_color?.[1]??100;this.hass.callService("light","turn_on",{entity_id:o,hs_color:[l,c]})}}),s.classList.contains("dragging")||this.setSlider_(s,Math.round(e.attributes.hs_color?.[0]??0),0,360));let d=n.querySelector(".slider.kelvin");if(d){let l=e.attributes.min_color_temp_kelvin??2e3,c=e.attributes.max_color_temp_kelvin??6500;if(this.attach_(d,"kelvin",{min:l,max:c,step:50,value:()=>k(this.hass,o)?.attributes?.color_temp_kelvin??l,onInput:p=>this.setSlider_(d,p,l,c),onCommit:p=>this.hass.callService("light","turn_on",{entity_id:o,color_temp_kelvin:p})}),!d.classList.contains("dragging")){let p=e.attributes.color_temp_kelvin;p!=null&&this.setSlider_(d,p,l,c)}}}getCardSize(){let e=k(this.hass,this.config?.entity);return e?.state==="on"&&(yt(e)||$t(e))?2:1}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",1)}}static getConfigElement(){return document.createElement("domotiapp-light-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("light."));return n?{entity:n}:{}}};z(zt,"css",`
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

    ${_e}

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
  `);var Mn=class extends L{defaults(){return{show_colour:!0}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"bulb"}]}schema(){return[{name:"entity",selector:x.entity("light")},{name:"name",selector:x.text()},{name:"show_colour",selector:x.bool()}]}label(e){return{entity:"Lamp",name:"Naam (overschrijft die van de lamp)",show_colour:"Kleurstrips tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"E\xE9n lamp per kaart. Dimbaar krijgt een schuif, alleen schakelbaar een tuimelaar.";if(e.name==="show_colour")return"Kleur en kleurtemperatuur verschijnen zodra de lamp aan is. De kaart is dan twee rijen hoog."}};H("domotiapp-light-card-editor",Mn);N("domotiapp-light-card",zt,{name:"DomotiApp Verlichting",description:"E\xE9n lamp op \xE9\xE9n rasterrij: dimmen, kleur en kleurtemperatuur."});function gi(a){if(!a)return null;let e=Number(a.state);return Number.isFinite(e)?e:null}function xs(a){let e=a?.attributes?.hvac_action;return e||(a?.state==="off"?"off":a?.state==="cool"?"cooling":a?.state==="heat"?"idle":null)}var Tn={heating:"var(--dac-solar)",cooling:"var(--dac-grid-in)",drying:"var(--dac-grid-in)",fan:"var(--dac-grid-in)"},fi={heating:"Verwarmt",cooling:"Koelt",drying:"Ontvochtigt",fan:"Ventileert",idle:"Uit",off:"Uit"},jt=class extends A{validate(e){return e.entity||e.temperature||e.humidity?{...e}:{...e,[T]:"Kies een thermostaat, of een temperatuursensor."}}watched(){let e=this.config;return[e.entity,e.temperature,e.humidity].filter(Boolean)}step_(){let e=q(this.hass,this.config.entity);return Number(this.config.step??e.target_temp_step)||.5}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.entity||this.setAttribute("readout",""),`
      <div class="card surface">
        <button class="chip" type="button" aria-label="Meer info"></button>
        <div class="txt">
          <div class="nm"></div>
          <div class="read">
            <span class="temp"></span>
            <span class="sep"></span>
            <span class="hum"></span>
          </div>
        </div>
        ${e.entity?`<div class="set">
                 <button type="button" data-d="-1" aria-label="Lager">${E.minus}</button>
                 <span class="target tnum"></span>
                 <button type="button" data-d="1" aria-label="Hoger">${E.plus}</button>
               </div>`:""}
      </div>`}wire(){let e=this.config;this.teardown_.push(()=>clearTimeout(this.sendTimer_)),this.teardown_.push(V(this.$(".chip"),{onTap:()=>Y(this,e.entity||e.temperature||e.humidity)}));let t=this.$(".set");t&&t.querySelectorAll("button").forEach(n=>this.on(n,"click",()=>this.nudge_(Number(n.dataset.d))))}nudge_(e){let t=this.config,n=q(this.hass,t.entity),i=this.step_(),r=Number(n.min_temp??5),o=Number(n.max_temp??35),s=this.pending_??Number(n.temperature);if(!Number.isFinite(s))return;let d=Math.min(o,Math.max(r,Math.round((s+e*i)/i)*i));this.pending_=d,this.paintTarget_(),clearTimeout(this.sendTimer_),this.sendTimer_=setTimeout(()=>{this.sendTimer_=null,this.hass.callService("climate","set_temperature",{entity_id:t.entity,temperature:this.pending_}),setTimeout(()=>{this.pending_=null,this.paint()},1500)},450)}paintTarget_(){let e=this.$(".target");if(!e)return;let t=q(this.hass,this.config.entity),n=this.pending_??Number(t.temperature);e.classList.toggle("pending",this.pending_!=null),e.textContent=Number.isFinite(n)?`${F(this.hass,n,n%1?1:0)}\xB0`:"--"}paint(){let e=this.config,t=e.entity?k(this.hass,e.entity):null,n=e.entity?J(t):!1;this.toggleAttribute("dead",n);let i=xs(t),r=e.tone?I(e.tone):Tn[i]??"var(--dac-ink-3)";this.$(".card").style.setProperty("--tone",r),this.toggleAttribute("busy",!!Tn[i]);let o=this.$(".chip"),s=e.icon||"thermo";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=v(s,"thermo")),o.style.setProperty("--tone",Tn[i]?r:"var(--dac-ink-3)"),this.text(".nm",R(this.hass,e.entity||e.temperature||e.humidity,e.name));let d=e.temperature?gi(k(this.hass,e.temperature)):Number(q(this.hass,e.entity).current_temperature),l=this.hass?.config?.unit_system?.temperature??"\xB0C";this.text(".temp",Number.isFinite(d)?`${F(this.hass,d,1)} ${l}`:"--");let c=e.humidity?gi(k(this.hass,e.humidity)):null,p=this.$(".hum");p.innerHTML=c==null?"":`${E.drop}${F(this.hass,c,0)}%`,this.text(".sep",c==null?"":"\xB7"),e.entity&&!e.humidity&&fi[i]&&i!=="idle"&&(this.text(".sep","\xB7"),p.textContent=fi[i]),this.paintTarget_();let u=this.$(".set");if(u){let g=q(this.hass,e.entity),h=this.pending_??Number(g.temperature);u.querySelector('[data-d="-1"]').disabled=n||h<=Number(g.min_temp??5),u.querySelector('[data-d="1"]').disabled=n||h>=Number(g.max_temp??35)}}getCardSize(){return 1}getGridOptions(){return{columns:12,rows:1,min_columns:4,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-climate-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("climate."));return n?{entity:n}:{}}};z(jt,"css",`
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
  `);var Cn=class extends L{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"thermo"},{key:"tone",kind:"tone",label:"Vaste kleur (leeg = volgt de ketel)"}]}schema(){return[{name:"entity",selector:x.entity("climate")},{name:"temperature",selector:{entity:{domain:"sensor",device_class:"temperature"}}},{name:"humidity",selector:{entity:{domain:"sensor",device_class:"humidity"}}},{name:"name",selector:x.text()},{name:"step",selector:x.number(.1,5,.1)}]}label(e){return{entity:"Thermostaat (optioneel)",temperature:"Temperatuursensor (optioneel)",humidity:"Vochtigheidssensor (optioneel)",name:"Naam",step:"Stap van de knoppen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Leeg laten voor een kaart die alleen meet. Met thermostaat komen de stelknoppen erbij.";if(e.name==="temperature")return"Wint van de meting van de thermostaat zelf. Handig als er een betere sensor in de kamer hangt.";if(e.name==="step")return"Leeg laten volgt de thermostaat, en anders een halve graad."}};H("domotiapp-climate-card-editor",Cn);N("domotiapp-climate-card",jt,{name:"DomotiApp Klimaat",description:"Thermostaat, losse temperatuur- en vochtsensor, of allebei."});var bi=({label:a="Aan of uit",cls:e=""}={})=>`<button class="toggle ${e}" type="button" role="switch" aria-checked="false" aria-label="${a}"><span class="knob"></span></button>`;function Ln(a,e){if(!a)return;let t=String(!!e);a.getAttribute("aria-checked")!==t&&a.setAttribute("aria-checked",t)}function vi(a,e){let t=a.querySelector(".knob"),n=!1,i=0,r=!1,o=!1,s=()=>{n=!1,a.classList.remove("dragging"),t?.style.removeProperty("--knob")},d=h=>{h!==e.value()&&(Ln(a,h),e.set(h))},l=h=>{if(!e.disabled?.()&&!(h.button!=null&&h.button!==0)){h.stopPropagation(),n=!0,r=!1,o=!1,i=h.clientX,a.classList.add("dragging");try{a.setPointerCapture?.(h.pointerId)}catch{}}},c=h=>{if(!n)return;let f=h.clientX-i;Math.abs(f)>3&&(r=!0);let b=e.value()?22:0,w=Math.min(22,Math.max(0,b+f));t?.style.setProperty("--knob",`${w}px`)},p=h=>{if(!n)return;h.stopPropagation();let f=h.clientX-i,b=e.value()?22:0,w=Math.min(22,Math.max(0,b+f));s();try{a.hasPointerCapture?.(h.pointerId)&&a.releasePointerCapture(h.pointerId)}catch{}o=!0,d(r?w>22/2:!e.value())},u=()=>{n&&s()},g=h=>{if(h.stopPropagation(),h.preventDefault(),o){o=!1;return}e.disabled?.()||d(!e.value())};return a.addEventListener("pointerdown",l),a.addEventListener("pointermove",c),a.addEventListener("pointerup",p),a.addEventListener("pointercancel",u),a.addEventListener("click",g),()=>{a.removeEventListener("pointerdown",l),a.removeEventListener("pointermove",c),a.removeEventListener("pointerup",p),a.removeEventListener("pointercancel",u),a.removeEventListener("click",g)}}var ki=`
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
`;var Et=a=>String(a??"").split(".")[0],xi=new Set(["input_datetime","time","date","datetime"]),_i=a=>xi.has(Et(a)),de=a=>String(a).padStart(2,"0");function _s(a){let e=String(a??"");return/^\d{4}-\d{2}-\d{2}[ T]\d{1,2}:\d{2}/.test(e)?"datetime-local":/^\d{4}-\d{2}-\d{2}$/.test(e)?"date":/^\d{1,2}:\d{2}/.test(e)?"time":null}function On(a){if(!a)return null;let e=Et(a.entity_id);if(e==="time")return"time";if(e==="date")return"date";if(e==="datetime")return"datetime-local";if(e!=="input_datetime")return null;let t=a.attributes??{};return typeof t.has_date=="boolean"||typeof t.has_time=="boolean"?t.has_date&&t.has_time?"datetime-local":t.has_date?"date":t.has_time?"time":null:_s(a.state)}var ws=a=>`${a.getFullYear()}-${de(a.getMonth()+1)}-${de(a.getDate())}T${de(a.getHours())}:${de(a.getMinutes())}`;function ys(a){let e=-a.getTimezoneOffset(),t=e<0?"-":"+",n=Math.abs(e);return`${t}${de(Math.floor(n/60))}:${de(n%60)}`}function wi(a,e=On(a)){if(!a||!e)return"";let t=String(a.state??"");if(!t||t==="unknown"||t==="unavailable")return"";if(e==="time"){let i=t.match(/^(\d{1,2}):(\d{2})/);return i?`${de(i[1])}:${i[2]}`:""}if(e==="date"){let i=t.match(/^(\d{4}-\d{2}-\d{2})$/);return i?i[1]:""}if(Et(a.entity_id)==="datetime"){let i=new Date(t);return Number.isNaN(+i)?"":ws(i)}let n=t.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})/);return n?`${n[1]}T${de(n[2].split(":")[0])}:${n[2].split(":")[1]}`:""}function yi(a,e,t){let n=Et(a),i=String(t??"");if(!i||!xi.has(n)||!e)return null;if(e==="time"){let u=i.match(/^(\d{1,2}):(\d{2})/);if(!u)return null;let g=`${de(u[1])}:${u[2]}:00`;return n==="time"?["time","set_value",{entity_id:a,time:g}]:["input_datetime","set_datetime",{entity_id:a,time:g}]}if(e==="date")return/^\d{4}-\d{2}-\d{2}$/.test(i)?n==="date"?["date","set_value",{entity_id:a,date:i}]:["input_datetime","set_datetime",{entity_id:a,date:i}]:null;let r=i.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})/);if(!r)return null;let[,o,s,d,l,c]=r,p=`${de(l)}:${c}:00`;if(n==="datetime"){let u=ys(new Date(+o,+s-1,+d,+l,+c));return["datetime","set_value",{entity_id:a,datetime:`${o}-${s}-${d}T${p}${u}`}]}return["input_datetime","set_datetime",{entity_id:a,datetime:`${o}-${s}-${d} ${p}`}]}var $i=a=>String(a??"").split(".")[0],zi=new Set(["input_select","select"]),Dn=a=>zi.has($i(a));function Ae(a){if(!a||!Dn(a.entity_id))return[];let e=a.attributes?.options;return Array.isArray(e)?e.filter(t=>typeof t=="string"&&t!==""):[]}function St(a,e=Ae(a)){let t=String(a?.state??"");return!t||t==="unknown"||t==="unavailable"?"":e.includes(t)?t:""}function At(a,e,t=[]){let n=$i(a),i=String(e??"");return!i||!zi.has(n)||t.length&&!t.includes(i)?null:[n,"select_option",{entity_id:a,option:i}]}var ji={auto:"automatisch",automatic:"automatisch",eco:"eco",intensiv:"intensief",intensive:"intensief",kurz:"kort",quick:"snel",express:"snel",speed:"snel",glas:"glas",glass:"glas",delicate:"fijn",normal:"normaal",night:"nacht",silence:"stil",quiet:"stil",hygiene:"hygi\xEBne",hygienic:"hygi\xEBne",favorite:"favoriet",favourite:"favoriet",steam:"stoom",fresh:"fris",care:"verzorging",machinecare:"machineverzorging",machine:"machine",prerinse:"voorspoelen",rinse:"spoelen",presoak:"voorweken",soak:"weken",wash:"wassen",dry:"drogen",half:"half",load:"belading",mixed:"gemengd",maximum:"maximaal",cleaning:"reinigen",clean:"reinigen",pots:"pannen",chef:"chef",kitchen:"keuken",party:"feest",daily:"dagelijks",super:"super",turbo:"turbo",energy:"energie",saving:"zuinig",off:"uit",on:"aan",none:"geen",standby:"stand-by",ready:"gereed",pause:"pauze",stop:"stop",start:"start",finished:"klaar",low:"laag",medium:"midden",high:"hoog"},$s=/^.*program(?:me)?[_.\- ]/i,zs=30,js=95;function Es(a){return String(a??"").replace($s,"").replace(/([a-z])([A-Z])/g,"$1 $2").replace(/([a-zA-Z])(\d)/g,"$1 $2").replace(/(\d)([a-zA-Z])/g,"$1 $2").split(/[\s_.\-]+/).filter(Boolean)}function Ss(a){let e=Es(a);if(!e.length)return"";let t=[];for(let i=0;i<e.length;i++){let r=e[i],o=r.toLowerCase();if(/^\d+$/.test(o)){let l=Number(o);t.push(l>=zs&&l<=js?`${l} \xB0C`:o);continue}let s=e[i+1]?.toLowerCase(),d=s?ji[o+s]:void 0;if(d){t.push(d),i++;continue}t.push(ji[o]??r)}let n=t.join(" ");return n.charAt(0).toUpperCase()+n.slice(1)}function As(a,e){let t=i=>String(i??"").toLowerCase().replace(/[^a-z0-9]/g,""),n=t(e);return!!n&&n!==t(a)}function Mt(a,e){return As(a,e)?String(e):Ss(a)||String(a??"")}var Ct={row:44,tile:96,compact:44,beeld:120},we=6,Ei=12,Rn=22,Ms=["row","tile","compact","beeld"],Ns=["links","midden"],Hn=48,Vn=320,Nt=120,ye=a=>{if(a==null||a==="")return Nt;let e=Math.round(Number(a));return Number.isFinite(e)?Math.min(Vn,Math.max(Hn,e)):Nt},Tt=a=>Ns.includes(a)?a:"links";function Si(a,e){let t=Array.isArray(a)?a:[],n=Array.from({length:e},(i,r)=>typeof t[r]=="string"?t[r].trim():"");return n.some(Boolean)?n:[]}var Ts=["card","items","none","open"],Lt=a=>typeof a?.name=="string"?a.name.trim():"",Xe=a=>typeof a=="string"?{entity:a}:{...a},Ye=a=>Math.min(Math.max(1,Number(a)||2),3),Pe=a=>Ms.includes(a)?a:"row",re=a=>!!(a?.entity||a?.name||a?.icon||a?.tap_action);function Ai(a){if(Array.isArray(a?.rows)&&a.rows.length)return a.rows.map(n=>{let i=Ye(n.columns);return{columns:i,layout:Pe(n.layout),align:Tt(n.align),image_size:ye(n.image_size),column_names:Si(n.column_names,i),items:(n.items??n.entities??[]).map(Xe)}});let e=(a?.items??a?.entities??[]).map(Xe);if(!e.length)return[];let t=Ye(a.columns);return[{columns:t,layout:Pe(a.layout),align:Tt(a.align),image_size:ye(a.image_size),column_names:Si(a.column_names,t),items:e}]}function Ot(a){return Ts.includes(a?.surface)?a.surface:a?.bare?"none":"card"}var Cs=a=>Math.max(1,Math.ceil((a.items?.length||1)/a.columns)),Ls=15;function Os(a){let e=Pe(a?.layout);return e!=="beeld"?Ct[e]:ye(a?.image_size)+34}function Pn(a){let e=a?.rows??[],t=Lt(a)?Rn+we:0;if(!e.length)return Ei+t+Ct.row;let n=(Ot(a)==="card"?Ei:0)+t;for(let i of e){let r=Cs(i);n+=r*Os(i)+(r-1)*we,i.column_names?.length&&(n+=Ls+we)}return n+(e.length-1)*we}var Ni=[{waarde:"row",label:"Rij"},{waarde:"tile",label:"Tegel"},{waarde:"compact",label:"Compact"},{waarde:"beeld",label:"Beeld"}],Ds=[{waarde:"links",label:"Links"},{waarde:"midden",label:"Midden"}],Rs=a=>Ni.find(e=>e.waarde===a)?.label??"Rij";function Dt(a){for(a.bewaard??=[];a.items.length<a.columns;)a.items.push(a.bewaard.pop()??{entity:""});for(;a.items.length>a.columns;){let e=a.items.pop();re(e)&&a.bewaard.push(e)}return a}function Hs(a){let e=Array.isArray(a.rows)&&a.rows.length?a.rows.map(n=>({columns:Ye(n.columns),layout:Pe(n.layout),align:Tt(n.align),image_size:ye(n.image_size),column_names:Array.isArray(n.column_names)?[...n.column_names]:[],items:(n.items??n.entities??[]).map(Xe)})):(()=>{let n=(a.items??a.entities??[]).map(Xe);return n.length?[{columns:Ye(a.columns),layout:Pe(a.layout),items:n}]:[]})(),t=[];for(let n of e){let i=[];for(let r=0;r<n.items.length;r+=n.columns)i.push(n.items.slice(r,r+n.columns));i.length||i.push([]);for(let r of i)t.push(Dt({columns:n.columns,layout:n.layout,items:r}))}return t}var Mi=a=>a.map(e=>{let t=(e.column_names??[]).slice(0,e.columns).map(n=>String(n??"").trim());return{columns:e.columns,...e.layout&&e.layout!=="row"?{layout:e.layout}:{},...e.align==="midden"?{align:"midden"}:{},...e.layout==="beeld"&&e.image_size!==Nt?{image_size:ye(e.image_size)}:{},...t.some(Boolean)?{column_names:t}:{},items:e.items.filter(re).map(n=>structuredClone(n))}}).filter(e=>e.items.length),Vs=`
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
`,In=class extends HTMLElement{constructor(){super(),this.rows_=[],this.rest_={},this.open_=new Set,this.koppen_=[]}setConfig(e){if(this.rest_={...e},delete this.rest_.rows,delete this.rest_.items,delete this.rest_.entities,delete this.rest_.columns,delete this.rest_.layout,this.gebouwd_&&e===this.uitObject_)return;let t=Hs(e);this.gebouwd_&&JSON.stringify(Mi(t))===this.uit_||(this.rows_=t,this.eersteKeer_||(this.eersteKeer_=!0,this.rows_.length===1&&this.open_.add("r0")),this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker, dac-tone-picker"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}connectedCallback(){this.gebouwd_||this.build_()}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}rijWeg_(e){let t=new Set;for(let n of this.open_){let i=/^r(\d+)(?:i(\d+))?$/.exec(n);if(!i)continue;let r=Number(i[1]);r!==e&&t.add(r>e?`r${r-1}${i[2]===void 0?"":`i${i[2]}`}`:n)}this.open_=t}itemWeg_(e,t){let n=new Set;for(let i of this.open_){let r=/^r(\d+)i(\d+)$/.exec(i);if(!r||Number(r[1])!==e){n.add(i);continue}let o=Number(r[2]);o!==t&&n.add(o>t?`r${e}i${o-1}`:i)}this.open_=n}legePlekkenOpen_(e,t){e.items.forEach((n,i)=>{re(n)||this.open_.add(`r${t}i${i}`)})}async build_(){if(!this.hass_||!this.rows_)return;await customElements.whenDefined("ha-form"),this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=Vs;let t=document.createElement("div");if(t.className="dac-ed",this.append(e,t),t.appendChild(this.kaartBlok_()),this.rows_.forEach((i,r)=>t.appendChild(this.rijBlok_(i,r))),!this.rows_.length){let i=document.createElement("p");i.className="uitleg",i.textContent="Een rij is een regel op de kaart, met een, twee of drie entiteiten naast elkaar. Elke rij heeft zijn eigen indeling en zijn eigen vorm. Een rij van een kolom is een losse knop.",t.appendChild(i)}let n=document.createElement("button");n.type="button",n.className="rijtoevoegen",n.textContent="\uFF0B  Rij toevoegen",n.addEventListener("click",()=>{let i=Dt({columns:2,layout:"row",items:[]});this.rows_.push(i);let r=this.rows_.length-1;this.open_.add(`r${r}`),this.legePlekkenOpen_(i,r),this.emit_(),this.build_()}),t.appendChild(n)}binnenKop_(e,t){return e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),t(n)}),e}segment_(e,t,n,{inKop:i=!1}={}){let r=document.createElement("span");r.className="segment";let o=e.map(d=>{let l=document.createElement("button");l.type="button",l.textContent=d.label,d.titel&&(l.title=d.titel);let c=()=>{t()!==d.waarde&&n(d.waarde)};return i?this.binnenKop_(l,c):l.addEventListener("click",c),r.appendChild(l),[l,d.waarde]}),s=()=>o.forEach(([d,l])=>d.setAttribute("aria-pressed",String(t()===l)));return s(),{wrap:r,vernieuw:s}}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"name",selector:{text:{}}},{name:"surface",selector:{select:{mode:"dropdown",options:[{value:"card",label:"Om de hele kaart"},{value:"open",label:"Alleen een rand, geen vulling"},{value:"none",label:"Geen vlak"}]}}},{name:"state_position",selector:{select:{mode:"dropdown",options:[{value:"below",label:"Onder de naam"},{value:"right",label:"Rechts op de regel"}]}}}],e.computeLabel=t=>({name:"Naam van de kaart (optioneel)",surface:"Waar het kaartvlak zit",state_position:"Waar de status staat"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="name")return"Een kop boven de entiteiten. Laat leeg voor geen kop -- de kaart is dan een rasterrij lager.";if(t.name==="surface")return"Alleen een rand geeft een doorzichtige kaart die nog wel een vorm heeft; geen vlak laat de plekken los op het dashboard staan.";if(t.name==="state_position")return"Rechts is de vorm van de entiteitenkaart van Home Assistant: de waarden komen onder elkaar uit. Regels met een schakelaar of een tijdveld tonen geen tekst, en op een tegel staat de status altijd onder de naam."},e.data={name:this.rest_.name??"",surface:this.rest_.surface??(this.rest_.bare?"none":"card"),state_position:this.rest_.state_position??"below"},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{};typeof n.name=="string"&&n.name.trim()?this.rest_.name=n.name:delete this.rest_.name,n.surface==="items"||n.surface==="none"||n.surface==="open"?this.rest_.surface=n.surface:delete this.rest_.surface,delete this.rest_.bare,n.state_position==="right"?this.rest_.state_position="right":delete this.rest_.state_position,this.emit_()}),e}rijBlok_(e,t){let n=document.createElement("details");n.className="rij",this.onthoud_(n,`r${t}`);let i=document.createElement("summary"),r=document.createElement("span");r.className="pijl",r.textContent="\u203A";let o=document.createElement("span");o.className="titel";let s=document.createElement("b");s.textContent=`Rij ${t+1}`;let d=document.createElement("small");o.append(s,d);let l=this.segment_([1,2,3].map(S=>({waarde:S,label:String(S),titel:`${S} entiteit${S>1?"en":""} in deze rij`})),()=>e.columns,S=>{e.columns=S,Dt(e),this.open_.add(`r${t}`),this.legePlekkenOpen_(e,t),this.emit_(),this.build_()},{inKop:!0}),c=document.createElement("button");c.type="button",c.className="weg",c.title="Rij verwijderen",c.textContent="\u2715",this.binnenKop_(c,()=>{this.rows_.splice(t,1),this.rijWeg_(t),this.emit_(),this.build_()}),i.append(r,o,l.wrap,c);let p=document.createElement("div");p.className="rijbody";let u=this.segment_(Ni.map(S=>({waarde:S.waarde,label:S.label})),()=>e.layout,S=>{e.layout=S,this.emit_()}),g=document.createElement("div");g.className="vormrij";let h=document.createElement("b");h.textContent="Vorm van deze rij",g.append(h,u.wrap),p.appendChild(g);let f=this.segment_(Ds.map(S=>({waarde:S.waarde,label:S.label})),()=>e.align??"links",S=>{e.align=S,this.emit_()}),b=document.createElement("div");b.className="vormrij";let w=document.createElement("b");w.textContent="Uitlijning",b.append(w,f.wrap),p.appendChild(b);let $=document.createElement("div");$.className="beeldvak";let j=document.createElement("ha-form");j.hass=this.hass_,j.schema=[{name:"image_size",selector:{number:{min:Hn,max:Vn,step:4,mode:"slider"}}}],j.computeLabel=()=>"Grootte van de afbeelding",j.computeHelper=()=>"In pixels. Groot genoeg om een QR-code te scannen begint rond de 160.",j.data={image_size:ye(e.image_size)},j.addEventListener("value-changed",S=>{S.stopPropagation(),e.image_size=ye(S.detail.value?.image_size),this.emit_()}),$.appendChild(j),p.appendChild($);let X=()=>{$.style.display=e.layout==="beeld"?"":"none"};X();let G=document.createElement("div");G.className="kolomvak";let ne=document.createElement("ha-form");ne.hass=this.hass_;let Xa=()=>Array.from({length:e.columns},(S,ee)=>({name:`k${ee}`,selector:{text:{}}}));ne.schema=Xa(),ne.computeLabel=S=>`Kop boven kolom ${Number(S.name.slice(1))+1}`,ne.computeHelper=S=>S.name==="k0"?"Laat leeg voor geen koppen. Handig als er twee dingen naast elkaar staan die allebei een naam verdienen.":void 0;let Ya=()=>Object.fromEntries(Array.from({length:e.columns},(S,ee)=>[`k${ee}`,e.column_names?.[ee]??""]));ne.data=Ya(),ne.addEventListener("value-changed",S=>{S.stopPropagation();let ee=S.detail.value??{};e.column_names=Array.from({length:e.columns},(Qa,Uo)=>ee[`k${Uo}`]??""),this.emit_()}),G.appendChild(ne),p.appendChild(G);let Ja=()=>{let S=e.items.filter(re),ee=[`${e.columns} kolom${e.columns>1?"men":""}`];e.layout!=="row"&&ee.push(Rs(e.layout)),ee.push(S.length?S.map(Qa=>this.itemNaam_(Qa)).join(", "):"nog leeg"),e.column_names?.some?.(Boolean)&&ee.push("met kolomkoppen"),d.textContent=ee.join(" \xB7 "),l.vernieuw(),u.vernieuw(),f.vernieuw(),X(),ne.schema.length!==e.columns&&(ne.schema=Xa()),ne.data=Ya()};return this.koppen_.push(Ja),e.items.forEach((S,ee)=>p.appendChild(this.itemBlok_(e,S,t,ee))),n.append(i,p),Ja(),n}itemNaam_(e){return e.name||this.hass_?.states?.[e.entity]?.attributes?.friendly_name||e.entity||"Knop"}itemBlok_(e,t,n,i){let r=document.createElement("details");r.className="item",this.onthoud_(r,`r${n}i${i}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="pijl",s.textContent="\u203A";let d=document.createElement("span");d.className="nr",d.textContent=String(i+1),d.title=`Plek ${i+1} in de rij`;let l=document.createElement("span");l.className="titel";let c=document.createElement("b"),p=document.createElement("small");l.append(c,p);let u=document.createElement("button");u.type="button",u.className="weg",u.title="Deze plek leegmaken",u.textContent="\u2715",this.binnenKop_(u,()=>{e.items.splice(i,1),this.itemWeg_(n,i),Dt(e),this.emit_(),this.build_()}),o.append(s,d,l,u);let g=document.createElement("div");g.className="itembody";let h=document.createElement("ha-form");h.hass=this.hass_,h.schema=[{name:"entity",selector:{entity:{}}}],h.computeLabel=()=>"Entiteit",h.computeHelper=()=>"Mag leeg blijven: zonder entiteit wordt dit een navigatieknop. Geef hem dan een naam, een icoon en een tikactie.",h.addEventListener("value-changed",j=>{j.stopPropagation(),t.entity=j.detail.value.entity??"",this.emit_()});let f=document.createElement("dac-icon-picker");f.label="Icoon",f.hass=this.hass_,f.addEventListener("value-changed",j=>{j.stopPropagation(),j.detail.value?t.icon=j.detail.value:delete t.icon,this.emit_()});let b=document.createElement("dac-tone-picker");b.label="Kleur",b.hass=this.hass_,b.addEventListener("value-changed",j=>{j.stopPropagation(),j.detail.value?t.tone=j.detail.value:delete t.tone,this.emit_()});let w=document.createElement("ha-form");w.hass=this.hass_,w.schema=[{name:"name",selector:{text:{}}},{name:"toggle",selector:{boolean:{}}},{name:"show_icon",selector:{boolean:{}}},{name:"show_name",selector:{boolean:{}}},{name:"show_state",selector:{boolean:{}}},{name:"icon_tap_action",selector:{ui_action:{default_action:"toggle"}}},{name:"icon_hold_action",selector:{ui_action:{default_action:"more-info"}}},{name:"tap_action",selector:{ui_action:{default_action:"more-info"}}},{name:"hold_action",selector:{ui_action:{default_action:"more-info"}}},{name:"double_tap_action",selector:{ui_action:{default_action:"none"}}}],w.computeLabel=j=>({name:"Naam (overschrijft die van de entiteit)",toggle:"Schakelaar tonen",show_icon:"Icoon tonen",show_name:"Naam tonen",show_state:"Status tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de regel",hold_action:"Vasthouden op de regel",double_tap_action:"Dubbeltikken op de regel"})[j.name]??j.name,w.computeHelper=j=>{if(j.name==="icon_tap_action")return"Het icoon en de regel zijn twee knoppen: het icoon schakelt, de regel opent of navigeert.";if(j.name==="toggle")return"Een schuifschakelaar in plaats van de statustekst. Alleen voor wat twee standen heeft: een lamp, een stopcontact, een schakelaar.";if(j.name==="show_state")return"Een tijd of datum -- een input_datetime, of een klok van een apparaat -- verschijnt hier als een veld dat je meteen kunt zetten. Uit haalt met de tekst ook dat veld weg.";if(j.name==="double_tap_action")return"Laat dit op geen actie staan als je het niet gebruikt: een regel die op dubbeltikken wacht, reageert trager op een gewone tik."},w.addEventListener("value-changed",j=>{j.stopPropagation();let X=j.detail.value;X.name?t.name=X.name:delete t.name,X.toggle===!0?t.toggle=!0:delete t.toggle;for(let G of["show_icon","show_name","show_state"])X[G]===!1?t[G]=!1:delete t[G];for(let G of["icon_tap_action","icon_hold_action","tap_action","hold_action"])X[G]?t[G]=X[G]:delete t[G];X.double_tap_action&&X.double_tap_action.action!=="none"?t.double_tap_action=X.double_tap_action:delete t.double_tap_action,this.emit_()});let $=()=>{c.textContent=re(t)?this.itemNaam_(t):"Kies een entiteit",p.textContent=t.entity||(re(t)?"Zonder entiteit: een navigatieknop":""),r.dataset.leeg=String(!re(t)),u.hidden=!re(t)};return this.koppen_.push($),h.data={entity:t.entity||void 0},f.value=t.icon??"",b.value=t.tone??"",w.data={name:t.name??"",toggle:t.toggle??!1,show_icon:t.show_icon??!0,show_name:t.show_name??!0,show_state:t.show_state??!0,icon_tap_action:t.icon_tap_action,icon_hold_action:t.icon_hold_action,tap_action:t.tap_action,hold_action:t.hold_action,double_tap_action:t.double_tap_action},g.append(h,f,b,w),r.append(o,g),$(),r}emit_(){let e=Mi(this.rows_),t={...this.rest_,rows:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_)n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};C("domotiapp-entities-card-editor",In);var Rt=class extends A{validate(e){let t=Ai(e);return t.some(n=>n.items.some(re))?{show_state:!0,state_position:"below",...e,rows:t}:{...e,[T]:"Voeg een rij toe en kies daar entiteiten in."}}watched(){return this.config.rows.flatMap(e=>e.items.map(t=>t.entity))}item_(e,t){return this.config.rows[+e]?.items[+t]}tone_(e){return e.tone?I(e.tone):this.config.tone?I(this.config.tone):he(e.entity)!=="light"?M.accent:ni(k(this.hass,e.entity))??M.lit}metSchakelaar_(e){return!!e.toggle&&ai(e.entity)}metTijd_(e){return!_i(e.entity)||this.metSchakelaar_(e)?!1:(e.show_state??this.config.show_state)!==!1}metKeuze_(e){return!Dn(e.entity)||this.metSchakelaar_(e)?!1:(e.show_state??this.config.show_state)!==!1}template(){let e=this.config;this.setAttribute("vlak",Ot(e)),this.style.containerType="inline-size";let t=Ot(e)==="items",n=e.rows.map((o,s)=>{let d=e.state_position==="right"&&o.layout!=="tile",l=`<span class="st${d?" rechts":""}"></span>`,c=o.items.map((u,g)=>`
          <div class="it${t?" surface":""}" role="button" tabindex="0"
               data-r="${s}" data-i="${g}">
            ${o.layout==="tile"?'<span class="wash"></span>':""}
            ${u.show_icon===!1?"":'<span class="chip" role="button" tabindex="0"></span>'}
            <span class="txt">${u.show_name===!1?"":'<span class="nm"></span>'}${d?"":l}</span>
            ${d?l:""}
            ${this.metSchakelaar_(u)?bi({label:"Aan of uit"}):""}
            ${this.metTijd_(u)?'<span class="tijdslot" style="display:contents"></span>':""}
            ${this.metKeuze_(u)?'<span class="keuzeslot" style="display:contents"></span>':""}
          </div>`).join("");return`${o.column_names.length?`<div class="kolomkoppen" style="--cols:${o.columns}">${o.column_names.map(u=>`<span>${K(u)}</span>`).join("")}</div>`:""}
      <div class="row" data-vorm="${o.layout}" data-uit="${o.align}"
           style="--cols:${o.columns};--it-h:${o.layout==="beeld"?o.image_size+34:Ct[o.layout]}px;--beeld:${o.image_size}px">${c}</div>`}).join("");return`<div class="card surface">${Lt(e)?'<h3 class="kaartnaam"></h3>':""}${n}</div>`}wire(){this.$$(".it").forEach(e=>{let t=this.item_(e.dataset.r,e.dataset.i);if(!t)return;let n=(s,d)=>ue(this,this.hass,t,t[s]??d),i={action:t.entity?"more-info":"none"};this.teardown_.push(V(e,{onTap:()=>n("tap_action",i),onHold:()=>n("hold_action",i),onDouble:t.double_tap_action?()=>n("double_tap_action",{action:"none"}):void 0}));let r=e.querySelector(".chip");if(r&&(this.teardown_.push(V(r,{onTap:()=>n("icon_tap_action",qe(t.entity)),onHold:()=>n("icon_hold_action",i)})),this.on(r,"click",s=>s.stopPropagation()),this.on(r,"pointerdown",s=>s.stopPropagation())),e.querySelector(".tijdslot")){let s=p=>{let u=p.target?.closest?.(".tijd");if(u&&(p.stopPropagation(),p.type==="click"))try{u.showPicker?.()}catch{}};this.on(e,"pointerdown",s,!0),this.on(e,"click",s,!0);let d=null,l=null,c=()=>{clearTimeout(l),l=null;let p=d;d=null,p&&this.hass.callService(p[0],p[1],p[2])};this.teardown_.push(()=>clearTimeout(l)),this.on(e,"change",p=>{let u=p.target?.closest?.(".tijd");u&&(p.stopPropagation(),d=yi(t.entity,u.type,u.value),clearTimeout(l),l=setTimeout(c,600))}),this.on(e,"focusout",p=>{p.target?.closest?.(".tijd")&&c()})}if(e.querySelector(".keuzeslot")){let s=d=>{d.target?.closest?.(".keuze")&&d.stopPropagation()};this.on(e,"pointerdown",s,!0),this.on(e,"click",s,!0),this.on(e,"keydown",s,!0),this.on(e,"change",d=>{let l=d.target?.closest?.(".keuze");if(!l)return;d.stopPropagation();let c=k(this.hass,t.entity),p=At(t.entity,l.value,Ae(c));p&&this.hass.callService(p[0],p[1],p[2])})}let o=e.querySelector(".toggle");o&&this.teardown_.push(vi(o,{value:()=>ve(k(this.hass,t.entity)),set:s=>this.hass.callService("homeassistant",s?"turn_on":"turn_off",{entity_id:t.entity}),disabled:()=>J(k(this.hass,t.entity))}))})}paint(){let e=this.$(".kaartnaam");e&&this.text(e,Lt(this.config)),this.$$(".it").forEach(t=>{let n=this.item_(t.dataset.r,t.dataset.i);if(!n)return;let i=k(this.hass,n.entity),r=ve(i),o=!!n.entity&&J(i);t.dataset.on=String(r),t.classList.toggle("unavailable",o);let s=this.tone_(n);t.style.setProperty("--tone",s);let d=R(this.hass,n.entity,n.name),l=t.querySelector(".chip");if(l){let $=vt(this.hass,n.entity,n.icon),j=n.icon||($?`pic:${$}`:vn(n.entity,q(this.hass,n.entity)));l.dataset.icon!==j&&(l.dataset.icon=j,l.classList.toggle("pic",!!$),l.innerHTML=$?`<img src="${$}" alt="" loading="lazy" />`:v(n.icon||vn(n.entity,q(this.hass,n.entity)))),l.style.setProperty("--tone",$?"var(--dac-ink-3)":r?s:"var(--dac-ink-3)"),l.setAttribute("aria-label",n.entity?`${d} schakelen`:"Icoon")}let c=t.querySelector(".nm");c&&this.text(c,d);let p=t.querySelector(".toggle");p&&(Ln(p,r),p.style.setProperty("--tone",s),p.setAttribute("aria-label",`${d} aan of uit`));let u=t.querySelector(".tijdslot"),g=null;if(u){let $=o?null:On(i);u.dataset.soort!==($??"")&&(u.dataset.soort=$??"",u.innerHTML=$?`<input class="tijd" type="${$}" step="60" />`:""),g=u.querySelector(".tijd")}if(g&&(g.setAttribute("aria-label",`${d} instellen`),this.shadowRoot.activeElement!==g)){let $=wi(i,u.dataset.soort);g.value!==$&&(g.value=$)}let h=t.querySelector(".keuzeslot"),f=null;if(h){let $=o?[]:Ae(i),j=$.map(G=>Mt(G,this.hass?.formatEntityState?.(i,G))),X=JSON.stringify([$,j]);h.dataset.opties!==X&&(h.dataset.opties=X,h.innerHTML=$.length?`<select class="keuze">${$.map((G,ne)=>`<option value="${K(G)}">${K(j[ne])}</option>`).join("")}</select>`:""),f=h.querySelector(".keuze")}if(f&&(f.setAttribute("aria-label",`${d} kiezen`),this.shadowRoot.activeElement!==f)){let $=St(i);f.value!==$&&(f.value=$)}let b=t.querySelector(".st"),w=n.show_state??this.config.show_state;if(p||g||f)b.textContent="";else if(w===!1)b.textContent="";else if(o)b.textContent="Niet bereikbaar";else if(!i||gn(i.entity_id))b.textContent="";else if(he(i.entity_id)==="light"&&r&&i.attributes.brightness!=null)b.textContent=`${Math.round(i.attributes.brightness/255*100)}%`;else{let $=i.attributes.unit_of_measurement;b.textContent=$?`${i.state} ${$}`:te(this.hass,i)}t.setAttribute("aria-label",`${d}${i?`, ${te(this.hass,i)}`:""}`)})}getCardSize(){return me(Pn(this.config))}getGridOptions(){let e=me(Pn(this.config));return{columns:12,rows:e,min_columns:4,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-entities-card-editor")}static getStubConfig(){return{rows:[]}}};z(Rt,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 5px 10px;
      display: flex; flex-direction: column; justify-content: center; gap: ${we}px;
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
      font-size: 13px; font-weight: 600; letter-spacing: -.01em; line-height: ${Rn}px;
      color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .row {
      display: grid; gap: ${we}px;
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
      display: grid; gap: ${we}px;
      grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
      padding: 0 2px;
    }
    .kolomkoppen span {
      font-size: 11px; font-weight: 600; letter-spacing: .06em;
      text-transform: uppercase; color: var(--dac-ink-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

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

    ${ki}
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
  `);N("domotiapp-entities-card",Rt,{name:"DomotiApp Entiteiten",description:"Entiteiten in rijen, elk met een eigen kolomindeling en vorm: regel, tegel of compacte pil. Ook voor een losse knop."});var U={PAUSE:1,SEEK:2,VOLUME_SET:4,VOLUME_MUTE:8,PREVIOUS_TRACK:16,NEXT_TRACK:32,TURN_ON:128,TURN_OFF:256,PLAY_MEDIA:512,VOLUME_STEP:1024,SELECT_SOURCE:2048,STOP:4096,PLAY:16384,SHUFFLE_SET:32768,REPEAT_SET:262144,GROUPING:524288},W=(a,e)=>!!(Number(a?.attributes?.supported_features??0)&e),Kn=a=>!a||a.state==="off",Bn=a=>!!a&&!["off","unavailable","unknown"].includes(a.state),Un=a=>a?.state==="playing",Ti=a=>!!a&&!["off","unavailable","unknown","idle","standby"].includes(a.state);function Ci(a){if(!a)return[];let e=[];return(W(a,U.TURN_ON)||W(a,U.TURN_OFF))&&e.push("power"),Kn(a)||(W(a,U.PREVIOUS_TRACK)&&e.push("prev"),W(a,U.PLAY)||W(a,U.PAUSE)||W(a,U.PLAY_MEDIA)?e.push("play"):W(a,U.STOP)&&e.push("stop"),W(a,U.NEXT_TRACK)&&e.push("next")),e}var Me=a=>a?.volume_entity||a?.entity;function Wn(a){if(!Bn(a))return[];let e=[];return W(a,U.VOLUME_MUTE)&&e.push("mute"),W(a,U.VOLUME_SET)?e.push("slider"):W(a,U.VOLUME_STEP)&&e.push("steps"),e}var $e=a=>Math.round(Math.min(1,Math.max(0,Number(a?.attributes?.volume_level??0)))*100),Je=a=>!!a?.attributes?.is_volume_muted,Li=a=>!!a?.attributes?.mass_player_type,Gn=a=>!!a?.attributes?.shuffle,qn=a=>{let e=a?.attributes?.repeat;return["off","all","one"].includes(e)?e:"off"},Oi=a=>({off:"all",all:"one",one:"off"})[Ps(a)]??"all",Ps=a=>["off","all","one"].includes(a)?a:"off";function Fn(a,{zoeken:e=!0}={}){if(!Bn(a))return[];let t=[];return W(a,U.SHUFFLE_SET)&&t.push("shuffle"),W(a,U.REPEAT_SET)&&t.push("repeat"),e&&Li(a)&&t.push("search"),t}function Di(a,{tonen:e=!0}={}){if(!e||!Bn(a)||!W(a,U.SELECT_SOURCE)||Li(a))return null;let t=a?.attributes?.source_list;return!Array.isArray(t)||t.length<2?null:{nu:a.attributes.source??null,aantal:t.length}}function Ri(a,e=t=>t?.state??""){if(!a)return"";if(a.state==="unavailable")return"Niet bereikbaar";if(a.state==="off")return"Uit";if(a.state==="standby")return"Stand-by";let t=a.attributes??{},n=t.media_title||t.media_channel||"",i=t.media_artist||t.media_series_title||t.media_album_name||t.app_name||t.source||"";return a.state==="idle"||!n?i||e(a):i&&i!==n?`${n} \xB7 ${i}`:n}function Zn(a){let e=a?.attributes?.device_class;return e==="tv"?"tv":e==="receiver"?"radio":"speaker"}var Xn="dacScrollSlot",Hi=["position","top","left","right","width","overflow"];function Vi(a=globalThis.document,e=globalThis.window){let t=a?.body;if(!t?.style||t.dataset?.[Xn])return()=>{};let n=e?.scrollY??a.documentElement?.scrollTop??0,i=Object.fromEntries(Hi.map(o=>[o,t.style[o]]));t.dataset&&(t.dataset[Xn]="1"),t.style.position="fixed",t.style.top=`-${n}px`,t.style.left="0",t.style.right="0",t.style.width="100%",t.style.overflow="hidden";let r=!1;return()=>{if(!r){r=!0;for(let o of Hi)t.style[o]=i[o];t.dataset&&delete t.dataset[Xn],e?.scrollTo?.(0,n)}}}var Pi=[["playlists","Afspeellijsten"],["radio","Radio"],["tracks","Nummers"],["albums","Albums"],["artists","Artiesten"]];var ze=a=>`domotiapp_lovelace/media/${a}`;function Is(a,e){if(!a)return null;if(e)return a.uri?{type:ze("favorite"),favorite:!0,uri:a.uri}:null;let t=Ii(a);return!t||!a.library_item_id?null:{type:ze("favorite"),favorite:!1,kind:t,library_item_id:String(a.library_item_id)}}function Ii(a){let e=a?.media_type;return{track:"tracks",album:"albums",artist:"artists",playlist:"playlists",radio:"radio",podcast:"podcasts",audiobook:"audiobooks"}[e]??null}var Ki={tracks:"track",albums:"album",artists:"artist",playlists:"playlist",radio:"radio",podcasts:"podcast",audiobooks:"audiobook"},Yn=[["","Alles"],["track","Nummers"],["album","Albums"],["artist","Artiesten"],["playlist","Afspeellijsten"],["radio","Radio"]];function Bi(a,e,t=null){return a?.kind??Ii(e)??t??"playlists"}var Jn=a=>!!a?.uri,Ht=(a,e,{favoriet:t=!1,zoek:n="",limiet:i=50}={})=>a.callWS({type:ze("library"),kind:e,favorite:t,...n?{search:n}:{},limit:i}).then(r=>r?.items??[]),Ui=(a,e,t)=>{let n=Is(e,t);return n?a.callWS(n):Promise.reject(new Error("Dit item kan niet favoriet gemaakt worden."))},Wi=(a,e)=>a.callWS({type:ze("playlist/create"),name:e}).then(t=>t?.playlist??null),Gi=(a,e)=>a.callWS({type:ze("playlist/remove"),library_item_id:String(e.library_item_id)}),qi=(a,e)=>a.callWS({type:ze("playlist/tracks"),library_item_id:String(e.library_item_id),provider:e.provider??"library"}).then(t=>t?.tracks??[]),Fi=(a,e,t)=>a.callWS({type:ze("playlist/add_tracks"),library_item_id:String(e.library_item_id),uris:t}),Zi=(a,e,t)=>a.callWS({type:ze("playlist/remove_tracks"),library_item_id:String(e.library_item_id),positions:t});var Ks=350,Bs={track:"Nummer",album:"Album",artist:"Artiest",playlist:"Afspeellijst",radio:"Radio",podcast:"Podcast",audiobook:"Luisterboek"};function Us(a){let e=Array.isArray(a.artists)?a.artists.map(i=>typeof i=="string"?i:i?.name).filter(Boolean).join(", "):"",t=typeof a.album=="string"?a.album:a.album?.name,n=Bs[a.media_type]??"";return[e,t].filter(Boolean).join(" \xB7 ")||n}var Ws=`
  :host {
    ${ae}
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

  ${_e}
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
`,Qn=class extends HTMLElement{static get sheet_(){return Object.hasOwn(this,"s_")||(this.s_=se(be+Ws)),this.s_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[new.target.sheet_],this.soort_="",this.treffers_=[],this.speakers_=null,this.opruimen_=[]}open(e,t,n,{radioModus:i=!1,speakers:r=null}={}){this.hass=e,this.entity_=t,this.naam_=n,this.radioModus_=i,this.speakerKeuze_=Array.isArray(r)&&r.length?r:null,this.gebouwd_||this.bouw_(),this.setAttribute("open",""),this.escape_??=o=>{o.key==="Escape"&&this.hasAttribute("open")&&this.sluit()},document.addEventListener("keydown",this.escape_,!0),this.scrollLos_??=Vi(),this.$(".wie b").textContent=n,this.$(".wie span").textContent="Music Assistant",this.sprekerSig_=null,this.$("footer")?.removeAttribute("open"),this.$(".voetkop")?.setAttribute("aria-expanded","false"),this.lijst_=null,this.soort_="",this.naarTab_("zoeken"),this.haalSpeakers_(),setTimeout(()=>this.$(".zoek input")?.focus(),60)}sluit(){this.removeAttribute("open"),this.menuDicht_(),this.escape_&&document.removeEventListener("keydown",this.escape_,!0),this.scrollLos_?.(),this.scrollLos_=null}set hass(e){this.hass_=e,this.gebouwd_&&this.hasAttribute("open")&&this.tekenSpeakers_()}get hass(){return this.hass_}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.gebouwd_=!0,this.shadowRoot.innerHTML=`
      <div class="laag">
        <header>
          <span class="wie"><b></b><span></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${v("close")}</button>
        </header>
        <nav class="tabs" role="tablist">
          <button type="button" role="tab" data-tab="zoeken" aria-selected="true">Zoeken</button>
          <button type="button" role="tab" data-tab="favorieten" aria-selected="false">Favorieten</button>
          <button type="button" role="tab" data-tab="lijsten" aria-selected="false">Afspeellijsten</button>
        </nav>
        <div class="lijstkop" hidden>
          <button class="rond terug" type="button" aria-label="Terug">${v("chevronRight")}</button>
          <b></b>
          <button class="rond weglijst" type="button" aria-label="Deze afspeellijst verwijderen">${v("bin")}</button>
        </div>
        <button class="nieuwe" type="button" hidden>+  Nieuwe afspeellijst</button>
        <div class="nieuwrij" hidden>
          <input type="text" placeholder="Naam van de afspeellijst" aria-label="Naam van de nieuwe afspeellijst" />
          <button class="zoekknop" type="button" data-maak>Maken</button>
        </div>
        <div class="zoek">
          <label class="veld">
            ${v("search")}
            <input type="search" placeholder="Zoeken naar een nummer, album, artiest of afspeellijst"
                   autocomplete="off" spellcheck="false" enterkeyhint="search"
                   aria-label="Zoeken in Music Assistant" />
          </label>
          <button class="zoekknop" type="button">Zoeken</button>
        </div>
        <nav class="soorten">
          ${Yn.map(([t,n])=>`<button type="button" data-soort="${t}" aria-pressed="${t===""}">${n}</button>`).join("")}
        </nav>
        <div class="lijst"></div>
        <footer hidden>
          <button class="voetkop" type="button" aria-expanded="false">
            <span class="kop">Speelt af op</span>
            <span class="waar"></span>
            <span class="pijl">${v("chevronDown")}</span>
          </button>
          <div class="sprekers"></div>
        </footer>
        <div class="menu" hidden></div>
      </div>`,this.aan_(this.$(".sluit"),"click",()=>this.sluit()),this.aan_(this.$(".laag"),"pointerdown",t=>{t.target===this.$(".laag")?this.sluit():t.target.closest(".menu")||this.menuDicht_()});let e=this.$(".zoek input");this.aan_(this.$(".zoekknop"),"click",()=>{clearTimeout(this.timer_),this.zoek_(),e.focus()}),this.aan_(e,"input",()=>this.tikPauze_()),this.aan_(e,"keydown",t=>{t.key==="Enter"&&(clearTimeout(this.timer_),this.zoek_()),t.key==="Escape"&&this.sluit()}),this.lijstLuisteraars_(),this.aan_(this.$(".voetkop"),"click",()=>{let n=this.$("footer").toggleAttribute("open");this.$(".voetkop").setAttribute("aria-expanded",String(n)),this.voetOpen_=n}),this.aan_(this.$(".tabs"),"click",t=>{let n=t.target.closest("[data-tab]");n&&this.naarTab_(n.dataset.tab)}),this.aan_(this.$(".terug"),"click",()=>{this.lijst_=null,this.naarTab_("lijsten")}),this.aan_(this.$(".weglijst"),"click",()=>this.lijstWeg_()),this.aan_(this.$(".nieuwe"),"click",()=>{this.$(".nieuwrij").hidden=!1,this.$(".nieuwe").hidden=!0,this.$(".nieuwrij input").value="",this.$(".nieuwrij input").focus()}),this.aan_(this.$("[data-maak]"),"click",()=>this.lijstMaken_()),this.aan_(this.$(".nieuwrij input"),"keydown",t=>{t.key==="Enter"&&this.lijstMaken_(),t.key==="Escape"&&(this.$(".nieuwrij").hidden=!0,this.$(".nieuwe").hidden=!1)}),this.aan_(this.$(".soorten"),"click",t=>{let n=t.target.closest("[data-soort]");if(n){this.modus_==="favorieten"?this.bibSoort_=n.dataset.soort:this.soort_=n.dataset.soort;for(let i of this.shadowRoot.querySelectorAll("[data-soort]"))i.setAttribute("aria-pressed",String(i===n));clearTimeout(this.timer_),this.modus_==="favorieten"?this.haalFavorieten_():this.zoek_()}}),this.aan_(this.$(".sprekers"),"click",t=>{let n=t.target.closest("button[data-speaker]");n&&!n.disabled&&this.wisselSpeaker_(n.dataset.speaker)}),this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen: nummers, albums, artiesten, afspeellijsten en radio.")}aan_(e,t,n,i){e.addEventListener(t,n,i),this.opruimen_.push(()=>e.removeEventListener(t,n,i))}tikPauze_(){clearTimeout(this.timer_),this.timer_=setTimeout(()=>this.zoek_(),Ks)}async zoek_(){let e=this.$(".zoek input").value.trim();if(!e){this.treffers_=this.zoekTreffers_=[],this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen.");return}let t=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Zoeken\u2026",e);try{let n=await this.hass.callWS({type:"domotiapp_lovelace/media/search",query:e,...this.soort_?{media_types:[this.soort_]}:{},limit:20});if(t!==this.beurt_)return;this.treffers_=this.zoekTreffers_=n?.results??[],this.teken_()}catch(n){if(t!==this.beurt_)return;this.leegMelding_("Zoeken lukte niet",n?.message??"Music Assistant gaf geen antwoord.",!0)}}naarTab_(e){this.modus_=e;for(let n of this.shadowRoot.querySelectorAll("[data-tab]"))n.setAttribute("aria-selected",String(n.dataset.tab===e));let t=e==="lijsten"&&this.lijst_;if(this.$(".zoek").hidden=e!=="zoeken",this.$(".soorten").hidden=e==="lijsten",this.$(".lijstkop").hidden=!t,this.$(".nieuwe").hidden=e!=="lijsten"||!!this.lijst_,this.$(".nieuwrij").hidden=!0,e==="zoeken"){if(this.tekenSoorten_(Yn,this.soort_),this.treffers_=this.zoekTreffers_??[],!this.treffers_.length){this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen.");return}this.teken_();return}if(e==="favorieten"){this.haalFavorieten_();return}t?this.openLijst_(this.lijst_):this.haalLijsten_()}tekenSoorten_(e,t){this.$(".soorten").innerHTML=e.map(([n,i])=>`<button type="button" data-soort="${n}" aria-pressed="${n===t}">${i}</button>`).join("")}async haalFavorieten_(){this.bibSoort_??="playlists",this.tekenSoorten_(Pi,this.bibSoort_);let e=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026","Je favorieten uit Music Assistant.");try{let t=await Ht(this.hass,this.bibSoort_,{favoriet:!0});if(e!==this.beurt_)return;if(this.treffers_=t,!t.length){this.leegMelding_("Nog geen favorieten","Zoek iets op en tik op het hartje om het hier te zetten.");return}this.teken_()}catch(t){if(e!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}async favorietOm_(e,t){let n=!e.favorite;e.favorite=n,t?.setAttribute("aria-pressed",String(n));try{let i=await Ui(this.hass,e,n);n&&i?.library_item_id&&(e.library_item_id=i.library_item_id,i.kind&&(e.media_type=Ki[i.kind]??e.media_type)),n&&(this.bibSoort_=Bi(i,e,this.bibSoort_)),this.modus_==="favorieten"&&!n&&this.haalFavorieten_()}catch(i){e.favorite=!n,t?.setAttribute("aria-pressed",String(!n)),this.leegMelding_("Dat lukte niet",i?.message??"Music Assistant gaf geen antwoord.",!0)}}async haalLijsten_(){let e=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026","Je afspeellijsten uit Music Assistant.");try{let t=await Ht(this.hass,"playlists",{});if(e!==this.beurt_)return;if(this.treffers_=t,!t.length){this.leegMelding_("Nog geen afspeellijsten","Maak er een met de knop hierboven.");return}this.teken_()}catch(t){if(e!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}async openLijst_(e){this.lijst_=e,this.modus_="lijsten",this.$(".lijstkop").hidden=!1,this.$(".lijstkop b").textContent=e.name??"Afspeellijst",this.$(".nieuwe").hidden=!0,this.$(".weglijst").hidden=!e.is_editable;let t=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026",e.name??"");try{let n=await qi(this.hass,e);if(t!==this.beurt_)return;if(this.treffers_=n,!n.length){this.leegMelding_("Deze lijst is leeg","Zoek iets op en kies 'Aan afspeellijst toevoegen'.");return}this.teken_()}catch(n){if(t!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",n?.message??"Music Assistant gaf geen antwoord.",!0)}}async lijstMaken_(){let e=this.$(".nieuwrij input").value.trim();if(e){this.$(".nieuwrij").hidden=!0;try{await Wi(this.hass,e),this.lijst_=null,this.naarTab_("lijsten")}catch(t){this.leegMelding_("Maken lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}}async lijstWeg_(){let e=this.lijst_;if(!e)return;let t=this.$(".weglijst");if(t.dataset.zeker!=="ja"){t.dataset.zeker="ja",t.title="Nog een keer tikken om te verwijderen",t.style.color="var(--dac-bad)",setTimeout(()=>{t.dataset.zeker="",t.style.color=""},4e3);return}t.dataset.zeker="",t.style.color="";try{await Gi(this.hass,e),this.lijst_=null,this.naarTab_("lijsten")}catch(n){this.leegMelding_("Verwijderen lukte niet",n?.message??"Music Assistant gaf geen antwoord.",!0)}}async nummerWeg_(e){let t=this.lijst_;if(!(!t||e.position==null))try{await Zi(this.hass,t,[e.position]),this.melding_(`"${e.name}" uit de lijst gehaald`),await this.naVerwerking_(t)}catch(n){this.melding_(n?.message??"Verwijderen lukte niet",!0)}}async naVerwerking_(e){for(let t of[900,2500]){if(await new Promise(n=>setTimeout(n,t)),this.lijst_!==e||!this.hasAttribute("open"))return;await this.openLijst_(e)}}async kiesLijstVoor_(e){this.menuDicht_();let t=[];try{t=await Ht(this.hass,"playlists",{})}catch{t=[]}let n=t.filter(r=>r.is_editable),i=this.$(".menu");i.innerHTML='<span class="titel">Aan welke lijst?</span>'+(n.length?n.map((r,o)=>`<button type="button" data-lijst="${o}">${this.veilig_(r.name)}</button>`).join(""):'<span class="titel">Geen bewerkbare lijst. Maak er eerst een.</span>'),i.hidden=!1,this.menuPlaats_(i),i.scrollTop=0,i.onclick=async r=>{let o=r.target.closest("[data-lijst]");if(!o)return;let s=n[+o.dataset.lijst];this.menuDicht_();try{await Fi(this.hass,s,[e.uri]),this.melding_(`"${e.name}" toegevoegd aan "${s.name}"`)}catch(d){this.melding_(d?.message??"Toevoegen lukte niet",!0)}}}melding_(e,t=!1){let n=this.$(".toast");n||(n=document.createElement("div"),n.className="toast",this.$(".laag").appendChild(n)),n.textContent=e,n.dataset.fout=String(t),n.hidden=!1,clearTimeout(this.toastTimer_),this.toastTimer_=setTimeout(()=>{n.hidden=!0},t?6e3:3e3)}leegMelding_(e,t,n=!1){this.$(".lijst").innerHTML=`<div class="melding${n?" fout":""}"><b>${e}</b>${t}</div>`}teken_(){let e=this.$(".lijst");if(!this.treffers_.length){this.leegMelding_("Niets gevonden","Probeer een andere naam of een ander soort.");return}let t=this.modus_==="lijsten"&&this.lijst_;e.innerHTML=this.treffers_.map((n,i)=>{let r=n.image?`<img src="${n.image}" alt="" loading="lazy" />`:v(n.media_type==="radio"?"radio":"music"),o=Jn(n)&&!t?`<button class="hart" type="button" data-hart="${i}" aria-pressed="${!!n.favorite}"
                 aria-label="Favoriet">${v("star")}</button>`:"",s=t?`<button class="weg" type="button" data-weg="${i}"
               aria-label="Uit deze afspeellijst halen">${v("close")}</button>`:"",d=`<button class="meer" type="button" data-meer="${i}"
               aria-label="Meer met ${this.veilig_(n.name)}">${v("dots")}</button>`,l=(o||s?1:0)+1;return`
          <div class="rij" data-i="${i}" data-knoppen="${l}">
            <button class="tr" type="button">
              <span class="hoes">${r}</span>
              <span class="tekst">
                <span class="nm">${this.veilig_(n.name)}</span>
                <span class="ond">${this.veilig_(Us(n))}</span>
              </span>
            </button><span class="knoppen">${o}${s}${d}</span>
          </div>`}).join(""),this.trefferBinding_?.(),this.trefferBinding_=V(e,{onTap:()=>{let n=this.laatsteTreffer_;n&&(this.modus_==="lijsten"&&!this.lijst_?this.openLijst_(n):this.speel_(n,"replace",{radio:this.radioStandaard_(n)}))},onHold:()=>{let n=this.laatsteTreffer_;n&&this.menuOpen_(n)}})}lijstLuisteraars_(){let e=this.$(".lijst");this.aan_(e,"click",t=>{let n=t.target.closest("[data-hart]"),i=t.target.closest("[data-weg]"),r=t.target.closest("[data-meer]");!n&&!i&&!r||(t.stopImmediatePropagation(),t.preventDefault(),n?this.favorietOm_(this.treffers_[+n.dataset.hart],n):i?this.nummerWeg_(this.treffers_[+i.dataset.weg]):(this.menuPlek_=r.getBoundingClientRect(),this.menuOpen_(this.treffers_[+r.dataset.meer])))}),this.aan_(e,"pointerdown",t=>{t.target.closest("[data-hart], [data-weg], [data-meer]")&&t.stopImmediatePropagation()}),this.aan_(e,"pointerdown",t=>{let n=t.target.closest("[data-i]");this.laatsteTreffer_=n?this.treffers_[+n.dataset.i]:null,this.menuPlek_=n?n.getBoundingClientRect():null})}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}speel_(e,t,{radio:n=!1}={}){e?.uri&&(this.menuDicht_(),this.hass.callService("music_assistant","play_media",{media_id:e.uri,...e.media_type?{media_type:e.media_type}:{},enqueue:t,...n?{radio_mode:!0}:{}},{entity_id:this.entity_}),t==="replace"&&this.sluit())}kanRadio_(e){return["track","album","artist"].includes(e?.media_type)}radioStandaard_(e){return!!this.radioModus_&&this.kanRadio_(e)}menuOpen_(e){let t=this.$(".menu"),n=this.modus_==="lijsten"&&this.lijst_;t.innerHTML=`<span class="titel">${this.veilig_(e.name)}</span><button type="button" data-w="replace">Nu afspelen</button>`+(this.kanRadio_(e)?'<button type="button" data-radio>Afspelen en doorgaan</button>':"")+'<button type="button" data-w="next">Hierna afspelen</button><button type="button" data-w="add">Achteraan in de wachtrij</button>'+(Jn(e)?`<button type="button" data-fav>${e.favorite?"Uit favorieten":"Favoriet maken"}</button>`:"")+(e.uri&&!n&&e.media_type!=="playlist"?'<button type="button" data-toe>Aan afspeellijst toevoegen</button>':""),t.hidden=!1,this.menuPlaats_(t),t.onclick=i=>{let r=i.target.closest("[data-w]");if(r)return this.speel_(e,r.dataset.w,{radio:r.dataset.w==="replace"&&this.radioStandaard_(e)});if(i.target.closest("[data-radio]"))return this.speel_(e,"replace",{radio:!0});if(i.target.closest("[data-fav]"))return this.menuDicht_(),this.favorietOm_(e,this.shadowRoot.querySelector(`[data-hart="${this.treffers_.indexOf(e)}"]`));if(i.target.closest("[data-toe]"))return this.kiesLijstVoor_(e)}}menuPlaats_(e){let t=this.menuPlek_,n=e.offsetWidth||210,i=e.offsetHeight||160,r=Math.min(Math.max(8,(t?.left??40)+12),window.innerWidth-n-8),o=(t?.bottom??80)+6,s=o+i<=window.innerHeight-8?o:Math.max(8,(t?.top??80)-i-6);e.style.left=`${r}px`,e.style.top=`${Math.min(s,Math.max(8,window.innerHeight-i-8))}px`}menuDicht_(){let e=this.$(".menu");e&&(e.hidden=!0)}async haalSpeakers_(){if(this.speakerKeuze_){this.speakers_={label_exists:!0,entities:this.speakerKeuze_.map(e=>{let t=k(this.hass,e);return t?{entity_id:e,name:t.attributes?.friendly_name??e,can_group:W(t,U.GROUPING)}:null}).filter(Boolean),filtered_out:0},this.tekenSpeakers_();return}try{this.speakers_=await this.hass.callWS({type:"domotiapp_lovelace/media/speakers"})}catch{this.speakers_=null}this.tekenSpeakers_()}groepNu_(){let t=this.hass?.states?.[this.entity_]?.attributes?.group_members;return new Set(Array.isArray(t)?t:[])}tekenSpeakers_(){let e=this.$("footer");if(!e)return;let t=this.speakers_;if(!t||!t.label_exists||!t.entities?.length){e.hidden=!t||t.label_exists===void 0,e.hidden||(this.$(".sprekers").innerHTML=`<span class="ond" style="color:var(--dac-ink-2);font-size:12.5px">Plak het label <b>${this.veilig_(t?.label_name??"Music Assistant Media")}</b> op je speakers om ze hier samen te laten spelen.</span>`);return}e.hidden=!1;let n=this.groepNu_(),i=t.entities.filter(o=>o.entity_id===this.entity_||n.has(o.entity_id));this.$(".waar").textContent=i.length?i.map(o=>o.name).join(", "):this.naam_??"";let r=t.entities.map(o=>`${o.entity_id}:${o.entity_id===this.entity_||n.has(o.entity_id)}`).join("|");if(this.sprekerSig_!==r){this.sprekerSig_=r,this.schuiven_?.forEach(o=>o()),this.schuiven_=new Map,this.$(".sprekers").innerHTML=t.entities.map(o=>{let s=o.entity_id===this.entity_,d=s||n.has(o.entity_id),l=W(k(this.hass,o.entity_id),U.VOLUME_SET);return`
            <div class="spreker" data-speaker="${o.entity_id}" data-zelf="${s}" data-mee="${d}">
              <button class="mee" type="button" data-speaker="${o.entity_id}"
                      aria-pressed="${d}" ${!s&&!o.can_group?"disabled":""}
                      title="${s?"Deze speler":o.can_group?"Laat deze speaker meespelen":"Deze speaker laat zich niet koppelen"}">
                ${v(d?"volume":"speaker")}<span>${this.veilig_(o.name)}</span>
              </button>
              ${d&&l?`${le()}<span class="pct tnum"></span>`:d?'<span class="stil">geen volumeregeling</span>':""}
            </div>`}).join("");for(let o of this.shadowRoot.querySelectorAll(".spreker")){let s=o.querySelector(".slider");if(!s)continue;let d=o.dataset.speaker;s.setAttribute("aria-label",`Volume ${o.querySelector("span")?.textContent??""}`);let l=xe(s,{value:()=>$e(k(this.hass,d)),onInput:c=>this.zetSchuif_(s,c),onCommit:c=>this.hass.callService("media_player","volume_set",{volume_level:c/100},{entity_id:d})});this.schuiven_.set(d,l)}}for(let o of this.shadowRoot.querySelectorAll(".spreker")){let s=o.dataset.speaker,d=o.querySelector(".slider");if(!d||d.classList.contains("dragging"))continue;let l=k(this.hass,s),c=$e(l);this.zetSchuif_(d,c,Je(l))}}zetSchuif_(e,t,n=!1){e.style.setProperty("--v",`${t}%`),e.setAttribute("aria-valuenow",String(t));let i=e.parentElement.querySelector(".pct");i&&(i.textContent=n?"gedempt":`${t}%`)}wisselSpeaker_(e){if(e===this.entity_)return;if(this.groepNu_().has(e)){this.hass.callService("media_player","unjoin",{},{entity_id:e});return}this.hass.callService("media_player","join",{group_members:[e]},{entity_id:this.entity_});let n=$e(k(this.hass,this.entity_)),i=k(this.hass,e);W(i,U.VOLUME_SET)&&$e(i)!==n&&this.hass.callService("media_player","volume_set",{volume_level:n/100},{entity_id:e})}disconnectedCallback(){clearTimeout(this.timer_),this.scrollLos_?.(),this.scrollLos_=null,this.schuiven_?.forEach(e=>e()),this.schuiven_=null,this.escape_&&document.removeEventListener("keydown",this.escape_,!0),this.trefferBinding_?.();for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}};C("domotiapp-media-browser",Qn);function Xi(a,e,t,n={}){let i=document.querySelector("domotiapp-media-browser");return i||(i=document.createElement("domotiapp-media-browser"),document.body.appendChild(i)),i.tabIndex=-1,i.open(a,e,t,n),i.focus?.(),i}var Gs=`
  :host {
    ${ae}
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
`,ea=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[se(Gs+be)],this.filter_="",this.opruimen_=[]}connectedCallback(){this.gebouwd_||this.bouw_()}disconnectedCallback(){for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}bouw_(){this.shadowRoot.innerHTML=`
      <div class="laag">
        <header>
          <span class="wie"><b class="naam"></b><span class="sub"></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${v("close")}</button>
        </header>
        <div class="zoek">
          <label class="veld">
            ${v("search")}
            <input type="search" placeholder="Zoek een zender of app" aria-label="Zoeken" />
          </label>
        </div>
        <div class="tel"></div>
        <div class="lijst" role="listbox"></div>
      </div>`,this.gebouwd_=!0;let e=(t,n,i)=>{t.addEventListener(n,i),this.opruimen_.push(()=>t.removeEventListener(n,i))};e(this.$(".sluit"),"click",()=>this.sluit()),e(this.$(".laag"),"click",t=>{t.target===this.$(".laag")&&this.sluit()}),e(this.$("input"),"input",t=>{this.filter_=t.target.value.trim().toLowerCase(),this.teken_()}),e(this.$("input"),"keydown",t=>{t.key==="Enter"&&this.$(".bron")?.click()}),e(this,"keydown",t=>{t.key==="Escape"&&this.hasAttribute("open")&&this.sluit()}),e(this.$(".lijst"),"click",t=>{let n=t.target.closest(".bron");n&&this.kies_(n.dataset.bron)})}$(e){return this.shadowRoot.querySelector(e)}open(e,t,n){this.hass=e,this.entity_=t,this.naam_=n,this.filter_="",this.gebouwd_||this.bouw_(),this.$("input").value="",this.setAttribute("open",""),this.teken_(),setTimeout(()=>this.$("input")?.focus(),60)}sluit(){this.removeAttribute("open")}bronnen_(){let e=k(this.hass,this.entity_),t=e?.attributes?.source_list??[],n=e?.attributes?.source,i=this.filter_?t.filter(r=>String(r).toLowerCase().includes(this.filter_)):[...t];return i.sort((r,o)=>r===n?-1:o===n?1:0),{lijst:i,nu:n,totaal:t.length}}teken_(){let{lijst:e,nu:t,totaal:n}=this.bronnen_();this.$(".naam").textContent=this.naam_??"Bron kiezen",this.$(".sub").textContent=t?`Nu: ${t}`:"",this.$(".tel").textContent=this.filter_?`${e.length} van ${n}`:`${n} bronnen`;let i=this.$(".lijst");if(!e.length){i.innerHTML='<div class="leeg">Niets gevonden.</div>';return}i.innerHTML=e.map(r=>{let o=String(r).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),s=r===t;return`<button class="bron" type="button" role="option" data-bron="${o}"
                  aria-current="${s}" aria-selected="${s}">
                  <b>${o}</b>${s?'<span class="nu">NU</span>':""}
                </button>`}).join("")}kies_(e){!e||!this.hass||(this.hass.callService("media_player","select_source",{entity_id:this.entity_,source:e}),this.sluit())}};C("domotiapp-bron-kiezer",ea);function Yi(a,e,t){let n=document.querySelector("domotiapp-bron-kiezer");return n||(n=document.createElement("domotiapp-bron-kiezer"),document.body.appendChild(n)),n.tabIndex=-1,n.open(a,e,t),n.focus?.(),n}var Vt={power:{icon:"power",label:"Aan of uit"},prev:{icon:"prev",label:"Vorige"},play:{icon:"play",label:"Afspelen of pauzeren"},stop:{icon:"stop",label:"Stoppen"},next:{icon:"next",label:"Volgende"},shuffle:{icon:"shuffle",label:"Willekeurig afspelen"},repeat:{icon:"repeat",label:"Herhalen"},search:{icon:"search",label:"Zoeken in Music Assistant"}},Pt=class extends A{validate(e){return e.entity?{layout:"row",show_artwork:!0,show_volume:!0,show_source:!0,show_controls:!0,show_search:!0,...e}:{...e,[T]:"Kies een mediaspeler."}}watched(){return[this.config.entity,this.config.volume_entity].filter(Boolean)}tone_(){return this.config.tone?I(this.config.tone):M.accent}groot_(){return this.config.layout==="groot"}template(){return this.config.bare&&this.setAttribute("bare",""),this.setAttribute("layout",this.groot_()?"groot":"row"),`
      <div class="card surface" style="--tone:${this.tone_()}">
        ${this.groot_()?'<div class="hoesgroot" role="button" tabindex="0"></div>':""}
        <div class="top" data-on="false">
          <span class="chip" role="button" tabindex="0"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="ctl"></span>
        </div>
        <div class="vol" hidden></div>
        <div class="extra" hidden></div>
      </div>`}wire(){let e=this.config,t=(o,s)=>ue(this,this.hass,e,e[o]??s);this.teardown_.push(B(this.$(".card"))),this.teardown_.push(V(this.$(".top"),{onTap:()=>t("tap_action",{action:"more-info"}),onHold:()=>t("hold_action",{action:"more-info"})}));let n=this.$(".chip");this.teardown_.push(V(n,{onTap:()=>t("icon_tap_action",qe(e.entity)),onHold:()=>t("icon_hold_action",{action:"more-info"})})),this.on(n,"click",o=>o.stopPropagation()),this.on(n,"pointerdown",o=>o.stopPropagation());let i=this.$(".hoesgroot");i&&(this.teardown_.push(V(i,{onTap:()=>t("icon_tap_action",qe(e.entity)),onHold:()=>t("icon_hold_action",{action:"more-info"})})),this.on(i,"click",o=>o.stopPropagation()),this.on(i,"pointerdown",o=>o.stopPropagation()));let r=o=>{let s=o.target.closest?.("[data-k]");s&&(o.stopPropagation(),this.doe_(s.dataset.k))};this.on(this.$(".ctl"),"click",r),this.on(this.$(".vol"),"click",r),this.on(this.$(".extra"),"click",r),this.on(this.$(".ctl"),"pointerdown",o=>o.stopPropagation()),this.on(this.$(".vol"),"pointerdown",o=>o.stopPropagation()),this.on(this.$(".extra"),"pointerdown",o=>o.stopPropagation()),this.sliders_=new Map}doe_(e){let t=this.config.entity,n=k(this.hass,t),i=(r,o={})=>this.hass.callService("media_player",r,{entity_id:t,...o});switch(e){case"power":return i(Kn(n)?"turn_on":"turn_off");case"bron":return Yi(this.hass,t,R(this.hass,t,this.config.name));case"prev":return i("media_previous_track");case"next":return i("media_next_track");case"play":return i(Un(n)?"media_pause":"media_play");case"stop":return i("media_stop");case"mute":{let r=Me(this.config);return this.hass.callService("media_player","volume_mute",{is_volume_muted:!Je(k(this.hass,r))},{entity_id:r})}case"vol-":case"vol+":return this.hass.callService("media_player",e==="vol+"?"volume_up":"volume_down",{},{entity_id:Me(this.config)});case"shuffle":return this.hass.callService("media_player","shuffle_set",{shuffle:!Gn(n)},{entity_id:t});case"repeat":return this.hass.callService("media_player","repeat_set",{repeat:Oi(qn(n))},{entity_id:t});case"search":return Xi(this.hass,t,R(this.hass,t,this.config.name),{radioModus:this.config.radio_mode===!0,speakers:this.config.speakers});default:return}}paint(){let e=this.config,t=k(this.hass,e.entity),n=!t||t.state==="unavailable",i=Ti(t),r=this.$(".top");r.dataset.on=String(i),r.classList.toggle("unavailable",n),this.$(".card").style.setProperty("--tone",this.tone_());let o=this.$(".chip"),s=e.show_artwork===!1?null:vt(this.hass,e.entity,e.icon),d=s?`pic:${s}`:e.icon||Zn(t);o.dataset.icon!==d&&(o.dataset.icon=d,o.classList.toggle("pic",!!s),o.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:v(d,"speaker")),o.style.setProperty("--tone",i&&!s?this.tone_():"var(--dac-ink-3)");let l=this.$(".hoesgroot");l&&l.dataset.icon!==d&&(l.dataset.icon=d,l.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:v(e.icon||Zn(t),"speaker"));let c=R(this.hass,e.entity,e.name),p=Ri(t,u=>te(this.hass,u));this.text(".nm",c),this.text(".st",p),o.setAttribute("aria-label",`${c} afspelen of pauzeren`),this.$(".hoesgroot")?.setAttribute("aria-label",`${c} afspelen of pauzeren`),r.setAttribute("aria-label",`${c}, ${p}`),this.paintKnoppen_(t,n),this.paintVolume_(t,n),this.paintExtra_(t,n),O(this.$(".card"))}paintKnoppen_(e,t){let n=this.$(".ctl"),i=this.config.show_controls===!1||t?[]:Ci(e),r=i.join(",");n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=i.map(s=>`<button class="k ${s==="play"||s==="stop"?"hoofd":""}" type="button" data-k="${s}" aria-label="${Vt[s].label}">${v(Vt[s].icon)}</button>`).join(""));let o=n.querySelector('[data-k="play"]');if(o){let s=Un(e)?"pause":"play";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=v(s))}}paintVolume_(e,t){let n=this.$(".vol"),i=Me(this.config),r=i===this.config.entity?e:k(this.hass,i),o=this.config.show_volume===!1||t?[]:Wn(r),s=t?null:Di(e,{tonen:this.config.show_source!==!1});if(n.hidden=!o.length&&!s,n.hidden){n.dataset.sig="",this.sliders_?.delete("volume");return}let d=[...o,s?"bron":""].join(",");n.dataset.sig!==d&&(n.dataset.sig=d,n.innerHTML=(o.includes("mute")?`<button class="k" type="button" data-k="mute" aria-label="Dempen">${v("volume")}</button>`:"")+(o.includes("slider")?le("volume"):"")+(o.includes("steps")?`<button class="k" type="button" data-k="vol-" aria-label="Zachter">${v("minus")}</button><button class="k" type="button" data-k="vol+" aria-label="Harder">${v("plus")}</button>`:"")+'<span class="pct tnum"></span>'+(s?`<button class="bronknop" type="button" data-k="bron">${v("tv")}<b></b></button>`:""),this.sliders_?.delete("volume"),n.querySelector(".slider")?.setAttribute("aria-label","Volume"));let l=n.querySelector(".bronknop");if(l){let h=s.nu||"Bron";this.text(l.querySelector("b"),h),l.setAttribute("aria-label",`Bron kiezen, nu ${h}`),l.title=`Kies uit ${s.aantal} bronnen`}let c=Je(r),p=$e(r),u=n.querySelector('[data-k="mute"]');if(u){let h=c?"volumeMute":"volume";u.dataset.icon!==h&&(u.dataset.icon=h,u.innerHTML=v(h)),u.setAttribute("aria-pressed",String(c))}let g=n.querySelector(".slider");g&&(this.attach_(g,"volume",{value:()=>$e(k(this.hass,Me(this.config))),onInput:h=>this.setSlider_(g,h),onCommit:h=>this.hass.callService("media_player","volume_set",{volume_level:h/100},{entity_id:Me(this.config)}),disabled:()=>J(k(this.hass,Me(this.config)))}),g.classList.contains("dragging")||this.setSlider_(g,p)),this.text(".pct",c?"Gedempt":`${p}%`)}paintExtra_(e,t){let n=this.$(".extra"),i=t||this.config.show_controls===!1?[]:Fn(e,{zoeken:this.config.show_search!==!1});n.hidden=!i.length;let r=i.join(",");if(n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=i.map((l,c)=>`${l==="search"&&c>0?'<span class="rek"></span>':""}<button class="k" type="button" data-k="${l}" aria-label="${Vt[l].label}">${v(Vt[l].icon)}</button>`).join("")),!i.length)return;let o=n.querySelector('[data-k="shuffle"]');o&&o.setAttribute("aria-pressed",String(Gn(e)));let s=n.querySelector('[data-k="repeat"]');if(s){let l=qn(e),c=l==="one"?"repeatOne":"repeat";s.dataset.icon!==c&&(s.dataset.icon=c,s.innerHTML=v(c)),s.setAttribute("aria-pressed",String(l!=="off")),s.setAttribute("aria-label",{off:"Herhalen: uit",all:"Herhalen: alles",one:"Herhalen: dit nummer"}[l])}let d=document.querySelector("domotiapp-media-browser");d?.hasAttribute("open")&&(d.hass=this.hass)}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let i=xe(e,n);this.sliders_.set(t,i),this.teardown_.push(i)}setSlider_(e,t){e&&(e.style.setProperty("--v",`${t}%`),e.setAttribute("aria-valuenow",String(t)),this.text(".pct",`${t}%`))}getCardSize(){if(this.config?.layout==="groot")return 8;let e=k(this.hass,this.config?.entity);return 1+(Wn(e).length?1:0)+(Fn(e).length?1:0)}getGridOptions(){let e=this.config?.layout==="groot",t=this.minRijen_(".card",e?6:this.getCardSize());return e?{columns:12,rows:"auto",min_columns:6,min_rows:t}:{columns:12,rows:"auto",min_columns:4,min_rows:t}}static getConfigElement(){return document.createElement("domotiapp-media-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("media_player."));return n?{entity:n}:{}}};z(Pt,"css",`
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
    ${_e}
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
  `);var ta=class extends L{defaults(){return{layout:"row",show_artwork:!0,show_volume:!0,show_source:!0,show_controls:!0,show_search:!0,icon_tap_action:{action:"toggle"},tap_action:{action:"more-info"}}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"speaker"},{key:"tone",kind:"tone",label:"Kleur"}]}schema(){return[{name:"entity",selector:x.entity("media_player")},{name:"name",selector:x.text()},{name:"layout",selector:x.select([{value:"row",label:"Rij (\xE9\xE9n rasterrij hoog)"},{value:"groot",label:"Groot (telefoonformaat, grote knoppen)"}])},{name:"volume_entity",selector:x.entity("media_player")},{name:"show_artwork",selector:x.bool()},{name:"show_controls",selector:x.bool()},{name:"show_volume",selector:x.bool()},{name:"show_source",selector:x.bool()},{name:"radio_mode",selector:x.bool()},{name:"speakers",selector:{entity:{domain:"media_player",integration:"music_assistant",multiple:!0}}},{name:"show_search",selector:x.bool()},{name:"icon_tap_action",selector:x.action("toggle")},{name:"icon_hold_action",selector:x.action("more-info")},{name:"tap_action",selector:x.action("more-info")},{name:"hold_action",selector:x.action("more-info")}]}label(e){return{entity:"Mediaspeler",name:"Naam (overschrijft die van de speler)",layout:"Vorm",volume_entity:"Geluid van (optioneel)",show_artwork:"Albumhoes tonen",show_controls:"Knoppen tonen",show_volume:"Volume tonen",show_source:"Bronknop tonen",radio_mode:"Doorspelen na een nummer",speakers:"Speakers om mee te groeperen",show_search:"Zoeken en groeperen tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Welke knoppen er verschijnen leest de kaart uit de speler zelf: wat hij niet kan, komt er niet op.";if(e.name==="layout")return"Groot is bedoeld voor een pop-up of een kolom waar de kaart alle ruimte krijgt: grote hoes, grote knoppen.";if(e.name==="volume_entity")return"Zit het geluid ergens anders dan het beeld \u2014 een tv met een soundbar eronder \u2014 kies dan hier de speler die het volume regelt. Leeg laten betekent: de speler zelf.";if(e.name==="show_artwork")return"Speelt er iets met een hoes, dan vult die de chip. Een eigen icoon gaat voor.";if(e.name==="show_volume")return"De volumeregel verschijnt zodra er iets speelt en verdwijnt als de speler uit gaat.";if(e.name==="speakers")return'De speakers die onderin het zoekscherm staan om samen te laten spelen. Laat je dit leeg, dan valt de kaart terug op het label "Music Assistant Media" in Home Assistant.';if(e.name==="radio_mode")return"Zoals Spotify: is het gekozen nummer klaar, dan zoekt Music Assistant er zelf muziek bij in plaats van te stoppen. Staat dit uit, dan kan het nog steeds per keer via het menu bij een treffer.";if(e.name==="show_source")return"Voor een tv-ontvanger of een versterker met ingangen: een knop met de zender die nu aanstaat, die een zoekbaar overzicht opent. Kan de speler geen bron kiezen, dan verschijnt hij niet.";if(e.name==="show_search")return"De zoekknop opent Music Assistant over het hele scherm. Alleen bij een speler van Music Assistant; groeperen komt erbij als de speler dat aankan."}};H("domotiapp-media-card-editor",ta);N("domotiapp-media-card",Pt,{name:"DomotiApp Mediaspeler",description:"Wat er speelt, de knoppen die de speler aankan, en het volume."});var Qe=[{sleutel:"smoke",label:"Rook",icoon:"smoke",alarm:"Rook gedetecteerd",rust:"Geen"},{sleutel:"co",label:"Koolmonoxide",icoon:"co",alarm:"Koolmonoxide gedetecteerd",rust:"Geen"},{sleutel:"heat",label:"Warmte",icoon:"thermo",alarm:"Te warm",rust:"Normaal"},{sleutel:"temperature",label:"Temperatuur",icoon:"thermo",meting:!0},{sleutel:"battery",label:"Batterij",icoon:"battery",meting:!0}],Ji=a=>a?.rust??"Rustig",na=20;function aa(a){if(!a||a.state==="unavailable"||a.state==="unknown")return null;if(String(a.entity_id??"").startsWith("binary_sensor."))return a.state==="on"?0:null;let e=Number(a.state);return Number.isFinite(e)?e:null}var qs=a=>!!a&&a.state==="on",Fs=a=>!a||a.state==="unavailable"||a.state==="unknown";function Qi(a,e){let t=a.filter(i=>!i.meting);for(let i of t)if(qs(e(i.sleutel)))return{soort:"alarm",tekst:i.alarm,tone:"bad",icoon:i.icoon};if(a.length&&a.every(i=>Fs(e(i.sleutel))))return{soort:"weg",tekst:"Niet bereikbaar",tone:"neutral",icoon:"smokeDetector"};let n=aa(e("battery"));return n!=null&&n<=na?{soort:"batterij",tekst:`Batterij bijna leeg (${Math.round(n)}%)`,tone:"warn",icoon:"battery"}:t.length?{soort:"goed",tekst:"Alles rustig",tone:"good",icoon:"smokeDetector"}:{soort:"meting",tekst:"",tone:"accent",icoon:"smokeDetector"}}var Zs={good:M.good,warn:M.warn,bad:M.bad,neutral:M.neutral,accent:M.accent},It=class extends A{validate(e){return Qe.filter(n=>e[n.sleutel]).length?{...e}:{...e,[T]:"Kies minstens \xE9\xE9n entiteit: rook, koolmonoxide, warmte, temperatuur of batterij."}}watched(){return Qe.map(e=>this.config[e.sleutel]).filter(Boolean)}gekozen_(){return Qe.filter(e=>this.config[e.sleutel])}toestand_(){let e=Qi(this.gekozen_(),t=>k(this.hass,this.config[t]));return{...e,tone:Zs[e.tone]??M.accent}}batterijPct_(){return aa(k(this.hass,this.config.battery))}template(){this.config.bare&&this.setAttribute("bare","");let e=this.gekozen_().map(t=>`<span class="pil" data-soort="${t.sleutel}" title="${t.label}">${v(t.icoon)}<b></b></span>`).join("");return`
      <div class="card surface">
        <div class="top" role="button" tabindex="0" style="--tone:${M.good}">
          <span class="chip"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
        </div>
        <div class="meta">${e}</div>
      </div>`}wire(){let e=this.config,t=this.gekozen_()[0];this.teardown_.push(V(this.$(".top"),{onTap:()=>e.tap_action?ue(this,this.hass,e,e.tap_action):Y(this,e.smoke??e[t.sleutel]),onHold:()=>ue(this,this.hass,e,e.hold_action??{action:"more-info"})})),this.$$(".pil").forEach(i=>{let r=e[i.dataset.soort];r&&(this.on(i,"click",o=>{o.stopPropagation(),Y(this,r)}),this.on(i,"pointerdown",o=>o.stopPropagation()),i.style.cursor="pointer")});let n=this.$(".card");if(n&&typeof ResizeObserver=="function"){let i=new ResizeObserver(()=>this.pasAan_());i.observe(n),this.teardown_.push(()=>i.disconnect())}this.teardown_.push(B(this.$(".card")))}paint(){let e=this.config,t=this.toestand_(),n=this.$(".top");this.toggleAttribute("alarm",t.soort==="alarm"),n.style.setProperty("--tone",t.tone),n.classList.toggle("unavailable",t.soort==="weg");let i=this.$(".chip"),r=e.icon||t.icoon;i.dataset.icon!==r&&(i.dataset.icon=r,i.innerHTML=v(r,"smoke")),i.style.setProperty("--tone",t.tone);let o=this.gekozen_()[0];this.text(".nm",e.name||R(this.hass,e.smoke??e[o.sleutel],null)),this.text(".st",t.tekst),n.setAttribute("aria-label",`${this.$(".nm").textContent}${t.tekst?`, ${t.tekst}`:""}`),this.$$(".pil").forEach(s=>this.paintPil_(s)),this.$(".meta").hidden=this.gekozen_().length<=1&&!this.config.always_meta,this.pasAan_(),O(this.$(".card"))}pasAan_(){let e=this.$(".meta");if(!e||e.hidden)return;let t=()=>{let i=e.querySelector(".pil")?.offsetHeight??0;return i&&Math.round((e.scrollHeight+i/2)/i-.5)||1};this.removeAttribute("krapper"),!(t()<=1)&&this.setAttribute("krapper","")}paintPil_(e){let t=Qe.find(s=>s.sleutel===e.dataset.soort),n=k(this.hass,this.config[t.sleutel]),i=e.querySelector("b"),r=s=>e.setAttribute("aria-label",`${t.label}: ${s}`);if(!n||J(n)){i.textContent="\u2014",r("onbekend"),e.dataset.let="";return}if(t.meting){let s=n.attributes.unit_of_measurement??"",d=Number(n.state);i.textContent=Number.isFinite(d)?`${F(this.hass,d,t.sleutel==="temperature"?1:0)} ${s}`.trim():te(this.hass,n);let l=t.sleutel==="battery"?this.batterijPct_():null;e.dataset.let=l!=null&&l<=na?"warn":"",r(i.textContent);return}let o=ve(n);i.textContent=o?"Alarm":Ji(t),r(i.textContent),e.dataset.let=o?"bad":""}regels_(){return this.gekozen_().length>1?2:1}getCardSize(){return this.regels_()}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",this.regels_())}}static getConfigElement(){return document.createElement("domotiapp-smoke-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("binary_sensor.")&&/rook|smoke/i.test(i));return n?{smoke:n}:{}}};z(It,"css",`
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
  `);var ia=class extends L{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"smoke"}]}schema(){return[{name:"name",selector:x.text()},{name:"smoke",selector:x.entity()},{name:"co",selector:x.entity()},{name:"heat",selector:x.entity()},{name:"temperature",selector:x.entity()},{name:"battery",selector:x.entity()},{name:"tap_action",selector:x.action("more-info")},{name:"hold_action",selector:x.action("more-info")}]}label(e){return{name:"Naam (overschrijft die van de melder)",smoke:"Rook",co:"Koolmonoxide",heat:"Warmte",temperature:"Temperatuur",battery:"Batterij",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="smoke")return"Alle vijf zijn optioneel: vul in wat je melder heeft. Wat je leeg laat, komt niet op de kaart.";if(e.name==="battery")return"Een percentage of een 'batterij bijna leeg'-sensor. Onder de 20% meldt de kaart het uit zichzelf."}};H("domotiapp-smoke-card-editor",ia);N("domotiapp-smoke-card",It,{name:"DomotiApp Rookmelder",description:"Rook, koolmonoxide, warmte, temperatuur en batterij \u2014 alles optioneel."});var Xs=["zo","ma","di","wo","do","vr","za"],er=5,tr=8,Kt=class extends A{validate(e){if(!e.entity)return{...e,[T]:"Kies een weerentiteit."};let t=Math.min(Math.max(1,Number(e.days)||er),tr);return{show_current:!0,forecast_type:"daily",...e,days:t}}watched(){return[this.config.entity]}template(){this.config.bare&&this.setAttribute("bare","");let e=this.config;return`
      <div class="card surface">
        <div class="nu" role="button" tabindex="0" ${e.show_current===!1?"hidden":""}>
          <span class="chip" style="--tone:${M.accent}"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="graden tnum"></span>
        </div>
        <div class="rij" style="--n:${e.days}"></div>
      </div>`}wire(){this.teardown_.push(B(this.$(".card"))),this.teardown_.push(V(this.$(".nu"),{onTap:()=>Y(this,this.config.entity),onHold:()=>Y(this,this.config.entity)})),this.abonneer_()}async abonneer_(){let e=this.config;this.opzeggen_?.(),this.opzeggen_=null;let t=this.hass?.connection;if(!t?.subscribeMessage){this.forecastFout_="Geen verbinding voor de voorspelling.",this.paintRij_();return}try{let n=await t.subscribeMessage(i=>{this.forecast_=i?.forecast??[],this.forecastFout_=null,this.paintRij_()},{type:"weather/subscribe_forecast",forecast_type:e.forecast_type==="hourly"?"hourly":"daily",entity_id:e.entity});if(!this.isConnected){n();return}this.opzeggen_=n,this.teardown_.push(()=>{try{n()}catch{}this.opzeggen_=null})}catch{this.forecastFout_=e.forecast_type==="hourly"?"Deze weerbron geeft geen uurvoorspelling.":"Deze weerbron geeft geen dagvoorspelling.",this.paintRij_()}}paint(){let e=this.config,t=k(this.hass,e.entity),n=J(t);this.$(".nu").classList.toggle("unavailable",n);let r=this.$(".chip"),o=e.icon||Ze(t?.state);r.dataset.icon!==o&&(r.dataset.icon=o,r.innerHTML=v(o,"cloud")),this.text(".nm",R(this.hass,e.entity,e.name)),this.text(".st",n?"Niet bereikbaar":te(this.hass,t));let s=this.$(".graden"),d=t?.attributes?.temperature,l=t?.attributes?.temperature_unit??"\xB0C";s.innerHTML=d==null?"":`${F(this.hass,d,Number.isInteger(d)?0:1)}<small>${l}</small>`,this.paintRij_(),O(this.$(".card"))}paintRij_(){let e=this.$(".rij");if(!e)return;let t=this.config;if(this.forecastFout_&&!this.forecast_?.length){e.style.setProperty("--n",1),e.innerHTML=`<div class="leeg">${this.forecastFout_}</div>`;return}let n=(this.forecast_??[]).slice(0,t.days);if(!n.length){e.style.setProperty("--n",1),e.innerHTML='<div class="leeg">Nog geen voorspelling ontvangen\u2026</div>';return}e.style.setProperty("--n",n.length);let i=k(this.hass,t.entity)?.attributes?.temperature_unit??"";e.innerHTML=n.map((r,o)=>{let s=this.wanneer_(r.datetime,o),d=v(Ze(r.condition),"cloud"),l=r.temperature==null?"":`${F(this.hass,r.temperature,0)}\xB0`,c=r.templow==null?"":`${F(this.hass,r.templow,0)}\xB0`,p=r.precipitation_probability==null?"":`<span class="nat">${v("drop")}${Math.round(r.precipitation_probability)}%</span>`;return`
          <div class="dag" style="--tone:${M.accent}">
            <span class="wanneer">${s}</span>
            ${d}
            <span class="max tnum">${l}</span>
            ${c?`<span class="min tnum">${c}</span>`:""}
            ${p}
          </div>`}).join("")}wanneer_(e,t){let n=new Date(e);if(Number.isNaN(+n))return"";if(this.config.forecast_type==="hourly")return`${String(n.getHours()).padStart(2,"0")}:00`;let i=new Date,r=n.getDate()===i.getDate()&&n.getMonth()===i.getMonth()&&n.getFullYear()===i.getFullYear();return t===0&&r?"vandaag":Xs[n.getDay()]}regels_(){return this.config?.show_current===!1?1:2}getCardSize(){return this.regels_()+1}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-forecast-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("weather."));return n?{entity:n}:{}}};z(Kt,"css",`
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
  `);var ra=class extends L{defaults(){return{show_current:!0,forecast_type:"daily",days:er}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"cloudSun"}]}schema(){return[{name:"entity",selector:x.entity("weather")},{name:"name",selector:x.text()},{name:"forecast_type",selector:x.select([{value:"daily",label:"Per dag"},{value:"hourly",label:"Per uur"}])},{name:"days",selector:x.number(1,tr)},{name:"show_current",selector:x.bool()}]}label(e){return{entity:"Weerentiteit",name:"Naam (overschrijft die van de weerbron)",forecast_type:"Voorspelling",days:"Hoeveel punten",show_current:"Nu-regel tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Meer hoeft er niet ingevuld te worden: de kaart leest zelf uit wat je weerbron levert.";if(e.name==="forecast_type")return"Niet elke weerbron kan allebei. Kan hij het niet, dan zegt de kaart dat in plaats van leeg te blijven."}};H("domotiapp-forecast-card-editor",ra);N("domotiapp-forecast-card",Kt,{name:"DomotiApp Weersvoorspelling",description:"Vandaag groot, de dagen erna op een rij. E\xE9n entiteit invullen."});var et={OPEN:1,CLOSE:2,SET_POSITION:4,STOP:8},tt=(a,e)=>!!((a?.attributes?.supported_features??0)&e),Ys=(a={})=>{switch(a.device_class){case"garage":return{open:"garageOpen",closed:"garageClosed"};case"awning":case"blind":return{open:"awning",closed:"awning"};default:return{open:"shutterOpen",closed:"shutter"}}},Bt=class extends A{validate(e){let t=e.covers??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,covers:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[T]:"Kies minstens \xE9\xE9n rolluik of zonnescherm."}}watched(){return this.config.covers.map(e=>e.entity)}keysHtml(e){return`
      <div class="keys">
        <button type="button" data-act="open" aria-label="Open">${E.arrowUp}</button>
        ${e?`<button type="button" data-act="stop" aria-label="Stop">${E.stop}</button>`:""}
        <button type="button" data-act="close" aria-label="Dicht">${E.arrowDown}</button>
      </div>`}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`<div class="card surface">${e.covers.map((n,i)=>`
      <div class="cv" data-i="${i}" data-shown="closed" style="--tone:${I(n.tone??e.tone,"solar")}">
        <button class="chip" type="button" aria-label="Meer info"></button>
        <div class="txt"><div class="nm"></div><div class="st"></div></div>
        ${this.keysHtml(e.show_stop!==!1)}
        <div class="pos" hidden></div>
      </div>`).join("")}</div>`}wire(){this.dragging_=new Set,this.bound_=new Set,this.assumed_=new Map,this.$$(".cv").forEach(e=>{let t=e.dataset.i;e.querySelectorAll(".keys button").forEach(i=>{this.on(i,"click",()=>{let r=i.dataset.act,o={open:"open_cover",stop:"stop_cover",close:"close_cover"};this.hass.callService("cover",o[r],{entity_id:this.config.covers[+t].entity}),r!=="stop"&&(this.assumed_.set(t,r==="open"?"open":"closed"),this.paint())})});let n=this.config.covers[+t].entity;this.teardown_.push(V(e.querySelector(".chip"),{onTap:()=>Y(this,n)}))})}paint(){this.$$(".cv").forEach(e=>{let t=e.dataset.i,n=this.config.covers[+t],i=k(this.hass,n.entity),r=q(this.hass,n.entity),o=!i||i.state==="unavailable",s=i?.state??"unknown";e.classList.toggle("unavailable",o),e.querySelector(".nm").textContent=R(this.hass,n.entity,n.name);let d=tt(i,et.SET_POSITION)&&r.current_position!=null,l=d?r.current_position>0?"open":"closed":s==="open"||s==="closed"?s:this.assumed_.get(t)??"closed";e.dataset.shown=l;let c=Ys(r),p=(l==="open"?n.icon_open:n.icon_closed)??(l==="open"?this.config.icon_open:this.config.icon_closed)??n.icon??c[l],u=e.querySelector(".chip");u.dataset.icon!==p&&(u.dataset.icon=p,u.innerHTML=v(p,c[l]));let g=e.querySelector(".st");this.dragging_.has(t)||(g.textContent=o?"Niet bereikbaar":s==="opening"?"Gaat open":s==="closing"?"Gaat dicht":d?`${r.current_position}% open`:s==="open"?"Open":s==="closed"?"Dicht":""),e.querySelectorAll(".keys button").forEach(b=>{if(b.dataset.act==="stop"){b.disabled=o||!tt(i,et.STOP);return}let w=b.dataset.act==="open";b.disabled=o||(w?!tt(i,et.OPEN):!tt(i,et.CLOSE))});let h=e.querySelector(".pos"),f=d&&this.config.show_position!==!1;if(h.hidden=!f,f){if(h.dataset.built||(h.dataset.built="1",h.innerHTML=le("position"),h.querySelector(".slider").setAttribute("aria-label","Positie")),!this.bound_.has(t)){this.bound_.add(t);let w=h.querySelector(".slider"),$=j=>{w.style.setProperty("--v",`${j}%`),w.setAttribute("aria-valuenow",String(j)),e.querySelector(".st").textContent=`${j}% open`};this.teardown_.push(xe(w,{value:()=>q(this.hass,n.entity).current_position??0,onInput:$,onCommit:j=>this.hass.callService("cover","set_cover_position",{entity_id:n.entity,position:j})}))}let b=h.querySelector(".slider");if(!b.classList.contains("dragging")){let w=r.current_position??0;b.style.setProperty("--v",`${w}%`),b.setAttribute("aria-valuenow",String(w))}}})}rows_(){let e=this.config?.covers??[],t=e.some(n=>tt(k(this.hass,n.entity),et.SET_POSITION));return me(12+Math.max(1,e.length)*42+(t?30:0))}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-cover-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("cover."));return{covers:n?[n]:[]}}};z(Bt,"css",`
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
    ${_e}

    .cv.unavailable { opacity: .42; pointer-events: none; }

    @media (max-width: 380px) { .keys button { width: 34px; } }
  `);var oa=class extends L{defaults(){return{show_stop:!0,show_position:!0}}pickers(){return[{key:"icon_open",kind:"icon",label:"Icoon als het open staat",fallback:"shutterOpen"},{key:"icon_closed",kind:"icon",label:"Icoon als het dicht is",fallback:"shutter"},{key:"tone",kind:"tone",label:"Kleur"}]}setConfig(e){let t={...e},n=(e.covers??e.entities??(e.entity?[e.entity]:[])).map(i=>typeof i=="string"?{entity:i}:i);t.covers=n.map(i=>i.entity);for(let i of n)i.name&&(t[`naam:${i.entity}`]=i.name);super.setConfig(t)}serialize(e){let t={...e},n=t.covers??[];t.covers=n.map(i=>{let r=t[`naam:${i}`];return r?{entity:i,name:r}:i});for(let i of Object.keys(t))i.startsWith("naam:")&&delete t[i];return t}schema(){let e=(this.config_?.covers??[]).filter(t=>typeof t=="string");return[{name:"covers",selector:{entity:{domain:"cover",multiple:!0}}},...e.map(t=>({name:`naam:${t}`,selector:x.text()})),{name:"show_stop",selector:x.bool()}]}label(e){if(e.name.startsWith("naam:")){let t=e.name.slice(5);return`Naam voor ${this.hass?.states?.[t]?.attributes?.friendly_name??t}`}return{covers:"Rolluiken",show_stop:"Stopknop tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="covers")return"Melden ze hun stand terug, dan komt er vanzelf een schuif bij. Zo niet, dan blijven het open, stop en dicht, en volgt het icoon de knop die je indrukt. Per rolluik kun je hieronder een eigen naam zetten."}};H("domotiapp-cover-card-editor",oa);N("domotiapp-cover-card",Bt,{name:"DomotiApp Rolluiken",description:"Open, stop en dicht, met een eigen icoon voor open en dicht."});function Js(a){if(!a)return{label:"Onbekend",home:null};switch(a.state){case"home":return{label:"Thuis",home:!0};case"not_home":return{label:"Afwezig",home:!1};case"unknown":case"unavailable":return{label:"Onbekend",home:null};default:return{label:a.state,home:!1}}}var Ut=class extends A{validate(e){let t=e.persons??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,persons:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[T]:"Kies minstens \xE9\xE9n persoon."}}watched(){return this.config.persons.map(e=>e.entity)}template(){let e=this.config;e.bare&&this.setAttribute("bare","");let t=e.columns??Math.min(e.persons.length,6),n=e.persons.map((i,r)=>`
      <button class="p" type="button" data-i="${r}" style="--tone:var(--dac-ink-3)">
        <span class="av"><span class="ph"></span></span>
        <span class="nm"></span>
      </button>`).join("");return`<div class="card surface"><div class="chips" style="--cols:${t}">${n}</div></div>`}wire(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i];this.teardown_.push(V(e,{onTap:()=>Y(this,t.entity)}))})}paint(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i],n=k(this.hass,t.entity),i=Js(n);e.style.setProperty("--tone",i.home===!0?"var(--dac-good)":i.home===!1?"var(--dac-bad)":"var(--dac-warn)");let r=R(this.hass,t.entity,t.name);this.text(e.querySelector(".nm"),r);let o=e.querySelector(".ph"),s=n?.attributes?.entity_picture,d=s?`img:${s}`:r?`ini:${r[0]}`:"icon";o.dataset.kind!==d&&(o.dataset.kind=d,o.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:r?r[0].toUpperCase():E.person),e.setAttribute("aria-label",`${r}, ${i.label}`)})}rows_(){let e=this.config?.columns??Math.min(this.config?.persons?.length??1,6),t=Math.ceil((this.config?.persons?.length??1)/e);return me(10+t*45+(t-1)*6)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:"full",rows:e,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-person-card-editor")}static getStubConfig(e){return{persons:Object.keys(e?.states??{}).filter(n=>n.startsWith("person.")).slice(0,6)}}};z(Ut,"css",`
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
  `);var sa=class extends L{setConfig(e){let t={...e},n=(e.persons??[]).map(i=>typeof i=="string"?{entity:i}:i);t.persons=n.map(i=>i.entity);for(let i of n)i.name&&(t[`naam:${i.entity}`]=i.name);super.setConfig(t)}serialize(e){let t={...e},n=t.persons??[];t.persons=n.map(i=>{let r=t[`naam:${i}`];return r?{entity:i,name:r}:i});for(let i of Object.keys(t))i.startsWith("naam:")&&delete t[i];return t}schema(){let e=(this.config_?.persons??[]).filter(t=>typeof t=="string");return[{name:"persons",selector:{entity:{domain:["person","device_tracker"],multiple:!0}}},...e.map(t=>({name:`naam:${t}`,selector:x.text()}))]}label(e){if(e.name==="persons")return"Personen";if(e.name.startsWith("naam:")){let t=e.name.slice(5);return`Naam voor ${this.hass?.states?.[t]?.attributes?.friendly_name??t}`}return super.label(e)}helper(e){if(e.name==="persons")return"Thuis is groen, weg is rood, geen melding is oranje. Per persoon kun je hieronder een eigen naam zetten."}};H("domotiapp-person-card-editor",sa);N("domotiapp-person-card",Ut,{name:"DomotiApp Personen",description:"Wie er thuis is, compact. Het hele huishouden in \xE9\xE9n kaart."});var Qs=[[/gft|groente|tuin|organi/i,"teal","binWheeled"],[/pmd|plastic|verpakking/i,"solar","binWheeled"],[/papier|karton/i,"water","binWheeled"],[/rest|grijs/i,"neutral","binWheeled"],[/textiel|kleding/i,"pink","bin"],[/glas/i,"magenta","bin"],[/kerstboom|snoei|takken/i,"teal","bin"]];function el(a){for(let[e,t,n]of Qs)if(e.test(a))return{tone:t,icon:n};return{tone:"accent",icon:"bin"}}var nr=a=>String(a??"").replace(/^(afvalbeheer|afvalwijzer|mijnafvalwijzer)\s*/i,"").replace(/\s*(mijnafvalwijzer)\s*/i," ").trim(),Wt=class extends A{validate(e){let t=e.sensors??e.entities??(e.entity?[e.entity]:[]);return t.length?{show_hero:!0,show_list:!0,...e,sensors:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[T]:"Kies minstens \xE9\xE9n afvalsensor waarvan de status een datum is."}}watched(){return this.config.sensors.map(e=>e.entity)}read_(){let e=new Date;return this.config.sensors.map(t=>{let n=k(this.hass,t.entity);if(!n)return null;let i=Fe(n.state)??Fe(n.attributes.date)??Fe(n.attributes.next_date);if(!i)return null;let r=t.label??nr(R(this.hass,t.entity,t.name)),o=el(t.label??t.entity+r),s=this.config.tones?.[t.entity];return{label:r,date:i,days:fn(e,i),tone:I(s??t.tone??o.tone),icon:t.icon??o.icon}}).filter(t=>t&&t.days>=0).sort((t,n)=>t.date-n.date)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`
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
      </div>`}paint(){let e=this.read_(),t=this.$(".hero"),n=this.$(".list"),i=this.$(".empty");if(i.hidden=e.length>0,t&&(t.hidden=e.length===0,e.length)){let r=e[0];t.style.setProperty("--tone",r.tone),this.setAttribute("urgency",r.days===0?"today":r.days===1?"tomorrow":"later");let o=t.querySelector(".bin");o.dataset.icon!==r.icon&&(o.dataset.icon=r.icon,o.innerHTML=v(r.icon,"bin")),this.text(t.querySelector(".eyebrow"),bn(r.date)),this.text(t.querySelector(".big"),r.label),this.text(t.querySelector(".n"),r.days===0?"nu":String(r.days)),this.text(t.querySelector(".u"),r.days===0?"aan de weg":r.days===1?"dag":"dagen")}if(n){let r=this.config.show_hero===!1?e:e.slice(1),o=r.map(s=>`${s.label}${+s.date}`).join("|");if(n.dataset.sig===o)return;n.dataset.sig=o,n.innerHTML=r.map(s=>{let d=bn(s.date),l=s.days<=6?`<small>${oi(s.date)}</small>`:"";return`
        <div class="r" style="--tone:${s.tone}">
          <i></i><span>${s.label}</span>
          <span class="d">${d}${l}</span>
        </div>`}).join("")}}rows_(){let e=this.config?.sensors?.length??1;return this.config?.show_list===!1?1:this.config?.show_hero===!1?Math.max(1,me(20+e*33)):Math.max(2,e)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-waste-card-editor")}static getStubConfig(e){return{sensors:Object.keys(e?.states??{}).filter(n=>/afval|waste|trash|garbage|ophaal/i.test(n)&&n.startsWith("sensor.")).filter(n=>Fe(e.states[n]?.state)).slice(0,6),title:"Afvalkalender"}}};z(Wt,"css",`
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
  `);var la=class extends L{defaults(){return{show_hero:!0,show_list:!0}}setConfig(e){let t={...e};for(let[n,i]of Object.entries(e.tones??{}))t[`kleur:${n}`]=i;delete t.tones,super.setConfig(t)}serialize(e){let t={...e},n={};for(let i of Object.keys(t))i.startsWith("kleur:")&&(t[i]&&(n[i.slice(6)]=t[i]),delete t[i]);return Object.keys(n).length?t.tones=n:delete t.tones,t}ids_(){return(this.config_?.sensors??[]).map(e=>typeof e=="string"?e:e.entity).filter(Boolean)}pickers(){return this.ids_().map(e=>({key:`kleur:${e}`,kind:"tone",label:`Kleur voor ${nr(this.hass?.states?.[e]?.attributes?.friendly_name??e)||e}`,compact:!0,after:!0}))}schema(){return[{name:"sensors",selector:{entity:{domain:"sensor",multiple:!0}}}]}label(e){return{sensors:"Afvalsensoren",show_hero:"Eerstvolgende uitlichten",show_list:"Overige data tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="sensors")return"Sensoren waarvan de status een datum is, bijvoorbeeld 18-08-2026. De kaart sorteert zelf; laat een kleur leeg om de bakkleur op de naam te laten kiezen."}};H("domotiapp-waste-card-editor",la);N("domotiapp-waste-card",Wt,{name:"DomotiApp Afvalkalender",description:"Eerstvolgende ophaling als hero, de rest eronder. Kleur per fractie."});function Ne(a){if(a==null||a==="")return 4;let e=Math.round(Number(a));return Number.isFinite(e)?Math.min(6,Math.max(2,e)):4}function Gt(a,e=!0){if(typeof a=="string")return{name:"",icon:"",path:a,items:[]};let t=a??{};return{name:typeof t.name=="string"?t.name:"",icon:typeof t.icon=="string"?t.icon:"",path:typeof t.path=="string"?t.path:typeof t.url=="string"?t.url:typeof t.navigation_path=="string"?t.navigation_path:"",items:e&&Array.isArray(t.items)?t.items.slice(0,8).map(n=>Gt(n,!1)):[]}}var je=a=>Array.isArray(a?.items)?a.items.filter(Ee):[],ar=a=>je(a).length>0,Ee=a=>!!(a&&(a.name?.trim()||a.icon?.trim()||a.path?.trim()));function ir(a){return(Array.isArray(a?.items)?a.items:[]).slice(0,20).map(t=>Gt(t))}function qt(a,e=4){let t=(a??[]).filter(Ee),n=Ne(e);if(t.length<=n)return{balk:t,meer:[],heeftMeer:!1};let i=Math.max(1,n-1);return{balk:t.slice(0,i),meer:t.slice(i),heeftMeer:!0}}function rr(a){let e=String(a??"").trim();return e?/^[a-z][a-z0-9+.-]*:\/\//i.test(e)||e.startsWith("mailto:")?{action:"url",url_path:e}:{action:"navigate",navigation_path:e}:{action:"none"}}var al=`
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
  .dac-nav .voor svg, .dac-nav .voor ha-icon {
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
  .dac-nav .sub .voor svg, .dac-nav .sub .voor ha-icon {
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
`,or=/^i(\d+)(s\d+)?$/,sr=a=>({...a.name?{name:a.name}:{},...a.icon?{icon:a.icon}:{},...a.path?{path:a.path}:{}}),lr=a=>a.filter(Ee).map(e=>{let t=(e.items??[]).filter(Ee).map(sr);return{...sr(e),...t.length?{items:t}:{}}}),da=class extends HTMLElement{constructor(){super(),this.items_=[],this.rest_={},this.open_=new Set}setConfig(e){if(this.rest_={...e},delete this.rest_.items,this.gebouwd_&&e===this.uitObject_)return;let t=(Array.isArray(e?.items)?e.items:[]).map(n=>Gt(n));this.gebouwd_&&JSON.stringify(lr(t))===this.uit_||(this.items_=t,this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker, dac-tone-picker"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}connectedCallback(){this.gebouwd_||this.build_()}async build_(){if(!this.hass_)return;await customElements.whenDefined("ha-form"),this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=al;let t=document.createElement("div");t.className="dac-nav",this.append(e,t),t.appendChild(this.kaartBlok_()),t.appendChild(this.kleurKiezer_());let n=document.createElement("div");n.className="knoppen",t.appendChild(n);let{balk:i}=qt(this.items_,this.rest_.max),r=i.length,o=this.items_.filter(Ee);if(this.items_.forEach((d,l)=>{if(o.indexOf(d)===r&&o.length>r){let p=document.createElement("div");p.className="grens",p.textContent="Achter de meer-knop",n.appendChild(p)}n.appendChild(this.itemBlok_(d,l))}),!this.items_.length){let d=document.createElement("p");d.className="uitleg",d.textContent="Elke knop heeft een naam, een icoon en een pad -- bijvoorbeeld /lovelace/keuken voor een view op dit dashboard, of #keuken voor een pop-up. Wat er niet meer in de balk past valt vanzelf achter de meer-knop rechts.",t.appendChild(d)}let s=document.createElement("button");s.type="button",s.className="toevoegen",s.textContent="\uFF0B  Knop toevoegen",s.disabled=this.items_.length>=20,s.addEventListener("click",()=>{this.items_.push({name:"",icon:"",path:""}),this.open_.add(`i${this.items_.length-1}`),this.emit_(),this.build_()}),t.appendChild(s)}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"max",selector:{number:{min:2,max:6,step:1,mode:"box"}}},{name:"labels",selector:{boolean:{}}},{name:"bare",selector:{boolean:{}}}],e.computeLabel=t=>({max:"Knoppen in de balk",labels:"Namen onder de iconen",bare:"Achtergrond weglaten"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="max")return`De meer-knop telt zelf mee. Staan er meer knoppen dan dit, dan komen de eerste ${Ne(this.rest_.max)-1} in de balk en valt de rest achter "Meer".`;if(t.name==="labels")return"Uit geeft een rij kale iconen. Dan passen er meer naast elkaar op een telefoon.";if(t.name==="bare")return"Haalt de pil onder de balk weg: alleen de iconen blijven over, zwevend boven het dashboard."},e.data={max:Ne(this.rest_.max),labels:this.rest_.labels!==!1,bare:!!this.rest_.bare},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{};this.rest_.max=Ne(n.max),n.labels===!1?this.rest_.labels=!1:delete this.rest_.labels,n.bare?this.rest_.bare=!0:delete this.rest_.bare,this.emit_(),this.build_()}),e}kleurKiezer_(){let e=document.createElement("dac-tone-picker");return e.label="Kleur",e.hass=this.hass_,e.value=this.rest_.tone??"accent",e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value;n&&n!=="accent"?this.rest_.tone=n:delete this.rest_.tone,this.emit_()}),e}itemBlok_(e,t){let n=document.createElement("details");n.className="item",this.onthoud_(n,`i${t}`);let i=document.createElement("summary"),r=document.createElement("span");r.className="voor";let o=document.createElement("span");o.className="titel";let s=document.createElement("b"),d=document.createElement("small");o.append(s,d);let l=()=>{let b=!Ee(e);n.dataset.leeg=String(b),r.innerHTML=v(e.icon,"grid"),s.textContent=e.name||(b?"Nieuwe knop":e.path||"Zonder naam");let w=je(e).length;d.textContent=w?`Menu met ${w} knop${w===1?"":"pen"}`:e.path?e.path:e.icon?`${ke(e.icon)} -- nog geen pad`:"Nog geen pad"};l(),this.koppen_.push(l);let c=this.kopKnop_("Omhoog",E.arrowUp,()=>this.verplaats_(t,-1));c.disabled=t===0;let p=this.kopKnop_("Omlaag",E.arrowDown,()=>this.verplaats_(t,1));p.disabled=t===this.items_.length-1;let u=this.kopKnop_("Verwijderen",E.close,()=>this.verwijder_(t));u.classList.add("weg"),i.append(r,o,c,p,u),n.appendChild(i);let g=document.createElement("div");g.className="body";let h=document.createElement("dac-icon-picker");h.label="Icoon",h.fallback="grid",h.auto=!1,h.hass=this.hass_,h.value=e.icon,h.addEventListener("value-changed",b=>{b.stopPropagation(),e.icon=b.detail.value??"",this.emit_()});let f=document.createElement("ha-form");return f.hass=this.hass_,f.schema=[{name:"name",selector:{text:{}}},{name:"path",selector:{text:{}}}],f.computeLabel=b=>({name:"Naam",path:"Waar gaat hij heen"})[b.name]??b.name,f.computeHelper=b=>{if(b.name!=="path")return;let w="/lovelace/keuken voor een view, #keuken voor een pop-up van bubble-card, of een https-adres voor iets buiten Home Assistant.";return ar(e)?`${w}

Deze knop heeft subknoppen en klapt dus open in plaats van ergens heen te gaan; zijn eigen pad wordt niet gebruikt.`:w},f.data={name:e.name,path:e.path},f.addEventListener("value-changed",b=>{b.stopPropagation();let w=b.detail.value??{};e.name=w.name??"",e.path=w.path??"",this.emit_()}),g.append(h,f,...this.subBlok_(e,t)),n.appendChild(g),n}subBlok_(e,t){Array.isArray(e.items)||(e.items=[]);let n=document.createElement("div");n.className="subkop",n.textContent="Subknoppen";let i=document.createElement("div");i.className="sublijst",e.items.forEach((s,d)=>i.appendChild(this.subItemBlok_(e,s,t,d)));let r=document.createElement("button");r.type="button",r.className="subtoevoegen",r.textContent="\uFF0B  Subknop toevoegen",r.disabled=e.items.length>=8,r.addEventListener("click",()=>{let s=e.items.length;e.items.push({name:"",icon:"",path:"",items:[]}),this.open_.add(`i${t}`),this.open_.add(`i${t}s${s}`),this.emit_(),this.build_(),requestAnimationFrame(()=>{this.querySelectorAll("details.sub")[s]?.scrollIntoView({block:"nearest"})})});let o=document.createElement("p");return o.className="uitleg",o.textContent="Hangt hier iets onder, dan klapt deze knop een menu open BOVEN zichzelf in plaats van ergens heen te gaan. Valt de knop zelf achter de meer-knop, dan staan zijn subknoppen daar ingesprongen onder hem.",[n,i,r,o]}subItemBlok_(e,t,n,i){let r=document.createElement("details");r.className="sub",this.onthoud_(r,`i${n}s${i}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="voor";let d=document.createElement("span");d.className="titel";let l=document.createElement("b"),c=document.createElement("small");d.append(l,c);let p=()=>{s.innerHTML=v(t.icon,"grid"),l.textContent=t.name||(Ee(t)?t.path||"Zonder naam":"Nieuwe subknop"),c.textContent=t.path||"Nog geen pad"};p(),this.koppen_.push(p);let u=this.kopKnop_("Omhoog",E.arrowUp,()=>this.verplaatsSub_(e,n,i,-1));u.disabled=i===0;let g=this.kopKnop_("Omlaag",E.arrowDown,()=>this.verplaatsSub_(e,n,i,1));g.disabled=i===e.items.length-1;let h=this.kopKnop_("Verwijderen",E.close,()=>this.verwijderSub_(e,n,i));h.classList.add("weg"),o.append(s,d,u,g,h),r.appendChild(o);let f=document.createElement("div");f.className="body";let b=document.createElement("dac-icon-picker");b.label="Icoon",b.fallback="grid",b.auto=!1,b.hass=this.hass_,b.value=t.icon,b.addEventListener("value-changed",$=>{$.stopPropagation(),t.icon=$.detail.value??"",this.emit_()});let w=document.createElement("ha-form");return w.hass=this.hass_,w.schema=[{name:"name",selector:{text:{}}},{name:"path",selector:{text:{}}}],w.computeLabel=$=>({name:"Naam",path:"Waar gaat hij heen"})[$.name]??$.name,w.data={name:t.name,path:t.path},w.addEventListener("value-changed",$=>{$.stopPropagation();let j=$.detail.value??{};t.name=j.name??"",t.path=j.path??"",this.emit_()}),f.append(b,w),r.appendChild(f),r}verplaatsSub_(e,t,n,i){let r=n+i;if(r<0||r>=e.items.length)return;[e.items[n],e.items[r]]=[e.items[r],e.items[n]];let o=this.open_.has(`i${t}s${n}`),s=this.open_.has(`i${t}s${r}`);this.open_.delete(`i${t}s${n}`),this.open_.delete(`i${t}s${r}`),s&&this.open_.add(`i${t}s${n}`),o&&this.open_.add(`i${t}s${r}`),this.emit_(),this.build_()}verwijderSub_(e,t,n){e.items.splice(n,1);let i=new Set;for(let r of this.open_){let o=/^i(\d+)s(\d+)$/.exec(r);if(!o||Number(o[1])!==t){i.add(r);continue}let s=Number(o[2]);s!==n&&i.add(`i${t}s${s>n?s-1:s}`)}this.open_=i,this.emit_(),this.build_()}kopKnop_(e,t,n){let i=document.createElement("button");return i.type="button",i.className="rondknop",i.title=e,i.setAttribute("aria-label",e),i.innerHTML=t,i.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),i.disabled||n()}),i}verplaats_(e,t){let n=e+t;n<0||n>=this.items_.length||([this.items_[e],this.items_[n]]=[this.items_[n],this.items_[e]],this.schuifOpen_(e,n),this.emit_(),this.build_())}verwijder_(e){this.items_.splice(e,1);let t=new Set;for(let n of this.open_){let i=or.exec(n);if(!i)continue;let r=Number(i[1]);r!==e&&t.add(`i${r>e?r-1:r}${i[2]??""}`)}this.open_=t,this.emit_(),this.build_()}schuifOpen_(e,t){let n=new Set;for(let i of this.open_){let r=or.exec(i);if(!r)continue;let o=Number(r[1]),s=r[2]??"";o===e?n.add(`i${t}${s}`):o===t?n.add(`i${e}${s}`):n.add(i)}this.open_=n}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}emit_(){let e=lr(this.items_),t={...this.rest_,items:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_??[])n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};C("domotiapp-navbar-card-editor",da);var dr=a=>a.parentElement??(a.parentNode&&a.parentNode.host)??null;function*nt(a){let e=dr(a),t=0;for(;e&&t++<40;)yield e,e=dr(e)}function il(a){for(let e of nt(a)){let t=e.tagName?.toLowerCase?.()??"";if(/(^|-)(edit|preview)/.test(t))return!0}return!1}function rl(a){for(let e of nt(a))if(e.tagName?.toLowerCase?.()==="hui-card")return e;return null}function ol(a){for(let e of nt(a))if(e.tagName?.toLowerCase?.()==="hui-section")return e;return null}function sl(a){for(let e of nt(a))if(e.classList?.contains?.("section"))return e;return null}function cr(a){for(let e of nt(a)){let t=e.tagName?.toLowerCase?.()??"";if(t==="hui-view"||t.endsWith("-view"))return e}return null}var Ft=class extends A{validate(e){let t=ir(e),n={labels:!0,tone:"accent",...e,items:t,max:Ne(e?.max)};return t.filter(i=>i.name||i.icon||i.path).length||(n[T]="Voeg knoppen toe in de editor: een naam, een icoon en waar hij heen gaat."),n}watched(){return[]}template(){let e=this.config;e.labels===!1&&this.setAttribute("geen-namen",""),e.bare&&this.setAttribute("bare","");let{balk:t,meer:n,heeftMeer:i}=qt(e.items,e.max),r=e.items.filter(c=>c.name||c.icon||c.path),o=(c,p)=>{let g=je(c).length?` data-menu="s${p}" aria-haspopup="true" aria-expanded="false"`:"";return`
      <button type="button" class="knop" data-i="${p}" title="${K(c.name)}"${g}>
        <span class="ico">${v(c.icon,"grid")}</span>
        <span class="naam">${K(c.name)}</span>
      </button>`},s=(c,p,u=null,g="")=>`
      <button type="button" class="regel${g?` ${g}`:""}" data-i="${p}"${u===null?"":` data-s="${u}"`}>
        <span class="mi">${v(c.icon,"grid")}</span>
        <span class="mt">${K(c.name||c.path)}</span>
      </button>`,d=n.map(c=>{let p=r.indexOf(c),u=je(c);return u.length?`
      <div class="regel kop">
        <span class="mi">${v(c.icon,"grid")}</span>
        <span class="mt">${K(c.name||c.path)}</span>
      </div>`+u.map((h,f)=>s(h,p,f,"sub")).join(""):s(c,p)}).join(""),l=t.map(c=>{let p=je(c);if(!p.length)return"";let u=r.indexOf(c);return`<div class="menu submenu" data-id="s${u}" role="menu">${p.map((g,h)=>s(g,u,h)).join("")}</div>`}).join("");return`
      <div class="balk" style="--tone:${I(e.tone)}">
        ${t.map(c=>o(c,r.indexOf(c))).join("")}
        ${i?`<button type="button" class="knop meer" data-menu="meer" aria-expanded="false" aria-haspopup="true">
                 <span class="ico">${E.dots}</span>
                 <span class="naam">Meer</span>
               </button>`:""}
        ${l}
        <div class="menu meermenu" data-id="meer" role="menu">
          ${d}
        </div>
      </div>`}wire(){for(let e of this.$$(".knop[data-i], .regel[data-i]"))e.dataset.menu||this.on(e,"click",()=>{this.sluitMenus_(),this.ga_(Number(e.dataset.i),e.dataset.s)});for(let e of this.$$("[data-menu]"))this.on(e,"click",t=>{t.stopPropagation(),this.wisselMenu_(e)});this.on(window,"pointerdown",e=>{if(!this.ietsOpen_())return;let t=e.composedPath?.()??[];[...this.$$(".menu[open]"),...this.$$("[data-menu]")].some(i=>t.includes(i))||this.sluitMenus_()},!0),this.on(window,"keydown",e=>{e.key==="Escape"&&this.ietsOpen_()&&this.sluitMenus_()}),this.on(window,"location-changed",()=>this.sluitMenus_())}paint(){}ga_(e,t){let n=this.config.items.filter(r=>r.name||r.icon||r.path)[e];if(!n)return;let i=t===void 0?n:je(n)[Number(t)];i&&ue(this,this.hass,{},rr(i.path))}ietsOpen_(){return!!this.$(".menu[open]")}menuVan_(e){return this.$$(".menu").find(t=>t.dataset.id===e.dataset.menu)??null}wisselMenu_(e){let t=this.menuVan_(e),n=!!t?.hasAttribute("open");this.sluitMenus_(),!(!t||n)&&(t.setAttribute("open",""),e.setAttribute("aria-expanded","true"),this.plaatsMenu_(t,e))}sluitMenus_(){for(let e of this.$$(".menu[open]"))e.removeAttribute("open");for(let e of this.$$("[data-menu]"))e.setAttribute("aria-expanded","false")}plaatsMenu_(e,t){if(!e.classList.contains("submenu"))return;let n=this.$(".balk")?.getBoundingClientRect(),i=t.getBoundingClientRect();if(!n?.width)return;let r=e.offsetWidth/2,o=i.left+i.width/2-n.left,s=r+6,d=n.width-r-6,l=d<s?n.width/2:Math.min(Math.max(o,s),d);e.style.setProperty("--x",`${Math.round(l)}px`)}connectedCallback(){super.connectedCallback(),requestAnimationFrame(()=>this.plaats_())}disconnectedCallback(){super.disconnectedCallback(),this.herstel_()}plaats_(){if(!this.isConnected||!this.config)return;if(il(this)){this.setAttribute("in-editor","");return}this.removeAttribute("in-editor");let e=rl(this);this.klapIn_(e);let t=e?.parentElement;t?.classList?.contains?.("card")&&this.klapIn_(t);let n=ol(this);n?.config?.cards?.length===1&&this.klapIn_(sl(n));let i=cr(this),r=this.$(".balk");if(i&&r&&!this.viewStijl_){this.view_=i,this.viewStijl_=i.style.paddingBottom??"";let o=Math.round(r.getBoundingClientRect().height)||62;i.style.paddingBottom=`${o+32}px`}this.meetMidden_(),i&&!this.waarnemer_&&(this.waarnemer_=new ResizeObserver(()=>this.meetMidden_()),this.waarnemer_.observe(i))}meetMidden_(){let e=this.view_??cr(this);if(!e)return;let t=e.getBoundingClientRect();t.width&&this.style.setProperty("--dac-nav-mid",`${Math.round(t.left+t.width/2)}px`)}klapIn_(e){e&&(this.ingeklapt_??=new Map,!this.ingeklapt_.has(e)&&(this.ingeklapt_.set(e,e.getAttribute("style")),e.style.position="absolute",e.style.width="0",e.style.height="0",e.style.minHeight="0",e.style.margin="0",e.style.padding="0",e.style.overflow="visible"))}herstel_(){this.waarnemer_?.disconnect(),this.waarnemer_=null;for(let[e,t]of this.ingeklapt_??[])t?e.setAttribute("style",t):e.removeAttribute("style");this.ingeklapt_=null,this.view_&&(this.view_.style.paddingBottom=this.viewStijl_||"",this.view_=null,this.viewStijl_=null)}getCardSize(){return 1}getGridOptions(){return{columns:"full",rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-navbar-card-editor")}static getStubConfig(){return{items:[{name:"Thuis",icon:"house",path:""},{name:"Licht",icon:"bulb",path:""},{name:"Media",icon:"music",path:""},{name:"Instellingen",icon:"cog",path:""}],max:4,labels:!0}}};z(Ft,"css",`
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
  `);N("domotiapp-navbar-card",Ft,{name:"DomotiApp Navbalk",description:`Vaste navigatiebalk onderaan het scherm, met een meer-menu voor wat er in de breedte niet bij past. ${2} tot ${6} knoppen in de balk.`});var ll="dac-tabs:";function ha(a){let e=a??{},t=typeof e.name=="string"?e.name:typeof e.title=="string"?e.title:"",n=Array.isArray(e.cards)?e.cards.filter(r=>r&&typeof r=="object"):[],i=n.length?n:e.card&&typeof e.card=="object"?[e.card]:[];return{name:t,icon:typeof e.icon=="string"?e.icon:"",cards:i}}var Zt=a=>!!(a&&(a.name?.trim()||a.icon?.trim()||a.cards?.length));function pr(a){return(Array.isArray(a?.tabs)?a.tabs:[]).slice(0,8).map(ha).filter(Zt)}function dl(a,e){if(!e)return 0;let t=Math.round(Number(a?.default_tab));return!Number.isFinite(t)||t<1||t>e?0:t-1}function ua(a){let e=(a??[]).map((t,n)=>(t?.name?.trim()||t?.icon?.trim()||`tab${n}`).toLowerCase()).join("|");return ll+e}function cl(a,e,t){let n=null;try{n=a?.getItem?.(e)??null}catch{return null}let i=Number(n);return n===null||n===""||!Number.isInteger(i)?null:i>=0&&i<t?i:null}function hr(a,e,t){try{return a?.setItem?.(e,String(t)),!0}catch{return!1}}function ur(a,e,t){return cl(t,ua(e),e.length)??dl(a,e.length)}var pl=[["tile","Tegel"],["entities","Entiteiten"],["button","Knop"],["gauge","Meter"],["history-graph","Geschiedenis"],["statistic","Statistiek"],["sensor","Sensorgrafiek"],["light","Lamp"],["thermostat","Thermostaat"],["humidifier","Luchtbevochtiger"],["media-control","Mediaspeler"],["weather-forecast","Weersverwachting"],["markdown","Tekst (Markdown)"],["picture","Afbeelding"],["picture-entity","Afbeelding met entiteit"],["glance","Overzicht"],["area","Ruimte"],["alarm-panel","Alarmpaneel"],["calendar","Agenda"],["todo-list","Takenlijst"],["map","Kaart"],["iframe","Webpagina"],["vertical-stack","Stapel (onder elkaar)"],["horizontal-stack","Stapel (naast elkaar)"],["grid","Raster"],["conditional","Voorwaardelijk"]];function mr(){let a=(window.customCards??[]).filter(e=>e&&typeof e.type=="string").map(e=>({type:`custom:${e.type}`,naam:e.name||e.type,uitleg:e.description||"",eigen:!0}));return a.sort((e,t)=>{let n=e.type.startsWith("custom:domotiapp-")?0:1,i=t.type.startsWith("custom:domotiapp-")?0:1;return n-i||e.naam.localeCompare(t.naam,"nl")}),[...a,...pl.map(([e,t])=>({type:e,naam:t,uitleg:"",eigen:!1}))]}function gr(a,e){let t=String(e??"").trim().toLowerCase();return t?a.filter(n=>`${n.naam} ${n.type} ${n.uitleg}`.toLowerCase().includes(t)):a}async function fr(a,e){let t={type:a};try{let n=await window.loadCardHelpers?.();try{n?.createCardElement?.(t)}catch{}let i=a.startsWith("custom:")?a.slice(7):`hui-${a}-card`,o=await customElements.get(i)?.getStubConfig?.(e,Object.keys(e?.states??{}),[]);if(o&&typeof o=="object")return{...o,type:a}}catch{}return t}var br=()=>!!customElements.get("hui-card-element-editor");function vr(a,e,t={}){let n=Array.isArray(a)?[...a]:[],i=Number(t.index);switch(e){case"verplaats":{let r=Number(t.van),o=Number(t.naar);if(!Number.isInteger(r)||!Number.isInteger(o)||r<0||r>=n.length||o<0||o>=n.length||r===o)return null;let[s]=n.splice(r,1);return n.splice(o,0,s),n}case"dupliceer":return!Number.isInteger(i)||!n[i]?null:(n.splice(i+1,0,structuredClone(n[i])),n);case"verwijder":return!Number.isInteger(i)||!n[i]?null:(n.splice(i,1),n);case"rooster":return!Number.isInteger(i)||!n[i]||!t.rooster?null:(n[i]={...n[i],grid_options:{...n[i].grid_options??{},...t.rooster}},n);default:return null}}var kr=a=>({...a?{config:a}:{},editMode:!0,saveConfig:async()=>{}}),hl=()=>document.querySelector("home-assistant");function xr({kaarten:a,hass:e,maakKaart:t,opActie:n}){let i=document.createElement("ha-sortable");i.disabled=!1,i.draggableSelector=".dac-kaart",i.rollback=!1,i.invertSwap=!0,i.options={delay:100,delayOnTouchOnly:!0,direction:"vertical",invertedSwapThreshold:.7};let r=document.createElement("div");r.className="dac-kaarten";let o=[];a.forEach((l,c)=>{let p=t(l,c);if(!p)return;let u=document.createElement("div");u.className="dac-kaart";let g=document.createElement("hui-card-edit-mode");g.hass=e,g.lovelace=kr(),g.path=[0,0,c],g.hiddenOverlay=!1,g.appendChild(p),o.push(g),u.appendChild(g),r.appendChild(u)}),i.appendChild(r);let s=l=>{for(let c of o)c.hiddenOverlay=!l};i.addEventListener("drag-start",()=>s(!1)),i.addEventListener("drag-end",()=>s(!0)),i.addEventListener("item-moved",l=>{l.stopPropagation(),n("verplaats",{van:l.detail.oldIndex,naar:l.detail.newIndex})});let d={"ll-edit-card":l=>n("bewerk",{index:l.detail.path[2]}),"ll-duplicate-card":l=>n("dupliceer",{index:l.detail.path[2]}),"ll-delete-card":l=>n("verwijder",{index:l.detail.path[2]}),"ll-copy-card":l=>n("kopieer",{index:l.detail.path[2]}),"ll-change-grid-options":l=>n("rooster",{index:l.detail.path?.[2],rooster:l.detail.gridOptions}),"ll-move-to-section":()=>{}};for(let[l,c]of Object.entries(d))i.addEventListener(l,p=>{p.stopPropagation(),c(p)});return i}function _r(a){try{let e=typeof structuredClone=="function"?structuredClone(a):JSON.parse(JSON.stringify(a));return sessionStorage.setItem("dashboardCardClipboard",JSON.stringify(e)),!0}catch{return!1}}function wr({hass:a,kaarten:e}){let t=hl();return!t||!customElements.get("hui-section")?Promise.resolve(null):new Promise(n=>{let i=null,r=null,o=!1,s=()=>{o||(o=!0,t.removeEventListener("show-dialog",d,!0),window.removeEventListener("dialog-closed",l,!0),n(i?{kaart:i}:r?{kaarten:r}:null))},d=g=>{if(g?.detail?.dialogTag!=="hui-dialog-edit-card")return;let h=g.detail?.dialogParams?.cardConfig;g.stopImmediatePropagation?.(),g.stopPropagation(),h&&(i=h);let f=t.querySelector("hui-dialog-create-card");typeof f?.closeDialog=="function"&&f.closeDialog(),setTimeout(s,0)},l=g=>{g?.detail?.dialog==="hui-dialog-create-card"&&setTimeout(s,0)};t.addEventListener("show-dialog",d,!0),window.addEventListener("dialog-closed",l,!0);let c={type:"grid",cards:[...e]},p=document.createElement("hui-section");p.style.display="none",p.hass=a,p.index=0,p.viewIndex=0,p.config=c,p.lovelace={...kr({views:[{path:"domotiapp-kiezer",title:"DomotiApp",sections:[c]}]}),saveConfig:async g=>{let h=g?.views?.[0]?.sections?.[0]?.cards;Array.isArray(h)&&(r=h)}},t.appendChild(p),(async()=>{try{typeof p._initializeConfig=="function"?await p._initializeConfig():await p.updateComplete;let g=p._layoutElement;if(!g)throw new Error("de proxysectie heeft geen layout-element");g.dispatchEvent(new CustomEvent("ll-create-card",{bubbles:!0,composed:!0}))}catch(g){console.warn("DomotiApp: de kaartkiezer van Home Assistant ging niet open",g),s()}finally{setTimeout(()=>p.remove(),0)}})()})}var Xt=()=>!!(customElements.get("hui-card-edit-mode")&&customElements.get("ha-sortable")&&customElements.get("hui-section"));var ul=`
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
  .dac-tabs .voor svg, .dac-tabs .voor ha-icon {
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
  .dac-tabs .sub .voor svg, .dac-tabs .sub .voor ha-icon {
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
`,$r=a=>a.filter(Zt).map(e=>({...e.name?{name:e.name}:{},...e.icon?{icon:e.icon}:{},...e.cards?.length?{cards:e.cards.map(t=>structuredClone(t))}:{}}));function at(a){let e=String(a?.type??"").replace(/^custom:/,"");return e?(window.customCards??[]).find(n=>n?.type===e)?.name||e:"een kaart"}function ma(a){let e=a.cards?.length??0;return e?e===1?at(a.cards[0]):`${e} kaarten`:"Nog geen kaart"}var ga=class extends HTMLElement{constructor(){super(),this.tabs_=[],this.rest_={},this.open_=new Set}setConfig(e){if(this.rest_={...e},delete this.rest_.tabs,this.gebouwd_&&e===this.uitObject_)return;let t=(Array.isArray(e?.tabs)?e.tabs:[]).map(ha);this.gebouwd_&&JSON.stringify($r(t))===this.uit_||(this.tabs_=t,this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker, dac-tone-picker, hui-card-element-editor"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}set lovelace(e){this.lovelace_=e;for(let t of this.querySelectorAll("hui-card-element-editor"))t.lovelace=e}get lovelace(){return this.lovelace_}connectedCallback(){this.gebouwd_||this.build_()}async build_(){if(!this.hass_)return;if(await customElements.whenDefined("ha-form"),!this.helpers_)try{this.helpers_=await window.loadCardHelpers?.()}catch{this.helpers_=null}this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=ul;let t=document.createElement("div");t.className="dac-tabs",this.append(e,t),t.appendChild(this.kaartBlok_()),t.appendChild(this.kleurKiezer_());let n=document.createElement("div");n.className="lijst",t.appendChild(n),this.tabs_.forEach((r,o)=>n.appendChild(this.tabBlok_(r,o)));let i=document.createElement("button");i.type="button",i.className="toevoegen",i.textContent="\uFF0B  Tabblad toevoegen",i.disabled=this.tabs_.length>=8,i.addEventListener("click",()=>{this.tabs_.push({name:"",icon:"",cards:[]}),this.open_.add(`t${this.tabs_.length-1}`),this.emit_(),this.build_()}),t.appendChild(i)}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"default_tab",selector:{number:{min:1,max:8,step:1,mode:"box"}}},{name:"alignment",selector:{select:{mode:"dropdown",options:[{value:"vullen",label:"Verdeeld over de breedte"},{value:"links",label:"Links"},{value:"rechts",label:"Rechts"}]}}},{name:"show_names",selector:{boolean:{}}},{name:"bare",selector:{boolean:{}}}],e.computeLabel=t=>({default_tab:"Welk tabblad staat open op een nieuw apparaat",alignment:"Uitlijning van de rij",show_names:"Namen naast de iconen",bare:"Achtergrond weglaten"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="default_tab")return"Telt vanaf 1. Dit geldt alleen zolang een apparaat nog niets gekozen heeft \u2014 daarna onthoudt elk apparaat zijn eigen tabblad, en dat van je telefoon staat los van dat van de tablet.";if(t.name==="show_names")return"Uit geeft een rij kale iconen. Dan passen er meer naast elkaar op een telefoon.";if(t.name==="bare")return"Haalt het vlak onder de kaart weg. De rij tabbladen houdt zijn eigen pil."},e.data={default_tab:Number(this.rest_.default_tab)||1,alignment:this.rest_.alignment??"vullen",show_names:this.rest_.show_names!==!1,bare:!!this.rest_.bare},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{},i=Number(n.default_tab);Number.isFinite(i)&&i>1?this.rest_.default_tab=i:delete this.rest_.default_tab,n.alignment==="links"||n.alignment==="rechts"?this.rest_.alignment=n.alignment:delete this.rest_.alignment,n.show_names===!1?this.rest_.show_names=!1:delete this.rest_.show_names,n.bare?this.rest_.bare=!0:delete this.rest_.bare,this.emit_()}),e}kleurKiezer_(){let e=document.createElement("dac-tone-picker");return e.label="Kleur van het actieve tabblad",e.hass=this.hass_,e.value=this.rest_.tone??"accent",e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value;n&&n!=="accent"?this.rest_.tone=n:delete this.rest_.tone,this.emit_()}),e}tabBlok_(e,t){let n=document.createElement("details");n.className="tab",this.onthoud_(n,`t${t}`);let i=document.createElement("summary"),r=document.createElement("span");r.className="voor";let o=document.createElement("span");o.className="titel";let s=document.createElement("b"),d=document.createElement("small");o.append(s,d);let l=()=>{n.dataset.leeg=String(!Zt(e)),r.innerHTML=v(e.icon,"grid"),s.textContent=e.name||`Tabblad ${t+1}`,d.textContent=ma(e)};l(),this.koppen_.push(l);let c=this.kopKnop_("Omhoog",E.arrowUp,()=>this.verplaats_(t,-1));c.disabled=t===0;let p=this.kopKnop_("Omlaag",E.arrowDown,()=>this.verplaats_(t,1));p.disabled=t===this.tabs_.length-1;let u=this.kopKnop_("Verwijderen",E.close,()=>this.verwijder_(t));u.classList.add("weg"),i.append(r,o,c,p,u),n.appendChild(i);let g=document.createElement("div");g.className="body";let h=document.createElement("dac-icon-picker");h.label="Icoon",h.fallback="grid",h.auto=!1,h.hass=this.hass_,h.value=e.icon,h.addEventListener("value-changed",b=>{b.stopPropagation(),e.icon=b.detail.value??"",this.emit_()});let f=document.createElement("ha-form");return f.hass=this.hass_,f.schema=[{name:"name",selector:{text:{}}}],f.computeLabel=()=>"Naam",f.computeHelper=()=>"Deze naam bepaalt ook onder welke sleutel een apparaat zijn keuze onthoudt. Hernoem je hem, dan begint elk apparaat \xE9\xE9n keer opnieuw bij het eerste tabblad.",f.data={name:e.name},f.addEventListener("value-changed",b=>{b.stopPropagation(),e.name=b.detail.value?.name??"",this.emit_()}),g.append(h,f,this.inhoudBlok_(e,t)),n.appendChild(g),n}inhoudBlok_(e,t){let n=document.createElement("div");if(n.className="kaartvak",Array.isArray(e.cards)||(e.cards=[]),!br()){let r=document.createElement("div");return r.className="inhoud",r.innerHTML=`${v("grid")}<span>Inhoud: <b>${ma(e)}</b> \u2014 aan te passen via Code-editor weergeven.</span>`,n.appendChild(r),n}if(Xt()){let r=document.createElement("div");return r.className="inhoud",r.innerHTML=`${v("grid")}<span>${e.cards.length?`<b>${ma(e)}</b> \u2014 te bewerken in het voorbeeld hiernaast: slepen om te verplaatsen, het potlood om te bewerken.`:"Nog geen kaart \u2014 voeg er een toe in het voorbeeld hiernaast."}</span>`,n.appendChild(r),this.bewerkt_?.tab===t&&e.cards[this.bewerkt_.index]&&n.appendChild(this.bewerkVak_(e,t,this.bewerkt_.index)),n}if(e.cards.length){let r=document.createElement("div");r.className="subkop",r.textContent=e.cards.length===1?"Kaart":`${e.cards.length} kaarten`,n.appendChild(r),e.cards.forEach((o,s)=>n.appendChild(this.kaartBlok2_(e,o,t,s)))}if(this.kiest_===`t${t}`)return n.appendChild(this.kiezerBlok_(e,t)),n;let i=document.createElement("button");return i.type="button",i.className="toevoegen",i.textContent="\uFF0B  Kaart toevoegen",i.addEventListener("click",()=>{this.kiest_=`t${t}`,this.zoek_="",this.build_()}),n.appendChild(i),n}uitVoorbeeld(e,t,n){let i=this.tabs_[e];if(i){if(t==="toevoegen"){this.voegToeViaHa_(i,e);return}this.kaartActie_(i,e,t,n)}}toonBewerkVak_(){let e=this.querySelector(".bewerkvak"),t=this.bewerkt_?.tab,n=this.bewerkt_?.index,i=Number.isInteger(t)?this.tabs_[t]:null;if(!i||!i.cards[n]){e?.remove();return}let r=this.bewerkVak_(i,t,n);e?e.replaceWith(r):this.querySelectorAll(".kaartvak")[t]?.appendChild(r),r.scrollIntoView({block:"nearest"})}kaartActie_(e,t,n,i){if(n==="bewerk"){this.bewerkt_={tab:t,index:i.index},this.open_.add(`t${t}`);let o=this.querySelectorAll("details.tab")[t];o&&(o.open=!0),this.toonBewerkVak_();return}if(n==="kopieer"){_r(e.cards[i.index]);return}let r=vr(e.cards,n,i);r&&(e.cards=r,this.bewerkt_=null,this.emit_(),this.build_())}bewerkVak_(e,t,n){let i=document.createElement("div");i.className="bewerkvak";let r=document.createElement("div");r.className="kop";let o=document.createElement("b");o.textContent=at(e.cards[n]);let s=document.createElement("button");s.type="button",s.textContent="Klaar",s.addEventListener("click",()=>{this.bewerkt_=null,this.build_()}),r.append(o,s);let d=document.createElement("div");d.className="body";let l=document.createElement("hui-card-element-editor");return l.hass=this.hass_,this.lovelace_&&(l.lovelace=this.lovelace_),l.value=e.cards[n],l.addEventListener("config-changed",c=>{c.stopPropagation();let p=c.detail?.config;p&&(e.cards[n]=p,this.emit_(),o.textContent=at(p))}),l.addEventListener("GUImode-changed",c=>c.stopPropagation()),d.appendChild(l),i.append(r,d),i}async voegToeViaHa_(e,t){let n=await wr({hass:this.hass_,kaarten:e.cards});n&&(n.kaarten?(e.cards=n.kaarten,this.bewerkt_=null):(e.cards.push(n.kaart),this.bewerkt_={tab:t,index:e.cards.length-1}),this.open_.add(`t${t}`),this.emit_(),this.build_())}kaartBlok2_(e,t,n,i){let r=document.createElement("details");r.className="sub",this.onthoud_(r,`t${n}k${i}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="voor",s.innerHTML=v("grid");let d=document.createElement("span");d.className="titel";let l=document.createElement("b");l.textContent=at(t);let c=document.createElement("small");c.textContent=String(t?.type??""),d.append(l,c);let p=this.kopKnop_("Omhoog",E.arrowUp,()=>this.verplaatsKaart_(e,n,i,-1));p.disabled=i===0;let u=this.kopKnop_("Omlaag",E.arrowDown,()=>this.verplaatsKaart_(e,n,i,1));u.disabled=i===e.cards.length-1;let g=this.kopKnop_("Verwijderen",E.close,()=>this.verwijderKaart_(e,n,i));g.classList.add("weg"),o.append(s,d,p,u,g),r.appendChild(o);let h=document.createElement("div");h.className="body";let f=document.createElement("hui-card-element-editor");return f.hass=this.hass_,this.lovelace_&&(f.lovelace=this.lovelace_),f.value=t,f.addEventListener("config-changed",b=>{b.stopPropagation();let w=b.detail?.config;w&&(e.cards[i]=w,this.emit_(),l.textContent=at(w),c.textContent=String(w.type??""))}),f.addEventListener("GUImode-changed",b=>b.stopPropagation()),h.appendChild(f),r.appendChild(h),r}verplaatsKaart_(e,t,n,i){let r=n+i;if(r<0||r>=e.cards.length)return;[e.cards[n],e.cards[r]]=[e.cards[r],e.cards[n]];let o=this.open_.has(`t${t}k${n}`),s=this.open_.has(`t${t}k${r}`);this.open_.delete(`t${t}k${n}`),this.open_.delete(`t${t}k${r}`),s&&this.open_.add(`t${t}k${n}`),o&&this.open_.add(`t${t}k${r}`),this.emit_(),this.build_()}verwijderKaart_(e,t,n){e.cards.splice(n,1);let i=new Set;for(let r of this.open_){let o=new RegExp(`^t${t}k(\\d+)$`).exec(r);if(!o){i.add(r);continue}let s=Number(o[1]);s!==n&&i.add(`t${t}k${s>n?s-1:s}`)}this.open_=i,this.emit_(),this.build_()}kiezerBlok_(e,t){let n=document.createElement("div");n.className="kiezer";let i=document.createElement("input");i.type="text",i.placeholder="Zoek een kaart...",i.value=this.zoek_??"";let r=document.createElement("div");r.className="soorten";let o=()=>{let d=gr(mr(),this.zoek_);if(r.replaceChildren(),!d.length){let l=document.createElement("p");l.className="leeg",l.textContent="Niets gevonden. Kies iets anders, of gebruik de code-editor.",r.appendChild(l);return}for(let l of d){let c=document.createElement("button");c.type="button",c.className="soort";let p=document.createElement("b");p.textContent=l.naam;let u=document.createElement("small");u.textContent=l.uitleg||l.type,c.append(p,u),c.addEventListener("click",async()=>{e.cards.push(await fr(l.type,this.hass_)),this.kiest_=null,this.open_.add(`t${t}`),this.open_.add(`t${t}k${e.cards.length-1}`),this.emit_(),this.build_()}),r.appendChild(c)}};o(),i.addEventListener("input",()=>{this.zoek_=i.value,o()});let s=document.createElement("button");return s.type="button",s.className="toevoegen",s.textContent="Annuleren",s.addEventListener("click",()=>{this.kiest_=null,this.build_()}),n.append(i,r,s),n}kopKnop_(e,t,n){let i=document.createElement("button");return i.type="button",i.className="rondknop",i.title=e,i.setAttribute("aria-label",e),i.innerHTML=t,i.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),i.disabled||n()}),i}verplaats_(e,t){let n=e+t;if(n<0||n>=this.tabs_.length)return;[this.tabs_[e],this.tabs_[n]]=[this.tabs_[n],this.tabs_[e]];let i=this.open_.has(`t${e}`),r=this.open_.has(`t${n}`);this.open_.delete(`t${e}`),this.open_.delete(`t${n}`),r&&this.open_.add(`t${e}`),i&&this.open_.add(`t${n}`),this.emit_(),this.build_()}verwijder_(e){this.tabs_.splice(e,1);let t=new Set;for(let n of this.open_){let i=Number(n.slice(1));i!==e&&t.add(`t${i>e?i-1:i}`)}this.open_=t,this.emit_(),this.build_()}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}emit_(){let e=$r(this.tabs_),t={...this.rest_,tabs:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_??[])n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};C("domotiapp-tabs-card-editor",ga);var zr=a=>a.parentElement??(a.parentNode&&a.parentNode.host)??null;function*ml(a){let e=zr(a),t=0;for(;e&&t++<40;)yield e,e=zr(e)}function gl(a){let e=null;for(let n of ml(a))if((n.tagName?.toLowerCase?.()??"")==="hui-dialog-edit-card"){e=n;break}if(!e)return null;let t=(n,i=0)=>{if(!n||i>25)return null;if(n.tagName?.toLowerCase?.()==="domotiapp-tabs-card-editor")return n;for(let r of n.children??[]){let o=t(r,i+1);if(o)return o}if(n.shadowRoot)for(let r of n.shadowRoot.children){let o=t(r,i+1);if(o)return o}return null};return t(e)}var Yt=class extends A{constructor(){super(),this.kinderen_=new Map,this.open_=0}validate(e){let t=pr(e),n={tone:"accent",...e,tabs:t};return t.length||(n[T]="Voeg tabbladen toe: elk met een naam, een icoon en een kaart erin."),n}watched(){return[]}set hass(e){super.hass=e;for(let t of this.kinderen_.values())if(t)for(let n of t)n&&(n.hass=e)}get hass(){return super.hass}template(){let e=this.config;e.bare&&this.setAttribute("bare",""),e.show_names===!1&&this.setAttribute("geen-namen",""),(e.alignment==="links"||e.alignment==="rechts")&&this.setAttribute("uitgelijnd",e.alignment);let t=e.tabs.map((i,r)=>`
        <button type="button" class="tab" role="tab" data-i="${r}" aria-selected="false"
                title="${K(i.name)}">
          ${i.icon?`<span class="ic">${v(i.icon,"grid")}</span>`:""}
          <span class="nm">${K(i.name||`Tab ${r+1}`)}</span>
        </button>`).join(""),n=e.tabs.map((i,r)=>`<div class="vak" data-i="${r}" role="tabpanel"></div>`).join("");return`
      <div class="card surface" style="--tone:${I(e.tone)}">
        <div class="balk" role="tablist">${t}</div>
        <div class="vakken">${n}</div>
      </div>`}wire(){for(let e of this.$$(".tab"))this.on(e,"click",()=>this.kies_(Number(e.dataset.i)));this.teardown_.push(B(this.$(".card"))),this.kies_(ur(this.config,this.config.tabs,this.opslag_()),!1)}paint(){}opslag_(){try{return window.localStorage}catch{return null}}kies_(e,t=!0){let n=this.config.tabs;if(!n.length)return;let i=Math.min(Math.max(0,e),n.length-1);this.open_=i;for(let r of this.$$(".tab"))r.setAttribute("aria-selected",String(Number(r.dataset.i)===i));for(let r of this.$$(".vak"))r.dataset.open=String(Number(r.dataset.i)===i);t&&hr(this.opslag_(),ua(n),i),this.bouw_(i)}async bouw_(e){if(this.kinderen_.has(e)){O(this.$(".card"));return}let t=this.$(`.vak[data-i="${e}"]`),n=this.config.tabs[e];if(!(!t||!n)){if(!n.cards.length){t.innerHTML='<div class="leeg">Deze tab heeft nog geen kaart.</div>',O(this.$(".card"));return}this.kinderen_.set(e,null);try{let i=await window.loadCardHelpers?.();if(!i)throw new Error("loadCardHelpers ontbreekt");let r=n.cards.map(s=>{let d=i.createCardElement(s);return d.hass=this.hass,d});this.kinderen_.set(e,r);let o=gl(this);if(o&&Xt()){t.replaceChildren(xr({hass:this.hass,kaarten:n.cards,maakKaart:(s,d)=>r[d]??null,opActie:(s,d)=>o.uitVoorbeeld?.(e,s,d)}),this.voegToeKnop_(o,e)),O(this.$(".card"));return}t.replaceChildren(...r),O(this.$(".card"))}catch(i){this.kinderen_.delete(e),t.innerHTML=`<div class="leeg">Deze kaart kon niet geladen worden: ${K(i?.message??i)}</div>`,O(this.$(".card"))}}}voegToeKnop_(e,t){let n=document.createElement("button");return n.type="button",n.className="voegtoe",n.textContent="\uFF0B  Kaart toevoegen",n.addEventListener("click",i=>{i.stopPropagation(),e.uitVoorbeeld?.(t,"toevoegen",{})}),n}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-tabs-card-editor")}static getStubConfig(){return{tabs:[{name:"Woning",icon:"house",card:null},{name:"Weer",icon:"cloudSun",card:null}]}}};z(Yt,"css",`
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
    .vak[data-open="true"] { display: block; }

    /* De kaarten in een tab staan onder elkaar met dezelfde tussenruimte als
       Home Assistant zelf aanhoudt. */
    .vak > * + * { margin-top: 8px; }

    /* ---- het gereedschap in het voorbeeld van de kaarteditor ---- */

    .vak .dac-kaarten { display: flex; flex-direction: column; gap: 8px; }
    .vak .dac-kaart { position: relative; user-select: none; -webkit-user-select: none; }

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
  `);N("domotiapp-tabs-card",Yt,{name:"DomotiApp Tabbladen",description:"Meerdere kaarten achter tabbladen, met een rij knoppen erboven. De gekozen tab wordt per apparaat onthouden."});var P={UIT:"uit",KLAAR:"klaar",UITGESTELD:"uitgesteld",DRAAIT:"draait",PAUZE:"pauze",AF:"af",FOUT:"fout",ONBEKEND:"onbekend"},fl=[[P.FOUT,["error","fout","aborting","afgebroken"]],[P.DRAAIT,["run","active","washing","drying","rinsing","bezig","draait","on"]],[P.PAUZE,["pause","paused","pauze","onderbroken"]],[P.UITGESTELD,["delayedstart","delayed","scheduled","uitgesteld","wachten"]],[P.AF,["finished","complete","done","klaar met","afgelopen"]],[P.KLAAR,["ready","idle","standby","klaar","gereed"]],[P.UIT,["off","inactive","uit"]]],bl=new Set([P.DRAAIT]);function Er(a){let e=String(a??"").toLowerCase().trim();if(!e||e==="unknown"||e==="unavailable")return P.ONBEKEND;let t=e.split(/[^a-z0-9]+/).filter(Boolean);for(let[n,i]of fl)for(let r of i)if(r.includes(" ")?e.includes(r):t.includes(r))return n;return P.ONBEKEND}var Sr=a=>bl.has(Er(a?.state));function Ar(a,e=new Date){if(!a)return null;let t=String(a.state??"").trim();if(!t||t==="unknown"||t==="unavailable")return null;let n=a.attributes??{};if(n.device_class==="timestamp"||/^\d{4}-\d{2}-\d{2}[T ]/.test(t)){let s=new Date(t);return Number.isNaN(+s)?null:Math.max(0,Math.round((s-e)/6e4))}let i=t.match(/^(\d{1,3}):(\d{2})(?::(\d{2}))?$/);if(i)return Number(i[1])*60+Number(i[2])+(i[3]?Math.round(Number(i[3])/60):0);let r=Number(t);if(!Number.isFinite(r))return null;let o=String(n.unit_of_measurement??"min").toLowerCase();return o.startsWith("s")?Math.round(r/60):o.startsWith("h")||o.startsWith("u")?Math.round(r*60):Math.round(r)}function jr(a){if(a==null)return"";if(a<=0)return"Klaar";if(a<60)return`nog ${a} min`;let e=Math.floor(a/60),t=a%60;return t?`nog ${e} u ${t} min`:`nog ${e} uur`}function Mr(a){if(!a)return null;let e=String(a.state??"").trim();if(!e||e==="unknown"||e==="unavailable")return null;let t=Number(e);return Number.isFinite(t)?Math.min(100,Math.max(0,Math.round(t))):null}var vl=a=>!!a&&a.state==="on",Nr=a=>a===P.DRAAIT||a===P.PAUZE||a===P.UITGESTELD;function Tr({status:a,deur:e,rest:t,pct:n}={}){let i=Er(a?.state),r=vl(e);if(i===P.DRAAIT){let o=[];return t!=null?o.push(jr(t)):n!=null&&o.push(`${n}%`),{soort:i,tekst:o.length?`Draait \xB7 ${o.join(" ")}`:"Draait",tone:"accent",waarschuwing:""}}return i===P.PAUZE?{soort:i,tekst:"Gepauzeerd",tone:"warn",waarschuwing:r?"Klep open":""}:i===P.FOUT?{soort:i,tekst:"Storing",tone:"bad",waarschuwing:r?"Klep open":""}:i===P.AF?{soort:i,tekst:"Programma klaar",tone:"good",waarschuwing:""}:i===P.UITGESTELD?{soort:i,tekst:t!=null?`Start over ${jr(t).replace(/^nog /,"")}`:"Uitgestelde start",tone:"accent",waarschuwing:r?"Klep open":""}:r?{soort:i,tekst:"Klep open",tone:"warn",waarschuwing:""}:i===P.UIT?{soort:i,tekst:"Uit",tone:"neutral",waarschuwing:""}:i===P.KLAAR?{soort:i,tekst:"Klaar om te starten",tone:"neutral",waarschuwing:""}:{soort:P.ONBEKEND,tekst:"Niet bereikbaar",tone:"neutral",waarschuwing:""}}function Cr(a){let e=String(a??"");switch(e.split(".")[0]){case"button":return["button","press",{entity_id:e}];case"input_button":return["input_button","press",{entity_id:e}];case"script":return["script","turn_on",{entity_id:e}];case"scene":return["scene","turn_on",{entity_id:e}];case"switch":case"input_boolean":return["homeassistant","turn_on",{entity_id:e}];case"automation":return["automation","trigger",{entity_id:e}];default:return null}}var kl={good:M.good,warn:M.warn,bad:M.bad,neutral:M.neutral,accent:M.accent},Jt=class extends A{validate(e){let t={name:"",icon:"dishwasher",...e};return!t.status&&!t.remaining&&!t.progress&&!t.program&&(t[T]="Kies minstens een statussensor. Resterende tijd, voortgang, programma en de knoppen mogen daarna."),t}watched(){return[this.config.status,this.config.remaining,this.config.progress,this.config.program,this.config.door,this.config.smart,this.config.start,this.config.stop].filter(Boolean)}template(){this.config.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size";let t=(n,i,r)=>`
      <button type="button" class="knop ${n}" hidden>
        ${v(i)}<span class="lb">${K(r)}</span>
      </button>`;return`
      <div class="card surface" style="--tone:${M.accent}">
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
      </div>`}wire(){let e=this.config;this.on(this.$(".top"),"click",()=>{let t=e.status||e.remaining||e.program;t&&this.moreInfo_(t)}),this.on(this.$(".knop.start"),"click",()=>this.druk_(e.start)),this.on(this.$(".knop.stop"),"click",()=>this.druk_(e.stop)),this.on(this.$(".knop.slim"),"click",()=>{if(!e.smart)return;let t=ve(k(this.hass,e.smart));this.hass.callService("homeassistant",t?"turn_off":"turn_on",{entity_id:e.smart})}),this.on(this.$(".rij.programma"),"change",t=>{let n=t.target?.closest?.(".keuze");if(!n||!e.program)return;t.stopPropagation();let i=At(e.program,n.value,Ae(k(this.hass,e.program)));i&&this.hass.callService(i[0],i[1],i[2])}),this.teardown_.push(B(this.$(".card")))}moreInfo_(e){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0}))}druk_(e){let t=Cr(e);t&&this.hass.callService(t[0],t[1],t[2])}paint(){let e=this.config,t=k(this.hass,e.status),n=k(this.hass,e.door),i=Ar(k(this.hass,e.remaining)),r=Mr(k(this.hass,e.progress)),o=Tr({status:t,deur:n,rest:i,pct:r}),s=Sr(t);this.toggleAttribute("draait",s),this.toggleAttribute("onbekend",s&&r==null);let d=this.$(".top"),l=kl[o.tone]??M.accent;this.$(".card").style.setProperty("--tone",l),d.classList.toggle("unavailable",o.soort==="onbekend");let c=this.$(".chip"),p=e.icon||"dishwasher";c.dataset.icon!==p&&(c.dataset.icon=p,c.innerHTML=v(p,"dishwasher")),c.style.setProperty("--tone",l),this.text(".nm",e.name||R(this.hass,e.status,null)||"Vaatwasser");let u=this.$(".st"),g=K(o.tekst),h=o.waarschuwing?` &middot; <span class="let">${K(o.waarschuwing)}</span>`:"";u.dataset.tekst!==g+h&&(u.dataset.tekst=g+h,u.innerHTML=g+h),d.setAttribute("aria-label",`${this.$(".nm").textContent}, ${o.tekst}`);let f=this.$(".balk"),b=Nr(o.soort)&&(r!=null||s);if(f.hidden=!b,b){let w=this.$(".vul"),$=r!=null?`${r}%`:"";$&&w.style.width!==$&&(w.style.width=$),f.setAttribute("role","progressbar"),r!=null?(f.setAttribute("aria-valuenow",String(r)),f.setAttribute("aria-valuemin","0"),f.setAttribute("aria-valuemax","100")):f.removeAttribute("aria-valuenow")}this.paintBediening_(),O(this.$(".card"))}paintBediening_(){let e=this.config,t=this.$(".programslot"),n=k(this.hass,e.program),i=e.program?Ae(n):[],r=i.map(l=>Mt(l,this.hass?.formatEntityState?.(n,l))),o=JSON.stringify([i,r]);t.dataset.opties!==o&&(t.dataset.opties=o,t.innerHTML=i.length?`<select class="keuze" aria-label="Programma">${i.map((l,c)=>`<option value="${K(l)}">${K(r[c])}</option>`).join("")}</select>`:"");let s=t.querySelector(".keuze");if(s&&this.shadowRoot.activeElement!==s){let l=St(n);s.value!==l&&(s.value=l)}let d=this.$(".knop.slim");d.hidden=!e.smart,e.smart&&(d.dataset.aan=String(ve(k(this.hass,e.smart)))),this.$(".knop.start").hidden=!e.start,this.$(".knop.stop").hidden=!e.stop,this.$(".rij.programma").hidden=!s,this.$(".rij.knoppen").hidden=!e.smart&&!e.start&&!e.stop}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-dishwasher-card-editor")}static getStubConfig(e,t){return{status:((i,r)=>t?.find(o=>o.startsWith(i)&&r.test(o))??"")("sensor.",/vaatwas|dishwash/i),name:"Vaatwasser"}}};z(Jt,"css",`
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
  `);var fa=class extends L{defaults(){return{icon:"dishwasher"}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"dishwasher",auto:!1}]}schema(){return[{name:"name",selector:x.text()},{name:"status",selector:x.entity(["sensor","binary_sensor"])},{name:"remaining",selector:x.entity(["sensor"])},{name:"progress",selector:x.entity(["sensor","number"])},{name:"program",selector:x.entity(["select","input_select"])},{name:"start",selector:x.entity(["button","input_button","script","switch","automation"])},{name:"stop",selector:x.entity(["button","input_button","script","switch","automation"])},{name:"door",selector:x.entity(["binary_sensor"])},{name:"smart",selector:x.entity(["input_boolean","switch"])}]}label(e){return{name:"Naam",status:"Statussensor",remaining:"Resterende tijd",progress:"Voortgang (0-100%)",program:"Programmakeuze",start:"Start / pauze",stop:"Stop",door:"Klep- of deursensor",smart:"Slimme sturing"}[e.name]??super.label(e)}helper(e){return{status:"De sensor die Run, Ready, Finished of iets in die geest meldt. De kaart vertaalt dat zelf.",remaining:"Een tijdstip, een aantal minuten of een klok als 1:24:00 \u2014 alle drie worden gelezen. Een tijdstip is het moment waarop hij klaar is, geen duur.",progress:"Zonder deze sensor is er geen stand, en schuift er een streepje heen en weer zolang hij draait.",program:"Een keuzelijst met de programma's. Verschijnt als uitklaplijst op de kaart.",start:"Een knop, een script of een schakelaar \u2014 de kaart kiest zelf de juiste service.",stop:"Idem. Deze knop is rood, want hij onderbreekt iets dat loopt.",door:"Staat de klep open, dan zegt de kaart dat in plaats van 'klaar om te starten'.",smart:"De input_boolean van je eigen slimme sturing. De knop licht op als hij aanstaat."}[e.name]}};H("domotiapp-dishwasher-card-editor",fa);N("domotiapp-dishwasher-card",Jt,{name:"DomotiApp Vaatwasser",description:"Status, resterende tijd met voortgangsbalk, programmakeuze en de knoppen \u2014 met een balk die loopt zolang hij draait."});var Qt=globalThis,en=Qt.ShadowRoot&&(Qt.ShadyCSS===void 0||Qt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ba=Symbol(),Lr=new WeakMap,it=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==ba)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(en&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=Lr.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&Lr.set(t,e))}return e}toString(){return this.cssText}},ge=a=>new it(typeof a=="string"?a:a+"",void 0,ba),Q=(a,...e)=>{let t=a.length===1?a[0]:e.reduce((n,i,r)=>n+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+a[r+1],a[0]);return new it(t,a,ba)},Or=(a,e)=>{if(en)a.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let n=document.createElement("style"),i=Qt.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=t.cssText,a.appendChild(n)}},va=en?a=>a:a=>a instanceof CSSStyleSheet?(e=>{let t="";for(let n of e.cssRules)t+=n.cssText;return ge(t)})(a):a;var{is:xl,defineProperty:_l,getOwnPropertyDescriptor:wl,getOwnPropertyNames:yl,getOwnPropertySymbols:$l,getPrototypeOf:zl}=Object,tn=globalThis,Dr=tn.trustedTypes,jl=Dr?Dr.emptyScript:"",El=tn.reactiveElementPolyfillSupport,rt=(a,e)=>a,ka={toAttribute(a,e){switch(e){case Boolean:a=a?jl:null;break;case Object:case Array:a=a==null?a:JSON.stringify(a)}return a},fromAttribute(a,e){let t=a;switch(e){case Boolean:t=a!==null;break;case Number:t=a===null?null:Number(a);break;case Object:case Array:try{t=JSON.parse(a)}catch{t=null}}return t}},Hr=(a,e)=>!xl(a,e),Rr={attribute:!0,type:String,converter:ka,reflect:!1,useDefault:!1,hasChanged:Hr};Symbol.metadata??=Symbol("metadata"),tn.litPropertyMetadata??=new WeakMap;var fe=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Rr){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),i=this.getPropertyDescriptor(e,n,t);i!==void 0&&_l(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){let{get:i,set:r}=wl(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:i,set(o){let s=i?.call(this);r?.call(this,o),this.requestUpdate(e,s,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Rr}static _$Ei(){if(this.hasOwnProperty(rt("elementProperties")))return;let e=zl(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(rt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(rt("properties"))){let t=this.properties,n=[...yl(t),...$l(t)];for(let i of n)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[n,i]of t)this.elementProperties.set(n,i)}this._$Eh=new Map;for(let[t,n]of this.elementProperties){let i=this._$Eu(t,n);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let i of n)t.unshift(va(i))}else e!==void 0&&t.push(va(e));return t}static _$Eu(e,t){let n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Or(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:ka).toAttribute(t,n.type);this._$Em=e,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){let n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let r=n.getPropertyOptions(i),o=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:ka;this._$Em=i;let s=o.fromAttribute(t,r.type);this[i]=s??this._$Ej?.get(i)??s,this._$Em=null}}requestUpdate(e,t,n,i=!1,r){if(e!==void 0){let o=this.constructor;if(i===!1&&(r=this[e]),n??=o.getPropertyOptions(e),!((n.hasChanged??Hr)(r,t)||n.useDefault&&n.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:r},o){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),r!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[i,r]of n){let{wrapped:o}=r,s=this[i];o!==!0||this._$AL.has(i)||s===void 0||this.C(i,void 0,r,s)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};fe.elementStyles=[],fe.shadowRootOptions={mode:"open"},fe[rt("elementProperties")]=new Map,fe[rt("finalized")]=new Map,El?.({ReactiveElement:fe}),(tn.reactiveElementVersions??=[]).push("2.1.2");var ja=globalThis,Vr=a=>a,nn=ja.trustedTypes,Pr=nn?nn.createPolicy("lit-html",{createHTML:a=>a}):void 0,Gr="$lit$",Se=`lit$${Math.random().toFixed(9).slice(2)}$`,qr="?"+Se,Sl=`<${qr}>`,Le=document,st=()=>Le.createComment(""),lt=a=>a===null||typeof a!="object"&&typeof a!="function",Ea=Array.isArray,Al=a=>Ea(a)||typeof a?.[Symbol.iterator]=="function",xa=`[ 	
\f\r]`,ot=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ir=/-->/g,Kr=/>/g,Te=RegExp(`>|${xa}(?:([^\\s"'>=/]+)(${xa}*=${xa}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Br=/'/g,Ur=/"/g,Fr=/^(?:script|style|textarea|title)$/i,Sa=a=>(e,...t)=>({_$litType$:a,strings:e,values:t}),_=Sa(1),Kh=Sa(2),Bh=Sa(3),Oe=Symbol.for("lit-noChange"),y=Symbol.for("lit-nothing"),Wr=new WeakMap,Ce=Le.createTreeWalker(Le,129);function Zr(a,e){if(!Ea(a)||!a.hasOwnProperty("raw"))throw Error("invalid template strings array");return Pr!==void 0?Pr.createHTML(e):e}var Ml=(a,e)=>{let t=a.length-1,n=[],i,r=e===2?"<svg>":e===3?"<math>":"",o=ot;for(let s=0;s<t;s++){let d=a[s],l,c,p=-1,u=0;for(;u<d.length&&(o.lastIndex=u,c=o.exec(d),c!==null);)u=o.lastIndex,o===ot?c[1]==="!--"?o=Ir:c[1]!==void 0?o=Kr:c[2]!==void 0?(Fr.test(c[2])&&(i=RegExp("</"+c[2],"g")),o=Te):c[3]!==void 0&&(o=Te):o===Te?c[0]===">"?(o=i??ot,p=-1):c[1]===void 0?p=-2:(p=o.lastIndex-c[2].length,l=c[1],o=c[3]===void 0?Te:c[3]==='"'?Ur:Br):o===Ur||o===Br?o=Te:o===Ir||o===Kr?o=ot:(o=Te,i=void 0);let g=o===Te&&a[s+1].startsWith("/>")?" ":"";r+=o===ot?d+Sl:p>=0?(n.push(l),d.slice(0,p)+Gr+d.slice(p)+Se+g):d+Se+(p===-2?s:g)}return[Zr(a,r+(a[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},dt=class a{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let r=0,o=0,s=e.length-1,d=this.parts,[l,c]=Ml(e,t);if(this.el=a.createElement(l,n),Ce.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(i=Ce.nextNode())!==null&&d.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let p of i.getAttributeNames())if(p.endsWith(Gr)){let u=c[o++],g=i.getAttribute(p).split(Se),h=/([.?@])?(.*)/.exec(u);d.push({type:1,index:r,name:h[2],strings:g,ctor:h[1]==="."?wa:h[1]==="?"?ya:h[1]==="@"?$a:Ke}),i.removeAttribute(p)}else p.startsWith(Se)&&(d.push({type:6,index:r}),i.removeAttribute(p));if(Fr.test(i.tagName)){let p=i.textContent.split(Se),u=p.length-1;if(u>0){i.textContent=nn?nn.emptyScript:"";for(let g=0;g<u;g++)i.append(p[g],st()),Ce.nextNode(),d.push({type:2,index:++r});i.append(p[u],st())}}}else if(i.nodeType===8)if(i.data===qr)d.push({type:2,index:r});else{let p=-1;for(;(p=i.data.indexOf(Se,p+1))!==-1;)d.push({type:7,index:r}),p+=Se.length-1}r++}}static createElement(e,t){let n=Le.createElement("template");return n.innerHTML=e,n}};function Ie(a,e,t=a,n){if(e===Oe)return e;let i=n!==void 0?t._$Co?.[n]:t._$Cl,r=lt(e)?void 0:e._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(a),i._$AT(a,t,n)),n!==void 0?(t._$Co??=[])[n]=i:t._$Cl=i),i!==void 0&&(e=Ie(a,i._$AS(a,e.values),i,n)),e}var _a=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??Le).importNode(t,!0);Ce.currentNode=i;let r=Ce.nextNode(),o=0,s=0,d=n[0];for(;d!==void 0;){if(o===d.index){let l;d.type===2?l=new ct(r,r.nextSibling,this,e):d.type===1?l=new d.ctor(r,d.name,d.strings,this,e):d.type===6&&(l=new za(r,this,e)),this._$AV.push(l),d=n[++s]}o!==d?.index&&(r=Ce.nextNode(),o++)}return Ce.currentNode=Le,i}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}},ct=class a{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=y,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Ie(this,e,t),lt(e)?e===y||e==null||e===""?(this._$AH!==y&&this._$AR(),this._$AH=y):e!==this._$AH&&e!==Oe&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Al(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==y&&lt(this._$AH)?this._$AA.nextSibling.data=e:this.T(Le.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=dt.createElement(Zr(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{let r=new _a(i,this),o=r.u(this.options);r.p(t),this.T(o),this._$AH=r}}_$AC(e){let t=Wr.get(e.strings);return t===void 0&&Wr.set(e.strings,t=new dt(e)),t}k(e){Ea(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,n,i=0;for(let r of e)i===t.length?t.push(n=new a(this.O(st()),this.O(st()),this,this.options)):n=t[i],n._$AI(r),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let n=Vr(e).nextSibling;Vr(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Ke=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,r){this.type=1,this._$AH=y,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=y}_$AI(e,t=this,n,i){let r=this.strings,o=!1;if(r===void 0)e=Ie(this,e,t,0),o=!lt(e)||e!==this._$AH&&e!==Oe,o&&(this._$AH=e);else{let s=e,d,l;for(e=r[0],d=0;d<r.length-1;d++)l=Ie(this,s[n+d],t,d),l===Oe&&(l=this._$AH[d]),o||=!lt(l)||l!==this._$AH[d],l===y?e=y:e!==y&&(e+=(l??"")+r[d+1]),this._$AH[d]=l}o&&!i&&this.j(e)}j(e){e===y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},wa=class extends Ke{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===y?void 0:e}},ya=class extends Ke{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==y)}},$a=class extends Ke{constructor(e,t,n,i,r){super(e,t,n,i,r),this.type=5}_$AI(e,t=this){if((e=Ie(this,e,t,0)??y)===Oe)return;let n=this._$AH,i=e===y&&n!==y||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==y&&(n===y||i);i&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},za=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){Ie(this,e)}};var Nl=ja.litHtmlPolyfillSupport;Nl?.(dt,ct),(ja.litHtmlVersions??=[]).push("3.3.3");var Xr=(a,e,t)=>{let n=t?.renderBefore??e,i=n._$litPart$;if(i===void 0){let r=t?.renderBefore??null;n._$litPart$=i=new ct(e.insertBefore(st(),r),r,void 0,t??{})}return i._$AI(a),i};var Aa=globalThis,Z=class extends fe{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Xr(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Oe}};Z._$litElement$=!0,Z.finalized=!0,Aa.litElementHydrateSupport?.({LitElement:Z});var Tl=Aa.litElementPolyfillSupport;Tl?.({LitElement:Z});(Aa.litElementVersions??=[]).push("4.2.2");var oe=Q`
  :host {
    ${ge(ae)}
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  ${ge(be)}
`;var Cl=["unavailable","unknown"],Ll=["color_temp_kelvin","rgb_color","hs_color","xy_color"];function an({scene:a,memberEntityIds:e,states:t}){let n=[],i=[],r=a?.lights??{},o=Array.isArray(e)?e:[],s=t??{};for(let d of o){let l=r[d];if(!l||typeof l!="object")continue;let c=s[d];if(!c||Cl.includes(c.state)){i.push(d);continue}if(l.state==="off"){n.push({service:"turn_off",data:{entity_id:d,transition:1}});continue}let p={entity_id:d,transition:1};typeof l.brightness=="number"&&(p.brightness=l.brightness);for(let u of Ll)if(l[u]!==void 0){p[u]=l[u];break}n.push({service:"turn_on",data:p})}return{oproepen:n,overgeslagen:i}}async function rn(a,e){let t=await Promise.allSettled(e.map(i=>a(i.service,i.data))),n=[];return t.forEach((i,r)=>{i.status==="rejected"&&n.push({entityId:e[r].data.entity_id,fout:i.reason})}),n}var Na=["hs","rgb","rgbw","rgbww","xy"],Ta="color_temp",Ol="onoff";var De="kleur";var Dl=["unavailable","unknown"],Jr=["color_temp_kelvin","rgb_color","hs_color","xy_color"],Rl=[0,100];function ce(a){if(!a)return{bekend:!1,beschikbaar:!1,helderheid:!1,kleurtemp:!1,kleur:!1,minKelvin:2e3,maxKelvin:6535,kelvinUitDefaults:!1};let e=a.attributes??{},t=Array.isArray(e.supported_color_modes)?e.supported_color_modes:null,n=t!==null&&t.length===1&&t[0]===Ol,i=t!==null&&t.includes(Ta),r=t!==null&&t.some(l=>Na.includes(l)),o=e.min_color_temp_kelvin,s=e.max_color_temp_kelvin,d=typeof o=="number"&&typeof s=="number"&&o<s;return{bekend:!0,beschikbaar:!Dl.includes(a.state),helderheid:!n,kleurtemp:i,kleur:r,minKelvin:d?Math.round(o):2e3,maxKelvin:d?Math.round(s):6535,kelvinUitDefaults:i&&!d}}function Hl(){return{state:"off"}}function Qr(a,e){let t=e??ce(a);return t.bekend&&t.beschikbaar&&a.state==="on"?{state:"on",...Ul(a,t)}:t.helderheid?{state:"on",brightness:255}:{state:"on"}}function eo(a,e,t,n){return e?a&&a.state==="on"?{...a}:Qr(t,n):{state:"off"}}function to(a,e,t,n){let i=n??ce(t),r=Ha(a,t,i);return i.helderheid&&(r.brightness=D(e,1,255)),r}function Ca(a,e,t,n){let i=n??ce(t),r=Ha(a,t,i);return ho(r),r.color_temp_kelvin=D(e,i.minKelvin,i.maxKelvin),r}function La(a,e,t,n){let i=n??ce(t),r=Ha(a,t,i);return ho(r),r.hs_color=[D(e?.[0],0,360),D(e?.[1],0,100)],r}function on(a,e,t){return a??Hl()}function no(a,e,t){let n=on(a,e,t);if(typeof n.brightness=="number")return D(n.brightness,1,255);let i=e?.attributes?.brightness;return typeof i=="number"?D(i,1,255):255}function Oa(a,e,t){let n=t??ce(e),i=on(a,e,n);if(typeof i.color_temp_kelvin=="number")return D(i.color_temp_kelvin,n.minKelvin,n.maxKelvin);let r=e?.attributes?.color_temp_kelvin;return typeof r=="number"?D(r,n.minKelvin,n.maxKelvin):Math.round((n.minKelvin+n.maxKelvin)/2)}function sn(a,e,t){let n=on(a,e,t);if(Ma(n.hs_color))return[D(n.hs_color[0],0,360),D(n.hs_color[1],0,100)];let i=e?.attributes?.hs_color;return Ma(i)?[D(i[0],0,360),D(i[1],0,100)]:[...Rl]}function Da(a){return a!=null&&typeof a=="object"}function ao(a,e,t){let n=Array.isArray(e)?e:[],i=Array.isArray(a)?a:[],r=Number.isInteger(t)?t:i.length;return n.filter(o=>{for(let s=0;s<r;s+=1)if(!Da(i[s]?.lights?.[o]))return!0;return!1})}function io(a){return!Number.isInteger(a)||a<=0?null:a===1?"1 lamp nog niet ingesteld":`${a} lampen nog niet ingesteld`}function Ra(a,e,t){return on(a,e,t).state==="on"}function ro(a,e,t){let n=t??ce(e);if(!n.bekend)return{aanuit:!1,helderheid:!1,kleurtemp:!1,kleur:!1,kleurkeuze:!1,stand:null};let i=Ra(a,e,n),r=oo(n),o=r?Vl(a,e,n):null;return{aanuit:!0,helderheid:i&&n.helderheid,kleurtemp:i&&n.kleurtemp&&(!r||o==="wit"),kleur:i&&n.kleur&&(!r||o===De),kleurkeuze:i&&r,stand:i?o:null}}function oo(a){return!!(a?.kleurtemp&&a?.kleur)}function Vl(a,e,t){let n=t??ce(e);if(a&&typeof a=="object"){if(typeof a.color_temp_kelvin=="number")return"wit";if(Jr.slice(1).some(r=>a[r]!==void 0))return De}let i=e?.attributes?.color_mode;return i===Ta&&n.kleurtemp?"wit":Na.includes(i)&&n.kleur?De:"wit"}function so(a,e,t,n){let i=n??ce(t);return oo(i)?e==="wit"?Ca(a,Oa(a,t,i),t,i):La(a,sn(a,t,i),t,i):a}function lo(a){let e=D(a,0,255);return e<=0?0:Math.max(1,Math.round(e/255*100))}function co(a){let e=D(a,1,100);return D(Math.round(e/100*255),1,255)}var Pl=1e3,Il=4e4,Yr=7;function Kl(a){let e=D(a,Pl,Il)/100,t=e<=66?255:329.698727446*(e-60)**-.1332047592,n=e<=66?99.4708025861*Math.log(e)-161.1195681661:288.1221695283*(e-60)**-.0755148492,i;return e>=66?i=255:e<=19?i=0:i=138.5177312231*Math.log(e-10)-305.0447927307,[D(t,0,255),D(n,0,255),D(i,0,255)]}function Bl(a){let[e,t,n]=Kl(a);return`rgb(${e}, ${t}, ${n})`}function po(a,e){let t=Math.min(a,e),n=Math.max(a,e);return`linear-gradient(to right, ${Array.from({length:Yr},(r,o)=>{let s=o/(Yr-1),d=t+(n-t)*s;return`${Bl(d)} ${Math.round(s*100)}%`}).join(", ")})`}function Ul(a,e){let t=a.attributes??{},n={};e.helderheid&&(n.brightness=typeof t.brightness=="number"?D(t.brightness,1,255):255);let i=t.color_mode;return e.kleurtemp&&i===Ta&&typeof t.color_temp_kelvin=="number"?n.color_temp_kelvin=D(t.color_temp_kelvin,e.minKelvin,e.maxKelvin):e.kleur&&Na.includes(i)&&Ma(t.hs_color)&&(n.hs_color=[D(t.hs_color[0],0,360),D(t.hs_color[1],0,100)]),n}function Ha(a,e,t){return a&&a.state==="on"?{...a}:Qr(e,t)}function ho(a){for(let e of Jr)delete a[e]}function Ma(a){return Array.isArray(a)&&a.length===2&&typeof a[0]=="number"&&typeof a[1]=="number"}function D(a,e,t){let n=Number(a);return Number.isFinite(n)?Math.min(t,Math.max(e,Math.round(n))):e}var ln="domotiapp-scene-card",Va="domotiapp-scene-card-editor",uo="domotiapp-scene-editor";var pt=["een","twee","drie"],mo="pencil",go=["grid_options","layout_options","view_layout","visibility"];var fo="entity_id",Be=class extends Z{constructor(){super();z(this,"_label",t=>t.name==="entity"?"Lichtgroep":t.name==="bare"?"Achtergrond weglaten":this._friendlyName(t.name));z(this,"_helper",t=>t.name==="entity"?"De lichtgroep waarvan deze kaart de scenes beheert.":t.name==="bare"?"Haalt de vulling en de schaduw onder de kaart weg. De rand blijft staan.":t.name);this._getypt={}}setConfig(t){this._config={...t}}_lichtgroepen(){let t=this.hass?.states??{};return Object.keys(t).filter(n=>n.startsWith("light.")&&Array.isArray(t[n].attributes?.[fo]))}_leden(){let t=this._config?.entity,n=this.hass?.states?.[t]?.attributes?.[fo];return Array.isArray(n)?n.filter(i=>i!==t):[]}_entiteitSchema(){let t=this._lichtgroepen();return[{name:"entity",required:!0,selector:t.length?{entity:{include_entities:t}}:{entity:{domain:"light"}}},{name:"bare",selector:{boolean:{}}}]}_namenSchema(t){return t.map(n=>({name:n,selector:{text:{}}}))}_naamData(t){let n=this._config?.name_overrides??{},i={};for(let r of t)r in this._getypt?i[r]=this._getypt[r]:n[r]&&(i[r]=n[r]);return i}_friendlyName(t){return this.hass?.states?.[t]?.attributes?.friendly_name||t}_entiteitGewijzigd(t){t.stopPropagation();let n=t.detail.value??{},i={...this._config,entity:n.entity};n.bare?i.bare=!0:delete i.bare,i.entity!==this._config?.entity&&(delete i.name_overrides,this._getypt={}),this._stuurDoor(i)}_namenGewijzigd(t){t.stopPropagation(),this._getypt={...this._getypt,...t.detail.value};let n={};for(let[r,o]of Object.entries(this._getypt))typeof o=="string"&&o.trim()&&(n[r]=o.trim());let i={...this._config};Object.keys(n).length?i.name_overrides=n:delete i.name_overrides,this._stuurDoor(i)}_stuurDoor(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return y;let t=this._leden();return _`
      <ha-form
        .hass=${this.hass}
        .data=${{entity:this._config.entity??"",bare:!!this._config.bare}}
        .schema=${this._entiteitSchema()}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._entiteitGewijzigd}
      ></ha-form>

      ${t.length?_`
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
          `:y}
    `}};z(Be,"properties",{hass:{attribute:!1},_config:{state:!0},_getypt:{state:!0}}),z(Be,"styles",[oe,Q`
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
    `]);var Wl="domotiapp_lovelace/snapshot/create",Gl="domotiapp_lovelace/snapshot/close",dn=class{constructor({roepCommandoAan:e,entityId:t}){this._roep=e,this._entityId=t,this._aanmaak=null,this._afsluiting=null}get heeftSnapshot(){return this._aanmaak!==null}get isGesloten(){return this._afsluiting!==null}async zorgVoorSnapshot(){return this._aanmaak===null&&(this._aanmaak=this._roep(Wl,{entity_id:this._entityId}).catch(e=>{throw this._aanmaak=null,e})),this._aanmaak}async sluit({opslaan:e=!1}={}){return this.heeftSnapshot?this._afsluiting!==null?this._afsluiting:(this._afsluiting=(async()=>{try{await this._aanmaak}catch{return{gedaan:!1}}return await this._roep(Gl,{entity_id:this._entityId,restore:!e}),{gedaan:!0}})(),this._afsluiting):{gedaan:!1}}};async function bo({beheer:a,oproepen:e,voerUit:t}){return await a.zorgVoorSnapshot(),t(e)}var Ia="laden",Ka="klaar",vo="fout",Zl=`linear-gradient(to right, ${[0,60,120,180,240,300,360].map(a=>`hsl(${a}, 100%, 50%)`).join(", ")})`,Ue=class extends Z{constructor(){super(),this._scenes=null,this._leden=[],this._tab=0,this._toestand=Ia,this._melding="",this._bezig=!1,this._kelvinGemeld=new Set,this._snapshot=null}firstUpdated(){this._haalOp()}async _haalOp(){this._toestand=Ia;try{let e=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:this.entityId});return this._neemOver(e),this._toestand=Ka,e}catch(e){return this._melding=e?.message??String(e),this._toestand=vo,null}}_neemOver(e){this._scenes=Array.from({length:3},(t,n)=>{let i=e.scenes?.[n]??{};return{icon:i.icon||pt[n],lights:{...i.lights??{}}}}),this._leden=e.member_entity_ids??[],this._melding=""}_stateVan(e){return this.hass?.states?.[e]}_besturingVan(e){let t=ce(this._stateVan(e));return t.kelvinUitDefaults&&!this._kelvinGemeld.has(e)&&(this._kelvinGemeld.add(e),console.warn(`domotiapp-scene-editor: ${e} meldt geen Kelvin-grenzen; ${t.minKelvin}\u2013${t.maxKelvin} K aangehouden (SPEC 6.3).`)),t}_waardeVan(e){return this._scenes?.[this._tab]?.lights?.[e]}_zetLamp(e,t){this._scenes=this._scenes.map((n,i)=>{if(i!==this._tab)return n;let r={...n.lights};return t===void 0?delete r[e]:r[e]=t,{...n,lights:r}})}_zetIcoon(e){this._scenes=this._scenes.map((t,n)=>n===this._tab?{...t,icon:e||pt[n]}:t)}_kiesTab(e){this._tab=e}get _kanOpslaan(){return this._toestand===Ka&&!this._bezig&&this._leden.length>0}async _slaOp(){if(!this._kanOpslaan)return;this._bezig=!0,this._melding="";try{await this.hass.callWS({type:"domotiapp_lovelace/scenes/save",entity_id:this.entityId,scenes:this._scenes})}catch(t){this._melding=t?.message??String(t),this._bezig=!1;return}let e=await this._haalOp();this._bezig=!1,e&&this.dispatchEvent(new CustomEvent("scenes-opgeslagen",{detail:e,bubbles:!0,composed:!0})),this._sluit({opslaan:!0})}get _beheer(){return this._snapshot===null&&(this._snapshot=new dn({entityId:this.entityId,roepCommandoAan:(e,t)=>this.hass.callWS({type:e,...t})})),this._snapshot}get _kanVoorbeeld(){return this._toestand===Ka&&!this._bezig&&this._leden.length>0}async _voorbeeld(){if(!this._kanVoorbeeld)return;let{oproepen:e}=an({scene:this._scenes[this._tab],memberEntityIds:this._leden,states:this.hass.states});this._bezig=!0,this._melding="";try{let t=await bo({beheer:this._beheer,oproepen:e,voerUit:n=>rn((i,r)=>this.hass.callService("light",i,r),n)});t.length&&(this._melding=`Deze lampen reageerden niet: ${t.map(n=>this._naam(n.entityId)).join(", ")}.`)}catch(t){this._melding=`Het voorbeeld is niet gestart: ${t?.message??String(t)}`}finally{this._bezig=!1}}_sluit({opslaan:e=!1}={}){this.dispatchEvent(new CustomEvent("editor-gesloten",{bubbles:!0,composed:!0})),this._sluitSnapshot({opslaan:e})}async _sluitSnapshot({opslaan:e}){try{await this._beheer.sluit({opslaan:e})}catch(t){console.warn(`domotiapp-scene-editor: de snapshot kon niet worden ${e?"verwijderd":"hersteld"}: ${t?.message??t}`)}}disconnectedCallback(){super.disconnectedCallback(),this._snapshot&&this._snapshot.heeftSnapshot&&this._sluitSnapshot({opslaan:!1})}_dialoogGesloten(e){e.stopPropagation(),this._sluit()}_naam(e){return this.nameOverrides?.[e]||this._stateVan(e)?.attributes?.friendly_name||e}render(){return _`
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
    `}_renderInhoud(){return this._toestand===Ia?_`<div class="inhoud">Bezig met laden…</div>`:this._toestand===vo?_`
        <div class="inhoud">
          <ha-alert alert-type="error">${this._melding}</ha-alert>
        </div>
      `:_`
      <div class="inhoud">
        <ha-tab-group>
          ${this._scenes.map((e,t)=>_`
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

        ${this._melding?_`<ha-alert alert-type="error">${this._melding}</ha-alert>`:y}
        ${this._leden.length===0?_`<ha-alert alert-type="info">
              Deze lichtgroep bevat geen lampen.
            </ha-alert>`:_`<div class="lampen">
              ${this._leden.map(e=>this._renderLamp(e))}
            </div>`}
      </div>
    `}_renderLamp(e){let t=this._stateVan(e),n=this._besturingVan(e),i=this._waardeVan(e),r=Ra(i,t,n),o=ro(i,t,n);return _`
      <div class="lamp">
        <div class="kop">
          <div class="naam">
            <span class="tekst">
              ${this._naam(e)}
              ${n.bekend?n.beschikbaar?y:_`<span class="hint">niet bereikbaar</span>`:_`<span class="hint">lamp niet gevonden</span>`}
            </span>
            ${Da(i)?y:_`<span class="nieuw">nieuw</span>`}
          </div>
          ${n.bekend?_`
                <div class="bediening">
                  ${o.kleurkeuze?this._renderKleurkeuze(e,t,n,i,o.stand):y}
                  <ha-switch
                    .checked=${r}
                    @change=${s=>this._zetLamp(e,eo(i,s.target.checked,t,n))}
                  ></ha-switch>
                </div>
              `:y}
        </div>
        ${this._renderBesturing(e,t,n,i,o)}
      </div>
    `}_renderBesturing(e,t,n,i,r){return _`
      ${r.helderheid?this._renderHelderheid(e,t,n,i):y}
      ${r.kleurtemp?this._renderKleurtemp(e,t,n,i):y}
      ${r.kleur?this._renderKleur(e,t,n,i):y}
    `}_renderHelderheid(e,t,n,i){let r=lo(no(i,t,n)),o=s=>{s.stopPropagation(),this._zetLamp(e,to(this._waardeVan(e),co(s.detail.value),t,n))};return _`
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
    `}_renderKleurkeuze(e,t,n,i,r){let o=s=>d=>{d.stopPropagation(),s!==r&&this._zetLamp(e,so(this._waardeVan(e),s,t,n))};return _`
      <div class="kleurkeuze">
        <button
          class="keuze ${r===De?"actief":""}"
          aria-pressed=${r===De?"true":"false"}
          @click=${o(De)}
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
    `}_renderKleurtemp(e,t,n,i){let r=Oa(i,t,n),o=s=>{s.stopPropagation(),this._zetLamp(e,Ca(this._waardeVan(e),s.detail.value,t,n))};return _`
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
          style=${`--control-slider-background: ${po(n.minKelvin,n.maxKelvin)}; --control-slider-background-opacity: 1`}
          @slider-moved=${o}
          @value-changed=${o}
        ></ha-control-slider>
      </div>
    `}_renderKleur(e,t,n,i){let[r,o]=sn(i,t,n),s=d=>l=>{l.stopPropagation();let c=sn(this._waardeVan(e),t,n),p=d==="tint"?[l.detail.value,c[1]]:[c[0],l.detail.value];this._zetLamp(e,La(this._waardeVan(e),p,t,n))};return _`
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
              style=${`--control-slider-background: ${Zl}; --control-slider-background-opacity: 1`}
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
    `}};z(Ue,"properties",{hass:{attribute:!1},entityId:{attribute:!1},nameOverrides:{attribute:!1},_scenes:{state:!0},_leden:{state:!0},_tab:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0}}),z(Ue,"styles",[oe,Q`
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
    `]);var Xl="0.15.0",Yl=["type","entity","name_overrides","bare"],Ba="laden",ht="klaar",Ua="leeg",Wa="geen-groep",ko="opslagfout",xo="fout",ut=class extends Z{constructor(){super(),this._scenes=null,this._leden=[],this._toestand=Ba,this._melding="",this._bezig=!1,this._editorOpen=!1,this._opgehaaldVoor=null,this._bestondVorigeKeer=!1}static getConfigElement(){return document.createElement(Va)}static getStubConfig(e){return{entity:Object.keys(e?.states??{}).find(n=>n.startsWith("light.")&&Array.isArray(e.states[n].attributes?.entity_id))??""}}updated(){let e=this.renderRoot?.querySelector(".card, .needs");e!==this._rasterVak&&(this._rasterUit?.(),this._rasterVak=e,this._rasterUit=e?B(e):null),O(e)}disconnectedCallback(){super.disconnectedCallback(),this._rasterUit?.(),this._rasterUit=null,this._rasterVak=null}setConfig(e){if(!e?.entity)throw new Error("Kies een lichtgroep bij 'entity'.");let t=Object.keys(e).filter(n=>!Yl.includes(n)&&!go.includes(n));t.length&&console.warn(`${ln}: onbekende sleutels in de configuratie: ${t.join(", ")}`),this._config=e,this.toggleAttribute("bare",!!e.bare)}getCardSize(){return 1}getGridOptions(){return{rows:"auto",columns:"full",min_columns:6,min_rows:He(this.renderRoot?.querySelector?.(".card"))??1}}willUpdate(){let e=this._config?.entity;if(!this.hass||!e)return;let t=!!this.hass.states[e];if(this._opgehaaldVoor!==e){this._opgehaaldVoor=e,this._bestondVorigeKeer=t,this._haalScenesOp();return}if(t&&!this._bestondVorigeKeer&&this._toestand===Wa){this._bestondVorigeKeer=!0,this._haalScenesOp();return}this._bestondVorigeKeer=t}async _haalScenesOp(){let e=this._config.entity;this._toestand=Ba,this._melding="";try{let t=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:e});this._scenes=t.scenes,this._leden=t.member_entity_ids??[],this._toestand=this._leden.length===0?Ua:ht}catch(t){this._verwerkFout(t,e)}}_verwerkFout(e,t){let n=e?.code;if(this._melding=e?.message??String(e),n==="home_assistant_error"){this._toestand=ko;return}if(!this.hass.states[t]){this._toestand=Wa;return}this._toestand=xo}_naam(e){return this._config?.name_overrides?.[e]||this.hass?.states?.[e]?.attributes?.friendly_name||e}async _pasSceneToe(e){if(this._bezig||this._toestand!==ht)return;let{oproepen:t}=an({scene:this._scenes?.[e],memberEntityIds:this._leden,states:this.hass.states});if(t.length){this._bezig=!0;try{let n=await rn((i,r)=>this.hass.callService("light",i,r),t);n.length&&this._meldMislukking(n.map(i=>i.entityId))}finally{this._bezig=!1}}}_meldMislukking(e){let t=e.map(i=>this._naam(i)).join(", "),n=e.length===1?`${t} reageerde niet.`:`Deze lampen reageerden niet: ${t}.`;this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:n},bubbles:!0,composed:!0}))}_bewerk(){this._toestand===ht&&(this._editorOpen=!0)}_sluitEditor(){this._editorOpen=!1}_scenesOpgeslagen(e){e.stopPropagation(),this._scenes=e.detail.scenes,this._leden=e.detail.member_entity_ids??[],this._toestand=this._leden.length===0?Ua:ht}render(){if(!this._config)return y;switch(this._toestand){case Wa:return this._renderFout(`Lichtgroep ${this._config.entity} bestaat niet (meer). Pas de kaart aan.`);case ko:return this._renderFout("De opgeslagen scenes van deze kamer zijn onleesbaar.",this._melding);case xo:return this._renderFout("De scenes konden niet geladen worden.",this._melding);default:return this._renderKaart()}}_renderFout(e,t){return _`
      <div class="needs">
        <span class="mark">${this._icoon("question")}</span>
        <span>
          <b>${e}</b>
          ${t?_`<span class="detail">${t}</span>`:y}
        </span>
      </div>
    `}_icoon(e){let t=document.createElement("template");return t.innerHTML=v(e),t.content.cloneNode(!0)}_renderKaart(){let e=this._toestand===Ua,t=this._toestand===Ba,n=this._iconen();return _`
      <div class="card surface">
        <div class="rij">
          <div class="scenes">
            ${n.map((i,r)=>_`
                <button
                  type="button"
                  class="chip"
                  ?disabled=${e||t||this._bezig}
                  aria-label=${`Scene ${r+1}`}
                  title=${`Scene ${r+1}`}
                  @click=${()=>this._pasSceneToe(r)}
                >
                  ${this._icoon(i)}
                </button>
              `)}
          </div>
          <span class="scheiding"></span>
          <button
            type="button"
            class="chip potlood"
            ?disabled=${e||t}
            aria-label="Scenes bewerken"
            title="Scenes bewerken"
            @click=${this._bewerk}
          >
            ${this._icoon(mo)}
          </button>
        </div>
        ${e?_`<div class="mededeling">Deze lichtgroep bevat geen lampen.</div>`:this._renderNieuweLampen()}
      </div>
      ${this._editorOpen?this._renderEditor():y}
    `}_renderNieuweLampen(){if(this._toestand!==ht)return y;let e=ao(this._scenes,this._leden,3).length,t=io(e);return t?_`<div class="mededeling">${t}</div>`:y}_renderEditor(){return _`
      <domotiapp-scene-editor
        .hass=${this.hass}
        .entityId=${this._config.entity}
        .nameOverrides=${this._config.name_overrides}
        @editor-gesloten=${this._sluitEditor}
        @scenes-opgeslagen=${this._scenesOpgeslagen}
      ></domotiapp-scene-editor>
    `}_iconen(){return Array.from({length:3},(e,t)=>this._scenes?.[t]?.icon||pt[t])}};z(ut,"properties",{hass:{attribute:!1},_config:{state:!0},_scenes:{state:!0},_leden:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0},_editorOpen:{state:!0}}),z(ut,"styles",[oe,Q`
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
    `]);C(ln,ut);C(Va,Be);C(uo,Ue);Ve({type:ln,name:"DomotiApp Scene",description:`Drie lichtscenes per kamer, vastgelegd bij de lichtgroep (v${Xl}).`,preview:!1});var Re="domotiapp-alarm-card",Ga="domotiapp-alarm-card-editor",_o="domotiapp-alarm-editor",wo="DomotiApp Wekker",yo="https://github.com/Sven2410/domotiapp-lovelace",pe="domotiapp_lovelace",ie=Object.freeze({get:`${pe}/alarms/get`,save:`${pe}/alarms/save`,setEnabled:`${pe}/alarms/set_enabled`,delete:`${pe}/alarms/delete`,stop:`${pe}/alarms/stop`,clearMessage:`${pe}/alarms/clear_message`,search:`${pe}/sound/search`,entities:`${pe}/entities/list`,previewStart:`${pe}/preview/start`,subscribe:`${pe}/updates/subscribe`}),pn="#026FA1";function $o(a){let e=typeof a?.name=="string"?a.name.trim():"",t=typeof a?.time=="string"?a.time.trim():"";return e&&t?`Wil je de wekker "${e}" van ${t} verwijderen?`:e?`Wil je de wekker "${e}" verwijderen?`:t?`Wil je de wekker van ${t} verwijderen?`:"Wil je deze wekker verwijderen?"}var Jl="07:00";var Ql=["uri","name","media_type","image"],ed="Let op: deze tijd bestaat twee nachten per jaar niet, of twee keer. Bij de overgang naar zomertijd wordt het uur van 02:00 tot 03:00 overgeslagen; die nacht gaat deze wekker niet af. Bij de overgang naar wintertijd komt dat uur twee keer voorbij; die nacht gaat hij twee keer af. Kies een tijd v\xF3\xF3r 02:00 of n\xE1 03:00 als dat een probleem is.",td="Dit geluid stopt van zichzelf. Een los nummer is na een paar minuten voorbij; daarna is het stil. Kies een afspeellijst of een radiostation als de wekker moet blijven spelen tot je hem uitzet.";var nd="Music Assistant Wekker",ad="Verlichting Wekker";function hn(){return{id:null,name:"",time:Jl,days:[],enabled:!0,sound:null,endless:null,speaker:"",volume_pct:40,light:null}}function zo(a){let e=hn();return!a||typeof a!="object"?e:{id:typeof a.id=="string"?a.id:null,name:typeof a.name=="string"?a.name:"",time:qa(a.time)?a.time:e.time,days:Array.isArray(a.days)?[...a.days]:[],enabled:a.enabled!==!1,sound:mt(a.sound),endless:null,speaker:typeof a.speaker=="string"?a.speaker:"",volume_pct:Number.isInteger(a.volume_pct)?a.volume_pct:e.volume_pct,light:a.light&&typeof a.light=="object"?{entity_id:a.light.entity_id,brightness_pct:Number.isInteger(a.light.brightness_pct)?a.light.brightness_pct:60}:null}}function mt(a){if(!a||typeof a!="object"||Array.isArray(a)||typeof a.uri!="string"||!a.uri)return null;let e={};for(let t of Ql)e[t]=a[t]===void 0?null:a[t];return e}function qa(a){if(typeof a!="string"||a.length!==5||a[2]!==":")return!1;let e=Number(a.slice(0,2)),t=Number(a.slice(3));return!/^\d\d$/.test(a.slice(0,2))||!/^\d\d$/.test(a.slice(3))?!1:e>=0&&e<=23&&t>=0&&t<=59}function Fa(a){let e=[];return!a||typeof a!="object"?{ok:!1,ontbreekt:["alles"]}:((typeof a.name!="string"||!a.name.trim())&&e.push("een naam"),qa(a.time)||e.push("een geldige tijd"),a.speaker||e.push("een speaker"),(!a.sound||!a.sound.uri)&&e.push("een geluid"),(!Number.isInteger(a.volume_pct)||a.volume_pct<1||a.volume_pct>100)&&e.push("een volume tussen 1 en 100"),{ok:e.length===0,ontbreekt:e})}function jo(a){let e=[...new Set(a.days||[])].sort((n,i)=>n-i),t={name:(a.name||"").trim(),time:a.time,days:e,enabled:e.length===0?!0:a.enabled!==!1,sound:mt(a.sound),speaker:a.speaker,volume_pct:a.volume_pct,light:a.light?{entity_id:a.light.entity_id,brightness_pct:a.light.brightness_pct}:null};return a.id&&(t.id=a.id),t}function Eo(a,e){let t=new Set(a||[]);return t.has(e)?t.delete(e):t.add(e),[...t].sort((n,i)=>n-i)}function So(a){return qa(a)&&a.slice(0,2)==="02"?ed:null}function Ao(a){return a===!1?td:null}function Mo(a){return typeof a?.endless=="boolean"?a.endless:null}function un(a,e){let t=e==="lamp",n=t?ad:nd,i=t?"lampen":"speakers";return!a||typeof a!="object"?`De lijst met ${i} is niet op te halen.`:a.label_exists===!1?`Het label '${n}' bestaat nog niet. De beheerder moet dat label aanmaken en op de ${i} zetten die als wekker mogen dienen.`:Array.isArray(a.entities)&&a.entities.length>0?null:Number(a.filtered_out)>0?t?`De entiteiten met het label '${n}' zijn geen lampen.`:"De gelabelde speakers zijn geen Music Assistant-speakers, of ze kunnen geen volume instellen.":`Er zijn nog geen ${i} met het label '${n}'.`}function No(a,e){return un(e,"speaker")!==null?!1:Fa(a).ok}var rd=[[1,"ma"],[2,"di"],[3,"wo"],[4,"do"],[5,"vr"],[6,"za"],[7,"zo"]],od=[["","Alles"],["playlist","Afspeellijsten"],["radio","Radio"],["artist","Artiesten"],["album","Albums"],["track","Nummers"],["podcast","Podcasts"]],gt="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",sd="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",ld="M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z",We=class extends Z{constructor(){super(),this._concept=hn(),this._zoekterm="",this._soort="",this._treffers=null,this._zoekt=!1,this._melding=null,this._speelt=!1,this._bezig=!1,this._afmeldenVoorbeeld=null,this._opEscape=e=>{e.key==="Escape"&&this._annuleren()}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this._opEscape,!0)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this._opEscape,!0),this._stopVoorbeeld()}willUpdate(e){e.has("wekker")&&(this._concept=this.wekker?zo(this.wekker):hn(),this._treffers=null,this._zoekterm="",this._melding=null)}_zet(e){this._concept={...this._concept,...e}}async _startVoorbeeld(){if(!(this._speelt||!this.hass)){if(!this._concept.speaker||!this._concept.sound){this._melding={tekst:"Kies eerst een speaker en een geluid.",fout:!0};return}this._melding=null;try{this._afmeldenVoorbeeld=await this.hass.connection.subscribeMessage(()=>{},{type:ie.previewStart,speaker:this._concept.speaker,sound:mt(this._concept.sound),volume_pct:this._concept.volume_pct,light:this._concept.light??null}),this._speelt=!0}catch(e){this._melding={tekst:e?.message??"Het voorbeeld kon niet starten.",fout:!0}}}}_stopVoorbeeld(){if(this._afmeldenVoorbeeld){try{this._afmeldenVoorbeeld()}catch(e){console.warn(`domotiapp-alarm-editor: afmelden mislukt: ${e?.message??e}`)}this._afmeldenVoorbeeld=null}this._speelt=!1}async _zoek(){let e=(this._zoekterm||"").trim();if(!(!e||!this.hass)){this._zoekt=!0,this._melding=null;try{let t={type:ie.search,query:e,limit:20};this._soort&&(t.media_types=[this._soort]);let n=await this.hass.callWS(t);this._treffers=n.results??[]}catch(t){this._treffers=[],this._melding={tekst:t?.message??"Zoeken is mislukt.",fout:!0}}finally{this._zoekt=!1}}}_kiesGeluid(e){this._zet({sound:mt(e),endless:Mo(e)}),this._treffers=null}async _opslaan(){if(this._bezig||!this.hass)return;let e=Fa(this._concept);if(!e.ok){this._melding={tekst:`Er ontbreekt nog ${e.ontbreekt.join(", ")}.`,fout:!0};return}this._bezig=!0;try{let t=await this.hass.callWS({type:ie.save,person:this.person,alarm:jo(this._concept)});this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-opgeslagen",{detail:{toestand:t},bubbles:!0,composed:!0}))}catch(t){this._melding={tekst:t?.message??"Opslaan is mislukt.",fout:!0}}finally{this._bezig=!1}}_annuleren(){this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-dicht",{bubbles:!0,composed:!0}))}_svg(e){return _`<svg class="icoon" viewBox="0 0 24 24" aria-hidden="true">
      <path d=${e} />
    </svg>`}render(){if(!this.hass)return y;let e=this._concept,t=this.entiteiten?.speakers,n=this.entiteiten?.lights,i=un(t,"speaker"),r=un(n,"lamp"),o=So(e.time),s=Ao(e.endless),d=No(e,t);return _`
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
        ${o?_`<div class="waarschuwing">
              ${this._svg(gt)}<span>${o}</span>
            </div>`:y}
      </div>

      <div class="blok">
        <label class="veld">Herhaling</label>
        <div class="dagen">
          ${rd.map(([l,c])=>_`<button
              type="button"
              aria-pressed=${e.days.includes(l)?"true":"false"}
              aria-label=${c}
              @click=${()=>this._zet({days:Eo(e.days,l)})}
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
        ${i?_`<div class="uitleg">${this._svg(gt)}<span>${i}</span></div>`:_`<div class="vak">
              <select
                id="speaker"
                .value=${e.speaker}
                @change=${l=>this._zet({speaker:l.target.value})}
              >
                <option value="">Kies een speaker…</option>
                ${(t?.entities??[]).map(l=>_`<option value=${l.entity_id} ?selected=${l.entity_id===e.speaker}>
                    ${l.name}
                  </option>`)}
              </select>
            </div>`}
      </div>

      <div class="blok">
        <label class="veld" for="zoek">Geluid</label>
        ${e.sound?_`<div class="gekozen">
              ${e.sound.image?_`<img src=${e.sound.image} alt="" />`:y}
              <span>${e.sound.name||e.sound.uri}</span>
              <span class="soort" style="margin-left:auto">${e.sound.media_type??""}</span>
            </div>`:y}
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
              ${od.map(([l,c])=>_`<option value=${l}>${c}</option>`)}
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
            ${this._svg(this._zoekt?ld:sd)}
          </button>
        </div>
        ${this._treffers?_`<div class="treffers">
              ${this._treffers.length===0?_`<div class="treffer">Niets gevonden.</div>`:this._treffers.map(l=>_`<button
                      class="treffer"
                      type="button"
                      @click=${()=>this._kiesGeluid(l)}
                    >
                      ${l.image?_`<img src=${l.image} alt="" />`:y}
                      <span>${l.name}</span>
                      <span class="soort">${l.media_type??""}</span>
                    </button>`)}
            </div>`:y}
        ${s?_`<div class="waarschuwing">${this._svg(gt)}<span>${s}</span></div>`:y}
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
        ${r?_`<div class="uitleg">${this._svg(gt)}<span>${r}</span></div>`:_`
              <div class="vak">
                <select
                  id="lamp"
                  @change=${l=>this._zet({light:l.target.value?{entity_id:l.target.value,brightness_pct:e.light?.brightness_pct??60}:null})}
                >
                  <option value="">Geen lamp</option>
                  ${(n?.entities??[]).map(l=>_`<option
                      value=${l.entity_id}
                      ?selected=${l.entity_id===e.light?.entity_id}
                    >
                      ${l.name}
                    </option>`)}
                </select>
              </div>
              ${e.light?_`<label class="veld" style="margin-top:10px" for="helderheid">
                      Helderheid: ${e.light.brightness_pct}%
                    </label>
                    <input
                      id="helderheid"
                      type="range"
                      min="1"
                      max="100"
                      .value=${String(e.light.brightness_pct)}
                      @input=${l=>this._zet({light:{...e.light,brightness_pct:Number(l.target.value)}})}
                    />`:y}
            `}
      </div>

      ${this._melding?_`<div class="blok">
            <div class="waarschuwing ${this._melding.fout?"fout":""}">
              ${this._svg(gt)}<span>${this._melding.tekst}</span>
            </div>
          </div>`:y}

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
    `}};z(We,"properties",{hass:{attribute:!1},person:{attribute:!1},wekker:{attribute:!1},entiteiten:{attribute:!1},_concept:{state:!0},_zoekterm:{state:!0},_soort:{state:!0},_treffers:{state:!0},_zoekt:{state:!0},_melding:{state:!0},_speelt:{state:!0},_bezig:{state:!0}}),z(We,"styles",[oe,Q`
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${ge(pn)});
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
  `]);var To="person",dd="Kies een persoon in de kaartinstellingen.",Co="De gekozen persoon is niet gevonden.",cd="De opgeslagen wekkers van deze persoon zijn onleesbaar.",Ku=Object.freeze(["grid_options","layout_options","view_layout","visibility"]);function Lo(a){if(!a||typeof a!="object"||Array.isArray(a))throw new Error("De kaartconfig ontbreekt of is geen object.");let e=a.person;if(e==null||e==="")return{...a};if(typeof e!="string")throw new Error("'person' moet een entity-ID zijn, zoals person.sven.");if(!e.startsWith(`${To}.`))throw new Error(`'${e}' zit niet in het domein ${To}. Kies een persoon, zoals person.sven.`);return{...a}}function Oo(a){return{type:`custom:${a}`}}function Do(a,e){return a?e?{soort:"ok",tekst:null,isFout:!1}:{soort:"weg",tekst:Co,isFout:!0}:{soort:"ontbreekt",tekst:dd,isFout:!1}}function Ro(a,e){return a==="not_found"?Co:a==="home_assistant_error"?cd:e||"Er ging iets mis bij het ophalen van de wekkers."}var pd=["ma","di","wo","do","vr","za","zo"],hd="Geen wekkers ingesteld",ud="Eenmalig",md="Eenmalig \u2014 afgelopen",gd="Geen wekker actief",Ho="Stoppen",fd="Er is een melding over deze wekker, maar de tekst ontbreekt.";function bd(a){return!Array.isArray(a)||a.length===0?ud:[...new Set(a)].sort((t,n)=>t-n).map(t=>pd[t-1]??"?").join(" ")}function vd(a,e){return!a||Array.isArray(a.days)&&a.days.length>0?!1:Date.parse(a?.one_shot_at??"")<=e}function Vo(a,e){return vd(a,e)?md:bd(a?.days)}function Po(a){let e=a?.last_message;return!e||typeof e!="object"||Array.isArray(e)?null:{tekst:typeof e.text=="string"&&e.text.trim()?e.text:fd,severity:e.severity==="error"?"error":"notice",isFout:e.severity==="error",kind:typeof e.kind=="string"?e.kind:null}}function Io(a){let e=a?.alarms;if(!Array.isArray(e)||e.length===0)return hd;let t=a?.next_fire?.text;return typeof t=="string"&&t.trim()?t:gd}function Ko(a,e){let t=[...new Set((e??[]).filter(o=>typeof o=="string"))];if(t.length===0)return null;let n=t.map(o=>(a??[]).find(s=>s?.id===o)).filter(Boolean),i=n.map(o=>o.name).filter(Boolean),r=[...new Set(n.map(o=>o.time).filter(Boolean))];return{ids:t,naam:i.length?i.join(" en "):"Wekker",tijd:r.join(" en ")}}var kd="0.15.0",xd="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",_d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z",Bo="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",wd="M13,14H11V9H13M13,18H11V16H13M1,21H23L12,2L1,21Z",mn=(a,e="icoon")=>_`<svg class=${e} viewBox="0 0 24 24" aria-hidden="true">
    <path d=${a} />
  </svg>`,ft=class extends Z{constructor(){super(),this._toestand=null,this._fout=null,this._bevestigVoor=null,this._bezig=!1,this._tijdelijkeMelding=null,this._editorVoor=void 0,this._entiteiten=null,this._abonnementVoor=null,this._afmelden=null}setConfig(e){let t=Lo(e),n=t.person!==this._config?.person;this._config=t,this.toggleAttribute("bare",!!e?.bare),n&&(this._toestand=null,this._fout=null,this._bevestigVoor=null,this._herstartAbonnement())}static getConfigElement(){return document.createElement(Ga)}static getStubConfig(){return Oo(Re)}getGridOptions(){return{rows:"auto",columns:12,min_columns:6,min_rows:He(this.renderRoot?.querySelector?.(".card"))??1}}getCardSize(){if(this._stop())return 3;let e=this._toestand?.alarms?.length??0;return 1+Math.max(e,1)}connectedCallback(){super.connectedCallback(),this._herstartAbonnement()}disconnectedCallback(){super.disconnectedCallback(),this._stopAbonnement(),this._rasterUit?.(),this._rasterUit=null,this._rasterVak=null}updated(e){e.has("hass")&&this.hass&&this._startAbonnement(),this._volgRaster()}_volgRaster(){let e=this.renderRoot?.querySelector(".card, .needs");e!==this._rasterVak&&(this._rasterUit?.(),this._rasterVak=e,this._rasterUit=e?B(e):null),O(e)}async _startAbonnement(){let e=this._config?.person;if(!(!this.hass||!e||!this.isConnected)&&this._abonnementVoor!==e){this._abonnementVoor=e;try{let t=await this.hass.connection.subscribeMessage(n=>this._opGebeurtenis(n),{type:ie.subscribe,person:e});if(this._abonnementVoor!==e){t();return}this._afmelden=t}catch(t){console.warn(`${Re}: abonneren mislukt: ${t?.message??t}`)}await this._haalOp()}}_stopAbonnement(){if(this._afmelden){try{this._afmelden()}catch(e){console.warn(`${Re}: afmelden mislukt: ${e?.message??e}`)}this._afmelden=null}this._abonnementVoor=null}_herstartAbonnement(){this._stopAbonnement(),this._startAbonnement()}_opGebeurtenis(e){let t=e?.alarm_id,n=e?.event;if(typeof t=="string"&&this._toestand){let i=new Set(this._toestand.ringing??[]);n==="started"?i.add(t):i.delete(t),this._toestand={...this._toestand,ringing:[...i]}}this._haalOp()}async _haalOp(){let e=this._config?.person;if(!(!this.hass||!e))try{let t=await this.hass.callWS({type:ie.get,person:e});if(this._config?.person!==e)return;this._toestand=t,this._fout=null}catch(t){if(this._config?.person!==e)return;this._toestand=null,this._fout=Ro(t?.code,t?.message)}}async _roep(e){if(!(!this.hass||this._bezig)){this._bezig=!0;try{let t=await this.hass.callWS(e);t&&typeof t=="object"&&(this._toestand=t,this._fout=null)}catch(t){this._toon(t?.message??"De opdracht is niet gelukt.")}finally{this._bezig=!1}}}async _openEditor(e){if(this._bevestigVoor=null,this._editorVoor=e,!!this.hass)try{this._entiteiten=await this.hass.callWS({type:ie.entities})}catch(t){this._entiteiten=null,console.warn(`${Re}: entiteitenlijst ophalen mislukt: ${t?.message??t}`)}}_sluitEditor(){this._editorVoor=void 0}_toon(e){this._tijdelijkeMelding=e,clearTimeout(this._meldingTimer),this._meldingTimer=setTimeout(()=>{this._tijdelijkeMelding=null},6e3)}_person(){return this._config?.person}_zetAan(e,t){this._roep({type:ie.setEnabled,person:this._person(),alarm_id:e.id,enabled:t})}_verwijder(e){this._bevestigVoor=null,this._roep({type:ie.delete,person:this._person(),alarm_id:e.id})}_begrepen(e){this._roep({type:ie.clearMessage,person:this._person(),alarm_id:e.id})}async _stopAlles(e){for(let t of e)await this._roep({type:ie.stop,person:this._person(),alarm_id:t})}_stop(){return this._toestand?Ko(this._toestand.alarms,this._toestand.ringing):null}render(){if(!this._config)return y;let e=this._config.person,t=!!(e&&this.hass?.states?.[e]),n=Do(e,t);if(n.soort!=="ok")return this._mededeling(n.tekst,n.isFout);if(this._fout)return this._mededeling(this._fout,!0);if(!this._toestand)return this._mededeling("Wekkers ophalen\u2026",!1);let i=this._stop();return this._editorVoor!==void 0&&!i?_`<div class="card surface">
        <domotiapp-alarm-editor
          .hass=${this.hass}
          .person=${this._config.person}
          .wekker=${this._editorVoor}
          .entiteiten=${this._entiteiten}
          @editor-dicht=${()=>this._sluitEditor()}
          @editor-opgeslagen=${r=>{this._toestand=r.detail.toestand,this._sluitEditor()}}
        ></domotiapp-alarm-editor>
      </div>`:_`<div class="card surface">
      ${i?this._stopknop(i):this._lijst()}
      ${this._tijdelijkeMelding?_`<div class="onderrij">
            ${mn(Bo,"icoon klein")}
            <span class="boodschap">${this._tijdelijkeMelding}</span>
          </div>`:y}
    </div>`}_mededeling(e,t){return _`<div class="card surface">
      <div class="mededeling ${t?"fout":""}">${e}</div>
    </div>`}_stopknop(e){return _`<button
      class="stopknop"
      @click=${()=>this._stopAlles(e.ids)}
    >
      <div class="stop-tijd">${e.tijd}</div>
      <div class="stop-naam">${e.naam}</div>
      <div class="stop-woord">${Ho}</div>
    </button>`}_lijst(){let e=this._toestand.alarms??[],t=Date.now();return _`
      <div class="kop ${e.length===0?"leeg":""}">
        <span class="volgende">${Io(this._toestand)}</span>
        <button
          class="icoonknop"
          title="Wekker toevoegen"
          aria-label="Wekker toevoegen"
          @click=${()=>this._openEditor(null)}
        >
          ${mn(xd)}
        </button>
      </div>
      ${e.map(n=>this._rij(n,t))}
    `}_bevestiging(e){return _`<div class="onderrij bevestiging">
      <span class="boodschap">${$o(e)}</span>
      <button
        class="tekstknop"
        @click=${()=>{this._bevestigVoor=null}}
      >
        Annuleren
      </button>
      <button class="tekstknop gevaar" @click=${()=>this._verwijder(e)}>
        Verwijderen
      </button>
    </div>`}_rij(e,t){let n=Po(e),i=!!e.enabled;return _`
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
            <div class="sub">${Vo(e,t)}</div>
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
          ${mn(_d)}
        </button>
      </div>
      ${this._bevestigVoor===e.id?this._bevestiging(e):y}
      ${n?_`<div class="onderrij ${n.isFout?"fout":""}">
            ${mn(n.isFout?wd:Bo,"icoon klein")}
            <span class="boodschap">${n.tekst}</span>
            <button class="tekstknop" @click=${()=>this._begrepen(e)}>
              Begrepen
            </button>
          </div>`:y}
    `}};z(ft,"properties",{hass:{attribute:!1},_config:{state:!0},_toestand:{state:!0},_fout:{state:!0},_bevestigVoor:{state:!0},_bezig:{state:!0},_tijdelijkeMelding:{state:!0},_editorVoor:{state:!0},_entiteiten:{state:!0}}),z(ft,"styles",[oe,Q`
    /* unsafeCSS en niet de constante rechtstreeks: lit weigert een gewone
       string in een css-template en gooit dan — op modulescope, wat SPEC 19.4
       verbiedt. De waarde is onze eigen constante en komt nergens van buiten. */
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${ge(pn)});
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
  `]);var Ge=class Ge extends Z{constructor(){super(...arguments);z(this,"_label",t=>({person:"Persoon",bare:"Achtergrond weglaten"})[t.name]??t.name)}setConfig(t){this._config={...t}}render(){return!this._config||!this.hass?y:_`
      <div class="uitleg">
        Elke persoon heeft zijn eigen wekkerlijst. De kaart toont alleen de
        wekkers van de gekozen persoon.
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${Ge._SCHEMA}
        .computeLabel=${this._label}
        @value-changed=${this._gewijzigd}
      ></ha-form>
    `}_gewijzigd(t){t.stopPropagation();let n={...this._config,...t.detail.value};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:n},bubbles:!0,composed:!0}))}};z(Ge,"properties",{hass:{attribute:!1},_config:{state:!0}}),z(Ge,"styles",[oe,Q`
    .uitleg {
      padding: 0 0 12px 0;
      color: var(--dac-ink-2);
      font-size: 11.5px;
    }
  `]),z(Ge,"_SCHEMA",[{name:"person",required:!0,selector:{entity:{filter:{domain:"person"}}}},{name:"bare",selector:{boolean:{}}}]);var Za=Ge;C(Re,ft);C(Ga,Za);C(_o,We);Ve({type:Re,name:wo,description:`Wekkerkaart van DomotiApp (v${kd}).`,preview:!1,documentationURL:yo});var yd="0.15.0";di(a=>console.warn(`domotiapp-lovelace: ${a}`));console.info(`%c DOMOTIAPP-LOVELACE %c ${yd} `,"background:#026fa1;color:#e8e4de;font-weight:600;border-radius:3px 0 0 3px;padding:2px 6px","background:#12120f;color:#e8e4de;border-radius:0 3px 3px 0;padding:2px 6px");export{yd as VERSION};
