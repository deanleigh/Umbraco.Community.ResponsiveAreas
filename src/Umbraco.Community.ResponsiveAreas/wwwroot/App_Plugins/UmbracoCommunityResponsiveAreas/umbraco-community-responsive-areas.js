import { UMB_BLOCK_GRID_TYPE_WORKSPACE_ALIAS as e } from "@umbraco-cms/backoffice/block-grid";
import { UMB_WORKSPACE_CONDITION_ALIAS as o } from "@umbraco-cms/backoffice/workspace";
const r = [
  {
    name: "Umbraco Community Responsive Areas Entrypoint",
    alias: "Umbraco.Community.ResponsiveAreas.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-BRGBNSVD.js")
  }
], i = [
  {
    type: "workspaceView",
    alias: "ResponsiveAreas.WorkspaceView.BlockType.Grid.Areas",
    name: "ResponsiveAreas Block Grid Type Areas View",
    // Replaces core's Areas tab instead of adding a second one.
    overwrites: "Umb.WorkspaceView.BlockType.Grid.Areas",
    element: () => import("./responsive-areas-workspace-view.element-DYO7zoPZ.js"),
    weight: 1e3,
    meta: {
      label: "#blockEditor_tabAreas",
      pathname: "areas",
      icon: "icon-grid"
    },
    conditions: [
      {
        alias: o,
        match: e
      }
    ]
  },
  {
    // The first layout's areas editor, used only inside the tab above.
    // Like core's own areas editor, it has no schema.
    type: "propertyEditorUi",
    alias: "ResponsiveAreas.PropertyEditorUi.Areas",
    name: "ResponsiveAreas Areas Property Editor UI",
    element: () => import("./responsive-areas-areas-editor.element-BcpP0RxV.js"),
    meta: {
      label: "ResponsiveAreas Areas",
      icon: "icon-grid",
      group: "common"
    }
  }
], t = [
  ...r,
  ...i
];
export {
  t as manifests
};
//# sourceMappingURL=umbraco-community-responsive-areas.js.map
