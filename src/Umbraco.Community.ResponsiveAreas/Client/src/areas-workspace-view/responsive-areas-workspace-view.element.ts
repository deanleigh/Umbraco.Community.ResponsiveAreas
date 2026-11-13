import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { css, html, customElement, state, nothing, repeat } from "@umbraco-cms/backoffice/external/lit";
import type { UmbWorkspaceViewElement } from "@umbraco-cms/backoffice/workspace";
import type { UmbPropertyEditorConfig } from "@umbraco-cms/backoffice/property-editor";
import { UMB_DATA_TYPE_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/data-type";
import { UMB_PROPERTY_DATASET_CONTEXT, type UmbPropertyDatasetContext } from "@umbraco-cms/backoffice/property";
import { UmbId } from "@umbraco-cms/backoffice/id";
import type { ResponsiveLayout } from "./types.js";

const LAYOUTS_ALIAS = "responsiveLayouts";
const MAX_COLUMNS = 24;

// Starts as a copy of core's Areas view (block-grid-type-workspace-view-areas.element.ts),
// so the tab looks and behaves exactly like core. Layouts are added below core's editors.
@customElement("responsive-areas-workspace-view")
export class ResponsiveAreasWorkspaceViewElement extends UmbLitElement implements UmbWorkspaceViewElement {
  #dataset?: UmbPropertyDatasetContext;

  // The data type's Grid Columns drive the placeholder and the default area columns.
  @state()
  private _areaColumnsConfig?: UmbPropertyEditorConfig;

  @state()
  private _areasConfig?: UmbPropertyEditorConfig;

  @state()
  private _layouts: Array<ResponsiveLayout> = [];

  // Columns of the base layout: the block's own Grid Columns, else the data type's.
  @state()
  private _baseColumns = 12;

  #dataTypeColumns = 12;
  #blockColumns?: number;

  constructor() {
    super();

    this.consumeContext(UMB_DATA_TYPE_WORKSPACE_CONTEXT, async (context) => {
      this.observe(
        await context?.propertyValueByAlias<undefined | string>("gridColumns"),
        (value) => {
          this.#dataTypeColumns = value ? parseInt(value, 10) : 12;
          this._areaColumnsConfig = [
            { alias: "placeholder", value: this.#dataTypeColumns },
            { alias: "min", value: 1 },
          ];
          this._areasConfig = [{ alias: "defaultAreaGridColumns", value: this.#dataTypeColumns }];
          this.#updateBaseColumns();
        },
        "observeGridColumns",
      );
    }).passContextAliasMatches();

    // The block type's own values (layouts, areaGridColumns) live in the workspace's property dataset.
    this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, async (dataset) => {
      this.#dataset = dataset;
      this.observe(
        await dataset?.propertyValueByAlias<Array<ResponsiveLayout>>(LAYOUTS_ALIAS),
        (layouts) => (this._layouts = layouts ?? []),
        "observeLayouts",
      );
      this.observe(
        await dataset?.propertyValueByAlias<number | string | null>("areaGridColumns"),
        (value) => {
          const n = typeof value === "string" ? parseInt(value, 10) : value;
          this.#blockColumns = n && n > 0 ? n : undefined;
          this.#updateBaseColumns();
        },
        "observeAreaGridColumns",
      );
    });
  }

  #updateBaseColumns() {
    this._baseColumns = this.#blockColumns ?? this.#dataTypeColumns;
  }

  #setLayouts(layouts: Array<ResponsiveLayout>) {
    this.#dataset?.setPropertyValue(LAYOUTS_ALIAS, layouts);
  }

  #addLayout() {
    // Start from the previous layout's column count, minus 3, as in the mockup.
    const previous = this._layouts[this._layouts.length - 1]?.columns ?? this._baseColumns;
    const columns = Math.max(1, previous - 3);
    this.#setLayouts([...this._layouts, { key: UmbId.new(), identifier: String(columns), columns }]);
  }

  #removeLayout(key: string) {
    this.#setLayouts(this._layouts.filter((x) => x.key !== key));
  }

  #updateLayout(key: string, changes: Partial<ResponsiveLayout>) {
    this.#setLayouts(this._layouts.map((x) => (x.key === key ? { ...x, ...changes } : x)));
  }

  #onIdentifierChange(layout: ResponsiveLayout, event: Event) {
    // Identifiers end up in CSS variable names, so only CSS-safe characters (Decision 004).
    const identifier = (event.target as HTMLInputElement).value.replace(/[^A-Za-z0-9_-]/g, "");
    const changes: Partial<ResponsiveLayout> = { identifier };
    // A leading number pre-fills Columns: "9" or "9-special" gives 9 columns.
    const leading = parseInt(identifier, 10);
    if (leading >= 1) changes.columns = Math.min(MAX_COLUMNS, leading);
    this.#updateLayout(layout.key, changes);
  }

  #onColumnsChange(layout: ResponsiveLayout, event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    const columns = Math.max(1, Math.min(MAX_COLUMNS, value || 1));
    this.#updateLayout(layout.key, { columns });
  }

  #renderLayout(layout: ResponsiveLayout) {
    return html`<div class="layout">
      <uui-label for="identifier-${layout.key}">Identifier</uui-label>
      <uui-input
        id="identifier-${layout.key}"
        label="Identifier"
        .value=${layout.identifier}
        @change=${(e: Event) => this.#onIdentifierChange(layout, e)}></uui-input>
      <uui-label for="columns-${layout.key}">Columns</uui-label>
      <uui-input
        id="columns-${layout.key}"
        type="number"
        min="1"
        max=${MAX_COLUMNS}
        label="Columns"
        .value=${String(layout.columns)}
        @change=${(e: Event) => this.#onColumnsChange(layout, e)}></uui-input>
      <uui-button
        compact
        label="Remove layout ${layout.identifier}"
        @click=${() => this.#removeLayout(layout.key)}>
        <uui-icon name="icon-trash"></uui-icon>
      </uui-button>
    </div>`;
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
          <umb-property-layout
            label="Layouts"
            description="The areas above are the base layout (${this._baseColumns} columns). Each extra layout resizes and reorders them.">
            <div slot="editor">
              ${repeat(
                this._layouts,
                (x) => x.key,
                (x) => this.#renderLayout(x),
              )}
              <uui-button look="placeholder" label="Add layout" @click=${this.#addLayout}></uui-button>
            </div>
          </umb-property-layout>
        </uui-box>`
      : nothing;
  }

  static override styles = [
    css`
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
    `,
  ];
}

export default ResponsiveAreasWorkspaceViewElement;

declare global {
  interface HTMLElementTagNameMap {
    "responsive-areas-workspace-view": ResponsiveAreasWorkspaceViewElement;
  }
}
