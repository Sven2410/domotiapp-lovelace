var Da=Object.defineProperty;var Pa=(i,e,t)=>e in i?Da(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var _=(i,e,t)=>Pa(i,typeof e!="symbol"?e+"":e,t);var Y=`
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
`,ge=`
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
`;function ie(i){let e=new CSSStyleSheet;return e.replaceSync(i),e}var q=i=>String(i??"").split(".")[0],b=(i,e)=>e&&i?.states?.[e]||null,D=(i,e)=>b(i,e)?.attributes??{},fe=(i,e,t)=>t?null:D(i,e).entity_picture||null;function Xe(i){if(!i||i.state!=="on")return null;let e=i.attributes??{};if(Array.isArray(e.entity_id))return null;let t=e.rgb_color;return Array.isArray(t)&&t.length>=3?`rgb(${t[0]},${t[1]},${t[2]})`:null}function S(i,e,t){return t||D(i,e).friendly_name||e||""}var Ha=new Set(["scene","script","input_button","button","event"]),Ae=i=>Ha.has(q(i));function P(i){return!i||i.state==="unavailable"?!0:i.state==="unknown"?!Ae(i.entity_id):!1}function ae(i){if(!i)return!1;let e=i.state;if(e==="unavailable"||e==="unknown")return!1;switch(q(i.entity_id)){case"cover":return e==="open"||e==="opening";case"alarm_control_panel":return e.startsWith("armed")||e==="triggered"||e==="arming";case"climate":case"water_heater":case"humidifier":return e!=="off";case"person":case"device_tracker":return e==="home";case"media_player":return e!=="off"&&e!=="idle"&&e!=="standby";default:return e==="on"||e==="playing"||e==="active"||e==="heat"}}var Ra=new Set(["light","switch","fan","input_boolean","automation","siren","humidifier","remote","water_heater"]),Ye=i=>Ra.has(q(i));function Qn(i,e,t){if(!i||i.themes!==e.themes||i.language!==e.language)return!0;for(let n of t)if(n&&i.states?.[n]!==e.states?.[n])return!0;return!1}function Ze(i,e,t={}){i.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!1}))}var R=(i,e)=>Ze(i,"hass-more-info",{entityId:e});function be(i){switch(q(i)){case"light":case"switch":case"fan":case"input_boolean":case"automation":case"siren":return{action:"toggle"};case"script":case"scene":case"input_button":case"button":return{action:"toggle"};default:return{action:"more-info"}}}function Ia(i){switch(q(i)){case"scene":return["scene","turn_on"];case"script":return["script","turn_on"];case"input_button":return["input_button","press"];case"button":return["button","press"];case"lock":return["lock","open"];case"cover":return["cover","toggle"];case"media_player":return["media_player","media_play_pause"];default:return["homeassistant","toggle"]}}function ee(i,e,t,n){if(!(!n||n.action==="none"))switch(n.action){case"more-info":R(i,n.entity||t.entity);break;case"toggle":{let a=n.entity||t.entity;if(!a)break;let[s,o]=Ia(a);e.callService(s,o,{entity_id:a});break}case"perform-action":case"call-service":{let a=n.perform_action||n.service;if(!a)break;let[s,o]=a.split(".");e.callService(s,o,n.data??n.service_data??{},n.target);break}case"navigate":if(!n.navigation_path)break;history.pushState(null,"",n.navigation_path),Ze(window,"location-changed",{replace:!1});break;case"url":n.url_path&&window.open(n.url_path,n.target??"_blank");break;case"assist":Ze(i,"show-dialog",{dialogTag:"ha-voice-command-dialog",dialogImport:()=>{},dialogParams:{}});break;case"fire-dom-event":Ze(i,"ll-custom",n);break;default:break}}function j(i,{onTap:e,onHold:t,onDouble:n}){let o=0,r=0,l=null,c=u=>{u.button!=null&&u.button!==0||(o=Date.now())},d=()=>{let u=o?Date.now()-o:0;if(o=0,t&&u>=500){navigator.vibrate?.(18),t();return}if(!n){e?.();return}if(r++,r===1){l=setTimeout(()=>{r=0,e?.()},260);return}clearTimeout(l),r=0,n()};return i.addEventListener("pointerdown",c),i.addEventListener("click",d),i.addEventListener("contextmenu",u=>u.preventDefault()),()=>{clearTimeout(l),i.removeEventListener("pointerdown",c),i.removeEventListener("click",d)}}function I(i,e){if(!e)return"";let t=q(e.entity_id),n=e.attributes.device_class;return i.formatEntityState?.(e)??i.localize?.(`component.${t}.entity_component.${n??"_"}.state.${e.state}`)??i.localize?.(`component.${t}.entity_component._.state.${e.state}`)??e.state}function K(i,e,t){let n=Number(e);return Number.isFinite(n)?n.toLocaleString(i?.locale?.language??"nl",{minimumFractionDigits:t??0,maximumFractionDigits:t??0}):"--"}var Yn=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],ei=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"],Jn=(i=new Date)=>new Date(i.getFullYear(),i.getMonth(),i.getDate()),Ot=(i,e)=>Math.round((Jn(e)-Jn(i))/864e5);function ze(i){if(!i)return null;if(i instanceof Date)return Number.isNaN(+i)?null:i;let e=String(i).trim(),t=e.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);if(t)return new Date(+t[3],+t[2]-1,+t[1]);if(t=e.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/),t)return new Date(+t[1],+t[2]-1,+t[3]);let n=new Date(e);return Number.isNaN(+n)?null:n}function Lt(i,e=new Date){if(!i)return"";let t=Ot(e,i);return t<0?`${Math.abs(t)} dagen geleden`:t===0?"vandaag":t===1?"morgen":t===2?"overmorgen":t<=6?Yn[i.getDay()]:`${Yn[i.getDay()].slice(0,2)} ${i.getDate()} ${ei[i.getMonth()]}`}var ti=i=>i?`${i.getDate()} ${ei[i.getMonth()]}`:"";var Va="home-assistant";function ni({leesRegistry:i,definities:e,waarschuw:t=()=>{},plan:n=(l,c)=>setTimeout(l,c),nu:a=()=>Date.now(),marker:s=Va,intervalMs:o=20,maxWachtMs:r=1e4}){let l=a();function c(){let m=i();if(!m)return!1;for(let[y,h]of e)try{m.get(y)||m.define(y,h)}catch(w){t(`kon ${y} niet registreren: ${w&&w.message}`)}return!0}function d(){let m=i();return!m||!m.get(s)?!1:c()}if(d())return!0;let u=()=>{if(!d()){if(a()-l>=r){t(`${s} is na ${r} ms niet verschenen; de kaart wordt alsnog geregistreerd`),c();return}n(u,o)}};return n(u,o),!1}var ii=[];function H(i,e){ii.push([i,e])}function ve({type:i,name:e,description:t,preview:n=!0,documentationURL:a}){window.customCards=window.customCards??[],!window.customCards.some(s=>s.type===i)&&window.customCards.push({type:i,name:e??i,description:t??"",preview:n,documentationURL:a??"https://github.com/Sven2410/domotiapp-lovelace"})}function ai(i=()=>{}){ni({leesRegistry:()=>globalThis.customElements,definities:ii,waarschuw:i})}var Ka=`
  :host {
    ${Y}
    display: block;
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  :host([hidden]) { display: none; }
`,k={accent:"var(--dac-accent-hi)",solar:"var(--dac-solar)",house:"var(--dac-house)",water:"var(--dac-grid-in)",magenta:"var(--dac-grid-out)",pink:"var(--dac-device-1)",teal:"var(--dac-device-2)",lit:"var(--dac-lit)",good:"var(--dac-good)",warn:"var(--dac-warn)",bad:"var(--dac-bad)",neutral:"var(--dac-ink-3)"},Je={accent:"Accent",solar:"Oranje",house:"Blauw",water:"Lichtblauw",magenta:"Magenta",pink:"Roze",teal:"Groenblauw",lit:"Lampgeel",good:"Goed",warn:"Let op",bad:"Kritiek",neutral:"Neutraal"},V=(i,e="accent")=>k[i]??(i&&/[#(]|^var/.test(i)?i:k[e]),O=Symbol("incomplete"),Ua=i=>`
  <div class="needs">
    <span class="mark"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6"/>
      <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>
    </svg></span>
    <span><b>Nog niets gekozen</b><span>${i}</span></span>
  </div>`,Wa=56,si=8,F=i=>Math.max(1,Math.ceil((i+si)/(Wa+si))),E=class extends HTMLElement{static get styleSheets_(){return Object.hasOwn(this,"sheets_")||(this.sheets_=[ie(Ka+ge+this.css)]),this.sheets_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=new.target.styleSheets_,this.built_=!1,this.wired_=!1,this.teardown_=[]}setConfig(e){let t=this.validate(e??{});this.config=t,this.built_&&(this.destroy_(),this.shadowRoot.replaceChildren(),this.built_=!1,this.wired_=!1),this.isConnected&&this.build_()}set hass(e){let t=this.hass_;if(this.hass_=e,!!this.config){if(!this.built_){this.build_();return}this.config[O]||Qn(t,e,this.watched())&&this.paint()}}get hass(){return this.hass_}connectedCallback(){if(this.config){if(!this.built_){this.build_();return}this.config[O]||this.wired_||(this.wire(),this.wired_=!0,this.hass_&&this.paint())}}disconnectedCallback(){this.destroy_(),this.wired_=!1}validate(e){return e}watched(){return this.config?.entity?[this.config.entity]:[]}template(){return""}wire(){}paint(){}build_(){let e=document.createElement("template"),t=this.config?.[O];e.innerHTML=t?Ua(t):this.template(),this.shadowRoot.appendChild(e.content),this.built_=!0,!t&&(this.wire(),this.wired_=!0,this.hass_&&this.paint())}destroy_(){for(let e of this.teardown_)try{e()}catch{}this.teardown_=[]}on(e,t,n,a){e&&(e.addEventListener(t,n,a),this.teardown_.push(()=>e.removeEventListener(t,n,a)))}$(e){return this.shadowRoot.querySelector(e)}$$(e){return[...this.shadowRoot.querySelectorAll(e)]}text(e,t){let n=typeof e=="string"?this.$(e):e;n&&n.textContent!==String(t)&&(n.textContent=t)}getCardSize(){return 1}};_(E,"css","");function A(i,e,{name:t,description:n,preview:a=!0}={}){H(i,e),ve({type:i,name:t,description:n,preview:a})}function C(i,e){H(i,e)}var p=(i,e="none")=>`<svg class="icon" viewBox="0 0 24 24" fill="${e}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${i}</svg>`,T={house:p(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
    <path d="M5.4 12.9V20a.9.9 0 0 0 .9.9h11.4a.9.9 0 0 0 .9-.9v-7.1"/>
    <path d="M9.8 20.9v-5.2h4.4v5.2"/>`),floorB:p(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M9.4 17.8V14h2.4a1.9 1.9 0 0 1 0 3.8Z"/>`),floor1:p(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M10.6 15.2 12 14v3.9"/>`),floor2:p(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M10.4 14.8a1.6 1.6 0 0 1 3.1.5c0 1.4-3.1 1.8-3.1 3.5h3.2"/>`),garage:p(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M8.2 20.4v-5.6h7.6v5.6M8.2 17.6h7.6"/>`),garageOpen:p(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M7.6 14.4h8.8M7.6 12.4h8.8"/>`),garageClosed:p(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M7.6 13.2h8.8M7.6 15.4h8.8M7.6 17.6h8.8M7.6 19.8h8.8"/>`),shutter:p(`<path d="M3.6 4.2h16.8M5.2 4.2v13.4M18.8 4.2v13.4"/>
    <path d="M5.2 7.6h13.6M5.2 11h13.6M5.2 14.4h13.6M5.2 17.6h13.6"/>`),shutterOpen:p(`<path d="M3.6 4.2h16.8M5.2 4.2v15.6M18.8 4.2v15.6"/>
    <path d="M5.2 6.6h13.6M5.2 8.6h13.6"/>`),awning:p(`<path d="M2.8 11.4 6.2 5h11.6l3.4 6.4z"/>
    <path d="M2.8 11.4c1.5 1.7 3 1.7 4.5 0s3-1.7 4.5 0 3 1.7 4.5 0 3-1.7 4.5 0"/>
    <path d="M12 14.6v4.8"/>`),arrowUp:p('<path d="M12 19.4V5M6.4 10.6 12 5l5.6 5.6"/>'),arrowDown:p('<path d="M12 4.6V19M17.6 13.4 12 19l-5.6-5.6"/>'),stop:p('<rect x="6.4" y="6.4" width="11.2" height="11.2" rx="1.8"/>'),bulb:p(`<path d="M9.4 18.4h5.2M10.4 21.2h3.2"/>
    <path d="M12 2.9a6.2 6.2 0 0 0-3.6 11.2c.5.4.8 1 .8 1.7v.4h5.6v-.4c0-.7.3-1.3.8-1.7A6.2 6.2 0 0 0 12 2.9Z"/>`),bulbGroup:p(`<path d="M7.6 15.6h4M8.2 17.8h2.8"/>
    <path d="M9.6 3.4a4.8 4.8 0 0 0-2.8 8.7c.4.3.6.8.6 1.3v.5h4.4v-.5c0-.5.2-1 .6-1.3a4.8 4.8 0 0 0-2.8-8.7Z"/>
    <path d="M16 8.4a4.4 4.4 0 0 1 2.4 8c-.3.3-.5.7-.5 1.1v.4h-3.8"/>
    <path d="M15.4 20.6h2.4"/>`),switchOn:p(`<rect x="2.8" y="7.4" width="18.4" height="9.2" rx="4.6"/>
    <circle cx="16.6" cy="12" r="2.6" fill="currentColor" stroke="none"/>`),person:p(`<circle cx="12" cy="7.6" r="3.6"/>
    <path d="M4.8 20.4v-1.2a5 5 0 0 1 5-5h4.4a5 5 0 0 1 5 5v1.2"/>`),people:p(`<circle cx="9.4" cy="8.2" r="3.2"/>
    <path d="M3.4 20v-1a4.6 4.6 0 0 1 4.6-4.6h2.8A4.6 4.6 0 0 1 15.4 19v1"/>
    <path d="M16.2 5.3a3.2 3.2 0 0 1 0 5.9"/>
    <path d="M17.6 14.6a4.6 4.6 0 0 1 3 4.3V20"/>`),away:p(`<circle cx="10.4" cy="7.6" r="3.4"/>
    <path d="M3.6 20.4v-1.2a4.8 4.8 0 0 1 4.8-4.8h2.6"/>
    <path d="M14.6 17.4h6M18 14.8l2.6 2.6-2.6 2.6"/>`),bin:p(`<path d="M3.6 6.8h16.8"/>
    <path d="M9.4 6.8V4.6a.9.9 0 0 1 .9-.9h3.4a.9.9 0 0 1 .9.9v2.2"/>
    <path d="m5.9 6.8 1 12.5a1 1 0 0 0 1 .9h8.2a1 1 0 0 0 1-.9l1-12.5"/>
    <path d="M10.2 10.6v5.8M13.8 10.6v5.8"/>`),binWheeled:p(`<path d="M5.6 7.4h12.8l-1 10.6a1 1 0 0 1-1 .9H7.6a1 1 0 0 1-1-.9z"/>
    <path d="M4.4 7.4h15.2M9.6 7.4V5.2h4.8v2.2"/>
    <circle cx="8.6" cy="20.4" r="1.3"/><circle cx="15.4" cy="20.4" r="1.3"/>`),calendar:p(`<rect x="3.6" y="5.4" width="16.8" height="15" rx="2"/>
    <path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6"/>`),sun:p(`<circle cx="12" cy="12" r="4.1"/>
    <path d="M12 2.4v2.3M12 19.3v2.3M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.4 12h2.3M19.3 12h2.3M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>`),cloud:p('<path d="M7.2 18.4a4.2 4.2 0 0 1-.5-8.4 5.6 5.6 0 0 1 10.8-1.2 3.9 3.9 0 0 1 .6 7.7z"/>'),cloudSun:p(`<path d="M6.8 8.2a3.4 3.4 0 1 1 4.6 3.2"/>
    <path d="M5 4.6 6.1 5.7M3.2 9.2h1.6M9.4 4.6 8.3 5.7M6.8 1.9v1.5"/>
    <path d="M9.4 19.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10 1 3.6 3.6 0 0 1 .5 6.8z"/>`),rain:p(`<path d="M7.4 15.4a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M9 18.2 8.2 20.6M12.4 18.2l-.8 2.4M15.8 18.2l-.8 2.4"/>`),snow:p(`<path d="M7.4 14.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M9 17.6v3M7.6 18.4l2.8 1.4M10.4 18.4l-2.8 1.4"/>
    <path d="M15 17.6v3M13.6 18.4l2.8 1.4M16.4 18.4l-2.8 1.4"/>`),fog:p(`<path d="M7.4 12.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M4.4 16h15.2M6.4 19.4h11.2"/>`),wind:p(`<path d="M3.4 8.4h9.4a2.7 2.7 0 1 0-2.7-2.7"/>
    <path d="M3.4 12.6h13.2a2.7 2.7 0 1 1-2.7 2.7"/>
    <path d="M3.4 16.8h6.2a2.5 2.5 0 1 1-2.5 2.5"/>`),drop:p('<path d="M12 3.4s5.6 6.1 5.6 9.8a5.6 5.6 0 0 1-11.2 0C6.4 9.5 12 3.4 12 3.4Z"/>'),uv:p(`<circle cx="12" cy="11.4" r="3.4"/>
    <path d="M12 3.6v1.8M12 17.4v1.6M4.6 11.4h1.8M17.6 11.4h1.8M6.6 6l1.3 1.3M16.1 15.5l1.3 1.3M6.6 16.8l1.3-1.3M16.1 7.3l1.3-1.3"/>
    <path d="M8.4 21.4h7.2"/>`),sunset:p(`<path d="M3.4 19.6h17.2M6.6 16.2a5.4 5.4 0 0 1 10.8 0"/>
    <path d="M12 3.2v3.4M5.2 6.6l1.8 1.8M18.8 6.6 17 8.4"/>`),sunrise:p(`<path d="M3.4 19.6h17.2M6.6 16.2a5.4 5.4 0 0 1 10.8 0"/>
    <path d="M12 8.2V3.4M9.4 5.8 12 3.2l2.6 2.6"/>`),thermo:p(`<path d="M14.2 14.6V5.6a2.2 2.2 0 1 0-4.4 0v9a4.2 4.2 0 1 0 4.4 0Z"/>
    <path d="M12 9.4v5.8"/>`),shield:p(`<path d="M12 3.2 4.8 5.9v5.5c0 4.4 3 8 7.2 9.4 4.2-1.4 7.2-5 7.2-9.4V5.9z"/>
    <path d="m9.1 12 2 2 3.8-4"/>`),bolt:p('<path d="M13.4 2.6 5.2 13.6h5.6L10.4 21.4l8.4-11.2h-5.6z"/>'),wifi:p(`<path d="M4.2 9.2a11.4 11.4 0 0 1 15.6 0"/>
    <path d="M7.4 12.6a6.9 6.9 0 0 1 9.2 0"/>
    <path d="M10.4 15.9a2.6 2.6 0 0 1 3.2 0"/>
    <circle cx="12" cy="19" r="1.1"/>`),smoke:p(`<path d="M6.4 15.4a3.3 3.3 0 0 1 .5-6.5 4.8 4.8 0 0 1 9.3-.6 3.5 3.5 0 0 1 1.6 7.1z"/>
    <path d="M5.8 19h3.2M11.2 19h3.2M16.6 19h1.8"/>`),star:p('<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9.9 5.6L12 16.4l-5 2.6.9-5.6-4-3.9 5.6-.8z"/>'),moon:p('<path d="M20.4 14.3A8.6 8.6 0 0 1 9.7 3.6a8.8 8.8 0 1 0 10.7 10.7Z"/>'),radio:p(`<rect x="2.8" y="8.4" width="18.4" height="11.4" rx="2"/>
    <path d="m7.4 8.4 9.8-4.2"/>
    <circle cx="15.8" cy="14.1" r="2.9"/>
    <path d="M6.2 12.2h4.4M6.2 16h4.4"/>`),play:p('<path d="M8.6 5.8 18.4 12l-9.8 6.2z"/>'),pause:p('<path d="M9.6 5.8v12.4M14.4 5.8v12.4"/>'),next:p('<path d="m6.4 6.4 8.2 5.6-8.2 5.6z"/><path d="M17.6 6.2v11.6"/>'),prev:p('<path d="m17.6 6.4-8.2 5.6 8.2 5.6z"/><path d="M6.4 6.2v11.6"/>'),volume:p(`<path d="M4.4 9.4h3.2L12 5.9v12.2L7.6 14.6H4.4z"/>
    <path d="M15.4 9.6a3.4 3.4 0 0 1 0 4.8"/>
    <path d="M17.9 7.1a7 7 0 0 1 0 9.8"/>`),volumeMute:p(`<path d="M4.4 9.4h3.2L12 5.9v12.2L7.6 14.6H4.4z"/>
    <path d="m15.8 9.8 4.4 4.4M20.2 9.8l-4.4 4.4"/>`),search:p('<circle cx="10.6" cy="10.6" r="6.2"/><path d="m15.2 15.2 4.4 4.4"/>'),shuffle:p(`<path d="M3.6 7.6h3c1.2 0 2.3.6 3 1.6l4.2 5.6c.7 1 1.8 1.6 3 1.6h2.4"/>
    <path d="M3.6 16.4h3c1.2 0 2.3-.6 3-1.6"/>
    <path d="M13.8 9.2c.7-1 1.8-1.6 3-1.6h2.4"/>
    <path d="m17 5.4 2.2 2.2-2.2 2.2"/><path d="m17 14.2 2.2 2.2-2.2 2.2"/>`),repeat:p(`<path d="M7.4 7.4h9.2a2.6 2.6 0 0 1 2.6 2.6v1.2"/>
    <path d="m9.6 5.2-2.2 2.2 2.2 2.2"/>
    <path d="M16.6 16.6H7.4a2.6 2.6 0 0 1-2.6-2.6v-1.2"/>
    <path d="m14.4 18.8 2.2-2.2-2.2-2.2"/>`),repeatOne:p(`<path d="M7.4 7.4h9.2a2.6 2.6 0 0 1 2.6 2.6v1.2"/>
    <path d="m9.6 5.2-2.2 2.2 2.2 2.2"/>
    <path d="M16.6 16.6H7.4a2.6 2.6 0 0 1-2.6-2.6v-1.2"/>
    <path d="m14.4 18.8 2.2-2.2-2.2-2.2"/>
    <path d="M10.9 10.9 12.4 9.9v4.4"/>`),speakers:p(`<rect x="3.6" y="3.8" width="8.8" height="16.4" rx="2"/>
    <circle cx="8" cy="14.4" r="2.6"/><path d="M8 7.6h.1"/>
    <path d="M15.6 6.6h4.8v10.8h-4.8"/>`),music:p(`<path d="M9.6 17.4V6.4l8.2-1.6v11"/>
    <ellipse cx="7.6" cy="17.6" rx="2.2" ry="1.9"/>
    <ellipse cx="15.8" cy="15.8" rx="2.2" ry="1.9"/>`),leaf:p(`<path d="M4.6 19.6c-1.4-7.6 3.4-14 14.9-15.2 1.1 8.4-3.3 15.3-14.9 15.2Z"/>
    <path d="M4.2 20.4c2.6-4.6 6-7.6 10.4-9.6"/>`),cog:p(`<circle cx="12" cy="12" r="3.1"/>
    <path d="M12 3.4v2.2M12 18.4v2.2M20.6 12h-2.2M5.6 12H3.4M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6M18.1 18.1l-1.6-1.6M7.5 7.5 5.9 5.9"/>`),grid:p(`<rect x="3.6" y="3.6" width="7.2" height="7.2" rx="1.8"/>
    <rect x="13.2" y="3.6" width="7.2" height="7.2" rx="1.8"/>
    <rect x="3.6" y="13.2" width="7.2" height="7.2" rx="1.8"/>
    <rect x="13.2" y="13.2" width="7.2" height="7.2" rx="1.8"/>`),door:p(`<path d="M5.4 20.6h13.2"/>
    <path d="M6.8 20.6V4.6a.9.9 0 0 1 .9-.9h8.6a.9.9 0 0 1 .9.9v16"/>
    <circle cx="14.4" cy="12.4" r="1"/>`),window:p(`<rect x="4.2" y="3.8" width="15.6" height="16.4" rx="1.6"/>
    <path d="M12 3.8v16.4M4.2 12h15.6"/>`),lock:p(`<rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2"/>
    <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/>
    <circle cx="12" cy="15.3" r="1.2"/>`),lockOpen:p(`<rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2"/>
    <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.4-1.1"/>
    <circle cx="12" cy="15.3" r="1.2"/>`),fan:p(`<circle cx="12" cy="12" r="1.9"/>
    <path d="M12 10.1c0-3 .6-6.4 3-6.4 1.7 0 2.4 2.6-.4 4.6"/>
    <path d="M13.9 12c3 0 6.4.6 6.4 3 0 1.7-2.6 2.4-4.6-.4"/>
    <path d="M12 13.9c0 3-.6 6.4-3 6.4-1.7 0-2.4-2.6.4-4.6"/>
    <path d="M10.1 12c-3 0-6.4-.6-6.4-3 0-1.7 2.6-2.4 4.6.4"/>`),airco:p(`<rect x="3.4" y="4.6" width="17.2" height="8.2" rx="2"/>
    <path d="M6.6 9.6h10.8"/>
    <path d="M7.4 16.2c1.6 0 1.6 2.2 3.2 2.2M13.4 16.2c1.6 0 1.6 2.2 3.2 2.2"/>`),tv:p(`<rect x="2.8" y="4.4" width="18.4" height="12.2" rx="1.8"/>
    <path d="M8.4 20.2h7.2M12 16.6v3.6"/>`),speaker:p(`<rect x="5.6" y="2.8" width="12.8" height="18.4" rx="2"/>
    <circle cx="12" cy="15" r="3.2"/><circle cx="12" cy="6.8" r="1.2"/>`),camera:p(`<path d="M3.4 8.6A1.6 1.6 0 0 1 5 7h8a1.6 1.6 0 0 1 1.6 1.6v6.8A1.6 1.6 0 0 1 13 17H5a1.6 1.6 0 0 1-1.6-1.6z"/>
    <path d="m14.6 11 6-3v8l-6-3z"/>`),car:p(`<path d="M4.2 15.4h15.6"/>
    <path d="M6.2 15.4v2.4a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-2.4M20.3 15.4v2.4a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-2.4"/>
    <path d="M3.8 15.4v-3.2l2-4.6a1.3 1.3 0 0 1 1.2-.8h10a1.3 1.3 0 0 1 1.2.8l2 4.6v3.2z"/>
    <circle cx="7.4" cy="12.5" r=".95"/><circle cx="16.6" cy="12.5" r=".95"/>`),plug:p(`<path d="M9 3.4v5.2M15 3.4v5.2"/>
    <path d="M6.4 8.6h11.2v2.2a5.6 5.6 0 0 1-11.2 0z"/>
    <path d="M12 16.4v4.2"/>`),battery:p(`<rect x="2.8" y="7.4" width="16.4" height="9.2" rx="2"/>
    <path d="M21.2 10.6v2.8"/>
    <rect x="5.2" y="9.8" width="6" height="4.4" rx="1" fill="currentColor" stroke="none"/>`),gaugeArrow:p(`<path d="M4.2 17.4a8.4 8.4 0 1 1 15.6 0"/>
    <path d="m12 13.6 3.6-3.8"/><circle cx="12" cy="14.8" r="1.3"/>`),clock:p('<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 1.9"/>'),washer:p(`<rect x="4.2" y="2.8" width="15.6" height="18.4" rx="2"/>
    <circle cx="12" cy="14" r="4.4"/>
    <path d="M4.2 7.4h15.6M15.4 5.1h1.6"/>`),dishwasher:p(`<rect x="4.2" y="2.8" width="15.6" height="18.4" rx="2"/>
    <path d="M4.2 7.8h15.6M7.2 5.3h2.4"/>
    <path d="M9 11.4c1 1.4 1 2.8 0 4.2M12 11.4c1 1.4 1 2.8 0 4.2M15 11.4c1 1.4 1 2.8 0 4.2"/>`),printer:p(`<path d="M7 9V4.6a.6.6 0 0 1 .6-.6h8.8a.6.6 0 0 1 .6.6V9"/>
    <rect x="3.6" y="9" width="16.8" height="7.2" rx="1.8"/>
    <path d="M7 15.4h10v4a.6.6 0 0 1-.6.6H7.6a.6.6 0 0 1-.6-.6z"/>`),key:p(`<circle cx="7.8" cy="12" r="3.8"/>
    <path d="M11.6 12h8.6M17.4 12v3M20.2 12v2.2"/>`),power:p(`<path d="M12 3.6v8"/>
    <path d="M17.4 6.6a7.6 7.6 0 1 1-10.8 0"/>`),plus:p('<path d="M12 5.2v13.6M5.2 12h13.6"/>'),minus:p('<path d="M5.2 12h13.6"/>'),chevronRight:p('<path d="m9.4 6.2 5.6 5.8-5.6 5.8"/>'),chevronDown:p('<path d="m6.2 9.4 5.8 5.6 5.8-5.6"/>'),close:p('<path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"/>'),check:p('<path d="m5.2 12.6 4.4 4.4 9.2-10"/>'),dots:p('<circle cx="5.4" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.6" cy="12" r="1.5"/>'),warning:p('<path d="M12 4.2 2.8 20h18.4z"/><path d="M12 10v4.4M12 17.4v.1"/>'),question:p(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>`),pencil:p(`<path d="M4.5 19.5h3.2L18.4 8.8a1.9 1.9 0 0 0 0-2.7l-.5-.5a1.9 1.9 0 0 0-2.7 0L4.5 16.3z"/>
    <path d="m14.6 6.8 2.6 2.6"/>`),een:p(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10.6 9.9 12.4 8.6v6.9"/>`),twee:p(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10 9.7a2.1 2.1 0 1 1 3.9 1.1L9.9 15.5h4.2"/>`),drie:p(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10 9.5a2 2 0 1 1 1.8 2.6 2.1 2.1 0 1 1-1.7 2.7"/>`),vier:p(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M13.4 8.6 9.7 13.3h5"/>
    <path d="M13.4 8.6v6.9"/>`),vijf:p(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M14 8.7h-3.6v3.1h1.4a2.1 2.1 0 1 1-2 2.8"/>`),zes:p(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M13.8 9a2.2 2.2 0 0 0-3.7 1.7v2.4"/>
    <circle cx="12.1" cy="13.4" r="2.1"/>`),zeven:p(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M9.7 8.7h4.6l-2.8 6.8"/>`),acht:p(`<circle cx="12" cy="12" r="8.6"/>
    <circle cx="12" cy="10.3" r="1.7"/>
    <circle cx="12" cy="13.8" r="1.9"/>`),negen:p(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10.2 15a2.2 2.2 0 0 0 3.7-1.7v-2.4"/>
    <circle cx="11.9" cy="10.6" r="2.1"/>`),tien:p(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M8.6 10.3 10 9.2v5.7"/>
    <ellipse cx="13.9" cy="12.1" rx="1.7" ry="2.8"/>`)};function x(i,e="question"){return i?T[i]?T[i]:i.includes(":")?`<ha-icon class="icon" icon="${i}"></ha-icon>`:T[e]??T.question:T[e]??T.question}function Me(i,e={}){switch(String(i??"").split(".")[0]){case"light":return"bulb";case"switch":return"switchOn";case"cover":return e.device_class==="awning"||e.device_class==="blind"?"awning":"shutter";case"person":case"device_tracker":return"person";case"climate":return"thermo";case"binary_sensor":return e.device_class==="smoke"?"smoke":"shield";case"alarm_control_panel":return"shield";case"scene":case"script":case"input_button":case"button":return"star";case"weather":return"cloudSun";case"media_player":return e.device_class==="tv"?"tv":e.device_class==="receiver"?"radio":"speaker";default:return"question"}}function je(i){switch(i){case"sunny":case"clear-night":return"sun";case"partlycloudy":return"cloudSun";case"cloudy":return"cloud";case"rainy":case"pouring":case"hail":case"lightning":case"lightning-rainy":return"rain";case"snowy":case"snowy-rainy":return"snow";case"fog":return"fog";case"windy":case"windy-variant":return"wind";default:return"cloud"}}var Ba=[["Woning",["house","floorB","floor1","floor2","garage","door","window","grid"]],["Rolluiken",["shutter","shutterOpen","awning","garageOpen","garageClosed","arrowUp","arrowDown","stop"]],["Licht en stroom",["bulb","bulbGroup","switchOn","power","plug","bolt","battery"]],["Personen",["person","people","away"]],["Apparaten",["tv","speaker","camera","car","washer","dishwasher","printer","fan","airco","radio"]],["Media",["play","pause","next","prev","volume","volumeMute","shuffle","repeat","repeatOne","search","speakers","music","speaker","tv","radio"]],["Afval",["bin","binWheeled","calendar"]],["Weer",["sun","cloud","cloudSun","rain","snow","fog","wind","drop","uv","sunrise","sunset","thermo"]],["Status",["shield","lock","lockOpen","key","wifi","smoke","warning","check","close","clock","gaugeArrow"]],["Cijfers",["een","twee","drie","vier","vijf","zes","zeven","acht","negen","tien"]],["Overig",["star","moon","leaf","cog","dots","plus","minus","chevronRight","chevronDown","question","pencil"]]],Ga=`
  :host { ${Y} display: block; font-family: var(--dac-font); }
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
`,Dt=null,Pt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),Dt=Dt??[ie(Ga)],this.shadowRoot.adoptedStyleSheets=Dt,this.value_="",this.label="Icoon",this.fallback="question",this.auto=!0}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}connectedCallback(){this.built_||(this.built_=!0,this.build_())}build_(){this.shadowRoot.innerHTML=`
      <div class="label"></div>
      <div class="box">
        <button type="button" class="current" aria-expanded="false">
          <span class="preview"></span>
          <span class="who"><b></b><small></small></span>
          <span class="caret">${T.chevronDown}</span>
        </button>
        <div class="panel">
          ${Ba.map(([t,n])=>`
            <div class="group">
              <h4>${t}</h4>
              <div class="grid">
                ${n.map(a=>`<button type="button" class="opt" data-icon="${a}" title="${a}" aria-pressed="false">${T[a]??""}</button>`).join("")}
              </div>
            </div>`).join("")}
          <div class="mdi">
            <label for="mdi">Of Home Assistant-icoon</label>
            <input id="mdi" type="text" placeholder="mdi:washing-machine" spellcheck="false" />
            <button type="button" class="clear">Wissen</button>
          </div>
        </div>
      </div>`,this.$(".current").addEventListener("click",()=>{let t=this.toggleAttribute("open");this.$(".current").setAttribute("aria-expanded",String(t))}),this.shadowRoot.querySelectorAll(".opt").forEach(t=>t.addEventListener("click",()=>this.emit_(t.dataset.icon)));let e=this.$("#mdi");e.addEventListener("change",()=>this.emit_(e.value.trim())),this.$(".clear").addEventListener("click",()=>this.emit_("")),this.paint_()}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Icoon";let e=this.value_,t=e||this.fallback||"question";this.$(".preview").innerHTML=x(t,this.fallback),this.$(".who b").textContent=e||(this.auto?"Automatisch":"Kies een icoon"),this.$(".who small").textContent=e?e.includes(":")?"Home Assistant-icoon":"DomotiApp-icoon":this.auto?"Past zich aan de entiteit aan":"Nog niets gekozen",this.shadowRoot.querySelectorAll(".opt").forEach(s=>s.setAttribute("aria-pressed",String(s.dataset.icon===e)));let n=this.$("#mdi");if(this.shadowRoot.activeElement===n)return;let a=e&&e.includes(":")?e:"";n.value!==a&&(n.value=a)}emit_(e){this.value_=e,this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};H("dac-icon-picker",Pt);var qa=["accent","solar","house","water","magenta","pink","teal","lit","neutral"],Fa=["good","warn","bad"],Za=/^(#[0-9a-f]{3,8}|var\(--[\w-]+\)|rgba?\([^)]*\))$/i,Xa=`
  :host { ${Y} display: block; font-family: var(--dac-font); }
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
`,Ht=null,Rt=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),Ht=Ht??[ie(Xa)],this.shadowRoot.adoptedStyleSheets=Ht,this.value_="",this.label="Kleur",this.statuses=!1}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}set compact(e){this.toggleAttribute("compact",!!e)}get compact(){return this.hasAttribute("compact")}connectedCallback(){this.built_||(this.built_=!0,this.build_())}eigen_(){return!!this.value_&&!(this.value_ in k)}swatch(e){return`<button type="button" class="sw" data-tone="${e}" style="--c:${k[e]}"
      title="${Je[e]}" aria-label="${Je[e]}" aria-pressed="false">${T.check}</button>`}build_(){this.shadowRoot.innerHTML=`
      <div class="label"></div>
      <div class="box">
        ${this.statuses?"<h4>Identiteit</h4>":""}
        <div class="row">
          <button type="button" class="sw auto" data-tone="" title="Automatisch"
            aria-label="Automatisch" aria-pressed="false">${T.check}</button>
          ${qa.map(n=>this.swatch(n)).join("")}
          <span class="sw eigen leeg" title="Eigen kleur" aria-pressed="false">
            ${T.check}
            <input type="color" aria-label="Eigen kleur kiezen" />
          </span>
        </div>
        ${this.statuses?`<h4>Status</h4>
               <div class="row">${Fa.map(n=>this.swatch(n)).join("")}</div>
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
      </div>`,this.shadowRoot.querySelectorAll("button.sw").forEach(n=>n.addEventListener("click",()=>this.emit_(n.dataset.tone)));let e=this.$('input[type="color"]');e.addEventListener("input",()=>this.emit_(e.value));let t=this.$("#vrij");t.addEventListener("change",()=>{let n=t.value.trim();if(!n){this.emit_("");return}let a=Za.test(n);t.setAttribute("aria-invalid",String(!a)),a&&this.emit_(n)}),this.$(".wissen").addEventListener("click",()=>this.emit_("")),this.paint_()}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Kleur";let e=this.eigen_();this.shadowRoot.querySelectorAll("button.sw").forEach(a=>a.setAttribute("aria-pressed",String((a.dataset.tone||"")===this.value_)));let t=this.$(".eigen");t.setAttribute("aria-pressed",String(e)),t.classList.toggle("leeg",!e),t.style.setProperty("--c",e?this.value_:"transparent"),t.title=e?`Eigen kleur: ${this.value_}`:"Eigen kleur",e&&/^#[0-9a-f]{6}$/i.test(this.value_)&&(this.$('input[type="color"]').value=this.value_);let n=this.$("#vrij");if(this.shadowRoot.activeElement!==n){let a=e?this.value_:"";n.value!==a&&(n.value=a),n.setAttribute("aria-invalid","false")}this.$(".chosen").innerHTML=this.value_?e?`Gekozen: <b>${this.value_}</b> &mdash; eigen kleur.`:`Gekozen: <b>${Je[this.value_]??this.value_}</b>`:"Gekozen: <b>Automatisch</b> &mdash; de kaart kiest op domein en toestand."}emit_(e){this.value_=e??"",this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.value_},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};H("dac-tone-picker",Rt);var g={entity:i=>({entity:i?{domain:i}:{}}),text:()=>({text:{}}),multiline:()=>({text:{multiline:!0}}),bool:()=>({boolean:{}}),number:(i,e,t=1)=>({number:{min:i,max:e,step:t,mode:"box"}}),select:i=>({select:{mode:"dropdown",options:i}}),action:(i="more-info")=>({ui_action:{default_action:i}})},It=(...i)=>({type:"grid",name:"",schema:i});var z=class extends HTMLElement{constructor(){super(),this.config_={},this.built_=!1}setConfig(e){this.config_={...this.defaults(),...e},this.render_()}defaults(){return{}}set hass(e){this.hass_=e,this.form_&&(this.form_.hass=e);for(let t of this.pickers_??[])t.hass=e;this.render_()}get hass(){return this.hass_}connectedCallback(){this.render_()}schema(){return[]}pickers(){return[]}label(e){return Vt[e.name]??e.name}helper(){}async render_(){if(!this.hass_||!this.config_)return;if(this.built_){this.sync_();return}this.built_=!0,await customElements.whenDefined("ha-form"),this.replaceChildren(),this.pickers_=[];let e=this.pickers();this.pickerSig_=e.map(o=>o.key).join("|");let t=o=>{let r=document.createElement("div");return r.style.cssText=`display:flex;flex-direction:column;gap:12px;${o}`,r},n=t("margin-bottom:16px"),a=t("margin-top:16px");for(let o of e){let r=document.createElement(o.kind==="tone"?"dac-tone-picker":"dac-icon-picker");r.label=o.label,r.fallback=o.fallback,o.auto===!1&&(r.auto=!1),o.statuses===!1&&(r.statuses=!1),o.compact&&(r.compact=!0),r.hass=this.hass_,r.value=this.config_[o.key],r.addEventListener("value-changed",l=>{l.stopPropagation(),this.patch_({[o.key]:l.detail.value})}),this.pickers_.push(r),r.dataset.key=o.key,(o.after?a:n).appendChild(r)}n.children.length&&this.appendChild(n);let s=document.createElement("ha-form");s.hass=this.hass_,s.data=this.config_,s.schema=this.schema(),s.computeLabel=o=>this.label(o),s.computeHelper=o=>this.helper(o),s.addEventListener("value-changed",o=>{o.stopPropagation(),this.patch_(o.detail.value,!0)}),this.form_=s,this.appendChild(s),a.children.length&&this.appendChild(a)}sync_(){let e=this.pickers().map(t=>t.key).join("|");if(this.pickerSig_!==void 0&&this.pickerSig_!==e){this.built_=!1,this.form_=null,this.render_();return}this.form_&&(this.form_.hass=this.hass_,this.form_.schema=this.schema(),this.form_.data=this.config_);for(let t of this.pickers_??[])t.hass=this.hass_,t.value=this.config_[t.dataset.key]}patch_(e,t=!1){let n=t?{...e}:{...this.config_,...e};this.config_.type&&(n.type=this.config_.type);for(let[a,s]of Object.entries(n))(s===""||s===void 0||s===null)&&delete n[a];this.config_=n,this.sync_(),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.serialize(n)},bubbles:!0,composed:!0}))}serialize(e){return e}},Vt={entity:"Entiteit",entities:"Entiteiten",name:"Naam",icon:"Icoon",tone:"Kleur",secondary:"Tweede regel",layout:"Vorm",tap_action:"Tikken",hold_action:"Vasthouden",double_tap_action:"Dubbeltikken",show_state:"Status tonen",show_name:"Naam tonen",show_icon:"Icoon tonen",fill:"Vullen",collapsible:"Inklapbaar",title:"Titel",subtitle:"Ondertitel",weather:"Weerentiteit",sun:"Zon-entiteit",person:"Persoon",persons:"Personen",covers:"Rolluiken",lights:"Lampen",sensors:"Sensoren",greeting:"Begroeting",show_clock:"Klok tonen",show_weather:"Weer tonen",show_chips:"Weerdetails tonen",compact:"Compact",columns:"Kolommen",group:"Groepsregel tonen",invert:"Open en dicht omdraaien",label:"Label",color:"Kleur",date_format:"Datumnotatie"};function Ya(i=new Date){let e=i.getHours();return e<6?"Goedenacht":e<12?"Goedemorgen":e<18?"Goedemiddag":"Goedenavond"}var Ja=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],Qa=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],Kt={humidity:{icon:"drop",tone:"water",label:"Luchtvochtigheid"},wind:{icon:"wind",tone:"neutral",label:"Wind"},uv:{icon:"uv",tone:"solar",label:"UV-index"},precipitation:{icon:"rain",tone:"water",label:"Neerslag"},pressure:{icon:"gaugeArrow",tone:"neutral",label:"Luchtdruk"},sunrise:{icon:"sunrise",tone:"warn",label:"Zonsopkomst"},sunset:{icon:"sunset",tone:"warn",label:"Zonsondergang"}},es=["humidity","wind","uv","precipitation","sunset"],ts=i=>i==null||Number.isNaN(+i)?"":["N","NO","O","ZO","Z","ZW","W","NW"][Math.round(+i/45)%8],Qe=class extends E{validate(e){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768,...e}}watched(){let e=this.config;return[e.weather,e.weather_uv,e.sun,e.precipitation_entity].filter(Boolean)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.show_rule===!1&&this.setAttribute("no-rule",""),`
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
      </div>`}wire(){let e=()=>{let n=6e4-Date.now()%6e4+50;this.timer_=setTimeout(()=>{this.paintClock_(),e()},n)};e(),this.teardown_.push(()=>clearTimeout(this.timer_));let t=Number(this.config.hide_below)||0;if(t>0){let n=matchMedia(`(max-width: ${t-1}px)`),a=()=>this.toggleAttribute("narrow",n.matches);a(),n.addEventListener("change",a),this.teardown_.push(()=>n.removeEventListener("change",a))}}paintClock_(){let e=new Date,t=this.config.name??this.hass?.user?.name??"",n=Ya(e);this.$(".hello").innerHTML=t?`${n}, <b>${t}</b>`:n,this.text(".date",`${Ja[e.getDay()]} ${e.getDate()} ${Qa[e.getMonth()]}`);let a=this.$(".clock");a&&this.text(a,e.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"}))}paint(){this.paintClock_();let e=this.config,t=b(this.hass,e.weather),n=D(this.hass,e.weather),a=this.$(".now");if(a&&t){let l=je(t.state);a.style.setProperty("--wtone",V(e.tone,"water"));let c=this.hass?.config?.unit_system?.temperature??"\xB0C";this.$(".temp").innerHTML=n.temperature!=null?`${K(this.hass,n.temperature,0)}<span>${c}</span>`:"--";let d=a.querySelector(".ic");d.dataset.icon!==l&&(d.dataset.icon=l,d.innerHTML=x(l,"cloud")),this.text(a.querySelector(".cond"),I(this.hass,t))}let s=this.$(".chips");if(!s)return;let o=es.map(l=>this.chip_(l,n)).filter(Boolean),r=o.map(l=>`${l.key}${l.value}`).join("|");s.dataset.sig!==r&&(s.dataset.sig=r,s.innerHTML=o.map(l=>`<span class="chip2" style="--tone:${V(Kt[l.key].tone)}" title="${Kt[l.key].label}">
             ${T[Kt[l.key].icon]??""}${l.value}
           </span>`).join(""))}chip_(e,t){let n=this.config;switch(e){case"humidity":return t.humidity!=null?{key:e,value:`${Math.round(t.humidity)}%`}:null;case"wind":{if(t.wind_speed==null)return null;let a=this.hass?.config?.unit_system?.wind_speed??"km/h",s=ts(t.wind_bearing);return{key:e,value:`${K(this.hass,t.wind_speed,0)} ${a}${s?` ${s}`:""}`}}case"uv":{let s=D(this.hass,n.weather_uv).uv_index??t.uv_index??(n.weather_uv?Number(b(this.hass,n.weather_uv)?.state):null);return s!=null&&!Number.isNaN(+s)?{key:e,value:`UV ${K(this.hass,s,1)}`}:null}case"precipitation":{let a=b(this.hass,n.precipitation_entity);if(a){let s=Number(a.state);if(Number.isNaN(s))return null;let o=a.attributes.unit_of_measurement??"mm";return{key:e,value:`${K(this.hass,s,1)} ${o}`}}return t.precipitation!=null&&!Number.isNaN(+t.precipitation)?{key:e,value:`${K(this.hass,t.precipitation,1)} mm`}:null}case"pressure":return t.pressure!=null?{key:e,value:`${K(this.hass,t.pressure,0)} ${t.pressure_unit??"hPa"}`}:null;case"sunset":case"sunrise":{let s=b(this.hass,n.sun)?.attributes?.[e==="sunset"?"next_setting":"next_rising"];if(!s)return null;let o=new Date(s);return Number.isNaN(+o)?null:{key:e,value:o.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"})}}default:return null}}getCardSize(){return 2}getGridOptions(){return{columns:"full",rows:2,min_rows:2,max_rows:2}}static getConfigElement(){return document.createElement("domotiapp-header-card-editor")}static getStubConfig(e){return{weather:Object.keys(e?.states??{}).find(n=>n.startsWith("weather.")),sun:"sun.sun"}}};_(Qe,"css",`
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
  `);var Ut=class extends z{defaults(){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768}}pickers(){return[{key:"tone",kind:"tone",label:"Kleur weericoon"}]}schema(){return[It({name:"weather",selector:g.entity("weather")},{name:"weather_uv",selector:{entity:{domain:["weather","sensor"]}}}),It({name:"sun",selector:g.entity("sun")},{name:"precipitation_entity",selector:g.entity("sensor")}),{name:"name",selector:g.text()},{name:"hide_below",selector:g.number(0,1400,8)}]}label(e){return{weather:"Weer (temperatuur, wind)",weather_uv:"Tweede weerbron (UV-index)",precipitation_entity:"Neerslagsensor",show_rule:"Accentlijn tonen",hide_below:"Verbergen onder breedte (px)",bare:"Zonder kaartrand",name:"Naam"}[e.name]??super.label(e)}helper(e){if(e.name==="weather_uv")return"Alleen voor de UV-index. Handig als je hoofdbron die niet meelevert.";if(e.name==="precipitation_entity")return"Een sensor in mm of mm/h, bijvoorbeeld neerslagintensiteit of regen laatste uur.";if(e.name==="hide_below")return"768 verbergt de header op telefoons en houdt hem op tablets en desktops. 0 zet het uit.";if(e.name==="name")return"Leeg laten voor de naam van de ingelogde gebruiker."}};C("domotiapp-header-card-editor",Ut);A("domotiapp-header-card",Qe,{name:"DomotiApp Header",description:"Smalle strip met begroeting, weer en klok. Verbergt zichzelf op telefoons."});var et=class extends E{validate(e){return{icon:"",tone:"accent",line:!0,...e}}watched(){return this.config.secondary_entity?[this.config.secondary_entity]:[]}template(){let e=this.config,t=e.icon!==null&&e.icon!==!1;return t||this.setAttribute("no-icon",""),`
      <div class="sep" style="--tone:${V(e.tone)}">
        ${t?`<span class="chip">${x(e.icon,"star")}</span>`:""}
        <h3></h3>
        ${e.line===!1?"":'<span class="rule"></span>'}
        <span class="sub"><span class="si"></span><span class="sv"></span></span>
      </div>`}paint(){this.text("h3",this.config.name??"");let e=this.$(".sub");if(!e)return;let t=b(this.hass,this.config.secondary_entity),n=e.querySelector(".si"),a=e.querySelector(".sv");if(!t){a.textContent="",n.innerHTML="";return}let s=this.config.secondary_icon??"";n.dataset.icon!==s&&(n.dataset.icon=s,n.innerHTML=s?x(s):"");let o=t.attributes.unit_of_measurement;a.textContent=o?`${t.state} ${o}`:t.attributes.current_temperature!=null?`${t.attributes.current_temperature} \xB0C`:I(this.hass,t)}getCardSize(){return 1}getGridOptions(){return{columns:"full",rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-separator-card-editor")}static getStubConfig(){return{name:"Nieuwe sectie",icon:"house",tone:"accent"}}};_(et,"css",`
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
  `);var Wt=class extends z{defaults(){return{line:!0,tone:"accent"}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon links",fallback:"star",auto:!1},{key:"tone",kind:"tone",label:Vt.tone},{key:"secondary_icon",kind:"icon",label:"Icoon bij de waarde rechts",auto:!1}]}schema(){return[{name:"name",selector:g.text()},{name:"line",selector:g.bool()},{name:"secondary_entity",selector:g.entity()}]}label(e){return{line:"Lijn tonen",secondary_entity:"Waarde rechts (optioneel)"}[e.name]??super.label(e)}helper(e){if(e.name==="secondary_entity")return"Toont de status van deze entiteit rechts van de lijn, bijvoorbeeld een temperatuur of een aantal."}};C("domotiapp-separator-card-editor",Wt);A("domotiapp-separator-card",et,{name:"DomotiApp Separator",description:"Sectiekop met icoon en vervagende lijn."});var tt=({label:i="Aan of uit",cls:e=""}={})=>`<button class="toggle ${e}" type="button" role="switch" aria-checked="false" aria-label="${i}"><span class="knob"></span></button>`;function Te(i,e){if(!i)return;let t=String(!!e);i.getAttribute("aria-checked")!==t&&i.setAttribute("aria-checked",t)}function nt(i,e){let t=i.querySelector(".knob"),n=!1,a=0,s=!1,o=!1,r=()=>{n=!1,i.classList.remove("dragging"),t?.style.removeProperty("--knob")},l=h=>{h!==e.value()&&(Te(i,h),e.set(h))},c=h=>{if(!e.disabled?.()&&!(h.button!=null&&h.button!==0)){h.stopPropagation(),n=!0,s=!1,o=!1,a=h.clientX,i.classList.add("dragging");try{i.setPointerCapture?.(h.pointerId)}catch{}}},d=h=>{if(!n)return;let w=h.clientX-a;Math.abs(w)>3&&(s=!0);let $=e.value()?22:0,N=Math.min(22,Math.max(0,$+w));t?.style.setProperty("--knob",`${N}px`)},u=h=>{if(!n)return;h.stopPropagation();let w=h.clientX-a,$=e.value()?22:0,N=Math.min(22,Math.max(0,$+w));r();try{i.hasPointerCapture?.(h.pointerId)&&i.releasePointerCapture(h.pointerId)}catch{}o=!0,l(s?N>22/2:!e.value())},m=()=>{n&&r()},y=h=>{if(h.stopPropagation(),h.preventDefault(),o){o=!1;return}e.disabled?.()||l(!e.value())};return i.addEventListener("pointerdown",c),i.addEventListener("pointermove",d),i.addEventListener("pointerup",u),i.addEventListener("pointercancel",m),i.addEventListener("click",y),()=>{i.removeEventListener("pointerdown",c),i.removeEventListener("pointermove",d),i.removeEventListener("pointerup",u),i.removeEventListener("pointercancel",m),i.removeEventListener("click",y)}}var it=`
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
`;var at=class extends E{validate(e){return{layout:"row",show_state:!0,show_name:!0,show_icon:!0,...e}}watched(){return[this.config.entity].filter(Boolean)}tone_(){let e=this.config;return e.tone?V(e.tone):q(e.entity)!=="light"?k.accent:Xe(b(this.hass,e.entity))??k.lit}metSchakelaar_(){return!!this.config.toggle&&Ye(this.config.entity)}template(){let e=this.config;return this.setAttribute("layout",["row","tile","compact"].includes(e.layout)?e.layout:"row"),`
      <div class="btn surface" role="button" tabindex="0" style="--tone:${this.tone_()}">
        <span class="wash"></span>
        ${e.show_icon===!1?"":'<span class="chip" role="button" tabindex="0"></span>'}
        <span class="txt">
          ${e.show_name===!1?"":'<span class="nm"></span>'}
          ${e.show_state===!1?"":'<span class="st"></span>'}
        </span>
        ${this.metSchakelaar_()?tt({label:"Aan of uit"}):""}
      </div>`}wire(){let e=this.config,t=(s,o)=>ee(this,this.hass,e,e[s]??o);this.teardown_.push(j(this.$(".btn"),{onTap:()=>t("tap_action",{action:e.entity?"more-info":"none"}),onHold:()=>t("hold_action",{action:e.entity?"more-info":"none"}),onDouble:e.double_tap_action?()=>t("double_tap_action",{action:"none"}):void 0}));let n=this.$(".chip");if(!n)return;this.teardown_.push(j(n,{onTap:s=>t("icon_tap_action",be(e.entity)),onHold:()=>t("icon_hold_action",{action:e.entity?"more-info":"none"})})),this.on(n,"click",s=>s.stopPropagation()),this.on(n,"pointerdown",s=>s.stopPropagation());let a=this.$(".toggle");a&&this.teardown_.push(nt(a,{value:()=>ae(b(this.hass,e.entity)),set:s=>this.hass.callService("homeassistant",s?"turn_on":"turn_off",{entity_id:e.entity}),disabled:()=>P(b(this.hass,e.entity))}))}paint(){let e=this.config,t=b(this.hass,e.entity),n=ae(t),a=!!e.entity&&P(t);this.toggleAttribute("on",n),this.$(".btn").classList.toggle("unavailable",a),this.$(".btn").style.setProperty("--tone",this.tone_());let s=this.$(".chip");if(s){let l=fe(this.hass,e.entity,e.icon),c=l?`pic:${l}`:e.icon||Me(e.entity,D(this.hass,e.entity));s.dataset.icon!==c&&(s.dataset.icon=c,s.classList.toggle("pic",!!l),s.innerHTML=l?`<img src="${l}" alt="" loading="lazy" />`:x(c)),s.style.setProperty("--tone",n&&!l?this.tone_():"var(--dac-ink-3)"),s.setAttribute("aria-label",e.entity?`${S(this.hass,e.entity,e.name)} schakelen`:"Icoon")}this.text(".nm",S(this.hass,e.entity,e.name));let o=this.$(".toggle");o&&(Te(o,n),o.style.setProperty("--tone",this.tone_()),o.setAttribute("aria-label",`${S(this.hass,e.entity,e.name)} aan of uit`));let r=this.$(".st");r&&this.text(r,this.secondary_(t,a)),this.$(".btn").setAttribute("aria-label",`${S(this.hass,e.entity,e.name)}${t?`, ${I(this.hass,t)}`:""}`)}secondary_(e,t){return t?"Niet bereikbaar":!e||Ae(e.entity_id)?"":q(e.entity_id)==="light"&&e.state==="on"&&e.attributes.brightness!=null?`${Math.round(e.attributes.brightness/255*100)}%`:I(this.hass,e)}getCardSize(){return this.config?.layout==="tile"?2:1}getGridOptions(){return this.config?.layout==="tile"?{columns:6,rows:2,min_columns:3,min_rows:2,max_rows:2}:{columns:12,rows:1,min_columns:4,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-button-card-editor")}static getStubConfig(e,t){return{entity:t?.find(a=>a.startsWith("light."))??t?.find(a=>a.startsWith("switch."))??t?.[0],layout:"row"}}};_(at,"css",`
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

    ${it}

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

  `);var Bt=class extends z{defaults(){return{layout:"row",show_state:!0,show_name:!0,show_icon:!0,toggle:!1,icon_tap_action:{action:"toggle"},tap_action:{action:"more-info"}}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"star"},{key:"tone",kind:"tone",label:"Kleur"}]}schema(){return[{name:"entity",selector:g.entity()},{name:"name",selector:g.text()},{name:"layout",selector:g.select([{value:"row",label:"Rij"},{value:"tile",label:"Tegel"},{value:"compact",label:"Compact"}])},{name:"toggle",selector:g.bool()},{name:"show_icon",selector:g.bool()},{name:"show_name",selector:g.bool()},{name:"show_state",selector:g.bool()},{name:"icon_tap_action",selector:g.action("toggle")},{name:"icon_hold_action",selector:g.action("more-info")},{name:"tap_action",selector:g.action("more-info")},{name:"hold_action",selector:g.action("more-info")},{name:"double_tap_action",selector:g.action("none")}]}label(e){return{entity:"Entiteit",name:"Naam (overschrijft die van de entiteit)",layout:"Vorm",toggle:"Schakelaar tonen",show_icon:"Icoon tonen",show_name:"Naam tonen",show_state:"Status tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart",double_tap_action:"Dubbeltikken op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Mag leeg blijven: zonder entiteit wordt dit een navigatieknop.";if(e.name==="toggle")return"Een schuifschakelaar rechts op de kaart, voor wat twee standen heeft: een lamp, een stopcontact, een schakelaar. Op een scene of een script verschijnt hij niet.";if(e.name==="icon_tap_action")return"Handig: het icoon schakelt de lichtgroep, de kaart navigeert naar de ruimte.";if(e.name==="tap_action")return"Wat er gebeurt als je naast het icoon tikt, bijvoorbeeld navigeren naar een pop-up."}};C("domotiapp-button-card-editor",Bt);A("domotiapp-button-card",at,{name:"DomotiApp Knop",description:"E\xE9n control als rij, tegel of compacte pil. Vervangt tile, mushroom-entity en bubble-knoppen."});var Gt=(i,e,t)=>Math.min(t,Math.max(e,i));function _e(i,e){let t=e.min??0,n=e.max??100,a=e.step??1,s=!1,o=h=>{let w=i.getBoundingClientRect();if(!w.width)return t;let $=Gt((h-w.left)/w.width,0,1),N=t+$*(n-t);return Gt(Math.round(N/a)*a,t,n)},r=h=>{try{i.setPointerCapture?.(h)}catch{}},l=h=>{try{i.hasPointerCapture?.(h)&&i.releasePointerCapture(h)}catch{}},c=h=>{e.disabled?.()||h.button!=null&&h.button!==0||(s=!0,r(h.pointerId),i.classList.add("dragging"),e.onInput(o(h.clientX)),h.preventDefault())},d=h=>{s&&(e.onInput(o(h.clientX)),h.preventDefault())},u=h=>{s&&(s=!1,l(h.pointerId),i.classList.remove("dragging"),e.onCommit(o(h.clientX)))},m=h=>{s&&(s=!1,l(h?.pointerId),i.classList.remove("dragging"),e.onInput(e.value()))},y=h=>{if(e.disabled?.())return;let w=(n-t)/10,$={ArrowLeft:-a,ArrowDown:-a,ArrowRight:a,ArrowUp:a,PageDown:-w,PageUp:w,Home:-1/0,End:1/0};if(!(h.key in $))return;h.preventDefault();let N=e.value(),re=Gt($[h.key]===-1/0?t:$[h.key]===1/0?n:N+$[h.key],t,n);e.onInput(re),e.onCommit(re)};return i.addEventListener("pointerdown",c),i.addEventListener("pointermove",d),i.addEventListener("pointerup",u),i.addEventListener("pointercancel",m),i.addEventListener("keydown",y),()=>{i.removeEventListener("pointerdown",c),i.removeEventListener("pointermove",d),i.removeEventListener("pointerup",u),i.removeEventListener("pointercancel",m),i.removeEventListener("keydown",y)}}var se=(i="")=>`
  <div class="slider ${i}" role="slider" tabindex="0"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div class="track"><div class="fill"></div></div>
    <div class="thumb"></div>
  </div>`,xe=`
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
`;var ns=new Set(["brightness","color_temp","hs","rgb","rgbw","rgbww","xy","white"]),is=new Set(["hs","rgb","rgbw","rgbww","xy"]),Ft=i=>i?.attributes?.supported_color_modes??[],as=i=>Ft(i).some(e=>ns.has(e)),st=i=>Ft(i).some(e=>is.has(e)),ot=i=>Ft(i).includes("color_temp"),oi=i=>Math.max(1,Math.round((i??0)/255*100)),rt=class extends E{validate(e){let t=e.entity??e.lights?.[0]??e.entities?.[0],n=typeof t=="string"?t:t?.entity;return n?{show_colour:!0,...e,entity:n}:{...e,[O]:"Kies een lamp."}}watched(){return[this.config.entity]}template(){return this.config.bare&&this.setAttribute("bare",""),`
      <div class="card surface">
        <div class="lamp" data-on="false" style="--tone:var(--dac-lit)">
          <button class="chip" type="button" aria-label="Aan of uit"></button>
          <span class="txt"><span class="nm"></span><span class="v tnum"></span></span>
          <span class="ctl" style="display:contents"></span>
        </div>
        <div class="colour" hidden></div>
      </div>`}wire(){let e=this.config.entity;this.teardown_.push(j(this.$(".chip"),{onTap:()=>this.hass.callService("light","toggle",{entity_id:e}),onHold:()=>R(this,e)})),this.on(this.$(".card"),"click",t=>{t.target.closest(".toggle")&&this.hass.callService("light","toggle",{entity_id:e})}),this.sliders_=new Map}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let a=_e(e,n);this.sliders_.set(t,a),this.teardown_.push(a)}setSlider_(e,t,n=0,a=100){if(!e)return;let s=a>n?(t-n)/(a-n)*100:0;e.style.setProperty("--v",`${s}%`),e.setAttribute("aria-valuemin",String(n)),e.setAttribute("aria-valuemax",String(a)),e.setAttribute("aria-valuenow",String(t))}paint(){let e=this.config,t=b(this.hass,e.entity),n=P(t),a=t?.state==="on",s=this.$(".lamp");s.dataset.on=String(a),s.classList.toggle("unavailable",n);let o=this.$(".chip"),r=e.icon||"bulb";o.dataset.icon!==r&&(o.dataset.icon=r,o.innerHTML=x(r,"bulb")),this.text(".nm",S(this.hass,e.entity,e.name));let l=a?t?.attributes?.rgb_color:null;s.style.setProperty("--tone",l?`rgb(${l[0]},${l[1]},${l[2]})`:"var(--dac-lit)");let c=this.$(".ctl"),d=n?"none":as(t)?"range":"toggle";if(c.dataset.kind!==d&&(c.dataset.kind=d,c.innerHTML=d==="range"?se("brightness"):d==="toggle"?'<button class="toggle" type="button" role="switch" aria-checked="false" aria-label="Aan of uit"></button>':"",this.sliders_.delete("brightness")),d==="range"){let u=c.querySelector(".slider");if(this.attach_(u,"brightness",{value:()=>t?.state==="on"?oi(b(this.hass,e.entity)?.attributes?.brightness):0,onInput:m=>{this.setSlider_(u,m),this.text(".v",m===0?"Uit":`${m}%`)},onCommit:m=>{m===0?this.hass.callService("light","turn_off",{entity_id:e.entity}):this.hass.callService("light","turn_on",{entity_id:e.entity,brightness_pct:m})},disabled:()=>P(b(this.hass,e.entity))}),!u.classList.contains("dragging")){let m=a?oi(t.attributes.brightness):0;this.setSlider_(u,m),this.text(".v",a?`${m}%`:"Uit")}}else d==="toggle"?(c.querySelector(".toggle")?.setAttribute("aria-checked",String(a)),this.text(".v",a?"Aan":"Uit")):this.text(".v","Niet bereikbaar");this.paintColour_(t,a)}paintColour_(e,t){let n=this.$(".colour"),a=this.config.show_colour!==!1&&(st(e)||ot(e));if(n.hidden=!(a&&t),!a)return;let s=`${st(e)?"c":""}${ot(e)?"t":""}`;if(n.dataset.sig!==s){n.dataset.sig=s,n.innerHTML=(st(e)?`<span data-kind="hue" style="display:contents">${se("hue")}</span>`:"")+(ot(e)?`<span data-kind="kelvin" style="display:contents">${se("kelvin")}</span>`:"");let c=n.querySelector(".slider.hue");c&&(c.dataset.strip="",c.style.setProperty("--strip","linear-gradient(90deg, hsl(0 90% 55%), hsl(60 90% 55%), hsl(120 90% 55%), hsl(180 90% 55%), hsl(240 90% 55%), hsl(300 90% 55%), hsl(360 90% 55%))"),c.setAttribute("aria-label","Kleur"));let d=n.querySelector(".slider.kelvin");d&&(d.dataset.strip="",d.style.setProperty("--strip","linear-gradient(90deg,#ffb15e,#ffd6a8,#fff5e8,#eaf1ff,#cbdcff)"),d.setAttribute("aria-label","Kleurtemperatuur")),this.sliders_.delete("hue"),this.sliders_.delete("kelvin")}if(!t)return;let o=this.config.entity,r=n.querySelector(".slider.hue");r&&(this.attach_(r,"hue",{min:0,max:360,value:()=>b(this.hass,o)?.attributes?.hs_color?.[0]??0,onInput:c=>this.setSlider_(r,c,0,360),onCommit:c=>{let d=b(this.hass,o)?.attributes?.hs_color?.[1]??100;this.hass.callService("light","turn_on",{entity_id:o,hs_color:[c,d]})}}),r.classList.contains("dragging")||this.setSlider_(r,Math.round(e.attributes.hs_color?.[0]??0),0,360));let l=n.querySelector(".slider.kelvin");if(l){let c=e.attributes.min_color_temp_kelvin??2e3,d=e.attributes.max_color_temp_kelvin??6500;if(this.attach_(l,"kelvin",{min:c,max:d,step:50,value:()=>b(this.hass,o)?.attributes?.color_temp_kelvin??c,onInput:u=>this.setSlider_(l,u,c,d),onCommit:u=>this.hass.callService("light","turn_on",{entity_id:o,color_temp_kelvin:u})}),!l.classList.contains("dragging")){let u=e.attributes.color_temp_kelvin;u!=null&&this.setSlider_(l,u,c,d)}}}getCardSize(){let e=b(this.hass,this.config?.entity);return e?.state==="on"&&(st(e)||ot(e))?2:1}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:1}}static getConfigElement(){return document.createElement("domotiapp-light-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("light."));return n?{entity:n}:{}}};_(rt,"css",`
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

    ${xe}

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
  `);var qt=class extends z{defaults(){return{show_colour:!0}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"bulb"}]}schema(){return[{name:"entity",selector:g.entity("light")},{name:"name",selector:g.text()},{name:"show_colour",selector:g.bool()}]}label(e){return{entity:"Lamp",name:"Naam (overschrijft die van de lamp)",show_colour:"Kleurstrips tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"E\xE9n lamp per kaart. Dimbaar krijgt een schuif, alleen schakelbaar een tuimelaar.";if(e.name==="show_colour")return"Kleur en kleurtemperatuur verschijnen zodra de lamp aan is. De kaart is dan twee rijen hoog."}};C("domotiapp-light-card-editor",qt);A("domotiapp-light-card",rt,{name:"DomotiApp Verlichting",description:"E\xE9n lamp op \xE9\xE9n rasterrij: dimmen, kleur en kleurtemperatuur."});function ri(i){if(!i)return null;let e=Number(i.state);return Number.isFinite(e)?e:null}function ss(i){let e=i?.attributes?.hvac_action;return e||(i?.state==="off"?"off":i?.state==="cool"?"cooling":i?.state==="heat"?"idle":null)}var Zt={heating:"var(--dac-solar)",cooling:"var(--dac-grid-in)",drying:"var(--dac-grid-in)",fan:"var(--dac-grid-in)"},li={heating:"Verwarmt",cooling:"Koelt",drying:"Ontvochtigt",fan:"Ventileert",idle:"Uit",off:"Uit"},lt=class extends E{validate(e){return e.entity||e.temperature||e.humidity?{...e}:{...e,[O]:"Kies een thermostaat, of een temperatuursensor."}}watched(){let e=this.config;return[e.entity,e.temperature,e.humidity].filter(Boolean)}step_(){let e=D(this.hass,this.config.entity);return Number(this.config.step??e.target_temp_step)||.5}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.entity||this.setAttribute("readout",""),`
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
                 <button type="button" data-d="-1" aria-label="Lager">${T.minus}</button>
                 <span class="target tnum"></span>
                 <button type="button" data-d="1" aria-label="Hoger">${T.plus}</button>
               </div>`:""}
      </div>`}wire(){let e=this.config;this.teardown_.push(()=>clearTimeout(this.sendTimer_)),this.teardown_.push(j(this.$(".chip"),{onTap:()=>R(this,e.entity||e.temperature||e.humidity)}));let t=this.$(".set");t&&t.querySelectorAll("button").forEach(n=>this.on(n,"click",()=>this.nudge_(Number(n.dataset.d))))}nudge_(e){let t=this.config,n=D(this.hass,t.entity),a=this.step_(),s=Number(n.min_temp??5),o=Number(n.max_temp??35),r=this.pending_??Number(n.temperature);if(!Number.isFinite(r))return;let l=Math.min(o,Math.max(s,Math.round((r+e*a)/a)*a));this.pending_=l,this.paintTarget_(),clearTimeout(this.sendTimer_),this.sendTimer_=setTimeout(()=>{this.sendTimer_=null,this.hass.callService("climate","set_temperature",{entity_id:t.entity,temperature:this.pending_}),setTimeout(()=>{this.pending_=null,this.paint()},1500)},450)}paintTarget_(){let e=this.$(".target");if(!e)return;let t=D(this.hass,this.config.entity),n=this.pending_??Number(t.temperature);e.classList.toggle("pending",this.pending_!=null),e.textContent=Number.isFinite(n)?`${K(this.hass,n,n%1?1:0)}\xB0`:"--"}paint(){let e=this.config,t=e.entity?b(this.hass,e.entity):null,n=e.entity?P(t):!1;this.toggleAttribute("dead",n);let a=ss(t),s=e.tone?V(e.tone):Zt[a]??"var(--dac-ink-3)";this.$(".card").style.setProperty("--tone",s),this.toggleAttribute("busy",!!Zt[a]);let o=this.$(".chip"),r=e.icon||"thermo";o.dataset.icon!==r&&(o.dataset.icon=r,o.innerHTML=x(r,"thermo")),o.style.setProperty("--tone",Zt[a]?s:"var(--dac-ink-3)"),this.text(".nm",S(this.hass,e.entity||e.temperature||e.humidity,e.name));let l=e.temperature?ri(b(this.hass,e.temperature)):Number(D(this.hass,e.entity).current_temperature),c=this.hass?.config?.unit_system?.temperature??"\xB0C";this.text(".temp",Number.isFinite(l)?`${K(this.hass,l,1)} ${c}`:"--");let d=e.humidity?ri(b(this.hass,e.humidity)):null,u=this.$(".hum");u.innerHTML=d==null?"":`${T.drop}${K(this.hass,d,0)}%`,this.text(".sep",d==null?"":"\xB7"),e.entity&&!e.humidity&&li[a]&&a!=="idle"&&(this.text(".sep","\xB7"),u.textContent=li[a]),this.paintTarget_();let m=this.$(".set");if(m){let y=D(this.hass,e.entity),h=this.pending_??Number(y.temperature);m.querySelector('[data-d="-1"]').disabled=n||h<=Number(y.min_temp??5),m.querySelector('[data-d="1"]').disabled=n||h>=Number(y.max_temp??35)}}getCardSize(){return 1}getGridOptions(){return{columns:12,rows:1,min_columns:4,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-climate-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("climate."));return n?{entity:n}:{}}};_(lt,"css",`
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
  `);var Xt=class extends z{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"thermo"},{key:"tone",kind:"tone",label:"Vaste kleur (leeg = volgt de ketel)"}]}schema(){return[{name:"entity",selector:g.entity("climate")},{name:"temperature",selector:{entity:{domain:"sensor",device_class:"temperature"}}},{name:"humidity",selector:{entity:{domain:"sensor",device_class:"humidity"}}},{name:"name",selector:g.text()},{name:"step",selector:g.number(.1,5,.1)}]}label(e){return{entity:"Thermostaat (optioneel)",temperature:"Temperatuursensor (optioneel)",humidity:"Vochtigheidssensor (optioneel)",name:"Naam",step:"Stap van de knoppen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Leeg laten voor een kaart die alleen meet. Met thermostaat komen de stelknoppen erbij.";if(e.name==="temperature")return"Wint van de meting van de thermostaat zelf. Handig als er een betere sensor in de kamer hangt.";if(e.name==="step")return"Leeg laten volgt de thermostaat, en anders een halve graad."}};C("domotiapp-climate-card-editor",Xt);A("domotiapp-climate-card",lt,{name:"DomotiApp Klimaat",description:"Thermostaat, losse temperatuur- en vochtsensor, of allebei."});var ci=i=>Math.min(Math.max(1,Number(i)||2),3),di=i=>typeof i=="string"?{entity:i}:{...i};function ct(i){for(i.bewaard??=[];i.items.length<i.columns;)i.items.push(i.bewaard.pop()??{entity:""});for(;i.items.length>i.columns;){let e=i.items.pop();e.entity&&i.bewaard.push(e)}return i}function os(i){let e=Array.isArray(i.rows)&&i.rows.length?i.rows.map(n=>({columns:ci(n.columns),items:(n.items??n.entities??[]).map(di)})):(()=>{let n=(i.items??i.entities??[]).map(di);return n.length?[{columns:ci(i.columns),items:n}]:[]})(),t=[];for(let n of e){let a=[];for(let s=0;s<n.items.length;s+=n.columns)a.push(n.items.slice(s,s+n.columns));a.length||a.push([]);for(let s of a)t.push(ct({columns:n.columns,items:s}))}return t}var pi=i=>i.map(e=>({columns:e.columns,items:e.items.filter(t=>t.entity).map(t=>structuredClone(t))})).filter(e=>e.items.length),rs=`
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
`,Yt=class extends HTMLElement{constructor(){super(),this.rows_=[],this.rest_={},this.open_=new Set,this.koppen_=[]}setConfig(e){if(this.rest_={...e},delete this.rest_.rows,delete this.rest_.items,delete this.rest_.entities,delete this.rest_.columns,this.gebouwd_&&e===this.uitObject_)return;let t=os(e);this.gebouwd_&&JSON.stringify(pi(t))===this.uit_||(this.rows_=t,this.eersteKeer_||(this.eersteKeer_=!0,this.rows_.length===1&&this.open_.add("r0")),this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker, dac-tone-picker"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}connectedCallback(){this.gebouwd_||this.build_()}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}rijWeg_(e){let t=new Set;for(let n of this.open_){let a=/^r(\d+)(?:i(\d+))?$/.exec(n);if(!a)continue;let s=Number(a[1]);s!==e&&t.add(s>e?`r${s-1}${a[2]===void 0?"":`i${a[2]}`}`:n)}this.open_=t}itemWeg_(e,t){let n=new Set;for(let a of this.open_){let s=/^r(\d+)i(\d+)$/.exec(a);if(!s||Number(s[1])!==e){n.add(a);continue}let o=Number(s[2]);o!==t&&n.add(o>t?`r${e}i${o-1}`:a)}this.open_=n}legePlekkenOpen_(e,t){e.items.forEach((n,a)=>{n.entity||this.open_.add(`r${t}i${a}`)})}async build_(){if(!this.hass_||!this.rows_)return;await customElements.whenDefined("ha-form"),this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=rs;let t=document.createElement("div");if(t.className="dac-ed",this.append(e,t),t.appendChild(this.kaartBlok_()),this.rows_.forEach((a,s)=>t.appendChild(this.rijBlok_(a,s))),!this.rows_.length){let a=document.createElement("p");a.className="uitleg",a.textContent="Een rij is \xE9\xE9n regel op de kaart, met \xE9\xE9n, twee of drie entiteiten naast elkaar. Elke rij heeft zijn eigen indeling.",t.appendChild(a)}let n=document.createElement("button");n.type="button",n.className="rijtoevoegen",n.textContent="\uFF0B  Rij toevoegen",n.addEventListener("click",()=>{let a=ct({columns:2,items:[]});this.rows_.push(a);let s=this.rows_.length-1;this.open_.add(`r${s}`),this.legePlekkenOpen_(a,s),this.emit_(),this.build_()}),t.appendChild(n)}binnenKop_(e,t){return e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),t(n)}),e}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"state_position",selector:{select:{mode:"dropdown",options:[{value:"below",label:"Onder de naam"},{value:"right",label:"Rechts op de regel"}]}}}],e.computeLabel=()=>"Waar de status staat",e.computeHelper=()=>"Rechts is de vorm van de entiteitenkaart van Home Assistant: de waarden komen onder elkaar uit. Regels met een schakelaar tonen geen tekst.",e.data={state_position:this.rest_.state_position??"below"},e.addEventListener("value-changed",t=>{t.stopPropagation(),t.detail.value?.state_position==="right"?this.rest_.state_position="right":delete this.rest_.state_position,this.emit_()}),e}rijBlok_(e,t){let n=document.createElement("details");n.className="rij",this.onthoud_(n,`r${t}`);let a=document.createElement("summary"),s=document.createElement("span");s.className="pijl",s.textContent="\u203A";let o=document.createElement("span");o.className="titel";let r=document.createElement("b");r.textContent=`Rij ${t+1}`;let l=document.createElement("small");o.append(r,l);let c=document.createElement("span");c.className="kolommen";let d=[1,2,3].map(h=>{let w=document.createElement("button");return w.type="button",w.textContent=String(h),w.title=`${h} entiteit${h>1?"en":""} in deze rij`,c.appendChild(this.binnenKop_(w,()=>{e.columns!==h&&(e.columns=h,ct(e),this.open_.add(`r${t}`),this.legePlekkenOpen_(e,t),this.emit_(),this.build_())})),w}),u=()=>{let h=e.items.filter($=>$.entity),w=`${e.columns} kolom${e.columns>1?"men":""}`;l.textContent=h.length?`${w} \xB7 ${h.map($=>this.itemNaam_($)).join(", ")}`:`${w} \xB7 nog leeg`,d.forEach($=>$.setAttribute("aria-pressed",String(e.columns===Number($.textContent))))};this.koppen_.push(u);let m=document.createElement("button");m.type="button",m.className="weg",m.title="Rij verwijderen",m.textContent="\u2715",this.binnenKop_(m,()=>{this.rows_.splice(t,1),this.rijWeg_(t),this.emit_(),this.build_()}),a.append(s,o,c,m);let y=document.createElement("div");return y.className="rijbody",e.items.forEach((h,w)=>y.appendChild(this.itemBlok_(e,h,t,w))),n.append(a,y),u(),n}itemNaam_(e){return e.name||this.hass_?.states?.[e.entity]?.attributes?.friendly_name||e.entity}itemBlok_(e,t,n,a){let s=document.createElement("details");s.className="item",this.onthoud_(s,`r${n}i${a}`);let o=document.createElement("summary"),r=document.createElement("span");r.className="pijl",r.textContent="\u203A";let l=document.createElement("span");l.className="nr",l.textContent=String(a+1),l.title=`Plek ${a+1} in de rij`;let c=document.createElement("span");c.className="titel";let d=document.createElement("b"),u=document.createElement("small");c.append(d,u);let m=document.createElement("button");m.type="button",m.className="weg",m.title="Deze plek leegmaken",m.textContent="\u2715",this.binnenKop_(m,()=>{e.items.splice(a,1),this.itemWeg_(n,a),ct(e),this.emit_(),this.build_()}),o.append(r,l,c,m);let y=document.createElement("div");y.className="itembody";let h=document.createElement("ha-form");h.hass=this.hass_,h.schema=[{name:"entity",selector:{entity:{}}}],h.computeLabel=()=>"Entiteit",h.addEventListener("value-changed",M=>{M.stopPropagation(),t.entity=M.detail.value.entity??"",this.emit_()});let w=document.createElement("dac-icon-picker");w.label="Icoon",w.hass=this.hass_,w.addEventListener("value-changed",M=>{M.stopPropagation(),M.detail.value?t.icon=M.detail.value:delete t.icon,this.emit_()});let $=document.createElement("dac-tone-picker");$.label="Kleur",$.hass=this.hass_,$.addEventListener("value-changed",M=>{M.stopPropagation(),M.detail.value?t.tone=M.detail.value:delete t.tone,this.emit_()});let N=document.createElement("ha-form");N.hass=this.hass_,N.schema=[{name:"name",selector:{text:{}}},{name:"toggle",selector:{boolean:{}}},{name:"show_state",selector:{boolean:{}}},{name:"icon_tap_action",selector:{ui_action:{default_action:"toggle"}}},{name:"icon_hold_action",selector:{ui_action:{default_action:"more-info"}}},{name:"tap_action",selector:{ui_action:{default_action:"more-info"}}},{name:"hold_action",selector:{ui_action:{default_action:"more-info"}}}],N.computeLabel=M=>({name:"Naam (overschrijft die van de entiteit)",toggle:"Schakelaar tonen",show_state:"Status tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de regel",hold_action:"Vasthouden op de regel"})[M.name]??M.name,N.computeHelper=M=>{if(M.name==="icon_tap_action")return"Het icoon en de regel zijn twee knoppen: het icoon schakelt, de regel opent of navigeert.";if(M.name==="toggle")return"Een schuifschakelaar rechts op de regel, in plaats van de statustekst. Alleen voor wat twee standen heeft: een lamp, een stopcontact, een schakelaar."},N.addEventListener("value-changed",M=>{M.stopPropagation();let me=M.detail.value;me.name?t.name=me.name:delete t.name,me.toggle===!0?t.toggle=!0:delete t.toggle,me.show_state===!1?t.show_state=!1:delete t.show_state;for(let Fe of["icon_tap_action","icon_hold_action","tap_action","hold_action"])me[Fe]?t[Fe]=me[Fe]:delete t[Fe];this.emit_()});let re=()=>{d.textContent=t.entity?this.itemNaam_(t):"Kies een entiteit",u.textContent=t.entity||"",s.dataset.leeg=String(!t.entity),m.hidden=!t.entity};return this.koppen_.push(re),h.data={entity:t.entity||void 0},w.value=t.icon??"",$.value=t.tone??"",N.data={name:t.name??"",toggle:t.toggle??!1,show_state:t.show_state??!0,icon_tap_action:t.icon_tap_action,icon_hold_action:t.icon_hold_action,tap_action:t.tap_action,hold_action:t.hold_action},y.append(h,w,$,N),s.append(o,y),re(),s}emit_(){let e=pi(this.rows_),t={...this.rest_,rows:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_)n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};H("domotiapp-entities-card-editor",Yt);var hi=44,Jt=6,ui=i=>typeof i=="string"?{entity:i}:{...i};function ls(i){if(Array.isArray(i.rows)&&i.rows.length)return i.rows.map(t=>({columns:Math.min(Math.max(1,Number(t.columns)||2),3),items:(t.items??t.entities??[]).map(ui)}));let e=(i.items??i.entities??[]).map(ui);return e.length?[{columns:Math.min(Math.max(1,Number(i.columns)||2),3),items:e}]:[]}var dt=class extends E{validate(e){let t=ls(e);return t.some(n=>n.items.length)?{show_state:!0,state_position:"below",...e,rows:t}:{...e,[O]:"Voeg een rij toe en kies daar entiteiten in."}}watched(){return this.config.rows.flatMap(e=>e.items.map(t=>t.entity))}item_(e,t){return this.config.rows[+e]?.items[+t]}tone_(e){return e.tone?V(e.tone):this.config.tone?V(this.config.tone):q(e.entity)!=="light"?k.accent:Xe(b(this.hass,e.entity))??k.lit}metSchakelaar_(e){return!!e.toggle&&Ye(e.entity)}template(){let e=this.config;e.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size";let t=e.state_position==="right";return`<div class="card surface">${e.rows.map((a,s)=>`
      <div class="row" style="--cols:${a.columns}">
        ${a.items.map((o,r)=>`
          <div class="it" role="button" tabindex="0" data-r="${s}" data-i="${r}">
            <span class="chip" role="button" tabindex="0"></span>
            <span class="txt"><span class="nm"></span>${t?"":'<span class="st"></span>'}</span>
            ${t?'<span class="st rechts"></span>':""}
            ${this.metSchakelaar_(o)?tt({label:"Aan of uit"}):""}
          </div>`).join("")}
      </div>`).join("")}</div>`}wire(){this.$$(".it").forEach(e=>{let t=this.item_(e.dataset.r,e.dataset.i);if(!t)return;let n=(o,r)=>ee(this,this.hass,t,t[o]??r);this.teardown_.push(j(e,{onTap:()=>n("tap_action",{action:"more-info"}),onHold:()=>n("hold_action",{action:"more-info"})}));let a=e.querySelector(".chip");this.teardown_.push(j(a,{onTap:()=>n("icon_tap_action",be(t.entity)),onHold:()=>n("icon_hold_action",{action:"more-info"})})),this.on(a,"click",o=>o.stopPropagation()),this.on(a,"pointerdown",o=>o.stopPropagation());let s=e.querySelector(".toggle");s&&this.teardown_.push(nt(s,{value:()=>ae(b(this.hass,t.entity)),set:o=>this.hass.callService("homeassistant",o?"turn_on":"turn_off",{entity_id:t.entity}),disabled:()=>P(b(this.hass,t.entity))}))})}paint(){this.$$(".it").forEach(e=>{let t=this.item_(e.dataset.r,e.dataset.i);if(!t)return;let n=b(this.hass,t.entity),a=ae(n),s=P(n);e.dataset.on=String(a),e.classList.toggle("unavailable",s);let o=this.tone_(t);e.style.setProperty("--tone",o);let r=e.querySelector(".chip"),l=fe(this.hass,t.entity,t.icon),c=t.icon||(l?`pic:${l}`:Me(t.entity,D(this.hass,t.entity)));r.dataset.icon!==c&&(r.dataset.icon=c,r.classList.toggle("pic",!!l),r.innerHTML=l?`<img src="${l}" alt="" loading="lazy" />`:x(t.icon||Me(t.entity,D(this.hass,t.entity)))),r.style.setProperty("--tone",l?"var(--dac-ink-3)":a?o:"var(--dac-ink-3)");let d=S(this.hass,t.entity,t.name);this.text(e.querySelector(".nm"),d),r.setAttribute("aria-label",`${d} schakelen`);let u=e.querySelector(".toggle");u&&(Te(u,a),u.style.setProperty("--tone",o),u.setAttribute("aria-label",`${d} aan of uit`));let m=e.querySelector(".st"),y=t.show_state??this.config.show_state;if(u)m.textContent="";else if(y===!1)m.textContent="";else if(s)m.textContent="Niet bereikbaar";else if(!n||Ae(n.entity_id))m.textContent="";else if(q(n.entity_id)==="light"&&a&&n.attributes.brightness!=null)m.textContent=`${Math.round(n.attributes.brightness/255*100)}%`;else{let h=n.attributes.unit_of_measurement;m.textContent=h?`${n.state} ${h}`:I(this.hass,n)}e.setAttribute("aria-label",`${d}${n?`, ${I(this.hass,n)}`:""}`)})}lines_(){return(this.config?.rows??[]).reduce((e,t)=>e+Math.ceil((t.items.length||1)/t.columns),0)}getCardSize(){return Math.max(1,this.lines_())}getGridOptions(){let e=Math.max(1,this.lines_()),t=F(12+e*hi+(e-1)*Jt);return{columns:12,rows:t,min_columns:4,min_rows:t,max_rows:t}}static getConfigElement(){return document.createElement("domotiapp-entities-card-editor")}static getStubConfig(){return{rows:[]}}};_(dt,"css",`
    :host { display: block; height: 100%; }

    /* 5px boven en onder plus 44px per regel plus de rand van 2 komt precies op
       56 uit: \xE9\xE9n rasterrij, dezelfde hoogte als een Mushroom-kaart ernaast. */
    .card {
      height: 100%; min-height: 56px; padding: 5px 10px;
      display: flex; flex-direction: column; justify-content: center; gap: ${Jt}px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

    .row {
      display: grid; gap: ${Jt}px;
      grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr));
    }

    .it {
      display: flex; align-items: center; gap: 10px;
      min-height: ${hi}px; padding: 2px 6px 2px 2px;
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

    ${it}
    .toggle { width: 42px; height: 24px; }
    .toggle .knob { width: 18px; height: 18px; }
    .toggle[aria-checked="true"] .knob { --knob: 20px; }

    .it.unavailable { opacity: .42; pointer-events: none; }

    /* Onder de 260px passen twee namen niet meer naast elkaar zonder te
       verminken, dus dan gaat elke rij terug naar \xE9\xE9n kolom. */
    @container (max-width: 260px) {
      .row { grid-template-columns: 1fr; }
    }
  `);A("domotiapp-entities-card",dt,{name:"DomotiApp Entiteiten",description:"Rijen entiteiten, elk met een eigen kolomindeling."});var W={PAUSE:1,SEEK:2,VOLUME_SET:4,VOLUME_MUTE:8,PREVIOUS_TRACK:16,NEXT_TRACK:32,TURN_ON:128,TURN_OFF:256,PLAY_MEDIA:512,VOLUME_STEP:1024,SELECT_SOURCE:2048,STOP:4096,PLAY:16384,SHUFFLE_SET:32768,REPEAT_SET:262144,GROUPING:524288},B=(i,e)=>!!(Number(i?.attributes?.supported_features??0)&e),Qt=i=>!i||i.state==="off",gi=i=>!!i&&!["off","unavailable","unknown"].includes(i.state),en=i=>i?.state==="playing",fi=i=>!!i&&!["off","unavailable","unknown","idle","standby"].includes(i.state);function bi(i){if(!i)return[];let e=[];return(B(i,W.TURN_ON)||B(i,W.TURN_OFF))&&e.push("power"),Qt(i)||(B(i,W.PREVIOUS_TRACK)&&e.push("prev"),B(i,W.PLAY)||B(i,W.PAUSE)||B(i,W.PLAY_MEDIA)?e.push("play"):B(i,W.STOP)&&e.push("stop"),B(i,W.NEXT_TRACK)&&e.push("next")),e}function tn(i){if(!gi(i))return[];let e=[];return B(i,W.VOLUME_MUTE)&&e.push("mute"),B(i,W.VOLUME_SET)?e.push("slider"):B(i,W.VOLUME_STEP)&&e.push("steps"),e}var nn=i=>Math.round(Math.min(1,Math.max(0,Number(i?.attributes?.volume_level??0)))*100),an=i=>!!i?.attributes?.is_volume_muted,mi=i=>!!i?.attributes?.mass_player_type,sn=i=>!!i?.attributes?.shuffle,on=i=>{let e=i?.attributes?.repeat;return["off","all","one"].includes(e)?e:"off"},vi=i=>({off:"all",all:"one",one:"off"})[cs(i)]??"all",cs=i=>["off","all","one"].includes(i)?i:"off";function rn(i,{zoeken:e=!0}={}){if(!gi(i))return[];let t=[];return B(i,W.SHUFFLE_SET)&&t.push("shuffle"),B(i,W.REPEAT_SET)&&t.push("repeat"),e&&mi(i)&&t.push("search"),e&&mi(i)&&B(i,W.GROUPING)&&t.push("speakers"),t}function _i(i,e=t=>t?.state??""){if(!i)return"";if(i.state==="unavailable")return"Niet bereikbaar";if(i.state==="off")return"Uit";if(i.state==="standby")return"Stand-by";let t=i.attributes??{},n=t.media_title||t.media_channel||"",a=t.media_artist||t.media_series_title||t.media_album_name||t.app_name||t.source||"";return i.state==="idle"||!n?a||e(i):a&&a!==n?`${n} \xB7 ${a}`:n}function xi(i){let e=i?.attributes?.device_class;return e==="tv"?"tv":e==="receiver"?"radio":"speaker"}var ds=350,ps=[["","Alles"],["track","Nummers"],["album","Albums"],["artist","Artiesten"],["playlist","Afspeellijsten"],["radio","Radio"]],hs={track:"Nummer",album:"Album",artist:"Artiest",playlist:"Afspeellijst",radio:"Radio",podcast:"Podcast",audiobook:"Luisterboek"};function us(i){let e=Array.isArray(i.artists)?i.artists.map(a=>typeof a=="string"?a:a?.name).filter(Boolean).join(", "):"",t=typeof i.album=="string"?i.album:i.album?.name,n=hs[i.media_type]??"";return[e,t].filter(Boolean).join(" \xB7 ")||n}var ms=`
  :host {
    ${Y}
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
  .rond:hover { background: var(--dac-surface-hi); color: var(--dac-ink); }
  .rond .icon { width: 18px; height: 18px; }

  /* ------------------------------------------------------------ zoeken */
  .zoek { flex: 0 0 auto; padding: 14px 16px 8px; display: flex; gap: 10px; align-items: center; }
  .zoek .veld {
    flex: 1 1 auto; display: flex; align-items: center; gap: 10px;
    padding: 0 14px; height: 46px; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .zoek .veld:focus-within { border-color: var(--dac-accent-hi); }
  .zoek .veld .icon { width: 18px; height: 18px; color: var(--dac-ink-3); flex: 0 0 auto; }
  .zoek input {
    flex: 1 1 auto; min-width: 0; height: 100%;
    background: none; border: 0; outline: none;
    font: inherit; font-size: 15px; color: var(--dac-ink);
  }
  .zoek input::placeholder { color: var(--dac-ink-3); }

  .soorten {
    flex: 0 0 auto; display: flex; gap: 8px; padding: 6px 16px 10px;
    overflow-x: auto; scrollbar-width: none;
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
    flex: 1 1 auto; overflow-y: auto; padding: 4px 16px 20px;
    display: grid; gap: 10px;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    align-content: start;
  }

  .tr {
    display: flex; align-items: center; gap: 12px; padding: 8px;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius-sm);
    cursor: pointer; text-align: left; font: inherit; color: inherit;
    transition: background 160ms ease, border-color 160ms ease;
  }
  .tr:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); }
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
  .sprekers { display: flex; gap: 8px; flex-wrap: wrap; }
  .sprekers button {
    display: flex; align-items: center; gap: 8px; padding: 7px 13px 7px 9px;
    cursor: pointer; font: inherit; font-size: 12.5px;
    border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border); color: var(--dac-ink-2);
  }
  .sprekers button .icon { width: 15px; height: 15px; }
  /* Meespelen is aan, en dat draagt de accentkleur -- net als een aanstaande
     schakelaar elders in de familie. */
  .sprekers button[aria-pressed="true"] {
    background: color-mix(in srgb, var(--dac-accent-hi) 20%, transparent);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 48%, transparent);
    color: var(--dac-ink);
  }
  .sprekers button[data-zelf="true"] { opacity: .75; cursor: default; }
  .sprekers button[disabled] { opacity: .4; cursor: not-allowed; }

  /* ---------------------------------------------------------------- menu */
  .menu {
    position: fixed; z-index: 2; min-width: 190px; padding: 6px;
    background: var(--dac-bg-raise); border: 1px solid var(--dac-border-hi);
    border-radius: var(--dac-radius-sm); box-shadow: 0 24px 48px -20px rgba(0,0,0,.9);
    display: flex; flex-direction: column;
  }
  .menu[hidden] { display: none; }
  .menu button {
    padding: 10px 12px; cursor: pointer; font: inherit; font-size: 13px; text-align: left;
    background: none; border: 0; border-radius: 8px; color: var(--dac-ink);
  }
  .menu button:hover { background: var(--dac-surface-hi); }
  .menu .titel {
    padding: 6px 12px 8px; font-size: 11.5px; color: var(--dac-ink-3);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 240px;
  }
`,ln=class extends HTMLElement{static get sheet_(){return Object.hasOwn(this,"s_")||(this.s_=ie(ge+ms)),this.s_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[new.target.sheet_],this.soort_="",this.treffers_=[],this.speakers_=null,this.opruimen_=[]}open(e,t,n){this.hass=e,this.entity_=t,this.naam_=n,this.gebouwd_||this.bouw_(),this.setAttribute("open",""),this.escape_??=a=>{a.key==="Escape"&&this.hasAttribute("open")&&this.sluit()},document.addEventListener("keydown",this.escape_,!0),this.$(".wie b").textContent=n,this.$(".wie span").textContent="Music Assistant",this.sprekerSig_=null,this.haalSpeakers_(),setTimeout(()=>this.$("input")?.focus(),60)}sluit(){this.removeAttribute("open"),this.menuDicht_(),this.escape_&&document.removeEventListener("keydown",this.escape_,!0)}set hass(e){this.hass_=e,this.gebouwd_&&this.hasAttribute("open")&&this.tekenSpeakers_()}get hass(){return this.hass_}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.gebouwd_=!0,this.shadowRoot.innerHTML=`
      <div class="laag">
        <header>
          <span class="wie"><b></b><span></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${x("close")}</button>
        </header>
        <div class="zoek">
          <label class="veld">
            ${x("search")}
            <input type="search" placeholder="Zoek een nummer, album, artiest of afspeellijst"
                   autocomplete="off" spellcheck="false" enterkeyhint="search" />
          </label>
        </div>
        <nav class="soorten">
          ${ps.map(([t,n])=>`<button type="button" data-soort="${t}" aria-pressed="${t===""}">${n}</button>`).join("")}
        </nav>
        <div class="lijst"></div>
        <footer hidden>
          <span class="kop">Speelt af op</span>
          <div class="sprekers"></div>
        </footer>
        <div class="menu" hidden></div>
      </div>`,this.aan_(this.$(".sluit"),"click",()=>this.sluit()),this.aan_(this.$(".laag"),"pointerdown",t=>{t.target===this.$(".laag")?this.sluit():t.target.closest(".menu")||this.menuDicht_()});let e=this.$("input");this.aan_(e,"input",()=>this.tikPauze_()),this.aan_(e,"keydown",t=>{t.key==="Enter"&&(clearTimeout(this.timer_),this.zoek_()),t.key==="Escape"&&this.sluit()}),this.aan_(this.$(".soorten"),"click",t=>{let n=t.target.closest("[data-soort]");if(n){this.soort_=n.dataset.soort;for(let a of this.shadowRoot.querySelectorAll("[data-soort]"))a.setAttribute("aria-pressed",String(a===n));clearTimeout(this.timer_),this.zoek_()}}),this.aan_(this.$(".sprekers"),"click",t=>{let n=t.target.closest("[data-speaker]");n&&this.wisselSpeaker_(n.dataset.speaker)}),this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen: nummers, albums, artiesten, afspeellijsten en radio.")}aan_(e,t,n,a){e.addEventListener(t,n,a),this.opruimen_.push(()=>e.removeEventListener(t,n,a))}tikPauze_(){clearTimeout(this.timer_),this.timer_=setTimeout(()=>this.zoek_(),ds)}async zoek_(){let e=this.$("input").value.trim();if(!e){this.treffers_=[],this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen.");return}let t=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Zoeken\u2026",e);try{let n=await this.hass.callWS({type:"domotiapp_lovelace/media/search",query:e,...this.soort_?{media_types:[this.soort_]}:{},limit:20});if(t!==this.beurt_)return;this.treffers_=n?.results??[],this.teken_()}catch(n){if(t!==this.beurt_)return;this.leegMelding_("Zoeken lukte niet",n?.message??"Music Assistant gaf geen antwoord.",!0)}}leegMelding_(e,t,n=!1){this.$(".lijst").innerHTML=`<div class="melding${n?" fout":""}"><b>${e}</b>${t}</div>`}teken_(){let e=this.$(".lijst");if(!this.treffers_.length){this.leegMelding_("Niets gevonden","Probeer een andere naam of een ander soort.");return}e.innerHTML=this.treffers_.map((t,n)=>{let a=t.image?`<img src="${t.image}" alt="" loading="lazy" />`:x(t.media_type==="radio"?"radio":"music");return`
          <button class="tr" type="button" data-i="${n}">
            <span class="hoes">${a}</span>
            <span class="tekst">
              <span class="nm">${this.veilig_(t.name)}</span>
              <span class="ond">${this.veilig_(us(t))}</span>
            </span>
          </button>`}).join(""),this.trefferBinding_?.(),this.trefferBinding_=j(e,{onTap:()=>{let t=this.laatsteTreffer_;t&&this.speel_(t,"replace")},onHold:()=>{let t=this.laatsteTreffer_;t&&this.menuOpen_(t)}}),this.aan_(e,"pointerdown",t=>{let n=t.target.closest("[data-i]");this.laatsteTreffer_=n?this.treffers_[+n.dataset.i]:null,this.menuPlek_=n?n.getBoundingClientRect():null})}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}speel_(e,t){e?.uri&&(this.menuDicht_(),this.hass.callService("music_assistant","play_media",{media_id:e.uri,...e.media_type?{media_type:e.media_type}:{},enqueue:t},{entity_id:this.entity_}),t==="replace"&&this.sluit())}menuOpen_(e){let t=this.$(".menu");t.innerHTML=`<span class="titel">${this.veilig_(e.name)}</span><button type="button" data-w="replace">Nu afspelen</button><button type="button" data-w="next">Hierna afspelen</button><button type="button" data-w="add">Achteraan in de wachtrij</button>`,t.hidden=!1;let n=this.menuPlek_,s=Math.min(Math.max(8,(n?.left??40)+12),window.innerWidth-210-8),o=Math.min((n?.bottom??80)+6,window.innerHeight-160);t.style.left=`${s}px`,t.style.top=`${o}px`,t.onclick=r=>{let l=r.target.closest("[data-w]");l&&this.speel_(e,l.dataset.w)}}menuDicht_(){let e=this.$(".menu");e&&(e.hidden=!0)}async haalSpeakers_(){try{this.speakers_=await this.hass.callWS({type:"domotiapp_lovelace/media/speakers"})}catch{this.speakers_=null}this.tekenSpeakers_()}groepNu_(){let t=this.hass?.states?.[this.entity_]?.attributes?.group_members;return new Set(Array.isArray(t)?t:[])}tekenSpeakers_(){let e=this.$("footer");if(!e)return;let t=this.speakers_;if(!t||!t.label_exists||!t.entities?.length){e.hidden=!t||t.label_exists===void 0,e.hidden||(this.$(".sprekers").innerHTML=`<span class="ond" style="color:var(--dac-ink-2);font-size:12.5px">Plak het label <b>${this.veilig_(t?.label_name??"Music Assistant Media")}</b> op je speakers om ze hier samen te laten spelen.</span>`);return}e.hidden=!1;let n=this.groepNu_(),a=t.entities.map(s=>`${s.entity_id}:${s.entity_id===this.entity_||n.has(s.entity_id)}`).join("|");this.sprekerSig_!==a&&(this.sprekerSig_=a,this.$(".sprekers").innerHTML=t.entities.map(s=>{let o=s.entity_id===this.entity_,r=o||n.has(s.entity_id);return`<button type="button" data-speaker="${s.entity_id}" data-zelf="${o}"
                  aria-pressed="${r}" ${!o&&!s.can_group?"disabled":""}
                  title="${o?"Deze kaart":s.can_group?"":"Deze speaker laat zich niet koppelen"}">
                  ${x(r?"volume":"speaker")}${this.veilig_(s.name)}</button>`}).join(""))}wisselSpeaker_(e){if(e===this.entity_)return;this.groepNu_().has(e)?this.hass.callService("media_player","unjoin",{},{entity_id:e}):this.hass.callService("media_player","join",{group_members:[e]},{entity_id:this.entity_})}disconnectedCallback(){clearTimeout(this.timer_),this.escape_&&document.removeEventListener("keydown",this.escape_,!0),this.trefferBinding_?.();for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}};H("domotiapp-media-browser",ln);function ki(i,e,t){let n=document.querySelector("domotiapp-media-browser");return n||(n=document.createElement("domotiapp-media-browser"),document.body.appendChild(n)),n.tabIndex=-1,n.open(i,e,t),n.focus?.(),n}var pt={power:{icon:"power",label:"Aan of uit"},prev:{icon:"prev",label:"Vorige"},play:{icon:"play",label:"Afspelen of pauzeren"},stop:{icon:"stop",label:"Stoppen"},next:{icon:"next",label:"Volgende"},shuffle:{icon:"shuffle",label:"Willekeurig"},repeat:{icon:"repeat",label:"Herhalen"},search:{icon:"search",label:"Zoeken in Music Assistant"},speakers:{icon:"speakers",label:"Speakers koppelen"}},ht=class extends E{validate(e){return e.entity?{show_artwork:!0,show_volume:!0,show_controls:!0,show_search:!0,...e}:{...e,[O]:"Kies een mediaspeler."}}watched(){return[this.config.entity]}tone_(){return this.config.tone?V(this.config.tone):k.accent}template(){return this.config.bare&&this.setAttribute("bare",""),`
      <div class="card surface" style="--tone:${this.tone_()}">
        <div class="top" data-on="false">
          <span class="chip" role="button" tabindex="0"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="ctl"></span>
        </div>
        <div class="vol" hidden></div>
        <div class="extra" hidden></div>
      </div>`}wire(){let e=this.config,t=(s,o)=>ee(this,this.hass,e,e[s]??o);this.teardown_.push(j(this.$(".top"),{onTap:()=>t("tap_action",{action:"more-info"}),onHold:()=>t("hold_action",{action:"more-info"})}));let n=this.$(".chip");this.teardown_.push(j(n,{onTap:()=>t("icon_tap_action",be(e.entity)),onHold:()=>t("icon_hold_action",{action:"more-info"})})),this.on(n,"click",s=>s.stopPropagation()),this.on(n,"pointerdown",s=>s.stopPropagation());let a=s=>{let o=s.target.closest?.("[data-k]");o&&(s.stopPropagation(),this.doe_(o.dataset.k))};this.on(this.$(".ctl"),"click",a),this.on(this.$(".vol"),"click",a),this.on(this.$(".extra"),"click",a),this.on(this.$(".ctl"),"pointerdown",s=>s.stopPropagation()),this.on(this.$(".vol"),"pointerdown",s=>s.stopPropagation()),this.on(this.$(".extra"),"pointerdown",s=>s.stopPropagation()),this.sliders_=new Map}doe_(e){let t=this.config.entity,n=b(this.hass,t),a=(s,o={})=>this.hass.callService("media_player",s,{entity_id:t,...o});switch(e){case"power":return a(Qt(n)?"turn_on":"turn_off");case"prev":return a("media_previous_track");case"next":return a("media_next_track");case"play":return a(en(n)?"media_pause":"media_play");case"stop":return a("media_stop");case"mute":return a("volume_mute",{is_volume_muted:!an(n)});case"vol-":return a("volume_down");case"vol+":return a("volume_up");case"shuffle":return this.hass.callService("media_player","shuffle_set",{shuffle:!sn(n)},{entity_id:t});case"repeat":return this.hass.callService("media_player","repeat_set",{repeat:vi(on(n))},{entity_id:t});case"search":case"speakers":return ki(this.hass,t,S(this.hass,t,this.config.name));default:return}}paint(){let e=this.config,t=b(this.hass,e.entity),n=!t||t.state==="unavailable",a=fi(t),s=this.$(".top");s.dataset.on=String(a),s.classList.toggle("unavailable",n),this.$(".card").style.setProperty("--tone",this.tone_());let o=this.$(".chip"),r=e.show_artwork===!1?null:fe(this.hass,e.entity,e.icon),l=r?`pic:${r}`:e.icon||xi(t);o.dataset.icon!==l&&(o.dataset.icon=l,o.classList.toggle("pic",!!r),o.innerHTML=r?`<img src="${r}" alt="" loading="lazy" />`:x(l,"speaker")),o.style.setProperty("--tone",a&&!r?this.tone_():"var(--dac-ink-3)");let c=S(this.hass,e.entity,e.name),d=_i(t,u=>I(this.hass,u));this.text(".nm",c),this.text(".st",d),o.setAttribute("aria-label",`${c} afspelen of pauzeren`),s.setAttribute("aria-label",`${c}, ${d}`),this.paintKnoppen_(t,n),this.paintVolume_(t,n),this.paintExtra_(t,n)}paintKnoppen_(e,t){let n=this.$(".ctl"),a=this.config.show_controls===!1||t?[]:bi(e),s=a.join(",");n.dataset.sig!==s&&(n.dataset.sig=s,n.innerHTML=a.map(r=>`<button class="k ${r==="play"||r==="stop"?"hoofd":""}" type="button" data-k="${r}" aria-label="${pt[r].label}">${x(pt[r].icon)}</button>`).join(""));let o=n.querySelector('[data-k="play"]');if(o){let r=en(e)?"pause":"play";o.dataset.icon!==r&&(o.dataset.icon=r,o.innerHTML=x(r))}}paintVolume_(e,t){let n=this.$(".vol"),a=this.config.show_volume===!1||t?[]:tn(e);if(n.hidden=!a.length,!a.length){n.dataset.sig="",this.sliders_?.delete("volume");return}let s=a.join(",");n.dataset.sig!==s&&(n.dataset.sig=s,n.innerHTML=(a.includes("mute")?`<button class="k" type="button" data-k="mute" aria-label="Dempen">${x("volume")}</button>`:"")+(a.includes("slider")?se("volume"):"")+(a.includes("steps")?`<button class="k" type="button" data-k="vol-" aria-label="Zachter">${x("minus")}</button><button class="k" type="button" data-k="vol+" aria-label="Harder">${x("plus")}</button>`:"")+'<span class="pct tnum"></span>',this.sliders_?.delete("volume"),n.querySelector(".slider")?.setAttribute("aria-label","Volume"));let o=an(e),r=nn(e),l=n.querySelector('[data-k="mute"]');if(l){let d=o?"volumeMute":"volume";l.dataset.icon!==d&&(l.dataset.icon=d,l.innerHTML=x(d)),l.setAttribute("aria-pressed",String(o))}let c=n.querySelector(".slider");c&&(this.attach_(c,"volume",{value:()=>nn(b(this.hass,this.config.entity)),onInput:d=>this.setSlider_(c,d),onCommit:d=>this.hass.callService("media_player","volume_set",{entity_id:this.config.entity,volume_level:d/100}),disabled:()=>P(b(this.hass,this.config.entity))}),c.classList.contains("dragging")||this.setSlider_(c,r)),this.text(".pct",o?"Gedempt":`${r}%`)}paintExtra_(e,t){let n=this.$(".extra"),a=t||this.config.show_controls===!1?[]:rn(e,{zoeken:this.config.show_search!==!1});n.hidden=!a.length;let s=a.join(",");if(n.dataset.sig!==s&&(n.dataset.sig=s,n.innerHTML=a.map((c,d)=>`${c==="search"&&d>0?'<span class="rek"></span>':""}<button class="k" type="button" data-k="${c}" aria-label="${pt[c].label}">${x(pt[c].icon)}</button>`).join("")),!a.length)return;let o=n.querySelector('[data-k="shuffle"]');o&&o.setAttribute("aria-pressed",String(sn(e)));let r=n.querySelector('[data-k="repeat"]');if(r){let c=on(e),d=c==="one"?"repeatOne":"repeat";r.dataset.icon!==d&&(r.dataset.icon=d,r.innerHTML=x(d)),r.setAttribute("aria-pressed",String(c!=="off")),r.setAttribute("aria-label",{off:"Herhalen: uit",all:"Herhalen: alles",one:"Herhalen: dit nummer"}[c])}let l=document.querySelector("domotiapp-media-browser");l?.hasAttribute("open")&&(l.hass=this.hass)}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let a=_e(e,n);this.sliders_.set(t,a),this.teardown_.push(a)}setSlider_(e,t){e&&(e.style.setProperty("--v",`${t}%`),e.setAttribute("aria-valuenow",String(t)),this.text(".pct",`${t}%`))}getCardSize(){let e=b(this.hass,this.config?.entity);return 1+(tn(e).length?1:0)+(rn(e).length?1:0)}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:1}}static getConfigElement(){return document.createElement("domotiapp-media-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("media_player."));return n?{entity:n}:{}}};_(ht,"css",`
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
    ${xe}
    .vol { display: flex; align-items: center; gap: 8px; }
    .vol[hidden] { display: none; }
    .vol .slider { height: 30px; }
    .vol .k { width: 30px; height: 30px; }
    .vol .k .icon { width: 16px; height: 16px; }
    .pct {
      flex: 0 0 auto; min-width: 36px; text-align: right;
      font-size: 11.5px; color: var(--dac-ink-2);
    }

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

    .top.unavailable, .vol.unavailable { opacity: .42; }
    .top.unavailable .k, .top.unavailable .chip,
    .vol.unavailable .slider, .vol.unavailable .k { pointer-events: none; }
  `);var cn=class extends z{defaults(){return{show_artwork:!0,show_volume:!0,show_controls:!0,show_search:!0,icon_tap_action:{action:"toggle"},tap_action:{action:"more-info"}}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"speaker"},{key:"tone",kind:"tone",label:"Kleur"}]}schema(){return[{name:"entity",selector:g.entity("media_player")},{name:"name",selector:g.text()},{name:"show_artwork",selector:g.bool()},{name:"show_controls",selector:g.bool()},{name:"show_volume",selector:g.bool()},{name:"show_search",selector:g.bool()},{name:"icon_tap_action",selector:g.action("toggle")},{name:"icon_hold_action",selector:g.action("more-info")},{name:"tap_action",selector:g.action("more-info")},{name:"hold_action",selector:g.action("more-info")}]}label(e){return{entity:"Mediaspeler",name:"Naam (overschrijft die van de speler)",show_artwork:"Albumhoes tonen",show_controls:"Knoppen tonen",show_volume:"Volume tonen",show_search:"Zoeken en groeperen tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Welke knoppen er verschijnen leest de kaart uit de speler zelf: wat hij niet kan, komt er niet op.";if(e.name==="show_artwork")return"Speelt er iets met een hoes, dan vult die de chip. Een eigen icoon gaat voor.";if(e.name==="show_volume")return"De volumeregel verschijnt zodra er iets speelt en verdwijnt als de speler uit gaat.";if(e.name==="show_search")return"De zoekknop opent Music Assistant over het hele scherm. Alleen bij een speler van Music Assistant; groeperen komt erbij als de speler dat aankan."}};C("domotiapp-media-card-editor",cn);A("domotiapp-media-card",ht,{name:"DomotiApp Mediaspeler",description:"Wat er speelt, de knoppen die de speler aankan, en het volume."});var Ne=[{sleutel:"smoke",label:"Rook",icoon:"smoke",alarm:"Rook gedetecteerd"},{sleutel:"co",label:"Koolmonoxide",icoon:"warning",alarm:"Koolmonoxide gedetecteerd"},{sleutel:"heat",label:"Warmte",icoon:"thermo",alarm:"Te warm"},{sleutel:"temperature",label:"Temperatuur",icoon:"thermo",meting:!0},{sleutel:"battery",label:"Batterij",icoon:"battery",meting:!0}],dn=20;function pn(i){if(!i||i.state==="unavailable"||i.state==="unknown")return null;if(String(i.entity_id??"").startsWith("binary_sensor."))return i.state==="on"?0:null;let e=Number(i.state);return Number.isFinite(e)?e:null}var gs=i=>!!i&&i.state==="on",fs=i=>!i||i.state==="unavailable"||i.state==="unknown";function yi(i,e){let t=i.filter(a=>!a.meting);for(let a of t)if(gs(e(a.sleutel)))return{soort:"alarm",tekst:a.alarm,tone:"bad",icoon:a.icoon};if(i.length&&i.every(a=>fs(e(a.sleutel))))return{soort:"weg",tekst:"Niet bereikbaar",tone:"neutral",icoon:"smoke"};let n=pn(e("battery"));return n!=null&&n<=dn?{soort:"batterij",tekst:`Batterij bijna leeg (${Math.round(n)}%)`,tone:"warn",icoon:"battery"}:t.length?{soort:"goed",tekst:"Alles rustig",tone:"good",icoon:"smoke"}:{soort:"meting",tekst:"",tone:"accent",icoon:"smoke"}}var bs={good:k.good,warn:k.warn,bad:k.bad,neutral:k.neutral,accent:k.accent},ut=class extends E{validate(e){return Ne.filter(n=>e[n.sleutel]).length?{...e}:{...e,[O]:"Kies minstens \xE9\xE9n entiteit: rook, koolmonoxide, warmte, temperatuur of batterij."}}watched(){return Ne.map(e=>this.config[e.sleutel]).filter(Boolean)}gekozen_(){return Ne.filter(e=>this.config[e.sleutel])}toestand_(){let e=yi(this.gekozen_(),t=>b(this.hass,this.config[t]));return{...e,tone:bs[e.tone]??k.accent}}batterijPct_(){return pn(b(this.hass,this.config.battery))}template(){this.config.bare&&this.setAttribute("bare","");let e=this.gekozen_().map(t=>`<span class="pil" data-soort="${t.sleutel}">${x(t.icoon)}
          <span class="lb">${t.label}</span> <b></b></span>`).join("");return`
      <div class="card surface">
        <div class="top" role="button" tabindex="0" style="--tone:${k.good}">
          <span class="chip"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
        </div>
        <div class="meta">${e}</div>
      </div>`}wire(){let e=this.config,t=this.gekozen_()[0];this.teardown_.push(j(this.$(".top"),{onTap:()=>e.tap_action?ee(this,this.hass,e,e.tap_action):R(this,e.smoke??e[t.sleutel]),onHold:()=>ee(this,this.hass,e,e.hold_action??{action:"more-info"})})),this.$$(".pil").forEach(n=>{let a=e[n.dataset.soort];a&&(this.on(n,"click",s=>{s.stopPropagation(),R(this,a)}),this.on(n,"pointerdown",s=>s.stopPropagation()),n.style.cursor="pointer")})}paint(){let e=this.config,t=this.toestand_(),n=this.$(".top");this.toggleAttribute("alarm",t.soort==="alarm"),n.style.setProperty("--tone",t.tone),n.classList.toggle("unavailable",t.soort==="weg");let a=this.$(".chip"),s=e.icon||t.icoon;a.dataset.icon!==s&&(a.dataset.icon=s,a.innerHTML=x(s,"smoke")),a.style.setProperty("--tone",t.tone);let o=this.gekozen_()[0];this.text(".nm",e.name||S(this.hass,e.smoke??e[o.sleutel],null)),this.text(".st",t.tekst),n.setAttribute("aria-label",`${this.$(".nm").textContent}${t.tekst?`, ${t.tekst}`:""}`),this.$$(".pil").forEach(r=>this.paintPil_(r)),this.$(".meta").hidden=this.gekozen_().length<=1&&!this.config.always_meta}paintPil_(e){let t=Ne.find(o=>o.sleutel===e.dataset.soort),n=b(this.hass,this.config[t.sleutel]),a=e.querySelector("b");if(!n||P(n)){a.textContent="\u2014",e.dataset.let="";return}if(t.meting){let o=n.attributes.unit_of_measurement??"",r=Number(n.state);a.textContent=Number.isFinite(r)?`${K(this.hass,r,t.sleutel==="temperature"?1:0)} ${o}`.trim():I(this.hass,n);let l=t.sleutel==="battery"?this.batterijPct_():null;e.dataset.let=l!=null&&l<=dn?"warn":"";return}let s=ae(n);a.textContent=s?"Alarm":"Rustig",e.dataset.let=s?"bad":""}regels_(){return this.gekozen_().length>1?2:1}getCardSize(){return this.regels_()}getGridOptions(){let e=this.regels_()===1?1:F(90);return{columns:12,rows:e,min_columns:4,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-smoke-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("binary_sensor.")&&/rook|smoke/i.test(a));return n?{smoke:n}:{}}};_(ut,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

    .top { display: flex; align-items: center; gap: 11px; min-height: 40px; cursor: pointer; }
    .chip { width: 40px; height: 40px; }
    .chip .icon { width: 20px; height: 20px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
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
       E\xE9n regel die schuift, en niet twee die afbreken. De kaart claimt twee
       rasterrijen; zouden de pillen doorlopen naar een derde regel, dan valt de
       onderste buiten de hoogte die Home Assistant heeft gereserveerd. Bij een
       kaart over de volle breedte passen alle vijf ernaast. */
    .meta {
      display: flex; flex-wrap: nowrap; gap: 6px;
      overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch;
    }
    .meta::-webkit-scrollbar { display: none; }
    .pil { flex: 0 0 auto; }
    .meta[hidden] { display: none; }
    .pil {
      display: flex; align-items: center; gap: 7px; padding: 5px 11px 5px 8px;
      border-radius: var(--dac-radius-pill);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      font-size: 11.5px; color: var(--dac-ink-2);
      font-variant-numeric: tabular-nums;
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
  `);var hn=class extends z{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"smoke"}]}schema(){return[{name:"name",selector:g.text()},{name:"smoke",selector:g.entity()},{name:"co",selector:g.entity()},{name:"heat",selector:g.entity()},{name:"temperature",selector:g.entity()},{name:"battery",selector:g.entity()},{name:"tap_action",selector:g.action("more-info")},{name:"hold_action",selector:g.action("more-info")}]}label(e){return{name:"Naam (overschrijft die van de melder)",smoke:"Rook",co:"Koolmonoxide",heat:"Warmte",temperature:"Temperatuur",battery:"Batterij",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="smoke")return"Alle vijf zijn optioneel: vul in wat je melder heeft. Wat je leeg laat, komt niet op de kaart.";if(e.name==="battery")return"Een percentage of een 'batterij bijna leeg'-sensor. Onder de 20% meldt de kaart het uit zichzelf."}};C("domotiapp-smoke-card-editor",hn);A("domotiapp-smoke-card",ut,{name:"DomotiApp Rookmelder",description:"Rook, koolmonoxide, warmte, temperatuur en batterij \u2014 alles optioneel."});var wi=[{sleutel:"disarmed",label:"Uitgeschakeld",dienst:"alarm_disarm",icoon:"lockOpen"},{sleutel:"armed_away",label:"Afwezig",dienst:"alarm_arm_away",icoon:"away"},{sleutel:"armed_home",label:"Thuis",dienst:"alarm_arm_home",icoon:"house"}],vs={disarmed:{tekst:"Uitgeschakeld",tone:k.neutral,icoon:"lockOpen"},armed_away:{tekst:"Ingeschakeld \u2014 afwezig",tone:k.good,icoon:"shield"},armed_home:{tekst:"Ingeschakeld \u2014 thuis",tone:k.good,icoon:"shield"},armed_night:{tekst:"Ingeschakeld \u2014 nacht",tone:k.good,icoon:"shield"},armed_vacation:{tekst:"Ingeschakeld \u2014 vakantie",tone:k.good,icoon:"shield"},armed_custom_bypass:{tekst:"Ingeschakeld \u2014 aangepast",tone:k.good,icoon:"shield"},arming:{tekst:"Inschakelen\u2026",tone:k.warn,icoon:"shield"},pending:{tekst:"Aftellen\u2026",tone:k.warn,icoon:"clock"},triggered:{tekst:"ALARM",tone:k.bad,icoon:"warning"}},mt=class extends E{validate(e){return e.entity?{...e}:{...e,[O]:"Kies een alarmpaneel."}}watched(){return[this.config.entity]}uiterlijk_(){let e=b(this.hass,this.config.entity);return!e||e.state==="unavailable"?{tekst:"Niet bereikbaar",tone:k.neutral,icoon:"shield"}:vs[e.state]??{tekst:I(this.hass,e),tone:k.accent,icoon:"shield"}}template(){return this.config.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size",`
      <div class="card surface">
        <div class="top" role="button" tabindex="0" style="--tone:${k.neutral}">
          <span class="chip"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
        </div>
        <div class="standen" role="group" aria-label="Alarmstand">
          ${wi.map(e=>`<button class="stand" type="button" data-stand="${e.sleutel}"
              aria-pressed="false">${x(e.icoon)}<span>${e.label}</span></button>`).join("")}
        </div>
      </div>`}wire(){this.teardown_.push(j(this.$(".top"),{onTap:()=>R(this,this.config.entity),onHold:()=>R(this,this.config.entity)})),this.on(this.$(".standen"),"click",e=>{let t=e.target.closest("[data-stand]");if(!t)return;e.stopPropagation();let n=wi.find(a=>a.sleutel===t.dataset.stand);n&&this.hass.callService("alarm_control_panel",n.dienst,{entity_id:this.config.entity})}),this.on(this.$(".standen"),"pointerdown",e=>e.stopPropagation())}paint(){let e=this.config,t=b(this.hass,e.entity),n=P(t)&&t?.state!=="unknown",a=this.uiterlijk_(),s=this.$(".top");s.style.setProperty("--tone",a.tone),this.$(".standen").style.setProperty("--tone",a.tone),s.classList.toggle("unavailable",n),this.$(".standen").classList.toggle("unavailable",n),this.toggleAttribute("af",t?.state==="triggered");let o=this.$(".chip"),r=e.icon||a.icoon;o.dataset.icon!==r&&(o.dataset.icon=r,o.innerHTML=x(r,"shield")),o.style.setProperty("--tone",a.tone),this.text(".nm",S(this.hass,e.entity,e.name)),this.text(".st",a.tekst),s.setAttribute("aria-label",`${this.$(".nm").textContent}, ${a.tekst}`);for(let l of this.$$(".stand"))l.setAttribute("aria-pressed",String(l.dataset.stand===t?.state))}getCardSize(){return 2}getGridOptions(){let e=F(100);return{columns:12,rows:e,min_columns:4,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-alarm-panel-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("alarm_control_panel."));return n?{entity:n}:{}}};_(mt,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

    .top { display: flex; align-items: center; gap: 11px; min-height: 40px; cursor: pointer; }
    .chip { width: 40px; height: 40px; }
    .chip .icon { width: 20px; height: 20px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .nm {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .st { font-size: 11.5px; line-height: 1.25; color: var(--tone); font-weight: 600; }

    /* Afgegaan alarm: de chip pulseert. Stil bij prefers-reduced-motion; de
       kleur en het woord ALARM blijven staan. */
    :host([af]) .chip { animation: pols 1.2s ease-in-out infinite; }
    @keyframes pols {
      0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--tone) 60%, transparent); }
      50% { box-shadow: 0 0 0 8px color-mix(in srgb, var(--tone) 0%, transparent); }
    }

    /* ---- de drie knoppen ---- */
    .standen { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .stand {
      display: flex; align-items: center; justify-content: center; gap: 7px;
      min-height: 38px; padding: 0 8px; cursor: pointer; font: inherit; font-size: 12.5px;
      border-radius: var(--dac-radius-sm);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      color: var(--dac-ink-2);
      transition: background 200ms ease, color 200ms ease, border-color 200ms ease;
    }
    .stand:hover { background: var(--dac-surface-hi); color: var(--dac-ink); }
    .stand:active { transform: scale(.985); }
    .stand .icon { width: 16px; height: 16px; flex: 0 0 auto; }
    .stand[aria-pressed="true"] {
      color: var(--tone); font-weight: 600;
      background: color-mix(in srgb, var(--tone) 16%, transparent);
      border-color: color-mix(in srgb, var(--tone) 40%, transparent);
    }
    /* Onder de 300px passen drie woorden niet meer naast elkaar; dan blijven de
       iconen staan en verdwijnt de tekst van de niet-actieve knoppen niet --
       hij wordt kleiner. Verdwijnen zou raden worden. */
    @container (max-width: 300px) {
      .stand { flex-direction: column; gap: 2px; font-size: 10.5px; padding: 4px; }
    }

    .top.unavailable, .standen.unavailable { opacity: .42; }
    .standen.unavailable { pointer-events: none; }
  `);var un=class extends z{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"shield"}]}schema(){return[{name:"entity",selector:g.entity("alarm_control_panel")},{name:"name",selector:g.text()}]}label(e){return{entity:"Alarmpaneel",name:"Naam (overschrijft die van het paneel)"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Drie knoppen: Uitgeschakeld, Afwezig en Thuis. Vraagt je paneel een pincode, dan werkt deze kaart niet \u2014 hij stuurt geen code mee."}};C("domotiapp-alarm-panel-card-editor",un);A("domotiapp-alarm-panel-card",mt,{name:"DomotiApp Alarmpaneel",description:"Uitgeschakeld, Afwezig en Thuis \u2014 drie knoppen, meer niet."});var _s=["zo","ma","di","wo","do","vr","za"],$i=5,Ei=8,gt=class extends E{validate(e){if(!e.entity)return{...e,[O]:"Kies een weerentiteit."};let t=Math.min(Math.max(1,Number(e.days)||$i),Ei);return{show_current:!0,forecast_type:"daily",...e,days:t}}watched(){return[this.config.entity]}template(){this.config.bare&&this.setAttribute("bare","");let e=this.config;return`
      <div class="card surface">
        <div class="nu" role="button" tabindex="0" ${e.show_current===!1?"hidden":""}>
          <span class="chip" style="--tone:${k.accent}"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="graden tnum"></span>
        </div>
        <div class="rij" style="--n:${e.days}"></div>
      </div>`}wire(){this.teardown_.push(j(this.$(".nu"),{onTap:()=>R(this,this.config.entity),onHold:()=>R(this,this.config.entity)})),this.abonneer_()}async abonneer_(){let e=this.config;this.opzeggen_?.(),this.opzeggen_=null;let t=this.hass?.connection;if(!t?.subscribeMessage){this.forecastFout_="Geen verbinding voor de voorspelling.",this.paintRij_();return}try{let n=await t.subscribeMessage(a=>{this.forecast_=a?.forecast??[],this.forecastFout_=null,this.paintRij_()},{type:"weather/subscribe_forecast",forecast_type:e.forecast_type==="hourly"?"hourly":"daily",entity_id:e.entity});if(!this.isConnected){n();return}this.opzeggen_=n,this.teardown_.push(()=>{try{n()}catch{}this.opzeggen_=null})}catch{this.forecastFout_=e.forecast_type==="hourly"?"Deze weerbron geeft geen uurvoorspelling.":"Deze weerbron geeft geen dagvoorspelling.",this.paintRij_()}}paint(){let e=this.config,t=b(this.hass,e.entity),n=P(t);this.$(".nu").classList.toggle("unavailable",n);let s=this.$(".chip"),o=e.icon||je(t?.state);s.dataset.icon!==o&&(s.dataset.icon=o,s.innerHTML=x(o,"cloud")),this.text(".nm",S(this.hass,e.entity,e.name)),this.text(".st",n?"Niet bereikbaar":I(this.hass,t));let r=this.$(".graden"),l=t?.attributes?.temperature,c=t?.attributes?.temperature_unit??"\xB0C";r.innerHTML=l==null?"":`${K(this.hass,l,Number.isInteger(l)?0:1)}<small>${c}</small>`,this.paintRij_()}paintRij_(){let e=this.$(".rij");if(!e)return;let t=this.config;if(this.forecastFout_&&!this.forecast_?.length){e.style.setProperty("--n",1),e.innerHTML=`<div class="leeg">${this.forecastFout_}</div>`;return}let n=(this.forecast_??[]).slice(0,t.days);if(!n.length){e.style.setProperty("--n",1),e.innerHTML='<div class="leeg">Nog geen voorspelling ontvangen\u2026</div>';return}e.style.setProperty("--n",n.length);let a=b(this.hass,t.entity)?.attributes?.temperature_unit??"";e.innerHTML=n.map((s,o)=>{let r=this.wanneer_(s.datetime,o),l=x(je(s.condition),"cloud"),c=s.temperature==null?"":`${K(this.hass,s.temperature,0)}\xB0`,d=s.templow==null?"":`${K(this.hass,s.templow,0)}\xB0`,u=s.precipitation_probability==null?"":`<span class="nat">${x("drop")}${Math.round(s.precipitation_probability)}%</span>`;return`
          <div class="dag" style="--tone:${k.accent}">
            <span class="wanneer">${r}</span>
            ${l}
            <span class="max tnum">${c}</span>
            ${d?`<span class="min tnum">${d}</span>`:""}
            ${u}
          </div>`}).join("")}wanneer_(e,t){let n=new Date(e);if(Number.isNaN(+n))return"";if(this.config.forecast_type==="hourly")return`${String(n.getHours()).padStart(2,"0")}:00`;let a=new Date,s=n.getDate()===a.getDate()&&n.getMonth()===a.getMonth()&&n.getFullYear()===a.getFullYear();return t===0&&s?"vandaag":_s[n.getDay()]}regels_(){return this.config?.show_current===!1?1:2}getCardSize(){return this.regels_()+1}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}static getConfigElement(){return document.createElement("domotiapp-forecast-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("weather."));return n?{entity:n}:{}}};_(gt,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; border: 0; box-shadow: none; padding: 0; border-radius: 0; }

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
  `);var mn=class extends z{defaults(){return{show_current:!0,forecast_type:"daily",days:$i}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"cloudSun"}]}schema(){return[{name:"entity",selector:g.entity("weather")},{name:"name",selector:g.text()},{name:"forecast_type",selector:g.select([{value:"daily",label:"Per dag"},{value:"hourly",label:"Per uur"}])},{name:"days",selector:g.number(1,Ei)},{name:"show_current",selector:g.bool()}]}label(e){return{entity:"Weerentiteit",name:"Naam (overschrijft die van de weerbron)",forecast_type:"Voorspelling",days:"Hoeveel punten",show_current:"Nu-regel tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Meer hoeft er niet ingevuld te worden: de kaart leest zelf uit wat je weerbron levert.";if(e.name==="forecast_type")return"Niet elke weerbron kan allebei. Kan hij het niet, dan zegt de kaart dat in plaats van leeg te blijven."}};C("domotiapp-forecast-card-editor",mn);A("domotiapp-forecast-card",gt,{name:"DomotiApp Weersvoorspelling",description:"Vandaag groot, de dagen erna op een rij. E\xE9n entiteit invullen."});var Ce={OPEN:1,CLOSE:2,SET_POSITION:4,STOP:8},Oe=(i,e)=>!!((i?.attributes?.supported_features??0)&e),xs=(i={})=>{switch(i.device_class){case"garage":return{open:"garageOpen",closed:"garageClosed"};case"awning":case"blind":return{open:"awning",closed:"awning"};default:return{open:"shutterOpen",closed:"shutter"}}},ft=class extends E{validate(e){let t=e.covers??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,covers:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[O]:"Kies minstens \xE9\xE9n rolluik of zonnescherm."}}watched(){return this.config.covers.map(e=>e.entity)}keysHtml(e){return`
      <div class="keys">
        <button type="button" data-act="open" aria-label="Open">${T.arrowUp}</button>
        ${e?`<button type="button" data-act="stop" aria-label="Stop">${T.stop}</button>`:""}
        <button type="button" data-act="close" aria-label="Dicht">${T.arrowDown}</button>
      </div>`}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`<div class="card surface">${e.covers.map((n,a)=>`
      <div class="cv" data-i="${a}" data-shown="closed" style="--tone:${V(n.tone??e.tone,"solar")}">
        <button class="chip" type="button" aria-label="Meer info"></button>
        <div class="txt"><div class="nm"></div><div class="st"></div></div>
        ${this.keysHtml(e.show_stop!==!1)}
        <div class="pos" hidden></div>
      </div>`).join("")}</div>`}wire(){this.dragging_=new Set,this.bound_=new Set,this.assumed_=new Map,this.$$(".cv").forEach(e=>{let t=e.dataset.i;e.querySelectorAll(".keys button").forEach(a=>{this.on(a,"click",()=>{let s=a.dataset.act,o={open:"open_cover",stop:"stop_cover",close:"close_cover"};this.hass.callService("cover",o[s],{entity_id:this.config.covers[+t].entity}),s!=="stop"&&(this.assumed_.set(t,s==="open"?"open":"closed"),this.paint())})});let n=this.config.covers[+t].entity;this.teardown_.push(j(e.querySelector(".chip"),{onTap:()=>R(this,n)}))})}paint(){this.$$(".cv").forEach(e=>{let t=e.dataset.i,n=this.config.covers[+t],a=b(this.hass,n.entity),s=D(this.hass,n.entity),o=!a||a.state==="unavailable",r=a?.state??"unknown";e.classList.toggle("unavailable",o),e.querySelector(".nm").textContent=S(this.hass,n.entity,n.name);let l=Oe(a,Ce.SET_POSITION)&&s.current_position!=null,c=l?s.current_position>0?"open":"closed":r==="open"||r==="closed"?r:this.assumed_.get(t)??"closed";e.dataset.shown=c;let d=xs(s),u=(c==="open"?n.icon_open:n.icon_closed)??(c==="open"?this.config.icon_open:this.config.icon_closed)??n.icon??d[c],m=e.querySelector(".chip");m.dataset.icon!==u&&(m.dataset.icon=u,m.innerHTML=x(u,d[c]));let y=e.querySelector(".st");this.dragging_.has(t)||(y.textContent=o?"Niet bereikbaar":r==="opening"?"Gaat open":r==="closing"?"Gaat dicht":l?`${s.current_position}% open`:r==="open"?"Open":r==="closed"?"Dicht":""),e.querySelectorAll(".keys button").forEach($=>{if($.dataset.act==="stop"){$.disabled=o||!Oe(a,Ce.STOP);return}let N=$.dataset.act==="open";$.disabled=o||(N?!Oe(a,Ce.OPEN):!Oe(a,Ce.CLOSE))});let h=e.querySelector(".pos"),w=l&&this.config.show_position!==!1;if(h.hidden=!w,w){if(h.dataset.built||(h.dataset.built="1",h.innerHTML=se("position"),h.querySelector(".slider").setAttribute("aria-label","Positie")),!this.bound_.has(t)){this.bound_.add(t);let N=h.querySelector(".slider"),re=M=>{N.style.setProperty("--v",`${M}%`),N.setAttribute("aria-valuenow",String(M)),e.querySelector(".st").textContent=`${M}% open`};this.teardown_.push(_e(N,{value:()=>D(this.hass,n.entity).current_position??0,onInput:re,onCommit:M=>this.hass.callService("cover","set_cover_position",{entity_id:n.entity,position:M})}))}let $=h.querySelector(".slider");if(!$.classList.contains("dragging")){let N=s.current_position??0;$.style.setProperty("--v",`${N}%`),$.setAttribute("aria-valuenow",String(N))}}})}rows_(){let e=this.config?.covers??[],t=e.some(n=>Oe(b(this.hass,n.entity),Ce.SET_POSITION));return F(12+Math.max(1,e.length)*42+(t?30:0))}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-cover-card-editor")}static getStubConfig(e,t){let n=t?.find(a=>a.startsWith("cover."));return{covers:n?[n]:[]}}};_(ft,"css",`
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
    ${xe}

    .cv.unavailable { opacity: .42; pointer-events: none; }

    @media (max-width: 380px) { .keys button { width: 34px; } }
  `);var gn=class extends z{defaults(){return{show_stop:!0,show_position:!0}}pickers(){return[{key:"icon_open",kind:"icon",label:"Icoon als het open staat",fallback:"shutterOpen"},{key:"icon_closed",kind:"icon",label:"Icoon als het dicht is",fallback:"shutter"},{key:"tone",kind:"tone",label:"Kleur"}]}schema(){return[{name:"covers",selector:{entity:{domain:"cover",multiple:!0}}},{name:"show_stop",selector:g.bool()}]}label(e){return{covers:"Rolluiken",show_stop:"Stopknop tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="covers")return"Melden ze hun stand terug, dan komt er vanzelf een schuif bij. Zo niet, dan blijven het open, stop en dicht, en volgt het icoon de knop die je indrukt."}};C("domotiapp-cover-card-editor",gn);A("domotiapp-cover-card",ft,{name:"DomotiApp Rolluiken",description:"Open, stop en dicht, met een eigen icoon voor open en dicht."});function ks(i){if(!i)return{label:"Onbekend",home:null};switch(i.state){case"home":return{label:"Thuis",home:!0};case"not_home":return{label:"Afwezig",home:!1};case"unknown":case"unavailable":return{label:"Onbekend",home:null};default:return{label:i.state,home:!1}}}var bt=class extends E{validate(e){let t=e.persons??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,persons:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[O]:"Kies minstens \xE9\xE9n persoon."}}watched(){return this.config.persons.map(e=>e.entity)}template(){let e=this.config;e.bare&&this.setAttribute("bare","");let t=e.columns??Math.min(e.persons.length,6),n=e.persons.map((a,s)=>`
      <button class="p" type="button" data-i="${s}" style="--tone:var(--dac-ink-3)">
        <span class="av"><span class="ph"></span></span>
        <span class="nm"></span>
        <span class="st"></span>
      </button>`).join("");return`<div class="card surface"><div class="chips" style="--cols:${t}">${n}</div></div>`}wire(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i];this.teardown_.push(j(e,{onTap:()=>R(this,t.entity)}))})}paint(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i],n=b(this.hass,t.entity),a=ks(n);e.style.setProperty("--tone",a.home===!0?"var(--dac-good)":a.home===!1?"var(--dac-bad)":"var(--dac-warn)");let s=S(this.hass,t.entity,t.name);this.text(e.querySelector(".nm"),s),this.text(e.querySelector(".st"),a.label);let o=e.querySelector(".ph"),r=n?.attributes?.entity_picture,l=r?`img:${r}`:s?`ini:${s[0]}`:"icon";o.dataset.kind!==l&&(o.dataset.kind=l,o.innerHTML=r?`<img src="${r}" alt="" loading="lazy" />`:s?s[0].toUpperCase():T.person),e.setAttribute("aria-label",`${s}, ${a.label}`)})}rows_(){let e=this.config?.columns??Math.min(this.config?.persons?.length??1,6),t=Math.ceil((this.config?.persons?.length??1)/e);return F(20+t*74+(t-1)*6)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:"full",rows:e,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-person-card-editor")}static getStubConfig(e){return{persons:Object.keys(e?.states??{}).filter(n=>n.startsWith("person.")).slice(0,6)}}};_(bt,"css",`
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
  `);var fn=class extends z{setConfig(e){let t={...e},n=(e.persons??[]).map(a=>typeof a=="string"?{entity:a}:a);t.persons=n.map(a=>a.entity);for(let a of n)a.name&&(t[`naam:${a.entity}`]=a.name);super.setConfig(t)}serialize(e){let t={...e},n=t.persons??[];t.persons=n.map(a=>{let s=t[`naam:${a}`];return s?{entity:a,name:s}:a});for(let a of Object.keys(t))a.startsWith("naam:")&&delete t[a];return t}schema(){let e=(this.config_?.persons??[]).filter(t=>typeof t=="string");return[{name:"persons",selector:{entity:{domain:["person","device_tracker"],multiple:!0}}},...e.map(t=>({name:`naam:${t}`,selector:g.text()}))]}label(e){if(e.name==="persons")return"Personen";if(e.name.startsWith("naam:")){let t=e.name.slice(5);return`Naam voor ${this.hass?.states?.[t]?.attributes?.friendly_name??t}`}return super.label(e)}helper(e){if(e.name==="persons")return"Thuis is groen, weg is rood, geen melding is oranje. Per persoon kun je hieronder een eigen naam zetten."}};C("domotiapp-person-card-editor",fn);A("domotiapp-person-card",bt,{name:"DomotiApp Personen",description:"Wie er thuis is, compact. Het hele huishouden in \xE9\xE9n kaart."});var ys=[[/gft|groente|tuin|organi/i,"teal","binWheeled"],[/pmd|plastic|verpakking/i,"solar","binWheeled"],[/papier|karton/i,"water","binWheeled"],[/rest|grijs/i,"neutral","binWheeled"],[/textiel|kleding/i,"pink","bin"],[/glas/i,"magenta","bin"],[/kerstboom|snoei|takken/i,"teal","bin"]];function ws(i){for(let[e,t,n]of ys)if(e.test(i))return{tone:t,icon:n};return{tone:"accent",icon:"bin"}}var Si=i=>String(i??"").replace(/^(afvalbeheer|afvalwijzer|mijnafvalwijzer)\s*/i,"").replace(/\s*(mijnafvalwijzer)\s*/i," ").trim(),vt=class extends E{validate(e){let t=e.sensors??e.entities??(e.entity?[e.entity]:[]);return t.length?{show_hero:!0,show_list:!0,...e,sensors:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[O]:"Kies minstens \xE9\xE9n afvalsensor waarvan de status een datum is."}}watched(){return this.config.sensors.map(e=>e.entity)}read_(){let e=new Date;return this.config.sensors.map(t=>{let n=b(this.hass,t.entity);if(!n)return null;let a=ze(n.state)??ze(n.attributes.date)??ze(n.attributes.next_date);if(!a)return null;let s=t.label??Si(S(this.hass,t.entity,t.name)),o=ws(t.label??t.entity+s),r=this.config.tones?.[t.entity];return{label:s,date:a,days:Ot(e,a),tone:V(r??t.tone??o.tone),icon:t.icon??o.icon}}).filter(t=>t&&t.days>=0).sort((t,n)=>t.date-n.date)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`
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
      </div>`}paint(){let e=this.read_(),t=this.$(".hero"),n=this.$(".list"),a=this.$(".empty");if(a.hidden=e.length>0,t&&(t.hidden=e.length===0,e.length)){let s=e[0];t.style.setProperty("--tone",s.tone),this.setAttribute("urgency",s.days===0?"today":s.days===1?"tomorrow":"later");let o=t.querySelector(".bin");o.dataset.icon!==s.icon&&(o.dataset.icon=s.icon,o.innerHTML=x(s.icon,"bin")),this.text(t.querySelector(".eyebrow"),Lt(s.date)),this.text(t.querySelector(".big"),s.label),this.text(t.querySelector(".n"),s.days===0?"nu":String(s.days)),this.text(t.querySelector(".u"),s.days===0?"aan de weg":s.days===1?"dag":"dagen")}if(n){let s=this.config.show_hero===!1?e:e.slice(1),o=s.map(r=>`${r.label}${+r.date}`).join("|");if(n.dataset.sig===o)return;n.dataset.sig=o,n.innerHTML=s.map(r=>{let l=Lt(r.date),c=r.days<=6?`<small>${ti(r.date)}</small>`:"";return`
        <div class="r" style="--tone:${r.tone}">
          <i></i><span>${r.label}</span>
          <span class="d">${l}${c}</span>
        </div>`}).join("")}}rows_(){let e=this.config?.sensors?.length??1;return this.config?.show_list===!1?1:this.config?.show_hero===!1?Math.max(1,F(20+e*33)):Math.max(2,e)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-waste-card-editor")}static getStubConfig(e){return{sensors:Object.keys(e?.states??{}).filter(n=>/afval|waste|trash|garbage|ophaal/i.test(n)&&n.startsWith("sensor.")).filter(n=>ze(e.states[n]?.state)).slice(0,6),title:"Afvalkalender"}}};_(vt,"css",`
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
  `);var bn=class extends z{defaults(){return{show_hero:!0,show_list:!0}}setConfig(e){let t={...e};for(let[n,a]of Object.entries(e.tones??{}))t[`kleur:${n}`]=a;delete t.tones,super.setConfig(t)}serialize(e){let t={...e},n={};for(let a of Object.keys(t))a.startsWith("kleur:")&&(t[a]&&(n[a.slice(6)]=t[a]),delete t[a]);return Object.keys(n).length?t.tones=n:delete t.tones,t}ids_(){return(this.config_?.sensors??[]).map(e=>typeof e=="string"?e:e.entity).filter(Boolean)}pickers(){return this.ids_().map(e=>({key:`kleur:${e}`,kind:"tone",label:`Kleur voor ${Si(this.hass?.states?.[e]?.attributes?.friendly_name??e)||e}`,compact:!0,after:!0}))}schema(){return[{name:"sensors",selector:{entity:{domain:"sensor",multiple:!0}}}]}label(e){return{sensors:"Afvalsensoren",show_hero:"Eerstvolgende uitlichten",show_list:"Overige data tonen",bare:"Zonder kaartrand"}[e.name]??super.label(e)}helper(e){if(e.name==="sensors")return"Sensoren waarvan de status een datum is, bijvoorbeeld 18-08-2026. De kaart sorteert zelf; laat een kleur leeg om de bakkleur op de naam te laten kiezen."}};C("domotiapp-waste-card-editor",bn);A("domotiapp-waste-card",vt,{name:"DomotiApp Afvalkalender",description:"Eerstvolgende ophaling als hero, de rest eronder. Kleur per fractie."});var _t=globalThis,xt=_t.ShadowRoot&&(_t.ShadyCSS===void 0||_t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,vn=Symbol(),Ai=new WeakMap,Le=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==vn)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(xt&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=Ai.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&Ai.set(t,e))}return e}toString(){return this.cssText}},te=i=>new Le(typeof i=="string"?i:i+"",void 0,vn),G=(i,...e)=>{let t=i.length===1?i[0]:e.reduce((n,a,s)=>n+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+i[s+1],i[0]);return new Le(t,i,vn)},zi=(i,e)=>{if(xt)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let n=document.createElement("style"),a=_t.litNonce;a!==void 0&&n.setAttribute("nonce",a),n.textContent=t.cssText,i.appendChild(n)}},_n=xt?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(let n of e.cssRules)t+=n.cssText;return te(t)})(i):i;var{is:$s,defineProperty:Es,getOwnPropertyDescriptor:Ss,getOwnPropertyNames:As,getOwnPropertySymbols:zs,getPrototypeOf:Ms}=Object,kt=globalThis,Mi=kt.trustedTypes,js=Mi?Mi.emptyScript:"",Ts=kt.reactiveElementPolyfillSupport,De=(i,e)=>i,xn={toAttribute(i,e){switch(e){case Boolean:i=i?js:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},Ti=(i,e)=>!$s(i,e),ji={attribute:!0,type:String,converter:xn,reflect:!1,useDefault:!1,hasChanged:Ti};Symbol.metadata??=Symbol("metadata"),kt.litPropertyMetadata??=new WeakMap;var ne=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=ji){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),a=this.getPropertyDescriptor(e,n,t);a!==void 0&&Es(this.prototype,e,a)}}static getPropertyDescriptor(e,t,n){let{get:a,set:s}=Ss(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:a,set(o){let r=a?.call(this);s?.call(this,o),this.requestUpdate(e,r,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??ji}static _$Ei(){if(this.hasOwnProperty(De("elementProperties")))return;let e=Ms(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(De("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(De("properties"))){let t=this.properties,n=[...As(t),...zs(t)];for(let a of n)this.createProperty(a,t[a])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[n,a]of t)this.elementProperties.set(n,a)}this._$Eh=new Map;for(let[t,n]of this.elementProperties){let a=this._$Eu(t,n);a!==void 0&&this._$Eh.set(a,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let a of n)t.unshift(_n(a))}else e!==void 0&&t.push(_n(e));return t}static _$Eu(e,t){let n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return zi(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),a=this.constructor._$Eu(e,n);if(a!==void 0&&n.reflect===!0){let s=(n.converter?.toAttribute!==void 0?n.converter:xn).toAttribute(t,n.type);this._$Em=e,s==null?this.removeAttribute(a):this.setAttribute(a,s),this._$Em=null}}_$AK(e,t){let n=this.constructor,a=n._$Eh.get(e);if(a!==void 0&&this._$Em!==a){let s=n.getPropertyOptions(a),o=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:xn;this._$Em=a;let r=o.fromAttribute(t,s.type);this[a]=r??this._$Ej?.get(a)??r,this._$Em=null}}requestUpdate(e,t,n,a=!1,s){if(e!==void 0){let o=this.constructor;if(a===!1&&(s=this[e]),n??=o.getPropertyOptions(e),!((n.hasChanged??Ti)(s,t)||n.useDefault&&n.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:a,wrapped:s},o){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),s!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),a===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[a,s]of this._$Ep)this[a]=s;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[a,s]of n){let{wrapped:o}=s,r=this[a];o!==!0||this._$AL.has(a)||r===void 0||this.C(a,void 0,s,r)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};ne.elementStyles=[],ne.shadowRootOptions={mode:"open"},ne[De("elementProperties")]=new Map,ne[De("finalized")]=new Map,Ts?.({ReactiveElement:ne}),(kt.reactiveElementVersions??=[]).push("2.1.2");var An=globalThis,Ni=i=>i,yt=An.trustedTypes,Ci=yt?yt.createPolicy("lit-html",{createHTML:i=>i}):void 0,Ri="$lit$",oe=`lit$${Math.random().toFixed(9).slice(2)}$`,Ii="?"+oe,Ns=`<${Ii}>`,de=document,He=()=>de.createComment(""),Re=i=>i===null||typeof i!="object"&&typeof i!="function",zn=Array.isArray,Cs=i=>zn(i)||typeof i?.[Symbol.iterator]=="function",kn=`[ 	
\f\r]`,Pe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Oi=/-->/g,Li=/>/g,le=RegExp(`>|${kn}(?:([^\\s"'>=/]+)(${kn}*=${kn}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Di=/'/g,Pi=/"/g,Vi=/^(?:script|style|textarea|title)$/i,Mn=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),f=Mn(1),Hl=Mn(2),Rl=Mn(3),pe=Symbol.for("lit-noChange"),v=Symbol.for("lit-nothing"),Hi=new WeakMap,ce=de.createTreeWalker(de,129);function Ki(i,e){if(!zn(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ci!==void 0?Ci.createHTML(e):e}var Os=(i,e)=>{let t=i.length-1,n=[],a,s=e===2?"<svg>":e===3?"<math>":"",o=Pe;for(let r=0;r<t;r++){let l=i[r],c,d,u=-1,m=0;for(;m<l.length&&(o.lastIndex=m,d=o.exec(l),d!==null);)m=o.lastIndex,o===Pe?d[1]==="!--"?o=Oi:d[1]!==void 0?o=Li:d[2]!==void 0?(Vi.test(d[2])&&(a=RegExp("</"+d[2],"g")),o=le):d[3]!==void 0&&(o=le):o===le?d[0]===">"?(o=a??Pe,u=-1):d[1]===void 0?u=-2:(u=o.lastIndex-d[2].length,c=d[1],o=d[3]===void 0?le:d[3]==='"'?Pi:Di):o===Pi||o===Di?o=le:o===Oi||o===Li?o=Pe:(o=le,a=void 0);let y=o===le&&i[r+1].startsWith("/>")?" ":"";s+=o===Pe?l+Ns:u>=0?(n.push(c),l.slice(0,u)+Ri+l.slice(u)+oe+y):l+oe+(u===-2?r:y)}return[Ki(i,s+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},Ie=class i{constructor({strings:e,_$litType$:t},n){let a;this.parts=[];let s=0,o=0,r=e.length-1,l=this.parts,[c,d]=Os(e,t);if(this.el=i.createElement(c,n),ce.currentNode=this.el.content,t===2||t===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(a=ce.nextNode())!==null&&l.length<r;){if(a.nodeType===1){if(a.hasAttributes())for(let u of a.getAttributeNames())if(u.endsWith(Ri)){let m=d[o++],y=a.getAttribute(u).split(oe),h=/([.?@])?(.*)/.exec(m);l.push({type:1,index:s,name:h[2],strings:y,ctor:h[1]==="."?wn:h[1]==="?"?$n:h[1]==="@"?En:ye}),a.removeAttribute(u)}else u.startsWith(oe)&&(l.push({type:6,index:s}),a.removeAttribute(u));if(Vi.test(a.tagName)){let u=a.textContent.split(oe),m=u.length-1;if(m>0){a.textContent=yt?yt.emptyScript:"";for(let y=0;y<m;y++)a.append(u[y],He()),ce.nextNode(),l.push({type:2,index:++s});a.append(u[m],He())}}}else if(a.nodeType===8)if(a.data===Ii)l.push({type:2,index:s});else{let u=-1;for(;(u=a.data.indexOf(oe,u+1))!==-1;)l.push({type:7,index:s}),u+=oe.length-1}s++}}static createElement(e,t){let n=de.createElement("template");return n.innerHTML=e,n}};function ke(i,e,t=i,n){if(e===pe)return e;let a=n!==void 0?t._$Co?.[n]:t._$Cl,s=Re(e)?void 0:e._$litDirective$;return a?.constructor!==s&&(a?._$AO?.(!1),s===void 0?a=void 0:(a=new s(i),a._$AT(i,t,n)),n!==void 0?(t._$Co??=[])[n]=a:t._$Cl=a),a!==void 0&&(e=ke(i,a._$AS(i,e.values),a,n)),e}var yn=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,a=(e?.creationScope??de).importNode(t,!0);ce.currentNode=a;let s=ce.nextNode(),o=0,r=0,l=n[0];for(;l!==void 0;){if(o===l.index){let c;l.type===2?c=new Ve(s,s.nextSibling,this,e):l.type===1?c=new l.ctor(s,l.name,l.strings,this,e):l.type===6&&(c=new Sn(s,this,e)),this._$AV.push(c),l=n[++r]}o!==l?.index&&(s=ce.nextNode(),o++)}return ce.currentNode=de,a}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}},Ve=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,a){this.type=2,this._$AH=v,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ke(this,e,t),Re(e)?e===v||e==null||e===""?(this._$AH!==v&&this._$AR(),this._$AH=v):e!==this._$AH&&e!==pe&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Cs(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==v&&Re(this._$AH)?this._$AA.nextSibling.data=e:this.T(de.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,a=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=Ie.createElement(Ki(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===a)this._$AH.p(t);else{let s=new yn(a,this),o=s.u(this.options);s.p(t),this.T(o),this._$AH=s}}_$AC(e){let t=Hi.get(e.strings);return t===void 0&&Hi.set(e.strings,t=new Ie(e)),t}k(e){zn(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,n,a=0;for(let s of e)a===t.length?t.push(n=new i(this.O(He()),this.O(He()),this,this.options)):n=t[a],n._$AI(s),a++;a<t.length&&(this._$AR(n&&n._$AB.nextSibling,a),t.length=a)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let n=Ni(e).nextSibling;Ni(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},ye=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,a,s){this.type=1,this._$AH=v,this._$AN=void 0,this.element=e,this.name=t,this._$AM=a,this.options=s,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=v}_$AI(e,t=this,n,a){let s=this.strings,o=!1;if(s===void 0)e=ke(this,e,t,0),o=!Re(e)||e!==this._$AH&&e!==pe,o&&(this._$AH=e);else{let r=e,l,c;for(e=s[0],l=0;l<s.length-1;l++)c=ke(this,r[n+l],t,l),c===pe&&(c=this._$AH[l]),o||=!Re(c)||c!==this._$AH[l],c===v?e=v:e!==v&&(e+=(c??"")+s[l+1]),this._$AH[l]=c}o&&!a&&this.j(e)}j(e){e===v?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},wn=class extends ye{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===v?void 0:e}},$n=class extends ye{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==v)}},En=class extends ye{constructor(e,t,n,a,s){super(e,t,n,a,s),this.type=5}_$AI(e,t=this){if((e=ke(this,e,t,0)??v)===pe)return;let n=this._$AH,a=e===v&&n!==v||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,s=e!==v&&(n===v||a);a&&this.element.removeEventListener(this.name,this,n),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Sn=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){ke(this,e)}};var Ls=An.litHtmlPolyfillSupport;Ls?.(Ie,Ve),(An.litHtmlVersions??=[]).push("3.3.3");var Ui=(i,e,t)=>{let n=t?.renderBefore??e,a=n._$litPart$;if(a===void 0){let s=t?.renderBefore??null;n._$litPart$=a=new Ve(e.insertBefore(He(),s),s,void 0,t??{})}return a._$AI(i),a};var jn=globalThis,U=class extends ne{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ui(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return pe}};U._$litElement$=!0,U.finalized=!0,jn.litElementHydrateSupport?.({LitElement:U});var Ds=jn.litElementPolyfillSupport;Ds?.({LitElement:U});(jn.litElementVersions??=[]).push("4.2.2");var X=G`
  :host {
    ${te(Y)}
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  ${te(ge)}
`;var Ps=["unavailable","unknown"],Hs=["color_temp_kelvin","rgb_color","hs_color","xy_color"];function wt({scene:i,memberEntityIds:e,states:t}){let n=[],a=[],s=i?.lights??{},o=Array.isArray(e)?e:[],r=t??{};for(let l of o){let c=s[l];if(!c||typeof c!="object")continue;let d=r[l];if(!d||Ps.includes(d.state)){a.push(l);continue}if(c.state==="off"){n.push({service:"turn_off",data:{entity_id:l,transition:1}});continue}let u={entity_id:l,transition:1};typeof c.brightness=="number"&&(u.brightness=c.brightness);for(let m of Hs)if(c[m]!==void 0){u[m]=c[m];break}n.push({service:"turn_on",data:u})}return{oproepen:n,overgeslagen:a}}async function $t(i,e){let t=await Promise.allSettled(e.map(a=>i(a.service,a.data))),n=[];return t.forEach((a,s)=>{a.status==="rejected"&&n.push({entityId:e[s].data.entity_id,fout:a.reason})}),n}var Nn=["hs","rgb","rgbw","rgbww","xy"],Cn="color_temp",Rs="onoff";var he="kleur";var Is=["unavailable","unknown"],Bi=["color_temp_kelvin","rgb_color","hs_color","xy_color"],Vs=[0,100];function J(i){if(!i)return{bekend:!1,beschikbaar:!1,helderheid:!1,kleurtemp:!1,kleur:!1,minKelvin:2e3,maxKelvin:6535,kelvinUitDefaults:!1};let e=i.attributes??{},t=Array.isArray(e.supported_color_modes)?e.supported_color_modes:null,n=t!==null&&t.length===1&&t[0]===Rs,a=t!==null&&t.includes(Cn),s=t!==null&&t.some(c=>Nn.includes(c)),o=e.min_color_temp_kelvin,r=e.max_color_temp_kelvin,l=typeof o=="number"&&typeof r=="number"&&o<r;return{bekend:!0,beschikbaar:!Is.includes(i.state),helderheid:!n,kleurtemp:a,kleur:s,minKelvin:l?Math.round(o):2e3,maxKelvin:l?Math.round(r):6535,kelvinUitDefaults:a&&!l}}function Ks(){return{state:"off"}}function Gi(i,e){let t=e??J(i);return t.bekend&&t.beschikbaar&&i.state==="on"?{state:"on",...Fs(i,t)}:t.helderheid?{state:"on",brightness:255}:{state:"on"}}function qi(i,e,t,n){return e?i&&i.state==="on"?{...i}:Gi(t,n):{state:"off"}}function Fi(i,e,t,n){let a=n??J(t),s=Rn(i,t,a);return a.helderheid&&(s.brightness=L(e,1,255)),s}function On(i,e,t,n){let a=n??J(t),s=Rn(i,t,a);return aa(s),s.color_temp_kelvin=L(e,a.minKelvin,a.maxKelvin),s}function Ln(i,e,t,n){let a=n??J(t),s=Rn(i,t,a);return aa(s),s.hs_color=[L(e?.[0],0,360),L(e?.[1],0,100)],s}function Et(i,e,t){return i??Ks()}function Zi(i,e,t){let n=Et(i,e,t);if(typeof n.brightness=="number")return L(n.brightness,1,255);let a=e?.attributes?.brightness;return typeof a=="number"?L(a,1,255):255}function Dn(i,e,t){let n=t??J(e),a=Et(i,e,n);if(typeof a.color_temp_kelvin=="number")return L(a.color_temp_kelvin,n.minKelvin,n.maxKelvin);let s=e?.attributes?.color_temp_kelvin;return typeof s=="number"?L(s,n.minKelvin,n.maxKelvin):Math.round((n.minKelvin+n.maxKelvin)/2)}function St(i,e,t){let n=Et(i,e,t);if(Tn(n.hs_color))return[L(n.hs_color[0],0,360),L(n.hs_color[1],0,100)];let a=e?.attributes?.hs_color;return Tn(a)?[L(a[0],0,360),L(a[1],0,100)]:[...Vs]}function Pn(i){return i!=null&&typeof i=="object"}function Xi(i,e,t){let n=Array.isArray(e)?e:[],a=Array.isArray(i)?i:[],s=Number.isInteger(t)?t:a.length;return n.filter(o=>{for(let r=0;r<s;r+=1)if(!Pn(a[r]?.lights?.[o]))return!0;return!1})}function Yi(i){return!Number.isInteger(i)||i<=0?null:i===1?"1 lamp nog niet ingesteld":`${i} lampen nog niet ingesteld`}function Hn(i,e,t){return Et(i,e,t).state==="on"}function Ji(i,e,t){let n=t??J(e);if(!n.bekend)return{aanuit:!1,helderheid:!1,kleurtemp:!1,kleur:!1,kleurkeuze:!1,stand:null};let a=Hn(i,e,n),s=Qi(n),o=s?Us(i,e,n):null;return{aanuit:!0,helderheid:a&&n.helderheid,kleurtemp:a&&n.kleurtemp&&(!s||o==="wit"),kleur:a&&n.kleur&&(!s||o===he),kleurkeuze:a&&s,stand:a?o:null}}function Qi(i){return!!(i?.kleurtemp&&i?.kleur)}function Us(i,e,t){let n=t??J(e);if(i&&typeof i=="object"){if(typeof i.color_temp_kelvin=="number")return"wit";if(Bi.slice(1).some(s=>i[s]!==void 0))return he}let a=e?.attributes?.color_mode;return a===Cn&&n.kleurtemp?"wit":Nn.includes(a)&&n.kleur?he:"wit"}function ea(i,e,t,n){let a=n??J(t);return Qi(a)?e==="wit"?On(i,Dn(i,t,a),t,a):Ln(i,St(i,t,a),t,a):i}function ta(i){let e=L(i,0,255);return e<=0?0:Math.max(1,Math.round(e/255*100))}function na(i){let e=L(i,1,100);return L(Math.round(e/100*255),1,255)}var Ws=1e3,Bs=4e4,Wi=7;function Gs(i){let e=L(i,Ws,Bs)/100,t=e<=66?255:329.698727446*(e-60)**-.1332047592,n=e<=66?99.4708025861*Math.log(e)-161.1195681661:288.1221695283*(e-60)**-.0755148492,a;return e>=66?a=255:e<=19?a=0:a=138.5177312231*Math.log(e-10)-305.0447927307,[L(t,0,255),L(n,0,255),L(a,0,255)]}function qs(i){let[e,t,n]=Gs(i);return`rgb(${e}, ${t}, ${n})`}function ia(i,e){let t=Math.min(i,e),n=Math.max(i,e);return`linear-gradient(to right, ${Array.from({length:Wi},(s,o)=>{let r=o/(Wi-1),l=t+(n-t)*r;return`${qs(l)} ${Math.round(r*100)}%`}).join(", ")})`}function Fs(i,e){let t=i.attributes??{},n={};e.helderheid&&(n.brightness=typeof t.brightness=="number"?L(t.brightness,1,255):255);let a=t.color_mode;return e.kleurtemp&&a===Cn&&typeof t.color_temp_kelvin=="number"?n.color_temp_kelvin=L(t.color_temp_kelvin,e.minKelvin,e.maxKelvin):e.kleur&&Nn.includes(a)&&Tn(t.hs_color)&&(n.hs_color=[L(t.hs_color[0],0,360),L(t.hs_color[1],0,100)]),n}function Rn(i,e,t){return i&&i.state==="on"?{...i}:Gi(e,t)}function aa(i){for(let e of Bi)delete i[e]}function Tn(i){return Array.isArray(i)&&i.length===2&&typeof i[0]=="number"&&typeof i[1]=="number"}function L(i,e,t){let n=Number(i);return Number.isFinite(n)?Math.min(t,Math.max(e,Math.round(n))):e}var At="domotiapp-scene-card",In="domotiapp-scene-card-editor",sa="domotiapp-scene-editor";var Ke=["een","twee","drie"],oa="pencil",ra=["grid_options","layout_options","view_layout","visibility"];var la="entity_id",we=class extends U{constructor(){super();_(this,"_label",t=>t.name==="entity"?"Lichtgroep":this._friendlyName(t.name));_(this,"_helper",t=>t.name==="entity"?"De lichtgroep waarvan deze kaart de scenes beheert.":t.name);this._getypt={}}setConfig(t){this._config={...t}}_lichtgroepen(){let t=this.hass?.states??{};return Object.keys(t).filter(n=>n.startsWith("light.")&&Array.isArray(t[n].attributes?.[la]))}_leden(){let t=this._config?.entity,n=this.hass?.states?.[t]?.attributes?.[la];return Array.isArray(n)?n.filter(a=>a!==t):[]}_entiteitSchema(){let t=this._lichtgroepen();return[{name:"entity",required:!0,selector:t.length?{entity:{include_entities:t}}:{entity:{domain:"light"}}}]}_namenSchema(t){return t.map(n=>({name:n,selector:{text:{}}}))}_naamData(t){let n=this._config?.name_overrides??{},a={};for(let s of t)s in this._getypt?a[s]=this._getypt[s]:n[s]&&(a[s]=n[s]);return a}_friendlyName(t){return this.hass?.states?.[t]?.attributes?.friendly_name||t}_entiteitGewijzigd(t){t.stopPropagation();let n={...this._config,entity:t.detail.value.entity};n.entity!==this._config?.entity&&(delete n.name_overrides,this._getypt={}),this._stuurDoor(n)}_namenGewijzigd(t){t.stopPropagation(),this._getypt={...this._getypt,...t.detail.value};let n={};for(let[s,o]of Object.entries(this._getypt))typeof o=="string"&&o.trim()&&(n[s]=o.trim());let a={...this._config};Object.keys(n).length?a.name_overrides=n:delete a.name_overrides,this._stuurDoor(a)}_stuurDoor(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return v;let t=this._leden();return f`
      <ha-form
        .hass=${this.hass}
        .data=${{entity:this._config.entity??""}}
        .schema=${this._entiteitSchema()}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._entiteitGewijzigd}
      ></ha-form>

      ${t.length?f`
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
          `:v}
    `}};_(we,"properties",{hass:{attribute:!1},_config:{state:!0},_getypt:{state:!0}}),_(we,"styles",[X,G`
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
    `]);var Zs="domotiapp_lovelace/snapshot/create",Xs="domotiapp_lovelace/snapshot/close",zt=class{constructor({roepCommandoAan:e,entityId:t}){this._roep=e,this._entityId=t,this._aanmaak=null,this._afsluiting=null}get heeftSnapshot(){return this._aanmaak!==null}get isGesloten(){return this._afsluiting!==null}async zorgVoorSnapshot(){return this._aanmaak===null&&(this._aanmaak=this._roep(Zs,{entity_id:this._entityId}).catch(e=>{throw this._aanmaak=null,e})),this._aanmaak}async sluit({opslaan:e=!1}={}){return this.heeftSnapshot?this._afsluiting!==null?this._afsluiting:(this._afsluiting=(async()=>{try{await this._aanmaak}catch{return{gedaan:!1}}return await this._roep(Xs,{entity_id:this._entityId,restore:!e}),{gedaan:!0}})(),this._afsluiting):{gedaan:!1}}};async function ca({beheer:i,oproepen:e,voerUit:t}){return await i.zorgVoorSnapshot(),t(e)}var Kn="laden",Un="klaar",da="fout",Qs=`linear-gradient(to right, ${[0,60,120,180,240,300,360].map(i=>`hsl(${i}, 100%, 50%)`).join(", ")})`,$e=class extends U{constructor(){super(),this._scenes=null,this._leden=[],this._tab=0,this._toestand=Kn,this._melding="",this._bezig=!1,this._kelvinGemeld=new Set,this._snapshot=null}firstUpdated(){this._haalOp()}async _haalOp(){this._toestand=Kn;try{let e=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:this.entityId});return this._neemOver(e),this._toestand=Un,e}catch(e){return this._melding=e?.message??String(e),this._toestand=da,null}}_neemOver(e){this._scenes=Array.from({length:3},(t,n)=>{let a=e.scenes?.[n]??{};return{icon:a.icon||Ke[n],lights:{...a.lights??{}}}}),this._leden=e.member_entity_ids??[],this._melding=""}_stateVan(e){return this.hass?.states?.[e]}_besturingVan(e){let t=J(this._stateVan(e));return t.kelvinUitDefaults&&!this._kelvinGemeld.has(e)&&(this._kelvinGemeld.add(e),console.warn(`domotiapp-scene-editor: ${e} meldt geen Kelvin-grenzen; ${t.minKelvin}\u2013${t.maxKelvin} K aangehouden (SPEC 6.3).`)),t}_waardeVan(e){return this._scenes?.[this._tab]?.lights?.[e]}_zetLamp(e,t){this._scenes=this._scenes.map((n,a)=>{if(a!==this._tab)return n;let s={...n.lights};return t===void 0?delete s[e]:s[e]=t,{...n,lights:s}})}_zetIcoon(e){this._scenes=this._scenes.map((t,n)=>n===this._tab?{...t,icon:e||Ke[n]}:t)}_kiesTab(e){this._tab=e}get _kanOpslaan(){return this._toestand===Un&&!this._bezig&&this._leden.length>0}async _slaOp(){if(!this._kanOpslaan)return;this._bezig=!0,this._melding="";try{await this.hass.callWS({type:"domotiapp_lovelace/scenes/save",entity_id:this.entityId,scenes:this._scenes})}catch(t){this._melding=t?.message??String(t),this._bezig=!1;return}let e=await this._haalOp();this._bezig=!1,e&&this.dispatchEvent(new CustomEvent("scenes-opgeslagen",{detail:e,bubbles:!0,composed:!0})),this._sluit({opslaan:!0})}get _beheer(){return this._snapshot===null&&(this._snapshot=new zt({entityId:this.entityId,roepCommandoAan:(e,t)=>this.hass.callWS({type:e,...t})})),this._snapshot}get _kanVoorbeeld(){return this._toestand===Un&&!this._bezig&&this._leden.length>0}async _voorbeeld(){if(!this._kanVoorbeeld)return;let{oproepen:e}=wt({scene:this._scenes[this._tab],memberEntityIds:this._leden,states:this.hass.states});this._bezig=!0,this._melding="";try{let t=await ca({beheer:this._beheer,oproepen:e,voerUit:n=>$t((a,s)=>this.hass.callService("light",a,s),n)});t.length&&(this._melding=`Deze lampen reageerden niet: ${t.map(n=>this._naam(n.entityId)).join(", ")}.`)}catch(t){this._melding=`Het voorbeeld is niet gestart: ${t?.message??String(t)}`}finally{this._bezig=!1}}_sluit({opslaan:e=!1}={}){this.dispatchEvent(new CustomEvent("editor-gesloten",{bubbles:!0,composed:!0})),this._sluitSnapshot({opslaan:e})}async _sluitSnapshot({opslaan:e}){try{await this._beheer.sluit({opslaan:e})}catch(t){console.warn(`domotiapp-scene-editor: de snapshot kon niet worden ${e?"verwijderd":"hersteld"}: ${t?.message??t}`)}}disconnectedCallback(){super.disconnectedCallback(),this._snapshot&&this._snapshot.heeftSnapshot&&this._sluitSnapshot({opslaan:!1})}_dialoogGesloten(e){e.stopPropagation(),this._sluit()}_naam(e){return this.nameOverrides?.[e]||this._stateVan(e)?.attributes?.friendly_name||e}render(){return f`
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
    `}_renderInhoud(){return this._toestand===Kn?f`<div class="inhoud">Bezig met laden…</div>`:this._toestand===da?f`
        <div class="inhoud">
          <ha-alert alert-type="error">${this._melding}</ha-alert>
        </div>
      `:f`
      <div class="inhoud">
        <ha-tab-group>
          ${this._scenes.map((e,t)=>f`
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

        ${this._melding?f`<ha-alert alert-type="error">${this._melding}</ha-alert>`:v}
        ${this._leden.length===0?f`<ha-alert alert-type="info">
              Deze lichtgroep bevat geen lampen.
            </ha-alert>`:f`<div class="lampen">
              ${this._leden.map(e=>this._renderLamp(e))}
            </div>`}
      </div>
    `}_renderLamp(e){let t=this._stateVan(e),n=this._besturingVan(e),a=this._waardeVan(e),s=Hn(a,t,n),o=Ji(a,t,n);return f`
      <div class="lamp">
        <div class="kop">
          <div class="naam">
            <span class="tekst">
              ${this._naam(e)}
              ${n.bekend?n.beschikbaar?v:f`<span class="hint">niet bereikbaar</span>`:f`<span class="hint">lamp niet gevonden</span>`}
            </span>
            ${Pn(a)?v:f`<span class="nieuw">nieuw</span>`}
          </div>
          ${n.bekend?f`
                <div class="bediening">
                  ${o.kleurkeuze?this._renderKleurkeuze(e,t,n,a,o.stand):v}
                  <ha-switch
                    .checked=${s}
                    @change=${r=>this._zetLamp(e,qi(a,r.target.checked,t,n))}
                  ></ha-switch>
                </div>
              `:v}
        </div>
        ${this._renderBesturing(e,t,n,a,o)}
      </div>
    `}_renderBesturing(e,t,n,a,s){return f`
      ${s.helderheid?this._renderHelderheid(e,t,n,a):v}
      ${s.kleurtemp?this._renderKleurtemp(e,t,n,a):v}
      ${s.kleur?this._renderKleur(e,t,n,a):v}
    `}_renderHelderheid(e,t,n,a){let s=ta(Zi(a,t,n)),o=r=>{r.stopPropagation(),this._zetLamp(e,Fi(this._waardeVan(e),na(r.detail.value),t,n))};return f`
      <div class="besturing">
        <div class="label">
          <span>Helderheid</span><span>${s} %</span>
        </div>
        <ha-control-slider
          touch-action="pan-y"
          unit="%"
          .min=${1}
          .max=${100}
          .step=${1}
          .value=${s}
          @slider-moved=${o}
          @value-changed=${o}
        ></ha-control-slider>
      </div>
    `}_renderKleurkeuze(e,t,n,a,s){let o=r=>l=>{l.stopPropagation(),r!==s&&this._zetLamp(e,ea(this._waardeVan(e),r,t,n))};return f`
      <div class="kleurkeuze">
        <button
          class="keuze ${s===he?"actief":""}"
          aria-pressed=${s===he?"true":"false"}
          @click=${o(he)}
        >
          Kleur
        </button>
        <button
          class="keuze ${s==="wit"?"actief":""}"
          aria-pressed=${s==="wit"?"true":"false"}
          @click=${o("wit")}
        >
          Wit
        </button>
      </div>
    `}_renderKleurtemp(e,t,n,a){let s=Dn(a,t,n),o=r=>{r.stopPropagation(),this._zetLamp(e,On(this._waardeVan(e),r.detail.value,t,n))};return f`
      <div class="besturing">
        <div class="label">
          <span>Kleurtemperatuur</span><span>${s} K</span>
        </div>
        <ha-control-slider
          touch-action="pan-y"
          mode="cursor"
          .min=${n.minKelvin}
          .max=${n.maxKelvin}
          .step=${1}
          .value=${s}
          style=${`--control-slider-background: ${ia(n.minKelvin,n.maxKelvin)}; --control-slider-background-opacity: 1`}
          @slider-moved=${o}
          @value-changed=${o}
        ></ha-control-slider>
      </div>
    `}_renderKleur(e,t,n,a){let[s,o]=St(a,t,n),r=l=>c=>{c.stopPropagation();let d=St(this._waardeVan(e),t,n),u=l==="tint"?[c.detail.value,d[1]]:[d[0],c.detail.value];this._zetLamp(e,Ln(this._waardeVan(e),u,t,n))};return f`
      <div class="besturing">
        <div class="label">
          <span>Kleur</span><span>${s}° / ${o} %</span>
        </div>
        <div class="kleurregelaars">
          <div class="schuiven">
            <ha-control-slider
              touch-action="pan-y"
              mode="cursor"
              .min=${0}
              .max=${360}
              .step=${1}
              .value=${s}
              style=${`--control-slider-background: ${Qs}; --control-slider-background-opacity: 1`}
              @slider-moved=${r("tint")}
              @value-changed=${r("tint")}
            ></ha-control-slider>
            <ha-control-slider
              touch-action="pan-y"
              .min=${0}
              .max=${100}
              .step=${1}
              .value=${o}
              style=${`--control-slider-color: hsl(${s}, 100%, 50%)`}
              @slider-moved=${r("verzadiging")}
              @value-changed=${r("verzadiging")}
            ></ha-control-slider>
          </div>
          <div
            class="staal"
            style=${`background: hsl(${s}, ${o}%, 50%)`}
          ></div>
        </div>
      </div>
    `}};_($e,"properties",{hass:{attribute:!1},entityId:{attribute:!1},nameOverrides:{attribute:!1},_scenes:{state:!0},_leden:{state:!0},_tab:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0}}),_($e,"styles",[X,G`
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
    `]);var eo="0.3.0",to=["type","entity","name_overrides"],Wn="laden",Ue="klaar",Bn="leeg",Gn="geen-groep",pa="opslagfout",ha="fout",We=class extends U{constructor(){super(),this._scenes=null,this._leden=[],this._toestand=Wn,this._melding="",this._bezig=!1,this._editorOpen=!1,this._opgehaaldVoor=null,this._bestondVorigeKeer=!1}static getConfigElement(){return document.createElement(In)}static getStubConfig(e){return{entity:Object.keys(e?.states??{}).find(n=>n.startsWith("light.")&&Array.isArray(e.states[n].attributes?.entity_id))??""}}setConfig(e){if(!e?.entity)throw new Error("Kies een lichtgroep bij 'entity'.");let t=Object.keys(e).filter(n=>!to.includes(n)&&!ra.includes(n));t.length&&console.warn(`${At}: onbekende sleutels in de configuratie: ${t.join(", ")}`),this._config=e}getCardSize(){return 1}getGridOptions(){return{rows:"auto",columns:"full",min_columns:6}}willUpdate(){let e=this._config?.entity;if(!this.hass||!e)return;let t=!!this.hass.states[e];if(this._opgehaaldVoor!==e){this._opgehaaldVoor=e,this._bestondVorigeKeer=t,this._haalScenesOp();return}if(t&&!this._bestondVorigeKeer&&this._toestand===Gn){this._bestondVorigeKeer=!0,this._haalScenesOp();return}this._bestondVorigeKeer=t}async _haalScenesOp(){let e=this._config.entity;this._toestand=Wn,this._melding="";try{let t=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:e});this._scenes=t.scenes,this._leden=t.member_entity_ids??[],this._toestand=this._leden.length===0?Bn:Ue}catch(t){this._verwerkFout(t,e)}}_verwerkFout(e,t){let n=e?.code;if(this._melding=e?.message??String(e),n==="home_assistant_error"){this._toestand=pa;return}if(!this.hass.states[t]){this._toestand=Gn;return}this._toestand=ha}_naam(e){return this._config?.name_overrides?.[e]||this.hass?.states?.[e]?.attributes?.friendly_name||e}async _pasSceneToe(e){if(this._bezig||this._toestand!==Ue)return;let{oproepen:t}=wt({scene:this._scenes?.[e],memberEntityIds:this._leden,states:this.hass.states});if(t.length){this._bezig=!0;try{let n=await $t((a,s)=>this.hass.callService("light",a,s),t);n.length&&this._meldMislukking(n.map(a=>a.entityId))}finally{this._bezig=!1}}}_meldMislukking(e){let t=e.map(a=>this._naam(a)).join(", "),n=e.length===1?`${t} reageerde niet.`:`Deze lampen reageerden niet: ${t}.`;this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:n},bubbles:!0,composed:!0}))}_bewerk(){this._toestand===Ue&&(this._editorOpen=!0)}_sluitEditor(){this._editorOpen=!1}_scenesOpgeslagen(e){e.stopPropagation(),this._scenes=e.detail.scenes,this._leden=e.detail.member_entity_ids??[],this._toestand=this._leden.length===0?Bn:Ue}render(){if(!this._config)return v;switch(this._toestand){case Gn:return this._renderFout(`Lichtgroep ${this._config.entity} bestaat niet (meer). Pas de kaart aan.`);case pa:return this._renderFout("De opgeslagen scenes van deze kamer zijn onleesbaar.",this._melding);case ha:return this._renderFout("De scenes konden niet geladen worden.",this._melding);default:return this._renderKaart()}}_renderFout(e,t){return f`
      <div class="needs">
        <span class="mark">${this._icoon("question")}</span>
        <span>
          <b>${e}</b>
          ${t?f`<span class="detail">${t}</span>`:v}
        </span>
      </div>
    `}_icoon(e){let t=document.createElement("template");return t.innerHTML=x(e),t.content.cloneNode(!0)}_renderKaart(){let e=this._toestand===Bn,t=this._toestand===Wn,n=this._iconen();return f`
      <div class="card surface">
        <div class="rij">
          <div class="scenes">
            ${n.map((a,s)=>f`
                <button
                  type="button"
                  class="chip"
                  ?disabled=${e||t||this._bezig}
                  aria-label=${`Scene ${s+1}`}
                  title=${`Scene ${s+1}`}
                  @click=${()=>this._pasSceneToe(s)}
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
            ${this._icoon(oa)}
          </button>
        </div>
        ${e?f`<div class="mededeling">Deze lichtgroep bevat geen lampen.</div>`:this._renderNieuweLampen()}
      </div>
      ${this._editorOpen?this._renderEditor():v}
    `}_renderNieuweLampen(){if(this._toestand!==Ue)return v;let e=Xi(this._scenes,this._leden,3).length,t=Yi(e);return t?f`<div class="mededeling">${t}</div>`:v}_renderEditor(){return f`
      <domotiapp-scene-editor
        .hass=${this.hass}
        .entityId=${this._config.entity}
        .nameOverrides=${this._config.name_overrides}
        @editor-gesloten=${this._sluitEditor}
        @scenes-opgeslagen=${this._scenesOpgeslagen}
      ></domotiapp-scene-editor>
    `}_iconen(){return Array.from({length:3},(e,t)=>this._scenes?.[t]?.icon||Ke[t])}};_(We,"properties",{hass:{attribute:!1},_config:{state:!0},_scenes:{state:!0},_leden:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0},_editorOpen:{state:!0}}),_(We,"styles",[X,G`
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
    `]);H(At,We);H(In,we);H(sa,$e);ve({type:At,name:"DomotiApp Scene",description:`Drie lichtscenes per kamer, vastgelegd bij de lichtgroep (v${eo}).`,preview:!1});var ue="domotiapp-alarm-card",qn="domotiapp-alarm-card-editor",ua="domotiapp-alarm-editor",ma="DomotiApp Alarm",ga="https://github.com/Sven2410/domotiapp-lovelace",Q="domotiapp_lovelace",Z=Object.freeze({get:`${Q}/alarms/get`,save:`${Q}/alarms/save`,setEnabled:`${Q}/alarms/set_enabled`,delete:`${Q}/alarms/delete`,stop:`${Q}/alarms/stop`,clearMessage:`${Q}/alarms/clear_message`,search:`${Q}/sound/search`,entities:`${Q}/entities/list`,previewStart:`${Q}/preview/start`,subscribe:`${Q}/updates/subscribe`}),jt="#026FA1";function fa(i){let e=typeof i?.name=="string"?i.name.trim():"",t=typeof i?.time=="string"?i.time.trim():"";return e&&t?`Wil je de wekker "${e}" van ${t} verwijderen?`:e?`Wil je de wekker "${e}" verwijderen?`:t?`Wil je de wekker van ${t} verwijderen?`:"Wil je deze wekker verwijderen?"}var no="07:00";var io=["uri","name","media_type","image"],ao="Let op: deze tijd bestaat twee nachten per jaar niet, of twee keer. Bij de overgang naar zomertijd wordt het uur van 02:00 tot 03:00 overgeslagen; die nacht gaat deze wekker niet af. Bij de overgang naar wintertijd komt dat uur twee keer voorbij; die nacht gaat hij twee keer af. Kies een tijd v\xF3\xF3r 02:00 of n\xE1 03:00 als dat een probleem is.",so="Dit geluid stopt van zichzelf. Een los nummer is na een paar minuten voorbij; daarna is het stil. Kies een afspeellijst of een radiostation als de wekker moet blijven spelen tot je hem uitzet.";var oo="Music Assistant Wekker",ro="Verlichting Wekker";function Tt(){return{id:null,name:"",time:no,days:[],enabled:!0,sound:null,endless:null,speaker:"",volume_pct:40,light:null}}function ba(i){let e=Tt();return!i||typeof i!="object"?e:{id:typeof i.id=="string"?i.id:null,name:typeof i.name=="string"?i.name:"",time:Fn(i.time)?i.time:e.time,days:Array.isArray(i.days)?[...i.days]:[],enabled:i.enabled!==!1,sound:Be(i.sound),endless:null,speaker:typeof i.speaker=="string"?i.speaker:"",volume_pct:Number.isInteger(i.volume_pct)?i.volume_pct:e.volume_pct,light:i.light&&typeof i.light=="object"?{entity_id:i.light.entity_id,brightness_pct:Number.isInteger(i.light.brightness_pct)?i.light.brightness_pct:60}:null}}function Be(i){if(!i||typeof i!="object"||Array.isArray(i)||typeof i.uri!="string"||!i.uri)return null;let e={};for(let t of io)e[t]=i[t]===void 0?null:i[t];return e}function Fn(i){if(typeof i!="string"||i.length!==5||i[2]!==":")return!1;let e=Number(i.slice(0,2)),t=Number(i.slice(3));return!/^\d\d$/.test(i.slice(0,2))||!/^\d\d$/.test(i.slice(3))?!1:e>=0&&e<=23&&t>=0&&t<=59}function Zn(i){let e=[];return!i||typeof i!="object"?{ok:!1,ontbreekt:["alles"]}:((typeof i.name!="string"||!i.name.trim())&&e.push("een naam"),Fn(i.time)||e.push("een geldige tijd"),i.speaker||e.push("een speaker"),(!i.sound||!i.sound.uri)&&e.push("een geluid"),(!Number.isInteger(i.volume_pct)||i.volume_pct<1||i.volume_pct>100)&&e.push("een volume tussen 1 en 100"),{ok:e.length===0,ontbreekt:e})}function va(i){let e={name:(i.name||"").trim(),time:i.time,days:[...new Set(i.days||[])].sort((t,n)=>t-n),enabled:i.enabled!==!1,sound:Be(i.sound),speaker:i.speaker,volume_pct:i.volume_pct,light:i.light?{entity_id:i.light.entity_id,brightness_pct:i.light.brightness_pct}:null};return i.id&&(e.id=i.id),e}function _a(i,e){let t=new Set(i||[]);return t.has(e)?t.delete(e):t.add(e),[...t].sort((n,a)=>n-a)}function xa(i){return Fn(i)&&i.slice(0,2)==="02"?ao:null}function ka(i){return i===!1?so:null}function ya(i){return typeof i?.endless=="boolean"?i.endless:null}function Nt(i,e){let t=e==="lamp",n=t?ro:oo,a=t?"lampen":"speakers";return!i||typeof i!="object"?`De lijst met ${a} is niet op te halen.`:i.label_exists===!1?`Het label '${n}' bestaat nog niet. De beheerder moet dat label aanmaken en op de ${a} zetten die als wekker mogen dienen.`:Array.isArray(i.entities)&&i.entities.length>0?null:Number(i.filtered_out)>0?t?`De entiteiten met het label '${n}' zijn geen lampen.`:"De gelabelde speakers zijn geen Music Assistant-speakers, of ze kunnen geen volume instellen.":`Er zijn nog geen ${a} met het label '${n}'.`}function wa(i,e){return Nt(e,"speaker")!==null?!1:Zn(i).ok}var co=[[1,"ma"],[2,"di"],[3,"wo"],[4,"do"],[5,"vr"],[6,"za"],[7,"zo"]],po=[["","Alles"],["playlist","Afspeellijsten"],["radio","Radio"],["artist","Artiesten"],["album","Albums"],["track","Nummers"],["podcast","Podcasts"]],Ge="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",ho="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",uo="M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z",Ee=class extends U{constructor(){super(),this._concept=Tt(),this._zoekterm="",this._soort="",this._treffers=null,this._zoekt=!1,this._melding=null,this._speelt=!1,this._bezig=!1,this._afmeldenVoorbeeld=null,this._opEscape=e=>{e.key==="Escape"&&this._annuleren()}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this._opEscape,!0)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this._opEscape,!0),this._stopVoorbeeld()}willUpdate(e){e.has("wekker")&&(this._concept=this.wekker?ba(this.wekker):Tt(),this._treffers=null,this._zoekterm="",this._melding=null)}_zet(e){this._concept={...this._concept,...e}}async _startVoorbeeld(){if(!(this._speelt||!this.hass)){if(!this._concept.speaker||!this._concept.sound){this._melding={tekst:"Kies eerst een speaker en een geluid.",fout:!0};return}this._melding=null;try{this._afmeldenVoorbeeld=await this.hass.connection.subscribeMessage(()=>{},{type:Z.previewStart,speaker:this._concept.speaker,sound:Be(this._concept.sound),volume_pct:this._concept.volume_pct,light:this._concept.light??null}),this._speelt=!0}catch(e){this._melding={tekst:e?.message??"Het voorbeeld kon niet starten.",fout:!0}}}}_stopVoorbeeld(){if(this._afmeldenVoorbeeld){try{this._afmeldenVoorbeeld()}catch(e){console.warn(`domotiapp-alarm-editor: afmelden mislukt: ${e?.message??e}`)}this._afmeldenVoorbeeld=null}this._speelt=!1}async _zoek(){let e=(this._zoekterm||"").trim();if(!(!e||!this.hass)){this._zoekt=!0,this._melding=null;try{let t={type:Z.search,query:e,limit:20};this._soort&&(t.media_types=[this._soort]);let n=await this.hass.callWS(t);this._treffers=n.results??[]}catch(t){this._treffers=[],this._melding={tekst:t?.message??"Zoeken is mislukt.",fout:!0}}finally{this._zoekt=!1}}}_kiesGeluid(e){this._zet({sound:Be(e),endless:ya(e)}),this._treffers=null}async _opslaan(){if(this._bezig||!this.hass)return;let e=Zn(this._concept);if(!e.ok){this._melding={tekst:`Er ontbreekt nog ${e.ontbreekt.join(", ")}.`,fout:!0};return}this._bezig=!0;try{let t=await this.hass.callWS({type:Z.save,person:this.person,alarm:va(this._concept)});this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-opgeslagen",{detail:{toestand:t},bubbles:!0,composed:!0}))}catch(t){this._melding={tekst:t?.message??"Opslaan is mislukt.",fout:!0}}finally{this._bezig=!1}}_annuleren(){this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-dicht",{bubbles:!0,composed:!0}))}_svg(e){return f`<svg class="icoon" viewBox="0 0 24 24" aria-hidden="true">
      <path d=${e} />
    </svg>`}render(){if(!this.hass)return v;let e=this._concept,t=this.entiteiten?.speakers,n=this.entiteiten?.lights,a=Nt(t,"speaker"),s=Nt(n,"lamp"),o=xa(e.time),r=ka(e.endless),l=wa(e,t);return f`
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
            @input=${c=>this._zet({time:c.target.value})}
          />
        </div>
        ${o?f`<div class="waarschuwing">
              ${this._svg(Ge)}<span>${o}</span>
            </div>`:v}
      </div>

      <div class="blok">
        <label class="veld">Herhaling</label>
        <div class="dagen">
          ${co.map(([c,d])=>f`<button
              type="button"
              aria-pressed=${e.days.includes(c)?"true":"false"}
              aria-label=${d}
              @click=${()=>this._zet({days:_a(e.days,c)})}
            >
              ${d}
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
            @input=${c=>this._zet({name:c.target.value})}
          />
        </div>
      </div>

      <div class="blok">
        <label class="veld" for="speaker">Speaker</label>
        ${a?f`<div class="uitleg">${this._svg(Ge)}<span>${a}</span></div>`:f`<div class="vak">
              <select
                id="speaker"
                .value=${e.speaker}
                @change=${c=>this._zet({speaker:c.target.value})}
              >
                <option value="">Kies een speaker…</option>
                ${(t?.entities??[]).map(c=>f`<option value=${c.entity_id} ?selected=${c.entity_id===e.speaker}>
                    ${c.name}
                  </option>`)}
              </select>
            </div>`}
      </div>

      <div class="blok">
        <label class="veld" for="zoek">Geluid</label>
        ${e.sound?f`<div class="gekozen">
              ${e.sound.image?f`<img src=${e.sound.image} alt="" />`:v}
              <span>${e.sound.name||e.sound.uri}</span>
              <span class="soort" style="margin-left:auto">${e.sound.media_type??""}</span>
            </div>`:v}
        <div class="rij" style="margin-top:8px">
          <div class="vak">
            <input
              id="zoek"
              type="text"
              .value=${this._zoekterm}
              placeholder="Zoek media"
              @input=${c=>{this._zoekterm=c.target.value}}
              @keydown=${c=>{c.key==="Enter"&&(c.preventDefault(),this._zoek())}}
            />
          </div>
          <div class="vak auto">
            <select
              aria-label="Soort"
              @change=${c=>{this._soort=c.target.value}}
            >
              ${po.map(([c,d])=>f`<option value=${c}>${d}</option>`)}
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
            ${this._svg(this._zoekt?uo:ho)}
          </button>
        </div>
        ${this._treffers?f`<div class="treffers">
              ${this._treffers.length===0?f`<div class="treffer">Niets gevonden.</div>`:this._treffers.map(c=>f`<button
                      class="treffer"
                      type="button"
                      @click=${()=>this._kiesGeluid(c)}
                    >
                      ${c.image?f`<img src=${c.image} alt="" />`:v}
                      <span>${c.name}</span>
                      <span class="soort">${c.media_type??""}</span>
                    </button>`)}
            </div>`:v}
        ${r?f`<div class="waarschuwing">${this._svg(Ge)}<span>${r}</span></div>`:v}
      </div>

      <div class="blok">
        <label class="veld" for="volume">Volume: ${e.volume_pct}%</label>
        <input
          id="volume"
          type="range"
          min="1"
          max="100"
          .value=${String(e.volume_pct)}
          @input=${c=>this._zet({volume_pct:Number(c.target.value)})}
        />
        <div class="uitleg">
          Het niveau waar de wekker in twintig seconden naartoe groeit.
        </div>
      </div>

      <div class="blok">
        <label class="veld" for="lamp">Wake-up light (optioneel)</label>
        ${s?f`<div class="uitleg">${this._svg(Ge)}<span>${s}</span></div>`:f`
              <div class="vak">
                <select
                  id="lamp"
                  @change=${c=>this._zet({light:c.target.value?{entity_id:c.target.value,brightness_pct:e.light?.brightness_pct??60}:null})}
                >
                  <option value="">Geen lamp</option>
                  ${(n?.entities??[]).map(c=>f`<option
                      value=${c.entity_id}
                      ?selected=${c.entity_id===e.light?.entity_id}
                    >
                      ${c.name}
                    </option>`)}
                </select>
              </div>
              ${e.light?f`<label class="veld" style="margin-top:10px" for="helderheid">
                      Helderheid: ${e.light.brightness_pct}%
                    </label>
                    <input
                      id="helderheid"
                      type="range"
                      min="1"
                      max="100"
                      .value=${String(e.light.brightness_pct)}
                      @input=${c=>this._zet({light:{...e.light,brightness_pct:Number(c.target.value)}})}
                    />`:v}
            `}
      </div>

      ${this._melding?f`<div class="blok">
            <div class="waarschuwing ${this._melding.fout?"fout":""}">
              ${this._svg(Ge)}<span>${this._melding.tekst}</span>
            </div>
          </div>`:v}

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
    `}};_(Ee,"properties",{hass:{attribute:!1},person:{attribute:!1},wekker:{attribute:!1},entiteiten:{attribute:!1},_concept:{state:!0},_zoekterm:{state:!0},_soort:{state:!0},_treffers:{state:!0},_zoekt:{state:!0},_melding:{state:!0},_speelt:{state:!0},_bezig:{state:!0}}),_(Ee,"styles",[X,G`
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${te(jt)});
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
  `]);var $a="person",mo="Kies een persoon in de kaartinstellingen.",Ea="De gekozen persoon is niet gevonden.",go="De opgeslagen wekkers van deze persoon zijn onleesbaar.",Pc=Object.freeze(["grid_options","layout_options","view_layout","visibility"]);function Sa(i){if(!i||typeof i!="object"||Array.isArray(i))throw new Error("De kaartconfig ontbreekt of is geen object.");let e=i.person;if(e==null||e==="")return{...i};if(typeof e!="string")throw new Error("'person' moet een entity-ID zijn, zoals person.sven.");if(!e.startsWith(`${$a}.`))throw new Error(`'${e}' zit niet in het domein ${$a}. Kies een persoon, zoals person.sven.`);return{...i}}function Aa(i){return{type:`custom:${i}`}}function za(i,e){return i?e?{soort:"ok",tekst:null,isFout:!1}:{soort:"weg",tekst:Ea,isFout:!0}:{soort:"ontbreekt",tekst:mo,isFout:!1}}function Ma(i,e){return i==="not_found"?Ea:i==="home_assistant_error"?go:e||"Er ging iets mis bij het ophalen van de wekkers."}var fo=["ma","di","wo","do","vr","za","zo"],bo="Geen wekkers ingesteld",vo="Eenmalig",_o="Eenmalig \u2014 afgelopen",xo="Geen wekker actief",ja="Stoppen",ko="Er is een melding over deze wekker, maar de tekst ontbreekt.";function yo(i){return!Array.isArray(i)||i.length===0?vo:[...new Set(i)].sort((t,n)=>t-n).map(t=>fo[t-1]??"?").join(" ")}function wo(i,e){return!i||Array.isArray(i.days)&&i.days.length>0?!1:Date.parse(i?.one_shot_at??"")<=e}function Ta(i,e){return wo(i,e)?_o:yo(i?.days)}function Na(i){let e=i?.last_message;return!e||typeof e!="object"||Array.isArray(e)?null:{tekst:typeof e.text=="string"&&e.text.trim()?e.text:ko,severity:e.severity==="error"?"error":"notice",isFout:e.severity==="error",kind:typeof e.kind=="string"?e.kind:null}}function Ca(i){let e=i?.alarms;if(!Array.isArray(e)||e.length===0)return bo;let t=i?.next_fire?.text;return typeof t=="string"&&t.trim()?t:xo}function Oa(i,e){let t=[...new Set((e??[]).filter(o=>typeof o=="string"))];if(t.length===0)return null;let n=t.map(o=>(i??[]).find(r=>r?.id===o)).filter(Boolean),a=n.map(o=>o.name).filter(Boolean),s=[...new Set(n.map(o=>o.time).filter(Boolean))];return{ids:t,naam:a.length?a.join(" en "):"Wekker",tijd:s.join(" en ")}}var $o="0.3.0",Eo="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",So="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z",La="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",Ao="M13,14H11V9H13M13,18H11V16H13M1,21H23L12,2L1,21Z",Ct=(i,e="icoon")=>f`<svg class=${e} viewBox="0 0 24 24" aria-hidden="true">
    <path d=${i} />
  </svg>`,qe=class extends U{constructor(){super(),this._toestand=null,this._fout=null,this._bevestigVoor=null,this._bezig=!1,this._tijdelijkeMelding=null,this._editorVoor=void 0,this._entiteiten=null,this._abonnementVoor=null,this._afmelden=null}setConfig(e){let t=Sa(e),n=t.person!==this._config?.person;this._config=t,n&&(this._toestand=null,this._fout=null,this._bevestigVoor=null,this._herstartAbonnement())}static getConfigElement(){return document.createElement(qn)}static getStubConfig(){return Aa(ue)}getGridOptions(){return{rows:"auto",columns:12,min_columns:6}}getCardSize(){if(this._stop())return 3;let e=this._toestand?.alarms?.length??0;return 1+Math.max(e,1)}connectedCallback(){super.connectedCallback(),this._herstartAbonnement()}disconnectedCallback(){super.disconnectedCallback(),this._stopAbonnement()}updated(e){e.has("hass")&&this.hass&&this._startAbonnement()}async _startAbonnement(){let e=this._config?.person;if(!(!this.hass||!e||!this.isConnected)&&this._abonnementVoor!==e){this._abonnementVoor=e;try{let t=await this.hass.connection.subscribeMessage(n=>this._opGebeurtenis(n),{type:Z.subscribe,person:e});if(this._abonnementVoor!==e){t();return}this._afmelden=t}catch(t){console.warn(`${ue}: abonneren mislukt: ${t?.message??t}`)}await this._haalOp()}}_stopAbonnement(){if(this._afmelden){try{this._afmelden()}catch(e){console.warn(`${ue}: afmelden mislukt: ${e?.message??e}`)}this._afmelden=null}this._abonnementVoor=null}_herstartAbonnement(){this._stopAbonnement(),this._startAbonnement()}_opGebeurtenis(e){let t=e?.alarm_id,n=e?.event;if(typeof t=="string"&&this._toestand){let a=new Set(this._toestand.ringing??[]);n==="started"?a.add(t):a.delete(t),this._toestand={...this._toestand,ringing:[...a]}}this._haalOp()}async _haalOp(){let e=this._config?.person;if(!(!this.hass||!e))try{let t=await this.hass.callWS({type:Z.get,person:e});if(this._config?.person!==e)return;this._toestand=t,this._fout=null}catch(t){if(this._config?.person!==e)return;this._toestand=null,this._fout=Ma(t?.code,t?.message)}}async _roep(e){if(!(!this.hass||this._bezig)){this._bezig=!0;try{let t=await this.hass.callWS(e);t&&typeof t=="object"&&(this._toestand=t,this._fout=null)}catch(t){this._toon(t?.message??"De opdracht is niet gelukt.")}finally{this._bezig=!1}}}async _openEditor(e){if(this._bevestigVoor=null,this._editorVoor=e,!!this.hass)try{this._entiteiten=await this.hass.callWS({type:Z.entities})}catch(t){this._entiteiten=null,console.warn(`${ue}: entiteitenlijst ophalen mislukt: ${t?.message??t}`)}}_sluitEditor(){this._editorVoor=void 0}_toon(e){this._tijdelijkeMelding=e,clearTimeout(this._meldingTimer),this._meldingTimer=setTimeout(()=>{this._tijdelijkeMelding=null},6e3)}_person(){return this._config?.person}_zetAan(e,t){this._roep({type:Z.setEnabled,person:this._person(),alarm_id:e.id,enabled:t})}_verwijder(e){this._bevestigVoor=null,this._roep({type:Z.delete,person:this._person(),alarm_id:e.id})}_begrepen(e){this._roep({type:Z.clearMessage,person:this._person(),alarm_id:e.id})}async _stopAlles(e){for(let t of e)await this._roep({type:Z.stop,person:this._person(),alarm_id:t})}_stop(){return this._toestand?Oa(this._toestand.alarms,this._toestand.ringing):null}render(){if(!this._config)return v;let e=this._config.person,t=!!(e&&this.hass?.states?.[e]),n=za(e,t);if(n.soort!=="ok")return this._mededeling(n.tekst,n.isFout);if(this._fout)return this._mededeling(this._fout,!0);if(!this._toestand)return this._mededeling("Wekkers ophalen\u2026",!1);let a=this._stop();return this._editorVoor!==void 0&&!a?f`<div class="card surface">
        <domotiapp-alarm-editor
          .hass=${this.hass}
          .person=${this._config.person}
          .wekker=${this._editorVoor}
          .entiteiten=${this._entiteiten}
          @editor-dicht=${()=>this._sluitEditor()}
          @editor-opgeslagen=${s=>{this._toestand=s.detail.toestand,this._sluitEditor()}}
        ></domotiapp-alarm-editor>
      </div>`:f`<div class="card surface">
      ${a?this._stopknop(a):this._lijst()}
      ${this._tijdelijkeMelding?f`<div class="onderrij">
            ${Ct(La,"icoon klein")}
            <span class="boodschap">${this._tijdelijkeMelding}</span>
          </div>`:v}
    </div>`}_mededeling(e,t){return f`<div class="card surface">
      <div class="mededeling ${t?"fout":""}">${e}</div>
    </div>`}_stopknop(e){return f`<button
      class="stopknop"
      @click=${()=>this._stopAlles(e.ids)}
    >
      <div class="stop-tijd">${e.tijd}</div>
      <div class="stop-naam">${e.naam}</div>
      <div class="stop-woord">${ja}</div>
    </button>`}_lijst(){let e=this._toestand.alarms??[],t=Date.now();return f`
      <div class="kop ${e.length===0?"leeg":""}">
        <span class="volgende">${Ca(this._toestand)}</span>
        <button
          class="icoonknop"
          title="Wekker toevoegen"
          aria-label="Wekker toevoegen"
          @click=${()=>this._openEditor(null)}
        >
          ${Ct(Eo)}
        </button>
      </div>
      ${e.map(n=>this._rij(n,t))}
    `}_bevestiging(e){return f`<div class="onderrij bevestiging">
      <span class="boodschap">${fa(e)}</span>
      <button
        class="tekstknop"
        @click=${()=>{this._bevestigVoor=null}}
      >
        Annuleren
      </button>
      <button class="tekstknop gevaar" @click=${()=>this._verwijder(e)}>
        Verwijderen
      </button>
    </div>`}_rij(e,t){let n=Na(e),a=!!e.enabled;return f`
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
            <div class="sub">${Ta(e,t)}</div>
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
          ${Ct(So)}
        </button>
      </div>
      ${this._bevestigVoor===e.id?this._bevestiging(e):v}
      ${n?f`<div class="onderrij ${n.isFout?"fout":""}">
            ${Ct(n.isFout?Ao:La,"icoon klein")}
            <span class="boodschap">${n.tekst}</span>
            <button class="tekstknop" @click=${()=>this._begrepen(e)}>
              Begrepen
            </button>
          </div>`:v}
    `}};_(qe,"properties",{hass:{attribute:!1},_config:{state:!0},_toestand:{state:!0},_fout:{state:!0},_bevestigVoor:{state:!0},_bezig:{state:!0},_tijdelijkeMelding:{state:!0},_editorVoor:{state:!0},_entiteiten:{state:!0}}),_(qe,"styles",[X,G`
    /* unsafeCSS en niet de constante rechtstreeks: lit weigert een gewone
       string in een css-template en gooit dan — op modulescope, wat SPEC 19.4
       verbiedt. De waarde is onze eigen constante en komt nergens van buiten. */
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${te(jt)});
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
  `]);var Se=class Se extends U{constructor(){super(...arguments);_(this,"_label",t=>t.name==="person"?"Persoon":t.name)}setConfig(t){this._config={...t}}render(){return!this._config||!this.hass?v:f`
      <div class="uitleg">
        Elke persoon heeft zijn eigen wekkerlijst. De kaart toont alleen de
        wekkers van de gekozen persoon.
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${Se._SCHEMA}
        .computeLabel=${this._label}
        @value-changed=${this._gewijzigd}
      ></ha-form>
    `}_gewijzigd(t){t.stopPropagation();let n={...this._config,...t.detail.value};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:n},bubbles:!0,composed:!0}))}};_(Se,"properties",{hass:{attribute:!1},_config:{state:!0}}),_(Se,"styles",[X,G`
    .uitleg {
      padding: 0 0 12px 0;
      color: var(--dac-ink-2);
      font-size: 11.5px;
    }
  `]),_(Se,"_SCHEMA",[{name:"person",required:!0,selector:{entity:{filter:{domain:"person"}}}}]);var Xn=Se;H(ue,qe);H(qn,Xn);H(ua,Ee);ve({type:ue,name:ma,description:`Wekkerkaart van DomotiApp (v${$o}).`,preview:!1,documentationURL:ga});var zo="0.3.0";ai(i=>console.warn(`domotiapp-lovelace: ${i}`));console.info(`%c DOMOTIAPP-LOVELACE %c ${zo} `,"background:#026fa1;color:#e8e4de;font-weight:600;border-radius:3px 0 0 3px;padding:2px 6px","background:#12120f;color:#e8e4de;border-radius:0 3px 3px 0;padding:2px 6px");export{zo as VERSION};
