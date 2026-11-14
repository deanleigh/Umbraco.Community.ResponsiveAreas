import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { css, html, customElement, property, state, repeat } from "@umbraco-cms/backoffice/external/lit";
import { UmbSorterController, UmbSorterResolvePlacementAsGrid } from "@umbraco-cms/backoffice/sorter";
import type { ResponsiveArea, ResponsiveAreaLayoutValues, ResponsiveLayout } from "./types.js";
import "./responsive-areas-scale-handler.element.js";

const MAX_ROWS = 24;

export interface ResponsiveLayoutGridItem {
  area: ResponsiveArea;
  values: ResponsiveAreaLayoutValues;
}

// Fired with the changed values per area key. The workspace view writes them (Decision 002).
export class ResponsiveLayoutValuesChangeEvent extends Event {
  constructor(public changes: Map<string, Partial<ResponsiveAreaLayoutValues>>) {
    super("values-change", { bubbles: false, composed: false });
  }
}

// Fired when an area's bin is clicked. The owner confirms and deletes it.
export class ResponsiveLayoutAreaDeleteEvent extends Event {
  constructor(public key: string) {
    super("area-delete", { bubbles: false, composed: false });
  }
}

// One layout's grid of areas. Moving and resizing copy core's Areas editor
// (property-editor-ui-block-grid-areas-config): the whole box drags with core's sorter,
// and core's corner handle resizes it.
@customElement("responsive-areas-layout-grid")
export class ResponsiveAreasLayoutGridElement extends UmbLitElement {
  @property({ attribute: false })
  layout!: ResponsiveLayout;

  // The route to core's area dialog. When set, each area shows core's pencil and bin.
  // Without it, the box shows only its alias.
  @property({ attribute: false })
  workspacePath?: string;

  // Areas in this layout's order.
  @property({ attribute: false })
  public set items(items: Array<ResponsiveLayoutGridItem>) {
    this._items = items ?? [];
    this.#sorter.setModel(this._items);
  }
  public get items() {
    return this._items;
  }

  @state()
  private _items: Array<ResponsiveLayoutGridItem> = [];

  // While resizing: the live spans of the area being resized.
  @state()
  private _scaling?: { key: string; columnSpan: number; rowSpan: number };

