using System.Globalization;
using System.Text;

namespace Umbraco.Community.ResponsiveAreas.Rendering;

/// <summary>A layout defined on a block type: its identifier (e.g. "md" or "9") and column count.</summary>
public sealed record ResponsiveLayoutInfo(string Identifier, int Columns);

/// <summary>An area's values in one layout. Already resolved: unset values inherit the base layout.</summary>
public sealed record ResponsiveAreaValues(string Identifier, int ColumnSpan, int RowSpan, int Order);

/// <summary>
/// Everything a view needs to render one block's responsive areas.
/// The base layout is core's own data and is not included here.
/// </summary>
public sealed class ResponsiveBlockLayouts
{
    public static readonly ResponsiveBlockLayouts Empty = new([], new Dictionary<string, IReadOnlyList<ResponsiveAreaValues>>());

    public ResponsiveBlockLayouts(
        IReadOnlyList<ResponsiveLayoutInfo> layouts,
        IReadOnlyDictionary<string, IReadOnlyList<ResponsiveAreaValues>> areas)
    {
        Layouts = layouts;
        Areas = areas;
    }

    public IReadOnlyList<ResponsiveLayoutInfo> Layouts { get; }

    /// <summary>Per-layout values for each area, by area alias.</summary>
    public IReadOnlyDictionary<string, IReadOnlyList<ResponsiveAreaValues>> Areas { get; }

    public bool HasLayouts => Layouts.Count > 0;

    /// <summary>CSS variables for the areas wrapper, e.g. "--umb-block-grid--area-grid-columns--9: 9;".</summary>
    public string BlockStyle()
    {
        var css = new StringBuilder();
        foreach (ResponsiveLayoutInfo layout in Layouts)
        {
            Append(css, "area-grid-columns", layout.Identifier, layout.Columns);
        }

        return css.ToString();
    }

    /// <summary>CSS variables for one area: column span, row span and order in each layout.</summary>
    public string AreaStyle(string? areaAlias)
    {
        if (areaAlias is null || !Areas.TryGetValue(areaAlias, out IReadOnlyList<ResponsiveAreaValues>? values))
        {
            return string.Empty;
        }

        var css = new StringBuilder();
        foreach (ResponsiveAreaValues v in values)
        {
            Append(css, "area-column-span", v.Identifier, v.ColumnSpan);
            Append(css, "area-row-span", v.Identifier, v.RowSpan);
            Append(css, "area-order", v.Identifier, v.Order);
        }

        return css.ToString();
    }

    // Names follow core's own variables, with the layout identifier on the end (Decision 004).
    private static void Append(StringBuilder css, string name, string identifier, int value) =>
        css.Append("--umb-block-grid--").Append(name).Append("--").Append(identifier)
            .Append(": ").Append(value.ToString(CultureInfo.InvariantCulture)).Append("; ");
}
