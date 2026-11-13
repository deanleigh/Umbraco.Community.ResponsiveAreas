using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Services;

namespace Umbraco.Community.ResponsiveAreas.Rendering;

public interface IResponsiveAreasService
{
    /// <summary>The responsive layouts for a rendered Block Grid block, or <see cref="ResponsiveBlockLayouts.Empty"/>.</summary>
    Task<ResponsiveBlockLayouts> GetBlockLayoutsAsync(BlockGridItem? item);

    /// <summary>Forgets the cached configuration. Called when a data type is saved or deleted.</summary>
    void ClearCache();
}

/// <summary>
/// Reads responsive layouts from the raw Block Grid data type configuration.
/// </summary>
/// <remarks>
/// Core's typed configuration drops our extra properties (Decision 001), so this reads the raw JSON.
/// Rendered areas carry no key, only an alias, and a rendered block does not know its data type.
/// So blocks are matched by element type key, and areas by alias. If one element type is set up
/// differently in two Block Grid data types, the first one with layouts wins.
/// </remarks>
internal sealed partial class ResponsiveAreasService : IResponsiveAreasService
{
    private readonly IDataTypeService _dataTypeService;

    // Built on first use, thrown away when a data type changes. Element type key -> layouts.
    private volatile Dictionary<Guid, ResponsiveBlockLayouts>? _cache;

    public ResponsiveAreasService(IDataTypeService dataTypeService) => _dataTypeService = dataTypeService;

    public async Task<ResponsiveBlockLayouts> GetBlockLayoutsAsync(BlockGridItem? item)
    {
        if (item?.Content is null)
        {
            return ResponsiveBlockLayouts.Empty;
        }

        Dictionary<Guid, ResponsiveBlockLayouts> cache = _cache ??= await BuildCacheAsync();
        return cache.TryGetValue(item.Content.ContentType.Key, out ResponsiveBlockLayouts? layouts)
            ? layouts
            : ResponsiveBlockLayouts.Empty;
    }

    public void ClearCache() => _cache = null;

    private async Task<Dictionary<Guid, ResponsiveBlockLayouts>> BuildCacheAsync()
    {
        var result = new Dictionary<Guid, ResponsiveBlockLayouts>();
        IEnumerable<IDataType> dataTypes = await _dataTypeService.GetByEditorAliasAsync(Umbraco.Cms.Core.Constants.PropertyEditors.Aliases.BlockGrid);

        foreach (IDataType dataType in dataTypes)
        {
            if (!dataType.ConfigurationData.TryGetValue("blocks", out var blocksValue)
                || JsonSerializer.SerializeToNode(blocksValue) is not JsonArray blocks)
            {
                continue;
            }

            foreach (JsonObject block in blocks.OfType<JsonObject>())
            {
                if (!Guid.TryParse(block["contentElementTypeKey"]?.ToString(), out Guid elementTypeKey)
                    || result.ContainsKey(elementTypeKey))
                {
                    continue;
                }

                ResponsiveBlockLayouts layouts = ReadBlock(block);
                if (layouts.HasLayouts)
                {
                    result[elementTypeKey] = layouts;
                }
            }
        }

        return result;
    }

    private static ResponsiveBlockLayouts ReadBlock(JsonObject block)
    {
        // Layouts on the block type: [{ key, identifier, columns }] (Decision 003).
        var layouts = new List<(string Key, ResponsiveLayoutInfo Info)>();
        foreach (JsonObject layout in (block["responsiveLayouts"] as JsonArray ?? []).OfType<JsonObject>())
        {
            var key = layout["key"]?.ToString();
            var identifier = layout["identifier"]?.ToString();
            var columns = ReadInt(layout["columns"]);
            if (key is not null && identifier is not null && SafeIdentifier().IsMatch(identifier) && columns > 0)
            {
                layouts.Add((key, new ResponsiveLayoutInfo(identifier, columns.Value)));
            }
        }

        if (layouts.Count == 0)
        {
            return ResponsiveBlockLayouts.Empty;
        }

        // Each area's values per layout, keyed by layout key. Unset values inherit the base layout,
        // using the same rules as the backoffice tab.
        var areas = new Dictionary<string, IReadOnlyList<ResponsiveAreaValues>>(StringComparer.Ordinal);
        var index = 0;
        foreach (JsonObject area in (block["areas"] as JsonArray ?? []).OfType<JsonObject>())
        {
            index++;
            var alias = area["alias"]?.ToString();
            if (alias is null || areas.ContainsKey(alias))
            {
                continue;
            }

            var stored = area["responsiveLayouts"] as JsonObject;
            areas[alias] = layouts.Select(layout =>
            {
                var values = stored?[layout.Key] as JsonObject;
                var columns = layout.Info.Columns;
                var columnSpan = Math.Min(ReadInt(values?["columnSpan"]) ?? ReadInt(area["columnSpan"]) ?? columns, columns);
                var rowSpan = ReadInt(values?["rowSpan"]) ?? ReadInt(area["rowSpan"]) ?? 1;
                var order = ReadInt(values?["order"]) ?? index;
                return new ResponsiveAreaValues(layout.Info.Identifier, columnSpan, rowSpan, order);
            }).ToList();
        }

        return new ResponsiveBlockLayouts(layouts.Select(x => x.Info).ToList(), areas);
    }

    private static int? ReadInt(JsonNode? node) =>
        node is JsonValue value && value.TryGetValue(out int i) ? i
        : int.TryParse(node?.ToString(), out var parsed) ? parsed
        : null;

    // Identifiers end up in CSS variable names (Decision 004).
    [GeneratedRegex("^[A-Za-z0-9_-]+$")]
    private static partial Regex SafeIdentifier();
}
