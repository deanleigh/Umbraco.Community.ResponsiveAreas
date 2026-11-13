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
];
