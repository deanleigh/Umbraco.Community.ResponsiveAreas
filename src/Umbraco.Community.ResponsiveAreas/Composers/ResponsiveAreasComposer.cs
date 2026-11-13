using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Community.ResponsiveAreas.Rendering;

namespace Umbraco.Community.ResponsiveAreas.Composers;

/// <summary>Registers the rendering service, and clears its cache whenever a data type changes.</summary>
public sealed class ResponsiveAreasComposer : IComposer
{
    public void Compose(IUmbracoBuilder builder)
    {
        builder.Services.AddSingleton<IResponsiveAreasService, ResponsiveAreasService>();
        builder.AddNotificationHandler<DataTypeSavedNotification, ClearResponsiveAreasCache>();
        builder.AddNotificationHandler<DataTypeDeletedNotification, ClearResponsiveAreasCache>();
    }
}

internal sealed class ClearResponsiveAreasCache :
    INotificationHandler<DataTypeSavedNotification>,
    INotificationHandler<DataTypeDeletedNotification>
{
    private readonly IResponsiveAreasService _service;

    public ClearResponsiveAreasCache(IResponsiveAreasService service) => _service = service;

    public void Handle(DataTypeSavedNotification notification) => _service.ClearCache();

    public void Handle(DataTypeDeletedNotification notification) => _service.ClearCache();
}
