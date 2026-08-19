var ga=Object.defineProperty;var fa=(i,e,t)=>e in i?ga(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var v=(i,e,t)=>fa(i,typeof e!="symbol"?e+"":e,t);var ee=`
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
`,Be=`
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
`;function he(i){let e=new CSSStyleSheet;return e.replaceSync(i),e}var K=i=>String(i??"").split(".")[0],_=(i,e)=>e&&i?.states?.[e]||null,T=(i,e)=>_(i,e)?.attributes??{},ue=(i,e,t)=>t?null:T(i,e).entity_picture||null;function Fe(i){if(!i||i.state!=="on")return null;let e=i.attributes??{};if(Array.isArray(e.entity_id))return null;let t=e.rgb_color;return Array.isArray(t)&&t.length>=3?`rgb(${t[0]},${t[1]},${t[2]})`:null}function C(i,e,t){return t||T(i,e).friendly_name||e||""}var ba=new Set(["scene","script","input_button","button","event"]),Se=i=>ba.has(K(i));function R(i){return!i||i.state==="unavailable"?!0:i.state==="unknown"?!Se(i.entity_id):!1}function me(i){if(!i)return!1;let e=i.state;if(e==="unavailable"||e==="unknown")return!1;switch(K(i.entity_id)){case"cover":return e==="open"||e==="opening";case"alarm_control_panel":return e.startsWith("armed")||e==="triggered"||e==="arming";case"climate":case"water_heater":case"humidifier":return e!=="off";case"person":case"device_tracker":return e==="home";case"media_player":return e!=="off"&&e!=="idle"&&e!=="standby";default:return e==="on"||e==="playing"||e==="active"||e==="heat"}}var va=new Set(["light","switch","fan","input_boolean","automation","siren","humidifier","remote","water_heater"]),Ze=i=>va.has(K(i));function Pn(i,e,t){if(!i||i.themes!==e.themes||i.language!==e.language)return!0;for(let n of t)if(n&&i.states?.[n]!==e.states?.[n])return!0;return!1}function qe(i,e,t={}){i.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!1}))}var Y=(i,e)=>qe(i,"hass-more-info",{entityId:e});function ge(i){switch(K(i)){case"light":case"switch":case"fan":case"input_boolean":case"automation":case"siren":return{action:"toggle"};case"script":case"scene":case"input_button":case"button":return{action:"toggle"};default:return{action:"more-info"}}}function _a(i){switch(K(i)){case"scene":return["scene","turn_on"];case"script":return["script","turn_on"];case"input_button":return["input_button","press"];case"button":return["button","press"];case"lock":return["lock","open"];case"cover":return["cover","toggle"];case"media_player":return["media_player","media_play_pause"];default:return["homeassistant","toggle"]}}function fe(i,e,t,n){if(!(!n||n.action==="none"))switch(n.action){case"more-info":Y(i,n.entity||t.entity);break;case"toggle":{let a=n.entity||t.entity;if(!a)break;let[o,s]=_a(a);e.callService(o,s,{entity_id:a});break}case"perform-action":case"call-service":{let a=n.perform_action||n.service;if(!a)break;let[o,s]=a.split(".");e.callService(o,s,n.data??n.service_data??{},n.target);break}case"navigate":if(!n.navigation_path)break;history.pushState(null,"",n.navigation_path),qe(window,"location-changed",{replace:!1});break;case"url":n.url_path&&window.open(n.url_path,n.target??"_blank");break;case"assist":qe(i,"show-dialog",{dialogTag:"ha-voice-command-dialog",dialogImport:()=>{},dialogParams:{}});break;case"fire-dom-event":qe(i,"ll-custom",n);break;default:break}}function L(i,{onTap:e,onHold:t,onDouble:n}){let s=0,r=0,c=null,l=u=>{u.button!=null&&u.button!==0||(s=Date.now())},p=()=>{let u=s?Date.now()-s:0;if(s=0,t&&u>=500){navigator.vibrate?.(18),t();return}if(!n){e?.();return}if(r++,r===1){c=setTimeout(()=>{r=0,e?.()},260);return}clearTimeout(c),r=0,n()};return i.addEventListener("pointerdown",l),i.addEventListener("click",p),i.addEventListener("contextmenu",u=>u.preventDefault()),()=>{clearTimeout(c),i.removeEventListener("pointerdown",l),i.removeEventListener("click",p)}}function U(i,e){if(!e)return"";let t=K(e.entity_id),n=e.attributes.device_class;return i.formatEntityState?.(e)??i.localize?.(`component.${t}.entity_component.${n??"_"}.state.${e.state}`)??i.localize?.(`component.${t}.entity_component._.state.${e.state}`)??e.state}function G(i,e,t){let n=Number(e);return Number.isFinite(n)?n.toLocaleString(i?.locale?.language??"nl",{minimumFractionDigits:t??0,maximumFractionDigits:t??0}):"--"}var Dn=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],Vn=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"],In=(i=new Date)=>new Date(i.getFullYear(),i.getMonth(),i.getDate()),zt=(i,e)=>Math.round((In(e)-In(i))/864e5);function Ae(i){if(!i)return null;if(i instanceof Date)return Number.isNaN(+i)?null:i;let e=String(i).trim(),t=e.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);if(t)return new Date(+t[3],+t[2]-1,+t[1]);if(t=e.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/),t)return new Date(+t[1],+t[2]-1,+t[3]);let n=new Date(e);return Number.isNaN(+n)?null:n}function Mt(i,e=new Date){if(!i)return"";let t=zt(e,i);return t<0?`${Math.abs(t)} dagen geleden`:t===0?"vandaag":t===1?"morgen":t===2?"overmorgen":t<=6?Dn[i.getDay()]:`${Dn[i.getDay()].slice(0,2)} ${i.getDate()} ${Vn[i.getMonth()]}`}var Rn=i=>i?`${i.getDate()} ${Vn[i.getMonth()]}`:"";var xa="home-assistant";function Hn({leesRegistry:i,definities:e,waarschuw:t=()=>{},plan:n=(c,l)=>setTimeout(c,l),nu:a=()=>Date.now(),marker:o=xa,intervalMs:s=20,maxWachtMs:r=1e4}){let c=a();function l(){let m=i();if(!m)return!1;for(let[x,h]of e)try{m.get(x)||m.define(x,h)}catch(k){t(`kon ${x} niet registreren: ${k&&k.message}`)}return!0}function p(){let m=i();return!m||!m.get(o)?!1:l()}if(p())return!0;let u=()=>{if(!p()){if(a()-c>=r){t(`${o} is na ${r} ms niet verschenen; de kaart wordt alsnog geregistreerd`),l();return}n(u,s)}};return n(u,s),!1}var Kn=[];function D(i,e){Kn.push([i,e])}function be({type:i,name:e,description:t,preview:n=!0,documentationURL:a}){window.customCards=window.customCards??[],!window.customCards.some(o=>o.type===i)&&window.customCards.push({type:i,name:e??i,description:t??"",preview:n,documentationURL:a??"https://github.com/Sven2410/domotiapp-lovelace"})}function Un(i=()=>{}){Hn({leesRegistry:()=>globalThis.customElements,definities:Kn,waarschuw:i})}var ka=`
  :host {
    ${ee}
    display: block;
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  :host([hidden]) { display: none; }
`,H={accent:"var(--dac-accent-hi)",solar:"var(--dac-solar)",house:"var(--dac-house)",water:"var(--dac-grid-in)",magenta:"var(--dac-grid-out)",pink:"var(--dac-device-1)",teal:"var(--dac-device-2)",lit:"var(--dac-lit)",good:"var(--dac-good)",warn:"var(--dac-warn)",bad:"var(--dac-bad)",neutral:"var(--dac-ink-3)"},Xe={accent:"Accent",solar:"Oranje",house:"Blauw",water:"Lichtblauw",magenta:"Magenta",pink:"Roze",teal:"Groenblauw",lit:"Lampgeel",good:"Goed",warn:"Let op",bad:"Kritiek",neutral:"Neutraal"},N=(i,e="accent")=>H[i]??(i&&/[#(]|^var/.test(i)?i:H[e]),I=Symbol("incomplete"),ya=i=>`
  <div class="needs">
    <span class="mark"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6"/>
      <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>
    </svg></span>
    <span><b>Nog niets gekozen</b><span>${i}</span></span>
  </div>`,wa=56,Wn=8,te=i=>Math.max(1,Math.ceil((i+Wn)/(wa+Wn))),A=class extends HTMLElement{static get styleSheets_(){return Object.hasOwn(this,"sheets_")||(this.sheets_=[he(ka+Be+this.css)]),this.sheets_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=new.target.styleSheets_,this.built_=!1,this.wired_=!1,this.teardown_=[]}setConfig(e){let t=this.validate(e??{});this.config=t,this.built_&&(this.destroy_(),this.shadowRoot.replaceChildren(),this.built_=!1,this.wired_=!1),this.isConnected&&this.build_()}set hass(e){let t=this.hass_;if(this.hass_=e,!!this.config){if(!this.built_){this.build_();return}this.config[I]||Pn(t,e,this.watched())&&this.paint()}}get hass(){return this.hass_}connectedCallback(){if(this.config){if(!this.built_){this.build_();return}this.config[I]||this.wired_||(this.wire(),this.wired_=!0,this.hass_&&this.paint())}}disconnectedCallback(){this.destroy_(),this.wired_=!1}validate(e){return e}watched(){return this.config?.entity?[this.config.entity]:[]}template(){return""}wire(){}paint(){}build_(){let e=document.createElement("template"),t=this.config?.[I];e.innerHTML=t?ya(t):this.template(),this.shadowRoot.appendChild(e.content),this.built_=!0,!t&&(this.wire(),this.wired_=!0,this.hass_&&this.paint())}destroy_(){for(let e of this.teardown_)try{e()}catch{}this.teardown_=[]}on(e,t,n,a){e&&(e.addEventListener(t,n,a),this.teardown_.push(()=>e.removeEventListener(t,n,a)))}$(e){return this.shadowRoot.querySelector(e)}$$(e){return[...this.shadowRoot.querySelectorAll(e)]}text(e,t){let n=typeof e=="string"?this.$(e):e;n&&n.textContent!==String(t)&&(n.textContent=t)}getCardSize(){return 1}};v(A,"css","");function M(i,e,{name:t,description:n,preview:a=!0}={}){D(i,e),be({type:i,name:t,description:n,preview:a})}function O(i,e){D(i,e)}var d=(i,e="none")=>`<svg class="icon" viewBox="0 0 24 24" fill="${e}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${i}</svg>`,E={house:d(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
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
    <path d="M6.2 12.2h4.4M6.2 16h4.4"/>`),play:d('<path d="M8.6 5.8 18.4 12l-9.8 6.2z"/>'),pause:d('<path d="M9.6 5.8v12.4M14.4 5.8v12.4"/>'),next:d('<path d="m6.4 6.4 8.2 5.6-8.2 5.6z"/><path d="M17.6 6.2v11.6"/>'),prev:d('<path d="m17.6 6.4-8.2 5.6 8.2 5.6z"/><path d="M6.4 6.2v11.6"/>'),volume:d(`<path d="M4.4 9.4h3.2L12 5.9v12.2L7.6 14.6H4.4z"/>
    <path d="M15.4 9.6a3.4 3.4 0 0 1 0 4.8"/>
    <path d="M17.9 7.1a7 7 0 0 1 0 9.8"/>`),volumeMute:d(`<path d="M4.4 9.4h3.2L12 5.9v12.2L7.6 14.6H4.4z"/>
    <path d="m15.8 9.8 4.4 4.4M20.2 9.8l-4.4 4.4"/>`),music:d(`<path d="M9.6 17.4V6.4l8.2-1.6v11"/>
    <ellipse cx="7.6" cy="17.6" rx="2.2" ry="1.9"/>
    <ellipse cx="15.8" cy="15.8" rx="2.2" ry="1.9"/>`),leaf:d(`<path d="M4.6 19.6c-1.4-7.6 3.4-14 14.9-15.2 1.1 8.4-3.3 15.3-14.9 15.2Z"/>
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
    <path d="M10 9.5a2 2 0 1 1 1.8 2.6 2.1 2.1 0 1 1-1.7 2.7"/>`),vier:d(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M13.4 8.6 9.7 13.3h5"/>
    <path d="M13.4 8.6v6.9"/>`),vijf:d(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M14 8.7h-3.6v3.1h1.4a2.1 2.1 0 1 1-2 2.8"/>`),zes:d(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M13.8 9a2.2 2.2 0 0 0-3.7 1.7v2.4"/>
    <circle cx="12.1" cy="13.4" r="2.1"/>`),zeven:d(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M9.7 8.7h4.6l-2.8 6.8"/>`),acht:d(`<circle cx="12" cy="12" r="8.6"/>
    <circle cx="12" cy="10.3" r="1.7"/>
    <circle cx="12" cy="13.8" r="1.9"/>`),negen:d(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10.2 15a2.2 2.2 0 0 0 3.7-1.7v-2.4"/>
    <circle cx="11.9" cy="10.6" r="2.1"/>`),tien:d(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M8.6 10.3 10 9.2v5.7"/>
    <ellipse cx="13.9" cy="12.1" rx="1.7" ry="2.8"/>`)};function w(i,e="question"){return i?E[i]?E[i]:i.includes(":")?`<ha-icon class="icon" icon="${i}"></ha-icon>`:E[e]??E.question:E[e]??E.question}function ze(i,e={}){switch(String(i??"").split(".")[0]){case"light":return"bulb";case"switch":return"switchOn";case"cover":return e.device_class==="awning"||e.device_class==="blind"?"awning":"shutter";case"person":case"device_tracker":return"person";case"climate":return"thermo";case"binary_sensor":return e.device_class==="smoke"?"smoke":"shield";case"alarm_control_panel":return"shield";case"scene":case"script":case"input_button":case"button":return"star";case"weather":return"cloudSun";case"media_player":return e.device_class==="tv"?"tv":e.device_class==="receiver"?"radio":"speaker";default:return"question"}}function Gn(i){switch(i){case"sunny":case"clear-night":return"sun";case"partlycloudy":return"cloudSun";case"cloudy":return"cloud";case"rainy":case"pouring":case"hail":case"lightning":case"lightning-rainy":return"rain";case"snowy":case"snowy-rainy":return"snow";case"fog":return"fog";case"windy":case"windy-variant":return"wind";default:return"cloud"}}var $a=[["Woning",["house","floorB","floor1","floor2","garage","door","window","grid"]],["Rolluiken",["shutter","shutterOpen","awning","garageOpen","garageClosed","arrowUp","arrowDown","stop"]],["Licht en stroom",["bulb","bulbGroup","switchOn","power","plug","bolt","battery"]],["Personen",["person","people","away"]],["Apparaten",["tv","speaker","camera","car","washer","dishwasher","printer","fan","airco","radio"]],["Media",["play","pause","next","prev","volume","volumeMute","music","speaker","tv","radio"]],["Afval",["bin","binWheeled","calendar"]],["Weer",["sun","cloud","cloudSun","rain","snow","fog","wind","drop","uv","sunrise","sunset","thermo"]],["Status",["shield","lock","lockOpen","key","wifi","smoke","warning","check","close","clock","gaugeArrow"]],["Cijfers",["een","twee","drie","vier","vijf","zes","zeven","acht","negen","tien"]],["Overig",["star","moon","leaf","cog","dots","plus","minus","chevronRight","chevronDown","question","pencil"]]],Ea=`
  :host { ${ee} display: block; font-family: var(--dac-font); }
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
`,jt=null,Tt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),jt=jt??[he(Ea)],this.shadowRoot.adoptedStyleSheets=jt,this.value_="",this.label="Icoon",this.fallback="question",this.auto=!0}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}connectedCallback(){this.built_||(this.built_=!0,this.build_())}build_(){this.shadowRoot.innerHTML=`
      <div class="label"></div>
      <div class="box">
        <button type="button" class="current" aria-expanded="false">
          <span class="preview"></span>
          <span class="who"><b></b><small></small></span>
          <span class="caret">${E.chevronDown}</span>
        </button>
        <div class="panel">
          ${$a.map(([t,n])=>`
            <div class="group">
              <h4>${t}</h4>
              <div class="grid">
                ${n.map(a=>`<button type="button" class="opt" data-icon="${a}" title="${a}" aria-pressed="false">${E[a]??""}</button>`).join("")}
              </div>
            </div>`).join("")}
          <div class="mdi">
            <label for="mdi">Of Home Assistant-icoon</label>
            <input id="mdi" type="text" placeholder="mdi:washing-machine" spellcheck="false" />
            <button type="button" class="clear">Wissen</button>
          </div>
        </div>
      </div>`,this.$(".current").addEventListener("click",()=>{let t=this.toggleAttribute("open");this.$(".current").setAttribute("aria-expanded",String(t))}),this.shadowRoot.querySelectorAll(".opt").forEach(t=>t.addEventListener("click",()=>this.emit_(t.dataset.icon)));let e=this.$("#mdi");e.addEventListener("change",()=>this.emit_(e.value.trim())),this.$(".clear").addEventListener("click",()=>this.emit_("")),this.paint_()}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Icoon";let e=this.value_,t=e||this.fallback||"question";this.$(".preview").innerHTML=w(t,this.fallback),this.$(".who b").textContent=e||(this.auto?"Automatisch":"Kies een icoon"),this.$(".who small").textContent=e?e.includes(":")?"Home Assistant-icoon":"DomotiApp-icoon":this.auto?"Past zich aan de entiteit aan":"Nog niets gekozen",this.shadowRoot.querySelectorAll(".opt").forEach(o=>o.setAttribute("aria-pressed",String(o.dataset.icon===e)));let n=this.$("#mdi");if(this.shadowRoot.activeElement===n)return;let a=e&&e.includes(":")?e:"";n.value!==a&&(n.value=a)}emit_(e){this.value_=e,this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};D("dac-icon-picker",Tt);var Sa=["accent","solar","house","water","magenta","pink","teal","lit","neutral"],Aa=["good","warn","bad"],za=/^(#[0-9a-f]{3,8}|var\(--[\w-]+\)|rgba?\([^)]*\))$/i,Ma=`
  :host { ${ee} display: block; font-family: var(--dac-font); }
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
`,Ct=null,Nt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),Ct=Ct??[he(Ma)],this.shadowRoot.adoptedStyleSheets=Ct,this.value_="",this.label="Kleur",this.statuses=!1}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}set compact(e){this.toggleAttribute("compact",!!e)}get compact(){return this.hasAttribute("compact")}connectedCallback(){this.built_||(this.built_=!0,this.build_())}eigen_(){return!!this.value_&&!(this.value_ in H)}swatch(e){return`<button type="button" class="sw" data-tone="${e}" style="--c:${H[e]}"
      title="${Xe[e]}" aria-label="${Xe[e]}" aria-pressed="false">${E.check}</button>`}build_(){this.shadowRoot.innerHTML=`
      <div class="label"></div>
      <div class="box">
        ${this.statuses?"<h4>Identiteit</h4>":""}
        <div class="row">
          <button type="button" class="sw auto" data-tone="" title="Automatisch"
            aria-label="Automatisch" aria-pressed="false">${E.check}</button>
          ${Sa.map(n=>this.swatch(n)).join("")}
          <span class="sw eigen leeg" title="Eigen kleur" aria-pressed="false">
            ${E.check}
            <input type="color" aria-label="Eigen kleur kiezen" />
          </span>
        </div>
        ${this.statuses?`<h4>Status</h4>
               <div class="row">${Aa.map(n=>this.swatch(n)).join("")}</div>
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
      </div>`,this.shadowRoot.querySelectorAll("button.sw").forEach(n=>n.addEventListener("click",()=>this.emit_(n.dataset.tone)));let e=this.$('input[type="color"]');e.addEventListener("input",()=>this.emit_(e.value));let t=this.$("#vrij");t.addEventListener("change",()=>{let n=t.value.trim();if(!n){this.emit_("");return}let a=za.test(n);t.setAttribute("aria-invalid",String(!a)),a&&this.emit_(n)}),this.$(".wissen").addEventListener("click",()=>this.emit_("")),this.paint_()}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Kleur";let e=this.eigen_();this.shadowRoot.querySelectorAll("button.sw").forEach(a=>a.setAttribute("aria-pressed",String((a.dataset.tone||"")===this.value_)));let t=this.$(".eigen");t.setAttribute("aria-pressed",String(e)),t.classList.toggle("leeg",!e),t.style.setProperty("--c",e?this.value_:"transparent"),t.title=e?`Eigen kleur: ${this.value_}`:"Eigen kleur",e&&/^#[0-9a-f]{6}$/i.test(this.value_)&&(this.$('input[type="color"]').value=this.value_);let n=this.$("#vrij");if(this.shadowRoot.activeElement!==n){let a=e?this.value_:"";n.value!==a&&(n.value=a),n.setAttribute("aria-invalid","false")}this.$(".chosen").innerHTML=this.value_?e?`Gekozen: <b>${this.value_}</b> &mdash; eigen kleur.`:`Gekozen: <b>${Xe[this.value_]??this.value_}</b>`:"Gekozen: <b>Automatisch</b> &mdash; de kaart kiest op domein en toestand."}emit_(e){this.value_=e??"",this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.value_},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};D("dac-tone-picker",Nt);var b={entity:i=>({entity:i?{domain:i}:{}}),text:()=>({text:{}}),multiline:()=>({text:{multiline:!0}}),bool:()=>({boolean:{}}),number:(i,e,t=1)=>({number:{min:i,max:e,step:t,mode:"box"}}),select:i=>({select:{mode:"dropdown",options:i}}),action:(i="more-info")=>({ui_action:{default_action:i}})},Ot=(...i)=>({type:"grid",name:"",schema:i});var j=class extends HTMLElement{constructor(){super(),this.config_={},this.built_=!1}setConfig(e){this.config_={...this.defaults(),...e},this.render_()}defaults(){return{}}set hass(e){this.hass_=e,this.form_&&(this.form_.hass=e);for(let t of this.pickers_??[])t.hass=e;this.render_()}get hass(){return this.hass_}connectedCallback(){this.render_()}schema(){return[]}pickers(){return[]}label(e){return Lt[e.name]??e.name}helper(){}async render_(){if(!this.hass_||!this.config_)return;if(this.built_){this.sync_();return}this.built_=!0,await customElements.whenDefined("ha-form"),this.replaceChildren(),this.pickers_=[];let e=this.pickers();this.pickerSig_=e.map(s=>s.key).join("|");let t=s=>{let r=document.createElement("div");return r.style.cssText=`display:flex;flex-direction:column;gap:12px;${s}`,r},n=t("margin-bottom:16px"),a=t("margin-top:16px");for(let s of e){let r=document.createElement(s.kind==="tone"?"dac-tone-picker":"dac-icon-picker");r.label=s.label,r.fallback=s.fallback,s.auto===!1&&(r.auto=!1),s.statuses===!1&&(r.statuses=!1),s.compact&&(r.compact=!0),r.hass=this.hass_,r.value=this.config_[s.key],r.addEventListener("value-changed",c=>{c.stopPropagation(),this.patch_({[s.key]:c.detail.value})}),this.pickers_.push(r),r.dataset.key=s.key,(s.after?a:n).appendChild(r)}n.children.length&&this.appendChild(n);let o=document.createElement("ha-form");o.hass=this.hass_,o.data=this.config_,o.schema=this.schema(),o.computeLabel=s=>this.label(s),o.computeHelper=s=>this.helper(s),o.addEventListener("value-changed",s=>{s.stopPropagation(),this.patch_(s.detail.value,!0)}),this.form_=o,this.appendChild(o),a.children.length&&this.appendChild(a)}sync_(){let e=this.pickers().map(t=>t.key).join("|");if(this.pickerSig_!==void 0&&this.pickerSig_!==e){this.built_=!1,this.form_=null,this.render_();return}this.form_&&(this.form_.hass=this.hass_,this.form_.schema=this.schema(),this.form_.data=this.config_);for(let t of this.pickers_??[])t.hass=this.hass_,t.value=this.config_[t.dataset.key]}patch_(e,t=!1){let n=t?{...e}:{...this.config_,...e};this.config_.type&&(n.type=this.config_.type);for(let[a,o]of Object.entries(n))(o===""||o===void 0||o===null)&&delete n[a];this.config_=n,this.sync_(),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.serialize(n)},bubbles:!0,composed:!0}))}serialize(e){return e}},Lt={entity:"Entiteit",entities:"Entiteiten",name:"Naam",icon:"Icoon",tone:"Kleur",secondary:"Tweede regel",layout:"Vorm",tap_action:"Tikken",hold_action:"Vasthouden",double_tap_action:"Dubbeltikken",show_state:"Status tonen",show_name:"Naam tonen",show_icon:"Icoon tonen",fill:"Vullen",collapsible:"Inklapbaar",title:"Titel",subtitle:"Ondertitel",weather:"Weerentiteit",sun:"Zon-entiteit",person:"Persoon",persons:"Personen",covers:"Rolluiken",lights:"Lampen",sensors:"Sensoren",greeting:"Begroeting",show_clock:"Klok tonen",show_weather:"Weer tonen",show_chips:"Weerdetails tonen",compact:"Compact",columns:"Kolommen",group:"Groepsregel tonen",invert:"Open en dicht omdraaien",label:"Label",color:"Kleur",date_format:"Datumnotatie"};function ja(i=new Date){let e=i.getHours();return e<6?"Goedenacht":e<12?"Goedemorgen":e<18?"Goedemiddag":"Goedenavond"}var Ta=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],Ca=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],Dt={humidity:{icon:"drop",tone:"water",label:"Luchtvochtigheid"},wind:{icon:"wind",tone:"neutral",label:"Wind"},uv:{icon:"uv",tone:"solar",label:"UV-index"},precipitation:{icon:"rain",tone:"water",label:"Neerslag"},pressure:{icon:"gaugeArrow",tone:"neutral",label:"Luchtdruk"},sunrise:{icon:"sunrise",tone:"warn",label:"Zonsopkomst"},sunset:{icon:"sunset",tone:"warn",label:"Zonsondergang"}},Na=["humidity","wind","uv","precipitation","sunset"],Oa=i=>i==null||Number.isNaN(+i)?"":["N","NO","O","ZO","Z","ZW","W","NW"][Math.round(+i/45)%8],Ye=class extends A{validate(e){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768,...e}}watched(){let e=this.config;return[e.weather,e.weather_uv,e.sun,e.precipitation_entity].filter(Boolean)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.show_rule===!1&&this.setAttribute("no-rule",""),`
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
      </div>`}wire(){let e=()=>{let n=6e4-Date.now()%6e4+50;this.timer_=setTimeout(()=>{this.paintClock_(),e()},n)};e(),this.teardown_.push(()=>clearTimeout(this.timer_));let t=Number(this.config.hide_below)||0;if(t>0){let n=matchMedia(`(max-width: ${t-1}px)`),a=()=>this.toggleAttribute("narrow",n.matches);a(),n.addEventListener("change",a),this.teardown_.push(()=>n.removeEventListener("change",a))}}paintClock_(){let e=new Date,t=this.config.name??this.hass?.user?.name??"",n=ja(e);this.$(".hello").innerHTML=t?`${n}, <b>${t}</b>`:n,this.text(".date",`${Ta[e.getDay()]} ${e.getDate()} ${Ca[e.getMonth()]}`);let a=this.$(".clock");a&&this.text(a,e.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"}))}paint(){this.paintClock_();let e=this.config,t=_(this.hass,e.weather),n=T(this.hass,e.weather),a=this.$(".now");if(a&&t){let c=Gn(t.state);a.style.setProperty("--wtone",N(e.tone,"water"));let l=this.hass?.config?.unit_system?.temperature??"\xB0C";this.$(".temp").innerHTML=n.temperature!=null?`${G(this.hass,n.temperature,0)}<span>${l}</span>`:"--";let p=a.querySelector(".ic");p.dataset.icon!==c&&(p.dataset.icon=c,p.innerHTML=w(c,"cloud")),this.text(a.querySelector(".cond"),U(this.hass,t))}let o=this.$(".chips");if(!o)return;let s=Na.map(c=>this.chip_(c,n)).filter(Boolean),r=s.map(c=>`${c.key}${c.value}`).join("|");o.dataset.sig!==r&&(o.dataset.sig=r,o.innerHTML=s.map(c=>`<span class="chip2" style="--tone:${N(Dt[c.key].tone)}" title="${Dt[c.key].label}">
             ${E[Dt[c.key].icon]??""}${c.value}
           </span>`).join(""))}chip_(e,t){let n=this.config;switch(e){case"humidity":return t.humidity!=null?{key:e,value:`${Math.round(t.humidity)}%`}:null;case"wind":{if(t.wind_speed==null)return null;let a=this.hass?.config?.unit_system?.wind_speed??"km/h",o=Oa(t.wind_bearing);return{key:e,value:`${G(this.hass,t.wind_speed,0)} ${a}${o?` ${o}`:""}`}}case"uv":{let o=T(this.hass,n.weather_uv).uv_index??t.uv_index??(n.weather_uv?Number(_(this.hass,n.weather_uv)?.state):null);return o!=null&&!Number.isNaN(+o)?{key:e,value:`UV ${G(this.hass,o,1)}`}:null}case"precipitation":{let a=_(this.hass,n.precipitation_entity);if(a){let o=Number(a.state);if(Number.isNaN(o))return null;let s=a.attributes.unit_of_measurement??"mm";return{key:e,value:`${G(this.hass,o,1)} ${s}`}}return t.precipitation!=null&&!Number.isNaN(+t.precipitation)?{key:e,value:`${G(this.hass,t.precipitation,1)} mm`}:null}case"pressure":return t.pressure!=null?{key:e,value:`${G(this.hass,t.pressure,0)} ${t.pressure_unit??"hPa"}`}:null;case"sunset":case"sunrise":{let o=_(this.hass,n.sun)?.attributes?.[e==="sunset"?"next_setting":"next_rising"];if(!o)return null;let s=new Date(o);return Number.isNaN(+s)?null:{key:e,value:s.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"})}}default:return null}}getCardSize(){return 2}getGridOptions(){return{columns:"full",rows:2,min_rows:2,max_rows:2}}static getConfigElement(){return document.createElement("domotiapp-header-card-editor")}static getStubConfig(e){return{weather:Object.keys(e?.states??{}).find(n=>n.startsWith("weather.")),sun:"sun.sun"}}};v(Ye,"css",`
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
  `);var It=class extends j{defaults(){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768}}pickers(){return[{key:"tone",kind:"tone",label:"Kleur weericoon"}]}schema(){return[Ot({name:"weather",selector:b.entity("weather")},{name:"weather_uv",selector:{entity:{domain:["weather","sensor"]}}}),Ot({name:"sun",selector:b.entity("sun")},{name:"precipitation_entity",selector:b.entity("sensor")}),{name:"name",selector:b.text()},{name:"hide_below",selector:b.number(0,1400,8)}]}label(e){return{weather:"Weer (temperatuur, wind)",weather_uv:"Tweede weerbron (UV-index)",precipitation_entity:"Neerslagsensor",show_rule:"Accentlijn tonen",hide_below:"Verbergen onder breedte (px)",bare:"Zonder kaartrand",name:"Naam"}[e.name]??super.label(e)}helper(e){if(e.name==="weather_uv")return"Alleen voor de UV-index. Handig als je hoofdbron die niet meelevert.";if(e.name==="precipitation_entity")return"Een sensor in mm of mm/h, bijvoorbeeld neerslagintensiteit of regen laatste uur.";if(e.name==="hide_below")return"768 verbergt de header op telefoons en houdt hem op tablets en desktops. 0 zet het uit.";if(e.name==="name")return"Leeg laten voor de naam van de ingelogde gebruiker."}};O("domotiapp-header-card-editor",It);M("domotiapp-header-card",Ye,{name:"DomotiApp Header",description:"Smalle strip met begroeting, weer en klok. Verbergt zichzelf op telefoons."});var Je=class extends A{validate(e){return{icon:"",tone:"accent",line:!0,...e}}watched(){return this.config.secondary_entity?[this.config.secondary_entity]:[]}template(){let e=this.config,t=e.icon!==null&&e.icon!==!1;return t||this.setAttribute("no-icon",""),`
      <div class="sep" style="--tone:${N(e.tone)}">
        ${t?`<span class="chip">${w(e.icon,"star")}</span>`:""}
        <h3></h3>
        ${e.line===!1?"":'<span class="rule"></span>'}
        <span class="sub"><span class="si"></span><span class="sv"></span></span>
      </div>`}paint(){this.text("h3",this.config.name??"");let e=this.$(".sub");if(!e)return;let t=_(this.hass,this.config.secondary_entity),n=e.querySelector(".si"),a=e.querySelector(".sv");if(!t){a.textContent="",n.innerHTML="";return}let o=this.config.secondary_icon??"";n.dataset.icon!==o&&(n.dataset.icon=o,n.innerHTML=o?w(o):"");let s=t.attributes.unit_of_measurement;a.textContent=s?`${t.state} ${s}`:t.attributes.current_temperature!=null?`${t.attributes.current_temperature} \xB0C`:U(this.hass,t)}getCardSize(){return 1}getGridOptions(){return{columns:"full",rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-separator-card-editor")}static getStubConfig(){return{name:"Nieuwe sectie",icon:"house",tone:"accent"}}};v(Je,"css",`
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
  `);var Pt=class extends j{defaults(){return{line:!0,tone:"accent"}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon links",fallback:"star",auto:!1},{key:"tone",kind:"tone",label:Lt.tone},{key:"secondary_icon",kind:"icon",label:"Icoon bij de waarde rechts",auto:!1}]}schema(){return[{name:"name",selector:b.text()},{name:"line",selector:b.bool()},{name:"secondary_entity",selector:b.entity()}]}label(e){return{line:"Lijn tonen",secondary_entity:"Waarde rechts (optioneel)"}[e.name]??super.label(e)}helper(e){if(e.name==="secondary_entity")return"Toont de status van deze entiteit rechts van de lijn, bijvoorbeeld een temperatuur of een aantal."}};O("domotiapp-separator-card-editor",Pt);M("domotiapp-separator-card",Je,{name:"DomotiApp Separator",description:"Sectiekop met icoon en vervagende lijn."});var Qe=({label:i="Aan of uit",cls:e=""}={})=>`<button class="toggle ${e}" type="button" role="switch" aria-checked="false" aria-label="${i}"><span class="knob"></span></button>`;function Me(i,e){if(!i)return;let t=String(!!e);i.getAttribute("aria-checked")!==t&&i.setAttribute("aria-checked",t)}function et(i,e){let t=i.querySelector(".knob"),n=!1,a=0,o=!1,s=!1,r=()=>{n=!1,i.classList.remove("dragging"),t?.style.removeProperty("--knob")},c=h=>{h!==e.value()&&(Me(i,h),e.set(h))},l=h=>{if(!e.disabled?.()&&!(h.button!=null&&h.button!==0)){h.stopPropagation(),n=!0,o=!1,s=!1,a=h.clientX,i.classList.add("dragging");try{i.setPointerCapture?.(h.pointerId)}catch{}}},p=h=>{if(!n)return;let k=h.clientX-a;Math.abs(k)>3&&(o=!0);let y=e.value()?22:0,S=Math.min(22,Math.max(0,y+k));t?.style.setProperty("--knob",`${S}px`)},u=h=>{if(!n)return;h.stopPropagation();let k=h.clientX-a,y=e.value()?22:0,S=Math.min(22,Math.max(0,y+k));r();try{i.hasPointerCapture?.(h.pointerId)&&i.releasePointerCapture(h.pointerId)}catch{}s=!0,c(o?S>22/2:!e.value())},m=()=>{n&&r()},x=h=>{if(h.stopPropagation(),h.preventDefault(),s){s=!1;return}e.disabled?.()||c(!e.value())};return i.addEventListener("pointerdown",l),i.addEventListener("pointermove",p),i.addEventListener("pointerup",u),i.addEventListener("pointercancel",m),i.addEventListener("click",x),()=>{i.removeEventListener("pointerdown",l),i.removeEventListener("pointermove",p),i.removeEventListener("pointerup",u),i.removeEventListener("pointercancel",m),i.removeEventListener("click",x)}}var tt=`
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
  .toggle:hover { border-color: var(--dac-border-hi); }
