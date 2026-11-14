import { UmbLitElement as U } from "@umbraco-cms/backoffice/lit-element";
import { css as V, property as W, state as d, customElement as I, repeat as B, html as h, nothing as ne } from "@umbraco-cms/backoffice/external/lit";
import { UMB_DATA_TYPE_WORKSPACE_CONTEXT as le } from "@umbraco-cms/backoffice/data-type";
import { UMB_PROPERTY_DATASET_CONTEXT as ue } from "@umbraco-cms/backoffice/property";
import { UmbId as ce } from "@umbraco-cms/backoffice/id";
import { UmbSorterController as pe, UmbSorterResolvePlacementAsGrid as he } from "@umbraco-cms/backoffice/sorter";
var de = Object.defineProperty, me = Object.getOwnPropertyDescriptor, D = (e) => {
  throw TypeError(e);
}, f = (e, t, s, i) => {
  for (var a = i > 1 ? void 0 : i ? me(t, s) : t, o = e.length - 1, c; o >= 0; o--)
    (c = e[o]) && (a = (i ? c(t, s, a) : c(a)) || a);
  return i && a && de(t, s, a), a;
}, X = (e, t, s) => t.has(e) || D("Cannot " + s), ve = (e, t, s) => (X(e, t, "read from private field"), s ? s.call(e) : t.get(e)), G = (e, t, s) => t.has(e) ? D("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), p = (e, t, s) => (X(e, t, "access private method"), s), x, l, C, Y, N, w;
const F = 24;
class ye extends Event {
  constructor(t) {
    super("values-change", { bubbles: !1, composed: !1 }), this.changes = t;
  }
}
let m = class extends U {
  constructor() {
    super(...arguments), G(this, l), this._items = [], G(this, x, new pe(this, {
      itemSelector: ".area",
      resolvePlacement: he,
      // The number boxes and corner handle must not start a move.
      ignorerSelector: "input,uui-input,umb-block-scale-handler",
      getUniqueOfElement: (e) => e.dataset.key,
      getUniqueOfModel: (e) => e.area.key,
      onChange: ({ model: e }) => {
        p(this, l, C).call(this, new Map(e.map((t, s) => [t.area.key, { order: s + 1 }])));
      }
    }));
  }
  set items(e) {
    this._items = e ?? [], ve(this, x).setModel(this._items);
  }
  get items() {
    return this._items;
  }
  render() {
    return B(
      this._items,
      (e) => e.area.key,
      (e) => {
        const t = this._scaling?.key === e.area.key ? this._scaling : void 0, s = t?.columnSpan ?? e.values.columnSpan, i = t?.rowSpan ?? e.values.rowSpan;
        return h`<div class="area" data-key=${e.area.key} style="grid-column: span ${s}; grid-row: span ${i};">
          <strong class="alias">${e.area.alias}</strong>
          <div class="numbers">
            ${p(this, l, w).call(this, e, "columnSpan", "Columns", s)}
            ${p(this, l, w).call(this, e, "rowSpan", "Rows", i)}
            ${p(this, l, w).call(this, e, "order", "Order", e.values.order)}
          </div>
          <umb-block-scale-handler
            @mousedown=${(a) => a.preventDefault()}
            @pointerdown=${(a) => p(this, l, N).call(this, a, e)}>
            ${s}x${i}
          </umb-block-scale-handler>
        </div>`;
      }
    );
  }
};
x = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakSet();
C = function(e) {
  this.dispatchEvent(new ye(e));
};
Y = function(e, t, s) {
  const i = parseInt(s.target.value, 10), a = t === "columnSpan" ? this.layout.columns : t === "order" ? this._items.length : F, o = Math.max(1, Math.min(a, i || 1));
  p(this, l, C).call(this, /* @__PURE__ */ new Map([[e.area.key, { [t]: o }]]));
};
N = function(e, t) {
  e.preventDefault();
  const s = e.currentTarget, i = s.closest(".area"), a = i.parentElement, o = t.values, c = a.clientWidth / this.layout.columns, ie = i.offsetHeight / o.rowSpan, oe = e.clientX, re = e.clientY, S = t.area.key;
  this._scaling = { key: S, columnSpan: o.columnSpan, rowSpan: o.rowSpan }, s.setAttribute("scale-mode", ""), e.composedPath()[0].setPointerCapture(e.pointerId);
  const O = (_) => {
    this._scaling = {
      key: S,
      columnSpan: Math.max(1, Math.min(this.layout.columns, Math.round(o.columnSpan + (_.clientX - oe) / c))),
      rowSpan: Math.max(1, Math.min(F, Math.round(o.rowSpan + (_.clientY - re) / ie)))
    };
  }, g = () => {
    s.removeEventListener("pointermove", O), s.removeEventListener("pointerup", g), s.removeEventListener("pointercancel", g), s.removeAttribute("scale-mode");
    const { columnSpan: _, rowSpan: z } = this._scaling;
    this._scaling = void 0, (_ !== o.columnSpan || z !== o.rowSpan) && p(this, l, C).call(this, /* @__PURE__ */ new Map([[S, { columnSpan: _, rowSpan: z }]]));
  };
  s.addEventListener("pointermove", O), s.addEventListener("pointerup", g), s.addEventListener("pointercancel", g);
};
w = function(e, t, s, i) {
  const a = `${t}-${e.area.key}`;
  return h`<span class="number">
      <uui-label for=${a}>${s}</uui-label>
      <uui-input
        id=${a}
        type="number"
        min="1"
        label="${s} for ${e.area.alias ?? "area"} in layout ${this.layout.identifier}"
        .value=${String(i)}
        @change=${(o) => p(this, l, Y).call(this, e, t, o)}></uui-input>
    </span>`;
};
m.styles = [
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
f([
  W({ attribute: !1 })
], m.prototype, "layout", 2);
f([
  W({ attribute: !1 })
], m.prototype, "items", 1);
f([
  d()
], m.prototype, "_items", 2);
f([
  d()
], m.prototype, "_scaling", 2);
m = f([
  I("responsive-areas-layout-grid")
], m);
var _e = Object.defineProperty, fe = Object.getOwnPropertyDescriptor, H = (e) => {
  throw TypeError(e);
}, y = (e, t, s, i) => {
  for (var a = i > 1 ? void 0 : i ? fe(t, s) : t, o = e.length - 1, c; o >= 0; o--)
    (c = e[o]) && (a = (i ? c(t, s, a) : c(a)) || a);
  return i && a && _e(t, s, a), a;
}, E = (e, t, s) => t.has(e) || H("Cannot " + s), $ = (e, t, s) => (E(e, t, "read from private field"), t.get(e)), R = (e, t, s) => t.has(e) ? H("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, s), be = (e, t, s, i) => (E(e, t, "write to private field"), t.set(e, s), s), n = (e, t, s) => (E(e, t, "access private method"), s), v, r, A, q, M, K, k, Z, J, L, Q, j, T, P, ee, te, se;
const ae = "responsiveLayouts", b = 24;
let u = class extends U {
  constructor() {
    super(), R(this, r), R(this, v), this._layouts = [], this._areas = [], this._baseColumns = 12, this._dataTypeColumns = 12, this.consumeContext(le, async (e) => {
      this.observe(
        await e?.propertyValueByAlias("gridColumns"),
        (t) => {
          this._dataTypeColumns = t ? parseInt(t, 10) : 12, this._areasConfig = [{ alias: "defaultAreaGridColumns", value: this._dataTypeColumns }], n(this, r, A).call(this);
        },
        "observeGridColumns"
      );
    }).passContextAliasMatches(), this.consumeContext(ue, async (e) => {
      be(this, v, e), this.observe(
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
          this._blockColumns = s && s > 0 ? s : void 0, n(this, r, A).call(this);
        },
        "observeAreaGridColumns"
      );
    });
  }
  render() {
    return this._areasConfig ? h`${n(this, r, K).call(this)}
        <uui-box headline="Areas">
          <umb-property
            label=${this.localize.term("blockEditor_areasConfigurations")}
            alias="areas"
            property-editor-ui-alias="Umb.PropertyEditorUi.BlockGridAreasConfig"
            .config=${this._areasConfig}></umb-property>
          <umb-property-layout
            label="Layouts"
            description="The areas above are the base layout (${this._baseColumns} columns). Each extra layout resizes and reorders them.">
            <div slot="editor">
              ${B(
      this._layouts,
      (e) => e.key,
      (e) => n(this, r, se).call(this, e)
    )}
              <uui-button look="placeholder" label="Add layout" @click=${n(this, r, Z)}></uui-button>
            </div>
          </umb-property-layout>
        </uui-box>` : ne;
  }
};
v = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
A = function() {
  this._baseColumns = this._blockColumns ?? this._dataTypeColumns;
};
q = function(e) {
  const t = e.target, s = parseInt(t.value, 10);
  if (!s || s === this._dataTypeColumns) {
    n(this, r, M).call(this), t.value = String(this._dataTypeColumns);
    return;
  }
  const i = Math.max(1, Math.min(b, s));
  t.value = String(i), $(this, v)?.setPropertyValue("areaGridColumns", i);
};
M = function() {
  $(this, v)?.setPropertyValue("areaGridColumns", void 0);
};
K = function() {
  const e = this._blockColumns !== void 0;
  return h`<uui-box headline="Grid">
      <umb-property-layout
        label="Columns"
        description="How many columns this block's areas sit in. Filled in from the Block Grid data type. Change it to give this block a different grid.">
        <div slot="editor" class="grid-columns">
          <uui-input
            id="grid-columns"
            type="number"
            min="1"
            max=${b}
            label="Grid columns"
            .value=${String(this._baseColumns)}
            @change=${n(this, r, q)}></uui-input>
          <span class="grid-status" aria-live="polite">
            ${e ? h`Set for this block. The data type uses ${this._dataTypeColumns}.
                  <uui-button
                    look="secondary"
                    compact
                    label="Use the data type's ${this._dataTypeColumns}"
                    @click=${n(this, r, M)}></uui-button>` : h`Following the data type (${this._dataTypeColumns}).`}
          </span>
        </div>
      </umb-property-layout>
    </uui-box>`;
};
k = function(e) {
  $(this, v)?.setPropertyValue(ae, e);
};
Z = function() {
  const e = this._layouts[this._layouts.length - 1]?.columns ?? this._baseColumns, t = Math.max(1, e - 3);
  n(this, r, k).call(this, [...this._layouts, { key: ce.new(), identifier: String(t), columns: t }]);
};
J = function(e) {
  n(this, r, k).call(this, this._layouts.filter((t) => t.key !== e)), n(this, r, T).call(this, this._areas.map((t) => {
    if (!t.responsiveLayouts?.[e]) return t;
    const { [e]: s, ...i } = t.responsiveLayouts;
    return { ...t, responsiveLayouts: i };
  }));
};
L = function(e, t) {
  n(this, r, k).call(this, this._layouts.map((s) => s.key === e ? { ...s, ...t } : s));
};
Q = function(e, t) {
  const s = t.target.value.replace(/[^A-Za-z0-9_-]/g, ""), i = { identifier: s }, a = parseInt(s, 10);
  a >= 1 && (i.columns = Math.min(b, a)), n(this, r, L).call(this, e.key, i);
};
j = function(e, t) {
  const s = parseInt(t.target.value, 10), i = Math.max(1, Math.min(b, s || 1));
  n(this, r, L).call(this, e.key, { columns: i });
};
T = function(e) {
  $(this, v)?.setPropertyValue("areas", e);
};
P = function(e, t, s) {
  const i = e.responsiveLayouts?.[s.key];
  return {
    columnSpan: Math.min(i?.columnSpan ?? e.columnSpan ?? s.columns, s.columns),
    rowSpan: i?.rowSpan ?? e.rowSpan ?? 1,
    order: i?.order ?? t + 1
  };
};
ee = function(e, t) {
  n(this, r, T).call(this, this._areas.map((s, i) => {
    const a = t.get(s.key);
    if (!a) return s;
    const o = { ...n(this, r, P).call(this, s, i, e), ...a };
    return { ...s, responsiveLayouts: { ...s.responsiveLayouts, [e.key]: o } };
  }));
};
te = function(e) {
  const t = Math.max(this._baseColumns, ...this._layouts.map((a) => a.columns)), s = e.columns / t * 100, i = this._areas.map((a, o) => ({ area: a, values: n(this, r, P).call(this, a, o, e) })).sort((a, o) => a.values.order - o.values.order);
  return h`<responsive-areas-layout-grid
      style="width:${s}%; --responsive-areas-columns:${e.columns};"
      .layout=${e}
      .items=${i}
      @values-change=${(a) => n(this, r, ee).call(this, e, a.changes)}></responsive-areas-layout-grid>`;
};
se = function(e) {
  return h`<div class="layout">
      <div class="layout-header">
        <uui-label for="identifier-${e.key}">Identifier</uui-label>
        <uui-input
          id="identifier-${e.key}"
          label="Identifier"
          .value=${e.identifier}
          @change=${(t) => n(this, r, Q).call(this, e, t)}></uui-input>
        <uui-label for="columns-${e.key}">Columns</uui-label>
        <uui-input
          id="columns-${e.key}"
          type="number"
          min="1"
          max=${b}
          label="Columns"
          .value=${String(e.columns)}
          @change=${(t) => n(this, r, j).call(this, e, t)}></uui-input>
        <uui-button
          compact
          label="Remove layout ${e.identifier}"
          @click=${() => n(this, r, J).call(this, e.key)}>
          <uui-icon name="icon-trash"></uui-icon>
        </uui-button>
      </div>
      ${n(this, r, te).call(this, e)}
    </div>`;
};
u.styles = [
  V`
      :host {
        display: block;
        margin: var(--uui-size-layout-1);
      }
      uui-box + uui-box {
        margin-top: var(--uui-size-layout-1);
      }
      .grid-columns {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--uui-size-space-3);
      }
      .grid-columns uui-input {
        width: 6em;
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
y([
  d()
], u.prototype, "_areasConfig", 2);
y([
  d()
], u.prototype, "_layouts", 2);
y([
  d()
], u.prototype, "_areas", 2);
y([
  d()
], u.prototype, "_baseColumns", 2);
y([
  d()
], u.prototype, "_dataTypeColumns", 2);
y([
  d()
], u.prototype, "_blockColumns", 2);
u = y([
  I("responsive-areas-workspace-view")
], u);
const xe = u;
export {
  u as ResponsiveAreasWorkspaceViewElement,
  xe as default
};
//# sourceMappingURL=responsive-areas-workspace-view.element-BDSS4c77.js.map
