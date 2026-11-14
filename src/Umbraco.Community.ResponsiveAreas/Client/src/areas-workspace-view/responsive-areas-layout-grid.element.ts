import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { css, html, customElement, property, state, repeat } from "@umbraco-cms/backoffice/external/lit";
import { UmbSorterController, UmbSorterResolvePlacementAsGrid } from "@umbraco-cms/backoffice/sorter";
import type { ResponsiveArea, ResponsiveAreaLayoutValues, ResponsiveLayout } from "./types.js";

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

// One layout's grid of areas. Moving and resizing copy core's Areas editor
// (property-editor-ui-block-grid-areas-config): the whole box drags with core's sorter,
// and core's corner handle resizes it.
@customElement("responsive-areas-layout-grid")
export class ResponsiveAreasLayoutGridElement extends UmbLitElement {
  @property({ attribute: false })
  layout!: ResponsiveLayout;

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
    // The number boxes and corner handle must not start a move.
    ignorerSelector: "input,uui-input,umb-block-scale-handler",
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

  #onNumberChange(item: ResponsiveLayoutGridItem, field: keyof ResponsiveAreaLayoutValues, event: Event) {
    const raw = parseInt((event.target as HTMLInputElement).value, 10);
    const max = field === "columnSpan" ? this.layout.columns : field === "order" ? this._items.length : MAX_ROWS;
    const value = Math.max(1, Math.min(max, raw || 1));
    this.#dispatch(new Map([[item.area.key, { [field]: value }]]));
  }

  // Drag core's corner handle. Snaps to whole columns and rows, shows "3x1" live,
  // and writes the new spans when released.
  #startResize(event: PointerEvent, item: ResponsiveLayoutGridItem) {
    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    const box = handle.closest(".area") as HTMLElement;
    const grid = box.parentElement as HTMLElement;
    const start = item.values;
    const columnWidth = grid.clientWidth / this.layout.columns;
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

  #renderNumber(item: ResponsiveLayoutGridItem, field: keyof ResponsiveAreaLayoutValues, label: string, value: number) {
    const id = `${field}-${item.area.key}`;
    return html`<span class="number">
      <uui-label for=${id}>${label}</uui-label>
      <uui-input
        id=${id}
        type="number"
        min="1"
        label="${label} for ${item.area.alias ?? "area"} in layout ${this.layout.identifier}"
        .value=${String(value)}
        @change=${(e: Event) => this.#onNumberChange(item, field, e)}></uui-input>
    </span>`;
  }

  override render() {
    return repeat(
      this._items,
      (item) => item.area.key,
      (item) => {
        const scaling = this._scaling?.key === item.area.key ? this._scaling : undefined;
        const columnSpan = scaling?.columnSpan ?? item.values.columnSpan;
        const rowSpan = scaling?.rowSpan ?? item.values.rowSpan;
        // The box and corner handle are mouse and touch shortcuts. The number boxes are the
        // keyboard and screen reader route.
        return html`<div class="area" data-key=${item.area.key} style="grid-column: span ${columnSpan}; grid-row: span ${rowSpan};">
          <strong class="alias">${item.area.alias}</strong>
          <div class="numbers">
            ${this.#renderNumber(item, "columnSpan", "Columns", columnSpan)}
            ${this.#renderNumber(item, "rowSpan", "Rows", rowSpan)}
            ${this.#renderNumber(item, "order", "Order", item.values.order)}
          </div>
          <umb-block-scale-handler
            @mousedown=${(e: MouseEvent) => e.preventDefault()}
            @pointerdown=${(e: PointerEvent) => this.#startResize(e, item)}>
            ${columnSpan}x${rowSpan}
          </umb-block-scale-handler>
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
      umb-block-scale-handler {
        touch-action: none;
      }
      .alias {
        display: block;
        min-width: 0;
        margin-bottom: var(--uui-size-space-2);
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
    `,
  ];
}

export default ResponsiveAreasLayoutGridElement;

declare global {
  interface HTMLElementTagNameMap {
    "responsive-areas-layout-grid": ResponsiveAreasLayoutGridElement;
  }
}
