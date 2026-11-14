import { UmbLitElement as w } from "@umbraco-cms/backoffice/lit-element";
import { nothing as A, html as p, css as x, state as d, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UMB_DATA_TYPE_WORKSPACE_CONTEXT as k } from "@umbraco-cms/backoffice/data-type";
import { UMB_PROPERTY_DATASET_CONTEXT as G } from "@umbraco-cms/backoffice/property";
var P = Object.defineProperty, $ = Object.getOwnPropertyDescriptor, v = (t) => {
  throw TypeError(t);
}, u = (t, e, s, a) => {
  for (var o = a > 1 ? void 0 : a ? $(e, s) : e, c = t.length - 1, h; c >= 0; c--)
    (h = t[c]) && (o = (a ? h(e, s, o) : h(o)) || o);
  return a && o && P(e, s, o), o;
}, _ = (t, e, s) => e.has(t) || v("Cannot " + s), f = (t, e, s) => (_(t, e, "read from private field"), e.get(t)), C = (t, e, s) => e.has(t) ? v("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, s), O = (t, e, s, a) => (_(t, e, "write to private field"), e.set(t, s), s), n = (t, e, s) => (_(t, e, "access private method"), s), l, i, m, g, y, b;
const T = 24;
let r = class extends w {
  constructor() {
    super(), C(this, i), C(this, l), this._baseColumns = 12, this._dataTypeColumns = 12, this.consumeContext(k, async (t) => {
      this.observe(
        await t?.propertyValueByAlias("gridColumns"),
        (e) => {
          this._dataTypeColumns = e ? parseInt(e, 10) : 12, this._areasConfig = [{ alias: "defaultAreaGridColumns", value: this._dataTypeColumns }], n(this, i, m).call(this);
        },
        "observeGridColumns"
      );
    }).passContextAliasMatches(), this.consumeContext(G, async (t) => {
      O(this, l, t), this.observe(
        await t?.propertyValueByAlias("areaGridColumns"),
        (e) => {
          const s = typeof e == "string" ? parseInt(e, 10) : e;
          this._blockColumns = s && s > 0 ? s : void 0, n(this, i, m).call(this);
        },
        "observeAreaGridColumns"
      );
    });
  }
  render() {
    return this._areasConfig ? p`${n(this, i, b).call(this)}
          <uui-box headline="Areas">
            <umb-property
              label=${this.localize.term("blockEditor_areasConfigurations")}
              description="Add areas in the first layout. Each layout below rearranges the same areas, for example for a smaller screen. Order in a layout changes what you see, not the reading order, so arrange the first layout in reading order."
              alias="areas"
              property-editor-ui-alias="ResponsiveAreas.PropertyEditorUi.Areas"
              .config=${[{ alias: "areaGridColumns", value: this._baseColumns }]}></umb-property>
          </uui-box>` : A;
  }
};
l = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
m = function() {
  this._baseColumns = this._blockColumns ?? this._dataTypeColumns;
};
g = function(t) {
  const e = t.target, s = parseInt(e.value, 10);
  if (!s || s === this._dataTypeColumns) {
    n(this, i, y).call(this), e.value = String(this._dataTypeColumns);
    return;
  }
  const a = Math.max(1, Math.min(T, s));
  e.value = String(a), f(this, l)?.setPropertyValue("areaGridColumns", a);
};
y = function() {
  f(this, l)?.setPropertyValue("areaGridColumns", void 0);
};
b = function() {
  const t = this._blockColumns !== void 0;
  return p`<uui-box headline="Grid">
      <umb-property-layout
        label="Columns"
        description="How many columns this block's areas sit in. Filled in from the Block Grid data type. Change it to give this block a different grid.">
        <div slot="editor" class="grid-columns">
          <uui-input
            id="grid-columns"
            type="number"
            min="1"
            max=${T}
            label="Grid columns"
            .value=${String(this._baseColumns)}
            @change=${n(this, i, g)}></uui-input>
          <span class="grid-status" aria-live="polite">
            ${t ? p`Set for this block. The data type uses ${this._dataTypeColumns}.
                  <uui-button
                    look="secondary"
                    compact
                    label="Use the data type's ${this._dataTypeColumns}"
                    @click=${n(this, i, y)}></uui-button>` : p`Following the data type (${this._dataTypeColumns}).`}
          </span>
        </div>
      </umb-property-layout>
    </uui-box>`;
};
r.styles = [
  x`
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
    `
];
u([
  d()
], r.prototype, "_areasConfig", 2);
u([
  d()
], r.prototype, "_baseColumns", 2);
u([
  d()
], r.prototype, "_dataTypeColumns", 2);
u([
  d()
], r.prototype, "_blockColumns", 2);
r = u([
  E("responsive-areas-workspace-view")
], r);
const W = r;
export {
  r as ResponsiveAreasWorkspaceViewElement,
  W as default
};
//# sourceMappingURL=responsive-areas-workspace-view.element-BAB1GMgK.js.map
