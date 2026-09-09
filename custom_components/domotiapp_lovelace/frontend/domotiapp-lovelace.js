var Vc=Object.defineProperty;var Ic=(i,e,t)=>e in i?Vc(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var _=(i,e,t)=>Ic(i,typeof e!="symbol"?e+"":e,t);var G=`
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
`,Ne=`
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
`;function F(i){let e=new CSSStyleSheet;return e.replaceSync(i),e}var La=null,$o=i=>{La=i},ye=i=>String(i??"").split(".")[0],v=(i,e)=>e&&i?.states?.[e]||null,q=(i,e)=>v(i,e)?.attributes??{},cn=(i,e,t)=>t?null:q(i,e).entity_picture||null;function Eo(i){if(!i||i.state!=="on")return null;let e=i.attributes??{};if(Array.isArray(e.entity_id))return null;let t=e.rgb_color;return Array.isArray(t)&&t.length>=3?`rgb(${t[0]},${t[1]},${t[2]})`:null}function M(i,e,t){return t||q(i,e).friendly_name||e||""}var Pc=new Set(["scene","script","input_button","button","event"]),Ca=i=>Pc.has(ye(i));function ne(i){return!i||i.state==="unavailable"?!0:i.state==="unknown"?!Ca(i.entity_id):!1}function X(i){if(!i)return!1;let e=i.state;if(e==="unavailable"||e==="unknown")return!1;switch(ye(i.entity_id)){case"cover":return e==="open"||e==="opening";case"alarm_control_panel":return e.startsWith("armed")||e==="triggered"||e==="arming";case"climate":case"water_heater":case"humidifier":return e!=="off";case"person":case"device_tracker":return e==="home";case"media_player":return e!=="off"&&e!=="idle"&&e!=="standby";default:return e==="on"||e==="playing"||e==="active"||e==="heat"}}var Bc=new Set(["light","switch","fan","input_boolean","automation","siren","humidifier","remote","water_heater"]),Ao=i=>Bc.has(ye(i));function Mo(i,e,t){if(!i||i.themes!==e.themes||i.language!==e.language)return!0;for(let n of t)if(n&&i.states?.[n]!==e.states?.[n])return!0;return!1}function dn(i,e,t={}){i.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!1}))}var P=(i,e)=>dn(i,"hass-more-info",{entityId:e});function Tt(i){switch(ye(i)){case"light":case"switch":case"fan":case"input_boolean":case"automation":case"siren":return{action:"toggle"};case"script":case"scene":case"input_button":case"button":return{action:"toggle"};default:return{action:"more-info"}}}function Kc(i){switch(ye(i)){case"scene":return["scene","turn_on"];case"script":return["script","turn_on"];case"input_button":return["input_button","press"];case"button":return["button","press"];case"lock":return["lock","open"];case"cover":return["cover","toggle"];case"media_player":return["media_player","media_play_pause"];default:return["homeassistant","toggle"]}}function je(i,e,t,n){if(!(!n||n.action==="none")){if(n.confirmation){let a=n.confirmation===!0?{}:n.confirmation;if(!La){console.warn("DomotiApp: geen bevestigingsscherm geladen; de actie is niet uitgevoerd.");return}La(a).then(r=>{r&&yo(i,e,t,n)});return}yo(i,e,t,n)}}function yo(i,e,t,n){switch(n.action){case"more-info":P(i,n.entity||t.entity);break;case"toggle":{let a=n.entity||t.entity;if(!a)break;let[r,o]=Kc(a);e.callService(r,o,{entity_id:a});break}case"perform-action":case"call-service":{let a=n.perform_action||n.service;if(!a)break;let[r,o]=a.split(".");e.callService(r,o,n.data??n.service_data??{},n.target);break}case"navigate":if(!n.navigation_path)break;history.pushState(null,"",n.navigation_path),dn(window,"location-changed",{replace:!1});break;case"url":n.url_path&&window.open(n.url_path,n.target??"_blank");break;case"assist":dn(i,"show-dialog",{dialogTag:"ha-voice-command-dialog",dialogImport:()=>{},dialogParams:{}});break;case"fire-dom-event":dn(i,"ll-custom",n);break;default:break}}function W(i,{onTap:e,onHold:t,onDouble:n}){let o=0,s=0,l=null,d=p=>{p.button!=null&&p.button!==0||(o=Date.now())},c=()=>{let p=o?Date.now()-o:0;if(o=0,t&&p>=500){navigator.vibrate?.(18),t();return}if(!n){e?.();return}if(s++,s===1){l=setTimeout(()=>{s=0,e?.()},260);return}clearTimeout(l),s=0,n()};return i.addEventListener("pointerdown",d),i.addEventListener("click",c),i.addEventListener("contextmenu",p=>p.preventDefault()),()=>{clearTimeout(l),i.removeEventListener("pointerdown",d),i.removeEventListener("click",c)}}function J(i,e){if(!e)return"";let t=ye(e.entity_id),n=e.attributes.device_class;return i.formatEntityState?.(e)??i.localize?.(`component.${t}.entity_component.${n??"_"}.state.${e.state}`)??i.localize?.(`component.${t}.entity_component._.state.${e.state}`)??e.state}function B(i,e,t){let n=Number(e);return Number.isFinite(n)?n.toLocaleString(i?.locale?.language??"nl",{minimumFractionDigits:t??0,maximumFractionDigits:t??0}):"--"}var jo=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],So=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"],zo=(i=new Date)=>new Date(i.getFullYear(),i.getMonth(),i.getDate()),pn=(i,e)=>Math.round((zo(e)-zo(i))/864e5);function st(i){if(!i)return null;if(i instanceof Date)return Number.isNaN(+i)?null:i;let e=String(i).trim(),t=e.match(/(?:^|\D)(\d{1,2})[-./](\d{1,2})[-./](\d{4})(?!\d)/);if(t)return new Date(+t[3],+t[2]-1,+t[1]);if(t=e.match(/(?:^|\D)(\d{4})-(\d{1,2})-(\d{1,2})(?!\d)/),t)return new Date(+t[1],+t[2]-1,+t[3]);let n=new Date(e);return Number.isNaN(+n)?null:n}function hn(i,e=new Date){if(!i)return"";let t=pn(e,i);return t<0?`${Math.abs(t)} dagen geleden`:t===0?"vandaag":t===1?"morgen":t===2?"overmorgen":t<=6?jo[i.getDay()]:`${jo[i.getDay()].slice(0,2)} ${i.getDate()} ${So[i.getMonth()]}`}var No=i=>i?`${i.getDate()} ${So[i.getMonth()]}`:"";function Gc(i){let e=Math.max(1,Math.ceil((i+8)/64));return e*56+(e-1)*8}function Wc(i){if(!i)return 0;let e=getComputedStyle(i),t=[...i.children].filter(r=>r.getBoundingClientRect().height>0);if(!t.length)return 0;let n=parseFloat(e.rowGap)||0;return t.reduce((r,o)=>r+o.getBoundingClientRect().height,0)+n*(t.length-1)+parseFloat(e.paddingTop)+parseFloat(e.paddingBottom)+parseFloat(e.borderTopWidth)+parseFloat(e.borderBottomWidth)}function O(i,e=4){if(!i)return;let t=Wc(i);if(!t){e>0&&requestAnimationFrame(()=>O(i,e-1));return}let n=`${qc(i,Gc(t))}px`;i.style.getPropertyValue("--dac-raster")!==n&&i.style.setProperty("--dac-raster",n)}var Ha=new WeakMap,Uc=12,Fc=3;function qc(i,e){let t=Ha.get(i)??{rij:[],vast:null};if(t.vast!==null){if(t.vast.paar.includes(e))return t.vast.waarde;t.vast=null,t.rij=[]}let n=[...t.rij,e].slice(-Uc),a=[...new Set(n)],r=n.reduce((s,l,d)=>d>0&&l!==n[d-1]?s+1:s,0);if(a.length===2&&r>=Fc){let s=Math.max(...a);return Ha.set(i,{rij:n,vast:{paar:a,waarde:s}}),s}return Ha.set(i,{rij:n,vast:null}),e}function lt(i){let e=parseFloat(i?.style?.getPropertyValue?.("--dac-raster")??"");return!Number.isFinite(e)||e<=0?null:Math.max(1,Math.round((e+8)/64))}function R(i){if(!i||typeof ResizeObserver>"u")return()=>{};let e=new ResizeObserver(()=>{for(let t of i.children)e.observe(t);O(i)});e.observe(i);for(let t of i.children)e.observe(t);return O(i),()=>e.disconnect()}var Zc="home-assistant";function To({leesRegistry:i,definities:e,waarschuw:t=()=>{},plan:n=(l,d)=>setTimeout(l,d),nu:a=()=>Date.now(),marker:r=Zc,intervalMs:o=20,maxWachtMs:s=1e4}){let l=a();function d(){let h=i();if(!h)return!1;for(let[g,f]of e)try{h.get(g)||h.define(g,f)}catch(k){t(`kon ${g} niet registreren: ${k&&k.message}`)}return!0}function c(){let h=i();return!h||!h.get(r)?!1:d()}if(c())return!0;let p=()=>{if(!c()){if(a()-l>=s){t(`${r} is na ${s} ms niet verschenen; de kaart wordt alsnog geregistreerd`),d();return}n(p,o)}};return n(p,o),!1}var Oo=[];function L(i,e){Oo.push([i,e])}function dt({type:i,name:e,description:t,preview:n=!0,documentationURL:a}){window.customCards=window.customCards??[],!window.customCards.some(r=>r.type===i)&&window.customCards.push({type:i,name:e??i,description:t??"",preview:n,documentationURL:a??"https://github.com/Sven2410/domotiapp-lovelace"})}function Do(i=()=>{}){To({leesRegistry:()=>globalThis.customElements,definities:Oo,waarschuw:i})}var Xc=`
  :host {
    ${G}
    display: block;
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  :host([hidden]) { display: none; }
`,E={accent:"var(--dac-accent-hi)",solar:"var(--dac-solar)",house:"var(--dac-house)",water:"var(--dac-grid-in)",magenta:"var(--dac-grid-out)",pink:"var(--dac-device-1)",teal:"var(--dac-device-2)",lit:"var(--dac-lit)",good:"var(--dac-good)",warn:"var(--dac-warn)",bad:"var(--dac-bad)",neutral:"var(--dac-ink-3)"},Co={accent:"Accent",solar:"Oranje",house:"Blauw",water:"Lichtblauw",magenta:"Magenta",pink:"Roze",teal:"Groenblauw",lit:"Lampgeel",good:"Goed",warn:"Let op",bad:"Kritiek",neutral:"Neutraal"},j=i=>String(i??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),Z=(i,e="accent")=>E[i]??(i&&/[#(]|^var/.test(i)?i:E[e]),C=Symbol("incomplete"),Yc=i=>`
  <div class="needs">
    <span class="mark"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6"/>
      <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>
    </svg></span>
    <span><b>Nog niets gekozen</b><span>${i}</span></span>
  </div>`,Qc=56,Lo=8,ze=i=>Math.max(1,Math.ceil((i+Lo)/(Qc+Lo))),S=class extends HTMLElement{static get styleSheets_(){return Object.hasOwn(this,"sheets_")||(this.sheets_=[F(Xc+Ne+this.css)]),this.sheets_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=new.target.styleSheets_,this.built_=!1,this.wired_=!1,this.teardown_=[],this.bewaakFocusRing_()}bewaakFocusRing_(){let e=0,t=0;this.shadowRoot.addEventListener("pointerdown",()=>{e=Date.now()},!0),this.shadowRoot.addEventListener("keydown",()=>{t=Date.now()},!0),this.shadowRoot.addEventListener("focusin",n=>{if(t>=e)return;let a=n.target;!a?.matches||a.matches("input, textarea, select, [contenteditable]")||requestAnimationFrame(()=>{t>=e||a.isConnected&&a.matches(":focus-visible")&&a.blur?.()})},!0)}setConfig(e){let t=this.validate(e??{});this.config=t,this.built_&&(this.destroy_(),this.shadowRoot.replaceChildren(),this.built_=!1,this.wired_=!1),this.isConnected&&this.build_()}set hass(e){let t=this.hass_;if(this.hass_=e,!!this.config){if(!this.built_){this.build_();return}this.config[C]||Mo(t,e,this.watched())&&this.paint()}}get hass(){return this.hass_}connectedCallback(){if(this.config){if(!this.built_){this.build_();return}this.config[C]||this.wired_||(this.wire(),this.wired_=!0,this.hass_&&this.paint())}}disconnectedCallback(){this.destroy_(),this.wired_=!1}validate(e){return e}watched(){return this.config?.entity?[this.config.entity]:[]}template(){return""}wire(){}paint(){}build_(){let e=document.createElement("template"),t=this.config?.[C];if(e.innerHTML=t?Yc(t):this.template(),this.shadowRoot.appendChild(e.content),this.built_=!0,t){this.teardown_.push(R(this.$(".needs")));return}this.wire(),this.wired_=!0,this.hass_&&this.paint()}destroy_(){for(let e of this.teardown_)try{e()}catch{}this.teardown_=[]}on(e,t,n,a){e&&(e.addEventListener(t,n,a),this.teardown_.push(()=>e.removeEventListener(t,n,a)))}$(e){return this.shadowRoot.querySelector(e)}$$(e){return[...this.shadowRoot.querySelectorAll(e)]}text(e,t){let n=typeof e=="string"?this.$(e):e;n&&n.textContent!==String(t)&&(n.textContent=t)}getCardSize(){return 1}minRijen_(e=".card",t=1){return lt(this.$(e))??t}};_(S,"css","");function N(i,e,{name:t,description:n,preview:a=!0}={}){L(i,e),dt({type:i,name:t,description:n,preview:a})}function H(i,e){L(i,e)}var u=(i,e="none")=>`<svg class="icon" viewBox="0 0 24 24" fill="${e}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${i}</svg>`,A={house:u(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
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
    <path d="M5.2 18.4v2.4M18.8 18.4v2.4"/>`),speelkamer:u(`<circle cx="6.8" cy="7.6" r="2.8"/>
    <circle cx="17.2" cy="7.6" r="2.8"/>
    <circle cx="12" cy="13.8" r="5.8"/>
    <path d="M9.8 12.4v.1M14.2 12.4v.1"/>
    <circle cx="12" cy="15.6" r="1.9"/>
    <path d="M12 14.7v.1"/>`),stairs:u(`<path d="M3.6 20.4V16h4.3v-4.3h4.3V7.4h4.3V3.2h4.1"/>
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
    <path d="M5.2 6.6h13.6M5.2 8.6h13.6"/>`),gate:u(`<path d="M2.6 20.6h18.8"/>
    <path d="M4.2 20.6V6.8M19.8 20.6V6.8"/>
    <path d="M5.8 9.6h12.4M5.8 16.6h12.4"/>
    <path d="M8.4 9.6v7M15.6 9.6v7"/>
    <path d="M11.4 9.6v7M12.6 9.6v7"/>`),gateOpen:u(`<path d="M2.6 20.6h18.8"/>
    <path d="M4.2 20.6V6.8M19.8 20.6V6.8"/>
    <path d="M4.2 9.6h3.6M4.2 16.6h3.6"/>
    <path d="M7.8 9.6v7"/>
    <path d="M16.2 9.6h3.6M16.2 16.6h3.6"/>
    <path d="M16.2 9.6v7"/>`),eettafel:u(`<path d="M3 9.6h18"/>
    <path d="M5.4 9.6v6.2M18.6 9.6v6.2"/>
    <path d="M7.4 12.4h9.2"/>
    <path d="M4.2 20.4v-3.2a1.4 1.4 0 0 1 1.4-1.4h1.2a1.4 1.4 0 0 1 1.4 1.4v3.2"/>
    <path d="M15.8 20.4v-3.2a1.4 1.4 0 0 1 1.4-1.4h1.2a1.4 1.4 0 0 1 1.4 1.4v3.2"/>`),veranda:u(`<path d="M2.2 9.4 12 4.2l9.8 5.2"/>
    <path d="M4.6 9.4v10.4M19.4 9.4v10.4"/>
    <path d="M2.2 19.8h19.6"/>
    <path d="M4.6 12.2h14.8"/>`),pollenradar:u(`<circle cx="12" cy="12" r="2.2"/>
    <path d="M12 9.8V7.4M12 14.2v2.4M9.8 12H7.4M14.2 12h2.4"/>
    <path d="M6.4 6.4a7.9 7.9 0 0 0 0 11.2M17.6 17.6a7.9 7.9 0 0 0 0-11.2"/>
    <path d="M3.6 3.6a11.9 11.9 0 0 0 0 16.8M20.4 20.4a11.9 11.9 0 0 0 0-16.8"/>`),gras:u(`<path d="M3 20.4h18"/>
    <path d="M12 20.4V8.6"/>
    <path d="M12 12.4c-1.4-.8-2.2-2.2-2.2-4 1.5.2 2.2 1.6 2.2 4Z"/>
    <path d="M12 9.6c1.4-.8 2.2-2.2 2.2-4-1.5.2-2.2 1.6-2.2 4Z"/>
    <path d="M7 20.4c0-4 .8-6.6 2.4-8M17 20.4c0-4-.8-6.6-2.4-8"/>`),kruiden:u(`<path d="M12 20.8v-6.4"/>
    <path d="M12 14.4c0-3.4 1.8-5.6 5.4-6.6.4 3.8-1.6 6.4-5.4 6.6Z"/>
    <path d="M12 14.4c0-2.8-1.5-4.6-4.4-5.4-.3 3.1 1.3 5.2 4.4 5.4Z"/>
    <path d="M12 10.6c0-2.2 1-3.8 3-4.6"/>`),circulatiepomp:u(`<circle cx="12" cy="13.6" r="5.4"/>
    <path d="M12 10.4a3.2 3.2 0 0 1 3.2 3.2"/>
    <path d="M9.4 8.2V5.2a.8.8 0 0 1 .8-.8h3.6a.8.8 0 0 1 .8.8v3"/>
    <path d="M2.6 13.6h4M17.4 13.6h4"/>
    <path d="M12 13.6h.02"/>`),awning:u(`<path d="M2.8 11.4 6.2 5h11.6l3.4 6.4z"/>
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
    <path d="M14.6 17.4h6M18 14.8l2.6 2.6-2.6 2.6"/>`),dier:u(`<circle cx="6.6" cy="10.2" r="2.3"/>
    <circle cx="11" cy="6.4" r="2.4"/>
    <circle cx="15.6" cy="6.4" r="2.4"/>
    <circle cx="18.6" cy="10.4" r="2.3"/>
    <path d="M12.6 14.4c2.9 0 5 2 5 4.1 0 1.6-1.3 2.6-2.8 2.6-1 0-1.5-.4-2.2-.4s-1.2.4-2.2.4c-1.5 0-2.8-1-2.8-2.6 0-2.1 2.1-4.1 5-4.1Z"/>`),bin:u(`<path d="M3.6 6.8h16.8"/>
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
    <circle cx="7.4" cy="12.5" r=".95"/><circle cx="16.6" cy="12.5" r=".95"/>`),van:u(`<path d="M2.6 16.2h18.8"/>
    <path d="M6 16.2v1.9a.9.9 0 0 1-.9.9h-.8a.9.9 0 0 1-.9-.9v-1.9M20.6 16.2v1.9a.9.9 0 0 1-.9.9h-.8a.9.9 0 0 1-.9-.9v-1.9"/>
    <path d="M2.6 16.2V7.4a1 1 0 0 1 1-1h9.6a1.2 1.2 0 0 1 1 .55l3.4 4.85h2.4a1 1 0 0 1 1 1v3.4z"/>
    <path d="M13.4 6.4v5.4h4.2"/>
    <circle cx="6.6" cy="13.4" r=".95"/><circle cx="17.4" cy="13.4" r=".95"/>`),plug:u(`<path d="M9 3.4v5.2M15 3.4v5.2"/>
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
    <path d="M7 15.4h10v4a.6.6 0 0 1-.6.6H7.6a.6.6 0 0 1-.6-.6z"/>`),printer3d:u(`<path d="M4 3.6h16a.6.6 0 0 1 .6.6v15.2a.6.6 0 0 1-.6.6H4a.6.6 0 0 1-.6-.6V4.2a.6.6 0 0 1 .6-.6z"/>
    <path d="M3.4 8.4h17.2"/>
    <path d="M12 8.4v2.6"/>
    <path d="M10.4 11h3.2l-1.6 2.4z"/>
    <path d="M7.2 17.2h9.6"/>`),handmatig:u(`<path d="M11 12.2V5.6a1.6 1.6 0 0 1 3.2 0v6.4"/>
    <path d="M14.2 11.6v-1.4a1.5 1.5 0 0 1 3 0v1.6"/>
    <path d="M17.2 11.8v-.8a1.5 1.5 0 0 1 3 0v4.6a5.4 5.4 0 0 1-5.4 5.4h-2a4.6 4.6 0 0 1-3.7-1.9L5.4 15a1.6 1.6 0 0 1 2.4-2.1L11 15.8"/>`),koelkast:u(`<rect x="5.6" y="2.8" width="12.8" height="18.4" rx="1.8"/>
    <path d="M5.6 10.2h12.8"/>
    <path d="M8.2 6.2v2.2M8.2 12.4v2.4"/>`),oven:u(`<rect x="3.4" y="3.6" width="17.2" height="16.8" rx="1.8"/>
    <path d="M3.4 8.6h17.2"/>
    <circle cx="7" cy="6.1" r=".9"/><circle cx="10.4" cy="6.1" r=".9"/>
    <rect x="6.4" y="11.4" width="11.2" height="6.4" rx="1.2"/>`),magnetron:u(`<rect x="2.4" y="5.6" width="19.2" height="12.8" rx="1.8"/>
    <rect x="4.8" y="8.2" width="10.4" height="7.6" rx="1.2"/>
    <path d="M17.8 8.6v2.4"/>
    <circle cx="17.8" cy="14.6" r="1.1"/>`),key:u(`<circle cx="7.8" cy="12" r="3.8"/>
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
    <path d="m9.2 16.9 1.9 1.9 3.7-3.9"/>`),homeLeave:u(`<path d="M2.4 10.8 8.9 5.2l6.5 5.6"/>
    <path d="M4.4 12.2v7.3a.9.9 0 0 0 .9.9h7.2a.9.9 0 0 0 .9-.9v-2.1"/>
    <path d="M13.4 12.2v1.4"/>
    <path d="M14.6 15.6h6.6M18.6 12.9l2.8 2.7-2.8 2.7"/>`),lounge:u(`<path d="M6.4 10.8V7.6a2.4 2.4 0 0 1 2.4-2.4h6.4a2.4 2.4 0 0 1 2.4 2.4v3.2"/>
    <path d="M4.6 17.4v-4.6a2 2 0 0 1 4 0v1.4h6.8v-1.4a2 2 0 0 1 4 0v4.6z"/>
    <path d="M6.2 17.4v2M17.8 17.4v2"/>`),dumbbell:u(`<path d="M9.2 12h5.6"/>
    <rect x="6.2" y="8.6" width="3" height="6.8" rx="1"/>
    <rect x="14.8" y="8.6" width="3" height="6.8" rx="1"/>
    <path d="M3.6 10.2v3.6M20.4 10.2v3.6"/>`),storage:u(`<rect x="3.2" y="12.4" width="8" height="8" rx="1"/>
    <rect x="12.8" y="12.4" width="8" height="8" rx="1"/>
    <rect x="8" y="3.4" width="8" height="8" rx="1"/>
    <path d="M6.4 12.4v2.4M16 12.4v2.4M11.2 3.4v2.4"/>`),celsius:u(`<circle cx="6.6" cy="7.2" r="2.6"/>
    <path d="M19.4 9.4a5.6 5.6 0 1 0 0 7.4"/>`)};A.domotitech='<img class="icon" alt="" aria-hidden="true" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ4AAAEOCAYAAAB4sfmlAAAACXBIWXMAAAsSAAALEgHS3X78AAAc4UlEQVR4nO3de5RcdWEH8O9vFhDayC5MHkgIO4jksUnYQaEKKntDBB/g2aE91gpsM/Qf/+gjM7zk1NpMbG1RwdkckKfArBNBrcqs+IKE7GwSoO/MqoAFK7P12B4Jc8y0KNrTk9s/fr87e/c9v5l77+/One/nnIXM6947uzvf/b1/wrZtEBHpiJm+ACLqPAwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItJ2gukLoM4RzxbTAFIAEgAGAdQBVNRXuZYfKZm6NgqWsG3b9DVQyKnAyAHoX+apdQAlALlafqTq60WRUQwOWlQ8W0wCGAUw1MLLxwGM1vIjZU8vikKBwUHzxLPFPsgSxk4PDjcGlkAih8FBs8SzRQtAActXS3TUIUsfOQ+PSQYxOAiA56WMxUwBSNfyIxUfz0EBYHcsIZ4tpgBU4W9oALIn5kg8W8z5fB7yGUscXSygUsZiJgGkavmRYwbOTW1icHQpn9oydNUBWKy6dB4GR5cxXMpYzPW1/EjB9EVQ8xgcXSQkpYzFjNXyI2nTF0HNYXB0CdUgucv0dSxjCrLqwnaPkGNwRJwa/VmA7NHoBGz36ADsjo2weLaYAXAEnRMaANALoKzmx1BIscQRQfFsMQFZymhljkmY7OZo03BicESMGsxVgPzLHQXjkKNN2e4RIgyOiFDdrAUAw4YvxQ9TkIPFqqYvhCQGRwSEvJvVK2w0DRE2jnY41c06gWiHBiCrXkfYaBoOLHF0qA7sZvUSB4sZxuDoQKqbNYfoNIC2gpPkDGJwdJCIN4C2gut7GMLg6BAR7Gb1Sh2y5FE2fSHdJJLB4ZoBmvTgcBXINTONFIlDOps1jDjDNkCRCw41arICb/8y1wEkgx5HEKIG0CnI1c7Lc78Hqis4pb5M9+yw0TQgUQyOAoAdPhx6vJYfSflw3AWpBtB8UOdbxDRkG0K5mSerEMnAbBsMG00DEMXg8O0N1fIjwq9jO1TVpATz80xanifS5n4sXpiGDA82mvqEA8BCxLVosMnQmAJwQTuTy2r5kUotP2IB2Ab5IQ5aP+QM28BKiN2GwREC8WyxL54tjgJ4DGZ7Tcbg4bBuVcVJAtjtxfE09QJ4TFX5yGOsqmjwo6qiivUlmF80OONnr4Th98lGU4+xxGGQmmdyBGZDw1mur+DnSVQpJglZqgnajni2WFHtR+QBBocB8WwxEc8WyzC/BqinVZPl1PIjx9Rf/ushSzlBGgRQUSUfahODI2Cqwa4C870m19fyI0YWyFGlGwuytBMkNpp6hMERENUAWoD5BtBpyF6TgsFrcKouFuQKX0Fio6kHGBwBUAOjKvBnYJqOScgRsKEY36CqLikAewycPq+CnFrA4PBZiBba2V3Lj4Ryz5JafiQD2e4RNDaatojB4ZN4tpiMZ4sVmG8ArQO4Ouyrhauq0wVgo2lHYHD4QNWfywjH5DSrlh8pGb6Opri6bE01mqYDPm/HYnB4SDWAliAnp5leNyPQrlavqNm3FoIPj14AD6uqJS2DI0c1LDVyNGQL7WRr+ZFR0xfRLh9nOi9nDHIkbejag8KCJY42uUoZprtZAdk+cEEUQgMA1GAxIyNNIasubDRdBIOjDa5u1jCsAToJINFpVZPlqPDIGjj1IIAqG00XxuBogWs2axi6WQFgT1i7Wr2gSlAmumu5AfYiGByaXEPGw7AGqNPVGvlRkKq79moE313rNJpGovrnFTaO6pmE+Tkmjq7cT1VVHcow057EDbAVBkdn6ur1JQyHR1cG9lysqnSWOtSsVtMXYpJrglzQYz0AjjQFwODoJIEsuNMpDIdH12+AzeDoDHtq+ZHQzGoNC9XWYMFMeACy0bRg6NxGsY0j3OqQjXEdMdfEFDVQqwxzc4O6bi8XBkd4+fbLePHEvx0BkNB8WfXZbRsumHMcZ/8UXZlnt23wvPRkcIg60GUbYJ9g+gJoQX7PNUkA0B1OnVjgvj601j3ty1DuWn4kHc8WATPhMQg1WKwbSohs4wgXZzMkDjZqkcH5LUAXLUvI4AiP3WwA9YbB+S2OfDxbLER5khyDw7y2t1yk+QzOb3FEeoYtg8MsljJ8pMa8mAyPyM6wZXCYMQngHJYy/GdwcpwjkjNsGRzBmoaczWp1+1yHIKleDgtmwyNSM2yjGByTpi9gAXXIHduT3dBVF0auIeqmwgMAdsazxVIU2j2iGBxh+2COQQZGrptGFoaR4fktjmHIqkvC4DW0LYrBUYDZvyqOMch2jDSrJeERkvBwZthaBq+hLZELDvVX3eQAHAZGyLkmx5ms1vYCmOjURtPIBQfQaEkPcj/SOhgYHUXtW2vB3ChTR0fOsI3sXJVafiSjtmAchX8rRU2p45c6rP2iihYmuS1w3zG09lc7NN8rNb/lGMyuIbtDtXl0zAzbyM2OnUu1YKfVlxfTrqchG2BHWbKIDlVleNjwZUxDhkfoBwRGPjjmcjVIJSFnaSYw89c3ifmlkynIv7ZlAOVO+KFSa1R4+FlCbUZHrMHSdcFBtBTDCyG77Q7zyGIGB9Ecqr2hBHMrijlCu4ctg6MLbbpv4sMQ4k1aL7Lt/3rho9u+4r5r/Ref2WoDH9U9vwDue/EPL/mB7uuCpNrGSjC/j04ot2OIbK8KLe7/4qfeuzK+QmvY86u1144BmBUcNvDRlevif6x7/ld/WgOAP9F9XZCcsR6GlyMEXIPFwtS+FslxHEReUYsCmZyaD4RwOwYGB9Ey1IDCC2B+KkNoZtgyOIiaoKoJSZid4wKEZIYtg4OoSaqB0oLcfNok4zNsGRxEGtQclxSCnQu1EKN72DI4iFpQy49k0MWNpgwOohapRtNtCEejaS7IEzI4iNpQy4+UYX5hIADYFeT0/K4cALb2k48lhWsbQlvI/wuIObflf22BYz/7+HBoBt9QuNTyI85qXmWYHaa+I54tOmNPfBXJ4Dhz19ctAAkhRAJqFqwtkIwBvbYQLR1z7afGneJZ3RaiEgOO2QIVyLUlKkKIyn/c+sHQzSmgYNTyI8dUeIzC7EjTQMKj44PjzL/8WsKGsABYQiAJ/xO/FzPzF4bdD5x92+N1G6gAKMcEygAq0x9jmHQLNUzd5MbXDt/DoyOD44xPfC0FIAXAign0m74eFydUhgDsAoD+Tz8+ZUOUYwLl6i1XhXqNBfKGWlWsDLMLA+2IZ4sVvzYw74jZsWf8xd/1AUjZEKkYMGy7ahsxAdhOa8ScWohw3WEL2RLsVFXcT22ijUOeq/F8oY41/1zOdzPmesyGcN8et4UoxYDyyzdfWV36nfuDs2ODEZJVxbapBlxPhTo4Vn/8q6keIG0LMQyoDyBmf2A7MDhmXu+sWSpQqt50Jas0EaTaPUowtzBQHUDC6zU9Qhccaz7+1QSAjC3XCO3twcyHPYLB0ThRDBi3IQov3/QBVmcixvSqYj2/9YaJDdvP/6NDl22senXM0ATH6j//SioGkbGFbHh0rqqLgsN5H9MxIQoACv9+4/uroEgwGR4xIV7feNWF/wuB0UPbNua8OKbR4Fh161f6hEAKQA4C/THXh7SLgwMx0biOcQCjP7nh/WVQx1PhUYCBsR5r3nou4medjh5gyhbCmrQ2tFV1MRIcq2/9cp8NkQGQEUIlsAAYHPOCw7k9BWD0x9n3FUAdTU2HLyPg8Dh55ak/ffMlG9apz9MUgLbCI/DgWH3rlzMAcjZEL+D6sDM4lgoO59jTthC5n2TeWwB1LFPhcfZlW9G74mTnM9BWeAQWHKs+9mjKhhh1xl3M+7AzOJoJDue10wByP2aAdCwT4XHaOWvqZ2092z16esoGrIMthIfvwbHqlkeTEBgFMOT+ADE42goOBwOkgwUdHjEhXt/8wQtPcU+7sIHxg9aGlO6xfAuOVbc82mcDGQHsgissGByeBofzvOkYkHlp53vZldthgg6PNVvOfn3VuWec4ty2AfQI7J4Y2pDTOY4v0+pX3fKoBTlnY5cfx6d5+gE8dt6eJ8vn7XnSMn0x1DxnGwYEtBzhq9Wj/73A3bu2Tb6Y1jmO5yWOVTc/koMQuwCZZgIASxy+lzjUfY3vwxiA3It/dkUV1DGC2sMlsf18rFhxMoBGiQPqd+eCiaH1TS0f4VlwrL75kYTtbJvn+kVncBgJDgCo2wKjL/3pFTlQxwgiPNasX/uLVZvWngbMC466LZAsX7q+utwxPKmqrL75EQuyamJ6r02a0Qtg13l3PlndcOc+y/TFUHPUVPgxP8/x6s9qv1rkoV7IP/7Lajs4Vt30SBrABMzv7k0L6wcwseHOfaX1d+1LmL4YWp7f4WH/6jenL/Hw4PaDL+aWO0ZbwbHqpkcKMD9tmJozDKCy/q59OdMXQsvzMzyO2/Ypr73266WesuuyQy9aSz2h5eBQoWFylSPS1wtg18a79lc23rXfyH4c1Dw/w+OXr/1muacsuQBQS8Gx+sYvFcDQ6GSDAI5s+Pz+0YHP7ze6lSAtza/wEL98/fVlnjJ42aHFqyzawcHQiJSdACqb7t5vmb4QWlIGHm+/8Jv/+fUrzZz3PYdeSiz0gFZwMDQiqR/AxKa7949uuvsplj5CyDVILOi9W3oB5BZ6oOngWH3jl3JgaETZTgDVzXc/pT1vgfznCo/pgE+94z2HXrLm3tlUcKy+cW8aHD7eDXoBPDZwz4HSwD0HWPoIGRUeKQS/5WRu7h3LBsfqG/cmsUwLK0XOMIDKwD0HLNMXQrPV8iMVyPV4gzS0/fBLs3rhlgyOVTfs7YNc6oyDu7pPP4CJgXsOjG65l6WPMKnlR0oAdgd82oz7xnIljhw4jLzb7QRQ2XIvSx9hUsuP5NBGY+nJbzjxVM2XzGr7WjQ4Vt2w14L8pSHqBzCx5V6WPkIm3eoLj5+24jTNl/RuP/xSIzyWKnEUWroiirKdAMpb75vgqNMQUO0dLVVZfnvFG1p5meX8Y8HgWHXD3hwQqj1ZKTwGARzZet9EzvSFEADZcaHVyxIT4nVnPQ5NjT8Y84JjpWwQzcy9n2iOXZvvn6hsvX8iYfpCupnqotXq9Tzx9BX/2eLphpx/LFTiyIC9KNScQQCVzfeX+YfGLK1SR++bTjuz3RPOCo6VWZY2SFsvgPzm+8vlgQfKCdMX041UqaPQ7PP71q08ZflnLezyp3+cBOaXONJgaYNaMwSgsuWBMoesm9FUdeXklaf+9KSTTmjnPH3A/OBgaYPaIYesP1AuDTxQZrdtgGr5kSqaGNfxxnPftM6L8zWCY2V2rwX2pJA3hgFUN31hkqWPYC25XmjPilN+fsYa3XFf81SA2SUO/pDJS70AHtv8hcnywIOTCcPX0i3KSz24KplY0+4J9r3zLceA2cHBQT3khyEAlYEHJ1kN9lktP1Je7LE3ro2/evrpK9o9RWNKP4ODgiB7Xh48WNn84EHL8LVE3bx2jlhPT/2MLWev9ODYjc2a3MHB3hTy2yCAiYGHDo4OPHSQjaf+mLfz/OqL1/ee2F5PiqPs/MOXvWOJlrETQHXgoYOsvniv7L5xxuazXz/9tLarKI5G4yuDg0yR1ZeHD1Y2P3zIMn0xUXR6Yk195ZtXtzzYa46pp951XtW5EQMaXbFEJgwCmNj08KHSxsLhhOmL6XTipBP7Yied8PM1yXN+tWbLOi+bHwruG55UfIg8MAxgeHPh8NhxIPNC+l3z6uq0tEv2P9+3/vLzUz0CawDXpubeKLhvsKpCYbMDQHVT4XBu49hhNqDqKcGfQZxjT73rvFlBzuCgMOqFXFW/OjB2OLfpi08zQJbwzn3P9b1z3/MVuKa9eyw39w4GB4VZI0A2ffHp3EDxGQbIHBc/+VwKQBX+rQ08tv/dM42ijjC0cUy6/n0MrkEmiuX6dwKcT9ONnADJDBSfKdjA6Asjl1QNX5NRFz/5XAJyRuywz6fKLXSnExxVn08OyBFtZchgqB697cPlVg90xie+1gc50jWhvix1m4PYoq0XcgzIzk3FZ8aEEKPPX3fx3D80kfb2J37Y1wNkIEQQC27tXqi0AQDCtmXb68rsXvkPAQj3Exo3xKwX2jMPNJ5jz7nDBiYFUIBA6einP+J7K/mZu76egAwQC4AlhGgU32wh62XOdbvfja1uCHXvzG35X+d2rPF8oY41cwwx857lc12P2RCzbzuvb7xYXZs6Y0zMvo6Y69jOa92c99a4YoHZr5/zvty3e2a9DzHre+SIzb7ZeK/H1XmPu44nb895n4t8f2euVeC4en7PrNfP+ZnN+R6r25O2QOGFay8uIOLe8b0fpG0hcj1Av/tnFFPfQ+f72tP4PAr0iJmfDxo/75nX2o3nz/udmAaQPPDu9Qt+bv0IjjqEKAAYPfqZj1QX/S4EYG3uG31QIWILWDFgkMERueBwjlcXsstw9PlrL64iIi767g/6AKR6BHJQgTH3w+9TcFx94N3rF52m73Vw7AYwevSz14SyD/6s3d9I2EKkAFjCVTdkcMxcSAcHR+M31BZiMiZDpPTcNe8I5e/icn7nO99PAMjYQqQB9DbCIJjgGH/q0vVLLrPhVXBMAki/8tlrqkudLEzO+uRjfZBrkKRsIUOEwRGZ4HD9rDAOoHQcovSjj7w99CFy4Xe+n47J38thYOa9Bxgc9R4g8dSlC1dRHF4ER/bo7dd09KbUa/9KhoiASAMYYnBEKjjktUKgR7aHlI4D5R/9wdtD0aj61m9N9cWEsACkIJAC0Ov++RoIjqvLly5eRXG4g+MYgF6N4KgDsI7efk0ofgBeOeuvSglbIA0gLYB+BkekggO2aBx/WghRBlC2haj86PcvCuz3+G3fmkoCsGxZshhyfr5o/HxmBBwcYxND69PNvAd3cJQBDDUZHFO2ENbR28PZluGVs/66lAJE2qnKMDhmv9cODw7X6wUgG1crACq2QKUHqD73oYvKaFNy/EjSFkj0AElbliyGYvN+V0IRHFMArImhpasojlaCYwqA9cod10Y6NNzWfmo8ASAdk9tH9DM4IhkcrtfP/oDZwGSPAGwZLMec6wRwTN2HHvncpC3QByAZE0gAcjjA3OOFMDjqgEhODK2vokm6weFZaMSzRQszA7eWGkpcgRxRWnW+1FLwRqz71HjKFiIdA4YZHF0THFDB0Xh+j/Nv9f+eeT+zmSN2QHBsmxjaUIYGd3CUAAwvERxth4YKizRk3a7dUW+TmAmTMoCK2tEqEGf/zTcTtkAGahMrBgeDw32+DgqO6w9aGwrQ5A6OHIBdiwRHHRDWK3dc21IDUjxbTEOOefd7nskUZAmlDKAcVMlk3d9+My2E6pFR9zE4GBwdEBx7Jq0NLS3f2GxwXP3KHdct20UzV4CBsZhpqBBBAEFy9m2PJ225G14qJmZKVAwO5+gMDvlYKIJjbNLakEaLmgmOPa/ccZ1WKsWzxSTkzD2/1gdolTPRrrTUHhTtWnfb430x2SefA9DP4HCOzuCQjxkPjrZCA5gdHBaAiTnBMXX0c9dp7bcSzxYzAPLtXFRA6pArJpUhg8SX9pH+Tz9u2RDpmMAO5z4Gh/tY8hEGB4IKjrHyto1ptMkdHEkAR+YEx7ajn7uu3OzB4tliAZj5gHSYccgg8SVEEp/5VgKyITVtC9HP4HCOJR9hcCCI4Bg75EFoAK7gAICV2b0VCAyq00we/dx1VjMHiWeLfZB/uf1ahShovoZI/2e/nY4BadupyjE4GByuC/ApOMYOXeZNaMy9RkCOq5hSXzonKSA6oQHICUYPA6jGs8VCPFv0dEPu6ZuvLLx885UWgHMAjEFWm4j84mloAHNKHK1QPScPe3ExITcNWQoZ9bp3JnH7t/tkCURkAPSzxDH7fbHE0VaJY/fkZZty8FhbwaF6T8roviX7piB7jTyvypxz+3esmFwWbpjBweBoMziuP7x9UwE+aDc4KohWFUWX0zMzWsuPeDq78tw7vpuw5SzdTEyIXoDBweBoOjjqAFKHtg+U4ZOWgyOeLeYgV54maQoyQApeH/gt+e+lAWRstfQhg2P2dTA45IvVuad6BNKHtg/4ukxAS8ERzxYTAF72/GqioQ5ZjSl43RZybv57SVuITGxOlzeDwzn+7PO6H+uS4BgHkH7mPQO+z9lqNTgK6NzxGkEahyyFlL086FtGn+iD7PXKAOhncDjHn31e92NdEBzZpy8fCGwlPu3gUGM2fuHP5USWf9WY0SdStkAmBgwxOGaf1/1YhINjKiaQfvryzYGuxNdKcKQAPObP5UTeNNQS/l73xpy354kEZHduWqgJdgyOyAfHHgC5Z6/YHPiiWq0ERw76jaJ1zCzI407GKmbvIufs0Oaw1P/DNlmuXXXMBEjVywOft+fJPiEn2GVsIXu8GByRC44pW4jMs1dsLsMQr4PDCYgyZlbrKrd8dbPP29hcCXIhIFNT9b02BiDnx5T/8+58MgkgHYNIQbWFAAyODg6Oui3E6D+8d0sOhrUbHHXMXu8isHqW6tlJQQaJ3xvvBsGXhlTHhjv3JdW4kFQMoh9gcHRYcIwByPz9+7aGYq3fVntVLBhe+9PNVRpxgqSTSyOTkCWQsl8n2HjX/iSAtC2Q6nGVRBgcM68JUXCMAcj90/u3VhEibc9VCSM1FD6lvjp1ZKvvAQIAA5/f3yiJAGq6P4MjDMExBiD3jx84v4oQimRwuKkqjQXXtnodJpAAAYBNdz+VjAEpW+6v2whcBkdgwVEHUIqFODAckQ+OuVR3cidWaQILEAAYuOdAAqrUFhOze7UYHJ4HxzSAUQgU/vkD54eiDWM5XRccbqpKk0Zn9dIEGiAAsOXeA40NugFYQk26Y3C0HRzjAAr/etWg9kLgpnV1cLh1YIgEHiCOrfdNpABYxwVSMaCfwaEVHNMxIUYBlP7lqsEqOhSDYwEqRDLwZuMovxkLEADYev9E8jiEBdlLM8jgkLfnBMd0D1CyhSgc+WAyEpu0MziW4WoTCfukPqMBAgADD5T7YkDquPx+JW1nUebuDI4pQJQAlCrDF0QiLNwYHE1SY0WcEAlz74zxAHFs+sJkX0xuxJwEkBAQScjbjVJchIKjDqBkCzkY8vupt1ab/DZ1JAZHC1whYkHOrTE1VsQZ4g/MngdUDkNwLGbgoYPOnKSEEEgAwjoO9NlCDHZQcEwBqNhq3+If/u7bIleqWAqDwyNqNG1CfVnq7nYn501jZiJgFfKXFGEOhXZtLhxOHFffR1sgIUssog9AUriWUAQCC466DVR6BCq2/BlUnvu9C8tevudOxOAIgBqEltB4ScWvneU63UDxmYQtv5d9QogkAKiqUJ8rOIaaCI5pIURVPR8AKkKW2mALlHsAPPehi8q+v6EOxeAgIm1z170lIloWg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEjb/wMjwhH4i90hIgAAAABJRU5ErkJggg==" />';function b(i,e="question"){return i?A[i]?A[i]:i.includes(":")?`<ha-icon class="icon" icon="${i}"></ha-icon>`:A[e]??A.question:A[e]??A.question}function Ra(i,e={}){switch(String(i??"").split(".")[0]){case"light":return"bulb";case"switch":return"switchOn";case"cover":return e.device_class==="gate"?"gate":e.device_class==="awning"||e.device_class==="blind"?"awning":"shutter";case"person":case"device_tracker":return"person";case"climate":return"thermo";case"binary_sensor":return e.device_class==="smoke"?"smoke":"shield";case"alarm_control_panel":return"shield";case"scene":case"script":case"input_button":case"button":return"star";case"weather":return"cloudSun";case"date":return"calendar";case"time":case"datetime":return"clock";case"input_datetime":return e.has_time===!1?"calendar":"clock";case"input_select":case"select":return"keuzelijst";case"media_player":return e.device_class==="tv"?"tv":e.device_class==="receiver"?"radio":"speaker";default:return"question"}}function Te(i){switch(i){case"sunny":case"clear-night":return"sun";case"partlycloudy":return"cloudSun";case"cloudy":return"cloud";case"rainy":case"pouring":case"hail":case"lightning":case"lightning-rainy":return"rain";case"snowy":case"snowy-rainy":return"snow";case"fog":return"fog";case"windy":case"windy-variant":return"wind";default:return"cloud"}}var un=[["Woning",["house","homeLeave","homeStatus","homeThermo","floorB","floor1","floor2","garage","door","window","stairs","grid"]],["Kamers",["bed","bedDouble","wardrobe","hanger","sofa","lounge","eettafel","kitchen","shower","toilet","desk","speelkamer","garage","storage"]],["Buiten",["tree","parasol","veranda","fence","gate","sun","awning","gras","kruiden","car","beach"]],["Rolluiken",["shutter","shutterOpen","awning","gate","gateOpen","garageOpen","garageClosed","arrowUp","arrowDown","stop"]],["Licht en stroom",["bulb","bulbGroup","switchOn","power","plug","bolt","battery"]],["Personen",["person","people","away","dier"]],["Apparaten",["tv","speaker","camera","cctv","car","van","washer","dishwasher","koelkast","oven","magnetron","printer","printer3d","fan","airco","radio","boiler"]],["Media",["play","pause","next","prev","volume","volumeMute","shuffle","repeat","repeatOne","search","speakers","music"]],["Afval",["bin","binWheeled","calendar"]],["Verwarming en klimaat",["floorHeating","heatPump","circulatiepomp","boiler","thermo","homeThermo","celsius","gas","pressure","refill"]],["Auto en tanken",["car","petrol","diesel","gas","fuelStation","raceCar","plug"]],["Weer",["sun","cloud","cloudSun","rain","snow","fog","wind","drop","uv","sunrise","sunset","thermo"]],["Weermetingen",["humidity","lux","windSpeed","rainfall","weatherCode","forecast","weatherStation","rainRadar","pollenradar","uv","pressure","thermo"]],["Status",["shield","lock","lockOpen","key","wifi","smoke","smokeDetector","co","warning","check","handmatig","close","clock","gaugeArrow","bell","pressure","refill","sleep","siren","sirenOff","homeStatus"]],["Cijfers",["een","twee","drie","vier","vijf","zes","zeven","acht","negen","tien"]],["Sport en vrije tijd",["football","sports","dumbbell","raceCar","beach"]],["Overig",["star","moon","leaf","cog","qr","keuzelijst","dots","plus","minus","chevronRight","chevronDown","question","pencil","domotitech"]]],Ho={house:["huis","woning","thuis","home","hal","gang","entree","overzicht"],floorB:["begane grond","beneden","vloer","verdieping","etage","ground floor"],floor1:["1e verdieping","eerste","boven","vloer","etage","first floor"],floor2:["2e verdieping","tweede","zolder","vloer","etage","second floor"],garage:["garage","schuur","carport","berging"],door:["deur","voordeur","achterdeur","toegang","door","opening"],window:["raam","venster","ruit","window","kozijn"],stairs:["trap","overloop","traphal","stairs","treden","boven"],grid:["raster","kamers","overzicht","tegels","menu","grid","apps"],floorHeating:["vloerverwarming","vloer","verwarming","vloerverwarmingg","leidingen","cv","warm","underfloor","floor heating"],heatPump:["warmtepomp","pomp","buitenunit","heat pump","verwarming","koelen","airco","hybride"],qr:["qr","qr-code","qrcode","code","scan","wifi code","streepjescode","gast"],siren:["sirene","alarm","alarmsirene","geluid","brandalarm","siren","aan"],sirenOff:["sirene uit","alarm uit","sirene uitzetten","stil","dempen","siren off","uitschakelen"],petrol:["benzine","tanken","brandstof","pomp","benzinepomp","petrol","euro 95","brandstofpomp"],diesel:["diesel","tanken","brandstof","pomp","dieselpomp","druppel"],gas:["gas","aardgas","vlam","gasverbruik","gasmeter","brander","gaskachel"],fuelStation:["tankstation","tanken","pompstation","benzinestation","luifel","fuel station","brandstof"],homeThermo:["klimaat","klimaat in de woning","woning thermometer","binnentemperatuur","temperatuur","huis thermometer","verwarming","thermostaat"],homeStatus:["woning status","status","huis status","alles in orde","huisstatus","woning","controle","check"],lounge:["lounge","fauteuil","stoel","zithoek","loungestoel","zitkamer","relax"],dumbbell:["sportschool","halter","gewicht","fitness","gym","dumbbell","krachttraining","sporten"],storage:["opslag","dozen","berging","zolder","kelder","opbergen","voorraad","storage","kast"],celsius:["celsius","graden","temperatuur","graad","c","thermometer","warmte"],domotitech:["domotitech","logo","merk","website","domoti","domotica"],beach:["strand","zee","golven","kust","vakantie","zon en zee","beach","zomer","water"],sleep:["slapen","zzz","slaapstand","nachtmodus","slaap","sleep","rust","nacht","welterusten","dutje"],boiler:["ketel","cv","cv-ketel","boiler","verwarming","ketelstatus","boiler status","vlam","warmte"],pressure:["druk","bar","waterdruk","manometer","meter","pressure","keteldruk","spanning"],bell:["notificatie","melding","bel","meldingen","alert","waarschuwing","notification","bericht"],refill:["bijvullen","water bijvullen","vullen","water","peil","niveau","reservoir","refill","aanvullen"],football:["voetbal","bal","voetballen","sport","wedstrijd","football","soccer","eredivisie"],sports:["sport","sporten","sportief","bewegen","tennis","racket","wedstrijd","sports","verschillende sporten"],raceCar:["formule 1","f1","racewagen","raceauto","autosport","race","grand prix","verstappen","circuit"],cctv:["camera","bewakingscamera","cctv","beveiliging","toezicht","surveillance","buitencamera","beveiligingscamera"],bed:["slaapkamer","bed","slapen","slaap","sleep","bedroom","nacht","welterusten","logeerkamer"],bedDouble:["tweepersoonsbed","2 persoonsbed","bed","slaapkamer","slapen","sleep","double bed","twee personen","ouderslaapkamer","nacht"],wardrobe:["kledingkast","kast","garderobe","kleding","wardrobe","closet","inloopkast","slaapkamer"],hanger:["kleerhanger","hanger","kleding","kleren","garderobe","wasgoed","kledingkast","outfit"],sofa:["woonkamer","bank","sofa","zithoek","salon","living","livingroom","couch"],kitchen:["keuken","koken","pan","kitchen","cooking","eten","fornuis","kookplaat"],shower:["badkamer","douche","shower","bad","bathroom","wassen","sanitair"],toilet:["wc","toilet","sanitair","badkamer","restroom","plee"],desk:["kantoor","werkkamer","bureau","desk","office","computer","monitor","beeldscherm"],speelkamer:["speelkamer","kinderkamer","speelgoed","kinderen","kind","beer","teddybeer","knuffel","spelen","playroom","speelhoek"],tree:["tuin","boom","buiten","garden","tree","achtertuin","voortuin","groen","natuur"],parasol:["terras","buiten","parasol","tuin","balkon","veranda","zonnescherm","outdoor","patio"],fence:["erf","hek","buiten","tuin","schutting","oprit","poort","fence","omheining"],shutter:["rolluik","gordijn","zonwering","shutter","screen","jaloezie","dicht","gesloten","cover"],shutterOpen:["rolluik open","gordijn open","zonwering","shutter","cover","omhoog"],awning:["zonnescherm","luifel","markies","awning","terras","zonwering","buiten"],gate:["poort","hek","toegangspoort","oprit","inrit","gate","schuifpoort","draaipoort","erf","dicht","gesloten"],gateOpen:["poort open","poort","hek open","gate open","oprit","toegang","geopend","open"],garageOpen:["garagedeur open","garage","deur open","omhoog","geopend"],garageClosed:["garagedeur dicht","garage","deur dicht","gesloten","omlaag"],arrowUp:["omhoog","pijl omhoog","open","up","boven","openen","stijgen"],arrowDown:["omlaag","pijl omlaag","dicht","down","beneden","sluiten","dalen"],stop:["stop","stoppen","halt","vierkant","square"],bulb:["lamp","licht","verlichting","peer","light","bulb","spot","schemerlamp"],bulbGroup:["lampen","lichtgroep","verlichting","groep","lights","alle lampen"],switchOn:["schakelaar","knop","switch","aan uit","toggle","aanuit"],power:["aan uit","power","stroom","uitknop","aanknop","standby"],plug:["stopcontact","stekker","plug","socket","outlet","smart plug"],bolt:["stroom","energie","bliksem","elektriciteit","verbruik","power","energy","watt","kwh"],battery:["batterij","accu","battery","lading","opladen","percentage"],person:["persoon","iemand","gebruiker","person","wie","profiel","aanwezig"],people:["personen","mensen","gezin","iedereen","familie","people","gasten"],away:["weg","afwezig","niet thuis","away","vertrokken","uit huis"],dier:["dier","huisdier","hond","kat","poot","pootafdruk","pet","animal","beest"],homeLeave:["woning verlaten","verlaten","weggaan","vertrekken","huis uit","afsluiten","de deur uit","leave","exit","weg","huis"],tv:["televisie","tv","scherm","kijken","netflix","mediaspeler","chromecast"],speaker:["speaker","luidspreker","boxje","geluid","audio","sonos"],camera:["camera","beveiliging","bewaking","cctv","deurbel","opname","beeld"],car:["auto","wagen","car","laadpaal","opladen","voertuig","oprit","buiten"],washer:["wasmachine","was","wassen","washer","wasdroger","droger","laundry","wasruimte"],dishwasher:["vaatwasser","afwas","vaat","dishwasher","afwasmachine"],van:["bus","bedrijfsbus","bestelbus","bestelwagen","busje","transit","auto","van","camper","werkbus"],handmatig:["handmatig","hand","zelf","met de hand","bedienen","tikken","manueel","handbediening","override"],koelkast:["koelkast","koeling","vriezer","diepvries","fridge","keuken","vriescombinatie"],oven:["oven","bakoven","fornuis","keuken","bakken","stoomoven"],magnetron:["magnetron","microgolf","opwarmen","keuken","combimagnetron"],eettafel:["eettafel","tafel","eten","eetkamer","diner","keukentafel","stoelen"],veranda:["veranda","overkapping","terrasoverkapping","afdak","carport","buiten","tuinkamer"],pollenradar:["pollen","pollenradar","hooikoorts","allergie","stuifmeel","radar","verwachting"],gras:["gras","graspollen","grasmaaier","gazon","hooikoorts","pollen","tuin"],kruiden:["kruiden","kruidpollen","bijvoet","onkruid","plant","pollen","hooikoorts"],circulatiepomp:["circulatiepomp","pomp","cv","cv-pomp","verwarming","circulatie","vloerverwarming"],printer:["printer","printen","papier","print"],printer3d:["3d printer","3d-printer","bambu","prusa","filament","printer","nozzle","printen"],fan:["ventilator","fan","ventilatie","afzuiging","wtw","luchtverversing","koelen"],airco:["airco","airconditioning","koeling","warmtepomp","klimaat","verwarming","hvac"],radio:["radio","zender","fm","stream","muziek","antenne"],play:["afspelen","play","start","spelen","muziek","starten"],pause:["pauze","pause","pauzeren","stil","onderbreken"],next:["volgende","next","verder","vooruit","overslaan","skip"],prev:["vorige","previous","terug","achteruit","prev"],volume:["volume","geluid","harder","luid","audio","sound"],volumeMute:["stil","mute","gedempt","geluid uit","dempen"],shuffle:["willekeurig","shuffle","husselen","door elkaar","random"],repeat:["herhalen","repeat","loop","opnieuw","herhaling"],repeatOne:["een herhalen","repeat one","herhalen","loop","dit nummer"],search:["zoeken","zoek","search","vergrootglas","vinden","opzoeken"],speakers:["speakers","groep","multiroom","luidsprekers","audio","koppelen"],music:["muziek","noot","music","nummer","liedje","spotify","audio"],bin:["afval","vuilnis","prullenbak","bak","container","waste","trash","kliko"],binWheeled:["kliko","container","afval","vuilnisbak","rolcontainer","ophaaldag","waste"],calendar:["agenda","kalender","datum","afspraak","planning","calendar","dag"],sun:["zon","zonnig","helder","sun","zonnepanelen","dag","weer","buiten"],cloud:["bewolkt","wolk","cloud","betrokken","grijs","weer"],cloudSun:["halfbewolkt","wolk","zon","weer","wisselend","partly cloudy"],rain:["regen","buien","nat","rain","neerslag","weer","paraplu"],snow:["sneeuw","winter","vorst","snow","koud","ijs","weer"],fog:["mist","nevel","fog","zicht","weer"],wind:["wind","waait","storm","bries","windkracht","weer"],drop:["druppel","vocht","luchtvochtigheid","water","regen","humidity","nat","lekkage"],uv:["uv","uv index","zon","straling","zonkracht","huid"],humidity:["vochtigheid","luchtvochtigheid","vocht","humidity","procent","rv","hygrometer","weer"],lux:["lux","lichtsterkte","helderheid","verlichtingssterkte","illuminance","lichtsensor","lichtmeter","lumen"],windSpeed:["windsnelheid","wind","windkracht","beaufort","anemometer","wind speed","km/u","storm","weer"],rainfall:["regen","neerslag","regenmeter","millimeter","mm","rainfall","buien","hoeveelheid","weer"],weatherCode:["weercode","code","weather code","weertype","conditie","weer"],forecast:["voorspelling","verwachting","forecast","vooruitzicht","morgen","weerbericht","weer"],weatherStation:["weerstation","station","meetstation","weather station","mast","anemometer","weer"],rainRadar:["buienradar","regenradar","radar","buien","neerslagradar","rain radar","weer"],sunrise:["zonsopkomst","opkomst","ochtend","sunrise","dageraad","vroeg"],sunset:["zonsondergang","ondergang","avond","sunset","schemer"],thermo:["temperatuur","thermometer","graden","warm","koud","thermostaat","klimaat","verwarming"],shield:["beveiliging","schild","alarm","veilig","bescherming","shield","security"],lock:["slot","op slot","vergrendeld","gesloten","lock","sleutel","dicht","beveiligd"],lockOpen:["slot open","ontgrendeld","geopend","unlock","los","open"],key:["sleutel","key","toegang","code","wachtwoord","slot"],wifi:["wifi","netwerk","internet","verbinding","router","signaal","wlan"],smoke:["rookmelder","rook","brand","smoke","melder","vuur","alarm"],smokeDetector:["rookmelder","melder","rook","brand","smoke detector","detector","plafond","alarm"],co:["koolmonoxide","co","gas","melder","cv","kachel","carbon monoxide","vergiftiging"],warning:["waarschuwing","let op","attentie","warning","uitroepteken","storing","probleem"],check:["goed","vinkje","in orde","klaar","check","gelukt"],close:["sluiten","kruis","dicht","annuleren","close","weg"],clock:["klok","tijd","uur","wekker","timer","clock","wanneer"],gaugeArrow:["meter","wijzer","stand","gauge","niveau","druk","snelheid"],een:["1","een","eerste","one"],twee:["2","twee","tweede","two"],drie:["3","drie","derde","three"],vier:["4","vier","vierde","four"],vijf:["5","vijf","vijfde","five"],zes:["6","zes","zesde","six"],zeven:["7","zeven","zevende","seven"],acht:["8","acht","achtste","eight"],negen:["9","negen","negende","nine"],tien:["10","tien","tiende","ten"],star:["ster","favoriet","star","belangrijk","voorkeur","top"],moon:["maan","nacht","slapen","donker","moon","nachtstand","avond"],leaf:["blad","groen","eco","duurzaam","plant","natuur","besparen","tuin"],keuzelijst:["keuzelijst","keuze","lijst","modus","stand","programma","dropdown","select","kiezen","opties"],cog:["instellingen","tandwiel","beheer","settings","configuratie","opties","systeem"],dots:["meer","drie puntjes","menu","opties","extra","overig","more"],plus:["plus","meer","erbij","toevoegen","hoger","omhoog","add"],minus:["min","minder","eraf","lager","verwijderen","omlaag"],chevronRight:["pijl rechts","verder","volgende","chevron","open","meer"],chevronDown:["pijl omlaag","uitklappen","openklappen","chevron","meer","dropdown"],question:["vraagteken","onbekend","hulp","help","vraag","geen idee"],pencil:["potlood","bewerken","wijzigen","aanpassen","edit","pen","instellen"]},Va=i=>String(i??"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();function Jc(i,e){let t=[...(Ho[i]??[]).map(Va),Va(i)],n=0;for(let a=0;a<t.length;a++){let r=t[a];if(!r)continue;let o=0;for(let s of[r,...r.split(" ")])s===e?o=Math.max(o,3):s.startsWith(e)?o=Math.max(o,2):s.includes(e)&&(o=Math.max(o,1));if(o&&(n=Math.max(n,o+.5/(1+a))),n>=3.5)break}return n}function ep(i,e){let t=0;for(let n of e){let a=Jc(i,n);if(!a)return 0;t+=a}return t}var Oe=i=>Ho[i]?.[0]??i;function tp(i=un){let e=[];for(let[,t]of i)for(let n of t)e.includes(n)||e.push(n);return e}function Ro(i,e=un){let t=Va(i).split(" ").filter(Boolean);if(!t.length)return e;let n=[];for(let a of tp(e)){let r=ep(a,t);r&&n.push({sleutel:a,score:r})}return n.sort((a,r)=>r.score-a.score||Oe(a.sleutel).localeCompare(Oe(r.sleutel))),[[`${n.length} gevonden`,n.map(a=>a.sleutel)]]}var np=`
  :host { ${G} display: block; font-family: var(--dac-font); }
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
`,Ia=null,Vo=i=>i.map(([e,t])=>`
      <div class="group">
        <h4>${e}</h4>
        <div class="grid">
          ${t.map(n=>`<button type="button" class="opt" data-icon="${n}" title="${Oe(n)} (${n})" aria-pressed="false">${A[n]??""}<span class="naam">${Oe(n)}</span></button>`).join("")}
        </div>
      </div>`).join(""),Pa=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),Ia=Ia??[F(np)],this.shadowRoot.adoptedStyleSheets=Ia,this.value_="",this.vraag_="",this.label="Icoon",this.fallback="question",this.auto=!0}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}connectedCallback(){this.built_||(this.built_=!0,this.build_())}build_(){this.shadowRoot.innerHTML=`
      <div class="label"></div>
      <div class="box">
        <button type="button" class="current" aria-expanded="false">
          <span class="preview"></span>
          <span class="who"><b></b><small></small></span>
          <span class="caret">${A.chevronDown}</span>
        </button>
        <div class="panel">
          <div class="zoekrij">
            <span class="zoekveld">
              <span class="loep">${A.search}</span>
              <input id="zoek" type="search" placeholder="Zoek een icoon -- slapen, gordijn, vaatwasser"
                     spellcheck="false" autocomplete="off" />
              <button type="button" class="wis" title="Zoekopdracht wissen">${A.close}</button>
            </span>
          </div>
          <div class="groepen">${Vo(un)}</div>
          <div class="mdi">
            <label for="mdi">Of Home Assistant-icoon</label>
            <input id="mdi" type="text" placeholder="mdi:washing-machine" spellcheck="false" />
            <button type="button" class="clear">Wissen</button>
          </div>
        </div>
      </div>`,this.$(".current").addEventListener("click",()=>{let n=this.toggleAttribute("open");this.$(".current").setAttribute("aria-expanded",String(n)),n&&requestAnimationFrame(()=>this.$("#zoek").focus())});let e=this.$("#zoek");e.addEventListener("input",()=>this.zoek_(e.value)),e.addEventListener("keydown",n=>{if(n.key==="Escape"){n.stopPropagation(),this.zoek_(""),e.value="";return}if(n.key!=="Enter")return;let a=this.shadowRoot.querySelectorAll(".opt");a.length===1&&(n.preventDefault(),this.emit_(a[0].dataset.icon))}),this.$(".wis").addEventListener("click",()=>{e.value="",this.zoek_(""),e.focus()}),this.$(".groepen").addEventListener("click",n=>{let a=n.target.closest?.(".opt");a&&this.emit_(a.dataset.icon)});let t=this.$("#mdi");t.addEventListener("change",()=>this.emit_(t.value.trim())),this.$(".clear").addEventListener("click",()=>this.emit_("")),this.paint_()}zoek_(e){this.vraag_=e??"",this.toggleAttribute("zoekt",!!this.vraag_.trim());let t=Ro(this.vraag_),n=this.$(".groepen"),a=t.length===1&&!t[0][1].length;n.innerHTML=a?`<div class="niets">Geen icoon gevonden voor "${this.vraag_.trim()}".<br>Een <code>mdi:</code>-naam hieronder werkt altijd.</div>`:Vo(t),n.scrollTop=0,this.markeer_()}markeer_(){for(let e of this.shadowRoot.querySelectorAll(".opt"))e.setAttribute("aria-pressed",String(e.dataset.icon===this.value_))}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Icoon";let e=this.value_,t=e||this.fallback||"question";this.$(".preview").innerHTML=b(t,this.fallback),this.$(".who b").textContent=e?e.includes(":")?e:Oe(e):this.auto?"Automatisch":"Kies een icoon",this.$(".who small").textContent=e?e.includes(":")?"Home Assistant-icoon":`DomotiApp-icoon -- ${e}`:this.auto?"Past zich aan de entiteit aan":"Nog niets gekozen",this.markeer_();let n=this.$("#mdi");if(this.shadowRoot.activeElement===n)return;let a=e&&e.includes(":")?e:"";n.value!==a&&(n.value=a)}emit_(e){this.value_=e,this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};L("dac-icon-picker",Pa);var ap=/^(#[0-9a-f]{3,8}|var\(--[\w-]+\)|rgba?\([^)]*\))$/i,ip=`
  :host { ${G} display: block; font-family: var(--dac-font); }
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
`,Ba=null,Ka=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),Ba=Ba??[F(ip)],this.shadowRoot.adoptedStyleSheets=Ba,this.value_="",this.label="Kleur"}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}set compact(e){this.toggleAttribute("compact",!!e)}get compact(){return this.hasAttribute("compact")}connectedCallback(){this.built_||(this.built_=!0,this.build_())}kleur_(){return E[this.value_]??this.value_}build_(){this.shadowRoot.innerHTML=`
      <div class="label"></div>
      <div class="box">
        <div class="rij">
          <span class="sw eigen leeg" role="button" tabindex="-1" title="Kleur kiezen"
                aria-pressed="false">
            ${A.check}
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
      </div>`;let e=this.$('input[type="color"]');e.addEventListener("input",()=>this.emit_(e.value));let t=this.$("#vrij");t.addEventListener("change",()=>{let n=t.value.trim();if(!n){this.emit_("");return}let a=ap.test(n);t.setAttribute("aria-invalid",String(!a)),a&&this.emit_(n)}),this.$(".wissen").addEventListener("click",()=>this.emit_("")),this.paint_()}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Kleur";let e=!!this.value_,t=this.$(".sw");t.setAttribute("aria-pressed",String(e)),t.classList.toggle("leeg",!e),t.style.setProperty("--c",e?this.kleur_():"transparent"),t.title=e?`Kleur: ${Co[this.value_]??this.value_}`:"Kleur kiezen",/^#[0-9a-f]{6}$/i.test(this.kleur_())&&(this.$('input[type="color"]').value=this.kleur_()),this.$(".wissen").hidden=!e;let n=this.$("#vrij");if(this.shadowRoot.activeElement!==n){let a=this.value_ in E?"":this.value_;n.value!==a&&(n.value=a),n.setAttribute("aria-invalid","false")}}emit_(e){this.value_=e??"",this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.value_},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};L("dac-tone-picker",Ka);var m={entity:i=>({entity:i?{domain:i}:{}}),text:()=>({text:{}}),multiline:()=>({text:{multiline:!0}}),bool:()=>({boolean:{}}),number:(i,e,t=1)=>({number:{min:i,max:e,step:t,mode:"box"}}),select:i=>({select:{mode:"dropdown",options:i}}),action:(i="more-info")=>({ui_action:{default_action:i}})},$e=(...i)=>({type:"grid",name:"",schema:i}),Fe=(i,e,t,n=!1)=>({type:"expandable",name:"",title:i,icon:e,expanded:n,schema:t}),rp=[{name:"bare",selector:m.bool()}],op={bare:"Haalt de vulling en de schaduw onder de kaart weg. De rand blijft staan, zodat de kaart nog een vorm heeft op een dashboard zonder vlakken."},D=class extends HTMLElement{constructor(){super(),this.config_={},this.built_=!1}setConfig(e){this.config_={...this.defaults(),...e},this.render_()}defaults(){return{}}set hass(e){this.hass_=e,this.form_&&(this.form_.hass=e);for(let t of this.pickers_??[])t.hass=e;this.render_()}get hass(){return this.hass_}connectedCallback(){this.render_()}schema(){return[]}gedeeldeVelden(){return rp}volledigSchema_(){return[...this.schema(),...this.gedeeldeVelden()]}pickers(){return[]}label(e){return e.type==="expandable"?e.title??"":sp[e.name]??e.name}helper(){}async render_(){if(!this.hass_||!this.config_)return;if(this.built_){this.sync_();return}this.built_=!0,await customElements.whenDefined("ha-form"),this.replaceChildren(),this.pickers_=[];let e=this.pickers();this.pickerSig_=e.map(o=>o.key).join("|");let t=o=>{let s=document.createElement("div");return s.style.cssText=`display:flex;flex-direction:column;gap:12px;${o}`,s},n=t("margin-bottom:16px"),a=t("margin-top:16px");for(let o of e){let s=document.createElement({tone:"dac-tone-picker",foto:"dac-foto-picker"}[o.kind]??"dac-icon-picker");s.label=o.label,s.fallback=o.fallback,o.auto===!1&&(s.auto=!1),o.statuses===!1&&(s.statuses=!1),o.compact&&(s.compact=!0),s.hass=this.hass_,s.value=this.config_[o.key],s.addEventListener("value-changed",l=>{l.stopPropagation(),this.patch_({[o.key]:l.detail.value})}),this.pickers_.push(s),s.dataset.key=o.key,(o.after?a:n).appendChild(s)}n.children.length&&this.appendChild(n);let r=document.createElement("ha-form");r.hass=this.hass_,r.data=this.config_,r.schema=this.volledigSchema_(),r.computeLabel=o=>this.label(o),r.computeHelper=o=>this.helper(o)??op[o.name],r.addEventListener("value-changed",o=>{o.stopPropagation(),this.patch_(o.detail.value,!0)}),this.form_=r,this.appendChild(r),a.children.length&&this.appendChild(a)}sync_(){let e=this.pickers().map(t=>t.key).join("|");if(this.pickerSig_!==void 0&&this.pickerSig_!==e){this.built_=!1,this.form_=null,this.render_();return}this.form_&&(this.form_.hass=this.hass_,this.form_.schema=this.volledigSchema_(),this.form_.data=this.config_);for(let t of this.pickers_??[])t.hass=this.hass_,t.value=this.config_[t.dataset.key]}patch_(e,t=!1){let n=t?{...e}:{...this.config_,...e};this.config_.type&&(n.type=this.config_.type);for(let[a,r]of Object.entries(n))(r===""||r===void 0||r===null)&&delete n[a];this.config_=n,this.sync_(),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.serialize(n)},bubbles:!0,composed:!0}))}serialize(e){return e}},sp={entity:"Entiteit",entities:"Entiteiten",name:"Naam",icon:"Icoon",tone:"Kleur",secondary:"Tweede regel",layout:"Vorm",tap_action:"Tikken",hold_action:"Vasthouden",double_tap_action:"Dubbeltikken",show_state:"Status tonen",show_name:"Naam tonen",show_icon:"Icoon tonen",fill:"Vullen",collapsible:"Inklapbaar",title:"Titel",subtitle:"Ondertitel",weather:"Weerentiteit",sun:"Zon-entiteit",person:"Persoon",persons:"Personen",covers:"Rolluiken",lights:"Lampen",sensors:"Sensoren",greeting:"Begroeting",show_clock:"Klok tonen",show_weather:"Weer tonen",show_chips:"Weerdetails tonen",compact:"Compact",columns:"Kolommen",group:"Groepsregel tonen",invert:"Open en dicht omdraaien",label:"Label",color:"Kleur",date_format:"Datumnotatie",bare:"Achtergrond weglaten"};function lp(i=new Date){let e=i.getHours();return e<6?"Goedenacht":e<12?"Goedemorgen":e<18?"Goedemiddag":"Goedenavond"}var dp=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],cp=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],Ga={humidity:{icon:"drop",tone:"water",label:"Luchtvochtigheid"},wind:{icon:"wind",tone:"neutral",label:"Wind"},uv:{icon:"uv",tone:"solar",label:"UV-index"},precipitation:{icon:"rain",tone:"water",label:"Neerslag"},pressure:{icon:"gaugeArrow",tone:"neutral",label:"Luchtdruk"},sunrise:{icon:"sunrise",tone:"warn",label:"Zonsopkomst"},sunset:{icon:"sunset",tone:"warn",label:"Zonsondergang"}},pp=["humidity","wind","uv","precipitation","sunset"],hp=i=>i==null||Number.isNaN(+i)?"":["N","NO","O","ZO","Z","ZW","W","NW"][Math.round(+i/45)%8],mn=class extends S{validate(e){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768,...e}}watched(){let e=this.config;return[e.weather,e.weather_uv,e.sun,e.precipitation_entity].filter(Boolean)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.show_rule===!1&&this.setAttribute("no-rule",""),`
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
      </div>`}wire(){let e=()=>{let n=6e4-Date.now()%6e4+50;this.timer_=setTimeout(()=>{this.paintClock_(),e()},n)};e(),this.teardown_.push(()=>clearTimeout(this.timer_));let t=Number(this.config.hide_below)||0;if(t>0){let n=matchMedia(`(max-width: ${t-1}px)`),a=()=>this.toggleAttribute("narrow",n.matches);a(),n.addEventListener("change",a),this.teardown_.push(()=>n.removeEventListener("change",a))}}paintClock_(){let e=new Date,t=this.config.name??this.hass?.user?.name??"",n=lp(e);this.$(".hello").innerHTML=t?`${n}, <b>${t}</b>`:n,this.text(".date",`${dp[e.getDay()]} ${e.getDate()} ${cp[e.getMonth()]}`);let a=this.$(".clock");a&&this.text(a,e.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"}))}paint(){this.paintClock_();let e=this.config,t=v(this.hass,e.weather),n=q(this.hass,e.weather),a=this.$(".now");if(a&&t){let l=Te(t.state);a.style.setProperty("--wtone",Z(e.tone,"water"));let d=this.hass?.config?.unit_system?.temperature??"\xB0C";this.$(".temp").innerHTML=n.temperature!=null?`${B(this.hass,n.temperature,0)}<span>${d}</span>`:"--";let c=a.querySelector(".ic");c.dataset.icon!==l&&(c.dataset.icon=l,c.innerHTML=b(l,"cloud")),this.text(a.querySelector(".cond"),J(this.hass,t))}let r=this.$(".chips");if(!r)return;let o=pp.map(l=>this.chip_(l,n)).filter(Boolean),s=o.map(l=>`${l.key}${l.value}`).join("|");r.dataset.sig!==s&&(r.dataset.sig=s,r.innerHTML=o.map(l=>`<span class="chip2" style="--tone:${Z(Ga[l.key].tone)}" title="${Ga[l.key].label}">
             ${A[Ga[l.key].icon]??""}${l.value}
           </span>`).join(""))}chip_(e,t){let n=this.config;switch(e){case"humidity":return t.humidity!=null?{key:e,value:`${Math.round(t.humidity)}%`}:null;case"wind":{if(t.wind_speed==null)return null;let a=this.hass?.config?.unit_system?.wind_speed??"km/h",r=hp(t.wind_bearing);return{key:e,value:`${B(this.hass,t.wind_speed,0)} ${a}${r?` ${r}`:""}`}}case"uv":{let r=q(this.hass,n.weather_uv).uv_index??t.uv_index??(n.weather_uv?Number(v(this.hass,n.weather_uv)?.state):null);return r!=null&&!Number.isNaN(+r)?{key:e,value:`UV ${B(this.hass,r,1)}`}:null}case"precipitation":{let a=v(this.hass,n.precipitation_entity);if(a){let r=Number(a.state);if(Number.isNaN(r))return null;let o=a.attributes.unit_of_measurement??"mm";return{key:e,value:`${B(this.hass,r,1)} ${o}`}}return t.precipitation!=null&&!Number.isNaN(+t.precipitation)?{key:e,value:`${B(this.hass,t.precipitation,1)} mm`}:null}case"pressure":return t.pressure!=null?{key:e,value:`${B(this.hass,t.pressure,0)} ${t.pressure_unit??"hPa"}`}:null;case"sunset":case"sunrise":{let r=v(this.hass,n.sun)?.attributes?.[e==="sunset"?"next_setting":"next_rising"];if(!r)return null;let o=new Date(r);return Number.isNaN(+o)?null:{key:e,value:o.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"})}}default:return null}}getCardSize(){return 2}getGridOptions(){return{columns:"full",rows:2,min_rows:2,max_rows:2}}static getConfigElement(){return document.createElement("domotiapp-header-card-editor")}static getStubConfig(e){return{weather:Object.keys(e?.states??{}).find(n=>n.startsWith("weather.")),sun:"sun.sun"}}};_(mn,"css",`
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
  `);var Wa=class extends D{defaults(){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768}}schema(){return[$e({name:"weather",selector:m.entity("weather")},{name:"weather_uv",selector:{entity:{domain:["weather","sensor"]}}}),$e({name:"sun",selector:m.entity("sun")},{name:"precipitation_entity",selector:m.entity("sensor")}),{name:"name",selector:m.text()},{name:"hide_below",selector:m.number(0,1400,8)}]}label(e){return{weather:"Weer (temperatuur, wind)",weather_uv:"Tweede weerbron (UV-index)",precipitation_entity:"Neerslagsensor",show_rule:"Accentlijn tonen",hide_below:"Verbergen onder breedte (px)",name:"Naam"}[e.name]??super.label(e)}helper(e){if(e.name==="weather_uv")return"Alleen voor de UV-index. Handig als je hoofdbron die niet meelevert.";if(e.name==="precipitation_entity")return"Een sensor in mm of mm/h, bijvoorbeeld neerslagintensiteit of regen laatste uur.";if(e.name==="hide_below")return"768 verbergt de header op telefoons en houdt hem op tablets en desktops. 0 zet het uit.";if(e.name==="name")return"Leeg laten voor de naam van de ingelogde gebruiker."}};H("domotiapp-header-card-editor",Wa);N("domotiapp-header-card",mn,{name:"DomotiApp Header",description:"Smalle strip met begroeting, weer en klok. Verbergt zichzelf op telefoons."});var gn=class extends S{validate(e){return{icon:"",tone:"accent",line:!0,...e}}watched(){return this.config.secondary_entity?[this.config.secondary_entity]:[]}template(){let e=this.config,t=e.icon!==null&&e.icon!==!1;return t||this.setAttribute("no-icon",""),`
      <div class="sep" style="--tone:${Z(e.tone)}">
        ${t?`<span class="chip">${b(e.icon,"star")}</span>`:""}
        <h3></h3>
        ${e.line===!1?"":'<span class="rule"></span>'}
        <span class="sub"><span class="si"></span><span class="sv"></span></span>
      </div>`}paint(){this.text("h3",this.config.name??"");let e=this.$(".sub");if(!e)return;let t=v(this.hass,this.config.secondary_entity),n=e.querySelector(".si"),a=e.querySelector(".sv");if(!t){a.textContent="",n.innerHTML="";return}let r=this.config.secondary_icon??"";n.dataset.icon!==r&&(n.dataset.icon=r,n.innerHTML=r?b(r):"");let o=t.attributes.unit_of_measurement;a.textContent=o?`${t.state} ${o}`:t.attributes.current_temperature!=null?`${t.attributes.current_temperature} \xB0C`:J(this.hass,t)}getCardSize(){return 1}getGridOptions(){return{columns:"full",rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-separator-card-editor")}static getStubConfig(){return{name:"Nieuwe sectie",icon:"house",tone:"accent"}}};_(gn,"css",`
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
  `);var Ua=class extends D{defaults(){return{line:!0,tone:"accent"}}gedeeldeVelden(){return[]}pickers(){return[{key:"icon",kind:"icon",label:"Icoon links",fallback:"star",auto:!1},{key:"secondary_icon",kind:"icon",label:"Icoon bij de waarde rechts",auto:!1}]}schema(){return[{name:"name",selector:m.text()},{name:"line",selector:m.bool()},{name:"secondary_entity",selector:m.entity()}]}label(e){return{line:"Lijn tonen",secondary_entity:"Waarde rechts (optioneel)"}[e.name]??super.label(e)}helper(e){if(e.name==="secondary_entity")return"Toont de status van deze entiteit rechts van de lijn, bijvoorbeeld een temperatuur of een aantal."}};H("domotiapp-separator-card-editor",Ua);N("domotiapp-separator-card",gn,{name:"DomotiApp Separator",description:"Sectiekop met icoon en vervagende lijn."});var Fa=(i,e,t)=>Math.min(t,Math.max(e,i));function De(i,e){let t=e.min??0,n=e.max??100,a=e.step??1,r=!1,o=f=>{let k=i.getBoundingClientRect();if(!k.width)return t;let x=Fa((f-k.left)/k.width,0,1),$=t+x*(n-t);return Fa(Math.round($/a)*a,t,n)},s=f=>{try{i.setPointerCapture?.(f)}catch{}},l=f=>{try{i.hasPointerCapture?.(f)&&i.releasePointerCapture(f)}catch{}},d=f=>{e.disabled?.()||f.button!=null&&f.button!==0||(r=!0,s(f.pointerId),i.classList.add("dragging"),e.onInput(o(f.clientX)),f.preventDefault())},c=f=>{r&&(e.onInput(o(f.clientX)),f.preventDefault())},p=f=>{r&&(r=!1,l(f.pointerId),i.classList.remove("dragging"),e.onCommit(o(f.clientX)))},h=f=>{r&&(r=!1,l(f?.pointerId),i.classList.remove("dragging"),e.onInput(e.value()))},g=f=>{if(e.disabled?.())return;let k=(n-t)/10,x={ArrowLeft:-a,ArrowDown:-a,ArrowRight:a,ArrowUp:a,PageDown:-k,PageUp:k,Home:-1/0,End:1/0};if(!(f.key in x))return;f.preventDefault();let $=e.value(),w=Fa(x[f.key]===-1/0?t:x[f.key]===1/0?n:$+x[f.key],t,n);e.onInput(w),e.onCommit(w)};return i.addEventListener("pointerdown",d),i.addEventListener("pointermove",c),i.addEventListener("pointerup",p),i.addEventListener("pointercancel",h),i.addEventListener("keydown",g),()=>{i.removeEventListener("pointerdown",d),i.removeEventListener("pointermove",c),i.removeEventListener("pointerup",p),i.removeEventListener("pointercancel",h),i.removeEventListener("keydown",g)}}var fe=(i="")=>`
  <div class="slider ${i}" role="slider" tabindex="0"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div class="track"><div class="fill"></div></div>
    <div class="thumb"></div>
  </div>`,Le=`
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
`;var up=new Set(["brightness","color_temp","hs","rgb","rgbw","rgbww","xy","white"]),mp=new Set(["hs","rgb","rgbw","rgbww","xy"]),Za=i=>i?.attributes?.supported_color_modes??[],gp=i=>Za(i).some(e=>up.has(e)),fn=i=>Za(i).some(e=>mp.has(e)),bn=i=>Za(i).includes("color_temp"),Io=i=>Math.max(1,Math.round((i??0)/255*100)),vn=class extends S{validate(e){let t=e.entity??e.lights?.[0]??e.entities?.[0],n=typeof t=="string"?t:t?.entity;return n?{show_colour:!0,...e,entity:n}:{...e,[C]:"Kies een lamp."}}watched(){return[this.config.entity]}template(){return this.config.bare&&this.setAttribute("bare",""),`
      <div class="card surface">
        <div class="lamp" data-on="false" style="--tone:var(--dac-lit)">
          <button class="chip" type="button" aria-label="Aan of uit"></button>
          <span class="txt"><span class="nm"></span><span class="v tnum"></span></span>
          <span class="ctl" style="display:contents"></span>
        </div>
        <div class="colour" hidden></div>
      </div>`}wire(){let e=this.config.entity;this.teardown_.push(W(this.$(".chip"),{onTap:()=>this.hass.callService("light","toggle",{entity_id:e}),onHold:()=>P(this,e)})),this.on(this.$(".card"),"click",t=>{t.target.closest(".toggle")&&this.hass.callService("light","toggle",{entity_id:e})}),this.teardown_.push(R(this.$(".card"))),this.sliders_=new Map}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let a=De(e,n);this.sliders_.set(t,a),this.teardown_.push(a)}setSlider_(e,t,n=0,a=100){if(!e)return;let r=a>n?(t-n)/(a-n)*100:0;e.style.setProperty("--v",`${r}%`),e.setAttribute("aria-valuemin",String(n)),e.setAttribute("aria-valuemax",String(a)),e.setAttribute("aria-valuenow",String(t))}paint(){let e=this.config,t=v(this.hass,e.entity),n=ne(t),a=t?.state==="on",r=this.$(".lamp");r.dataset.on=String(a),r.classList.toggle("unavailable",n);let o=this.$(".chip"),s=e.icon||"bulb";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=b(s,"bulb")),this.text(".nm",M(this.hass,e.entity,e.name));let l=a?t?.attributes?.rgb_color:null;r.style.setProperty("--tone",l?`rgb(${l[0]},${l[1]},${l[2]})`:"var(--dac-lit)");let d=this.$(".ctl"),c=n?"none":gp(t)?"range":"toggle";if(d.dataset.kind!==c&&(d.dataset.kind=c,d.innerHTML=c==="range"?fe("brightness"):c==="toggle"?'<button class="toggle" type="button" role="switch" aria-checked="false" aria-label="Aan of uit"></button>':"",this.sliders_.delete("brightness")),c==="range"){let p=d.querySelector(".slider");if(this.attach_(p,"brightness",{value:()=>t?.state==="on"?Io(v(this.hass,e.entity)?.attributes?.brightness):0,onInput:h=>{this.setSlider_(p,h),this.text(".v",h===0?"Uit":`${h}%`)},onCommit:h=>{h===0?this.hass.callService("light","turn_off",{entity_id:e.entity}):this.hass.callService("light","turn_on",{entity_id:e.entity,brightness_pct:h})},disabled:()=>ne(v(this.hass,e.entity))}),!p.classList.contains("dragging")){let h=a?Io(t.attributes.brightness):0;this.setSlider_(p,h),this.text(".v",a?`${h}%`:"Uit")}}else c==="toggle"?(d.querySelector(".toggle")?.setAttribute("aria-checked",String(a)),this.text(".v",a?"Aan":"Uit")):this.text(".v","Niet bereikbaar");this.paintColour_(t,a),O(this.$(".card"))}paintColour_(e,t){let n=this.$(".colour"),a=this.config.show_colour!==!1&&(fn(e)||bn(e));if(n.hidden=!(a&&t),!a)return;let r=`${fn(e)?"c":""}${bn(e)?"t":""}`;if(n.dataset.sig!==r){n.dataset.sig=r,n.innerHTML=(fn(e)?`<span data-kind="hue" style="display:contents">${fe("hue")}</span>`:"")+(bn(e)?`<span data-kind="kelvin" style="display:contents">${fe("kelvin")}</span>`:"");let d=n.querySelector(".slider.hue");d&&(d.dataset.strip="",d.style.setProperty("--strip","linear-gradient(90deg, hsl(0 90% 55%), hsl(60 90% 55%), hsl(120 90% 55%), hsl(180 90% 55%), hsl(240 90% 55%), hsl(300 90% 55%), hsl(360 90% 55%))"),d.setAttribute("aria-label","Kleur"));let c=n.querySelector(".slider.kelvin");c&&(c.dataset.strip="",c.style.setProperty("--strip","linear-gradient(90deg,#ffb15e,#ffd6a8,#fff5e8,#eaf1ff,#cbdcff)"),c.setAttribute("aria-label","Kleurtemperatuur")),this.sliders_.delete("hue"),this.sliders_.delete("kelvin")}if(!t)return;let o=this.config.entity,s=n.querySelector(".slider.hue");s&&(this.attach_(s,"hue",{min:0,max:360,value:()=>v(this.hass,o)?.attributes?.hs_color?.[0]??0,onInput:d=>this.setSlider_(s,d,0,360),onCommit:d=>{let c=v(this.hass,o)?.attributes?.hs_color?.[1]??100;this.hass.callService("light","turn_on",{entity_id:o,hs_color:[d,c]})}}),s.classList.contains("dragging")||this.setSlider_(s,Math.round(e.attributes.hs_color?.[0]??0),0,360));let l=n.querySelector(".slider.kelvin");if(l){let d=e.attributes.min_color_temp_kelvin??2e3,c=e.attributes.max_color_temp_kelvin??6500;if(this.attach_(l,"kelvin",{min:d,max:c,step:50,value:()=>v(this.hass,o)?.attributes?.color_temp_kelvin??d,onInput:p=>this.setSlider_(l,p,d,c),onCommit:p=>this.hass.callService("light","turn_on",{entity_id:o,color_temp_kelvin:p})}),!l.classList.contains("dragging")){let p=e.attributes.color_temp_kelvin;p!=null&&this.setSlider_(l,p,d,c)}}}getCardSize(){let e=v(this.hass,this.config?.entity);return e?.state==="on"&&(fn(e)||bn(e))?2:1}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",1)}}static getConfigElement(){return document.createElement("domotiapp-light-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("light."));return n?{entity:n}:{}}};_(vn,"css",`
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

    ${Le}

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
  `);var qa=class extends D{defaults(){return{show_colour:!0}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"bulb"}]}schema(){return[{name:"entity",selector:m.entity("light")},{name:"name",selector:m.text()},{name:"show_colour",selector:m.bool()}]}label(e){return{entity:"Lamp",name:"Naam (overschrijft die van de lamp)",show_colour:"Kleurstrips tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"E\xE9n lamp per kaart. Dimbaar krijgt een schuif, alleen schakelbaar een tuimelaar.";if(e.name==="show_colour")return"Kleur en kleurtemperatuur verschijnen zodra de lamp aan is. De kaart is dan twee rijen hoog."}};H("domotiapp-light-card-editor",qa);N("domotiapp-light-card",vn,{name:"DomotiApp Verlichting",description:"E\xE9n lamp op \xE9\xE9n rasterrij: dimmen, kleur en kleurtemperatuur."});function Po(i){if(!i)return null;let e=Number(i.state);return Number.isFinite(e)?e:null}function fp(i){let e=i?.attributes?.hvac_action;return e||(i?.state==="off"?"off":i?.state==="cool"?"cooling":i?.state==="heat"?"idle":null)}var Xa={heating:"var(--dac-solar)",cooling:"var(--dac-grid-in)",drying:"var(--dac-grid-in)",fan:"var(--dac-grid-in)"},Ya={heating:"Verwarmt",cooling:"Koelt",drying:"Ontvochtigt",fan:"Ventileert",idle:"Uit",off:"Uit"},kn=class extends S{validate(e){return e.entity||e.temperature||e.humidity?{...e}:{...e,[C]:"Kies een thermostaat, of een temperatuursensor."}}watched(){let e=this.config;return[e.entity,e.temperature,e.humidity].filter(Boolean)}step_(){let e=q(this.hass,this.config.entity);return Number(this.config.step??e.target_temp_step)||.5}gestapeld_(){return this.config.layout==="gestapeld"}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.entity||this.setAttribute("readout",""),this.setAttribute("vorm",this.gestapeld_()?"gestapeld":"rij"),`
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
                 <button type="button" data-d="-1" aria-label="Lager">${A.minus}</button>
                 <span class="target tnum"></span>
                 <button type="button" data-d="1" aria-label="Hoger">${A.plus}</button>
               </div>`:""}
      </div>`}wire(){let e=this.config;this.teardown_.push(()=>clearTimeout(this.sendTimer_)),this.gestapeld_()&&this.teardown_.push(R(this.$(".card"))),this.teardown_.push(W(this.$(".chip"),{onTap:()=>P(this,e.entity||e.temperature||e.humidity)}));let t=this.$(".set");t&&t.querySelectorAll("button").forEach(n=>this.on(n,"click",()=>this.nudge_(Number(n.dataset.d))))}nudge_(e){let t=this.config,n=q(this.hass,t.entity),a=this.step_(),r=Number(n.min_temp??5),o=Number(n.max_temp??35),s=this.pending_??Number(n.temperature);if(!Number.isFinite(s))return;let l=Math.min(o,Math.max(r,Math.round((s+e*a)/a)*a));this.pending_=l,this.paintTarget_(),clearTimeout(this.sendTimer_),this.sendTimer_=setTimeout(()=>{this.sendTimer_=null,this.hass.callService("climate","set_temperature",{entity_id:t.entity,temperature:this.pending_}),setTimeout(()=>{this.pending_=null,this.paint()},1500)},450)}paintTarget_(){let e=this.$(".target");if(!e)return;let t=q(this.hass,this.config.entity),n=this.pending_??Number(t.temperature);e.classList.toggle("pending",this.pending_!=null),e.textContent=Number.isFinite(n)?`${B(this.hass,n,n%1?1:0)}\xB0`:"--"}paint(){let e=this.config,t=e.entity?v(this.hass,e.entity):null,n=e.entity?ne(t):!1;this.toggleAttribute("dead",n);let a=fp(t),r=e.tone?Z(e.tone):Xa[a]??"var(--dac-ink-3)";this.$(".card").style.setProperty("--tone",r),this.toggleAttribute("busy",!!Xa[a]);let o=this.$(".chip"),s=e.icon||"thermo";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=b(s,"thermo")),o.style.setProperty("--tone",Xa[a]?r:"var(--dac-ink-3)"),this.text(".nm",M(this.hass,e.entity||e.temperature||e.humidity,e.name));let l=e.temperature?Po(v(this.hass,e.temperature)):Number(q(this.hass,e.entity).current_temperature),d=this.hass?.config?.unit_system?.temperature??"\xB0C";this.text(".temp",Number.isFinite(l)?`${B(this.hass,l,1)} ${d}`:"--");let c=e.humidity?Po(v(this.hass,e.humidity)):null,p=this.$(".hum");if(this.gestapeld_()){this.text(".temp",""),p.textContent=Ya[a]??"";let g=this.$(".t-temp"),f=this.$(".t-hum");g.hidden=!Number.isFinite(l),f.hidden=c==null,g.hidden||(g.querySelector(".w").textContent=`${B(this.hass,l,1)} ${d}`),f.hidden||(f.querySelector(".w").textContent=`${B(this.hass,c,0)}%`)}else p.innerHTML=c==null?"":`${A.drop}${B(this.hass,c,0)}%`,this.text(".sep",c==null?"":"\xB7"),e.entity&&!e.humidity&&Ya[a]&&a!=="idle"&&(this.text(".sep","\xB7"),p.textContent=Ya[a]);this.paintTarget_();let h=this.$(".set");if(h){let g=q(this.hass,e.entity),f=this.pending_??Number(g.temperature);h.querySelector('[data-d="-1"]').disabled=n||f<=Number(g.min_temp??5),h.querySelector('[data-d="1"]').disabled=n||f>=Number(g.max_temp??35)}this.gestapeld_()&&O(this.$(".card"))}getCardSize(){return this.gestapeld_()?3:1}getGridOptions(){return this.gestapeld_()?{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",this.config.entity?3:2)}:{columns:12,rows:1,min_columns:4,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-climate-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("climate."));return n?{entity:n}:{}}};_(kn,"css",`
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
      border-radius: var(--dac-radius-sm);
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
  `);var Qa=class extends D{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"thermo"}]}schema(){return[{name:"entity",selector:m.entity("climate")},{name:"temperature",selector:{entity:{domain:"sensor",device_class:"temperature"}}},{name:"humidity",selector:{entity:{domain:"sensor",device_class:"humidity"}}},{name:"name",selector:m.text()},{name:"layout",selector:m.select([{value:"rij",label:"Rij (\xE9\xE9n rasterrij hoog)"},{value:"gestapeld",label:"Onder elkaar (past op een telefoon)"}])},{name:"step",selector:m.number(.1,5,.1)}]}label(e){return{entity:"Thermostaat (optioneel)",temperature:"Temperatuursensor (optioneel)",humidity:"Vochtigheidssensor (optioneel)",name:"Naam",layout:"Vorm",step:"Stap van de knoppen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Leeg laten voor een kaart die alleen meet. Met thermostaat komen de stelknoppen erbij.";if(e.name==="temperature")return"Wint van de meting van de thermostaat zelf. Handig als er een betere sensor in de kamer hangt.";if(e.name==="layout")return"Onder elkaar zet de metingen als twee tegels neer met de stelknop over de volle breedte eronder. Bedoeld voor een smalle kolom of een pop-up, waar de rij-vorm de naam en de meting samendrukt.";if(e.name==="step")return"Leeg laten volgt de thermostaat, en anders een halve graad."}};H("domotiapp-climate-card-editor",Qa);N("domotiapp-climate-card",kn,{name:"DomotiApp Klimaat",description:"Thermostaat, losse temperatuur- en vochtsensor, of allebei."});var xn=({label:i="Aan of uit",cls:e=""}={})=>`<button class="toggle ${e}" type="button" role="switch" aria-checked="false" aria-label="${i}"><span class="knob"></span></button>`;function Ot(i,e){if(!i)return;let t=String(!!e);i.getAttribute("aria-checked")!==t&&i.setAttribute("aria-checked",t)}function wn(i,e){let t=i.querySelector(".knob"),n=!1,a=0,r=!1,o=!1,s=()=>{n=!1,i.classList.remove("dragging"),t?.style.removeProperty("--knob")},l=f=>{f!==e.value()&&(Ot(i,f),e.set(f))},d=f=>{if(!e.disabled?.()&&!(f.button!=null&&f.button!==0)){f.stopPropagation(),n=!0,r=!1,o=!1,a=f.clientX,i.classList.add("dragging");try{i.setPointerCapture?.(f.pointerId)}catch{}}},c=f=>{if(!n)return;let k=f.clientX-a;Math.abs(k)>3&&(r=!0);let x=e.value()?22:0,$=Math.min(22,Math.max(0,x+k));t?.style.setProperty("--knob",`${$}px`)},p=f=>{if(!n)return;f.stopPropagation();let k=f.clientX-a,x=e.value()?22:0,$=Math.min(22,Math.max(0,x+k));s();try{i.hasPointerCapture?.(f.pointerId)&&i.releasePointerCapture(f.pointerId)}catch{}o=!0,l(r?$>22/2:!e.value())},h=()=>{n&&s()},g=f=>{if(f.stopPropagation(),f.preventDefault(),o){o=!1;return}e.disabled?.()||l(!e.value())};return i.addEventListener("pointerdown",d),i.addEventListener("pointermove",c),i.addEventListener("pointerup",p),i.addEventListener("pointercancel",h),i.addEventListener("click",g),()=>{i.removeEventListener("pointerdown",d),i.removeEventListener("pointermove",c),i.removeEventListener("pointerup",p),i.removeEventListener("pointercancel",h),i.removeEventListener("click",g)}}var _n=`
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
`;var Bo=i=>String(i??"").split(".")[0],Ko=new Set(["input_select","select"]),Ja=i=>Ko.has(Bo(i));function be(i){if(!i||!Ja(i.entity_id))return[];let e=i.attributes?.options;return Array.isArray(e)?e.filter(t=>typeof t=="string"&&t!==""):[]}function ct(i,e=be(i)){let t=String(i?.state??"");return!t||t==="unknown"||t==="unavailable"?"":e.includes(t)?t:""}function pt(i,e,t=[]){let n=Bo(i),a=String(e??"");return!a||!Ko.has(n)||t.length&&!t.includes(a)?null:[n,"select_option",{entity_id:i,option:a}]}var he=i=>String(i??"").split(".")[0],Ee=i=>i==null||i===""||i==="unknown"||i==="unavailable",Ce={domeinen:["sensor"],device_class:"temperature",rol:"tegel",eenheid:"\xB0C"},bp={hoofd_climate:{key:"entity",label:"Apparaat (climate)",domeinen:["climate"],rol:"hoofd",hulp:"De climate-entiteit. Daar komen de standen en de temperatuurknoppen vandaan. Leeg laten mag: dan toont de kaart alleen de sensoren."},hoofd_ventilatie:{key:"entity",label:"Ventilatie-unit",domeinen:["fan","select","input_select","climate"],rol:"hoofd",hulp:"Een fan-entiteit (standen of percentage), of een keuzelijst met de standen. Leeg laten mag."},hoofd_boiler:{key:"entity",label:"Boiler (water_heater of climate)",domeinen:["water_heater","climate"],rol:"hoofd",hulp:"Daar komen de doeltemperatuur en de bedrijfsstanden vandaan. Leeg laten mag."},temperature:{key:"temperature",label:"Binnentemperatuur",...Ce,hulp:"Wint van de meting van het apparaat zelf."},outdoor:{key:"outdoor",label:"Buitentemperatuur",...Ce},humidity:{key:"humidity",label:"Luchtvochtigheid",domeinen:["sensor"],device_class:"humidity",rol:"tegel",eenheid:"%"},co2:{key:"co2",label:"CO\u2082",domeinen:["sensor"],rol:"tegel",eenheid:"ppm",hulp:"Kleurt oranje boven 1200 ppm en rood boven 1600."},voc:{key:"voc",label:"Luchtkwaliteit (VOC)",domeinen:["sensor"],rol:"tegel"},power:{key:"power",label:"Vermogen",domeinen:["sensor"],device_class:"power",rol:"tegel",eenheid:"W"},energy:{key:"energy",label:"Energie vandaag",domeinen:["sensor"],device_class:"energy",rol:"tegel",eenheid:"kWh"},flow_temp:{key:"flow_temp",label:"Aanvoertemperatuur",...Ce},return_temp:{key:"return_temp",label:"Retourtemperatuur",...Ce},dhw_temp:{key:"dhw_temp",label:"Tapwatertemperatuur",...Ce},water_temp:{key:"water_temp",label:"Watertemperatuur",...Ce,hulp:"Wint van de meting van de boiler zelf."},supply_temp:{key:"supply_temp",label:"Toevoertemperatuur",...Ce},exhaust_temp:{key:"exhaust_temp",label:"Afvoertemperatuur",...Ce},cop:{key:"cop",label:"COP",domeinen:["sensor"],rol:"tegel",hulp:"Rendement: geleverde warmte gedeeld door verbruikte stroom."},thermal:{key:"thermal",label:"Thermisch vermogen",domeinen:["sensor"],rol:"tegel",eenheid:"kW"},compressor:{key:"compressor",label:"Compressor",domeinen:["sensor","binary_sensor"],rol:"tegel",hulp:"Een toerental of percentage, of een aan/uit-sensor."},flow_rate:{key:"flow_rate",label:"Debiet",domeinen:["sensor"],rol:"tegel",eenheid:"l/min"},pressure:{key:"pressure",label:"Waterdruk",domeinen:["sensor"],rol:"tegel",eenheid:"bar"},status:{key:"status",label:"Statussensor",domeinen:["sensor"],rol:"status",hulp:"Een sensor met een woord als toestand (Verwarmen, Tapwater, Stand 2). Komt in de regel onder de naam."},fault:{key:"fault",label:"Storing",domeinen:["binary_sensor"],rol:"storing",hulp:"Een binary_sensor die aan gaat bij een storing. De kaart kleurt dan rood, wat er verder ook aan de hand is."},filter:{key:"filter",label:"Filter",domeinen:["binary_sensor","sensor"],rol:"filter",hulp:"Een binary_sensor die aan gaat als het filter vervangen moet worden, of een sensor met de dagen tot vervanging."},bypass:{key:"bypass",label:"Bypass",domeinen:["binary_sensor"],rol:"tegel"},heating:{key:"heating",label:"Verwarmt (aan/uit)",domeinen:["binary_sensor"],rol:"verwarmt",hulp:"Een binary_sensor die aan is zolang de boiler opwarmt."},mode:{key:"mode",label:"Bedrijfsmodus (keuzelijst)",domeinen:["select","input_select"],rol:"keuze",hulp:"Een keuzelijst van de integratie, bijvoorbeeld Verwarmen / Koelen / Auto. Verschijnt als uitklaplijst op de kaart."},boost:{key:"boost",label:"Boost",domeinen:["switch","input_boolean","button","input_button","script"],rol:"boost",hulp:"Een schakelaar wordt een schuifschakelaar op de kaart; een knop of script een drukknop."}},ht={airco:{label:"Airco",naam:"Airco",icoon:"airco",velden:["hoofd_climate","temperature","outdoor","humidity","power","energy","fault"]},warmtepomp:{label:"Warmtepomp",naam:"Warmtepomp",icoon:"heatPump",velden:["hoofd_climate","status","fault","flow_temp","return_temp","outdoor","dhw_temp","cop","power","thermal","energy","compressor","flow_rate","pressure","mode","boost"]},ventilatie:{label:"Ventilatie (WTW)",naam:"Ventilatie",icoon:"fan",velden:["hoofd_ventilatie","status","fault","co2","humidity","voc","temperature","outdoor","supply_temp","exhaust_temp","filter","bypass","power","boost"]},boiler:{label:"Boiler / warm water",naam:"Boiler",icoon:"boiler",velden:["hoofd_boiler","water_temp","heating","power","energy","fault","mode","boost"]}},qe="airco",Ze=i=>ht[i]??ht[qe],He=i=>Ze(i).velden.map(e=>bp[e]),ei=(i,e)=>He(i).filter(t=>t.rol===e),Wo={off:"Uit",heat:"Verwarmen",cool:"Koelen",heat_cool:"Auto",auto:"Auto",dry:"Drogen",fan_only:"Ventileren"},vp={heating:"Verwarmt",cooling:"Koelt",drying:"Droogt",fan:"Ventileert",idle:"Standby",off:"Uit",preheating:"Voorverwarmt",defrosting:"Ontdooit"},Go={off:"Uit",on:"Aan",auto:"Auto",low:"Laag",lowest:"Laagst",min:"Min",minimum:"Min",medium:"Midden",mid:"Midden",middle:"Midden",high:"Hoog",highest:"Hoogst",max:"Max",maximum:"Max",boost:"Boost",turbo:"Turbo",quiet:"Stil",silent:"Stil",silence:"Stil",sleep:"Nacht",night:"Nacht",away:"Afwezig",home:"Thuis",eco:"Eco",comfort:"Comfort",party:"Feest",holiday:"Vakantie",electric:"Elektrisch",gas:"Gas",heat_pump:"Warmtepomp",high_demand:"Veel vraag",performance:"Snel",...Wo};function se(i){let e=String(i??"").trim();if(!e)return"";let t=e.toLowerCase().replace(/[\s-]+/g,"_");if(Go[t])return Go[t];let n=e.replace(/_/g," ");return n.charAt(0).toUpperCase()+n.slice(1)}function kp(i,e){let t=String(i??"").toLowerCase(),n=Math.abs(Number(e));return t.includes("\xB0")||t==="c"||t==="f"?1:t==="%"||t==="ppm"||t==="w"||t==="hz"||t==="rpm"||t==="ppb"?0:t==="kwh"||t==="kw"||t==="bar"||t==="l/min"||t==="m\xB3/h"||t?n>=100?0:1:n>=100?0:n>=10?1:2}function xp(i,e,t="nl"){let n=Number(i);if(!Number.isFinite(n))return"--";let a=kp(e,n);return n.toLocaleString(t,{minimumFractionDigits:a,maximumFractionDigits:a})}var wp={bypass:["Open","Dicht"],compressor:["Aan","Uit"],heating:["Ja","Nee"],filter:["Vervangen","Schoon"]};function _p(i,e,t="nl"){if(!i||!e)return null;let n=String(e.state??"").trim(),a=e.attributes?.unit_of_measurement??i.eenheid??"";if(he(e.entity_id)==="binary_sensor"){let[l,d]=wp[i.key]??["Aan","Uit"],c=Ee(n),p=n==="on";return{key:i.key,label:i.label.replace(/\s*\(.*\)$/,""),waarde:c?"--":p?l:d,eenheid:"",let:i.key==="filter"&&p?"warn":""}}let r=Number(n),o=!Ee(n)&&Number.isFinite(r),s="";return i.key==="co2"&&o&&(s=r>=1600?"bad":r>=1200?"warn":""),i.key==="filter"&&o&&(s=r<=0?"warn":""),{key:i.key,label:i.label.replace(/\s*\(.*\)$/,""),waarde:o?xp(r,a,t):Ee(n)?"--":n,eenheid:o?a:"",let:s}}function Uo(i,e,t,n="nl"){let a=[];for(let r of He(i)){if(r.rol!=="tegel"&&r.rol!=="filter")continue;let o=e?.[r.key];if(!o)continue;let s=_p(r,t(o)??{entity_id:o,state:"unavailable",attributes:{}},n);s&&a.push(s)}return a}function Fo({soort:i,hoofd:e,status:t,fault:n,filter:a,heating:r}={}){let o=yp(a);if(n&&n.state==="on")return{tekst:"Storing",tone:"bad",bezig:!1,waarschuwing:o};if(e&&Ee(e.state))return{tekst:"Niet bereikbaar",tone:"neutral",bezig:!1,waarschuwing:o};let s=t&&!Ee(t.state)?se(t.state):"",l=he(e?.entity_id);if(e&&l==="climate"){let c=(e.attributes??{}).hvac_action??(e.state==="off"?"off":"idle"),p=vp[c]??se(c),h=c==="heating"||c==="preheating"?"solar":["cooling","drying","fan"].includes(c)?"water":"neutral",g=h!=="neutral"||c==="defrosting";return{tekst:s&&s!==p?`${p} \xB7 ${s}`:p,tone:h,bezig:g,waarschuwing:o}}if(e&&l==="fan"){let d=e.attributes??{};if(e.state==="off")return{tekst:"Uit",tone:"neutral",bezig:!1,waarschuwing:o};let c=d.preset_mode?se(d.preset_mode):Number.isFinite(Number(d.percentage))?`${Math.round(Number(d.percentage))}%`:"Aan";return{tekst:s&&s!==c?`${c} \xB7 ${s}`:`Ventileert \xB7 ${c}`,tone:"water",bezig:!0,waarschuwing:o}}if(e&&l==="water_heater"){let d=e.attributes??{},c=se(e.state),p=r?r.state==="on":d.operation_mode!=="off"&&e.state!=="off"&&d.hvac_action==="heating";return e.state==="off"?{tekst:"Uit",tone:"neutral",bezig:!1,waarschuwing:o}:{tekst:p?`Verwarmt \xB7 ${c}`:c,tone:p?"solar":"neutral",bezig:p,waarschuwing:o}}if(e&&(l==="select"||l==="input_select")){let d=se(e.state),c=/^(uit|off)$/i.test(e.state);return{tekst:c?"Uit":`Stand \xB7 ${d}`,tone:c?"neutral":"water",bezig:!c,waarschuwing:o}}return r&&r.state==="on"?{tekst:s?`Verwarmt \xB7 ${s}`:"Verwarmt",tone:"solar",bezig:!0,waarschuwing:o}:s?{tekst:s,tone:"neutral",bezig:!1,waarschuwing:o}:{tekst:Ze(i).naam,tone:"neutral",bezig:!1,waarschuwing:o}}function yp(i){if(!i||Ee(i.state))return"";if(he(i.entity_id)==="binary_sensor")return i.state==="on"?"Filter vervangen":"";let e=Number(i.state);return Number.isFinite(e)&&e<=0?"Filter vervangen":""}var jp=[["0","Uit"],["33","Laag"],["66","Midden"],["100","Hoog"]];function ti(i){if(!i)return[];let e=i.attributes??{},t=he(i.entity_id),n=a=>Array.isArray(a)?a.filter(r=>typeof r=="string"&&r!==""):[];if(t==="climate")return n(e.hvac_modes).map(a=>({waarde:a,label:Wo[a]??se(a)}));if(t==="water_heater")return n(e.operation_list).map(a=>({waarde:a,label:se(a)}));if(t==="select"||t==="input_select")return n(e.options).map(a=>({waarde:a,label:se(a)}));if(t==="fan"){let a=n(e.preset_modes);if(a.length)return a.map(r=>({waarde:r,label:se(r)}));if(e.percentage!=null||e.percentage_step!=null){let r=Number(e.percentage_step)||1;return jp.map(([o,s])=>({waarde:String(Math.min(100,Math.round(Number(o)/r)*r)),label:s}))}return[{waarde:"off",label:"Uit"},{waarde:"on",label:"Aan"}]}return[]}function qo(i,e=ti(i)){if(!i||Ee(i.state))return"";let t=i.attributes??{};if(he(i.entity_id)==="fan"){if(t.preset_mode&&e.some(r=>r.waarde===t.preset_mode))return t.preset_mode;if(i.state==="off")return e.some(r=>r.waarde==="0")?"0":"off";let a=Number(t.percentage);if(Number.isFinite(a)&&e.length){let r=e[0];for(let o of e)Math.abs(Number(o.waarde)-a)<Math.abs(Number(r.waarde)-a)&&(r=o);return r.waarde}return i.state==="on"?"on":""}return e.some(a=>a.waarde===i.state)?i.state:""}function Zo(i,e){if(!i)return null;let t=i.entity_id,n=String(e??"");if(!n)return null;let a=he(t);switch(a){case"climate":return["climate","set_hvac_mode",{entity_id:t,hvac_mode:n}];case"water_heater":return["water_heater","set_operation_mode",{entity_id:t,operation_mode:n}];case"select":case"input_select":return[a,"select_option",{entity_id:t,option:n}];case"fan":{let r=i.attributes?.preset_modes;if(Array.isArray(r)&&r.includes(n))return["fan","set_preset_mode",{entity_id:t,preset_mode:n}];if(n==="off")return["fan","turn_off",{entity_id:t}];if(n==="on")return["fan","turn_on",{entity_id:t}];let o=Number(n);return Number.isFinite(o)?o<=0?["fan","turn_off",{entity_id:t}]:["fan","set_percentage",{entity_id:t,percentage:o}]:null}default:return null}}function ni(i){let e=i?.attributes?.fan_modes;return he(i?.entity_id)!=="climate"||!Array.isArray(e)?[]:e.filter(t=>typeof t=="string"&&t).map(t=>({waarde:t,label:se(t)}))}function Xo(i,e){let t=String(e??"");return!i||!t||!ni(i).some(n=>n.waarde===t)?null:["climate","set_fan_mode",{entity_id:i.entity_id,fan_mode:t}]}function ai(i,e){if(!i||Ee(i.state))return null;let t=i.attributes??{},n=he(i.entity_id);if(n!=="climate"&&n!=="water_heater")return null;let a=Number(t.temperature);if(!Number.isFinite(a))return null;let r=Number(e)||Number(t.target_temp_step)||(n==="water_heater"?1:.5);return{min:Number(t.min_temp??(n==="water_heater"?30:5)),max:Number(t.max_temp??(n==="water_heater"?70:35)),stap:r,doel:a,huidig:Number.isFinite(Number(t.current_temperature))?Number(t.current_temperature):null}}function Yo(i,e,t){if(!i)return null;let a=(Number.isFinite(e)?e:i.doel)+t*i.stap,r=Math.round(a/i.stap)*i.stap,o=Math.round(r*100)/100;return Math.min(i.max,Math.max(i.min,o))}function Qo(i,e){if(!i||!Number.isFinite(e))return null;let t=he(i.entity_id);return t!=="climate"&&t!=="water_heater"?null:[t,"set_temperature",{entity_id:i.entity_id,temperature:e}]}var Jo=i=>["switch","input_boolean"].includes(he(i));function ii(i,e=!0){let t=String(i??""),n=he(t);switch(n){case"switch":case"input_boolean":return["homeassistant",e?"turn_on":"turn_off",{entity_id:t}];case"button":case"input_button":return[n,"press",{entity_id:t}];case"script":return["script","turn_on",{entity_id:t}];default:return null}}function es(i,e){let t=Number(e?.state);if(e&&!Ee(e.state)&&Number.isFinite(t))return t;let n=i?.attributes?.current_temperature;if(n==null||n==="")return null;let a=Number(n);return Number.isFinite(a)?a:null}var ts={solar:E.solar,water:E.water,bad:E.bad,warn:E.warn,neutral:"var(--dac-ink-3)"},yn=class extends S{validate(e){let t={soort:qe,...e};return ht[t.soort]||(t.soort=qe),He(t.soort).some(a=>t[a.key])||(t[C]="Kies de soort en minstens \xE9\xE9n entiteit: het apparaat zelf, of een sensor."),t}watched(){let e=this.config;return He(e.soort).map(t=>e[t.key]).filter(Boolean)}hoofd_(){return v(this.hass,this.config.entity)??null}metRol_(e){let t=ei(this.config.soort,e)[0];return t?v(this.hass,this.config[t.key])??null:null}template(){let e=this.config;e.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size";let t=e.boost?Jo(e.boost)?xn({label:"Boost"}):`<button type="button" class="knop">${b("bolt")}<span>Boost</span></button>`:"";return`
      <div class="card surface" style="--tone:var(--dac-ink-3)">
        <div class="top" role="button" tabindex="0">
          <span class="chip"></span>
          <span class="txt">
            <span class="nm"></span>
            <span class="st"></span>
          </span>
          <span class="graden"></span>
        </div>

        <div class="tegels" hidden></div>
        <div class="standen" hidden></div>

        <div class="set" hidden>
          <button type="button" data-d="-1" aria-label="Lager">${A.minus}</button>
          <span class="target tnum"></span>
          <button type="button" data-d="1" aria-label="Hoger">${A.plus}</button>
        </div>

        <div class="rij ventilator" hidden>
          <span class="lb">Ventilator</span>
          <span class="ventslot" style="display:contents"></span>
        </div>
        <div class="rij modus" hidden>
          <span class="lb">Modus</span>
          <span class="modusslot" style="display:contents"></span>
        </div>
        <div class="rij boost" ${e.boost?"":"hidden"}>
          <span class="lb">Boost</span>
          ${t}
        </div>
      </div>`}wire(){let e=this.config;if(this.teardown_.push(()=>clearTimeout(this.sendTimer_)),this.teardown_.push(R(this.$(".card"))),this.on(this.$(".top"),"click",()=>{let t=e.entity||this.watched()[0];t&&P(this,t)}),this.on(this.$(".standen"),"click",t=>{let n=t.target?.closest?.(".seg");if(!n||n.disabled)return;t.stopPropagation();let a=Zo(this.hoofd_(),n.dataset.waarde);a&&this.hass.callService(a[0],a[1],a[2])}),this.$$(".set button").forEach(t=>this.on(t,"click",()=>this.nudge_(Number(t.dataset.d)))),this.on(this.$(".rij.ventilator"),"change",t=>{let n=t.target?.closest?.(".keuze");if(!n)return;t.stopPropagation();let a=Xo(this.hoofd_(),n.value);a&&this.hass.callService(a[0],a[1],a[2])}),this.on(this.$(".rij.modus"),"change",t=>{let n=t.target?.closest?.(".keuze");if(!n||!e.mode)return;t.stopPropagation();let a=pt(e.mode,n.value,be(v(this.hass,e.mode)));a&&this.hass.callService(a[0],a[1],a[2])}),e.boost){let t=this.$(".rij.boost .toggle"),n=this.$(".rij.boost .knop");t&&this.teardown_.push(wn(t,{value:()=>X(v(this.hass,e.boost)),set:a=>{let r=ii(e.boost,a);r&&this.hass.callService(r[0],r[1],r[2])}})),n&&this.on(n,"click",a=>{a.stopPropagation();let r=ii(e.boost,!0);r&&this.hass.callService(r[0],r[1],r[2])})}}nudge_(e){let t=this.hoofd_(),n=ai(t,this.config.step);n&&(this.pending_=Yo(n,this.pending_??n.doel,e),this.paintDoel_(),clearTimeout(this.sendTimer_),this.sendTimer_=setTimeout(()=>{this.sendTimer_=null;let a=Qo(t,this.pending_);a&&this.hass.callService(a[0],a[1],a[2]),setTimeout(()=>{this.pending_=null,this.paint()},1500)},450))}paintDoel_(){let e=this.$(".set"),t=ai(this.hoofd_(),this.config.step);if(e.hidden=!t,!t)return;let n=this.pending_??t.doel,a=e.querySelector(".target");a.classList.toggle("pending",this.pending_!=null),a.innerHTML=`${B(this.hass,n,n%1?1:0)}\xB0<small>doel</small>`,e.querySelector('[data-d="-1"]').disabled=n<=t.min,e.querySelector('[data-d="1"]').disabled=n>=t.max}paint(){let e=this.config,t=Ze(e.soort),n=this.hoofd_(),a=Fo({soort:e.soort,hoofd:n,status:this.metRol_("status"),fault:this.metRol_("storing"),filter:this.metRol_("filter"),heating:this.metRol_("verwarmt")}),r=ts[a.tone]??ts.neutral;this.$(".card").style.setProperty("--tone",r),this.toggleAttribute("bezig",a.bezig),this.toggleAttribute("storing",a.tone==="bad"),this.$(".top").classList.toggle("dood",a.tekst==="Niet bereikbaar");let o=this.$(".chip"),s=e.icon||t.icoon;o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=b(s,t.icoon)),this.text(".nm",e.name||(e.entity?M(this.hass,e.entity,null):"")||t.naam);let l=this.$(".st"),d=j(a.tekst)+(a.waarschuwing?` &middot; <span class="let">${j(a.waarschuwing)}</span>`:"");l.dataset.html!==d&&(l.dataset.html=d,l.innerHTML=d),this.$(".top").setAttribute("aria-label",`${this.$(".nm").textContent}, ${a.tekst}`);let c=e.soort==="boiler"?"water_temp":"temperature",p=v(this.hass,e[c])??null,h=es(n,p),g=p?.attributes?.unit_of_measurement??this.hass?.config?.unit_system?.temperature??"\xB0C",f=this.$(".graden"),k=h==null?"":`${B(this.hass,h,1)}<small>${j(g)}</small>`;if(f.dataset.html!==k&&(f.dataset.html=k,f.innerHTML=k),this.paintTegels_(h==null?null:c),this.paintStanden_(n),this.paintDoel_(),this.paintKeuzes_(n),e.boost){let x=this.$(".rij.boost .toggle");x&&(x.style.setProperty("--tone",E.accent),Ot(x,X(v(this.hass,e.boost))))}O(this.$(".card"))}paintTegels_(e){let t=this.config,n=this.$(".tegels"),a=Uo(t.soort,t,o=>v(this.hass,o)??null,this.hass?.locale?.language??"nl").filter(o=>o.key!==e);n.hidden=a.length===0;let r=JSON.stringify(a);n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=a.map(o=>`
        <div class="tegel" data-let="${o.let}" title="${j(o.label)}">
          <span class="w">${j(o.waarde)}${o.eenheid?`<small>${j(o.eenheid)}</small>`:""}</span>
          <span class="l">${j(o.label)}</span>
        </div>`).join(""))}paintStanden_(e){let t=this.$(".standen"),n=ti(e);if(t.hidden=n.length<2,t.hidden)return;let a=qo(e,n),r=!e||e.state==="unavailable",o=JSON.stringify([n,a,r]);t.dataset.sig!==o&&(t.dataset.sig=o,t.innerHTML=n.map(s=>`<button type="button" class="seg" data-waarde="${j(s.waarde)}" aria-pressed="${s.waarde===a}"${r?" disabled":""}>${j(s.label)}</button>`).join(""))}paintKeuzes_(e){let t=this.config,n=ni(e),a=this.$(".ventslot");this.vulLijst_(a,n,e?.attributes?.fan_mode??"","Ventilator"),this.$(".rij.ventilator").hidden=n.length===0;let r=v(this.hass,t.mode),o=t.mode?be(r).map(l=>({waarde:l,label:se(l)})):[],s=this.$(".modusslot");this.vulLijst_(s,o,ct(r),"Modus"),this.$(".rij.modus").hidden=o.length===0}vulLijst_(e,t,n,a){let r=JSON.stringify(t);e.dataset.opties!==r&&(e.dataset.opties=r,e.innerHTML=t.length?`<select class="keuze" aria-label="${j(a)}">${t.map(s=>`<option value="${j(s.waarde)}">${j(s.label)}</option>`).join("")}</select>`:"");let o=e.querySelector(".keuze");o&&this.shadowRoot.activeElement!==o&&o.value!==n&&(o.value=n)}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-hvac-card-editor")}static getStubConfig(e,t){let n=t?.find(o=>o.startsWith("climate.")),a=t?.find(o=>o.startsWith("fan.")),r=t?.find(o=>o.startsWith("water_heater."));return r?{soort:"boiler",entity:r}:n?{soort:"airco",entity:n}:a?{soort:"ventilatie",entity:a}:{soort:qe}}};_(yn,"css",`
    :host { display: block; }

    .card {
      min-height: var(--dac-raster, 56px);
      padding: 8px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ------------------------------------------------------------- de kop */

    .top { display: flex; align-items: center; gap: 11px; min-height: 40px; cursor: pointer; }
    .chip {
      width: 40px; height: 40px;
      transition: color 220ms ease, background 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
    }
    .chip .icon { width: 20px; height: 20px; }
    /* Alleen als er echt iets gebeurt gloeit het icoon; standby is stil. */
    :host([bezig]) .chip {
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
    .st .let { color: var(--dac-warn); font-weight: 600; }
    :host([storing]) .st { color: var(--dac-bad); font-weight: 600; }

    /* De meting van nu, rechts in de kop. Het getal draagt geen kleur. */
    .graden {
      flex: 0 0 auto; font-size: 18px; font-weight: 500; letter-spacing: -.02em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
    }
    .graden small { font-size: 11px; color: var(--dac-ink-3); margin-left: 2px; font-weight: 400; }
    .graden:empty { display: none; }

    .top.dood { opacity: .42; }

    /* ----------------------------------------------------------- tegels */

    .tegels {
      display: grid; grid-template-columns: repeat(var(--kolommen, 3), minmax(0, 1fr)); gap: 7px;
    }
    .tegels[hidden] { display: none; }
    .tegel {
      display: flex; flex-direction: column; align-items: center; gap: 1px;
      padding: 7px 6px; min-width: 0;
      background: rgba(255,255,255,.038); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
    }
    .tegel .w {
      font-size: 15px; font-weight: 500; letter-spacing: -.01em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
    }
    .tegel .w small { font-size: 10.5px; color: var(--dac-ink-3); margin-left: 3px; font-weight: 400; }
    .tegel .l {
      font-size: 10.5px; line-height: 1.2; color: var(--dac-ink-3); text-align: center;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
    }
    .tegel[data-let="warn"] .w { color: var(--dac-warn); }
    .tegel[data-let="bad"] .w { color: var(--dac-bad); }

    /* ---------------------------------------------------------- standen */

    .standen { display: flex; flex-wrap: wrap; gap: 6px; }
    .standen[hidden] { display: none; }
    .seg {
      flex: 1 1 auto; min-width: 0;
      padding: 8px 10px; cursor: pointer;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      font: inherit; font-size: 12.5px; font-weight: 500; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      -webkit-tap-highlight-color: transparent;
      transition: background 180ms ease, border-color 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .seg:hover { color: var(--dac-ink); border-color: var(--dac-border-hi); } }
    .seg:active { transform: scale(.97); }
    /* De gekozen stand draagt het accent, want kiezen is identiteit en geen
       oordeel. Wat het apparaat DOET staat in de kop, in zijn eigen kleur. */
    .seg[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
    }
    .seg:disabled { opacity: .4; cursor: default; }

    /* ---------------------------------------------------------- stelknop
       Over de volle breedte, met de knoppen aan de uiteinden: dezelfde vorm
       als de gestapelde klimaatkaart, en om dezelfde reden -- op een telefoon
       wil je met \xE9\xE9n duim bij allebei kunnen. */
    .set {
      display: flex; align-items: center; justify-content: space-between; gap: 2px; padding: 3px;
      background: rgba(255,255,255,.05); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
    }
    .set[hidden] { display: none; }
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
      flex: 1 1 auto; text-align: center;
      font-size: 16px; font-weight: 500; letter-spacing: -.01em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
    }
    .set .target small { font-size: 10.5px; color: var(--dac-ink-3); margin-left: 5px; font-weight: 400; }
    /* Terwijl je tikt loopt het getal voor op het apparaat. Dat mag je zien. */
    .set .target.pending { color: var(--dac-accent-hi); }

    /* -------------------------------------------------------- keuzelijsten */

    .rij { display: flex; align-items: center; gap: 10px; }
    .rij[hidden] { display: none; }
    .rij .lb { flex: 0 0 auto; font-size: 12.5px; color: var(--dac-ink-2); }

    /* Ondoorzichtige achtergrond, net als op de vaatwasser: de browser tekent
       het uitklappaneel met de kleur van de select zelf, en dat paneel valt
       buiten onze shadow root. */
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
    .keuze:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
    .keuze option { background-color: var(--dac-bg-raise); color: var(--dac-ink); }
    .keuze option:checked { background-color: var(--dac-accent); color: var(--dac-ink); }

    /* ------------------------------------------------------------- boost */

    ${_n}
    .rij.boost .lb { flex: 1 1 auto; }
    .knop {
      flex: 0 0 auto;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      padding: 8px 16px;
      border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 42%, transparent);
      border-radius: var(--dac-radius-pill);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
      cursor: pointer; font: inherit; font-size: 12.5px; font-weight: 500; color: var(--dac-accent-hi);
      -webkit-tap-highlight-color: transparent;
    }
    .knop .icon { width: 15px; height: 15px; }
    .knop:active { transform: scale(.97); }
    @media (hover: hover) { .knop:hover { background: color-mix(in srgb, var(--dac-accent-hi) 24%, transparent); } }

    /* Smal: twee tegels naast elkaar in plaats van drie. */
    @container (max-width: 340px) {
      .tegels { --kolommen: 2 !important; }
    }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `);var ri=class extends D{defaults(){return{soort:qe}}soort_(){return ht[this.config_?.soort]?this.config_.soort:qe}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:Ze(this.soort_()).icoon,auto:!1}]}sync_(){super.sync_();for(let e of this.pickers_??[])e.dataset.key==="icon"&&(e.fallback=Ze(this.soort_()).icoon)}schema(){let e=this.soort_(),t=He(e).map(r=>({name:r.key,selector:{entity:{domain:r.domeinen,...r.device_class?{device_class:r.device_class}:{}}}})),a=ei(e,"hoofd")[0]?.domeinen.some(r=>r==="climate"||r==="water_heater");return[{name:"soort",selector:m.select(Object.entries(ht).map(([r,o])=>({value:r,label:o.label})))},{name:"name",selector:m.text()},...t,...a?[{name:"step",selector:m.number(.1,5,.1)}]:[]]}label(e){let t=He(this.soort_()).find(n=>n.key===e.name);return t?t.label:{soort:"Soort apparaat",name:"Naam",step:"Stap van de temperatuurknoppen"}[e.name]??super.label(e)}helper(e){let t=He(this.soort_()).find(n=>n.key===e.name);if(t?.hulp)return t.hulp;if(e.name==="soort")return"Bepaalt welke velden hieronder staan, het icoon, en hoe de statusregel leest.";if(e.name==="name")return`Leeg laten geeft de naam van het apparaat, of anders "${Ze(this.soort_()).naam}".`;if(e.name==="step")return"Leeg laten volgt het apparaat: een halve graad bij een climate, een hele bij een boiler."}};H("domotiapp-hvac-card-editor",ri);N("domotiapp-hvac-card",yn,{name:"DomotiApp HVAC",description:"Airco, warmtepomp, ventilatie of boiler: status, metingen als tegels, de standen van het apparaat, doeltemperatuur en boost."});var jn=i=>String(i??"").split(".")[0],ns=new Set(["input_datetime","time","date","datetime"]),as=i=>ns.has(jn(i)),ve=i=>String(i).padStart(2,"0");function zp(i){let e=String(i??"");return/^\d{4}-\d{2}-\d{2}[ T]\d{1,2}:\d{2}/.test(e)?"datetime-local":/^\d{4}-\d{2}-\d{2}$/.test(e)?"date":/^\d{1,2}:\d{2}/.test(e)?"time":null}function oi(i){if(!i)return null;let e=jn(i.entity_id);if(e==="time")return"time";if(e==="date")return"date";if(e==="datetime")return"datetime-local";if(e!=="input_datetime")return null;let t=i.attributes??{};return typeof t.has_date=="boolean"||typeof t.has_time=="boolean"?t.has_date&&t.has_time?"datetime-local":t.has_date?"date":t.has_time?"time":null:zp(i.state)}var $p=i=>`${i.getFullYear()}-${ve(i.getMonth()+1)}-${ve(i.getDate())}T${ve(i.getHours())}:${ve(i.getMinutes())}`;function Ep(i){let e=-i.getTimezoneOffset(),t=e<0?"-":"+",n=Math.abs(e);return`${t}${ve(Math.floor(n/60))}:${ve(n%60)}`}function is(i,e=oi(i)){if(!i||!e)return"";let t=String(i.state??"");if(!t||t==="unknown"||t==="unavailable")return"";if(e==="time"){let a=t.match(/^(\d{1,2}):(\d{2})/);return a?`${ve(a[1])}:${a[2]}`:""}if(e==="date"){let a=t.match(/^(\d{4}-\d{2}-\d{2})$/);return a?a[1]:""}if(jn(i.entity_id)==="datetime"){let a=new Date(t);return Number.isNaN(+a)?"":$p(a)}let n=t.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})/);return n?`${n[1]}T${ve(n[2].split(":")[0])}:${n[2].split(":")[1]}`:""}function rs(i,e,t){let n=jn(i),a=String(t??"");if(!a||!ns.has(n)||!e)return null;if(e==="time"){let h=a.match(/^(\d{1,2}):(\d{2})/);if(!h)return null;let g=`${ve(h[1])}:${h[2]}:00`;return n==="time"?["time","set_value",{entity_id:i,time:g}]:["input_datetime","set_datetime",{entity_id:i,time:g}]}if(e==="date")return/^\d{4}-\d{2}-\d{2}$/.test(a)?n==="date"?["date","set_value",{entity_id:i,date:a}]:["input_datetime","set_datetime",{entity_id:i,date:a}]:null;let r=a.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})/);if(!r)return null;let[,o,s,l,d,c]=r,p=`${ve(d)}:${c}:00`;if(n==="datetime"){let h=Ep(new Date(+o,+s-1,+l,+d,+c));return["datetime","set_value",{entity_id:i,datetime:`${o}-${s}-${l}T${p}${h}`}]}return["input_datetime","set_datetime",{entity_id:i,datetime:`${o}-${s}-${l} ${p}`}]}var os={auto:"automatisch",automatic:"automatisch",eco:"eco",intensiv:"intensief",intensive:"intensief",kurz:"kort",quick:"snel",express:"snel",speed:"snel",glas:"glas",glass:"glas",delicate:"fijn",normal:"normaal",night:"nacht",silence:"stil",quiet:"stil",hygiene:"hygi\xEBne",hygienic:"hygi\xEBne",favorite:"favoriet",favourite:"favoriet",steam:"stoom",fresh:"fris",care:"verzorging",machinecare:"machineverzorging",machine:"machine",prerinse:"voorspoelen",rinse:"spoelen",presoak:"voorweken",soak:"weken",wash:"wassen",dry:"drogen",half:"half",load:"belading",mixed:"gemengd",maximum:"maximaal",cleaning:"reinigen",clean:"reinigen",pots:"pannen",chef:"chef",kitchen:"keuken",party:"feest",daily:"dagelijks",super:"super",turbo:"turbo",energy:"energie",saving:"zuinig",off:"uit",on:"aan",none:"geen",standby:"stand-by",ready:"gereed",pause:"pauze",stop:"stop",start:"start",finished:"klaar",low:"laag",medium:"midden",high:"hoog"},Ap=/^.*program(?:me)?[_.\- ]/i,Mp=30,Sp=95;function Np(i){return String(i??"").replace(Ap,"").replace(/([a-z])([A-Z])/g,"$1 $2").replace(/([a-zA-Z])(\d)/g,"$1 $2").replace(/(\d)([a-zA-Z])/g,"$1 $2").split(/[\s_.\-]+/).filter(Boolean)}function Tp(i){let e=Np(i);if(!e.length)return"";let t=[];for(let a=0;a<e.length;a++){let r=e[a],o=r.toLowerCase();if(/^\d+$/.test(o)){let d=Number(o);t.push(d>=Mp&&d<=Sp?`${d} \xB0C`:o);continue}let s=e[a+1]?.toLowerCase(),l=s?os[o+s]:void 0;if(l){t.push(l),a++;continue}t.push(os[o]??r)}let n=t.join(" ");return n.charAt(0).toUpperCase()+n.slice(1)}function Op(i,e){let t=a=>String(a??"").toLowerCase().replace(/[^a-z0-9]/g,""),n=t(e);return!!n&&n!==t(i)}function zn(i,e){return Op(i,e)?String(e):Tp(i)||String(i??"")}var En={row:44,tile:96,compact:44,beeld:120},Re=6,ss=12,si=22,Dp=["row","tile","compact","beeld"],Lp=["links","midden"],li=48,di=320,$n=120,ke=i=>{if(i==null||i==="")return $n;let e=Math.round(Number(i));return Number.isFinite(e)?Math.min(di,Math.max(li,e)):$n},Dt=i=>Lp.includes(i)?i:"links";function ls(i,e){let t=Array.isArray(i)?i:[],n=Array.from({length:e},(a,r)=>typeof t[r]=="string"?t[r].trim():"");return n.some(Boolean)?n:[]}var Cp=["card","items","none","open"],An=i=>typeof i?.name=="string"?i.name.trim():"",Lt=i=>typeof i=="string"?{entity:i}:{...i},Ct=i=>Math.min(Math.max(1,Number(i)||2),3),ut=i=>Dp.includes(i)?i:"row",le=i=>!!(i?.entity||i?.name||i?.icon||i?.tap_action);function ds(i){if(Array.isArray(i?.rows)&&i.rows.length)return i.rows.map(n=>{let a=Ct(n.columns);return{columns:a,layout:ut(n.layout),align:Dt(n.align),image_size:ke(n.image_size),column_names:ls(n.column_names,a),items:(n.items??n.entities??[]).map(Lt)}});let e=(i?.items??i?.entities??[]).map(Lt);if(!e.length)return[];let t=Ct(i.columns);return[{columns:t,layout:ut(i.layout),align:Dt(i.align),image_size:ke(i.image_size),column_names:ls(i.column_names,t),items:e}]}function Mn(i){return Cp.includes(i?.surface)?i.surface:i?.bare?"none":"card"}var Hp=i=>Math.max(1,Math.ceil((i.items?.length||1)/i.columns)),Rp=22;function Vp(i){let e=ut(i?.layout);return e!=="beeld"?En[e]:ke(i?.image_size)+34}function ci(i){let e=i?.rows??[],t=An(i)?si+Re:0;if(!e.length)return ss+t+En.row;let n=(Mn(i)==="card"?ss:0)+t;for(let a of e){let r=Hp(a);n+=r*Vp(a)+(r-1)*Re,a.column_names?.length&&(n+=Rp+Re)}return n+(e.length-1)*Re}function Ht(i){for(i.bewaard??=[];i.items.length<i.columns;)i.items.push(i.bewaard.pop()??{entity:""});for(;i.items.length>i.columns;){let e=i.items.pop();le(e)&&i.bewaard.push(e)}return i}function cs(i){let e=Array.isArray(i.rows)&&i.rows.length?i.rows.map(n=>({columns:Ct(n.columns),layout:ut(n.layout),align:Dt(n.align),image_size:ke(n.image_size),column_names:Array.isArray(n.column_names)?[...n.column_names]:[],items:(n.items??n.entities??[]).map(Lt)})):(()=>{let n=(i.items??i.entities??[]).map(Lt);return n.length?[{columns:Ct(i.columns),layout:ut(i.layout),align:Dt(i.align),image_size:ke(i.image_size),column_names:Array.isArray(i.column_names)?[...i.column_names]:[],items:n}]:[]})(),t=[];for(let n of e){let a=[];for(let r=0;r<n.items.length;r+=n.columns)a.push(n.items.slice(r,r+n.columns));a.length||a.push([]),a.forEach((r,o)=>t.push(Ht({columns:n.columns,layout:n.layout,align:n.align,image_size:n.image_size,column_names:o===0?n.column_names:[],items:r})))}return t}var pi=i=>i.map(e=>{let t=(e.column_names??[]).slice(0,e.columns).map(n=>String(n??"").trim());return{columns:e.columns,...e.layout&&e.layout!=="row"?{layout:e.layout}:{},...e.align==="midden"?{align:"midden"}:{},...e.layout==="beeld"&&e.image_size!==$n?{image_size:ke(e.image_size)}:{},...t.some(Boolean)?{column_names:t}:{},items:e.items.filter(le).map(n=>structuredClone(n))}}).filter(e=>e.items.length);function hi(i,e,t){let n=new Set;for(let a of i){let r=/^r(\d+)(?:i(\d+))?$/.exec(a);if(!r)continue;let o=Number(r[1]),s=r[2]===void 0?"":`i${r[2]}`;if(t==="weg"){if(o===e)continue;n.add(o>e?`r${o-1}${s}`:a);continue}n.add(o>e?`r${o+1}${s}`:a)}return n}var ps=[{waarde:"row",label:"Rij"},{waarde:"tile",label:"Tegel"},{waarde:"compact",label:"Compact"},{waarde:"beeld",label:"Beeld"}],Ip=[{waarde:"links",label:"Links"},{waarde:"midden",label:"Midden"}],Pp=i=>ps.find(e=>e.waarde===i)?.label??"Rij",Bp=`
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
`,ui=class extends HTMLElement{constructor(){super(),this.rows_=[],this.rest_={},this.open_=new Set,this.koppen_=[]}setConfig(e){if(this.rest_={...e},delete this.rest_.rows,delete this.rest_.items,delete this.rest_.entities,delete this.rest_.columns,delete this.rest_.layout,delete this.rest_.align,delete this.rest_.image_size,delete this.rest_.column_names,this.gebouwd_&&e===this.uitObject_)return;let t=cs(e);this.gebouwd_&&JSON.stringify(pi(t))===this.uit_||(this.rows_=t,this.eersteKeer_||(this.eersteKeer_=!0,this.rows_.length===1&&this.open_.add("r0")),this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}connectedCallback(){this.gebouwd_||this.build_()}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}rijWeg_(e){this.open_=hi(this.open_,e,"weg")}rijErbij_(e){this.open_=hi(this.open_,e,"erbij")}itemWeg_(e,t){let n=new Set;for(let a of this.open_){let r=/^r(\d+)i(\d+)$/.exec(a);if(!r||Number(r[1])!==e){n.add(a);continue}let o=Number(r[2]);o!==t&&n.add(o>t?`r${e}i${o-1}`:a)}this.open_=n}legePlekkenOpen_(e,t){e.items.forEach((n,a)=>{le(n)||this.open_.add(`r${t}i${a}`)})}async build_(){if(!this.hass_||!this.rows_)return;await customElements.whenDefined("ha-form"),this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=Bp;let t=document.createElement("div");if(t.className="dac-ed",this.append(e,t),t.appendChild(this.kaartBlok_()),this.rows_.forEach((a,r)=>t.appendChild(this.rijBlok_(a,r))),!this.rows_.length){let a=document.createElement("p");a.className="uitleg",a.textContent="Een rij is een regel op de kaart, met een, twee of drie entiteiten naast elkaar. Elke rij heeft zijn eigen indeling en zijn eigen vorm. Een rij van een kolom is een losse knop.",t.appendChild(a)}let n=document.createElement("button");n.type="button",n.className="rijtoevoegen",n.textContent="\uFF0B  Rij toevoegen",n.addEventListener("click",()=>{let a=Ht({columns:2,layout:"row",items:[]});this.rows_.push(a);let r=this.rows_.length-1;this.open_.add(`r${r}`),this.legePlekkenOpen_(a,r),this.emit_(),this.build_()}),t.appendChild(n)}binnenKop_(e,t){return e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),t(n)}),e}segment_(e,t,n,{inKop:a=!1}={}){let r=document.createElement("span");r.className="segment";let o=e.map(l=>{let d=document.createElement("button");d.type="button",d.textContent=l.label,l.titel&&(d.title=l.titel);let c=()=>{t()!==l.waarde&&n(l.waarde)};return a?this.binnenKop_(d,c):d.addEventListener("click",c),r.appendChild(d),[d,l.waarde]}),s=()=>o.forEach(([l,d])=>l.setAttribute("aria-pressed",String(t()===d)));return s(),{wrap:r,vernieuw:s}}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"name",selector:{text:{}}},{name:"surface",selector:{select:{mode:"dropdown",options:[{value:"card",label:"Om de hele kaart"},{value:"open",label:"Alleen een rand, geen vulling"},{value:"none",label:"Geen vlak"}]}}},{name:"state_position",selector:{select:{mode:"dropdown",options:[{value:"below",label:"Onder de naam"},{value:"right",label:"Rechts op de regel"}]}}}],e.computeLabel=t=>({name:"Naam van de kaart (optioneel)",surface:"Waar het kaartvlak zit",state_position:"Waar de status staat"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="name")return"Een kop boven de entiteiten. Laat leeg voor geen kop -- de kaart is dan een rasterrij lager.";if(t.name==="surface")return"Alleen een rand geeft een doorzichtige kaart die nog wel een vorm heeft; geen vlak laat de plekken los op het dashboard staan.";if(t.name==="state_position")return"Rechts is de vorm van de entiteitenkaart van Home Assistant: de waarden komen onder elkaar uit. Regels met een schakelaar of een tijdveld tonen geen tekst, en op een tegel staat de status altijd onder de naam."},e.data={name:this.rest_.name??"",surface:this.rest_.surface??(this.rest_.bare?"none":"card"),state_position:this.rest_.state_position??"below"},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{};typeof n.name=="string"&&n.name.trim()?this.rest_.name=n.name:delete this.rest_.name,n.surface==="items"||n.surface==="none"||n.surface==="open"?this.rest_.surface=n.surface:delete this.rest_.surface,delete this.rest_.bare,n.state_position==="right"?this.rest_.state_position="right":delete this.rest_.state_position,this.emit_()}),e}rijBlok_(e,t){let n=document.createElement("details");n.className="rij",this.onthoud_(n,`r${t}`);let a=document.createElement("summary"),r=document.createElement("span");r.className="pijl",r.textContent="\u203A";let o=document.createElement("span");o.className="titel";let s=document.createElement("b");s.textContent=`Rij ${t+1}`;let l=document.createElement("small");o.append(s,l);let d=this.segment_([1,2,3].map(T=>({waarde:T,label:String(T),titel:`${T} entiteit${T>1?"en":""} in deze rij`})),()=>e.columns,T=>{e.columns=T,Ht(e),this.open_.add(`r${t}`),this.legePlekkenOpen_(e,t),this.emit_(),this.build_()},{inKop:!0}),c=document.createElement("button");c.type="button",c.className="weg dupliceer",c.title="Rij dupliceren",c.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M6.5 15H5.6A1.6 1.6 0 0 1 4 13.4V5.6A1.6 1.6 0 0 1 5.6 4h7.8A1.6 1.6 0 0 1 15 5.6v.9"/></svg>',this.binnenKop_(c,()=>{this.rows_.splice(t+1,0,structuredClone(this.rows_[t])),this.rijErbij_(t),this.open_.add(`r${t+1}`),this.emit_(),this.build_()});let p=document.createElement("button");p.type="button",p.className="weg",p.title="Rij verwijderen",p.textContent="\u2715",this.binnenKop_(p,()=>{this.rows_.splice(t,1),this.rijWeg_(t),this.emit_(),this.build_()}),a.append(r,o,d.wrap,c,p);let h=document.createElement("div");h.className="rijbody";let g=this.segment_(ps.map(T=>({waarde:T.waarde,label:T.label})),()=>e.layout,T=>{e.layout=T,me(),this.emit_()}),f=document.createElement("div");f.className="vormrij";let k=document.createElement("b");k.textContent="Vorm van deze rij",f.append(k,g.wrap),h.appendChild(f);let x=this.segment_(Ip.map(T=>({waarde:T.waarde,label:T.label})),()=>e.align??"links",T=>{e.align=T,this.emit_()}),$=document.createElement("div");$.className="vormrij";let w=document.createElement("b");w.textContent="Uitlijning",$.append(w,x.wrap),h.appendChild($);let V=document.createElement("div");V.className="beeldvak";let I=document.createElement("ha-form");I.hass=this.hass_,I.schema=[{name:"image_size",selector:{number:{min:li,max:di,step:4,mode:"slider"}}}],I.computeLabel=()=>"Grootte van de afbeelding",I.computeHelper=()=>"In pixels. Groot genoeg om een QR-code te scannen begint rond de 160.",I.data={image_size:ke(e.image_size)},I.addEventListener("value-changed",T=>{T.stopPropagation(),e.image_size=ke(T.detail.value?.image_size),this.emit_()}),V.appendChild(I),h.appendChild(V);let me=()=>{let T=e.layout==="beeld";V.style.display=T?"":"none",$.style.display=T?"none":""};me();let pe=document.createElement("div");pe.className="kolomvak";let ge=document.createElement("ha-form");ge.hass=this.hass_;let ko=()=>Array.from({length:e.columns},(T,re)=>({name:`k${re}`,selector:{text:{}}}));ge.schema=ko(),ge.computeLabel=T=>`Kop boven kolom ${Number(T.name.slice(1))+1}`,ge.computeHelper=T=>T.name==="k0"?"Laat leeg voor geen koppen. Handig als er twee dingen naast elkaar staan die allebei een naam verdienen.":void 0;let xo=()=>Object.fromEntries(Array.from({length:e.columns},(T,re)=>[`k${re}`,e.column_names?.[re]??""]));ge.data=xo(),ge.addEventListener("value-changed",T=>{T.stopPropagation();let re=T.detail.value??{};e.column_names=Array.from({length:e.columns},(_o,Rc)=>re[`k${Rc}`]??""),this.emit_()}),pe.appendChild(ge),h.appendChild(pe);let wo=()=>{let T=e.items.filter(le),re=[`${e.columns} kolom${e.columns>1?"men":""}`];e.layout!=="row"&&re.push(Pp(e.layout)),re.push(T.length?T.map(_o=>this.itemNaam_(_o)).join(", "):"nog leeg"),e.column_names?.some?.(Boolean)&&re.push("met kolomkoppen"),l.textContent=re.join(" \xB7 "),d.vernieuw(),g.vernieuw(),x.vernieuw(),me(),ge.schema.length!==e.columns&&(ge.schema=ko()),ge.data=xo()};return this.koppen_.push(wo),e.items.forEach((T,re)=>h.appendChild(this.itemBlok_(e,T,t,re))),n.append(a,h),wo(),n}itemNaam_(e){return e.name||this.hass_?.states?.[e.entity]?.attributes?.friendly_name||e.entity||"Knop"}itemBlok_(e,t,n,a){let r=document.createElement("details");r.className="item",this.onthoud_(r,`r${n}i${a}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="pijl",s.textContent="\u203A";let l=document.createElement("span");l.className="nr",l.textContent=String(a+1),l.title=`Plek ${a+1} in de rij`;let d=document.createElement("span");d.className="titel";let c=document.createElement("b"),p=document.createElement("small");d.append(c,p);let h=document.createElement("button");h.type="button",h.className="weg",h.title="Deze plek leegmaken",h.textContent="\u2715",this.binnenKop_(h,()=>{e.items.splice(a,1),this.itemWeg_(n,a),Ht(e),this.emit_(),this.build_()}),o.append(s,l,d,h);let g=document.createElement("div");g.className="itembody";let f=document.createElement("ha-form");f.hass=this.hass_,f.schema=[{name:"entity",selector:{entity:{}}}],f.computeLabel=()=>"Entiteit",f.computeHelper=()=>"Mag leeg blijven: zonder entiteit wordt dit een navigatieknop. Geef hem dan een naam, een icoon en een tikactie.",f.addEventListener("value-changed",w=>{w.stopPropagation(),t.entity=w.detail.value.entity??"",this.emit_()});let k=document.createElement("dac-icon-picker");k.label="Icoon",k.hass=this.hass_,k.addEventListener("value-changed",w=>{w.stopPropagation(),w.detail.value?t.icon=w.detail.value:delete t.icon,this.emit_()});let x=document.createElement("ha-form");x.hass=this.hass_,x.schema=[{name:"name",selector:{text:{}}},{name:"toggle",selector:{boolean:{}}},{name:"show_icon",selector:{boolean:{}}},{name:"show_name",selector:{boolean:{}}},{name:"show_state",selector:{boolean:{}}},{name:"icon_tap_action",selector:{ui_action:{default_action:"toggle"}}},{name:"icon_hold_action",selector:{ui_action:{default_action:"more-info"}}},{name:"tap_action",selector:{ui_action:{default_action:"more-info"}}},{name:"hold_action",selector:{ui_action:{default_action:"more-info"}}},{name:"double_tap_action",selector:{ui_action:{default_action:"none"}}}],x.computeLabel=w=>({name:"Naam (overschrijft die van de entiteit)",toggle:"Schakelaar tonen",show_icon:"Icoon tonen",show_name:"Naam tonen",show_state:"Status tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de regel",hold_action:"Vasthouden op de regel",double_tap_action:"Dubbeltikken op de regel"})[w.name]??w.name,x.computeHelper=w=>{if(w.name==="icon_tap_action")return"Het icoon en de regel zijn twee knoppen: het icoon schakelt, de regel opent of navigeert.";if(w.name==="toggle")return"Een schuifschakelaar in plaats van de statustekst. Alleen voor wat twee standen heeft: een lamp, een stopcontact, een schakelaar.";if(w.name==="show_state")return"Een tijd of datum -- een input_datetime, of een klok van een apparaat -- verschijnt hier als een veld dat je meteen kunt zetten. Uit haalt met de tekst ook dat veld weg.";if(w.name==="double_tap_action")return"Laat dit op geen actie staan als je het niet gebruikt: een regel die op dubbeltikken wacht, reageert trager op een gewone tik."},x.addEventListener("value-changed",w=>{w.stopPropagation();let V=w.detail.value;V.name?t.name=V.name:delete t.name,V.toggle===!0?t.toggle=!0:delete t.toggle;for(let I of["show_icon","show_name","show_state"])V[I]===!1?t[I]=!1:delete t[I];for(let I of["icon_tap_action","icon_hold_action","tap_action","hold_action"])V[I]?t[I]=V[I]:delete t[I];V.double_tap_action&&V.double_tap_action.action!=="none"?t.double_tap_action=V.double_tap_action:delete t.double_tap_action,this.emit_()});let $=()=>{c.textContent=le(t)?this.itemNaam_(t):"Kies een entiteit",p.textContent=t.entity||(le(t)?"Zonder entiteit: een navigatieknop":""),r.dataset.leeg=String(!le(t)),h.hidden=!le(t)};return this.koppen_.push($),f.data={entity:t.entity||void 0},k.value=t.icon??"",x.data={name:t.name??"",toggle:t.toggle??!1,show_icon:t.show_icon??!0,show_name:t.show_name??!0,show_state:t.show_state??!0,icon_tap_action:t.icon_tap_action,icon_hold_action:t.icon_hold_action,tap_action:t.tap_action,hold_action:t.hold_action,double_tap_action:t.double_tap_action},g.append(f,k,x),r.append(o,g),$(),r}emit_(){let e=pi(this.rows_),t={...this.rest_,rows:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_)n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};L("domotiapp-entities-card-editor",ui);var Sn=class extends S{validate(e){let t=ds(e);return t.some(n=>n.items.some(le))?{show_state:!0,state_position:"below",...e,rows:t}:{...e,[C]:"Voeg een rij toe en kies daar entiteiten in."}}watched(){return this.config.rows.flatMap(e=>e.items.map(t=>t.entity))}item_(e,t){return this.config.rows[+e]?.items[+t]}tone_(e){return e.tone?Z(e.tone):this.config.tone?Z(this.config.tone):ye(e.entity)!=="light"?E.accent:Eo(v(this.hass,e.entity))??E.lit}metSchakelaar_(e){return!!e.toggle&&Ao(e.entity)}metTijd_(e){return!as(e.entity)||this.metSchakelaar_(e)?!1:(e.show_state??this.config.show_state)!==!1}metKeuze_(e){return!Ja(e.entity)||this.metSchakelaar_(e)?!1:(e.show_state??this.config.show_state)!==!1}template(){let e=this.config;this.setAttribute("vlak",Mn(e)),this.style.containerType="inline-size";let t=Mn(e)==="items",n=e.rows.map((o,s)=>{let l=e.state_position==="right"&&o.layout!=="tile",d=`<span class="st${l?" rechts":""}"></span>`,c=o.items.map((h,g)=>`
          <div class="it${t?" surface":""}" role="button" tabindex="0"
               data-r="${s}" data-i="${g}">
            ${o.layout==="tile"?'<span class="wash"></span>':""}
            ${h.show_icon===!1?"":'<span class="chip" role="button" tabindex="0"></span>'}
            <span class="txt">${h.show_name===!1?"":'<span class="nm"></span>'}${l?"":d}</span>
            ${l?d:""}
            ${this.metSchakelaar_(h)?xn({label:"Aan of uit"}):""}
            ${this.metTijd_(h)?'<span class="tijdslot" style="display:contents"></span>':""}
            ${this.metKeuze_(h)?'<span class="keuzeslot" style="display:contents"></span>':""}
          </div>`).join("");return`${o.column_names.length?`<div class="kolomkoppen" data-vorm="${o.layout}" data-uit="${o.align}"
              style="--cols:${o.columns}">${o.column_names.map(h=>`<span>${j(h)}</span>`).join("")}</div>`:""}
      <div class="row" data-vorm="${o.layout}" data-uit="${o.align}"
           style="--cols:${o.columns};--it-h:${o.layout==="beeld"?o.image_size+34:En[o.layout]}px;--beeld:${o.image_size}px">${c}</div>`}).join("");return`<div class="card surface">${An(e)?'<h3 class="kaartnaam"></h3>':""}${n}</div>`}wire(){this.$$(".it").forEach(e=>{let t=this.item_(e.dataset.r,e.dataset.i);if(!t)return;let n=(s,l)=>je(this,this.hass,t,t[s]??l),a={action:t.entity?"more-info":"none"};this.teardown_.push(W(e,{onTap:()=>n("tap_action",a),onHold:()=>n("hold_action",a),onDouble:t.double_tap_action?()=>n("double_tap_action",{action:"none"}):void 0}));let r=e.querySelector(".chip");if(r&&(this.teardown_.push(W(r,{onTap:()=>n("icon_tap_action",Tt(t.entity)),onHold:()=>n("icon_hold_action",a)})),this.on(r,"click",s=>s.stopPropagation()),this.on(r,"pointerdown",s=>s.stopPropagation())),e.querySelector(".tijdslot")){let s=p=>{let h=p.target?.closest?.(".tijd");if(h&&(p.stopPropagation(),p.type==="click"))try{h.showPicker?.()}catch{}};this.on(e,"pointerdown",s,!0),this.on(e,"click",s,!0);let l=null,d=null,c=()=>{clearTimeout(d),d=null;let p=l;l=null,p&&this.hass.callService(p[0],p[1],p[2])};this.teardown_.push(()=>clearTimeout(d)),this.on(e,"change",p=>{let h=p.target?.closest?.(".tijd");h&&(p.stopPropagation(),l=rs(t.entity,h.type,h.value),clearTimeout(d),d=setTimeout(c,600))}),this.on(e,"focusout",p=>{p.target?.closest?.(".tijd")&&c()})}if(e.querySelector(".keuzeslot")){let s=l=>{l.target?.closest?.(".keuze")&&l.stopPropagation()};this.on(e,"pointerdown",s,!0),this.on(e,"click",s,!0),this.on(e,"keydown",s,!0),this.on(e,"change",l=>{let d=l.target?.closest?.(".keuze");if(!d)return;l.stopPropagation();let c=v(this.hass,t.entity),p=pt(t.entity,d.value,be(c));p&&this.hass.callService(p[0],p[1],p[2])})}let o=e.querySelector(".toggle");o&&this.teardown_.push(wn(o,{value:()=>X(v(this.hass,t.entity)),set:s=>this.hass.callService("homeassistant",s?"turn_on":"turn_off",{entity_id:t.entity}),disabled:()=>ne(v(this.hass,t.entity))}))})}paint(){let e=this.$(".kaartnaam");e&&this.text(e,An(this.config)),this.$$(".it").forEach(t=>{let n=this.item_(t.dataset.r,t.dataset.i);if(!n)return;let a=v(this.hass,n.entity),r=X(a),o=!!n.entity&&ne(a);t.dataset.on=String(r),t.classList.toggle("unavailable",o);let s=this.tone_(n);t.style.setProperty("--tone",s);let l=M(this.hass,n.entity,n.name),d=t.querySelector(".chip");if(d){let w=cn(this.hass,n.entity,n.icon),V=n.icon||(w?`pic:${w}`:Ra(n.entity,q(this.hass,n.entity)));d.dataset.icon!==V&&(d.dataset.icon=V,d.classList.toggle("pic",!!w),d.innerHTML=w?`<img src="${w}" alt="" loading="lazy" />`:b(n.icon||Ra(n.entity,q(this.hass,n.entity)))),d.style.setProperty("--tone",w?"var(--dac-ink-3)":r?s:"var(--dac-ink-3)"),d.setAttribute("aria-label",n.entity?`${l} schakelen`:"Icoon")}let c=t.querySelector(".nm");c&&this.text(c,l);let p=t.querySelector(".toggle");p&&(Ot(p,r),p.style.setProperty("--tone",s),p.setAttribute("aria-label",`${l} aan of uit`));let h=t.querySelector(".tijdslot"),g=null;if(h){let w=o?null:oi(a);h.dataset.soort!==(w??"")&&(h.dataset.soort=w??"",h.innerHTML=w?`<input class="tijd" type="${w}" step="60" />`:""),g=h.querySelector(".tijd")}if(g&&(g.setAttribute("aria-label",`${l} instellen`),this.shadowRoot.activeElement!==g)){let w=is(a,h.dataset.soort);g.value!==w&&(g.value=w)}let f=t.querySelector(".keuzeslot"),k=null;if(f){let w=o?[]:be(a),V=w.map(me=>zn(me,this.hass?.formatEntityState?.(a,me))),I=JSON.stringify([w,V]);f.dataset.opties!==I&&(f.dataset.opties=I,f.innerHTML=w.length?`<select class="keuze">${w.map((me,pe)=>`<option value="${j(me)}">${j(V[pe])}</option>`).join("")}</select>`:""),k=f.querySelector(".keuze")}if(k&&(k.setAttribute("aria-label",`${l} kiezen`),this.shadowRoot.activeElement!==k)){let w=ct(a);k.value!==w&&(k.value=w)}let x=t.querySelector(".st"),$=n.show_state??this.config.show_state;if(p||g||k)x.textContent="";else if($===!1)x.textContent="";else if(o)x.textContent="Niet bereikbaar";else if(!a||Ca(a.entity_id))x.textContent="";else if(ye(a.entity_id)==="light"&&r&&a.attributes.brightness!=null)x.textContent=`${Math.round(a.attributes.brightness/255*100)}%`;else{let w=a.attributes.unit_of_measurement;x.textContent=w?`${a.state} ${w}`:J(this.hass,a)}t.setAttribute("aria-label",`${l}${a?`, ${J(this.hass,a)}`:""}`)})}getCardSize(){return ze(ci(this.config))}getGridOptions(){let e=ze(ci(this.config));return{columns:12,rows:e,min_columns:4,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-entities-card-editor")}static getStubConfig(){return{rows:[]}}};_(Sn,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 5px 10px;
      display: flex; flex-direction: column; justify-content: center; gap: ${Re}px;
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
      font-size: 13px; font-weight: 600; letter-spacing: -.01em; line-height: ${si}px;
      color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .row {
      display: grid; gap: ${Re}px;
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
      display: grid; gap: ${Re}px;
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

    ${_n}
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
  `);N("domotiapp-entities-card",Sn,{name:"DomotiApp Entiteiten",description:"Entiteiten in rijen, elk met een eigen kolomindeling en vorm: regel, tegel of compacte pil. Ook voor een losse knop."});var Y={PAUSE:1,SEEK:2,VOLUME_SET:4,VOLUME_MUTE:8,PREVIOUS_TRACK:16,NEXT_TRACK:32,TURN_ON:128,TURN_OFF:256,PLAY_MEDIA:512,VOLUME_STEP:1024,SELECT_SOURCE:2048,STOP:4096,PLAY:16384,SHUFFLE_SET:32768,REPEAT_SET:262144,GROUPING:524288},Q=(i,e)=>!!(Number(i?.attributes?.supported_features??0)&e),mt=i=>!i||i.state==="off",mi=i=>!!i&&!["off","unavailable","unknown"].includes(i.state),Rt=i=>i?.state==="playing",hs=i=>!!i&&!["off","unavailable","unknown","idle","standby"].includes(i.state);function us(i){if(!i)return[];let e=[];return(Q(i,Y.TURN_ON)||Q(i,Y.TURN_OFF))&&e.push("power"),mt(i)||(Q(i,Y.PREVIOUS_TRACK)&&e.push("prev"),Q(i,Y.PLAY)||Q(i,Y.PAUSE)||Q(i,Y.PLAY_MEDIA)?e.push("play"):Q(i,Y.STOP)&&e.push("stop"),Q(i,Y.NEXT_TRACK)&&e.push("next")),e}var Xe=i=>i?.volume_entity||i?.entity;function gi(i){if(!mi(i))return[];let e=[];return Q(i,Y.VOLUME_MUTE)&&e.push("mute"),Q(i,Y.VOLUME_SET)?e.push("slider"):Q(i,Y.VOLUME_STEP)&&e.push("steps"),e}var Ve=i=>Math.round(Math.min(1,Math.max(0,Number(i?.attributes?.volume_level??0)))*100),ms=i=>i?.attributes?.volume_level!==void 0&&i?.attributes?.volume_level!==null,Vt=i=>!!i?.attributes?.is_volume_muted,fi=i=>!!i?.attributes?.mass_player_type,bi=i=>!!i?.attributes?.shuffle,vi=i=>{let e=i?.attributes?.repeat;return["off","all","one"].includes(e)?e:"off"},gs=i=>({off:"all",all:"one",one:"off"})[Kp(i)]??"all",Kp=i=>["off","all","one"].includes(i)?i:"off";function ki(i,{zoeken:e=!0,sleep:t=!1}={}){if(!mi(i))return[];let n=[];return Q(i,Y.SHUFFLE_SET)&&n.push("shuffle"),Q(i,Y.REPEAT_SET)&&n.push("repeat"),t&&n.push("sleep"),e&&fi(i)&&n.push("search"),n}function fs(i,{tonen:e=!0}={}){if(!e||!mi(i)||!Q(i,Y.SELECT_SOURCE)||fi(i))return null;let t=i?.attributes?.source_list;return!Array.isArray(t)||t.length<2?null:{nu:i.attributes.source??null,aantal:t.length}}function Nn(i,e=t=>t?.state??""){if(!i)return"";if(i.state==="unavailable")return"Niet bereikbaar";if(i.state==="off")return"Uit";if(i.state==="standby")return"Stand-by";let t=i.attributes??{},n=t.media_title||t.media_channel||"",a=t.media_artist||t.media_series_title||t.media_album_name||t.app_name||t.source||"";return i.state==="idle"||!n?a||e(i):a&&a!==n?`${n} \xB7 ${a}`:n}function It(i){let e=i?.attributes?.device_class;return e==="tv"?"tv":e==="receiver"?"radio":"speaker"}var Gp="domotiapp-media-speler:";function xi(i,e){let t=s=>e?.states?.[s]?.attributes?.friendly_name??s,n=s=>!!e?.states?.[s],a=()=>Object.keys(e?.states??{}).filter(s=>s.startsWith("media_player."));return(Array.isArray(i?.players)&&i.players.length?[...new Set([...n(i?.entity)?[i.entity]:[],...i.players.filter(n)])]:Wp(a(),e)).sort((s,l)=>String(t(s)).localeCompare(String(t(l)),"nl"))}function Wp(i,e){let t=i.filter(n=>fi(e?.states?.[n]));return t.length?t:i}var bs=i=>Gp+(i??[]).join("|");function vs(i,e,t){if(!i?.speaker_select)return i?.entity??"";let n=null;try{n=t?.getItem?.(bs(e))??null}catch{n=null}return n&&e?.includes(n)?n:i.entity&&e?.includes(i.entity)?i.entity:i.entity||e?.[0]||""}function ks(i,e,t){try{return i?.setItem?.(bs(e),String(t)),!0}catch{return!1}}var wi="dacScrollSlot",xs=["position","top","left","right","width","overflow"];function Tn(i=globalThis.document,e=globalThis.window){let t=i?.body;if(!t?.style||t.dataset?.[wi])return()=>{};let n=e?.scrollY??i.documentElement?.scrollTop??0,a=Object.fromEntries(xs.map(o=>[o,t.style[o]]));t.dataset&&(t.dataset[wi]="1"),t.style.position="fixed",t.style.top=`-${n}px`,t.style.left="0",t.style.right="0",t.style.width="100%",t.style.overflow="hidden";let r=!1;return()=>{if(!r){r=!0;for(let o of xs)t.style[o]=a[o];t.dataset&&delete t.dataset[wi],e?.scrollTo?.(0,n)}}}var Up=[400,1e3,2e3,4e3,8e3,15e3,3e4],Fp=6e4;function de(i){let e=i?.code;return e==="unknown_command"?!0:e==="not_allowed"&&/niet geladen/i.test(String(i?.message??""))}var oe=class{constructor(e,{wachttijden:t=Up,traag:n=Fp,klok:a,stopKlok:r}={}){this.doe_=e,this.wachttijden_=t,this.traag_=n,this.klok_=a??((o,s)=>setTimeout(o,s)),this.stopKlok_=r??(o=>clearTimeout(o)),this.poging=0,this.timer_=null}get magNog(){return this.poging<this.wachttijden_.length}plan(){let e=this.magNog;if(this.timer_)return e;let t=e?this.wachttijden_[this.poging]:this.traag_;return this.poging+=1,this.timer_=this.klok_(()=>{this.timer_=null,this.doe_()},t),e}herstel(){this.stop(),this.poging=0}stop(){this.timer_!==null&&(this.stopKlok_(this.timer_),this.timer_=null)}},xe=class{constructor(){this.was_=!0}herverbonden(e){let t=e?.connected!==!1,n=t&&!this.was_;return this.was_=t,n}};var qp=`
  :host {
    ${G}
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
`,_i=null,ws=i=>String(i??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),yi=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),_i=_i??[F(qp)],this.shadowRoot.adoptedStyleSheets=_i}connectedCallback(){this.gebouwd_||this.bouw_()}bouw_(){this.shadowRoot.innerHTML=`
      <div class="laag" role="dialog" aria-modal="true">
        <div class="vak">
          <h2></h2>
          <p></p>
          <div class="knoppen">
            <button type="button" class="nee"></button>
            <button type="button" class="ja"></button>
          </div>
        </div>
      </div>`,this.gebouwd_=!0,this.$(".nee").addEventListener("click",()=>this.klaar_(!1)),this.$(".ja").addEventListener("click",()=>this.klaar_(!0)),this.$(".laag").addEventListener("click",e=>{e.target===this.$(".laag")&&this.klaar_(!1)}),this.addEventListener("keydown",e=>{e.key==="Escape"&&this.klaar_(!1)})}$(e){return this.shadowRoot.querySelector(e)}open(e){return this.gebouwd_||this.bouw_(),this.$("h2").innerHTML=ws(e.title??"Weet je het zeker?"),this.$("p").innerHTML=ws(e.text??"Weet je zeker dat je dit wilt doen?"),this.$(".nee").textContent=e.dismissText??"Annuleren",this.$(".ja").textContent=e.confirmText??"OK",this.setAttribute("open",""),setTimeout(()=>this.$(".nee")?.focus(),40),new Promise(t=>{this.antwoord_=t})}klaar_(e){if(!this.hasAttribute("open"))return;this.removeAttribute("open");let t=this.antwoord_;this.antwoord_=null,t?.(e)}};L("domotiapp-vraag",yi);function Ae(i={}){let e=document.querySelector("domotiapp-vraag");e||(e=document.createElement("domotiapp-vraag"),document.body.appendChild(e)),e.tabIndex=-1;let t=e.open(i);return e.focus?.(),t}$o(Ae);var _s=[["playlists","Afspeellijsten"],["radio","Radio"],["tracks","Nummers"],["albums","Albums"],["artists","Artiesten"]];var Ie=i=>`domotiapp_lovelace/media/${i}`;function Zp(i,e){if(!i)return null;if(e)return i.uri?{type:Ie("favorite"),favorite:!0,uri:i.uri}:null;let t=ys(i);return!t||!i.library_item_id?null:{type:Ie("favorite"),favorite:!1,kind:t,library_item_id:String(i.library_item_id)}}function ys(i){let e=i?.media_type;return{track:"tracks",album:"albums",artist:"artists",playlist:"playlists",radio:"radio",podcast:"podcasts",audiobook:"audiobooks"}[e]??null}var js={tracks:"track",albums:"album",artists:"artist",playlists:"playlist",radio:"radio",podcasts:"podcast",audiobooks:"audiobook"},ji=[["","Alles"],["track","Nummers"],["album","Albums"],["artist","Artiesten"],["playlist","Afspeellijsten"],["radio","Radio"]];function zs(i,e,t=null){return i?.kind??ys(e)??t??"playlists"}var zi=i=>!!i?.uri,On=(i,e,{favoriet:t=!1,zoek:n="",limiet:a=50}={})=>i.callWS({type:Ie("library"),kind:e,favorite:t,...n?{search:n}:{},limit:a}).then(r=>r?.items??[]),$s=(i,e,t)=>{let n=Zp(e,t);return n?i.callWS(n):Promise.reject(new Error("Dit item kan niet favoriet gemaakt worden."))},Es=(i,e)=>i.callWS({type:Ie("playlist/create"),name:e}).then(t=>t?.playlist??null),As=(i,e)=>i.callWS({type:Ie("playlist/remove"),library_item_id:String(e.library_item_id)}),Ms=(i,e)=>i.callWS({type:Ie("playlist/tracks"),library_item_id:String(e.library_item_id),provider:e.provider??"library"}).then(t=>t?.tracks??[]),Ss=(i,e,t)=>i.callWS({type:Ie("playlist/add_tracks"),library_item_id:String(e.library_item_id),uris:t}),Ns=(i,e,t)=>i.callWS({type:Ie("playlist/remove_tracks"),library_item_id:String(e.library_item_id),positions:t});var Xp=350,Yp={track:"Nummer",album:"Album",artist:"Artiest",playlist:"Afspeellijst",radio:"Radio",podcast:"Podcast",audiobook:"Luisterboek"};function Qp(i){let e=Array.isArray(i.artists)?i.artists.map(a=>typeof a=="string"?a:a?.name).filter(Boolean).join(", "):"",t=typeof i.album=="string"?i.album:i.album?.name,n=Yp[i.media_type]??"";return[e,t].filter(Boolean).join(" \xB7 ")||n}var Jp=`
  :host {
    ${G}
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

  ${Le}
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
  /* Verwijderen staat als enige in de kritieke kleur, met een streep erboven.
     Zonder dat verschil staat "Afspeellijst verwijderen" precies zo in de rij
     als "Nu afspelen", en dat is de plek waar een duim per ongeluk landt. */
  .menu button.kritiek { color: var(--dac-bad); margin-top: 4px; }
  .menu button.kritiek::before {
    content: ""; display: block; height: 1px; margin: -4px -6px 8px;
    background: var(--dac-border);
  }
  .menu .titel {
    padding: 6px 12px 8px; font-size: 11.5px; color: var(--dac-ink-3);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px;
  }
`,$i=class extends HTMLElement{static get sheet_(){return Object.hasOwn(this,"s_")||(this.s_=F(Ne+Jp)),this.s_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[new.target.sheet_],this.soort_="",this.treffers_=[],this.speakers_=null,this.opruimen_=[],this.zoekHerkansing_=new oe(()=>this.zoek_()),this.speakerHerkansing_=new oe(()=>this.haalSpeakers_())}open(e,t,n,{radioModus:a=!1,speakers:r=null}={}){this.hass=e,this.entity_=t,this.naam_=n,this.radioModus_=a,this.speakerKeuze_=Array.isArray(r)&&r.length?r:null,this.gebouwd_||this.bouw_(),this.setAttribute("open",""),this.escape_??=o=>{o.key==="Escape"&&this.hasAttribute("open")&&this.sluit()},document.addEventListener("keydown",this.escape_,!0),this.scrollLos_??=Tn(),this.$(".wie b").textContent=n,this.$(".wie span").textContent="Music Assistant",this.sprekerSig_=null,this.$("footer")?.removeAttribute("open"),this.$(".voetkop")?.setAttribute("aria-expanded","false"),this.lijst_=null,this.soort_="",this.naarTab_("zoeken"),this.haalSpeakers_(),setTimeout(()=>this.$(".zoek input")?.focus(),60)}sluit(){this.removeAttribute("open"),this.menuDicht_(),this.escape_&&document.removeEventListener("keydown",this.escape_,!0),this.scrollLos_?.(),this.scrollLos_=null}set hass(e){this.hass_=e,this.gebouwd_&&this.hasAttribute("open")&&this.tekenSpeakers_()}get hass(){return this.hass_}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.gebouwd_=!0,this.shadowRoot.innerHTML=`
      <div class="laag">
        <header>
          <span class="wie"><b></b><span></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${b("close")}</button>
        </header>
        <nav class="tabs" role="tablist">
          <button type="button" role="tab" data-tab="zoeken" aria-selected="true">Zoeken</button>
          <button type="button" role="tab" data-tab="favorieten" aria-selected="false">Favorieten</button>
          <button type="button" role="tab" data-tab="lijsten" aria-selected="false">Afspeellijsten</button>
        </nav>
        <div class="lijstkop" hidden>
          <button class="rond terug" type="button" aria-label="Terug">${b("chevronRight")}</button>
          <b></b>
          <button class="rond weglijst" type="button" aria-label="Deze afspeellijst verwijderen">${b("bin")}</button>
        </div>
        <button class="nieuwe" type="button" hidden>+  Nieuwe afspeellijst</button>
        <div class="nieuwrij" hidden>
          <input type="text" placeholder="Naam van de afspeellijst" aria-label="Naam van de nieuwe afspeellijst" />
          <button class="zoekknop" type="button" data-maak>Maken</button>
        </div>
        <div class="zoek">
          <label class="veld">
            ${b("search")}
            <input type="search" placeholder="Zoeken naar een nummer, album, artiest of afspeellijst"
                   autocomplete="off" spellcheck="false" enterkeyhint="search"
                   aria-label="Zoeken in Music Assistant" />
          </label>
          <button class="zoekknop" type="button">Zoeken</button>
        </div>
        <nav class="soorten">
          ${ji.map(([t,n])=>`<button type="button" data-soort="${t}" aria-pressed="${t===""}">${n}</button>`).join("")}
        </nav>
        <div class="lijst"></div>
        <footer hidden>
          <button class="voetkop" type="button" aria-expanded="false">
            <span class="kop">Speelt af op</span>
            <span class="waar"></span>
            <span class="pijl">${b("chevronDown")}</span>
          </button>
          <div class="sprekers"></div>
        </footer>
        <div class="menu" hidden></div>
      </div>`,this.aan_(this.$(".sluit"),"click",()=>this.sluit()),this.aan_(this.$(".laag"),"pointerdown",t=>{t.target===this.$(".laag")?this.sluit():t.target.closest(".menu")||this.menuDicht_()});let e=this.$(".zoek input");this.aan_(this.$(".zoekknop"),"click",()=>{clearTimeout(this.timer_),this.zoek_(),e.focus()}),this.aan_(e,"input",()=>this.tikPauze_()),this.aan_(e,"keydown",t=>{t.key==="Enter"&&(clearTimeout(this.timer_),this.zoek_()),t.key==="Escape"&&this.sluit()}),this.lijstLuisteraars_(),this.aan_(this.$(".voetkop"),"click",()=>{let n=this.$("footer").toggleAttribute("open");this.$(".voetkop").setAttribute("aria-expanded",String(n)),this.voetOpen_=n}),this.aan_(this.$(".tabs"),"click",t=>{let n=t.target.closest("[data-tab]");n&&this.naarTab_(n.dataset.tab)}),this.aan_(this.$(".terug"),"click",()=>{this.lijst_=null,this.naarTab_("lijsten")}),this.aan_(this.$(".weglijst"),"click",()=>this.lijstWeg_()),this.aan_(this.$(".nieuwe"),"click",()=>{this.$(".nieuwrij").hidden=!1,this.$(".nieuwe").hidden=!0,this.$(".nieuwrij input").value="",this.$(".nieuwrij input").focus()}),this.aan_(this.$("[data-maak]"),"click",()=>this.lijstMaken_()),this.aan_(this.$(".nieuwrij input"),"keydown",t=>{t.key==="Enter"&&this.lijstMaken_(),t.key==="Escape"&&(this.$(".nieuwrij").hidden=!0,this.$(".nieuwe").hidden=!1)}),this.aan_(this.$(".soorten"),"click",t=>{let n=t.target.closest("[data-soort]");if(n){this.modus_==="favorieten"?this.bibSoort_=n.dataset.soort:this.soort_=n.dataset.soort;for(let a of this.shadowRoot.querySelectorAll("[data-soort]"))a.setAttribute("aria-pressed",String(a===n));clearTimeout(this.timer_),this.modus_==="favorieten"?this.haalFavorieten_():this.zoek_()}}),this.aan_(this.$(".sprekers"),"click",t=>{let n=t.target.closest("button[data-speaker]");n&&!n.disabled&&this.wisselSpeaker_(n.dataset.speaker)}),this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen: nummers, albums, artiesten, afspeellijsten en radio.")}aan_(e,t,n,a){e.addEventListener(t,n,a),this.opruimen_.push(()=>e.removeEventListener(t,n,a))}tikPauze_(){clearTimeout(this.timer_),this.timer_=setTimeout(()=>this.zoek_(),Xp)}async zoek_(){let e=this.$(".zoek input");if(!e)return;let t=e.value.trim();if(!t){this.treffers_=this.zoekTreffers_=[],this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen.");return}let n=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Zoeken\u2026",t);try{let a=await this.hass.callWS({type:"domotiapp_lovelace/media/search",query:t,...this.soort_?{media_types:[this.soort_]}:{},limit:20});if(n!==this.beurt_)return;this.treffers_=this.zoekTreffers_=a?.results??[],this.zoekHerkansing_.herstel(),this.teken_()}catch(a){if(n!==this.beurt_)return;if(de(a)){this.zoekHerkansing_.plan(),this.leegMelding_("Home Assistant start nog op","Zodra DomotiApp klaar is met opstarten, wordt er vanzelf gezocht.");return}this.leegMelding_("Zoeken lukte niet",a?.message??"Music Assistant gaf geen antwoord.",!0)}}naarTab_(e){this.modus_=e;for(let n of this.shadowRoot.querySelectorAll("[data-tab]"))n.setAttribute("aria-selected",String(n.dataset.tab===e));let t=e==="lijsten"&&this.lijst_;if(this.$(".zoek").hidden=e!=="zoeken",this.$(".soorten").hidden=e==="lijsten",this.$(".lijstkop").hidden=!t,this.$(".nieuwe").hidden=e!=="lijsten"||!!this.lijst_,this.$(".nieuwrij").hidden=!0,e==="zoeken"){if(this.tekenSoorten_(ji,this.soort_),this.treffers_=this.zoekTreffers_??[],!this.treffers_.length){this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen.");return}this.teken_();return}if(e==="favorieten"){this.haalFavorieten_();return}t?this.openLijst_(this.lijst_):this.haalLijsten_()}tekenSoorten_(e,t){this.$(".soorten").innerHTML=e.map(([n,a])=>`<button type="button" data-soort="${n}" aria-pressed="${n===t}">${a}</button>`).join("")}async haalFavorieten_(){this.bibSoort_??="playlists",this.tekenSoorten_(_s,this.bibSoort_);let e=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026","Je favorieten uit Music Assistant.");try{let t=await On(this.hass,this.bibSoort_,{favoriet:!0});if(e!==this.beurt_)return;if(this.treffers_=t,!t.length){this.leegMelding_("Nog geen favorieten","Zoek iets op en tik op het hartje om het hier te zetten.");return}this.teken_()}catch(t){if(e!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}async favorietOm_(e,t){let n=!e.favorite;e.favorite=n,t?.setAttribute("aria-pressed",String(n));try{let a=await $s(this.hass,e,n);n&&a?.library_item_id&&(e.library_item_id=a.library_item_id,a.kind&&(e.media_type=js[a.kind]??e.media_type)),n&&(this.bibSoort_=zs(a,e,this.bibSoort_)),this.modus_==="favorieten"&&!n&&this.haalFavorieten_()}catch(a){e.favorite=!n,t?.setAttribute("aria-pressed",String(!n)),this.leegMelding_("Dat lukte niet",a?.message??"Music Assistant gaf geen antwoord.",!0)}}async haalLijsten_(){let e=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026","Je afspeellijsten uit Music Assistant.");try{let t=await On(this.hass,"playlists",{});if(e!==this.beurt_)return;if(this.treffers_=t,!t.length){this.leegMelding_("Nog geen afspeellijsten","Maak er een met de knop hierboven.");return}this.teken_()}catch(t){if(e!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}async openLijst_(e){this.lijst_=e,this.modus_="lijsten",this.$(".lijstkop").hidden=!1,this.$(".lijstkop b").textContent=e.name??"Afspeellijst",this.$(".nieuwe").hidden=!0,this.$(".weglijst").hidden=!e.is_editable;let t=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026",e.name??"");try{let n=await Ms(this.hass,e);if(t!==this.beurt_)return;if(this.treffers_=n,!n.length){this.leegMelding_("Deze lijst is leeg","Zoek iets op en kies 'Aan afspeellijst toevoegen'.");return}this.teken_()}catch(n){if(t!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",n?.message??"Music Assistant gaf geen antwoord.",!0)}}async lijstMaken_(){let e=this.$(".nieuwrij input").value.trim();if(e){this.$(".nieuwrij").hidden=!0;try{await Es(this.hass,e),this.lijst_=null,this.naarTab_("lijsten")}catch(t){this.leegMelding_("Maken lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}}async lijstWeg_(e){let t=e??this.lijst_;if(!(!t||!await Ae({title:"Afspeellijst verwijderen?",text:`"${t.name}" wordt uit Music Assistant gehaald. De nummers zelf blijven gewoon in je bibliotheek staan.`,confirmText:"Verwijderen",dismissText:"Annuleren"})))try{await As(this.hass,t),this.lijst_&&this.lijst_.uri===t.uri&&(this.lijst_=null),this.melding_(`"${t.name}" verwijderd`),this.naarTab_("lijsten")}catch(a){this.melding_(a?.message??"Verwijderen lukte niet",!0)}}async nummerWeg_(e){let t=this.lijst_;if(!(!t||e.position==null))try{await Ns(this.hass,t,[e.position]),this.melding_(`"${e.name}" uit de lijst gehaald`),await this.naVerwerking_(t)}catch(n){this.melding_(n?.message??"Verwijderen lukte niet",!0)}}async naVerwerking_(e){for(let t of[900,2500]){if(await new Promise(n=>setTimeout(n,t)),this.lijst_!==e||!this.hasAttribute("open"))return;await this.openLijst_(e)}}async kiesLijstVoor_(e){this.menuDicht_();let t=[];try{t=await On(this.hass,"playlists",{})}catch{t=[]}let n=t.filter(r=>r.is_editable),a=this.$(".menu");a.innerHTML='<span class="titel">Aan welke lijst?</span>'+(n.length?n.map((r,o)=>`<button type="button" data-lijst="${o}">${this.veilig_(r.name)}</button>`).join(""):'<span class="titel">Geen bewerkbare lijst. Maak er eerst een.</span>'),a.hidden=!1,this.menuPlaats_(a),a.scrollTop=0,a.onclick=async r=>{let o=r.target.closest("[data-lijst]");if(!o)return;let s=n[+o.dataset.lijst];this.menuDicht_();try{await Ss(this.hass,s,[e.uri]),this.melding_(`"${e.name}" toegevoegd aan "${s.name}"`)}catch(l){this.melding_(l?.message??"Toevoegen lukte niet",!0)}}}melding_(e,t=!1){let n=this.$(".toast");n||(n=document.createElement("div"),n.className="toast",this.$(".laag").appendChild(n)),n.textContent=e,n.dataset.fout=String(t),n.hidden=!1,clearTimeout(this.toastTimer_),this.toastTimer_=setTimeout(()=>{n.hidden=!0},t?6e3:3e3)}leegMelding_(e,t,n=!1){this.$(".lijst").innerHTML=`<div class="melding${n?" fout":""}"><b>${e}</b>${t}</div>`}teken_(){let e=this.$(".lijst");if(!this.treffers_.length){this.leegMelding_("Niets gevonden","Probeer een andere naam of een ander soort.");return}let t=this.modus_==="lijsten"&&this.lijst_;e.innerHTML=this.treffers_.map((n,a)=>{let r=n.image?`<img src="${n.image}" alt="" loading="lazy" />`:b(n.media_type==="radio"?"radio":"music"),o=zi(n)&&!t?`<button class="hart" type="button" data-hart="${a}" aria-pressed="${!!n.favorite}"
                 aria-label="Favoriet">${b("star")}</button>`:"",s=t?`<button class="weg" type="button" data-weg="${a}"
               aria-label="Uit deze afspeellijst halen">${b("close")}</button>`:"",l=`<button class="meer" type="button" data-meer="${a}"
               aria-label="Meer met ${this.veilig_(n.name)}">${b("dots")}</button>`,d=(o||s?1:0)+1;return`
          <div class="rij" data-i="${a}" data-knoppen="${d}">
            <button class="tr" type="button">
              <span class="hoes">${r}</span>
              <span class="tekst">
                <span class="nm">${this.veilig_(n.name)}</span>
                <span class="ond">${this.veilig_(Qp(n))}</span>
              </span>
            </button><span class="knoppen">${o}${s}${l}</span>
          </div>`}).join(""),this.trefferBinding_?.(),this.trefferBinding_=W(e,{onTap:()=>{let n=this.laatsteTreffer_;n&&(this.modus_==="lijsten"&&!this.lijst_?this.openLijst_(n):this.speel_(n,"replace",{radio:this.radioStandaard_(n)}))},onHold:()=>{let n=this.laatsteTreffer_;n&&this.menuOpen_(n)}})}lijstLuisteraars_(){let e=this.$(".lijst");this.aan_(e,"click",t=>{let n=t.target.closest("[data-hart]"),a=t.target.closest("[data-weg]"),r=t.target.closest("[data-meer]");!n&&!a&&!r||(t.stopImmediatePropagation(),t.preventDefault(),n?this.favorietOm_(this.treffers_[+n.dataset.hart],n):a?this.nummerWeg_(this.treffers_[+a.dataset.weg]):(this.menuPlek_=r.getBoundingClientRect(),this.menuOpen_(this.treffers_[+r.dataset.meer])))}),this.aan_(e,"pointerdown",t=>{t.target.closest("[data-hart], [data-weg], [data-meer]")&&t.stopImmediatePropagation()}),this.aan_(e,"pointerdown",t=>{let n=t.target.closest("[data-i]");this.laatsteTreffer_=n?this.treffers_[+n.dataset.i]:null,this.menuPlek_=n?n.getBoundingClientRect():null})}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}speel_(e,t,{radio:n=!1}={}){e?.uri&&(this.menuDicht_(),this.hass.callService("music_assistant","play_media",{media_id:e.uri,...e.media_type?{media_type:e.media_type}:{},enqueue:t,...n?{radio_mode:!0}:{}},{entity_id:this.entity_}),t==="replace"&&this.sluit())}kanRadio_(e){return["track","album","artist"].includes(e?.media_type)}radioStandaard_(e){return!!this.radioModus_&&this.kanRadio_(e)}menuOpen_(e){let t=this.$(".menu"),n=this.modus_==="lijsten"&&this.lijst_;t.innerHTML=`<span class="titel">${this.veilig_(e.name)}</span><button type="button" data-w="replace">Nu afspelen</button>`+(this.kanRadio_(e)?'<button type="button" data-radio>Afspelen en doorgaan</button>':"")+'<button type="button" data-w="next">Hierna afspelen</button><button type="button" data-w="add">Achteraan in de wachtrij</button>'+(zi(e)?`<button type="button" data-fav>${e.favorite?"Uit favorieten":"Favoriet maken"}</button>`:"")+(e.uri&&!n&&e.media_type!=="playlist"?'<button type="button" data-toe>Aan afspeellijst toevoegen</button>':"")+(e.media_type==="playlist"&&e.is_editable?'<button type="button" class="kritiek" data-lijstweg>Afspeellijst verwijderen</button>':""),t.hidden=!1,this.menuPlaats_(t),t.onclick=a=>{let r=a.target.closest("[data-w]");if(r)return this.speel_(e,r.dataset.w,{radio:r.dataset.w==="replace"&&this.radioStandaard_(e)});if(a.target.closest("[data-radio]"))return this.speel_(e,"replace",{radio:!0});if(a.target.closest("[data-fav]"))return this.menuDicht_(),this.favorietOm_(e,this.shadowRoot.querySelector(`[data-hart="${this.treffers_.indexOf(e)}"]`));if(a.target.closest("[data-toe]"))return this.kiesLijstVoor_(e);if(a.target.closest("[data-lijstweg]"))return this.menuDicht_(),this.lijstWeg_(e)}}menuPlaats_(e){let t=this.menuPlek_,n=e.offsetWidth||210,a=e.offsetHeight||160,r=Math.min(Math.max(8,(t?.left??40)+12),window.innerWidth-n-8),o=(t?.bottom??80)+6,s=o+a<=window.innerHeight-8?o:Math.max(8,(t?.top??80)-a-6);e.style.left=`${r}px`,e.style.top=`${Math.min(s,Math.max(8,window.innerHeight-a-8))}px`}menuDicht_(){let e=this.$(".menu");e&&(e.hidden=!0)}async haalSpeakers_(){if(this.speakerKeuze_){this.speakers_={label_exists:!0,entities:this.speakerKeuze_.map(e=>{let t=v(this.hass,e);return t?{entity_id:e,name:t.attributes?.friendly_name??e,can_group:Q(t,Y.GROUPING)}:null}).filter(Boolean),filtered_out:0},this.tekenSpeakers_();return}try{this.speakers_=await this.hass.callWS({type:"domotiapp_lovelace/media/speakers"}),this.speakerHerkansing_.herstel()}catch(e){this.speakers_=null,de(e)&&this.speakerHerkansing_.plan()}this.tekenSpeakers_()}groepNu_(){let t=this.hass?.states?.[this.entity_]?.attributes?.group_members;return new Set(Array.isArray(t)?t:[])}tekenSpeakers_(){let e=this.$("footer");if(!e)return;let t=this.speakers_;if(!t||!t.label_exists||!t.entities?.length){e.hidden=!t||t.label_exists===void 0,e.hidden||(this.$(".sprekers").innerHTML=`<span class="ond" style="color:var(--dac-ink-2);font-size:12.5px">Plak het label <b>${this.veilig_(t?.label_name??"Music Assistant Media")}</b> op je speakers om ze hier samen te laten spelen.</span>`);return}e.hidden=!1;let n=this.groepNu_(),a=t.entities.filter(o=>o.entity_id===this.entity_||n.has(o.entity_id));this.$(".waar").textContent=a.length?a.map(o=>o.name).join(", "):this.naam_??"";let r=t.entities.map(o=>`${o.entity_id}:${o.entity_id===this.entity_||n.has(o.entity_id)}`).join("|");if(this.sprekerSig_!==r){this.sprekerSig_=r,this.schuiven_?.forEach(o=>o()),this.schuiven_=new Map,this.$(".sprekers").innerHTML=t.entities.map(o=>{let s=o.entity_id===this.entity_,l=s||n.has(o.entity_id),d=Q(v(this.hass,o.entity_id),Y.VOLUME_SET);return`
            <div class="spreker" data-speaker="${o.entity_id}" data-zelf="${s}" data-mee="${l}">
              <button class="mee" type="button" data-speaker="${o.entity_id}"
                      aria-pressed="${l}" ${!s&&!o.can_group?"disabled":""}
                      title="${s?"Deze speler":o.can_group?"Laat deze speaker meespelen":"Deze speaker laat zich niet koppelen"}">
                ${b(l?"volume":"speaker")}<span>${this.veilig_(o.name)}</span>
              </button>
              ${l&&d?`${fe()}<span class="pct tnum"></span>`:l?'<span class="stil">geen volumeregeling</span>':""}
            </div>`}).join("");for(let o of this.shadowRoot.querySelectorAll(".spreker")){let s=o.querySelector(".slider");if(!s)continue;let l=o.dataset.speaker;s.setAttribute("aria-label",`Volume ${o.querySelector("span")?.textContent??""}`);let d=De(s,{value:()=>Ve(v(this.hass,l)),onInput:c=>this.zetSchuif_(s,c),onCommit:c=>this.hass.callService("media_player","volume_set",{volume_level:c/100},{entity_id:l})});this.schuiven_.set(l,d)}}for(let o of this.shadowRoot.querySelectorAll(".spreker")){let s=o.dataset.speaker,l=o.querySelector(".slider");if(!l||l.classList.contains("dragging"))continue;let d=v(this.hass,s),c=Ve(d);this.zetSchuif_(l,c,Vt(d))}}zetSchuif_(e,t,n=!1){e.style.setProperty("--v",`${t}%`),e.setAttribute("aria-valuenow",String(t));let a=e.parentElement.querySelector(".pct");a&&(a.textContent=n?"gedempt":`${t}%`)}wisselSpeaker_(e){if(e===this.entity_)return;if(this.groepNu_().has(e)){this.hass.callService("media_player","unjoin",{},{entity_id:e});return}this.hass.callService("media_player","join",{group_members:[e]},{entity_id:this.entity_});let n=v(this.hass,this.entity_);if(typeof n?.attributes?.volume_level!="number")return;let a=Ve(n),r=v(this.hass,e);Q(r,Y.VOLUME_SET)&&Ve(r)!==a&&this.hass.callService("media_player","volume_set",{volume_level:a/100},{entity_id:e})}disconnectedCallback(){clearTimeout(this.timer_),this.zoekHerkansing_.stop(),this.speakerHerkansing_.stop(),this.scrollLos_?.(),this.scrollLos_=null,this.schuiven_?.forEach(e=>e()),this.schuiven_=null,this.escape_&&document.removeEventListener("keydown",this.escape_,!0),this.trefferBinding_?.();for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}};L("domotiapp-media-browser",$i);function Ts(i,e,t,n={}){let a=document.querySelector("domotiapp-media-browser");return a||(a=document.createElement("domotiapp-media-browser"),document.body.appendChild(a)),a.tabIndex=-1,a.open(i,e,t,n),a.focus?.(),a}var eh=`
  :host {
    ${G}
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
`,Ei=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[F(eh+Ne)],this.filter_="",this.opruimen_=[]}connectedCallback(){this.gebouwd_||this.bouw_()}disconnectedCallback(){for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}bouw_(){this.shadowRoot.innerHTML=`
      <div class="laag">
        <header>
          <span class="wie"><b class="naam"></b><span class="sub"></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${b("close")}</button>
        </header>
        <div class="zoek">
          <label class="veld">
            ${b("search")}
            <input type="search" placeholder="Zoek een zender of app" aria-label="Zoeken" />
          </label>
        </div>
        <div class="tel"></div>
        <div class="lijst" role="listbox"></div>
      </div>`,this.gebouwd_=!0;let e=(t,n,a)=>{t.addEventListener(n,a),this.opruimen_.push(()=>t.removeEventListener(n,a))};e(this.$(".sluit"),"click",()=>this.sluit()),e(this.$(".laag"),"click",t=>{t.target===this.$(".laag")&&this.sluit()}),e(this.$("input"),"input",t=>{this.filter_=t.target.value.trim().toLowerCase(),this.teken_()}),e(this.$("input"),"keydown",t=>{t.key==="Enter"&&this.$(".bron")?.click()}),e(this,"keydown",t=>{t.key==="Escape"&&this.hasAttribute("open")&&this.sluit()}),e(this.$(".lijst"),"click",t=>{let n=t.target.closest(".bron");n&&this.kies_(n.dataset.bron)})}$(e){return this.shadowRoot.querySelector(e)}open(e,t,n){this.hass=e,this.entity_=t,this.naam_=n,this.filter_="",this.gebouwd_||this.bouw_(),this.$("input").value="",this.setAttribute("open",""),this.teken_(),setTimeout(()=>this.$("input")?.focus(),60)}sluit(){this.removeAttribute("open")}bronnen_(){let e=v(this.hass,this.entity_),t=e?.attributes?.source_list??[],n=e?.attributes?.source,a=this.filter_?t.filter(r=>String(r).toLowerCase().includes(this.filter_)):[...t];return a.sort((r,o)=>r===n?-1:o===n?1:0),{lijst:a,nu:n,totaal:t.length}}teken_(){let{lijst:e,nu:t,totaal:n}=this.bronnen_();this.$(".naam").textContent=this.naam_??"Bron kiezen",this.$(".sub").textContent=t?`Nu: ${t}`:"",this.$(".tel").textContent=this.filter_?`${e.length} van ${n}`:`${n} bronnen`;let a=this.$(".lijst");if(!e.length){a.innerHTML='<div class="leeg">Niets gevonden.</div>';return}a.innerHTML=e.map(r=>{let o=String(r).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),s=r===t;return`<button class="bron" type="button" role="option" data-bron="${o}"
                  aria-current="${s}" aria-selected="${s}">
                  <b>${o}</b>${s?'<span class="nu">NU</span>':""}
                </button>`}).join("")}kies_(e){!e||!this.hass||(this.hass.callService("media_player","select_source",{entity_id:this.entity_,source:e}),this.sluit())}};L("domotiapp-bron-kiezer",Ei);function Os(i,e,t){let n=document.querySelector("domotiapp-bron-kiezer");return n||(n=document.createElement("domotiapp-bron-kiezer"),document.body.appendChild(n)),n.tabIndex=-1,n.open(i,e,t),n.focus?.(),n}function Ds(i,e){let t=i?.states?.[e]?.attributes?.group_members;return new Set(Array.isArray(t)?t:[])}var th=524288;function nh(i,e){let t=i?.states?.[e];return!t||t.state==="unavailable"?!1:(Number(t.attributes?.supported_features)&th)!==0}function Ai(i,e,t){return e===t?"zelf":nh(i,e)?ah(i,e,t)?"mee":"los":"kan-niet"}function ah(i,e,t){if(Ds(i,t).has(e))return!0;if(Ds(i,t).size===0){let n=i?.states?.[e]?.attributes?.group_members;if(Array.isArray(n)&&n.includes(t))return!0}return!1}function Ls(i,e,t){let n=Ai(i,e,t);return n==="zelf"||n==="kan-niet"?null:n==="mee"?{domein:"media_player",service:"unjoin",data:{},doel:{entity_id:e}}:{domein:"media_player",service:"join",data:{group_members:[e]},doel:{entity_id:t}}}var ih=`
  :host {
    ${G}
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

  /* ---- meespelen ----
     Een eigen knop naast de regel en niet erin: een knop in een knop bestaat
     niet in HTML, en een tik hierop moet iets \xE1nders doen dan een tik op de
     regel. Dezelfde afspraak als bij het hartje in het zoekscherm. */
  .rij { display: flex; align-items: stretch; gap: 8px; }
  .rij .sp { flex: 1 1 auto; min-width: 0; }
  .mee {
    flex: 0 0 auto; width: 52px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 3px;
    cursor: pointer; padding: 0; font: inherit;
    border-radius: var(--dac-radius-sm);
    border: 1px solid var(--dac-border); background: var(--dac-surface);
    color: var(--dac-ink-3);
    transition: color 180ms ease, border-color 180ms ease, background 180ms ease;
  }
  .mee .icon { width: 17px; height: 17px; }
  .mee span { font-size: 9px; letter-spacing: .04em; }
  .mee[aria-pressed="true"] {
    color: var(--dac-accent-hi);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
    background: color-mix(in srgb, var(--dac-accent) 16%, transparent);
  }
  .mee:disabled { opacity: .3; cursor: default; }
  .mee[hidden] { display: none; }
  @media (hover: hover) { .mee:not(:disabled):hover { border-color: var(--dac-border-hi); } }

  .leeg { padding: 28px 16px; text-align: center; color: var(--dac-ink-3); font-size: 13px; }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
`,Mi=null,Dn=i=>String(i??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),Si=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),Mi=Mi??[F(ih)],this.shadowRoot.adoptedStyleSheets=Mi,this.opruimen_=[],this.filter_="",this.lijst_=[]}connectedCallback(){this.gebouwd_||this.bouw_()}disconnectedCallback(){for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}bouw_(){this.shadowRoot.innerHTML=`
      <div class="laag">
        <header>
          <span class="wie"><b class="naam">Speaker kiezen</b><span class="sub"></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${b("close")}</button>
        </header>
        <div class="zoek">
          <label class="veld">
            ${b("search")}
            <input type="search" placeholder="Zoek een speaker" aria-label="Zoeken" />
          </label>
        </div>
        <div class="tel"></div>
        <div class="lijst" role="listbox"></div>
      </div>`,this.gebouwd_=!0;let e=(t,n,a)=>{t.addEventListener(n,a),this.opruimen_.push(()=>t.removeEventListener(n,a))};e(this.$(".sluit"),"click",()=>this.sluit()),e(this.$(".laag"),"click",t=>{t.target===this.$(".laag")&&this.sluit()}),e(this.$("input"),"input",t=>{this.filter_=t.target.value.trim().toLowerCase(),this.teken_()}),e(this.$("input"),"keydown",t=>{t.key==="Enter"&&this.$(".sp")?.click()}),e(this,"keydown",t=>{t.key==="Escape"&&this.hasAttribute("open")&&this.sluit()}),e(this.$(".lijst"),"click",t=>{let n=t.target.closest(".mee");if(n)return t.stopPropagation(),this.koppel_(n.dataset.id);let a=t.target.closest(".sp");a&&this.kies_(a.dataset.id)})}$(e){return this.shadowRoot.querySelector(e)}set hass(e){this.hass_=e,this.hasAttribute("open")&&this.gebouwd_&&this.teken_()}get hass(){return this.hass_}open(e,t,n,a){this.hass_=e,this.lijst_=Array.isArray(t)?t:[],this.huidig_=n,this.opKeuze_=a,this.filter_="",this.gebouwd_||this.bouw_(),this.$("input").value="",this.$(".zoek").hidden=this.lijst_.length<8,this.setAttribute("open",""),this.teken_(),this.$(".zoek").hidden||setTimeout(()=>this.$("input")?.focus(),60)}sluit(){this.removeAttribute("open")}teken_(){let e=this.lijst_,t=this.filter_?e.filter(a=>String(M(this.hass,a)).toLowerCase().includes(this.filter_)):[...e];this.$(".sub").textContent=this.huidig_?`Nu: ${M(this.hass,this.huidig_)}`:"",this.$(".tel").textContent=this.filter_?`${t.length} van ${e.length}`:`${e.length} speaker${e.length===1?"":"s"}`;let n=this.$(".lijst");if(!t.length){n.innerHTML='<div class="leeg">Niets gevonden.</div>';return}n.innerHTML=t.map(a=>{let r=v(this.hass,a),o=a===this.huidig_,s=mt(r)?"Uit":Nn(r,c=>J(this.hass,c)),l=Ai(this.hass,a,this.huidig_),d=l==="mee";return`<div class="rij">
                  <button class="sp" type="button" role="option" data-id="${Dn(a)}"
                    data-speelt="${Rt(r)}" data-uit="${mt(r)}"
                    aria-current="${o}" aria-selected="${o}">
                    <span class="ico">${b(It(r),"speaker")}</span>
                    <span class="tekst">
                      <b>${Dn(M(this.hass,a))}</b>
                      <span>${Dn(d?`${s} \xB7 speelt mee`:s)}</span>
                    </span>
                    ${o?'<span class="nu">NU</span>':""}
                  </button>
                  <button class="mee" type="button" data-id="${Dn(a)}"
                    aria-pressed="${d}" ${l==="zelf"||l==="kan-niet"?"disabled":""}
                    ${l==="zelf"?"hidden":""}
                    aria-label="${d?"Laat deze speaker niet meer meespelen":"Laat deze speaker meespelen"}"
                    title="${l==="kan-niet"?"Deze speaker laat zich niet koppelen":d?"Speelt mee \u2014 tik om los te koppelen":"Laat meespelen met wat er nu speelt"}">
                    ${b(d?"volume":"speakers")}<span>${d?"MEE":"ERBIJ"}</span>
                  </button>
                </div>`}).join("")}koppel_(e){let t=Ls(this.hass,e,this.huidig_);t&&this.hass.callService(t.domein,t.service,t.data,t.doel)}kies_(e){e&&(this.opKeuze_?.(e),this.sluit())}};L("domotiapp-speler-kiezer",Si);function Cs(i,e,t,n){let a=document.querySelector("domotiapp-speler-kiezer");return a||(a=document.createElement("domotiapp-speler-kiezer"),document.body.appendChild(a)),a.tabIndex=-1,a.open(i,e,t,n),a.focus?.(),a}var Ni=[15,30,45,60,90],Ti=30;function Hs(i){let e=Math.max(0,Math.round(i)),t=Math.floor(e/3600),n=Math.floor(e%3600/60),a=e%60,r=t?String(n).padStart(2,"0"):String(n);return`${t?`${t}:`:""}${r}:${String(a).padStart(2,"0")}`}function Oi(i,{min:e=1,max:t=720}={}){let n=String(i??"").trim();if(!/^\d+$/.test(n))return null;let a=Number(n);return a>=e&&a<=t?a:null}var rh=`
  :host {
    ${G}
    position: fixed; inset: 0; z-index: 9999;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }
  *, *::before, *::after { box-sizing: border-box; }

  .laag {
    position: absolute; inset: 0;
    background: color-mix(in srgb, var(--dac-bg) 88%, transparent);
    backdrop-filter: blur(14px);
    display: grid; place-items: center; padding: 16px;
    animation: op 180ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }

  /* Zie valkuil 29: m\xE9t border-box hierboven, want dit vak heeft padding en
     stond eerder over allebei de schermranden heen op een telefoon. */
  .vak {
    width: min(360px, 100%); padding: 20px;
    background: var(--dac-bg-raise); border: 1px solid var(--dac-border-hi);
    border-radius: var(--dac-radius); box-shadow: 0 24px 60px -20px rgba(0,0,0,.7);
    display: flex; flex-direction: column; gap: 14px;
  }

  header { display: flex; align-items: center; gap: 10px; }
  header .ic { width: 22px; height: 22px; color: var(--dac-accent-hi); flex: 0 0 auto; }
  header .t { flex: 1 1 auto; min-width: 0; }
  header h2 { margin: 0; font-size: 16px; font-weight: 600; }
  header .waar {
    display: block; font-size: 12px; color: var(--dac-ink-3);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  header .sluit {
    width: 34px; height: 34px; flex: 0 0 auto; display: grid; place-items: center;
    border: 0; background: transparent; color: var(--dac-ink-2);
    border-radius: var(--dac-radius-pill); cursor: pointer;
  }
  header .sluit .icon { width: 18px; height: 18px; }

  /* ---- er loopt er een ---- */
  .loopt { display: none; flex-direction: column; align-items: center; gap: 4px; padding: 6px 0 2px; }
  :host([loopt]) .loopt { display: flex; }
  .loopt .rest {
    font-size: 40px; font-weight: 600; letter-spacing: -.02em;
    font-variant-numeric: tabular-nums; color: var(--dac-ink); line-height: 1;
  }
  .loopt .uitleg { font-size: 12px; color: var(--dac-ink-3); text-align: center; }

  /* ---- instellen ---- */
  .instel { display: flex; flex-direction: column; gap: 12px; }
  :host([loopt]) .instel { display: none; }

  .snel { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .snel button {
    padding: 10px 0; cursor: pointer; font: inherit; font-size: 13px; font-weight: 500;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius-sm); color: var(--dac-ink);
    font-variant-numeric: tabular-nums;
  }
  .snel button[aria-pressed="true"] {
    border-color: var(--dac-accent-hi); color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent) 18%, transparent);
  }
  @media (hover: hover) { .snel button:hover { border-color: var(--dac-border-hi); } }

  label { display: flex; flex-direction: column; gap: 5px; font-size: 12px; color: var(--dac-ink-2); }
  .veld { display: flex; align-items: center; gap: 8px; }
  input {
    flex: 1 1 auto; min-width: 0; padding: 11px 12px;
    font: inherit; font-size: 15px; font-variant-numeric: tabular-nums;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius-sm); color: var(--dac-ink);
  }
  input:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  .eenheid { font-size: 12.5px; color: var(--dac-ink-3); flex: 0 0 auto; }

  .fout { font-size: 12px; color: var(--dac-bad); }
  .fout[hidden] { display: none; }

  .knoppen { display: flex; gap: 8px; }
  .knoppen button {
    flex: 1 1 0; padding: 12px; cursor: pointer; font: inherit; font-size: 14px; font-weight: 500;
    border-radius: var(--dac-radius-sm); border: 1px solid var(--dac-border-hi);
    background: transparent; color: var(--dac-ink);
  }
  .knoppen button.doe {
    background: var(--dac-accent); border-color: var(--dac-accent);
    color: #fff;
  }
  .knoppen button.weg { color: var(--dac-bad); border-color: color-mix(in srgb, var(--dac-bad) 45%, transparent); }
  .knoppen button[hidden] { display: none; }
`,Di=class extends HTMLElement{static get sheet_(){return Object.hasOwn(this,"s_")||(this.s_=F(rh)),this.s_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[this.constructor.sheet_]}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.shadowRoot.innerHTML=`
      <div class="laag">
        <div class="vak" role="dialog" aria-modal="true" aria-label="Sleeptimer">
          <header>
            <span class="ic">${b("sleep")}</span>
            <span class="t">
              <h2>Sleeptimer</h2>
              <span class="waar"></span>
            </span>
            <button class="sluit" type="button" aria-label="Sluiten">${b("close")}</button>
          </header>

          <div class="loopt">
            <span class="rest" aria-live="polite">--:--</span>
            <span class="uitleg"></span>
          </div>

          <div class="instel">
            <div class="snel"></div>
            <label>
              Of typ het zelf
              <span class="veld">
                <input class="min" type="number" inputmode="numeric" min="1" max="720"
                       aria-label="Minuten" />
                <span class="eenheid">minuten</span>
              </span>
            </label>
            <label>
              Uitfaden aan het eind
              <span class="veld">
                <input class="fade" type="number" inputmode="numeric" min="0" max="600"
                       aria-label="Seconden uitfaden" />
                <span class="eenheid">seconden</span>
              </span>
            </label>
            <span class="fout" hidden></span>
          </div>

          <div class="knoppen">
            <button class="weg" type="button" hidden>Timer stoppen</button>
            <button class="doe" type="button">Starten</button>
          </div>
        </div>
      </div>`,this.$(".snel").innerHTML=Ni.map(e=>`<button type="button" data-m="${e}" aria-pressed="false">${e}</button>`).join(""),this.$(".sluit").addEventListener("click",()=>this.dicht_()),this.$(".laag").addEventListener("click",e=>{e.target===this.$(".laag")&&this.dicht_()}),this.addEventListener("keydown",e=>{e.key==="Escape"&&this.dicht_(),e.key==="Enter"&&!this.hasAttribute("loopt")&&this.start_()}),this.$(".snel").addEventListener("click",e=>{let t=e.target.closest("[data-m]");t&&(this.$(".min").value=t.dataset.m,this.markeer_())}),this.$(".min").addEventListener("input",()=>this.markeer_()),this.$(".doe").addEventListener("click",()=>this.start_()),this.$(".weg").addEventListener("click",()=>this.stop_()),this.gebouwd_=!0}markeer_(){let e=this.$(".min").value.trim();for(let t of this.$(".snel").querySelectorAll("[data-m]"))t.setAttribute("aria-pressed",String(t.dataset.m===e));this.$(".fout").hidden=!0}async open(e,t,n){this.gebouwd_||this.bouw_(),this.hass=e,this.entity_=t,this.$(".waar").textContent=n??t,this.$(".min").value=String(Ni[1]),this.$(".fade").value=String(Ti),this.markeer_(),this.setAttribute("open",""),this.tabIndex=-1,this.focus?.(),await this.haalStand_(),this.hasAttribute("loopt")||setTimeout(()=>this.$(".min")?.focus(),60)}dicht_(){this.removeAttribute("open"),clearInterval(this.tik_),this.tik_=null}async haalStand_(){let e=null;try{e=((await this.hass.callWS({type:"domotiapp_lovelace/media/sleeptimer/list"}))?.timers??[]).find(n=>n.entity_id===this.entity_)??null}catch{e=null}this.toon_(e)}toon_(e){if(clearInterval(this.tik_),this.tik_=null,this.$(".weg").hidden=!e,!e){this.removeAttribute("loopt"),this.$(".doe").textContent="Starten",this.$(".doe").hidden=!1;return}this.setAttribute("loopt",""),this.$(".doe").textContent="Opnieuw instellen",this.$(".doe").hidden=!1,this.$(".uitleg").textContent=e.fade?`De laatste ${e.fade} seconden zakt het volume weg, daarna pauzeert de muziek en gaat het volume terug.`:"Aan het eind pauzeert de muziek.";let t=Date.parse(e.ends_at),n=()=>{let a=(t-Date.now())/1e3;this.$(".rest").textContent=Hs(a),a<=0&&(clearInterval(this.tik_),this.tik_=null,setTimeout(()=>this.hasAttribute("open")&&this.haalStand_(),1500))};n(),this.tik_=setInterval(n,1e3)}async start_(){if(this.hasAttribute("loopt")){this.removeAttribute("loopt"),this.$(".doe").textContent="Starten",clearInterval(this.tik_),this.tik_=null,setTimeout(()=>this.$(".min")?.focus(),40);return}let e=Oi(this.$(".min").value);if(e===null){this.melding_("Vul een heel aantal minuten in, tussen 1 en 720.");return}let t=Oi(this.$(".fade").value,{min:0,max:600})??Ti;try{let n=await this.hass.callWS({type:"domotiapp_lovelace/media/sleeptimer/set",entity_id:this.entity_,minutes:e,fade:t});this.toon_(n)}catch(n){this.melding_(n?.message??"De sleeptimer kon niet gezet worden. Is DomotiApp Lovelace klaar met opstarten?")}}async stop_(){try{await this.hass.callWS({type:"domotiapp_lovelace/media/sleeptimer/cancel",entity_id:this.entity_})}catch{}await this.haalStand_()}melding_(e){let t=this.$(".fout");t.textContent=e,t.hidden=!1}};L("domotiapp-sleeptimer",Di);function Rs(i,e,t){let n=document.querySelector("domotiapp-sleeptimer");return n||(n=document.createElement("domotiapp-sleeptimer"),document.body.appendChild(n)),n.open(i,e,t??M(i,e)),n}var Ln={power:{icon:"power",label:"Aan of uit"},prev:{icon:"prev",label:"Vorige"},play:{icon:"play",label:"Afspelen of pauzeren"},stop:{icon:"stop",label:"Stoppen"},next:{icon:"next",label:"Volgende"},shuffle:{icon:"shuffle",label:"Willekeurig afspelen"},repeat:{icon:"repeat",label:"Herhalen"},search:{icon:"search",label:"Zoeken in Music Assistant"},sleep:{icon:"sleep",label:"Sleeptimer"}},Cn=class extends S{setConfig(e){this.ruw_=e,super.setConfig(this.metSpeler_(e))}metSpeler_(e){if(!e?.speaker_select)return e;let t=xi(e,this.hass),n=vs(e,t,this.opslag_());return n&&n!==e.entity?{...e,entity:n}:e}set hass(e){let t=!this.hass_;if(super.hass=e,!t||!this.ruw_?.speaker_select)return;let n=this.metSpeler_(this.ruw_);n.entity&&n.entity!==this.config?.entity&&super.setConfig(n)}get hass(){return super.hass}opslag_(){try{return window.localStorage}catch{return null}}spelers_(){return xi(this.ruw_??this.config,this.hass)}groepsSpelers_(){let e=this.config.speakers;return Array.isArray(e)&&e.length||!this.config.speaker_select?e:this.spelers_()}kiesSpeler_(e){!e||e===this.config.entity||(ks(this.opslag_(),this.spelers_(),e),super.setConfig({...this.ruw_,entity:e}))}validate(e){return e.entity?{layout:"row",show_artwork:!0,show_volume:!0,show_source:!0,show_controls:!0,show_search:!0,...e}:{...e,[C]:e.speaker_select?"Zet er een mediaspeler in, of wacht tot Home Assistant er een meldt.":"Kies een mediaspeler."}}watched(){return[this.config.entity,this.config.volume_entity].filter(Boolean)}tone_(){return this.config.tone?Z(this.config.tone):E.accent}groot_(){return this.config.layout==="groot"}template(){return this.config.bare&&this.setAttribute("bare",""),this.setAttribute("layout",this.groot_()?"groot":"row"),`
      <div class="card surface" style="--tone:${this.tone_()}">
        ${this.config.speaker_select?`<button type="button" class="spelers" data-k="speler">
                 ${b("speakers")}
                 <span class="waar"></span>
                 <span class="pijl">${b("chevronDown")}</span>
               </button>`:""}
        ${this.groot_()?'<div class="hoesgroot" role="button" tabindex="0"></div>':""}
        <div class="top" data-on="false">
          <span class="chip" role="button" tabindex="0"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="ctl"></span>
        </div>
        <div class="vol" hidden></div>
        <div class="extra" hidden></div>
      </div>`}wire(){let e=this.config,t=(s,l)=>je(this,this.hass,e,e[s]??l);this.teardown_.push(R(this.$(".card"))),this.teardown_.push(W(this.$(".top"),{onTap:()=>t("tap_action",{action:"more-info"}),onHold:()=>t("hold_action",{action:"more-info"})}));let n=this.$(".chip");this.teardown_.push(W(n,{onTap:()=>t("icon_tap_action",Tt(e.entity)),onHold:()=>t("icon_hold_action",{action:"more-info"})})),this.on(n,"click",s=>s.stopPropagation()),this.on(n,"pointerdown",s=>s.stopPropagation());let a=this.$(".hoesgroot");a&&(this.teardown_.push(W(a,{onTap:()=>t("icon_tap_action",Tt(e.entity)),onHold:()=>t("icon_hold_action",{action:"more-info"})})),this.on(a,"click",s=>s.stopPropagation()),this.on(a,"pointerdown",s=>s.stopPropagation()));let r=s=>{let l=s.target.closest?.("[data-k]");l&&(s.stopPropagation(),this.doe_(l.dataset.k))},o=this.$(".spelers");o&&(this.on(o,"click",r),this.on(o,"pointerdown",s=>s.stopPropagation())),this.on(this.$(".ctl"),"click",r),this.on(this.$(".vol"),"click",r),this.on(this.$(".extra"),"click",r),this.on(this.$(".ctl"),"pointerdown",s=>s.stopPropagation()),this.on(this.$(".vol"),"pointerdown",s=>s.stopPropagation()),this.on(this.$(".extra"),"pointerdown",s=>s.stopPropagation()),this.sliders_=new Map}doe_(e){let t=this.config.entity,n=v(this.hass,t),a=(r,o={})=>this.hass.callService("media_player",r,{entity_id:t,...o});switch(e){case"power":return a(mt(n)?"turn_on":"turn_off");case"bron":return Os(this.hass,t,M(this.hass,t,this.config.name));case"prev":return a("media_previous_track");case"next":return a("media_next_track");case"play":return a(Rt(n)?"media_pause":"media_play");case"stop":return a("media_stop");case"mute":{let r=Xe(this.config);return this.hass.callService("media_player","volume_mute",{is_volume_muted:!Vt(v(this.hass,r))},{entity_id:r})}case"vol-":case"vol+":return this.hass.callService("media_player",e==="vol+"?"volume_up":"volume_down",{},{entity_id:Xe(this.config)});case"shuffle":return this.hass.callService("media_player","shuffle_set",{shuffle:!bi(n)},{entity_id:t});case"repeat":return this.hass.callService("media_player","repeat_set",{repeat:gs(vi(n))},{entity_id:t});case"speler":{let r=this.spelers_();return Cs(this.hass,r,t,o=>this.kiesSpeler_(o))}case"sleep":return Rs(this.hass,t,M(this.hass,t,this.config.name));case"search":return Ts(this.hass,t,M(this.hass,t,this.config.name),{radioModus:this.config.radio_mode===!0,speakers:this.groepsSpelers_()});default:return}}paint(){let e=this.config,t=v(this.hass,e.entity),n=!t||t.state==="unavailable",a=hs(t),r=this.$(".top");r.dataset.on=String(a),r.classList.toggle("unavailable",n),this.$(".card").style.setProperty("--tone",this.tone_());let o=this.$(".chip"),s=e.show_artwork===!1?null:cn(this.hass,e.entity,e.icon),l=s?`pic:${s}`:e.icon||It(t);o.dataset.icon!==l&&(o.dataset.icon=l,o.classList.toggle("pic",!!s),o.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:b(l,"speaker")),o.style.setProperty("--tone",a&&!s?this.tone_():"var(--dac-ink-3)");let d=this.$(".hoesgroot");d&&d.dataset.icon!==l&&(d.dataset.icon=l,d.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:b(e.icon||It(t),"speaker"));let c=M(this.hass,e.entity,e.name),p=Nn(t,g=>J(this.hass,g)),h=this.$(".spelers");if(h){let g=M(this.hass,e.entity);this.text(".spelers .waar",g),h.setAttribute("aria-label",`Speaker kiezen. Nu: ${g}`)}this.text(".nm",c),this.text(".st",p),o.setAttribute("aria-label",`${c} afspelen of pauzeren`),this.$(".hoesgroot")?.setAttribute("aria-label",`${c} afspelen of pauzeren`),r.setAttribute("aria-label",`${c}, ${p}`),this.paintKnoppen_(t,n),this.paintVolume_(t,n),this.paintExtra_(t,n),O(this.$(".card"))}paintKnoppen_(e,t){let n=this.$(".ctl"),a=this.config.show_controls===!1||t?[]:us(e),r=a.join(",");n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=a.map(s=>`<button class="k ${s==="play"||s==="stop"?"hoofd":""}" type="button" data-k="${s}" aria-label="${Ln[s].label}">${b(Ln[s].icon)}</button>`).join(""));let o=n.querySelector('[data-k="play"]');if(o){let s=Rt(e)?"pause":"play";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=b(s))}}paintVolume_(e,t){let n=this.$(".vol"),a=Xe(this.config),r=a===this.config.entity?e:v(this.hass,a),o=this.config.show_volume===!1||t?[]:gi(r),s=t?null:fs(e,{tonen:this.config.show_source!==!1});if(n.hidden=!o.length&&!s,n.hidden){n.dataset.sig="",this.sliders_?.delete("volume");return}let l=ms(r)&&(o.includes("slider")||o.includes("steps")),d=[...o,s?"bron":"",l?"pct":""].join(",");n.dataset.sig!==d&&(n.dataset.sig=d,n.innerHTML=(o.includes("mute")?`<button class="k" type="button" data-k="mute" aria-label="Dempen">${b("volume")}</button>`:"")+(o.includes("slider")?fe("volume"):"")+(o.includes("steps")?`<button class="k" type="button" data-k="vol-" aria-label="Zachter">${b("minus")}</button><button class="k" type="button" data-k="vol+" aria-label="Harder">${b("plus")}</button>`:"")+(l?'<span class="pct tnum"></span>':"")+(s?`<button class="bronknop" type="button" data-k="bron">${b("tv")}<b></b></button>`:""),this.sliders_?.delete("volume"),n.querySelector(".slider")?.setAttribute("aria-label","Volume"));let c=n.querySelector(".bronknop");if(c){let k=s.nu||"Bron";this.text(c.querySelector("b"),k),c.setAttribute("aria-label",`Bron kiezen, nu ${k}`),c.title=`Kies uit ${s.aantal} bronnen`}let p=Vt(r),h=Ve(r),g=n.querySelector('[data-k="mute"]');if(g){let k=p?"volumeMute":"volume";g.dataset.icon!==k&&(g.dataset.icon=k,g.innerHTML=b(k)),g.setAttribute("aria-pressed",String(p))}let f=n.querySelector(".slider");f&&(this.attach_(f,"volume",{value:()=>Ve(v(this.hass,Xe(this.config))),onInput:k=>this.setSlider_(f,k),onCommit:k=>this.hass.callService("media_player","volume_set",{volume_level:k/100},{entity_id:Xe(this.config)}),disabled:()=>ne(v(this.hass,Xe(this.config)))}),f.classList.contains("dragging")||this.setSlider_(f,h)),l&&this.text(".pct",p?"Gedempt":`${h}%`)}paintExtra_(e,t){let n=this.$(".extra"),a=t||this.config.show_controls===!1?[]:ki(e,{zoeken:this.config.show_search!==!1,sleep:this.config.sleep_timer===!0});n.hidden=!a.length;let r=a.join(",");if(n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=a.map((c,p)=>`${c==="search"&&p>0?'<span class="rek"></span>':""}<button class="k" type="button" data-k="${c}" aria-label="${Ln[c].label}">${b(Ln[c].icon)}</button>`).join("")),!a.length)return;let o=n.querySelector('[data-k="shuffle"]');o&&o.setAttribute("aria-pressed",String(bi(e)));let s=n.querySelector('[data-k="repeat"]');if(s){let c=vi(e),p=c==="one"?"repeatOne":"repeat";s.dataset.icon!==p&&(s.dataset.icon=p,s.innerHTML=b(p)),s.setAttribute("aria-pressed",String(c!=="off")),s.setAttribute("aria-label",{off:"Herhalen: uit",all:"Herhalen: alles",one:"Herhalen: dit nummer"}[c])}let l=document.querySelector("domotiapp-media-browser");l?.hasAttribute("open")&&(l.hass=this.hass);let d=document.querySelector("domotiapp-speler-kiezer");d?.hasAttribute("open")&&(d.hass=this.hass)}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let a=De(e,n);this.sliders_.set(t,a),this.teardown_.push(a)}setSlider_(e,t){e&&(e.style.setProperty("--v",`${t}%`),e.setAttribute("aria-valuenow",String(t)),this.text(".pct",`${t}%`))}getCardSize(){if(this.config?.layout==="groot")return 8;let e=v(this.hass,this.config?.entity);return 1+(gi(e).length?1:0)+(ki(e).length?1:0)}getGridOptions(){let e=this.config?.layout==="groot",t=this.minRijen_(".card",e?6:this.getCardSize());return e?{columns:12,rows:"auto",min_columns:6,min_rows:t}:{columns:12,rows:"auto",min_columns:4,min_rows:t}}static getConfigElement(){return document.createElement("domotiapp-media-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("media_player."));return n?{entity:n}:{}}};_(Cn,"css",`
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
    ${Le}
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
  `);var Li=class extends D{defaults(){return{layout:"row",show_artwork:!0,show_volume:!0,show_source:!0,show_controls:!0,show_search:!0,icon_tap_action:{action:"toggle"},tap_action:{action:"more-info"}}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"speaker"}]}schema(){return[{name:"entity",selector:m.entity("media_player")},{name:"name",selector:m.text()},{name:"speaker_select",selector:m.bool()},{name:"players",selector:{entity:{domain:"media_player",multiple:!0}}},{name:"layout",selector:m.select([{value:"row",label:"Rij (\xE9\xE9n rasterrij hoog)"},{value:"groot",label:"Groot (telefoonformaat, grote knoppen)"}])},{name:"volume_entity",selector:m.entity("media_player")},{name:"show_artwork",selector:m.bool()},{name:"show_controls",selector:m.bool()},{name:"show_volume",selector:m.bool()},{name:"show_source",selector:m.bool()},{name:"radio_mode",selector:m.bool()},{name:"speakers",selector:{entity:{domain:"media_player",integration:"music_assistant",multiple:!0}}},{name:"show_search",selector:m.bool()},{name:"sleep_timer",selector:m.bool()},{name:"icon_tap_action",selector:m.action("toggle")},{name:"icon_hold_action",selector:m.action("more-info")},{name:"tap_action",selector:m.action("more-info")},{name:"hold_action",selector:m.action("more-info")}]}label(e){return{entity:"Mediaspeler",name:"Naam (overschrijft die van de speler)",speaker_select:"Algemene mediaspeler",players:"Welke speakers je mag kiezen",layout:"Vorm",volume_entity:"Geluid van (optioneel)",show_artwork:"Albumhoes tonen",show_controls:"Knoppen tonen",show_volume:"Volume tonen",show_source:"Bronknop tonen",radio_mode:"Doorspelen na een nummer",speakers:"Speakers om mee te groeperen",show_search:"Zoeken en groeperen tonen",sleep_timer:"Sleeptimer tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Welke knoppen er verschijnen leest de kaart uit de speler zelf: wat hij niet kan, komt er niet op.";if(e.name==="speaker_select")return"De kaart krijgt er een balk bij waarmee je kiest waar de muziek heen gaat. De speler hierboven is de standaard; de keuze wordt per apparaat onthouden, dus je telefoon en de tablet in de gang kunnen op iets anders staan.";if(e.name==="players")return"Laat je dit leeg, dan staan de speakers van Music Assistant in de lijst -- geen televisies of streamers, want daar stuur je geen muziek naartoe. Vul je er zelf een paar in, dan is dat de lijst, wat er ook in staat.";if(e.name==="layout")return"Groot is bedoeld voor een pop-up of een kolom waar de kaart alle ruimte krijgt: grote hoes, grote knoppen.";if(e.name==="volume_entity")return"Zit het geluid ergens anders dan het beeld \u2014 een tv met een soundbar eronder \u2014 kies dan hier de speler die het volume regelt. Leeg laten betekent: de speler zelf.";if(e.name==="show_artwork")return"Speelt er iets met een hoes, dan vult die de chip. Een eigen icoon gaat voor.";if(e.name==="show_volume")return"De volumeregel verschijnt zodra er iets speelt en verdwijnt als de speler uit gaat.";if(e.name==="sleep_timer")return"Zet er een knop bij waarmee je instelt hoe lang de muziek nog mag doorspelen. De laatste seconden zakt het volume weg, daarna pauzeert de speler en gaat het volume terug naar waar het stond. De timer loopt in Home Assistant zelf, dus hij telt gewoon door als je je telefoon weglegt.";if(e.name==="speakers")return'De speakers die onderin het zoekscherm staan om samen te laten spelen. Laat je dit leeg op een algemene mediaspeler, dan zijn dat dezelfde speakers als in de keuzelijst; op een gewone kaart valt hij terug op het label "Music Assistant Media" in Home Assistant.';if(e.name==="radio_mode")return"Zoals Spotify: is het gekozen nummer klaar, dan zoekt Music Assistant er zelf muziek bij in plaats van te stoppen. Staat dit uit, dan kan het nog steeds per keer via het menu bij een treffer.";if(e.name==="show_source")return"Voor een tv-ontvanger of een versterker met ingangen: een knop met de zender die nu aanstaat, die een zoekbaar overzicht opent. Kan de speler geen bron kiezen, dan verschijnt hij niet.";if(e.name==="show_search")return"De zoekknop opent Music Assistant over het hele scherm. Alleen bij een speler van Music Assistant; groeperen komt erbij als de speler dat aankan."}};H("domotiapp-media-card-editor",Li);N("domotiapp-media-card",Cn,{name:"DomotiApp Mediaspeler",description:"Wat er speelt, de knoppen die de speler aankan, en het volume."});var Pt=[{sleutel:"smoke",label:"Rook",icoon:"smoke",alarm:"Rook gedetecteerd",rust:"Geen"},{sleutel:"co",label:"Koolmonoxide",icoon:"co",alarm:"Koolmonoxide gedetecteerd",rust:"Geen"},{sleutel:"heat",label:"Warmte",icoon:"thermo",alarm:"Te warm",rust:"Normaal"},{sleutel:"temperature",label:"Temperatuur",icoon:"thermo",meting:!0},{sleutel:"battery",label:"Batterij",icoon:"battery",meting:!0}],Vs=i=>i?.rust??"Rustig",Ci=20;function Hi(i){if(!i||i.state==="unavailable"||i.state==="unknown")return null;if(String(i.entity_id??"").startsWith("binary_sensor."))return i.state==="on"?0:null;let e=Number(i.state);return Number.isFinite(e)?e:null}var oh=i=>!!i&&i.state==="on",sh=i=>!i||i.state==="unavailable"||i.state==="unknown";function Is(i,e){let t=i.filter(a=>!a.meting);for(let a of t)if(oh(e(a.sleutel)))return{soort:"alarm",tekst:a.alarm,tone:"bad",icoon:a.icoon};if(i.length&&i.every(a=>sh(e(a.sleutel))))return{soort:"weg",tekst:"Niet bereikbaar",tone:"neutral",icoon:"smokeDetector"};let n=Hi(e("battery"));return n!=null&&n<=Ci?{soort:"batterij",tekst:`Batterij bijna leeg (${Math.round(n)}%)`,tone:"warn",icoon:"battery"}:t.length?{soort:"goed",tekst:"Alles rustig",tone:"good",icoon:"smokeDetector"}:{soort:"meting",tekst:"",tone:"accent",icoon:"smokeDetector"}}var lh={good:E.good,warn:E.warn,bad:E.bad,neutral:E.neutral,accent:E.accent},Hn=class extends S{validate(e){return Pt.filter(n=>e[n.sleutel]).length?{...e}:{...e,[C]:"Kies minstens \xE9\xE9n entiteit: rook, koolmonoxide, warmte, temperatuur of batterij."}}watched(){return Pt.map(e=>this.config[e.sleutel]).filter(Boolean)}gekozen_(){return Pt.filter(e=>this.config[e.sleutel])}toestand_(){let e=Is(this.gekozen_(),t=>v(this.hass,this.config[t]));return{...e,tone:lh[e.tone]??E.accent}}batterijPct_(){return Hi(v(this.hass,this.config.battery))}template(){this.config.bare&&this.setAttribute("bare","");let e=this.gekozen_().map(t=>`<span class="pil" data-soort="${t.sleutel}" title="${t.label}">${b(t.icoon)}<b></b></span>`).join("");return`
      <div class="card surface">
        <div class="top" role="button" tabindex="0" style="--tone:${E.good}">
          <span class="chip"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
        </div>
        <div class="meta">${e}</div>
      </div>`}wire(){let e=this.config,t=this.gekozen_()[0];this.teardown_.push(W(this.$(".top"),{onTap:()=>e.tap_action?je(this,this.hass,e,e.tap_action):P(this,e.smoke??e[t.sleutel]),onHold:()=>je(this,this.hass,e,e.hold_action??{action:"more-info"})})),this.$$(".pil").forEach(a=>{let r=e[a.dataset.soort];r&&(this.on(a,"click",o=>{o.stopPropagation(),P(this,r)}),this.on(a,"pointerdown",o=>o.stopPropagation()),a.style.cursor="pointer")});let n=this.$(".card");if(n&&typeof ResizeObserver=="function"){let a=new ResizeObserver(()=>this.pasAan_());a.observe(n),this.teardown_.push(()=>a.disconnect())}this.teardown_.push(R(this.$(".card")))}paint(){let e=this.config,t=this.toestand_(),n=this.$(".top");this.toggleAttribute("alarm",t.soort==="alarm"),n.style.setProperty("--tone",t.tone),n.classList.toggle("unavailable",t.soort==="weg");let a=this.$(".chip"),r=e.icon||t.icoon;a.dataset.icon!==r&&(a.dataset.icon=r,a.innerHTML=b(r,"smoke")),a.style.setProperty("--tone",t.tone);let o=this.gekozen_()[0];this.text(".nm",e.name||M(this.hass,e.smoke??e[o.sleutel],null)),this.text(".st",t.tekst),n.setAttribute("aria-label",`${this.$(".nm").textContent}${t.tekst?`, ${t.tekst}`:""}`),this.$$(".pil").forEach(s=>this.paintPil_(s)),this.$(".meta").hidden=this.gekozen_().length<=1&&!this.config.always_meta,this.pasAan_(),O(this.$(".card"))}pasAan_(){let e=this.$(".meta");if(!e||e.hidden)return;let t=()=>{let a=e.querySelector(".pil")?.offsetHeight??0;return a&&Math.round((e.scrollHeight+a/2)/a-.5)||1};this.removeAttribute("krapper"),!(t()<=1)&&this.setAttribute("krapper","")}paintPil_(e){let t=Pt.find(s=>s.sleutel===e.dataset.soort),n=v(this.hass,this.config[t.sleutel]),a=e.querySelector("b"),r=s=>e.setAttribute("aria-label",`${t.label}: ${s}`);if(!n||ne(n)){a.textContent="\u2014",r("onbekend"),e.dataset.let="";return}if(t.meting){let s=n.attributes.unit_of_measurement??"",l=Number(n.state);a.textContent=Number.isFinite(l)?`${B(this.hass,l,t.sleutel==="temperature"?1:0)} ${s}`.trim():J(this.hass,n);let d=t.sleutel==="battery"?this.batterijPct_():null;e.dataset.let=d!=null&&d<=Ci?"warn":"",r(a.textContent);return}let o=X(n);a.textContent=o?"Alarm":Vs(t),r(a.textContent),e.dataset.let=o?"bad":""}regels_(){return this.gekozen_().length>1?2:1}getCardSize(){return this.regels_()}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",this.regels_())}}static getConfigElement(){return document.createElement("domotiapp-smoke-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("binary_sensor.")&&/rook|smoke/i.test(a));return n?{smoke:n}:{}}};_(Hn,"css",`
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
  `);var Ri=class extends D{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"smoke"}]}schema(){return[{name:"name",selector:m.text()},{name:"smoke",selector:m.entity()},{name:"co",selector:m.entity()},{name:"heat",selector:m.entity()},{name:"temperature",selector:m.entity()},{name:"battery",selector:m.entity()},{name:"tap_action",selector:m.action("more-info")},{name:"hold_action",selector:m.action("more-info")}]}label(e){return{name:"Naam (overschrijft die van de melder)",smoke:"Rook",co:"Koolmonoxide",heat:"Warmte",temperature:"Temperatuur",battery:"Batterij",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="smoke")return"Alle vijf zijn optioneel: vul in wat je melder heeft. Wat je leeg laat, komt niet op de kaart.";if(e.name==="battery")return"Een percentage of een 'batterij bijna leeg'-sensor. Onder de 20% meldt de kaart het uit zichzelf."}};H("domotiapp-smoke-card-editor",Ri);N("domotiapp-smoke-card",Hn,{name:"DomotiApp Rookmelder",description:"Rook, koolmonoxide, warmte, temperatuur en batterij \u2014 alles optioneel."});var dh=["zo","ma","di","wo","do","vr","za"],Ps=5,Bs=8,Rn=class extends S{validate(e){if(!e.entity)return{...e,[C]:"Kies een weerentiteit."};let t=Math.min(Math.max(1,Number(e.days)||Ps),Bs);return{show_current:!0,forecast_type:"daily",...e,days:t}}watched(){return[this.config.entity]}template(){this.config.bare&&this.setAttribute("bare","");let e=this.config;return`
      <div class="card surface">
        <div class="nu" role="button" tabindex="0" ${e.show_current===!1?"hidden":""}>
          <span class="chip" style="--tone:${E.accent}"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="graden tnum"></span>
        </div>
        <div class="rij" style="--n:${e.days}"></div>
      </div>`}wire(){this.teardown_.push(R(this.$(".card"))),this.teardown_.push(W(this.$(".nu"),{onTap:()=>P(this,this.config.entity),onHold:()=>P(this,this.config.entity)})),this.abonneer_()}async abonneer_(){let e=this.config;this.opzeggen_?.(),this.opzeggen_=null;let t=this.hass?.connection;if(!t?.subscribeMessage){this.forecastFout_="Geen verbinding voor de voorspelling.",this.paintRij_();return}try{let n=await t.subscribeMessage(a=>{this.forecast_=a?.forecast??[],this.forecastFout_=null,this.paintRij_()},{type:"weather/subscribe_forecast",forecast_type:e.forecast_type==="hourly"?"hourly":"daily",entity_id:e.entity});if(!this.isConnected){n();return}this.opzeggen_=n,this.teardown_.push(()=>{try{n()}catch{}this.opzeggen_=null})}catch{this.forecastFout_=e.forecast_type==="hourly"?"Deze weerbron geeft geen uurvoorspelling.":"Deze weerbron geeft geen dagvoorspelling.",this.paintRij_()}}paint(){let e=this.config,t=v(this.hass,e.entity),n=ne(t);this.$(".nu").classList.toggle("unavailable",n);let r=this.$(".chip"),o=e.icon||Te(t?.state);r.dataset.icon!==o&&(r.dataset.icon=o,r.innerHTML=b(o,"cloud")),this.text(".nm",M(this.hass,e.entity,e.name)),this.text(".st",n?"Niet bereikbaar":J(this.hass,t));let s=this.$(".graden"),l=t?.attributes?.temperature,d=t?.attributes?.temperature_unit??"\xB0C";s.innerHTML=l==null?"":`${B(this.hass,l,Number.isInteger(l)?0:1)}<small>${d}</small>`,this.paintRij_(),O(this.$(".card"))}paintRij_(){let e=this.$(".rij");if(!e)return;let t=this.config;if(this.forecastFout_&&!this.forecast_?.length){e.style.setProperty("--n",1),e.innerHTML=`<div class="leeg">${this.forecastFout_}</div>`;return}let n=(this.forecast_??[]).slice(0,t.days);if(!n.length){e.style.setProperty("--n",1),e.innerHTML='<div class="leeg">Nog geen voorspelling ontvangen\u2026</div>';return}e.style.setProperty("--n",n.length);let a=v(this.hass,t.entity)?.attributes?.temperature_unit??"";e.innerHTML=n.map((r,o)=>{let s=this.wanneer_(r.datetime,o),l=b(Te(r.condition),"cloud"),d=r.temperature==null?"":`${B(this.hass,r.temperature,0)}\xB0`,c=r.templow==null?"":`${B(this.hass,r.templow,0)}\xB0`,p=r.precipitation_probability==null?"":`<span class="nat">${b("drop")}${Math.round(r.precipitation_probability)}%</span>`;return`
          <div class="dag" style="--tone:${E.accent}">
            <span class="wanneer">${s}</span>
            ${l}
            <span class="max tnum">${d}</span>
            ${c?`<span class="min tnum">${c}</span>`:""}
            ${p}
          </div>`}).join("")}wanneer_(e,t){let n=new Date(e);if(Number.isNaN(+n))return"";if(this.config.forecast_type==="hourly")return`${String(n.getHours()).padStart(2,"0")}:00`;let a=new Date,r=n.getDate()===a.getDate()&&n.getMonth()===a.getMonth()&&n.getFullYear()===a.getFullYear();return t===0&&r?"vandaag":dh[n.getDay()]}regels_(){return this.config?.show_current===!1?1:2}getCardSize(){return this.regels_()+1}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-forecast-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("weather."));return n?{entity:n}:{}}};_(Rn,"css",`
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
  `);var Vi=class extends D{defaults(){return{show_current:!0,forecast_type:"daily",days:Ps}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"cloudSun"}]}schema(){return[{name:"entity",selector:m.entity("weather")},{name:"name",selector:m.text()},{name:"forecast_type",selector:m.select([{value:"daily",label:"Per dag"},{value:"hourly",label:"Per uur"}])},{name:"days",selector:m.number(1,Bs)},{name:"show_current",selector:m.bool()}]}label(e){return{entity:"Weerentiteit",name:"Naam (overschrijft die van de weerbron)",forecast_type:"Voorspelling",days:"Hoeveel punten",show_current:"Nu-regel tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Meer hoeft er niet ingevuld te worden: de kaart leest zelf uit wat je weerbron levert.";if(e.name==="forecast_type")return"Niet elke weerbron kan allebei. Kan hij het niet, dan zegt de kaart dat in plaats van leeg te blijven."}};H("domotiapp-forecast-card-editor",Vi);N("domotiapp-forecast-card",Rn,{name:"DomotiApp Weersvoorspelling",description:"Vandaag groot, de dagen erna op een rij. E\xE9n entiteit invullen."});var gt={OPEN:1,CLOSE:2,SET_POSITION:4,STOP:8},Ks={open_cover:gt.OPEN,close_cover:gt.CLOSE,stop_cover:gt.STOP},Gs=(i={},e={},t)=>i[t]??e[t],Ii=(i,e)=>!!Gs(i,e,"poort"),Pi=(i,e)=>!!Gs(i,e,"invert");function Ws(i={},e=!1){if(e||i.device_class==="gate")return{open:"gateOpen",closed:"gate"};switch(i.device_class){case"garage":return{open:"garageOpen",closed:"garageClosed"};case"awning":case"blind":return{open:"awning",closed:"awning"};default:return{open:"shutterOpen",closed:"shutter"}}}var Us=i=>i?{open:"Openen",close:"Sluiten"}:{open:"Open",close:"Dicht"},ch={open:"closed",closed:"open",opening:"closing",closing:"opening"},Fs=(i,e)=>e?ch[i]??i:i,Vn=(i,e)=>e&&i!=null?100-i:i;function Bi(i,e){if(i==="stop")return"stop_cover";let t=i==="open";return(e?!t:t)?"open_cover":"close_cover"}function qs({state:i,positie:e,aanname:t}){return e!=null?e>0?"open":"closed":i==="open"||i==="closed"?i:t??"closed"}function Zs({dood:i,state:e,positie:t,toon:n=!0}){return i?"Niet bereikbaar":n?e==="opening"?"Gaat open":e==="closing"?"Gaat dicht":t!=null?`${t}% open`:e==="open"?"Open":e==="closed"?"Dicht":"":""}var Ki=(i,e)=>!!((i?.attributes?.supported_features??0)&e),In=class extends S{validate(e){let t=e.covers??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,covers:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[C]:"Kies minstens \xE9\xE9n rolluik of zonnescherm."}}watched(){return this.config.covers.map(e=>e.entity)}keysHtml(e,t){let n=Us(t),a=(r,o,s)=>`<button type="button" class="${t?"tekst":""}" data-act="${r}" aria-label="${o}">${s}</button>`;return`
      <div class="keys${t?" woorden":""}">
        ${a("open",n.open,t?n.open:A.arrowUp)}
        ${e?`<button type="button" data-act="stop" aria-label="Stop">${A.stop}</button>`:""}
        ${a("close",n.close,t?n.close:A.arrowDown)}
      </div>`}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`<div class="card surface">${e.covers.map((n,a)=>`
      <div class="cv" data-i="${a}" data-shown="closed" style="--tone:${Z(n.tone??e.tone,"solar")}">
        <button class="chip" type="button" aria-label="Meer info"></button>
        <div class="txt"><div class="nm"></div><div class="st"></div></div>
        ${this.keysHtml(e.show_stop!==!1,Ii(n,e))}
        <div class="pos" hidden></div>
      </div>`).join("")}</div>`}wire(){this.dragging_=new Set,this.bound_=new Set,this.assumed_=new Map,this.$$(".cv").forEach(e=>{let t=e.dataset.i;e.querySelectorAll(".keys button").forEach(a=>{this.on(a,"click",()=>{let r=a.dataset.act,o=this.config.covers[+t];this.hass.callService("cover",Bi(r,Pi(o,this.config)),{entity_id:o.entity}),r!=="stop"&&(this.assumed_.set(t,r==="open"?"open":"closed"),this.paint())})});let n=this.config.covers[+t].entity;this.teardown_.push(W(e.querySelector(".chip"),{onTap:()=>P(this,n)}))})}paint(){this.$$(".cv").forEach(e=>{let t=e.dataset.i,n=this.config.covers[+t],a=v(this.hass,n.entity),r=q(this.hass,n.entity),o=!a||a.state==="unavailable",s=Pi(n,this.config),l=Ii(n,this.config),d=Fs(a?.state??"unknown",s);e.classList.toggle("unavailable",o),e.querySelector(".nm").textContent=M(this.hass,n.entity,n.name);let c=Ki(a,gt.SET_POSITION)&&r.current_position!=null,p=c?Vn(r.current_position,s):null,h=qs({state:d,positie:p,aanname:this.assumed_.get(t)});e.dataset.shown=h;let g=Ws(r,l),f=(h==="open"?n.icon_open:n.icon_closed)??(h==="open"?this.config.icon_open:this.config.icon_closed)??n.icon??g[h],k=e.querySelector(".chip");k.dataset.icon!==f&&(k.dataset.icon=f,k.innerHTML=b(f,g[h]));let x=e.querySelector(".st");this.dragging_.has(t)||(x.textContent=Zs({dood:o,state:d,positie:p,toon:this.toonStatus_()})),e.querySelectorAll(".keys button").forEach(V=>{let I=Bi(V.dataset.act,s);V.disabled=o||!Ki(a,Ks[I])});let $=e.querySelector(".pos"),w=c&&this.config.show_position!==!1;if($.hidden=!w,w){if($.dataset.built||($.dataset.built="1",$.innerHTML=fe("position"),$.querySelector(".slider").setAttribute("aria-label","Positie")),!this.bound_.has(t)){this.bound_.add(t);let I=$.querySelector(".slider"),me=pe=>{I.style.setProperty("--v",`${pe}%`),I.setAttribute("aria-valuenow",String(pe)),this.toonStatus_()&&(e.querySelector(".st").textContent=`${pe}% open`)};this.teardown_.push(De(I,{value:()=>Vn(q(this.hass,n.entity).current_position??0,s),onInput:me,onCommit:pe=>this.hass.callService("cover","set_cover_position",{entity_id:n.entity,position:Vn(pe,s)})}))}let V=$.querySelector(".slider");if(!V.classList.contains("dragging")){let I=p??0;V.style.setProperty("--v",`${I}%`),V.setAttribute("aria-valuenow",String(I))}}})}toonStatus_(){return this.config.show_state!==!1}rows_(){let e=this.config?.covers??[],t=e.some(n=>Ki(v(this.hass,n.entity),gt.SET_POSITION));return ze(12+Math.max(1,e.length)*42+(t?30:0))}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-cover-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("cover."));return{covers:n?[n]:[]}}};_(In,"css",`
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

    /* Een poort schuift opzij; omhoog en omlaag zeggen daar niets over. Dan
       maar woorden, en die hebben een andere breedte dan een pijl. */
    .keys.woorden button.tekst {
      width: auto; min-width: 58px; padding: 0 11px;
      font-family: inherit; font-size: 12.5px; font-weight: 500; line-height: 1;
      white-space: nowrap;
    }

    /* ---- positie, alleen bij motoren die terugmelden ---- */
    .pos { grid-column: 1 / -1; margin: 2px 0 4px; display: flex; }
    .pos[hidden] { display: none; }
    ${Le}

    .cv.unavailable { opacity: .42; pointer-events: none; }

    @media (max-width: 380px) {
      .keys button { width: 34px; }
      .keys.woorden button.tekst { min-width: 0; padding: 0 8px; font-size: 12px; }
    }
  `);var Gi=class extends D{defaults(){return{show_stop:!0,show_position:!0,show_state:!0}}pickers(){return[{key:"icon_open",kind:"icon",label:"Icoon als het open staat",fallback:"shutterOpen"},{key:"icon_closed",kind:"icon",label:"Icoon als het dicht is",fallback:"shutter"}]}setConfig(e){let t={...e},n=(e.covers??e.entities??(e.entity?[e.entity]:[])).map(a=>typeof a=="string"?{entity:a}:a);t.covers=n.map(a=>a.entity);for(let a of n)a.name&&(t[`naam:${a.entity}`]=a.name),a.poort&&(t[`poort:${a.entity}`]=!0),a.invert&&(t[`invert:${a.entity}`]=!0);super.setConfig(t)}serialize(e){let t={...e},n=t.covers??[];t.covers=n.map(a=>{let r={};return t[`naam:${a}`]&&(r.name=t[`naam:${a}`]),t[`poort:${a}`]&&(r.poort=!0),t[`invert:${a}`]&&(r.invert=!0),Object.keys(r).length?{entity:a,...r}:a});for(let a of Object.keys(t))/^(naam|poort|invert):/.test(a)&&delete t[a];return t}schema(){let e=(this.config_?.covers??[]).filter(t=>typeof t=="string");return[{name:"covers",selector:{entity:{domain:"cover",multiple:!0}}},...e.flatMap(t=>[{name:`naam:${t}`,selector:m.text()},{name:`poort:${t}`,selector:m.bool()},{name:`invert:${t}`,selector:m.bool()}]),{name:"show_stop",selector:m.bool()},{name:"show_state",selector:m.bool()}]}naamVan_(e){return this.config_?.[`naam:${e}`]||this.hass?.states?.[e]?.attributes?.friendly_name||e}label(e){return e.name.startsWith("naam:")?`Naam voor ${this.naamVan_(e.name.slice(5))}`:e.name.startsWith("poort:")?`${this.naamVan_(e.name.slice(6))} is een poort`:e.name.startsWith("invert:")?`${this.naamVan_(e.name.slice(7))} omgekeerd aangesloten`:{covers:"Rolluiken",show_stop:"Stopknop tonen",show_state:"Status tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="covers")return"Melden ze hun stand terug, dan komt er vanzelf een schuif bij. Zo niet, dan blijven het open, stop en dicht, en volgt het icoon de knop die je indrukt. Per rolluik kun je hieronder een eigen naam zetten.";if(e.name.startsWith("poort:"))return"Zet pijltjes om in Openen en Sluiten, en geeft een poorticoon. Een poort schuift opzij, dus omhoog en omlaag zeggen er niets over.";if(e.name.startsWith("invert:"))return"Voor een motor die andersom is aangesloten: open wordt dicht en dicht wordt open. De knoppen, de status en de schuif draaien samen om.";if(e.name==="show_state")return"Haalt de regel Open, Dicht of het percentage onder de naam weg. Niet bereikbaar blijft altijd staan."}};H("domotiapp-cover-card-editor",Gi);N("domotiapp-cover-card",In,{name:"DomotiApp Rolluiken",description:"Open, stop en dicht, met een eigen icoon voor open en dicht."});function ph(i){if(!i)return{label:"Onbekend",home:null};switch(i.state){case"home":return{label:"Thuis",home:!0};case"not_home":return{label:"Afwezig",home:!1};case"unknown":case"unavailable":return{label:"Onbekend",home:null};default:return{label:i.state,home:!1}}}var Pn=class extends S{validate(e){let t=e.persons??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,persons:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[C]:"Kies minstens \xE9\xE9n persoon."}}watched(){return this.config.persons.map(e=>e.entity)}template(){let e=this.config;e.bare&&this.setAttribute("bare","");let t=e.columns??Math.min(e.persons.length,6),n=e.persons.map((a,r)=>`
      <button class="p" type="button" data-i="${r}" style="--tone:var(--dac-ink-3)">
        <span class="av"><span class="ph"></span></span>
        <span class="nm"></span>
      </button>`).join("");return`<div class="card surface"><div class="chips" style="--cols:${t}">${n}</div></div>`}wire(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i];this.teardown_.push(W(e,{onTap:()=>P(this,t.entity)}))})}paint(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i],n=v(this.hass,t.entity),a=ph(n);e.style.setProperty("--tone",a.home===!0?"var(--dac-good)":a.home===!1?"var(--dac-bad)":"var(--dac-warn)");let r=M(this.hass,t.entity,t.name);this.text(e.querySelector(".nm"),r);let o=e.querySelector(".ph"),s=n?.attributes?.entity_picture,l=s?`img:${s}`:r?`ini:${r[0]}`:"icon";o.dataset.kind!==l&&(o.dataset.kind=l,o.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:r?r[0].toUpperCase():A.person),e.setAttribute("aria-label",`${r}, ${a.label}`)})}rows_(){let e=this.config?.columns??Math.min(this.config?.persons?.length??1,6),t=Math.ceil((this.config?.persons?.length??1)/e);return ze(10+t*45+(t-1)*6)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:"full",rows:e,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-person-card-editor")}static getStubConfig(e){return{persons:Object.keys(e?.states??{}).filter(n=>n.startsWith("person.")).slice(0,6)}}};_(Pn,"css",`
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
  `);var Wi=class extends D{setConfig(e){let t={...e},n=(e.persons??[]).map(a=>typeof a=="string"?{entity:a}:a);t.persons=n.map(a=>a.entity);for(let a of n)a.name&&(t[`naam:${a.entity}`]=a.name);super.setConfig(t)}serialize(e){let t={...e},n=t.persons??[];t.persons=n.map(a=>{let r=t[`naam:${a}`];return r?{entity:a,name:r}:a});for(let a of Object.keys(t))a.startsWith("naam:")&&delete t[a];return t}schema(){let e=(this.config_?.persons??[]).filter(t=>typeof t=="string");return[{name:"persons",selector:{entity:{domain:["person","device_tracker"],multiple:!0}}},...e.map(t=>({name:`naam:${t}`,selector:m.text()}))]}label(e){if(e.name==="persons")return"Personen";if(e.name.startsWith("naam:")){let t=e.name.slice(5);return`Naam voor ${this.hass?.states?.[t]?.attributes?.friendly_name??t}`}return super.label(e)}helper(e){if(e.name==="persons")return"Thuis is groen, weg is rood, geen melding is oranje. Per persoon kun je hieronder een eigen naam zetten."}};H("domotiapp-person-card-editor",Wi);N("domotiapp-person-card",Pn,{name:"DomotiApp Personen",description:"Wie er thuis is, compact. Het hele huishouden in \xE9\xE9n kaart."});var Ui=i=>String(i??"").trim().split(/\s+/).filter(Boolean);function hh(i){let e=Ui(i);return e.filter((n,a)=>a===0||n.toLowerCase()!==e[a-1].toLowerCase()).join(" ")}function uh(i){let e=i.map(Ui).filter(a=>a.length);if(e.length<2)return 0;let t=0,n=Math.min(...e.map(a=>a.length));for(;t<n;){let a=e[0][t].toLowerCase();if(!e.every(r=>r[t].toLowerCase()===a))break;t++}return Math.min(t,n-1)}function Fi(i){let e=i.map(n=>hh(n)),t=uh(e);return e.map(n=>{let a=Ui(n),r=a.slice(t);return(r.length?r:a).join(" ")})}var mh=[[/gft|groente|tuin|organi/i,"teal","binWheeled"],[/pmd|plastic|verpakking/i,"solar","binWheeled"],[/papier|karton/i,"water","binWheeled"],[/rest|grijs/i,"neutral","binWheeled"],[/textiel|kleding/i,"pink","bin"],[/glas/i,"magenta","bin"],[/kerstboom|snoei|takken/i,"teal","bin"]];function gh(i){for(let[e,t,n]of mh)if(e.test(i))return{tone:t,icon:n};return{tone:"accent",icon:"bin"}}var Xs={"geen datum":"geen datum",voorbij:"is geweest","bestaat niet":"sensor ontbreekt"},Ys=i=>String(i??"").replace(/^(afvalbeheer|afvalwijzer|mijnafvalwijzer)\s*/i,"").replace(/\s*(mijnafvalwijzer)\s*/i," ").trim(),Bn=class extends S{validate(e){let t=e.sensors??e.entities??(e.entity?[e.entity]:[]);return t.length?{show_hero:!0,show_list:!0,...e,sensors:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[C]:"Kies minstens \xE9\xE9n afvalsensor waarvan de status een datum is."}}watched(){return this.config.sensors.map(e=>e.entity)}wire(){this.breed_()&&this.teardown_.push(R(this.$(".card")))}read_(){let e=new Date,t=this.config.sensors.map(r=>{let o=v(this.hass,r.entity),s=o?st(o.state)??st(o.attributes.date)??st(o.attributes.next_date)??st(o.attributes.Year_month_day_date):null;return{cfg:r,st:o,date:s}}),n=t.map(r=>Ys(M(this.hass,r.cfg.entity,r.cfg.name))),a=Fi(n);return t.map((r,o)=>{let s=r.cfg.label??a[o]??n[o],l=gh(r.cfg.label??r.cfg.entity+s),d=this.config.tones?.[r.cfg.entity];return{label:s,entity:r.cfg.entity,date:r.date,days:r.date?pn(e,r.date):null,tone:Z(d??r.cfg.tone??l.tone),icon:r.cfg.icon??l.icon,reden:r.st?r.date?pn(e,r.date)<0?"voorbij":null:"geen datum":"bestaat niet"}}).sort((r,o)=>!r.reden&&!o.reden?r.date-o.date:r.reden?o.reden?r.label.localeCompare(o.label):1:-1)}komend_(e){return e.filter(t=>!t.reden)}breed_(){return this.config.layout==="breed"}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),this.setAttribute("vorm",this.breed_()?"breed":"lijst"),this.breed_()?`
      <div class="card surface">
        <div class="rij">
          ${e.title?`<div class="head"><b>${j(e.title)}</b></div>`:""}
          <div class="breed"></div>
        </div>
        <div class="empty" hidden>Geen ophaaldata gevonden. Controleer of de gekozen sensoren een datum als toestand hebben.</div>
      </div>`:`
      <div class="card surface">
        ${e.title?`<div class="head"><b>${j(e.title)}</b></div>`:""}
        ${e.show_hero===!1?"":`<div class="hero" hidden>
          <span class="bin"></span>
          <span class="what">
            <span class="eyebrow"></span>
            <span class="big"></span>
          </span>
          <span class="when"><span class="n tnum"></span><span class="eyebrow u"></span></span>
        </div>`}
        ${e.show_list===!1?"":'<div class="list"></div>'}
        <div class="breed"></div>
        <div class="empty" hidden>Geen ophaaldata gevonden. Controleer of de gekozen sensoren een datum als toestand hebben.</div>
      </div>`}paint(){let e=this.read_(),t=this.komend_(e),n=this.$(".hero"),a=this.$(".list"),r=this.$(".empty");if(r.hidden=e.length>0,this.breed_()){this.paintBreed_(e,t[0]),O(this.$(".card"));return}if(n&&(n.hidden=t.length===0,t.length)){let o=t[0];n.style.setProperty("--tone",o.tone),this.setAttribute("urgency",o.days===0?"today":o.days===1?"tomorrow":"later");let s=n.querySelector(".bin");s.dataset.icon!==o.icon&&(s.dataset.icon=o.icon,s.innerHTML=b(o.icon,"bin")),this.text(n.querySelector(".eyebrow"),hn(o.date)),this.text(n.querySelector(".big"),o.label),this.text(n.querySelector(".n"),o.days===0?"nu":String(o.days)),this.text(n.querySelector(".u"),o.days===0?"aan de weg":o.days===1?"dag":"dagen")}if(a){let o=t[0],s=this.config.show_hero===!1?e:e.filter(d=>d!==o),l=s.map(d=>`${d.label}${+d.date}${d.reden??""}`).join("|");if(a.dataset.sig===l)return;a.dataset.sig=l,a.innerHTML=s.map(d=>{if(d.reden)return`
        <div class="r" data-stil="true" style="--tone:${d.tone}">
          <i></i><span>${j(d.label)}</span>
          <span class="d">${Xs[d.reden]??d.reden}</span>
        </div>`;let c=hn(d.date),p=d.days<=6?`<small>${No(d.date)}</small>`:"";return`
        <div class="r" style="--tone:${d.tone}">
          <i></i><span>${j(d.label)}</span>
          <span class="d">${c}${p}</span>
        </div>`}).join("")}}paintBreed_(e,t){let n=this.$(".breed");if(!n)return;let a=e.map(r=>`${r.label}|${+r.date}|${r.reden??""}`).join(",");n.dataset.sig!==a&&(n.dataset.sig=a,n.innerHTML=e.map(r=>{let o=r.reden?Xs[r.reden]??r.reden:r.days===0?"vandaag":r.days===1?"morgen":hn(r.date);return`
          <div class="b" style="--tone:${r.tone}" data-eerst="${r===t}"
               data-stil="${!!r.reden}" title="${j(r.label)}">
            <i></i>
            <span class="t">
              <span class="n">${j(r.label)}</span>
              <span class="w">${j(o)}</span>
            </span>
          </div>`}).join(""))}rows_(){let e=this.config?.sensors?.length??1;return this.breed_()?this.minRijen_(".card",Math.max(1,Math.ceil(e/4))):this.config?.show_list===!1?1:this.config?.show_hero===!1?Math.max(1,ze(20+e*33)):Math.max(2,e)}getCardSize(){return this.rows_()}getGridOptions(){if(this.breed_())return{columns:12,rows:"auto",min_columns:6,min_rows:this.rows_()};let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-waste-card-editor")}static getStubConfig(e){return{sensors:Object.keys(e?.states??{}).filter(n=>/afval|waste|trash|garbage|ophaal/i.test(n)&&n.startsWith("sensor.")).filter(n=>st(e.states[n]?.state)).slice(0,6),title:"Afvalkalender"}}};_(Bn,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; padding: 10px 12px;
      display: flex; flex-direction: column; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* Een bak zonder ophaaldatum: hij staat er w\xE9l, maar rustig. Verdwijnen
       zou erger zijn -- dan vul je vier bakken in, zie je er twee, en staat er
       nergens waarom. */
    .r[data-stil="true"] { opacity: .55; }
    .r[data-stil="true"] .d { font-style: italic; }

    /* ---- de brede vorm ----
       Gevraagd op 27 augustus 2026: "ook wil ik de afvalkaart over de breedte
       kunnen maken en een stuk minder hoog, om veel meer ruimte te besparen."

       Alle bakken naast elkaar in plaats van onder elkaar. Vier bakken passen
       dan op EEN rasterrij in plaats van vier -- dat scheelt 192 pixels op een
       dashboard waar hij hem naast andere kaarten zet.

       De eerstvolgende bak licht op; de rest staat er rustig bij. Zonder dat
       verschil zijn het vier gelijke vakjes en moet je de datums lezen om te
       zien welke er woensdag uit moet. */
    :host([vorm="breed"]) .hero,
    :host([vorm="breed"]) .list { display: none; }

    /* De titel NAAST de bakken, niet erboven.
       Gemeten op 27 augustus 2026: met de titel erboven wilde de inhoud 71px in
       een kaart van 56 -- hij liep er 16 pixels uit. Dat is precies valkuil 12,
       en de kaart schildert dan over zijn buurman.

       Naast elkaar past het w\xE9l, en het is bovendien wat hij vroeg: zo min
       mogelijk hoogte.

       EN OP EEN TELEFOON WORDT HET TWEE RIJEN, gemeld op 7 september 2026 met
       een schermafdruk van een klant. Naast de titel is daar zo'n 220px over,
       en vier bakken van minstens 86px breken dan af naar twee-bij-twee. Dat
       is prima -- alleen stond de kaart vast op \xC9\xC9N rasterrij (56px), en twee
       rijen bakken zijn 66px: de tekst zat tegen de rand en tegen elkaar. De
       hoogte wordt daarom sinds die dag GEMETEN, net als bij de weerkaart:
       past het op \xE9\xE9n rij dan is het \xE9\xE9n rij, breekt het af dan worden het er
       twee. Vandaar .rij als tussenlaag: .card blijft een kolom, zodat
       inhoudsHoogte de kinderen kan optellen (dat telt kinderen ONDER elkaar
       en niet naast elkaar). */
    :host([vorm="breed"]) { height: auto; }
    :host([vorm="breed"]) .card {
      height: auto; min-height: var(--dac-raster, 56px);
      justify-content: center; gap: 0; padding: 8px 12px;
    }
    :host([vorm="breed"]) .rij { display: flex; align-items: center; gap: 12px; }
    :host([vorm="breed"]) .head { flex: 0 0 auto; }
    :host([vorm="breed"]) .head b { font-size: 12.5px; }

    .breed { display: none; }
    :host([vorm="breed"]) .breed {
      display: grid; gap: 6px; flex: 1 1 auto; min-width: 0;
      grid-template-columns: repeat(auto-fit, minmax(86px, 1fr));
      align-content: center;
    }
    /* GEEN vlak en GEEN rand per bak.
       Die stonden er eerst -- elk bakje een gekleurde achtergrond in zijn eigen
       fractiekleur -- en met vier bakken naast elkaar werd dat een lappendeken.
       Zijn oordeel op 27 augustus 2026 was kort: "ziet er niet uit."

       Het botste ook met de vormregel van deze familie: alleen het ICOON draagt
       de toestand, niet het hele vlak (zie CLAUDE.md). Op een kaart met acht
       lampen is dat het verschil tussen een rij en een muur; hier tussen een
       kalender en een kleurenkaart.

       Dus: de stip draagt de kleur, de tekst is neutraal, en de eerstvolgende
       valt op doordat hij als enige in VOLLE inkt staat. */
    .breed .b {
      display: flex; align-items: center; gap: 8px; min-width: 0;
      padding: 2px 0;
    }
    .breed .b[data-stil="true"] { opacity: .45; }
    .breed .b i {
      width: 10px; height: 10px; flex: 0 0 auto; border-radius: 3px;
      background: var(--tone);
    }
    /* De eerstvolgende krijgt een ring om zijn stip: hetzelfde teken dat de
       lampkaart gebruikt, en het kost geen vlak. */
    .breed .b[data-eerst="true"] i {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--tone) 28%, transparent);
    }
    .breed .t { min-width: 0; display: flex; flex-direction: column; line-height: 1.2; }
    .breed .n {
      font-size: 12px; font-weight: 500; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .breed .w {
      font-size: 10.5px; color: var(--dac-ink-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      font-variant-numeric: tabular-nums;
    }
    .breed .b[data-eerst="true"] .n { color: var(--dac-ink); font-weight: 600; }
    .breed .b[data-eerst="true"] .w { color: var(--dac-ink-2); }

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
  `);var qi=class extends D{defaults(){return{show_hero:!0,show_list:!0}}setConfig(e){let t={...e};for(let[n,a]of Object.entries(e.tones??{}))t[`kleur:${n}`]=a;delete t.tones,super.setConfig(t)}serialize(e){let t={...e},n={};for(let a of Object.keys(t))a.startsWith("kleur:")&&(t[a]&&(n[a.slice(6)]=t[a]),delete t[a]);return Object.keys(n).length?t.tones=n:delete t.tones,t}ids_(){return(this.config_?.sensors??[]).map(e=>typeof e=="string"?e:e.entity).filter(Boolean)}pickers(){let e=this.ids_(),t=Fi(e.map(n=>Ys(this.hass?.states?.[n]?.attributes?.friendly_name??n)||n));return e.map((n,a)=>({key:`kleur:${n}`,kind:"tone",label:`Kleur voor ${t[a]||n}`,compact:!0,after:!0}))}schema(){return[{name:"sensors",selector:{entity:{domain:"sensor",multiple:!0}}},{name:"layout",selector:m.select([{value:"lijst",label:"Lijst (eerstvolgende uitgelicht)"},{value:"breed",label:"Over de breedte (veel lager)"}])}]}label(e){return{sensors:"Afvalsensoren",layout:"Vorm",show_hero:"Eerstvolgende uitlichten",show_list:"Overige data tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="layout")return"Over de breedte zet alle bakken naast elkaar in plaats van onder elkaar. Vier bakken passen dan op \xE9\xE9n rasterrij in plaats van vier \u2014 dat scheelt bijna tweehonderd pixels. De eerstvolgende licht op.";if(e.name==="sensors")return"Sensoren waarvan de status een datum is, bijvoorbeeld 18-08-2026. De kaart sorteert zelf; laat een kleur leeg om de bakkleur op de naam te laten kiezen."}};H("domotiapp-waste-card-editor",qi);N("domotiapp-waste-card",Bn,{name:"DomotiApp Afvalkalender",description:"Eerstvolgende ophaling als hero, de rest eronder. Kleur per fractie."});function Ye(i){if(i==null||i==="")return 4;let e=Math.round(Number(i));return Number.isFinite(e)?Math.min(6,Math.max(2,e)):4}function Kn(i,e=!0){if(typeof i=="string")return{name:"",icon:"",path:i,action:null,items:[]};let t=i??{};return{name:typeof t.name=="string"?t.name:"",icon:typeof t.icon=="string"?t.icon:"",path:typeof t.path=="string"?t.path:typeof t.url=="string"?t.url:typeof t.navigation_path=="string"?t.navigation_path:"",action:t.action&&typeof t.action=="object"?{...t.action}:null,items:e&&Array.isArray(t.items)?t.items.slice(0,8).map(n=>Kn(n,!1)):[]}}var Pe=i=>Array.isArray(i?.items)?i.items.filter(Be):[],Qs=i=>Pe(i).length>0,Be=i=>!!(i&&(i.name?.trim()||i.icon?.trim()||i.path?.trim()||i.action));function Js(i){return(Array.isArray(i?.items)?i.items:[]).slice(0,20).map(t=>Kn(t))}var el=[{id:"domotitech",label:"DomotiTech",uitleg:"Opent domotitech.nl in een nieuw tabblad, met het logo erop.",bovenaan:!0,maak:()=>({name:"DomotiTech",icon:"domotitech",path:"https://domotitech.nl",action:null,items:[]})},{id:"herstart",label:"Herstart Home Assistant",uitleg:"Roept homeassistant.restart aan, met een bevestiging ervoor.",bovenaan:!0,maak:()=>({name:"Herstart",icon:"power",path:"",action:{action:"perform-action",perform_action:"homeassistant.restart",confirmation:{title:"Weet je het zeker?",text:"Weet je het zeker dat je Home Assistant wilt herstarten?"}},items:[]})}];function tl(i,e,t=!1){let n=Array.isArray(i)?[...i]:[];if(n.length>=8)return{lijst:n,plek:-1};let a=t?0:n.length;return n.splice(a,0,e),{lijst:n,plek:a}}function Gn(i,e=4){let t=(i??[]).filter(Be),n=Ye(e);if(t.length<=n)return{balk:t,meer:[],heeftMeer:!1};let a=Math.max(1,n-1);return{balk:t.slice(0,a),meer:t.slice(a),heeftMeer:!0}}function Zi(i){if(i&&typeof i=="object")return i.action?i.action:Zi(i.path);let e=String(i??"").trim();return e?/^[a-z][a-z0-9+.-]*:\/\//i.test(e)||e.startsWith("mailto:")?{action:"url",url_path:e}:{action:"navigate",navigation_path:e}:{action:"none"}}var vh=`
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
`,nl=/^i(\d+)(s\d+)?$/,al=i=>({...i.name?{name:i.name}:{},...i.icon?{icon:i.icon}:{},...i.path?{path:i.path}:{},...i.action?{action:structuredClone(i.action)}:{}}),il=i=>i.filter(Be).map(e=>{let t=(e.items??[]).filter(Be).map(al);return{...al(e),...t.length?{items:t}:{}}}),Xi=class extends HTMLElement{constructor(){super(),this.items_=[],this.rest_={},this.open_=new Set}setConfig(e){if(this.rest_={...e},delete this.rest_.items,this.gebouwd_&&e===this.uitObject_)return;let t=(Array.isArray(e?.items)?e.items:[]).map(n=>Kn(n));this.gebouwd_&&JSON.stringify(il(t))===this.uit_||(this.items_=t,this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}connectedCallback(){this.gebouwd_||this.build_()}async build_(){if(!this.hass_)return;await customElements.whenDefined("ha-form"),this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=vh;let t=document.createElement("div");t.className="dac-nav",this.append(e,t),t.appendChild(this.kaartBlok_());let n=document.createElement("div");n.className="knoppen",t.appendChild(n);let{balk:a}=Gn(this.items_,this.rest_.max),r=a.length,o=this.items_.filter(Be);if(this.items_.forEach((l,d)=>{if(o.indexOf(l)===r&&o.length>r){let p=document.createElement("div");p.className="grens",p.textContent="Achter de meer-knop",n.appendChild(p)}n.appendChild(this.itemBlok_(l,d))}),!this.items_.length){let l=document.createElement("p");l.className="uitleg",l.textContent="Elke knop heeft een naam, een icoon en een pad -- bijvoorbeeld /lovelace/keuken voor een view op dit dashboard, of #keuken voor een pop-up. Wat er niet meer in de balk past valt vanzelf achter de meer-knop rechts.",t.appendChild(l)}let s=document.createElement("button");s.type="button",s.className="toevoegen",s.textContent="\uFF0B  Knop toevoegen",s.disabled=this.items_.length>=20,s.addEventListener("click",()=>{this.items_.push({name:"",icon:"",path:""}),this.open_.add(`i${this.items_.length-1}`),this.emit_(),this.build_()}),t.appendChild(s)}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"max",selector:{number:{min:2,max:6,step:1,mode:"box"}}},{name:"labels",selector:{boolean:{}}},{name:"bare",selector:{boolean:{}}}],e.computeLabel=t=>({max:"Knoppen in de balk",labels:"Namen onder de iconen",bare:"Achtergrond weglaten"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="max")return`De meer-knop telt zelf mee. Staan er meer knoppen dan dit, dan komen de eerste ${Ye(this.rest_.max)-1} in de balk en valt de rest achter "Meer".`;if(t.name==="labels")return"Uit geeft een rij kale iconen. Dan passen er meer naast elkaar op een telefoon.";if(t.name==="bare")return"Haalt de pil onder de balk weg: alleen de iconen blijven over, zwevend boven het dashboard."},e.data={max:Ye(this.rest_.max),labels:this.rest_.labels!==!1,bare:!!this.rest_.bare},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{};this.rest_.max=Ye(n.max),n.labels===!1?this.rest_.labels=!1:delete this.rest_.labels,n.bare?this.rest_.bare=!0:delete this.rest_.bare,this.emit_(),this.build_()}),e}itemBlok_(e,t){let n=document.createElement("details");n.className="item",this.onthoud_(n,`i${t}`);let a=document.createElement("summary"),r=document.createElement("span");r.className="voor";let o=document.createElement("span");o.className="titel";let s=document.createElement("b"),l=document.createElement("small");o.append(s,l);let d=()=>{let x=!Be(e);n.dataset.leeg=String(x),r.innerHTML=b(e.icon,"grid"),s.textContent=e.name||(x?"Nieuwe knop":e.path||"Zonder naam");let $=Pe(e).length;l.textContent=$?`Menu met ${$} knop${$===1?"":"pen"}`:e.path?e.path:e.icon?`${Oe(e.icon)} -- nog geen pad`:"Nog geen pad"};d(),this.koppen_.push(d);let c=this.kopKnop_("Omhoog",A.arrowUp,()=>this.verplaats_(t,-1));c.disabled=t===0;let p=this.kopKnop_("Omlaag",A.arrowDown,()=>this.verplaats_(t,1));p.disabled=t===this.items_.length-1;let h=this.kopKnop_("Verwijderen",A.close,()=>this.verwijder_(t));h.classList.add("weg"),a.append(r,o,c,p,h),n.appendChild(a);let g=document.createElement("div");g.className="body";let f=document.createElement("dac-icon-picker");f.label="Icoon",f.fallback="grid",f.auto=!1,f.hass=this.hass_,f.value=e.icon,f.addEventListener("value-changed",x=>{x.stopPropagation(),e.icon=x.detail.value??"",this.emit_()});let k=document.createElement("ha-form");return k.hass=this.hass_,k.schema=[{name:"name",selector:{text:{}}},{name:"path",selector:{text:{}}}],k.computeLabel=x=>({name:"Naam",path:"Waar gaat hij heen"})[x.name]??x.name,k.computeHelper=x=>{if(x.name!=="path")return;let $="/lovelace/keuken voor een view, #keuken voor een pop-up van bubble-card, of een https-adres voor iets buiten Home Assistant.";return Qs(e)?`${$}

Deze knop heeft subknoppen en klapt dus open in plaats van ergens heen te gaan; zijn eigen pad wordt niet gebruikt.`:$},k.data={name:e.name,path:e.path},k.addEventListener("value-changed",x=>{x.stopPropagation();let $=x.detail.value??{};e.name=$.name??"",e.path=$.path??"",this.emit_()}),g.append(f,k,...this.subBlok_(e,t)),n.appendChild(g),n}subBlok_(e,t){Array.isArray(e.items)||(e.items=[]);let n=document.createElement("div");n.className="subkop",n.textContent="Subknoppen";let a=document.createElement("div");a.className="sublijst",e.items.forEach((s,l)=>a.appendChild(this.subItemBlok_(e,s,t,l)));let r=this.subKeuze_(e,t),o=document.createElement("p");return o.className="uitleg",o.textContent="Hangt hier iets onder, dan klapt deze knop een menu open BOVEN zichzelf in plaats van ergens heen te gaan. Valt de knop zelf achter de meer-knop, dan staan zijn subknoppen daar ingesprongen onder hem.",[n,a,r,o]}subKeuze_(e,t){let n=document.createElement("details");n.className="subkeuze",e.items.length>=8&&n.setAttribute("vol","");let a=document.createElement("summary");a.textContent="\uFF0B  Subknop toevoegen",n.appendChild(a);let r=document.createElement("div");r.className="keuzes",n.appendChild(r);let o=(s,l)=>{let{lijst:d,plek:c}=tl(e.items,s,l);c<0||(e.items=d,this.open_.add(`i${t}`),this.open_.add(`i${t}s${c}`),this.emit_(),this.build_(),requestAnimationFrame(()=>{this.querySelectorAll("details.sub")[c]?.scrollIntoView({block:"nearest"})}))};r.appendChild(this.keuzeKnop_("plus","Lege subknop","Zelf een naam, een icoon en een pad invullen.",()=>o({name:"",icon:"",path:"",action:null,items:[]},!1)));for(let s of el){let l=s.maak();r.appendChild(this.keuzeKnop_(l.icon,s.label,s.uitleg,()=>o(s.maak(),s.bovenaan)))}return n}keuzeKnop_(e,t,n,a){let r=document.createElement("button");r.type="button";let o=document.createElement("span");o.className="voor",o.innerHTML=b(e,"plus");let s=document.createElement("span");s.className="tekst";let l=document.createElement("b");l.textContent=t;let d=document.createElement("small");return d.textContent=n,s.append(l,d),r.append(o,s),r.addEventListener("click",a),r}subItemBlok_(e,t,n,a){let r=document.createElement("details");r.className="sub",this.onthoud_(r,`i${n}s${a}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="voor";let l=document.createElement("span");l.className="titel";let d=document.createElement("b"),c=document.createElement("small");l.append(d,c);let p=()=>{s.innerHTML=b(t.icon,"grid"),d.textContent=t.name||(Be(t)?t.path||"Zonder naam":"Nieuwe subknop"),c.textContent=t.action?`Roept ${t.action.perform_action??t.action.service??t.action.action} aan`:t.path||"Nog geen pad"};p(),this.koppen_.push(p);let h=this.kopKnop_("Omhoog",A.arrowUp,()=>this.verplaatsSub_(e,n,a,-1));h.disabled=a===0;let g=this.kopKnop_("Omlaag",A.arrowDown,()=>this.verplaatsSub_(e,n,a,1));g.disabled=a===e.items.length-1;let f=this.kopKnop_("Verwijderen",A.close,()=>this.verwijderSub_(e,n,a));f.classList.add("weg"),o.append(s,l,h,g,f),r.appendChild(o);let k=document.createElement("div");k.className="body";let x=document.createElement("dac-icon-picker");x.label="Icoon",x.fallback="grid",x.auto=!1,x.hass=this.hass_,x.value=t.icon,x.addEventListener("value-changed",w=>{w.stopPropagation(),t.icon=w.detail.value??"",this.emit_()});let $=document.createElement("ha-form");return $.hass=this.hass_,$.schema=[{name:"name",selector:{text:{}}},{name:"path",selector:{text:{}}}],$.computeLabel=w=>({name:"Naam",path:"Waar gaat hij heen"})[w.name]??w.name,t.action&&($.schema=[{name:"name",selector:{text:{}}}],$.computeHelper=w=>w.name==="name"?`Deze knop voert een actie uit (${t.action.perform_action??t.action.service??t.action.action}) en gaat dus nergens heen. Weg met de knop rechtsboven.`:void 0),$.data={name:t.name,path:t.path},$.addEventListener("value-changed",w=>{w.stopPropagation();let V=w.detail.value??{};t.name=V.name??"",t.path=V.path??"",this.emit_()}),k.append(x,$),r.appendChild(k),r}verplaatsSub_(e,t,n,a){let r=n+a;if(r<0||r>=e.items.length)return;[e.items[n],e.items[r]]=[e.items[r],e.items[n]];let o=this.open_.has(`i${t}s${n}`),s=this.open_.has(`i${t}s${r}`);this.open_.delete(`i${t}s${n}`),this.open_.delete(`i${t}s${r}`),s&&this.open_.add(`i${t}s${n}`),o&&this.open_.add(`i${t}s${r}`),this.emit_(),this.build_()}verwijderSub_(e,t,n){e.items.splice(n,1);let a=new Set;for(let r of this.open_){let o=/^i(\d+)s(\d+)$/.exec(r);if(!o||Number(o[1])!==t){a.add(r);continue}let s=Number(o[2]);s!==n&&a.add(`i${t}s${s>n?s-1:s}`)}this.open_=a,this.emit_(),this.build_()}kopKnop_(e,t,n){let a=document.createElement("button");return a.type="button",a.className="rondknop",a.title=e,a.setAttribute("aria-label",e),a.innerHTML=t,a.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),a.disabled||n()}),a}verplaats_(e,t){let n=e+t;n<0||n>=this.items_.length||([this.items_[e],this.items_[n]]=[this.items_[n],this.items_[e]],this.schuifOpen_(e,n),this.emit_(),this.build_())}verwijder_(e){this.items_.splice(e,1);let t=new Set;for(let n of this.open_){let a=nl.exec(n);if(!a)continue;let r=Number(a[1]);r!==e&&t.add(`i${r>e?r-1:r}${a[2]??""}`)}this.open_=t,this.emit_(),this.build_()}schuifOpen_(e,t){let n=new Set;for(let a of this.open_){let r=nl.exec(a);if(!r)continue;let o=Number(r[1]),s=r[2]??"";o===e?n.add(`i${t}${s}`):o===t?n.add(`i${e}${s}`):n.add(a)}this.open_=n}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}emit_(){let e=il(this.items_),t={...this.rest_,items:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_??[])n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};L("domotiapp-navbar-card-editor",Xi);var rl=i=>i.parentElement??(i.parentNode&&i.parentNode.host)??null;function*Bt(i){let e=rl(i),t=0;for(;e&&t++<40;)yield e,e=rl(e)}function kh(i){for(let e of Bt(i)){let t=e.tagName?.toLowerCase?.()??"";if(/(^|-)(edit|preview)/.test(t))return!0}return!1}function xh(i){for(let e of Bt(i))if(e.tagName?.toLowerCase?.()==="hui-card")return e;return null}function wh(i){for(let e of Bt(i))if(e.tagName?.toLowerCase?.()==="hui-section")return e;return null}function _h(i){for(let e of Bt(i))if(e.classList?.contains?.("section"))return e;return null}function ol(i){for(let e of Bt(i)){let t=e.tagName?.toLowerCase?.()??"";if(t==="hui-view"||t.endsWith("-view"))return e}return null}var Wn=class extends S{validate(e){let t=Js(e),n={labels:!0,tone:"accent",...e,items:t,max:Ye(e?.max)};return t.filter(a=>a.name||a.icon||a.path).length||(n[C]="Voeg knoppen toe in de editor: een naam, een icoon en waar hij heen gaat."),n}watched(){return[]}template(){let e=this.config;e.labels===!1&&this.setAttribute("geen-namen",""),e.bare&&this.setAttribute("bare","");let{balk:t,meer:n,heeftMeer:a}=Gn(e.items,e.max),r=e.items.filter(c=>c.name||c.icon||c.path),o=(c,p)=>{let g=Pe(c).length?` data-menu="s${p}" aria-haspopup="true" aria-expanded="false"`:"";return`
      <button type="button" class="knop" data-i="${p}" title="${j(c.name)}"${g}>
        <span class="ico">${b(c.icon,"grid")}</span>
        <span class="naam">${j(c.name)}</span>
      </button>`},s=(c,p,h=null,g="")=>`
      <button type="button" class="regel${g?` ${g}`:""}" data-i="${p}"${h===null?"":` data-s="${h}"`}>
        <span class="mi">${b(c.icon,"grid")}</span>
        <span class="mt">${j(c.name||c.path)}</span>
      </button>`,l=n.map(c=>{let p=r.indexOf(c),h=Pe(c);return h.length?`
      <div class="regel kop">
        <span class="mi">${b(c.icon,"grid")}</span>
        <span class="mt">${j(c.name||c.path)}</span>
      </div>`+h.map((f,k)=>s(f,p,k,"sub")).join(""):s(c,p)}).join(""),d=t.map(c=>{let p=Pe(c);if(!p.length)return"";let h=r.indexOf(c);return`<div class="menu submenu" data-id="s${h}" role="menu">${p.map((g,f)=>s(g,h,f)).join("")}</div>`}).join("");return`
      <div class="balk" style="--tone:${Z(e.tone)}">
        ${t.map(c=>o(c,r.indexOf(c))).join("")}
        ${a?`<button type="button" class="knop meer" data-menu="meer" aria-expanded="false" aria-haspopup="true">
                 <span class="ico">${A.dots}</span>
                 <span class="naam">Meer</span>
               </button>`:""}
        ${d}
        <div class="menu meermenu" data-id="meer" role="menu">
          ${l}
        </div>
      </div>`}wire(){for(let e of this.$$(".knop[data-i], .regel[data-i]"))e.dataset.menu||this.on(e,"click",()=>{this.sluitMenus_(),this.ga_(Number(e.dataset.i),e.dataset.s)});for(let e of this.$$("[data-menu]"))this.on(e,"click",t=>{t.stopPropagation(),this.wisselMenu_(e)});this.on(window,"pointerdown",e=>{if(!this.ietsOpen_())return;let t=e.composedPath?.()??[];[...this.$$(".menu[open]"),...this.$$("[data-menu]")].some(a=>t.includes(a))||this.sluitMenus_()},!0),this.on(window,"keydown",e=>{e.key==="Escape"&&this.ietsOpen_()&&this.sluitMenus_()}),this.on(window,"location-changed",()=>this.sluitMenus_())}paint(){}ga_(e,t){let n=this.config.items.filter(r=>r.name||r.icon||r.path)[e];if(!n)return;let a=t===void 0?n:Pe(n)[Number(t)];a&&je(this,this.hass,{},Zi(a))}ietsOpen_(){return!!this.$(".menu[open]")}menuVan_(e){return this.$$(".menu").find(t=>t.dataset.id===e.dataset.menu)??null}wisselMenu_(e){let t=this.menuVan_(e),n=!!t?.hasAttribute("open");this.sluitMenus_(),!(!t||n)&&(t.setAttribute("open",""),e.setAttribute("aria-expanded","true"),this.plaatsMenu_(t,e))}sluitMenus_(){for(let e of this.$$(".menu[open]"))e.removeAttribute("open");for(let e of this.$$("[data-menu]"))e.setAttribute("aria-expanded","false")}plaatsMenu_(e,t){if(!e.classList.contains("submenu"))return;let n=this.$(".balk")?.getBoundingClientRect(),a=t.getBoundingClientRect();if(!n?.width)return;let r=e.offsetWidth/2,o=a.left+a.width/2-n.left,s=r+6,l=n.width-r-6,d=l<s?n.width/2:Math.min(Math.max(o,s),l);e.style.setProperty("--x",`${Math.round(d)}px`)}connectedCallback(){super.connectedCallback(),requestAnimationFrame(()=>this.plaats_())}disconnectedCallback(){super.disconnectedCallback(),this.herstel_()}plaats_(){if(!this.isConnected||!this.config)return;if(kh(this)){this.setAttribute("in-editor","");return}this.removeAttribute("in-editor");let e=xh(this);this.klapIn_(e);let t=e?.parentElement;t?.classList?.contains?.("card")&&this.klapIn_(t);let n=wh(this);n?.config?.cards?.length===1&&this.klapIn_(_h(n));let a=ol(this),r=this.$(".balk");if(a&&r&&!this.viewStijl_){this.view_=a,this.viewStijl_=a.style.paddingBottom??"";let o=Math.round(r.getBoundingClientRect().height)||62;a.style.paddingBottom=`${o+32}px`}this.meetMidden_(),a&&!this.waarnemer_&&(this.waarnemer_=new ResizeObserver(()=>this.meetMidden_()),this.waarnemer_.observe(a))}meetMidden_(){let e=this.view_??ol(this);if(!e)return;let t=e.getBoundingClientRect();t.width&&this.style.setProperty("--dac-nav-mid",`${Math.round(t.left+t.width/2)}px`)}klapIn_(e){e&&(this.ingeklapt_??=new Map,!this.ingeklapt_.has(e)&&(this.ingeklapt_.set(e,e.getAttribute("style")),e.style.position="absolute",e.style.width="0",e.style.height="0",e.style.minHeight="0",e.style.margin="0",e.style.padding="0",e.style.overflow="visible"))}herstel_(){this.waarnemer_?.disconnect(),this.waarnemer_=null;for(let[e,t]of this.ingeklapt_??[])t?e.setAttribute("style",t):e.removeAttribute("style");this.ingeklapt_=null,this.view_&&(this.view_.style.paddingBottom=this.viewStijl_||"",this.view_=null,this.viewStijl_=null)}getCardSize(){return 1}getGridOptions(){return{columns:"full",rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-navbar-card-editor")}static getStubConfig(){return{items:[{name:"Thuis",icon:"house",path:""},{name:"Licht",icon:"bulb",path:""},{name:"Media",icon:"music",path:""},{name:"Instellingen",icon:"cog",path:""}],max:4,labels:!0}}};_(Wn,"css",`
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
  `);N("domotiapp-navbar-card",Wn,{name:"DomotiApp Navbalk",description:`Vaste navigatiebalk onderaan het scherm, met een meer-menu voor wat er in de breedte niet bij past. ${2} tot ${6} knoppen in de balk.`});var yh="dac-tabs:";function Ji(i){let e=i??{},t=typeof e.name=="string"?e.name:typeof e.title=="string"?e.title:"",n=Array.isArray(e.cards)?e.cards.filter(r=>r&&typeof r=="object"):[],a=n.length?n:e.card&&typeof e.card=="object"?[e.card]:[];return{name:t,icon:typeof e.icon=="string"?e.icon:"",cards:a}}var Un=i=>!!(i&&(i.name?.trim()||i.icon?.trim()||i.cards?.length));function sl(i){return(Array.isArray(i?.tabs)?i.tabs:[]).slice(0,8).map(Ji).filter(Un)}function jh(i,e){if(!e)return 0;let t=Math.round(Number(i?.default_tab));return!Number.isFinite(t)||t<1||t>e?0:t-1}function er(i){let e=(i??[]).map((t,n)=>(t?.name?.trim()||t?.icon?.trim()||`tab${n}`).toLowerCase()).join("|");return yh+e}function zh(i,e,t){let n=null;try{n=i?.getItem?.(e)??null}catch{return null}let a=Number(n);return n===null||n===""||!Number.isInteger(a)?null:a>=0&&a<t?a:null}function ll(i,e,t){try{return i?.setItem?.(e,String(t)),!0}catch{return!1}}function dl(i,e,t){return zh(t,er(e),e.length)??jh(i,e.length)}var $h=[["tile","Tegel"],["entities","Entiteiten"],["button","Knop"],["gauge","Meter"],["history-graph","Geschiedenis"],["statistic","Statistiek"],["sensor","Sensorgrafiek"],["light","Lamp"],["thermostat","Thermostaat"],["humidifier","Luchtbevochtiger"],["media-control","Mediaspeler"],["weather-forecast","Weersverwachting"],["markdown","Tekst (Markdown)"],["picture","Afbeelding"],["picture-entity","Afbeelding met entiteit"],["glance","Overzicht"],["area","Ruimte"],["alarm-panel","Alarmpaneel"],["calendar","Agenda"],["todo-list","Takenlijst"],["map","Kaart"],["iframe","Webpagina"],["vertical-stack","Stapel (onder elkaar)"],["horizontal-stack","Stapel (naast elkaar)"],["grid","Raster"],["conditional","Voorwaardelijk"]];function cl(){let i=(window.customCards??[]).filter(e=>e&&typeof e.type=="string").map(e=>({type:`custom:${e.type}`,naam:e.name||e.type,uitleg:e.description||"",eigen:!0}));return i.sort((e,t)=>{let n=e.type.startsWith("custom:domotiapp-")?0:1,a=t.type.startsWith("custom:domotiapp-")?0:1;return n-a||e.naam.localeCompare(t.naam,"nl")}),[...i,...$h.map(([e,t])=>({type:e,naam:t,uitleg:"",eigen:!1}))]}function pl(i,e){let t=String(e??"").trim().toLowerCase();return t?i.filter(n=>`${n.naam} ${n.type} ${n.uitleg}`.toLowerCase().includes(t)):i}async function hl(i,e){let t={type:i};try{let n=await window.loadCardHelpers?.();try{n?.createCardElement?.(t)}catch{}let a=i.startsWith("custom:")?i.slice(7):`hui-${i}-card`,o=await customElements.get(a)?.getStubConfig?.(e,Object.keys(e?.states??{}),[]);if(o&&typeof o=="object")return{...o,type:i}}catch{}return t}var ul=()=>!!customElements.get("hui-card-element-editor");function ml(i,e,t){let n=s=>{if(s==null||s==="")return null;let l=Math.round(Number(s));return Number.isFinite(l)?l:null},a=i,r=n(e),o=n(t);return r!==null&&(a=Math.max(a,r)),o!==null&&(a=Math.min(a,o)),a}function Eh(i,e){let t=i?.columns,n=i?.rows,a=12;if(t!=null&&t!=="full"){let s=Math.round(Number(t));a=Number.isFinite(s)?Math.min(12,Math.max(1,s)):12}a=Math.min(12,Math.max(1,ml(a,e?.min_columns,e?.max_columns)));let r={gridColumn:`span ${a}`},o=Math.round(Number(n));return n!=="auto"&&Number.isFinite(o)&&o>=1&&(r.height=`${Math.max(1,ml(o,e?.min_rows,e?.max_rows))*64-8}px`),r}function Kt(i,e,t){if(!i?.style)return;let{gridColumn:n,height:a}=Eh(e,t);i.style.gridColumn=n,i.style.height=a??""}function gl(i){let e=i?._element??i?.shadowRoot?.firstElementChild??null;if(typeof e?.getGridOptions!="function")return null;try{let t=e.getGridOptions();return t&&typeof t=="object"?t:null}catch{return null}}function fl(i,e,t={}){let n=Array.isArray(i)?[...i]:[],a=Number(t.index);switch(e){case"verplaats":{let r=Number(t.van),o=Number(t.naar);if(!Number.isInteger(r)||!Number.isInteger(o)||r<0||r>=n.length||o<0||o>=n.length||r===o)return null;let[s]=n.splice(r,1);return n.splice(o,0,s),n}case"dupliceer":return!Number.isInteger(a)||!n[a]?null:(n.splice(a+1,0,structuredClone(n[a])),n);case"verwijder":return!Number.isInteger(a)||!n[a]?null:(n.splice(a,1),n);case"rooster":return!Number.isInteger(a)||!n[a]||!t.rooster?null:(n[a]={...n[a],grid_options:{...n[a].grid_options??{},...t.rooster}},n);default:return null}}var bl=i=>({...i?{config:i}:{},editMode:!0,saveConfig:async()=>{}}),Ah=()=>document.querySelector("home-assistant");function vl({kaarten:i,hass:e,maakKaart:t,opActie:n}){let a=document.createElement("ha-sortable");a.disabled=!1,a.draggableSelector=".dac-kaart",a.rollback=!1,a.invertSwap=!0,a.options={delay:100,delayOnTouchOnly:!0,direction:"vertical",invertedSwapThreshold:.7};let r=document.createElement("div");r.className="dac-kaarten";let o=[];i.forEach((d,c)=>{let p=t(d,c);if(!p)return;let h=document.createElement("div");h.className="dac-kaart",Kt(h,d?.grid_options);let g=document.createElement("hui-card-edit-mode");g.hass=e,g.lovelace=bl(),g.path=[0,0,c],g.hiddenOverlay=!1,g.appendChild(p),o.push(g),h.appendChild(g),r.appendChild(h)}),a.appendChild(r);let s=d=>{for(let c of o)c.hiddenOverlay=!d};a.addEventListener("drag-start",()=>s(!1)),a.addEventListener("drag-end",()=>s(!0)),a.addEventListener("item-moved",d=>{d.stopPropagation(),n("verplaats",{van:d.detail.oldIndex,naar:d.detail.newIndex})});let l={"ll-edit-card":d=>n("bewerk",{index:d.detail.path[2]}),"ll-duplicate-card":d=>n("dupliceer",{index:d.detail.path[2]}),"ll-delete-card":d=>n("verwijder",{index:d.detail.path[2]}),"ll-copy-card":d=>n("kopieer",{index:d.detail.path[2]}),"ll-change-grid-options":d=>n("rooster",{index:d.detail.path?.[2],rooster:d.detail.gridOptions}),"ll-move-to-section":()=>{}};for(let[d,c]of Object.entries(l))a.addEventListener(d,p=>{p.stopPropagation(),c(p)});return a}function kl(i){try{let e=typeof structuredClone=="function"?structuredClone(i):JSON.parse(JSON.stringify(i));return sessionStorage.setItem("dashboardCardClipboard",JSON.stringify(e)),!0}catch{return!1}}function xl({hass:i,kaarten:e}){let t=Ah();return!t||!customElements.get("hui-section")?Promise.resolve(null):new Promise(n=>{let a=null,r=null,o=!1,s=()=>{o||(o=!0,t.removeEventListener("show-dialog",l,!0),window.removeEventListener("dialog-closed",d,!0),n(a?{kaart:a}:r?{kaarten:r}:null))},l=g=>{if(g?.detail?.dialogTag!=="hui-dialog-edit-card")return;let f=g.detail?.dialogParams?.cardConfig;g.stopImmediatePropagation?.(),g.stopPropagation(),f&&(a=f);let k=t.querySelector("hui-dialog-create-card");typeof k?.closeDialog=="function"&&k.closeDialog(),setTimeout(s,0)},d=g=>{g?.detail?.dialog==="hui-dialog-create-card"&&setTimeout(s,0)};t.addEventListener("show-dialog",l,!0),window.addEventListener("dialog-closed",d,!0);let c={type:"grid",cards:[...e]},p=document.createElement("hui-section");p.style.display="none",p.hass=i,p.index=0,p.viewIndex=0,p.config=c,p.lovelace={...bl({views:[{path:"domotiapp-kiezer",title:"DomotiApp",sections:[c]}]}),saveConfig:async g=>{let f=g?.views?.[0]?.sections?.[0]?.cards;Array.isArray(f)&&(r=f)}},t.appendChild(p),(async()=>{try{typeof p._initializeConfig=="function"?await p._initializeConfig():await p.updateComplete;let g=p._layoutElement;if(!g)throw new Error("de proxysectie heeft geen layout-element");g.dispatchEvent(new CustomEvent("ll-create-card",{bubbles:!0,composed:!0}))}catch(g){console.warn("DomotiApp: de kaartkiezer van Home Assistant ging niet open",g),s()}finally{setTimeout(()=>p.remove(),0)}})()})}var Fn=()=>!!(customElements.get("hui-card-edit-mode")&&customElements.get("ha-sortable")&&customElements.get("hui-section"));var Mh=`
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
`,_l=i=>i.filter(Un).map(e=>({...e.name?{name:e.name}:{},...e.icon?{icon:e.icon}:{},...e.cards?.length?{cards:e.cards.map(t=>structuredClone(t))}:{}}));function ft(i){let e=String(i?.type??"").replace(/^custom:/,"");return e?(window.customCards??[]).find(n=>n?.type===e)?.name||e:"een kaart"}function tr(i){let e=i.cards?.length??0;return e?e===1?ft(i.cards[0]):`${e} kaarten`:"Nog geen kaart"}var nr=class extends HTMLElement{constructor(){super(),this.tabs_=[],this.rest_={},this.open_=new Set}setConfig(e){if(this.rest_={...e},delete this.rest_.tabs,this.gebouwd_&&e===this.uitObject_)return;let t=(Array.isArray(e?.tabs)?e.tabs:[]).map(Ji);this.gebouwd_&&JSON.stringify(_l(t))===this.uit_||(this.tabs_=t,this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker, hui-card-element-editor, hui-card-visibility-editor, hui-card-layout-editor"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}set lovelace(e){this.lovelace_=e;for(let t of this.querySelectorAll("hui-card-element-editor"))t.lovelace=e}get lovelace(){return this.lovelace_}connectedCallback(){this.gebouwd_||this.build_()}async build_(){if(!this.hass_)return;if(await customElements.whenDefined("ha-form"),!this.helpers_)try{this.helpers_=await window.loadCardHelpers?.()}catch{this.helpers_=null}this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=Mh;let t=document.createElement("div");t.className="dac-tabs",this.append(e,t),t.appendChild(this.kaartBlok_());let n=document.createElement("div");n.className="lijst",t.appendChild(n),this.tabs_.forEach((r,o)=>n.appendChild(this.tabBlok_(r,o)));let a=document.createElement("button");a.type="button",a.className="toevoegen",a.textContent="\uFF0B  Tabblad toevoegen",a.disabled=this.tabs_.length>=8,a.addEventListener("click",()=>{this.tabs_.push({name:"",icon:"",cards:[]}),this.open_.add(`t${this.tabs_.length-1}`),this.emit_(),this.build_()}),t.appendChild(a)}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"default_tab",selector:{number:{min:1,max:8,step:1,mode:"box"}}},{name:"alignment",selector:{select:{mode:"dropdown",options:[{value:"vullen",label:"Verdeeld over de breedte"},{value:"links",label:"Links"},{value:"rechts",label:"Rechts"}]}}},{name:"show_names",selector:{boolean:{}}},{name:"bare",selector:{boolean:{}}}],e.computeLabel=t=>({default_tab:"Welk tabblad staat open op een nieuw apparaat",alignment:"Uitlijning van de rij",show_names:"Namen naast de iconen",bare:"Achtergrond weglaten"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="default_tab")return"Telt vanaf 1. Dit geldt alleen zolang een apparaat nog niets gekozen heeft \u2014 daarna onthoudt elk apparaat zijn eigen tabblad, en dat van je telefoon staat los van dat van de tablet.";if(t.name==="show_names")return"Uit geeft een rij kale iconen. Dan passen er meer naast elkaar op een telefoon.";if(t.name==="bare")return"Haalt het vlak onder de kaart weg. De rij tabbladen houdt zijn eigen pil."},e.data={default_tab:Number(this.rest_.default_tab)||1,alignment:this.rest_.alignment??"vullen",show_names:this.rest_.show_names!==!1,bare:!!this.rest_.bare},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{},a=Number(n.default_tab);Number.isFinite(a)&&a>1?this.rest_.default_tab=a:delete this.rest_.default_tab,n.alignment==="links"||n.alignment==="rechts"?this.rest_.alignment=n.alignment:delete this.rest_.alignment,n.show_names===!1?this.rest_.show_names=!1:delete this.rest_.show_names,n.bare?this.rest_.bare=!0:delete this.rest_.bare,this.emit_()}),e}tabBlok_(e,t){let n=document.createElement("details");n.className="tab",this.onthoud_(n,`t${t}`);let a=document.createElement("summary"),r=document.createElement("span");r.className="voor";let o=document.createElement("span");o.className="titel";let s=document.createElement("b"),l=document.createElement("small");o.append(s,l);let d=()=>{n.dataset.leeg=String(!Un(e)),r.innerHTML=b(e.icon,"grid"),s.textContent=e.name||`Tabblad ${t+1}`,l.textContent=tr(e)};d(),this.koppen_.push(d);let c=this.kopKnop_("Omhoog",A.arrowUp,()=>this.verplaats_(t,-1));c.disabled=t===0;let p=this.kopKnop_("Omlaag",A.arrowDown,()=>this.verplaats_(t,1));p.disabled=t===this.tabs_.length-1;let h=this.kopKnop_("Verwijderen",A.close,()=>this.verwijder_(t));h.classList.add("weg"),a.append(r,o,c,p,h),n.appendChild(a);let g=document.createElement("div");g.className="body";let f=document.createElement("dac-icon-picker");f.label="Icoon",f.fallback="grid",f.auto=!1,f.hass=this.hass_,f.value=e.icon,f.addEventListener("value-changed",x=>{x.stopPropagation(),e.icon=x.detail.value??"",this.emit_()});let k=document.createElement("ha-form");return k.hass=this.hass_,k.schema=[{name:"name",selector:{text:{}}}],k.computeLabel=()=>"Naam",k.computeHelper=()=>"Deze naam bepaalt ook onder welke sleutel een apparaat zijn keuze onthoudt. Hernoem je hem, dan begint elk apparaat \xE9\xE9n keer opnieuw bij het eerste tabblad.",k.data={name:e.name},k.addEventListener("value-changed",x=>{x.stopPropagation(),e.name=x.detail.value?.name??"",this.emit_()}),g.append(f,k,this.inhoudBlok_(e,t)),n.appendChild(g),n}inhoudBlok_(e,t){let n=document.createElement("div");if(n.className="kaartvak",Array.isArray(e.cards)||(e.cards=[]),!ul()){let r=document.createElement("div");return r.className="inhoud",r.innerHTML=`${b("grid")}<span>Inhoud: <b>${tr(e)}</b> \u2014 aan te passen via Code-editor weergeven.</span>`,n.appendChild(r),n}if(Fn()){let r=document.createElement("div");return r.className="inhoud",r.innerHTML=`${b("grid")}<span>${e.cards.length?`<b>${tr(e)}</b> \u2014 te bewerken in het voorbeeld hiernaast: slepen om te verplaatsen, het potlood om te bewerken.`:"Nog geen kaart \u2014 voeg er een toe in het voorbeeld hiernaast."}</span>`,n.appendChild(r),this.bewerkt_?.tab===t&&e.cards[this.bewerkt_.index]&&n.appendChild(this.bewerkVak_(e,t,this.bewerkt_.index)),n}if(e.cards.length){let r=document.createElement("div");r.className="subkop",r.textContent=e.cards.length===1?"Kaart":`${e.cards.length} kaarten`,n.appendChild(r),e.cards.forEach((o,s)=>n.appendChild(this.kaartBlok2_(e,o,t,s)))}if(this.kiest_===`t${t}`)return n.appendChild(this.kiezerBlok_(e,t)),n;let a=document.createElement("button");return a.type="button",a.className="toevoegen",a.textContent="\uFF0B  Kaart toevoegen",a.addEventListener("click",()=>{this.kiest_=`t${t}`,this.zoek_="",this.build_()}),n.appendChild(a),n}uitVoorbeeld(e,t,n){let a=this.tabs_[e];if(a){if(t==="toevoegen"){this.voegToeViaHa_(a,e);return}this.kaartActie_(a,e,t,n)}}toonBewerkVak_(){let e=this.querySelector(".bewerkvak"),t=this.bewerkt_?.tab,n=this.bewerkt_?.index,a=Number.isInteger(t)?this.tabs_[t]:null;if(!a||!a.cards[n]){e?.remove();return}let r=this.bewerkVak_(a,t,n);e?e.replaceWith(r):this.querySelectorAll(".kaartvak")[t]?.appendChild(r),r.scrollIntoView({block:"nearest"})}kaartActie_(e,t,n,a){if(n==="bewerk"){(this.bewerkt_?.tab!==t||this.bewerkt_?.index!==a.index)&&(this.kaartBlad_="config"),this.bewerkt_={tab:t,index:a.index},this.open_.add(`t${t}`);let o=this.querySelectorAll("details.tab")[t];o&&(o.open=!0),this.toonBewerkVak_();return}if(n==="kopieer"){kl(e.cards[a.index]);return}let r=fl(e.cards,n,a);r&&(e.cards=r,this.bewerkt_=null,this.emit_(),this.build_())}bewerkVak_(e,t,n){let a=document.createElement("div");a.className="bewerkvak";let r=document.createElement("div");r.className="kop";let o=document.createElement("b");o.textContent=ft(e.cards[n]);let s=document.createElement("button");s.type="button",s.textContent="Klaar",s.addEventListener("click",()=>{this.bewerkt_=null,this.build_()}),r.append(o,s);let l=document.createElement("div");l.className="body";let d=this.kaartTabbladen_(e,t,n,l,o);d&&a.append(r,d,l);let c=document.createElement("hui-card-element-editor");return c.hass=this.hass_,this.lovelace_&&(c.lovelace=this.lovelace_),c.value=e.cards[n],c.addEventListener("config-changed",p=>{p.stopPropagation();let h=p.detail?.config;h&&(e.cards[n]=h,this.emit_(),o.textContent=ft(h))}),c.addEventListener("GUImode-changed",p=>p.stopPropagation()),this.kaartEditor_=c,l.appendChild(c),d||a.append(r,l),a}kaartTabbladen_(e,t,n,a,r){let o=!!customElements.get("hui-card-visibility-editor"),s=!!customElements.get("hui-card-layout-editor");if(!o&&!s)return null;let l=document.createElement("div");l.className="kaarttabs";let d=[{id:"config",naam:"Configuratie"},...o?[{id:"zicht",naam:"Zichtbaarheid"}]:[],...s?[{id:"indeling",naam:"Indeling"}]:[]],c=h=>{this.kaartBlad_=h;for(let g of l.querySelectorAll("button"))g.setAttribute("aria-selected",String(g.dataset.blad===h));a.replaceChildren(this.bladInhoud_(h,e,t,n,r))};for(let h of d){let g=document.createElement("button");g.type="button",g.dataset.blad=h.id,g.textContent=h.naam,g.setAttribute("role","tab"),g.setAttribute("aria-selected","false"),g.addEventListener("click",()=>c(h.id)),l.appendChild(g)}let p=d.some(h=>h.id===this.kaartBlad_)?this.kaartBlad_:"config";return setTimeout(()=>c(p),0),l}bladInhoud_(e,t,n,a,r){if(e==="config")return this.kaartEditor_;let o=document.createElement(e==="zicht"?"hui-card-visibility-editor":"hui-card-layout-editor");return o.hass=this.hass_,o.config=t.cards[a],e==="indeling"&&(o.sectionConfig={type:"grid",column_span:1}),o.addEventListener("value-changed",s=>{s.stopPropagation();let l=s.detail?.value;l&&(t.cards[a]=l,o.config=l,this.emit_(),r.textContent=ft(l))}),o}async voegToeViaHa_(e,t){let n=await xl({hass:this.hass_,kaarten:e.cards});n&&(n.kaarten?(e.cards=n.kaarten,this.bewerkt_=null):(e.cards.push(n.kaart),this.bewerkt_={tab:t,index:e.cards.length-1}),this.open_.add(`t${t}`),this.emit_(),this.build_())}kaartBlok2_(e,t,n,a){let r=document.createElement("details");r.className="sub",this.onthoud_(r,`t${n}k${a}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="voor",s.innerHTML=b("grid");let l=document.createElement("span");l.className="titel";let d=document.createElement("b");d.textContent=ft(t);let c=document.createElement("small");c.textContent=String(t?.type??""),l.append(d,c);let p=this.kopKnop_("Omhoog",A.arrowUp,()=>this.verplaatsKaart_(e,n,a,-1));p.disabled=a===0;let h=this.kopKnop_("Omlaag",A.arrowDown,()=>this.verplaatsKaart_(e,n,a,1));h.disabled=a===e.cards.length-1;let g=this.kopKnop_("Verwijderen",A.close,()=>this.verwijderKaart_(e,n,a));g.classList.add("weg"),o.append(s,l,p,h,g),r.appendChild(o);let f=document.createElement("div");f.className="body";let k=document.createElement("hui-card-element-editor");return k.hass=this.hass_,this.lovelace_&&(k.lovelace=this.lovelace_),k.value=t,k.addEventListener("config-changed",x=>{x.stopPropagation();let $=x.detail?.config;$&&(e.cards[a]=$,this.emit_(),d.textContent=ft($),c.textContent=String($.type??""))}),k.addEventListener("GUImode-changed",x=>x.stopPropagation()),f.appendChild(k),r.appendChild(f),r}verplaatsKaart_(e,t,n,a){let r=n+a;if(r<0||r>=e.cards.length)return;[e.cards[n],e.cards[r]]=[e.cards[r],e.cards[n]];let o=this.open_.has(`t${t}k${n}`),s=this.open_.has(`t${t}k${r}`);this.open_.delete(`t${t}k${n}`),this.open_.delete(`t${t}k${r}`),s&&this.open_.add(`t${t}k${n}`),o&&this.open_.add(`t${t}k${r}`),this.emit_(),this.build_()}verwijderKaart_(e,t,n){e.cards.splice(n,1);let a=new Set;for(let r of this.open_){let o=new RegExp(`^t${t}k(\\d+)$`).exec(r);if(!o){a.add(r);continue}let s=Number(o[1]);s!==n&&a.add(`t${t}k${s>n?s-1:s}`)}this.open_=a,this.emit_(),this.build_()}kiezerBlok_(e,t){let n=document.createElement("div");n.className="kiezer";let a=document.createElement("input");a.type="text",a.placeholder="Zoek een kaart...",a.value=this.zoek_??"";let r=document.createElement("div");r.className="soorten";let o=()=>{let l=pl(cl(),this.zoek_);if(r.replaceChildren(),!l.length){let d=document.createElement("p");d.className="leeg",d.textContent="Niets gevonden. Kies iets anders, of gebruik de code-editor.",r.appendChild(d);return}for(let d of l){let c=document.createElement("button");c.type="button",c.className="soort";let p=document.createElement("b");p.textContent=d.naam;let h=document.createElement("small");h.textContent=d.uitleg||d.type,c.append(p,h),c.addEventListener("click",async()=>{e.cards.push(await hl(d.type,this.hass_)),this.kiest_=null,this.open_.add(`t${t}`),this.open_.add(`t${t}k${e.cards.length-1}`),this.emit_(),this.build_()}),r.appendChild(c)}};o(),a.addEventListener("input",()=>{this.zoek_=a.value,o()});let s=document.createElement("button");return s.type="button",s.className="toevoegen",s.textContent="Annuleren",s.addEventListener("click",()=>{this.kiest_=null,this.build_()}),n.append(a,r,s),n}kopKnop_(e,t,n){let a=document.createElement("button");return a.type="button",a.className="rondknop",a.title=e,a.setAttribute("aria-label",e),a.innerHTML=t,a.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),a.disabled||n()}),a}verplaats_(e,t){let n=e+t;if(n<0||n>=this.tabs_.length)return;[this.tabs_[e],this.tabs_[n]]=[this.tabs_[n],this.tabs_[e]];let a=this.open_.has(`t${e}`),r=this.open_.has(`t${n}`);this.open_.delete(`t${e}`),this.open_.delete(`t${n}`),r&&this.open_.add(`t${e}`),a&&this.open_.add(`t${n}`),this.emit_(),this.build_()}verwijder_(e){this.tabs_.splice(e,1);let t=new Set;for(let n of this.open_){let a=Number(n.slice(1));a!==e&&t.add(`t${a>e?a-1:a}`)}this.open_=t,this.emit_(),this.build_()}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}emit_(){let e=_l(this.tabs_),t={...this.rest_,tabs:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_??[])n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};L("domotiapp-tabs-card-editor",nr);var yl=i=>i.parentElement??(i.parentNode&&i.parentNode.host)??null;function*zl(i){let e=yl(i),t=0;for(;e&&t++<40;)yield e,e=yl(e)}function jl(i){let e=null;for(let n of zl(i))if((n.tagName?.toLowerCase?.()??"")==="hui-dialog-edit-card"){e=n;break}if(!e)return null;let t=(n,a=0)=>{if(!n||a>25)return null;if(n.tagName?.toLowerCase?.()==="domotiapp-tabs-card-editor")return n;for(let r of n.children??[]){let o=t(r,a+1);if(o)return o}if(n.shadowRoot)for(let r of n.shadowRoot.children){let o=t(r,a+1);if(o)return o}return null};return t(e)}var Zn=class extends S{constructor(){super(),this.kinderen_=new Map,this.open_=0}validate(e){let t=sl(e),n={tone:"accent",...e,tabs:t};return t.length||(n[C]="Voeg tabbladen toe: elk met een naam, een icoon en een kaart erin."),n}watched(){return[]}setConfig(e){this.kinderen_.clear(),super.setConfig(e)}set hass(e){super.hass=e;for(let t of this.kinderen_.values())if(t)for(let n of t)n&&(n.hass=e);this.herijkIndeling_()}get hass(){return super.hass}template(){let e=this.config;e.bare&&this.setAttribute("bare",""),e.show_names===!1&&this.setAttribute("geen-namen",""),(e.alignment==="links"||e.alignment==="rechts")&&this.setAttribute("uitgelijnd",e.alignment);let t=e.tabs.map((a,r)=>`
        <button type="button" class="tab" role="tab" data-i="${r}" aria-selected="false"
                title="${j(a.name)}">
          ${a.icon?`<span class="ic">${b(a.icon,"grid")}</span>`:""}
          <span class="nm">${j(a.name||`Tab ${r+1}`)}</span>
        </button>`).join(""),n=e.tabs.map((a,r)=>`<div class="vak" data-i="${r}" role="tabpanel"></div>`).join("");return`
      <div class="card surface" style="--tone:${Z(e.tone)}">
        <div class="balk" role="tablist">${t}</div>
        <div class="vakken">${n}</div>
      </div>`}wire(){for(let e of this.$$(".tab"))this.on(e,"click",()=>this.kies_(Number(e.dataset.i)));this.teardown_.push(R(this.$(".card"))),this.kies_(dl(this.config,this.config.tabs,this.opslag_()),!1)}paint(){}opslag_(){try{return window.localStorage}catch{return null}}kies_(e,t=!0){let n=this.config.tabs;if(!n.length)return;let a=Math.min(Math.max(0,e),n.length-1);this.open_=a;for(let r of this.$$(".tab"))r.setAttribute("aria-selected",String(Number(r.dataset.i)===a));for(let r of this.$$(".vak"))r.dataset.open=String(Number(r.dataset.i)===a);t&&ll(this.opslag_(),er(n),a),this.bouw_(a)}async bouw_(e){if(this.kinderen_.has(e)){O(this.$(".card"));return}let t=this.$(`.vak[data-i="${e}"]`),n=this.config.tabs[e];if(!(!t||!n)){if(!n.cards.length){let a=document.createElement("div");a.className="leeg",a.textContent="Deze tab heeft nog geen kaart.",t.replaceChildren(a),O(this.$(".card")),this.knopLater_(e);return}this.kinderen_.set(e,null);try{if(!await window.loadCardHelpers?.())throw new Error("loadCardHelpers ontbreekt");let r=jl(this),o=!!r,s=n.cards.map(l=>{let d=document.createElement("hui-card");return d.hass=this.hass,d.preview=o,d.config=l,Kt(d,l?.grid_options),d});if(this.kinderen_.set(e,s),r&&Fn()){t.replaceChildren(vl({hass:this.hass,kaarten:n.cards,maakKaart:(l,d)=>s[d]??null,opActie:(l,d)=>r.uitVoorbeeld?.(e,l,d)}),this.voegToeKnop_(e)),O(this.$(".card"));return}t.replaceChildren(...s),O(this.$(".card")),this.herijkIndeling_()}catch(a){this.kinderen_.delete(e),t.innerHTML=`<div class="leeg">Deze kaart kon niet geladen worden: ${j(a?.message??a)}</div>`,O(this.$(".card"))}}}herijkIndeling_(e=3){let t=!1;for(let[n,a]of this.kinderen_.entries()){if(!a)continue;let r=this.config?.tabs?.[n]?.cards??[];a.forEach((o,s)=>{let l=gl(o);l&&(t=!0),Kt(o,r[s]?.grid_options,l)})}!t&&e>0&&requestAnimationFrame(()=>this.herijkIndeling_(e-1))}knopLater_(e,t=60){let n=this.$(`.vak[data-i="${e}"]`);if(!n||n.querySelector(".voegtoe")||this.config?.tabs?.[e]?.cards?.length)return;if(this.inVoorbeeld_()){n.appendChild(this.voegToeKnop_(e)),O(this.$(".card"));return}if(t<=0)return;let a=setTimeout(()=>this.knopLater_(e,t-1),50);this.teardown_.push(()=>clearTimeout(a))}inVoorbeeld_(){for(let e of zl(this))if(e.tagName?.toLowerCase?.()==="hui-dialog-edit-card")return!0;return!1}voegToeKnop_(e){let t=document.createElement("button");return t.type="button",t.className="voegtoe",t.textContent="\uFF0B  Kaart toevoegen",t.addEventListener("click",n=>{n.stopPropagation(),jl(this)?.uitVoorbeeld?.(e,"toevoegen",{})}),t}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-tabs-card-editor")}static getStubConfig(){return{tabs:[{name:"Woning",icon:"house",card:null},{name:"Weer",icon:"cloudSun",card:null}]}}};_(Zn,"css",`
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
  `);N("domotiapp-tabs-card",Zn,{name:"DomotiApp Tabbladen",description:"Meerdere kaarten achter tabbladen, met een rij knoppen erboven. De gekozen tab wordt per apparaat onthouden."});var U={UIT:"uit",KLAAR:"klaar",UITGESTELD:"uitgesteld",DRAAIT:"draait",PAUZE:"pauze",AF:"af",FOUT:"fout",ONBEKEND:"onbekend"},Sh=[[U.FOUT,["error","fout","aborting","afgebroken"]],[U.DRAAIT,["run","active","washing","drying","rinsing","bezig","draait","on"]],[U.PAUZE,["pause","paused","pauze","onderbroken"]],[U.UITGESTELD,["delayedstart","delayed","scheduled","uitgesteld","wachten"]],[U.AF,["finished","complete","done","klaar met","afgelopen"]],[U.KLAAR,["ready","idle","standby","klaar","gereed"]],[U.UIT,["off","inactive","uit"]]],Nh=new Set([U.DRAAIT]);function El(i){let e=String(i??"").toLowerCase().trim();if(!e||e==="unknown"||e==="unavailable")return U.ONBEKEND;let t=e.split(/[^a-z0-9]+/).filter(Boolean);for(let[n,a]of Sh)for(let r of a)if(r.includes(" ")?e.includes(r):t.includes(r))return n;return U.ONBEKEND}var Al=i=>Nh.has(El(i?.state));function Ml(i,e=new Date){if(!i)return null;let t=String(i.state??"").trim();if(!t||t==="unknown"||t==="unavailable")return null;let n=i.attributes??{};if(n.device_class==="timestamp"||/^\d{4}-\d{2}-\d{2}[T ]/.test(t)){let s=new Date(t);return Number.isNaN(+s)?null:Math.max(0,Math.round((s-e)/6e4))}let a=t.match(/^(\d{1,3}):(\d{2})(?::(\d{2}))?$/);if(a)return Number(a[1])*60+Number(a[2])+(a[3]?Math.round(Number(a[3])/60):0);let r=Number(t);if(!Number.isFinite(r))return null;let o=String(n.unit_of_measurement??"min").toLowerCase();return o.startsWith("s")?Math.round(r/60):o.startsWith("h")||o.startsWith("u")?Math.round(r*60):Math.round(r)}function $l(i){if(i==null)return"";if(i<=0)return"Klaar";if(i<60)return`nog ${i} min`;let e=Math.floor(i/60),t=i%60;return t?`nog ${e} u ${t} min`:`nog ${e} uur`}function Sl(i){if(!i)return null;let e=String(i.state??"").trim();if(!e||e==="unknown"||e==="unavailable")return null;let t=Number(e);return Number.isFinite(t)?Math.min(100,Math.max(0,Math.round(t))):null}var Th=i=>!!i&&i.state==="on",Nl=i=>i===U.DRAAIT||i===U.PAUZE||i===U.UITGESTELD;function Tl({status:i,deur:e,rest:t,pct:n}={}){let a=El(i?.state),r=Th(e);if(a===U.DRAAIT){let o=[];return t!=null?o.push($l(t)):n!=null&&o.push(`${n}%`),{soort:a,tekst:o.length?`Draait \xB7 ${o.join(" ")}`:"Draait",tone:"accent",waarschuwing:""}}return a===U.PAUZE?{soort:a,tekst:"Gepauzeerd",tone:"warn",waarschuwing:r?"Klep open":""}:a===U.FOUT?{soort:a,tekst:"Storing",tone:"bad",waarschuwing:r?"Klep open":""}:a===U.AF?{soort:a,tekst:"Programma klaar",tone:"good",waarschuwing:""}:a===U.UITGESTELD?{soort:a,tekst:t!=null?`Start over ${$l(t).replace(/^nog /,"")}`:"Uitgestelde start",tone:"accent",waarschuwing:r?"Klep open":""}:r?{soort:a,tekst:"Klep open",tone:"warn",waarschuwing:""}:a===U.UIT?{soort:a,tekst:"Uit",tone:"neutral",waarschuwing:""}:a===U.KLAAR?{soort:a,tekst:"Klaar om te starten",tone:"neutral",waarschuwing:""}:{soort:U.ONBEKEND,tekst:"Niet bereikbaar",tone:"neutral",waarschuwing:""}}function Ol(i){let e=String(i??"");switch(e.split(".")[0]){case"button":return["button","press",{entity_id:e}];case"input_button":return["input_button","press",{entity_id:e}];case"script":return["script","turn_on",{entity_id:e}];case"scene":return["scene","turn_on",{entity_id:e}];case"switch":case"input_boolean":return["homeassistant","turn_on",{entity_id:e}];case"automation":return["automation","trigger",{entity_id:e}];default:return null}}var Oh={good:E.good,warn:E.warn,bad:E.bad,neutral:E.neutral,accent:E.accent},Xn=class extends S{validate(e){let t={name:"",icon:"dishwasher",...e};return!t.status&&!t.remaining&&!t.progress&&!t.program&&(t[C]="Kies minstens een statussensor. Resterende tijd, voortgang, programma en de knoppen mogen daarna."),t}watched(){return[this.config.status,this.config.remaining,this.config.progress,this.config.program,this.config.door,this.config.smart,this.config.start,this.config.stop].filter(Boolean)}template(){this.config.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size";let t=(n,a,r)=>`
      <button type="button" class="knop ${n}" hidden>
        ${b(a)}<span class="lb">${j(r)}</span>
      </button>`;return`
      <div class="card surface" style="--tone:${E.accent}">
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
      </div>`}wire(){let e=this.config;this.on(this.$(".top"),"click",()=>{let t=e.status||e.remaining||e.program;t&&this.moreInfo_(t)}),this.on(this.$(".knop.start"),"click",()=>this.druk_(e.start)),this.on(this.$(".knop.stop"),"click",()=>this.druk_(e.stop)),this.on(this.$(".knop.slim"),"click",()=>{if(!e.smart)return;let t=X(v(this.hass,e.smart));this.hass.callService("homeassistant",t?"turn_off":"turn_on",{entity_id:e.smart})}),this.on(this.$(".rij.programma"),"change",t=>{let n=t.target?.closest?.(".keuze");if(!n||!e.program)return;t.stopPropagation();let a=pt(e.program,n.value,be(v(this.hass,e.program)));a&&this.hass.callService(a[0],a[1],a[2])}),this.teardown_.push(R(this.$(".card")))}moreInfo_(e){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0}))}druk_(e){let t=Ol(e);t&&this.hass.callService(t[0],t[1],t[2])}paint(){let e=this.config,t=v(this.hass,e.status),n=v(this.hass,e.door),a=Ml(v(this.hass,e.remaining)),r=Sl(v(this.hass,e.progress)),o=Tl({status:t,deur:n,rest:a,pct:r}),s=Al(t);this.toggleAttribute("draait",s),this.toggleAttribute("onbekend",s&&r==null);let l=this.$(".top"),d=Oh[o.tone]??E.accent;this.$(".card").style.setProperty("--tone",d),l.classList.toggle("unavailable",o.soort==="onbekend");let c=this.$(".chip"),p=e.icon||"dishwasher";c.dataset.icon!==p&&(c.dataset.icon=p,c.innerHTML=b(p,"dishwasher")),c.style.setProperty("--tone",d),this.text(".nm",e.name||M(this.hass,e.status,null)||"Vaatwasser");let h=this.$(".st"),g=j(o.tekst),f=o.waarschuwing?` &middot; <span class="let">${j(o.waarschuwing)}</span>`:"";h.dataset.tekst!==g+f&&(h.dataset.tekst=g+f,h.innerHTML=g+f),l.setAttribute("aria-label",`${this.$(".nm").textContent}, ${o.tekst}`);let k=this.$(".balk"),x=Nl(o.soort)&&(r!=null||s);if(k.hidden=!x,x){let $=this.$(".vul"),w=r!=null?`${r}%`:"";w&&$.style.width!==w&&($.style.width=w),k.setAttribute("role","progressbar"),r!=null?(k.setAttribute("aria-valuenow",String(r)),k.setAttribute("aria-valuemin","0"),k.setAttribute("aria-valuemax","100")):k.removeAttribute("aria-valuenow")}this.paintBediening_(),O(this.$(".card"))}paintBediening_(){let e=this.config,t=this.$(".programslot"),n=v(this.hass,e.program),a=e.program?be(n):[],r=a.map(d=>zn(d,this.hass?.formatEntityState?.(n,d))),o=JSON.stringify([a,r]);t.dataset.opties!==o&&(t.dataset.opties=o,t.innerHTML=a.length?`<select class="keuze" aria-label="Programma">${a.map((d,c)=>`<option value="${j(d)}">${j(r[c])}</option>`).join("")}</select>`:"");let s=t.querySelector(".keuze");if(s&&this.shadowRoot.activeElement!==s){let d=ct(n);s.value!==d&&(s.value=d)}let l=this.$(".knop.slim");l.hidden=!e.smart,e.smart&&(l.dataset.aan=String(X(v(this.hass,e.smart)))),this.$(".knop.start").hidden=!e.start,this.$(".knop.stop").hidden=!e.stop,this.$(".rij.programma").hidden=!s,this.$(".rij.knoppen").hidden=!e.smart&&!e.start&&!e.stop}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-dishwasher-card-editor")}static getStubConfig(e,t){return{status:((a,r)=>t?.find(o=>o.startsWith(a)&&r.test(o))??"")("sensor.",/vaatwas|dishwash/i),name:"Vaatwasser"}}};_(Xn,"css",`
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
  `);var ar=class extends D{defaults(){return{icon:"dishwasher"}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"dishwasher",auto:!1}]}schema(){return[{name:"name",selector:m.text()},{name:"status",selector:m.entity(["sensor","binary_sensor"])},{name:"remaining",selector:m.entity(["sensor"])},{name:"progress",selector:m.entity(["sensor","number"])},{name:"program",selector:m.entity(["select","input_select"])},{name:"start",selector:m.entity(["button","input_button","script","switch","automation"])},{name:"stop",selector:m.entity(["button","input_button","script","switch","automation"])},{name:"door",selector:m.entity(["binary_sensor"])},{name:"smart",selector:m.entity(["input_boolean","switch"])}]}label(e){return{name:"Naam",status:"Statussensor",remaining:"Resterende tijd",progress:"Voortgang (0-100%)",program:"Programmakeuze",start:"Start / pauze",stop:"Stop",door:"Klep- of deursensor",smart:"Slimme sturing"}[e.name]??super.label(e)}helper(e){return{status:"De sensor die Run, Ready, Finished of iets in die geest meldt. De kaart vertaalt dat zelf.",remaining:"Een tijdstip, een aantal minuten of een klok als 1:24:00 \u2014 alle drie worden gelezen. Een tijdstip is het moment waarop hij klaar is, geen duur.",progress:"Zonder deze sensor is er geen stand, en schuift er een streepje heen en weer zolang hij draait.",program:"Een keuzelijst met de programma's. Verschijnt als uitklaplijst op de kaart.",start:"Een knop, een script of een schakelaar \u2014 de kaart kiest zelf de juiste service.",stop:"Idem. Deze knop is rood, want hij onderbreekt iets dat loopt.",door:"Staat de klep open, dan zegt de kaart dat in plaats van 'klaar om te starten'.",smart:"De input_boolean van je eigen slimme sturing. De knop licht op als hij aanstaat."}[e.name]}};H("domotiapp-dishwasher-card-editor",ar);N("domotiapp-dishwasher-card",Xn,{name:"DomotiApp Vaatwasser",description:"Status, resterende tijd met voortgangsbalk, programmakeuze en de knoppen \u2014 met een balk die loopt zolang hij draait."});function Dh(i,e,t,{live:n=!1,fit:a="cover"}={}){if(!t)return null;let r=typeof customElements<"u"&&customElements.get("hui-image"),o=r?"hui-image":"img",s=i;if((!s||s.localName!==o)&&(s=document.createElement(o),s.className="beeld"),r){let l=n?"live":"auto";s.cameraImage!==t&&(s.cameraImage=t),s.cameraView!==l&&(s.cameraView=l),s.fitMode!==a&&(s.fitMode=a),s.hass=e}else{let l=e?.states?.[t],d=l?.attributes?.entity_picture;d&&s.dataset.bron!==d&&(s.dataset.bron=d,s.src=d),s.alt=l?.attributes?.friendly_name??t,s.style.objectFit=a}return s}function Yn(i,e,t,n){if(!i)return null;let a=i.querySelector(".beeld"),r=Dh(a,e,t,n);return r?(r!==a&&(a?.remove(),i.appendChild(r)),r):(a?.remove(),null)}var ir={idle:{woord:"Klaar voor gebruik",toon:"neutral"},printing:{woord:"Aan het printen",toon:"accent"},paused:{woord:"Gepauzeerd",toon:"warn"},finished:{woord:"Klaar",toon:"good"},failed:{woord:"Mislukt",toon:"bad"},offline:{woord:"Offline",toon:"neutral"},prepare:{woord:"Voorbereiden",toon:"accent"},unknown:{woord:"Onbekend",toon:"neutral"}},Lh={idle:["idle","operational","standby","ready","on","off"],printing:["printing","running","run","print","busy","active"],paused:["pause","paused","pausing"],finished:["finish","finished","complete","completed","done","success"],failed:["failed","fail","error","cancelled","canceled","stopped"],prepare:["prepare","preparing","heating","slicing","init"],offline:["offline","unavailable","unknown","disconnected"]};function rr(i){let e=String(i?.state??"").trim().toLowerCase();if(!e)return"unknown";if(e==="unavailable"||e==="none")return"offline";for(let[t,n]of Object.entries(Lh))if(n.includes(e))return t;return"unknown"}function Qn(i){let e=rr(i);return e==="printing"||e==="prepare"}function or(i){let e=Number(i?.state);return Number.isFinite(e)?Math.max(0,Math.min(100,Math.round(e))):null}function sr(i){let e=Number(i?.state);return Number.isFinite(e)?{waarde:Math.round(e),eenheid:i?.attributes?.unit_of_measurement??"\xB0C"}:null}function lr(i,e=Date.now()){let t=String(i?.state??"").trim();if(!t||t==="unavailable"||t==="unknown")return null;if(i?.attributes?.device_class==="timestamp"||/[T ]\d{2}:\d{2}/.test(t)){let o=Date.parse(t);if(Number.isFinite(o))return Math.max(0,Math.round((o-e)/6e4))}if(/^\d+:\d{2}(:\d{2})?$/.test(t)){let o=t.split(":").map(Number),[s,l]=o.length===3?o:[0,o[0]];return s*60+l}let a=Number(t);if(!Number.isFinite(a))return null;let r=String(i?.attributes?.unit_of_measurement??"").toLowerCase();return r==="h"||r==="u"||r.startsWith("hour")?Math.round(a*60):r==="s"||r.startsWith("sec")?Math.round(a/60):Math.round(a)}function dr(i){if(i==null)return"";let e=Math.max(0,Math.round(i));return e<60?`${e} min`:`${Math.floor(e/60)} u ${String(e%60).padStart(2,"0")}`}function cr(i,e=new Date){if(i==null)return"";let t=new Date(e.getTime()+i*6e4);return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}var Ch=new Set(["unknown","unavailable","none","null","empty","leeg","off","unload","unloaded"]);function Qe(i,{namen:e=!1}={}){if(typeof i!="string")return null;let t=i.trim();if(!t)return null;let n=t.replace(/^#/,"");return/^[0-9a-f]{8}$/i.test(n)?parseInt(n.slice(6),16)<16?null:`#${n.slice(0,6).toUpperCase()}`:/^[0-9a-f]{6}$/i.test(n)?`#${n.toUpperCase()}`:/^[0-9a-f]{3}$/i.test(n)?`#${n.toUpperCase()}`:/^rgba?\(/i.test(t)?t:!e||Ch.has(t.toLowerCase())?null:/^[a-z]+$/i.test(t)?t:null}function Dl(i,e={}){let t=i?.attributes??{},n=Qe(e.color,{namen:!0})??Qe(t.color)??Qe(Array.isArray(t.cols)?t.cols[0]:t.cols)??Qe(t.filament_color)??Qe(t.tray_color)??(/^#?[0-9a-f]{3,8}$/i.test(String(i?.state??""))?Qe(i.state):null)??null,a=e.label||t.type||t.filament_type||t.tray_type||t.name||(i&&!Qe(i.state)?i.state:"")||"",r=t.empty===!0||t.empty==="true"?!0:!n&&!String(a).trim(),o=Number(t.remain??t.remaining),s=t.remain_enabled!==!1&&!r;return{kleur:r?null:n,soort:String(a).trim(),leeg:r,actief:t.active===!0||t.active==="true",rest:s&&Number.isFinite(o)&&o>=0&&o<=100?Math.round(o):null}}var bt=[1,2,3,4],Hh={good:E.good,warn:E.warn,bad:E.bad,neutral:E.neutral,accent:E.accent},Jn=class extends S{validate(e){let t={name:"",icon:"printer3d",...e};return t.status||t.progress||t.camera||t.image||t.nozzle_temp||t.bed_temp||t.power||(t[C]="Kies minstens een printstatus. Camera, voortgang, temperaturen, de deur en de trays van de AMS mogen daarna."),t}watched(){let e=this.config;return[e.status,e.progress,e.remaining,e.nozzle_temp,e.bed_temp,e.door,e.power,e.camera,e.image,...bt.map(t=>e[`tray_${t}`])].filter(Boolean)}beeldSoort_(){let e=this.config;return e.camera&&e.image?this.beeld_??(Qn(v(this.hass,e.status))?"camera":"image"):e.camera?"camera":e.image?"image":null}template(){return this.config.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size",`
      <div class="card surface" style="--tone:${E.accent}">
        <div class="kop">
          <button class="ico" type="button" aria-label="Meer info"></button>
          <span class="tekst">
            <span class="nm"></span>
            <span class="st"></span>
          </span>
          <button class="aanuit" type="button" aria-pressed="false"
                  aria-label="Printer aan of uit" hidden>${b("power")}</button>
        </div>

        <div class="beeldvak" hidden>
          <button class="wissel" type="button" hidden></button>
        </div>

        <div class="voort" hidden>
          <div class="balk"><i></i></div>
          <div class="voortregel">
            <span class="pct"></span>
            <span class="rest"></span>
          </div>
        </div>

        <div class="tegels" hidden></div>

        <div class="ams" hidden>
          <span class="kopje">AMS</span>
          <div class="rij"></div>
        </div>
      </div>`}wire(){let e=this.config;this.teardown_.push(R(this.$(".card"))),this.on(this.$(".ico"),"click",()=>P(this,e.status||e.power||e.camera||e.progress));let t=this.$(".aanuit");this.on(t,"click",a=>{a.stopPropagation(),this.schakel_()});let n=this.$(".wissel");this.on(n,"click",a=>{a.stopPropagation(),this.beeld_=this.beeldSoort_()==="camera"?"image":"camera",this.paint()}),this.on(this.$(".beeldvak"),"click",a=>{if(a.target.closest(".wissel"))return;let r=this.beeldSoort_()==="camera"?e.camera:e.image;r&&P(this,r)})}async schakel_(){let e=this.config.power;if(!e)return;let t=v(this.hass,e),n=X(t),a=String(e).split(".")[0];if(n){let r=or(v(this.hass,this.config.progress)),o=Qn(v(this.hass,this.config.status));if(!await Ae({title:"Printer uitzetten?",text:o?`Er loopt een print${r===null?"":` (${r}% klaar)`}. Uitzetten breekt hem af, en dat is niet terug te draaien.`:"Weet je zeker dat je de printer wilt uitzetten?",confirmText:"Uitzetten",dismissText:"Aan laten"}))return}this.hass.callService(a,n?"turn_off":"turn_on",{entity_id:e})}paint(){let e=this.config,t=v(this.hass,e.status),n=rr(t),a=ir[n]??ir.unknown,r=Qn(t),o=e.status&&(!t||t.state==="unavailable");this.toggleAttribute("dead",!!o),this.toggleAttribute("loopt",r&&!o),this.$(".card").style.setProperty("--tone",Hh[a.toon]??E.accent),this.$(".ico").innerHTML=b(e.icon||"printer3d"),this.text(".nm",e.name||M(this.hass,e.status||e.power||e.camera,"3D-printer"));let s=String(t?.state??"").trim(),l=n==="unknown"&&s&&s.toLowerCase()!=="unknown",d=`<b>${this.veilig_(l?s:a.woord)}</b>${this.bijzin_()}`,c=this.$(".st");c.innerHTML!==d&&(c.innerHTML=d),this.paintAanUit_(),this.paintBeeld_(r),this.paintVoortgang_(r),this.paintTegels_(),this.paintAms_(),O(this.$(".card"))}bijzin_(){let e=lr(v(this.hass,this.config.remaining));return e===null||e<=0?"":` \xB7 nog ${this.veilig_(dr(e))}, klaar om ${this.veilig_(cr(e))}`}paintAanUit_(){let e=this.$(".aanuit"),t=this.config.power;if(e.hidden=!t,!t)return;let n=X(v(this.hass,t));e.setAttribute("aria-pressed",String(n)),e.setAttribute("aria-label",n?"Printer uitzetten":"Printer aanzetten")}paintBeeld_(e){let t=this.config,n=this.$(".beeldvak"),a=this.beeldSoort_();if(n.hidden=!a,!a)return;let r=this.$(".wissel");if(r.hidden=!(t.camera&&t.image),!r.hidden){let d=a==="camera"?"Voorbeeld":"Camera";r.innerHTML=`${b(a==="camera"?"grid":"camera")}<span>${d}</span>`,r.setAttribute("aria-label",`Toon ${d.toLowerCase()}`)}if(a==="camera"){Yn(n,this.hass,t.camera,{live:t.live_view===!0||e}),n.querySelector(".leeg")?.remove();return}n.querySelector("hui-image")?.remove();let s=v(this.hass,t.image)?.attributes?.entity_picture,l=n.querySelector("img.beeld");if(s)l||(l=document.createElement("img"),l.className="beeld",l.alt="Wat de printer aan het maken is",n.appendChild(l)),l.dataset.bron!==s&&(l.dataset.bron=s,l.src=s),n.querySelector(".leeg")?.remove();else if(l?.remove(),!n.querySelector(".leeg")){let d=document.createElement("span");d.className="leeg",d.textContent="Nog geen voorbeeld",n.appendChild(d)}}paintVoortgang_(e){let t=this.config,n=this.$(".voort"),a=or(v(this.hass,t.progress)),r=lr(v(this.hass,t.remaining));if(n.hidden=a===null&&!e,n.hidden)return;let o=this.$(".balk");o.dataset.onbekend=String(a===null),o.querySelector("i").style.setProperty("--pct",`${a??0}%`),this.text(".pct",a===null?"Bezig":`${a}%`),this.text(".rest",r===null||r<=0?"":`nog ${dr(r)} \xB7 klaar om ${cr(r)}`)}paintTegels_(){let e=this.config,t=this.$(".tegels"),n=[],a=sr(v(this.hass,e.nozzle_temp));a&&n.push({w:`${a.waarde}${a.eenheid}`,l:"Nozzle"});let r=sr(v(this.hass,e.bed_temp));r&&n.push({w:`${r.waarde}${r.eenheid}`,l:"Bed"});let o=v(this.hass,e.door);if(o){let l=X(o);n.push({w:l?"Open":"Dicht",l:"Deur",let:l})}if(t.hidden=!n.length,!n.length)return;t.style.setProperty("--kolommen",String(n.length));let s=n.map(l=>`${l.w}|${l.l}|${l.let??""}`).join(",");t.dataset.sig!==s&&(t.dataset.sig=s,t.innerHTML=n.map(l=>`<div class="tegel" data-let="${!!l.let}"><span class="w">${this.veilig_(l.w)}</span><span class="l">${this.veilig_(l.l)}</span></div>`).join(""))}paintAms_(){let e=this.config,t=this.$(".ams"),n=bt.filter(l=>e[`tray_${l}`]||e[`tray_${l}_color`]);if(t.hidden=!n.length,!n.length)return;let a=this.$(".ams .rij"),r=bt.map(l=>Dl(v(this.hass,e[`tray_${l}`]),{color:e[`tray_${l}_color`],label:e[`tray_${l}_label`]})),o=bt.map(l=>v(this.hass,e[`tray_${l}`])?.attributes?.name??""),s=r.map(l=>`${l.kleur}|${l.soort}|${l.leeg}|${l.actief}|${l.rest}`).join(",");a.dataset.sig!==s&&(a.dataset.sig=s,a.innerHTML=r.map((l,d)=>{let c=o[d],p=`Tray ${d+1}`+(l.leeg?": leeg":c||l.soort?`: ${c||l.soort}`:"")+(l.rest===null?"":` \u2014 nog ${l.rest}%`)+(l.actief?" (in gebruik)":"");return`<div class="tray" data-leeg="${l.leeg}" data-actief="${l.actief}" style="--kleur:${l.kleur??"transparent"}" title="${this.veilig_(p)}"><span class="vlak">${l.rest===null?"":`<i style="--rest:${l.rest}%"></i>`}</span><span class="txt"><span class="nr">Tray ${d+1}</span><span class="so">${this.veilig_(l.leeg?"leeg":l.soort||"gevuld")}</span></span></div>`}).join(""))}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}getCardSize(){return this.config?.camera||this.config?.image?6:3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-printer-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>/^sensor\./.test(a)&&/(print|stage|status)/i.test(a));return n?{status:n}:{}}};_(Jn,"css",`
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }

    .card {
      min-height: var(--dac-raster, 120px); padding: 10px 12px;
      display: flex; flex-direction: column; gap: 9px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ---- kop ---- */
    .kop { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .ico {
      width: 38px; height: 38px; flex: 0 0 auto; display: grid; place-items: center;
      border-radius: var(--dac-radius-sm); cursor: pointer;
      background: color-mix(in srgb, var(--tone) 16%, transparent);
      border: 1px solid color-mix(in srgb, var(--tone) 34%, transparent);
      color: var(--tone);
    }
    .ico .icon, .ico ha-icon { width: 20px; height: 20px; --mdc-icon-size: 20px; }
    /* Alleen zolang er iets loopt. Een printer die klaar is hoort stil te staan;
       zie de kop van dishwasher-card.js voor dezelfde afweging. */
    :host([loopt]) .ico {
      animation: pols 2.4s ease-in-out infinite;
    }
    @keyframes pols {
      0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--tone) 38%, transparent); }
      50% { box-shadow: 0 0 12px 1px color-mix(in srgb, var(--tone) 30%, transparent); }
    }
    @media (prefers-reduced-motion: reduce) { :host([loopt]) .ico { animation: none; } }

    .tekst { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
    .nm {
      font-size: 14px; font-weight: 600; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11.5px; line-height: 1.3; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st b { color: var(--tone); font-weight: 500; }

    /* De schakelaar. Een echte knop en geen vinkje: dit is een apparaat dat je
       aanzet, geen instelling die je aanvinkt. */
    .aanuit {
      flex: 0 0 auto; width: 40px; height: 34px; display: grid; place-items: center;
      cursor: pointer; padding: 0; font: inherit;
      background: var(--dac-surface); color: var(--dac-ink-3);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      transition: color 180ms ease, border-color 180ms ease, background 180ms ease;
    }
    .aanuit[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
      background: color-mix(in srgb, var(--dac-accent) 18%, transparent);
    }
    .aanuit .icon { width: 17px; height: 17px; }
    @media (hover: hover) { .aanuit:hover { border-color: var(--dac-border-hi); } }
    .aanuit[hidden] { display: none; }

    /* ---- beeld ---- */
    .beeldvak {
      position: relative; width: 100%; overflow: hidden;
      border-radius: var(--dac-radius-sm); background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      aspect-ratio: 16 / 9;
    }
    .beeldvak[hidden] { display: none; }
    .beeldvak .beeld, .beeldvak img, .beeldvak hui-image {
      display: block; width: 100%; height: 100%; object-fit: cover;
    }
    .beeldvak .leeg {
      position: absolute; inset: 0; display: grid; place-items: center;
      font-size: 12px; color: var(--dac-ink-3);
    }
    .wissel {
      position: absolute; right: 8px; top: 8px; z-index: 2;
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 9px; cursor: pointer; font: inherit; font-size: 11px; font-weight: 500;
      color: var(--dac-ink); border: 1px solid var(--dac-border-hi);
      border-radius: var(--dac-radius-pill);
      background: color-mix(in srgb, var(--dac-bg) 72%, transparent);
      backdrop-filter: blur(8px);
    }
    .wissel .icon { width: 13px; height: 13px; }
    .wissel[hidden] { display: none; }

    /* ---- voortgang ---- */
    .voort { display: flex; flex-direction: column; gap: 5px; }
    .voort[hidden] { display: none; }
    .balk {
      position: relative; height: 6px; border-radius: 3px; overflow: hidden;
      background: var(--dac-surface-hi);
    }
    .balk i {
      display: block; height: 100%; width: var(--pct, 0%);
      background: var(--tone); border-radius: 3px;
      transition: width 400ms ease;
    }
    /* Zonder voortgangssensor loopt er een streepje heen en weer: er gebeurt
       iets, maar we weten niet hoeveel. Hetzelfde als bij de vaatwasser. */
    .balk[data-onbekend="true"] i {
      width: 32%; animation: schuif 2.2s ease-in-out infinite;
    }
    @keyframes schuif { 0% { margin-left: -32% } 100% { margin-left: 100% } }
    @media (prefers-reduced-motion: reduce) {
      .balk[data-onbekend="true"] i { animation: none; margin-left: 0; }
    }
    .voortregel {
      display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
      font-size: 11.5px; color: var(--dac-ink-3); font-variant-numeric: tabular-nums;
    }
    .voortregel .pct { font-size: 13px; font-weight: 600; color: var(--dac-ink); }

    /* ---- tegels ---- */
    .tegels { display: grid; grid-template-columns: repeat(var(--kolommen, 3), minmax(0, 1fr)); gap: 7px; }
    .tegels[hidden] { display: none; }
    .tegel {
      display: flex; flex-direction: column; align-items: center; gap: 1px;
      padding: 7px 5px; min-width: 0;
      background: rgba(255,255,255,.038); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
    }
    .tegel .w {
      font-size: 14px; font-weight: 500; letter-spacing: -.01em;
      font-variant-numeric: tabular-nums; color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
    }
    .tegel .l {
      font-size: 10px; line-height: 1.2; color: var(--dac-ink-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
    }
    .tegel[data-let="true"] .w { color: var(--dac-warn); }

    /* ---- de AMS ---- */
    .ams { display: flex; align-items: center; gap: 7px; }
    .ams[hidden] { display: none; }
    .ams .kopje {
      font-size: 10px; color: var(--dac-ink-3); flex: 0 0 auto;
      writing-mode: horizontal-tb;
    }
    .ams .rij { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; flex: 1 1 auto; }
    .tray {
      display: flex; align-items: center; gap: 6px; min-width: 0;
      padding: 5px 7px; border-radius: var(--dac-radius-sm);
      background: rgba(255,255,255,.038); border: 1px solid var(--dac-border);
    }
    .tray .vlak {
      width: 15px; height: 15px; flex: 0 0 auto; border-radius: 4px;
      background: var(--kleur, transparent);
      border: 1px solid rgba(255,255,255,.22);
      box-shadow: inset 0 0 0 1px rgba(0,0,0,.28);
    }
    /* Leeg is een streepje en geen zwart vlakje: zwart filament bestaat, "niets"
       hoort daar niet op te lijken. */
    .tray[data-leeg="true"] .vlak {
      background: repeating-linear-gradient(
        -45deg, transparent 0 3px, var(--dac-border-hi) 3px 4px
      );
    }
    .tray .txt { min-width: 0; display: flex; flex-direction: column; }
    .tray .nr { font-size: 9.5px; color: var(--dac-ink-3); line-height: 1.1; }
    .tray .so {
      font-size: 11px; color: var(--dac-ink-2); line-height: 1.2;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    /* Hoeveel er nog op de rol zit, als een streepje onder het kleurvlakje.
       Een getal erbij zou vier keer op een rij staan en de rij onleesbaar
       maken; een streepje lees je in \xE9\xE9n blik. Bambu meldt dit alleen als de
       rol een chip heeft (remain_enabled), dus het staat er niet altijd. */
    .tray .vlak { position: relative; }
    .tray .vlak i {
      position: absolute; left: 0; right: 0; bottom: -4px; height: 2px;
      border-radius: 1px; background: var(--dac-border-hi);
    }
    .tray .vlak i::after {
      content: ""; display: block; height: 100%; width: var(--rest, 0%);
      border-radius: 1px; background: var(--dac-ink-2);
    }
    /* De tray die de printer op dit moment gebruikt. E\xE9n rand, geen kleur:
       kleur is hier het filament en niet de toestand. */
    .tray[data-actief="true"] {
      border-color: var(--dac-accent-hi);
      background: color-mix(in srgb, var(--dac-accent) 14%, transparent);
    }

    :host([dead]) .card { opacity: .45; }

    /* Smal: de tegels onder elkaar in twee kolommen, en de trays zonder tekst.
       Op een telefoon is vier keer "PLA" naast elkaar toch niet te lezen. */
    @container (max-width: 340px) {
      .tegels { --kolommen: 2 !important; }
      .tray .txt { display: none; }
      .tray { justify-content: center; padding: 6px 4px; }
    }
  `);var pr=class extends D{defaults(){return{icon:"printer3d"}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"printer3d",auto:!1}]}schema(){return[{name:"name",selector:m.text()},{name:"status",selector:m.entity(["sensor","binary_sensor"])},{name:"power",selector:m.entity(["switch","input_boolean"])},{name:"progress",selector:m.entity(["sensor","number"])},{name:"remaining",selector:m.entity(["sensor"])},{name:"nozzle_temp",selector:m.entity(["sensor","number"])},{name:"bed_temp",selector:m.entity(["sensor","number"])},{name:"door",selector:m.entity(["binary_sensor"])},{name:"camera",selector:m.entity("camera")},{name:"live_view",selector:m.bool()},{name:"image",selector:m.entity(["image","camera"])},...bt.flatMap(e=>[{name:`tray_${e}`,selector:m.entity(["sensor","select","text"])},{name:`tray_${e}_color`,selector:m.text()},{name:`tray_${e}_label`,selector:m.text()}])]}label(e){let t={};for(let n of bt)t[`tray_${n}`]=`Tray ${n}`,t[`tray_${n}_color`]=`Tray ${n}: kleur met de hand`,t[`tray_${n}_label`]=`Tray ${n}: naam met de hand`;return{name:"Naam",status:"Printstatus",power:"Aan/uit-schakelaar",progress:"Printvoortgang (0-100%)",remaining:"Eindtijd of resterende tijd",nozzle_temp:"Nozzletemperatuur",bed_temp:"Bedtemperatuur",door:"Deur van de printer",camera:"Camera",live_view:"Altijd live beeld",image:"Voorbeeld van de print",...t}[e.name]??super.label(e)}helper(e){if(e.name==="status")return"De sensor die meldt wat hij doet. RUNNING, IDLE, FINISH, PAUSE en FAILED worden herkend, en die van Octoprint en Klipper ook.";if(e.name==="power")return"Zetten en uitzetten. Bij UITzetten vraagt de kaart eerst of je het zeker weet \u2014 en loopt er een print, dan staat erbij hoe ver hij was.";if(e.name==="remaining")return"Een aantal minuten, een klok als 1:24:00 of het tijdstip waarop hij klaar is: alle drie worden gelezen. De kaart toont beide \u2014 hoe lang nog \xE9n hoe laat.";if(e.name==="camera")return"Het live beeld van de printer. Staat er ook een voorbeeld ingesteld, dan komt er een knop om te wisselen.";if(e.name==="live_view")return"Normaal ververst het beeld een paar keer per minuut en gaat hij alleen echt live zolang er een print loopt. Met deze knop staat de stream altijd aan \u2014 mooier, maar het kost een verbinding die de hele dag openstaat.";if(e.name==="image")return"De `image`-entiteit met de plaat van wat hij aan het maken is.";if(e.name==="tray_1")return"De vier trays van de AMS. De kaart haalt de kleur en het soort filament uit de attributen van de entiteit; Bambu levert die als hexwaarde. Lukt dat niet, vul dan hieronder zelf een kleur in.";if(/^tray_\d_color$/.test(e.name))return"Alleen nodig als de entiteit zijn kleur niet meelevert. Een hexwaarde (#FF6B00) of een kleurnaam."}};H("domotiapp-printer-card-editor",pr);N("domotiapp-printer-card",Jn,{name:"DomotiApp 3D-printer",description:"Live camerabeeld of het voorbeeld, voortgang met eindtijd, temperaturen, de deur en de vier trays van de AMS met hun echte kleur."});var vt={fuel:{label:"Brandstof",icoon:"petrol"},hybrid:{label:"Hybride",icoon:"leaf"},electric:{label:"Elektrisch",icoon:"bolt"}},hr=i=>i==="electric"||i==="hybrid",ur=i=>i==="fuel"||i==="hybrid",Rh=["charging","charge","fast_charging","dc_charging","on","true","laden"],Vh=["complete","completed","fully_charged","full","done","finished"],Ih=["connected","plugged","plugged_in","cable_connected","ready_to_charge"],Ph=["not_plugged_in","not_plugged","notpluggedin","unplugged","disconnected","not_charging","notcharging","off","false","idle","no"];function Ll(i){let e=String(i?.state??"").trim().toLowerCase();return!e||e==="unavailable"||e==="unknown"?null:Rh.includes(e)?"charging":Vh.includes(e)?"complete":Ih.includes(e)?"connected":Ph.includes(e)?"idle":"onbekend"}function Cl(i,e){if(i&&i!=="onbekend")return ea[i]??"";let t=String(e?.state??"").trim();if(!t||t==="unavailable"||t==="unknown")return"";let n=t.replace(/[_-]+/g," ").toLowerCase();return n.charAt(0).toUpperCase()+n.slice(1)}var ea={charging:"Aan het laden",complete:"Volgeladen",connected:"Aan de lader",idle:"Niet aan de lader"};function mr(i,e){let t=Number(i?.state);if(!Number.isFinite(t))return null;let n=String(i?.attributes?.unit_of_measurement??"").toLowerCase(),a=Number(e);return n!=="%"&&Number.isFinite(a)&&a>0?Math.max(0,Math.min(100,Math.round(t/a*100))):Math.max(0,Math.min(100,Math.round(t)))}function Hl(i){let e=Number(i?.state);return Number.isFinite(e)?{waarde:Math.round(e),eenheid:i?.attributes?.unit_of_measurement??"km"}:null}function gr(i){if(i==null)return null;let e=i<=10?"bad":i<=20?"warn":"good";return{procent:i,toon:e}}function fr(i,e=Date.now()){let t=String(i?.state??"").trim();if(!t||t==="unavailable"||t==="unknown")return null;if(i?.attributes?.device_class==="timestamp"||/[T ]\d{2}:\d{2}/.test(t)){let r=Date.parse(t);if(Number.isFinite(r))return Math.max(0,Math.round((r-e)/6e4))}if(/^\d+:\d{2}(:\d{2})?$/.test(t)){let r=t.split(":").map(Number),[o,s]=r.length===3?r:[0,r[0]];return o*60+s}let n=Number(t);if(!Number.isFinite(n))return null;let a=String(i?.attributes?.unit_of_measurement??"").toLowerCase();return a==="h"||a.startsWith("hour")?Math.round(n*60):a==="s"||a.startsWith("sec")?Math.round(n/60):Math.round(n)}function br(i){if(i==null)return"";let e=Math.max(0,Math.round(i));return e<60?`${e} min`:`${Math.floor(e/60)} u ${String(e%60).padStart(2,"0")}`}function Rl({open:i,slot:e,laden:t,laadMinuten:n,radius:a,aandrijving:r}){if(i)return{tekst:"Er staat iets open",toon:"warn"};if(e==="unlocked")return{tekst:"Niet op slot",toon:"warn"};if(t==="charging"){let o=n?` \xB7 nog ${br(n)}`:"";return{tekst:`${ea.charging}${o}`,toon:"accent"}}return t==="complete"?{tekst:ea.complete,toon:"good"}:t==="connected"?{tekst:ea.connected,toon:"neutral"}:a?{tekst:`Nog ${a.waarde} ${a.eenheid}`,toon:"neutral"}:{tekst:vt[r]?.label??"",toon:"neutral"}}var Bh=100,Kh=["home","thuis","at_home","athome"],Gh=["not_home","away","afwezig","weg","not home","nothome"];function Wh(i,e,t,n){let r=d=>d*Math.PI/180,o=r(t-i),s=r(n-e),l=Math.sin(o/2)**2+Math.cos(r(i))*Math.cos(r(t))*Math.sin(s/2)**2;return 2*6371e3*Math.asin(Math.min(1,Math.sqrt(l)))}function Uh(i){let e=i?.attributes??{},t=Number(e.latitude??e.lat),n=Number(e.longitude??e.lon??e.lng);if(Number.isFinite(t)&&Number.isFinite(n))return{lat:t,lon:n};let a=String(i?.state??""),r=a.match(/(?:lat|latitude)["']?\s*[:=]\s*(-?\d+(?:\.\d+)?)/i),o=a.match(/(?:lon|lng|longitude)["']?\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);return r&&o?{lat:Number(r[1]),lon:Number(o[1])}:null}function Vl(i,e,t=Bh){if(!i)return{thuis:null,tekst:"",meters:null};let n=String(i.state??"").trim(),a=n.toLowerCase();if(a==="unavailable"||a==="unknown"||!n)return{thuis:null,tekst:"",meters:null};if(Kh.includes(a))return{thuis:!0,tekst:"Thuis",meters:null};if(Gh.includes(a))return{thuis:!1,tekst:"Afwezig",meters:null};let r=Uh(i),o=Number(e?.config?.latitude),s=Number(e?.config?.longitude);if(r&&Number.isFinite(o)&&Number.isFinite(s)){let l=Wh(r.lat,r.lon,o,s),d=l<=t;return{thuis:d,tekst:d?"Thuis":"Afwezig",meters:Math.round(l)}}return{thuis:!1,tekst:n.charAt(0).toUpperCase()+n.slice(1),meters:null}}var Fh=["open","opened","ajar","unlatched","on","true","unlocked"],qh=["closed","close","shut","secured","locked","off","false","not_open"];function vr(i){let e=String(i?.state??"").trim().toLowerCase();return!e||e==="unavailable"||e==="unknown"?null:Fh.includes(e)?!0:qh.includes(e)?!1:/(^|[^a-z])(ajar|open)([^a-z]|$)/.test(e)?!0:null}function Il(i){let e=String(i?.state??"").trim().toLowerCase();if(!e||e==="unavailable"||e==="unknown")return null;if(String(i?.entity_id??"").split(".")[0]==="lock")return e==="locked"?!0:e==="unlocked"||e==="open"||e==="opening"?!1:null;if(i?.attributes?.device_class==="lock"){if(e==="on")return!1;if(e==="off")return!0}return["locked","lock","secured","closed","off","false"].includes(e)?!0:["unlocked","unlock","open","unsecured","on","true"].includes(e)?!1:null}var kr={good:E.good,warn:E.warn,bad:E.bad,neutral:E.neutral,accent:E.accent},ta=class extends S{validate(e){let t={name:"",icon:"car",drivetrain:"electric",photo_size:"klein",...e};return t.battery||t.fuel||t.range||t.range_electric||t.sensors?.length||t.lock||t.image||(t[C]="Kies de aandrijving en vul minstens \xE9\xE9n sensor in \u2014 de accu, de tank of de actieradius."),t}watched(){let e=this.config;return[e.battery,e.fuel,e.range,e.range_electric,e.charging,e.charging_ready,e.charging_power,e.plug,e.lock,e.doors,e.windows,e.odometer,e.climate,e.location,...Array.isArray(e.sensors)?e.sensors:[]].filter(Boolean)}soort_(){return vt[this.config.drivetrain]?this.config.drivetrain:"electric"}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),this.setAttribute("foto",e.photo_size==="groot"?"groot":"klein"),this.style.containerType="inline-size",`
      <div class="card surface">
        <div class="kop">
          <span class="foto" role="button" tabindex="0"></span>
          <span class="tekst">
            <span class="nm"></span>
            <span class="st"></span>
          </span>
        </div>
        <div class="binnen">
          <div class="balken" hidden></div>
          <div class="tegels" hidden></div>
        </div>
      </div>`}wire(){this.teardown_.push(R(this.$(".card"))),this.on(this.$(".foto"),"click",()=>{let e=this.config;P(this,e.battery||e.range||e.fuel||e.lock)}),this.on(this.$(".tegels"),"click",e=>{let t=e.target.closest?.("[data-id]");t&&P(this,t.dataset.id)})}paint(){let e=this.config,t=this.soort_(),n=hr(t)?mr(v(this.hass,e.battery),e.battery_max):null,a=ur(t)?mr(v(this.hass,e.fuel),e.fuel_max):null,r=Hl(v(this.hass,e.range)),o=Ll(v(this.hass,e.charging)),s=fr(v(this.hass,e.charging_ready)),l=v(this.hass,e.lock),d=vr(v(this.hass,e.doors)),c=vr(v(this.hass,e.windows)),p=d===!0||c===!0,h=Il(l),g=Vl(v(this.hass,e.location),this.hass,Number(e.home_radius)||void 0),f=e.battery&&!v(this.hass,e.battery)&&e.range&&!v(this.hass,e.range);this.toggleAttribute("dead",!!f),this.text(".nm",e.name||M(this.hass,e.battery||e.range||e.lock,"Auto"));let k=Rl({open:p,slot:h===!1?"unlocked":h===!0?"locked":null,laden:o,laadMinuten:s,radius:r,aandrijving:t});this.text(".st",k.tekst),this.$(".st").style.setProperty("--melding",kr[k.toon]??E.neutral),this.paintFoto_(),this.paintBalken_({accu:n,tank:a,radius:r,laden:o,soort:t}),this.paintTegels_(g,o,{slot:h,deurOpen:d,raamOpen:c}),O(this.$(".card"))}paintFoto_(){let e=this.$(".foto"),t=this.config.image;if(!t){e.dataset.bron!==""&&(e.dataset.bron="",e.innerHTML=b(this.config.icon||"car"));return}if(e.dataset.bron===t)return;e.dataset.bron=t;let n=document.createElement("img");n.src=t,n.alt=this.config.name||"De auto",n.loading="lazy",n.onerror=()=>{e.dataset.bron="",e.innerHTML=b(this.config.icon||"car")},e.replaceChildren(n)}paintBalken_({accu:e,tank:t,radius:n,laden:a,soort:r}){let o=this.config,s=this.$(".balken"),l=[];if(e!==null){let h=gr(e);l.push({sleutel:"accu",icoon:"battery",label:"Accu",pct:e,toon:a==="charging"?"accent":h.toon,waarde:`${e}%`,laadt:a==="charging"})}if(t!==null){let h=gr(t);l.push({sleutel:"tank",icoon:r==="hybrid"?"petrol":vt[r].icoon,label:"Tank",pct:t,toon:h.toon,waarde:`${t}%`,laadt:!1})}if(!l.length&&n&&l.push({sleutel:"radius",icoon:"gaugeArrow",label:"Actieradius",pct:null,toon:"neutral",waarde:`${n.waarde} ${n.eenheid}`,laadt:!1}),s.hidden=!l.length,!l.length)return;let d=n?`${n.waarde} ${n.eenheid}`:"",c=fr(v(this.hass,o.charging_ready)),p=l.map(h=>`${h.sleutel}:${h.pct}:${h.toon}:${h.laadt}`).join(",")+d+c;s.dataset.sig!==p&&(s.dataset.sig=p,s.innerHTML=l.map((h,g)=>{let f=g===0&&h.sleutel!=="radius"&&d?`<span class="w">${this.veilig_(h.waarde)} \xB7 ${this.veilig_(d)}</span>`:`<span class="w">${this.veilig_(h.waarde)}</span>`,k=h.laadt&&c?` \xB7 nog ${this.veilig_(br(c))}`:"";return`
          <div class="meter" style="--balk:${kr[h.toon]??E.neutral}">
            <div class="regel">
              <span class="l">${b(h.icoon)}<span>${this.veilig_(h.label)}${k}</span></span>
              ${f}
            </div>
            ${h.pct===null?"":`<div class="lijn" data-laadt="${h.laadt}"><i style="--pct:${h.pct}%"></i></div>`}
          </div>`}).join(""))}paintTegels_(e,t,n={}){let a=this.config,r=this.$(".tegels"),o=[],s=(d,c)=>{let p=v(this.hass,d);if(!p||p.state==="unavailable"||p.state==="unknown")return;let h=p.attributes?.unit_of_measurement??"",g=Number(p.state),f=Number.isFinite(g)?`${Math.round(g*10)/10}${h?` ${h}`:""}`:p.state;o.push({id:d,w:f,l:c??M(this.hass,d,d)})};if(a.location&&e?.tekst){let d=e.thuis===!1&&e.meters!==null?e.meters>=1e3?` \xB7 ${Math.round(e.meters/100)/10} km`:` \xB7 ${e.meters} m`:"";o.push({id:a.location,w:e.tekst+d,l:"Waar hij staat",toon:e.thuis===!0?"good":null})}if(a.charging){let d=v(this.hass,a.charging),c=Cl(t,d);c&&o.push({id:a.charging,w:c,l:"Laadstatus",toon:t==="charging"?"accent":t==="complete"?"good":null})}a.lock&&n.slot!==null&&n.slot!==void 0&&o.push({id:a.lock,w:n.slot?"Op slot":"Niet op slot",l:"Portierslot",toon:n.slot?"good":"warn"}),a.doors&&n.deurOpen!==null&&n.deurOpen!==void 0&&o.push({id:a.doors,w:n.deurOpen?"Open":"Dicht",l:"Deuren",toon:n.deurOpen?"warn":null}),a.windows&&n.raamOpen!==null&&n.raamOpen!==void 0&&o.push({id:a.windows,w:n.raamOpen?"Open":"Dicht",l:"Ramen",toon:n.raamOpen?"warn":null}),a.climate&&s(a.climate,"Voorverwarmen"),a.odometer&&s(a.odometer,"Kilometerstand"),a.charging_power&&s(a.charging_power,"Laadvermogen");for(let d of Array.isArray(a.sensors)?a.sensors:[])s(d,null);if(r.hidden=!o.length,!o.length)return;let l=o.map(d=>`${d.id}|${d.w}|${d.toon??""}`).join(",");r.dataset.sig!==l&&(r.dataset.sig=l,r.innerHTML=o.map(d=>`<div class="tegel" data-id="${this.veilig_(d.id)}" role="button" tabindex="0"${d.toon?` style="--tegeltoon:${kr[d.toon]??E.neutral}"`:""}><span class="w">${this.veilig_(d.w)}</span><span class="l">${this.veilig_(d.l)}</span></div>`).join(""))}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}getCardSize(){return this.config?.photo_size==="groot"?5:3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-auto-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>/^sensor\..*(battery|accu|soc)/i.test(a));return n?{battery:n,drivetrain:"electric"}:{drivetrain:"electric"}}};_(ta,"css",`
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }

    .card {
      min-height: var(--dac-raster, 120px); padding: 10px 12px;
      display: flex; flex-direction: column; gap: 10px;
      /* De kaart mag langer worden, nooit breder. Gemeld op 27 augustus 2026:
         de knoppenrij rechtsboven kromp niet mee en duwde zichzelf buiten de
         kaart. Dit is het vangnet; de regels hieronder zorgen dat het niet
         nodig is. */
      overflow: hidden;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ---- kop ---- */
    /* flex-wrap: past de knoppenrij niet naast de naam, dan gaat hij eronder
       staan in plaats van eruit. Langer mag, breder niet. */
    .kop { display: flex; align-items: center; gap: 11px; min-width: 0; flex-wrap: wrap; }
    .foto {
      flex: 0 0 auto; width: 76px; height: 46px; border-radius: var(--dac-radius-sm);
      overflow: hidden; background: var(--dac-surface); cursor: pointer;
      display: grid; place-items: center;
      border: 1px solid var(--dac-border);
    }
    .foto img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .foto .icon, .foto ha-icon {
      width: 22px; height: 22px; --mdc-icon-size: 22px; color: var(--dac-ink-3);
    }
    /* Groot: de foto gaat bovenaan over de volle breedte. */
    :host([foto="groot"]) .card { gap: 0; padding: 0; }
    :host([foto="groot"]) .kop { padding: 10px 12px; }
    :host([foto="groot"]) .binnen { padding: 0 12px 11px; display: flex; flex-direction: column; gap: 10px; }
    /* GEEN vaste beeldverhouding bij de grote foto. Die stond op 16:7 met
       bijsnijden, en dan gaat er van een foto met een andere verhouding een
       stuk af -- gemeld op 27 augustus 2026 met een schermafdruk waarop het dak
       van zijn bedrijfsbus was afgesneden. Dezelfde fout als op de camerakaart.
       Nu bepaalt de foto zijn eigen hoogte. */
    :host([foto="groot"]) .foto {
      width: 100%; height: auto; border-radius: 0;
      border: 0; border-bottom: 1px solid var(--dac-border);
      order: -1;
    }
    :host([foto="groot"]) .foto img { height: auto; object-fit: contain; }
    :host(:not([foto="groot"])) .binnen { display: contents; }

    .tekst { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
    .nm {
      font-size: 14.5px; font-weight: 600; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11.5px; line-height: 1.3; color: var(--melding, var(--dac-ink-2));
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* Er staan GEEN bedieningsknoppen op deze kaart.
       Gevraagd op 27 augustus 2026: "in de kaart wil ik sowieso dat je niks
       kan bedienen, alleen sensor uitlezen". Er zaten knoppen voor het slot en
       het voorverwarmen; die zijn eruit. Alles wat de auto meldt staat er als
       tegel, en een tik erop opent de kaart van Home Assistant.

       Dat past ook bij wat zijn auto levert: sensor..._doorlock vertelt de
       stand maar neemt geen opdrachten aan. Een knop die niets doet is erger
       dan geen knop. */

    /* ---- balken ---- */
    .balken { display: flex; flex-direction: column; gap: 8px; }
    .balken[hidden] { display: none; }
    .meter { display: flex; flex-direction: column; gap: 4px; }
    .meter .regel {
      display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
      font-size: 11px; color: var(--dac-ink-3);
    }
    .meter .regel .l { display: inline-flex; align-items: center; gap: 5px; }
    .meter .regel .l .icon { width: 12px; height: 12px; color: var(--balk); }
    .meter .regel .w {
      font-size: 12.5px; font-weight: 600; color: var(--dac-ink);
      font-variant-numeric: tabular-nums;
    }
    .lijn {
      height: 6px; border-radius: 3px; overflow: hidden;
      background: var(--dac-surface-hi);
    }
    .lijn i {
      display: block; height: 100%; width: var(--pct, 0%);
      background: var(--balk, var(--dac-accent-hi)); border-radius: 3px;
      transition: width 500ms ease, background 300ms ease;
    }
    /* Zolang hij laadt, loopt er een glans over de balk. Dat is het enige
       bewegende op deze kaart, en het staat alleen aan als er echt iets
       gebeurt. */
    .lijn[data-laadt="true"] i {
      background-image: linear-gradient(
        90deg, transparent 0%, rgba(255,255,255,.34) 50%, transparent 100%
      );
      background-size: 42% 100%; background-repeat: no-repeat;
      animation: glans 1.9s linear infinite;
    }
    @keyframes glans { from { background-position: -42% 0 } to { background-position: 142% 0 } }
    @media (prefers-reduced-motion: reduce) { .lijn[data-laadt="true"] i { animation: none; } }

    /* ---- tegels ---- */
    /* auto-fit met een ondergrens: de tegels vullen de breedte die er IS, en
       vallen op een smalle kaart vanzelf op een tweede rij. Een vast aantal
       kolommen perst ze samen tot de tekst eruit loopt. */
    .tegels {
      display: grid; gap: 7px;
      grid-template-columns: repeat(auto-fit, minmax(104px, 1fr));
    }
    .tegels[hidden] { display: none; }
    .tegel {
      display: flex; flex-direction: column; align-items: center; gap: 1px;
      padding: 7px 5px; min-width: 0;
      background: rgba(255,255,255,.038); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm); cursor: pointer;
    }
    .tegel .w {
      font-size: 13.5px; font-weight: 500; color: var(--dac-ink);
      font-variant-numeric: tabular-nums; max-width: 100%;
      /* Afbreken en niet afknippen. "Niet aan de lader" werd anders "Niet aan
         de lad...", en dan staat er een tegel die je niet kunt lezen. In een
         raster worden de tegels toch al even hoog, dus een tweede regel kost
         niets. */
      text-align: center; line-height: 1.15;
      overflow-wrap: anywhere;
    }
    .tegel .l {
      font-size: 10px; line-height: 1.2; color: var(--dac-ink-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
    }
    /* Alleen waar de STAND iets zegt -- thuis, of aan het laden. De rest blijft
       in neutrale inkt; zie theme.js, het getal draagt nooit de kleur. */
    .tegel[style*="--tegeltoon"] .w { color: var(--tegeltoon); }

    :host([dead]) .card { opacity: .45; }

    @container (max-width: 340px) {
      :host(:not([foto="groot"])) .foto { display: none; }
    }
  `);var xr=class extends D{defaults(){return{icon:"car",drivetrain:"electric",photo_size:"klein"}}pickers(){return[{key:"image",kind:"foto",label:"Foto van de auto"},{key:"icon",kind:"icon",label:"Icoon (zonder foto)",fallback:"car"}]}schema(){let e=vt[this.config_?.drivetrain]?this.config_.drivetrain:"electric",t=[{name:"name",selector:m.text()},{name:"drivetrain",selector:m.select(Object.entries(vt).map(([n,{label:a}])=>({value:n,label:a})))},{name:"photo_size",selector:m.select([{value:"klein",label:"Klein, naast de naam"},{value:"groot",label:"Groot, over de hele breedte"}])},{name:"range",selector:m.entity(["sensor","number"])}];return hr(e)&&t.push({name:"battery",selector:m.entity(["sensor","number"])},{name:"battery_max",selector:m.number(1,400,1)},{name:"charging",selector:m.entity(["sensor","binary_sensor","switch"])},{name:"charging_ready",selector:m.entity(["sensor"])},{name:"charging_power",selector:m.entity(["sensor"])}),ur(e)&&t.push({name:"fuel",selector:m.entity(["sensor","number"])},{name:"fuel_max",selector:m.number(1,200,1)}),t.push({name:"lock",selector:m.entity(["lock","sensor","binary_sensor"])},{name:"doors",selector:m.entity(["binary_sensor","sensor","cover"])},{name:"windows",selector:m.entity(["binary_sensor","sensor","cover"])},{name:"climate",selector:m.entity(["sensor","binary_sensor","switch","climate"])},{name:"location",selector:m.entity(["device_tracker","sensor","person"])},{name:"home_radius",selector:m.number(10,2e3,10)},{name:"odometer",selector:m.entity(["sensor"])},{name:"sensors",selector:{entity:{multiple:!0}}}),t}label(e){return{name:"Naam",drivetrain:"Aandrijving",image:"Foto van de auto",photo_size:"Hoe groot staat de foto",range:"Actieradius",battery:"Accupercentage",battery_max:"Accu-inhoud (kWh), als de sensor geen procenten geeft",charging:"Laadstatus",charging_ready:"Klaar met laden om / nog te gaan",charging_power:"Laadvermogen",fuel:"Tankniveau",fuel_max:"Tankinhoud (liter), als de sensor geen procenten geeft",lock:"Portierslot",doors:"Deuren open",windows:"Ramen open",climate:"Voorverwarmen (alleen uitlezen)",location:"Waar hij staat",home_radius:"Hoe dichtbij is thuis (meter)",odometer:"Kilometerstand",sensors:"Extra sensoren als tegel"}[e.name]??super.label(e)}helper(e){return{drivetrain:"Bepaalt welke balken er op de kaart komen \u2014 een accu, een tank, of allebei \u2014 en welke velden je hieronder ziet.",image:"Kies een bestand of sleep er een op. Home Assistant zet hem in zijn eigen media-opslag; je kunt ook een pad als /local/auto.png intypen.",range:"In de eenheid van de sensor zelf. De kaart rekent niets om: staat je Home Assistant op mijlen, dan zie je mijlen.",battery_max:"Alleen nodig als je accusensor in kWh meldt in plaats van in procenten. Dan rekent de kaart het percentage zelf uit.",fuel_max:"Alleen nodig als je tanksensor in liters meldt in plaats van in procenten.",charging_ready:"Een aantal minuten, een klok of het tijdstip waarop hij vol is \u2014 alle drie worden gelezen.",doors:"Staat er iets open, dan zegt de kaart dat en gaat al het andere even opzij. Een binary_sensor mag, maar een gewone sensor met een woord erin ook \u2014 Closed, Open, Ajar en LOCKED worden allemaal gelezen.",lock:"Alleen uitlezen: deze kaart bedient niets. Een lock-entiteit mag, maar ook een sensor die LOCKED of UNLOCKED meldt.",location:"Een device_tracker die home of not_home meldt, of een sensor met een coordinaat \u2014 beide worden gelezen. Bij een coordinaat rekent de kaart de afstand tot de locatie van je Home Assistant uit en maakt daar Thuis of Afwezig van.",home_radius:"Alleen van belang bij een sensor met een coordinaat. Binnen deze afstand van je huis heet de auto thuis. Leeg laten is 100 meter \u2014 ruim genoeg voor een oprit of een parkeerplaats om de hoek.",sensors:"Alles wat je verder nog kwijt wilt: bandenspanning, buitentemperatuur, de volgende beurt. Ze komen als tegels onderaan te staan, met de naam uit Home Assistant."}[e.name]}};H("domotiapp-auto-card-editor",xr);N("domotiapp-auto-card",ta,{name:"DomotiApp Auto",description:"Brandstof, hybride of elektrisch: accu- en tankbalk, actieradius, laadstatus, het slot en zoveel eigen sensoren als je kwijt wilt \u2014 met een foto van de auto erbij."});function Pl(i,e){return i?.entities?.[e]?.device_id??null}function wr(i,e,t,n){if(n&&t.includes(n))return n;let a=Pl(i,e);if(a){let r=t.filter(o=>Pl(i,o)===a);if(r.length===1)return r[0]}return null}function na(i,e,t,n,a){let r=wr(i,e,t,n);return r===null||r===a}var Kl=[{sleutel:"mens",label:"Mens",icoon:"person",woorden:["person","persoon","personen","mens","people","human"]},{sleutel:"dier",label:"Dier",icoon:"dier",woorden:["pet","pets","dier","dieren","huisdier","animal","dog","hond","cat","kat"]},{sleutel:"voertuig",label:"Voertuig",icoon:"car",woorden:["vehicle","voertuig","car","auto","truck","vrachtwagen","motorcycle"]},{sleutel:"aanbellen",label:"Aanbellen",icoon:"bell",woorden:["doorbell","deurbel","aanbellen","aangebeld","visitor","bezoeker","bel","ring","chime"]},{sleutel:"ontgrendeling",label:"Ontgrendeling",icoon:"lockOpen",woorden:["unlock","unlocked","ontgrendeld","ontgrendeling","slot","lock","opener","deuropener","buzzer","toegang","access","entry","keypad","badge","pas"]}],Gl={sleutel:"beweging",label:"Beweging",icoon:"cctv",woorden:[]},Wt=[...Kl,Gl];function Wl(i){return Wt.find(e=>e.sleutel===i)??Gl}function Bl(i){return String(i??"").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)}function aa(i,e,t){if(String(i??"").split(".")[0]==="lock")return"ontgrendeling";if(t==="doorbell")return"aanbellen";let a=new Set([...Bl(i),...Bl(e)]);for(let r of Kl)if(r.woorden.some(o=>a.has(o)))return r.sleutel;return null}function Ul(i,e={}){let t=i?.melder,n=t?e[`meldersoort:${t}`]:null;return n&&Wt.some(a=>a.sleutel===n)?n:aa(t,i?.naam)}function Gt(i){let e=Date.parse(i?.tijd??"");return Number.isNaN(e)?null:e}function ia(i,{soorten:e,camera:t,dag:n,config:a}={}){let r=e instanceof Set?e:new Set(e??[]),o=n==null?null:ae(n);return(Array.isArray(i)?i:[]).filter(s=>{if(r.size){let l=Ul(s,a);if(!l||!r.has(l))return!1}if(t&&s.camera!==t)return!1;if(o){let l=Gt(s);if(l===null||l<o.vanaf||l>=o.tot)return!1}return!0})}function Fl(i,e={}){let t={};for(let n of Array.isArray(i)?i:[]){let a=Ul(n,e);a&&(t[a]=(t[a]??0)+1)}return t}function ql(i){let e=new Set((Array.isArray(i)?i:[]).map(t=>t?.soort).filter(Boolean));return Wt.filter(t=>e.has(t.sleutel))}function Zl(i,e,t){let n=Array.isArray(e)?e:[];if(n.some(r=>r==null))return[...i??[]];let a=new Set(n.filter(Boolean));for(let r of Array.isArray(t)?t:[])r?.camera&&a.add(r.camera);return(i??[]).filter(r=>a.has(r))}function _r(i){let e=new Set;for(let t of Array.isArray(i)?i:[]){let n=Gt(t);n!==null&&e.add(ae(n).vanaf)}return[...e].sort((t,n)=>n-t)}function ra(i,e,t){let n=ae(e).vanaf,a=(i??[]).filter(r=>t<0?r<n:r>n);return a.length?t<0?a[0]:a[a.length-1]:null}function yr(i){let e=new Map;for(let n of Array.isArray(i)?i:[]){let a=Gt(n),r=a===null?null:ae(a).vanaf;e.has(r)||e.set(r,[]),e.get(r).push(n)}return[...e.entries()].map(([n,a])=>({dag:n,beelden:a.sort((r,o)=>(Gt(o)??0)-(Gt(r)??0)),bytes:a.reduce((r,o)=>r+(Number(o.bytes)||0),0)})).sort((n,a)=>n.dag===null?1:a.dag===null?-1:a.dag-n.dag)}function jr(i){let e=Number(i)||0;return e>=1024*1024*1024?`${(e/(1024*1024*1024)).toFixed(1)} GB`:e>=1024*1024?`${Math.round(e/(1024*1024))} MB`:e>=1024?`${Math.round(e/1024)} kB`:`${e} B`}function ae(i){let e=new Date(i),t=new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime(),n=new Date(e.getFullYear(),e.getMonth(),e.getDate()+1).getTime();return{vanaf:t,tot:n}}function zr(i,e){let t=new Date(i);return new Date(t.getFullYear(),t.getMonth(),t.getDate()+e).getTime()}var Zh=["zo","ma","di","wo","do","vr","za"],Xh=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];function kt(i,e=Date.now()){if(i==null)return"Alles";let t=ae(e).vanaf,n=ae(i).vanaf,a=Math.round((t-n)/864e5);if(a===0)return"Vandaag";if(a===1)return"Gisteren";let r=new Date(n);return`${Zh[r.getDay()]} ${r.getDate()} ${Xh[r.getMonth()]}`}function Yh(i){let e=[i?.camera,...Array.isArray(i?.cameras)?i.cameras:[]].filter(t=>typeof t=="string"&&t);return[...new Set(e)]}function Qh(i){let e=[...Array.isArray(i?.motion_sensors)?i.motion_sensors:[],...i?.motion?[i.motion]:[]].filter(t=>typeof t=="string"&&t);return[...new Set(e)]}function Jh(i,e){let t=Yh(e),n=Qh(e),a=!!e?.snapshots;return t.map(r=>{let o=n.filter(l=>na(i,l,t,e?.[`melderbij:${l}`],r)),s={};for(let l of o){let d=e?.[`melder:${l}`];typeof d=="string"&&d.trim()&&(s[l]=d.trim())}return{camera:r,aan:a&&o.length>0,melders:o,namen:s,rustperiode:Xl(e?.snapshot_rustperiode,60),wachttijd:Xl(e?.snapshot_wachttijd,0),ontvangers:tu(e?.snapshot_ontvangers).filter(l=>l.startsWith("person.")),alleen_afwezig:!!e?.snapshot_alleen_afwezig}})}function eu(i,e){if(!e)return!0;for(let t of Object.keys(i))if(!$r(i[t],e[t]))return!0;return!1}function Yl(i,e,t){return Jh(i,e).filter(n=>eu(n,t?.[n.camera]))}function $r(i,e){return Array.isArray(i)&&Array.isArray(e)?i.length===e.length&&i.every((t,n)=>$r(t,e[n])):i&&e&&typeof i=="object"&&typeof e=="object"?[...new Set([...Object.keys(i),...Object.keys(e)])].every(n=>$r(i[n],e[n])):i===e}function tu(i){return Array.isArray(i)?i.filter(e=>typeof e=="string"):typeof i=="string"&&i?[i]:[]}function Xl(i,e){let t=Number(i);return Number.isFinite(t)&&t>=0?Math.round(t):e}var nu=`
  :host {
    ${G}
    position: fixed; inset: 0; z-index: 9990;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }
  *, *::before, *::after { box-sizing: border-box; }

  .scherm {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    background: var(--dac-bg);
    padding:
      env(safe-area-inset-top) env(safe-area-inset-right)
      env(safe-area-inset-bottom) env(safe-area-inset-left);
  }

  .kop {
    display: flex; align-items: center; gap: 10px; flex: 0 0 auto;
    padding: 14px 16px; border-bottom: 1px solid var(--dac-border);
  }
  .titel { font-size: 15px; font-weight: 600; }
  .stat { font-size: 11.5px; color: var(--dac-ink-3); }
  .rek { flex: 1 1 auto; }

  /* De terugknop draagt het WOORD en niet alleen een pijl. Een kruisje
     rechtsboven had hij niet gevonden, en dit scherm ligt over alles heen: wie
     de uitgang niet ziet, zit vast. */
  .terug {
    flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px 7px 10px; cursor: pointer; font: inherit; font-size: 13px;
    color: var(--dac-ink); background: var(--dac-surface);
    border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-pill);
  }
  .terug .icon { width: 16px; height: 16px; transform: rotate(180deg); }

  .wis {
    flex: 0 0 auto; padding: 7px 13px; cursor: pointer; font: inherit;
    font-size: 12.5px; color: var(--dac-ink-2); background: var(--dac-surface);
    border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
  }
  .wis[disabled] { opacity: .4; cursor: default; }

  .lijst {
    flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain;
    padding: 12px 16px 20px;
  }
  .dagkop {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 0 8px; font-size: 12.5px; font-weight: 600;
  }
  .dagkop .bij { font-weight: 400; font-size: 11px; color: var(--dac-ink-3); }
  .dagkop button {
    margin-left: auto; padding: 5px 11px; cursor: pointer; font: inherit;
    font-size: 11px; color: var(--dac-ink-3); background: transparent;
    border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
  }
  .raster {
    display: grid; gap: 8px;
    grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  }
  .kiek {
    position: relative; padding: 0; cursor: pointer; overflow: hidden;
    aspect-ratio: 16 / 9; background: #000;
    border: 1px solid var(--dac-border); border-radius: var(--dac-radius-sm);
  }
  .kiek img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .kiek .bij {
    position: absolute; left: 0; right: 0; bottom: 0;
    padding: 12px 6px 4px; font-size: 10px; line-height: 1.3; color: #fff;
    text-align: left; text-shadow: 0 1px 2px rgba(0,0,0,.85);
    background: linear-gradient(to top, rgba(0,0,0,.82), transparent);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .kiek .weg {
    position: absolute; top: 4px; right: 4px; width: 26px; height: 26px;
    display: grid; place-items: center; padding: 0; cursor: pointer;
    color: #fff; background: rgba(0,0,0,.55); border: none; border-radius: 50%;
  }
  .kiek .weg .icon { width: 13px; height: 13px; }
  .leeg { padding: 30px 0; text-align: center; color: var(--dac-ink-3); font-size: 12.5px; }

  .voet {
    flex: 0 0 auto; padding: 10px 16px 14px; font-size: 10.5px; line-height: 1.5;
    color: var(--dac-ink-3); border-top: 1px solid var(--dac-border);
  }

  /* Het vergrote beeld ligt IN dit element, dus altijd erboven. */
  .groot {
    position: absolute; inset: 0; z-index: 2; display: grid; place-items: center;
    background: rgba(0,0,0,.9); padding: 16px; cursor: zoom-out;
  }
  .groot[hidden] { display: none; }
  .groot img { max-width: 100%; max-height: 82vh; border-radius: var(--dac-radius-sm); }
  .groot .terug {
    position: absolute; top: max(14px, env(safe-area-inset-top)); left: 14px;
    color: #fff; background: rgba(0,0,0,.55); border-color: rgba(255,255,255,.24);
    backdrop-filter: blur(8px);
  }
  .groot .onder {
    position: absolute; left: 0; right: 0; bottom: max(16px, env(safe-area-inset-bottom));
    text-align: center; color: #fff; font-size: 12.5px;
    text-shadow: 0 1px 3px rgba(0,0,0,.8);
  }
`;function Je(i){return String(i??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}var Er=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[F(nu)],this.beelden_=[]}open(e){this.opts_=e,this.beelden_=e.beelden??[],this.gebouwd_||this.bouw_(),this.setAttribute("open",""),this.alleenBeeld_=!!e.beeld,this.$(".scherm").hidden=this.alleenBeeld_,e.beeld?this.toonGroot_(e.beeld):this.$(".groot").hidden=!0,this.teken_()}zet(e){this.beelden_=e??[],this.hasAttribute("open")&&this.teken_()}sluit(){this.removeAttribute("open"),this.opts_?.dicht?.()}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.gebouwd_=!0,this.shadowRoot.innerHTML=`
      <div class="scherm">
        <div class="kop">
          <button type="button" class="terug">${b("chevronRight")}<span>Terug</span></button>
          <span class="titel">Snapshots</span>
          <span class="stat"></span>
          <span class="rek"></span>
          <button type="button" class="wis">Alles wissen</button>
        </div>
        <div class="lijst"></div>
        <div class="voet">Snapshots blijven een week staan en verdwijnen daarna vanzelf, oudste eerst. Per camera worden er hoogstens 500 bewaard.</div>
      </div>
      <div class="groot" hidden>
        <button type="button" class="terug">${b("chevronRight")}<span>Terug</span></button>
        <img alt=""><div class="onder"></div>
      </div>`,this.shadowRoot.addEventListener("click",e=>{e.stopPropagation();let t=this.$(".groot");if(!t.hidden&&e.composedPath().includes(t)){if(this.alleenBeeld_)return this.sluit();t.hidden=!0;return}if(e.target.closest?.(".terug"))return this.sluit();let n=e.target.closest?.("[data-weg]");if(n){let o=this.beelden_.find(s=>s.id===n.dataset.weg);return this.opts_?.wis?.([n.dataset.weg],o?`dit beeld van ${o.naam??"de camera"}`:"dit beeld")}let a=e.target.closest?.("[data-wisdag]");if(a){let o=yr(this.beelden_).find(s=>String(s.dag)===a.dataset.wisdag);return o?this.opts_?.wis?.(o.beelden.map(s=>s.id),`${o.beelden.length} beelden van ${kt(o.dag).toLowerCase()}`):void 0}if(e.target.closest?.(".wis"))return this.beelden_.length?this.opts_?.wis?.(this.beelden_.map(o=>o.id),`alle ${this.beelden_.length} beelden`):void 0;let r=e.target.closest?.("[data-beeld]");r&&this.toonGroot_(r.dataset.beeld)}),this.tabIndex=-1,this.addEventListener("keydown",e=>{e.key==="Escape"&&(e.stopPropagation(),!this.$(".groot").hidden&&!this.alleenBeeld_?this.$(".groot").hidden=!0:this.sluit())})}toonGroot_(e){let t=this.beelden_.find(a=>a.id===e);if(!t)return;let n=this.$(".groot");n.querySelector("img").src=t.url,n.querySelector(".onder").textContent=`${this.opts_.camNaam(t.camera)} \xB7 ${t.naam??""} \xB7 ${this.opts_.klok(t.tijd,!0)}`,n.hidden=!1}teken_(){if(this.alleenBeeld_)return;let e=yr(this.beelden_),t=this.beelden_.reduce((r,o)=>r+(Number(o.bytes)||0),0),n=this.opts_.meerdere;this.$(".stat").textContent=this.beelden_.length?`${this.beelden_.length} beelden \xB7 ${jr(t)}`:"",this.$(".wis").disabled=!this.beelden_.length,this.$(".lijst").innerHTML=e.length?e.map(r=>{let o=r.dag===null?"Zonder datum":kt(r.dag);return`<div class="dagkop"><span>${Je(o)}</span><span class="bij">${r.beelden.length} \xB7 ${jr(r.bytes)}</span><button type="button" data-wisdag="${r.dag}">Wis deze dag</button></div><div class="raster">`+r.beelden.map(s=>{let l=n?`${Je(this.opts_.camNaam(s.camera))} \xB7 `:"";return`<button type="button" class="kiek" data-beeld="${Je(s.id)}"><img src="${Je(s.url)}" alt="" loading="lazy"><span class="bij">${l}${Je(s.naam??"")} \xB7 ${Je(this.opts_.klok(s.tijd))}</span><span class="weg" role="button" data-weg="${Je(s.id)}" aria-label="Verwijder">${b("close")}</span></button>`}).join("")+"</div>"}).join(""):'<div class="leeg">Er liggen geen snapshots.</div>';let a=this.$(".groot");!a.hidden&&this.alleenBeeld_===!1&&(this.beelden_.some(o=>a.querySelector("img").src.includes(o.id))||(a.hidden=!0))}};L("domotiapp-camera-archief",Er);function Ql(i){let e=document.querySelector("domotiapp-camera-archief");return e||(e=document.createElement("domotiapp-camera-archief"),document.body.appendChild(e)),e.open(i),e.focus?.(),e}function Ar(i){document.querySelector("domotiapp-camera-archief")?.zet(i)}function oa(i){let e=Number(i);return Number.isFinite(e)?Math.max(1,Math.min(6,e)):1}function au(i){let e=oa(i);return Math.max(0,(1-1/e)/2)}function Ut(i,e,t){let n=au(t),a=o=>Number.isFinite(Number(o))?Number(o):0,r=o=>Math.max(-n,Math.min(n,a(o)))+0;return{x:r(i),y:r(e)}}function sa(i,e,t={x:0,y:0}){let n=oa(i?.zoom??1),a=oa(n*(Number(e)||1));if(a===n)return{zoom:n,...Ut(i?.x,i?.y,n)};let r=Number(t?.x)||0,o=Number(t?.y)||0,s=(i?.x??0)+r*(1/n-1/a),l=(i?.y??0)+o*(1/n-1/a);return{zoom:a,...Ut(s,l,a)}}function Jl({zoom:i=1,x:e=0,y:t=0}={}){let n=oa(i),a=Ut(e,t,n);return`scale(${n}) translate(${(-a.x*100).toFixed(3)}%, ${(-a.y*100).toFixed(3)}%)`}var td=[{sleutel:"auto",label:"Volgt de camera",css:null},{sleutel:"16:9",label:"16:9 (breed)",css:"16 / 9"},{sleutel:"4:3",label:"4:3",css:"4 / 3"},{sleutel:"3:2",label:"3:2",css:"3 / 2"},{sleutel:"1:1",label:"Vierkant",css:"1 / 1"}],iu=7,la=[{k:"up",icoon:"arrowUp",label:"Omhoog"},{k:"left",icoon:"chevronRight",label:"Links",draai:180},{k:"right",icoon:"chevronRight",label:"Rechts"},{k:"down",icoon:"arrowDown",label:"Omlaag"}];function nd(i){return!!(i.presets||Array.isArray(i.preset_buttons)&&i.preset_buttons.length||la.some(e=>i[`ptz_${e.k}`]))}var da=class extends S{validate(e){let t={name:"",...e};return!t.camera&&!(Array.isArray(t.cameras)&&t.cameras.length)&&(t[C]="Kies een camera. Presets, richtingsknoppen en een bewegingsmelder mogen daarna."),t.presets_aan===void 0&&(t.presets_aan=nd(t)),t}watched(){let e=this.config;return[...this.cameras_(),e.presets,...this.melders_().map(t=>t.entity),...Array.isArray(e.preset_buttons)?e.preset_buttons:[]].filter(Boolean)}melders_(){let e=this.config,t=[...Array.isArray(e.motion_sensors)?e.motion_sensors:[],...e.motion?[e.motion]:[]].filter(n=>typeof n=="string");return[...new Set(t)].map(n=>{let a=e[`melder:${n}`]||M(this.hass,n)||"Beweging";return{entity:n,naam:a,bijCamera:e[`melderbij:${n}`],soort:e[`meldersoort:${n}`]||aa(n,a,v(this.hass,n)?.attributes?.device_class)}})}cameras_(){let e=this.config,t=[e.camera,...Array.isArray(e.cameras)?e.cameras:[]].filter(Boolean);return[...new Set(t)]}huidig_(){let e=this.cameras_();return e.includes(this.cam_)?this.cam_:e[0]}template(){return this.config.bare&&this.setAttribute("bare",""),this.stand_=this.stand_??{zoom:1,x:0,y:0},`
      <div class="card surface">
        <div class="vak">
          <div class="schuif"></div>
          <div class="over">
            <span class="nm"></span>
            <span class="rek"></span>
            <span class="melders"></span>
            <span class="merk" data-soort="live" hidden><span class="stip"></span><span>LIVE</span></span>
          </div>
          <div class="ptz" hidden>
            ${la.map(t=>`<button type="button" data-r="${t.k}" aria-label="${t.label}"${t.draai?` style="transform: rotate(${t.draai}deg)"`:""}>${b(t.icoon)}</button>`).join("")}
          </div>
          <div class="presets" hidden></div>
        </div>
        <div class="cams" hidden></div>
        <div class="filters" hidden>
          <div class="rij dagrij">
            <button type="button" class="pijl" data-dag="-1" aria-label="Dag terug">
              ${b("chevronRight")}
            </button>
            <button type="button" class="datum">Vandaag</button>
            <button type="button" class="pijl" data-dag="1" aria-label="Dag verder">
              ${b("chevronRight")}
            </button>
            <span class="rek"></span>
            <button type="button" class="opslag" aria-label="Alle snapshots">
              ${b("storage")}
            </button>
          </div>
          <div class="dagmenu" hidden></div>
          <div class="rij soorten"></div>
          <div class="rij camkeuze" hidden></div>
        </div>
        <div class="tijdlijn" hidden></div>
      </div>
`}wire(){this.teardown_.push(R(this.$(".card"))),this.on(this.$(".ptz"),"click",e=>{let t=e.target.closest?.("[data-r]");t&&(e.stopPropagation(),this.draai_(t.dataset.r))}),this.on(this.$(".presets"),"click",e=>{let t=e.target.closest?.("[data-p]");t&&(e.stopPropagation(),this.preset_(t.dataset.p,t.dataset.soort))}),this.on(this.$(".cams"),"click",e=>{let t=e.target.closest?.("[data-cam]");t&&(e.stopPropagation(),this.cam_=t.dataset.cam,this.stand_={zoom:1,x:0,y:0},this.paint())}),this.filterLuisteraars_(),this.wielScroll_(),this.zoomLuisteraars_(),this.bewaakStream_(),this.bewakingWire_()}filterLuisteraars_(){let e=this.$(".filters");this.on(e,"click",n=>{let a=n.target.closest?.(".pijl");if(a&&!a.disabled){n.stopPropagation();let l=Number(a.dataset.dag),d=this.dag_??ae(Date.now()).vanaf,c=ra(_r(this.beelden_??[]),d,l);this.zetDag_(c??zr(d,l));return}if(n.target.closest?.(".opslag")){n.stopPropagation(),this.openArchief_();return}if(n.target.closest?.(".datum")){n.stopPropagation(),this.wisselDagmenu_();return}let r=n.target.closest?.("[data-kies]");if(r){n.stopPropagation(),this.sluitDagmenu_(),this.zetDag_(Number(r.dataset.kies));return}let o=n.target.closest?.("[data-soort-filter]");if(o){n.stopPropagation(),this.wisselSoort_(o.dataset.soortFilter);return}let s=n.target.closest?.("[data-camfilter]");s&&(n.stopPropagation(),this.camFilter_=s.dataset.camfilter||null,this.paintFilters_(),this.paintTijdlijn_(!0))});let t=n=>{this.$(".dagmenu")?.hidden||n.composedPath().includes(this.$(".dagmenu"))||n.composedPath().includes(this.$(".datum"))||this.sluitDagmenu_()};document.addEventListener("click",t,!0),this.teardown_.push(()=>document.removeEventListener("click",t,!0))}wisselDagmenu_(){let e=this.$(".dagmenu");if(!e.hidden)return this.sluitDagmenu_();this.paintDagmenu_(),e.hidden=!1,this.$(".datum").setAttribute("aria-expanded","true"),e.scrollIntoView({block:"nearest"})}sluitDagmenu_(){this.$(".dagmenu").hidden=!0,this.$(".datum").setAttribute("aria-expanded","false")}paintDagmenu_(){let e=ae(Date.now()).vanaf,t=this.dag_??e,n=this.beelden_??[],a=[];for(let r=0;r<iu;r++){let o=zr(e,-r),s=ia(n,{dag:o,config:this.config}).length;a.push({dag:o,label:kt(o),aantal:s})}this.$(".dagmenu").innerHTML=a.map(r=>`<button type="button" data-kies="${r.dag}" aria-current="${r.dag===t}"${r.aantal?"":" data-leeg"}><span>${Ke(r.label)}</span><span class="telling">${r.aantal||"\u2014"}</span></button>`).join("")}wielScroll_(){for(let e of[".tijdlijn",".cams",".camkeuze",".presets"]){let t=this.$(e);t&&this.on(t,"wheel",n=>{if(Math.abs(n.deltaX)>Math.abs(n.deltaY))return;let a=t.scrollWidth-t.clientWidth;a<=1||(n.deltaY>0?Math.ceil(t.scrollLeft)>=a:t.scrollLeft<=0)||(n.preventDefault(),t.scrollLeft+=n.deltaY)},{passive:!1})}}zetDag_(e){let t=ae(Date.now()).vanaf;this.dag_=Math.min(ae(e).vanaf,t),this.paintFilters_(),this.paintTijdlijn_(!0)}wisselSoort_(e){this.soorten_=this.soorten_ instanceof Set?this.soorten_:new Set,this.soorten_.has(e)?this.soorten_.delete(e):this.soorten_.add(e),this.paintFilters_(),this.paintTijdlijn_(!0)}zichtbareBeelden_(){return ia(this.beelden_??[],{soorten:this.soorten_,camera:this.camFilter_,dag:this.dag_??ae(Date.now()).vanaf,config:this.config})}paintFilters_(){let e=this.$(".filters");if(!e||(e.hidden=!this.config.snapshots,e.hidden))return;let t=this.beelden_??[],n=this.dag_??ae(Date.now()).vanaf;this.text(".datum",kt(n));let a=_r(t);this.$('.pijl[data-dag="-1"]').disabled=ra(a,n,-1)===null,this.$('.pijl[data-dag="1"]').disabled=n>=ae(Date.now()).vanaf||ra(a,n,1)===null,this.paintSoorten_(ia(t,{camera:this.camFilter_,dag:n,config:this.config})),this.paintCamFilter_()}paintSoorten_(e){let t=this.$(".soorten"),n=Fl(e,this.config),a=ql(this.melders_()),r=this.soorten_ instanceof Set?this.soorten_:new Set;t.hidden=!a.length;let o=a.map(s=>`${s.sleutel}:${n[s.sleutel]??0}:${r.has(s.sleutel)}`).join(",");t.dataset.sig!==o&&(t.dataset.sig=o,t.innerHTML=a.map(s=>{let l=n[s.sleutel]??0;return`<button type="button" data-soort-filter="${s.sleutel}" aria-pressed="${r.has(s.sleutel)}" aria-label="${s.label}"${l?"":" data-leeg"}>${b(s.icoon)}<span>${l}</span></button>`}).join(""))}paintCamFilter_(){let e=this.$(".camkeuze"),t=this.cameras_(),n=this.melders_().map(s=>wr(this.hass,s.entity,t,s.bijCamera)),a=Zl(t,n,this.beelden_??[]);if(e.hidden=a.length<2,a.length<2){this.camFilter_&&!a.includes(this.camFilter_)&&(this.camFilter_=null,this.paintTijdlijn_(!0));return}this.camFilter_&&!a.includes(this.camFilter_)&&(this.camFilter_=null,this.paintTijdlijn_(!0));let r=a.map(s=>this.camNaam_(s)),o=`${a.join(",")}|${r.join(",")}|${this.camFilter_??""}`;e.dataset.sig!==o&&(e.dataset.sig=o,e.innerHTML=`<button type="button" data-camfilter="" aria-pressed="${!this.camFilter_}">Alle</button>`+a.map((s,l)=>`<button type="button" data-camfilter="${Ke(s)}" aria-pressed="${this.camFilter_===s}">${Ke(r[l])}</button>`).join(""))}zoomLuisteraars_(){let e=this.$(".vak"),t=new Map,n=null,a=null,r=0,o=l=>{let d=e.getBoundingClientRect();return{x:(l.clientX-d.left)/d.width-.5,y:(l.clientY-d.top)/d.height-.5}};this.on(e,"wheel",l=>{l.preventDefault(),this.zet_(sa(this.stand_,l.deltaY<0?1.18:1/1.18,o(l)))},{passive:!1}),this.on(e,"pointerdown",l=>{if(t.set(l.pointerId,l),e.setPointerCapture?.(l.pointerId),r=0,t.size===2){let[d,c]=[...t.values()];a={afstand:Math.hypot(d.clientX-c.clientX,d.clientY-c.clientY),stand:{...this.stand_}},n=null}else this.stand_.zoom>1&&(n={x:l.clientX,y:l.clientY,stand:{...this.stand_}},this.setAttribute("sleept",""))}),this.on(e,"pointermove",l=>{if(t.has(l.pointerId)){if(t.set(l.pointerId,l),r=Math.max(r,Math.abs(l.movementX??0)+Math.abs(l.movementY??0)),a&&t.size===2){let[d,c]=[...t.values()],p=Math.hypot(d.clientX-c.clientX,d.clientY-c.clientY),h={x:(d.clientX+c.clientX)/2,y:(d.clientY+c.clientY)/2},g=e.getBoundingClientRect();this.zet_(sa(a.stand,p/(a.afstand||1),{x:(h.x-g.left)/g.width-.5,y:(h.y-g.top)/g.height-.5}));return}if(n){let d=e.getBoundingClientRect(),c=(l.clientX-n.x)/d.width/this.stand_.zoom,p=(l.clientY-n.y)/d.height/this.stand_.zoom;this.zet_({zoom:this.stand_.zoom,...Ut(n.stand.x-c,n.stand.y-p,this.stand_.zoom)})}}});let s=l=>{t.delete(l.pointerId),t.size<2&&(a=null),t.size||(n=null,this.removeAttribute("sleept"))};this.on(e,"pointerup",s),this.on(e,"pointercancel",s),this.on(e,"dblclick",l=>{l.target.closest(".presets, .ptz")||(l.preventDefault(),this.zet_(this.stand_.zoom>1?{zoom:1,x:0,y:0}:sa({zoom:1,x:0,y:0},2.5,o(l))))}),this.on(e,"click",l=>{l.target.closest(".presets, .ptz")||r>6||this.config.tap_zoom!==!1&&P(this,this.huidig_())})}zet_(e){this.stand_=e,this.toggleAttribute("zoom",e.zoom>1),this.$(".schuif").style.setProperty("--tf",Jl(e))}draai_(e){let t=this.config[`ptz_${e}`];if(!t)return;let n=String(t).split(".")[0];this.hass.callService(n,n==="button"?"press":"turn_on",{entity_id:t})}preset_(e,t){if(t==="knop"){let r=String(e).split(".")[0];return this.hass.callService(r,r==="button"?"press":"turn_on",{entity_id:e})}let n=this.config.presets,a=String(n).split(".")[0];return this.hass.callService(a,"select_option",{entity_id:n,option:e})}paint(){let e=this.config,t=this.huidig_(),n=v(this.hass,t),a=!n||n.state==="unavailable";this.toggleAttribute("dead",!!a),this.text(".nm",e.name||M(this.hass,t,"Camera"));let r=(this.live_===!0||e.live_view===!0)&&!this.streamStuk_&&this.magLive_(),o=this.$(".schuif");if(a){if(!this.$(".vak .leeg")){let l=document.createElement("span");l.className="leeg",l.textContent="Deze camera is niet bereikbaar",this.$(".vak").appendChild(l)}}else this.$(".vak .leeg")?.remove(),Yn(o,this.hass,t,{live:r});let s=this.$('.merk[data-soort="live"]');s.hidden=!r||a,this.paintMelders_(),this.zet_(this.stand_),this.paintPtz_(),this.paintPresets_(),this.paintCams_(t),this.paintFilters_(),this.paintTijdlijn_(),this.paintVorm_(),O(this.$(".card"))}bewaakStream_(){let t=setInterval(()=>{if(!this.isConnected)return;let a=this.$(".schuif")?.querySelector(".beeld");if(!a?.shadowRoot)return;if(this.zoekAlert_(a.shadowRoot,4)&&!this.streamStuk_){this.valTerug_();return}let r=this.zoekVideo_(a.shadowRoot,4);if(r&&!r.paused){let o=r.currentTime;this.laatsteTijd_===o?(this.stilTellen_=(this.stilTellen_??0)+1,this.stilTellen_>=5&&this.herstart_()):(this.stilTellen_=0,this.laatsteTijd_=o)}},2e3);this.teardown_.push(()=>{clearInterval(t),clearTimeout(this.streamHerkansing_)});let n=()=>{document.visibilityState==="visible"&&this.herstart_()};document.addEventListener("visibilitychange",n),this.teardown_.push(()=>document.removeEventListener("visibilitychange",n))}magLive_(){return this.liveVrij_?!0:(this.liveTimer_||(this.liveTimer_=setTimeout(()=>{this.liveVrij_=!0,this.isConnected&&this.paint()},1500),this.teardown_.push(()=>{clearTimeout(this.liveTimer_),this.liveTimer_=null,this.liveVrij_=!1})),!1)}valTerug_(){this.streamStuk_=!0,this.paint(),clearTimeout(this.streamHerkansing_),this.streamHerkansing_=setTimeout(()=>{this.streamStuk_=!1,this.paint()},3e4)}herstart_(){let e=this.$(".schuif")?.querySelector(".beeld");!e||e.localName!=="hui-image"||e.cameraView==="live"&&(this.stilTellen_=0,this.laatsteTijd_=null,e.cameraView="auto",clearTimeout(this.herstartTimer_),this.herstartTimer_=setTimeout(()=>{let t=this.$(".schuif")?.querySelector(".beeld");t&&t.localName==="hui-image"&&!this.streamStuk_&&(t.cameraView="live")},600),this.teardown_.push(()=>clearTimeout(this.herstartTimer_)))}zoekVideo_(e,t){if(!e||t<=0)return null;let n=e.querySelector?.("video");if(n)return n;for(let a of e.querySelectorAll?.("*")??[])if(a.shadowRoot){let r=this.zoekVideo_(a.shadowRoot,t-1);if(r)return r}return null}zoekAlert_(e,t){if(!e||t<=0)return null;let n=e.querySelector?.("ha-alert");if(n)return n;for(let a of e.querySelectorAll?.("*")??[])if(a.shadowRoot){let r=this.zoekAlert_(a.shadowRoot,t-1);if(r)return r}return null}paintMelders_(){let e=this.$(".melders"),t=this.huidig_(),n=this.cameras_(),a=this.melders_().filter(o=>X(v(this.hass,o.entity))&&na(this.hass,o.entity,n,o.bijCamera,t)),r=t+"::"+a.map(o=>`${o.entity}|${o.naam}|${o.soort}`).join(",");e.dataset.sig!==r&&(e.dataset.sig=r,e.innerHTML=a.map(o=>`<span class="merk" data-soort="beweging">${b(Wl(o.soort).icoon)}<span>${this.veilig_(o.naam)}</span></span>`).join(""))}paintPtz_(){let e=this.config,t=this.$(".ptz"),n=e.presets_aan!==!1&&la.some(a=>e[`ptz_${a.k}`]);if(t.hidden=!n,!!n)for(let a of la){let r=t.querySelector(`[data-r="${a.k}"]`);r&&(r.hidden=!e[`ptz_${a.k}`])}}paintPresets_(){let e=this.config,t=this.$(".presets"),n=[],a=e.presets_aan===!1?null:v(this.hass,e.presets),r=a?.attributes?.options;if(Array.isArray(r))for(let l of r)n.push({waarde:l,naam:l,soort:"keuze",aan:a.state===l});let o=e.presets_aan!==!1&&Array.isArray(e.preset_buttons)?e.preset_buttons:[];for(let l of o)v(this.hass,l)&&n.push({waarde:l,naam:M(this.hass,l,l),soort:"knop",aan:!1});if(t.hidden=!n.length,!n.length)return;let s=n.map(l=>`${l.waarde}|${l.aan}`).join(",");t.dataset.sig!==s&&(t.dataset.sig=s,t.innerHTML=n.map(l=>`<button type="button" data-p="${this.veilig_(l.waarde)}" data-soort="${l.soort}" aria-pressed="${l.aan}">${this.veilig_(l.naam)}</button>`).join(""))}camNaam_(e){let t=this.config;return e===t.camera&&t.name?t.name:t[`cam:${e}`]||M(this.hass,e)||e}paintCams_(e){let t=this.cameras_(),n=this.$(".cams");if(n.hidden=t.length<2,t.length<2)return;let a=t.map(o=>this.camNaam_(o)),r=`${t.join(",")}|${a.join(",")}|${e}`;n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=t.map((o,s)=>`<button type="button" data-cam="${this.veilig_(o)}" aria-pressed="${o===e}">${this.veilig_(a[s])}</button>`).join(""))}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}getCardSize(){return 5}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",3)}}paintVorm_(){let e=[".cams",".filters",".tijdlijn"].some(n=>this.$(n)&&!this.$(n).hidden);this.toggleAttribute("alleenbeeld",!e);let t=td.find(n=>n.sleutel===this.config.verhouding);t?.css?(this.setAttribute("verhouding",t.sleutel),this.style.setProperty("--dac-verhouding",t.css)):(this.removeAttribute("verhouding"),this.style.removeProperty("--dac-verhouding"))}bewakingWire_(){let e=this.$(".tijdlijn");if(!e)return;if(!this.config.snapshots){e.hidden=!0,this.beelden_=[];return}this.on(e,"click",n=>{let a=n.target.closest?.("[data-beeld]");a&&(n.stopPropagation(),this.openArchief_(a.dataset.beeld))}),this.hass?.connection?.sendMessagePromise&&(this.bewakingHaal_(),this.bewakingLuister_(),clearTimeout(this.regelTimer_),this.regelTimer_=setTimeout(()=>this.bewakingRegels_(),1500),this.teardown_.push(()=>clearTimeout(this.regelTimer_)))}inDialoog_(){let e=this;for(let t=0;t<40;t++){let n=e.getRootNode?.()?.host;if(!n)return!1;let a=n.localName??"";if(a.startsWith("hui-dialog")||a==="hui-card-preview")return!0;e=n}return!1}bewakingCameras_(){return this.cameras_()}async bewakingHaal_(){try{let e=await this.hass.connection.sendMessagePromise({type:"domotiapp_lovelace/bewaking/timeline",cameras:this.bewakingCameras_(),limiet:0});this.beelden_=e?.beelden??[]}catch{this.beelden_=[]}this.paintFilters_(),this.paintTijdlijn_(!0)}async bewakingLuister_(){try{let e=await this.hass.connection.subscribeMessage(t=>this.bewakingBericht_(t),{type:"domotiapp_lovelace/bewaking/subscribe",cameras:this.bewakingCameras_()});this.isConnected?this.teardown_.push(e):e()}catch{}}bewakingBericht_(e){let t=this.beelden_??[];if(e?.soort==="nieuw"&&e.beeld)this.beelden_=[e.beeld,...t];else if(e?.soort==="opgeruimd"&&Array.isArray(e.ids)){let n=new Set(e.ids);this.beelden_=t.filter(a=>!n.has(a.id))}else return;this.paintFilters_(),this.paintTijdlijn_(!0),Ar(this.beelden_)}async bewakingRegels_(){if(this.inDialoog_())return;let e=this.hass?.connection;if(!e?.sendMessagePromise)return;let t={};try{t=(await e.sendMessagePromise({type:"domotiapp_lovelace/bewaking/get"}))?.regels??{}}catch{return}for(let n of Yl(this.hass,this.config,t))try{await e.sendMessagePromise({type:"domotiapp_lovelace/bewaking/save",regel:n})}catch(a){console.warn("DomotiApp: bewakingsregel geweigerd",n.camera,a)}}paintTijdlijn_(e=!1){let t=this.$(".tijdlijn");if(!t)return;if(!this.config.snapshots){t.hidden=!0;return}t.hidden=!1,e&&(this.tijdlijnTeken_=null);let n=this.zichtbareBeelden_(),a=this.cameras_().length>1,r=`${a}|${this.cameras_().map(o=>this.camNaam_(o)).join("|")}|${n.map(o=>o.id).join(",")}`;if(this.tijdlijnTeken_!==r){if(this.tijdlijnTeken_=r,!n.length){let o=(this.beelden_??[]).length>0;t.innerHTML=`<span class="leeg">${o?"Niets binnen dit filter.":"Nog geen beelden."}</span>`;return}t.innerHTML=n.map(o=>{let s=Ke(this.camNaam_(o.camera)),l=Ke(o.naam??""),d=Ke(ed(this.hass,o.tijd)),c=a?`<span class="cam">${s}</span>`:"";return`<button type="button" class="mini" data-beeld="${Ke(o.id)}" aria-label="${a?s+", ":""}${l} om ${d}"><img src="${Ke(o.url)}" alt="" loading="lazy"><span class="bij">${c}<span><b>${l}</b> \xB7 ${d}</span></span></button>`}).join("")}}openArchief_(e){this.slotLos_?.(),this.slotLos_=Tn(),this.teardown_.push(()=>this.slotLos_?.()),Ql({beelden:this.beelden_??[],beeld:e,meerdere:this.cameras_().length>1,camNaam:t=>this.camNaam_(t),klok:(t,n)=>ed(this.hass,t,n),wis:(t,n)=>this.wis_(t,n),dicht:()=>{this.slotLos_?.(),this.slotLos_=null}})}async wis_(e,t){if(!e?.length||!await Ae({title:"Snapshots verwijderen",text:`Weet je zeker dat je ${t} wilt verwijderen? Weg is weg.`,confirmText:"Verwijderen",dismissText:"Annuleren"}))return;try{await this.hass.connection.sendMessagePromise({type:"domotiapp_lovelace/bewaking/verwijder",ids:e})}catch(r){console.warn("DomotiApp: verwijderen mislukt",r);return}let a=new Set(e);this.beelden_=(this.beelden_??[]).filter(r=>!a.has(r.id)),this.paintFilters_(),this.paintTijdlijn_(!0),Ar(this.beelden_)}static getConfigElement(){return document.createElement("domotiapp-camera-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("camera."));return n?{camera:n}:{}}};_(da,"css",`
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }

    /* GEEN overflow:hidden hier. Dat stond er om het beeld binnen de ronde
       hoeken te houden, maar het knipte ook de dagenlijst af -- vier van de
       zeven dagen waren te zien. Het beeld rondt nu zijn eigen bovenhoeken af,
       en de kaart laat los wat erbuiten hoort te mogen hangen. */
    .card {
      padding: 0;
      display: flex; flex-direction: column;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    /* ---- het beeld ----
       GEEN vaste beeldverhouding. Die stond op 16:9 met cover, en dan wordt
       een camera die iets anders levert bijgesneden -- gemeld op 27 augustus
       2026 met een schermafdruk: "de kaart mag auto grootte worden, nu zie je
       dat er een deel mist". Klopte: bij zijn oprit viel de boven- en onderkant
       weg.

       Nu volgt de kaart het beeld. De minimumhoogte is er alleen voor het moment
       dat er nog niets geladen is; zodra het beeld er staat, bepaalt dat de
       hoogte. */
    .vak {
      position: relative; width: 100%; min-height: 120px;
      overflow: hidden; background: #000;
      border-radius: var(--dac-radius) var(--dac-radius) 0 0;
      touch-action: none; cursor: default;
      display: flex;
    }
    /* Staat er NIETS onder het beeld -- geen kiezerrij, geen filters, geen
       strook -- dan is het beeld de hele kaart en horen ook de onderhoeken rond
       te zijn. Dat ging mis in 0.31.2: daar is overflow:hidden van de kaart af
       gegaan (dat knipte de dagenlijst af), en sindsdien rondde het beeld alleen
       nog bovenlangs af. Gemeld met een schermafdruk uit een vertical stack:
       *"dan heb ik geen ronding onderin."* De kaart zet dit kenmerk zelf in
       paint(), want alleen daar is bekend wat er zichtbaar is. */
    :host([alleenbeeld]) .vak { border-radius: var(--dac-radius); }

    /* ---- een vaste beeldverhouding ----
       Standaard volgt de kaart zijn camera; dat is met opzet, want een vaste
       16:9 sneed er bij hem beeld af. Maar in een vertical stack met een
       horizontal stack erin staan vier camera's naast elkaar die elk hun eigen
       verhouding volgen, en dan is er eentje hoger dan de rest. Gemeld op
       28 augustus 2026: *"de linker onderste camera is groter, zie je dat? In
       een bubble pop-up is het goed dat hij zijn grootte aanpast, maar in zo'n
       vertical stack wil ik alles hetzelfde hebben."*

       Dus: per kaart in te stellen. Staat er een verhouding, dan vult het beeld
       dat vak en wordt er bijgesneden -- dat is dan zijn eigen keuze, en niet
       onze aanname. */
    :host([verhouding]) .vak { aspect-ratio: var(--dac-verhouding); min-height: 0; }
    :host([verhouding]) .schuif { height: 100%; }
    :host([verhouding]) .schuif .beeld,
    :host([verhouding]) .schuif img,
    :host([verhouding]) .schuif hui-image {
      height: 100%; object-fit: cover;
    }
    :host([zoom]) .vak { cursor: grab; }
    :host([sleept]) .vak { cursor: grabbing; }

    .schuif {
      transform: var(--tf, none); transform-origin: center center;
      transition: transform 160ms ease-out;
      will-change: transform;
    }
    :host([sleept]) .schuif { transition: none; }
    /* height:auto en contain: het beeld houdt zijn eigen verhouding en er
       gaat niets af. */
    .schuif { width: 100%; }
    .schuif .beeld, .schuif img, .schuif hui-image {
      display: block; width: 100%; height: auto; object-fit: contain;
    }
    .vak .leeg {
      position: absolute; inset: 0; display: grid; place-items: center;
      font-size: 12.5px; color: var(--dac-ink-3);
    }

    /* De naam en de meldingen liggen op het beeld. Een balk eronder zou de
       kaart een rasterrij hoger maken voor twee woorden. */
    .over {
      position: absolute; left: 0; right: 0; top: 0; z-index: 2;
      display: flex; align-items: center; gap: 7px; padding: 9px 10px;
      background: linear-gradient(to bottom, rgba(0,0,0,.62), transparent);
      pointer-events: none;
    }
    .over .nm {
      font-size: 13px; font-weight: 600; color: #fff; min-width: 0;
      text-shadow: 0 1px 3px rgba(0,0,0,.7);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .over .rek { flex: 1 1 auto; }
    .merk {
      flex: 0 0 auto; display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 8px; border-radius: var(--dac-radius-pill);
      font-size: 10.5px; font-weight: 600; letter-spacing: .02em;
      background: color-mix(in srgb, var(--dac-bg) 62%, transparent);
      color: var(--dac-ink-2); border: 1px solid var(--dac-border-hi);
    }
    .merk .icon { width: 11px; height: 11px; }
    .merk[hidden] { display: none; }
    /* Meerdere melders naast elkaar. Ze mogen afbreken: bij een camera die
       persoon, auto \xE9n dier los meldt kunnen er drie tegelijk aanstaan. */
    .melders { display: flex; gap: 5px; flex-wrap: wrap; justify-content: flex-end; min-width: 0; }
    .merk[data-soort="live"] { color: var(--dac-bad); border-color: color-mix(in srgb, var(--dac-bad) 55%, transparent); }
    .merk[data-soort="live"] .stip {
      width: 6px; height: 6px; border-radius: 50%; background: var(--dac-bad);
      animation: knipper 2s ease-in-out infinite;
    }
    @keyframes knipper { 0%, 100% { opacity: 1 } 50% { opacity: .25 } }
    @media (prefers-reduced-motion: reduce) { .merk[data-soort="live"] .stip { animation: none; } }
    .merk[data-soort="beweging"] { color: var(--dac-warn); border-color: color-mix(in srgb, var(--dac-warn) 55%, transparent); }

    /* Er staan GEEN knoppen meer op het beeld.
       Gevraagd op 27 augustus 2026: "ook het plusje en minnetje wil ik weg
       hebben, ik wil gewoon inzoomen met mijn vingers. Ook de camera kan weg
       want als je erop tikt dan vergroot hij toch wel. Ik wil alle icons weg
       hebben dus."

       Zoomen gaat met twee vingers, met het wiel of met een dubbeltik; groot
       bekijken met een gewone tik. Live staat in de editor. Wat overblijft is
       het beeld -- en de presets, als je die hebt. */

    /* De richtingsknoppen, links onderin. Alleen als ze zijn ingesteld. */
    .ptz {
      position: absolute; left: 8px; bottom: 8px; z-index: 3;
      display: grid; grid-template-columns: repeat(3, 28px); grid-template-rows: repeat(2, 28px);
      gap: 3px;
    }
    .ptz[hidden] { display: none; }
    .ptz button {
      display: grid; place-items: center; cursor: pointer; padding: 0; font: inherit;
      color: var(--dac-ink);
      background: color-mix(in srgb, var(--dac-bg) 68%, transparent);
      backdrop-filter: blur(8px);
      border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-sm);
    }
    .ptz button .icon { width: 14px; height: 14px; }
    .ptz [data-r="up"] { grid-area: 1 / 2; }
    .ptz [data-r="left"] { grid-area: 2 / 1; }
    .ptz [data-r="down"] { grid-area: 2 / 2; }
    .ptz [data-r="right"] { grid-area: 2 / 3; }

    /* ---- de presets, IN het beeld ----
       "Nu komt die keuzelijst eronder te staan maar hij moet in het beeld
       komen." Dus liggen ze over de onderrand, met een verloop erachter zodat
       ze leesbaar blijven op elk beeld. */
    .presets {
      position: absolute; left: 0; right: 0; bottom: 0; z-index: 3;
      display: flex; gap: 6px; padding: 22px 10px 9px; overflow-x: auto;
      scrollbar-width: none; -webkit-overflow-scrolling: touch;
      background: linear-gradient(to top, rgba(0,0,0,.66), transparent);
    }
    .presets::-webkit-scrollbar { display: none; }
    .presets[hidden] { display: none; }
    .presets button {
      flex: 0 0 auto; padding: 7px 12px; cursor: pointer; font: inherit;
      font-size: 12px; font-weight: 500; white-space: nowrap;
      color: var(--dac-ink); border-radius: var(--dac-radius-pill);
      background: color-mix(in srgb, var(--dac-bg) 68%, transparent);
      backdrop-filter: blur(8px);
      border: 1px solid var(--dac-border-hi);
      transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
    }
    .presets button[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
      background: color-mix(in srgb, var(--dac-accent) 16%, transparent);
    }
    @media (hover: hover) { .presets button:hover { border-color: var(--dac-border-hi); } }

    /* ---- meerdere camera's ---- */
    /* Lucht tussen het beeld en de knoppen. Ze plakten tegen de onderrand aan
       -- gemeld op 27 augustus 2026: "de geselecteerde mogelijkheden staan veel
       te dicht op de camera". */
    .cams { display: flex; gap: 6px; padding: 11px 10px; overflow-x: auto; scrollbar-width: none; }
    .cams::-webkit-scrollbar { display: none; }
    .cams[hidden] { display: none; }
    .cams button {
      flex: 0 0 auto; padding: 6px 11px; cursor: pointer; font: inherit;
      font-size: 11.5px; white-space: nowrap;
      color: var(--dac-ink-3); background: transparent;
      border: 1px solid transparent; border-radius: var(--dac-radius-pill);
    }
    /* De camera waar je naar KIJKT valt op, in het accent. Dat stond eerst op
       een grijstint die naast de andere knoppen nauwelijks verschilde -- en dan
       weet je niet welke je ziet. Gemeld op 27 augustus 2026. */
    .cams button[aria-pressed="true"] {
      color: var(--dac-accent-hi); font-weight: 600;
      background: color-mix(in srgb, var(--dac-accent) 18%, transparent);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
    }

    /* ---- de filters boven de timeline ----
       Gevraagd op 28 augustus 2026: *"ik wil gewoon op de meldingen en die
       foto's die er nu onder staan een time line met filters zoals tijd, welke
       camera etc."*

       Ze staan BOVEN de strook en niet erin: de strook schuift opzij, en een
       filter dat wegscrollt terwijl je zoekt is geen filter. */
    .filters {
      display: flex; flex-direction: column; gap: 7px; padding: 0 10px 8px;
      position: relative;
    }
    .filters[hidden] { display: none; }
    .filters .rij { display: flex; align-items: center; gap: 6px; min-width: 0; }

    /* De dagkiezer. De pijlen zijn 30px breed: kleiner is op een telefoon
       mikken, en dit is een knop die je vaak achter elkaar indrukt. */
    .filters .pijl {
      flex: 0 0 auto; width: 30px; height: 30px; display: grid; place-items: center;
      padding: 0; font: inherit; cursor: pointer; color: var(--dac-ink-2);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
    }
    .filters .pijl .icon { width: 15px; height: 15px; }
    .filters .pijl[data-dag="-1"] .icon { transform: rotate(180deg); }
    .filters .pijl[disabled] { opacity: .35; cursor: default; }
    /* Het vak dat zegt WELKE dag je ziet, en dat je opent om een andere te
       kiezen. Gemeld op 28 augustus 2026: *"ik wil gewoon op vandaag klikken en
       dan kalender."* E\xE9n tik dus, geen kalendericoon ernaast. */
    .filters .datum {
      flex: 0 0 auto; padding: 6px 12px; font: inherit; cursor: pointer;
      font-size: 12px; font-weight: 600; color: var(--dac-ink);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill); white-space: nowrap;
    }
    .filters .datum[aria-expanded="true"] {
      color: var(--dac-accent-hi);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
    }

    /* ---- de dagenlijst ----
       GEEN kalender van de browser meer. *"Ik wil geen kalender trouwens (...)
       nu staat er een hele kalender, ik wil gewoon de kalender van een week
       terug, want dat wordt ook maar zo gebruikt. Beelden van 3 weken geleden
       zijn toch al gewist, dus onnodig een hele kalender."*

       Precies zo: de bewaartermijn is een week, dus alles daarbuiten is een
       maand aanwijzen waar niets staat. Zeven regels, met erachter hoeveel
       beelden er die dag liggen. */
    /* absolute en NIET fixed. Fixed leek slimmer -- het ontsnapt aan elke
       overflow -- maar het is niet vast aan het scherm zodra een voorouder een
       transform heeft, en een pop-up van bubble-card heeft die. Dan landt het
       lijstje op co\xF6rdinaten die tegen het verkeerde vlak gerekend zijn, en zie
       je alleen dat de dagknop blauw wordt. Gemeld op 28 augustus 2026:
       *"als ik op vandaag klik wordt hij blauw en gebeurt er niets."*

       Absoluut binnen de filterrij dus, en de kaart klemt niet meer (zie
       .card hierboven). */
    .filters .dagmenu {
      position: absolute; left: 0; top: 36px; z-index: 8; min-width: 180px;
      padding: 5px; display: flex; flex-direction: column;
      background: var(--dac-bg-raise); border: 1px solid var(--dac-border-hi);
      border-radius: var(--dac-radius-sm); box-shadow: 0 18px 40px -14px rgba(0,0,0,.72);
    }
    .filters .dagmenu[hidden] { display: none; }
    .filters .dagmenu button {
      display: flex; align-items: center; gap: 10px; width: 100%; text-align: left;
      padding: 7px 10px; cursor: pointer; font: inherit; font-size: 12.5px;
      color: var(--dac-ink); background: transparent; border: none;
      border-radius: var(--dac-radius-sm);
    }
    .filters .dagmenu button[aria-current="true"] { color: var(--dac-accent-hi); font-weight: 600; }
    .filters .dagmenu button[data-leeg] { color: var(--dac-ink-3); }
    .filters .dagmenu .telling { margin-left: auto; font-size: 11px; color: var(--dac-ink-3); }
    @media (hover: hover) {
      .filters .dagmenu button:hover { background: var(--dac-surface); }
    }

    .filters .opslag {
      flex: 0 0 auto; width: 30px; height: 30px; display: grid; place-items: center;
      padding: 0; font: inherit; cursor: pointer; color: var(--dac-ink-2);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
    }
    .filters .opslag .icon { width: 15px; height: 15px; }
    .filters .rek { flex: 1 1 auto; }
    /* Er staat GEEN teller "13 van 13" naast de dagkiezer. Die stond er wel;
       weggehaald op verzoek, 28 augustus 2026: "dat 25 van de 31 mag wel weg, is
       niet relevant." Je ziet de beelden zelf al staan. */

    /* De vijf filterknoppen. Hij vroeg om vijf iconen; ze staan er alle vijf,
       ook als er van die soort niets is -- dan gedempt, zodat de rij niet van
       vorm verandert zodra er een kraai voorbijkomt. */
    .filters .soorten { display: flex; gap: 6px; flex-wrap: wrap; }
    .filters .soorten[hidden] { display: none; }
    .filters .soorten button {
      flex: 0 0 auto; display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 9px; cursor: pointer; font: inherit; font-size: 11.5px;
      color: var(--dac-ink-3); background: var(--dac-surface);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
    }
    .filters .soorten button .icon { width: 14px; height: 14px; }
    .filters .soorten button[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      background: color-mix(in srgb, var(--dac-accent) 18%, transparent);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
    }
    .filters .soorten button[data-leeg] { opacity: .38; }

    /* De camerakeuze, alleen bij meer dan \xE9\xE9n camera op de kaart. */
    .filters .camkeuze { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
    .filters .camkeuze::-webkit-scrollbar { display: none; }
    .filters .camkeuze[hidden] { display: none; }
    .filters .camkeuze button {
      flex: 0 0 auto; padding: 4px 10px; cursor: pointer; font: inherit;
      font-size: 11px; white-space: nowrap; color: var(--dac-ink-3);
      background: transparent; border: 1px solid transparent;
      border-radius: var(--dac-radius-pill);
    }
    .filters .camkeuze button[aria-pressed="true"] {
      color: var(--dac-accent-hi); font-weight: 600;
      border-color: color-mix(in srgb, var(--dac-accent-hi) 55%, transparent);
    }

    /* ---- de timeline ----
       Gevraagd op 27 augustus 2026: *"Ik wil ook een timeline hebben. (...) dan
       komt er een timeline onder de kaart met de snapshots."*

       Een strook miniaturen, meer niet. Geen knoppen, geen kopjes, geen
       datumscheidingen: een kaart is beeld. W\xE9lke camera het was staat als
       klein label in de miniatuur, want de eigenaar koos ervoor de camera's
       door elkaar te tonen op tijd. */
    .tijdlijn {
      display: flex; gap: 6px; padding: 0 10px 11px;
      overflow-x: auto; scrollbar-width: none;
    }
    .tijdlijn::-webkit-scrollbar { display: none; }
    .tijdlijn[hidden] { display: none; }
    /* 104x60 en niet kleiner. Op 27 augustus 2026 in een echte browser gemeten:
       bij 76x44 was het label 30,7 van de 44 pixels hoog -- dan is de miniatuur
       een tekstvakje met een randje beeld eromheen, en een kaart hoort beeld te
       zijn. Bij deze maat is \xE9\xE9n regel 15px van de 60. */
    .tijdlijn .mini {
      flex: 0 0 auto; position: relative; padding: 0; cursor: pointer;
      width: 104px; height: 60px; overflow: hidden;
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-sm);
      background: #000;
    }
    .tijdlijn .mini img { width: 100%; height: 100%; object-fit: cover; display: block; }
    /* Twee regels over de onderrand: de melder en het tijdstip. Ze staan op het
       beeld en niet eronder, anders wordt de strook twee keer zo hoog voor twee
       woorden. */
    /* E\xE9n regel: "Persoon \xB7 22:58". Staan er meerdere camera's op de kaart, dan
       komt de camera daar als tweede regel b\xF3ven -- want dan zijn de camera's
       door elkaar gemengd en zegt de tijd alleen niet genoeg. */
    .tijdlijn .bij {
      position: absolute; left: 0; right: 0; bottom: 0;
      padding: 10px 5px 3px; font-size: 9.5px; line-height: 1.25; color: #fff;
      background: linear-gradient(to top, rgba(0,0,0,.8), transparent);
      text-align: left; text-shadow: 0 1px 2px rgba(0,0,0,.85);
    }
    .tijdlijn .bij span {
      display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .tijdlijn .bij .cam { font-size: 8.5px; color: rgba(255,255,255,.72); }
    .tijdlijn .bij b { font-weight: 600; }
    @media (hover: hover) { .tijdlijn .mini:hover { border-color: var(--dac-border-hi); } }
    .tijdlijn .leeg {
      font-size: 11.5px; color: var(--dac-ink-3); padding: 2px 0 6px;
    }

    /* Het opslagscherm en het vergrote beeld staan NIET meer in deze kaart.
       Ze hangen aan document.body -- zie camera-archief.js voor waarom: in een
       pop-up van bubble-card is position:fixed niet vast aan het scherm, en dan
       valt de terugknop buiten beeld. */

    :host([dead]) .card { opacity: .5; }
  `);function ed(i,e,t=!1){if(!e)return"";let n=new Date(e);if(Number.isNaN(n.getTime()))return"";let a=i?.locale?.language??"nl",r=n.toLocaleTimeString(a,{hour:"2-digit",minute:"2-digit"}),o=new Date;return n.getDate()===o.getDate()&&n.getMonth()===o.getMonth()&&n.getFullYear()===o.getFullYear()&&!t?r:`${n.toLocaleDateString(a,{weekday:"short",day:"numeric",month:"short"})} ${r}`}function Ke(i){return String(i??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}var Mr=class extends D{pickers(){return[]}setConfig(e){let t=e??{},n=[...Array.isArray(t.motion_sensors)?t.motion_sensors:[],...t.motion?[t.motion]:[]].filter(r=>typeof r=="string"),a={presets_aan:nd(t)};for(let r of n){let o=this.hass_?.states?.[r]?.attributes,s=t[`melder:${r}`]||o?.friendly_name,l=aa(r,s,o?.device_class);l&&(a[`meldersoort:${r}`]=l)}super.setConfig({...a,...t})}schema(){let e=this.config_??{},t=s=>Array.isArray(s)?s.filter(l=>typeof l=="string"):[],n=t(e.cameras).map(s=>({name:`cam:${s}`,selector:m.text()})),a=[e.camera,...t(e.cameras)].filter(Boolean),r=t(e.motion_sensors).flatMap(s=>{let l=[{name:`melder:${s}`,selector:m.text()},{name:`meldersoort:${s}`,selector:m.select(Wt.map(d=>({value:d.sleutel,label:d.label})))}];return a.length>1&&l.push({name:`melderbij:${s}`,selector:m.select([{value:"",label:"Bij alle camera's"},...a.map(d=>({value:d,label:this.hass?.states?.[d]?.attributes?.friendly_name??d}))])}),l}),o=e.snapshots?[{name:"snapshot_rustperiode",selector:m.number(0,3600)},{name:"snapshot_wachttijd",selector:m.number(0,60)},{name:"snapshot_ontvangers",selector:{entity:{domain:"person",multiple:!0}}},{name:"snapshot_alleen_afwezig",selector:m.bool()}]:[];return[{name:"camera",selector:m.entity("camera")},{name:"name",selector:m.text()},{name:"live_view",selector:m.bool()},{name:"verhouding",selector:m.select(td.map(s=>({value:s.sleutel,label:s.label})))},{name:"cameras",selector:{entity:{domain:"camera",multiple:!0}}},...n,{name:"presets_aan",selector:m.bool()},...e.presets_aan?[Fe("Presets en draaien","mdi:arrow-all",[{name:"presets",selector:m.entity(["select","input_select"])},{name:"preset_buttons",selector:{entity:{domain:["button","scene","script"],multiple:!0}}},{name:"ptz_up",selector:m.entity(["button","switch"])},{name:"ptz_down",selector:m.entity(["button","switch"])},{name:"ptz_left",selector:m.entity(["button","switch"])},{name:"ptz_right",selector:m.entity(["button","switch"])}])]:[],{name:"motion_sensors",selector:{entity:{domain:["binary_sensor","event","lock"],multiple:!0}}},...r,{name:"snapshots",selector:m.bool()},...o.length?[Fe("Snapshots en meldingen","mdi:camera-burst",o)]:[]]}label(e){return e.name.startsWith("cam:")?`Naam voor ${M(this.hass,e.name.slice(4))||e.name.slice(4)}`:e.name.startsWith("melder:")?`Naam voor ${M(this.hass,e.name.slice(7))||e.name.slice(7)}`:e.name.startsWith("melderbij:")?"\u21B3 hoort bij welke camera":e.name.startsWith("meldersoort:")?"\u21B3 wat ziet hij":{camera:"Camera",name:"Naam",live_view:"Altijd live",verhouding:"Beeldverhouding",presets:"Presets (keuzelijst)",preset_buttons:"Presets als losse knoppen",motion:"Bewegingsmelder",motion_sensors:"Bewegingsmelders",ptz_up:"Draaien: omhoog",ptz_down:"Draaien: omlaag",ptz_left:"Draaien: links",ptz_right:"Draaien: rechts",cameras:"Nog meer camera's op deze kaart",snapshots:"Snapshots en timeline",snapshot_rustperiode:"Rustperiode per melder (seconden)",snapshot_wachttijd:"Wachten voor het beeld (seconden)",snapshot_ontvangers:"Wie krijgt een melding",snapshot_alleen_afwezig:"Alleen melden als er niemand thuis is",presets_aan:"Presets en draaien"}[e.name]??super.label(e)}helper(e){return e.name.startsWith("meldersoort:")?"Bepaalt onder welke filterknop zijn beelden in de timeline vallen, en welk icoon er op het beeld staat als hij afgaat. Hij wordt geraden uit de naam \u2014 een Reolink klopt vanzelf.":e.name.startsWith("melderbij:")?"Laat dit op 'alle camera's' staan als je het niet weet. De kaart koppelt een melder vanzelf aan de camera waar hij op hetzelfde apparaat zit \u2014 bij een Reolink hoeft je dus niets in te vullen.":{camera:"Op de kaart staat een beeld dat zichzelf ververst. Inzoomen doe je met twee vingers, met het scrollwiel of met een dubbeltik; een gewone tik opent hem groot. Er staan geen knoppen op het beeld.",name:"De naam van de camera zelf. Hij staat linksboven op het beeld, en ook in de rij eronder als je meer camera's op deze kaart hebt staan.",live_view:"De stream staat dan altijd open. Mooier, maar op een dashboard met zes camera's zijn dat zes streams die de hele dag doorlopen.",presets:"De `select` van je camera-integratie \u2014 Reolink en ONVIF leveren die. De kaart maakt van elke optie een knop, onderin het beeld, dus een preset die je in de camera-app toevoegt verschijnt er vanzelf bij.",preset_buttons:"Voor integraties die geen keuzelijst maar losse knoppen leveren, zoals Amcrest en Dahua. Ze mogen naast de keuzelijst staan.",motion:"Het oude enkele veld. Gebruik liever Bewegingsmelders hierboven; deze blijft werken voor kaarten die hem al hebben.",motion_sensors:"Zolang er een aanstaat komt er een merkje op het beeld. Kies er gerust meerdere: een Reolink meldt persoon, voertuig en huisdier los van elkaar, en dan zie je w\xE9lke het is. Een deurbel (`event`) en een slot (`lock`) mogen er ook bij. Per melder kun je hieronder een naam en een soort invullen \u2014 die soort bepaalt onder welke filterknop hij in de timeline valt.",ptz_up:"De vier richtingsknoppen van je integratie. Vul je er geen in, dan komt het draaikruis er niet.",cameras:"Onder het beeld komt dan een rij met namen om tussen te wisselen; de camera waar je naar kijkt licht op. Handig voor de camera's die bij elkaar horen \u2014 voordeur, oprit, achtertuin. Per camera kun je hieronder een eigen naam invullen.",snapshots:"Bij elke detectie legt Home Assistant een beeld vast en zet dat onder de kaart in een strook, met filters erboven op dag, soort en camera \u2014 ook als er nergens een scherm aanstaat. Beelden blijven een week staan; daarboven wijkt vanzelf de oudste. Staat dit uit, dan wordt er niets vastgelegd en niets bewaard.",snapshot_rustperiode:"Hoe lang dezelfde melder daarna met rust wordt gelaten. Dit is het antwoord op tien meldingen achter elkaar. De klok loopt PER MELDER: meldt je camera persoon, voertuig en huisdier apart, dan houden die elkaar niet tegen \u2014 een auto die de oprit op rijdt en de bestuurder die uitstapt leveren allebei een beeld op. Nul betekent: alles vastleggen.",snapshot_wachttijd:"Wacht zoveel seconden na de detectie voordat het beeld genomen wordt. Op nul krijg je het moment zelf; op een of twee seconden staat degene meestal beter in beeld dan met zijn rug ernaartoe. Deze wachttijd verandert niets aan de rustperiode.",snapshot_ontvangers:"De personen die een melding op hun telefoon krijgen, met het beeld erbij. De kaart zoekt zelf de mobiele app van die persoon op. Buitenshuis heeft de telefoon een extern adres nodig (Nabu Casa of een eigen domein) om de foto te laden; zonder dat komt de melding w\xE9l aan, maar zonder plaatje.",snapshot_alleen_afwezig:"Dan blijft de telefoon stil zolang er iemand thuis is. Het beeld komt nog steeds in de timeline te staan \u2014 alleen de melding blijft achterwege. Dit scheelt in de praktijk meer meldingen dan de rustperiode.",verhouding:"Standaard volgt de kaart zijn camera, zodat er geen beeld af gaat. Staan er meerdere camerakaarten naast elkaar in een stack, kies dan overal dezelfde verhouding \u2014 dan zijn ze even hoog. Er wordt dan wel bijgesneden.",presets_aan:"E\xE9n vinkje voor de hele bediening: de presetknoppen in het beeld en het draaikruis linksonder. Zet je het uit, dan blijft alles wat je gekozen hebt gewoon staan \u2014 het is alleen weg van het beeld."}[e.name]}};H("domotiapp-camera-card-editor",Mr);N("domotiapp-camera-card",da,{name:"DomotiApp Camera",description:"Live beeld met inzoomen en schuiven, de presets van je camera als knoppen, een draaikruis en een merkje zodra er beweging is."});var ad="domotiapp_lovelace/infoscherm",id="/api/domotiapp_lovelace/infoscherm",rd=i=>i?.auth?.data?.access_token??i?.auth?.accessToken??"",wt=(i,e,t={})=>i.connection.sendMessagePromise({type:`${ad}/${e}`,...t}),ca=i=>wt(i,"get"),pa=(i,e)=>i.connection.subscribeMessage(e,{type:`${ad}/subscribe`}),od=(i,e,t)=>wt(i,"aanwezig",{persoon:e,aanwezig:t}),sd=(i,e,t)=>wt(i,`${e}/save`,{[e]:t}),ld=(i,e)=>wt(i,"bestand/verwijder",{bestand:e}),dd=i=>wt(i,"feeds/ververs"),cd=i=>wt(i,"gebruikers");async function pd(i,e){let t=new FormData;t.append("bestand",e,e.name);let n=await fetch(`${id}/upload`,{method:"POST",body:t,headers:{Authorization:`Bearer ${rd(i)}`}}),a=null;try{a=await n.json()}catch{}if(!n.ok)throw new Error(a?.message??`Home Assistant antwoordde met ${n.status}`);return a}var xt=new Map;function _t(i,e){if(!e)return Promise.resolve(null);if(xt.has(e))return xt.get(e);let t=(async()=>{try{let n=await fetch(`${id}/bestand/${e}`,{headers:{Authorization:`Bearer ${rd(i)}`}});if(!n.ok)throw new Error(String(n.status));return ru(await n.blob())}catch{return xt.delete(e),null}})();return xt.set(e,t),t}var ru=i=>globalThis.URL.createObjectURL(i);function hd(i){let e=xt.get(i);xt.delete(i),e?.then(t=>t&&globalThis.URL.revokeObjectURL(t))}var yt=["ma","di","wo","do","vr","za","zo"],Ft={ma:"maandag",di:"dinsdag",wo:"woensdag",do:"donderdag",vr:"vrijdag",za:"zaterdag",zo:"zondag"},ud=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],ha=i=>String(i).padStart(2,"0"),ua=i=>yt[(i.getDay()+6)%7],Ge=i=>`${i.getFullYear()}-${ha(i.getMonth()+1)}-${ha(i.getDate())}`,We=i=>`${ha(i.getHours())}:${ha(i.getMinutes())}`,md=i=>`${Ft[ua(i)]} ${i.getDate()} ${ud[i.getMonth()]}`;function gd(i,e){return!(i?.van&&i.van>e||i?.tot&&i.tot<e)}var fd=(i,e)=>(i??[]).filter(t=>t.tekst&&gd(t,e));function bd(i,e,t){let n=(i??[]).filter(r=>r.titel&&gd(r,t)).map(r=>({...r,eigen:!0,datum:r.gemaakt??null})).sort((r,o)=>+!!o.vast-+!!r.vast||String(o.gemaakt??"").localeCompare(String(r.gemaakt??""))),a=(e??[]).filter(r=>r.titel).map(r=>({...r,eigen:!1})).sort((r,o)=>String(o.datum??"").localeCompare(String(r.datum??"")));return[...n,...a]}var ou=i=>i?.length?i.map(([e,t])=>`${e} \u2013 ${t}`).join(", "):"gesloten";function Sr(i,e){let t=Ge(e),n=i?.openingstijden?.[ua(e)]??[],a="";for(let r of i?.uitzonderingen??[])r.datum===t&&(n=r.tijden??[],a=r.reden??"");return{tijden:n,reden:a}}function qt(i,e){let{tijden:t,reden:n}=Sr(i,e),a=We(e),r=t.find(([s,l])=>s<=a&&a<l),o=t.find(([s])=>s>a);return{open:!!r,tot:r?r[1]:null,straks:o?o[0]:null,tijden:t,reden:n}}function su(i,e){let t=qt(i,e);if(t.straks)return{dag:"vandaag",tijd:t.straks};for(let n=1;n<=14;n+=1){let a=new Date(e.getFullYear(),e.getMonth(),e.getDate()+n),{tijden:r}=Sr(i,a);if(r.length)return{dag:n===1?"morgen":Ft[ua(a)],tijd:r[0][0]}}return null}function vd(i,e){let t=ua(e);return yt.map(n=>{let a=n===t?Sr(i,e):null,r=a?a.tijden:i?.openingstijden?.[n]??[];return{dag:n,naam:Ft[n],tekst:ou(r),reden:a?.reden??"",vandaag:n===t}})}var ma=i=>yt.some(e=>(i?.openingstijden?.[e]??[]).length>0);function ga(i,e){let t=["welkom"];return i.show_aanwezig!==!1&&(e?.personen?.length??0)>0&&t.push("aanwezig"),i.show_nieuws!==!1&&t.push("nieuws"),lu(i,e)&&t.push("verlichting"),i.show_agenda!==!1&&(i.calendars?.length??0)>0&&t.push("agenda"),t}function lu(i,e){if(!(i.lights?.length>0))return!1;let t=i.verlichting??"beheer";return t==="altijd"?!0:t==="nooit"?!1:e?.instellingen?.verlichting_tonen!==!1}function Nr(i){let e=String(i??"").trim().split(/\s+/).filter(Boolean),t=e.filter(a=>a[0]===a[0].toUpperCase()&&/\p{L}/u.test(a[0])),n=t.length?t:e;return n.length?n.length===1?n[0].slice(0,2).toUpperCase():(n[0][0]+n[n.length-1][0]).toUpperCase():"?"}function kd(i){let e=new Map;for(let t of i??[]){let n=t.functie||"";e.has(n)||e.set(n,[]),e.get(n).push(t)}return[...e].map(([t,n])=>({functie:t,personen:n}))}function Tr(i,e){if(!i)return"";let t=new Date(i);if(Number.isNaN(t.getTime()))return"";let n=Math.round((e-t)/6e4);if(n<1)return"zojuist";if(n<60)return`${n} min geleden`;if(Ge(t)===Ge(e))return`vandaag ${We(t)}`;let a=new Date(e.getFullYear(),e.getMonth(),e.getDate()-1);return Ge(t)===Ge(a)?`gisteren ${We(t)}`:`${t.getDate()} ${ud[t.getMonth()].slice(0,3)}`}var Or=(i,e)=>i?.length?i[(e%i.length+i.length)%i.length]:"";function Dr(i,e){let t=qt(i,e),n=["Gesloten"];t.reden&&n.push(t.reden);let a=su(i,e);return a&&n.push(`${a.dag} open om ${a.tijd}`),n.join(" \xB7 ")}var Cr="domotiapp-infoscherm-card",fa=i=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${i}</svg>`,ba={news:fa('<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2"/><path d="M7.2 9.2h9.6M7.2 12.6h9.6M7.2 16h5.6"/>'),megaphone:fa('<path d="M4 11v2a1 1 0 0 0 1 1h2l5 4V6L7 10H5a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>'),moon:fa('<path d="M19.6 14.4A8 8 0 0 1 9.6 4.4a8 8 0 1 0 10 10z"/>'),offline:fa('<path d="M3.4 6.8a13.6 13.6 0 0 1 17.2 0M6.6 10.4a9 9 0 0 1 10.8 0M9.8 14a4.4 4.4 0 0 1 4.4 0"/><circle cx="12" cy="18" r="1"/><path d="M4 4l16 16"/>')},du={welkom:"house",aanwezig:"people",nieuws:"news",verlichting:"bulb",agenda:"calendar"},cu={welkom:"Welkom",aanwezig:"Aanwezig",nieuws:"Nieuws",verlichting:"Verlichting",agenda:"Agenda"},pu=i=>ba[i]??b(i),xd={verlichting:"beheer",show_aanwezig:!0,show_nieuws:!0,show_agenda:!0,show_weer:!0,show_openingstijden:!0,show_mededeling:!0,show_uurweer:!0,terug_na:60,carrousel:0,nachtstand:!0,groepeer_functie:!1,uiterlijk:"donker",foto_vorm:"rond",schaal:1,aanwezig_teller:!0,nieuws_afbeeldingen:!0},hu=`
  :host { display: block; height: 100%; }

  .scherm {
    --tone: var(--dac-accent-hi);
    --s: 1;
    position: relative; width: 100%; height: var(--hoogte, 100dvh);
    overflow: hidden; background: var(--dac-bg); color: var(--dac-ink);
    display: flex; flex-direction: column;
    padding: calc(28px * var(--s)) calc(40px * var(--s)) calc(20px * var(--s));
    gap: calc(20px * var(--s));
    user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  /* Een wachtkamer is overdag licht; dan een lichte uitvoering. Alleen de
     ladders veranderen, de vorm niet. */
  .scherm.licht {
    --dac-bg: #f3f1ec; --dac-bg-raise: #ffffff;
    --dac-surface: rgba(20, 20, 10, 0.045); --dac-surface-hi: rgba(20, 20, 10, 0.08);
    --dac-border: rgba(20, 20, 10, 0.10); --dac-border-hi: rgba(20, 20, 10, 0.2);
    --dac-ink: #1a1a17; --dac-ink-2: rgba(26, 26, 23, 0.66); --dac-ink-3: rgba(26, 26, 23, 0.42);
    --dac-shadow: none;
  }

  .icon { width: 1em; height: 1em; display: block; }
  /* De vakken staan op display: flex, en dat wint van het [hidden] van de
     browser. Zonder deze regel staat een verborgen vak gewoon in beeld. */
  [hidden] { display: none !important; }

  /* ------------------------------------------------------------ kop */
  .kop { display: flex; align-items: center; justify-content: space-between; gap: calc(24px * var(--s)); flex: 0 0 auto; }
  .merk { display: flex; align-items: center; gap: calc(16px * var(--s)); min-width: 0; }
  .logo {
    width: calc(64px * var(--s)); height: calc(64px * var(--s)); flex: 0 0 auto;
    border-radius: var(--dac-radius-sm); display: grid; place-items: center; overflow: hidden;
    color: var(--tone); font-weight: 700; font-size: calc(20px * var(--s));
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 32%, transparent);
  }
  .logo img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .logo.beeld { background: none; border: none; }
  .praktijk { display: flex; flex-direction: column; gap: calc(3px * var(--s)); min-width: 0; }
  .naam { font-size: calc(24px * var(--s)); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .adres { font-size: calc(15px * var(--s)); color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tijd { display: flex; flex-direction: column; align-items: flex-end; flex: 0 0 auto; }
  .klok { font-size: calc(64px * var(--s)); font-weight: 300; line-height: 1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .datum { font-size: calc(17px * var(--s)); color: var(--dac-ink-2); margin-top: calc(2px * var(--s)); }

  /* ------------------------------------------------------------ pagina's */
  .pagina { display: none; flex: 1 1 auto; min-height: 0; flex-direction: column; gap: calc(20px * var(--s)); }
  .pagina.actief { display: flex; }

  .eyebrow { font-size: calc(12px * var(--s)); font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--dac-ink-3); }
  .titel { font-size: calc(36px * var(--s)); font-weight: 600; letter-spacing: -0.01em; line-height: 1.15; }
  .onder { font-size: calc(18px * var(--s)); color: var(--dac-ink-2); }
  .kopregel { display: flex; flex-direction: column; gap: calc(4px * var(--s)); flex: 0 0 auto; }

  .vak {
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius); box-shadow: var(--dac-shadow);
    padding: calc(20px * var(--s)) calc(24px * var(--s));
    display: flex; flex-direction: column; gap: calc(14px * var(--s)); min-height: 0;
  }

  /* welkom */
  .welkom-raster { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(20px * var(--s)); flex: 1 1 auto; min-height: 0; }
  .kolom { display: flex; flex-direction: column; gap: calc(20px * var(--s)); min-height: 0; }
  .weer-nu { display: flex; align-items: center; gap: calc(18px * var(--s)); }
  .weer-chip {
    width: calc(68px * var(--s)); height: calc(68px * var(--s)); flex: 0 0 auto;
    border-radius: var(--dac-radius-sm); display: grid; place-items: center;
    color: var(--dac-solar); font-size: calc(38px * var(--s));
    background: color-mix(in srgb, var(--dac-solar) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--dac-solar) 32%, transparent);
  }
  .weer-chip.koud { --w: var(--dac-grid-in); color: var(--w); background: color-mix(in srgb, var(--w) 14%, transparent); border-color: color-mix(in srgb, var(--w) 32%, transparent); }
  .temp { font-size: calc(42px * var(--s)); font-weight: 300; line-height: 1; font-variant-numeric: tabular-nums; }
  .weer-tekst { font-size: calc(16px * var(--s)); color: var(--dac-ink-2); margin-top: calc(4px * var(--s)); }
  .uren { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: calc(10px * var(--s)); }
  .uur { display: flex; flex-direction: column; align-items: center; gap: calc(5px * var(--s)); padding: calc(10px * var(--s)) 0; border-radius: var(--dac-radius-sm); background: var(--dac-surface); }
  .uur .u { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); }
  .uur .icon { font-size: calc(22px * var(--s)); color: var(--dac-ink-2); }
  .uur .t { font-size: calc(17px * var(--s)); font-variant-numeric: tabular-nums; }

  .mededeling {
    border-color: color-mix(in srgb, var(--tone) 40%, transparent);
    background: color-mix(in srgb, var(--tone) 10%, transparent);
    flex-direction: row; align-items: center; gap: calc(16px * var(--s)); flex: 0 0 auto;
  }
  .mededeling .chip { color: var(--tone); }
  .chip {
    width: calc(46px * var(--s)); height: calc(46px * var(--s)); flex: 0 0 auto; font-size: calc(24px * var(--s));
    border-radius: var(--dac-radius-sm); display: grid; place-items: center;
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 32%, transparent);
  }
  .mededeling .eyebrow { color: var(--tone); }
  .mededeling .tekst { font-size: calc(18px * var(--s)); line-height: 1.35; }

  .openingstijden { flex: 1 1 auto; }
  .ot { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(6px * var(--s)) calc(28px * var(--s)); font-size: calc(16px * var(--s)); }
  .ot div { display: flex; justify-content: space-between; gap: calc(12px * var(--s)); }
  .ot span:first-child { color: var(--dac-ink-2); }
  .ot .vandaag span:first-child { color: var(--tone); font-weight: 600; }
  .ot .vandaag span:last-child { font-weight: 600; }
  .ot .dicht span:last-child { color: var(--dac-ink-3); }
  .ot .num { font-variant-numeric: tabular-nums; }
  .welkomtekst { font-size: calc(36px * var(--s)); font-weight: 600; letter-spacing: -0.01em; line-height: 1.15; }
  .welkom-onder { font-size: calc(18px * var(--s)); color: var(--dac-ink-2); }

  /* aanwezig */
  .personen { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: calc(14px * var(--s)); align-content: start; overflow-y: auto; flex: 1 1 auto; min-height: 0; padding-bottom: calc(4px * var(--s)); }
  .groep { grid-column: 1 / -1; padding-top: calc(6px * var(--s)); }
  .persoon {
    display: flex; align-items: center; gap: calc(16px * var(--s));
    padding: calc(16px * var(--s)) calc(18px * var(--s)); cursor: pointer;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius); box-shadow: var(--dac-shadow); min-height: calc(88px * var(--s));
    text-align: left; font: inherit; color: inherit;
  }
  .persoon:active { background: var(--dac-surface-hi); }
  .avatar {
    width: calc(60px * var(--s)); height: calc(60px * var(--s)); flex: 0 0 auto; overflow: hidden;
    border-radius: var(--dac-radius-sm); display: grid; place-items: center;
    font-size: calc(20px * var(--s)); font-weight: 700;
    color: var(--dac-ink-3); background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .rond .avatar { border-radius: 50%; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .persoon.aan .avatar { color: var(--tone); background: color-mix(in srgb, var(--tone) 14%, transparent); border-color: color-mix(in srgb, var(--tone) 40%, transparent); }
  .persoon.aan .avatar img { opacity: 1; }
  .persoon:not(.aan) .avatar img { opacity: 0.45; filter: grayscale(1); }
  .p-tekst { min-width: 0; display: flex; flex-direction: column; gap: calc(2px * var(--s)); }
  .p-naam { font-size: calc(19px * var(--s)); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .p-functie { font-size: calc(14px * var(--s)); color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .p-status { font-size: calc(13px * var(--s)); font-weight: 600; color: var(--dac-ink-3); margin-top: calc(2px * var(--s)); }
  .persoon.aan .p-status { color: var(--tone); }

  /* De tegels zijn een <div role="button"> en geen <button>: Chrome maakt van
     een <button> geen echte flexcontainer (de inhoud wordt gecentreerd en
     krijgt geen hoogte), en dan schoof de samenvatting over de titel heen.
     Gemeten op 9 september 2026 met de NOS-feed. */
  .persoon, .bericht, .lamp { -webkit-appearance: none; appearance: none; }
  .persoon:focus-visible, .bericht:focus-visible, .lamp:focus-visible { outline: 2px solid var(--tone); outline-offset: 2px; }

  /* nieuws */
  .nieuws { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(14px * var(--s)); align-content: start; overflow-y: auto; flex: 1 1 auto; min-height: 0; }
  .bericht {
    display: flex; gap: calc(16px * var(--s)); padding: calc(16px * var(--s)) calc(18px * var(--s)); cursor: pointer;
    background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius);
    box-shadow: var(--dac-shadow); text-align: left; font: inherit; color: inherit; min-height: calc(96px * var(--s));
  }
  .bericht.eigen { border-color: color-mix(in srgb, var(--tone) 40%, transparent); }
  .bericht .foto { width: calc(96px * var(--s)); height: calc(72px * var(--s)); flex: 0 0 auto; border-radius: var(--dac-radius-sm); overflow: hidden; background: var(--dac-surface); }
  .bericht .foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .b-tekst { min-width: 0; display: flex; flex-direction: column; gap: calc(4px * var(--s)); }
  .b-bron { font-size: calc(12px * var(--s)); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dac-ink-3); }
  .bericht.eigen .b-bron { color: var(--tone); }
  .b-titel { font-size: calc(18px * var(--s)); font-weight: 600; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .b-samenvatting { font-size: calc(14px * var(--s)); color: var(--dac-ink-2); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .leeg { color: var(--dac-ink-3); font-size: calc(18px * var(--s)); padding: calc(24px * var(--s)); text-align: center; grid-column: 1 / -1; }

  /* verlichting en agenda */
  .lampen { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: calc(14px * var(--s)); align-content: start; overflow-y: auto; flex: 1 1 auto; min-height: 0; }
  .lamp {
    display: flex; align-items: center; gap: calc(16px * var(--s)); padding: calc(18px * var(--s)) calc(20px * var(--s)); cursor: pointer;
    background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius);
    box-shadow: var(--dac-shadow); text-align: left; font: inherit; color: inherit; min-height: calc(96px * var(--s));
  }
  .lamp:active { background: var(--dac-surface-hi); }
  .lamp .chip { --tone: var(--dac-ink-3); color: var(--dac-ink-3); width: calc(60px * var(--s)); height: calc(60px * var(--s)); font-size: calc(30px * var(--s)); background: var(--dac-surface); border-color: var(--dac-border); }
  .lamp.aan .chip { --tone: var(--lampkleur, var(--dac-lit)); color: var(--tone); background: color-mix(in srgb, var(--tone) 14%, transparent); border-color: color-mix(in srgb, var(--tone) 32%, transparent); }
  .lamp.dood { opacity: 0.5; }
  .l-naam { font-size: calc(19px * var(--s)); font-weight: 600; }
  .l-status { font-size: calc(14px * var(--s)); color: var(--dac-ink-2); margin-top: calc(3px * var(--s)); }

  .afspraken { display: flex; flex-direction: column; gap: calc(10px * var(--s)); overflow-y: auto; flex: 1 1 auto; min-height: 0; }
  .afspraak { display: flex; align-items: center; gap: calc(18px * var(--s)); padding: calc(14px * var(--s)) calc(20px * var(--s)); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); }
  .a-tijd { font-size: calc(20px * var(--s)); font-variant-numeric: tabular-nums; color: var(--tone); font-weight: 600; min-width: calc(120px * var(--s)); }
  .a-tekst { font-size: calc(19px * var(--s)); }
  .a-kalender { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); margin-left: auto; }

  /* ------------------------------------------------------------ tabs */
  .tabs { display: flex; justify-content: center; gap: calc(10px * var(--s)); flex: 0 0 auto; }
  .tabs:empty { display: none; }
  .tab {
    display: flex; align-items: center; gap: calc(10px * var(--s)); height: calc(50px * var(--s)); padding: 0 calc(22px * var(--s));
    border-radius: var(--dac-radius-pill); font: inherit; font-size: calc(16px * var(--s)); font-weight: 500; cursor: pointer;
    color: var(--dac-ink-2); background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .tab .icon { font-size: calc(21px * var(--s)); }
  .tab.actief { color: var(--dac-ink); font-weight: 600; background: color-mix(in srgb, var(--tone) 22%, transparent); border-color: color-mix(in srgb, var(--tone) 50%, transparent); }

  /* ------------------------------------------------------------ lagen */
  .laag { position: absolute; inset: 0; display: none; background: var(--dac-bg); color: var(--dac-ink); }
  .laag.open { display: flex; }
  .nacht { flex-direction: column; align-items: center; justify-content: center; gap: calc(12px * var(--s)); cursor: pointer; }
  .nacht .klok { font-size: calc(140px * var(--s)); opacity: 0.85; }
  .nacht .datum { font-size: calc(22px * var(--s)); }
  .nacht .gesloten { margin-top: calc(24px * var(--s)); display: flex; align-items: center; gap: calc(12px * var(--s)); font-size: calc(20px * var(--s)); color: var(--dac-ink-2); }
  .nacht .gesloten .icon { font-size: calc(24px * var(--s)); color: var(--dac-ink-3); }
  .nacht .logo { margin-bottom: calc(20px * var(--s)); width: calc(96px * var(--s)); height: calc(96px * var(--s)); }

  .detail { padding: calc(40px * var(--s)); flex-direction: column; gap: calc(18px * var(--s)); background: color-mix(in srgb, var(--dac-bg) 96%, transparent); }
  .detail .sluit { align-self: flex-end; display: flex; align-items: center; gap: calc(8px * var(--s)); font: inherit; font-size: calc(16px * var(--s)); color: var(--dac-ink-2); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill); height: calc(46px * var(--s)); padding: 0 calc(18px * var(--s)); cursor: pointer; }
  .detail .d-bron { font-size: calc(13px * var(--s)); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--tone); }
  .detail .d-titel { font-size: calc(34px * var(--s)); font-weight: 600; line-height: 1.15; }
  .detail .d-inhoud { display: flex; gap: calc(28px * var(--s)); min-height: 0; flex: 1 1 auto; }
  .detail .d-foto { flex: 0 0 40%; border-radius: var(--dac-radius); overflow: hidden; max-height: 100%; }
  .detail .d-foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .detail .d-foto:empty { display: none; }
  .detail .d-tekst { font-size: calc(20px * var(--s)); line-height: 1.5; color: var(--dac-ink-2); white-space: pre-wrap; overflow-y: auto; }
  .detail .d-datum { font-size: calc(14px * var(--s)); color: var(--dac-ink-3); }

  .merkje {
    position: absolute; top: calc(10px * var(--s)); right: calc(14px * var(--s)); display: none; align-items: center; gap: calc(6px * var(--s));
    font-size: calc(12px * var(--s)); color: var(--dac-ink-3); background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius-pill); padding: calc(4px * var(--s)) calc(10px * var(--s));
  }
  .merkje.open { display: flex; }
  .merkje .icon { font-size: calc(14px * var(--s)); }

  /* hover bestaat niet op een wachtkamerscherm; alleen echte muizen. */
  @media (hover: hover) {
    .persoon:hover, .lamp:hover, .bericht:hover, .tab:hover { background: var(--dac-surface-hi); }
  }
`,jt=class extends S{constructor(){super(),this.stand_=null,this.feeds_=[],this.rechten_={},this.pagina_="welkom",this.forecast_=[],this.afspraken_=[],this.welkomTel_=0,this.mededelingTel_=0,this.nachtSluimer_=0,this.herkansing_=new oe(()=>this.haal_()),this.verbinding_=new xe,this.fout_=null}validate(e){let t={...xd,...e};return t.lights=Array.isArray(t.lights)?t.lights:t.lights?[t.lights]:[],t.calendars=Array.isArray(t.calendars)?t.calendars:t.calendars?[t.calendars]:[],t.terug_na=Math.max(0,Number(t.terug_na)||0),t.carrousel=Math.max(0,Number(t.carrousel)||0),t.schaal=Math.min(2,Math.max(.5,Number(t.schaal)||1)),t}watched(){return[this.config.weather,...this.config.lights].filter(Boolean)}getCardSize(){return 12}template(){let e=this.config;return`
      <div class="scherm ${e.uiterlijk==="licht"?"licht":""} ${e.foto_vorm==="rond"?"rond":""}">
        <div class="kop">
          <div class="merk">
            <div class="logo"></div>
            <div class="praktijk"><div class="naam"></div><div class="adres"></div></div>
          </div>
          <div class="tijd"><div class="klok">--:--</div><div class="datum"></div></div>
        </div>

        <section class="pagina" data-p="welkom">
          <div class="kopregel"><div class="welkomtekst"></div><div class="welkom-onder"></div></div>
          <div class="welkom-raster">
            <div class="kolom">
              <div class="vak weer" ${e.show_weer&&e.weather?"":"hidden"}>
                <div class="eyebrow weer-kop">Het weer</div>
                <div class="weer-nu">
                  <div class="weer-chip"></div>
                  <div><div class="temp">--\xB0</div><div class="weer-tekst"></div></div>
                </div>
                <div class="uren" ${e.show_uurweer?"":"hidden"}></div>
              </div>
              <div class="vak agenda-kort" hidden>
                <div class="eyebrow">Vandaag</div>
                <div class="afspraken klein"></div>
              </div>
            </div>
            <div class="kolom">
              <div class="vak mededeling" hidden>
                <div class="chip">${ba.megaphone}</div>
                <div><div class="eyebrow">Mededeling</div><div class="tekst"></div></div>
              </div>
              <div class="vak openingstijden" hidden>
                <div class="eyebrow">Openingstijden</div>
                <div class="ot"></div>
                <div class="onder ot-nu"></div>
              </div>
            </div>
          </div>
        </section>

        <section class="pagina" data-p="aanwezig">
          <div class="kopregel">
            <div class="eyebrow">Wie is er vandaag</div>
            <div class="titel a-titel">Aanwezig</div>
            <div class="onder">Tik op uw naam om u aan of af te melden.</div>
          </div>
          <div class="personen"></div>
        </section>

        <section class="pagina" data-p="nieuws">
          <div class="kopregel"><div class="eyebrow">Nieuws</div><div class="titel">Wat er speelt</div></div>
          <div class="nieuws"></div>
        </section>

        <section class="pagina" data-p="verlichting">
          <div class="kopregel">
            <div class="eyebrow">Verlichting</div>
            <div class="titel">Lampen</div>
            <div class="onder">Tik op een lamp om hem aan of uit te zetten.</div>
          </div>
          <div class="lampen"></div>
        </section>

        <section class="pagina" data-p="agenda">
          <div class="kopregel"><div class="eyebrow">Agenda</div><div class="titel">Vandaag</div></div>
          <div class="afspraken groot"></div>
        </section>

        <nav class="tabs"></nav>

        <div class="laag detail">
          <button class="sluit" type="button">${b("close")} Sluiten</button>
          <div class="d-bron"></div>
          <div class="d-titel"></div>
          <div class="d-datum"></div>
          <div class="d-inhoud"><div class="d-foto"></div><div class="d-tekst"></div></div>
        </div>

        <div class="laag nacht">
          <div class="logo"></div>
          <div class="klok">--:--</div>
          <div class="datum"></div>
          <div class="gesloten">${ba.moon}<span></span></div>
        </div>

        <div class="merkje">${ba.offline}<span>Geen verbinding</span></div>
      </div>`}wire(){let e=this.$(".scherm");this.on(e,"pointerdown",()=>this.leeft_(),{capture:!0,passive:!0}),this.on(this.$(".tabs"),"click",l=>{let d=l.target.closest(".tab");d&&this.gaNaar_(d.dataset.p)}),this.on(this.$(".personen"),"click",l=>{let d=l.target.closest(".persoon");d&&this.tikPersoon_(d.dataset.id)}),this.on(this.$(".lampen"),"click",l=>{let d=l.target.closest(".lamp");d&&this.tikLamp_(d.dataset.id)}),this.on(this.$(".nieuws"),"click",l=>{let d=l.target.closest(".bericht");d&&this.openBericht_(d.dataset.id)}),this.on(this.$(".detail .sluit"),"click",()=>this.sluitBericht_()),this.on(this.$(".nacht"),"click",()=>{this.nachtSluimer_=Date.now()+Math.max(30,this.config.terug_na||60)*1e3,this.paintNacht_()});let t=()=>{if(this.inDialoog_())return e.style.setProperty("--hoogte","600px");let l=Math.max(0,Math.round(this.getBoundingClientRect().top)),d=l?`calc(100dvh - ${l}px)`:"100dvh";e.style.getPropertyValue("--hoogte")!==d&&e.style.setProperty("--hoogte",d)},n=()=>{t();let l=e.getBoundingClientRect();if(!l.width)return;let d=Math.min(l.width/1194,l.height?l.height/834:9)*this.config.schaal;e.style.setProperty("--s",Math.max(.35,d).toFixed(3))},a=new ResizeObserver(n);a.observe(e),this.teardown_.push(()=>a.disconnect()),this.on(window,"resize",t),n();let r=()=>{this.paintKlok_(),this.paintNacht_()},o=()=>{r(),this.klokTimer_=setTimeout(o,6e4-Date.now()%6e4+20)};o(),this.teardown_.push(()=>clearTimeout(this.klokTimer_));let s=setInterval(()=>{this.welkomTel_+=1,this.mededelingTel_+=1,this.paintWelkom_()},2e4);if(this.teardown_.push(()=>clearInterval(s)),this.leeft_(),this.teardown_.push(()=>{clearTimeout(this.terugTimer_),clearInterval(this.carrouselTimer_)}),this.config.carrousel>0&&(this.carrouselTimer_=setInterval(()=>this.volgendePagina_(),this.config.carrousel*1e3)),this.config.calendars.length){let l=setInterval(()=>this.haalAgenda_(),6e5);this.teardown_.push(()=>clearInterval(l))}this.teardown_.push(()=>this.herkansing_.stop()),this.haal_(),this.luister_(),this.abonneerWeer_(),this.haalAgenda_()}inDialoog_(){let e=this;for(;e;){let n=e.getRootNode?.()?.host;if(!n)return!1;let a=n.tagName?.toLowerCase()??"";if(a==="hui-dialog-edit-card"||a==="hui-card-preview"||a.startsWith("hui-dialog"))return!0;e=n}return!1}async haal_(){if(this.hass?.connection)try{let e=await ca(this.hass);this.stand_=e.stand,this.feeds_=e.feeds??[],this.rechten_=e,this.fout_=null,this.herkansing_.herstel(),this.paint()}catch(e){if(de(e)){this.herkansing_.plan();return}this.fout_=e?.message??"Het infoscherm kon niet laden.",this.paint()}}async abonnement_(e){let t=!1;this.teardown_.push(()=>{t=!0});let n=await e();t?n():this.teardown_.push(()=>{try{n()}catch{}})}async luister_(){if(this.hass?.connection?.subscribeMessage)try{await this.abonnement_(()=>pa(this.hass,e=>{if(e?.soort==="stand")this.stand_=e.stand;else if(e?.soort==="feeds")this.feeds_=e.feeds??[];else return;this.paint()}))}catch{}}set hass(e){let t=this.verbinding_.herverbonden(e);super.hass=e,t&&this.built_&&(this.haal_(),this.luister_()),this.paintMerkje_()}get hass(){return super.hass}async abonneerWeer_(){let e=this.config;if(!(!e.weather||!e.show_uurweer||!this.hass?.connection?.subscribeMessage))try{await this.abonnement_(()=>this.hass.connection.subscribeMessage(t=>{this.forecast_=t?.forecast??[],this.paintWeer_()},{type:"weather/subscribe_forecast",forecast_type:"hourly",entity_id:e.weather}))}catch{this.forecast_=[],this.paintWeer_()}}async haalAgenda_(){let e=this.config;if(!e.calendars.length||!this.hass?.connection)return;let t=new Date,n=new Date(t.getFullYear(),t.getMonth(),t.getDate()),a=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1);try{let o=(await this.hass.connection.sendMessagePromise({type:"call_service",domain:"calendar",service:"get_events",service_data:{entity_id:e.calendars,start_date_time:n.toISOString(),end_date_time:a.toISOString()},return_response:!0}))?.response??{},s=[];for(let[l,d]of Object.entries(o))for(let c of d?.events??[])s.push({kalender:l,...c});s.sort((l,d)=>String(l.start).localeCompare(String(d.start))),this.afspraken_=s}catch{this.afspraken_=[]}this.paintAgenda_()}leeft_(){clearTimeout(this.terugTimer_);let e=this.config.terug_na;e>0&&(this.terugTimer_=setTimeout(()=>{this.sluitBericht_(),this.gaNaar_("welkom")},e*1e3))}gaNaar_(e){let t=ga(this.config,this.stand_);this.pagina_=t.includes(e)?e:"welkom",this.paintPaginas_()}volgendePagina_(){let e=ga(this.config,this.stand_),t=e.indexOf(this.pagina_);this.gaNaar_(e[(t+1)%e.length])}async tikPersoon_(e){let t=this.stand_?.personen?.find(a=>a.id===e);if(!t||!this.hass)return;let n=!t.aanwezig;t.aanwezig=n,this.paintPersonen_();try{await od(this.hass,e,n)}catch{t.aanwezig=!n,this.paintPersonen_()}}tikLamp_(e){this.hass&&this.hass.callService("homeassistant","toggle",{entity_id:e})}openBericht_(e){let t=this.nieuws_().find(r=>r.id===e);if(!t)return;let n=this.$(".detail");this.text(".d-bron",t.eigen?this.stand_?.praktijk?.naam||"Mededeling":t.bron??""),this.text(".d-titel",t.titel),this.text(".d-datum",Tr(t.datum,new Date)),this.text(".d-tekst",t.tekst||"");let a=this.$(".d-foto");a.replaceChildren(),this.plaatje_(a,t),n.classList.add("open")}sluitBericht_(){this.$(".detail")?.classList.remove("open")}plaatje_(e,t){this.config.nieuws_afbeeldingen&&(t.eigen&&t.afbeelding?_t(this.hass,t.afbeelding).then(n=>{n&&e.isConnected&&(e.innerHTML=`<img alt="" src="${n}">`)}):!t.eigen&&t.afbeelding&&/^https?:/.test(t.afbeelding)&&(e.innerHTML=`<img alt="" src="${j(t.afbeelding)}" loading="lazy">`))}nieuws_(){return bd(this.stand_?.nieuws,this.feeds_,Ge(new Date))}paint(){this.$(".scherm")&&(this.paintAccent_(),this.paintKop_(),this.paintWelkom_(),this.paintWeer_(),this.paintPersonen_(),this.paintNieuws_(),this.paintLampen_(),this.paintAgenda_(),this.paintPaginas_(),this.paintNacht_(),this.paintMerkje_())}paintAccent_(){let e=this.config.accent||this.stand_?.praktijk?.accent;this.$(".scherm").style.setProperty("--tone",e||"var(--dac-accent-hi)")}paintKop_(){let e=this.stand_?.praktijk??{};this.text(".naam",e.naam||(this.fout_?"Infoscherm":"")),this.text(".adres",e.adres||"");for(let t of this.$$(".logo"))t.dataset.id!==(e.logo??"")&&(t.dataset.id=e.logo??"",t.classList.remove("beeld"),t.textContent=e.naam?e.naam.slice(0,1).toUpperCase():"",e.logo&&_t(this.hass,e.logo).then(n=>{!n||t.dataset.id!==e.logo||(t.innerHTML=`<img alt="" src="${n}">`,t.classList.add("beeld"))}));this.paintKlok_()}paintKlok_(){let e=new Date;for(let t of this.$$(".klok"))this.text(t,We(e));for(let t of this.$$(".datum"))this.text(t,md(e))}paintWelkom_(){let e=this.config,t=this.stand_?.praktijk??{},n=new Date,a=t.welkom?.length?t.welkom:["Welkom"];this.text(".welkomtekst",Or(a,this.welkomTel_));let r=qt(t,n),o="";ma(t)&&(o=r.open?`Vandaag geopend tot ${r.tot}`:Dr(t,n)),this.text(".welkom-onder",o);let s=e.show_mededeling?fd(this.stand_?.mededelingen,Ge(n)):[],l=this.$(".mededeling");l.hidden=s.length===0,s.length&&this.text(".mededeling .tekst",Or(s,this.mededelingTel_).tekst);let d=this.$(".openingstijden");if(d.hidden=!(e.show_openingstijden&&ma(t)),!d.hidden){let c=vd(t,n),p=[0,4,1,5,2,6,3].map(h=>c[h]);this.$(".ot").innerHTML=p.map(h=>`<div class="${h.vandaag?"vandaag":""} ${h.tekst==="gesloten"?"dicht":""}">
            <span>${j(h.naam)}${h.reden?` \xB7 ${j(h.reden)}`:""}</span><span class="num">${j(h.tekst)}</span></div>`).join(""),this.text(".ot-nu",r.open?`Nu geopend, tot ${r.tot}`:r.straks?`Nu gesloten, om ${r.straks} weer open`:"Vandaag gesloten")}}paintWeer_(){let e=this.config,t=this.$(".weer");if(!t||t.hidden)return;let n=v(this.hass,e.weather),a=q(this.hass,e.weather),r=this.$(".weer-chip"),o=Te(n?.state);r.dataset.icon!==o&&(r.dataset.icon=o,r.innerHTML=b(o,"cloud"));let s=a.temperature;r.classList.toggle("koud",typeof s=="number"&&s<5),this.text(".temp",typeof s=="number"?`${B(this.hass,s,0)}\xB0`:"--\xB0");let l=[];n&&l.push(J(this.hass,n)),typeof a.humidity=="number"&&l.push(`${Math.round(a.humidity)}% vochtig`),typeof a.wind_speed=="number"&&l.push(`wind ${B(this.hass,a.wind_speed,0)} ${a.wind_speed_unit??"km/h"}`),this.text(".weer-tekst",l.join(" \xB7 ")),this.text(".weer-kop",a.friendly_name?`Het weer \xB7 ${a.friendly_name}`:"Het weer");let d=this.$(".uren");if(d.hidden)return;let c=Date.now(),p=this.forecast_.filter(h=>new Date(h.datetime).getTime()>c-30*6e4).slice(0,4);d.innerHTML=p.map(h=>{let g=new Date(h.datetime);return`<div class="uur"><span class="u">${We(g)}</span>${b(Te(h.condition),"cloud")}<span class="t">${typeof h.temperature=="number"?`${Math.round(h.temperature)}\xB0`:"--"}</span></div>`}).join(""),d.hidden=p.length===0}paintPersonen_(){let e=this.config,t=this.stand_?.personen??[],n=this.$(".personen"),a=s=>`
      <div class="persoon ${s.aanwezig?"aan":""}" role="button" tabindex="0" data-id="${j(s.id)}" data-foto="${j(s.foto??"")}">
        <div class="avatar">${j(s.initialen||"?")}</div>
        <div class="p-tekst">
          <div class="p-naam">${j(s.naam)}</div>
          ${s.functie?`<div class="p-functie">${j(s.functie)}</div>`:""}
          <div class="p-status">${s.aanwezig?"Aanwezig":"Afwezig"}</div>
        </div>
      </div>`,r;if(e.groepeer_functie?r=kd(t).map(s=>`${s.functie?`<div class="eyebrow groep">${j(s.functie)}</div>`:""}${s.personen.map(a).join("")}`).join(""):r=t.map(a).join(""),n.innerHTML!==r){n.innerHTML=r;for(let s of n.querySelectorAll(".persoon[data-foto]:not([data-foto=''])"))_t(this.hass,s.dataset.foto).then(l=>{l&&s.isConnected&&(s.querySelector(".avatar").innerHTML=`<img alt="" src="${l}">`)})}let o=t.filter(s=>s.aanwezig).length;this.text(".a-titel",e.aanwezig_teller&&t.length?`${o} van ${t.length} aanwezig`:"Aanwezig")}paintNieuws_(){let e=this.nieuws_(),t=this.$(".nieuws"),n=e.length?e.map(a=>`<div class="bericht ${a.eigen?"eigen":""}" role="button" tabindex="0" data-id="${j(a.id)}">
              <div class="foto" ${a.afbeelding&&this.config.nieuws_afbeeldingen?"":"hidden"}></div>
              <div class="b-tekst">
                <div class="b-bron">${j(a.eigen?this.stand_?.praktijk?.naam||"Mededeling":a.bron??"")}${a.datum?` \xB7 ${j(Tr(a.datum,new Date))}`:""}</div>
                <div class="b-titel">${j(a.titel)}</div>
                ${a.tekst?`<div class="b-samenvatting">${j(a.tekst)}</div>`:""}
              </div>
            </div>`).join(""):'<div class="leeg">Er is op dit moment geen nieuws.</div>';if(t.innerHTML!==n){t.innerHTML=n;for(let a of t.querySelectorAll(".bericht")){let r=e.find(s=>s.id===a.dataset.id),o=a.querySelector(".foto");r&&o&&!o.hidden&&this.plaatje_(o,r)}}}paintLampen_(){let e=this.$(".lampen"),t=this.config.lights.map(n=>{let a=v(this.hass,n),r=a?.attributes??{},o=X(a),s=!a||a.state==="unavailable",l=r.rgb_color,d=o&&Array.isArray(l)&&!(l[0]>240&&l[1]>240&&l[2]>240)?`rgb(${l.join(",")})`:"",c=s?"Niet bereikbaar":o?typeof r.brightness=="number"?`Aan \xB7 ${Math.round(r.brightness/255*100)}%`:"Aan":"Uit";return`<div class="lamp ${o?"aan":""} ${s?"dood":""}" role="button" tabindex="0" data-id="${j(n)}" style="${d?`--lampkleur:${d}`:""}">
          <div class="chip">${b("bulb")}</div>
          <div><div class="l-naam">${j(r.friendly_name??n)}</div><div class="l-status">${c}</div></div>
        </div>`}).join("");e.innerHTML!==t&&(e.innerHTML=t)}paintAgenda_(){let e=this.$(".agenda-kort"),t=this.afspraken_,n=o=>{let l=!String(o.start).includes("T")?"hele dag":`${We(new Date(o.start))}${o.end?` \u2013 ${We(new Date(o.end))}`:""}`,d=q(this.hass,o.kalender).friendly_name??o.kalender;return`<div class="afspraak"><span class="a-tijd">${j(l)}</span><span class="a-tekst">${j(o.summary??"")}</span>${this.config.calendars.length>1?`<span class="a-kalender">${j(d)}</span>`:""}</div>`},a=t.length?t.map(n).join(""):'<div class="leeg">Geen afspraken vandaag.</div>',r=this.$(".afspraken.groot");if(r.innerHTML!==a&&(r.innerHTML=a),e.hidden=!(this.config.calendars.length&&this.config.show_agenda_welkom!==!1&&t.length),!e.hidden){let o=t.slice(0,3).map(n).join(""),s=e.querySelector(".afspraken");s.innerHTML!==o&&(s.innerHTML=o)}}paintPaginas_(){let e=ga(this.config,this.stand_);e.includes(this.pagina_)||(this.pagina_="welkom");for(let a of this.$$(".pagina"))a.classList.toggle("actief",a.dataset.p===this.pagina_);let t=this.$(".tabs"),n=e.length>1?e.map(a=>`<button class="tab ${a===this.pagina_?"actief":""}" type="button" data-p="${a}">${pu(du[a])}<span>${cu[a]}</span></button>`).join(""):"";t.innerHTML!==n&&(t.innerHTML=n)}paintNacht_(){let e=this.$(".nacht");if(!e)return;let t=this.stand_?.praktijk,n=new Date,a=!1;this.config.nachtstand&&t&&ma(t)&&!this.inDialoog_()&&(a=!qt(t,n).open&&Date.now()>this.nachtSluimer_),a&&this.text(".nacht .gesloten span",Dr(t,n)),e.classList.toggle("open",a)}paintMerkje_(){let e=this.$(".merkje");if(!e)return;let t=this.hass?.connected===!1;e.classList.toggle("open",t||!!this.fout_),this.text(".merkje span",t?"Geen verbinding":this.fout_??"")}};_(jt,"css",hu);var uu={weather:"Weerentiteit",lights:"Lampen",calendars:"Agenda's",verlichting:"Verlichtingspagina",show_aanwezig:"Pagina Aanwezig",show_nieuws:"Pagina Nieuws",show_agenda:"Pagina Agenda",show_weer:"Weer tonen",show_uurweer:"Uurvoorspelling tonen",show_openingstijden:"Openingstijden tonen",show_mededeling:"Mededeling tonen",show_agenda_welkom:"Afspraken ook op Welkom",terug_na:"Terug naar Welkom na (seconden)",carrousel:"Pagina's automatisch wisselen (seconden)",nachtstand:"Nachtstand buiten openingstijden",groepeer_functie:"Medewerkers per functie groeperen",aanwezig_teller:"Teller (x van y aanwezig)",uiterlijk:"Uiterlijk",foto_vorm:"Vorm van de foto's",nieuws_afbeeldingen:"Afbeeldingen bij het nieuws",accent:"Accentkleur (overschrijft het beheer)",schaal:"Schaal"},mu={verlichting:"Bij 'Volgens het beheer' bepaalt de receptie in het beheer of de lampen op dit scherm staan. Kies 'Altijd' voor een tablet in een kantoor waar alleen medewerkers zitten.",terug_na:"0 = nooit. Zo laat een bezoeker die op Nieuws bleef staan niet de volgende bezoeker een nieuwsbericht zien.",carrousel:"0 = uit. Elke tik zet de klok opnieuw.",nachtstand:"Buiten de openingstijden uit het beheer dimt het scherm naar een klok met 'Gesloten \xB7 morgen open om 08:00'. Een tik haalt het scherm even terug.",calendars:"De afspraken van vandaag uit deze agenda's, op een eigen pagina.",accent:"Meestal leeg laten: de kleur komt uit het beheer, waar de receptie hem instelt.",schaal:"1 is de maat van een iPad van 11 inch. Groter voor een tv aan de muur, kleiner voor een tablet van 8 inch."},Lr=class extends D{defaults(){return{...xd}}gedeeldeVelden(){return[]}schema(){return[{name:"weather",selector:m.entity("weather")},{name:"lights",selector:{entity:{multiple:!0,domain:["light","switch"]}}},{name:"verlichting",selector:m.select([{value:"beheer",label:"Volgens het beheer"},{value:"altijd",label:"Altijd tonen"},{value:"nooit",label:"Nooit tonen"}])},{name:"calendars",selector:{entity:{multiple:!0,domain:"calendar"}}},Fe("Pagina's en blokken","mdi:view-dashboard-outline",[$e({name:"show_aanwezig",selector:m.bool()},{name:"show_nieuws",selector:m.bool()}),$e({name:"show_agenda",selector:m.bool()},{name:"show_agenda_welkom",selector:m.bool()}),$e({name:"show_weer",selector:m.bool()},{name:"show_uurweer",selector:m.bool()}),$e({name:"show_openingstijden",selector:m.bool()},{name:"show_mededeling",selector:m.bool()}),$e({name:"groepeer_functie",selector:m.bool()},{name:"aanwezig_teller",selector:m.bool()}),{name:"nieuws_afbeeldingen",selector:m.bool()}]),Fe("Gedrag","mdi:timer-outline",[{name:"terug_na",selector:m.number(0,3600)},{name:"carrousel",selector:m.number(0,3600)},{name:"nachtstand",selector:m.bool()}]),Fe("Uiterlijk","mdi:palette-outline",[{name:"uiterlijk",selector:m.select([{value:"donker",label:"Donker"},{value:"licht",label:"Licht"}])},{name:"foto_vorm",selector:m.select([{value:"rond",label:"Rond"},{value:"vierkant",label:"Afgerond vierkant"}])},{name:"schaal",selector:m.number(.5,2,.05)},{name:"accent",selector:m.text()}])]}label(e){return e.type==="expandable"?e.title??"":uu[e.name]??super.label(e)}helper(e){return mu[e.name]}};N(Cr,jt,{name:"DomotiApp Infoscherm",description:"Beeldvullend scherm voor een wachtkamer: logo, klok, weer, wie er is, nieuws en verlichting. De inhoud komt uit DomotiApp Infoscherm Beheer.",preview:!1});H(`${Cr}-editor`,Lr);jt.getConfigElement=()=>document.createElement(`${Cr}-editor`);jt.getStubConfig=()=>({terug_na:60});var Rr="domotiapp-infoscherm-beheer-card",wd=["personen","mededelingen","nieuws","praktijk","instellingen"],yd={title:"Infoscherm",show_personen:!0,show_mededelingen:!0,show_nieuws:!0,show_praktijk:!0,show_instellingen:!0,open:"personen"},gu=`
  /* Een containerquery en geen mediaquery: de kaart staat in een kolom van
     een sections-view, en die is smal terwijl het venster breed is. */
  :host { container-type: inline-size; }
  .card { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 14px; }
  .icon { width: 1em; height: 1em; display: block; }

  .kop { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .kop h2 { margin: 0; font-size: 17px; font-weight: 600; }
  .kop .eyebrow { margin-bottom: 2px; }
  .status { font-size: 12px; color: var(--dac-ink-3); display: flex; align-items: center; gap: 6px; }
  .status.fout { color: var(--dac-bad); }

  /* Een blok: kop met pijl, inhoud eronder. E\xE9n tegelijk open houdt het overzicht. */
  .blok { border: 1px solid var(--dac-border); border-radius: var(--dac-radius-sm); overflow: hidden; }
  .blok > .bk {
    display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 14px; cursor: pointer;
    background: var(--dac-surface); border: none; font: inherit; color: inherit; text-align: left;
  }
  .blok > .bk .icon { font-size: 18px; color: var(--dac-ink-3); transition: transform 160ms; }
  .blok.open > .bk .icon.pijl { transform: rotate(180deg); }
  .blok > .bk b { font-size: 14px; font-weight: 600; flex: 1 1 auto; }
  .blok > .bk .tel { font-size: 12px; color: var(--dac-ink-3); }
  .blok > .bk .vuil { font-size: 11px; font-weight: 600; color: var(--dac-warn); }
  .blok > .inhoud { display: none; padding: 14px; flex-direction: column; gap: 12px; }
  .blok.open > .inhoud { display: flex; }

  /* velden */
  .rij { display: grid; gap: 10px; align-items: center; }
  .veld { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .veld label { font-size: 12px; color: var(--dac-ink-2); }
  input[type="text"], input[type="url"], input[type="date"], input[type="time"], input[type="color"], textarea, select {
    font: inherit; font-size: 14px; color: var(--dac-ink); background: var(--dac-surface);
    border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-sm); padding: 8px 10px;
    min-height: 40px; width: 100%; min-width: 0; color-scheme: dark;
  }
  input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  textarea { min-height: 72px; resize: vertical; line-height: 1.4; }
  input[type="color"] { padding: 2px 4px; width: 56px; }
  input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--dac-accent-hi); margin: 0; }
  .vink { display: flex; align-items: center; gap: 8px; font-size: 13px; min-height: 40px; cursor: pointer; }

  /* de schakelaar voor aan/uit-dingen */
  .schakel { position: relative; width: 44px; height: 24px; flex: 0 0 auto; }
  .schakel input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer; }
  .schakel span { position: absolute; inset: 0; border-radius: 999px; background: var(--dac-border-hi); transition: background 120ms; }
  .schakel span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: var(--dac-ink); transition: transform 120ms; }
  .schakel input:checked + span { background: var(--dac-accent-hi); }
  .schakel input:checked + span::after { transform: translateX(20px); }

  .knop {
    display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; cursor: pointer;
    font: inherit; font-size: 13px; font-weight: 600; color: var(--dac-ink-2);
    background: var(--dac-surface); border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-pill);
  }
  .knop .icon { font-size: 16px; }
  .knop.acc { color: var(--dac-ink); background: var(--dac-accent-soft); border-color: color-mix(in srgb, var(--dac-accent-hi) 50%, transparent); }
  .knop.vuil { background: var(--dac-accent-hi); color: #fff; border-color: transparent; }
  .knop.klein { height: 32px; padding: 0 10px; font-size: 12px; }
  .knop.ico { width: 32px; height: 32px; padding: 0; justify-content: center; border-radius: var(--dac-radius-sm); }
  .knop.gevaar { color: var(--dac-bad); }
  .knop:disabled { opacity: 0.5; cursor: default; }
  .voet { display: flex; justify-content: flex-end; align-items: center; gap: 10px; flex-wrap: wrap; }
  .voet .melding { font-size: 12px; color: var(--dac-ink-3); margin-right: auto; }
  .voet .melding.fout { color: var(--dac-bad); }

  /* lijsten */
  .lijst { display: flex; flex-direction: column; gap: 8px; }
  .item { display: grid; gap: 10px; align-items: center; padding: 10px 12px; border-radius: var(--dac-radius-sm); background: var(--dac-surface); }
  .item.persoon { grid-template-columns: 44px minmax(0, 1.4fr) minmax(0, 1fr) auto auto; }
  .item.mededeling { grid-template-columns: minmax(0, 2fr) 150px 150px auto; }
  .item.bericht { grid-template-columns: minmax(0, 1fr); }
  .item.feed { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto; }
  .item.uitz { grid-template-columns: 150px auto 110px 110px minmax(0, 1fr) auto; }
  .knoppen { display: flex; gap: 6px; align-items: center; justify-content: flex-end; }
  .avatar { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; font-size: 14px; font-weight: 700; color: var(--dac-ink-3); background: var(--dac-surface-hi); border: 1px solid var(--dac-border); cursor: pointer; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .avatar.aan { color: var(--dac-accent-hi); background: var(--dac-accent-soft); border-color: color-mix(in srgb, var(--dac-accent-hi) 40%, transparent); }
  .leeg { font-size: 13px; color: var(--dac-ink-3); padding: 6px 2px; }

  .bericht .b-rij { display: grid; grid-template-columns: minmax(0, 1fr) 150px 150px auto; gap: 10px; align-items: end; }
  .bericht .b-onder { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .plaatje { width: 96px; height: 64px; border-radius: var(--dac-radius-sm); overflow: hidden; background: var(--dac-surface-hi); display: grid; place-items: center; color: var(--dac-ink-3); font-size: 20px; }
  .plaatje img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .plaatje.logo { width: 64px; height: 64px; }
  .plaatje.logo img { object-fit: contain; }

  .ot-tabel { display: grid; grid-template-columns: 90px auto 100px 100px 100px 100px; gap: 6px 10px; align-items: center; font-size: 13px; }
  .ot-tabel .k { font-size: 11px; color: var(--dac-ink-3); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .ot-tabel input[type="time"] { min-height: 34px; padding: 4px 6px; font-size: 13px; }
  .ot-tabel .dag { color: var(--dac-ink-2); }
  .ot-tabel input:disabled { opacity: 0.35; }

  .twee { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .drie { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .hulp { font-size: 12px; color: var(--dac-ink-3); line-height: 1.4; }
  .gebruikers { display: flex; flex-direction: column; gap: 6px; }
  .feedfout { font-size: 12px; color: var(--dac-bad); }

  .geen { padding: 24px; text-align: center; color: var(--dac-ink-3); font-size: 14px; }
  .file { display: none; }

  @container (max-width: 720px) {
    .item.persoon { grid-template-columns: 44px minmax(0, 1fr) auto; }
    .item.persoon .veld:nth-child(3) { grid-column: 2 / -1; }
    .item.mededeling, .bericht .b-rij, .item.uitz { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .item.feed { grid-template-columns: minmax(0, 1fr); }
    .ot-tabel { grid-template-columns: 70px auto 1fr 1fr; }
    .ot-tabel .vak2 { display: none; }
    .twee, .drie { grid-template-columns: minmax(0, 1fr); }
  }
`,_d={personen:{titel:"Medewerkers",icoon:"people"},mededelingen:{titel:"Mededeling van de dag",icoon:"bell"},nieuws:{titel:"Nieuws van het pand",icoon:"calendar"},praktijk:{titel:"Praktijk, logo en openingstijden",icoon:"house"},instellingen:{titel:"Instellingen",icoon:"cog"}},va=i=>JSON.parse(JSON.stringify(i??null)),te=i=>j(i??""),zt=class extends S{constructor(){super(),this.stand_=null,this.rechten_={},this.feedFouten_={},this.werk_={},this.vuil_=new Set,this.open_=null,this.gebruikers_=null,this.meldingen_={},this.herkansing_=new oe(()=>this.haal_()),this.verbinding_=new xe,this.fout_=null}validate(e){return{...yd,...e}}watched(){return[]}getCardSize(){return 6}getGridOptions(){return{columns:"full",rows:"auto",min_rows:this.minRijen_(".card",6)}}blokken_(){return wd.filter(e=>this.config[`show_${e}`]!==!1)}template(){let e=this.config;return`
      <div class="card surface ${e.bare?"bare":""}">
        <div class="kop">
          <div>
            <div class="eyebrow">DomotiApp Infoscherm</div>
            <h2>${te(e.title)}</h2>
          </div>
          <div class="status"></div>
        </div>
        <div class="geen" hidden></div>
        ${this.blokken_().map(t=>`<section class="blok" data-blok="${t}">
              <button class="bk" type="button">${b(_d[t].icoon)}<b>${_d[t].titel}</b><span class="vuil" hidden>niet opgeslagen</span><span class="tel"></span>${b("chevronDown")}</button>
              <div class="inhoud"></div>
            </section>`).join("")}
        <input class="file" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml">
      </div>`}wire(){let e=this.$(".card");this.teardown_.push(R(e)),this.teardown_.push(()=>this.herkansing_.stop()),this.on(e,"click",t=>this.klik_(t)),this.on(e,"input",t=>this.invoer_(t)),this.on(e,"change",t=>this.invoer_(t)),this.on(this.$(".file"),"change",t=>this.bestandGekozen_(t)),this.open_=this.open_??this.config.open,this.haal_(),this.luister_()}set hass(e){let t=this.verbinding_.herverbonden(e);super.hass=e,t&&this.built_&&(this.haal_(),this.luister_())}get hass(){return super.hass}async haal_(){if(this.hass?.connection)try{let e=await ca(this.hass);this.rechten_=e,this.feedFouten_=e.feed_fouten??{},this.fout_=null,this.herkansing_.herstel(),this.nieuweStand_(e.stand),e.is_admin&&this.gebruikers_===null&&cd(this.hass).then(t=>{this.gebruikers_=t.gebruikers??[],this.teken_("instellingen")}).catch(()=>{this.gebruikers_=[]})}catch(e){if(de(e)){this.herkansing_.plan(),this.status_("Home Assistant start nog op\u2026");return}this.fout_=e?.message??"Het beheer kon niet laden.",this.paint()}}async luister_(){if(!this.hass?.connection?.subscribeMessage)return;let e=!1;this.teardown_.push(()=>{e=!0});try{let t=await pa(this.hass,n=>{n?.soort==="stand"&&this.nieuweStand_(n.stand),n?.soort==="feeds"&&(this.feedFouten_=n.feed_fouten??{},this.teken_("instellingen"))});e?t():this.teardown_.push(()=>{try{t()}catch{}})}catch{}}nieuweStand_(e){this.stand_=e;for(let t of wd)this.vuil_.has(t)||(this.werk_[t]=va(e[t]));this.paint()}paint(){if(!this.$(".card"))return;let e=this.$(".geen");this.fout_?(e.hidden=!1,e.textContent=this.fout_):this.stand_&&this.rechten_.mag_beheren===!1?(e.hidden=!1,e.textContent="Dit account mag het infoscherm niet beheren. Log in als receptie of beheerder."):e.hidden=!0;let t=e.hidden&&this.stand_;for(let n of this.$$(".blok"))n.hidden=!t,n.classList.toggle("open",n.dataset.blok===this.open_);if(t){for(let n of this.blokken_())this.teken_(n);this.status_(this.hass?.connected===!1?"Geen verbinding":"")}}status_(e,t=!1){let n=this.$(".status");n&&(n.textContent=e,n.classList.toggle("fout",t))}teken_(e){let t=this.$(`.blok[data-blok="${e}"]`);if(!t||!this.stand_)return;let n=this.werk_[e],a={personen:()=>this.htmlPersonen_(n),mededelingen:()=>this.htmlMededelingen_(n),nieuws:()=>this.htmlNieuws_(n),praktijk:()=>this.htmlPraktijk_(n),instellingen:()=>this.htmlInstellingen_(n)}[e](),r=t.querySelector(".inhoud");r.innerHTML=a+this.htmlVoet_(e),this.plaatjes_(r),this.tel_(e)}tel_(e){let t=this.$(`.blok[data-blok="${e}"]`);if(!t)return;let n=this.werk_[e],a={personen:()=>`${(n??[]).filter(r=>r.aanwezig).length} van ${(n??[]).length} aanwezig`,mededelingen:()=>`${(n??[]).length}`,nieuws:()=>`${(n??[]).length}`,praktijk:()=>n?.naam??"",instellingen:()=>`${(n?.feeds??[]).length} bron(nen)`}[e]();t.querySelector(".tel").textContent=a,t.querySelector(".vuil").hidden=!this.vuil_.has(e)}htmlVoet_(e){let t=this.meldingen_[e];return`<div class="voet">
      <span class="melding ${t?.fout?"fout":""}">${te(t?.tekst)}</span>
      <button class="knop" type="button" data-actie="herstel" ${this.vuil_.has(e)?"":"disabled"}>Ongedaan maken</button>
      <button class="knop acc ${this.vuil_.has(e)?"vuil":""}" type="button" data-actie="opslaan">${b("check")} Opslaan</button>
    </div>`}veld_(e,t,n,{type:a="text",i:r,extra:o=""}={}){return`<div class="veld"><label>${te(e)}</label><input type="${a}" data-veld="${t}" ${r!==void 0?`data-i="${r}"`:""} value="${te(n)}" ${o}></div>`}schakel_(e,t,{i:n,label:a}={}){return`<label class="vink"><span class="schakel"><input type="checkbox" data-veld="${e}" ${n!==void 0?`data-i="${n}"`:""} ${t?"checked":""}><span></span></span>${a?`<span>${te(a)}</span>`:""}</label>`}htmlPersonen_(e=[]){return`<div class="hulp">Tik op de cirkel om een foto te kiezen. Zonder foto staan de initialen op het scherm. De volgorde hier is de volgorde op het scherm.</div>
      <div class="lijst">${e.map((n,a)=>`<div class="item persoon" data-i="${a}">
          <div class="avatar ${n.aanwezig?"aan":""}" data-actie="foto" data-i="${a}" data-bestand="${te(n.foto)}" title="Foto kiezen">${te(Nr(n.naam))}</div>
          ${this.veld_("Naam","naam",n.naam,{i:a})}
          ${this.veld_("Functie","functie",n.functie,{i:a})}
          ${this.schakel_("aanwezig",n.aanwezig,{i:a,label:n.aanwezig?"Aanwezig":"Afwezig"})}
          <div class="knoppen">
            <button class="knop ico" type="button" data-actie="omhoog" data-i="${a}" title="Omhoog" ${a===0?"disabled":""}>${b("arrowUp")}</button>
            <button class="knop ico" type="button" data-actie="omlaag" data-i="${a}" title="Omlaag" ${a===e.length-1?"disabled":""}>${b("arrowDown")}</button>
            ${n.foto?`<button class="knop ico" type="button" data-actie="fotoweg" data-i="${a}" title="Foto weghalen">${b("close")}</button>`:""}
            <button class="knop ico gevaar" type="button" data-actie="verwijder" data-i="${a}" title="Verwijderen">${b("minus")}</button>
          </div>
        </div>`).join("")||'<div class="leeg">Nog geen medewerkers.</div>'}</div>
      <div><button class="knop" type="button" data-actie="nieuw">${b("plus")} Medewerker toevoegen</button></div>`}htmlMededelingen_(e=[]){return`<div class="hulp">E\xE9n regel op de welkompagina, bijvoorbeeld "Vrijdag 20 september zijn wij vanaf 12:00 gesloten". Zonder datums staat hij er altijd; met meerdere wisselen ze elkaar af.</div>
      <div class="lijst">${e.map((n,a)=>`<div class="item mededeling" data-i="${a}">
          ${this.veld_("Tekst op het scherm","tekst",n.tekst,{i:a})}
          ${this.veld_("Vanaf","van",n.van,{i:a,type:"date"})}
          ${this.veld_("Tot en met","tot",n.tot,{i:a,type:"date"})}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="verwijder" data-i="${a}" title="Verwijderen">${b("minus")}</button></div>
        </div>`).join("")||'<div class="leeg">Geen mededeling.</div>'}</div>
      <div><button class="knop" type="button" data-actie="nieuw">${b("plus")} Mededeling toevoegen</button></div>`}htmlNieuws_(e=[]){return`<div class="hulp">Berichten van het pand: een nieuwe collega, een verbouwing, de vakantiesluiting. Ze staan v\xF3\xF3r het nieuws van buiten. Zonder datums blijft een bericht staan tot u het weghaalt.</div>
      <div class="lijst">${e.map((n,a)=>`<div class="item bericht" data-i="${a}">
          <div class="b-rij">
            ${this.veld_("Titel","titel",n.titel,{i:a})}
            ${this.veld_("Vanaf","van",n.van,{i:a,type:"date"})}
            ${this.veld_("Tot en met","tot",n.tot,{i:a,type:"date"})}
            <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="verwijder" data-i="${a}" title="Verwijderen">${b("minus")}</button></div>
          </div>
          <div class="veld"><label>Tekst</label><textarea data-veld="tekst" data-i="${a}">${te(n.tekst)}</textarea></div>
          <div class="b-onder">
            <div class="plaatje" data-bestand="${te(n.afbeelding)}">${n.afbeelding?"":b("camera")}</div>
            <button class="knop klein" type="button" data-actie="foto" data-i="${a}">${b("camera")} ${n.afbeelding?"Andere afbeelding":"Afbeelding kiezen"}</button>
            ${n.afbeelding?`<button class="knop klein" type="button" data-actie="fotoweg" data-i="${a}">${b("close")} Afbeelding weg</button>`:""}
            ${this.schakel_("vast",n.vast,{i:a,label:"Bovenaan vastzetten"})}
          </div>
        </div>`).join("")||'<div class="leeg">Nog geen berichten.</div>'}</div>
      <div><button class="knop" type="button" data-actie="nieuw">${b("plus")} Bericht toevoegen</button></div>`}htmlPraktijk_(e={}){let t=e.openingstijden??{},n=yt.map(r=>{let o=t[r]??[],s=o.length===0,l=(d,c)=>o[d]?.[c]??"";return`<span class="dag">${Ft[r]}</span>
        ${this.schakel_("ot_open",!s,{i:r,label:s?"gesloten":"open"})}
        <input type="time" data-veld="ot_0_0" data-i="${r}" value="${l(0,0)}" ${s?"disabled":""}>
        <input type="time" data-veld="ot_0_1" data-i="${r}" value="${l(0,1)}" ${s?"disabled":""}>
        <input type="time" class="vak2" data-veld="ot_1_0" data-i="${r}" value="${l(1,0)}" ${s?"disabled":""}>
        <input type="time" class="vak2" data-veld="ot_1_1" data-i="${r}" value="${l(1,1)}" ${s?"disabled":""}>`}).join(""),a=(e.uitzonderingen??[]).map((r,o)=>`<div class="item uitz" data-i="${o}">
          ${this.veld_("Datum","u_datum",r.datum,{i:o,type:"date"})}
          ${this.schakel_("u_open",(r.tijden??[]).length>0,{i:o,label:(r.tijden??[]).length?"open":"gesloten"})}
          ${this.veld_("Van","u_van",r.tijden?.[0]?.[0]??"",{i:o,type:"time",extra:r.tijden?.length?"":"disabled"})}
          ${this.veld_("Tot","u_tot",r.tijden?.[0]?.[1]??"",{i:o,type:"time",extra:r.tijden?.length?"":"disabled"})}
          ${this.veld_("Reden (op het scherm)","u_reden",r.reden,{i:o})}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="u_verwijder" data-i="${o}" title="Verwijderen">${b("minus")}</button></div>
        </div>`).join("");return`
      <div class="rij twee">
        ${this.veld_("Naam van de praktijk","naam",e.naam)}
        ${this.veld_("Adresregel","adres",e.adres)}
      </div>
      <div class="veld"><label>Welkomsteksten (\xE9\xE9n per regel; ze wisselen elkaar af)</label><textarea data-veld="welkom">${te((e.welkom??[]).join(`
`))}</textarea></div>
      <div class="rij twee">
        <div class="veld"><label>Logo</label>
          <div class="b-onder">
            <div class="plaatje logo" data-bestand="${te(e.logo)}">${e.logo?"":b("camera")}</div>
            <button class="knop klein" type="button" data-actie="logo">${b("camera")} ${e.logo?"Ander logo":"Logo kiezen"}</button>
            ${e.logo?`<button class="knop klein" type="button" data-actie="logoweg">${b("close")} Logo weg</button>`:""}
          </div>
        </div>
        <div class="veld"><label>Accentkleur op het scherm</label>
          <div class="b-onder">
            <input type="color" data-veld="accent_kleur" value="${te(e.accent||"#026fa1")}">
            <input type="text" data-veld="accent" value="${te(e.accent)}" placeholder="leeg = standaard" style="max-width: 140px">
          </div>
        </div>
      </div>
      <div class="veld"><label>Openingstijden</label>
        <div class="ot-tabel">
          <span class="k"></span><span class="k"></span><span class="k">Open</span><span class="k">Dicht</span><span class="k vak2">Open</span><span class="k vak2">Dicht</span>
          ${n}
        </div>
        <div class="hulp">Twee vakken per dag voor een middagpauze. Buiten deze tijden dimt het scherm naar een klok met "Gesloten \xB7 morgen open om 08:00".</div>
      </div>
      <div class="veld"><label>Afwijkende dagen (feestdagen, studiedagen)</label>
        <div class="lijst">${a||'<div class="leeg">Geen afwijkende dagen.</div>'}</div>
        <div style="margin-top:8px"><button class="knop" type="button" data-actie="u_nieuw">${b("plus")} Afwijkende dag toevoegen</button></div>
      </div>`}htmlInstellingen_(e={}){let t=(e.feeds??[]).map((a,r)=>`<div class="item feed" data-i="${r}">
          ${this.veld_("Naam","f_naam",a.naam,{i:r})}
          ${this.veld_("Adres van de RSS-feed","f_url",a.url,{i:r,type:"url"})}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="f_verwijder" data-i="${r}" title="Verwijderen">${b("minus")}</button></div>
          ${this.feedFouten_[a.url]?`<div class="feedfout" style="grid-column: 1 / -1">Niet opgehaald: ${te(this.feedFouten_[a.url])}</div>`:""}
        </div>`).join(""),n="";if(this.rechten_.is_admin){let a=this.gebruikers_??[],r=new Set(e.kiosk_gebruikers??[]);n=`<div class="veld"><label>Kioskaccounts (alleen voor beheerders)</label>
        <div class="hulp">Het account waarmee de iPad is ingelogd. Zo'n account mag alleen aanwezigheid omzetten en lampen schakelen, en niets beheren.</div>
        <div class="gebruikers">${a.length?a.map(o=>`<label class="vink"><input type="checkbox" data-veld="kiosk" data-i="${te(o.id)}" ${r.has(o.id)?"checked":""}> ${te(o.naam)}${o.is_admin?" (beheerder)":""}</label>`).join(""):'<div class="leeg">Gebruikers laden\u2026</div>'}</div></div>`}return`
      ${this.schakel_("reset_middernacht",e.reset_middernacht!==!1,{label:"Om middernacht iedereen op afwezig zetten"})}
      ${this.schakel_("verlichting_tonen",e.verlichting_tonen!==!1,{label:"Verlichting op het scherm tonen (voor schermen die 'Volgens het beheer' staan)"})}
      <div class="veld"><label>Nieuws van buiten (RSS)</label>
        <div class="hulp">Bijvoorbeeld het NOS-nieuws: https://feeds.nos.nl/nosnieuwsalgemeen. Wordt elk kwartier opgehaald en staat op het scherm n\xE1 het nieuws van het pand.</div>
        <div class="lijst">${t||'<div class="leeg">Geen bronnen.</div>'}</div>
        <div class="knoppen" style="justify-content: flex-start; margin-top: 8px">
          <button class="knop" type="button" data-actie="f_nieuw">${b("plus")} Bron toevoegen</button>
          <button class="knop" type="button" data-actie="f_ververs">Nu ophalen</button>
        </div>
      </div>
      ${n}`}plaatjes_(e){for(let t of e.querySelectorAll("[data-bestand]:not([data-bestand=''])"))_t(this.hass,t.dataset.bestand).then(n=>{n&&t.isConnected&&(t.innerHTML=`<img alt="" src="${n}">`)})}markeer_(e){this.vuil_.add(e),this.meldingen_[e]=null;let t=this.$(`.blok[data-blok="${e}"]`);t?.querySelector('[data-actie="opslaan"]')?.classList.add("vuil");let a=t?.querySelector('[data-actie="herstel"]');a&&(a.disabled=!1);let r=t?.querySelector(".voet .melding");r&&(r.textContent=""),this.tel_(e)}invoer_(e){let t=e.target,n=t?.dataset?.veld;if(!n)return;let a=t.closest(".blok")?.dataset.blok;if(!a)return;let r=t.dataset.i,o=this.werk_[a],s=t.type==="checkbox"?t.checked:t.value;if(a==="personen"||a==="mededelingen"||a==="nieuws"){let l=o[Number(r)];if(!l)return;if(l[n]=s,n==="naam"){let d=t.closest(".item")?.querySelector(".avatar");d&&!d.querySelector("img")&&(d.textContent=Nr(s))}if(n==="aanwezig"){let d=t.closest(".vink")?.querySelector("span:last-child");d&&(d.textContent=s?"Aanwezig":"Afwezig"),t.closest(".item")?.querySelector(".avatar")?.classList.toggle("aan",s)}}else if(a==="praktijk")this.invoerPraktijk_(o,n,r,s,t);else if(a==="instellingen")if(n==="kiosk"){let l=new Set(o.kiosk_gebruikers??[]);s?l.add(r):l.delete(r),o.kiosk_gebruikers=[...l]}else if(n.startsWith("f_")){let l=o.feeds[Number(r)];l&&(l[n.slice(2)]=s)}else o[n]=s;this.markeer_(a)}invoerPraktijk_(e,t,n,a,r){if(t==="welkom")e.welkom=String(a).split(`
`).map(o=>o.trim()).filter(Boolean);else if(t==="accent_kleur"){e.accent=a;let o=r.closest(".b-onder")?.querySelector('[data-veld="accent"]');o&&(o.value=a)}else if(t==="accent")e.accent=a.trim()||null;else if(t==="ot_open"){e.openingstijden??={},e.openingstijden[n]=a?[["08:00","17:00"]]:[];let o=r.closest(".ot-tabel");for(let l of o.querySelectorAll(`input[type="time"][data-i="${n}"]`)){l.disabled=!a;let[,d,c]=l.dataset.veld.split("_");l.value=e.openingstijden[n][Number(d)]?.[Number(c)]??""}let s=r.closest(".vink")?.querySelector("span:last-child");s&&(s.textContent=a?"open":"gesloten")}else if(t.startsWith("ot_")){let[,o,s]=t.split("_").map(Number);e.openingstijden??={};let l=e.openingstijden[n]??[];for(;l.length<=o;)l.push(["",""]);l[o][s]=a,e.openingstijden[n]=l.filter((d,c)=>c===0||d[0]&&d[1]),e.openingstijden[n].length||(e.openingstijden[n]=[["",""]])}else if(t.startsWith("u_")){let o=e.uitzonderingen[Number(n)];if(!o)return;let s=t.slice(2);if(s==="open"){o.tijden=a?[["08:00","17:00"]]:[];let l=r.closest(".item");for(let c of l.querySelectorAll('input[type="time"]'))c.disabled=!a,c.value=a?c.dataset.veld==="u_van"?"08:00":"17:00":"";let d=r.closest(".vink")?.querySelector("span:last-child");d&&(d.textContent=a?"open":"gesloten")}else s==="van"||s==="tot"?o.tijden=[[s==="van"?a:o.tijden?.[0]?.[0]??"",s==="tot"?a:o.tijden?.[0]?.[1]??""]]:o[s]=a}else e[t]=a}async klik_(e){let t=e.target.closest(".bk");if(t){let l=t.closest(".blok").dataset.blok;this.open_=this.open_===l?null:l;for(let d of this.$$(".blok"))d.classList.toggle("open",d.dataset.blok===this.open_);return}let n=e.target.closest("[data-actie]");if(!n||n.disabled)return;let a=n.closest(".blok")?.dataset.blok,r=n.dataset.actie,o=Number(n.dataset.i),s=this.werk_[a];if(r==="opslaan")return this.opslaan_(a);if(r==="herstel")return this.vuil_.delete(a),this.werk_[a]=va(this.stand_[a]),this.meldingen_[a]=null,this.teken_(a);if(r==="nieuw"){let l={personen:{naam:"",functie:"",aanwezig:!1},mededelingen:{tekst:""},nieuws:{titel:"",tekst:""}}[a];s.push(l),this.markeer_(a),this.teken_(a),this.$(`.blok[data-blok="${a}"] .item:last-of-type input[type="text"]`)?.focus();return}if(r==="verwijder"){let l=s[o],d=l?.naam||l?.titel||l?.tekst||"dit item";return l&&(l.id||l.naam||l.titel||l.tekst)&&!await Ae({title:"Verwijderen?",text:`"${d}" verdwijnt van het scherm zodra u opslaat.`,confirmText:"Verwijderen"})?void 0:(s.splice(o,1),this.markeer_(a),this.teken_(a))}if(r==="omhoog"||r==="omlaag"){let l=r==="omhoog"?o-1:o+1;return l<0||l>=s.length?void 0:([s[o],s[l]]=[s[l],s[o]],this.markeer_(a),this.teken_(a))}if(r==="foto"||r==="logo"){this.doel_={blok:a,i:r==="logo"?null:o};let l=this.$(".file");l.value="",l.click();return}if(r==="fotoweg"||r==="logoweg")return r==="logoweg"?s.logo=null:a==="personen"?s[o].foto=null:s[o].afbeelding=null,this.markeer_(a),this.teken_(a);if(r==="u_nieuw")return s.uitzonderingen??=[],s.uitzonderingen.push({datum:"",tijden:[],reden:""}),this.markeer_(a),this.teken_(a);if(r==="u_verwijder")return s.uitzonderingen.splice(o,1),this.markeer_(a),this.teken_(a);if(r==="f_nieuw")return s.feeds??=[],s.feeds.push({naam:"",url:""}),this.markeer_(a),this.teken_(a);if(r==="f_verwijder")return s.feeds.splice(o,1),this.markeer_(a),this.teken_(a);if(r==="f_ververs"){n.disabled=!0;try{let l=await dd(this.hass);this.feedFouten_=l.feed_fouten??{},this.meldingen_[a]={tekst:`${(l.feeds??[]).length} bericht(en) opgehaald.`}}catch(l){this.meldingen_[a]={tekst:l?.message??"Ophalen lukte niet.",fout:!0}}return this.teken_(a)}}async bestandGekozen_(e){let t=e.target.files?.[0],n=this.doel_;if(this.doel_=null,!t||!n)return;let{blok:a,i:r}=n;this.meldingen_[a]={tekst:"Bezig met uploaden\u2026"},this.teken_(a);try{let o=await pd(this.hass,t),s=this.werk_[a],l=r===null?s.logo:a==="personen"?s[r].foto:s[r].afbeelding;r===null?s.logo=o.id:a==="personen"?s[r].foto=o.id:s[r].afbeelding=o.id,l&&(this.oudeBestanden_=[...this.oudeBestanden_??[],l]),this.meldingen_[a]={tekst:`${o.naam||"Bestand"} ge\xFCpload. Vergeet niet op te slaan.`},this.markeer_(a)}catch(o){this.meldingen_[a]={tekst:o?.message??"Uploaden lukte niet.",fout:!0}}this.teken_(a)}async opslaan_(e){let t=this.werk_[e],n=this.$(`.blok[data-blok="${e}"] [data-actie="opslaan"]`);n&&(n.disabled=!0);try{let a=t;e==="praktijk"&&(a={...t,openingstijden:Object.fromEntries(yt.map(o=>[o,(t.openingstijden?.[o]??[]).filter(s=>s[0]&&s[1])])),uitzonderingen:(t.uitzonderingen??[]).filter(o=>o.datum).map(o=>({...o,tijden:(o.tijden??[]).filter(s=>s[0]&&s[1])}))}),e==="instellingen"&&(a={...t,feeds:(t.feeds??[]).filter(o=>o.url?.trim())}),e==="personen"&&(a=t.filter(o=>o.naam?.trim())),e==="mededelingen"&&(a=t.filter(o=>o.tekst?.trim())),e==="nieuws"&&(a=t.filter(o=>o.titel?.trim()));let r=await sd(this.hass,e,a);this.vuil_.delete(e),this.werk_[e]=va(r[e]),this.stand_&&(this.stand_[e]=va(r[e])),this.meldingen_[e]={tekst:"Opgeslagen. Het scherm is bijgewerkt."};for(let o of this.oudeBestanden_??[])this.inGebruik_(o)||(ld(this.hass,o).catch(()=>{}),hd(o));this.oudeBestanden_=[]}catch(a){this.meldingen_[e]={tekst:a?.message??"Opslaan lukte niet.",fout:!0}}this.teken_(e)}inGebruik_(e){let t=this.stand_??{};return t.praktijk?.logo===e||(t.personen??[]).some(n=>n.foto===e)||(t.nieuws??[]).some(n=>n.afbeelding===e)||(this.werk_.personen??[]).some(n=>n.foto===e)||(this.werk_.nieuws??[]).some(n=>n.afbeelding===e)||this.werk_.praktijk?.logo===e}};_(zt,"css",gu);var fu={title:"Titel",show_personen:"Blok Medewerkers",show_mededelingen:"Blok Mededeling",show_nieuws:"Blok Nieuws",show_praktijk:"Blok Praktijk",show_instellingen:"Blok Instellingen",open:"Staat open bij het laden"},Hr=class extends D{defaults(){return{...yd}}schema(){return[{name:"title",selector:m.text()},{name:"open",selector:m.select([{value:"personen",label:"Medewerkers"},{value:"mededelingen",label:"Mededeling"},{value:"nieuws",label:"Nieuws"},{value:"praktijk",label:"Praktijk"},{value:"instellingen",label:"Instellingen"},{value:"",label:"Alles dicht"}])},{name:"show_personen",selector:m.bool()},{name:"show_mededelingen",selector:m.bool()},{name:"show_nieuws",selector:m.bool()},{name:"show_praktijk",selector:m.bool()},{name:"show_instellingen",selector:m.bool()}]}label(e){return fu[e.name]??super.label(e)}helper(e){if(e.name==="show_instellingen")return"Kioskaccounts, nieuwsbronnen en de middernachtregel. Zet dit blok uit op een dashboard voor een receptie die daar niet aan hoeft te zitten."}};N(Rr,zt,{name:"DomotiApp Infoscherm Beheer",description:"Voor de receptie: medewerkers, mededeling van de dag, nieuws, logo en openingstijden van het infoscherm. Werkt met een gewoon account.",preview:!1});H(`${Rr}-editor`,Hr);zt.getConfigElement=()=>document.createElement(`${Rr}-editor`);zt.getStubConfig=()=>({title:"Infoscherm"});var ka=globalThis,xa=ka.ShadowRoot&&(ka.ShadyCSS===void 0||ka.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Vr=Symbol(),jd=new WeakMap,Zt=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==Vr)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(xa&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=jd.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&jd.set(t,e))}return e}toString(){return this.cssText}},Me=i=>new Zt(typeof i=="string"?i:i+"",void 0,Vr),ie=(i,...e)=>{let t=i.length===1?i[0]:e.reduce((n,a,r)=>n+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+i[r+1],i[0]);return new Zt(t,i,Vr)},zd=(i,e)=>{if(xa)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let n=document.createElement("style"),a=ka.litNonce;a!==void 0&&n.setAttribute("nonce",a),n.textContent=t.cssText,i.appendChild(n)}},Ir=xa?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(let n of e.cssRules)t+=n.cssText;return Me(t)})(i):i;var{is:bu,defineProperty:vu,getOwnPropertyDescriptor:ku,getOwnPropertyNames:xu,getOwnPropertySymbols:wu,getPrototypeOf:_u}=Object,wa=globalThis,$d=wa.trustedTypes,yu=$d?$d.emptyScript:"",ju=wa.reactiveElementPolyfillSupport,Xt=(i,e)=>i,Pr={toAttribute(i,e){switch(e){case Boolean:i=i?yu:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},Ad=(i,e)=>!bu(i,e),Ed={attribute:!0,type:String,converter:Pr,reflect:!1,useDefault:!1,hasChanged:Ad};Symbol.metadata??=Symbol("metadata"),wa.litPropertyMetadata??=new WeakMap;var Se=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Ed){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),a=this.getPropertyDescriptor(e,n,t);a!==void 0&&vu(this.prototype,e,a)}}static getPropertyDescriptor(e,t,n){let{get:a,set:r}=ku(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:a,set(o){let s=a?.call(this);r?.call(this,o),this.requestUpdate(e,s,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ed}static _$Ei(){if(this.hasOwnProperty(Xt("elementProperties")))return;let e=_u(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Xt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Xt("properties"))){let t=this.properties,n=[...xu(t),...wu(t)];for(let a of n)this.createProperty(a,t[a])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[n,a]of t)this.elementProperties.set(n,a)}this._$Eh=new Map;for(let[t,n]of this.elementProperties){let a=this._$Eu(t,n);a!==void 0&&this._$Eh.set(a,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let a of n)t.unshift(Ir(a))}else e!==void 0&&t.push(Ir(e));return t}static _$Eu(e,t){let n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return zd(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),a=this.constructor._$Eu(e,n);if(a!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:Pr).toAttribute(t,n.type);this._$Em=e,r==null?this.removeAttribute(a):this.setAttribute(a,r),this._$Em=null}}_$AK(e,t){let n=this.constructor,a=n._$Eh.get(e);if(a!==void 0&&this._$Em!==a){let r=n.getPropertyOptions(a),o=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Pr;this._$Em=a;let s=o.fromAttribute(t,r.type);this[a]=s??this._$Ej?.get(a)??s,this._$Em=null}}requestUpdate(e,t,n,a=!1,r){if(e!==void 0){let o=this.constructor;if(a===!1&&(r=this[e]),n??=o.getPropertyOptions(e),!((n.hasChanged??Ad)(r,t)||n.useDefault&&n.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:a,wrapped:r},o){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),r!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),a===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[a,r]of this._$Ep)this[a]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[a,r]of n){let{wrapped:o}=r,s=this[a];o!==!0||this._$AL.has(a)||s===void 0||this.C(a,void 0,r,s)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};Se.elementStyles=[],Se.shadowRootOptions={mode:"open"},Se[Xt("elementProperties")]=new Map,Se[Xt("finalized")]=new Map,ju?.({ReactiveElement:Se}),(wa.reactiveElementVersions??=[]).push("2.1.2");var qr=globalThis,Md=i=>i,_a=qr.trustedTypes,Sd=_a?_a.createPolicy("lit-html",{createHTML:i=>i}):void 0,Cd="$lit$",Ue=`lit$${Math.random().toFixed(9).slice(2)}$`,Hd="?"+Ue,zu=`<${Hd}>`,at=document,Qt=()=>at.createComment(""),Jt=i=>i===null||typeof i!="object"&&typeof i!="function",Zr=Array.isArray,$u=i=>Zr(i)||typeof i?.[Symbol.iterator]=="function",Br=`[ 	
\f\r]`,Yt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Nd=/-->/g,Td=/>/g,tt=RegExp(`>|${Br}(?:([^\\s"'>=/]+)(${Br}*=${Br}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Od=/'/g,Dd=/"/g,Rd=/^(?:script|style|textarea|title)$/i,Xr=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),y=Xr(1),ix=Xr(2),rx=Xr(3),it=Symbol.for("lit-noChange"),z=Symbol.for("lit-nothing"),Ld=new WeakMap,nt=at.createTreeWalker(at,129);function Vd(i,e){if(!Zr(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Sd!==void 0?Sd.createHTML(e):e}var Eu=(i,e)=>{let t=i.length-1,n=[],a,r=e===2?"<svg>":e===3?"<math>":"",o=Yt;for(let s=0;s<t;s++){let l=i[s],d,c,p=-1,h=0;for(;h<l.length&&(o.lastIndex=h,c=o.exec(l),c!==null);)h=o.lastIndex,o===Yt?c[1]==="!--"?o=Nd:c[1]!==void 0?o=Td:c[2]!==void 0?(Rd.test(c[2])&&(a=RegExp("</"+c[2],"g")),o=tt):c[3]!==void 0&&(o=tt):o===tt?c[0]===">"?(o=a??Yt,p=-1):c[1]===void 0?p=-2:(p=o.lastIndex-c[2].length,d=c[1],o=c[3]===void 0?tt:c[3]==='"'?Dd:Od):o===Dd||o===Od?o=tt:o===Nd||o===Td?o=Yt:(o=tt,a=void 0);let g=o===tt&&i[s+1].startsWith("/>")?" ":"";r+=o===Yt?l+zu:p>=0?(n.push(d),l.slice(0,p)+Cd+l.slice(p)+Ue+g):l+Ue+(p===-2?s:g)}return[Vd(i,r+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},en=class i{constructor({strings:e,_$litType$:t},n){let a;this.parts=[];let r=0,o=0,s=e.length-1,l=this.parts,[d,c]=Eu(e,t);if(this.el=i.createElement(d,n),nt.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(a=nt.nextNode())!==null&&l.length<s;){if(a.nodeType===1){if(a.hasAttributes())for(let p of a.getAttributeNames())if(p.endsWith(Cd)){let h=c[o++],g=a.getAttribute(p).split(Ue),f=/([.?@])?(.*)/.exec(h);l.push({type:1,index:r,name:f[2],strings:g,ctor:f[1]==="."?Gr:f[1]==="?"?Wr:f[1]==="@"?Ur:Et}),a.removeAttribute(p)}else p.startsWith(Ue)&&(l.push({type:6,index:r}),a.removeAttribute(p));if(Rd.test(a.tagName)){let p=a.textContent.split(Ue),h=p.length-1;if(h>0){a.textContent=_a?_a.emptyScript:"";for(let g=0;g<h;g++)a.append(p[g],Qt()),nt.nextNode(),l.push({type:2,index:++r});a.append(p[h],Qt())}}}else if(a.nodeType===8)if(a.data===Hd)l.push({type:2,index:r});else{let p=-1;for(;(p=a.data.indexOf(Ue,p+1))!==-1;)l.push({type:7,index:r}),p+=Ue.length-1}r++}}static createElement(e,t){let n=at.createElement("template");return n.innerHTML=e,n}};function $t(i,e,t=i,n){if(e===it)return e;let a=n!==void 0?t._$Co?.[n]:t._$Cl,r=Jt(e)?void 0:e._$litDirective$;return a?.constructor!==r&&(a?._$AO?.(!1),r===void 0?a=void 0:(a=new r(i),a._$AT(i,t,n)),n!==void 0?(t._$Co??=[])[n]=a:t._$Cl=a),a!==void 0&&(e=$t(i,a._$AS(i,e.values),a,n)),e}var Kr=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,a=(e?.creationScope??at).importNode(t,!0);nt.currentNode=a;let r=nt.nextNode(),o=0,s=0,l=n[0];for(;l!==void 0;){if(o===l.index){let d;l.type===2?d=new tn(r,r.nextSibling,this,e):l.type===1?d=new l.ctor(r,l.name,l.strings,this,e):l.type===6&&(d=new Fr(r,this,e)),this._$AV.push(d),l=n[++s]}o!==l?.index&&(r=nt.nextNode(),o++)}return nt.currentNode=at,a}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}},tn=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,a){this.type=2,this._$AH=z,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=$t(this,e,t),Jt(e)?e===z||e==null||e===""?(this._$AH!==z&&this._$AR(),this._$AH=z):e!==this._$AH&&e!==it&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):$u(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==z&&Jt(this._$AH)?this._$AA.nextSibling.data=e:this.T(at.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,a=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=en.createElement(Vd(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===a)this._$AH.p(t);else{let r=new Kr(a,this),o=r.u(this.options);r.p(t),this.T(o),this._$AH=r}}_$AC(e){let t=Ld.get(e.strings);return t===void 0&&Ld.set(e.strings,t=new en(e)),t}k(e){Zr(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,n,a=0;for(let r of e)a===t.length?t.push(n=new i(this.O(Qt()),this.O(Qt()),this,this.options)):n=t[a],n._$AI(r),a++;a<t.length&&(this._$AR(n&&n._$AB.nextSibling,a),t.length=a)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let n=Md(e).nextSibling;Md(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},Et=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,a,r){this.type=1,this._$AH=z,this._$AN=void 0,this.element=e,this.name=t,this._$AM=a,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=z}_$AI(e,t=this,n,a){let r=this.strings,o=!1;if(r===void 0)e=$t(this,e,t,0),o=!Jt(e)||e!==this._$AH&&e!==it,o&&(this._$AH=e);else{let s=e,l,d;for(e=r[0],l=0;l<r.length-1;l++)d=$t(this,s[n+l],t,l),d===it&&(d=this._$AH[l]),o||=!Jt(d)||d!==this._$AH[l],d===z?e=z:e!==z&&(e+=(d??"")+r[l+1]),this._$AH[l]=d}o&&!a&&this.j(e)}j(e){e===z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},Gr=class extends Et{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===z?void 0:e}},Wr=class extends Et{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==z)}},Ur=class extends Et{constructor(e,t,n,a,r){super(e,t,n,a,r),this.type=5}_$AI(e,t=this){if((e=$t(this,e,t,0)??z)===it)return;let n=this._$AH,a=e===z&&n!==z||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==z&&(n===z||a);a&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Fr=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){$t(this,e)}};var Au=qr.litHtmlPolyfillSupport;Au?.(en,tn),(qr.litHtmlVersions??=[]).push("3.3.3");var Id=(i,e,t)=>{let n=t?.renderBefore??e,a=n._$litPart$;if(a===void 0){let r=t?.renderBefore??null;n._$litPart$=a=new tn(e.insertBefore(Qt(),r),r,void 0,t??{})}return a._$AI(i),a};var Yr=globalThis,ee=class extends Se{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Id(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return it}};ee._$litElement$=!0,ee.finalized=!0,Yr.litElementHydrateSupport?.({LitElement:ee});var Mu=Yr.litElementPolyfillSupport;Mu?.({LitElement:ee});(Yr.litElementVersions??=[]).push("4.2.2");var ue=ie`
  :host {
    ${Me(G)}
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  ${Me(Ne)}
`;var Su=["unavailable","unknown"],Nu=["color_temp_kelvin","rgb_color","hs_color","xy_color"];function ya({scene:i,memberEntityIds:e,states:t}){let n=[],a=[],r=i?.lights??{},o=Array.isArray(e)?e:[],s=t??{};for(let l of o){let d=r[l];if(!d||typeof d!="object")continue;let c=s[l];if(!c||Su.includes(c.state)){a.push(l);continue}if(d.state==="off"){n.push({service:"turn_off",data:{entity_id:l,transition:1}});continue}let p={entity_id:l,transition:1};typeof d.brightness=="number"&&(p.brightness=d.brightness);for(let h of Nu)if(d[h]!==void 0){p[h]=d[h];break}n.push({service:"turn_on",data:p})}return{oproepen:n,overgeslagen:a}}async function ja(i,e){let t=await Promise.allSettled(e.map(a=>i(a.service,a.data))),n=[];return t.forEach((a,r)=>{a.status==="rejected"&&n.push({entityId:e[r].data.entity_id,fout:a.reason})}),n}var Jr=["hs","rgb","rgbw","rgbww","xy"],eo="color_temp",Tu="onoff";var rt="kleur";var Ou=["unavailable","unknown"],Bd=["color_temp_kelvin","rgb_color","hs_color","xy_color"],Du=[0,100];function we(i){if(!i)return{bekend:!1,beschikbaar:!1,helderheid:!1,kleurtemp:!1,kleur:!1,minKelvin:2e3,maxKelvin:6535,kelvinUitDefaults:!1};let e=i.attributes??{},t=Array.isArray(e.supported_color_modes)?e.supported_color_modes:null,n=t!==null&&t.length===1&&t[0]===Tu,a=t!==null&&t.includes(eo),r=t!==null&&t.some(d=>Jr.includes(d)),o=e.min_color_temp_kelvin,s=e.max_color_temp_kelvin,l=typeof o=="number"&&typeof s=="number"&&o<s;return{bekend:!0,beschikbaar:!Ou.includes(i.state),helderheid:!n,kleurtemp:a,kleur:r,minKelvin:l?Math.round(o):2e3,maxKelvin:l?Math.round(s):6535,kelvinUitDefaults:a&&!l}}function Lu(){return{state:"off"}}function Kd(i,e){let t=e??we(i);return t.bekend&&t.beschikbaar&&i.state==="on"?{state:"on",...Pu(i,t)}:t.helderheid?{state:"on",brightness:255}:{state:"on"}}function Gd(i,e,t,n){return e?i&&i.state==="on"?{...i}:Kd(t,n):{state:"off"}}function Wd(i,e,t,n){let a=n??we(t),r=oo(i,t,a);return a.helderheid&&(r.brightness=K(e,1,255)),r}function to(i,e,t,n){let a=n??we(t),r=oo(i,t,a);return tc(r),r.color_temp_kelvin=K(e,a.minKelvin,a.maxKelvin),r}function no(i,e,t,n){let a=n??we(t),r=oo(i,t,a);return tc(r),r.hs_color=[K(e?.[0],0,360),K(e?.[1],0,100)],r}function za(i,e,t){return i??Lu()}function Ud(i,e,t){let n=za(i,e,t);if(typeof n.brightness=="number")return K(n.brightness,1,255);let a=e?.attributes?.brightness;return typeof a=="number"?K(a,1,255):255}function ao(i,e,t){let n=t??we(e),a=za(i,e,n);if(typeof a.color_temp_kelvin=="number")return K(a.color_temp_kelvin,n.minKelvin,n.maxKelvin);let r=e?.attributes?.color_temp_kelvin;return typeof r=="number"?K(r,n.minKelvin,n.maxKelvin):Math.round((n.minKelvin+n.maxKelvin)/2)}function $a(i,e,t){let n=za(i,e,t);if(Qr(n.hs_color))return[K(n.hs_color[0],0,360),K(n.hs_color[1],0,100)];let a=e?.attributes?.hs_color;return Qr(a)?[K(a[0],0,360),K(a[1],0,100)]:[...Du]}function io(i){return i!=null&&typeof i=="object"}function Fd(i,e,t){let n=Array.isArray(e)?e:[],a=Array.isArray(i)?i:[],r=Number.isInteger(t)?t:a.length;return n.filter(o=>{for(let s=0;s<r;s+=1)if(!io(a[s]?.lights?.[o]))return!0;return!1})}function qd(i){return!Number.isInteger(i)||i<=0?null:i===1?"1 lamp nog niet ingesteld":`${i} lampen nog niet ingesteld`}function ro(i,e,t){return za(i,e,t).state==="on"}function Zd(i,e,t){let n=t??we(e);if(!n.bekend)return{aanuit:!1,helderheid:!1,kleurtemp:!1,kleur:!1,kleurkeuze:!1,stand:null};let a=ro(i,e,n),r=Xd(n),o=r?Cu(i,e,n):null;return{aanuit:!0,helderheid:a&&n.helderheid,kleurtemp:a&&n.kleurtemp&&(!r||o==="wit"),kleur:a&&n.kleur&&(!r||o===rt),kleurkeuze:a&&r,stand:a?o:null}}function Xd(i){return!!(i?.kleurtemp&&i?.kleur)}function Cu(i,e,t){let n=t??we(e);if(i&&typeof i=="object"){if(typeof i.color_temp_kelvin=="number")return"wit";if(Bd.slice(1).some(r=>i[r]!==void 0))return rt}let a=e?.attributes?.color_mode;return a===eo&&n.kleurtemp?"wit":Jr.includes(a)&&n.kleur?rt:"wit"}function Yd(i,e,t,n){let a=n??we(t);return Xd(a)?e==="wit"?to(i,ao(i,t,a),t,a):no(i,$a(i,t,a),t,a):i}function Qd(i){let e=K(i,0,255);return e<=0?0:Math.max(1,Math.round(e/255*100))}function Jd(i){let e=K(i,1,100);return K(Math.round(e/100*255),1,255)}var Hu=1e3,Ru=4e4,Pd=7;function Vu(i){let e=K(i,Hu,Ru)/100,t=e<=66?255:329.698727446*(e-60)**-.1332047592,n=e<=66?99.4708025861*Math.log(e)-161.1195681661:288.1221695283*(e-60)**-.0755148492,a;return e>=66?a=255:e<=19?a=0:a=138.5177312231*Math.log(e-10)-305.0447927307,[K(t,0,255),K(n,0,255),K(a,0,255)]}function Iu(i){let[e,t,n]=Vu(i);return`rgb(${e}, ${t}, ${n})`}function ec(i,e){let t=Math.min(i,e),n=Math.max(i,e);return`linear-gradient(to right, ${Array.from({length:Pd},(r,o)=>{let s=o/(Pd-1),l=t+(n-t)*s;return`${Iu(l)} ${Math.round(s*100)}%`}).join(", ")})`}function Pu(i,e){let t=i.attributes??{},n={};e.helderheid&&(n.brightness=typeof t.brightness=="number"?K(t.brightness,1,255):255);let a=t.color_mode;return e.kleurtemp&&a===eo&&typeof t.color_temp_kelvin=="number"?n.color_temp_kelvin=K(t.color_temp_kelvin,e.minKelvin,e.maxKelvin):e.kleur&&Jr.includes(a)&&Qr(t.hs_color)&&(n.hs_color=[K(t.hs_color[0],0,360),K(t.hs_color[1],0,100)]),n}function oo(i,e,t){return i&&i.state==="on"?{...i}:Kd(e,t)}function tc(i){for(let e of Bd)delete i[e]}function Qr(i){return Array.isArray(i)&&i.length===2&&typeof i[0]=="number"&&typeof i[1]=="number"}function K(i,e,t){let n=Number(i);return Number.isFinite(n)?Math.min(t,Math.max(e,Math.round(n))):e}var Ea="domotiapp-scene-card",so="domotiapp-scene-card-editor",nc="domotiapp-scene-editor";var nn=["een","twee","drie"],ac="pencil",ic=["grid_options","layout_options","view_layout","visibility"];var rc="entity_id",At=class extends ee{constructor(){super();_(this,"_label",t=>t.name==="entity"?"Lichtgroep":t.name==="bare"?"Achtergrond weglaten":this._friendlyName(t.name));_(this,"_helper",t=>t.name==="entity"?"De lichtgroep waarvan deze kaart de scenes beheert.":t.name==="bare"?"Haalt de vulling en de schaduw onder de kaart weg. De rand blijft staan.":t.name);this._getypt={}}setConfig(t){this._config={...t}}_lichtgroepen(){let t=this.hass?.states??{};return Object.keys(t).filter(n=>n.startsWith("light.")&&Array.isArray(t[n].attributes?.[rc]))}_leden(){let t=this._config?.entity,n=this.hass?.states?.[t]?.attributes?.[rc];return Array.isArray(n)?n.filter(a=>a!==t):[]}_entiteitSchema(){let t=this._lichtgroepen();return[{name:"entity",required:!0,selector:t.length?{entity:{include_entities:t}}:{entity:{domain:"light"}}},{name:"bare",selector:{boolean:{}}}]}_namenSchema(t){return t.map(n=>({name:n,selector:{text:{}}}))}_naamData(t){let n=this._config?.name_overrides??{},a={};for(let r of t)r in this._getypt?a[r]=this._getypt[r]:n[r]&&(a[r]=n[r]);return a}_friendlyName(t){return this.hass?.states?.[t]?.attributes?.friendly_name||t}_entiteitGewijzigd(t){t.stopPropagation();let n=t.detail.value??{},a={...this._config,entity:n.entity};n.bare?a.bare=!0:delete a.bare,a.entity!==this._config?.entity&&(delete a.name_overrides,this._getypt={}),this._stuurDoor(a)}_namenGewijzigd(t){t.stopPropagation(),this._getypt={...this._getypt,...t.detail.value};let n={};for(let[r,o]of Object.entries(this._getypt))typeof o=="string"&&o.trim()&&(n[r]=o.trim());let a={...this._config};Object.keys(n).length?a.name_overrides=n:delete a.name_overrides,this._stuurDoor(a)}_stuurDoor(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return z;let t=this._leden();return y`
      <ha-form
        .hass=${this.hass}
        .data=${{entity:this._config.entity??"",bare:!!this._config.bare}}
        .schema=${this._entiteitSchema()}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._entiteitGewijzigd}
      ></ha-form>

      ${t.length?y`
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
    `}};_(At,"properties",{hass:{attribute:!1},_config:{state:!0},_getypt:{state:!0}}),_(At,"styles",[ue,ie`
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
    `]);var Bu="domotiapp_lovelace/snapshot/create",Ku="domotiapp_lovelace/snapshot/close",Aa=class{constructor({roepCommandoAan:e,entityId:t}){this._roep=e,this._entityId=t,this._aanmaak=null,this._afsluiting=null}get heeftSnapshot(){return this._aanmaak!==null}get isGesloten(){return this._afsluiting!==null}async zorgVoorSnapshot(){return this._aanmaak===null&&(this._aanmaak=this._roep(Bu,{entity_id:this._entityId}).catch(e=>{throw this._aanmaak=null,e})),this._aanmaak}async sluit({opslaan:e=!1}={}){return this.heeftSnapshot?this._afsluiting!==null?this._afsluiting:(this._afsluiting=(async()=>{try{await this._aanmaak}catch{return{gedaan:!1}}return await this._roep(Ku,{entity_id:this._entityId,restore:!e}),{gedaan:!0}})(),this._afsluiting):{gedaan:!1}}};async function oc({beheer:i,oproepen:e,voerUit:t}){return await i.zorgVoorSnapshot(),t(e)}var co="laden",po="klaar",sc="fout",Uu=`linear-gradient(to right, ${[0,60,120,180,240,300,360].map(i=>`hsl(${i}, 100%, 50%)`).join(", ")})`,Mt=class extends ee{constructor(){super(),this._scenes=null,this._leden=[],this._tab=0,this._toestand=co,this._melding="",this._bezig=!1,this._kelvinGemeld=new Set,this._snapshot=null}firstUpdated(){this._haalOp()}async _haalOp(){this._toestand=co;try{let e=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:this.entityId});return this._neemOver(e),this._toestand=po,e}catch(e){return this._melding=e?.message??String(e),this._toestand=sc,null}}_neemOver(e){this._scenes=Array.from({length:3},(t,n)=>{let a=e.scenes?.[n]??{};return{icon:a.icon||nn[n],lights:{...a.lights??{}}}}),this._leden=e.member_entity_ids??[],this._melding=""}_stateVan(e){return this.hass?.states?.[e]}_besturingVan(e){let t=we(this._stateVan(e));return t.kelvinUitDefaults&&!this._kelvinGemeld.has(e)&&(this._kelvinGemeld.add(e),console.warn(`domotiapp-scene-editor: ${e} meldt geen Kelvin-grenzen; ${t.minKelvin}\u2013${t.maxKelvin} K aangehouden (SPEC 6.3).`)),t}_waardeVan(e){return this._scenes?.[this._tab]?.lights?.[e]}_zetLamp(e,t){this._scenes=this._scenes.map((n,a)=>{if(a!==this._tab)return n;let r={...n.lights};return t===void 0?delete r[e]:r[e]=t,{...n,lights:r}})}_zetIcoon(e){this._scenes=this._scenes.map((t,n)=>n===this._tab?{...t,icon:e||nn[n]}:t)}_kiesTab(e){this._tab=e}get _kanOpslaan(){return this._toestand===po&&!this._bezig&&this._leden.length>0}async _slaOp(){if(!this._kanOpslaan)return;this._bezig=!0,this._melding="";try{await this.hass.callWS({type:"domotiapp_lovelace/scenes/save",entity_id:this.entityId,scenes:this._scenes})}catch(t){this._melding=t?.message??String(t),this._bezig=!1;return}let e=await this._haalOp();this._bezig=!1,e&&this.dispatchEvent(new CustomEvent("scenes-opgeslagen",{detail:e,bubbles:!0,composed:!0})),this._sluit({opslaan:!0})}get _beheer(){return this._snapshot===null&&(this._snapshot=new Aa({entityId:this.entityId,roepCommandoAan:(e,t)=>this.hass.callWS({type:e,...t})})),this._snapshot}get _kanVoorbeeld(){return this._toestand===po&&!this._bezig&&this._leden.length>0}async _voorbeeld(){if(!this._kanVoorbeeld)return;let{oproepen:e}=ya({scene:this._scenes[this._tab],memberEntityIds:this._leden,states:this.hass.states});this._bezig=!0,this._melding="";try{let t=await oc({beheer:this._beheer,oproepen:e,voerUit:n=>ja((a,r)=>this.hass.callService("light",a,r),n)});t.length&&(this._melding=`Deze lampen reageerden niet: ${t.map(n=>this._naam(n.entityId)).join(", ")}.`)}catch(t){this._melding=`Het voorbeeld is niet gestart: ${t?.message??String(t)}`}finally{this._bezig=!1}}_sluit({opslaan:e=!1}={}){this.dispatchEvent(new CustomEvent("editor-gesloten",{bubbles:!0,composed:!0})),this._sluitSnapshot({opslaan:e})}async _sluitSnapshot({opslaan:e}){try{await this._beheer.sluit({opslaan:e})}catch(t){console.warn(`domotiapp-scene-editor: de snapshot kon niet worden ${e?"verwijderd":"hersteld"}: ${t?.message??t}`)}}disconnectedCallback(){super.disconnectedCallback(),this._snapshot&&this._snapshot.heeftSnapshot&&this._sluitSnapshot({opslaan:!1})}_dialoogGesloten(e){e.stopPropagation(),this._sluit()}_naam(e){return this.nameOverrides?.[e]||this._stateVan(e)?.attributes?.friendly_name||e}render(){return y`
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
    `}_renderInhoud(){return this._toestand===co?y`<div class="inhoud">Bezig met laden…</div>`:this._toestand===sc?y`
        <div class="inhoud">
          <ha-alert alert-type="error">${this._melding}</ha-alert>
        </div>
      `:y`
      <div class="inhoud">
        <ha-tab-group>
          ${this._scenes.map((e,t)=>y`
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

        ${this._melding?y`<ha-alert alert-type="error">${this._melding}</ha-alert>`:z}
        ${this._leden.length===0?y`<ha-alert alert-type="info">
              Deze lichtgroep bevat geen lampen.
            </ha-alert>`:y`<div class="lampen">
              ${this._leden.map(e=>this._renderLamp(e))}
            </div>`}
      </div>
    `}_renderLamp(e){let t=this._stateVan(e),n=this._besturingVan(e),a=this._waardeVan(e),r=ro(a,t,n),o=Zd(a,t,n);return y`
      <div class="lamp">
        <div class="kop">
          <div class="naam">
            <span class="tekst">
              ${this._naam(e)}
              ${n.bekend?n.beschikbaar?z:y`<span class="hint">niet bereikbaar</span>`:y`<span class="hint">lamp niet gevonden</span>`}
            </span>
            ${io(a)?z:y`<span class="nieuw">nieuw</span>`}
          </div>
          ${n.bekend?y`
                <div class="bediening">
                  ${o.kleurkeuze?this._renderKleurkeuze(e,t,n,a,o.stand):z}
                  <ha-switch
                    .checked=${r}
                    @change=${s=>this._zetLamp(e,Gd(a,s.target.checked,t,n))}
                  ></ha-switch>
                </div>
              `:z}
        </div>
        ${this._renderBesturing(e,t,n,a,o)}
      </div>
    `}_renderBesturing(e,t,n,a,r){return y`
      ${r.helderheid?this._renderHelderheid(e,t,n,a):z}
      ${r.kleurtemp?this._renderKleurtemp(e,t,n,a):z}
      ${r.kleur?this._renderKleur(e,t,n,a):z}
    `}_renderHelderheid(e,t,n,a){let r=Qd(Ud(a,t,n)),o=s=>{s.stopPropagation(),this._zetLamp(e,Wd(this._waardeVan(e),Jd(s.detail.value),t,n))};return y`
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
    `}_renderKleurkeuze(e,t,n,a,r){let o=s=>l=>{l.stopPropagation(),s!==r&&this._zetLamp(e,Yd(this._waardeVan(e),s,t,n))};return y`
      <div class="kleurkeuze">
        <button
          class="keuze ${r===rt?"actief":""}"
          aria-pressed=${r===rt?"true":"false"}
          @click=${o(rt)}
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
    `}_renderKleurtemp(e,t,n,a){let r=ao(a,t,n),o=s=>{s.stopPropagation(),this._zetLamp(e,to(this._waardeVan(e),s.detail.value,t,n))};return y`
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
          style=${`--control-slider-background: ${ec(n.minKelvin,n.maxKelvin)}; --control-slider-background-opacity: 1`}
          @slider-moved=${o}
          @value-changed=${o}
        ></ha-control-slider>
      </div>
    `}_renderKleur(e,t,n,a){let[r,o]=$a(a,t,n),s=l=>d=>{d.stopPropagation();let c=$a(this._waardeVan(e),t,n),p=l==="tint"?[d.detail.value,c[1]]:[c[0],d.detail.value];this._zetLamp(e,no(this._waardeVan(e),p,t,n))};return y`
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
              style=${`--control-slider-background: ${Uu}; --control-slider-background-opacity: 1`}
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
    `}};_(Mt,"properties",{hass:{attribute:!1},entityId:{attribute:!1},nameOverrides:{attribute:!1},_scenes:{state:!0},_leden:{state:!0},_tab:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0}}),_(Mt,"styles",[ue,ie`
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
    `]);var Fu="0.36.0",qu=["type","entity","name_overrides","bare"],Sa="laden",an="klaar",ho="leeg",uo="geen-groep",lc="opslagfout",dc="fout",rn=class extends ee{constructor(){super();_(this,"_opnieuw",()=>{this._herkansing.herstel(),this._haalScenesOp()});this._scenes=null,this._leden=[],this._toestand=Sa,this._melding="",this._bezig=!1,this._editorOpen=!1,this._opgehaaldVoor=null,this._bestondVorigeKeer=!1,this._herkansing=new oe(()=>this._haalScenesOp()),this._verbinding=new xe}static getConfigElement(){return document.createElement(so)}static getStubConfig(t){return{entity:Object.keys(t?.states??{}).find(a=>a.startsWith("light.")&&Array.isArray(t.states[a].attributes?.entity_id))??""}}updated(){let t=this.renderRoot?.querySelector(".card, .needs");t!==this._rasterVak&&(this._rasterUit?.(),this._rasterVak=t,this._rasterUit=t?R(t):null),O(t)}disconnectedCallback(){super.disconnectedCallback(),this._herkansing.stop(),this._rasterUit?.(),this._rasterUit=null,this._rasterVak=null}setConfig(t){if(!t?.entity)throw new Error("Kies een lichtgroep bij 'entity'.");let n=Object.keys(t).filter(a=>!qu.includes(a)&&!ic.includes(a));n.length&&console.warn(`${Ea}: onbekende sleutels in de configuratie: ${n.join(", ")}`),this._config=t,this.toggleAttribute("bare",!!t.bare)}getCardSize(){return 1}getGridOptions(){return{rows:"auto",columns:"full",min_columns:6,min_rows:lt(this.renderRoot?.querySelector?.(".card"))??1}}willUpdate(){let t=this._config?.entity;if(!this.hass||!t)return;let n=!!this.hass.states[t];if(this._opgehaaldVoor!==t){this._opgehaaldVoor=t,this._bestondVorigeKeer=n,this._haalScenesOp();return}if(this._verbinding.herverbonden(this.hass)){this._bestondVorigeKeer=n,this._herkansing.herstel(),this._haalScenesOp();return}if(n&&!this._bestondVorigeKeer&&this._toestand===uo){this._bestondVorigeKeer=!0,this._haalScenesOp();return}this._bestondVorigeKeer=n}async _haalScenesOp(){let t=this._config.entity;this._toestand=Sa,this._melding="";try{let n=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:t});this._scenes=n.scenes,this._leden=n.member_entity_ids??[],this._toestand=this._leden.length===0?ho:an,this._herkansing.herstel()}catch(n){this._verwerkFout(n,t)}}_verwerkFout(t,n){let a=t?.code;if(this._melding=t?.message??String(t),de(t)&&this._herkansing.plan()){this._toestand=Sa;return}if(a==="home_assistant_error"){this._toestand=lc;return}if(!this.hass.states[n]){this._toestand=uo;return}this._toestand=dc}_naam(t){return this._config?.name_overrides?.[t]||this.hass?.states?.[t]?.attributes?.friendly_name||t}async _pasSceneToe(t){if(this._bezig||this._toestand!==an)return;let{oproepen:n}=ya({scene:this._scenes?.[t],memberEntityIds:this._leden,states:this.hass.states});if(n.length){this._bezig=!0;try{let a=await ja((r,o)=>this.hass.callService("light",r,o),n);a.length&&this._meldMislukking(a.map(r=>r.entityId))}finally{this._bezig=!1}}}_meldMislukking(t){let n=t.map(r=>this._naam(r)).join(", "),a=t.length===1?`${n} reageerde niet.`:`Deze lampen reageerden niet: ${n}.`;this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:a},bubbles:!0,composed:!0}))}_bewerk(){this._toestand===an&&(this._editorOpen=!0)}_sluitEditor(){this._editorOpen=!1}_scenesOpgeslagen(t){t.stopPropagation(),this._scenes=t.detail.scenes,this._leden=t.detail.member_entity_ids??[],this._toestand=this._leden.length===0?ho:an}render(){if(!this._config)return z;switch(this._toestand){case uo:return this._renderFout(`Lichtgroep ${this._config.entity} bestaat niet (meer). Pas de kaart aan.`);case lc:return this._renderFout("De opgeslagen scenes van deze kamer zijn onleesbaar.",this._melding);case dc:return this._renderFout("De scenes konden niet geladen worden.",this._melding,!0);default:return this._renderKaart()}}_renderFout(t,n,a=!1){return y`
      <div class="needs">
        <span class="mark">${this._icoon("question")}</span>
        <span>
          <b>${t}</b>
          ${n?y`<span class="detail">${n}</span>`:z}
          ${a?y`<button type="button" class="opnieuw" @click=${this._opnieuw}>
                Opnieuw proberen
              </button>`:z}
        </span>
      </div>
    `}_icoon(t){let n=document.createElement("template");return n.innerHTML=b(t),n.content.cloneNode(!0)}_renderKaart(){let t=this._toestand===ho,n=this._toestand===Sa,a=this._iconen();return y`
      <div class="card surface">
        <div class="rij">
          <div class="scenes">
            ${a.map((r,o)=>y`
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
            ${this._icoon(ac)}
          </button>
        </div>
        ${t?y`<div class="mededeling">Deze lichtgroep bevat geen lampen.</div>`:this._renderNieuweLampen()}
      </div>
      ${this._editorOpen?this._renderEditor():z}
    `}_renderNieuweLampen(){if(this._toestand!==an)return z;let t=Fd(this._scenes,this._leden,3).length,n=qd(t);return n?y`<div class="mededeling">${n}</div>`:z}_renderEditor(){return y`
      <domotiapp-scene-editor
        .hass=${this.hass}
        .entityId=${this._config.entity}
        .nameOverrides=${this._config.name_overrides}
        @editor-gesloten=${this._sluitEditor}
        @scenes-opgeslagen=${this._scenesOpgeslagen}
      ></domotiapp-scene-editor>
    `}_iconen(){return Array.from({length:3},(t,n)=>this._scenes?.[n]?.icon||nn[n])}};_(rn,"properties",{hass:{attribute:!1},_config:{state:!0},_scenes:{state:!0},_leden:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0},_editorOpen:{state:!0}}),_(rn,"styles",[ue,ie`
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
    `]);L(Ea,rn);L(so,At);L(nc,Mt);dt({type:Ea,name:"DomotiApp Scene",description:`Drie lichtscenes per kamer, vastgelegd bij de lichtgroep (v${Fu}).`,preview:!1});var ot="domotiapp-alarm-card",mo="domotiapp-alarm-card-editor",cc="domotiapp-alarm-editor",pc="DomotiApp Wekker",hc="https://github.com/Sven2410/domotiapp-lovelace",_e="domotiapp_lovelace",ce=Object.freeze({get:`${_e}/alarms/get`,save:`${_e}/alarms/save`,setEnabled:`${_e}/alarms/set_enabled`,delete:`${_e}/alarms/delete`,stop:`${_e}/alarms/stop`,clearMessage:`${_e}/alarms/clear_message`,search:`${_e}/sound/search`,entities:`${_e}/entities/list`,previewStart:`${_e}/preview/start`,subscribe:`${_e}/updates/subscribe`}),Na="#026FA1";function uc(i){let e=typeof i?.name=="string"?i.name.trim():"",t=typeof i?.time=="string"?i.time.trim():"";return e&&t?`Wil je de wekker "${e}" van ${t} verwijderen?`:e?`Wil je de wekker "${e}" verwijderen?`:t?`Wil je de wekker van ${t} verwijderen?`:"Wil je deze wekker verwijderen?"}var Zu="07:00";var Xu=["uri","name","media_type","image"],Yu="Let op: deze tijd bestaat twee nachten per jaar niet, of twee keer. Bij de overgang naar zomertijd wordt het uur van 02:00 tot 03:00 overgeslagen; die nacht gaat deze wekker niet af. Bij de overgang naar wintertijd komt dat uur twee keer voorbij; die nacht gaat hij twee keer af. Kies een tijd v\xF3\xF3r 02:00 of n\xE1 03:00 als dat een probleem is.",Qu="Dit geluid stopt van zichzelf. Een los nummer is na een paar minuten voorbij; daarna is het stil. Kies een afspeellijst of een radiostation als de wekker moet blijven spelen tot je hem uitzet.";var Ju="Music Assistant Wekker",em="Verlichting Wekker";function Ta(){return{id:null,name:"",time:Zu,days:[],enabled:!0,sound:null,endless:null,speaker:"",volume_pct:40,light:null}}function mc(i){let e=Ta();return!i||typeof i!="object"?e:{id:typeof i.id=="string"?i.id:null,name:typeof i.name=="string"?i.name:"",time:go(i.time)?i.time:e.time,days:Array.isArray(i.days)?[...i.days]:[],enabled:i.enabled!==!1,sound:on(i.sound),endless:null,speaker:typeof i.speaker=="string"?i.speaker:"",volume_pct:Number.isInteger(i.volume_pct)?i.volume_pct:e.volume_pct,light:i.light&&typeof i.light=="object"?{entity_id:i.light.entity_id,brightness_pct:Number.isInteger(i.light.brightness_pct)?i.light.brightness_pct:60}:null}}function on(i){if(!i||typeof i!="object"||Array.isArray(i)||typeof i.uri!="string"||!i.uri)return null;let e={};for(let t of Xu)e[t]=i[t]===void 0?null:i[t];return e}function go(i){if(typeof i!="string"||i.length!==5||i[2]!==":")return!1;let e=Number(i.slice(0,2)),t=Number(i.slice(3));return!/^\d\d$/.test(i.slice(0,2))||!/^\d\d$/.test(i.slice(3))?!1:e>=0&&e<=23&&t>=0&&t<=59}function fo(i){let e=[];return!i||typeof i!="object"?{ok:!1,ontbreekt:["alles"]}:((typeof i.name!="string"||!i.name.trim())&&e.push("een naam"),go(i.time)||e.push("een geldige tijd"),i.speaker||e.push("een speaker"),(!i.sound||!i.sound.uri)&&e.push("een geluid"),(!Number.isInteger(i.volume_pct)||i.volume_pct<1||i.volume_pct>100)&&e.push("een volume tussen 1 en 100"),{ok:e.length===0,ontbreekt:e})}function gc(i){let e=[...new Set(i.days||[])].sort((n,a)=>n-a),t={name:(i.name||"").trim(),time:i.time,days:e,enabled:e.length===0?!0:i.enabled!==!1,sound:on(i.sound),speaker:i.speaker,volume_pct:i.volume_pct,light:i.light?{entity_id:i.light.entity_id,brightness_pct:i.light.brightness_pct}:null};return i.id&&(t.id=i.id),t}function fc(i,e){let t=new Set(i||[]);return t.has(e)?t.delete(e):t.add(e),[...t].sort((n,a)=>n-a)}function bc(i){return go(i)&&i.slice(0,2)==="02"?Yu:null}function vc(i){return i===!1?Qu:null}function kc(i){return typeof i?.endless=="boolean"?i.endless:null}function Oa(i,e){let t=e==="lamp",n=t?em:Ju,a=t?"lampen":"speakers";return!i||typeof i!="object"?`De lijst met ${a} is niet op te halen.`:i.label_exists===!1?`Het label '${n}' bestaat nog niet. De beheerder moet dat label aanmaken en op de ${a} zetten die als wekker mogen dienen.`:Array.isArray(i.entities)&&i.entities.length>0?null:Number(i.filtered_out)>0?t?`De entiteiten met het label '${n}' zijn geen lampen.`:"De gelabelde speakers zijn geen Music Assistant-speakers, of ze kunnen geen volume instellen.":`Er zijn nog geen ${a} met het label '${n}'.`}function xc(i,e){return Oa(e,"speaker")!==null?!1:fo(i).ok}var nm=[[1,"ma"],[2,"di"],[3,"wo"],[4,"do"],[5,"vr"],[6,"za"],[7,"zo"]],am=[["","Alles"],["playlist","Afspeellijsten"],["radio","Radio"],["artist","Artiesten"],["album","Albums"],["track","Nummers"],["podcast","Podcasts"]],sn="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",im="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",rm="M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z",St=class extends ee{constructor(){super(),this._concept=Ta(),this._zoekterm="",this._soort="",this._treffers=null,this._zoekt=!1,this._melding=null,this._speelt=!1,this._bezig=!1,this._afmeldenVoorbeeld=null,this._opEscape=e=>{e.key==="Escape"&&this._annuleren()}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this._opEscape,!0)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this._opEscape,!0),this._stopVoorbeeld()}willUpdate(e){e.has("wekker")&&(this._concept=this.wekker?mc(this.wekker):Ta(),this._treffers=null,this._zoekterm="",this._melding=null)}_zet(e){this._concept={...this._concept,...e}}async _startVoorbeeld(){if(!(this._speelt||!this.hass)){if(!this._concept.speaker||!this._concept.sound){this._melding={tekst:"Kies eerst een speaker en een geluid.",fout:!0};return}this._melding=null;try{this._afmeldenVoorbeeld=await this.hass.connection.subscribeMessage(()=>{},{type:ce.previewStart,speaker:this._concept.speaker,sound:on(this._concept.sound),volume_pct:this._concept.volume_pct,light:this._concept.light??null}),this._speelt=!0}catch(e){this._melding={tekst:e?.message??"Het voorbeeld kon niet starten.",fout:!0}}}}_stopVoorbeeld(){if(this._afmeldenVoorbeeld){try{this._afmeldenVoorbeeld()}catch(e){console.warn(`domotiapp-alarm-editor: afmelden mislukt: ${e?.message??e}`)}this._afmeldenVoorbeeld=null}this._speelt=!1}async _zoek(){let e=(this._zoekterm||"").trim();if(!(!e||!this.hass)){this._zoekt=!0,this._melding=null;try{let t={type:ce.search,query:e,limit:20};this._soort&&(t.media_types=[this._soort]);let n=await this.hass.callWS(t);this._treffers=n.results??[]}catch(t){this._treffers=[],this._melding={tekst:t?.message??"Zoeken is mislukt.",fout:!0}}finally{this._zoekt=!1}}}_kiesGeluid(e){this._zet({sound:on(e),endless:kc(e)}),this._treffers=null}async _opslaan(){if(this._bezig||!this.hass)return;let e=fo(this._concept);if(!e.ok){this._melding={tekst:`Er ontbreekt nog ${e.ontbreekt.join(", ")}.`,fout:!0};return}this._bezig=!0;try{let t=await this.hass.callWS({type:ce.save,person:this.person,alarm:gc(this._concept)});this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-opgeslagen",{detail:{toestand:t},bubbles:!0,composed:!0}))}catch(t){this._melding={tekst:t?.message??"Opslaan is mislukt.",fout:!0}}finally{this._bezig=!1}}_annuleren(){this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-dicht",{bubbles:!0,composed:!0}))}_svg(e){return y`<svg class="icoon" viewBox="0 0 24 24" aria-hidden="true">
      <path d=${e} />
    </svg>`}render(){if(!this.hass)return z;let e=this._concept,t=this.entiteiten?.speakers,n=this.entiteiten?.lights,a=Oa(t,"speaker"),r=Oa(n,"lamp"),o=bc(e.time),s=vc(e.endless),l=xc(e,t);return y`
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
            @input=${d=>this._zet({time:d.target.value})}
          />
        </div>
        ${o?y`<div class="waarschuwing">
              ${this._svg(sn)}<span>${o}</span>
            </div>`:z}
      </div>

      <div class="blok">
        <label class="veld">Herhaling</label>
        <div class="dagen">
          ${nm.map(([d,c])=>y`<button
              type="button"
              aria-pressed=${e.days.includes(d)?"true":"false"}
              aria-label=${c}
              @click=${()=>this._zet({days:fc(e.days,d)})}
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
            @input=${d=>this._zet({name:d.target.value})}
          />
        </div>
      </div>

      <div class="blok">
        <label class="veld" for="speaker">Speaker</label>
        ${a?y`<div class="uitleg">${this._svg(sn)}<span>${a}</span></div>`:y`<div class="vak">
              <select
                id="speaker"
                .value=${e.speaker}
                @change=${d=>this._zet({speaker:d.target.value})}
              >
                <option value="">Kies een speaker…</option>
                ${(t?.entities??[]).map(d=>y`<option value=${d.entity_id} ?selected=${d.entity_id===e.speaker}>
                    ${d.name}
                  </option>`)}
              </select>
            </div>`}
      </div>

      <div class="blok">
        <label class="veld" for="zoek">Geluid</label>
        ${e.sound?y`<div class="gekozen">
              ${e.sound.image?y`<img src=${e.sound.image} alt="" />`:z}
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
              @input=${d=>{this._zoekterm=d.target.value}}
              @keydown=${d=>{d.key==="Enter"&&(d.preventDefault(),this._zoek())}}
            />
          </div>
          <div class="vak auto">
            <select
              aria-label="Soort"
              @change=${d=>{this._soort=d.target.value}}
            >
              ${am.map(([d,c])=>y`<option value=${d}>${c}</option>`)}
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
            ${this._svg(this._zoekt?rm:im)}
          </button>
        </div>
        ${this._treffers?y`<div class="treffers">
              ${this._treffers.length===0?y`<div class="treffer">Niets gevonden.</div>`:this._treffers.map(d=>y`<button
                      class="treffer"
                      type="button"
                      @click=${()=>this._kiesGeluid(d)}
                    >
                      ${d.image?y`<img src=${d.image} alt="" />`:z}
                      <span>${d.name}</span>
                      <span class="soort">${d.media_type??""}</span>
                    </button>`)}
            </div>`:z}
        ${s?y`<div class="waarschuwing">${this._svg(sn)}<span>${s}</span></div>`:z}
      </div>

      <div class="blok">
        <label class="veld" for="volume">Volume: ${e.volume_pct}%</label>
        <input
          id="volume"
          type="range"
          min="1"
          max="100"
          .value=${String(e.volume_pct)}
          @input=${d=>this._zet({volume_pct:Number(d.target.value)})}
        />
        <div class="uitleg">
          Het niveau waar de wekker in twintig seconden naartoe groeit.
        </div>
      </div>

      <div class="blok">
        <label class="veld" for="lamp">Wake-up light (optioneel)</label>
        ${r?y`<div class="uitleg">${this._svg(sn)}<span>${r}</span></div>`:y`
              <div class="vak">
                <select
                  id="lamp"
                  @change=${d=>this._zet({light:d.target.value?{entity_id:d.target.value,brightness_pct:e.light?.brightness_pct??60}:null})}
                >
                  <option value="">Geen lamp</option>
                  ${(n?.entities??[]).map(d=>y`<option
                      value=${d.entity_id}
                      ?selected=${d.entity_id===e.light?.entity_id}
                    >
                      ${d.name}
                    </option>`)}
                </select>
              </div>
              ${e.light?y`<label class="veld" style="margin-top:10px" for="helderheid">
                      Helderheid: ${e.light.brightness_pct}%
                    </label>
                    <input
                      id="helderheid"
                      type="range"
                      min="1"
                      max="100"
                      .value=${String(e.light.brightness_pct)}
                      @input=${d=>this._zet({light:{...e.light,brightness_pct:Number(d.target.value)}})}
                    />`:z}
            `}
      </div>

      ${this._melding?y`<div class="blok">
            <div class="waarschuwing ${this._melding.fout?"fout":""}">
              ${this._svg(sn)}<span>${this._melding.tekst}</span>
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
          ?disabled=${!l||this._bezig}
          @click=${()=>this._opslaan()}
        >
          Opslaan
        </button>
      </div>
    `}};_(St,"properties",{hass:{attribute:!1},person:{attribute:!1},wekker:{attribute:!1},entiteiten:{attribute:!1},_concept:{state:!0},_zoekterm:{state:!0},_soort:{state:!0},_treffers:{state:!0},_zoekt:{state:!0},_melding:{state:!0},_speelt:{state:!0},_bezig:{state:!0}}),_(St,"styles",[ue,ie`
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${Me(Na)});
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
  `]);var wc="person",om="Kies een persoon in de kaartinstellingen.",_c="De gekozen persoon is niet gevonden.",sm="De opgeslagen wekkers van deze persoon zijn onleesbaar.",r1=Object.freeze(["grid_options","layout_options","view_layout","visibility"]);function yc(i){if(!i||typeof i!="object"||Array.isArray(i))throw new Error("De kaartconfig ontbreekt of is geen object.");let e=i.person;if(e==null||e==="")return{...i};if(typeof e!="string")throw new Error("'person' moet een entity-ID zijn, zoals person.sven.");if(!e.startsWith(`${wc}.`))throw new Error(`'${e}' zit niet in het domein ${wc}. Kies een persoon, zoals person.sven.`);return{...i}}function jc(i){return{type:`custom:${i}`}}function zc(i,e){return i?e?{soort:"ok",tekst:null,isFout:!1}:{soort:"weg",tekst:_c,isFout:!0}:{soort:"ontbreekt",tekst:om,isFout:!1}}function $c(i,e){return i==="not_found"?_c:i==="home_assistant_error"?sm:e||"Er ging iets mis bij het ophalen van de wekkers."}var lm=["ma","di","wo","do","vr","za","zo"],dm="Geen wekkers ingesteld",cm="Eenmalig",pm="Eenmalig \u2014 afgelopen",hm="Geen wekker actief",Ec="Stoppen",um="Er is een melding over deze wekker, maar de tekst ontbreekt.";function mm(i){return!Array.isArray(i)||i.length===0?cm:[...new Set(i)].sort((t,n)=>t-n).map(t=>lm[t-1]??"?").join(" ")}function gm(i,e){return!i||Array.isArray(i.days)&&i.days.length>0?!1:Date.parse(i?.one_shot_at??"")<=e}function Ac(i,e){return gm(i,e)?pm:mm(i?.days)}function Mc(i){let e=i?.last_message;return!e||typeof e!="object"||Array.isArray(e)?null:{tekst:typeof e.text=="string"&&e.text.trim()?e.text:um,severity:e.severity==="error"?"error":"notice",isFout:e.severity==="error",kind:typeof e.kind=="string"?e.kind:null}}function Sc(i){let e=i?.alarms;if(!Array.isArray(e)||e.length===0)return dm;let t=i?.next_fire?.text;return typeof t=="string"&&t.trim()?t:hm}function Nc(i,e){let t=[...new Set((e??[]).filter(o=>typeof o=="string"))];if(t.length===0)return null;let n=t.map(o=>(i??[]).find(s=>s?.id===o)).filter(Boolean),a=n.map(o=>o.name).filter(Boolean),r=[...new Set(n.map(o=>o.time).filter(Boolean))];return{ids:t,naam:a.length?a.join(" en "):"Wekker",tijd:r.join(" en ")}}var fm="0.36.0",bm="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",vm="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z",Tc="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",km="M13,14H11V9H13M13,18H11V16H13M1,21H23L12,2L1,21Z",Da=(i,e="icoon")=>y`<svg class=${e} viewBox="0 0 24 24" aria-hidden="true">
    <path d=${i} />
  </svg>`,ln=class extends ee{constructor(){super(),this._toestand=null,this._fout=null,this._bevestigVoor=null,this._bezig=!1,this._tijdelijkeMelding=null,this._editorVoor=void 0,this._entiteiten=null,this._abonnementVoor=null,this._afmelden=null,this._herkansing=new oe(()=>this._haalOp()),this._verbinding=new xe}setConfig(e){let t=yc(e),n=t.person!==this._config?.person;this._config=t,this.toggleAttribute("bare",!!e?.bare),n&&(this._toestand=null,this._fout=null,this._bevestigVoor=null,this._herstartAbonnement())}static getConfigElement(){return document.createElement(mo)}static getStubConfig(){return jc(ot)}getGridOptions(){return{rows:"auto",columns:12,min_columns:6,min_rows:lt(this.renderRoot?.querySelector?.(".card"))??1}}getCardSize(){if(this._stop())return 3;let e=this._toestand?.alarms?.length??0;return 1+Math.max(e,1)}connectedCallback(){super.connectedCallback(),this._herstartAbonnement()}disconnectedCallback(){super.disconnectedCallback(),this._herkansing.stop(),this._stopAbonnement(),this._rasterUit?.(),this._rasterUit=null,this._rasterVak=null}updated(e){e.has("hass")&&this.hass&&(this._startAbonnement(),this._verbinding.herverbonden(this.hass)&&(this._herkansing.herstel(),this._haalOp())),this._volgRaster()}_volgRaster(){let e=this.renderRoot?.querySelector(".card, .needs");e!==this._rasterVak&&(this._rasterUit?.(),this._rasterVak=e,this._rasterUit=e?R(e):null),O(e)}async _startAbonnement(){let e=this._config?.person;if(!(!this.hass||!e||!this.isConnected)&&this._abonnementVoor!==e){this._abonnementVoor=e;try{let t=await this.hass.connection.subscribeMessage(n=>this._opGebeurtenis(n),{type:ce.subscribe,person:e});if(this._abonnementVoor!==e){t();return}this._afmelden=t}catch(t){console.warn(`${ot}: abonneren mislukt: ${t?.message??t}`)}await this._haalOp()}}_stopAbonnement(){if(this._afmelden){try{this._afmelden()}catch(e){console.warn(`${ot}: afmelden mislukt: ${e?.message??e}`)}this._afmelden=null}this._abonnementVoor=null}_herstartAbonnement(){this._stopAbonnement(),this._startAbonnement()}_opGebeurtenis(e){let t=e?.alarm_id,n=e?.event;if(typeof t=="string"&&this._toestand){let a=new Set(this._toestand.ringing??[]);n==="started"?a.add(t):a.delete(t),this._toestand={...this._toestand,ringing:[...a]}}this._haalOp()}async _haalOp(){let e=this._config?.person;if(!(!this.hass||!e))try{let t=await this.hass.callWS({type:ce.get,person:e});if(this._config?.person!==e)return;this._toestand=t,this._fout=null,this._herkansing.herstel()}catch(t){if(this._config?.person!==e||de(t)&&this._herkansing.plan())return;this._toestand=null,this._fout=$c(t?.code,t?.message)}}async _roep(e){if(!(!this.hass||this._bezig)){this._bezig=!0;try{let t=await this.hass.callWS(e);t&&typeof t=="object"&&(this._toestand=t,this._fout=null)}catch(t){this._toon(t?.message??"De opdracht is niet gelukt.")}finally{this._bezig=!1}}}async _openEditor(e){if(this._bevestigVoor=null,this._editorVoor=e,!!this.hass)try{this._entiteiten=await this.hass.callWS({type:ce.entities})}catch(t){this._entiteiten=null,console.warn(`${ot}: entiteitenlijst ophalen mislukt: ${t?.message??t}`)}}_sluitEditor(){this._editorVoor=void 0}_toon(e){this._tijdelijkeMelding=e,clearTimeout(this._meldingTimer),this._meldingTimer=setTimeout(()=>{this._tijdelijkeMelding=null},6e3)}_person(){return this._config?.person}_zetAan(e,t){this._roep({type:ce.setEnabled,person:this._person(),alarm_id:e.id,enabled:t})}_verwijder(e){this._bevestigVoor=null,this._roep({type:ce.delete,person:this._person(),alarm_id:e.id})}_begrepen(e){this._roep({type:ce.clearMessage,person:this._person(),alarm_id:e.id})}async _stopAlles(e){for(let t of e)await this._roep({type:ce.stop,person:this._person(),alarm_id:t})}_stop(){return this._toestand?Nc(this._toestand.alarms,this._toestand.ringing):null}render(){if(!this._config)return z;let e=this._config.person,t=!!(e&&this.hass?.states?.[e]),n=zc(e,t);if(n.soort!=="ok")return this._mededeling(n.tekst,n.isFout);if(this._fout)return this._mededeling(this._fout,!0);if(!this._toestand)return this._mededeling("Wekkers ophalen\u2026",!1);let a=this._stop();return this._editorVoor!==void 0&&!a?y`<div class="card surface">
        <domotiapp-alarm-editor
          .hass=${this.hass}
          .person=${this._config.person}
          .wekker=${this._editorVoor}
          .entiteiten=${this._entiteiten}
          @editor-dicht=${()=>this._sluitEditor()}
          @editor-opgeslagen=${r=>{this._toestand=r.detail.toestand,this._sluitEditor()}}
        ></domotiapp-alarm-editor>
      </div>`:y`<div class="card surface">
      ${a?this._stopknop(a):this._lijst()}
      ${this._tijdelijkeMelding?y`<div class="onderrij">
            ${Da(Tc,"icoon klein")}
            <span class="boodschap">${this._tijdelijkeMelding}</span>
          </div>`:z}
    </div>`}_mededeling(e,t){return y`<div class="card surface">
      <div class="mededeling ${t?"fout":""}">${e}</div>
    </div>`}_stopknop(e){return y`<button
      class="stopknop"
      @click=${()=>this._stopAlles(e.ids)}
    >
      <div class="stop-tijd">${e.tijd}</div>
      <div class="stop-naam">${e.naam}</div>
      <div class="stop-woord">${Ec}</div>
    </button>`}_lijst(){let e=this._toestand.alarms??[],t=Date.now();return y`
      <div class="kop ${e.length===0?"leeg":""}">
        <span class="volgende">${Sc(this._toestand)}</span>
        <button
          class="icoonknop"
          title="Wekker toevoegen"
          aria-label="Wekker toevoegen"
          @click=${()=>this._openEditor(null)}
        >
          ${Da(bm)}
        </button>
      </div>
      ${e.map(n=>this._rij(n,t))}
    `}_bevestiging(e){return y`<div class="onderrij bevestiging">
      <span class="boodschap">${uc(e)}</span>
      <button
        class="tekstknop"
        @click=${()=>{this._bevestigVoor=null}}
      >
        Annuleren
      </button>
      <button class="tekstknop gevaar" @click=${()=>this._verwijder(e)}>
        Verwijderen
      </button>
    </div>`}_rij(e,t){let n=Mc(e),a=!!e.enabled;return y`
      <div class="rij ${a?"":"uit"}">
        <button
          class="tikvlak"
          type="button"
          aria-label="Wekker ${e.name} bewerken"
          @click=${()=>this._openEditor(e)}
        >
          <div class="tijd">${e.time}</div>
          <div class="tekst">
            <div class="naam">${e.name}</div>
            <div class="sub">${Ac(e,t)}</div>
          </div>
        </button>
        <button
          class="schakelaar"
          role="switch"
          aria-checked=${a?"true":"false"}
          aria-label="Wekker ${e.name} aan of uit"
          @click=${()=>this._zetAan(e,!a)}
        ></button>
        <button
          class="icoonknop"
          title="Verwijderen"
          aria-label="Wekker ${e.name} verwijderen"
          @click=${()=>{this._bevestigVoor=e.id}}
        >
          ${Da(vm)}
        </button>
      </div>
      ${this._bevestigVoor===e.id?this._bevestiging(e):z}
      ${n?y`<div class="onderrij ${n.isFout?"fout":""}">
            ${Da(n.isFout?km:Tc,"icoon klein")}
            <span class="boodschap">${n.tekst}</span>
            <button class="tekstknop" @click=${()=>this._begrepen(e)}>
              Begrepen
            </button>
          </div>`:z}
    `}};_(ln,"properties",{hass:{attribute:!1},_config:{state:!0},_toestand:{state:!0},_fout:{state:!0},_bevestigVoor:{state:!0},_bezig:{state:!0},_tijdelijkeMelding:{state:!0},_editorVoor:{state:!0},_entiteiten:{state:!0}}),_(ln,"styles",[ue,ie`
    /* unsafeCSS en niet de constante rechtstreeks: lit weigert een gewone
       string in een css-template en gooit dan — op modulescope, wat SPEC 19.4
       verbiedt. De waarde is onze eigen constante en komt nergens van buiten. */
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${Me(Na)});
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
  `]);var Nt=class Nt extends ee{constructor(){super(...arguments);_(this,"_label",t=>({person:"Persoon",bare:"Achtergrond weglaten"})[t.name]??t.name)}setConfig(t){this._config={...t}}render(){return!this._config||!this.hass?z:y`
      <div class="uitleg">
        Elke persoon heeft zijn eigen wekkerlijst. De kaart toont alleen de
        wekkers van de gekozen persoon.
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${Nt._SCHEMA}
        .computeLabel=${this._label}
        @value-changed=${this._gewijzigd}
      ></ha-form>
    `}_gewijzigd(t){t.stopPropagation();let n={...this._config,...t.detail.value};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:n},bubbles:!0,composed:!0}))}};_(Nt,"properties",{hass:{attribute:!1},_config:{state:!0}}),_(Nt,"styles",[ue,ie`
    .uitleg {
      padding: 0 0 12px 0;
      color: var(--dac-ink-2);
      font-size: 11.5px;
    }
  `]),_(Nt,"_SCHEMA",[{name:"person",required:!0,selector:{entity:{filter:{domain:"person"}}}},{name:"bare",selector:{boolean:{}}}]);var bo=Nt;L(ot,ln);L(mo,bo);L(cc,St);dt({type:ot,name:pc,description:`Wekkerkaart van DomotiApp (v${fm}).`,preview:!1,documentationURL:hc});var xm=["image/png","image/jpeg","image/gif","image/webp","image/svg+xml"];function Oc(i){return`/api/image/serve/${i}/original`}function Dc(i){return i?xm.includes(i.type)?i.size>12582912?`Deze afbeelding is ${Math.round(i.size/1024/1024)} MB. Home Assistant neemt er tot ${12582912/1024/1024} MB aan.`:null:"Kies een afbeelding: PNG, JPEG, GIF, WebP of SVG.":"Geen bestand gekozen."}var wm=`
  :host { ${G} display: block; font-family: var(--dac-font); color: var(--dac-ink); }
  *, *::before, *::after { box-sizing: border-box; }

  .kop { font-size: 12px; color: var(--dac-ink-2); margin-bottom: 6px; }

  .vak {
    display: flex; align-items: center; gap: 12px;
    padding: 12px; border-radius: var(--dac-radius-sm);
    border: 1px solid var(--dac-border); background: var(--dac-surface);
  }

  .voorbeeld {
    flex: 0 0 auto; width: 88px; height: 54px; overflow: hidden;
    border-radius: var(--dac-radius-sm); background: var(--dac-bg-raise);
    border: 1px solid var(--dac-border);
    display: grid; place-items: center;
  }
  .voorbeeld img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .voorbeeld .icon { width: 20px; height: 20px; color: var(--dac-ink-3); }

  .rechts { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 8px; }

  input[type="text"] {
    width: 100%; padding: 9px 10px; font: inherit; font-size: 13px;
    background: var(--dac-bg-raise); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius-sm); color: var(--dac-ink);
  }
  input[type="text"]:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  input[type="file"] { display: none; }

  .knoppen { display: flex; gap: 6px; flex-wrap: wrap; }
  button {
    padding: 8px 12px; cursor: pointer; font: inherit; font-size: 12.5px; font-weight: 500;
    border-radius: var(--dac-radius-pill);
    border: 1px solid var(--dac-border-hi); background: transparent; color: var(--dac-ink);
    display: inline-flex; align-items: center; gap: 6px;
  }
  button .icon { width: 14px; height: 14px; }
  button.doe { background: var(--dac-accent); border-color: var(--dac-accent); color: #fff; }
  button.weg { color: var(--dac-bad); border-color: color-mix(in srgb, var(--dac-bad) 45%, transparent); }
  button:disabled { opacity: .5; cursor: default; }
  @media (hover: hover) { button:not(:disabled):hover { border-color: var(--dac-accent-hi); } }

  .melding { font-size: 11.5px; color: var(--dac-ink-3); }
  .melding[data-fout="true"] { color: var(--dac-bad); }
  .melding[hidden] { display: none; }
`,vo=class extends HTMLElement{static get sheet_(){return Object.hasOwn(this,"s_")||(this.s_=F(wm)),this.s_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[this.constructor.sheet_]}connectedCallback(){this.gebouwd_||this.bouw_(),this.teken_()}set value(e){this.value_=e??"",this.gebouwd_&&this.teken_()}get value(){return this.value_??""}set label(e){this.label_=e,this.gebouwd_&&this.teken_()}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.shadowRoot.innerHTML=`
      <div class="kop"></div>
      <div class="vak">
        <span class="voorbeeld"></span>
        <span class="rechts">
          <input type="text" placeholder="/local/auto.png" aria-label="Pad naar de afbeelding" />
          <span class="knoppen">
            <button class="doe kies" type="button">${b("plus")}<span>Kies een bestand</span></button>
            <button class="weg leeg" type="button">Wissen</button>
          </span>
          <span class="melding" hidden></span>
        </span>
      </div>
      <input type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" />`,this.gebouwd_=!0;let e=this.$('input[type="file"]');this.$(".kies").addEventListener("click",()=>e.click()),e.addEventListener("change",()=>{let n=e.files?.[0];e.value="",this.upload_(n)}),this.$(".leeg").addEventListener("click",()=>this.zet_(""));let t=this.$('input[type="text"]');t.addEventListener("change",()=>this.zet_(t.value.trim()))}teken_(){this.$(".kop").textContent=this.label_??"Afbeelding";let e=this.$('input[type="text"]');!(this.shadowRoot.activeElement===e)&&e.value!==this.value&&(e.value=this.value);let n=this.$(".voorbeeld");if(this.value){if(n.dataset.bron!==this.value){n.dataset.bron=this.value;let a=document.createElement("img");a.src=this.value,a.alt="",a.onerror=()=>{n.dataset.bron="",n.innerHTML=b("car")},n.replaceChildren(a)}}else n.dataset.bron!==""&&(n.dataset.bron="",n.innerHTML=b("car"))}zet_(e){this.value_=e,this.teken_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}melding_(e,t=!1){let n=this.$(".melding");n.textContent=e,n.dataset.fout=String(t),n.hidden=!e}async upload_(e){let t=Dc(e);if(t)return this.melding_(t,!0);this.melding_("Bezig met uploaden\u2026"),this.$(".kies").disabled=!0;try{let n=new FormData;n.append("file",e);let a=this.hass?.auth?.data?.access_token??this.hass?.auth?.accessToken,r=await fetch("/api/image/upload",{method:"POST",body:n,headers:a?{Authorization:`Bearer ${a}`}:{}});if(!r.ok)throw new Error(`Home Assistant antwoordde met ${r.status}`);let o=await r.json();if(!o?.id)throw new Error("Home Assistant gaf geen id terug.");this.zet_(Oc(o.id)),this.melding_("Ge\xFCpload.")}catch(n){this.melding_(`${n?.message??"Uploaden lukte niet"}. Je kunt het pad ook zelf intypen, bijvoorbeeld /local/auto.png.`,!0)}finally{this.$(".kies").disabled=!1}}};L("dac-foto-picker",vo);var _m="/api/domotiapp_lovelace/loader.js",Lc="domotiapp-lovelace-verversing";function Cc(i){let e=/[?&]v=([0-9a-fA-F]+)/.exec(String(i??""));return e?e[1].toLowerCase():null}async function ym(i){try{let e=await i(_m,{cache:"no-store"});return e?.ok?Cc(await e.text()):null}catch{return null}}function jm(){try{return globalThis.sessionStorage?.getItem(Lc)??null}catch{return null}}function zm(i){try{globalThis.sessionStorage?.setItem(Lc,i)}catch{return!1}return!0}function $m(i,e,t){return!i||!e?"onbekend":i===e?"actueel":t===e?"al-geprobeerd":"herladen"}function Hc({eigenUrl:i,haal:e=globalThis.fetch?.bind(globalThis),herlaad:t=()=>globalThis.location?.reload(),doc:n=globalThis.document,interval:a=18e5,klok:r=setInterval}={}){let o=Cc(i);if(!o||!e)return()=>{};let s=!1,l=async()=>{if(!s&&!n?.querySelector?.("dialog[open], ha-dialog[open]")){s=!0;try{let p=await ym(e);if($m(o,p,jm())!=="herladen"||!zm(p))return;t()}finally{s=!1}}},d=()=>n?.visibilityState==="visible"?l():void 0;n?.addEventListener?.("visibilitychange",d);let c=r(d,a);return()=>{n?.removeEventListener?.("visibilitychange",d),clearInterval(c)}}var Em="0.36.0";Do(i=>console.warn(`domotiapp-lovelace: ${i}`));Hc({eigenUrl:import.meta.url});console.info(`%c DOMOTIAPP-LOVELACE %c ${Em} `,"background:#026fa1;color:#e8e4de;font-weight:600;border-radius:3px 0 0 3px;padding:2px 6px","background:#12120f;color:#e8e4de;border-radius:0 3px 3px 0;padding:2px 6px");export{Em as VERSION};
