import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { css, html, customElement, state, nothing } from "@umbraco-cms/backoffice/external/lit";
import type { UmbWorkspaceViewElement } from "@umbraco-cms/backoffice/workspace";
import type { UmbPropertyEditorConfig } from "@umbraco-cms/backoffice/property-editor";
import { UMB_DATA_TYPE_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/data-type";

// Starts as a copy of core's Areas view (block-grid-type-workspace-view-areas.element.ts),
// so the tab looks and behaves exactly like core. Layouts are added on top of this.
@customElement("responsive-areas-workspace-view")
export class ResponsiveAreasWorkspaceViewElement extends UmbLitElement implements UmbWorkspaceViewElement {
  // The data type's Grid Columns drive the placeholder and the default area columns.
  @state()
  private _areaColumnsConfig?: UmbPropertyEditorConfig;

  @state()
  private _areasConfig?: UmbPropertyEditorConfig;

  constructor() {
    super();
    this.consumeContext(UMB_DATA_TYPE_WORKSPACE_CONTEXT, async (context) => {
      this.observe(
        await context?.propertyValueByAlias<undefined | string>("gridColumns"),
        (value) => {
          const dataTypeGridColumns = value ? parseInt(value, 10) : 12;
          this._areaColumnsConfig = [
            { alias: "placeholder", value: dataTypeGridColumns },
            { alias: "min", value: 1 },
          ];
          this._areasConfig = [{ alias: "defaultAreaGridColumns", value: dataTypeGridColumns }];
        },
        "observeGridColumns",
      );
    }).passContextAliasMatches();
  }

  override render() {
    return this._areasConfig
      ? html`<uui-box headline="Areas">
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
        </uui-box>`
      : nothing;
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