  // No containerSelector, so the sorter uses this element's shadow root as the container.
  #sorter = new UmbSorterController<ResponsiveLayoutGridItem, HTMLElement>(this, {
    itemSelector: ".area",
    resolvePlacement: UmbSorterResolvePlacementAsGrid,
    // The buttons and corner handle must not start a move.
    ignorerSelector: "input,uui-input,uui-button,responsive-areas-scale-handler",
    getUniqueOfElement: (element) => element.dataset.key,
    getUniqueOfModel: (item) => item.area.key,
    onChange: ({ model }) => {
      // Renumber 1, 2, 3… so Order always matches what you see.
      this.#dispatch(new Map(model.map((item, i) => [item.area.key, { order: i + 1 }])));
    },
  });

  #dispatch(changes: Map<string, Partial<ResponsiveAreaLayoutValues>>) {
    this.dispatchEvent(new ResponsiveLayoutValuesChangeEvent(changes));
  }

  // Drag core's corner handle. Snaps to whole columns and rows, shows "3x1" live,
  // and writes the new spans when released.
  #startResize(event: PointerEvent, item: ResponsiveLayoutGridItem) {
    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    const box = handle.closest(".area") as HTMLElement;
    const start = item.values;
    // This element is the grid. The boxes sit in its shadow root, so they have no parent element.
    const columnWidth = this.clientWidth / this.layout.columns;
    const rowHeight = box.offsetHeight / start.rowSpan;
    const startX = event.clientX;
    const startY = event.clientY;
    const key = item.area.key;
    this._scaling = { key, columnSpan: start.columnSpan, rowSpan: start.rowSpan };

    handle.setAttribute("scale-mode", "");
    // Capture on the handle's inner button, the only part that takes pointer events.
    // Its events still reach these listeners on the handle.
    (event.composedPath()[0] as Element).setPointerCapture(event.pointerId);
    const move = (e: PointerEvent) => {
      this._scaling = {
        key,
        columnSpan: Math.max(1, Math.min(this.layout.columns, Math.round(start.columnSpan + (e.clientX - startX) / columnWidth))),
        rowSpan: Math.max(1, Math.min(MAX_ROWS, Math.round(start.rowSpan + (e.clientY - startY) / rowHeight))),
      };
    };
    const end = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      handle.removeAttribute("scale-mode");
      const { columnSpan, rowSpan } = this._scaling!;
      this._scaling = undefined;
      if (columnSpan !== start.columnSpan || rowSpan !== start.rowSpan) {
        this.#dispatch(new Map([[key, { columnSpan, rowSpan }]]));
      }
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }

  // Core's pencil and bin. They sit beside the alias rather than over it.
  #renderActions(item: ResponsiveLayoutGridItem) {
    const alias = item.area.alias ?? "area";
    return html`<uui-action-bar>
      <uui-button compact label="Edit ${alias}" href=${this.workspacePath + "edit/" + item.area.key}>
        <uui-icon name="icon-edit"></uui-icon>
      </uui-button>
      <uui-button
        compact
        label="Delete ${alias}"
        @click=${() => this.dispatchEvent(new ResponsiveLayoutAreaDeleteEvent(item.area.key))}>
        <uui-icon name="icon-remove"></uui-icon>
      </uui-button>
    </uui-action-bar>`;
  }

  override render() {
    return repeat(
      this._items,
      (item) => item.area.key,
      (item) => {
        const scaling = this._scaling?.key === item.area.key ? this._scaling : undefined;
        const columnSpan = scaling?.columnSpan ?? item.values.columnSpan;
        const rowSpan = scaling?.rowSpan ?? item.values.rowSpan;
        return html`<div class="area" data-key=${item.area.key} style="grid-column: span ${columnSpan}; grid-row: span ${rowSpan};">
          <div class="head">
            <strong class="alias">${item.area.alias}</strong>
            ${this.workspacePath ? this.#renderActions(item) : null}
          </div>
          <responsive-areas-scale-handler
            @mousedown=${(e: MouseEvent) => e.preventDefault()}
            @pointerdown=${(e: PointerEvent) => this.#startResize(e, item)}>
            ${columnSpan}x${rowSpan}
          </responsive-areas-scale-handler>
        </div>`;
      },
    );
  }

  static override styles = [
    css`
      :host {
        display: grid;
        grid-template-columns: repeat(var(--responsive-areas-columns, 12), minmax(0, 1fr));
        gap: 1px;
      }
      /* Areas mirror core's grey boxes, including the move cursor and the drag placeholder. */
      .area {
        position: relative;
        box-sizing: border-box;
        min-width: 0;
        padding: var(--uui-size-space-3);
        background-color: var(--uui-color-surface-alt);
        border: 1px solid var(--uui-color-border-emphasis);
        border-radius: var(--uui-border-radius);
        cursor: move;
        transition: background-color 120ms;
      }
      .area:hover {
        background-color: var(--uui-color-disabled-standalone);
      }
      .area[drag-placeholder] {
        opacity: 0.2;
      }
      responsive-areas-scale-handler {
        touch-action: none;
      }
      .head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--uui-size-space-2);
        margin-bottom: var(--uui-size-space-2);
      }
      uui-action-bar {
        flex-shrink: 0;
      }
      .alias {
        display: block;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ];
}

export default ResponsiveAreasLayoutGridElement;

declare global {
  interface HTMLElementTagNameMap {
    "responsive-areas-layout-grid": ResponsiveAreasLayoutGridElement;
  }
}
