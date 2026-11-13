import { UmbLitElement as te } from "@umbraco-cms/backoffice/lit-element";
import { nothing as ie, repeat as I, html as y, css as se, state as b, customElement as re } from "@umbraco-cms/backoffice/external/lit";
import { UMB_DATA_TYPE_WORKSPACE_CONTEXT as ae } from "@umbraco-cms/backoffice/data-type";
import { UMB_PROPERTY_DATASET_CONTEXT as ne } from "@umbraco-cms/backoffice/property";
import { UmbId as oe } from "@umbraco-cms/backoffice/id";
var le = Object.defineProperty, ue = Object.getOwnPropertyDescriptor, W = (e) => {
  throw TypeError(e);
}, v = (e, t, i, s) => {
  for (var r = s > 1 ? void 0 : s ? ue(t, i) : t, o = e.length - 1, l; o >= 0; o--)
    (l = e[o]) && (r = (s ? l(t, i, r) : l(r)) || r);
  return s && r && le(t, i, r), r;
}, z = (e, t, i) => t.has(e) || W("Cannot " + i), p = (e, t, i) => (z(e, t, "read from private field"), i ? i.call(e) : t.get(e)), g = (e, t, i) => t.has(e) ? W("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), f = (e, t, i, s) => (z(e, t, "write to private field"), t.set(e, i), i), n = (e, t, i) => (z(e, t, "access private method"), i), _, m, A, a, E, L, V, R, T, U, B, D, w, G, M, K, d, X, Y, N, H, F, S, Z, q;
const J = "responsiveLayouts", C = 24;
let c = class extends te {
  constructor() {
    super(), g(this, a), g(this, _), this._layouts = [], this._areas = [], this._baseColumns = 12, g(this, m, 12), g(this, A), g(this, d), this.consumeContext(ae, async (e) => {
      this.observe(
        await e?.propertyValueByAlias("gridColumns"),
        (t) => {
          f(this, m, t ? parseInt(t, 10) : 12), this._areaColumnsConfig = [
            { alias: "placeholder", value: p(this, m) },
            { alias: "min", value: 1 }
          ], this._areasConfig = [{ alias: "defaultAreaGridColumns", value: p(this, m) }], n(this, a, E).call(this);
        },
        "observeGridColumns"
      );
    }).passContextAliasMatches(), this.consumeContext(ne, async (e) => {
      f(this, _, e), this.observe(
        await e?.propertyValueByAlias(J),
        (t) => this._layouts = t ?? [],
        "observeLayouts"
      ), this.observe(
        await e?.propertyValueByAlias("areas"),
        (t) => this._areas = t ?? [],
        "observeAreas"
      ), this.observe(
        await e?.propertyValueByAlias("areaGridColumns"),
        (t) => {
          const i = typeof t == "string" ? parseInt(t, 10) : t;
          f(this, A, i && i > 0 ? i : void 0), n(this, a, E).call(this);
        },
        "observeAreaGridColumns"
      );
    });
  }
  render() {
    return this._areasConfig ? y`<uui-box headline="Areas">
          <umb-property
            label=${this.localize.term("blockEditor_areasLayoutColumns")}
            alias="areaGridColumns"
            property-editor-ui-alias="Umb.PropertyEditorUi.Integer"
            .config=${this._areaColumnsConfig}></umb-property>
          <umb-property
            label=${this.localize.term("blockEditor_areasConfigurations")}
            alias="areas"
            property-editor-ui-alias="Umb.PropertyEditorUi.BlockGridAreasConfig"
            .config=${this._areasConfig}></umb-property>
          <umb-property-layout
            label="Layouts"
            description="The areas above are the base layout (${this._baseColumns} columns). Each extra layout resizes and reorders them.">
            <div slot="editor">
              ${I(
      this._layouts,
      (e) => e.key,
      (e) => n(this, a, q).call(this, e)
    )}
              <uui-button look="placeholder" label="Add layout" @click=${n(this, a, V)}></uui-button>
            </div>
          </umb-property-layout>
        </uui-box>` : ie;
  }
};
_ = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
A = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
E = function() {
  this._baseColumns = p(this, A) ?? p(this, m);
};
L = function(e) {
  p(this, _)?.setPropertyValue(J, e);
};
V = function() {
  const e = this._layouts[this._layouts.length - 1]?.columns ?? this._baseColumns, t = Math.max(1, e - 3);
  n(this, a, L).call(this, [...this._layouts, { key: oe.new(), identifier: String(t), columns: t }]);
};
R = function(e) {
  n(this, a, L).call(this, this._layouts.filter((t) => t.key !== e)), n(this, a, D).call(this, this._areas.map((t) => {
    if (!t.responsiveLayouts?.[e]) return t;
    const { [e]: i, ...s } = t.responsiveLayouts;
    return { ...t, responsiveLayouts: s };
  }));
};
T = function(e, t) {
  n(this, a, L).call(this, this._layouts.map((i) => i.key === e ? { ...i, ...t } : i));
};
U = function(e, t) {
  const i = t.target.value.replace(/[^A-Za-z0-9_-]/g, ""), s = { identifier: i }, r = parseInt(i, 10);
  r >= 1 && (s.columns = Math.min(C, r)), n(this, a, T).call(this, e.key, s);
};
B = function(e, t) {
  const i = parseInt(t.target.value, 10), s = Math.max(1, Math.min(C, i || 1));
  n(this, a, T).call(this, e.key, { columns: s });
};
D = function(e) {
  p(this, _)?.setPropertyValue("areas", e);
};
w = function(e, t, i) {
  const s = e.responsiveLayouts?.[i.key];
  return {
    columnSpan: Math.min(s?.columnSpan ?? e.columnSpan ?? i.columns, i.columns),
    rowSpan: s?.rowSpan ?? e.rowSpan ?? 1,
    order: s?.order ?? t + 1
  };
};
G = function(e, t, i, s, r) {
  const o = parseInt(r.target.value, 10), l = s === "columnSpan" ? e.columns : s === "order" ? this._areas.length : C, u = Math.max(1, Math.min(l, o || 1));
  n(this, a, M).call(this, e, /* @__PURE__ */ new Map([[t.key, { [s]: u }]]));
};
M = function(e, t) {
  n(this, a, D).call(this, this._areas.map((i, s) => {
    const r = t.get(i.key);
    if (!r) return i;
    const o = { ...n(this, a, w).call(this, i, s, e), ...r };
    return { ...i, responsiveLayouts: { ...i.responsiveLayouts, [e.key]: o } };
  }));
};
K = function(e, t, i, s) {
  e.preventDefault();
  const r = e.currentTarget, o = r.closest(".area"), l = o.parentElement, u = n(this, a, w).call(this, i, s, t), h = l.clientWidth / t.columns, Q = o.offsetHeight / u.rowSpan, j = e.clientX, ee = e.clientY;
  let $ = u.columnSpan, k = u.rowSpan;
  r.setPointerCapture(e.pointerId);
  const O = (P) => {
    $ = Math.max(1, Math.min(t.columns, Math.round(u.columnSpan + (P.clientX - j) / h))), k = Math.max(1, Math.min(C, Math.round(u.rowSpan + (P.clientY - ee) / Q))), o.style.gridColumn = `span ${$}`, o.style.gridRow = `span ${k}`;
  }, x = () => {
    r.removeEventListener("pointermove", O), r.removeEventListener("pointerup", x), r.removeEventListener("pointercancel", x), ($ !== u.columnSpan || k !== u.rowSpan) && n(this, a, M).call(this, t, /* @__PURE__ */ new Map([[i.key, { columnSpan: $, rowSpan: k }]]));
  };
  r.addEventListener("pointermove", O), r.addEventListener("pointerup", x), r.addEventListener("pointercancel", x);
};
d = /* @__PURE__ */ new WeakMap();
X = function(e, t, i) {
  f(this, d, { layoutKey: t.key, areaKey: i.key }), e.dataTransfer?.setData("text/plain", i.key), e.dataTransfer && (e.dataTransfer.effectAllowed = "move");
};
Y = function(e, t) {
  p(this, d)?.layoutKey === t.key && (e.preventDefault(), e.currentTarget.classList.add("drop-target"));
};
N = function(e) {
  e.currentTarget.classList.remove("drop-target");
};
H = function(e, t, i) {
  e.preventDefault(), e.currentTarget.classList.remove("drop-target");
  const s = p(this, d);
  if (f(this, d, void 0), s?.layoutKey !== t.key || s.areaKey === i.key) return;
  const r = this._areas.map((u, h) => ({ area: u, order: n(this, a, w).call(this, u, h, t).order })).sort((u, h) => u.order - h.order).map((u) => u.area.key), o = r.indexOf(s.areaKey), l = r.indexOf(i.key);
  r.splice(l, 0, r.splice(o, 1)[0]), n(this, a, M).call(this, t, new Map(r.map((u, h) => [u, { order: h + 1 }])));
};
F = function() {
  f(this, d, void 0);
};
S = function(e, t, i, s, r, o) {
  const l = `${s}-${e.key}-${t.key}`;
  return y`<span class="number">
      <uui-label for=${l}>${r}</uui-label>
      <uui-input
        id=${l}
        type="number"
        min="1"
        label="${r} for ${t.alias ?? "area"} in layout ${e.identifier}"
        .value=${String(o)}
        @change=${(u) => n(this, a, G).call(this, e, t, i, s, u)}></uui-input>
    </span>`;
};
Z = function(e) {
  const t = Math.max(this._baseColumns, ...this._layouts.map((s) => s.columns)), i = e.columns / t * 100;
  return y`<div class="layout-grid" style="width:${i}%; grid-template-columns: repeat(${e.columns}, minmax(0, 1fr));">
      ${I(
    this._areas,
    (s) => s.key,
    (s, r) => {
      const o = n(this, a, w).call(this, s, r, e);
      return y`<div
            class="area"
            style="grid-column: span ${o.columnSpan}; grid-row: span ${o.rowSpan}; order: ${o.order};"
            @dragover=${(l) => n(this, a, Y).call(this, l, e)}
            @dragleave=${n(this, a, N)}
            @drop=${(l) => n(this, a, H).call(this, l, e, s)}>
            <div class="area-header">
              <span
                class="grip"
                draggable="true"
                title="Drag to reorder"
                aria-hidden="true"
                @dragstart=${(l) => n(this, a, X).call(this, l, e, s)}
                @dragend=${n(this, a, F)}>
                <uui-icon name="icon-navigation"></uui-icon>
              </span>
              <strong class="alias">${s.alias}</strong>
            </div>
            <div class="numbers">
              ${n(this, a, S).call(this, e, s, r, "columnSpan", "Columns", o.columnSpan)}
              ${n(this, a, S).call(this, e, s, r, "rowSpan", "Rows", o.rowSpan)}
              ${n(this, a, S).call(this, e, s, r, "order", "Order", o.order)}
            </div>
            <span
              class="resize"
              title="Drag to resize"
              aria-hidden="true"
              @pointerdown=${(l) => n(this, a, K).call(this, l, e, s, r)}></span>
          </div>`;
    }
  )}
    </div>`;
};
q = function(e) {
  return y`<div class="layout">
      <div class="layout-header">
        <uui-label for="identifier-${e.key}">Identifier</uui-label>
        <uui-input
          id="identifier-${e.key}"
          label="Identifier"
          .value=${e.identifier}
          @change=${(t) => n(this, a, U).call(this, e, t)}></uui-input>
        <uui-label for="columns-${e.key}">Columns</uui-label>
        <uui-input
          id="columns-${e.key}"
          type="number"
          min="1"
          max=${C}
          label="Columns"
          .value=${String(e.columns)}
          @change=${(t) => n(this, a, B).call(this, e, t)}></uui-input>
        <uui-button
          compact
          label="Remove layout ${e.identifier}"
          @click=${() => n(this, a, R).call(this, e.key)}>
          <uui-icon name="icon-trash"></uui-icon>
        </uui-button>
      </div>
      ${n(this, a, Z).call(this, e)}
    </div>`;
};
c.styles = [
  se`
      :host {
        display: block;
        margin: var(--uui-size-layout-1);
      }
      .layout {
        padding-bottom: var(--uui-size-space-5);
        margin-bottom: var(--uui-size-space-5);
        border-bottom: 1px solid var(--uui-color-border);
      }
      .layout-header {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-3);
        margin-bottom: var(--uui-size-space-3);
      }
      .layout-header uui-input[type="number"] {
        width: 6em;
      }
      /* Areas mirror core's grey boxes. */
      .layout-grid {
        display: grid;
        gap: 1px;
      }
      .area {
        position: relative;
        background: var(--uui-color-surface-alt);
        border: 1px solid var(--uui-color-border-emphasis);
        border-radius: var(--uui-border-radius);
        padding: var(--uui-size-space-3);
        min-width: 0;
      }
      .area.drop-target {
        outline: 2px solid var(--uui-color-interactive-emphasis);
      }
      .area-header {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-2);
        margin-bottom: var(--uui-size-space-2);
        min-width: 0;
      }
      .grip {
        cursor: grab;
        display: inline-flex;
        color: var(--uui-color-text-alt);
      }
      /* Corner handle, drawn like core's: two lines in the bottom-right corner. */
      .resize {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 16px;
        height: 16px;
        cursor: nwse-resize;
        touch-action: none;
      }
      .resize::after {
        content: "";
        position: absolute;
        right: 3px;
        bottom: 3px;
        width: 8px;
        height: 8px;
        border-right: 2px solid var(--uui-color-border-emphasis);
        border-bottom: 2px solid var(--uui-color-border-emphasis);
      }
      .alias {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .numbers {
        display: flex;
        flex-wrap: wrap;
        gap: var(--uui-size-space-2);
      }
      .number {
        display: flex;
        flex-direction: column;
        font-size: var(--uui-type-small-size);
      }
      .number uui-input {
        width: 4.5em;
      }
      uui-button[look="placeholder"] {
        width: 100%;
      }
    `
];
v([
  b()
], c.prototype, "_areaColumnsConfig", 2);
v([
  b()
], c.prototype, "_areasConfig", 2);
v([
  b()
], c.prototype, "_layouts", 2);
v([
  b()
], c.prototype, "_areas", 2);
v([
  b()
], c.prototype, "_baseColumns", 2);
c = v([
  re("responsive-areas-workspace-view")
], c);
const fe = c;
export {
  c as ResponsiveAreasWorkspaceViewElement,
  fe as default
};
//# sourceMappingURL=responsive-areas-workspace-view.element-DPb1WvNf.js.map
