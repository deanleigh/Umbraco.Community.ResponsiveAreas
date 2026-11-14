import { UmbLitElement as w } from "@umbraco-cms/backoffice/lit-element";
import { nothing as k, html as p, css as A, state as d, customElement as E } from "@umbraco-cms/backoffice/external/lit";
import { UMB_DATA_TYPE_WORKSPACE_CONTEXT as x } from "@umbraco-cms/backoffice/data-type";
import { UMB_PROPERTY_DATASET_CONTEXT as $ } from "@umbraco-cms/backoffice/property";
var G = Object.defineProperty, S = Object.getOwnPropertyDescriptor, v = (t) => {
  throw TypeError(t);
}, u = (t, e, a, s) => {
  for (var r = s > 1 ? void 0 : s ? S(e, a) : e, c = t.length - 1, h; c >= 0; c--)
    (h = t[c]) && (r = (s ? h(e, a, r) : h(r)) || r);
  return s && r && G(e, a, r), r;
}, _ = (t, e, a) => e.has(t) || v("Cannot " + a), f = (t, e, a) => (_(t, e, "read from private field"), e.get(t)), C = (t, e, a) => e.has(t) ? v("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), P = (t, e, a, s) => (_(t, e, "write to private field"), e.set(t, a), a), n = (t, e, a) => (_(t, e, "access private method"), a), l, i, m, b, y, g;
const T = 24;
let o = class extends w {
  constructor() {
    super(), C(this, i), C(this, l), this._baseColumns = 12, this._dataTypeColumns = 12, this.consumeContext(x, async (t) => {
      this.observe(
        await t?.propertyValueByAlias("gridColumns"),
        (e) => {
          this._dataTypeColumns = e ? parseInt(e, 10) : 12, this._areasConfig = [{ alias: "defaultAreaGridColumns", value: this._dataTypeColumns }], n(this, i, m).call(this);
        },
        "observeGridColumns"
      );
    }).passContextAliasMatches(), this.consumeContext($, async (t) => {
      P(this, l, t), this.observe(
        await t?.propertyValueByAlias("areaGridColumns"),
        (e) => {
          const a = typeof e == "string" ? parseInt(e, 10) : e;
          this._blockColumns = a && a > 0 ? a : void 0, n(this, i, m).call(this);
        },
        "observeAreaGridColumns"
      );
    });
  }
  render() {
    return this._areasConfig ? p`${n(this, i, g).call(this)}
          <uui-box headline="Areas">
            <umb-property
              label=${this.localize.term("blockEditor_areasConfigurations")}
              description="Add areas in the first layout. Each layout below rearranges the same areas at a breakpoint. The breakpoint alias is the name your site's CSS uses for it, for example md, or a column count such as 9. Order in a layout changes what you see, not the reading order, so arrange the first layout in reading order."
              alias="areas"
              property-editor-ui-alias="ResponsiveAreas.PropertyEditorUi.Areas"
              .config=${[{ alias: "areaGridColumns", value: this._baseColumns }]}></umb-property>
          </uui-box>` : k;
  }
};
l = /* @__PURE__ */ new WeakMap();
i = /* @__PURE__ */ new WeakSet();
m = function() {
  this._baseColumns = this._blockColumns ?? this._dataTypeColumns;
};
b = function(t) {
  const e = t.target, a = parseInt(e.value, 10);
  if (!a || a === this._dataTypeColumns) {
    n(this, i, y).call(this), e.value = String(this._dataTypeColumns);
    return;
  }
  const s = Math.max(1, Math.min(T, a));
  e.value = String(s), f(this, l)?.setPropertyValue("areaGridColumns", s);
};
y = function() {
  f(this, l)?.setPropertyValue("areaGridColumns", void 0);
};
g = function() {
  const t = this._blockColumns !== void 0;
  return p`<uui-box headline="Grid">
      <umb-property-layout
        label=${this.localize.term("blockEditor_areasLayoutColumns")}
        description="How many columns this block's areas sit in. Filled in from the Block Grid data type. Change it to give this block a different grid.">
        <div slot="editor" class="grid-columns">
          <uui-input
            id="grid-columns"
            type="number"
            min="1"
            max=${T}
            label=${this.localize.term("blockEditor_areasLayoutColumns")}
            .value=${String(this._baseColumns)}
            @change=${n(this, i, b)}></uui-input>
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
o.styles = [
  A`
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
], o.prototype, "_areasConfig", 2);
u([
  d()
], o.prototype, "_baseColumns", 2);
u([
  d()
], o.prototype, "_dataTypeColumns", 2);
u([
  d()
], o.prototype, "_blockColumns", 2);
o = u([
  E("responsive-areas-workspace-view")
], o);
const W = o;
export {
  o as ResponsiveAreasWorkspaceViewElement,
  W as default
};
//# sourceMappingURL=responsive-areas-workspace-view.element-DYO7zoPZ.js.map
