import { UMB_BLOCK_GRID_TYPE_WORKSPACE_ALIAS as e } from "@umbraco-cms/backoffice/block-grid";
import { UMB_WORKSPACE_CONDITION_ALIAS as i } from "@umbraco-cms/backoffice/workspace";
const o = [
  {
    name: "Umbraco Community Responsive Areas Entrypoint",
    alias: "Umbraco.Community.ResponsiveAreas.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-BRGBNSVD.js")
  }
], s = [
  {
    type: "workspaceView",
    alias: "ResponsiveAreas.WorkspaceView.BlockType.Grid.Areas",
    name: "ResponsiveAreas Block Grid Type Areas View",
    // Replaces core's Areas tab instead of adding a second one.
    overwrites: "Umb.WorkspaceView.BlockType.Grid.Areas",
    element: () => import("./responsive-areas-workspace-view.element-DPb1WvNf.js"),
    weight: 1e3,
    meta: {
      label: "#blockEditor_tabAreas",
      pathname: "areas",
      icon: "icon-grid"
    },
    conditions: [
      {
        alias: i,
        match: e
      }
    ]
  }
], t = [
  ...o,
  ...s
];
export {
  t as manifests
};
//# sourceMappingURL=umbraco-community-responsive-areas.js.map
