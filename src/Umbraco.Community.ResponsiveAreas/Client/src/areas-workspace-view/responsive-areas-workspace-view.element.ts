import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { css, html, customElement, state, nothing, repeat } from "@umbraco-cms/backoffice/external/lit";
import type { UmbWorkspaceViewElement } from "@umbraco-cms/backoffice/workspace";
import type { UmbPropertyEditorConfig } from "@umbraco-cms/backoffice/property-editor";
import { UMB_DATA_TYPE_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/data-type";
import { UMB_PROPERTY_DATASET_CONTEXT, type UmbPropertyDatasetContext } from "@umbraco-cms/backoffice/property";
import { UmbId } from "@umbraco-cms/backoffice/id";
import type { ResponsiveArea, ResponsiveAreaLayoutValues, ResponsiveLayout } from "./types.js";
import type { ResponsiveLayoutGridItem, ResponsiveLayoutValuesChangeEvent } from "./responsive-areas-layout-grid.element.js";
import "./responsive-areas-layout-grid.element.js";

const LAYOUTS_ALIAS = "responsiveLayouts";
const MAX_COLUMNS = 24;

// Starts as a copy of core's Areas view (block-grid-type-workspace-view-areas.element.ts),
// so the tab looks and behaves exactly like core. Layouts are added below core's editors.
@customElement("responsive-areas-workspace-view")
export class ResponsiveAreasWorkspaceViewElement extends UmbLitElement implements UmbWorkspaceViewElement {
  #dataset?: UmbPropertyDatasetContext;

  @state()
  private _areasConfig?: UmbPropertyEditorConfig;

  @state()
  private _layouts: Array<ResponsiveLayout> = [];

  @state()
  private _areas: Array<ResponsiveArea> = [];

  // Columns of the base layout: the block's own Grid Columns, else the data type's.
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

    // The block type's own values (layouts, areas, areaGridColumns) live in the workspace's property dataset.
    this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, async (dataset) => {
      this.#dataset = dataset;
      this.observe(
        await dataset?.propertyValueByAlias<Array<ResponsiveLayout>>(LAYOUTS_ALIAS),
        (layouts) => (this._layouts = layouts ?? []),
        "observeLayouts",
      );
      this.observe(
        await dataset?.propertyValueByAlias<Array<ResponsiveArea>>("areas"),
        (areas) => (this._areas = areas ?? []),
        "observeAreas",
      );
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
        label="Columns"
        description="How many columns this block's areas sit in. Filled in from the Block Grid data type. Change it to give this block a different grid.">
        <div slot="editor" class="grid-columns">
          <uui-input
            id="grid-columns"
            type="number"
            min="1"
            max=${MAX_COLUMNS}
            label="Grid columns"
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

  // ---------- Layouts ----------

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
    // Tidy up: drop that layout's values from every area.
    this.#setAreas(
      this._areas.map((area) => {
        if (!area.responsiveLayouts?.[key]) return area;
        const { [key]: _removed, ...rest } = area.responsiveLayouts;
        return { ...area, responsiveLayouts: rest };
      }),
    );
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

  // ---------- Areas within a layout ----------

  #setAreas(areas: Array<ResponsiveArea>) {
    this.#dataset?.setPropertyValue("areas", areas);
  }

  // An area's values in a layout. Until set, it inherits the base layout's spans (capped to fit)
  // and keeps its base position.
  #valuesFor(area: ResponsiveArea, index: number, layout: ResponsiveLayout): ResponsiveAreaLayoutValues {
    const stored = area.responsiveLayouts?.[layout.key];
    return {
      columnSpan: Math.min(stored?.columnSpan ?? area.columnSpan ?? layout.columns, layout.columns),
      rowSpan: stored?.rowSpan ?? area.rowSpan ?? 1,
      order: stored?.order ?? index + 1,
    };
  }

  // Writes changes for one or more areas in a layout, in a single update.
  // Typing, resizing and reordering all end up here, so they store the same numbers (Decision 002).
  #writeValues(layout: ResponsiveLayout, changes: Map<string, Partial<ResponsiveAreaLayoutValues>>) {
    this.#setAreas(
      this._areas.map((area, index) => {
        const change = changes.get(area.key);
        if (!change) return area;
        const values = { ...this.#valuesFor(area, index, layout), ...change };
        return { ...area, responsiveLayouts: { ...area.responsiveLayouts, [layout.key]: values } };
      }),
    );
  }

  #renderLayoutAreas(layout: ResponsiveLayout) {
    // Each layout is drawn at a width proportional to its column count.
    const widest = Math.max(this._baseColumns, ...this._layouts.map((x) => x.columns));
    const width = (layout.columns / widest) * 100;
    // Areas in this layout's order. The grid draws them in that order, so dragging works on what you see.
    const items: Array<ResponsiveLayoutGridItem> = this._areas
      .map((area, index) => ({ area, values: this.#valuesFor(area, index, layout) }))
      .sort((a, b) => a.values.order - b.values.order);
    return html`<responsive-areas-layout-grid
      style="width:${width}%; --responsive-areas-columns:${layout.columns};"
      .layout=${layout}
      .items=${items}
      @values-change=${(e: ResponsiveLayoutValuesChangeEvent) => this.#writeValues(layout, e.changes)}></responsive-areas-layout-grid>`;
  }

  #renderLayout(layout: ResponsiveLayout) {
    return html`<div class="layout">
      <div class="layout-header">
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
      </div>
      ${this.#renderLayoutAreas(layout)}
    </div>`;
  }

  override render() {
    return this._areasConfig
      ? html`${this.#renderGrid()}
        <uui-box headline="Areas">
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
