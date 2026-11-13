import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { css, html, customElement, state, nothing, repeat } from "@umbraco-cms/backoffice/external/lit";
import type { UmbWorkspaceViewElement } from "@umbraco-cms/backoffice/workspace";
import type { UmbPropertyEditorConfig } from "@umbraco-cms/backoffice/property-editor";
import { UMB_DATA_TYPE_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/data-type";
import { UMB_PROPERTY_DATASET_CONTEXT, type UmbPropertyDatasetContext } from "@umbraco-cms/backoffice/property";
import { UmbId } from "@umbraco-cms/backoffice/id";
import type { ResponsiveArea, ResponsiveAreaLayoutValues, ResponsiveLayout } from "./types.js";

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

  @state()
  private _areas: Array<ResponsiveArea> = [];

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

  #onAreaValueChange(
    layout: ResponsiveLayout,
    area: ResponsiveArea,
    _index: number,
    field: keyof ResponsiveAreaLayoutValues,
    event: Event,
  ) {
    const raw = parseInt((event.target as HTMLInputElement).value, 10);
    const max = field === "columnSpan" ? layout.columns : field === "order" ? this._areas.length : MAX_COLUMNS;
    const value = Math.max(1, Math.min(max, raw || 1));
    this.#writeValues(layout, new Map([[area.key, { [field]: value }]]));
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

  // ---------- Dragging ----------

  // Resize: drag the corner handle. The box follows the pointer, snapping to whole columns and rows,
  // and the new spans are written when the pointer is released.
  #startResize(event: PointerEvent, layout: ResponsiveLayout, area: ResponsiveArea, index: number) {
    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    const box = handle.closest(".area") as HTMLElement;
    const grid = box.parentElement as HTMLElement;
    const start = this.#valuesFor(area, index, layout);
    const columnWidth = grid.clientWidth / layout.columns;
    const rowHeight = box.offsetHeight / start.rowSpan;
    const startX = event.clientX;
    const startY = event.clientY;
    let columnSpan = start.columnSpan;
    let rowSpan = start.rowSpan;

    handle.setPointerCapture(event.pointerId);
    const move = (e: PointerEvent) => {
      columnSpan = Math.max(1, Math.min(layout.columns, Math.round(start.columnSpan + (e.clientX - startX) / columnWidth)));
      rowSpan = Math.max(1, Math.min(MAX_COLUMNS, Math.round(start.rowSpan + (e.clientY - startY) / rowHeight)));
      box.style.gridColumn = `span ${columnSpan}`;
      box.style.gridRow = `span ${rowSpan}`;
    };
    const end = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      if (columnSpan !== start.columnSpan || rowSpan !== start.rowSpan) {
        this.#writeValues(layout, new Map([[area.key, { columnSpan, rowSpan }]]));
      }
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  // Reorder: drag an area's grip onto another area in the same layout.
  #dragging?: { layoutKey: string; areaKey: string };

  #onDragStart(event: DragEvent, layout: ResponsiveLayout, area: ResponsiveArea) {
    this.#dragging = { layoutKey: layout.key, areaKey: area.key };
    event.dataTransfer?.setData("text/plain", area.key);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
  }

  #onDragOver(event: DragEvent, layout: ResponsiveLayout) {
    // Only accept drops from the same layout.
    if (this.#dragging?.layoutKey !== layout.key) return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.add("drop-target");
  }

  #onDragLeave(event: DragEvent) {
    (event.currentTarget as HTMLElement).classList.remove("drop-target");
  }

  #onDrop(event: DragEvent, layout: ResponsiveLayout, target: ResponsiveArea) {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove("drop-target");
    const dragging = this.#dragging;
    this.#dragging = undefined;
    if (dragging?.layoutKey !== layout.key || dragging.areaKey === target.key) return;

    // Current visual order in this layout, then move the dragged area to the target's place.
    const ordered = this._areas
      .map((area, index) => ({ area, order: this.#valuesFor(area, index, layout).order }))
      .sort((a, b) => a.order - b.order)
      .map((x) => x.area.key);
    const from = ordered.indexOf(dragging.areaKey);
    const to = ordered.indexOf(target.key);
    ordered.splice(to, 0, ordered.splice(from, 1)[0]);

    // Renumber every area 1, 2, 3… so Order always matches what you see.
    this.#writeValues(layout, new Map(ordered.map((key, i) => [key, { order: i + 1 }])));
  }

  #onDragEnd() {
    this.#dragging = undefined;
  }

  #renderNumber(
    layout: ResponsiveLayout,
    area: ResponsiveArea,
    index: number,
    field: keyof ResponsiveAreaLayoutValues,
    label: string,
    value: number,
  ) {
    const id = `${field}-${layout.key}-${area.key}`;
    return html`<span class="number">
      <uui-label for=${id}>${label}</uui-label>
      <uui-input
        id=${id}
        type="number"
        min="1"
        label="${label} for ${area.alias ?? "area"} in layout ${layout.identifier}"
        .value=${String(value)}
        @change=${(e: Event) => this.#onAreaValueChange(layout, area, index, field, e)}></uui-input>
    </span>`;
  }

  #renderLayoutAreas(layout: ResponsiveLayout) {
    // Each layout is drawn at a width proportional to its column count.
    const widest = Math.max(this._baseColumns, ...this._layouts.map((x) => x.columns));
    const width = (layout.columns / widest) * 100;
    return html`<div class="layout-grid" style="width:${width}%; grid-template-columns: repeat(${layout.columns}, minmax(0, 1fr));">
      ${repeat(
        this._areas,
        (area) => area.key,
        (area, index) => {
          const v = this.#valuesFor(area, index, layout);
          // The grip and corner handle are mouse and touch shortcuts. The number boxes are the
          // keyboard and screen reader route, so the handles are hidden from assistive tech.
          return html`<div
            class="area"
            style="grid-column: span ${v.columnSpan}; grid-row: span ${v.rowSpan}; order: ${v.order};"
            @dragover=${(e: DragEvent) => this.#onDragOver(e, layout)}
            @dragleave=${this.#onDragLeave}
            @drop=${(e: DragEvent) => this.#onDrop(e, layout, area)}>
            <div class="area-header">
              <span
                class="grip"
                draggable="true"
                title="Drag to reorder"
                aria-hidden="true"
                @dragstart=${(e: DragEvent) => this.#onDragStart(e, layout, area)}
                @dragend=${this.#onDragEnd}>
                <uui-icon name="icon-navigation"></uui-icon>
              </span>
              <strong class="alias">${area.alias}</strong>
            </div>
            <div class="numbers">
              ${this.#renderNumber(layout, area, index, "columnSpan", "Columns", v.columnSpan)}
              ${this.#renderNumber(layout, area, index, "rowSpan", "Rows", v.rowSpan)}
              ${this.#renderNumber(layout, area, index, "order", "Order", v.order)}
            </div>
            <span
              class="resize"
              title="Drag to resize"
              aria-hidden="true"
              @pointerdown=${(e: PointerEvent) => this.#startResize(e, layout, area, index)}></span>
          </div>`;
        },
      )}
    </div>`;
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
      /* Areas mirror core's grey boxes. */
      .layout-grid {
        display: grid;
        gap: 1px;
      }
      .area {
        position: relative;
        background: var(--uui-color-surface-alt);
        border: 1px solid var(--uui-color-border-emphasis);
        border-radius: var(--uui-border-radius);
        padding: var(--uui-size-space-3);
        min-width: 0;
      }
      .area.drop-target {
        outline: 2px solid var(--uui-color-interactive-emphasis);
      }
      .area-header {
        display: flex;
        align-items: center;
        gap: var(--uui-size-space-2);
        margin-bottom: var(--uui-size-space-2);
        min-width: 0;
      }
      .grip {
        cursor: grab;
        display: inline-flex;
        color: var(--uui-color-text-alt);
      }
      /* Corner handle, drawn like core's: two lines in the bottom-right corner. */
      .resize {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 16px;
        height: 16px;
        cursor: nwse-resize;
        touch-action: none;
      }
      .resize::after {
        content: "";
        position: absolute;
        right: 3px;
        bottom: 3px;
        width: 8px;
        height: 8px;
        border-right: 2px solid var(--uui-color-border-emphasis);
        border-bottom: 2px solid var(--uui-color-border-emphasis);
      }
      .alias {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .numbers {
        display: flex;
        flex-wrap: wrap;
        gap: var(--uui-size-space-2);
      }
      .number {
        display: flex;
        flex-direction: column;
        font-size: var(--uui-type-small-size);
      }
      .number uui-input {
        width: 4.5em;
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
