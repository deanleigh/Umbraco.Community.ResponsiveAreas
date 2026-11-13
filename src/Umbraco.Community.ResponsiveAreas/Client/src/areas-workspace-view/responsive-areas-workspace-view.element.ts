import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { css, html, customElement } from "@umbraco-cms/backoffice/external/lit";
import type { UmbWorkspaceViewElement } from "@umbraco-cms/backoffice/workspace";

@customElement("responsive-areas-workspace-view")
export class ResponsiveAreasWorkspaceViewElement extends UmbLitElement implements UmbWorkspaceViewElement {
  override render() {
    return html`<uui-box headline="Areas">Hello Areas</uui-box>`;
  }

  static override styles = [
    css`
      :host {
        display: block;
        margin: var(--uui-size-layout-1);
      }
    `,
  ];
}

export default ResponsiveAreasWorkspaceViewElement;

declare global {
  interface HTMLElementTagNameMap {
    "responsive-areas-workspace-view": ResponsiveAreasWorkspaceViewElement;
  }
}
