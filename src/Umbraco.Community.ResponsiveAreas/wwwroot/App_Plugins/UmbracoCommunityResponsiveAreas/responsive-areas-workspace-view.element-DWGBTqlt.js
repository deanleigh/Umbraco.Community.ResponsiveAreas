import { UmbLitElement as x } from "@umbraco-cms/backoffice/lit-element";
import { nothing as I, repeat as O, html as A, css as S, state as _, customElement as U } from "@umbraco-cms/backoffice/external/lit";
import { UMB_DATA_TYPE_WORKSPACE_CONTEXT as W } from "@umbraco-cms/backoffice/data-type";
import { UMB_PROPERTY_DATASET_CONTEXT as z } from "@umbraco-cms/backoffice/property";
import { UmbId as B } from "@umbraco-cms/backoffice/id";
var G = Object.defineProperty, R = Object.getOwnPropertyDescriptor, w = (e) => {
  throw TypeError(e);
}, p = (e, t, i, o) => {
  for (var r = o > 1 ? void 0 : o ? R(t, i) : t, y = e.length - 1, f; y >= 0; y--)
    (f = e[y]) && (r = (o ? f(t, i, r) : f(r)) || r);
  return o && r && G(t, i, r), r;
}, b = (e, t, i) => t.has(e) || w("Cannot " + i), u = (e, t, i) => (b(e, t, "read from private field"), i ? i.call(e) : t.get(e)), c = (e, t, i) => t.has(e) ? w("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, i), v = (e, t, i, o) => (b(e, t, "write to private field"), t.set(e, i), i), a = (e, t, i) => (b(e, t, "access private method"), i), h, l, m, s, C, d, E, $, g, L, M, T;
const P = "responsiveLayouts", k = 24;
let n = class extends x {
  constructor() {
    super(), c(this, s), c(this, h), this._layouts = [], this._baseColumns = 12, c(this, l, 12), c(this, m), this.consumeContext(W, async (e) => {
      this.observe(
        await e?.propertyValueByAlias("gridColumns"),
        (t) => {
          v(this, l, t ? parseInt(t, 10) : 12), this._areaColumnsConfig = [
            { alias: "placeholder", value: u(this, l) },
            { alias: "min", value: 1 }
          ], this._areasConfig = [{ alias: "defaultAreaGridColumns", value: u(this, l) }], a(this, s, C).call(this);
        },
        "observeGridColumns"
      );
    }).passContextAliasMatches(), this.consumeContext(z, async (e) => {
      v(this, h, e), this.observe(
        await e?.propertyValueByAlias(P),
        (t) => this._layouts = t ?? [],
        "observeLayouts"
      ), this.observe(
        await e?.propertyValueByAlias("areaGridColumns"),
        (t) => {
          const i = typeof t == "string" ? parseInt(t, 10) : t;
          v(this, m, i && i > 0 ? i : void 0), a(this, s, C).call(this);
        },
        "observeAreaGridColumns"
      );
    });
  }
  render() {
    return this._areasConfig ? A`<uui-box headline="Areas">
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
              ${O(
      this._layouts,
      (e) => e.key,
      (e) => a(this, s, T).call(this, e)
    )}
              <uui-button look="placeholder" label="Add layout" @click=${a(this, s, E)}></uui-button>
            </div>
          </umb-property-layout>
        </uui-box>` : I;
  }
};
h = /* @__PURE__ */ new WeakMap();
l = /* @__PURE__ */ new WeakMap();
m = /* @__PURE__ */ new WeakMap();
s = /* @__PURE__ */ new WeakSet();
C = function() {
  this._baseColumns = u(this, m) ?? u(this, l);
};
d = function(e) {
  u(this, h)?.setPropertyValue(P, e);
};
E = function() {
  const e = this._layouts[this._layouts.length - 1]?.columns ?? this._baseColumns, t = Math.max(1, e - 3);
  a(this, s, d).call(this, [...this._layouts, { key: B.new(), identifier: String(t), columns: t }]);
};
$ = function(e) {
  a(this, s, d).call(this, this._layouts.filter((t) => t.key !== e));
};
g = function(e, t) {
  a(this, s, d).call(this, this._layouts.map((i) => i.key === e ? { ...i, ...t } : i));
};
L = function(e, t) {
  const i = t.target.value.replace(/[^A-Za-z0-9_-]/g, ""), o = { identifier: i }, r = parseInt(i, 10);
  r >= 1 && (o.columns = Math.min(k, r)), a(this, s, g).call(this, e.key, o);
};
M = function(e, t) {
  const i = parseInt(t.target.value, 10), o = Math.max(1, Math.min(k, i || 1));
  a(this, s, g).call(this, e.key, { columns: o });
};
T = function(e) {
  return A`<div class="layout">
      <uui-label for="identifier-${e.key}">Identifier</uui-label>
      <uui-input
        id="identifier-${e.key}"
        label="Identifier"
        .value=${e.identifier}
        @change=${(t) => a(this, s, L).call(this, e, t)}></uui-input>
      <uui-label for="columns-${e.key}">Columns</uui-label>
      <uui-input
        id="columns-${e.key}"
        type="number"
        min="1"
        max=${k}
        label="Columns"
        .value=${String(e.columns)}
        @change=${(t) => a(this, s, M).call(this, e, t)}></uui-input>
      <uui-button
        compact
        label="Remove layout ${e.identifier}"
        @click=${() => a(this, s, $).call(this, e.key)}>
        <uui-icon name="icon-trash"></uui-icon>
      </uui-button>
    </div>`;
};
n.styles = [
  S`
      :host {
        display: block;
        margin: var(--uui-size-layout-1);
      }
      .layout {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-3);
        margin-bottom: var(--uui-size-space-3);
      }
      .layout uui-input[type="number"] {
        width: 6em;
      }
      uui-button[look="placeholder"] {
        width: 100%;
      }
    `
];
p([
  _()
], n.prototype, "_areaColumnsConfig", 2);
p([
  _()
], n.prototype, "_areasConfig", 2);
p([
  _()
], n.prototype, "_layouts", 2);
p([
  _()
], n.prototype, "_baseColumns", 2);
n = p([
  U("responsive-areas-workspace-view")
], n);
const K = n;
export {
  n as ResponsiveAreasWorkspaceViewElement,
  K as default
};
//# sourceMappingURL=responsive-areas-workspace-view.element-DWGBTqlt.js.map
