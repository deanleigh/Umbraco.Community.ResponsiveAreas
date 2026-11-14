import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { html, css, customElement } from "@umbraco-cms/backoffice/external/lit";

// A copy of core's corner resize handle (umb-block-scale-handler, Umbraco 17.8.0).
// Core only defines its handle when core's areas editor loads, and this tab no longer
// shows that editor, so the package carries its own copy with the same look.
@customElement("responsive-areas-scale-handler")
export class ResponsiveAreasScaleHandlerElement extends UmbLitElement {
  constructor() {
    super();
    this.addEventListener("dragstart", (e: DragEvent) => e.preventDefault());
  }

  override render() {
    return html`<button aria-label="TODO: Some introduction to keyboard scaling" id="handler"></button>
      <slot id="label"></slot>`;
  }

  static override styles = [
    css`
      :host {
        position: absolute;
        inset: 0;
        pointer-events: none;
        box-sizing: border-box;
      }
      :host(:focus-within),
      :host(:hover) {
        border: var(--uui-color-interactive) solid 1px;
        border-radius: var(--uui-border-radius);
      }
      #handler {
        position: absolute;
        display: block;
        z-index: 2;
        pointer-events: all;
        cursor: nwse-resize;
        bottom: -4px;
        right: -4px;
        width: 7px;
        height: 7px;
        padding: 0;
        background-color: var(--uui-color-surface);
        border: var(--uui-color-interactive) solid 1px;
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.7);
        opacity: var(--umb-block-scale-handler-opacity, 0);
        transition: opacity 120ms;
      }
      #handler:hover,
      #handler:focus {
        opacity: 1;
      }
      #handler:focus {
        outline: 2px solid var(--uui-color-selected);
        outline-offset: 1px;
      }
      #handler::after {
        content: "";
        position: absolute;
        inset: -10px;
        background-color: rgba(0, 0, 0, 0);
      }
      #handler:focus + #label,
      #handler:hover + #label {
        opacity: 1;
      }
      #label {
        position: absolute;
        display: block;
        top: 100%;
        left: 100%;
        margin-left: 6px;
        margin-top: 6px;
        z-index: 2;
        background-color: white;
        color: black;
        font-size: 12px;
        padding: 0px 6px;
        border-radius: 3px;
        opacity: 0;
        transition: opacity 120ms;
        pointer-events: none;
        white-space: nowrap;
      }
      :host([scale-mode]) > #handler {
        opacity: 1;
      }
      :host([scale-mode]) > #label {
        opacity: 1;
      }
    `,
  ];
}

export default ResponsiveAreasScaleHandlerElement;

declare global {
  interface HTMLElementTagNameMap {
    "responsive-areas-scale-handler": ResponsiveAreasScaleHandlerElement;
  }
}
