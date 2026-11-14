import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { css, html, customElement, property, state, repeat } from "@umbraco-cms/backoffice/external/lit";
import type {
  UmbPropertyEditorUiElement,
  UmbPropertyEditorConfigCollection,
} from "@umbraco-cms/backoffice/property-editor";
import { UMB_PROPERTY_DATASET_CONTEXT, type UmbPropertyDatasetContext } from "@umbraco-cms/backoffice/property";
import { UmbChangeEvent } from "@umbraco-cms/backoffice/event";
import { UmbId } from "@umbraco-cms/backoffice/id";
import { UmbModalToken, umbConfirmModal } from "@umbraco-cms/backoffice/modal";
import { UmbModalRouteRegistrationController } from "@umbraco-cms/backoffice/router";
import { incrementString } from "@umbraco-cms/backoffice/utils";
import type { UmbWorkspaceModalData, UmbWorkspaceModalValue } from "@umbraco-cms/backoffice/workspace";
import type { ResponsiveArea, ResponsiveAreaLayoutValues, ResponsiveLayout } from "./types.js";
import type {
  ResponsiveLayoutGridItem,
  ResponsiveLayoutValuesChangeEvent,
  ResponsiveLayoutAreaDeleteEvent,
} from "./responsive-areas-layout-grid.element.js";
import "./responsive-areas-layout-grid.element.js";

const LAYOUTS_ALIAS = "responsiveLayouts";
const MAX_COLUMNS = 24;

// Core's area dialog. Core does not export its token, but it is only the standard workspace
// dialog for the 'block-grid-area-type' entity, so we declare the same one.
const AREA_TYPE_WORKSPACE_MODAL = new UmbModalToken<UmbWorkspaceModalData<ResponsiveArea>, UmbWorkspaceModalValue>(
  "Umb.Modal.Workspace",
  {
    modal: { type: "sidebar", size: "small" },
    data: { entityType: "block-grid-area-type", preset: {} },
  },
);

// One list of layouts (Decision 006). The first layout is the areas themselves, stored in core's
// `areas` exactly as core stores them. Each layout after it rearranges the same areas, with its
// values stored on each area and the layouts themselves in `responsiveLayouts` (Decision 003).
//
// It is a property editor so it sits inside an <umb-property alias="areas">. Core's area dialog
// reads and writes the areas through that property, as it does in core's own editor
// (property-editor-ui-block-grid-areas-config).
@customElement("responsive-areas-areas-editor")
export class ResponsiveAreasAreasEditorElement extends UmbLitElement implements UmbPropertyEditorUiElement {
  @property({ attribute: false })
  value: Array<ResponsiveArea> = [];

  @property({ attribute: false })
  public set config(config: UmbPropertyEditorConfigCollection | undefined) {
    this._columns = Number(config?.getValueByAlias("areaGridColumns")) || 12;
  }

  @state()
  private _columns = 12;

  @state()
  private _layouts: Array<ResponsiveLayout> = [];

  @state()
  private _workspacePath?: string;

  #dataset?: UmbPropertyDatasetContext;

  constructor() {
    super();
    new UmbModalRouteRegistrationController(this, AREA_TYPE_WORKSPACE_MODAL)
      .addAdditionalPath("block-grid-area-type")
      .onSetup(() => {
        // Same starting size as core: half the grid when it divides evenly, else the full width.
        const half = this._columns / 2;
        const columnSpan = Number.isInteger(half) ? half : this._columns;
        return {
          data: {
            entityType: "block-grid-area-type",
            preset: { columnSpan, alias: this.#uniqueAlias("area") },
          },
          modal: { size: "large" },
        };
      })
      .observeRouteBuilder((routeBuilder) => {
        this._workspacePath = routeBuilder({});
      });

    // The layouts are a separate property on the block type, next to `areas`.
    this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, async (dataset) => {
      this.#dataset = dataset;
      this.observe(
        await dataset?.propertyValueByAlias<Array<ResponsiveLayout>>(LAYOUTS_ALIAS),
        (layouts) => (this._layouts = layouts ?? []),
        "observeLayouts",
      );
    });
  }

