import { UmbLitElement as R } from "@umbraco-cms/backoffice/lit-element";
import { nothing as G, repeat as x, html as m, css as D, state as v, customElement as N } from "@umbraco-cms/backoffice/external/lit";
import { UMB_DATA_TYPE_WORKSPACE_CONTEXT as X } from "@umbraco-cms/backoffice/data-type";
import { UMB_PROPERTY_DATASET_CONTEXT as Y } from "@umbraco-cms/backoffice/property";
import { UmbId as F } from "@umbraco-cms/backoffice/id";
var K = Object.defineProperty, Z = Object.getOwnPropertyDescriptor, M = (e) => {
  throw TypeError(e);
}, h = (e, s, t, i) => {
  for (var o = i > 1 ? void 0 : i ? Z(s, t) : s, n = e.length - 1, u; n >= 0; n--)
    (u = e[n]) && (o = (i ? u(s, t, o) : u(o)) || o);
  return i && o && K(s, t, o), o;
}, A = (e, s, t) => s.has(e) || M("Cannot " + t), c = (e, s, t) => (A(e, s, "read from private field"), t ? t.call(e) : s.get(e)), _ = (e, s, t) => s.has(e) ? M("Cannot add the same private member more than once") : s instanceof WeakSet ? s.add(e) : s.set(e, t), $ = (e, s, t, i) => (A(e, s, "write to private field"), s.set(e, t), t), r = (e, s, t) => (A(e, s, "access private method"), t), d, p, b, a, k, g, z, T, S, P, I, L, E, O, f, U, V;
const W = "responsiveLayouts", C = 24;
let l = class extends R {
  constructor() {
    super(), _(this, a), _(this, d), this._layouts = [], this._areas = [], this._baseColumns = 12, _(this, p, 12), _(this, b), this.consumeContext(X, async (e) => {
      this.observe(
        await e?.propertyValueByAlias("gridColumns"),
        (s) => {
          $(this, p, s ? parseInt(s, 10) : 12), this._areaColumnsConfig = [
            { alias: "placeholder", value: c(this, p) },
            { alias: "min", value: 1 }
          ], this._areasConfig = [{ alias: "defaultAreaGridColumns", value: c(this, p) }], r(this, a, k).call(this);
        },
        "observeGridColumns"
      );
    }).passContextAliasMatches(), this.consumeContext(Y, async (e) => {
      $(this, d, e), this.observe(
        await e?.propertyValueByAlias(W),
        (s) => this._layouts = s ?? [],
        "observeLayouts"
      ), this.observe(
        await e?.propertyValueByAlias("areas"),
        (s) => this._areas = s ?? [],
        "observeAreas"
      ), this.observe(
        await e?.propertyValueByAlias("areaGridColumns"),
        (s) => {
          const t = typeof s == "string" ? parseInt(s, 10) : s;
          $(this, b, t && t > 0 ? t : void 0), r(this, a, k).call(this);
        },
        "observeAreaGridColumns"
      );
    });
  }
  render() {
    return this._areasConfig ? m`<uui-box headline="Areas">
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
              ${x(
      this._layouts,
      (e) => e.key,
      (e) => r(this, a, V).call(this, e)
    )}
              <uui-button look="placeholder" label="Add layout" @click=${r(this, a, z)}></uui-button>
            </div>
          </umb-property-layout>
        </uui-box>` : G;
  }
};
d = /* @__PURE__ */ new WeakMap();
p = /* @__PURE__ */ new WeakMap();
b = /* @__PURE__ */ new WeakMap();
a = /* @__PURE__ */ new WeakSet();
k = function() {
  this._baseColumns = c(this, b) ?? c(this, p);
};
g = function(e) {
  c(this, d)?.setPropertyValue(W, e);
};
z = function() {
  const e = this._layouts[this._layouts.length - 1]?.columns ?? this._baseColumns, s = Math.max(1, e - 3);
  r(this, a, g).call(this, [...this._layouts, { key: F.new(), identifier: String(s), columns: s }]);
};
T = function(e) {
  r(this, a, g).call(this, this._layouts.filter((s) => s.key !== e)), r(this, a, L).call(this, this._areas.map((s) => {
    if (!s.responsiveLayouts?.[e]) return s;
    const { [e]: t, ...i } = s.responsiveLayouts;
    return { ...s, responsiveLayouts: i };
  }));
};
S = function(e, s) {
  r(this, a, g).call(this, this._layouts.map((t) => t.key === e ? { ...t, ...s } : t));
};
P = function(e, s) {
  const t = s.target.value.replace(/[^A-Za-z0-9_-]/g, ""), i = { identifier: t }, o = parseInt(t, 10);
  o >= 1 && (i.columns = Math.min(C, o)), r(this, a, S).call(this, e.key, i);
};
I = function(e, s) {
  const t = parseInt(s.target.value, 10), i = Math.max(1, Math.min(C, t || 1));
  r(this, a, S).call(this, e.key, { columns: i });
};
L = function(e) {
  c(this, d)?.setPropertyValue("areas", e);
};
E = function(e, s, t) {
  const i = e.responsiveLayouts?.[t.key];
  return {
    columnSpan: Math.min(i?.columnSpan ?? e.columnSpan ?? t.columns, t.columns),
    rowSpan: i?.rowSpan ?? e.rowSpan ?? 1,
    order: i?.order ?? s + 1
  };
};
O = function(e, s, t, i, o) {
  const n = parseInt(o.target.value, 10), u = i === "columnSpan" ? e.columns : i === "order" ? this._areas.length : C, w = Math.max(1, Math.min(u, n || 1)), B = { ...r(this, a, E).call(this, s, t, e), [i]: w };
  r(this, a, L).call(this, this._areas.map(
    (y) => y.key === s.key ? { ...y, responsiveLayouts: { ...y.responsiveLayouts, [e.key]: B } } : y
  ));
};
f = function(e, s, t, i, o, n) {
  const u = `${i}-${e.key}-${s.key}`;
  return m`<span class="number">
      <uui-label for=${u}>${o}</uui-label>
      <uui-input
        id=${u}
        type="number"
        min="1"
        label="${o} for ${s.alias ?? "area"} in layout ${e.identifier}"
        .value=${String(n)}
        @change=${(w) => r(this, a, O).call(this, e, s, t, i, w)}></uui-input>
    </span>`;
};
U = function(e) {
  const s = Math.max(this._baseColumns, ...this._layouts.map((i) => i.columns)), t = e.columns / s * 100;
  return m`<div class="layout-grid" style="width:${t}%; grid-template-columns: repeat(${e.columns}, minmax(0, 1fr));">
      ${x(
    this._areas,
    (i) => i.key,
    (i, o) => {
      const n = r(this, a, E).call(this, i, o, e);
      return m`<div class="area" style="grid-column: span ${n.columnSpan}; grid-row: span ${n.rowSpan}; order: ${n.order};">
            <strong class="alias">${i.alias}</strong>
            <div class="numbers">
              ${r(this, a, f).call(this, e, i, o, "columnSpan", "Columns", n.columnSpan)}
              ${r(this, a, f).call(this, e, i, o, "rowSpan", "Rows", n.rowSpan)}
              ${r(this, a, f).call(this, e, i, o, "order", "Order", n.order)}
            </div>
          </div>`;
    }
  )}
    </div>`;
};
V = function(e) {
  return m`<div class="layout">
      <div class="layout-header">
        <uui-label for="identifier-${e.key}">Identifier</uui-label>
        <uui-input
          id="identifier-${e.key}"
          label="Identifier"
          .value=${e.identifier}
          @change=${(s) => r(this, a, P).call(this, e, s)}></uui-input>
        <uui-label for="columns-${e.key}">Columns</uui-label>
        <uui-input
          id="columns-${e.key}"
          type="number"
          min="1"
          max=${C}
          label="Columns"
          .value=${String(e.columns)}
          @change=${(s) => r(this, a, I).call(this, e, s)}></uui-input>
        <uui-button
          compact
          label="Remove layout ${e.identifier}"
          @click=${() => r(this, a, T).call(this, e.key)}>
          <uui-icon name="icon-trash"></uui-icon>
        </uui-button>
      </div>
      ${r(this, a, U).call(this, e)}
    </div>`;
};
l.styles = [
  D`
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
        background: var(--uui-color-surface-alt);
        border: 1px solid var(--uui-color-border-emphasis);
        border-radius: var(--uui-border-radius);
        padding: var(--uui-size-space-3);
        min-width: 0;
      }
      .alias {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: var(--uui-size-space-2);
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
h([
  v()
], l.prototype, "_areaColumnsConfig", 2);
h([
  v()
], l.prototype, "_areasConfig", 2);
h([
  v()
], l.prototype, "_layouts", 2);
h([
  v()
], l.prototype, "_areas", 2);
h([
  v()
], l.prototype, "_baseColumns", 2);
l = h([
  N("responsive-areas-workspace-view")
], l);
const ee = l;
export {
  l as ResponsiveAreasWorkspaceViewElement,
  ee as default
};
//# sourceMappingURL=responsive-areas-workspace-view.element-Bu2hGHyW.js.map
