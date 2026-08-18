/**
 * Een testdubbel voor Home Assistant's `ha-form`.
 *
 * Alleen voor de werkbank. Zonder dit kan geen enkele editor buiten Home
 * Assistant gebouwd worden -- ze wachten allemaal op
 * `customElements.whenDefined("ha-form")`, en die belofte wordt hier nooit
 * ingelost. Daardoor was precies het deel dat een installateur het meest
 * gebruikt het enige deel dat nooit werd getest.
 *
 * Dit is bewust geen namaak van het echte ding: het rendert simpele velden en
 * het vuurt `value-changed` met de hele data, want dat is het contract waar de
 * editors op leunen. Wat het niet nadoet -- de zoekfunctie van de
 * entiteitkiezer, de vertalingen, de opmaak -- doet er voor die test niet toe.
 *
 * Eén ding is nagekeken in de bron in plaats van aangenomen, omdat er een halve
 * dag op verkeerd gegokt is: `ha-form` houdt zijn eigen waarde WEL bij. Zie
 * `frontend/src/components/ha-form/ha-form.ts`, in `addValueChangedListener`:
 *
 *     this.data = { ...this.data, ...newValue };
 *     fireEvent(this, "value-changed", { value: this.data });
 *
 * Het werkt zijn eigen `data` dus bij en meldt daarna pas. De editor hoeft niets
 * terug te schrijven, en moet dat tijdens het typen juist niet doen.
 */

class HaFormStub extends HTMLElement {
  set hass(v) {
    this.hass_ = v;
  }
  get hass() {
    return this.hass_;
  }

  set schema(v) {
    this.schema_ = v ?? [];
    this.render_();
  }
  get schema() {
    return this.schema_;
  }

  set data(v) {
    this.data_ = { ...(v ?? {}) };
    this.render_();
  }
  get data() {
    return this.data_;
  }

  connectedCallback() {
    this.render_();
  }

  /** Alle velden plat, ook die in een raster of uitklapblok zitten. */
  flat_(schema = this.schema_ ?? []) {
    return schema.flatMap((s) =>
      s.type === "grid" || s.type === "expandable" ? this.flat_(s.schema ?? []) : [s]
    );
  }

  render_() {
    if (!this.isConnected || !this.schema_) return;
    this.replaceChildren();

    for (const s of this.flat_()) {
      const wrap = document.createElement("label");
      wrap.style.cssText = "display:flex;gap:8px;align-items:center;font-size:12px;margin:4px 0";
      const naam = document.createElement("span");
      naam.style.cssText = "min-width:150px;color:#9a9a94";
      naam.textContent = this.computeLabel?.(s) ?? s.name;

      const sel = s.selector ?? {};
      let veld;

      if (sel.boolean) {
        veld = document.createElement("input");
        veld.type = "checkbox";
        veld.checked = Boolean(this.data_?.[s.name]);
        veld.addEventListener("change", () => this.emit_(s.name, veld.checked));
      } else if (sel.entity?.multiple) {
        veld = document.createElement("input");
        veld.type = "text";
        veld.placeholder = "entity1,entity2";
        veld.value = (this.data_?.[s.name] ?? []).join(",");
        veld.addEventListener("change", () =>
          this.emit_(s.name, veld.value.split(",").map((x) => x.trim()).filter(Boolean))
        );
      } else if (sel.entity) {
        // Eén entiteit: het echte ding is een zoekveld, hier een keuzelijst uit
        // de nagemaakte staten. Genoeg om een editor te kunnen bedienen.
        veld = document.createElement("select");
        const leeg = document.createElement("option");
        leeg.value = "";
        leeg.textContent = "—";
        veld.appendChild(leeg);
        for (const id of Object.keys(this.hass_?.states ?? {})) {
          const opt = document.createElement("option");
          opt.value = id;
          opt.textContent = id;
          veld.appendChild(opt);
        }
        veld.value = this.data_?.[s.name] ?? "";
        veld.addEventListener("change", () => this.emit_(s.name, veld.value || undefined));
      } else if (sel.select) {
        veld = document.createElement("select");
        for (const o of sel.select.options ?? []) {
          const opt = document.createElement("option");
          opt.value = String(o.value ?? o);
          opt.textContent = String(o.label ?? o);
          veld.appendChild(opt);
        }
        veld.value = String(this.data_?.[s.name] ?? "");
        veld.addEventListener("change", () => this.emit_(s.name, veld.value));
      } else if (sel.ui_action) {
        // Het echte ding vult zichzelf met de standaard. Dat nadoen is juist
        // het punt: daar kwam {action:"none"} vandaan.
        veld = document.createElement("select");
        for (const a of ["toggle", "more-info", "navigate", "none"]) {
          const opt = document.createElement("option");
          opt.value = a;
          opt.textContent = a;
          veld.appendChild(opt);
        }
        veld.value = this.data_?.[s.name]?.action ?? sel.ui_action.default_action ?? "none";
        veld.addEventListener("change", () => this.emit_(s.name, { action: veld.value }));
      } else {
        veld = document.createElement("input");
        veld.type = sel.number ? "number" : "text";
        veld.value = this.data_?.[s.name] ?? "";
        veld.addEventListener("change", () =>
          this.emit_(s.name, sel.number ? Number(veld.value) : veld.value)
        );
      }

      veld.dataset.veld = s.name;
      wrap.append(naam, veld);
      this.appendChild(wrap);
    }
  }

  emit_(naam, waarde) {
    this.data_ = { ...this.data_, [naam]: waarde };
    this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value: this.data_ },
        bubbles: true,
        composed: true,
      })
    );
  }
}

if (!customElements.get("ha-form")) customElements.define("ha-form", HaFormStub);