  get #areas() {
    return this.value ?? [];
  }

  #uniqueAlias(alias: string) {
    while (this.#areas.some((area) => area.alias === alias)) {
      alias = incrementString(alias);
    }
    return alias;
  }

  #setValue(value: Array<ResponsiveArea>) {
    this.value = value;
    this.dispatchEvent(new UmbChangeEvent());
  }

  // ---------- The first layout: core's areas ----------

  // Dragging writes the new order of core's areas list, which is also the reading order on the site.
  // Resizing writes core's own spans.
  #onFirstLayoutChange(changes: Map<string, Partial<ResponsiveAreaLayoutValues>>) {
    const areas = this.#areas.map((area, index) => {
      const change = changes.get(area.key);
      const next: ResponsiveArea = { ...area };
      if (change?.columnSpan !== undefined) next.columnSpan = change.columnSpan;
      if (change?.rowSpan !== undefined) next.rowSpan = change.rowSpan;
      return { area: next, order: change?.order ?? index + 1 };
    });
    areas.sort((a, b) => a.order - b.order);
    this.#setValue(areas.map((x) => x.area));
  }

  async #onDelete(key: string) {
    const area = this.#areas.find((x) => x.key === key);
    if (!area) return;
    try {
      await umbConfirmModal(this, {
        headline: `Delete ${area.alias ?? "area"}`,
        content: "This area is removed from every layout. Content in it is removed from pages that use this block.",
        confirmLabel: "Delete",
        color: "danger",
      });
    } catch {
      return; // Cancelled.
    }
    this.#setValue(this.#areas.filter((x) => x.key !== key));
  }

  // ---------- Extra layouts ----------

  #setLayouts(layouts: Array<ResponsiveLayout>) {
    this.#dataset?.setPropertyValue(LAYOUTS_ALIAS, layouts);
  }

  #addLayout() {
    // Start from the previous layout's column count, minus 3.
    const previous = this._layouts[this._layouts.length - 1]?.columns ?? this._columns;
    const columns = Math.max(1, previous - 3);
    this.#setLayouts([...this._layouts, { key: UmbId.new(), identifier: String(columns), columns }]);
  }

  #removeLayout(key: string) {
    this.#setLayouts(this._layouts.filter((x) => x.key !== key));
    // Tidy up: drop that layout's values from every area.
    this.#setValue(
      this.#areas.map((area) => {
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

  // An area's values in a layout. Until set, it inherits the first layout's spans (capped to fit)
  // and keeps its first-layout position.
  #valuesFor(area: ResponsiveArea, index: number, layout: ResponsiveLayout): ResponsiveAreaLayoutValues {
    const stored = area.responsiveLayouts?.[layout.key];
    return {
      columnSpan: Math.min(stored?.columnSpan ?? area.columnSpan ?? layout.columns, layout.columns),
      rowSpan: stored?.rowSpan ?? area.rowSpan ?? 1,
      order: stored?.order ?? index + 1,
    };
  }

  // Writes changes for one or more areas in a layout, in a single update.
  // Resizing and reordering both end up here, so they store the same numbers (Decision 002).
  #writeValues(layout: ResponsiveLayout, changes: Map<string, Partial<ResponsiveAreaLayoutValues>>) {
    this.#setValue(
      this.#areas.map((area, index) => {
        const change = changes.get(area.key);
        if (!change) return area;
        const values = { ...this.#valuesFor(area, index, layout), ...change };
        return { ...area, responsiveLayouts: { ...area.responsiveLayouts, [layout.key]: values } };
      }),
    );
  }

  // ---------- Rendering ----------

  // Each layout is drawn at a width proportional to its column count.
  #widthOf(columns: number) {
    const widest = Math.max(this._columns, ...this._layouts.map((x) => x.columns));
    return (columns / widest) * 100;
  }

  #renderFirstLayout() {
    const layout: ResponsiveLayout = { key: "grid", identifier: "grid", columns: this._columns };
    const items: Array<ResponsiveLayoutGridItem> = this.#areas.map((area, index) => ({
      area,
      values: {
        columnSpan: Math.min(area.columnSpan ?? this._columns, this._columns),
        rowSpan: area.rowSpan ?? 1,
        order: index + 1,
      },
    }));
    return html`<div class="layout">
      <p class="layout-header summary">${this._columns} columns, set in Grid.</p>
      <responsive-areas-layout-grid
        style="width:${this.#widthOf(this._columns)}%; --responsive-areas-columns:${this._columns};"
        .layout=${layout}
        .items=${items}
        .workspacePath=${this._workspacePath}
        @values-change=${(e: ResponsiveLayoutValuesChangeEvent) => this.#onFirstLayoutChange(e.changes)}
        @area-delete=${(e: ResponsiveLayoutAreaDeleteEvent) => this.#onDelete(e.key)}></responsive-areas-layout-grid>
      ${this._workspacePath
        ? html`<uui-button look="placeholder" label="Add area" href=${this._workspacePath + "create"}></uui-button>`
        : null}
    </div>`;
  }

  #renderLayout(layout: ResponsiveLayout) {
    // Areas in this layout's order. The grid draws them in that order, so dragging works on what you see.
    const items: Array<ResponsiveLayoutGridItem> = this.#areas
      .map((area, index) => ({ area, values: this.#valuesFor(area, index, layout) }))
      .sort((a, b) => a.values.order - b.values.order);
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
        <uui-button compact label="Remove layout ${layout.identifier}" @click=${() => this.#removeLayout(layout.key)}>
          <uui-icon name="icon-trash"></uui-icon>
        </uui-button>
      </div>
      <responsive-areas-layout-grid
        style="width:${this.#widthOf(layout.columns)}%; --responsive-areas-columns:${layout.columns};"
        .layout=${layout}
        .items=${items}
        @values-change=${(e: ResponsiveLayoutValuesChangeEvent) => this.#writeValues(layout, e.changes)}></responsive-areas-layout-grid>
    </div>`;
  }

  override render() {
    return html`${this.#renderFirstLayout()}
      ${repeat(
        this._layouts,
        (x) => x.key,
        (x) => this.#renderLayout(x),
      )}
      <uui-button look="placeholder" label="Add layout" @click=${this.#addLayout}></uui-button>`;
  }

  static override styles = [
    css`
      :host {
        display: block;
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
        margin: 0 0 var(--uui-size-space-3);
        min-height: 36px;
      }
      .layout-header uui-input[type="number"] {
        width: 6em;
      }
      .summary {
        color: var(--uui-color-text-alt);
      }
      uui-button[look="placeholder"] {
        width: 100%;
      }
      .layout uui-button[look="placeholder"] {
        margin-top: var(--uui-size-space-3);
      }
    `,
  ];
}

export default ResponsiveAreasAreasEditorElement;

declare global {
  interface HTMLElementTagNameMap {
    "responsive-areas-areas-editor": ResponsiveAreasAreasEditorElement;
  }
}
