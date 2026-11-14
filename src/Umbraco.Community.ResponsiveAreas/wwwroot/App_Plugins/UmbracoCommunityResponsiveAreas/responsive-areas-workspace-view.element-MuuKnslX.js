import { UmbLitElement as G } from "@umbraco-cms/backoffice/lit-element";
import { css as V, property as B, state as d, customElement as D, repeat as X, html as b, nothing as ne } from "@umbraco-cms/backoffice/external/lit";
import { UMB_DATA_TYPE_WORKSPACE_CONTEXT as le } from "@umbraco-cms/backoffice/data-type";
import { UMB_PROPERTY_DATASET_CONTEXT as ue } from "@umbraco-cms/backoffice/property";
import { UmbId as ce } from "@umbraco-cms/backoffice/id";
import { UmbSorterController as pe, UmbSorterResolvePlacementAsGrid as he } from "@umbraco-cms/backoffice/sorter";
var de = Object.defineProperty, me = Object.getOwnPropertyDescriptor, Y = (e) => {
  throw TypeError(e);
}, g = (e, t, s, r) => {
  for (var a = r > 1 ? void 0 : r ? me(t, s) : t, i = e.length - 1, u; i >= 0; i--)
    (u = e[i]) && (a = (r ? u(t, s, a) : u(a)) || a);
  return r && a && de(t, s, a), a;
}, N = (e, t, s) => t.has(e) || Y("Cannot " + s), ve = (e, t, s) => (N(e, t, "read from private field"), s ? s.call(e) : t.get(e)), I = (e, t, s) => t.has(e) ? Y("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), p = (e, t, s) => (N(e, t, "access private method"), s), M, l, k, q, H, $;
const F = 24;
class _e extends Event {
  constructor(t) {
    super("values-change", { bubbles: !1, composed: !1 }), this.changes = t;
  }
}
let h = class extends G {
  constructor() {
    super(...arguments), I(this, l), this._items = [], I(this, M, new pe(this, {
      itemSelector: ".area",
      resolvePlacement: he,
      // The number boxes and corner handle must not start a move.
      ignorerSelector: "input,uui-input,umb-block-scale-handler",
      getUniqueOfElement: (e) => e.dataset.key,
      getUniqueOfModel: (e) => e.area.key,
      onChange: ({ model: e }) => {
        p(this, l, k).call(this, new Map(e.map((t, s) => [t.area.key, { order: s + 1 }])));
      }
    }));
  }
  set items(e) {
    this._items = e ?? [], ve(this, M).setModel(this._items);
  }
  get items() {
    return this._items;
  }
  render() {
    return X(
      this._items,
      (e) => e.area.key,
      (e) => {
        const t = this._scaling?.key === e.area.key ? this._scaling : void 0, s = t?.columnSpan ?? e.values.columnSpan, r = t?.rowSpan ?? e.values.rowSpan;
        return b`<div class="area" data-key=${e.area.key} style="grid-column: span ${s}; grid-row: span ${r};">
          <strong class="alias">${e.area.alias}</strong>
          <div class="numbers">
            ${p(this, l, $).call(this, e, "columnSpan", "Columns", s)}
            ${p(this, l, $).call(this, e, "rowSpan", "Rows", r)}
            ${p(this, l, $).call(this, e, "order", "Order", e.values.order)}
          </div>
          <umb-block-scale-handler
            @mousedown=${(a) => a.preventDefault()}
            @pointerdown=${(a) => p(this, l, H).call(this, a, e)}>
            ${s}x${r}
          </umb-block-scale-handler>
        </div>`;
      }
    );
  }
};
M = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
k = function(e) {
  this.dispatchEvent(new _e(e));
};
q = function(e, t, s) {
  const r = parseInt(s.target.value, 10), a = t === "columnSpan" ? this.layout.columns : t === "order" ? this._items.length : F, i = Math.max(1, Math.min(a, r || 1));
  p(this, l, k).call(this, /* @__PURE__ */ new Map([[e.area.key, { [t]: i }]]));
};
H = function(e, t) {
  e.preventDefault();
  const s = e.currentTarget, r = s.closest(".area"), a = r.parentElement, i = t.values, u = a.clientWidth / this.layout.columns, re = r.offsetHeight / i.rowSpan, ie = e.clientX, oe = e.clientY, E = t.area.key;
  this._scaling = { key: E, columnSpan: i.columnSpan, rowSpan: i.rowSpan }, s.setAttribute("scale-mode", ""), e.composedPath()[0].setPointerCapture(e.pointerId);
  const R = (y) => {
    this._scaling = {
      key: E,
      columnSpan: Math.max(1, Math.min(this.layout.columns, Math.round(i.columnSpan + (y.clientX - ie) / u))),
      rowSpan: Math.max(1, Math.min(F, Math.round(i.rowSpan + (y.clientY - oe) / re)))
    };
  }, w = () => {
    s.removeEventListener("pointermove", R), s.removeEventListener("pointerup", w), s.removeEventListener("pointercancel", w), s.removeAttribute("scale-mode");
    const { columnSpan: y, rowSpan: U } = this._scaling;
    this._scaling = void 0, (y !== i.columnSpan || U !== i.rowSpan) && p(this, l, k).call(this, /* @__PURE__ */ new Map([[E, { columnSpan: y, rowSpan: U }]]));
  };
  s.addEventListener("pointermove", R), s.addEventListener("pointerup", w), s.addEventListener("pointercancel", w);
};
$ = function(e, t, s, r) {
  const a = `${t}-${e.area.key}`;
  return b`<span class="number">
      <uui-label for=${a}>${s}</uui-label>
      <uui-input
        id=${a}
        type="number"
        min="1"
        label="${s} for ${e.area.alias ?? "area"} in layout ${this.layout.identifier}"
        .value=${String(r)}
        @change=${(i) => p(this, l, q).call(this, e, t, i)}></uui-input>
    </span>`;
};
h.styles = [
  V`
      :host {
        display: grid;
        grid-template-columns: repeat(var(--responsive-areas-columns, 12), minmax(0, 1fr));
        gap: 1px;
      }
      /* Areas mirror core's grey boxes, including the move cursor and the drag placeholder. */
      .area {
        position: relative;
        box-sizing: border-box;
        min-width: 0;
        padding: var(--uui-size-space-3);
        background-color: var(--uui-color-surface-alt);
        border: 1px solid var(--uui-color-border-emphasis);
        border-radius: var(--uui-border-radius);
        cursor: move;
        transition: background-color 120ms;
      }
      .area:hover {
        background-color: var(--uui-color-disabled-standalone);
      }
      .area[drag-placeholder] {
        opacity: 0.2;
      }
      umb-block-scale-handler {
        touch-action: none;
      }
      .alias {
        display: block;
        min-width: 0;
        margin-bottom: var(--uui-size-space-2);
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
    `
];
g([
  B({ attribute: !1 })
], h.prototype, "layout", 2);
g([
  B({ attribute: !1 })
], h.prototype, "items", 1);
g([
  d()
], h.prototype, "_items", 2);
g([
  d()
], h.prototype, "_scaling", 2);
h = g([
  D("responsive-areas-layout-grid")
], h);
var ye = Object.defineProperty, fe = Object.getOwnPropertyDescriptor, K = (e) => {
  throw TypeError(e);
}, _ = (e, t, s, r) => {
  for (var a = r > 1 ? void 0 : r ? fe(t, s) : t, i = e.length - 1, u; i >= 0; i--)
    (u = e[i]) && (a = (r ? u(t, s, a) : u(a)) || a);
  return r && a && ye(t, s, a), a;
}, P = (e, t, s) => t.has(e) || K("Cannot " + s), v = (e, t, s) => (P(e, t, "read from private field"), s ? s.call(e) : t.get(e)), C = (e, t, s) => t.has(e) ? K("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), x = (e, t, s, r) => (P(e, t, "write to private field"), t.set(e, s), s), n = (e, t, s) => (P(e, t, "access private method"), s), f, m, S, o, L, A, Z, J, O, Q, j, z, T, ee, te, se;
const ae = "responsiveLayouts", W = 24;
let c = class extends G {
  constructor() {
    super(), C(this, o), C(this, f), this._layouts = [], this._areas = [], this._baseColumns = 12, C(this, m, 12), C(this, S), this.consumeContext(le, async (e) => {
      this.observe(
        await e?.propertyValueByAlias("gridColumns"),
        (t) => {
          x(this, m, t ? parseInt(t, 10) : 12), this._areaColumnsConfig = [
            { alias: "placeholder", value: v(this, m) },
            { alias: "min", value: 1 }
          ], this._areasConfig = [{ alias: "defaultAreaGridColumns", value: v(this, m) }], n(this, o, L).call(this);
        },
        "observeGridColumns"
      );
    }).passContextAliasMatches(), this.consumeContext(ue, async (e) => {
      x(this, f, e), this.observe(
        await e?.propertyValueByAlias(ae),
        (t) => this._layouts = t ?? [],
        "observeLayouts"
      ), this.observe(
        await e?.propertyValueByAlias("areas"),
        (t) => this._areas = t ?? [],
        "observeAreas"
      ), this.observe(
        await e?.propertyValueByAlias("areaGridColumns"),
        (t) => {
          const s = typeof t == "string" ? parseInt(t, 10) : t;
          x(this, S, s && s > 0 ? s : void 0), n(this, o, L).call(this);
        },
        "observeAreaGridColumns"
      );
    });
  }
  render() {
    return this._areasConfig ? b`<uui-box headline="Areas">
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
              ${X(
      this._layouts,
      (e) => e.key,
      (e) => n(this, o, se).call(this, e)
    )}
              <uui-button look="placeholder" label="Add layout" @click=${n(this, o, Z)}></uui-button>
            </div>
          </umb-property-layout>
        </uui-box>` : ne;
  }
};
f = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
S = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
L = function() {
  this._baseColumns = v(this, S) ?? v(this, m);
};
A = function(e) {
  v(this, f)?.setPropertyValue(ae, e);
};
Z = function() {
  const e = this._layouts[this._layouts.length - 1]?.columns ?? this._baseColumns, t = Math.max(1, e - 3);
  n(this, o, A).call(this, [...this._layouts, { key: ce.new(), identifier: String(t), columns: t }]);
};
J = function(e) {
  n(this, o, A).call(this, this._layouts.filter((t) => t.key !== e)), n(this, o, z).call(this, this._areas.map((t) => {
    if (!t.responsiveLayouts?.[e]) return t;
    const { [e]: s, ...r } = t.responsiveLayouts;
    return { ...t, responsiveLayouts: r };
  }));
};
O = function(e, t) {
  n(this, o, A).call(this, this._layouts.map((s) => s.key === e ? { ...s, ...t } : s));
};
Q = function(e, t) {
  const s = t.target.value.replace(/[^A-Za-z0-9_-]/g, ""), r = { identifier: s }, a = parseInt(s, 10);
  a >= 1 && (r.columns = Math.min(W, a)), n(this, o, O).call(this, e.key, r);
};
j = function(e, t) {
  const s = parseInt(t.target.value, 10), r = Math.max(1, Math.min(W, s || 1));
  n(this, o, O).call(this, e.key, { columns: r });
};
z = function(e) {
  v(this, f)?.setPropertyValue("areas", e);
};
T = function(e, t, s) {
  const r = e.responsiveLayouts?.[s.key];
  return {
    columnSpan: Math.min(r?.columnSpan ?? e.columnSpan ?? s.columns, s.columns),
    rowSpan: r?.rowSpan ?? e.rowSpan ?? 1,
    order: r?.order ?? t + 1
  };
};
ee = function(e, t) {
  n(this, o, z).call(this, this._areas.map((s, r) => {
    const a = t.get(s.key);
    if (!a) return s;
    const i = { ...n(this, o, T).call(this, s, r, e), ...a };
    return { ...s, responsiveLayouts: { ...s.responsiveLayouts, [e.key]: i } };
  }));
};
te = function(e) {
  const t = Math.max(this._baseColumns, ...this._layouts.map((a) => a.columns)), s = e.columns / t * 100, r = this._areas.map((a, i) => ({ area: a, values: n(this, o, T).call(this, a, i, e) })).sort((a, i) => a.values.order - i.values.order);
  return b`<responsive-areas-layout-grid
      style="width:${s}%; --responsive-areas-columns:${e.columns};"
      .layout=${e}
      .items=${r}
      @values-change=${(a) => n(this, o, ee).call(this, e, a.changes)}></responsive-areas-layout-grid>`;
};
se = function(e) {
  return b`<div class="layout">
      <div class="layout-header">
        <uui-label for="identifier-${e.key}">Identifier</uui-label>
        <uui-input
          id="identifier-${e.key}"
          label="Identifier"
          .value=${e.identifier}
          @change=${(t) => n(this, o, Q).call(this, e, t)}></uui-input>
        <uui-label for="columns-${e.key}">Columns</uui-label>
        <uui-input
          id="columns-${e.key}"
          type="number"
          min="1"
          max=${W}
          label="Columns"
          .value=${String(e.columns)}
          @change=${(t) => n(this, o, j).call(this, e, t)}></uui-input>
        <uui-button
          compact
          label="Remove layout ${e.identifier}"
          @click=${() => n(this, o, J).call(this, e.key)}>
          <uui-icon name="icon-trash"></uui-icon>
        </uui-button>
      </div>
      ${n(this, o, te).call(this, e)}
    </div>`;
};
c.styles = [
  V`
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
      uui-button[look="placeholder"] {
        width: 100%;
      }
    `
];
_([
  d()
], c.prototype, "_areaColumnsConfig", 2);
_([
  d()
], c.prototype, "_areasConfig", 2);
_([
  d()
], c.prototype, "_layouts", 2);
_([
  d()
], c.prototype, "_areas", 2);
_([
  d()
], c.prototype, "_baseColumns", 2);
c = _([
  D("responsive-areas-workspace-view")
], c);
const ke = c;
export {
  c as ResponsiveAreasWorkspaceViewElement,
  ke as default
};
//# sourceMappingURL=responsive-areas-workspace-view.element-MuuKnslX.js.map
