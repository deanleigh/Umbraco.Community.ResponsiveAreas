import { UmbLitElement as u } from "@umbraco-cms/backoffice/lit-element";
import { nothing as m, html as c, css as C, state as p, customElement as f } from "@umbraco-cms/backoffice/external/lit";
import { UMB_DATA_TYPE_WORKSPACE_CONTEXT as _ } from "@umbraco-cms/backoffice/data-type";
var d = Object.defineProperty, b = Object.getOwnPropertyDescriptor, n = (s, e, a, t) => {
  for (var r = t > 1 ? void 0 : t ? b(e, a) : e, i = s.length - 1, l; i >= 0; i--)
    (l = s[i]) && (r = (t ? l(e, a, r) : l(r)) || r);
  return t && r && d(e, a, r), r;
};
let o = class extends u {
  constructor() {
    super(), this.consumeContext(_, async (s) => {
      this.observe(
        await s?.propertyValueByAlias("gridColumns"),
        (e) => {
          const a = e ? parseInt(e, 10) : 12;
          this._areaColumnsConfig = [
            { alias: "placeholder", value: a },
            { alias: "min", value: 1 }
          ], this._areasConfig = [{ alias: "defaultAreaGridColumns", value: a }];
        },
        "observeGridColumns"
      );
    }).passContextAliasMatches();
  }
  render() {
    return this._areasConfig ? c`<uui-box headline="Areas">
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
        </uui-box>` : m;
  }
};
o.styles = [
  C`
      :host {
        display: block;
        margin: var(--uui-size-layout-1);
      }
    `
];
n([
  p()
], o.prototype, "_areaColumnsConfig", 2);
n([
  p()
], o.prototype, "_areasConfig", 2);
o = n([
  f("responsive-areas-workspace-view")
], o);
const v = o;
export {
  o as ResponsiveAreasWorkspaceViewElement,
  v as default
};
//# sourceMappingURL=responsive-areas-workspace-view.element-Cxe0Zp-I.js.map
