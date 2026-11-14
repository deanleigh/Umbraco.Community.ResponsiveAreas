import { UMB_BLOCK_GRID_TYPE_WORKSPACE_ALIAS } from "@umbraco-cms/backoffice/block-grid";
import { UMB_WORKSPACE_CONDITION_ALIAS } from "@umbraco-cms/backoffice/workspace";

export const manifests: Array<UmbExtensionManifest> = [
  {
    type: "workspaceView",
    alias: "ResponsiveAreas.WorkspaceView.BlockType.Grid.Areas",
    name: "ResponsiveAreas Block Grid Type Areas View",
    // Replaces core's Areas tab instead of adding a second one.
    overwrites: "Umb.WorkspaceView.BlockType.Grid.Areas",
    element: () => import("./responsive-areas-workspace-view.element.js"),
    weight: 1000,
    meta: {
      label: "#blockEditor_tabAreas",
      pathname: "areas",
      icon: "icon-grid",
    },
    conditions: [
      {
        alias: UMB_WORKSPACE_CONDITION_ALIAS,
        match: UMB_BLOCK_GRID_TYPE_WORKSPACE_ALIAS,
      },
    ],
  },
  {
    // The first layout's areas editor, used only inside the tab above.
    // Like core's own areas editor, it has no schema.
    type: "propertyEditorUi",
    alias: "ResponsiveAreas.PropertyEditorUi.Areas",
    name: "ResponsiveAreas Areas Property Editor UI",
    element: () => import("./responsive-areas-areas-editor.element.js"),
    meta: {
      label: "ResponsiveAreas Areas",
      icon: "icon-grid",
      group: "common",
    },
  },
];
