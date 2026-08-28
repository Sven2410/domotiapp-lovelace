var Fl=Object.defineProperty;var Zl=(a,e,t)=>e in a?Fl(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var y=(a,e,t)=>Zl(a,typeof e!="symbol"?e+"":e,t);var G=`
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
`,xe=`
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
`;function F(a){let e=new CSSStyleSheet;return e.replaceSync(a),e}var Xn=null,br=a=>{Xn=a},ue=a=>String(a??"").split(".")[0],b=(a,e)=>e&&a?.states?.[e]||null,Y=(a,e)=>b(a,e)?.attributes??{},Ht=(a,e,t)=>t?null:Y(a,e).entity_picture||null;function vr(a){if(!a||a.state!=="on")return null;let e=a.attributes??{};if(Array.isArray(e.entity_id))return null;let t=e.rgb_color;return Array.isArray(t)&&t.length>=3?`rgb(${t[0]},${t[1]},${t[2]})`:null}function E(a,e,t){return t||Y(a,e).friendly_name||e||""}var Xl=new Set(["scene","script","input_button","button","event"]),Yn=a=>Xl.has(ue(a));function ee(a){return!a||a.state==="unavailable"?!0:a.state==="unknown"?!Yn(a.entity_id):!1}function te(a){if(!a)return!1;let e=a.state;if(e==="unavailable"||e==="unknown")return!1;switch(ue(a.entity_id)){case"cover":return e==="open"||e==="opening";case"alarm_control_panel":return e.startsWith("armed")||e==="triggered"||e==="arming";case"climate":case"water_heater":case"humidifier":return e!=="off";case"person":case"device_tracker":return e==="home";case"media_player":return e!=="off"&&e!=="idle"&&e!=="standby";default:return e==="on"||e==="playing"||e==="active"||e==="heat"}}var Yl=new Set(["light","switch","fan","input_boolean","automation","siren","humidifier","remote","water_heater"]),kr=a=>Yl.has(ue(a));function xr(a,e,t){if(!a||a.themes!==e.themes||a.language!==e.language)return!0;for(let n of t)if(n&&a.states?.[n]!==e.states?.[n])return!0;return!1}function Lt(a,e,t={}){a.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!1}))}var V=(a,e)=>Lt(a,"hass-more-info",{entityId:e});function ot(a){switch(ue(a)){case"light":case"switch":case"fan":case"input_boolean":case"automation":case"siren":return{action:"toggle"};case"script":case"scene":case"input_button":case"button":return{action:"toggle"};default:return{action:"more-info"}}}function Ql(a){switch(ue(a)){case"scene":return["scene","turn_on"];case"script":return["script","turn_on"];case"input_button":return["input_button","press"];case"button":return["button","press"];case"lock":return["lock","open"];case"cover":return["cover","toggle"];case"media_player":return["media_player","media_play_pause"];default:return["homeassistant","toggle"]}}function me(a,e,t,n){if(!(!n||n.action==="none")){if(n.confirmation){let i=n.confirmation===!0?{}:n.confirmation;if(!Xn){console.warn("DomotiApp: geen bevestigingsscherm geladen; de actie is niet uitgevoerd.");return}Xn(i).then(r=>{r&&mr(a,e,t,n)});return}mr(a,e,t,n)}}function mr(a,e,t,n){switch(n.action){case"more-info":V(a,n.entity||t.entity);break;case"toggle":{let i=n.entity||t.entity;if(!i)break;let[r,o]=Ql(i);e.callService(r,o,{entity_id:i});break}case"perform-action":case"call-service":{let i=n.perform_action||n.service;if(!i)break;let[r,o]=i.split(".");e.callService(r,o,n.data??n.service_data??{},n.target);break}case"navigate":if(!n.navigation_path)break;history.pushState(null,"",n.navigation_path),Lt(window,"location-changed",{replace:!1});break;case"url":n.url_path&&window.open(n.url_path,n.target??"_blank");break;case"assist":Lt(a,"show-dialog",{dialogTag:"ha-voice-command-dialog",dialogImport:()=>{},dialogParams:{}});break;case"fire-dom-event":Lt(a,"ll-custom",n);break;default:break}}function B(a,{onTap:e,onHold:t,onDouble:n}){let o=0,s=0,l=null,d=p=>{p.button!=null&&p.button!==0||(o=Date.now())},c=()=>{let p=o?Date.now()-o:0;if(o=0,t&&p>=500){navigator.vibrate?.(18),t();return}if(!n){e?.();return}if(s++,s===1){l=setTimeout(()=>{s=0,e?.()},260);return}clearTimeout(l),s=0,n()};return a.addEventListener("pointerdown",d),a.addEventListener("click",c),a.addEventListener("contextmenu",p=>p.preventDefault()),()=>{clearTimeout(l),a.removeEventListener("pointerdown",d),a.removeEventListener("click",c)}}function J(a,e){if(!e)return"";let t=ue(e.entity_id),n=e.attributes.device_class;return a.formatEntityState?.(e)??a.localize?.(`component.${t}.entity_component.${n??"_"}.state.${e.state}`)??a.localize?.(`component.${t}.entity_component._.state.${e.state}`)??e.state}function q(a,e,t){let n=Number(e);return Number.isFinite(n)?n.toLocaleString(a?.locale?.language??"nl",{minimumFractionDigits:t??0,maximumFractionDigits:t??0}):"--"}var gr=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],_r=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"],fr=(a=new Date)=>new Date(a.getFullYear(),a.getMonth(),a.getDate()),Rt=(a,e)=>Math.round((fr(e)-fr(a))/864e5);function st(a){if(!a)return null;if(a instanceof Date)return Number.isNaN(+a)?null:a;let e=String(a).trim(),t=e.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);if(t)return new Date(+t[3],+t[2]-1,+t[1]);if(t=e.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/),t)return new Date(+t[1],+t[2]-1,+t[3]);let n=new Date(e);return Number.isNaN(+n)?null:n}function It(a,e=new Date){if(!a)return"";let t=Rt(e,a);return t<0?`${Math.abs(t)} dagen geleden`:t===0?"vandaag":t===1?"morgen":t===2?"overmorgen":t<=6?gr[a.getDay()]:`${gr[a.getDay()].slice(0,2)} ${a.getDate()} ${_r[a.getMonth()]}`}var wr=a=>a?`${a.getDate()} ${_r[a.getMonth()]}`:"";function Jl(a){let e=Math.max(1,Math.ceil((a+8)/64));return e*56+(e-1)*8}function ed(a){if(!a)return 0;let e=getComputedStyle(a),t=[...a.children].filter(r=>r.getBoundingClientRect().height>0);if(!t.length)return 0;let n=parseFloat(e.rowGap)||0;return t.reduce((r,o)=>r+o.getBoundingClientRect().height,0)+n*(t.length-1)+parseFloat(e.paddingTop)+parseFloat(e.paddingBottom)+parseFloat(e.borderTopWidth)+parseFloat(e.borderBottomWidth)}function D(a,e=4){if(!a)return;let t=ed(a);if(!t){e>0&&requestAnimationFrame(()=>D(a,e-1));return}let n=`${ad(a,Jl(t))}px`;a.style.getPropertyValue("--dac-raster")!==n&&a.style.setProperty("--dac-raster",n)}var Qn=new WeakMap,td=12,nd=3;function ad(a,e){let t=Qn.get(a)??{rij:[],vast:null};if(t.vast!==null){if(t.vast.paar.includes(e))return t.vast.waarde;t.vast=null,t.rij=[]}let n=[...t.rij,e].slice(-td),i=[...new Set(n)],r=n.reduce((s,l,d)=>d>0&&l!==n[d-1]?s+1:s,0);if(i.length===2&&r>=nd){let s=Math.max(...i);return Qn.set(a,{rij:n,vast:{paar:i,waarde:s}}),s}return Qn.set(a,{rij:n,vast:null}),e}function Ue(a){let e=parseFloat(a?.style?.getPropertyValue?.("--dac-raster")??"");return!Number.isFinite(e)||e<=0?null:Math.max(1,Math.round((e+8)/64))}function R(a){if(!a||typeof ResizeObserver>"u")return()=>{};let e=new ResizeObserver(()=>{for(let t of a.children)e.observe(t);D(a)});e.observe(a);for(let t of a.children)e.observe(t);return D(a),()=>e.disconnect()}var id="home-assistant";function yr({leesRegistry:a,definities:e,waarschuw:t=()=>{},plan:n=(l,d)=>setTimeout(l,d),nu:i=()=>Date.now(),marker:r=id,intervalMs:o=20,maxWachtMs:s=1e4}){let l=i();function d(){let h=a();if(!h)return!1;for(let[g,m]of e)try{h.get(g)||h.define(g,m)}catch(k){t(`kon ${g} niet registreren: ${k&&k.message}`)}return!0}function c(){let h=a();return!h||!h.get(r)?!1:d()}if(c())return!0;let p=()=>{if(!c()){if(i()-l>=s){t(`${r} is na ${s} ms niet verschenen; de kaart wordt alsnog geregistreerd`),d();return}n(p,o)}};return n(p,o),!1}var zr=[];function O(a,e){zr.push([a,e])}function We({type:a,name:e,description:t,preview:n=!0,documentationURL:i}){window.customCards=window.customCards??[],!window.customCards.some(r=>r.type===a)&&window.customCards.push({type:a,name:e??a,description:t??"",preview:n,documentationURL:i??"https://github.com/Sven2410/domotiapp-lovelace"})}function jr(a=()=>{}){yr({leesRegistry:()=>globalThis.customElements,definities:zr,waarschuw:a})}var rd=`
  :host {
    ${G}
    display: block;
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  :host([hidden]) { display: none; }
`,$={accent:"var(--dac-accent-hi)",solar:"var(--dac-solar)",house:"var(--dac-house)",water:"var(--dac-grid-in)",magenta:"var(--dac-grid-out)",pink:"var(--dac-device-1)",teal:"var(--dac-device-2)",lit:"var(--dac-lit)",good:"var(--dac-good)",warn:"var(--dac-warn)",bad:"var(--dac-bad)",neutral:"var(--dac-ink-3)"},Er={accent:"Accent",solar:"Oranje",house:"Blauw",water:"Lichtblauw",magenta:"Magenta",pink:"Roze",teal:"Groenblauw",lit:"Lampgeel",good:"Goed",warn:"Let op",bad:"Kritiek",neutral:"Neutraal"},I=a=>String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),U=(a,e="accent")=>$[a]??(a&&/[#(]|^var/.test(a)?a:$[e]),T=Symbol("incomplete"),od=a=>`
  <div class="needs">
    <span class="mark"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6"/>
      <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>
    </svg></span>
    <span><b>Nog niets gekozen</b><span>${a}</span></span>
  </div>`,sd=56,$r=8,ge=a=>Math.max(1,Math.ceil((a+$r)/(sd+$r))),M=class extends HTMLElement{static get styleSheets_(){return Object.hasOwn(this,"sheets_")||(this.sheets_=[F(rd+xe+this.css)]),this.sheets_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=new.target.styleSheets_,this.built_=!1,this.wired_=!1,this.teardown_=[],this.bewaakFocusRing_()}bewaakFocusRing_(){let e=0,t=0;this.shadowRoot.addEventListener("pointerdown",()=>{e=Date.now()},!0),this.shadowRoot.addEventListener("keydown",()=>{t=Date.now()},!0),this.shadowRoot.addEventListener("focusin",n=>{if(t>=e)return;let i=n.target;!i?.matches||i.matches("input, textarea, select, [contenteditable]")||requestAnimationFrame(()=>{t>=e||i.isConnected&&i.matches(":focus-visible")&&i.blur?.()})},!0)}setConfig(e){let t=this.validate(e??{});this.config=t,this.built_&&(this.destroy_(),this.shadowRoot.replaceChildren(),this.built_=!1,this.wired_=!1),this.isConnected&&this.build_()}set hass(e){let t=this.hass_;if(this.hass_=e,!!this.config){if(!this.built_){this.build_();return}this.config[T]||xr(t,e,this.watched())&&this.paint()}}get hass(){return this.hass_}connectedCallback(){if(this.config){if(!this.built_){this.build_();return}this.config[T]||this.wired_||(this.wire(),this.wired_=!0,this.hass_&&this.paint())}}disconnectedCallback(){this.destroy_(),this.wired_=!1}validate(e){return e}watched(){return this.config?.entity?[this.config.entity]:[]}template(){return""}wire(){}paint(){}build_(){let e=document.createElement("template"),t=this.config?.[T];if(e.innerHTML=t?od(t):this.template(),this.shadowRoot.appendChild(e.content),this.built_=!0,t){this.teardown_.push(R(this.$(".needs")));return}this.wire(),this.wired_=!0,this.hass_&&this.paint()}destroy_(){for(let e of this.teardown_)try{e()}catch{}this.teardown_=[]}on(e,t,n,i){e&&(e.addEventListener(t,n,i),this.teardown_.push(()=>e.removeEventListener(t,n,i)))}$(e){return this.shadowRoot.querySelector(e)}$$(e){return[...this.shadowRoot.querySelectorAll(e)]}text(e,t){let n=typeof e=="string"?this.$(e):e;n&&n.textContent!==String(t)&&(n.textContent=t)}getCardSize(){return 1}minRijen_(e=".card",t=1){return Ue(this.$(e))??t}};y(M,"css","");function N(a,e,{name:t,description:n,preview:i=!0}={}){O(a,e),We({type:a,name:t,description:n,preview:i})}function H(a,e){O(a,e)}var u=(a,e="none")=>`<svg class="icon" viewBox="0 0 24 24" fill="${e}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${a}</svg>`,A={house:u(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
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
    <path d="M5.2 6.6h13.6M5.2 8.6h13.6"/>`),eettafel:u(`<path d="M3 9.6h18"/>
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
    <path d="M19.4 9.4a5.6 5.6 0 1 0 0 7.4"/>`)};A.domotitech='<img class="icon" alt="" aria-hidden="true" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ4AAAEOCAYAAAB4sfmlAAAACXBIWXMAAAsSAAALEgHS3X78AAAc4UlEQVR4nO3de5RcdWEH8O9vFhDayC5MHkgIO4jksUnYQaEKKntDBB/g2aE91gpsM/Qf/+gjM7zk1NpMbG1RwdkckKfArBNBrcqs+IKE7GwSoO/MqoAFK7P12B4Jc8y0KNrTk9s/fr87e/c9v5l77+/One/nnIXM6947uzvf/b1/wrZtEBHpiJm+ACLqPAwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItJ2gukLoM4RzxbTAFIAEgAGAdQBVNRXuZYfKZm6NgqWsG3b9DVQyKnAyAHoX+apdQAlALlafqTq60WRUQwOWlQ8W0wCGAUw1MLLxwGM1vIjZU8vikKBwUHzxLPFPsgSxk4PDjcGlkAih8FBs8SzRQtAActXS3TUIUsfOQ+PSQYxOAiA56WMxUwBSNfyIxUfz0EBYHcsIZ4tpgBU4W9oALIn5kg8W8z5fB7yGUscXSygUsZiJgGkavmRYwbOTW1icHQpn9oydNUBWKy6dB4GR5cxXMpYzPW1/EjB9EVQ8xgcXSQkpYzFjNXyI2nTF0HNYXB0CdUgucv0dSxjCrLqwnaPkGNwRJwa/VmA7NHoBGz36ADsjo2weLaYAXAEnRMaANALoKzmx1BIscQRQfFsMQFZymhljkmY7OZo03BicESMGsxVgPzLHQXjkKNN2e4RIgyOiFDdrAUAw4YvxQ9TkIPFqqYvhCQGRwSEvJvVK2w0DRE2jnY41c06gWiHBiCrXkfYaBoOLHF0qA7sZvUSB4sZxuDoQKqbNYfoNIC2gpPkDGJwdJCIN4C2gut7GMLg6BAR7Gb1Sh2y5FE2fSHdJJLB4ZoBmvTgcBXINTONFIlDOps1jDjDNkCRCw41arICb/8y1wEkgx5HEKIG0CnI1c7Lc78Hqis4pb5M9+yw0TQgUQyOAoAdPhx6vJYfSflw3AWpBtB8UOdbxDRkG0K5mSerEMnAbBsMG00DEMXg8O0N1fIjwq9jO1TVpATz80xanifS5n4sXpiGDA82mvqEA8BCxLVosMnQmAJwQTuTy2r5kUotP2IB2Ab5IQ5aP+QM28BKiN2GwREC8WyxL54tjgJ4DGZ7Tcbg4bBuVcVJAtjtxfE09QJ4TFX5yGOsqmjwo6qiivUlmF80OONnr4Th98lGU4+xxGGQmmdyBGZDw1mur+DnSVQpJglZqgnajni2WFHtR+QBBocB8WwxEc8WyzC/BqinVZPl1PIjx9Rf/ushSzlBGgRQUSUfahODI2Cqwa4C870m19fyI0YWyFGlGwuytBMkNpp6hMERENUAWoD5BtBpyF6TgsFrcKouFuQKX0Fio6kHGBwBUAOjKvBnYJqOScgRsKEY36CqLikAewycPq+CnFrA4PBZiBba2V3Lj4Ryz5JafiQD2e4RNDaatojB4ZN4tpiMZ4sVmG8ArQO4Ouyrhauq0wVgo2lHYHD4QNWfywjH5DSrlh8pGb6Opri6bE01mqYDPm/HYnB4SDWAliAnp5leNyPQrlavqNm3FoIPj14AD6uqJS2DI0c1LDVyNGQL7WRr+ZFR0xfRLh9nOi9nDHIkbejag8KCJY42uUoZprtZAdk+cEEUQgMA1GAxIyNNIasubDRdBIOjDa5u1jCsAToJINFpVZPlqPDIGjj1IIAqG00XxuBogWs2axi6WQFgT1i7Wr2gSlAmumu5AfYiGByaXEPGw7AGqNPVGvlRkKq79moE313rNJpGovrnFTaO6pmE+Tkmjq7cT1VVHcow057EDbAVBkdn6ur1JQyHR1cG9lysqnSWOtSsVtMXYpJrglzQYz0AjjQFwODoJIEsuNMpDIdH12+AzeDoDHtq+ZHQzGoNC9XWYMFMeACy0bRg6NxGsY0j3OqQjXEdMdfEFDVQqwxzc4O6bi8XBkd4+fbLePHEvx0BkNB8WfXZbRsumHMcZ/8UXZlnt23wvPRkcIg60GUbYJ9g+gJoQX7PNUkA0B1OnVjgvj601j3ty1DuWn4kHc8WATPhMQg1WKwbSohs4wgXZzMkDjZqkcH5LUAXLUvI4AiP3WwA9YbB+S2OfDxbLER5khyDw7y2t1yk+QzOb3FEeoYtg8MsljJ8pMa8mAyPyM6wZXCYMQngHJYy/GdwcpwjkjNsGRzBmoaczWp1+1yHIKleDgtmwyNSM2yjGByTpi9gAXXIHduT3dBVF0auIeqmwgMAdsazxVIU2j2iGBxh+2COQQZGrptGFoaR4fktjmHIqkvC4DW0LYrBUYDZvyqOMch2jDSrJeERkvBwZthaBq+hLZELDvVX3eQAHAZGyLkmx5ms1vYCmOjURtPIBQfQaEkPcj/SOhgYHUXtW2vB3ChTR0fOsI3sXJVafiSjtmAchX8rRU2p45c6rP2iihYmuS1w3zG09lc7NN8rNb/lGMyuIbtDtXl0zAzbyM2OnUu1YKfVlxfTrqchG2BHWbKIDlVleNjwZUxDhkfoBwRGPjjmcjVIJSFnaSYw89c3ifmlkynIv7ZlAOVO+KFSa1R4+FlCbUZHrMHSdcFBtBTDCyG77Q7zyGIGB9Ecqr2hBHMrijlCu4ctg6MLbbpv4sMQ4k1aL7Lt/3rho9u+4r5r/Ref2WoDH9U9vwDue/EPL/mB7uuCpNrGSjC/j04ot2OIbK8KLe7/4qfeuzK+QmvY86u1144BmBUcNvDRlevif6x7/ld/WgOAP9F9XZCcsR6GlyMEXIPFwtS+FslxHEReUYsCmZyaD4RwOwYGB9Ey1IDCC2B+KkNoZtgyOIiaoKoJSZid4wKEZIYtg4OoSaqB0oLcfNok4zNsGRxEGtQclxSCnQu1EKN72DI4iFpQy49k0MWNpgwOohapRtNtCEejaS7IEzI4iNpQy4+UYX5hIADYFeT0/K4cALb2k48lhWsbQlvI/wuIObflf22BYz/7+HBoBt9QuNTyI85qXmWYHaa+I54tOmNPfBXJ4Dhz19ctAAkhRAJqFqwtkIwBvbYQLR1z7afGneJZ3RaiEgOO2QIVyLUlKkKIyn/c+sHQzSmgYNTyI8dUeIzC7EjTQMKj44PjzL/8WsKGsABYQiAJ/xO/FzPzF4bdD5x92+N1G6gAKMcEygAq0x9jmHQLNUzd5MbXDt/DoyOD44xPfC0FIAXAign0m74eFydUhgDsAoD+Tz8+ZUOUYwLl6i1XhXqNBfKGWlWsDLMLA+2IZ4sVvzYw74jZsWf8xd/1AUjZEKkYMGy7ahsxAdhOa8ScWohw3WEL2RLsVFXcT22ijUOeq/F8oY41/1zOdzPmesyGcN8et4UoxYDyyzdfWV36nfuDs2ODEZJVxbapBlxPhTo4Vn/8q6keIG0LMQyoDyBmf2A7MDhmXu+sWSpQqt50Jas0EaTaPUowtzBQHUDC6zU9Qhccaz7+1QSAjC3XCO3twcyHPYLB0ThRDBi3IQov3/QBVmcixvSqYj2/9YaJDdvP/6NDl22senXM0ATH6j//SioGkbGFbHh0rqqLgsN5H9MxIQoACv9+4/uroEgwGR4xIV7feNWF/wuB0UPbNua8OKbR4Fh161f6hEAKQA4C/THXh7SLgwMx0biOcQCjP7nh/WVQx1PhUYCBsR5r3nou4medjh5gyhbCmrQ2tFV1MRIcq2/9cp8NkQGQEUIlsAAYHPOCw7k9BWD0x9n3FUAdTU2HLyPg8Dh55ak/ffMlG9apz9MUgLbCI/DgWH3rlzMAcjZEL+D6sDM4lgoO59jTthC5n2TeWwB1LFPhcfZlW9G74mTnM9BWeAQWHKs+9mjKhhh1xl3M+7AzOJoJDue10wByP2aAdCwT4XHaOWvqZ2092z16esoGrIMthIfvwbHqlkeTEBgFMOT+ADE42goOBwOkgwUdHjEhXt/8wQtPcU+7sIHxg9aGlO6xfAuOVbc82mcDGQHsgissGByeBofzvOkYkHlp53vZldthgg6PNVvOfn3VuWec4ty2AfQI7J4Y2pDTOY4v0+pX3fKoBTlnY5cfx6d5+gE8dt6eJ8vn7XnSMn0x1DxnGwYEtBzhq9Wj/73A3bu2Tb6Y1jmO5yWOVTc/koMQuwCZZgIASxy+lzjUfY3vwxiA3It/dkUV1DGC2sMlsf18rFhxMoBGiQPqd+eCiaH1TS0f4VlwrL75kYTtbJvn+kVncBgJDgCo2wKjL/3pFTlQxwgiPNasX/uLVZvWngbMC466LZAsX7q+utwxPKmqrL75EQuyamJ6r02a0Qtg13l3PlndcOc+y/TFUHPUVPgxP8/x6s9qv1rkoV7IP/7Lajs4Vt30SBrABMzv7k0L6wcwseHOfaX1d+1LmL4YWp7f4WH/6jenL/Hw4PaDL+aWO0ZbwbHqpkcKMD9tmJozDKCy/q59OdMXQsvzMzyO2/Ypr73266WesuuyQy9aSz2h5eBQoWFylSPS1wtg18a79lc23rXfyH4c1Dw/w+OXr/1muacsuQBQS8Gx+sYvFcDQ6GSDAI5s+Pz+0YHP7ze6lSAtza/wEL98/fVlnjJ42aHFqyzawcHQiJSdACqb7t5vmb4QWlIGHm+/8Jv/+fUrzZz3PYdeSiz0gFZwMDQiqR/AxKa7949uuvsplj5CyDVILOi9W3oB5BZ6oOngWH3jl3JgaETZTgDVzXc/pT1vgfznCo/pgE+94z2HXrLm3tlUcKy+cW8aHD7eDXoBPDZwz4HSwD0HWPoIGRUeKQS/5WRu7h3LBsfqG/cmsUwLK0XOMIDKwD0HLNMXQrPV8iMVyPV4gzS0/fBLs3rhlgyOVTfs7YNc6oyDu7pPP4CJgXsOjG65l6WPMKnlR0oAdgd82oz7xnIljhw4jLzb7QRQ2XIvSx9hUsuP5NBGY+nJbzjxVM2XzGr7WjQ4Vt2w14L8pSHqBzCx5V6WPkIm3eoLj5+24jTNl/RuP/xSIzyWKnEUWroiirKdAMpb75vgqNMQUO0dLVVZfnvFG1p5meX8Y8HgWHXD3hwQqj1ZKTwGARzZet9EzvSFEADZcaHVyxIT4nVnPQ5NjT8Y84JjpWwQzcy9n2iOXZvvn6hsvX8iYfpCupnqotXq9Tzx9BX/2eLphpx/LFTiyIC9KNScQQCVzfeX+YfGLK1SR++bTjuz3RPOCo6VWZY2SFsvgPzm+8vlgQfKCdMX041UqaPQ7PP71q08ZflnLezyp3+cBOaXONJgaYNaMwSgsuWBMoesm9FUdeXklaf+9KSTTmjnPH3A/OBgaYPaIYesP1AuDTxQZrdtgGr5kSqaGNfxxnPftM6L8zWCY2V2rwX2pJA3hgFUN31hkqWPYC25XmjPilN+fsYa3XFf81SA2SUO/pDJS70AHtv8hcnywIOTCcPX0i3KSz24KplY0+4J9r3zLceA2cHBQT3khyEAlYEHJ1kN9lktP1Je7LE3ro2/evrpK9o9RWNKP4ODgiB7Xh48WNn84EHL8LVE3bx2jlhPT/2MLWev9ODYjc2a3MHB3hTy2yCAiYGHDo4OPHSQjaf+mLfz/OqL1/ee2F5PiqPs/MOXvWOJlrETQHXgoYOsvniv7L5xxuazXz/9tLarKI5G4yuDg0yR1ZeHD1Y2P3zIMn0xUXR6Yk195ZtXtzzYa46pp951XtW5EQMaXbFEJgwCmNj08KHSxsLhhOmL6XTipBP7Yied8PM1yXN+tWbLOi+bHwruG55UfIg8MAxgeHPh8NhxIPNC+l3z6uq0tEv2P9+3/vLzUz0CawDXpubeKLhvsKpCYbMDQHVT4XBu49hhNqDqKcGfQZxjT73rvFlBzuCgMOqFXFW/OjB2OLfpi08zQJbwzn3P9b1z3/MVuKa9eyw39w4GB4VZI0A2ffHp3EDxGQbIHBc/+VwKQBX+rQ08tv/dM42ijjC0cUy6/n0MrkEmiuX6dwKcT9ONnADJDBSfKdjA6Asjl1QNX5NRFz/5XAJyRuywz6fKLXSnExxVn08OyBFtZchgqB697cPlVg90xie+1gc50jWhvix1m4PYoq0XcgzIzk3FZ8aEEKPPX3fx3D80kfb2J37Y1wNkIEQQC27tXqi0AQDCtmXb68rsXvkPAQj3Exo3xKwX2jMPNJ5jz7nDBiYFUIBA6einP+J7K/mZu76egAwQC4AlhGgU32wh62XOdbvfja1uCHXvzG35X+d2rPF8oY41cwwx857lc12P2RCzbzuvb7xYXZs6Y0zMvo6Y69jOa92c99a4YoHZr5/zvty3e2a9DzHre+SIzb7ZeK/H1XmPu44nb895n4t8f2euVeC4en7PrNfP+ZnN+R6r25O2QOGFay8uIOLe8b0fpG0hcj1Av/tnFFPfQ+f72tP4PAr0iJmfDxo/75nX2o3nz/udmAaQPPDu9Qt+bv0IjjqEKAAYPfqZj1QX/S4EYG3uG31QIWILWDFgkMERueBwjlcXsstw9PlrL64iIi767g/6AKR6BHJQgTH3w+9TcFx94N3rF52m73Vw7AYwevSz14SyD/6s3d9I2EKkAFjCVTdkcMxcSAcHR+M31BZiMiZDpPTcNe8I5e/icn7nO99PAMjYQqQB9DbCIJjgGH/q0vVLLrPhVXBMAki/8tlrqkudLEzO+uRjfZBrkKRsIUOEwRGZ4HD9rDAOoHQcovSjj7w99CFy4Xe+n47J38thYOa9Bxgc9R4g8dSlC1dRHF4ER/bo7dd09KbUa/9KhoiASAMYYnBEKjjktUKgR7aHlI4D5R/9wdtD0aj61m9N9cWEsACkIJAC0Ov++RoIjqvLly5eRXG4g+MYgF6N4KgDsI7efk0ofgBeOeuvSglbIA0gLYB+BkekggO2aBx/WghRBlC2haj86PcvCuz3+G3fmkoCsGxZshhyfr5o/HxmBBwcYxND69PNvAd3cJQBDDUZHFO2ENbR28PZluGVs/66lAJE2qnKMDhmv9cODw7X6wUgG1crACq2QKUHqD73oYvKaFNy/EjSFkj0AElbliyGYvN+V0IRHFMArImhpasojlaCYwqA9cod10Y6NNzWfmo8ASAdk9tH9DM4IhkcrtfP/oDZwGSPAGwZLMec6wRwTN2HHvncpC3QByAZE0gAcjjA3OOFMDjqgEhODK2vokm6weFZaMSzRQszA7eWGkpcgRxRWnW+1FLwRqz71HjKFiIdA4YZHF0THFDB0Xh+j/Nv9f+eeT+zmSN2QHBsmxjaUIYGd3CUAAwvERxth4YKizRk3a7dUW+TmAmTMoCK2tEqEGf/zTcTtkAGahMrBgeDw32+DgqO6w9aGwrQ5A6OHIBdiwRHHRDWK3dc21IDUjxbTEOOefd7nskUZAmlDKAcVMlk3d9+My2E6pFR9zE4GBwdEBx7Jq0NLS3f2GxwXP3KHdct20UzV4CBsZhpqBBBAEFy9m2PJ225G14qJmZKVAwO5+gMDvlYKIJjbNLakEaLmgmOPa/ccZ1WKsWzxSTkzD2/1gdolTPRrrTUHhTtWnfb430x2SefA9DP4HCOzuCQjxkPjrZCA5gdHBaAiTnBMXX0c9dp7bcSzxYzAPLtXFRA6pArJpUhg8SX9pH+Tz9u2RDpmMAO5z4Gh/tY8hEGB4IKjrHyto1ptMkdHEkAR+YEx7ajn7uu3OzB4tliAZj5gHSYccgg8SVEEp/5VgKyITVtC9HP4HCOJR9hcCCI4Bg75EFoAK7gAICV2b0VCAyq00we/dx1VjMHiWeLfZB/uf1ahShovoZI/2e/nY4BadupyjE4GByuC/ApOMYOXeZNaMy9RkCOq5hSXzonKSA6oQHICUYPA6jGs8VCPFv0dEPu6ZuvLLx885UWgHMAjEFWm4j84mloAHNKHK1QPScPe3ExITcNWQoZ9bp3JnH7t/tkCURkAPSzxDH7fbHE0VaJY/fkZZty8FhbwaF6T8roviX7piB7jTyvypxz+3esmFwWbpjBweBoMziuP7x9UwE+aDc4KohWFUWX0zMzWsuPeDq78tw7vpuw5SzdTEyIXoDBweBoOjjqAFKHtg+U4ZOWgyOeLeYgV54maQoyQApeH/gt+e+lAWRstfQhg2P2dTA45IvVuad6BNKHtg/4ukxAS8ERzxYTAF72/GqioQ5ZjSl43RZybv57SVuITGxOlzeDwzn+7PO6H+uS4BgHkH7mPQO+z9lqNTgK6NzxGkEahyyFlL086FtGn+iD7PXKAOhncDjHn31e92NdEBzZpy8fCGwlPu3gUGM2fuHP5USWf9WY0SdStkAmBgwxOGaf1/1YhINjKiaQfvryzYGuxNdKcKQAPObP5UTeNNQS/l73xpy354kEZHduWqgJdgyOyAfHHgC5Z6/YHPiiWq0ERw76jaJ1zCzI407GKmbvIufs0Oaw1P/DNlmuXXXMBEjVywOft+fJPiEn2GVsIXu8GByRC44pW4jMs1dsLsMQr4PDCYgyZlbrKrd8dbPP29hcCXIhIFNT9b02BiDnx5T/8+58MgkgHYNIQbWFAAyODg6Oui3E6D+8d0sOhrUbHHXMXu8isHqW6tlJQQaJ3xvvBsGXhlTHhjv3JdW4kFQMoh9gcHRYcIwByPz9+7aGYq3fVntVLBhe+9PNVRpxgqSTSyOTkCWQsl8n2HjX/iSAtC2Q6nGVRBgcM68JUXCMAcj90/u3VhEibc9VCSM1FD6lvjp1ZKvvAQIAA5/f3yiJAGq6P4MjDMExBiD3jx84v4oQimRwuKkqjQXXtnodJpAAAYBNdz+VjAEpW+6v2whcBkdgwVEHUIqFODAckQ+OuVR3cidWaQILEAAYuOdAAqrUFhOze7UYHJ4HxzSAUQgU/vkD54eiDWM5XRccbqpKk0Zn9dIEGiAAsOXeA40NugFYQk26Y3C0HRzjAAr/etWg9kLgpnV1cLh1YIgEHiCOrfdNpABYxwVSMaCfwaEVHNMxIUYBlP7lqsEqOhSDYwEqRDLwZuMovxkLEADYev9E8jiEBdlLM8jgkLfnBMd0D1CyhSgc+WAyEpu0MziW4WoTCfukPqMBAgADD5T7YkDquPx+JW1nUebuDI4pQJQAlCrDF0QiLNwYHE1SY0WcEAlz74zxAHFs+sJkX0xuxJwEkBAQScjbjVJchIKjDqBkCzkY8vupt1ab/DZ1JAZHC1whYkHOrTE1VsQZ4g/MngdUDkNwLGbgoYPOnKSEEEgAwjoO9NlCDHZQcEwBqNhq3+If/u7bIleqWAqDwyNqNG1CfVnq7nYn501jZiJgFfKXFGEOhXZtLhxOHFffR1sgIUssog9AUriWUAQCC466DVR6BCq2/BlUnvu9C8tevudOxOAIgBqEltB4ScWvneU63UDxmYQtv5d9QogkAKiqUJ8rOIaaCI5pIURVPR8AKkKW2mALlHsAPPehi8q+v6EOxeAgIm1z170lIloWg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEjb/wMjwhH4i90hIgAAAABJRU5ErkJggg==" />';function v(a,e="question"){return a?A[a]?A[a]:a.includes(":")?`<ha-icon class="icon" icon="${a}"></ha-icon>`:A[e]??A.question:A[e]??A.question}function Jn(a,e={}){switch(String(a??"").split(".")[0]){case"light":return"bulb";case"switch":return"switchOn";case"cover":return e.device_class==="awning"||e.device_class==="blind"?"awning":"shutter";case"person":case"device_tracker":return"person";case"climate":return"thermo";case"binary_sensor":return e.device_class==="smoke"?"smoke":"shield";case"alarm_control_panel":return"shield";case"scene":case"script":case"input_button":case"button":return"star";case"weather":return"cloudSun";case"date":return"calendar";case"time":case"datetime":return"clock";case"input_datetime":return e.has_time===!1?"calendar":"clock";case"input_select":case"select":return"keuzelijst";case"media_player":return e.device_class==="tv"?"tv":e.device_class==="receiver"?"radio":"speaker";default:return"question"}}function lt(a){switch(a){case"sunny":case"clear-night":return"sun";case"partlycloudy":return"cloudSun";case"cloudy":return"cloud";case"rainy":case"pouring":case"hail":case"lightning":case"lightning-rainy":return"rain";case"snowy":case"snowy-rainy":return"snow";case"fog":return"fog";case"windy":case"windy-variant":return"wind";default:return"cloud"}}var Vt=[["Woning",["house","homeLeave","homeStatus","homeThermo","floorB","floor1","floor2","garage","door","window","stairs","grid"]],["Kamers",["bed","bedDouble","wardrobe","hanger","sofa","lounge","eettafel","kitchen","shower","toilet","desk","garage","storage"]],["Buiten",["tree","parasol","veranda","fence","sun","awning","gras","kruiden","car","beach"]],["Rolluiken",["shutter","shutterOpen","awning","garageOpen","garageClosed","arrowUp","arrowDown","stop"]],["Licht en stroom",["bulb","bulbGroup","switchOn","power","plug","bolt","battery"]],["Personen",["person","people","away","dier"]],["Apparaten",["tv","speaker","camera","cctv","car","van","washer","dishwasher","koelkast","oven","magnetron","printer","printer3d","fan","airco","radio","boiler"]],["Media",["play","pause","next","prev","volume","volumeMute","shuffle","repeat","repeatOne","search","speakers","music"]],["Afval",["bin","binWheeled","calendar"]],["Verwarming en klimaat",["floorHeating","heatPump","circulatiepomp","boiler","thermo","homeThermo","celsius","gas","pressure","refill"]],["Auto en tanken",["car","petrol","diesel","gas","fuelStation","raceCar","plug"]],["Weer",["sun","cloud","cloudSun","rain","snow","fog","wind","drop","uv","sunrise","sunset","thermo"]],["Weermetingen",["humidity","lux","windSpeed","rainfall","weatherCode","forecast","weatherStation","rainRadar","pollenradar","uv","pressure","thermo"]],["Status",["shield","lock","lockOpen","key","wifi","smoke","smokeDetector","co","warning","check","handmatig","close","clock","gaugeArrow","bell","pressure","refill","sleep","siren","sirenOff","homeStatus"]],["Cijfers",["een","twee","drie","vier","vijf","zes","zeven","acht","negen","tien"]],["Sport en vrije tijd",["football","sports","dumbbell","raceCar","beach"]],["Overig",["star","moon","leaf","cog","qr","keuzelijst","dots","plus","minus","chevronRight","chevronDown","question","pencil","domotitech"]]],Ar={house:["huis","woning","thuis","home","hal","gang","entree","overzicht"],floorB:["begane grond","beneden","vloer","verdieping","etage","ground floor"],floor1:["1e verdieping","eerste","boven","vloer","etage","first floor"],floor2:["2e verdieping","tweede","zolder","vloer","etage","second floor"],garage:["garage","schuur","carport","berging"],door:["deur","voordeur","achterdeur","toegang","door","opening"],window:["raam","venster","ruit","window","kozijn"],stairs:["trap","overloop","traphal","stairs","treden","boven"],grid:["raster","kamers","overzicht","tegels","menu","grid","apps"],floorHeating:["vloerverwarming","vloer","verwarming","vloerverwarmingg","leidingen","cv","warm","underfloor","floor heating"],heatPump:["warmtepomp","pomp","buitenunit","heat pump","verwarming","koelen","airco","hybride"],qr:["qr","qr-code","qrcode","code","scan","wifi code","streepjescode","gast"],siren:["sirene","alarm","alarmsirene","geluid","brandalarm","siren","aan"],sirenOff:["sirene uit","alarm uit","sirene uitzetten","stil","dempen","siren off","uitschakelen"],petrol:["benzine","tanken","brandstof","pomp","benzinepomp","petrol","euro 95","brandstofpomp"],diesel:["diesel","tanken","brandstof","pomp","dieselpomp","druppel"],gas:["gas","aardgas","vlam","gasverbruik","gasmeter","brander","gaskachel"],fuelStation:["tankstation","tanken","pompstation","benzinestation","luifel","fuel station","brandstof"],homeThermo:["klimaat","klimaat in de woning","woning thermometer","binnentemperatuur","temperatuur","huis thermometer","verwarming","thermostaat"],homeStatus:["woning status","status","huis status","alles in orde","huisstatus","woning","controle","check"],lounge:["lounge","fauteuil","stoel","zithoek","loungestoel","zitkamer","relax"],dumbbell:["sportschool","halter","gewicht","fitness","gym","dumbbell","krachttraining","sporten"],storage:["opslag","dozen","berging","zolder","kelder","opbergen","voorraad","storage","kast"],celsius:["celsius","graden","temperatuur","graad","c","thermometer","warmte"],domotitech:["domotitech","logo","merk","website","domoti","domotica"],beach:["strand","zee","golven","kust","vakantie","zon en zee","beach","zomer","water"],sleep:["slapen","zzz","slaapstand","nachtmodus","slaap","sleep","rust","nacht","welterusten","dutje"],boiler:["ketel","cv","cv-ketel","boiler","verwarming","ketelstatus","boiler status","vlam","warmte"],pressure:["druk","bar","waterdruk","manometer","meter","pressure","keteldruk","spanning"],bell:["notificatie","melding","bel","meldingen","alert","waarschuwing","notification","bericht"],refill:["bijvullen","water bijvullen","vullen","water","peil","niveau","reservoir","refill","aanvullen"],football:["voetbal","bal","voetballen","sport","wedstrijd","football","soccer","eredivisie"],sports:["sport","sporten","sportief","bewegen","tennis","racket","wedstrijd","sports","verschillende sporten"],raceCar:["formule 1","f1","racewagen","raceauto","autosport","race","grand prix","verstappen","circuit"],cctv:["camera","bewakingscamera","cctv","beveiliging","toezicht","surveillance","buitencamera","beveiligingscamera"],bed:["slaapkamer","bed","slapen","slaap","sleep","bedroom","nacht","welterusten","logeerkamer"],bedDouble:["tweepersoonsbed","2 persoonsbed","bed","slaapkamer","slapen","sleep","double bed","twee personen","ouderslaapkamer","nacht"],wardrobe:["kledingkast","kast","garderobe","kleding","wardrobe","closet","inloopkast","slaapkamer"],hanger:["kleerhanger","hanger","kleding","kleren","garderobe","wasgoed","kledingkast","outfit"],sofa:["woonkamer","bank","sofa","zithoek","salon","living","livingroom","couch"],kitchen:["keuken","koken","pan","kitchen","cooking","eten","fornuis","kookplaat"],shower:["badkamer","douche","shower","bad","bathroom","wassen","sanitair"],toilet:["wc","toilet","sanitair","badkamer","restroom","plee"],desk:["kantoor","werkkamer","bureau","desk","office","computer","monitor","beeldscherm"],tree:["tuin","boom","buiten","garden","tree","achtertuin","voortuin","groen","natuur"],parasol:["terras","buiten","parasol","tuin","balkon","veranda","zonnescherm","outdoor","patio"],fence:["erf","hek","buiten","tuin","schutting","oprit","poort","fence","omheining"],shutter:["rolluik","gordijn","zonwering","shutter","screen","jaloezie","dicht","gesloten","cover"],shutterOpen:["rolluik open","gordijn open","zonwering","shutter","cover","omhoog"],awning:["zonnescherm","luifel","markies","awning","terras","zonwering","buiten"],garageOpen:["garagedeur open","garage","deur open","omhoog","geopend"],garageClosed:["garagedeur dicht","garage","deur dicht","gesloten","omlaag"],arrowUp:["omhoog","pijl omhoog","open","up","boven","openen","stijgen"],arrowDown:["omlaag","pijl omlaag","dicht","down","beneden","sluiten","dalen"],stop:["stop","stoppen","halt","vierkant","square"],bulb:["lamp","licht","verlichting","peer","light","bulb","spot","schemerlamp"],bulbGroup:["lampen","lichtgroep","verlichting","groep","lights","alle lampen"],switchOn:["schakelaar","knop","switch","aan uit","toggle","aanuit"],power:["aan uit","power","stroom","uitknop","aanknop","standby"],plug:["stopcontact","stekker","plug","socket","outlet","smart plug"],bolt:["stroom","energie","bliksem","elektriciteit","verbruik","power","energy","watt","kwh"],battery:["batterij","accu","battery","lading","opladen","percentage"],person:["persoon","iemand","gebruiker","person","wie","profiel","aanwezig"],people:["personen","mensen","gezin","iedereen","familie","people","gasten"],away:["weg","afwezig","niet thuis","away","vertrokken","uit huis"],dier:["dier","huisdier","hond","kat","poot","pootafdruk","pet","animal","beest"],homeLeave:["woning verlaten","verlaten","weggaan","vertrekken","huis uit","afsluiten","de deur uit","leave","exit","weg","huis"],tv:["televisie","tv","scherm","kijken","netflix","mediaspeler","chromecast"],speaker:["speaker","luidspreker","boxje","geluid","audio","sonos"],camera:["camera","beveiliging","bewaking","cctv","deurbel","opname","beeld"],car:["auto","wagen","car","laadpaal","opladen","voertuig","oprit","buiten"],washer:["wasmachine","was","wassen","washer","wasdroger","droger","laundry","wasruimte"],dishwasher:["vaatwasser","afwas","vaat","dishwasher","afwasmachine"],van:["bus","bedrijfsbus","bestelbus","bestelwagen","busje","transit","auto","van","camper","werkbus"],handmatig:["handmatig","hand","zelf","met de hand","bedienen","tikken","manueel","handbediening","override"],koelkast:["koelkast","koeling","vriezer","diepvries","fridge","keuken","vriescombinatie"],oven:["oven","bakoven","fornuis","keuken","bakken","stoomoven"],magnetron:["magnetron","microgolf","opwarmen","keuken","combimagnetron"],eettafel:["eettafel","tafel","eten","eetkamer","diner","keukentafel","stoelen"],veranda:["veranda","overkapping","terrasoverkapping","afdak","carport","buiten","tuinkamer"],pollenradar:["pollen","pollenradar","hooikoorts","allergie","stuifmeel","radar","verwachting"],gras:["gras","graspollen","grasmaaier","gazon","hooikoorts","pollen","tuin"],kruiden:["kruiden","kruidpollen","bijvoet","onkruid","plant","pollen","hooikoorts"],circulatiepomp:["circulatiepomp","pomp","cv","cv-pomp","verwarming","circulatie","vloerverwarming"],printer:["printer","printen","papier","print"],printer3d:["3d printer","3d-printer","bambu","prusa","filament","printer","nozzle","printen"],fan:["ventilator","fan","ventilatie","afzuiging","wtw","luchtverversing","koelen"],airco:["airco","airconditioning","koeling","warmtepomp","klimaat","verwarming","hvac"],radio:["radio","zender","fm","stream","muziek","antenne"],play:["afspelen","play","start","spelen","muziek","starten"],pause:["pauze","pause","pauzeren","stil","onderbreken"],next:["volgende","next","verder","vooruit","overslaan","skip"],prev:["vorige","previous","terug","achteruit","prev"],volume:["volume","geluid","harder","luid","audio","sound"],volumeMute:["stil","mute","gedempt","geluid uit","dempen"],shuffle:["willekeurig","shuffle","husselen","door elkaar","random"],repeat:["herhalen","repeat","loop","opnieuw","herhaling"],repeatOne:["een herhalen","repeat one","herhalen","loop","dit nummer"],search:["zoeken","zoek","search","vergrootglas","vinden","opzoeken"],speakers:["speakers","groep","multiroom","luidsprekers","audio","koppelen"],music:["muziek","noot","music","nummer","liedje","spotify","audio"],bin:["afval","vuilnis","prullenbak","bak","container","waste","trash","kliko"],binWheeled:["kliko","container","afval","vuilnisbak","rolcontainer","ophaaldag","waste"],calendar:["agenda","kalender","datum","afspraak","planning","calendar","dag"],sun:["zon","zonnig","helder","sun","zonnepanelen","dag","weer","buiten"],cloud:["bewolkt","wolk","cloud","betrokken","grijs","weer"],cloudSun:["halfbewolkt","wolk","zon","weer","wisselend","partly cloudy"],rain:["regen","buien","nat","rain","neerslag","weer","paraplu"],snow:["sneeuw","winter","vorst","snow","koud","ijs","weer"],fog:["mist","nevel","fog","zicht","weer"],wind:["wind","waait","storm","bries","windkracht","weer"],drop:["druppel","vocht","luchtvochtigheid","water","regen","humidity","nat","lekkage"],uv:["uv","uv index","zon","straling","zonkracht","huid"],humidity:["vochtigheid","luchtvochtigheid","vocht","humidity","procent","rv","hygrometer","weer"],lux:["lux","lichtsterkte","helderheid","verlichtingssterkte","illuminance","lichtsensor","lichtmeter","lumen"],windSpeed:["windsnelheid","wind","windkracht","beaufort","anemometer","wind speed","km/u","storm","weer"],rainfall:["regen","neerslag","regenmeter","millimeter","mm","rainfall","buien","hoeveelheid","weer"],weatherCode:["weercode","code","weather code","weertype","conditie","weer"],forecast:["voorspelling","verwachting","forecast","vooruitzicht","morgen","weerbericht","weer"],weatherStation:["weerstation","station","meetstation","weather station","mast","anemometer","weer"],rainRadar:["buienradar","regenradar","radar","buien","neerslagradar","rain radar","weer"],sunrise:["zonsopkomst","opkomst","ochtend","sunrise","dageraad","vroeg"],sunset:["zonsondergang","ondergang","avond","sunset","schemer"],thermo:["temperatuur","thermometer","graden","warm","koud","thermostaat","klimaat","verwarming"],shield:["beveiliging","schild","alarm","veilig","bescherming","shield","security"],lock:["slot","op slot","vergrendeld","gesloten","lock","sleutel","dicht","beveiligd"],lockOpen:["slot open","ontgrendeld","geopend","unlock","los","open"],key:["sleutel","key","toegang","code","wachtwoord","slot"],wifi:["wifi","netwerk","internet","verbinding","router","signaal","wlan"],smoke:["rookmelder","rook","brand","smoke","melder","vuur","alarm"],smokeDetector:["rookmelder","melder","rook","brand","smoke detector","detector","plafond","alarm"],co:["koolmonoxide","co","gas","melder","cv","kachel","carbon monoxide","vergiftiging"],warning:["waarschuwing","let op","attentie","warning","uitroepteken","storing","probleem"],check:["goed","vinkje","in orde","klaar","check","gelukt"],close:["sluiten","kruis","dicht","annuleren","close","weg"],clock:["klok","tijd","uur","wekker","timer","clock","wanneer"],gaugeArrow:["meter","wijzer","stand","gauge","niveau","druk","snelheid"],een:["1","een","eerste","one"],twee:["2","twee","tweede","two"],drie:["3","drie","derde","three"],vier:["4","vier","vierde","four"],vijf:["5","vijf","vijfde","five"],zes:["6","zes","zesde","six"],zeven:["7","zeven","zevende","seven"],acht:["8","acht","achtste","eight"],negen:["9","negen","negende","nine"],tien:["10","tien","tiende","ten"],star:["ster","favoriet","star","belangrijk","voorkeur","top"],moon:["maan","nacht","slapen","donker","moon","nachtstand","avond"],leaf:["blad","groen","eco","duurzaam","plant","natuur","besparen","tuin"],keuzelijst:["keuzelijst","keuze","lijst","modus","stand","programma","dropdown","select","kiezen","opties"],cog:["instellingen","tandwiel","beheer","settings","configuratie","opties","systeem"],dots:["meer","drie puntjes","menu","opties","extra","overig","more"],plus:["plus","meer","erbij","toevoegen","hoger","omhoog","add"],minus:["min","minder","eraf","lager","verwijderen","omlaag"],chevronRight:["pijl rechts","verder","volgende","chevron","open","meer"],chevronDown:["pijl omlaag","uitklappen","openklappen","chevron","meer","dropdown"],question:["vraagteken","onbekend","hulp","help","vraag","geen idee"],pencil:["potlood","bewerken","wijzigen","aanpassen","edit","pen","instellen"]},ea=a=>String(a??"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();function ld(a,e){let t=[...(Ar[a]??[]).map(ea),ea(a)],n=0;for(let i=0;i<t.length;i++){let r=t[i];if(!r)continue;let o=0;for(let s of[r,...r.split(" ")])s===e?o=Math.max(o,3):s.startsWith(e)?o=Math.max(o,2):s.includes(e)&&(o=Math.max(o,1));if(o&&(n=Math.max(n,o+.5/(1+i))),n>=3.5)break}return n}function dd(a,e){let t=0;for(let n of e){let i=ld(a,n);if(!i)return 0;t+=i}return t}var _e=a=>Ar[a]?.[0]??a;function cd(a=Vt){let e=[];for(let[,t]of a)for(let n of t)e.includes(n)||e.push(n);return e}function Mr(a,e=Vt){let t=ea(a).split(" ").filter(Boolean);if(!t.length)return e;let n=[];for(let i of cd(e)){let r=dd(i,t);r&&n.push({sleutel:i,score:r})}return n.sort((i,r)=>r.score-i.score||_e(i.sleutel).localeCompare(_e(r.sleutel))),[[`${n.length} gevonden`,n.map(i=>i.sleutel)]]}var pd=`
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
`,ta=null,Sr=a=>a.map(([e,t])=>`
      <div class="group">
        <h4>${e}</h4>
        <div class="grid">
          ${t.map(n=>`<button type="button" class="opt" data-icon="${n}" title="${_e(n)} (${n})" aria-pressed="false">${A[n]??""}<span class="naam">${_e(n)}</span></button>`).join("")}
        </div>
      </div>`).join(""),na=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),ta=ta??[F(pd)],this.shadowRoot.adoptedStyleSheets=ta,this.value_="",this.vraag_="",this.label="Icoon",this.fallback="question",this.auto=!0}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}connectedCallback(){this.built_||(this.built_=!0,this.build_())}build_(){this.shadowRoot.innerHTML=`
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
          <div class="groepen">${Sr(Vt)}</div>
          <div class="mdi">
            <label for="mdi">Of Home Assistant-icoon</label>
            <input id="mdi" type="text" placeholder="mdi:washing-machine" spellcheck="false" />
            <button type="button" class="clear">Wissen</button>
          </div>
        </div>
      </div>`,this.$(".current").addEventListener("click",()=>{let n=this.toggleAttribute("open");this.$(".current").setAttribute("aria-expanded",String(n)),n&&requestAnimationFrame(()=>this.$("#zoek").focus())});let e=this.$("#zoek");e.addEventListener("input",()=>this.zoek_(e.value)),e.addEventListener("keydown",n=>{if(n.key==="Escape"){n.stopPropagation(),this.zoek_(""),e.value="";return}if(n.key!=="Enter")return;let i=this.shadowRoot.querySelectorAll(".opt");i.length===1&&(n.preventDefault(),this.emit_(i[0].dataset.icon))}),this.$(".wis").addEventListener("click",()=>{e.value="",this.zoek_(""),e.focus()}),this.$(".groepen").addEventListener("click",n=>{let i=n.target.closest?.(".opt");i&&this.emit_(i.dataset.icon)});let t=this.$("#mdi");t.addEventListener("change",()=>this.emit_(t.value.trim())),this.$(".clear").addEventListener("click",()=>this.emit_("")),this.paint_()}zoek_(e){this.vraag_=e??"",this.toggleAttribute("zoekt",!!this.vraag_.trim());let t=Mr(this.vraag_),n=this.$(".groepen"),i=t.length===1&&!t[0][1].length;n.innerHTML=i?`<div class="niets">Geen icoon gevonden voor "${this.vraag_.trim()}".<br>Een <code>mdi:</code>-naam hieronder werkt altijd.</div>`:Sr(t),n.scrollTop=0,this.markeer_()}markeer_(){for(let e of this.shadowRoot.querySelectorAll(".opt"))e.setAttribute("aria-pressed",String(e.dataset.icon===this.value_))}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Icoon";let e=this.value_,t=e||this.fallback||"question";this.$(".preview").innerHTML=v(t,this.fallback),this.$(".who b").textContent=e?e.includes(":")?e:_e(e):this.auto?"Automatisch":"Kies een icoon",this.$(".who small").textContent=e?e.includes(":")?"Home Assistant-icoon":`DomotiApp-icoon -- ${e}`:this.auto?"Past zich aan de entiteit aan":"Nog niets gekozen",this.markeer_();let n=this.$("#mdi");if(this.shadowRoot.activeElement===n)return;let i=e&&e.includes(":")?e:"";n.value!==i&&(n.value=i)}emit_(e){this.value_=e,this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};O("dac-icon-picker",na);var hd=/^(#[0-9a-f]{3,8}|var\(--[\w-]+\)|rgba?\([^)]*\))$/i,ud=`
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
`,aa=null,ia=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),aa=aa??[F(ud)],this.shadowRoot.adoptedStyleSheets=aa,this.value_="",this.label="Kleur"}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}set compact(e){this.toggleAttribute("compact",!!e)}get compact(){return this.hasAttribute("compact")}connectedCallback(){this.built_||(this.built_=!0,this.build_())}kleur_(){return $[this.value_]??this.value_}build_(){this.shadowRoot.innerHTML=`
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
      </div>`;let e=this.$('input[type="color"]');e.addEventListener("input",()=>this.emit_(e.value));let t=this.$("#vrij");t.addEventListener("change",()=>{let n=t.value.trim();if(!n){this.emit_("");return}let i=hd.test(n);t.setAttribute("aria-invalid",String(!i)),i&&this.emit_(n)}),this.$(".wissen").addEventListener("click",()=>this.emit_("")),this.paint_()}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Kleur";let e=!!this.value_,t=this.$(".sw");t.setAttribute("aria-pressed",String(e)),t.classList.toggle("leeg",!e),t.style.setProperty("--c",e?this.kleur_():"transparent"),t.title=e?`Kleur: ${Er[this.value_]??this.value_}`:"Kleur kiezen",/^#[0-9a-f]{6}$/i.test(this.kleur_())&&(this.$('input[type="color"]').value=this.kleur_()),this.$(".wissen").hidden=!e;let n=this.$("#vrij");if(this.shadowRoot.activeElement!==n){let i=this.value_ in $?"":this.value_;n.value!==i&&(n.value=i),n.setAttribute("aria-invalid","false")}}emit_(e){this.value_=e??"",this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.value_},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};O("dac-tone-picker",ia);var f={entity:a=>({entity:a?{domain:a}:{}}),text:()=>({text:{}}),multiline:()=>({text:{multiline:!0}}),bool:()=>({boolean:{}}),number:(a,e,t=1)=>({number:{min:a,max:e,step:t,mode:"box"}}),select:a=>({select:{mode:"dropdown",options:a}}),action:(a="more-info")=>({ui_action:{default_action:a}})},ra=(...a)=>({type:"grid",name:"",schema:a}),oa=(a,e,t,n=!1)=>({type:"expandable",name:"",title:a,icon:e,expanded:n,schema:t}),md=[{name:"bare",selector:f.bool()}],gd={bare:"Haalt de vulling en de schaduw onder de kaart weg. De rand blijft staan, zodat de kaart nog een vorm heeft op een dashboard zonder vlakken."},C=class extends HTMLElement{constructor(){super(),this.config_={},this.built_=!1}setConfig(e){this.config_={...this.defaults(),...e},this.render_()}defaults(){return{}}set hass(e){this.hass_=e,this.form_&&(this.form_.hass=e);for(let t of this.pickers_??[])t.hass=e;this.render_()}get hass(){return this.hass_}connectedCallback(){this.render_()}schema(){return[]}gedeeldeVelden(){return md}volledigSchema_(){return[...this.schema(),...this.gedeeldeVelden()]}pickers(){return[]}label(e){return e.type==="expandable"?e.title??"":fd[e.name]??e.name}helper(){}async render_(){if(!this.hass_||!this.config_)return;if(this.built_){this.sync_();return}this.built_=!0,await customElements.whenDefined("ha-form"),this.replaceChildren(),this.pickers_=[];let e=this.pickers();this.pickerSig_=e.map(o=>o.key).join("|");let t=o=>{let s=document.createElement("div");return s.style.cssText=`display:flex;flex-direction:column;gap:12px;${o}`,s},n=t("margin-bottom:16px"),i=t("margin-top:16px");for(let o of e){let s=document.createElement({tone:"dac-tone-picker",foto:"dac-foto-picker"}[o.kind]??"dac-icon-picker");s.label=o.label,s.fallback=o.fallback,o.auto===!1&&(s.auto=!1),o.statuses===!1&&(s.statuses=!1),o.compact&&(s.compact=!0),s.hass=this.hass_,s.value=this.config_[o.key],s.addEventListener("value-changed",l=>{l.stopPropagation(),this.patch_({[o.key]:l.detail.value})}),this.pickers_.push(s),s.dataset.key=o.key,(o.after?i:n).appendChild(s)}n.children.length&&this.appendChild(n);let r=document.createElement("ha-form");r.hass=this.hass_,r.data=this.config_,r.schema=this.volledigSchema_(),r.computeLabel=o=>this.label(o),r.computeHelper=o=>this.helper(o)??gd[o.name],r.addEventListener("value-changed",o=>{o.stopPropagation(),this.patch_(o.detail.value,!0)}),this.form_=r,this.appendChild(r),i.children.length&&this.appendChild(i)}sync_(){let e=this.pickers().map(t=>t.key).join("|");if(this.pickerSig_!==void 0&&this.pickerSig_!==e){this.built_=!1,this.form_=null,this.render_();return}this.form_&&(this.form_.hass=this.hass_,this.form_.schema=this.volledigSchema_(),this.form_.data=this.config_);for(let t of this.pickers_??[])t.hass=this.hass_,t.value=this.config_[t.dataset.key]}patch_(e,t=!1){let n=t?{...e}:{...this.config_,...e};this.config_.type&&(n.type=this.config_.type);for(let[i,r]of Object.entries(n))(r===""||r===void 0||r===null)&&delete n[i];this.config_=n,this.sync_(),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.serialize(n)},bubbles:!0,composed:!0}))}serialize(e){return e}},fd={entity:"Entiteit",entities:"Entiteiten",name:"Naam",icon:"Icoon",tone:"Kleur",secondary:"Tweede regel",layout:"Vorm",tap_action:"Tikken",hold_action:"Vasthouden",double_tap_action:"Dubbeltikken",show_state:"Status tonen",show_name:"Naam tonen",show_icon:"Icoon tonen",fill:"Vullen",collapsible:"Inklapbaar",title:"Titel",subtitle:"Ondertitel",weather:"Weerentiteit",sun:"Zon-entiteit",person:"Persoon",persons:"Personen",covers:"Rolluiken",lights:"Lampen",sensors:"Sensoren",greeting:"Begroeting",show_clock:"Klok tonen",show_weather:"Weer tonen",show_chips:"Weerdetails tonen",compact:"Compact",columns:"Kolommen",group:"Groepsregel tonen",invert:"Open en dicht omdraaien",label:"Label",color:"Kleur",date_format:"Datumnotatie",bare:"Achtergrond weglaten"};function bd(a=new Date){let e=a.getHours();return e<6?"Goedenacht":e<12?"Goedemorgen":e<18?"Goedemiddag":"Goedenavond"}var vd=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],kd=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],sa={humidity:{icon:"drop",tone:"water",label:"Luchtvochtigheid"},wind:{icon:"wind",tone:"neutral",label:"Wind"},uv:{icon:"uv",tone:"solar",label:"UV-index"},precipitation:{icon:"rain",tone:"water",label:"Neerslag"},pressure:{icon:"gaugeArrow",tone:"neutral",label:"Luchtdruk"},sunrise:{icon:"sunrise",tone:"warn",label:"Zonsopkomst"},sunset:{icon:"sunset",tone:"warn",label:"Zonsondergang"}},xd=["humidity","wind","uv","precipitation","sunset"],_d=a=>a==null||Number.isNaN(+a)?"":["N","NO","O","ZO","Z","ZW","W","NW"][Math.round(+a/45)%8],Pt=class extends M{validate(e){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768,...e}}watched(){let e=this.config;return[e.weather,e.weather_uv,e.sun,e.precipitation_entity].filter(Boolean)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.show_rule===!1&&this.setAttribute("no-rule",""),`
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
      </div>`}wire(){let e=()=>{let n=6e4-Date.now()%6e4+50;this.timer_=setTimeout(()=>{this.paintClock_(),e()},n)};e(),this.teardown_.push(()=>clearTimeout(this.timer_));let t=Number(this.config.hide_below)||0;if(t>0){let n=matchMedia(`(max-width: ${t-1}px)`),i=()=>this.toggleAttribute("narrow",n.matches);i(),n.addEventListener("change",i),this.teardown_.push(()=>n.removeEventListener("change",i))}}paintClock_(){let e=new Date,t=this.config.name??this.hass?.user?.name??"",n=bd(e);this.$(".hello").innerHTML=t?`${n}, <b>${t}</b>`:n,this.text(".date",`${vd[e.getDay()]} ${e.getDate()} ${kd[e.getMonth()]}`);let i=this.$(".clock");i&&this.text(i,e.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"}))}paint(){this.paintClock_();let e=this.config,t=b(this.hass,e.weather),n=Y(this.hass,e.weather),i=this.$(".now");if(i&&t){let l=lt(t.state);i.style.setProperty("--wtone",U(e.tone,"water"));let d=this.hass?.config?.unit_system?.temperature??"\xB0C";this.$(".temp").innerHTML=n.temperature!=null?`${q(this.hass,n.temperature,0)}<span>${d}</span>`:"--";let c=i.querySelector(".ic");c.dataset.icon!==l&&(c.dataset.icon=l,c.innerHTML=v(l,"cloud")),this.text(i.querySelector(".cond"),J(this.hass,t))}let r=this.$(".chips");if(!r)return;let o=xd.map(l=>this.chip_(l,n)).filter(Boolean),s=o.map(l=>`${l.key}${l.value}`).join("|");r.dataset.sig!==s&&(r.dataset.sig=s,r.innerHTML=o.map(l=>`<span class="chip2" style="--tone:${U(sa[l.key].tone)}" title="${sa[l.key].label}">
             ${A[sa[l.key].icon]??""}${l.value}
           </span>`).join(""))}chip_(e,t){let n=this.config;switch(e){case"humidity":return t.humidity!=null?{key:e,value:`${Math.round(t.humidity)}%`}:null;case"wind":{if(t.wind_speed==null)return null;let i=this.hass?.config?.unit_system?.wind_speed??"km/h",r=_d(t.wind_bearing);return{key:e,value:`${q(this.hass,t.wind_speed,0)} ${i}${r?` ${r}`:""}`}}case"uv":{let r=Y(this.hass,n.weather_uv).uv_index??t.uv_index??(n.weather_uv?Number(b(this.hass,n.weather_uv)?.state):null);return r!=null&&!Number.isNaN(+r)?{key:e,value:`UV ${q(this.hass,r,1)}`}:null}case"precipitation":{let i=b(this.hass,n.precipitation_entity);if(i){let r=Number(i.state);if(Number.isNaN(r))return null;let o=i.attributes.unit_of_measurement??"mm";return{key:e,value:`${q(this.hass,r,1)} ${o}`}}return t.precipitation!=null&&!Number.isNaN(+t.precipitation)?{key:e,value:`${q(this.hass,t.precipitation,1)} mm`}:null}case"pressure":return t.pressure!=null?{key:e,value:`${q(this.hass,t.pressure,0)} ${t.pressure_unit??"hPa"}`}:null;case"sunset":case"sunrise":{let r=b(this.hass,n.sun)?.attributes?.[e==="sunset"?"next_setting":"next_rising"];if(!r)return null;let o=new Date(r);return Number.isNaN(+o)?null:{key:e,value:o.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"})}}default:return null}}getCardSize(){return 2}getGridOptions(){return{columns:"full",rows:2,min_rows:2,max_rows:2}}static getConfigElement(){return document.createElement("domotiapp-header-card-editor")}static getStubConfig(e){return{weather:Object.keys(e?.states??{}).find(n=>n.startsWith("weather.")),sun:"sun.sun"}}};y(Pt,"css",`
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
  `);var la=class extends C{defaults(){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768}}schema(){return[ra({name:"weather",selector:f.entity("weather")},{name:"weather_uv",selector:{entity:{domain:["weather","sensor"]}}}),ra({name:"sun",selector:f.entity("sun")},{name:"precipitation_entity",selector:f.entity("sensor")}),{name:"name",selector:f.text()},{name:"hide_below",selector:f.number(0,1400,8)}]}label(e){return{weather:"Weer (temperatuur, wind)",weather_uv:"Tweede weerbron (UV-index)",precipitation_entity:"Neerslagsensor",show_rule:"Accentlijn tonen",hide_below:"Verbergen onder breedte (px)",name:"Naam"}[e.name]??super.label(e)}helper(e){if(e.name==="weather_uv")return"Alleen voor de UV-index. Handig als je hoofdbron die niet meelevert.";if(e.name==="precipitation_entity")return"Een sensor in mm of mm/h, bijvoorbeeld neerslagintensiteit of regen laatste uur.";if(e.name==="hide_below")return"768 verbergt de header op telefoons en houdt hem op tablets en desktops. 0 zet het uit.";if(e.name==="name")return"Leeg laten voor de naam van de ingelogde gebruiker."}};H("domotiapp-header-card-editor",la);N("domotiapp-header-card",Pt,{name:"DomotiApp Header",description:"Smalle strip met begroeting, weer en klok. Verbergt zichzelf op telefoons."});var Bt=class extends M{validate(e){return{icon:"",tone:"accent",line:!0,...e}}watched(){return this.config.secondary_entity?[this.config.secondary_entity]:[]}template(){let e=this.config,t=e.icon!==null&&e.icon!==!1;return t||this.setAttribute("no-icon",""),`
      <div class="sep" style="--tone:${U(e.tone)}">
        ${t?`<span class="chip">${v(e.icon,"star")}</span>`:""}
        <h3></h3>
        ${e.line===!1?"":'<span class="rule"></span>'}
        <span class="sub"><span class="si"></span><span class="sv"></span></span>
      </div>`}paint(){this.text("h3",this.config.name??"");let e=this.$(".sub");if(!e)return;let t=b(this.hass,this.config.secondary_entity),n=e.querySelector(".si"),i=e.querySelector(".sv");if(!t){i.textContent="",n.innerHTML="";return}let r=this.config.secondary_icon??"";n.dataset.icon!==r&&(n.dataset.icon=r,n.innerHTML=r?v(r):"");let o=t.attributes.unit_of_measurement;i.textContent=o?`${t.state} ${o}`:t.attributes.current_temperature!=null?`${t.attributes.current_temperature} \xB0C`:J(this.hass,t)}getCardSize(){return 1}getGridOptions(){return{columns:"full",rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-separator-card-editor")}static getStubConfig(){return{name:"Nieuwe sectie",icon:"house",tone:"accent"}}};y(Bt,"css",`
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
  `);var da=class extends C{defaults(){return{line:!0,tone:"accent"}}gedeeldeVelden(){return[]}pickers(){return[{key:"icon",kind:"icon",label:"Icoon links",fallback:"star",auto:!1},{key:"secondary_icon",kind:"icon",label:"Icoon bij de waarde rechts",auto:!1}]}schema(){return[{name:"name",selector:f.text()},{name:"line",selector:f.bool()},{name:"secondary_entity",selector:f.entity()}]}label(e){return{line:"Lijn tonen",secondary_entity:"Waarde rechts (optioneel)"}[e.name]??super.label(e)}helper(e){if(e.name==="secondary_entity")return"Toont de status van deze entiteit rechts van de lijn, bijvoorbeeld een temperatuur of een aantal."}};H("domotiapp-separator-card-editor",da);N("domotiapp-separator-card",Bt,{name:"DomotiApp Separator",description:"Sectiekop met icoon en vervagende lijn."});var ca=(a,e,t)=>Math.min(t,Math.max(e,a));function we(a,e){let t=e.min??0,n=e.max??100,i=e.step??1,r=!1,o=m=>{let k=a.getBoundingClientRect();if(!k.width)return t;let x=ca((m-k.left)/k.width,0,1),z=t+x*(n-t);return ca(Math.round(z/i)*i,t,n)},s=m=>{try{a.setPointerCapture?.(m)}catch{}},l=m=>{try{a.hasPointerCapture?.(m)&&a.releasePointerCapture(m)}catch{}},d=m=>{e.disabled?.()||m.button!=null&&m.button!==0||(r=!0,s(m.pointerId),a.classList.add("dragging"),e.onInput(o(m.clientX)),m.preventDefault())},c=m=>{r&&(e.onInput(o(m.clientX)),m.preventDefault())},p=m=>{r&&(r=!1,l(m.pointerId),a.classList.remove("dragging"),e.onCommit(o(m.clientX)))},h=m=>{r&&(r=!1,l(m?.pointerId),a.classList.remove("dragging"),e.onInput(e.value()))},g=m=>{if(e.disabled?.())return;let k=(n-t)/10,x={ArrowLeft:-i,ArrowDown:-i,ArrowRight:i,ArrowUp:i,PageDown:-k,PageUp:k,Home:-1/0,End:1/0};if(!(m.key in x))return;m.preventDefault();let z=e.value(),_=ca(x[m.key]===-1/0?t:x[m.key]===1/0?n:z+x[m.key],t,n);e.onInput(_),e.onCommit(_)};return a.addEventListener("pointerdown",d),a.addEventListener("pointermove",c),a.addEventListener("pointerup",p),a.addEventListener("pointercancel",h),a.addEventListener("keydown",g),()=>{a.removeEventListener("pointerdown",d),a.removeEventListener("pointermove",c),a.removeEventListener("pointerup",p),a.removeEventListener("pointercancel",h),a.removeEventListener("keydown",g)}}var le=(a="")=>`
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
`;var wd=new Set(["brightness","color_temp","hs","rgb","rgbw","rgbww","xy","white"]),yd=new Set(["hs","rgb","rgbw","rgbww","xy"]),ha=a=>a?.attributes?.supported_color_modes??[],zd=a=>ha(a).some(e=>wd.has(e)),Kt=a=>ha(a).some(e=>yd.has(e)),Gt=a=>ha(a).includes("color_temp"),Nr=a=>Math.max(1,Math.round((a??0)/255*100)),Ut=class extends M{validate(e){let t=e.entity??e.lights?.[0]??e.entities?.[0],n=typeof t=="string"?t:t?.entity;return n?{show_colour:!0,...e,entity:n}:{...e,[T]:"Kies een lamp."}}watched(){return[this.config.entity]}template(){return this.config.bare&&this.setAttribute("bare",""),`
      <div class="card surface">
        <div class="lamp" data-on="false" style="--tone:var(--dac-lit)">
          <button class="chip" type="button" aria-label="Aan of uit"></button>
          <span class="txt"><span class="nm"></span><span class="v tnum"></span></span>
          <span class="ctl" style="display:contents"></span>
        </div>
        <div class="colour" hidden></div>
      </div>`}wire(){let e=this.config.entity;this.teardown_.push(B(this.$(".chip"),{onTap:()=>this.hass.callService("light","toggle",{entity_id:e}),onHold:()=>V(this,e)})),this.on(this.$(".card"),"click",t=>{t.target.closest(".toggle")&&this.hass.callService("light","toggle",{entity_id:e})}),this.teardown_.push(R(this.$(".card"))),this.sliders_=new Map}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let i=we(e,n);this.sliders_.set(t,i),this.teardown_.push(i)}setSlider_(e,t,n=0,i=100){if(!e)return;let r=i>n?(t-n)/(i-n)*100:0;e.style.setProperty("--v",`${r}%`),e.setAttribute("aria-valuemin",String(n)),e.setAttribute("aria-valuemax",String(i)),e.setAttribute("aria-valuenow",String(t))}paint(){let e=this.config,t=b(this.hass,e.entity),n=ee(t),i=t?.state==="on",r=this.$(".lamp");r.dataset.on=String(i),r.classList.toggle("unavailable",n);let o=this.$(".chip"),s=e.icon||"bulb";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=v(s,"bulb")),this.text(".nm",E(this.hass,e.entity,e.name));let l=i?t?.attributes?.rgb_color:null;r.style.setProperty("--tone",l?`rgb(${l[0]},${l[1]},${l[2]})`:"var(--dac-lit)");let d=this.$(".ctl"),c=n?"none":zd(t)?"range":"toggle";if(d.dataset.kind!==c&&(d.dataset.kind=c,d.innerHTML=c==="range"?le("brightness"):c==="toggle"?'<button class="toggle" type="button" role="switch" aria-checked="false" aria-label="Aan of uit"></button>':"",this.sliders_.delete("brightness")),c==="range"){let p=d.querySelector(".slider");if(this.attach_(p,"brightness",{value:()=>t?.state==="on"?Nr(b(this.hass,e.entity)?.attributes?.brightness):0,onInput:h=>{this.setSlider_(p,h),this.text(".v",h===0?"Uit":`${h}%`)},onCommit:h=>{h===0?this.hass.callService("light","turn_off",{entity_id:e.entity}):this.hass.callService("light","turn_on",{entity_id:e.entity,brightness_pct:h})},disabled:()=>ee(b(this.hass,e.entity))}),!p.classList.contains("dragging")){let h=i?Nr(t.attributes.brightness):0;this.setSlider_(p,h),this.text(".v",i?`${h}%`:"Uit")}}else c==="toggle"?(d.querySelector(".toggle")?.setAttribute("aria-checked",String(i)),this.text(".v",i?"Aan":"Uit")):this.text(".v","Niet bereikbaar");this.paintColour_(t,i),D(this.$(".card"))}paintColour_(e,t){let n=this.$(".colour"),i=this.config.show_colour!==!1&&(Kt(e)||Gt(e));if(n.hidden=!(i&&t),!i)return;let r=`${Kt(e)?"c":""}${Gt(e)?"t":""}`;if(n.dataset.sig!==r){n.dataset.sig=r,n.innerHTML=(Kt(e)?`<span data-kind="hue" style="display:contents">${le("hue")}</span>`:"")+(Gt(e)?`<span data-kind="kelvin" style="display:contents">${le("kelvin")}</span>`:"");let d=n.querySelector(".slider.hue");d&&(d.dataset.strip="",d.style.setProperty("--strip","linear-gradient(90deg, hsl(0 90% 55%), hsl(60 90% 55%), hsl(120 90% 55%), hsl(180 90% 55%), hsl(240 90% 55%), hsl(300 90% 55%), hsl(360 90% 55%))"),d.setAttribute("aria-label","Kleur"));let c=n.querySelector(".slider.kelvin");c&&(c.dataset.strip="",c.style.setProperty("--strip","linear-gradient(90deg,#ffb15e,#ffd6a8,#fff5e8,#eaf1ff,#cbdcff)"),c.setAttribute("aria-label","Kleurtemperatuur")),this.sliders_.delete("hue"),this.sliders_.delete("kelvin")}if(!t)return;let o=this.config.entity,s=n.querySelector(".slider.hue");s&&(this.attach_(s,"hue",{min:0,max:360,value:()=>b(this.hass,o)?.attributes?.hs_color?.[0]??0,onInput:d=>this.setSlider_(s,d,0,360),onCommit:d=>{let c=b(this.hass,o)?.attributes?.hs_color?.[1]??100;this.hass.callService("light","turn_on",{entity_id:o,hs_color:[d,c]})}}),s.classList.contains("dragging")||this.setSlider_(s,Math.round(e.attributes.hs_color?.[0]??0),0,360));let l=n.querySelector(".slider.kelvin");if(l){let d=e.attributes.min_color_temp_kelvin??2e3,c=e.attributes.max_color_temp_kelvin??6500;if(this.attach_(l,"kelvin",{min:d,max:c,step:50,value:()=>b(this.hass,o)?.attributes?.color_temp_kelvin??d,onInput:p=>this.setSlider_(l,p,d,c),onCommit:p=>this.hass.callService("light","turn_on",{entity_id:o,color_temp_kelvin:p})}),!l.classList.contains("dragging")){let p=e.attributes.color_temp_kelvin;p!=null&&this.setSlider_(l,p,d,c)}}}getCardSize(){let e=b(this.hass,this.config?.entity);return e?.state==="on"&&(Kt(e)||Gt(e))?2:1}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",1)}}static getConfigElement(){return document.createElement("domotiapp-light-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("light."));return n?{entity:n}:{}}};y(Ut,"css",`
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
  `);var pa=class extends C{defaults(){return{show_colour:!0}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"bulb"}]}schema(){return[{name:"entity",selector:f.entity("light")},{name:"name",selector:f.text()},{name:"show_colour",selector:f.bool()}]}label(e){return{entity:"Lamp",name:"Naam (overschrijft die van de lamp)",show_colour:"Kleurstrips tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"E\xE9n lamp per kaart. Dimbaar krijgt een schuif, alleen schakelbaar een tuimelaar.";if(e.name==="show_colour")return"Kleur en kleurtemperatuur verschijnen zodra de lamp aan is. De kaart is dan twee rijen hoog."}};H("domotiapp-light-card-editor",pa);N("domotiapp-light-card",Ut,{name:"DomotiApp Verlichting",description:"E\xE9n lamp op \xE9\xE9n rasterrij: dimmen, kleur en kleurtemperatuur."});function Or(a){if(!a)return null;let e=Number(a.state);return Number.isFinite(e)?e:null}function jd(a){let e=a?.attributes?.hvac_action;return e||(a?.state==="off"?"off":a?.state==="cool"?"cooling":a?.state==="heat"?"idle":null)}var ua={heating:"var(--dac-solar)",cooling:"var(--dac-grid-in)",drying:"var(--dac-grid-in)",fan:"var(--dac-grid-in)"},ma={heating:"Verwarmt",cooling:"Koelt",drying:"Ontvochtigt",fan:"Ventileert",idle:"Uit",off:"Uit"},Wt=class extends M{validate(e){return e.entity||e.temperature||e.humidity?{...e}:{...e,[T]:"Kies een thermostaat, of een temperatuursensor."}}watched(){let e=this.config;return[e.entity,e.temperature,e.humidity].filter(Boolean)}step_(){let e=Y(this.hass,this.config.entity);return Number(this.config.step??e.target_temp_step)||.5}gestapeld_(){return this.config.layout==="gestapeld"}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.entity||this.setAttribute("readout",""),this.setAttribute("vorm",this.gestapeld_()?"gestapeld":"rij"),`
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
      </div>`}wire(){let e=this.config;this.teardown_.push(()=>clearTimeout(this.sendTimer_)),this.gestapeld_()&&this.teardown_.push(R(this.$(".card"))),this.teardown_.push(B(this.$(".chip"),{onTap:()=>V(this,e.entity||e.temperature||e.humidity)}));let t=this.$(".set");t&&t.querySelectorAll("button").forEach(n=>this.on(n,"click",()=>this.nudge_(Number(n.dataset.d))))}nudge_(e){let t=this.config,n=Y(this.hass,t.entity),i=this.step_(),r=Number(n.min_temp??5),o=Number(n.max_temp??35),s=this.pending_??Number(n.temperature);if(!Number.isFinite(s))return;let l=Math.min(o,Math.max(r,Math.round((s+e*i)/i)*i));this.pending_=l,this.paintTarget_(),clearTimeout(this.sendTimer_),this.sendTimer_=setTimeout(()=>{this.sendTimer_=null,this.hass.callService("climate","set_temperature",{entity_id:t.entity,temperature:this.pending_}),setTimeout(()=>{this.pending_=null,this.paint()},1500)},450)}paintTarget_(){let e=this.$(".target");if(!e)return;let t=Y(this.hass,this.config.entity),n=this.pending_??Number(t.temperature);e.classList.toggle("pending",this.pending_!=null),e.textContent=Number.isFinite(n)?`${q(this.hass,n,n%1?1:0)}\xB0`:"--"}paint(){let e=this.config,t=e.entity?b(this.hass,e.entity):null,n=e.entity?ee(t):!1;this.toggleAttribute("dead",n);let i=jd(t),r=e.tone?U(e.tone):ua[i]??"var(--dac-ink-3)";this.$(".card").style.setProperty("--tone",r),this.toggleAttribute("busy",!!ua[i]);let o=this.$(".chip"),s=e.icon||"thermo";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=v(s,"thermo")),o.style.setProperty("--tone",ua[i]?r:"var(--dac-ink-3)"),this.text(".nm",E(this.hass,e.entity||e.temperature||e.humidity,e.name));let l=e.temperature?Or(b(this.hass,e.temperature)):Number(Y(this.hass,e.entity).current_temperature),d=this.hass?.config?.unit_system?.temperature??"\xB0C";this.text(".temp",Number.isFinite(l)?`${q(this.hass,l,1)} ${d}`:"--");let c=e.humidity?Or(b(this.hass,e.humidity)):null,p=this.$(".hum");if(this.gestapeld_()){this.text(".temp",""),p.textContent=ma[i]??"";let g=this.$(".t-temp"),m=this.$(".t-hum");g.hidden=!Number.isFinite(l),m.hidden=c==null,g.hidden||(g.querySelector(".w").textContent=`${q(this.hass,l,1)} ${d}`),m.hidden||(m.querySelector(".w").textContent=`${q(this.hass,c,0)}%`)}else p.innerHTML=c==null?"":`${A.drop}${q(this.hass,c,0)}%`,this.text(".sep",c==null?"":"\xB7"),e.entity&&!e.humidity&&ma[i]&&i!=="idle"&&(this.text(".sep","\xB7"),p.textContent=ma[i]);this.paintTarget_();let h=this.$(".set");if(h){let g=Y(this.hass,e.entity),m=this.pending_??Number(g.temperature);h.querySelector('[data-d="-1"]').disabled=n||m<=Number(g.min_temp??5),h.querySelector('[data-d="1"]').disabled=n||m>=Number(g.max_temp??35)}this.gestapeld_()&&D(this.$(".card"))}getCardSize(){return this.gestapeld_()?3:1}getGridOptions(){return this.gestapeld_()?{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",this.config.entity?3:2)}:{columns:12,rows:1,min_columns:4,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-climate-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("climate."));return n?{entity:n}:{}}};y(Wt,"css",`
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
  `);var ga=class extends C{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"thermo"}]}schema(){return[{name:"entity",selector:f.entity("climate")},{name:"temperature",selector:{entity:{domain:"sensor",device_class:"temperature"}}},{name:"humidity",selector:{entity:{domain:"sensor",device_class:"humidity"}}},{name:"name",selector:f.text()},{name:"layout",selector:f.select([{value:"rij",label:"Rij (\xE9\xE9n rasterrij hoog)"},{value:"gestapeld",label:"Onder elkaar (past op een telefoon)"}])},{name:"step",selector:f.number(.1,5,.1)}]}label(e){return{entity:"Thermostaat (optioneel)",temperature:"Temperatuursensor (optioneel)",humidity:"Vochtigheidssensor (optioneel)",name:"Naam",layout:"Vorm",step:"Stap van de knoppen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Leeg laten voor een kaart die alleen meet. Met thermostaat komen de stelknoppen erbij.";if(e.name==="temperature")return"Wint van de meting van de thermostaat zelf. Handig als er een betere sensor in de kamer hangt.";if(e.name==="layout")return"Onder elkaar zet de metingen als twee tegels neer met de stelknop over de volle breedte eronder. Bedoeld voor een smalle kolom of een pop-up, waar de rij-vorm de naam en de meting samendrukt.";if(e.name==="step")return"Leeg laten volgt de thermostaat, en anders een halve graad."}};H("domotiapp-climate-card-editor",ga);N("domotiapp-climate-card",Wt,{name:"DomotiApp Klimaat",description:"Thermostaat, losse temperatuur- en vochtsensor, of allebei."});var Tr=({label:a="Aan of uit",cls:e=""}={})=>`<button class="toggle ${e}" type="button" role="switch" aria-checked="false" aria-label="${a}"><span class="knob"></span></button>`;function fa(a,e){if(!a)return;let t=String(!!e);a.getAttribute("aria-checked")!==t&&a.setAttribute("aria-checked",t)}function Dr(a,e){let t=a.querySelector(".knob"),n=!1,i=0,r=!1,o=!1,s=()=>{n=!1,a.classList.remove("dragging"),t?.style.removeProperty("--knob")},l=m=>{m!==e.value()&&(fa(a,m),e.set(m))},d=m=>{if(!e.disabled?.()&&!(m.button!=null&&m.button!==0)){m.stopPropagation(),n=!0,r=!1,o=!1,i=m.clientX,a.classList.add("dragging");try{a.setPointerCapture?.(m.pointerId)}catch{}}},c=m=>{if(!n)return;let k=m.clientX-i;Math.abs(k)>3&&(r=!0);let x=e.value()?22:0,z=Math.min(22,Math.max(0,x+k));t?.style.setProperty("--knob",`${z}px`)},p=m=>{if(!n)return;m.stopPropagation();let k=m.clientX-i,x=e.value()?22:0,z=Math.min(22,Math.max(0,x+k));s();try{a.hasPointerCapture?.(m.pointerId)&&a.releasePointerCapture(m.pointerId)}catch{}o=!0,l(r?z>22/2:!e.value())},h=()=>{n&&s()},g=m=>{if(m.stopPropagation(),m.preventDefault(),o){o=!1;return}e.disabled?.()||l(!e.value())};return a.addEventListener("pointerdown",d),a.addEventListener("pointermove",c),a.addEventListener("pointerup",p),a.addEventListener("pointercancel",h),a.addEventListener("click",g),()=>{a.removeEventListener("pointerdown",d),a.removeEventListener("pointermove",c),a.removeEventListener("pointerup",p),a.removeEventListener("pointercancel",h),a.removeEventListener("click",g)}}var Cr=`
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
`;var qt=a=>String(a??"").split(".")[0],Lr=new Set(["input_datetime","time","date","datetime"]),Hr=a=>Lr.has(qt(a)),de=a=>String(a).padStart(2,"0");function $d(a){let e=String(a??"");return/^\d{4}-\d{2}-\d{2}[ T]\d{1,2}:\d{2}/.test(e)?"datetime-local":/^\d{4}-\d{2}-\d{2}$/.test(e)?"date":/^\d{1,2}:\d{2}/.test(e)?"time":null}function ba(a){if(!a)return null;let e=qt(a.entity_id);if(e==="time")return"time";if(e==="date")return"date";if(e==="datetime")return"datetime-local";if(e!=="input_datetime")return null;let t=a.attributes??{};return typeof t.has_date=="boolean"||typeof t.has_time=="boolean"?t.has_date&&t.has_time?"datetime-local":t.has_date?"date":t.has_time?"time":null:$d(a.state)}var Ed=a=>`${a.getFullYear()}-${de(a.getMonth()+1)}-${de(a.getDate())}T${de(a.getHours())}:${de(a.getMinutes())}`;function Ad(a){let e=-a.getTimezoneOffset(),t=e<0?"-":"+",n=Math.abs(e);return`${t}${de(Math.floor(n/60))}:${de(n%60)}`}function Rr(a,e=ba(a)){if(!a||!e)return"";let t=String(a.state??"");if(!t||t==="unknown"||t==="unavailable")return"";if(e==="time"){let i=t.match(/^(\d{1,2}):(\d{2})/);return i?`${de(i[1])}:${i[2]}`:""}if(e==="date"){let i=t.match(/^(\d{4}-\d{2}-\d{2})$/);return i?i[1]:""}if(qt(a.entity_id)==="datetime"){let i=new Date(t);return Number.isNaN(+i)?"":Ed(i)}let n=t.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})/);return n?`${n[1]}T${de(n[2].split(":")[0])}:${n[2].split(":")[1]}`:""}function Ir(a,e,t){let n=qt(a),i=String(t??"");if(!i||!Lr.has(n)||!e)return null;if(e==="time"){let h=i.match(/^(\d{1,2}):(\d{2})/);if(!h)return null;let g=`${de(h[1])}:${h[2]}:00`;return n==="time"?["time","set_value",{entity_id:a,time:g}]:["input_datetime","set_datetime",{entity_id:a,time:g}]}if(e==="date")return/^\d{4}-\d{2}-\d{2}$/.test(i)?n==="date"?["date","set_value",{entity_id:a,date:i}]:["input_datetime","set_datetime",{entity_id:a,date:i}]:null;let r=i.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})/);if(!r)return null;let[,o,s,l,d,c]=r,p=`${de(d)}:${c}:00`;if(n==="datetime"){let h=Ad(new Date(+o,+s-1,+l,+d,+c));return["datetime","set_value",{entity_id:a,datetime:`${o}-${s}-${l}T${p}${h}`}]}return["input_datetime","set_datetime",{entity_id:a,datetime:`${o}-${s}-${l} ${p}`}]}var Vr=a=>String(a??"").split(".")[0],Pr=new Set(["input_select","select"]),va=a=>Pr.has(Vr(a));function Se(a){if(!a||!va(a.entity_id))return[];let e=a.attributes?.options;return Array.isArray(e)?e.filter(t=>typeof t=="string"&&t!==""):[]}function Ft(a,e=Se(a)){let t=String(a?.state??"");return!t||t==="unknown"||t==="unavailable"?"":e.includes(t)?t:""}function Zt(a,e,t=[]){let n=Vr(a),i=String(e??"");return!i||!Pr.has(n)||t.length&&!t.includes(i)?null:[n,"select_option",{entity_id:a,option:i}]}var Br={auto:"automatisch",automatic:"automatisch",eco:"eco",intensiv:"intensief",intensive:"intensief",kurz:"kort",quick:"snel",express:"snel",speed:"snel",glas:"glas",glass:"glas",delicate:"fijn",normal:"normaal",night:"nacht",silence:"stil",quiet:"stil",hygiene:"hygi\xEBne",hygienic:"hygi\xEBne",favorite:"favoriet",favourite:"favoriet",steam:"stoom",fresh:"fris",care:"verzorging",machinecare:"machineverzorging",machine:"machine",prerinse:"voorspoelen",rinse:"spoelen",presoak:"voorweken",soak:"weken",wash:"wassen",dry:"drogen",half:"half",load:"belading",mixed:"gemengd",maximum:"maximaal",cleaning:"reinigen",clean:"reinigen",pots:"pannen",chef:"chef",kitchen:"keuken",party:"feest",daily:"dagelijks",super:"super",turbo:"turbo",energy:"energie",saving:"zuinig",off:"uit",on:"aan",none:"geen",standby:"stand-by",ready:"gereed",pause:"pauze",stop:"stop",start:"start",finished:"klaar",low:"laag",medium:"midden",high:"hoog"},Md=/^.*program(?:me)?[_.\- ]/i,Sd=30,Nd=95;function Od(a){return String(a??"").replace(Md,"").replace(/([a-z])([A-Z])/g,"$1 $2").replace(/([a-zA-Z])(\d)/g,"$1 $2").replace(/(\d)([a-zA-Z])/g,"$1 $2").split(/[\s_.\-]+/).filter(Boolean)}function Td(a){let e=Od(a);if(!e.length)return"";let t=[];for(let i=0;i<e.length;i++){let r=e[i],o=r.toLowerCase();if(/^\d+$/.test(o)){let d=Number(o);t.push(d>=Sd&&d<=Nd?`${d} \xB0C`:o);continue}let s=e[i+1]?.toLowerCase(),l=s?Br[o+s]:void 0;if(l){t.push(l),i++;continue}t.push(Br[o]??r)}let n=t.join(" ");return n.charAt(0).toUpperCase()+n.slice(1)}function Dd(a,e){let t=i=>String(i??"").toLowerCase().replace(/[^a-z0-9]/g,""),n=t(e);return!!n&&n!==t(a)}function Xt(a,e){return Dd(a,e)?String(e):Td(a)||String(a??"")}var Qt={row:44,tile:96,compact:44,beeld:120},ze=6,Kr=12,ka=22,Cd=["row","tile","compact","beeld"],Ld=["links","midden"],xa=48,_a=320,Yt=120,ce=a=>{if(a==null||a==="")return Yt;let e=Math.round(Number(a));return Number.isFinite(e)?Math.min(_a,Math.max(xa,e)):Yt},dt=a=>Ld.includes(a)?a:"links";function Gr(a,e){let t=Array.isArray(a)?a:[],n=Array.from({length:e},(i,r)=>typeof t[r]=="string"?t[r].trim():"");return n.some(Boolean)?n:[]}var Hd=["card","items","none","open"],Jt=a=>typeof a?.name=="string"?a.name.trim():"",ct=a=>typeof a=="string"?{entity:a}:{...a},pt=a=>Math.min(Math.max(1,Number(a)||2),3),qe=a=>Cd.includes(a)?a:"row",ie=a=>!!(a?.entity||a?.name||a?.icon||a?.tap_action);function Ur(a){if(Array.isArray(a?.rows)&&a.rows.length)return a.rows.map(n=>{let i=pt(n.columns);return{columns:i,layout:qe(n.layout),align:dt(n.align),image_size:ce(n.image_size),column_names:Gr(n.column_names,i),items:(n.items??n.entities??[]).map(ct)}});let e=(a?.items??a?.entities??[]).map(ct);if(!e.length)return[];let t=pt(a.columns);return[{columns:t,layout:qe(a.layout),align:dt(a.align),image_size:ce(a.image_size),column_names:Gr(a.column_names,t),items:e}]}function en(a){return Hd.includes(a?.surface)?a.surface:a?.bare?"none":"card"}var Rd=a=>Math.max(1,Math.ceil((a.items?.length||1)/a.columns)),Id=22;function Vd(a){let e=qe(a?.layout);return e!=="beeld"?Qt[e]:ce(a?.image_size)+34}function wa(a){let e=a?.rows??[],t=Jt(a)?ka+ze:0;if(!e.length)return Kr+t+Qt.row;let n=(en(a)==="card"?Kr:0)+t;for(let i of e){let r=Rd(i);n+=r*Vd(i)+(r-1)*ze,i.column_names?.length&&(n+=Id+ze)}return n+(e.length-1)*ze}function ht(a){for(a.bewaard??=[];a.items.length<a.columns;)a.items.push(a.bewaard.pop()??{entity:""});for(;a.items.length>a.columns;){let e=a.items.pop();ie(e)&&a.bewaard.push(e)}return a}function Wr(a){let e=Array.isArray(a.rows)&&a.rows.length?a.rows.map(n=>({columns:pt(n.columns),layout:qe(n.layout),align:dt(n.align),image_size:ce(n.image_size),column_names:Array.isArray(n.column_names)?[...n.column_names]:[],items:(n.items??n.entities??[]).map(ct)})):(()=>{let n=(a.items??a.entities??[]).map(ct);return n.length?[{columns:pt(a.columns),layout:qe(a.layout),align:dt(a.align),image_size:ce(a.image_size),column_names:Array.isArray(a.column_names)?[...a.column_names]:[],items:n}]:[]})(),t=[];for(let n of e){let i=[];for(let r=0;r<n.items.length;r+=n.columns)i.push(n.items.slice(r,r+n.columns));i.length||i.push([]),i.forEach((r,o)=>t.push(ht({columns:n.columns,layout:n.layout,align:n.align,image_size:n.image_size,column_names:o===0?n.column_names:[],items:r})))}return t}var ya=a=>a.map(e=>{let t=(e.column_names??[]).slice(0,e.columns).map(n=>String(n??"").trim());return{columns:e.columns,...e.layout&&e.layout!=="row"?{layout:e.layout}:{},...e.align==="midden"?{align:"midden"}:{},...e.layout==="beeld"&&e.image_size!==Yt?{image_size:ce(e.image_size)}:{},...t.some(Boolean)?{column_names:t}:{},items:e.items.filter(ie).map(n=>structuredClone(n))}}).filter(e=>e.items.length);function za(a,e,t){let n=new Set;for(let i of a){let r=/^r(\d+)(?:i(\d+))?$/.exec(i);if(!r)continue;let o=Number(r[1]),s=r[2]===void 0?"":`i${r[2]}`;if(t==="weg"){if(o===e)continue;n.add(o>e?`r${o-1}${s}`:i);continue}n.add(o>e?`r${o+1}${s}`:i)}return n}var qr=[{waarde:"row",label:"Rij"},{waarde:"tile",label:"Tegel"},{waarde:"compact",label:"Compact"},{waarde:"beeld",label:"Beeld"}],Pd=[{waarde:"links",label:"Links"},{waarde:"midden",label:"Midden"}],Bd=a=>qr.find(e=>e.waarde===a)?.label??"Rij",Kd=`
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
`,ja=class extends HTMLElement{constructor(){super(),this.rows_=[],this.rest_={},this.open_=new Set,this.koppen_=[]}setConfig(e){if(this.rest_={...e},delete this.rest_.rows,delete this.rest_.items,delete this.rest_.entities,delete this.rest_.columns,delete this.rest_.layout,delete this.rest_.align,delete this.rest_.image_size,delete this.rest_.column_names,this.gebouwd_&&e===this.uitObject_)return;let t=Wr(e);this.gebouwd_&&JSON.stringify(ya(t))===this.uit_||(this.rows_=t,this.eersteKeer_||(this.eersteKeer_=!0,this.rows_.length===1&&this.open_.add("r0")),this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}connectedCallback(){this.gebouwd_||this.build_()}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}rijWeg_(e){this.open_=za(this.open_,e,"weg")}rijErbij_(e){this.open_=za(this.open_,e,"erbij")}itemWeg_(e,t){let n=new Set;for(let i of this.open_){let r=/^r(\d+)i(\d+)$/.exec(i);if(!r||Number(r[1])!==e){n.add(i);continue}let o=Number(r[2]);o!==t&&n.add(o>t?`r${e}i${o-1}`:i)}this.open_=n}legePlekkenOpen_(e,t){e.items.forEach((n,i)=>{ie(n)||this.open_.add(`r${t}i${i}`)})}async build_(){if(!this.hass_||!this.rows_)return;await customElements.whenDefined("ha-form"),this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=Kd;let t=document.createElement("div");if(t.className="dac-ed",this.append(e,t),t.appendChild(this.kaartBlok_()),this.rows_.forEach((i,r)=>t.appendChild(this.rijBlok_(i,r))),!this.rows_.length){let i=document.createElement("p");i.className="uitleg",i.textContent="Een rij is een regel op de kaart, met een, twee of drie entiteiten naast elkaar. Elke rij heeft zijn eigen indeling en zijn eigen vorm. Een rij van een kolom is een losse knop.",t.appendChild(i)}let n=document.createElement("button");n.type="button",n.className="rijtoevoegen",n.textContent="\uFF0B  Rij toevoegen",n.addEventListener("click",()=>{let i=ht({columns:2,layout:"row",items:[]});this.rows_.push(i);let r=this.rows_.length-1;this.open_.add(`r${r}`),this.legePlekkenOpen_(i,r),this.emit_(),this.build_()}),t.appendChild(n)}binnenKop_(e,t){return e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),t(n)}),e}segment_(e,t,n,{inKop:i=!1}={}){let r=document.createElement("span");r.className="segment";let o=e.map(l=>{let d=document.createElement("button");d.type="button",d.textContent=l.label,l.titel&&(d.title=l.titel);let c=()=>{t()!==l.waarde&&n(l.waarde)};return i?this.binnenKop_(d,c):d.addEventListener("click",c),r.appendChild(d),[d,l.waarde]}),s=()=>o.forEach(([l,d])=>l.setAttribute("aria-pressed",String(t()===d)));return s(),{wrap:r,vernieuw:s}}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"name",selector:{text:{}}},{name:"surface",selector:{select:{mode:"dropdown",options:[{value:"card",label:"Om de hele kaart"},{value:"open",label:"Alleen een rand, geen vulling"},{value:"none",label:"Geen vlak"}]}}},{name:"state_position",selector:{select:{mode:"dropdown",options:[{value:"below",label:"Onder de naam"},{value:"right",label:"Rechts op de regel"}]}}}],e.computeLabel=t=>({name:"Naam van de kaart (optioneel)",surface:"Waar het kaartvlak zit",state_position:"Waar de status staat"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="name")return"Een kop boven de entiteiten. Laat leeg voor geen kop -- de kaart is dan een rasterrij lager.";if(t.name==="surface")return"Alleen een rand geeft een doorzichtige kaart die nog wel een vorm heeft; geen vlak laat de plekken los op het dashboard staan.";if(t.name==="state_position")return"Rechts is de vorm van de entiteitenkaart van Home Assistant: de waarden komen onder elkaar uit. Regels met een schakelaar of een tijdveld tonen geen tekst, en op een tegel staat de status altijd onder de naam."},e.data={name:this.rest_.name??"",surface:this.rest_.surface??(this.rest_.bare?"none":"card"),state_position:this.rest_.state_position??"below"},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{};typeof n.name=="string"&&n.name.trim()?this.rest_.name=n.name:delete this.rest_.name,n.surface==="items"||n.surface==="none"||n.surface==="open"?this.rest_.surface=n.surface:delete this.rest_.surface,delete this.rest_.bare,n.state_position==="right"?this.rest_.state_position="right":delete this.rest_.state_position,this.emit_()}),e}rijBlok_(e,t){let n=document.createElement("details");n.className="rij",this.onthoud_(n,`r${t}`);let i=document.createElement("summary"),r=document.createElement("span");r.className="pijl",r.textContent="\u203A";let o=document.createElement("span");o.className="titel";let s=document.createElement("b");s.textContent=`Rij ${t+1}`;let l=document.createElement("small");o.append(s,l);let d=this.segment_([1,2,3].map(S=>({waarde:S,label:String(S),titel:`${S} entiteit${S>1?"en":""} in deze rij`})),()=>e.columns,S=>{e.columns=S,ht(e),this.open_.add(`r${t}`),this.legePlekkenOpen_(e,t),this.emit_(),this.build_()},{inKop:!0}),c=document.createElement("button");c.type="button",c.className="weg dupliceer",c.title="Rij dupliceren",c.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M6.5 15H5.6A1.6 1.6 0 0 1 4 13.4V5.6A1.6 1.6 0 0 1 5.6 4h7.8A1.6 1.6 0 0 1 15 5.6v.9"/></svg>',this.binnenKop_(c,()=>{this.rows_.splice(t+1,0,structuredClone(this.rows_[t])),this.rijErbij_(t),this.open_.add(`r${t+1}`),this.emit_(),this.build_()});let p=document.createElement("button");p.type="button",p.className="weg",p.title="Rij verwijderen",p.textContent="\u2715",this.binnenKop_(p,()=>{this.rows_.splice(t,1),this.rijWeg_(t),this.emit_(),this.build_()}),i.append(r,o,d.wrap,c,p);let h=document.createElement("div");h.className="rijbody";let g=this.segment_(qr.map(S=>({waarde:S.waarde,label:S.label})),()=>e.layout,S=>{e.layout=S,ke(),this.emit_()}),m=document.createElement("div");m.className="vormrij";let k=document.createElement("b");k.textContent="Vorm van deze rij",m.append(k,g.wrap),h.appendChild(m);let x=this.segment_(Pd.map(S=>({waarde:S.waarde,label:S.label})),()=>e.align??"links",S=>{e.align=S,this.emit_()}),z=document.createElement("div");z.className="vormrij";let _=document.createElement("b");_.textContent="Uitlijning",z.append(_,x.wrap),h.appendChild(z);let L=document.createElement("div");L.className="beeldvak";let W=document.createElement("ha-form");W.hass=this.hass_,W.schema=[{name:"image_size",selector:{number:{min:xa,max:_a,step:4,mode:"slider"}}}],W.computeLabel=()=>"Grootte van de afbeelding",W.computeHelper=()=>"In pixels. Groot genoeg om een QR-code te scannen begint rond de 160.",W.data={image_size:ce(e.image_size)},W.addEventListener("value-changed",S=>{S.stopPropagation(),e.image_size=ce(S.detail.value?.image_size),this.emit_()}),L.appendChild(W),h.appendChild(L);let ke=()=>{let S=e.layout==="beeld";L.style.display=S?"":"none",z.style.display=S?"none":""};ke();let rt=document.createElement("div");rt.className="kolomvak";let se=document.createElement("ha-form");se.hass=this.hass_;let cr=()=>Array.from({length:e.columns},(S,ae)=>({name:`k${ae}`,selector:{text:{}}}));se.schema=cr(),se.computeLabel=S=>`Kop boven kolom ${Number(S.name.slice(1))+1}`,se.computeHelper=S=>S.name==="k0"?"Laat leeg voor geen koppen. Handig als er twee dingen naast elkaar staan die allebei een naam verdienen.":void 0;let pr=()=>Object.fromEntries(Array.from({length:e.columns},(S,ae)=>[`k${ae}`,e.column_names?.[ae]??""]));se.data=pr(),se.addEventListener("value-changed",S=>{S.stopPropagation();let ae=S.detail.value??{};e.column_names=Array.from({length:e.columns},(ur,ql)=>ae[`k${ql}`]??""),this.emit_()}),rt.appendChild(se),h.appendChild(rt);let hr=()=>{let S=e.items.filter(ie),ae=[`${e.columns} kolom${e.columns>1?"men":""}`];e.layout!=="row"&&ae.push(Bd(e.layout)),ae.push(S.length?S.map(ur=>this.itemNaam_(ur)).join(", "):"nog leeg"),e.column_names?.some?.(Boolean)&&ae.push("met kolomkoppen"),l.textContent=ae.join(" \xB7 "),d.vernieuw(),g.vernieuw(),x.vernieuw(),ke(),se.schema.length!==e.columns&&(se.schema=cr()),se.data=pr()};return this.koppen_.push(hr),e.items.forEach((S,ae)=>h.appendChild(this.itemBlok_(e,S,t,ae))),n.append(i,h),hr(),n}itemNaam_(e){return e.name||this.hass_?.states?.[e.entity]?.attributes?.friendly_name||e.entity||"Knop"}itemBlok_(e,t,n,i){let r=document.createElement("details");r.className="item",this.onthoud_(r,`r${n}i${i}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="pijl",s.textContent="\u203A";let l=document.createElement("span");l.className="nr",l.textContent=String(i+1),l.title=`Plek ${i+1} in de rij`;let d=document.createElement("span");d.className="titel";let c=document.createElement("b"),p=document.createElement("small");d.append(c,p);let h=document.createElement("button");h.type="button",h.className="weg",h.title="Deze plek leegmaken",h.textContent="\u2715",this.binnenKop_(h,()=>{e.items.splice(i,1),this.itemWeg_(n,i),ht(e),this.emit_(),this.build_()}),o.append(s,l,d,h);let g=document.createElement("div");g.className="itembody";let m=document.createElement("ha-form");m.hass=this.hass_,m.schema=[{name:"entity",selector:{entity:{}}}],m.computeLabel=()=>"Entiteit",m.computeHelper=()=>"Mag leeg blijven: zonder entiteit wordt dit een navigatieknop. Geef hem dan een naam, een icoon en een tikactie.",m.addEventListener("value-changed",_=>{_.stopPropagation(),t.entity=_.detail.value.entity??"",this.emit_()});let k=document.createElement("dac-icon-picker");k.label="Icoon",k.hass=this.hass_,k.addEventListener("value-changed",_=>{_.stopPropagation(),_.detail.value?t.icon=_.detail.value:delete t.icon,this.emit_()});let x=document.createElement("ha-form");x.hass=this.hass_,x.schema=[{name:"name",selector:{text:{}}},{name:"toggle",selector:{boolean:{}}},{name:"show_icon",selector:{boolean:{}}},{name:"show_name",selector:{boolean:{}}},{name:"show_state",selector:{boolean:{}}},{name:"icon_tap_action",selector:{ui_action:{default_action:"toggle"}}},{name:"icon_hold_action",selector:{ui_action:{default_action:"more-info"}}},{name:"tap_action",selector:{ui_action:{default_action:"more-info"}}},{name:"hold_action",selector:{ui_action:{default_action:"more-info"}}},{name:"double_tap_action",selector:{ui_action:{default_action:"none"}}}],x.computeLabel=_=>({name:"Naam (overschrijft die van de entiteit)",toggle:"Schakelaar tonen",show_icon:"Icoon tonen",show_name:"Naam tonen",show_state:"Status tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de regel",hold_action:"Vasthouden op de regel",double_tap_action:"Dubbeltikken op de regel"})[_.name]??_.name,x.computeHelper=_=>{if(_.name==="icon_tap_action")return"Het icoon en de regel zijn twee knoppen: het icoon schakelt, de regel opent of navigeert.";if(_.name==="toggle")return"Een schuifschakelaar in plaats van de statustekst. Alleen voor wat twee standen heeft: een lamp, een stopcontact, een schakelaar.";if(_.name==="show_state")return"Een tijd of datum -- een input_datetime, of een klok van een apparaat -- verschijnt hier als een veld dat je meteen kunt zetten. Uit haalt met de tekst ook dat veld weg.";if(_.name==="double_tap_action")return"Laat dit op geen actie staan als je het niet gebruikt: een regel die op dubbeltikken wacht, reageert trager op een gewone tik."},x.addEventListener("value-changed",_=>{_.stopPropagation();let L=_.detail.value;L.name?t.name=L.name:delete t.name,L.toggle===!0?t.toggle=!0:delete t.toggle;for(let W of["show_icon","show_name","show_state"])L[W]===!1?t[W]=!1:delete t[W];for(let W of["icon_tap_action","icon_hold_action","tap_action","hold_action"])L[W]?t[W]=L[W]:delete t[W];L.double_tap_action&&L.double_tap_action.action!=="none"?t.double_tap_action=L.double_tap_action:delete t.double_tap_action,this.emit_()});let z=()=>{c.textContent=ie(t)?this.itemNaam_(t):"Kies een entiteit",p.textContent=t.entity||(ie(t)?"Zonder entiteit: een navigatieknop":""),r.dataset.leeg=String(!ie(t)),h.hidden=!ie(t)};return this.koppen_.push(z),m.data={entity:t.entity||void 0},k.value=t.icon??"",x.data={name:t.name??"",toggle:t.toggle??!1,show_icon:t.show_icon??!0,show_name:t.show_name??!0,show_state:t.show_state??!0,icon_tap_action:t.icon_tap_action,icon_hold_action:t.icon_hold_action,tap_action:t.tap_action,hold_action:t.hold_action,double_tap_action:t.double_tap_action},g.append(m,k,x),r.append(o,g),z(),r}emit_(){let e=ya(this.rows_),t={...this.rest_,rows:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_)n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};O("domotiapp-entities-card-editor",ja);var tn=class extends M{validate(e){let t=Ur(e);return t.some(n=>n.items.some(ie))?{show_state:!0,state_position:"below",...e,rows:t}:{...e,[T]:"Voeg een rij toe en kies daar entiteiten in."}}watched(){return this.config.rows.flatMap(e=>e.items.map(t=>t.entity))}item_(e,t){return this.config.rows[+e]?.items[+t]}tone_(e){return e.tone?U(e.tone):this.config.tone?U(this.config.tone):ue(e.entity)!=="light"?$.accent:vr(b(this.hass,e.entity))??$.lit}metSchakelaar_(e){return!!e.toggle&&kr(e.entity)}metTijd_(e){return!Hr(e.entity)||this.metSchakelaar_(e)?!1:(e.show_state??this.config.show_state)!==!1}metKeuze_(e){return!va(e.entity)||this.metSchakelaar_(e)?!1:(e.show_state??this.config.show_state)!==!1}template(){let e=this.config;this.setAttribute("vlak",en(e)),this.style.containerType="inline-size";let t=en(e)==="items",n=e.rows.map((o,s)=>{let l=e.state_position==="right"&&o.layout!=="tile",d=`<span class="st${l?" rechts":""}"></span>`,c=o.items.map((h,g)=>`
          <div class="it${t?" surface":""}" role="button" tabindex="0"
               data-r="${s}" data-i="${g}">
            ${o.layout==="tile"?'<span class="wash"></span>':""}
            ${h.show_icon===!1?"":'<span class="chip" role="button" tabindex="0"></span>'}
            <span class="txt">${h.show_name===!1?"":'<span class="nm"></span>'}${l?"":d}</span>
            ${l?d:""}
            ${this.metSchakelaar_(h)?Tr({label:"Aan of uit"}):""}
            ${this.metTijd_(h)?'<span class="tijdslot" style="display:contents"></span>':""}
            ${this.metKeuze_(h)?'<span class="keuzeslot" style="display:contents"></span>':""}
          </div>`).join("");return`${o.column_names.length?`<div class="kolomkoppen" data-vorm="${o.layout}" data-uit="${o.align}"
              style="--cols:${o.columns}">${o.column_names.map(h=>`<span>${I(h)}</span>`).join("")}</div>`:""}
      <div class="row" data-vorm="${o.layout}" data-uit="${o.align}"
           style="--cols:${o.columns};--it-h:${o.layout==="beeld"?o.image_size+34:Qt[o.layout]}px;--beeld:${o.image_size}px">${c}</div>`}).join("");return`<div class="card surface">${Jt(e)?'<h3 class="kaartnaam"></h3>':""}${n}</div>`}wire(){this.$$(".it").forEach(e=>{let t=this.item_(e.dataset.r,e.dataset.i);if(!t)return;let n=(s,l)=>me(this,this.hass,t,t[s]??l),i={action:t.entity?"more-info":"none"};this.teardown_.push(B(e,{onTap:()=>n("tap_action",i),onHold:()=>n("hold_action",i),onDouble:t.double_tap_action?()=>n("double_tap_action",{action:"none"}):void 0}));let r=e.querySelector(".chip");if(r&&(this.teardown_.push(B(r,{onTap:()=>n("icon_tap_action",ot(t.entity)),onHold:()=>n("icon_hold_action",i)})),this.on(r,"click",s=>s.stopPropagation()),this.on(r,"pointerdown",s=>s.stopPropagation())),e.querySelector(".tijdslot")){let s=p=>{let h=p.target?.closest?.(".tijd");if(h&&(p.stopPropagation(),p.type==="click"))try{h.showPicker?.()}catch{}};this.on(e,"pointerdown",s,!0),this.on(e,"click",s,!0);let l=null,d=null,c=()=>{clearTimeout(d),d=null;let p=l;l=null,p&&this.hass.callService(p[0],p[1],p[2])};this.teardown_.push(()=>clearTimeout(d)),this.on(e,"change",p=>{let h=p.target?.closest?.(".tijd");h&&(p.stopPropagation(),l=Ir(t.entity,h.type,h.value),clearTimeout(d),d=setTimeout(c,600))}),this.on(e,"focusout",p=>{p.target?.closest?.(".tijd")&&c()})}if(e.querySelector(".keuzeslot")){let s=l=>{l.target?.closest?.(".keuze")&&l.stopPropagation()};this.on(e,"pointerdown",s,!0),this.on(e,"click",s,!0),this.on(e,"keydown",s,!0),this.on(e,"change",l=>{let d=l.target?.closest?.(".keuze");if(!d)return;l.stopPropagation();let c=b(this.hass,t.entity),p=Zt(t.entity,d.value,Se(c));p&&this.hass.callService(p[0],p[1],p[2])})}let o=e.querySelector(".toggle");o&&this.teardown_.push(Dr(o,{value:()=>te(b(this.hass,t.entity)),set:s=>this.hass.callService("homeassistant",s?"turn_on":"turn_off",{entity_id:t.entity}),disabled:()=>ee(b(this.hass,t.entity))}))})}paint(){let e=this.$(".kaartnaam");e&&this.text(e,Jt(this.config)),this.$$(".it").forEach(t=>{let n=this.item_(t.dataset.r,t.dataset.i);if(!n)return;let i=b(this.hass,n.entity),r=te(i),o=!!n.entity&&ee(i);t.dataset.on=String(r),t.classList.toggle("unavailable",o);let s=this.tone_(n);t.style.setProperty("--tone",s);let l=E(this.hass,n.entity,n.name),d=t.querySelector(".chip");if(d){let _=Ht(this.hass,n.entity,n.icon),L=n.icon||(_?`pic:${_}`:Jn(n.entity,Y(this.hass,n.entity)));d.dataset.icon!==L&&(d.dataset.icon=L,d.classList.toggle("pic",!!_),d.innerHTML=_?`<img src="${_}" alt="" loading="lazy" />`:v(n.icon||Jn(n.entity,Y(this.hass,n.entity)))),d.style.setProperty("--tone",_?"var(--dac-ink-3)":r?s:"var(--dac-ink-3)"),d.setAttribute("aria-label",n.entity?`${l} schakelen`:"Icoon")}let c=t.querySelector(".nm");c&&this.text(c,l);let p=t.querySelector(".toggle");p&&(fa(p,r),p.style.setProperty("--tone",s),p.setAttribute("aria-label",`${l} aan of uit`));let h=t.querySelector(".tijdslot"),g=null;if(h){let _=o?null:ba(i);h.dataset.soort!==(_??"")&&(h.dataset.soort=_??"",h.innerHTML=_?`<input class="tijd" type="${_}" step="60" />`:""),g=h.querySelector(".tijd")}if(g&&(g.setAttribute("aria-label",`${l} instellen`),this.shadowRoot.activeElement!==g)){let _=Rr(i,h.dataset.soort);g.value!==_&&(g.value=_)}let m=t.querySelector(".keuzeslot"),k=null;if(m){let _=o?[]:Se(i),L=_.map(ke=>Xt(ke,this.hass?.formatEntityState?.(i,ke))),W=JSON.stringify([_,L]);m.dataset.opties!==W&&(m.dataset.opties=W,m.innerHTML=_.length?`<select class="keuze">${_.map((ke,rt)=>`<option value="${I(ke)}">${I(L[rt])}</option>`).join("")}</select>`:""),k=m.querySelector(".keuze")}if(k&&(k.setAttribute("aria-label",`${l} kiezen`),this.shadowRoot.activeElement!==k)){let _=Ft(i);k.value!==_&&(k.value=_)}let x=t.querySelector(".st"),z=n.show_state??this.config.show_state;if(p||g||k)x.textContent="";else if(z===!1)x.textContent="";else if(o)x.textContent="Niet bereikbaar";else if(!i||Yn(i.entity_id))x.textContent="";else if(ue(i.entity_id)==="light"&&r&&i.attributes.brightness!=null)x.textContent=`${Math.round(i.attributes.brightness/255*100)}%`;else{let _=i.attributes.unit_of_measurement;x.textContent=_?`${i.state} ${_}`:J(this.hass,i)}t.setAttribute("aria-label",`${l}${i?`, ${J(this.hass,i)}`:""}`)})}getCardSize(){return ge(wa(this.config))}getGridOptions(){let e=ge(wa(this.config));return{columns:12,rows:e,min_columns:4,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-entities-card-editor")}static getStubConfig(){return{rows:[]}}};y(tn,"css",`
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
      font-size: 13px; font-weight: 600; letter-spacing: -.01em; line-height: ${ka}px;
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

    ${Cr}
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
  `);N("domotiapp-entities-card",tn,{name:"DomotiApp Entiteiten",description:"Entiteiten in rijen, elk met een eigen kolomindeling en vorm: regel, tegel of compacte pil. Ook voor een losse knop."});var Z={PAUSE:1,SEEK:2,VOLUME_SET:4,VOLUME_MUTE:8,PREVIOUS_TRACK:16,NEXT_TRACK:32,TURN_ON:128,TURN_OFF:256,PLAY_MEDIA:512,VOLUME_STEP:1024,SELECT_SOURCE:2048,STOP:4096,PLAY:16384,SHUFFLE_SET:32768,REPEAT_SET:262144,GROUPING:524288},X=(a,e)=>!!(Number(a?.attributes?.supported_features??0)&e),Fe=a=>!a||a.state==="off",$a=a=>!!a&&!["off","unavailable","unknown"].includes(a.state),ut=a=>a?.state==="playing",Fr=a=>!!a&&!["off","unavailable","unknown","idle","standby"].includes(a.state);function Zr(a){if(!a)return[];let e=[];return(X(a,Z.TURN_ON)||X(a,Z.TURN_OFF))&&e.push("power"),Fe(a)||(X(a,Z.PREVIOUS_TRACK)&&e.push("prev"),X(a,Z.PLAY)||X(a,Z.PAUSE)||X(a,Z.PLAY_MEDIA)?e.push("play"):X(a,Z.STOP)&&e.push("stop"),X(a,Z.NEXT_TRACK)&&e.push("next")),e}var Ne=a=>a?.volume_entity||a?.entity;function Ea(a){if(!$a(a))return[];let e=[];return X(a,Z.VOLUME_MUTE)&&e.push("mute"),X(a,Z.VOLUME_SET)?e.push("slider"):X(a,Z.VOLUME_STEP)&&e.push("steps"),e}var je=a=>Math.round(Math.min(1,Math.max(0,Number(a?.attributes?.volume_level??0)))*100),Xr=a=>a?.attributes?.volume_level!==void 0&&a?.attributes?.volume_level!==null,mt=a=>!!a?.attributes?.is_volume_muted,Aa=a=>!!a?.attributes?.mass_player_type,Ma=a=>!!a?.attributes?.shuffle,Sa=a=>{let e=a?.attributes?.repeat;return["off","all","one"].includes(e)?e:"off"},Yr=a=>({off:"all",all:"one",one:"off"})[Gd(a)]??"all",Gd=a=>["off","all","one"].includes(a)?a:"off";function Na(a,{zoeken:e=!0,sleep:t=!1}={}){if(!$a(a))return[];let n=[];return X(a,Z.SHUFFLE_SET)&&n.push("shuffle"),X(a,Z.REPEAT_SET)&&n.push("repeat"),t&&n.push("sleep"),e&&Aa(a)&&n.push("search"),n}function Qr(a,{tonen:e=!0}={}){if(!e||!$a(a)||!X(a,Z.SELECT_SOURCE)||Aa(a))return null;let t=a?.attributes?.source_list;return!Array.isArray(t)||t.length<2?null:{nu:a.attributes.source??null,aantal:t.length}}function nn(a,e=t=>t?.state??""){if(!a)return"";if(a.state==="unavailable")return"Niet bereikbaar";if(a.state==="off")return"Uit";if(a.state==="standby")return"Stand-by";let t=a.attributes??{},n=t.media_title||t.media_channel||"",i=t.media_artist||t.media_series_title||t.media_album_name||t.app_name||t.source||"";return a.state==="idle"||!n?i||e(a):i&&i!==n?`${n} \xB7 ${i}`:n}function gt(a){let e=a?.attributes?.device_class;return e==="tv"?"tv":e==="receiver"?"radio":"speaker"}var Ud="domotiapp-media-speler:";function Oa(a,e){let t=s=>e?.states?.[s]?.attributes?.friendly_name??s,n=s=>!!e?.states?.[s],i=()=>Object.keys(e?.states??{}).filter(s=>s.startsWith("media_player."));return(Array.isArray(a?.players)&&a.players.length?[...new Set([...n(a?.entity)?[a.entity]:[],...a.players.filter(n)])]:Wd(i(),e)).sort((s,l)=>String(t(s)).localeCompare(String(t(l)),"nl"))}function Wd(a,e){let t=a.filter(n=>Aa(e?.states?.[n]));return t.length?t:a}var Jr=a=>Ud+(a??[]).join("|");function eo(a,e,t){if(!a?.speaker_select)return a?.entity??"";let n=null;try{n=t?.getItem?.(Jr(e))??null}catch{n=null}return n&&e?.includes(n)?n:a.entity&&e?.includes(a.entity)?a.entity:a.entity||e?.[0]||""}function to(a,e,t){try{return a?.setItem?.(Jr(e),String(t)),!0}catch{return!1}}var Ta="dacScrollSlot",no=["position","top","left","right","width","overflow"];function ao(a=globalThis.document,e=globalThis.window){let t=a?.body;if(!t?.style||t.dataset?.[Ta])return()=>{};let n=e?.scrollY??a.documentElement?.scrollTop??0,i=Object.fromEntries(no.map(o=>[o,t.style[o]]));t.dataset&&(t.dataset[Ta]="1"),t.style.position="fixed",t.style.top=`-${n}px`,t.style.left="0",t.style.right="0",t.style.width="100%",t.style.overflow="hidden";let r=!1;return()=>{if(!r){r=!0;for(let o of no)t.style[o]=i[o];t.dataset&&delete t.dataset[Ta],e?.scrollTo?.(0,n)}}}var qd=[400,1e3,2e3,4e3,8e3,15e3,3e4],Fd=6e4;function Oe(a){let e=a?.code;return e==="unknown_command"?!0:e==="not_allowed"&&/niet geladen/i.test(String(a?.message??""))}var fe=class{constructor(e,{wachttijden:t=qd,traag:n=Fd,klok:i,stopKlok:r}={}){this.doe_=e,this.wachttijden_=t,this.traag_=n,this.klok_=i??((o,s)=>setTimeout(o,s)),this.stopKlok_=r??(o=>clearTimeout(o)),this.poging=0,this.timer_=null}get magNog(){return this.poging<this.wachttijden_.length}plan(){let e=this.magNog;if(this.timer_)return e;let t=e?this.wachttijden_[this.poging]:this.traag_;return this.poging+=1,this.timer_=this.klok_(()=>{this.timer_=null,this.doe_()},t),e}herstel(){this.stop(),this.poging=0}stop(){this.timer_!==null&&(this.stopKlok_(this.timer_),this.timer_=null)}},Ze=class{constructor(){this.was_=!0}herverbonden(e){let t=e?.connected!==!1,n=t&&!this.was_;return this.was_=t,n}};var Zd=`
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
`,Da=null,io=a=>String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),Ca=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),Da=Da??[F(Zd)],this.shadowRoot.adoptedStyleSheets=Da}connectedCallback(){this.gebouwd_||this.bouw_()}bouw_(){this.shadowRoot.innerHTML=`
      <div class="laag" role="dialog" aria-modal="true">
        <div class="vak">
          <h2></h2>
          <p></p>
          <div class="knoppen">
            <button type="button" class="nee"></button>
            <button type="button" class="ja"></button>
          </div>
        </div>
      </div>`,this.gebouwd_=!0,this.$(".nee").addEventListener("click",()=>this.klaar_(!1)),this.$(".ja").addEventListener("click",()=>this.klaar_(!0)),this.$(".laag").addEventListener("click",e=>{e.target===this.$(".laag")&&this.klaar_(!1)}),this.addEventListener("keydown",e=>{e.key==="Escape"&&this.klaar_(!1)})}$(e){return this.shadowRoot.querySelector(e)}open(e){return this.gebouwd_||this.bouw_(),this.$("h2").innerHTML=io(e.title??"Weet je het zeker?"),this.$("p").innerHTML=io(e.text??"Weet je zeker dat je dit wilt doen?"),this.$(".nee").textContent=e.dismissText??"Annuleren",this.$(".ja").textContent=e.confirmText??"OK",this.setAttribute("open",""),setTimeout(()=>this.$(".nee")?.focus(),40),new Promise(t=>{this.antwoord_=t})}klaar_(e){if(!this.hasAttribute("open"))return;this.removeAttribute("open");let t=this.antwoord_;this.antwoord_=null,t?.(e)}};O("domotiapp-vraag",Ca);function ft(a={}){let e=document.querySelector("domotiapp-vraag");e||(e=document.createElement("domotiapp-vraag"),document.body.appendChild(e)),e.tabIndex=-1;let t=e.open(a);return e.focus?.(),t}br(ft);var ro=[["playlists","Afspeellijsten"],["radio","Radio"],["tracks","Nummers"],["albums","Albums"],["artists","Artiesten"]];var $e=a=>`domotiapp_lovelace/media/${a}`;function Xd(a,e){if(!a)return null;if(e)return a.uri?{type:$e("favorite"),favorite:!0,uri:a.uri}:null;let t=oo(a);return!t||!a.library_item_id?null:{type:$e("favorite"),favorite:!1,kind:t,library_item_id:String(a.library_item_id)}}function oo(a){let e=a?.media_type;return{track:"tracks",album:"albums",artist:"artists",playlist:"playlists",radio:"radio",podcast:"podcasts",audiobook:"audiobooks"}[e]??null}var so={tracks:"track",albums:"album",artists:"artist",playlists:"playlist",radio:"radio",podcasts:"podcast",audiobooks:"audiobook"},La=[["","Alles"],["track","Nummers"],["album","Albums"],["artist","Artiesten"],["playlist","Afspeellijsten"],["radio","Radio"]];function lo(a,e,t=null){return a?.kind??oo(e)??t??"playlists"}var Ha=a=>!!a?.uri,an=(a,e,{favoriet:t=!1,zoek:n="",limiet:i=50}={})=>a.callWS({type:$e("library"),kind:e,favorite:t,...n?{search:n}:{},limit:i}).then(r=>r?.items??[]),co=(a,e,t)=>{let n=Xd(e,t);return n?a.callWS(n):Promise.reject(new Error("Dit item kan niet favoriet gemaakt worden."))},po=(a,e)=>a.callWS({type:$e("playlist/create"),name:e}).then(t=>t?.playlist??null),ho=(a,e)=>a.callWS({type:$e("playlist/remove"),library_item_id:String(e.library_item_id)}),uo=(a,e)=>a.callWS({type:$e("playlist/tracks"),library_item_id:String(e.library_item_id),provider:e.provider??"library"}).then(t=>t?.tracks??[]),mo=(a,e,t)=>a.callWS({type:$e("playlist/add_tracks"),library_item_id:String(e.library_item_id),uris:t}),go=(a,e,t)=>a.callWS({type:$e("playlist/remove_tracks"),library_item_id:String(e.library_item_id),positions:t});var Yd=350,Qd={track:"Nummer",album:"Album",artist:"Artiest",playlist:"Afspeellijst",radio:"Radio",podcast:"Podcast",audiobook:"Luisterboek"};function Jd(a){let e=Array.isArray(a.artists)?a.artists.map(i=>typeof i=="string"?i:i?.name).filter(Boolean).join(", "):"",t=typeof a.album=="string"?a.album:a.album?.name,n=Qd[a.media_type]??"";return[e,t].filter(Boolean).join(" \xB7 ")||n}var ec=`
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
`,Ra=class extends HTMLElement{static get sheet_(){return Object.hasOwn(this,"s_")||(this.s_=F(xe+ec)),this.s_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[new.target.sheet_],this.soort_="",this.treffers_=[],this.speakers_=null,this.opruimen_=[],this.zoekHerkansing_=new fe(()=>this.zoek_()),this.speakerHerkansing_=new fe(()=>this.haalSpeakers_())}open(e,t,n,{radioModus:i=!1,speakers:r=null}={}){this.hass=e,this.entity_=t,this.naam_=n,this.radioModus_=i,this.speakerKeuze_=Array.isArray(r)&&r.length?r:null,this.gebouwd_||this.bouw_(),this.setAttribute("open",""),this.escape_??=o=>{o.key==="Escape"&&this.hasAttribute("open")&&this.sluit()},document.addEventListener("keydown",this.escape_,!0),this.scrollLos_??=ao(),this.$(".wie b").textContent=n,this.$(".wie span").textContent="Music Assistant",this.sprekerSig_=null,this.$("footer")?.removeAttribute("open"),this.$(".voetkop")?.setAttribute("aria-expanded","false"),this.lijst_=null,this.soort_="",this.naarTab_("zoeken"),this.haalSpeakers_(),setTimeout(()=>this.$(".zoek input")?.focus(),60)}sluit(){this.removeAttribute("open"),this.menuDicht_(),this.escape_&&document.removeEventListener("keydown",this.escape_,!0),this.scrollLos_?.(),this.scrollLos_=null}set hass(e){this.hass_=e,this.gebouwd_&&this.hasAttribute("open")&&this.tekenSpeakers_()}get hass(){return this.hass_}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.gebouwd_=!0,this.shadowRoot.innerHTML=`
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
          ${La.map(([t,n])=>`<button type="button" data-soort="${t}" aria-pressed="${t===""}">${n}</button>`).join("")}
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
      </div>`,this.aan_(this.$(".sluit"),"click",()=>this.sluit()),this.aan_(this.$(".laag"),"pointerdown",t=>{t.target===this.$(".laag")?this.sluit():t.target.closest(".menu")||this.menuDicht_()});let e=this.$(".zoek input");this.aan_(this.$(".zoekknop"),"click",()=>{clearTimeout(this.timer_),this.zoek_(),e.focus()}),this.aan_(e,"input",()=>this.tikPauze_()),this.aan_(e,"keydown",t=>{t.key==="Enter"&&(clearTimeout(this.timer_),this.zoek_()),t.key==="Escape"&&this.sluit()}),this.lijstLuisteraars_(),this.aan_(this.$(".voetkop"),"click",()=>{let n=this.$("footer").toggleAttribute("open");this.$(".voetkop").setAttribute("aria-expanded",String(n)),this.voetOpen_=n}),this.aan_(this.$(".tabs"),"click",t=>{let n=t.target.closest("[data-tab]");n&&this.naarTab_(n.dataset.tab)}),this.aan_(this.$(".terug"),"click",()=>{this.lijst_=null,this.naarTab_("lijsten")}),this.aan_(this.$(".weglijst"),"click",()=>this.lijstWeg_()),this.aan_(this.$(".nieuwe"),"click",()=>{this.$(".nieuwrij").hidden=!1,this.$(".nieuwe").hidden=!0,this.$(".nieuwrij input").value="",this.$(".nieuwrij input").focus()}),this.aan_(this.$("[data-maak]"),"click",()=>this.lijstMaken_()),this.aan_(this.$(".nieuwrij input"),"keydown",t=>{t.key==="Enter"&&this.lijstMaken_(),t.key==="Escape"&&(this.$(".nieuwrij").hidden=!0,this.$(".nieuwe").hidden=!1)}),this.aan_(this.$(".soorten"),"click",t=>{let n=t.target.closest("[data-soort]");if(n){this.modus_==="favorieten"?this.bibSoort_=n.dataset.soort:this.soort_=n.dataset.soort;for(let i of this.shadowRoot.querySelectorAll("[data-soort]"))i.setAttribute("aria-pressed",String(i===n));clearTimeout(this.timer_),this.modus_==="favorieten"?this.haalFavorieten_():this.zoek_()}}),this.aan_(this.$(".sprekers"),"click",t=>{let n=t.target.closest("button[data-speaker]");n&&!n.disabled&&this.wisselSpeaker_(n.dataset.speaker)}),this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen: nummers, albums, artiesten, afspeellijsten en radio.")}aan_(e,t,n,i){e.addEventListener(t,n,i),this.opruimen_.push(()=>e.removeEventListener(t,n,i))}tikPauze_(){clearTimeout(this.timer_),this.timer_=setTimeout(()=>this.zoek_(),Yd)}async zoek_(){let e=this.$(".zoek input");if(!e)return;let t=e.value.trim();if(!t){this.treffers_=this.zoekTreffers_=[],this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen.");return}let n=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Zoeken\u2026",t);try{let i=await this.hass.callWS({type:"domotiapp_lovelace/media/search",query:t,...this.soort_?{media_types:[this.soort_]}:{},limit:20});if(n!==this.beurt_)return;this.treffers_=this.zoekTreffers_=i?.results??[],this.zoekHerkansing_.herstel(),this.teken_()}catch(i){if(n!==this.beurt_)return;if(Oe(i)){this.zoekHerkansing_.plan(),this.leegMelding_("Home Assistant start nog op","Zodra DomotiApp klaar is met opstarten, wordt er vanzelf gezocht.");return}this.leegMelding_("Zoeken lukte niet",i?.message??"Music Assistant gaf geen antwoord.",!0)}}naarTab_(e){this.modus_=e;for(let n of this.shadowRoot.querySelectorAll("[data-tab]"))n.setAttribute("aria-selected",String(n.dataset.tab===e));let t=e==="lijsten"&&this.lijst_;if(this.$(".zoek").hidden=e!=="zoeken",this.$(".soorten").hidden=e==="lijsten",this.$(".lijstkop").hidden=!t,this.$(".nieuwe").hidden=e!=="lijsten"||!!this.lijst_,this.$(".nieuwrij").hidden=!0,e==="zoeken"){if(this.tekenSoorten_(La,this.soort_),this.treffers_=this.zoekTreffers_??[],!this.treffers_.length){this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen.");return}this.teken_();return}if(e==="favorieten"){this.haalFavorieten_();return}t?this.openLijst_(this.lijst_):this.haalLijsten_()}tekenSoorten_(e,t){this.$(".soorten").innerHTML=e.map(([n,i])=>`<button type="button" data-soort="${n}" aria-pressed="${n===t}">${i}</button>`).join("")}async haalFavorieten_(){this.bibSoort_??="playlists",this.tekenSoorten_(ro,this.bibSoort_);let e=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026","Je favorieten uit Music Assistant.");try{let t=await an(this.hass,this.bibSoort_,{favoriet:!0});if(e!==this.beurt_)return;if(this.treffers_=t,!t.length){this.leegMelding_("Nog geen favorieten","Zoek iets op en tik op het hartje om het hier te zetten.");return}this.teken_()}catch(t){if(e!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}async favorietOm_(e,t){let n=!e.favorite;e.favorite=n,t?.setAttribute("aria-pressed",String(n));try{let i=await co(this.hass,e,n);n&&i?.library_item_id&&(e.library_item_id=i.library_item_id,i.kind&&(e.media_type=so[i.kind]??e.media_type)),n&&(this.bibSoort_=lo(i,e,this.bibSoort_)),this.modus_==="favorieten"&&!n&&this.haalFavorieten_()}catch(i){e.favorite=!n,t?.setAttribute("aria-pressed",String(!n)),this.leegMelding_("Dat lukte niet",i?.message??"Music Assistant gaf geen antwoord.",!0)}}async haalLijsten_(){let e=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026","Je afspeellijsten uit Music Assistant.");try{let t=await an(this.hass,"playlists",{});if(e!==this.beurt_)return;if(this.treffers_=t,!t.length){this.leegMelding_("Nog geen afspeellijsten","Maak er een met de knop hierboven.");return}this.teken_()}catch(t){if(e!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}async openLijst_(e){this.lijst_=e,this.modus_="lijsten",this.$(".lijstkop").hidden=!1,this.$(".lijstkop b").textContent=e.name??"Afspeellijst",this.$(".nieuwe").hidden=!0,this.$(".weglijst").hidden=!e.is_editable;let t=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026",e.name??"");try{let n=await uo(this.hass,e);if(t!==this.beurt_)return;if(this.treffers_=n,!n.length){this.leegMelding_("Deze lijst is leeg","Zoek iets op en kies 'Aan afspeellijst toevoegen'.");return}this.teken_()}catch(n){if(t!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",n?.message??"Music Assistant gaf geen antwoord.",!0)}}async lijstMaken_(){let e=this.$(".nieuwrij input").value.trim();if(e){this.$(".nieuwrij").hidden=!0;try{await po(this.hass,e),this.lijst_=null,this.naarTab_("lijsten")}catch(t){this.leegMelding_("Maken lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}}async lijstWeg_(e){let t=e??this.lijst_;if(!(!t||!await ft({title:"Afspeellijst verwijderen?",text:`"${t.name}" wordt uit Music Assistant gehaald. De nummers zelf blijven gewoon in je bibliotheek staan.`,confirmText:"Verwijderen",dismissText:"Annuleren"})))try{await ho(this.hass,t),this.lijst_&&this.lijst_.uri===t.uri&&(this.lijst_=null),this.melding_(`"${t.name}" verwijderd`),this.naarTab_("lijsten")}catch(i){this.melding_(i?.message??"Verwijderen lukte niet",!0)}}async nummerWeg_(e){let t=this.lijst_;if(!(!t||e.position==null))try{await go(this.hass,t,[e.position]),this.melding_(`"${e.name}" uit de lijst gehaald`),await this.naVerwerking_(t)}catch(n){this.melding_(n?.message??"Verwijderen lukte niet",!0)}}async naVerwerking_(e){for(let t of[900,2500]){if(await new Promise(n=>setTimeout(n,t)),this.lijst_!==e||!this.hasAttribute("open"))return;await this.openLijst_(e)}}async kiesLijstVoor_(e){this.menuDicht_();let t=[];try{t=await an(this.hass,"playlists",{})}catch{t=[]}let n=t.filter(r=>r.is_editable),i=this.$(".menu");i.innerHTML='<span class="titel">Aan welke lijst?</span>'+(n.length?n.map((r,o)=>`<button type="button" data-lijst="${o}">${this.veilig_(r.name)}</button>`).join(""):'<span class="titel">Geen bewerkbare lijst. Maak er eerst een.</span>'),i.hidden=!1,this.menuPlaats_(i),i.scrollTop=0,i.onclick=async r=>{let o=r.target.closest("[data-lijst]");if(!o)return;let s=n[+o.dataset.lijst];this.menuDicht_();try{await mo(this.hass,s,[e.uri]),this.melding_(`"${e.name}" toegevoegd aan "${s.name}"`)}catch(l){this.melding_(l?.message??"Toevoegen lukte niet",!0)}}}melding_(e,t=!1){let n=this.$(".toast");n||(n=document.createElement("div"),n.className="toast",this.$(".laag").appendChild(n)),n.textContent=e,n.dataset.fout=String(t),n.hidden=!1,clearTimeout(this.toastTimer_),this.toastTimer_=setTimeout(()=>{n.hidden=!0},t?6e3:3e3)}leegMelding_(e,t,n=!1){this.$(".lijst").innerHTML=`<div class="melding${n?" fout":""}"><b>${e}</b>${t}</div>`}teken_(){let e=this.$(".lijst");if(!this.treffers_.length){this.leegMelding_("Niets gevonden","Probeer een andere naam of een ander soort.");return}let t=this.modus_==="lijsten"&&this.lijst_;e.innerHTML=this.treffers_.map((n,i)=>{let r=n.image?`<img src="${n.image}" alt="" loading="lazy" />`:v(n.media_type==="radio"?"radio":"music"),o=Ha(n)&&!t?`<button class="hart" type="button" data-hart="${i}" aria-pressed="${!!n.favorite}"
                 aria-label="Favoriet">${v("star")}</button>`:"",s=t?`<button class="weg" type="button" data-weg="${i}"
               aria-label="Uit deze afspeellijst halen">${v("close")}</button>`:"",l=`<button class="meer" type="button" data-meer="${i}"
               aria-label="Meer met ${this.veilig_(n.name)}">${v("dots")}</button>`,d=(o||s?1:0)+1;return`
          <div class="rij" data-i="${i}" data-knoppen="${d}">
            <button class="tr" type="button">
              <span class="hoes">${r}</span>
              <span class="tekst">
                <span class="nm">${this.veilig_(n.name)}</span>
                <span class="ond">${this.veilig_(Jd(n))}</span>
              </span>
            </button><span class="knoppen">${o}${s}${l}</span>
          </div>`}).join(""),this.trefferBinding_?.(),this.trefferBinding_=B(e,{onTap:()=>{let n=this.laatsteTreffer_;n&&(this.modus_==="lijsten"&&!this.lijst_?this.openLijst_(n):this.speel_(n,"replace",{radio:this.radioStandaard_(n)}))},onHold:()=>{let n=this.laatsteTreffer_;n&&this.menuOpen_(n)}})}lijstLuisteraars_(){let e=this.$(".lijst");this.aan_(e,"click",t=>{let n=t.target.closest("[data-hart]"),i=t.target.closest("[data-weg]"),r=t.target.closest("[data-meer]");!n&&!i&&!r||(t.stopImmediatePropagation(),t.preventDefault(),n?this.favorietOm_(this.treffers_[+n.dataset.hart],n):i?this.nummerWeg_(this.treffers_[+i.dataset.weg]):(this.menuPlek_=r.getBoundingClientRect(),this.menuOpen_(this.treffers_[+r.dataset.meer])))}),this.aan_(e,"pointerdown",t=>{t.target.closest("[data-hart], [data-weg], [data-meer]")&&t.stopImmediatePropagation()}),this.aan_(e,"pointerdown",t=>{let n=t.target.closest("[data-i]");this.laatsteTreffer_=n?this.treffers_[+n.dataset.i]:null,this.menuPlek_=n?n.getBoundingClientRect():null})}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}speel_(e,t,{radio:n=!1}={}){e?.uri&&(this.menuDicht_(),this.hass.callService("music_assistant","play_media",{media_id:e.uri,...e.media_type?{media_type:e.media_type}:{},enqueue:t,...n?{radio_mode:!0}:{}},{entity_id:this.entity_}),t==="replace"&&this.sluit())}kanRadio_(e){return["track","album","artist"].includes(e?.media_type)}radioStandaard_(e){return!!this.radioModus_&&this.kanRadio_(e)}menuOpen_(e){let t=this.$(".menu"),n=this.modus_==="lijsten"&&this.lijst_;t.innerHTML=`<span class="titel">${this.veilig_(e.name)}</span><button type="button" data-w="replace">Nu afspelen</button>`+(this.kanRadio_(e)?'<button type="button" data-radio>Afspelen en doorgaan</button>':"")+'<button type="button" data-w="next">Hierna afspelen</button><button type="button" data-w="add">Achteraan in de wachtrij</button>'+(Ha(e)?`<button type="button" data-fav>${e.favorite?"Uit favorieten":"Favoriet maken"}</button>`:"")+(e.uri&&!n&&e.media_type!=="playlist"?'<button type="button" data-toe>Aan afspeellijst toevoegen</button>':"")+(e.media_type==="playlist"&&e.is_editable?'<button type="button" class="kritiek" data-lijstweg>Afspeellijst verwijderen</button>':""),t.hidden=!1,this.menuPlaats_(t),t.onclick=i=>{let r=i.target.closest("[data-w]");if(r)return this.speel_(e,r.dataset.w,{radio:r.dataset.w==="replace"&&this.radioStandaard_(e)});if(i.target.closest("[data-radio]"))return this.speel_(e,"replace",{radio:!0});if(i.target.closest("[data-fav]"))return this.menuDicht_(),this.favorietOm_(e,this.shadowRoot.querySelector(`[data-hart="${this.treffers_.indexOf(e)}"]`));if(i.target.closest("[data-toe]"))return this.kiesLijstVoor_(e);if(i.target.closest("[data-lijstweg]"))return this.menuDicht_(),this.lijstWeg_(e)}}menuPlaats_(e){let t=this.menuPlek_,n=e.offsetWidth||210,i=e.offsetHeight||160,r=Math.min(Math.max(8,(t?.left??40)+12),window.innerWidth-n-8),o=(t?.bottom??80)+6,s=o+i<=window.innerHeight-8?o:Math.max(8,(t?.top??80)-i-6);e.style.left=`${r}px`,e.style.top=`${Math.min(s,Math.max(8,window.innerHeight-i-8))}px`}menuDicht_(){let e=this.$(".menu");e&&(e.hidden=!0)}async haalSpeakers_(){if(this.speakerKeuze_){this.speakers_={label_exists:!0,entities:this.speakerKeuze_.map(e=>{let t=b(this.hass,e);return t?{entity_id:e,name:t.attributes?.friendly_name??e,can_group:X(t,Z.GROUPING)}:null}).filter(Boolean),filtered_out:0},this.tekenSpeakers_();return}try{this.speakers_=await this.hass.callWS({type:"domotiapp_lovelace/media/speakers"}),this.speakerHerkansing_.herstel()}catch(e){this.speakers_=null,Oe(e)&&this.speakerHerkansing_.plan()}this.tekenSpeakers_()}groepNu_(){let t=this.hass?.states?.[this.entity_]?.attributes?.group_members;return new Set(Array.isArray(t)?t:[])}tekenSpeakers_(){let e=this.$("footer");if(!e)return;let t=this.speakers_;if(!t||!t.label_exists||!t.entities?.length){e.hidden=!t||t.label_exists===void 0,e.hidden||(this.$(".sprekers").innerHTML=`<span class="ond" style="color:var(--dac-ink-2);font-size:12.5px">Plak het label <b>${this.veilig_(t?.label_name??"Music Assistant Media")}</b> op je speakers om ze hier samen te laten spelen.</span>`);return}e.hidden=!1;let n=this.groepNu_(),i=t.entities.filter(o=>o.entity_id===this.entity_||n.has(o.entity_id));this.$(".waar").textContent=i.length?i.map(o=>o.name).join(", "):this.naam_??"";let r=t.entities.map(o=>`${o.entity_id}:${o.entity_id===this.entity_||n.has(o.entity_id)}`).join("|");if(this.sprekerSig_!==r){this.sprekerSig_=r,this.schuiven_?.forEach(o=>o()),this.schuiven_=new Map,this.$(".sprekers").innerHTML=t.entities.map(o=>{let s=o.entity_id===this.entity_,l=s||n.has(o.entity_id),d=X(b(this.hass,o.entity_id),Z.VOLUME_SET);return`
            <div class="spreker" data-speaker="${o.entity_id}" data-zelf="${s}" data-mee="${l}">
              <button class="mee" type="button" data-speaker="${o.entity_id}"
                      aria-pressed="${l}" ${!s&&!o.can_group?"disabled":""}
                      title="${s?"Deze speler":o.can_group?"Laat deze speaker meespelen":"Deze speaker laat zich niet koppelen"}">
                ${v(l?"volume":"speaker")}<span>${this.veilig_(o.name)}</span>
              </button>
              ${l&&d?`${le()}<span class="pct tnum"></span>`:l?'<span class="stil">geen volumeregeling</span>':""}
            </div>`}).join("");for(let o of this.shadowRoot.querySelectorAll(".spreker")){let s=o.querySelector(".slider");if(!s)continue;let l=o.dataset.speaker;s.setAttribute("aria-label",`Volume ${o.querySelector("span")?.textContent??""}`);let d=we(s,{value:()=>je(b(this.hass,l)),onInput:c=>this.zetSchuif_(s,c),onCommit:c=>this.hass.callService("media_player","volume_set",{volume_level:c/100},{entity_id:l})});this.schuiven_.set(l,d)}}for(let o of this.shadowRoot.querySelectorAll(".spreker")){let s=o.dataset.speaker,l=o.querySelector(".slider");if(!l||l.classList.contains("dragging"))continue;let d=b(this.hass,s),c=je(d);this.zetSchuif_(l,c,mt(d))}}zetSchuif_(e,t,n=!1){e.style.setProperty("--v",`${t}%`),e.setAttribute("aria-valuenow",String(t));let i=e.parentElement.querySelector(".pct");i&&(i.textContent=n?"gedempt":`${t}%`)}wisselSpeaker_(e){if(e===this.entity_)return;if(this.groepNu_().has(e)){this.hass.callService("media_player","unjoin",{},{entity_id:e});return}this.hass.callService("media_player","join",{group_members:[e]},{entity_id:this.entity_});let n=b(this.hass,this.entity_);if(typeof n?.attributes?.volume_level!="number")return;let i=je(n),r=b(this.hass,e);X(r,Z.VOLUME_SET)&&je(r)!==i&&this.hass.callService("media_player","volume_set",{volume_level:i/100},{entity_id:e})}disconnectedCallback(){clearTimeout(this.timer_),this.zoekHerkansing_.stop(),this.speakerHerkansing_.stop(),this.scrollLos_?.(),this.scrollLos_=null,this.schuiven_?.forEach(e=>e()),this.schuiven_=null,this.escape_&&document.removeEventListener("keydown",this.escape_,!0),this.trefferBinding_?.();for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}};O("domotiapp-media-browser",Ra);function fo(a,e,t,n={}){let i=document.querySelector("domotiapp-media-browser");return i||(i=document.createElement("domotiapp-media-browser"),document.body.appendChild(i)),i.tabIndex=-1,i.open(a,e,t,n),i.focus?.(),i}var tc=`
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
`,Ia=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[F(tc+xe)],this.filter_="",this.opruimen_=[]}connectedCallback(){this.gebouwd_||this.bouw_()}disconnectedCallback(){for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}bouw_(){this.shadowRoot.innerHTML=`
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
      </div>`,this.gebouwd_=!0;let e=(t,n,i)=>{t.addEventListener(n,i),this.opruimen_.push(()=>t.removeEventListener(n,i))};e(this.$(".sluit"),"click",()=>this.sluit()),e(this.$(".laag"),"click",t=>{t.target===this.$(".laag")&&this.sluit()}),e(this.$("input"),"input",t=>{this.filter_=t.target.value.trim().toLowerCase(),this.teken_()}),e(this.$("input"),"keydown",t=>{t.key==="Enter"&&this.$(".bron")?.click()}),e(this,"keydown",t=>{t.key==="Escape"&&this.hasAttribute("open")&&this.sluit()}),e(this.$(".lijst"),"click",t=>{let n=t.target.closest(".bron");n&&this.kies_(n.dataset.bron)})}$(e){return this.shadowRoot.querySelector(e)}open(e,t,n){this.hass=e,this.entity_=t,this.naam_=n,this.filter_="",this.gebouwd_||this.bouw_(),this.$("input").value="",this.setAttribute("open",""),this.teken_(),setTimeout(()=>this.$("input")?.focus(),60)}sluit(){this.removeAttribute("open")}bronnen_(){let e=b(this.hass,this.entity_),t=e?.attributes?.source_list??[],n=e?.attributes?.source,i=this.filter_?t.filter(r=>String(r).toLowerCase().includes(this.filter_)):[...t];return i.sort((r,o)=>r===n?-1:o===n?1:0),{lijst:i,nu:n,totaal:t.length}}teken_(){let{lijst:e,nu:t,totaal:n}=this.bronnen_();this.$(".naam").textContent=this.naam_??"Bron kiezen",this.$(".sub").textContent=t?`Nu: ${t}`:"",this.$(".tel").textContent=this.filter_?`${e.length} van ${n}`:`${n} bronnen`;let i=this.$(".lijst");if(!e.length){i.innerHTML='<div class="leeg">Niets gevonden.</div>';return}i.innerHTML=e.map(r=>{let o=String(r).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),s=r===t;return`<button class="bron" type="button" role="option" data-bron="${o}"
                  aria-current="${s}" aria-selected="${s}">
                  <b>${o}</b>${s?'<span class="nu">NU</span>':""}
                </button>`}).join("")}kies_(e){!e||!this.hass||(this.hass.callService("media_player","select_source",{entity_id:this.entity_,source:e}),this.sluit())}};O("domotiapp-bron-kiezer",Ia);function bo(a,e,t){let n=document.querySelector("domotiapp-bron-kiezer");return n||(n=document.createElement("domotiapp-bron-kiezer"),document.body.appendChild(n)),n.tabIndex=-1,n.open(a,e,t),n.focus?.(),n}function vo(a,e){let t=a?.states?.[e]?.attributes?.group_members;return new Set(Array.isArray(t)?t:[])}var nc=524288;function ac(a,e){let t=a?.states?.[e];return!t||t.state==="unavailable"?!1:(Number(t.attributes?.supported_features)&nc)!==0}function Va(a,e,t){return e===t?"zelf":ac(a,e)?ic(a,e,t)?"mee":"los":"kan-niet"}function ic(a,e,t){if(vo(a,t).has(e))return!0;if(vo(a,t).size===0){let n=a?.states?.[e]?.attributes?.group_members;if(Array.isArray(n)&&n.includes(t))return!0}return!1}function ko(a,e,t){let n=Va(a,e,t);return n==="zelf"||n==="kan-niet"?null:n==="mee"?{domein:"media_player",service:"unjoin",data:{},doel:{entity_id:e}}:{domein:"media_player",service:"join",data:{group_members:[e]},doel:{entity_id:t}}}var rc=`
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
`,Pa=null,rn=a=>String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),Ba=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),Pa=Pa??[F(rc)],this.shadowRoot.adoptedStyleSheets=Pa,this.opruimen_=[],this.filter_="",this.lijst_=[]}connectedCallback(){this.gebouwd_||this.bouw_()}disconnectedCallback(){for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}bouw_(){this.shadowRoot.innerHTML=`
      <div class="laag">
        <header>
          <span class="wie"><b class="naam">Speaker kiezen</b><span class="sub"></span></span>
          <button class="rond sluit" type="button" aria-label="Sluiten">${v("close")}</button>
        </header>
        <div class="zoek">
          <label class="veld">
            ${v("search")}
            <input type="search" placeholder="Zoek een speaker" aria-label="Zoeken" />
          </label>
        </div>
        <div class="tel"></div>
        <div class="lijst" role="listbox"></div>
      </div>`,this.gebouwd_=!0;let e=(t,n,i)=>{t.addEventListener(n,i),this.opruimen_.push(()=>t.removeEventListener(n,i))};e(this.$(".sluit"),"click",()=>this.sluit()),e(this.$(".laag"),"click",t=>{t.target===this.$(".laag")&&this.sluit()}),e(this.$("input"),"input",t=>{this.filter_=t.target.value.trim().toLowerCase(),this.teken_()}),e(this.$("input"),"keydown",t=>{t.key==="Enter"&&this.$(".sp")?.click()}),e(this,"keydown",t=>{t.key==="Escape"&&this.hasAttribute("open")&&this.sluit()}),e(this.$(".lijst"),"click",t=>{let n=t.target.closest(".mee");if(n)return t.stopPropagation(),this.koppel_(n.dataset.id);let i=t.target.closest(".sp");i&&this.kies_(i.dataset.id)})}$(e){return this.shadowRoot.querySelector(e)}set hass(e){this.hass_=e,this.hasAttribute("open")&&this.gebouwd_&&this.teken_()}get hass(){return this.hass_}open(e,t,n,i){this.hass_=e,this.lijst_=Array.isArray(t)?t:[],this.huidig_=n,this.opKeuze_=i,this.filter_="",this.gebouwd_||this.bouw_(),this.$("input").value="",this.$(".zoek").hidden=this.lijst_.length<8,this.setAttribute("open",""),this.teken_(),this.$(".zoek").hidden||setTimeout(()=>this.$("input")?.focus(),60)}sluit(){this.removeAttribute("open")}teken_(){let e=this.lijst_,t=this.filter_?e.filter(i=>String(E(this.hass,i)).toLowerCase().includes(this.filter_)):[...e];this.$(".sub").textContent=this.huidig_?`Nu: ${E(this.hass,this.huidig_)}`:"",this.$(".tel").textContent=this.filter_?`${t.length} van ${e.length}`:`${e.length} speaker${e.length===1?"":"s"}`;let n=this.$(".lijst");if(!t.length){n.innerHTML='<div class="leeg">Niets gevonden.</div>';return}n.innerHTML=t.map(i=>{let r=b(this.hass,i),o=i===this.huidig_,s=Fe(r)?"Uit":nn(r,c=>J(this.hass,c)),l=Va(this.hass,i,this.huidig_),d=l==="mee";return`<div class="rij">
                  <button class="sp" type="button" role="option" data-id="${rn(i)}"
                    data-speelt="${ut(r)}" data-uit="${Fe(r)}"
                    aria-current="${o}" aria-selected="${o}">
                    <span class="ico">${v(gt(r),"speaker")}</span>
                    <span class="tekst">
                      <b>${rn(E(this.hass,i))}</b>
                      <span>${rn(d?`${s} \xB7 speelt mee`:s)}</span>
                    </span>
                    ${o?'<span class="nu">NU</span>':""}
                  </button>
                  <button class="mee" type="button" data-id="${rn(i)}"
                    aria-pressed="${d}" ${l==="zelf"||l==="kan-niet"?"disabled":""}
                    ${l==="zelf"?"hidden":""}
                    aria-label="${d?"Laat deze speaker niet meer meespelen":"Laat deze speaker meespelen"}"
                    title="${l==="kan-niet"?"Deze speaker laat zich niet koppelen":d?"Speelt mee \u2014 tik om los te koppelen":"Laat meespelen met wat er nu speelt"}">
                    ${v(d?"volume":"speakers")}<span>${d?"MEE":"ERBIJ"}</span>
                  </button>
                </div>`}).join("")}koppel_(e){let t=ko(this.hass,e,this.huidig_);t&&this.hass.callService(t.domein,t.service,t.data,t.doel)}kies_(e){e&&(this.opKeuze_?.(e),this.sluit())}};O("domotiapp-speler-kiezer",Ba);function xo(a,e,t,n){let i=document.querySelector("domotiapp-speler-kiezer");return i||(i=document.createElement("domotiapp-speler-kiezer"),document.body.appendChild(i)),i.tabIndex=-1,i.open(a,e,t,n),i.focus?.(),i}var Ka=[15,30,45,60,90],Ga=30;function _o(a){let e=Math.max(0,Math.round(a)),t=Math.floor(e/3600),n=Math.floor(e%3600/60),i=e%60,r=t?String(n).padStart(2,"0"):String(n);return`${t?`${t}:`:""}${r}:${String(i).padStart(2,"0")}`}function Ua(a,{min:e=1,max:t=720}={}){let n=String(a??"").trim();if(!/^\d+$/.test(n))return null;let i=Number(n);return i>=e&&i<=t?i:null}var oc=`
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
`,Wa=class extends HTMLElement{static get sheet_(){return Object.hasOwn(this,"s_")||(this.s_=F(oc)),this.s_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[this.constructor.sheet_]}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.shadowRoot.innerHTML=`
      <div class="laag">
        <div class="vak" role="dialog" aria-modal="true" aria-label="Sleeptimer">
          <header>
            <span class="ic">${v("sleep")}</span>
            <span class="t">
              <h2>Sleeptimer</h2>
              <span class="waar"></span>
            </span>
            <button class="sluit" type="button" aria-label="Sluiten">${v("close")}</button>
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
      </div>`,this.$(".snel").innerHTML=Ka.map(e=>`<button type="button" data-m="${e}" aria-pressed="false">${e}</button>`).join(""),this.$(".sluit").addEventListener("click",()=>this.dicht_()),this.$(".laag").addEventListener("click",e=>{e.target===this.$(".laag")&&this.dicht_()}),this.addEventListener("keydown",e=>{e.key==="Escape"&&this.dicht_(),e.key==="Enter"&&!this.hasAttribute("loopt")&&this.start_()}),this.$(".snel").addEventListener("click",e=>{let t=e.target.closest("[data-m]");t&&(this.$(".min").value=t.dataset.m,this.markeer_())}),this.$(".min").addEventListener("input",()=>this.markeer_()),this.$(".doe").addEventListener("click",()=>this.start_()),this.$(".weg").addEventListener("click",()=>this.stop_()),this.gebouwd_=!0}markeer_(){let e=this.$(".min").value.trim();for(let t of this.$(".snel").querySelectorAll("[data-m]"))t.setAttribute("aria-pressed",String(t.dataset.m===e));this.$(".fout").hidden=!0}async open(e,t,n){this.gebouwd_||this.bouw_(),this.hass=e,this.entity_=t,this.$(".waar").textContent=n??t,this.$(".min").value=String(Ka[1]),this.$(".fade").value=String(Ga),this.markeer_(),this.setAttribute("open",""),this.tabIndex=-1,this.focus?.(),await this.haalStand_(),this.hasAttribute("loopt")||setTimeout(()=>this.$(".min")?.focus(),60)}dicht_(){this.removeAttribute("open"),clearInterval(this.tik_),this.tik_=null}async haalStand_(){let e=null;try{e=((await this.hass.callWS({type:"domotiapp_lovelace/media/sleeptimer/list"}))?.timers??[]).find(n=>n.entity_id===this.entity_)??null}catch{e=null}this.toon_(e)}toon_(e){if(clearInterval(this.tik_),this.tik_=null,this.$(".weg").hidden=!e,!e){this.removeAttribute("loopt"),this.$(".doe").textContent="Starten",this.$(".doe").hidden=!1;return}this.setAttribute("loopt",""),this.$(".doe").textContent="Opnieuw instellen",this.$(".doe").hidden=!1,this.$(".uitleg").textContent=e.fade?`De laatste ${e.fade} seconden zakt het volume weg, daarna pauzeert de muziek en gaat het volume terug.`:"Aan het eind pauzeert de muziek.";let t=Date.parse(e.ends_at),n=()=>{let i=(t-Date.now())/1e3;this.$(".rest").textContent=_o(i),i<=0&&(clearInterval(this.tik_),this.tik_=null,setTimeout(()=>this.hasAttribute("open")&&this.haalStand_(),1500))};n(),this.tik_=setInterval(n,1e3)}async start_(){if(this.hasAttribute("loopt")){this.removeAttribute("loopt"),this.$(".doe").textContent="Starten",clearInterval(this.tik_),this.tik_=null,setTimeout(()=>this.$(".min")?.focus(),40);return}let e=Ua(this.$(".min").value);if(e===null){this.melding_("Vul een heel aantal minuten in, tussen 1 en 720.");return}let t=Ua(this.$(".fade").value,{min:0,max:600})??Ga;try{let n=await this.hass.callWS({type:"domotiapp_lovelace/media/sleeptimer/set",entity_id:this.entity_,minutes:e,fade:t});this.toon_(n)}catch(n){this.melding_(n?.message??"De sleeptimer kon niet gezet worden. Is DomotiApp Lovelace klaar met opstarten?")}}async stop_(){try{await this.hass.callWS({type:"domotiapp_lovelace/media/sleeptimer/cancel",entity_id:this.entity_})}catch{}await this.haalStand_()}melding_(e){let t=this.$(".fout");t.textContent=e,t.hidden=!1}};O("domotiapp-sleeptimer",Wa);function wo(a,e,t){let n=document.querySelector("domotiapp-sleeptimer");return n||(n=document.createElement("domotiapp-sleeptimer"),document.body.appendChild(n)),n.open(a,e,t??E(a,e)),n}var on={power:{icon:"power",label:"Aan of uit"},prev:{icon:"prev",label:"Vorige"},play:{icon:"play",label:"Afspelen of pauzeren"},stop:{icon:"stop",label:"Stoppen"},next:{icon:"next",label:"Volgende"},shuffle:{icon:"shuffle",label:"Willekeurig afspelen"},repeat:{icon:"repeat",label:"Herhalen"},search:{icon:"search",label:"Zoeken in Music Assistant"},sleep:{icon:"sleep",label:"Sleeptimer"}},sn=class extends M{setConfig(e){this.ruw_=e,super.setConfig(this.metSpeler_(e))}metSpeler_(e){if(!e?.speaker_select)return e;let t=Oa(e,this.hass),n=eo(e,t,this.opslag_());return n&&n!==e.entity?{...e,entity:n}:e}set hass(e){let t=!this.hass_;if(super.hass=e,!t||!this.ruw_?.speaker_select)return;let n=this.metSpeler_(this.ruw_);n.entity&&n.entity!==this.config?.entity&&super.setConfig(n)}get hass(){return super.hass}opslag_(){try{return window.localStorage}catch{return null}}spelers_(){return Oa(this.ruw_??this.config,this.hass)}groepsSpelers_(){let e=this.config.speakers;return Array.isArray(e)&&e.length||!this.config.speaker_select?e:this.spelers_()}kiesSpeler_(e){!e||e===this.config.entity||(to(this.opslag_(),this.spelers_(),e),super.setConfig({...this.ruw_,entity:e}))}validate(e){return e.entity?{layout:"row",show_artwork:!0,show_volume:!0,show_source:!0,show_controls:!0,show_search:!0,...e}:{...e,[T]:e.speaker_select?"Zet er een mediaspeler in, of wacht tot Home Assistant er een meldt.":"Kies een mediaspeler."}}watched(){return[this.config.entity,this.config.volume_entity].filter(Boolean)}tone_(){return this.config.tone?U(this.config.tone):$.accent}groot_(){return this.config.layout==="groot"}template(){return this.config.bare&&this.setAttribute("bare",""),this.setAttribute("layout",this.groot_()?"groot":"row"),`
      <div class="card surface" style="--tone:${this.tone_()}">
        ${this.config.speaker_select?`<button type="button" class="spelers" data-k="speler">
                 ${v("speakers")}
                 <span class="waar"></span>
                 <span class="pijl">${v("chevronDown")}</span>
               </button>`:""}
        ${this.groot_()?'<div class="hoesgroot" role="button" tabindex="0"></div>':""}
        <div class="top" data-on="false">
          <span class="chip" role="button" tabindex="0"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="ctl"></span>
        </div>
        <div class="vol" hidden></div>
        <div class="extra" hidden></div>
      </div>`}wire(){let e=this.config,t=(s,l)=>me(this,this.hass,e,e[s]??l);this.teardown_.push(R(this.$(".card"))),this.teardown_.push(B(this.$(".top"),{onTap:()=>t("tap_action",{action:"more-info"}),onHold:()=>t("hold_action",{action:"more-info"})}));let n=this.$(".chip");this.teardown_.push(B(n,{onTap:()=>t("icon_tap_action",ot(e.entity)),onHold:()=>t("icon_hold_action",{action:"more-info"})})),this.on(n,"click",s=>s.stopPropagation()),this.on(n,"pointerdown",s=>s.stopPropagation());let i=this.$(".hoesgroot");i&&(this.teardown_.push(B(i,{onTap:()=>t("icon_tap_action",ot(e.entity)),onHold:()=>t("icon_hold_action",{action:"more-info"})})),this.on(i,"click",s=>s.stopPropagation()),this.on(i,"pointerdown",s=>s.stopPropagation()));let r=s=>{let l=s.target.closest?.("[data-k]");l&&(s.stopPropagation(),this.doe_(l.dataset.k))},o=this.$(".spelers");o&&(this.on(o,"click",r),this.on(o,"pointerdown",s=>s.stopPropagation())),this.on(this.$(".ctl"),"click",r),this.on(this.$(".vol"),"click",r),this.on(this.$(".extra"),"click",r),this.on(this.$(".ctl"),"pointerdown",s=>s.stopPropagation()),this.on(this.$(".vol"),"pointerdown",s=>s.stopPropagation()),this.on(this.$(".extra"),"pointerdown",s=>s.stopPropagation()),this.sliders_=new Map}doe_(e){let t=this.config.entity,n=b(this.hass,t),i=(r,o={})=>this.hass.callService("media_player",r,{entity_id:t,...o});switch(e){case"power":return i(Fe(n)?"turn_on":"turn_off");case"bron":return bo(this.hass,t,E(this.hass,t,this.config.name));case"prev":return i("media_previous_track");case"next":return i("media_next_track");case"play":return i(ut(n)?"media_pause":"media_play");case"stop":return i("media_stop");case"mute":{let r=Ne(this.config);return this.hass.callService("media_player","volume_mute",{is_volume_muted:!mt(b(this.hass,r))},{entity_id:r})}case"vol-":case"vol+":return this.hass.callService("media_player",e==="vol+"?"volume_up":"volume_down",{},{entity_id:Ne(this.config)});case"shuffle":return this.hass.callService("media_player","shuffle_set",{shuffle:!Ma(n)},{entity_id:t});case"repeat":return this.hass.callService("media_player","repeat_set",{repeat:Yr(Sa(n))},{entity_id:t});case"speler":{let r=this.spelers_();return xo(this.hass,r,t,o=>this.kiesSpeler_(o))}case"sleep":return wo(this.hass,t,E(this.hass,t,this.config.name));case"search":return fo(this.hass,t,E(this.hass,t,this.config.name),{radioModus:this.config.radio_mode===!0,speakers:this.groepsSpelers_()});default:return}}paint(){let e=this.config,t=b(this.hass,e.entity),n=!t||t.state==="unavailable",i=Fr(t),r=this.$(".top");r.dataset.on=String(i),r.classList.toggle("unavailable",n),this.$(".card").style.setProperty("--tone",this.tone_());let o=this.$(".chip"),s=e.show_artwork===!1?null:Ht(this.hass,e.entity,e.icon),l=s?`pic:${s}`:e.icon||gt(t);o.dataset.icon!==l&&(o.dataset.icon=l,o.classList.toggle("pic",!!s),o.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:v(l,"speaker")),o.style.setProperty("--tone",i&&!s?this.tone_():"var(--dac-ink-3)");let d=this.$(".hoesgroot");d&&d.dataset.icon!==l&&(d.dataset.icon=l,d.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:v(e.icon||gt(t),"speaker"));let c=E(this.hass,e.entity,e.name),p=nn(t,g=>J(this.hass,g)),h=this.$(".spelers");if(h){let g=E(this.hass,e.entity);this.text(".spelers .waar",g),h.setAttribute("aria-label",`Speaker kiezen. Nu: ${g}`)}this.text(".nm",c),this.text(".st",p),o.setAttribute("aria-label",`${c} afspelen of pauzeren`),this.$(".hoesgroot")?.setAttribute("aria-label",`${c} afspelen of pauzeren`),r.setAttribute("aria-label",`${c}, ${p}`),this.paintKnoppen_(t,n),this.paintVolume_(t,n),this.paintExtra_(t,n),D(this.$(".card"))}paintKnoppen_(e,t){let n=this.$(".ctl"),i=this.config.show_controls===!1||t?[]:Zr(e),r=i.join(",");n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=i.map(s=>`<button class="k ${s==="play"||s==="stop"?"hoofd":""}" type="button" data-k="${s}" aria-label="${on[s].label}">${v(on[s].icon)}</button>`).join(""));let o=n.querySelector('[data-k="play"]');if(o){let s=ut(e)?"pause":"play";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=v(s))}}paintVolume_(e,t){let n=this.$(".vol"),i=Ne(this.config),r=i===this.config.entity?e:b(this.hass,i),o=this.config.show_volume===!1||t?[]:Ea(r),s=t?null:Qr(e,{tonen:this.config.show_source!==!1});if(n.hidden=!o.length&&!s,n.hidden){n.dataset.sig="",this.sliders_?.delete("volume");return}let l=Xr(r)&&(o.includes("slider")||o.includes("steps")),d=[...o,s?"bron":"",l?"pct":""].join(",");n.dataset.sig!==d&&(n.dataset.sig=d,n.innerHTML=(o.includes("mute")?`<button class="k" type="button" data-k="mute" aria-label="Dempen">${v("volume")}</button>`:"")+(o.includes("slider")?le("volume"):"")+(o.includes("steps")?`<button class="k" type="button" data-k="vol-" aria-label="Zachter">${v("minus")}</button><button class="k" type="button" data-k="vol+" aria-label="Harder">${v("plus")}</button>`:"")+(l?'<span class="pct tnum"></span>':"")+(s?`<button class="bronknop" type="button" data-k="bron">${v("tv")}<b></b></button>`:""),this.sliders_?.delete("volume"),n.querySelector(".slider")?.setAttribute("aria-label","Volume"));let c=n.querySelector(".bronknop");if(c){let k=s.nu||"Bron";this.text(c.querySelector("b"),k),c.setAttribute("aria-label",`Bron kiezen, nu ${k}`),c.title=`Kies uit ${s.aantal} bronnen`}let p=mt(r),h=je(r),g=n.querySelector('[data-k="mute"]');if(g){let k=p?"volumeMute":"volume";g.dataset.icon!==k&&(g.dataset.icon=k,g.innerHTML=v(k)),g.setAttribute("aria-pressed",String(p))}let m=n.querySelector(".slider");m&&(this.attach_(m,"volume",{value:()=>je(b(this.hass,Ne(this.config))),onInput:k=>this.setSlider_(m,k),onCommit:k=>this.hass.callService("media_player","volume_set",{volume_level:k/100},{entity_id:Ne(this.config)}),disabled:()=>ee(b(this.hass,Ne(this.config)))}),m.classList.contains("dragging")||this.setSlider_(m,h)),l&&this.text(".pct",p?"Gedempt":`${h}%`)}paintExtra_(e,t){let n=this.$(".extra"),i=t||this.config.show_controls===!1?[]:Na(e,{zoeken:this.config.show_search!==!1,sleep:this.config.sleep_timer===!0});n.hidden=!i.length;let r=i.join(",");if(n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=i.map((c,p)=>`${c==="search"&&p>0?'<span class="rek"></span>':""}<button class="k" type="button" data-k="${c}" aria-label="${on[c].label}">${v(on[c].icon)}</button>`).join("")),!i.length)return;let o=n.querySelector('[data-k="shuffle"]');o&&o.setAttribute("aria-pressed",String(Ma(e)));let s=n.querySelector('[data-k="repeat"]');if(s){let c=Sa(e),p=c==="one"?"repeatOne":"repeat";s.dataset.icon!==p&&(s.dataset.icon=p,s.innerHTML=v(p)),s.setAttribute("aria-pressed",String(c!=="off")),s.setAttribute("aria-label",{off:"Herhalen: uit",all:"Herhalen: alles",one:"Herhalen: dit nummer"}[c])}let l=document.querySelector("domotiapp-media-browser");l?.hasAttribute("open")&&(l.hass=this.hass);let d=document.querySelector("domotiapp-speler-kiezer");d?.hasAttribute("open")&&(d.hass=this.hass)}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let i=we(e,n);this.sliders_.set(t,i),this.teardown_.push(i)}setSlider_(e,t){e&&(e.style.setProperty("--v",`${t}%`),e.setAttribute("aria-valuenow",String(t)),this.text(".pct",`${t}%`))}getCardSize(){if(this.config?.layout==="groot")return 8;let e=b(this.hass,this.config?.entity);return 1+(Ea(e).length?1:0)+(Na(e).length?1:0)}getGridOptions(){let e=this.config?.layout==="groot",t=this.minRijen_(".card",e?6:this.getCardSize());return e?{columns:12,rows:"auto",min_columns:6,min_rows:t}:{columns:12,rows:"auto",min_columns:4,min_rows:t}}static getConfigElement(){return document.createElement("domotiapp-media-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("media_player."));return n?{entity:n}:{}}};y(sn,"css",`
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
  `);var qa=class extends C{defaults(){return{layout:"row",show_artwork:!0,show_volume:!0,show_source:!0,show_controls:!0,show_search:!0,icon_tap_action:{action:"toggle"},tap_action:{action:"more-info"}}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"speaker"}]}schema(){return[{name:"entity",selector:f.entity("media_player")},{name:"name",selector:f.text()},{name:"speaker_select",selector:f.bool()},{name:"players",selector:{entity:{domain:"media_player",multiple:!0}}},{name:"layout",selector:f.select([{value:"row",label:"Rij (\xE9\xE9n rasterrij hoog)"},{value:"groot",label:"Groot (telefoonformaat, grote knoppen)"}])},{name:"volume_entity",selector:f.entity("media_player")},{name:"show_artwork",selector:f.bool()},{name:"show_controls",selector:f.bool()},{name:"show_volume",selector:f.bool()},{name:"show_source",selector:f.bool()},{name:"radio_mode",selector:f.bool()},{name:"speakers",selector:{entity:{domain:"media_player",integration:"music_assistant",multiple:!0}}},{name:"show_search",selector:f.bool()},{name:"sleep_timer",selector:f.bool()},{name:"icon_tap_action",selector:f.action("toggle")},{name:"icon_hold_action",selector:f.action("more-info")},{name:"tap_action",selector:f.action("more-info")},{name:"hold_action",selector:f.action("more-info")}]}label(e){return{entity:"Mediaspeler",name:"Naam (overschrijft die van de speler)",speaker_select:"Algemene mediaspeler",players:"Welke speakers je mag kiezen",layout:"Vorm",volume_entity:"Geluid van (optioneel)",show_artwork:"Albumhoes tonen",show_controls:"Knoppen tonen",show_volume:"Volume tonen",show_source:"Bronknop tonen",radio_mode:"Doorspelen na een nummer",speakers:"Speakers om mee te groeperen",show_search:"Zoeken en groeperen tonen",sleep_timer:"Sleeptimer tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Welke knoppen er verschijnen leest de kaart uit de speler zelf: wat hij niet kan, komt er niet op.";if(e.name==="speaker_select")return"De kaart krijgt er een balk bij waarmee je kiest waar de muziek heen gaat. De speler hierboven is de standaard; de keuze wordt per apparaat onthouden, dus je telefoon en de tablet in de gang kunnen op iets anders staan.";if(e.name==="players")return"Laat je dit leeg, dan staan de speakers van Music Assistant in de lijst -- geen televisies of streamers, want daar stuur je geen muziek naartoe. Vul je er zelf een paar in, dan is dat de lijst, wat er ook in staat.";if(e.name==="layout")return"Groot is bedoeld voor een pop-up of een kolom waar de kaart alle ruimte krijgt: grote hoes, grote knoppen.";if(e.name==="volume_entity")return"Zit het geluid ergens anders dan het beeld \u2014 een tv met een soundbar eronder \u2014 kies dan hier de speler die het volume regelt. Leeg laten betekent: de speler zelf.";if(e.name==="show_artwork")return"Speelt er iets met een hoes, dan vult die de chip. Een eigen icoon gaat voor.";if(e.name==="show_volume")return"De volumeregel verschijnt zodra er iets speelt en verdwijnt als de speler uit gaat.";if(e.name==="sleep_timer")return"Zet er een knop bij waarmee je instelt hoe lang de muziek nog mag doorspelen. De laatste seconden zakt het volume weg, daarna pauzeert de speler en gaat het volume terug naar waar het stond. De timer loopt in Home Assistant zelf, dus hij telt gewoon door als je je telefoon weglegt.";if(e.name==="speakers")return'De speakers die onderin het zoekscherm staan om samen te laten spelen. Laat je dit leeg op een algemene mediaspeler, dan zijn dat dezelfde speakers als in de keuzelijst; op een gewone kaart valt hij terug op het label "Music Assistant Media" in Home Assistant.';if(e.name==="radio_mode")return"Zoals Spotify: is het gekozen nummer klaar, dan zoekt Music Assistant er zelf muziek bij in plaats van te stoppen. Staat dit uit, dan kan het nog steeds per keer via het menu bij een treffer.";if(e.name==="show_source")return"Voor een tv-ontvanger of een versterker met ingangen: een knop met de zender die nu aanstaat, die een zoekbaar overzicht opent. Kan de speler geen bron kiezen, dan verschijnt hij niet.";if(e.name==="show_search")return"De zoekknop opent Music Assistant over het hele scherm. Alleen bij een speler van Music Assistant; groeperen komt erbij als de speler dat aankan."}};H("domotiapp-media-card-editor",qa);N("domotiapp-media-card",sn,{name:"DomotiApp Mediaspeler",description:"Wat er speelt, de knoppen die de speler aankan, en het volume."});var bt=[{sleutel:"smoke",label:"Rook",icoon:"smoke",alarm:"Rook gedetecteerd",rust:"Geen"},{sleutel:"co",label:"Koolmonoxide",icoon:"co",alarm:"Koolmonoxide gedetecteerd",rust:"Geen"},{sleutel:"heat",label:"Warmte",icoon:"thermo",alarm:"Te warm",rust:"Normaal"},{sleutel:"temperature",label:"Temperatuur",icoon:"thermo",meting:!0},{sleutel:"battery",label:"Batterij",icoon:"battery",meting:!0}],yo=a=>a?.rust??"Rustig",Fa=20;function Za(a){if(!a||a.state==="unavailable"||a.state==="unknown")return null;if(String(a.entity_id??"").startsWith("binary_sensor."))return a.state==="on"?0:null;let e=Number(a.state);return Number.isFinite(e)?e:null}var sc=a=>!!a&&a.state==="on",lc=a=>!a||a.state==="unavailable"||a.state==="unknown";function zo(a,e){let t=a.filter(i=>!i.meting);for(let i of t)if(sc(e(i.sleutel)))return{soort:"alarm",tekst:i.alarm,tone:"bad",icoon:i.icoon};if(a.length&&a.every(i=>lc(e(i.sleutel))))return{soort:"weg",tekst:"Niet bereikbaar",tone:"neutral",icoon:"smokeDetector"};let n=Za(e("battery"));return n!=null&&n<=Fa?{soort:"batterij",tekst:`Batterij bijna leeg (${Math.round(n)}%)`,tone:"warn",icoon:"battery"}:t.length?{soort:"goed",tekst:"Alles rustig",tone:"good",icoon:"smokeDetector"}:{soort:"meting",tekst:"",tone:"accent",icoon:"smokeDetector"}}var dc={good:$.good,warn:$.warn,bad:$.bad,neutral:$.neutral,accent:$.accent},ln=class extends M{validate(e){return bt.filter(n=>e[n.sleutel]).length?{...e}:{...e,[T]:"Kies minstens \xE9\xE9n entiteit: rook, koolmonoxide, warmte, temperatuur of batterij."}}watched(){return bt.map(e=>this.config[e.sleutel]).filter(Boolean)}gekozen_(){return bt.filter(e=>this.config[e.sleutel])}toestand_(){let e=zo(this.gekozen_(),t=>b(this.hass,this.config[t]));return{...e,tone:dc[e.tone]??$.accent}}batterijPct_(){return Za(b(this.hass,this.config.battery))}template(){this.config.bare&&this.setAttribute("bare","");let e=this.gekozen_().map(t=>`<span class="pil" data-soort="${t.sleutel}" title="${t.label}">${v(t.icoon)}<b></b></span>`).join("");return`
      <div class="card surface">
        <div class="top" role="button" tabindex="0" style="--tone:${$.good}">
          <span class="chip"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
        </div>
        <div class="meta">${e}</div>
      </div>`}wire(){let e=this.config,t=this.gekozen_()[0];this.teardown_.push(B(this.$(".top"),{onTap:()=>e.tap_action?me(this,this.hass,e,e.tap_action):V(this,e.smoke??e[t.sleutel]),onHold:()=>me(this,this.hass,e,e.hold_action??{action:"more-info"})})),this.$$(".pil").forEach(i=>{let r=e[i.dataset.soort];r&&(this.on(i,"click",o=>{o.stopPropagation(),V(this,r)}),this.on(i,"pointerdown",o=>o.stopPropagation()),i.style.cursor="pointer")});let n=this.$(".card");if(n&&typeof ResizeObserver=="function"){let i=new ResizeObserver(()=>this.pasAan_());i.observe(n),this.teardown_.push(()=>i.disconnect())}this.teardown_.push(R(this.$(".card")))}paint(){let e=this.config,t=this.toestand_(),n=this.$(".top");this.toggleAttribute("alarm",t.soort==="alarm"),n.style.setProperty("--tone",t.tone),n.classList.toggle("unavailable",t.soort==="weg");let i=this.$(".chip"),r=e.icon||t.icoon;i.dataset.icon!==r&&(i.dataset.icon=r,i.innerHTML=v(r,"smoke")),i.style.setProperty("--tone",t.tone);let o=this.gekozen_()[0];this.text(".nm",e.name||E(this.hass,e.smoke??e[o.sleutel],null)),this.text(".st",t.tekst),n.setAttribute("aria-label",`${this.$(".nm").textContent}${t.tekst?`, ${t.tekst}`:""}`),this.$$(".pil").forEach(s=>this.paintPil_(s)),this.$(".meta").hidden=this.gekozen_().length<=1&&!this.config.always_meta,this.pasAan_(),D(this.$(".card"))}pasAan_(){let e=this.$(".meta");if(!e||e.hidden)return;let t=()=>{let i=e.querySelector(".pil")?.offsetHeight??0;return i&&Math.round((e.scrollHeight+i/2)/i-.5)||1};this.removeAttribute("krapper"),!(t()<=1)&&this.setAttribute("krapper","")}paintPil_(e){let t=bt.find(s=>s.sleutel===e.dataset.soort),n=b(this.hass,this.config[t.sleutel]),i=e.querySelector("b"),r=s=>e.setAttribute("aria-label",`${t.label}: ${s}`);if(!n||ee(n)){i.textContent="\u2014",r("onbekend"),e.dataset.let="";return}if(t.meting){let s=n.attributes.unit_of_measurement??"",l=Number(n.state);i.textContent=Number.isFinite(l)?`${q(this.hass,l,t.sleutel==="temperature"?1:0)} ${s}`.trim():J(this.hass,n);let d=t.sleutel==="battery"?this.batterijPct_():null;e.dataset.let=d!=null&&d<=Fa?"warn":"",r(i.textContent);return}let o=te(n);i.textContent=o?"Alarm":yo(t),r(i.textContent),e.dataset.let=o?"bad":""}regels_(){return this.gekozen_().length>1?2:1}getCardSize(){return this.regels_()}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",this.regels_())}}static getConfigElement(){return document.createElement("domotiapp-smoke-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("binary_sensor.")&&/rook|smoke/i.test(i));return n?{smoke:n}:{}}};y(ln,"css",`
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
  `);var Xa=class extends C{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"smoke"}]}schema(){return[{name:"name",selector:f.text()},{name:"smoke",selector:f.entity()},{name:"co",selector:f.entity()},{name:"heat",selector:f.entity()},{name:"temperature",selector:f.entity()},{name:"battery",selector:f.entity()},{name:"tap_action",selector:f.action("more-info")},{name:"hold_action",selector:f.action("more-info")}]}label(e){return{name:"Naam (overschrijft die van de melder)",smoke:"Rook",co:"Koolmonoxide",heat:"Warmte",temperature:"Temperatuur",battery:"Batterij",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="smoke")return"Alle vijf zijn optioneel: vul in wat je melder heeft. Wat je leeg laat, komt niet op de kaart.";if(e.name==="battery")return"Een percentage of een 'batterij bijna leeg'-sensor. Onder de 20% meldt de kaart het uit zichzelf."}};H("domotiapp-smoke-card-editor",Xa);N("domotiapp-smoke-card",ln,{name:"DomotiApp Rookmelder",description:"Rook, koolmonoxide, warmte, temperatuur en batterij \u2014 alles optioneel."});var cc=["zo","ma","di","wo","do","vr","za"],jo=5,$o=8,dn=class extends M{validate(e){if(!e.entity)return{...e,[T]:"Kies een weerentiteit."};let t=Math.min(Math.max(1,Number(e.days)||jo),$o);return{show_current:!0,forecast_type:"daily",...e,days:t}}watched(){return[this.config.entity]}template(){this.config.bare&&this.setAttribute("bare","");let e=this.config;return`
      <div class="card surface">
        <div class="nu" role="button" tabindex="0" ${e.show_current===!1?"hidden":""}>
          <span class="chip" style="--tone:${$.accent}"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="graden tnum"></span>
        </div>
        <div class="rij" style="--n:${e.days}"></div>
      </div>`}wire(){this.teardown_.push(R(this.$(".card"))),this.teardown_.push(B(this.$(".nu"),{onTap:()=>V(this,this.config.entity),onHold:()=>V(this,this.config.entity)})),this.abonneer_()}async abonneer_(){let e=this.config;this.opzeggen_?.(),this.opzeggen_=null;let t=this.hass?.connection;if(!t?.subscribeMessage){this.forecastFout_="Geen verbinding voor de voorspelling.",this.paintRij_();return}try{let n=await t.subscribeMessage(i=>{this.forecast_=i?.forecast??[],this.forecastFout_=null,this.paintRij_()},{type:"weather/subscribe_forecast",forecast_type:e.forecast_type==="hourly"?"hourly":"daily",entity_id:e.entity});if(!this.isConnected){n();return}this.opzeggen_=n,this.teardown_.push(()=>{try{n()}catch{}this.opzeggen_=null})}catch{this.forecastFout_=e.forecast_type==="hourly"?"Deze weerbron geeft geen uurvoorspelling.":"Deze weerbron geeft geen dagvoorspelling.",this.paintRij_()}}paint(){let e=this.config,t=b(this.hass,e.entity),n=ee(t);this.$(".nu").classList.toggle("unavailable",n);let r=this.$(".chip"),o=e.icon||lt(t?.state);r.dataset.icon!==o&&(r.dataset.icon=o,r.innerHTML=v(o,"cloud")),this.text(".nm",E(this.hass,e.entity,e.name)),this.text(".st",n?"Niet bereikbaar":J(this.hass,t));let s=this.$(".graden"),l=t?.attributes?.temperature,d=t?.attributes?.temperature_unit??"\xB0C";s.innerHTML=l==null?"":`${q(this.hass,l,Number.isInteger(l)?0:1)}<small>${d}</small>`,this.paintRij_(),D(this.$(".card"))}paintRij_(){let e=this.$(".rij");if(!e)return;let t=this.config;if(this.forecastFout_&&!this.forecast_?.length){e.style.setProperty("--n",1),e.innerHTML=`<div class="leeg">${this.forecastFout_}</div>`;return}let n=(this.forecast_??[]).slice(0,t.days);if(!n.length){e.style.setProperty("--n",1),e.innerHTML='<div class="leeg">Nog geen voorspelling ontvangen\u2026</div>';return}e.style.setProperty("--n",n.length);let i=b(this.hass,t.entity)?.attributes?.temperature_unit??"";e.innerHTML=n.map((r,o)=>{let s=this.wanneer_(r.datetime,o),l=v(lt(r.condition),"cloud"),d=r.temperature==null?"":`${q(this.hass,r.temperature,0)}\xB0`,c=r.templow==null?"":`${q(this.hass,r.templow,0)}\xB0`,p=r.precipitation_probability==null?"":`<span class="nat">${v("drop")}${Math.round(r.precipitation_probability)}%</span>`;return`
          <div class="dag" style="--tone:${$.accent}">
            <span class="wanneer">${s}</span>
            ${l}
            <span class="max tnum">${d}</span>
            ${c?`<span class="min tnum">${c}</span>`:""}
            ${p}
          </div>`}).join("")}wanneer_(e,t){let n=new Date(e);if(Number.isNaN(+n))return"";if(this.config.forecast_type==="hourly")return`${String(n.getHours()).padStart(2,"0")}:00`;let i=new Date,r=n.getDate()===i.getDate()&&n.getMonth()===i.getMonth()&&n.getFullYear()===i.getFullYear();return t===0&&r?"vandaag":cc[n.getDay()]}regels_(){return this.config?.show_current===!1?1:2}getCardSize(){return this.regels_()+1}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-forecast-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("weather."));return n?{entity:n}:{}}};y(dn,"css",`
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
  `);var Ya=class extends C{defaults(){return{show_current:!0,forecast_type:"daily",days:jo}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"cloudSun"}]}schema(){return[{name:"entity",selector:f.entity("weather")},{name:"name",selector:f.text()},{name:"forecast_type",selector:f.select([{value:"daily",label:"Per dag"},{value:"hourly",label:"Per uur"}])},{name:"days",selector:f.number(1,$o)},{name:"show_current",selector:f.bool()}]}label(e){return{entity:"Weerentiteit",name:"Naam (overschrijft die van de weerbron)",forecast_type:"Voorspelling",days:"Hoeveel punten",show_current:"Nu-regel tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Meer hoeft er niet ingevuld te worden: de kaart leest zelf uit wat je weerbron levert.";if(e.name==="forecast_type")return"Niet elke weerbron kan allebei. Kan hij het niet, dan zegt de kaart dat in plaats van leeg te blijven."}};H("domotiapp-forecast-card-editor",Ya);N("domotiapp-forecast-card",dn,{name:"DomotiApp Weersvoorspelling",description:"Vandaag groot, de dagen erna op een rij. E\xE9n entiteit invullen."});var vt={OPEN:1,CLOSE:2,SET_POSITION:4,STOP:8},kt=(a,e)=>!!((a?.attributes?.supported_features??0)&e),pc=(a={})=>{switch(a.device_class){case"garage":return{open:"garageOpen",closed:"garageClosed"};case"awning":case"blind":return{open:"awning",closed:"awning"};default:return{open:"shutterOpen",closed:"shutter"}}},cn=class extends M{validate(e){let t=e.covers??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,covers:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[T]:"Kies minstens \xE9\xE9n rolluik of zonnescherm."}}watched(){return this.config.covers.map(e=>e.entity)}keysHtml(e){return`
      <div class="keys">
        <button type="button" data-act="open" aria-label="Open">${A.arrowUp}</button>
        ${e?`<button type="button" data-act="stop" aria-label="Stop">${A.stop}</button>`:""}
        <button type="button" data-act="close" aria-label="Dicht">${A.arrowDown}</button>
      </div>`}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`<div class="card surface">${e.covers.map((n,i)=>`
      <div class="cv" data-i="${i}" data-shown="closed" style="--tone:${U(n.tone??e.tone,"solar")}">
        <button class="chip" type="button" aria-label="Meer info"></button>
        <div class="txt"><div class="nm"></div><div class="st"></div></div>
        ${this.keysHtml(e.show_stop!==!1)}
        <div class="pos" hidden></div>
      </div>`).join("")}</div>`}wire(){this.dragging_=new Set,this.bound_=new Set,this.assumed_=new Map,this.$$(".cv").forEach(e=>{let t=e.dataset.i;e.querySelectorAll(".keys button").forEach(i=>{this.on(i,"click",()=>{let r=i.dataset.act,o={open:"open_cover",stop:"stop_cover",close:"close_cover"};this.hass.callService("cover",o[r],{entity_id:this.config.covers[+t].entity}),r!=="stop"&&(this.assumed_.set(t,r==="open"?"open":"closed"),this.paint())})});let n=this.config.covers[+t].entity;this.teardown_.push(B(e.querySelector(".chip"),{onTap:()=>V(this,n)}))})}paint(){this.$$(".cv").forEach(e=>{let t=e.dataset.i,n=this.config.covers[+t],i=b(this.hass,n.entity),r=Y(this.hass,n.entity),o=!i||i.state==="unavailable",s=i?.state??"unknown";e.classList.toggle("unavailable",o),e.querySelector(".nm").textContent=E(this.hass,n.entity,n.name);let l=kt(i,vt.SET_POSITION)&&r.current_position!=null,d=l?r.current_position>0?"open":"closed":s==="open"||s==="closed"?s:this.assumed_.get(t)??"closed";e.dataset.shown=d;let c=pc(r),p=(d==="open"?n.icon_open:n.icon_closed)??(d==="open"?this.config.icon_open:this.config.icon_closed)??n.icon??c[d],h=e.querySelector(".chip");h.dataset.icon!==p&&(h.dataset.icon=p,h.innerHTML=v(p,c[d]));let g=e.querySelector(".st");this.dragging_.has(t)||(g.textContent=o?"Niet bereikbaar":s==="opening"?"Gaat open":s==="closing"?"Gaat dicht":l?`${r.current_position}% open`:s==="open"?"Open":s==="closed"?"Dicht":""),e.querySelectorAll(".keys button").forEach(x=>{if(x.dataset.act==="stop"){x.disabled=o||!kt(i,vt.STOP);return}let z=x.dataset.act==="open";x.disabled=o||(z?!kt(i,vt.OPEN):!kt(i,vt.CLOSE))});let m=e.querySelector(".pos"),k=l&&this.config.show_position!==!1;if(m.hidden=!k,k){if(m.dataset.built||(m.dataset.built="1",m.innerHTML=le("position"),m.querySelector(".slider").setAttribute("aria-label","Positie")),!this.bound_.has(t)){this.bound_.add(t);let z=m.querySelector(".slider"),_=L=>{z.style.setProperty("--v",`${L}%`),z.setAttribute("aria-valuenow",String(L)),e.querySelector(".st").textContent=`${L}% open`};this.teardown_.push(we(z,{value:()=>Y(this.hass,n.entity).current_position??0,onInput:_,onCommit:L=>this.hass.callService("cover","set_cover_position",{entity_id:n.entity,position:L})}))}let x=m.querySelector(".slider");if(!x.classList.contains("dragging")){let z=r.current_position??0;x.style.setProperty("--v",`${z}%`),x.setAttribute("aria-valuenow",String(z))}}})}rows_(){let e=this.config?.covers??[],t=e.some(n=>kt(b(this.hass,n.entity),vt.SET_POSITION));return ge(12+Math.max(1,e.length)*42+(t?30:0))}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-cover-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("cover."));return{covers:n?[n]:[]}}};y(cn,"css",`
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
  `);var Qa=class extends C{defaults(){return{show_stop:!0,show_position:!0}}pickers(){return[{key:"icon_open",kind:"icon",label:"Icoon als het open staat",fallback:"shutterOpen"},{key:"icon_closed",kind:"icon",label:"Icoon als het dicht is",fallback:"shutter"}]}setConfig(e){let t={...e},n=(e.covers??e.entities??(e.entity?[e.entity]:[])).map(i=>typeof i=="string"?{entity:i}:i);t.covers=n.map(i=>i.entity);for(let i of n)i.name&&(t[`naam:${i.entity}`]=i.name);super.setConfig(t)}serialize(e){let t={...e},n=t.covers??[];t.covers=n.map(i=>{let r=t[`naam:${i}`];return r?{entity:i,name:r}:i});for(let i of Object.keys(t))i.startsWith("naam:")&&delete t[i];return t}schema(){let e=(this.config_?.covers??[]).filter(t=>typeof t=="string");return[{name:"covers",selector:{entity:{domain:"cover",multiple:!0}}},...e.map(t=>({name:`naam:${t}`,selector:f.text()})),{name:"show_stop",selector:f.bool()}]}label(e){if(e.name.startsWith("naam:")){let t=e.name.slice(5);return`Naam voor ${this.hass?.states?.[t]?.attributes?.friendly_name??t}`}return{covers:"Rolluiken",show_stop:"Stopknop tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="covers")return"Melden ze hun stand terug, dan komt er vanzelf een schuif bij. Zo niet, dan blijven het open, stop en dicht, en volgt het icoon de knop die je indrukt. Per rolluik kun je hieronder een eigen naam zetten."}};H("domotiapp-cover-card-editor",Qa);N("domotiapp-cover-card",cn,{name:"DomotiApp Rolluiken",description:"Open, stop en dicht, met een eigen icoon voor open en dicht."});function hc(a){if(!a)return{label:"Onbekend",home:null};switch(a.state){case"home":return{label:"Thuis",home:!0};case"not_home":return{label:"Afwezig",home:!1};case"unknown":case"unavailable":return{label:"Onbekend",home:null};default:return{label:a.state,home:!1}}}var pn=class extends M{validate(e){let t=e.persons??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,persons:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[T]:"Kies minstens \xE9\xE9n persoon."}}watched(){return this.config.persons.map(e=>e.entity)}template(){let e=this.config;e.bare&&this.setAttribute("bare","");let t=e.columns??Math.min(e.persons.length,6),n=e.persons.map((i,r)=>`
      <button class="p" type="button" data-i="${r}" style="--tone:var(--dac-ink-3)">
        <span class="av"><span class="ph"></span></span>
        <span class="nm"></span>
      </button>`).join("");return`<div class="card surface"><div class="chips" style="--cols:${t}">${n}</div></div>`}wire(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i];this.teardown_.push(B(e,{onTap:()=>V(this,t.entity)}))})}paint(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i],n=b(this.hass,t.entity),i=hc(n);e.style.setProperty("--tone",i.home===!0?"var(--dac-good)":i.home===!1?"var(--dac-bad)":"var(--dac-warn)");let r=E(this.hass,t.entity,t.name);this.text(e.querySelector(".nm"),r);let o=e.querySelector(".ph"),s=n?.attributes?.entity_picture,l=s?`img:${s}`:r?`ini:${r[0]}`:"icon";o.dataset.kind!==l&&(o.dataset.kind=l,o.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:r?r[0].toUpperCase():A.person),e.setAttribute("aria-label",`${r}, ${i.label}`)})}rows_(){let e=this.config?.columns??Math.min(this.config?.persons?.length??1,6),t=Math.ceil((this.config?.persons?.length??1)/e);return ge(10+t*45+(t-1)*6)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:"full",rows:e,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-person-card-editor")}static getStubConfig(e){return{persons:Object.keys(e?.states??{}).filter(n=>n.startsWith("person.")).slice(0,6)}}};y(pn,"css",`
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
  `);var Ja=class extends C{setConfig(e){let t={...e},n=(e.persons??[]).map(i=>typeof i=="string"?{entity:i}:i);t.persons=n.map(i=>i.entity);for(let i of n)i.name&&(t[`naam:${i.entity}`]=i.name);super.setConfig(t)}serialize(e){let t={...e},n=t.persons??[];t.persons=n.map(i=>{let r=t[`naam:${i}`];return r?{entity:i,name:r}:i});for(let i of Object.keys(t))i.startsWith("naam:")&&delete t[i];return t}schema(){let e=(this.config_?.persons??[]).filter(t=>typeof t=="string");return[{name:"persons",selector:{entity:{domain:["person","device_tracker"],multiple:!0}}},...e.map(t=>({name:`naam:${t}`,selector:f.text()}))]}label(e){if(e.name==="persons")return"Personen";if(e.name.startsWith("naam:")){let t=e.name.slice(5);return`Naam voor ${this.hass?.states?.[t]?.attributes?.friendly_name??t}`}return super.label(e)}helper(e){if(e.name==="persons")return"Thuis is groen, weg is rood, geen melding is oranje. Per persoon kun je hieronder een eigen naam zetten."}};H("domotiapp-person-card-editor",Ja);N("domotiapp-person-card",pn,{name:"DomotiApp Personen",description:"Wie er thuis is, compact. Het hele huishouden in \xE9\xE9n kaart."});var ei=a=>String(a??"").trim().split(/\s+/).filter(Boolean);function uc(a){let e=ei(a);return e.filter((n,i)=>i===0||n.toLowerCase()!==e[i-1].toLowerCase()).join(" ")}function mc(a){let e=a.map(ei).filter(i=>i.length);if(e.length<2)return 0;let t=0,n=Math.min(...e.map(i=>i.length));for(;t<n;){let i=e[0][t].toLowerCase();if(!e.every(r=>r[t].toLowerCase()===i))break;t++}return Math.min(t,n-1)}function ti(a){let e=a.map(n=>uc(n)),t=mc(e);return e.map(n=>{let i=ei(n),r=i.slice(t);return(r.length?r:i).join(" ")})}var gc=[[/gft|groente|tuin|organi/i,"teal","binWheeled"],[/pmd|plastic|verpakking/i,"solar","binWheeled"],[/papier|karton/i,"water","binWheeled"],[/rest|grijs/i,"neutral","binWheeled"],[/textiel|kleding/i,"pink","bin"],[/glas/i,"magenta","bin"],[/kerstboom|snoei|takken/i,"teal","bin"]];function fc(a){for(let[e,t,n]of gc)if(e.test(a))return{tone:t,icon:n};return{tone:"accent",icon:"bin"}}var Eo={"geen datum":"geen datum",voorbij:"is geweest","bestaat niet":"sensor ontbreekt"},Ao=a=>String(a??"").replace(/^(afvalbeheer|afvalwijzer|mijnafvalwijzer)\s*/i,"").replace(/\s*(mijnafvalwijzer)\s*/i," ").trim(),hn=class extends M{validate(e){let t=e.sensors??e.entities??(e.entity?[e.entity]:[]);return t.length?{show_hero:!0,show_list:!0,...e,sensors:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[T]:"Kies minstens \xE9\xE9n afvalsensor waarvan de status een datum is."}}watched(){return this.config.sensors.map(e=>e.entity)}read_(){let e=new Date,t=this.config.sensors.map(r=>{let o=b(this.hass,r.entity),s=o?st(o.state)??st(o.attributes.date)??st(o.attributes.next_date):null;return{cfg:r,st:o,date:s}}),n=t.map(r=>Ao(E(this.hass,r.cfg.entity,r.cfg.name))),i=ti(n);return t.map((r,o)=>{let s=r.cfg.label??i[o]??n[o],l=fc(r.cfg.label??r.cfg.entity+s),d=this.config.tones?.[r.cfg.entity];return{label:s,entity:r.cfg.entity,date:r.date,days:r.date?Rt(e,r.date):null,tone:U(d??r.cfg.tone??l.tone),icon:r.cfg.icon??l.icon,reden:r.st?r.date?Rt(e,r.date)<0?"voorbij":null:"geen datum":"bestaat niet"}}).sort((r,o)=>!r.reden&&!o.reden?r.date-o.date:r.reden?o.reden?r.label.localeCompare(o.label):1:-1)}komend_(e){return e.filter(t=>!t.reden)}breed_(){return this.config.layout==="breed"}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),this.setAttribute("vorm",this.breed_()?"breed":"lijst"),`
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
        <div class="breed"></div>
        <div class="empty" hidden>Geen ophaaldata gevonden. Controleer of de gekozen sensoren een datum als toestand hebben.</div>
      </div>`}paint(){let e=this.read_(),t=this.komend_(e),n=this.$(".hero"),i=this.$(".list"),r=this.$(".empty");if(r.hidden=e.length>0,this.breed_()){this.paintBreed_(e,t[0]);return}if(n&&(n.hidden=t.length===0,t.length)){let o=t[0];n.style.setProperty("--tone",o.tone),this.setAttribute("urgency",o.days===0?"today":o.days===1?"tomorrow":"later");let s=n.querySelector(".bin");s.dataset.icon!==o.icon&&(s.dataset.icon=o.icon,s.innerHTML=v(o.icon,"bin")),this.text(n.querySelector(".eyebrow"),It(o.date)),this.text(n.querySelector(".big"),o.label),this.text(n.querySelector(".n"),o.days===0?"nu":String(o.days)),this.text(n.querySelector(".u"),o.days===0?"aan de weg":o.days===1?"dag":"dagen")}if(i){let o=t[0],s=this.config.show_hero===!1?e:e.filter(d=>d!==o),l=s.map(d=>`${d.label}${+d.date}${d.reden??""}`).join("|");if(i.dataset.sig===l)return;i.dataset.sig=l,i.innerHTML=s.map(d=>{if(d.reden)return`
        <div class="r" data-stil="true" style="--tone:${d.tone}">
          <i></i><span>${I(d.label)}</span>
          <span class="d">${Eo[d.reden]??d.reden}</span>
        </div>`;let c=It(d.date),p=d.days<=6?`<small>${wr(d.date)}</small>`:"";return`
        <div class="r" style="--tone:${d.tone}">
          <i></i><span>${I(d.label)}</span>
          <span class="d">${c}${p}</span>
        </div>`}).join("")}}paintBreed_(e,t){let n=this.$(".breed");if(!n)return;let i=e.map(r=>`${r.label}|${+r.date}|${r.reden??""}`).join(",");n.dataset.sig!==i&&(n.dataset.sig=i,n.innerHTML=e.map(r=>{let o=r.reden?Eo[r.reden]??r.reden:r.days===0?"vandaag":r.days===1?"morgen":It(r.date);return`
          <div class="b" style="--tone:${r.tone}" data-eerst="${r===t}"
               data-stil="${!!r.reden}" title="${I(r.label)}">
            <i></i>
            <span class="t">
              <span class="n">${I(r.label)}</span>
              <span class="w">${I(o)}</span>
            </span>
          </div>`}).join(""))}rows_(){let e=this.config?.sensors?.length??1;return this.breed_()?Math.max(1,Math.ceil(e/4)):this.config?.show_list===!1?1:this.config?.show_hero===!1?Math.max(1,ge(20+e*33)):Math.max(2,e)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-waste-card-editor")}static getStubConfig(e){return{sensors:Object.keys(e?.states??{}).filter(n=>/afval|waste|trash|garbage|ophaal/i.test(n)&&n.startsWith("sensor.")).filter(n=>st(e.states[n]?.state)).slice(0,6),title:"Afvalkalender"}}};y(hn,"css",`
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
       mogelijk hoogte. */
    :host([vorm="breed"]) .card {
      flex-direction: row; align-items: center; gap: 12px; padding: 8px 12px;
    }
    :host([vorm="breed"]) .head { flex: 0 0 auto; }
    :host([vorm="breed"]) .head b { font-size: 12.5px; }

    .breed { display: none; }
    :host([vorm="breed"]) .breed {
      display: grid; gap: 6px; flex: 1 1 auto;
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
  `);var ni=class extends C{defaults(){return{show_hero:!0,show_list:!0}}setConfig(e){let t={...e};for(let[n,i]of Object.entries(e.tones??{}))t[`kleur:${n}`]=i;delete t.tones,super.setConfig(t)}serialize(e){let t={...e},n={};for(let i of Object.keys(t))i.startsWith("kleur:")&&(t[i]&&(n[i.slice(6)]=t[i]),delete t[i]);return Object.keys(n).length?t.tones=n:delete t.tones,t}ids_(){return(this.config_?.sensors??[]).map(e=>typeof e=="string"?e:e.entity).filter(Boolean)}pickers(){let e=this.ids_(),t=ti(e.map(n=>Ao(this.hass?.states?.[n]?.attributes?.friendly_name??n)||n));return e.map((n,i)=>({key:`kleur:${n}`,kind:"tone",label:`Kleur voor ${t[i]||n}`,compact:!0,after:!0}))}schema(){return[{name:"sensors",selector:{entity:{domain:"sensor",multiple:!0}}},{name:"layout",selector:f.select([{value:"lijst",label:"Lijst (eerstvolgende uitgelicht)"},{value:"breed",label:"Over de breedte (veel lager)"}])}]}label(e){return{sensors:"Afvalsensoren",layout:"Vorm",show_hero:"Eerstvolgende uitlichten",show_list:"Overige data tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="layout")return"Over de breedte zet alle bakken naast elkaar in plaats van onder elkaar. Vier bakken passen dan op \xE9\xE9n rasterrij in plaats van vier \u2014 dat scheelt bijna tweehonderd pixels. De eerstvolgende licht op.";if(e.name==="sensors")return"Sensoren waarvan de status een datum is, bijvoorbeeld 18-08-2026. De kaart sorteert zelf; laat een kleur leeg om de bakkleur op de naam te laten kiezen."}};H("domotiapp-waste-card-editor",ni);N("domotiapp-waste-card",hn,{name:"DomotiApp Afvalkalender",description:"Eerstvolgende ophaling als hero, de rest eronder. Kleur per fractie."});function Te(a){if(a==null||a==="")return 4;let e=Math.round(Number(a));return Number.isFinite(e)?Math.min(6,Math.max(2,e)):4}function un(a,e=!0){if(typeof a=="string")return{name:"",icon:"",path:a,action:null,items:[]};let t=a??{};return{name:typeof t.name=="string"?t.name:"",icon:typeof t.icon=="string"?t.icon:"",path:typeof t.path=="string"?t.path:typeof t.url=="string"?t.url:typeof t.navigation_path=="string"?t.navigation_path:"",action:t.action&&typeof t.action=="object"?{...t.action}:null,items:e&&Array.isArray(t.items)?t.items.slice(0,8).map(n=>un(n,!1)):[]}}var Ee=a=>Array.isArray(a?.items)?a.items.filter(Ae):[],Mo=a=>Ee(a).length>0,Ae=a=>!!(a&&(a.name?.trim()||a.icon?.trim()||a.path?.trim()||a.action));function So(a){return(Array.isArray(a?.items)?a.items:[]).slice(0,20).map(t=>un(t))}var No=[{id:"domotitech",label:"DomotiTech",uitleg:"Opent domotitech.nl in een nieuw tabblad, met het logo erop.",bovenaan:!0,maak:()=>({name:"DomotiTech",icon:"domotitech",path:"https://domotitech.nl",action:null,items:[]})},{id:"herstart",label:"Herstart Home Assistant",uitleg:"Roept homeassistant.restart aan, met een bevestiging ervoor.",bovenaan:!0,maak:()=>({name:"Herstart",icon:"power",path:"",action:{action:"perform-action",perform_action:"homeassistant.restart",confirmation:{title:"Weet je het zeker?",text:"Weet je het zeker dat je Home Assistant wilt herstarten?"}},items:[]})}];function Oo(a,e,t=!1){let n=Array.isArray(a)?[...a]:[];if(n.length>=8)return{lijst:n,plek:-1};let i=t?0:n.length;return n.splice(i,0,e),{lijst:n,plek:i}}function mn(a,e=4){let t=(a??[]).filter(Ae),n=Te(e);if(t.length<=n)return{balk:t,meer:[],heeftMeer:!1};let i=Math.max(1,n-1);return{balk:t.slice(0,i),meer:t.slice(i),heeftMeer:!0}}function ai(a){if(a&&typeof a=="object")return a.action?a.action:ai(a.path);let e=String(a??"").trim();return e?/^[a-z][a-z0-9+.-]*:\/\//i.test(e)||e.startsWith("mailto:")?{action:"url",url_path:e}:{action:"navigate",navigation_path:e}:{action:"none"}}var kc=`
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
`,To=/^i(\d+)(s\d+)?$/,Do=a=>({...a.name?{name:a.name}:{},...a.icon?{icon:a.icon}:{},...a.path?{path:a.path}:{},...a.action?{action:structuredClone(a.action)}:{}}),Co=a=>a.filter(Ae).map(e=>{let t=(e.items??[]).filter(Ae).map(Do);return{...Do(e),...t.length?{items:t}:{}}}),ii=class extends HTMLElement{constructor(){super(),this.items_=[],this.rest_={},this.open_=new Set}setConfig(e){if(this.rest_={...e},delete this.rest_.items,this.gebouwd_&&e===this.uitObject_)return;let t=(Array.isArray(e?.items)?e.items:[]).map(n=>un(n));this.gebouwd_&&JSON.stringify(Co(t))===this.uit_||(this.items_=t,this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}connectedCallback(){this.gebouwd_||this.build_()}async build_(){if(!this.hass_)return;await customElements.whenDefined("ha-form"),this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=kc;let t=document.createElement("div");t.className="dac-nav",this.append(e,t),t.appendChild(this.kaartBlok_());let n=document.createElement("div");n.className="knoppen",t.appendChild(n);let{balk:i}=mn(this.items_,this.rest_.max),r=i.length,o=this.items_.filter(Ae);if(this.items_.forEach((l,d)=>{if(o.indexOf(l)===r&&o.length>r){let p=document.createElement("div");p.className="grens",p.textContent="Achter de meer-knop",n.appendChild(p)}n.appendChild(this.itemBlok_(l,d))}),!this.items_.length){let l=document.createElement("p");l.className="uitleg",l.textContent="Elke knop heeft een naam, een icoon en een pad -- bijvoorbeeld /lovelace/keuken voor een view op dit dashboard, of #keuken voor een pop-up. Wat er niet meer in de balk past valt vanzelf achter de meer-knop rechts.",t.appendChild(l)}let s=document.createElement("button");s.type="button",s.className="toevoegen",s.textContent="\uFF0B  Knop toevoegen",s.disabled=this.items_.length>=20,s.addEventListener("click",()=>{this.items_.push({name:"",icon:"",path:""}),this.open_.add(`i${this.items_.length-1}`),this.emit_(),this.build_()}),t.appendChild(s)}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"max",selector:{number:{min:2,max:6,step:1,mode:"box"}}},{name:"labels",selector:{boolean:{}}},{name:"bare",selector:{boolean:{}}}],e.computeLabel=t=>({max:"Knoppen in de balk",labels:"Namen onder de iconen",bare:"Achtergrond weglaten"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="max")return`De meer-knop telt zelf mee. Staan er meer knoppen dan dit, dan komen de eerste ${Te(this.rest_.max)-1} in de balk en valt de rest achter "Meer".`;if(t.name==="labels")return"Uit geeft een rij kale iconen. Dan passen er meer naast elkaar op een telefoon.";if(t.name==="bare")return"Haalt de pil onder de balk weg: alleen de iconen blijven over, zwevend boven het dashboard."},e.data={max:Te(this.rest_.max),labels:this.rest_.labels!==!1,bare:!!this.rest_.bare},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{};this.rest_.max=Te(n.max),n.labels===!1?this.rest_.labels=!1:delete this.rest_.labels,n.bare?this.rest_.bare=!0:delete this.rest_.bare,this.emit_(),this.build_()}),e}itemBlok_(e,t){let n=document.createElement("details");n.className="item",this.onthoud_(n,`i${t}`);let i=document.createElement("summary"),r=document.createElement("span");r.className="voor";let o=document.createElement("span");o.className="titel";let s=document.createElement("b"),l=document.createElement("small");o.append(s,l);let d=()=>{let x=!Ae(e);n.dataset.leeg=String(x),r.innerHTML=v(e.icon,"grid"),s.textContent=e.name||(x?"Nieuwe knop":e.path||"Zonder naam");let z=Ee(e).length;l.textContent=z?`Menu met ${z} knop${z===1?"":"pen"}`:e.path?e.path:e.icon?`${_e(e.icon)} -- nog geen pad`:"Nog geen pad"};d(),this.koppen_.push(d);let c=this.kopKnop_("Omhoog",A.arrowUp,()=>this.verplaats_(t,-1));c.disabled=t===0;let p=this.kopKnop_("Omlaag",A.arrowDown,()=>this.verplaats_(t,1));p.disabled=t===this.items_.length-1;let h=this.kopKnop_("Verwijderen",A.close,()=>this.verwijder_(t));h.classList.add("weg"),i.append(r,o,c,p,h),n.appendChild(i);let g=document.createElement("div");g.className="body";let m=document.createElement("dac-icon-picker");m.label="Icoon",m.fallback="grid",m.auto=!1,m.hass=this.hass_,m.value=e.icon,m.addEventListener("value-changed",x=>{x.stopPropagation(),e.icon=x.detail.value??"",this.emit_()});let k=document.createElement("ha-form");return k.hass=this.hass_,k.schema=[{name:"name",selector:{text:{}}},{name:"path",selector:{text:{}}}],k.computeLabel=x=>({name:"Naam",path:"Waar gaat hij heen"})[x.name]??x.name,k.computeHelper=x=>{if(x.name!=="path")return;let z="/lovelace/keuken voor een view, #keuken voor een pop-up van bubble-card, of een https-adres voor iets buiten Home Assistant.";return Mo(e)?`${z}

Deze knop heeft subknoppen en klapt dus open in plaats van ergens heen te gaan; zijn eigen pad wordt niet gebruikt.`:z},k.data={name:e.name,path:e.path},k.addEventListener("value-changed",x=>{x.stopPropagation();let z=x.detail.value??{};e.name=z.name??"",e.path=z.path??"",this.emit_()}),g.append(m,k,...this.subBlok_(e,t)),n.appendChild(g),n}subBlok_(e,t){Array.isArray(e.items)||(e.items=[]);let n=document.createElement("div");n.className="subkop",n.textContent="Subknoppen";let i=document.createElement("div");i.className="sublijst",e.items.forEach((s,l)=>i.appendChild(this.subItemBlok_(e,s,t,l)));let r=this.subKeuze_(e,t),o=document.createElement("p");return o.className="uitleg",o.textContent="Hangt hier iets onder, dan klapt deze knop een menu open BOVEN zichzelf in plaats van ergens heen te gaan. Valt de knop zelf achter de meer-knop, dan staan zijn subknoppen daar ingesprongen onder hem.",[n,i,r,o]}subKeuze_(e,t){let n=document.createElement("details");n.className="subkeuze",e.items.length>=8&&n.setAttribute("vol","");let i=document.createElement("summary");i.textContent="\uFF0B  Subknop toevoegen",n.appendChild(i);let r=document.createElement("div");r.className="keuzes",n.appendChild(r);let o=(s,l)=>{let{lijst:d,plek:c}=Oo(e.items,s,l);c<0||(e.items=d,this.open_.add(`i${t}`),this.open_.add(`i${t}s${c}`),this.emit_(),this.build_(),requestAnimationFrame(()=>{this.querySelectorAll("details.sub")[c]?.scrollIntoView({block:"nearest"})}))};r.appendChild(this.keuzeKnop_("plus","Lege subknop","Zelf een naam, een icoon en een pad invullen.",()=>o({name:"",icon:"",path:"",action:null,items:[]},!1)));for(let s of No){let l=s.maak();r.appendChild(this.keuzeKnop_(l.icon,s.label,s.uitleg,()=>o(s.maak(),s.bovenaan)))}return n}keuzeKnop_(e,t,n,i){let r=document.createElement("button");r.type="button";let o=document.createElement("span");o.className="voor",o.innerHTML=v(e,"plus");let s=document.createElement("span");s.className="tekst";let l=document.createElement("b");l.textContent=t;let d=document.createElement("small");return d.textContent=n,s.append(l,d),r.append(o,s),r.addEventListener("click",i),r}subItemBlok_(e,t,n,i){let r=document.createElement("details");r.className="sub",this.onthoud_(r,`i${n}s${i}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="voor";let l=document.createElement("span");l.className="titel";let d=document.createElement("b"),c=document.createElement("small");l.append(d,c);let p=()=>{s.innerHTML=v(t.icon,"grid"),d.textContent=t.name||(Ae(t)?t.path||"Zonder naam":"Nieuwe subknop"),c.textContent=t.action?`Roept ${t.action.perform_action??t.action.service??t.action.action} aan`:t.path||"Nog geen pad"};p(),this.koppen_.push(p);let h=this.kopKnop_("Omhoog",A.arrowUp,()=>this.verplaatsSub_(e,n,i,-1));h.disabled=i===0;let g=this.kopKnop_("Omlaag",A.arrowDown,()=>this.verplaatsSub_(e,n,i,1));g.disabled=i===e.items.length-1;let m=this.kopKnop_("Verwijderen",A.close,()=>this.verwijderSub_(e,n,i));m.classList.add("weg"),o.append(s,l,h,g,m),r.appendChild(o);let k=document.createElement("div");k.className="body";let x=document.createElement("dac-icon-picker");x.label="Icoon",x.fallback="grid",x.auto=!1,x.hass=this.hass_,x.value=t.icon,x.addEventListener("value-changed",_=>{_.stopPropagation(),t.icon=_.detail.value??"",this.emit_()});let z=document.createElement("ha-form");return z.hass=this.hass_,z.schema=[{name:"name",selector:{text:{}}},{name:"path",selector:{text:{}}}],z.computeLabel=_=>({name:"Naam",path:"Waar gaat hij heen"})[_.name]??_.name,t.action&&(z.schema=[{name:"name",selector:{text:{}}}],z.computeHelper=_=>_.name==="name"?`Deze knop voert een actie uit (${t.action.perform_action??t.action.service??t.action.action}) en gaat dus nergens heen. Weg met de knop rechtsboven.`:void 0),z.data={name:t.name,path:t.path},z.addEventListener("value-changed",_=>{_.stopPropagation();let L=_.detail.value??{};t.name=L.name??"",t.path=L.path??"",this.emit_()}),k.append(x,z),r.appendChild(k),r}verplaatsSub_(e,t,n,i){let r=n+i;if(r<0||r>=e.items.length)return;[e.items[n],e.items[r]]=[e.items[r],e.items[n]];let o=this.open_.has(`i${t}s${n}`),s=this.open_.has(`i${t}s${r}`);this.open_.delete(`i${t}s${n}`),this.open_.delete(`i${t}s${r}`),s&&this.open_.add(`i${t}s${n}`),o&&this.open_.add(`i${t}s${r}`),this.emit_(),this.build_()}verwijderSub_(e,t,n){e.items.splice(n,1);let i=new Set;for(let r of this.open_){let o=/^i(\d+)s(\d+)$/.exec(r);if(!o||Number(o[1])!==t){i.add(r);continue}let s=Number(o[2]);s!==n&&i.add(`i${t}s${s>n?s-1:s}`)}this.open_=i,this.emit_(),this.build_()}kopKnop_(e,t,n){let i=document.createElement("button");return i.type="button",i.className="rondknop",i.title=e,i.setAttribute("aria-label",e),i.innerHTML=t,i.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),i.disabled||n()}),i}verplaats_(e,t){let n=e+t;n<0||n>=this.items_.length||([this.items_[e],this.items_[n]]=[this.items_[n],this.items_[e]],this.schuifOpen_(e,n),this.emit_(),this.build_())}verwijder_(e){this.items_.splice(e,1);let t=new Set;for(let n of this.open_){let i=To.exec(n);if(!i)continue;let r=Number(i[1]);r!==e&&t.add(`i${r>e?r-1:r}${i[2]??""}`)}this.open_=t,this.emit_(),this.build_()}schuifOpen_(e,t){let n=new Set;for(let i of this.open_){let r=To.exec(i);if(!r)continue;let o=Number(r[1]),s=r[2]??"";o===e?n.add(`i${t}${s}`):o===t?n.add(`i${e}${s}`):n.add(i)}this.open_=n}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}emit_(){let e=Co(this.items_),t={...this.rest_,items:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_??[])n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};O("domotiapp-navbar-card-editor",ii);var Lo=a=>a.parentElement??(a.parentNode&&a.parentNode.host)??null;function*xt(a){let e=Lo(a),t=0;for(;e&&t++<40;)yield e,e=Lo(e)}function xc(a){for(let e of xt(a)){let t=e.tagName?.toLowerCase?.()??"";if(/(^|-)(edit|preview)/.test(t))return!0}return!1}function _c(a){for(let e of xt(a))if(e.tagName?.toLowerCase?.()==="hui-card")return e;return null}function wc(a){for(let e of xt(a))if(e.tagName?.toLowerCase?.()==="hui-section")return e;return null}function yc(a){for(let e of xt(a))if(e.classList?.contains?.("section"))return e;return null}function Ho(a){for(let e of xt(a)){let t=e.tagName?.toLowerCase?.()??"";if(t==="hui-view"||t.endsWith("-view"))return e}return null}var gn=class extends M{validate(e){let t=So(e),n={labels:!0,tone:"accent",...e,items:t,max:Te(e?.max)};return t.filter(i=>i.name||i.icon||i.path).length||(n[T]="Voeg knoppen toe in de editor: een naam, een icoon en waar hij heen gaat."),n}watched(){return[]}template(){let e=this.config;e.labels===!1&&this.setAttribute("geen-namen",""),e.bare&&this.setAttribute("bare","");let{balk:t,meer:n,heeftMeer:i}=mn(e.items,e.max),r=e.items.filter(c=>c.name||c.icon||c.path),o=(c,p)=>{let g=Ee(c).length?` data-menu="s${p}" aria-haspopup="true" aria-expanded="false"`:"";return`
      <button type="button" class="knop" data-i="${p}" title="${I(c.name)}"${g}>
        <span class="ico">${v(c.icon,"grid")}</span>
        <span class="naam">${I(c.name)}</span>
      </button>`},s=(c,p,h=null,g="")=>`
      <button type="button" class="regel${g?` ${g}`:""}" data-i="${p}"${h===null?"":` data-s="${h}"`}>
        <span class="mi">${v(c.icon,"grid")}</span>
        <span class="mt">${I(c.name||c.path)}</span>
      </button>`,l=n.map(c=>{let p=r.indexOf(c),h=Ee(c);return h.length?`
      <div class="regel kop">
        <span class="mi">${v(c.icon,"grid")}</span>
        <span class="mt">${I(c.name||c.path)}</span>
      </div>`+h.map((m,k)=>s(m,p,k,"sub")).join(""):s(c,p)}).join(""),d=t.map(c=>{let p=Ee(c);if(!p.length)return"";let h=r.indexOf(c);return`<div class="menu submenu" data-id="s${h}" role="menu">${p.map((g,m)=>s(g,h,m)).join("")}</div>`}).join("");return`
      <div class="balk" style="--tone:${U(e.tone)}">
        ${t.map(c=>o(c,r.indexOf(c))).join("")}
        ${i?`<button type="button" class="knop meer" data-menu="meer" aria-expanded="false" aria-haspopup="true">
                 <span class="ico">${A.dots}</span>
                 <span class="naam">Meer</span>
               </button>`:""}
        ${d}
        <div class="menu meermenu" data-id="meer" role="menu">
          ${l}
        </div>
      </div>`}wire(){for(let e of this.$$(".knop[data-i], .regel[data-i]"))e.dataset.menu||this.on(e,"click",()=>{this.sluitMenus_(),this.ga_(Number(e.dataset.i),e.dataset.s)});for(let e of this.$$("[data-menu]"))this.on(e,"click",t=>{t.stopPropagation(),this.wisselMenu_(e)});this.on(window,"pointerdown",e=>{if(!this.ietsOpen_())return;let t=e.composedPath?.()??[];[...this.$$(".menu[open]"),...this.$$("[data-menu]")].some(i=>t.includes(i))||this.sluitMenus_()},!0),this.on(window,"keydown",e=>{e.key==="Escape"&&this.ietsOpen_()&&this.sluitMenus_()}),this.on(window,"location-changed",()=>this.sluitMenus_())}paint(){}ga_(e,t){let n=this.config.items.filter(r=>r.name||r.icon||r.path)[e];if(!n)return;let i=t===void 0?n:Ee(n)[Number(t)];i&&me(this,this.hass,{},ai(i))}ietsOpen_(){return!!this.$(".menu[open]")}menuVan_(e){return this.$$(".menu").find(t=>t.dataset.id===e.dataset.menu)??null}wisselMenu_(e){let t=this.menuVan_(e),n=!!t?.hasAttribute("open");this.sluitMenus_(),!(!t||n)&&(t.setAttribute("open",""),e.setAttribute("aria-expanded","true"),this.plaatsMenu_(t,e))}sluitMenus_(){for(let e of this.$$(".menu[open]"))e.removeAttribute("open");for(let e of this.$$("[data-menu]"))e.setAttribute("aria-expanded","false")}plaatsMenu_(e,t){if(!e.classList.contains("submenu"))return;let n=this.$(".balk")?.getBoundingClientRect(),i=t.getBoundingClientRect();if(!n?.width)return;let r=e.offsetWidth/2,o=i.left+i.width/2-n.left,s=r+6,l=n.width-r-6,d=l<s?n.width/2:Math.min(Math.max(o,s),l);e.style.setProperty("--x",`${Math.round(d)}px`)}connectedCallback(){super.connectedCallback(),requestAnimationFrame(()=>this.plaats_())}disconnectedCallback(){super.disconnectedCallback(),this.herstel_()}plaats_(){if(!this.isConnected||!this.config)return;if(xc(this)){this.setAttribute("in-editor","");return}this.removeAttribute("in-editor");let e=_c(this);this.klapIn_(e);let t=e?.parentElement;t?.classList?.contains?.("card")&&this.klapIn_(t);let n=wc(this);n?.config?.cards?.length===1&&this.klapIn_(yc(n));let i=Ho(this),r=this.$(".balk");if(i&&r&&!this.viewStijl_){this.view_=i,this.viewStijl_=i.style.paddingBottom??"";let o=Math.round(r.getBoundingClientRect().height)||62;i.style.paddingBottom=`${o+32}px`}this.meetMidden_(),i&&!this.waarnemer_&&(this.waarnemer_=new ResizeObserver(()=>this.meetMidden_()),this.waarnemer_.observe(i))}meetMidden_(){let e=this.view_??Ho(this);if(!e)return;let t=e.getBoundingClientRect();t.width&&this.style.setProperty("--dac-nav-mid",`${Math.round(t.left+t.width/2)}px`)}klapIn_(e){e&&(this.ingeklapt_??=new Map,!this.ingeklapt_.has(e)&&(this.ingeklapt_.set(e,e.getAttribute("style")),e.style.position="absolute",e.style.width="0",e.style.height="0",e.style.minHeight="0",e.style.margin="0",e.style.padding="0",e.style.overflow="visible"))}herstel_(){this.waarnemer_?.disconnect(),this.waarnemer_=null;for(let[e,t]of this.ingeklapt_??[])t?e.setAttribute("style",t):e.removeAttribute("style");this.ingeklapt_=null,this.view_&&(this.view_.style.paddingBottom=this.viewStijl_||"",this.view_=null,this.viewStijl_=null)}getCardSize(){return 1}getGridOptions(){return{columns:"full",rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-navbar-card-editor")}static getStubConfig(){return{items:[{name:"Thuis",icon:"house",path:""},{name:"Licht",icon:"bulb",path:""},{name:"Media",icon:"music",path:""},{name:"Instellingen",icon:"cog",path:""}],max:4,labels:!0}}};y(gn,"css",`
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
  `);N("domotiapp-navbar-card",gn,{name:"DomotiApp Navbalk",description:`Vaste navigatiebalk onderaan het scherm, met een meer-menu voor wat er in de breedte niet bij past. ${2} tot ${6} knoppen in de balk.`});var zc="dac-tabs:";function si(a){let e=a??{},t=typeof e.name=="string"?e.name:typeof e.title=="string"?e.title:"",n=Array.isArray(e.cards)?e.cards.filter(r=>r&&typeof r=="object"):[],i=n.length?n:e.card&&typeof e.card=="object"?[e.card]:[];return{name:t,icon:typeof e.icon=="string"?e.icon:"",cards:i}}var fn=a=>!!(a&&(a.name?.trim()||a.icon?.trim()||a.cards?.length));function Ro(a){return(Array.isArray(a?.tabs)?a.tabs:[]).slice(0,8).map(si).filter(fn)}function jc(a,e){if(!e)return 0;let t=Math.round(Number(a?.default_tab));return!Number.isFinite(t)||t<1||t>e?0:t-1}function li(a){let e=(a??[]).map((t,n)=>(t?.name?.trim()||t?.icon?.trim()||`tab${n}`).toLowerCase()).join("|");return zc+e}function $c(a,e,t){let n=null;try{n=a?.getItem?.(e)??null}catch{return null}let i=Number(n);return n===null||n===""||!Number.isInteger(i)?null:i>=0&&i<t?i:null}function Io(a,e,t){try{return a?.setItem?.(e,String(t)),!0}catch{return!1}}function Vo(a,e,t){return $c(t,li(e),e.length)??jc(a,e.length)}var Ec=[["tile","Tegel"],["entities","Entiteiten"],["button","Knop"],["gauge","Meter"],["history-graph","Geschiedenis"],["statistic","Statistiek"],["sensor","Sensorgrafiek"],["light","Lamp"],["thermostat","Thermostaat"],["humidifier","Luchtbevochtiger"],["media-control","Mediaspeler"],["weather-forecast","Weersverwachting"],["markdown","Tekst (Markdown)"],["picture","Afbeelding"],["picture-entity","Afbeelding met entiteit"],["glance","Overzicht"],["area","Ruimte"],["alarm-panel","Alarmpaneel"],["calendar","Agenda"],["todo-list","Takenlijst"],["map","Kaart"],["iframe","Webpagina"],["vertical-stack","Stapel (onder elkaar)"],["horizontal-stack","Stapel (naast elkaar)"],["grid","Raster"],["conditional","Voorwaardelijk"]];function Po(){let a=(window.customCards??[]).filter(e=>e&&typeof e.type=="string").map(e=>({type:`custom:${e.type}`,naam:e.name||e.type,uitleg:e.description||"",eigen:!0}));return a.sort((e,t)=>{let n=e.type.startsWith("custom:domotiapp-")?0:1,i=t.type.startsWith("custom:domotiapp-")?0:1;return n-i||e.naam.localeCompare(t.naam,"nl")}),[...a,...Ec.map(([e,t])=>({type:e,naam:t,uitleg:"",eigen:!1}))]}function Bo(a,e){let t=String(e??"").trim().toLowerCase();return t?a.filter(n=>`${n.naam} ${n.type} ${n.uitleg}`.toLowerCase().includes(t)):a}async function Ko(a,e){let t={type:a};try{let n=await window.loadCardHelpers?.();try{n?.createCardElement?.(t)}catch{}let i=a.startsWith("custom:")?a.slice(7):`hui-${a}-card`,o=await customElements.get(i)?.getStubConfig?.(e,Object.keys(e?.states??{}),[]);if(o&&typeof o=="object")return{...o,type:a}}catch{}return t}var Go=()=>!!customElements.get("hui-card-element-editor");function Uo(a,e,t){let n=s=>{if(s==null||s==="")return null;let l=Math.round(Number(s));return Number.isFinite(l)?l:null},i=a,r=n(e),o=n(t);return r!==null&&(i=Math.max(i,r)),o!==null&&(i=Math.min(i,o)),i}function Ac(a,e){let t=a?.columns,n=a?.rows,i=12;if(t!=null&&t!=="full"){let s=Math.round(Number(t));i=Number.isFinite(s)?Math.min(12,Math.max(1,s)):12}i=Math.min(12,Math.max(1,Uo(i,e?.min_columns,e?.max_columns)));let r={gridColumn:`span ${i}`},o=Math.round(Number(n));return n!=="auto"&&Number.isFinite(o)&&o>=1&&(r.height=`${Math.max(1,Uo(o,e?.min_rows,e?.max_rows))*64-8}px`),r}function _t(a,e,t){if(!a?.style)return;let{gridColumn:n,height:i}=Ac(e,t);a.style.gridColumn=n,a.style.height=i??""}function Wo(a){let e=a?._element??a?.shadowRoot?.firstElementChild??null;if(typeof e?.getGridOptions!="function")return null;try{let t=e.getGridOptions();return t&&typeof t=="object"?t:null}catch{return null}}function qo(a,e,t={}){let n=Array.isArray(a)?[...a]:[],i=Number(t.index);switch(e){case"verplaats":{let r=Number(t.van),o=Number(t.naar);if(!Number.isInteger(r)||!Number.isInteger(o)||r<0||r>=n.length||o<0||o>=n.length||r===o)return null;let[s]=n.splice(r,1);return n.splice(o,0,s),n}case"dupliceer":return!Number.isInteger(i)||!n[i]?null:(n.splice(i+1,0,structuredClone(n[i])),n);case"verwijder":return!Number.isInteger(i)||!n[i]?null:(n.splice(i,1),n);case"rooster":return!Number.isInteger(i)||!n[i]||!t.rooster?null:(n[i]={...n[i],grid_options:{...n[i].grid_options??{},...t.rooster}},n);default:return null}}var Fo=a=>({...a?{config:a}:{},editMode:!0,saveConfig:async()=>{}}),Mc=()=>document.querySelector("home-assistant");function Zo({kaarten:a,hass:e,maakKaart:t,opActie:n}){let i=document.createElement("ha-sortable");i.disabled=!1,i.draggableSelector=".dac-kaart",i.rollback=!1,i.invertSwap=!0,i.options={delay:100,delayOnTouchOnly:!0,direction:"vertical",invertedSwapThreshold:.7};let r=document.createElement("div");r.className="dac-kaarten";let o=[];a.forEach((d,c)=>{let p=t(d,c);if(!p)return;let h=document.createElement("div");h.className="dac-kaart",_t(h,d?.grid_options);let g=document.createElement("hui-card-edit-mode");g.hass=e,g.lovelace=Fo(),g.path=[0,0,c],g.hiddenOverlay=!1,g.appendChild(p),o.push(g),h.appendChild(g),r.appendChild(h)}),i.appendChild(r);let s=d=>{for(let c of o)c.hiddenOverlay=!d};i.addEventListener("drag-start",()=>s(!1)),i.addEventListener("drag-end",()=>s(!0)),i.addEventListener("item-moved",d=>{d.stopPropagation(),n("verplaats",{van:d.detail.oldIndex,naar:d.detail.newIndex})});let l={"ll-edit-card":d=>n("bewerk",{index:d.detail.path[2]}),"ll-duplicate-card":d=>n("dupliceer",{index:d.detail.path[2]}),"ll-delete-card":d=>n("verwijder",{index:d.detail.path[2]}),"ll-copy-card":d=>n("kopieer",{index:d.detail.path[2]}),"ll-change-grid-options":d=>n("rooster",{index:d.detail.path?.[2],rooster:d.detail.gridOptions}),"ll-move-to-section":()=>{}};for(let[d,c]of Object.entries(l))i.addEventListener(d,p=>{p.stopPropagation(),c(p)});return i}function Xo(a){try{let e=typeof structuredClone=="function"?structuredClone(a):JSON.parse(JSON.stringify(a));return sessionStorage.setItem("dashboardCardClipboard",JSON.stringify(e)),!0}catch{return!1}}function Yo({hass:a,kaarten:e}){let t=Mc();return!t||!customElements.get("hui-section")?Promise.resolve(null):new Promise(n=>{let i=null,r=null,o=!1,s=()=>{o||(o=!0,t.removeEventListener("show-dialog",l,!0),window.removeEventListener("dialog-closed",d,!0),n(i?{kaart:i}:r?{kaarten:r}:null))},l=g=>{if(g?.detail?.dialogTag!=="hui-dialog-edit-card")return;let m=g.detail?.dialogParams?.cardConfig;g.stopImmediatePropagation?.(),g.stopPropagation(),m&&(i=m);let k=t.querySelector("hui-dialog-create-card");typeof k?.closeDialog=="function"&&k.closeDialog(),setTimeout(s,0)},d=g=>{g?.detail?.dialog==="hui-dialog-create-card"&&setTimeout(s,0)};t.addEventListener("show-dialog",l,!0),window.addEventListener("dialog-closed",d,!0);let c={type:"grid",cards:[...e]},p=document.createElement("hui-section");p.style.display="none",p.hass=a,p.index=0,p.viewIndex=0,p.config=c,p.lovelace={...Fo({views:[{path:"domotiapp-kiezer",title:"DomotiApp",sections:[c]}]}),saveConfig:async g=>{let m=g?.views?.[0]?.sections?.[0]?.cards;Array.isArray(m)&&(r=m)}},t.appendChild(p),(async()=>{try{typeof p._initializeConfig=="function"?await p._initializeConfig():await p.updateComplete;let g=p._layoutElement;if(!g)throw new Error("de proxysectie heeft geen layout-element");g.dispatchEvent(new CustomEvent("ll-create-card",{bubbles:!0,composed:!0}))}catch(g){console.warn("DomotiApp: de kaartkiezer van Home Assistant ging niet open",g),s()}finally{setTimeout(()=>p.remove(),0)}})()})}var bn=()=>!!(customElements.get("hui-card-edit-mode")&&customElements.get("ha-sortable")&&customElements.get("hui-section"));var Sc=`
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
`,Jo=a=>a.filter(fn).map(e=>({...e.name?{name:e.name}:{},...e.icon?{icon:e.icon}:{},...e.cards?.length?{cards:e.cards.map(t=>structuredClone(t))}:{}}));function Xe(a){let e=String(a?.type??"").replace(/^custom:/,"");return e?(window.customCards??[]).find(n=>n?.type===e)?.name||e:"een kaart"}function di(a){let e=a.cards?.length??0;return e?e===1?Xe(a.cards[0]):`${e} kaarten`:"Nog geen kaart"}var ci=class extends HTMLElement{constructor(){super(),this.tabs_=[],this.rest_={},this.open_=new Set}setConfig(e){if(this.rest_={...e},delete this.rest_.tabs,this.gebouwd_&&e===this.uitObject_)return;let t=(Array.isArray(e?.tabs)?e.tabs:[]).map(si);this.gebouwd_&&JSON.stringify(Jo(t))===this.uit_||(this.tabs_=t,this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker, hui-card-element-editor, hui-card-visibility-editor, hui-card-layout-editor"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}set lovelace(e){this.lovelace_=e;for(let t of this.querySelectorAll("hui-card-element-editor"))t.lovelace=e}get lovelace(){return this.lovelace_}connectedCallback(){this.gebouwd_||this.build_()}async build_(){if(!this.hass_)return;if(await customElements.whenDefined("ha-form"),!this.helpers_)try{this.helpers_=await window.loadCardHelpers?.()}catch{this.helpers_=null}this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=Sc;let t=document.createElement("div");t.className="dac-tabs",this.append(e,t),t.appendChild(this.kaartBlok_());let n=document.createElement("div");n.className="lijst",t.appendChild(n),this.tabs_.forEach((r,o)=>n.appendChild(this.tabBlok_(r,o)));let i=document.createElement("button");i.type="button",i.className="toevoegen",i.textContent="\uFF0B  Tabblad toevoegen",i.disabled=this.tabs_.length>=8,i.addEventListener("click",()=>{this.tabs_.push({name:"",icon:"",cards:[]}),this.open_.add(`t${this.tabs_.length-1}`),this.emit_(),this.build_()}),t.appendChild(i)}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"default_tab",selector:{number:{min:1,max:8,step:1,mode:"box"}}},{name:"alignment",selector:{select:{mode:"dropdown",options:[{value:"vullen",label:"Verdeeld over de breedte"},{value:"links",label:"Links"},{value:"rechts",label:"Rechts"}]}}},{name:"show_names",selector:{boolean:{}}},{name:"bare",selector:{boolean:{}}}],e.computeLabel=t=>({default_tab:"Welk tabblad staat open op een nieuw apparaat",alignment:"Uitlijning van de rij",show_names:"Namen naast de iconen",bare:"Achtergrond weglaten"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="default_tab")return"Telt vanaf 1. Dit geldt alleen zolang een apparaat nog niets gekozen heeft \u2014 daarna onthoudt elk apparaat zijn eigen tabblad, en dat van je telefoon staat los van dat van de tablet.";if(t.name==="show_names")return"Uit geeft een rij kale iconen. Dan passen er meer naast elkaar op een telefoon.";if(t.name==="bare")return"Haalt het vlak onder de kaart weg. De rij tabbladen houdt zijn eigen pil."},e.data={default_tab:Number(this.rest_.default_tab)||1,alignment:this.rest_.alignment??"vullen",show_names:this.rest_.show_names!==!1,bare:!!this.rest_.bare},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{},i=Number(n.default_tab);Number.isFinite(i)&&i>1?this.rest_.default_tab=i:delete this.rest_.default_tab,n.alignment==="links"||n.alignment==="rechts"?this.rest_.alignment=n.alignment:delete this.rest_.alignment,n.show_names===!1?this.rest_.show_names=!1:delete this.rest_.show_names,n.bare?this.rest_.bare=!0:delete this.rest_.bare,this.emit_()}),e}tabBlok_(e,t){let n=document.createElement("details");n.className="tab",this.onthoud_(n,`t${t}`);let i=document.createElement("summary"),r=document.createElement("span");r.className="voor";let o=document.createElement("span");o.className="titel";let s=document.createElement("b"),l=document.createElement("small");o.append(s,l);let d=()=>{n.dataset.leeg=String(!fn(e)),r.innerHTML=v(e.icon,"grid"),s.textContent=e.name||`Tabblad ${t+1}`,l.textContent=di(e)};d(),this.koppen_.push(d);let c=this.kopKnop_("Omhoog",A.arrowUp,()=>this.verplaats_(t,-1));c.disabled=t===0;let p=this.kopKnop_("Omlaag",A.arrowDown,()=>this.verplaats_(t,1));p.disabled=t===this.tabs_.length-1;let h=this.kopKnop_("Verwijderen",A.close,()=>this.verwijder_(t));h.classList.add("weg"),i.append(r,o,c,p,h),n.appendChild(i);let g=document.createElement("div");g.className="body";let m=document.createElement("dac-icon-picker");m.label="Icoon",m.fallback="grid",m.auto=!1,m.hass=this.hass_,m.value=e.icon,m.addEventListener("value-changed",x=>{x.stopPropagation(),e.icon=x.detail.value??"",this.emit_()});let k=document.createElement("ha-form");return k.hass=this.hass_,k.schema=[{name:"name",selector:{text:{}}}],k.computeLabel=()=>"Naam",k.computeHelper=()=>"Deze naam bepaalt ook onder welke sleutel een apparaat zijn keuze onthoudt. Hernoem je hem, dan begint elk apparaat \xE9\xE9n keer opnieuw bij het eerste tabblad.",k.data={name:e.name},k.addEventListener("value-changed",x=>{x.stopPropagation(),e.name=x.detail.value?.name??"",this.emit_()}),g.append(m,k,this.inhoudBlok_(e,t)),n.appendChild(g),n}inhoudBlok_(e,t){let n=document.createElement("div");if(n.className="kaartvak",Array.isArray(e.cards)||(e.cards=[]),!Go()){let r=document.createElement("div");return r.className="inhoud",r.innerHTML=`${v("grid")}<span>Inhoud: <b>${di(e)}</b> \u2014 aan te passen via Code-editor weergeven.</span>`,n.appendChild(r),n}if(bn()){let r=document.createElement("div");return r.className="inhoud",r.innerHTML=`${v("grid")}<span>${e.cards.length?`<b>${di(e)}</b> \u2014 te bewerken in het voorbeeld hiernaast: slepen om te verplaatsen, het potlood om te bewerken.`:"Nog geen kaart \u2014 voeg er een toe in het voorbeeld hiernaast."}</span>`,n.appendChild(r),this.bewerkt_?.tab===t&&e.cards[this.bewerkt_.index]&&n.appendChild(this.bewerkVak_(e,t,this.bewerkt_.index)),n}if(e.cards.length){let r=document.createElement("div");r.className="subkop",r.textContent=e.cards.length===1?"Kaart":`${e.cards.length} kaarten`,n.appendChild(r),e.cards.forEach((o,s)=>n.appendChild(this.kaartBlok2_(e,o,t,s)))}if(this.kiest_===`t${t}`)return n.appendChild(this.kiezerBlok_(e,t)),n;let i=document.createElement("button");return i.type="button",i.className="toevoegen",i.textContent="\uFF0B  Kaart toevoegen",i.addEventListener("click",()=>{this.kiest_=`t${t}`,this.zoek_="",this.build_()}),n.appendChild(i),n}uitVoorbeeld(e,t,n){let i=this.tabs_[e];if(i){if(t==="toevoegen"){this.voegToeViaHa_(i,e);return}this.kaartActie_(i,e,t,n)}}toonBewerkVak_(){let e=this.querySelector(".bewerkvak"),t=this.bewerkt_?.tab,n=this.bewerkt_?.index,i=Number.isInteger(t)?this.tabs_[t]:null;if(!i||!i.cards[n]){e?.remove();return}let r=this.bewerkVak_(i,t,n);e?e.replaceWith(r):this.querySelectorAll(".kaartvak")[t]?.appendChild(r),r.scrollIntoView({block:"nearest"})}kaartActie_(e,t,n,i){if(n==="bewerk"){(this.bewerkt_?.tab!==t||this.bewerkt_?.index!==i.index)&&(this.kaartBlad_="config"),this.bewerkt_={tab:t,index:i.index},this.open_.add(`t${t}`);let o=this.querySelectorAll("details.tab")[t];o&&(o.open=!0),this.toonBewerkVak_();return}if(n==="kopieer"){Xo(e.cards[i.index]);return}let r=qo(e.cards,n,i);r&&(e.cards=r,this.bewerkt_=null,this.emit_(),this.build_())}bewerkVak_(e,t,n){let i=document.createElement("div");i.className="bewerkvak";let r=document.createElement("div");r.className="kop";let o=document.createElement("b");o.textContent=Xe(e.cards[n]);let s=document.createElement("button");s.type="button",s.textContent="Klaar",s.addEventListener("click",()=>{this.bewerkt_=null,this.build_()}),r.append(o,s);let l=document.createElement("div");l.className="body";let d=this.kaartTabbladen_(e,t,n,l,o);d&&i.append(r,d,l);let c=document.createElement("hui-card-element-editor");return c.hass=this.hass_,this.lovelace_&&(c.lovelace=this.lovelace_),c.value=e.cards[n],c.addEventListener("config-changed",p=>{p.stopPropagation();let h=p.detail?.config;h&&(e.cards[n]=h,this.emit_(),o.textContent=Xe(h))}),c.addEventListener("GUImode-changed",p=>p.stopPropagation()),this.kaartEditor_=c,l.appendChild(c),d||i.append(r,l),i}kaartTabbladen_(e,t,n,i,r){let o=!!customElements.get("hui-card-visibility-editor"),s=!!customElements.get("hui-card-layout-editor");if(!o&&!s)return null;let l=document.createElement("div");l.className="kaarttabs";let d=[{id:"config",naam:"Configuratie"},...o?[{id:"zicht",naam:"Zichtbaarheid"}]:[],...s?[{id:"indeling",naam:"Indeling"}]:[]],c=h=>{this.kaartBlad_=h;for(let g of l.querySelectorAll("button"))g.setAttribute("aria-selected",String(g.dataset.blad===h));i.replaceChildren(this.bladInhoud_(h,e,t,n,r))};for(let h of d){let g=document.createElement("button");g.type="button",g.dataset.blad=h.id,g.textContent=h.naam,g.setAttribute("role","tab"),g.setAttribute("aria-selected","false"),g.addEventListener("click",()=>c(h.id)),l.appendChild(g)}let p=d.some(h=>h.id===this.kaartBlad_)?this.kaartBlad_:"config";return setTimeout(()=>c(p),0),l}bladInhoud_(e,t,n,i,r){if(e==="config")return this.kaartEditor_;let o=document.createElement(e==="zicht"?"hui-card-visibility-editor":"hui-card-layout-editor");return o.hass=this.hass_,o.config=t.cards[i],e==="indeling"&&(o.sectionConfig={type:"grid",column_span:1}),o.addEventListener("value-changed",s=>{s.stopPropagation();let l=s.detail?.value;l&&(t.cards[i]=l,o.config=l,this.emit_(),r.textContent=Xe(l))}),o}async voegToeViaHa_(e,t){let n=await Yo({hass:this.hass_,kaarten:e.cards});n&&(n.kaarten?(e.cards=n.kaarten,this.bewerkt_=null):(e.cards.push(n.kaart),this.bewerkt_={tab:t,index:e.cards.length-1}),this.open_.add(`t${t}`),this.emit_(),this.build_())}kaartBlok2_(e,t,n,i){let r=document.createElement("details");r.className="sub",this.onthoud_(r,`t${n}k${i}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="voor",s.innerHTML=v("grid");let l=document.createElement("span");l.className="titel";let d=document.createElement("b");d.textContent=Xe(t);let c=document.createElement("small");c.textContent=String(t?.type??""),l.append(d,c);let p=this.kopKnop_("Omhoog",A.arrowUp,()=>this.verplaatsKaart_(e,n,i,-1));p.disabled=i===0;let h=this.kopKnop_("Omlaag",A.arrowDown,()=>this.verplaatsKaart_(e,n,i,1));h.disabled=i===e.cards.length-1;let g=this.kopKnop_("Verwijderen",A.close,()=>this.verwijderKaart_(e,n,i));g.classList.add("weg"),o.append(s,l,p,h,g),r.appendChild(o);let m=document.createElement("div");m.className="body";let k=document.createElement("hui-card-element-editor");return k.hass=this.hass_,this.lovelace_&&(k.lovelace=this.lovelace_),k.value=t,k.addEventListener("config-changed",x=>{x.stopPropagation();let z=x.detail?.config;z&&(e.cards[i]=z,this.emit_(),d.textContent=Xe(z),c.textContent=String(z.type??""))}),k.addEventListener("GUImode-changed",x=>x.stopPropagation()),m.appendChild(k),r.appendChild(m),r}verplaatsKaart_(e,t,n,i){let r=n+i;if(r<0||r>=e.cards.length)return;[e.cards[n],e.cards[r]]=[e.cards[r],e.cards[n]];let o=this.open_.has(`t${t}k${n}`),s=this.open_.has(`t${t}k${r}`);this.open_.delete(`t${t}k${n}`),this.open_.delete(`t${t}k${r}`),s&&this.open_.add(`t${t}k${n}`),o&&this.open_.add(`t${t}k${r}`),this.emit_(),this.build_()}verwijderKaart_(e,t,n){e.cards.splice(n,1);let i=new Set;for(let r of this.open_){let o=new RegExp(`^t${t}k(\\d+)$`).exec(r);if(!o){i.add(r);continue}let s=Number(o[1]);s!==n&&i.add(`t${t}k${s>n?s-1:s}`)}this.open_=i,this.emit_(),this.build_()}kiezerBlok_(e,t){let n=document.createElement("div");n.className="kiezer";let i=document.createElement("input");i.type="text",i.placeholder="Zoek een kaart...",i.value=this.zoek_??"";let r=document.createElement("div");r.className="soorten";let o=()=>{let l=Bo(Po(),this.zoek_);if(r.replaceChildren(),!l.length){let d=document.createElement("p");d.className="leeg",d.textContent="Niets gevonden. Kies iets anders, of gebruik de code-editor.",r.appendChild(d);return}for(let d of l){let c=document.createElement("button");c.type="button",c.className="soort";let p=document.createElement("b");p.textContent=d.naam;let h=document.createElement("small");h.textContent=d.uitleg||d.type,c.append(p,h),c.addEventListener("click",async()=>{e.cards.push(await Ko(d.type,this.hass_)),this.kiest_=null,this.open_.add(`t${t}`),this.open_.add(`t${t}k${e.cards.length-1}`),this.emit_(),this.build_()}),r.appendChild(c)}};o(),i.addEventListener("input",()=>{this.zoek_=i.value,o()});let s=document.createElement("button");return s.type="button",s.className="toevoegen",s.textContent="Annuleren",s.addEventListener("click",()=>{this.kiest_=null,this.build_()}),n.append(i,r,s),n}kopKnop_(e,t,n){let i=document.createElement("button");return i.type="button",i.className="rondknop",i.title=e,i.setAttribute("aria-label",e),i.innerHTML=t,i.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),i.disabled||n()}),i}verplaats_(e,t){let n=e+t;if(n<0||n>=this.tabs_.length)return;[this.tabs_[e],this.tabs_[n]]=[this.tabs_[n],this.tabs_[e]];let i=this.open_.has(`t${e}`),r=this.open_.has(`t${n}`);this.open_.delete(`t${e}`),this.open_.delete(`t${n}`),r&&this.open_.add(`t${e}`),i&&this.open_.add(`t${n}`),this.emit_(),this.build_()}verwijder_(e){this.tabs_.splice(e,1);let t=new Set;for(let n of this.open_){let i=Number(n.slice(1));i!==e&&t.add(`t${i>e?i-1:i}`)}this.open_=t,this.emit_(),this.build_()}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}emit_(){let e=Jo(this.tabs_),t={...this.rest_,tabs:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_??[])n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};O("domotiapp-tabs-card-editor",ci);var es=a=>a.parentElement??(a.parentNode&&a.parentNode.host)??null;function*ns(a){let e=es(a),t=0;for(;e&&t++<40;)yield e,e=es(e)}function ts(a){let e=null;for(let n of ns(a))if((n.tagName?.toLowerCase?.()??"")==="hui-dialog-edit-card"){e=n;break}if(!e)return null;let t=(n,i=0)=>{if(!n||i>25)return null;if(n.tagName?.toLowerCase?.()==="domotiapp-tabs-card-editor")return n;for(let r of n.children??[]){let o=t(r,i+1);if(o)return o}if(n.shadowRoot)for(let r of n.shadowRoot.children){let o=t(r,i+1);if(o)return o}return null};return t(e)}var kn=class extends M{constructor(){super(),this.kinderen_=new Map,this.open_=0}validate(e){let t=Ro(e),n={tone:"accent",...e,tabs:t};return t.length||(n[T]="Voeg tabbladen toe: elk met een naam, een icoon en een kaart erin."),n}watched(){return[]}setConfig(e){this.kinderen_.clear(),super.setConfig(e)}set hass(e){super.hass=e;for(let t of this.kinderen_.values())if(t)for(let n of t)n&&(n.hass=e);this.herijkIndeling_()}get hass(){return super.hass}template(){let e=this.config;e.bare&&this.setAttribute("bare",""),e.show_names===!1&&this.setAttribute("geen-namen",""),(e.alignment==="links"||e.alignment==="rechts")&&this.setAttribute("uitgelijnd",e.alignment);let t=e.tabs.map((i,r)=>`
        <button type="button" class="tab" role="tab" data-i="${r}" aria-selected="false"
                title="${I(i.name)}">
          ${i.icon?`<span class="ic">${v(i.icon,"grid")}</span>`:""}
          <span class="nm">${I(i.name||`Tab ${r+1}`)}</span>
        </button>`).join(""),n=e.tabs.map((i,r)=>`<div class="vak" data-i="${r}" role="tabpanel"></div>`).join("");return`
      <div class="card surface" style="--tone:${U(e.tone)}">
        <div class="balk" role="tablist">${t}</div>
        <div class="vakken">${n}</div>
      </div>`}wire(){for(let e of this.$$(".tab"))this.on(e,"click",()=>this.kies_(Number(e.dataset.i)));this.teardown_.push(R(this.$(".card"))),this.kies_(Vo(this.config,this.config.tabs,this.opslag_()),!1)}paint(){}opslag_(){try{return window.localStorage}catch{return null}}kies_(e,t=!0){let n=this.config.tabs;if(!n.length)return;let i=Math.min(Math.max(0,e),n.length-1);this.open_=i;for(let r of this.$$(".tab"))r.setAttribute("aria-selected",String(Number(r.dataset.i)===i));for(let r of this.$$(".vak"))r.dataset.open=String(Number(r.dataset.i)===i);t&&Io(this.opslag_(),li(n),i),this.bouw_(i)}async bouw_(e){if(this.kinderen_.has(e)){D(this.$(".card"));return}let t=this.$(`.vak[data-i="${e}"]`),n=this.config.tabs[e];if(!(!t||!n)){if(!n.cards.length){let i=document.createElement("div");i.className="leeg",i.textContent="Deze tab heeft nog geen kaart.",t.replaceChildren(i),D(this.$(".card")),this.knopLater_(e);return}this.kinderen_.set(e,null);try{if(!await window.loadCardHelpers?.())throw new Error("loadCardHelpers ontbreekt");let r=ts(this),o=!!r,s=n.cards.map(l=>{let d=document.createElement("hui-card");return d.hass=this.hass,d.preview=o,d.config=l,_t(d,l?.grid_options),d});if(this.kinderen_.set(e,s),r&&bn()){t.replaceChildren(Zo({hass:this.hass,kaarten:n.cards,maakKaart:(l,d)=>s[d]??null,opActie:(l,d)=>r.uitVoorbeeld?.(e,l,d)}),this.voegToeKnop_(e)),D(this.$(".card"));return}t.replaceChildren(...s),D(this.$(".card")),this.herijkIndeling_()}catch(i){this.kinderen_.delete(e),t.innerHTML=`<div class="leeg">Deze kaart kon niet geladen worden: ${I(i?.message??i)}</div>`,D(this.$(".card"))}}}herijkIndeling_(e=3){let t=!1;for(let[n,i]of this.kinderen_.entries()){if(!i)continue;let r=this.config?.tabs?.[n]?.cards??[];i.forEach((o,s)=>{let l=Wo(o);l&&(t=!0),_t(o,r[s]?.grid_options,l)})}!t&&e>0&&requestAnimationFrame(()=>this.herijkIndeling_(e-1))}knopLater_(e,t=60){let n=this.$(`.vak[data-i="${e}"]`);if(!n||n.querySelector(".voegtoe")||this.config?.tabs?.[e]?.cards?.length)return;if(this.inVoorbeeld_()){n.appendChild(this.voegToeKnop_(e)),D(this.$(".card"));return}if(t<=0)return;let i=setTimeout(()=>this.knopLater_(e,t-1),50);this.teardown_.push(()=>clearTimeout(i))}inVoorbeeld_(){for(let e of ns(this))if(e.tagName?.toLowerCase?.()==="hui-dialog-edit-card")return!0;return!1}voegToeKnop_(e){let t=document.createElement("button");return t.type="button",t.className="voegtoe",t.textContent="\uFF0B  Kaart toevoegen",t.addEventListener("click",n=>{n.stopPropagation(),ts(this)?.uitVoorbeeld?.(e,"toevoegen",{})}),t}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-tabs-card-editor")}static getStubConfig(){return{tabs:[{name:"Woning",icon:"house",card:null},{name:"Weer",icon:"cloudSun",card:null}]}}};y(kn,"css",`
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
  `);N("domotiapp-tabs-card",kn,{name:"DomotiApp Tabbladen",description:"Meerdere kaarten achter tabbladen, met een rij knoppen erboven. De gekozen tab wordt per apparaat onthouden."});var K={UIT:"uit",KLAAR:"klaar",UITGESTELD:"uitgesteld",DRAAIT:"draait",PAUZE:"pauze",AF:"af",FOUT:"fout",ONBEKEND:"onbekend"},Nc=[[K.FOUT,["error","fout","aborting","afgebroken"]],[K.DRAAIT,["run","active","washing","drying","rinsing","bezig","draait","on"]],[K.PAUZE,["pause","paused","pauze","onderbroken"]],[K.UITGESTELD,["delayedstart","delayed","scheduled","uitgesteld","wachten"]],[K.AF,["finished","complete","done","klaar met","afgelopen"]],[K.KLAAR,["ready","idle","standby","klaar","gereed"]],[K.UIT,["off","inactive","uit"]]],Oc=new Set([K.DRAAIT]);function is(a){let e=String(a??"").toLowerCase().trim();if(!e||e==="unknown"||e==="unavailable")return K.ONBEKEND;let t=e.split(/[^a-z0-9]+/).filter(Boolean);for(let[n,i]of Nc)for(let r of i)if(r.includes(" ")?e.includes(r):t.includes(r))return n;return K.ONBEKEND}var rs=a=>Oc.has(is(a?.state));function os(a,e=new Date){if(!a)return null;let t=String(a.state??"").trim();if(!t||t==="unknown"||t==="unavailable")return null;let n=a.attributes??{};if(n.device_class==="timestamp"||/^\d{4}-\d{2}-\d{2}[T ]/.test(t)){let s=new Date(t);return Number.isNaN(+s)?null:Math.max(0,Math.round((s-e)/6e4))}let i=t.match(/^(\d{1,3}):(\d{2})(?::(\d{2}))?$/);if(i)return Number(i[1])*60+Number(i[2])+(i[3]?Math.round(Number(i[3])/60):0);let r=Number(t);if(!Number.isFinite(r))return null;let o=String(n.unit_of_measurement??"min").toLowerCase();return o.startsWith("s")?Math.round(r/60):o.startsWith("h")||o.startsWith("u")?Math.round(r*60):Math.round(r)}function as(a){if(a==null)return"";if(a<=0)return"Klaar";if(a<60)return`nog ${a} min`;let e=Math.floor(a/60),t=a%60;return t?`nog ${e} u ${t} min`:`nog ${e} uur`}function ss(a){if(!a)return null;let e=String(a.state??"").trim();if(!e||e==="unknown"||e==="unavailable")return null;let t=Number(e);return Number.isFinite(t)?Math.min(100,Math.max(0,Math.round(t))):null}var Tc=a=>!!a&&a.state==="on",ls=a=>a===K.DRAAIT||a===K.PAUZE||a===K.UITGESTELD;function ds({status:a,deur:e,rest:t,pct:n}={}){let i=is(a?.state),r=Tc(e);if(i===K.DRAAIT){let o=[];return t!=null?o.push(as(t)):n!=null&&o.push(`${n}%`),{soort:i,tekst:o.length?`Draait \xB7 ${o.join(" ")}`:"Draait",tone:"accent",waarschuwing:""}}return i===K.PAUZE?{soort:i,tekst:"Gepauzeerd",tone:"warn",waarschuwing:r?"Klep open":""}:i===K.FOUT?{soort:i,tekst:"Storing",tone:"bad",waarschuwing:r?"Klep open":""}:i===K.AF?{soort:i,tekst:"Programma klaar",tone:"good",waarschuwing:""}:i===K.UITGESTELD?{soort:i,tekst:t!=null?`Start over ${as(t).replace(/^nog /,"")}`:"Uitgestelde start",tone:"accent",waarschuwing:r?"Klep open":""}:r?{soort:i,tekst:"Klep open",tone:"warn",waarschuwing:""}:i===K.UIT?{soort:i,tekst:"Uit",tone:"neutral",waarschuwing:""}:i===K.KLAAR?{soort:i,tekst:"Klaar om te starten",tone:"neutral",waarschuwing:""}:{soort:K.ONBEKEND,tekst:"Niet bereikbaar",tone:"neutral",waarschuwing:""}}function cs(a){let e=String(a??"");switch(e.split(".")[0]){case"button":return["button","press",{entity_id:e}];case"input_button":return["input_button","press",{entity_id:e}];case"script":return["script","turn_on",{entity_id:e}];case"scene":return["scene","turn_on",{entity_id:e}];case"switch":case"input_boolean":return["homeassistant","turn_on",{entity_id:e}];case"automation":return["automation","trigger",{entity_id:e}];default:return null}}var Dc={good:$.good,warn:$.warn,bad:$.bad,neutral:$.neutral,accent:$.accent},xn=class extends M{validate(e){let t={name:"",icon:"dishwasher",...e};return!t.status&&!t.remaining&&!t.progress&&!t.program&&(t[T]="Kies minstens een statussensor. Resterende tijd, voortgang, programma en de knoppen mogen daarna."),t}watched(){return[this.config.status,this.config.remaining,this.config.progress,this.config.program,this.config.door,this.config.smart,this.config.start,this.config.stop].filter(Boolean)}template(){this.config.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size";let t=(n,i,r)=>`
      <button type="button" class="knop ${n}" hidden>
        ${v(i)}<span class="lb">${I(r)}</span>
      </button>`;return`
      <div class="card surface" style="--tone:${$.accent}">
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
      </div>`}wire(){let e=this.config;this.on(this.$(".top"),"click",()=>{let t=e.status||e.remaining||e.program;t&&this.moreInfo_(t)}),this.on(this.$(".knop.start"),"click",()=>this.druk_(e.start)),this.on(this.$(".knop.stop"),"click",()=>this.druk_(e.stop)),this.on(this.$(".knop.slim"),"click",()=>{if(!e.smart)return;let t=te(b(this.hass,e.smart));this.hass.callService("homeassistant",t?"turn_off":"turn_on",{entity_id:e.smart})}),this.on(this.$(".rij.programma"),"change",t=>{let n=t.target?.closest?.(".keuze");if(!n||!e.program)return;t.stopPropagation();let i=Zt(e.program,n.value,Se(b(this.hass,e.program)));i&&this.hass.callService(i[0],i[1],i[2])}),this.teardown_.push(R(this.$(".card")))}moreInfo_(e){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0}))}druk_(e){let t=cs(e);t&&this.hass.callService(t[0],t[1],t[2])}paint(){let e=this.config,t=b(this.hass,e.status),n=b(this.hass,e.door),i=os(b(this.hass,e.remaining)),r=ss(b(this.hass,e.progress)),o=ds({status:t,deur:n,rest:i,pct:r}),s=rs(t);this.toggleAttribute("draait",s),this.toggleAttribute("onbekend",s&&r==null);let l=this.$(".top"),d=Dc[o.tone]??$.accent;this.$(".card").style.setProperty("--tone",d),l.classList.toggle("unavailable",o.soort==="onbekend");let c=this.$(".chip"),p=e.icon||"dishwasher";c.dataset.icon!==p&&(c.dataset.icon=p,c.innerHTML=v(p,"dishwasher")),c.style.setProperty("--tone",d),this.text(".nm",e.name||E(this.hass,e.status,null)||"Vaatwasser");let h=this.$(".st"),g=I(o.tekst),m=o.waarschuwing?` &middot; <span class="let">${I(o.waarschuwing)}</span>`:"";h.dataset.tekst!==g+m&&(h.dataset.tekst=g+m,h.innerHTML=g+m),l.setAttribute("aria-label",`${this.$(".nm").textContent}, ${o.tekst}`);let k=this.$(".balk"),x=ls(o.soort)&&(r!=null||s);if(k.hidden=!x,x){let z=this.$(".vul"),_=r!=null?`${r}%`:"";_&&z.style.width!==_&&(z.style.width=_),k.setAttribute("role","progressbar"),r!=null?(k.setAttribute("aria-valuenow",String(r)),k.setAttribute("aria-valuemin","0"),k.setAttribute("aria-valuemax","100")):k.removeAttribute("aria-valuenow")}this.paintBediening_(),D(this.$(".card"))}paintBediening_(){let e=this.config,t=this.$(".programslot"),n=b(this.hass,e.program),i=e.program?Se(n):[],r=i.map(d=>Xt(d,this.hass?.formatEntityState?.(n,d))),o=JSON.stringify([i,r]);t.dataset.opties!==o&&(t.dataset.opties=o,t.innerHTML=i.length?`<select class="keuze" aria-label="Programma">${i.map((d,c)=>`<option value="${I(d)}">${I(r[c])}</option>`).join("")}</select>`:"");let s=t.querySelector(".keuze");if(s&&this.shadowRoot.activeElement!==s){let d=Ft(n);s.value!==d&&(s.value=d)}let l=this.$(".knop.slim");l.hidden=!e.smart,e.smart&&(l.dataset.aan=String(te(b(this.hass,e.smart)))),this.$(".knop.start").hidden=!e.start,this.$(".knop.stop").hidden=!e.stop,this.$(".rij.programma").hidden=!s,this.$(".rij.knoppen").hidden=!e.smart&&!e.start&&!e.stop}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-dishwasher-card-editor")}static getStubConfig(e,t){return{status:((i,r)=>t?.find(o=>o.startsWith(i)&&r.test(o))??"")("sensor.",/vaatwas|dishwash/i),name:"Vaatwasser"}}};y(xn,"css",`
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
  `);var pi=class extends C{defaults(){return{icon:"dishwasher"}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"dishwasher",auto:!1}]}schema(){return[{name:"name",selector:f.text()},{name:"status",selector:f.entity(["sensor","binary_sensor"])},{name:"remaining",selector:f.entity(["sensor"])},{name:"progress",selector:f.entity(["sensor","number"])},{name:"program",selector:f.entity(["select","input_select"])},{name:"start",selector:f.entity(["button","input_button","script","switch","automation"])},{name:"stop",selector:f.entity(["button","input_button","script","switch","automation"])},{name:"door",selector:f.entity(["binary_sensor"])},{name:"smart",selector:f.entity(["input_boolean","switch"])}]}label(e){return{name:"Naam",status:"Statussensor",remaining:"Resterende tijd",progress:"Voortgang (0-100%)",program:"Programmakeuze",start:"Start / pauze",stop:"Stop",door:"Klep- of deursensor",smart:"Slimme sturing"}[e.name]??super.label(e)}helper(e){return{status:"De sensor die Run, Ready, Finished of iets in die geest meldt. De kaart vertaalt dat zelf.",remaining:"Een tijdstip, een aantal minuten of een klok als 1:24:00 \u2014 alle drie worden gelezen. Een tijdstip is het moment waarop hij klaar is, geen duur.",progress:"Zonder deze sensor is er geen stand, en schuift er een streepje heen en weer zolang hij draait.",program:"Een keuzelijst met de programma's. Verschijnt als uitklaplijst op de kaart.",start:"Een knop, een script of een schakelaar \u2014 de kaart kiest zelf de juiste service.",stop:"Idem. Deze knop is rood, want hij onderbreekt iets dat loopt.",door:"Staat de klep open, dan zegt de kaart dat in plaats van 'klaar om te starten'.",smart:"De input_boolean van je eigen slimme sturing. De knop licht op als hij aanstaat."}[e.name]}};H("domotiapp-dishwasher-card-editor",pi);N("domotiapp-dishwasher-card",xn,{name:"DomotiApp Vaatwasser",description:"Status, resterende tijd met voortgangsbalk, programmakeuze en de knoppen \u2014 met een balk die loopt zolang hij draait."});function Cc(a,e,t,{live:n=!1,fit:i="cover"}={}){if(!t)return null;let r=typeof customElements<"u"&&customElements.get("hui-image"),o=r?"hui-image":"img",s=a;if((!s||s.localName!==o)&&(s=document.createElement(o),s.className="beeld"),r){let l=n?"live":"auto";s.cameraImage!==t&&(s.cameraImage=t),s.cameraView!==l&&(s.cameraView=l),s.fitMode!==i&&(s.fitMode=i),s.hass=e}else{let l=e?.states?.[t],d=l?.attributes?.entity_picture;d&&s.dataset.bron!==d&&(s.dataset.bron=d,s.src=d),s.alt=l?.attributes?.friendly_name??t,s.style.objectFit=i}return s}function _n(a,e,t,n){if(!a)return null;let i=a.querySelector(".beeld"),r=Cc(i,e,t,n);return r?(r!==i&&(i?.remove(),a.appendChild(r)),r):(i?.remove(),null)}var hi={idle:{woord:"Klaar voor gebruik",toon:"neutral"},printing:{woord:"Aan het printen",toon:"accent"},paused:{woord:"Gepauzeerd",toon:"warn"},finished:{woord:"Klaar",toon:"good"},failed:{woord:"Mislukt",toon:"bad"},offline:{woord:"Offline",toon:"neutral"},prepare:{woord:"Voorbereiden",toon:"accent"},unknown:{woord:"Onbekend",toon:"neutral"}},Lc={idle:["idle","operational","standby","ready","on","off"],printing:["printing","running","run","print","busy","active"],paused:["pause","paused","pausing"],finished:["finish","finished","complete","completed","done","success"],failed:["failed","fail","error","cancelled","canceled","stopped"],prepare:["prepare","preparing","heating","slicing","init"],offline:["offline","unavailable","unknown","disconnected"]};function ui(a){let e=String(a?.state??"").trim().toLowerCase();if(!e)return"unknown";if(e==="unavailable"||e==="none")return"offline";for(let[t,n]of Object.entries(Lc))if(n.includes(e))return t;return"unknown"}function wn(a){let e=ui(a);return e==="printing"||e==="prepare"}function mi(a){let e=Number(a?.state);return Number.isFinite(e)?Math.max(0,Math.min(100,Math.round(e))):null}function gi(a){let e=Number(a?.state);return Number.isFinite(e)?{waarde:Math.round(e),eenheid:a?.attributes?.unit_of_measurement??"\xB0C"}:null}function fi(a,e=Date.now()){let t=String(a?.state??"").trim();if(!t||t==="unavailable"||t==="unknown")return null;if(a?.attributes?.device_class==="timestamp"||/[T ]\d{2}:\d{2}/.test(t)){let o=Date.parse(t);if(Number.isFinite(o))return Math.max(0,Math.round((o-e)/6e4))}if(/^\d+:\d{2}(:\d{2})?$/.test(t)){let o=t.split(":").map(Number),[s,l]=o.length===3?o:[0,o[0]];return s*60+l}let i=Number(t);if(!Number.isFinite(i))return null;let r=String(a?.attributes?.unit_of_measurement??"").toLowerCase();return r==="h"||r==="u"||r.startsWith("hour")?Math.round(i*60):r==="s"||r.startsWith("sec")?Math.round(i/60):Math.round(i)}function bi(a){if(a==null)return"";let e=Math.max(0,Math.round(a));return e<60?`${e} min`:`${Math.floor(e/60)} u ${String(e%60).padStart(2,"0")}`}function vi(a,e=new Date){if(a==null)return"";let t=new Date(e.getTime()+a*6e4);return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}var Hc=new Set(["unknown","unavailable","none","null","empty","leeg","off","unload","unloaded"]);function De(a,{namen:e=!1}={}){if(typeof a!="string")return null;let t=a.trim();if(!t)return null;let n=t.replace(/^#/,"");return/^[0-9a-f]{8}$/i.test(n)?parseInt(n.slice(6),16)<16?null:`#${n.slice(0,6).toUpperCase()}`:/^[0-9a-f]{6}$/i.test(n)?`#${n.toUpperCase()}`:/^[0-9a-f]{3}$/i.test(n)?`#${n.toUpperCase()}`:/^rgba?\(/i.test(t)?t:!e||Hc.has(t.toLowerCase())?null:/^[a-z]+$/i.test(t)?t:null}function ps(a,e={}){let t=a?.attributes??{},n=De(e.color,{namen:!0})??De(t.color)??De(Array.isArray(t.cols)?t.cols[0]:t.cols)??De(t.filament_color)??De(t.tray_color)??(/^#?[0-9a-f]{3,8}$/i.test(String(a?.state??""))?De(a.state):null)??null,i=e.label||t.type||t.filament_type||t.tray_type||t.name||(a&&!De(a.state)?a.state:"")||"",r=t.empty===!0||t.empty==="true"?!0:!n&&!String(i).trim(),o=Number(t.remain??t.remaining),s=t.remain_enabled!==!1&&!r;return{kleur:r?null:n,soort:String(i).trim(),leeg:r,actief:t.active===!0||t.active==="true",rest:s&&Number.isFinite(o)&&o>=0&&o<=100?Math.round(o):null}}var Ye=[1,2,3,4],Rc={good:$.good,warn:$.warn,bad:$.bad,neutral:$.neutral,accent:$.accent},yn=class extends M{validate(e){let t={name:"",icon:"printer3d",...e};return t.status||t.progress||t.camera||t.image||t.nozzle_temp||t.bed_temp||t.power||(t[T]="Kies minstens een printstatus. Camera, voortgang, temperaturen, de deur en de trays van de AMS mogen daarna."),t}watched(){let e=this.config;return[e.status,e.progress,e.remaining,e.nozzle_temp,e.bed_temp,e.door,e.power,e.camera,e.image,...Ye.map(t=>e[`tray_${t}`])].filter(Boolean)}beeldSoort_(){let e=this.config;return e.camera&&e.image?this.beeld_??(wn(b(this.hass,e.status))?"camera":"image"):e.camera?"camera":e.image?"image":null}template(){return this.config.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size",`
      <div class="card surface" style="--tone:${$.accent}">
        <div class="kop">
          <button class="ico" type="button" aria-label="Meer info"></button>
          <span class="tekst">
            <span class="nm"></span>
            <span class="st"></span>
          </span>
          <button class="aanuit" type="button" aria-pressed="false"
                  aria-label="Printer aan of uit" hidden>${v("power")}</button>
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
      </div>`}wire(){let e=this.config;this.teardown_.push(R(this.$(".card"))),this.on(this.$(".ico"),"click",()=>V(this,e.status||e.power||e.camera||e.progress));let t=this.$(".aanuit");this.on(t,"click",i=>{i.stopPropagation(),this.schakel_()});let n=this.$(".wissel");this.on(n,"click",i=>{i.stopPropagation(),this.beeld_=this.beeldSoort_()==="camera"?"image":"camera",this.paint()}),this.on(this.$(".beeldvak"),"click",i=>{if(i.target.closest(".wissel"))return;let r=this.beeldSoort_()==="camera"?e.camera:e.image;r&&V(this,r)})}async schakel_(){let e=this.config.power;if(!e)return;let t=b(this.hass,e),n=te(t),i=String(e).split(".")[0];if(n){let r=mi(b(this.hass,this.config.progress)),o=wn(b(this.hass,this.config.status));if(!await ft({title:"Printer uitzetten?",text:o?`Er loopt een print${r===null?"":` (${r}% klaar)`}. Uitzetten breekt hem af, en dat is niet terug te draaien.`:"Weet je zeker dat je de printer wilt uitzetten?",confirmText:"Uitzetten",dismissText:"Aan laten"}))return}this.hass.callService(i,n?"turn_off":"turn_on",{entity_id:e})}paint(){let e=this.config,t=b(this.hass,e.status),n=ui(t),i=hi[n]??hi.unknown,r=wn(t),o=e.status&&(!t||t.state==="unavailable");this.toggleAttribute("dead",!!o),this.toggleAttribute("loopt",r&&!o),this.$(".card").style.setProperty("--tone",Rc[i.toon]??$.accent),this.$(".ico").innerHTML=v(e.icon||"printer3d"),this.text(".nm",e.name||E(this.hass,e.status||e.power||e.camera,"3D-printer"));let s=String(t?.state??"").trim(),l=n==="unknown"&&s&&s.toLowerCase()!=="unknown",d=`<b>${this.veilig_(l?s:i.woord)}</b>${this.bijzin_()}`,c=this.$(".st");c.innerHTML!==d&&(c.innerHTML=d),this.paintAanUit_(),this.paintBeeld_(r),this.paintVoortgang_(r),this.paintTegels_(),this.paintAms_(),D(this.$(".card"))}bijzin_(){let e=fi(b(this.hass,this.config.remaining));return e===null||e<=0?"":` \xB7 nog ${this.veilig_(bi(e))}, klaar om ${this.veilig_(vi(e))}`}paintAanUit_(){let e=this.$(".aanuit"),t=this.config.power;if(e.hidden=!t,!t)return;let n=te(b(this.hass,t));e.setAttribute("aria-pressed",String(n)),e.setAttribute("aria-label",n?"Printer uitzetten":"Printer aanzetten")}paintBeeld_(e){let t=this.config,n=this.$(".beeldvak"),i=this.beeldSoort_();if(n.hidden=!i,!i)return;let r=this.$(".wissel");if(r.hidden=!(t.camera&&t.image),!r.hidden){let d=i==="camera"?"Voorbeeld":"Camera";r.innerHTML=`${v(i==="camera"?"grid":"camera")}<span>${d}</span>`,r.setAttribute("aria-label",`Toon ${d.toLowerCase()}`)}if(i==="camera"){_n(n,this.hass,t.camera,{live:t.live_view===!0||e}),n.querySelector(".leeg")?.remove();return}n.querySelector("hui-image")?.remove();let s=b(this.hass,t.image)?.attributes?.entity_picture,l=n.querySelector("img.beeld");if(s)l||(l=document.createElement("img"),l.className="beeld",l.alt="Wat de printer aan het maken is",n.appendChild(l)),l.dataset.bron!==s&&(l.dataset.bron=s,l.src=s),n.querySelector(".leeg")?.remove();else if(l?.remove(),!n.querySelector(".leeg")){let d=document.createElement("span");d.className="leeg",d.textContent="Nog geen voorbeeld",n.appendChild(d)}}paintVoortgang_(e){let t=this.config,n=this.$(".voort"),i=mi(b(this.hass,t.progress)),r=fi(b(this.hass,t.remaining));if(n.hidden=i===null&&!e,n.hidden)return;let o=this.$(".balk");o.dataset.onbekend=String(i===null),o.querySelector("i").style.setProperty("--pct",`${i??0}%`),this.text(".pct",i===null?"Bezig":`${i}%`),this.text(".rest",r===null||r<=0?"":`nog ${bi(r)} \xB7 klaar om ${vi(r)}`)}paintTegels_(){let e=this.config,t=this.$(".tegels"),n=[],i=gi(b(this.hass,e.nozzle_temp));i&&n.push({w:`${i.waarde}${i.eenheid}`,l:"Nozzle"});let r=gi(b(this.hass,e.bed_temp));r&&n.push({w:`${r.waarde}${r.eenheid}`,l:"Bed"});let o=b(this.hass,e.door);if(o){let l=te(o);n.push({w:l?"Open":"Dicht",l:"Deur",let:l})}if(t.hidden=!n.length,!n.length)return;t.style.setProperty("--kolommen",String(n.length));let s=n.map(l=>`${l.w}|${l.l}|${l.let??""}`).join(",");t.dataset.sig!==s&&(t.dataset.sig=s,t.innerHTML=n.map(l=>`<div class="tegel" data-let="${!!l.let}"><span class="w">${this.veilig_(l.w)}</span><span class="l">${this.veilig_(l.l)}</span></div>`).join(""))}paintAms_(){let e=this.config,t=this.$(".ams"),n=Ye.filter(l=>e[`tray_${l}`]||e[`tray_${l}_color`]);if(t.hidden=!n.length,!n.length)return;let i=this.$(".ams .rij"),r=Ye.map(l=>ps(b(this.hass,e[`tray_${l}`]),{color:e[`tray_${l}_color`],label:e[`tray_${l}_label`]})),o=Ye.map(l=>b(this.hass,e[`tray_${l}`])?.attributes?.name??""),s=r.map(l=>`${l.kleur}|${l.soort}|${l.leeg}|${l.actief}|${l.rest}`).join(",");i.dataset.sig!==s&&(i.dataset.sig=s,i.innerHTML=r.map((l,d)=>{let c=o[d],p=`Tray ${d+1}`+(l.leeg?": leeg":c||l.soort?`: ${c||l.soort}`:"")+(l.rest===null?"":` \u2014 nog ${l.rest}%`)+(l.actief?" (in gebruik)":"");return`<div class="tray" data-leeg="${l.leeg}" data-actief="${l.actief}" style="--kleur:${l.kleur??"transparent"}" title="${this.veilig_(p)}"><span class="vlak">${l.rest===null?"":`<i style="--rest:${l.rest}%"></i>`}</span><span class="txt"><span class="nr">Tray ${d+1}</span><span class="so">${this.veilig_(l.leeg?"leeg":l.soort||"gevuld")}</span></span></div>`}).join(""))}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}getCardSize(){return this.config?.camera||this.config?.image?6:3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-printer-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>/^sensor\./.test(i)&&/(print|stage|status)/i.test(i));return n?{status:n}:{}}};y(yn,"css",`
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
  `);var ki=class extends C{defaults(){return{icon:"printer3d"}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"printer3d",auto:!1}]}schema(){return[{name:"name",selector:f.text()},{name:"status",selector:f.entity(["sensor","binary_sensor"])},{name:"power",selector:f.entity(["switch","input_boolean"])},{name:"progress",selector:f.entity(["sensor","number"])},{name:"remaining",selector:f.entity(["sensor"])},{name:"nozzle_temp",selector:f.entity(["sensor","number"])},{name:"bed_temp",selector:f.entity(["sensor","number"])},{name:"door",selector:f.entity(["binary_sensor"])},{name:"camera",selector:f.entity("camera")},{name:"live_view",selector:f.bool()},{name:"image",selector:f.entity(["image","camera"])},...Ye.flatMap(e=>[{name:`tray_${e}`,selector:f.entity(["sensor","select","text"])},{name:`tray_${e}_color`,selector:f.text()},{name:`tray_${e}_label`,selector:f.text()}])]}label(e){let t={};for(let n of Ye)t[`tray_${n}`]=`Tray ${n}`,t[`tray_${n}_color`]=`Tray ${n}: kleur met de hand`,t[`tray_${n}_label`]=`Tray ${n}: naam met de hand`;return{name:"Naam",status:"Printstatus",power:"Aan/uit-schakelaar",progress:"Printvoortgang (0-100%)",remaining:"Eindtijd of resterende tijd",nozzle_temp:"Nozzletemperatuur",bed_temp:"Bedtemperatuur",door:"Deur van de printer",camera:"Camera",live_view:"Altijd live beeld",image:"Voorbeeld van de print",...t}[e.name]??super.label(e)}helper(e){if(e.name==="status")return"De sensor die meldt wat hij doet. RUNNING, IDLE, FINISH, PAUSE en FAILED worden herkend, en die van Octoprint en Klipper ook.";if(e.name==="power")return"Zetten en uitzetten. Bij UITzetten vraagt de kaart eerst of je het zeker weet \u2014 en loopt er een print, dan staat erbij hoe ver hij was.";if(e.name==="remaining")return"Een aantal minuten, een klok als 1:24:00 of het tijdstip waarop hij klaar is: alle drie worden gelezen. De kaart toont beide \u2014 hoe lang nog \xE9n hoe laat.";if(e.name==="camera")return"Het live beeld van de printer. Staat er ook een voorbeeld ingesteld, dan komt er een knop om te wisselen.";if(e.name==="live_view")return"Normaal ververst het beeld een paar keer per minuut en gaat hij alleen echt live zolang er een print loopt. Met deze knop staat de stream altijd aan \u2014 mooier, maar het kost een verbinding die de hele dag openstaat.";if(e.name==="image")return"De `image`-entiteit met de plaat van wat hij aan het maken is.";if(e.name==="tray_1")return"De vier trays van de AMS. De kaart haalt de kleur en het soort filament uit de attributen van de entiteit; Bambu levert die als hexwaarde. Lukt dat niet, vul dan hieronder zelf een kleur in.";if(/^tray_\d_color$/.test(e.name))return"Alleen nodig als de entiteit zijn kleur niet meelevert. Een hexwaarde (#FF6B00) of een kleurnaam."}};H("domotiapp-printer-card-editor",ki);N("domotiapp-printer-card",yn,{name:"DomotiApp 3D-printer",description:"Live camerabeeld of het voorbeeld, voortgang met eindtijd, temperaturen, de deur en de vier trays van de AMS met hun echte kleur."});var Qe={fuel:{label:"Brandstof",icoon:"petrol"},hybrid:{label:"Hybride",icoon:"leaf"},electric:{label:"Elektrisch",icoon:"bolt"}},xi=a=>a==="electric"||a==="hybrid",_i=a=>a==="fuel"||a==="hybrid",Ic=["charging","charge","fast_charging","dc_charging","on","true","laden"],Vc=["complete","completed","fully_charged","full","done","finished"],Pc=["connected","plugged","plugged_in","cable_connected","ready_to_charge"],Bc=["not_plugged_in","not_plugged","notpluggedin","unplugged","disconnected","not_charging","notcharging","off","false","idle","no"];function hs(a){let e=String(a?.state??"").trim().toLowerCase();return!e||e==="unavailable"||e==="unknown"?null:Ic.includes(e)?"charging":Vc.includes(e)?"complete":Pc.includes(e)?"connected":Bc.includes(e)?"idle":"onbekend"}function us(a,e){if(a&&a!=="onbekend")return zn[a]??"";let t=String(e?.state??"").trim();if(!t||t==="unavailable"||t==="unknown")return"";let n=t.replace(/[_-]+/g," ").toLowerCase();return n.charAt(0).toUpperCase()+n.slice(1)}var zn={charging:"Aan het laden",complete:"Volgeladen",connected:"Aan de lader",idle:"Niet aan de lader"};function wi(a,e){let t=Number(a?.state);if(!Number.isFinite(t))return null;let n=String(a?.attributes?.unit_of_measurement??"").toLowerCase(),i=Number(e);return n!=="%"&&Number.isFinite(i)&&i>0?Math.max(0,Math.min(100,Math.round(t/i*100))):Math.max(0,Math.min(100,Math.round(t)))}function ms(a){let e=Number(a?.state);return Number.isFinite(e)?{waarde:Math.round(e),eenheid:a?.attributes?.unit_of_measurement??"km"}:null}function yi(a){if(a==null)return null;let e=a<=10?"bad":a<=20?"warn":"good";return{procent:a,toon:e}}function zi(a,e=Date.now()){let t=String(a?.state??"").trim();if(!t||t==="unavailable"||t==="unknown")return null;if(a?.attributes?.device_class==="timestamp"||/[T ]\d{2}:\d{2}/.test(t)){let r=Date.parse(t);if(Number.isFinite(r))return Math.max(0,Math.round((r-e)/6e4))}if(/^\d+:\d{2}(:\d{2})?$/.test(t)){let r=t.split(":").map(Number),[o,s]=r.length===3?r:[0,r[0]];return o*60+s}let n=Number(t);if(!Number.isFinite(n))return null;let i=String(a?.attributes?.unit_of_measurement??"").toLowerCase();return i==="h"||i.startsWith("hour")?Math.round(n*60):i==="s"||i.startsWith("sec")?Math.round(n/60):Math.round(n)}function ji(a){if(a==null)return"";let e=Math.max(0,Math.round(a));return e<60?`${e} min`:`${Math.floor(e/60)} u ${String(e%60).padStart(2,"0")}`}function gs({open:a,slot:e,laden:t,laadMinuten:n,radius:i,aandrijving:r}){if(a)return{tekst:"Er staat iets open",toon:"warn"};if(e==="unlocked")return{tekst:"Niet op slot",toon:"warn"};if(t==="charging"){let o=n?` \xB7 nog ${ji(n)}`:"";return{tekst:`${zn.charging}${o}`,toon:"accent"}}return t==="complete"?{tekst:zn.complete,toon:"good"}:t==="connected"?{tekst:zn.connected,toon:"neutral"}:i?{tekst:`Nog ${i.waarde} ${i.eenheid}`,toon:"neutral"}:{tekst:Qe[r]?.label??"",toon:"neutral"}}var Kc=100,Gc=["home","thuis","at_home","athome"],Uc=["not_home","away","afwezig","weg","not home","nothome"];function Wc(a,e,t,n){let r=d=>d*Math.PI/180,o=r(t-a),s=r(n-e),l=Math.sin(o/2)**2+Math.cos(r(a))*Math.cos(r(t))*Math.sin(s/2)**2;return 2*6371e3*Math.asin(Math.min(1,Math.sqrt(l)))}function qc(a){let e=a?.attributes??{},t=Number(e.latitude??e.lat),n=Number(e.longitude??e.lon??e.lng);if(Number.isFinite(t)&&Number.isFinite(n))return{lat:t,lon:n};let i=String(a?.state??""),r=i.match(/(?:lat|latitude)["']?\s*[:=]\s*(-?\d+(?:\.\d+)?)/i),o=i.match(/(?:lon|lng|longitude)["']?\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);return r&&o?{lat:Number(r[1]),lon:Number(o[1])}:null}function fs(a,e,t=Kc){if(!a)return{thuis:null,tekst:"",meters:null};let n=String(a.state??"").trim(),i=n.toLowerCase();if(i==="unavailable"||i==="unknown"||!n)return{thuis:null,tekst:"",meters:null};if(Gc.includes(i))return{thuis:!0,tekst:"Thuis",meters:null};if(Uc.includes(i))return{thuis:!1,tekst:"Afwezig",meters:null};let r=qc(a),o=Number(e?.config?.latitude),s=Number(e?.config?.longitude);if(r&&Number.isFinite(o)&&Number.isFinite(s)){let l=Wc(r.lat,r.lon,o,s),d=l<=t;return{thuis:d,tekst:d?"Thuis":"Afwezig",meters:Math.round(l)}}return{thuis:!1,tekst:n.charAt(0).toUpperCase()+n.slice(1),meters:null}}var Fc=["open","opened","ajar","unlatched","on","true","unlocked"],Zc=["closed","close","shut","secured","locked","off","false","not_open"];function $i(a){let e=String(a?.state??"").trim().toLowerCase();return!e||e==="unavailable"||e==="unknown"?null:Fc.includes(e)?!0:Zc.includes(e)?!1:/(^|[^a-z])(ajar|open)([^a-z]|$)/.test(e)?!0:null}function bs(a){let e=String(a?.state??"").trim().toLowerCase();if(!e||e==="unavailable"||e==="unknown")return null;if(String(a?.entity_id??"").split(".")[0]==="lock")return e==="locked"?!0:e==="unlocked"||e==="open"||e==="opening"?!1:null;if(a?.attributes?.device_class==="lock"){if(e==="on")return!1;if(e==="off")return!0}return["locked","lock","secured","closed","off","false"].includes(e)?!0:["unlocked","unlock","open","unsecured","on","true"].includes(e)?!1:null}var Ei={good:$.good,warn:$.warn,bad:$.bad,neutral:$.neutral,accent:$.accent},jn=class extends M{validate(e){let t={name:"",icon:"car",drivetrain:"electric",photo_size:"klein",...e};return t.battery||t.fuel||t.range||t.range_electric||t.sensors?.length||t.lock||t.image||(t[T]="Kies de aandrijving en vul minstens \xE9\xE9n sensor in \u2014 de accu, de tank of de actieradius."),t}watched(){let e=this.config;return[e.battery,e.fuel,e.range,e.range_electric,e.charging,e.charging_ready,e.charging_power,e.plug,e.lock,e.doors,e.windows,e.odometer,e.climate,e.location,...Array.isArray(e.sensors)?e.sensors:[]].filter(Boolean)}soort_(){return Qe[this.config.drivetrain]?this.config.drivetrain:"electric"}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),this.setAttribute("foto",e.photo_size==="groot"?"groot":"klein"),this.style.containerType="inline-size",`
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
      </div>`}wire(){this.teardown_.push(R(this.$(".card"))),this.on(this.$(".foto"),"click",()=>{let e=this.config;V(this,e.battery||e.range||e.fuel||e.lock)}),this.on(this.$(".tegels"),"click",e=>{let t=e.target.closest?.("[data-id]");t&&V(this,t.dataset.id)})}paint(){let e=this.config,t=this.soort_(),n=xi(t)?wi(b(this.hass,e.battery),e.battery_max):null,i=_i(t)?wi(b(this.hass,e.fuel),e.fuel_max):null,r=ms(b(this.hass,e.range)),o=hs(b(this.hass,e.charging)),s=zi(b(this.hass,e.charging_ready)),l=b(this.hass,e.lock),d=$i(b(this.hass,e.doors)),c=$i(b(this.hass,e.windows)),p=d===!0||c===!0,h=bs(l),g=fs(b(this.hass,e.location),this.hass,Number(e.home_radius)||void 0),m=e.battery&&!b(this.hass,e.battery)&&e.range&&!b(this.hass,e.range);this.toggleAttribute("dead",!!m),this.text(".nm",e.name||E(this.hass,e.battery||e.range||e.lock,"Auto"));let k=gs({open:p,slot:h===!1?"unlocked":h===!0?"locked":null,laden:o,laadMinuten:s,radius:r,aandrijving:t});this.text(".st",k.tekst),this.$(".st").style.setProperty("--melding",Ei[k.toon]??$.neutral),this.paintFoto_(),this.paintBalken_({accu:n,tank:i,radius:r,laden:o,soort:t}),this.paintTegels_(g,o,{slot:h,deurOpen:d,raamOpen:c}),D(this.$(".card"))}paintFoto_(){let e=this.$(".foto"),t=this.config.image;if(!t){e.dataset.bron!==""&&(e.dataset.bron="",e.innerHTML=v(this.config.icon||"car"));return}if(e.dataset.bron===t)return;e.dataset.bron=t;let n=document.createElement("img");n.src=t,n.alt=this.config.name||"De auto",n.loading="lazy",n.onerror=()=>{e.dataset.bron="",e.innerHTML=v(this.config.icon||"car")},e.replaceChildren(n)}paintBalken_({accu:e,tank:t,radius:n,laden:i,soort:r}){let o=this.config,s=this.$(".balken"),l=[];if(e!==null){let h=yi(e);l.push({sleutel:"accu",icoon:"battery",label:"Accu",pct:e,toon:i==="charging"?"accent":h.toon,waarde:`${e}%`,laadt:i==="charging"})}if(t!==null){let h=yi(t);l.push({sleutel:"tank",icoon:r==="hybrid"?"petrol":Qe[r].icoon,label:"Tank",pct:t,toon:h.toon,waarde:`${t}%`,laadt:!1})}if(!l.length&&n&&l.push({sleutel:"radius",icoon:"gaugeArrow",label:"Actieradius",pct:null,toon:"neutral",waarde:`${n.waarde} ${n.eenheid}`,laadt:!1}),s.hidden=!l.length,!l.length)return;let d=n?`${n.waarde} ${n.eenheid}`:"",c=zi(b(this.hass,o.charging_ready)),p=l.map(h=>`${h.sleutel}:${h.pct}:${h.toon}:${h.laadt}`).join(",")+d+c;s.dataset.sig!==p&&(s.dataset.sig=p,s.innerHTML=l.map((h,g)=>{let m=g===0&&h.sleutel!=="radius"&&d?`<span class="w">${this.veilig_(h.waarde)} \xB7 ${this.veilig_(d)}</span>`:`<span class="w">${this.veilig_(h.waarde)}</span>`,k=h.laadt&&c?` \xB7 nog ${this.veilig_(ji(c))}`:"";return`
          <div class="meter" style="--balk:${Ei[h.toon]??$.neutral}">
            <div class="regel">
              <span class="l">${v(h.icoon)}<span>${this.veilig_(h.label)}${k}</span></span>
              ${m}
            </div>
            ${h.pct===null?"":`<div class="lijn" data-laadt="${h.laadt}"><i style="--pct:${h.pct}%"></i></div>`}
          </div>`}).join(""))}paintTegels_(e,t,n={}){let i=this.config,r=this.$(".tegels"),o=[],s=(d,c)=>{let p=b(this.hass,d);if(!p||p.state==="unavailable"||p.state==="unknown")return;let h=p.attributes?.unit_of_measurement??"",g=Number(p.state),m=Number.isFinite(g)?`${Math.round(g*10)/10}${h?` ${h}`:""}`:p.state;o.push({id:d,w:m,l:c??E(this.hass,d,d)})};if(i.location&&e?.tekst){let d=e.thuis===!1&&e.meters!==null?e.meters>=1e3?` \xB7 ${Math.round(e.meters/100)/10} km`:` \xB7 ${e.meters} m`:"";o.push({id:i.location,w:e.tekst+d,l:"Waar hij staat",toon:e.thuis===!0?"good":null})}if(i.charging){let d=b(this.hass,i.charging),c=us(t,d);c&&o.push({id:i.charging,w:c,l:"Laadstatus",toon:t==="charging"?"accent":t==="complete"?"good":null})}i.lock&&n.slot!==null&&n.slot!==void 0&&o.push({id:i.lock,w:n.slot?"Op slot":"Niet op slot",l:"Portierslot",toon:n.slot?"good":"warn"}),i.doors&&n.deurOpen!==null&&n.deurOpen!==void 0&&o.push({id:i.doors,w:n.deurOpen?"Open":"Dicht",l:"Deuren",toon:n.deurOpen?"warn":null}),i.windows&&n.raamOpen!==null&&n.raamOpen!==void 0&&o.push({id:i.windows,w:n.raamOpen?"Open":"Dicht",l:"Ramen",toon:n.raamOpen?"warn":null}),i.climate&&s(i.climate,"Voorverwarmen"),i.odometer&&s(i.odometer,"Kilometerstand"),i.charging_power&&s(i.charging_power,"Laadvermogen");for(let d of Array.isArray(i.sensors)?i.sensors:[])s(d,null);if(r.hidden=!o.length,!o.length)return;let l=o.map(d=>`${d.id}|${d.w}|${d.toon??""}`).join(",");r.dataset.sig!==l&&(r.dataset.sig=l,r.innerHTML=o.map(d=>`<div class="tegel" data-id="${this.veilig_(d.id)}" role="button" tabindex="0"${d.toon?` style="--tegeltoon:${Ei[d.toon]??$.neutral}"`:""}><span class="w">${this.veilig_(d.w)}</span><span class="l">${this.veilig_(d.l)}</span></div>`).join(""))}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}getCardSize(){return this.config?.photo_size==="groot"?5:3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-auto-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>/^sensor\..*(battery|accu|soc)/i.test(i));return n?{battery:n,drivetrain:"electric"}:{drivetrain:"electric"}}};y(jn,"css",`
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
  `);var Ai=class extends C{defaults(){return{icon:"car",drivetrain:"electric",photo_size:"klein"}}pickers(){return[{key:"image",kind:"foto",label:"Foto van de auto"},{key:"icon",kind:"icon",label:"Icoon (zonder foto)",fallback:"car"}]}schema(){let e=Qe[this.config_?.drivetrain]?this.config_.drivetrain:"electric",t=[{name:"name",selector:f.text()},{name:"drivetrain",selector:f.select(Object.entries(Qe).map(([n,{label:i}])=>({value:n,label:i})))},{name:"photo_size",selector:f.select([{value:"klein",label:"Klein, naast de naam"},{value:"groot",label:"Groot, over de hele breedte"}])},{name:"range",selector:f.entity(["sensor","number"])}];return xi(e)&&t.push({name:"battery",selector:f.entity(["sensor","number"])},{name:"battery_max",selector:f.number(1,400,1)},{name:"charging",selector:f.entity(["sensor","binary_sensor","switch"])},{name:"charging_ready",selector:f.entity(["sensor"])},{name:"charging_power",selector:f.entity(["sensor"])}),_i(e)&&t.push({name:"fuel",selector:f.entity(["sensor","number"])},{name:"fuel_max",selector:f.number(1,200,1)}),t.push({name:"lock",selector:f.entity(["lock","sensor","binary_sensor"])},{name:"doors",selector:f.entity(["binary_sensor","sensor","cover"])},{name:"windows",selector:f.entity(["binary_sensor","sensor","cover"])},{name:"climate",selector:f.entity(["sensor","binary_sensor","switch","climate"])},{name:"location",selector:f.entity(["device_tracker","sensor","person"])},{name:"home_radius",selector:f.number(10,2e3,10)},{name:"odometer",selector:f.entity(["sensor"])},{name:"sensors",selector:{entity:{multiple:!0}}}),t}label(e){return{name:"Naam",drivetrain:"Aandrijving",image:"Foto van de auto",photo_size:"Hoe groot staat de foto",range:"Actieradius",battery:"Accupercentage",battery_max:"Accu-inhoud (kWh), als de sensor geen procenten geeft",charging:"Laadstatus",charging_ready:"Klaar met laden om / nog te gaan",charging_power:"Laadvermogen",fuel:"Tankniveau",fuel_max:"Tankinhoud (liter), als de sensor geen procenten geeft",lock:"Portierslot",doors:"Deuren open",windows:"Ramen open",climate:"Voorverwarmen (alleen uitlezen)",location:"Waar hij staat",home_radius:"Hoe dichtbij is thuis (meter)",odometer:"Kilometerstand",sensors:"Extra sensoren als tegel"}[e.name]??super.label(e)}helper(e){return{drivetrain:"Bepaalt welke balken er op de kaart komen \u2014 een accu, een tank, of allebei \u2014 en welke velden je hieronder ziet.",image:"Kies een bestand of sleep er een op. Home Assistant zet hem in zijn eigen media-opslag; je kunt ook een pad als /local/auto.png intypen.",range:"In de eenheid van de sensor zelf. De kaart rekent niets om: staat je Home Assistant op mijlen, dan zie je mijlen.",battery_max:"Alleen nodig als je accusensor in kWh meldt in plaats van in procenten. Dan rekent de kaart het percentage zelf uit.",fuel_max:"Alleen nodig als je tanksensor in liters meldt in plaats van in procenten.",charging_ready:"Een aantal minuten, een klok of het tijdstip waarop hij vol is \u2014 alle drie worden gelezen.",doors:"Staat er iets open, dan zegt de kaart dat en gaat al het andere even opzij. Een binary_sensor mag, maar een gewone sensor met een woord erin ook \u2014 Closed, Open, Ajar en LOCKED worden allemaal gelezen.",lock:"Alleen uitlezen: deze kaart bedient niets. Een lock-entiteit mag, maar ook een sensor die LOCKED of UNLOCKED meldt.",location:"Een device_tracker die home of not_home meldt, of een sensor met een coordinaat \u2014 beide worden gelezen. Bij een coordinaat rekent de kaart de afstand tot de locatie van je Home Assistant uit en maakt daar Thuis of Afwezig van.",home_radius:"Alleen van belang bij een sensor met een coordinaat. Binnen deze afstand van je huis heet de auto thuis. Leeg laten is 100 meter \u2014 ruim genoeg voor een oprit of een parkeerplaats om de hoek.",sensors:"Alles wat je verder nog kwijt wilt: bandenspanning, buitentemperatuur, de volgende beurt. Ze komen als tegels onderaan te staan, met de naam uit Home Assistant."}[e.name]}};H("domotiapp-auto-card-editor",Ai);N("domotiapp-auto-card",jn,{name:"DomotiApp Auto",description:"Brandstof, hybride of elektrisch: accu- en tankbalk, actieradius, laadstatus, het slot en zoveel eigen sensoren als je kwijt wilt \u2014 met een foto van de auto erbij."});function vs(a,e){return a?.entities?.[e]?.device_id??null}function Xc(a,e,t,n){if(n&&t.includes(n))return n;let i=vs(a,e);if(i){let r=t.filter(o=>vs(a,o)===i);if(r.length===1)return r[0]}return null}function $n(a,e,t,n,i){let r=Xc(a,e,t,n);return r===null||r===i}var En=[{sleutel:"mens",label:"Mens",icoon:"person",woorden:["person","persoon","personen","mens","people","human"]},{sleutel:"dier",label:"Dier",icoon:"dier",woorden:["pet","pets","dier","dieren","huisdier","animal","dog","hond","cat","kat"]},{sleutel:"voertuig",label:"Voertuig",icoon:"car",woorden:["vehicle","voertuig","car","auto","truck","vrachtwagen","motorcycle"]},{sleutel:"aanbellen",label:"Aanbellen",icoon:"bell",woorden:["doorbell","deurbel","aanbellen","aangebeld","visitor","bezoeker","bel","ring","chime"]},{sleutel:"ontgrendeling",label:"Ontgrendeling",icoon:"lockOpen",woorden:["unlock","unlocked","ontgrendeld","ontgrendeling","slot","lock","opener","deuropener","buzzer"]}],Le={sleutel:"beweging",label:"Beweging",icoon:"cctv",woorden:[]},An=[...En,Le];function xs(a){return An.find(e=>e.sleutel===a)??Le}function ks(a){return String(a??"").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)}function Mn(a,e){if(String(a??"").split(".")[0]==="lock")return"ontgrendeling";let n=new Set([...ks(a),...ks(e)]);for(let i of En)if(i.woorden.some(r=>n.has(r)))return i.sleutel;return Le.sleutel}function _s(a,e={}){let t=a?.melder,n=t?e[`meldersoort:${t}`]:null;return n&&An.some(i=>i.sleutel===n)?n:Mn(t,a?.naam)}function Yc(a){let e=Date.parse(a?.tijd??"");return Number.isNaN(e)?null:e}function ws(a,{soorten:e,camera:t,dag:n,config:i}={}){let r=e instanceof Set?e:new Set(e??[]),o=n==null?null:Ce(n);return(Array.isArray(a)?a:[]).filter(s=>{if(r.size&&!r.has(_s(s,i))||t&&s.camera!==t)return!1;if(o){let l=Yc(s);if(l===null||l<o.vanaf||l>=o.tot)return!1}return!0})}function ys(a,e={}){let t={};for(let n of Array.isArray(a)?a:[]){let i=_s(n,e);t[i]=(t[i]??0)+1}return t}function Ce(a){let e=new Date(a),t=new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime(),n=new Date(e.getFullYear(),e.getMonth(),e.getDate()+1).getTime();return{vanaf:t,tot:n}}function zs(a,e){let t=new Date(a);return new Date(t.getFullYear(),t.getMonth(),t.getDate()+e).getTime()}var Qc=["zo","ma","di","wo","do","vr","za"],Jc=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];function js(a,e=Date.now()){if(a==null)return"Alles";let t=Ce(e).vanaf,n=Ce(a).vanaf,i=Math.round((t-n)/864e5);if(i===0)return"Vandaag";if(i===1)return"Gisteren";let r=new Date(n);return`${Qc[r.getDay()]} ${r.getDate()} ${Jc[r.getMonth()]}`}function $s(a){let e=new Date(a);return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Es(a){let e=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(a??""));return e?new Date(Number(e[1]),Number(e[2])-1,Number(e[3])).getTime():null}function ep(a){let e=[a?.camera,...Array.isArray(a?.cameras)?a.cameras:[]].filter(t=>typeof t=="string"&&t);return[...new Set(e)]}function tp(a){let e=[...Array.isArray(a?.motion_sensors)?a.motion_sensors:[],...a?.motion?[a.motion]:[]].filter(t=>typeof t=="string"&&t);return[...new Set(e)]}function np(a,e){let t=ep(e),n=tp(e),i=!!e?.snapshots;return t.map(r=>{let o=n.filter(l=>$n(a,l,t,e?.[`melderbij:${l}`],r)),s={};for(let l of o){let d=e?.[`melder:${l}`];typeof d=="string"&&d.trim()&&(s[l]=d.trim())}return{camera:r,aan:i&&o.length>0,melders:o,namen:s,rustperiode:As(e?.snapshot_rustperiode,60),wachttijd:As(e?.snapshot_wachttijd,0),ontvangers:ip(e?.snapshot_ontvangers).filter(l=>l.startsWith("person.")),alleen_afwezig:!!e?.snapshot_alleen_afwezig}})}function ap(a,e){if(!e)return!0;for(let t of Object.keys(a))if(!Mi(a[t],e[t]))return!0;return!1}function Ms(a,e,t){return np(a,e).filter(n=>ap(n,t?.[n.camera]))}function Mi(a,e){return Array.isArray(a)&&Array.isArray(e)?a.length===e.length&&a.every((t,n)=>Mi(t,e[n])):a&&e&&typeof a=="object"&&typeof e=="object"?[...new Set([...Object.keys(a),...Object.keys(e)])].every(n=>Mi(a[n],e[n])):a===e}function ip(a){return Array.isArray(a)?a.filter(e=>typeof e=="string"):typeof a=="string"&&a?[a]:[]}function As(a,e){let t=Number(a);return Number.isFinite(t)&&t>=0?Math.round(t):e}function Sn(a){let e=Number(a);return Number.isFinite(e)?Math.max(1,Math.min(6,e)):1}function rp(a){let e=Sn(a);return Math.max(0,(1-1/e)/2)}function wt(a,e,t){let n=rp(t),i=o=>Number.isFinite(Number(o))?Number(o):0,r=o=>Math.max(-n,Math.min(n,i(o)))+0;return{x:r(a),y:r(e)}}function Nn(a,e,t={x:0,y:0}){let n=Sn(a?.zoom??1),i=Sn(n*(Number(e)||1));if(i===n)return{zoom:n,...wt(a?.x,a?.y,n)};let r=Number(t?.x)||0,o=Number(t?.y)||0,s=(a?.x??0)+r*(1/n-1/i),l=(a?.y??0)+o*(1/n-1/i);return{zoom:i,...wt(s,l,i)}}function Ss({zoom:a=1,x:e=0,y:t=0}={}){let n=Sn(a),i=wt(e,t,n);return`scale(${n}) translate(${(-i.x*100).toFixed(3)}%, ${(-i.y*100).toFixed(3)}%)`}var On=[{k:"up",icoon:"arrowUp",label:"Omhoog"},{k:"left",icoon:"chevronRight",label:"Links",draai:180},{k:"right",icoon:"chevronRight",label:"Rechts"},{k:"down",icoon:"arrowDown",label:"Omlaag"}];function Os(a){return!!(a.presets||Array.isArray(a.preset_buttons)&&a.preset_buttons.length||On.some(e=>a[`ptz_${e.k}`]))}var Tn=class extends M{validate(e){let t={name:"",...e};return!t.camera&&!(Array.isArray(t.cameras)&&t.cameras.length)&&(t[T]="Kies een camera. Presets, richtingsknoppen en een bewegingsmelder mogen daarna."),t.presets_aan===void 0&&(t.presets_aan=Os(t)),t}watched(){let e=this.config;return[...this.cameras_(),e.presets,...this.melders_().map(t=>t.entity),...Array.isArray(e.preset_buttons)?e.preset_buttons:[]].filter(Boolean)}melders_(){let e=this.config,t=[...Array.isArray(e.motion_sensors)?e.motion_sensors:[],...e.motion?[e.motion]:[]].filter(n=>typeof n=="string");return[...new Set(t)].map(n=>{let i=e[`melder:${n}`]||E(this.hass,n)||"Beweging";return{entity:n,naam:i,bijCamera:e[`melderbij:${n}`],soort:e[`meldersoort:${n}`]||Mn(n,i)}})}cameras_(){let e=this.config,t=[e.camera,...Array.isArray(e.cameras)?e.cameras:[]].filter(Boolean);return[...new Set(t)]}huidig_(){let e=this.cameras_();return e.includes(this.cam_)?this.cam_:e[0]}template(){return this.config.bare&&this.setAttribute("bare",""),this.stand_=this.stand_??{zoom:1,x:0,y:0},`
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
            ${On.map(t=>`<button type="button" data-r="${t.k}" aria-label="${t.label}"${t.draai?` style="transform: rotate(${t.draai}deg)"`:""}>${v(t.icoon)}</button>`).join("")}
          </div>
          <div class="presets" hidden></div>
        </div>
        <div class="cams" hidden></div>
        <div class="filters" hidden>
          <div class="rij dagrij">
            <button type="button" class="pijl" data-dag="-1" aria-label="Dag terug">
              ${v("chevronRight")}
            </button>
            <button type="button" class="datum">Alles</button>
            <input class="datumveld" type="date" aria-label="Kies een datum">
            <button type="button" class="pijl" data-dag="1" aria-label="Dag verder">
              ${v("chevronRight")}
            </button>
            <span class="rek"></span>
            <span class="totaal"></span>
          </div>
          <div class="rij soorten"></div>
          <div class="rij camkeuze" hidden></div>
        </div>
        <div class="tijdlijn" hidden></div>
      </div>
      <div class="groot" hidden><img alt=""><div class="onder"></div></div>`}wire(){this.teardown_.push(R(this.$(".card"))),this.on(this.$(".ptz"),"click",e=>{let t=e.target.closest?.("[data-r]");t&&(e.stopPropagation(),this.draai_(t.dataset.r))}),this.on(this.$(".presets"),"click",e=>{let t=e.target.closest?.("[data-p]");t&&(e.stopPropagation(),this.preset_(t.dataset.p,t.dataset.soort))}),this.on(this.$(".cams"),"click",e=>{let t=e.target.closest?.("[data-cam]");t&&(e.stopPropagation(),this.cam_=t.dataset.cam,this.stand_={zoom:1,x:0,y:0},this.paint())}),this.filterLuisteraars_(),this.zoomLuisteraars_(),this.bewaakStream_(),this.bewakingWire_()}filterLuisteraars_(){let e=this.$(".filters");this.on(e,"click",t=>{let n=t.target.closest?.(".pijl");if(n&&!n.disabled){t.stopPropagation(),this.zetDag_(zs(this.dag_??Date.now(),Number(n.dataset.dag)));return}if(t.target.closest?.(".datum")){if(t.stopPropagation(),this.dag_===null||this.dag_===void 0){this.zetDag_(Date.now());return}let o=this.$(".datumveld");o.value=$s(this.dag_);try{o.showPicker?.()}catch{o.focus()}return}let i=t.target.closest?.("[data-soort-filter]");if(i){t.stopPropagation(),this.wisselSoort_(i.dataset.soortFilter);return}let r=t.target.closest?.("[data-camfilter]");r&&(t.stopPropagation(),this.camFilter_=r.dataset.camfilter||null,this.paintFilters_(),this.paintTijdlijn_(!0))}),this.on(this.$(".datumveld"),"change",t=>{t.stopPropagation();let n=Es(t.target.value);n!==null&&this.zetDag_(n)})}zetDag_(e){let t=Ce(Date.now()).vanaf;this.dag_=Math.min(Ce(e).vanaf,t),this.paintFilters_(),this.paintTijdlijn_(!0)}wisselSoort_(e){this.soorten_=this.soorten_ instanceof Set?this.soorten_:new Set,this.soorten_.has(e)?this.soorten_.delete(e):this.soorten_.add(e),this.paintFilters_(),this.paintTijdlijn_(!0)}zichtbareBeelden_(){return ws(this.beelden_??[],{soorten:this.soorten_,camera:this.camFilter_,dag:this.dag_??null,config:this.config})}paintFilters_(){let e=this.$(".filters");if(!e||(e.hidden=!this.config.snapshots,e.hidden))return;let t=this.beelden_??[],n=this.zichtbareBeelden_();this.text(".datum",js(this.dag_??null)),this.$('.pijl[data-dag="1"]').disabled=this.dag_!==null&&this.dag_!==void 0&&this.dag_>=Ce(Date.now()).vanaf,this.text(".totaal",t.length?`${n.length} van ${t.length}`:""),this.paintSoorten_(t),this.paintCamFilter_()}paintSoorten_(e){let t=this.$(".soorten"),n=ys(e,this.config),i=(n[Le.sleutel]??0)>0||this.melders_().some(l=>l.soort===Le.sleutel),r=[...En,...i?[Le]:[]],o=this.soorten_ instanceof Set?this.soorten_:new Set,s=r.map(l=>`${l.sleutel}:${n[l.sleutel]??0}:${o.has(l.sleutel)}`).join(",");t.dataset.sig!==s&&(t.dataset.sig=s,t.innerHTML=r.map(l=>{let d=n[l.sleutel]??0;return`<button type="button" data-soort-filter="${l.sleutel}" aria-pressed="${o.has(l.sleutel)}" aria-label="${l.label}"${d?"":" data-leeg"}>${v(l.icoon)}<span>${d}</span></button>`}).join(""))}paintCamFilter_(){let e=this.$(".camkeuze"),t=this.cameras_();if(e.hidden=t.length<2,t.length<2)return;let n=t.map(r=>this.camNaam_(r)),i=`${t.join(",")}|${n.join(",")}|${this.camFilter_??""}`;e.dataset.sig!==i&&(e.dataset.sig=i,e.innerHTML=`<button type="button" data-camfilter="" aria-pressed="${!this.camFilter_}">Alle</button>`+t.map((r,o)=>`<button type="button" data-camfilter="${Re(r)}" aria-pressed="${this.camFilter_===r}">${Re(n[o])}</button>`).join(""))}zoomLuisteraars_(){let e=this.$(".vak"),t=new Map,n=null,i=null,r=0,o=l=>{let d=e.getBoundingClientRect();return{x:(l.clientX-d.left)/d.width-.5,y:(l.clientY-d.top)/d.height-.5}};this.on(e,"wheel",l=>{l.preventDefault(),this.zet_(Nn(this.stand_,l.deltaY<0?1.18:1/1.18,o(l)))},{passive:!1}),this.on(e,"pointerdown",l=>{if(t.set(l.pointerId,l),e.setPointerCapture?.(l.pointerId),r=0,t.size===2){let[d,c]=[...t.values()];i={afstand:Math.hypot(d.clientX-c.clientX,d.clientY-c.clientY),stand:{...this.stand_}},n=null}else this.stand_.zoom>1&&(n={x:l.clientX,y:l.clientY,stand:{...this.stand_}},this.setAttribute("sleept",""))}),this.on(e,"pointermove",l=>{if(t.has(l.pointerId)){if(t.set(l.pointerId,l),r=Math.max(r,Math.abs(l.movementX??0)+Math.abs(l.movementY??0)),i&&t.size===2){let[d,c]=[...t.values()],p=Math.hypot(d.clientX-c.clientX,d.clientY-c.clientY),h={x:(d.clientX+c.clientX)/2,y:(d.clientY+c.clientY)/2},g=e.getBoundingClientRect();this.zet_(Nn(i.stand,p/(i.afstand||1),{x:(h.x-g.left)/g.width-.5,y:(h.y-g.top)/g.height-.5}));return}if(n){let d=e.getBoundingClientRect(),c=(l.clientX-n.x)/d.width/this.stand_.zoom,p=(l.clientY-n.y)/d.height/this.stand_.zoom;this.zet_({zoom:this.stand_.zoom,...wt(n.stand.x-c,n.stand.y-p,this.stand_.zoom)})}}});let s=l=>{t.delete(l.pointerId),t.size<2&&(i=null),t.size||(n=null,this.removeAttribute("sleept"))};this.on(e,"pointerup",s),this.on(e,"pointercancel",s),this.on(e,"dblclick",l=>{l.target.closest(".presets, .ptz")||(l.preventDefault(),this.zet_(this.stand_.zoom>1?{zoom:1,x:0,y:0}:Nn({zoom:1,x:0,y:0},2.5,o(l))))}),this.on(e,"click",l=>{l.target.closest(".presets, .ptz")||r>6||this.config.tap_zoom!==!1&&V(this,this.huidig_())})}zet_(e){this.stand_=e,this.toggleAttribute("zoom",e.zoom>1),this.$(".schuif").style.setProperty("--tf",Ss(e))}draai_(e){let t=this.config[`ptz_${e}`];if(!t)return;let n=String(t).split(".")[0];this.hass.callService(n,n==="button"?"press":"turn_on",{entity_id:t})}preset_(e,t){if(t==="knop"){let r=String(e).split(".")[0];return this.hass.callService(r,r==="button"?"press":"turn_on",{entity_id:e})}let n=this.config.presets,i=String(n).split(".")[0];return this.hass.callService(i,"select_option",{entity_id:n,option:e})}paint(){let e=this.config,t=this.huidig_(),n=b(this.hass,t),i=!n||n.state==="unavailable";this.toggleAttribute("dead",!!i),this.text(".nm",e.name||E(this.hass,t,"Camera"));let r=(this.live_===!0||e.live_view===!0)&&!this.streamStuk_&&this.magLive_(),o=this.$(".schuif");if(i){if(!this.$(".vak .leeg")){let l=document.createElement("span");l.className="leeg",l.textContent="Deze camera is niet bereikbaar",this.$(".vak").appendChild(l)}}else this.$(".vak .leeg")?.remove(),_n(o,this.hass,t,{live:r});let s=this.$('.merk[data-soort="live"]');s.hidden=!r||i,this.paintMelders_(),this.zet_(this.stand_),this.paintPtz_(),this.paintPresets_(),this.paintCams_(t),this.paintFilters_(),this.paintTijdlijn_(),D(this.$(".card"))}bewaakStream_(){let t=setInterval(()=>{if(!this.isConnected)return;let i=this.$(".schuif")?.querySelector(".beeld");if(!i?.shadowRoot)return;if(this.zoekAlert_(i.shadowRoot,4)&&!this.streamStuk_){this.valTerug_();return}let r=this.zoekVideo_(i.shadowRoot,4);if(r&&!r.paused){let o=r.currentTime;this.laatsteTijd_===o?(this.stilTellen_=(this.stilTellen_??0)+1,this.stilTellen_>=5&&this.herstart_()):(this.stilTellen_=0,this.laatsteTijd_=o)}},2e3);this.teardown_.push(()=>{clearInterval(t),clearTimeout(this.streamHerkansing_)});let n=()=>{document.visibilityState==="visible"&&this.herstart_()};document.addEventListener("visibilitychange",n),this.teardown_.push(()=>document.removeEventListener("visibilitychange",n))}magLive_(){return this.liveVrij_?!0:(this.liveTimer_||(this.liveTimer_=setTimeout(()=>{this.liveVrij_=!0,this.isConnected&&this.paint()},1500),this.teardown_.push(()=>{clearTimeout(this.liveTimer_),this.liveTimer_=null,this.liveVrij_=!1})),!1)}valTerug_(){this.streamStuk_=!0,this.paint(),clearTimeout(this.streamHerkansing_),this.streamHerkansing_=setTimeout(()=>{this.streamStuk_=!1,this.paint()},3e4)}herstart_(){let e=this.$(".schuif")?.querySelector(".beeld");!e||e.localName!=="hui-image"||e.cameraView==="live"&&(this.stilTellen_=0,this.laatsteTijd_=null,e.cameraView="auto",clearTimeout(this.herstartTimer_),this.herstartTimer_=setTimeout(()=>{let t=this.$(".schuif")?.querySelector(".beeld");t&&t.localName==="hui-image"&&!this.streamStuk_&&(t.cameraView="live")},600),this.teardown_.push(()=>clearTimeout(this.herstartTimer_)))}zoekVideo_(e,t){if(!e||t<=0)return null;let n=e.querySelector?.("video");if(n)return n;for(let i of e.querySelectorAll?.("*")??[])if(i.shadowRoot){let r=this.zoekVideo_(i.shadowRoot,t-1);if(r)return r}return null}zoekAlert_(e,t){if(!e||t<=0)return null;let n=e.querySelector?.("ha-alert");if(n)return n;for(let i of e.querySelectorAll?.("*")??[])if(i.shadowRoot){let r=this.zoekAlert_(i.shadowRoot,t-1);if(r)return r}return null}paintMelders_(){let e=this.$(".melders"),t=this.huidig_(),n=this.cameras_(),i=this.melders_().filter(o=>te(b(this.hass,o.entity))&&$n(this.hass,o.entity,n,o.bijCamera,t)),r=t+"::"+i.map(o=>`${o.entity}|${o.naam}|${o.soort}`).join(",");e.dataset.sig!==r&&(e.dataset.sig=r,e.innerHTML=i.map(o=>`<span class="merk" data-soort="beweging">${v(xs(o.soort).icoon)}<span>${this.veilig_(o.naam)}</span></span>`).join(""))}paintPtz_(){let e=this.config,t=this.$(".ptz"),n=e.presets_aan!==!1&&On.some(i=>e[`ptz_${i.k}`]);if(t.hidden=!n,!!n)for(let i of On){let r=t.querySelector(`[data-r="${i.k}"]`);r&&(r.hidden=!e[`ptz_${i.k}`])}}paintPresets_(){let e=this.config,t=this.$(".presets"),n=[],i=e.presets_aan===!1?null:b(this.hass,e.presets),r=i?.attributes?.options;if(Array.isArray(r))for(let l of r)n.push({waarde:l,naam:l,soort:"keuze",aan:i.state===l});let o=e.presets_aan!==!1&&Array.isArray(e.preset_buttons)?e.preset_buttons:[];for(let l of o)b(this.hass,l)&&n.push({waarde:l,naam:E(this.hass,l,l),soort:"knop",aan:!1});if(t.hidden=!n.length,!n.length)return;let s=n.map(l=>`${l.waarde}|${l.aan}`).join(",");t.dataset.sig!==s&&(t.dataset.sig=s,t.innerHTML=n.map(l=>`<button type="button" data-p="${this.veilig_(l.waarde)}" data-soort="${l.soort}" aria-pressed="${l.aan}">${this.veilig_(l.naam)}</button>`).join(""))}camNaam_(e){let t=this.config;return e===t.camera&&t.name?t.name:t[`cam:${e}`]||E(this.hass,e)||e}paintCams_(e){let t=this.cameras_(),n=this.$(".cams");if(n.hidden=t.length<2,t.length<2)return;let i=t.map(o=>this.camNaam_(o)),r=`${t.join(",")}|${i.join(",")}|${e}`;n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=t.map((o,s)=>`<button type="button" data-cam="${this.veilig_(o)}" aria-pressed="${o===e}">${this.veilig_(i[s])}</button>`).join(""))}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}getCardSize(){return 5}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",3)}}bewakingWire_(){let e=this.$(".tijdlijn");if(!e)return;if(!this.config.snapshots){e.hidden=!0,this.beelden_=[];return}this.on(e,"click",i=>{let r=i.target.closest?.("[data-beeld]");r&&(i.stopPropagation(),this.toonGroot_(r.dataset.beeld))});let t=this.$(".groot");this.on(t,"click",i=>{i.stopPropagation(),t.hidden=!0}),this.hass?.connection?.sendMessagePromise&&(this.bewakingHaal_(),this.bewakingLuister_(),clearTimeout(this.regelTimer_),this.regelTimer_=setTimeout(()=>this.bewakingRegels_(),1500),this.teardown_.push(()=>clearTimeout(this.regelTimer_)))}inDialoog_(){let e=this;for(let t=0;t<40;t++){let n=e.getRootNode?.()?.host;if(!n)return!1;let i=n.localName??"";if(i.startsWith("hui-dialog")||i==="hui-card-preview")return!0;e=n}return!1}bewakingCameras_(){return this.cameras_()}async bewakingHaal_(){try{let e=await this.hass.connection.sendMessagePromise({type:"domotiapp_lovelace/bewaking/timeline",cameras:this.bewakingCameras_()});this.beelden_=e?.beelden??[]}catch{this.beelden_=[]}this.paintFilters_(),this.paintTijdlijn_(!0)}async bewakingLuister_(){try{let e=await this.hass.connection.subscribeMessage(t=>this.bewakingBericht_(t),{type:"domotiapp_lovelace/bewaking/subscribe",cameras:this.bewakingCameras_()});this.isConnected?this.teardown_.push(e):e()}catch{}}bewakingBericht_(e){let t=this.beelden_??[];if(e?.soort==="nieuw"&&e.beeld)this.beelden_=[e.beeld,...t];else if(e?.soort==="opgeruimd"&&Array.isArray(e.ids)){let n=new Set(e.ids);this.beelden_=t.filter(i=>!n.has(i.id))}else return;this.paintFilters_(),this.paintTijdlijn_(!0)}async bewakingRegels_(){if(this.inDialoog_())return;let e=this.hass?.connection;if(!e?.sendMessagePromise)return;let t={};try{t=(await e.sendMessagePromise({type:"domotiapp_lovelace/bewaking/get"}))?.regels??{}}catch{return}for(let n of Ms(this.hass,this.config,t))try{await e.sendMessagePromise({type:"domotiapp_lovelace/bewaking/save",regel:n})}catch(i){console.warn("DomotiApp: bewakingsregel geweigerd",n.camera,i)}}paintTijdlijn_(e=!1){let t=this.$(".tijdlijn");if(!t)return;if(!this.config.snapshots){t.hidden=!0;return}t.hidden=!1,e&&(this.tijdlijnTeken_=null);let n=this.zichtbareBeelden_(),i=this.cameras_().length>1,r=`${i}|${this.cameras_().map(o=>this.camNaam_(o)).join("|")}|${n.map(o=>o.id).join(",")}`;if(this.tijdlijnTeken_!==r){if(this.tijdlijnTeken_=r,!n.length){let o=(this.beelden_??[]).length>0;t.innerHTML=`<span class="leeg">${o?"Niets binnen dit filter.":"Nog geen beelden."}</span>`;return}t.innerHTML=n.map(o=>{let s=Re(this.camNaam_(o.camera)),l=Re(o.naam??""),d=Re(Ns(this.hass,o.tijd)),c=i?`<span class="cam">${s}</span>`:"";return`<button type="button" class="mini" data-beeld="${Re(o.id)}" aria-label="${i?s+", ":""}${l} om ${d}"><img src="${Re(o.url)}" alt="" loading="lazy"><span class="bij">${c}<span><b>${l}</b> \xB7 ${d}</span></span></button>`}).join("")}}toonGroot_(e){let t=(this.beelden_??[]).find(i=>i.id===e);if(!t)return;let n=this.$(".groot");n.querySelector("img").src=t.url,n.querySelector(".onder").textContent=`${this.camNaam_(t.camera)} \xB7 ${t.naam??""} \xB7 ${Ns(this.hass,t.tijd,!0)}`,n.hidden=!1}static getConfigElement(){return document.createElement("domotiapp-camera-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("camera."));return n?{camera:n}:{}}};y(Tn,"css",`
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }

    .card {
      padding: 0; overflow: hidden;
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
      touch-action: none; cursor: default;
      display: flex;
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
    .filters .datum {
      flex: 0 0 auto; padding: 6px 12px; cursor: pointer; font: inherit;
      font-size: 12px; font-weight: 600; color: var(--dac-ink);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
    }
    /* Het echte datumveld ligt eronder en is onzichtbaar: de knop opent zijn
       kiezer. Op display:none zetten mag niet -- dan weigert Chrome
       showPicker(). */
    .filters .datumveld {
      position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none;
    }
    .filters .rek { flex: 1 1 auto; }
    .filters .totaal { flex: 0 0 auto; font-size: 11.5px; color: var(--dac-ink-3); }

    /* De vijf filterknoppen. Hij vroeg om vijf iconen; ze staan er alle vijf,
       ook als er van die soort niets is -- dan gedempt, zodat de rij niet van
       vorm verandert zodra er een kraai voorbijkomt. */
    .filters .soorten { display: flex; gap: 6px; flex-wrap: wrap; }
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

    /* Groot bekijken. E\xE9n laag over de kaart heen, tikken sluit hem.
       Bewust geen dialoog van Home Assistant: die verwacht een eigen element en
       een eigen levensduur, en dit is \xE9\xE9n plaatje. */
    .groot {
      position: fixed; inset: 0; z-index: 9; display: grid; place-items: center;
      background: rgba(0,0,0,.86); padding: 16px; cursor: zoom-out;
    }
    .groot[hidden] { display: none; }
    .groot img { max-width: 100%; max-height: 84vh; border-radius: var(--dac-radius-sm); }
    .groot .onder {
      position: absolute; left: 0; right: 0; bottom: 14px;
      text-align: center; color: #fff; font-size: 12.5px;
      text-shadow: 0 1px 3px rgba(0,0,0,.8);
    }

    :host([dead]) .card { opacity: .5; }
  `);function Ns(a,e,t=!1){if(!e)return"";let n=new Date(e);if(Number.isNaN(n.getTime()))return"";let i=a?.locale?.language??"nl",r=n.toLocaleTimeString(i,{hour:"2-digit",minute:"2-digit"}),o=new Date;return n.getDate()===o.getDate()&&n.getMonth()===o.getMonth()&&n.getFullYear()===o.getFullYear()&&!t?r:`${n.toLocaleDateString(i,{weekday:"short",day:"numeric",month:"short"})} ${r}`}function Re(a){return String(a??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}var Si=class extends C{pickers(){return[]}setConfig(e){let t=e??{},n=[...Array.isArray(t.motion_sensors)?t.motion_sensors:[],...t.motion?[t.motion]:[]].filter(r=>typeof r=="string"),i={presets_aan:Os(t)};for(let r of n){let o=t[`melder:${r}`]||this.hass_?.states?.[r]?.attributes?.friendly_name;i[`meldersoort:${r}`]=Mn(r,o)}super.setConfig({...i,...t})}schema(){let e=this.config_??{},t=s=>Array.isArray(s)?s.filter(l=>typeof l=="string"):[],n=t(e.cameras).map(s=>({name:`cam:${s}`,selector:f.text()})),i=[e.camera,...t(e.cameras)].filter(Boolean),r=t(e.motion_sensors).flatMap(s=>{let l=[{name:`melder:${s}`,selector:f.text()},{name:`meldersoort:${s}`,selector:f.select(An.map(d=>({value:d.sleutel,label:d.label})))}];return i.length>1&&l.push({name:`melderbij:${s}`,selector:f.select([{value:"",label:"Bij alle camera's"},...i.map(d=>({value:d,label:this.hass?.states?.[d]?.attributes?.friendly_name??d}))])}),l}),o=e.snapshots?[{name:"snapshot_rustperiode",selector:f.number(0,3600)},{name:"snapshot_wachttijd",selector:f.number(0,60)},{name:"snapshot_ontvangers",selector:{entity:{domain:"person",multiple:!0}}},{name:"snapshot_alleen_afwezig",selector:f.bool()}]:[];return[{name:"camera",selector:f.entity("camera")},{name:"name",selector:f.text()},{name:"live_view",selector:f.bool()},{name:"cameras",selector:{entity:{domain:"camera",multiple:!0}}},...n,{name:"presets_aan",selector:f.bool()},...e.presets_aan?[oa("Presets en draaien","mdi:arrow-all",[{name:"presets",selector:f.entity(["select","input_select"])},{name:"preset_buttons",selector:{entity:{domain:["button","scene","script"],multiple:!0}}},{name:"ptz_up",selector:f.entity(["button","switch"])},{name:"ptz_down",selector:f.entity(["button","switch"])},{name:"ptz_left",selector:f.entity(["button","switch"])},{name:"ptz_right",selector:f.entity(["button","switch"])}])]:[],{name:"motion_sensors",selector:{entity:{domain:["binary_sensor","event","lock"],multiple:!0}}},...r,{name:"snapshots",selector:f.bool()},...o.length?[oa("Snapshots en meldingen","mdi:camera-burst",o)]:[]]}label(e){return e.name.startsWith("cam:")?`Naam voor ${E(this.hass,e.name.slice(4))||e.name.slice(4)}`:e.name.startsWith("melder:")?`Naam voor ${E(this.hass,e.name.slice(7))||e.name.slice(7)}`:e.name.startsWith("melderbij:")?"\u21B3 hoort bij welke camera":e.name.startsWith("meldersoort:")?"\u21B3 wat ziet hij":{camera:"Camera",name:"Naam",live_view:"Altijd live",presets:"Presets (keuzelijst)",preset_buttons:"Presets als losse knoppen",motion:"Bewegingsmelder",motion_sensors:"Bewegingsmelders",ptz_up:"Draaien: omhoog",ptz_down:"Draaien: omlaag",ptz_left:"Draaien: links",ptz_right:"Draaien: rechts",cameras:"Nog meer camera's op deze kaart",snapshots:"Snapshots en timeline",snapshot_rustperiode:"Rustperiode per melder (seconden)",snapshot_wachttijd:"Wachten voor het beeld (seconden)",snapshot_ontvangers:"Wie krijgt een melding",snapshot_alleen_afwezig:"Alleen melden als er niemand thuis is",presets_aan:"Presets en draaien"}[e.name]??super.label(e)}helper(e){return e.name.startsWith("meldersoort:")?"Bepaalt onder welke filterknop zijn beelden in de timeline vallen, en welk icoon er op het beeld staat als hij afgaat. Hij wordt geraden uit de naam \u2014 een Reolink klopt vanzelf.":e.name.startsWith("melderbij:")?"Laat dit op 'alle camera's' staan als je het niet weet. De kaart koppelt een melder vanzelf aan de camera waar hij op hetzelfde apparaat zit \u2014 bij een Reolink hoeft je dus niets in te vullen.":{camera:"Op de kaart staat een beeld dat zichzelf ververst. Inzoomen doe je met twee vingers, met het scrollwiel of met een dubbeltik; een gewone tik opent hem groot. Er staan geen knoppen op het beeld.",name:"De naam van de camera zelf. Hij staat linksboven op het beeld, en ook in de rij eronder als je meer camera's op deze kaart hebt staan.",live_view:"De stream staat dan altijd open. Mooier, maar op een dashboard met zes camera's zijn dat zes streams die de hele dag doorlopen.",presets:"De `select` van je camera-integratie \u2014 Reolink en ONVIF leveren die. De kaart maakt van elke optie een knop, onderin het beeld, dus een preset die je in de camera-app toevoegt verschijnt er vanzelf bij.",preset_buttons:"Voor integraties die geen keuzelijst maar losse knoppen leveren, zoals Amcrest en Dahua. Ze mogen naast de keuzelijst staan.",motion:"Het oude enkele veld. Gebruik liever Bewegingsmelders hierboven; deze blijft werken voor kaarten die hem al hebben.",motion_sensors:"Zolang er een aanstaat komt er een merkje op het beeld. Kies er gerust meerdere: een Reolink meldt persoon, voertuig en huisdier los van elkaar, en dan zie je w\xE9lke het is. Een deurbel (`event`) en een slot (`lock`) mogen er ook bij. Per melder kun je hieronder een naam en een soort invullen \u2014 die soort bepaalt onder welke filterknop hij in de timeline valt.",ptz_up:"De vier richtingsknoppen van je integratie. Vul je er geen in, dan komt het draaikruis er niet.",cameras:"Onder het beeld komt dan een rij met namen om tussen te wisselen; de camera waar je naar kijkt licht op. Handig voor de camera's die bij elkaar horen \u2014 voordeur, oprit, achtertuin. Per camera kun je hieronder een eigen naam invullen.",snapshots:"Bij elke detectie legt Home Assistant een beeld vast en zet dat onder de kaart in een strook, met filters erboven op dag, soort en camera \u2014 ook als er nergens een scherm aanstaat. Beelden blijven een week staan; daarboven wijkt vanzelf de oudste. Staat dit uit, dan wordt er niets vastgelegd en niets bewaard.",snapshot_rustperiode:"Hoe lang dezelfde melder daarna met rust wordt gelaten. Dit is het antwoord op tien meldingen achter elkaar. De klok loopt PER MELDER: meldt je camera persoon, voertuig en huisdier apart, dan houden die elkaar niet tegen \u2014 een auto die de oprit op rijdt en de bestuurder die uitstapt leveren allebei een beeld op. Nul betekent: alles vastleggen.",snapshot_wachttijd:"Wacht zoveel seconden na de detectie voordat het beeld genomen wordt. Op nul krijg je het moment zelf; op een of twee seconden staat degene meestal beter in beeld dan met zijn rug ernaartoe. Deze wachttijd verandert niets aan de rustperiode.",snapshot_ontvangers:"De personen die een melding op hun telefoon krijgen, met het beeld erbij. De kaart zoekt zelf de mobiele app van die persoon op. Buitenshuis heeft de telefoon een extern adres nodig (Nabu Casa of een eigen domein) om de foto te laden; zonder dat komt de melding w\xE9l aan, maar zonder plaatje.",snapshot_alleen_afwezig:"Dan blijft de telefoon stil zolang er iemand thuis is. Het beeld komt nog steeds in de timeline te staan \u2014 alleen de melding blijft achterwege. Dit scheelt in de praktijk meer meldingen dan de rustperiode.",presets_aan:"E\xE9n vinkje voor de hele bediening: de presetknoppen in het beeld en het draaikruis linksonder. Zet je het uit, dan blijft alles wat je gekozen hebt gewoon staan \u2014 het is alleen weg van het beeld."}[e.name]}};H("domotiapp-camera-card-editor",Si);N("domotiapp-camera-card",Tn,{name:"DomotiApp Camera",description:"Live beeld met inzoomen en schuiven, de presets van je camera als knoppen, een draaikruis en een merkje zodra er beweging is."});var Dn=globalThis,Cn=Dn.ShadowRoot&&(Dn.ShadyCSS===void 0||Dn.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ni=Symbol(),Ts=new WeakMap,yt=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==Ni)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(Cn&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=Ts.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&Ts.set(t,e))}return e}toString(){return this.cssText}},be=a=>new yt(typeof a=="string"?a:a+"",void 0,Ni),ne=(a,...e)=>{let t=a.length===1?a[0]:e.reduce((n,i,r)=>n+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+a[r+1],a[0]);return new yt(t,a,Ni)},Ds=(a,e)=>{if(Cn)a.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let n=document.createElement("style"),i=Dn.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=t.cssText,a.appendChild(n)}},Oi=Cn?a=>a:a=>a instanceof CSSStyleSheet?(e=>{let t="";for(let n of e.cssRules)t+=n.cssText;return be(t)})(a):a;var{is:op,defineProperty:sp,getOwnPropertyDescriptor:lp,getOwnPropertyNames:dp,getOwnPropertySymbols:cp,getPrototypeOf:pp}=Object,Ln=globalThis,Cs=Ln.trustedTypes,hp=Cs?Cs.emptyScript:"",up=Ln.reactiveElementPolyfillSupport,zt=(a,e)=>a,Ti={toAttribute(a,e){switch(e){case Boolean:a=a?hp:null;break;case Object:case Array:a=a==null?a:JSON.stringify(a)}return a},fromAttribute(a,e){let t=a;switch(e){case Boolean:t=a!==null;break;case Number:t=a===null?null:Number(a);break;case Object:case Array:try{t=JSON.parse(a)}catch{t=null}}return t}},Hs=(a,e)=>!op(a,e),Ls={attribute:!0,type:String,converter:Ti,reflect:!1,useDefault:!1,hasChanged:Hs};Symbol.metadata??=Symbol("metadata"),Ln.litPropertyMetadata??=new WeakMap;var ve=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Ls){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),i=this.getPropertyDescriptor(e,n,t);i!==void 0&&sp(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){let{get:i,set:r}=lp(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:i,set(o){let s=i?.call(this);r?.call(this,o),this.requestUpdate(e,s,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ls}static _$Ei(){if(this.hasOwnProperty(zt("elementProperties")))return;let e=pp(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(zt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(zt("properties"))){let t=this.properties,n=[...dp(t),...cp(t)];for(let i of n)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[n,i]of t)this.elementProperties.set(n,i)}this._$Eh=new Map;for(let[t,n]of this.elementProperties){let i=this._$Eu(t,n);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let i of n)t.unshift(Oi(i))}else e!==void 0&&t.push(Oi(e));return t}static _$Eu(e,t){let n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ds(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:Ti).toAttribute(t,n.type);this._$Em=e,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){let n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let r=n.getPropertyOptions(i),o=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Ti;this._$Em=i;let s=o.fromAttribute(t,r.type);this[i]=s??this._$Ej?.get(i)??s,this._$Em=null}}requestUpdate(e,t,n,i=!1,r){if(e!==void 0){let o=this.constructor;if(i===!1&&(r=this[e]),n??=o.getPropertyOptions(e),!((n.hasChanged??Hs)(r,t)||n.useDefault&&n.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:r},o){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),r!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[i,r]of n){let{wrapped:o}=r,s=this[i];o!==!0||this._$AL.has(i)||s===void 0||this.C(i,void 0,r,s)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};ve.elementStyles=[],ve.shadowRootOptions={mode:"open"},ve[zt("elementProperties")]=new Map,ve[zt("finalized")]=new Map,up?.({ReactiveElement:ve}),(Ln.reactiveElementVersions??=[]).push("2.1.2");var Vi=globalThis,Rs=a=>a,Hn=Vi.trustedTypes,Is=Hn?Hn.createPolicy("lit-html",{createHTML:a=>a}):void 0,Us="$lit$",Me=`lit$${Math.random().toFixed(9).slice(2)}$`,Ws="?"+Me,mp=`<${Ws}>`,Pe=document,$t=()=>Pe.createComment(""),Et=a=>a===null||typeof a!="object"&&typeof a!="function",Pi=Array.isArray,gp=a=>Pi(a)||typeof a?.[Symbol.iterator]=="function",Di=`[ 	
\f\r]`,jt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Vs=/-->/g,Ps=/>/g,Ie=RegExp(`>|${Di}(?:([^\\s"'>=/]+)(${Di}*=${Di}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Bs=/'/g,Ks=/"/g,qs=/^(?:script|style|textarea|title)$/i,Bi=a=>(e,...t)=>({_$litType$:a,strings:e,values:t}),w=Bi(1),tb=Bi(2),nb=Bi(3),Be=Symbol.for("lit-noChange"),j=Symbol.for("lit-nothing"),Gs=new WeakMap,Ve=Pe.createTreeWalker(Pe,129);function Fs(a,e){if(!Pi(a)||!a.hasOwnProperty("raw"))throw Error("invalid template strings array");return Is!==void 0?Is.createHTML(e):e}var fp=(a,e)=>{let t=a.length-1,n=[],i,r=e===2?"<svg>":e===3?"<math>":"",o=jt;for(let s=0;s<t;s++){let l=a[s],d,c,p=-1,h=0;for(;h<l.length&&(o.lastIndex=h,c=o.exec(l),c!==null);)h=o.lastIndex,o===jt?c[1]==="!--"?o=Vs:c[1]!==void 0?o=Ps:c[2]!==void 0?(qs.test(c[2])&&(i=RegExp("</"+c[2],"g")),o=Ie):c[3]!==void 0&&(o=Ie):o===Ie?c[0]===">"?(o=i??jt,p=-1):c[1]===void 0?p=-2:(p=o.lastIndex-c[2].length,d=c[1],o=c[3]===void 0?Ie:c[3]==='"'?Ks:Bs):o===Ks||o===Bs?o=Ie:o===Vs||o===Ps?o=jt:(o=Ie,i=void 0);let g=o===Ie&&a[s+1].startsWith("/>")?" ":"";r+=o===jt?l+mp:p>=0?(n.push(d),l.slice(0,p)+Us+l.slice(p)+Me+g):l+Me+(p===-2?s:g)}return[Fs(a,r+(a[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},At=class a{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let r=0,o=0,s=e.length-1,l=this.parts,[d,c]=fp(e,t);if(this.el=a.createElement(d,n),Ve.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(i=Ve.nextNode())!==null&&l.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let p of i.getAttributeNames())if(p.endsWith(Us)){let h=c[o++],g=i.getAttribute(p).split(Me),m=/([.?@])?(.*)/.exec(h);l.push({type:1,index:r,name:m[2],strings:g,ctor:m[1]==="."?Li:m[1]==="?"?Hi:m[1]==="@"?Ri:et}),i.removeAttribute(p)}else p.startsWith(Me)&&(l.push({type:6,index:r}),i.removeAttribute(p));if(qs.test(i.tagName)){let p=i.textContent.split(Me),h=p.length-1;if(h>0){i.textContent=Hn?Hn.emptyScript:"";for(let g=0;g<h;g++)i.append(p[g],$t()),Ve.nextNode(),l.push({type:2,index:++r});i.append(p[h],$t())}}}else if(i.nodeType===8)if(i.data===Ws)l.push({type:2,index:r});else{let p=-1;for(;(p=i.data.indexOf(Me,p+1))!==-1;)l.push({type:7,index:r}),p+=Me.length-1}r++}}static createElement(e,t){let n=Pe.createElement("template");return n.innerHTML=e,n}};function Je(a,e,t=a,n){if(e===Be)return e;let i=n!==void 0?t._$Co?.[n]:t._$Cl,r=Et(e)?void 0:e._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(a),i._$AT(a,t,n)),n!==void 0?(t._$Co??=[])[n]=i:t._$Cl=i),i!==void 0&&(e=Je(a,i._$AS(a,e.values),i,n)),e}var Ci=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??Pe).importNode(t,!0);Ve.currentNode=i;let r=Ve.nextNode(),o=0,s=0,l=n[0];for(;l!==void 0;){if(o===l.index){let d;l.type===2?d=new Mt(r,r.nextSibling,this,e):l.type===1?d=new l.ctor(r,l.name,l.strings,this,e):l.type===6&&(d=new Ii(r,this,e)),this._$AV.push(d),l=n[++s]}o!==l?.index&&(r=Ve.nextNode(),o++)}return Ve.currentNode=Pe,i}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}},Mt=class a{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=j,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Je(this,e,t),Et(e)?e===j||e==null||e===""?(this._$AH!==j&&this._$AR(),this._$AH=j):e!==this._$AH&&e!==Be&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):gp(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==j&&Et(this._$AH)?this._$AA.nextSibling.data=e:this.T(Pe.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=At.createElement(Fs(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{let r=new Ci(i,this),o=r.u(this.options);r.p(t),this.T(o),this._$AH=r}}_$AC(e){let t=Gs.get(e.strings);return t===void 0&&Gs.set(e.strings,t=new At(e)),t}k(e){Pi(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,n,i=0;for(let r of e)i===t.length?t.push(n=new a(this.O($t()),this.O($t()),this,this.options)):n=t[i],n._$AI(r),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let n=Rs(e).nextSibling;Rs(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},et=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,r){this.type=1,this._$AH=j,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=j}_$AI(e,t=this,n,i){let r=this.strings,o=!1;if(r===void 0)e=Je(this,e,t,0),o=!Et(e)||e!==this._$AH&&e!==Be,o&&(this._$AH=e);else{let s=e,l,d;for(e=r[0],l=0;l<r.length-1;l++)d=Je(this,s[n+l],t,l),d===Be&&(d=this._$AH[l]),o||=!Et(d)||d!==this._$AH[l],d===j?e=j:e!==j&&(e+=(d??"")+r[l+1]),this._$AH[l]=d}o&&!i&&this.j(e)}j(e){e===j?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},Li=class extends et{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===j?void 0:e}},Hi=class extends et{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==j)}},Ri=class extends et{constructor(e,t,n,i,r){super(e,t,n,i,r),this.type=5}_$AI(e,t=this){if((e=Je(this,e,t,0)??j)===Be)return;let n=this._$AH,i=e===j&&n!==j||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==j&&(n===j||i);i&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},Ii=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){Je(this,e)}};var bp=Vi.litHtmlPolyfillSupport;bp?.(At,Mt),(Vi.litHtmlVersions??=[]).push("3.3.3");var Zs=(a,e,t)=>{let n=t?.renderBefore??e,i=n._$litPart$;if(i===void 0){let r=t?.renderBefore??null;n._$litPart$=i=new Mt(e.insertBefore($t(),r),r,void 0,t??{})}return i._$AI(a),i};var Ki=globalThis,Q=class extends ve{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Zs(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Be}};Q._$litElement$=!0,Q.finalized=!0,Ki.litElementHydrateSupport?.({LitElement:Q});var vp=Ki.litElementPolyfillSupport;vp?.({LitElement:Q});(Ki.litElementVersions??=[]).push("4.2.2");var oe=ne`
  :host {
    ${be(G)}
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  ${be(xe)}
`;var kp=["unavailable","unknown"],xp=["color_temp_kelvin","rgb_color","hs_color","xy_color"];function Rn({scene:a,memberEntityIds:e,states:t}){let n=[],i=[],r=a?.lights??{},o=Array.isArray(e)?e:[],s=t??{};for(let l of o){let d=r[l];if(!d||typeof d!="object")continue;let c=s[l];if(!c||kp.includes(c.state)){i.push(l);continue}if(d.state==="off"){n.push({service:"turn_off",data:{entity_id:l,transition:1}});continue}let p={entity_id:l,transition:1};typeof d.brightness=="number"&&(p.brightness=d.brightness);for(let h of xp)if(d[h]!==void 0){p[h]=d[h];break}n.push({service:"turn_on",data:p})}return{oproepen:n,overgeslagen:i}}async function In(a,e){let t=await Promise.allSettled(e.map(i=>a(i.service,i.data))),n=[];return t.forEach((i,r)=>{i.status==="rejected"&&n.push({entityId:e[r].data.entity_id,fout:i.reason})}),n}var Ui=["hs","rgb","rgbw","rgbww","xy"],Wi="color_temp",_p="onoff";var Ke="kleur";var wp=["unavailable","unknown"],Ys=["color_temp_kelvin","rgb_color","hs_color","xy_color"],yp=[0,100];function pe(a){if(!a)return{bekend:!1,beschikbaar:!1,helderheid:!1,kleurtemp:!1,kleur:!1,minKelvin:2e3,maxKelvin:6535,kelvinUitDefaults:!1};let e=a.attributes??{},t=Array.isArray(e.supported_color_modes)?e.supported_color_modes:null,n=t!==null&&t.length===1&&t[0]===_p,i=t!==null&&t.includes(Wi),r=t!==null&&t.some(d=>Ui.includes(d)),o=e.min_color_temp_kelvin,s=e.max_color_temp_kelvin,l=typeof o=="number"&&typeof s=="number"&&o<s;return{bekend:!0,beschikbaar:!wp.includes(a.state),helderheid:!n,kleurtemp:i,kleur:r,minKelvin:l?Math.round(o):2e3,maxKelvin:l?Math.round(s):6535,kelvinUitDefaults:i&&!l}}function zp(){return{state:"off"}}function Qs(a,e){let t=e??pe(a);return t.bekend&&t.beschikbaar&&a.state==="on"?{state:"on",...Sp(a,t)}:t.helderheid?{state:"on",brightness:255}:{state:"on"}}function Js(a,e,t,n){return e?a&&a.state==="on"?{...a}:Qs(t,n):{state:"off"}}function el(a,e,t,n){let i=n??pe(t),r=Qi(a,t,i);return i.helderheid&&(r.brightness=P(e,1,255)),r}function qi(a,e,t,n){let i=n??pe(t),r=Qi(a,t,i);return cl(r),r.color_temp_kelvin=P(e,i.minKelvin,i.maxKelvin),r}function Fi(a,e,t,n){let i=n??pe(t),r=Qi(a,t,i);return cl(r),r.hs_color=[P(e?.[0],0,360),P(e?.[1],0,100)],r}function Vn(a,e,t){return a??zp()}function tl(a,e,t){let n=Vn(a,e,t);if(typeof n.brightness=="number")return P(n.brightness,1,255);let i=e?.attributes?.brightness;return typeof i=="number"?P(i,1,255):255}function Zi(a,e,t){let n=t??pe(e),i=Vn(a,e,n);if(typeof i.color_temp_kelvin=="number")return P(i.color_temp_kelvin,n.minKelvin,n.maxKelvin);let r=e?.attributes?.color_temp_kelvin;return typeof r=="number"?P(r,n.minKelvin,n.maxKelvin):Math.round((n.minKelvin+n.maxKelvin)/2)}function Pn(a,e,t){let n=Vn(a,e,t);if(Gi(n.hs_color))return[P(n.hs_color[0],0,360),P(n.hs_color[1],0,100)];let i=e?.attributes?.hs_color;return Gi(i)?[P(i[0],0,360),P(i[1],0,100)]:[...yp]}function Xi(a){return a!=null&&typeof a=="object"}function nl(a,e,t){let n=Array.isArray(e)?e:[],i=Array.isArray(a)?a:[],r=Number.isInteger(t)?t:i.length;return n.filter(o=>{for(let s=0;s<r;s+=1)if(!Xi(i[s]?.lights?.[o]))return!0;return!1})}function al(a){return!Number.isInteger(a)||a<=0?null:a===1?"1 lamp nog niet ingesteld":`${a} lampen nog niet ingesteld`}function Yi(a,e,t){return Vn(a,e,t).state==="on"}function il(a,e,t){let n=t??pe(e);if(!n.bekend)return{aanuit:!1,helderheid:!1,kleurtemp:!1,kleur:!1,kleurkeuze:!1,stand:null};let i=Yi(a,e,n),r=rl(n),o=r?jp(a,e,n):null;return{aanuit:!0,helderheid:i&&n.helderheid,kleurtemp:i&&n.kleurtemp&&(!r||o==="wit"),kleur:i&&n.kleur&&(!r||o===Ke),kleurkeuze:i&&r,stand:i?o:null}}function rl(a){return!!(a?.kleurtemp&&a?.kleur)}function jp(a,e,t){let n=t??pe(e);if(a&&typeof a=="object"){if(typeof a.color_temp_kelvin=="number")return"wit";if(Ys.slice(1).some(r=>a[r]!==void 0))return Ke}let i=e?.attributes?.color_mode;return i===Wi&&n.kleurtemp?"wit":Ui.includes(i)&&n.kleur?Ke:"wit"}function ol(a,e,t,n){let i=n??pe(t);return rl(i)?e==="wit"?qi(a,Zi(a,t,i),t,i):Fi(a,Pn(a,t,i),t,i):a}function sl(a){let e=P(a,0,255);return e<=0?0:Math.max(1,Math.round(e/255*100))}function ll(a){let e=P(a,1,100);return P(Math.round(e/100*255),1,255)}var $p=1e3,Ep=4e4,Xs=7;function Ap(a){let e=P(a,$p,Ep)/100,t=e<=66?255:329.698727446*(e-60)**-.1332047592,n=e<=66?99.4708025861*Math.log(e)-161.1195681661:288.1221695283*(e-60)**-.0755148492,i;return e>=66?i=255:e<=19?i=0:i=138.5177312231*Math.log(e-10)-305.0447927307,[P(t,0,255),P(n,0,255),P(i,0,255)]}function Mp(a){let[e,t,n]=Ap(a);return`rgb(${e}, ${t}, ${n})`}function dl(a,e){let t=Math.min(a,e),n=Math.max(a,e);return`linear-gradient(to right, ${Array.from({length:Xs},(r,o)=>{let s=o/(Xs-1),l=t+(n-t)*s;return`${Mp(l)} ${Math.round(s*100)}%`}).join(", ")})`}function Sp(a,e){let t=a.attributes??{},n={};e.helderheid&&(n.brightness=typeof t.brightness=="number"?P(t.brightness,1,255):255);let i=t.color_mode;return e.kleurtemp&&i===Wi&&typeof t.color_temp_kelvin=="number"?n.color_temp_kelvin=P(t.color_temp_kelvin,e.minKelvin,e.maxKelvin):e.kleur&&Ui.includes(i)&&Gi(t.hs_color)&&(n.hs_color=[P(t.hs_color[0],0,360),P(t.hs_color[1],0,100)]),n}function Qi(a,e,t){return a&&a.state==="on"?{...a}:Qs(e,t)}function cl(a){for(let e of Ys)delete a[e]}function Gi(a){return Array.isArray(a)&&a.length===2&&typeof a[0]=="number"&&typeof a[1]=="number"}function P(a,e,t){let n=Number(a);return Number.isFinite(n)?Math.min(t,Math.max(e,Math.round(n))):e}var Bn="domotiapp-scene-card",Ji="domotiapp-scene-card-editor",pl="domotiapp-scene-editor";var St=["een","twee","drie"],hl="pencil",ul=["grid_options","layout_options","view_layout","visibility"];var ml="entity_id",tt=class extends Q{constructor(){super();y(this,"_label",t=>t.name==="entity"?"Lichtgroep":t.name==="bare"?"Achtergrond weglaten":this._friendlyName(t.name));y(this,"_helper",t=>t.name==="entity"?"De lichtgroep waarvan deze kaart de scenes beheert.":t.name==="bare"?"Haalt de vulling en de schaduw onder de kaart weg. De rand blijft staan.":t.name);this._getypt={}}setConfig(t){this._config={...t}}_lichtgroepen(){let t=this.hass?.states??{};return Object.keys(t).filter(n=>n.startsWith("light.")&&Array.isArray(t[n].attributes?.[ml]))}_leden(){let t=this._config?.entity,n=this.hass?.states?.[t]?.attributes?.[ml];return Array.isArray(n)?n.filter(i=>i!==t):[]}_entiteitSchema(){let t=this._lichtgroepen();return[{name:"entity",required:!0,selector:t.length?{entity:{include_entities:t}}:{entity:{domain:"light"}}},{name:"bare",selector:{boolean:{}}}]}_namenSchema(t){return t.map(n=>({name:n,selector:{text:{}}}))}_naamData(t){let n=this._config?.name_overrides??{},i={};for(let r of t)r in this._getypt?i[r]=this._getypt[r]:n[r]&&(i[r]=n[r]);return i}_friendlyName(t){return this.hass?.states?.[t]?.attributes?.friendly_name||t}_entiteitGewijzigd(t){t.stopPropagation();let n=t.detail.value??{},i={...this._config,entity:n.entity};n.bare?i.bare=!0:delete i.bare,i.entity!==this._config?.entity&&(delete i.name_overrides,this._getypt={}),this._stuurDoor(i)}_namenGewijzigd(t){t.stopPropagation(),this._getypt={...this._getypt,...t.detail.value};let n={};for(let[r,o]of Object.entries(this._getypt))typeof o=="string"&&o.trim()&&(n[r]=o.trim());let i={...this._config};Object.keys(n).length?i.name_overrides=n:delete i.name_overrides,this._stuurDoor(i)}_stuurDoor(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return j;let t=this._leden();return w`
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
          `:j}
    `}};y(tt,"properties",{hass:{attribute:!1},_config:{state:!0},_getypt:{state:!0}}),y(tt,"styles",[oe,ne`
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
    `]);var Np="domotiapp_lovelace/snapshot/create",Op="domotiapp_lovelace/snapshot/close",Kn=class{constructor({roepCommandoAan:e,entityId:t}){this._roep=e,this._entityId=t,this._aanmaak=null,this._afsluiting=null}get heeftSnapshot(){return this._aanmaak!==null}get isGesloten(){return this._afsluiting!==null}async zorgVoorSnapshot(){return this._aanmaak===null&&(this._aanmaak=this._roep(Np,{entity_id:this._entityId}).catch(e=>{throw this._aanmaak=null,e})),this._aanmaak}async sluit({opslaan:e=!1}={}){return this.heeftSnapshot?this._afsluiting!==null?this._afsluiting:(this._afsluiting=(async()=>{try{await this._aanmaak}catch{return{gedaan:!1}}return await this._roep(Op,{entity_id:this._entityId,restore:!e}),{gedaan:!0}})(),this._afsluiting):{gedaan:!1}}};async function gl({beheer:a,oproepen:e,voerUit:t}){return await a.zorgVoorSnapshot(),t(e)}var tr="laden",nr="klaar",fl="fout",Cp=`linear-gradient(to right, ${[0,60,120,180,240,300,360].map(a=>`hsl(${a}, 100%, 50%)`).join(", ")})`,nt=class extends Q{constructor(){super(),this._scenes=null,this._leden=[],this._tab=0,this._toestand=tr,this._melding="",this._bezig=!1,this._kelvinGemeld=new Set,this._snapshot=null}firstUpdated(){this._haalOp()}async _haalOp(){this._toestand=tr;try{let e=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:this.entityId});return this._neemOver(e),this._toestand=nr,e}catch(e){return this._melding=e?.message??String(e),this._toestand=fl,null}}_neemOver(e){this._scenes=Array.from({length:3},(t,n)=>{let i=e.scenes?.[n]??{};return{icon:i.icon||St[n],lights:{...i.lights??{}}}}),this._leden=e.member_entity_ids??[],this._melding=""}_stateVan(e){return this.hass?.states?.[e]}_besturingVan(e){let t=pe(this._stateVan(e));return t.kelvinUitDefaults&&!this._kelvinGemeld.has(e)&&(this._kelvinGemeld.add(e),console.warn(`domotiapp-scene-editor: ${e} meldt geen Kelvin-grenzen; ${t.minKelvin}\u2013${t.maxKelvin} K aangehouden (SPEC 6.3).`)),t}_waardeVan(e){return this._scenes?.[this._tab]?.lights?.[e]}_zetLamp(e,t){this._scenes=this._scenes.map((n,i)=>{if(i!==this._tab)return n;let r={...n.lights};return t===void 0?delete r[e]:r[e]=t,{...n,lights:r}})}_zetIcoon(e){this._scenes=this._scenes.map((t,n)=>n===this._tab?{...t,icon:e||St[n]}:t)}_kiesTab(e){this._tab=e}get _kanOpslaan(){return this._toestand===nr&&!this._bezig&&this._leden.length>0}async _slaOp(){if(!this._kanOpslaan)return;this._bezig=!0,this._melding="";try{await this.hass.callWS({type:"domotiapp_lovelace/scenes/save",entity_id:this.entityId,scenes:this._scenes})}catch(t){this._melding=t?.message??String(t),this._bezig=!1;return}let e=await this._haalOp();this._bezig=!1,e&&this.dispatchEvent(new CustomEvent("scenes-opgeslagen",{detail:e,bubbles:!0,composed:!0})),this._sluit({opslaan:!0})}get _beheer(){return this._snapshot===null&&(this._snapshot=new Kn({entityId:this.entityId,roepCommandoAan:(e,t)=>this.hass.callWS({type:e,...t})})),this._snapshot}get _kanVoorbeeld(){return this._toestand===nr&&!this._bezig&&this._leden.length>0}async _voorbeeld(){if(!this._kanVoorbeeld)return;let{oproepen:e}=Rn({scene:this._scenes[this._tab],memberEntityIds:this._leden,states:this.hass.states});this._bezig=!0,this._melding="";try{let t=await gl({beheer:this._beheer,oproepen:e,voerUit:n=>In((i,r)=>this.hass.callService("light",i,r),n)});t.length&&(this._melding=`Deze lampen reageerden niet: ${t.map(n=>this._naam(n.entityId)).join(", ")}.`)}catch(t){this._melding=`Het voorbeeld is niet gestart: ${t?.message??String(t)}`}finally{this._bezig=!1}}_sluit({opslaan:e=!1}={}){this.dispatchEvent(new CustomEvent("editor-gesloten",{bubbles:!0,composed:!0})),this._sluitSnapshot({opslaan:e})}async _sluitSnapshot({opslaan:e}){try{await this._beheer.sluit({opslaan:e})}catch(t){console.warn(`domotiapp-scene-editor: de snapshot kon niet worden ${e?"verwijderd":"hersteld"}: ${t?.message??t}`)}}disconnectedCallback(){super.disconnectedCallback(),this._snapshot&&this._snapshot.heeftSnapshot&&this._sluitSnapshot({opslaan:!1})}_dialoogGesloten(e){e.stopPropagation(),this._sluit()}_naam(e){return this.nameOverrides?.[e]||this._stateVan(e)?.attributes?.friendly_name||e}render(){return w`
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
    `}_renderInhoud(){return this._toestand===tr?w`<div class="inhoud">Bezig met laden…</div>`:this._toestand===fl?w`
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

        ${this._melding?w`<ha-alert alert-type="error">${this._melding}</ha-alert>`:j}
        ${this._leden.length===0?w`<ha-alert alert-type="info">
              Deze lichtgroep bevat geen lampen.
            </ha-alert>`:w`<div class="lampen">
              ${this._leden.map(e=>this._renderLamp(e))}
            </div>`}
      </div>
    `}_renderLamp(e){let t=this._stateVan(e),n=this._besturingVan(e),i=this._waardeVan(e),r=Yi(i,t,n),o=il(i,t,n);return w`
      <div class="lamp">
        <div class="kop">
          <div class="naam">
            <span class="tekst">
              ${this._naam(e)}
              ${n.bekend?n.beschikbaar?j:w`<span class="hint">niet bereikbaar</span>`:w`<span class="hint">lamp niet gevonden</span>`}
            </span>
            ${Xi(i)?j:w`<span class="nieuw">nieuw</span>`}
          </div>
          ${n.bekend?w`
                <div class="bediening">
                  ${o.kleurkeuze?this._renderKleurkeuze(e,t,n,i,o.stand):j}
                  <ha-switch
                    .checked=${r}
                    @change=${s=>this._zetLamp(e,Js(i,s.target.checked,t,n))}
                  ></ha-switch>
                </div>
              `:j}
        </div>
        ${this._renderBesturing(e,t,n,i,o)}
      </div>
    `}_renderBesturing(e,t,n,i,r){return w`
      ${r.helderheid?this._renderHelderheid(e,t,n,i):j}
      ${r.kleurtemp?this._renderKleurtemp(e,t,n,i):j}
      ${r.kleur?this._renderKleur(e,t,n,i):j}
    `}_renderHelderheid(e,t,n,i){let r=sl(tl(i,t,n)),o=s=>{s.stopPropagation(),this._zetLamp(e,el(this._waardeVan(e),ll(s.detail.value),t,n))};return w`
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
    `}_renderKleurkeuze(e,t,n,i,r){let o=s=>l=>{l.stopPropagation(),s!==r&&this._zetLamp(e,ol(this._waardeVan(e),s,t,n))};return w`
      <div class="kleurkeuze">
        <button
          class="keuze ${r===Ke?"actief":""}"
          aria-pressed=${r===Ke?"true":"false"}
          @click=${o(Ke)}
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
    `}_renderKleurtemp(e,t,n,i){let r=Zi(i,t,n),o=s=>{s.stopPropagation(),this._zetLamp(e,qi(this._waardeVan(e),s.detail.value,t,n))};return w`
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
          style=${`--control-slider-background: ${dl(n.minKelvin,n.maxKelvin)}; --control-slider-background-opacity: 1`}
          @slider-moved=${o}
          @value-changed=${o}
        ></ha-control-slider>
      </div>
    `}_renderKleur(e,t,n,i){let[r,o]=Pn(i,t,n),s=l=>d=>{d.stopPropagation();let c=Pn(this._waardeVan(e),t,n),p=l==="tint"?[d.detail.value,c[1]]:[c[0],d.detail.value];this._zetLamp(e,Fi(this._waardeVan(e),p,t,n))};return w`
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
              style=${`--control-slider-background: ${Cp}; --control-slider-background-opacity: 1`}
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
    `}};y(nt,"properties",{hass:{attribute:!1},entityId:{attribute:!1},nameOverrides:{attribute:!1},_scenes:{state:!0},_leden:{state:!0},_tab:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0}}),y(nt,"styles",[oe,ne`
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
    `]);var Lp="0.30.0",Hp=["type","entity","name_overrides","bare"],Un="laden",Nt="klaar",ar="leeg",ir="geen-groep",bl="opslagfout",vl="fout",Ot=class extends Q{constructor(){super();y(this,"_opnieuw",()=>{this._herkansing.herstel(),this._haalScenesOp()});this._scenes=null,this._leden=[],this._toestand=Un,this._melding="",this._bezig=!1,this._editorOpen=!1,this._opgehaaldVoor=null,this._bestondVorigeKeer=!1,this._herkansing=new fe(()=>this._haalScenesOp()),this._verbinding=new Ze}static getConfigElement(){return document.createElement(Ji)}static getStubConfig(t){return{entity:Object.keys(t?.states??{}).find(i=>i.startsWith("light.")&&Array.isArray(t.states[i].attributes?.entity_id))??""}}updated(){let t=this.renderRoot?.querySelector(".card, .needs");t!==this._rasterVak&&(this._rasterUit?.(),this._rasterVak=t,this._rasterUit=t?R(t):null),D(t)}disconnectedCallback(){super.disconnectedCallback(),this._herkansing.stop(),this._rasterUit?.(),this._rasterUit=null,this._rasterVak=null}setConfig(t){if(!t?.entity)throw new Error("Kies een lichtgroep bij 'entity'.");let n=Object.keys(t).filter(i=>!Hp.includes(i)&&!ul.includes(i));n.length&&console.warn(`${Bn}: onbekende sleutels in de configuratie: ${n.join(", ")}`),this._config=t,this.toggleAttribute("bare",!!t.bare)}getCardSize(){return 1}getGridOptions(){return{rows:"auto",columns:"full",min_columns:6,min_rows:Ue(this.renderRoot?.querySelector?.(".card"))??1}}willUpdate(){let t=this._config?.entity;if(!this.hass||!t)return;let n=!!this.hass.states[t];if(this._opgehaaldVoor!==t){this._opgehaaldVoor=t,this._bestondVorigeKeer=n,this._haalScenesOp();return}if(this._verbinding.herverbonden(this.hass)){this._bestondVorigeKeer=n,this._herkansing.herstel(),this._haalScenesOp();return}if(n&&!this._bestondVorigeKeer&&this._toestand===ir){this._bestondVorigeKeer=!0,this._haalScenesOp();return}this._bestondVorigeKeer=n}async _haalScenesOp(){let t=this._config.entity;this._toestand=Un,this._melding="";try{let n=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:t});this._scenes=n.scenes,this._leden=n.member_entity_ids??[],this._toestand=this._leden.length===0?ar:Nt,this._herkansing.herstel()}catch(n){this._verwerkFout(n,t)}}_verwerkFout(t,n){let i=t?.code;if(this._melding=t?.message??String(t),Oe(t)&&this._herkansing.plan()){this._toestand=Un;return}if(i==="home_assistant_error"){this._toestand=bl;return}if(!this.hass.states[n]){this._toestand=ir;return}this._toestand=vl}_naam(t){return this._config?.name_overrides?.[t]||this.hass?.states?.[t]?.attributes?.friendly_name||t}async _pasSceneToe(t){if(this._bezig||this._toestand!==Nt)return;let{oproepen:n}=Rn({scene:this._scenes?.[t],memberEntityIds:this._leden,states:this.hass.states});if(n.length){this._bezig=!0;try{let i=await In((r,o)=>this.hass.callService("light",r,o),n);i.length&&this._meldMislukking(i.map(r=>r.entityId))}finally{this._bezig=!1}}}_meldMislukking(t){let n=t.map(r=>this._naam(r)).join(", "),i=t.length===1?`${n} reageerde niet.`:`Deze lampen reageerden niet: ${n}.`;this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:i},bubbles:!0,composed:!0}))}_bewerk(){this._toestand===Nt&&(this._editorOpen=!0)}_sluitEditor(){this._editorOpen=!1}_scenesOpgeslagen(t){t.stopPropagation(),this._scenes=t.detail.scenes,this._leden=t.detail.member_entity_ids??[],this._toestand=this._leden.length===0?ar:Nt}render(){if(!this._config)return j;switch(this._toestand){case ir:return this._renderFout(`Lichtgroep ${this._config.entity} bestaat niet (meer). Pas de kaart aan.`);case bl:return this._renderFout("De opgeslagen scenes van deze kamer zijn onleesbaar.",this._melding);case vl:return this._renderFout("De scenes konden niet geladen worden.",this._melding,!0);default:return this._renderKaart()}}_renderFout(t,n,i=!1){return w`
      <div class="needs">
        <span class="mark">${this._icoon("question")}</span>
        <span>
          <b>${t}</b>
          ${n?w`<span class="detail">${n}</span>`:j}
          ${i?w`<button type="button" class="opnieuw" @click=${this._opnieuw}>
                Opnieuw proberen
              </button>`:j}
        </span>
      </div>
    `}_icoon(t){let n=document.createElement("template");return n.innerHTML=v(t),n.content.cloneNode(!0)}_renderKaart(){let t=this._toestand===ar,n=this._toestand===Un,i=this._iconen();return w`
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
            ${this._icoon(hl)}
          </button>
        </div>
        ${t?w`<div class="mededeling">Deze lichtgroep bevat geen lampen.</div>`:this._renderNieuweLampen()}
      </div>
      ${this._editorOpen?this._renderEditor():j}
    `}_renderNieuweLampen(){if(this._toestand!==Nt)return j;let t=nl(this._scenes,this._leden,3).length,n=al(t);return n?w`<div class="mededeling">${n}</div>`:j}_renderEditor(){return w`
      <domotiapp-scene-editor
        .hass=${this.hass}
        .entityId=${this._config.entity}
        .nameOverrides=${this._config.name_overrides}
        @editor-gesloten=${this._sluitEditor}
        @scenes-opgeslagen=${this._scenesOpgeslagen}
      ></domotiapp-scene-editor>
    `}_iconen(){return Array.from({length:3},(t,n)=>this._scenes?.[n]?.icon||St[n])}};y(Ot,"properties",{hass:{attribute:!1},_config:{state:!0},_scenes:{state:!0},_leden:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0},_editorOpen:{state:!0}}),y(Ot,"styles",[oe,ne`
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
    `]);O(Bn,Ot);O(Ji,tt);O(pl,nt);We({type:Bn,name:"DomotiApp Scene",description:`Drie lichtscenes per kamer, vastgelegd bij de lichtgroep (v${Lp}).`,preview:!1});var Ge="domotiapp-alarm-card",rr="domotiapp-alarm-card-editor",kl="domotiapp-alarm-editor",xl="DomotiApp Wekker",_l="https://github.com/Sven2410/domotiapp-lovelace",he="domotiapp_lovelace",re=Object.freeze({get:`${he}/alarms/get`,save:`${he}/alarms/save`,setEnabled:`${he}/alarms/set_enabled`,delete:`${he}/alarms/delete`,stop:`${he}/alarms/stop`,clearMessage:`${he}/alarms/clear_message`,search:`${he}/sound/search`,entities:`${he}/entities/list`,previewStart:`${he}/preview/start`,subscribe:`${he}/updates/subscribe`}),Wn="#026FA1";function wl(a){let e=typeof a?.name=="string"?a.name.trim():"",t=typeof a?.time=="string"?a.time.trim():"";return e&&t?`Wil je de wekker "${e}" van ${t} verwijderen?`:e?`Wil je de wekker "${e}" verwijderen?`:t?`Wil je de wekker van ${t} verwijderen?`:"Wil je deze wekker verwijderen?"}var Rp="07:00";var Ip=["uri","name","media_type","image"],Vp="Let op: deze tijd bestaat twee nachten per jaar niet, of twee keer. Bij de overgang naar zomertijd wordt het uur van 02:00 tot 03:00 overgeslagen; die nacht gaat deze wekker niet af. Bij de overgang naar wintertijd komt dat uur twee keer voorbij; die nacht gaat hij twee keer af. Kies een tijd v\xF3\xF3r 02:00 of n\xE1 03:00 als dat een probleem is.",Pp="Dit geluid stopt van zichzelf. Een los nummer is na een paar minuten voorbij; daarna is het stil. Kies een afspeellijst of een radiostation als de wekker moet blijven spelen tot je hem uitzet.";var Bp="Music Assistant Wekker",Kp="Verlichting Wekker";function qn(){return{id:null,name:"",time:Rp,days:[],enabled:!0,sound:null,endless:null,speaker:"",volume_pct:40,light:null}}function yl(a){let e=qn();return!a||typeof a!="object"?e:{id:typeof a.id=="string"?a.id:null,name:typeof a.name=="string"?a.name:"",time:or(a.time)?a.time:e.time,days:Array.isArray(a.days)?[...a.days]:[],enabled:a.enabled!==!1,sound:Tt(a.sound),endless:null,speaker:typeof a.speaker=="string"?a.speaker:"",volume_pct:Number.isInteger(a.volume_pct)?a.volume_pct:e.volume_pct,light:a.light&&typeof a.light=="object"?{entity_id:a.light.entity_id,brightness_pct:Number.isInteger(a.light.brightness_pct)?a.light.brightness_pct:60}:null}}function Tt(a){if(!a||typeof a!="object"||Array.isArray(a)||typeof a.uri!="string"||!a.uri)return null;let e={};for(let t of Ip)e[t]=a[t]===void 0?null:a[t];return e}function or(a){if(typeof a!="string"||a.length!==5||a[2]!==":")return!1;let e=Number(a.slice(0,2)),t=Number(a.slice(3));return!/^\d\d$/.test(a.slice(0,2))||!/^\d\d$/.test(a.slice(3))?!1:e>=0&&e<=23&&t>=0&&t<=59}function sr(a){let e=[];return!a||typeof a!="object"?{ok:!1,ontbreekt:["alles"]}:((typeof a.name!="string"||!a.name.trim())&&e.push("een naam"),or(a.time)||e.push("een geldige tijd"),a.speaker||e.push("een speaker"),(!a.sound||!a.sound.uri)&&e.push("een geluid"),(!Number.isInteger(a.volume_pct)||a.volume_pct<1||a.volume_pct>100)&&e.push("een volume tussen 1 en 100"),{ok:e.length===0,ontbreekt:e})}function zl(a){let e=[...new Set(a.days||[])].sort((n,i)=>n-i),t={name:(a.name||"").trim(),time:a.time,days:e,enabled:e.length===0?!0:a.enabled!==!1,sound:Tt(a.sound),speaker:a.speaker,volume_pct:a.volume_pct,light:a.light?{entity_id:a.light.entity_id,brightness_pct:a.light.brightness_pct}:null};return a.id&&(t.id=a.id),t}function jl(a,e){let t=new Set(a||[]);return t.has(e)?t.delete(e):t.add(e),[...t].sort((n,i)=>n-i)}function $l(a){return or(a)&&a.slice(0,2)==="02"?Vp:null}function El(a){return a===!1?Pp:null}function Al(a){return typeof a?.endless=="boolean"?a.endless:null}function Fn(a,e){let t=e==="lamp",n=t?Kp:Bp,i=t?"lampen":"speakers";return!a||typeof a!="object"?`De lijst met ${i} is niet op te halen.`:a.label_exists===!1?`Het label '${n}' bestaat nog niet. De beheerder moet dat label aanmaken en op de ${i} zetten die als wekker mogen dienen.`:Array.isArray(a.entities)&&a.entities.length>0?null:Number(a.filtered_out)>0?t?`De entiteiten met het label '${n}' zijn geen lampen.`:"De gelabelde speakers zijn geen Music Assistant-speakers, of ze kunnen geen volume instellen.":`Er zijn nog geen ${i} met het label '${n}'.`}function Ml(a,e){return Fn(e,"speaker")!==null?!1:sr(a).ok}var Up=[[1,"ma"],[2,"di"],[3,"wo"],[4,"do"],[5,"vr"],[6,"za"],[7,"zo"]],Wp=[["","Alles"],["playlist","Afspeellijsten"],["radio","Radio"],["artist","Artiesten"],["album","Albums"],["track","Nummers"],["podcast","Podcasts"]],Dt="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",qp="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",Fp="M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z",at=class extends Q{constructor(){super(),this._concept=qn(),this._zoekterm="",this._soort="",this._treffers=null,this._zoekt=!1,this._melding=null,this._speelt=!1,this._bezig=!1,this._afmeldenVoorbeeld=null,this._opEscape=e=>{e.key==="Escape"&&this._annuleren()}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this._opEscape,!0)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this._opEscape,!0),this._stopVoorbeeld()}willUpdate(e){e.has("wekker")&&(this._concept=this.wekker?yl(this.wekker):qn(),this._treffers=null,this._zoekterm="",this._melding=null)}_zet(e){this._concept={...this._concept,...e}}async _startVoorbeeld(){if(!(this._speelt||!this.hass)){if(!this._concept.speaker||!this._concept.sound){this._melding={tekst:"Kies eerst een speaker en een geluid.",fout:!0};return}this._melding=null;try{this._afmeldenVoorbeeld=await this.hass.connection.subscribeMessage(()=>{},{type:re.previewStart,speaker:this._concept.speaker,sound:Tt(this._concept.sound),volume_pct:this._concept.volume_pct,light:this._concept.light??null}),this._speelt=!0}catch(e){this._melding={tekst:e?.message??"Het voorbeeld kon niet starten.",fout:!0}}}}_stopVoorbeeld(){if(this._afmeldenVoorbeeld){try{this._afmeldenVoorbeeld()}catch(e){console.warn(`domotiapp-alarm-editor: afmelden mislukt: ${e?.message??e}`)}this._afmeldenVoorbeeld=null}this._speelt=!1}async _zoek(){let e=(this._zoekterm||"").trim();if(!(!e||!this.hass)){this._zoekt=!0,this._melding=null;try{let t={type:re.search,query:e,limit:20};this._soort&&(t.media_types=[this._soort]);let n=await this.hass.callWS(t);this._treffers=n.results??[]}catch(t){this._treffers=[],this._melding={tekst:t?.message??"Zoeken is mislukt.",fout:!0}}finally{this._zoekt=!1}}}_kiesGeluid(e){this._zet({sound:Tt(e),endless:Al(e)}),this._treffers=null}async _opslaan(){if(this._bezig||!this.hass)return;let e=sr(this._concept);if(!e.ok){this._melding={tekst:`Er ontbreekt nog ${e.ontbreekt.join(", ")}.`,fout:!0};return}this._bezig=!0;try{let t=await this.hass.callWS({type:re.save,person:this.person,alarm:zl(this._concept)});this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-opgeslagen",{detail:{toestand:t},bubbles:!0,composed:!0}))}catch(t){this._melding={tekst:t?.message??"Opslaan is mislukt.",fout:!0}}finally{this._bezig=!1}}_annuleren(){this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-dicht",{bubbles:!0,composed:!0}))}_svg(e){return w`<svg class="icoon" viewBox="0 0 24 24" aria-hidden="true">
      <path d=${e} />
    </svg>`}render(){if(!this.hass)return j;let e=this._concept,t=this.entiteiten?.speakers,n=this.entiteiten?.lights,i=Fn(t,"speaker"),r=Fn(n,"lamp"),o=$l(e.time),s=El(e.endless),l=Ml(e,t);return w`
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
        ${o?w`<div class="waarschuwing">
              ${this._svg(Dt)}<span>${o}</span>
            </div>`:j}
      </div>

      <div class="blok">
        <label class="veld">Herhaling</label>
        <div class="dagen">
          ${Up.map(([d,c])=>w`<button
              type="button"
              aria-pressed=${e.days.includes(d)?"true":"false"}
              aria-label=${c}
              @click=${()=>this._zet({days:jl(e.days,d)})}
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
        ${i?w`<div class="uitleg">${this._svg(Dt)}<span>${i}</span></div>`:w`<div class="vak">
              <select
                id="speaker"
                .value=${e.speaker}
                @change=${d=>this._zet({speaker:d.target.value})}
              >
                <option value="">Kies een speaker…</option>
                ${(t?.entities??[]).map(d=>w`<option value=${d.entity_id} ?selected=${d.entity_id===e.speaker}>
                    ${d.name}
                  </option>`)}
              </select>
            </div>`}
      </div>

      <div class="blok">
        <label class="veld" for="zoek">Geluid</label>
        ${e.sound?w`<div class="gekozen">
              ${e.sound.image?w`<img src=${e.sound.image} alt="" />`:j}
              <span>${e.sound.name||e.sound.uri}</span>
              <span class="soort" style="margin-left:auto">${e.sound.media_type??""}</span>
            </div>`:j}
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
              ${Wp.map(([d,c])=>w`<option value=${d}>${c}</option>`)}
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
            ${this._svg(this._zoekt?Fp:qp)}
          </button>
        </div>
        ${this._treffers?w`<div class="treffers">
              ${this._treffers.length===0?w`<div class="treffer">Niets gevonden.</div>`:this._treffers.map(d=>w`<button
                      class="treffer"
                      type="button"
                      @click=${()=>this._kiesGeluid(d)}
                    >
                      ${d.image?w`<img src=${d.image} alt="" />`:j}
                      <span>${d.name}</span>
                      <span class="soort">${d.media_type??""}</span>
                    </button>`)}
            </div>`:j}
        ${s?w`<div class="waarschuwing">${this._svg(Dt)}<span>${s}</span></div>`:j}
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
        ${r?w`<div class="uitleg">${this._svg(Dt)}<span>${r}</span></div>`:w`
              <div class="vak">
                <select
                  id="lamp"
                  @change=${d=>this._zet({light:d.target.value?{entity_id:d.target.value,brightness_pct:e.light?.brightness_pct??60}:null})}
                >
                  <option value="">Geen lamp</option>
                  ${(n?.entities??[]).map(d=>w`<option
                      value=${d.entity_id}
                      ?selected=${d.entity_id===e.light?.entity_id}
                    >
                      ${d.name}
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
                      @input=${d=>this._zet({light:{...e.light,brightness_pct:Number(d.target.value)}})}
                    />`:j}
            `}
      </div>

      ${this._melding?w`<div class="blok">
            <div class="waarschuwing ${this._melding.fout?"fout":""}">
              ${this._svg(Dt)}<span>${this._melding.tekst}</span>
            </div>
          </div>`:j}

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
    `}};y(at,"properties",{hass:{attribute:!1},person:{attribute:!1},wekker:{attribute:!1},entiteiten:{attribute:!1},_concept:{state:!0},_zoekterm:{state:!0},_soort:{state:!0},_treffers:{state:!0},_zoekt:{state:!0},_melding:{state:!0},_speelt:{state:!0},_bezig:{state:!0}}),y(at,"styles",[oe,ne`
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${be(Wn)});
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
  `]);var Sl="person",Zp="Kies een persoon in de kaartinstellingen.",Nl="De gekozen persoon is niet gevonden.",Xp="De opgeslagen wekkers van deze persoon zijn onleesbaar.",nv=Object.freeze(["grid_options","layout_options","view_layout","visibility"]);function Ol(a){if(!a||typeof a!="object"||Array.isArray(a))throw new Error("De kaartconfig ontbreekt of is geen object.");let e=a.person;if(e==null||e==="")return{...a};if(typeof e!="string")throw new Error("'person' moet een entity-ID zijn, zoals person.sven.");if(!e.startsWith(`${Sl}.`))throw new Error(`'${e}' zit niet in het domein ${Sl}. Kies een persoon, zoals person.sven.`);return{...a}}function Tl(a){return{type:`custom:${a}`}}function Dl(a,e){return a?e?{soort:"ok",tekst:null,isFout:!1}:{soort:"weg",tekst:Nl,isFout:!0}:{soort:"ontbreekt",tekst:Zp,isFout:!1}}function Cl(a,e){return a==="not_found"?Nl:a==="home_assistant_error"?Xp:e||"Er ging iets mis bij het ophalen van de wekkers."}var Yp=["ma","di","wo","do","vr","za","zo"],Qp="Geen wekkers ingesteld",Jp="Eenmalig",eh="Eenmalig \u2014 afgelopen",th="Geen wekker actief",Ll="Stoppen",nh="Er is een melding over deze wekker, maar de tekst ontbreekt.";function ah(a){return!Array.isArray(a)||a.length===0?Jp:[...new Set(a)].sort((t,n)=>t-n).map(t=>Yp[t-1]??"?").join(" ")}function ih(a,e){return!a||Array.isArray(a.days)&&a.days.length>0?!1:Date.parse(a?.one_shot_at??"")<=e}function Hl(a,e){return ih(a,e)?eh:ah(a?.days)}function Rl(a){let e=a?.last_message;return!e||typeof e!="object"||Array.isArray(e)?null:{tekst:typeof e.text=="string"&&e.text.trim()?e.text:nh,severity:e.severity==="error"?"error":"notice",isFout:e.severity==="error",kind:typeof e.kind=="string"?e.kind:null}}function Il(a){let e=a?.alarms;if(!Array.isArray(e)||e.length===0)return Qp;let t=a?.next_fire?.text;return typeof t=="string"&&t.trim()?t:th}function Vl(a,e){let t=[...new Set((e??[]).filter(o=>typeof o=="string"))];if(t.length===0)return null;let n=t.map(o=>(a??[]).find(s=>s?.id===o)).filter(Boolean),i=n.map(o=>o.name).filter(Boolean),r=[...new Set(n.map(o=>o.time).filter(Boolean))];return{ids:t,naam:i.length?i.join(" en "):"Wekker",tijd:r.join(" en ")}}var rh="0.30.0",oh="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",sh="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z",Pl="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",lh="M13,14H11V9H13M13,18H11V16H13M1,21H23L12,2L1,21Z",Zn=(a,e="icoon")=>w`<svg class=${e} viewBox="0 0 24 24" aria-hidden="true">
    <path d=${a} />
  </svg>`,Ct=class extends Q{constructor(){super(),this._toestand=null,this._fout=null,this._bevestigVoor=null,this._bezig=!1,this._tijdelijkeMelding=null,this._editorVoor=void 0,this._entiteiten=null,this._abonnementVoor=null,this._afmelden=null,this._herkansing=new fe(()=>this._haalOp()),this._verbinding=new Ze}setConfig(e){let t=Ol(e),n=t.person!==this._config?.person;this._config=t,this.toggleAttribute("bare",!!e?.bare),n&&(this._toestand=null,this._fout=null,this._bevestigVoor=null,this._herstartAbonnement())}static getConfigElement(){return document.createElement(rr)}static getStubConfig(){return Tl(Ge)}getGridOptions(){return{rows:"auto",columns:12,min_columns:6,min_rows:Ue(this.renderRoot?.querySelector?.(".card"))??1}}getCardSize(){if(this._stop())return 3;let e=this._toestand?.alarms?.length??0;return 1+Math.max(e,1)}connectedCallback(){super.connectedCallback(),this._herstartAbonnement()}disconnectedCallback(){super.disconnectedCallback(),this._herkansing.stop(),this._stopAbonnement(),this._rasterUit?.(),this._rasterUit=null,this._rasterVak=null}updated(e){e.has("hass")&&this.hass&&(this._startAbonnement(),this._verbinding.herverbonden(this.hass)&&(this._herkansing.herstel(),this._haalOp())),this._volgRaster()}_volgRaster(){let e=this.renderRoot?.querySelector(".card, .needs");e!==this._rasterVak&&(this._rasterUit?.(),this._rasterVak=e,this._rasterUit=e?R(e):null),D(e)}async _startAbonnement(){let e=this._config?.person;if(!(!this.hass||!e||!this.isConnected)&&this._abonnementVoor!==e){this._abonnementVoor=e;try{let t=await this.hass.connection.subscribeMessage(n=>this._opGebeurtenis(n),{type:re.subscribe,person:e});if(this._abonnementVoor!==e){t();return}this._afmelden=t}catch(t){console.warn(`${Ge}: abonneren mislukt: ${t?.message??t}`)}await this._haalOp()}}_stopAbonnement(){if(this._afmelden){try{this._afmelden()}catch(e){console.warn(`${Ge}: afmelden mislukt: ${e?.message??e}`)}this._afmelden=null}this._abonnementVoor=null}_herstartAbonnement(){this._stopAbonnement(),this._startAbonnement()}_opGebeurtenis(e){let t=e?.alarm_id,n=e?.event;if(typeof t=="string"&&this._toestand){let i=new Set(this._toestand.ringing??[]);n==="started"?i.add(t):i.delete(t),this._toestand={...this._toestand,ringing:[...i]}}this._haalOp()}async _haalOp(){let e=this._config?.person;if(!(!this.hass||!e))try{let t=await this.hass.callWS({type:re.get,person:e});if(this._config?.person!==e)return;this._toestand=t,this._fout=null,this._herkansing.herstel()}catch(t){if(this._config?.person!==e||Oe(t)&&this._herkansing.plan())return;this._toestand=null,this._fout=Cl(t?.code,t?.message)}}async _roep(e){if(!(!this.hass||this._bezig)){this._bezig=!0;try{let t=await this.hass.callWS(e);t&&typeof t=="object"&&(this._toestand=t,this._fout=null)}catch(t){this._toon(t?.message??"De opdracht is niet gelukt.")}finally{this._bezig=!1}}}async _openEditor(e){if(this._bevestigVoor=null,this._editorVoor=e,!!this.hass)try{this._entiteiten=await this.hass.callWS({type:re.entities})}catch(t){this._entiteiten=null,console.warn(`${Ge}: entiteitenlijst ophalen mislukt: ${t?.message??t}`)}}_sluitEditor(){this._editorVoor=void 0}_toon(e){this._tijdelijkeMelding=e,clearTimeout(this._meldingTimer),this._meldingTimer=setTimeout(()=>{this._tijdelijkeMelding=null},6e3)}_person(){return this._config?.person}_zetAan(e,t){this._roep({type:re.setEnabled,person:this._person(),alarm_id:e.id,enabled:t})}_verwijder(e){this._bevestigVoor=null,this._roep({type:re.delete,person:this._person(),alarm_id:e.id})}_begrepen(e){this._roep({type:re.clearMessage,person:this._person(),alarm_id:e.id})}async _stopAlles(e){for(let t of e)await this._roep({type:re.stop,person:this._person(),alarm_id:t})}_stop(){return this._toestand?Vl(this._toestand.alarms,this._toestand.ringing):null}render(){if(!this._config)return j;let e=this._config.person,t=!!(e&&this.hass?.states?.[e]),n=Dl(e,t);if(n.soort!=="ok")return this._mededeling(n.tekst,n.isFout);if(this._fout)return this._mededeling(this._fout,!0);if(!this._toestand)return this._mededeling("Wekkers ophalen\u2026",!1);let i=this._stop();return this._editorVoor!==void 0&&!i?w`<div class="card surface">
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
            ${Zn(Pl,"icoon klein")}
            <span class="boodschap">${this._tijdelijkeMelding}</span>
          </div>`:j}
    </div>`}_mededeling(e,t){return w`<div class="card surface">
      <div class="mededeling ${t?"fout":""}">${e}</div>
    </div>`}_stopknop(e){return w`<button
      class="stopknop"
      @click=${()=>this._stopAlles(e.ids)}
    >
      <div class="stop-tijd">${e.tijd}</div>
      <div class="stop-naam">${e.naam}</div>
      <div class="stop-woord">${Ll}</div>
    </button>`}_lijst(){let e=this._toestand.alarms??[],t=Date.now();return w`
      <div class="kop ${e.length===0?"leeg":""}">
        <span class="volgende">${Il(this._toestand)}</span>
        <button
          class="icoonknop"
          title="Wekker toevoegen"
          aria-label="Wekker toevoegen"
          @click=${()=>this._openEditor(null)}
        >
          ${Zn(oh)}
        </button>
      </div>
      ${e.map(n=>this._rij(n,t))}
    `}_bevestiging(e){return w`<div class="onderrij bevestiging">
      <span class="boodschap">${wl(e)}</span>
      <button
        class="tekstknop"
        @click=${()=>{this._bevestigVoor=null}}
      >
        Annuleren
      </button>
      <button class="tekstknop gevaar" @click=${()=>this._verwijder(e)}>
        Verwijderen
      </button>
    </div>`}_rij(e,t){let n=Rl(e),i=!!e.enabled;return w`
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
            <div class="sub">${Hl(e,t)}</div>
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
          ${Zn(sh)}
        </button>
      </div>
      ${this._bevestigVoor===e.id?this._bevestiging(e):j}
      ${n?w`<div class="onderrij ${n.isFout?"fout":""}">
            ${Zn(n.isFout?lh:Pl,"icoon klein")}
            <span class="boodschap">${n.tekst}</span>
            <button class="tekstknop" @click=${()=>this._begrepen(e)}>
              Begrepen
            </button>
          </div>`:j}
    `}};y(Ct,"properties",{hass:{attribute:!1},_config:{state:!0},_toestand:{state:!0},_fout:{state:!0},_bevestigVoor:{state:!0},_bezig:{state:!0},_tijdelijkeMelding:{state:!0},_editorVoor:{state:!0},_entiteiten:{state:!0}}),y(Ct,"styles",[oe,ne`
    /* unsafeCSS en niet de constante rechtstreeks: lit weigert een gewone
       string in een css-template en gooit dan — op modulescope, wat SPEC 19.4
       verbiedt. De waarde is onze eigen constante en komt nergens van buiten. */
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${be(Wn)});
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
  `]);var it=class it extends Q{constructor(){super(...arguments);y(this,"_label",t=>({person:"Persoon",bare:"Achtergrond weglaten"})[t.name]??t.name)}setConfig(t){this._config={...t}}render(){return!this._config||!this.hass?j:w`
      <div class="uitleg">
        Elke persoon heeft zijn eigen wekkerlijst. De kaart toont alleen de
        wekkers van de gekozen persoon.
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${it._SCHEMA}
        .computeLabel=${this._label}
        @value-changed=${this._gewijzigd}
      ></ha-form>
    `}_gewijzigd(t){t.stopPropagation();let n={...this._config,...t.detail.value};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:n},bubbles:!0,composed:!0}))}};y(it,"properties",{hass:{attribute:!1},_config:{state:!0}}),y(it,"styles",[oe,ne`
    .uitleg {
      padding: 0 0 12px 0;
      color: var(--dac-ink-2);
      font-size: 11.5px;
    }
  `]),y(it,"_SCHEMA",[{name:"person",required:!0,selector:{entity:{filter:{domain:"person"}}}},{name:"bare",selector:{boolean:{}}}]);var lr=it;O(Ge,Ct);O(rr,lr);O(kl,at);We({type:Ge,name:xl,description:`Wekkerkaart van DomotiApp (v${rh}).`,preview:!1,documentationURL:_l});var dh=["image/png","image/jpeg","image/gif","image/webp","image/svg+xml"];function Bl(a){return`/api/image/serve/${a}/original`}function Kl(a){return a?dh.includes(a.type)?a.size>12582912?`Deze afbeelding is ${Math.round(a.size/1024/1024)} MB. Home Assistant neemt er tot ${12582912/1024/1024} MB aan.`:null:"Kies een afbeelding: PNG, JPEG, GIF, WebP of SVG.":"Geen bestand gekozen."}var ch=`
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
`,dr=class extends HTMLElement{static get sheet_(){return Object.hasOwn(this,"s_")||(this.s_=F(ch)),this.s_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[this.constructor.sheet_]}connectedCallback(){this.gebouwd_||this.bouw_(),this.teken_()}set value(e){this.value_=e??"",this.gebouwd_&&this.teken_()}get value(){return this.value_??""}set label(e){this.label_=e,this.gebouwd_&&this.teken_()}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.shadowRoot.innerHTML=`
      <div class="kop"></div>
      <div class="vak">
        <span class="voorbeeld"></span>
        <span class="rechts">
          <input type="text" placeholder="/local/auto.png" aria-label="Pad naar de afbeelding" />
          <span class="knoppen">
            <button class="doe kies" type="button">${v("plus")}<span>Kies een bestand</span></button>
            <button class="weg leeg" type="button">Wissen</button>
          </span>
          <span class="melding" hidden></span>
        </span>
      </div>
      <input type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" />`,this.gebouwd_=!0;let e=this.$('input[type="file"]');this.$(".kies").addEventListener("click",()=>e.click()),e.addEventListener("change",()=>{let n=e.files?.[0];e.value="",this.upload_(n)}),this.$(".leeg").addEventListener("click",()=>this.zet_(""));let t=this.$('input[type="text"]');t.addEventListener("change",()=>this.zet_(t.value.trim()))}teken_(){this.$(".kop").textContent=this.label_??"Afbeelding";let e=this.$('input[type="text"]');!(this.shadowRoot.activeElement===e)&&e.value!==this.value&&(e.value=this.value);let n=this.$(".voorbeeld");if(this.value){if(n.dataset.bron!==this.value){n.dataset.bron=this.value;let i=document.createElement("img");i.src=this.value,i.alt="",i.onerror=()=>{n.dataset.bron="",n.innerHTML=v("car")},n.replaceChildren(i)}}else n.dataset.bron!==""&&(n.dataset.bron="",n.innerHTML=v("car"))}zet_(e){this.value_=e,this.teken_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}melding_(e,t=!1){let n=this.$(".melding");n.textContent=e,n.dataset.fout=String(t),n.hidden=!e}async upload_(e){let t=Kl(e);if(t)return this.melding_(t,!0);this.melding_("Bezig met uploaden\u2026"),this.$(".kies").disabled=!0;try{let n=new FormData;n.append("file",e);let i=this.hass?.auth?.data?.access_token??this.hass?.auth?.accessToken,r=await fetch("/api/image/upload",{method:"POST",body:n,headers:i?{Authorization:`Bearer ${i}`}:{}});if(!r.ok)throw new Error(`Home Assistant antwoordde met ${r.status}`);let o=await r.json();if(!o?.id)throw new Error("Home Assistant gaf geen id terug.");this.zet_(Bl(o.id)),this.melding_("Ge\xFCpload.")}catch(n){this.melding_(`${n?.message??"Uploaden lukte niet"}. Je kunt het pad ook zelf intypen, bijvoorbeeld /local/auto.png.`,!0)}finally{this.$(".kies").disabled=!1}}};O("dac-foto-picker",dr);var ph="/api/domotiapp_lovelace/loader.js",Gl="domotiapp-lovelace-verversing";function Ul(a){let e=/[?&]v=([0-9a-fA-F]+)/.exec(String(a??""));return e?e[1].toLowerCase():null}async function hh(a){try{let e=await a(ph,{cache:"no-store"});return e?.ok?Ul(await e.text()):null}catch{return null}}function uh(){try{return globalThis.sessionStorage?.getItem(Gl)??null}catch{return null}}function mh(a){try{globalThis.sessionStorage?.setItem(Gl,a)}catch{return!1}return!0}function gh(a,e,t){return!a||!e?"onbekend":a===e?"actueel":t===e?"al-geprobeerd":"herladen"}function Wl({eigenUrl:a,haal:e=globalThis.fetch?.bind(globalThis),herlaad:t=()=>globalThis.location?.reload(),doc:n=globalThis.document,interval:i=18e5,klok:r=setInterval}={}){let o=Ul(a);if(!o||!e)return()=>{};let s=!1,l=async()=>{if(!s&&!n?.querySelector?.("dialog[open], ha-dialog[open]")){s=!0;try{let p=await hh(e);if(gh(o,p,uh())!=="herladen"||!mh(p))return;t()}finally{s=!1}}},d=()=>n?.visibilityState==="visible"?l():void 0;n?.addEventListener?.("visibilitychange",d);let c=r(d,i);return()=>{n?.removeEventListener?.("visibilitychange",d),clearInterval(c)}}var fh="0.30.0";jr(a=>console.warn(`domotiapp-lovelace: ${a}`));Wl({eigenUrl:import.meta.url});console.info(`%c DOMOTIAPP-LOVELACE %c ${fh} `,"background:#026fa1;color:#e8e4de;font-weight:600;border-radius:3px 0 0 3px;padding:2px 6px","background:#12120f;color:#e8e4de;border-radius:0 3px 3px 0;padding:2px 6px");export{fh as VERSION};
