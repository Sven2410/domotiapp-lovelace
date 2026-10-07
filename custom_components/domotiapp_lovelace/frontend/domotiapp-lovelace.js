var Gu=Object.defineProperty;var Wu=(a,e,t)=>e in a?Gu(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var j=(a,e,t)=>Wu(a,typeof e!="symbol"?e+"":e,t);var W=`
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

  /* ---- Wat er tussen donker en licht OMKEERT --------------------------------
   *
   * Tot 0.54.0 stonden deze waarden los in de kaarten, als wit op een paar
   * procent. Op een donkere kaart is dat een tint; op een witte achtergrond is
   * wit op vijf procent niets. Ze staan nu hier, met in donker precies de
   * waarde die er stond, zodat het lichte thema ze kan omkeren zonder dat er
   * in donker een pixel verschuift.
   *
   * --dac-tint is een kale r, g, b: de kleur waarmee een vlak zich van zijn
   * ondergrond afzet. Gebruik: rgba(var(--dac-tint), .05). */
  --dac-tint:          255, 255, 255;

  /* Wat de browser zelf tekent: keuzelijsten, tijdvelden, schuifbalken. */
  --dac-scheme:        dark;

  /* Tekst op een vlak in de accentkleur. Op het diepe accent is dat lichte
     inkt; op het heldere accent donkere, want wit op #198fd9 haalt 3,4:1. */
  --dac-on-accent:     #e8e4de;
  --dac-on-accent-hi:  #0c0c0a;

  /* Het waas achter een scherm dat over de pagina ligt. */
  --dac-scrim:         color-mix(in srgb, #000 58%, transparent);

  /* Hoe zwaar een slagschaduw onder iets ZWEVENDS is (de navbalk, een menu,
     een vraag). Een factor en geen kleur: elke plek houdt zijn eigen maat en
     vermenigvuldigt zijn alfa hiermee. Op wit is dezelfde schaduw een vlek. */
  --dac-diepte:        1;

  /* De schuifschakelaar. In donker is de knop inkt op een getint spoor; in
     licht een witte knop met een schaduwtje, zoals een schakelaar op een licht
     scherm eruit hoort te zien. */
  --dac-knob:          var(--dac-ink);
  --dac-knob-uit:      var(--dac-ink-2);
  --dac-knob-schaduw:  none;
  --dac-spoor-aan:     28%;
  --dac-spoor-rand:    55%;

  /* Een DICHT invoerveld: het tijdveld en de keuzelijsten van de wekker. Dicht
     en niet doorschijnend, omdat de browser het uitklappaneel van een
     keuzelijst met deze kleur tekent. Tot 0.54.0 was dit de kaartkleur van
     het thema van Home Assistant (#1c1c1c in het standaardthema); een vaste
     waarde, zodat het veld leesbaar blijft als onze instelling en het thema
     van Home Assistant het niet eens zijn. */
  --dac-veld:          #1b1b19;
`,Uu=`
  --dac-bg:            #f6f5f2;
  --dac-bg-raise:      #ffffff;
  --dac-surface:       rgba(20, 20, 10, 0.045);
  --dac-surface-hi:    rgba(20, 20, 10, 0.080);
  --dac-border:        rgba(20, 20, 10, 0.11);
  --dac-border-hi:     rgba(20, 20, 10, 0.22);

  --dac-ink:           #1a1a17;
  --dac-ink-2:         rgba(26, 26, 23, 0.68);
  --dac-ink-3:         rgba(26, 26, 23, 0.50);

  --dac-accent:        #026fa1;
  --dac-accent-hi:     #0672a8;
  --dac-accent-soft:   rgba(2, 111, 161, 0.12);
  --dac-accent-glow:   rgba(2, 111, 161, 0.22);

  --dac-good:          #0b850b;
  --dac-warn:          #b07400;
  --dac-bad:           #c62f2f;

  --dac-lit:           #c98d00;

  /* Op wit is er geen haarlijn bovenlangs nodig: de rand doet het werk. */
  --dac-shadow:        none;

  --dac-tint:          20, 20, 10;
  --dac-scheme:        light;

  --dac-on-accent:     #ffffff;
  --dac-on-accent-hi:  #ffffff;

  --dac-scrim:         rgba(20, 20, 10, 0.34);
  --dac-diepte:        0.3;

  --dac-knob:          #ffffff;
  --dac-knob-uit:      #ffffff;
  --dac-knob-schaduw:  0 1px 2px rgba(20, 20, 10, 0.30);
  --dac-spoor-aan:     82%;
  --dac-spoor-rand:    82%;

  --dac-veld:          #ffffff;
`,U=`
  :host {
    column-rule-color: var(--primary-text-color, transparent);
    color-scheme: var(--dac-scheme);
  }
  :host([dac-thema="licht"]) { ${Uu} }
`,Ue=`
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
    background: rgba(var(--dac-tint), 0.06);
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
`;function Q(a){let e=new CSSStyleSheet;return e.replaceSync(a),e}var Fu=["auto","licht","donker"],il="__domotiappLovelaceThema",Ti=a=>Fu.includes(a)?a:null;function rl(a){let e=/__domotiappLovelaceThema\s*=\s*"([a-z]+)"/.exec(String(a??""));return e?Ti(e[1]):null}var nl={white:[255,255,255,1],black:[0,0,0,1],transparent:[0,0,0,0]},Bn=(a,e=255)=>{let t=String(a).trim();if(t==="none")return 0;let n=Number.parseFloat(t);return Number.isFinite(n)?t.endsWith("%")?n/100*e:n:NaN};function qu(a){let e=String(a??"").trim().toLowerCase();if(!e)return null;if(nl[e])return[...nl[e]];let t=/^#([0-9a-f]{3,8})$/.exec(e);if(t){let r=t[1];if((r.length===3||r.length===4)&&(r=[...r].map(l=>l+l).join("")),r.length!==6&&r.length!==8)return null;let o=[0,2,4].map(l=>Number.parseInt(r.slice(l,l+2),16)),s=r.length===8?Number.parseInt(r.slice(6,8),16)/255:1;return[...o,s]}let n=/^rgba?\(([^)]+)\)$/.exec(e);if(n){let r=n[1].split(/[\s,/]+/).filter(Boolean);if(r.length<3)return null;let[o,s,l]=r.slice(0,3).map(c=>Bn(c,255)),d=r.length>3?Bn(r[3],1):1;return[o,s,l,d].every(Number.isFinite)?[o,s,l,d]:null}let i=/^color\(srgb\s+([^)]+)\)$/.exec(e);if(i){let r=i[1].split(/[\s/]+/).filter(Boolean);if(r.length<3)return null;let[o,s,l]=r.slice(0,3).map(c=>Bn(c,1)*255),d=r.length>3?Bn(r[3],1):1;return[o,s,l,d].every(Number.isFinite)?[o,s,l,d]:null}return null}var Pn=a=>{let e=Math.min(255,Math.max(0,a))/255;return e<=.04045?e/12.92:((e+.055)/1.055)**2.4},ol=([a,e,t])=>.2126*Pn(a)+.7152*Pn(e)+.0722*Pn(t);var Zu=.18;function sl({tekst:a,darkMode:e}={}){let t=qu(a);return t&&t[3]>.5?ol(t)>Zu?"donker":"licht":e===!0?"donker":e===!1?"licht":null}function ll(a,e){return a==="licht"||a==="donker"?a:e==="licht"?"licht":"donker"}var al=.33,Yu=120,Xu=48,Qu=new Set(["color_temp","white","brightness","onoff"]);function Kn(a,e,t){if(!Array.isArray(a)||a.length<3)return null;let n=a.slice(0,3).map(Number);if(!n.every(Number.isFinite))return null;if(!e)return n;let i=Math.max(...n),r=Math.min(...n);if(Qu.has(t))return null;let o=t?Xu:Yu;if(i-r<o&&i>170)return null;let s=ol(n);if(s<=al)return n;let l=al/s,d=c=>{let p=Pn(c)*l,h=p<=.0031308?p*12.92:1.055*p**(1/2.4)-.055;return Math.round(h*255)};return n.map(d)}var Oi="/api/domotiapp_lovelace/loader.js",dl="domotiapp-lovelace-verversing";function Gn(a){let e=/[?&]v=([0-9a-fA-F]+)/.exec(String(a??""));return e?e[1].toLowerCase():null}async function Ju(a){try{let e=await a(Oi,{cache:"no-store"});return e?.ok?Gn(await e.text()):null}catch{return null}}function em(){try{return globalThis.sessionStorage?.getItem(dl)??null}catch{return null}}function tm(a){try{globalThis.sessionStorage?.setItem(dl,a)}catch{return!1}return!0}function nm(a,e,t){return!a||!e?"onbekend":a===e?"actueel":t===e?"al-geprobeerd":"herladen"}function cl({eigenUrl:a,haal:e=globalThis.fetch?.bind(globalThis),herlaad:t=()=>globalThis.location?.reload(),doc:n=globalThis.document,interval:i=18e5,klok:r=setInterval}={}){let o=Gn(a);if(!o||!e)return()=>{};let s=!1,l=async()=>{if(!s&&!n?.querySelector?.("dialog[open], ha-dialog[open]")){s=!0;try{let p=await Ju(e);if(nm(o,p,em())!=="herladen"||!tm(p))return;t()}finally{s=!1}}},d=()=>n?.visibilityState==="visible"?l():void 0;n?.addEventListener?.("visibilitychange",d);let c=r(d,i);return()=>{n?.removeEventListener?.("visibilitychange",d),clearInterval(c)}}var am=5e3,im=3e5,Ri=Ti(globalThis[il]),dt=new Set,pl=0,Ci=!1,rm=!!Gn(import.meta.url),om=()=>Ri??"auto",hl=a=>a?.getAttribute?.("dac-thema")==="licht";function sm(a){try{return getComputedStyle(a).columnRuleColor}catch{return""}}var lm=a=>(a.hass??a.hass_??document.querySelector("home-assistant")?.hass)?.themes?.darkMode;function Ii(a,{alleenMeten:e=!1}={}){if(!a?.isConnected)return!1;let t=sl({tekst:sm(a),darkMode:lm(a)}),n=ll(e?"auto":om(),t);return a.getAttribute("dac-thema")===n?!1:(a.setAttribute("dac-thema",n),!0)}function dm(){for(let[a,e]of cm())Ii(a,e)&&a.themaGewisseld_?.()}var Vi=new WeakMap;function*cm(){for(let a of dt)yield[a,Vi.get(a)]}async function Hi(){if(!rm||Ci||typeof fetch!="function")return;let a=Date.now();if(!(a-pl<am)){pl=a,Ci=!0;try{let e=await fetch(Oi,{cache:"no-store"});if(!e?.ok)return;let t=rl(await e.text());if(!t||t===Ri)return;Ri=t,dm()}catch{}finally{Ci=!1}}}function F(a,e){if(dt.size>64)for(let t of dt)t.isConnected||dt.delete(t);return dt.add(a),e&&Vi.set(a,e),Ii(a,e),Hi(),()=>{dt.delete(a)}}function Wn(a){Ii(a,Vi.get(a))&&a.themaGewisseld_?.()}typeof document<"u"&&(document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&Hi()}),setInterval(()=>{dt.size&&document.visibilityState==="visible"&&Hi()},im));var Bi=null,gl=a=>{Bi=a},He=a=>String(a??"").split(".")[0],k=(a,e)=>e&&a?.states?.[e]||null,J=(a,e)=>k(a,e)?.attributes??{},ct=(a,e,t)=>t?null:J(a,e).entity_picture||null;function qn(a,e=!1){if(!a||a.state!=="on")return null;let t=a.attributes??{};return Array.isArray(t.entity_id)?null:Pi(t.rgb_color,e,t.color_mode)}function Pi(a,e=!1,t){let n=Kn(a,e,t);return n?`rgb(${n[0]},${n[1]},${n[2]})`:null}function M(a,e,t){return t||J(a,e).friendly_name||e||""}var pm=new Set(["scene","script","input_button","button","event"]),Ki=a=>pm.has(He(a));function pe(a){return!a||a.state==="unavailable"?!0:a.state==="unknown"?!Ki(a.entity_id):!1}function Z(a){if(!a)return!1;let e=a.state;if(e==="unavailable"||e==="unknown")return!1;switch(He(a.entity_id)){case"cover":return e==="open"||e==="opening";case"alarm_control_panel":return e.startsWith("armed")||e==="triggered"||e==="arming";case"climate":case"water_heater":case"humidifier":return e!=="off";case"person":case"device_tracker":return e==="home";case"media_player":return e!=="off"&&e!=="idle"&&e!=="standby";default:return e==="on"||e==="playing"||e==="active"||e==="heat"}}var hm=new Set(["light","switch","fan","input_boolean","automation","siren","humidifier","remote","water_heater"]),fl=a=>hm.has(He(a));function bl(a,e,t){if(!a||a.themes!==e.themes||a.language!==e.language)return!0;for(let n of t)if(n&&a.states?.[n]!==e.states?.[n])return!0;return!1}function Un(a,e,t={}){a.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0,cancelable:!1}))}var K=(a,e)=>Un(a,"hass-more-info",{entityId:e});function pt(a){switch(He(a)){case"light":case"switch":case"fan":case"input_boolean":case"automation":case"siren":return{action:"toggle"};case"script":case"scene":case"input_button":case"button":return{action:"toggle"};default:return{action:"more-info"}}}function um(a){switch(He(a)){case"scene":return["scene","turn_on"];case"script":return["script","turn_on"];case"input_button":return["input_button","press"];case"button":return["button","press"];case"lock":return["lock","open"];case"cover":return["cover","toggle"];case"media_player":return["media_player","media_play_pause"];default:return["homeassistant","toggle"]}}function de(a,e,t,n){if(!(!n||n.action==="none")){if(n.confirmation){let i=n.confirmation===!0?{}:n.confirmation;if(!Bi){console.warn("DomotiApp: geen bevestigingsscherm geladen; de actie is niet uitgevoerd.");return}Bi(i).then(r=>{r&&ul(a,e,t,n)});return}ul(a,e,t,n)}}function ul(a,e,t,n){switch(n.action){case"more-info":K(a,n.entity||t.entity);break;case"toggle":{let i=n.entity||t.entity;if(!i)break;let[r,o]=um(i);e.callService(r,o,{entity_id:i});break}case"perform-action":case"call-service":{let i=n.perform_action||n.service;if(!i)break;let[r,o]=i.split(".");e.callService(r,o,n.data??n.service_data??{},n.target);break}case"navigate":if(!n.navigation_path)break;history.pushState(null,"",n.navigation_path),Un(window,"location-changed",{replace:!1});break;case"url":n.url_path&&window.open(n.url_path,n.target??"_blank");break;case"assist":Un(a,"show-dialog",{dialogTag:"ha-voice-command-dialog",dialogImport:()=>{},dialogParams:{}});break;case"fire-dom-event":Un(a,"ll-custom",n);break;default:break}}function B(a,{onTap:e,onHold:t,onDouble:n}){let o=0,s=0,l=null,d=p=>{p.button!=null&&p.button!==0||(o=Date.now())},c=()=>{let p=o?Date.now()-o:0;if(o=0,t&&p>=500){navigator.vibrate?.(18),t();return}if(!n){e?.();return}if(s++,s===1){l=setTimeout(()=>{s=0,e?.()},260);return}clearTimeout(l),s=0,n()};return a.addEventListener("pointerdown",d),a.addEventListener("click",c),a.addEventListener("contextmenu",p=>p.preventDefault()),()=>{clearTimeout(l),a.removeEventListener("pointerdown",d),a.removeEventListener("click",c)}}function te(a,e){if(!e)return"";let t=He(e.entity_id),n=e.attributes.device_class;return a.formatEntityState?.(e)??a.localize?.(`component.${t}.entity_component.${n??"_"}.state.${e.state}`)??a.localize?.(`component.${t}.entity_component._.state.${e.state}`)??e.state}function G(a,e,t){let n=Number(e);return Number.isFinite(n)?n.toLocaleString(a?.locale?.language??"nl",{minimumFractionDigits:t??0,maximumFractionDigits:t??0}):"--"}var ml=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],vl=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"],Fn=(a=new Date)=>new Date(a.getFullYear(),a.getMonth(),a.getDate()),Et=(a,e)=>Math.round((Fn(e)-Fn(a))/864e5);function we(a){if(!a)return null;if(a instanceof Date)return Number.isNaN(+a)?null:a;let e=String(a).trim(),t=e.match(/(?:^|\D)(\d{1,2})[-./](\d{1,2})[-./](\d{4})(?!\d)/);if(t)return new Date(+t[3],+t[2]-1,+t[1]);if(t=e.match(/(?:^|\D)(\d{4})-(\d{1,2})-(\d{1,2})(?!\d)/),t)return new Date(+t[1],+t[2]-1,+t[3]);let n=new Date(e);return Number.isNaN(+n)?null:n}function At(a,e=new Date){if(!a)return"";let t=Et(e,a);return t<0?`${Math.abs(t)} dagen geleden`:t===0?"vandaag":t===1?"morgen":t===2?"overmorgen":t<=6?ml[a.getDay()]:`${ml[a.getDay()].slice(0,2)} ${a.getDate()} ${vl[a.getMonth()]}`}var Zn=a=>a?`${a.getDate()} ${vl[a.getMonth()]}`:"";function mm(a){let e=Math.max(1,Math.ceil((a+8)/64));return e*56+(e-1)*8}function gm(a){if(!a)return 0;let e=getComputedStyle(a),t=[...a.children].filter(r=>r.getBoundingClientRect().height>0);if(!t.length)return 0;let n=parseFloat(e.rowGap)||0;return t.reduce((r,o)=>r+o.getBoundingClientRect().height,0)+n*(t.length-1)+parseFloat(e.paddingTop)+parseFloat(e.paddingBottom)+parseFloat(e.borderTopWidth)+parseFloat(e.borderBottomWidth)}function R(a,e=4){if(!a)return;let t=gm(a);if(!t){e>0&&requestAnimationFrame(()=>R(a,e-1));return}let n=`${xm(a,mm(t))}px`;a.style.getPropertyValue("--dac-raster")!==n&&(a.style.setProperty("--dac-raster",n),fm(a)&&bm(a))}var Wi=new WeakMap;function St(a,e=1){let t=kl(a)??e;return a&&typeof a=="object"&&Wi.set(a,t),t}function fm(a){if(!Wi.has(a))return!1;let e=kl(a);return e!==null&&e!==Wi.get(a)}function bm(a){let e=a?.getRootNode?.()?.host;typeof e?.dispatchEvent=="function"&&e.dispatchEvent(new CustomEvent("card-updated",{bubbles:!0,composed:!0}))}var Gi=new WeakMap,vm=12,km=3;function xm(a,e){let t=Gi.get(a)??{rij:[],vast:null};if(t.vast!==null){if(t.vast.paar.includes(e))return t.vast.waarde;t.vast=null,t.rij=[]}let n=[...t.rij,e].slice(-vm),i=[...new Set(n)],r=n.reduce((s,l,d)=>d>0&&l!==n[d-1]?s+1:s,0);if(i.length===2&&r>=km){let s=Math.max(...i);return Gi.set(a,{rij:n,vast:{paar:i,waarde:s}}),s}return Gi.set(a,{rij:n,vast:null}),e}function kl(a){let e=parseFloat(a?.style?.getPropertyValue?.("--dac-raster")??"");return!Number.isFinite(e)||e<=0?null:Math.max(1,Math.round((e+8)/64))}function V(a){if(!a||typeof ResizeObserver>"u")return()=>{};let e=new ResizeObserver(()=>{for(let t of a.children)e.observe(t);R(a)});e.observe(a);for(let t of a.children)e.observe(t);return R(a),()=>e.disconnect()}var wm="home-assistant";function xl({leesRegistry:a,definities:e,waarschuw:t=()=>{},plan:n=(l,d)=>setTimeout(l,d),nu:i=()=>Date.now(),marker:r=wm,intervalMs:o=20,maxWachtMs:s=1e4}){let l=i();function d(){let h=a();if(!h)return!1;for(let[u,m]of e)try{h.get(u)||h.define(u,m)}catch(b){t(`kon ${u} niet registreren: ${b&&b.message}`)}return!0}function c(){let h=a();return!h||!h.get(r)?!1:d()}if(c())return!0;let p=()=>{if(!c()){if(i()-l>=s){t(`${r} is na ${s} ms niet verschenen; de kaart wordt alsnog geregistreerd`),d();return}n(p,o)}};return n(p,o),!1}var wl=[];function H(a,e){wl.push([a,e])}function Mt({type:a,name:e,description:t,preview:n=!0,documentationURL:i}){window.customCards=window.customCards??[],!window.customCards.some(r=>r.type===a)&&window.customCards.push({type:a,name:e??a,description:t??"",preview:n,documentationURL:i??"https://github.com/Sven2410/domotiapp-lovelace"})}function _l({type:a,name:e,description:t,preview:n=!0,documentationURL:i}){window.customBadges=window.customBadges??[],!window.customBadges.some(r=>r.type===a)&&window.customBadges.push({type:a,name:e??a,description:t??"",preview:n,documentationURL:i??"https://github.com/Sven2410/domotiapp-lovelace"})}function yl(a=()=>{}){xl({leesRegistry:()=>globalThis.customElements,definities:wl,waarschuw:a})}var _m=`
  :host {
    ${W}
    display: block;
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  :host([hidden]) { display: none; }
  ${U}
`,E={accent:"var(--dac-accent-hi)",solar:"var(--dac-solar)",house:"var(--dac-house)",water:"var(--dac-grid-in)",magenta:"var(--dac-grid-out)",pink:"var(--dac-device-1)",teal:"var(--dac-device-2)",lit:"var(--dac-lit)",good:"var(--dac-good)",warn:"var(--dac-warn)",bad:"var(--dac-bad)",neutral:"var(--dac-ink-3)"},zl={accent:"Accent",solar:"Oranje",house:"Blauw",water:"Lichtblauw",magenta:"Magenta",pink:"Roze",teal:"Groenblauw",lit:"Lampgeel",good:"Goed",warn:"Let op",bad:"Kritiek",neutral:"Neutraal"},_=a=>String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),ee=(a,e="accent")=>E[a]??(a&&/[#(]|^var/.test(a)?a:E[e]),C=Symbol("incomplete"),ym=a=>`
  <div class="needs">
    <span class="mark"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6"/>
      <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>
    </svg></span>
    <span><b>Nog niets gekozen</b><span>${a}</span></span>
  </div>`,jm=56,jl=8,Ie=a=>Math.max(1,Math.ceil((a+jl)/(jm+jl))),S=class extends HTMLElement{static get styleSheets_(){return Object.hasOwn(this,"sheets_")||(this.sheets_=[Q(_m+Ue+this.css)]),this.sheets_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=new.target.styleSheets_,this.built_=!1,this.wired_=!1,this.teardown_=[],this.bewaakFocusRing_()}bewaakFocusRing_(){let e=0,t=0;this.shadowRoot.addEventListener("pointerdown",()=>{e=Date.now()},!0),this.shadowRoot.addEventListener("keydown",()=>{t=Date.now()},!0),this.shadowRoot.addEventListener("focusin",n=>{if(t>=e)return;let i=n.target;!i?.matches||i.matches("input, textarea, select, [contenteditable]")||requestAnimationFrame(()=>{t>=e||i.isConnected&&i.matches(":focus-visible")&&i.blur?.()})},!0)}setConfig(e){let t=this.validate(e??{});this.config=t,this.built_&&(this.destroy_(),this.shadowRoot.replaceChildren(),this.built_=!1,this.wired_=!1),this.isConnected&&this.build_()}set hass(e){let t=this.hass_;if(this.hass_=e,t&&t.themes!==e?.themes&&this.themaLos_&&Wn(this),!!this.config){if(!this.built_){this.build_();return}this.config[C]||bl(t,e,this.watched())&&this.paint()}}get hass(){return this.hass_}connectedCallback(){if(this.constructor.volgtThema&&!this.themaLos_){let e=this.licht_;this.themaLos_=F(this),this.built_&&this.licht_!==e&&this.themaGewisseld_()}if(this.config){if(!this.built_){this.build_();return}this.config[C]||this.wired_||(this.wire(),this.wired_=!0,this.hass_&&this.paint())}}disconnectedCallback(){this.themaLos_?.(),this.themaLos_=null,this.destroy_(),this.wired_=!1}get licht_(){return hl(this)}themaGewisseld_(){this.built_&&this.wired_&&this.hass_&&!this.config?.[C]&&this.paint()}validate(e){return e}watched(){return this.config?.entity?[this.config.entity]:[]}template(){return""}wire(){}paint(){}build_(){let e=document.createElement("template"),t=this.config?.[C];if(e.innerHTML=t?ym(t):this.template(),this.shadowRoot.appendChild(e.content),this.built_=!0,t){this.teardown_.push(V(this.$(".needs")));return}this.wire(),this.wired_=!0,this.hass_&&this.paint()}destroy_(){for(let e of this.teardown_)try{e()}catch{}this.teardown_=[]}on(e,t,n,i){e&&(e.addEventListener(t,n,i),this.teardown_.push(()=>e.removeEventListener(t,n,i)))}$(e){return this.shadowRoot.querySelector(e)}$$(e){return[...this.shadowRoot.querySelectorAll(e)]}text(e,t){let n=typeof e=="string"?this.$(e):e;n&&n.textContent!==String(t)&&(n.textContent=t)}getCardSize(){return 1}minRijen_(e=".card",t=1){return St(this.$(e),t)}};j(S,"css",""),j(S,"volgtThema",!0);function D(a,e,{name:t,description:n,preview:i=!0}={}){H(a,e),Mt({type:a,name:t,description:n,preview:i})}function Yn(a,e,{name:t,description:n,preview:i=!0}={}){H(a,e),_l({type:a,name:t,description:n,preview:i})}function O(a,e){H(a,e)}var g=(a,e="none")=>`<svg class="icon" viewBox="0 0 24 24" fill="${e}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${a}</svg>`,N={house:g(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
    <path d="M5.4 12.9V20a.9.9 0 0 0 .9.9h11.4a.9.9 0 0 0 .9-.9v-7.1"/>
    <path d="M9.8 20.9v-5.2h4.4v5.2"/>`),floorB:g(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M9.4 17.8V14h2.4a1.9 1.9 0 0 1 0 3.8Z"/>`),floor1:g(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M10.6 15.2 12 14v3.9"/>`),floor2:g(`<path d="M3.4 10.6 12 4.2l8.6 6.4"/>
    <path d="M5.6 12.2v7.6a.9.9 0 0 0 .9.9h11a.9.9 0 0 0 .9-.9v-7.6"/>
    <path d="M10.4 14.8a1.6 1.6 0 0 1 3.1.5c0 1.4-3.1 1.8-3.1 3.5h3.2"/>`),garage:g(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M8.2 20.4v-5.6h7.6v5.6M8.2 17.6h7.6"/>`),garageOpen:g(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M7.6 14.4h8.8M7.6 12.4h8.8"/>`),garageClosed:g(`<path d="M3.4 10.8 12 5.2l8.6 5.6"/>
    <path d="M5.4 20.4v-9.1h13.2v9.1"/>
    <path d="M7.6 13.2h8.8M7.6 15.4h8.8M7.6 17.6h8.8M7.6 19.8h8.8"/>`),bed:g(`<path d="M3.2 20.2V8.4"/>
    <path d="M3.2 16.4h17.6v3.8"/>
    <path d="M20.8 16.4v-3.1a2.3 2.3 0 0 0-2.3-2.3H9.9v5.4"/>
    <circle cx="6.8" cy="12.7" r="2"/>`),bedDouble:g(`<path d="M2.4 20.4V8.2M21.6 20.4V8.2"/>
    <path d="M2.4 16.6h19.2v3.8"/>
    <path d="M21.6 16.6v-2.9a2.2 2.2 0 0 0-2.2-2.2H4.6a2.2 2.2 0 0 0-2.2 2.2v2.9"/>
    <path d="M12 11.5v5.1"/>
    <path d="M5.2 11.5V9.9a.9.9 0 0 1 .9-.9h3.6a.9.9 0 0 1 .9.9v1.6"/>
    <path d="M13.4 11.5V9.9a.9.9 0 0 1 .9-.9h3.6a.9.9 0 0 1 .9.9v1.6"/>`),hanger:g(`<path d="M12 8.4V7.2a2.1 2.1 0 1 1 2.1-2.1"/>
    <path d="M12 8.4 3.2 15.6a1.4 1.4 0 0 0 .9 2.5h15.8a1.4 1.4 0 0 0 .9-2.5L12 8.4Z"/>`),wardrobe:g(`<rect x="4.2" y="2.8" width="15.6" height="17" rx="1.8"/>
    <path d="M12 2.8v17"/>
    <path d="M10.2 10.6v2.4M13.8 10.6v2.4"/>
    <path d="M6.6 19.8v1.6M17.4 19.8v1.6"/>`),sofa:g(`<path d="M5.2 11.6V8.4a1.9 1.9 0 0 1 1.9-1.9h9.8a1.9 1.9 0 0 1 1.9 1.9v3.2"/>
    <path d="M3 17.4v-4.1a2 2 0 0 1 4 0v1.5h10v-1.5a2 2 0 0 1 4 0v4.1z"/>
    <path d="M5.8 17.4v2.2M18.2 17.4v2.2"/>`),kitchen:g(`<path d="M4.4 10.2h15.2v5.2a4 4 0 0 1-4 4H8.4a4 4 0 0 1-4-4z"/>
    <path d="M2.4 12.2h2M19.6 12.2h2"/>
    <path d="M9.4 7.4c0-1.1 1.2-1.1 1.2-2.2M13.4 7.4c0-1.1 1.2-1.1 1.2-2.2"/>`),shower:g(`<path d="M4.6 20.6V7.2a2.6 2.6 0 0 1 2.6-2.6h5.2A2.6 2.6 0 0 1 15 7.2v1.6"/>
    <path d="M11 12.4a4 4 0 0 1 8 0z"/>
    <path d="M12.8 15.4v1.6M15 15.4v1.6M17.2 15.4v1.6M13.9 18.8v1.6M16.1 18.8v1.6"/>`),toilet:g(`<path d="M7 3.6h3.6v4.8H7z"/>
    <path d="M5.2 8.4h11.6l-1 5.2a4.6 4.6 0 0 1-4.5 3.7h-1a4.6 4.6 0 0 1-4.5-3.7z"/>
    <path d="M9.2 17.4v2.8h4.2v-2.8M7.6 20.2h7.4"/>`),desk:g(`<rect x="4.6" y="4.2" width="14.8" height="9.4" rx="1.8"/>
    <path d="M10.4 13.6v2.6h3.2v-2.6"/>
    <path d="M2.8 18.4h18.4"/>
    <path d="M5.2 18.4v2.4M18.8 18.4v2.4"/>`),speelkamer:g(`<circle cx="6.8" cy="7.6" r="2.8"/>
    <circle cx="17.2" cy="7.6" r="2.8"/>
    <circle cx="12" cy="13.8" r="5.8"/>
    <path d="M9.8 12.4v.1M14.2 12.4v.1"/>
    <circle cx="12" cy="15.6" r="1.9"/>
    <path d="M12 14.7v.1"/>`),stairs:g(`<path d="M3.6 20.4V16h4.3v-4.3h4.3V7.4h4.3V3.2h4.1"/>
    <path d="M3.6 20.4h16.8"/>`),parasol:g(`<path d="M12 20.8V9.4"/>
    <path d="M2.8 9.4a9.2 9.2 0 0 1 18.4 0z"/>
    <path d="M6.6 9.4C6.6 5.9 9 3 12 3s5.4 2.9 5.4 6.4"/>
    <path d="M12 20.8a2.2 2.2 0 0 0 2.2-2.2"/>`),fence:g(`<path d="M4.4 20.4V8.6L6.8 6l2.4 2.6v11.8M14.8 20.4V8.6L17.2 6l2.4 2.6v11.8"/>
    <path d="M2.6 11.4h18.8M2.6 15.4h18.8"/>
    <path d="M9.2 11.4v4M14.8 11.4v4"/>`),tree:g(`<path d="M12 3 7.6 9.4h8.8z"/>
    <path d="M12 7.6 5.8 16.2h12.4z"/>
    <path d="M12 16.2v4.4"/>
    <path d="M9.4 20.6h5.2"/>`),shutter:g(`<path d="M3.6 4.2h16.8M5.2 4.2v13.4M18.8 4.2v13.4"/>
    <path d="M5.2 7.6h13.6M5.2 11h13.6M5.2 14.4h13.6M5.2 17.6h13.6"/>`),shutterOpen:g(`<path d="M3.6 4.2h16.8M5.2 4.2v15.6M18.8 4.2v15.6"/>
    <path d="M5.2 6.6h13.6M5.2 8.6h13.6"/>`),gate:g(`<path d="M2.6 20.6h18.8"/>
    <path d="M4.2 20.6V6.8M19.8 20.6V6.8"/>
    <path d="M5.8 9.6h12.4M5.8 16.6h12.4"/>
    <path d="M8.4 9.6v7M15.6 9.6v7"/>
    <path d="M11.4 9.6v7M12.6 9.6v7"/>`),gateOpen:g(`<path d="M2.6 20.6h18.8"/>
    <path d="M4.2 20.6V6.8M19.8 20.6V6.8"/>
    <path d="M4.2 9.6h3.6M4.2 16.6h3.6"/>
    <path d="M7.8 9.6v7"/>
    <path d="M16.2 9.6h3.6M16.2 16.6h3.6"/>
    <path d="M16.2 9.6v7"/>`),eettafel:g(`<path d="M3 9.6h18"/>
    <path d="M5.4 9.6v6.2M18.6 9.6v6.2"/>
    <path d="M7.4 12.4h9.2"/>
    <path d="M4.2 20.4v-3.2a1.4 1.4 0 0 1 1.4-1.4h1.2a1.4 1.4 0 0 1 1.4 1.4v3.2"/>
    <path d="M15.8 20.4v-3.2a1.4 1.4 0 0 1 1.4-1.4h1.2a1.4 1.4 0 0 1 1.4 1.4v3.2"/>`),veranda:g(`<path d="M2.2 9.4 12 4.2l9.8 5.2"/>
    <path d="M4.6 9.4v10.4M19.4 9.4v10.4"/>
    <path d="M2.2 19.8h19.6"/>
    <path d="M4.6 12.2h14.8"/>`),pollenradar:g(`<circle cx="12" cy="12" r="2.2"/>
    <path d="M12 9.8V7.4M12 14.2v2.4M9.8 12H7.4M14.2 12h2.4"/>
    <path d="M6.4 6.4a7.9 7.9 0 0 0 0 11.2M17.6 17.6a7.9 7.9 0 0 0 0-11.2"/>
    <path d="M3.6 3.6a11.9 11.9 0 0 0 0 16.8M20.4 20.4a11.9 11.9 0 0 0 0-16.8"/>`),gras:g(`<path d="M3 20.4h18"/>
    <path d="M12 20.4V8.6"/>
    <path d="M12 12.4c-1.4-.8-2.2-2.2-2.2-4 1.5.2 2.2 1.6 2.2 4Z"/>
    <path d="M12 9.6c1.4-.8 2.2-2.2 2.2-4-1.5.2-2.2 1.6-2.2 4Z"/>
    <path d="M7 20.4c0-4 .8-6.6 2.4-8M17 20.4c0-4-.8-6.6-2.4-8"/>`),kruiden:g(`<path d="M12 20.8v-6.4"/>
    <path d="M12 14.4c0-3.4 1.8-5.6 5.4-6.6.4 3.8-1.6 6.4-5.4 6.6Z"/>
    <path d="M12 14.4c0-2.8-1.5-4.6-4.4-5.4-.3 3.1 1.3 5.2 4.4 5.4Z"/>
    <path d="M12 10.6c0-2.2 1-3.8 3-4.6"/>`),circulatiepomp:g(`<circle cx="12" cy="13.6" r="5.4"/>
    <path d="M12 10.4a3.2 3.2 0 0 1 3.2 3.2"/>
    <path d="M9.4 8.2V5.2a.8.8 0 0 1 .8-.8h3.6a.8.8 0 0 1 .8.8v3"/>
    <path d="M2.6 13.6h4M17.4 13.6h4"/>
    <path d="M12 13.6h.02"/>`),awning:g(`<path d="M2.8 11.4 6.2 5h11.6l3.4 6.4z"/>
    <path d="M2.8 11.4c1.5 1.7 3 1.7 4.5 0s3-1.7 4.5 0 3 1.7 4.5 0 3-1.7 4.5 0"/>
    <path d="M12 14.6v4.8"/>`),arrowUp:g('<path d="M12 19.4V5M6.4 10.6 12 5l5.6 5.6"/>'),arrowDown:g('<path d="M12 4.6V19M17.6 13.4 12 19l-5.6-5.6"/>'),stop:g('<rect x="6.4" y="6.4" width="11.2" height="11.2" rx="1.8"/>'),bulb:g(`<path d="M9.4 18.4h5.2M10.4 21.2h3.2"/>
    <path d="M12 2.9a6.2 6.2 0 0 0-3.6 11.2c.5.4.8 1 .8 1.7v.4h5.6v-.4c0-.7.3-1.3.8-1.7A6.2 6.2 0 0 0 12 2.9Z"/>`),bulbGroup:g(`<path d="M7.6 15.6h4M8.2 17.8h2.8"/>
    <path d="M9.6 3.4a4.8 4.8 0 0 0-2.8 8.7c.4.3.6.8.6 1.3v.5h4.4v-.5c0-.5.2-1 .6-1.3a4.8 4.8 0 0 0-2.8-8.7Z"/>
    <path d="M16 8.4a4.4 4.4 0 0 1 2.4 8c-.3.3-.5.7-.5 1.1v.4h-3.8"/>
    <path d="M15.4 20.6h2.4"/>`),switchOn:g(`<rect x="2.8" y="7.4" width="18.4" height="9.2" rx="4.6"/>
    <circle cx="16.6" cy="12" r="2.6" fill="currentColor" stroke="none"/>`),person:g(`<circle cx="12" cy="7.6" r="3.6"/>
    <path d="M4.8 20.4v-1.2a5 5 0 0 1 5-5h4.4a5 5 0 0 1 5 5v1.2"/>`),people:g(`<circle cx="9.4" cy="8.2" r="3.2"/>
    <path d="M3.4 20v-1a4.6 4.6 0 0 1 4.6-4.6h2.8A4.6 4.6 0 0 1 15.4 19v1"/>
    <path d="M16.2 5.3a3.2 3.2 0 0 1 0 5.9"/>
    <path d="M17.6 14.6a4.6 4.6 0 0 1 3 4.3V20"/>`),away:g(`<circle cx="10.4" cy="7.6" r="3.4"/>
    <path d="M3.6 20.4v-1.2a4.8 4.8 0 0 1 4.8-4.8h2.6"/>
    <path d="M14.6 17.4h6M18 14.8l2.6 2.6-2.6 2.6"/>`),dier:g(`<circle cx="6.6" cy="10.2" r="2.3"/>
    <circle cx="11" cy="6.4" r="2.4"/>
    <circle cx="15.6" cy="6.4" r="2.4"/>
    <circle cx="18.6" cy="10.4" r="2.3"/>
    <path d="M12.6 14.4c2.9 0 5 2 5 4.1 0 1.6-1.3 2.6-2.8 2.6-1 0-1.5-.4-2.2-.4s-1.2.4-2.2.4c-1.5 0-2.8-1-2.8-2.6 0-2.1 2.1-4.1 5-4.1Z"/>`),bin:g(`<path d="M3.6 6.8h16.8"/>
    <path d="M9.4 6.8V4.6a.9.9 0 0 1 .9-.9h3.4a.9.9 0 0 1 .9.9v2.2"/>
    <path d="m5.9 6.8 1 12.5a1 1 0 0 0 1 .9h8.2a1 1 0 0 0 1-.9l1-12.5"/>
    <path d="M10.2 10.6v5.8M13.8 10.6v5.8"/>`),binWheeled:g(`<path d="M5.6 7.4h12.8l-1 10.6a1 1 0 0 1-1 .9H7.6a1 1 0 0 1-1-.9z"/>
    <path d="M4.4 7.4h15.2M9.6 7.4V5.2h4.8v2.2"/>
    <circle cx="8.6" cy="20.4" r="1.3"/><circle cx="15.4" cy="20.4" r="1.3"/>`),calendar:g(`<rect x="3.6" y="5.4" width="16.8" height="15" rx="2"/>
    <path d="M3.6 10h16.8M8.4 3.4v3.6M15.6 3.4v3.6"/>`),sun:g(`<circle cx="12" cy="12" r="4.1"/>
    <path d="M12 2.4v2.3M12 19.3v2.3M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.4 12h2.3M19.3 12h2.3M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>`),cloud:g('<path d="M7.2 18.4a4.2 4.2 0 0 1-.5-8.4 5.6 5.6 0 0 1 10.8-1.2 3.9 3.9 0 0 1 .6 7.7z"/>'),cloudSun:g(`<path d="M6.8 8.2a3.4 3.4 0 1 1 4.6 3.2"/>
    <path d="M5 4.6 6.1 5.7M3.2 9.2h1.6M9.4 4.6 8.3 5.7M6.8 1.9v1.5"/>
    <path d="M9.4 19.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10 1 3.6 3.6 0 0 1 .5 6.8z"/>`),rain:g(`<path d="M7.4 15.4a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M9 18.2 8.2 20.6M12.4 18.2l-.8 2.4M15.8 18.2l-.8 2.4"/>`),snow:g(`<path d="M7.4 14.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M9 17.6v3M7.6 18.4l2.8 1.4M10.4 18.4l-2.8 1.4"/>
    <path d="M15 17.6v3M13.6 18.4l2.8 1.4M16.4 18.4l-2.8 1.4"/>`),fog:g(`<path d="M7.4 12.6a3.9 3.9 0 0 1-.5-7.8 5.2 5.2 0 0 1 10-1.1 3.6 3.6 0 0 1 .6 7.1"/>
    <path d="M4.4 16h15.2M6.4 19.4h11.2"/>`),wind:g(`<path d="M3.4 8.4h9.4a2.7 2.7 0 1 0-2.7-2.7"/>
    <path d="M3.4 12.6h13.2a2.7 2.7 0 1 1-2.7 2.7"/>
    <path d="M3.4 16.8h6.2a2.5 2.5 0 1 1-2.5 2.5"/>`),drop:g('<path d="M12 3.4s5.6 6.1 5.6 9.8a5.6 5.6 0 0 1-11.2 0C6.4 9.5 12 3.4 12 3.4Z"/>'),humidity:g(`<path d="M12 3.4s5.6 6.1 5.6 9.8a5.6 5.6 0 0 1-11.2 0C6.4 9.5 12 3.4 12 3.4Z"/>
    <path d="M10.1 16.1 13.9 12"/>
    <circle cx="10.2" cy="12.3" r=".95"/>
    <circle cx="13.8" cy="15.8" r=".95"/>`),lux:g(`<circle cx="12" cy="6.9" r="2.8"/>
    <path d="M12 1.9v1.3M16.4 3.5l-.9.9M18.4 8.1h-1.3M5.6 8.1H4.3M7.6 4.4l.9.9"/>
    <path d="M8.6 14.1 9.7 12M12 14.5v-2.1M15.4 14.1 14.3 12"/>
    <path d="M5.6 16.2h12.8a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H5.6a1.2 1.2 0 0 1-1.2-1.2v-2.4a1.2 1.2 0 0 1 1.2-1.2Z"/>`),windSpeed:g(`<path d="M3.6 6.6h7.6a2.3 2.3 0 1 0-2.3-2.3"/>
    <path d="M3.6 10.6h4.8"/>
    <path d="M4.6 20.2a7.4 7.4 0 0 1 14.8 0"/>
    <path d="M12 20.2 16.2 15"/>
    <circle cx="12" cy="20.2" r=".9"/>`),weatherCode:g(`<path d="M7.6 14.4a3.7 3.7 0 0 1-.5-7.4 4.9 4.9 0 0 1 9.5-1 3.4 3.4 0 0 1 .5 6.7"/>
    <path d="M10.6 16.4 9.8 21M15 16.4l-.8 4.6"/>
    <path d="M8.6 17.9h7.2M8.2 19.6h7.2"/>`),forecast:g(`<path d="M7.4 11.8a3.6 3.6 0 0 1-.4-7.2 4.8 4.8 0 0 1 9.3-1 3.3 3.3 0 0 1 .5 6.5"/>
    <path d="m3.8 20.4 4.2-4.1 3 2.6 4.5-5.1"/>
    <path d="M15.9 12.8h4.3v4.3"/>`),rainfall:g(`<path d="M7.6 2.6 6.7 4.8M12 2.2l-.9 2.2M16.4 2.6l-.9 2.2"/>
    <path d="M9.2 7.4h5.6a1 1 0 0 1 1 1v10.8a2.4 2.4 0 0 1-2.4 2.4h-2.8a2.4 2.4 0 0 1-2.4-2.4V8.4a1 1 0 0 1 1-1Z"/>
    <path d="M9.2 11.8h2.1M9.2 14.8h2.1M9.2 17.8h2.1"/>`),weatherStation:g(`<path d="M12 8.2v12.4"/>
    <path d="M8.2 20.6h7.6"/>
    <circle cx="12" cy="6.4" r="1.1"/>
    <path d="M10.9 6.4H7.6a1.7 1.7 0 1 0 1.7 1.7"/>
    <path d="M13.1 6.4h3.3a1.7 1.7 0 1 1-1.7-1.7"/>
    <path d="M9.6 12.6h4.8M9.6 16h4.8"/>`),rainRadar:g(`<circle cx="12" cy="12" r="8.6"/>
    <circle cx="12" cy="12" r="4.3"/>
    <path d="M12 12 18.1 7.9"/>
    <circle cx="12" cy="12" r=".9"/>
    <path d="M8.6 16.2l-.8 1.9M11.4 17l-.8 1.9M14.2 16.2l-.8 1.9"/>`),uv:g(`<circle cx="12" cy="11.4" r="3.4"/>
    <path d="M12 3.6v1.8M12 17.4v1.6M4.6 11.4h1.8M17.6 11.4h1.8M6.6 6l1.3 1.3M16.1 15.5l1.3 1.3M6.6 16.8l1.3-1.3M16.1 7.3l1.3-1.3"/>
    <path d="M8.4 21.4h7.2"/>`),sunset:g(`<path d="M3.4 19.6h17.2M6.6 16.2a5.4 5.4 0 0 1 10.8 0"/>
    <path d="M12 3.2v3.4M5.2 6.6l1.8 1.8M18.8 6.6 17 8.4"/>`),sunrise:g(`<path d="M3.4 19.6h17.2M6.6 16.2a5.4 5.4 0 0 1 10.8 0"/>
    <path d="M12 8.2V3.4M9.4 5.8 12 3.2l2.6 2.6"/>`),thermo:g(`<path d="M14.2 14.6V5.6a2.2 2.2 0 1 0-4.4 0v9a4.2 4.2 0 1 0 4.4 0Z"/>
    <path d="M12 9.4v5.8"/>`),shield:g(`<path d="M12 3.2 4.8 5.9v5.5c0 4.4 3 8 7.2 9.4 4.2-1.4 7.2-5 7.2-9.4V5.9z"/>
    <path d="m9.1 12 2 2 3.8-4"/>`),alarmOff:g(`<path d="M12 3.2 4.8 5.9v5.5c0 4.4 3 8 7.2 9.4 4.2-1.4 7.2-5 7.2-9.4V5.9z"/>
    <path d="M5.6 4.3 18.4 20.1"/>`),alarmPartial:g(`<path d="M12 3.2 4.8 5.9v5.5c0 4.4 3 8 7.2 9.4 4.2-1.4 7.2-5 7.2-9.4V5.9z"/>
    <path d="M9 13.2 12 10.7l3 2.5"/>
    <path d="M10 12.9v3.6h4v-3.6"/>`),alarmOn:g(`<path d="M12 3.2 4.8 5.9v5.5c0 4.4 3 8 7.2 9.4 4.2-1.4 7.2-5 7.2-9.4V5.9z"/>
    <rect x="9.4" y="11.9" width="5.2" height="4.4" rx="1.1"/>
    <path d="M10.6 11.9v-1.3a1.4 1.4 0 0 1 2.8 0v1.3"/>`),bolt:g('<path d="M13.4 2.6 5.2 13.6h5.6L10.4 21.4l8.4-11.2h-5.6z"/>'),wifi:g(`<path d="M4.2 9.2a11.4 11.4 0 0 1 15.6 0"/>
    <path d="M7.4 12.6a6.9 6.9 0 0 1 9.2 0"/>
    <path d="M10.4 15.9a2.6 2.6 0 0 1 3.2 0"/>
    <circle cx="12" cy="19" r="1.1"/>`),smokeDetector:g(`<path d="M3 4.6h18"/>
    <path d="M6 4.6h12v5.4a2.6 2.6 0 0 1-2.6 2.6H8.6A2.6 2.6 0 0 1 6 10V4.6Z"/>
    <path d="M8.8 8h6.4"/>
    <circle cx="12" cy="10.2" r=".95" fill="currentColor" stroke="none"/>
    <path d="M8.8 16c1.5-1.3 2.8.5 4.3-.8M9.4 19.4c1.5-1.3 2.8.5 4.3-.8"/>`),co:g(`<path d="M10.6 9.2A3.4 3.4 0 1 0 10.6 14.8"/>
    <circle cx="16.2" cy="12" r="3.2"/>`),smoke:g(`<path d="M6.6 20.4c0-2.2 2.5-2.2 2.5-4.4S6.6 13.8 6.6 11.6 9.1 9.4 9.1 7.2"/>
    <path d="M12.7 20.4c0-2 2.2-2 2.2-4s-2.2-2-2.2-4 2.2-2 2.2-4"/>
    <path d="M18.3 20.4c0-1.8 1.9-1.8 1.9-3.6s-1.9-1.8-1.9-3.6"/>`),star:g('<path d="m12 3.6 2.5 5.1 5.6.8-4 3.9.9 5.6L12 16.4l-5 2.6.9-5.6-4-3.9 5.6-.8z"/>'),moon:g('<path d="M20.4 14.3A8.6 8.6 0 0 1 9.7 3.6a8.8 8.8 0 1 0 10.7 10.7Z"/>'),radio:g(`<rect x="2.8" y="8.4" width="18.4" height="11.4" rx="2"/>
    <path d="m7.4 8.4 9.8-4.2"/>
    <circle cx="15.8" cy="14.1" r="2.9"/>
    <path d="M6.2 12.2h4.4M6.2 16h4.4"/>`),play:g('<path d="M8.6 5.8 18.4 12l-9.8 6.2z"/>'),pause:g('<path d="M9.6 5.8v12.4M14.4 5.8v12.4"/>'),next:g('<path d="m6.4 6.4 8.2 5.6-8.2 5.6z"/><path d="M17.6 6.2v11.6"/>'),prev:g('<path d="m17.6 6.4-8.2 5.6 8.2 5.6z"/><path d="M6.4 6.2v11.6"/>'),volume:g(`<path d="M4.4 9.4h3.2L12 5.9v12.2L7.6 14.6H4.4z"/>
    <path d="M15.4 9.6a3.4 3.4 0 0 1 0 4.8"/>
    <path d="M17.9 7.1a7 7 0 0 1 0 9.8"/>`),volumeMute:g(`<path d="M4.4 9.4h3.2L12 5.9v12.2L7.6 14.6H4.4z"/>
    <path d="m15.8 9.8 4.4 4.4M20.2 9.8l-4.4 4.4"/>`),search:g('<circle cx="10.6" cy="10.6" r="6.2"/><path d="m15.2 15.2 4.4 4.4"/>'),shuffle:g(`<path d="M3.6 7.6h3c1.2 0 2.3.6 3 1.6l4.2 5.6c.7 1 1.8 1.6 3 1.6h2.4"/>
    <path d="M3.6 16.4h3c1.2 0 2.3-.6 3-1.6"/>
    <path d="M13.8 9.2c.7-1 1.8-1.6 3-1.6h2.4"/>
    <path d="m17 5.4 2.2 2.2-2.2 2.2"/><path d="m17 14.2 2.2 2.2-2.2 2.2"/>`),repeat:g(`<path d="M7.4 7.4h9.2a2.6 2.6 0 0 1 2.6 2.6v1.2"/>
    <path d="m9.6 5.2-2.2 2.2 2.2 2.2"/>
    <path d="M16.6 16.6H7.4a2.6 2.6 0 0 1-2.6-2.6v-1.2"/>
    <path d="m14.4 18.8 2.2-2.2-2.2-2.2"/>`),repeatOne:g(`<path d="M7.4 7.4h9.2a2.6 2.6 0 0 1 2.6 2.6v1.2"/>
    <path d="m9.6 5.2-2.2 2.2 2.2 2.2"/>
    <path d="M16.6 16.6H7.4a2.6 2.6 0 0 1-2.6-2.6v-1.2"/>
    <path d="m14.4 18.8 2.2-2.2-2.2-2.2"/>
    <rect x="9.2" y="8.5" width="5.6" height="7" rx="1.4" fill="var(--icoon-vlak, #12120f)" stroke="none"/>
    <path d="M10.9 10.6 12.3 9.5v5"/>
    <path d="M11 14.5h2.6"/>`),speakers:g(`<rect x="3.6" y="3.8" width="8.8" height="16.4" rx="2"/>
    <circle cx="8" cy="14.4" r="2.6"/><path d="M8 7.6h.1"/>
    <path d="M15.6 6.6h4.8v10.8h-4.8"/>`),music:g(`<path d="M9.6 17.4V6.4l8.2-1.6v11"/>
    <ellipse cx="7.6" cy="17.6" rx="2.2" ry="1.9"/>
    <ellipse cx="15.8" cy="15.8" rx="2.2" ry="1.9"/>`),leaf:g(`<path d="M4.6 19.6c-1.4-7.6 3.4-14 14.9-15.2 1.1 8.4-3.3 15.3-14.9 15.2Z"/>
    <path d="M4.2 20.4c2.6-4.6 6-7.6 10.4-9.6"/>`),keuzelijst:g(`<path d="M9.4 6.2h11.2M9.4 12h11.2M9.4 17.8h11.2"/>
    <path d="M3.4 12.2 4.9 13.7 7.6 10.6"/>
    <path d="M4 6.2h1.6M4 17.8h1.6"/>`),cog:g(`<path d="M10.51 3.12 L13.49 3.12 L13.22 5.41 L15.79 6.48 L17.23 4.67
    L19.33 6.77 L17.52 8.21 L18.59 10.78 L20.88 10.51 L20.88 13.49 L18.59 13.22
    L17.52 15.79 L19.33 17.23 L17.23 19.33 L15.79 17.52 L13.22 18.59 L13.49 20.88
    L10.51 20.88 L10.78 18.59 L8.21 17.52 L6.77 19.33 L4.67 17.23 L6.48 15.79
    L5.41 13.22 L3.12 13.49 L3.12 10.51 L5.41 10.78 L6.48 8.21 L4.67 6.77
    L6.77 4.67 L8.21 6.48 L10.78 5.41 Z"/>
    <circle cx="12" cy="12" r="3.1"/>`),grid:g(`<rect x="3.6" y="3.6" width="7.2" height="7.2" rx="1.8"/>
    <rect x="13.2" y="3.6" width="7.2" height="7.2" rx="1.8"/>
    <rect x="3.6" y="13.2" width="7.2" height="7.2" rx="1.8"/>
    <rect x="13.2" y="13.2" width="7.2" height="7.2" rx="1.8"/>`),door:g(`<path d="M5.4 20.6h13.2"/>
    <path d="M6.8 20.6V4.6a.9.9 0 0 1 .9-.9h8.6a.9.9 0 0 1 .9.9v16"/>
    <circle cx="14.4" cy="12.4" r="1"/>`),window:g(`<rect x="4.2" y="3.8" width="15.6" height="16.4" rx="1.6"/>
    <path d="M12 3.8v16.4M4.2 12h15.6"/>`),lock:g(`<rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2"/>
    <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.6 0v2.6"/>
    <circle cx="12" cy="15.3" r="1.2"/>`),lockOpen:g(`<rect x="4.8" y="10.4" width="14.4" height="9.8" rx="2"/>
    <path d="M8.2 10.4V7.8a3.8 3.8 0 0 1 7.4-1.1"/>
    <circle cx="12" cy="15.3" r="1.2"/>`),fan:g(`<circle cx="12" cy="12" r="1.9"/>
    <path d="M12 10.1c0-3 .6-6.4 3-6.4 1.7 0 2.4 2.6-.4 4.6"/>
    <path d="M13.9 12c3 0 6.4.6 6.4 3 0 1.7-2.6 2.4-4.6-.4"/>
    <path d="M12 13.9c0 3-.6 6.4-3 6.4-1.7 0-2.4-2.6.4-4.6"/>
    <path d="M10.1 12c-3 0-6.4-.6-6.4-3 0-1.7 2.6-2.4 4.6.4"/>`),airco:g(`<rect x="3.4" y="4.6" width="17.2" height="8.2" rx="2"/>
    <path d="M6.6 9.6h10.8"/>
    <path d="M7.4 16.2c1.6 0 1.6 2.2 3.2 2.2M13.4 16.2c1.6 0 1.6 2.2 3.2 2.2"/>`),tv:g(`<rect x="2.8" y="4.4" width="18.4" height="12.2" rx="1.8"/>
    <path d="M8.4 20.2h7.2M12 16.6v3.6"/>`),speaker:g(`<rect x="5.6" y="2.8" width="12.8" height="18.4" rx="2"/>
    <circle cx="12" cy="15" r="3.2"/><circle cx="12" cy="6.8" r="1.2"/>`),camera:g(`<path d="M3.4 8.6A1.6 1.6 0 0 1 5 7h8a1.6 1.6 0 0 1 1.6 1.6v6.8A1.6 1.6 0 0 1 13 17H5a1.6 1.6 0 0 1-1.6-1.6z"/>
    <path d="m14.6 11 6-3v8l-6-3z"/>`),car:g(`<path d="M4.2 15.4h15.6"/>
    <path d="M6.2 15.4v2.4a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-2.4M20.3 15.4v2.4a.9.9 0 0 1-.9.9h-.7a.9.9 0 0 1-.9-.9v-2.4"/>
    <path d="M3.8 15.4v-3.2l2-4.6a1.3 1.3 0 0 1 1.2-.8h10a1.3 1.3 0 0 1 1.2.8l2 4.6v3.2z"/>
    <circle cx="7.4" cy="12.5" r=".95"/><circle cx="16.6" cy="12.5" r=".95"/>`),van:g(`<path d="M2.6 16.2h18.8"/>
    <path d="M6 16.2v1.9a.9.9 0 0 1-.9.9h-.8a.9.9 0 0 1-.9-.9v-1.9M20.6 16.2v1.9a.9.9 0 0 1-.9.9h-.8a.9.9 0 0 1-.9-.9v-1.9"/>
    <path d="M2.6 16.2V7.4a1 1 0 0 1 1-1h9.6a1.2 1.2 0 0 1 1 .55l3.4 4.85h2.4a1 1 0 0 1 1 1v3.4z"/>
    <path d="M13.4 6.4v5.4h4.2"/>
    <circle cx="6.6" cy="13.4" r=".95"/><circle cx="17.4" cy="13.4" r=".95"/>`),plug:g(`<path d="M9 3.4v5.2M15 3.4v5.2"/>
    <path d="M6.4 8.6h11.2v2.2a5.6 5.6 0 0 1-11.2 0z"/>
    <path d="M12 16.4v4.2"/>`),battery:g(`<rect x="2.8" y="7.4" width="16.4" height="9.2" rx="2"/>
    <path d="M21.2 10.6v2.8"/>
    <rect x="5.2" y="9.8" width="6" height="4.4" rx="1" fill="currentColor" stroke="none"/>`),gaugeArrow:g(`<path d="M4.2 17.4a8.4 8.4 0 1 1 15.6 0"/>
    <path d="m12 13.6 3.6-3.8"/><circle cx="12" cy="14.8" r="1.3"/>`),clock:g('<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 1.9"/>'),washer:g(`<rect x="4.2" y="2.8" width="15.6" height="18.4" rx="2"/>
    <circle cx="12" cy="14" r="4.4"/>
    <path d="M4.2 7.4h15.6M15.4 5.1h1.6"/>`),dishwasher:g(`<rect x="4.2" y="2.8" width="15.6" height="18.4" rx="2"/>
    <path d="M4.2 7.8h15.6M7.2 5.3h2.4"/>
    <path d="M9 11.4c1 1.4 1 2.8 0 4.2M12 11.4c1 1.4 1 2.8 0 4.2M15 11.4c1 1.4 1 2.8 0 4.2"/>`),printer:g(`<path d="M7 9V4.6a.6.6 0 0 1 .6-.6h8.8a.6.6 0 0 1 .6.6V9"/>
    <rect x="3.6" y="9" width="16.8" height="7.2" rx="1.8"/>
    <path d="M7 15.4h10v4a.6.6 0 0 1-.6.6H7.6a.6.6 0 0 1-.6-.6z"/>`),printer3d:g(`<path d="M4 3.6h16a.6.6 0 0 1 .6.6v15.2a.6.6 0 0 1-.6.6H4a.6.6 0 0 1-.6-.6V4.2a.6.6 0 0 1 .6-.6z"/>
    <path d="M3.4 8.4h17.2"/>
    <path d="M12 8.4v2.6"/>
    <path d="M10.4 11h3.2l-1.6 2.4z"/>
    <path d="M7.2 17.2h9.6"/>`),handmatig:g(`<path d="M11 12.2V5.6a1.6 1.6 0 0 1 3.2 0v6.4"/>
    <path d="M14.2 11.6v-1.4a1.5 1.5 0 0 1 3 0v1.6"/>
    <path d="M17.2 11.8v-.8a1.5 1.5 0 0 1 3 0v4.6a5.4 5.4 0 0 1-5.4 5.4h-2a4.6 4.6 0 0 1-3.7-1.9L5.4 15a1.6 1.6 0 0 1 2.4-2.1L11 15.8"/>`),koelkast:g(`<rect x="5.6" y="2.8" width="12.8" height="18.4" rx="1.8"/>
    <path d="M5.6 10.2h12.8"/>
    <path d="M8.2 6.2v2.2M8.2 12.4v2.4"/>`),oven:g(`<rect x="3.4" y="3.6" width="17.2" height="16.8" rx="1.8"/>
    <path d="M3.4 8.6h17.2"/>
    <circle cx="7" cy="6.1" r=".9"/><circle cx="10.4" cy="6.1" r=".9"/>
    <rect x="6.4" y="11.4" width="11.2" height="6.4" rx="1.2"/>`),magnetron:g(`<rect x="2.4" y="5.6" width="19.2" height="12.8" rx="1.8"/>
    <rect x="4.8" y="8.2" width="10.4" height="7.6" rx="1.2"/>
    <path d="M17.8 8.6v2.4"/>
    <circle cx="17.8" cy="14.6" r="1.1"/>`),key:g(`<circle cx="7.8" cy="12" r="3.8"/>
    <path d="M11.6 12h8.6M17.4 12v3M20.2 12v2.2"/>`),power:g(`<path d="M12 3.6v8"/>
    <path d="M17.4 6.6a7.6 7.6 0 1 1-10.8 0"/>`),plus:g('<path d="M12 5.2v13.6M5.2 12h13.6"/>'),minus:g('<path d="M5.2 12h13.6"/>'),chevronRight:g('<path d="m9.4 6.2 5.6 5.8-5.6 5.8"/>'),chevronLeft:g('<path d="m14.6 6.2-5.6 5.8 5.6 5.8"/>'),chevronDown:g('<path d="m6.2 9.4 5.8 5.6 5.8-5.6"/>'),arrowLeft:g('<path d="M19.4 12H5M10.6 6.4 5 12l5.6 5.6"/>'),arrowRight:g('<path d="M4.6 12H19M13.4 6.4 19 12l-5.6 5.6"/>'),close:g('<path d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"/>'),check:g('<path d="m5.2 12.6 4.4 4.4 9.2-10"/>'),dots:g('<circle cx="5.4" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.6" cy="12" r="1.5"/>'),warning:g('<path d="M12 4.2 2.8 20h18.4z"/><path d="M12 10v4.4M12 17.4v.1"/>'),question:g(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M9.6 9.6a2.4 2.4 0 1 1 3.2 2.3c-.5.2-.8.7-.8 1.2v.6M12 16.6v.1"/>`),pencil:g(`<path d="M4.5 19.5h3.2L18.4 8.8a1.9 1.9 0 0 0 0-2.7l-.5-.5a1.9 1.9 0 0 0-2.7 0L4.5 16.3z"/>
    <path d="m14.6 6.8 2.6 2.6"/>`),een:g(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10.6 9.9 12.4 8.6v6.9"/>`),twee:g(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10 9.7a2.1 2.1 0 1 1 3.9 1.1L9.9 15.5h4.2"/>`),drie:g(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10 9.5a2 2 0 1 1 1.8 2.6 2.1 2.1 0 1 1-1.7 2.7"/>`),vier:g(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M13.4 8.6 9.7 13.3h5"/>
    <path d="M13.4 8.6v6.9"/>`),vijf:g(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M14 8.7h-3.6v3.1h1.4a2.1 2.1 0 1 1-2 2.8"/>`),zes:g(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M13.8 9a2.2 2.2 0 0 0-3.7 1.7v2.4"/>
    <circle cx="12.1" cy="13.4" r="2.1"/>`),zeven:g(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M9.7 8.7h4.6l-2.8 6.8"/>`),acht:g(`<circle cx="12" cy="12" r="8.6"/>
    <circle cx="12" cy="10.3" r="1.7"/>
    <circle cx="12" cy="13.8" r="1.9"/>`),negen:g(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M10.2 15a2.2 2.2 0 0 0 3.7-1.7v-2.4"/>
    <circle cx="11.9" cy="10.6" r="2.1"/>`),tien:g(`<circle cx="12" cy="12" r="8.6"/>
    <path d="M8.6 10.3 10 9.2v5.7"/>
    <ellipse cx="13.9" cy="12.1" rx="1.7" ry="2.8"/>`),beach:g(`<circle cx="17" cy="6.6" r="2.6"/>
    <path d="M17 1.8v1.2M17 10.2v1.2M21.8 6.6h-1.2M13.4 6.6h-1.2M20.4 3.2l-.9.9M14.5 9.1l-.9.9"/>
    <path d="M2.4 15.4c1.6-1.5 3.2-1.5 4.8 0s3.2 1.5 4.8 0 3.2-1.5 4.8 0 3.2 1.5 4.8 0"/>
    <path d="M2.4 19.4c1.6-1.5 3.2-1.5 4.8 0s3.2 1.5 4.8 0 3.2-1.5 4.8 0 3.2 1.5 4.8 0"/>`),sleep:g(`<path d="M3.4 12.4h6.2l-6.2 7.2h6.2"/>
    <path d="M11.8 7.6h4.6l-4.6 5.4h4.6"/>
    <path d="M18.2 3.6h3.4l-3.4 4h3.4"/>`),boiler:g(`<rect x="5" y="3.4" width="14" height="12.8" rx="1.8"/>
    <path d="M12 6.8c1.9 1.8 2.8 3.2 2.8 4.4a2.8 2.8 0 0 1-5.6 0c0-1.2.9-2.6 2.8-4.4z"/>
    <path d="M8.4 16.2v4M15.6 16.2v4"/>
    <path d="M6.8 20.2h3.2M14 20.2h3.2"/>`),pressure:g(`<circle cx="12" cy="10.4" r="6.4"/>
    <path d="m12 10.4 3.2-3.2"/>
    <circle cx="12" cy="10.4" r=".8"/>
    <path d="M6.9 6.5 8 7.7M17.1 6.5 16 7.7M12 4v1.6"/>
    <path d="M9.6 16.2 8.8 20.4h6.4l-.8-4.2"/>`),bell:g(`<path d="M17.8 16.6H6.2l1.5-2.3V10a4.3 4.3 0 0 1 8.6 0v4.3z"/>
    <path d="M10.2 19.2a2 2 0 0 0 3.6 0"/>
    <path d="M12 5.7V4.2"/>`),bellOff:g(`<path d="M17.8 16.6H6.2l1.5-2.3V10a4.3 4.3 0 0 1 8.6 0v4.3z"/>
    <path d="M10.2 19.2a2 2 0 0 0 3.6 0"/>
    <path d="M12 5.7V4.2"/>
    <path d="M4.5 4.5l15 15"/>`),refill:g(`<path d="M12 2.8c1.7 2 2.6 3.5 2.6 4.6a2.6 2.6 0 0 1-5.2 0c0-1.1.9-2.6 2.6-4.6z"/>
    <path d="M5.8 11.8h12.4v6.6a2.2 2.2 0 0 1-2.2 2.2H8a2.2 2.2 0 0 1-2.2-2.2z"/>
    <path d="M5.8 15.6c1.4-1.2 2.7-1.2 4.1 0s2.7 1.2 4.1 0 2.7-1.2 4.2 0"/>`),football:g(`<circle cx="12" cy="12" r="8.6"/>
    <path d="m12 7.3 3.7 2.7-1.4 4.4H9.7L8.3 10z"/>
    <path d="M12 7.3V3.4M15.7 10l3.7-1.2M14.3 14.4l2.3 3.1M9.7 14.4l-2.3 3.1M8.3 10 4.6 8.8"/>`),sports:g(`<circle cx="7.6" cy="15.6" r="4"/>
    <path d="M4.6 12.9a5.6 5.6 0 0 0 6 6"/>
    <ellipse cx="16.2" cy="7.6" rx="3.4" ry="4.2"/>
    <path d="M14.1 10.9 11 14.4"/>
    <path d="M13.6 6.2h5.2M13.4 8.8h5.6M15.3 3.7v7.8M17.4 3.9v7.6"/>`),raceCar:g(`<circle cx="7" cy="16.4" r="2.6"/>
    <circle cx="17.4" cy="16.4" r="2.6"/>
    <path d="M2.4 16.4h2M9.6 16.4h5.2M20 16.4h1.6"/>
    <path d="M4.4 14.2h1.4l1.6-2.4h4.2l1.6-2.6h2.4l.8 2.6h2.4l1.6 1.4-.4 1"/>
    <path d="M2.2 18.4h3.2M19.6 8.4h2.2M20.7 8.4v2.6"/>`),cctv:g(`<path d="M3.8 9.5 16.2 6l1.3 4.6L5.1 14.1z"/>
    <path d="m17.9 10.9 2.9-.8-.6-2.2-2.9.8"/>
    <path d="M9.4 13.3v1.9a2.4 2.4 0 0 1-2.4 2.4H5"/>
    <path d="M5 15.4v5M3 20.4h4"/>`),floorHeating:g(`<path d="M2.8 20.6h18.4"/>
    <path d="M5.6 17.6V5.8a2 2 0 0 1 4 0v11.8a2 2 0 0 0 4 0V5.8a2 2 0 0 1 4 0v11.8"/>`),heatPump:g(`<rect x="2.8" y="6.2" width="13.4" height="11.6" rx="1.8"/>
    <circle cx="9.5" cy="12" r="3.5"/>
    <circle cx="9.5" cy="12" r=".8"/>
    <path d="M9.5 8.5a3.5 3.5 0 0 1 3 1.8M9.5 15.5a3.5 3.5 0 0 1-3-1.8"/>
    <path d="M18.8 9.2c1.3 1.8 1.3 3.8 0 5.6M21.2 7.4c2 2.9 2 6.3 0 9.2"/>`),qr:g(`<rect x="3.4" y="3.4" width="6.4" height="6.4" rx="1.2"/>
    <rect x="14.2" y="3.4" width="6.4" height="6.4" rx="1.2"/>
    <rect x="3.4" y="14.2" width="6.4" height="6.4" rx="1.2"/>
    <path d="M6.5 6.6h.2M17.3 6.6h.2M6.5 17.4h.2"/>
    <path d="M14.2 14.2h2.8M14.2 17.6v3.2M17.8 20.8h3M20.6 14.2v3.2"/>`),siren:g(`<path d="M7 15.6a5 5 0 0 1 10 0z"/>
    <path d="M5.4 18.8h13.2a1 1 0 0 0 0-2H5.4a1 1 0 0 0 0 2z"/>
    <path d="M12 5.4v2M6.6 7.6l1.5 1.5M17.4 7.6l-1.5 1.5M2.8 13.2h2M19.2 13.2h2"/>`),sirenOff:g(`<path d="M7 15.6a5 5 0 0 1 10 0z"/>
    <path d="M5.4 18.8h13.2a1 1 0 0 0 0-2H5.4a1 1 0 0 0 0 2z"/>
    <path d="M3.6 3.6 20.4 20.4"/>`),petrol:g(`<path d="M4.6 20.8V5.4a2 2 0 0 1 2-2h5.4a2 2 0 0 1 2 2v15.4"/>
    <path d="M3.2 20.8h12.2"/>
    <rect x="6.6" y="6.2" width="5.2" height="4.2" rx=".8"/>
    <path d="M14 9.6h2.2a1.6 1.6 0 0 1 1.6 1.6v5.6a1.6 1.6 0 0 0 3.2 0V8.4l-2.4-2.4"/>`),diesel:g(`<path d="M5 20.6V7.4a2 2 0 0 1 2-2h4.6a2 2 0 0 1 2 2v13.2"/>
    <path d="M3.6 20.6h11.4"/>
    <path d="M7.4 8.8h3.8M7.4 11.4h3.8"/>
    <path d="M18 8.6c1.6 1.9 2.4 3.2 2.4 4.3a2.4 2.4 0 0 1-4.8 0c0-1.1.8-2.4 2.4-4.3z"/>`),gas:g(`<path d="M12 3.4c3.4 3.4 5.3 6.2 5.3 8.7a5.3 5.3 0 0 1-10.6 0c0-2.5 1.9-5.3 5.3-8.7z"/>
    <path d="M12 20.6a2.8 2.8 0 0 1-2.8-2.8c0-1.4 1-2.7 2.8-4.3 1.8 1.6 2.8 2.9 2.8 4.3a2.8 2.8 0 0 1-2.8 2.8z"/>`),fuelStation:g(`<path d="M2.6 8.4 12 3.6l9.4 4.8"/>
    <path d="M2.6 8.4h18.8"/>
    <path d="M7.6 20.6v-8.4h6.4v8.4"/>
    <path d="M6 20.6h9.6"/>
    <path d="M16.4 13.6h1.6a1.4 1.4 0 0 1 1.4 1.4v2.6a1.3 1.3 0 0 0 2.6 0v-5.4"/>`),homeThermo:g(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
    <path d="M5.4 12.9V20a.9.9 0 0 0 .9.9h11.4a.9.9 0 0 0 .9-.9v-7.1"/>
    <path d="M10.6 17.3v-3.5a1.4 1.4 0 0 1 2.8 0v3.5a2.2 2.2 0 1 1-2.8 0z"/>`),homeStatus:g(`<path d="M3.2 11.3 12 4.1l8.8 7.2"/>
    <path d="M5.4 12.9V20a.9.9 0 0 0 .9.9h11.4a.9.9 0 0 0 .9-.9v-7.1"/>
    <path d="m9.2 16.9 1.9 1.9 3.7-3.9"/>`),homeLeave:g(`<path d="M2.4 10.8 8.9 5.2l6.5 5.6"/>
    <path d="M4.4 12.2v7.3a.9.9 0 0 0 .9.9h7.2a.9.9 0 0 0 .9-.9v-2.1"/>
    <path d="M13.4 12.2v1.4"/>
    <path d="M14.6 15.6h6.6M18.6 12.9l2.8 2.7-2.8 2.7"/>`),lounge:g(`<path d="M6.4 10.8V7.6a2.4 2.4 0 0 1 2.4-2.4h6.4a2.4 2.4 0 0 1 2.4 2.4v3.2"/>
    <path d="M4.6 17.4v-4.6a2 2 0 0 1 4 0v1.4h6.8v-1.4a2 2 0 0 1 4 0v4.6z"/>
    <path d="M6.2 17.4v2M17.8 17.4v2"/>`),dumbbell:g(`<path d="M9.2 12h5.6"/>
    <rect x="6.2" y="8.6" width="3" height="6.8" rx="1"/>
    <rect x="14.8" y="8.6" width="3" height="6.8" rx="1"/>
    <path d="M3.6 10.2v3.6M20.4 10.2v3.6"/>`),storage:g(`<rect x="3.2" y="12.4" width="8" height="8" rx="1"/>
    <rect x="12.8" y="12.4" width="8" height="8" rx="1"/>
    <rect x="8" y="3.4" width="8" height="8" rx="1"/>
    <path d="M6.4 12.4v2.4M16 12.4v2.4M11.2 3.4v2.4"/>`),celsius:g(`<circle cx="6.6" cy="7.2" r="2.6"/>
    <path d="M19.4 9.4a5.6 5.6 0 1 0 0 7.4"/>`)};N.domotitech='<img class="icon" alt="" aria-hidden="true" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQ4AAAEOCAYAAAB4sfmlAAAACXBIWXMAAAsSAAALEgHS3X78AAAc4UlEQVR4nO3de5RcdWEH8O9vFhDayC5MHkgIO4jksUnYQaEKKntDBB/g2aE91gpsM/Qf/+gjM7zk1NpMbG1RwdkckKfArBNBrcqs+IKE7GwSoO/MqoAFK7P12B4Jc8y0KNrTk9s/fr87e/c9v5l77+/One/nnIXM6947uzvf/b1/wrZtEBHpiJm+ACLqPAwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItLG4CAibQwOItJ2gukLoM4RzxbTAFIAEgAGAdQBVNRXuZYfKZm6NgqWsG3b9DVQyKnAyAHoX+apdQAlALlafqTq60WRUQwOWlQ8W0wCGAUw1MLLxwGM1vIjZU8vikKBwUHzxLPFPsgSxk4PDjcGlkAih8FBs8SzRQtAActXS3TUIUsfOQ+PSQYxOAiA56WMxUwBSNfyIxUfz0EBYHcsIZ4tpgBU4W9oALIn5kg8W8z5fB7yGUscXSygUsZiJgGkavmRYwbOTW1icHQpn9oydNUBWKy6dB4GR5cxXMpYzPW1/EjB9EVQ8xgcXSQkpYzFjNXyI2nTF0HNYXB0CdUgucv0dSxjCrLqwnaPkGNwRJwa/VmA7NHoBGz36ADsjo2weLaYAXAEnRMaANALoKzmx1BIscQRQfFsMQFZymhljkmY7OZo03BicESMGsxVgPzLHQXjkKNN2e4RIgyOiFDdrAUAw4YvxQ9TkIPFqqYvhCQGRwSEvJvVK2w0DRE2jnY41c06gWiHBiCrXkfYaBoOLHF0qA7sZvUSB4sZxuDoQKqbNYfoNIC2gpPkDGJwdJCIN4C2gut7GMLg6BAR7Gb1Sh2y5FE2fSHdJJLB4ZoBmvTgcBXINTONFIlDOps1jDjDNkCRCw41arICb/8y1wEkgx5HEKIG0CnI1c7Lc78Hqis4pb5M9+yw0TQgUQyOAoAdPhx6vJYfSflw3AWpBtB8UOdbxDRkG0K5mSerEMnAbBsMG00DEMXg8O0N1fIjwq9jO1TVpATz80xanifS5n4sXpiGDA82mvqEA8BCxLVosMnQmAJwQTuTy2r5kUotP2IB2Ab5IQ5aP+QM28BKiN2GwREC8WyxL54tjgJ4DGZ7Tcbg4bBuVcVJAtjtxfE09QJ4TFX5yGOsqmjwo6qiivUlmF80OONnr4Th98lGU4+xxGGQmmdyBGZDw1mur+DnSVQpJglZqgnajni2WFHtR+QBBocB8WwxEc8WyzC/BqinVZPl1PIjx9Rf/ushSzlBGgRQUSUfahODI2Cqwa4C870m19fyI0YWyFGlGwuytBMkNpp6hMERENUAWoD5BtBpyF6TgsFrcKouFuQKX0Fio6kHGBwBUAOjKvBnYJqOScgRsKEY36CqLikAewycPq+CnFrA4PBZiBba2V3Lj4Ryz5JafiQD2e4RNDaatojB4ZN4tpiMZ4sVmG8ArQO4Ouyrhauq0wVgo2lHYHD4QNWfywjH5DSrlh8pGb6Opri6bE01mqYDPm/HYnB4SDWAliAnp5leNyPQrlavqNm3FoIPj14AD6uqJS2DI0c1LDVyNGQL7WRr+ZFR0xfRLh9nOi9nDHIkbejag8KCJY42uUoZprtZAdk+cEEUQgMA1GAxIyNNIasubDRdBIOjDa5u1jCsAToJINFpVZPlqPDIGjj1IIAqG00XxuBogWs2axi6WQFgT1i7Wr2gSlAmumu5AfYiGByaXEPGw7AGqNPVGvlRkKq79moE313rNJpGovrnFTaO6pmE+Tkmjq7cT1VVHcow057EDbAVBkdn6ur1JQyHR1cG9lysqnSWOtSsVtMXYpJrglzQYz0AjjQFwODoJIEsuNMpDIdH12+AzeDoDHtq+ZHQzGoNC9XWYMFMeACy0bRg6NxGsY0j3OqQjXEdMdfEFDVQqwxzc4O6bi8XBkd4+fbLePHEvx0BkNB8WfXZbRsumHMcZ/8UXZlnt23wvPRkcIg60GUbYJ9g+gJoQX7PNUkA0B1OnVjgvj601j3ty1DuWn4kHc8WATPhMQg1WKwbSohs4wgXZzMkDjZqkcH5LUAXLUvI4AiP3WwA9YbB+S2OfDxbLER5khyDw7y2t1yk+QzOb3FEeoYtg8MsljJ8pMa8mAyPyM6wZXCYMQngHJYy/GdwcpwjkjNsGRzBmoaczWp1+1yHIKleDgtmwyNSM2yjGByTpi9gAXXIHduT3dBVF0auIeqmwgMAdsazxVIU2j2iGBxh+2COQQZGrptGFoaR4fktjmHIqkvC4DW0LYrBUYDZvyqOMch2jDSrJeERkvBwZthaBq+hLZELDvVX3eQAHAZGyLkmx5ms1vYCmOjURtPIBQfQaEkPcj/SOhgYHUXtW2vB3ChTR0fOsI3sXJVafiSjtmAchX8rRU2p45c6rP2iihYmuS1w3zG09lc7NN8rNb/lGMyuIbtDtXl0zAzbyM2OnUu1YKfVlxfTrqchG2BHWbKIDlVleNjwZUxDhkfoBwRGPjjmcjVIJSFnaSYw89c3ifmlkynIv7ZlAOVO+KFSa1R4+FlCbUZHrMHSdcFBtBTDCyG77Q7zyGIGB9Ecqr2hBHMrijlCu4ctg6MLbbpv4sMQ4k1aL7Lt/3rho9u+4r5r/Ref2WoDH9U9vwDue/EPL/mB7uuCpNrGSjC/j04ot2OIbK8KLe7/4qfeuzK+QmvY86u1144BmBUcNvDRlevif6x7/ld/WgOAP9F9XZCcsR6GlyMEXIPFwtS+FslxHEReUYsCmZyaD4RwOwYGB9Ey1IDCC2B+KkNoZtgyOIiaoKoJSZid4wKEZIYtg4OoSaqB0oLcfNok4zNsGRxEGtQclxSCnQu1EKN72DI4iFpQy49k0MWNpgwOohapRtNtCEejaS7IEzI4iNpQy4+UYX5hIADYFeT0/K4cALb2k48lhWsbQlvI/wuIObflf22BYz/7+HBoBt9QuNTyI85qXmWYHaa+I54tOmNPfBXJ4Dhz19ctAAkhRAJqFqwtkIwBvbYQLR1z7afGneJZ3RaiEgOO2QIVyLUlKkKIyn/c+sHQzSmgYNTyI8dUeIzC7EjTQMKj44PjzL/8WsKGsABYQiAJ/xO/FzPzF4bdD5x92+N1G6gAKMcEygAq0x9jmHQLNUzd5MbXDt/DoyOD44xPfC0FIAXAign0m74eFydUhgDsAoD+Tz8+ZUOUYwLl6i1XhXqNBfKGWlWsDLMLA+2IZ4sVvzYw74jZsWf8xd/1AUjZEKkYMGy7ahsxAdhOa8ScWohw3WEL2RLsVFXcT22ijUOeq/F8oY41/1zOdzPmesyGcN8et4UoxYDyyzdfWV36nfuDs2ODEZJVxbapBlxPhTo4Vn/8q6keIG0LMQyoDyBmf2A7MDhmXu+sWSpQqt50Jas0EaTaPUowtzBQHUDC6zU9Qhccaz7+1QSAjC3XCO3twcyHPYLB0ThRDBi3IQov3/QBVmcixvSqYj2/9YaJDdvP/6NDl22senXM0ATH6j//SioGkbGFbHh0rqqLgsN5H9MxIQoACv9+4/uroEgwGR4xIV7feNWF/wuB0UPbNua8OKbR4Fh161f6hEAKQA4C/THXh7SLgwMx0biOcQCjP7nh/WVQx1PhUYCBsR5r3nou4medjh5gyhbCmrQ2tFV1MRIcq2/9cp8NkQGQEUIlsAAYHPOCw7k9BWD0x9n3FUAdTU2HLyPg8Dh55ak/ffMlG9apz9MUgLbCI/DgWH3rlzMAcjZEL+D6sDM4lgoO59jTthC5n2TeWwB1LFPhcfZlW9G74mTnM9BWeAQWHKs+9mjKhhh1xl3M+7AzOJoJDue10wByP2aAdCwT4XHaOWvqZ2092z16esoGrIMthIfvwbHqlkeTEBgFMOT+ADE42goOBwOkgwUdHjEhXt/8wQtPcU+7sIHxg9aGlO6xfAuOVbc82mcDGQHsgissGByeBofzvOkYkHlp53vZldthgg6PNVvOfn3VuWec4ty2AfQI7J4Y2pDTOY4v0+pX3fKoBTlnY5cfx6d5+gE8dt6eJ8vn7XnSMn0x1DxnGwYEtBzhq9Wj/73A3bu2Tb6Y1jmO5yWOVTc/koMQuwCZZgIASxy+lzjUfY3vwxiA3It/dkUV1DGC2sMlsf18rFhxMoBGiQPqd+eCiaH1TS0f4VlwrL75kYTtbJvn+kVncBgJDgCo2wKjL/3pFTlQxwgiPNasX/uLVZvWngbMC466LZAsX7q+utwxPKmqrL75EQuyamJ6r02a0Qtg13l3PlndcOc+y/TFUHPUVPgxP8/x6s9qv1rkoV7IP/7Lajs4Vt30SBrABMzv7k0L6wcwseHOfaX1d+1LmL4YWp7f4WH/6jenL/Hw4PaDL+aWO0ZbwbHqpkcKMD9tmJozDKCy/q59OdMXQsvzMzyO2/Ypr73266WesuuyQy9aSz2h5eBQoWFylSPS1wtg18a79lc23rXfyH4c1Dw/w+OXr/1muacsuQBQS8Gx+sYvFcDQ6GSDAI5s+Pz+0YHP7ze6lSAtza/wEL98/fVlnjJ42aHFqyzawcHQiJSdACqb7t5vmb4QWlIGHm+/8Jv/+fUrzZz3PYdeSiz0gFZwMDQiqR/AxKa7949uuvsplj5CyDVILOi9W3oB5BZ6oOngWH3jl3JgaETZTgDVzXc/pT1vgfznCo/pgE+94z2HXrLm3tlUcKy+cW8aHD7eDXoBPDZwz4HSwD0HWPoIGRUeKQS/5WRu7h3LBsfqG/cmsUwLK0XOMIDKwD0HLNMXQrPV8iMVyPV4gzS0/fBLs3rhlgyOVTfs7YNc6oyDu7pPP4CJgXsOjG65l6WPMKnlR0oAdgd82oz7xnIljhw4jLzb7QRQ2XIvSx9hUsuP5NBGY+nJbzjxVM2XzGr7WjQ4Vt2w14L8pSHqBzCx5V6WPkIm3eoLj5+24jTNl/RuP/xSIzyWKnEUWroiirKdAMpb75vgqNMQUO0dLVVZfnvFG1p5meX8Y8HgWHXD3hwQqj1ZKTwGARzZet9EzvSFEADZcaHVyxIT4nVnPQ5NjT8Y84JjpWwQzcy9n2iOXZvvn6hsvX8iYfpCupnqotXq9Tzx9BX/2eLphpx/LFTiyIC9KNScQQCVzfeX+YfGLK1SR++bTjuz3RPOCo6VWZY2SFsvgPzm+8vlgQfKCdMX041UqaPQ7PP71q08ZflnLezyp3+cBOaXONJgaYNaMwSgsuWBMoesm9FUdeXklaf+9KSTTmjnPH3A/OBgaYPaIYesP1AuDTxQZrdtgGr5kSqaGNfxxnPftM6L8zWCY2V2rwX2pJA3hgFUN31hkqWPYC25XmjPilN+fsYa3XFf81SA2SUO/pDJS70AHtv8hcnywIOTCcPX0i3KSz24KplY0+4J9r3zLceA2cHBQT3khyEAlYEHJ1kN9lktP1Je7LE3ro2/evrpK9o9RWNKP4ODgiB7Xh48WNn84EHL8LVE3bx2jlhPT/2MLWev9ODYjc2a3MHB3hTy2yCAiYGHDo4OPHSQjaf+mLfz/OqL1/ee2F5PiqPs/MOXvWOJlrETQHXgoYOsvniv7L5xxuazXz/9tLarKI5G4yuDg0yR1ZeHD1Y2P3zIMn0xUXR6Yk195ZtXtzzYa46pp951XtW5EQMaXbFEJgwCmNj08KHSxsLhhOmL6XTipBP7Yied8PM1yXN+tWbLOi+bHwruG55UfIg8MAxgeHPh8NhxIPNC+l3z6uq0tEv2P9+3/vLzUz0CawDXpubeKLhvsKpCYbMDQHVT4XBu49hhNqDqKcGfQZxjT73rvFlBzuCgMOqFXFW/OjB2OLfpi08zQJbwzn3P9b1z3/MVuKa9eyw39w4GB4VZI0A2ffHp3EDxGQbIHBc/+VwKQBX+rQ08tv/dM42ijjC0cUy6/n0MrkEmiuX6dwKcT9ONnADJDBSfKdjA6Asjl1QNX5NRFz/5XAJyRuywz6fKLXSnExxVn08OyBFtZchgqB697cPlVg90xie+1gc50jWhvix1m4PYoq0XcgzIzk3FZ8aEEKPPX3fx3D80kfb2J37Y1wNkIEQQC27tXqi0AQDCtmXb68rsXvkPAQj3Exo3xKwX2jMPNJ5jz7nDBiYFUIBA6einP+J7K/mZu76egAwQC4AlhGgU32wh62XOdbvfja1uCHXvzG35X+d2rPF8oY41cwwx857lc12P2RCzbzuvb7xYXZs6Y0zMvo6Y69jOa92c99a4YoHZr5/zvty3e2a9DzHre+SIzb7ZeK/H1XmPu44nb895n4t8f2euVeC4en7PrNfP+ZnN+R6r25O2QOGFay8uIOLe8b0fpG0hcj1Av/tnFFPfQ+f72tP4PAr0iJmfDxo/75nX2o3nz/udmAaQPPDu9Qt+bv0IjjqEKAAYPfqZj1QX/S4EYG3uG31QIWILWDFgkMERueBwjlcXsstw9PlrL64iIi767g/6AKR6BHJQgTH3w+9TcFx94N3rF52m73Vw7AYwevSz14SyD/6s3d9I2EKkAFjCVTdkcMxcSAcHR+M31BZiMiZDpPTcNe8I5e/icn7nO99PAMjYQqQB9DbCIJjgGH/q0vVLLrPhVXBMAki/8tlrqkudLEzO+uRjfZBrkKRsIUOEwRGZ4HD9rDAOoHQcovSjj7w99CFy4Xe+n47J38thYOa9Bxgc9R4g8dSlC1dRHF4ER/bo7dd09KbUa/9KhoiASAMYYnBEKjjktUKgR7aHlI4D5R/9wdtD0aj61m9N9cWEsACkIJAC0Ov++RoIjqvLly5eRXG4g+MYgF6N4KgDsI7efk0ofgBeOeuvSglbIA0gLYB+BkekggO2aBx/WghRBlC2haj86PcvCuz3+G3fmkoCsGxZshhyfr5o/HxmBBwcYxND69PNvAd3cJQBDDUZHFO2ENbR28PZluGVs/66lAJE2qnKMDhmv9cODw7X6wUgG1crACq2QKUHqD73oYvKaFNy/EjSFkj0AElbliyGYvN+V0IRHFMArImhpasojlaCYwqA9cod10Y6NNzWfmo8ASAdk9tH9DM4IhkcrtfP/oDZwGSPAGwZLMec6wRwTN2HHvncpC3QByAZE0gAcjjA3OOFMDjqgEhODK2vokm6weFZaMSzRQszA7eWGkpcgRxRWnW+1FLwRqz71HjKFiIdA4YZHF0THFDB0Xh+j/Nv9f+eeT+zmSN2QHBsmxjaUIYGd3CUAAwvERxth4YKizRk3a7dUW+TmAmTMoCK2tEqEGf/zTcTtkAGahMrBgeDw32+DgqO6w9aGwrQ5A6OHIBdiwRHHRDWK3dc21IDUjxbTEOOefd7nskUZAmlDKAcVMlk3d9+My2E6pFR9zE4GBwdEBx7Jq0NLS3f2GxwXP3KHdct20UzV4CBsZhpqBBBAEFy9m2PJ225G14qJmZKVAwO5+gMDvlYKIJjbNLakEaLmgmOPa/ccZ1WKsWzxSTkzD2/1gdolTPRrrTUHhTtWnfb430x2SefA9DP4HCOzuCQjxkPjrZCA5gdHBaAiTnBMXX0c9dp7bcSzxYzAPLtXFRA6pArJpUhg8SX9pH+Tz9u2RDpmMAO5z4Gh/tY8hEGB4IKjrHyto1ptMkdHEkAR+YEx7ajn7uu3OzB4tliAZj5gHSYccgg8SVEEp/5VgKyITVtC9HP4HCOJR9hcCCI4Bg75EFoAK7gAICV2b0VCAyq00we/dx1VjMHiWeLfZB/uf1ahShovoZI/2e/nY4BadupyjE4GByuC/ApOMYOXeZNaMy9RkCOq5hSXzonKSA6oQHICUYPA6jGs8VCPFv0dEPu6ZuvLLx885UWgHMAjEFWm4j84mloAHNKHK1QPScPe3ExITcNWQoZ9bp3JnH7t/tkCURkAPSzxDH7fbHE0VaJY/fkZZty8FhbwaF6T8roviX7piB7jTyvypxz+3esmFwWbpjBweBoMziuP7x9UwE+aDc4KohWFUWX0zMzWsuPeDq78tw7vpuw5SzdTEyIXoDBweBoOjjqAFKHtg+U4ZOWgyOeLeYgV54maQoyQApeH/gt+e+lAWRstfQhg2P2dTA45IvVuad6BNKHtg/4ukxAS8ERzxYTAF72/GqioQ5ZjSl43RZybv57SVuITGxOlzeDwzn+7PO6H+uS4BgHkH7mPQO+z9lqNTgK6NzxGkEahyyFlL086FtGn+iD7PXKAOhncDjHn31e92NdEBzZpy8fCGwlPu3gUGM2fuHP5USWf9WY0SdStkAmBgwxOGaf1/1YhINjKiaQfvryzYGuxNdKcKQAPObP5UTeNNQS/l73xpy354kEZHduWqgJdgyOyAfHHgC5Z6/YHPiiWq0ERw76jaJ1zCzI407GKmbvIufs0Oaw1P/DNlmuXXXMBEjVywOft+fJPiEn2GVsIXu8GByRC44pW4jMs1dsLsMQr4PDCYgyZlbrKrd8dbPP29hcCXIhIFNT9b02BiDnx5T/8+58MgkgHYNIQbWFAAyODg6Oui3E6D+8d0sOhrUbHHXMXu8isHqW6tlJQQaJ3xvvBsGXhlTHhjv3JdW4kFQMoh9gcHRYcIwByPz9+7aGYq3fVntVLBhe+9PNVRpxgqSTSyOTkCWQsl8n2HjX/iSAtC2Q6nGVRBgcM68JUXCMAcj90/u3VhEibc9VCSM1FD6lvjp1ZKvvAQIAA5/f3yiJAGq6P4MjDMExBiD3jx84v4oQimRwuKkqjQXXtnodJpAAAYBNdz+VjAEpW+6v2whcBkdgwVEHUIqFODAckQ+OuVR3cidWaQILEAAYuOdAAqrUFhOze7UYHJ4HxzSAUQgU/vkD54eiDWM5XRccbqpKk0Zn9dIEGiAAsOXeA40NugFYQk26Y3C0HRzjAAr/etWg9kLgpnV1cLh1YIgEHiCOrfdNpABYxwVSMaCfwaEVHNMxIUYBlP7lqsEqOhSDYwEqRDLwZuMovxkLEADYev9E8jiEBdlLM8jgkLfnBMd0D1CyhSgc+WAyEpu0MziW4WoTCfukPqMBAgADD5T7YkDquPx+JW1nUebuDI4pQJQAlCrDF0QiLNwYHE1SY0WcEAlz74zxAHFs+sJkX0xuxJwEkBAQScjbjVJchIKjDqBkCzkY8vupt1ab/DZ1JAZHC1whYkHOrTE1VsQZ4g/MngdUDkNwLGbgoYPOnKSEEEgAwjoO9NlCDHZQcEwBqNhq3+If/u7bIleqWAqDwyNqNG1CfVnq7nYn501jZiJgFfKXFGEOhXZtLhxOHFffR1sgIUssog9AUriWUAQCC466DVR6BCq2/BlUnvu9C8tevudOxOAIgBqEltB4ScWvneU63UDxmYQtv5d9QogkAKiqUJ8rOIaaCI5pIURVPR8AKkKW2mALlHsAPPehi8q+v6EOxeAgIm1z170lIloWg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEgbg4OItDE4iEjb/wMjwhH4i90hIgAAAABJRU5ErkJggg==" />';var Nt="dai:";function v(a,e="question"){if(!a)return N[e]??N.question;if(N[a])return N[a];if(a.startsWith(Nt)){let t=a.slice(Nt.length);return N[t]??N[e]??N.question}return a.includes(":")?`<ha-icon class="icon" icon="${a}"></ha-icon>`:N[e]??N.question}function Ui(a,e={}){switch(String(a??"").split(".")[0]){case"light":return"bulb";case"switch":return"switchOn";case"cover":return e.device_class==="gate"?"gate":e.device_class==="awning"||e.device_class==="blind"?"awning":"shutter";case"person":case"device_tracker":return"person";case"climate":return"thermo";case"binary_sensor":return e.device_class==="smoke"?"smoke":"shield";case"alarm_control_panel":return"shield";case"scene":case"script":case"input_button":case"button":return"star";case"weather":return"cloudSun";case"date":return"calendar";case"time":case"datetime":return"clock";case"input_datetime":return e.has_time===!1?"calendar":"clock";case"input_select":case"select":return"keuzelijst";case"media_player":return e.device_class==="tv"?"tv":e.device_class==="receiver"?"radio":"speaker";default:return"question"}}function Jt(a){switch(a){case"sunny":case"clear-night":return"sun";case"partlycloudy":return"cloudSun";case"cloudy":return"cloud";case"rainy":case"pouring":case"hail":case"lightning":case"lightning-rainy":return"rain";case"snowy":case"snowy-rainy":return"snow";case"fog":return"fog";case"windy":case"windy-variant":return"wind";default:return"cloud"}}var Xn=[["Woning",["house","homeLeave","homeStatus","homeThermo","floorB","floor1","floor2","garage","door","window","stairs","grid"]],["Kamers",["bed","bedDouble","wardrobe","hanger","sofa","lounge","eettafel","kitchen","shower","toilet","desk","speelkamer","garage","storage"]],["Buiten",["tree","parasol","veranda","fence","gate","sun","awning","gras","kruiden","car","beach"]],["Rolluiken",["shutter","shutterOpen","awning","gate","gateOpen","garageOpen","garageClosed","arrowUp","arrowDown","stop"]],["Navigatie",["arrowLeft","arrowRight","arrowUp","arrowDown","chevronLeft","chevronRight","chevronDown","house","grid","close"]],["Licht en stroom",["bulb","bulbGroup","switchOn","power","plug","bolt","battery"]],["Personen",["person","people","away","dier"]],["Apparaten",["tv","speaker","camera","cctv","car","van","washer","dishwasher","koelkast","oven","magnetron","printer","printer3d","fan","airco","radio","boiler"]],["Media",["play","pause","next","prev","volume","volumeMute","shuffle","repeat","repeatOne","search","speakers","music"]],["Afval",["bin","binWheeled","calendar"]],["Verwarming en klimaat",["floorHeating","heatPump","circulatiepomp","boiler","thermo","homeThermo","celsius","gas","pressure","refill"]],["Auto en tanken",["car","petrol","diesel","gas","fuelStation","raceCar","plug"]],["Weer",["sun","cloud","cloudSun","rain","snow","fog","wind","drop","uv","sunrise","sunset","thermo"]],["Weermetingen",["humidity","lux","windSpeed","rainfall","weatherCode","forecast","weatherStation","rainRadar","pollenradar","uv","pressure","thermo"]],["Status",["shield","alarmOff","alarmPartial","alarmOn","lock","lockOpen","key","wifi","smoke","smokeDetector","co","warning","check","handmatig","close","clock","gaugeArrow","bell","bellOff","pressure","refill","sleep","siren","sirenOff","homeStatus"]],["Cijfers",["een","twee","drie","vier","vijf","zes","zeven","acht","negen","tien"]],["Sport en vrije tijd",["football","sports","dumbbell","raceCar","beach"]],["Overig",["star","moon","leaf","cog","qr","keuzelijst","dots","plus","minus","chevronRight","chevronDown","question","pencil","domotitech"]]],$l={house:["huis","woning","thuis","home","hal","gang","entree","overzicht"],floorB:["begane grond","beneden","vloer","verdieping","etage","ground floor"],floor1:["1e verdieping","eerste","boven","vloer","etage","first floor"],floor2:["2e verdieping","tweede","zolder","vloer","etage","second floor"],garage:["garage","schuur","carport","berging"],door:["deur","voordeur","achterdeur","toegang","door","opening"],window:["raam","venster","ruit","window","kozijn"],stairs:["trap","overloop","traphal","stairs","treden","boven"],grid:["raster","kamers","overzicht","tegels","menu","grid","apps"],floorHeating:["vloerverwarming","vloer","verwarming","vloerverwarmingg","leidingen","cv","warm","underfloor","floor heating"],heatPump:["warmtepomp","pomp","buitenunit","heat pump","verwarming","koelen","airco","hybride"],qr:["qr","qr-code","qrcode","code","scan","wifi code","streepjescode","gast"],siren:["sirene","alarm","alarmsirene","geluid","brandalarm","siren","aan"],sirenOff:["sirene uit","alarm uit","sirene uitzetten","stil","dempen","siren off","uitschakelen"],petrol:["benzine","tanken","brandstof","pomp","benzinepomp","petrol","euro 95","brandstofpomp"],diesel:["diesel","tanken","brandstof","pomp","dieselpomp","druppel"],gas:["gas","aardgas","vlam","gasverbruik","gasmeter","brander","gaskachel"],fuelStation:["tankstation","tanken","pompstation","benzinestation","luifel","fuel station","brandstof"],homeThermo:["klimaat","klimaat in de woning","woning thermometer","binnentemperatuur","temperatuur","huis thermometer","verwarming","thermostaat"],homeStatus:["woning status","status","huis status","alles in orde","huisstatus","woning","controle","check"],lounge:["lounge","fauteuil","stoel","zithoek","loungestoel","zitkamer","relax"],dumbbell:["sportschool","halter","gewicht","fitness","gym","dumbbell","krachttraining","sporten"],storage:["opslag","dozen","berging","zolder","kelder","opbergen","voorraad","storage","kast"],celsius:["celsius","graden","temperatuur","graad","c","thermometer","warmte"],domotitech:["domotitech","logo","merk","website","domoti","domotica"],beach:["strand","zee","golven","kust","vakantie","zon en zee","beach","zomer","water"],sleep:["slapen","zzz","slaapstand","nachtmodus","slaap","sleep","rust","nacht","welterusten","dutje"],boiler:["ketel","cv","cv-ketel","boiler","verwarming","ketelstatus","boiler status","vlam","warmte"],pressure:["druk","bar","waterdruk","manometer","meter","pressure","keteldruk","spanning"],bell:["notificatie","melding","bel","meldingen","alert","waarschuwing","notification","bericht"],bellOff:["meldingen uit","stil","niet storen","geen meldingen","bel uit","mute","gedempt","notificaties uit"],refill:["bijvullen","water bijvullen","vullen","water","peil","niveau","reservoir","refill","aanvullen"],football:["voetbal","bal","voetballen","sport","wedstrijd","football","soccer","eredivisie"],sports:["sport","sporten","sportief","bewegen","tennis","racket","wedstrijd","sports","verschillende sporten"],raceCar:["formule 1","f1","racewagen","raceauto","autosport","race","grand prix","verstappen","circuit"],cctv:["camera","bewakingscamera","cctv","beveiliging","toezicht","surveillance","buitencamera","beveiligingscamera"],bed:["slaapkamer","bed","slapen","slaap","sleep","bedroom","nacht","welterusten","logeerkamer"],bedDouble:["tweepersoonsbed","2 persoonsbed","bed","slaapkamer","slapen","sleep","double bed","twee personen","ouderslaapkamer","nacht"],wardrobe:["kledingkast","kast","garderobe","kleding","wardrobe","closet","inloopkast","slaapkamer"],hanger:["kleerhanger","hanger","kleding","kleren","garderobe","wasgoed","kledingkast","outfit"],sofa:["woonkamer","bank","sofa","zithoek","salon","living","livingroom","couch"],kitchen:["keuken","koken","pan","kitchen","cooking","eten","fornuis","kookplaat"],shower:["badkamer","douche","shower","bad","bathroom","wassen","sanitair"],toilet:["wc","toilet","sanitair","badkamer","restroom","plee"],desk:["kantoor","werkkamer","bureau","desk","office","computer","monitor","beeldscherm"],speelkamer:["speelkamer","kinderkamer","speelgoed","kinderen","kind","beer","teddybeer","knuffel","spelen","playroom","speelhoek"],tree:["tuin","boom","buiten","garden","tree","achtertuin","voortuin","groen","natuur"],parasol:["terras","buiten","parasol","tuin","balkon","veranda","zonnescherm","outdoor","patio"],fence:["erf","hek","buiten","tuin","schutting","oprit","poort","fence","omheining"],shutter:["rolluik","gordijn","zonwering","shutter","screen","jaloezie","dicht","gesloten","cover"],shutterOpen:["rolluik open","gordijn open","zonwering","shutter","cover","omhoog"],awning:["zonnescherm","luifel","markies","awning","terras","zonwering","buiten"],gate:["poort","hek","toegangspoort","oprit","inrit","gate","schuifpoort","draaipoort","erf","dicht","gesloten"],gateOpen:["poort open","poort","hek open","gate open","oprit","toegang","geopend","open"],garageOpen:["garagedeur open","garage","deur open","omhoog","geopend"],garageClosed:["garagedeur dicht","garage","deur dicht","gesloten","omlaag"],arrowUp:["omhoog","pijl omhoog","open","up","boven","openen","stijgen"],arrowDown:["omlaag","pijl omlaag","dicht","down","beneden","sluiten","dalen"],stop:["stop","stoppen","halt","vierkant","square"],bulb:["lamp","licht","verlichting","peer","light","bulb","spot","schemerlamp"],bulbGroup:["lampen","lichtgroep","verlichting","groep","lights","alle lampen"],switchOn:["schakelaar","knop","switch","aan uit","toggle","aanuit"],power:["aan uit","power","stroom","uitknop","aanknop","standby"],plug:["stopcontact","stekker","plug","socket","outlet","smart plug"],bolt:["stroom","energie","bliksem","elektriciteit","verbruik","power","energy","watt","kwh"],battery:["batterij","accu","battery","lading","opladen","percentage"],person:["persoon","iemand","gebruiker","person","wie","profiel","aanwezig"],people:["personen","mensen","gezin","iedereen","familie","people","gasten"],away:["weg","afwezig","niet thuis","away","vertrokken","uit huis"],dier:["dier","huisdier","hond","kat","poot","pootafdruk","pet","animal","beest"],homeLeave:["woning verlaten","verlaten","weggaan","vertrekken","huis uit","afsluiten","de deur uit","leave","exit","weg","huis"],tv:["televisie","tv","scherm","kijken","netflix","mediaspeler","chromecast"],speaker:["speaker","luidspreker","boxje","geluid","audio","sonos"],camera:["camera","beveiliging","bewaking","cctv","deurbel","opname","beeld"],car:["auto","wagen","car","laadpaal","opladen","voertuig","oprit","buiten"],washer:["wasmachine","was","wassen","washer","wasdroger","droger","laundry","wasruimte"],dishwasher:["vaatwasser","afwas","vaat","dishwasher","afwasmachine"],van:["bus","bedrijfsbus","bestelbus","bestelwagen","busje","transit","auto","van","camper","werkbus"],handmatig:["handmatig","hand","zelf","met de hand","bedienen","tikken","manueel","handbediening","override"],koelkast:["koelkast","koeling","vriezer","diepvries","fridge","keuken","vriescombinatie"],oven:["oven","bakoven","fornuis","keuken","bakken","stoomoven"],magnetron:["magnetron","microgolf","opwarmen","keuken","combimagnetron"],eettafel:["eettafel","tafel","eten","eetkamer","diner","keukentafel","stoelen"],veranda:["veranda","overkapping","terrasoverkapping","afdak","carport","buiten","tuinkamer"],pollenradar:["pollen","pollenradar","hooikoorts","allergie","stuifmeel","radar","verwachting"],gras:["gras","graspollen","grasmaaier","gazon","hooikoorts","pollen","tuin"],kruiden:["kruiden","kruidpollen","bijvoet","onkruid","plant","pollen","hooikoorts"],circulatiepomp:["circulatiepomp","pomp","cv","cv-pomp","verwarming","circulatie","vloerverwarming"],printer:["printer","printen","papier","print"],printer3d:["3d printer","3d-printer","bambu","prusa","filament","printer","nozzle","printen"],fan:["ventilator","fan","ventilatie","afzuiging","wtw","luchtverversing","koelen"],airco:["airco","airconditioning","koeling","warmtepomp","klimaat","verwarming","hvac"],radio:["radio","zender","fm","stream","muziek","antenne"],play:["afspelen","play","start","spelen","muziek","starten"],pause:["pauze","pause","pauzeren","stil","onderbreken"],next:["volgende","next","verder","vooruit","overslaan","skip"],prev:["vorige","previous","terug","achteruit","prev"],volume:["volume","geluid","harder","luid","audio","sound"],volumeMute:["stil","mute","gedempt","geluid uit","dempen"],shuffle:["willekeurig","shuffle","husselen","door elkaar","random"],repeat:["herhalen","repeat","loop","opnieuw","herhaling"],repeatOne:["een herhalen","repeat one","herhalen","loop","dit nummer"],search:["zoeken","zoek","search","vergrootglas","vinden","opzoeken"],speakers:["speakers","groep","multiroom","luidsprekers","audio","koppelen"],music:["muziek","noot","music","nummer","liedje","spotify","audio"],bin:["afval","vuilnis","prullenbak","bak","container","waste","trash","kliko"],binWheeled:["kliko","container","afval","vuilnisbak","rolcontainer","ophaaldag","waste"],calendar:["agenda","kalender","datum","afspraak","planning","calendar","dag"],sun:["zon","zonnig","helder","sun","zonnepanelen","dag","weer","buiten"],cloud:["bewolkt","wolk","cloud","betrokken","grijs","weer"],cloudSun:["halfbewolkt","wolk","zon","weer","wisselend","partly cloudy"],rain:["regen","buien","nat","rain","neerslag","weer","paraplu"],snow:["sneeuw","winter","vorst","snow","koud","ijs","weer"],fog:["mist","nevel","fog","zicht","weer"],wind:["wind","waait","storm","bries","windkracht","weer"],drop:["druppel","vocht","luchtvochtigheid","water","regen","humidity","nat","lekkage"],uv:["uv","uv index","zon","straling","zonkracht","huid"],humidity:["vochtigheid","luchtvochtigheid","vocht","humidity","procent","rv","hygrometer","weer"],lux:["lux","lichtsterkte","helderheid","verlichtingssterkte","illuminance","lichtsensor","lichtmeter","lumen"],windSpeed:["windsnelheid","wind","windkracht","beaufort","anemometer","wind speed","km/u","storm","weer"],rainfall:["regen","neerslag","regenmeter","millimeter","mm","rainfall","buien","hoeveelheid","weer"],weatherCode:["weercode","code","weather code","weertype","conditie","weer"],forecast:["voorspelling","verwachting","forecast","vooruitzicht","morgen","weerbericht","weer"],weatherStation:["weerstation","station","meetstation","weather station","mast","anemometer","weer"],rainRadar:["buienradar","regenradar","radar","buien","neerslagradar","rain radar","weer"],sunrise:["zonsopkomst","opkomst","ochtend","sunrise","dageraad","vroeg"],sunset:["zonsondergang","ondergang","avond","sunset","schemer"],thermo:["temperatuur","thermometer","graden","warm","koud","thermostaat","klimaat","verwarming"],shield:["beveiliging","schild","alarm","veilig","bescherming","shield","security"],lock:["slot","op slot","vergrendeld","gesloten","lock","sleutel","dicht","beveiligd"],lockOpen:["slot open","ontgrendeld","geopend","unlock","los","open"],key:["sleutel","key","toegang","code","wachtwoord","slot"],wifi:["wifi","netwerk","internet","verbinding","router","signaal","wlan"],smoke:["rookmelder","rook","brand","smoke","melder","vuur","alarm"],smokeDetector:["rookmelder","melder","rook","brand","smoke detector","detector","plafond","alarm"],co:["koolmonoxide","co","gas","melder","cv","kachel","carbon monoxide","vergiftiging"],warning:["waarschuwing","let op","attentie","warning","uitroepteken","storing","probleem"],check:["goed","vinkje","in orde","klaar","check","gelukt"],close:["sluiten","kruis","dicht","annuleren","close","weg"],clock:["klok","tijd","uur","wekker","timer","clock","wanneer"],gaugeArrow:["meter","wijzer","stand","gauge","niveau","druk","snelheid"],een:["1","een","eerste","one"],twee:["2","twee","tweede","two"],drie:["3","drie","derde","three"],vier:["4","vier","vierde","four"],vijf:["5","vijf","vijfde","five"],zes:["6","zes","zesde","six"],zeven:["7","zeven","zevende","seven"],acht:["8","acht","achtste","eight"],negen:["9","negen","negende","nine"],tien:["10","tien","tiende","ten"],star:["ster","favoriet","star","belangrijk","voorkeur","top"],moon:["maan","nacht","slapen","donker","moon","nachtstand","avond"],leaf:["blad","groen","eco","duurzaam","plant","natuur","besparen","tuin"],keuzelijst:["keuzelijst","keuze","lijst","modus","stand","programma","dropdown","select","kiezen","opties"],cog:["instellingen","tandwiel","beheer","settings","configuratie","opties","systeem"],arrowLeft:["terug","pijl links","links","vorige","back","arrow left"],arrowRight:["verder","pijl rechts","rechts","volgende","next","arrow right"],chevronLeft:["pijltje links","links","terug","inklappen","chevron left"],alarmOff:["alarm uit","alarm uitgeschakeld","uitgeschakeld","ontwapend","disarmed","alarm","beveiliging","shield"],alarmPartial:["alarm deels","deelinschakeling","1e schil","eerste schil","thuis","nachtstand","armed home","armed_custom_bypass","bypass","alarm","beveiliging"],alarmOn:["alarm aan","alarm ingeschakeld","volledig aan","ingeschakeld","armed","armed_away","afwezig","alarm","beveiliging"],dots:["meer","drie puntjes","menu","opties","extra","overig","more"],plus:["plus","meer","erbij","toevoegen","hoger","omhoog","add"],minus:["min","minder","eraf","lager","verwijderen","omlaag"],chevronRight:["pijl rechts","verder","volgende","chevron","open","meer"],chevronDown:["pijl omlaag","uitklappen","openklappen","chevron","meer","dropdown"],question:["vraagteken","onbekend","hulp","help","vraag","geen idee"],pencil:["potlood","bewerken","wijzigen","aanpassen","edit","pen","instellen"]},Fi=a=>String(a??"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();function zm(a,e){let t=[...($l[a]??[]).map(Fi),Fi(a)],n=0;for(let i=0;i<t.length;i++){let r=t[i];if(!r)continue;let o=0;for(let s of[r,...r.split(" ")])s===e?o=Math.max(o,3):s.startsWith(e)?o=Math.max(o,2):s.includes(e)&&(o=Math.max(o,1));if(o&&(n=Math.max(n,o+.5/(1+i))),n>=3.5)break}return n}function $m(a,e){let t=0;for(let n of e){let i=zm(a,n);if(!i)return 0;t+=i}return t}var Fe=a=>$l[a]?.[0]??a;function Em(a=Xn){let e=[];for(let[,t]of a)for(let n of t)e.includes(n)||e.push(n);return e}function El(a,e=Xn){let t=Fi(a).split(" ").filter(Boolean);if(!t.length)return e;let n=[];for(let i of Em(e)){let r=$m(i,t);r&&n.push({sleutel:i,score:r})}return n.sort((i,r)=>r.score-i.score||Fe(i.sleutel).localeCompare(Fe(r.sleutel))),[[`${n.length} gevonden`,n.map(i=>i.sleutel)]]}var Am=`
  ${U}
  :host { ${W} display: block; font-family: var(--dac-font); }
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
`,qi=null,Al=a=>a.map(([e,t])=>`
      <div class="group">
        <h4>${e}</h4>
        <div class="grid">
          ${t.map(n=>`<button type="button" class="opt" data-icon="${n}" title="${Fe(n)} (${n})" aria-pressed="false">${N[n]??""}<span class="naam">${Fe(n)}</span></button>`).join("")}
        </div>
      </div>`).join(""),Zi=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),qi=qi??[Q(Am)],this.shadowRoot.adoptedStyleSheets=qi,this.value_="",this.vraag_="",this.label="Icoon",this.fallback="question",this.auto=!0}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}connectedCallback(){F(this,{alleenMeten:!0}),!this.built_&&(this.built_=!0,this.build_())}build_(){this.shadowRoot.innerHTML=`
      <div class="label"></div>
      <div class="box">
        <button type="button" class="current" aria-expanded="false">
          <span class="preview"></span>
          <span class="who"><b></b><small></small></span>
          <span class="caret">${N.chevronDown}</span>
        </button>
        <div class="panel">
          <div class="zoekrij">
            <span class="zoekveld">
              <span class="loep">${N.search}</span>
              <input id="zoek" type="search" placeholder="Zoek een icoon -- slapen, gordijn, vaatwasser"
                     spellcheck="false" autocomplete="off" />
              <button type="button" class="wis" title="Zoekopdracht wissen">${N.close}</button>
            </span>
          </div>
          <div class="groepen">${Al(Xn)}</div>
          <div class="mdi">
            <label for="mdi">Of Home Assistant-icoon</label>
            <input id="mdi" type="text" placeholder="mdi:washing-machine" spellcheck="false" />
            <button type="button" class="clear">Wissen</button>
          </div>
        </div>
      </div>`,this.$(".current").addEventListener("click",()=>{let n=this.toggleAttribute("open");this.$(".current").setAttribute("aria-expanded",String(n)),n&&requestAnimationFrame(()=>this.$("#zoek").focus())});let e=this.$("#zoek");e.addEventListener("input",()=>this.zoek_(e.value)),e.addEventListener("keydown",n=>{if(n.key==="Escape"){n.stopPropagation(),this.zoek_(""),e.value="";return}if(n.key!=="Enter")return;let i=this.shadowRoot.querySelectorAll(".opt");i.length===1&&(n.preventDefault(),this.emit_(i[0].dataset.icon))}),this.$(".wis").addEventListener("click",()=>{e.value="",this.zoek_(""),e.focus()}),this.$(".groepen").addEventListener("click",n=>{let i=n.target.closest?.(".opt");i&&this.emit_(i.dataset.icon)});let t=this.$("#mdi");t.addEventListener("change",()=>this.emit_(t.value.trim())),this.$(".clear").addEventListener("click",()=>this.emit_("")),this.paint_()}zoek_(e){this.vraag_=e??"",this.toggleAttribute("zoekt",!!this.vraag_.trim());let t=El(this.vraag_),n=this.$(".groepen"),i=t.length===1&&!t[0][1].length;n.innerHTML=i?`<div class="niets">Geen icoon gevonden voor "${this.vraag_.trim()}".<br>Een <code>mdi:</code>-naam hieronder werkt altijd.</div>`:Al(t),n.scrollTop=0,this.markeer_()}markeer_(){for(let e of this.shadowRoot.querySelectorAll(".opt"))e.setAttribute("aria-pressed",String(e.dataset.icon===this.value_))}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Icoon";let e=this.value_,t=e||this.fallback||"question";this.$(".preview").innerHTML=v(t,this.fallback),this.$(".who b").textContent=e?e.includes(":")?e:Fe(e):this.auto?"Automatisch":"Kies een icoon",this.$(".who small").textContent=e?e.includes(":")&&!e.startsWith(Nt)?"Home Assistant-icoon":`DomotiApp-icoon -- ${e.startsWith(Nt)?e:Nt+e}`:this.auto?"Past zich aan de entiteit aan":"Nog niets gekozen",this.markeer_();let n=this.$("#mdi");if(this.shadowRoot.activeElement===n)return;let i=e&&e.includes(":")?e:"";n.value!==i&&(n.value=i)}emit_(e){this.value_=e,this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};H("dac-icon-picker",Zi);var Sm=/^(#[0-9a-f]{3,8}|var\(--[\w-]+\)|rgba?\([^)]*\))$/i,Mm=`
  ${U}
  :host { ${W} display: block; font-family: var(--dac-font); }
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
`,Yi=null,Xi=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),Yi=Yi??[Q(Mm)],this.shadowRoot.adoptedStyleSheets=Yi,this.value_="",this.label="Kleur"}set value(e){this.value_=e??"",this.built_&&this.paint_()}get value(){return this.value_}set compact(e){this.toggleAttribute("compact",!!e)}get compact(){return this.hasAttribute("compact")}connectedCallback(){F(this,{alleenMeten:!0}),!this.built_&&(this.built_=!0,this.build_())}kleur_(){return E[this.value_]??this.value_}build_(){this.shadowRoot.innerHTML=`
      <div class="label"></div>
      <div class="box">
        <div class="rij">
          <span class="sw eigen leeg" role="button" tabindex="-1" title="Kleur kiezen"
                aria-pressed="false">
            ${N.check}
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
      </div>`;let e=this.$('input[type="color"]');e.addEventListener("input",()=>this.emit_(e.value));let t=this.$("#vrij");t.addEventListener("change",()=>{let n=t.value.trim();if(!n){this.emit_("");return}let i=Sm.test(n);t.setAttribute("aria-invalid",String(!i)),i&&this.emit_(n)}),this.$(".wissen").addEventListener("click",()=>this.emit_("")),this.paint_()}paint_(){if(!this.shadowRoot.firstElementChild)return;this.$(".label").textContent=this.label??"Kleur";let e=!!this.value_,t=this.$(".sw");t.setAttribute("aria-pressed",String(e)),t.classList.toggle("leeg",!e),t.style.setProperty("--c",e?this.kleur_():"transparent"),t.title=e?`Kleur: ${zl[this.value_]??this.value_}`:"Kleur kiezen",/^#[0-9a-f]{6}$/i.test(this.kleur_())&&(this.$('input[type="color"]').value=this.kleur_()),this.$(".wissen").hidden=!e;let n=this.$("#vrij");if(this.shadowRoot.activeElement!==n){let i=this.value_ in E?"":this.value_;n.value!==i&&(n.value=i),n.setAttribute("aria-invalid","false")}}emit_(e){this.value_=e??"",this.paint_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:this.value_},bubbles:!0,composed:!0}))}$(e){return this.shadowRoot.querySelector(e)}};H("dac-tone-picker",Xi);var f={entity:a=>({entity:a?{domain:a}:{}}),text:()=>({text:{}}),multiline:()=>({text:{multiline:!0}}),bool:()=>({boolean:{}}),number:(a,e,t=1)=>({number:{min:a,max:e,step:t,mode:"box"}}),select:a=>({select:{mode:"dropdown",options:a}}),action:(a="more-info")=>({ui_action:{default_action:a}})},Ve=(...a)=>({type:"grid",name:"",schema:a}),Be=(a,e,t,n=!1)=>({type:"expandable",name:"",title:a,icon:e,expanded:n,schema:t}),Nm=[{name:"bare",selector:f.bool()}],Dm={bare:"Haalt de vulling en de schaduw onder de kaart weg. De rand blijft staan, zodat de kaart nog een vorm heeft op een dashboard zonder vlakken."},L=class extends HTMLElement{constructor(){super(),this.config_={},this.built_=!1}setConfig(e){this.config_={...this.defaults(),...e},this.render_()}defaults(){return{}}set hass(e){this.hass_=e,this.form_&&(this.form_.hass=e);for(let t of this.pickers_??[])t.hass=e;this.render_()}get hass(){return this.hass_}connectedCallback(){this.render_()}schema(){return[]}gedeeldeVelden(){return Nm}volledigSchema_(){return[...this.schema(),...this.gedeeldeVelden()]}pickers(){return[]}label(e){return e.type==="expandable"?e.title??"":Lm[e.name]??e.name}helper(){}async render_(){if(!this.hass_||!this.config_)return;if(this.built_){this.sync_();return}this.built_=!0,await customElements.whenDefined("ha-form"),this.replaceChildren(),this.pickers_=[];let e=this.pickers();this.pickerSig_=e.map(o=>o.key).join("|");let t=o=>{let s=document.createElement("div");return s.style.cssText=`display:flex;flex-direction:column;gap:12px;${o}`,s},n=t("margin-bottom:16px"),i=t("margin-top:16px");for(let o of e){let s=document.createElement({tone:"dac-tone-picker",foto:"dac-foto-picker"}[o.kind]??"dac-icon-picker");s.label=o.label,s.fallback=o.fallback,o.auto===!1&&(s.auto=!1),o.statuses===!1&&(s.statuses=!1),o.compact&&(s.compact=!0),s.hass=this.hass_,s.value=this.config_[o.key],s.addEventListener("value-changed",l=>{l.stopPropagation(),this.patch_({[o.key]:l.detail.value})}),this.pickers_.push(s),s.dataset.key=o.key,(o.after?i:n).appendChild(s)}n.children.length&&this.appendChild(n);let r=document.createElement("ha-form");r.hass=this.hass_,r.data=this.config_,r.schema=this.volledigSchema_(),r.computeLabel=o=>this.label(o),r.computeHelper=o=>this.helper(o)??Dm[o.name],r.addEventListener("value-changed",o=>{o.stopPropagation(),this.patch_(o.detail.value,!0)}),this.form_=r,this.appendChild(r),i.children.length&&this.appendChild(i)}sync_(){let e=this.pickers().map(t=>t.key).join("|");if(this.pickerSig_!==void 0&&this.pickerSig_!==e){this.built_=!1,this.form_=null,this.render_();return}this.form_&&(this.form_.hass=this.hass_,this.form_.schema=this.volledigSchema_(),this.form_.data=this.config_);for(let t of this.pickers_??[])t.hass=this.hass_,t.value=this.config_[t.dataset.key]}patch_(e,t=!1){let n=t?{...e}:{...this.config_,...e};this.config_.type&&(n.type=this.config_.type);for(let[i,r]of Object.entries(n))(r===""||r===void 0||r===null)&&delete n[i];this.config_=n,this.sync_(),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.serialize(n)},bubbles:!0,composed:!0}))}serialize(e){return e}},Lm={entity:"Entiteit",entities:"Entiteiten",name:"Naam",icon:"Icoon",tone:"Kleur",secondary:"Tweede regel",layout:"Vorm",tap_action:"Tikken",hold_action:"Vasthouden",double_tap_action:"Dubbeltikken",show_state:"Status tonen",show_name:"Naam tonen",show_icon:"Icoon tonen",fill:"Vullen",collapsible:"Inklapbaar",title:"Titel",subtitle:"Ondertitel",weather:"Weerentiteit",sun:"Zon-entiteit",person:"Persoon",persons:"Personen",covers:"Rolluiken",lights:"Lampen",sensors:"Sensoren",greeting:"Begroeting",show_clock:"Klok tonen",show_weather:"Weer tonen",show_chips:"Weerdetails tonen",compact:"Compact",columns:"Kolommen",group:"Groepsregel tonen",invert:"Open en dicht omdraaien",label:"Label",color:"Kleur",date_format:"Datumnotatie",bare:"Achtergrond weglaten"};function Tm(a=new Date){let e=a.getHours();return e<6?"Goedenacht":e<12?"Goedemorgen":e<18?"Goedemiddag":"Goedenavond"}var Om=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],Cm=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],Qi={humidity:{icon:"drop",tone:"water",label:"Luchtvochtigheid"},wind:{icon:"wind",tone:"neutral",label:"Wind"},uv:{icon:"uv",tone:"solar",label:"UV-index"},precipitation:{icon:"rain",tone:"water",label:"Neerslag"},pressure:{icon:"gaugeArrow",tone:"neutral",label:"Luchtdruk"},sunrise:{icon:"sunrise",tone:"warn",label:"Zonsopkomst"},sunset:{icon:"sunset",tone:"warn",label:"Zonsondergang"}},Rm=["humidity","wind","uv","precipitation","sunset"],Hm=a=>a==null||Number.isNaN(+a)?"":["N","NO","O","ZO","Z","ZW","W","NW"][Math.round(+a/45)%8],Qn=class extends S{validate(e){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768,...e}}watched(){let e=this.config;return[e.weather,e.weather_uv,e.sun,e.precipitation_entity].filter(Boolean)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.show_rule===!1&&this.setAttribute("no-rule",""),`
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
      </div>`}wire(){let e=()=>{let n=6e4-Date.now()%6e4+50;this.timer_=setTimeout(()=>{this.paintClock_(),e()},n)};e(),this.teardown_.push(()=>clearTimeout(this.timer_));let t=Number(this.config.hide_below)||0;if(t>0){let n=matchMedia(`(max-width: ${t-1}px)`),i=()=>this.toggleAttribute("narrow",n.matches);i(),n.addEventListener("change",i),this.teardown_.push(()=>n.removeEventListener("change",i))}}paintClock_(){let e=new Date,t=this.config.name??this.hass?.user?.name??"",n=Tm(e);this.$(".hello").innerHTML=t?`${n}, <b>${t}</b>`:n,this.text(".date",`${Om[e.getDay()]} ${e.getDate()} ${Cm[e.getMonth()]}`);let i=this.$(".clock");i&&this.text(i,e.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"}))}paint(){this.paintClock_();let e=this.config,t=k(this.hass,e.weather),n=J(this.hass,e.weather),i=this.$(".now");if(i&&t){let l=Jt(t.state);i.style.setProperty("--wtone",ee(e.tone,"water"));let d=this.hass?.config?.unit_system?.temperature??"\xB0C";this.$(".temp").innerHTML=n.temperature!=null?`${G(this.hass,n.temperature,0)}<span>${d}</span>`:"--";let c=i.querySelector(".ic");c.dataset.icon!==l&&(c.dataset.icon=l,c.innerHTML=v(l,"cloud")),this.text(i.querySelector(".cond"),te(this.hass,t))}let r=this.$(".chips");if(!r)return;let o=Rm.map(l=>this.chip_(l,n)).filter(Boolean),s=o.map(l=>`${l.key}${l.value}`).join("|");r.dataset.sig!==s&&(r.dataset.sig=s,r.innerHTML=o.map(l=>`<span class="chip2" style="--tone:${ee(Qi[l.key].tone)}" title="${Qi[l.key].label}">
             ${N[Qi[l.key].icon]??""}${l.value}
           </span>`).join(""))}chip_(e,t){let n=this.config;switch(e){case"humidity":return t.humidity!=null?{key:e,value:`${Math.round(t.humidity)}%`}:null;case"wind":{if(t.wind_speed==null)return null;let i=this.hass?.config?.unit_system?.wind_speed??"km/h",r=Hm(t.wind_bearing);return{key:e,value:`${G(this.hass,t.wind_speed,0)} ${i}${r?` ${r}`:""}`}}case"uv":{let r=J(this.hass,n.weather_uv).uv_index??t.uv_index??(n.weather_uv?Number(k(this.hass,n.weather_uv)?.state):null);return r!=null&&!Number.isNaN(+r)?{key:e,value:`UV ${G(this.hass,r,1)}`}:null}case"precipitation":{let i=k(this.hass,n.precipitation_entity);if(i){let r=Number(i.state);if(Number.isNaN(r))return null;let o=i.attributes.unit_of_measurement??"mm";return{key:e,value:`${G(this.hass,r,1)} ${o}`}}return t.precipitation!=null&&!Number.isNaN(+t.precipitation)?{key:e,value:`${G(this.hass,t.precipitation,1)} mm`}:null}case"pressure":return t.pressure!=null?{key:e,value:`${G(this.hass,t.pressure,0)} ${t.pressure_unit??"hPa"}`}:null;case"sunset":case"sunrise":{let r=k(this.hass,n.sun)?.attributes?.[e==="sunset"?"next_setting":"next_rising"];if(!r)return null;let o=new Date(r);return Number.isNaN(+o)?null:{key:e,value:o.toLocaleTimeString(this.hass?.locale?.language??"nl",{hour:"2-digit",minute:"2-digit"})}}default:return null}}getCardSize(){return 2}getGridOptions(){return{columns:"full",rows:2,min_rows:2,max_rows:2}}static getConfigElement(){return document.createElement("domotiapp-header-card-editor")}static getStubConfig(e){return{weather:Object.keys(e?.states??{}).find(n=>n.startsWith("weather.")),sun:"sun.sun"}}};j(Qn,"css",`
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
  `);var Ji=class extends L{defaults(){return{show_clock:!0,show_weather:!0,show_chips:!0,show_rule:!0,hide_below:768}}schema(){return[Ve({name:"weather",selector:f.entity("weather")},{name:"weather_uv",selector:{entity:{domain:["weather","sensor"]}}}),Ve({name:"sun",selector:f.entity("sun")},{name:"precipitation_entity",selector:f.entity("sensor")}),{name:"name",selector:f.text()},{name:"hide_below",selector:f.number(0,1400,8)}]}label(e){return{weather:"Weer (temperatuur, wind)",weather_uv:"Tweede weerbron (UV-index)",precipitation_entity:"Neerslagsensor",show_rule:"Accentlijn tonen",hide_below:"Verbergen onder breedte (px)",name:"Naam"}[e.name]??super.label(e)}helper(e){if(e.name==="weather_uv")return"Alleen voor de UV-index. Handig als je hoofdbron die niet meelevert.";if(e.name==="precipitation_entity")return"Een sensor in mm of mm/h, bijvoorbeeld neerslagintensiteit of regen laatste uur.";if(e.name==="hide_below")return"768 verbergt de header op telefoons en houdt hem op tablets en desktops. 0 zet het uit.";if(e.name==="name")return"Leeg laten voor de naam van de ingelogde gebruiker."}};O("domotiapp-header-card-editor",Ji);D("domotiapp-header-card",Qn,{name:"DomotiApp Header",description:"Smalle strip met begroeting, weer en klok. Verbergt zichzelf op telefoons."});var Jn=class extends S{validate(e){return{icon:"",tone:"accent",line:!0,...e}}watched(){return this.config.secondary_entity?[this.config.secondary_entity]:[]}template(){let e=this.config,t=e.icon!==null&&e.icon!==!1;return t||this.setAttribute("no-icon",""),`
      <div class="sep" style="--tone:${ee(e.tone)}">
        ${t?`<span class="chip">${v(e.icon,"star")}</span>`:""}
        <h3></h3>
        ${e.line===!1?"":'<span class="rule"></span>'}
        <span class="sub"><span class="si"></span><span class="sv"></span></span>
      </div>`}paint(){this.text("h3",this.config.name??"");let e=this.$(".sub");if(!e)return;let t=k(this.hass,this.config.secondary_entity),n=e.querySelector(".si"),i=e.querySelector(".sv");if(!t){i.textContent="",n.innerHTML="";return}let r=this.config.secondary_icon??"";n.dataset.icon!==r&&(n.dataset.icon=r,n.innerHTML=r?v(r):"");let o=t.attributes.unit_of_measurement;i.textContent=o?`${t.state} ${o}`:t.attributes.current_temperature!=null?`${t.attributes.current_temperature} \xB0C`:te(this.hass,t)}getCardSize(){return 1}getGridOptions(){return{columns:"full",rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-separator-card-editor")}static getStubConfig(){return{name:"Nieuwe sectie",icon:"house",tone:"accent"}}};j(Jn,"css",`
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
  `);var er=class extends L{defaults(){return{line:!0,tone:"accent"}}gedeeldeVelden(){return[]}pickers(){return[{key:"icon",kind:"icon",label:"Icoon links",fallback:"star",auto:!1},{key:"secondary_icon",kind:"icon",label:"Icoon bij de waarde rechts",auto:!1}]}schema(){return[{name:"name",selector:f.text()},{name:"line",selector:f.bool()},{name:"secondary_entity",selector:f.entity()}]}label(e){return{line:"Lijn tonen",secondary_entity:"Waarde rechts (optioneel)"}[e.name]??super.label(e)}helper(e){if(e.name==="secondary_entity")return"Toont de status van deze entiteit rechts van de lijn, bijvoorbeeld een temperatuur of een aantal."}};O("domotiapp-separator-card-editor",er);D("domotiapp-separator-card",Jn,{name:"DomotiApp Separator",description:"Sectiekop met icoon en vervagende lijn."});var Im={goed:"good","let op":"warn",letop:"warn",kritiek:"bad",accent:"accent",oranje:"solar",blauw:"accent",donkerblauw:"house",lichtblauw:"water",magenta:"magenta",paars:"magenta",roze:"pink",groenblauw:"teal",lamp:"lit",lampkleur:"lit",lampgeel:"lit",neutraal:"neutral",grijs:"neutral",groen:"good",rood:"bad",geel:"warn",red:"bad",green:"good","light-green":"good",lime:"good",yellow:"warn",amber:"warn",orange:"solar","deep-orange":"solar",brown:"solar",blue:"accent","light-blue":"water",cyan:"water",indigo:"house",purple:"magenta","deep-purple":"magenta",pink:"pink",grey:"neutral",gray:"neutral","blue-grey":"neutral",disabled:"neutral"},Sl={accent:"var(--dac-accent-hi)",solar:"var(--dac-solar)",house:"var(--dac-house)",water:"var(--dac-grid-in)",magenta:"var(--dac-grid-out)",pink:"var(--dac-device-1)",teal:"var(--dac-device-2)",lit:"var(--dac-lit)",good:"var(--dac-good)",warn:"var(--dac-warn)",bad:"var(--dac-bad)",neutral:"var(--dac-ink-3)"},ea=[["blauw","Blauw"],["groen","Groen"],["geel","Geel"],["oranje","Oranje"],["rood","Rood"],["lamp","Lampkleur"],["grijs","Grijs"]];function Dt(a,e=Vm){let t=String(a??"").trim();if(!t)return null;let n=Im[t.toLowerCase()]??t;return Sl[n]?Sl[n]:/^#|^rgba?\(|^hsla?\(|^var\(/i.test(n)||e(n)?n:null}var Vm=a=>typeof CSS<"u"&&typeof CSS.supports=="function"&&CSS.supports("color",a);var Bm=new Set(["light","switch","fan","input_boolean","binary_sensor","automation","script","siren","lock","cover","media_player","person","device_tracker","alarm_control_panel","climate","water_heater","humidifier","vacuum","remote"]),Ml=a=>Bm.has(String(a??"").split(".")[0]);function nr(a){let e=String(a?.icon_template??"").trim();return e||(a?.icon??"")}function ta(a){let e=String(a?.path??"").trim();return e?{soort:"pad",pad:e}:{soort:"geschiedenis"}}var Pm=a=>Array.isArray(a?.attributes?.entity_id)||a?.attributes?.is_hue_group===!0;function Nl(a,e=[]){let t=new Set(Array.isArray(e)?e:[]);return Object.values(a??{}).filter(n=>String(n?.entity_id??"").startsWith("light.")&&n.state==="on"&&!t.has(n.entity_id)&&!Pm(n)).map(n=>n.entity_id).sort()}function Dl(a,e,t=!1){let n=(e??[]).map(o=>a?.[o]?.attributes?.rgb_color).filter(o=>Array.isArray(o)&&o.length>=3&&o.slice(0,3).every(Number.isFinite));if(!n.length)return null;let i=[0,1,2].map(o=>Math.round(n.reduce((s,l)=>s+l[o],0)/n.length)),r=Kn(i,t);return r?`rgb(${r.join(",")})`:null}var Km=["lights","energy","alarm"];function he(a){return Km.includes(a?.mode)?a.mode:a?.light_counter?"lights":""}var na={lights:{label:"Lampen aan",icon:"bulb"},energy:{label:"Verbruik",icon:"bolt",energy_green_max:1e3,energy_orange_max:5e3,energy_color_low:"groen",energy_color_mid:"oranje",energy_color_high:"rood"},alarm:{label:"Alarm",alarm_disarmed:"disarmed",alarm_partial:"armed_home, armed_night",alarm_armed:"armed_away, armed_vacation",alarm_disarmed_color:"groen",alarm_partial_color:"oranje",alarm_armed_color:"rood"}},en=(a,e)=>a?.[e]??na[he(a)]?.[e],tr=(a,e)=>a.toLocaleString("nl-NL",{minimumFractionDigits:e,maximumFractionDigits:e});function Ll(a){let e=Number.parseFloat(a?.state);if(!Number.isFinite(e))return null;let t=String(a?.attributes?.unit_of_measurement??"W").trim(),n={W:1,kW:1e3,MW:1e6}[t];if(n===void 0)return{watt:e,tekst:`${tr(e,Number.isInteger(e)?0:1)} ${t}`.trim()};let i=e*n,r=Math.abs(i)>=1e3?`${tr(i/1e3,1)} kW`:`${tr(Math.round(i),0)} W`;return{watt:i,tekst:r}}function Tl(a,e){let t=Number(en(e,"energy_green_max")),n=Number(en(e,"energy_orange_max"));return Number.isFinite(a)?a<=t?"low":a<=n?"mid":"high":null}var Ol=(a,e)=>a?en(e,{low:"energy_color_low",mid:"energy_color_mid",high:"energy_color_high"}[a]):null,Gm=a=>String(a??"").split(/[,;]/).map(e=>e.trim().toLowerCase()).filter(Boolean),Wm=[{stand:"disarmed",waarden:"alarm_disarmed",kleur:"alarm_disarmed_color",tekst:"Uitgeschakeld",icoon:"alarmOff"},{stand:"partial",waarden:"alarm_partial",kleur:"alarm_partial_color",tekst:"Deels ingeschakeld",icoon:"alarmPartial"},{stand:"armed",waarden:"alarm_armed",kleur:"alarm_armed_color",tekst:"Ingeschakeld",icoon:"alarmOn"}];function Cl(a,e){let t=String(e?.alarm_attribute??"").trim(),n=t?a?.attributes?.[t]:a?.state,i=n==null?"":String(n),r=i.trim().toLowerCase(),o=r?Wm.find(s=>Gm(en(e,s.waarden)).includes(r))??null:null;return{waarde:i,stand:o}}var Rl=(a,e)=>a?en(e,a.kleur):null;var ar={links:"flex-start",midden:"center",rechts:"flex-end"};function Hl(a){return ar[a]??ar.links}function Il(){return Object.keys(ar)}function Vl(a){let e=String(a?.label??"").trim();if(e)return e;let t=String(a?.path??"").trim();return t?`Naar ${t}`:"Terug"}var Um="domotiapp-terug-card",Bl="domotiapp-terug-card-editor",aa=class extends S{validate(e){return{icon:"arrowLeft",align:"links",...e}}watched(){return[]}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`
      <div class="houder" style="--uit:${Hl(e.align)}">
        <button class="chip" type="button">
          <span class="ico"></span>
          <span class="tekst"></span>
        </button>
      </div>`}wire(){this.teardown_.push(B(this.$(".chip"),{onTap:()=>this.terug_()}))}terug_(){let e=ta(this.config);if(e.soort==="geschiedenis"){history.back();return}de(this,this.hass,this.config,{action:"navigate",navigation_path:e.pad})}paint(){let e=this.config,t=e.icon||"arrowLeft",n=this.$(".ico");n.dataset.icon!==t&&(n.dataset.icon=t,n.innerHTML=v(t,"arrowLeft")),this.text(".tekst",e.label??""),this.$(".chip").title=Vl(e)}getCardSize(){return 1}getGridOptions(){return{rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement(Bl)}static getStubConfig(){return{icon:"arrowLeft",label:"Terug",align:"links"}}};j(aa,"css",`
    :host { display: block; height: 100%; }

    /* De houder vult de rasterrij en zet de knop op zijn plek. Hij is
       doorzichtig: het vlak dat je ziet is de pil, niet de kaart. */
    .houder {
      display: flex; align-items: center; height: 100%; min-height: 36px;
      justify-content: var(--uit, flex-start);
    }

    /* Dezelfde maten als de badge en als die van Home Assistant zelf: 36px
       hoog, 18px rond, 0 12px binnenmarge, 8px ertussen. Een terugknop in een
       pop-up staat naast een chip van hem, en dan is twee pixels verschil een
       knop die uit de rij loopt. */
    .chip {
      display: inline-flex; align-items: center; gap: 8px;
      max-width: 100%;
      height: 36px; padding: 0 12px;
      border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      box-shadow: var(--dac-shadow);
      cursor: pointer; font: inherit; color: inherit;
      /* LINKS, en dat moet er expliciet staan: dit is een <button>, en de
         useragent-stijl van Chrome geeft die text-align: center. Op de badge is
         dat op 17 september 2026 met een schermafdruk gemeld. */
      text-align: left;
      transition: background 200ms ease, border-color 200ms ease, transform 160ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) {
      .chip:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); }
      .chip:hover .ico { color: var(--dac-accent-hi); }
    }
    .chip:active { transform: scale(.97); }

    /* Achtergrond weglaten haalt ook de rand en de binnenmarge weg. Een pil
       zonder vulling met wel een rand is geen van beide, en met binnenmarge
       zonder vlak begint de tekst 12px naast de kaarten erboven. */
    :host([bare]) .chip {
      background: none; border-color: transparent; box-shadow: none;
      padding: 0; height: auto; min-height: 30px;
    }
    @media (hover: hover) {
      :host([bare]) .chip:hover { background: none; border-color: transparent; }
    }

    .ico { flex: 0 0 auto; display: flex; color: var(--dac-ink-2); transition: color 200ms ease; }
    .ico .icon, .ico ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }

    .tekst {
      min-width: 0; font-size: 13px; font-weight: 600; letter-spacing: -.01em;
      color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .tekst:empty { display: none; }

    .chip:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `);var ir=class extends L{defaults(){return{icon:"arrowLeft",align:"links"}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"arrowLeft",auto:!1}]}schema(){return[{name:"path",selector:f.text()},{name:"label",selector:f.text()},{name:"align",selector:f.select(Il().map(e=>({value:e,label:e[0].toUpperCase()+e.slice(1)})))}]}label(e){return{path:"Waar gaat hij heen",label:"Tekst ernaast (optioneel)",align:"Uitlijning"}[e.name]??super.label(e)}helper(e){return{path:"Het pad waar je altijd op uitkomt, bijvoorbeeld /dashboard/thuis. Begint het met een # dan opent hij een pop-up op de huidige view. Laat je het leeg, dan gaat hij \xE9\xE9n stap terug in de geschiedenis \u2014 net als de terugknop van je browser.",label:"Laat leeg voor alleen het pijltje. Dat is meestal genoeg en het scheelt breedte.",align:"Waar de knop binnen de kaart staat. De kaart zelf is doorzichtig.",bare:"Haalt de pil helemaal weg: geen vulling, geen rand en geen binnenmarge. Dan staat er alleen nog een pijltje met tekst."}[e.name]}};O(Bl,ir);D(Um,aa,{name:"DomotiApp Terug",description:"Een terugknop die je overal kunt neerzetten, ook in een pop-up: naar een vaste plek die je zelf opgeeft, of \xE9\xE9n stap terug als je niets invult."});var rr=(a,e,t)=>Math.min(t,Math.max(e,a));function qe(a,e){let t=e.min??0,n=e.max??100,i=e.step??1,r=!1,o=m=>{let b=a.getBoundingClientRect();if(!b.width)return t;let x=rr((m-b.left)/b.width,0,1),w=t+x*(n-t);return rr(Math.round(w/i)*i,t,n)},s=m=>{try{a.setPointerCapture?.(m)}catch{}},l=m=>{try{a.hasPointerCapture?.(m)&&a.releasePointerCapture(m)}catch{}},d=m=>{e.disabled?.()||m.button!=null&&m.button!==0||(r=!0,s(m.pointerId),a.classList.add("dragging"),e.onInput(o(m.clientX)),m.preventDefault())},c=m=>{r&&(e.onInput(o(m.clientX)),m.preventDefault())},p=m=>{r&&(r=!1,l(m.pointerId),a.classList.remove("dragging"),e.onCommit(o(m.clientX)))},h=m=>{r&&(r=!1,l(m?.pointerId),a.classList.remove("dragging"),e.onInput(e.value()))},u=m=>{if(e.disabled?.())return;let b=(n-t)/10,x={ArrowLeft:-i,ArrowDown:-i,ArrowRight:i,ArrowUp:i,PageDown:-b,PageUp:b,Home:-1/0,End:1/0};if(!(m.key in x))return;m.preventDefault();let w=e.value(),y=rr(x[m.key]===-1/0?t:x[m.key]===1/0?n:w+x[m.key],t,n);e.onInput(y),e.onCommit(y)};return a.addEventListener("pointerdown",d),a.addEventListener("pointermove",c),a.addEventListener("pointerup",p),a.addEventListener("pointercancel",h),a.addEventListener("keydown",u),()=>{a.removeEventListener("pointerdown",d),a.removeEventListener("pointermove",c),a.removeEventListener("pointerup",p),a.removeEventListener("pointercancel",h),a.removeEventListener("keydown",u)}}var ze=(a="")=>`
  <div class="slider ${a}" role="slider" tabindex="0"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div class="track"><div class="fill"></div></div>
    <div class="thumb"></div>
  </div>`,Ze=`
  .slider {
    position: relative; flex: 1 1 90px; min-width: 70px; height: 36px;
    cursor: ew-resize; touch-action: none; -webkit-tap-highlight-color: transparent;
    display: flex; align-items: center;
  }
  .slider .track {
    position: absolute; inset: 0; border-radius: 10px;
    background: var(--strip, rgba(var(--dac-tint), .075)); overflow: hidden;
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
`;var Fm=new Set(["brightness","color_temp","hs","rgb","rgbw","rgbww","xy","white"]),qm=new Set(["hs","rgb","rgbw","rgbww","xy"]),sr=a=>a?.attributes?.supported_color_modes??[],Zm=a=>sr(a).some(e=>Fm.has(e)),ia=a=>sr(a).some(e=>qm.has(e)),ra=a=>sr(a).includes("color_temp"),Pl=a=>Math.max(1,Math.round((a??0)/255*100)),oa=class extends S{validate(e){let t=e.entity??e.lights?.[0]??e.entities?.[0],n=typeof t=="string"?t:t?.entity;return n?{show_colour:!0,...e,entity:n}:{...e,[C]:"Kies een lamp."}}watched(){return[this.config.entity]}template(){return this.config.bare&&this.setAttribute("bare",""),`
      <div class="card surface">
        <div class="lamp" data-on="false" style="--tone:var(--dac-lit)">
          <button class="chip" type="button" aria-label="Aan of uit"></button>
          <span class="txt"><span class="nm"></span><span class="v tnum"></span></span>
          <span class="ctl" style="display:contents"></span>
        </div>
        <div class="colour" hidden></div>
      </div>`}wire(){let e=this.config.entity;this.teardown_.push(B(this.$(".chip"),{onTap:()=>this.hass.callService("light","toggle",{entity_id:e}),onHold:()=>K(this,e)})),this.on(this.$(".card"),"click",t=>{t.target.closest(".toggle")&&this.hass.callService("light","toggle",{entity_id:e})}),this.teardown_.push(V(this.$(".card"))),this.sliders_=new Map}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let i=qe(e,n);this.sliders_.set(t,i),this.teardown_.push(i)}setSlider_(e,t,n=0,i=100){if(!e)return;let r=i>n?(t-n)/(i-n)*100:0;e.style.setProperty("--v",`${r}%`),e.setAttribute("aria-valuemin",String(n)),e.setAttribute("aria-valuemax",String(i)),e.setAttribute("aria-valuenow",String(t))}paint(){let e=this.config,t=k(this.hass,e.entity),n=pe(t),i=t?.state==="on",r=this.$(".lamp");r.dataset.on=String(i),r.classList.toggle("unavailable",n);let o=this.$(".chip"),s=e.icon||"bulb";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=v(s,"bulb")),this.text(".nm",M(this.hass,e.entity,e.name));let l=i?Pi(t?.attributes?.rgb_color,this.licht_,t?.attributes?.color_mode):null;r.style.setProperty("--tone",l??"var(--dac-lit)");let d=this.$(".ctl"),c=n?"none":Zm(t)?"range":"toggle";if(d.dataset.kind!==c&&(d.dataset.kind=c,d.innerHTML=c==="range"?ze("brightness"):c==="toggle"?'<button class="toggle" type="button" role="switch" aria-checked="false" aria-label="Aan of uit"></button>':"",this.sliders_.delete("brightness")),c==="range"){let p=d.querySelector(".slider");if(this.attach_(p,"brightness",{value:()=>t?.state==="on"?Pl(k(this.hass,e.entity)?.attributes?.brightness):0,onInput:h=>{this.setSlider_(p,h),this.text(".v",h===0?"Uit":`${h}%`)},onCommit:h=>{h===0?this.hass.callService("light","turn_off",{entity_id:e.entity}):this.hass.callService("light","turn_on",{entity_id:e.entity,brightness_pct:h})},disabled:()=>pe(k(this.hass,e.entity))}),!p.classList.contains("dragging")){let h=i?Pl(t.attributes.brightness):0;this.setSlider_(p,h),this.text(".v",i?`${h}%`:"Uit")}}else c==="toggle"?(d.querySelector(".toggle")?.setAttribute("aria-checked",String(i)),this.text(".v",i?"Aan":"Uit")):this.text(".v","Niet bereikbaar");this.paintColour_(t,i),R(this.$(".card"))}paintColour_(e,t){let n=this.$(".colour"),i=this.config.show_colour!==!1&&(ia(e)||ra(e));if(n.hidden=!(i&&t),!i)return;let r=`${ia(e)?"c":""}${ra(e)?"t":""}`;if(n.dataset.sig!==r){n.dataset.sig=r,n.innerHTML=(ia(e)?`<span data-kind="hue" style="display:contents">${ze("hue")}</span>`:"")+(ra(e)?`<span data-kind="kelvin" style="display:contents">${ze("kelvin")}</span>`:"");let d=n.querySelector(".slider.hue");d&&(d.dataset.strip="",d.style.setProperty("--strip","linear-gradient(90deg, hsl(0 90% 55%), hsl(60 90% 55%), hsl(120 90% 55%), hsl(180 90% 55%), hsl(240 90% 55%), hsl(300 90% 55%), hsl(360 90% 55%))"),d.setAttribute("aria-label","Kleur"));let c=n.querySelector(".slider.kelvin");c&&(c.dataset.strip="",c.style.setProperty("--strip","linear-gradient(90deg,#ffb15e,#ffd6a8,#fff5e8,#eaf1ff,#cbdcff)"),c.setAttribute("aria-label","Kleurtemperatuur")),this.sliders_.delete("hue"),this.sliders_.delete("kelvin")}if(!t)return;let o=this.config.entity,s=n.querySelector(".slider.hue");s&&(this.attach_(s,"hue",{min:0,max:360,value:()=>k(this.hass,o)?.attributes?.hs_color?.[0]??0,onInput:d=>this.setSlider_(s,d,0,360),onCommit:d=>{let c=k(this.hass,o)?.attributes?.hs_color?.[1]??100;this.hass.callService("light","turn_on",{entity_id:o,hs_color:[d,c]})}}),s.classList.contains("dragging")||this.setSlider_(s,Math.round(e.attributes.hs_color?.[0]??0),0,360));let l=n.querySelector(".slider.kelvin");if(l){let d=e.attributes.min_color_temp_kelvin??2e3,c=e.attributes.max_color_temp_kelvin??6500;if(this.attach_(l,"kelvin",{min:d,max:c,step:50,value:()=>k(this.hass,o)?.attributes?.color_temp_kelvin??d,onInput:p=>this.setSlider_(l,p,d,c),onCommit:p=>this.hass.callService("light","turn_on",{entity_id:o,color_temp_kelvin:p})}),!l.classList.contains("dragging")){let p=e.attributes.color_temp_kelvin;p!=null&&this.setSlider_(l,p,d,c)}}}getCardSize(){let e=k(this.hass,this.config?.entity);return e?.state==="on"&&(ia(e)||ra(e))?2:1}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",1)}}static getConfigElement(){return document.createElement("domotiapp-light-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("light."));return n?{entity:n}:{}}};j(oa,"css",`
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
      color: var(--dac-ink-3); background: rgba(var(--dac-tint), .05); border-color: var(--dac-border);
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

    ${Ze}

    .colour { display: flex; gap: 8px; }
    .colour[hidden] { display: none; }
    .colour .slider { height: 30px; flex: 1 1 0; }
    .colour .slider .track { border-radius: 8px; }
    .colour .slider .thumb { top: 4px; bottom: 4px; width: 6px; margin-left: -3px; }

    /* ---- aan/uit, voor lampen die alleen dat kunnen ---- */
    .toggle {
      flex: 0 0 auto; margin-left: auto; width: 52px; height: 30px; padding: 0; cursor: pointer;
      border-radius: var(--dac-radius-pill); position: relative;
      background: rgba(var(--dac-tint), .08); border: 1px solid var(--dac-border);
      transition: background 200ms ease, border-color 200ms ease;
    }
    .toggle::after {
      content: ""; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px;
      border-radius: 50%; background: var(--dac-knob-uit); box-shadow: var(--dac-knob-schaduw);
      transition: transform 220ms cubic-bezier(.3,.8,.4,1), background 200ms ease;
    }
    .lamp[data-on="true"] .toggle {
      background: color-mix(in srgb, var(--tone) var(--dac-spoor-aan), transparent);
      border-color: color-mix(in srgb, var(--tone) var(--dac-spoor-rand), transparent);
    }
    .lamp[data-on="true"] .toggle::after { transform: translateX(22px); background: var(--dac-knob); }

    .lamp.unavailable { opacity: .42; }
    .lamp.unavailable .slider, .lamp.unavailable .toggle { pointer-events: none; }
  `);var or=class extends L{defaults(){return{show_colour:!0}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"bulb"}]}schema(){return[{name:"entity",selector:f.entity("light")},{name:"name",selector:f.text()},{name:"show_colour",selector:f.bool()}]}label(e){return{entity:"Lamp",name:"Naam (overschrijft die van de lamp)",show_colour:"Kleurstrips tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"E\xE9n lamp per kaart. Dimbaar krijgt een schuif, alleen schakelbaar een tuimelaar.";if(e.name==="show_colour")return"Kleur en kleurtemperatuur verschijnen zodra de lamp aan is. De kaart is dan twee rijen hoog."}};O("domotiapp-light-card-editor",or);D("domotiapp-light-card",oa,{name:"DomotiApp Verlichting",description:"E\xE9n lamp op \xE9\xE9n rasterrij: dimmen, kleur en kleurtemperatuur."});function Kl(a){if(!a)return null;let e=Number(a.state);return Number.isFinite(e)?e:null}function Ym(a){let e=a?.attributes?.hvac_action;return e||(a?.state==="off"?"off":a?.state==="cool"?"cooling":a?.state==="heat"?"idle":null)}var lr={heating:"var(--dac-solar)",cooling:"var(--dac-grid-in)",drying:"var(--dac-grid-in)",fan:"var(--dac-grid-in)"},dr={heating:"Verwarmt",cooling:"Koelt",drying:"Ontvochtigt",fan:"Ventileert",idle:"Uit",off:"Uit"},sa=class extends S{validate(e){return e.entity||e.temperature||e.humidity?{...e}:{...e,[C]:"Kies een thermostaat, of een temperatuursensor."}}watched(){let e=this.config;return[e.entity,e.temperature,e.humidity].filter(Boolean)}step_(){let e=J(this.hass,this.config.entity);return Number(this.config.step??e.target_temp_step)||.5}gestapeld_(){return this.config.layout==="gestapeld"}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),e.entity||this.setAttribute("readout",""),this.setAttribute("vorm",this.gestapeld_()?"gestapeld":"rij"),`
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
                 <button type="button" data-d="-1" aria-label="Lager">${N.minus}</button>
                 <span class="target tnum"></span>
                 <button type="button" data-d="1" aria-label="Hoger">${N.plus}</button>
               </div>`:""}
      </div>`}wire(){let e=this.config;this.teardown_.push(()=>clearTimeout(this.sendTimer_)),this.gestapeld_()&&this.teardown_.push(V(this.$(".card"))),this.teardown_.push(B(this.$(".chip"),{onTap:()=>K(this,e.entity||e.temperature||e.humidity)}));let t=this.$(".set");t&&t.querySelectorAll("button").forEach(n=>this.on(n,"click",()=>this.nudge_(Number(n.dataset.d))))}nudge_(e){let t=this.config,n=J(this.hass,t.entity),i=this.step_(),r=Number(n.min_temp??5),o=Number(n.max_temp??35),s=this.pending_??Number(n.temperature);if(!Number.isFinite(s))return;let l=Math.min(o,Math.max(r,Math.round((s+e*i)/i)*i));this.pending_=l,this.paintTarget_(),clearTimeout(this.sendTimer_),this.sendTimer_=setTimeout(()=>{this.sendTimer_=null,this.hass.callService("climate","set_temperature",{entity_id:t.entity,temperature:this.pending_}),setTimeout(()=>{this.pending_=null,this.paint()},1500)},450)}paintTarget_(){let e=this.$(".target");if(!e)return;let t=J(this.hass,this.config.entity),n=this.pending_??Number(t.temperature);e.classList.toggle("pending",this.pending_!=null),e.textContent=Number.isFinite(n)?`${G(this.hass,n,n%1?1:0)}\xB0`:"--"}paint(){let e=this.config,t=e.entity?k(this.hass,e.entity):null,n=e.entity?pe(t):!1;this.toggleAttribute("dead",n);let i=Ym(t),r=e.tone?ee(e.tone):lr[i]??"var(--dac-ink-3)";this.$(".card").style.setProperty("--tone",r),this.toggleAttribute("busy",!!lr[i]);let o=this.$(".chip"),s=e.icon||"thermo";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=v(s,"thermo")),o.style.setProperty("--tone",lr[i]?r:"var(--dac-ink-3)"),this.text(".nm",M(this.hass,e.entity||e.temperature||e.humidity,e.name));let l=e.temperature?Kl(k(this.hass,e.temperature)):Number(J(this.hass,e.entity).current_temperature),d=this.hass?.config?.unit_system?.temperature??"\xB0C";this.text(".temp",Number.isFinite(l)?`${G(this.hass,l,1)} ${d}`:"--");let c=e.humidity?Kl(k(this.hass,e.humidity)):null,p=this.$(".hum");if(this.gestapeld_()){this.text(".temp",""),p.textContent=dr[i]??"";let u=this.$(".t-temp"),m=this.$(".t-hum");u.hidden=!Number.isFinite(l),m.hidden=c==null,u.hidden||(u.querySelector(".w").textContent=`${G(this.hass,l,1)} ${d}`),m.hidden||(m.querySelector(".w").textContent=`${G(this.hass,c,0)}%`)}else p.innerHTML=c==null?"":`${N.drop}${G(this.hass,c,0)}%`,this.text(".sep",c==null?"":"\xB7"),e.entity&&!e.humidity&&dr[i]&&i!=="idle"&&(this.text(".sep","\xB7"),p.textContent=dr[i]);this.paintTarget_();let h=this.$(".set");if(h){let u=J(this.hass,e.entity),m=this.pending_??Number(u.temperature);h.querySelector('[data-d="-1"]').disabled=n||m<=Number(u.min_temp??5),h.querySelector('[data-d="1"]').disabled=n||m>=Number(u.max_temp??35)}this.gestapeld_()&&R(this.$(".card"))}getCardSize(){return this.gestapeld_()?3:1}getGridOptions(){return this.gestapeld_()?{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",this.config.entity?3:2)}:{columns:12,rows:1,min_columns:4,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-climate-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("climate."));return n?{entity:n}:{}}};j(sa,"css",`
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
      background: rgba(var(--dac-tint), .05); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
    }
    .set button {
      width: 32px; height: 32px; display: grid; place-items: center; padding: 0; cursor: pointer;
      border: 0; background: transparent; color: var(--dac-ink-2);
      border-radius: var(--dac-radius-pill);
      transition: background 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .set button:hover { color: var(--dac-ink); background: rgba(var(--dac-tint), .08); } }
    .set button:active { background: rgba(var(--dac-tint), .14); }
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
      background: rgba(var(--dac-tint), .038); border: 1px solid var(--dac-border);
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
  `);var cr=class extends L{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"thermo"}]}schema(){return[{name:"entity",selector:f.entity("climate")},{name:"temperature",selector:{entity:{domain:"sensor",device_class:"temperature"}}},{name:"humidity",selector:{entity:{domain:"sensor",device_class:"humidity"}}},{name:"name",selector:f.text()},{name:"layout",selector:f.select([{value:"rij",label:"Rij (\xE9\xE9n rasterrij hoog)"},{value:"gestapeld",label:"Onder elkaar (past op een telefoon)"}])},{name:"step",selector:f.number(.1,5,.1)}]}label(e){return{entity:"Thermostaat (optioneel)",temperature:"Temperatuursensor (optioneel)",humidity:"Vochtigheidssensor (optioneel)",name:"Naam",layout:"Vorm",step:"Stap van de knoppen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Leeg laten voor een kaart die alleen meet. Met thermostaat komen de stelknoppen erbij.";if(e.name==="temperature")return"Wint van de meting van de thermostaat zelf. Handig als er een betere sensor in de kamer hangt.";if(e.name==="layout")return"Onder elkaar zet de metingen als twee tegels neer met de stelknop over de volle breedte eronder. Bedoeld voor een smalle kolom of een pop-up, waar de rij-vorm de naam en de meting samendrukt.";if(e.name==="step")return"Leeg laten volgt de thermostaat, en anders een halve graad."}};O("domotiapp-climate-card-editor",cr);D("domotiapp-climate-card",sa,{name:"DomotiApp Klimaat",description:"Thermostaat, losse temperatuur- en vochtsensor, of allebei."});var la=({label:a="Aan of uit",cls:e=""}={})=>`<button class="toggle ${e}" type="button" role="switch" aria-checked="false" aria-label="${a}"><span class="knob"></span></button>`;function tn(a,e){if(!a)return;let t=String(!!e);a.getAttribute("aria-checked")!==t&&a.setAttribute("aria-checked",t)}function da(a,e){let t=a.querySelector(".knob"),n=!1,i=0,r=!1,o=!1,s=()=>{n=!1,a.classList.remove("dragging"),t?.style.removeProperty("--knob")},l=m=>{m!==e.value()&&(tn(a,m),e.set(m))},d=m=>{if(!e.disabled?.()&&!(m.button!=null&&m.button!==0)){m.stopPropagation(),n=!0,r=!1,o=!1,i=m.clientX,a.classList.add("dragging");try{a.setPointerCapture?.(m.pointerId)}catch{}}},c=m=>{if(!n)return;let b=m.clientX-i;Math.abs(b)>3&&(r=!0);let x=e.value()?22:0,w=Math.min(22,Math.max(0,x+b));t?.style.setProperty("--knob",`${w}px`)},p=m=>{if(!n)return;m.stopPropagation();let b=m.clientX-i,x=e.value()?22:0,w=Math.min(22,Math.max(0,x+b));s();try{a.hasPointerCapture?.(m.pointerId)&&a.releasePointerCapture(m.pointerId)}catch{}o=!0,l(r?w>22/2:!e.value())},h=()=>{n&&s()},u=m=>{if(m.stopPropagation(),m.preventDefault(),o){o=!1;return}e.disabled?.()||l(!e.value())};return a.addEventListener("pointerdown",d),a.addEventListener("pointermove",c),a.addEventListener("pointerup",p),a.addEventListener("pointercancel",h),a.addEventListener("click",u),()=>{a.removeEventListener("pointerdown",d),a.removeEventListener("pointermove",c),a.removeEventListener("pointerup",p),a.removeEventListener("pointercancel",h),a.removeEventListener("click",u)}}var ca=`
  .toggle {
    flex: 0 0 auto; position: relative; margin-left: auto;
    width: 46px; height: 26px; padding: 0; cursor: pointer;
    border-radius: var(--dac-radius-pill);
    background: rgba(var(--dac-tint), .08);
    border: 1px solid var(--dac-border);
    touch-action: pan-y; -webkit-tap-highlight-color: transparent;
    transition: background 200ms ease, border-color 200ms ease;
  }
  .toggle .knob {
    position: absolute; top: 2px; left: 2px; width: 20px; height: 20px;
    border-radius: 50%; background: var(--dac-knob-uit); box-shadow: var(--dac-knob-schaduw); pointer-events: none;
    transform: translateX(var(--knob, 0px));
    transition: transform 220ms cubic-bezier(.3, .8, .4, 1), background 200ms ease;
  }
  .toggle[aria-checked="true"] {
    background: color-mix(in srgb, var(--tone) var(--dac-spoor-aan), transparent);
    border-color: color-mix(in srgb, var(--tone) var(--dac-spoor-rand), transparent);
  }
  .toggle[aria-checked="true"] .knob { --knob: 22px; background: var(--dac-knob); }
  .toggle.dragging .knob { transition: none; }
  @media (hover: hover) { .toggle:hover { border-color: var(--dac-border-hi); } }
`;var Gl=a=>String(a??"").split(".")[0],Wl=new Set(["input_select","select"]),pr=a=>Wl.has(Gl(a));function $e(a){if(!a||!pr(a.entity_id))return[];let e=a.attributes?.options;return Array.isArray(e)?e.filter(t=>typeof t=="string"&&t!==""):[]}function Lt(a,e=$e(a)){let t=String(a?.state??"");return!t||t==="unknown"||t==="unavailable"?"":e.includes(t)?t:""}function Tt(a,e,t=[]){let n=Gl(a),i=String(e??"");return!i||!Wl.has(n)||t.length&&!t.includes(i)?null:[n,"select_option",{entity_id:a,option:i}]}var _e=a=>String(a??"").split(".")[0],Pe=a=>a==null||a===""||a==="unknown"||a==="unavailable",Ye={domeinen:["sensor"],device_class:"temperature",rol:"tegel",eenheid:"\xB0C"},Xm={hoofd_climate:{key:"entity",label:"Apparaat (climate)",domeinen:["climate"],rol:"hoofd",hulp:"De climate-entiteit. Daar komen de standen en de temperatuurknoppen vandaan. Leeg laten mag: dan toont de kaart alleen de sensoren."},hoofd_ventilatie:{key:"entity",label:"Ventilatie-unit",domeinen:["fan","select","input_select","climate"],rol:"hoofd",hulp:"Een fan-entiteit (standen of percentage), of een keuzelijst met de standen. Leeg laten mag."},hoofd_boiler:{key:"entity",label:"Boiler (water_heater of climate)",domeinen:["water_heater","climate"],rol:"hoofd",hulp:"Daar komen de doeltemperatuur en de bedrijfsstanden vandaan. Leeg laten mag."},temperature:{key:"temperature",label:"Binnentemperatuur",...Ye,hulp:"Wint van de meting van het apparaat zelf."},outdoor:{key:"outdoor",label:"Buitentemperatuur",...Ye},humidity:{key:"humidity",label:"Luchtvochtigheid",domeinen:["sensor"],device_class:"humidity",rol:"tegel",eenheid:"%"},co2:{key:"co2",label:"CO\u2082",domeinen:["sensor"],rol:"tegel",eenheid:"ppm",hulp:"Kleurt oranje boven 1200 ppm en rood boven 1600."},voc:{key:"voc",label:"Luchtkwaliteit (VOC)",domeinen:["sensor"],rol:"tegel"},power:{key:"power",label:"Vermogen",domeinen:["sensor"],device_class:"power",rol:"tegel",eenheid:"W"},energy:{key:"energy",label:"Energie vandaag",domeinen:["sensor"],device_class:"energy",rol:"tegel",eenheid:"kWh"},flow_temp:{key:"flow_temp",label:"Aanvoertemperatuur",...Ye},return_temp:{key:"return_temp",label:"Retourtemperatuur",...Ye},dhw_temp:{key:"dhw_temp",label:"Tapwatertemperatuur",...Ye},water_temp:{key:"water_temp",label:"Watertemperatuur",...Ye,hulp:"Wint van de meting van de boiler zelf."},supply_temp:{key:"supply_temp",label:"Toevoertemperatuur",...Ye},exhaust_temp:{key:"exhaust_temp",label:"Afvoertemperatuur",...Ye},cop:{key:"cop",label:"COP",domeinen:["sensor"],rol:"tegel",hulp:"Rendement: geleverde warmte gedeeld door verbruikte stroom."},thermal:{key:"thermal",label:"Thermisch vermogen",domeinen:["sensor"],rol:"tegel",eenheid:"kW"},compressor:{key:"compressor",label:"Compressor",domeinen:["sensor","binary_sensor"],rol:"tegel",hulp:"Een toerental of percentage, of een aan/uit-sensor."},flow_rate:{key:"flow_rate",label:"Debiet",domeinen:["sensor"],rol:"tegel",eenheid:"l/min"},pressure:{key:"pressure",label:"Waterdruk",domeinen:["sensor"],rol:"tegel",eenheid:"bar"},status:{key:"status",label:"Statussensor",domeinen:["sensor"],rol:"status",hulp:"Een sensor met een woord als toestand (Verwarmen, Tapwater, Stand 2). Komt in de regel onder de naam."},fault:{key:"fault",label:"Storing",domeinen:["binary_sensor"],rol:"storing",hulp:"Een binary_sensor die aan gaat bij een storing. De kaart kleurt dan rood, wat er verder ook aan de hand is."},filter:{key:"filter",label:"Filter",domeinen:["binary_sensor","sensor"],rol:"filter",hulp:"Een binary_sensor die aan gaat als het filter vervangen moet worden, of een sensor met de dagen tot vervanging."},bypass:{key:"bypass",label:"Bypass",domeinen:["binary_sensor"],rol:"tegel"},heating:{key:"heating",label:"Verwarmt (aan/uit)",domeinen:["binary_sensor"],rol:"verwarmt",hulp:"Een binary_sensor die aan is zolang de boiler opwarmt."},mode:{key:"mode",label:"Bedrijfsmodus (keuzelijst)",domeinen:["select","input_select"],rol:"keuze",hulp:"Een keuzelijst van de integratie, bijvoorbeeld Verwarmen / Koelen / Auto. Verschijnt als uitklaplijst op de kaart."},boost:{key:"boost",label:"Boost",domeinen:["switch","input_boolean","button","input_button","script"],rol:"boost",hulp:"Een schakelaar wordt een schuifschakelaar op de kaart; een knop of script een drukknop."}},Ot={airco:{label:"Airco",naam:"Airco",icoon:"airco",velden:["hoofd_climate","temperature","outdoor","humidity","power","energy","fault"]},warmtepomp:{label:"Warmtepomp",naam:"Warmtepomp",icoon:"heatPump",velden:["hoofd_climate","status","fault","flow_temp","return_temp","outdoor","dhw_temp","cop","power","thermal","energy","compressor","flow_rate","pressure","mode","boost"]},ventilatie:{label:"Ventilatie (WTW)",naam:"Ventilatie",icoon:"fan",velden:["hoofd_ventilatie","status","fault","co2","humidity","voc","temperature","outdoor","supply_temp","exhaust_temp","filter","bypass","power","boost"]},boiler:{label:"Boiler / warm water",naam:"Boiler",icoon:"boiler",velden:["hoofd_boiler","water_temp","heating","power","energy","fault","mode","boost"]}},ht="airco",ut=a=>Ot[a]??Ot[ht],Xe=a=>ut(a).velden.map(e=>Xm[e]),hr=(a,e)=>Xe(a).filter(t=>t.rol===e),Fl={off:"Uit",heat:"Verwarmen",cool:"Koelen",heat_cool:"Auto",auto:"Auto",dry:"Drogen",fan_only:"Ventileren"},Qm={heating:"Verwarmt",cooling:"Koelt",drying:"Droogt",fan:"Ventileert",idle:"Standby",off:"Uit",preheating:"Voorverwarmt",defrosting:"Ontdooit"},Ul={off:"Uit",on:"Aan",auto:"Auto",low:"Laag",lowest:"Laagst",min:"Min",minimum:"Min",medium:"Midden",mid:"Midden",middle:"Midden",high:"Hoog",highest:"Hoogst",max:"Max",maximum:"Max",boost:"Boost",turbo:"Turbo",quiet:"Stil",silent:"Stil",silence:"Stil",sleep:"Nacht",night:"Nacht",away:"Afwezig",home:"Thuis",eco:"Eco",comfort:"Comfort",party:"Feest",holiday:"Vakantie",electric:"Elektrisch",gas:"Gas",heat_pump:"Warmtepomp",high_demand:"Veel vraag",performance:"Snel",...Fl};function be(a){let e=String(a??"").trim();if(!e)return"";let t=e.toLowerCase().replace(/[\s-]+/g,"_");if(Ul[t])return Ul[t];let n=e.replace(/_/g," ");return n.charAt(0).toUpperCase()+n.slice(1)}function Jm(a,e){let t=String(a??"").toLowerCase(),n=Math.abs(Number(e));return t.includes("\xB0")||t==="c"||t==="f"?1:t==="%"||t==="ppm"||t==="w"||t==="hz"||t==="rpm"||t==="ppb"?0:t==="kwh"||t==="kw"||t==="bar"||t==="l/min"||t==="m\xB3/h"||t?n>=100?0:1:n>=100?0:n>=10?1:2}function eg(a,e,t="nl"){let n=Number(a);if(!Number.isFinite(n))return"--";let i=Jm(e,n);return n.toLocaleString(t,{minimumFractionDigits:i,maximumFractionDigits:i})}var tg={bypass:["Open","Dicht"],compressor:["Aan","Uit"],heating:["Ja","Nee"],filter:["Vervangen","Schoon"]};function ng(a,e,t="nl"){if(!a||!e)return null;let n=String(e.state??"").trim(),i=e.attributes?.unit_of_measurement??a.eenheid??"";if(_e(e.entity_id)==="binary_sensor"){let[l,d]=tg[a.key]??["Aan","Uit"],c=Pe(n),p=n==="on";return{key:a.key,label:a.label.replace(/\s*\(.*\)$/,""),waarde:c?"--":p?l:d,eenheid:"",let:a.key==="filter"&&p?"warn":""}}let r=Number(n),o=!Pe(n)&&Number.isFinite(r),s="";return a.key==="co2"&&o&&(s=r>=1600?"bad":r>=1200?"warn":""),a.key==="filter"&&o&&(s=r<=0?"warn":""),{key:a.key,label:a.label.replace(/\s*\(.*\)$/,""),waarde:o?eg(r,i,t):Pe(n)?"--":n,eenheid:o?i:"",let:s}}function ql(a,e,t,n="nl"){let i=[];for(let r of Xe(a)){if(r.rol!=="tegel"&&r.rol!=="filter")continue;let o=e?.[r.key];if(!o)continue;let s=ng(r,t(o)??{entity_id:o,state:"unavailable",attributes:{}},n);s&&i.push(s)}return i}function Zl({soort:a,hoofd:e,status:t,fault:n,filter:i,heating:r}={}){let o=ag(i);if(n&&n.state==="on")return{tekst:"Storing",tone:"bad",bezig:!1,waarschuwing:o};if(e&&Pe(e.state))return{tekst:"Niet bereikbaar",tone:"neutral",bezig:!1,waarschuwing:o};let s=t&&!Pe(t.state)?be(t.state):"",l=_e(e?.entity_id);if(e&&l==="climate"){let c=(e.attributes??{}).hvac_action??(e.state==="off"?"off":"idle"),p=Qm[c]??be(c),h=c==="heating"||c==="preheating"?"solar":["cooling","drying","fan"].includes(c)?"water":"neutral",u=h!=="neutral"||c==="defrosting";return{tekst:s&&s!==p?`${p} \xB7 ${s}`:p,tone:h,bezig:u,waarschuwing:o}}if(e&&l==="fan"){let d=e.attributes??{};if(e.state==="off")return{tekst:"Uit",tone:"neutral",bezig:!1,waarschuwing:o};let c=d.preset_mode?be(d.preset_mode):Number.isFinite(Number(d.percentage))?`${Math.round(Number(d.percentage))}%`:"Aan";return{tekst:s&&s!==c?`${c} \xB7 ${s}`:`Ventileert \xB7 ${c}`,tone:"water",bezig:!0,waarschuwing:o}}if(e&&l==="water_heater"){let d=e.attributes??{},c=be(e.state),p=r?r.state==="on":d.operation_mode!=="off"&&e.state!=="off"&&d.hvac_action==="heating";return e.state==="off"?{tekst:"Uit",tone:"neutral",bezig:!1,waarschuwing:o}:{tekst:p?`Verwarmt \xB7 ${c}`:c,tone:p?"solar":"neutral",bezig:p,waarschuwing:o}}if(e&&(l==="select"||l==="input_select")){let d=be(e.state),c=/^(uit|off)$/i.test(e.state);return{tekst:c?"Uit":`Stand \xB7 ${d}`,tone:c?"neutral":"water",bezig:!c,waarschuwing:o}}return r&&r.state==="on"?{tekst:s?`Verwarmt \xB7 ${s}`:"Verwarmt",tone:"solar",bezig:!0,waarschuwing:o}:s?{tekst:s,tone:"neutral",bezig:!1,waarschuwing:o}:{tekst:ut(a).naam,tone:"neutral",bezig:!1,waarschuwing:o}}function ag(a){if(!a||Pe(a.state))return"";if(_e(a.entity_id)==="binary_sensor")return a.state==="on"?"Filter vervangen":"";let e=Number(a.state);return Number.isFinite(e)&&e<=0?"Filter vervangen":""}var ig=[["0","Uit"],["33","Laag"],["66","Midden"],["100","Hoog"]];function ur(a){if(!a)return[];let e=a.attributes??{},t=_e(a.entity_id),n=i=>Array.isArray(i)?i.filter(r=>typeof r=="string"&&r!==""):[];if(t==="climate")return n(e.hvac_modes).map(i=>({waarde:i,label:Fl[i]??be(i)}));if(t==="water_heater")return n(e.operation_list).map(i=>({waarde:i,label:be(i)}));if(t==="select"||t==="input_select")return n(e.options).map(i=>({waarde:i,label:be(i)}));if(t==="fan"){let i=n(e.preset_modes);if(i.length)return i.map(r=>({waarde:r,label:be(r)}));if(e.percentage!=null||e.percentage_step!=null){let r=Number(e.percentage_step)||1;return ig.map(([o,s])=>({waarde:String(Math.min(100,Math.round(Number(o)/r)*r)),label:s}))}return[{waarde:"off",label:"Uit"},{waarde:"on",label:"Aan"}]}return[]}function Yl(a,e=ur(a)){if(!a||Pe(a.state))return"";let t=a.attributes??{};if(_e(a.entity_id)==="fan"){if(t.preset_mode&&e.some(r=>r.waarde===t.preset_mode))return t.preset_mode;if(a.state==="off")return e.some(r=>r.waarde==="0")?"0":"off";let i=Number(t.percentage);if(Number.isFinite(i)&&e.length){let r=e[0];for(let o of e)Math.abs(Number(o.waarde)-i)<Math.abs(Number(r.waarde)-i)&&(r=o);return r.waarde}return a.state==="on"?"on":""}return e.some(i=>i.waarde===a.state)?a.state:""}function Xl(a,e){if(!a)return null;let t=a.entity_id,n=String(e??"");if(!n)return null;let i=_e(t);switch(i){case"climate":return["climate","set_hvac_mode",{entity_id:t,hvac_mode:n}];case"water_heater":return["water_heater","set_operation_mode",{entity_id:t,operation_mode:n}];case"select":case"input_select":return[i,"select_option",{entity_id:t,option:n}];case"fan":{let r=a.attributes?.preset_modes;if(Array.isArray(r)&&r.includes(n))return["fan","set_preset_mode",{entity_id:t,preset_mode:n}];if(n==="off")return["fan","turn_off",{entity_id:t}];if(n==="on")return["fan","turn_on",{entity_id:t}];let o=Number(n);return Number.isFinite(o)?o<=0?["fan","turn_off",{entity_id:t}]:["fan","set_percentage",{entity_id:t,percentage:o}]:null}default:return null}}function mr(a){let e=a?.attributes?.fan_modes;return _e(a?.entity_id)!=="climate"||!Array.isArray(e)?[]:e.filter(t=>typeof t=="string"&&t).map(t=>({waarde:t,label:be(t)}))}function Ql(a,e){let t=String(e??"");return!a||!t||!mr(a).some(n=>n.waarde===t)?null:["climate","set_fan_mode",{entity_id:a.entity_id,fan_mode:t}]}function gr(a,e){if(!a||Pe(a.state))return null;let t=a.attributes??{},n=_e(a.entity_id);if(n!=="climate"&&n!=="water_heater")return null;let i=Number(t.temperature);if(!Number.isFinite(i))return null;let r=Number(e)||Number(t.target_temp_step)||(n==="water_heater"?1:.5);return{min:Number(t.min_temp??(n==="water_heater"?30:5)),max:Number(t.max_temp??(n==="water_heater"?70:35)),stap:r,doel:i,huidig:Number.isFinite(Number(t.current_temperature))?Number(t.current_temperature):null}}function Jl(a,e,t){if(!a)return null;let i=(Number.isFinite(e)?e:a.doel)+t*a.stap,r=Math.round(i/a.stap)*a.stap,o=Math.round(r*100)/100;return Math.min(a.max,Math.max(a.min,o))}function ed(a,e){if(!a||!Number.isFinite(e))return null;let t=_e(a.entity_id);return t!=="climate"&&t!=="water_heater"?null:[t,"set_temperature",{entity_id:a.entity_id,temperature:e}]}var td=a=>["switch","input_boolean"].includes(_e(a));function fr(a,e=!0){let t=String(a??""),n=_e(t);switch(n){case"switch":case"input_boolean":return["homeassistant",e?"turn_on":"turn_off",{entity_id:t}];case"button":case"input_button":return[n,"press",{entity_id:t}];case"script":return["script","turn_on",{entity_id:t}];default:return null}}function nd(a,e){let t=Number(e?.state);if(e&&!Pe(e.state)&&Number.isFinite(t))return t;let n=a?.attributes?.current_temperature;if(n==null||n==="")return null;let i=Number(n);return Number.isFinite(i)?i:null}var ad={solar:E.solar,water:E.water,bad:E.bad,warn:E.warn,neutral:"var(--dac-ink-3)"},pa=class extends S{validate(e){let t={soort:ht,...e};return Ot[t.soort]||(t.soort=ht),Xe(t.soort).some(i=>t[i.key])||(t[C]="Kies de soort en minstens \xE9\xE9n entiteit: het apparaat zelf, of een sensor."),t}watched(){let e=this.config;return Xe(e.soort).map(t=>e[t.key]).filter(Boolean)}hoofd_(){return k(this.hass,this.config.entity)??null}metRol_(e){let t=hr(this.config.soort,e)[0];return t?k(this.hass,this.config[t.key])??null:null}template(){let e=this.config;e.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size";let t=e.boost?td(e.boost)?la({label:"Boost"}):`<button type="button" class="knop">${v("bolt")}<span>Boost</span></button>`:"";return`
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
          <button type="button" data-d="-1" aria-label="Lager">${N.minus}</button>
          <span class="target tnum"></span>
          <button type="button" data-d="1" aria-label="Hoger">${N.plus}</button>
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
      </div>`}wire(){let e=this.config;if(this.teardown_.push(()=>clearTimeout(this.sendTimer_)),this.teardown_.push(V(this.$(".card"))),this.on(this.$(".top"),"click",()=>{let t=e.entity||this.watched()[0];t&&K(this,t)}),this.on(this.$(".standen"),"click",t=>{let n=t.target?.closest?.(".seg");if(!n||n.disabled)return;t.stopPropagation();let i=Xl(this.hoofd_(),n.dataset.waarde);i&&this.hass.callService(i[0],i[1],i[2])}),this.$$(".set button").forEach(t=>this.on(t,"click",()=>this.nudge_(Number(t.dataset.d)))),this.on(this.$(".rij.ventilator"),"change",t=>{let n=t.target?.closest?.(".keuze");if(!n)return;t.stopPropagation();let i=Ql(this.hoofd_(),n.value);i&&this.hass.callService(i[0],i[1],i[2])}),this.on(this.$(".rij.modus"),"change",t=>{let n=t.target?.closest?.(".keuze");if(!n||!e.mode)return;t.stopPropagation();let i=Tt(e.mode,n.value,$e(k(this.hass,e.mode)));i&&this.hass.callService(i[0],i[1],i[2])}),e.boost){let t=this.$(".rij.boost .toggle"),n=this.$(".rij.boost .knop");t&&this.teardown_.push(da(t,{value:()=>Z(k(this.hass,e.boost)),set:i=>{let r=fr(e.boost,i);r&&this.hass.callService(r[0],r[1],r[2])}})),n&&this.on(n,"click",i=>{i.stopPropagation();let r=fr(e.boost,!0);r&&this.hass.callService(r[0],r[1],r[2])})}}nudge_(e){let t=this.hoofd_(),n=gr(t,this.config.step);n&&(this.pending_=Jl(n,this.pending_??n.doel,e),this.paintDoel_(),clearTimeout(this.sendTimer_),this.sendTimer_=setTimeout(()=>{this.sendTimer_=null;let i=ed(t,this.pending_);i&&this.hass.callService(i[0],i[1],i[2]),setTimeout(()=>{this.pending_=null,this.paint()},1500)},450))}paintDoel_(){let e=this.$(".set"),t=gr(this.hoofd_(),this.config.step);if(e.hidden=!t,!t)return;let n=this.pending_??t.doel,i=e.querySelector(".target");i.classList.toggle("pending",this.pending_!=null),i.innerHTML=`${G(this.hass,n,n%1?1:0)}\xB0<small>doel</small>`,e.querySelector('[data-d="-1"]').disabled=n<=t.min,e.querySelector('[data-d="1"]').disabled=n>=t.max}paint(){let e=this.config,t=ut(e.soort),n=this.hoofd_(),i=Zl({soort:e.soort,hoofd:n,status:this.metRol_("status"),fault:this.metRol_("storing"),filter:this.metRol_("filter"),heating:this.metRol_("verwarmt")}),r=ad[i.tone]??ad.neutral;this.$(".card").style.setProperty("--tone",r),this.toggleAttribute("bezig",i.bezig),this.toggleAttribute("storing",i.tone==="bad"),this.$(".top").classList.toggle("dood",i.tekst==="Niet bereikbaar");let o=this.$(".chip"),s=e.icon||t.icoon;o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=v(s,t.icoon)),this.text(".nm",e.name||(e.entity?M(this.hass,e.entity,null):"")||t.naam);let l=this.$(".st"),d=_(i.tekst)+(i.waarschuwing?` &middot; <span class="let">${_(i.waarschuwing)}</span>`:"");l.dataset.html!==d&&(l.dataset.html=d,l.innerHTML=d),this.$(".top").setAttribute("aria-label",`${this.$(".nm").textContent}, ${i.tekst}`);let c=e.soort==="boiler"?"water_temp":"temperature",p=k(this.hass,e[c])??null,h=nd(n,p),u=p?.attributes?.unit_of_measurement??this.hass?.config?.unit_system?.temperature??"\xB0C",m=this.$(".graden"),b=h==null?"":`${G(this.hass,h,1)}<small>${_(u)}</small>`;if(m.dataset.html!==b&&(m.dataset.html=b,m.innerHTML=b),this.paintTegels_(h==null?null:c),this.paintStanden_(n),this.paintDoel_(),this.paintKeuzes_(n),e.boost){let x=this.$(".rij.boost .toggle");x&&(x.style.setProperty("--tone",E.accent),tn(x,Z(k(this.hass,e.boost))))}R(this.$(".card"))}paintTegels_(e){let t=this.config,n=this.$(".tegels"),i=ql(t.soort,t,o=>k(this.hass,o)??null,this.hass?.locale?.language??"nl").filter(o=>o.key!==e);n.hidden=i.length===0;let r=JSON.stringify(i);n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=i.map(o=>`
        <div class="tegel" data-let="${o.let}" title="${_(o.label)}">
          <span class="w">${_(o.waarde)}${o.eenheid?`<small>${_(o.eenheid)}</small>`:""}</span>
          <span class="l">${_(o.label)}</span>
        </div>`).join(""))}paintStanden_(e){let t=this.$(".standen"),n=ur(e);if(t.hidden=n.length<2,t.hidden)return;let i=Yl(e,n),r=!e||e.state==="unavailable",o=JSON.stringify([n,i,r]);t.dataset.sig!==o&&(t.dataset.sig=o,t.innerHTML=n.map(s=>`<button type="button" class="seg" data-waarde="${_(s.waarde)}" aria-pressed="${s.waarde===i}"${r?" disabled":""}>${_(s.label)}</button>`).join(""))}paintKeuzes_(e){let t=this.config,n=mr(e),i=this.$(".ventslot");this.vulLijst_(i,n,e?.attributes?.fan_mode??"","Ventilator"),this.$(".rij.ventilator").hidden=n.length===0;let r=k(this.hass,t.mode),o=t.mode?$e(r).map(l=>({waarde:l,label:be(l)})):[],s=this.$(".modusslot");this.vulLijst_(s,o,Lt(r),"Modus"),this.$(".rij.modus").hidden=o.length===0}vulLijst_(e,t,n,i){let r=JSON.stringify(t);e.dataset.opties!==r&&(e.dataset.opties=r,e.innerHTML=t.length?`<select class="keuze" aria-label="${_(i)}">${t.map(s=>`<option value="${_(s.waarde)}">${_(s.label)}</option>`).join("")}</select>`:"");let o=e.querySelector(".keuze");o&&this.shadowRoot.activeElement!==o&&o.value!==n&&(o.value=n)}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-hvac-card-editor")}static getStubConfig(e,t){let n=t?.find(o=>o.startsWith("climate.")),i=t?.find(o=>o.startsWith("fan.")),r=t?.find(o=>o.startsWith("water_heater."));return r?{soort:"boiler",entity:r}:n?{soort:"airco",entity:n}:i?{soort:"ventilatie",entity:i}:{soort:ht}}};j(pa,"css",`
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
      background: rgba(var(--dac-tint), .038); border: 1px solid var(--dac-border);
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
      background: rgba(var(--dac-tint), .05); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
    }
    .set[hidden] { display: none; }
    .set button {
      width: 32px; height: 32px; display: grid; place-items: center; padding: 0; cursor: pointer;
      border: 0; background: transparent; color: var(--dac-ink-2);
      border-radius: var(--dac-radius-pill);
      transition: background 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .set button:hover { color: var(--dac-ink); background: rgba(var(--dac-tint), .08); } }
    .set button:active { background: rgba(var(--dac-tint), .14); }
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
      color: var(--dac-ink); color-scheme: var(--dac-scheme);
      background-color: var(--dac-bg-raise);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      padding: 7px 10px; cursor: pointer;
      text-overflow: ellipsis;
    }
    @media (hover: hover) { .keuze:hover { border-color: var(--dac-border-hi); } }
    .keuze:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
    .keuze option { background-color: var(--dac-bg-raise); color: var(--dac-ink); }
    .keuze option:checked { background-color: var(--dac-accent); color: var(--dac-on-accent); }

    /* ------------------------------------------------------------- boost */

    ${ca}
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
  `);var br=class extends L{defaults(){return{soort:ht}}soort_(){return Ot[this.config_?.soort]?this.config_.soort:ht}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:ut(this.soort_()).icoon,auto:!1}]}sync_(){super.sync_();for(let e of this.pickers_??[])e.dataset.key==="icon"&&(e.fallback=ut(this.soort_()).icoon)}schema(){let e=this.soort_(),t=Xe(e).map(r=>({name:r.key,selector:{entity:{domain:r.domeinen,...r.device_class?{device_class:r.device_class}:{}}}})),i=hr(e,"hoofd")[0]?.domeinen.some(r=>r==="climate"||r==="water_heater");return[{name:"soort",selector:f.select(Object.entries(Ot).map(([r,o])=>({value:r,label:o.label})))},{name:"name",selector:f.text()},...t,...i?[{name:"step",selector:f.number(.1,5,.1)}]:[]]}label(e){let t=Xe(this.soort_()).find(n=>n.key===e.name);return t?t.label:{soort:"Soort apparaat",name:"Naam",step:"Stap van de temperatuurknoppen"}[e.name]??super.label(e)}helper(e){let t=Xe(this.soort_()).find(n=>n.key===e.name);if(t?.hulp)return t.hulp;if(e.name==="soort")return"Bepaalt welke velden hieronder staan, het icoon, en hoe de statusregel leest.";if(e.name==="name")return`Leeg laten geeft de naam van het apparaat, of anders "${ut(this.soort_()).naam}".`;if(e.name==="step")return"Leeg laten volgt het apparaat: een halve graad bij een climate, een hele bij een boiler."}};O("domotiapp-hvac-card-editor",br);D("domotiapp-hvac-card",pa,{name:"DomotiApp HVAC",description:"Airco, warmtepomp, ventilatie of boiler: status, metingen als tegels, de standen van het apparaat, doeltemperatuur en boost."});var ha=a=>String(a??"").split(".")[0],id=new Set(["input_datetime","time","date","datetime"]),rd=a=>id.has(ha(a)),Ee=a=>String(a).padStart(2,"0");function rg(a){let e=String(a??"");return/^\d{4}-\d{2}-\d{2}[ T]\d{1,2}:\d{2}/.test(e)?"datetime-local":/^\d{4}-\d{2}-\d{2}$/.test(e)?"date":/^\d{1,2}:\d{2}/.test(e)?"time":null}function vr(a){if(!a)return null;let e=ha(a.entity_id);if(e==="time")return"time";if(e==="date")return"date";if(e==="datetime")return"datetime-local";if(e!=="input_datetime")return null;let t=a.attributes??{};return typeof t.has_date=="boolean"||typeof t.has_time=="boolean"?t.has_date&&t.has_time?"datetime-local":t.has_date?"date":t.has_time?"time":null:rg(a.state)}var og=a=>`${a.getFullYear()}-${Ee(a.getMonth()+1)}-${Ee(a.getDate())}T${Ee(a.getHours())}:${Ee(a.getMinutes())}`;function sg(a){let e=-a.getTimezoneOffset(),t=e<0?"-":"+",n=Math.abs(e);return`${t}${Ee(Math.floor(n/60))}:${Ee(n%60)}`}function od(a,e=vr(a)){if(!a||!e)return"";let t=String(a.state??"");if(!t||t==="unknown"||t==="unavailable")return"";if(e==="time"){let i=t.match(/^(\d{1,2}):(\d{2})/);return i?`${Ee(i[1])}:${i[2]}`:""}if(e==="date"){let i=t.match(/^(\d{4}-\d{2}-\d{2})$/);return i?i[1]:""}if(ha(a.entity_id)==="datetime"){let i=new Date(t);return Number.isNaN(+i)?"":og(i)}let n=t.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}:\d{2})/);return n?`${n[1]}T${Ee(n[2].split(":")[0])}:${n[2].split(":")[1]}`:""}function sd(a,e,t){let n=ha(a),i=String(t??"");if(!i||!id.has(n)||!e)return null;if(e==="time"){let h=i.match(/^(\d{1,2}):(\d{2})/);if(!h)return null;let u=`${Ee(h[1])}:${h[2]}:00`;return n==="time"?["time","set_value",{entity_id:a,time:u}]:["input_datetime","set_datetime",{entity_id:a,time:u}]}if(e==="date")return/^\d{4}-\d{2}-\d{2}$/.test(i)?n==="date"?["date","set_value",{entity_id:a,date:i}]:["input_datetime","set_datetime",{entity_id:a,date:i}]:null;let r=i.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})/);if(!r)return null;let[,o,s,l,d,c]=r,p=`${Ee(d)}:${c}:00`;if(n==="datetime"){let h=sg(new Date(+o,+s-1,+l,+d,+c));return["datetime","set_value",{entity_id:a,datetime:`${o}-${s}-${l}T${p}${h}`}]}return["input_datetime","set_datetime",{entity_id:a,datetime:`${o}-${s}-${l} ${p}`}]}var ld={auto:"automatisch",automatic:"automatisch",eco:"eco",intensiv:"intensief",intensive:"intensief",kurz:"kort",quick:"snel",express:"snel",speed:"snel",glas:"glas",glass:"glas",delicate:"fijn",normal:"normaal",night:"nacht",silence:"stil",quiet:"stil",hygiene:"hygi\xEBne",hygienic:"hygi\xEBne",favorite:"favoriet",favourite:"favoriet",steam:"stoom",fresh:"fris",care:"verzorging",machinecare:"machineverzorging",machine:"machine",prerinse:"voorspoelen",rinse:"spoelen",presoak:"voorweken",soak:"weken",wash:"wassen",dry:"drogen",half:"half",load:"belading",mixed:"gemengd",maximum:"maximaal",cleaning:"reinigen",clean:"reinigen",pots:"pannen",chef:"chef",kitchen:"keuken",party:"feest",daily:"dagelijks",super:"super",turbo:"turbo",energy:"energie",saving:"zuinig",off:"uit",on:"aan",none:"geen",standby:"stand-by",ready:"gereed",pause:"pauze",stop:"stop",start:"start",finished:"klaar",low:"laag",medium:"midden",high:"hoog"},lg=/^.*program(?:me)?[_.\- ]/i,dg=30,cg=95;function pg(a){return String(a??"").replace(lg,"").replace(/([a-z])([A-Z])/g,"$1 $2").replace(/([a-zA-Z])(\d)/g,"$1 $2").replace(/(\d)([a-zA-Z])/g,"$1 $2").split(/[\s_.\-]+/).filter(Boolean)}function hg(a){let e=pg(a);if(!e.length)return"";let t=[];for(let i=0;i<e.length;i++){let r=e[i],o=r.toLowerCase();if(/^\d+$/.test(o)){let d=Number(o);t.push(d>=dg&&d<=cg?`${d} \xB0C`:o);continue}let s=e[i+1]?.toLowerCase(),l=s?ld[o+s]:void 0;if(l){t.push(l),i++;continue}t.push(ld[o]??r)}let n=t.join(" ");return n.charAt(0).toUpperCase()+n.slice(1)}function ug(a,e){let t=i=>String(i??"").toLowerCase().replace(/[^a-z0-9]/g,""),n=t(e);return!!n&&n!==t(a)}function ua(a,e){return ug(a,e)?String(e):hg(a)||String(a??"")}var ga={row:44,tile:96,compact:44,beeld:120},Qe=6,dd=12,kr=22,mg=["row","tile","compact","beeld"],gg=["links","midden"],xr=48,wr=320,ma=120,Ae=a=>{if(a==null||a==="")return ma;let e=Math.round(Number(a));return Number.isFinite(e)?Math.min(wr,Math.max(xr,e)):ma},nn=a=>gg.includes(a)?a:"links";function cd(a,e){let t=Array.isArray(a)?a:[],n=Array.from({length:e},(i,r)=>typeof t[r]=="string"?t[r].trim():"");return n.some(Boolean)?n:[]}var fg=["card","items","none","open"],fa=a=>typeof a?.name=="string"?a.name.trim():"",an=a=>typeof a=="string"?{entity:a}:{...a},rn=a=>Math.min(Math.max(1,Number(a)||2),3),Ct=a=>mg.includes(a)?a:"row",ve=a=>!!(a?.entity||a?.name||a?.icon||a?.tap_action);function pd(a){if(Array.isArray(a?.rows)&&a.rows.length)return a.rows.map(n=>{let i=rn(n.columns);return{columns:i,layout:Ct(n.layout),align:nn(n.align),image_size:Ae(n.image_size),column_names:cd(n.column_names,i),items:(n.items??n.entities??[]).map(an)}});let e=(a?.items??a?.entities??[]).map(an);if(!e.length)return[];let t=rn(a.columns);return[{columns:t,layout:Ct(a.layout),align:nn(a.align),image_size:Ae(a.image_size),column_names:cd(a.column_names,t),items:e}]}function ba(a){return fg.includes(a?.surface)?a.surface:a?.bare?"none":"card"}var bg=a=>Math.max(1,Math.ceil((a.items?.length||1)/a.columns)),vg=22;function kg(a){let e=Ct(a?.layout);return e!=="beeld"?ga[e]:Ae(a?.image_size)+34}function _r(a){let e=a?.rows??[],t=fa(a)?kr+Qe:0;if(!e.length)return dd+t+ga.row;let n=(ba(a)==="card"?dd:0)+t;for(let i of e){let r=bg(i);n+=r*kg(i)+(r-1)*Qe,i.column_names?.length&&(n+=vg+Qe)}return n+(e.length-1)*Qe}function on(a){for(a.bewaard??=[];a.items.length<a.columns;)a.items.push(a.bewaard.pop()??{entity:""});for(;a.items.length>a.columns;){let e=a.items.pop();ve(e)&&a.bewaard.push(e)}return a}function hd(a){let e=Array.isArray(a.rows)&&a.rows.length?a.rows.map(n=>({columns:rn(n.columns),layout:Ct(n.layout),align:nn(n.align),image_size:Ae(n.image_size),column_names:Array.isArray(n.column_names)?[...n.column_names]:[],items:(n.items??n.entities??[]).map(an)})):(()=>{let n=(a.items??a.entities??[]).map(an);return n.length?[{columns:rn(a.columns),layout:Ct(a.layout),align:nn(a.align),image_size:Ae(a.image_size),column_names:Array.isArray(a.column_names)?[...a.column_names]:[],items:n}]:[]})(),t=[];for(let n of e){let i=[];for(let r=0;r<n.items.length;r+=n.columns)i.push(n.items.slice(r,r+n.columns));i.length||i.push([]),i.forEach((r,o)=>t.push(on({columns:n.columns,layout:n.layout,align:n.align,image_size:n.image_size,column_names:o===0?n.column_names:[],items:r})))}return t}var yr=a=>a.map(e=>{let t=(e.column_names??[]).slice(0,e.columns).map(n=>String(n??"").trim());return{columns:e.columns,...e.layout&&e.layout!=="row"?{layout:e.layout}:{},...e.align==="midden"?{align:"midden"}:{},...e.layout==="beeld"&&e.image_size!==ma?{image_size:Ae(e.image_size)}:{},...t.some(Boolean)?{column_names:t}:{},items:e.items.filter(ve).map(n=>structuredClone(n))}}).filter(e=>e.items.length);function jr(a,e,t){let n=new Set;for(let i of a){let r=/^r(\d+)(?:i(\d+))?$/.exec(i);if(!r)continue;let o=Number(r[1]),s=r[2]===void 0?"":`i${r[2]}`;if(t==="weg"){if(o===e)continue;n.add(o>e?`r${o-1}${s}`:i);continue}n.add(o>e?`r${o+1}${s}`:i)}return n}var ud=[{waarde:"row",label:"Rij"},{waarde:"tile",label:"Tegel"},{waarde:"compact",label:"Compact"},{waarde:"beeld",label:"Beeld"}],xg=[{waarde:"links",label:"Links"},{waarde:"midden",label:"Midden"}],wg=a=>ud.find(e=>e.waarde===a)?.label??"Rij",_g=`
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
`,zr=class extends HTMLElement{constructor(){super(),this.rows_=[],this.rest_={},this.open_=new Set,this.koppen_=[]}setConfig(e){if(this.rest_={...e},delete this.rest_.rows,delete this.rest_.items,delete this.rest_.entities,delete this.rest_.columns,delete this.rest_.layout,delete this.rest_.align,delete this.rest_.image_size,delete this.rest_.column_names,this.gebouwd_&&e===this.uitObject_)return;let t=hd(e);this.gebouwd_&&JSON.stringify(yr(t))===this.uit_||(this.rows_=t,this.eersteKeer_||(this.eersteKeer_=!0,this.rows_.length===1&&this.open_.add("r0")),this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}connectedCallback(){this.gebouwd_||this.build_()}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}rijWeg_(e){this.open_=jr(this.open_,e,"weg")}rijErbij_(e){this.open_=jr(this.open_,e,"erbij")}itemWeg_(e,t){let n=new Set;for(let i of this.open_){let r=/^r(\d+)i(\d+)$/.exec(i);if(!r||Number(r[1])!==e){n.add(i);continue}let o=Number(r[2]);o!==t&&n.add(o>t?`r${e}i${o-1}`:i)}this.open_=n}legePlekkenOpen_(e,t){e.items.forEach((n,i)=>{ve(n)||this.open_.add(`r${t}i${i}`)})}async build_(){if(!this.hass_||!this.rows_)return;await customElements.whenDefined("ha-form"),this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=_g;let t=document.createElement("div");if(t.className="dac-ed",this.append(e,t),t.appendChild(this.kaartBlok_()),this.rows_.forEach((i,r)=>t.appendChild(this.rijBlok_(i,r))),!this.rows_.length){let i=document.createElement("p");i.className="uitleg",i.textContent="Een rij is een regel op de kaart, met een, twee of drie entiteiten naast elkaar. Elke rij heeft zijn eigen indeling en zijn eigen vorm. Een rij van een kolom is een losse knop.",t.appendChild(i)}let n=document.createElement("button");n.type="button",n.className="rijtoevoegen",n.textContent="\uFF0B  Rij toevoegen",n.addEventListener("click",()=>{let i=on({columns:2,layout:"row",items:[]});this.rows_.push(i);let r=this.rows_.length-1;this.open_.add(`r${r}`),this.legePlekkenOpen_(i,r),this.emit_(),this.build_()}),t.appendChild(n)}binnenKop_(e,t){return e.addEventListener("click",n=>{n.preventDefault(),n.stopPropagation(),t(n)}),e}segment_(e,t,n,{inKop:i=!1}={}){let r=document.createElement("span");r.className="segment";let o=e.map(l=>{let d=document.createElement("button");d.type="button",d.textContent=l.label,l.titel&&(d.title=l.titel);let c=()=>{t()!==l.waarde&&n(l.waarde)};return i?this.binnenKop_(d,c):d.addEventListener("click",c),r.appendChild(d),[d,l.waarde]}),s=()=>o.forEach(([l,d])=>l.setAttribute("aria-pressed",String(t()===d)));return s(),{wrap:r,vernieuw:s}}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"name",selector:{text:{}}},{name:"surface",selector:{select:{mode:"dropdown",options:[{value:"card",label:"Om de hele kaart"},{value:"open",label:"Alleen een rand, geen vulling"},{value:"none",label:"Geen vlak"}]}}},{name:"state_position",selector:{select:{mode:"dropdown",options:[{value:"below",label:"Onder de naam"},{value:"right",label:"Rechts op de regel"}]}}}],e.computeLabel=t=>({name:"Naam van de kaart (optioneel)",surface:"Waar het kaartvlak zit",state_position:"Waar de status staat"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="name")return"Een kop boven de entiteiten. Laat leeg voor geen kop -- de kaart is dan een rasterrij lager.";if(t.name==="surface")return"Alleen een rand geeft een doorzichtige kaart die nog wel een vorm heeft; geen vlak laat de plekken los op het dashboard staan.";if(t.name==="state_position")return"Rechts is de vorm van de entiteitenkaart van Home Assistant: de waarden komen onder elkaar uit. Regels met een schakelaar of een tijdveld tonen geen tekst, en op een tegel staat de status altijd onder de naam."},e.data={name:this.rest_.name??"",surface:this.rest_.surface??(this.rest_.bare?"none":"card"),state_position:this.rest_.state_position??"below"},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{};typeof n.name=="string"&&n.name.trim()?this.rest_.name=n.name:delete this.rest_.name,n.surface==="items"||n.surface==="none"||n.surface==="open"?this.rest_.surface=n.surface:delete this.rest_.surface,delete this.rest_.bare,n.state_position==="right"?this.rest_.state_position="right":delete this.rest_.state_position,this.emit_()}),e}rijBlok_(e,t){let n=document.createElement("details");n.className="rij",this.onthoud_(n,`r${t}`);let i=document.createElement("summary"),r=document.createElement("span");r.className="pijl",r.textContent="\u203A";let o=document.createElement("span");o.className="titel";let s=document.createElement("b");s.textContent=`Rij ${t+1}`;let l=document.createElement("small");o.append(s,l);let d=this.segment_([1,2,3].map(I=>({waarde:I,label:String(I),titel:`${I} entiteit${I>1?"en":""} in deze rij`})),()=>e.columns,I=>{e.columns=I,on(e),this.open_.add(`r${t}`),this.legePlekkenOpen_(e,t),this.emit_(),this.build_()},{inKop:!0}),c=document.createElement("button");c.type="button",c.className="weg dupliceer",c.title="Rij dupliceren",c.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M6.5 15H5.6A1.6 1.6 0 0 1 4 13.4V5.6A1.6 1.6 0 0 1 5.6 4h7.8A1.6 1.6 0 0 1 15 5.6v.9"/></svg>',this.binnenKop_(c,()=>{this.rows_.splice(t+1,0,structuredClone(this.rows_[t])),this.rijErbij_(t),this.open_.add(`r${t+1}`),this.emit_(),this.build_()});let p=document.createElement("button");p.type="button",p.className="weg",p.title="Rij verwijderen",p.textContent="\u2715",this.binnenKop_(p,()=>{this.rows_.splice(t,1),this.rijWeg_(t),this.emit_(),this.build_()}),i.append(r,o,d.wrap,c,p);let h=document.createElement("div");h.className="rijbody";let u=this.segment_(ud.map(I=>({waarde:I.waarde,label:I.label})),()=>e.layout,I=>{e.layout=I,q(),this.emit_()}),m=document.createElement("div");m.className="vormrij";let b=document.createElement("b");b.textContent="Vorm van deze rij",m.append(b,u.wrap),h.appendChild(m);let x=this.segment_(xg.map(I=>({waarde:I.waarde,label:I.label})),()=>e.align??"links",I=>{e.align=I,this.emit_()}),w=document.createElement("div");w.className="vormrij";let y=document.createElement("b");y.textContent="Uitlijning",w.append(y,x.wrap),h.appendChild(w);let $=document.createElement("div");$.className="beeldvak";let T=document.createElement("ha-form");T.hass=this.hass_,T.schema=[{name:"image_size",selector:{number:{min:xr,max:wr,step:4,mode:"slider"}}}],T.computeLabel=()=>"Grootte van de afbeelding",T.computeHelper=()=>"In pixels. Groot genoeg om een QR-code te scannen begint rond de 160.",T.data={image_size:Ae(e.image_size)},T.addEventListener("value-changed",I=>{I.stopPropagation(),e.image_size=Ae(I.detail.value?.image_size),this.emit_()}),$.appendChild(T),h.appendChild($);let q=()=>{let I=e.layout==="beeld";$.style.display=I?"":"none",w.style.display=I?"none":""};q();let ne=document.createElement("div");ne.className="kolomvak";let se=document.createElement("ha-form");se.hass=this.hass_;let Qs=()=>Array.from({length:e.columns},(I,fe)=>({name:`k${fe}`,selector:{text:{}}}));se.schema=Qs(),se.computeLabel=I=>`Kop boven kolom ${Number(I.name.slice(1))+1}`,se.computeHelper=I=>I.name==="k0"?"Laat leeg voor geen koppen. Handig als er twee dingen naast elkaar staan die allebei een naam verdienen.":void 0;let Js=()=>Object.fromEntries(Array.from({length:e.columns},(I,fe)=>[`k${fe}`,e.column_names?.[fe]??""]));se.data=Js(),se.addEventListener("value-changed",I=>{I.stopPropagation();let fe=I.detail.value??{};e.column_names=Array.from({length:e.columns},(tl,Ku)=>fe[`k${Ku}`]??""),this.emit_()}),ne.appendChild(se),h.appendChild(ne);let el=()=>{let I=e.items.filter(ve),fe=[`${e.columns} kolom${e.columns>1?"men":""}`];e.layout!=="row"&&fe.push(wg(e.layout)),fe.push(I.length?I.map(tl=>this.itemNaam_(tl)).join(", "):"nog leeg"),e.column_names?.some?.(Boolean)&&fe.push("met kolomkoppen"),l.textContent=fe.join(" \xB7 "),d.vernieuw(),u.vernieuw(),x.vernieuw(),q(),se.schema.length!==e.columns&&(se.schema=Qs()),se.data=Js()};return this.koppen_.push(el),e.items.forEach((I,fe)=>h.appendChild(this.itemBlok_(e,I,t,fe))),n.append(i,h),el(),n}itemNaam_(e){return e.name||this.hass_?.states?.[e.entity]?.attributes?.friendly_name||e.entity||"Knop"}itemBlok_(e,t,n,i){let r=document.createElement("details");r.className="item",this.onthoud_(r,`r${n}i${i}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="pijl",s.textContent="\u203A";let l=document.createElement("span");l.className="nr",l.textContent=String(i+1),l.title=`Plek ${i+1} in de rij`;let d=document.createElement("span");d.className="titel";let c=document.createElement("b"),p=document.createElement("small");d.append(c,p);let h=document.createElement("button");h.type="button",h.className="weg",h.title="Deze plek leegmaken",h.textContent="\u2715",this.binnenKop_(h,()=>{e.items.splice(i,1),this.itemWeg_(n,i),on(e),this.emit_(),this.build_()}),o.append(s,l,d,h);let u=document.createElement("div");u.className="itembody";let m=document.createElement("ha-form");m.hass=this.hass_,m.schema=[{name:"entity",selector:{entity:{}}}],m.computeLabel=()=>"Entiteit",m.computeHelper=()=>"Mag leeg blijven: zonder entiteit wordt dit een navigatieknop. Geef hem dan een naam, een icoon en een tikactie.",m.addEventListener("value-changed",y=>{y.stopPropagation(),t.entity=y.detail.value.entity??"",this.emit_()});let b=document.createElement("dac-icon-picker");b.label="Icoon",b.hass=this.hass_,b.addEventListener("value-changed",y=>{y.stopPropagation(),y.detail.value?t.icon=y.detail.value:delete t.icon,this.emit_()});let x=document.createElement("ha-form");x.hass=this.hass_,x.schema=[{name:"name",selector:{text:{}}},{name:"toggle",selector:{boolean:{}}},{name:"show_icon",selector:{boolean:{}}},{name:"show_name",selector:{boolean:{}}},{name:"show_state",selector:{boolean:{}}},{name:"icon_tap_action",selector:{ui_action:{default_action:"toggle"}}},{name:"icon_hold_action",selector:{ui_action:{default_action:"more-info"}}},{name:"tap_action",selector:{ui_action:{default_action:"more-info"}}},{name:"hold_action",selector:{ui_action:{default_action:"more-info"}}},{name:"double_tap_action",selector:{ui_action:{default_action:"none"}}}],x.computeLabel=y=>({name:"Naam (overschrijft die van de entiteit)",toggle:"Schakelaar tonen",show_icon:"Icoon tonen",show_name:"Naam tonen",show_state:"Status tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de regel",hold_action:"Vasthouden op de regel",double_tap_action:"Dubbeltikken op de regel"})[y.name]??y.name,x.computeHelper=y=>{if(y.name==="icon_tap_action")return"Het icoon en de regel zijn twee knoppen: het icoon schakelt, de regel opent of navigeert.";if(y.name==="toggle")return"Een schuifschakelaar in plaats van de statustekst. Alleen voor wat twee standen heeft: een lamp, een stopcontact, een schakelaar.";if(y.name==="show_state")return"Een tijd of datum -- een input_datetime, of een klok van een apparaat -- verschijnt hier als een veld dat je meteen kunt zetten. Uit haalt met de tekst ook dat veld weg.";if(y.name==="double_tap_action")return"Laat dit op geen actie staan als je het niet gebruikt: een regel die op dubbeltikken wacht, reageert trager op een gewone tik."},x.addEventListener("value-changed",y=>{y.stopPropagation();let $=y.detail.value;$.name?t.name=$.name:delete t.name,$.toggle===!0?t.toggle=!0:delete t.toggle;for(let T of["show_icon","show_name","show_state"])$[T]===!1?t[T]=!1:delete t[T];for(let T of["icon_tap_action","icon_hold_action","tap_action","hold_action"])$[T]?t[T]=$[T]:delete t[T];$.double_tap_action&&$.double_tap_action.action!=="none"?t.double_tap_action=$.double_tap_action:delete t.double_tap_action,this.emit_()});let w=()=>{c.textContent=ve(t)?this.itemNaam_(t):"Kies een entiteit",p.textContent=t.entity||(ve(t)?"Zonder entiteit: een navigatieknop":""),r.dataset.leeg=String(!ve(t)),h.hidden=!ve(t)};return this.koppen_.push(w),m.data={entity:t.entity||void 0},b.value=t.icon??"",x.data={name:t.name??"",toggle:t.toggle??!1,show_icon:t.show_icon??!0,show_name:t.show_name??!0,show_state:t.show_state??!0,icon_tap_action:t.icon_tap_action,icon_hold_action:t.icon_hold_action,tap_action:t.tap_action,hold_action:t.hold_action,double_tap_action:t.double_tap_action},u.append(m,b,x),r.append(o,u),w(),r}emit_(){let e=yr(this.rows_),t={...this.rest_,rows:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_)n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};H("domotiapp-entities-card-editor",zr);var va=class extends S{validate(e){let t=pd(e);return t.some(n=>n.items.some(ve))?{show_state:!0,state_position:"below",...e,rows:t}:{...e,[C]:"Voeg een rij toe en kies daar entiteiten in."}}watched(){return this.config.rows.flatMap(e=>e.items.map(t=>t.entity))}item_(e,t){return this.config.rows[+e]?.items[+t]}tone_(e){return e.tone?ee(e.tone):this.config.tone?ee(this.config.tone):He(e.entity)!=="light"?E.accent:qn(k(this.hass,e.entity),this.licht_)??E.lit}metSchakelaar_(e){return!!e.toggle&&fl(e.entity)}metTijd_(e){return!rd(e.entity)||this.metSchakelaar_(e)?!1:(e.show_state??this.config.show_state)!==!1}metKeuze_(e){return!pr(e.entity)||this.metSchakelaar_(e)?!1:(e.show_state??this.config.show_state)!==!1}template(){let e=this.config;this.setAttribute("vlak",ba(e)),this.style.containerType="inline-size";let t=ba(e)==="items",n=e.rows.map((o,s)=>{let l=e.state_position==="right"&&o.layout!=="tile",d=`<span class="st${l?" rechts":""}"></span>`,c=o.items.map((h,u)=>`
          <div class="it${t?" surface":""}" role="button" tabindex="0"
               data-r="${s}" data-i="${u}">
            ${o.layout==="tile"?'<span class="wash"></span>':""}
            ${h.show_icon===!1?"":'<span class="chip" role="button" tabindex="0"></span>'}
            <span class="txt">${h.show_name===!1?"":'<span class="nm"></span>'}${l?"":d}</span>
            ${l?d:""}
            ${this.metSchakelaar_(h)?la({label:"Aan of uit"}):""}
            ${this.metTijd_(h)?'<span class="tijdslot" style="display:contents"></span>':""}
            ${this.metKeuze_(h)?'<span class="keuzeslot" style="display:contents"></span>':""}
          </div>`).join("");return`${o.column_names.length?`<div class="kolomkoppen" data-vorm="${o.layout}" data-uit="${o.align}"
              style="--cols:${o.columns}">${o.column_names.map(h=>`<span>${_(h)}</span>`).join("")}</div>`:""}
      <div class="row" data-vorm="${o.layout}" data-uit="${o.align}"
           style="--cols:${o.columns};--it-h:${o.layout==="beeld"?o.image_size+34:ga[o.layout]}px;--beeld:${o.image_size}px">${c}</div>`}).join("");return`<div class="card surface">${fa(e)?'<h3 class="kaartnaam"></h3>':""}${n}</div>`}wire(){this.$$(".it").forEach(e=>{let t=this.item_(e.dataset.r,e.dataset.i);if(!t)return;let n=(s,l)=>de(this,this.hass,t,t[s]??l),i={action:t.entity?"more-info":"none"};this.teardown_.push(B(e,{onTap:()=>n("tap_action",i),onHold:()=>n("hold_action",i),onDouble:t.double_tap_action?()=>n("double_tap_action",{action:"none"}):void 0}));let r=e.querySelector(".chip");if(r&&(this.teardown_.push(B(r,{onTap:()=>n("icon_tap_action",pt(t.entity)),onHold:()=>n("icon_hold_action",i)})),this.on(r,"click",s=>s.stopPropagation()),this.on(r,"pointerdown",s=>s.stopPropagation())),e.querySelector(".tijdslot")){let s=p=>{let h=p.target?.closest?.(".tijd");if(h&&(p.stopPropagation(),p.type==="click"))try{h.showPicker?.()}catch{}};this.on(e,"pointerdown",s,!0),this.on(e,"click",s,!0);let l=null,d=null,c=()=>{clearTimeout(d),d=null;let p=l;l=null,p&&this.hass.callService(p[0],p[1],p[2])};this.teardown_.push(()=>clearTimeout(d)),this.on(e,"change",p=>{let h=p.target?.closest?.(".tijd");h&&(p.stopPropagation(),l=sd(t.entity,h.type,h.value),clearTimeout(d),d=setTimeout(c,600))}),this.on(e,"focusout",p=>{p.target?.closest?.(".tijd")&&c()})}if(e.querySelector(".keuzeslot")){let s=l=>{l.target?.closest?.(".keuze")&&l.stopPropagation()};this.on(e,"pointerdown",s,!0),this.on(e,"click",s,!0),this.on(e,"keydown",s,!0),this.on(e,"change",l=>{let d=l.target?.closest?.(".keuze");if(!d)return;l.stopPropagation();let c=k(this.hass,t.entity),p=Tt(t.entity,d.value,$e(c));p&&this.hass.callService(p[0],p[1],p[2])})}let o=e.querySelector(".toggle");o&&this.teardown_.push(da(o,{value:()=>Z(k(this.hass,t.entity)),set:s=>this.hass.callService("homeassistant",s?"turn_on":"turn_off",{entity_id:t.entity}),disabled:()=>pe(k(this.hass,t.entity))}))})}paint(){let e=this.$(".kaartnaam");e&&this.text(e,fa(this.config)),this.$$(".it").forEach(t=>{let n=this.item_(t.dataset.r,t.dataset.i);if(!n)return;let i=k(this.hass,n.entity),r=Z(i),o=!!n.entity&&pe(i);t.dataset.on=String(r),t.classList.toggle("unavailable",o);let s=this.tone_(n);t.style.setProperty("--tone",s);let l=M(this.hass,n.entity,n.name),d=t.querySelector(".chip");if(d){let y=ct(this.hass,n.entity,n.icon),$=n.icon||(y?`pic:${y}`:Ui(n.entity,J(this.hass,n.entity)));d.dataset.icon!==$&&(d.dataset.icon=$,d.classList.toggle("pic",!!y),d.innerHTML=y?`<img src="${y}" alt="" loading="lazy" />`:v(n.icon||Ui(n.entity,J(this.hass,n.entity)))),d.style.setProperty("--tone",y?"var(--dac-ink-3)":r?s:"var(--dac-ink-3)"),d.setAttribute("aria-label",n.entity?`${l} schakelen`:"Icoon")}let c=t.querySelector(".nm");c&&this.text(c,l);let p=t.querySelector(".toggle");p&&(tn(p,r),p.style.setProperty("--tone",s),p.setAttribute("aria-label",`${l} aan of uit`));let h=t.querySelector(".tijdslot"),u=null;if(h){let y=o?null:vr(i);h.dataset.soort!==(y??"")&&(h.dataset.soort=y??"",h.innerHTML=y?`<input class="tijd" type="${y}" step="60" />`:""),u=h.querySelector(".tijd")}if(u&&(u.setAttribute("aria-label",`${l} instellen`),this.shadowRoot.activeElement!==u)){let y=od(i,h.dataset.soort);u.value!==y&&(u.value=y)}let m=t.querySelector(".keuzeslot"),b=null;if(m){let y=o?[]:$e(i),$=y.map(q=>ua(q,this.hass?.formatEntityState?.(i,q))),T=JSON.stringify([y,$]);m.dataset.opties!==T&&(m.dataset.opties=T,m.innerHTML=y.length?`<select class="keuze">${y.map((q,ne)=>`<option value="${_(q)}">${_($[ne])}</option>`).join("")}</select>`:""),b=m.querySelector(".keuze")}if(b&&(b.setAttribute("aria-label",`${l} kiezen`),this.shadowRoot.activeElement!==b)){let y=Lt(i);b.value!==y&&(b.value=y)}let x=t.querySelector(".st"),w=n.show_state??this.config.show_state;if(p||u||b)x.textContent="";else if(w===!1)x.textContent="";else if(o)x.textContent="Niet bereikbaar";else if(!i||Ki(i.entity_id))x.textContent="";else if(He(i.entity_id)==="light"&&r&&i.attributes.brightness!=null)x.textContent=`${Math.round(i.attributes.brightness/255*100)}%`;else{let y=i.attributes.unit_of_measurement;x.textContent=y?`${i.state} ${y}`:te(this.hass,i)}t.setAttribute("aria-label",`${l}${i?`, ${te(this.hass,i)}`:""}`)})}getCardSize(){return Ie(_r(this.config))}getGridOptions(){let e=Ie(_r(this.config));return{columns:12,rows:e,min_columns:4,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-entities-card-editor")}static getStubConfig(){return{rows:[]}}};j(va,"css",`
    :host { display: block; height: 100%; }

    .card {
      height: 100%; min-height: 56px; padding: 5px 10px;
      display: flex; flex-direction: column; justify-content: center; gap: ${Qe}px;
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
      font-size: 13px; font-weight: 600; letter-spacing: -.01em; line-height: ${kr}px;
      color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    .row {
      display: grid; gap: ${Qe}px;
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
      display: grid; gap: ${Qe}px;
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

    ${ca}
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
      color: var(--dac-ink); color-scheme: var(--dac-scheme);
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
      color: var(--dac-ink); color-scheme: var(--dac-scheme);
      background-color: var(--dac-bg-raise);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      padding: 5px 8px 5px 10px; cursor: pointer;
      text-overflow: ellipsis;
      transition: background 200ms ease, border-color 200ms ease;
    }
    @media (hover: hover) { .keuze:hover { border-color: var(--dac-border-hi); } }
    .keuze:focus-visible { outline: 2px solid var(--tone); outline-offset: 1px; }
    .keuze option { background-color: var(--dac-bg-raise); color: var(--dac-ink); }
    .keuze option:checked { background-color: var(--dac-accent); color: var(--dac-on-accent); }
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
  `);D("domotiapp-entities-card",va,{name:"DomotiApp Entiteiten",description:"Entiteiten in rijen, elk met een eigen kolomindeling en vorm: regel, tegel of compacte pil. Ook voor een losse knop."});var ae={PAUSE:1,SEEK:2,VOLUME_SET:4,VOLUME_MUTE:8,PREVIOUS_TRACK:16,NEXT_TRACK:32,TURN_ON:128,TURN_OFF:256,PLAY_MEDIA:512,VOLUME_STEP:1024,SELECT_SOURCE:2048,STOP:4096,PLAY:16384,SHUFFLE_SET:32768,REPEAT_SET:262144,GROUPING:524288},ie=(a,e)=>!!(Number(a?.attributes?.supported_features??0)&e),Rt=a=>!a||a.state==="off",$r=a=>!!a&&!["off","unavailable","unknown"].includes(a.state),sn=a=>a?.state==="playing",md=a=>!!a&&!["off","unavailable","unknown","idle","standby"].includes(a.state);function gd(a){if(!a)return[];let e=[];return(ie(a,ae.TURN_ON)||ie(a,ae.TURN_OFF))&&e.push("power"),Rt(a)||(ie(a,ae.PREVIOUS_TRACK)&&e.push("prev"),ie(a,ae.PLAY)||ie(a,ae.PAUSE)||ie(a,ae.PLAY_MEDIA)?e.push("play"):ie(a,ae.STOP)&&e.push("stop"),ie(a,ae.NEXT_TRACK)&&e.push("next")),e}var Je=a=>a?.volume_entity||a?.entity;function Er(a){if(!$r(a))return[];let e=[];return ie(a,ae.VOLUME_MUTE)&&e.push("mute"),ie(a,ae.VOLUME_SET)?e.push("slider"):ie(a,ae.VOLUME_STEP)&&e.push("steps"),e}var et=a=>Math.round(Math.min(1,Math.max(0,Number(a?.attributes?.volume_level??0)))*100),fd=a=>a?.attributes?.volume_level!==void 0&&a?.attributes?.volume_level!==null,ln=a=>!!a?.attributes?.is_volume_muted,Ar=a=>!!a?.attributes?.mass_player_type,Sr=a=>!!a?.attributes?.shuffle,Mr=a=>{let e=a?.attributes?.repeat;return["off","all","one"].includes(e)?e:"off"},bd=a=>({off:"all",all:"one",one:"off"})[yg(a)]??"all",yg=a=>["off","all","one"].includes(a)?a:"off";function Nr(a,{zoeken:e=!0,sleep:t=!1}={}){if(!$r(a))return[];let n=[];return ie(a,ae.SHUFFLE_SET)&&n.push("shuffle"),ie(a,ae.REPEAT_SET)&&n.push("repeat"),t&&n.push("sleep"),e&&Ar(a)&&n.push("search"),n}function Dr(a,{tonen:e=!0}={}){if(!e||!$r(a)||!ie(a,ae.SELECT_SOURCE)||Ar(a))return null;let t=a?.attributes?.source_list;return!Array.isArray(t)||t.length<2?null:{nu:a.attributes.source??null,aantal:t.length}}function vd(a,e,t=e){let n=!e||e.state==="unavailable",i=a?.show_volume===!1||n?[]:Er(t),r=n?null:Dr(e,{tonen:a?.show_source!==!1}),o=n||a?.show_controls===!1?[]:Nr(e,{zoeken:a?.show_search!==!1,sleep:a?.sleep_timer===!0}),s=1+(i.length||r?1:0)+(o.length?1:0)+(a?.speaker_select?1:0);return Math.min(3,s)}function ka(a,e=t=>t?.state??""){if(!a)return"";if(a.state==="unavailable")return"Niet bereikbaar";if(a.state==="off")return"Uit";if(a.state==="standby")return"Stand-by";let t=a.attributes??{},n=t.media_title||t.media_channel||"",i=t.media_artist||t.media_series_title||t.media_album_name||t.app_name||t.source||"";return a.state==="idle"||!n?i||e(a):i&&i!==n?`${n} \xB7 ${i}`:n}function dn(a){let e=a?.attributes?.device_class;return e==="tv"?"tv":e==="receiver"?"radio":"speaker"}var jg="domotiapp-media-speler:";function Lr(a,e){let t=s=>e?.states?.[s]?.attributes?.friendly_name??s,n=s=>!!e?.states?.[s],i=()=>Object.keys(e?.states??{}).filter(s=>s.startsWith("media_player."));return(Array.isArray(a?.players)&&a.players.length?[...new Set([...n(a?.entity)?[a.entity]:[],...a.players.filter(n)])]:zg(i(),e)).sort((s,l)=>String(t(s)).localeCompare(String(t(l)),"nl"))}function zg(a,e){let t=a.filter(n=>Ar(e?.states?.[n]));return t.length?t:a}var kd=a=>jg+(a??[]).join("|");function xd(a,e,t){if(!a?.speaker_select)return a?.entity??"";let n=null;try{n=t?.getItem?.(kd(e))??null}catch{n=null}return n&&e?.includes(n)?n:a.entity&&e?.includes(a.entity)?a.entity:a.entity||e?.[0]||""}function wd(a,e,t){try{return a?.setItem?.(kd(e),String(t)),!0}catch{return!1}}var Tr="dacScrollSlot",_d=["position","top","left","right","width","overflow"];function xa(a=globalThis.document,e=globalThis.window){let t=a?.body;if(!t?.style||t.dataset?.[Tr])return()=>{};let n=e?.scrollY??a.documentElement?.scrollTop??0,i=Object.fromEntries(_d.map(o=>[o,t.style[o]]));t.dataset&&(t.dataset[Tr]="1"),t.style.position="fixed",t.style.top=`-${n}px`,t.style.left="0",t.style.right="0",t.style.width="100%",t.style.overflow="hidden";let r=!1;return()=>{if(!r){r=!0;for(let o of _d)t.style[o]=i[o];t.dataset&&delete t.dataset[Tr],e?.scrollTo?.(0,n)}}}var $g=[400,1e3,2e3,4e3,8e3,15e3,3e4],Eg=6e4;function re(a){let e=a?.code;return e==="unknown_command"?!0:e==="not_allowed"&&/niet geladen/i.test(String(a?.message??""))}var le=class{constructor(e,{wachttijden:t=$g,traag:n=Eg,klok:i,stopKlok:r}={}){this.doe_=e,this.wachttijden_=t,this.traag_=n,this.klok_=i??((o,s)=>setTimeout(o,s)),this.stopKlok_=r??(o=>clearTimeout(o)),this.poging=0,this.timer_=null}get magNog(){return this.poging<this.wachttijden_.length}plan(){let e=this.magNog;if(this.timer_)return e;let t=e?this.wachttijden_[this.poging]:this.traag_;return this.poging+=1,this.timer_=this.klok_(()=>{this.timer_=null,this.doe_()},t),e}herstel(){this.stop(),this.poging=0}stop(){this.timer_!==null&&(this.stopKlok_(this.timer_),this.timer_=null)}},ke=class{constructor(){this.was_=!0}herverbonden(e){let t=e?.connected!==!1,n=t&&!this.was_;return this.was_=t,n}};var Ag=`
  ${U}
  :host {
    ${W}
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
    background: var(--dac-scrim);
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
    box-shadow: 0 24px 60px -20px rgba(0,0,0,calc(.7 * var(--dac-diepte)));
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
    border-color: transparent; color: var(--dac-on-accent-hi);
    background: var(--dac-accent-hi);
  }
  @media (hover: hover) { button.ja:hover { background: var(--dac-accent-hi); filter: brightness(1.08); } }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
`,Or=null,yd=a=>String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),Cr=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),Or=Or??[Q(Ag)],this.shadowRoot.adoptedStyleSheets=Or}connectedCallback(){this.gebouwd_||this.bouw_()}bouw_(){this.shadowRoot.innerHTML=`
      <div class="laag" role="dialog" aria-modal="true">
        <div class="vak">
          <h2></h2>
          <p></p>
          <div class="knoppen">
            <button type="button" class="nee"></button>
            <button type="button" class="ja"></button>
          </div>
        </div>
      </div>`,this.gebouwd_=!0,this.$(".nee").addEventListener("click",()=>this.klaar_(!1)),this.$(".ja").addEventListener("click",()=>this.klaar_(!0)),this.$(".laag").addEventListener("click",e=>{e.target===this.$(".laag")&&this.klaar_(!1)}),this.addEventListener("keydown",e=>{e.key==="Escape"&&this.klaar_(!1)})}$(e){return this.shadowRoot.querySelector(e)}open(e){return F(this),this.gebouwd_||this.bouw_(),this.$("h2").innerHTML=yd(e.title??"Weet je het zeker?"),this.$("p").innerHTML=yd(e.text??"Weet je zeker dat je dit wilt doen?"),this.$(".nee").textContent=e.dismissText??"Annuleren",this.$(".ja").textContent=e.confirmText??"OK",this.setAttribute("open",""),setTimeout(()=>this.$(".nee")?.focus(),40),new Promise(t=>{this.antwoord_=t})}klaar_(e){if(!this.hasAttribute("open"))return;this.removeAttribute("open");let t=this.antwoord_;this.antwoord_=null,t?.(e)}};H("domotiapp-vraag",Cr);function Se(a={}){let e=document.querySelector("domotiapp-vraag");e||(e=document.createElement("domotiapp-vraag"),document.body.appendChild(e)),e.tabIndex=-1;let t=e.open(a);return e.focus?.(),t}gl(Se);var jd=[["playlists","Afspeellijsten"],["radio","Radio"],["tracks","Nummers"],["albums","Albums"],["artists","Artiesten"]];var tt=a=>`domotiapp_lovelace/media/${a}`;function Sg(a,e){if(!a)return null;if(e)return a.uri?{type:tt("favorite"),favorite:!0,uri:a.uri}:null;let t=zd(a);return!t||!a.library_item_id?null:{type:tt("favorite"),favorite:!1,kind:t,library_item_id:String(a.library_item_id)}}function zd(a){let e=a?.media_type;return{track:"tracks",album:"albums",artist:"artists",playlist:"playlists",radio:"radio",podcast:"podcasts",audiobook:"audiobooks"}[e]??null}var $d={tracks:"track",albums:"album",artists:"artist",playlists:"playlist",radio:"radio",podcasts:"podcast",audiobooks:"audiobook"},Rr=[["","Alles"],["track","Nummers"],["album","Albums"],["artist","Artiesten"],["playlist","Afspeellijsten"],["radio","Radio"]];function Ed(a,e,t=null){return a?.kind??zd(e)??t??"playlists"}var Hr=a=>!!a?.uri,wa=(a,e,{favoriet:t=!1,zoek:n="",limiet:i=50}={})=>a.callWS({type:tt("library"),kind:e,favorite:t,...n?{search:n}:{},limit:i}).then(r=>r?.items??[]),Ad=(a,e,t)=>{let n=Sg(e,t);return n?a.callWS(n):Promise.reject(new Error("Dit item kan niet favoriet gemaakt worden."))},Sd=(a,e)=>a.callWS({type:tt("playlist/create"),name:e}).then(t=>t?.playlist??null),Md=(a,e)=>a.callWS({type:tt("playlist/remove"),library_item_id:String(e.library_item_id)}),Nd=(a,e)=>a.callWS({type:tt("playlist/tracks"),library_item_id:String(e.library_item_id),provider:e.provider??"library"}).then(t=>t?.tracks??[]),Dd=(a,e,t)=>a.callWS({type:tt("playlist/add_tracks"),library_item_id:String(e.library_item_id),uris:t}),Ld=(a,e,t)=>a.callWS({type:tt("playlist/remove_tracks"),library_item_id:String(e.library_item_id),positions:t});var Mg=350,Ng={track:"Nummer",album:"Album",artist:"Artiest",playlist:"Afspeellijst",radio:"Radio",podcast:"Podcast",audiobook:"Luisterboek"};function Dg(a){let e=Array.isArray(a.artists)?a.artists.map(i=>typeof i=="string"?i:i?.name).filter(Boolean).join(", "):"",t=typeof a.album=="string"?a.album:a.album?.name,n=Ng[a.media_type]??"";return[e,t].filter(Boolean).join(" \xB7 ")||n}var Lg=`
  ${U}
  :host {
    ${W}
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
    background: rgba(var(--dac-tint), .05); border: 1px solid var(--dac-border);
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
    background: rgba(var(--dac-tint), .06); color: var(--dac-ink-3);
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

  ${Ze}
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
    box-shadow: 0 18px 40px -18px rgba(0,0,0,calc(.9 * var(--dac-diepte)));
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
    border-radius: var(--dac-radius-sm); box-shadow: 0 24px 48px -20px rgba(0,0,0,calc(.9 * var(--dac-diepte)));
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
`,Ir=class extends HTMLElement{static get sheet_(){return Object.hasOwn(this,"s_")||(this.s_=Q(Ue+Lg)),this.s_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[new.target.sheet_],this.soort_="",this.treffers_=[],this.speakers_=null,this.opruimen_=[],this.zoekHerkansing_=new le(()=>this.zoek_()),this.speakerHerkansing_=new le(()=>this.haalSpeakers_())}open(e,t,n,{radioModus:i=!1,speakers:r=null}={}){F(this),this.hass=e,this.entity_=t,this.naam_=n,this.radioModus_=i,this.speakerKeuze_=Array.isArray(r)&&r.length?r:null,this.gebouwd_||this.bouw_(),this.setAttribute("open",""),this.escape_??=o=>{o.key==="Escape"&&this.hasAttribute("open")&&this.sluit()},document.addEventListener("keydown",this.escape_,!0),this.scrollLos_??=xa(),this.$(".wie b").textContent=n,this.$(".wie span").textContent="Music Assistant",this.sprekerSig_=null,this.$("footer")?.removeAttribute("open"),this.$(".voetkop")?.setAttribute("aria-expanded","false"),this.lijst_=null,this.soort_="",this.naarTab_("zoeken"),this.haalSpeakers_(),setTimeout(()=>this.$(".zoek input")?.focus(),60)}sluit(){this.removeAttribute("open"),this.menuDicht_(),this.escape_&&document.removeEventListener("keydown",this.escape_,!0),this.scrollLos_?.(),this.scrollLos_=null}set hass(e){this.hass_=e,this.gebouwd_&&this.hasAttribute("open")&&this.tekenSpeakers_()}get hass(){return this.hass_}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.gebouwd_=!0,this.shadowRoot.innerHTML=`
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
          ${Rr.map(([t,n])=>`<button type="button" data-soort="${t}" aria-pressed="${t===""}">${n}</button>`).join("")}
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
      </div>`,this.aan_(this.$(".sluit"),"click",()=>this.sluit()),this.aan_(this.$(".laag"),"pointerdown",t=>{t.target===this.$(".laag")?this.sluit():t.target.closest(".menu")||this.menuDicht_()});let e=this.$(".zoek input");this.aan_(this.$(".zoekknop"),"click",()=>{clearTimeout(this.timer_),this.zoek_(),e.focus()}),this.aan_(e,"input",()=>this.tikPauze_()),this.aan_(e,"keydown",t=>{t.key==="Enter"&&(clearTimeout(this.timer_),this.zoek_()),t.key==="Escape"&&this.sluit()}),this.lijstLuisteraars_(),this.aan_(this.$(".voetkop"),"click",()=>{let n=this.$("footer").toggleAttribute("open");this.$(".voetkop").setAttribute("aria-expanded",String(n)),this.voetOpen_=n}),this.aan_(this.$(".tabs"),"click",t=>{let n=t.target.closest("[data-tab]");n&&this.naarTab_(n.dataset.tab)}),this.aan_(this.$(".terug"),"click",()=>{this.lijst_=null,this.naarTab_("lijsten")}),this.aan_(this.$(".weglijst"),"click",()=>this.lijstWeg_()),this.aan_(this.$(".nieuwe"),"click",()=>{this.$(".nieuwrij").hidden=!1,this.$(".nieuwe").hidden=!0,this.$(".nieuwrij input").value="",this.$(".nieuwrij input").focus()}),this.aan_(this.$("[data-maak]"),"click",()=>this.lijstMaken_()),this.aan_(this.$(".nieuwrij input"),"keydown",t=>{t.key==="Enter"&&this.lijstMaken_(),t.key==="Escape"&&(this.$(".nieuwrij").hidden=!0,this.$(".nieuwe").hidden=!1)}),this.aan_(this.$(".soorten"),"click",t=>{let n=t.target.closest("[data-soort]");if(n){this.modus_==="favorieten"?this.bibSoort_=n.dataset.soort:this.soort_=n.dataset.soort;for(let i of this.shadowRoot.querySelectorAll("[data-soort]"))i.setAttribute("aria-pressed",String(i===n));clearTimeout(this.timer_),this.modus_==="favorieten"?this.haalFavorieten_():this.zoek_()}}),this.aan_(this.$(".sprekers"),"click",t=>{let n=t.target.closest("button[data-speaker]");n&&!n.disabled&&this.wisselSpeaker_(n.dataset.speaker)}),this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen: nummers, albums, artiesten, afspeellijsten en radio.")}aan_(e,t,n,i){e.addEventListener(t,n,i),this.opruimen_.push(()=>e.removeEventListener(t,n,i))}tikPauze_(){clearTimeout(this.timer_),this.timer_=setTimeout(()=>this.zoek_(),Mg)}async zoek_(){let e=this.$(".zoek input");if(!e)return;let t=e.value.trim();if(!t){this.treffers_=this.zoekTreffers_=[],this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen.");return}let n=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Zoeken\u2026",t);try{let i=await this.hass.callWS({type:"domotiapp_lovelace/media/search",query:t,...this.soort_?{media_types:[this.soort_]}:{},limit:20});if(n!==this.beurt_)return;this.treffers_=this.zoekTreffers_=i?.results??[],this.zoekHerkansing_.herstel(),this.teken_()}catch(i){if(n!==this.beurt_)return;if(re(i)){this.zoekHerkansing_.plan(),this.leegMelding_("Home Assistant start nog op","Zodra DomotiApp klaar is met opstarten, wordt er vanzelf gezocht.");return}this.leegMelding_("Zoeken lukte niet",i?.message??"Music Assistant gaf geen antwoord.",!0)}}naarTab_(e){this.modus_=e;for(let n of this.shadowRoot.querySelectorAll("[data-tab]"))n.setAttribute("aria-selected",String(n.dataset.tab===e));let t=e==="lijsten"&&this.lijst_;if(this.$(".zoek").hidden=e!=="zoeken",this.$(".soorten").hidden=e==="lijsten",this.$(".lijstkop").hidden=!t,this.$(".nieuwe").hidden=e!=="lijsten"||!!this.lijst_,this.$(".nieuwrij").hidden=!0,e==="zoeken"){if(this.tekenSoorten_(Rr,this.soort_),this.treffers_=this.zoekTreffers_??[],!this.treffers_.length){this.leegMelding_("Zoek in Music Assistant","Typ een naam en kies uit alles wat je bibliotheek en je providers kennen.");return}this.teken_();return}if(e==="favorieten"){this.haalFavorieten_();return}t?this.openLijst_(this.lijst_):this.haalLijsten_()}tekenSoorten_(e,t){this.$(".soorten").innerHTML=e.map(([n,i])=>`<button type="button" data-soort="${n}" aria-pressed="${n===t}">${i}</button>`).join("")}async haalFavorieten_(){this.bibSoort_??="playlists",this.tekenSoorten_(jd,this.bibSoort_);let e=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026","Je favorieten uit Music Assistant.");try{let t=await wa(this.hass,this.bibSoort_,{favoriet:!0});if(e!==this.beurt_)return;if(this.treffers_=t,!t.length){this.leegMelding_("Nog geen favorieten","Zoek iets op en tik op het hartje om het hier te zetten.");return}this.teken_()}catch(t){if(e!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}async favorietOm_(e,t){let n=!e.favorite;e.favorite=n,t?.setAttribute("aria-pressed",String(n));try{let i=await Ad(this.hass,e,n);n&&i?.library_item_id&&(e.library_item_id=i.library_item_id,i.kind&&(e.media_type=$d[i.kind]??e.media_type)),n&&(this.bibSoort_=Ed(i,e,this.bibSoort_)),this.modus_==="favorieten"&&!n&&this.haalFavorieten_()}catch(i){e.favorite=!n,t?.setAttribute("aria-pressed",String(!n)),this.leegMelding_("Dat lukte niet",i?.message??"Music Assistant gaf geen antwoord.",!0)}}async haalLijsten_(){let e=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026","Je afspeellijsten uit Music Assistant.");try{let t=await wa(this.hass,"playlists",{});if(e!==this.beurt_)return;if(this.treffers_=t,!t.length){this.leegMelding_("Nog geen afspeellijsten","Maak er een met de knop hierboven.");return}this.teken_()}catch(t){if(e!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}async openLijst_(e){this.lijst_=e,this.modus_="lijsten",this.$(".lijstkop").hidden=!1,this.$(".lijstkop b").textContent=e.name??"Afspeellijst",this.$(".nieuwe").hidden=!0,this.$(".weglijst").hidden=!e.is_editable;let t=this.beurt_=(this.beurt_??0)+1;this.leegMelding_("Ophalen\u2026",e.name??"");try{let n=await Nd(this.hass,e);if(t!==this.beurt_)return;if(this.treffers_=n,!n.length){this.leegMelding_("Deze lijst is leeg","Zoek iets op en kies 'Aan afspeellijst toevoegen'.");return}this.teken_()}catch(n){if(t!==this.beurt_)return;this.leegMelding_("Ophalen lukte niet",n?.message??"Music Assistant gaf geen antwoord.",!0)}}async lijstMaken_(){let e=this.$(".nieuwrij input").value.trim();if(e){this.$(".nieuwrij").hidden=!0;try{await Sd(this.hass,e),this.lijst_=null,this.naarTab_("lijsten")}catch(t){this.leegMelding_("Maken lukte niet",t?.message??"Music Assistant gaf geen antwoord.",!0)}}}async lijstWeg_(e){let t=e??this.lijst_;if(!(!t||!await Se({title:"Afspeellijst verwijderen?",text:`"${t.name}" wordt uit Music Assistant gehaald. De nummers zelf blijven gewoon in je bibliotheek staan.`,confirmText:"Verwijderen",dismissText:"Annuleren"})))try{await Md(this.hass,t),this.lijst_&&this.lijst_.uri===t.uri&&(this.lijst_=null),this.melding_(`"${t.name}" verwijderd`),this.naarTab_("lijsten")}catch(i){this.melding_(i?.message??"Verwijderen lukte niet",!0)}}async nummerWeg_(e){let t=this.lijst_;if(!(!t||e.position==null))try{await Ld(this.hass,t,[e.position]),this.melding_(`"${e.name}" uit de lijst gehaald`),await this.naVerwerking_(t)}catch(n){this.melding_(n?.message??"Verwijderen lukte niet",!0)}}async naVerwerking_(e){for(let t of[900,2500]){if(await new Promise(n=>setTimeout(n,t)),this.lijst_!==e||!this.hasAttribute("open"))return;await this.openLijst_(e)}}async kiesLijstVoor_(e){this.menuDicht_();let t=[];try{t=await wa(this.hass,"playlists",{})}catch{t=[]}let n=t.filter(r=>r.is_editable),i=this.$(".menu");i.innerHTML='<span class="titel">Aan welke lijst?</span>'+(n.length?n.map((r,o)=>`<button type="button" data-lijst="${o}">${this.veilig_(r.name)}</button>`).join(""):'<span class="titel">Geen bewerkbare lijst. Maak er eerst een.</span>'),i.hidden=!1,this.menuPlaats_(i),i.scrollTop=0,i.onclick=async r=>{let o=r.target.closest("[data-lijst]");if(!o)return;let s=n[+o.dataset.lijst];this.menuDicht_();try{await Dd(this.hass,s,[e.uri]),this.melding_(`"${e.name}" toegevoegd aan "${s.name}"`)}catch(l){this.melding_(l?.message??"Toevoegen lukte niet",!0)}}}melding_(e,t=!1){let n=this.$(".toast");n||(n=document.createElement("div"),n.className="toast",this.$(".laag").appendChild(n)),n.textContent=e,n.dataset.fout=String(t),n.hidden=!1,clearTimeout(this.toastTimer_),this.toastTimer_=setTimeout(()=>{n.hidden=!0},t?6e3:3e3)}leegMelding_(e,t,n=!1){this.$(".lijst").innerHTML=`<div class="melding${n?" fout":""}"><b>${e}</b>${t}</div>`}teken_(){let e=this.$(".lijst");if(!this.treffers_.length){this.leegMelding_("Niets gevonden","Probeer een andere naam of een ander soort.");return}let t=this.modus_==="lijsten"&&this.lijst_;e.innerHTML=this.treffers_.map((n,i)=>{let r=n.image?`<img src="${n.image}" alt="" loading="lazy" />`:v(n.media_type==="radio"?"radio":"music"),o=Hr(n)&&!t?`<button class="hart" type="button" data-hart="${i}" aria-pressed="${!!n.favorite}"
                 aria-label="Favoriet">${v("star")}</button>`:"",s=t?`<button class="weg" type="button" data-weg="${i}"
               aria-label="Uit deze afspeellijst halen">${v("close")}</button>`:"",l=`<button class="meer" type="button" data-meer="${i}"
               aria-label="Meer met ${this.veilig_(n.name)}">${v("dots")}</button>`,d=(o||s?1:0)+1;return`
          <div class="rij" data-i="${i}" data-knoppen="${d}">
            <button class="tr" type="button">
              <span class="hoes">${r}</span>
              <span class="tekst">
                <span class="nm">${this.veilig_(n.name)}</span>
                <span class="ond">${this.veilig_(Dg(n))}</span>
              </span>
            </button><span class="knoppen">${o}${s}${l}</span>
          </div>`}).join(""),this.trefferBinding_?.(),this.trefferBinding_=B(e,{onTap:()=>{let n=this.laatsteTreffer_;n&&(this.modus_==="lijsten"&&!this.lijst_?this.openLijst_(n):this.speel_(n,"replace",{radio:this.radioStandaard_(n)}))},onHold:()=>{let n=this.laatsteTreffer_;n&&this.menuOpen_(n)}})}lijstLuisteraars_(){let e=this.$(".lijst");this.aan_(e,"click",t=>{let n=t.target.closest("[data-hart]"),i=t.target.closest("[data-weg]"),r=t.target.closest("[data-meer]");!n&&!i&&!r||(t.stopImmediatePropagation(),t.preventDefault(),n?this.favorietOm_(this.treffers_[+n.dataset.hart],n):i?this.nummerWeg_(this.treffers_[+i.dataset.weg]):(this.menuPlek_=r.getBoundingClientRect(),this.menuOpen_(this.treffers_[+r.dataset.meer])))}),this.aan_(e,"pointerdown",t=>{t.target.closest("[data-hart], [data-weg], [data-meer]")&&t.stopImmediatePropagation()}),this.aan_(e,"pointerdown",t=>{let n=t.target.closest("[data-i]");this.laatsteTreffer_=n?this.treffers_[+n.dataset.i]:null,this.menuPlek_=n?n.getBoundingClientRect():null})}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}speel_(e,t,{radio:n=!1}={}){e?.uri&&(this.menuDicht_(),this.hass.callService("music_assistant","play_media",{media_id:e.uri,...e.media_type?{media_type:e.media_type}:{},enqueue:t,...n?{radio_mode:!0}:{}},{entity_id:this.entity_}),t==="replace"&&this.sluit())}kanRadio_(e){return["track","album","artist"].includes(e?.media_type)}radioStandaard_(e){return!!this.radioModus_&&this.kanRadio_(e)}menuOpen_(e){let t=this.$(".menu"),n=this.modus_==="lijsten"&&this.lijst_;t.innerHTML=`<span class="titel">${this.veilig_(e.name)}</span><button type="button" data-w="replace">Nu afspelen</button>`+(this.kanRadio_(e)?'<button type="button" data-radio>Afspelen en doorgaan</button>':"")+'<button type="button" data-w="next">Hierna afspelen</button><button type="button" data-w="add">Achteraan in de wachtrij</button>'+(Hr(e)?`<button type="button" data-fav>${e.favorite?"Uit favorieten":"Favoriet maken"}</button>`:"")+(e.uri&&!n&&e.media_type!=="playlist"?'<button type="button" data-toe>Aan afspeellijst toevoegen</button>':"")+(e.media_type==="playlist"&&e.is_editable?'<button type="button" class="kritiek" data-lijstweg>Afspeellijst verwijderen</button>':""),t.hidden=!1,this.menuPlaats_(t),t.onclick=i=>{let r=i.target.closest("[data-w]");if(r)return this.speel_(e,r.dataset.w,{radio:r.dataset.w==="replace"&&this.radioStandaard_(e)});if(i.target.closest("[data-radio]"))return this.speel_(e,"replace",{radio:!0});if(i.target.closest("[data-fav]"))return this.menuDicht_(),this.favorietOm_(e,this.shadowRoot.querySelector(`[data-hart="${this.treffers_.indexOf(e)}"]`));if(i.target.closest("[data-toe]"))return this.kiesLijstVoor_(e);if(i.target.closest("[data-lijstweg]"))return this.menuDicht_(),this.lijstWeg_(e)}}menuPlaats_(e){let t=this.menuPlek_,n=e.offsetWidth||210,i=e.offsetHeight||160,r=Math.min(Math.max(8,(t?.left??40)+12),window.innerWidth-n-8),o=(t?.bottom??80)+6,s=o+i<=window.innerHeight-8?o:Math.max(8,(t?.top??80)-i-6);e.style.left=`${r}px`,e.style.top=`${Math.min(s,Math.max(8,window.innerHeight-i-8))}px`}menuDicht_(){let e=this.$(".menu");e&&(e.hidden=!0)}async haalSpeakers_(){if(this.speakerKeuze_){this.speakers_={label_exists:!0,entities:this.speakerKeuze_.map(e=>{let t=k(this.hass,e);return t?{entity_id:e,name:t.attributes?.friendly_name??e,can_group:ie(t,ae.GROUPING)}:null}).filter(Boolean),filtered_out:0},this.tekenSpeakers_();return}try{this.speakers_=await this.hass.callWS({type:"domotiapp_lovelace/media/speakers"}),this.speakerHerkansing_.herstel()}catch(e){this.speakers_=null,re(e)&&this.speakerHerkansing_.plan()}this.tekenSpeakers_()}groepNu_(){let t=this.hass?.states?.[this.entity_]?.attributes?.group_members;return new Set(Array.isArray(t)?t:[])}tekenSpeakers_(){let e=this.$("footer");if(!e)return;let t=this.speakers_;if(!t||!t.label_exists||!t.entities?.length){e.hidden=!t||t.label_exists===void 0,e.hidden||(this.$(".sprekers").innerHTML=`<span class="ond" style="color:var(--dac-ink-2);font-size:12.5px">Plak het label <b>${this.veilig_(t?.label_name??"Music Assistant Media")}</b> op je speakers om ze hier samen te laten spelen.</span>`);return}e.hidden=!1;let n=this.groepNu_(),i=t.entities.filter(o=>o.entity_id===this.entity_||n.has(o.entity_id));this.$(".waar").textContent=i.length?i.map(o=>o.name).join(", "):this.naam_??"";let r=t.entities.map(o=>`${o.entity_id}:${o.entity_id===this.entity_||n.has(o.entity_id)}`).join("|");if(this.sprekerSig_!==r){this.sprekerSig_=r,this.schuiven_?.forEach(o=>o()),this.schuiven_=new Map,this.$(".sprekers").innerHTML=t.entities.map(o=>{let s=o.entity_id===this.entity_,l=s||n.has(o.entity_id),d=ie(k(this.hass,o.entity_id),ae.VOLUME_SET);return`
            <div class="spreker" data-speaker="${o.entity_id}" data-zelf="${s}" data-mee="${l}">
              <button class="mee" type="button" data-speaker="${o.entity_id}"
                      aria-pressed="${l}" ${!s&&!o.can_group?"disabled":""}
                      title="${s?"Deze speler":o.can_group?"Laat deze speaker meespelen":"Deze speaker laat zich niet koppelen"}">
                ${v(l?"volume":"speaker")}<span>${this.veilig_(o.name)}</span>
              </button>
              ${l&&d?`${ze()}<span class="pct tnum"></span>`:l?'<span class="stil">geen volumeregeling</span>':""}
            </div>`}).join("");for(let o of this.shadowRoot.querySelectorAll(".spreker")){let s=o.querySelector(".slider");if(!s)continue;let l=o.dataset.speaker;s.setAttribute("aria-label",`Volume ${o.querySelector("span")?.textContent??""}`);let d=qe(s,{value:()=>et(k(this.hass,l)),onInput:c=>this.zetSchuif_(s,c),onCommit:c=>this.hass.callService("media_player","volume_set",{volume_level:c/100},{entity_id:l})});this.schuiven_.set(l,d)}}for(let o of this.shadowRoot.querySelectorAll(".spreker")){let s=o.dataset.speaker,l=o.querySelector(".slider");if(!l||l.classList.contains("dragging"))continue;let d=k(this.hass,s),c=et(d);this.zetSchuif_(l,c,ln(d))}}zetSchuif_(e,t,n=!1){e.style.setProperty("--v",`${t}%`),e.setAttribute("aria-valuenow",String(t));let i=e.parentElement.querySelector(".pct");i&&(i.textContent=n?"gedempt":`${t}%`)}wisselSpeaker_(e){if(e===this.entity_)return;if(this.groepNu_().has(e)){this.hass.callService("media_player","unjoin",{},{entity_id:e});return}this.hass.callService("media_player","join",{group_members:[e]},{entity_id:this.entity_});let n=k(this.hass,this.entity_);if(typeof n?.attributes?.volume_level!="number")return;let i=et(n),r=k(this.hass,e);ie(r,ae.VOLUME_SET)&&et(r)!==i&&this.hass.callService("media_player","volume_set",{volume_level:i/100},{entity_id:e})}disconnectedCallback(){clearTimeout(this.timer_),this.zoekHerkansing_.stop(),this.speakerHerkansing_.stop(),this.scrollLos_?.(),this.scrollLos_=null,this.schuiven_?.forEach(e=>e()),this.schuiven_=null,this.escape_&&document.removeEventListener("keydown",this.escape_,!0),this.trefferBinding_?.();for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}};H("domotiapp-media-browser",Ir);function Td(a,e,t,n={}){let i=document.querySelector("domotiapp-media-browser");return i||(i=document.createElement("domotiapp-media-browser"),document.body.appendChild(i)),i.tabIndex=-1,i.open(a,e,t,n),i.focus?.(),i}var Tg=`
  ${U}
  :host {
    ${W}
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
`,Vr=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[Q(Tg+Ue)],this.filter_="",this.opruimen_=[]}connectedCallback(){this.gebouwd_||this.bouw_()}disconnectedCallback(){for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}bouw_(){this.shadowRoot.innerHTML=`
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
      </div>`,this.gebouwd_=!0;let e=(t,n,i)=>{t.addEventListener(n,i),this.opruimen_.push(()=>t.removeEventListener(n,i))};e(this.$(".sluit"),"click",()=>this.sluit()),e(this.$(".laag"),"click",t=>{t.target===this.$(".laag")&&this.sluit()}),e(this.$("input"),"input",t=>{this.filter_=t.target.value.trim().toLowerCase(),this.teken_()}),e(this.$("input"),"keydown",t=>{t.key==="Enter"&&this.$(".bron")?.click()}),e(this,"keydown",t=>{t.key==="Escape"&&this.hasAttribute("open")&&this.sluit()}),e(this.$(".lijst"),"click",t=>{let n=t.target.closest(".bron");n&&this.kies_(n.dataset.bron)})}$(e){return this.shadowRoot.querySelector(e)}open(e,t,n){F(this),this.hass=e,this.entity_=t,this.naam_=n,this.filter_="",this.gebouwd_||this.bouw_(),this.$("input").value="",this.setAttribute("open",""),this.teken_(),setTimeout(()=>this.$("input")?.focus(),60)}sluit(){this.removeAttribute("open")}bronnen_(){let e=k(this.hass,this.entity_),t=e?.attributes?.source_list??[],n=e?.attributes?.source,i=this.filter_?t.filter(r=>String(r).toLowerCase().includes(this.filter_)):[...t];return i.sort((r,o)=>r===n?-1:o===n?1:0),{lijst:i,nu:n,totaal:t.length}}teken_(){let{lijst:e,nu:t,totaal:n}=this.bronnen_();this.$(".naam").textContent=this.naam_??"Bron kiezen",this.$(".sub").textContent=t?`Nu: ${t}`:"",this.$(".tel").textContent=this.filter_?`${e.length} van ${n}`:`${n} bronnen`;let i=this.$(".lijst");if(!e.length){i.innerHTML='<div class="leeg">Niets gevonden.</div>';return}i.innerHTML=e.map(r=>{let o=String(r).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),s=r===t;return`<button class="bron" type="button" role="option" data-bron="${o}"
                  aria-current="${s}" aria-selected="${s}">
                  <b>${o}</b>${s?'<span class="nu">NU</span>':""}
                </button>`}).join("")}kies_(e){!e||!this.hass||(this.hass.callService("media_player","select_source",{entity_id:this.entity_,source:e}),this.sluit())}};H("domotiapp-bron-kiezer",Vr);function Od(a,e,t){let n=document.querySelector("domotiapp-bron-kiezer");return n||(n=document.createElement("domotiapp-bron-kiezer"),document.body.appendChild(n)),n.tabIndex=-1,n.open(a,e,t),n.focus?.(),n}function Cd(a,e){let t=a?.states?.[e]?.attributes?.group_members;return new Set(Array.isArray(t)?t:[])}var Og=524288;function Cg(a,e){let t=a?.states?.[e];return!t||t.state==="unavailable"?!1:(Number(t.attributes?.supported_features)&Og)!==0}function Br(a,e,t){return e===t?"zelf":Cg(a,e)?Rg(a,e,t)?"mee":"los":"kan-niet"}function Rg(a,e,t){if(Cd(a,t).has(e))return!0;if(Cd(a,t).size===0){let n=a?.states?.[e]?.attributes?.group_members;if(Array.isArray(n)&&n.includes(t))return!0}return!1}function Rd(a,e,t){let n=Br(a,e,t);return n==="zelf"||n==="kan-niet"?null:n==="mee"?{domein:"media_player",service:"unjoin",data:{},doel:{entity_id:e}}:{domein:"media_player",service:"join",data:{group_members:[e]},doel:{entity_id:t}}}var Hg=`
  ${U}
  :host {
    ${W}
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
`,Pr=null,_a=a=>String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),Kr=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),Pr=Pr??[Q(Hg)],this.shadowRoot.adoptedStyleSheets=Pr,this.opruimen_=[],this.filter_="",this.lijst_=[]}connectedCallback(){this.gebouwd_||this.bouw_()}disconnectedCallback(){for(let e of this.opruimen_)e();this.opruimen_=[],this.gebouwd_=!1}bouw_(){this.shadowRoot.innerHTML=`
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
      </div>`,this.gebouwd_=!0;let e=(t,n,i)=>{t.addEventListener(n,i),this.opruimen_.push(()=>t.removeEventListener(n,i))};e(this.$(".sluit"),"click",()=>this.sluit()),e(this.$(".laag"),"click",t=>{t.target===this.$(".laag")&&this.sluit()}),e(this.$("input"),"input",t=>{this.filter_=t.target.value.trim().toLowerCase(),this.teken_()}),e(this.$("input"),"keydown",t=>{t.key==="Enter"&&this.$(".sp")?.click()}),e(this,"keydown",t=>{t.key==="Escape"&&this.hasAttribute("open")&&this.sluit()}),e(this.$(".lijst"),"click",t=>{let n=t.target.closest(".mee");if(n)return t.stopPropagation(),this.koppel_(n.dataset.id);let i=t.target.closest(".sp");i&&this.kies_(i.dataset.id)})}$(e){return this.shadowRoot.querySelector(e)}set hass(e){this.hass_=e,this.hasAttribute("open")&&this.gebouwd_&&this.teken_()}get hass(){return this.hass_}open(e,t,n,i){F(this),this.hass_=e,this.lijst_=Array.isArray(t)?t:[],this.huidig_=n,this.opKeuze_=i,this.filter_="",this.gebouwd_||this.bouw_(),this.$("input").value="",this.$(".zoek").hidden=this.lijst_.length<8,this.setAttribute("open",""),this.teken_(),this.$(".zoek").hidden||setTimeout(()=>this.$("input")?.focus(),60)}sluit(){this.removeAttribute("open")}teken_(){let e=this.lijst_,t=this.filter_?e.filter(i=>String(M(this.hass,i)).toLowerCase().includes(this.filter_)):[...e];this.$(".sub").textContent=this.huidig_?`Nu: ${M(this.hass,this.huidig_)}`:"",this.$(".tel").textContent=this.filter_?`${t.length} van ${e.length}`:`${e.length} speaker${e.length===1?"":"s"}`;let n=this.$(".lijst");if(!t.length){n.innerHTML='<div class="leeg">Niets gevonden.</div>';return}n.innerHTML=t.map(i=>{let r=k(this.hass,i),o=i===this.huidig_,s=Rt(r)?"Uit":ka(r,c=>te(this.hass,c)),l=Br(this.hass,i,this.huidig_),d=l==="mee";return`<div class="rij">
                  <button class="sp" type="button" role="option" data-id="${_a(i)}"
                    data-speelt="${sn(r)}" data-uit="${Rt(r)}"
                    aria-current="${o}" aria-selected="${o}">
                    <span class="ico">${v(dn(r),"speaker")}</span>
                    <span class="tekst">
                      <b>${_a(M(this.hass,i))}</b>
                      <span>${_a(d?`${s} \xB7 speelt mee`:s)}</span>
                    </span>
                    ${o?'<span class="nu">NU</span>':""}
                  </button>
                  <button class="mee" type="button" data-id="${_a(i)}"
                    aria-pressed="${d}" ${l==="zelf"||l==="kan-niet"?"disabled":""}
                    ${l==="zelf"?"hidden":""}
                    aria-label="${d?"Laat deze speaker niet meer meespelen":"Laat deze speaker meespelen"}"
                    title="${l==="kan-niet"?"Deze speaker laat zich niet koppelen":d?"Speelt mee \u2014 tik om los te koppelen":"Laat meespelen met wat er nu speelt"}">
                    ${v(d?"volume":"speakers")}<span>${d?"MEE":"ERBIJ"}</span>
                  </button>
                </div>`}).join("")}koppel_(e){let t=Rd(this.hass,e,this.huidig_);t&&this.hass.callService(t.domein,t.service,t.data,t.doel)}kies_(e){e&&(this.opKeuze_?.(e),this.sluit())}};H("domotiapp-speler-kiezer",Kr);function Hd(a,e,t,n){let i=document.querySelector("domotiapp-speler-kiezer");return i||(i=document.createElement("domotiapp-speler-kiezer"),document.body.appendChild(i)),i.tabIndex=-1,i.open(a,e,t,n),i.focus?.(),i}var Gr=[15,30,45,60,90],Wr=30;function Id(a){let e=Math.max(0,Math.round(a)),t=Math.floor(e/3600),n=Math.floor(e%3600/60),i=e%60,r=t?String(n).padStart(2,"0"):String(n);return`${t?`${t}:`:""}${r}:${String(i).padStart(2,"0")}`}function Ur(a,{min:e=1,max:t=720}={}){let n=String(a??"").trim();if(!/^\d+$/.test(n))return null;let i=Number(n);return i>=e&&i<=t?i:null}var Ig=`
  ${U}
  :host {
    ${W}
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
    border-radius: var(--dac-radius); box-shadow: 0 24px 60px -20px rgba(0,0,0,calc(.7 * var(--dac-diepte)));
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
`,Fr=class extends HTMLElement{static get sheet_(){return Object.hasOwn(this,"s_")||(this.s_=Q(Ig)),this.s_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[this.constructor.sheet_]}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.shadowRoot.innerHTML=`
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
      </div>`,this.$(".snel").innerHTML=Gr.map(e=>`<button type="button" data-m="${e}" aria-pressed="false">${e}</button>`).join(""),this.$(".sluit").addEventListener("click",()=>this.dicht_()),this.$(".laag").addEventListener("click",e=>{e.target===this.$(".laag")&&this.dicht_()}),this.addEventListener("keydown",e=>{e.key==="Escape"&&this.dicht_(),e.key==="Enter"&&!this.hasAttribute("loopt")&&this.start_()}),this.$(".snel").addEventListener("click",e=>{let t=e.target.closest("[data-m]");t&&(this.$(".min").value=t.dataset.m,this.markeer_())}),this.$(".min").addEventListener("input",()=>this.markeer_()),this.$(".doe").addEventListener("click",()=>this.start_()),this.$(".weg").addEventListener("click",()=>this.stop_()),this.gebouwd_=!0}markeer_(){let e=this.$(".min").value.trim();for(let t of this.$(".snel").querySelectorAll("[data-m]"))t.setAttribute("aria-pressed",String(t.dataset.m===e));this.$(".fout").hidden=!0}async open(e,t,n){F(this),this.gebouwd_||this.bouw_(),this.hass=e,this.entity_=t,this.$(".waar").textContent=n??t,this.$(".min").value=String(Gr[1]),this.$(".fade").value=String(Wr),this.markeer_(),this.setAttribute("open",""),this.tabIndex=-1,this.focus?.(),await this.haalStand_(),this.hasAttribute("loopt")||setTimeout(()=>this.$(".min")?.focus(),60)}dicht_(){this.removeAttribute("open"),clearInterval(this.tik_),this.tik_=null}async haalStand_(){let e=null;try{e=((await this.hass.callWS({type:"domotiapp_lovelace/media/sleeptimer/list"}))?.timers??[]).find(n=>n.entity_id===this.entity_)??null}catch{e=null}this.toon_(e)}toon_(e){if(clearInterval(this.tik_),this.tik_=null,this.$(".weg").hidden=!e,!e){this.removeAttribute("loopt"),this.$(".doe").textContent="Starten",this.$(".doe").hidden=!1;return}this.setAttribute("loopt",""),this.$(".doe").textContent="Opnieuw instellen",this.$(".doe").hidden=!1,this.$(".uitleg").textContent=e.fade?`De laatste ${e.fade} seconden zakt het volume weg, daarna pauzeert de muziek en gaat het volume terug.`:"Aan het eind pauzeert de muziek.";let t=Date.parse(e.ends_at),n=()=>{let i=(t-Date.now())/1e3;this.$(".rest").textContent=Id(i),i<=0&&(clearInterval(this.tik_),this.tik_=null,setTimeout(()=>this.hasAttribute("open")&&this.haalStand_(),1500))};n(),this.tik_=setInterval(n,1e3)}async start_(){if(this.hasAttribute("loopt")){this.removeAttribute("loopt"),this.$(".doe").textContent="Starten",clearInterval(this.tik_),this.tik_=null,setTimeout(()=>this.$(".min")?.focus(),40);return}let e=Ur(this.$(".min").value);if(e===null){this.melding_("Vul een heel aantal minuten in, tussen 1 en 720.");return}let t=Ur(this.$(".fade").value,{min:0,max:600})??Wr;try{let n=await this.hass.callWS({type:"domotiapp_lovelace/media/sleeptimer/set",entity_id:this.entity_,minutes:e,fade:t});this.toon_(n)}catch(n){this.melding_(n?.message??"De sleeptimer kon niet gezet worden. Is DomotiApp Lovelace klaar met opstarten?")}}async stop_(){try{await this.hass.callWS({type:"domotiapp_lovelace/media/sleeptimer/cancel",entity_id:this.entity_})}catch{}await this.haalStand_()}melding_(e){let t=this.$(".fout");t.textContent=e,t.hidden=!1}};H("domotiapp-sleeptimer",Fr);function Vd(a,e,t){let n=document.querySelector("domotiapp-sleeptimer");return n||(n=document.createElement("domotiapp-sleeptimer"),document.body.appendChild(n)),n.open(a,e,t??M(a,e)),n}var ya={power:{icon:"power",label:"Aan of uit"},prev:{icon:"prev",label:"Vorige"},play:{icon:"play",label:"Afspelen of pauzeren"},stop:{icon:"stop",label:"Stoppen"},next:{icon:"next",label:"Volgende"},shuffle:{icon:"shuffle",label:"Willekeurig afspelen"},repeat:{icon:"repeat",label:"Herhalen"},search:{icon:"search",label:"Zoeken in Music Assistant"},sleep:{icon:"sleep",label:"Sleeptimer"}},ja=class extends S{setConfig(e){this.ruw_=e,super.setConfig(this.metSpeler_(e))}metSpeler_(e){if(!e?.speaker_select)return e;let t=Lr(e,this.hass),n=xd(e,t,this.opslag_());return n&&n!==e.entity?{...e,entity:n}:e}set hass(e){let t=!this.hass_;if(super.hass=e,!t||!this.ruw_?.speaker_select)return;let n=this.metSpeler_(this.ruw_);n.entity&&n.entity!==this.config?.entity&&super.setConfig(n)}get hass(){return super.hass}opslag_(){try{return window.localStorage}catch{return null}}spelers_(){return Lr(this.ruw_??this.config,this.hass)}groepsSpelers_(){let e=this.config.speakers;return Array.isArray(e)&&e.length||!this.config.speaker_select?e:this.spelers_()}kiesSpeler_(e){!e||e===this.config.entity||(wd(this.opslag_(),this.spelers_(),e),super.setConfig({...this.ruw_,entity:e}))}validate(e){return e.entity?{layout:"row",show_artwork:!0,show_volume:!0,show_source:!0,show_controls:!0,show_search:!0,...e}:{...e,[C]:e.speaker_select?"Zet er een mediaspeler in, of wacht tot Home Assistant er een meldt.":"Kies een mediaspeler."}}watched(){return[this.config.entity,this.config.volume_entity].filter(Boolean)}tone_(){return this.config.tone?ee(this.config.tone):E.accent}groot_(){return this.config.layout==="groot"}template(){return this.config.bare&&this.setAttribute("bare",""),this.setAttribute("layout",this.groot_()?"groot":"row"),`
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
      </div>`}wire(){let e=this.config,t=(s,l)=>de(this,this.hass,e,e[s]??l);this.teardown_.push(V(this.$(".card"))),this.teardown_.push(B(this.$(".top"),{onTap:()=>t("tap_action",{action:"more-info"}),onHold:()=>t("hold_action",{action:"more-info"})}));let n=this.$(".chip");this.teardown_.push(B(n,{onTap:()=>t("icon_tap_action",pt(e.entity)),onHold:()=>t("icon_hold_action",{action:"more-info"})})),this.on(n,"click",s=>s.stopPropagation()),this.on(n,"pointerdown",s=>s.stopPropagation());let i=this.$(".hoesgroot");i&&(this.teardown_.push(B(i,{onTap:()=>t("icon_tap_action",pt(e.entity)),onHold:()=>t("icon_hold_action",{action:"more-info"})})),this.on(i,"click",s=>s.stopPropagation()),this.on(i,"pointerdown",s=>s.stopPropagation()));let r=s=>{let l=s.target.closest?.("[data-k]");l&&(s.stopPropagation(),this.doe_(l.dataset.k))},o=this.$(".spelers");o&&(this.on(o,"click",r),this.on(o,"pointerdown",s=>s.stopPropagation())),this.on(this.$(".ctl"),"click",r),this.on(this.$(".vol"),"click",r),this.on(this.$(".extra"),"click",r),this.on(this.$(".ctl"),"pointerdown",s=>s.stopPropagation()),this.on(this.$(".vol"),"pointerdown",s=>s.stopPropagation()),this.on(this.$(".extra"),"pointerdown",s=>s.stopPropagation()),this.sliders_=new Map}doe_(e){let t=this.config.entity,n=k(this.hass,t),i=(r,o={})=>this.hass.callService("media_player",r,{entity_id:t,...o});switch(e){case"power":return i(Rt(n)?"turn_on":"turn_off");case"bron":return Od(this.hass,t,M(this.hass,t,this.config.name));case"prev":return i("media_previous_track");case"next":return i("media_next_track");case"play":return i(sn(n)?"media_pause":"media_play");case"stop":return i("media_stop");case"mute":{let r=Je(this.config);return this.hass.callService("media_player","volume_mute",{is_volume_muted:!ln(k(this.hass,r))},{entity_id:r})}case"vol-":case"vol+":return this.hass.callService("media_player",e==="vol+"?"volume_up":"volume_down",{},{entity_id:Je(this.config)});case"shuffle":return this.hass.callService("media_player","shuffle_set",{shuffle:!Sr(n)},{entity_id:t});case"repeat":return this.hass.callService("media_player","repeat_set",{repeat:bd(Mr(n))},{entity_id:t});case"speler":{let r=this.spelers_();return Hd(this.hass,r,t,o=>this.kiesSpeler_(o))}case"sleep":return Vd(this.hass,t,M(this.hass,t,this.config.name));case"search":return Td(this.hass,t,M(this.hass,t,this.config.name),{radioModus:this.config.radio_mode===!0,speakers:this.groepsSpelers_()});default:return}}paint(){let e=this.config,t=k(this.hass,e.entity),n=!t||t.state==="unavailable",i=md(t),r=this.$(".top");r.dataset.on=String(i),r.classList.toggle("unavailable",n),this.$(".card").style.setProperty("--tone",this.tone_());let o=this.$(".chip"),s=e.show_artwork===!1?null:ct(this.hass,e.entity,e.icon),l=s?`pic:${s}`:e.icon||dn(t);o.dataset.icon!==l&&(o.dataset.icon=l,o.classList.toggle("pic",!!s),o.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:v(l,"speaker")),o.style.setProperty("--tone",i&&!s?this.tone_():"var(--dac-ink-3)");let d=this.$(".hoesgroot");d&&d.dataset.icon!==l&&(d.dataset.icon=l,d.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:v(e.icon||dn(t),"speaker"));let c=M(this.hass,e.entity,e.name),p=ka(t,u=>te(this.hass,u)),h=this.$(".spelers");if(h){let u=M(this.hass,e.entity);this.text(".spelers .waar",u),h.setAttribute("aria-label",`Speaker kiezen. Nu: ${u}`)}this.text(".nm",c),this.text(".st",p),o.setAttribute("aria-label",`${c} afspelen of pauzeren`),this.$(".hoesgroot")?.setAttribute("aria-label",`${c} afspelen of pauzeren`),r.setAttribute("aria-label",`${c}, ${p}`),this.paintKnoppen_(t,n),this.paintVolume_(t,n),this.paintExtra_(t,n),R(this.$(".card"))}paintKnoppen_(e,t){let n=this.$(".ctl"),i=this.config.show_controls===!1||t?[]:gd(e),r=i.join(",");n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=i.map(s=>`<button class="k ${s==="play"||s==="stop"?"hoofd":""}" type="button" data-k="${s}" aria-label="${ya[s].label}">${v(ya[s].icon)}</button>`).join(""));let o=n.querySelector('[data-k="play"]');if(o){let s=sn(e)?"pause":"play";o.dataset.icon!==s&&(o.dataset.icon=s,o.innerHTML=v(s))}}paintVolume_(e,t){let n=this.$(".vol"),i=Je(this.config),r=i===this.config.entity?e:k(this.hass,i),o=this.config.show_volume===!1||t?[]:Er(r),s=t?null:Dr(e,{tonen:this.config.show_source!==!1});if(n.hidden=!o.length&&!s,n.hidden){n.dataset.sig="",this.sliders_?.delete("volume");return}let l=fd(r)&&(o.includes("slider")||o.includes("steps")),d=[...o,s?"bron":"",l?"pct":""].join(",");n.dataset.sig!==d&&(n.dataset.sig=d,n.innerHTML=(o.includes("mute")?`<button class="k" type="button" data-k="mute" aria-label="Dempen">${v("volume")}</button>`:"")+(o.includes("slider")?ze("volume"):"")+(o.includes("steps")?`<button class="k" type="button" data-k="vol-" aria-label="Zachter">${v("minus")}</button><button class="k" type="button" data-k="vol+" aria-label="Harder">${v("plus")}</button>`:"")+(l?'<span class="pct tnum"></span>':"")+(s?`<button class="bronknop" type="button" data-k="bron">${v("tv")}<b></b></button>`:""),this.sliders_?.delete("volume"),n.querySelector(".slider")?.setAttribute("aria-label","Volume"));let c=n.querySelector(".bronknop");if(c){let b=s.nu||"Bron";this.text(c.querySelector("b"),b),c.setAttribute("aria-label",`Bron kiezen, nu ${b}`),c.title=`Kies uit ${s.aantal} bronnen`}let p=ln(r),h=et(r),u=n.querySelector('[data-k="mute"]');if(u){let b=p?"volumeMute":"volume";u.dataset.icon!==b&&(u.dataset.icon=b,u.innerHTML=v(b)),u.setAttribute("aria-pressed",String(p))}let m=n.querySelector(".slider");m&&(this.attach_(m,"volume",{value:()=>et(k(this.hass,Je(this.config))),onInput:b=>this.setSlider_(m,b),onCommit:b=>this.hass.callService("media_player","volume_set",{volume_level:b/100},{entity_id:Je(this.config)}),disabled:()=>pe(k(this.hass,Je(this.config)))}),m.classList.contains("dragging")||this.setSlider_(m,h)),l&&this.text(".pct",p?"Gedempt":`${h}%`)}paintExtra_(e,t){let n=this.$(".extra"),i=t||this.config.show_controls===!1?[]:Nr(e,{zoeken:this.config.show_search!==!1,sleep:this.config.sleep_timer===!0});n.hidden=!i.length;let r=i.join(",");if(n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=i.map((c,p)=>`${c==="search"&&p>0?'<span class="rek"></span>':""}<button class="k" type="button" data-k="${c}" aria-label="${ya[c].label}">${v(ya[c].icon)}</button>`).join("")),!i.length)return;let o=n.querySelector('[data-k="shuffle"]');o&&o.setAttribute("aria-pressed",String(Sr(e)));let s=n.querySelector('[data-k="repeat"]');if(s){let c=Mr(e),p=c==="one"?"repeatOne":"repeat";s.dataset.icon!==p&&(s.dataset.icon=p,s.innerHTML=v(p)),s.setAttribute("aria-pressed",String(c!=="off")),s.setAttribute("aria-label",{off:"Herhalen: uit",all:"Herhalen: alles",one:"Herhalen: dit nummer"}[c])}let l=document.querySelector("domotiapp-media-browser");l?.hasAttribute("open")&&(l.hass=this.hass);let d=document.querySelector("domotiapp-speler-kiezer");d?.hasAttribute("open")&&(d.hass=this.hass)}attach_(e,t,n){if(!e||this.sliders_.has(t))return;let i=qe(e,n);this.sliders_.set(t,i),this.teardown_.push(i)}setSlider_(e,t){e&&(e.style.setProperty("--v",`${t}%`),e.setAttribute("aria-valuenow",String(t)),this.text(".pct",`${t}%`))}getCardSize(){if(this.config?.layout==="groot")return 8;let e=k(this.hass,this.config?.entity);return vd(this.config,e,k(this.hass,Je(this.config)))}getGridOptions(){let e=this.config?.layout==="groot",t=this.minRijen_(".card",e?6:this.getCardSize());return e?{columns:12,rows:"auto",min_columns:6,min_rows:t}:{columns:12,rows:"auto",min_columns:4,min_rows:t}}static getConfigElement(){return document.createElement("domotiapp-media-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("media_player."));return n?{entity:n}:{}}};j(ja,"css",`
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
      color: var(--dac-ink-3); background: rgba(var(--dac-tint), .05); border-color: var(--dac-border);
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
    ${Ze}
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
  `);var qr=class extends L{defaults(){return{layout:"row",show_artwork:!0,show_volume:!0,show_source:!0,show_controls:!0,show_search:!0,icon_tap_action:{action:"toggle"},tap_action:{action:"more-info"}}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"speaker"}]}schema(){return[{name:"entity",selector:f.entity("media_player")},{name:"name",selector:f.text()},{name:"speaker_select",selector:f.bool()},{name:"players",selector:{entity:{domain:"media_player",multiple:!0}}},{name:"layout",selector:f.select([{value:"row",label:"Rij (\xE9\xE9n rasterrij hoog)"},{value:"groot",label:"Groot (telefoonformaat, grote knoppen)"}])},{name:"volume_entity",selector:f.entity("media_player")},{name:"show_artwork",selector:f.bool()},{name:"show_controls",selector:f.bool()},{name:"show_volume",selector:f.bool()},{name:"show_source",selector:f.bool()},{name:"radio_mode",selector:f.bool()},{name:"speakers",selector:{entity:{domain:"media_player",integration:"music_assistant",multiple:!0}}},{name:"show_search",selector:f.bool()},{name:"sleep_timer",selector:f.bool()},{name:"icon_tap_action",selector:f.action("toggle")},{name:"icon_hold_action",selector:f.action("more-info")},{name:"tap_action",selector:f.action("more-info")},{name:"hold_action",selector:f.action("more-info")}]}label(e){return{entity:"Mediaspeler",name:"Naam (overschrijft die van de speler)",speaker_select:"Algemene mediaspeler",players:"Welke speakers je mag kiezen",layout:"Vorm",volume_entity:"Geluid van (optioneel)",show_artwork:"Albumhoes tonen",show_controls:"Knoppen tonen",show_volume:"Volume tonen",show_source:"Bronknop tonen",radio_mode:"Doorspelen na een nummer",speakers:"Speakers om mee te groeperen",show_search:"Zoeken en groeperen tonen",sleep_timer:"Sleeptimer tonen",icon_tap_action:"Tikken op het icoon",icon_hold_action:"Vasthouden op het icoon",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Welke knoppen er verschijnen leest de kaart uit de speler zelf: wat hij niet kan, komt er niet op.";if(e.name==="speaker_select")return"De kaart krijgt er een balk bij waarmee je kiest waar de muziek heen gaat. De speler hierboven is de standaard; de keuze wordt per apparaat onthouden, dus je telefoon en de tablet in de gang kunnen op iets anders staan.";if(e.name==="players")return"Laat je dit leeg, dan staan de speakers van Music Assistant in de lijst -- geen televisies of streamers, want daar stuur je geen muziek naartoe. Vul je er zelf een paar in, dan is dat de lijst, wat er ook in staat.";if(e.name==="layout")return"Groot is bedoeld voor een pop-up of een kolom waar de kaart alle ruimte krijgt: grote hoes, grote knoppen.";if(e.name==="volume_entity")return"Zit het geluid ergens anders dan het beeld \u2014 een tv met een soundbar eronder \u2014 kies dan hier de speler die het volume regelt. Leeg laten betekent: de speler zelf.";if(e.name==="show_artwork")return"Speelt er iets met een hoes, dan vult die de chip. Een eigen icoon gaat voor.";if(e.name==="show_volume")return"De volumeregel verschijnt zodra er iets speelt en verdwijnt als de speler uit gaat.";if(e.name==="sleep_timer")return"Zet er een knop bij waarmee je instelt hoe lang de muziek nog mag doorspelen. De laatste seconden zakt het volume weg, daarna pauzeert de speler en gaat het volume terug naar waar het stond. De timer loopt in Home Assistant zelf, dus hij telt gewoon door als je je telefoon weglegt.";if(e.name==="speakers")return'De speakers die onderin het zoekscherm staan om samen te laten spelen. Laat je dit leeg op een algemene mediaspeler, dan zijn dat dezelfde speakers als in de keuzelijst; op een gewone kaart valt hij terug op het label "Music Assistant Media" in Home Assistant.';if(e.name==="radio_mode")return"Zoals Spotify: is het gekozen nummer klaar, dan zoekt Music Assistant er zelf muziek bij in plaats van te stoppen. Staat dit uit, dan kan het nog steeds per keer via het menu bij een treffer.";if(e.name==="show_source")return"Voor een tv-ontvanger of een versterker met ingangen: een knop met de zender die nu aanstaat, die een zoekbaar overzicht opent. Kan de speler geen bron kiezen, dan verschijnt hij niet.";if(e.name==="show_search")return"De zoekknop opent Music Assistant over het hele scherm. Alleen bij een speler van Music Assistant; groeperen komt erbij als de speler dat aankan."}};O("domotiapp-media-card-editor",qr);D("domotiapp-media-card",ja,{name:"DomotiApp Mediaspeler",description:"Wat er speelt, de knoppen die de speler aankan, en het volume."});var cn=[{sleutel:"smoke",label:"Rook",icoon:"smoke",alarm:"Rook gedetecteerd",rust:"Geen"},{sleutel:"co",label:"Koolmonoxide",icoon:"co",alarm:"Koolmonoxide gedetecteerd",rust:"Geen"},{sleutel:"heat",label:"Warmte",icoon:"thermo",alarm:"Te warm",rust:"Normaal"},{sleutel:"temperature",label:"Temperatuur",icoon:"thermo",meting:!0},{sleutel:"battery",label:"Batterij",icoon:"battery",meting:!0}],Bd=a=>a?.rust??"Rustig",Zr=20;function Yr(a){if(!a||a.state==="unavailable"||a.state==="unknown")return null;if(String(a.entity_id??"").startsWith("binary_sensor."))return a.state==="on"?0:null;let e=Number(a.state);return Number.isFinite(e)?e:null}var Vg=a=>!!a&&a.state==="on",Bg=a=>!a||a.state==="unavailable"||a.state==="unknown";function Pd(a,e){let t=a.filter(i=>!i.meting);for(let i of t)if(Vg(e(i.sleutel)))return{soort:"alarm",tekst:i.alarm,tone:"bad",icoon:i.icoon};if(a.length&&a.every(i=>Bg(e(i.sleutel))))return{soort:"weg",tekst:"Niet bereikbaar",tone:"neutral",icoon:"smokeDetector"};let n=Yr(e("battery"));return n!=null&&n<=Zr?{soort:"batterij",tekst:`Batterij bijna leeg (${Math.round(n)}%)`,tone:"warn",icoon:"battery"}:t.length?{soort:"goed",tekst:"Alles rustig",tone:"good",icoon:"smokeDetector"}:{soort:"meting",tekst:"",tone:"accent",icoon:"smokeDetector"}}var Pg={good:E.good,warn:E.warn,bad:E.bad,neutral:E.neutral,accent:E.accent},za=class extends S{validate(e){return cn.filter(n=>e[n.sleutel]).length?{...e}:{...e,[C]:"Kies minstens \xE9\xE9n entiteit: rook, koolmonoxide, warmte, temperatuur of batterij."}}watched(){return cn.map(e=>this.config[e.sleutel]).filter(Boolean)}gekozen_(){return cn.filter(e=>this.config[e.sleutel])}toestand_(){let e=Pd(this.gekozen_(),t=>k(this.hass,this.config[t]));return{...e,tone:Pg[e.tone]??E.accent}}batterijPct_(){return Yr(k(this.hass,this.config.battery))}template(){this.config.bare&&this.setAttribute("bare","");let e=this.gekozen_().map(t=>`<span class="pil" data-soort="${t.sleutel}" title="${t.label}">${v(t.icoon)}<b></b></span>`).join("");return`
      <div class="card surface">
        <div class="top" role="button" tabindex="0" style="--tone:${E.good}">
          <span class="chip"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
        </div>
        <div class="meta">${e}</div>
      </div>`}wire(){let e=this.config,t=this.gekozen_()[0];this.teardown_.push(B(this.$(".top"),{onTap:()=>e.tap_action?de(this,this.hass,e,e.tap_action):K(this,e.smoke??e[t.sleutel]),onHold:()=>de(this,this.hass,e,e.hold_action??{action:"more-info"})})),this.$$(".pil").forEach(i=>{let r=e[i.dataset.soort];r&&(this.on(i,"click",o=>{o.stopPropagation(),K(this,r)}),this.on(i,"pointerdown",o=>o.stopPropagation()),i.style.cursor="pointer")});let n=this.$(".card");if(n&&typeof ResizeObserver=="function"){let i=new ResizeObserver(()=>this.pasAan_());i.observe(n),this.teardown_.push(()=>i.disconnect())}this.teardown_.push(V(this.$(".card")))}paint(){let e=this.config,t=this.toestand_(),n=this.$(".top");this.toggleAttribute("alarm",t.soort==="alarm"),n.style.setProperty("--tone",t.tone),n.classList.toggle("unavailable",t.soort==="weg");let i=this.$(".chip"),r=e.icon||t.icoon;i.dataset.icon!==r&&(i.dataset.icon=r,i.innerHTML=v(r,"smoke")),i.style.setProperty("--tone",t.tone);let o=this.gekozen_()[0];this.text(".nm",e.name||M(this.hass,e.smoke??e[o.sleutel],null)),this.text(".st",t.tekst),n.setAttribute("aria-label",`${this.$(".nm").textContent}${t.tekst?`, ${t.tekst}`:""}`),this.$$(".pil").forEach(s=>this.paintPil_(s)),this.$(".meta").hidden=this.gekozen_().length<=1&&!this.config.always_meta,this.pasAan_(),R(this.$(".card"))}pasAan_(){let e=this.$(".meta");if(!e||e.hidden)return;let t=()=>{let i=e.querySelector(".pil")?.offsetHeight??0;return i&&Math.round((e.scrollHeight+i/2)/i-.5)||1};this.removeAttribute("krapper"),!(t()<=1)&&this.setAttribute("krapper","")}paintPil_(e){let t=cn.find(s=>s.sleutel===e.dataset.soort),n=k(this.hass,this.config[t.sleutel]),i=e.querySelector("b"),r=s=>e.setAttribute("aria-label",`${t.label}: ${s}`);if(!n||pe(n)){i.textContent="\u2014",r("onbekend"),e.dataset.let="";return}if(t.meting){let s=n.attributes.unit_of_measurement??"",l=Number(n.state);i.textContent=Number.isFinite(l)?`${G(this.hass,l,t.sleutel==="temperature"?1:0)} ${s}`.trim():te(this.hass,n);let d=t.sleutel==="battery"?this.batterijPct_():null;e.dataset.let=d!=null&&d<=Zr?"warn":"",r(i.textContent);return}let o=Z(n);i.textContent=o?"Alarm":Bd(t),r(i.textContent),e.dataset.let=o?"bad":""}regels_(){return this.gekozen_().length>1?2:1}getCardSize(){return this.regels_()}getGridOptions(){return{columns:12,rows:"auto",min_columns:4,min_rows:this.minRijen_(".card",this.regels_())}}static getConfigElement(){return document.createElement("domotiapp-smoke-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("binary_sensor.")&&/rook|smoke/i.test(i));return n?{smoke:n}:{}}};j(za,"css",`
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
  `);var Xr=class extends L{pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"smoke"}]}schema(){return[{name:"name",selector:f.text()},{name:"smoke",selector:f.entity()},{name:"co",selector:f.entity()},{name:"heat",selector:f.entity()},{name:"temperature",selector:f.entity()},{name:"battery",selector:f.entity()},{name:"tap_action",selector:f.action("more-info")},{name:"hold_action",selector:f.action("more-info")}]}label(e){return{name:"Naam (overschrijft die van de melder)",smoke:"Rook",co:"Koolmonoxide",heat:"Warmte",temperature:"Temperatuur",battery:"Batterij",tap_action:"Tikken op de kaart",hold_action:"Vasthouden op de kaart"}[e.name]??super.label(e)}helper(e){if(e.name==="smoke")return"Alle vijf zijn optioneel: vul in wat je melder heeft. Wat je leeg laat, komt niet op de kaart.";if(e.name==="battery")return"Een percentage of een 'batterij bijna leeg'-sensor. Onder de 20% meldt de kaart het uit zichzelf."}};O("domotiapp-smoke-card-editor",Xr);D("domotiapp-smoke-card",za,{name:"DomotiApp Rookmelder",description:"Rook, koolmonoxide, warmte, temperatuur en batterij \u2014 alles optioneel."});var Kg=["zo","ma","di","wo","do","vr","za"],Kd=5,Gd=8,$a=class extends S{validate(e){if(!e.entity)return{...e,[C]:"Kies een weerentiteit."};let t=Math.min(Math.max(1,Number(e.days)||Kd),Gd);return{show_current:!0,forecast_type:"daily",...e,days:t}}watched(){return[this.config.entity]}template(){this.config.bare&&this.setAttribute("bare","");let e=this.config;return`
      <div class="card surface">
        <div class="nu" role="button" tabindex="0" ${e.show_current===!1?"hidden":""}>
          <span class="chip" style="--tone:${E.accent}"></span>
          <span class="txt"><span class="nm"></span><span class="st"></span></span>
          <span class="graden tnum"></span>
        </div>
        <div class="rij" style="--n:${e.days}"></div>
      </div>`}wire(){this.teardown_.push(V(this.$(".card"))),this.teardown_.push(B(this.$(".nu"),{onTap:()=>K(this,this.config.entity),onHold:()=>K(this,this.config.entity)})),this.abonneer_()}async abonneer_(){let e=this.config;this.opzeggen_?.(),this.opzeggen_=null;let t=this.hass?.connection;if(!t?.subscribeMessage){this.forecastFout_="Geen verbinding voor de voorspelling.",this.paintRij_();return}try{let n=await t.subscribeMessage(i=>{this.forecast_=i?.forecast??[],this.forecastFout_=null,this.paintRij_()},{type:"weather/subscribe_forecast",forecast_type:e.forecast_type==="hourly"?"hourly":"daily",entity_id:e.entity});if(!this.isConnected){n();return}this.opzeggen_=n,this.teardown_.push(()=>{try{n()}catch{}this.opzeggen_=null})}catch{this.forecastFout_=e.forecast_type==="hourly"?"Deze weerbron geeft geen uurvoorspelling.":"Deze weerbron geeft geen dagvoorspelling.",this.paintRij_()}}paint(){let e=this.config,t=k(this.hass,e.entity),n=pe(t);this.$(".nu").classList.toggle("unavailable",n);let r=this.$(".chip"),o=e.icon||Jt(t?.state);r.dataset.icon!==o&&(r.dataset.icon=o,r.innerHTML=v(o,"cloud")),this.text(".nm",M(this.hass,e.entity,e.name)),this.text(".st",n?"Niet bereikbaar":te(this.hass,t));let s=this.$(".graden"),l=t?.attributes?.temperature,d=t?.attributes?.temperature_unit??"\xB0C";s.innerHTML=l==null?"":`${G(this.hass,l,Number.isInteger(l)?0:1)}<small>${d}</small>`,this.paintRij_(),R(this.$(".card"))}paintRij_(){let e=this.$(".rij");if(!e)return;let t=this.config;if(this.forecastFout_&&!this.forecast_?.length){e.style.setProperty("--n",1),e.innerHTML=`<div class="leeg">${this.forecastFout_}</div>`;return}let n=(this.forecast_??[]).slice(0,t.days);if(!n.length){e.style.setProperty("--n",1),e.innerHTML='<div class="leeg">Nog geen voorspelling ontvangen\u2026</div>';return}e.style.setProperty("--n",n.length);let i=k(this.hass,t.entity)?.attributes?.temperature_unit??"";e.innerHTML=n.map((r,o)=>{let s=this.wanneer_(r.datetime,o),l=v(Jt(r.condition),"cloud"),d=r.temperature==null?"":`${G(this.hass,r.temperature,0)}\xB0`,c=r.templow==null?"":`${G(this.hass,r.templow,0)}\xB0`,p=r.precipitation_probability==null?"":`<span class="nat">${v("drop")}${Math.round(r.precipitation_probability)}%</span>`;return`
          <div class="dag" style="--tone:${E.accent}">
            <span class="wanneer">${s}</span>
            ${l}
            <span class="max tnum">${d}</span>
            ${c?`<span class="min tnum">${c}</span>`:""}
            ${p}
          </div>`}).join("")}wanneer_(e,t){let n=new Date(e);if(Number.isNaN(+n))return"";if(this.config.forecast_type==="hourly")return`${String(n.getHours()).padStart(2,"0")}:00`;let i=new Date,r=n.getDate()===i.getDate()&&n.getMonth()===i.getMonth()&&n.getFullYear()===i.getFullYear();return t===0&&r?"vandaag":Kg[n.getDay()]}regels_(){return this.config?.show_current===!1?1:2}getCardSize(){return this.regels_()+1}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-forecast-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("weather."));return n?{entity:n}:{}}};j($a,"css",`
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
  `);var Qr=class extends L{defaults(){return{show_current:!0,forecast_type:"daily",days:Kd}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"cloudSun"}]}schema(){return[{name:"entity",selector:f.entity("weather")},{name:"name",selector:f.text()},{name:"forecast_type",selector:f.select([{value:"daily",label:"Per dag"},{value:"hourly",label:"Per uur"}])},{name:"days",selector:f.number(1,Gd)},{name:"show_current",selector:f.bool()}]}label(e){return{entity:"Weerentiteit",name:"Naam (overschrijft die van de weerbron)",forecast_type:"Voorspelling",days:"Hoeveel punten",show_current:"Nu-regel tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="entity")return"Meer hoeft er niet ingevuld te worden: de kaart leest zelf uit wat je weerbron levert.";if(e.name==="forecast_type")return"Niet elke weerbron kan allebei. Kan hij het niet, dan zegt de kaart dat in plaats van leeg te blijven."}};O("domotiapp-forecast-card-editor",Qr);D("domotiapp-forecast-card",$a,{name:"DomotiApp Weersvoorspelling",description:"Vandaag groot, de dagen erna op een rij. E\xE9n entiteit invullen."});var Ht={OPEN:1,CLOSE:2,SET_POSITION:4,STOP:8},Wd={open_cover:Ht.OPEN,close_cover:Ht.CLOSE,stop_cover:Ht.STOP},Ud=(a={},e={},t)=>a[t]??e[t],Jr=(a,e)=>!!Ud(a,e,"poort"),eo=(a,e)=>!!Ud(a,e,"invert");function Fd(a={},e=!1){if(e||a.device_class==="gate")return{open:"gateOpen",closed:"gate"};switch(a.device_class){case"garage":return{open:"garageOpen",closed:"garageClosed"};case"awning":case"blind":return{open:"awning",closed:"awning"};default:return{open:"shutterOpen",closed:"shutter"}}}var qd=a=>a?{open:"Openen",close:"Sluiten"}:{open:"Open",close:"Dicht"},Gg={open:"closed",closed:"open",opening:"closing",closing:"opening"},Zd=(a,e)=>e?Gg[a]??a:a,Ea=(a,e)=>e&&a!=null?100-a:a;function to(a,e){if(a==="stop")return"stop_cover";let t=a==="open";return(e?!t:t)?"open_cover":"close_cover"}function Yd({state:a,positie:e,aanname:t}){return e!=null?e>0?"open":"closed":a==="open"||a==="closed"?a:t??"closed"}function Xd({dood:a,state:e,positie:t,toon:n=!0}){return a?"Niet bereikbaar":n?e==="opening"?"Gaat open":e==="closing"?"Gaat dicht":t!=null?`${t}% open`:e==="open"?"Open":e==="closed"?"Dicht":"":""}function Qd({aantal:a,kanPositie:e,toonPositie:t=!0}){let n=!!e&&t!==!1;return 12+Math.max(1,a)*42+(n?30:0)}var no=(a,e)=>!!((a?.attributes?.supported_features??0)&e),Aa=class extends S{validate(e){let t=e.covers??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,covers:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[C]:"Kies minstens \xE9\xE9n rolluik of zonnescherm."}}watched(){return this.config.covers.map(e=>e.entity)}keysHtml(e,t){let n=qd(t),i=(r,o,s)=>`<button type="button" class="${t?"tekst":""}" data-act="${r}" aria-label="${o}">${s}</button>`;return`
      <div class="keys${t?" woorden":""}">
        ${i("open",n.open,t?n.open:N.arrowUp)}
        ${e?`<button type="button" data-act="stop" aria-label="Stop">${N.stop}</button>`:""}
        ${i("close",n.close,t?n.close:N.arrowDown)}
      </div>`}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),`<div class="card surface">${e.covers.map((n,i)=>`
      <div class="cv" data-i="${i}" data-shown="closed" style="--tone:${ee(n.tone??e.tone,"solar")}">
        <button class="chip" type="button" aria-label="Meer info"></button>
        <div class="txt"><div class="nm"></div><div class="st"></div></div>
        ${this.keysHtml(e.show_stop!==!1,Jr(n,e))}
        <div class="pos" hidden></div>
      </div>`).join("")}</div>`}wire(){this.dragging_=new Set,this.bound_=new Set,this.assumed_=new Map,this.$$(".cv").forEach(e=>{let t=e.dataset.i;e.querySelectorAll(".keys button").forEach(i=>{this.on(i,"click",()=>{let r=i.dataset.act,o=this.config.covers[+t];this.hass.callService("cover",to(r,eo(o,this.config)),{entity_id:o.entity}),r!=="stop"&&(this.assumed_.set(t,r==="open"?"open":"closed"),this.paint())})});let n=this.config.covers[+t].entity;this.teardown_.push(B(e.querySelector(".chip"),{onTap:()=>K(this,n)}))})}paint(){this.$$(".cv").forEach(e=>{let t=e.dataset.i,n=this.config.covers[+t],i=k(this.hass,n.entity),r=J(this.hass,n.entity),o=!i||i.state==="unavailable",s=eo(n,this.config),l=Jr(n,this.config),d=Zd(i?.state??"unknown",s);e.classList.toggle("unavailable",o),e.querySelector(".nm").textContent=M(this.hass,n.entity,n.name);let c=no(i,Ht.SET_POSITION)&&r.current_position!=null,p=c?Ea(r.current_position,s):null,h=Yd({state:d,positie:p,aanname:this.assumed_.get(t)});e.dataset.shown=h;let u=Fd(r,l),m=(h==="open"?n.icon_open:n.icon_closed)??(h==="open"?this.config.icon_open:this.config.icon_closed)??n.icon??u[h],b=e.querySelector(".chip");b.dataset.icon!==m&&(b.dataset.icon=m,b.innerHTML=v(m,u[h]));let x=e.querySelector(".st");this.dragging_.has(t)||(x.textContent=Xd({dood:o,state:d,positie:p,toon:this.toonStatus_()})),e.querySelectorAll(".keys button").forEach($=>{let T=to($.dataset.act,s);$.disabled=o||!no(i,Wd[T])});let w=e.querySelector(".pos"),y=c&&this.config.show_position!==!1;if(w.hidden=!y,y){if(w.dataset.built||(w.dataset.built="1",w.innerHTML=ze("position"),w.querySelector(".slider").setAttribute("aria-label","Positie")),!this.bound_.has(t)){this.bound_.add(t);let T=w.querySelector(".slider"),q=ne=>{T.style.setProperty("--v",`${ne}%`),T.setAttribute("aria-valuenow",String(ne)),this.toonStatus_()&&(e.querySelector(".st").textContent=`${ne}% open`)};this.teardown_.push(qe(T,{value:()=>Ea(J(this.hass,n.entity).current_position??0,s),onInput:q,onCommit:ne=>this.hass.callService("cover","set_cover_position",{entity_id:n.entity,position:Ea(ne,s)})}))}let $=w.querySelector(".slider");if(!$.classList.contains("dragging")){let T=p??0;$.style.setProperty("--v",`${T}%`),$.setAttribute("aria-valuenow",String(T))}}})}toonStatus_(){return this.config.show_state!==!1}rows_(){let e=this.config?.covers??[];return Ie(Qd({aantal:e.length,kanPositie:e.some(t=>no(k(this.hass,t.entity),Ht.SET_POSITION)),toonPositie:this.config?.show_position}))}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-cover-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("cover."));return{covers:n?[n]:[]}}};j(Aa,"css",`
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
      color: var(--dac-ink-3); background: rgba(var(--dac-tint), .05); border-color: var(--dac-border);
    }

    .txt { min-width: 0; }
    .nm { font-size: 13.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .st { margin-top: 2px; font-size: 11.5px; color: var(--dac-ink-2); font-variant-numeric: tabular-nums; }
    .st:empty { display: none; }

    /* ---- open / stop / dicht ---- */
    .keys {
      display: inline-flex; gap: 2px; padding: 3px; flex: 0 0 auto;
      background: rgba(var(--dac-tint), .05); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-pill);
    }
    .keys button {
      width: 36px; height: 32px; display: grid; place-items: center; padding: 0; cursor: pointer;
      border: 0; background: transparent; color: var(--dac-ink-2);
      border-radius: var(--dac-radius-pill);
      transition: background 180ms ease, color 180ms ease;
    }
    @media (hover: hover) { .keys button:hover { color: var(--dac-ink); background: rgba(var(--dac-tint), .08); } }
    .keys button:active { background: rgba(var(--dac-tint), .14); }
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
    ${Ze}

    .cv.unavailable { opacity: .42; pointer-events: none; }

    @media (max-width: 380px) {
      .keys button { width: 34px; }
      .keys.woorden button.tekst { min-width: 0; padding: 0 8px; font-size: 12px; }
    }
  `);var ao=class extends L{defaults(){return{show_stop:!0,show_position:!0,show_state:!0}}pickers(){return[{key:"icon_open",kind:"icon",label:"Icoon als het open staat",fallback:"shutterOpen"},{key:"icon_closed",kind:"icon",label:"Icoon als het dicht is",fallback:"shutter"}]}setConfig(e){let t={...e},n=(e.covers??e.entities??(e.entity?[e.entity]:[])).map(i=>typeof i=="string"?{entity:i}:i);t.covers=n.map(i=>i.entity);for(let i of n)i.name&&(t[`naam:${i.entity}`]=i.name),i.poort&&(t[`poort:${i.entity}`]=!0),i.invert&&(t[`invert:${i.entity}`]=!0);super.setConfig(t)}serialize(e){let t={...e},n=t.covers??[];t.covers=n.map(i=>{let r={};return t[`naam:${i}`]&&(r.name=t[`naam:${i}`]),t[`poort:${i}`]&&(r.poort=!0),t[`invert:${i}`]&&(r.invert=!0),Object.keys(r).length?{entity:i,...r}:i});for(let i of Object.keys(t))/^(naam|poort|invert):/.test(i)&&delete t[i];return t}schema(){let e=(this.config_?.covers??[]).filter(t=>typeof t=="string");return[{name:"covers",selector:{entity:{domain:"cover",multiple:!0}}},...e.flatMap(t=>[{name:`naam:${t}`,selector:f.text()},{name:`poort:${t}`,selector:f.bool()},{name:`invert:${t}`,selector:f.bool()}]),{name:"show_stop",selector:f.bool()},{name:"show_state",selector:f.bool()}]}naamVan_(e){return this.config_?.[`naam:${e}`]||this.hass?.states?.[e]?.attributes?.friendly_name||e}label(e){return e.name.startsWith("naam:")?`Naam voor ${this.naamVan_(e.name.slice(5))}`:e.name.startsWith("poort:")?`${this.naamVan_(e.name.slice(6))} is een poort`:e.name.startsWith("invert:")?`${this.naamVan_(e.name.slice(7))} omgekeerd aangesloten`:{covers:"Rolluiken",show_stop:"Stopknop tonen",show_state:"Status tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="covers")return"Melden ze hun stand terug, dan komt er vanzelf een schuif bij. Zo niet, dan blijven het open, stop en dicht, en volgt het icoon de knop die je indrukt. Per rolluik kun je hieronder een eigen naam zetten.";if(e.name.startsWith("poort:"))return"Zet pijltjes om in Openen en Sluiten, en geeft een poorticoon. Een poort schuift opzij, dus omhoog en omlaag zeggen er niets over.";if(e.name.startsWith("invert:"))return"Voor een motor die andersom is aangesloten: open wordt dicht en dicht wordt open. De knoppen, de status en de schuif draaien samen om.";if(e.name==="show_state")return"Haalt de regel Open, Dicht of het percentage onder de naam weg. Niet bereikbaar blijft altijd staan."}};O("domotiapp-cover-card-editor",ao);D("domotiapp-cover-card",Aa,{name:"DomotiApp Rolluiken",description:"Open, stop en dicht, met een eigen icoon voor open en dicht."});function Wg(a){if(!a)return{label:"Onbekend",home:null};switch(a.state){case"home":return{label:"Thuis",home:!0};case"not_home":return{label:"Afwezig",home:!1};case"unknown":case"unavailable":return{label:"Onbekend",home:null};default:return{label:a.state,home:!1}}}var Sa=class extends S{validate(e){let t=e.persons??e.entities??(e.entity?[e.entity]:[]);return t.length?{...e,persons:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[C]:"Kies minstens \xE9\xE9n persoon."}}watched(){return this.config.persons.map(e=>e.entity)}template(){let e=this.config;e.bare&&this.setAttribute("bare","");let t=e.columns??Math.min(e.persons.length,6),n=e.persons.map((i,r)=>`
      <button class="p" type="button" data-i="${r}" style="--tone:var(--dac-ink-3)">
        <span class="av"><span class="ph"></span></span>
        <span class="nm"></span>
      </button>`).join("");return`<div class="card surface"><div class="chips" style="--cols:${t}">${n}</div></div>`}wire(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i];this.teardown_.push(B(e,{onTap:()=>K(this,t.entity)}))})}paint(){this.$$(".p").forEach(e=>{let t=this.config.persons[+e.dataset.i],n=k(this.hass,t.entity),i=Wg(n);e.style.setProperty("--tone",i.home===!0?"var(--dac-good)":i.home===!1?"var(--dac-bad)":"var(--dac-warn)");let r=M(this.hass,t.entity,t.name);this.text(e.querySelector(".nm"),r);let o=e.querySelector(".ph"),s=n?.attributes?.entity_picture,l=s?`img:${s}`:r?`ini:${r[0]}`:"icon";o.dataset.kind!==l&&(o.dataset.kind=l,o.innerHTML=s?`<img src="${s}" alt="" loading="lazy" />`:r?r[0].toUpperCase():N.person),e.setAttribute("aria-label",`${r}, ${i.label}`)})}rows_(){let e=this.config?.columns??Math.min(this.config?.persons?.length??1,6),t=Math.ceil((this.config?.persons?.length??1)/e);return Ie(10+t*45+(t-1)*6)}getCardSize(){return this.rows_()}getGridOptions(){let e=this.rows_();return{columns:"full",rows:e,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-person-card-editor")}static getStubConfig(e){return{persons:Object.keys(e?.states??{}).filter(n=>n.startsWith("person.")).slice(0,6)}}};j(Sa,"css",`
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
  `);var io=class extends L{setConfig(e){let t={...e},n=(e.persons??[]).map(i=>typeof i=="string"?{entity:i}:i);t.persons=n.map(i=>i.entity);for(let i of n)i.name&&(t[`naam:${i.entity}`]=i.name);super.setConfig(t)}serialize(e){let t={...e},n=t.persons??[];t.persons=n.map(i=>{let r=t[`naam:${i}`];return r?{entity:i,name:r}:i});for(let i of Object.keys(t))i.startsWith("naam:")&&delete t[i];return t}schema(){let e=(this.config_?.persons??[]).filter(t=>typeof t=="string");return[{name:"persons",selector:{entity:{domain:["person","device_tracker"],multiple:!0}}},...e.map(t=>({name:`naam:${t}`,selector:f.text()}))]}label(e){if(e.name==="persons")return"Personen";if(e.name.startsWith("naam:")){let t=e.name.slice(5);return`Naam voor ${this.hass?.states?.[t]?.attributes?.friendly_name??t}`}return super.label(e)}helper(e){if(e.name==="persons")return"Thuis is groen, weg is rood, geen melding is oranje. Per persoon kun je hieronder een eigen naam zetten."}};O("domotiapp-person-card-editor",io);D("domotiapp-person-card",Sa,{name:"DomotiApp Personen",description:"Wie er thuis is, compact. Het hele huishouden in \xE9\xE9n kaart."});var ro=a=>String(a??"").trim().split(/\s+/).filter(Boolean);function Ug(a){let e=ro(a);return e.filter((n,i)=>i===0||n.toLowerCase()!==e[i-1].toLowerCase()).join(" ")}function Fg(a){let e=a.map(ro).filter(i=>i.length);if(e.length<2)return 0;let t=0,n=Math.min(...e.map(i=>i.length));for(;t<n;){let i=e[0][t].toLowerCase();if(!e.every(r=>r[t].toLowerCase()===i))break;t++}return Math.min(t,n-1)}function pn(a){let e=a.map(n=>Ug(n)),t=Fg(e);return e.map(n=>{let i=ro(n),r=i.slice(t);return(r.length?r:i).join(" ")})}function hn(a,e){if(!a?.length)return[];let t=e(a[0]);return t==null?[a[0]]:a.filter(n=>e(n)===t)}function Jd(a){return a===0?{n:"nu",u:"aan de weg",bij:"nu aan de weg"}:{n:String(a),u:a===1?"dag":"dagen",bij:a>=3?`over ${a} dagen`:""}}var ec=new Set(["","geen","none","unknown","unavailable","-","nee","niets","no","false","off","0","geen afval","geen ophaling"]),qg={gft:"GFT",pmd:"PMD",kca:"KCA",pbd:"PBD",papier:"Papier","oud papier":"Oud papier",restafval:"Restafval",rest:"Restafval",textiel:"Textiel",kerstbomen:"Kerstbomen",kerstboom:"Kerstboom",glas:"Glas",plastic:"Plastic",grofvuil:"Grofvuil",snoeiafval:"Snoeiafval"},tc=/^[\d\s:./-]+$/,Zg=/\s*(?:,|;|\/|&|\+|\ben\b|\band\b)\s*/i;function nc(a){let e=String(a??"").trim();if(ec.has(e.toLowerCase())||tc.test(e))return[];let t=[];for(let n of e.split(Zg)){let i=n.trim();if(!i||ec.has(i.toLowerCase())||tc.test(i))continue;let r=qg[i.toLowerCase()];r||(r=i[0]===i[0].toUpperCase()?i:i[0].toUpperCase()+i.slice(1)),t.includes(r)||t.push(r)}return t}function nt(a){return a?.length?a.length===1?a[0]:`${a.slice(0,-1).join(", ")} en ${a[a.length-1]}`:""}function un(a){let e=String(a??"").match(/^\s*(\d{1,2}):(\d{2})/);return!e||Number(e[1])>23||Number(e[2])>59?"":`${e[1].padStart(2,"0")}:${e[2]}`}var ac=a=>`${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,"0")}-${String(a.getDate()).padStart(2,"0")}`;function Yg({vandaag:a,morgen:e,tijdMorgen:t,buiten:n,door:i,verstuurd:r=!1,nu:o=new Date}={}){let s=nc(a),l=nc(e),d=new Date(o.getFullYear(),o.getMonth(),o.getDate()+1),c=p=>n?.datum===ac(p)?` \xB7 staat buiten${i?` (${i})`:""}`:"";if(s.length)return`Vandaag ${nt(s)}${c(o)}`;if(l.length){let p=c(d);if(p)return`Morgen ${nt(l)}${p}`;if(r)return`Morgen ${nt(l)} \xB7 melding verstuurd`;let h=un(t);return`Morgen ${nt(l)}${h?` \xB7 melding om ${h}`:""}`}return""}var oo=(a,e)=>a?.aan?.[e]??!0;function ic(a){let e=Array.isArray(a?.personen)?a.personen:typeof a?.personen=="string"?[a.personen]:[];return[...new Set(e.filter(t=>typeof t=="string"&&t.startsWith("person.")))]}var Xg=[{id:"afval",naam:"Afvalmeldingen",icoon:"bin"}];function Ma(a,e){let t=a?.[e];return typeof t=="boolean"?t:String(a?.soort||"afval")===e}var rc=a=>Xg.filter(e=>Ma(a,e.id)),Na=(a,e="afval")=>e==="afval"?String(a?.id||"").trim()||"afval":e;function oc(a,e,t){return e.some(n=>oo(a?.[n],t))}function sc({config:a,stand:e,vandaag:t,morgen:n,door:i,nu:r=new Date}={}){if(e&&!e.bekend)return"Actief zodra het dashboard is opgeslagen";if(!a?.afval_vandaag&&!a?.afval_morgen)return"Nog geen afvalsensor gekozen";let o=un(e?.tijden?.morgen)||un(a.tijd_morgen)||"19:30",s=un(e?.tijden?.vandaag)||un(a.tijd_vandaag)||"07:30",l=e?.verstuurd?.morgen===ac(r),d=Yg({vandaag:t,morgen:n,tijdMorgen:o,buiten:e?.buiten,door:i,verstuurd:l,nu:r});if(d)return d;let p=[a.afval_morgen?`de avond ervoor om ${o}`:"",a.afval_vandaag?`de ochtend zelf om ${s}`:""].filter(Boolean).join(" en ");return p[0].toUpperCase()+p.slice(1)}function lc(a,e){return a?.reden?{tekst:a.reden,fout:!0}:a?.verstuurd?.length?{tekst:`Verstuurd naar ${e}: \u201C${a.titel}\u201D. Kijk op de telefoon.`,fout:!1}:a?.zonder_telefoon?.length?{tekst:`Niet verstuurd: geen werkende telefoon gevonden voor ${e}.`,fout:!0}:{tekst:"Niet verstuurd.",fout:!0}}var Qg=[[/gft|groente|tuin|organi/i,"teal","binWheeled"],[/pmd|plastic|verpakking/i,"solar","binWheeled"],[/papier|karton/i,"water","binWheeled"],[/rest|grijs/i,"neutral","binWheeled"],[/textiel|kleding/i,"pink","bin"],[/glas/i,"magenta","bin"],[/kerstboom|snoei|takken/i,"teal","bin"]];function Jg(a){for(let[e,t,n]of Qg)if(e.test(a))return{tone:t,icon:n};return{tone:"accent",icon:"bin"}}var dc={"geen datum":"geen datum",voorbij:"is geweest","bestaat niet":"sensor ontbreekt"},cc=a=>String(a??"").replace(/^(afvalbeheer|afvalwijzer|mijnafvalwijzer)\s*/i,"").replace(/\s*(mijnafvalwijzer)\s*/i," ").trim(),Da=class extends S{validate(e){let t=e.sensors??e.entities??(e.entity?[e.entity]:[]);return t.length?{show_hero:!0,show_list:!0,...e,sensors:t.map(n=>typeof n=="string"?{entity:n}:n)}:{...e,[C]:"Kies minstens \xE9\xE9n afvalsensor waarvan de status een datum is."}}watched(){return this.config.sensors.map(e=>e.entity)}wire(){this.breed_()&&this.teardown_.push(V(this.$(".card")));let e=this.$(".hero");if(e&&typeof ResizeObserver<"u"){let t=new ResizeObserver(()=>this.pasHeroAan_());t.observe(e),this.teardown_.push(()=>t.disconnect())}}pasHeroAan_(){let e=this.$(".hero"),t=e?.querySelector(".big");!t||e.hidden||!t.textContent||(e.removeAttribute("data-krap"),t.clientWidth&&e.toggleAttribute("data-krap",t.scrollWidth>t.clientWidth+1))}read_(){let e=new Date,t=this.config.sensors.map(r=>{let o=k(this.hass,r.entity),s=o?we(o.state)??we(o.attributes.date)??we(o.attributes.next_date)??we(o.attributes.Year_month_day_date):null;return{cfg:r,st:o,date:s}}),n=t.map(r=>cc(M(this.hass,r.cfg.entity,r.cfg.name))),i=pn(n);return t.map((r,o)=>{let s=r.cfg.label??i[o]??n[o],l=Jg(r.cfg.label??r.cfg.entity+s),d=this.config.tones?.[r.cfg.entity];return{label:s,entity:r.cfg.entity,date:r.date,days:r.date?Et(e,r.date):null,tone:ee(d??r.cfg.tone??l.tone),icon:r.cfg.icon??l.icon,reden:r.st?r.date?Et(e,r.date)<0?"voorbij":null:"geen datum":"bestaat niet"}}).sort((r,o)=>!r.reden&&!o.reden?r.date-o.date:r.reden?o.reden?r.label.localeCompare(o.label):1:-1)}komend_(e){return e.filter(t=>!t.reden)}breed_(){return this.config.layout==="breed"}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),this.setAttribute("vorm",this.breed_()?"breed":"lijst"),this.breed_()?`
      <div class="card surface">
        <div class="rij">
          ${e.title?`<div class="head"><b>${_(e.title)}</b></div>`:""}
          <div class="breed"></div>
        </div>
        <div class="empty" hidden>Geen ophaaldata gevonden. Controleer of de gekozen sensoren een datum als toestand hebben.</div>
      </div>`:`
      <div class="card surface">
        ${e.title?`<div class="head"><b>${_(e.title)}</b></div>`:""}
        ${e.show_hero===!1?"":`<div class="hero" hidden>
          <span class="bins"></span>
          <span class="what">
            <span class="eyebrow"><span class="dag"></span><span class="bij"></span></span>
            <span class="big"></span>
          </span>
          <span class="when"><span class="n tnum"></span><span class="eyebrow u"></span></span>
        </div>`}
        ${e.show_list===!1?"":'<div class="list"></div>'}
        <div class="breed"></div>
        <div class="empty" hidden>Geen ophaaldata gevonden. Controleer of de gekozen sensoren een datum als toestand hebben.</div>
      </div>`}paint(){let e=this.read_(),t=this.komend_(e),n=hn(t,s=>s.days),i=this.$(".hero"),r=this.$(".list"),o=this.$(".empty");if(o.hidden=e.length>0,this.breed_()){this.paintBreed_(e,n),R(this.$(".card"));return}if(i&&(i.hidden=t.length===0,t.length)){let s=n[0];i.style.setProperty("--tone",n.length>1?ee("neutral"):s.tone),this.setAttribute("urgency",s.days===0?"today":s.days===1?"tomorrow":"later");let l=i.querySelector(".bins"),d=n.map(p=>`${p.icon}|${p.tone}`).join(",");l.dataset.sig!==d&&(l.dataset.sig=d,l.dataset.aantal=n.length>2?"veel":String(n.length),l.innerHTML=n.map(p=>`<span class="bin" style="--tone:${_(p.tone)}">${v(p.icon,"bin")}</span>`).join(""));let c=Jd(s.days);this.text(i.querySelector(".dag"),At(s.date)),this.text(i.querySelector(".bij"),c.bij?` \xB7 ${c.bij}`:""),this.text(i.querySelector(".big"),nt(n.map(p=>p.label))),this.text(i.querySelector(".n"),c.n),this.text(i.querySelector(".u"),c.u),this.pasHeroAan_()}if(r){let s=this.config.show_hero===!1?e:e.filter(d=>!n.includes(d)),l=s.map(d=>`${d.label}${+d.date}${d.days}${d.reden??""}`).join("|");if(r.dataset.sig===l)return;r.dataset.sig=l,r.innerHTML=s.map(d=>{if(d.reden)return`
        <div class="r" data-stil="true" style="--tone:${d.tone}">
          <i></i><span>${_(d.label)}</span>
          <span class="d">${dc[d.reden]??d.reden}</span>
        </div>`;let c=At(d.date),p=d.days<=6?`<small>${Zn(d.date)}</small>`:"";return`
        <div class="r" style="--tone:${d.tone}">
          <i></i><span>${_(d.label)}</span>
          <span class="d">${c}${p}</span>
        </div>`}).join("")}}paintBreed_(e,t){let n=this.$(".breed");if(!n)return;let i=e.map(r=>`${r.label}|${+r.date}|${r.days}|${r.reden??""}`).join(",");n.dataset.sig!==i&&(n.dataset.sig=i,n.innerHTML=e.map(r=>{let o=r.reden?dc[r.reden]??r.reden:r.days===0?"vandaag":r.days===1?"morgen":At(r.date);return`
          <div class="b" style="--tone:${r.tone}" data-eerst="${t.includes(r)}"
               data-stil="${!!r.reden}" title="${_(r.label)}">
            <i></i>
            <span class="t">
              <span class="n">${_(r.label)}</span>
              <span class="w">${_(o)}</span>
            </span>
          </div>`}).join(""))}rows_(){let e=this.config?.sensors?.length??1;return this.breed_()?this.minRijen_(".card",Math.max(1,Math.ceil(e/4))):this.config?.show_list===!1?1:this.config?.show_hero===!1?Math.max(1,Ie(20+e*33)):Math.max(2,e)}getCardSize(){return this.rows_()}getGridOptions(){if(this.breed_())return{columns:12,rows:"auto",min_columns:6,min_rows:this.rows_()};let e=this.rows_();return{columns:12,rows:e,min_columns:6,min_rows:e,max_rows:e}}static getConfigElement(){return document.createElement("domotiapp-waste-card-editor")}static getStubConfig(e){return{sensors:Object.keys(e?.states??{}).filter(n=>/afval|waste|trash|garbage|ophaal/i.test(n)&&n.startsWith("sensor.")).filter(n=>we(e.states[n]?.state)).slice(0,6),title:"Afvalkalender"}}};j(Da,"css",`
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
    /* Elke bak van die dag een eigen icoon, in zijn eigen kleur. Moeten er twee
       tegelijk aan straat, dan is het vlak eromheen neutraal: het is dan niet
       de bak van \xE9\xE9n fractie, en de kleur van de eerste zou de tweede
       wegdrukken. Gemeld op 6 oktober 2026 -- zie afval-logica.js. */
    .hero .bins { display: flex; gap: 6px; flex: 0 0 auto; }
    .hero .bin {
      width: 40px; height: 40px; flex: 0 0 auto; display: grid; place-items: center;
      border-radius: var(--dac-radius-sm); color: var(--tone);
      background: color-mix(in srgb, var(--tone) 18%, transparent);
    }
    .hero .bin .icon, .hero .bin ha-icon { width: 21px; height: 21px; --mdc-icon-size: 21px; }
    /* Drie of meer op \xE9\xE9n dag: kleiner, anders blijft er voor de namen niets
       over op een kaart van een halve kolom breed. */
    .hero .bins[data-aantal="veel"] { gap: 4px; }
    .hero .bins[data-aantal="veel"] .bin { width: 32px; height: 32px; }
    .hero .bins[data-aantal="veel"] .bin .icon,
    .hero .bins[data-aantal="veel"] .bin ha-icon { width: 17px; height: 17px; --mdc-icon-size: 17px; }
    /* De namen nemen wat er over is, en houden daar ook op.

       Ze liepen eerst dwars door "nu aan de weg" heen. Gemeld op 7 oktober
       2026 met een schermafdruk van zijn telefoon, en nagemeten in een kaart
       van 354 pixels: "Restafval en Papier" eindigde 49,5 pixels voorbij het
       begin van de telling. De ellips stond er wel, maar op een SPAN, en een
       inline element kapt niets af -- vandaar display: block. */
    .hero .what { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
    .hero .what .eyebrow { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .hero .big {
      display: block;
      font-size: 18px; font-weight: 500; letter-spacing: -.02em; line-height: 1.15;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .hero .when {
      margin-left: auto; text-align: right; flex: 0 0 auto;
      display: flex; align-items: baseline; gap: 5px;
    }
    .hero .when .n { font-size: 18px; font-weight: 500; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }

    /* Krap: de namen passen niet naast de telling. Dan verhuist die naar de
       regel erboven ("VANDAAG \xB7 NU AAN DE WEG") en krijgen de namen de hele
       breedte. Dat wordt GEMETEN in pasHeroAan_ en niet geschat: of het past
       hangt van de namen af, niet alleen van de breedte. Is het daarna nog te
       smal (drie bakken op een telefoon), dan mogen ze over twee regels. */
    .hero .bij { display: none; }
    .hero[data-krap] .bij { display: inline; }
    .hero[data-krap] .when { display: none; }
    .hero[data-krap] .big {
      white-space: normal;
      display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;
    }

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
  `);var so=class extends L{defaults(){return{show_hero:!0,show_list:!0}}setConfig(e){let t={...e};for(let[n,i]of Object.entries(e.tones??{}))t[`kleur:${n}`]=i;delete t.tones,super.setConfig(t)}serialize(e){let t={...e},n={};for(let i of Object.keys(t))i.startsWith("kleur:")&&(t[i]&&(n[i.slice(6)]=t[i]),delete t[i]);return Object.keys(n).length?t.tones=n:delete t.tones,t}ids_(){return(this.config_?.sensors??[]).map(e=>typeof e=="string"?e:e.entity).filter(Boolean)}pickers(){let e=this.ids_(),t=pn(e.map(n=>cc(this.hass?.states?.[n]?.attributes?.friendly_name??n)||n));return e.map((n,i)=>({key:`kleur:${n}`,kind:"tone",label:`Kleur voor ${t[i]||n}`,compact:!0,after:!0}))}schema(){return[{name:"sensors",selector:{entity:{domain:"sensor",multiple:!0}}},{name:"layout",selector:f.select([{value:"lijst",label:"Lijst (eerstvolgende uitgelicht)"},{value:"breed",label:"Over de breedte (veel lager)"}])}]}label(e){return{sensors:"Afvalsensoren",layout:"Vorm",show_hero:"Eerstvolgende uitlichten",show_list:"Overige data tonen"}[e.name]??super.label(e)}helper(e){if(e.name==="layout")return"Over de breedte zet alle bakken naast elkaar in plaats van onder elkaar. Vier bakken passen dan op \xE9\xE9n rasterrij in plaats van vier \u2014 dat scheelt bijna tweehonderd pixels. De eerstvolgende licht op.";if(e.name==="sensors")return"Sensoren waarvan de status een datum is, bijvoorbeeld 18-08-2026. De kaart sorteert zelf; laat een kleur leeg om de bakkleur op de naam te laten kiezen."}};O("domotiapp-waste-card-editor",so);D("domotiapp-waste-card",Da,{name:"DomotiApp Afvalkalender",description:"Eerstvolgende ophaling als hero, de rest eronder. Kleur per fractie."});function mt(a){if(a==null||a==="")return 4;let e=Math.round(Number(a));return Number.isFinite(e)?Math.min(6,Math.max(2,e)):4}function La(a,e=!0){if(typeof a=="string")return{name:"",icon:"",path:a,action:null,items:[]};let t=a??{};return{name:typeof t.name=="string"?t.name:"",icon:typeof t.icon=="string"?t.icon:"",path:typeof t.path=="string"?t.path:typeof t.url=="string"?t.url:typeof t.navigation_path=="string"?t.navigation_path:"",action:t.action&&typeof t.action=="object"?{...t.action}:null,items:e&&Array.isArray(t.items)?t.items.slice(0,8).map(n=>La(n,!1)):[]}}var at=a=>Array.isArray(a?.items)?a.items.filter(it):[],pc=a=>at(a).length>0,it=a=>!!(a&&(a.name?.trim()||a.icon?.trim()||a.path?.trim()||a.action));function hc(a){return(Array.isArray(a?.items)?a.items:[]).slice(0,20).map(t=>La(t))}var uc=[{id:"domotitech",label:"DomotiTech",uitleg:"Opent domotitech.nl in een nieuw tabblad, met het logo erop.",bovenaan:!0,maak:()=>({name:"DomotiTech",icon:"domotitech",path:"https://domotitech.nl",action:null,items:[]})},{id:"herstart",label:"Herstart Home Assistant",uitleg:"Roept homeassistant.restart aan, met een bevestiging ervoor.",bovenaan:!0,maak:()=>({name:"Herstart",icon:"power",path:"",action:{action:"perform-action",perform_action:"homeassistant.restart",confirmation:{title:"Weet je het zeker?",text:"Weet je het zeker dat je Home Assistant wilt herstarten?"}},items:[]})}];function mc(a,e,t=!1){let n=Array.isArray(a)?[...a]:[];if(n.length>=8)return{lijst:n,plek:-1};let i=t?0:n.length;return n.splice(i,0,e),{lijst:n,plek:i}}function Ta(a,e=4){let t=(a??[]).filter(it),n=mt(e);if(t.length<=n)return{balk:t,meer:[],heeftMeer:!1};let i=Math.max(1,n-1);return{balk:t.slice(0,i),meer:t.slice(i),heeftMeer:!0}}function lo(a){if(a&&typeof a=="object")return a.action?a.action:lo(a.path);let e=String(a??"").trim();return e?/^[a-z][a-z0-9+.-]*:\/\//i.test(e)||e.startsWith("mailto:")?{action:"url",url_path:e}:{action:"navigate",navigation_path:e}:{action:"none"}}var nf=`
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
`,gc=/^i(\d+)(s\d+)?$/,fc=a=>({...a.name?{name:a.name}:{},...a.icon?{icon:a.icon}:{},...a.path?{path:a.path}:{},...a.action?{action:structuredClone(a.action)}:{}}),bc=a=>a.filter(it).map(e=>{let t=(e.items??[]).filter(it).map(fc);return{...fc(e),...t.length?{items:t}:{}}}),co=class extends HTMLElement{constructor(){super(),this.items_=[],this.rest_={},this.open_=new Set}setConfig(e){if(this.rest_={...e},delete this.rest_.items,this.gebouwd_&&e===this.uitObject_)return;let t=(Array.isArray(e?.items)?e.items:[]).map(n=>La(n));this.gebouwd_&&JSON.stringify(bc(t))===this.uit_||(this.items_=t,this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}connectedCallback(){this.gebouwd_||this.build_()}async build_(){if(!this.hass_)return;await customElements.whenDefined("ha-form"),this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=nf;let t=document.createElement("div");t.className="dac-nav",this.append(e,t),t.appendChild(this.kaartBlok_());let n=document.createElement("div");n.className="knoppen",t.appendChild(n);let{balk:i}=Ta(this.items_,this.rest_.max),r=i.length,o=this.items_.filter(it);if(this.items_.forEach((l,d)=>{if(o.indexOf(l)===r&&o.length>r){let p=document.createElement("div");p.className="grens",p.textContent="Achter de meer-knop",n.appendChild(p)}n.appendChild(this.itemBlok_(l,d))}),!this.items_.length){let l=document.createElement("p");l.className="uitleg",l.textContent="Elke knop heeft een naam, een icoon en een pad -- bijvoorbeeld /lovelace/keuken voor een view op dit dashboard, of #keuken voor een pop-up. Wat er niet meer in de balk past valt vanzelf achter de meer-knop rechts.",t.appendChild(l)}let s=document.createElement("button");s.type="button",s.className="toevoegen",s.textContent="\uFF0B  Knop toevoegen",s.disabled=this.items_.length>=20,s.addEventListener("click",()=>{this.items_.push({name:"",icon:"",path:""}),this.open_.add(`i${this.items_.length-1}`),this.emit_(),this.build_()}),t.appendChild(s)}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"max",selector:{number:{min:2,max:6,step:1,mode:"box"}}},{name:"labels",selector:{boolean:{}}},{name:"bare",selector:{boolean:{}}}],e.computeLabel=t=>({max:"Knoppen in de balk",labels:"Namen onder de iconen",bare:"Achtergrond weglaten"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="max")return`De meer-knop telt zelf mee. Staan er meer knoppen dan dit, dan komen de eerste ${mt(this.rest_.max)-1} in de balk en valt de rest achter "Meer".`;if(t.name==="labels")return"Uit geeft een rij kale iconen. Dan passen er meer naast elkaar op een telefoon.";if(t.name==="bare")return"Haalt de pil onder de balk weg: alleen de iconen blijven over, zwevend boven het dashboard."},e.data={max:mt(this.rest_.max),labels:this.rest_.labels!==!1,bare:!!this.rest_.bare},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{};this.rest_.max=mt(n.max),n.labels===!1?this.rest_.labels=!1:delete this.rest_.labels,n.bare?this.rest_.bare=!0:delete this.rest_.bare,this.emit_(),this.build_()}),e}itemBlok_(e,t){let n=document.createElement("details");n.className="item",this.onthoud_(n,`i${t}`);let i=document.createElement("summary"),r=document.createElement("span");r.className="voor";let o=document.createElement("span");o.className="titel";let s=document.createElement("b"),l=document.createElement("small");o.append(s,l);let d=()=>{let x=!it(e);n.dataset.leeg=String(x),r.innerHTML=v(e.icon,"grid"),s.textContent=e.name||(x?"Nieuwe knop":e.path||"Zonder naam");let w=at(e).length;l.textContent=w?`Menu met ${w} knop${w===1?"":"pen"}`:e.path?e.path:e.icon?`${Fe(e.icon)} -- nog geen pad`:"Nog geen pad"};d(),this.koppen_.push(d);let c=this.kopKnop_("Omhoog",N.arrowUp,()=>this.verplaats_(t,-1));c.disabled=t===0;let p=this.kopKnop_("Omlaag",N.arrowDown,()=>this.verplaats_(t,1));p.disabled=t===this.items_.length-1;let h=this.kopKnop_("Verwijderen",N.close,()=>this.verwijder_(t));h.classList.add("weg"),i.append(r,o,c,p,h),n.appendChild(i);let u=document.createElement("div");u.className="body";let m=document.createElement("dac-icon-picker");m.label="Icoon",m.fallback="grid",m.auto=!1,m.hass=this.hass_,m.value=e.icon,m.addEventListener("value-changed",x=>{x.stopPropagation(),e.icon=x.detail.value??"",this.emit_()});let b=document.createElement("ha-form");return b.hass=this.hass_,b.schema=[{name:"name",selector:{text:{}}},{name:"path",selector:{text:{}}}],b.computeLabel=x=>({name:"Naam",path:"Waar gaat hij heen"})[x.name]??x.name,b.computeHelper=x=>{if(x.name!=="path")return;let w="/lovelace/keuken voor een view, #keuken voor een pop-up van bubble-card, of een https-adres voor iets buiten Home Assistant.";return pc(e)?`${w}

Deze knop heeft subknoppen en klapt dus open in plaats van ergens heen te gaan; zijn eigen pad wordt niet gebruikt.`:w},b.data={name:e.name,path:e.path},b.addEventListener("value-changed",x=>{x.stopPropagation();let w=x.detail.value??{};e.name=w.name??"",e.path=w.path??"",this.emit_()}),u.append(m,b,...this.subBlok_(e,t)),n.appendChild(u),n}subBlok_(e,t){Array.isArray(e.items)||(e.items=[]);let n=document.createElement("div");n.className="subkop",n.textContent="Subknoppen";let i=document.createElement("div");i.className="sublijst",e.items.forEach((s,l)=>i.appendChild(this.subItemBlok_(e,s,t,l)));let r=this.subKeuze_(e,t),o=document.createElement("p");return o.className="uitleg",o.textContent="Hangt hier iets onder, dan klapt deze knop een menu open BOVEN zichzelf in plaats van ergens heen te gaan. Valt de knop zelf achter de meer-knop, dan staan zijn subknoppen daar ingesprongen onder hem.",[n,i,r,o]}subKeuze_(e,t){let n=document.createElement("details");n.className="subkeuze",e.items.length>=8&&n.setAttribute("vol","");let i=document.createElement("summary");i.textContent="\uFF0B  Subknop toevoegen",n.appendChild(i);let r=document.createElement("div");r.className="keuzes",n.appendChild(r);let o=(s,l)=>{let{lijst:d,plek:c}=mc(e.items,s,l);c<0||(e.items=d,this.open_.add(`i${t}`),this.open_.add(`i${t}s${c}`),this.emit_(),this.build_(),requestAnimationFrame(()=>{this.querySelectorAll("details.sub")[c]?.scrollIntoView({block:"nearest"})}))};r.appendChild(this.keuzeKnop_("plus","Lege subknop","Zelf een naam, een icoon en een pad invullen.",()=>o({name:"",icon:"",path:"",action:null,items:[]},!1)));for(let s of uc){let l=s.maak();r.appendChild(this.keuzeKnop_(l.icon,s.label,s.uitleg,()=>o(s.maak(),s.bovenaan)))}return n}keuzeKnop_(e,t,n,i){let r=document.createElement("button");r.type="button";let o=document.createElement("span");o.className="voor",o.innerHTML=v(e,"plus");let s=document.createElement("span");s.className="tekst";let l=document.createElement("b");l.textContent=t;let d=document.createElement("small");return d.textContent=n,s.append(l,d),r.append(o,s),r.addEventListener("click",i),r}subItemBlok_(e,t,n,i){let r=document.createElement("details");r.className="sub",this.onthoud_(r,`i${n}s${i}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="voor";let l=document.createElement("span");l.className="titel";let d=document.createElement("b"),c=document.createElement("small");l.append(d,c);let p=()=>{s.innerHTML=v(t.icon,"grid"),d.textContent=t.name||(it(t)?t.path||"Zonder naam":"Nieuwe subknop"),c.textContent=t.action?`Roept ${t.action.perform_action??t.action.service??t.action.action} aan`:t.path||"Nog geen pad"};p(),this.koppen_.push(p);let h=this.kopKnop_("Omhoog",N.arrowUp,()=>this.verplaatsSub_(e,n,i,-1));h.disabled=i===0;let u=this.kopKnop_("Omlaag",N.arrowDown,()=>this.verplaatsSub_(e,n,i,1));u.disabled=i===e.items.length-1;let m=this.kopKnop_("Verwijderen",N.close,()=>this.verwijderSub_(e,n,i));m.classList.add("weg"),o.append(s,l,h,u,m),r.appendChild(o);let b=document.createElement("div");b.className="body";let x=document.createElement("dac-icon-picker");x.label="Icoon",x.fallback="grid",x.auto=!1,x.hass=this.hass_,x.value=t.icon,x.addEventListener("value-changed",y=>{y.stopPropagation(),t.icon=y.detail.value??"",this.emit_()});let w=document.createElement("ha-form");return w.hass=this.hass_,w.schema=[{name:"name",selector:{text:{}}},{name:"path",selector:{text:{}}}],w.computeLabel=y=>({name:"Naam",path:"Waar gaat hij heen"})[y.name]??y.name,t.action&&(w.schema=[{name:"name",selector:{text:{}}}],w.computeHelper=y=>y.name==="name"?`Deze knop voert een actie uit (${t.action.perform_action??t.action.service??t.action.action}) en gaat dus nergens heen. Weg met de knop rechtsboven.`:void 0),w.data={name:t.name,path:t.path},w.addEventListener("value-changed",y=>{y.stopPropagation();let $=y.detail.value??{};t.name=$.name??"",t.path=$.path??"",this.emit_()}),b.append(x,w),r.appendChild(b),r}verplaatsSub_(e,t,n,i){let r=n+i;if(r<0||r>=e.items.length)return;[e.items[n],e.items[r]]=[e.items[r],e.items[n]];let o=this.open_.has(`i${t}s${n}`),s=this.open_.has(`i${t}s${r}`);this.open_.delete(`i${t}s${n}`),this.open_.delete(`i${t}s${r}`),s&&this.open_.add(`i${t}s${n}`),o&&this.open_.add(`i${t}s${r}`),this.emit_(),this.build_()}verwijderSub_(e,t,n){e.items.splice(n,1);let i=new Set;for(let r of this.open_){let o=/^i(\d+)s(\d+)$/.exec(r);if(!o||Number(o[1])!==t){i.add(r);continue}let s=Number(o[2]);s!==n&&i.add(`i${t}s${s>n?s-1:s}`)}this.open_=i,this.emit_(),this.build_()}kopKnop_(e,t,n){let i=document.createElement("button");return i.type="button",i.className="rondknop",i.title=e,i.setAttribute("aria-label",e),i.innerHTML=t,i.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),i.disabled||n()}),i}verplaats_(e,t){let n=e+t;n<0||n>=this.items_.length||([this.items_[e],this.items_[n]]=[this.items_[n],this.items_[e]],this.schuifOpen_(e,n),this.emit_(),this.build_())}verwijder_(e){this.items_.splice(e,1);let t=new Set;for(let n of this.open_){let i=gc.exec(n);if(!i)continue;let r=Number(i[1]);r!==e&&t.add(`i${r>e?r-1:r}${i[2]??""}`)}this.open_=t,this.emit_(),this.build_()}schuifOpen_(e,t){let n=new Set;for(let i of this.open_){let r=gc.exec(i);if(!r)continue;let o=Number(r[1]),s=r[2]??"";o===e?n.add(`i${t}${s}`):o===t?n.add(`i${e}${s}`):n.add(i)}this.open_=n}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}emit_(){let e=bc(this.items_),t={...this.rest_,items:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_??[])n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};H("domotiapp-navbar-card-editor",co);var vc=a=>a.parentElement??(a.parentNode&&a.parentNode.host)??null;function*mn(a){let e=vc(a),t=0;for(;e&&t++<40;)yield e,e=vc(e)}function af(a){for(let e of mn(a)){let t=e.tagName?.toLowerCase?.()??"";if(/(^|-)(edit|preview)/.test(t))return!0}return!1}function rf(a){for(let e of mn(a))if(e.tagName?.toLowerCase?.()==="hui-card")return e;return null}function of(a){for(let e of mn(a))if(e.tagName?.toLowerCase?.()==="hui-section")return e;return null}function sf(a){for(let e of mn(a))if(e.classList?.contains?.("section"))return e;return null}function kc(a){for(let e of mn(a)){let t=e.tagName?.toLowerCase?.()??"";if(t==="hui-view"||t.endsWith("-view"))return e}return null}var Oa=class extends S{validate(e){let t=hc(e),n={labels:!0,tone:"accent",...e,items:t,max:mt(e?.max)};return t.filter(i=>i.name||i.icon||i.path).length||(n[C]="Voeg knoppen toe in de editor: een naam, een icoon en waar hij heen gaat."),n}watched(){return[]}template(){let e=this.config;e.labels===!1&&this.setAttribute("geen-namen",""),e.bare&&this.setAttribute("bare","");let{balk:t,meer:n,heeftMeer:i}=Ta(e.items,e.max),r=e.items.filter(c=>c.name||c.icon||c.path),o=(c,p)=>{let u=at(c).length?` data-menu="s${p}" aria-haspopup="true" aria-expanded="false"`:"";return`
      <button type="button" class="knop" data-i="${p}" title="${_(c.name)}"${u}>
        <span class="ico">${v(c.icon,"grid")}</span>
        <span class="naam">${_(c.name)}</span>
      </button>`},s=(c,p,h=null,u="")=>`
      <button type="button" class="regel${u?` ${u}`:""}" data-i="${p}"${h===null?"":` data-s="${h}"`}>
        <span class="mi">${v(c.icon,"grid")}</span>
        <span class="mt">${_(c.name||c.path)}</span>
      </button>`,l=n.map(c=>{let p=r.indexOf(c),h=at(c);return h.length?`
      <div class="regel kop">
        <span class="mi">${v(c.icon,"grid")}</span>
        <span class="mt">${_(c.name||c.path)}</span>
      </div>`+h.map((m,b)=>s(m,p,b,"sub")).join(""):s(c,p)}).join(""),d=t.map(c=>{let p=at(c);if(!p.length)return"";let h=r.indexOf(c);return`<div class="menu submenu" data-id="s${h}" role="menu">${p.map((u,m)=>s(u,h,m)).join("")}</div>`}).join("");return`
      <div class="balk" style="--tone:${ee(e.tone)}">
        ${t.map(c=>o(c,r.indexOf(c))).join("")}
        ${i?`<button type="button" class="knop meer" data-menu="meer" aria-expanded="false" aria-haspopup="true">
                 <span class="ico">${N.dots}</span>
                 <span class="naam">Meer</span>
               </button>`:""}
        ${d}
        <div class="menu meermenu" data-id="meer" role="menu">
          ${l}
        </div>
      </div>`}wire(){for(let e of this.$$(".knop[data-i], .regel[data-i]"))e.dataset.menu||this.on(e,"click",()=>{this.sluitMenus_(),this.ga_(Number(e.dataset.i),e.dataset.s)});for(let e of this.$$("[data-menu]"))this.on(e,"click",t=>{t.stopPropagation(),this.wisselMenu_(e)});this.on(window,"pointerdown",e=>{if(!this.ietsOpen_())return;let t=e.composedPath?.()??[];[...this.$$(".menu[open]"),...this.$$("[data-menu]")].some(i=>t.includes(i))||this.sluitMenus_()},!0),this.on(window,"keydown",e=>{e.key==="Escape"&&this.ietsOpen_()&&this.sluitMenus_()}),this.on(window,"location-changed",()=>this.sluitMenus_())}paint(){}ga_(e,t){let n=this.config.items.filter(r=>r.name||r.icon||r.path)[e];if(!n)return;let i=t===void 0?n:at(n)[Number(t)];i&&de(this,this.hass,{},lo(i))}ietsOpen_(){return!!this.$(".menu[open]")}menuVan_(e){return this.$$(".menu").find(t=>t.dataset.id===e.dataset.menu)??null}wisselMenu_(e){let t=this.menuVan_(e),n=!!t?.hasAttribute("open");this.sluitMenus_(),!(!t||n)&&(t.setAttribute("open",""),e.setAttribute("aria-expanded","true"),this.plaatsMenu_(t,e))}sluitMenus_(){for(let e of this.$$(".menu[open]"))e.removeAttribute("open");for(let e of this.$$("[data-menu]"))e.setAttribute("aria-expanded","false")}plaatsMenu_(e,t){if(!e.classList.contains("submenu"))return;let n=this.$(".balk")?.getBoundingClientRect(),i=t.getBoundingClientRect();if(!n?.width)return;let r=e.offsetWidth/2,o=i.left+i.width/2-n.left,s=r+6,l=n.width-r-6,d=l<s?n.width/2:Math.min(Math.max(o,s),l);e.style.setProperty("--x",`${Math.round(d)}px`)}connectedCallback(){super.connectedCallback(),requestAnimationFrame(()=>this.plaats_())}disconnectedCallback(){super.disconnectedCallback(),this.herstel_()}plaats_(){if(!this.isConnected||!this.config)return;if(af(this)){this.setAttribute("in-editor","");return}this.removeAttribute("in-editor");let e=rf(this);this.klapIn_(e);let t=e?.parentElement;t?.classList?.contains?.("card")&&this.klapIn_(t);let n=of(this);n?.config?.cards?.length===1&&this.klapIn_(sf(n));let i=kc(this),r=this.$(".balk");if(i&&r&&!this.viewStijl_){this.view_=i,this.viewStijl_=i.style.paddingBottom??"";let o=Math.round(r.getBoundingClientRect().height)||62;i.style.paddingBottom=`${o+32}px`}this.meetMidden_(),i&&!this.waarnemer_&&(this.waarnemer_=new ResizeObserver(()=>this.meetMidden_()),this.waarnemer_.observe(i))}meetMidden_(){let e=this.view_??kc(this);if(!e)return;let t=e.getBoundingClientRect();t.width&&this.style.setProperty("--dac-nav-mid",`${Math.round(t.left+t.width/2)}px`)}klapIn_(e){e&&(this.ingeklapt_??=new Map,!this.ingeklapt_.has(e)&&(this.ingeklapt_.set(e,e.getAttribute("style")),e.style.position="absolute",e.style.width="0",e.style.height="0",e.style.minHeight="0",e.style.margin="0",e.style.padding="0",e.style.overflow="visible"))}herstel_(){this.waarnemer_?.disconnect(),this.waarnemer_=null;for(let[e,t]of this.ingeklapt_??[])t?e.setAttribute("style",t):e.removeAttribute("style");this.ingeklapt_=null,this.view_&&(this.view_.style.paddingBottom=this.viewStijl_||"",this.view_=null,this.viewStijl_=null)}getCardSize(){return 1}getGridOptions(){return{columns:"full",rows:1,min_rows:1,max_rows:1}}static getConfigElement(){return document.createElement("domotiapp-navbar-card-editor")}static getStubConfig(){return{items:[{name:"Thuis",icon:"house",path:""},{name:"Licht",icon:"bulb",path:""},{name:"Media",icon:"music",path:""},{name:"Instellingen",icon:"cog",path:""}],max:4,labels:!0}}};j(Oa,"css",`
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
      box-shadow: 0 20px 44px -20px rgba(0, 0, 0, calc(.92 * var(--dac-diepte))),
                  0 1px 0 rgba(var(--dac-tint), .04) inset;
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
      box-shadow: 0 24px 52px -20px rgba(0, 0, 0, calc(.94 * var(--dac-diepte)));
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
  `);D("domotiapp-navbar-card",Oa,{name:"DomotiApp Navbalk",description:`Vaste navigatiebalk onderaan het scherm, met een meer-menu voor wat er in de breedte niet bij past. ${2} tot ${6} knoppen in de balk.`});var lf="dac-tabs:";function uo(a){let e=a??{},t=typeof e.name=="string"?e.name:typeof e.title=="string"?e.title:"",n=Array.isArray(e.cards)?e.cards.filter(r=>r&&typeof r=="object"):[],i=n.length?n:e.card&&typeof e.card=="object"?[e.card]:[];return{name:t,icon:typeof e.icon=="string"?e.icon:"",cards:i}}var Ca=a=>!!(a&&(a.name?.trim()||a.icon?.trim()||a.cards?.length));function xc(a){return(Array.isArray(a?.tabs)?a.tabs:[]).slice(0,8).map(uo).filter(Ca)}function df(a,e){if(!e)return 0;let t=Math.round(Number(a?.default_tab));return!Number.isFinite(t)||t<1||t>e?0:t-1}function mo(a){let e=(a??[]).map((t,n)=>(t?.name?.trim()||t?.icon?.trim()||`tab${n}`).toLowerCase()).join("|");return lf+e}function cf(a,e,t){let n=null;try{n=a?.getItem?.(e)??null}catch{return null}let i=Number(n);return n===null||n===""||!Number.isInteger(i)?null:i>=0&&i<t?i:null}function wc(a,e,t){try{return a?.setItem?.(e,String(t)),!0}catch{return!1}}function _c(a,e,t){return cf(t,mo(e),e.length)??df(a,e.length)}var pf=[["tile","Tegel"],["entities","Entiteiten"],["button","Knop"],["gauge","Meter"],["history-graph","Geschiedenis"],["statistic","Statistiek"],["sensor","Sensorgrafiek"],["light","Lamp"],["thermostat","Thermostaat"],["humidifier","Luchtbevochtiger"],["media-control","Mediaspeler"],["weather-forecast","Weersverwachting"],["markdown","Tekst (Markdown)"],["picture","Afbeelding"],["picture-entity","Afbeelding met entiteit"],["glance","Overzicht"],["area","Ruimte"],["alarm-panel","Alarmpaneel"],["calendar","Agenda"],["todo-list","Takenlijst"],["map","Kaart"],["iframe","Webpagina"],["vertical-stack","Stapel (onder elkaar)"],["horizontal-stack","Stapel (naast elkaar)"],["grid","Raster"],["conditional","Voorwaardelijk"]];function yc(){let a=(window.customCards??[]).filter(e=>e&&typeof e.type=="string").map(e=>({type:`custom:${e.type}`,naam:e.name||e.type,uitleg:e.description||"",eigen:!0}));return a.sort((e,t)=>{let n=e.type.startsWith("custom:domotiapp-")?0:1,i=t.type.startsWith("custom:domotiapp-")?0:1;return n-i||e.naam.localeCompare(t.naam,"nl")}),[...a,...pf.map(([e,t])=>({type:e,naam:t,uitleg:"",eigen:!1}))]}function jc(a,e){let t=String(e??"").trim().toLowerCase();return t?a.filter(n=>`${n.naam} ${n.type} ${n.uitleg}`.toLowerCase().includes(t)):a}async function zc(a,e){let t={type:a};try{let n=await window.loadCardHelpers?.();try{n?.createCardElement?.(t)}catch{}let i=a.startsWith("custom:")?a.slice(7):`hui-${a}-card`,o=await customElements.get(i)?.getStubConfig?.(e,Object.keys(e?.states??{}),[]);if(o&&typeof o=="object")return{...o,type:a}}catch{}return t}var $c=()=>!!customElements.get("hui-card-element-editor");function Ec(a,e,t){let n=s=>{if(s==null||s==="")return null;let l=Math.round(Number(s));return Number.isFinite(l)?l:null},i=a,r=n(e),o=n(t);return r!==null&&(i=Math.max(i,r)),o!==null&&(i=Math.min(i,o)),i}function hf(a,e){let t=a?.columns,n=a?.rows,i=12;if(t!=null&&t!=="full"){let s=Math.round(Number(t));i=Number.isFinite(s)?Math.min(12,Math.max(1,s)):12}i=Math.min(12,Math.max(1,Ec(i,e?.min_columns,e?.max_columns)));let r={gridColumn:`span ${i}`},o=Math.round(Number(n));return n!=="auto"&&Number.isFinite(o)&&o>=1&&(r.height=`${Math.max(1,Ec(o,e?.min_rows,e?.max_rows))*64-8}px`),r}function gn(a,e,t){if(!a?.style)return;let{gridColumn:n,height:i}=hf(e,t);a.style.gridColumn=n,a.style.height=i??""}function Ac(a){let e=a?._element??a?.shadowRoot?.firstElementChild??null;if(typeof e?.getGridOptions!="function")return null;try{let t=e.getGridOptions();return t&&typeof t=="object"?t:null}catch{return null}}function Sc(a,e,t={}){let n=Array.isArray(a)?[...a]:[],i=Number(t.index);switch(e){case"verplaats":{let r=Number(t.van),o=Number(t.naar);if(!Number.isInteger(r)||!Number.isInteger(o)||r<0||r>=n.length||o<0||o>=n.length||r===o)return null;let[s]=n.splice(r,1);return n.splice(o,0,s),n}case"dupliceer":return!Number.isInteger(i)||!n[i]?null:(n.splice(i+1,0,structuredClone(n[i])),n);case"verwijder":return!Number.isInteger(i)||!n[i]?null:(n.splice(i,1),n);case"rooster":return!Number.isInteger(i)||!n[i]||!t.rooster?null:(n[i]={...n[i],grid_options:{...n[i].grid_options??{},...t.rooster}},n);default:return null}}var Mc=a=>({...a?{config:a}:{},editMode:!0,saveConfig:async()=>{}}),uf=()=>document.querySelector("home-assistant");function Nc({kaarten:a,hass:e,maakKaart:t,opActie:n}){let i=document.createElement("ha-sortable");i.disabled=!1,i.draggableSelector=".dac-kaart",i.rollback=!1,i.invertSwap=!0,i.options={delay:100,delayOnTouchOnly:!0,direction:"vertical",invertedSwapThreshold:.7};let r=document.createElement("div");r.className="dac-kaarten";let o=[];a.forEach((d,c)=>{let p=t(d,c);if(!p)return;let h=document.createElement("div");h.className="dac-kaart",gn(h,d?.grid_options);let u=document.createElement("hui-card-edit-mode");u.hass=e,u.lovelace=Mc(),u.path=[0,0,c],u.hiddenOverlay=!1,u.appendChild(p),o.push(u),h.appendChild(u),r.appendChild(h)}),i.appendChild(r);let s=d=>{for(let c of o)c.hiddenOverlay=!d};i.addEventListener("drag-start",()=>s(!1)),i.addEventListener("drag-end",()=>s(!0)),i.addEventListener("item-moved",d=>{d.stopPropagation(),n("verplaats",{van:d.detail.oldIndex,naar:d.detail.newIndex})});let l={"ll-edit-card":d=>n("bewerk",{index:d.detail.path[2]}),"ll-duplicate-card":d=>n("dupliceer",{index:d.detail.path[2]}),"ll-delete-card":d=>n("verwijder",{index:d.detail.path[2]}),"ll-copy-card":d=>n("kopieer",{index:d.detail.path[2]}),"ll-change-grid-options":d=>n("rooster",{index:d.detail.path?.[2],rooster:d.detail.gridOptions}),"ll-move-to-section":()=>{}};for(let[d,c]of Object.entries(l))i.addEventListener(d,p=>{p.stopPropagation(),c(p)});return i}function Dc(a){try{let e=typeof structuredClone=="function"?structuredClone(a):JSON.parse(JSON.stringify(a));return sessionStorage.setItem("dashboardCardClipboard",JSON.stringify(e)),!0}catch{return!1}}function Lc({hass:a,kaarten:e}){let t=uf();return!t||!customElements.get("hui-section")?Promise.resolve(null):new Promise(n=>{let i=null,r=null,o=!1,s=()=>{o||(o=!0,t.removeEventListener("show-dialog",l,!0),window.removeEventListener("dialog-closed",d,!0),n(i?{kaart:i}:r?{kaarten:r}:null))},l=u=>{if(u?.detail?.dialogTag!=="hui-dialog-edit-card")return;let m=u.detail?.dialogParams?.cardConfig;u.stopImmediatePropagation?.(),u.stopPropagation(),m&&(i=m);let b=t.querySelector("hui-dialog-create-card");typeof b?.closeDialog=="function"&&b.closeDialog(),setTimeout(s,0)},d=u=>{u?.detail?.dialog==="hui-dialog-create-card"&&setTimeout(s,0)};t.addEventListener("show-dialog",l,!0),window.addEventListener("dialog-closed",d,!0);let c={type:"grid",cards:[...e]},p=document.createElement("hui-section");p.style.display="none",p.hass=a,p.index=0,p.viewIndex=0,p.config=c,p.lovelace={...Mc({views:[{path:"domotiapp-kiezer",title:"DomotiApp",sections:[c]}]}),saveConfig:async u=>{let m=u?.views?.[0]?.sections?.[0]?.cards;Array.isArray(m)&&(r=m)}},t.appendChild(p),(async()=>{try{typeof p._initializeConfig=="function"?await p._initializeConfig():await p.updateComplete;let u=p._layoutElement;if(!u)throw new Error("de proxysectie heeft geen layout-element");u.dispatchEvent(new CustomEvent("ll-create-card",{bubbles:!0,composed:!0}))}catch(u){console.warn("DomotiApp: de kaartkiezer van Home Assistant ging niet open",u),s()}finally{setTimeout(()=>p.remove(),0)}})()})}var Ra=()=>!!(customElements.get("hui-card-edit-mode")&&customElements.get("ha-sortable")&&customElements.get("hui-section"));var mf=`
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
`,Oc=a=>a.filter(Ca).map(e=>({...e.name?{name:e.name}:{},...e.icon?{icon:e.icon}:{},...e.cards?.length?{cards:e.cards.map(t=>structuredClone(t))}:{}}));function It(a){let e=String(a?.type??"").replace(/^custom:/,"");return e?(window.customCards??[]).find(n=>n?.type===e)?.name||e:"een kaart"}function go(a){let e=a.cards?.length??0;return e?e===1?It(a.cards[0]):`${e} kaarten`:"Nog geen kaart"}var fo=class extends HTMLElement{constructor(){super(),this.tabs_=[],this.rest_={},this.open_=new Set}setConfig(e){if(this.rest_={...e},delete this.rest_.tabs,this.gebouwd_&&e===this.uitObject_)return;let t=(Array.isArray(e?.tabs)?e.tabs:[]).map(uo);this.gebouwd_&&JSON.stringify(Oc(t))===this.uit_||(this.tabs_=t,this.build_())}set hass(e){this.hass_=e;for(let t of this.querySelectorAll("ha-form, dac-icon-picker, hui-card-element-editor, hui-card-visibility-editor, hui-card-layout-editor"))t.hass=e;this.gebouwd_||this.build_()}get hass(){return this.hass_}set lovelace(e){this.lovelace_=e;for(let t of this.querySelectorAll("hui-card-element-editor"))t.lovelace=e}get lovelace(){return this.lovelace_}connectedCallback(){this.gebouwd_||this.build_()}async build_(){if(!this.hass_)return;if(await customElements.whenDefined("ha-form"),!this.helpers_)try{this.helpers_=await window.loadCardHelpers?.()}catch{this.helpers_=null}this.gebouwd_=!0,this.replaceChildren(),this.koppen_=[];let e=document.createElement("style");e.textContent=mf;let t=document.createElement("div");t.className="dac-tabs",this.append(e,t),t.appendChild(this.kaartBlok_());let n=document.createElement("div");n.className="lijst",t.appendChild(n),this.tabs_.forEach((r,o)=>n.appendChild(this.tabBlok_(r,o)));let i=document.createElement("button");i.type="button",i.className="toevoegen",i.textContent="\uFF0B  Tabblad toevoegen",i.disabled=this.tabs_.length>=8,i.addEventListener("click",()=>{this.tabs_.push({name:"",icon:"",cards:[]}),this.open_.add(`t${this.tabs_.length-1}`),this.emit_(),this.build_()}),t.appendChild(i)}kaartBlok_(){let e=document.createElement("ha-form");return e.hass=this.hass_,e.schema=[{name:"default_tab",selector:{number:{min:1,max:8,step:1,mode:"box"}}},{name:"alignment",selector:{select:{mode:"dropdown",options:[{value:"vullen",label:"Verdeeld over de breedte"},{value:"links",label:"Links"},{value:"rechts",label:"Rechts"}]}}},{name:"show_names",selector:{boolean:{}}},{name:"bare",selector:{boolean:{}}}],e.computeLabel=t=>({default_tab:"Welk tabblad staat open op een nieuw apparaat",alignment:"Uitlijning van de rij",show_names:"Namen naast de iconen",bare:"Achtergrond weglaten"})[t.name]??t.name,e.computeHelper=t=>{if(t.name==="default_tab")return"Telt vanaf 1. Dit geldt alleen zolang een apparaat nog niets gekozen heeft \u2014 daarna onthoudt elk apparaat zijn eigen tabblad, en dat van je telefoon staat los van dat van de tablet.";if(t.name==="show_names")return"Uit geeft een rij kale iconen. Dan passen er meer naast elkaar op een telefoon.";if(t.name==="bare")return"Haalt het vlak onder de kaart weg. De rij tabbladen houdt zijn eigen pil."},e.data={default_tab:Number(this.rest_.default_tab)||1,alignment:this.rest_.alignment??"vullen",show_names:this.rest_.show_names!==!1,bare:!!this.rest_.bare},e.addEventListener("value-changed",t=>{t.stopPropagation();let n=t.detail.value??{},i=Number(n.default_tab);Number.isFinite(i)&&i>1?this.rest_.default_tab=i:delete this.rest_.default_tab,n.alignment==="links"||n.alignment==="rechts"?this.rest_.alignment=n.alignment:delete this.rest_.alignment,n.show_names===!1?this.rest_.show_names=!1:delete this.rest_.show_names,n.bare?this.rest_.bare=!0:delete this.rest_.bare,this.emit_()}),e}tabBlok_(e,t){let n=document.createElement("details");n.className="tab",this.onthoud_(n,`t${t}`);let i=document.createElement("summary"),r=document.createElement("span");r.className="voor";let o=document.createElement("span");o.className="titel";let s=document.createElement("b"),l=document.createElement("small");o.append(s,l);let d=()=>{n.dataset.leeg=String(!Ca(e)),r.innerHTML=v(e.icon,"grid"),s.textContent=e.name||`Tabblad ${t+1}`,l.textContent=go(e)};d(),this.koppen_.push(d);let c=this.kopKnop_("Omhoog",N.arrowUp,()=>this.verplaats_(t,-1));c.disabled=t===0;let p=this.kopKnop_("Omlaag",N.arrowDown,()=>this.verplaats_(t,1));p.disabled=t===this.tabs_.length-1;let h=this.kopKnop_("Verwijderen",N.close,()=>this.verwijder_(t));h.classList.add("weg"),i.append(r,o,c,p,h),n.appendChild(i);let u=document.createElement("div");u.className="body";let m=document.createElement("dac-icon-picker");m.label="Icoon",m.fallback="grid",m.auto=!1,m.hass=this.hass_,m.value=e.icon,m.addEventListener("value-changed",x=>{x.stopPropagation(),e.icon=x.detail.value??"",this.emit_()});let b=document.createElement("ha-form");return b.hass=this.hass_,b.schema=[{name:"name",selector:{text:{}}}],b.computeLabel=()=>"Naam",b.computeHelper=()=>"Deze naam bepaalt ook onder welke sleutel een apparaat zijn keuze onthoudt. Hernoem je hem, dan begint elk apparaat \xE9\xE9n keer opnieuw bij het eerste tabblad.",b.data={name:e.name},b.addEventListener("value-changed",x=>{x.stopPropagation(),e.name=x.detail.value?.name??"",this.emit_()}),u.append(m,b,this.inhoudBlok_(e,t)),n.appendChild(u),n}inhoudBlok_(e,t){let n=document.createElement("div");if(n.className="kaartvak",Array.isArray(e.cards)||(e.cards=[]),!$c()){let r=document.createElement("div");return r.className="inhoud",r.innerHTML=`${v("grid")}<span>Inhoud: <b>${go(e)}</b> \u2014 aan te passen via Code-editor weergeven.</span>`,n.appendChild(r),n}if(Ra()){let r=document.createElement("div");return r.className="inhoud",r.innerHTML=`${v("grid")}<span>${e.cards.length?`<b>${go(e)}</b> \u2014 te bewerken in het voorbeeld hiernaast: slepen om te verplaatsen, het potlood om te bewerken.`:"Nog geen kaart \u2014 voeg er een toe in het voorbeeld hiernaast."}</span>`,n.appendChild(r),this.bewerkt_?.tab===t&&e.cards[this.bewerkt_.index]&&n.appendChild(this.bewerkVak_(e,t,this.bewerkt_.index)),n}if(e.cards.length){let r=document.createElement("div");r.className="subkop",r.textContent=e.cards.length===1?"Kaart":`${e.cards.length} kaarten`,n.appendChild(r),e.cards.forEach((o,s)=>n.appendChild(this.kaartBlok2_(e,o,t,s)))}if(this.kiest_===`t${t}`)return n.appendChild(this.kiezerBlok_(e,t)),n;let i=document.createElement("button");return i.type="button",i.className="toevoegen",i.textContent="\uFF0B  Kaart toevoegen",i.addEventListener("click",()=>{this.kiest_=`t${t}`,this.zoek_="",this.build_()}),n.appendChild(i),n}uitVoorbeeld(e,t,n){let i=this.tabs_[e];if(i){if(t==="toevoegen"){this.voegToeViaHa_(i,e);return}this.kaartActie_(i,e,t,n)}}toonBewerkVak_(){let e=this.querySelector(".bewerkvak"),t=this.bewerkt_?.tab,n=this.bewerkt_?.index,i=Number.isInteger(t)?this.tabs_[t]:null;if(!i||!i.cards[n]){e?.remove();return}let r=this.bewerkVak_(i,t,n);e?e.replaceWith(r):this.querySelectorAll(".kaartvak")[t]?.appendChild(r),r.scrollIntoView({block:"nearest"})}kaartActie_(e,t,n,i){if(n==="bewerk"){(this.bewerkt_?.tab!==t||this.bewerkt_?.index!==i.index)&&(this.kaartBlad_="config"),this.bewerkt_={tab:t,index:i.index},this.open_.add(`t${t}`);let o=this.querySelectorAll("details.tab")[t];o&&(o.open=!0),this.toonBewerkVak_();return}if(n==="kopieer"){Dc(e.cards[i.index]);return}let r=Sc(e.cards,n,i);r&&(e.cards=r,this.bewerkt_=null,this.emit_(),this.build_())}bewerkVak_(e,t,n){let i=document.createElement("div");i.className="bewerkvak";let r=document.createElement("div");r.className="kop";let o=document.createElement("b");o.textContent=It(e.cards[n]);let s=document.createElement("button");s.type="button",s.textContent="Klaar",s.addEventListener("click",()=>{this.bewerkt_=null,this.build_()}),r.append(o,s);let l=document.createElement("div");l.className="body";let d=this.kaartTabbladen_(e,t,n,l,o);d&&i.append(r,d,l);let c=document.createElement("hui-card-element-editor");return c.hass=this.hass_,this.lovelace_&&(c.lovelace=this.lovelace_),c.value=e.cards[n],c.addEventListener("config-changed",p=>{p.stopPropagation();let h=p.detail?.config;h&&(e.cards[n]=h,this.emit_(),o.textContent=It(h))}),c.addEventListener("GUImode-changed",p=>p.stopPropagation()),this.kaartEditor_=c,l.appendChild(c),d||i.append(r,l),i}kaartTabbladen_(e,t,n,i,r){let o=!!customElements.get("hui-card-visibility-editor"),s=!!customElements.get("hui-card-layout-editor");if(!o&&!s)return null;let l=document.createElement("div");l.className="kaarttabs";let d=[{id:"config",naam:"Configuratie"},...o?[{id:"zicht",naam:"Zichtbaarheid"}]:[],...s?[{id:"indeling",naam:"Indeling"}]:[]],c=h=>{this.kaartBlad_=h;for(let u of l.querySelectorAll("button"))u.setAttribute("aria-selected",String(u.dataset.blad===h));i.replaceChildren(this.bladInhoud_(h,e,t,n,r))};for(let h of d){let u=document.createElement("button");u.type="button",u.dataset.blad=h.id,u.textContent=h.naam,u.setAttribute("role","tab"),u.setAttribute("aria-selected","false"),u.addEventListener("click",()=>c(h.id)),l.appendChild(u)}let p=d.some(h=>h.id===this.kaartBlad_)?this.kaartBlad_:"config";return setTimeout(()=>c(p),0),l}bladInhoud_(e,t,n,i,r){if(e==="config")return this.kaartEditor_;let o=document.createElement(e==="zicht"?"hui-card-visibility-editor":"hui-card-layout-editor");return o.hass=this.hass_,o.config=t.cards[i],e==="indeling"&&(o.sectionConfig={type:"grid",column_span:1}),o.addEventListener("value-changed",s=>{s.stopPropagation();let l=s.detail?.value;l&&(t.cards[i]=l,o.config=l,this.emit_(),r.textContent=It(l))}),o}async voegToeViaHa_(e,t){let n=await Lc({hass:this.hass_,kaarten:e.cards});n&&(n.kaarten?(e.cards=n.kaarten,this.bewerkt_=null):(e.cards.push(n.kaart),this.bewerkt_={tab:t,index:e.cards.length-1}),this.open_.add(`t${t}`),this.emit_(),this.build_())}kaartBlok2_(e,t,n,i){let r=document.createElement("details");r.className="sub",this.onthoud_(r,`t${n}k${i}`);let o=document.createElement("summary"),s=document.createElement("span");s.className="voor",s.innerHTML=v("grid");let l=document.createElement("span");l.className="titel";let d=document.createElement("b");d.textContent=It(t);let c=document.createElement("small");c.textContent=String(t?.type??""),l.append(d,c);let p=this.kopKnop_("Omhoog",N.arrowUp,()=>this.verplaatsKaart_(e,n,i,-1));p.disabled=i===0;let h=this.kopKnop_("Omlaag",N.arrowDown,()=>this.verplaatsKaart_(e,n,i,1));h.disabled=i===e.cards.length-1;let u=this.kopKnop_("Verwijderen",N.close,()=>this.verwijderKaart_(e,n,i));u.classList.add("weg"),o.append(s,l,p,h,u),r.appendChild(o);let m=document.createElement("div");m.className="body";let b=document.createElement("hui-card-element-editor");return b.hass=this.hass_,this.lovelace_&&(b.lovelace=this.lovelace_),b.value=t,b.addEventListener("config-changed",x=>{x.stopPropagation();let w=x.detail?.config;w&&(e.cards[i]=w,this.emit_(),d.textContent=It(w),c.textContent=String(w.type??""))}),b.addEventListener("GUImode-changed",x=>x.stopPropagation()),m.appendChild(b),r.appendChild(m),r}verplaatsKaart_(e,t,n,i){let r=n+i;if(r<0||r>=e.cards.length)return;[e.cards[n],e.cards[r]]=[e.cards[r],e.cards[n]];let o=this.open_.has(`t${t}k${n}`),s=this.open_.has(`t${t}k${r}`);this.open_.delete(`t${t}k${n}`),this.open_.delete(`t${t}k${r}`),s&&this.open_.add(`t${t}k${n}`),o&&this.open_.add(`t${t}k${r}`),this.emit_(),this.build_()}verwijderKaart_(e,t,n){e.cards.splice(n,1);let i=new Set;for(let r of this.open_){let o=new RegExp(`^t${t}k(\\d+)$`).exec(r);if(!o){i.add(r);continue}let s=Number(o[1]);s!==n&&i.add(`t${t}k${s>n?s-1:s}`)}this.open_=i,this.emit_(),this.build_()}kiezerBlok_(e,t){let n=document.createElement("div");n.className="kiezer";let i=document.createElement("input");i.type="text",i.placeholder="Zoek een kaart...",i.value=this.zoek_??"";let r=document.createElement("div");r.className="soorten";let o=()=>{let l=jc(yc(),this.zoek_);if(r.replaceChildren(),!l.length){let d=document.createElement("p");d.className="leeg",d.textContent="Niets gevonden. Kies iets anders, of gebruik de code-editor.",r.appendChild(d);return}for(let d of l){let c=document.createElement("button");c.type="button",c.className="soort";let p=document.createElement("b");p.textContent=d.naam;let h=document.createElement("small");h.textContent=d.uitleg||d.type,c.append(p,h),c.addEventListener("click",async()=>{e.cards.push(await zc(d.type,this.hass_)),this.kiest_=null,this.open_.add(`t${t}`),this.open_.add(`t${t}k${e.cards.length-1}`),this.emit_(),this.build_()}),r.appendChild(c)}};o(),i.addEventListener("input",()=>{this.zoek_=i.value,o()});let s=document.createElement("button");return s.type="button",s.className="toevoegen",s.textContent="Annuleren",s.addEventListener("click",()=>{this.kiest_=null,this.build_()}),n.append(i,r,s),n}kopKnop_(e,t,n){let i=document.createElement("button");return i.type="button",i.className="rondknop",i.title=e,i.setAttribute("aria-label",e),i.innerHTML=t,i.addEventListener("click",r=>{r.preventDefault(),r.stopPropagation(),i.disabled||n()}),i}verplaats_(e,t){let n=e+t;if(n<0||n>=this.tabs_.length)return;[this.tabs_[e],this.tabs_[n]]=[this.tabs_[n],this.tabs_[e]];let i=this.open_.has(`t${e}`),r=this.open_.has(`t${n}`);this.open_.delete(`t${e}`),this.open_.delete(`t${n}`),r&&this.open_.add(`t${e}`),i&&this.open_.add(`t${n}`),this.emit_(),this.build_()}verwijder_(e){this.tabs_.splice(e,1);let t=new Set;for(let n of this.open_){let i=Number(n.slice(1));i!==e&&t.add(`t${i>e?i-1:i}`)}this.open_=t,this.emit_(),this.build_()}onthoud_(e,t){e.open=this.open_.has(t),e.addEventListener("toggle",()=>{e.open?this.open_.add(t):this.open_.delete(t)})}emit_(){let e=Oc(this.tabs_),t={...this.rest_,tabs:e};this.uit_=JSON.stringify(e),this.uitObject_=t;for(let n of this.koppen_??[])n();this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}};H("domotiapp-tabs-card-editor",fo);var Cc=a=>a.parentElement??(a.parentNode&&a.parentNode.host)??null;function*Hc(a){let e=Cc(a),t=0;for(;e&&t++<40;)yield e,e=Cc(e)}function Rc(a){let e=null;for(let n of Hc(a))if((n.tagName?.toLowerCase?.()??"")==="hui-dialog-edit-card"){e=n;break}if(!e)return null;let t=(n,i=0)=>{if(!n||i>25)return null;if(n.tagName?.toLowerCase?.()==="domotiapp-tabs-card-editor")return n;for(let r of n.children??[]){let o=t(r,i+1);if(o)return o}if(n.shadowRoot)for(let r of n.shadowRoot.children){let o=t(r,i+1);if(o)return o}return null};return t(e)}var Ia=class extends S{constructor(){super(),this.kinderen_=new Map,this.open_=0}validate(e){let t=xc(e),n={tone:"accent",...e,tabs:t};return t.length||(n[C]="Voeg tabbladen toe: elk met een naam, een icoon en een kaart erin."),n}watched(){return[]}setConfig(e){this.kinderen_.clear(),super.setConfig(e)}set hass(e){super.hass=e;for(let t of this.kinderen_.values())if(t)for(let n of t)n&&(n.hass=e);this.herijkIndeling_()}get hass(){return super.hass}template(){let e=this.config;e.bare&&this.setAttribute("bare",""),e.show_names===!1&&this.setAttribute("geen-namen",""),(e.alignment==="links"||e.alignment==="rechts")&&this.setAttribute("uitgelijnd",e.alignment);let t=e.tabs.map((i,r)=>`
        <button type="button" class="tab" role="tab" data-i="${r}" aria-selected="false"
                title="${_(i.name)}">
          ${i.icon?`<span class="ic">${v(i.icon,"grid")}</span>`:""}
          <span class="nm">${_(i.name||`Tab ${r+1}`)}</span>
        </button>`).join(""),n=e.tabs.map((i,r)=>`<div class="vak" data-i="${r}" role="tabpanel"></div>`).join("");return`
      <div class="card surface" style="--tone:${ee(e.tone)}">
        <div class="balk" role="tablist">${t}</div>
        <div class="vakken">${n}</div>
      </div>`}wire(){for(let e of this.$$(".tab"))this.on(e,"click",()=>this.kies_(Number(e.dataset.i)));this.teardown_.push(V(this.$(".card"))),this.kies_(_c(this.config,this.config.tabs,this.opslag_()),!1)}paint(){}opslag_(){try{return window.localStorage}catch{return null}}kies_(e,t=!0){let n=this.config.tabs;if(!n.length)return;let i=Math.min(Math.max(0,e),n.length-1);this.open_=i;for(let r of this.$$(".tab"))r.setAttribute("aria-selected",String(Number(r.dataset.i)===i));for(let r of this.$$(".vak"))r.dataset.open=String(Number(r.dataset.i)===i);t&&wc(this.opslag_(),mo(n),i),this.bouw_(i)}async bouw_(e){if(this.kinderen_.has(e)){R(this.$(".card"));return}let t=this.$(`.vak[data-i="${e}"]`),n=this.config.tabs[e];if(!(!t||!n)){if(!n.cards.length){let i=document.createElement("div");i.className="leeg",i.textContent="Deze tab heeft nog geen kaart.",t.replaceChildren(i),R(this.$(".card")),this.knopLater_(e);return}this.kinderen_.set(e,null);try{if(!await window.loadCardHelpers?.())throw new Error("loadCardHelpers ontbreekt");let r=Rc(this),o=!!r,s=n.cards.map(l=>{let d=document.createElement("hui-card");return d.hass=this.hass,d.preview=o,d.config=l,gn(d,l?.grid_options),d.addEventListener("card-updated",c=>{c.stopPropagation(),this.herijkIndeling_()}),d});if(this.kinderen_.set(e,s),r&&Ra()){t.replaceChildren(Nc({hass:this.hass,kaarten:n.cards,maakKaart:(l,d)=>s[d]??null,opActie:(l,d)=>r.uitVoorbeeld?.(e,l,d)}),this.voegToeKnop_(e)),R(this.$(".card"));return}t.replaceChildren(...s),R(this.$(".card")),this.herijkIndeling_()}catch(i){this.kinderen_.delete(e),t.innerHTML=`<div class="leeg">Deze kaart kon niet geladen worden: ${_(i?.message??i)}</div>`,R(this.$(".card"))}}}herijkIndeling_(e=3){let t=!1;for(let[n,i]of this.kinderen_.entries()){if(!i)continue;let r=this.config?.tabs?.[n]?.cards??[];i.forEach((o,s)=>{let l=Ac(o);l&&(t=!0),gn(o,r[s]?.grid_options,l)})}!t&&e>0&&requestAnimationFrame(()=>this.herijkIndeling_(e-1))}knopLater_(e,t=60){let n=this.$(`.vak[data-i="${e}"]`);if(!n||n.querySelector(".voegtoe")||this.config?.tabs?.[e]?.cards?.length)return;if(this.inVoorbeeld_()){n.appendChild(this.voegToeKnop_(e)),R(this.$(".card"));return}if(t<=0)return;let i=setTimeout(()=>this.knopLater_(e,t-1),50);this.teardown_.push(()=>clearTimeout(i))}inVoorbeeld_(){for(let e of Hc(this))if(e.tagName?.toLowerCase?.()==="hui-dialog-edit-card")return!0;return!1}voegToeKnop_(e){let t=document.createElement("button");return t.type="button",t.className="voegtoe",t.textContent="\uFF0B  Kaart toevoegen",t.addEventListener("click",n=>{n.stopPropagation(),Rc(this)?.uitVoorbeeld?.(e,"toevoegen",{})}),t}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-tabs-card-editor")}static getStubConfig(){return{tabs:[{name:"Woning",icon:"house",card:null},{name:"Weer",icon:"cloudSun",card:null}]}}};j(Ia,"css",`
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
  `);D("domotiapp-tabs-card",Ia,{name:"DomotiApp Tabbladen",description:"Meerdere kaarten achter tabbladen, met een rij knoppen erboven. De gekozen tab wordt per apparaat onthouden."});var Y={UIT:"uit",KLAAR:"klaar",UITGESTELD:"uitgesteld",DRAAIT:"draait",PAUZE:"pauze",AF:"af",FOUT:"fout",ONBEKEND:"onbekend"},gf=[[Y.FOUT,["error","fout","aborting","afgebroken"]],[Y.DRAAIT,["run","active","washing","drying","rinsing","bezig","draait","on"]],[Y.PAUZE,["pause","paused","pauze","onderbroken"]],[Y.UITGESTELD,["delayedstart","delayed","scheduled","uitgesteld","wachten"]],[Y.AF,["finished","complete","done","klaar met","afgelopen"]],[Y.KLAAR,["ready","idle","standby","klaar","gereed"]],[Y.UIT,["off","inactive","uit"]]],ff=new Set([Y.DRAAIT]);function Kc(a){let e=String(a??"").toLowerCase().trim();if(!e||e==="unknown"||e==="unavailable")return Y.ONBEKEND;let t=e.split(/[^a-z0-9]+/).filter(Boolean);for(let[n,i]of gf)for(let r of i)if(r.includes(" ")?e.includes(r):t.includes(r))return n;return Y.ONBEKEND}var Gc=a=>ff.has(Kc(a?.state));function Wc(a,e=new Date){if(!a)return null;let t=String(a.state??"").trim();if(!t||t==="unknown"||t==="unavailable")return null;let n=a.attributes??{};if(n.device_class==="timestamp"||/^\d{4}-\d{2}-\d{2}[T ]/.test(t)){let s=new Date(t);return Number.isNaN(+s)?null:Math.max(0,Math.round((s-e)/6e4))}let i=t.match(/^(\d{1,3}):(\d{2})(?::(\d{2}))?$/);if(i)return Number(i[1])*60+Number(i[2])+(i[3]?Math.round(Number(i[3])/60):0);let r=Number(t);if(!Number.isFinite(r))return null;let o=String(n.unit_of_measurement??"min").toLowerCase();return o.startsWith("s")?Math.round(r/60):o.startsWith("h")||o.startsWith("u")?Math.round(r*60):Math.round(r)}function Ic(a){if(a==null)return"";if(a<=0)return"Klaar";if(a<60)return`nog ${a} min`;let e=Math.floor(a/60),t=a%60;return t?`nog ${e} u ${t} min`:`nog ${e} uur`}function Uc(a){if(!a)return null;let e=String(a.state??"").trim();if(!e||e==="unknown"||e==="unavailable")return null;let t=Number(e);return Number.isFinite(t)?Math.min(100,Math.max(0,Math.round(t))):null}var bf=a=>!!a&&a.state==="on",Vc=6e4;function Bc(a){let e=String(a??"").trim().match(/^(\d{4}-\d{2}-\d{2})[T ](\d{1,2}:\d{2}.*)$/);if(!e)return null;let t=new Date(`${e[1]}T${e[2].padStart(5,"0")}`);return Number.isNaN(+t)?null:t}function Fc(a,e=new Date){if(!a)return null;let t=String(a.state??"").trim();if(!t||t==="unknown"||t==="unavailable")return null;let n=s=>+s<+e-Vc?null:s,i=Bc(a.attributes?.start);if(i)return n(i);if(/^(nu|now)$/i.test(t))return new Date(+e);let r=Bc(t);if(r)return n(r);let o=t.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);if(o){let s=Number(o[1]),l=Number(o[2]);if(s>23||l>59)return null;let d=new Date(e.getFullYear(),e.getMonth(),e.getDate(),s,l);return+d<+e-Vc&&d.setDate(d.getDate()+1),d}return null}var vf=["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],kf=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"],xf=(a,e)=>Math.round((new Date(e.getFullYear(),e.getMonth(),e.getDate())-new Date(a.getFullYear(),a.getMonth(),a.getDate()))/864e5);function Pc(a,e=new Date){if(!a)return"";if(+a<=+e)return"Start nu";let t=`${String(a.getHours()).padStart(2,"0")}:${String(a.getMinutes()).padStart(2,"0")}`,n=xf(e,a);return n<=0?`Start om ${t}`:n===1?`Start morgen om ${t}`:n<7?`Start ${vf[a.getDay()]} om ${t}`:`Start ${a.getDate()} ${kf[a.getMonth()]} om ${t}`}function qc(a,e){return!a||!e?"":Object.keys(a).filter(n=>n.startsWith("sensor.")&&a[n]?.attributes?.release_switch===e).sort()[0]??""}var Zc=a=>a===Y.DRAAIT||a===Y.PAUZE||a===Y.UITGESTELD;function Yc({status:a,deur:e,rest:t,pct:n,start:i=null,nu:r=new Date}={}){let o=Kc(a?.state),s=bf(e);if(o===Y.DRAAIT){let l=[];return t!=null?l.push(Ic(t)):n!=null&&l.push(`${n}%`),{soort:o,tekst:l.length?`Draait \xB7 ${l.join(" ")}`:"Draait",tone:"accent",waarschuwing:""}}if(o===Y.PAUZE)return{soort:o,tekst:"Gepauzeerd",tone:"warn",waarschuwing:s?"Klep open":""};if(o===Y.FOUT)return{soort:o,tekst:"Storing",tone:"bad",waarschuwing:s?"Klep open":""};if(o===Y.AF)return{soort:o,tekst:"Programma klaar",tone:"good",waarschuwing:""};if(o===Y.UITGESTELD){let l="Uitgestelde start";return i?l=Pc(i,r):t!=null&&(l=`Start over ${Ic(t).replace(/^nog /,"")}`),{soort:o,tekst:l,tone:"accent",waarschuwing:s?"Klep open":""}}return i&&(o===Y.KLAAR||o===Y.UIT)?{soort:o,tekst:Pc(i,r),tone:"accent",waarschuwing:s?"Klep open":""}:s?{soort:o,tekst:"Klep open",tone:"warn",waarschuwing:""}:o===Y.UIT?{soort:o,tekst:"Uit",tone:"neutral",waarschuwing:""}:o===Y.KLAAR?{soort:o,tekst:"Klaar om te starten",tone:"neutral",waarschuwing:""}:{soort:Y.ONBEKEND,tekst:"Niet bereikbaar",tone:"neutral",waarschuwing:""}}function Xc(a){let e=String(a??"");switch(e.split(".")[0]){case"button":return["button","press",{entity_id:e}];case"input_button":return["input_button","press",{entity_id:e}];case"script":return["script","turn_on",{entity_id:e}];case"scene":return["scene","turn_on",{entity_id:e}];case"switch":case"input_boolean":return["homeassistant","turn_on",{entity_id:e}];case"automation":return["automation","trigger",{entity_id:e}];default:return null}}var wf={good:E.good,warn:E.warn,bad:E.bad,neutral:E.neutral,accent:E.accent},Va=class extends S{validate(e){let t={name:"",icon:"dishwasher",...e};return!t.status&&!t.remaining&&!t.progress&&!t.program&&(t[C]="Kies minstens een statussensor. Resterende tijd, voortgang, programma en de knoppen mogen daarna."),t}watched(){return[this.config.status,this.config.remaining,this.startSensor_(),this.config.progress,this.config.program,this.config.door,this.config.smart,this.config.start,this.config.stop].filter(Boolean)}template(){this.config.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size";let t=(n,i,r)=>`
      <button type="button" class="knop ${n}" hidden>
        ${v(i)}<span class="lb">${_(r)}</span>
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
      </div>`}wire(){let e=this.config;this.on(this.$(".top"),"click",()=>{let t=e.status||e.remaining||e.program;t&&this.moreInfo_(t)}),this.on(this.$(".knop.start"),"click",()=>this.druk_(e.start)),this.on(this.$(".knop.stop"),"click",()=>this.druk_(e.stop)),this.on(this.$(".knop.slim"),"click",()=>{if(!e.smart)return;let t=Z(k(this.hass,e.smart));this.hass.callService("homeassistant",t?"turn_off":"turn_on",{entity_id:e.smart})}),this.on(this.$(".rij.programma"),"change",t=>{let n=t.target?.closest?.(".keuze");if(!n||!e.program)return;t.stopPropagation();let i=Tt(e.program,n.value,$e(k(this.hass,e.program)));i&&this.hass.callService(i[0],i[1],i[2])}),this.teardown_.push(V(this.$(".card"))),this.teardown_.push(()=>{clearTimeout(this.tik_),this.tik_=null})}startSensor_(){let e=this.config;if(e?.planned_start)return e.planned_start;let t=this.hass_?.states;if(!e?.smart||!t)return"";if(this.gevonden_&&t[this.gevonden_]?.attributes?.release_switch===e.smart)return this.gevonden_;let n=Date.now();return this.gezochtVoor_===e.smart&&n-this.gezochtOm_<3e4?this.gevonden_:(this.gezochtVoor_=e.smart,this.gezochtOm_=n,this.gevonden_=qc(t,e.smart),this.gevonden_)}planTik_(e){if(clearTimeout(this.tik_),this.tik_=null,!e)return;let t=new Date,n=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1,0,0,1),i=Math.min(+n,+e+61e3)-+t;this.tik_=setTimeout(()=>{this.tik_=null,this.hass_&&this.isConnected&&this.paint()},Math.max(1e3,Math.min(i,36e5)))}moreInfo_(e){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0}))}druk_(e){let t=Xc(e);t&&this.hass.callService(t[0],t[1],t[2])}paint(){let e=this.config,t=k(this.hass,e.status),n=k(this.hass,e.door),i=Wc(k(this.hass,e.remaining)),r=Uc(k(this.hass,e.progress)),o=Fc(k(this.hass,this.startSensor_())),s=Yc({status:t,deur:n,rest:i,pct:r,start:o});this.planTik_(o);let l=Gc(t);this.toggleAttribute("draait",l),this.toggleAttribute("onbekend",l&&r==null);let d=this.$(".top"),c=wf[s.tone]??E.accent;this.$(".card").style.setProperty("--tone",c),d.classList.toggle("unavailable",s.soort==="onbekend");let p=this.$(".chip"),h=e.icon||"dishwasher";p.dataset.icon!==h&&(p.dataset.icon=h,p.innerHTML=v(h,"dishwasher")),p.style.setProperty("--tone",c),this.text(".nm",e.name||M(this.hass,e.status,null)||"Vaatwasser");let u=this.$(".st"),m=_(s.tekst),b=s.waarschuwing?` &middot; <span class="let">${_(s.waarschuwing)}</span>`:"";u.dataset.tekst!==m+b&&(u.dataset.tekst=m+b,u.innerHTML=m+b),d.setAttribute("aria-label",`${this.$(".nm").textContent}, ${s.tekst}`);let x=this.$(".balk"),w=Zc(s.soort)&&(r!=null||l);if(x.hidden=!w,w){let y=this.$(".vul"),$=r!=null?`${r}%`:"";$&&y.style.width!==$&&(y.style.width=$),x.setAttribute("role","progressbar"),r!=null?(x.setAttribute("aria-valuenow",String(r)),x.setAttribute("aria-valuemin","0"),x.setAttribute("aria-valuemax","100")):x.removeAttribute("aria-valuenow")}this.paintBediening_(),R(this.$(".card"))}paintBediening_(){let e=this.config,t=this.$(".programslot"),n=k(this.hass,e.program),i=e.program?$e(n):[],r=i.map(d=>ua(d,this.hass?.formatEntityState?.(n,d))),o=JSON.stringify([i,r]);t.dataset.opties!==o&&(t.dataset.opties=o,t.innerHTML=i.length?`<select class="keuze" aria-label="Programma">${i.map((d,c)=>`<option value="${_(d)}">${_(r[c])}</option>`).join("")}</select>`:"");let s=t.querySelector(".keuze");if(s&&this.shadowRoot.activeElement!==s){let d=Lt(n);s.value!==d&&(s.value=d)}let l=this.$(".knop.slim");l.hidden=!e.smart,e.smart&&(l.dataset.aan=String(Z(k(this.hass,e.smart)))),this.$(".knop.start").hidden=!e.start,this.$(".knop.stop").hidden=!e.stop,this.$(".rij.programma").hidden=!s,this.$(".rij.knoppen").hidden=!e.smart&&!e.start&&!e.stop}getCardSize(){return 3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-dishwasher-card-editor")}static getStubConfig(e,t){return{status:((i,r)=>t?.find(o=>o.startsWith(i)&&r.test(o))??"")("sensor.",/vaatwas|dishwash/i),name:"Vaatwasser"}}};j(Va,"css",`
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
      color: var(--dac-ink); color-scheme: var(--dac-scheme);
      background-color: var(--dac-bg-raise);
      border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill);
      padding: 7px 10px; cursor: pointer;
      text-overflow: ellipsis;
    }
    @media (hover: hover) { .keuze:hover { border-color: var(--dac-border-hi); } }
    .keuze:focus-visible { outline: 2px solid var(--tone); outline-offset: 1px; }
    .keuze option { background-color: var(--dac-bg-raise); color: var(--dac-ink); }
    .keuze option:checked { background-color: var(--dac-accent); color: var(--dac-on-accent); }

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
  `);var bo=class extends L{defaults(){return{icon:"dishwasher"}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"dishwasher",auto:!1}]}schema(){return[{name:"name",selector:f.text()},{name:"status",selector:f.entity(["sensor","binary_sensor"])},{name:"remaining",selector:f.entity(["sensor"])},{name:"planned_start",selector:f.entity(["sensor","input_datetime","datetime","time"])},{name:"progress",selector:f.entity(["sensor","number"])},{name:"program",selector:f.entity(["select","input_select"])},{name:"start",selector:f.entity(["button","input_button","script","switch","automation"])},{name:"stop",selector:f.entity(["button","input_button","script","switch","automation"])},{name:"door",selector:f.entity(["binary_sensor"])},{name:"smart",selector:f.entity(["input_boolean","switch"])}]}label(e){return{name:"Naam",status:"Statussensor",remaining:"Resterende tijd",planned_start:"Geplande start",progress:"Voortgang (0-100%)",program:"Programmakeuze",start:"Start / pauze",stop:"Stop",door:"Klep- of deursensor",smart:"Slimme sturing"}[e.name]??super.label(e)}helper(e){return{status:"De sensor die Run, Ready, Finished of iets in die geest meldt. De kaart vertaalt dat zelf.",remaining:"Een tijdstip, een aantal minuten of een klok als 1:24:00 \u2014 alle drie worden gelezen. Een tijdstip is het moment waarop hij klaar is, geen duur.",planned_start:"Het moment waarop een energiebeheerder hem straks start. Op de kaart staat dan 'Start om 14:00'. Leeg laten: de kaart zoekt zelf de sensor van DomotiApp Coach bij de schakelaar onder Slimme sturing.",progress:"Zonder deze sensor is er geen stand, en schuift er een streepje heen en weer zolang hij draait.",program:"Een keuzelijst met de programma's. Verschijnt als uitklaplijst op de kaart.",start:"Een knop, een script of een schakelaar \u2014 de kaart kiest zelf de juiste service.",stop:"Idem. Deze knop is rood, want hij onderbreekt iets dat loopt.",door:"Staat de klep open, dan zegt de kaart dat in plaats van 'klaar om te starten'.",smart:"De input_boolean van je eigen slimme sturing. De knop licht op als hij aanstaat."}[e.name]}};O("domotiapp-dishwasher-card-editor",bo);D("domotiapp-dishwasher-card",Va,{name:"DomotiApp Vaatwasser",description:"Status, resterende tijd met voortgangsbalk, programmakeuze en de knoppen \u2014 met een balk die loopt zolang hij draait."});var _f=`
  ${U}
  :host {
    ${W}
    position: fixed; inset: 0; z-index: 9999;
    display: none; font-family: var(--dac-font); color: var(--dac-ink);
  }
  :host([open]) { display: block; }
  /* Zonder deze regel telt de padding niet mee in de breedte, en loopt het vak
     op een telefoon over de schermranden (valkuil 29). */
  *, *::before, *::after { box-sizing: border-box; }
  [hidden] { display: none !important; }

  .laag {
    position: absolute; inset: 0;
    display: grid; place-items: center;
    padding:
      max(24px, env(safe-area-inset-top))
      max(16px, env(safe-area-inset-right))
      max(24px, env(safe-area-inset-bottom))
      max(16px, env(safe-area-inset-left));
    background: var(--dac-scrim);
    animation: op 140ms ease;
  }
  @keyframes op { from { opacity: 0 } to { opacity: 1 } }

  .vak {
    width: min(380px, 100%);
    max-height: 100%; overflow-y: auto;
    padding: 14px 14px 16px;
    border-radius: var(--dac-radius);
    background: var(--dac-bg-raise);
    border: 1px solid var(--dac-border);
    box-shadow: 0 24px 60px -20px rgba(0,0,0,calc(.7 * var(--dac-diepte)));
    display: flex; flex-direction: column; gap: 12px;
    animation: omhoog 160ms ease;
  }
  @keyframes omhoog { from { transform: translateY(8px); opacity: 0 } to { transform: none; opacity: 1 } }

  header { display: flex; align-items: center; gap: 12px; }
  .foto {
    width: 44px; height: 44px; flex: 0 0 auto; border-radius: 50%; overflow: hidden;
    display: grid; place-items: center;
    background: var(--dac-surface); border: 1px solid var(--dac-border); color: var(--dac-ink-2);
  }
  .foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .foto .icon { width: 22px; height: 22px; }
  .wie { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
  .wie b {
    font-size: 15.5px; font-weight: 600; letter-spacing: -.01em;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .wie span { font-size: 12px; color: var(--dac-ink-2); }

  .sluit {
    flex: 0 0 auto; width: 36px; height: 36px; padding: 0; cursor: pointer;
    display: grid; place-items: center; border-radius: var(--dac-radius-pill);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    color: var(--dac-ink-2); font: inherit;
  }
  @media (hover: hover) { .sluit:hover { background: var(--dac-surface-hi); color: var(--dac-ink); } }
  .sluit .icon { width: 17px; height: 17px; }

  /* Een storing en geen status: zonder telefoon krijgt deze persoon niets, hoe
     de vinkjes ook staan. Dat staat er dus altijd, en in de kleur van "let op". */
  .storing {
    font-size: 12.5px; line-height: 1.4; color: var(--dac-warn);
    padding: 9px 12px; border-radius: 12px;
    background: color-mix(in srgb, var(--dac-warn) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--dac-warn) 30%, transparent);
  }

  .lijst { display: flex; flex-direction: column; gap: 8px; }

  /* Een regel per soort. Een div met role=checkbox en geen <button>: in een
     button is een tekst van twee regels geen echte flexcontainer (valkuil 43). */
  .soort {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; min-height: 58px; cursor: pointer;
    border-radius: 14px; background: var(--dac-surface); border: 1px solid var(--dac-border);
    -webkit-tap-highlight-color: transparent;
    transition: background 160ms ease, border-color 160ms ease;
  }
  @media (hover: hover) { .soort:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); } }
  .soort[aria-disabled="true"] { cursor: default; opacity: .55; }

  .soort .ico {
    width: 36px; height: 36px; flex: 0 0 auto; display: grid; place-items: center;
    border-radius: 50%; color: var(--dac-ink-3);
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    transition: color 160ms ease, border-color 160ms ease;
  }
  .soort .ico .icon { width: 18px; height: 18px; }
  /* Alleen het icoon draagt de toestand -- zelfde regel als op de kaarten. */
  .soort[aria-checked="true"] .ico {
    color: var(--dac-accent-hi);
    border-color: color-mix(in srgb, var(--dac-accent-hi) 45%, transparent);
  }

  .soort .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; gap: 2px; }
  .soort .nm { font-size: 14px; font-weight: 500; line-height: 1.25; }
  .soort .rg { font-size: 12px; line-height: 1.3; color: var(--dac-ink-2); }

  /* Het vinkje. */
  .vink {
    width: 24px; height: 24px; flex: 0 0 auto; display: grid; place-items: center;
    border-radius: 7px; border: 1.5px solid var(--dac-ink-3); color: transparent;
    transition: background 160ms ease, border-color 160ms ease, color 160ms ease;
  }
  .vink .icon { width: 16px; height: 16px; }
  .soort[aria-checked="true"] .vink {
    background: var(--dac-accent-hi); border-color: var(--dac-accent-hi); color: var(--dac-on-accent-hi);
  }

  .leeg { font-size: 13px; line-height: 1.45; color: var(--dac-ink-2); padding: 4px 2px; }

  /* De proef: een gewone knop, rustiger dan een vinkje, want hij verandert
     niets aan wat iemand krijgt. */
  .proef { display: flex; flex-direction: column; gap: 6px; }
  .proef button {
    min-height: 40px; padding: 0 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    border-radius: 12px; font: inherit; font-size: 13px; font-weight: 500;
    background: var(--dac-surface); border: 1px solid var(--dac-border); color: var(--dac-ink-2);
    -webkit-tap-highlight-color: transparent;
  }
  @media (hover: hover) {
    .proef button:hover:not(:disabled) { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); color: var(--dac-ink); }
  }
  .proef button:disabled { cursor: default; opacity: .55; }
  .proef button .icon { width: 16px; height: 16px; }
  .proef .uit { font-size: 12px; line-height: 1.4; color: var(--dac-ink-2); text-align: center; }
  .proef .uit[data-soort="fout"] { color: var(--dac-warn); }

  :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  .vak:focus, .vak:focus-visible { outline: none; }
  @media (prefers-reduced-motion: reduce) {
    .laag, .vak { animation: none; }
  }
`,vo=null,ko=a=>String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),xo=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),vo=vo??[Q(_f)],this.shadowRoot.adoptedStyleSheets=vo,this.bron=null,this.persoon=null}connectedCallback(){this.gebouwd_||this.bouw_()}bouw_(){this.shadowRoot.innerHTML=`
      <div class="laag">
        <div class="vak" role="dialog" aria-modal="true" aria-labelledby="wie" tabindex="-1">
          <header>
            <span class="foto"></span>
            <span class="wie"><b id="wie"></b><span>Meldingen op de telefoon</span></span>
            <button class="sluit" type="button" aria-label="Sluiten">${v("close")}</button>
          </header>
          <div class="storing" hidden></div>
          <div class="lijst"></div>
          <div class="proef" hidden>
            <button type="button">${v("bell")}<span>Stuur een proefmelding</span></button>
            <div class="uit" role="status"></div>
          </div>
        </div>
      </div>`,this.gebouwd_=!0,this.$(".sluit").addEventListener("click",()=>this.sluit()),this.$(".laag").addEventListener("click",t=>{t.target===this.$(".laag")&&this.sluit()}),this.addEventListener("keydown",t=>{t.key==="Escape"&&this.hasAttribute("open")&&this.sluit()}),this.$(".proef button").addEventListener("click",()=>this.proef_());let e=this.$(".lijst");e.addEventListener("click",t=>this.vink_(t.target.closest(".soort"))),e.addEventListener("keydown",t=>{if(t.key!==" "&&t.key!=="Enter")return;let n=t.target.closest(".soort");n&&(t.preventDefault(),this.vink_(n))})}$(e){return this.shadowRoot.querySelector(e)}open(e,t){F(this),this.gebouwd_||this.bouw_(),this.bron=e,this.persoon=t;let n=this.$(".lijst");n.innerHTML="",delete n.dataset.sig,this.$(".proef .uit").textContent="",this.$(".proef button").disabled=!1,this.setAttribute("open",""),this.teken(),setTimeout(()=>this.$(".vak")?.focus(),40)}sluit(){this.removeAttribute("open"),this.bron=null,this.persoon=null}isVan(e){return this.hasAttribute("open")&&this.bron===e}teken(){if(!this.bron||!this.persoon)return;let e=this.bron.inhoud(this.persoon);this.$("#wie").textContent=e.naam;let t=this.$(".foto"),n=e.foto?`pic:${e.foto}`:"person";t.dataset.icon!==n&&(t.dataset.icon=n,t.innerHTML=e.foto?`<img src="${ko(e.foto)}" alt="" />`:v("person"));let i=this.$(".storing");i.hidden=!e.storing,i.textContent=e.storing??"",this.$(".proef").hidden=!e.proef;let r=this.$(".lijst");if(!e.soorten.length){delete r.dataset.sig,r.innerHTML='<div class="leeg">Op deze kaart staan nog geen meldingen aan. Zet ze aan in de editor van de kaart.</div>';return}let o=e.soorten.map(s=>s.id).join(",");r.dataset.sig!==o&&(r.dataset.sig=o,r.innerHTML=e.soorten.map(s=>`
          <div class="soort" role="checkbox" tabindex="0" data-soort="${ko(s.id)}" aria-checked="false">
            <span class="ico">${v(s.icoon)}</span>
            <span class="txt"><span class="nm">${ko(s.naam)}</span><span class="rg"></span></span>
            <span class="vink">${v("check")}</span>
          </div>`).join(""));for(let s of e.soorten){let l=r.querySelector(`.soort[data-soort="${CSS.escape(s.id)}"]`);l&&(l.setAttribute("aria-checked",String(s.aan)),l.setAttribute("aria-disabled",String(!!s.laden)),l.tabIndex=s.laden?-1:0,l.querySelector(".rg").textContent=s.regel??"",l.setAttribute("aria-label",`${s.naam} voor ${e.naam}: ${s.aan?"aan":"uit"}${s.regel?`. ${s.regel}`:""}`))}}async proef_(){let e=this.$(".proef button"),t=this.$(".proef .uit");if(!this.bron||e.disabled)return;let n=this.persoon;e.disabled=!0,t.dataset.soort="",t.textContent="Versturen\u2026";let{tekst:i,fout:r}=await this.bron.proef(n);this.persoon===n&&(e.disabled=!1,t.dataset.soort=r?"fout":"",t.textContent=i)}vink_(e){if(!e||!this.bron||e.getAttribute("aria-disabled")==="true")return;let t=e.getAttribute("aria-checked")!=="true";this.bron.zet(e.dataset.soort,this.persoon,t)}};H("domotiapp-meldingen-scherm",xo);function Qc(a,e){let t=document.querySelector("domotiapp-meldingen-scherm");return t||(t=document.createElement("domotiapp-meldingen-scherm"),document.body.appendChild(t)),t.tabIndex=-1,t.open(a,e),t}var wo=()=>document.querySelector("domotiapp-meldingen-scherm");var Ba=class extends S{constructor(){super(),this.verbinding_=new ke,this.standen_={}}validate(e){let t={...e};return t.personen=ic(t),t.personen.length||(t[C]="Kies minstens \xE9\xE9n persoon."),t}soorten_(){return rc(this.config)}watched(){let e=this.config;return[...Ma(e,"afval")?[e.afval_vandaag,e.afval_morgen]:[],...e.personen].filter(Boolean)}template(){let e=this.config;this.toggleAttribute("bare",!!e.bare);let t=e.personen.map(n=>`
        <div class="rij" data-p="${_(n)}" data-aan="true">
          <span class="chip"></span>
          <span class="txt"><span class="pn"></span><span class="ps" hidden></span></span>
          <button class="potlood" type="button">${v("pencil")}</button>
        </div>`).join("");return`<div class="card surface" style="--tone:${E.accent}">${t}</div>`}wire(){for(let e of this.$$(".rij"))this.on(e,"click",()=>Qc(this,e.dataset.p));this.herkansing_=new le(()=>this.luister_()),this.teardown_.push(()=>this.herkansing_.stop()),this.teardown_.push(V(this.$(".card"))),this.luistert_=!1,this.geabonneerd_=new Set,this.teardown_.push(()=>{this.luistert_=!1,this.geabonneerd_=new Set,this.standen_={};let e=wo();e?.isVan(this)&&e.sluit()}),this.luister_()}set hass(e){let t=this.verbinding_.herverbonden(e);super.hass=e,this.built_&&this.config&&!this.config[C]&&(t||!this.luistert_)&&(this.luistert_=!1,this.luister_())}get hass(){return super.hass}async luister_(){if(this.luistert_||!this.hass?.connection?.subscribeMessage)return;this.luistert_=!0;let e=!1;this.teardown_.push(()=>{e=!0});try{for(let t of this.soorten_()){if(this.geabonneerd_.has(t.id))continue;let n=await this.hass.connection.subscribeMessage(i=>{this.standen_={...this.standen_,[t.id]:i},this.paint()},{type:"domotiapp_lovelace/meldingen/subscribe",melding:Na(this.config,t.id)});if(e){n();return}this.geabonneerd_.add(t.id),this.teardown_.push(()=>{try{n()}catch{}})}this.herkansing_.herstel()}catch(t){this.luistert_=!1,re(t)?this.herkansing_.plan():console.warn("DomotiApp Meldingen: geen stand",t)}}zet(e,t,n){let i=this.standen_[e];!i||!this.hass?.connection||(this.standen_={...this.standen_,[e]:{...i,aan:{...i.aan??{},[t]:n}}},this.paint(),this.hass.connection.sendMessagePromise({type:"domotiapp_lovelace/meldingen/aan",melding:Na(this.config,e),persoon:t,aan:n}).catch(r=>{console.warn("DomotiApp Meldingen: omzetten mislukte",r),this.standen_={...this.standen_,[e]:i},this.paint()}))}zonderTelefoon_(e){let t=Object.values(this.standen_).find(n=>n?.telefoons);return t?!t.telefoons[e]:null}inhoud(e){let t=M(this.hass,e);return{naam:t,foto:ct(this.hass,e),storing:this.zonderTelefoon_(e)?`Geen telefoon gevonden. Zonder de app van Home Assistant krijgt ${_o(t)} niets, ook niet met een vinkje.`:null,proef:!!this.hass?.user?.is_admin&&!!this.standen_.afval?.bekend,soorten:this.soorten_().map(n=>{let i=this.standen_[n.id];return{...n,aan:oo(i,e),laden:!i,regel:n.id==="afval"?this.afvalRegel_(i):""}})}}async proef(e){let t=_o(M(this.hass,e));try{let n=await this.hass.connection.sendMessagePromise({type:"domotiapp_lovelace/meldingen/proef",melding:Na(this.config,"afval"),moment:this.config.afval_morgen?"morgen":"vandaag",persoon:e});return lc(n,t)}catch(n){return{tekst:`Proef mislukt: ${n?.message??n}`,fout:!0}}}afvalRegel_(e){let t=this.config,n=e?.buiten?.door;return sc({config:t,stand:e,vandaag:k(this.hass,t.afval_vandaag)?.state,morgen:k(this.hass,t.afval_morgen)?.state,door:n?_o(M(this.hass,n)):""})}paint(){let e=this.soorten_().map(n=>n.id);for(let n of this.$$(".rij")){let i=n.dataset.p,r=oc(this.standen_,e,i);n.dataset.aan=String(r);let o=n.querySelector(".chip"),s=ct(this.hass,i),l=s?`pic:${s}`:"person";o.dataset.icon!==l&&(o.dataset.icon=l,o.classList.toggle("pic",!!s),o.innerHTML=s?`<img src="${_(s)}" alt="" loading="lazy" />`:v("person")),o.style.setProperty("--tone",r?E.accent:"var(--dac-ink-3)");let d=M(this.hass,i);this.text(n.querySelector(".pn"),d);let c=n.querySelector(".ps"),p=this.zonderTelefoon_(i)===!0;c.hidden=!p,this.text(c,p?"Geen telefoon gevonden":""),n.querySelector(".potlood").setAttribute("aria-label",`Meldingen van ${d} instellen`)}let t=wo();t?.isVan(this)&&t.teken(),R(this.$(".card"))}getCardSize(){return this.config?.personen?.length||1}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",this.config?.personen?.length||1)}}static getConfigElement(){return document.createElement("domotiapp-meldingen-card-editor")}static getStubConfig(e,t){let n=o=>t?.find(s=>s.startsWith("sensor.")&&o.test(s))??"",i=n(/afval.*morgen|morgen.*afval|waste.*tomorrow/i),r=n(/afval.*vandaag|vandaag.*afval|waste.*today/i);return{personen:(t??[]).filter(o=>o.startsWith("person.")).slice(0,6),afval:!!(i||r),...i?{afval_morgen:i}:{},...r?{afval_vandaag:r}:{}}}};j(Ba,"css",`
    :host { display: block; }
    *, *::before, *::after { box-sizing: border-box; }

    /* 7px en niet 8: een rij is 40, de rand van .surface 2, en dan past \xE9\xE9n
       persoon precies op \xE9\xE9n rasterrij van 56. Met 8 werd dat 58, en
       rasterhoogte.js rondt dat af naar 120 -- een kaart met \xE9\xE9n persoon was dan
       twee rijen hoog. In 0.48.0 viel dat niet op, want toen stond er altijd een
       kop boven. Zelfde maat als de mediakaart. */
    .card {
      min-height: var(--dac-raster, 56px);
      padding: 7px 12px;
      display: flex; flex-direction: column; justify-content: center; gap: 8px;
    }
    :host([bare]) .card { background: none; box-shadow: none; }

    .rij {
      display: flex; align-items: center; gap: 11px; min-height: 40px;
      cursor: pointer; -webkit-tap-highlight-color: transparent;
    }
    .chip { width: 40px; height: 40px; flex: 0 0 auto; }
    .chip .icon { width: 20px; height: 20px; }

    .txt { min-width: 0; flex: 1 1 auto; display: flex; flex-direction: column; }
    .pn {
      font-size: 13.5px; font-weight: 500; line-height: 1.25;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .ps {
      font-size: 11.5px; line-height: 1.25; color: var(--dac-warn);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    [hidden] { display: none !important; }

    /* Alleen het icoon draagt de toestand: een foto dimt als deze persoon niets
       krijgt, een icoon kleurt mee met het accent. */
    .rij[data-aan="false"] .chip.pic img { opacity: .45; filter: grayscale(1); }
    .rij[data-aan="false"] .pn { color: var(--dac-ink-2); }

    /* Het potlood. Rond en stil: hij is een ingang, geen toestand. */
    .potlood {
      width: 34px; height: 34px; flex: 0 0 auto; padding: 0; cursor: pointer;
      display: grid; place-items: center; border-radius: var(--dac-radius-pill);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      color: var(--dac-ink-2); font: inherit;
      transition: background 160ms ease, color 160ms ease;
    }
    @media (hover: hover) {
      .potlood:hover { background: var(--dac-surface-hi); color: var(--dac-ink); }
    }
    .potlood .icon { width: 16px; height: 16px; }

    :focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `);var _o=a=>String(a??"").trim().split(/\s+/)[0]??"",yo=class extends L{defaults(){return{tijd_morgen:"19:30:00",tijd_vandaag:"07:30:00"}}setConfig(e){let t={...e};typeof t.afval!="boolean"&&(t.afval=Ma(e,"afval")),delete t.soort,super.setConfig(t)}schema(){let e=!!this.config_?.afval;return[{name:"personen",selector:{entity:{domain:"person",multiple:!0}}},{name:"afval",selector:f.bool()},...e?[Be("Sensoren en tijden","mdi:trash-can-outline",[{name:"afval_morgen",selector:f.entity(["sensor"])},{name:"tijd_morgen",selector:{time:{}}},{name:"afval_vandaag",selector:f.entity(["sensor"])},{name:"tijd_vandaag",selector:{time:{}}}],!0)]:[]]}label(e){return{personen:"Personen",afval:"Afvalmeldingen",afval_morgen:"Afval morgen",tijd_morgen:"Melding de avond ervoor",afval_vandaag:"Afval vandaag",tijd_vandaag:"Melding op de dag zelf"}[e.name]??super.label(e)}helper(e){return{personen:"Wie er op de kaart staat. Met het potlood kiest ieder zelf welke meldingen hij krijgt. De telefoon wordt bij de persoon gezocht (de app van Home Assistant); vindt de kaart er geen, dan staat dat op de rij.",afval:"Een herinnering om de container buiten te zetten: de avond ervoor en de ochtend zelf, met een knop 'Staat buiten' in de melding.",afval_morgen:"De sensor die zegt wat er MORGEN opgehaald wordt, zoals sensor.mijnafvalwijzer_morgen. Leeg laten: geen melding de avond ervoor.",tijd_morgen:"Standaard 19:30.",afval_vandaag:"De sensor die zegt wat er VANDAAG opgehaald wordt. Leeg laten: geen melding op de dag zelf.",tijd_vandaag:"Standaard 07:30. Vervalt als iemand de avond ervoor in de melding op 'Staat buiten' tikte."}[e.name]}};O("domotiapp-meldingen-card-editor",yo);D("domotiapp-meldingen-card",Ba,{name:"DomotiApp Meldingen",description:"De personen van het huis, met per persoon een potlood: kies welke herinneringen hij op zijn telefoon krijgt. Voorlopig: afval."});function yf(a,e,t,{live:n=!1,fit:i="cover"}={}){if(!t)return null;let r=typeof customElements<"u"&&customElements.get("hui-image"),o=r?"hui-image":"img",s=a;if((!s||s.localName!==o)&&(s=document.createElement(o),s.className="beeld"),r){let l=n?"live":"auto";s.cameraImage!==t&&(s.cameraImage=t),s.cameraView!==l&&(s.cameraView=l),s.fitMode!==i&&(s.fitMode=i),s.hass=e}else{let l=e?.states?.[t],d=l?.attributes?.entity_picture;d&&s.dataset.bron!==d&&(s.dataset.bron=d,s.src=d),s.alt=l?.attributes?.friendly_name??t,s.style.objectFit=i}return s}function Pa(a,e,t,n){if(!a)return null;let i=a.querySelector(".beeld"),r=yf(i,e,t,n);return r?(r!==i&&(i?.remove(),a.appendChild(r)),r):(i?.remove(),null)}var jo={idle:{woord:"Klaar voor gebruik",toon:"neutral"},printing:{woord:"Aan het printen",toon:"accent"},paused:{woord:"Gepauzeerd",toon:"warn"},finished:{woord:"Klaar",toon:"good"},failed:{woord:"Mislukt",toon:"bad"},offline:{woord:"Offline",toon:"neutral"},prepare:{woord:"Voorbereiden",toon:"accent"},unknown:{woord:"Onbekend",toon:"neutral"}},jf={idle:["idle","operational","standby","ready","on","off"],printing:["printing","running","run","print","busy","active"],paused:["pause","paused","pausing"],finished:["finish","finished","complete","completed","done","success"],failed:["failed","fail","error","cancelled","canceled","stopped"],prepare:["prepare","preparing","heating","slicing","init"],offline:["offline","unavailable","unknown","disconnected"]};function zo(a){let e=String(a?.state??"").trim().toLowerCase();if(!e)return"unknown";if(e==="unavailable"||e==="none")return"offline";for(let[t,n]of Object.entries(jf))if(n.includes(e))return t;return"unknown"}function Ka(a){let e=zo(a);return e==="printing"||e==="prepare"}function $o(a){let e=Number(a?.state);return Number.isFinite(e)?Math.max(0,Math.min(100,Math.round(e))):null}function Eo(a){let e=Number(a?.state);return Number.isFinite(e)?{waarde:Math.round(e),eenheid:a?.attributes?.unit_of_measurement??"\xB0C"}:null}function Ao(a,e=Date.now()){let t=String(a?.state??"").trim();if(!t||t==="unavailable"||t==="unknown")return null;if(a?.attributes?.device_class==="timestamp"||/[T ]\d{2}:\d{2}/.test(t)){let o=Date.parse(t);if(Number.isFinite(o))return Math.max(0,Math.round((o-e)/6e4))}if(/^\d+:\d{2}(:\d{2})?$/.test(t)){let o=t.split(":").map(Number),[s,l]=o.length===3?o:[0,o[0]];return s*60+l}let i=Number(t);if(!Number.isFinite(i))return null;let r=String(a?.attributes?.unit_of_measurement??"").toLowerCase();return r==="h"||r==="u"||r.startsWith("hour")?Math.round(i*60):r==="s"||r.startsWith("sec")?Math.round(i/60):Math.round(i)}function So(a){if(a==null)return"";let e=Math.max(0,Math.round(a));return e<60?`${e} min`:`${Math.floor(e/60)} u ${String(e%60).padStart(2,"0")}`}function Mo(a,e=new Date){if(a==null)return"";let t=new Date(e.getTime()+a*6e4);return`${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}var zf=new Set(["unknown","unavailable","none","null","empty","leeg","off","unload","unloaded"]);function gt(a,{namen:e=!1}={}){if(typeof a!="string")return null;let t=a.trim();if(!t)return null;let n=t.replace(/^#/,"");return/^[0-9a-f]{8}$/i.test(n)?parseInt(n.slice(6),16)<16?null:`#${n.slice(0,6).toUpperCase()}`:/^[0-9a-f]{6}$/i.test(n)?`#${n.toUpperCase()}`:/^[0-9a-f]{3}$/i.test(n)?`#${n.toUpperCase()}`:/^rgba?\(/i.test(t)?t:!e||zf.has(t.toLowerCase())?null:/^[a-z]+$/i.test(t)?t:null}function Jc(a,e={}){let t=a?.attributes??{},n=gt(e.color,{namen:!0})??gt(t.color)??gt(Array.isArray(t.cols)?t.cols[0]:t.cols)??gt(t.filament_color)??gt(t.tray_color)??(/^#?[0-9a-f]{3,8}$/i.test(String(a?.state??""))?gt(a.state):null)??null,i=e.label||t.type||t.filament_type||t.tray_type||t.name||(a&&!gt(a.state)?a.state:"")||"",r=t.empty===!0||t.empty==="true"?!0:!n&&!String(i).trim(),o=Number(t.remain??t.remaining),s=t.remain_enabled!==!1&&!r;return{kleur:r?null:n,soort:String(i).trim(),leeg:r,actief:t.active===!0||t.active==="true",rest:s&&Number.isFinite(o)&&o>=0&&o<=100?Math.round(o):null}}var Vt=[1,2,3,4],$f={good:E.good,warn:E.warn,bad:E.bad,neutral:E.neutral,accent:E.accent},Ga=class extends S{validate(e){let t={name:"",icon:"printer3d",...e};return t.status||t.progress||t.camera||t.image||t.nozzle_temp||t.bed_temp||t.power||(t[C]="Kies minstens een printstatus. Camera, voortgang, temperaturen, de deur en de trays van de AMS mogen daarna."),t}watched(){let e=this.config;return[e.status,e.progress,e.remaining,e.nozzle_temp,e.bed_temp,e.door,e.power,e.camera,e.image,...Vt.map(t=>e[`tray_${t}`])].filter(Boolean)}beeldSoort_(){let e=this.config;return e.camera&&e.image?this.beeld_??(Ka(k(this.hass,e.status))?"camera":"image"):e.camera?"camera":e.image?"image":null}template(){return this.config.bare&&this.setAttribute("bare",""),this.style.containerType="inline-size",`
      <div class="card surface" style="--tone:${E.accent}">
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
      </div>`}wire(){let e=this.config;this.teardown_.push(V(this.$(".card"))),this.on(this.$(".ico"),"click",()=>K(this,e.status||e.power||e.camera||e.progress));let t=this.$(".aanuit");this.on(t,"click",i=>{i.stopPropagation(),this.schakel_()});let n=this.$(".wissel");this.on(n,"click",i=>{i.stopPropagation(),this.beeld_=this.beeldSoort_()==="camera"?"image":"camera",this.paint()}),this.on(this.$(".beeldvak"),"click",i=>{if(i.target.closest(".wissel"))return;let r=this.beeldSoort_()==="camera"?e.camera:e.image;r&&K(this,r)})}async schakel_(){let e=this.config.power;if(!e)return;let t=k(this.hass,e),n=Z(t),i=String(e).split(".")[0];if(n){let r=$o(k(this.hass,this.config.progress)),o=Ka(k(this.hass,this.config.status));if(!await Se({title:"Printer uitzetten?",text:o?`Er loopt een print${r===null?"":` (${r}% klaar)`}. Uitzetten breekt hem af, en dat is niet terug te draaien.`:"Weet je zeker dat je de printer wilt uitzetten?",confirmText:"Uitzetten",dismissText:"Aan laten"}))return}this.hass.callService(i,n?"turn_off":"turn_on",{entity_id:e})}paint(){let e=this.config,t=k(this.hass,e.status),n=zo(t),i=jo[n]??jo.unknown,r=Ka(t),o=e.status&&(!t||t.state==="unavailable");this.toggleAttribute("dead",!!o),this.toggleAttribute("loopt",r&&!o),this.$(".card").style.setProperty("--tone",$f[i.toon]??E.accent),this.$(".ico").innerHTML=v(e.icon||"printer3d"),this.text(".nm",e.name||M(this.hass,e.status||e.power||e.camera,"3D-printer"));let s=String(t?.state??"").trim(),l=n==="unknown"&&s&&s.toLowerCase()!=="unknown",d=`<b>${this.veilig_(l?s:i.woord)}</b>${this.bijzin_()}`,c=this.$(".st");c.innerHTML!==d&&(c.innerHTML=d),this.paintAanUit_(),this.paintBeeld_(r),this.paintVoortgang_(r),this.paintTegels_(),this.paintAms_(),R(this.$(".card"))}bijzin_(){let e=Ao(k(this.hass,this.config.remaining));return e===null||e<=0?"":` \xB7 nog ${this.veilig_(So(e))}, klaar om ${this.veilig_(Mo(e))}`}paintAanUit_(){let e=this.$(".aanuit"),t=this.config.power;if(e.hidden=!t,!t)return;let n=Z(k(this.hass,t));e.setAttribute("aria-pressed",String(n)),e.setAttribute("aria-label",n?"Printer uitzetten":"Printer aanzetten")}paintBeeld_(e){let t=this.config,n=this.$(".beeldvak"),i=this.beeldSoort_();if(n.hidden=!i,!i)return;let r=this.$(".wissel");if(r.hidden=!(t.camera&&t.image),!r.hidden){let d=i==="camera"?"Voorbeeld":"Camera";r.innerHTML=`${v(i==="camera"?"grid":"camera")}<span>${d}</span>`,r.setAttribute("aria-label",`Toon ${d.toLowerCase()}`)}if(i==="camera"){Pa(n,this.hass,t.camera,{live:t.live_view===!0||e}),n.querySelector(".leeg")?.remove();return}n.querySelector("hui-image")?.remove();let s=k(this.hass,t.image)?.attributes?.entity_picture,l=n.querySelector("img.beeld");if(s)l||(l=document.createElement("img"),l.className="beeld",l.alt="Wat de printer aan het maken is",n.appendChild(l)),l.dataset.bron!==s&&(l.dataset.bron=s,l.src=s),n.querySelector(".leeg")?.remove();else if(l?.remove(),!n.querySelector(".leeg")){let d=document.createElement("span");d.className="leeg",d.textContent="Nog geen voorbeeld",n.appendChild(d)}}paintVoortgang_(e){let t=this.config,n=this.$(".voort"),i=$o(k(this.hass,t.progress)),r=Ao(k(this.hass,t.remaining));if(n.hidden=i===null&&!e,n.hidden)return;let o=this.$(".balk");o.dataset.onbekend=String(i===null),o.querySelector("i").style.setProperty("--pct",`${i??0}%`),this.text(".pct",i===null?"Bezig":`${i}%`),this.text(".rest",r===null||r<=0?"":`nog ${So(r)} \xB7 klaar om ${Mo(r)}`)}paintTegels_(){let e=this.config,t=this.$(".tegels"),n=[],i=Eo(k(this.hass,e.nozzle_temp));i&&n.push({w:`${i.waarde}${i.eenheid}`,l:"Nozzle"});let r=Eo(k(this.hass,e.bed_temp));r&&n.push({w:`${r.waarde}${r.eenheid}`,l:"Bed"});let o=k(this.hass,e.door);if(o){let l=Z(o);n.push({w:l?"Open":"Dicht",l:"Deur",let:l})}if(t.hidden=!n.length,!n.length)return;t.style.setProperty("--kolommen",String(n.length));let s=n.map(l=>`${l.w}|${l.l}|${l.let??""}`).join(",");t.dataset.sig!==s&&(t.dataset.sig=s,t.innerHTML=n.map(l=>`<div class="tegel" data-let="${!!l.let}"><span class="w">${this.veilig_(l.w)}</span><span class="l">${this.veilig_(l.l)}</span></div>`).join(""))}paintAms_(){let e=this.config,t=this.$(".ams"),n=Vt.filter(l=>e[`tray_${l}`]||e[`tray_${l}_color`]);if(t.hidden=!n.length,!n.length)return;let i=this.$(".ams .rij"),r=Vt.map(l=>Jc(k(this.hass,e[`tray_${l}`]),{color:e[`tray_${l}_color`],label:e[`tray_${l}_label`]})),o=Vt.map(l=>k(this.hass,e[`tray_${l}`])?.attributes?.name??""),s=r.map(l=>`${l.kleur}|${l.soort}|${l.leeg}|${l.actief}|${l.rest}`).join(",");i.dataset.sig!==s&&(i.dataset.sig=s,i.innerHTML=r.map((l,d)=>{let c=o[d],p=`Tray ${d+1}`+(l.leeg?": leeg":c||l.soort?`: ${c||l.soort}`:"")+(l.rest===null?"":` \u2014 nog ${l.rest}%`)+(l.actief?" (in gebruik)":"");return`<div class="tray" data-leeg="${l.leeg}" data-actief="${l.actief}" style="--kleur:${l.kleur??"transparent"}" title="${this.veilig_(p)}"><span class="vlak">${l.rest===null?"":`<i style="--rest:${l.rest}%"></i>`}</span><span class="txt"><span class="nr">Tray ${d+1}</span><span class="so">${this.veilig_(l.leeg?"leeg":l.soort||"gevuld")}</span></span></div>`}).join(""))}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}getCardSize(){return this.config?.camera||this.config?.image?6:3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-printer-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>/^sensor\./.test(i)&&/(print|stage|status)/i.test(i));return n?{status:n}:{}}};j(Ga,"css",`
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
      background: rgba(var(--dac-tint), .038); border: 1px solid var(--dac-border);
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
      background: rgba(var(--dac-tint), .038); border: 1px solid var(--dac-border);
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
  `);var No=class extends L{defaults(){return{icon:"printer3d"}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"printer3d",auto:!1}]}schema(){return[{name:"name",selector:f.text()},{name:"status",selector:f.entity(["sensor","binary_sensor"])},{name:"power",selector:f.entity(["switch","input_boolean"])},{name:"progress",selector:f.entity(["sensor","number"])},{name:"remaining",selector:f.entity(["sensor"])},{name:"nozzle_temp",selector:f.entity(["sensor","number"])},{name:"bed_temp",selector:f.entity(["sensor","number"])},{name:"door",selector:f.entity(["binary_sensor"])},{name:"camera",selector:f.entity("camera")},{name:"live_view",selector:f.bool()},{name:"image",selector:f.entity(["image","camera"])},...Vt.flatMap(e=>[{name:`tray_${e}`,selector:f.entity(["sensor","select","text"])},{name:`tray_${e}_color`,selector:f.text()},{name:`tray_${e}_label`,selector:f.text()}])]}label(e){let t={};for(let n of Vt)t[`tray_${n}`]=`Tray ${n}`,t[`tray_${n}_color`]=`Tray ${n}: kleur met de hand`,t[`tray_${n}_label`]=`Tray ${n}: naam met de hand`;return{name:"Naam",status:"Printstatus",power:"Aan/uit-schakelaar",progress:"Printvoortgang (0-100%)",remaining:"Eindtijd of resterende tijd",nozzle_temp:"Nozzletemperatuur",bed_temp:"Bedtemperatuur",door:"Deur van de printer",camera:"Camera",live_view:"Altijd live beeld",image:"Voorbeeld van de print",...t}[e.name]??super.label(e)}helper(e){if(e.name==="status")return"De sensor die meldt wat hij doet. RUNNING, IDLE, FINISH, PAUSE en FAILED worden herkend, en die van Octoprint en Klipper ook.";if(e.name==="power")return"Zetten en uitzetten. Bij UITzetten vraagt de kaart eerst of je het zeker weet \u2014 en loopt er een print, dan staat erbij hoe ver hij was.";if(e.name==="remaining")return"Een aantal minuten, een klok als 1:24:00 of het tijdstip waarop hij klaar is: alle drie worden gelezen. De kaart toont beide \u2014 hoe lang nog \xE9n hoe laat.";if(e.name==="camera")return"Het live beeld van de printer. Staat er ook een voorbeeld ingesteld, dan komt er een knop om te wisselen.";if(e.name==="live_view")return"Normaal ververst het beeld een paar keer per minuut en gaat hij alleen echt live zolang er een print loopt. Met deze knop staat de stream altijd aan \u2014 mooier, maar het kost een verbinding die de hele dag openstaat.";if(e.name==="image")return"De `image`-entiteit met de plaat van wat hij aan het maken is.";if(e.name==="tray_1")return"De vier trays van de AMS. De kaart haalt de kleur en het soort filament uit de attributen van de entiteit; Bambu levert die als hexwaarde. Lukt dat niet, vul dan hieronder zelf een kleur in.";if(/^tray_\d_color$/.test(e.name))return"Alleen nodig als de entiteit zijn kleur niet meelevert. Een hexwaarde (#FF6B00) of een kleurnaam."}};O("domotiapp-printer-card-editor",No);D("domotiapp-printer-card",Ga,{name:"DomotiApp 3D-printer",description:"Live camerabeeld of het voorbeeld, voortgang met eindtijd, temperaturen, de deur en de vier trays van de AMS met hun echte kleur."});var Bt={fuel:{label:"Brandstof",icoon:"petrol"},hybrid:{label:"Hybride",icoon:"leaf"},electric:{label:"Elektrisch",icoon:"bolt"}},Do=a=>a==="electric"||a==="hybrid",Lo=a=>a==="fuel"||a==="hybrid",Ef=["charging","charge","fast_charging","dc_charging","on","true","laden"],Af=["complete","completed","fully_charged","full","done","finished"],Sf=["connected","plugged","plugged_in","cable_connected","ready_to_charge"],Mf=["not_plugged_in","not_plugged","notpluggedin","unplugged","disconnected","not_charging","notcharging","off","false","idle","no"];function ep(a){let e=String(a?.state??"").trim().toLowerCase();return!e||e==="unavailable"||e==="unknown"?null:Ef.includes(e)?"charging":Af.includes(e)?"complete":Sf.includes(e)?"connected":Mf.includes(e)?"idle":"onbekend"}function tp(a,e){if(a&&a!=="onbekend")return Wa[a]??"";let t=String(e?.state??"").trim();if(!t||t==="unavailable"||t==="unknown")return"";let n=t.replace(/[_-]+/g," ").toLowerCase();return n.charAt(0).toUpperCase()+n.slice(1)}var Wa={charging:"Aan het laden",complete:"Volgeladen",connected:"Aan de lader",idle:"Niet aan de lader"};function To(a,e){let t=Number(a?.state);if(!Number.isFinite(t))return null;let n=String(a?.attributes?.unit_of_measurement??"").toLowerCase(),i=Number(e);return n!=="%"&&Number.isFinite(i)&&i>0?Math.max(0,Math.min(100,Math.round(t/i*100))):Math.max(0,Math.min(100,Math.round(t)))}function np(a){let e=Number(a?.state);return Number.isFinite(e)?{waarde:Math.round(e),eenheid:a?.attributes?.unit_of_measurement??"km"}:null}function Oo(a){if(a==null)return null;let e=a<=10?"bad":a<=20?"warn":"good";return{procent:a,toon:e}}function Co(a,e=Date.now()){let t=String(a?.state??"").trim();if(!t||t==="unavailable"||t==="unknown")return null;if(a?.attributes?.device_class==="timestamp"||/[T ]\d{2}:\d{2}/.test(t)){let r=Date.parse(t);if(Number.isFinite(r))return Math.max(0,Math.round((r-e)/6e4))}if(/^\d+:\d{2}(:\d{2})?$/.test(t)){let r=t.split(":").map(Number),[o,s]=r.length===3?r:[0,r[0]];return o*60+s}let n=Number(t);if(!Number.isFinite(n))return null;let i=String(a?.attributes?.unit_of_measurement??"").toLowerCase();return i==="h"||i.startsWith("hour")?Math.round(n*60):i==="s"||i.startsWith("sec")?Math.round(n/60):Math.round(n)}function Ro(a){if(a==null)return"";let e=Math.max(0,Math.round(a));return e<60?`${e} min`:`${Math.floor(e/60)} u ${String(e%60).padStart(2,"0")}`}function ap({open:a,slot:e,laden:t,laadMinuten:n,radius:i,aandrijving:r}){if(a)return{tekst:"Er staat iets open",toon:"warn"};if(e==="unlocked")return{tekst:"Niet op slot",toon:"warn"};if(t==="charging"){let o=n?` \xB7 nog ${Ro(n)}`:"";return{tekst:`${Wa.charging}${o}`,toon:"accent"}}return t==="complete"?{tekst:Wa.complete,toon:"good"}:t==="connected"?{tekst:Wa.connected,toon:"neutral"}:i?{tekst:`Nog ${i.waarde} ${i.eenheid}`,toon:"neutral"}:{tekst:Bt[r]?.label??"",toon:"neutral"}}var Nf=100,Df=["home","thuis","at_home","athome"],Lf=["not_home","away","afwezig","weg","not home","nothome"];function Tf(a,e,t,n){let r=d=>d*Math.PI/180,o=r(t-a),s=r(n-e),l=Math.sin(o/2)**2+Math.cos(r(a))*Math.cos(r(t))*Math.sin(s/2)**2;return 2*6371e3*Math.asin(Math.min(1,Math.sqrt(l)))}function Of(a){let e=a?.attributes??{},t=Number(e.latitude??e.lat),n=Number(e.longitude??e.lon??e.lng);if(Number.isFinite(t)&&Number.isFinite(n))return{lat:t,lon:n};let i=String(a?.state??""),r=i.match(/(?:lat|latitude)["']?\s*[:=]\s*(-?\d+(?:\.\d+)?)/i),o=i.match(/(?:lon|lng|longitude)["']?\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);return r&&o?{lat:Number(r[1]),lon:Number(o[1])}:null}function ip(a,e,t=Nf){if(!a)return{thuis:null,tekst:"",meters:null};let n=String(a.state??"").trim(),i=n.toLowerCase();if(i==="unavailable"||i==="unknown"||!n)return{thuis:null,tekst:"",meters:null};if(Df.includes(i))return{thuis:!0,tekst:"Thuis",meters:null};if(Lf.includes(i))return{thuis:!1,tekst:"Afwezig",meters:null};let r=Of(a),o=Number(e?.config?.latitude),s=Number(e?.config?.longitude);if(r&&Number.isFinite(o)&&Number.isFinite(s)){let l=Tf(r.lat,r.lon,o,s),d=l<=t;return{thuis:d,tekst:d?"Thuis":"Afwezig",meters:Math.round(l)}}return{thuis:!1,tekst:n.charAt(0).toUpperCase()+n.slice(1),meters:null}}var Cf=["open","opened","ajar","unlatched","on","true","unlocked"],Rf=["closed","close","shut","secured","locked","off","false","not_open"];function Ho(a){let e=String(a?.state??"").trim().toLowerCase();return!e||e==="unavailable"||e==="unknown"?null:Cf.includes(e)?!0:Rf.includes(e)?!1:/(^|[^a-z])(ajar|open)([^a-z]|$)/.test(e)?!0:null}function rp(a){let e=String(a?.state??"").trim().toLowerCase();if(!e||e==="unavailable"||e==="unknown")return null;if(String(a?.entity_id??"").split(".")[0]==="lock")return e==="locked"?!0:e==="unlocked"||e==="open"||e==="opening"?!1:null;if(a?.attributes?.device_class==="lock"){if(e==="on")return!1;if(e==="off")return!0}return["locked","lock","secured","closed","off","false"].includes(e)?!0:["unlocked","unlock","open","unsecured","on","true"].includes(e)?!1:null}var Io={good:E.good,warn:E.warn,bad:E.bad,neutral:E.neutral,accent:E.accent},Ua=class extends S{validate(e){let t={name:"",icon:"car",drivetrain:"electric",photo_size:"klein",...e};return t.battery||t.fuel||t.range||t.range_electric||t.sensors?.length||t.lock||t.image||(t[C]="Kies de aandrijving en vul minstens \xE9\xE9n sensor in \u2014 de accu, de tank of de actieradius."),t}watched(){let e=this.config;return[e.battery,e.fuel,e.range,e.range_electric,e.charging,e.charging_ready,e.charging_power,e.plug,e.lock,e.doors,e.windows,e.odometer,e.climate,e.location,...Array.isArray(e.sensors)?e.sensors:[]].filter(Boolean)}soort_(){return Bt[this.config.drivetrain]?this.config.drivetrain:"electric"}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),this.setAttribute("foto",e.photo_size==="groot"?"groot":"klein"),this.style.containerType="inline-size",`
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
      </div>`}wire(){this.teardown_.push(V(this.$(".card"))),this.on(this.$(".foto"),"click",()=>{let e=this.config;K(this,e.battery||e.range||e.fuel||e.lock)}),this.on(this.$(".tegels"),"click",e=>{let t=e.target.closest?.("[data-id]");t&&K(this,t.dataset.id)})}paint(){let e=this.config,t=this.soort_(),n=Do(t)?To(k(this.hass,e.battery),e.battery_max):null,i=Lo(t)?To(k(this.hass,e.fuel),e.fuel_max):null,r=np(k(this.hass,e.range)),o=ep(k(this.hass,e.charging)),s=Co(k(this.hass,e.charging_ready)),l=k(this.hass,e.lock),d=Ho(k(this.hass,e.doors)),c=Ho(k(this.hass,e.windows)),p=d===!0||c===!0,h=rp(l),u=ip(k(this.hass,e.location),this.hass,Number(e.home_radius)||void 0),m=e.battery&&!k(this.hass,e.battery)&&e.range&&!k(this.hass,e.range);this.toggleAttribute("dead",!!m),this.text(".nm",e.name||M(this.hass,e.battery||e.range||e.lock,"Auto"));let b=ap({open:p,slot:h===!1?"unlocked":h===!0?"locked":null,laden:o,laadMinuten:s,radius:r,aandrijving:t});this.text(".st",b.tekst),this.$(".st").style.setProperty("--melding",Io[b.toon]??E.neutral),this.paintFoto_(),this.paintBalken_({accu:n,tank:i,radius:r,laden:o,soort:t}),this.paintTegels_(u,o,{slot:h,deurOpen:d,raamOpen:c}),R(this.$(".card"))}paintFoto_(){let e=this.$(".foto"),t=this.config.image;if(!t){e.dataset.bron!==""&&(e.dataset.bron="",e.innerHTML=v(this.config.icon||"car"));return}if(e.dataset.bron===t)return;e.dataset.bron=t;let n=document.createElement("img");n.src=t,n.alt=this.config.name||"De auto",n.loading="lazy",n.onerror=()=>{e.dataset.bron="",e.innerHTML=v(this.config.icon||"car")},e.replaceChildren(n)}paintBalken_({accu:e,tank:t,radius:n,laden:i,soort:r}){let o=this.config,s=this.$(".balken"),l=[];if(e!==null){let h=Oo(e);l.push({sleutel:"accu",icoon:"battery",label:"Accu",pct:e,toon:i==="charging"?"accent":h.toon,waarde:`${e}%`,laadt:i==="charging"})}if(t!==null){let h=Oo(t);l.push({sleutel:"tank",icoon:r==="hybrid"?"petrol":Bt[r].icoon,label:"Tank",pct:t,toon:h.toon,waarde:`${t}%`,laadt:!1})}if(!l.length&&n&&l.push({sleutel:"radius",icoon:"gaugeArrow",label:"Actieradius",pct:null,toon:"neutral",waarde:`${n.waarde} ${n.eenheid}`,laadt:!1}),s.hidden=!l.length,!l.length)return;let d=n?`${n.waarde} ${n.eenheid}`:"",c=Co(k(this.hass,o.charging_ready)),p=l.map(h=>`${h.sleutel}:${h.pct}:${h.toon}:${h.laadt}`).join(",")+d+c;s.dataset.sig!==p&&(s.dataset.sig=p,s.innerHTML=l.map((h,u)=>{let m=u===0&&h.sleutel!=="radius"&&d?`<span class="w">${this.veilig_(h.waarde)} \xB7 ${this.veilig_(d)}</span>`:`<span class="w">${this.veilig_(h.waarde)}</span>`,b=h.laadt&&c?` \xB7 nog ${this.veilig_(Ro(c))}`:"";return`
          <div class="meter" style="--balk:${Io[h.toon]??E.neutral}">
            <div class="regel">
              <span class="l">${v(h.icoon)}<span>${this.veilig_(h.label)}${b}</span></span>
              ${m}
            </div>
            ${h.pct===null?"":`<div class="lijn" data-laadt="${h.laadt}"><i style="--pct:${h.pct}%"></i></div>`}
          </div>`}).join(""))}paintTegels_(e,t,n={}){let i=this.config,r=this.$(".tegels"),o=[],s=(d,c)=>{let p=k(this.hass,d);if(!p||p.state==="unavailable"||p.state==="unknown")return;let h=p.attributes?.unit_of_measurement??"",u=Number(p.state),m=Number.isFinite(u)?`${Math.round(u*10)/10}${h?` ${h}`:""}`:p.state;o.push({id:d,w:m,l:c??M(this.hass,d,d)})};if(i.location&&e?.tekst){let d=e.thuis===!1&&e.meters!==null?e.meters>=1e3?` \xB7 ${Math.round(e.meters/100)/10} km`:` \xB7 ${e.meters} m`:"";o.push({id:i.location,w:e.tekst+d,l:"Waar hij staat",toon:e.thuis===!0?"good":null})}if(i.charging){let d=k(this.hass,i.charging),c=tp(t,d);c&&o.push({id:i.charging,w:c,l:"Laadstatus",toon:t==="charging"?"accent":t==="complete"?"good":null})}i.lock&&n.slot!==null&&n.slot!==void 0&&o.push({id:i.lock,w:n.slot?"Op slot":"Niet op slot",l:"Portierslot",toon:n.slot?"good":"warn"}),i.doors&&n.deurOpen!==null&&n.deurOpen!==void 0&&o.push({id:i.doors,w:n.deurOpen?"Open":"Dicht",l:"Deuren",toon:n.deurOpen?"warn":null}),i.windows&&n.raamOpen!==null&&n.raamOpen!==void 0&&o.push({id:i.windows,w:n.raamOpen?"Open":"Dicht",l:"Ramen",toon:n.raamOpen?"warn":null}),i.climate&&s(i.climate,"Voorverwarmen"),i.odometer&&s(i.odometer,"Kilometerstand"),i.charging_power&&s(i.charging_power,"Laadvermogen");for(let d of Array.isArray(i.sensors)?i.sensors:[])s(d,null);if(r.hidden=!o.length,!o.length)return;let l=o.map(d=>`${d.id}|${d.w}|${d.toon??""}`).join(",");r.dataset.sig!==l&&(r.dataset.sig=l,r.innerHTML=o.map(d=>`<div class="tegel" data-id="${this.veilig_(d.id)}" role="button" tabindex="0"${d.toon?` style="--tegeltoon:${Io[d.toon]??E.neutral}"`:""}><span class="w">${this.veilig_(d.w)}</span><span class="l">${this.veilig_(d.l)}</span></div>`).join(""))}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}getCardSize(){return this.config?.photo_size==="groot"?5:3}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",2)}}static getConfigElement(){return document.createElement("domotiapp-auto-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>/^sensor\..*(battery|accu|soc)/i.test(i));return n?{battery:n,drivetrain:"electric"}:{drivetrain:"electric"}}};j(Ua,"css",`
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
      background: rgba(var(--dac-tint), .038); border: 1px solid var(--dac-border);
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
  `);var Vo=class extends L{defaults(){return{icon:"car",drivetrain:"electric",photo_size:"klein"}}pickers(){return[{key:"image",kind:"foto",label:"Foto van de auto"},{key:"icon",kind:"icon",label:"Icoon (zonder foto)",fallback:"car"}]}schema(){let e=Bt[this.config_?.drivetrain]?this.config_.drivetrain:"electric",t=[{name:"name",selector:f.text()},{name:"drivetrain",selector:f.select(Object.entries(Bt).map(([n,{label:i}])=>({value:n,label:i})))},{name:"photo_size",selector:f.select([{value:"klein",label:"Klein, naast de naam"},{value:"groot",label:"Groot, over de hele breedte"}])},{name:"range",selector:f.entity(["sensor","number"])}];return Do(e)&&t.push({name:"battery",selector:f.entity(["sensor","number"])},{name:"battery_max",selector:f.number(1,400,1)},{name:"charging",selector:f.entity(["sensor","binary_sensor","switch"])},{name:"charging_ready",selector:f.entity(["sensor"])},{name:"charging_power",selector:f.entity(["sensor"])}),Lo(e)&&t.push({name:"fuel",selector:f.entity(["sensor","number"])},{name:"fuel_max",selector:f.number(1,200,1)}),t.push({name:"lock",selector:f.entity(["lock","sensor","binary_sensor"])},{name:"doors",selector:f.entity(["binary_sensor","sensor","cover"])},{name:"windows",selector:f.entity(["binary_sensor","sensor","cover"])},{name:"climate",selector:f.entity(["sensor","binary_sensor","switch","climate"])},{name:"location",selector:f.entity(["device_tracker","sensor","person"])},{name:"home_radius",selector:f.number(10,2e3,10)},{name:"odometer",selector:f.entity(["sensor"])},{name:"sensors",selector:{entity:{multiple:!0}}}),t}label(e){return{name:"Naam",drivetrain:"Aandrijving",image:"Foto van de auto",photo_size:"Hoe groot staat de foto",range:"Actieradius",battery:"Accupercentage",battery_max:"Accu-inhoud (kWh), als de sensor geen procenten geeft",charging:"Laadstatus",charging_ready:"Klaar met laden om / nog te gaan",charging_power:"Laadvermogen",fuel:"Tankniveau",fuel_max:"Tankinhoud (liter), als de sensor geen procenten geeft",lock:"Portierslot",doors:"Deuren open",windows:"Ramen open",climate:"Voorverwarmen (alleen uitlezen)",location:"Waar hij staat",home_radius:"Hoe dichtbij is thuis (meter)",odometer:"Kilometerstand",sensors:"Extra sensoren als tegel"}[e.name]??super.label(e)}helper(e){return{drivetrain:"Bepaalt welke balken er op de kaart komen \u2014 een accu, een tank, of allebei \u2014 en welke velden je hieronder ziet.",image:"Kies een bestand of sleep er een op. Home Assistant zet hem in zijn eigen media-opslag; je kunt ook een pad als /local/auto.png intypen.",range:"In de eenheid van de sensor zelf. De kaart rekent niets om: staat je Home Assistant op mijlen, dan zie je mijlen.",battery_max:"Alleen nodig als je accusensor in kWh meldt in plaats van in procenten. Dan rekent de kaart het percentage zelf uit.",fuel_max:"Alleen nodig als je tanksensor in liters meldt in plaats van in procenten.",charging_ready:"Een aantal minuten, een klok of het tijdstip waarop hij vol is \u2014 alle drie worden gelezen.",doors:"Staat er iets open, dan zegt de kaart dat en gaat al het andere even opzij. Een binary_sensor mag, maar een gewone sensor met een woord erin ook \u2014 Closed, Open, Ajar en LOCKED worden allemaal gelezen.",lock:"Alleen uitlezen: deze kaart bedient niets. Een lock-entiteit mag, maar ook een sensor die LOCKED of UNLOCKED meldt.",location:"Een device_tracker die home of not_home meldt, of een sensor met een coordinaat \u2014 beide worden gelezen. Bij een coordinaat rekent de kaart de afstand tot de locatie van je Home Assistant uit en maakt daar Thuis of Afwezig van.",home_radius:"Alleen van belang bij een sensor met een coordinaat. Binnen deze afstand van je huis heet de auto thuis. Leeg laten is 100 meter \u2014 ruim genoeg voor een oprit of een parkeerplaats om de hoek.",sensors:"Alles wat je verder nog kwijt wilt: bandenspanning, buitentemperatuur, de volgende beurt. Ze komen als tegels onderaan te staan, met de naam uit Home Assistant."}[e.name]}};O("domotiapp-auto-card-editor",Vo);D("domotiapp-auto-card",Ua,{name:"DomotiApp Auto",description:"Brandstof, hybride of elektrisch: accu- en tankbalk, actieradius, laadstatus, het slot en zoveel eigen sensoren als je kwijt wilt \u2014 met een foto van de auto erbij."});function op(a,e){return a?.entities?.[e]?.device_id??null}function Bo(a,e,t,n){if(n&&t.includes(n))return n;let i=op(a,e);if(i){let r=t.filter(o=>op(a,o)===i);if(r.length===1)return r[0]}return null}function Fa(a,e,t,n,i){let r=Bo(a,e,t,n);return r===null||r===i}var lp=[{sleutel:"mens",label:"Mens",icoon:"person",woorden:["person","persoon","personen","mens","people","human"]},{sleutel:"dier",label:"Dier",icoon:"dier",woorden:["pet","pets","dier","dieren","huisdier","animal","dog","hond","cat","kat"]},{sleutel:"voertuig",label:"Voertuig",icoon:"car",woorden:["vehicle","voertuig","car","auto","truck","vrachtwagen","motorcycle"]},{sleutel:"aanbellen",label:"Aanbellen",icoon:"bell",woorden:["doorbell","deurbel","aanbellen","aangebeld","visitor","bezoeker","bel","ring","chime"]},{sleutel:"ontgrendeling",label:"Ontgrendeling",icoon:"lockOpen",woorden:["unlock","unlocked","ontgrendeld","ontgrendeling","slot","lock","opener","deuropener","buzzer","toegang","access","entry","keypad","badge","pas"]}],dp={sleutel:"beweging",label:"Beweging",icoon:"cctv",woorden:[]},bn=[...lp,dp];function cp(a){return bn.find(e=>e.sleutel===a)??dp}function sp(a){return String(a??"").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)}function qa(a,e,t){if(String(a??"").split(".")[0]==="lock")return"ontgrendeling";if(t==="doorbell")return"aanbellen";let i=new Set([...sp(a),...sp(e)]);for(let r of lp)if(r.woorden.some(o=>i.has(o)))return r.sleutel;return null}function pp(a,e={}){let t=a?.melder,n=t?e[`meldersoort:${t}`]:null;return n&&bn.some(i=>i.sleutel===n)?n:qa(t,a?.naam)}function fn(a){let e=Date.parse(a?.tijd??"");return Number.isNaN(e)?null:e}function Za(a,{soorten:e,camera:t,dag:n,config:i}={}){let r=e instanceof Set?e:new Set(e??[]),o=n==null?null:ue(n);return(Array.isArray(a)?a:[]).filter(s=>{if(r.size){let l=pp(s,i);if(!l||!r.has(l))return!1}if(t&&s.camera!==t)return!1;if(o){let l=fn(s);if(l===null||l<o.vanaf||l>=o.tot)return!1}return!0})}function hp(a,e={}){let t={};for(let n of Array.isArray(a)?a:[]){let i=pp(n,e);i&&(t[i]=(t[i]??0)+1)}return t}function up(a){let e=new Set((Array.isArray(a)?a:[]).map(t=>t?.soort).filter(Boolean));return bn.filter(t=>e.has(t.sleutel))}function mp(a,e,t){let n=Array.isArray(e)?e:[];if(n.some(r=>r==null))return[...a??[]];let i=new Set(n.filter(Boolean));for(let r of Array.isArray(t)?t:[])r?.camera&&i.add(r.camera);return(a??[]).filter(r=>i.has(r))}function Po(a){let e=new Set;for(let t of Array.isArray(a)?a:[]){let n=fn(t);n!==null&&e.add(ue(n).vanaf)}return[...e].sort((t,n)=>n-t)}function Ya(a,e,t){let n=ue(e).vanaf,i=(a??[]).filter(r=>t<0?r<n:r>n);return i.length?t<0?i[0]:i[i.length-1]:null}function Ko(a){let e=new Map;for(let n of Array.isArray(a)?a:[]){let i=fn(n),r=i===null?null:ue(i).vanaf;e.has(r)||e.set(r,[]),e.get(r).push(n)}return[...e.entries()].map(([n,i])=>({dag:n,beelden:i.sort((r,o)=>(fn(o)??0)-(fn(r)??0)),bytes:i.reduce((r,o)=>r+(Number(o.bytes)||0),0)})).sort((n,i)=>n.dag===null?1:i.dag===null?-1:i.dag-n.dag)}function Go(a){let e=Number(a)||0;return e>=1024*1024*1024?`${(e/(1024*1024*1024)).toFixed(1)} GB`:e>=1024*1024?`${Math.round(e/(1024*1024))} MB`:e>=1024?`${Math.round(e/1024)} kB`:`${e} B`}function ue(a){let e=new Date(a),t=new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime(),n=new Date(e.getFullYear(),e.getMonth(),e.getDate()+1).getTime();return{vanaf:t,tot:n}}function Wo(a,e){let t=new Date(a);return new Date(t.getFullYear(),t.getMonth(),t.getDate()+e).getTime()}var Hf=["zo","ma","di","wo","do","vr","za"],If=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];function Pt(a,e=Date.now()){if(a==null)return"Alles";let t=ue(e).vanaf,n=ue(a).vanaf,i=Math.round((t-n)/864e5);if(i===0)return"Vandaag";if(i===1)return"Gisteren";let r=new Date(n);return`${Hf[r.getDay()]} ${r.getDate()} ${If[r.getMonth()]}`}function Vf(a){let e=[a?.camera,...Array.isArray(a?.cameras)?a.cameras:[]].filter(t=>typeof t=="string"&&t);return[...new Set(e)]}function Bf(a){let e=[...Array.isArray(a?.motion_sensors)?a.motion_sensors:[],...a?.motion?[a.motion]:[]].filter(t=>typeof t=="string"&&t);return[...new Set(e)]}function Pf(a,e){let t=Vf(e),n=Bf(e),i=!!e?.snapshots;return t.map(r=>{let o=n.filter(l=>Fa(a,l,t,e?.[`melderbij:${l}`],r)),s={};for(let l of o){let d=e?.[`melder:${l}`];typeof d=="string"&&d.trim()&&(s[l]=d.trim())}return{camera:r,aan:i&&o.length>0,melders:o,namen:s,rustperiode:gp(e?.snapshot_rustperiode,60),wachttijd:gp(e?.snapshot_wachttijd,0),ontvangers:Gf(e?.snapshot_ontvangers).filter(l=>l.startsWith("person.")),alleen_afwezig:!!e?.snapshot_alleen_afwezig,stil_schakelaar:typeof e?.snapshot_stil=="string"&&e.snapshot_stil?e.snapshot_stil:null,stil_omgekeerd:!!e?.snapshot_stil_omgekeerd}})}function Kf(a,e){if(!e)return!0;for(let t of Object.keys(a))if(!Uo(a[t],e[t]))return!0;return!1}function fp(a,e,t){return Pf(a,e).filter(n=>Kf(n,t?.[n.camera]))}function Uo(a,e){return Array.isArray(a)&&Array.isArray(e)?a.length===e.length&&a.every((t,n)=>Uo(t,e[n])):a&&e&&typeof a=="object"&&typeof e=="object"?[...new Set([...Object.keys(a),...Object.keys(e)])].every(n=>Uo(a[n],e[n])):a===e}function Gf(a){return Array.isArray(a)?a.filter(e=>typeof e=="string"):typeof a=="string"&&a?[a]:[]}function gp(a,e){let t=Number(a);return Number.isFinite(t)&&t>=0?Math.round(t):e}var Wf=`
  ${U}
  :host {
    ${W}
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
`;function ft(a){return String(a??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}var Fo=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[Q(Wf)],this.beelden_=[]}open(e){F(this),this.opts_=e,this.beelden_=e.beelden??[],this.gebouwd_||this.bouw_(),this.setAttribute("open",""),this.alleenBeeld_=!!e.beeld,this.$(".scherm").hidden=this.alleenBeeld_,e.beeld?this.toonGroot_(e.beeld):this.$(".groot").hidden=!0,this.teken_()}zet(e){this.beelden_=e??[],this.hasAttribute("open")&&this.teken_()}sluit(){this.removeAttribute("open"),this.opts_?.dicht?.()}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.gebouwd_=!0,this.shadowRoot.innerHTML=`
      <div class="scherm">
        <div class="kop">
          <button type="button" class="terug">${v("chevronRight")}<span>Terug</span></button>
          <span class="titel">Snapshots</span>
          <span class="stat"></span>
          <span class="rek"></span>
          <button type="button" class="wis">Alles wissen</button>
        </div>
        <div class="lijst"></div>
        <div class="voet">Snapshots blijven een week staan en verdwijnen daarna vanzelf, oudste eerst. Per camera worden er hoogstens 500 bewaard.</div>
      </div>
      <div class="groot" hidden>
        <button type="button" class="terug">${v("chevronRight")}<span>Terug</span></button>
        <img alt=""><div class="onder"></div>
      </div>`,this.shadowRoot.addEventListener("click",e=>{e.stopPropagation();let t=this.$(".groot");if(!t.hidden&&e.composedPath().includes(t)){if(this.alleenBeeld_)return this.sluit();t.hidden=!0;return}if(e.target.closest?.(".terug"))return this.sluit();let n=e.target.closest?.("[data-weg]");if(n){let o=this.beelden_.find(s=>s.id===n.dataset.weg);return this.opts_?.wis?.([n.dataset.weg],o?`dit beeld van ${o.naam??"de camera"}`:"dit beeld")}let i=e.target.closest?.("[data-wisdag]");if(i){let o=Ko(this.beelden_).find(s=>String(s.dag)===i.dataset.wisdag);return o?this.opts_?.wis?.(o.beelden.map(s=>s.id),`${o.beelden.length} beelden van ${Pt(o.dag).toLowerCase()}`):void 0}if(e.target.closest?.(".wis"))return this.beelden_.length?this.opts_?.wis?.(this.beelden_.map(o=>o.id),`alle ${this.beelden_.length} beelden`):void 0;let r=e.target.closest?.("[data-beeld]");r&&this.toonGroot_(r.dataset.beeld)}),this.tabIndex=-1,this.addEventListener("keydown",e=>{e.key==="Escape"&&(e.stopPropagation(),!this.$(".groot").hidden&&!this.alleenBeeld_?this.$(".groot").hidden=!0:this.sluit())})}toonGroot_(e){let t=this.beelden_.find(i=>i.id===e);if(!t)return;let n=this.$(".groot");n.querySelector("img").src=t.url,n.querySelector(".onder").textContent=`${this.opts_.camNaam(t.camera)} \xB7 ${t.naam??""} \xB7 ${this.opts_.klok(t.tijd,!0)}`,n.hidden=!1}teken_(){if(this.alleenBeeld_)return;let e=Ko(this.beelden_),t=this.beelden_.reduce((r,o)=>r+(Number(o.bytes)||0),0),n=this.opts_.meerdere;this.$(".stat").textContent=this.beelden_.length?`${this.beelden_.length} beelden \xB7 ${Go(t)}`:"",this.$(".wis").disabled=!this.beelden_.length,this.$(".lijst").innerHTML=e.length?e.map(r=>{let o=r.dag===null?"Zonder datum":Pt(r.dag);return`<div class="dagkop"><span>${ft(o)}</span><span class="bij">${r.beelden.length} \xB7 ${Go(r.bytes)}</span><button type="button" data-wisdag="${r.dag}">Wis deze dag</button></div><div class="raster">`+r.beelden.map(s=>{let l=n?`${ft(this.opts_.camNaam(s.camera))} \xB7 `:"";return`<button type="button" class="kiek" data-beeld="${ft(s.id)}"><img src="${ft(s.url)}" alt="" loading="lazy"><span class="bij">${l}${ft(s.naam??"")} \xB7 ${ft(this.opts_.klok(s.tijd))}</span><span class="weg" role="button" data-weg="${ft(s.id)}" aria-label="Verwijder">${v("close")}</span></button>`}).join("")+"</div>"}).join(""):'<div class="leeg">Er liggen geen snapshots.</div>';let i=this.$(".groot");!i.hidden&&this.alleenBeeld_===!1&&(this.beelden_.some(o=>i.querySelector("img").src.includes(o.id))||(i.hidden=!0))}};H("domotiapp-camera-archief",Fo);function bp(a){let e=document.querySelector("domotiapp-camera-archief");return e||(e=document.createElement("domotiapp-camera-archief"),document.body.appendChild(e)),e.open(a),e.focus?.(),e}function qo(a){document.querySelector("domotiapp-camera-archief")?.zet(a)}function Xa(a){let e=Number(a);return Number.isFinite(e)?Math.max(1,Math.min(6,e)):1}function Uf(a){let e=Xa(a);return Math.max(0,(1-1/e)/2)}function vn(a,e,t){let n=Uf(t),i=o=>Number.isFinite(Number(o))?Number(o):0,r=o=>Math.max(-n,Math.min(n,i(o)))+0;return{x:r(a),y:r(e)}}function Qa(a,e,t={x:0,y:0}){let n=Xa(a?.zoom??1),i=Xa(n*(Number(e)||1));if(i===n)return{zoom:n,...vn(a?.x,a?.y,n)};let r=Number(t?.x)||0,o=Number(t?.y)||0,s=(a?.x??0)+r*(1/n-1/i),l=(a?.y??0)+o*(1/n-1/i);return{zoom:i,...vn(s,l,i)}}function vp({zoom:a=1,x:e=0,y:t=0}={}){let n=Xa(a),i=vn(e,t,n);return`scale(${n}) translate(${(-i.x*100).toFixed(3)}%, ${(-i.y*100).toFixed(3)}%)`}var xp=[{sleutel:"auto",label:"Volgt de camera",css:null},{sleutel:"16:9",label:"16:9 (breed)",css:"16 / 9"},{sleutel:"4:3",label:"4:3",css:"4 / 3"},{sleutel:"3:2",label:"3:2",css:"3 / 2"},{sleutel:"1:1",label:"Vierkant",css:"1 / 1"}],Ff=7,Ja=[{k:"up",icoon:"arrowUp",label:"Omhoog"},{k:"left",icoon:"chevronRight",label:"Links",draai:180},{k:"right",icoon:"chevronRight",label:"Rechts"},{k:"down",icoon:"arrowDown",label:"Omlaag"}];function wp(a){return!!(a.presets||Array.isArray(a.preset_buttons)&&a.preset_buttons.length||Ja.some(e=>a[`ptz_${e.k}`]))}var ei=class extends S{validate(e){let t={name:"",...e};return!t.camera&&!(Array.isArray(t.cameras)&&t.cameras.length)&&(t[C]="Kies een camera. Presets, richtingsknoppen en een bewegingsmelder mogen daarna."),t.presets_aan===void 0&&(t.presets_aan=wp(t)),t}watched(){let e=this.config;return[...this.cameras_(),e.presets,e.snapshot_stil,...this.melders_().map(t=>t.entity),...Array.isArray(e.preset_buttons)?e.preset_buttons:[]].filter(Boolean)}paintStil_(){let e=this.$(".stil");if(!e)return;let t=this.config.snapshot_stil;if(!t){e.hidden=!0;return}let n=k(this.hass,t),i=Z(n)===!!this.config.snapshot_stil_omgekeerd;e.hidden=!1,e.setAttribute("aria-pressed",String(i));let r=i?"Meldingen staan aan; tik om ze uit te zetten":"Meldingen staan uit; tik om ze weer aan te zetten";e.setAttribute("aria-label",r),e.title=r;let o=i?"bell":"bellOff";e.dataset.icoon!==o&&(e.dataset.icoon=o,e.innerHTML=v(o))}melders_(){let e=this.config,t=[...Array.isArray(e.motion_sensors)?e.motion_sensors:[],...e.motion?[e.motion]:[]].filter(n=>typeof n=="string");return[...new Set(t)].map(n=>{let i=e[`melder:${n}`]||M(this.hass,n)||"Beweging";return{entity:n,naam:i,bijCamera:e[`melderbij:${n}`],soort:e[`meldersoort:${n}`]||qa(n,i,k(this.hass,n)?.attributes?.device_class)}})}cameras_(){let e=this.config,t=[e.camera,...Array.isArray(e.cameras)?e.cameras:[]].filter(Boolean);return[...new Set(t)]}huidig_(){let e=this.cameras_();return e.includes(this.cam_)?this.cam_:e[0]}template(){return this.config.bare&&this.setAttribute("bare",""),this.stand_=this.stand_??{zoom:1,x:0,y:0},`
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
            ${Ja.map(t=>`<button type="button" data-r="${t.k}" aria-label="${t.label}"${t.draai?` style="transform: rotate(${t.draai}deg)"`:""}>${v(t.icoon)}</button>`).join("")}
          </div>
          <div class="presets" hidden></div>
        </div>
        <div class="cams" hidden></div>
        <div class="filters" hidden>
          <div class="rij dagrij">
            <button type="button" class="pijl" data-dag="-1" aria-label="Dag terug">
              ${v("chevronRight")}
            </button>
            <button type="button" class="datum">Vandaag</button>
            <button type="button" class="pijl" data-dag="1" aria-label="Dag verder">
              ${v("chevronRight")}
            </button>
            <span class="rek"></span>
            <button type="button" class="stil" aria-pressed="false" aria-label="Meldingen uit" title="Meldingen uit" hidden>
              ${v("bell")}
            </button>
            <button type="button" class="opslag" aria-label="Alle snapshots">
              ${v("storage")}
            </button>
          </div>
          <div class="dagmenu" hidden></div>
          <div class="rij soorten"></div>
          <div class="rij camkeuze" hidden></div>
        </div>
        <div class="tijdlijn" hidden></div>
      </div>
`}wire(){this.teardown_.push(V(this.$(".card"))),this.on(this.$(".ptz"),"click",e=>{let t=e.target.closest?.("[data-r]");t&&(e.stopPropagation(),this.draai_(t.dataset.r))}),this.on(this.$(".presets"),"click",e=>{let t=e.target.closest?.("[data-p]");t&&(e.stopPropagation(),this.preset_(t.dataset.p,t.dataset.soort))}),this.on(this.$(".cams"),"click",e=>{let t=e.target.closest?.("[data-cam]");t&&(e.stopPropagation(),this.cam_=t.dataset.cam,this.stand_={zoom:1,x:0,y:0},this.paint())}),this.filterLuisteraars_(),this.wielScroll_(),this.zoomLuisteraars_(),this.bewaakStream_(),this.bewakingWire_()}filterLuisteraars_(){let e=this.$(".filters");this.on(e,"click",n=>{let i=n.target.closest?.(".pijl");if(i&&!i.disabled){n.stopPropagation();let l=Number(i.dataset.dag),d=this.dag_??ue(Date.now()).vanaf,c=Ya(Po(this.beelden_??[]),d,l);this.zetDag_(c??Wo(d,l));return}if(n.target.closest?.(".opslag")){n.stopPropagation(),this.openArchief_();return}if(n.target.closest?.(".stil")){n.stopPropagation(),this.config.snapshot_stil&&this.hass?.callService("homeassistant","toggle",{entity_id:this.config.snapshot_stil});return}if(n.target.closest?.(".datum")){n.stopPropagation(),this.wisselDagmenu_();return}let r=n.target.closest?.("[data-kies]");if(r){n.stopPropagation(),this.sluitDagmenu_(),this.zetDag_(Number(r.dataset.kies));return}let o=n.target.closest?.("[data-soort-filter]");if(o){n.stopPropagation(),this.wisselSoort_(o.dataset.soortFilter);return}let s=n.target.closest?.("[data-camfilter]");s&&(n.stopPropagation(),this.camFilter_=s.dataset.camfilter||null,this.paintFilters_(),this.paintTijdlijn_(!0))});let t=n=>{this.$(".dagmenu")?.hidden||n.composedPath().includes(this.$(".dagmenu"))||n.composedPath().includes(this.$(".datum"))||this.sluitDagmenu_()};document.addEventListener("click",t,!0),this.teardown_.push(()=>document.removeEventListener("click",t,!0))}wisselDagmenu_(){let e=this.$(".dagmenu");if(!e.hidden)return this.sluitDagmenu_();this.paintDagmenu_(),e.hidden=!1,this.$(".datum").setAttribute("aria-expanded","true"),e.scrollIntoView({block:"nearest"})}sluitDagmenu_(){this.$(".dagmenu").hidden=!0,this.$(".datum").setAttribute("aria-expanded","false")}paintDagmenu_(){let e=ue(Date.now()).vanaf,t=this.dag_??e,n=this.beelden_??[],i=[];for(let r=0;r<Ff;r++){let o=Wo(e,-r),s=Za(n,{dag:o,config:this.config}).length;i.push({dag:o,label:Pt(o),aantal:s})}this.$(".dagmenu").innerHTML=i.map(r=>`<button type="button" data-kies="${r.dag}" aria-current="${r.dag===t}"${r.aantal?"":" data-leeg"}><span>${rt(r.label)}</span><span class="telling">${r.aantal||"\u2014"}</span></button>`).join("")}wielScroll_(){for(let e of[".tijdlijn",".cams",".camkeuze",".presets"]){let t=this.$(e);t&&this.on(t,"wheel",n=>{if(Math.abs(n.deltaX)>Math.abs(n.deltaY))return;let i=t.scrollWidth-t.clientWidth;i<=1||(n.deltaY>0?Math.ceil(t.scrollLeft)>=i:t.scrollLeft<=0)||(n.preventDefault(),t.scrollLeft+=n.deltaY)},{passive:!1})}}zetDag_(e){let t=ue(Date.now()).vanaf;this.dag_=Math.min(ue(e).vanaf,t),this.paintFilters_(),this.paintTijdlijn_(!0)}wisselSoort_(e){this.soorten_=this.soorten_ instanceof Set?this.soorten_:new Set,this.soorten_.has(e)?this.soorten_.delete(e):this.soorten_.add(e),this.paintFilters_(),this.paintTijdlijn_(!0)}zichtbareBeelden_(){return Za(this.beelden_??[],{soorten:this.soorten_,camera:this.camFilter_,dag:this.dag_??ue(Date.now()).vanaf,config:this.config})}paintFilters_(){let e=this.$(".filters");if(!e||(e.hidden=!this.config.snapshots,e.hidden))return;let t=this.beelden_??[],n=this.dag_??ue(Date.now()).vanaf;this.text(".datum",Pt(n));let i=Po(t);this.$('.pijl[data-dag="-1"]').disabled=Ya(i,n,-1)===null,this.$('.pijl[data-dag="1"]').disabled=n>=ue(Date.now()).vanaf||Ya(i,n,1)===null,this.paintSoorten_(Za(t,{camera:this.camFilter_,dag:n,config:this.config})),this.paintCamFilter_()}paintSoorten_(e){let t=this.$(".soorten"),n=hp(e,this.config),i=up(this.melders_()),r=this.soorten_ instanceof Set?this.soorten_:new Set;t.hidden=!i.length;let o=i.map(s=>`${s.sleutel}:${n[s.sleutel]??0}:${r.has(s.sleutel)}`).join(",");t.dataset.sig!==o&&(t.dataset.sig=o,t.innerHTML=i.map(s=>{let l=n[s.sleutel]??0;return`<button type="button" data-soort-filter="${s.sleutel}" aria-pressed="${r.has(s.sleutel)}" aria-label="${s.label}"${l?"":" data-leeg"}>${v(s.icoon)}<span>${l}</span></button>`}).join(""))}paintCamFilter_(){let e=this.$(".camkeuze"),t=this.cameras_(),n=this.melders_().map(s=>Bo(this.hass,s.entity,t,s.bijCamera)),i=mp(t,n,this.beelden_??[]);if(e.hidden=i.length<2,i.length<2){this.camFilter_&&!i.includes(this.camFilter_)&&(this.camFilter_=null,this.paintTijdlijn_(!0));return}this.camFilter_&&!i.includes(this.camFilter_)&&(this.camFilter_=null,this.paintTijdlijn_(!0));let r=i.map(s=>this.camNaam_(s)),o=`${i.join(",")}|${r.join(",")}|${this.camFilter_??""}`;e.dataset.sig!==o&&(e.dataset.sig=o,e.innerHTML=`<button type="button" data-camfilter="" aria-pressed="${!this.camFilter_}">Alle</button>`+i.map((s,l)=>`<button type="button" data-camfilter="${rt(s)}" aria-pressed="${this.camFilter_===s}">${rt(r[l])}</button>`).join(""))}zoomLuisteraars_(){let e=this.$(".vak"),t=new Map,n=null,i=null,r=0,o=l=>{let d=e.getBoundingClientRect();return{x:(l.clientX-d.left)/d.width-.5,y:(l.clientY-d.top)/d.height-.5}};this.on(e,"wheel",l=>{l.preventDefault(),this.zet_(Qa(this.stand_,l.deltaY<0?1.18:1/1.18,o(l)))},{passive:!1}),this.on(e,"pointerdown",l=>{if(t.set(l.pointerId,l),e.setPointerCapture?.(l.pointerId),r=0,t.size===2){let[d,c]=[...t.values()];i={afstand:Math.hypot(d.clientX-c.clientX,d.clientY-c.clientY),stand:{...this.stand_}},n=null}else this.stand_.zoom>1&&(n={x:l.clientX,y:l.clientY,stand:{...this.stand_}},this.setAttribute("sleept",""))}),this.on(e,"pointermove",l=>{if(t.has(l.pointerId)){if(t.set(l.pointerId,l),r=Math.max(r,Math.abs(l.movementX??0)+Math.abs(l.movementY??0)),i&&t.size===2){let[d,c]=[...t.values()],p=Math.hypot(d.clientX-c.clientX,d.clientY-c.clientY),h={x:(d.clientX+c.clientX)/2,y:(d.clientY+c.clientY)/2},u=e.getBoundingClientRect();this.zet_(Qa(i.stand,p/(i.afstand||1),{x:(h.x-u.left)/u.width-.5,y:(h.y-u.top)/u.height-.5}));return}if(n){let d=e.getBoundingClientRect(),c=(l.clientX-n.x)/d.width/this.stand_.zoom,p=(l.clientY-n.y)/d.height/this.stand_.zoom;this.zet_({zoom:this.stand_.zoom,...vn(n.stand.x-c,n.stand.y-p,this.stand_.zoom)})}}});let s=l=>{t.delete(l.pointerId),t.size<2&&(i=null),t.size||(n=null,this.removeAttribute("sleept"))};this.on(e,"pointerup",s),this.on(e,"pointercancel",s),this.on(e,"dblclick",l=>{l.target.closest(".presets, .ptz")||(l.preventDefault(),this.zet_(this.stand_.zoom>1?{zoom:1,x:0,y:0}:Qa({zoom:1,x:0,y:0},2.5,o(l))))}),this.on(e,"click",l=>{l.target.closest(".presets, .ptz")||r>6||this.config.tap_zoom!==!1&&K(this,this.huidig_())})}zet_(e){this.stand_=e,this.toggleAttribute("zoom",e.zoom>1),this.$(".schuif").style.setProperty("--tf",vp(e))}draai_(e){let t=this.config[`ptz_${e}`];if(!t)return;let n=String(t).split(".")[0];this.hass.callService(n,n==="button"?"press":"turn_on",{entity_id:t})}preset_(e,t){if(t==="knop"){let r=String(e).split(".")[0];return this.hass.callService(r,r==="button"?"press":"turn_on",{entity_id:e})}let n=this.config.presets,i=String(n).split(".")[0];return this.hass.callService(i,"select_option",{entity_id:n,option:e})}paint(){let e=this.config,t=this.huidig_(),n=k(this.hass,t),i=!n||n.state==="unavailable";this.toggleAttribute("dead",!!i),this.text(".nm",e.name||M(this.hass,t,"Camera")),this.paintStil_();let r=(this.live_===!0||e.live_view===!0)&&!this.streamStuk_&&this.magLive_(),o=this.$(".schuif");if(i){if(!this.$(".vak .leeg")){let l=document.createElement("span");l.className="leeg",l.textContent="Deze camera is niet bereikbaar",this.$(".vak").appendChild(l)}}else this.$(".vak .leeg")?.remove(),Pa(o,this.hass,t,{live:r});let s=this.$('.merk[data-soort="live"]');s.hidden=!r||i,this.paintMelders_(),this.zet_(this.stand_),this.paintPtz_(),this.paintPresets_(),this.paintCams_(t),this.paintFilters_(),this.paintTijdlijn_(),this.paintVorm_(),R(this.$(".card"))}bewaakStream_(){let t=setInterval(()=>{if(!this.isConnected)return;let i=this.$(".schuif")?.querySelector(".beeld");if(!i?.shadowRoot)return;if(this.zoekAlert_(i.shadowRoot,4)&&!this.streamStuk_){this.valTerug_();return}let r=this.zoekVideo_(i.shadowRoot,4);if(r&&!r.paused){let o=r.currentTime;this.laatsteTijd_===o?(this.stilTellen_=(this.stilTellen_??0)+1,this.stilTellen_>=5&&this.herstart_()):(this.stilTellen_=0,this.laatsteTijd_=o)}},2e3);this.teardown_.push(()=>{clearInterval(t),clearTimeout(this.streamHerkansing_)});let n=()=>{document.visibilityState==="visible"&&this.herstart_()};document.addEventListener("visibilitychange",n),this.teardown_.push(()=>document.removeEventListener("visibilitychange",n))}magLive_(){return this.liveVrij_?!0:(this.liveTimer_||(this.liveTimer_=setTimeout(()=>{this.liveVrij_=!0,this.isConnected&&this.paint()},1500),this.teardown_.push(()=>{clearTimeout(this.liveTimer_),this.liveTimer_=null,this.liveVrij_=!1})),!1)}valTerug_(){this.streamStuk_=!0,this.paint(),clearTimeout(this.streamHerkansing_),this.streamHerkansing_=setTimeout(()=>{this.streamStuk_=!1,this.paint()},3e4)}herstart_(){let e=this.$(".schuif")?.querySelector(".beeld");!e||e.localName!=="hui-image"||e.cameraView==="live"&&(this.stilTellen_=0,this.laatsteTijd_=null,e.cameraView="auto",clearTimeout(this.herstartTimer_),this.herstartTimer_=setTimeout(()=>{let t=this.$(".schuif")?.querySelector(".beeld");t&&t.localName==="hui-image"&&!this.streamStuk_&&(t.cameraView="live")},600),this.teardown_.push(()=>clearTimeout(this.herstartTimer_)))}zoekVideo_(e,t){if(!e||t<=0)return null;let n=e.querySelector?.("video");if(n)return n;for(let i of e.querySelectorAll?.("*")??[])if(i.shadowRoot){let r=this.zoekVideo_(i.shadowRoot,t-1);if(r)return r}return null}zoekAlert_(e,t){if(!e||t<=0)return null;let n=e.querySelector?.("ha-alert");if(n)return n;for(let i of e.querySelectorAll?.("*")??[])if(i.shadowRoot){let r=this.zoekAlert_(i.shadowRoot,t-1);if(r)return r}return null}paintMelders_(){let e=this.$(".melders"),t=this.huidig_(),n=this.cameras_(),i=this.melders_().filter(o=>Z(k(this.hass,o.entity))&&Fa(this.hass,o.entity,n,o.bijCamera,t)),r=t+"::"+i.map(o=>`${o.entity}|${o.naam}|${o.soort}`).join(",");e.dataset.sig!==r&&(e.dataset.sig=r,e.innerHTML=i.map(o=>`<span class="merk" data-soort="beweging">${v(cp(o.soort).icoon)}<span>${this.veilig_(o.naam)}</span></span>`).join(""))}paintPtz_(){let e=this.config,t=this.$(".ptz"),n=e.presets_aan!==!1&&Ja.some(i=>e[`ptz_${i.k}`]);if(t.hidden=!n,!!n)for(let i of Ja){let r=t.querySelector(`[data-r="${i.k}"]`);r&&(r.hidden=!e[`ptz_${i.k}`])}}paintPresets_(){let e=this.config,t=this.$(".presets"),n=[],i=e.presets_aan===!1?null:k(this.hass,e.presets),r=i?.attributes?.options;if(Array.isArray(r))for(let l of r)n.push({waarde:l,naam:l,soort:"keuze",aan:i.state===l});let o=e.presets_aan!==!1&&Array.isArray(e.preset_buttons)?e.preset_buttons:[];for(let l of o)k(this.hass,l)&&n.push({waarde:l,naam:M(this.hass,l,l),soort:"knop",aan:!1});if(t.hidden=!n.length,!n.length)return;let s=n.map(l=>`${l.waarde}|${l.aan}`).join(",");t.dataset.sig!==s&&(t.dataset.sig=s,t.innerHTML=n.map(l=>`<button type="button" data-p="${this.veilig_(l.waarde)}" data-soort="${l.soort}" aria-pressed="${l.aan}">${this.veilig_(l.naam)}</button>`).join(""))}camNaam_(e){let t=this.config;return e===t.camera&&t.name?t.name:t[`cam:${e}`]||M(this.hass,e)||e}paintCams_(e){let t=this.cameras_(),n=this.$(".cams");if(n.hidden=t.length<2,t.length<2)return;let i=t.map(o=>this.camNaam_(o)),r=`${t.join(",")}|${i.join(",")}|${e}`;n.dataset.sig!==r&&(n.dataset.sig=r,n.innerHTML=t.map((o,s)=>`<button type="button" data-cam="${this.veilig_(o)}" aria-pressed="${o===e}">${this.veilig_(i[s])}</button>`).join(""))}veilig_(e){let t=document.createElement("div");return t.textContent=e??"",t.innerHTML}getCardSize(){return 5}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:this.minRijen_(".card",3)}}paintVorm_(){let e=[".cams",".filters",".tijdlijn"].some(n=>this.$(n)&&!this.$(n).hidden);this.toggleAttribute("alleenbeeld",!e);let t=xp.find(n=>n.sleutel===this.config.verhouding);t?.css?(this.setAttribute("verhouding",t.sleutel),this.style.setProperty("--dac-verhouding",t.css)):(this.removeAttribute("verhouding"),this.style.removeProperty("--dac-verhouding"))}bewakingWire_(){let e=this.$(".tijdlijn");if(!e)return;if(!this.config.snapshots){e.hidden=!0,this.beelden_=[];return}this.on(e,"click",n=>{let i=n.target.closest?.("[data-beeld]");i&&(n.stopPropagation(),this.openArchief_(i.dataset.beeld))}),this.hass?.connection?.sendMessagePromise&&(this.bewakingHaal_(),this.bewakingLuister_(),clearTimeout(this.regelTimer_),this.regelTimer_=setTimeout(()=>this.bewakingRegels_(),1500),this.teardown_.push(()=>clearTimeout(this.regelTimer_)))}inDialoog_(){let e=this;for(let t=0;t<40;t++){let n=e.getRootNode?.()?.host;if(!n)return!1;let i=n.localName??"";if(i.startsWith("hui-dialog")||i==="hui-card-preview")return!0;e=n}return!1}bewakingCameras_(){return this.cameras_()}async bewakingHaal_(){try{let e=await this.hass.connection.sendMessagePromise({type:"domotiapp_lovelace/bewaking/timeline",cameras:this.bewakingCameras_(),limiet:0});this.beelden_=e?.beelden??[]}catch{this.beelden_=[]}this.paintFilters_(),this.paintTijdlijn_(!0)}async bewakingLuister_(){try{let e=await this.hass.connection.subscribeMessage(t=>this.bewakingBericht_(t),{type:"domotiapp_lovelace/bewaking/subscribe",cameras:this.bewakingCameras_()});this.isConnected?this.teardown_.push(e):e()}catch{}}bewakingBericht_(e){let t=this.beelden_??[];if(e?.soort==="nieuw"&&e.beeld)this.beelden_=[e.beeld,...t];else if(e?.soort==="opgeruimd"&&Array.isArray(e.ids)){let n=new Set(e.ids);this.beelden_=t.filter(i=>!n.has(i.id))}else return;this.paintFilters_(),this.paintTijdlijn_(!0),qo(this.beelden_)}async bewakingRegels_(){if(this.inDialoog_())return;let e=this.hass?.connection;if(!e?.sendMessagePromise)return;let t={};try{t=(await e.sendMessagePromise({type:"domotiapp_lovelace/bewaking/get"}))?.regels??{}}catch{return}for(let n of fp(this.hass,this.config,t))try{await e.sendMessagePromise({type:"domotiapp_lovelace/bewaking/save",regel:n})}catch(i){console.warn("DomotiApp: bewakingsregel geweigerd",n.camera,i)}}paintTijdlijn_(e=!1){let t=this.$(".tijdlijn");if(!t)return;if(!this.config.snapshots){t.hidden=!0;return}t.hidden=!1,e&&(this.tijdlijnTeken_=null);let n=this.zichtbareBeelden_(),i=this.cameras_().length>1,r=`${i}|${this.cameras_().map(o=>this.camNaam_(o)).join("|")}|${n.map(o=>o.id).join(",")}`;if(this.tijdlijnTeken_!==r){if(this.tijdlijnTeken_=r,!n.length){let o=(this.beelden_??[]).length>0;t.innerHTML=`<span class="leeg">${o?"Niets binnen dit filter.":"Nog geen beelden."}</span>`;return}t.innerHTML=n.map(o=>{let s=rt(this.camNaam_(o.camera)),l=rt(o.naam??""),d=rt(kp(this.hass,o.tijd)),c=i?`<span class="cam">${s}</span>`:"";return`<button type="button" class="mini" data-beeld="${rt(o.id)}" aria-label="${i?s+", ":""}${l} om ${d}"><img src="${rt(o.url)}" alt="" loading="lazy"><span class="bij">${c}<span><b>${l}</b> \xB7 ${d}</span></span></button>`}).join("")}}openArchief_(e){this.slotLos_?.(),this.slotLos_=xa(),this.teardown_.push(()=>this.slotLos_?.()),bp({beelden:this.beelden_??[],beeld:e,meerdere:this.cameras_().length>1,camNaam:t=>this.camNaam_(t),klok:(t,n)=>kp(this.hass,t,n),wis:(t,n)=>this.wis_(t,n),dicht:()=>{this.slotLos_?.(),this.slotLos_=null}})}async wis_(e,t){if(!e?.length||!await Se({title:"Snapshots verwijderen",text:`Weet je zeker dat je ${t} wilt verwijderen? Weg is weg.`,confirmText:"Verwijderen",dismissText:"Annuleren"}))return;try{await this.hass.connection.sendMessagePromise({type:"domotiapp_lovelace/bewaking/verwijder",ids:e})}catch(r){console.warn("DomotiApp: verwijderen mislukt",r);return}let i=new Set(e);this.beelden_=(this.beelden_??[]).filter(r=>!i.has(r.id)),this.paintFilters_(),this.paintTijdlijn_(!0),qo(this.beelden_)}static getConfigElement(){return document.createElement("domotiapp-camera-card-editor")}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("camera."));return n?{camera:n}:{}}};j(ei,"css",`
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
      border-radius: var(--dac-radius-sm); box-shadow: 0 18px 40px -14px rgba(0,0,0,calc(.72 * var(--dac-diepte)));
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

    .filters .opslag, .filters .stil {
      flex: 0 0 auto; width: 30px; height: 30px; display: grid; place-items: center;
      padding: 0; font: inherit; cursor: pointer; color: var(--dac-ink-2);
      background: var(--dac-surface); border: 1px solid var(--dac-border);
      border-radius: var(--dac-radius-sm);
    }
    .filters .opslag .icon, .filters .stil .icon { width: 15px; height: 15px; }
    /* De belknop: licht op (accent) zolang de meldingen AAN staan, en is
       gedoofd met een doorgestreepte bel als ze uit staan -- alleen het
       icoon draagt de toestand, net als overal. Gevraagd op 10 september
       2026: "een schakelaar erin, als die aanstaat geeft hij geen
       pushmeldingen; mooi weggewerkt in de kaart", en "het icoon oplichten
       is aan en niet oplichten is uit." */
    .filters .stil[aria-pressed="true"] {
      color: var(--dac-accent-hi);
      background: color-mix(in srgb, var(--dac-accent-hi) 14%, transparent);
      border-color: color-mix(in srgb, var(--dac-accent-hi) 32%, transparent);
    }
    .filters .stil[hidden] { display: none; }
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
  `);function kp(a,e,t=!1){if(!e)return"";let n=new Date(e);if(Number.isNaN(n.getTime()))return"";let i=a?.locale?.language??"nl",r=n.toLocaleTimeString(i,{hour:"2-digit",minute:"2-digit"}),o=new Date;return n.getDate()===o.getDate()&&n.getMonth()===o.getMonth()&&n.getFullYear()===o.getFullYear()&&!t?r:`${n.toLocaleDateString(i,{weekday:"short",day:"numeric",month:"short"})} ${r}`}function rt(a){return String(a??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}var Zo=class extends L{pickers(){return[]}setConfig(e){let t=e??{},n=[...Array.isArray(t.motion_sensors)?t.motion_sensors:[],...t.motion?[t.motion]:[]].filter(r=>typeof r=="string"),i={presets_aan:wp(t)};for(let r of n){let o=this.hass_?.states?.[r]?.attributes,s=t[`melder:${r}`]||o?.friendly_name,l=qa(r,s,o?.device_class);l&&(i[`meldersoort:${r}`]=l)}super.setConfig({...i,...t})}schema(){let e=this.config_??{},t=s=>Array.isArray(s)?s.filter(l=>typeof l=="string"):[],n=t(e.cameras).map(s=>({name:`cam:${s}`,selector:f.text()})),i=[e.camera,...t(e.cameras)].filter(Boolean),r=t(e.motion_sensors).flatMap(s=>{let l=[{name:`melder:${s}`,selector:f.text()},{name:`meldersoort:${s}`,selector:f.select(bn.map(d=>({value:d.sleutel,label:d.label})))}];return i.length>1&&l.push({name:`melderbij:${s}`,selector:f.select([{value:"",label:"Bij alle camera's"},...i.map(d=>({value:d,label:this.hass?.states?.[d]?.attributes?.friendly_name??d}))])}),l}),o=e.snapshots?[{name:"snapshot_rustperiode",selector:f.number(0,3600)},{name:"snapshot_wachttijd",selector:f.number(0,60)},{name:"snapshot_ontvangers",selector:{entity:{domain:"person",multiple:!0}}},{name:"snapshot_alleen_afwezig",selector:f.bool()},{name:"snapshot_stil",selector:f.entity(["input_boolean","switch"])},...e.snapshot_stil?[{name:"snapshot_stil_omgekeerd",selector:f.bool()}]:[]]:[];return[{name:"camera",selector:f.entity("camera")},{name:"name",selector:f.text()},{name:"live_view",selector:f.bool()},{name:"verhouding",selector:f.select(xp.map(s=>({value:s.sleutel,label:s.label})))},{name:"cameras",selector:{entity:{domain:"camera",multiple:!0}}},...n,{name:"presets_aan",selector:f.bool()},...e.presets_aan?[Be("Presets en draaien","mdi:arrow-all",[{name:"presets",selector:f.entity(["select","input_select"])},{name:"preset_buttons",selector:{entity:{domain:["button","scene","script"],multiple:!0}}},{name:"ptz_up",selector:f.entity(["button","switch"])},{name:"ptz_down",selector:f.entity(["button","switch"])},{name:"ptz_left",selector:f.entity(["button","switch"])},{name:"ptz_right",selector:f.entity(["button","switch"])}])]:[],{name:"motion_sensors",selector:{entity:{domain:["binary_sensor","event","lock"],multiple:!0}}},...r,{name:"snapshots",selector:f.bool()},...o.length?[Be("Snapshots en meldingen","mdi:camera-burst",o)]:[]]}label(e){return e.name.startsWith("cam:")?`Naam voor ${M(this.hass,e.name.slice(4))||e.name.slice(4)}`:e.name.startsWith("melder:")?`Naam voor ${M(this.hass,e.name.slice(7))||e.name.slice(7)}`:e.name.startsWith("melderbij:")?"\u21B3 hoort bij welke camera":e.name.startsWith("meldersoort:")?"\u21B3 wat ziet hij":{camera:"Camera",name:"Naam",live_view:"Altijd live",verhouding:"Beeldverhouding",presets:"Presets (keuzelijst)",preset_buttons:"Presets als losse knoppen",motion:"Bewegingsmelder",motion_sensors:"Bewegingsmelders",ptz_up:"Draaien: omhoog",ptz_down:"Draaien: omlaag",ptz_left:"Draaien: links",ptz_right:"Draaien: rechts",cameras:"Nog meer camera's op deze kaart",snapshots:"Snapshots en timeline",snapshot_rustperiode:"Rustperiode per melder (seconden)",snapshot_wachttijd:"Wachten voor het beeld (seconden)",snapshot_ontvangers:"Wie krijgt een melding",snapshot_alleen_afwezig:"Alleen melden als er niemand thuis is",snapshot_stil:"Schakelaar: meldingen uit",snapshot_stil_omgekeerd:"Schakelaar omgekeerd: aan = meldingen aan",presets_aan:"Presets en draaien"}[e.name]??super.label(e)}helper(e){return e.name.startsWith("meldersoort:")?"Bepaalt onder welke filterknop zijn beelden in de timeline vallen, en welk icoon er op het beeld staat als hij afgaat. Hij wordt geraden uit de naam \u2014 een Reolink klopt vanzelf.":e.name.startsWith("melderbij:")?"Laat dit op 'alle camera's' staan als je het niet weet. De kaart koppelt een melder vanzelf aan de camera waar hij op hetzelfde apparaat zit \u2014 bij een Reolink hoeft je dus niets in te vullen.":{camera:"Op de kaart staat een beeld dat zichzelf ververst. Inzoomen doe je met twee vingers, met het scrollwiel of met een dubbeltik; een gewone tik opent hem groot. Er staan geen knoppen op het beeld.",name:"De naam van de camera zelf. Hij staat linksboven op het beeld, en ook in de rij eronder als je meer camera's op deze kaart hebt staan.",live_view:"De stream staat dan altijd open. Mooier, maar op een dashboard met zes camera's zijn dat zes streams die de hele dag doorlopen.",presets:"De `select` van je camera-integratie \u2014 Reolink en ONVIF leveren die. De kaart maakt van elke optie een knop, onderin het beeld, dus een preset die je in de camera-app toevoegt verschijnt er vanzelf bij.",preset_buttons:"Voor integraties die geen keuzelijst maar losse knoppen leveren, zoals Amcrest en Dahua. Ze mogen naast de keuzelijst staan.",motion:"Het oude enkele veld. Gebruik liever Bewegingsmelders hierboven; deze blijft werken voor kaarten die hem al hebben.",motion_sensors:"Zolang er een aanstaat komt er een merkje op het beeld. Kies er gerust meerdere: een Reolink meldt persoon, voertuig en huisdier los van elkaar, en dan zie je w\xE9lke het is. Een deurbel (`event`) en een slot (`lock`) mogen er ook bij. Per melder kun je hieronder een naam en een soort invullen \u2014 die soort bepaalt onder welke filterknop hij in de timeline valt.",ptz_up:"De vier richtingsknoppen van je integratie. Vul je er geen in, dan komt het draaikruis er niet.",cameras:"Onder het beeld komt dan een rij met namen om tussen te wisselen; de camera waar je naar kijkt licht op. Handig voor de camera's die bij elkaar horen \u2014 voordeur, oprit, achtertuin. Per camera kun je hieronder een eigen naam invullen.",snapshots:"Bij elke detectie legt Home Assistant een beeld vast en zet dat onder de kaart in een strook, met filters erboven op dag, soort en camera \u2014 ook als er nergens een scherm aanstaat. Beelden blijven een week staan; daarboven wijkt vanzelf de oudste. Staat dit uit, dan wordt er niets vastgelegd en niets bewaard.",snapshot_rustperiode:"Hoe lang dezelfde melder daarna met rust wordt gelaten. Dit is het antwoord op tien meldingen achter elkaar. De klok loopt PER MELDER: meldt je camera persoon, voertuig en huisdier apart, dan houden die elkaar niet tegen \u2014 een auto die de oprit op rijdt en de bestuurder die uitstapt leveren allebei een beeld op. Nul betekent: alles vastleggen.",snapshot_wachttijd:"Wacht zoveel seconden na de detectie voordat het beeld genomen wordt. Op nul krijg je het moment zelf; op een of twee seconden staat degene meestal beter in beeld dan met zijn rug ernaartoe. Deze wachttijd verandert niets aan de rustperiode.",snapshot_ontvangers:"De personen die een melding op hun telefoon krijgen, met het beeld erbij. De kaart zoekt zelf de mobiele app van die persoon op. Buitenshuis heeft de telefoon een extern adres nodig (Nabu Casa of een eigen domein) om de foto te laden; zonder dat komt de melding w\xE9l aan, maar zonder plaatje.",snapshot_alleen_afwezig:"Dan blijft de telefoon stil zolang er iemand thuis is. Het beeld komt nog steeds in de timeline te staan \u2014 alleen de melding blijft achterwege. Dit scheelt in de praktijk meer meldingen dan de rustperiode.",snapshot_stil:"Een helper (input_boolean) of schakelaar. Staat hij aan, dan gaat er geen melding naar de telefoon; het beeld komt w\xE9l in de timeline. De kaart krijgt er een belknop bij in de rij boven de timeline om hem om te zetten, en hij is ook in een automatisering te gebruiken (bijvoorbeeld: aan als de poetsploeg er is).",snapshot_stil_omgekeerd:"Voor een helper die al andersom in gebruik is: aan betekent dan dat de meldingen AAN staan, en uit houdt de telefoon stil. De belknop op de kaart draait mee.",verhouding:"Standaard volgt de kaart zijn camera, zodat er geen beeld af gaat. Staan er meerdere camerakaarten naast elkaar in een stack, kies dan overal dezelfde verhouding \u2014 dan zijn ze even hoog. Er wordt dan wel bijgesneden.",presets_aan:"E\xE9n vinkje voor de hele bediening: de presetknoppen in het beeld en het draaikruis linksonder. Zet je het uit, dan blijft alles wat je gekozen hebt gewoon staan \u2014 het is alleen weg van het beeld."}[e.name]}};O("domotiapp-camera-card-editor",Zo);D("domotiapp-camera-card",ei,{name:"DomotiApp Camera",description:"Live beeld met inzoomen en schuiven, de presets van je camera als knoppen, een draaikruis en een merkje zodra er beweging is."});var _p="domotiapp_lovelace/infoscherm",yp="/api/domotiapp_lovelace/infoscherm",jp=a=>a?.auth?.data?.access_token??a?.auth?.accessToken??"",vt=(a,e,t={})=>a.connection.sendMessagePromise({type:`${_p}/${e}`,...t}),kn=a=>vt(a,"get"),ti=(a,e)=>a.connection.subscribeMessage(e,{type:`${_p}/subscribe`}),zp=(a,e,t)=>vt(a,"aanwezig",{persoon:e,aanwezig:t}),$p=(a,e,t)=>vt(a,`${e}/save`,{[e]:t}),Ep=(a,e)=>vt(a,"installatie/sync",{installatie:e}),Ap=(a,e)=>vt(a,"bestand/verwijder",{bestand:e}),Sp=a=>vt(a,"feeds/ververs"),Mp=a=>vt(a,"gebruikers");async function Np(a,e){let t=new FormData;t.append("bestand",e,e.name);let n=await fetch(`${yp}/upload`,{method:"POST",body:t,headers:{Authorization:`Bearer ${jp(a)}`}}),i=null;try{i=await n.json()}catch{}if(!n.ok)throw new Error(i?.message??`Home Assistant antwoordde met ${n.status}`);return i}var Kt=new Map;function xn(a,e){if(!e)return Promise.resolve(null);if(Kt.has(e))return Kt.get(e);let t=(async()=>{try{let n=await fetch(`${yp}/bestand/${e}`,{headers:{Authorization:`Bearer ${jp(a)}`}});if(!n.ok)throw new Error(String(n.status));return qf(await n.blob())}catch{return Kt.delete(e),null}})();return Kt.set(e,t),t}var qf=a=>globalThis.URL.createObjectURL(a);function Dp(a){let e=Kt.get(a);Kt.delete(a),e?.then(t=>t&&globalThis.URL.revokeObjectURL(t))}var me=(a,e)=>`<g class="${a}">${e}</g>`,Lp=(a=12,e=12,t=4.6,n=1)=>me("wa-zon",`<circle class="wa-zonkern" cx="${a}" cy="${e}" r="${t}"/>`+me("wa-stralen",[0,45,90,135,180,225,270,315].map(i=>{let r=i*Math.PI/180,o=t+2.2*n,s=t+3.9*n;return`<line x1="${(a+Math.cos(r)*o).toFixed(2)}" y1="${(e+Math.sin(r)*o).toFixed(2)}" x2="${(a+Math.cos(r)*s).toFixed(2)}" y2="${(e+Math.sin(r)*s).toFixed(2)}"/>`}).join(""))),Tp=(a=12,e=12,t=1)=>me("wa-maan",`<path transform="translate(${a-12*t} ${e-12*t}) scale(${t})" d="M20.2 13.6A8.4 8.4 0 0 1 10.4 3.8a8.4 8.4 0 1 0 9.8 9.8z"/><circle class="wa-ster" cx="${a+6.5*t}" cy="${e-7*t}" r="0.7"/><circle class="wa-ster" cx="${a+8.5*t}" cy="${e-3.5*t}" r="0.5"/>`),Me=(a=0,e=0,t=1)=>me("wa-wolk",`<path transform="translate(${a} ${e}) scale(${t})" d="M7 17.5h10.2a3.8 3.8 0 0 0 .5-7.6A5.8 5.8 0 0 0 6.6 8.8 4.3 4.3 0 0 0 7 17.5z"/>`),Yo=(a=3,e=!1)=>me(`wa-regen ${e?"snel":""}`,Array.from({length:a},(t,n)=>{let i=8+n*8/Math.max(1,a-1);return`<line class="wa-druppel" x1="${i}" y1="19" x2="${i-.8}" y2="21.8"/>`}).join("")),Zf=(a=3)=>me("wa-sneeuw",Array.from({length:a},(e,t)=>`<circle class="wa-vlok" cx="${8+t*8/Math.max(1,a-1)}" cy="20.4" r="0.9"/>`).join("")),Yf=()=>me("wa-hagel",[8,12,16].map(a=>`<circle class="wa-korrel" cx="${a}" cy="20.4" r="0.8"/>`).join("")),Op=()=>me("wa-bliksem",'<path class="wa-flits" d="M12.6 12.4l-2.8 4.4h3l-1.6 4.2 3.6-5.2h-3z"/>'),Xf=()=>me("wa-mist",'<line x1="4" y1="10" x2="20" y2="10"/><line x1="6" y1="14" x2="18" y2="14"/><line x1="4.5" y1="18" x2="19.5" y2="18"/>'),Cp=()=>me("wa-windlijnen",'<path class="wa-wind" d="M3 9.5h10.5a2.3 2.3 0 1 0-2.3-2.3"/><path class="wa-wind" d="M3 14h14.5a2.6 2.6 0 1 1-2.6 2.6"/><path class="wa-wind" d="M3 18.5h7.5a1.8 1.8 0 1 1-1.8 1.8"/>'),Qf=()=>me("wa-let-op",'<path d="M12 4.2 2.8 19.6h18.4z"/><path d="M12 10.2v4.6M12 17.6v.1"/>'),Rp={sunny:()=>Lp(12,12,4.8),"clear-night":()=>Tp(),partlycloudy:a=>(a?Tp(16,7.5,.55):Lp(16.5,7.5,2.9,.7))+Me(-1.2,1.6,.95),cloudy:()=>me("wa-wolk achter",'<path transform="translate(5 -3.5) scale(.62)" d="M7 17.5h10.2a3.8 3.8 0 0 0 .5-7.6A5.8 5.8 0 0 0 6.6 8.8 4.3 4.3 0 0 0 7 17.5z"/>')+Me(-1,1.8,.95),rainy:()=>Me(0,-1.5,.95)+Yo(3),pouring:()=>Me(0,-1.5,.95)+Yo(4,!0),hail:()=>Me(0,-1.5,.95)+Yf(),lightning:()=>Me(0,-2,.95)+Op(),"lightning-rainy":()=>Me(0,-2,.95)+Op()+Yo(2),snowy:()=>Me(0,-1.5,.95)+Zf(3),"snowy-rainy":()=>Me(0,-1.5,.95)+me("wa-regen",'<line class="wa-druppel" x1="9" y1="19" x2="8.2" y2="21.8"/>')+me("wa-sneeuw",'<circle class="wa-vlok" cx="15" cy="20.4" r="0.9"/>'),fog:()=>Xf(),windy:()=>Cp(),"windy-variant":()=>Me(1.5,-3,.75)+Cp(),exceptional:()=>Qf()};function ni(a,e=!1){let t=Rp[a]??Rp.cloudy;return`<svg class="icon wa" data-weer="${a??""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${t(e)}</svg>`}var Hp={sunny:"Zonnig","clear-night":"Heldere nacht",partlycloudy:"Half bewolkt",cloudy:"Bewolkt",rainy:"Regen",pouring:"Stortregen",hail:"Hagel",lightning:"Onweer","lightning-rainy":"Onweer met regen",snowy:"Sneeuw","snowy-rainy":"Natte sneeuw",fog:"Mist",windy:"Winderig","windy-variant":"Winderig en bewolkt",exceptional:"Uitzonderlijk weer"},Ip=`
  .wa { overflow: visible; }
  .wa .wa-zon { color: var(--dac-solar); }
  .wa .wa-maan { color: var(--dac-ink-2); }
  .wa .wa-ster { fill: currentColor; stroke: none; }
  .wa .wa-druppel { stroke: var(--dac-grid-in); }
  .wa .wa-vlok { fill: var(--dac-grid-in); stroke: none; }
  .wa .wa-korrel { fill: var(--dac-grid-in); stroke: none; }
  .wa .wa-flits { fill: var(--dac-solar); stroke: var(--dac-solar); stroke-width: 0.6; }
  .wa .wa-mist line, .wa .wa-wind { stroke: var(--dac-ink-2); }
  .wa .wa-let-op { color: var(--dac-warn); }
  .wa .achter { color: var(--dac-ink-3); }

  .wa .wa-stralen { transform-box: fill-box; transform-origin: center; animation: wa-draai 36s linear infinite; }
  .wa .wa-zonkern { transform-box: fill-box; transform-origin: center; animation: wa-puls 4s ease-in-out infinite; }
  .wa .wa-wolk { animation: wa-zweef 5s ease-in-out infinite alternate; }
  .wa .wa-wolk.achter { animation-duration: 7s; animation-direction: alternate-reverse; }
  .wa .wa-druppel { animation: wa-regen 1.5s linear infinite; }
  .wa .wa-druppel:nth-child(2) { animation-delay: -0.5s; }
  .wa .wa-druppel:nth-child(3) { animation-delay: -1s; }
  .wa .wa-druppel:nth-child(4) { animation-delay: -0.25s; }
  .wa .wa-regen.snel .wa-druppel { animation-duration: 0.9s; }
  .wa .wa-vlok { animation: wa-sneeuw 3.2s ease-in-out infinite; }
  .wa .wa-vlok:nth-child(2) { animation-delay: -1.1s; }
  .wa .wa-vlok:nth-child(3) { animation-delay: -2.2s; }
  .wa .wa-korrel { animation: wa-regen 0.8s linear infinite; }
  .wa .wa-korrel:nth-child(2) { animation-delay: -0.3s; }
  .wa .wa-korrel:nth-child(3) { animation-delay: -0.55s; }
  .wa .wa-flits { animation: wa-flits 4s linear infinite; }
  .wa .wa-mist line { animation: wa-mist 6s ease-in-out infinite alternate; }
  .wa .wa-mist line:nth-child(2) { animation-delay: -2s; animation-direction: alternate-reverse; }
  .wa .wa-mist line:nth-child(3) { animation-delay: -4s; }
  .wa .wa-wind { stroke-dasharray: 9 5; animation: wa-wind 2.4s linear infinite; }
  .wa .wa-wind:nth-child(2) { animation-delay: -0.8s; }
  .wa .wa-wind:nth-child(3) { animation-delay: -1.6s; }
  .wa .wa-maan { transform-box: fill-box; transform-origin: center; animation: wa-puls 7s ease-in-out infinite; }
  .wa .wa-ster { animation: wa-twinkel 3s ease-in-out infinite; }
  .wa .wa-ster:nth-child(3) { animation-delay: -1.4s; }

  .stil .wa * { animation: none !important; }

  @keyframes wa-draai { to { transform: rotate(360deg); } }
  @keyframes wa-puls { 50% { transform: scale(1.06); } }
  @keyframes wa-zweef { from { transform: translateX(-0.5px); } to { transform: translateX(0.5px); } }
  @keyframes wa-regen { 0% { transform: translateY(-1.6px); opacity: 0; } 25% { opacity: 1; } 75% { opacity: 1; } 100% { transform: translateY(2.4px); opacity: 0; } }
  @keyframes wa-sneeuw { 0% { transform: translate(0, -1.8px); opacity: 0; } 25% { opacity: 1; } 60% { transform: translate(0.7px, 0.6px); } 100% { transform: translate(-0.3px, 2.6px); opacity: 0; } }
  @keyframes wa-flits { 0%, 84% { opacity: 0.3; } 87% { opacity: 1; } 89% { opacity: 0.35; } 92% { opacity: 1; } 100% { opacity: 0.3; } }
  @keyframes wa-mist { from { transform: translateX(-1.2px); } to { transform: translateX(1.2px); } }
  @keyframes wa-wind { to { stroke-dashoffset: -28; } }
  @keyframes wa-twinkel { 50% { opacity: 0.2; } }

  /* Zie de kop van weer-animatie.js: hier bewust w\xE9l bewegen, ook met
     prefers-reduced-motion. De regel in baseCss heeft dezelfde specificiteit
     als de klassen hierboven niet halen; daarom hier met !important, en met
     een langere selector zodat hij wint. */
  @media (prefers-reduced-motion: reduce) {
    .wa.wa .wa-stralen { animation-duration: 36s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-zonkern, .wa.wa .wa-maan { animation-duration: 4s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-wolk { animation-duration: 5s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-druppel { animation-duration: 1.5s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-regen.snel .wa-druppel { animation-duration: 0.9s !important; }
    .wa.wa .wa-vlok { animation-duration: 3.2s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-korrel { animation-duration: 0.8s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-flits { animation-duration: 4s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-mist line { animation-duration: 6s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-wind { animation-duration: 2.4s !important; animation-iteration-count: infinite !important; }
    .wa.wa .wa-ster { animation-duration: 3s !important; animation-iteration-count: infinite !important; }
    .stil .wa.wa * { animation: none !important; }
  }
`;function Vp(a,e,t,n=new Date){let i=Fn(n),r=(a??[]).map(l=>{let d=e(l),c=d?we(d.state)??we(d.attributes?.date)??we(d.attributes?.next_date)??we(d.attributes?.Year_month_day_date):null;return{id:l,st:d,datum:c}}),o=r.map(l=>t(l.id)),s=pn(o);return r.map((l,d)=>{let c=l.datum?Et(i,l.datum):null;return{id:l.id,naam:s[d]||o[d]||l.id,datum:l.datum,dagen:c,reden:l.st?l.datum?c<0?"voorbij":null:"geen datum":"bestaat niet"}}).sort((l,d)=>!l.reden&&!d.reden?l.datum-d.datum:l.reden?d.reden?l.naam.localeCompare(d.naam):1:-1)}var Xo=a=>(a??[]).filter(e=>!e.reden);function Qo(a,e=new Date){return!a||a.reden?"":At(a.datum,e)}var Bp=a=>new Date(a.getFullYear(),a.getMonth(),a.getDate());function ii(a,e=0,t=new Date){let n=Math.round(e)||0;if(a==="dag"){let o=Bp(t);o.setDate(o.getDate()+n);let s=new Date(o);return s.setDate(s.getDate()+1),{van:o,tot:s,periode:"hour"}}if(a==="week"){let o=Bp(t),s=(o.getDay()+6)%7;o.setDate(o.getDate()-s+n*7);let l=new Date(o);return l.setDate(l.getDate()+7),{van:o,tot:l,periode:"day"}}if(a==="maand"){let o=new Date(t.getFullYear(),t.getMonth()+n,1),s=new Date(t.getFullYear(),t.getMonth()+n+1,1);return{van:o,tot:s,periode:"day"}}let i=new Date(t.getFullYear()+n,0,1),r=new Date(t.getFullYear()+n+1,0,1);return{van:i,tot:r,periode:"month"}}var wn=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];function Pp(a,e=0,t=new Date){let n=Math.round(e)||0,i=ii(a,n,t).van;if(a==="dag")return n===0?"Vandaag":n===-1?"Gisteren":`${i.getDate()} ${wn[i.getMonth()]}`;if(a==="week"){if(n===0)return"Deze week";if(n===-1)return"Vorige week";let r=new Date(i);return r.setDate(r.getDate()+6),`${i.getDate()} ${wn[i.getMonth()].slice(0,3)} \u2013 ${r.getDate()} ${wn[r.getMonth()].slice(0,3)}`}if(a==="maand"){if(n===0)return"Deze maand";let r=i.getFullYear()===t.getFullYear()?"":` ${i.getFullYear()}`;return`${wn[i.getMonth()]}${r}`}return n===0?"Dit jaar":String(i.getFullYear())}var Ne={verbruik:{naam:"Van het net",tone:"var(--dac-grid-in)",teken:1},teruglevering:{naam:"Teruggeleverd",tone:"var(--dac-grid-out)",teken:-1},zon:{naam:"Zonnepanelen",tone:"var(--dac-solar)",teken:1},accu_uit:{naam:"Uit de accu",tone:"var(--dac-device-2)",teken:1},accu_in:{naam:"Naar de accu",tone:"var(--dac-device-2)",teken:-1},gas:{naam:"Gas",tone:"var(--dac-device-1)",teken:1},water:{naam:"Water",tone:"var(--dac-grid-in)",teken:1},apparaat:{naam:"Apparaat",tone:"var(--dac-house)",teken:1}},ai=a=>typeof a=="string"&&a.trim()?a.trim():null;function Kp(a){let e=[],t=(n,i,r)=>{let o=ai(i);if(!o||e.some(l=>l.statistiek===o&&l.rol===n))return;let s=n==="apparaat"?o:Ne[n]?.naam??o;e.push({rol:n,statistiek:o,naam:r??s})};for(let n of a?.energy_sources??[]){let i=ai(n?.name);switch(n?.type){case"grid":{t("verbruik",n.stat_energy_from,i),t("teruglevering",n.stat_energy_to,i?`${i} terug`:null);for(let r of n.flow_from??[])t("verbruik",r?.stat_energy_from,i);for(let r of n.flow_to??[])t("teruglevering",r?.stat_energy_to,i?`${i} terug`:null);break}case"solar":t("zon",n.stat_energy_from,i);break;case"battery":t("accu_uit",n.stat_energy_from,i),t("accu_in",n.stat_energy_to,i?`${i} laden`:null);break;case"gas":t("gas",n.stat_energy_from,i);break;case"water":t("water",n.stat_energy_from,i);break;default:break}}for(let n of a?.device_consumption??[])t("apparaat",n?.stat_consumption,ai(n?.name));for(let n of a?.device_consumption_water??[])t("apparaat",n?.stat_consumption,ai(n?.name));return e}var Jo=a=>[...new Set(a.map(e=>e.statistiek))],Gp=a=>a.some(e=>e.rol!=="apparaat"),ri=a=>Number.isFinite(Number(a))?Number(a):0;function Wp(a,e){let t={};for(let n of a){let i=e?.[n.statistiek]??[],r=0;for(let o of i)r+=ri(o?.change);t[n.statistiek]=Math.max(0,Math.round(r*1e3)/1e3)}return t}function kt(a,e,t){let n=Wp(a,e),i=0;for(let r of a)r.rol===t&&(i+=n[r.statistiek]??0);return Math.round(i*1e3)/1e3}function Up(a,e,{van:t,tot:n,periode:i="hour"}={}){let r=new Map,o=t instanceof Date?t.getTime():Number(t)||0,s=n instanceof Date?n.getTime():Number(n)||1/0;for(let d of a)for(let c of e?.[d.statistiek]??[]){let p=Number(c?.start);if(!Number.isFinite(p)||p<o||p>=s)continue;r.has(p)||r.set(p,{start:p,rollen:{}});let h=r.get(p);h.rollen[d.rol]=(h.rollen[d.rol]??0)+ri(c?.change)}let l=[...r.values()].sort((d,c)=>d.start-c.start).map(d=>{let c={};for(let[p,h]of Object.entries(d.rollen))c[p]=Math.max(0,Math.round(h*1e3)/1e3);return{start:d.start,rollen:c}});return Jf(l,{van:t,tot:n,periode:i})}function Jf(a,{van:e,tot:t,periode:n="hour"}={}){let i=e instanceof Date?e.getTime():Number(e),r=t instanceof Date?t.getTime():Number(t);if(!Number.isFinite(i)||!Number.isFinite(r)||r<=i)return a;let o=c=>{let p=new Date(c);return n==="month"?p.setMonth(p.getMonth()+1):n==="day"||n==="week"?p.setDate(p.getDate()+1):p.setHours(p.getHours()+1),p},s=new Map(a.map(c=>[c.start,c])),l=[],d=new Date(i);for(let c=0;c<400&&d.getTime()<r;c+=1)l.push(s.get(d.getTime())??{start:d.getTime(),rollen:{}}),d=o(d);for(let c of a)l.some(p=>p.start===c.start)||l.push(c);return l.sort((c,p)=>c.start-p.start)}function es(a,e){let t=kt(a,e,"verbruik"),n=kt(a,e,"teruglevering"),i=kt(a,e,"zon"),r=kt(a,e,"accu_uit"),o=kt(a,e,"accu_in"),s=kt(a,e,"gas"),l=kt(a,e,"water"),d=Math.max(0,Math.round((i-n)*1e3)/1e3),c=Math.round((t+r+d)*1e3)/1e3,p=c>0?Math.round((d+r)/c*100):null;return{netIn:t,netUit:n,zon:i,accuUit:r,accuIn:o,gas:s,water:l,eigen:d,verbruikt:c,zelfvoorzienend:p}}function ce(a,e="kWh"){let t=ri(a),n=Math.abs(t)>=100?0:Math.abs(t)>=10?1:2,i=t.toLocaleString("nl-NL",{minimumFractionDigits:n,maximumFractionDigits:n});return e?`${i} ${e}`:i}var Fp=a=>ri(a).toLocaleString("nl-NL",{style:"currency",currency:"EUR"}),eb=["zo","ma","di","wo","do","vr","za"];function qp(a,e){let t=new Date(a);return e==="dag"?String(t.getHours()).padStart(2,"0"):e==="week"?eb[t.getDay()]:e==="maand"?String(t.getDate()):wn[t.getMonth()].slice(0,3)}function Zp(a){let e={},t=n=>{let i=Number(n);return Number.isFinite(i)&&i>0?i:null};for(let n of a?.energy_sources??[]){for(let r of n?.flow_from??[]){let o=t(r?.number_energy_price);r?.stat_energy_from&&o&&(e[r.stat_energy_from]=o)}let i=t(n?.number_energy_price);i&&n.stat_energy_from&&(e[n.stat_energy_from]=i)}return e}function Yp(a,e,t){let n=Wp(a,e),i=0,r=!0;for(let o of a){if(o.rol==="apparaat"||o.rol==="teruglevering")continue;let s=t?.[o.statistiek];if(s==null){(n[o.statistiek]??0)>0&&(r=!1);continue}i+=(n[o.statistiek]??0)*s}return{bedrag:Math.round(i*100)/100,compleet:r}}var xt=["ma","di","wo","do","vr","za","zo"],Gt={ma:"maandag",di:"dinsdag",wo:"woensdag",do:"donderdag",vr:"vrijdag",za:"zaterdag",zo:"zondag"},Jp=["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],eh=["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"],oi=a=>String(a).padStart(2,"0"),_n=a=>xt[(a.getDay()+6)%7],Ke=a=>`${a.getFullYear()}-${oi(a.getMonth()+1)}-${oi(a.getDate())}`,De=a=>`${oi(a.getHours())}:${oi(a.getMinutes())}`,ot=a=>`${Ke(a)}T${De(a)}`,th=a=>`${Gt[_n(a)]} ${a.getDate()} ${Jp[a.getMonth()]}`;function Xp(a){if(!a)return"";let[,e,t]=a.split("-").map(Number);return`${t} ${Jp[e-1]}`}function nh(a,e){let t=Ke(a);if(t===Ke(e))return"vandaag";let n=new Date(e.getFullYear(),e.getMonth(),e.getDate()+1);return t===Ke(n)?"morgen":Gt[_n(a)]}function tb(a,e){let t=e.length===10?`${e}T00:00`:e,n=a?.van?a.van.length===10?`${a.van}T00:00`:a.van:null,i=a?.tot?a.tot.length===10?`${a.tot}T23:59`:a.tot:null;return!(n&&n>t||i&&i<t)}var yn=(a,e)=>(a??[]).filter(t=>t.tekst&&tb(t,e));function ah(a,e){let t=e.length===10?`${e}T00:00`:e;return(a??[]).filter(n=>n.tekst&&n.van&&(n.van.length===10?`${n.van}T00:00`:n.van)>t).sort((n,i)=>String(n.van).localeCompare(String(i.van)))}function Qp(a){if(!a)return"";let[e,t]=a.split("T");return t?`${Xp(e)} ${t}`:Xp(e)}function ts(a){let e=Qp(a?.van),t=Qp(a?.tot);return e&&t?`${e} t/m ${t}`:e?`vanaf ${e}`:t?`tot en met ${t}`:""}function ih(a){return(a??[]).filter(e=>e.titel).map(e=>({...e,eigen:!1})).sort((e,t)=>String(t.datum??"").localeCompare(String(e.datum??"")))}function ns(a,e){let t=new Date(e.getFullYear(),e.getMonth(),e.getDate()),n=[];for(let i of a??[]){if(!i?.naam||!i?.datum)continue;let[r,o,s]=i.datum.split("-").map(Number);if(!o||!s)continue;let l=new Date(t.getFullYear(),o-1,s);l<t&&(l=new Date(t.getFullYear()+1,o-1,s));let d=Math.round((l-t)/864e5),c=i.jaar_tonen!==!1&&r>1900?l.getFullYear()-r:null;n.push({...i,dagen:d,leeftijd:c,wanneer:d===0?"vandaag":d===1?"morgen":`${xt[(l.getDay()+6)%7]} ${l.getDate()} ${eh[l.getMonth()]}`})}return n.sort((i,r)=>i.dagen-r.dagen||i.naam.localeCompare(r.naam,"nl"))}var nb=a=>a?.length?a.map(([e,t])=>`${e} \u2013 ${t}`).join(", "):"gesloten";function as(a,e){let t=Ke(e),n=a?.openingstijden?.[_n(e)]??[],i="";for(let r of a?.uitzonderingen??[])r.datum===t&&(n=r.tijden??[],i=r.reden??"");return{tijden:n,reden:i}}function jn(a,e){let{tijden:t,reden:n}=as(a,e),i=De(e),r=t.find(([s,l])=>s<=i&&i<l),o=t.find(([s])=>s>i);return{open:!!r,tot:r?r[1]:null,straks:o?o[0]:null,tijden:t,reden:n}}function ab(a,e){let t=jn(a,e);if(t.straks)return{dag:"vandaag",tijd:t.straks};for(let n=1;n<=14;n+=1){let i=new Date(e.getFullYear(),e.getMonth(),e.getDate()+n),{tijden:r}=as(a,i);if(r.length)return{dag:n===1?"morgen":Gt[_n(i)],tijd:r[0][0]}}return null}function rh(a,e){let t=_n(e);return xt.map(n=>{let i=n===t?as(a,e):null,r=i?i.tijden:a?.openingstijden?.[n]??[];return{dag:n,naam:Gt[n],tekst:nb(r),reden:i?.reden??"",vandaag:n===t}})}var is=a=>xt.some(e=>(a?.openingstijden?.[e]??[]).length>0);function oh(a){return(a?.installatie?.verlichting?.length??0)>0?a?.instellingen?.verlichting_tonen!==!1:!1}function rs(a,e,t=null){let n=["welkom"];return(a?.personen?.length??0)>0&&n.push("aanwezig"),(t?yn(a?.mededelingen,t).length>0:(a?.mededelingen?.length??0)>0)&&n.push("mededelingen"),(e?.length??0)>0&&n.push("nieuws"),a?.installatie?.weer&&n.push("weer"),a?.installatie?.energie&&n.push("energie"),(a?.installatie?.afval?.length??0)>0&&n.push("afval"),oh(a)&&n.push("verlichting"),(a?.installatie?.agendas?.length??0)>0&&n.push("agenda"),(a?.verjaardagen?.length??0)>0&&n.push("verjaardagen"),n}function os(a){let e=String(a??"").trim().split(/\s+/).filter(Boolean);return e.length?e.length===1?e[0].slice(0,2).toUpperCase():(e[0][0]+e[e.length-1][0]).toUpperCase():"?"}function sh(a){let e=new Map;for(let t of a??[]){let n=t.functie||"";e.has(n)||e.set(n,[]),e.get(n).push(t)}return[...e].map(([t,n])=>({functie:t,personen:n}))}function ss(a){let e=a??[];return{aanwezig:e.filter(t=>t.aanwezig),afwezig:e.filter(t=>!t.aanwezig)}}function lh(a){let{aanwezig:e,afwezig:t}=ss(a);return[...e,...t]}function ls(a,e){if(!a)return"";let t=new Date(a);if(Number.isNaN(t.getTime()))return"";let n=Math.round((e-t)/6e4);if(n<1)return"zojuist";if(n<60)return`${n} min geleden`;if(Ke(t)===Ke(e))return`vandaag ${De(t)}`;let i=new Date(e.getFullYear(),e.getMonth(),e.getDate()-1);return Ke(t)===Ke(i)?`gisteren ${De(t)}`:`${t.getDate()} ${eh[t.getMonth()]}`}function dh(a,e){let t=jn(a,e),n=["Gesloten"];t.reden&&n.push(t.reden);let i=ab(a,e);return i&&n.push(`${i.dag} open om ${i.tijd}`),n.join(" \xB7 ")}var Le=6,Te=6,st={welkom:{naam:"Welkom",icoon:"house",pagina:null,aantal:!1,maat:[6,1]},weer:{naam:"Weer",icoon:"sun",pagina:"weer",aantal:!1,maat:[2,2]},mededeling:{naam:"Mededelingen",icoon:"bell",pagina:"mededelingen",aantal:!1,maat:[2,1]},openingstijden:{naam:"Openingstijden",icoon:"clock",pagina:null,aantal:!1,maat:[2,3]},aanwezig:{naam:"Aanwezig",icoon:"people",pagina:"aanwezig",aantal:!0,maat:[2,3]},nieuws:{naam:"Nieuws",icoon:"news",pagina:"nieuws",aantal:!0,maat:[2,4]},verlichting:{naam:"Verlichting",icoon:"bulb",pagina:"verlichting",aantal:!0,maat:[2,1]},agenda:{naam:"Agenda",icoon:"calendar",pagina:"agenda",aantal:!0,maat:[2,2]},verjaardagen:{naam:"Verjaardagen",icoon:"cake",pagina:"verjaardagen",aantal:!0,maat:[2,2]},energie:{naam:"Energie",icoon:"bolt",pagina:"energie",aantal:!1,maat:[2,2]},afval:{naam:"Afvalkalender",icoon:"bin",pagina:"afval",aantal:!1,maat:[2,2]}},ib=new Set(["aanwezig","nieuws","verlichting","agenda","verjaardagen"]),rb=[0,.85,1,1.12,1.25,1.35,1.45],ob=[0,.8,1,1.15,1.3,1.4,1.5];function ch(a,e,t){let n=rb[Math.min(Le,Math.max(1,Math.round(e)||1))],i=ob[Math.min(Te,Math.max(1,Math.round(t)||1))],r=ib.has(a)?n:Math.sqrt(n*i);return Math.round(r*1e3)/1e3}function ph({beschikbaar:a,hoogte:e,gap:t=0,aantal:n,kolommen:i=1,minPas:r=.72,drempel:o=.4}){if(!n||!(e>0)||!(a>0))return{rijen:0,tonen:0,pas:1};let s=Math.max(1,i),l=Math.ceil(n/s),d=Math.floor((a+t)/(e+t)),c=1;if(d<l){let p=d+1,u=(a-(p-1)*t)/p/e,m=a-d*e-Math.max(0,d-1)*t;(d===0||u>=r&&m>=o*e)&&(d=p,c=Math.min(1,Math.max(d===1?.5:r,u)))}return d=Math.min(d,l),{rijen:d,tonen:Math.min(n,d*s),pas:Math.round(c*1e3)/1e3}}var hh=Object.keys(st);function si(){return{blokken:[["welkom",0,0,2,2,0],["weer",0,2,2,2,0],["openingstijden",0,4,2,2,0],["aanwezig",2,0,2,3,6],["mededeling",2,3,2,1,0],["verlichting",2,4,2,2,4],["nieuws",4,0,2,6,6]].map(([e,t,n,i,r,o])=>({id:`std-${e}`,soort:e,x:t,y:n,w:i,h:r,aantal:o}))}}var ds=(a,e)=>a.x<e.x+e.w&&e.x<a.x+a.w&&a.y<e.y+e.h&&e.y<a.y+a.h,sb=a=>a.x>=0&&a.y>=0&&a.w>=1&&a.h>=1&&a.x+a.w<=Le&&a.y+a.h<=Te;function li(a,e){return sb(e)?!(a??[]).some(t=>t.id!==e.id&&ds(t,e)):!1}function cs(a,e,t){for(let n=0;n+t<=Te;n+=1)for(let i=0;i+e<=Le;i+=1)if(li(a,{id:"",x:i,y:n,w:e,h:t}))return{x:i,y:n};return null}function di(a,e,t,n,i={}){let r=e??{};switch(a){case"welkom":return null;case"weer":return r.installatie?.weer?null:"Geen weerentiteit gekozen (kaartinstellingen van het infoscherm)";case"mededeling":return yn(r.mededelingen,n).length?null:"Geen mededeling die nu geldt";case"verjaardagen":return(r.verjaardagen?.length??0)>0?null:"Nog geen verjaardagen";case"openingstijden":return is(r.praktijk)?null:"Geen openingstijden ingevuld";case"aanwezig":return(r.personen?.length??0)>0?null:"Nog geen medewerkers";case"nieuws":return null;case"energie":return r.installatie?.energie||i.energieDashboard?null:"Geen energiesensor gekozen, en geen energiedashboard in Home Assistant";case"verlichting":return(r.installatie?.verlichting?.length??0)>0?oh(r)?null:"Verlichting staat uit in het beheer":"Geen lampen gekozen (kaartinstellingen van het infoscherm)";case"agenda":return(r.installatie?.agendas?.length??0)>0?null:"Geen agenda gekozen (kaartinstellingen van het infoscherm)";case"afval":return(r.installatie?.afval?.length??0)>0?null:"Geen afvalsensoren gekozen (kaartinstellingen van het infoscherm)";default:return"Onbekend blok"}}function uh(a){let e=a??{};return e.state_class==="total_increasing"||e.state_class==="total"?!0:/wh$/i.test(String(e.unit_of_measurement??"").trim())}function mh(a){let e=[];for(let t of a??[]){let n=Number(t?.s??t?.state);if(!Number.isFinite(n))continue;let i=t?.lu??t?.last_updated,r=typeof i=="number"?i*1e3:Date.parse(i);Number.isFinite(r)&&e.push({t:r,v:n})}return e.sort((t,n)=>t.t-n.t)}function ps(a){let e=new Date(a),t=new Date(e.getFullYear(),e.getMonth(),e.getDate()).getTime(),n=new Date(e.getFullYear(),e.getMonth(),e.getDate()+1).getTime();return{van:t,tot:n}}function gh(a,{nu:e,tellerstand:t=!1,venster:n=24,van:i,tot:r}={}){let o=Number.isFinite(i)?i:e-n*36e5,s=Number.isFinite(r)?r:e,l=(a??[]).filter(u=>u.t<=e),d=l.filter(u=>u.t>=o-36e5);if(!t){let u=d.filter(x=>x.t>=o),m=l.filter(x=>x.t<o).pop();m&&u.unshift({t:o,v:m.v});let b=u[u.length-1];return b&&b.t<e&&u.push({t:e,v:b.v}),{punten:u,van:o,tot:s,nu:e,perUur:!1}}let c=[],p=Math.floor(o/36e5)*36e5,h=l.filter(u=>u.t<p).pop()?.v??null;for(let u=p;u<e;u+=36e5){let m=d.filter(x=>x.t>=u&&x.t<u+36e5),b=m.length?m[m.length-1].v:null;b!==null&&h!==null&&c.push({t:u,v:b>=h?Math.round((b-h)*1e3)/1e3:0}),b!==null&&(h=b)}return{punten:c.filter(u=>u.t>=o),van:o,tot:s,nu:e,perUur:!0}}function fh(a){let e=a?.punten??[];if(!e.length)return{nu:null,gemiddeld:null,piek:null,totaal:null};let t=e.map(i=>i.v),n=t.reduce((i,r)=>i+r,0);return{nu:t[t.length-1],gemiddeld:n/t.length,piek:Math.max(...t),totaal:a.perUur?n:null}}function hs(a,{w:e=1e3,h:t=400}={}){let n=a?.punten??[];if(n.length<2||!(a.tot>a.van))return{lijn:"",vlak:"",min:0,max:0};let i=n.map(u=>u.v),r=Math.min(0,...i),o=Math.max(...i),s=o>r?r+(o-r)/.95:r+1,l=u=>((u-a.van)/(a.tot-a.van)*e).toFixed(1),d=u=>(t-(u-r)/(s-r)*t).toFixed(1),c=n.map((u,m)=>`${m?"L":"M"}${l(u.t)},${d(u.v)}`).join(" "),p=d(Math.max(r,0)),h=`${c} L${l(n[n.length-1].t)},${p} L${l(n[0].t)},${p} Z`;return{lijn:c,vlak:h,min:r,max:s}}function bh(a,e="W",t=null){if(a==null||!Number.isFinite(Number(a)))return"--";let n=Number(a),i=String(e??"").trim();/^wh?$/i.test(i)&&Math.abs(n)>=1e3&&(n/=1e3,i=`k${i}`);let r=t??(Math.abs(n)>=100?0:Math.abs(n)>=10?1:2),o=n.toLocaleString("nl-NL",{minimumFractionDigits:r,maximumFractionDigits:r});return i?`${o} ${i}`:o}function vh(a,e=48){let t=a?.punten??[];if(t.length<2||!(a.tot>a.van))return a;let n=(a.tot-a.van)/e,i=Math.min(Number.isFinite(a.nu)?a.nu:a.tot,a.tot),r=[],o=t[0].v;for(let s=0;s<e;s+=1){let l=a.van+s*n;if(l>=i)break;let d=Math.min(l+n,i),c=t.filter(h=>h.t>=l&&h.t<d),p=c.length?c.reduce((h,u)=>h+u.v,0)/c.length:o;o=p,r.push({t:(l+d)/2,v:Math.round(p*1e3)/1e3})}return r.unshift({t:a.van,v:t[0].v}),r.push({t:i,v:t[t.length-1].v}),{...a,punten:r}}function kh(a,{w:e=1e3,h:t=400,spanning:n=.5}={}){let i=hs(a,{w:e,h:t}),r=a?.punten??[];if(r.length<3||!i.lijn)return i;let{min:o,max:s}=i,l=r.map(m=>[(m.t-a.van)/(a.tot-a.van)*e,t-(m.v-o)/(s-o)*t]),d=m=>m.toFixed(1),c=`M${d(l[0][0])},${d(l[0][1])}`;for(let m=0;m<l.length-1;m+=1){let b=l[m-1]??l[m],x=l[m],w=l[m+1],y=l[m+2]??w,$=[x[0]+(w[0]-b[0])/6*n*2,x[1]+(w[1]-b[1])/6*n*2],T=[w[0]-(y[0]-x[0])/6*n*2,w[1]-(y[1]-x[1])/6*n*2];$[1]=Math.min(t,Math.max(0,$[1])),T[1]=Math.min(t,Math.max(0,T[1])),$[0]=Math.min(w[0],Math.max(x[0],$[0])),T[0]=Math.min(w[0],Math.max($[0],T[0])),c+=` C${d($[0])},${d($[1])} ${d(T[0])},${d(T[1])} ${d(w[0])},${d(w[1])}`}let p=d(t-(Math.max(o,0)-o)/(s-o)*t),h=l[l.length-1],u=`${c} L${d(h[0])},${p} L${d(l[0][0])},${p} Z`;return{lijn:c,vlak:u,min:o,max:s}}var lb="domotiapp-infoscherm-card",ci=a=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${a}</svg>`,zn={news:ci('<rect x="3.4" y="4.6" width="17.2" height="14.8" rx="2"/><path d="M7.2 9.2h9.6M7.2 12.6h9.6M7.2 16h5.6"/>'),cake:ci('<path d="M4.4 19.4h15.2v-6.2a2 2 0 0 0-2-2H6.4a2 2 0 0 0-2 2z"/><path d="M4.4 15.6c1.3 0 1.3 1.2 2.5 1.2s1.3-1.2 2.5-1.2 1.3 1.2 2.6 1.2 1.3-1.2 2.5-1.2 1.3 1.2 2.5 1.2 1.3-1.2 2.6-1.2"/><path d="M12 11.2V8.4M9 11.2V8.8M15 11.2V8.8"/><path d="M12 8.4a1.3 1.3 0 0 0 1-2.2L12 4.6l-1 1.6a1.3 1.3 0 0 0 1 2.2z"/>'),offline:ci('<path d="M3.4 6.8a13.6 13.6 0 0 1 17.2 0M6.6 10.4a9 9 0 0 1 10.8 0M9.8 14a4.4 4.4 0 0 1 4.4 0"/><circle cx="12" cy="18" r="1"/><path d="M4 4l16 16"/>'),back:ci('<path d="m14.6 6.2-5.6 5.8 5.6 5.8"/>')},xh=a=>zn[a]??v(a),pi={aanwezig:{eyebrow:"Wie is er vandaag",titel:"Aanwezig",onder:"Tik op uw naam om u aan of af te melden."},nieuws:{eyebrow:"Nieuws",titel:"Wat er speelt",onder:""},weer:{eyebrow:"Weer",titel:"Vandaag en de komende dagen",onder:""},verlichting:{eyebrow:"Verlichting",titel:"Lampen",onder:"Tik op een lamp om hem aan of uit te zetten."},agenda:{eyebrow:"Agenda",titel:"Vandaag",onder:""},verjaardagen:{eyebrow:"Verjaardagen",titel:"Wie is er binnenkort jarig",onder:""},energie:{eyebrow:"Energie",titel:"Verbruik",onder:""},mededelingen:{eyebrow:"Mededelingen",titel:"Wat er speelt",onder:""},afval:{eyebrow:"Afval",titel:"Wanneer moet wat aan straat",onder:""}},db=24,cb=`
  :host { display: block; height: 100%; }

  /* --ss is de schaal van het SCHERM (de breedte gedeeld door die van een
     iPad van 11 inch). --s is wat alles gebruikt; buiten de blokken is dat
     hetzelfde getal, en in een blok komt daar de maat van het blok bij
     (zie .blok hieronder). */
  .scherm {
    --tone: var(--dac-accent-hi);
    --ss: 1;
    --s: var(--ss);
    position: relative; width: 100%; height: var(--hoogte, 100dvh);
    overflow: hidden; background: var(--dac-bg); color: var(--dac-ink);
    display: flex; flex-direction: column;
    padding: calc(22px * var(--s)) calc(36px * var(--s)) calc(22px * var(--s));
    gap: calc(18px * var(--s));
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
    --dac-tint: 20, 20, 10;
  }

  .icon { width: 1em; height: 1em; display: block; }
  /* De vakken staan op display: flex, en dat wint van het [hidden] van de
     browser. Zonder deze regel staat een verborgen vak gewoon in beeld. */
  [hidden] { display: none !important; }

  /* ------------------------------------------------------------ kop */
  /* Er is geen kop meer boven het raster (ronde 4): logo, klok en datum
     staan in het welkomblok. Zie .blok.welkom hieronder. */
  /* Het logo volgt zijn eigen verhouding: een lang logo wordt lang, een breed
     logo breed. Alleen zonder beeld (de eerste letter van de naam) is het een
     vierkant. Gemeld op 10 september 2026: "nu is het een vast vierkantje". */
  .logo {
    height: calc(64px * var(--s)); max-width: calc(260px * var(--s)); flex: 0 0 auto;
    display: grid; place-items: center; overflow: hidden;
    color: var(--tone); font-weight: 700; font-size: calc(22px * var(--s));
  }
  .logo:not(.beeld) {
    width: calc(64px * var(--s)); border-radius: var(--dac-radius-sm);
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 32%, transparent);
  }
  .logo:empty { display: none; }
  .logo img { height: 100%; width: auto; max-width: 100%; object-fit: contain; display: block; }
  .w-klok { display: flex; flex-direction: column; flex: 0 0 auto; min-width: 0; }
  .klok { font-size: calc(48px * var(--s)); font-weight: 300; line-height: 1; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
  .datum { font-size: calc(15px * var(--s)); color: var(--dac-ink-2); margin-top: calc(3px * var(--s)); white-space: nowrap; }

  /* ------------------------------------------------------------ pagina's */
  .pagina { display: none; flex: 1 1 auto; min-height: 0; flex-direction: column; gap: calc(16px * var(--s)); }
  .pagina.actief { display: flex; }

  .eyebrow { font-size: calc(12px * var(--s)); font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--dac-ink-3); }
  .titel { font-size: calc(34px * var(--s)); font-weight: 600; letter-spacing: -0.01em; line-height: 1.15; }
  .onder { font-size: calc(17px * var(--s)); color: var(--dac-ink-2); }
  .paginakop { display: flex; align-items: center; gap: calc(20px * var(--s)); flex: 0 0 auto; }
  .paginakop .pk-tekst { display: flex; flex-direction: column; gap: calc(3px * var(--s)); min-width: 0; flex: 1 1 auto; }
  .terug {
    display: flex; align-items: center; gap: calc(6px * var(--s)); height: calc(48px * var(--s)); padding: 0 calc(18px * var(--s)) 0 calc(12px * var(--s));
    border-radius: var(--dac-radius-pill); font: inherit; font-size: calc(16px * var(--s)); font-weight: 600; cursor: pointer;
    color: var(--dac-ink); background: var(--dac-surface); border: 1px solid var(--dac-border-hi); flex: 0 0 auto;
  }
  .terug .icon { font-size: calc(22px * var(--s)); }
  .terug:active { background: var(--dac-surface-hi); }
  .p-inhoud { flex: 1 1 auto; min-height: 0; overflow-y: auto; }

  /* ------------------------------------------------------------ het raster */
  .raster {
    display: grid; flex: 1 1 auto; min-height: 0;
    grid-template-columns: repeat(6, minmax(0, 1fr)); grid-template-rows: repeat(6, minmax(0, 1fr));
    gap: calc(14px * var(--s));
  }
  /* ALLES IN EEN BLOK SCHAALT MET HET BLOK. Elke maat in een blok is
     calc(px * var(--s)), en --s is hier de schermschaal maal de maat van het
     blok (--b, uit blokSchaal: 2\xD72 is 1) maal de pasfactor (--pas, uit
     pasLijst: een tikje kleiner als er dan net een rij bij past). Gevraagd
     op 10 september 2026: "alles van alle kaarten moet meegeschaald worden
     als je ze kleiner en groter maakt." De kop van een blok doet daar niet
     aan mee: die is op elk blok even groot, anders leest het raster als
     zeven verschillende kaarten. */
  .blok {
    --s: calc(var(--ss) * var(--b, 1) * var(--pas, 1));
    display: flex; flex-direction: column; min-height: 0; min-width: 0; overflow: hidden;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius); box-shadow: var(--dac-shadow);
    container-type: inline-size;
  }
  .blok > .bk { --s: var(--ss); }
  /* Het welkomblok meet ook zijn hoogte (container-type: size), zodat een
     laag blok logo, klok en tekst naast elkaar zet en een hoog blok onder
     elkaar. Een rasterblok heeft zijn maat van het raster, dus dat mag. */
  .blok.welkom { background: none; border: none; box-shadow: none; justify-content: center; container-type: size; }
  .bk {
    display: flex; align-items: center; gap: calc(10px * var(--s)); flex: 0 0 auto; width: 100%;
    padding: calc(11px * var(--s)) calc(16px * var(--s)); text-align: left; font: inherit; color: inherit;
    background: none; border: none; border-bottom: 1px solid var(--dac-border);
  }
  .bk .bk-ico { font-size: calc(20px * var(--s)); color: var(--dac-ink-3); flex: 0 0 auto; display: flex; }
  .bk .bk-titel { font-size: calc(16px * var(--s)); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bk .bk-sub { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); white-space: nowrap; }
  /* Een kop met een pagina erachter is een knop, en dat moet je zien: de
     titel in het accent en rechts een pil "Alles bekijken" met een pijl. */
  .bk[data-pagina] { cursor: pointer; }
  .bk[data-pagina] .bk-ico, .bk[data-pagina] .bk-titel { color: var(--tone); }
  .bk-meer {
    margin-left: auto; flex: 0 0 auto; display: flex; align-items: center; gap: calc(3px * var(--s));
    font-size: calc(12px * var(--s)); font-weight: 600; color: var(--tone);
    padding: calc(4px * var(--s)) calc(6px * var(--s)) calc(4px * var(--s)) calc(10px * var(--s)); border-radius: var(--dac-radius-pill);
    background: color-mix(in srgb, var(--tone) 14%, transparent); border: 1px solid color-mix(in srgb, var(--tone) 34%, transparent);
  }
  .bk-meer .icon { font-size: calc(16px * var(--s)); }
  .bk[data-pagina]:active { background: color-mix(in srgb, var(--tone) 12%, transparent); }
  .bk[data-pagina]:active .bk-meer { background: var(--tone); color: #fff; }
  @container (max-width: 250px) { .bk-meer .txt { display: none; } .bk-meer { padding-left: calc(6px * var(--s)); } }
  .bi { flex: 1 1 auto; min-height: 0; overflow: hidden; padding: calc(12px * var(--s)) calc(16px * var(--s)); display: flex; flex-direction: column; gap: calc(10px * var(--s)); }
  /* Een blok van \xE9\xE9n rasterrij is 98px hoog en heeft een kop: alles erin
     wordt compact, anders staat er een halve tegel. Een blok dat "dicht"
     is, is een blok waar de gewone tegels niet in passen: dezelfde compacte
     tegels, zodat er vier medewerkers in een blok van twee bij twee gaan.
     Gemeld op 10 september 2026: "passen er niet 4 personen op en geen
     4 verlichtingen zoals je ziet." */
  .blok.klein .bk { padding: calc(6px * var(--s)) calc(14px * var(--s)); }
  .blok.klein .bi { padding: calc(6px * var(--s)) calc(12px * var(--s)); gap: calc(6px * var(--s)); }
  .blok.dicht .bi { gap: calc(6px * var(--s)); }
  .blok.dicht .tegels, .blok.dicht .lampen { gap: calc(6px * var(--s)); }
  .blok.klein .persoon, .blok.klein .lamp, .blok.dicht .persoon, .blok.dicht .lamp { min-height: 0; padding: calc(5px * var(--s)) calc(10px * var(--s)); gap: calc(10px * var(--s)); }
  .blok.klein .avatar, .blok.klein .lamp .chip, .blok.dicht .avatar, .blok.dicht .lamp .chip { width: calc(32px * var(--s)); height: calc(32px * var(--s)); font-size: calc(13px * var(--s)); }
  /* E\xE9n rij hoog: vier lampen (of personen) in twee rijen van twee, dus
     een smalle regel per tegel. Gemeld op 10 september 2026 met een blok
     van 2\xD71 en "toon 4": "nu passen er maar 2 op." */
  .blok.klein .lampen, .blok.klein .tegels { gap: calc(4px * var(--s)); }
  .blok.klein .lampen .lamp, .blok.klein .tegels .persoon { padding: calc(3px * var(--s)) calc(8px * var(--s)); gap: calc(8px * var(--s)); border-radius: var(--dac-radius-sm); }
  .blok.klein .lampen .lamp .chip, .blok.klein .tegels .avatar { width: calc(22px * var(--s)); height: calc(22px * var(--s)); font-size: calc(14px * var(--s)); border-radius: calc(6px * var(--s)); }
  .blok.klein .tegels .avatar { font-size: calc(10px * var(--s)); }
  .blok.klein .lampen .l-naam, .blok.klein .tegels .p-naam { font-size: calc(13px * var(--s)); }
  .blok.klein .lamp .chip, .blok.dicht .lamp .chip { font-size: calc(18px * var(--s)); }
  .blok.klein .p-functie, .blok.klein .p-status, .blok.klein .l-status,
  .blok.dicht .p-functie, .blok.dicht .p-status, .blok.dicht .l-status { display: none; }
  .blok.klein .chip { width: calc(34px * var(--s)); height: calc(34px * var(--s)); font-size: calc(18px * var(--s)); }
  .blok.klein.mededeling .m-tekst { font-size: calc(16px * var(--s)); }
  .blok.klein .afspraak, .blok.klein .vj { padding: calc(6px * var(--s)) calc(12px * var(--s)); }
  .blok.klein .bericht { padding: calc(6px * var(--s)) calc(10px * var(--s)); }
  .blok.klein .bericht .foto { display: none; }
  /* Alles links uitgelijnd: het logo hoort linksboven, ook in een hoog blok
     (het stond in het midden omdat het vak de hele breedte kreeg). */
  .blok.welkom .bi { padding: calc(4px * var(--s)) calc(6px * var(--s)); justify-content: center; align-items: flex-start; gap: calc(8px * var(--s)); }
  .leeg { color: var(--dac-ink-3); font-size: calc(16px * var(--s)); padding: calc(10px * var(--s)) 0; }

  /* welkom */
  .welkomtekst { font-size: calc(30px * var(--s)); font-weight: 600; letter-spacing: -0.01em; line-height: 1.15; }
  .welkom-onder { font-size: calc(16px * var(--s)); color: var(--dac-ink-2); }
  .blok.welkom .logo { height: calc(52px * var(--s)); max-width: 100%; }
  .blok.welkom .logo:not(.beeld) { width: calc(52px * var(--s)); }
  .blok.welkom .w-tekstvak { display: flex; flex-direction: column; gap: calc(3px * var(--s)); min-width: 0; }
  /* Breed of laag: logo, klok en tekst naast elkaar, met de tekst rechts. */
  @container (min-width: 560px), (max-height: 150px) {
    .blok.welkom .bi { flex-direction: row; align-items: center; gap: calc(28px * var(--s)); }
    .blok.welkom .w-tekstvak { flex: 1 1 auto; }
    .blok.welkom .logo { height: calc(64px * var(--s)); max-width: calc(260px * var(--s)); }
    .blok.welkom .logo:not(.beeld) { width: calc(64px * var(--s)); }
  }

  /* weer */
  .w-nu { display: flex; align-items: center; gap: calc(16px * var(--s)); }
  .w-icoon { font-size: calc(72px * var(--s)); flex: 0 0 auto; color: var(--dac-ink-2); }
  .temp { font-size: calc(42px * var(--s)); font-weight: 300; line-height: 1; font-variant-numeric: tabular-nums; }
  .w-tekst { font-size: calc(15px * var(--s)); color: var(--dac-ink-2); margin-top: calc(4px * var(--s)); line-height: 1.3; }
  /* Een weerblok van \xE9\xE9n kolom is zo'n 180px breed: icoon en getal passen
     dan niet naast elkaar. Gemeld op 10 september 2026 met een schermafdruk
     waarop de 13\xB0 half onder de rand stond: "het weer moet zichtbaar zijn op
     1 kolom." Onder elkaar dus, kleiner, en de uren weg. */
  @container (max-width: 240px) {
    .blok.weer .w-nu { gap: calc(8px * var(--s)); }
    .blok.weer .w-icoon { font-size: calc(44px * var(--s)); }
    .blok.weer .temp { font-size: calc(30px * var(--s)); }
    .blok.weer .w-tekst { font-size: calc(12px * var(--s)); margin-top: calc(2px * var(--s)); }
    .blok.weer .uren { display: none; }
  }
  /* E\xE9n rij hoog: icoon en getal kleiner, en de tekst op \xE9\xE9n regel erbij.
     Die tekst stond eerst uit; gemeld op 10 september 2026: "nu wordt het
     weer wel laten zien maar de tekst niet." */
  .blok.klein .w-icoon { font-size: calc(38px * var(--s)); }
  .blok.klein .temp { font-size: calc(26px * var(--s)); }
  .blok.klein .w-tekst { font-size: calc(13px * var(--s)); margin-top: calc(1px * var(--s)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .blok.klein .w-nu { gap: calc(12px * var(--s)); }
  .blok.klein .w-nu > div:last-child { min-width: 0; }
  .uren { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: calc(8px * var(--s)); }
  .uur, .dag { display: flex; flex-direction: column; align-items: center; gap: calc(4px * var(--s)); padding: calc(8px * var(--s)) 0; border-radius: var(--dac-radius-sm); background: var(--dac-surface); }
  .uur .u, .dag .u { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); }
  .uur .icon, .dag .icon { font-size: calc(30px * var(--s)); color: var(--dac-ink-2); }
  .uur .t, .dag .t { font-size: calc(16px * var(--s)); font-variant-numeric: tabular-nums; }
  .dag .t2 { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); font-variant-numeric: tabular-nums; }
  .weerpagina { display: flex; flex-direction: column; gap: calc(20px * var(--s)); }
  .weerpagina .w-nu { padding: calc(8px * var(--s)) 0; }
  .weerpagina .w-icoon { font-size: calc(120px * var(--s)); }
  .weerpagina .temp { font-size: calc(64px * var(--s)); }
  .weerpagina .w-tekst { font-size: calc(19px * var(--s)); }
  .weerpagina .uren { grid-template-columns: repeat(8, minmax(0, 1fr)); }
  /* De dagen even breed als de uren erboven, en gecentreerd: zes dagen
     onder acht uren stonden links uitgelijnd met een gat rechts (gemeld op
     10 september 2026 met een schermafdruk). */
  .dagen { display: flex; justify-content: center; gap: calc(8px * var(--s)); }
  .dagen .dag { flex: 0 0 calc((100% - 7 * 8px * var(--s)) / 8); box-sizing: border-box; }

  /* De chip van een lamp. */
  .chip {
    width: calc(46px * var(--s)); height: calc(46px * var(--s)); flex: 0 0 auto; font-size: calc(24px * var(--s));
    border-radius: var(--dac-radius-sm); display: grid; place-items: center; color: var(--tone);
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 32%, transparent);
  }

  /* mededelingen: een baan die per mededeling een scherm breed is, met
     scroll-snap zodat een veeg op de iPad op de volgende landt. Geen accent
     op het vlak en geen icoon: "gewoon de kleuren van de andere kaarten",
     10 september 2026. */
  .blok.mededeling .bi { padding: 0; gap: 0; }
  .m-baan {
    display: flex; flex: 1 1 auto; min-height: 0; overflow-x: auto; overflow-y: hidden;
    scroll-snap-type: x mandatory; scrollbar-width: none; -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain; touch-action: pan-x;
  }
  .m-baan::-webkit-scrollbar { display: none; }
  /* Met een muis kun je een scrollvak niet vegen; op de pc sleept een
     pointer de baan zelf (zie sleepMededeling_), zonder snap tijdens het
     slepen, anders springt hij terug. Gemeld op 10 september 2026: "ik kan
     niet swipen op mededelingen." */
  .m-baan.sleept { scroll-snap-type: none; cursor: grabbing; scroll-behavior: auto; }
  @media (hover: hover) { .m-baan { cursor: grab; } }
  .m-slide {
    flex: 0 0 100%; width: 100%; scroll-snap-align: start; scroll-snap-stop: always;
    display: flex; align-items: center; min-width: 0; box-sizing: border-box;
    padding: calc(12px * var(--s)) calc(18px * var(--s));
  }
  .m-tekst { font-size: calc(18px * var(--s)); line-height: 1.35; white-space: pre-wrap; overflow: hidden; overflow-wrap: anywhere; max-height: 100%; }
  .m-stippen { display: flex; gap: calc(2px * var(--s)); justify-content: center; padding: 0 0 calc(4px * var(--s)); flex: 0 0 auto; }
  /* Elke stip is ook een knop: tikken springt naar die mededeling. Het
     raakvlak is groter dan de stip zelf. */
  .m-stippen span { width: calc(6px * var(--s)); height: calc(6px * var(--s)); border-radius: 50%; background: var(--dac-border-hi); background-clip: content-box; padding: calc(4px * var(--s)); box-sizing: content-box; cursor: pointer; }
  .m-stippen span.nu { background-color: var(--tone); }
  .blok.klein .m-stippen { display: none; }
  .blok.klein .m-slide { padding: calc(6px * var(--s)) calc(14px * var(--s)); }

  /* de pagina Mededelingen */
  .m-pagina { display: flex; flex-direction: column; gap: calc(14px * var(--s)); }
  .m-lijst { display: grid; grid-template-columns: repeat(auto-fill, minmax(calc(340px * var(--s)), 1fr)); gap: calc(12px * var(--s)); align-content: start; }
  .m-item { padding: calc(16px * var(--s)) calc(20px * var(--s)); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); display: flex; flex-direction: column; gap: calc(6px * var(--s)); min-width: 0; }
  .m-item .m-p { font-size: calc(12px * var(--s)); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--tone); }
  .m-item .m-t { font-size: calc(19px * var(--s)); line-height: 1.4; white-space: pre-wrap; overflow-wrap: anywhere; }
  .m-kop { padding-top: calc(6px * var(--s)); }

  /* openingstijden */
  .ot { display: grid; grid-template-columns: minmax(0, 1fr); gap: calc(5px * var(--s)) calc(24px * var(--s)); font-size: calc(15px * var(--s)); }
  .ot.twee { grid-template-columns: repeat(2, minmax(0, 1fr)); font-size: calc(13px * var(--s)); column-gap: calc(16px * var(--s)); }
  /* NIET "laag" noemen: dat is de klasse van de lagen (detail, nacht) en die
     staan op display: none. Gemeten op 10 september 2026: een leeg blok. */
  .ot.compact { font-size: calc(13px * var(--s)); row-gap: calc(3px * var(--s)); }
  .ot div { display: flex; justify-content: space-between; gap: calc(12px * var(--s)); }
  .ot span:first-child { color: var(--dac-ink-2); }
  .ot .vandaag span:first-child { color: var(--tone); font-weight: 600; }
  .ot .vandaag span:last-child { font-weight: 600; }
  .ot .dicht span:last-child { color: var(--dac-ink-3); }
  .ot .num { font-variant-numeric: tabular-nums; white-space: nowrap; }
  .ot-nu { font-size: calc(15px * var(--s)); color: var(--dac-ink-2); }

  /* DE LIJSTEN IN EEN BLOK VULLEN HET BLOK. Elke lijst is een raster; pasBij_
     zet er inline grid-template-rows op (repeat(n, 1fr)) zodat de rijen die
     erin passen even hoog worden en samen precies de hoogte vullen. Zonder
     die inline regel (op een pagina, of v\xF3\xF3r het meten) staan de rijen op
     hun eigen maat, bovenaan. Gemeld op 10 september 2026: "maak dan alles
     dezelfde grootte en passend." */
  .bi > .tegels, .bi > .n-lijst, .bi > .lampen, .bi > .afspraken, .bi > .vj-lijst { flex: 1 1 auto; min-height: 0; }

  /* aanwezig */
  .tegels { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(10px * var(--s)); align-content: start; }
  .tegels.kol-1 { grid-template-columns: minmax(0, 1fr); }
  .tegels.kol-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .persoon {
    display: flex; align-items: center; gap: calc(12px * var(--s));
    padding: calc(10px * var(--s)) calc(12px * var(--s)); cursor: pointer;
    background: var(--dac-surface); border: 1px solid var(--dac-border);
    border-radius: var(--dac-radius); box-shadow: var(--dac-shadow); min-height: calc(64px * var(--s));
    text-align: left; font: inherit; color: inherit; min-width: 0;
  }
  .p-inhoud .persoon { padding: calc(14px * var(--s)) calc(16px * var(--s)); min-height: calc(84px * var(--s)); gap: calc(16px * var(--s)); }
  .persoon:active { background: var(--dac-surface-hi); }
  .avatar {
    width: calc(46px * var(--s)); height: calc(46px * var(--s)); flex: 0 0 auto; overflow: hidden;
    border-radius: var(--dac-radius-sm); display: grid; place-items: center;
    font-size: calc(16px * var(--s)); font-weight: 700;
    color: var(--dac-ink-3); background: var(--dac-surface); border: 1px solid var(--dac-border);
  }
  .p-inhoud .avatar { width: calc(60px * var(--s)); height: calc(60px * var(--s)); font-size: calc(20px * var(--s)); }
  .rond .avatar { border-radius: 50%; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .persoon.aan .avatar { color: var(--tone); background: color-mix(in srgb, var(--tone) 14%, transparent); border-color: color-mix(in srgb, var(--tone) 40%, transparent); }
  .persoon:not(.aan) .avatar img { opacity: 0.45; filter: grayscale(1); }
  .p-tekst { min-width: 0; display: flex; flex-direction: column; gap: calc(1px * var(--s)); }
  .p-naam { font-size: calc(16px * var(--s)); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .p-inhoud .p-naam { font-size: calc(19px * var(--s)); }
  .p-functie { font-size: calc(13px * var(--s)); color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .p-status { font-size: calc(12px * var(--s)); font-weight: 600; color: var(--dac-ink-3); }
  .persoon.aan .p-status { color: var(--tone); }
  .kolommen { display: flex; gap: calc(20px * var(--s)); align-items: flex-start; }
  .kolom { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: calc(10px * var(--s)); }
  .kolom .eyebrow { padding: 0 calc(4px * var(--s)); }
  /* Twee groepen naast elkaar: binnen elke groep twee tegels naast elkaar,
     anders is een tegel van 780px breed voor \xE9\xE9n naam. Drie of meer groepen:
     \xE9\xE9n tegel per rij. */
  .kolom .tegels { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .kolommen.drie .kolom .tegels { grid-template-columns: minmax(0, 1fr); }

  /* De tegels zijn een <div role="button"> en geen <button>: Chrome maakt van
     een <button> geen echte flexcontainer (de inhoud wordt gecentreerd en
     krijgt geen hoogte), en dan schoof de samenvatting over de titel heen.
     Gemeten op 9 september 2026 met de NOS-feed. */
  .persoon, .bericht, .lamp { -webkit-appearance: none; appearance: none; }
  .persoon:focus-visible, .bericht:focus-visible, .lamp:focus-visible, .bk:focus-visible, .terug:focus-visible { outline: 2px solid var(--tone); outline-offset: 2px; }

  /* nieuws */
  .n-lijst { display: grid; grid-template-columns: minmax(0, 1fr); gap: calc(8px * var(--s)); align-content: start; }
  .nieuws-raster { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(14px * var(--s)); align-content: start; }
  .bericht {
    display: flex; align-items: stretch; gap: calc(12px * var(--s)); padding: calc(10px * var(--s)) calc(12px * var(--s)); cursor: pointer;
    background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius);
    box-shadow: var(--dac-shadow); text-align: left; font: inherit; color: inherit; min-width: 0; box-sizing: border-box;
  }
  .nieuws-raster .bericht { padding: calc(16px * var(--s)) calc(18px * var(--s)); gap: calc(16px * var(--s)); min-height: calc(110px * var(--s)); }
  .bericht:active { background: var(--dac-surface-hi); }
  .bericht.eigen { border-color: color-mix(in srgb, var(--tone) 40%, transparent); }
  /* De foto groeit mee met de rij: in een blok dat de rijen uitsmeert wordt
     hij hoger, en de tekst blijft in het midden staan. */
  .bericht .foto { width: calc(84px * var(--s)); min-height: calc(60px * var(--s)); flex: 0 0 auto; border-radius: var(--dac-radius-sm); overflow: hidden; background: var(--dac-surface); }
  .nieuws-raster .bericht .foto { width: calc(120px * var(--s)); min-height: calc(84px * var(--s)); }
  .bericht .foto:empty { display: none; }
  .bericht .foto img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .b-tekst { min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: calc(3px * var(--s)); flex: 1 1 auto; }
  .b-bron { font-size: calc(11px * var(--s)); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dac-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bericht.eigen .b-bron { color: var(--tone); }
  /* De titel mag drie regels: twee sneden een NOS-kop halverwege af
     (gemeld op 10 september 2026 met een schermafdruk). */
  .b-titel { font-size: calc(15px * var(--s)); font-weight: 600; line-height: 1.25; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
  .nieuws-raster .b-titel { font-size: calc(18px * var(--s)); }
  .b-samenvatting { font-size: calc(14px * var(--s)); color: var(--dac-ink-2); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  /* verlichting en agenda */
  .lampen { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: calc(10px * var(--s)); align-content: start; }
  .lampen.kol-1 { grid-template-columns: minmax(0, 1fr); }
  .lampen.kol-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lamp {
    display: flex; align-items: center; gap: calc(12px * var(--s)); padding: calc(10px * var(--s)) calc(12px * var(--s)); cursor: pointer;
    background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius);
    box-shadow: var(--dac-shadow); text-align: left; font: inherit; color: inherit; min-height: calc(64px * var(--s)); min-width: 0;
  }
  .p-inhoud .lamp { padding: calc(16px * var(--s)) calc(18px * var(--s)); min-height: calc(92px * var(--s)); gap: calc(16px * var(--s)); }
  .lamp:active { background: var(--dac-surface-hi); }
  .lamp .chip { --tone: var(--dac-ink-3); width: calc(46px * var(--s)); height: calc(46px * var(--s)); font-size: calc(24px * var(--s)); background: var(--dac-surface); border-color: var(--dac-border); color: var(--dac-ink-3); }
  .p-inhoud .lamp .chip { width: calc(60px * var(--s)); height: calc(60px * var(--s)); font-size: calc(30px * var(--s)); }
  .lamp.aan .chip { --tone: var(--lampkleur, var(--dac-lit)); color: var(--tone); background: color-mix(in srgb, var(--tone) 14%, transparent); border-color: color-mix(in srgb, var(--tone) 32%, transparent); }
  .lamp.dood { opacity: 0.5; }
  .l-tekst { min-width: 0; }
  .l-naam { font-size: calc(16px * var(--s)); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .p-inhoud .l-naam { font-size: calc(19px * var(--s)); }
  .l-status { font-size: calc(13px * var(--s)); color: var(--dac-ink-2); margin-top: calc(2px * var(--s)); }

  .afspraken { display: grid; grid-template-columns: minmax(0, 1fr); gap: calc(8px * var(--s)); align-content: start; }
  .afspraak { display: flex; box-sizing: border-box; align-items: center; gap: calc(14px * var(--s)); padding: calc(10px * var(--s)) calc(14px * var(--s)); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); min-width: 0; }
  .p-inhoud .afspraak { padding: calc(14px * var(--s)) calc(20px * var(--s)); }
  .a-tijd { font-size: calc(16px * var(--s)); font-variant-numeric: tabular-nums; color: var(--tone); font-weight: 600; flex: 0 0 auto; }
  .p-inhoud .a-tijd { font-size: calc(20px * var(--s)); min-width: calc(120px * var(--s)); }
  .a-tekst { font-size: calc(16px * var(--s)); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .p-inhoud .a-tekst { font-size: calc(19px * var(--s)); white-space: normal; }
  .a-kalender { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); margin-left: auto; flex: 0 0 auto; }

  /* verjaardagen */
  .vj-lijst { display: grid; grid-template-columns: minmax(0, 1fr); gap: calc(8px * var(--s)); align-content: start; }
  .vj-raster { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: calc(12px * var(--s)); align-content: start; }
  .vj { display: flex; align-items: center; gap: calc(14px * var(--s)); padding: calc(10px * var(--s)) calc(14px * var(--s)); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); min-width: 0; }
  .vj-raster .vj { padding: calc(14px * var(--s)) calc(18px * var(--s)); }
  .vj-ico { width: calc(40px * var(--s)); height: calc(40px * var(--s)); flex: 0 0 auto; border-radius: var(--dac-radius-sm); display: grid; place-items: center; font-size: calc(22px * var(--s)); color: var(--dac-ink-3); background: var(--dac-surface); border: 1px solid var(--dac-border); }
  .vj.vandaag .vj-ico { color: var(--tone); background: color-mix(in srgb, var(--tone) 14%, transparent); border-color: color-mix(in srgb, var(--tone) 40%, transparent); }
  .vj-tekst { min-width: 0; display: flex; flex-direction: column; gap: calc(1px * var(--s)); flex: 1 1 auto; }
  .vj-naam { font-size: calc(16px * var(--s)); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .vj-sub { font-size: calc(13px * var(--s)); color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .vj.vandaag .vj-sub { color: var(--tone); font-weight: 600; }
  .vj-wanneer { font-size: calc(14px * var(--s)); color: var(--dac-ink-3); flex: 0 0 auto; font-variant-numeric: tabular-nums; }
  .vj.vandaag .vj-wanneer { color: var(--tone); font-weight: 600; }
  .blok.klein .vj-ico { width: calc(30px * var(--s)); height: calc(30px * var(--s)); font-size: calc(17px * var(--s)); }
  .blok.klein .vj-sub { display: none; }
  /* E\xE9n kolom breed: geen plek voor icoon, naam \xE9n datum naast elkaar; de
     naam bleef leeg (gemeten op 10 september 2026 in een blok van 141 px).
     Dan de datum onder de naam en het icoon weg. */
  @container (max-width: 240px) {
    .blok.verjaardagen .vj { flex-direction: column; align-items: flex-start; gap: calc(2px * var(--s)); }
    .blok.verjaardagen .vj-ico { display: none; }
    .blok.verjaardagen .vj-tekst { width: 100%; }
    .blok.verjaardagen .vj-wanneer { font-size: calc(12px * var(--s)); }
  }

  /* energie: het getal in neutrale inkt, de lijn in het accent. De grafiek
     is een SVG die met het vak meerekt (preserveAspectRatio none); de lijn
     houdt zijn dikte door vector-effect. De opschriften staan in HTML naast
     en onder het vak, zodat ze niet mee vervormen. */
  .blok.energie .bi { gap: calc(8px * var(--s)); }
  /* Alleen het getal, in het midden; "nu \xB7 afgelopen 24 uur" is weg
     (10 september 2026). */
  .e-nu { display: flex; align-items: center; justify-content: center; flex: 0 0 auto; min-width: 0; }
  .e-waarde { font-size: calc(36px * var(--s)); font-weight: 300; line-height: 1; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .e-sub { font-size: calc(13px * var(--s)); color: var(--dac-ink-2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .e-grafiek { position: relative; flex: 1 1 auto; min-height: calc(36px * var(--s)); }
  .e-grafiek svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }
  .e-grafiek .e-vlak { fill: var(--tone); fill-opacity: 0.16; stroke: none; }
  .e-grafiek .e-lijn { fill: none; stroke: var(--tone); stroke-width: 2px; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
  .e-grafiek .e-nul { stroke: var(--dac-border-hi); stroke-width: 1px; vector-effect: non-scaling-stroke; }
  .e-grafiek .e-piek { position: absolute; left: 0; top: 0; font-size: calc(11px * var(--s)); color: var(--dac-ink-3); font-variant-numeric: tabular-nums; pointer-events: none; }
  .e-grafiek .e-stip { position: absolute; left: 100%; width: calc(8px * var(--s)); height: calc(8px * var(--s)); border-radius: 50%; background: var(--tone); border: 2px solid var(--dac-bg-raise); transform: translate(-50%, -50%); box-sizing: content-box; }
  .e-as { display: flex; justify-content: space-between; flex: 0 0 auto; font-size: calc(11px * var(--s)); color: var(--dac-ink-3); font-variant-numeric: tabular-nums; }
  .e-leeg { font-size: calc(14px * var(--s)); color: var(--dac-ink-3); }
  /* E\xE9n rij hoog: getal links, grafiek rechts. */
  .blok.klein.energie .bi { flex-direction: row; align-items: stretch; gap: calc(14px * var(--s)); }
  .blok.klein .e-nu { flex: 0 0 auto; padding: 0 calc(6px * var(--s)); }
  .blok.klein .e-waarde { font-size: calc(26px * var(--s)); }
  .blok.klein .e-as, .blok.klein .e-piek { display: none; }
  .blok.klein .e-grafiek { min-height: 0; }
  @container (max-width: 240px) { .blok.energie .e-as span:nth-child(2) { display: none; } }
  /* De pagina: de samenvatting als tegels, daaronder de grote grafiek. */
  .e-pagina { display: flex; flex-direction: column; gap: calc(20px * var(--s)); height: 100%; min-height: 0; }
  .e-tegels { display: grid; grid-template-columns: repeat(auto-fit, minmax(calc(150px * var(--s)), 1fr)); gap: calc(12px * var(--s)); flex: 0 0 auto; }
  .e-tegel { padding: calc(14px * var(--s)) calc(18px * var(--s)); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); display: flex; flex-direction: column; gap: calc(4px * var(--s)); min-width: 0; }
  .e-tegel .e-l { font-size: calc(12px * var(--s)); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dac-ink-3); }
  .e-tegel .e-w { font-size: calc(30px * var(--s)); font-weight: 300; line-height: 1.1; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .e-pagina .e-vak { flex: 1 1 auto; min-height: calc(200px * var(--s)); display: flex; flex-direction: column; gap: calc(8px * var(--s)); padding: calc(18px * var(--s)); background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius); }
  .e-pagina .e-grafiek { min-height: calc(160px * var(--s)); }
  /* ---- de afvalkalender ----
     De KLEUR is hier de bak, en dat is de enige plek op dit scherm waar kleur
     iets anders doet dan het accent dragen -- precies zoals op de afvalkaart:
     grijs naast groen naast oranje is de enige manier om te zien welke er
     woensdag aan straat moet. */
  .af { display: flex; flex-direction: column; gap: calc(8px * var(--s)); height: 100%; min-height: 0; }
  .af-eerst {
    display: flex; align-items: center; gap: calc(12px * var(--s)); flex: 0 0 auto;
    padding: calc(10px * var(--s)) calc(14px * var(--s));
    border-radius: var(--dac-radius);
    background: color-mix(in srgb, var(--bak) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--bak) 34%, transparent);
  }
  .af-eerst .af-icos { display: flex; gap: calc(6px * var(--s)); flex: 0 0 auto; }
  .af-eerst .af-ico {
    width: calc(38px * var(--s)); height: calc(38px * var(--s)); flex: 0 0 auto;
    display: grid; place-items: center; border-radius: var(--dac-radius-sm);
    color: var(--bak); background: color-mix(in srgb, var(--bak) 18%, transparent);
  }
  .af-eerst .af-ico svg { width: calc(21px * var(--s)); height: calc(21px * var(--s)); }
  .af-eerst .af-t { min-width: 0; flex: 1 1 auto; }
  .af-eerst .af-n { font-size: calc(19px * var(--s)); font-weight: 600; letter-spacing: -.02em; }
  .af-eerst .af-w { font-size: calc(13px * var(--s)); color: var(--dac-ink-2); }
  .af-eerst .af-d { font-size: calc(19px * var(--s)); font-weight: 600; font-variant-numeric: tabular-nums; flex: 0 0 auto; }

  .af-lijst { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }
  .af-rij {
    display: grid; grid-template-columns: calc(11px * var(--s)) 1fr auto;
    gap: calc(12px * var(--s)); align-items: center;
    padding: calc(6px * var(--s)) calc(2px * var(--s)); font-size: calc(15px * var(--s));
  }
  .af-rij + .af-rij { border-top: 1px solid var(--dac-border); }
  .af-rij i { width: calc(11px * var(--s)); height: calc(11px * var(--s)); border-radius: calc(3px * var(--s)); background: var(--bak); }
  .af-rij .af-n { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .af-rij .af-w { color: var(--dac-ink-2); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .af-rij[data-stil="true"] { opacity: .45; }

  /* De pagina: dezelfde rijen, groter, met de datum voluit. */
  .af-pagina { display: flex; flex-direction: column; gap: calc(14px * var(--s)); }
  .af-pagina .af-rij { font-size: calc(19px * var(--s)); padding: calc(11px * var(--s)) calc(2px * var(--s)); }
  .af-pagina .af-eerst { padding: calc(16px * var(--s)) calc(18px * var(--s)); }
  .af-pagina .af-eerst .af-n { font-size: calc(26px * var(--s)); }
  .af-pagina .af-uitleg { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); }

  /* ---- de energiepagina uit het energiedashboard van Home Assistant ----
     Gevraagd op 17 september 2026: een heel overzicht van de historie, uit de
     ingestelde waarden van het energiedashboard. Wat hieronder staat is dus
     niet de vorm van een sensor maar die van een dashboard: een periodekiezer,
     staven per tijdvak, en de bronnen met hun totaal. */
  .ed { display: flex; flex-direction: column; gap: calc(16px * var(--s)); height: 100%; min-height: 0; }
  .ed-balk { display: flex; align-items: center; gap: calc(10px * var(--s)); flex: 0 0 auto; flex-wrap: wrap; }
  .ed-per { display: flex; gap: calc(4px * var(--s)); padding: calc(4px * var(--s)); background: rgba(var(--dac-tint), .05); border: 1px solid var(--dac-border); border-radius: var(--dac-radius-pill); }
  .ed-per button {
    padding: calc(7px * var(--s)) calc(16px * var(--s)); cursor: pointer; border: 0; background: none;
    border-radius: var(--dac-radius-pill); font: inherit; font-size: calc(14px * var(--s));
    font-weight: 500; color: var(--dac-ink-3); white-space: nowrap;
  }
  .ed-per button[aria-pressed="true"] { color: var(--tone); background: color-mix(in srgb, var(--tone) 16%, transparent); }
  .ed-stap { display: flex; align-items: center; gap: calc(6px * var(--s)); margin-left: auto; }
  .ed-stap button {
    width: calc(36px * var(--s)); height: calc(36px * var(--s)); display: grid; place-items: center;
    cursor: pointer; padding: 0; color: var(--dac-ink-2); background: var(--dac-surface);
    border: 1px solid var(--dac-border); border-radius: var(--dac-radius-sm);
  }
  .ed-stap button[disabled] { opacity: .35; cursor: default; }
  .ed-stap button svg { width: calc(17px * var(--s)); height: calc(17px * var(--s)); }
  .ed-stap .ed-wanneer { font-size: calc(16px * var(--s)); font-weight: 600; min-width: calc(150px * var(--s)); text-align: center; }

  .ed-tegels { display: grid; gap: calc(10px * var(--s)); grid-template-columns: repeat(auto-fit, minmax(calc(150px * var(--s)), 1fr)); flex: 0 0 auto; }
  .ed-tegel {
    display: flex; flex-direction: column; gap: calc(2px * var(--s)); padding: calc(14px * var(--s));
    background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius);
    border-left: calc(4px * var(--s)) solid var(--rol, var(--dac-ink-3));
  }
  .ed-tegel .ed-l { font-size: calc(13px * var(--s)); color: var(--dac-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ed-tegel .ed-w { font-size: calc(26px * var(--s)); font-weight: 600; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
  .ed-tegel .ed-b { font-size: calc(12px * var(--s)); color: var(--dac-ink-3); }

  .ed-vak {
    flex: 1 1 auto; min-height: calc(200px * var(--s)); display: flex; flex-direction: column;
    gap: calc(10px * var(--s)); padding: calc(18px * var(--s));
    background: var(--dac-surface); border: 1px solid var(--dac-border); border-radius: var(--dac-radius);
  }
  .ed-kop { display: flex; align-items: baseline; gap: calc(14px * var(--s)); flex: 0 0 auto; flex-wrap: wrap; }
  .ed-kop .ed-titel { font-size: calc(14px * var(--s)); color: var(--dac-ink-2); }
  .ed-legenda { display: flex; gap: calc(14px * var(--s)); flex-wrap: wrap; margin-left: auto; }
  .ed-legenda span { display: inline-flex; align-items: center; gap: calc(6px * var(--s)); font-size: calc(12.5px * var(--s)); color: var(--dac-ink-2); }
  .ed-legenda i { width: calc(10px * var(--s)); height: calc(10px * var(--s)); border-radius: calc(3px * var(--s)); background: var(--rol); }

  /* De staven. Geen SVG maar echte elementen: ze moeten meeschalen met --s,
     en een titel dragen die je op een tablet kunt aantikken. */
  .ed-staven { flex: 1 1 auto; min-height: calc(120px * var(--s)); display: flex; align-items: flex-end; gap: calc(2px * var(--s)); }
  .ed-staaf { flex: 1 1 0; min-width: 0; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; gap: calc(1px * var(--s)); }
  .ed-staaf i { display: block; width: 100%; background: var(--rol); border-radius: calc(2px * var(--s)) calc(2px * var(--s)) 0 0; min-height: 0; }
  .ed-staaf i + i { border-radius: 0; }
  .ed-as { display: flex; gap: calc(2px * var(--s)); flex: 0 0 auto; }
  .ed-as span {
    flex: 1 1 0; min-width: 0; text-align: center; font-size: calc(11px * var(--s));
    color: var(--dac-ink-3); font-variant-numeric: tabular-nums;
    white-space: nowrap; overflow: hidden;
  }
  .ed-leeg { flex: 1 1 auto; display: grid; place-items: center; font-size: calc(15px * var(--s)); color: var(--dac-ink-3); text-align: center; }

  .ed-bronnen { display: flex; flex-direction: column; gap: calc(6px * var(--s)); flex: 0 0 auto; }
  .ed-bron { display: grid; grid-template-columns: calc(10px * var(--s)) 1fr auto; gap: calc(12px * var(--s)); align-items: center; font-size: calc(15px * var(--s)); padding: calc(4px * var(--s)) 0; }
  .ed-bron + .ed-bron { border-top: 1px solid var(--dac-border); }
  .ed-bron i { width: calc(10px * var(--s)); height: calc(10px * var(--s)); border-radius: calc(3px * var(--s)); background: var(--rol); }
  .ed-bron .ed-n { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dac-ink-2); }
  .ed-bron .ed-v { font-weight: 600; font-variant-numeric: tabular-nums; }
  .ed-voet { font-size: calc(12px * var(--s)); color: var(--dac-ink-3); flex: 0 0 auto; }

  .e-pagina .e-titel { font-size: calc(14px * var(--s)); color: var(--dac-ink-2); flex: 0 0 auto; }

  /* ------------------------------------------------------------ lagen */
  .laag { position: absolute; inset: 0; display: none; background: var(--dac-bg); color: var(--dac-ink); }
  .laag.open { display: flex; }

  /* Het geopende bericht ligt op een DICHTE achtergrond. Hij was 96%
     doorschijnend, en dat las als "geblurd"; gemeld op 10 september 2026. */
  .detail { padding: calc(32px * var(--s)) calc(36px * var(--s)); flex-direction: column; gap: calc(16px * var(--s)); background: var(--dac-bg); }
  .detail .sluit { align-self: flex-start; display: flex; align-items: center; gap: calc(6px * var(--s)); font: inherit; font-size: calc(16px * var(--s)); font-weight: 600; color: var(--dac-ink); background: var(--dac-surface); border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-pill); height: calc(48px * var(--s)); padding: 0 calc(18px * var(--s)) 0 calc(12px * var(--s)); cursor: pointer; }
  .detail .sluit .icon { font-size: calc(22px * var(--s)); }
  .detail .d-bron { font-size: calc(13px * var(--s)); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--tone); }
  .detail .d-titel { font-size: calc(32px * var(--s)); font-weight: 600; line-height: 1.15; }
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
    .persoon:hover, .lamp:hover, .bericht:hover, .terug:hover { background: var(--dac-surface-hi); }
    .bk[data-pagina]:hover .bk-meer { background: color-mix(in srgb, var(--tone) 26%, transparent); }
  }

  ${Ip}
`,Wt=class extends S{constructor(){super(),this.stand_=null,this.feeds_=[],this.pagina_="welkom",this.uren_=[],this.dagen_=[],this.afspraken_=[],this.herkansing_=new le(()=>this.haal_()),this.dashHerkansing_=new le(()=>this.dashProbeer_(!0)),this.verbinding_=new ke,this.fout_=null,this.html_=new Map,this.weerEntiteit_=null,this.weerOpzeggen_=[],this.agendaSleutel_="",this.mAuto_=0,this.energie_={entiteit:null,punten:[],geladen:0},this.dash_={prefs:null,bronnen:[],prijzen:{},stats:{},sleutel:"",bezig:!1,gehaald:0,fout:null,periode:"dag",offset:0}}validate(e){return{...e}}installatie_(){let e=this.stand_?.installatie??{};return{weer:e.weer??null,energie:e.energie??null,agendas:Array.isArray(e.agendas)?e.agendas:[],afval:Array.isArray(e.afval)?e.afval:[],verlichting:Array.isArray(e.verlichting)?e.verlichting:[]}}standNu_(){return this.stand_?{...this.stand_,installatie:this.installatie_()}:null}watched(){let e=this.installatie_();return[e.weer,e.energie,"sun.sun",...e.verlichting.map(t=>t.entity),...e.afval??[]].filter(Boolean)}getCardSize(){return 12}template(){let e=t=>`
      <section class="pagina" data-p="${t}">
        <div class="paginakop">
          <button class="terug" type="button">${zn.back}<span>Terug</span></button>
          <div class="pk-tekst"><div class="eyebrow">${pi[t].eyebrow}</div><div class="titel pk-titel">${pi[t].titel}</div></div>
          <div class="onder">${pi[t].onder}</div>
        </div>
        <div class="p-inhoud" data-p="${t}"></div>
      </section>`;return`
      <div class="scherm">
        <section class="pagina actief" data-p="welkom"><div class="raster"></div></section>
        ${Object.keys(pi).map(e).join("")}

        <div class="laag detail">
          <button class="sluit" type="button">${zn.back}<span>Terug</span></button>
          <div class="d-bron"></div>
          <div class="d-titel"></div>
          <div class="d-datum"></div>
          <div class="d-inhoud"><div class="d-foto"></div><div class="d-tekst"></div></div>
        </div>

        <div class="merkje">${zn.offline}<span>Geen verbinding</span></div>
      </div>`}wire(){let e=this.$(".scherm");this.on(e,"pointerdown",()=>this.leeft_(),{capture:!0,passive:!0}),this.on(e,"scroll",l=>{let d=l.target;d?.classList?.contains("m-baan")&&(this.mededelingTeller_(d),Date.now()>this.mAuto_&&this.mededelingStart_())},{capture:!0,passive:!0}),this.on(e,"pointerdown",l=>{let d=l.target?.closest?.(".m-baan");d&&l.pointerType!=="touch"&&this.sleepMededeling_(l,d)}),this.on(e,"click",l=>{let d=l.target,c=d.closest(".m-stippen span");if(c)return this.mededelingNaar_(c.closest(".blok")?.querySelector(".m-baan"),[...c.parentElement.children].indexOf(c));let p=d.closest(".bk[data-pagina]");if(p)return this.gaNaar_(p.dataset.pagina);let h=d.closest(".ed-per button[data-per]");if(h)return this.dashNaar_({periode:h.dataset.per});let u=d.closest(".ed-stap button[data-stap]");if(u&&!u.disabled)return this.dashNaar_({stap:Number(u.dataset.stap)});if(d.closest(".terug"))return this.gaNaar_("welkom");if(d.closest(".detail .sluit"))return this.sluitBericht_();let m=d.closest(".persoon[data-id]");if(m)return this.tikPersoon_(m.dataset.id);let b=d.closest(".lamp[data-id]");if(b)return this.tikLamp_(b.dataset.id);let x=d.closest(".bericht[data-id]");if(x)return this.openBericht_(x.dataset.id)});let t=()=>{if(this.inDialoog_())return e.style.setProperty("--hoogte","600px");let d=Math.max(0,Math.round(this.getBoundingClientRect().top))+(this.inBewerkmodus_()?72:0),c=d?`calc(100dvh - ${d}px)`:"100dvh";e.style.getPropertyValue("--hoogte")!==c&&e.style.setProperty("--hoogte",c)},n=()=>{t();let l=e.getBoundingClientRect();if(!l.width)return;let d=Number(this.stand_?.scherm?.schaal)||1,c=Math.min(l.width/1194,l.height?l.height/834:9)*d;e.style.setProperty("--ss",Math.max(.35,c).toFixed(3)),requestAnimationFrame(()=>this.pasAlleBij_())};this.meet_=n;let i=new ResizeObserver(n);i.observe(e),this.teardown_.push(()=>i.disconnect()),this.on(window,"resize",t),n();let r=()=>{this.paintKlok_(),this.paintRaster_(),this.klokTimer_=setTimeout(r,6e4-Date.now()%6e4+20)};r(),this.teardown_.push(()=>clearTimeout(this.klokTimer_)),this.mededelingStart_(),this.teardown_.push(()=>clearInterval(this.mTimer_)),this.leeft_(),this.teardown_.push(()=>clearTimeout(this.terugTimer_));let o=setInterval(()=>this.haalAgenda_(),10*6e4);this.teardown_.push(()=>clearInterval(o));let s=setInterval(()=>this.laadEnergie_(!0),15*6e4);this.teardown_.push(()=>clearInterval(s)),this.teardown_.push(()=>this.herkansing_.stop()),this.teardown_.push(()=>this.dashHerkansing_.stop()),this.teardown_.push(()=>this.zegWeerOp_()),this.haal_(),this.luister_()}inBewerkmodus_(){let e=this.parentNode;for(;e;){if(e.tagName?.toLowerCase()==="hui-card-options")return!0;e=e.parentNode??e.host??null}return!1}inDialoog_(){let e=this;for(;e;){let n=e.getRootNode?.()?.host;if(!n)return!1;let i=n.tagName?.toLowerCase()??"";if(i==="hui-dialog-edit-card"||i==="hui-card-preview"||i.startsWith("hui-dialog"))return!0;e=n}return!1}async haal_(){if(this.hass?.connection)try{let e=await kn(this.hass);this.feeds_=e.feeds??[],this.fout_=null,this.herkansing_.herstel(),this.nieuweStand_(e.stand),this.dashProbeer_()}catch(e){if(re(e)){this.herkansing_.plan();return}this.fout_=e?.message??"Het infoscherm kon niet laden.",this.paint()}}nieuweStand_(e){this.stand_=e,this.meet_?.(),this.abonneerWeer_(),this.laadEnergie_(),this.haalAgenda_(),this.mededelingStart_(),this.paint()}async abonnement_(e){let t=!1;this.teardown_.push(()=>{t=!0});let n=await e();return t?n():this.teardown_.push(()=>{try{n()}catch{}}),n}async luister_(){if(this.hass?.connection?.subscribeMessage)try{await this.abonnement_(()=>ti(this.hass,e=>{e?.soort==="stand"?this.nieuweStand_(e.stand):e?.soort==="feeds"&&(this.feeds_=e.feeds??[],this.paint())}))}catch{}}set hass(e){let t=this.verbinding_.herverbonden(e);super.hass=e,t&&this.built_&&(this.haal_(),this.luister_()),this.paintMerkje_()}get hass(){return super.hass}zegWeerOp_(){for(let e of this.weerOpzeggen_)try{e()}catch{}this.weerOpzeggen_=[],this.weerEntiteit_=null}async abonneerWeer_(){let e=this.installatie_().weer;if(e!==this.weerEntiteit_&&(this.zegWeerOp_(),this.weerEntiteit_=e,this.uren_=[],this.dagen_=[],!(!e||!this.hass?.connection?.subscribeMessage)))for(let[t,n]of[["hourly","uren_"],["daily","dagen_"]])try{let i=await this.hass.connection.subscribeMessage(r=>{this.weerEntiteit_===e&&(this[n]=r?.forecast??[],this.paintRaster_(),this.paintPagina_("weer"))},{type:"weather/subscribe_forecast",forecast_type:t,entity_id:e});this.weerEntiteit_!==e?i():this.weerOpzeggen_.push(i)}catch{}}async haalAgenda_(){let e=this.installatie_().agendas;if(!e.length||!this.hass?.connection){this.afspraken_=[],this.agendaSleutel_="";return}this.agendaSleutel_=e.join(",");let t=new Date,n=new Date(t.getFullYear(),t.getMonth(),t.getDate()),i=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1);try{let o=(await this.hass.connection.sendMessagePromise({type:"call_service",domain:"calendar",service:"get_events",service_data:{entity_id:e,start_date_time:n.toISOString(),end_date_time:i.toISOString()},return_response:!0}))?.response??{},s=[];for(let[l,d]of Object.entries(o))for(let c of d?.events??[])s.push({kalender:l,...c});s.sort((l,d)=>String(l.start).localeCompare(String(d.start))),this.afspraken_=s}catch{this.afspraken_=[]}this.paintRaster_(),this.paintPagina_("agenda")}async laadEnergie_(e=!1){let t=this.installatie_().energie;if(t===this.energie_.entiteit&&this.energie_.geladen&&!e||(t!==this.energie_.entiteit&&(this.energie_={entiteit:t,punten:[],geladen:0}),!t||!this.hass?.connection?.sendMessagePromise))return;let n=new Date,i=new Date(ps(n.getTime()).van-36e5);try{let r=await this.hass.connection.sendMessagePromise({type:"history/history_during_period",start_time:i.toISOString(),end_time:n.toISOString(),entity_ids:[t],minimal_response:!0,no_attributes:!0,significant_changes_only:!1});if(this.energie_.entiteit!==t)return;this.energie_.punten=mh(r?.[t]),this.energie_.geladen=Date.now()}catch{this.energie_.geladen=Date.now()}this.energieLive_(),this.paintRaster_(),this.paintPagina_("energie")}async dashProbeer_(e=!1){if(!this.hass?.connection?.sendMessagePromise)return;let t=this.heeftDashboard_();try{await this.laadDashPrefs_(),this.heeftDashboard_()!==t&&this.paintRaster_(),(this.pagina_==="energie"||!this.installatie_().energie)&&(await this.laadDashStats_(e),this.paintRaster_()),this.dashHerkansing_.herstel()}catch(n){if(re(n)){this.dashHerkansing_.plan();return}this.dash_.fout="Het energiedashboard is niet te lezen.",this.paintPagina_("energie")}}heeftDashboard_(){return Gp(this.dash_.bronnen)}async laadDashPrefs_(){if(!(this.dash_.prefs||!this.hass?.connection?.sendMessagePromise))try{let e=await this.hass.connection.sendMessagePromise({type:"energy/get_prefs"});this.dash_.prefs=e??{},this.dash_.bronnen=Kp(e),this.dash_.prijzen=Zp(e)}catch(e){if(re(e))throw e;this.dash_.prefs={},this.dash_.bronnen=[],this.dash_.fout=e?.code==="not_found"?null:"Het energiedashboard is niet te lezen."}}async laadDashStats_(e=!1){if(await this.laadDashPrefs_(),!this.heeftDashboard_()||!this.hass?.connection?.sendMessagePromise)return;let t=this.dash_,n=Jo(t.bronnen),i=ii(t.periode,t.offset),r=`${t.periode}|${t.offset}|${n.join(",")}`;if(!(!e&&r===t.sleutel&&t.gehaald)&&!t.bezig){t.bezig=!0;try{let o=await this.hass.connection.sendMessagePromise({type:"recorder/statistics_during_period",start_time:i.van.toISOString(),end_time:i.tot.toISOString(),statistic_ids:n,period:i.periode,types:["change"]});if(`${this.dash_.periode}|${this.dash_.offset}|${Jo(this.dash_.bronnen).join(",")}`!==r)return;t.stats=o??{},t.sleutel=r,t.gehaald=Date.now(),t.fout=null}catch(o){if(re(o))throw o;t.fout="De geschiedenis is niet op te halen."}finally{t.bezig=!1}this.paintPagina_("energie")}}dashNaar_({periode:e,stap:t}){let n=this.dash_;e&&e!==n.periode&&(n.periode=e,n.offset=0),t&&(n.offset=Math.min(0,n.offset+t)),n.gehaald=0,this.paintPagina_("energie"),this.leeft_(),this.dashProbeer_(!0)}htmlDashboard_(){let e=this.dash_,t=ii(e.periode,e.offset),n=es(e.bronnen,e.stats),i=Up(e.bronnen,e.stats,t),r=Yp(e.bronnen,e.stats,e.prijzen),o=(b,x)=>`<button type="button" data-per="${b}" aria-pressed="${e.periode===b}">${x}</button>`,s=[];for(let b of["zon","accu_uit","verbruik","teruglevering","accu_in"])i.some(x=>(x.rollen[b]??0)>0)&&s.push(b);let l=s.filter(b=>Ne[b]?.teken===1),d=Math.max(.001,...i.map(b=>l.reduce((x,w)=>x+(b.rollen[w]??0),0))),c=i.length?`<div class="ed-staven">
          ${i.map(b=>{let x=l.map(y=>{let $=b.rollen[y]??0;return $<=0?"":`<i style="--rol:${Ne[y].tone};height:${($/d*100).toFixed(2)}%"></i>`}).reverse().join(""),w=l.filter(y=>(b.rollen[y]??0)>0).map(y=>`${Ne[y].naam}: ${ce(b.rollen[y])}`).join(" \xB7 ");return`<span class="ed-staaf" title="${_(w)}">${x}</span>`}).join("")}
        </div>
        <div class="ed-as">${i.map(b=>`<span>${_(qp(b.start,e.periode))}</span>`).join("")}</div>`:`<div class="ed-leeg">${_(e.fout??(e.bezig?"Bezig met ophalen\u2026":"Geen gegevens in deze periode."))}</div>`,p=(b,x,w,y)=>`<div class="ed-tegel" style="--rol:${Ne[w]?.tone??"var(--dac-ink-3)"}">
        <span class="ed-l">${_(b)}</span>
        <span class="ed-w">${_(x)}</span>
        ${y?`<span class="ed-b">${_(y)}</span>`:""}
      </div>`,h=[p("Van het net",ce(n.netIn),"verbruik",n.zelfvoorzienend!==null?`${100-n.zelfvoorzienend}% van het verbruik`:""),n.zon>0?p("Opgewekt",ce(n.zon),"zon",n.eigen>0?`${ce(n.eigen)} zelf gebruikt`:""):"",n.netUit>0?p("Teruggeleverd",ce(n.netUit),"teruglevering",""):"",n.accuUit>0||n.accuIn>0?p("Uit de accu",ce(n.accuUit),"accu_uit",`${ce(n.accuIn)} geladen`):"",n.gas>0?p("Gas",ce(n.gas,"m\xB3"),"gas",""):"",n.water>0?p("Water",ce(n.water,"m\xB3"),"water",""):"",r.bedrag>0?p("Kosten",Fp(r.bedrag),"apparaat",r.compleet?"bij de ingestelde prijs":"schatting, niet alles heeft een prijs"):""].filter(Boolean).join(""),u=e.bronnen.map(b=>{let x=e.stats?.[b.statistiek]??[],w=0;for(let y of x)w+=Number(y?.change)||0;return{...b,waarde:Math.max(0,Math.round(w*1e3)/1e3)}}).filter(b=>b.waarde>0).sort((b,x)=>x.waarde-b.waarde),m=b=>b==="gas"||b==="water"?"m\xB3":"kWh";return`<div class="ed">
      <div class="ed-balk">
        <div class="ed-per">
          ${o("dag","Dag")}${o("week","Week")}${o("maand","Maand")}${o("jaar","Jaar")}
        </div>
        <div class="ed-stap">
          <button type="button" data-stap="-1" aria-label="Vorige periode">${v("chevronLeft")}</button>
          <span class="ed-wanneer">${_(Pp(e.periode,e.offset))}</span>
          <button type="button" data-stap="1" aria-label="Volgende periode"${e.offset>=0?" disabled":""}>${v("chevronRight")}</button>
        </div>
      </div>

      <div class="ed-tegels">${h}</div>

      <div class="ed-vak">
        <div class="ed-kop">
          <span class="ed-titel">Verbruik per ${{dag:"uur",week:"dag",maand:"dag",jaar:"maand"}[e.periode]}</span>
          <span class="ed-legenda">
            ${s.map(b=>`<span><i style="--rol:${Ne[b].tone}"></i>${_(Ne[b].naam)}</span>`).join("")}
          </span>
        </div>
        ${c}
      </div>

      ${u.length?`<div class="ed-bronnen">
        ${u.map(b=>`<div class="ed-bron" style="--rol:${Ne[b.rol]?.tone??"var(--dac-ink-3)"}">
          <i></i><span class="ed-n">${_(b.naam)}</span>
          <span class="ed-v">${_(ce(b.waarde,m(b.rol)))}</span>
        </div>`).join("")}
      </div>`:""}

      <div class="ed-voet">Uit het energiedashboard van Home Assistant.</div>
    </div>`}htmlEnergieBlokDash_(){let e=this.dash_,n=e.periode==="dag"&&e.offset===0?es(e.bronnen,e.stats):null;if(!n||!e.gehaald&&!n.verbruikt)return'<div class="e-nu"><span class="e-waarde">--</span></div>';let i=(r,o,s)=>`<div class="ed-bron" style="--rol:${Ne[s].tone}"><i></i><span class="ed-n">${_(r)}</span><span class="ed-v">${_(o)}</span></div>`;return`<div class="e-nu"><span class="e-waarde">${_(ce(n.verbruikt))}</span></div>
      <div class="ed-bronnen">
        ${i("Van het net",ce(n.netIn),"verbruik")}
        ${n.zon>0?i("Opgewekt",ce(n.zon),"zon"):""}
        ${n.gas>0?i("Gas",ce(n.gas,"m\xB3"),"gas"):""}
      </div>`}energieLive_(){let e=this.energie_;if(!e.entiteit)return;let t=k(this.hass,e.entiteit),n=Number(t?.state);if(!t||!Number.isFinite(n))return;let i=Date.parse(t.last_updated)||Date.now(),r=e.punten[e.punten.length-1];if(r&&r.t>=i)return;e.punten.push({t:i,v:n});let o=Date.now()-(db+2)*36e5;(e.punten.length>2e3||e.punten[0]&&e.punten[0].t<o)&&(e.punten=e.punten.filter(s=>s.t>=o))}htmlEnergie_(e=!1,t=!1){let n=this.installatie_().energie;if(!n)return this.heeftDashboard_()?this.htmlEnergieBlokDash_():"";this.energieLive_();let i=J(this.hass,n),r=i.unit_of_measurement??"W",o=uh(i),s=Date.now(),l=ps(s),d=gh(this.energie_.punten,{nu:s,tellerstand:o,van:l.van,tot:l.tot}),c=fh(d),p=e?hs(d):kh(vh(d,48)),h=k(this.hass,n),u=!h||h.state==="unavailable"||h.state==="unknown",m=o?c.nu:Number(h?.state),b=q=>bh(q,r),x=d.punten[d.punten.length-1],w=x&&p.max>p.min?(1-(x.v-p.min)/(p.max-p.min))*100:null,y=x?(x.t-d.van)/(d.tot-d.van)*100:100,$=q=>{let ne=[];for(let se=0;se<q;se+=1)ne.push(De(new Date(d.van+(d.tot-d.van)*se/(q-1))));return ne[q-1]="24:00",ne},T=p.lijn?`<div class="e-grafiek">
          <svg viewBox="0 0 1000 400" preserveAspectRatio="none" aria-hidden="true">
            <line class="e-nul" x1="0" y1="400" x2="1000" y2="400"/>
            <path class="e-vlak" d="${p.vlak}"/>
            <path class="e-lijn" d="${p.lijn}"/>
          </svg>
          <span class="e-piek">${_(b(c.piek))}</span>
          ${w!==null?`<span class="e-stip" style="top:${w.toFixed(1)}%;left:${y.toFixed(2)}%"></span>`:""}
        </div>`:`<div class="e-grafiek"><div class="e-leeg">${u?"Sensor niet bereikbaar.":"Nog geen geschiedenis."}</div></div>`;if(e){let q=(ne,se)=>`<div class="e-tegel"><span class="e-l">${ne}</span><span class="e-w">${_(se)}</span></div>`;return`<div class="e-pagina">
        <div class="e-tegels">
          ${q(o?"Afgelopen uur":"Nu",u?"--":b(m))}
          ${q("Gemiddeld",b(c.gemiddeld))}
          ${q("Piek",b(c.piek))}
          ${o?q("Vandaag",b(c.totaal)):""}
        </div>
        <div class="e-vak">
          <div class="e-titel">${o?"Verbruik per uur, vandaag":"Vermogen vandaag"} \xB7 ${_(i.friendly_name??n)}</div>
          ${T}
          <div class="e-as">${$(5).map(ne=>`<span>${ne}</span>`).join("")}</div>
        </div>
      </div>`}return`<div class="e-nu"><span class="e-waarde">${u?"--":_(b(m))}</span></div>
      ${T}
      ${t?"":`<div class="e-as">${$(3).map(q=>`<span>${q}</span>`).join("")}</div>`}`}terugNa_(){let e=Number(this.stand_?.scherm?.terug_na);return Number.isFinite(e)?e:60}leeft_(){clearTimeout(this.terugTimer_);let e=this.terugNa_();e>0&&(this.terugTimer_=setTimeout(()=>{this.sluitBericht_(),this.gaNaar_("welkom")},e*1e3))}gaNaar_(e){let t=rs(this.standNu_(),this.feeds_,ot(new Date));this.pagina_=t.includes(e)?e:"welkom",this.paintPaginas_(),this.paintPagina_(this.pagina_),this.$(`.p-inhoud[data-p="${this.pagina_}"]`)?.scrollTo?.(0,0),this.pagina_==="energie"&&this.dashProbeer_(),this.pagina_==="welkom"&&this.pasAlleBij_()}mededelingStart_(){clearInterval(this.mTimer_);let e=Number(this.stand_?.scherm?.mededeling_interval),t=Number.isFinite(e)&&e>=3?e:10;this.mTimer_=setInterval(()=>this.mededelingVolgende_(),t*1e3)}mIndex_(e){return e.clientWidth?Math.round(e.scrollLeft/e.clientWidth):0}mededelingVolgende_(){let e=this.$(".raster .m-baan");if(!e||e.children.length<2)return;let t=e.children.length,n=(this.mIndex_(e)+1)%t;this.mAuto_=Date.now()+1200,e.scrollTo({left:n*e.clientWidth,behavior:"smooth"})}mededelingNaar_(e,t){if(!e||!e.clientWidth)return;let n=e.children.length,i=Math.max(0,Math.min(n-1,t));this.mAuto_=Date.now()+1200,e.scrollTo({left:i*e.clientWidth,behavior:"smooth"}),this.mededelingStart_()}sleepMededeling_(e,t){if(e.button!==0&&e.pointerType==="mouse")return;let n=e.clientX,i=t.scrollLeft,r=this.mIndex_(t),o=!1,s=d=>{let c=d.clientX-n;!o&&Math.abs(c)<4||(o||(o=!0,t.classList.add("sleept")),t.scrollLeft=i-c,d.preventDefault())},l=d=>{if(window.removeEventListener("pointermove",s,!0),window.removeEventListener("pointerup",l,!0),window.removeEventListener("pointercancel",l,!0),!o)return;let c=d.clientX-n,p=t.clientWidth||1,h=Math.abs(c)>p/5?r-Math.sign(c):r;t.classList.remove("sleept"),this.mededelingNaar_(t,h);let u=m=>{m.stopPropagation(),m.preventDefault()};t.addEventListener("click",u,{capture:!0,once:!0}),setTimeout(()=>t.removeEventListener("click",u,{capture:!0}),300)};window.addEventListener("pointermove",s,!0),window.addEventListener("pointerup",l,!0),window.addEventListener("pointercancel",l,!0),this.teardown_.push(()=>{window.removeEventListener("pointermove",s,!0),window.removeEventListener("pointerup",l,!0),window.removeEventListener("pointercancel",l,!0)})}mededelingTeller_(e){let t=e.closest(".blok"),n=e.children.length,i=Math.min(n-1,this.mIndex_(e)),r=t?.querySelector(".bk-sub");r&&this.text(r,n>1?`${i+1} van ${n}`:""),t?.querySelectorAll(".m-stippen span").forEach((o,s)=>o.classList.toggle("nu",s===i))}async tikPersoon_(e){let t=this.stand_?.personen?.find(i=>i.id===e);if(!t||!this.hass)return;let n=!t.aanwezig;t.aanwezig=n,this.paintRaster_(),this.paintPagina_("aanwezig");try{await zp(this.hass,e,n)}catch{t.aanwezig=!n,this.paintRaster_(),this.paintPagina_("aanwezig")}}tikLamp_(e){this.hass&&this.hass.callService("homeassistant","toggle",{entity_id:e})}openBericht_(e){let t=this.nieuws_().find(r=>r.id===e);if(!t)return;let n=this.$(".detail");this.text(".d-bron",t.bron??""),this.text(".d-titel",t.titel),this.text(".d-datum",ls(t.datum,new Date)),this.text(".d-tekst",t.tekst||"");let i=this.$(".d-foto");i.replaceChildren(),this.plaatje_(i,t),n.classList.add("open")}sluitBericht_(){this.$(".detail")?.classList.remove("open")}plaatje_(e,t){t.afbeelding&&/^https?:/.test(t.afbeelding)&&(e.innerHTML=`<img alt="" src="${_(t.afbeelding)}" loading="lazy">`)}nieuws_(){return ih(this.feeds_)}vul_(e,t,n=!0){if(!e)return!1;let i=e;return this.html_.get(i)===t?!1:(this.html_.set(i,t),e.innerHTML=t,n&&this.fotos_(e),!0)}fotos_(e){for(let n of e.querySelectorAll(".avatar[data-foto]:not([data-foto=''])"))xn(this.hass,n.dataset.foto).then(i=>{i&&n.isConnected&&(n.innerHTML=`<img alt="" src="${i}">`)});let t=this.nieuws_();for(let n of e.querySelectorAll(".bericht[data-id]")){let i=t.find(o=>o.id===n.dataset.id),r=n.querySelector(".foto");i&&r&&i.afbeelding&&this.plaatje_(r,i)}}paint(){this.$(".scherm")&&(this.paintUiterlijk_(),this.paintRaster_(),this.paintPaginas_(),this.paintPagina_(this.pagina_),this.paintMerkje_())}paintUiterlijk_(){let e=this.stand_?.scherm??{},t=this.$(".scherm");t.style.setProperty("--tone",e.accent||"var(--dac-accent-hi)"),t.classList.toggle("licht",e.uiterlijk==="licht"),t.classList.toggle("rond",(e.foto_vorm??"rond")==="rond"),t.classList.toggle("stil",e.weer_animatie===!1)}paintLogo_(e,t){!e||e.dataset.wens===t||(e.dataset.wens=t,e.classList.remove("beeld"),e.textContent="",t&&xn(this.hass,t).then(n=>{!n||e.dataset.wens!==t||(e.innerHTML=`<img alt="" src="${n}">`,e.classList.add("beeld"))}))}paintKlok_(){let e=new Date;for(let t of this.$$(".klok"))this.text(t,De(e));for(let t of this.$$(".datum"))this.text(t,th(e))}paintRaster_(){let e=this.$(".raster");if(!e||!this.stand_)return;let t=this.stand_.indeling?.blokken?.length?this.stand_.indeling:si(),n=ot(new Date),i=this.standNu_(),r=new Map;for(let o of t.blokken)st[o.soort]&&(di(o.soort,i,this.feeds_,n,{energieDashboard:this.heeftDashboard_()})||r.set(o.id,o));for(let o of[...e.children])r.has(o.dataset.id)||(this.html_.delete(o.querySelector(".bi")),o.remove());for(let o of r.values()){let s=e.querySelector(`.blok[data-id="${CSS.escape(o.id)}"]`);s||(s=document.createElement("div"),s.className=`blok ${o.soort}`,s.dataset.id=o.id,s.dataset.soort=o.soort,s.innerHTML=`${this.htmlKop_(o.soort)}<div class="bi"></div>`,e.appendChild(s));let l=`${o.y+1} / ${o.x+1} / span ${o.h} / span ${o.w}`;s.style.gridArea!==l&&(s.style.gridArea=l),s.classList.toggle("klein",o.h===1);let d=String(ch(o.soort,o.w,o.h));s.style.getPropertyValue("--b")!==d&&s.style.setProperty("--b",d),this.paintBlok_(s,o)}this.pasAlleBij_()}pasAlleBij_(){let e=this.$(".raster");if(!(!e||!e.getBoundingClientRect().height))for(let t of e.querySelectorAll(".blok"))this.pasBij_(t)}pasBij_(e){let t=e.querySelector(".bi");if(!t)return;e.style.removeProperty("--pas");let n=()=>t.getBoundingClientRect().bottom-parseFloat(getComputedStyle(t).paddingBottom),i=t.querySelector(".uren");if(i){i.hidden=!1;let p=t.getBoundingClientRect().top+parseFloat(getComputedStyle(t).paddingTop),h=i.getBoundingClientRect().bottom-p,u=n()-p;h>u+1&&u/h>=.72&&e.style.setProperty("--pas",(u/h).toFixed(3)),i.hidden=i.getBoundingClientRect().bottom>n()+1}let r=t.querySelector(".tegels, .n-lijst, .lampen, .afspraken, .ot, .vj-lijst");if(!r)return;let o=[...r.children];for(let p of o)p.hidden=!1;let s=0;if(r.matches(".ot")){let p=o[o.length-1],h=p?p.getBoundingClientRect().bottom-r.getBoundingClientRect().top:0,u=n()-r.getBoundingClientRect().top;h>u&&u/h>=.72&&e.style.setProperty("--pas",(u/h).toFixed(3));for(let m of o)m.getBoundingClientRect().bottom>n()+1&&(m.hidden=!0,s+=1)}else{r.style.gridTemplateRows="",r.style.flex="0 0 auto";let p=()=>{let u=getComputedStyle(r),m=parseFloat(u.rowGap)||0,b=u.gridTemplateColumns.split(" ").filter(Boolean).length||1,x=Math.max(0,...o.map(y=>y.getBoundingClientRect().height)),w=n()-r.getBoundingClientRect().top;return ph({beschikbaar:w,hoogte:x,gap:m,aantal:o.length,kolommen:b})};e.classList.remove("dicht");let h=p();if(!e.classList.contains("klein")&&r.matches(".tegels, .lampen")&&h.tonen<o.length){e.classList.add("dicht");let u=p();u.tonen>h.tonen?h=u:e.classList.remove("dicht")}r.style.flex="",h.pas<1&&e.style.setProperty("--pas",String(h.pas)),o.forEach((u,m)=>{u.hidden=m>=h.tonen}),s=o.length-h.tonen,h.rijen>0&&(r.style.gridTemplateRows=`repeat(${h.rijen}, minmax(0, 1fr))`)}let l=Number(e.dataset.meer??0)+s,d=e.querySelector(".bk-sub");if(!d)return;let c=d.dataset.basis??"";this.text(d,l>0?`${c?`${c} \xB7 `:""}nog ${l}`:c)}htmlKop_(e){let t=st[e];return e==="welkom"?"":t.pagina?`<button class="bk" type="button" data-pagina="${t.pagina}">
        <span class="bk-ico">${xh(t.icoon)}</span><span class="bk-titel">${t.naam}</span><span class="bk-sub"></span>
        <span class="bk-meer"><span class="txt">Alles bekijken</span>${v("chevronRight")}</span>
      </button>`:`<div class="bk"><span class="bk-ico">${xh(t.icoon)}</span><span class="bk-titel">${t.naam}</span><span class="bk-sub"></span></div>`}paintBlok_(e,t){let n=e.querySelector(".bi"),i=e.querySelector(".bk-sub"),r=(l,d="")=>{this.vul_(n,l),i&&(i.dataset.basis=d,this.text(i,d))},o=Number(t.aantal)||0,s=l=>l>=4?"kol-3":l>=2?"":"kol-1";switch(t.soort){case"welkom":{let l=this.stand_?.praktijk??{},d=this.stand_?.scherm??{},c=new Date,p="";if(d.welkom_onder!==!1&&is(l)){let x=jn(l,c);p=x.open?`Vandaag geopend tot ${x.tot}`:dh(l,c)}let h=d.welkom_tekst??"Welkom",u=d.logo_verbergen!==!0&&d.logo?`<div class="logo" data-logo="${_(d.logo)}"></div>`:"",m=`${h?`<div class="welkomtekst">${_(h)}</div>`:""}${p?`<div class="welkom-onder">${_(p)}</div>`:""}`;if(this.vul_(n,`${u}<div class="w-klok"><div class="klok">--:--</div><div class="datum"></div></div>${m?`<div class="w-tekstvak">${m}</div>`:""}`,!1)){let x=n.querySelector(".logo[data-logo]");x&&this.paintLogo_(x,x.dataset.logo)}this.paintKlok_();break}case"weer":{r(this.htmlWeerNu_()+(t.h>=2?this.htmlUren_(t.w>=3?6:4):""));break}case"energie":{r(this.htmlEnergie_(!1,t.h===1),"");break}case"mededeling":{let l=yn(this.stand_?.mededelingen,ot(new Date)),d=l.map(p=>`<div class="m-slide"><div class="m-tekst">${_(p.tekst)}</div></div>`).join(""),c=l.length>1?`<div class="m-stippen">${l.map((p,h)=>`<span class="${h===0?"nu":""}"></span>`).join("")}</div>`:"";if(this.vul_(n,`<div class="m-baan">${d}</div>${c}`,!1)){let p=n.querySelector(".m-baan");p&&(p.scrollLeft=0,this.mededelingTeller_(p)),this.mededelingStart_()}else if(i){let p=n.querySelector(".m-baan");p&&this.mededelingTeller_(p)}break}case"openingstijden":{let l=this.stand_?.praktijk??{},d=new Date,c=rh(l,d),p=jn(l,d),h=t.w>=3,u=h?[0,4,1,5,2,6,3].map(w=>c[w]):c,m=w=>h?w.replace(/ – /g,"\u2013").replace(/, /g," \xB7 "):w,b=`<div class="ot ${h?"twee":""} ${t.h<=2?"compact":""}">${u.map(w=>`<div class="${w.vandaag?"vandaag":""} ${w.tekst==="gesloten"?"dicht":""}"><span>${_(h?w.naam.slice(0,2):w.naam)}${w.reden?` \xB7 ${_(w.reden)}`:""}</span><span class="num">${_(m(w.tekst))}</span></div>`).join("")}</div>`,x=p.open?`Nu geopend, tot ${p.tot}`:p.straks?`Nu gesloten, om ${p.straks} weer open`:"Vandaag gesloten";r(b,x);break}case"verjaardagen":{let l=ns(this.stand_?.verjaardagen,new Date),d=o>0?l.slice(0,o):l;e.dataset.meer=String(l.length-d.length);let c=l.filter(p=>p.dagen===0).length;r(d.length?`<div class="vj-lijst">${d.map(p=>this.htmlVerjaardag_(p)).join("")}</div>`:'<div class="leeg">Geen verjaardagen.</div>',c?`${c} vandaag jarig`:"");break}case"aanwezig":{let l=this.stand_?.personen??[],d=lh(l),c=o>0?d.slice(0,o):d,p=d.length-c.length,h=`<div class="tegels ${s(t.w)}">${c.map(m=>this.htmlPersoon_(m)).join("")}</div>`,u=this.stand_?.scherm?.aanwezig_teller!==!1?`${l.filter(m=>m.aanwezig).length} van ${l.length}`:"";e.dataset.meer=String(p),r(h,u);break}case"nieuws":{let l=this.nieuws_(),d=o>0?l.slice(0,o):l,c=d.length?`<div class="n-lijst">${d.map(p=>this.htmlBericht_(p)).join("")}</div>`:'<div class="leeg">Er is op dit moment geen nieuws.</div>';e.dataset.meer=String(l.length-d.length),r(c,"");break}case"verlichting":{let l=this.installatie_().verlichting,d=o>0?l.slice(0,o):l;e.dataset.meer=String(l.length-d.length),r(`<div class="lampen ${s(t.w)}">${d.map(c=>this.htmlLamp_(c)).join("")}</div>`,"");break}case"agenda":{let l=this.afspraken_,d=o>0?l.slice(0,o):l;e.dataset.meer=String(l.length-d.length),r(d.length?`<div class="afspraken">${d.map(c=>this.htmlAfspraak_(c)).join("")}</div>`:'<div class="leeg">Geen afspraken vandaag.</div>',l.length?`${l.length} vandaag`:"");break}case"afval":{let l=this.afvalLijst_(),d=Xo(l);if(!d.length){r('<div class="leeg">Geen ophaaldata gevonden.</div>',"");break}let c=hn(d,h=>h.dagen),p=d.filter(h=>!c.includes(h));r(`<div class="af">
            ${this.htmlAfvalEerst_(c)}
            ${p.length?`<div class="af-lijst">${p.map(h=>this.htmlAfvalRij_(h)).join("")}</div>`:""}
          </div>`,"");break}default:r("")}}afvalLijst_(){let e=this.installatie_().afval??[];return e.length?Vp(e,t=>k(this.hass,t),t=>J(this.hass,t).friendly_name??t):[]}afvalKleur_(e){let t=String(e??"").toLowerCase();return/gft|groen|tuin|organisch/.test(t)?"#3e8a3e":/pmd|plastic|verpakking|blik|drank/.test(t)?"#d99a1e":/papier|karton|oud ?papier/.test(t)?"#2f6fc4":/textiel|kleding/.test(t)?"#9b59b6":/kerst|boom/.test(t)?"#2e7d4f":/glas/.test(t)?"#2aa198":"#7b7b74"}htmlAfvalEerst_(e){let t=e?.[0];if(!t)return"";let n=t.dagen??0,i=n===0?"vandaag":n===1?"morgen":String(n),r=n>1?"dagen":"",o=n<=1&&t.datum?Zn(t.datum):Qo(t),s=e.length>1?"var(--dac-ink-3)":this.afvalKleur_(t.naam),l=e.map(d=>`<span class="af-ico" style="--bak:${this.afvalKleur_(d.naam)}">${v("bin")}</span>`).join("");return`<div class="af-eerst" style="--bak:${s}">
      <span class="af-icos">${l}</span>
      <span class="af-t">
        <span class="af-n">${_(nt(e.map(d=>d.naam)))}</span>
        <span class="af-w">${_(o)}</span>
      </span>
      <span class="af-d">${_(i)}${r?` <span class="af-w">${r}</span>`:""}</span>
    </div>`}htmlAfvalRij_(e,t=!1){return`<div class="af-rij" data-stil="${(e.dagen??0)>21}" style="--bak:${this.afvalKleur_(e.naam)}">
      <i></i>
      <span class="af-n">${_(e.naam)}</span>
      <span class="af-w">${_(Qo(e))}${t&&e.dagen>1?` \xB7 over ${e.dagen} dagen`:""}</span>
    </div>`}nacht_(){return k(this.hass,"sun.sun")?.state==="below_horizon"}htmlVerjaardag_(e){let t=e.dagen===0?e.leeftijd?`Vandaag jarig \xB7 wordt ${e.leeftijd}`:"Vandaag jarig":e.leeftijd?`wordt ${e.leeftijd}`:"";return`<div class="vj ${e.dagen===0?"vandaag":""}">
      <div class="vj-ico">${zn.cake}</div>
      <div class="vj-tekst"><div class="vj-naam">${_(e.naam)}</div>${t?`<div class="vj-sub">${_(t)}</div>`:""}</div>
      <div class="vj-wanneer">${_(e.wanneer)}</div>
    </div>`}htmlWeerNu_(){let e=this.installatie_().weer,t=k(this.hass,e),n=J(this.hass,e),i=n.temperature,r=[];return t&&r.push(Hp[t.state]??te(this.hass,t)),typeof n.humidity=="number"&&r.push(`${Math.round(n.humidity)}% vochtig`),typeof n.wind_speed=="number"&&r.push(`wind ${G(this.hass,n.wind_speed,0)} ${n.wind_speed_unit??"km/h"}`),`<div class="w-nu"><div class="w-icoon">${ni(t?.state,this.nacht_())}</div><div><div class="temp">${typeof i=="number"?`${G(this.hass,i,0)}\xB0`:"--\xB0"}</div><div class="w-tekst">${_(r.join(" \xB7 "))}</div></div></div>`}htmlUren_(e){let t=Date.now(),n=this.uren_.filter(i=>new Date(i.datetime).getTime()>t-30*6e4).slice(0,e);return n.length?`<div class="uren" style="grid-template-columns: repeat(${n.length}, minmax(0, 1fr))">${n.map(i=>{let r=new Date(i.datetime);return`<div class="uur"><span class="u">${De(r)}</span>${ni(i.condition,r.getHours()<7||r.getHours()>=21)}<span class="t">${typeof i.temperature=="number"?`${Math.round(i.temperature)}\xB0`:"--"}</span></div>`}).join("")}</div>`:""}htmlDagen_(){let e=new Date,t=this.dagen_.slice(0,7);return t.length?`<div class="dagen">${t.map(n=>{let i=new Date(n.datetime);return`<div class="dag"><span class="u">${_(nh(i,e))}</span>${ni(n.condition)}<span class="t">${typeof n.temperature=="number"?`${Math.round(n.temperature)}\xB0`:"--"}</span>${typeof n.templow=="number"?`<span class="t2">${Math.round(n.templow)}\xB0</span>`:""}</div>`}).join("")}</div>`:""}htmlPersoon_(e){return`<div class="persoon ${e.aanwezig?"aan":""}" role="button" tabindex="0" data-id="${_(e.id)}">
      <div class="avatar" data-foto="${_(e.foto??"")}">${_(e.initialen||"?")}</div>
      <div class="p-tekst">
        <div class="p-naam">${_(e.naam)}</div>
        ${e.functie?`<div class="p-functie">${_(e.functie)}</div>`:""}
        <div class="p-status">${e.aanwezig?"Aanwezig":"Afwezig"}</div>
      </div>
    </div>`}htmlBericht_(e,t=!1){let n=e.bron??"";return`<div class="bericht" role="button" tabindex="0" data-id="${_(e.id)}">
      <div class="foto"></div>
      <div class="b-tekst">
        <div class="b-bron">${_(n)}${e.datum?` \xB7 ${_(ls(e.datum,new Date))}`:""}</div>
        <div class="b-titel">${_(e.titel)}</div>
        ${t&&e.tekst?`<div class="b-samenvatting">${_(e.tekst)}</div>`:""}
      </div>
    </div>`}htmlLamp_(e){let t=e.entity,n=k(this.hass,t),i=n?.attributes??{},r=Z(n),o=!n||n.state==="unavailable",s=i.rgb_color,l=r&&Array.isArray(s)&&!(s[0]>240&&s[1]>240&&s[2]>240)?`rgb(${s.join(",")})`:"",d=o?"Niet bereikbaar":r?typeof i.brightness=="number"?`Aan \xB7 ${Math.round(i.brightness/255*100)}%`:"Aan":"Uit",c=e.naam||i.friendly_name||t;return`<div class="lamp ${r?"aan":""} ${o?"dood":""}" role="button" tabindex="0" data-id="${_(t)}" style="${l?`--lampkleur:${l}`:""}">
      <div class="chip">${v("bulb")}</div>
      <div class="l-tekst"><div class="l-naam">${_(c)}</div><div class="l-status">${d}</div></div>
    </div>`}htmlAfspraak_(e){let n=!String(e.start).includes("T")?"hele dag":`${De(new Date(e.start))}${e.end?` \u2013 ${De(new Date(e.end))}`:""}`,i=J(this.hass,e.kalender).friendly_name??e.kalender,r=this.installatie_().agendas.length>1;return`<div class="afspraak"><span class="a-tijd">${_(n)}</span><span class="a-tekst">${_(e.summary??"")}</span>${r?`<span class="a-kalender">${_(i)}</span>`:""}</div>`}paintPaginas_(){rs(this.standNu_(),this.feeds_,ot(new Date)).includes(this.pagina_)||(this.pagina_="welkom");for(let t of this.$$(".pagina"))t.classList.toggle("actief",t.dataset.p===this.pagina_)}paintPagina_(e){if(e!==this.pagina_||e==="welkom")return;let t=this.$(`.p-inhoud[data-p="${e}"]`);if(!t)return;let n=this.stand_?.scherm??{};switch(e){case"aanwezig":{let i=this.stand_?.personen??[],r=d=>`<div class="tegels">${d.map(c=>this.htmlPersoon_(c)).join("")}</div>`,o=n.aanwezig_weergave??"gescheiden",s;if(o==="functie"){let d=sh(i);s=`<div class="kolommen ${d.length>=3?"drie":"twee"}">${d.map(c=>`<div class="kolom"><div class="eyebrow">${_(c.functie||"Overig")} \xB7 ${c.personen.length}</div>${r(c.personen)}</div>`).join("")}</div>`}else if(o==="lijst")s=`<div class="tegels kol-3">${i.map(d=>this.htmlPersoon_(d)).join("")}</div>`;else{let{aanwezig:d,afwezig:c}=ss(i);s=`<div class="kolommen twee">
            <div class="kolom"><div class="eyebrow">Aanwezig \xB7 ${d.length}</div>${d.length?r(d):'<div class="leeg">Niemand aangemeld.</div>'}</div>
            <div class="kolom"><div class="eyebrow">Afwezig \xB7 ${c.length}</div>${c.length?r(c):'<div class="leeg">Iedereen is er.</div>'}</div>
          </div>`}this.vul_(t,s);let l=i.filter(d=>d.aanwezig).length;this.text(".pagina[data-p='aanwezig'] .pk-titel",n.aanwezig_teller!==!1&&i.length?`${l} van ${i.length} aanwezig`:"Aanwezig");break}case"nieuws":{let i=this.nieuws_();this.vul_(t,i.length?`<div class="nieuws-raster">${i.map(r=>this.htmlBericht_(r,!0)).join("")}</div>`:'<div class="leeg">Er is op dit moment geen nieuws.</div>');break}case"weer":{this.vul_(t,`<div class="weerpagina">${this.htmlWeerNu_()}${this.htmlUren_(8)}${this.htmlDagen_()}</div>`,!1);break}case"energie":{this.vul_(t,this.heeftDashboard_()?this.htmlDashboard_():this.htmlEnergie_(!0),!1);break}case"verlichting":{let i=this.installatie_().verlichting;this.vul_(t,`<div class="lampen kol-3">${i.map(r=>this.htmlLamp_(r)).join("")}</div>`,!1);break}case"verjaardagen":{let i=ns(this.stand_?.verjaardagen,new Date);this.vul_(t,i.length?`<div class="vj-raster">${i.map(r=>this.htmlVerjaardag_(r)).join("")}</div>`:'<div class="leeg">Geen verjaardagen.</div>',!1);break}case"mededelingen":{let i=ot(new Date),r=yn(this.stand_?.mededelingen,i),o=ah(this.stand_?.mededelingen,i),s=l=>`<div class="m-item">${ts(l)?`<div class="m-p">${_(ts(l))}</div>`:""}<div class="m-t">${_(l.tekst)}</div></div>`;this.vul_(t,`<div class="m-pagina">
            <div class="m-lijst">${r.length?r.map(s).join(""):'<div class="leeg">Geen mededelingen.</div>'}</div>
            ${o.length?`<div class="eyebrow m-kop">Binnenkort</div><div class="m-lijst">${o.map(s).join("")}</div>`:""}
          </div>`,!1);break}case"agenda":{let i=this.afspraken_;this.vul_(t,i.length?`<div class="afspraken">${i.map(r=>this.htmlAfspraak_(r)).join("")}</div>`:'<div class="leeg">Geen afspraken vandaag.</div>',!1);break}case"afval":{let i=this.afvalLijst_(),r=Xo(i),o=i.filter(c=>c.reden),s=hn(r,c=>c.dagen),l=r.filter(c=>!s.includes(c)),d=r.length?`<div class="af-pagina">
              ${this.htmlAfvalEerst_(s)}
              ${l.length?`<div class="af-lijst">${l.map(c=>this.htmlAfvalRij_(c,!0)).join("")}</div>`:""}
              ${o.length?`<div class="af-uitleg">${o.map(c=>`${_(c.naam)}: ${_(c.reden)}`).join(" \xB7 ")}</div>`:""}
            </div>`:'<div class="leeg">Geen ophaaldata gevonden. Controleer of de gekozen sensoren een datum als toestand hebben.</div>';this.vul_(t,d,!1);break}default:}}paintMerkje_(){let e=this.$(".merkje");if(!e)return;let t=this.hass?.connected===!1;e.classList.toggle("open",t||!!this.fout_),this.text(".merkje span",t?"Geen verbinding":this.fout_??"")}};j(Wt,"css",cb),j(Wt,"volgtThema",!1);D(lb,Wt,{name:"DomotiApp Infoscherm",description:"Beeldvullend scherm voor een wachtkamer: logo, klok, weer, energie, wie er is, mededelingen, nieuws, verjaardagen en verlichting. Toevoegen en klaar; alles komt uit DomotiApp Infoscherm Beheer.",preview:!1});Wt.getStubConfig=()=>({});var fs="domotiapp-infoscherm-beheer-card",pb=["personen","mededelingen","verjaardagen","praktijk","scherm","installatie","indeling","instellingen"],us=a=>`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${a}</svg>`,_h={layout:us('<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="2"/><path d="M3.4 9.6h17.2M9.6 9.6v11"/>'),cake:us('<path d="M4.4 19.4h15.2v-6.2a2 2 0 0 0-2-2H6.4a2 2 0 0 0-2 2z"/><path d="M4.4 15.6c1.3 0 1.3 1.2 2.5 1.2s1.3-1.2 2.5-1.2 1.3 1.2 2.6 1.2 1.3-1.2 2.5-1.2 1.3 1.2 2.5 1.2 1.3-1.2 2.6-1.2"/><path d="M12 11.2V8.4M9 11.2V8.8M15 11.2V8.8"/><path d="M12 8.4a1.3 1.3 0 0 0 1-2.2L12 4.6l-1 1.6a1.3 1.3 0 0 0 1 2.2z"/>'),grip:us('<circle cx="9" cy="6" r="1.2" fill="currentColor"/><circle cx="15" cy="6" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="18" r="1.2" fill="currentColor"/><circle cx="15" cy="18" r="1.2" fill="currentColor"/>')},hb=a=>_h[a]??v(a),Ge=[{key:"personen",titel:"Medewerkers",icoon:"people",secties:["personen"]},{key:"mededelingen",titel:"Mededelingen",icoon:"bell",secties:["mededelingen","scherm"]},{key:"verjaardagen",titel:"Verjaardagen",icoon:"cake",secties:["verjaardagen"]},{key:"praktijk",titel:"Openingstijden",icoon:"clock",secties:["praktijk"]},{key:"indeling",titel:"Indeling van het scherm",icoon:"layout",secties:["indeling"]},{key:"verlichting",titel:"Verlichting",icoon:"bulb",secties:["installatie","instellingen"]},{key:"instellingen",titel:"Instellingen en logo",icoon:"cog",secties:["scherm","instellingen"]}],yh=["weather","energy","lights","calendars","waste","kiosk_users"],hi=a=>Array.isArray(a)?a.filter(e=>typeof e=="string"&&e):typeof a=="string"&&a?[a]:[],jh={title:"Infoscherm",weather:"",energy:"",lights:[],calendars:[],waste:[],kiosk_users:[],show_personen:!0,show_mededelingen:!0,show_verjaardagen:!0,show_praktijk:!0,show_indeling:!0,show_verlichting:!0,show_instellingen:!0,open:"personen"},ub=`
  /* Een containerquery en geen mediaquery: de kaart staat in een kolom van
     een sections-view, en die is smal terwijl het venster breed is. */
  :host { container-type: inline-size; }
  .card { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 14px; }
  .icon { width: 1em; height: 1em; display: block; }
  [hidden] { display: none !important; }

  .kop { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .kop h2 { margin: 0; font-size: 17px; font-weight: 600; }
  .kop .eyebrow { margin-bottom: 2px; }
  .status { font-size: 12px; color: var(--dac-ink-3); display: flex; align-items: center; gap: 6px; text-align: right; }
  .status.bezig { color: var(--dac-ink-2); }
  .status.fout { color: var(--dac-bad); }
  .status.ok { color: var(--dac-good); }

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
  .blok > .bk .bfout { font-size: 11px; font-weight: 600; color: var(--dac-bad); }
  .blok > .inhoud { display: none; padding: 14px; flex-direction: column; gap: 12px; }
  .blok.open > .inhoud { display: flex; }

  /* velden */
  .rij { display: grid; gap: 10px; align-items: center; }
  .veld { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .veld label { font-size: 12px; color: var(--dac-ink-2); }
  input[type="text"], input[type="url"], input[type="date"], input[type="datetime-local"], input[type="time"], input[type="number"], input[type="color"], textarea, select {
    font: inherit; font-size: 14px; color: var(--dac-ink); background: var(--dac-surface);
    border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-sm); padding: 8px 10px;
    min-height: 40px; width: 100%; min-width: 0; color-scheme: var(--dac-scheme);
  }
  input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  textarea { min-height: 72px; resize: vertical; line-height: 1.4; }
  /* De keuzelijst van de browser tekent zijn eigen menu, en dat menu nam de
     doorschijnende achtergrond van het veld over: op een lichte pagina werd
     het licht, en de opties stonden er grijs in. Gemeld op 10 september
     2026: "bij de beheerderskaart zie ik nog steeds een licht theme." Een
     dichte achtergrond en de inkt van de kaart, ook op elke optie. */
  select { background-color: var(--dac-bg-raise); }
  select option { background-color: var(--dac-bg-raise); color: var(--dac-ink); }
  /* Een keuze uit twee of drie: geen keuzelijst maar knoppen naast elkaar,
     in de vormtaal van de kaart. Dan is er ook geen browsermenu meer dat
     zijn eigen kleuren kiest. */
  .segment { display: flex; flex-wrap: wrap; gap: 4px; padding: 3px; border-radius: var(--dac-radius-sm); background: var(--dac-surface); border: 1px solid var(--dac-border-hi); min-height: 40px; box-sizing: border-box; }
  .segment button {
    flex: 1 1 auto; min-width: 0; padding: 6px 10px; border-radius: 9px; border: 1px solid transparent; cursor: pointer;
    font: inherit; font-size: 13px; font-weight: 600; color: var(--dac-ink-2); background: none; white-space: nowrap;
  }
  .segment button.aan { color: var(--dac-accent-hi); background: var(--dac-accent-soft); border-color: color-mix(in srgb, var(--dac-accent-hi) 40%, transparent); }
  .segment button:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 1px; }
  input[type="color"] { padding: 2px 4px; width: 56px; }
  input[type="number"] { max-width: 120px; }
  input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--dac-accent-hi); margin: 0; }
  .vink { display: flex; align-items: center; gap: 8px; font-size: 13px; min-height: 40px; cursor: pointer; }
  .vink .id { font-size: 11px; color: var(--dac-ink-3); margin-left: 4px; }

  /* de schakelaar voor aan/uit-dingen */
  .schakel { position: relative; width: 44px; height: 24px; flex: 0 0 auto; }
  .schakel input { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; margin: 0; cursor: pointer; }
  .schakel span { position: absolute; inset: 0; border-radius: 999px; background: var(--dac-border-hi); transition: background 120ms; }
  .schakel span::after { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: var(--dac-knob); box-shadow: var(--dac-knob-schaduw); transition: transform 120ms; }
  .schakel input:checked + span { background: var(--dac-accent-hi); }
  .schakel input:checked + span::after { transform: translateX(20px); }

  .knop {
    display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; cursor: pointer;
    font: inherit; font-size: 13px; font-weight: 600; color: var(--dac-ink-2);
    background: var(--dac-surface); border: 1px solid var(--dac-border-hi); border-radius: var(--dac-radius-pill);
  }
  .knop .icon { font-size: 16px; }
  .knop.klein { height: 32px; padding: 0 10px; font-size: 12px; }
  .knop.ico { width: 32px; height: 32px; padding: 0; justify-content: center; border-radius: var(--dac-radius-sm); }
  .knop.gevaar { color: var(--dac-bad); }
  .knop:disabled { opacity: 0.5; cursor: default; }
  .voet { display: flex; justify-content: flex-start; align-items: center; gap: 10px; flex-wrap: wrap; }
  .melding { font-size: 12px; color: var(--dac-ink-3); }
  .melding.fout { color: var(--dac-bad); }

  /* lijsten */
  .lijst { display: flex; flex-direction: column; gap: 8px; }
  .item { display: grid; gap: 10px; align-items: center; padding: 10px 12px; border-radius: var(--dac-radius-sm); background: var(--dac-surface); }
  .item.persoon { grid-template-columns: 28px 44px minmax(0, 1.4fr) minmax(0, 1fr) auto auto; }
  .item.mededeling { grid-template-columns: minmax(0, 2fr) 190px 190px auto; align-items: start; }
  .item.mededeling textarea { min-height: 40px; }
  .item.verjaardag { grid-template-columns: minmax(0, 2fr) 170px auto auto; }
  .item.feed { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto; }
  .item.uitz { grid-template-columns: 150px auto 110px 110px minmax(0, 1fr) auto; }
  .item.lamp { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .item.lamp .ent { font-size: 13px; color: var(--dac-ink-2); display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .item.lamp .ent b { color: var(--dac-ink); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item.lamp .ent span { font-size: 11px; color: var(--dac-ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .knoppen { display: flex; gap: 6px; align-items: center; justify-content: flex-end; }
  /* De greep om een rij te verslepen: echte pointer-events, geen pijltjes.
     Gevraagd op 10 september 2026: "drag en drop ipv pijltjes". */
  .greep { width: 28px; height: 44px; display: grid; place-items: center; color: var(--dac-ink-3); cursor: grab; touch-action: none; border-radius: 6px; }
  .greep .icon { font-size: 20px; }
  .item.sleept { opacity: 0.9; border: 1px solid var(--dac-accent-hi); box-shadow: 0 8px 24px rgba(0,0,0,calc(.35 * var(--dac-diepte))); cursor: grabbing; position: relative; z-index: 2; }
  .item.sleept .greep { cursor: grabbing; }
  .avatar { width: 44px; height: 44px; border-radius: 50%; overflow: hidden; display: grid; place-items: center; font-size: 14px; font-weight: 700; color: var(--dac-ink-3); background: var(--dac-surface-hi); border: 1px solid var(--dac-border); cursor: pointer; }
  .avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .avatar.aan { color: var(--dac-accent-hi); background: var(--dac-accent-soft); border-color: color-mix(in srgb, var(--dac-accent-hi) 40%, transparent); }
  .leeg { font-size: 13px; color: var(--dac-ink-3); padding: 6px 2px; }

  .b-onder { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .plaatje { width: 96px; height: 64px; border-radius: var(--dac-radius-sm); overflow: hidden; background: var(--dac-surface-hi); display: grid; place-items: center; color: var(--dac-ink-3); font-size: 20px; }
  .plaatje img { width: 100%; height: 100%; object-fit: cover; display: block; }
  /* Het logo volgt zijn eigen verhouding, net als op het scherm. */
  .plaatje.logo { width: auto; min-width: 64px; max-width: 220px; height: 64px; padding: 4px; }
  .plaatje.logo img { width: auto; height: 100%; max-width: 100%; object-fit: contain; }

  .ot-tabel { display: grid; grid-template-columns: 90px auto 100px 100px 100px 100px; gap: 6px 10px; align-items: center; font-size: 13px; }
  .ot-tabel .k { font-size: 11px; color: var(--dac-ink-3); font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .ot-tabel input[type="time"] { min-height: 34px; padding: 4px 6px; font-size: 13px; }
  .ot-tabel .dag { color: var(--dac-ink-2); }
  .ot-tabel input:disabled { opacity: 0.35; }

  .twee { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .drie { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .hulp { font-size: 12px; color: var(--dac-ink-3); line-height: 1.4; }
  .feedfout { font-size: 12px; color: var(--dac-bad); }
  .sub { font-size: 13px; font-weight: 600; margin-top: 4px; }

  /* ------------------------------------------------------------ de indeling */
  .raster {
    position: relative; width: 100%; aspect-ratio: 1194 / 660; border-radius: var(--dac-radius-sm);
    background-color: var(--dac-surface);
    background-image:
      linear-gradient(to right, var(--dac-border) 1px, transparent 1px),
      linear-gradient(to bottom, var(--dac-border) 1px, transparent 1px);
    background-size: calc(100% / ${Le}) calc(100% / ${Te});
    border: 1px solid var(--dac-border-hi); overflow: hidden; touch-action: none; user-select: none; -webkit-user-select: none;
  }
  .ib { position: absolute; padding: 3px; box-sizing: border-box; cursor: grab; touch-action: none; }
  .ib.sleept { cursor: grabbing; z-index: 2; }
  .ib-in {
    position: relative; width: 100%; height: 100%; box-sizing: border-box; overflow: hidden;
    border-radius: 8px; background: var(--dac-accent-soft); border: 1px solid color-mix(in srgb, var(--dac-accent-hi) 50%, transparent);
    display: flex; flex-direction: column; gap: 2px; padding: 6px 8px; font-size: 12px;
  }
  .ib.sleept .ib-in { box-shadow: 0 8px 24px rgba(0,0,0,calc(.35 * var(--dac-diepte))); }
  .ib.ongeldig .ib-in { background: color-mix(in srgb, var(--dac-bad) 18%, transparent); border-color: var(--dac-bad); }
  .ib.ontbreekt .ib-in { border-style: dashed; background: var(--dac-surface-hi); }
  .ib-kop { display: flex; align-items: center; gap: 6px; font-weight: 600; min-width: 0; }
  .ib-kop .icon { font-size: 14px; color: var(--dac-accent-hi); flex: 0 0 auto; }
  .ib.ontbreekt .ib-kop .icon { color: var(--dac-ink-3); }
  .ib-kop span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ib-nb { font-size: 11px; color: var(--dac-ink-3); line-height: 1.3; }
  .ib-weg { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border-radius: 6px; border: none; background: var(--dac-surface-hi); color: var(--dac-ink-2); cursor: pointer; display: grid; place-items: center; font: inherit; }
  .ib-weg .icon { font-size: 14px; }
  .ib-aantal { margin-top: auto; display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--dac-ink-2); }
  .ib-aantal button { width: 22px; height: 22px; border-radius: 6px; border: 1px solid var(--dac-border-hi); background: var(--dac-surface); color: var(--dac-ink); cursor: pointer; font: inherit; font-size: 14px; line-height: 1; display: grid; place-items: center; }
  .ib-aantal b { min-width: 28px; text-align: center; }
  .ib-greep { position: absolute; right: 2px; bottom: 2px; width: 16px; height: 16px; cursor: nwse-resize; border-right: 3px solid var(--dac-accent-hi); border-bottom: 3px solid var(--dac-accent-hi); border-radius: 0 0 4px 0; opacity: .8; }
  .ib.ontbreekt .ib-greep { border-color: var(--dac-ink-3); }

  .geen { padding: 24px; text-align: center; color: var(--dac-ink-3); font-size: 14px; }
  .file { display: none; }

  @container (max-width: 720px) {
    .item.persoon { grid-template-columns: 28px 44px minmax(0, 1fr) auto; }
    .item.persoon .veld:nth-child(4) { grid-column: 3 / -1; }
    .item.mededeling, .item.verjaardag, .item.uitz, .item.lamp { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .item.feed { grid-template-columns: minmax(0, 1fr); }
    .ot-tabel { grid-template-columns: 70px auto 1fr 1fr; }
    .ot-tabel .vak2 { display: none; }
    .twee, .drie { grid-template-columns: minmax(0, 1fr); }
    .ib-aantal, .ib-nb { display: none; }
  }
`,wh=a=>JSON.parse(JSON.stringify(a??null)),P=a=>_(a??""),ui=(a,e,t)=>Math.min(t,Math.max(e,a)),mb=700,ms=150,Ut=class extends S{constructor(){super(),this.stand_=null,this.rechten_={},this.feedFouten_={},this.werk_={},this.vuil_=new Set,this.bezig_=new Set,this.versie_={},this.timers_={},this.fouten_={},this.uitgesteld_=new Set,this.open_=null,this.meldingen_={},this.herkansing_=new le(()=>this.haal_()),this.verbinding_=new ke,this.fout_=null,this.laatstOpgeslagen_=""}validate(e){return this.installatieInConfig_=yh.some(t=>e[t]!==void 0),{...jh,...e,weather:typeof e.weather=="string"?e.weather:"",energy:typeof e.energy=="string"?e.energy:"",lights:hi(e.lights),calendars:hi(e.calendars),waste:hi(e.waste),kiosk_users:hi(e.kiosk_users)}}watched(){return[]}async sync_(){if(!this.hass?.connection||!this.stand_||!this.hass.user?.is_admin||!this.installatieInConfig_)return;let e=this.config,t={weer:e.weather||null,energie:e.energy||null,agendas:e.calendars,afval:e.waste,verlichting:e.lights,kiosk_gebruikers:e.kiosk_users},n=JSON.stringify(t),i=this.stand_.installatie??{},r=JSON.stringify({weer:i.weer??null,energie:i.energie??null,agendas:i.agendas??[],afval:i.afval??[],verlichting:(i.verlichting??[]).map(o=>o.entity),kiosk_gebruikers:this.stand_.instellingen?.kiosk_gebruikers??[]});if(!(n===r||n===this.laatstGesynct_)){this.laatstGesynct_=n;try{await Ep(this.hass,t)}catch{this.laatstGesynct_=""}}}getCardSize(){return 6}getGridOptions(){return{columns:"full",rows:"auto",min_rows:this.minRijen_(".card",6)}}blokken_(){return Ge.filter(e=>this.config[`show_${e.key}`]!==!1&&(!e.admin||this.rechten_.is_admin))}blokInfo_(e){return Ge.find(t=>t.key===e)}template(){let e=this.config;return`
      <div class="card surface ${e.bare?"bare":""}">
        <div class="kop">
          <div>
            <div class="eyebrow">DomotiApp Infoscherm</div>
            <h2>${P(e.title)}</h2>
          </div>
          <div class="status"></div>
        </div>
        <div class="geen" hidden></div>
        ${Ge.map(t=>`<section class="blok" data-blok="${t.key}" hidden>
              <button class="bk" type="button">${hb(t.icoon)}<b>${t.titel}</b><span class="bfout" hidden></span><span class="tel"></span>${v("chevronDown")}</button>
              <div class="inhoud"></div>
            </section>`).join("")}
        <input class="file" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml">
      </div>`}wire(){let e=this.$(".card");this.teardown_.push(V(e)),this.teardown_.push(()=>this.herkansing_.stop()),this.teardown_.push(()=>{for(let t of Object.values(this.timers_))clearTimeout(t);this.timers_={}}),this.on(e,"click",t=>this.klik_(t)),this.on(e,"input",t=>this.invoer_(t)),this.on(e,"change",t=>this.invoer_(t)),this.on(e,"pointerdown",t=>this.sleepStart_(t)),this.on(e,"focusout",t=>this.focusWeg_(t)),this.on(this.$(".file"),"change",t=>this.bestandGekozen_(t)),this.openConfig_!==this.config.open&&(this.openConfig_=this.config.open,this.open_=this.config.open&&this.config.open!=="geen"?this.config.open:null),this.haal_(),this.luister_()}set hass(e){let t=this.verbinding_.herverbonden(e);super.hass=e,t&&this.built_&&(this.haal_(),this.luister_())}get hass(){return super.hass}async haal_(){if(this.hass?.connection)try{let e=await kn(this.hass);this.rechten_=e,this.feedFouten_=e.feed_fouten??{},this.fout_=null,this.herkansing_.herstel(),this.nieuweStand_(e.stand,!0)}catch(e){if(re(e)){this.herkansing_.plan(),this.status_("Home Assistant start nog op\u2026","bezig");return}this.fout_=e?.message??"Het beheer kon niet laden.",this.paint()}}async luister_(){if(!this.hass?.connection?.subscribeMessage)return;let e=!1;this.teardown_.push(()=>{e=!0});try{let t=await ti(this.hass,n=>{n?.soort==="stand"&&this.nieuweStand_(n.stand),n?.soort==="feeds"&&(this.feedFouten_=n.feed_fouten??{},this.teken_("instellingen"))});e?t():this.teardown_.push(()=>{try{t()}catch{}})}catch{}}nieuweStand_(e,t=!1){let n=!this.stand_;this.stand_=e,this.sync_();let i=new Set;for(let r of pb){if(this.vuil_.has(r)||this.bezig_.has(r)){r==="personen"&&this.neemAanwezigOver_(e.personen);continue}if(t||n||JSON.stringify(this.werk_[r])!==JSON.stringify(e[r])){this.werk_[r]=wh(e[r]);for(let o of Ge)o.secties.includes(r)&&i.add(o.key)}}if(n||t)return this.paint();this.paintKader_();for(let r of i)this.teken_(r)}neemAanwezigOver_(e){let t=this.werk_.personen;if(!Array.isArray(t))return;let n=new Map((e??[]).map(i=>[i.id,i.aanwezig]));t.forEach((i,r)=>{if(!i.id||i._aanwezig||!n.has(i.id)||n.get(i.id)===i.aanwezig)return;i.aanwezig=n.get(i.id);let o=this.$(`.blok[data-blok="personen"] .item[data-i="${r}"]`),s=o?.querySelector('input[data-veld="aanwezig"]');s&&(s.checked=i.aanwezig);let l=o?.querySelector(".vink .vl");l&&(l.textContent=i.aanwezig?"Aanwezig":"Afwezig"),o?.querySelector(".avatar")?.classList.toggle("aan",i.aanwezig)}),this.tel_("personen")}paint(){if(this.$(".card")&&(this.paintKader_(),!!this.magTonen_()))for(let e of this.blokken_())this.teken_(e.key)}magTonen_(){return!this.fout_&&this.stand_&&this.rechten_.mag_beheren!==!1}paintKader_(){let e=this.$(".geen");this.fout_?(e.hidden=!1,e.textContent=this.fout_):this.stand_&&this.rechten_.mag_beheren===!1?(e.hidden=!1,e.textContent="Dit account mag het infoscherm niet beheren. Log in als receptie of beheerder."):e.hidden=!0;let t=this.magTonen_(),n=new Set(this.blokken_().map(i=>i.key));for(let i of this.$$(".blok"))i.hidden=!t||!n.has(i.dataset.blok),i.classList.toggle("open",i.dataset.blok===this.open_);t&&(this.hass?.connected===!1?this.status_("Geen verbinding","fout"):!this.bezig_.size&&!this.vuil_.size&&this.status_(this.laatstOpgeslagen_?`Opgeslagen ${this.laatstOpgeslagen_}`:"","ok"))}status_(e,t=""){let n=this.$(".status");n&&(n.textContent=e,n.className=`status ${t}`)}teken_(e,t=!1){let n=this.$(`.blok[data-blok="${e}"]`);if(!n||!this.stand_)return;let i=this.shadowRoot.activeElement;if(!t&&i&&n.contains(i)&&i.matches("input, textarea, select")){this.uitgesteld_.add(e),this.tel_(e);return}this.uitgesteld_.delete(e);let r={personen:()=>this.htmlPersonen_(this.werk_.personen),mededelingen:()=>this.htmlMededelingen_(this.werk_.mededelingen,this.werk_.scherm),verjaardagen:()=>this.htmlVerjaardagen_(this.werk_.verjaardagen),praktijk:()=>this.htmlPraktijk_(this.werk_.praktijk),indeling:()=>this.htmlIndeling_(this.werk_.indeling),verlichting:()=>this.htmlVerlichting_(this.werk_.installatie,this.werk_.instellingen),instellingen:()=>this.htmlInstellingen_(this.werk_.scherm,this.werk_.instellingen)}[e](),o=n.querySelector(".inhoud");o.innerHTML=r+this.htmlVoet_(e),this.plaatjes_(o),this.tel_(e)}focusWeg_(e){if(!this.uitgesteld_.size)return;let t=e.target?.closest?.(".blok")?.dataset.blok,n=e.relatedTarget?.closest?.(".blok")?.dataset.blok;t&&t!==n&&this.uitgesteld_.has(t)&&setTimeout(()=>this.teken_(t),0)}tel_(e){let t=this.$(`.blok[data-blok="${e}"]`);if(!t)return;let n=this.werk_,i={personen:()=>`${(n.personen??[]).filter(l=>l.aanwezig).length} van ${(n.personen??[]).length} aanwezig`,mededelingen:()=>`${(n.mededelingen??[]).length}`,verjaardagen:()=>`${(n.verjaardagen??[]).length}`,praktijk:()=>"",indeling:()=>`${(n.indeling?.blokken??[]).length} blokken`,verlichting:()=>`${(n.installatie?.verlichting??[]).length} lampen${n.instellingen?.verlichting_tonen===!1?" \xB7 uit":""}`,instellingen:()=>`${(n.instellingen?.feeds??[]).length} nieuwsbron(nen)`}[e]();t.querySelector(".tel").textContent=i;let o=this.blokInfo_(e).secties.map(l=>this.fouten_[l]).find(Boolean),s=t.querySelector(".bfout");s.hidden=!o,s.textContent=o?"niet opgeslagen":""}htmlVoet_(e){let n=this.blokInfo_(e).secties.map(r=>this.fouten_[r]).find(Boolean),i=this.meldingen_[e];return!n&&!i?"":`<div class="voet"><span class="melding ${n||i?.fout?"fout":""}">${P(n?`Niet opgeslagen: ${n}`:i?.tekst)}</span></div>`}veld_(e,t,n,{type:i="text",i:r,extra:o="",s}={}){return`<div class="veld"><label>${P(e)}</label><input type="${i}" data-veld="${t}" ${s?`data-s="${s}"`:""} ${r!==void 0?`data-i="${P(String(r))}"`:""} value="${P(n)}" ${o}></div>`}schakel_(e,t,{i:n,label:i,s:r}={}){return`<label class="vink"><span class="schakel"><input type="checkbox" data-veld="${e}" ${r?`data-s="${r}"`:""} ${n!==void 0?`data-i="${P(String(n))}"`:""} ${t?"checked":""}><span></span></span>${i?`<span class="vl">${P(i)}</span>`:""}</label>`}keuze_(e,t,n,i,{s:r}={}){return`<div class="veld"><label>${P(e)}</label><div class="segment" role="radiogroup" data-veld="${t}" ${r?`data-s="${r}"`:""}>${i.map(([o,s])=>`<button type="button" role="radio" data-actie="segment" data-waarde="${P(o)}" aria-checked="${String(o)===String(n??"")}" class="${String(o)===String(n??"")?"aan":""}">${P(s)}</button>`).join("")}</div></div>`}htmlPersonen_(e=[]){return`<div class="hulp">Tik op de cirkel om een foto te kiezen. Zonder foto staan de initialen op het scherm (eerste letter van de voornaam en van het laatste woord van de achternaam). Sleep aan de greep links om de volgorde te wijzigen; dat is de volgorde op het scherm. De schakelaar zet iemand aan- of afwezig, ook achteraf. Alles wordt vanzelf opgeslagen.</div>
      <div class="lijst">${e.map((n,i)=>`<div class="item persoon" data-i="${i}">
          <div class="greep" title="Sleep om de volgorde te wijzigen">${_h.grip}</div>
          <div class="avatar ${n.aanwezig?"aan":""}" data-actie="foto" data-i="${i}" data-bestand="${P(n.foto)}" title="Foto kiezen">${P(os(n.naam))}</div>
          ${this.veld_("Naam","naam",n.naam,{i})}
          ${this.veld_("Functie","functie",n.functie,{i})}
          ${this.schakel_("aanwezig",n.aanwezig,{i,label:n.aanwezig?"Aanwezig":"Afwezig"})}
          <div class="knoppen">
            ${n.foto?`<button class="knop ico" type="button" data-actie="fotoweg" data-i="${i}" title="Foto weghalen">${v("close")}</button>`:""}
            <button class="knop ico gevaar" type="button" data-actie="verwijder" data-i="${i}" title="Verwijderen">${v("minus")}</button>
          </div>
        </div>`).join("")||'<div class="leeg">Nog geen medewerkers.</div>'}</div>
      <div><button class="knop" type="button" data-actie="nieuw">${v("plus")} Medewerker toevoegen</button></div>`}htmlMededelingen_(e=[],t={}){return`<div class="hulp">Wat er in het blok Mededelingen op het welkomscherm staat: "Vrijdag 20 september zijn wij vanaf 12:00 gesloten", een nieuwe collega, een verbouwing. Zonder datum en tijd staat een mededeling er altijd. Met meerdere schuiven ze vanzelf door; op de iPad kan er ook geveegd worden.</div>
      <div class="lijst">${e.map((i,r)=>`<div class="item mededeling" data-i="${r}">
          <div class="veld"><label>Tekst op het scherm</label><textarea data-veld="tekst" data-i="${r}" rows="2">${P(i.tekst)}</textarea></div>
          ${this.veld_("Vanaf","van",i.van,{i:r,type:"datetime-local"})}
          ${this.veld_("Tot en met","tot",i.tot,{i:r,type:"datetime-local"})}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="verwijder" data-i="${r}" title="Verwijderen">${v("minus")}</button></div>
        </div>`).join("")||'<div class="leeg">Geen mededeling.</div>'}</div>
      <div class="voet">
        <button class="knop" type="button" data-actie="nieuw">${v("plus")} Mededeling toevoegen</button>
        ${this.veld_("Elke mededeling blijft staan (seconden)","mededeling_interval",t.mededeling_interval??10,{type:"number",s:"scherm",extra:'min="3" max="600"'})}
      </div>`}htmlVerjaardagen_(e=[]){return`<div class="hulp">Iedereen die op het scherm gefeliciteerd mag worden: medewerkers, vrijwilligers, bewoners. Het blok Verjaardagen op het welkomscherm toont wie er vandaag en binnenkort jarig is; "Alles bekijken" geeft het hele jaar.</div>
      <div class="lijst">${e.map((n,i)=>`<div class="item verjaardag" data-i="${i}">
          ${this.veld_("Naam","naam",n.naam,{i})}
          ${this.veld_("Geboortedatum","datum",n.datum,{i,type:"date"})}
          ${this.schakel_("jaar_tonen",n.jaar_tonen!==!1,{i,label:"Leeftijd tonen"})}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="verwijder" data-i="${i}" title="Verwijderen">${v("minus")}</button></div>
        </div>`).join("")||'<div class="leeg">Nog geen verjaardagen.</div>'}</div>
      <div><button class="knop" type="button" data-actie="nieuw">${v("plus")} Verjaardag toevoegen</button></div>`}htmlPraktijk_(e={}){let t=e.openingstijden??{},n=xt.map(r=>{let o=t[r]??[],s=o.length===0,l=(d,c)=>o[d]?.[c]??"";return`<span class="dag">${Gt[r]}</span>
        ${this.schakel_("ot_open",!s,{i:r,label:s?"gesloten":"open"})}
        <input type="time" data-veld="ot_0_0" data-i="${r}" value="${l(0,0)}" ${s?"disabled":""}>
        <input type="time" data-veld="ot_0_1" data-i="${r}" value="${l(0,1)}" ${s?"disabled":""}>
        <input type="time" class="vak2" data-veld="ot_1_0" data-i="${r}" value="${l(1,0)}" ${s?"disabled":""}>
        <input type="time" class="vak2" data-veld="ot_1_1" data-i="${r}" value="${l(1,1)}" ${s?"disabled":""}>`}).join(""),i=(e.uitzonderingen??[]).map((r,o)=>`<div class="item uitz" data-i="${o}">
          ${this.veld_("Datum","u_datum",r.datum,{i:o,type:"date"})}
          ${this.schakel_("u_open",(r.tijden??[]).length>0,{i:o,label:(r.tijden??[]).length?"open":"gesloten"})}
          ${this.veld_("Van","u_van",r.tijden?.[0]?.[0]??"",{i:o,type:"time",extra:r.tijden?.length?"":"disabled"})}
          ${this.veld_("Tot","u_tot",r.tijden?.[0]?.[1]??"",{i:o,type:"time",extra:r.tijden?.length?"":"disabled"})}
          ${this.veld_("Reden (op het scherm)","u_reden",r.reden,{i:o})}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="u_verwijder" data-i="${o}" title="Verwijderen">${v("minus")}</button></div>
        </div>`).join("");return`
      <div class="veld"><label>Openingstijden</label>
        <div class="ot-tabel">
          <span class="k"></span><span class="k"></span><span class="k">Open</span><span class="k">Dicht</span><span class="k vak2">Open</span><span class="k vak2">Dicht</span>
          ${n}
        </div>
        <div class="hulp">Twee vakken per dag voor een middagpauze. Het welkomscherm zegt ermee "Vandaag geopend tot 17:00" of "Gesloten \xB7 morgen open om 08:00".</div>
      </div>
      <div class="veld"><label>Afwijkende dagen (feestdagen, studiedagen)</label>
        <div class="lijst">${i||'<div class="leeg">Geen afwijkende dagen.</div>'}</div>
        <div style="margin-top:8px"><button class="knop" type="button" data-actie="u_nieuw">${v("plus")} Afwijkende dag toevoegen</button></div>
      </div>`}htmlIndeling_(e){let t=e?.blokken??[],n=ot(new Date),i=t.map(s=>{let l=st[s.soort];if(!l)return"";let d=di(s.soort,this.stand_,[],n);return`<div class="ib ${d?"ontbreekt":""}" data-id="${P(s.id)}" style="${this.ibStijl_(s)}" title="${P(d?`${l.naam}: ${d}`:`${l.naam} -- sleep om te verplaatsen, hoek rechtsonder om de maat te wijzigen`)}">
          <div class="ib-in">
            <div class="ib-kop">${v(l.icoon,"question")}<span>${l.naam}</span></div>
            ${d?`<div class="ib-nb">${P(d)}</div>`:""}
            ${l.aantal?`<div class="ib-aantal"><span>Toon</span><button type="button" data-actie="aantal_min" data-id="${P(s.id)}" title="Minder">\u2212</button><b>${s.aantal>0?s.aantal:"alle"}</b><button type="button" data-actie="aantal_plus" data-id="${P(s.id)}" title="Meer">+</button></div>`:""}
            <button class="ib-weg" type="button" data-actie="blok_weg" data-id="${P(s.id)}" title="Van het scherm halen">${v("close")}</button>
            <div class="ib-greep" title="Maat wijzigen"></div>
          </div>
        </div>`}).join(""),r=new Set(t.map(s=>s.soort)),o=hh.filter(s=>!r.has(s));return`<div class="hulp">Zo staat het welkomscherm op de iPad. Sleep een blok om het te verplaatsen, trek aan de hoek rechtsonder om het groter of kleiner te maken, en zet met \u2212 en + hoeveel er in een blok staat ("alle" = zoveel als er is). Een gestippeld blok staat NIET op het scherm zolang er niets in te tonen valt; de reden staat erin. Elke wijziging gaat meteen naar het scherm.</div>
      <div class="raster">${i}</div>
      <div class="knoppen" style="justify-content: flex-start">
        <select data-actie="blok_toevoegen" ${o.length?"":"disabled"} style="width:auto">
          <option value="">${o.length?"Blok toevoegen\u2026":"Alle blokken staan op het scherm"}</option>
          ${o.map(s=>`<option value="${s}">${st[s].naam}</option>`).join("")}
        </select>
        <button class="knop" type="button" data-actie="indeling_standaard">Standaardindeling</button>
      </div>`}ibStijl_(e){return`left:${(e.x/Le*100).toFixed(3)}%;top:${(e.y/Te*100).toFixed(3)}%;width:${(e.w/Le*100).toFixed(3)}%;height:${(e.h/Te*100).toFixed(3)}%`}htmlVerlichting_(e={},t={}){let i=(e.verlichting??[]).map((r,o)=>{let s=this.hass?.states?.[r.entity]?.attributes??{};return`<div class="item lamp" data-i="${o}">
          <div class="ent"><b>${P(s.friendly_name??r.entity)}</b><span>${P(r.entity)}</span></div>
          ${this.veld_("Naam op het scherm","l_naam",r.naam,{i:o,s:"installatie",extra:`placeholder="${P(s.friendly_name??"")}"`})}
        </div>`}).join("");return`
      ${this.schakel_("verlichting_tonen",t.verlichting_tonen!==!1,{label:"Verlichting op het scherm tonen",s:"instellingen"})}
      <div class="hulp">De namen zoals ze op het scherm staan. Leeg = de naam uit Home Assistant. Welke lampen erbij horen kiest de installateur in de kaartinstellingen van DEZE kaart (bewerkmodus, potlood bij de kaart).</div>
      <div class="lijst">${i||'<div class="leeg">Er zijn nog geen lampen gekozen.</div>'}</div>`}htmlInstellingen_(e={},t={}){let n=(t.feeds??[]).map((i,r)=>`<div class="item feed" data-i="${r}">
          ${this.veld_("Naam","f_naam",i.naam,{i:r,s:"instellingen"})}
          ${this.veld_("Adres van de RSS-feed","f_url",i.url,{i:r,type:"url",s:"instellingen"})}
          <div class="knoppen"><button class="knop ico gevaar" type="button" data-actie="f_verwijder" data-i="${r}" title="Verwijderen">${v("minus")}</button></div>
          ${this.feedFouten_[i.url]?`<div class="feedfout" style="grid-column: 1 / -1">Niet opgehaald: ${P(this.feedFouten_[i.url])}</div>`:""}
        </div>`).join("");return`
      <div class="rij twee">
        <div class="veld"><label>Logo</label>
          <div class="b-onder">
            <div class="plaatje logo" data-bestand="${P(e.logo)}">${e.logo?"":v("camera")}</div>
            <button class="knop klein" type="button" data-actie="logo">${v("camera")} ${e.logo?"Ander logo":"Logo kiezen"}</button>
            ${e.logo?`<button class="knop klein" type="button" data-actie="logoweg">${v("close")} Logo weg</button>`:""}
          </div>
          <div class="hulp">Het logo houdt zijn eigen verhouding: lang, breed of vierkant.</div>
        </div>
        <div class="veld"><label>Accentkleur op het scherm</label>
          <div class="b-onder">
            <input type="color" data-veld="accent_kleur" data-s="scherm" value="${P(e.accent||"#026fa1")}">
            <input type="text" data-veld="accent" data-s="scherm" value="${P(e.accent)}" placeholder="leeg = standaard" style="max-width: 140px">
          </div>
        </div>
      </div>
      <div class="rij drie">
        ${this.keuze_("Uiterlijk","uiterlijk",e.uiterlijk??"donker",[["donker","Donker"],["licht","Licht"]],{s:"scherm"})}
        ${this.keuze_("Vorm van de foto's","foto_vorm",e.foto_vorm??"rond",[["rond","Rond"],["vierkant","Afgerond vierkant"]],{s:"scherm"})}
        ${this.keuze_("Pagina Aanwezig","aanwezig_weergave",e.aanwezig_weergave??"gescheiden",[["gescheiden","Aanwezig en afwezig naast elkaar"],["functie","Per functie, naast elkaar"],["lijst","E\xE9n lijst"]],{s:"scherm"})}
      </div>
      <div class="rij drie">
        ${this.veld_("Terug naar Welkom na (seconden, 0 = nooit)","terug_na",e.terug_na??60,{type:"number",s:"scherm",extra:'min="0" max="3600"'})}
        ${this.veld_("Schaal (1 = iPad 11 inch)","schaal",e.schaal??1,{type:"number",s:"scherm",extra:'min="0.5" max="2" step="0.05"'})}
      </div>
      ${this.schakel_("aanwezig_teller",e.aanwezig_teller!==!1,{label:"Teller bij Aanwezig (x van y)",s:"scherm"})}
      ${this.schakel_("weer_animatie",e.weer_animatie!==!1,{label:"Bewegende weericonen",s:"scherm"})}
      <div class="veld"><label>Het blok Welkom</label>
        <div class="hulp">Wat er in het welkomblok op het scherm staat. Alleen het logo? Zet de tekst leeg en de openingsregel uit.</div>
        <div class="rij twee" style="margin-top: 6px">
          ${this.veld_("Tekst (leeg = geen tekst)","welkom_tekst",e.welkom_tekst??"Welkom",{s:"scherm"})}
          <div class="veld" style="gap: 0">
            ${this.schakel_("logo_verbergen",e.logo_verbergen===!0,{label:"Logo op het scherm verbergen",s:"scherm"})}
            ${this.schakel_("welkom_onder",e.welkom_onder!==!1,{label:"Regel met de openingstijd van vandaag",s:"scherm"})}
          </div>
        </div>
      </div>
      <div class="veld"><label>Nieuws (RSS)</label>
        <div class="hulp">Bijvoorbeeld het NOS-nieuws: https://feeds.nos.nl/nosnieuwsalgemeen. Wordt elk kwartier opgehaald.</div>
        <div class="lijst">${n||'<div class="leeg">Geen bronnen.</div>'}</div>
        <div class="knoppen" style="justify-content: flex-start; margin-top: 8px">
          <button class="knop" type="button" data-actie="f_nieuw">${v("plus")} Bron toevoegen</button>
          <button class="knop" type="button" data-actie="f_ververs">Nu ophalen</button>
        </div>
      </div>`}plaatjes_(e){for(let t of e.querySelectorAll("[data-bestand]:not([data-bestand=''])"))xn(this.hass,t.dataset.bestand).then(n=>{n&&t.isConnected&&(t.innerHTML=`<img alt="" src="${n}">`)})}markeer_(e,t,n=ms){this.vuil_.add(e),this.bron_={...this.bron_??{},[e]:t},this.versie_[e]=(this.versie_[e]??0)+1,this.fouten_[e]=null,t&&(this.meldingen_[t]=null,this.tel_(t)),this.status_("Opslaan\u2026","bezig"),clearTimeout(this.timers_[e]),this.timers_[e]=setTimeout(()=>this.bewaar_(e),n)}invoer_(e){let t=e.target;if(t?.dataset?.actie==="blok_toevoegen")return this.blokToevoegen_(t.value,t);let n=t?.dataset?.veld;if(!n)return;let i=t.closest(".blok")?.dataset.blok;if(!i)return;let r=this.blokInfo_(i),o=t.dataset.s||r.secties[0],s=t.dataset.i,l=this.werk_[o],d=t.type==="checkbox"?t.checked:t.value,c=t.type==="text"||t.type==="url"||t.type==="number"||t.tagName==="TEXTAREA",p=t.type==="color";if(!((c||p)&&e.type!=="input")&&!(!c&&!p&&e.type!=="change")){if(o==="personen"||o==="mededelingen"||o==="verjaardagen"){let h=l[Number(s)];if(!h)return;if(h[n]=d,n==="naam"){let u=t.closest(".item")?.querySelector(".avatar");u&&!u.querySelector("img")&&(u.textContent=os(d))}if(n==="aanwezig"){h._aanwezig=!0;let u=t.closest(".vink")?.querySelector(".vl");u&&(u.textContent=d?"Aanwezig":"Afwezig"),t.closest(".item")?.querySelector(".avatar")?.classList.toggle("aan",d)}}else if(o==="praktijk")this.invoerPraktijk_(l,n,s,d,t);else if(o==="scherm")if(n==="accent_kleur"){l.accent=d;let h=t.closest(".b-onder")?.querySelector('[data-veld="accent"]');h&&(h.value=d)}else if(n==="accent")l.accent=String(d).trim()||null;else if(t.type==="number"){let h=Number(d);if(!Number.isFinite(h))return;l[n]=h}else l[n]=d;else if(o==="installatie"){if(n==="l_naam"){let h=l.verlichting?.[Number(s)];h&&(h.naam=d)}}else if(o==="instellingen")if(n.startsWith("f_")){let h=l.feeds[Number(s)];h&&(h[n.slice(2)]=d)}else l[n]=d;this.markeer_(o,i,c?mb:ms)}}invoerPraktijk_(e,t,n,i,r){if(t==="ot_open"){e.openingstijden??={},e.openingstijden[n]=i?[["08:00","17:00"]]:[];let o=r.closest(".ot-tabel");for(let l of o.querySelectorAll(`input[type="time"][data-i="${n}"]`)){l.disabled=!i;let[,d,c]=l.dataset.veld.split("_");l.value=e.openingstijden[n][Number(d)]?.[Number(c)]??""}let s=r.closest(".vink")?.querySelector(".vl");s&&(s.textContent=i?"open":"gesloten")}else if(t.startsWith("ot_")){let[,o,s]=t.split("_").map(Number);e.openingstijden??={};let l=e.openingstijden[n]??[];for(;l.length<=o;)l.push(["",""]);l[o][s]=i,e.openingstijden[n]=l.filter((d,c)=>c===0||d[0]&&d[1]),e.openingstijden[n].length||(e.openingstijden[n]=[["",""]])}else if(t.startsWith("u_")){let o=e.uitzonderingen[Number(n)];if(!o)return;let s=t.slice(2);if(s==="open"){o.tijden=i?[["08:00","17:00"]]:[];let l=r.closest(".item");for(let c of l.querySelectorAll('input[type="time"]'))c.disabled=!i,c.value=i?c.dataset.veld==="u_van"?"08:00":"17:00":"";let d=r.closest(".vink")?.querySelector(".vl");d&&(d.textContent=i?"open":"gesloten")}else s==="van"||s==="tot"?o.tijden=[[s==="van"?i:o.tijden?.[0]?.[0]??"",s==="tot"?i:o.tijden?.[0]?.[1]??""]]:o[s]=i}else e[t]=i}blokToevoegen_(e,t){t&&(t.value="");let n=st[e];if(!n)return;let i=this.werk_.indeling??(this.werk_.indeling={blokken:[]});if(i.blokken.some(l=>l.soort===e))return;let[r,o]=n.maat,s=cs(i.blokken,r,o);for(;!s&&(r>1||o>1);)o>1?o-=1:r-=1,s=cs(i.blokken,r,o);return s?(i.blokken.push({id:`b-${Date.now().toString(36)}${Math.floor(Math.random()*1e4).toString(36)}`,soort:e,x:s.x,y:s.y,w:r,h:o,aantal:n.aantal?3:0}),this.markeer_("indeling","indeling"),this.teken_("indeling",!0)):(this.meldingen_.indeling={tekst:"Er is geen plek meer. Maak eerst een ander blok kleiner of haal er een weg.",fout:!0},this.teken_("indeling",!0))}sleepLijst_(e,t){let n=t.closest(".item"),i=n?.parentElement,r=n?.closest(".blok")?.dataset.blok;if(!n||!i||!r||e.pointerType==="mouse"&&e.button!==0)return;let o=this.blokInfo_(r).secties[0],s=this.werk_[o],l=Number(n.dataset.i);if(!Array.isArray(s)||!s[l])return;e.preventDefault(),n.classList.add("sleept");let d=p=>{let h=[...i.children].filter(m=>m!==n),u=null;for(let m of h){let b=m.getBoundingClientRect();if(p.clientY<b.top+b.height/2){u=m;break}}n.nextElementSibling!==u&&n!==u&&i.insertBefore(n,u)},c=()=>{window.removeEventListener("pointermove",d,!0),window.removeEventListener("pointerup",c,!0),window.removeEventListener("pointercancel",c,!0),n.classList.remove("sleept");let p=[...i.children].indexOf(n);if(p!==l&&p>=0){let[h]=s.splice(l,1);s.splice(p,0,h),this.markeer_(o,r)}this.teken_(r,!0)};window.addEventListener("pointermove",d,!0),window.addEventListener("pointerup",c,!0),window.addEventListener("pointercancel",c,!0),this.teardown_.push(c)}sleepStart_(e){let t=e.target.closest?.(".greep");if(t)return this.sleepLijst_(e,t);let n=e.target.closest?.(".ib");if(!n||e.target.closest("button, input, select")||e.pointerType==="mouse"&&e.button!==0)return;let i=n.closest(".raster"),r=this.werk_.indeling,o=r?.blokken?.find(w=>w.id===n.dataset.id);if(!o||!i)return;let s=e.target.closest(".ib-greep")?"maat":"plaats",l=i.getBoundingClientRect(),d=l.width/Le,c=l.height/Te,p={x:e.clientX,y:e.clientY},h={...o},u=!1;e.preventDefault();try{n.setPointerCapture(e.pointerId)}catch{}n.classList.add("sleept");let m=w=>{if(s!=="plaats")return null;let y=r.blokken.filter(T=>T.id!==w.id&&ds(T,w));if(y.length!==1)return null;let $=y[0];return $.w===w.w&&$.h===w.h&&$.x===w.x&&$.y===w.y?$:null},b=w=>{let y=Math.round((w.clientX-p.x)/d),$=Math.round((w.clientY-p.y)/c);(y||$)&&(u=!0),h=s==="plaats"?{...o,x:ui(o.x+y,0,Le-o.w),y:ui(o.y+$,0,Te-o.h)}:{...o,w:ui(o.w+y,1,Le-o.x),h:ui(o.h+$,1,Te-o.y)},n.classList.toggle("ongeldig",!li(r.blokken,h)&&!m(h)),n.style.cssText=this.ibStijl_(h)},x=()=>{n.removeEventListener("pointermove",b),n.removeEventListener("pointerup",x),n.removeEventListener("pointercancel",x),n.classList.remove("sleept","ongeldig");let w=h.x!==o.x||h.y!==o.y||h.w!==o.w||h.h!==o.h,y=u&&w?m(h):null;y?(Object.assign(y,{x:o.x,y:o.y}),Object.assign(o,{x:h.x,y:h.y}),this.markeer_("indeling","indeling")):u&&w&&li(r.blokken,h)&&(Object.assign(o,h),this.markeer_("indeling","indeling")),this.teken_("indeling",!0)};n.addEventListener("pointermove",b),n.addEventListener("pointerup",x),n.addEventListener("pointercancel",x)}async klik_(e){let t=e.target.closest(".bk");if(t){let c=t.closest(".blok").dataset.blok;this.open_=this.open_===c?null:c;for(let p of this.$$(".blok"))p.classList.toggle("open",p.dataset.blok===this.open_);this.open_&&this.uitgesteld_.has(this.open_)&&this.teken_(this.open_,!0);return}let n=e.target.closest("[data-actie]");if(!n||n.disabled||n.tagName==="SELECT")return;let i=n.closest(".blok")?.dataset.blok,r=n.dataset.actie;if(r==="segment"){let c=n.closest(".segment");for(let p of c.querySelectorAll("button"))p.classList.toggle("aan",p===n),p.setAttribute("aria-checked",String(p===n));return c.value=n.dataset.waarde,this.invoer_({target:c,type:"change"})}let o=Number(n.dataset.i),l=this.blokInfo_(i)?.secties[0],d=this.werk_[l];if(r==="nieuw"){let c={personen:{naam:"",functie:"",aanwezig:!1},mededelingen:{tekst:""},verjaardagen:{naam:"",datum:"",jaar_tonen:!0}}[l];d.push(c),this.teken_(i,!0),this.$(`.blok[data-blok="${i}"] .item:last-of-type input[type="text"], .blok[data-blok="${i}"] .item:last-of-type textarea`)?.focus();return}if(r==="verwijder"){let c=d[o],p=c?.naam||c?.titel||c?.tekst||"dit item";return c&&(c.id||c.naam||c.titel||c.tekst)&&!await Se({title:"Verwijderen?",text:`"${p}" verdwijnt meteen van het scherm.`,confirmText:"Verwijderen"})?void 0:(d.splice(o,1),this.markeer_(l,i),this.teken_(i,!0))}if(r==="foto"||r==="logo"){this.doel_=r==="logo"?{sectie:"scherm",blok:i,veld:"logo"}:{sectie:l,blok:i,i:o,veld:"foto"};let c=this.$(".file");c.value="",c.click();return}if(r==="fotoweg"||r==="logoweg")return r==="logoweg"?(this.werk_.scherm.logo=null,this.markeer_("scherm",i)):(d[o].foto=null,this.markeer_(l,i)),this.teken_(i,!0);if(r==="u_nieuw")return d.uitzonderingen??=[],d.uitzonderingen.push({datum:"",tijden:[],reden:""}),this.teken_(i,!0);if(r==="u_verwijder")return d.uitzonderingen.splice(o,1),this.markeer_(l,i),this.teken_(i,!0);if(r==="f_nieuw"){let c=this.werk_.instellingen;return c.feeds??=[],c.feeds.push({naam:"",url:""}),this.teken_(i,!0)}if(r==="f_verwijder")return this.werk_.instellingen.feeds.splice(o,1),this.markeer_("instellingen",i),this.teken_(i,!0);if(r==="f_ververs"){n.disabled=!0;try{let c=await Sp(this.hass);this.feedFouten_=c.feed_fouten??{},this.meldingen_[i]={tekst:`${(c.feeds??[]).length} bericht(en) opgehaald.`}}catch(c){this.meldingen_[i]={tekst:c?.message??"Ophalen lukte niet.",fout:!0}}return this.teken_(i,!0)}if(r==="blok_weg"||r==="aantal_min"||r==="aantal_plus"){let c=this.werk_.indeling,p=c?.blokken?.find(h=>h.id===n.dataset.id);return p?(r==="blok_weg"?c.blokken=c.blokken.filter(h=>h!==p):r==="aantal_min"?p.aantal=p.aantal<=1?0:p.aantal-1:p.aantal=Math.min(50,(p.aantal||0)+1),this.markeer_("indeling","indeling"),this.teken_("indeling",!0)):void 0}if(r==="indeling_standaard")return await Se({title:"Standaardindeling?",text:"De blokken gaan terug naar hun oorspronkelijke plek en maat.",confirmText:"Terugzetten"})?(this.werk_.indeling=si(),this.markeer_("indeling","indeling"),this.teken_("indeling",!0)):void 0}async bestandGekozen_(e){let t=e.target.files?.[0],n=this.doel_;if(this.doel_=null,!t||!n)return;let{sectie:i,blok:r,i:o,veld:s}=n;this.meldingen_[r]={tekst:"Bezig met uploaden\u2026"},this.teken_(r,!0);try{let l=await Np(this.hass,t),d=this.werk_[i],c=o===void 0?d:d[o],p=c[s];c[s]=l.id,p&&(this.oudeBestanden_=[...this.oudeBestanden_??[],p]),this.meldingen_[r]={tekst:`${l.naam||"Bestand"} ge\xFCpload.`},this.markeer_(i,r)}catch(l){this.meldingen_[r]={tekst:l?.message??"Uploaden lukte niet.",fout:!0}}this.teken_(r,!0)}payload_(e){let t=this.werk_[e];switch(e){case"personen":return(t??[]).filter(n=>n.naam?.trim()).map(({_aanwezig:n,aanwezig:i,...r})=>n?{...r,aanwezig:i}:r);case"mededelingen":return(t??[]).filter(n=>n.tekst?.trim());case"verjaardagen":return(t??[]).filter(n=>n.naam?.trim()&&n.datum);case"praktijk":return{openingstijden:Object.fromEntries(xt.map(n=>[n,(t.openingstijden?.[n]??[]).filter(i=>i[0]&&i[1])])),uitzonderingen:(t.uitzonderingen??[]).filter(n=>n.datum).map(n=>({...n,tijden:(n.tijden??[]).filter(i=>i[0]&&i[1])}))};case"instellingen":return{...t,feeds:(t.feeds??[]).filter(n=>n.url?.trim())};default:return t}}async bewaar_(e){if(!this.hass||this.bezig_.has(e))return;let t=this.versie_[e]??0;this.bezig_.add(e),this.status_("Opslaan\u2026","bezig");try{let i=(await $p(this.hass,e,this.payload_(e)))[e];this.koppel_(e,i),this.stand_&&(this.stand_[e]=wh(i)),this.fouten_[e]=null,(this.versie_[e]??0)===t&&this.vuil_.delete(e);let r=new Date;this.laatstOpgeslagen_=`${String(r.getHours()).padStart(2,"0")}:${String(r.getMinutes()).padStart(2,"0")}`;for(let o of this.oudeBestanden_??[])this.inGebruik_(o)||(Ap(this.hass,o).catch(()=>{}),Dp(o));this.oudeBestanden_=[]}catch(n){this.fouten_[e]=n?.message??"Opslaan lukte niet."}finally{this.bezig_.delete(e)}this.vuil_.has(e)&&(this.versie_[e]??0)!==t&&!this.fouten_[e]&&(clearTimeout(this.timers_[e]),this.timers_[e]=setTimeout(()=>this.bewaar_(e),ms));for(let n of Ge)n.secties.includes(e)&&this.tel_(n.key);if(!this.fouten_[e])for(let n of Ge)n.secties.includes(e)&&n.key!==this.bron_?.[e]&&this.teken_(n.key);if(this.fouten_[e]){this.status_(`Niet opgeslagen: ${this.fouten_[e]}`,"fout");for(let n of Ge)n.secties.includes(e)&&this.teken_(n.key)}else!this.bezig_.size&&!this.vuil_.size&&this.status_(`Opgeslagen ${this.laatstOpgeslagen_}`,"ok")}koppel_(e,t){let n=this.werk_[e];if(!Array.isArray(n)||!Array.isArray(t))return;let i={personen:o=>o.naam?.trim(),mededelingen:o=>o.tekst?.trim(),verjaardagen:o=>o.naam?.trim()&&o.datum}[e];if(!i)return;let r=0;n.forEach((o,s)=>{if(!i(o))return;let l=t[r];if(r+=1,!l)return;o.id=l.id,e==="personen"&&(o.initialen=l.initialen,o._aanwezig&&delete o._aanwezig);let d=this.$(`.blok[data-blok="${e}"] .item[data-i="${s}"]`);d&&(d.dataset.id=l.id)})}inGebruik_(e){let t=this.stand_??{};return t.scherm?.logo===e||(t.personen??[]).some(n=>n.foto===e)||(this.werk_.personen??[]).some(n=>n.foto===e)||this.werk_.scherm?.logo===e}};j(Ut,"css",ub);var gb={title:"Titel",weather:"Weerentiteit",energy:"Energiesensor (vermogen of tellerstand)",lights:"Lampen en schakelaars op het scherm",calendars:"Agenda's (de afspraken van vandaag)",kiosk_users:"Kioskaccounts",show_personen:"Blok Medewerkers",show_mededelingen:"Blok Mededelingen",show_verjaardagen:"Blok Verjaardagen",show_praktijk:"Blok Openingstijden",show_indeling:"Blok Indeling",show_verlichting:"Blok Verlichting",show_instellingen:"Blok Instellingen en logo",open:"Staat open bij het laden"},fb={weather:"Leeg = geen weer op het scherm.",energy:"Het blok Energie: een vermogenssensor (W of kW) geeft een live lijn van de afgelopen 24 uur; een tellerstand (kWh) het verbruik per uur. Leeg = geen energie op het scherm.",lights:"De namen zoals ze op het scherm staan geeft de receptie hieronder in het blok Verlichting; daar staat ook de schakelaar om ze te tonen.",kiosk_users:"Het account waarmee de iPad is ingelogd. Zo'n account mag alleen aanwezigheid omzetten en lampen schakelen, en niets beheren. Alleen een beheerder ziet deze lijst.",show_instellingen:"Logo, accent, uiterlijk, het welkomblok en de nieuwsbronnen. Zet dit blok uit op een dashboard voor een receptie die daar niet aan hoeft te zitten."},gs=class extends L{defaults(){return{...jh}}setConfig(e){this.ruwLeeg_=!yh.some(t=>e?.[t]!==void 0),super.setConfig(e),this.zaai_()}set hass(e){super.hass=e,this.gebruikers_===void 0&&e?.connection&&e.user?.is_admin&&(this.gebruikers_=null,Mp(e).then(t=>{this.gebruikers_=(t.gebruikers??[]).map(n=>({value:n.id,label:`${n.naam}${n.is_admin?" (beheerder)":""}`})),this.sync_()}).catch(()=>{this.gebruikers_=[]})),this.zaad_===void 0&&e?.connection&&(this.zaad_=null,kn(e).then(t=>{let n=t.stand?.installatie??{};this.zaad_={weather:n.weer??"",energy:n.energie??"",lights:(n.verlichting??[]).map(i=>i.entity),calendars:n.agendas??[],kiosk_users:t.stand?.instellingen?.kiosk_gebruikers??[]},this.zaai_()}).catch(()=>{this.zaad_={}}))}get hass(){return super.hass}zaai_(){!this.zaad_||!this.ruwLeeg_||this.gezaaid_||(this.gezaaid_=!0,this.config_={...this.config_,...this.zaad_},this.sync_())}schema(){let e=[{name:"weather",selector:f.entity("weather")},{name:"energy",selector:f.entity("sensor")},{name:"lights",selector:{entity:{multiple:!0,domain:["light","switch"]}}},{name:"calendars",selector:{entity:{multiple:!0,domain:"calendar"}}},{name:"waste",selector:{entity:{multiple:!0,domain:"sensor"}}}];return this.gebruikers_?.length&&e.push({name:"kiosk_users",selector:{select:{multiple:!0,mode:"list",options:this.gebruikers_}}}),[...e,{name:"title",selector:f.text()},{name:"open",selector:f.select([...Ge.map(t=>({value:t.key,label:t.titel})),{value:"geen",label:"Alles dicht"}])},...Ge.map(t=>({name:`show_${t.key}`,selector:f.bool()}))]}label(e){return gb[e.name]??super.label(e)}helper(e){return fb[e.name]}};D(fs,Ut,{name:"DomotiApp Infoscherm Beheer",description:"Voor de receptie: medewerkers, mededelingen, verjaardagen, openingstijden, de indeling van het scherm en het logo. Alles wordt vanzelf opgeslagen en staat meteen op het scherm. De installateur kiest hier ook het weer, de energiesensor, de lampen, de agenda's en het kioskaccount.",preview:!1});O(`${fs}-editor`,gs);Ut.getConfigElement=()=>document.createElement(`${fs}-editor`);Ut.getStubConfig=()=>({title:"Infoscherm"});var mi=globalThis,gi=mi.ShadowRoot&&(mi.ShadyCSS===void 0||mi.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,bs=Symbol(),zh=new WeakMap,$n=class{constructor(e,t,n){if(this._$cssResult$=!0,n!==bs)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(gi&&e===void 0){let n=t!==void 0&&t.length===1;n&&(e=zh.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),n&&zh.set(t,e))}return e}toString(){return this.cssText}},Oe=a=>new $n(typeof a=="string"?a:a+"",void 0,bs),ge=(a,...e)=>{let t=a.length===1?a[0]:e.reduce((n,i,r)=>n+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+a[r+1],a[0]);return new $n(t,a,bs)},$h=(a,e)=>{if(gi)a.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let n=document.createElement("style"),i=mi.litNonce;i!==void 0&&n.setAttribute("nonce",i),n.textContent=t.cssText,a.appendChild(n)}},vs=gi?a=>a:a=>a instanceof CSSStyleSheet?(e=>{let t="";for(let n of e.cssRules)t+=n.cssText;return Oe(t)})(a):a;var{is:bb,defineProperty:vb,getOwnPropertyDescriptor:kb,getOwnPropertyNames:xb,getOwnPropertySymbols:wb,getPrototypeOf:_b}=Object,fi=globalThis,Eh=fi.trustedTypes,yb=Eh?Eh.emptyScript:"",jb=fi.reactiveElementPolyfillSupport,En=(a,e)=>a,ks={toAttribute(a,e){switch(e){case Boolean:a=a?yb:null;break;case Object:case Array:a=a==null?a:JSON.stringify(a)}return a},fromAttribute(a,e){let t=a;switch(e){case Boolean:t=a!==null;break;case Number:t=a===null?null:Number(a);break;case Object:case Array:try{t=JSON.parse(a)}catch{t=null}}return t}},Sh=(a,e)=>!bb(a,e),Ah={attribute:!0,type:String,converter:ks,reflect:!1,useDefault:!1,hasChanged:Sh};Symbol.metadata??=Symbol("metadata"),fi.litPropertyMetadata??=new WeakMap;var We=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Ah){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let n=Symbol(),i=this.getPropertyDescriptor(e,n,t);i!==void 0&&vb(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){let{get:i,set:r}=kb(this.prototype,e)??{get(){return this[t]},set(o){this[t]=o}};return{get:i,set(o){let s=i?.call(this);r?.call(this,o),this.requestUpdate(e,s,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ah}static _$Ei(){if(this.hasOwnProperty(En("elementProperties")))return;let e=_b(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(En("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(En("properties"))){let t=this.properties,n=[...xb(t),...wb(t)];for(let i of n)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[n,i]of t)this.elementProperties.set(n,i)}this._$Eh=new Map;for(let[t,n]of this.elementProperties){let i=this._$Eu(t,n);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let i of n)t.unshift(vs(i))}else e!==void 0&&t.push(vs(e));return t}static _$Eu(e,t){let n=t.attribute;return n===!1?void 0:typeof n=="string"?n:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return $h(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){let n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(i!==void 0&&n.reflect===!0){let r=(n.converter?.toAttribute!==void 0?n.converter:ks).toAttribute(t,n.type);this._$Em=e,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){let n=this.constructor,i=n._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let r=n.getPropertyOptions(i),o=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:ks;this._$Em=i;let s=o.fromAttribute(t,r.type);this[i]=s??this._$Ej?.get(i)??s,this._$Em=null}}requestUpdate(e,t,n,i=!1,r){if(e!==void 0){let o=this.constructor;if(i===!1&&(r=this[e]),n??=o.getPropertyOptions(e),!((n.hasChanged??Sh)(r,t)||n.useDefault&&n.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,n))))return;this.C(e,t,n)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:r},o){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),r!==!0||o!==void 0)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[i,r]of n){let{wrapped:o}=r,s=this[i];o!==!0||this._$AL.has(i)||s===void 0||this.C(i,void 0,r,s)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(n=>n.hostUpdate?.()),this.update(t)):this._$EM()}catch(n){throw e=!1,this._$EM(),n}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};We.elementStyles=[],We.shadowRootOptions={mode:"open"},We[En("elementProperties")]=new Map,We[En("finalized")]=new Map,jb?.({ReactiveElement:We}),(fi.reactiveElementVersions??=[]).push("2.1.2");var $s=globalThis,Mh=a=>a,bi=$s.trustedTypes,Nh=bi?bi.createPolicy("lit-html",{createHTML:a=>a}):void 0,Rh="$lit$",lt=`lit$${Math.random().toFixed(9).slice(2)}$`,Hh="?"+lt,zb=`<${Hh}>`,yt=document,Sn=()=>yt.createComment(""),Mn=a=>a===null||typeof a!="object"&&typeof a!="function",Es=Array.isArray,$b=a=>Es(a)||typeof a?.[Symbol.iterator]=="function",xs=`[ 	
\f\r]`,An=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Dh=/-->/g,Lh=/>/g,wt=RegExp(`>|${xs}(?:([^\\s"'>=/]+)(${xs}*=${xs}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Th=/'/g,Oh=/"/g,Ih=/^(?:script|style|textarea|title)$/i,As=a=>(e,...t)=>({_$litType$:a,strings:e,values:t}),z=As(1),ry=As(2),oy=As(3),jt=Symbol.for("lit-noChange"),A=Symbol.for("lit-nothing"),Ch=new WeakMap,_t=yt.createTreeWalker(yt,129);function Vh(a,e){if(!Es(a)||!a.hasOwnProperty("raw"))throw Error("invalid template strings array");return Nh!==void 0?Nh.createHTML(e):e}var Eb=(a,e)=>{let t=a.length-1,n=[],i,r=e===2?"<svg>":e===3?"<math>":"",o=An;for(let s=0;s<t;s++){let l=a[s],d,c,p=-1,h=0;for(;h<l.length&&(o.lastIndex=h,c=o.exec(l),c!==null);)h=o.lastIndex,o===An?c[1]==="!--"?o=Dh:c[1]!==void 0?o=Lh:c[2]!==void 0?(Ih.test(c[2])&&(i=RegExp("</"+c[2],"g")),o=wt):c[3]!==void 0&&(o=wt):o===wt?c[0]===">"?(o=i??An,p=-1):c[1]===void 0?p=-2:(p=o.lastIndex-c[2].length,d=c[1],o=c[3]===void 0?wt:c[3]==='"'?Oh:Th):o===Oh||o===Th?o=wt:o===Dh||o===Lh?o=An:(o=wt,i=void 0);let u=o===wt&&a[s+1].startsWith("/>")?" ":"";r+=o===An?l+zb:p>=0?(n.push(d),l.slice(0,p)+Rh+l.slice(p)+lt+u):l+lt+(p===-2?s:u)}return[Vh(a,r+(a[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]},Nn=class a{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let r=0,o=0,s=e.length-1,l=this.parts,[d,c]=Eb(e,t);if(this.el=a.createElement(d,n),_t.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(i=_t.nextNode())!==null&&l.length<s;){if(i.nodeType===1){if(i.hasAttributes())for(let p of i.getAttributeNames())if(p.endsWith(Rh)){let h=c[o++],u=i.getAttribute(p).split(lt),m=/([.?@])?(.*)/.exec(h);l.push({type:1,index:r,name:m[2],strings:u,ctor:m[1]==="."?_s:m[1]==="?"?ys:m[1]==="@"?js:qt}),i.removeAttribute(p)}else p.startsWith(lt)&&(l.push({type:6,index:r}),i.removeAttribute(p));if(Ih.test(i.tagName)){let p=i.textContent.split(lt),h=p.length-1;if(h>0){i.textContent=bi?bi.emptyScript:"";for(let u=0;u<h;u++)i.append(p[u],Sn()),_t.nextNode(),l.push({type:2,index:++r});i.append(p[h],Sn())}}}else if(i.nodeType===8)if(i.data===Hh)l.push({type:2,index:r});else{let p=-1;for(;(p=i.data.indexOf(lt,p+1))!==-1;)l.push({type:7,index:r}),p+=lt.length-1}r++}}static createElement(e,t){let n=yt.createElement("template");return n.innerHTML=e,n}};function Ft(a,e,t=a,n){if(e===jt)return e;let i=n!==void 0?t._$Co?.[n]:t._$Cl,r=Mn(e)?void 0:e._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(a),i._$AT(a,t,n)),n!==void 0?(t._$Co??=[])[n]=i:t._$Cl=i),i!==void 0&&(e=Ft(a,i._$AS(a,e.values),i,n)),e}var ws=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??yt).importNode(t,!0);_t.currentNode=i;let r=_t.nextNode(),o=0,s=0,l=n[0];for(;l!==void 0;){if(o===l.index){let d;l.type===2?d=new Dn(r,r.nextSibling,this,e):l.type===1?d=new l.ctor(r,l.name,l.strings,this,e):l.type===6&&(d=new zs(r,this,e)),this._$AV.push(d),l=n[++s]}o!==l?.index&&(r=_t.nextNode(),o++)}return _t.currentNode=yt,i}p(e){let t=0;for(let n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}},Dn=class a{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=A,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Ft(this,e,t),Mn(e)?e===A||e==null||e===""?(this._$AH!==A&&this._$AR(),this._$AH=A):e!==this._$AH&&e!==jt&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):$b(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==A&&Mn(this._$AH)?this._$AA.nextSibling.data=e:this.T(yt.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:n}=e,i=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=Nn.createElement(Vh(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{let r=new ws(i,this),o=r.u(this.options);r.p(t),this.T(o),this._$AH=r}}_$AC(e){let t=Ch.get(e.strings);return t===void 0&&Ch.set(e.strings,t=new Nn(e)),t}k(e){Es(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,n,i=0;for(let r of e)i===t.length?t.push(n=new a(this.O(Sn()),this.O(Sn()),this,this.options)):n=t[i],n._$AI(r),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let n=Mh(e).nextSibling;Mh(e).remove(),e=n}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},qt=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,r){this.type=1,this._$AH=A,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=A}_$AI(e,t=this,n,i){let r=this.strings,o=!1;if(r===void 0)e=Ft(this,e,t,0),o=!Mn(e)||e!==this._$AH&&e!==jt,o&&(this._$AH=e);else{let s=e,l,d;for(e=r[0],l=0;l<r.length-1;l++)d=Ft(this,s[n+l],t,l),d===jt&&(d=this._$AH[l]),o||=!Mn(d)||d!==this._$AH[l],d===A?e=A:e!==A&&(e+=(d??"")+r[l+1]),this._$AH[l]=d}o&&!i&&this.j(e)}j(e){e===A?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},_s=class extends qt{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===A?void 0:e}},ys=class extends qt{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==A)}},js=class extends qt{constructor(e,t,n,i,r){super(e,t,n,i,r),this.type=5}_$AI(e,t=this){if((e=Ft(this,e,t,0)??A)===jt)return;let n=this._$AH,i=e===A&&n!==A||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==A&&(n===A||i);i&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},zs=class{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){Ft(this,e)}};var Ab=$s.litHtmlPolyfillSupport;Ab?.(Nn,Dn),($s.litHtmlVersions??=[]).push("3.3.3");var Bh=(a,e,t)=>{let n=t?.renderBefore??e,i=n._$litPart$;if(i===void 0){let r=t?.renderBefore??null;n._$litPart$=i=new Dn(e.insertBefore(Sn(),r),r,void 0,t??{})}return i._$AI(a),i};var Ss=globalThis,oe=class extends We{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Bh(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return jt}};oe._$litElement$=!0,oe.finalized=!0,Ss.litElementHydrateSupport?.({LitElement:oe});var Sb=Ss.litElementPolyfillSupport;Sb?.({LitElement:oe});(Ss.litElementVersions??=[]).push("4.2.2");var ye=ge`
  ${Oe(U)}
  :host {
    ${Oe(W)}
    font-family: var(--dac-font);
    color: var(--dac-ink);
    -webkit-font-smoothing: antialiased;
  }
  ${Oe(Ue)}
`,je=(a,e)=>class extends a{connectedCallback(){super.connectedCallback(),this._themaLos=F(this,e)}disconnectedCallback(){super.disconnectedCallback(),this._themaLos?.(),this._themaLos=null}update(t){super.update(t);let n=t?.get?.("hass");n&&n.themes!==this.hass?.themes&&Wn(this)}themaGewisseld_(){this.requestUpdate()}};var Mb=["unavailable","unknown"],Nb=["color_temp_kelvin","rgb_color","hs_color","xy_color"];function vi({scene:a,memberEntityIds:e,states:t}){let n=[],i=[],r=a?.lights??{},o=Array.isArray(e)?e:[],s=t??{};for(let l of o){let d=r[l];if(!d||typeof d!="object")continue;let c=s[l];if(!c||Mb.includes(c.state)){i.push(l);continue}if(d.state==="off"){n.push({service:"turn_off",data:{entity_id:l,transition:1}});continue}let p={entity_id:l,transition:1};typeof d.brightness=="number"&&(p.brightness=d.brightness);for(let h of Nb)if(d[h]!==void 0){p[h]=d[h];break}n.push({service:"turn_on",data:p})}return{oproepen:n,overgeslagen:i}}async function ki(a,e){let t=await Promise.allSettled(e.map(i=>a(i.service,i.data))),n=[];return t.forEach((i,r)=>{i.status==="rejected"&&n.push({entityId:e[r].data.entity_id,fout:i.reason})}),n}var Ns=["hs","rgb","rgbw","rgbww","xy"],Ds="color_temp",Db="onoff";var zt="kleur";var Lb=["unavailable","unknown"],Kh=["color_temp_kelvin","rgb_color","hs_color","xy_color"],Tb=[0,100];function Ce(a){if(!a)return{bekend:!1,beschikbaar:!1,helderheid:!1,kleurtemp:!1,kleur:!1,minKelvin:2e3,maxKelvin:6535,kelvinUitDefaults:!1};let e=a.attributes??{},t=Array.isArray(e.supported_color_modes)?e.supported_color_modes:null,n=t!==null&&t.length===1&&t[0]===Db,i=t!==null&&t.includes(Ds),r=t!==null&&t.some(d=>Ns.includes(d)),o=e.min_color_temp_kelvin,s=e.max_color_temp_kelvin,l=typeof o=="number"&&typeof s=="number"&&o<s;return{bekend:!0,beschikbaar:!Lb.includes(a.state),helderheid:!n,kleurtemp:i,kleur:r,minKelvin:l?Math.round(o):2e3,maxKelvin:l?Math.round(s):6535,kelvinUitDefaults:i&&!l}}function Ob(){return{state:"off"}}function Gh(a,e){let t=e??Ce(a);return t.bekend&&t.beschikbaar&&a.state==="on"?{state:"on",...Bb(a,t)}:t.helderheid?{state:"on",brightness:255}:{state:"on"}}function Wh(a,e,t,n){return e?a&&a.state==="on"?{...a}:Gh(t,n):{state:"off"}}function Uh(a,e,t,n){let i=n??Ce(t),r=Hs(a,t,i);return i.helderheid&&(r.brightness=X(e,1,255)),r}function Ls(a,e,t,n){let i=n??Ce(t),r=Hs(a,t,i);return nu(r),r.color_temp_kelvin=X(e,i.minKelvin,i.maxKelvin),r}function Ts(a,e,t,n){let i=n??Ce(t),r=Hs(a,t,i);return nu(r),r.hs_color=[X(e?.[0],0,360),X(e?.[1],0,100)],r}function xi(a,e,t){return a??Ob()}function Fh(a,e,t){let n=xi(a,e,t);if(typeof n.brightness=="number")return X(n.brightness,1,255);let i=e?.attributes?.brightness;return typeof i=="number"?X(i,1,255):255}function Os(a,e,t){let n=t??Ce(e),i=xi(a,e,n);if(typeof i.color_temp_kelvin=="number")return X(i.color_temp_kelvin,n.minKelvin,n.maxKelvin);let r=e?.attributes?.color_temp_kelvin;return typeof r=="number"?X(r,n.minKelvin,n.maxKelvin):Math.round((n.minKelvin+n.maxKelvin)/2)}function wi(a,e,t){let n=xi(a,e,t);if(Ms(n.hs_color))return[X(n.hs_color[0],0,360),X(n.hs_color[1],0,100)];let i=e?.attributes?.hs_color;return Ms(i)?[X(i[0],0,360),X(i[1],0,100)]:[...Tb]}function Cs(a){return a!=null&&typeof a=="object"}function qh(a,e,t){let n=Array.isArray(e)?e:[],i=Array.isArray(a)?a:[],r=Number.isInteger(t)?t:i.length;return n.filter(o=>{for(let s=0;s<r;s+=1)if(!Cs(i[s]?.lights?.[o]))return!0;return!1})}function Zh(a){return!Number.isInteger(a)||a<=0?null:a===1?"1 lamp nog niet ingesteld":`${a} lampen nog niet ingesteld`}function Rs(a,e,t){return xi(a,e,t).state==="on"}function Yh(a,e,t){let n=t??Ce(e);if(!n.bekend)return{aanuit:!1,helderheid:!1,kleurtemp:!1,kleur:!1,kleurkeuze:!1,stand:null};let i=Rs(a,e,n),r=Xh(n),o=r?Cb(a,e,n):null;return{aanuit:!0,helderheid:i&&n.helderheid,kleurtemp:i&&n.kleurtemp&&(!r||o==="wit"),kleur:i&&n.kleur&&(!r||o===zt),kleurkeuze:i&&r,stand:i?o:null}}function Xh(a){return!!(a?.kleurtemp&&a?.kleur)}function Cb(a,e,t){let n=t??Ce(e);if(a&&typeof a=="object"){if(typeof a.color_temp_kelvin=="number")return"wit";if(Kh.slice(1).some(r=>a[r]!==void 0))return zt}let i=e?.attributes?.color_mode;return i===Ds&&n.kleurtemp?"wit":Ns.includes(i)&&n.kleur?zt:"wit"}function Qh(a,e,t,n){let i=n??Ce(t);return Xh(i)?e==="wit"?Ls(a,Os(a,t,i),t,i):Ts(a,wi(a,t,i),t,i):a}function Jh(a){let e=X(a,0,255);return e<=0?0:Math.max(1,Math.round(e/255*100))}function eu(a){let e=X(a,1,100);return X(Math.round(e/100*255),1,255)}var Rb=1e3,Hb=4e4,Ph=7;function Ib(a){let e=X(a,Rb,Hb)/100,t=e<=66?255:329.698727446*(e-60)**-.1332047592,n=e<=66?99.4708025861*Math.log(e)-161.1195681661:288.1221695283*(e-60)**-.0755148492,i;return e>=66?i=255:e<=19?i=0:i=138.5177312231*Math.log(e-10)-305.0447927307,[X(t,0,255),X(n,0,255),X(i,0,255)]}function Vb(a){let[e,t,n]=Ib(a);return`rgb(${e}, ${t}, ${n})`}function tu(a,e){let t=Math.min(a,e),n=Math.max(a,e);return`linear-gradient(to right, ${Array.from({length:Ph},(r,o)=>{let s=o/(Ph-1),l=t+(n-t)*s;return`${Vb(l)} ${Math.round(s*100)}%`}).join(", ")})`}function Bb(a,e){let t=a.attributes??{},n={};e.helderheid&&(n.brightness=typeof t.brightness=="number"?X(t.brightness,1,255):255);let i=t.color_mode;return e.kleurtemp&&i===Ds&&typeof t.color_temp_kelvin=="number"?n.color_temp_kelvin=X(t.color_temp_kelvin,e.minKelvin,e.maxKelvin):e.kleur&&Ns.includes(i)&&Ms(t.hs_color)&&(n.hs_color=[X(t.hs_color[0],0,360),X(t.hs_color[1],0,100)]),n}function Hs(a,e,t){return a&&a.state==="on"?{...a}:Gh(e,t)}function nu(a){for(let e of Kh)delete a[e]}function Ms(a){return Array.isArray(a)&&a.length===2&&typeof a[0]=="number"&&typeof a[1]=="number"}function X(a,e,t){let n=Number(a);return Number.isFinite(n)?Math.min(t,Math.max(e,Math.round(n))):e}var _i="domotiapp-scene-card",Is="domotiapp-scene-card-editor",au="domotiapp-scene-editor";var Ln=["een","twee","drie"],iu="pencil",ru=["grid_options","layout_options","view_layout","visibility"];var ou="entity_id",Zt=class extends je(oe,{alleenMeten:!0}){constructor(){super();j(this,"_label",t=>t.name==="entity"?"Lichtgroep":t.name==="bare"?"Achtergrond weglaten":this._friendlyName(t.name));j(this,"_helper",t=>t.name==="entity"?"De lichtgroep waarvan deze kaart de scenes beheert.":t.name==="bare"?"Haalt de vulling en de schaduw onder de kaart weg. De rand blijft staan.":t.name);this._getypt={}}setConfig(t){this._config={...t}}_lichtgroepen(){let t=this.hass?.states??{};return Object.keys(t).filter(n=>n.startsWith("light.")&&Array.isArray(t[n].attributes?.[ou]))}_leden(){let t=this._config?.entity,n=this.hass?.states?.[t]?.attributes?.[ou];return Array.isArray(n)?n.filter(i=>i!==t):[]}_entiteitSchema(){let t=this._lichtgroepen();return[{name:"entity",required:!0,selector:t.length?{entity:{include_entities:t}}:{entity:{domain:"light"}}},{name:"bare",selector:{boolean:{}}}]}_namenSchema(t){return t.map(n=>({name:n,selector:{text:{}}}))}_naamData(t){let n=this._config?.name_overrides??{},i={};for(let r of t)r in this._getypt?i[r]=this._getypt[r]:n[r]&&(i[r]=n[r]);return i}_friendlyName(t){return this.hass?.states?.[t]?.attributes?.friendly_name||t}_entiteitGewijzigd(t){t.stopPropagation();let n=t.detail.value??{},i={...this._config,entity:n.entity};n.bare?i.bare=!0:delete i.bare,i.entity!==this._config?.entity&&(delete i.name_overrides,this._getypt={}),this._stuurDoor(i)}_namenGewijzigd(t){t.stopPropagation(),this._getypt={...this._getypt,...t.detail.value};let n={};for(let[r,o]of Object.entries(this._getypt))typeof o=="string"&&o.trim()&&(n[r]=o.trim());let i={...this._config};Object.keys(n).length?i.name_overrides=n:delete i.name_overrides,this._stuurDoor(i)}_stuurDoor(t){this._config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}render(){if(!this.hass||!this._config)return A;let t=this._leden();return z`
      <ha-form
        .hass=${this.hass}
        .data=${{entity:this._config.entity??"",bare:!!this._config.bare}}
        .schema=${this._entiteitSchema()}
        .computeLabel=${this._label}
        .computeHelper=${this._helper}
        @value-changed=${this._entiteitGewijzigd}
      ></ha-form>

      ${t.length?z`
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
          `:A}
    `}};j(Zt,"properties",{hass:{attribute:!1},_config:{state:!0},_getypt:{state:!0}}),j(Zt,"styles",[ye,ge`
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
    `]);var Pb="domotiapp_lovelace/snapshot/create",Kb="domotiapp_lovelace/snapshot/close",yi=class{constructor({roepCommandoAan:e,entityId:t}){this._roep=e,this._entityId=t,this._aanmaak=null,this._afsluiting=null}get heeftSnapshot(){return this._aanmaak!==null}get isGesloten(){return this._afsluiting!==null}async zorgVoorSnapshot(){return this._aanmaak===null&&(this._aanmaak=this._roep(Pb,{entity_id:this._entityId}).catch(e=>{throw this._aanmaak=null,e})),this._aanmaak}async sluit({opslaan:e=!1}={}){return this.heeftSnapshot?this._afsluiting!==null?this._afsluiting:(this._afsluiting=(async()=>{try{await this._aanmaak}catch{return{gedaan:!1}}return await this._roep(Kb,{entity_id:this._entityId,restore:!e}),{gedaan:!0}})(),this._afsluiting):{gedaan:!1}}};async function su({beheer:a,oproepen:e,voerUit:t}){return await a.zorgVoorSnapshot(),t(e)}var Bs="laden",Ps="klaar",lu="fout",Ub=`linear-gradient(to right, ${[0,60,120,180,240,300,360].map(a=>`hsl(${a}, 100%, 50%)`).join(", ")})`,Yt=class extends je(oe){constructor(){super(),this._scenes=null,this._leden=[],this._tab=0,this._toestand=Bs,this._melding="",this._bezig=!1,this._kelvinGemeld=new Set,this._snapshot=null}firstUpdated(){this._haalOp()}async _haalOp(){this._toestand=Bs;try{let e=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:this.entityId});return this._neemOver(e),this._toestand=Ps,e}catch(e){return this._melding=e?.message??String(e),this._toestand=lu,null}}_neemOver(e){this._scenes=Array.from({length:3},(t,n)=>{let i=e.scenes?.[n]??{};return{icon:i.icon||Ln[n],lights:{...i.lights??{}}}}),this._leden=e.member_entity_ids??[],this._melding=""}_stateVan(e){return this.hass?.states?.[e]}_besturingVan(e){let t=Ce(this._stateVan(e));return t.kelvinUitDefaults&&!this._kelvinGemeld.has(e)&&(this._kelvinGemeld.add(e),console.warn(`domotiapp-scene-editor: ${e} meldt geen Kelvin-grenzen; ${t.minKelvin}\u2013${t.maxKelvin} K aangehouden (SPEC 6.3).`)),t}_waardeVan(e){return this._scenes?.[this._tab]?.lights?.[e]}_zetLamp(e,t){this._scenes=this._scenes.map((n,i)=>{if(i!==this._tab)return n;let r={...n.lights};return t===void 0?delete r[e]:r[e]=t,{...n,lights:r}})}_zetIcoon(e){this._scenes=this._scenes.map((t,n)=>n===this._tab?{...t,icon:e||Ln[n]}:t)}_kiesTab(e){this._tab=e}get _kanOpslaan(){return this._toestand===Ps&&!this._bezig&&this._leden.length>0}async _slaOp(){if(!this._kanOpslaan)return;this._bezig=!0,this._melding="";try{await this.hass.callWS({type:"domotiapp_lovelace/scenes/save",entity_id:this.entityId,scenes:this._scenes})}catch(t){this._melding=t?.message??String(t),this._bezig=!1;return}let e=await this._haalOp();this._bezig=!1,e&&this.dispatchEvent(new CustomEvent("scenes-opgeslagen",{detail:e,bubbles:!0,composed:!0})),this._sluit({opslaan:!0})}get _beheer(){return this._snapshot===null&&(this._snapshot=new yi({entityId:this.entityId,roepCommandoAan:(e,t)=>this.hass.callWS({type:e,...t})})),this._snapshot}get _kanVoorbeeld(){return this._toestand===Ps&&!this._bezig&&this._leden.length>0}async _voorbeeld(){if(!this._kanVoorbeeld)return;let{oproepen:e}=vi({scene:this._scenes[this._tab],memberEntityIds:this._leden,states:this.hass.states});this._bezig=!0,this._melding="";try{let t=await su({beheer:this._beheer,oproepen:e,voerUit:n=>ki((i,r)=>this.hass.callService("light",i,r),n)});t.length&&(this._melding=`Deze lampen reageerden niet: ${t.map(n=>this._naam(n.entityId)).join(", ")}.`)}catch(t){this._melding=`Het voorbeeld is niet gestart: ${t?.message??String(t)}`}finally{this._bezig=!1}}_sluit({opslaan:e=!1}={}){this.dispatchEvent(new CustomEvent("editor-gesloten",{bubbles:!0,composed:!0})),this._sluitSnapshot({opslaan:e})}async _sluitSnapshot({opslaan:e}){try{await this._beheer.sluit({opslaan:e})}catch(t){console.warn(`domotiapp-scene-editor: de snapshot kon niet worden ${e?"verwijderd":"hersteld"}: ${t?.message??t}`)}}disconnectedCallback(){super.disconnectedCallback(),this._snapshot&&this._snapshot.heeftSnapshot&&this._sluitSnapshot({opslaan:!1})}_dialoogGesloten(e){e.stopPropagation(),this._sluit()}_naam(e){return this.nameOverrides?.[e]||this._stateVan(e)?.attributes?.friendly_name||e}render(){return z`
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
    `}_renderInhoud(){return this._toestand===Bs?z`<div class="inhoud">Bezig met laden…</div>`:this._toestand===lu?z`
        <div class="inhoud">
          <ha-alert alert-type="error">${this._melding}</ha-alert>
        </div>
      `:z`
      <div class="inhoud">
        <ha-tab-group>
          ${this._scenes.map((e,t)=>z`
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

        ${this._melding?z`<ha-alert alert-type="error">${this._melding}</ha-alert>`:A}
        ${this._leden.length===0?z`<ha-alert alert-type="info">
              Deze lichtgroep bevat geen lampen.
            </ha-alert>`:z`<div class="lampen">
              ${this._leden.map(e=>this._renderLamp(e))}
            </div>`}
      </div>
    `}_renderLamp(e){let t=this._stateVan(e),n=this._besturingVan(e),i=this._waardeVan(e),r=Rs(i,t,n),o=Yh(i,t,n);return z`
      <div class="lamp">
        <div class="kop">
          <div class="naam">
            <span class="tekst">
              ${this._naam(e)}
              ${n.bekend?n.beschikbaar?A:z`<span class="hint">niet bereikbaar</span>`:z`<span class="hint">lamp niet gevonden</span>`}
            </span>
            ${Cs(i)?A:z`<span class="nieuw">nieuw</span>`}
          </div>
          ${n.bekend?z`
                <div class="bediening">
                  ${o.kleurkeuze?this._renderKleurkeuze(e,t,n,i,o.stand):A}
                  <ha-switch
                    .checked=${r}
                    @change=${s=>this._zetLamp(e,Wh(i,s.target.checked,t,n))}
                  ></ha-switch>
                </div>
              `:A}
        </div>
        ${this._renderBesturing(e,t,n,i,o)}
      </div>
    `}_renderBesturing(e,t,n,i,r){return z`
      ${r.helderheid?this._renderHelderheid(e,t,n,i):A}
      ${r.kleurtemp?this._renderKleurtemp(e,t,n,i):A}
      ${r.kleur?this._renderKleur(e,t,n,i):A}
    `}_renderHelderheid(e,t,n,i){let r=Jh(Fh(i,t,n)),o=s=>{s.stopPropagation(),this._zetLamp(e,Uh(this._waardeVan(e),eu(s.detail.value),t,n))};return z`
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
    `}_renderKleurkeuze(e,t,n,i,r){let o=s=>l=>{l.stopPropagation(),s!==r&&this._zetLamp(e,Qh(this._waardeVan(e),s,t,n))};return z`
      <div class="kleurkeuze">
        <button
          class="keuze ${r===zt?"actief":""}"
          aria-pressed=${r===zt?"true":"false"}
          @click=${o(zt)}
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
    `}_renderKleurtemp(e,t,n,i){let r=Os(i,t,n),o=s=>{s.stopPropagation(),this._zetLamp(e,Ls(this._waardeVan(e),s.detail.value,t,n))};return z`
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
          style=${`--control-slider-background: ${tu(n.minKelvin,n.maxKelvin)}; --control-slider-background-opacity: 1`}
          @slider-moved=${o}
          @value-changed=${o}
        ></ha-control-slider>
      </div>
    `}_renderKleur(e,t,n,i){let[r,o]=wi(i,t,n),s=l=>d=>{d.stopPropagation();let c=wi(this._waardeVan(e),t,n),p=l==="tint"?[d.detail.value,c[1]]:[c[0],d.detail.value];this._zetLamp(e,Ts(this._waardeVan(e),p,t,n))};return z`
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
              style=${`--control-slider-background: ${Ub}; --control-slider-background-opacity: 1`}
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
    `}};j(Yt,"properties",{hass:{attribute:!1},entityId:{attribute:!1},nameOverrides:{attribute:!1},_scenes:{state:!0},_leden:{state:!0},_tab:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0}}),j(Yt,"styles",[ye,ge`
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
        color: var(--dac-on-accent-hi);
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
    `]);var Fb="0.57.1",qb=["type","entity","name_overrides","bare"],zi="laden",Tn="klaar",Ks="leeg",Gs="geen-groep",du="opslagfout",cu="fout",On=class extends je(oe){constructor(){super();j(this,"_opnieuw",()=>{this._herkansing.herstel(),this._haalScenesOp()});this._scenes=null,this._leden=[],this._toestand=zi,this._melding="",this._bezig=!1,this._editorOpen=!1,this._opgehaaldVoor=null,this._bestondVorigeKeer=!1,this._herkansing=new le(()=>this._haalScenesOp()),this._verbinding=new ke}static getConfigElement(){return document.createElement(Is)}static getStubConfig(t){return{entity:Object.keys(t?.states??{}).find(i=>i.startsWith("light.")&&Array.isArray(t.states[i].attributes?.entity_id))??""}}updated(){let t=this.renderRoot?.querySelector(".card, .needs");t!==this._rasterVak&&(this._rasterUit?.(),this._rasterVak=t,this._rasterUit=t?V(t):null),R(t)}disconnectedCallback(){super.disconnectedCallback(),this._herkansing.stop(),this._rasterUit?.(),this._rasterUit=null,this._rasterVak=null}setConfig(t){if(!t?.entity)throw new Error("Kies een lichtgroep bij 'entity'.");let n=Object.keys(t).filter(i=>!qb.includes(i)&&!ru.includes(i));n.length&&console.warn(`${_i}: onbekende sleutels in de configuratie: ${n.join(", ")}`),this._config=t,this.toggleAttribute("bare",!!t.bare)}getCardSize(){return 1}getGridOptions(){return{rows:"auto",columns:"full",min_columns:6,min_rows:St(this.renderRoot?.querySelector?.(".card"),1)}}willUpdate(){let t=this._config?.entity;if(!this.hass||!t)return;let n=!!this.hass.states[t];if(this._opgehaaldVoor!==t){this._opgehaaldVoor=t,this._bestondVorigeKeer=n,this._haalScenesOp();return}if(this._verbinding.herverbonden(this.hass)){this._bestondVorigeKeer=n,this._herkansing.herstel(),this._haalScenesOp();return}if(n&&!this._bestondVorigeKeer&&this._toestand===Gs){this._bestondVorigeKeer=!0,this._haalScenesOp();return}this._bestondVorigeKeer=n}async _haalScenesOp(){let t=this._config.entity;this._toestand=zi,this._melding="";try{let n=await this.hass.callWS({type:"domotiapp_lovelace/scenes/get",entity_id:t});this._scenes=n.scenes,this._leden=n.member_entity_ids??[],this._toestand=this._leden.length===0?Ks:Tn,this._herkansing.herstel()}catch(n){this._verwerkFout(n,t)}}_verwerkFout(t,n){let i=t?.code;if(this._melding=t?.message??String(t),re(t)&&this._herkansing.plan()){this._toestand=zi;return}if(i==="home_assistant_error"){this._toestand=du;return}if(!this.hass.states[n]){this._toestand=Gs;return}this._toestand=cu}_naam(t){return this._config?.name_overrides?.[t]||this.hass?.states?.[t]?.attributes?.friendly_name||t}async _pasSceneToe(t){if(this._bezig||this._toestand!==Tn)return;let{oproepen:n}=vi({scene:this._scenes?.[t],memberEntityIds:this._leden,states:this.hass.states});if(n.length){this._bezig=!0;try{let i=await ki((r,o)=>this.hass.callService("light",r,o),n);i.length&&this._meldMislukking(i.map(r=>r.entityId))}finally{this._bezig=!1}}}_meldMislukking(t){let n=t.map(r=>this._naam(r)).join(", "),i=t.length===1?`${n} reageerde niet.`:`Deze lampen reageerden niet: ${n}.`;this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:i},bubbles:!0,composed:!0}))}_bewerk(){this._toestand===Tn&&(this._editorOpen=!0)}_sluitEditor(){this._editorOpen=!1}_scenesOpgeslagen(t){t.stopPropagation(),this._scenes=t.detail.scenes,this._leden=t.detail.member_entity_ids??[],this._toestand=this._leden.length===0?Ks:Tn}render(){if(!this._config)return A;switch(this._toestand){case Gs:return this._renderFout(`Lichtgroep ${this._config.entity} bestaat niet (meer). Pas de kaart aan.`);case du:return this._renderFout("De opgeslagen scenes van deze kamer zijn onleesbaar.",this._melding);case cu:return this._renderFout("De scenes konden niet geladen worden.",this._melding,!0);default:return this._renderKaart()}}_renderFout(t,n,i=!1){return z`
      <div class="needs">
        <span class="mark">${this._icoon("question")}</span>
        <span>
          <b>${t}</b>
          ${n?z`<span class="detail">${n}</span>`:A}
          ${i?z`<button type="button" class="opnieuw" @click=${this._opnieuw}>
                Opnieuw proberen
              </button>`:A}
        </span>
      </div>
    `}_icoon(t){let n=document.createElement("template");return n.innerHTML=v(t),n.content.cloneNode(!0)}_renderKaart(){let t=this._toestand===Ks,n=this._toestand===zi,i=this._iconen();return z`
      <div class="card surface">
        <div class="rij">
          <div class="scenes">
            ${i.map((r,o)=>z`
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
            ${this._icoon(iu)}
          </button>
        </div>
        ${t?z`<div class="mededeling">Deze lichtgroep bevat geen lampen.</div>`:this._renderNieuweLampen()}
      </div>
      ${this._editorOpen?this._renderEditor():A}
    `}_renderNieuweLampen(){if(this._toestand!==Tn)return A;let t=qh(this._scenes,this._leden,3).length,n=Zh(t);return n?z`<div class="mededeling">${n}</div>`:A}_renderEditor(){return z`
      <domotiapp-scene-editor
        .hass=${this.hass}
        .entityId=${this._config.entity}
        .nameOverrides=${this._config.name_overrides}
        @editor-gesloten=${this._sluitEditor}
        @scenes-opgeslagen=${this._scenesOpgeslagen}
      ></domotiapp-scene-editor>
    `}_iconen(){return Array.from({length:3},(t,n)=>this._scenes?.[n]?.icon||Ln[n])}};j(On,"properties",{hass:{attribute:!1},_config:{state:!0},_scenes:{state:!0},_leden:{state:!0},_toestand:{state:!0},_melding:{state:!0},_bezig:{state:!0},_editorOpen:{state:!0}}),j(On,"styles",[ye,ge`
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
    `]);H(_i,On);H(Is,Zt);H(au,Yt);Mt({type:_i,name:"DomotiApp Scene",description:`Drie lichtscenes per kamer, vastgelegd bij de lichtgroep (v${Fb}).`,preview:!1});var $t="domotiapp-alarm-card",Ws="domotiapp-alarm-card-editor",pu="domotiapp-alarm-editor",hu="DomotiApp Wekker",uu="https://github.com/Sven2410/domotiapp-lovelace",Re="domotiapp_lovelace",xe=Object.freeze({get:`${Re}/alarms/get`,save:`${Re}/alarms/save`,setEnabled:`${Re}/alarms/set_enabled`,delete:`${Re}/alarms/delete`,stop:`${Re}/alarms/stop`,clearMessage:`${Re}/alarms/clear_message`,search:`${Re}/sound/search`,entities:`${Re}/entities/list`,previewStart:`${Re}/preview/start`,subscribe:`${Re}/updates/subscribe`}),$i="#026FA1";function mu(a){let e=typeof a?.name=="string"?a.name.trim():"",t=typeof a?.time=="string"?a.time.trim():"";return e&&t?`Wil je de wekker "${e}" van ${t} verwijderen?`:e?`Wil je de wekker "${e}" verwijderen?`:t?`Wil je de wekker van ${t} verwijderen?`:"Wil je deze wekker verwijderen?"}var Zb="07:00";var Yb=["uri","name","media_type","image"],Xb="Let op: deze tijd bestaat twee nachten per jaar niet, of twee keer. Bij de overgang naar zomertijd wordt het uur van 02:00 tot 03:00 overgeslagen; die nacht gaat deze wekker niet af. Bij de overgang naar wintertijd komt dat uur twee keer voorbij; die nacht gaat hij twee keer af. Kies een tijd v\xF3\xF3r 02:00 of n\xE1 03:00 als dat een probleem is.",Qb="Dit geluid stopt van zichzelf. Een los nummer is na een paar minuten voorbij; daarna is het stil. Kies een afspeellijst of een radiostation als de wekker moet blijven spelen tot je hem uitzet.";var Jb="Music Assistant Wekker",ev="Verlichting Wekker";function Ai(){return{id:null,name:"",time:Zb,days:[],enabled:!0,sound:null,endless:null,speaker:"",volume_pct:40,light:null}}function gu(a){let e=Ai();return!a||typeof a!="object"?e:{id:typeof a.id=="string"?a.id:null,name:typeof a.name=="string"?a.name:"",time:Us(a.time)?a.time:e.time,days:Array.isArray(a.days)?[...a.days]:[],enabled:a.enabled!==!1,sound:Rn(a.sound),endless:null,speaker:typeof a.speaker=="string"?a.speaker:"",volume_pct:Number.isInteger(a.volume_pct)?a.volume_pct:e.volume_pct,light:a.light&&typeof a.light=="object"?{entity_id:a.light.entity_id,brightness_pct:Number.isInteger(a.light.brightness_pct)?a.light.brightness_pct:60}:null}}function Rn(a){if(!a||typeof a!="object"||Array.isArray(a)||typeof a.uri!="string"||!a.uri)return null;let e={};for(let t of Yb)e[t]=a[t]===void 0?null:a[t];return e}function Us(a){if(typeof a!="string"||a.length!==5||a[2]!==":")return!1;let e=Number(a.slice(0,2)),t=Number(a.slice(3));return!/^\d\d$/.test(a.slice(0,2))||!/^\d\d$/.test(a.slice(3))?!1:e>=0&&e<=23&&t>=0&&t<=59}function Fs(a){let e=[];return!a||typeof a!="object"?{ok:!1,ontbreekt:["alles"]}:((typeof a.name!="string"||!a.name.trim())&&e.push("een naam"),Us(a.time)||e.push("een geldige tijd"),a.speaker||e.push("een speaker"),(!a.sound||!a.sound.uri)&&e.push("een geluid"),(!Number.isInteger(a.volume_pct)||a.volume_pct<1||a.volume_pct>100)&&e.push("een volume tussen 1 en 100"),{ok:e.length===0,ontbreekt:e})}function fu(a){let e=[...new Set(a.days||[])].sort((n,i)=>n-i),t={name:(a.name||"").trim(),time:a.time,days:e,enabled:e.length===0?!0:a.enabled!==!1,sound:Rn(a.sound),speaker:a.speaker,volume_pct:a.volume_pct,light:a.light?{entity_id:a.light.entity_id,brightness_pct:a.light.brightness_pct}:null};return a.id&&(t.id=a.id),t}function bu(a,e){let t=new Set(a||[]);return t.has(e)?t.delete(e):t.add(e),[...t].sort((n,i)=>n-i)}function vu(a){return Us(a)&&a.slice(0,2)==="02"?Xb:null}function ku(a){return a===!1?Qb:null}function xu(a){return typeof a?.endless=="boolean"?a.endless:null}function Si(a,e){let t=e==="lamp",n=t?ev:Jb,i=t?"lampen":"speakers";return!a||typeof a!="object"?`De lijst met ${i} is niet op te halen.`:a.label_exists===!1?`Het label '${n}' bestaat nog niet. De beheerder moet dat label aanmaken en op de ${i} zetten die als wekker mogen dienen.`:Array.isArray(a.entities)&&a.entities.length>0?null:Number(a.filtered_out)>0?t?`De entiteiten met het label '${n}' zijn geen lampen.`:"De gelabelde speakers zijn geen Music Assistant-speakers, of ze kunnen geen volume instellen.":`Er zijn nog geen ${i} met het label '${n}'.`}function wu(a,e){return Si(e,"speaker")!==null?!1:Fs(a).ok}var Ei=a=>String(a??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();function _u(a,e){let t=Array.isArray(a)?a:[],n=Ei(e).split(/\s+/).filter(Boolean);if(!n.length)return[...t];let i=t.filter(s=>{let l=Ei(Cn(s));return n.every(d=>l.includes(d))}),r=Ei(e).trim(),o=s=>Ei(Cn(s)).startsWith(r);return[...i.filter(o),...i.filter(s=>!o(s))]}var Cn=a=>a?.name||a?.entity_id||"";var nv=[[1,"ma"],[2,"di"],[3,"wo"],[4,"do"],[5,"vr"],[6,"za"],[7,"zo"]],av=[["","Alles"],["playlist","Afspeellijsten"],["radio","Radio"],["artist","Artiesten"],["album","Albums"],["track","Nummers"],["podcast","Podcasts"]],Hn="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",iv="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",rv="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",ov="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z",sv="M6,2H18V8H18V8L14,12L18,16V16H18V22H6V16H6V16L10,12L6,8V8H6V2M16,16.5L12,12.5L8,16.5V20H16V16.5M12,11.5L16,7.5V4H8V7.5L12,11.5Z",Xt=class extends je(oe){constructor(){super(),this._concept=Ai(),this._zoekterm="",this._soort="",this._treffers=null,this._zoekt=!1,this._melding=null,this._speelt=!1,this._bezig=!1,this._kiest=null,this._filter="",this._afmeldenVoorbeeld=null,this._opEscape=e=>{if(e.key==="Escape"){if(this._kiest){e.stopPropagation(),this._openKiezer(null);return}this._annuleren()}}}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this._opEscape,!0)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("keydown",this._opEscape,!0),this._stopVoorbeeld()}willUpdate(e){e.has("wekker")&&(this._concept=this.wekker?gu(this.wekker):Ai(),this._treffers=null,this._zoekterm="",this._melding=null)}_zet(e){this._concept={...this._concept,...e}}async _startVoorbeeld(){if(!(this._speelt||!this.hass)){if(!this._concept.speaker||!this._concept.sound){this._melding={tekst:"Kies eerst een speaker en een geluid.",fout:!0};return}this._melding=null;try{this._afmeldenVoorbeeld=await this.hass.connection.subscribeMessage(()=>{},{type:xe.previewStart,speaker:this._concept.speaker,sound:Rn(this._concept.sound),volume_pct:this._concept.volume_pct,light:this._concept.light??null}),this._speelt=!0}catch(e){this._melding={tekst:e?.message??"Het voorbeeld kon niet starten.",fout:!0}}}}_stopVoorbeeld(){if(this._afmeldenVoorbeeld){try{this._afmeldenVoorbeeld()}catch(e){console.warn(`domotiapp-alarm-editor: afmelden mislukt: ${e?.message??e}`)}this._afmeldenVoorbeeld=null}this._speelt=!1}async _zoek(){let e=(this._zoekterm||"").trim();if(!(!e||!this.hass)){this._zoekt=!0,this._melding=null;try{let t={type:xe.search,query:e,limit:20};this._soort&&(t.media_types=[this._soort]);let n=await this.hass.callWS(t);this._treffers=n.results??[]}catch(t){this._treffers=[],this._melding={tekst:t?.message??"Zoeken is mislukt.",fout:!0}}finally{this._zoekt=!1}}}_kiesGeluid(e){this._zet({sound:Rn(e),endless:xu(e)}),this._treffers=null}async _opslaan(){if(this._bezig||!this.hass)return;let e=Fs(this._concept);if(!e.ok){this._melding={tekst:`Er ontbreekt nog ${e.ontbreekt.join(", ")}.`,fout:!0};return}this._bezig=!0;try{let t=await this.hass.callWS({type:xe.save,person:this.person,alarm:fu(this._concept)});this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-opgeslagen",{detail:{toestand:t},bubbles:!0,composed:!0}))}catch(t){this._melding={tekst:t?.message??"Opslaan is mislukt.",fout:!0}}finally{this._bezig=!1}}_annuleren(){this._stopVoorbeeld(),this.dispatchEvent(new CustomEvent("editor-dicht",{bubbles:!0,composed:!0}))}_openKiezer(e){this._kiest=e,this._filter="",e&&this.updateComplete.then(()=>this.renderRoot?.querySelector(".zoekkeuze")?.focus())}_kiezer({soort:e,id:t,lijst:n,gekozen:i,leeg:r,zoektekst:o,geen:s,kies:l}){let d=this._kiest===e,c=n.find(m=>m.entity_id===i),p=c?Cn(c):i,h=d?_u(n,this._filter):[],u=m=>{l(m),this._openKiezer(null)};return z`
      <div class="vak">
        <button
          class="keuze"
          id=${t}
          type="button"
          aria-expanded=${d?"true":"false"}
          @click=${()=>this._openKiezer(d?null:e)}
        >
          <span class="naam ${i?"":"leeg"}">${i?p:r}</span>
          ${this._svg(d?ov:rv)}
        </button>
      </div>
      ${d?z`<div class="vak zoekvak">
              <input
                class="zoekkeuze"
                type="search"
                .value=${this._filter}
                placeholder=${o}
                aria-label=${o}
                @input=${m=>{this._filter=m.target.value}}
                @keydown=${m=>{m.key==="Enter"&&(m.preventDefault(),h[0]&&u(h[0].entity_id))}}
              />
            </div>
            <div class="treffers" role="listbox" aria-label=${o}>
              ${s&&!this._filter.trim()?z`<button
                    class="treffer"
                    type="button"
                    role="option"
                    aria-selected=${i?"false":"true"}
                    @click=${()=>u("")}
                  >
                    <span>${s}</span>
                  </button>`:A}
              ${h.length===0?z`<div class="treffer">Niets gevonden.</div>`:h.map(m=>z`<button
                      class="treffer"
                      type="button"
                      role="option"
                      aria-selected=${m.entity_id===i?"true":"false"}
                      @click=${()=>u(m.entity_id)}
                    >
                      <span>${Cn(m)}</span>
                    </button>`)}
            </div>`:A}
    `}_svg(e){return z`<svg class="icoon" viewBox="0 0 24 24" aria-hidden="true">
      <path d=${e} />
    </svg>`}render(){if(!this.hass)return A;let e=this._concept,t=this.entiteiten?.speakers,n=this.entiteiten?.lights,i=Si(t,"speaker"),r=Si(n,"lamp"),o=vu(e.time),s=ku(e.endless),l=wu(e,t);return z`
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
        ${o?z`<div class="waarschuwing">
              ${this._svg(Hn)}<span>${o}</span>
            </div>`:A}
      </div>

      <div class="blok">
        <label class="veld">Herhaling</label>
        <div class="dagen">
          ${nv.map(([d,c])=>z`<button
              type="button"
              aria-pressed=${e.days.includes(d)?"true":"false"}
              aria-label=${c}
              @click=${()=>this._zet({days:bu(e.days,d)})}
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
        ${i?z`<div class="uitleg">${this._svg(Hn)}<span>${i}</span></div>`:this._kiezer({soort:"speaker",id:"speaker",lijst:t?.entities??[],gekozen:e.speaker,leeg:"Kies een speaker\u2026",zoektekst:"Zoek een speaker op naam",kies:d=>this._zet({speaker:d})})}
      </div>

      <div class="blok">
        <label class="veld" for="zoek">Geluid</label>
        ${e.sound?z`<div class="gekozen">
              ${e.sound.image?z`<img src=${e.sound.image} alt="" />`:A}
              <span>${e.sound.name||e.sound.uri}</span>
              <span class="soort" style="margin-left:auto">${e.sound.media_type??""}</span>
            </div>`:A}
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
              ${av.map(([d,c])=>z`<option value=${d}>${c}</option>`)}
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
            ${this._svg(this._zoekt?sv:iv)}
          </button>
        </div>
        ${this._treffers?z`<div class="treffers">
              ${this._treffers.length===0?z`<div class="treffer">Niets gevonden.</div>`:this._treffers.map(d=>z`<button
                      class="treffer"
                      type="button"
                      @click=${()=>this._kiesGeluid(d)}
                    >
                      ${d.image?z`<img src=${d.image} alt="" />`:A}
                      <span>${d.name}</span>
                      <span class="soort">${d.media_type??""}</span>
                    </button>`)}
            </div>`:A}
        ${s?z`<div class="waarschuwing">${this._svg(Hn)}<span>${s}</span></div>`:A}
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
        ${r?z`<div class="uitleg">${this._svg(Hn)}<span>${r}</span></div>`:z`
              ${this._kiezer({soort:"lamp",id:"lamp",lijst:n?.entities??[],gekozen:e.light?.entity_id??"",leeg:"Geen lamp",zoektekst:"Zoek een lamp op naam",geen:"Geen lamp",kies:d=>this._zet({light:d?{entity_id:d,brightness_pct:e.light?.brightness_pct??60}:null})})}
              ${e.light?z`<label class="veld" style="margin-top:10px" for="helderheid">
                      Helderheid: ${e.light.brightness_pct}%
                    </label>
                    <input
                      id="helderheid"
                      type="range"
                      min="1"
                      max="100"
                      .value=${String(e.light.brightness_pct)}
                      @input=${d=>this._zet({light:{...e.light,brightness_pct:Number(d.target.value)}})}
                    />`:A}
            `}
      </div>

      ${this._melding?z`<div class="blok">
            <div class="waarschuwing ${this._melding.fout?"fout":""}">
              ${this._svg(Hn)}<span>${this._melding.tekst}</span>
            </div>
          </div>`:A}

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
    `}};j(Xt,"properties",{hass:{attribute:!1},person:{attribute:!1},wekker:{attribute:!1},entiteiten:{attribute:!1},_concept:{state:!0},_zoekterm:{state:!0},_soort:{state:!0},_treffers:{state:!0},_zoekt:{state:!0},_melding:{state:!0},_speelt:{state:!0},_bezig:{state:!0},_kiest:{state:!0},_filter:{state:!0}}),j(Xt,"styles",[ye,ge`
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${Oe($i)});
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
      background: var(--dac-veld);
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
      background-color: var(--dac-veld);
    }
    .vak select option {
      background-color: var(--dac-veld);
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
    /* --- het keuzeveld met zoeken (speaker en wake-up light) ---

       Het was een select-element, en met zestig lampen is dat een scrollmenu waarin
       je je lamp zoekt door te lezen. Gevraagd op 29 september 2026: "ik wil
       bij de wakeuplight ook kunnen zoeken op naam (...) Ook bij de speaker
       selecteren". Het veld ziet eruit als de andere velden (het zit in een
       .vak); de lijst eronder is dezelfde als die van het geluid. */
    .vak .keuze {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      box-sizing: border-box;
      padding: 0;
      border: 0;
      margin: 0;
      background: transparent;
      color: var(--dac-ink);
      font-family: inherit;
      font-size: 13.5px;
      text-align: left;
      cursor: pointer;
    }
    .keuze .naam {
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .keuze .naam.leeg {
      color: var(--dac-ink-2);
    }
    .keuze .icoon {
      flex: 0 0 auto;
    }
    .zoekvak {
      margin-top: 8px;
    }
    .treffer[aria-selected="true"] {
      background: color-mix(in srgb, var(--domotiapp-accent) 22%, transparent);
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
  `]);var yu="person",lv="Kies een persoon in de kaartinstellingen.",ju="De gekozen persoon is niet gevonden.",dv="De opgeslagen wekkers van deze persoon zijn onleesbaar.",l2=Object.freeze(["grid_options","layout_options","view_layout","visibility"]);function zu(a){if(!a||typeof a!="object"||Array.isArray(a))throw new Error("De kaartconfig ontbreekt of is geen object.");let e=a.person;if(e==null||e==="")return{...a};if(typeof e!="string")throw new Error("'person' moet een entity-ID zijn, zoals person.sven.");if(!e.startsWith(`${yu}.`))throw new Error(`'${e}' zit niet in het domein ${yu}. Kies een persoon, zoals person.sven.`);return{...a}}function $u(a){return{type:`custom:${a}`}}function Eu(a,e){return a?e?{soort:"ok",tekst:null,isFout:!1}:{soort:"weg",tekst:ju,isFout:!0}:{soort:"ontbreekt",tekst:lv,isFout:!1}}function Au(a,e){return a==="not_found"?ju:a==="home_assistant_error"?dv:e||"Er ging iets mis bij het ophalen van de wekkers."}var cv=["ma","di","wo","do","vr","za","zo"],pv="Geen wekkers ingesteld",hv="Eenmalig",uv="Eenmalig \u2014 afgelopen",mv="Geen wekker actief",Su="Stoppen",gv="Er is een melding over deze wekker, maar de tekst ontbreekt.";function fv(a){return!Array.isArray(a)||a.length===0?hv:[...new Set(a)].sort((t,n)=>t-n).map(t=>cv[t-1]??"?").join(" ")}function bv(a,e){return!a||Array.isArray(a.days)&&a.days.length>0?!1:Date.parse(a?.one_shot_at??"")<=e}function Mu(a,e){return bv(a,e)?uv:fv(a?.days)}function Nu(a){let e=a?.last_message;return!e||typeof e!="object"||Array.isArray(e)?null:{tekst:typeof e.text=="string"&&e.text.trim()?e.text:gv,severity:e.severity==="error"?"error":"notice",isFout:e.severity==="error",kind:typeof e.kind=="string"?e.kind:null}}function Du(a){let e=a?.alarms;if(!Array.isArray(e)||e.length===0)return pv;let t=a?.next_fire?.text;return typeof t=="string"&&t.trim()?t:mv}function Lu(a,e){let t=[...new Set((e??[]).filter(o=>typeof o=="string"))];if(t.length===0)return null;let n=t.map(o=>(a??[]).find(s=>s?.id===o)).filter(Boolean),i=n.map(o=>o.name).filter(Boolean),r=[...new Set(n.map(o=>o.time).filter(Boolean))];return{ids:t,naam:i.length?i.join(" en "):"Wekker",tijd:r.join(" en ")}}var vv="0.57.1",kv="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",xv="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z",Tu="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",wv="M13,14H11V9H13M13,18H11V16H13M1,21H23L12,2L1,21Z",Mi=(a,e="icoon")=>z`<svg class=${e} viewBox="0 0 24 24" aria-hidden="true">
    <path d=${a} />
  </svg>`,In=class extends je(oe){constructor(){super(),this._toestand=null,this._fout=null,this._bevestigVoor=null,this._bezig=!1,this._tijdelijkeMelding=null,this._editorVoor=void 0,this._entiteiten=null,this._abonnementVoor=null,this._afmelden=null,this._herkansing=new le(()=>this._haalOp()),this._verbinding=new ke}setConfig(e){let t=zu(e),n=t.person!==this._config?.person;this._config=t,this.toggleAttribute("bare",!!e?.bare),n&&(this._toestand=null,this._fout=null,this._bevestigVoor=null,this._herstartAbonnement())}static getConfigElement(){return document.createElement(Ws)}static getStubConfig(){return $u($t)}getGridOptions(){return{rows:"auto",columns:12,min_columns:6,min_rows:St(this.renderRoot?.querySelector?.(".card"),1)}}getCardSize(){if(this._stop())return 3;let e=this._toestand?.alarms?.length??0;return 1+Math.max(e,1)}connectedCallback(){super.connectedCallback(),this._herstartAbonnement()}disconnectedCallback(){super.disconnectedCallback(),this._herkansing.stop(),this._stopAbonnement(),this._rasterUit?.(),this._rasterUit=null,this._rasterVak=null}updated(e){e.has("hass")&&this.hass&&(this._startAbonnement(),this._verbinding.herverbonden(this.hass)&&(this._herkansing.herstel(),this._haalOp())),this._volgRaster()}_volgRaster(){let e=this.renderRoot?.querySelector(".card, .needs");e!==this._rasterVak&&(this._rasterUit?.(),this._rasterVak=e,this._rasterUit=e?V(e):null),R(e)}async _startAbonnement(){let e=this._config?.person;if(!(!this.hass||!e||!this.isConnected)&&this._abonnementVoor!==e){this._abonnementVoor=e;try{let t=await this.hass.connection.subscribeMessage(n=>this._opGebeurtenis(n),{type:xe.subscribe,person:e});if(this._abonnementVoor!==e){t();return}this._afmelden=t}catch(t){console.warn(`${$t}: abonneren mislukt: ${t?.message??t}`)}await this._haalOp()}}_stopAbonnement(){if(this._afmelden){try{this._afmelden()}catch(e){console.warn(`${$t}: afmelden mislukt: ${e?.message??e}`)}this._afmelden=null}this._abonnementVoor=null}_herstartAbonnement(){this._stopAbonnement(),this._startAbonnement()}_opGebeurtenis(e){let t=e?.alarm_id,n=e?.event;if(typeof t=="string"&&this._toestand){let i=new Set(this._toestand.ringing??[]);n==="started"?i.add(t):i.delete(t),this._toestand={...this._toestand,ringing:[...i]}}this._haalOp()}async _haalOp(){let e=this._config?.person;if(!(!this.hass||!e))try{let t=await this.hass.callWS({type:xe.get,person:e});if(this._config?.person!==e)return;this._toestand=t,this._fout=null,this._herkansing.herstel()}catch(t){if(this._config?.person!==e||re(t)&&this._herkansing.plan())return;this._toestand=null,this._fout=Au(t?.code,t?.message)}}async _roep(e){if(!(!this.hass||this._bezig)){this._bezig=!0;try{let t=await this.hass.callWS(e);t&&typeof t=="object"&&(this._toestand=t,this._fout=null)}catch(t){this._toon(t?.message??"De opdracht is niet gelukt.")}finally{this._bezig=!1}}}async _openEditor(e){if(this._bevestigVoor=null,this._editorVoor=e,!!this.hass)try{this._entiteiten=await this.hass.callWS({type:xe.entities})}catch(t){this._entiteiten=null,console.warn(`${$t}: entiteitenlijst ophalen mislukt: ${t?.message??t}`)}}_sluitEditor(){this._editorVoor=void 0}_toon(e){this._tijdelijkeMelding=e,clearTimeout(this._meldingTimer),this._meldingTimer=setTimeout(()=>{this._tijdelijkeMelding=null},6e3)}_person(){return this._config?.person}_zetAan(e,t){this._roep({type:xe.setEnabled,person:this._person(),alarm_id:e.id,enabled:t})}_verwijder(e){this._bevestigVoor=null,this._roep({type:xe.delete,person:this._person(),alarm_id:e.id})}_begrepen(e){this._roep({type:xe.clearMessage,person:this._person(),alarm_id:e.id})}async _stopAlles(e){for(let t of e)await this._roep({type:xe.stop,person:this._person(),alarm_id:t})}_stop(){return this._toestand?Lu(this._toestand.alarms,this._toestand.ringing):null}render(){if(!this._config)return A;let e=this._config.person,t=!!(e&&this.hass?.states?.[e]),n=Eu(e,t);if(n.soort!=="ok")return this._mededeling(n.tekst,n.isFout);if(this._fout)return this._mededeling(this._fout,!0);if(!this._toestand)return this._mededeling("Wekkers ophalen\u2026",!1);let i=this._stop();return this._editorVoor!==void 0&&!i?z`<div class="card surface">
        <domotiapp-alarm-editor
          .hass=${this.hass}
          .person=${this._config.person}
          .wekker=${this._editorVoor}
          .entiteiten=${this._entiteiten}
          @editor-dicht=${()=>this._sluitEditor()}
          @editor-opgeslagen=${r=>{this._toestand=r.detail.toestand,this._sluitEditor()}}
        ></domotiapp-alarm-editor>
      </div>`:z`<div class="card surface">
      ${i?this._stopknop(i):this._lijst()}
      ${this._tijdelijkeMelding?z`<div class="onderrij">
            ${Mi(Tu,"icoon klein")}
            <span class="boodschap">${this._tijdelijkeMelding}</span>
          </div>`:A}
    </div>`}_mededeling(e,t){return z`<div class="card surface">
      <div class="mededeling ${t?"fout":""}">${e}</div>
    </div>`}_stopknop(e){return z`<button
      class="stopknop"
      @click=${()=>this._stopAlles(e.ids)}
    >
      <div class="stop-tijd">${e.tijd}</div>
      <div class="stop-naam">${e.naam}</div>
      <div class="stop-woord">${Su}</div>
    </button>`}_lijst(){let e=this._toestand.alarms??[],t=Date.now();return z`
      <div class="kop ${e.length===0?"leeg":""}">
        <span class="volgende">${Du(this._toestand)}</span>
        <button
          class="icoonknop"
          title="Wekker toevoegen"
          aria-label="Wekker toevoegen"
          @click=${()=>this._openEditor(null)}
        >
          ${Mi(kv)}
        </button>
      </div>
      ${e.map(n=>this._rij(n,t))}
    `}_bevestiging(e){return z`<div class="onderrij bevestiging">
      <span class="boodschap">${mu(e)}</span>
      <button
        class="tekstknop"
        @click=${()=>{this._bevestigVoor=null}}
      >
        Annuleren
      </button>
      <button class="tekstknop gevaar" @click=${()=>this._verwijder(e)}>
        Verwijderen
      </button>
    </div>`}_rij(e,t){let n=Nu(e),i=!!e.enabled;return z`
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
            <div class="sub">${Mu(e,t)}</div>
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
          ${Mi(xv)}
        </button>
      </div>
      ${this._bevestigVoor===e.id?this._bevestiging(e):A}
      ${n?z`<div class="onderrij ${n.isFout?"fout":""}">
            ${Mi(n.isFout?wv:Tu,"icoon klein")}
            <span class="boodschap">${n.tekst}</span>
            <button class="tekstknop" @click=${()=>this._begrepen(e)}>
              Begrepen
            </button>
          </div>`:A}
    `}};j(In,"properties",{hass:{attribute:!1},_config:{state:!0},_toestand:{state:!0},_fout:{state:!0},_bevestigVoor:{state:!0},_bezig:{state:!0},_tijdelijkeMelding:{state:!0},_editorVoor:{state:!0},_entiteiten:{state:!0}}),j(In,"styles",[ye,ge`
    /* unsafeCSS en niet de constante rechtstreeks: lit weigert een gewone
       string in een css-template en gooit dan — op modulescope, wat SPEC 19.4
       verbiedt. De waarde is onze eigen constante en komt nergens van buiten. */
    :host {
      --domotiapp-accent: var(--dac-accent-hi, ${Oe($i)});
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
      background: var(--dac-veld);
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
  `]);var Qt=class Qt extends je(oe,{alleenMeten:!0}){constructor(){super(...arguments);j(this,"_label",t=>({person:"Persoon",bare:"Achtergrond weglaten"})[t.name]??t.name)}setConfig(t){this._config={...t}}render(){return!this._config||!this.hass?A:z`
      <div class="uitleg">
        Elke persoon heeft zijn eigen wekkerlijst. De kaart toont alleen de
        wekkers van de gekozen persoon.
      </div>
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${Qt._SCHEMA}
        .computeLabel=${this._label}
        @value-changed=${this._gewijzigd}
      ></ha-form>
    `}_gewijzigd(t){t.stopPropagation();let n={...this._config,...t.detail.value};this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:n},bubbles:!0,composed:!0}))}};j(Qt,"properties",{hass:{attribute:!1},_config:{state:!0}}),j(Qt,"styles",[ye,ge`
    .uitleg {
      padding: 0 0 12px 0;
      color: var(--dac-ink-2);
      font-size: 11.5px;
    }
  `]),j(Qt,"_SCHEMA",[{name:"person",required:!0,selector:{entity:{filter:{domain:"person"}}}},{name:"bare",selector:{boolean:{}}}]);var qs=Qt;H($t,In);H(Ws,qs);H(pu,Xt);Mt({type:$t,name:hu,description:`Wekkerkaart van DomotiApp (v${vv}).`,preview:!1,documentationURL:uu});var Vn=a=>typeof a=="string"&&(a.includes("{{")||a.includes("{%"));function _v(a){return a==null?"":typeof a=="string"?a.trim():Array.isArray(a)?a.join(", "):typeof a=="object"?JSON.stringify(a):String(a)}function yv(a,e,t,n){let i=!1,r=null,o=a?.connection;return o?.subscribeMessage?(o.subscribeMessage(s=>{if(!i){if(s?.error){n("",String(s.error));return}n(_v(s?.result),null)}},{type:"render_template",template:e,variables:t??{},report_errors:!0}).then(s=>{if(i){try{s()}catch{}return}r=s}).catch(s=>{i||n("",String(s?.message??s))}),()=>{i=!0;try{r?.()}catch{}r=null}):(n("",null),()=>{})}var Ni=class{constructor(e){this.bijWijziging_=e,this.velden_=new Map}zet(e,t,n){let i=JSON.stringify(n??{});for(let[r,o]of Object.entries(t)){let s=`${i}\0${o??""}`,l=this.velden_.get(r);if(!Vn(o)){l&&(l.opzeggen(),this.velden_.delete(r));continue}if(l?.sleutel===s)continue;l?.opzeggen();let d={sleutel:s,waarde:"",fout:null,opzeggen:()=>{}};this.velden_.set(r,d),d.opzeggen=yv(e,o,n,(c,p)=>{d.waarde===c&&d.fout===p||(d.waarde=c,d.fout=p,this.bijWijziging_())})}for(let r of[...this.velden_.keys()])r in t||(this.velden_.get(r).opzeggen(),this.velden_.delete(r))}waarde(e,t){let n=this.velden_.get(e);return n?n.waarde:Vn(t)?"":t??""}fout(e){return this.velden_.get(e)?.fout??null}fouten(){let e=[];for(let[t,n]of this.velden_)n.fout&&e.push(`${t}: ${n.fout}`);return e}stop(){for(let e of this.velden_.values())e.opzeggen();this.velden_.clear()}};var jv="domotiapp-template-badge",Iu="domotiapp-template-badge-editor",zv=["icon","content","label","tone"],Ou=a=>{let e=String(a?.tone_template??"").trim();return e||(a?.tone??a?.color??"")},Di=class extends S{validate(e){return{...e}}watched(){let e=this.config?.entity?[this.config.entity]:[];if(he(this.config)==="lights")for(let t of Object.keys(this.hass?.states??{}))t.startsWith("light.")&&e.push(t);return e}lampen_(){return he(this.config)!=="lights"?null:Nl(this.hass?.states,this.config.light_exclude)}template(){let e=this.config;return e.bare&&this.setAttribute("bare",""),(e.tap_action?.action??"standaard")!=="none"||this.setAttribute("stil",""),`
      <button class="badge" type="button">
        <span class="ico"></span>
        <span class="info">
          <span class="label"></span>
          <span class="content"></span>
        </span>
      </button>`}wire(){this.sjablonen_=new Ni(()=>this.paint()),this.teardown_.push(()=>this.sjablonen_.stop());let e=this.$(".badge");this.teardown_.push(B(e,{onTap:()=>this.doe_("tap_action"),onHold:()=>this.doe_("hold_action"),onDouble:()=>this.doe_("double_tap_action")}))}doe_(e){let t=this.config,n=t[e]??(e==="tap_action"&&t.entity?pt(t.entity):null);n&&de(this,this.hass,t,n)}toon_(e){let t=this.config,n=he(t),i="var(--dac-ink-3)",r="var(--dac-accent-hi)";if(n==="energy")return Dt(Ol(e?.band,t))??i;if(n==="alarm")return e?.stand?Dt(Rl(e.stand,t))??r:r;let o=Dt(this.sjablonen_.waarde("tone",Ou(t))),s=this.lampen_();if(s)return s.length?o??Dl(this.hass?.states,s,this.licht_)??"var(--dac-lit)":i;if(o)return o;let l=t.entity,d=k(this.hass,l);return d?l.startsWith("light.")?Z(d)?qn(d,this.licht_)??"var(--dac-lit)":i:Ml(l)?Z(d)?r:i:r:r}uitkomst_(){let e=this.config,t=he(e),n=k(this.hass,e.entity);if(t==="energy"){let i=Ll(n);return i?{tekst:i.tekst,band:Tl(i.watt,e),icoon:"bolt"}:{tekst:n?te(this.hass,n):"Geen sensor",band:null,icoon:"bolt"}}if(t==="alarm"){if(!n)return{tekst:"Geen entiteit",stand:null,icoon:"shield"};let{waarde:i,stand:r}=Cl(n,e);if(e.alarm_attribute&&!i)return{tekst:"Attribuut ontbreekt",stand:null,icoon:"shield"};let o=e.alarm_attribute?i:te(this.hass,n);return{tekst:r?.tekst??o,stand:r,icoon:r?.icoon??"shield",ruw:i}}return null}paint(){let e=this.config,t=Object.fromEntries(zv.map(h=>[h,e[h]]));t.icon=nr(e),t.tone=Ou(e);let n=he(e),i=this.lampen_(),r=this.uitkomst_();n&&delete t.content,r&&delete t.tone,this.sjablonen_.zet(this.hass,t,{entity:e.entity??"",user:this.hass?.user?.name??""});let o=this.sjablonen_.fouten();this.toggleAttribute("fout",o.length>0);let s=this.sjablonen_.waarde("label",e.label),l=o.length?"Sjabloonfout":i?String(i.length):r?r.tekst:this.sjablonen_.waarde("content",e.content);this.text(".label",s),this.text(".content",l),this.$(".badge").title=o.length?o.join(`
`):i?.length?i.map(h=>this.hass.states[h]?.attributes?.friendly_name??h).join(`
`):r?.ruw&&r.ruw!==r.tekst?`${r.tekst} (${r.ruw})`:e.label??"";let d=(s?1:0)+(l?1:0);this.setAttribute("regels",String(d)),this.$(".badge").style.setProperty("--tone",this.toon_(r));let c=this.$(".ico"),p=o.length?"warning":this.sjablonen_.waarde("icon",nr(e))||(i?"bulb":"")||(r?.icoon??"");c.dataset.icon!==p&&(c.dataset.icon=p,c.innerHTML=p?v(p):"")}getCardSize(){return 1}static getConfigElement(){return document.createElement(Iu)}static getStubConfig(e,t){let n=t?.find(i=>i.startsWith("light."));return n?{entity:n,label:"Lamp",icon:"bulb",content:"{% if is_state(entity, 'on') %}Aan{% else %}Uit{% endif %}"}:{label:"Lampen aan",icon:"bulb",content:"{{ states.light | selectattr('state','eq','on') | list | count }}"}}};j(Di,"css",`
    :host { display: block; }

    /* De maten van Home Assistants eigen badge, nagemeten op 2026.8.1:
       36 px hoog, 18 px rond, 0 12px binnenmarge, 8 px ertussen. Een badge van
       ons staat in dezelfde rij als een van hem, dus deze getallen zijn geen
       smaak. */
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      height: 36px; padding: 0 12px;
      border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      box-shadow: var(--dac-shadow);
      cursor: pointer; font: inherit; color: inherit;
      max-width: 100%;
      /* LINKS, en dat moet er expliciet staan.
         Dit is een <button>, en de useragent-stijl van Chrome geeft die
         text-align: center. De onderste regel is meestal de breedste en valt
         daardoor niet op, maar de bovenste is kort en stond dus gecentreerd --
         wat er op een dashboard uitziet als rechts uitgelijnd. Gemeld op
         17 september 2026 met een schermafdruk: "de bovenste titel moet links
         uitgelijnd worden. Nu is dat rechts uitgelijnd."

         Waarom het een <button> BLIJFT (valkuil 43 zegt div role=button): die
         valkuil gaat over -webkit-line-clamp en hoogte in een button, en dat
         staat hier niet. Wat een echte button w\xE9l geeft en een div niet, is dat
         Enter en spatie hem bedienen. Dat is meer waard dan het vermijden van
         deze ene regel. */
      text-align: left;
      transition: background 200ms ease, border-color 200ms ease, transform 160ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) {
      .badge:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); }
    }
    .badge:active { transform: scale(.97); }
    /* Zonder actie is het geen knop en hoort hij er ook niet als een te voelen. */
    :host([stil]) .badge { cursor: default; }
    @media (hover: hover) { :host([stil]) .badge:hover { background: var(--dac-surface); border-color: var(--dac-border); } }
    :host([stil]) .badge:active { transform: none; }

    /* Achtergrond weglaten: hier gaat ook de RAND en de BINNENMARGE weg.
       Een pil zonder vulling met wel een rand is geen pil en geen tekst; en met
       binnenmarge zonder vlak staan twee badges naast elkaar 24 px uit elkaar
       zonder dat er iets tussen staat. Dit is dus bewust meer dan wat de
       schakelaar "achtergrond weglaten" op een kaart doet -- zie de kop van
       dit bestand. */
    :host([bare]) .badge {
      background: none; border-color: transparent; box-shadow: none;
      padding: 0; height: auto; min-height: 30px;
    }
    @media (hover: hover) {
      :host([bare]) .badge:hover { background: none; border-color: transparent; }
      :host([bare]) .badge:hover .ico { color: var(--tone); }
    }

    .ico {
      flex: 0 0 auto; display: flex; color: var(--tone);
      transition: color 200ms ease;
    }
    .ico .icon, .ico ha-icon {
      width: 18px; height: 18px; --mdc-icon-size: 18px;
    }
    .ico:empty { display: none; }

    /* Een afbeelding in plaats van een icoon -- een pasfoto, een logo. Rond,
       want in een pil is een vierkantje een hoek te veel. */
    .ico img {
      width: 22px; height: 22px; border-radius: 50%; object-fit: cover; display: block;
    }

    .info {
      min-width: 0; display: flex; flex-direction: column; justify-content: center;
      line-height: 1.15;
    }
    .info:empty { display: none; }

    /* Het label is de kop en de content de waarde. Dat is de volgorde waarin de
       eigenaar ze gebruikt -- "Alarm" boven "Uitgeschakeld" -- en het is ook de
       volgorde die Home Assistants eigen badge aanhoudt. */
    .label {
      font-size: 10.5px; font-weight: 500; letter-spacing: .01em;
      color: var(--dac-ink-3);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .label:empty { display: none; }

    .content {
      font-size: 13px; font-weight: 600; letter-spacing: -.01em;
      color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      font-variant-numeric: tabular-nums;
    }
    .content:empty { display: none; }

    /* Staat er maar \xE9\xE9n regel, dan mag die de maat van de badge dragen in
       plaats van klein bovenin te blijven hangen. */
    :host([regels="1"]) .label { font-size: 13px; font-weight: 600; color: var(--dac-ink); }

    /* Een kapot sjabloon zegt wat er mis is in plaats van leeg te blijven. In
       de editor typ je halverwege elke zin iets ongeldigs, dus het is geen
       alarm -- alleen een aanwijzing, in de kleur die "kritiek" betekent. */
    :host([fout]) .badge { border-color: color-mix(in srgb, var(--dac-bad) 55%, transparent); }
    :host([fout]) .ico { color: var(--dac-bad); }
    :host([fout]) .content { color: var(--dac-bad); font-weight: 500; }

    .badge:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `);var Cu=[{value:"tekst",label:"Eigen tekst (sjablonen)"},{value:"lights",label:"Lampenteller"},{value:"energy",label:"Energie"},{value:"alarm",label:"Alarm"}],Ru=({automatisch:a=!1,extra:e=""}={})=>[...a?[{value:"auto",label:"Automatisch"}]:[],...ea.map(([t,n])=>({value:t,label:n})),...e?[{value:e,label:e}]:[]],$v=a=>{let e=Dt(a);if(!e)return a;let t=ea.find(([n])=>Dt(n)===e);return t?t[0]:a},Hu=new Set(["auto",...ea.map(([a])=>a)]),Zs=class extends L{defaults(){return{tap_action:{action:"more-info"}}}setConfig(e){let t={...e};Vn(t.icon)&&!String(t.icon_template??"").trim()&&(t.icon_template=t.icon,delete t.icon),t.mode=he(t)||"tekst",delete t.light_counter,t.tone===void 0&&!String(t.tone_template??"").trim()&&t.color!==void 0&&(t.tone=t.color),delete t.color,Vn(t.tone)&&!String(t.tone_template??"").trim()&&(t.tone_template=t.tone,delete t.tone),t.tone=t.tone?$v(t.tone):"auto",super.setConfig(t)}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"shield",auto:!1}]}patch_(e,t=!1){let n=t?{...e}:{...this.config_,...e},i=he(this.config_),r=he(n);if(r!==i){e=t?n:{...e};let o=na[i]??{},s=na[r]??{};for(let l of["label","icon"])l==="icon"&&String(n.icon_template??"").trim()||(!n[l]||n[l]===o[l])&&(e[l]=s[l]);for(let[l,d]of Object.entries(s))l!=="label"&&l!=="icon"&&n[l]===void 0&&(e[l]=d)}super.patch_(e,t)}serialize(e){let t={...e};return(!Cu.some(n=>n.value===t.mode)||t.mode==="tekst")&&delete t.mode,t.tone==="auto"&&delete t.tone,delete t.light_counter,delete t.color,t}schema(){let e=this.config_??{},t=he(e),n=o=>({name:o,selector:f.select(Ru({extra:Hu.has(e[o])?"":e[o]??""}))}),i={lights:[Be("Niet meetellen","mdi:lightbulb-off-outline",[{name:"light_exclude",selector:{entity:{domain:"light",multiple:!0}}}],!0)],energy:[Be("Energie","mdi:flash",[{name:"entity",selector:f.entity(["sensor"])},Ve({name:"energy_green_max",selector:f.number(-1e6,1e6,1)},n("energy_color_low")),Ve({name:"energy_orange_max",selector:f.number(-1e6,1e6,1)},n("energy_color_mid")),n("energy_color_high")],!0)],alarm:[Be("Alarm","mdi:shield-home-outline",[{name:"entity",selector:f.entity()},{name:"alarm_attribute",selector:f.text()},Ve({name:"alarm_disarmed",selector:f.text()},n("alarm_disarmed_color")),Ve({name:"alarm_partial",selector:f.text()},n("alarm_partial_color")),Ve({name:"alarm_armed",selector:f.text()},n("alarm_armed_color"))],!0)]}[t]??[],r=t!=="energy"&&t!=="alarm";return[{name:"mode",selector:f.select(Cu)},...i,...t?[]:[{name:"entity",selector:f.entity()}],{name:"label",selector:f.multiline()},...t?[]:[{name:"content",selector:f.multiline()}],{name:"icon_template",selector:f.multiline()},...r?[{name:"tone",selector:f.select(Ru({automatisch:!0,extra:Hu.has(e.tone)?"":e.tone??""}))},{name:"tone_template",selector:f.multiline()}]:[],{name:"tap_action",selector:f.action("more-info")},{name:"hold_action",selector:f.action("none")}]}label(e){return{mode:"Soort badge",light_exclude:"Lampen die hij overslaat",entity:he(this.config_)==="energy"?"Vermogen":he(this.config_)==="alarm"?"Alarm":"Entiteit (optioneel)",energy_green_max:"Tot en met (W)",energy_color_low:"Kleur",energy_orange_max:"Daarna tot en met (W)",energy_color_mid:"Kleur",energy_color_high:"Kleur daarboven",alarm_attribute:"Status uit een attribuut (optioneel)",alarm_disarmed:"Uitgeschakeld bij",alarm_disarmed_color:"Kleur",alarm_partial:"Deels ingeschakeld bij",alarm_partial_color:"Kleur",alarm_armed:"Ingeschakeld bij",alarm_armed_color:"Kleur",label:"Bovenste regel",content:"Onderste regel",icon_template:"Icoon via een sjabloon (optioneel)",tone:"Kleur van het icoon",tone_template:"Kleur via een sjabloon (optioneel)",tap_action:"Bij tikken",hold_action:"Bij vasthouden"}[e.name]??super.label(e)}helper(e){let t=he(this.config_);return{mode:"Eigen tekst: jij bepaalt wat er staat, met sjablonen. Lampenteller: het aantal lampen dat aan staat. Energie: een vermogen met een kleur per grens. Alarm: de stand van je alarm met een kleur per stand.",light_exclude:"Bijvoorbeeld een nachtlampje dat altijd brandt. Lichtgroepen telt hij sowieso niet mee, anders telt een lamp in een groep dubbel.",entity:t==="energy"?"De sensor met het vermogen, in W of kW. De grenzen hieronder zijn in watt: tot en met de eerste grens krijgt de eerste kleur (terugleveren ook), tot en met de tweede de tweede, en daarboven de derde.":t==="alarm"?"Het alarm. Vul hieronder bij elke stand in welke status daarbij hoort; meerdere mogen, met een komma ertussen. Hoofdletters maken niet uit.":"Alleen nodig als de badge iets van \xE9\xE9n ding laat zien. In de sjablonen hieronder is hij beschikbaar als `entity`, zodat je `states(entity)` kunt schrijven.",alarm_attribute:"Leeg laten: de toestand van het alarm zelf (disarmed, armed_away...). Staat de status bij jouw alarm in een attribuut, zet hier de naam van dat attribuut.",label:"De kleine regel bovenin, bijvoorbeeld Alarm of Vaatwasser. Mag een sjabloon zijn.",content:"De dikke regel eronder: wat er op dit moment aan de hand is. Hier hoort het sjabloon, bijvoorbeeld {% if is_state(entity, 'on') %}Rook!{% else %}Geen rook{% endif %}.",icon_template:"Alleen invullen als het icoon per toestand moet verschillen. Onze eigen iconen heten dai:, die van Home Assistant mdi: \u2014 bijvoorbeeld {% if is_state(entity,'on') %}dai:alarmOn{% else %}dai:alarmOff{% endif %}. De naam die je nodig hebt staat onder het icoon in de kiezer hierboven. Staat hier iets, dan wint het van het gekozen icoon.",tone:t==="lights"?"Automatisch: de kleur van de lampen die branden, en grijs als alles uit is.":"Automatisch: blauw, en gedempt als het apparaat uit staat. Een lamp krijgt de kleur die hij maakt.",tone_template:"Voor een kleur die meebeweegt, bijvoorbeeld {% if is_state(entity, 'on') %}rood{% else %}groen{% endif %}. Kent de namen uit de lijst hierboven, en ook red, orange, amber en #ff8800. Staat hier iets, dan wint het van de keuze erboven.",hold_action:"Wat er gebeurt als je hem ingedrukt houdt. Laat op Geen actie staan als je niets wilt."}[e.name]}};O(Iu,Zs);Yn(jv,Di,{name:"DomotiApp Badge",description:"Een pil in de kop van je view: icoon, een kop en een waarde. Alle drie mogen een sjabloon zijn, en de achtergrond kan er helemaal af."});var Ev="domotiapp-terug-badge",Vu="domotiapp-terug-badge-editor",Li=class extends S{validate(e){return{icon:"arrowLeft",...e}}watched(){return[]}template(){return this.config.bare&&this.setAttribute("bare",""),`
      <button class="badge" type="button">
        <span class="ico"></span>
        <span class="tekst"></span>
      </button>`}wire(){this.teardown_.push(B(this.$(".badge"),{onTap:()=>this.terug_()}))}terug_(){let e=ta(this.config);if(e.soort==="geschiedenis"){history.back();return}de(this,this.hass,this.config,{action:"navigate",navigation_path:e.pad})}paint(){let e=this.config,t=e.icon||"arrowLeft",n=this.$(".ico");n.dataset.icon!==t&&(n.dataset.icon=t,n.innerHTML=v(t,"arrowLeft")),this.text(".tekst",e.label??""),this.$(".badge").title=e.label||(this.config.path?`Naar ${this.config.path}`:"Terug")}getCardSize(){return 1}static getConfigElement(){return document.createElement(Vu)}static getStubConfig(){return{icon:"arrowLeft",label:"Terug"}}};j(Li,"css",`
    :host { display: block; }

    /* Dezelfde maten als de sjabloonbadge en als die van Home Assistant zelf:
       36px hoog, 18px rond. Een terugknop staat naast de andere badges in de
       kop, en dan is twee pixels verschil een knop die uit de rij loopt. */
    .badge {
      display: inline-flex; align-items: center; gap: 8px;
      height: 36px; padding: 0 12px;
      border-radius: var(--dac-radius-pill);
      background: var(--dac-surface);
      border: 1px solid var(--dac-border);
      box-shadow: var(--dac-shadow);
      cursor: pointer; font: inherit; color: inherit;
      text-align: left;
      transition: background 200ms ease, border-color 200ms ease, transform 160ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    @media (hover: hover) {
      .badge:hover { background: var(--dac-surface-hi); border-color: var(--dac-border-hi); }
      .badge:hover .ico { color: var(--dac-accent-hi); }
    }
    .badge:active { transform: scale(.97); }

    /* Achtergrond weglaten haalt ook de rand en de binnenmarge weg -- zie de
       kop van template-badge.js voor waarom dat op een badge meer is dan op
       een kaart. Een knop zonder vlak naast een knop zonder vlak hoort geen
       24px lucht tussen zich te hebben waar niets staat. */
    :host([bare]) .badge {
      background: none; border-color: transparent; box-shadow: none;
      padding: 0; height: auto; min-height: 30px;
    }
    @media (hover: hover) {
      :host([bare]) .badge:hover { background: none; border-color: transparent; }
    }

    .ico { flex: 0 0 auto; display: flex; color: var(--dac-ink-2); transition: color 200ms ease; }
    .ico .icon, .ico ha-icon { width: 18px; height: 18px; --mdc-icon-size: 18px; }

    .tekst {
      min-width: 0; font-size: 13px; font-weight: 600; letter-spacing: -.01em;
      color: var(--dac-ink);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .tekst:empty { display: none; }

    .badge:focus-visible { outline: 2px solid var(--dac-accent-hi); outline-offset: 2px; }
  `);var Ys=class extends L{defaults(){return{icon:"arrowLeft"}}pickers(){return[{key:"icon",kind:"icon",label:"Icoon",fallback:"arrowLeft",auto:!1}]}schema(){return[{name:"path",selector:f.text()},{name:"label",selector:f.text()}]}label(e){return{path:"Waar gaat hij heen",label:"Tekst ernaast (optioneel)"}[e.name]??super.label(e)}helper(e){return{path:"Het pad waar je altijd op uitkomt, bijvoorbeeld /dashboard/thuis. Begint het met een # dan opent hij een pop-up op de huidige view. Laat je het leeg, dan gaat hij \xE9\xE9n stap terug in de geschiedenis \u2014 net als de terugknop van je browser.",label:"Laat leeg voor alleen het pijltje. Dat is meestal genoeg en het scheelt breedte in de kop."}[e.name]}};O(Vu,Ys);Yn(Ev,Li,{name:"DomotiApp Terug",description:"Een pijltje terug in de kop van je view: naar een vaste plek die je zelf opgeeft, of \xE9\xE9n stap terug als je niets invult."});var Av=["image/png","image/jpeg","image/gif","image/webp","image/svg+xml"];function Bu(a){return`/api/image/serve/${a}/original`}function Pu(a){return a?Av.includes(a.type)?a.size>12582912?`Deze afbeelding is ${Math.round(a.size/1024/1024)} MB. Home Assistant neemt er tot ${12582912/1024/1024} MB aan.`:null:"Kies een afbeelding: PNG, JPEG, GIF, WebP of SVG.":"Geen bestand gekozen."}var Sv=`
  ${U}
  :host { ${W} display: block; font-family: var(--dac-font); color: var(--dac-ink); }
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
`,Xs=class extends HTMLElement{static get sheet_(){return Object.hasOwn(this,"s_")||(this.s_=Q(Sv)),this.s_}constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.adoptedStyleSheets=[this.constructor.sheet_]}connectedCallback(){F(this,{alleenMeten:!0}),this.gebouwd_||this.bouw_(),this.teken_()}set value(e){this.value_=e??"",this.gebouwd_&&this.teken_()}get value(){return this.value_??""}set label(e){this.label_=e,this.gebouwd_&&this.teken_()}$(e){return this.shadowRoot.querySelector(e)}bouw_(){this.shadowRoot.innerHTML=`
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
      <input type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" />`,this.gebouwd_=!0;let e=this.$('input[type="file"]');this.$(".kies").addEventListener("click",()=>e.click()),e.addEventListener("change",()=>{let n=e.files?.[0];e.value="",this.upload_(n)}),this.$(".leeg").addEventListener("click",()=>this.zet_(""));let t=this.$('input[type="text"]');t.addEventListener("change",()=>this.zet_(t.value.trim()))}teken_(){this.$(".kop").textContent=this.label_??"Afbeelding";let e=this.$('input[type="text"]');!(this.shadowRoot.activeElement===e)&&e.value!==this.value&&(e.value=this.value);let n=this.$(".voorbeeld");if(this.value){if(n.dataset.bron!==this.value){n.dataset.bron=this.value;let i=document.createElement("img");i.src=this.value,i.alt="",i.onerror=()=>{n.dataset.bron="",n.innerHTML=v("car")},n.replaceChildren(i)}}else n.dataset.bron!==""&&(n.dataset.bron="",n.innerHTML=v("car"))}zet_(e){this.value_=e,this.teken_(),this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}melding_(e,t=!1){let n=this.$(".melding");n.textContent=e,n.dataset.fout=String(t),n.hidden=!e}async upload_(e){let t=Pu(e);if(t)return this.melding_(t,!0);this.melding_("Bezig met uploaden\u2026"),this.$(".kies").disabled=!0;try{let n=new FormData;n.append("file",e);let i=this.hass?.auth?.data?.access_token??this.hass?.auth?.accessToken,r=await fetch("/api/image/upload",{method:"POST",body:n,headers:i?{Authorization:`Bearer ${i}`}:{}});if(!r.ok)throw new Error(`Home Assistant antwoordde met ${r.status}`);let o=await r.json();if(!o?.id)throw new Error("Home Assistant gaf geen id terug.");this.zet_(Bu(o.id)),this.melding_("Ge\xFCpload.")}catch(n){this.melding_(`${n?.message??"Uploaden lukte niet"}. Je kunt het pad ook zelf intypen, bijvoorbeeld /local/auto.png.`,!0)}finally{this.$(".kies").disabled=!1}}};H("dac-foto-picker",Xs);var Mv="0.57.1";yl(a=>console.warn(`domotiapp-lovelace: ${a}`));cl({eigenUrl:import.meta.url});console.info(`%c DOMOTIAPP-LOVELACE %c ${Mv} `,"background:#026fa1;color:#e8e4de;font-weight:600;border-radius:3px 0 0 3px;padding:2px 6px","background:#12120f;color:#e8e4de;border-radius:0 3px 3px 0;padding:2px 6px");export{Mv as VERSION};
