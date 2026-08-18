var hi=Object.defineProperty;var pi=(i,e,t)=>e in i?hi(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var v=(i,e,t)=>pi(i,typeof e!="symbol"?e+"":e,t);var F=`
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

  --dac-shadow:        0 1px 0 rgba(255, 255, 255, 0.04) inset,
                       0 18px 40px -24px rgba(0, 0, 0, 0.9);

  /* One row height for every interactive card in the family, so a column of
     mixed cards lines up instead of stepping. */
  --dac-row-h:         56px;
`,Ae=`
  *, *::before, *::after { box-sizing: border-box; }

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
`;function ie(i){let e=new CSSStyleSheet;return e.replaceSync(i),e}var R=i=>String(i??"").split(".")[0],b=(i,e)=>e&&i?.states?.[e]||null,z=(i,e)=>b(i,e)?.attributes??{},Ne=(i,e,t)=>t?null:z(i,e).entity_picture||null;function Ce(i){if(!i||i.state!=="on")return null;let e=i.attributes??{};if(Array.isArray(e.entity_id))return null;let t=e.rgb_color;return Array.isArray(t)&&t.length>=3?`rgb(${t[0]},${t[1]},${t[2]})`:null}function T(i,e,t){return t||z(i,e).friendly_name||e||""}var ui=new Set(["scene","script","input_button","button","event"]),he=i=>ui.has(R(i));function B(i){return!i||i.state==="unavailable"?!0:i.state==="unknown"?!he(i.entity_id):!1}function Te(i){if(!i)return!1;let e=i.state;if(e==="unavailable"||e==="unknown")return!1;switch(R(i.entity_id)){case"cover":return e==="open"||e==="opening";case"alarm_control_panel":return e.startsWith("armed")||e==="triggered"||e==="arming";case"climate":case"water_heater":case"humidifier":return e!=="off";case"person":case"device_tracker":return e==="home";case"media_player":return e!=="off"&&e!=="idle"&&e!=="standby";default:return e==="on"||e==="playing"||e==="active"||e==="heat"}}function cn(i,e,t){if(!i||i.themes!==e.themes||i.language!==e.language)return!0;for(let n of t)if(n&&i.states?.[n]!==e.states?.[n])return!0;return!1}function ze(i,e,t={}){i.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!1}))}var W=(i,e)=>ze(i,"hass-more-info",{entityId:e});function Oe(i){switch(R(i)){case"light":case"switch":case"fan":case"input_boolean":case"automation":case"siren":return{action:"toggle"};case"script":case"scene":case"input_button":case"button":return{action:"toggle"};default:return{action:"more-info"}}}function mi(i){switch(R(i)){case"scene":return["scene","turn_on"];case"script":return["script","turn_on"];case"input_button":return["input_button","press"];case"button":return["button","press"];case"lock":return["lock","open"];case"cover":return["cover","toggle"];case"media_player":return["media_player","media_play_pause"];default:return["homeassistant","toggle"]}}function Le(i,e,t,n){if(!(!n||n.action==="none"))switch(n.action){case"more-info":W(i,n.entity||t.entity);break;case"toggle":{let s=n.entity||t.entity;if(!s)break;let[r,a]=mi(s);e.callService(r,a,{entity_id:s});break}case"perform-action":case"call-service":{let s=n.perform_action||n.service;if(!s)break;let[r,a]=s.split(".");e.callService(r,a,n.data??n.service_data??{},n.target);break}case"navigate":if(!n.navigation_path)break;history.pushState(null,"",n.navigation_path),ze(window,"location-changed",{replace:!1});break;case"url":n.url_path&&window.open(n.url_path,n.target??"_blank");break;case"assist":ze(i,"show-dialog",{dialogTag:"ha-voice-command-dialog",dialogImport:()=>{},dialogParams:{}});break;case"fire-dom-event":ze(i,"ll-custom",n);break;default:break}}function D(i,{onTap:e,onHold:t,onDouble:n}){let a=0,o=0,c=null,l=h=>{h.button!=null&&h.button!==0||(a=Date.now())},p=()=>{let h=a?Date.now()-a:0;if(a=0,t&&h>=500){navigator.vibrate?.(18),t();return}if(!n){e?.();return}if(o++,o===1){c=setTimeout(()=>{o=0,e?.()},260);return}clearTimeout(c),o=0,n()};return i.addEventListener("pointerdown",l),i.addEventListener("click",p),i.addEventListener("contextmenu",h=>h.preventDefault()),()=>{clearTimeout(c),i.removeEventListener("pointerdown",l),i.removeEventListener("click",p)}}function U(i,e){if(!e)return"";let t=R(e.entity_id),n=e.attributes.device_class;return i.formatEntityState?.(e)??i.localize?.(`component.${t}.entity_component.${n??"_"}.state.${e.state}`)??i.localize?.(`component.${t}.entity_component._.state.${e.state}`)??e.state}function H(i,e,t){let n=Number(e);return Number.isFinite(n)?n.toLocaleString(i?.locale?.language??"nl",{minimumFractionDigits:t??0,maximumFractionDigits:t??0}):"--"}var an=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],ln=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"],on=(i=new Date)=>new Date(i.getFullYear(),i.getMonth(),i.getDate()),ct=(i,e)=>Math.round((on(e)-on(i))/864e5);function pe(i){if(!i)return null;if(i instanceof Date)return Number.isNaN(+i)?null:i;let e=String(i).trim(),t=e.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);if(t)return new Date(+t[3],+t[2]-1,+t[1]);if(t=e.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/),t)return new Date(+t[1],+t[2]-1,+t[3]);let n=new Date(e);return Number.isNaN(+n)?null:n}function lt(i,e=new Date){if(!i)return"";let t=ct(e,i);return t<0?`${Math.abs(t)} dagen geleden`:t===0?"vandaag":t===1?"morgen":t===2?"overmorgen":t<=6?an[i.getDay()]:`${an[i.getDay()].slice(0,2)} ${i.getDate()} ${ln[i.getMonth()]}`}var dn=i=>i?`${i.getDate()} ${ln[i.getMonth()]}`:"";var gi="home-assistant";function hn({leesRegistry:i,definities:e,waarschuw:t=()=>{},plan:n=(c,l)=>setTimeout(c,l),nu:s=()=>Date.now(),marker:r=gi,intervalMs:a=20,maxWachtMs:o=1e4}){let c=s();function l(){let m=i();if(!m)return!1;for(let[_,u]of e)try{m.get(_)||m.define(_,u)}catch(y){t(`kon ${_} niet registreren: ${y&&y.message}`)}return!0}function p(){let m=i();return!m||!m.get(r)?!1:l()}if(p())return!0;let h=()=>{if(!p()){if(s()-c>=o){t(`${r} is na ${o} ms niet verschenen; de kaart wordt alsnog geregistreerd`),l();return}n(h,a)}};return n(h,a),!1}var pn=[];function I(i,e){pn.push([i,e])}function je({type:i,name:e,description:t,preview:n=!0,documentationURL:s}){window.customCards=window.customCards??[],!window.customCards.some(r=>r.type===i)&&window.customCards.push({type:i,name:e??i,description:t??"",preview:n,documentationURL:s??"https://github.com/Sven2410/domotiapp-lovelace"})}function un(i=()=>{}){hn({leesRegistry:()=>globalThis.customElements,definities:pn,waarschuw:i})}var fi=`
  :host {
    ${F}
    display: block;
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  :host([hidden]) { display: none; }
`,K={accent:"var(--dac-accent-hi)",solar:"var(--dac-solar)",house:"var(--dac-house)",water:"var(--dac-grid-in)",magenta:"var(--dac-grid-out)",pink:"var(--dac-device-1)",teal:"var(--dac-device-2)",lit:"var(--dac-lit)",good:"var(--dac-good)",warn:"var(--dac-warn)",bad:"var(--dac-bad)",neutral:"var(--dac-ink-3)"},De={accent:"Accent",solar:"Oranje",house:"Blauw",water:"Lichtblauw",magenta:"Magenta",pink:"Roze",teal:"Groenblauw",lit:"Lampgeel",good:"Goed",warn:"Let op",bad:"Kritiek",neutral:"Neutraal"},O=(i,e="accent")=>K[i]??(i&&/[#(]|^var/.test(i)?i:K[e]),j=Symbol("incomplete"),bi=i=>`
  <div class="needs">
    <span class="mark"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6"/>
      <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>
    </svg></span>
    <span><b>Nog niets gekozen</b><span>${i}</span></span>
  </div>`,_i=56,mn=8,X=i=>Math.max(1,Math.ceil((i+mn)/(_i+mn))),S=class extends HTMLElement{static get styleSheets_(){return Object.hasOwn(this,"sheets_")||(this.sheets_=[ie(fi+Ae+this.css)]),this.sheets_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=new.target.styleSheets_,this.built_=!1,this.wired_=!1,this.teardown_=[]}setConfig(e){let t=this.validate(e??{});this.config=t,this.built_&&(this.destroy_(),this.shadowRoot.replaceChildren(),this.built_=!1,this.wired_=!1),this.isConnected&&this.build_()}set hass(e){let t=this.hass_;if(this.hass_=e,!!this.config){if(!this.built_){this.build_();return}this.config[j]||cn(t,e,this.watched())&&this.paint()}}get hass(){return this.hass_}connectedCallback(){if(this.config){if(!this.built_){this.build_();return}this.config[j]||this.wired_||(this.wire(),this.wired_=!0,this.hass_&&this.paint())}}disconnectedCallback(){this.destroy_(),this.wired_=!1}validate(e){return e}watched(){return this.config?.entity?[this.config.entity]:[]}template(){return""}wire(){}paint(){}build_(){let e=document.createElement("template"),t=this.config?.[j];e.innerHTML=t?bi(t):this.template(),this.shadowRoot.appendChild(e.content),this.built_=!0,!t&&(this.wire(),this.wired_=!0,this.hass_&&this.paint())}destroy_(){for(let e of this.teardown_)try{e()}catch{}this.teardown_=[]}on(e,t,n,s){e&&(e.addEventListener(t,n,s),this.teardown_.push(()=>e.removeEventListener(t,n,s)))}$(e){return this.shadowRoot.querySelector(e)}$$(e){return[...this.shadowRoot.querySelectorAll(e)]}text(e,t){let n=typeof e=="string"?this.$(e):e;n&&n.textContent!==String(t)&&(n.textContent=t)}getCardSize(){return 1}};v(S,"css","");function N(i,e,{name:t,description:n,preview:s=!0}={}){I(i,e),je({type:i,name:t,description:n,preview:s})}function L(i,e){I(i,e)}var d=(i,e="none")=>`<svg class="icon" viewBox="0 0 24 24" fill="${e}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${i}</svg>`,k={house:d(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
    <path d="M5.4 12.9V20a.9.9 0 0 0 .9.9h11.4a.9.9 0 0 0 .9-.9v-7.1"/>
    <path d="M9.8 20.9v-5.2h4.4v5.2"/>`),floorB:d(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M9.4 17.8V14h2.4a1.9 1.9 0 0 1 0 3.8Z"/>`),floor1:d(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M10.6 15.2 12 14v3.9"/>`),floor2:d(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M10.4 14.8a1.6 1.6 0 0 1 3.1.5c0 1.4-3.1 1.8-3.1 3.5h3.2"/>`),garage:d(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M8.2 20.4v-5.6h7.6v5.6M8.2 17.6h7.6"/>`),garageOpen:d(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M7.6 14.4h8.8M7.6 12.4h8.8"/>`),garageClosed:d(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M7.6 13.2h8.8M7.6 15.4h8.8M7.6 17.6h8.8M7.6 19.8h8.8"/>`),shutter:d(`<path d="M3.6 4.2h16.8M5.2 4.2v13.4M18.8 4.2v13.4"/>
    <path d="M5.2 7.6h13.6M5.2 11h13.6M5.2 14.4h13.6M5.2 17.6h13.6"/>`),shutterOpen:d(`<path d="M3.6 4.2h16.8M5.2 4.2v15.6M18.8 4.2v15.6"/>
    <path d="M5.2 6.6h13.6M5.2 8.6h13.6"/>`),awning:d(`<path d="M2.8 11.4 6.2 5h11.6l3.4 6.4z"/>
    <path d="M2.8 11.4c1.5 1.7 3 1.7 4.5 0s3-1.7 4.5 0 3 1.7 4.5 0 3-1.7 4.5 0"/>
    <path d="M12 14.6v4.8"/>`),arrowUp:d('<path d="M12 19.4V5M6.4 10.6 12 5l5.6 5.6"/>'),arrowDown:d('<path d="M12 4.6V19M17.6 13.4 12 19l-5.6-5.6"/>'),stop:d('<rect x="6.4" y="6.4" width="11.2" height="11.2" rx="1.8"/>'),bulb:d(`<path d="M9.4 18.4h5.2M10.4 21.2h3.2"/>
    <path d="M12 2.9a6.2 6.2 0 0 0-3.6 11.2c.5.4.8 1 .8 1.7v.4h5.6v-.4c0-.7.3-1.3.8-1.7A6.2 6.2 0 0 0 12 2.9Z"/>`),bulbGroup:d(`<path d="M7.6 15.6h4M8.2 17.8h2.8"/>
    <path d="M9.6 3.4a4.8 4.8 0 0 0-2.8 8.7c.4.3.6.8.6 1.3v.5h4.4v-.5c0-.5.2-1 .6-1.3a4.8 4.8 0 0 0-2.8-8.7Z"/>
    <path d="M16 8.4a4.4 4.4 0 0 1 2.4 8c-.3.3-.5.7-.5 1.1v.4h-3.8"/>
    <path d="M15.4 20.6h2.4"/>`),switchOn:d(`<rect x="2.8" y="7.4" width="18.4" height="9.2" rx="4.6"/>
    <circle cx="16.6" cy="12" r="2.6" fill="currentColor" stroke="none"/>`),person:d(`<circle cx="12" cy="7.6" r="3.6"/>
    <path d="M4.8 20.4v-1.2a5 5 0 0 1 5-5h4.4a5 5 0 0 1 5 5v1.2"/>`),people:d(`<circle cx="9.4" cy="8.2" r="3.2"/>
    <path d="M3.4 20v-1a4.6 4.6 0 0 1 4.6-4.6h2.8A4.6 4.6 0 0 1 15.4 19v1"/>
    <path d="M16.2 5.3a3.2 3.2 0 0 1 0 5.9"/>
    <path d="M17.6 14.6a4.6 4.6 0 0 1 3 4.3V20"/>`),away:d(`<circle cx="10.4" cy="7.6" r="3.4"/>
    <path d="M3.6 20.4v-1.2a4.8 4.8 0 0 1 4.8-4.8h2.6"/>
    <path d="M14.6 17.4h6M18 14.8l2.6 2.6-2.6 2.6"/>`),bin:d(`<path d="M3.6 6.8h16.8"/>
    <path d="M9.4 6.8V4.6a.9.9 0 0 1 .9-.9h3.4a.9.9 0 0 1 .9.9v2.2"/>
    <path d="m5.9 6.8 1 12.5a1 1 0 0 0 1 .9h8.2a1 1 0 0 0 1-.9l1-12.5"/>
    <path d="M10.2 10.6v5.8M13.8 10.6v5.8"/>`),binWheeled:d(`<path d="M5.6 7.4h12.8l-1 10.6a1 1 0 0 1-1 .9H7.6a1 1 0 0 1-1-.9z"/>
    <path d="M4.4 7.4h15.2M9.6 7.4V5.2h4.8v2.2"/>
    <circle cx="8.6" cy="20.4" r="1.3"/><circle cx="15.4" cy="20.4" r="1.3"/>`),calendar:d(`<rect x="3.6" y="5.4" width="16.8" height="15" rx="2"/>
    <path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6"/>`),sun:d(`<circle cx="12" cy="12" r="4.1"/>
    <path d="M12 2.4v2.3M12 19.3v2.3M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.4 12h2.3M19.3 12h2.3M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>`),cloud:d('<path d="M7.2 18.4a4.2 4.2 0 0 1-.5-8.4 5.6 5.6 0 0 1 10.8-1.2 3.9 3.9 0 0 1 .6 7.7z"/>'),cloudSun:d(`<path d="M6.8 8.2a3.4 3.4 0 1 1 4.6 3.2"/>
    <path d="M5 4.6 6.1 5.7M3.2 9.2h1.6M9.4 4.6 8.3 5.7M6.8 1.9v1.5"/>
    <path d="M9.4 19.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10 1 3.6 3.6 0 0 1 .5 6.8z"/>`),rain:d(`<path d="M7.4 15.4a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M9 18.2 8.2 20.6M12.4 18.2l-.8 2.4M15.8 18.2l-.8 2.4"/>`),snow:d(`<path d="M7.4 14.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M9 17.6v3M7.6 18.4l2.8 1.4M10.4 18.4l-2.8 1.4"/>
    <path d="M15 17.6v3M13.6 18.4l2.8 1.4M16.4 18.4l-2.8 1.4"/>`),fog:d(`<path d="M7.4 12.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M4.4 16h15.2M6.4 19.4h11.2"/>`),wind:d(`<path d="M3.4 8.4h9.4a2.7 2.7 0 1 0-2.7-2.7"/>
    <path d="M3.4 12.6h13.2a2.7 2.7 0 1 1-2.7 2.7"/>
    <path d="M3.4 16.8h6.2a2.5 2.5 0 1 1-2.5 2.5"/>`),drop:d('<path d="M12 3.4s5.6 6.1 5.6 9.8a5.6 5.6 0 0 1-11.2 0C6.4 9.5 12 3.4 12 3.4Z"/>'),uv:d(`<circle cx="12" cy="11.4" r="3.4"/>
    <path d="M12 3.6v1.8M12 17.4v1.6M4.6 11.4h1.8M17.6 11.4h1.8M6.6 6l1.3 1.3M16.1 15.5l1.3 1.3M6.6 16.8l1.3-1.3M16.1 7.3l1.3-1.3"/>
    <path d="M8.4 21.4h7.2"/>`),sunset:d(`<path d="M3.4 19.6h17.2M6.6 16.2a5.4 5.4 0 0 1 10.8 0"/>
    <path d="M12 3.2v3.4M5.2 6.6l1.8 1.8M18.8 6.6 17 8.4"/>`),sunrise:d(`<path d="M3.4 19.6h17.2M6.6 16.2a5.4 5.4 0 0 1 10.8 0"/>
    <path d="M12 8.2V3.4M9.4 5.8 12 3.2l2.6 2.6"/>`),thermo:d(`<path d="M14.2 14.6V5.6a2.2 2.2 0 1 0-4.4 0v9a4.2 4.2 0 1 0 4.4 0Z"/>
    <path d="M12 9.4v5.8"/>`),shield:d(`<path d="M12 3.2 4.8 5.9v5.5c0 4.4 3 8 7.2 9.4 4.2-1.4 7.2-5 7.2-9.4V5.9z"/>
    <path d="m9.1 12 2 2 3.8-4"/>`),bolt:d('<path d="M13.4 2.6 5.2 13.6h5.6L10.4 21.4l8.4-11.2h-5.6z"/>'),wifi:d(`<path d="M4.2 9.2a11.4 11.4 0 0 1 15.6 0"/>
    <path d="M7.4 12.6a6.9 6.9 0 0 1 9.2 0"/>
    <path d="M10.4 15.9a2.6 2.6 0 0 1 3.2 0"/>
    <circle cx="12" cy="19" r="1.1"/>`),smoke:d(`<path d="M6.4 15.4a3.3 3.3 0 0 1 .5-6.5 4.8 4.8 0 0 1 9.3-.6 3.5 3.5 0 0 1 1.6 7.1z"/>
    <path d="M5.8 19h3.2M11.2 19h3.2M16.6 19h1.8"/>`),star:d('<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9.9 5.6L12 16.4l-5 2.6.9-5.6-4-3.9 5.6-.8z"/>'),moon:d('<path d="M20.4 14.3A8.6 8.6 0 0 1 9.7 3.6a8.8 8.8 0 1 0 10.7 10.7Z"/>'),radio:d(`<rect x="2.8" y="8.4" width="18.4" height="11.4" rx="2"/>
    <path d="m7.4 8.4 9.8-4.2"/>
    <circle cx="15.8" cy="14.1" r="2.9"/>
    <path d="M6.2 12.2h4.4M6.2 16h4.4"/>`),leaf:d(`<path d="M4.6 19.6c-1.4-7.6 3.4-14 14.9-15.2 1.1 8.4-3.3 15.3-14.9 15.2Z"/>
    <path d="M4.2 20.4c2.6-4.6 6-7.6 10.4-9.6"/>`),cog:d(`<circle cx="12" cy="12" r="3.1"/>
    <path d="M12 3.4v2.2M12 18.4v2.2M20.6 12h-2.2M5.6 12H3.4M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6M18.1 18.1l-1.6-1.6M7.5 7.5 5.9 5.9"/>`),grid:d(`<rect x="3.6" y="3.6" width="7.2" height="7.2" rx="1.8"/>
    <rect x="13.2" y="3.6" width="7.2" height="7.2" rx="1.8"/>
    <rect x="3.6" y="13.2" width="7.2" height="7.2" rx="1.8"/>
    <rect x="13.2" y="13.2" width="7.2" height="7.2" rx="1.8"/>`),door:d(`<path d="M5.4 20.6h13.2"/>
    <path d="M6.8 20.6V4.6a.9.9 0 0 1 .9-.9h8.6a.9.9 0 0 1 .9.9v16"/>
    <circle cx="14.4" cy="12.4" r="1"/>`),window:d(`<rect x="4.2" y="3.8" width="15.6" height="16.4" rx="1.6"/>
    <path d="M12 3.8v16.4M4.2 12h15.6"/>`),lock:d(`<rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2"/>
    <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/>
    <circle cx="12" cy="15.3" r="1.2"/>`),lockOpen:d(`<rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2"/>
    <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.4-1.1"/>
    <circle cx="12" cy="15.3" r="1.2"/>`),fan:d(`<circle cx="12" cy="12" r="1.9"/>
    <path d="M12 10.1c0-3 .6-6.4 3-6.4 1.7 0 2.4 2.6-.4 4.6"/>
    <path d="M13.9 12c3 0 6.4.6 6.4 3 0 1.7-2.6 2.4-4.6-.4"/>
    <path d="M12 13.9c0 3-.6 6.4-3 6.4-1.7 0-2.4-2.6.4-4.6"/>
    <path d="M10.1 12c-3 0-6.4-.6-6.4-3 0-1.7 2.6-2.4 4.6.4"/>`),airco:d(`<rect x="3.4" y="4.6" width="17.2" height="8.2" rx="2"/>
    <path d="M6.6 9.6h10.8"/>
    <path d="M7.4 16.2c1.6 0 1.6 2.2 3.2 2.2M13.4 16.2c1.6 0 1.6 2.2 3.2 2.2"/>`),tv:d(`<rect x="2.8" y="4.4" width="18.4" height="12.2" rx="1.8"/>
    <path d="M8.4 20.2h7.2M12 16.6v3.6"/>`),speaker:d(`<rect x="5.6" y="2.8" width="12.8" height="18.4" rx="2"/>
    <circle cx="12" cy="15" r="3.2"/><circle cx="12" cy="6.8" r="1.2"/>`),camera:d(`<path d="M3.4 8.6A1.6 1.6 0 0 1 5 7h8a1.6 1.6 0 0 1 1.6 1.6v6.8A1.6 1.6 0 0 1 13 17H5a1.6 1.6 0 0 1-1.6-1.6z"/>
    <path d="m14.6 11 6-3v8l-6-3z"/>`),car:d(`<path d="M4.2 15.4h15.6"/>
    <path d="M6.2 15.4v2.4a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-2.4M20.3 15.4v2.4a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-2.4"/>
    <path d="M3.8 15.4v-3.2l2-4.6a1.3 1.3 0 0 1 1.2-.8h10a1.3 1.3 0 0 1 1.2.8l2 4.6v3.2z"/>
    <circle cx="7.4" cy="12.5" r=".95"/><circle cx="16.6" cy="12.5" r=".95"/>`),plug:d(`<path d="M9 3.4v5.2M15 3.4v5.2"/>
    <path d="M6.4 8.6h11.2v2.2a5.6 5.6 0 0 1-11.2 0z"/>
    <path d="M12 16.4v4.2"/>`),battery:d(`<rect x="2.8" y="7.4" width="16.4" height="9.2" rx="2"/>
    <path d="M21.2 10.6v2.8"/>
    <rect x="5.2" y="9.8" width="6" height="4.4" rx="1" fill="currentColor" stroke="none"/>`),gaugeArrow:d(`<path d="M4.2 17.4a8.4 8.4 0 1 1 15.6 0"/>
    <path d="m12 13.6 3.6-3.8"/><circle cx="12" cy="14.8" r="1.3"/>`),clock:d('<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 1.9"/>'),washer:d(`<rect x="4.2" y="2.8" width="15.6" height="18.4" rx="2"/>
    <circle cx="12" cy="14" r="4.4"/>
    <path d="M4.2 7.4h15.6M15.4 5.1h1.6"/>`),dishwasher:d(`<rect x="4.2" y="2.8" width="15.6" height="18.4" rx="2"/>
    <path d="M4.2 7.8h15.6M7.2 5.3h2.4"/>
    <path d="M9 11.4c1 1.4 1 2.8 0 4.2M12 11.4c1 1.4 1 2.8 0 4.2M15 11.4c1 1.4 1 2.8 0 4.2"/>`),printer:d(`<path d="M7 9V4.6a.6.6 0 0 1 .6-.6h8.8a.6.6 0 0 1 .6.6V9"/>
    <rect x="3.6" y="9" width="16.8" height="7.2" rx="1.8"/>
    <path d="M7 15.4h10v4a.6.6 0 0 1-.6.6H7.6a.6.6 0 0 1-.6-.6z"/>`),key:d(`<circle cx="7.8" cy="12" r="3.8"/>
    <path d="M11.6 12h8.6M17.4 12v3M20.2 12v2.2"/>`),power:d(`<path d="M12 3.6v8"/>
    <path d="M17.4 6.6a7.6 7.6 0 1 1-10.8 0"/>`),plus:d('<path d="M12 5.2v13.6M5.2 12h13.6"/>'),minus:d('<path d="M5.2 12h13.6"/>'),chevronRight:d('<path d="m9.4 6.2 5.6 5.8-5.6 5.8"/>'),chevronDown:d('<path d="m6.2 9.4 5.8 5.6 5.8-5.6"/>'),close:d('<path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"/>'),check:d('<path d="m5.2 12.6 4.4 4.4 9.2-10"/>'),dots:d('<circle cx="5.4" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.6" cy="12" r="1.5"/>'),warning:d('<path d="M12 4.2 2.8 20h18.4z"/><path d="M12 10v4.4M12 17.4v.1"/>'),question:d(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>`),pencil:d(`<path d="M4.5 19.5h3.2L18.4 8.8a1.9 1.9 0 0 0 0-2.7l-.5-.5a1.9 1.9 0 0 0-2.7 0L4.5 16.3z"/>
    <path d="m14.6 6.8 2.6 2.6"/>`),een:d(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10.6 9.9 12.4 8.6v6.9"/>`),twee:d(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10 9.7a2.1 2.1 0 1 1 3.9 1.1L9.9 15.5h4.2"/>`),drie:d(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10 9.5a2 2 0 1 1 1.8 2.6 2.1 2.1 0 1 1-1.7 2.7"/>`)};function M(i,e="question"){return i?k[i]?k[i]:i.includes(":")?`<ha-icon class="icon" icon="${i}"></ha-icon>`:k[e]??k.question:k[e]??k.question}function ue(i,e={}){switch(String(i??"").split(".")[0]){case"light":return"bulb";case"switch":return"switchOn";case"cover":return e.device_class==="awning"||e.device_class==="blind"?"awning":"shutter";case"person":case"device_tracker":return"person";case"climate":return"thermo";case"binary_sensor":return e.device_class==="smoke"?"smoke":"shield";case"alarm_control_panel":return"shield";case"scene":case"script":case"input_button":case"button":return"star";case"weather":return"cloudSun";default:return"question"}}function gn(i){switch(i){case"sunny":case"clear-night":return"sun";case"partlycloudy":return"cloudSun";case"cloudy":return"cloud";case"rainy":case"pouring":case"hail":case"lightning":case"lightning-rainy":return"rain";case"snowy":case"snowy-rainy":return"snow";case"fog":return"fog";case"windy":case"windy-variant":return"wind";default:return"cloud"}}var vi=[["Woning",["house","floorB","floor1","floor2","garage","door","window","grid"]],["Rolluiken",["shutter","shutterOpen","awning","garageOpen","garageClosed","arrowUp","arrowDown","stop"]],["Licht en stroom",["bulb","bulbGroup","switchOn","power","plug","bolt","battery"]],["Personen",["person","people","away"]],["Apparaten",["tv","speaker","camera","car","washer","dishwasher","printer","fan","airco","radio"]],["Afval",["bin","binWheeled","calendar"]],["Weer",["sun","cloud","cloudSun","rain","snow","fog","wind","drop","uv","sunrise","sunset","thermo"]],["Status",["shield","lock","lockOpen","key","wifi","smoke","warning","check","close","clock","gaugeArrow"]],["Overig",["star","moon","leaf","cog","dots","plus","minus","chevronRight","chevronDown","question"]]],xi=`
  :host { ${F} display: block; font-family: var(--dac-font); }
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

  .group + .group { margin-top: 12px; }
  .group h4 {
    margin: 0 0 6px; font-size: 10.5px; font-weight: 600; letter-spacing: .12em;
    text-transform: uppercase; color: var(--secondary-text-color, var(--dac-ink-3));
  }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 6px; }

  .opt {
    aspect-ratio: 1; display: grid; place-items: center; cursor: pointer;
    border-radius: 10px; border: 1px solid transparent; background: rgba(127,127,127,0.08);
    color: var(--primary-text-color, var(--dac-ink)); padding: 0;
    transition: border-color 160ms ease, background 160ms ease;
  }
  .opt:hover { background: rgba(127,127,127,0.16); }
  .opt[aria-pressed="true"] {
    border-color: var(--dac-accent-hi);
    background: color-mix(in srgb, var(--dac-accent-hi) 18%, transparent);
    color: var(--dac-accent-hi);
  }
  .opt .icon { width: 19px; height: 19px; }

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
`,dt=null,ht=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),dt=dt??[ie(xi)],this.shadowRoot.adoptedStyleSheets=dt,this.value_="",this.label="Icoon",this.fallback="question",this.auto=!0}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}connectedCallback(){this.built_||(this.built_=!0,this.build_())}build_(){this.shadowRoot.innerHTML=`
      <div class="label"></div>
      <div class="box">
        <button type="button" class="current" aria-expanded="false">
          <span class="preview"></span>
          <span class="who"><b></b><small></small></span>
          <span class="caret">${k.chevronDown}</span>
        </button>
        <div class="panel">
          ${vi.map(([t,n])=>`
            <div class="group">
              <h4>${t}</h4>
              <div class="grid">
                ${n.map(s=>`<button type="button" class="opt" data-icon="${s}" title="${s}" aria-pressed="false">${k[s]??""}</button>`).join("")}
              </div>
            </div>`).join("")}
          <div class="mdi">
            <label for="mdi">Of Home Assistant-icoon</label>
            <input id="mdi" type="text" placeholder="mdi:washing-machine" spellcheck="false" />
            <button type="button" class="clear">Wissen</button>
          </div>
        </div>
      </div>`,this.$(".current").addEventListener("click",()=>{let t=this.toggleAttribute("open");this.$(".current").setAttribute("aria-expanded",String(t))}),this.shadowRoot.querySelectorAll(".opt").forEach(t=>t.addEventListener("click",()=>this.emit_(t.dataset.icon)));let e=this.$("#mdi");e.addEventListener("change",()=>this.emit_(e.value.trim())),this.$(".clear").addEventListener("click",()=>this.emit_("")),this.paint_()}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Icoon";let e=this.value_,t=e||this.fallback||"question";this.$(".preview").innerHTML=M(t,this.fallback),this.$(".who b").textContent=e||(this.auto?"Automatisch":"Kies een icoon"),this.$(".who small").textContent=e?e.includes(":")?"Home Assistant-icoon":"DomotiApp-icoon":this.auto?"Past zich aan de entiteit aan":"Nog niets gekozen",this.shadowRoot.querySelectorAll(".opt").forEach(r=>r.setAttribute("aria-pressed",String(r.dataset.icon===e)));let n=this.$("#mdi");if(this.shadowRoot.activeElement===n)return;let s=e&&e.includes(":")?e:"";n.value!==s&&(n.value=s)}emit_(e){this.value_=e,this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};I("dac-icon-picker",ht);var yi=["accent","solar","house","water","magenta","pink","teal","lit","neutral"],wi=["good","warn","bad"],ki=/^(#[0-9a-f]{3,8}|var\(--[\w-]+\)|rgba?\([^)]*\))$/i,$i=`
  :host { ${F} display: block; font-family: var(--dac-font); }
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
`,pt=null,ut=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),pt=pt??[ie($i)],this.shadowRoot.adoptedStyleSheets=pt,this.value_="",this.label="Kleur",this.statuses=!1}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}set compact(e){this.toggleAttribute("compact",!!e)}get compact(){return this.hasAttribute("compact")}connectedCallback(){this.built_||(this.built_=!0,this.build_())}eigen_(){return!!this.value_&&!(this.value_ in K)}swatch(e){return`<button type="button" class="sw" data-tone="${e}" style="--c:${K[e]}"
      title="${De[e]}" aria-label="${De[e]}" aria-pressed="false">${k.check}</button>`}build_(){this.shadowRoot.innerHTML=`
      <div class="label"></div>
      <div class="box">
        ${this.statuses?"<h4>Identiteit</h4>":""}
        <div class="row">
          <button type="button" class="sw auto" data-tone="" title="Automatisch"
            aria-label="Automatisch" aria-pressed="false">${k.check}</button>
          ${yi.map(n=>this.swatch(n)).join("")}
          <span class="sw eigen leeg" title="Eigen kleur" aria-pressed="false">
            ${k.check}
            <input type="color" aria-label="Eigen kleur kiezen" />
          </span>
        </div>
        ${this.statuses?`<h4>Status</h4>
               <div class="row">${wi.map(n=>this.swatch(n)).join("")}</div>
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
      </div>`,this.shadowRoot.querySelectorAll("button.sw").forEach(n=>n.addEventListener("click",()=>this.emit_(n.dataset.tone)));let e=this.$('input[type="color"]');e.addEventListener("input",()=>this.emit_(e.value));let t=this.$("#vrij");t.addEventListener("change",()=>{let n=t.value.trim();if(!n){this.emit_("");return}let s=ki.test(n);t.setAttribute("aria-invalid",String(!s)),s&&this.emit_(n)}),this.$(".wissen").addEventListener("click",()=>this.emit_("")),this.paint_()}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Kleur";let e=this.eigen_();this.shadowRoot.querySelectorAll("button.sw").forEach(s=>s.setAttribute("aria-pressed",String((s.dataset.tone||"")===this.value_)));let t=this.$(".eigen");t.setAttribute("aria-pressed",String(e)),t.classList.toggle("leeg",!e),t.style.setProperty("--c",e?this.value_:"transparent"),t.title=e?`Eigen kleur: ${this.value_}`:"Eigen kleur",e&&/^#[0-9a-f]{6}$/i.test(this.value_)&&(this.$('input[type="color"]').value=this.value_);let n=this.$("#vrij");if(this.shadowRoot.activeElement!==n){let s=e?this.value_:"";n.value!==s&&(n.value=s),n.setAttribute("aria-invalid","false")}this.$(".chosen").innerHTML=this.value_?e?`Gekozen: <b>${this.value_}</b> &mdash; eigen kleur.`:`Gekozen: <b>${De[this.value_]??this.value_}</b>`:"Gekozen: <b>Automatisch</b> &mdash; de kaart kiest op domein en toestand."}emit_(e){this.value_=e??"",this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.value_},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};I("dac-tone-picker",ut);var f={entity:i=>({entity:i?{domain:i}:{}}),text:()=>({text:{}}),multiline:()=>({text:{multiline:!0}}),bool:()=>({boolean:{}}),number:(i,e,t=1)=>({number:{min:i,max:e,step:t,mode:"box"}}),select:i=>({select:{mode:"dropdown",options:i}}),action:(i="more-info")=>({ui_action:{default_action:i}})},mt=(...i)=>({type:"grid",name:"",schema:i});var C=class extends HTMLElement{constructor(){super(),this.config_={},this.built_=!1}setConfig(e){this.config_={...this.defaults(),...e},this.render_()}defaults(){return{}}set hass(e){this.hass_=e,this.form_&&(this.form_.hass=e);for(let t of this.pickers_??[])t.hass=e;this.render_()}get hass(){return this.hass_}connectedCallback(){this.render_()}schema(){return[]}pickers(){return[]}label(e){return gt[e.name]??e.name}helper(){}async render_(){if(!this.hass_||!this.config_)return;if(this.built_){this.sync_();return}this.built_=!0,await customElements.whenDefined("ha-form"),this.replaceChildren(),this.pickers_=[];let e=this.pickers();this.pickerSig_=e.map(a=>a.key).join("|");let t=a=>{let o=document.createElement("div");return o.style.cssText=`display:flex;flex-direction:column;gap:12px;${a}`,o},n=t("margin-bottom:16px"),s=t("margin-top:16px");for(let a of e){let o=document.createElement(a.kind==="tone"?"dac-tone-picker":"dac-icon-picker");o.label=a.label,o.fallback=a.fallback,a.auto===!1&&(o.auto=!1),a.statuses===!1&&(o.statuses=!1),a.compact&&(o.compact=!0),o.hass=this.hass_,o.value=this.config_[a.key],o.addEventListener("value-changed",c=>{c.stopPropagation(),this.patch_({[a.key]:c.detail.value})}),this.pickers_.push(o),o.dataset.key=a.key,(a.after?s:n).appendChild(o)}n.children.length&&this.appendChild(n);let r=document.createElement("ha-form");r.hass=this.hass_,r.data=this.config_,r.schema=this.schema(),r.computeLabel=a=>this.label(a),r.computeHelper=a=>this.helper(a),r.addEventListener("value-changed",a=>{a.stopPropagation(),this.patch_(a.detail.value,!0)}),this.form_=r,this.appendChild(r),s.children.length&&this.appendChild(s)}sync_(){let e=this.pickers().map(t=>t.key).join("|");if(this.pickerSig_!==void 0&&this.pickerSig_!==e){this.built_=!1,this.form_=null,this.render_();return}this.form_&&(this.form_.hass=this.hass_,this.form_.schema=this.schema(),this.form_.data=this.config_);for(let t of this.pickers_??[])t.hass=this.hass_,t.value=this.config_[t.dataset.key]}patch_(e,t=!1){let n=t?{...e}:{...this.config_,...e};this.config_.type&&(n.type=this.config_.type);for(let[s,r]of Object.entries(n))(r===""||r===void 0||r===null)&&delete n[s];this.config_=n,this.sync_(),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.serialize(n)},bubbles:!0,composed:!0}))}serialize(e){return e}},gt={entity:"Entiteit",entities:"Entiteiten",name:"Naam",icon:"Icoon",tone:"Kleur",secondary:"Tweede regel",layout:"Vorm",tap_action:"Tikken",hold_action:"Vasthouden",double_tap_action:"Dubbeltikken",show_state:"Status tonen",show_name:"Naam tonen",show_icon:"Icoon tonen",fill:"Vullen",collapsible:"Inklapbaar",title:"Titel",subtitle:"Ondertitel",weather:"Weerentiteit",sun:"Zon-entiteit",person:"Persoon",persons:"Personen",covers:"Rolluiken",lights:"Lampen",sensors:"Sensoren",greeting:"Begroeting",show_clock:"Klok tonen",show_weather:"Weer tonen",show_chips:"Weerdetails tonen",compact:"Compact",columns:"Kolommen",group:"Groepsregel tonen",invert:"Open en dicht omdraaien",label:"Label",color:"Kleur",date_format:"Datumnotatie"};function Ei(i=new Date){let e=i.getHours();return e<6?"Goedenacht":e<12?"Goedemorgen":e<18?"Goedemiddag":"Goedenavond"}var Si=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],Mi=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],ft={humidity:{icon:"drop",tone:"water",label:"Luchtvochtigheid"},wind:{icon:"wind",tone:"neutral",label:"Wind"},uv:{icon:"uv",tone:"solar",label:"UV-index"},precipitation:{icon:"rain",tone:"water",label:"Neerslag"},pressure:{icon:"gaugeArrow",tone:"neutral",label:"Luchtdruk"},sunrise:{icon:"sunrise",tone:"warn",label:"Zonsopkomst"},sunset:{icon:"sunset",tone:"warn",label:"Zonsondergang"}},Ai=["humidity","wind","uv","precipitation","sunset"],zi=i=>i==null||Number.isNaN(+i)?"":["N","NO","O","ZO","Z","ZW","W","NW"][Math.round(+i/45)%8],Ie=class extends S{validate(e){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768,...e}}watched(){let e=this.config;return[e.weather,e.weather_uv,e.sun,e.precipitation_entity].filter(Boolean)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.show_rule===!1&&this.setAttribute("no-rule",""),`
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
      </div>`}wire(){let e=()=>{let n=6e4-Date.now()%6e4+50;this.timer_=setTimeout(()=>{this.paintClock_(),e()},n)};e(),this.teardown_.push(()=>clearTimeout(this.timer_));let t=Number(this.config.hide_below)||0;if(t>0){let n=matchMedia(`(max-width: ${t-1}px)`),s=()=>this.toggleAttribute("narrow",n.matches);s(),n.addEventListener("change",s),this.teardown_.push(()=>n.removeEventListener("change",s))}}paintClock_(){let e=new Date,t=this.config.name??this.hass?.user?.name??"",n=Ei(e);this.$(".hello").innerHTML=t?`${n}, <b>${t}</b>`:n,this.text(".date",`${Si[e.getDay()]} ${e.getDate()} ${Mi[e.getMonth()]}`);let s=this.$(".clock");s&&this.text(s,e.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"}))}paint(){this.paintClock_();let e=this.config,t=b(this.hass,e.weather),n=z(this.hass,e.weather),s=this.$(".now");if(s&&t){let c=gn(t.state);s.style.setProperty("--wtone",O(e.tone,"water"));let l=this.hass?.config?.unit_system?.temperature??"\xB0C";this.$(".temp").innerHTML=n.temperature!=null?`${H(this.hass,n.temperature,0)}<span>${l}</span>`:"--";let p=s.querySelector(".ic");p.dataset.icon!==c&&(p.dataset.icon=c,p.innerHTML=M(c,"cloud")),this.text(s.querySelector(".cond"),U(this.hass,t))}let r=this.$(".chips");if(!r)return;let a=Ai.map(c=>this.chip_(c,n)).filter(Boolean),o=a.map(c=>`${c.key}${c.value}`).join("|");r.dataset.sig!==o&&(r.dataset.sig=o,r.innerHTML=a.map(c=>`<span class="chip2" style="--tone:${O(ft[c.key].tone)}" title="${ft[c.key].label}">
             ${k[ft[c.key].icon]??""}${c.value}
           </span>`).join(""))}chip_(e,t){let n=this.config;switch(e){case"humidity":return t.humidity!=null?{key:e,value:`${Math.round(t.humidity)}%`}:null;case"wind":{if(t.wind_speed==null)return null;let s=this.hass?.config?.unit_system?.wind_speed??"km/h",r=zi(t.wind_bearing);return{key:e,value:`${H(this.hass,t.wind_speed,0)} ${s}${r?` ${r}`:""}`}}case"uv":{let r=z(this.hass,n.weather_uv).uv_index??t.uv_index??(n.weather_uv?Number(b(this.hass,n.weather_uv)?.state):null);return r!=null&&!Number.isNaN(+r)?{key:e,value:`UV ${H(this.hass,r,1)}`}:null}case"precipitation":{let s=b(this.hass,n.precipitation_entity);if(s){let r=Number(s.state);if(Number.isNaN(r))return null;let a=s.attributes.unit_of_measurement??"mm";return{key:e,value:`${H(this.hass,r,1)} ${a}`}}return t.precipitation!=null&&!Number.isNaN(+t.precipitation)?{key:e,value:`${H(this.hass,t.precipitation,1)} mm`}:null}case"pressure":return t.pressure!=null?{key:e,value:`${H(this.hass,t.pressure,0)} ${t.pressure_unit??"hPa"}`}:null;case"sunset":case"sunrise":{let r=b(this.hass,n.sun)?.attributes?.[e==="sunset"?"next_setting":"next_rising"];if(!r)return null;let a=new Date(r);return Number.isNaN(+a)?null:{key:e,value:a.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"})}}default:return null}}getCardSize(){return 2}getGridOptions(){return{columns:"full",rows:2,min_rows:2,max_rows:2}}static getConfigElement(){return document.createElement("domotiapp-header-card-editor")}static getStubConfig(e){return{weather:Object.keys(e?.states??{}).find(n=>n.startsWith("weather.")),sun:"sun.sun"}}};v(Ie,"css",`
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
    :host([bare]) .strip { background: none; border: 0; box-shadow: none; padding: 6px 2px; }

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
  `);var bt=class extends C{defaults(){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768}}pickers(){return[{key:"tone",kind:"tone",label:"Kleur weericoon"}]}schema(){return[mt({name:"weather",selector:f.entity("weather")},{name:"weather_uv",selector:{entity:{domain:["weather","sensor"]}}}),mt({name:"sun",selector:f.entity("sun")},{name:"precipitation_entity",selector:f.entity("sensor")}),{name:"name",selector:f.text()},{name:"hide_below",selector:f.number(0,1400,8)}]}label(e){return{weather:"Weer (temperatuur, wind)",weather_uv:"Tweede weerbron (UV-index)",precipitation_entity:"Neerslagsensor",show_rule:"Accentlijn tonen",hide_below:"Verbergen onder breedte (px)",bare:"Zonder kaartrand",name:"Naam"}[e.name]??super.label(e)}helper(e){if(e.name==="weather_uv")return"Alleen voor de UV-index. Handig als je hoofdbron die niet meelevert.";if(e.name==="precipitation_entity")return"Een sensor in mm of mm/h, bijvoorbeeld neerslagintensiteit of regen laatste uur.";if(e.name==="hide_below")return"768 verbergt de header op telefoons en houdt hem op tablets en desktops. 0 zet het uit.";if(e.name==="name")return"Leeg laten voor de naam van de ingelogde gebruiker."}};L("domotiapp-header-card-editor",bt);N("domotiapp-header-card",Ie,{name:"DomotiApp Header",description:"Smalle strip met begroeting, weer en klok. Verbergt zichzelf op telefoons."});var Pe=class extends S{validate(e){return{icon:"",tone:"accent",line:!0,...e}}watched(){return this.config.secondary_entity?[this.config.secondary_entity]:[]}template(){let e=this.config,t=e.icon!==null&&e.icon!==!1;return t||this.setAttribute("no-icon",""),`
      <div class="sep" style="--tone:${O(e.tone)}">
        ${t?`<span class="chip">${M(e.icon,"star")}</span>`:""}
        <h3></h3>
        ${e.line===!1?"":'<span class="rule"></span>'}
        <span class="sub"><span class="si"></span><span class="sv"></span></span>
      </div>`}paint(){this.text("h3",this.config.name??"");let e=this.$(".sub");if(!e)return;let t=b(this.hass,this.config.secondary_entity),n=e.querySelector(".si"),s=e.querySelector(".sv");if(!t){s.textContent="",n.innerHTML="";return}let r=this.config.secondary_icon??"";n.dataset.icon!==r&&(n.dataset.icon=r,n.innerHTML=r?M(r):"");let a=t.attributes.unit_of_measurement;s.textContent=a?`${t.state} ${a}`:t.attributes.current_temperature!=null?`${t.attributes.current_temperature} \xB0C`:U(this.hass,t)}getCardSize(){return 1}getGridOptions(){return{columns:"full",rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-separator-card-editor")}static getStubConfig(){return{name:"Nieuwe sectie",icon:"house",tone:"accent"}}};v(Pe,"css",`
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
  `);var _t=class extends C{defaults(){return{line:!0,tone:"accent"}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon links",fallback:"star",auto:!1},{key:"tone",kind:"tone",label:gt.tone},{key:"secondary_icon",kind:"icon",label:"Icoon bij de waarde rechts",auto:!1}]}schema(){return[{name:"name",selector:f.text()},{name:"line",selector:f.bool()},{name:"secondary_entity",selector:f.entity()}]}label(e){return{line:"Lijn tonen",secondary_entity:"Waarde rechts (optioneel)"}[e.name]??super.label(e)}helper(e){if(e.name==="secondary_entity")return"Toont de status van deze entiteit rechts van de lijn, bijvoorbeeld een temperatuur of een aantal."}};L("domotiapp-separator-card-editor",_t);N("domotiapp-separator-card",Pe,{name:"DomotiApp Separator",description:"Sectiekop met icoon en vervagende lijn."});var Re=class extends S{validate(e){return{layout:"row",show_state:!0,show_name:!0,show_icon:!0,...e}}watched(){return[this.config.entity].filter(Boolean)}tone_(){let e=this.config;return e.tone?O(e.tone):R(e.entity)!=="light"?K.accent:Ce(b(this.hass,e.entity))??K.lit}template(){let e=this.config;return this.setAttribute("layout",["row","tile","compact"].includes(e.layout)?e.layout:"row"),`
      <div class="btn surface" role="button" tabindex="0" style="--tone:${this.tone_()}">
        <span class="wash"></span>
        ${e.show_icon===!1?"":'<span class="chip" role="button" tabindex="0"></span>'}
        <span class="txt">
          ${e.show_name===!1?"":'<span class="nm"></span>'}
          ${e.show_state===!1?"":'<span class="st"></span>'}
        </span>
      </div>`}wire(){let e=this.config,t=(s,r)=>Le(this,this.hass,e,e[s]??r);this.teardown_.push(D(this.$(".btn"),{onTap:()=>t("tap_action",{action:e.entity?"more-info":"none"}),onHold:()=>t("hold_action",{action:e.entity?"more-info":"none"}),onDouble:e.double_tap_action?()=>t("double_tap_action",{action:"none"}):void 0}));let n=this.$(".chip");n&&(this.teardown_.push(D(n,{onTap:s=>t("icon_tap_action",Oe(e.entity)),onHold:()=>t("icon_hold_action",{action:e.entity?"more-info":"none"})})),this.on(n,"click",s=>s.stopPropagation()),this.on(n,"pointerdown",s=>s.stopPropagation()))}paint(){let e=this.config,t=b(this.hass,e.entity),n=Te(t),s=!!e.entity&&B(t);this.toggleAttribute("on",n),this.$(".btn").classList.toggle("unavailable",s),this.$(".btn").style.setProperty("--tone",this.tone_());let r=this.$(".chip");if(r){let o=Ne(this.hass,e.entity,e.icon),c=o?`pic:${o}`:e.icon||ue(e.entity,z(this.hass,e.entity));r.dataset.icon!==c&&(r.dataset.icon=c,r.classList.toggle("pic",!!o),r.innerHTML=o?`<img src="${o}" alt="" loading="lazy" />`:M(c)),r.style.setProperty("--tone",n&&!o?this.tone_():"var(--dac-ink-3)"),r.setAttribute("aria-label",e.entity?`${T(this.hass,e.entity,e.name)} schakelen`:"Icoon")}this.text(".nm",T(this.hass,e.entity,e.name));let a=this.$(".st");a&&this.text(a,this.secondary_(t,s)),this.$(".btn").setAttribute("aria-label",`${T(this.hass,e.entity,e.name)}${t?`, ${U(this.hass,t)}`:""}`)}secondary_(e,t){return t?"Niet bereikbaar":!e||he(e.entity_id)?"":R(e.entity_id)==="light"&&e.state==="on"&&e.attributes.brightness!=null?`${Math.round(e.attributes.brightness/255*100)}%`:U(this.hass,e)}getCardSize(){return this.config?.layout==="tile"?2:1}getGridOptions(){return this.config?.layout==="tile"?{columns:6,rows:2,min_columns:3,min_rows:2,max_rows:2}:{columns:12,rows:1,min_columns:4,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-button-card-editor")}static getStubConfig(e,t){return{entity:t?.find(s=>s.startsWith("light."))??t?.find(s=>s.startsWith("switch."))??t?.[0],layout:"row"}}};v(Re,"css",`
    :host { display: block; height: 100%; }

    /* Achtergrond, rand, ronding en schaduw komen van .surface in theme.js,
       niet uit dit bestand. Ze stonden hier wel, met --dac-radius-sm in plaats
       van --dac-radius, en dat is precies hoe je het ziet op een dashboard:
       een rolluikkaart met ronde hoeken en een knop eronder met scherpere. E\xE9n
       kaart die zijn eigen vorm nabouwt, loopt vroeg of laat uit de pas. */
    .btn {
      position: relative; overflow: hidden;
      width: 100%; height: 100%; padding: 0; margin: 0;
      font: inherit; color: inherit; text-align: left; cursor: pointer;
      display: flex; align-items: center; gap: 12px;
      transition: border-color 220ms ease, background 220ms ease, transform 220ms ease;
      touch-action: manipulation;
    }
    .btn:hover { border-color: var(--dac-border-hi); background: var(--dac-surface-hi); }
    .btn:active { transform: scale(.985); }

    /* Alleen het icoon draagt de toestand. Zie de kop. */
    .chip {
      cursor: pointer;
      transition: color 220ms ease, background 220ms ease,
                  border-color 220ms ease, box-shadow 220ms ease;
    }
    :host([on]) .chip {
      box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
    }
    .chip .icon, .chip ha-icon { display: block; --mdc-icon-size: 20px; }

    /* Onder elkaar, niet achter elkaar. Dit waren inline-spans in een gewone
       blokcontainer, en dan lopen naam en toestand op \xE9\xE9n regel door -- wat
       precies het verschil was met de licht-, klimaat- en entiteitenkaart. */
    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 11.5px; line-height: 1.25; color: var(--dac-ink-2);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      font-variant-numeric: tabular-nums;
    }

    /* ---- row: the default. A pill you can put six of in a column. ---- */
    :host([layout="row"]) .btn { min-height: 56px; padding: 7px 12px; gap: 11px; }
    :host([layout="row"]) .chip { width: 40px; height: 40px; }
    :host([layout="row"]) .chip .icon, :host([layout="row"]) .chip ha-icon { width: 20px; height: 20px; }

    /* ---- tile: icon over label, for a grid of rooms or scenes. ---- */
    :host([layout="tile"]) .btn {
      flex-direction: column; align-items: flex-start; justify-content: space-between;
      gap: 0; padding: 14px; min-height: 96px;
    }
    :host([layout="tile"]) .chip { width: 40px; height: 40px; }
    :host([layout="tile"]) .chip .icon, :host([layout="tile"]) .chip ha-icon { width: 21px; height: 21px; }
    :host([layout="tile"]) .txt { flex: 0 0 auto; margin-top: 12px; width: 100%; }
    :host([layout="tile"]) .nm { font-size: 14px; }

    /* ---- compact: icon and name, nothing else. For a dense favourites row. ---- */
    :host([layout="compact"]) .btn {
      min-height: 44px; padding: 6px 14px 6px 6px; border-radius: var(--dac-radius-pill);
    }
    :host([layout="compact"]) .chip { width: 32px; height: 32px; border-radius: var(--dac-radius-pill); }
    :host([layout="compact"]) .chip .icon, :host([layout="compact"]) .chip ha-icon { width: 17px; height: 17px; }
    :host([layout="compact"]) .nm { font-size: 13px; }

    /* Een vleug identiteitskleur op een tegel, zodat je hem van een afstand
       herkent voordat de tekst leesbaar is. Alleen op de tegelvorm: in een rij
       zou het net het oplichten worden dat er juist uit moest. */
    .wash {
      position: absolute; top: -70px; right: -60px; width: 190px; height: 190px;
      border-radius: 50%; pointer-events: none; opacity: 0;
      background: radial-gradient(circle, var(--tone) 0%, transparent 70%);
      transition: opacity 260ms ease;
    }
    :host([layout="tile"]) .wash { opacity: .10; }
    :host([layout="tile"][on]) .wash { opacity: .2; }

  `);var vt=class extends C{defaults(){return{layout:"row",show_state:!0,show_name:!0,show_icon:!0,icon_tap_action:{action:"toggle"},tap_action:{action:"more-info"}}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"star"},{key:"tone",kind:"tone",label:"Kleur"}]}schema(){return[{name:"entity",selector:f.entity()},{name:"name",selector:f.text()},{name:"layout",selector:f.select([{value:"row",label:"Rij"},{value:"tile",label:"Tegel"},{value:"compact",label:"Compact"}])},{name:"show_icon",selector:f.bool()},{name:"show_name",selector:f.bool()},{name:"show_state",selector:f.bool()},{name:"icon_tap_action",selector:f.action("toggle")},{name:"icon_hold_action",selector:f.action("more-info")},{name:"tap_action",selector:f.action("more-info")},{name:"hold_action",selector:f.action("more-info")},{name:"double_tap_action",selector:f.action("none")}]}label(e){return{entity:"Entiteit",name:"Naam (overschrijft die van de entiteit)",layout:"Vorm",show_icon:"Icoon tonen",show_name:"Naam tonen",show_state:"Status tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart",double_tap_action:"Dubbeltikken op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Mag leeg blijven: zonder entiteit wordt dit een navigatieknop.";if(e.name==="icon_tap_action")return"Handig: het icoon schakelt de lichtgroep, de kaart navigeert naar de ruimte.";if(e.name==="tap_action")return"Wat er gebeurt als je naast het icoon tikt, bijvoorbeeld navigeren naar een pop-up."}};L("domotiapp-button-card-editor",vt);N("domotiapp-button-card",Re,{name:"DomotiApp Knop",description:"E\xE9n control als rij, tegel of compacte pil. Vervangt tile, mushroom-entity en bubble-knoppen."});var xt=(i,e,t)=>Math.min(t,Math.max(e,i));function He(i,e){let t=e.min??0,n=e.max??100,s=e.step??1,r=!1,a=u=>{let y=i.getBoundingClientRect();if(!y.width)return t;let w=xt((u-y.left)/y.width,0,1),A=t+w*(n-t);return xt(Math.round(A/s)*s,t,n)},o=u=>{try{i.setPointerCapture?.(u)}catch{}},c=u=>{try{i.hasPointerCapture?.(u)&&i.releasePointerCapture(u)}catch{}},l=u=>{e.disabled?.()||u.button!=null&&u.button!==0||(r=!0,o(u.pointerId),i.classList.add("dragging"),e.onInput(a(u.clientX)),u.preventDefault())},p=u=>{r&&(e.onInput(a(u.clientX)),u.preventDefault())},h=u=>{r&&(r=!1,c(u.pointerId),i.classList.remove("dragging"),e.onCommit(a(u.clientX)))},m=u=>{r&&(r=!1,c(u?.pointerId),i.classList.remove("dragging"),e.onInput(e.value()))},_=u=>{if(e.disabled?.())return;let y=(n-t)/10,w={ArrowLeft:-s,ArrowDown:-s,ArrowRight:s,ArrowUp:s,PageDown:-y,PageUp:y,Home:-1/0,End:1/0};if(!(u.key in w))return;u.preventDefault();let A=e.value(),Y=xt(w[u.key]===-1/0?t:w[u.key]===1/0?n:A+w[u.key],t,n);e.onInput(Y),e.onCommit(Y)};return i.addEventListener("pointerdown",l),i.addEventListener("pointermove",p),i.addEventListener("pointerup",h),i.addEventListener("pointercancel",m),i.addEventListener("keydown",_),()=>{i.removeEventListener("pointerdown",l),i.removeEventListener("pointermove",p),i.removeEventListener("pointerup",h),i.removeEventListener("pointercancel",m),i.removeEventListener("keydown",_)}}var se=(i="")=>`
  <div class="slider ${i}" role="slider" tabindex="0"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div class="track"><div class="fill"></div></div>
    <div class="thumb"></div>
  </div>`,Ke=`
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
`;var Ni=new Set(["brightness","color_temp","hs","rgb","rgbw","rgbww","xy","white"]),Ci=new Set(["hs","rgb","rgbw","rgbww","xy"]),wt=i=>i?.attributes?.supported_color_modes??[],Ti=i=>wt(i).some(e=>Ni.has(e)),Ue=i=>wt(i).some(e=>Ci.has(e)),Ve=i=>wt(i).includes("color_temp"),fn=i=>Math.max(1,Math.round((i??0)/255*100)),Be=class extends S{validate(e){let t=e.entity??e.lights?.[0]??e.entities?.[0],n=typeof t=="string"?t:t?.entity;return n?{show_colour:!0,...e,entity:n}:{...e,[j]:"Kies een lamp."}}watched(){return[this.config.entity]}template(){return this.config.bare&&this.setAttribute("bare",""),`
      <div class="card surface">
        <div class="lamp" data-on="false" style="--tone:var(--dac-lit)">
          <button class="chip" type="button" aria-label="Aan of uit"></button>
          <span class="txt"><span class="nm"></span><span class="v tnum"></span></span>
          <span class="ctl" style="display:contents"></span>
        </div>
        <div class="colour" hidden></div>
      </div>`}wire(){let e=this.config.entity;this.teardown_.push(D(this.$(".chip"),{onTap:()=>this.hass.callService("light","toggle",{entity_id:e}),onHold:()=>W(this,e)})),this.on(this.$(".card"),"click",t=>{t.target.closest(".toggle")&&this.hass.callService("light","toggle",{entity_id:e})}),this.sliders_=new Map}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let s=He(e,n);this.sliders_.set(t,s),this.teardown_.push(s)}setSlider_(e,t,n=0,s=100){if(!e)return;let r=s>n?(t-n)/(s-n)*100:0;e.style.setProperty("--v",`${r}%`),e.setAttribute("aria-valuemin",String(n)),e.setAttribute("aria-valuemax",String(s)),e.setAttribute("aria-valuenow",String(t))}paint(){let e=this.config,t=b(this.hass,e.entity),n=B(t),s=t?.state==="on",r=this.$(".lamp");r.dataset.on=String(s),r.classList.toggle("unavailable",n);let a=this.$(".chip"),o=e.icon||"bulb";a.dataset.icon!==o&&(a.dataset.icon=o,a.innerHTML=M(o,"bulb")),this.text(".nm",T(this.hass,e.entity,e.name));let c=s?t?.attributes?.rgb_color:null;r.style.setProperty("--tone",c?`rgb(${c[0]},${c[1]},${c[2]})`:"var(--dac-lit)");let l=this.$(".ctl"),p=n?"none":Ti(t)?"range":"toggle";if(l.dataset.kind!==p&&(l.dataset.kind=p,l.innerHTML=p==="range"?se("brightness"):p==="toggle"?'<button class="toggle" type="button" role="switch" aria-checked="false" aria-label="Aan of uit"></button>':"",this.sliders_.delete("brightness")),p==="range"){let h=l.querySelector(".slider");if(this.attach_(h,"brightness",{value:()=>t?.state==="on"?fn(b(this.hass,e.entity)?.attributes?.brightness):0,onInput:m=>{this.setSlider_(h,m),this.text(".v",m===0?"Uit":`${m}%`)},onCommit:m=>{m===0?this.hass.callService("light","turn_off",{entity_id:e.entity}):this.hass.callService("light","turn_on",{entity_id:e.entity,brightness_pct:m})},disabled:()=>B(b(this.hass,e.entity))}),!h.classList.contains("dragging")){let m=s?fn(t.attributes.brightness):0;this.setSlider_(h,m),this.text(".v",s?`${m}%`:"Uit")}}else p==="toggle"?(l.querySelector(".toggle")?.setAttribute("aria-checked",String(s)),this.text(".v",s?"Aan":"Uit")):this.text(".v","Niet bereikbaar");this.paintColour_(t,s)}paintColour_(e,t){let n=this.$(".colour"),s=this.config.show_colour!==!1&&(Ue(e)||Ve(e));if(n.hidden=!(s&&t),!s)return;let r=`${Ue(e)?"c":""}${Ve(e)?"t":""}`;if(n.dataset.sig!==r){n.dataset.sig=r,n.innerHTML=(Ue(e)?`<span data-kind="hue" style="display:contents">${se("hue")}</span>`:"")+(Ve(e)?`<span data-kind="kelvin" style="display:contents">${se("kelvin")}</span>`:"");let l=n.querySelector(".slider.hue");l&&(l.dataset.strip="",l.style.setProperty("--strip","linear-gradient(90deg, hsl(0 90% 55%), hsl(60 90% 55%), hsl(120 90% 55%), hsl(180 90% 55%), hsl(240 90% 55%), hsl(300 90% 55%), hsl(360 90% 55%))"),l.setAttribute("aria-label","Kleur"));let p=n.querySelector(".slider.kelvin");p&&(p.dataset.strip="",p.style.setProperty("--strip","linear-gradient(90deg,#ffb15e,#ffd6a8,#fff5e8,#eaf1ff,#cbdcff)"),p.setAttribute("aria-label","Kleurtemperatuur")),this.sliders_.delete("hue"),this.sliders_.delete("kelvin")}if(!t)return;let a=this.config.entity,o=n.querySelector(".slider.hue");o&&(this.attach_(o,"hue",{min:0,max:360,value:()=>b(this.hass,a)?.attributes?.hs_color?.[0]??0,onInput:l=>this.setSlider_(o,l,0,360),onCommit:l=>{let p=b(this.hass,a)?.attributes?.hs_color?.[1]??100;this.hass.callService("light","turn_on",{entity_id:a,hs_color:[l,p]})}}),o.classList.contains("dragging")||this.setSlider_(o,Math.round(e.attributes.hs_color?.[0]??0),0,360));let c=n.querySelector(".slider.kelvin");if(c){let l=e.attributes.min_color_temp_kelvin??2e3,p=e.attributes.max_color_temp_kelvin??6500;if(this.attach_(c,"kelvin",{min:l,max:p,step:50,value:()=>b(this.hass,a)?.attributes?.color_temp_kelvin??l,onInput:h=>this.setSlider_(c,h,l,p),onCommit:h=>this.hass.callService("light","turn_on",{entity_id:a,color_temp_kelvin:h})}),!c.classList.contains("dragging")){let h=e.attributes.color_temp_kelvin;h!=null&&this.setSlider_(c,h,l,p)}}}getCardSize(){let e=b(this.hass,this.config?.entity);return e?.state==="on"&&(Ue(e)||Ve(e))?2:1}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:1}}static getConfigElement(){return document.createElement("domotiapp-light-card-editor")}static getStubConfig(e,t){let n=t?.find(s=>s.startsWith("light."));return n?{entity:n}:{}}};v(Be,"css",`
    :host { display: block; }

    .card {
      min-height: 56px; padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 7px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

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

    ${Ke}

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
  `);var yt=class extends C{defaults(){return{show_colour:!0}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"bulb"}]}schema(){return[{name:"entity",selector:f.entity("light")},{name:"name",selector:f.text()},{name:"show_colour",selector:f.bool()}]}label(e){return{entity:"Lamp",name:"Naam (overschrijft die van de lamp)",show_colour:"Kleurstrips tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"E\xE9n lamp per kaart. Dimbaar krijgt een schuif, alleen schakelbaar een tuimelaar.";if(e.name==="show_colour")return"Kleur en kleurtemperatuur verschijnen zodra de lamp aan is. De kaart is dan twee rijen hoog."}};L("domotiapp-light-card-editor",yt);N("domotiapp-light-card",Be,{name:"DomotiApp Verlichting",description:"E\xE9n lamp op \xE9\xE9n rasterrij: dimmen, kleur en kleurtemperatuur."});function bn(i){if(!i)return null;let e=Number(i.state);return Number.isFinite(e)?e:null}function Oi(i){let e=i?.attributes?.hvac_action;return e||(i?.state==="off"?"off":i?.state==="cool"?"cooling":i?.state==="heat"?"idle":null)}var kt={heating:"var(--dac-solar)",cooling:"var(--dac-grid-in)",drying:"var(--dac-grid-in)",fan:"var(--dac-grid-in)"},_n={heating:"Verwarmt",cooling:"Koelt",drying:"Ontvochtigt",fan:"Ventileert",idle:"Uit",off:"Uit"},We=class extends S{validate(e){return e.entity||e.temperature||e.humidity?{...e}:{...e,[j]:"Kies een thermostaat, of een temperatuursensor."}}watched(){let e=this.config;return[e.entity,e.temperature,e.humidity].filter(Boolean)}step_(){let e=z(this.hass,this.config.entity);return Number(this.config.step??e.target_temp_step)||.5}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.entity||this.setAttribute("readout",""),`
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
                 <button type="button" data-d="-1" aria-label="Lager">${k.minus}</button>
                 <span class="target tnum"></span>
                 <button type="button" data-d="1" aria-label="Hoger">${k.plus}</button>
               </div>`:""}
      </div>`}wire(){let e=this.config;this.teardown_.push(()=>clearTimeout(this.sendTimer_)),this.teardown_.push(D(this.$(".chip"),{onTap:()=>W(this,e.entity||e.temperature||e.humidity)}));let t=this.$(".set");t&&t.querySelectorAll("button").forEach(n=>this.on(n,"click",()=>this.nudge_(Number(n.dataset.d))))}nudge_(e){let t=this.config,n=z(this.hass,t.entity),s=this.step_(),r=Number(n.min_temp??5),a=Number(n.max_temp??35),o=this.pending_??Number(n.temperature);if(!Number.isFinite(o))return;let c=Math.min(a,Math.max(r,Math.round((o+e*s)/s)*s));this.pending_=c,this.paintTarget_(),clearTimeout(this.sendTimer_),this.sendTimer_=setTimeout(()=>{this.sendTimer_=null,this.hass.callService("climate","set_temperature",{entity_id:t.entity,temperature:this.pending_}),setTimeout(()=>{this.pending_=null,this.paint()},1500)},450)}paintTarget_(){let e=this.$(".target");if(!e)return;let t=z(this.hass,this.config.entity),n=this.pending_??Number(t.temperature);e.classList.toggle("pending",this.pending_!=null),e.textContent=Number.isFinite(n)?`${H(this.hass,n,n%1?1:0)}\xB0`:"--"}paint(){let e=this.config,t=e.entity?b(this.hass,e.entity):null,n=e.entity?B(t):!1;this.toggleAttribute("dead",n);let s=Oi(t),r=e.tone?O(e.tone):kt[s]??"var(--dac-ink-3)";this.$(".card").style.setProperty("--tone",r),this.toggleAttribute("busy",!!kt[s]);let a=this.$(".chip"),o=e.icon||"thermo";a.dataset.icon!==o&&(a.dataset.icon=o,a.innerHTML=M(o,"thermo")),a.style.setProperty("--tone",kt[s]?r:"var(--dac-ink-3)"),this.text(".nm",T(this.hass,e.entity||e.temperature||e.humidity,e.name));let c=e.temperature?bn(b(this.hass,e.temperature)):Number(z(this.hass,e.entity).current_temperature),l=this.hass?.config?.unit_system?.temperature??"\xB0C";this.text(".temp",Number.isFinite(c)?`${H(this.hass,c,1)} ${l}`:"--");let p=e.humidity?bn(b(this.hass,e.humidity)):null,h=this.$(".hum");h.innerHTML=p==null?"":`${k.drop}${H(this.hass,p,0)}%`,this.text(".sep",p==null?"":"\xB7"),e.entity&&!e.humidity&&_n[s]&&s!=="idle"&&(this.text(".sep","\xB7"),h.textContent=_n[s]),this.paintTarget_();let m=this.$(".set");if(m){let _=z(this.hass,e.entity),u=this.pending_??Number(_.temperature);m.querySelector('[data-d="-1"]').disabled=n||u<=Number(_.min_temp??5),m.querySelector('[data-d="1"]').disabled=n||u>=Number(_.max_temp??35)}}getCardSize(){return 1}getGridOptions(){return{columns:12,rows:1,min_columns:4,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-climate-card-editor")}static getStubConfig(e,t){let n=t?.find(s=>s.startsWith("climate."));return n?{entity:n}:{}}};v(We,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 7px 12px;
      display: flex; align-items: center; gap: 11px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

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
    .set button:hover { color: var(--dac-ink); background: rgba(255,255,255,.08); }
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
  `);var $t=class extends C{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"thermo"},{key:"tone",kind:"tone",label:"Vaste kleur (leeg = volgt de ketel)"}]}schema(){return[{name:"entity",selector:f.entity("climate")},{name:"temperature",selector:{entity:{domain:"sensor",device_class:"temperature"}}},{name:"humidity",selector:{entity:{domain:"sensor",device_class:"humidity"}}},{name:"name",selector:f.text()},{name:"step",selector:f.number(.1,5,.1)}]}label(e){return{entity:"Thermostaat (optioneel)",temperature:"Temperatuursensor (optioneel)",humidity:"Vochtigheidssensor (optioneel)",name:"Naam",step:"Stap van de knoppen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Leeg laten voor een kaart die alleen meet. Met thermostaat komen de stelknoppen erbij.";if(e.name==="temperature")return"Wint van de meting van de thermostaat zelf. Handig als er een betere sensor in de kamer hangt.";if(e.name==="step")return"Leeg laten volgt de thermostaat, en anders een halve graad."}};L("domotiapp-climate-card-editor",$t);N("domotiapp-climate-card",We,{name:"DomotiApp Klimaat",description:"Thermostaat, losse temperatuur- en vochtsensor, of allebei."});var vn=i=>Math.min(Math.max(1,Number(i)||2),3),xn=i=>typeof i=="string"?{entity:i}:{...i};function Ge(i){for(i.bewaard??=[];i.items.length<i.columns;)i.items.push(i.bewaard.pop()??{entity:""});for(;i.items.length>i.columns;){let e=i.items.pop();e.entity&&i.bewaard.push(e)}return i}function Li(i){let e=Array.isArray(i.rows)&&i.rows.length?i.rows.map(n=>({columns:vn(n.columns),items:(n.items??n.entities??[]).map(xn)})):(()=>{let n=(i.items??i.entities??[]).map(xn);return n.length?[{columns:vn(i.columns),items:n}]:[]})(),t=[];for(let n of e){let s=[];for(let r=0;r<n.items.length;r+=n.columns)s.push(n.items.slice(r,r+n.columns));s.length||s.push([]);for(let r of s)t.push(Ge({columns:n.columns,items:r}))}return t}var yn=i=>i.map(e=>({columns:e.columns,items:e.items.filter(t=>t.entity).map(t=>structuredClone(t))})).filter(e=>e.items.length),ji=`
  .dac-ed { display: flex; flex-direction: column; gap: 12px; }

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

  .dac-ed .kolommen {
    flex: 0 0 auto; display: inline-flex; gap: 2px; padding: 3px;
    background: rgba(127,127,127,.12); border-radius: 999px;
  }
  .dac-ed .kolommen button {
    min-width: 28px; height: 24px; padding: 0 7px; cursor: pointer;
    border: 0; background: transparent; border-radius: 999px;
    font: inherit; font-size: 12px; color: var(--secondary-text-color);
  }
  .dac-ed .kolommen button[aria-pressed="true"] {
    background: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600;
  }

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
`,Et=class extends HTMLElement{constructor(){super(),this.rows_=[],this.rest_={},this.open_=new Set,this.koppen_=[]}setConfig(e){if(this.rest_={...e},delete this.rest_.rows,delete this.rest_.items,delete this.rest_.entities,delete this.rest_.columns,this.gebouwd_&&e===this.uitObject_)return;let t=Li(e);this.gebouwd_&&JSON.stringify(yn(t))===this.uit_||(this.rows_=t,this.eersteKeer_||(this.eersteKeer_=!0,this.rows_.length===1&&this.open_.add("r0")),this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker, dac-tone-picker"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}connectedCallback(){this.gebouwd_||this.build_()}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}rijWeg_(e){let t=new Set;for(let n of this.open_){let s=/^r(\d+)(?:i(\d+))?$/.exec(n);if(!s)continue;let r=Number(s[1]);r!==e&&t.add(r>e?`r${r-1}${s[2]===void 0?"":`i${s[2]}`}`:n)}this.open_=t}itemWeg_(e,t){let n=new Set;for(let s of this.open_){let r=/^r(\d+)i(\d+)$/.exec(s);if(!r||Number(r[1])!==e){n.add(s);continue}let a=Number(r[2]);a!==t&&n.add(a>t?`r${e}i${a-1}`:s)}this.open_=n}legePlekkenOpen_(e,t){e.items.forEach((n,s)=>{n.entity||this.open_.add(`r${t}i${s}`)})}async build_(){if(!this.hass_||!this.rows_)return;await customElements.whenDefined("ha-form"),this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=ji;let t=document.createElement("div");if(t.className="dac-ed",this.append(e,t),this.rows_.forEach((s,r)=>t.appendChild(this.rijBlok_(s,r))),!this.rows_.length){let s=document.createElement("p");s.className="uitleg",s.textContent="Een rij is \xE9\xE9n regel op de kaart, met \xE9\xE9n, twee of drie entiteiten naast elkaar. Elke rij heeft zijn eigen indeling.",t.appendChild(s)}let n=document.createElement("button");n.type="button",n.className="rijtoevoegen",n.textContent="\uFF0B  Rij toevoegen",n.addEventListener("click",()=>{let s=Ge({columns:2,items:[]});this.rows_.push(s);let r=this.rows_.length-1;this.open_.add(`r${r}`),this.legePlekkenOpen_(s,r),this.emit_(),this.build_()}),t.appendChild(n)}binnenKop_(e,t){return e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),t(n)}),e}rijBlok_(e,t){let n=document.createElement("details");n.className="rij",this.onthoud_(n,`r${t}`);let s=document.createElement("summary"),r=document.createElement("span");r.className="pijl",r.textContent="\u203A";let a=document.createElement("span");a.className="titel";let o=document.createElement("b");o.textContent=`Rij ${t+1}`;let c=document.createElement("small");a.append(o,c);let l=document.createElement("span");l.className="kolommen";let p=[1,2,3].map(u=>{let y=document.createElement("button");return y.type="button",y.textContent=String(u),y.title=`${u} entiteit${u>1?"en":""} in deze rij`,l.appendChild(this.binnenKop_(y,()=>{e.columns!==u&&(e.columns=u,Ge(e),this.open_.add(`r${t}`),this.legePlekkenOpen_(e,t),this.emit_(),this.build_())})),y}),h=()=>{let u=e.items.filter(w=>w.entity),y=`${e.columns} kolom${e.columns>1?"men":""}`;c.textContent=u.length?`${y} \xB7 ${u.map(w=>this.itemNaam_(w)).join(", ")}`:`${y} \xB7 nog leeg`,p.forEach(w=>w.setAttribute("aria-pressed",String(e.columns===Number(w.textContent))))};this.koppen_.push(h);let m=document.createElement("button");m.type="button",m.className="weg",m.title="Rij verwijderen",m.textContent="\u2715",this.binnenKop_(m,()=>{this.rows_.splice(t,1),this.rijWeg_(t),this.emit_(),this.build_()}),s.append(r,a,l,m);let _=document.createElement("div");return _.className="rijbody",e.items.forEach((u,y)=>_.appendChild(this.itemBlok_(e,u,t,y))),n.append(s,_),h(),n}itemNaam_(e){return e.name||this.hass_?.states?.[e.entity]?.attributes?.friendly_name||e.entity}itemBlok_(e,t,n,s){let r=document.createElement("details");r.className="item",this.onthoud_(r,`r${n}i${s}`);let a=document.createElement("summary"),o=document.createElement("span");o.className="pijl",o.textContent="\u203A";let c=document.createElement("span");c.className="nr",c.textContent=String(s+1),c.title=`Plek ${s+1} in de rij`;let l=document.createElement("span");l.className="titel";let p=document.createElement("b"),h=document.createElement("small");l.append(p,h);let m=document.createElement("button");m.type="button",m.className="weg",m.title="Deze plek leegmaken",m.textContent="\u2715",this.binnenKop_(m,()=>{e.items.splice(s,1),this.itemWeg_(n,s),Ge(e),this.emit_(),this.build_()}),a.append(o,c,l,m);let _=document.createElement("div");_.className="itembody";let u=document.createElement("ha-form");u.hass=this.hass_,u.schema=[{name:"entity",selector:{entity:{}}}],u.computeLabel=()=>"Entiteit",u.addEventListener("value-changed",$=>{$.stopPropagation(),t.entity=$.detail.value.entity??"",this.emit_()});let y=document.createElement("dac-icon-picker");y.label="Icoon",y.hass=this.hass_,y.addEventListener("value-changed",$=>{$.stopPropagation(),$.detail.value?t.icon=$.detail.value:delete t.icon,this.emit_()});let w=document.createElement("dac-tone-picker");w.label="Kleur",w.hass=this.hass_,w.addEventListener("value-changed",$=>{$.stopPropagation(),$.detail.value?t.tone=$.detail.value:delete t.tone,this.emit_()});let A=document.createElement("ha-form");A.hass=this.hass_,A.schema=[{name:"name",selector:{text:{}}},{name:"show_state",selector:{boolean:{}}},{name:"icon_tap_action",selector:{ui_action:{default_action:"toggle"}}},{name:"icon_hold_action",selector:{ui_action:{default_action:"more-info"}}},{name:"tap_action",selector:{ui_action:{default_action:"more-info"}}},{name:"hold_action",selector:{ui_action:{default_action:"more-info"}}}],A.computeLabel=$=>({name:"Naam (overschrijft die van de entiteit)",show_state:"Status tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de regel",hold_action:"Vasthouden op de regel"})[$.name]??$.name,A.computeHelper=$=>$.name==="icon_tap_action"?"Het icoon en de regel zijn twee knoppen: het icoon schakelt, de regel opent of navigeert.":void 0,A.addEventListener("value-changed",$=>{$.stopPropagation();let de=$.detail.value;de.name?t.name=de.name:delete t.name,de.show_state===!1?t.show_state=!1:delete t.show_state;for(let Me of["icon_tap_action","icon_hold_action","tap_action","hold_action"])de[Me]?t[Me]=de[Me]:delete t[Me];this.emit_()});let Y=()=>{p.textContent=t.entity?this.itemNaam_(t):"Kies een entiteit",h.textContent=t.entity||"",r.dataset.leeg=String(!t.entity),m.hidden=!t.entity};return this.koppen_.push(Y),u.data={entity:t.entity||void 0},y.value=t.icon??"",w.value=t.tone??"",A.data={name:t.name??"",show_state:t.show_state??!0,icon_tap_action:t.icon_tap_action,icon_hold_action:t.icon_hold_action,tap_action:t.tap_action,hold_action:t.hold_action},_.append(u,y,w,A),r.append(a,_),Y(),r}emit_(){let e=yn(this.rows_),t={...this.rest_,rows:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_)n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};I("domotiapp-entities-card-editor",Et);var wn=44,St=6,kn=i=>typeof i=="string"?{entity:i}:{...i};function Di(i){if(Array.isArray(i.rows)&&i.rows.length)return i.rows.map(t=>({columns:Math.min(Math.max(1,Number(t.columns)||2),3),items:(t.items??t.entities??[]).map(kn)}));let e=(i.items??i.entities??[]).map(kn);return e.length?[{columns:Math.min(Math.max(1,Number(i.columns)||2),3),items:e}]:[]}var qe=class extends S{validate(e){let t=Di(e);return t.some(n=>n.items.length)?{show_state:!0,...e,rows:t}:{...e,[j]:"Voeg een rij toe en kies daar entiteiten in."}}watched(){return this.config.rows.flatMap(e=>e.items.map(t=>t.entity))}item_(e,t){return this.config.rows[+e]?.items[+t]}tone_(e){return e.tone?O(e.tone):this.config.tone?O(this.config.tone):R(e.entity)!=="light"?K.accent:Ce(b(this.hass,e.entity))??K.lit}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size",`<div class="card surface">${e.rows.map((n,s)=>`
      <div class="row" style="--cols:${n.columns}">
        ${n.items.map((r,a)=>`
          <div class="it" role="button" tabindex="0" data-r="${s}" data-i="${a}">
            <span class="chip" role="button" tabindex="0"></span>
            <span class="txt"><span class="nm"></span><span class="st"></span></span>
          </div>`).join("")}
      </div>`).join("")}</div>`}wire(){this.$$(".it").forEach(e=>{let t=this.item_(e.dataset.r,e.dataset.i);if(!t)return;let n=(r,a)=>Le(this,this.hass,t,t[r]??a);this.teardown_.push(D(e,{onTap:()=>n("tap_action",{action:"more-info"}),onHold:()=>n("hold_action",{action:"more-info"})}));let s=e.querySelector(".chip");this.teardown_.push(D(s,{onTap:()=>n("icon_tap_action",Oe(t.entity)),onHold:()=>n("icon_hold_action",{action:"more-info"})})),this.on(s,"click",r=>r.stopPropagation()),this.on(s,"pointerdown",r=>r.stopPropagation())})}paint(){this.$$(".it").forEach(e=>{let t=this.item_(e.dataset.r,e.dataset.i);if(!t)return;let n=b(this.hass,t.entity),s=Te(n),r=B(n);e.dataset.on=String(s),e.classList.toggle("unavailable",r);let a=this.tone_(t);e.style.setProperty("--tone",a);let o=e.querySelector(".chip"),c=Ne(this.hass,t.entity,t.icon),l=t.icon||(c?`pic:${c}`:ue(t.entity,z(this.hass,t.entity)));o.dataset.icon!==l&&(o.dataset.icon=l,o.classList.toggle("pic",!!c),o.innerHTML=c?`<img src="${c}" alt="" loading="lazy" />`:M(t.icon||ue(t.entity,z(this.hass,t.entity)))),o.style.setProperty("--tone",c?"var(--dac-ink-3)":s?a:"var(--dac-ink-3)");let p=T(this.hass,t.entity,t.name);this.text(e.querySelector(".nm"),p),o.setAttribute("aria-label",`${p} schakelen`);let h=e.querySelector(".st");if((t.show_state??this.config.show_state)===!1)h.textContent="";else if(r)h.textContent="Niet bereikbaar";else if(!n||he(n.entity_id))h.textContent="";else if(R(n.entity_id)==="light"&&s&&n.attributes.brightness!=null)h.textContent=`${Math.round(n.attributes.brightness/255*100)}%`;else{let _=n.attributes.unit_of_measurement;h.textContent=_?`${n.state} ${_}`:U(this.hass,n)}e.setAttribute("aria-label",`${p}${n?`, ${U(this.hass,n)}`:""}`)})}lines_(){return(this.config?.rows??[]).reduce((e,t)=>e+Math.ceil((t.items.length||1)/t.columns),0)}getCardSize(){return Math.max(1,this.lines_())}getGridOptions(){let e=Math.max(1,this.lines_()),t=X(12+e*wn+(e-1)*St);return{columns:12,rows:t,min_columns:4,min_rows:t,max_rows:t}}static getConfigElement(){return document.createElement("domotiapp-entities-card-editor")}static getStubConfig(){return{rows:[]}}};v(qe,"css",`
    :host { display: block; height: 100%; }

    /* 5px boven en onder plus 44px per regel plus de rand van 2 komt precies op
       56 uit: \xE9\xE9n rasterrij, dezelfde hoogte als een Mushroom-kaart ernaast. */
    .card {
      height: 100%; min-height: 56px; padding: 5px 10px;
      display: flex; flex-direction: column; justify-content: center; gap: ${St}px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

    .row {
      display: grid; gap: ${St}px;
      grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
    }

    .it {
      display: flex; align-items: center; gap: 10px;
      min-height: ${wn}px; padding: 2px 6px 2px 2px;
      background: none; border: 0; border-radius: var(--dac-radius-sm);
      font: inherit; color: inherit; text-align: left; cursor: pointer;
      transition: background 200ms ease;
    }
    .it:hover { background: var(--dac-surface); }

    .chip {
      width: 36px; height: 36px; flex: 0 0 auto; cursor: pointer;
      transition: color 200ms ease, background 200ms ease,
                  border-color 200ms ease, box-shadow 200ms ease;
    }
    .chip .icon, .chip ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }
    .it[data-on="true"] .chip {
      box-shadow: 0 0 12px -3px color-mix(in srgb, var(--tone) 55%, transparent);
    }

    .txt { min-width: 0; display: flex; flex-direction: column; }
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

    .it.unavailable { opacity: .42; pointer-events: none; }

    /* Onder de 260px passen twee namen niet meer naast elkaar zonder te
       verminken, dus dan gaat elke rij terug naar \xE9\xE9n kolom. */
    @container (max-width: 260px) {
      .row { grid-template-columns: 1fr; }
    }
  `);N("domotiapp-entities-card",qe,{name:"DomotiApp Entiteiten",description:"Rijen entiteiten, elk met een eigen kolomindeling."});var me={OPEN:1,CLOSE:2,SET_POSITION:4,STOP:8},ge=(i,e)=>!!((i?.attributes?.supported_features??0)&e),Ii=(i={})=>{switch(i.device_class){case"garage":return{open:"garageOpen",closed:"garageClosed"};case"awning":case"blind":return{open:"awning",closed:"awning"};default:return{open:"shutterOpen",closed:"shutter"}}},Fe=class extends S{validate(e){let t=e.covers??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,covers:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[j]:"Kies minstens \xE9\xE9n rolluik of zonnescherm."}}watched(){return this.config.covers.map(e=>e.entity)}keysHtml(e){return`
      <div class="keys">
        <button type="button" data-act="open" aria-label="Open">${k.arrowUp}</button>
        ${e?`<button type="button" data-act="stop" aria-label="Stop">${k.stop}</button>`:""}
        <button type="button" data-act="close" aria-label="Dicht">${k.arrowDown}</button>
      </div>`}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`<div class="card surface">${e.covers.map((n,s)=>`
      <div class="cv" data-i="${s}" data-shown="closed" style="--tone:${O(n.tone??e.tone,"solar")}">
        <button class="chip" type="button" aria-label="Meer info"></button>
        <div class="txt"><div class="nm"></div><div class="st"></div></div>
        ${this.keysHtml(e.show_stop!==!1)}
        <div class="pos" hidden></div>
      </div>`).join("")}</div>`}wire(){this.dragging_=new Set,this.bound_=new Set,this.assumed_=new Map,this.$$(".cv").forEach(e=>{let t=e.dataset.i;e.querySelectorAll(".keys button").forEach(s=>{this.on(s,"click",()=>{let r=s.dataset.act,a={open:"open_cover",stop:"stop_cover",close:"close_cover"};this.hass.callService("cover",a[r],{entity_id:this.config.covers[+t].entity}),r!=="stop"&&(this.assumed_.set(t,r==="open"?"open":"closed"),this.paint())})});let n=this.config.covers[+t].entity;this.teardown_.push(D(e.querySelector(".chip"),{onTap:()=>W(this,n)}))})}paint(){this.$$(".cv").forEach(e=>{let t=e.dataset.i,n=this.config.covers[+t],s=b(this.hass,n.entity),r=z(this.hass,n.entity),a=!s||s.state==="unavailable",o=s?.state??"unknown";e.classList.toggle("unavailable",a),e.querySelector(".nm").textContent=T(this.hass,n.entity,n.name);let c=ge(s,me.SET_POSITION)&&r.current_position!=null,l=c?r.current_position>0?"open":"closed":o==="open"||o==="closed"?o:this.assumed_.get(t)??"closed";e.dataset.shown=l;let p=Ii(r),h=(l==="open"?n.icon_open:n.icon_closed)??(l==="open"?this.config.icon_open:this.config.icon_closed)??n.icon??p[l],m=e.querySelector(".chip");m.dataset.icon!==h&&(m.dataset.icon=h,m.innerHTML=M(h,p[l]));let _=e.querySelector(".st");this.dragging_.has(t)||(_.textContent=a?"Niet bereikbaar":o==="opening"?"Gaat open":o==="closing"?"Gaat dicht":c?`${r.current_position}% open`:o==="open"?"Open":o==="closed"?"Dicht":""),e.querySelectorAll(".keys button").forEach(w=>{if(w.dataset.act==="stop"){w.disabled=a||!ge(s,me.STOP);return}let A=w.dataset.act==="open";w.disabled=a||(A?!ge(s,me.OPEN):!ge(s,me.CLOSE))});let u=e.querySelector(".pos"),y=c&&this.config.show_position!==!1;if(u.hidden=!y,y){if(u.dataset.built||(u.dataset.built="1",u.innerHTML=se("position"),u.querySelector(".slider").setAttribute("aria-label","Positie")),!this.bound_.has(t)){this.bound_.add(t);let A=u.querySelector(".slider"),Y=$=>{A.style.setProperty("--v",`${$}%`),A.setAttribute("aria-valuenow",String($)),e.querySelector(".st").textContent=`${$}% open`};this.teardown_.push(He(A,{value:()=>z(this.hass,n.entity).current_position??0,onInput:Y,onCommit:$=>this.hass.callService("cover","set_cover_position",{entity_id:n.entity,position:$})}))}let w=u.querySelector(".slider");if(!w.classList.contains("dragging")){let A=r.current_position??0;w.style.setProperty("--v",`${A}%`),w.setAttribute("aria-valuenow",String(A))}}})}rows_(){let e=this.config?.covers??[],t=e.some(n=>ge(b(this.hass,n.entity),me.SET_POSITION));return X(12+Math.max(1,e.length)*42+(t?30:0))}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-cover-card-editor")}static getStubConfig(e,t){let n=t?.find(s=>s.startsWith("cover."));return{covers:n?[n]:[]}}};v(Fe,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; padding: 6px 12px;
      display: flex; flex-direction: column; justify-content: center;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

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
    .keys button:hover { color: var(--dac-ink); background: rgba(255,255,255,.08); }
    .keys button:active { background: rgba(255,255,255,.14); }
    .keys button .icon { width: 18px; height: 18px; }
    .keys button:disabled { opacity: .3; cursor: default; }

    /* ---- positie, alleen bij motoren die terugmelden ---- */
    .pos { grid-column: 1 / -1; margin: 2px 0 4px; display: flex; }
    .pos[hidden] { display: none; }
    ${Ke}

    .cv.unavailable { opacity: .42; pointer-events: none; }

    @media (max-width: 380px) { .keys button { width: 34px; } }
  `);var Mt=class extends C{defaults(){return{show_stop:!0,show_position:!0}}pickers(){return[{key:"icon_open",kind:"icon",label:"Icoon als het open staat",fallback:"shutterOpen"},{key:"icon_closed",kind:"icon",label:"Icoon als het dicht is",fallback:"shutter"},{key:"tone",kind:"tone",label:"Kleur"}]}schema(){return[{name:"covers",selector:{entity:{domain:"cover",multiple:!0}}},{name:"show_stop",selector:f.bool()}]}label(e){return{covers:"Rolluiken",show_stop:"Stopknop tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="covers")return"Melden ze hun stand terug, dan komt er vanzelf een schuif bij. Zo niet, dan blijven het open, stop en dicht, en volgt het icoon de knop die je indrukt."}};L("domotiapp-cover-card-editor",Mt);N("domotiapp-cover-card",Fe,{name:"DomotiApp Rolluiken",description:"Open, stop en dicht, met een eigen icoon voor open en dicht."});function Pi(i){if(!i)return{label:"Onbekend",home:null};switch(i.state){case"home":return{label:"Thuis",home:!0};case"not_home":return{label:"Afwezig",home:!1};case"unknown":case"unavailable":return{label:"Onbekend",home:null};default:return{label:i.state,home:!1}}}var Xe=class extends S{validate(e){let t=e.persons??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,persons:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[j]:"Kies minstens \xE9\xE9n persoon."}}watched(){return this.config.persons.map(e=>e.entity)}template(){let e=this.config;e.bare&&this.setAttribute("bare","");let t=e.columns??Math.min(e.persons.length,6),n=e.persons.map((s,r)=>`
      <button class="p" type="button" data-i="${r}" style="--tone:var(--dac-ink-3)">
        <span class="av"><span class="ph"></span></span>
        <span class="nm"></span>
        <span class="st"></span>
      </button>`).join("");return`<div class="card surface"><div class="chips" style="--cols:${t}">${n}</div></div>`}wire(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i];this.teardown_.push(D(e,{onTap:()=>W(this,t.entity)}))})}paint(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i],n=b(this.hass,t.entity),s=Pi(n);e.style.setProperty("--tone",s.home===!0?"var(--dac-good)":s.home===!1?"var(--dac-bad)":"var(--dac-warn)");let r=T(this.hass,t.entity,t.name);this.text(e.querySelector(".nm"),r),this.text(e.querySelector(".st"),s.label);let a=e.querySelector(".ph"),o=n?.attributes?.entity_picture,c=o?`img:${o}`:r?`ini:${r[0]}`:"icon";a.dataset.kind!==c&&(a.dataset.kind=c,a.innerHTML=o?`<img src="${o}" alt="" loading="lazy" />`:r?r[0].toUpperCase():k.person),e.setAttribute("aria-label",`${r}, ${s.label}`)})}rows_(){let e=this.config?.columns??Math.min(this.config?.persons?.length??1,6),t=Math.ceil((this.config?.persons?.length??1)/e);return X(20+t*74+(t-1)*6)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:"full",rows:e,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-person-card-editor")}static getStubConfig(e){return{persons:Object.keys(e?.states??{}).filter(n=>n.startsWith("person.")).slice(0,6)}}};v(Xe,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; padding: 10px 12px;
      display: flex; flex-direction: column; justify-content: center;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; }

    .chips {
      display: grid; gap: 6px;
      grid-template-columns: repeat(var(--cols, 6), minmax(0, 1fr));
    }
    .p {
      display: flex; flex-direction: column; align-items: center; gap: 5px;
      padding: 3px 2px; background: none; border: 0; cursor: pointer;
      font: inherit; color: inherit; border-radius: var(--dac-radius-sm);
      transition: background 200ms ease;
    }
    .p:hover { background: var(--dac-surface); }
    .nm {
      font-size: 11px; font-weight: 500; line-height: 1.15; text-align: center;
      max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st {
      font-size: 10px; color: var(--dac-ink-3); line-height: 1.15;
      max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .av {
      position: relative; flex: 0 0 auto;
      width: 38px; height: 38px; border-radius: 50%;
      display: grid; place-items: center; overflow: hidden;
      font-size: 14px; font-weight: 600;
      color: var(--dac-ink); background: var(--dac-surface-hi);
      /* Ring buiten de avatar getekend, zodat een foto er nooit door bijgesneden wordt. */
      box-shadow: 0 0 0 2px var(--dac-bg), 0 0 0 3.5px var(--tone);
    }
    .av img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .av .icon { width: 55%; height: 55%; color: var(--dac-ink-2); }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `);var At=class extends C{setConfig(e){let t={...e},n=(e.persons??[]).map(s=>typeof s=="string"?{entity:s}:s);t.persons=n.map(s=>s.entity);for(let s of n)s.name&&(t[`naam:${s.entity}`]=s.name);super.setConfig(t)}serialize(e){let t={...e},n=t.persons??[];t.persons=n.map(s=>{let r=t[`naam:${s}`];return r?{entity:s,name:r}:s});for(let s of Object.keys(t))s.startsWith("naam:")&&delete t[s];return t}schema(){let e=(this.config_?.persons??[]).filter(t=>typeof t=="string");return[{name:"persons",selector:{entity:{domain:["person","device_tracker"],multiple:!0}}},...e.map(t=>({name:`naam:${t}`,selector:f.text()}))]}label(e){if(e.name==="persons")return"Personen";if(e.name.startsWith("naam:")){let t=e.name.slice(5);return`Naam voor ${this.hass?.states?.[t]?.attributes?.friendly_name??t}`}return super.label(e)}helper(e){if(e.name==="persons")return"Thuis is groen, weg is rood, geen melding is oranje. Per persoon kun je hieronder een eigen naam zetten."}};L("domotiapp-person-card-editor",At);N("domotiapp-person-card",Xe,{name:"DomotiApp Personen",description:"Wie er thuis is, compact. Het hele huishouden in \xE9\xE9n kaart."});var Ri=[[/gft|groente|tuin|organi/i,"teal","binWheeled"],[/pmd|plastic|verpakking/i,"solar","binWheeled"],[/papier|karton/i,"water","binWheeled"],[/rest|grijs/i,"neutral","binWheeled"],[/textiel|kleding/i,"pink","bin"],[/glas/i,"magenta","bin"],[/kerstboom|snoei|takken/i,"teal","bin"]];function Hi(i){for(let[e,t,n]of Ri)if(e.test(i))return{tone:t,icon:n};return{tone:"accent",icon:"bin"}}var $n=i=>String(i??"").replace(/^(afvalbeheer|afvalwijzer|mijnafvalwijzer)\s*/i,"").replace(/\s*(mijnafvalwijzer)\s*/i," ").trim(),Ze=class extends S{validate(e){let t=e.sensors??e.entities??(e.entity?[e.entity]:[]);return t.length?{show_hero:!0,show_list:!0,...e,sensors:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[j]:"Kies minstens \xE9\xE9n afvalsensor waarvan de status een datum is."}}watched(){return this.config.sensors.map(e=>e.entity)}read_(){let e=new Date;return this.config.sensors.map(t=>{let n=b(this.hass,t.entity);if(!n)return null;let s=pe(n.state)??pe(n.attributes.date)??pe(n.attributes.next_date);if(!s)return null;let r=t.label??$n(T(this.hass,t.entity,t.name)),a=Hi(t.label??t.entity+r),o=this.config.tones?.[t.entity];return{label:r,date:s,days:ct(e,s),tone:O(o??t.tone??a.tone),icon:t.icon??a.icon}}).filter(t=>t&&t.days>=0).sort((t,n)=>t.date-n.date)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`
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
      </div>`}paint(){let e=this.read_(),t=this.$(".hero"),n=this.$(".list"),s=this.$(".empty");if(s.hidden=e.length>0,t&&(t.hidden=e.length===0,e.length)){let r=e[0];t.style.setProperty("--tone",r.tone),this.setAttribute("urgency",r.days===0?"today":r.days===1?"tomorrow":"later");let a=t.querySelector(".bin");a.dataset.icon!==r.icon&&(a.dataset.icon=r.icon,a.innerHTML=M(r.icon,"bin")),this.text(t.querySelector(".eyebrow"),lt(r.date)),this.text(t.querySelector(".big"),r.label),this.text(t.querySelector(".n"),r.days===0?"nu":String(r.days)),this.text(t.querySelector(".u"),r.days===0?"aan de weg":r.days===1?"dag":"dagen")}if(n){let r=this.config.show_hero===!1?e:e.slice(1),a=r.map(o=>`${o.label}${+o.date}`).join("|");if(n.dataset.sig===a)return;n.dataset.sig=a,n.innerHTML=r.map(o=>{let c=lt(o.date),l=o.days<=6?`<small>${dn(o.date)}</small>`:"";return`
        <div class="r" style="--tone:${o.tone}">
          <i></i><span>${o.label}</span>
          <span class="d">${c}${l}</span>
        </div>`}).join("")}}rows_(){let e=this.config?.sensors?.length??1;return this.config?.show_list===!1?1:this.config?.show_hero===!1?Math.max(1,X(20+e*33)):Math.max(2,e)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-waste-card-editor")}static getStubConfig(e){return{sensors:Object.keys(e?.states??{}).filter(n=>/afval|waste|trash|garbage|ophaal/i.test(n)&&n.startsWith("sensor.")).filter(n=>pe(e.states[n]?.state)).slice(0,6),title:"Afvalkalender"}}};v(Ze,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; padding: 10px 12px;
      display: flex; flex-direction: column; gap: 8px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; }

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
  `);var zt=class extends C{defaults(){return{show_hero:!0,show_list:!0}}setConfig(e){let t={...e};for(let[n,s]of Object.entries(e.tones??{}))t[`kleur:${n}`]=s;delete t.tones,super.setConfig(t)}serialize(e){let t={...e},n={};for(let s of Object.keys(t))s.startsWith("kleur:")&&(t[s]&&(n[s.slice(6)]=t[s]),delete t[s]);return Object.keys(n).length?t.tones=n:delete t.tones,t}ids_(){return(this.config_?.sensors??[]).map(e=>typeof e=="string"?e:e.entity).filter(Boolean)}pickers(){return this.ids_().map(e=>({key:`kleur:${e}`,kind:"tone",label:`Kleur voor ${$n(this.hass?.states?.[e]?.attributes?.friendly_name??e)||e}`,compact:!0,after:!0}))}schema(){return[{name:"sensors",selector:{entity:{domain:"sensor",multiple:!0}}}]}label(e){return{sensors:"Afvalsensoren",show_hero:"Eerstvolgende uitlichten",show_list:"Overige data tonen",bare:"Zonder kaartrand"}[e.name]??super.label(e)}helper(e){if(e.name==="sensors")return"Sensoren waarvan de status een datum is, bijvoorbeeld 18-08-2026. De kaart sorteert zelf; laat een kleur leeg om de bakkleur op de naam te laten kiezen."}};L("domotiapp-waste-card-editor",zt);N("domotiapp-waste-card",Ze,{name:"DomotiApp Afvalkalender",description:"Eerstvolgende ophaling als hero, de rest eronder. Kleur per fractie."});var Ye=globalThis,Je=Ye.ShadowRoot&&(Ye.ShadyCSS===void 0||Ye.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Nt=Symbol(),En=new WeakMap,fe=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==Nt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(Je&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=En.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&En.set(t,e))}return e}toString(){return this.cssText}},be=i=>new fe(typeof i=="string"?i:i+"",void 0,Nt),G=(i,...e)=>{let t=i.length===1?i[0]:e.reduce((n,s,r)=>n+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+i[r+1],i[0]);return new fe(t,i,Nt)},Sn=(i,e)=>{if(Je)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let n=document.createElement("style"),s=Ye.litNonce;s!==void 0&&n.setAttribute("nonce",s),n.textContent=t.cssText,i.appendChild(n)}},Ct=Je?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(let n of e.cssRules)t+=n.cssText;return be(t)})(i):i;var{is:Ki,defineProperty:Ui,getOwnPropertyDescriptor:Vi,getOwnPropertyNames:Bi,getOwnPropertySymbols:Wi,getPrototypeOf:Gi}=Object,Qe=globalThis,Mn=Qe.trustedTypes,qi=Mn?Mn.emptyScript:"",Fi=Qe.reactiveElementPolyfillSupport,_e=(i,e)=>i,Tt={toAttribute(i,e){switch(e){case Boolean:i=i?qi:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},zn=(i,e)=>!Ki(i,e),An={attribute:!0,type:String,converter:Tt,reflect:!1,useDefault:!1,hasChanged:zn};Symbol.metadata??=Symbol("metadata"),Qe.litPropertyMetadata??=new WeakMap;var q=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=An){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),s=this.getPropertyDescriptor(e,n,t);s!==void 0&&Ui(this.prototype,e,s)}}static getPropertyDescriptor(e,t,n){let{get:s,set:r}=Vi(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:s,set(a){let o=s?.call(this);r?.call(this,a),this.requestUpdate(e,o,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??An}static _$Ei(){if(this.hasOwnProperty(_e("elementProperties")))return;let e=Gi(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(_e("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_e("properties"))){let t=this.properties,n=[...Bi(t),...Wi(t)];for(let s of n)this.createProperty(s,t[s])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[n,s]of t)this.elementProperties.set(n,s)}this._$Eh=new Map;for(let[t,n]of this.elementProperties){let s=this._$Eu(t,n);s!==void 0&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let s of n)t.unshift(Ct(s))}else e!==void 0&&t.push(Ct(e));return t}static _$Eu(e,t){let n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Sn(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,n);if(s!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:Tt).toAttribute(t,n.type);this._$Em=e,r==null?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){let n=this.constructor,s=n._$Eh.get(e);if(s!==void 0&&this._$Em!==s){let r=n.getPropertyOptions(s),a=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Tt;this._$Em=s;let o=a.fromAttribute(t,r.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(e,t,n,s=!1,r){if(e!==void 0){let a=this.constructor;if(s===!1&&(r=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??zn)(r,t)||n.useDefault&&n.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:s,wrapped:r},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),r!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),s===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[s,r]of this._$Ep)this[s]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[s,r]of n){let{wrapped:a}=r,o=this[s];a!==!0||this._$AL.has(s)||o===void 0||this.C(s,void 0,r,o)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};q.elementStyles=[],q.shadowRootOptions={mode:"open"},q[_e("elementProperties")]=new Map,q[_e("finalized")]=new Map,Fi?.({ReactiveElement:q}),(Qe.reactiveElementVersions??=[]).push("2.1.2");var Rt=globalThis,Nn=i=>i,et=Rt.trustedTypes,Cn=et?et.createPolicy("lit-html",{createHTML:i=>i}):void 0,In="$lit$",Z=`lit$${Math.random().toFixed(9).slice(2)}$`,Pn="?"+Z,Xi=`<${Pn}>`,ee=document,xe=()=>ee.createComment(""),ye=i=>i===null||typeof i!="object"&&typeof i!="function",Ht=Array.isArray,Zi=i=>Ht(i)||typeof i?.[Symbol.iterator]=="function",Ot=`[ 	
\f\r]`,ve=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Tn=/-->/g,On=/>/g,J=RegExp(`>|${Ot}(?:([^\\s"'>=/]+)(${Ot}*=${Ot}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ln=/'/g,jn=/"/g,Rn=/^(?:script|style|textarea|title)$/i,Kt=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),x=Kt(1),Xr=Kt(2),Zr=Kt(3),te=Symbol.for("lit-noChange"),g=Symbol.for("lit-nothing"),Dn=new WeakMap,Q=ee.createTreeWalker(ee,129);function Hn(i,e){if(!Ht(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Cn!==void 0?Cn.createHTML(e):e}var Yi=(i,e)=>{let t=i.length-1,n=[],s,r=e===2?"<svg>":e===3?"<math>":"",a=ve;for(let o=0;o<t;o++){let c=i[o],l,p,h=-1,m=0;for(;m<c.length&&(a.lastIndex=m,p=a.exec(c),p!==null);)m=a.lastIndex,a===ve?p[1]==="!--"?a=Tn:p[1]!==void 0?a=On:p[2]!==void 0?(Rn.test(p[2])&&(s=RegExp("</"+p[2],"g")),a=J):p[3]!==void 0&&(a=J):a===J?p[0]===">"?(a=s??ve,h=-1):p[1]===void 0?h=-2:(h=a.lastIndex-p[2].length,l=p[1],a=p[3]===void 0?J:p[3]==='"'?jn:Ln):a===jn||a===Ln?a=J:a===Tn||a===On?a=ve:(a=J,s=void 0);let _=a===J&&i[o+1].startsWith("/>")?" ":"";r+=a===ve?c+Xi:h>=0?(n.push(l),c.slice(0,h)+In+c.slice(h)+Z+_):c+Z+(h===-2?o:_)}return[Hn(i,r+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},we=class i{constructor({strings:e,_$litType$:t},n){let s;this.parts=[];let r=0,a=0,o=e.length-1,c=this.parts,[l,p]=Yi(e,t);if(this.el=i.createElement(l,n),Q.currentNode=this.el.content,t===2||t===3){let h=this.el.content.firstChild;h.replaceWith(...h.childNodes)}for(;(s=Q.nextNode())!==null&&c.length<o;){if(s.nodeType===1){if(s.hasAttributes())for(let h of s.getAttributeNames())if(h.endsWith(In)){let m=p[a++],_=s.getAttribute(h).split(Z),u=/([.?@])?(.*)/.exec(m);c.push({type:1,index:r,name:u[2],strings:_,ctor:u[1]==="."?jt:u[1]==="?"?Dt:u[1]==="@"?It:ae}),s.removeAttribute(h)}else h.startsWith(Z)&&(c.push({type:6,index:r}),s.removeAttribute(h));if(Rn.test(s.tagName)){let h=s.textContent.split(Z),m=h.length-1;if(m>0){s.textContent=et?et.emptyScript:"";for(let _=0;_<m;_++)s.append(h[_],xe()),Q.nextNode(),c.push({type:2,index:++r});s.append(h[m],xe())}}}else if(s.nodeType===8)if(s.data===Pn)c.push({type:2,index:r});else{let h=-1;for(;(h=s.data.indexOf(Z,h+1))!==-1;)c.push({type:7,index:r}),h+=Z.length-1}r++}}static createElement(e,t){let n=ee.createElement("template");return n.innerHTML=e,n}};function re(i,e,t=i,n){if(e===te)return e;let s=n!==void 0?t._$Co?.[n]:t._$Cl,r=ye(e)?void 0:e._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),r===void 0?s=void 0:(s=new r(i),s._$AT(i,t,n)),n!==void 0?(t._$Co??=[])[n]=s:t._$Cl=s),s!==void 0&&(e=re(i,s._$AS(i,e.values),s,n)),e}var Lt=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,s=(e?.creationScope??ee).importNode(t,!0);Q.currentNode=s;let r=Q.nextNode(),a=0,o=0,c=n[0];for(;c!==void 0;){if(a===c.index){let l;c.type===2?l=new ke(r,r.nextSibling,this,e):c.type===1?l=new c.ctor(r,c.name,c.strings,this,e):c.type===6&&(l=new Pt(r,this,e)),this._$AV.push(l),c=n[++o]}a!==c?.index&&(r=Q.nextNode(),a++)}return Q.currentNode=ee,s}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}},ke=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,s){this.type=2,this._$AH=g,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=re(this,e,t),ye(e)?e===g||e==null||e===""?(this._$AH!==g&&this._$AR(),this._$AH=g):e!==this._$AH&&e!==te&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Zi(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==g&&ye(this._$AH)?this._$AA.nextSibling.data=e:this.T(ee.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,s=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=we.createElement(Hn(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===s)this._$AH.p(t);else{let r=new Lt(s,this),a=r.u(this.options);r.p(t),this.T(a),this._$AH=r}}_$AC(e){let t=Dn.get(e.strings);return t===void 0&&Dn.set(e.strings,t=new we(e)),t}k(e){Ht(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,n,s=0;for(let r of e)s===t.length?t.push(n=new i(this.O(xe()),this.O(xe()),this,this.options)):n=t[s],n._$AI(r),s++;s<t.length&&(this._$AR(n&&n._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let n=Nn(e).nextSibling;Nn(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},ae=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,s,r){this.type=1,this._$AH=g,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=g}_$AI(e,t=this,n,s){let r=this.strings,a=!1;if(r===void 0)e=re(this,e,t,0),a=!ye(e)||e!==this._$AH&&e!==te,a&&(this._$AH=e);else{let o=e,c,l;for(e=r[0],c=0;c<r.length-1;c++)l=re(this,o[n+c],t,c),l===te&&(l=this._$AH[c]),a||=!ye(l)||l!==this._$AH[c],l===g?e=g:e!==g&&(e+=(l??"")+r[c+1]),this._$AH[c]=l}a&&!s&&this.j(e)}j(e){e===g?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},jt=class extends ae{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===g?void 0:e}},Dt=class extends ae{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==g)}},It=class extends ae{constructor(e,t,n,s,r){super(e,t,n,s,r),this.type=5}_$AI(e,t=this){if((e=re(this,e,t,0)??g)===te)return;let n=this._$AH,s=e===g&&n!==g||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==g&&(n===g||s);s&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Pt=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){re(this,e)}};var Ji=Rt.litHtmlPolyfillSupport;Ji?.(we,ke),(Rt.litHtmlVersions??=[]).push("3.3.3");var Kn=(i,e,t)=>{let n=t?.renderBefore??e,s=n._$litPart$;if(s===void 0){let r=t?.renderBefore??null;n._$litPart$=s=new ke(e.insertBefore(xe(),r),r,void 0,t??{})}return s._$AI(i),s};var Ut=globalThis,P=class extends q{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Kn(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return te}};P._$litElement$=!0,P.finalized=!0,Ut.litElementHydrateSupport?.({LitElement:P});var Qi=Ut.litElementPolyfillSupport;Qi?.({LitElement:P});(Ut.litElementVersions??=[]).push("4.2.2");var oe=G`
  :host {
    ${be(F)}
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  ${be(Ae)}
`;var es=["unavailable","unknown"],ts=["color_temp_kelvin","rgb_color","hs_color","xy_color"];function tt({scene:i,memberEntityIds:e,states:t}){let n=[],s=[],r=i?.lights??{},a=Array.isArray(e)?e:[],o=t??{};for(let c of a){let l=r[c];if(!l||typeof l!="object")continue;let p=o[c];if(!p||es.includes(p.state)){s.push(c);continue}if(l.state==="off"){n.push({service:"turn_off",data:{entity_id:c,transition:1}});continue}let h={entity_id:c,transition:1};typeof l.brightness=="number"&&(h.brightness=l.brightness);for(let m of ts)if(l[m]!==void 0){h[m]=l[m];break}n.push({service:"turn_on",data:h})}return{oproepen:n,overgeslagen:s}}async function nt(i,e){let t=await Promise.allSettled(e.map(s=>i(s.service,s.data))),n=[];return t.forEach((s,r)=>{s.status==="rejected"&&n.push({entityId:e[r].data.entity_id,fout:s.reason})}),n}var Bt=["hs","rgb","rgbw","rgbww","xy"],Wt="color_temp",ns="onoff";var ne="kleur";var is=["unavailable","unknown"],Vn=["color_temp_kelvin","rgb_color","hs_color","xy_color"],ss=[0,100];function V(i){if(!i)return{bekend:!1,beschikbaar:!1,helderheid:!1,kleurtemp:!1,kleur:!1,minKelvin:2e3,maxKelvin:6535,kelvinUitDefaults:!1};let e=i.attributes??{},t=Array.isArray(e.supported_color_modes)?e.supported_color_modes:null,n=t!==null&&t.length===1&&t[0]===ns,s=t!==null&&t.includes(Wt),r=t!==null&&t.some(l=>Bt.includes(l)),a=e.min_color_temp_kelvin,o=e.max_color_temp_kelvin,c=typeof a=="number"&&typeof o=="number"&&a<o;return{bekend:!0,beschikbaar:!is.includes(i.state),helderheid:!n,kleurtemp:s,kleur:r,minKelvin:c?Math.round(a):2e3,maxKelvin:c?Math.round(o):6535,kelvinUitDefaults:s&&!c}}function rs(){return{state:"off"}}function Bn(i,e){let t=e??V(i);return t.bekend&&t.beschikbaar&&i.state==="on"?{state:"on",...hs(i,t)}:t.helderheid?{state:"on",brightness:255}:{state:"on"}}function Wn(i,e,t,n){return e?i&&i.state==="on"?{...i}:Bn(t,n):{state:"off"}}function Gn(i,e,t,n){let s=n??V(t),r=Yt(i,t,s);return s.helderheid&&(r.brightness=E(e,1,255)),r}function Gt(i,e,t,n){let s=n??V(t),r=Yt(i,t,s);return ni(r),r.color_temp_kelvin=E(e,s.minKelvin,s.maxKelvin),r}function qt(i,e,t,n){let s=n??V(t),r=Yt(i,t,s);return ni(r),r.hs_color=[E(e?.[0],0,360),E(e?.[1],0,100)],r}function it(i,e,t){return i??rs()}function qn(i,e,t){let n=it(i,e,t);if(typeof n.brightness=="number")return E(n.brightness,1,255);let s=e?.attributes?.brightness;return typeof s=="number"?E(s,1,255):255}function Ft(i,e,t){let n=t??V(e),s=it(i,e,n);if(typeof s.color_temp_kelvin=="number")return E(s.color_temp_kelvin,n.minKelvin,n.maxKelvin);let r=e?.attributes?.color_temp_kelvin;return typeof r=="number"?E(r,n.minKelvin,n.maxKelvin):Math.round((n.minKelvin+n.maxKelvin)/2)}function st(i,e,t){let n=it(i,e,t);if(Vt(n.hs_color))return[E(n.hs_color[0],0,360),E(n.hs_color[1],0,100)];let s=e?.attributes?.hs_color;return Vt(s)?[E(s[0],0,360),E(s[1],0,100)]:[...ss]}function Xt(i){return i!=null&&typeof i=="object"}function Fn(i,e,t){let n=Array.isArray(e)?e:[],s=Array.isArray(i)?i:[],r=Number.isInteger(t)?t:s.length;return n.filter(a=>{for(let o=0;o<r;o+=1)if(!Xt(s[o]?.lights?.[a]))return!0;return!1})}function Xn(i){return!Number.isInteger(i)||i<=0?null:i===1?"1 lamp nog niet ingesteld":`${i} lampen nog niet ingesteld`}function Zt(i,e,t){return it(i,e,t).state==="on"}function Zn(i,e,t){let n=t??V(e);if(!n.bekend)return{aanuit:!1,helderheid:!1,kleurtemp:!1,kleur:!1,kleurkeuze:!1,stand:null};let s=Zt(i,e,n),r=Yn(n),a=r?as(i,e,n):null;return{aanuit:!0,helderheid:s&&n.helderheid,kleurtemp:s&&n.kleurtemp&&(!r||a==="wit"),kleur:s&&n.kleur&&(!r||a===ne),kleurkeuze:s&&r,stand:s?a:null}}function Yn(i){return!!(i?.kleurtemp&&i?.kleur)}function as(i,e,t){let n=t??V(e);if(i&&typeof i=="object"){if(typeof i.color_temp_kelvin=="number")return"wit";if(Vn.slice(1).some(r=>i[r]!==void 0))return ne}let s=e?.attributes?.color_mode;return s===Wt&&n.kleurtemp?"wit":Bt.includes(s)&&n.kleur?ne:"wit"}function Jn(i,e,t,n){let s=n??V(t);return Yn(s)?e==="wit"?Gt(i,Ft(i,t,s),t,s):qt(i,st(i,t,s),t,s):i}function Qn(i){let e=E(i,0,255);return e<=0?0:Math.max(1,Math.round(e/255*100))}function ei(i){let e=E(i,1,100);return E(Math.round(e/100*255),1,255)}var os=1e3,cs=4e4,Un=7;function ls(i){let e=E(i,os,cs)/100,t=e<=66?255:329.698727446*(e-60)**-.1332047592,n=e<=66?99.4708025861*Math.log(e)-161.1195681661:288.1221695283*(e-60)**-.0755148492,s;return e>=66?s=255:e<=19?s=0:s=138.5177312231*Math.log(e-10)-305.0447927307,[E(t,0,255),E(n,0,255),E(s,0,255)]}function ds(i){let[e,t,n]=ls(i);return`rgb(${e}, ${t}, ${n})`}function ti(i,e){let t=Math.min(i,e),n=Math.max(i,e);return`linear-gradient(to right, ${Array.from({length:Un},(r,a)=>{let o=a/(Un-1),c=t+(n-t)*o;return`${ds(c)} ${Math.round(o*100)}%`}).join(", ")})`}function hs(i,e){let t=i.attributes??{},n={};e.helderheid&&(n.brightness=typeof t.brightness=="number"?E(t.brightness,1,255):255);let s=t.color_mode;return e.kleurtemp&&s===Wt&&typeof t.color_temp_kelvin=="number"?n.color_temp_kelvin=E(t.color_temp_kelvin,e.minKelvin,e.maxKelvin):e.kleur&&Bt.includes(s)&&Vt(t.hs_color)&&(n.hs_color=[E(t.hs_color[0],0,360),E(t.hs_color[1],0,100)]),n}function Yt(i,e,t){return i&&i.state==="on"?{...i}:Bn(e,t)}function ni(i){for(let e of Vn)delete i[e]}function Vt(i){return Array.isArray(i)&&i.length===2&&typeof i[0]=="number"&&typeof i[1]=="number"}function E(i,e,t){let n=Number(i);return Number.isFinite(n)?Math.min(t,Math.max(e,Math.round(n))):e}var rt="domotiapp-scene-card",Jt="domotiapp-scene-card-editor",ii="domotiapp-scene-editor";var $e=["een","twee","drie"],si="pencil",ri=["grid_options","layout_options","view_layout","visibility"];var ai="entity_id",ce=class extends P{constructor(){super();v(this,"_label",t=>t.name==="entity"?"Lichtgroep":this._friendlyName(t.name));v(this,"_helper",t=>t.name==="entity"?"De lichtgroep waarvan deze kaart de scenes beheert.":t.name);this._getypt={}}setConfig(t){this._config={...t}}_lichtgroepen(){let t=this.hass?.states??{};return Object.keys(t).filter(n=>n.startsWith("light.")&&Array.isArray(t[n].attributes?.[ai]))}_leden(){let t=this._config?.entity,n=this.hass?.states?.[t]?.attributes?.[ai];return Array.isArray(n)?n.filter(s=>s!==t):[]}_entiteitSchema(){let t=this._lichtgroepen();return[{name:"entity",required:!0,selector:t.length?{entity:{include_entities:t}}:{entity:{domain:"light"}}}]}_namenSchema(t){return t.map(n=>({name:n,selector:{text:{}}}))}_naamData(t){let n=this._config?.name_overrides??{},s={};for(let r of t)r in this._getypt?s[r]=this._getypt[r]:n[r]&&(s[r]=n[r]);return s}_friendlyName(t){return this.hass?.states?.[t]?.attributes?.friendly_name||t}_entiteitGewijzigd(t){t.stopPropagation();let n={...this._config,entity:t.detail.value.entity};n.entity!==this._config?.entity&&(delete n.name_overrides,this._getypt={}),this._stuurDoor(n)}_namenGewijzigd(t){t.stopPropagation(),this._getypt={...this._getypt,...t.detail.value};let n={};for(let[r,a]of Object.entries(this._getypt))typeof a=="string"&&a.trim()&&(n[r]=a.trim());let s={...this._config};Object.keys(n).length?s.name_overrides=n:delete s.name_overrides,this._stuurDoor(s)}_stuurDoor(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return g;let t=this._leden();return x`
      <ha-form
        .hass=${this.hass}
        .data=${{entity:this._config.entity??""}}
        .schema=${this._entiteitSchema()}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._entiteitGewijzigd}
      ></ha-form>

      ${t.length?x`
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
          `:g}
    `}};v(ce,"properties",{hass:{attribute:!1},_config:{state:!0},_getypt:{state:!0}}),v(ce,"styles",[oe,G`
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
    `]);var ps="domotiapp_lovelace/snapshot/create",us="domotiapp_lovelace/snapshot/close",at=class{constructor({roepCommandoAan:e,entityId:t}){this._roep=e,this._entityId=t,this._aanmaak=null,this._afsluiting=null}get heeftSnapshot(){return this._aanmaak!==null}get isGesloten(){return this._afsluiting!==null}async zorgVoorSnapshot(){return this._aanmaak===null&&(this._aanmaak=this._roep(ps,{entity_id:this._entityId}).catch(e=>{throw this._aanmaak=null,e})),this._aanmaak}async sluit({opslaan:e=!1}={}){return this.heeftSnapshot?this._afsluiting!==null?this._afsluiting:(this._afsluiting=(async()=>{try{await this._aanmaak}catch{return{gedaan:!1}}return await this._roep(us,{entity_id:this._entityId,restore:!e}),{gedaan:!0}})(),this._afsluiting):{gedaan:!1}}};async function oi({beheer:i,oproepen:e,voerUit:t}){return await i.zorgVoorSnapshot(),t(e)}var en="laden",tn="klaar",ci="fout",fs=`linear-gradient(to right, ${[0,60,120,180,240,300,360].map(i=>`hsl(${i}, 100%, 50%)`).join(", ")})`,le=class extends P{constructor(){super(),this._scenes=null,this._leden=[],this._tab=0,this._toestand=en,this._melding="",this._bezig=!1,this._kelvinGemeld=new Set,this._snapshot=null}firstUpdated(){this._haalOp()}async _haalOp(){this._toestand=en;try{let e=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:this.entityId});return this._neemOver(e),this._toestand=tn,e}catch(e){return this._melding=e?.message??String(e),this._toestand=ci,null}}_neemOver(e){this._scenes=Array.from({length:3},(t,n)=>{let s=e.scenes?.[n]??{};return{icon:s.icon||$e[n],lights:{...s.lights??{}}}}),this._leden=e.member_entity_ids??[],this._melding=""}_stateVan(e){return this.hass?.states?.[e]}_besturingVan(e){let t=V(this._stateVan(e));return t.kelvinUitDefaults&&!this._kelvinGemeld.has(e)&&(this._kelvinGemeld.add(e),console.warn(`domotiapp-scene-editor: ${e} meldt geen Kelvin-grenzen; ${t.minKelvin}\u2013${t.maxKelvin} K aangehouden (SPEC 6.3).`)),t}_waardeVan(e){return this._scenes?.[this._tab]?.lights?.[e]}_zetLamp(e,t){this._scenes=this._scenes.map((n,s)=>{if(s!==this._tab)return n;let r={...n.lights};return t===void 0?delete r[e]:r[e]=t,{...n,lights:r}})}_zetIcoon(e){this._scenes=this._scenes.map((t,n)=>n===this._tab?{...t,icon:e||$e[n]}:t)}_kiesTab(e){this._tab=e}get _kanOpslaan(){return this._toestand===tn&&!this._bezig&&this._leden.length>0}async _slaOp(){if(!this._kanOpslaan)return;this._bezig=!0,this._melding="";try{await this.hass.callWS({type:"domotiapp_lovelace/scenes/save",entity_id:this.entityId,scenes:this._scenes})}catch(t){this._melding=t?.message??String(t),this._bezig=!1;return}let e=await this._haalOp();this._bezig=!1,e&&this.dispatchEvent(new CustomEvent("scenes-opgeslagen",{detail:e,bubbles:!0,composed:!0})),this._sluit({opslaan:!0})}get _beheer(){return this._snapshot===null&&(this._snapshot=new at({entityId:this.entityId,roepCommandoAan:(e,t)=>this.hass.callWS({type:e,...t})})),this._snapshot}get _kanVoorbeeld(){return this._toestand===tn&&!this._bezig&&this._leden.length>0}async _voorbeeld(){if(!this._kanVoorbeeld)return;let{oproepen:e}=tt({scene:this._scenes[this._tab],memberEntityIds:this._leden,states:this.hass.states});this._bezig=!0,this._melding="";try{let t=await oi({beheer:this._beheer,oproepen:e,voerUit:n=>nt((s,r)=>this.hass.callService("light",s,r),n)});t.length&&(this._melding=`Deze lampen reageerden niet: ${t.map(n=>this._naam(n.entityId)).join(", ")}.`)}catch(t){this._melding=`Het voorbeeld is niet gestart: ${t?.message??String(t)}`}finally{this._bezig=!1}}_sluit({opslaan:e=!1}={}){this.dispatchEvent(new CustomEvent("editor-gesloten",{bubbles:!0,composed:!0})),this._sluitSnapshot({opslaan:e})}async _sluitSnapshot({opslaan:e}){try{await this._beheer.sluit({opslaan:e})}catch(t){console.warn(`domotiapp-scene-editor: de snapshot kon niet worden ${e?"verwijderd":"hersteld"}: ${t?.message??t}`)}}disconnectedCallback(){super.disconnectedCallback(),this._snapshot&&this._snapshot.heeftSnapshot&&this._sluitSnapshot({opslaan:!1})}_dialoogGesloten(e){e.stopPropagation(),this._sluit()}_naam(e){return this.nameOverrides?.[e]||this._stateVan(e)?.attributes?.friendly_name||e}render(){return x`
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
    `}_renderInhoud(){return this._toestand===en?x`<div class="inhoud">Bezig met laden…</div>`:this._toestand===ci?x`
        <div class="inhoud">
          <ha-alert alert-type="error">${this._melding}</ha-alert>
        </div>
      `:x`
      <div class="inhoud">
        <ha-tab-group>
          ${this._scenes.map((e,t)=>x`
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

        ${this._melding?x`<ha-alert alert-type="error">${this._melding}</ha-alert>`:g}
        ${this._leden.length===0?x`<ha-alert alert-type="info">
              Deze lichtgroep bevat geen lampen.
            </ha-alert>`:x`<div class="lampen">
              ${this._leden.map(e=>this._renderLamp(e))}
            </div>`}
      </div>
    `}_renderLamp(e){let t=this._stateVan(e),n=this._besturingVan(e),s=this._waardeVan(e),r=Zt(s,t,n),a=Zn(s,t,n);return x`
      <div class="lamp">
        <div class="kop">
          <div class="naam">
            <span class="tekst">
              ${this._naam(e)}
              ${n.bekend?n.beschikbaar?g:x`<span class="hint">niet bereikbaar</span>`:x`<span class="hint">lamp niet gevonden</span>`}
            </span>
            ${Xt(s)?g:x`<span class="nieuw">nieuw</span>`}
          </div>
          ${n.bekend?x`
                <div class="bediening">
                  ${a.kleurkeuze?this._renderKleurkeuze(e,t,n,s,a.stand):g}
                  <ha-switch
                    .checked=${r}
                    @change=${o=>this._zetLamp(e,Wn(s,o.target.checked,t,n))}
                  ></ha-switch>
                </div>
              `:g}
        </div>
        ${this._renderBesturing(e,t,n,s,a)}
      </div>
    `}_renderBesturing(e,t,n,s,r){return x`
      ${r.helderheid?this._renderHelderheid(e,t,n,s):g}
      ${r.kleurtemp?this._renderKleurtemp(e,t,n,s):g}
      ${r.kleur?this._renderKleur(e,t,n,s):g}
    `}_renderHelderheid(e,t,n,s){let r=Qn(qn(s,t,n)),a=o=>{o.stopPropagation(),this._zetLamp(e,Gn(this._waardeVan(e),ei(o.detail.value),t,n))};return x`
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
          @slider-moved=${a}
          @value-changed=${a}
        ></ha-control-slider>
      </div>
    `}_renderKleurkeuze(e,t,n,s,r){let a=o=>c=>{c.stopPropagation(),o!==r&&this._zetLamp(e,Jn(this._waardeVan(e),o,t,n))};return x`
      <div class="kleurkeuze">
        <button
          class="keuze ${r===ne?"actief":""}"
          aria-pressed=${r===ne?"true":"false"}
          @click=${a(ne)}
        >
          Kleur
        </button>
        <button
          class="keuze ${r==="wit"?"actief":""}"
          aria-pressed=${r==="wit"?"true":"false"}
          @click=${a("wit")}
        >
          Wit
        </button>
      </div>
    `}_renderKleurtemp(e,t,n,s){let r=Ft(s,t,n),a=o=>{o.stopPropagation(),this._zetLamp(e,Gt(this._waardeVan(e),o.detail.value,t,n))};return x`
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
          style=${`--control-slider-background: ${ti(n.minKelvin,n.maxKelvin)}; --control-slider-background-opacity: 1`}
          @slider-moved=${a}
          @value-changed=${a}
        ></ha-control-slider>
      </div>
    `}_renderKleur(e,t,n,s){let[r,a]=st(s,t,n),o=c=>l=>{l.stopPropagation();let p=st(this._waardeVan(e),t,n),h=c==="tint"?[l.detail.value,p[1]]:[p[0],l.detail.value];this._zetLamp(e,qt(this._waardeVan(e),h,t,n))};return x`
      <div class="besturing">
        <div class="label">
          <span>Kleur</span><span>${r}° / ${a} %</span>
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
              style=${`--control-slider-background: ${fs}; --control-slider-background-opacity: 1`}
              @slider-moved=${o("tint")}
              @value-changed=${o("tint")}
            ></ha-control-slider>
            <ha-control-slider
              touch-action="pan-y"
              .min=${0}
              .max=${100}
              .step=${1}
              .value=${a}
              style=${`--control-slider-color: hsl(${r}, 100%, 50%)`}
              @slider-moved=${o("verzadiging")}
              @value-changed=${o("verzadiging")}
            ></ha-control-slider>
          </div>
          <div
            class="staal"
            style=${`background: hsl(${r}, ${a}%, 50%)`}
          ></div>
        </div>
      </div>
    `}};v(le,"properties",{hass:{attribute:!1},entityId:{attribute:!1},nameOverrides:{attribute:!1},_scenes:{state:!0},_leden:{state:!0},_tab:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0}}),v(le,"styles",[oe,G`
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
    `]);var bs="0.1.0",_s=["type","entity","name_overrides"],nn="laden",Ee="klaar",sn="leeg",rn="geen-groep",li="opslagfout",di="fout",Se=class extends P{constructor(){super(),this._scenes=null,this._leden=[],this._toestand=nn,this._melding="",this._bezig=!1,this._editorOpen=!1,this._opgehaaldVoor=null,this._bestondVorigeKeer=!1}static getConfigElement(){return document.createElement(Jt)}static getStubConfig(e){return{entity:Object.keys(e?.states??{}).find(n=>n.startsWith("light.")&&Array.isArray(e.states[n].attributes?.entity_id))??""}}setConfig(e){if(!e?.entity)throw new Error("Kies een lichtgroep bij 'entity'.");let t=Object.keys(e).filter(n=>!_s.includes(n)&&!ri.includes(n));t.length&&console.warn(`${rt}: onbekende sleutels in de configuratie: ${t.join(", ")}`),this._config=e}getCardSize(){return 1}getGridOptions(){return{rows:"auto",columns:"full",min_columns:6}}willUpdate(){let e=this._config?.entity;if(!this.hass||!e)return;let t=!!this.hass.states[e];if(this._opgehaaldVoor!==e){this._opgehaaldVoor=e,this._bestondVorigeKeer=t,this._haalScenesOp();return}if(t&&!this._bestondVorigeKeer&&this._toestand===rn){this._bestondVorigeKeer=!0,this._haalScenesOp();return}this._bestondVorigeKeer=t}async _haalScenesOp(){let e=this._config.entity;this._toestand=nn,this._melding="";try{let t=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:e});this._scenes=t.scenes,this._leden=t.member_entity_ids??[],this._toestand=this._leden.length===0?sn:Ee}catch(t){this._verwerkFout(t,e)}}_verwerkFout(e,t){let n=e?.code;if(this._melding=e?.message??String(e),n==="home_assistant_error"){this._toestand=li;return}if(!this.hass.states[t]){this._toestand=rn;return}this._toestand=di}_naam(e){return this._config?.name_overrides?.[e]||this.hass?.states?.[e]?.attributes?.friendly_name||e}async _pasSceneToe(e){if(this._bezig||this._toestand!==Ee)return;let{oproepen:t}=tt({scene:this._scenes?.[e],memberEntityIds:this._leden,states:this.hass.states});if(t.length){this._bezig=!0;try{let n=await nt((s,r)=>this.hass.callService("light",s,r),t);n.length&&this._meldMislukking(n.map(s=>s.entityId))}finally{this._bezig=!1}}}_meldMislukking(e){let t=e.map(s=>this._naam(s)).join(", "),n=e.length===1?`${t} reageerde niet.`:`Deze lampen reageerden niet: ${t}.`;this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:n},bubbles:!0,composed:!0}))}_bewerk(){this._toestand===Ee&&(this._editorOpen=!0)}_sluitEditor(){this._editorOpen=!1}_scenesOpgeslagen(e){e.stopPropagation(),this._scenes=e.detail.scenes,this._leden=e.detail.member_entity_ids??[],this._toestand=this._leden.length===0?sn:Ee}render(){if(!this._config)return g;switch(this._toestand){case rn:return this._renderFout(`Lichtgroep ${this._config.entity} bestaat niet (meer). Pas de kaart aan.`);case li:return this._renderFout("De opgeslagen scenes van deze kamer zijn onleesbaar.",this._melding);case di:return this._renderFout("De scenes konden niet geladen worden.",this._melding);default:return this._renderKaart()}}_renderFout(e,t){return x`
      <div class="needs">
        <span class="mark">${this._icoon("question")}</span>
        <span>
          <b>${e}</b>
          ${t?x`<span class="detail">${t}</span>`:g}
        </span>
      </div>
    `}_icoon(e){let t=document.createElement("template");return t.innerHTML=M(e),t.content.cloneNode(!0)}_renderKaart(){let e=this._toestand===sn,t=this._toestand===nn,n=this._iconen();return x`
      <div class="card surface">
        <div class="rij">
          <div class="scenes">
            ${n.map((s,r)=>x`
                <button
                  type="button"
                  class="chip"
                  ?disabled=${e||t||this._bezig}
                  aria-label=${`Scene ${r+1}`}
                  title=${`Scene ${r+1}`}
                  @click=${()=>this._pasSceneToe(r)}
                >
                  ${this._icoon(s)}
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
            ${this._icoon(si)}
          </button>
        </div>
        ${e?x`<div class="mededeling">Deze lichtgroep bevat geen lampen.</div>`:this._renderNieuweLampen()}
      </div>
      ${this._editorOpen?this._renderEditor():g}
    `}_renderNieuweLampen(){if(this._toestand!==Ee)return g;let e=Fn(this._scenes,this._leden,3).length,t=Xn(e);return t?x`<div class="mededeling">${t}</div>`:g}_renderEditor(){return x`
      <domotiapp-scene-editor
        .hass=${this.hass}
        .entityId=${this._config.entity}
        .nameOverrides=${this._config.name_overrides}
        @editor-gesloten=${this._sluitEditor}
        @scenes-opgeslagen=${this._scenesOpgeslagen}
      ></domotiapp-scene-editor>
    `}_iconen(){return Array.from({length:3},(e,t)=>this._scenes?.[t]?.icon||$e[t])}};v(Se,"properties",{hass:{attribute:!1},_config:{state:!0},_scenes:{state:!0},_leden:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0},_editorOpen:{state:!0}}),v(Se,"styles",[oe,G`
      :host { display: block; }

      /* Dezelfde maat als elke andere regelkaart in de familie: 56px is één
         rij in HA's sections-raster, zodat een scenekaart naast een knopkaart
         geen halve regel verschilt. */
      .card {
        min-height: 56px;
        padding: 7px 12px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
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
      .chip:hover {
        box-shadow: 0 0 14px -2px color-mix(in srgb, var(--tone) 55%, transparent);
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
      .potlood:hover {
        background: var(--dac-surface-hi);
        box-shadow: none;
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
    `]);I(rt,Se);I(Jt,ce);I(ii,le);je({type:rt,name:"DomotiApp Scene",description:`Drie lichtscenes per kamer, vastgelegd bij de lichtgroep (v${bs}).`,preview:!1});var vs="0.1.0";un(i=>console.warn(`domotiapp-lovelace: ${i}`));console.info(`%c DOMOTIAPP-LOVELACE %c ${vs} `,"background:#026fa1;color:#e8e4de;font-weight:600;border-radius:3px 0 0 3px;padding:2px 6px","background:#12120f;color:#e8e4de;border-radius:0 3px 3px 0;padding:2px 6px");export{vs as VERSION};
