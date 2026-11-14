import { UmbLitElement as L } from "@umbraco-cms/backoffice/lit-element";
import { css as M, customElement as P, html as d, property as _, state as b, repeat as V } from "@umbraco-cms/backoffice/external/lit";
import { UMB_PROPERTY_DATASET_CONTEXT as ie } from "@umbraco-cms/backoffice/property";
import { UmbChangeEvent as ne } from "@umbraco-cms/backoffice/event";
import { UmbId as le } from "@umbraco-cms/backoffice/id";
import { UmbModalToken as ue, umbConfirmModal as ce } from "@umbraco-cms/backoffice/modal";
import { UmbModalRouteRegistrationController as pe } from "@umbraco-cms/backoffice/router";
import { incrementString as he } from "@umbraco-cms/backoffice/utils";
import { UmbSorterController as de, UmbSorterResolvePlacementAsGrid as me } from "@umbraco-cms/backoffice/sorter";
var ve = Object.getOwnPropertyDescriptor, fe = (e, s, t, o) => {
  for (var a = o > 1 ? void 0 : o ? ve(s, t) : s, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (a = l(a) || a);
  return a;
};
let E = class extends L {
  constructor() {
    super(), this.addEventListener("dragstart", (e) => e.preventDefault());
  }
  render() {
    return d`<button aria-label="TODO: Some introduction to keyboard scaling" id="handler"></button>
      <slot id="label"></slot>`;
  }
};
E.styles = [
  M`
      :host {
        position: absolute;
        inset: 0;
        pointer-events: none;
        box-sizing: border-box;
      }
      :host(:focus-within),
      :host(:hover) {
        border: var(--uui-color-interactive) solid 1px;
        border-radius: var(--uui-border-radius);
      }
      #handler {
        position: absolute;
        display: block;
        z-index: 2;
        pointer-events: all;
        cursor: nwse-resize;
        bottom: -4px;
        right: -4px;
        width: 7px;
        height: 7px;
        padding: 0;
        background-color: var(--uui-color-surface);
        border: var(--uui-color-interactive) solid 1px;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.7);
        opacity: var(--umb-block-scale-handler-opacity, 0);
        transition: opacity 120ms;
      }
      #handler:hover,
      #handler:focus {
        opacity: 1;
      }
      #handler:focus {
        outline: 2px solid var(--uui-color-selected);
        outline-offset: 1px;
      }
      #handler::after {
        content: "";
        position: absolute;
        inset: -10px;
        background-color: rgba(0, 0, 0, 0);
      }
      #handler:focus + #label,
      #handler:hover + #label {
        opacity: 1;
      }
      #label {
        position: absolute;
        display: block;
        top: 100%;
        left: 100%;
        margin-left: 6px;
        margin-top: 6px;
        z-index: 2;
        background-color: white;
        color: black;
        font-size: 12px;
        padding: 0px 6px;
        border-radius: 3px;
        opacity: 0;
        transition: opacity 120ms;
        pointer-events: none;
        white-space: nowrap;
      }
      :host([scale-mode]) > #handler {
        opacity: 1;
      }
      :host([scale-mode]) > #label {
        opacity: 1;
      }
    `
];
E = fe([
  P("responsive-areas-scale-handler")
], E);
var ye = Object.defineProperty, _e = Object.getOwnPropertyDescriptor, X = (e) => {
  throw TypeError(e);
}, v = (e, s, t, o) => {
  for (var a = o > 1 ? void 0 : o ? _e(s, t) : s, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (a = (o ? l(s, t, a) : l(a)) || a);
  return o && a && ye(s, t, a), a;
}, Y = (e, s, t) => s.has(e) || X("Cannot " + t), be = (e, s, t) => (Y(e, s, "read from private field"), t ? t.call(e) : s.get(e)), I = (e, s, t) => s.has(e) ? X("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(e) : s.set(e, t), k = (e, s, t) => (Y(e, s, "access private method"), t), A, m, C, B, N;
const ge = 24;
class we extends Event {
  constructor(s) {
    super("values-change", { bubbles: !1, composed: !1 }), this.changes = s;
  }
}
class ke extends Event {
  constructor(s) {
    super("area-delete", { bubbles: !1, composed: !1 }), this.key = s;
  }
}
let h = class extends L {
  constructor() {
    super(...arguments), I(this, m), this._items = [], I(this, A, new de(this, {
      itemSelector: ".area",
      resolvePlacement: me,
      // The buttons and corner handle must not start a move.
      ignorerSelector: "input,uui-input,uui-button,responsive-areas-scale-handler",
      getUniqueOfElement: (e) => e.dataset.key,
      getUniqueOfModel: (e) => e.area.key,
      onChange: ({ model: e }) => {
        k(this, m, C).call(this, new Map(e.map((s, t) => [s.area.key, { order: t + 1 }])));
      }
    }));
  }
  set items(e) {
    this._items = e ?? [], be(this, A).setModel(this._items);
  }
  get items() {
    return this._items;
  }
  render() {
    return V(
      this._items,
      (e) => e.area.key,
      (e) => {
        const s = this._scaling?.key === e.area.key ? this._scaling : void 0, t = s?.columnSpan ?? e.values.columnSpan, o = s?.rowSpan ?? e.values.rowSpan;
        return d`<div class="area" data-key=${e.area.key} style="grid-column: span ${t}; grid-row: span ${o};">
          <div class="head">
            <strong class="alias">${e.area.alias}</strong>
            ${this.workspacePath ? k(this, m, N).call(this, e) : null}
          </div>
          <responsive-areas-scale-handler
            @mousedown=${(a) => a.preventDefault()}
            @pointerdown=${(a) => k(this, m, B).call(this, a, e)}>
            ${t}x${o}
          </responsive-areas-scale-handler>
        </div>`;
      }
    );
  }
};
A = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakSet();
C = function(e) {
  this.dispatchEvent(new we(e));
};
B = function(e, s) {
  e.preventDefault();
  const t = e.currentTarget, o = t.closest(".area"), a = s.values, n = this.clientWidth / this.layout.columns, l = o.offsetHeight / a.rowSpan, oe = e.clientX, re = e.clientY, x = s.area.key;
  this._scaling = { key: x, columnSpan: a.columnSpan, rowSpan: a.rowSpan }, t.setAttribute("scale-mode", ""), e.composedPath()[0].setPointerCapture(e.pointerId);
  const U = (y) => {
    this._scaling = {
      key: x,
      columnSpan: Math.max(1, Math.min(this.layout.columns, Math.round(a.columnSpan + (y.clientX - oe) / n))),
      rowSpan: Math.max(1, Math.min(ge, Math.round(a.rowSpan + (y.clientY - re) / l)))
    };
  }, w = () => {
    t.removeEventListener("pointermove", U), t.removeEventListener("pointerup", w), t.removeEventListener("pointercancel", w), t.removeAttribute("scale-mode");
    const { columnSpan: y, rowSpan: W } = this._scaling;
    this._scaling = void 0, (y !== a.columnSpan || W !== a.rowSpan) && k(this, m, C).call(this, /* @__PURE__ */ new Map([[x, { columnSpan: y, rowSpan: W }]]));
  };
  t.addEventListener("pointermove", U), t.addEventListener("pointerup", w), t.addEventListener("pointercancel", w);
};
N = function(e) {
  const s = e.area.alias ?? "area";
  return d`<uui-action-bar>
      <uui-button compact label="Edit ${s}" href=${this.workspacePath + "edit/" + e.area.key}>
        <uui-icon name="icon-edit"></uui-icon>
      </uui-button>
      <uui-button
        compact
        label="Delete ${s}"
        @click=${() => this.dispatchEvent(new ke(e.area.key))}>
        <uui-icon name="icon-remove"></uui-icon>
      </uui-button>
    </uui-action-bar>`;
};
h.styles = [
  M`
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
      responsive-areas-scale-handler {
        touch-action: none;
      }
      .head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--uui-size-space-2);
        margin-bottom: var(--uui-size-space-2);
      }
      uui-action-bar {
        flex-shrink: 0;
      }
      .alias {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `
];
v([
  _({ attribute: !1 })
], h.prototype, "layout", 2);
v([
  _({ attribute: !1 })
], h.prototype, "workspacePath", 2);
v([
  _({ attribute: !1 })
], h.prototype, "items", 1);
v([
  b()
], h.prototype, "_items", 2);
v([
  b()
], h.prototype, "_scaling", 2);
h = v([
  P("responsive-areas-layout-grid")
], h);
var Se = Object.defineProperty, $e = Object.getOwnPropertyDescriptor, q = (e) => {
  throw TypeError(e);
}, f = (e, s, t, o) => {
  for (var a = o > 1 ? void 0 : o ? $e(s, t) : s, n = e.length - 1, l; n >= 0; n--)
    (l = e[n]) && (a = (o ? l(s, t, a) : l(a)) || a);
  return o && a && Se(s, t, a), a;
}, O = (e, s, t) => s.has(e) || q("Cannot " + t), u = (e, s, t) => (O(e, s, "read from private field"), t ? t.call(e) : s.get(e)), G = (e, s, t) => s.has(e) ? q("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(e) : s.set(e, t), xe = (e, s, t, o) => (O(e, s, "write to private field"), s.set(e, t), t), i = (e, s, t) => (O(e, s, "access private method"), t), S, r, c, F, g, H, K, $, Z, J, R, Q, j, z, ee, D, te, se;
const ae = "responsiveLayouts", T = 24, Ee = new ue(
  "Umb.Modal.Workspace",
  {
    modal: { type: "sidebar", size: "small" },
    data: { entityType: "block-grid-area-type", preset: {} }
  }
);
let p = class extends L {
  constructor() {
    super(), G(this, r), this.value = [], this._columns = 12, this._layouts = [], G(this, S), new pe(this, Ee).addAdditionalPath("block-grid-area-type").onSetup(() => {
      const e = this._columns / 2;
      return {
        data: {
          entityType: "block-grid-area-type",
          preset: { columnSpan: Number.isInteger(e) ? e : this._columns, alias: i(this, r, F).call(this, "area") }
        },
        modal: { size: "large" }
      };
    }).observeRouteBuilder((e) => {
      this._workspacePath = e({});
    }), this.consumeContext(ie, async (e) => {
      xe(this, S, e), this.observe(
        await e?.propertyValueByAlias(ae),
        (s) => this._layouts = s ?? [],
        "observeLayouts"
      );
    });
  }
  set config(e) {
    this._columns = Number(e?.getValueByAlias("areaGridColumns")) || 12;
  }
  render() {
    return d`${i(this, r, te).call(this)}
      ${V(
      this._layouts,
      (e) => e.key,
      (e) => i(this, r, se).call(this, e)
    )}
      <uui-button look="placeholder" label="Add layout" @click=${i(this, r, Z)}></uui-button>`;
  }
};
S = /* @__PURE__ */ new WeakMap();
r = /* @__PURE__ */ new WeakSet();
c = function() {
  return this.value ?? [];
};
F = function(e) {
  for (; u(this, r, c).some((s) => s.alias === e); )
    e = he(e);
  return e;
};
g = function(e) {
  this.value = e, this.dispatchEvent(new ne());
};
H = function(e) {
  const s = u(this, r, c).map((t, o) => {
    const a = e.get(t.key), n = { ...t };
    return a?.columnSpan !== void 0 && (n.columnSpan = a.columnSpan), a?.rowSpan !== void 0 && (n.rowSpan = a.rowSpan), { area: n, order: a?.order ?? o + 1 };
  });
  s.sort((t, o) => t.order - o.order), i(this, r, g).call(this, s.map((t) => t.area));
};
K = async function(e) {
  const s = u(this, r, c).find((t) => t.key === e);
  if (s) {
    try {
      await ce(this, {
        headline: `Delete ${s.alias ?? "area"}`,
        content: "This area is removed from every layout. Content in it is removed from pages that use this block.",
        confirmLabel: "Delete",
        color: "danger"
      });
    } catch {
      return;
    }
    i(this, r, g).call(this, u(this, r, c).filter((t) => t.key !== e));
  }
};
$ = function(e) {
  u(this, S)?.setPropertyValue(ae, e);
};
Z = function() {
  const e = this._layouts[this._layouts.length - 1]?.columns ?? this._columns, s = Math.max(1, e - 3);
  i(this, r, $).call(this, [...this._layouts, { key: le.new(), identifier: String(s), columns: s }]);
};
J = function(e) {
  i(this, r, $).call(this, this._layouts.filter((s) => s.key !== e)), i(this, r, g).call(this, u(this, r, c).map((s) => {
    if (!s.responsiveLayouts?.[e]) return s;
    const { [e]: t, ...o } = s.responsiveLayouts;
    return { ...s, responsiveLayouts: o };
  }));
};
R = function(e, s) {
  i(this, r, $).call(this, this._layouts.map((t) => t.key === e ? { ...t, ...s } : t));
};
Q = function(e, s) {
  const t = s.target.value.replace(/[^A-Za-z0-9_-]/g, ""), o = { identifier: t }, a = parseInt(t, 10);
  a >= 1 && (o.columns = Math.min(T, a)), i(this, r, R).call(this, e.key, o);
};
j = function(e, s) {
  const t = parseInt(s.target.value, 10), o = Math.max(1, Math.min(T, t || 1));
  i(this, r, R).call(this, e.key, { columns: o });
};
z = function(e, s, t) {
  const o = e.responsiveLayouts?.[t.key];
  return {
    columnSpan: Math.min(o?.columnSpan ?? e.columnSpan ?? t.columns, t.columns),
    rowSpan: o?.rowSpan ?? e.rowSpan ?? 1,
    order: o?.order ?? s + 1
  };
};
ee = function(e, s) {
  i(this, r, g).call(this, u(this, r, c).map((t, o) => {
    const a = s.get(t.key);
    if (!a) return t;
    const n = { ...i(this, r, z).call(this, t, o, e), ...a };
    return { ...t, responsiveLayouts: { ...t.responsiveLayouts, [e.key]: n } };
  }));
};
D = function(e) {
  const s = Math.max(this._columns, ...this._layouts.map((t) => t.columns));
  return e / s * 100;
};
te = function() {
  const e = { key: "grid", identifier: "grid", columns: this._columns }, s = u(this, r, c).map((t, o) => ({
    area: t,
    values: {
      columnSpan: Math.min(t.columnSpan ?? this._columns, this._columns),
      rowSpan: t.rowSpan ?? 1,
      order: o + 1
    }
  }));
  return d`<div class="layout">
      <p class="layout-header summary">${this._columns} columns, set in Grid.</p>
      <responsive-areas-layout-grid
        style="width:${i(this, r, D).call(this, this._columns)}%; --responsive-areas-columns:${this._columns};"
        .layout=${e}
        .items=${s}
        .workspacePath=${this._workspacePath}
        @values-change=${(t) => i(this, r, H).call(this, t.changes)}
        @area-delete=${(t) => i(this, r, K).call(this, t.key)}></responsive-areas-layout-grid>
      ${this._workspacePath ? d`<uui-button look="placeholder" label="Add area" href=${this._workspacePath + "create"}></uui-button>` : null}
    </div>`;
};
se = function(e) {
  const s = u(this, r, c).map((t, o) => ({ area: t, values: i(this, r, z).call(this, t, o, e) })).sort((t, o) => t.values.order - o.values.order);
  return d`<div class="layout">
      <div class="layout-header">
        <uui-label for="identifier-${e.key}">Identifier</uui-label>
        <uui-input
          id="identifier-${e.key}"
          label="Identifier"
          .value=${e.identifier}
          @change=${(t) => i(this, r, Q).call(this, e, t)}></uui-input>
        <uui-label for="columns-${e.key}">Columns</uui-label>
        <uui-input
          id="columns-${e.key}"
          type="number"
          min="1"
          max=${T}
          label="Columns"
          .value=${String(e.columns)}
          @change=${(t) => i(this, r, j).call(this, e, t)}></uui-input>
        <uui-button compact label="Remove layout ${e.identifier}" @click=${() => i(this, r, J).call(this, e.key)}>
          <uui-icon name="icon-trash"></uui-icon>
        </uui-button>
      </div>
      <responsive-areas-layout-grid
        style="width:${i(this, r, D).call(this, e.columns)}%; --responsive-areas-columns:${e.columns};"
        .layout=${e}
        .items=${s}
        @values-change=${(t) => i(this, r, ee).call(this, e, t.changes)}></responsive-areas-layout-grid>
    </div>`;
};
p.styles = [
  M`
      :host {
        display: block;
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
        margin: 0 0 var(--uui-size-space-3);
        min-height: 36px;
      }
      .layout-header uui-input[type="number"] {
        width: 6em;
      }
      .summary {
        color: var(--uui-color-text-alt);
      }
      uui-button[look="placeholder"] {
        width: 100%;
      }
      .layout uui-button[look="placeholder"] {
        margin-top: var(--uui-size-space-3);
      }
    `
];
f([
  _({ attribute: !1 })
], p.prototype, "value", 2);
f([
  _({ attribute: !1 })
], p.prototype, "config", 1);
f([
  b()
], p.prototype, "_columns", 2);
f([
  b()
], p.prototype, "_layouts", 2);
f([
  b()
], p.prototype, "_workspacePath", 2);
p = f([
  P("responsive-areas-areas-editor")
], p);
const Te = p;
export {
  p as ResponsiveAreasAreasEditorElement,
  Te as default
};
//# sourceMappingURL=responsive-areas-areas-editor.element-Drnj0J7-.js.map
