export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Umbraco Community Responsive Areas Entrypoint",
    alias: "Umbraco.Community.ResponsiveAreas.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint.js"),
  },
];