`;var nt=class extends A{validate(e){return{layout:"row",show_state:!0,show_name:!0,show_icon:!0,...e}}watched(){return[this.config.entity].filter(Boolean)}tone_(){let e=this.config;return e.tone?N(e.tone):K(e.entity)!=="light"?H.accent:Fe(_(this.hass,e.entity))??H.lit}metSchakelaar_(){return!!this.config.toggle&&Ze(this.config.entity)}template(){let e=this.config;return this.setAttribute("layout",["row","tile","compact"].includes(e.layout)?e.layout:"row"),`
      <div class="btn surface" role="button" tabindex="0" style="--tone:${this.tone_()}">
        <span class="wash"></span>
        ${e.show_icon===!1?"":'<span class="chip" role="button" tabindex="0"></span>'}
        <span class="txt">
          ${e.show_name===!1?"":'<span class="nm"></span>'}
          ${e.show_state===!1?"":'<span class="st"></span>'}
        </span>
        ${this.metSchakelaar_()?Qe({label:"Aan of uit"}):""}
      </div>`}wire(){let e=this.config,t=(o,s)=>fe(this,this.hass,e,e[o]??s);this.teardown_.push(L(this.$(".btn"),{onTap:()=>t("tap_action",{action:e.entity?"more-info":"none"}),onHold:()=>t("hold_action",{action:e.entity?"more-info":"none"}),onDouble:e.double_tap_action?()=>t("double_tap_action",{action:"none"}):void 0}));let n=this.$(".chip");if(!n)return;this.teardown_.push(L(n,{onTap:o=>t("icon_tap_action",ge(e.entity)),onHold:()=>t("icon_hold_action",{action:e.entity?"more-info":"none"})})),this.on(n,"click",o=>o.stopPropagation()),this.on(n,"pointerdown",o=>o.stopPropagation());let a=this.$(".toggle");a&&this.teardown_.push(et(a,{value:()=>me(_(this.hass,e.entity)),set:o=>this.hass.callService("homeassistant",o?"turn_on":"turn_off",{entity_id:e.entity}),disabled:()=>R(_(this.hass,e.entity))}))}paint(){let e=this.config,t=_(this.hass,e.entity),n=me(t),a=!!e.entity&&R(t);this.toggleAttribute("on",n),this.$(".btn").classList.toggle("unavailable",a),this.$(".btn").style.setProperty("--tone",this.tone_());let o=this.$(".chip");if(o){let c=ue(this.hass,e.entity,e.icon),l=c?`pic:${c}`:e.icon||ze(e.entity,T(this.hass,e.entity));o.dataset.icon!==l&&(o.dataset.icon=l,o.classList.toggle("pic",!!c),o.innerHTML=c?`<img src="${c}" alt="" loading="lazy" />`:w(l)),o.style.setProperty("--tone",n&&!c?this.tone_():"var(--dac-ink-3)"),o.setAttribute("aria-label",e.entity?`${C(this.hass,e.entity,e.name)} schakelen`:"Icoon")}this.text(".nm",C(this.hass,e.entity,e.name));let s=this.$(".toggle");s&&(Me(s,n),s.style.setProperty("--tone",this.tone_()),s.setAttribute("aria-label",`${C(this.hass,e.entity,e.name)} aan of uit`));let r=this.$(".st");r&&this.text(r,this.secondary_(t,a)),this.$(".btn").setAttribute("aria-label",`${C(this.hass,e.entity,e.name)}${t?`, ${U(this.hass,t)}`:""}`)}secondary_(e,t){return t?"Niet bereikbaar":!e||Se(e.entity_id)?"":K(e.entity_id)==="light"&&e.state==="on"&&e.attributes.brightness!=null?`${Math.round(e.attributes.brightness/255*100)}%`:U(this.hass,e)}getCardSize(){return this.config?.layout==="tile"?2:1}getGridOptions(){return this.config?.layout==="tile"?{columns:6,rows:2,min_columns:3,min_rows:2,max_rows:2}:{columns:12,rows:1,min_columns:4,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-button-card-editor")}static getStubConfig(e,t){return{entity:t?.find(a=>a.startsWith("light."))??t?.find(a=>a.startsWith("switch."))??t?.[0],layout:"row"}}};v(nt,"css",`
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

    ${tt}

    /* De schakelaar staat rechts op de rij. Op een tegel is er rechts geen
       ruimte naast de tekst, dus staat hij bovenin naast het icoon -- daar waar
       op een rij het icoon zelf staat, en dus waar je hand al is. */
    :host([layout="tile"]) .toggle { position: absolute; top: 14px; right: 14px; margin: 0; }
    :host([layout="compact"]) .toggle { width: 40px; height: 23px; }
    :host([layout="compact"]) .toggle .knob { width: 17px; height: 17px; }
    :host([layout="compact"]) .toggle[aria-checked="true"] .knob { --knob: 19px; }

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

  `);var Vt=class extends j{defaults(){return{layout:"row",show_state:!0,show_name:!0,show_icon:!0,toggle:!1,icon_tap_action:{action:"toggle"},tap_action:{action:"more-info"}}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"star"},{key:"tone",kind:"tone",label:"Kleur"}]}schema(){return[{name:"entity",selector:b.entity()},{name:"name",selector:b.text()},{name:"layout",selector:b.select([{value:"row",label:"Rij"},{value:"tile",label:"Tegel"},{value:"compact",label:"Compact"}])},{name:"toggle",selector:b.bool()},{name:"show_icon",selector:b.bool()},{name:"show_name",selector:b.bool()},{name:"show_state",selector:b.bool()},{name:"icon_tap_action",selector:b.action("toggle")},{name:"icon_hold_action",selector:b.action("more-info")},{name:"tap_action",selector:b.action("more-info")},{name:"hold_action",selector:b.action("more-info")},{name:"double_tap_action",selector:b.action("none")}]}label(e){return{entity:"Entiteit",name:"Naam (overschrijft die van de entiteit)",layout:"Vorm",toggle:"Schakelaar tonen",show_icon:"Icoon tonen",show_name:"Naam tonen",show_state:"Status tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart",double_tap_action:"Dubbeltikken op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Mag leeg blijven: zonder entiteit wordt dit een navigatieknop.";if(e.name==="toggle")return"Een schuifschakelaar rechts op de kaart, voor wat twee standen heeft: een lamp, een stopcontact, een schakelaar. Op een scene of een script verschijnt hij niet.";if(e.name==="icon_tap_action")return"Handig: het icoon schakelt de lichtgroep, de kaart navigeert naar de ruimte.";if(e.name==="tap_action")return"Wat er gebeurt als je naast het icoon tikt, bijvoorbeeld navigeren naar een pop-up."}};O("domotiapp-button-card-editor",Vt);M("domotiapp-button-card",nt,{name:"DomotiApp Knop",description:"E\xE9n control als rij, tegel of compacte pil. Vervangt tile, mushroom-entity en bubble-knoppen."});var Rt=(i,e,t)=>Math.min(t,Math.max(e,i));function ve(i,e){let t=e.min??0,n=e.max??100,a=e.step??1,o=!1,s=h=>{let k=i.getBoundingClientRect();if(!k.width)return t;let y=Rt((h-k.left)/k.width,0,1),S=t+y*(n-t);return Rt(Math.round(S/a)*a,t,n)},r=h=>{try{i.setPointerCapture?.(h)}catch{}},c=h=>{try{i.hasPointerCapture?.(h)&&i.releasePointerCapture(h)}catch{}},l=h=>{e.disabled?.()||h.button!=null&&h.button!==0||(o=!0,r(h.pointerId),i.classList.add("dragging"),e.onInput(s(h.clientX)),h.preventDefault())},p=h=>{o&&(e.onInput(s(h.clientX)),h.preventDefault())},u=h=>{o&&(o=!1,c(h.pointerId),i.classList.remove("dragging"),e.onCommit(s(h.clientX)))},m=h=>{o&&(o=!1,c(h?.pointerId),i.classList.remove("dragging"),e.onInput(e.value()))},x=h=>{if(e.disabled?.())return;let k=(n-t)/10,y={ArrowLeft:-a,ArrowDown:-a,ArrowRight:a,ArrowUp:a,PageDown:-k,PageUp:k,Home:-1/0,End:1/0};if(!(h.key in y))return;h.preventDefault();let S=e.value(),ae=Rt(y[h.key]===-1/0?t:y[h.key]===1/0?n:S+y[h.key],t,n);e.onInput(ae),e.onCommit(ae)};return i.addEventListener("pointerdown",l),i.addEventListener("pointermove",p),i.addEventListener("pointerup",u),i.addEventListener("pointercancel",m),i.addEventListener("keydown",x),()=>{i.removeEventListener("pointerdown",l),i.removeEventListener("pointermove",p),i.removeEventListener("pointerup",u),i.removeEventListener("pointercancel",m),i.removeEventListener("keydown",x)}}var ne=(i="")=>`
  <div class="slider ${i}" role="slider" tabindex="0"
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
`;var La=new Set(["brightness","color_temp","hs","rgb","rgbw","rgbww","xy","white"]),Da=new Set(["hs","rgb","rgbw","rgbww","xy"]),Kt=i=>i?.attributes?.supported_color_modes??[],Ia=i=>Kt(i).some(e=>La.has(e)),it=i=>Kt(i).some(e=>Da.has(e)),at=i=>Kt(i).includes("color_temp"),Bn=i=>Math.max(1,Math.round((i??0)/255*100)),ot=class extends A{validate(e){let t=e.entity??e.lights?.[0]??e.entities?.[0],n=typeof t=="string"?t:t?.entity;return n?{show_colour:!0,...e,entity:n}:{...e,[I]:"Kies een lamp."}}watched(){return[this.config.entity]}template(){return this.config.bare&&this.setAttribute("bare",""),`
      <div class="card surface">
        <div class="lamp" data-on="false" style="--tone:var(--dac-lit)">
          <button class="chip" type="button" aria-label="Aan of uit"></button>
          <span class="txt"><span class="nm"></span><span class="v tnum"></span></span>
          <span class="ctl" style="display:contents"></span>
        </div>
        <div class="colour" hidden></div>
      </div>`}wire(){let e=this.config.entity;this.teardown_.push(L(this.$(".chip"),{onTap:()=>this.hass.callService("light","toggle",{entity_id:e}),onHold:()=>Y(this,e)})),this.on(this.$(".card"),"click",t=>{t.target.closest(".toggle")&&this.hass.callService("light","toggle",{entity_id:e})}),this.sliders_=new Map}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let a=ve(e,n);this.sliders_.set(t,a),this.teardown_.push(a)}setSlider_(e,t,n=0,a=100){if(!e)return;let o=a>n?(t-n)/(a-n)*100:0;e.style.setProperty("--v",`${o}%`),e.setAttribute("aria-valuemin",String(n)),e.setAttribute("aria-valuemax",String(a)),e.setAttribute("aria-valuenow",String(t))}paint(){let e=this.config,t=_(this.hass,e.entity),n=R(t),a=t?.state==="on",o=this.$(".lamp");o.dataset.on=String(a),o.classList.toggle("unavailable",n);let s=this.$(".chip"),r=e.icon||"bulb";s.dataset.icon!==r&&(s.dataset.icon=r,s.innerHTML=w(r,"bulb")),this.text(".nm",C(this.hass,e.entity,e.name));let c=a?t?.attributes?.rgb_color:null;o.style.setProperty("--tone",c?`rgb(${c[0]},${c[1]},${c[2]})`:"var(--dac-lit)");let l=this.$(".ctl"),p=n?"none":Ia(t)?"range":"toggle";if(l.dataset.kind!==p&&(l.dataset.kind=p,l.innerHTML=p==="range"?ne("brightness"):p==="toggle"?'<button class="toggle" type="button" role="switch" aria-checked="false" aria-label="Aan of uit"></button>':"",this.sliders_.delete("brightness")),p==="range"){let u=l.querySelector(".slider");if(this.attach_(u,"brightness",{value:()=>t?.state==="on"?Bn(_(this.hass,e.entity)?.attributes?.brightness):0,onInput:m=>{this.setSlider_(u,m),this.text(".v",m===0?"Uit":`${m}%`)},onCommit:m=>{m===0?this.hass.callService("light","turn_off",{entity_id:e.entity}):this.hass.callService("light","turn_on",{entity_id:e.entity,brightness_pct:m})},disabled:()=>R(_(this.hass,e.entity))}),!u.classList.contains("dragging")){let m=a?Bn(t.attributes.brightness):0;this.setSlider_(u,m),this.text(".v",a?`${m}%`:"Uit")}}else p==="toggle"?(l.querySelector(".toggle")?.setAttribute("aria-checked",String(a)),this.text(".v",a?"Aan":"Uit")):this.text(".v","Niet bereikbaar");this.paintColour_(t,a)}paintColour_(e,t){let n=this.$(".colour"),a=this.config.show_colour!==!1&&(it(e)||at(e));if(n.hidden=!(a&&t),!a)return;let o=`${it(e)?"c":""}${at(e)?"t":""}`;if(n.dataset.sig!==o){n.dataset.sig=o,n.innerHTML=(it(e)?`<span data-kind="hue" style="display:contents">${ne("hue")}</span>`:"")+(at(e)?`<span data-kind="kelvin" style="display:contents">${ne("kelvin")}</span>`:"");let l=n.querySelector(".slider.hue");l&&(l.dataset.strip="",l.style.setProperty("--strip","linear-gradient(90deg, hsl(0 90% 55%), hsl(60 90% 55%), hsl(120 90% 55%), hsl(180 90% 55%), hsl(240 90% 55%), hsl(300 90% 55%), hsl(360 90% 55%))"),l.setAttribute("aria-label","Kleur"));let p=n.querySelector(".slider.kelvin");p&&(p.dataset.strip="",p.style.setProperty("--strip","linear-gradient(90deg,#ffb15e,#ffd6a8,#fff5e8,#eaf1ff,#cbdcff)"),p.setAttribute("aria-label","Kleurtemperatuur")),this.sliders_.delete("hue"),this.sliders_.delete("kelvin")}if(!t)return;let s=this.config.entity,r=n.querySelector(".slider.hue");r&&(this.attach_(r,"hue",{min:0,max:360,value:()=>_(this.hass,s)?.attributes?.hs_color?.[0]??0,onInput:l=>this.setSlider_(r,l,0,360),onCommit:l=>{let p=_(this.hass,s)?.attributes?.hs_color?.[1]??100;this.hass.callService("light","turn_on",{entity_id:s,hs_color:[l,p]})}}),r.classList.contains("dragging")||this.setSlider_(r,Math.round(e.attributes.hs_color?.[0]??0),0,360));let c=n.querySelector(".slider.kelvin");if(c){let l=e.attributes.min_color_temp_kelvin??2e3,p=e.attributes.max_color_temp_kelvin??6500;if(this.attach_(c,"kelvin",{min:l,max:p,step:50,value:()=>_(this.hass,s)?.attributes?.color_temp_kelvin??l,onInput:u=>this.setSlider_(c,u,l,p),onCommit:u=>this.hass.callService("light","turn_on",{entity_id:s,color_temp_kelvin:u})}),!c.classList.contains("dragging")){let u=e.attributes.color_temp_kelvin;u!=null&&this.setSlider_(c,u,l,p)}}}getCardSize(){let e=_(this.hass,this.config?.entity);return e?.state==="on"&&(it(e)||at(e))?2:1}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:1}}static getConfigElement(){return document.createElement("domotiapp-light-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("light."));return n?{entity:n}:{}}};v(ot,"css",`
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
  `);var Ht=class extends j{defaults(){return{show_colour:!0}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"bulb"}]}schema(){return[{name:"entity",selector:b.entity("light")},{name:"name",selector:b.text()},{name:"show_colour",selector:b.bool()}]}label(e){return{entity:"Lamp",name:"Naam (overschrijft die van de lamp)",show_colour:"Kleurstrips tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"E\xE9n lamp per kaart. Dimbaar krijgt een schuif, alleen schakelbaar een tuimelaar.";if(e.name==="show_colour")return"Kleur en kleurtemperatuur verschijnen zodra de lamp aan is. De kaart is dan twee rijen hoog."}};O("domotiapp-light-card-editor",Ht);M("domotiapp-light-card",ot,{name:"DomotiApp Verlichting",description:"E\xE9n lamp op \xE9\xE9n rasterrij: dimmen, kleur en kleurtemperatuur."});function qn(i){if(!i)return null;let e=Number(i.state);return Number.isFinite(e)?e:null}function Pa(i){let e=i?.attributes?.hvac_action;return e||(i?.state==="off"?"off":i?.state==="cool"?"cooling":i?.state==="heat"?"idle":null)}var Ut={heating:"var(--dac-solar)",cooling:"var(--dac-grid-in)",drying:"var(--dac-grid-in)",fan:"var(--dac-grid-in)"},Fn={heating:"Verwarmt",cooling:"Koelt",drying:"Ontvochtigt",fan:"Ventileert",idle:"Uit",off:"Uit"},st=class extends A{validate(e){return e.entity||e.temperature||e.humidity?{...e}:{...e,[I]:"Kies een thermostaat, of een temperatuursensor."}}watched(){let e=this.config;return[e.entity,e.temperature,e.humidity].filter(Boolean)}step_(){let e=T(this.hass,this.config.entity);return Number(this.config.step??e.target_temp_step)||.5}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.entity||this.setAttribute("readout",""),`
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
      </div>`}wire(){let e=this.config;this.teardown_.push(()=>clearTimeout(this.sendTimer_)),this.teardown_.push(L(this.$(".chip"),{onTap:()=>Y(this,e.entity||e.temperature||e.humidity)}));let t=this.$(".set");t&&t.querySelectorAll("button").forEach(n=>this.on(n,"click",()=>this.nudge_(Number(n.dataset.d))))}nudge_(e){let t=this.config,n=T(this.hass,t.entity),a=this.step_(),o=Number(n.min_temp??5),s=Number(n.max_temp??35),r=this.pending_??Number(n.temperature);if(!Number.isFinite(r))return;let c=Math.min(s,Math.max(o,Math.round((r+e*a)/a)*a));this.pending_=c,this.paintTarget_(),clearTimeout(this.sendTimer_),this.sendTimer_=setTimeout(()=>{this.sendTimer_=null,this.hass.callService("climate","set_temperature",{entity_id:t.entity,temperature:this.pending_}),setTimeout(()=>{this.pending_=null,this.paint()},1500)},450)}paintTarget_(){let e=this.$(".target");if(!e)return;let t=T(this.hass,this.config.entity),n=this.pending_??Number(t.temperature);e.classList.toggle("pending",this.pending_!=null),e.textContent=Number.isFinite(n)?`${G(this.hass,n,n%1?1:0)}\xB0`:"--"}paint(){let e=this.config,t=e.entity?_(this.hass,e.entity):null,n=e.entity?R(t):!1;this.toggleAttribute("dead",n);let a=Pa(t),o=e.tone?N(e.tone):Ut[a]??"var(--dac-ink-3)";this.$(".card").style.setProperty("--tone",o),this.toggleAttribute("busy",!!Ut[a]);let s=this.$(".chip"),r=e.icon||"thermo";s.dataset.icon!==r&&(s.dataset.icon=r,s.innerHTML=w(r,"thermo")),s.style.setProperty("--tone",Ut[a]?o:"var(--dac-ink-3)"),this.text(".nm",C(this.hass,e.entity||e.temperature||e.humidity,e.name));let c=e.temperature?qn(_(this.hass,e.temperature)):Number(T(this.hass,e.entity).current_temperature),l=this.hass?.config?.unit_system?.temperature??"\xB0C";this.text(".temp",Number.isFinite(c)?`${G(this.hass,c,1)} ${l}`:"--");let p=e.humidity?qn(_(this.hass,e.humidity)):null,u=this.$(".hum");u.innerHTML=p==null?"":`${E.drop}${G(this.hass,p,0)}%`,this.text(".sep",p==null?"":"\xB7"),e.entity&&!e.humidity&&Fn[a]&&a!=="idle"&&(this.text(".sep","\xB7"),u.textContent=Fn[a]),this.paintTarget_();let m=this.$(".set");if(m){let x=T(this.hass,e.entity),h=this.pending_??Number(x.temperature);m.querySelector('[data-d="-1"]').disabled=n||h<=Number(x.min_temp??5),m.querySelector('[data-d="1"]').disabled=n||h>=Number(x.max_temp??35)}}getCardSize(){return 1}getGridOptions(){return{columns:12,rows:1,min_columns:4,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-climate-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("climate."));return n?{entity:n}:{}}};v(st,"css",`
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
  `);var Wt=class extends j{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"thermo"},{key:"tone",kind:"tone",label:"Vaste kleur (leeg = volgt de ketel)"}]}schema(){return[{name:"entity",selector:b.entity("climate")},{name:"temperature",selector:{entity:{domain:"sensor",device_class:"temperature"}}},{name:"humidity",selector:{entity:{domain:"sensor",device_class:"humidity"}}},{name:"name",selector:b.text()},{name:"step",selector:b.number(.1,5,.1)}]}label(e){return{entity:"Thermostaat (optioneel)",temperature:"Temperatuursensor (optioneel)",humidity:"Vochtigheidssensor (optioneel)",name:"Naam",step:"Stap van de knoppen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Leeg laten voor een kaart die alleen meet. Met thermostaat komen de stelknoppen erbij.";if(e.name==="temperature")return"Wint van de meting van de thermostaat zelf. Handig als er een betere sensor in de kamer hangt.";if(e.name==="step")return"Leeg laten volgt de thermostaat, en anders een halve graad."}};O("domotiapp-climate-card-editor",Wt);M("domotiapp-climate-card",st,{name:"DomotiApp Klimaat",description:"Thermostaat, losse temperatuur- en vochtsensor, of allebei."});var Zn=i=>Math.min(Math.max(1,Number(i)||2),3),Xn=i=>typeof i=="string"?{entity:i}:{...i};function rt(i){for(i.bewaard??=[];i.items.length<i.columns;)i.items.push(i.bewaard.pop()??{entity:""});for(;i.items.length>i.columns;){let e=i.items.pop();e.entity&&i.bewaard.push(e)}return i}function Va(i){let e=Array.isArray(i.rows)&&i.rows.length?i.rows.map(n=>({columns:Zn(n.columns),items:(n.items??n.entities??[]).map(Xn)})):(()=>{let n=(i.items??i.entities??[]).map(Xn);return n.length?[{columns:Zn(i.columns),items:n}]:[]})(),t=[];for(let n of e){let a=[];for(let o=0;o<n.items.length;o+=n.columns)a.push(n.items.slice(o,o+n.columns));a.length||a.push([]);for(let o of a)t.push(rt({columns:n.columns,items:o}))}return t}var Yn=i=>i.map(e=>({columns:e.columns,items:e.items.filter(t=>t.entity).map(t=>structuredClone(t))})).filter(e=>e.items.length),Ra=`
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
`,Gt=class extends HTMLElement{constructor(){super(),this.rows_=[],this.rest_={},this.open_=new Set,this.koppen_=[]}setConfig(e){if(this.rest_={...e},delete this.rest_.rows,delete this.rest_.items,delete this.rest_.entities,delete this.rest_.columns,this.gebouwd_&&e===this.uitObject_)return;let t=Va(e);this.gebouwd_&&JSON.stringify(Yn(t))===this.uit_||(this.rows_=t,this.eersteKeer_||(this.eersteKeer_=!0,this.rows_.length===1&&this.open_.add("r0")),this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker, dac-tone-picker"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}connectedCallback(){this.gebouwd_||this.build_()}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}rijWeg_(e){let t=new Set;for(let n of this.open_){let a=/^r(\d+)(?:i(\d+))?$/.exec(n);if(!a)continue;let o=Number(a[1]);o!==e&&t.add(o>e?`r${o-1}${a[2]===void 0?"":`i${a[2]}`}`:n)}this.open_=t}itemWeg_(e,t){let n=new Set;for(let a of this.open_){let o=/^r(\d+)i(\d+)$/.exec(a);if(!o||Number(o[1])!==e){n.add(a);continue}let s=Number(o[2]);s!==t&&n.add(s>t?`r${e}i${s-1}`:a)}this.open_=n}legePlekkenOpen_(e,t){e.items.forEach((n,a)=>{n.entity||this.open_.add(`r${t}i${a}`)})}async build_(){if(!this.hass_||!this.rows_)return;await customElements.whenDefined("ha-form"),this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=Ra;let t=document.createElement("div");if(t.className="dac-ed",this.append(e,t),t.appendChild(this.kaartBlok_()),this.rows_.forEach((a,o)=>t.appendChild(this.rijBlok_(a,o))),!this.rows_.length){let a=document.createElement("p");a.className="uitleg",a.textContent="Een rij is \xE9\xE9n regel op de kaart, met \xE9\xE9n, twee of drie entiteiten naast elkaar. Elke rij heeft zijn eigen indeling.",t.appendChild(a)}let n=document.createElement("button");n.type="button",n.className="rijtoevoegen",n.textContent="\uFF0B  Rij toevoegen",n.addEventListener("click",()=>{let a=rt({columns:2,items:[]});this.rows_.push(a);let o=this.rows_.length-1;this.open_.add(`r${o}`),this.legePlekkenOpen_(a,o),this.emit_(),this.build_()}),t.appendChild(n)}binnenKop_(e,t){return e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),t(n)}),e}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"state_position",selector:{select:{mode:"dropdown",options:[{value:"below",label:"Onder de naam"},{value:"right",label:"Rechts op de regel"}]}}}],e.computeLabel=()=>"Waar de status staat",e.computeHelper=()=>"Rechts is de vorm van de entiteitenkaart van Home Assistant: de waarden komen onder elkaar uit. Regels met een schakelaar tonen geen tekst.",e.data={state_position:this.rest_.state_position??"below"},e.addEventListener("value-changed",t=>{t.stopPropagation(),t.detail.value?.state_position==="right"?this.rest_.state_position="right":delete this.rest_.state_position,this.emit_()}),e}rijBlok_(e,t){let n=document.createElement("details");n.className="rij",this.onthoud_(n,`r${t}`);let a=document.createElement("summary"),o=document.createElement("span");o.className="pijl",o.textContent="\u203A";let s=document.createElement("span");s.className="titel";let r=document.createElement("b");r.textContent=`Rij ${t+1}`;let c=document.createElement("small");s.append(r,c);let l=document.createElement("span");l.className="kolommen";let p=[1,2,3].map(h=>{let k=document.createElement("button");return k.type="button",k.textContent=String(h),k.title=`${h} entiteit${h>1?"en":""} in deze rij`,l.appendChild(this.binnenKop_(k,()=>{e.columns!==h&&(e.columns=h,rt(e),this.open_.add(`r${t}`),this.legePlekkenOpen_(e,t),this.emit_(),this.build_())})),k}),u=()=>{let h=e.items.filter(y=>y.entity),k=`${e.columns} kolom${e.columns>1?"men":""}`;c.textContent=h.length?`${k} \xB7 ${h.map(y=>this.itemNaam_(y)).join(", ")}`:`${k} \xB7 nog leeg`,p.forEach(y=>y.setAttribute("aria-pressed",String(e.columns===Number(y.textContent))))};this.koppen_.push(u);let m=document.createElement("button");m.type="button",m.className="weg",m.title="Rij verwijderen",m.textContent="\u2715",this.binnenKop_(m,()=>{this.rows_.splice(t,1),this.rijWeg_(t),this.emit_(),this.build_()}),a.append(o,s,l,m);let x=document.createElement("div");return x.className="rijbody",e.items.forEach((h,k)=>x.appendChild(this.itemBlok_(e,h,t,k))),n.append(a,x),u(),n}itemNaam_(e){return e.name||this.hass_?.states?.[e.entity]?.attributes?.friendly_name||e.entity}itemBlok_(e,t,n,a){let o=document.createElement("details");o.className="item",this.onthoud_(o,`r${n}i${a}`);let s=document.createElement("summary"),r=document.createElement("span");r.className="pijl",r.textContent="\u203A";let c=document.createElement("span");c.className="nr",c.textContent=String(a+1),c.title=`Plek ${a+1} in de rij`;let l=document.createElement("span");l.className="titel";let p=document.createElement("b"),u=document.createElement("small");l.append(p,u);let m=document.createElement("button");m.type="button",m.className="weg",m.title="Deze plek leegmaken",m.textContent="\u2715",this.binnenKop_(m,()=>{e.items.splice(a,1),this.itemWeg_(n,a),rt(e),this.emit_(),this.build_()}),s.append(r,c,l,m);let x=document.createElement("div");x.className="itembody";let h=document.createElement("ha-form");h.hass=this.hass_,h.schema=[{name:"entity",selector:{entity:{}}}],h.computeLabel=()=>"Entiteit",h.addEventListener("value-changed",$=>{$.stopPropagation(),t.entity=$.detail.value.entity??"",this.emit_()});let k=document.createElement("dac-icon-picker");k.label="Icoon",k.hass=this.hass_,k.addEventListener("value-changed",$=>{$.stopPropagation(),$.detail.value?t.icon=$.detail.value:delete t.icon,this.emit_()});let y=document.createElement("dac-tone-picker");y.label="Kleur",y.hass=this.hass_,y.addEventListener("value-changed",$=>{$.stopPropagation(),$.detail.value?t.tone=$.detail.value:delete t.tone,this.emit_()});let S=document.createElement("ha-form");S.hass=this.hass_,S.schema=[{name:"name",selector:{text:{}}},{name:"toggle",selector:{boolean:{}}},{name:"show_state",selector:{boolean:{}}},{name:"icon_tap_action",selector:{ui_action:{default_action:"toggle"}}},{name:"icon_hold_action",selector:{ui_action:{default_action:"more-info"}}},{name:"tap_action",selector:{ui_action:{default_action:"more-info"}}},{name:"hold_action",selector:{ui_action:{default_action:"more-info"}}}],S.computeLabel=$=>({name:"Naam (overschrijft die van de entiteit)",toggle:"Schakelaar tonen",show_state:"Status tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de regel",hold_action:"Vasthouden op de regel"})[$.name]??$.name,S.computeHelper=$=>{if($.name==="icon_tap_action")return"Het icoon en de regel zijn twee knoppen: het icoon schakelt, de regel opent of navigeert.";if($.name==="toggle")return"Een schuifschakelaar rechts op de regel, in plaats van de statustekst. Alleen voor wat twee standen heeft: een lamp, een stopcontact, een schakelaar."},S.addEventListener("value-changed",$=>{$.stopPropagation();let pe=$.detail.value;pe.name?t.name=pe.name:delete t.name,pe.toggle===!0?t.toggle=!0:delete t.toggle,pe.show_state===!1?t.show_state=!1:delete t.show_state;for(let Ge of["icon_tap_action","icon_hold_action","tap_action","hold_action"])pe[Ge]?t[Ge]=pe[Ge]:delete t[Ge];this.emit_()});let ae=()=>{p.textContent=t.entity?this.itemNaam_(t):"Kies een entiteit",u.textContent=t.entity||"",o.dataset.leeg=String(!t.entity),m.hidden=!t.entity};return this.koppen_.push(ae),h.data={entity:t.entity||void 0},k.value=t.icon??"",y.value=t.tone??"",S.data={name:t.name??"",toggle:t.toggle??!1,show_state:t.show_state??!0,icon_tap_action:t.icon_tap_action,icon_hold_action:t.icon_hold_action,tap_action:t.tap_action,hold_action:t.hold_action},x.append(h,k,y,S),o.append(s,x),ae(),o}emit_(){let e=Yn(this.rows_),t={...this.rest_,rows:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_)n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};D("domotiapp-entities-card-editor",Gt);var Jn=44,Bt=6,Qn=i=>typeof i=="string"?{entity:i}:{...i};function Ha(i){if(Array.isArray(i.rows)&&i.rows.length)return i.rows.map(t=>({columns:Math.min(Math.max(1,Number(t.columns)||2),3),items:(t.items??t.entities??[]).map(Qn)}));let e=(i.items??i.entities??[]).map(Qn);return e.length?[{columns:Math.min(Math.max(1,Number(i.columns)||2),3),items:e}]:[]}var lt=class extends A{validate(e){let t=Ha(e);return t.some(n=>n.items.length)?{show_state:!0,state_position:"below",...e,rows:t}:{...e,[I]:"Voeg een rij toe en kies daar entiteiten in."}}watched(){return this.config.rows.flatMap(e=>e.items.map(t=>t.entity))}item_(e,t){return this.config.rows[+e]?.items[+t]}tone_(e){return e.tone?N(e.tone):this.config.tone?N(this.config.tone):K(e.entity)!=="light"?H.accent:Fe(_(this.hass,e.entity))??H.lit}metSchakelaar_(e){return!!e.toggle&&Ze(e.entity)}template(){let e=this.config;e.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size";let t=e.state_position==="right";return`<div class="card surface">${e.rows.map((a,o)=>`
      <div class="row" style="--cols:${a.columns}">
        ${a.items.map((s,r)=>`
          <div class="it" role="button" tabindex="0" data-r="${o}" data-i="${r}">
            <span class="chip" role="button" tabindex="0"></span>
            <span class="txt"><span class="nm"></span>${t?"":'<span class="st"></span>'}</span>
            ${t?'<span class="st rechts"></span>':""}
            ${this.metSchakelaar_(s)?Qe({label:"Aan of uit"}):""}
          </div>`).join("")}
      </div>`).join("")}</div>`}wire(){this.$$(".it").forEach(e=>{let t=this.item_(e.dataset.r,e.dataset.i);if(!t)return;let n=(s,r)=>fe(this,this.hass,t,t[s]??r);this.teardown_.push(L(e,{onTap:()=>n("tap_action",{action:"more-info"}),onHold:()=>n("hold_action",{action:"more-info"})}));let a=e.querySelector(".chip");this.teardown_.push(L(a,{onTap:()=>n("icon_tap_action",ge(t.entity)),onHold:()=>n("icon_hold_action",{action:"more-info"})})),this.on(a,"click",s=>s.stopPropagation()),this.on(a,"pointerdown",s=>s.stopPropagation());let o=e.querySelector(".toggle");o&&this.teardown_.push(et(o,{value:()=>me(_(this.hass,t.entity)),set:s=>this.hass.callService("homeassistant",s?"turn_on":"turn_off",{entity_id:t.entity}),disabled:()=>R(_(this.hass,t.entity))}))})}paint(){this.$$(".it").forEach(e=>{let t=this.item_(e.dataset.r,e.dataset.i);if(!t)return;let n=_(this.hass,t.entity),a=me(n),o=R(n);e.dataset.on=String(a),e.classList.toggle("unavailable",o);let s=this.tone_(t);e.style.setProperty("--tone",s);let r=e.querySelector(".chip"),c=ue(this.hass,t.entity,t.icon),l=t.icon||(c?`pic:${c}`:ze(t.entity,T(this.hass,t.entity)));r.dataset.icon!==l&&(r.dataset.icon=l,r.classList.toggle("pic",!!c),r.innerHTML=c?`<img src="${c}" alt="" loading="lazy" />`:w(t.icon||ze(t.entity,T(this.hass,t.entity)))),r.style.setProperty("--tone",c?"var(--dac-ink-3)":a?s:"var(--dac-ink-3)");let p=C(this.hass,t.entity,t.name);this.text(e.querySelector(".nm"),p),r.setAttribute("aria-label",`${p} schakelen`);let u=e.querySelector(".toggle");u&&(Me(u,a),u.style.setProperty("--tone",s),u.setAttribute("aria-label",`${p} aan of uit`));let m=e.querySelector(".st"),x=t.show_state??this.config.show_state;if(u)m.textContent="";else if(x===!1)m.textContent="";else if(o)m.textContent="Niet bereikbaar";else if(!n||Se(n.entity_id))m.textContent="";else if(K(n.entity_id)==="light"&&a&&n.attributes.brightness!=null)m.textContent=`${Math.round(n.attributes.brightness/255*100)}%`;else{let h=n.attributes.unit_of_measurement;m.textContent=h?`${n.state} ${h}`:U(this.hass,n)}e.setAttribute("aria-label",`${p}${n?`, ${U(this.hass,n)}`:""}`)})}lines_(){return(this.config?.rows??[]).reduce((e,t)=>e+Math.ceil((t.items.length||1)/t.columns),0)}getCardSize(){return Math.max(1,this.lines_())}getGridOptions(){let e=Math.max(1,this.lines_()),t=te(12+e*Jn+(e-1)*Bt);return{columns:12,rows:t,min_columns:4,min_rows:t,max_rows:t}}static getConfigElement(){return document.createElement("domotiapp-entities-card-editor")}static getStubConfig(){return{rows:[]}}};v(lt,"css",`
    :host { display: block; height: 100%; }

    /* 5px boven en onder plus 44px per regel plus de rand van 2 komt precies op
       56 uit: \xE9\xE9n rasterrij, dezelfde hoogte als een Mushroom-kaart ernaast. */
    .card {
      height: 100%; min-height: 56px; padding: 5px 10px;
      display: flex; flex-direction: column; justify-content: center; gap: ${Bt}px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

    .row {
      display: grid; gap: ${Bt}px;
      grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
    }

    .it {
      display: flex; align-items: center; gap: 10px;
      min-height: ${Jn}px; padding: 2px 6px 2px 2px;
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

    /* Rechts uitgelijnd: de naam neemt de ruimte, de waarde staat tegen de rand
       aan. Zo komen de waarden van een lijst onder elkaar uit in plaats van
       ergens midden in de regel te eindigen. */
    .txt { flex: 1 1 auto; }
    .st.rechts {
      flex: 0 0 auto; margin-left: auto; padding-left: 10px;
      max-width: 55%; text-align: right; font-size: 12px;
    }

    ${tt}
    .toggle { width: 42px; height: 24px; }
    .toggle .knob { width: 18px; height: 18px; }
    .toggle[aria-checked="true"] .knob { --knob: 20px; }

    .it.unavailable { opacity: .42; pointer-events: none; }

    /* Onder de 260px passen twee namen niet meer naast elkaar zonder te
       verminken, dus dan gaat elke rij terug naar \xE9\xE9n kolom. */
    @container (max-width: 260px) {
      .row { grid-template-columns: 1fr; }
    }
  `);M("domotiapp-entities-card",lt,{name:"DomotiApp Entiteiten",description:"Rijen entiteiten, elk met een eigen kolomindeling."});var B={PAUSE:1,SEEK:2,VOLUME_SET:4,VOLUME_MUTE:8,PREVIOUS_TRACK:16,NEXT_TRACK:32,TURN_ON:128,TURN_OFF:256,PLAY_MEDIA:512,VOLUME_STEP:1024,SELECT_SOURCE:2048,STOP:4096,PLAY:16384,SHUFFLE_SET:32768,REPEAT_SET:262144},q=(i,e)=>!!(Number(i?.attributes?.supported_features??0)&e),qt=i=>!i||i.state==="off",Ka=i=>!!i&&!["off","unavailable","unknown"].includes(i.state),Ft=i=>i?.state==="playing",ei=i=>!!i&&!["off","unavailable","unknown","idle","standby"].includes(i.state);function ti(i){if(!i)return[];let e=[];return(q(i,B.TURN_ON)||q(i,B.TURN_OFF))&&e.push("power"),qt(i)||(q(i,B.PREVIOUS_TRACK)&&e.push("prev"),q(i,B.PLAY)||q(i,B.PAUSE)||q(i,B.PLAY_MEDIA)?e.push("play"):q(i,B.STOP)&&e.push("stop"),q(i,B.NEXT_TRACK)&&e.push("next")),e}function Zt(i){if(!Ka(i))return[];let e=[];return q(i,B.VOLUME_MUTE)&&e.push("mute"),q(i,B.VOLUME_SET)?e.push("slider"):q(i,B.VOLUME_STEP)&&e.push("steps"),e}var Xt=i=>Math.round(Math.min(1,Math.max(0,Number(i?.attributes?.volume_level??0)))*100),Yt=i=>!!i?.attributes?.is_volume_muted;function ni(i,e=t=>t?.state??""){if(!i)return"";if(i.state==="unavailable")return"Niet bereikbaar";if(i.state==="off")return"Uit";if(i.state==="standby")return"Stand-by";let t=i.attributes??{},n=t.media_title||t.media_channel||"",a=t.media_artist||t.media_series_title||t.media_album_name||t.app_name||t.source||"";return i.state==="idle"||!n?a||e(i):a&&a!==n?`${n} \xB7 ${a}`:n}function ii(i){let e=i?.attributes?.device_class;return e==="tv"?"tv":e==="receiver"?"radio":"speaker"}var ai={power:{icon:"power",label:"Aan of uit"},prev:{icon:"prev",label:"Vorige"},play:{icon:"play",label:"Afspelen of pauzeren"},stop:{icon:"stop",label:"Stoppen"},next:{icon:"next",label:"Volgende"}},ct=class extends A{validate(e){return e.entity?{show_artwork:!0,show_volume:!0,show_controls:!0,...e}:{...e,[I]:"Kies een mediaspeler."}}watched(){return[this.config.entity]}tone_(){return this.config.tone?N(this.config.tone):H.accent}template(){return this.config.bare&&this.setAttribute("bare",""),`
      <div class="card surface" style="--tone:${this.tone_()}">
        <div class="top" data-on="false">
          <span class="chip" role="button" tabindex="0"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="ctl"></span>
        </div>
        <div class="vol" hidden></div>
      </div>`}wire(){let e=this.config,t=(o,s)=>fe(this,this.hass,e,e[o]??s);this.teardown_.push(L(this.$(".top"),{onTap:()=>t("tap_action",{action:"more-info"}),onHold:()=>t("hold_action",{action:"more-info"})}));let n=this.$(".chip");this.teardown_.push(L(n,{onTap:()=>t("icon_tap_action",ge(e.entity)),onHold:()=>t("icon_hold_action",{action:"more-info"})})),this.on(n,"click",o=>o.stopPropagation()),this.on(n,"pointerdown",o=>o.stopPropagation());let a=o=>{let s=o.target.closest?.("[data-k]");s&&(o.stopPropagation(),this.doe_(s.dataset.k))};this.on(this.$(".ctl"),"click",a),this.on(this.$(".vol"),"click",a),this.on(this.$(".ctl"),"pointerdown",o=>o.stopPropagation()),this.on(this.$(".vol"),"pointerdown",o=>o.stopPropagation()),this.sliders_=new Map}doe_(e){let t=this.config.entity,n=_(this.hass,t),a=(o,s={})=>this.hass.callService("media_player",o,{entity_id:t,...s});switch(e){case"power":return a(qt(n)?"turn_on":"turn_off");case"prev":return a("media_previous_track");case"next":return a("media_next_track");case"play":return a(Ft(n)?"media_pause":"media_play");case"stop":return a("media_stop");case"mute":return a("volume_mute",{is_volume_muted:!Yt(n)});case"vol-":return a("volume_down");case"vol+":return a("volume_up");default:return}}paint(){let e=this.config,t=_(this.hass,e.entity),n=!t||t.state==="unavailable",a=ei(t),o=this.$(".top");o.dataset.on=String(a),o.classList.toggle("unavailable",n),this.$(".card").style.setProperty("--tone",this.tone_());let s=this.$(".chip"),r=e.show_artwork===!1?null:ue(this.hass,e.entity,e.icon),c=r?`pic:${r}`:e.icon||ii(t);s.dataset.icon!==c&&(s.dataset.icon=c,s.classList.toggle("pic",!!r),s.innerHTML=r?`<img src="${r}" alt="" loading="lazy" />`:w(c,"speaker")),s.style.setProperty("--tone",a&&!r?this.tone_():"var(--dac-ink-3)");let l=C(this.hass,e.entity,e.name),p=ni(t,u=>U(this.hass,u));this.text(".nm",l),this.text(".st",p),s.setAttribute("aria-label",`${l} afspelen of pauzeren`),o.setAttribute("aria-label",`${l}, ${p}`),this.paintKnoppen_(t,n),this.paintVolume_(t,n)}paintKnoppen_(e,t){let n=this.$(".ctl"),a=this.config.show_controls===!1||t?[]:ti(e),o=a.join(",");n.dataset.sig!==o&&(n.dataset.sig=o,n.innerHTML=a.map(r=>`<button class="k ${r==="play"||r==="stop"?"hoofd":""}" type="button" data-k="${r}" aria-label="${ai[r].label}">${w(ai[r].icon)}</button>`).join(""));let s=n.querySelector('[data-k="play"]');if(s){let r=Ft(e)?"pause":"play";s.dataset.icon!==r&&(s.dataset.icon=r,s.innerHTML=w(r))}}paintVolume_(e,t){let n=this.$(".vol"),a=this.config.show_volume===!1||t?[]:Zt(e);if(n.hidden=!a.length,!a.length){n.dataset.sig="",this.sliders_?.delete("volume");return}let o=a.join(",");n.dataset.sig!==o&&(n.dataset.sig=o,n.innerHTML=(a.includes("mute")?`<button class="k" type="button" data-k="mute" aria-label="Dempen">${w("volume")}</button>`:"")+(a.includes("slider")?ne("volume"):"")+(a.includes("steps")?`<button class="k" type="button" data-k="vol-" aria-label="Zachter">${w("minus")}</button><button class="k" type="button" data-k="vol+" aria-label="Harder">${w("plus")}</button>`:"")+'<span class="pct tnum"></span>',this.sliders_?.delete("volume"),n.querySelector(".slider")?.setAttribute("aria-label","Volume"));let s=Yt(e),r=Xt(e),c=n.querySelector('[data-k="mute"]');if(c){let p=s?"volumeMute":"volume";c.dataset.icon!==p&&(c.dataset.icon=p,c.innerHTML=w(p)),c.setAttribute("aria-pressed",String(s))}let l=n.querySelector(".slider");l&&(this.attach_(l,"volume",{value:()=>Xt(_(this.hass,this.config.entity)),onInput:p=>this.setSlider_(l,p),onCommit:p=>this.hass.callService("media_player","volume_set",{entity_id:this.config.entity,volume_level:p/100}),disabled:()=>R(_(this.hass,this.config.entity))}),l.classList.contains("dragging")||this.setSlider_(l,r)),this.text(".pct",s?"Gedempt":`${r}%`)}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let a=ve(e,n);this.sliders_.set(t,a),this.teardown_.push(a)}setSlider_(e,t){e&&(e.style.setProperty("--v",`${t}%`),e.setAttribute("aria-valuenow",String(t)),this.text(".pct",`${t}%`))}getCardSize(){return Zt(_(this.hass,this.config?.entity)).length?2:1}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:1}}static getConfigElement(){return document.createElement("domotiapp-media-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("media_player."));return n?{entity:n}:{}}};v(ct,"css",`
    :host { display: block; }

    .card {
      min-height: 56px; padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 7px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

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
    .k:hover { background: var(--dac-surface-hi); color: var(--dac-ink); border-color: var(--dac-border-hi); }
    .k:active { transform: scale(.94); }
    .k .icon { width: 17px; height: 17px; }

    /* Afspelen is de knop waar je naar zoekt, dus die draagt de kleur. De rest
       blijft stil -- vijf gekleurde knopjes naast elkaar is een speelgoedauto. */
    .k.hoofd {
      color: var(--tone);
      background: color-mix(in srgb, var(--tone) 14%, transparent);
      border-color: color-mix(in srgb, var(--tone) 32%, transparent);
    }
    .k.hoofd:hover { background: color-mix(in srgb, var(--tone) 22%, transparent); }

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

    .top.unavailable, .vol.unavailable { opacity: .42; }
    .top.unavailable .k, .top.unavailable .chip,
    .vol.unavailable .slider, .vol.unavailable .k { pointer-events: none; }
  `);var Jt=class extends j{defaults(){return{show_artwork:!0,show_volume:!0,show_controls:!0,icon_tap_action:{action:"toggle"},tap_action:{action:"more-info"}}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"speaker"},{key:"tone",kind:"tone",label:"Kleur"}]}schema(){return[{name:"entity",selector:b.entity("media_player")},{name:"name",selector:b.text()},{name:"show_artwork",selector:b.bool()},{name:"show_controls",selector:b.bool()},{name:"show_volume",selector:b.bool()},{name:"icon_tap_action",selector:b.action("toggle")},{name:"icon_hold_action",selector:b.action("more-info")},{name:"tap_action",selector:b.action("more-info")},{name:"hold_action",selector:b.action("more-info")}]}label(e){return{entity:"Mediaspeler",name:"Naam (overschrijft die van de speler)",show_artwork:"Albumhoes tonen",show_controls:"Knoppen tonen",show_volume:"Volume tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Welke knoppen er verschijnen leest de kaart uit de speler zelf: wat hij niet kan, komt er niet op.";if(e.name==="show_artwork")return"Speelt er iets met een hoes, dan vult die de chip. Een eigen icoon gaat voor.";if(e.name==="show_volume")return"De volumeregel verschijnt zodra er iets speelt en verdwijnt als de speler uit gaat."}};O("domotiapp-media-card-editor",Jt);M("domotiapp-media-card",ct,{name:"DomotiApp Mediaspeler",description:"Wat er speelt, de knoppen die de speler aankan, en het volume."});var je={OPEN:1,CLOSE:2,SET_POSITION:4,STOP:8},Te=(i,e)=>!!((i?.attributes?.supported_features??0)&e),Ua=(i={})=>{switch(i.device_class){case"garage":return{open:"garageOpen",closed:"garageClosed"};case"awning":case"blind":return{open:"awning",closed:"awning"};default:return{open:"shutterOpen",closed:"shutter"}}},dt=class extends A{validate(e){let t=e.covers??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,covers:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[I]:"Kies minstens \xE9\xE9n rolluik of zonnescherm."}}watched(){return this.config.covers.map(e=>e.entity)}keysHtml(e){return`
      <div class="keys">
        <button type="button" data-act="open" aria-label="Open">${E.arrowUp}</button>
        ${e?`<button type="button" data-act="stop" aria-label="Stop">${E.stop}</button>`:""}
        <button type="button" data-act="close" aria-label="Dicht">${E.arrowDown}</button>
      </div>`}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`<div class="card surface">${e.covers.map((n,a)=>`
      <div class="cv" data-i="${a}" data-shown="closed" style="--tone:${N(n.tone??e.tone,"solar")}">
        <button class="chip" type="button" aria-label="Meer info"></button>
        <div class="txt"><div class="nm"></div><div class="st"></div></div>
        ${this.keysHtml(e.show_stop!==!1)}
        <div class="pos" hidden></div>
      </div>`).join("")}</div>`}wire(){this.dragging_=new Set,this.bound_=new Set,this.assumed_=new Map,this.$$(".cv").forEach(e=>{let t=e.dataset.i;e.querySelectorAll(".keys button").forEach(a=>{this.on(a,"click",()=>{let o=a.dataset.act,s={open:"open_cover",stop:"stop_cover",close:"close_cover"};this.hass.callService("cover",s[o],{entity_id:this.config.covers[+t].entity}),o!=="stop"&&(this.assumed_.set(t,o==="open"?"open":"closed"),this.paint())})});let n=this.config.covers[+t].entity;this.teardown_.push(L(e.querySelector(".chip"),{onTap:()=>Y(this,n)}))})}paint(){this.$$(".cv").forEach(e=>{let t=e.dataset.i,n=this.config.covers[+t],a=_(this.hass,n.entity),o=T(this.hass,n.entity),s=!a||a.state==="unavailable",r=a?.state??"unknown";e.classList.toggle("unavailable",s),e.querySelector(".nm").textContent=C(this.hass,n.entity,n.name);let c=Te(a,je.SET_POSITION)&&o.current_position!=null,l=c?o.current_position>0?"open":"closed":r==="open"||r==="closed"?r:this.assumed_.get(t)??"closed";e.dataset.shown=l;let p=Ua(o),u=(l==="open"?n.icon_open:n.icon_closed)??(l==="open"?this.config.icon_open:this.config.icon_closed)??n.icon??p[l],m=e.querySelector(".chip");m.dataset.icon!==u&&(m.dataset.icon=u,m.innerHTML=w(u,p[l]));let x=e.querySelector(".st");this.dragging_.has(t)||(x.textContent=s?"Niet bereikbaar":r==="opening"?"Gaat open":r==="closing"?"Gaat dicht":c?`${o.current_position}% open`:r==="open"?"Open":r==="closed"?"Dicht":""),e.querySelectorAll(".keys button").forEach(y=>{if(y.dataset.act==="stop"){y.disabled=s||!Te(a,je.STOP);return}let S=y.dataset.act==="open";y.disabled=s||(S?!Te(a,je.OPEN):!Te(a,je.CLOSE))});let h=e.querySelector(".pos"),k=c&&this.config.show_position!==!1;if(h.hidden=!k,k){if(h.dataset.built||(h.dataset.built="1",h.innerHTML=ne("position"),h.querySelector(".slider").setAttribute("aria-label","Positie")),!this.bound_.has(t)){this.bound_.add(t);let S=h.querySelector(".slider"),ae=$=>{S.style.setProperty("--v",`${$}%`),S.setAttribute("aria-valuenow",String($)),e.querySelector(".st").textContent=`${$}% open`};this.teardown_.push(ve(S,{value:()=>T(this.hass,n.entity).current_position??0,onInput:ae,onCommit:$=>this.hass.callService("cover","set_cover_position",{entity_id:n.entity,position:$})}))}let y=h.querySelector(".slider");if(!y.classList.contains("dragging")){let S=o.current_position??0;y.style.setProperty("--v",`${S}%`),y.setAttribute("aria-valuenow",String(S))}}})}rows_(){let e=this.config?.covers??[],t=e.some(n=>Te(_(this.hass,n.entity),je.SET_POSITION));return te(12+Math.max(1,e.length)*42+(t?30:0))}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-cover-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("cover."));return{covers:n?[n]:[]}}};v(dt,"css",`
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
    ${_e}

    .cv.unavailable { opacity: .42; pointer-events: none; }

    @media (max-width: 380px) { .keys button { width: 34px; } }
  `);var Qt=class extends j{defaults(){return{show_stop:!0,show_position:!0}}pickers(){return[{key:"icon_open",kind:"icon",label:"Icoon als het open staat",fallback:"shutterOpen"},{key:"icon_closed",kind:"icon",label:"Icoon als het dicht is",fallback:"shutter"},{key:"tone",kind:"tone",label:"Kleur"}]}schema(){return[{name:"covers",selector:{entity:{domain:"cover",multiple:!0}}},{name:"show_stop",selector:b.bool()}]}label(e){return{covers:"Rolluiken",show_stop:"Stopknop tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="covers")return"Melden ze hun stand terug, dan komt er vanzelf een schuif bij. Zo niet, dan blijven het open, stop en dicht, en volgt het icoon de knop die je indrukt."}};O("domotiapp-cover-card-editor",Qt);M("domotiapp-cover-card",dt,{name:"DomotiApp Rolluiken",description:"Open, stop en dicht, met een eigen icoon voor open en dicht."});function Wa(i){if(!i)return{label:"Onbekend",home:null};switch(i.state){case"home":return{label:"Thuis",home:!0};case"not_home":return{label:"Afwezig",home:!1};case"unknown":case"unavailable":return{label:"Onbekend",home:null};default:return{label:i.state,home:!1}}}var pt=class extends A{validate(e){let t=e.persons??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,persons:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[I]:"Kies minstens \xE9\xE9n persoon."}}watched(){return this.config.persons.map(e=>e.entity)}template(){let e=this.config;e.bare&&this.setAttribute("bare","");let t=e.columns??Math.min(e.persons.length,6),n=e.persons.map((a,o)=>`
      <button class="p" type="button" data-i="${o}" style="--tone:var(--dac-ink-3)">
        <span class="av"><span class="ph"></span></span>
        <span class="nm"></span>
        <span class="st"></span>
      </button>`).join("");return`<div class="card surface"><div class="chips" style="--cols:${t}">${n}</div></div>`}wire(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i];this.teardown_.push(L(e,{onTap:()=>Y(this,t.entity)}))})}paint(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i],n=_(this.hass,t.entity),a=Wa(n);e.style.setProperty("--tone",a.home===!0?"var(--dac-good)":a.home===!1?"var(--dac-bad)":"var(--dac-warn)");let o=C(this.hass,t.entity,t.name);this.text(e.querySelector(".nm"),o),this.text(e.querySelector(".st"),a.label);let s=e.querySelector(".ph"),r=n?.attributes?.entity_picture,c=r?`img:${r}`:o?`ini:${o[0]}`:"icon";s.dataset.kind!==c&&(s.dataset.kind=c,s.innerHTML=r?`<img src="${r}" alt="" loading="lazy" />`:o?o[0].toUpperCase():E.person),e.setAttribute("aria-label",`${o}, ${a.label}`)})}rows_(){let e=this.config?.columns??Math.min(this.config?.persons?.length??1,6),t=Math.ceil((this.config?.persons?.length??1)/e);return te(20+t*74+(t-1)*6)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:"full",rows:e,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-person-card-editor")}static getStubConfig(e){return{persons:Object.keys(e?.states??{}).filter(n=>n.startsWith("person.")).slice(0,6)}}};v(pt,"css",`
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
  `);var en=class extends j{setConfig(e){let t={...e},n=(e.persons??[]).map(a=>typeof a=="string"?{entity:a}:a);t.persons=n.map(a=>a.entity);for(let a of n)a.name&&(t[`naam:${a.entity}`]=a.name);super.setConfig(t)}serialize(e){let t={...e},n=t.persons??[];t.persons=n.map(a=>{let o=t[`naam:${a}`];return o?{entity:a,name:o}:a});for(let a of Object.keys(t))a.startsWith("naam:")&&delete t[a];return t}schema(){let e=(this.config_?.persons??[]).filter(t=>typeof t=="string");return[{name:"persons",selector:{entity:{domain:["person","device_tracker"],multiple:!0}}},...e.map(t=>({name:`naam:${t}`,selector:b.text()}))]}label(e){if(e.name==="persons")return"Personen";if(e.name.startsWith("naam:")){let t=e.name.slice(5);return`Naam voor ${this.hass?.states?.[t]?.attributes?.friendly_name??t}`}return super.label(e)}helper(e){if(e.name==="persons")return"Thuis is groen, weg is rood, geen melding is oranje. Per persoon kun je hieronder een eigen naam zetten."}};O("domotiapp-person-card-editor",en);M("domotiapp-person-card",pt,{name:"DomotiApp Personen",description:"Wie er thuis is, compact. Het hele huishouden in \xE9\xE9n kaart."});var Ga=[[/gft|groente|tuin|organi/i,"teal","binWheeled"],[/pmd|plastic|verpakking/i,"solar","binWheeled"],[/papier|karton/i,"water","binWheeled"],[/rest|grijs/i,"neutral","binWheeled"],[/textiel|kleding/i,"pink","bin"],[/glas/i,"magenta","bin"],[/kerstboom|snoei|takken/i,"teal","bin"]];function Ba(i){for(let[e,t,n]of Ga)if(e.test(i))return{tone:t,icon:n};return{tone:"accent",icon:"bin"}}var oi=i=>String(i??"").replace(/^(afvalbeheer|afvalwijzer|mijnafvalwijzer)\s*/i,"").replace(/\s*(mijnafvalwijzer)\s*/i," ").trim(),ht=class extends A{validate(e){let t=e.sensors??e.entities??(e.entity?[e.entity]:[]);return t.length?{show_hero:!0,show_list:!0,...e,sensors:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[I]:"Kies minstens \xE9\xE9n afvalsensor waarvan de status een datum is."}}watched(){return this.config.sensors.map(e=>e.entity)}read_(){let e=new Date;return this.config.sensors.map(t=>{let n=_(this.hass,t.entity);if(!n)return null;let a=Ae(n.state)??Ae(n.attributes.date)??Ae(n.attributes.next_date);if(!a)return null;let o=t.label??oi(C(this.hass,t.entity,t.name)),s=Ba(t.label??t.entity+o),r=this.config.tones?.[t.entity];return{label:o,date:a,days:zt(e,a),tone:N(r??t.tone??s.tone),icon:t.icon??s.icon}}).filter(t=>t&&t.days>=0).sort((t,n)=>t.date-n.date)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`
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
      </div>`}paint(){let e=this.read_(),t=this.$(".hero"),n=this.$(".list"),a=this.$(".empty");if(a.hidden=e.length>0,t&&(t.hidden=e.length===0,e.length)){let o=e[0];t.style.setProperty("--tone",o.tone),this.setAttribute("urgency",o.days===0?"today":o.days===1?"tomorrow":"later");let s=t.querySelector(".bin");s.dataset.icon!==o.icon&&(s.dataset.icon=o.icon,s.innerHTML=w(o.icon,"bin")),this.text(t.querySelector(".eyebrow"),Mt(o.date)),this.text(t.querySelector(".big"),o.label),this.text(t.querySelector(".n"),o.days===0?"nu":String(o.days)),this.text(t.querySelector(".u"),o.days===0?"aan de weg":o.days===1?"dag":"dagen")}if(n){let o=this.config.show_hero===!1?e:e.slice(1),s=o.map(r=>`${r.label}${+r.date}`).join("|");if(n.dataset.sig===s)return;n.dataset.sig=s,n.innerHTML=o.map(r=>{let c=Mt(r.date),l=r.days<=6?`<small>${Rn(r.date)}</small>`:"";return`
        <div class="r" style="--tone:${r.tone}">
          <i></i><span>${r.label}</span>
          <span class="d">${c}${l}</span>
        </div>`}).join("")}}rows_(){let e=this.config?.sensors?.length??1;return this.config?.show_list===!1?1:this.config?.show_hero===!1?Math.max(1,te(20+e*33)):Math.max(2,e)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-waste-card-editor")}static getStubConfig(e){return{sensors:Object.keys(e?.states??{}).filter(n=>/afval|waste|trash|garbage|ophaal/i.test(n)&&n.startsWith("sensor.")).filter(n=>Ae(e.states[n]?.state)).slice(0,6),title:"Afvalkalender"}}};v(ht,"css",`
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
  `);var tn=class extends j{defaults(){return{show_hero:!0,show_list:!0}}setConfig(e){let t={...e};for(let[n,a]of Object.entries(e.tones??{}))t[`kleur:${n}`]=a;delete t.tones,super.setConfig(t)}serialize(e){let t={...e},n={};for(let a of Object.keys(t))a.startsWith("kleur:")&&(t[a]&&(n[a.slice(6)]=t[a]),delete t[a]);return Object.keys(n).length?t.tones=n:delete t.tones,t}ids_(){return(this.config_?.sensors??[]).map(e=>typeof e=="string"?e:e.entity).filter(Boolean)}pickers(){return this.ids_().map(e=>({key:`kleur:${e}`,kind:"tone",label:`Kleur voor ${oi(this.hass?.states?.[e]?.attributes?.friendly_name??e)||e}`,compact:!0,after:!0}))}schema(){return[{name:"sensors",selector:{entity:{domain:"sensor",multiple:!0}}}]}label(e){return{sensors:"Afvalsensoren",show_hero:"Eerstvolgende uitlichten",show_list:"Overige data tonen",bare:"Zonder kaartrand"}[e.name]??super.label(e)}helper(e){if(e.name==="sensors")return"Sensoren waarvan de status een datum is, bijvoorbeeld 18-08-2026. De kaart sorteert zelf; laat een kleur leeg om de bakkleur op de naam te laten kiezen."}};O("domotiapp-waste-card-editor",tn);M("domotiapp-waste-card",ht,{name:"DomotiApp Afvalkalender",description:"Eerstvolgende ophaling als hero, de rest eronder. Kleur per fractie."});var ut=globalThis,mt=ut.ShadowRoot&&(ut.ShadyCSS===void 0||ut.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,nn=Symbol(),si=new WeakMap,Ce=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==nn)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(mt&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=si.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&si.set(t,e))}return e}toString(){return this.cssText}},J=i=>new Ce(typeof i=="string"?i:i+"",void 0,nn),V=(i,...e)=>{let t=i.length===1?i[0]:e.reduce((n,a,o)=>n+(s=>{if(s._$cssResult$===!0)return s.cssText;if(typeof s=="number")return s;throw Error("Value passed to 'css' function must be a 'css' function result: "+s+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+i[o+1],i[0]);return new Ce(t,i,nn)},ri=(i,e)=>{if(mt)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let n=document.createElement("style"),a=ut.litNonce;a!==void 0&&n.setAttribute("nonce",a),n.textContent=t.cssText,i.appendChild(n)}},an=mt?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(let n of e.cssRules)t+=n.cssText;return J(t)})(i):i;var{is:qa,defineProperty:Fa,getOwnPropertyDescriptor:Za,getOwnPropertyNames:Xa,getOwnPropertySymbols:Ya,getPrototypeOf:Ja}=Object,gt=globalThis,li=gt.trustedTypes,Qa=li?li.emptyScript:"",eo=gt.reactiveElementPolyfillSupport,Ne=(i,e)=>i,on={toAttribute(i,e){switch(e){case Boolean:i=i?Qa:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},di=(i,e)=>!qa(i,e),ci={attribute:!0,type:String,converter:on,reflect:!1,useDefault:!1,hasChanged:di};Symbol.metadata??=Symbol("metadata"),gt.litPropertyMetadata??=new WeakMap;var Q=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ci){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),a=this.getPropertyDescriptor(e,n,t);a!==void 0&&Fa(this.prototype,e,a)}}static getPropertyDescriptor(e,t,n){let{get:a,set:o}=Za(this.prototype,e)??{get(){return this[t]},set(s){this[t]=s}};return{get:a,set(s){let r=a?.call(this);o?.call(this,s),this.requestUpdate(e,r,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ci}static _$Ei(){if(this.hasOwnProperty(Ne("elementProperties")))return;let e=Ja(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Ne("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Ne("properties"))){let t=this.properties,n=[...Xa(t),...Ya(t)];for(let a of n)this.createProperty(a,t[a])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[n,a]of t)this.elementProperties.set(n,a)}this._$Eh=new Map;for(let[t,n]of this.elementProperties){let a=this._$Eu(t,n);a!==void 0&&this._$Eh.set(a,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let a of n)t.unshift(an(a))}else e!==void 0&&t.push(an(e));return t}static _$Eu(e,t){let n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return ri(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),a=this.constructor._$Eu(e,n);if(a!==void 0&&n.reflect===!0){let o=(n.converter?.toAttribute!==void 0?n.converter:on).toAttribute(t,n.type);this._$Em=e,o==null?this.removeAttribute(a):this.setAttribute(a,o),this._$Em=null}}_$AK(e,t){let n=this.constructor,a=n._$Eh.get(e);if(a!==void 0&&this._$Em!==a){let o=n.getPropertyOptions(a),s=typeof o.converter=="function"?{fromAttribute:o.converter}:o.converter?.fromAttribute!==void 0?o.converter:on;this._$Em=a;let r=s.fromAttribute(t,o.type);this[a]=r??this._$Ej?.get(a)??r,this._$Em=null}}requestUpdate(e,t,n,a=!1,o){if(e!==void 0){let s=this.constructor;if(a===!1&&(o=this[e]),n??=s.getPropertyOptions(e),!((n.hasChanged??di)(o,t)||n.useDefault&&n.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(s._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:a,wrapped:o},s){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),o!==!0||s!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),a===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[a,o]of this._$Ep)this[a]=o;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[a,o]of n){let{wrapped:s}=o,r=this[a];s!==!0||this._$AL.has(a)||r===void 0||this.C(a,void 0,o,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};Q.elementStyles=[],Q.shadowRootOptions={mode:"open"},Q[Ne("elementProperties")]=new Map,Q[Ne("finalized")]=new Map,eo?.({ReactiveElement:Q}),(gt.reactiveElementVersions??=[]).push("2.1.2");var hn=globalThis,pi=i=>i,ft=hn.trustedTypes,hi=ft?ft.createPolicy("lit-html",{createHTML:i=>i}):void 0,vi="$lit$",ie=`lit$${Math.random().toFixed(9).slice(2)}$`,_i="?"+ie,to=`<${_i}>`,re=document,Le=()=>re.createComment(""),De=i=>i===null||typeof i!="object"&&typeof i!="function",un=Array.isArray,no=i=>un(i)||typeof i?.[Symbol.iterator]=="function",sn=`[ 	
\f\r]`,Oe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ui=/-->/g,mi=/>/g,oe=RegExp(`>|${sn}(?:([^\\s"'>=/]+)(${sn}*=${sn}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),gi=/'/g,fi=/"/g,xi=/^(?:script|style|textarea|title)$/i,mn=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),g=mn(1),Pr=mn(2),Vr=mn(3),le=Symbol.for("lit-noChange"),f=Symbol.for("lit-nothing"),bi=new WeakMap,se=re.createTreeWalker(re,129);function ki(i,e){if(!un(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return hi!==void 0?hi.createHTML(e):e}var io=(i,e)=>{let t=i.length-1,n=[],a,o=e===2?"<svg>":e===3?"<math>":"",s=Oe;for(let r=0;r<t;r++){let c=i[r],l,p,u=-1,m=0;for(;m<c.length&&(s.lastIndex=m,p=s.exec(c),p!==null);)m=s.lastIndex,s===Oe?p[1]==="!--"?s=ui:p[1]!==void 0?s=mi:p[2]!==void 0?(xi.test(p[2])&&(a=RegExp("</"+p[2],"g")),s=oe):p[3]!==void 0&&(s=oe):s===oe?p[0]===">"?(s=a??Oe,u=-1):p[1]===void 0?u=-2:(u=s.lastIndex-p[2].length,l=p[1],s=p[3]===void 0?oe:p[3]==='"'?fi:gi):s===fi||s===gi?s=oe:s===ui||s===mi?s=Oe:(s=oe,a=void 0);let x=s===oe&&i[r+1].startsWith("/>")?" ":"";o+=s===Oe?c+to:u>=0?(n.push(l),c.slice(0,u)+vi+c.slice(u)+ie+x):c+ie+(u===-2?r:x)}return[ki(i,o+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},Ie=class i{constructor({strings:e,_$litType$:t},n){let a;this.parts=[];let o=0,s=0,r=e.length-1,c=this.parts,[l,p]=io(e,t);if(this.el=i.createElement(l,n),se.currentNode=this.el.content,t===2||t===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(a=se.nextNode())!==null&&c.length<r;){if(a.nodeType===1){if(a.hasAttributes())for(let u of a.getAttributeNames())if(u.endsWith(vi)){let m=p[s++],x=a.getAttribute(u).split(ie),h=/([.?@])?(.*)/.exec(m);c.push({type:1,index:o,name:h[2],strings:x,ctor:h[1]==="."?ln:h[1]==="?"?cn:h[1]==="@"?dn:ke}),a.removeAttribute(u)}else u.startsWith(ie)&&(c.push({type:6,index:o}),a.removeAttribute(u));if(xi.test(a.tagName)){let u=a.textContent.split(ie),m=u.length-1;if(m>0){a.textContent=ft?ft.emptyScript:"";for(let x=0;x<m;x++)a.append(u[x],Le()),se.nextNode(),c.push({type:2,index:++o});a.append(u[m],Le())}}}else if(a.nodeType===8)if(a.data===_i)c.push({type:2,index:o});else{let u=-1;for(;(u=a.data.indexOf(ie,u+1))!==-1;)c.push({type:7,index:o}),u+=ie.length-1}o++}}static createElement(e,t){let n=re.createElement("template");return n.innerHTML=e,n}};function xe(i,e,t=i,n){if(e===le)return e;let a=n!==void 0?t._$Co?.[n]:t._$Cl,o=De(e)?void 0:e._$litDirective$;return a?.constructor!==o&&(a?._$AO?.(!1),o===void 0?a=void 0:(a=new o(i),a._$AT(i,t,n)),n!==void 0?(t._$Co??=[])[n]=a:t._$Cl=a),a!==void 0&&(e=xe(i,a._$AS(i,e.values),a,n)),e}var rn=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,a=(e?.creationScope??re).importNode(t,!0);se.currentNode=a;let o=se.nextNode(),s=0,r=0,c=n[0];for(;c!==void 0;){if(s===c.index){let l;c.type===2?l=new Pe(o,o.nextSibling,this,e):c.type===1?l=new c.ctor(o,c.name,c.strings,this,e):c.type===6&&(l=new pn(o,this,e)),this._$AV.push(l),c=n[++r]}s!==c?.index&&(o=se.nextNode(),s++)}return se.currentNode=re,a}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}},Pe=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,a){this.type=2,this._$AH=f,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=xe(this,e,t),De(e)?e===f||e==null||e===""?(this._$AH!==f&&this._$AR(),this._$AH=f):e!==this._$AH&&e!==le&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):no(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==f&&De(this._$AH)?this._$AA.nextSibling.data=e:this.T(re.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,a=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=Ie.createElement(ki(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===a)this._$AH.p(t);else{let o=new rn(a,this),s=o.u(this.options);o.p(t),this.T(s),this._$AH=o}}_$AC(e){let t=bi.get(e.strings);return t===void 0&&bi.set(e.strings,t=new Ie(e)),t}k(e){un(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,n,a=0;for(let o of e)a===t.length?t.push(n=new i(this.O(Le()),this.O(Le()),this,this.options)):n=t[a],n._$AI(o),a++;a<t.length&&(this._$AR(n&&n._$AB.nextSibling,a),t.length=a)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let n=pi(e).nextSibling;pi(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},ke=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,a,o){this.type=1,this._$AH=f,this._$AN=void 0,this.element=e,this.name=t,this._$AM=a,this.options=o,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=f}_$AI(e,t=this,n,a){let o=this.strings,s=!1;if(o===void 0)e=xe(this,e,t,0),s=!De(e)||e!==this._$AH&&e!==le,s&&(this._$AH=e);else{let r=e,c,l;for(e=o[0],c=0;c<o.length-1;c++)l=xe(this,r[n+c],t,c),l===le&&(l=this._$AH[c]),s||=!De(l)||l!==this._$AH[c],l===f?e=f:e!==f&&(e+=(l??"")+o[c+1]),this._$AH[c]=l}s&&!a&&this.j(e)}j(e){e===f?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},ln=class extends ke{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===f?void 0:e}},cn=class extends ke{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==f)}},dn=class extends ke{constructor(e,t,n,a,o){super(e,t,n,a,o),this.type=5}_$AI(e,t=this){if((e=xe(this,e,t,0)??f)===le)return;let n=this._$AH,a=e===f&&n!==f||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,o=e!==f&&(n===f||a);a&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},pn=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){xe(this,e)}};var ao=hn.litHtmlPolyfillSupport;ao?.(Ie,Pe),(hn.litHtmlVersions??=[]).push("3.3.3");var yi=(i,e,t)=>{let n=t?.renderBefore??e,a=n._$litPart$;if(a===void 0){let o=t?.renderBefore??null;n._$litPart$=a=new Pe(e.insertBefore(Le(),o),o,void 0,t??{})}return a._$AI(i),a};var gn=globalThis,P=class extends Q{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=yi(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return le}};P._$litElement$=!0,P.finalized=!0,gn.litElementHydrateSupport?.({LitElement:P});var oo=gn.litElementPolyfillSupport;oo?.({LitElement:P});(gn.litElementVersions??=[]).push("4.2.2");var F=V`
  :host {
    ${J(ee)}
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  ${J(Be)}
`;var so=["unavailable","unknown"],ro=["color_temp_kelvin","rgb_color","hs_color","xy_color"];function bt({scene:i,memberEntityIds:e,states:t}){let n=[],a=[],o=i?.lights??{},s=Array.isArray(e)?e:[],r=t??{};for(let c of s){let l=o[c];if(!l||typeof l!="object")continue;let p=r[c];if(!p||so.includes(p.state)){a.push(c);continue}if(l.state==="off"){n.push({service:"turn_off",data:{entity_id:c,transition:1}});continue}let u={entity_id:c,transition:1};typeof l.brightness=="number"&&(u.brightness=l.brightness);for(let m of ro)if(l[m]!==void 0){u[m]=l[m];break}n.push({service:"turn_on",data:u})}return{oproepen:n,overgeslagen:a}}async function vt(i,e){let t=await Promise.allSettled(e.map(a=>i(a.service,a.data))),n=[];return t.forEach((a,o)=>{a.status==="rejected"&&n.push({entityId:e[o].data.entity_id,fout:a.reason})}),n}var bn=["hs","rgb","rgbw","rgbww","xy"],vn="color_temp",lo="onoff";var ce="kleur";var co=["unavailable","unknown"],$i=["color_temp_kelvin","rgb_color","hs_color","xy_color"],po=[0,100];function Z(i){if(!i)return{bekend:!1,beschikbaar:!1,helderheid:!1,kleurtemp:!1,kleur:!1,minKelvin:2e3,maxKelvin:6535,kelvinUitDefaults:!1};let e=i.attributes??{},t=Array.isArray(e.supported_color_modes)?e.supported_color_modes:null,n=t!==null&&t.length===1&&t[0]===lo,a=t!==null&&t.includes(vn),o=t!==null&&t.some(l=>bn.includes(l)),s=e.min_color_temp_kelvin,r=e.max_color_temp_kelvin,c=typeof s=="number"&&typeof r=="number"&&s<r;return{bekend:!0,beschikbaar:!co.includes(i.state),helderheid:!n,kleurtemp:a,kleur:o,minKelvin:c?Math.round(s):2e3,maxKelvin:c?Math.round(r):6535,kelvinUitDefaults:a&&!c}}function ho(){return{state:"off"}}function Ei(i,e){let t=e??Z(i);return t.bekend&&t.beschikbaar&&i.state==="on"?{state:"on",...vo(i,t)}:t.helderheid?{state:"on",brightness:255}:{state:"on"}}function Si(i,e,t,n){return e?i&&i.state==="on"?{...i}:Ei(t,n):{state:"off"}}function Ai(i,e,t,n){let a=n??Z(t),o=$n(i,t,a);return a.helderheid&&(o.brightness=z(e,1,255)),o}function _n(i,e,t,n){let a=n??Z(t),o=$n(i,t,a);return Ii(o),o.color_temp_kelvin=z(e,a.minKelvin,a.maxKelvin),o}function xn(i,e,t,n){let a=n??Z(t),o=$n(i,t,a);return Ii(o),o.hs_color=[z(e?.[0],0,360),z(e?.[1],0,100)],o}function _t(i,e,t){return i??ho()}function zi(i,e,t){let n=_t(i,e,t);if(typeof n.brightness=="number")return z(n.brightness,1,255);let a=e?.attributes?.brightness;return typeof a=="number"?z(a,1,255):255}function kn(i,e,t){let n=t??Z(e),a=_t(i,e,n);if(typeof a.color_temp_kelvin=="number")return z(a.color_temp_kelvin,n.minKelvin,n.maxKelvin);let o=e?.attributes?.color_temp_kelvin;return typeof o=="number"?z(o,n.minKelvin,n.maxKelvin):Math.round((n.minKelvin+n.maxKelvin)/2)}function xt(i,e,t){let n=_t(i,e,t);if(fn(n.hs_color))return[z(n.hs_color[0],0,360),z(n.hs_color[1],0,100)];let a=e?.attributes?.hs_color;return fn(a)?[z(a[0],0,360),z(a[1],0,100)]:[...po]}function yn(i){return i!=null&&typeof i=="object"}function Mi(i,e,t){let n=Array.isArray(e)?e:[],a=Array.isArray(i)?i:[],o=Number.isInteger(t)?t:a.length;return n.filter(s=>{for(let r=0;r<o;r+=1)if(!yn(a[r]?.lights?.[s]))return!0;return!1})}function ji(i){return!Number.isInteger(i)||i<=0?null:i===1?"1 lamp nog niet ingesteld":`${i} lampen nog niet ingesteld`}function wn(i,e,t){return _t(i,e,t).state==="on"}function Ti(i,e,t){let n=t??Z(e);if(!n.bekend)return{aanuit:!1,helderheid:!1,kleurtemp:!1,kleur:!1,kleurkeuze:!1,stand:null};let a=wn(i,e,n),o=Ci(n),s=o?uo(i,e,n):null;return{aanuit:!0,helderheid:a&&n.helderheid,kleurtemp:a&&n.kleurtemp&&(!o||s==="wit"),kleur:a&&n.kleur&&(!o||s===ce),kleurkeuze:a&&o,stand:a?s:null}}function Ci(i){return!!(i?.kleurtemp&&i?.kleur)}function uo(i,e,t){let n=t??Z(e);if(i&&typeof i=="object"){if(typeof i.color_temp_kelvin=="number")return"wit";if($i.slice(1).some(o=>i[o]!==void 0))return ce}let a=e?.attributes?.color_mode;return a===vn&&n.kleurtemp?"wit":bn.includes(a)&&n.kleur?ce:"wit"}function Ni(i,e,t,n){let a=n??Z(t);return Ci(a)?e==="wit"?_n(i,kn(i,t,a),t,a):xn(i,xt(i,t,a),t,a):i}function Oi(i){let e=z(i,0,255);return e<=0?0:Math.max(1,Math.round(e/255*100))}function Li(i){let e=z(i,1,100);return z(Math.round(e/100*255),1,255)}var mo=1e3,go=4e4,wi=7;function fo(i){let e=z(i,mo,go)/100,t=e<=66?255:329.698727446*(e-60)**-.1332047592,n=e<=66?99.4708025861*Math.log(e)-161.1195681661:288.1221695283*(e-60)**-.0755148492,a;return e>=66?a=255:e<=19?a=0:a=138.5177312231*Math.log(e-10)-305.0447927307,[z(t,0,255),z(n,0,255),z(a,0,255)]}function bo(i){let[e,t,n]=fo(i);return`rgb(${e}, ${t}, ${n})`}function Di(i,e){let t=Math.min(i,e),n=Math.max(i,e);return`linear-gradient(to right, ${Array.from({length:wi},(o,s)=>{let r=s/(wi-1),c=t+(n-t)*r;return`${bo(c)} ${Math.round(r*100)}%`}).join(", ")})`}function vo(i,e){let t=i.attributes??{},n={};e.helderheid&&(n.brightness=typeof t.brightness=="number"?z(t.brightness,1,255):255);let a=t.color_mode;return e.kleurtemp&&a===vn&&typeof t.color_temp_kelvin=="number"?n.color_temp_kelvin=z(t.color_temp_kelvin,e.minKelvin,e.maxKelvin):e.kleur&&bn.includes(a)&&fn(t.hs_color)&&(n.hs_color=[z(t.hs_color[0],0,360),z(t.hs_color[1],0,100)]),n}function $n(i,e,t){return i&&i.state==="on"?{...i}:Ei(e,t)}function Ii(i){for(let e of $i)delete i[e]}function fn(i){return Array.isArray(i)&&i.length===2&&typeof i[0]=="number"&&typeof i[1]=="number"}function z(i,e,t){let n=Number(i);return Number.isFinite(n)?Math.min(t,Math.max(e,Math.round(n))):e}var kt="domotiapp-scene-card",En="domotiapp-scene-card-editor",Pi="domotiapp-scene-editor";var Ve=["een","twee","drie"],Vi="pencil",Ri=["grid_options","layout_options","view_layout","visibility"];var Hi="entity_id",ye=class extends P{constructor(){super();v(this,"_label",t=>t.name==="entity"?"Lichtgroep":this._friendlyName(t.name));v(this,"_helper",t=>t.name==="entity"?"De lichtgroep waarvan deze kaart de scenes beheert.":t.name);this._getypt={}}setConfig(t){this._config={...t}}_lichtgroepen(){let t=this.hass?.states??{};return Object.keys(t).filter(n=>n.startsWith("light.")&&Array.isArray(t[n].attributes?.[Hi]))}_leden(){let t=this._config?.entity,n=this.hass?.states?.[t]?.attributes?.[Hi];return Array.isArray(n)?n.filter(a=>a!==t):[]}_entiteitSchema(){let t=this._lichtgroepen();return[{name:"entity",required:!0,selector:t.length?{entity:{include_entities:t}}:{entity:{domain:"light"}}}]}_namenSchema(t){return t.map(n=>({name:n,selector:{text:{}}}))}_naamData(t){let n=this._config?.name_overrides??{},a={};for(let o of t)o in this._getypt?a[o]=this._getypt[o]:n[o]&&(a[o]=n[o]);return a}_friendlyName(t){return this.hass?.states?.[t]?.attributes?.friendly_name||t}_entiteitGewijzigd(t){t.stopPropagation();let n={...this._config,entity:t.detail.value.entity};n.entity!==this._config?.entity&&(delete n.name_overrides,this._getypt={}),this._stuurDoor(n)}_namenGewijzigd(t){t.stopPropagation(),this._getypt={...this._getypt,...t.detail.value};let n={};for(let[o,s]of Object.entries(this._getypt))typeof s=="string"&&s.trim()&&(n[o]=s.trim());let a={...this._config};Object.keys(n).length?a.name_overrides=n:delete a.name_overrides,this._stuurDoor(a)}_stuurDoor(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return f;let t=this._leden();return g`
      <ha-form
        .hass=${this.hass}
        .data=${{entity:this._config.entity??""}}
        .schema=${this._entiteitSchema()}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._entiteitGewijzigd}
      ></ha-form>

      ${t.length?g`
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
          `:f}
    `}};v(ye,"properties",{hass:{attribute:!1},_config:{state:!0},_getypt:{state:!0}}),v(ye,"styles",[F,V`
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
    `]);var _o="domotiapp_lovelace/snapshot/create",xo="domotiapp_lovelace/snapshot/close",yt=class{constructor({roepCommandoAan:e,entityId:t}){this._roep=e,this._entityId=t,this._aanmaak=null,this._afsluiting=null}get heeftSnapshot(){return this._aanmaak!==null}get isGesloten(){return this._afsluiting!==null}async zorgVoorSnapshot(){return this._aanmaak===null&&(this._aanmaak=this._roep(_o,{entity_id:this._entityId}).catch(e=>{throw this._aanmaak=null,e})),this._aanmaak}async sluit({opslaan:e=!1}={}){return this.heeftSnapshot?this._afsluiting!==null?this._afsluiting:(this._afsluiting=(async()=>{try{await this._aanmaak}catch{return{gedaan:!1}}return await this._roep(xo,{entity_id:this._entityId,restore:!e}),{gedaan:!0}})(),this._afsluiting):{gedaan:!1}}};async function Ki({beheer:i,oproepen:e,voerUit:t}){return await i.zorgVoorSnapshot(),t(e)}var An="laden",zn="klaar",Ui="fout",wo=`linear-gradient(to right, ${[0,60,120,180,240,300,360].map(i=>`hsl(${i}, 100%, 50%)`).join(", ")})`,we=class extends P{constructor(){super(),this._scenes=null,this._leden=[],this._tab=0,this._toestand=An,this._melding="",this._bezig=!1,this._kelvinGemeld=new Set,this._snapshot=null}firstUpdated(){this._haalOp()}async _haalOp(){this._toestand=An;try{let e=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:this.entityId});return this._neemOver(e),this._toestand=zn,e}catch(e){return this._melding=e?.message??String(e),this._toestand=Ui,null}}_neemOver(e){this._scenes=Array.from({length:3},(t,n)=>{let a=e.scenes?.[n]??{};return{icon:a.icon||Ve[n],lights:{...a.lights??{}}}}),this._leden=e.member_entity_ids??[],this._melding=""}_stateVan(e){return this.hass?.states?.[e]}_besturingVan(e){let t=Z(this._stateVan(e));return t.kelvinUitDefaults&&!this._kelvinGemeld.has(e)&&(this._kelvinGemeld.add(e),console.warn(`domotiapp-scene-editor: ${e} meldt geen Kelvin-grenzen; ${t.minKelvin}\u2013${t.maxKelvin} K aangehouden (SPEC 6.3).`)),t}_waardeVan(e){return this._scenes?.[this._tab]?.lights?.[e]}_zetLamp(e,t){this._scenes=this._scenes.map((n,a)=>{if(a!==this._tab)return n;let o={...n.lights};return t===void 0?delete o[e]:o[e]=t,{...n,lights:o}})}_zetIcoon(e){this._scenes=this._scenes.map((t,n)=>n===this._tab?{...t,icon:e||Ve[n]}:t)}_kiesTab(e){this._tab=e}get _kanOpslaan(){return this._toestand===zn&&!this._bezig&&this._leden.length>0}async _slaOp(){if(!this._kanOpslaan)return;this._bezig=!0,this._melding="";try{await this.hass.callWS({type:"domotiapp_lovelace/scenes/save",entity_id:this.entityId,scenes:this._scenes})}catch(t){this._melding=t?.message??String(t),this._bezig=!1;return}let e=await this._haalOp();this._bezig=!1,e&&this.dispatchEvent(new CustomEvent("scenes-opgeslagen",{detail:e,bubbles:!0,composed:!0})),this._sluit({opslaan:!0})}get _beheer(){return this._snapshot===null&&(this._snapshot=new yt({entityId:this.entityId,roepCommandoAan:(e,t)=>this.hass.callWS({type:e,...t})})),this._snapshot}get _kanVoorbeeld(){return this._toestand===zn&&!this._bezig&&this._leden.length>0}async _voorbeeld(){if(!this._kanVoorbeeld)return;let{oproepen:e}=bt({scene:this._scenes[this._tab],memberEntityIds:this._leden,states:this.hass.states});this._bezig=!0,this._melding="";try{let t=await Ki({beheer:this._beheer,oproepen:e,voerUit:n=>vt((a,o)=>this.hass.callService("light",a,o),n)});t.length&&(this._melding=`Deze lampen reageerden niet: ${t.map(n=>this._naam(n.entityId)).join(", ")}.`)}catch(t){this._melding=`Het voorbeeld is niet gestart: ${t?.message??String(t)}`}finally{this._bezig=!1}}_sluit({opslaan:e=!1}={}){this.dispatchEvent(new CustomEvent("editor-gesloten",{bubbles:!0,composed:!0})),this._sluitSnapshot({opslaan:e})}async _sluitSnapshot({opslaan:e}){try{await this._beheer.sluit({opslaan:e})}catch(t){console.warn(`domotiapp-scene-editor: de snapshot kon niet worden ${e?"verwijderd":"hersteld"}: ${t?.message??t}`)}}disconnectedCallback(){super.disconnectedCallback(),this._snapshot&&this._snapshot.heeftSnapshot&&this._sluitSnapshot({opslaan:!1})}_dialoogGesloten(e){e.stopPropagation(),this._sluit()}_naam(e){return this.nameOverrides?.[e]||this._stateVan(e)?.attributes?.friendly_name||e}render(){return g`
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
    `}_renderInhoud(){return this._toestand===An?g`<div class="inhoud">Bezig met laden…</div>`:this._toestand===Ui?g`
        <div class="inhoud">
          <ha-alert alert-type="error">${this._melding}</ha-alert>
        </div>
      `:g`
      <div class="inhoud">
        <ha-tab-group>
          ${this._scenes.map((e,t)=>g`
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

        ${this._melding?g`<ha-alert alert-type="error">${this._melding}</ha-alert>`:f}
        ${this._leden.length===0?g`<ha-alert alert-type="info">
              Deze lichtgroep bevat geen lampen.
            </ha-alert>`:g`<div class="lampen">
              ${this._leden.map(e=>this._renderLamp(e))}
            </div>`}
      </div>
    `}_renderLamp(e){let t=this._stateVan(e),n=this._besturingVan(e),a=this._waardeVan(e),o=wn(a,t,n),s=Ti(a,t,n);return g`
      <div class="lamp">
        <div class="kop">
          <div class="naam">
            <span class="tekst">
              ${this._naam(e)}
              ${n.bekend?n.beschikbaar?f:g`<span class="hint">niet bereikbaar</span>`:g`<span class="hint">lamp niet gevonden</span>`}
            </span>
            ${yn(a)?f:g`<span class="nieuw">nieuw</span>`}
          </div>
          ${n.bekend?g`
                <div class="bediening">
                  ${s.kleurkeuze?this._renderKleurkeuze(e,t,n,a,s.stand):f}
                  <ha-switch
                    .checked=${o}
                    @change=${r=>this._zetLamp(e,Si(a,r.target.checked,t,n))}
                  ></ha-switch>
                </div>
              `:f}
        </div>
        ${this._renderBesturing(e,t,n,a,s)}
      </div>
    `}_renderBesturing(e,t,n,a,o){return g`
      ${o.helderheid?this._renderHelderheid(e,t,n,a):f}
      ${o.kleurtemp?this._renderKleurtemp(e,t,n,a):f}
      ${o.kleur?this._renderKleur(e,t,n,a):f}
    `}_renderHelderheid(e,t,n,a){let o=Oi(zi(a,t,n)),s=r=>{r.stopPropagation(),this._zetLamp(e,Ai(this._waardeVan(e),Li(r.detail.value),t,n))};return g`
      <div class="besturing">
        <div class="label">
          <span>Helderheid</span><span>${o} %</span>
        </div>
        <ha-control-slider
          touch-action="pan-y"
          unit="%"
          .min=${1}
          .max=${100}
          .step=${1}
          .value=${o}
          @slider-moved=${s}
          @value-changed=${s}
        ></ha-control-slider>
      </div>
    `}_renderKleurkeuze(e,t,n,a,o){let s=r=>c=>{c.stopPropagation(),r!==o&&this._zetLamp(e,Ni(this._waardeVan(e),r,t,n))};return g`
      <div class="kleurkeuze">
        <button
          class="keuze ${o===ce?"actief":""}"
          aria-pressed=${o===ce?"true":"false"}
          @click=${s(ce)}
        >
          Kleur
        </button>
        <button
          class="keuze ${o==="wit"?"actief":""}"
          aria-pressed=${o==="wit"?"true":"false"}
          @click=${s("wit")}
        >
          Wit
        </button>
      </div>
    `}_renderKleurtemp(e,t,n,a){let o=kn(a,t,n),s=r=>{r.stopPropagation(),this._zetLamp(e,_n(this._waardeVan(e),r.detail.value,t,n))};return g`
      <div class="besturing">
        <div class="label">
          <span>Kleurtemperatuur</span><span>${o} K</span>
        </div>
        <ha-control-slider
          touch-action="pan-y"
          mode="cursor"
          .min=${n.minKelvin}
          .max=${n.maxKelvin}
          .step=${1}
          .value=${o}
          style=${`--control-slider-background: ${Di(n.minKelvin,n.maxKelvin)}; --control-slider-background-opacity: 1`}
          @slider-moved=${s}
          @value-changed=${s}
        ></ha-control-slider>
      </div>
    `}_renderKleur(e,t,n,a){let[o,s]=xt(a,t,n),r=c=>l=>{l.stopPropagation();let p=xt(this._waardeVan(e),t,n),u=c==="tint"?[l.detail.value,p[1]]:[p[0],l.detail.value];this._zetLamp(e,xn(this._waardeVan(e),u,t,n))};return g`
      <div class="besturing">
        <div class="label">
          <span>Kleur</span><span>${o}° / ${s} %</span>
        </div>
        <div class="kleurregelaars">
          <div class="schuiven">
            <ha-control-slider
              touch-action="pan-y"
              mode="cursor"
              .min=${0}
              .max=${360}
              .step=${1}
              .value=${o}
              style=${`--control-slider-background: ${wo}; --control-slider-background-opacity: 1`}
              @slider-moved=${r("tint")}
              @value-changed=${r("tint")}
            ></ha-control-slider>
            <ha-control-slider
              touch-action="pan-y"
              .min=${0}
              .max=${100}
              .step=${1}
              .value=${s}
              style=${`--control-slider-color: hsl(${o}, 100%, 50%)`}
              @slider-moved=${r("verzadiging")}
              @value-changed=${r("verzadiging")}
            ></ha-control-slider>
          </div>
          <div
            class="staal"
            style=${`background: hsl(${o}, ${s}%, 50%)`}
          ></div>
        </div>
      </div>
    `}};v(we,"properties",{hass:{attribute:!1},entityId:{attribute:!1},nameOverrides:{attribute:!1},_scenes:{state:!0},_leden:{state:!0},_tab:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0}}),v(we,"styles",[F,V`
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
    `]);var $o="0.2.0",Eo=["type","entity","name_overrides"],Mn="laden",Re="klaar",jn="leeg",Tn="geen-groep",Wi="opslagfout",Gi="fout",He=class extends P{constructor(){super(),this._scenes=null,this._leden=[],this._toestand=Mn,this._melding="",this._bezig=!1,this._editorOpen=!1,this._opgehaaldVoor=null,this._bestondVorigeKeer=!1}static getConfigElement(){return document.createElement(En)}static getStubConfig(e){return{entity:Object.keys(e?.states??{}).find(n=>n.startsWith("light.")&&Array.isArray(e.states[n].attributes?.entity_id))??""}}setConfig(e){if(!e?.entity)throw new Error("Kies een lichtgroep bij 'entity'.");let t=Object.keys(e).filter(n=>!Eo.includes(n)&&!Ri.includes(n));t.length&&console.warn(`${kt}: onbekende sleutels in de configuratie: ${t.join(", ")}`),this._config=e}getCardSize(){return 1}getGridOptions(){return{rows:"auto",columns:"full",min_columns:6}}willUpdate(){let e=this._config?.entity;if(!this.hass||!e)return;let t=!!this.hass.states[e];if(this._opgehaaldVoor!==e){this._opgehaaldVoor=e,this._bestondVorigeKeer=t,this._haalScenesOp();return}if(t&&!this._bestondVorigeKeer&&this._toestand===Tn){this._bestondVorigeKeer=!0,this._haalScenesOp();return}this._bestondVorigeKeer=t}async _haalScenesOp(){let e=this._config.entity;this._toestand=Mn,this._melding="";try{let t=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:e});this._scenes=t.scenes,this._leden=t.member_entity_ids??[],this._toestand=this._leden.length===0?jn:Re}catch(t){this._verwerkFout(t,e)}}_verwerkFout(e,t){let n=e?.code;if(this._melding=e?.message??String(e),n==="home_assistant_error"){this._toestand=Wi;return}if(!this.hass.states[t]){this._toestand=Tn;return}this._toestand=Gi}_naam(e){return this._config?.name_overrides?.[e]||this.hass?.states?.[e]?.attributes?.friendly_name||e}async _pasSceneToe(e){if(this._bezig||this._toestand!==Re)return;let{oproepen:t}=bt({scene:this._scenes?.[e],memberEntityIds:this._leden,states:this.hass.states});if(t.length){this._bezig=!0;try{let n=await vt((a,o)=>this.hass.callService("light",a,o),t);n.length&&this._meldMislukking(n.map(a=>a.entityId))}finally{this._bezig=!1}}}_meldMislukking(e){let t=e.map(a=>this._naam(a)).join(", "),n=e.length===1?`${t} reageerde niet.`:`Deze lampen reageerden niet: ${t}.`;this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:n},bubbles:!0,composed:!0}))}_bewerk(){this._toestand===Re&&(this._editorOpen=!0)}_sluitEditor(){this._editorOpen=!1}_scenesOpgeslagen(e){e.stopPropagation(),this._scenes=e.detail.scenes,this._leden=e.detail.member_entity_ids??[],this._toestand=this._leden.length===0?jn:Re}render(){if(!this._config)return f;switch(this._toestand){case Tn:return this._renderFout(`Lichtgroep ${this._config.entity} bestaat niet (meer). Pas de kaart aan.`);case Wi:return this._renderFout("De opgeslagen scenes van deze kamer zijn onleesbaar.",this._melding);case Gi:return this._renderFout("De scenes konden niet geladen worden.",this._melding);default:return this._renderKaart()}}_renderFout(e,t){return g`
      <div class="needs">
        <span class="mark">${this._icoon("question")}</span>
        <span>
          <b>${e}</b>
          ${t?g`<span class="detail">${t}</span>`:f}
        </span>
      </div>
    `}_icoon(e){let t=document.createElement("template");return t.innerHTML=w(e),t.content.cloneNode(!0)}_renderKaart(){let e=this._toestand===jn,t=this._toestand===Mn,n=this._iconen();return g`
      <div class="card surface">
        <div class="rij">
          <div class="scenes">
            ${n.map((a,o)=>g`
                <button
                  type="button"
                  class="chip"
                  ?disabled=${e||t||this._bezig}
                  aria-label=${`Scene ${o+1}`}
                  title=${`Scene ${o+1}`}
                  @click=${()=>this._pasSceneToe(o)}
                >
                  ${this._icoon(a)}
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
            ${this._icoon(Vi)}
          </button>
        </div>
        ${e?g`<div class="mededeling">Deze lichtgroep bevat geen lampen.</div>`:this._renderNieuweLampen()}
      </div>
      ${this._editorOpen?this._renderEditor():f}
    `}_renderNieuweLampen(){if(this._toestand!==Re)return f;let e=Mi(this._scenes,this._leden,3).length,t=ji(e);return t?g`<div class="mededeling">${t}</div>`:f}_renderEditor(){return g`
      <domotiapp-scene-editor
        .hass=${this.hass}
        .entityId=${this._config.entity}
        .nameOverrides=${this._config.name_overrides}
        @editor-gesloten=${this._sluitEditor}
        @scenes-opgeslagen=${this._scenesOpgeslagen}
      ></domotiapp-scene-editor>
    `}_iconen(){return Array.from({length:3},(e,t)=>this._scenes?.[t]?.icon||Ve[t])}};v(He,"properties",{hass:{attribute:!1},_config:{state:!0},_scenes:{state:!0},_leden:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0},_editorOpen:{state:!0}}),v(He,"styles",[F,V`
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
    `]);D(kt,He);D(En,ye);D(Pi,we);be({type:kt,name:"DomotiApp Scene",description:`Drie lichtscenes per kamer, vastgelegd bij de lichtgroep (v${$o}).`,preview:!1});var de="domotiapp-alarm-card",Cn="domotiapp-alarm-card-editor",Bi="domotiapp-alarm-editor",qi="DomotiApp Alarm",Fi="https://github.com/Sven2410/domotiapp-lovelace",X="domotiapp_lovelace",W=Object.freeze({get:`${X}/alarms/get`,save:`${X}/alarms/save`,setEnabled:`${X}/alarms/set_enabled`,delete:`${X}/alarms/delete`,stop:`${X}/alarms/stop`,clearMessage:`${X}/alarms/clear_message`,search:`${X}/sound/search`,entities:`${X}/entities/list`,previewStart:`${X}/preview/start`,subscribe:`${X}/updates/subscribe`}),$t="#026FA1";function Zi(i){let e=typeof i?.name=="string"?i.name.trim():"",t=typeof i?.time=="string"?i.time.trim():"";return e&&t?`Wil je de wekker "${e}" van ${t} verwijderen?`:e?`Wil je de wekker "${e}" verwijderen?`:t?`Wil je de wekker van ${t} verwijderen?`:"Wil je deze wekker verwijderen?"}var So="07:00";var Ao=["uri","name","media_type","image"],zo="Let op: deze tijd bestaat twee nachten per jaar niet, of twee keer. Bij de overgang naar zomertijd wordt het uur van 02:00 tot 03:00 overgeslagen; die nacht gaat deze wekker niet af. Bij de overgang naar wintertijd komt dat uur twee keer voorbij; die nacht gaat hij twee keer af. Kies een tijd v\xF3\xF3r 02:00 of n\xE1 03:00 als dat een probleem is.",Mo="Dit geluid stopt van zichzelf. Een los nummer is na een paar minuten voorbij; daarna is het stil. Kies een afspeellijst of een radiostation als de wekker moet blijven spelen tot je hem uitzet.";var jo="Music Assistant Wekker",To="Verlichting Wekker";function Et(){return{id:null,name:"",time:So,days:[],enabled:!0,sound:null,endless:null,speaker:"",volume_pct:40,light:null}}function Xi(i){let e=Et();return!i||typeof i!="object"?e:{id:typeof i.id=="string"?i.id:null,name:typeof i.name=="string"?i.name:"",time:Nn(i.time)?i.time:e.time,days:Array.isArray(i.days)?[...i.days]:[],enabled:i.enabled!==!1,sound:Ke(i.sound),endless:null,speaker:typeof i.speaker=="string"?i.speaker:"",volume_pct:Number.isInteger(i.volume_pct)?i.volume_pct:e.volume_pct,light:i.light&&typeof i.light=="object"?{entity_id:i.light.entity_id,brightness_pct:Number.isInteger(i.light.brightness_pct)?i.light.brightness_pct:60}:null}}function Ke(i){if(!i||typeof i!="object"||Array.isArray(i)||typeof i.uri!="string"||!i.uri)return null;let e={};for(let t of Ao)e[t]=i[t]===void 0?null:i[t];return e}function Nn(i){if(typeof i!="string"||i.length!==5||i[2]!==":")return!1;let e=Number(i.slice(0,2)),t=Number(i.slice(3));return!/^\d\d$/.test(i.slice(0,2))||!/^\d\d$/.test(i.slice(3))?!1:e>=0&&e<=23&&t>=0&&t<=59}function On(i){let e=[];return!i||typeof i!="object"?{ok:!1,ontbreekt:["alles"]}:((typeof i.name!="string"||!i.name.trim())&&e.push("een naam"),Nn(i.time)||e.push("een geldige tijd"),i.speaker||e.push("een speaker"),(!i.sound||!i.sound.uri)&&e.push("een geluid"),(!Number.isInteger(i.volume_pct)||i.volume_pct<1||i.volume_pct>100)&&e.push("een volume tussen 1 en 100"),{ok:e.length===0,ontbreekt:e})}function Yi(i){let e={name:(i.name||"").trim(),time:i.time,days:[...new Set(i.days||[])].sort((t,n)=>t-n),enabled:i.enabled!==!1,sound:Ke(i.sound),speaker:i.speaker,volume_pct:i.volume_pct,light:i.light?{entity_id:i.light.entity_id,brightness_pct:i.light.brightness_pct}:null};return i.id&&(e.id=i.id),e}function Ji(i,e){let t=new Set(i||[]);return t.has(e)?t.delete(e):t.add(e),[...t].sort((n,a)=>n-a)}function Qi(i){return Nn(i)&&i.slice(0,2)==="02"?zo:null}function ea(i){return i===!1?Mo:null}function ta(i){return typeof i?.endless=="boolean"?i.endless:null}function St(i,e){let t=e==="lamp",n=t?To:jo,a=t?"lampen":"speakers";return!i||typeof i!="object"?`De lijst met ${a} is niet op te halen.`:i.label_exists===!1?`Het label '${n}' bestaat nog niet. De beheerder moet dat label aanmaken en op de ${a} zetten die als wekker mogen dienen.`:Array.isArray(i.entities)&&i.entities.length>0?null:Number(i.filtered_out)>0?t?`De entiteiten met het label '${n}' zijn geen lampen.`:"De gelabelde speakers zijn geen Music Assistant-speakers, of ze kunnen geen volume instellen.":`Er zijn nog geen ${a} met het label '${n}'.`}function na(i,e){return St(e,"speaker")!==null?!1:On(i).ok}var No=[[1,"ma"],[2,"di"],[3,"wo"],[4,"do"],[5,"vr"],[6,"za"],[7,"zo"]],Oo=[["","Alles"],["playlist","Afspeellijsten"],["radio","Radio"],["artist","Artiesten"],["album","Albums"],["track","Nummers"],["podcast","Podcasts"]],Ue="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",Lo="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",Do="M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z",$e=class extends P{constructor(){super(),this._concept=Et(),this._zoekterm="",this._soort="",this._treffers=null,this._zoekt=!1,this._melding=null,this._speelt=!1,this._bezig=!1,this._afmeldenVoorbeeld=null,this._opEscape=e=>{e.key==="Escape"&&this._annuleren()}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this._opEscape,!0)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this._opEscape,!0),this._stopVoorbeeld()}willUpdate(e){e.has("wekker")&&(this._concept=this.wekker?Xi(this.wekker):Et(),this._treffers=null,this._zoekterm="",this._melding=null)}_zet(e){this._concept={...this._concept,...e}}async _startVoorbeeld(){if(!(this._speelt||!this.hass)){if(!this._concept.speaker||!this._concept.sound){this._melding={tekst:"Kies eerst een speaker en een geluid.",fout:!0};return}this._melding=null;try{this._afmeldenVoorbeeld=await this.hass.connection.subscribeMessage(()=>{},{type:W.previewStart,speaker:this._concept.speaker,sound:Ke(this._concept.sound),volume_pct:this._concept.volume_pct,light:this._concept.light??null}),this._speelt=!0}catch(e){this._melding={tekst:e?.message??"Het voorbeeld kon niet starten.",fout:!0}}}}_stopVoorbeeld(){if(this._afmeldenVoorbeeld){try{this._afmeldenVoorbeeld()}catch(e){console.warn(`domotiapp-alarm-editor: afmelden mislukt: ${e?.message??e}`)}this._afmeldenVoorbeeld=null}this._speelt=!1}async _zoek(){let e=(this._zoekterm||"").trim();if(!(!e||!this.hass)){this._zoekt=!0,this._melding=null;try{let t={type:W.search,query:e,limit:20};this._soort&&(t.media_types=[this._soort]);let n=await this.hass.callWS(t);this._treffers=n.results??[]}catch(t){this._treffers=[],this._melding={tekst:t?.message??"Zoeken is mislukt.",fout:!0}}finally{this._zoekt=!1}}}_kiesGeluid(e){this._zet({sound:Ke(e),endless:ta(e)}),this._treffers=null}async _opslaan(){if(this._bezig||!this.hass)return;let e=On(this._concept);if(!e.ok){this._melding={tekst:`Er ontbreekt nog ${e.ontbreekt.join(", ")}.`,fout:!0};return}this._bezig=!0;try{let t=await this.hass.callWS({type:W.save,person:this.person,alarm:Yi(this._concept)});this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-opgeslagen",{detail:{toestand:t},bubbles:!0,composed:!0}))}catch(t){this._melding={tekst:t?.message??"Opslaan is mislukt.",fout:!0}}finally{this._bezig=!1}}_annuleren(){this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-dicht",{bubbles:!0,composed:!0}))}_svg(e){return g`<svg class="icoon" viewBox="0 0 24 24" aria-hidden="true">
      <path d=${e} />
    </svg>`}render(){if(!this.hass)return f;let e=this._concept,t=this.entiteiten?.speakers,n=this.entiteiten?.lights,a=St(t,"speaker"),o=St(n,"lamp"),s=Qi(e.time),r=ea(e.endless),c=na(e,t);return g`
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
        ${s?g`<div class="waarschuwing">
              ${this._svg(Ue)}<span>${s}</span>
            </div>`:f}
      </div>

      <div class="blok">
        <label class="veld">Herhaling</label>
        <div class="dagen">
          ${No.map(([l,p])=>g`<button
              type="button"
              aria-pressed=${e.days.includes(l)?"true":"false"}
              aria-label=${p}
              @click=${()=>this._zet({days:Ji(e.days,l)})}
            >
              ${p}
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
        ${a?g`<div class="uitleg">${this._svg(Ue)}<span>${a}</span></div>`:g`<div class="vak">
              <select
                id="speaker"
                .value=${e.speaker}
                @change=${l=>this._zet({speaker:l.target.value})}
              >
                <option value="">Kies een speaker…</option>
                ${(t?.entities??[]).map(l=>g`<option value=${l.entity_id} ?selected=${l.entity_id===e.speaker}>
                    ${l.name}
                  </option>`)}
              </select>
            </div>`}
      </div>

      <div class="blok">
        <label class="veld" for="zoek">Geluid</label>
        ${e.sound?g`<div class="gekozen">
              ${e.sound.image?g`<img src=${e.sound.image} alt="" />`:f}
              <span>${e.sound.name||e.sound.uri}</span>
              <span class="soort" style="margin-left:auto">${e.sound.media_type??""}</span>
            </div>`:f}
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
              ${Oo.map(([l,p])=>g`<option value=${l}>${p}</option>`)}
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
            ${this._svg(this._zoekt?Do:Lo)}
          </button>
        </div>
        ${this._treffers?g`<div class="treffers">
              ${this._treffers.length===0?g`<div class="treffer">Niets gevonden.</div>`:this._treffers.map(l=>g`<button
                      class="treffer"
                      type="button"
                      @click=${()=>this._kiesGeluid(l)}
                    >
                      ${l.image?g`<img src=${l.image} alt="" />`:f}
                      <span>${l.name}</span>
                      <span class="soort">${l.media_type??""}</span>
                    </button>`)}
            </div>`:f}
        ${r?g`<div class="waarschuwing">${this._svg(Ue)}<span>${r}</span></div>`:f}
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
        ${o?g`<div class="uitleg">${this._svg(Ue)}<span>${o}</span></div>`:g`
              <div class="vak">
                <select
                  id="lamp"
                  @change=${l=>this._zet({light:l.target.value?{entity_id:l.target.value,brightness_pct:e.light?.brightness_pct??60}:null})}
                >
                  <option value="">Geen lamp</option>
                  ${(n?.entities??[]).map(l=>g`<option
                      value=${l.entity_id}
                      ?selected=${l.entity_id===e.light?.entity_id}
                    >
                      ${l.name}
                    </option>`)}
                </select>
              </div>
              ${e.light?g`<label class="veld" style="margin-top:10px" for="helderheid">
                      Helderheid: ${e.light.brightness_pct}%
                    </label>
                    <input
                      id="helderheid"
                      type="range"
                      min="1"
                      max="100"
                      .value=${String(e.light.brightness_pct)}
                      @input=${l=>this._zet({light:{...e.light,brightness_pct:Number(l.target.value)}})}
                    />`:f}
            `}
      </div>

      ${this._melding?g`<div class="blok">
            <div class="waarschuwing ${this._melding.fout?"fout":""}">
              ${this._svg(Ue)}<span>${this._melding.tekst}</span>
            </div>
          </div>`:f}

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
          ?disabled=${!c||this._bezig}
          @click=${()=>this._opslaan()}
        >
          Opslaan
        </button>
      </div>
    `}};v($e,"properties",{hass:{attribute:!1},person:{attribute:!1},wekker:{attribute:!1},entiteiten:{attribute:!1},_concept:{state:!0},_zoekterm:{state:!0},_soort:{state:!0},_treffers:{state:!0},_zoekt:{state:!0},_melding:{state:!0},_speelt:{state:!0},_bezig:{state:!0}}),v($e,"styles",[F,V`
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${J($t)});
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
    button.knop:hover:not(:disabled) {
      background: var(--dac-border);
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
    .treffer:hover {
      background: var(--dac-border);
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
  `]);var ia="person",Io="Kies een persoon in de kaartinstellingen.",aa="De gekozen persoon is niet gevonden.",Po="De opgeslagen wekkers van deze persoon zijn onleesbaar.",Il=Object.freeze(["grid_options","layout_options","view_layout","visibility"]);function oa(i){if(!i||typeof i!="object"||Array.isArray(i))throw new Error("De kaartconfig ontbreekt of is geen object.");let e=i.person;if(e==null||e==="")return{...i};if(typeof e!="string")throw new Error("'person' moet een entity-ID zijn, zoals person.sven.");if(!e.startsWith(`${ia}.`))throw new Error(`'${e}' zit niet in het domein ${ia}. Kies een persoon, zoals person.sven.`);return{...i}}function sa(i){return{type:`custom:${i}`}}function ra(i,e){return i?e?{soort:"ok",tekst:null,isFout:!1}:{soort:"weg",tekst:aa,isFout:!0}:{soort:"ontbreekt",tekst:Io,isFout:!1}}function la(i,e){return i==="not_found"?aa:i==="home_assistant_error"?Po:e||"Er ging iets mis bij het ophalen van de wekkers."}var Vo=["ma","di","wo","do","vr","za","zo"],Ro="Geen wekkers ingesteld",Ho="Eenmalig",Ko="Eenmalig \u2014 afgelopen",Uo="Geen wekker actief",ca="Stoppen",Wo="Er is een melding over deze wekker, maar de tekst ontbreekt.";function Go(i){return!Array.isArray(i)||i.length===0?Ho:[...new Set(i)].sort((t,n)=>t-n).map(t=>Vo[t-1]??"?").join(" ")}function Bo(i,e){return!i||Array.isArray(i.days)&&i.days.length>0?!1:Date.parse(i?.one_shot_at??"")<=e}function da(i,e){return Bo(i,e)?Ko:Go(i?.days)}function pa(i){let e=i?.last_message;return!e||typeof e!="object"||Array.isArray(e)?null:{tekst:typeof e.text=="string"&&e.text.trim()?e.text:Wo,severity:e.severity==="error"?"error":"notice",isFout:e.severity==="error",kind:typeof e.kind=="string"?e.kind:null}}function ha(i){let e=i?.alarms;if(!Array.isArray(e)||e.length===0)return Ro;let t=i?.next_fire?.text;return typeof t=="string"&&t.trim()?t:Uo}function ua(i,e){let t=[...new Set((e??[]).filter(s=>typeof s=="string"))];if(t.length===0)return null;let n=t.map(s=>(i??[]).find(r=>r?.id===s)).filter(Boolean),a=n.map(s=>s.name).filter(Boolean),o=[...new Set(n.map(s=>s.time).filter(Boolean))];return{ids:t,naam:a.length?a.join(" en "):"Wekker",tijd:o.join(" en ")}}var qo="0.2.0",Fo="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",Zo="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z",ma="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",Xo="M13,14H11V9H13M13,18H11V16H13M1,21H23L12,2L1,21Z",At=(i,e="icoon")=>g`<svg class=${e} viewBox="0 0 24 24" aria-hidden="true">
    <path d=${i} />
  </svg>`,We=class extends P{constructor(){super(),this._toestand=null,this._fout=null,this._bevestigVoor=null,this._bezig=!1,this._tijdelijkeMelding=null,this._editorVoor=void 0,this._entiteiten=null,this._abonnementVoor=null,this._afmelden=null}setConfig(e){let t=oa(e),n=t.person!==this._config?.person;this._config=t,n&&(this._toestand=null,this._fout=null,this._bevestigVoor=null,this._herstartAbonnement())}static getConfigElement(){return document.createElement(Cn)}static getStubConfig(){return sa(de)}getGridOptions(){return{rows:"auto",columns:12,min_columns:6}}getCardSize(){if(this._stop())return 3;let e=this._toestand?.alarms?.length??0;return 1+Math.max(e,1)}connectedCallback(){super.connectedCallback(),this._herstartAbonnement()}disconnectedCallback(){super.disconnectedCallback(),this._stopAbonnement()}updated(e){e.has("hass")&&this.hass&&this._startAbonnement()}async _startAbonnement(){let e=this._config?.person;if(!(!this.hass||!e||!this.isConnected)&&this._abonnementVoor!==e){this._abonnementVoor=e;try{let t=await this.hass.connection.subscribeMessage(n=>this._opGebeurtenis(n),{type:W.subscribe,person:e});if(this._abonnementVoor!==e){t();return}this._afmelden=t}catch(t){console.warn(`${de}: abonneren mislukt: ${t?.message??t}`)}await this._haalOp()}}_stopAbonnement(){if(this._afmelden){try{this._afmelden()}catch(e){console.warn(`${de}: afmelden mislukt: ${e?.message??e}`)}this._afmelden=null}this._abonnementVoor=null}_herstartAbonnement(){this._stopAbonnement(),this._startAbonnement()}_opGebeurtenis(e){let t=e?.alarm_id,n=e?.event;if(typeof t=="string"&&this._toestand){let a=new Set(this._toestand.ringing??[]);n==="started"?a.add(t):a.delete(t),this._toestand={...this._toestand,ringing:[...a]}}this._haalOp()}async _haalOp(){let e=this._config?.person;if(!(!this.hass||!e))try{let t=await this.hass.callWS({type:W.get,person:e});if(this._config?.person!==e)return;this._toestand=t,this._fout=null}catch(t){if(this._config?.person!==e)return;this._toestand=null,this._fout=la(t?.code,t?.message)}}async _roep(e){if(!(!this.hass||this._bezig)){this._bezig=!0;try{let t=await this.hass.callWS(e);t&&typeof t=="object"&&(this._toestand=t,this._fout=null)}catch(t){this._toon(t?.message??"De opdracht is niet gelukt.")}finally{this._bezig=!1}}}async _openEditor(e){if(this._bevestigVoor=null,this._editorVoor=e,!!this.hass)try{this._entiteiten=await this.hass.callWS({type:W.entities})}catch(t){this._entiteiten=null,console.warn(`${de}: entiteitenlijst ophalen mislukt: ${t?.message??t}`)}}_sluitEditor(){this._editorVoor=void 0}_toon(e){this._tijdelijkeMelding=e,clearTimeout(this._meldingTimer),this._meldingTimer=setTimeout(()=>{this._tijdelijkeMelding=null},6e3)}_person(){return this._config?.person}_zetAan(e,t){this._roep({type:W.setEnabled,person:this._person(),alarm_id:e.id,enabled:t})}_verwijder(e){this._bevestigVoor=null,this._roep({type:W.delete,person:this._person(),alarm_id:e.id})}_begrepen(e){this._roep({type:W.clearMessage,person:this._person(),alarm_id:e.id})}async _stopAlles(e){for(let t of e)await this._roep({type:W.stop,person:this._person(),alarm_id:t})}_stop(){return this._toestand?ua(this._toestand.alarms,this._toestand.ringing):null}render(){if(!this._config)return f;let e=this._config.person,t=!!(e&&this.hass?.states?.[e]),n=ra(e,t);if(n.soort!=="ok")return this._mededeling(n.tekst,n.isFout);if(this._fout)return this._mededeling(this._fout,!0);if(!this._toestand)return this._mededeling("Wekkers ophalen\u2026",!1);let a=this._stop();return this._editorVoor!==void 0&&!a?g`<div class="card surface">
        <domotiapp-alarm-editor
          .hass=${this.hass}
          .person=${this._config.person}
          .wekker=${this._editorVoor}
          .entiteiten=${this._entiteiten}
          @editor-dicht=${()=>this._sluitEditor()}
          @editor-opgeslagen=${o=>{this._toestand=o.detail.toestand,this._sluitEditor()}}
        ></domotiapp-alarm-editor>
      </div>`:g`<div class="card surface">
      ${a?this._stopknop(a):this._lijst()}
      ${this._tijdelijkeMelding?g`<div class="onderrij">
            ${At(ma,"icoon klein")}
            <span class="boodschap">${this._tijdelijkeMelding}</span>
          </div>`:f}
    </div>`}_mededeling(e,t){return g`<div class="card surface">
      <div class="mededeling ${t?"fout":""}">${e}</div>
    </div>`}_stopknop(e){return g`<button
      class="stopknop"
      @click=${()=>this._stopAlles(e.ids)}
    >
      <div class="stop-tijd">${e.tijd}</div>
      <div class="stop-naam">${e.naam}</div>
      <div class="stop-woord">${ca}</div>
    </button>`}_lijst(){let e=this._toestand.alarms??[],t=Date.now();return g`
      <div class="kop ${e.length===0?"leeg":""}">
        <span class="volgende">${ha(this._toestand)}</span>
        <button
          class="icoonknop"
          title="Wekker toevoegen"
          aria-label="Wekker toevoegen"
          @click=${()=>this._openEditor(null)}
        >
          ${At(Fo)}
        </button>
      </div>
      ${e.map(n=>this._rij(n,t))}
    `}_bevestiging(e){return g`<div class="onderrij bevestiging">
      <span class="boodschap">${Zi(e)}</span>
      <button
        class="tekstknop"
        @click=${()=>{this._bevestigVoor=null}}
      >
        Annuleren
      </button>
      <button class="tekstknop gevaar" @click=${()=>this._verwijder(e)}>
        Verwijderen
      </button>
    </div>`}_rij(e,t){let n=pa(e),a=!!e.enabled;return g`
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
            <div class="sub">${da(e,t)}</div>
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
          ${At(Zo)}
        </button>
      </div>
      ${this._bevestigVoor===e.id?this._bevestiging(e):f}
      ${n?g`<div class="onderrij ${n.isFout?"fout":""}">
            ${At(n.isFout?Xo:ma,"icoon klein")}
            <span class="boodschap">${n.tekst}</span>
            <button class="tekstknop" @click=${()=>this._begrepen(e)}>
              Begrepen
            </button>
          </div>`:f}
    `}};v(We,"properties",{hass:{attribute:!1},_config:{state:!0},_toestand:{state:!0},_fout:{state:!0},_bevestigVoor:{state:!0},_bezig:{state:!0},_tijdelijkeMelding:{state:!0},_editorVoor:{state:!0},_entiteiten:{state:!0}}),v(We,"styles",[F,V`
    /* unsafeCSS en niet de constante rechtstreeks: lit weigert een gewone
       string in een css-template en gooit dan — op modulescope, wat SPEC 19.4
       verbiedt. De waarde is onze eigen constante en komt nergens van buiten. */
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${J($t)});
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
    button.icoonknop:hover {
      background: var(--dac-border);
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
    button.tekstknop:hover {
      background: var(--dac-border);
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
  `]);var Ee=class Ee extends P{constructor(){super(...arguments);v(this,"_label",t=>t.name==="person"?"Persoon":t.name)}setConfig(t){this._config={...t}}render(){return!this._config||!this.hass?f:g`
      <div class="uitleg">
        Elke persoon heeft zijn eigen wekkerlijst. De kaart toont alleen de
        wekkers van de gekozen persoon.
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${Ee._SCHEMA}
        .computeLabel=${this._label}
        @value-changed=${this._gewijzigd}
      ></ha-form>
    `}_gewijzigd(t){t.stopPropagation();let n={...this._config,...t.detail.value};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:n},bubbles:!0,composed:!0}))}};v(Ee,"properties",{hass:{attribute:!1},_config:{state:!0}}),v(Ee,"styles",[F,V`
    .uitleg {
      padding: 0 0 12px 0;
      color: var(--dac-ink-2);
      font-size: 11.5px;
    }
  `]),v(Ee,"_SCHEMA",[{name:"person",required:!0,selector:{entity:{filter:{domain:"person"}}}}]);var Ln=Ee;D(de,We);D(Cn,Ln);D(Bi,$e);be({type:de,name:qi,description:`Wekkerkaart van DomotiApp (v${qo}).`,preview:!1,documentationURL:Fi});var Yo="0.2.0";Un(i=>console.warn(`domotiapp-lovelace: ${i}`));console.info(`%c DOMOTIAPP-LOVELACE %c ${Yo} `,"background:#026fa1;color:#e8e4de;font-weight:600;border-radius:3px 0 0 3px;padding:2px 6px","background:#12120f;color:#e8e4de;border-radius:0 3px 3px 0;padding:2px 6px");export{Yo as VERSION};
