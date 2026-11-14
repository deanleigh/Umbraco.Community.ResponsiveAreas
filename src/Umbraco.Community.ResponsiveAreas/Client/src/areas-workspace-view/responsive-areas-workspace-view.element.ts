import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { css, html, customElement, state, nothing } from "@umbraco-cms/backoffice/external/lit";
import type { UmbWorkspaceViewElement } from "@umbraco-cms/backoffice/workspace";
import type { UmbPropertyEditorConfig } from "@umbraco-cms/backoffice/property-editor";
import { UMB_DATA_TYPE_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/data-type";
import { UMB_PROPERTY_DATASET_CONTEXT, type UmbPropertyDatasetContext } from "@umbraco-cms/backoffice/property";

const MAX_COLUMNS = 24;

// Replaces core's Areas view (block-grid-type-workspace-view-areas.element.ts).
// A Grid box for the column count, then one Areas row: the areas and every layout (Decision 006).
@customElement("responsive-areas-workspace-view")
export class ResponsiveAreasWorkspaceViewElement extends UmbLitElement implements UmbWorkspaceViewElement {
  #dataset?: UmbPropertyDatasetContext;

  @state()
  private _areasConfig?: UmbPropertyEditorConfig;

  // Columns of the first layout: the block's own Grid Columns, else the data type's.
  @state()
  private _baseColumns = 12;

  // The data type's Grid Columns, shown so editors can see what the block follows.
  @state()
  private _dataTypeColumns = 12;

  // The block's own Grid Columns for Areas (core's areaGridColumns). Undefined means it follows the data type.
  @state()
  private _blockColumns?: number;

  constructor() {
    super();

    this.consumeContext(UMB_DATA_TYPE_WORKSPACE_CONTEXT, async (context) => {
      this.observe(
        await context?.propertyValueByAlias<undefined | string>("gridColumns"),
        (value) => {
          this._dataTypeColumns = value ? parseInt(value, 10) : 12;
          this._areasConfig = [{ alias: "defaultAreaGridColumns", value: this._dataTypeColumns }];
          this.#updateBaseColumns();
        },
        "observeGridColumns",
      );
    }).passContextAliasMatches();

    // The block type's own values live in the workspace's property dataset.
    this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, async (dataset) => {
      this.#dataset = dataset;
      this.observe(
        await dataset?.propertyValueByAlias<number | string | null>("areaGridColumns"),
        (value) => {
          const n = typeof value === "string" ? parseInt(value, 10) : value;
          this._blockColumns = n && n > 0 ? n : undefined;
          this.#updateBaseColumns();
        },
        "observeAreaGridColumns",
      );
    });
  }

  #updateBaseColumns() {
    this._baseColumns = this._blockColumns ?? this._dataTypeColumns;
  }

  // ---------- Grid ----------

  // Empty, or the data type's own number, means "follow the data type": nothing is stored,
  // exactly as core does when its box is left empty.
  #onGridColumnsChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    if (!value || value === this._dataTypeColumns) {
      this.#followDataType();
      input.value = String(this._dataTypeColumns);
      return;
    }
    const columns = Math.max(1, Math.min(MAX_COLUMNS, value));
    input.value = String(columns);
    this.#dataset?.setPropertyValue("areaGridColumns", columns);
  }

  #followDataType() {
    this.#dataset?.setPropertyValue("areaGridColumns", undefined);
  }

  #renderGrid() {
    const overridden = this._blockColumns !== undefined;
    return html`<uui-box headline="Grid">
      <umb-property-layout
        label=${this.localize.term("blockEditor_areasLayoutColumns")}
        description="How many columns this block's areas sit in. Filled in from the Block Grid data type. Change it to give this block a different grid.">
        <div slot="editor" class="grid-columns">
          <uui-input
            id="grid-columns"
            type="number"
            min="1"
            max=${MAX_COLUMNS}
            label=${this.localize.term("blockEditor_areasLayoutColumns")}
            .value=${String(this._baseColumns)}
            @change=${this.#onGridColumnsChange}></uui-input>
          <span class="grid-status" aria-live="polite">
            ${overridden
              ? html`Set for this block. The data type uses ${this._dataTypeColumns}.
                  <uui-button
                    look="secondary"
                    compact
                    label="Use the data type's ${this._dataTypeColumns}"
                    @click=${this.#followDataType}></uui-button>`
              : html`Following the data type (${this._dataTypeColumns}).`}
          </span>
        </div>
      </umb-property-layout>
    </uui-box>`;
  }

  override render() {
    return this._areasConfig
      ? html`${this.#renderGrid()}
          <uui-box headline="Areas">
            <umb-property
              label=${this.localize.term("blockEditor_areasConfigurations")}
              description="Add areas in the first layout. Each layout below rearranges the same areas at a breakpoint. The breakpoint alias is the name your site's CSS uses for it, for example md, or a column count such as 9. Order in a layout changes what you see, not the reading order, so arrange the first layout in reading order."
              alias="areas"
              property-editor-ui-alias="ResponsiveAreas.PropertyEditorUi.Areas"
              .config=${[{ alias: "areaGridColumns", value: this._baseColumns }]}></umb-property>
          </uui-box>`
      : nothing;
  }

  static override styles = [
    css`
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
    `,
  ];
}

export default ResponsiveAreasWorkspaceViewElement;

declare global {
  interface HTMLElementTagNameMap {
    "responsive-areas-workspace-view": ResponsiveAreasWorkspaceViewElement;
  }
}
