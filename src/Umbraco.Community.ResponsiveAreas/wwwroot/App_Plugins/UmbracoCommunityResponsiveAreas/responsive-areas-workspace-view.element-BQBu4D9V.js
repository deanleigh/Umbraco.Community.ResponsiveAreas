import { UmbLitElement as n } from "@umbraco-cms/backoffice/lit-element";
import { html as p, css as u, customElement as m } from "@umbraco-cms/backoffice/external/lit";
var c = Object.getOwnPropertyDescriptor, v = (t, a, i, o) => {
  for (var e = o > 1 ? void 0 : o ? c(a, i) : a, r = t.length - 1, l; r >= 0; r--)
    (l = t[r]) && (e = l(e) || e);
  return e;
};
let s = class extends n {
  render() {
    return p`<uui-box headline="Areas">Hello Areas</uui-box>`;
  }
};
s.styles = [
  u`
      :host {
        display: block;
        margin: var(--uui-size-layout-1);
      }
    `
];
s = v([
  m("responsive-areas-workspace-view")
], s);
const b = s;
export {
  s as ResponsiveAreasWorkspaceViewElement,
  b as default
};
//# sourceMappingURL=responsive-areas-workspace-view.element-BQBu4D9V.js.map
